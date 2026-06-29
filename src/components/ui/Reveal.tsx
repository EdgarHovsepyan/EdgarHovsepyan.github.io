import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '../../hooks/useInView.ts';
import { cx } from '../../utils/cx.ts';
import styles from './Reveal.module.css';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay }: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const style: CSSProperties | undefined =
    delay !== undefined ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <div ref={ref} className={cx(styles.reveal, inView && styles.visible, className)} style={style}>
      {children}
    </div>
  );
}
