import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion.ts';

type ProgressMode = 'through' | 'exit';

interface ScrollProgressOptions {
  /** CSS custom property the 0→1 progress is written into (inherited by children). */
  property?: string;
  /**
   * `exit`    — 0 while the element fills the viewport, 1 after it has scrolled
   *             one element-height past the top. Ideal for hero scroll-away depth.
   * `through` — 0 as the element enters from the bottom, 1 as it leaves past the top.
   */
  mode?: ProgressMode;
}

/**
 * Writes an eased 0→1 scroll progress into a CSS custom property on the node, so
 * the visual work stays on the compositor (CSS drives transform/opacity from the
 * variable). rAF-throttled and disabled under reduced-motion.
 */
export function useScrollProgress<T extends HTMLElement>(
  options: ScrollProgressOptions = {},
): RefObject<T | null> {
  const { property = '--sp', mode = 'through' } = options;
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced) {
      node.style.setProperty(property, mode === 'exit' ? '0' : '1');
      return;
    }

    let frame = 0;
    let ticking = false;
    const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

    const apply = () => {
      ticking = false;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress =
        mode === 'exit'
          ? clamp01(-rect.top / Math.max(rect.height, 1))
          : clamp01((vh - rect.top) / (vh + rect.height));
      node.style.setProperty(property, progress.toFixed(4));
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
  }, [reduced, property, mode]);

  return ref;
}
