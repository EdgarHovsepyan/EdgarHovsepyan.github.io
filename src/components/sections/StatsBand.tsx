import { Reveal } from '../ui/Reveal.tsx';
import { Counter } from '../ui/Counter.tsx';
import { heroStats } from '../../data/stats.ts';
import { cx } from '../../utils/cx.ts';
import styles from './StatsBand.module.css';

export function StatsBand() {
  return (
    <section className={styles.band}>
      <div className={styles.grid}>
        {heroStats.map((stat, index) => (
          <Reveal key={stat.label} delay={Math.min(index * 70, 280)}>
            <div className={cx(styles.value, stat.tone === 'gold' && styles.gold)}>
              <Counter value={stat.value} />
              {stat.suffix ? <span className={styles.suffix}>{stat.suffix}</span> : null}
            </div>
            <div className={styles.label}>{stat.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
