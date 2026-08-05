import styles from './SurrealLayer.module.css';

/**
 * SurrealLayer — dream-logic objects floating over the whole site.
 *
 * Three impossible objects drift free of gravity above every page: a glowing
 * dream orb, a thin levitating ring, and an inverted monolith. Each moves on
 * its own slow keyframe orbit (transform/opacity only) and sinks at its own
 * parallax rate against the page via the global --scroll variable, so the
 * whole portfolio reads as one continuous surreal space.
 *
 * The SVG filter here also feeds the hero wordmark's "soft melt" (Dalí
 * breathing) — an animated turbulence displacement referenced by id.
 */
export function SurrealLayer() {
  return (
    <div className={styles.layer} aria-hidden="true">
      <svg className={styles.defs} width="0" height="0" focusable="false">
        <filter id="dream-melt" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="1" result="n">
            <animate
              attributeName="baseFrequency"
              dur="14s"
              values="0.012 0.028;0.016 0.02;0.012 0.028"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
        </filter>
      </svg>
      <span className={`${styles.obj} ${styles.orb}`} />
      <span className={`${styles.obj} ${styles.ring}`} />
      <span className={`${styles.obj} ${styles.monolith}`} />
    </div>
  );
}
