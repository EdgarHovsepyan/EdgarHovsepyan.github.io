import { useEffect, useRef } from 'react';
import styles from './ExtraStudio.module.css';

// Cinematic concept reels (1280×720, ~1 MB each) used as a moving wall.
const REELS = [
  '/assets/videos/v1.mp4',
  '/assets/videos/v2.mp4',
  '/assets/videos/v3.mp4',
  '/assets/videos/v4.mp4',
];

/**
 * The screening room. A wall of reels sits behind an iris that opens as the
 * section arrives (the corridor's gate, turned into a lens), the columns slide
 * against each other, and the title is set across the whole wall. All of the
 * motion is native scroll-driven CSS; without support the wall is simply open.
 */
export function ExtraStudio() {
  const root = useRef<HTMLElement>(null);

  // Reels use preload="none", so the four ~1 MB videos download nothing until
  // the section is near the viewport, and pause again when it leaves.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reels = Array.from(el.querySelectorAll('video'));
    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries[0]?.isIntersecting ?? false;
        reels.forEach((reel) => {
          const visible = reel.offsetParent !== null;
          if (inView && visible) void reel.play().catch(() => {});
          else reel.pause();
        });
      },
      { rootMargin: '250px 0px', threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="extra-studio" ref={root} className={styles.section}>
      <div className={styles.iris} aria-hidden="true">
        <div className={styles.wall}>
          {REELS.map((src) => (
            <div key={src} className={styles.column}>
              <video className={styles.video} src={src} muted loop playsInline preload="none" />
            </div>
          ))}
        </div>
        <div className={styles.scrim} />
      </div>

      <div className={styles.content}>
        <div className={styles.kicker}>What I do · Where I&rsquo;m going</div>
        <h2 className={styles.title}>
          <span className={styles.line}>I build</span>
          <span className={`${styles.line} ${styles.hollow}`}>the rush</span>
        </h2>
        <div className={styles.foot}>
          <div>
            <p className={styles.caption}>
              I engineer how casino games <strong>feel</strong>.
            </p>
            <p className={styles.body}>
              The weight of a spin, the snap of a reel stop, the near-miss that pulls a thumb back
              for one more. Fifty-plus titles in seven years, every win ceremony landed at
              120&nbsp;fps. Next: bigger titles, the SBC shortlist turned into a trophy, and my own
              studio running Claude Code and MCP pipelines start to finish.
            </p>
          </div>
          <div className={styles.tags}>
            <span>Game feel</span>
            <span>120fps ceremonies</span>
            <span>SBC GotY shortlist</span>
            <span>Claude Code + MCP</span>
          </div>
        </div>
      </div>
    </section>
  );
}
