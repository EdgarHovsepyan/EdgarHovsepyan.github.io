import { useEffect, useRef, useState } from 'react';
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
    <article
      ref={ref}
      className={styles.panel}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${work.length}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
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
// Below this width the gallery is a swipe carousel on native scroll snap.
const SWIPE = '(max-width: 879px)';

export function Work() {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const [swipe, setSwipe] = useState(false);
  const [current, setCurrent] = useState(0);
  const [status, setStatus] = useState('');
  // Where a button press is heading, so quick presses build on each other
  // instead of on wherever the scroll happens to be mid-flight.
  const pending = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(SWIPE);
    const sync = () => setSwipe(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Carousel wiring. Scrolling and snapping are the browser's; this only keeps
  // the markers, the focus pull and the announcement in step with it.
  useEffect(() => {
    const trackEl = track.current;
    if (!swipe || !trackEl) return;
    const slides = Array.from(trackEl.children) as HTMLElement[];
    let frame = 0;
    let settled = 0;
    let timer = 0;

    const nearest = () => {
      const centre = trackEl.scrollLeft + trackEl.clientWidth / 2;
      let best = 0;
      let bestGap = Infinity;
      slides.forEach((slide, index) => {
        const gap = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - centre);
        if (gap < bestGap) {
          bestGap = gap;
          best = index;
        }
      });
      return best;
    };
    const paint = () => {
      frame = 0;
      const centre = trackEl.scrollLeft + trackEl.clientWidth / 2;
      for (const slide of slides) {
        const offset = (slide.offsetLeft + slide.offsetWidth / 2 - centre) / trackEl.clientWidth;
        const shift = Math.min(1, Math.max(-1, offset));
        slide.style.setProperty('--shift', shift.toFixed(3));
        slide.style.setProperty('--focus', (1 - Math.min(1, Math.abs(shift) * 1.15)).toFixed(3));
      }
      if (pending.current === null) setCurrent(nearest());
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const settle = () => {
      pending.current = null;
      const index = nearest();
      setCurrent(index);
      if (index !== settled) {
        settled = index;
        setStatus(`Slide ${index + 1} of ${slides.length}: ${work[index]!.title}`);
      }
    };
    const hasScrollEnd = 'onscrollend' in window;
    const onScrollDebounced = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 140);
    };

    trackEl.addEventListener('scroll', onScroll, { passive: true });
    if (hasScrollEnd) trackEl.addEventListener('scrollend', settle);
    else trackEl.addEventListener('scroll', onScrollDebounced, { passive: true });
    paint();

    return () => {
      trackEl.removeEventListener('scroll', onScroll);
      trackEl.removeEventListener('scrollend', settle);
      trackEl.removeEventListener('scroll', onScrollDebounced);
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      for (const slide of slides) {
        slide.style.removeProperty('--shift');
        slide.style.removeProperty('--focus');
      }
    };
  }, [swipe]);

  const goTo = (index: number) => {
    const trackEl = track.current;
    if (!trackEl) return;
    const target = Math.min(work.length - 1, Math.max(0, index));
    const slide = trackEl.children[target] as HTMLElement | undefined;
    if (!slide) return;
    pending.current = target;
    setCurrent(target);
    // Scroll the track only, to the slide's own snap position.
    trackEl.scrollTo({ left: slide.offsetLeft - (trackEl.clientWidth - slide.offsetWidth) / 2 });
    // A control that is about to disable must not strand keyboard focus.
    if (target === 0 && document.activeElement === previous.current) next.current?.focus();
    if (target === work.length - 1 && document.activeElement === next.current) previous.current?.focus();
  };
  const step = (direction: number) => goTo((pending.current ?? current) + direction);

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
        // On phones the carousel effect owns --shift / --focus.
        if (!window.matchMedia(SWIPE).matches) {
          for (const panel of panels) {
            panel.style.removeProperty('--shift');
            panel.style.removeProperty('--focus');
          }
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
    <section
      id="work"
      ref={root}
      className={styles.section}
      aria-roledescription="carousel"
      aria-label="Things I built"
    >
      <div ref={viewport} className={styles.viewport}>
        <div className={styles.header}>
          <SectionHeader index="03" label="Selected work" title="Things I built" />
          <div className={styles.meter} aria-hidden="true">
            <span className={styles.meterLabel}>Scroll</span>
            <span className={styles.meterBar} />
            <span className={styles.meterLabel}>{`0${work.length}`}</span>
          </div>
        </div>

        {swipe ? (
          <div className={styles.controls}>
            <span className={styles.count} aria-hidden="true">
              <b>{`0${current + 1}`}</b> / {`0${work.length}`}
            </span>
            <button
              ref={previous}
              type="button"
              className={styles.arrow}
              disabled={current === 0}
              onClick={() => step(-1)}
            >
              <span aria-hidden="true">←</span>
              <span className={styles.hidden}>Previous slide</span>
            </button>
            <button
              ref={next}
              type="button"
              className={styles.arrow}
              disabled={current === work.length - 1}
              onClick={() => step(1)}
            >
              <span aria-hidden="true">→</span>
              <span className={styles.hidden}>Next slide</span>
            </button>
          </div>
        ) : null}

        <div
          ref={track}
          className={styles.track}
          role="group"
          aria-label="Slides"
          tabIndex={swipe ? 0 : undefined}
        >
          {work.map((project, index) => (
            <WorkPanel key={project.id} project={project} index={index} />
          ))}
        </div>

        {swipe ? (
          <>
            <p className={styles.hidden} role="status" aria-live="polite">
              {status}
            </p>
            <nav className={styles.markers} aria-label="Choose a slide">
              {work.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  className={styles.marker}
                  aria-label={`Go to slide ${index + 1}: ${project.title}`}
                  aria-current={index === current ? 'true' : undefined}
                  onClick={() => goTo(index)}
                />
              ))}
            </nav>
          </>
        ) : null}
      </div>
    </section>
  );
}
