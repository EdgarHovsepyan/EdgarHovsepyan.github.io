import { useEffect, useRef } from 'react';
import styles from './SurrealLayer.module.css';

/**
 * SurrealLayer — dream-logic objects floating over the whole site.
 *
 * Not just decoration: the objects are alive to the visitor.
 * - The dream BUBBLE swells as your cursor approaches and drifts away like a
 *   soap bubble in a draft; corner it and it POPS — then quietly reforms
 *   somewhere else on the page.
 * - The gold HALO is a lazy familiar: it leans toward your cursor on a heavy
 *   leash, never quite leaving its home.
 * - The inverted MONOLITH stays indifferent — surrealism needs one witness.
 *
 * Physics run on a self-stopping rAF spring (transform-only, zero layout
 * writes); the inner spans keep their CSS drift/parallax so ambient motion
 * survives even without a mouse. Touch devices get the ambient layer only.
 *
 * The SVG filter here also feeds the hero wordmark's "soft melt" (Dalí
 * breathing) — an animated turbulence displacement referenced by id.
 */
export function SurrealLayer() {
  const orbWrap = useRef<HTMLSpanElement>(null);
  const ringWrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const orbEl = orbWrap.current;
    const ringEl = ringWrap.current;
    if (!orbEl || !ringEl) return;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    const orbHome = { x: 0.78, y: 0.2 };
    const ringHome = { x: 0.1, y: 0.64 };
    const o = { x: 0, y: 0, vx: 0, vy: 0 };
    const r = { x: 0, y: 0 };
    const cur = { x: -9e3, y: -9e3 };
    let popped = false;
    let popAt = 0;
    let raf = 0;
    let running = false;

    const place = () => {
      orbEl.style.left = `${(orbHome.x * 100).toFixed(2)}%`;
      orbEl.style.top = `${(orbHome.y * 100).toFixed(2)}%`;
    };
    place();

    const tick = () => {
      // --- bubble: proximity swell, draft-repel, pop + respawn -------------
      const cx = orbHome.x * vw + o.x;
      const cy = orbHome.y * vh + o.y;
      const dx = cx - cur.x;
      const dy = cy - cur.y;
      const d = Math.hypot(dx, dy) || 1;
      const near = Math.max(0, 1 - d / 240);
      if (!popped && near > 0) {
        const f = near * 1.7;
        o.vx += (dx / d) * f;
        o.vy += (dy / d) * f;
      }
      if (!popped && d < 54) {
        popped = true;
        popAt = performance.now();
        orbEl.classList.add(styles.popped!);
      }
      if (popped && performance.now() - popAt > 1600) {
        popped = false;
        orbEl.classList.remove(styles.popped!);
        orbHome.x = 0.14 + Math.random() * 0.72;
        orbHome.y = 0.1 + Math.random() * 0.55;
        o.x = 0;
        o.y = 0;
        o.vx = 0;
        o.vy = 0;
        place();
      }
      o.vx -= o.x * 0.012; // spring back toward home
      o.vy -= o.y * 0.012;
      o.vx *= 0.92;
      o.vy *= 0.92;
      o.x += o.vx;
      o.y += o.vy;
      const swell = 1 + near * 0.22;
      orbEl.style.transform = `translate3d(${o.x.toFixed(1)}px, ${o.y.toFixed(1)}px, 0) scale(${swell.toFixed(3)})`;

      // --- halo: leans toward the cursor on a heavy leash ------------------
      const hx = ringHome.x * vw;
      const hy = ringHome.y * vh;
      let tx = cur.x - hx;
      let ty = cur.y - hy;
      const td = Math.hypot(tx, ty) || 1;
      const lim = Math.min(td, 110);
      tx = (tx / td) * lim;
      ty = (ty / td) * lim;
      r.x += (tx - r.x) * 0.028;
      r.y += (ty - r.y) * 0.028;
      ringEl.style.transform = `translate3d(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px, 0)`;

      const active =
        popped ||
        Math.abs(o.vx) + Math.abs(o.vy) > 0.02 ||
        Math.abs(tx - r.x) + Math.abs(ty - r.y) > 0.6;
      if (active) raf = requestAnimationFrame(tick);
      else running = false;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      cur.x = e.clientX;
      cur.y = e.clientY;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    const onResize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={styles.layer} aria-hidden="true">
      <svg className={styles.defs} width="0" height="0" focusable="false">
        <filter id="dream-melt" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="1" result="n">
            <animate
              attributeName="baseFrequency"
              dur="14s"
              values="0.012 0.028;0.016 0.02;0.012 0.028"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
        </filter>
      </svg>
      <span ref={orbWrap} className={`${styles.wrap} ${styles.orbWrap}`}>
        <span className={`${styles.obj} ${styles.orb}`} />
      </span>
      <span ref={ringWrap} className={`${styles.wrap} ${styles.ringWrap}`}>
        <span className={`${styles.obj} ${styles.ring}`} />
      </span>
      <span className={`${styles.obj} ${styles.monolith}`} />
    </div>
  );
}
