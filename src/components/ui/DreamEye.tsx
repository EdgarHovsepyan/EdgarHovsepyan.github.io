import { useEffect, useId, useRef } from 'react';
import styles from './DreamEye.module.css';

const ALMOND = 'M10 120 Q120 38 230 120 Q120 202 10 120 Z';

/**
 * DreamEye — the all-seeing eye, watching the visitor. The iris follows the
 * cursor, the pupil widens as the cursor comes close, the lids blink on an
 * irregular cadence and on every click, and a ring of ticks turns slowly
 * around it like a dial. Decorative: hidden from the accessibility tree.
 */
export function DreamEye() {
  const root = useRef<SVGSVGElement>(null);
  const iris = useRef<SVGGElement>(null);
  const clip = useId();
  const glow = useId();

  useEffect(() => {
    const el = root.current;
    const ir = iris.current;
    if (!el || !ir) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let running = false;
    let tx = 0;
    let ty = 0;
    let td = 1;
    let x = 0;
    let y = 0;
    let d = 1;

    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      d += (td - d) * 0.1;
      ir.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      el.style.setProperty('--dilate', d.toFixed(3));
      if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(td - d) > 0.02) raf = requestAnimationFrame(tick);
      else running = false;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const length = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, length / 260);
      tx = (dx / length) * 30 * reach;
      ty = (dy / length) * 13 * reach;
      // Far away the pupil is a pinpoint; up close it opens wide.
      td = 0.72 + (1 - Math.min(1, length / 420)) * 0.75;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    let blinkTimer = 0;
    let openTimer = 0;
    const blink = () => {
      el.classList.add(styles.shut!);
      window.clearTimeout(openTimer);
      openTimer = window.setTimeout(() => el.classList.remove(styles.shut!), 150);
    };
    const schedule = () => {
      blinkTimer = window.setTimeout(() => {
        blink();
        schedule();
      }, 2600 + Math.random() * 4200);
    };
    schedule();

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', blink, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', blink);
      cancelAnimationFrame(raf);
      window.clearTimeout(blinkTimer);
      window.clearTimeout(openTimer);
    };
  }, []);

  return (
    <svg ref={root} className={styles.eye} viewBox="0 0 240 240" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}>
          <path d={ALMOND} />
        </clipPath>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#0a1030" />
          <stop offset="0.42" stopColor="#2f6bff" />
          <stop offset="0.78" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#06121c" />
        </radialGradient>
      </defs>

      <g className={styles.dial}>
        <line x1="216.0" y1="120.0" x2="234.0" y2="120.0" />
        <line x1="218.5" y1="137.4" x2="224.4" y2="138.4" />
        <line x1="210.2" y1="152.8" x2="227.1" y2="159.0" />
        <line x1="206.6" y1="170.0" x2="211.8" y2="173.0" />
        <line x1="193.5" y1="181.7" x2="207.3" y2="193.3" />
        <line x1="184.3" y1="196.6" x2="188.1" y2="201.2" />
        <line x1="168.0" y1="203.1" x2="177.0" y2="218.7" />
        <line x1="154.2" y1="214.0" x2="156.3" y2="219.6" />
        <line x1="136.7" y1="214.5" x2="139.8" y2="232.3" />
        <line x1="120.0" y1="220.0" x2="120.0" y2="226.0" />
        <line x1="103.3" y1="214.5" x2="100.2" y2="232.3" />
        <line x1="85.8" y1="214.0" x2="83.7" y2="219.6" />
        <line x1="72.0" y1="203.1" x2="63.0" y2="218.7" />
        <line x1="55.7" y1="196.6" x2="51.9" y2="201.2" />
        <line x1="46.5" y1="181.7" x2="32.7" y2="193.3" />
        <line x1="33.4" y1="170.0" x2="28.2" y2="173.0" />
        <line x1="29.8" y1="152.8" x2="12.9" y2="159.0" />
        <line x1="21.5" y1="137.4" x2="15.6" y2="138.4" />
        <line x1="24.0" y1="120.0" x2="6.0" y2="120.0" />
        <line x1="21.5" y1="102.6" x2="15.6" y2="101.6" />
        <line x1="29.8" y1="87.2" x2="12.9" y2="81.0" />
        <line x1="33.4" y1="70.0" x2="28.2" y2="67.0" />
        <line x1="46.5" y1="58.3" x2="32.7" y2="46.7" />
        <line x1="55.7" y1="43.4" x2="51.9" y2="38.8" />
        <line x1="72.0" y1="36.9" x2="63.0" y2="21.3" />
        <line x1="85.8" y1="26.0" x2="83.7" y2="20.4" />
        <line x1="103.3" y1="25.5" x2="100.2" y2="7.7" />
        <line x1="120.0" y1="20.0" x2="120.0" y2="14.0" />
        <line x1="136.7" y1="25.5" x2="139.8" y2="7.7" />
        <line x1="154.2" y1="26.0" x2="156.3" y2="20.4" />
        <line x1="168.0" y1="36.9" x2="177.0" y2="21.3" />
        <line x1="184.3" y1="43.4" x2="188.1" y2="38.8" />
        <line x1="193.5" y1="58.3" x2="207.3" y2="46.7" />
        <line x1="206.6" y1="70.0" x2="211.8" y2="67.0" />
        <line x1="210.2" y1="87.2" x2="227.1" y2="81.0" />
        <line x1="218.5" y1="102.6" x2="224.4" y2="101.6" />
      </g>
      <circle className={styles.orbit} cx="120" cy="120" r="88" />

      <path className={styles.ball} d={ALMOND} />
      <g clipPath={`url(#${clip})`}>
        <g ref={iris}>
          <circle className={styles.iris} cx="120" cy="120" r="35" fill={`url(#${glow})`} />
          <g className={styles.fibres}>
            <line x1="135.0" y1="120.0" x2="153.0" y2="120.0" />
            <line x1="134.7" y1="122.9" x2="152.4" y2="126.4" />
            <line x1="133.9" y1="125.7" x2="150.5" y2="132.6" />
            <line x1="132.5" y1="128.3" x2="147.4" y2="138.3" />
            <line x1="130.6" y1="130.6" x2="143.3" y2="143.3" />
            <line x1="128.3" y1="132.5" x2="138.3" y2="147.4" />
            <line x1="125.7" y1="133.9" x2="132.6" y2="150.5" />
            <line x1="122.9" y1="134.7" x2="126.4" y2="152.4" />
            <line x1="120.0" y1="135.0" x2="120.0" y2="153.0" />
            <line x1="117.1" y1="134.7" x2="113.6" y2="152.4" />
            <line x1="114.3" y1="133.9" x2="107.4" y2="150.5" />
            <line x1="111.7" y1="132.5" x2="101.7" y2="147.4" />
            <line x1="109.4" y1="130.6" x2="96.7" y2="143.3" />
            <line x1="107.5" y1="128.3" x2="92.6" y2="138.3" />
            <line x1="106.1" y1="125.7" x2="89.5" y2="132.6" />
            <line x1="105.3" y1="122.9" x2="87.6" y2="126.4" />
            <line x1="105.0" y1="120.0" x2="87.0" y2="120.0" />
            <line x1="105.3" y1="117.1" x2="87.6" y2="113.6" />
            <line x1="106.1" y1="114.3" x2="89.5" y2="107.4" />
            <line x1="107.5" y1="111.7" x2="92.6" y2="101.7" />
            <line x1="109.4" y1="109.4" x2="96.7" y2="96.7" />
            <line x1="111.7" y1="107.5" x2="101.7" y2="92.6" />
            <line x1="114.3" y1="106.1" x2="107.4" y2="89.5" />
            <line x1="117.1" y1="105.3" x2="113.6" y2="87.6" />
            <line x1="120.0" y1="105.0" x2="120.0" y2="87.0" />
            <line x1="122.9" y1="105.3" x2="126.4" y2="87.6" />
            <line x1="125.7" y1="106.1" x2="132.6" y2="89.5" />
            <line x1="128.3" y1="107.5" x2="138.3" y2="92.6" />
            <line x1="130.6" y1="109.4" x2="143.3" y2="96.7" />
            <line x1="132.5" y1="111.7" x2="147.4" y2="101.7" />
            <line x1="133.9" y1="114.3" x2="150.5" y2="107.4" />
            <line x1="134.7" y1="117.1" x2="152.4" y2="113.6" />
          </g>
          <circle className={styles.limbus} cx="120" cy="120" r="35" />
          <circle className={styles.pupil} cx="120" cy="120" r="13" />
          <circle className={styles.glint} cx="129" cy="110" r="4.2" />
          <circle className={styles.glint} cx="112" cy="129" r="1.6" />
        </g>
        <rect className={styles.lidTop} x="0" y="68" width="240" height="52" />
        <rect className={styles.lidBottom} x="0" y="120" width="240" height="52" />
      </g>
      <path className={styles.rim} d={ALMOND} />
    </svg>
  );
}
