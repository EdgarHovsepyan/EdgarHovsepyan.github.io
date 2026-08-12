import { useEffect, useRef, useState } from 'react';
import styles from './SkillCycler.module.css';

/**
 * SkillCycler — one minimalist line, four top skills, one perfect transition.
 *
 * "A programmer with deep graphic-design experience —" followed by a masked
 * word that rolls upward on a 2.4s cadence: the leaving word slides out of
 * the mask as the next slides in on an ease-out expo curve (transform +
 * opacity only, ~560ms). Paused in hidden tabs; reduced-motion visitors get
 * the full list as static text.
 */
const SKILLS = ['PixiJS', 'Three.js', 'WebGL · WebGPU', 'TypeScript'];
const PERIOD = 2400;

export function SkillCycler() {
  const [index, setIndex] = useState(0);
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const timer = useRef(0);

  useEffect(() => {
    if (reduced) return;
    timer.current = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % SKILLS.length);
    }, PERIOD);
    return () => clearInterval(timer.current);
  }, [reduced]);

  if (reduced) {
    return (
      <p className={styles.row}>
        A programmer with deep graphic-design experience — {SKILLS.join(' · ')}
      </p>
    );
  }

  return (
    <p className={styles.row}>
      A programmer with deep graphic-design experience —{' '}
      <span className={styles.mask} aria-live="off">
        {SKILLS.map((skill, i) => (
          <span
            key={skill}
            className={`${styles.word} ${
              i === index
                ? styles.in
                : i === (index + SKILLS.length - 1) % SKILLS.length
                  ? styles.out
                  : ''
            }`}
          >
            {skill}
          </span>
        ))}
        {/* widest word reserves the mask's box so the line never reflows */}
        <span className={styles.ghost} aria-hidden="true">
          WebGL · WebGPU
        </span>
      </span>
    </p>
  );
}
