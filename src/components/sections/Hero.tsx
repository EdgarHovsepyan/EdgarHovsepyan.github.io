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
  const reel = useRef<HTMLDialogElement>(null);
  const film = useRef<HTMLVideoElement>(null);
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
      <img
        className={styles.portrait}
        src={profile.portrait}
        alt={profile.fullName}
        width={798}
        height={833}
        fetchPriority="high"
      />
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
              Senior <span className={styles.strong}>iGaming Engineer</span> · games, platform and
              tooling. PixiJS / Three.js · TypeScript · C#/.NET · Kubernetes ·{' '}
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
              I build casino games and the services they run on. Seven years and 50+ titles, from
              the reel stop to the random numbers behind it.
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
              <button
                type="button"
                className={styles.secondary}
                data-cursor="Watch"
                onClick={() => {
                  reel.current?.showModal();
                  void film.current?.play().catch(() => {});
                }}
              >
                Watch the reel ▸
              </button>
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
      {/* The 18 second reel, in a native dialog. The video loads only when
          opened and stops when the dialog closes, however it is closed. */}
      <dialog
        ref={reel}
        className={styles.reel}
        aria-label="Showreel"
        onClose={() => film.current?.pause()}
        {...({ closedby: 'any' } as object)}
      >
        <video
          ref={film}
          className={styles.film}
          src="/assets/showreel.mp4"
          poster="/assets/showreel-poster.webp"
          width={1920}
          height={1080}
          controls
          playsInline
          preload="none"
        />
        <form method="dialog" className={styles.reelBar}>
          <span>Showreel · 18 seconds · no sound</span>
          <button className={styles.reelClose}>Close</button>
        </form>
      </dialog>
    </header>
  );
}
