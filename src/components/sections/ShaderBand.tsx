import { ShaderLines } from '@/components/ui/shader-lines';
import { useParallax } from '../../hooks/useParallax.ts';
import { profile } from '../../data/profile.ts';
import styles from './ShaderBand.module.css';

export function ShaderBand() {
  const layer = useParallax<HTMLDivElement>(0.16);

  return (
    <section className={styles.band}>
      <div ref={layer} className={styles.layer}>
        <ShaderLines className={styles.shader} />
      </div>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <span className={styles.mark} aria-hidden="true">
          {profile.initials}
        </span>
        <span className={styles.caption}>{profile.title}</span>
      </div>
    </section>
  );
}
