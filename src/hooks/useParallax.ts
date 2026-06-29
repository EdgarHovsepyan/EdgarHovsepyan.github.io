import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion.ts';

export function useParallax<T extends HTMLElement>(strength = 0.12): RefObject<T | null> {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;

    let frame = 0;
    let ticking = false;

    const apply = () => {
      ticking = false;
      const rect = node.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -strength;
      node.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        frame = requestAnimationFrame(apply);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    apply();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced, strength]);

  return ref;
}
