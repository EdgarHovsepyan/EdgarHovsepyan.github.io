import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion.ts';

/**
 * Turns a duplicated-content track (two identical groups side by side) into a
 * marquee that auto-drifts, can be grabbed and dragged like a carousel, and
 * carries momentum on release. Wrapping is seamless because the offset is taken
 * modulo one group's width, and the content repeats.
 *
 * Attach the returned ref to the flex track that holds the two groups.
 * `seconds` is how long one full group takes to drift past at rest (matches the
 * old CSS `animation: marquee 36s`).
 */
export function useDraggableMarquee<T extends HTMLElement>(seconds = 36): RefObject<T | null> {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const groupWidth = () => el.scrollWidth / 2 || 1; // two identical groups
    let pos = 0; // px; negative = drifted left
    let vel = 0; // px/frame, for release momentum
    let dragging = false;
    let lastX = 0;
    let raf = 0;
    let running = false;
    let prev = 0;

    const apply = () => {
      const w = groupWidth();
      let m = pos % w;
      if (m > 0) m -= w; // keep within (-w, 0]
      el.style.transform = `translate3d(${m.toFixed(2)}px, 0, 0)`;
    };

    const tick = (now: number) => {
      const dt = prev ? Math.min((now - prev) / 1000, 0.05) : 1 / 60;
      prev = now;

      if (dragging) {
        // position is updated in pointermove
      } else if (Math.abs(vel) > 0.05) {
        pos += vel; // fling momentum
        vel *= 0.94;
      } else if (!reduced) {
        pos -= (groupWidth() / seconds) * dt; // gentle auto-drift, leftward
      } else {
        // reduced motion, at rest → stop the loop until the next interaction
        vel = 0;
        apply();
        running = false;
        prev = 0;
        return;
      }

      apply();
      raf = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      prev = 0;
      raf = requestAnimationFrame(tick);
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      vel = 0;
      lastX = e.clientX;
      el.style.cursor = 'grabbing';
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* not all pointer types support capture */
      }
      startLoop();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      pos += dx;
      vel = dx; // last delta becomes the fling velocity
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = '';
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    // Auto-drift for everyone except reduced-motion (they get a static strip
    // that still responds to dragging).
    if (!reduced) startLoop();
    else apply();

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [reduced, seconds]);

  return ref;
}
