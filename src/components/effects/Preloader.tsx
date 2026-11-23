import { useEffect, useRef, useState } from 'react';
import { profile } from '../../data/profile.ts';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { cx } from '../../utils/cx.ts';
import styles from './Preloader.module.css';

// Typographic curtain: the wordmark is dealt in letter by letter while a large
// counter runs, then the whole sheet lifts off the hero instead of fading.
export function Preloader() {
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const letters = [...profile.wordmarkAlt];

  useEffect(() => {
    const paint = (value: number) => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${value})`;
      if (countRef.current) countRef.current.textContent = String(Math.round(value * 100)).padStart(3, '0');
    };
    if (reduced) {
      paint(1);
      const timer = setTimeout(() => setDone(true), 200);
      return () => clearTimeout(timer);
    }

    let frame = 0;
    const start = performance.now();
    const duration = 1150;
    const run = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      paint(1 - Math.pow(1 - progress, 3));
      if (progress < 1) frame = requestAnimationFrame(run);
      else frame = requestAnimationFrame(() => setDone(true));
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setHidden(true), 1000);
    return () => clearTimeout(timer);
  }, [done]);

  if (hidden) return null;

  return (
    <div className={cx(styles.loader, done && styles.gone)} aria-hidden="true">
      <div ref={barRef} className={styles.bar} />
      <div className={styles.top}>
        <span>{profile.fullName}</span>
        <span>Portfolio · 2026</span>
      </div>
      <div className={styles.mark}>
        {letters.map((letter, index) => (
          <span key={index} className={styles.slot}>
            <span className={styles.letter} style={{ animationDelay: `${60 + index * 80}ms` }}>
              {letter}
            </span>
          </span>
        ))}
      </div>
      <div className={styles.bottom}>
        <span>Shuffling the deck</span>
        <span ref={countRef} className={styles.count}>
          000
        </span>
      </div>
    </div>
  );
}
