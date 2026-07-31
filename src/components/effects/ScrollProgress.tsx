import { useEffect, useRef } from 'react';
import styles from './ScrollProgress.module.css';

// One segment per section of the journey — the page reads as a level meter.
const SEGMENTS = 7;

export function ScrollProgress() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const fills = Array.from(node.querySelectorAll<HTMLElement>(`.${styles.fill}`));
    const spark = node.querySelector<HTMLElement>(`.${styles.spark}`);
    let frame = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      // documentElement, not body: body's height can be clipped by pinned
      // sections, which made max <= 0 and froze the meter at zero.
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      // Each segment fills across its own 1/SEGMENTS slice of the page —
      // transform-only (scaleX), never width, so no layout per scroll frame.
      fills.forEach((el, i) => {
        const local = Math.min(1, Math.max(0, ratio * SEGMENTS - i));
        el.style.transform = `scaleX(${local.toFixed(4)})`;
      });
      if (spark) {
        spark.style.transform = `translateX(${(ratio * window.innerWidth).toFixed(1)}px) translateX(-50%)`;
      }
      // Publish page progress (0→1) globally so other elements can react to it.
      document.documentElement.style.setProperty('--scroll', ratio.toFixed(4));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        frame = requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={root} className={styles.meter} aria-hidden="true">
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span key={i} className={styles.seg}>
          <span className={styles.fill} />
        </span>
      ))}
      <span className={styles.spark} />
    </div>
  );
}
