import { profile } from '../../data/profile.ts';
import { useMagnetic } from '../../hooks/useMagnetic.ts';
import { useScramble } from '../../hooks/useScramble.ts';
import styles from './Hero.module.css';

export function Hero() {
  const primary = useMagnetic<HTMLAnchorElement>();
  const eyebrow = useScramble<HTMLDivElement>(profile.fullName);

  return (
    <header id="top" className={styles.hero}>
      <img className={styles.portrait} src={profile.portrait} alt={profile.fullName} />
      <div className={styles.portraitFade} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.line}>
          <div className={styles.lineIn}>
            <div className={styles.badges}>
              <span className={styles.badge}>{profile.badge}</span>
              <span className={styles.location}>{profile.location}</span>
            </div>
          </div>
        </div>

        <div className={styles.line}>
          <div className={styles.lineIn}>
            <div ref={eyebrow} className={styles.eyebrow}>
              {profile.fullName}
            </div>
          </div>
        </div>

        <div className={styles.line}>
          <div className={styles.lineIn}>
            <img className={styles.wordmarkImg} src={profile.wordmark} alt={profile.wordmarkAlt} />
          </div>
        </div>

        <div className={styles.line}>
          <div className={styles.lineIn}>
            <h1 className={styles.surname}>{profile.lastName}</h1>
          </div>
        </div>

        <div className={styles.line}>
          <div className={styles.lineIn}>
            <p className={styles.role}>
              Senior <span className={styles.strong}>HTML5 Game Developer</span> — iGaming · PixiJS ·
              WebGL/WebGPU · <span className={styles.ai}>AI Engineering</span>
            </p>
          </div>
        </div>

        <div className={styles.line}>
          <div className={styles.lineIn}>
            <p className={styles.summary}>
              All about the feel — the weight of a spin, the snap of a reel stop, the juice players
              remember. I join at zero and build to ten.
            </p>
          </div>
        </div>

        <div className={styles.line}>
          <div className={styles.lineIn}>
            <div className={styles.actions}>
              <a ref={primary} href="#contact" className={styles.primary}>
                Start a conversation
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </a>
              <a href={profile.cv} download className={styles.secondary}>
                Download CV ↓
              </a>
              <a href="#awards" className={styles.secondary}>
                See the work ↓
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
