import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * One pointer listener for a whole grid: every card (matched by `selector`)
 * gets the cursor position in its own coordinates as --mx / --my, so a single
 * pool of light appears to travel under the cards and catch each border as it
 * passes. Mouse only; rAF-throttled.
 */
export function useSpotlight<T extends HTMLElement>(selector: string): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid || !window.matchMedia('(pointer: fine)').matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      for (const card of grid.querySelectorAll<HTMLElement>(selector)) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${(x - rect.left).toFixed(0)}px`);
        card.style.setProperty('--my', `${(y - rect.top).toFixed(0)}px`);
      }
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      x = event.clientX;
      y = event.clientY;
      grid.dataset.lit = 'true';
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      delete grid.dataset.lit;
    };

    grid.addEventListener('pointermove', onMove, { passive: true });
    grid.addEventListener('pointerleave', onLeave);
    return () => {
      grid.removeEventListener('pointermove', onMove);
      grid.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, [selector]);

  return ref;
}
