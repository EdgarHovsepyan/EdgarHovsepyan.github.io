import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion.ts';

const GLYPHS = '!<>-_\\/[]{}=+*^?#·';

export function useScramble<T extends HTMLElement>(text: string): RefObject<T | null> {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.textContent = text;
    if (reduced) return;

    let frame = 0;
    let started = false;

    const scramble = () => {
      const duration = 760;
      const start = performance.now();
      const run = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const revealed = Math.floor(progress * text.length);
        let output = '';
        for (let i = 0; i < text.length; i++) {
          const char = text[i] ?? '';
          if (i < revealed || char === ' ') output += char;
          else output += GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? '';
        }
        node.textContent = output;
        if (progress < 1) frame = requestAnimationFrame(run);
        else node.textContent = text;
      };
      frame = requestAnimationFrame(run);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          started = true;
          scramble();
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [text, reduced]);

  return ref;
}
