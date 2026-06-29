import { Reveal } from '../ui/Reveal.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import styles from './Profile.module.css';

export function Profile() {
  return (
    <section className={styles.profile}>
      <div className={styles.grid}>
        <Reveal>
          <SectionHeader index="01" label="Profile" />
          <div className={styles.lead}>The mentor &amp; AI evangelist the team comes to.</div>
        </Reveal>
        <Reveal className={styles.body}>
          <p className={styles.para}>
            7+ years, <span className={styles.accent}>50+ HTML5 casino titles</span> shipped
            end-to-end — blank canvas to regulator-ready. I don’t job-hop; I join at zero and build
            to ten, then build the AI pipelines the team runs on.
          </p>
          <p className={styles.paraMuted}>
            Clean TypeScript on one side; Spine, GLSL/WGSL shaders, 2D/3D physics and 120&nbsp;fps
            win-ceremonies on the other.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
