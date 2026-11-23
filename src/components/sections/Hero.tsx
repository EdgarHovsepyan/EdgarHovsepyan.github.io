import { useEffect, useRef } from 'react';
import { profile } from '../../data/profile.ts';
import { useMagnetic } from '../../hooks/useMagnetic.ts';
import { useScramble } from '../../hooks/useScramble.ts';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { useScrollProgress } from '../../hooks/useScrollProgress.ts';
import { SkillCycler } from '../ui/SkillCycler.tsx';
import styles from './Hero.module.css';

export function Hero() {
  const primary = useMagnetic<HTMLAnchorElement>();
  const eyebrow = useScramble<HTMLDivElement>(profile.fullName);
  const hero = useScrollProgress<HTMLElement>({ mode: 'exit' });
  const particles = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Desktop + mouse + motion allowed: swap the photo for its particle twin once
  // the page is idle. The <img> stays as the LCP element and as the fallback
  // everywhere else (touch, reduced motion, no WebGL).
  useEffect(() => {
    const node = particles.current;
    const heroEl = hero.current;
    if (!node || !heroEl || reduced) return;
    if (!window.matchMedia('(min-width: 981px) and (pointer: fine)').matches) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    const start = () => {
      void import('../../three/createPortraitParticles.ts').then(({ createPortraitParticles }) => {
        if (cancelled) return;
        const cloud = createPortraitParticles(node, {
          src: profile.portrait,
          focus: [0.48, 0.26],
          onReady: () => heroEl.classList.add(styles.particlesLive!),
        });
        dispose = cloud?.dispose;
      });
    };
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 2000 })
      : window.setTimeout(start, 900);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      dispose?.();
      heroEl.classList.remove(styles.particlesLive!);
    };
  }, [hero, reduced]);

  return (
    <header id="top" ref={hero} className={styles.hero}>
      <img className={styles.portrait} src={profile.portrait} alt={profile.fullName} />
      <div ref={particles} className={styles.particles} aria-hidden="true" />
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
            <img
              className={styles.wordmarkImg}
              src={profile.wordmark}
              alt={profile.wordmarkAlt}
              width={681}
              height={586}
              fetchPriority="high"
              decoding="async"
            />
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
              Senior <span className={styles.strong}>Game Platform Engineer</span> · iGaming —
              C#/.NET · TypeScript · Kubernetes · GitOps · PixiJS / Three.js ·{' '}
              <span className={styles.ai}>AI-assisted pipelines</span>
            </p>
          </div>
        </div>

        <div className={styles.line}>
          <div className={styles.lineIn}>
            <SkillCycler />
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
