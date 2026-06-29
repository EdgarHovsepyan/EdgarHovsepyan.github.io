import { TurbulentFlow } from '@/components/ui/turbulent-flow';
import styles from './Background.module.css';

export function Background() {
  return (
    <div className={styles.bg} aria-hidden="true">
      <TurbulentFlow className={styles.shader} maxDpr={1.25} />
      <div className={styles.veil} />
    </div>
  );
}
