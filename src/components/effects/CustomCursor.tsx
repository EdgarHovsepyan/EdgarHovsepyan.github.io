import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import styles from './CustomCursor.module.css';

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;
    let frame = 0;
    let shown = false;

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

    const loop = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    loop();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
    };
  }, [reduced]);

  return (
    <>
      <div ref={ringRef} className={styles.ring} aria-hidden="true" />
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
    </>
  );
}
