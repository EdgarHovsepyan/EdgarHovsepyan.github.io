import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Chip } from '../ui/Chip.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { work } from '../../data/work.ts';
import type { WorkProject } from '../../data/types.ts';
import styles from './Work.module.css';

gsap.registerPlugin(ScrollTrigger);

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

      <div className={styles.panelInner}>
        <div className={styles.panelTop}>
          <span className={styles.panelNo}>{project.id}</span>
          <span className={styles.panelCount}>{`0${index + 1} — 0${work.length}`}</span>
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

export function Work() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootEl = root.current;
    const trackEl = track.current;
    if (!rootEl || !trackEl) return;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 880px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => trackEl.scrollWidth - rootEl.clientWidth;
      gsap.to(trackEl, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: rootEl,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="work" ref={root} className={styles.section}>
      <div className={styles.viewport}>
        <div className={styles.header}>
          <SectionHeader index="03" label="Selected work" title="Things I built" />
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
