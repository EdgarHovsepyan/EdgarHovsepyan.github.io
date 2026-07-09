import { marqueeTokens } from '../../data/marquee.ts';
import { useScrollScrub } from '../../hooks/useScrollScrub.ts';
import { cx } from '../../utils/cx.ts';
import styles from './Marquee.module.css';

function Group() {
  return (
    <span className={styles.group}>
      {marqueeTokens.map((token, index) =>
        token.kind === 'star' ? (
          <span key={`star-${index}`} className={styles.star}>
            ✦
          </span>
        ) : (
          <span key={`word-${index}`} className={cx(styles.word, token.accent && styles.accent)}>
            {token.text}
          </span>
        ),
      )}
    </span>
  );
}

export function Marquee() {
  const scrub = useScrollScrub<HTMLDivElement>();

  return (
    <section className={styles.marquee} aria-hidden="true">
      <div ref={scrub} className={styles.scroller}>
        <div className={styles.track}>
          <Group />
          <Group />
        </div>
      </div>
    </section>
  );
}
