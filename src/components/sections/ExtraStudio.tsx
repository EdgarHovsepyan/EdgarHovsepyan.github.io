import { Reveal } from '../ui/Reveal.tsx';
import styles from './ExtraStudio.module.css';

export function ExtraStudio() {
  return (
    <section id="extra-studio" className={styles.section}>
      <div className={styles.media}>
        <img
          className={styles.board}
          src="/assets/extra-studio.webp"
          alt="Extra Studio games — 40+ shipped casino titles including slots, roulette, baccarat, poker and blackjack"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className={styles.shine} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.content}>
        <Reveal className={styles.kicker}>Extra Studio · 2019 — 2023</Reveal>
        <Reveal>
          <h2 className={styles.title}>The Extra Studio floor</h2>
        </Reveal>
        <Reveal className={styles.caption}>
          <strong>40+ titles shipped.</strong> Mini games, mini table games and playable ads, the
          studio’s biggest output — owned concept to art integration, desktop and mobile.
        </Reveal>
      </div>
    </section>
  );
}
