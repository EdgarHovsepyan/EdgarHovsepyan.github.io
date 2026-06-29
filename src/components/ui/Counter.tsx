import { useEffect, useState } from 'react';
import { useInView } from '../../hooks/useInView.ts';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';

interface CounterProps {
  value: string;
}

export function Counter({ value }: CounterProps) {
  const numeric = /^\d+$/.test(value);
  const target = numeric ? Number(value) : 0;
  const [ref, inView] = useInView<HTMLSpanElement>();
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(numeric && !reduced ? '0' : value);

  useEffect(() => {
    if (!numeric || reduced || !inView) return;
    let frame = 0;
    const start = performance.now();
    const duration = 1200;
    const run = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(String(Math.round(eased * target)));
      if (progress < 1) frame = requestAnimationFrame(run);
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [inView, numeric, reduced, target]);

  return <span ref={ref}>{display}</span>;
}
