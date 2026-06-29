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

  return (
    <>
      <div ref={kickerRef} className={styles.kicker}>
        {kickerText}
      </div>
      {title ? <h2 className={styles.heading}>{title}</h2> : null}
    </>
  );
}
