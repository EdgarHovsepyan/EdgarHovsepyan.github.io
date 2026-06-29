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
  return (
    <article className={styles.panel}>
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
      <div className={styles.panelGlow} aria-hidden="true" />
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
