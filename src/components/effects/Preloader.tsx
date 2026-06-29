import { useEffect, useRef, useState } from 'react';
import { profile } from '../../data/profile.ts';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { cx } from '../../utils/cx.ts';
import styles from './Preloader.module.css';

export function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setCount(100);
      if (barRef.current) barRef.current.style.width = '100%';
      const timer = setTimeout(() => setDone(true), 200);
      return () => clearTimeout(timer);
    }

    let frame = 0;
    const start = performance.now();
    const duration = 1400;
    const run = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      setCount(Math.round(eased * 100));
      if (barRef.current) barRef.current.style.width = `${eased * 100}%`;
      if (progress < 1) frame = requestAnimationFrame(run);
      else frame = requestAnimationFrame(() => setDone(true));
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setHidden(true), 900);
    return () => clearTimeout(timer);
  }, [done]);

  if (hidden) return null;

  return (
    <div className={cx(styles.loader, done && styles.gone)} aria-hidden="true">
      <div className={styles.mark}>{profile.initials}</div>
      <div className={styles.track}>
        <div ref={barRef} className={styles.bar} />
      </div>
      <div className={styles.meta}>
        <span>Loading portfolio</span>
        <span>{String(count).padStart(2, '0')}</span>
      </div>
    </div>
  );
}
