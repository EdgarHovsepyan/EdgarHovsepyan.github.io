import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '../../hooks/useInView.ts';
import { cx } from '../../utils/cx.ts';
import styles from './Reveal.module.css';

type RevealFrom = 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Direction/character of the entrance. Defaults to `up` (a lift + fade). */
  from?: RevealFrom;
}

export function Reveal({ children, className, delay, from = 'up' }: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const style: CSSProperties | undefined =
    delay !== undefined ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <div
      ref={ref}
      className={cx(styles.reveal, styles[from], inView && styles.visible, className)}
      style={style}
    >
      {children}
    </div>
  );
}
