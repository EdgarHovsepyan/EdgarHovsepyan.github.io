import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import styles from './CursorSpotlight.module.css';

export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || window.matchMedia('(pointer: coarse)').matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let visible = false;
    let frame = 0;

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        visible = true;
        node.style.opacity = '1';
      }
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      node.style.transform = `translate(${currentX}px, ${currentY}px)`;
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    loop();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
    };
  }, [reduced]);

  return <div ref={ref} className={styles.spot} aria-hidden="true" />;
}
