import styles from './SurrealLayer.module.css';

/**
 * Holds the SVG filter behind the hero wordmark's "soft melt" — an animated
 * turbulence displacement referenced by id. The floating CSS bubble / halo /
 * monolith that used to live here were replaced by the 3D corridor (GateScene).
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
    </div>
  );
}
