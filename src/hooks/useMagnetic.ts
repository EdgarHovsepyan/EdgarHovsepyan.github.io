import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion.ts';

export function useMagnetic<T extends HTMLElement>(
  strengthX = 0.3,
  strengthY = 0.4,
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;

    const onMove = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      node.style.transform = `translate(${x * strengthX}px, ${y * strengthY}px)`;
    };
    const onLeave = () => {
      node.style.transform = 'translate(0, 0)';
    };

    node.addEventListener('mousemove', onMove);
    node.addEventListener('mouseleave', onLeave);
    return () => {
      node.removeEventListener('mousemove', onMove);
      node.removeEventListener('mouseleave', onLeave);
    };
  }, [reduced, strengthX, strengthY]);

  return ref;
}
