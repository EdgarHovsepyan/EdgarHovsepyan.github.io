import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion.ts';

/**
 * Nudges an element horizontally in response to scroll velocity, then eases it
 * back to rest — a "scroll-scrub" that makes a marquee feel physical on top of
 * its constant CSS drift. The rAF loop only runs while there is motion to
 * settle, and it is fully disabled under reduced-motion.
 */
export function useScrollScrub<T extends HTMLElement>(
  factor = 0.28,
  max = 64,
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;

    let lastY = window.scrollY;
    let target = 0;
    let current = 0;
    let frame = 0;
    let running = false;

    const tick = () => {
      target *= 0.86; // bleed the impulse away when the user stops scrolling
      current += (target - current) * 0.12; // critically-damped ease toward target
      node.style.transform = `translate3d(${current.toFixed(2)}px, 0, 0)`;
      if (Math.abs(target) < 0.08 && Math.abs(current) < 0.08) {
        node.style.transform = 'translate3d(0, 0, 0)';
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      target = Math.max(-max, Math.min(max, target + delta * factor));
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduced, factor, max]);

  return ref;
}
