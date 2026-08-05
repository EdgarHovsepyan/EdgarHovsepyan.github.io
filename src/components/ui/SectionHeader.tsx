import { useParallax } from '../../hooks/useParallax.ts';
import { useScramble } from '../../hooks/useScramble.ts';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  index: string;
  label: string;
  title?: string;
}

export function SectionHeader({ index, label, title }: SectionHeaderProps) {
  const kickerText = `( ${index} ) — ${label}`;
  const kickerRef = useScramble<HTMLDivElement>(kickerText);
  // Every section title drifts a touch slower than the page (and the kicker a
  // touch slower still) — one shared depth system across the whole site.
  const headingRef = useParallax<HTMLHeadingElement>(0.07);

  return (
    <>
      <div ref={kickerRef} className={styles.kicker}>
        {kickerText}
      </div>
      {title ? (
        <h2 ref={headingRef} className={styles.heading} data-text={title}>
          {title}
        </h2>
      ) : null}
    </>
  );
}
