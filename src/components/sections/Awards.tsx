import { Reveal } from '../ui/Reveal.tsx';
import { useScramble } from '../../hooks/useScramble.ts';
import styles from './Awards.module.css';

export function Awards() {
  const kicker = useScramble<HTMLDivElement>('Recognition — 2025');

  return (
    <section id="awards" className={styles.section}>
      <div className={styles.glow} aria-hidden="true" />
      <Reveal className={styles.content} from="scale">
        <div ref={kicker} className={styles.kicker}>
          Recognition — 2025
        </div>
        <h2 className={styles.title}>Game of the Year</h2>
        <div className={styles.badge}>✦&nbsp;&nbsp;Shortlisted&nbsp;&nbsp;✦</div>
        <div className={styles.detail}>
          Non-Stop Roulette · Pascal Gaming
          <br />
          <span className={styles.sub}>
            SBC Awards Americas 2025 — Game of the Year shortlist · Certified across Latin America:
            Colombia · Peru · Brazil
          </span>
        </div>
      </Reveal>
    </section>
  );
}
