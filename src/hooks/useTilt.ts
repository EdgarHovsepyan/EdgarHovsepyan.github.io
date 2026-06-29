import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion.ts';

export function useTilt<T extends HTMLElement>(maxDeg = 5): RefObject<T | null> {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      node.style.transform = `perspective(900px) rotateX(${-py * maxDeg}deg) rotateY(${px * maxDeg}deg) translateY(-4px)`;
      node.style.borderColor = 'rgba(77, 124, 255, 0.4)';
    };
    const onLeave = () => {
      node.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
      node.style.borderColor = '';
    };

    node.addEventListener('mousemove', onMove);
    node.addEventListener('mouseleave', onLeave);
    return () => {
      node.removeEventListener('mousemove', onMove);
      node.removeEventListener('mouseleave', onLeave);
    };
  }, [reduced, maxDeg]);

  return ref;
}
