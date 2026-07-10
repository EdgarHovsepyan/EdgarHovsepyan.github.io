import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ExtraStudio.module.css';

gsap.registerPlugin(ScrollTrigger);

// Cinematic concept reels (1280×720, ~1 MB each) used as an ambient background.
const REELS = [
  '/assets/videos/v1.mp4',
  '/assets/videos/v2.mp4',
  '/assets/videos/v3.mp4',
  '/assets/videos/v4.mp4',
];

export function ExtraStudio() {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  // Only decode/play the reels while the section is near the viewport, and skip
  // any cell hidden by the mobile layout (keeps it light on phones).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const vids = Array.from(el.querySelectorAll('video'));
    const io = new IntersectionObserver(
      (entries) => {
        const inView = entries[0]?.isIntersecting ?? false;
        vids.forEach((v) => {
          const visible = v.offsetParent !== null; // false when display:none (mobile)
          if (inView && visible) void v.play().catch(() => {});
          else v.pause();
        });
      },
      { rootMargin: '250px 0px', threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scroll magic: the reel grid pulls into focus (blur → sharp) and drifts for
  // depth; each line of copy parallaxes at its own rate (layered, transform-only,
  // ease: 'none' because it's scroll-position-mapped). All of it is gated behind
  // prefers-reduced-motion and left sharp/visible by default.
  useEffect(() => {
    const rootEl = root.current;
    const gridEl = grid.current;
    const contentEl = content.current;
    if (!rootEl || !gridEl || !contentEl) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const trig = () => ({
        trigger: rootEl,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
      });

      // Desktop/tablet: full effect incl. the (heavier) blur focus + a slow drift.
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 701px)', () => {
        gsap
          .timeline({ scrollTrigger: trig() })
          .fromTo(
            gridEl,
            { filter: 'blur(26px)', scale: 1.3 },
            { filter: 'blur(0px)', scale: 1, ease: 'power2.out', duration: 1 },
          )
          .to(gridEl, { duration: 0.7 }) // hold, in focus
          .to(gridEl, { filter: 'blur(13px)', scale: 1.1, ease: 'power2.in', duration: 1 });
        gsap.fromTo(gridEl, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: trig() });
      });

      // Mobile: scale + drift only, no per-frame blur (perf).
      mm.add('(prefers-reduced-motion: no-preference) and (max-width: 700px)', () => {
        gsap
          .timeline({ scrollTrigger: trig() })
          .fromTo(gridEl, { scale: 1.22 }, { scale: 1, ease: 'power2.out', duration: 1 })
          .to(gridEl, { duration: 0.8 })
          .to(gridEl, { scale: 1.08, ease: 'power2.in', duration: 1 });
        gsap.fromTo(gridEl, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: trig() });
      });

      // Layered copy parallax — each element drifts by amplitude × its own speed.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>(contentEl.querySelectorAll('[data-parallax]'));
        items.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax ?? '0.4') || 0.4;
          gsap.fromTo(
            el,
            { y: 46 * speed },
            { y: -42 * speed, ease: 'none', scrollTrigger: trig() },
          );
        });
      });
    }, rootEl);

    return () => ctx.revert();
  }, []);

  return (
    <section id="extra-studio" ref={root} className={styles.section}>
      <div className={styles.stage}>
        <div ref={grid} className={styles.grid} aria-hidden="true">
          {REELS.map((src) => (
            <div key={src} className={styles.cell}>
              <video className={styles.video} src={src} muted loop playsInline preload="metadata" />
            </div>
          ))}
        </div>

        <div className={styles.shine} aria-hidden="true" />
        <div className={styles.scrim} aria-hidden="true" />

        <div ref={content} className={styles.content}>
          <div className={styles.kicker} data-parallax="0.3">
            Extra Studio · 2019 — 2023
          </div>
          <h2 className={styles.title} data-parallax="0.15">
            The Extra Studio floor
          </h2>
          <p className={styles.caption} data-parallax="0.55">
            <strong>40+ titles shipped</strong>, the studio&rsquo;s highest-volume line.
          </p>
          <p className={styles.body} data-parallax="0.8">
            Slots, mini table games, roulette, baccarat, poker, blackjack and playable ads, across
            desktop and mobile. I owned each one from blank concept to final art integration, tuning
            the weight and the win moment until it read as premium at a glance.
          </p>
          <div className={styles.tags} data-parallax="1.05">
            <span>Slots</span>
            <span>Table games</span>
            <span>Playable ads</span>
            <span>Concept &rarr; art</span>
          </div>
        </div>
      </div>
    </section>
  );
}
