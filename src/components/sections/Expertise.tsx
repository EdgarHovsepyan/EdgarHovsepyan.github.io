import { Reveal } from '../ui/Reveal.tsx';
import { Chip } from '../ui/Chip.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { bento } from '../../data/expertise.ts';
import type { BentoCell } from '../../data/types.ts';
import { useTilt } from '../../hooks/useTilt.ts';
import { cx } from '../../utils/cx.ts';
import styles from './Expertise.module.css';

function BentoCard({ cell }: { cell: BentoCell }) {
  const ref = useTilt<HTMLDivElement>();

  return (
    <div ref={ref} className={cx(styles.cell, cell.accent && styles.accent)}>
      <div className={styles.label}>{cell.label}</div>
      {cell.title ? <h3 className={styles.title}>{cell.title}</h3> : null}
      {cell.body ? <p className={styles.body}>{cell.body}</p> : null}
      <div className={cx(styles.chips, cell.title && styles.chipsBig)}>
        {cell.chips.map((chip) => (
          <Chip key={chip} label={chip} accent={cell.accent} />
        ))}
      </div>
    </div>
  );
}

export function Expertise() {
  return (
    <section id="expertise" className={styles.section}>
      <Reveal className={styles.header}>
        <SectionHeader index="05" label="Core expertise" title="The stack" />
      </Reveal>
      <div className={styles.grid}>
        {bento.map((cell, index) => (
          <Reveal
            key={cell.label}
            className={cx(cell.wide && styles.wide)}
            delay={Math.min(index * 70, 240)}
            from="scale"
          >
            <BentoCard cell={cell} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
