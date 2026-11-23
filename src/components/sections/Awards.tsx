import { useScramble } from '../../hooks/useScramble.ts';
import styles from './Awards.module.css';

/**
 * Recognition, set like a poster. The award name fills the width in two lines
 * that close in from opposite sides as the section arrives, the year stands
 * behind them in outline, and the result lands on top as a rubber stamp.
 */
export function Awards() {
  const kicker = useScramble<HTMLDivElement>('Recognition · 2024 / 2025');

  return (
    <section id="awards" className={styles.section}>
      <div className={styles.year} aria-hidden="true">
        2025
      </div>

      <div className={styles.inner}>
        <div ref={kicker} className={styles.kicker}>
          Recognition · 2024 / 2025
        </div>

        <h2 className={styles.title}>
          <span className={styles.line}>Game of</span>
          <span className={`${styles.line} ${styles.lineB}`}>the Year</span>
        </h2>

        <div className={styles.stamp}>
          <span>Shortlisted</span>
        </div>

        <div className={styles.facts}>
          <div>
            <div className={styles.factLabel}>Title</div>
            <div className={styles.factValue}>Non-Stop Roulette</div>
          </div>
          <div>
            <div className={styles.factLabel}>Studio</div>
            <div className={styles.factValue}>Pascal Gaming · team credit</div>
          </div>
          <div>
            <div className={styles.factLabel}>Award</div>
            <div className={styles.factValue}>SBC Awards Americas 2025</div>
          </div>
          <div>
            <div className={styles.factLabel}>Certified in</div>
            <div className={styles.factValue}>Colombia · Peru · Brazil</div>
          </div>
        </div>

        <div className={styles.second}>
          <span className={styles.tab}>Finalist</span>
          <span className={styles.secondTitle}>B.F.T.H. Arena Awards 2024</span>
          <span className={styles.secondNote}>Industry recognition · iGaming</span>
        </div>
      </div>
    </section>
  );
}
