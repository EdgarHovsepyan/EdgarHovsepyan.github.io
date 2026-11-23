import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import styles from './CustomCursor.module.css';

/**
 * The cursor says what a click will do. Over anything marked `data-cursor`
 * the ring swells into a solid disc carrying that word (Play, Open, Get...);
 * over other links and buttons it simply tightens. Mouse only.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!ring || !dot || !label) return;

    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;
    let frame = 0;
    let shown = false;
    let state = '';

    const setState = (next: string, word = '') => {
      if (next === state && label.textContent === word) return;
      state = next;
      label.textContent = word;
      ring.classList.toggle(styles.word!, next === 'word');
      ring.classList.toggle(styles.tight!, next === 'tight');
      dot.classList.toggle(styles.hide!, next === 'word');
    };

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      dot.style.transform = `translate(${targetX}px, ${targetY}px)`;
      if (!shown) {
        shown = true;
        ring.style.opacity = '1';
        dot.style.opacity = '1';
      }
    };
    const onOver = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const marked = target?.closest<HTMLElement>('[data-cursor]');
      if (marked) setState('word', marked.dataset.cursor);
      else if (target?.closest('a, button, [role="button"], [role="tab"]')) setState('tight');
      else setState('');
    };

    const loop = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    loop();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
    };
  }, [reduced]);

  return (
    <>
      <div ref={ringRef} className={styles.ring} aria-hidden="true">
        <span className={styles.disc}>
          <span ref={labelRef} className={styles.label} />
        </span>
      </div>
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
    </>
  );
}
