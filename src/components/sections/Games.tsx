import { Reveal } from '../ui/Reveal.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { games } from '../../data/games.ts';
import { cx } from '../../utils/cx.ts';
import styles from './Games.module.css';

export function Games() {
  return (
    <section id="games" className={styles.section}>
      <Reveal className={styles.header}>
        <div>
          <SectionHeader index="04" label="Shipped games" title="Play the work" />
        </div>
        <div className={styles.hint}>Live fun-mode demos · Pascal Gaming</div>
      </Reveal>

      <div className={styles.grid}>
        {games.map((game, index) => (
          <Reveal key={game.name} delay={Math.min(index * 60, 280)}>
            <a
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cx(styles.card, game.featured && styles.featured)}
              aria-label={`Play ${game.name} — ${game.type} — fun-mode demo`}
            >
              <div className={styles.top}>
                <span className={styles.type}>{game.type}</span>
                {game.featured ? (
                  <span className={styles.star} aria-hidden="true">
                    ★
                  </span>
                ) : null}
              </div>
              <h3 className={styles.name}>{game.name}</h3>
              <span className={styles.play}>
                Play demo
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </span>
              <div className={styles.glow} aria-hidden="true" />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
