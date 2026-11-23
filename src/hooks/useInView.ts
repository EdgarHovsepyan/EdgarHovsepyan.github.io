import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export function useInView<T extends HTMLElement>(): readonly [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Two thresholds, and a second way in: an element taller than the screen
    // can never show 12% of itself at once, so a quarter-viewport of it counts
    // too. Without this, tall blocks stayed hidden after a jump from the menu.
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        const enough =
          entry.intersectionRatio >= 0.12 ||
          entry.intersectionRect.height >= window.innerHeight * 0.25;
        if (enough) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: [0, 0.05, 0.12, 0.25], rootMargin: '0px 0px -6% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}
