import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion.ts';

/**
 * Like `useParallax`, but writes the offset into a CSS custom property (in px)
 * instead of overwriting `transform`. This lets decorative layers that already
 * rely on a transform for positioning (e.g. `translate(-50%, -50%)` centering)
 * pick up parallax by composing `var(--py)` into their own transform.
 */
export function useParallaxVar<T extends HTMLElement>(
  strength = 0.12,
  property = '--py',
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced) {
      node.style.setProperty(property, '0px');
      return;
    }

    let frame = 0;
    let ticking = false;

    const apply = () => {
      ticking = false;
      const rect = node.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -strength;
      node.style.setProperty(property, `${offset.toFixed(2)}px`);
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
  }, [reduced, strength, property]);

  return ref;
}
