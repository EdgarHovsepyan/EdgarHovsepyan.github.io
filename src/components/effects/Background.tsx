import { TurbulentFlow } from '@/components/ui/turbulent-flow';
import styles from './Background.module.css';

export function Background() {
  return (
    <div className={styles.bg} aria-hidden="true">
      {/* Always-on, GPU-composited aurora drift (transform/opacity only). It is
          the living backdrop on mobile — where the WebGL raymarch is skipped —
          and adds depth beneath the shader on desktop. */}
      <div className={styles.aurora} />
      <TurbulentFlow className={styles.shader} maxDpr={1.25} />
      <div className={styles.veil} />
    </div>
  );
}
