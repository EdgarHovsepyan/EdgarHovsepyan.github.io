import { useState } from 'react';
import { Reveal } from '../ui/Reveal.tsx';
import { Chip } from '../ui/Chip.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { experience } from '../../data/experience.ts';
import type { ExperienceEntry } from '../../data/types.ts';
import { cx } from '../../utils/cx.ts';
import styles from './Timeline.module.css';

interface RowProps {
  entry: ExperienceEntry;
  index: number;
}

function TimelineRow({ entry, index }: RowProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cx(styles.row, open && styles.rowOpen)}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${entry.role}, ${entry.org}, ${entry.period}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setOpen((value) => !value);
        }
      }}
    >
      <div className={styles.left}>
        <div className={styles.period}>{entry.period}</div>
        <div className={styles.index}>{`0${index + 1}`}</div>
      </div>
      <div>
        <h3 className={styles.role}>{entry.role}</h3>
        <div className={styles.org}>{entry.org}</div>
        <p className={styles.desc}>{entry.description}</p>
        <div className={styles.tags}>
          {entry.tags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </div>
        <div className={styles.highlights}>
          <ul className={styles.highlightList}>
            {entry.highlights.map((highlight) => (
              <li key={highlight} className={styles.highlight}>
                <span className={styles.bullet}>✦</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Timeline() {
  return (
    <section id="timeline" className={styles.section}>
      <Reveal className={styles.header}>
        <div>
          <SectionHeader index="02" label="Experience" title="Career arc" />
        </div>
        <div className={styles.hint}>Hover a role to expand the stack &amp; achievements</div>
      </Reveal>
      <div>
        {experience.map((entry, index) => (
          <TimelineRow key={entry.role} entry={entry} index={index} />
        ))}
      </div>
    </section>
  );
}
