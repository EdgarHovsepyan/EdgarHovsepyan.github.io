import { useEffect, useRef } from 'react';
import { Chip } from '../ui/Chip.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { work } from '../../data/work.ts';
import type { WorkProject } from '../../data/types.ts';
import styles from './Work.module.css';

function WorkPanel({ project, index }: { project: WorkProject; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);

  // Pointer parallax: cursor position drives --px/--py (-1…1), which the CSS uses
  // to drift the art layers at different depths and tilt the card. Mouse only.
  const onMove = (event: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || event.pointerType !== 'mouse') return;
    const rect = el.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const py = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--px', px.toFixed(3));
      el.style.setProperty('--py', py.toFixed(3));
    });
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty('--px', '0');
    el.style.setProperty('--py', '0');
  };

  return (
    <article ref={ref} className={styles.panel} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className={styles.artBg} aria-hidden="true" />
      <div className={styles.portalWrap} aria-hidden="true">
        <div className={styles.portal} />
      </div>
      <div className={styles.sheen} aria-hidden="true" />
      <div className={styles.sig} aria-hidden="true" />
      <div className={styles.numeral} aria-hidden="true">{`0${index + 1}`}</div>

      <div className={styles.panelInner}>
        <div className={styles.panelTop}>
          <span className={styles.panelNo}>{project.id}</span>
          <span className={styles.panelCount}>{`0${index + 1} / 0${work.length}`}</span>
        </div>
        <h3 className={styles.panelTitle}>{project.title}</h3>
        <p className={styles.panelDesc}>{project.description}</p>
        <div className={styles.panelTags}>
          {project.tags.map((tag) => (
            <Chip key={tag} label={tag} accent />
          ))}
        </div>
      </div>
    </article>
  );
}

// Horizontal gallery driven by vertical scroll. The section is made exactly as
// tall as the distance the track has to travel and the viewport inside it is
// `position: sticky` — so the browser owns the pinning and it can never go stale
// when something above changes height (the old cached-offset pin jumped whenever
// a career row expanded). The slide itself is a native scroll-driven animation;
// browsers without it get a rect-based scroll listener.
const DESKTOP = '(min-width: 880px) and (prefers-reduced-motion: no-preference)';

export function Work() {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootEl = root.current;
    const viewEl = viewport.current;
    const trackEl = track.current;
    if (!rootEl || !viewEl || !trackEl) return;

    const mq = window.matchMedia(DESKTOP);
    const native = CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)');
    const panels = Array.from(trackEl.children) as HTMLElement[];
    let distance = 0;
    let frame = 0;

    const apply = () => {
      frame = 0;
      if (!mq.matches) {
        rootEl.style.removeProperty('--p');
        for (const panel of panels) {
          panel.style.removeProperty('--shift');
          panel.style.removeProperty('--focus');
        }
        if (!native) trackEl.style.removeProperty('translate');
        return;
      }
      const rect = rootEl.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
      // Drives the "01 — 04" counter bar; cheap, and shared by both paths.
      rootEl.style.setProperty('--p', p.toFixed(4));
      // Focus pull: the panel nearest the centre of the screen is the one in
      // play; its neighbours step back. --shift also drives numeral parallax.
      const half = window.innerWidth / 2;
      for (const panel of panels) {
        const box = panel.getBoundingClientRect();
        const shift = Math.min(1, Math.max(-1, (box.left + box.width / 2 - half) / (half * 1.25)));
        panel.style.setProperty('--shift', shift.toFixed(3));
        panel.style.setProperty('--focus', (1 - Math.abs(shift)).toFixed(3));
      }
      if (!native) trackEl.style.translate = `${(-p * distance).toFixed(1)}px 0`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const measure = () => {
      distance = mq.matches ? Math.max(0, trackEl.scrollWidth - viewEl.clientWidth) : 0;
      if (distance > 0) rootEl.style.setProperty('--dist', `${distance}px`);
      else rootEl.style.removeProperty('--dist');
      schedule();
    };

    const ro = new ResizeObserver(measure);
    ro.observe(trackEl);
    ro.observe(viewEl);
    mq.addEventListener('change', measure);
    window.addEventListener('scroll', schedule, { passive: true });
    measure();

    return () => {
      ro.disconnect();
      mq.removeEventListener('change', measure);
      window.removeEventListener('scroll', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="work" ref={root} className={styles.section}>
      <div ref={viewport} className={styles.viewport}>
        <div className={styles.header}>
          <SectionHeader index="03" label="Selected work" title="Things I built" />
          <div className={styles.meter} aria-hidden="true">
            <span className={styles.meterLabel}>Scroll</span>
            <span className={styles.meterBar} />
            <span className={styles.meterLabel}>{`0${work.length}`}</span>
          </div>
        </div>
        <div ref={track} className={styles.track}>
          {work.map((project, index) => (
            <WorkPanel key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
