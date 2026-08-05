import { useEffect, useRef } from 'react';
import styles from './DreamEye.module.css';

/**
 * DreamEye — the surrealist all-seeing eye. The iris tracks the visitor's
 * cursor across the page (rAF-throttled, transform-only) and the lid blinks
 * on a slow dream cadence. Decorative: hidden from the accessibility tree.
 */
export function DreamEye() {
  const iris = useRef<SVGGElement>(null);
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = root.current;
    const ir = iris.current;
    if (!el || !ir) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let running = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, len / 240);
      tx = (dx / len) * 7 * reach;
      ty = (dy / len) * 4.5 * reach;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      ir.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.05) raf = requestAnimationFrame(tick);
      else running = false;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      ref={root}
      className={styles.eye}
      viewBox="0 0 120 60"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className={styles.lidPath}
        d="M6 30 Q60 -8 114 30 Q60 68 6 30 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <g ref={iris}>
        <circle cx="60" cy="30" r="13" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle className={styles.pupil} cx="60" cy="30" r="5.5" />
        <circle cx="63" cy="27" r="1.6" fill="rgba(255,255,255,0.85)" />
      </g>
      <g className={styles.lid}>
        <path d="M6 30 Q60 -8 114 30 L114 0 L6 0 Z" />
      </g>
    </svg>
  );
}
