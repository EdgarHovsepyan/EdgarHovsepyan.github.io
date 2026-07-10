import { Reveal } from '../ui/Reveal.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import styles from './Profile.module.css';

export function Profile() {
  return (
    <section className={styles.profile}>
      <div className={styles.grid}>
        <Reveal>
          <SectionHeader index="01" label="Profile" />
          <div className={styles.lead}>
            50+ games shipped, every one profiled on a mid-tier Android before it went live.
          </div>
        </Reveal>
        <Reveal className={styles.body} from="left">
          <p className={styles.para}>
            In seven years I have shipped <span className={styles.accent}>50+ games end to end</span>,
            slots to crash to live 3D roulette, and spent four of those years leading a Unity,
            Unreal, front-end, back-end and QA team building VR and WebXR worlds.
          </p>
          <p className={styles.paraMuted}>
            My favorite problems sit where physics meets server truth: a Plinko ball that must land
            exactly where the backend already decided, a win ceremony that holds 120&nbsp;fps in a
            browser tab. Our team&rsquo;s Non-Stop Roulette made the SBC Awards 2025 Game of the
            Year shortlist. I want the next one to win.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
