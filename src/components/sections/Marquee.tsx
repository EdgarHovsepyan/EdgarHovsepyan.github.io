import { marqueeTokens } from '../../data/marquee.ts';
import { useDraggableMarquee } from '../../hooks/useDraggableMarquee.ts';
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
  const track = useDraggableMarquee<HTMLDivElement>();

  return (
    <section className={styles.marquee} aria-hidden="true">
      <div ref={track} className={styles.track}>
        <Group />
        <Group />
      </div>
    </section>
  );
}
