import { Reveal } from '../ui/Reveal.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { games } from '../../data/games.ts';
import type { Game } from '../../data/games.ts';
import { cx } from '../../utils/cx.ts';
import styles from './Games.module.css';

function CardInner({ game }: { game: Game }) {
  return (
    <>
      {game.thumb ? (
        <img
          className={styles.thumb}
          src={game.thumb}
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden="true"
        />
      ) : (
        <div className={styles.artFallback} aria-hidden="true" />
      )}
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.top}>
          <span className={styles.type}>{game.type}</span>
          {game.featured ? (
            <span className={styles.star} aria-hidden="true">
              ★
            </span>
          ) : null}
        </div>

        {game.award ? <div className={styles.award}>🏆 {game.award}</div> : null}

        <h3 className={styles.name}>{game.name}</h3>
        <p className={styles.craft}>{game.craft}</p>

        {game.url ? (
          <span className={styles.play}>
            Play demo
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </span>
        ) : (
          <span className={styles.caseStudy}>Real-money title · demo on request</span>
        )}
      </div>
    </>
  );
}

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
          <Reveal key={game.name} delay={Math.min(index * 55, 280)} from="scale">
            {game.url ? (
              <a
                href={game.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cx(styles.card, game.featured && styles.featured)}
                aria-label={`Play ${game.name} — ${game.type} — fun-mode demo`}
              >
                <CardInner game={game} />
              </a>
            ) : (
              <div
                className={cx(styles.card, styles.static, game.featured && styles.featured)}
                aria-label={`${game.name} — ${game.type} — real-money title, demo on request`}
              >
                <CardInner game={game} />
              </div>
            )}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
