import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Reveal } from '../ui/Reveal.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { bento } from '../../data/expertise.ts';
import styles from './Expertise.module.css';

/**
 * The stack as a console: disciplines down the left, the selected one set
 * large on the right. A real tablist — arrow keys move and select, Home / End
 * jump, and only the selected tab sits in the tab order.
 */
export function Expertise() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  const select = (index: number, focus = false) => {
    const next = (index + bento.length) % bento.length;
    setSelected(next);
    const tab = tabs.current[next];
    if (focus) tab?.focus();
    // On narrow screens the tablist scrolls sideways: keep the choice in view
    // without moving the page.
    tab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (event.key in step) {
      event.preventDefault();
      select(selected + step[event.key]!, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      select(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      select(bento.length - 1, true);
    }
  };

  return (
    <section id="expertise" className={styles.section}>
      <Reveal className={styles.header}>
        <SectionHeader index="05" label="Core expertise" title="The stack" />
      </Reveal>

      <Reveal className={styles.console}>
        <div className={styles.tabs} role="tablist" aria-label="Disciplines" onKeyDown={onKeyDown}>
          {bento.map((cell, index) => (
            <button
              key={cell.label}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={index === selected}
              tabIndex={index === selected ? 0 : -1}
              className={styles.tab}
              onClick={() => select(index)}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') setSelected(index);
              }}
            >
              <span className={styles.tabNo}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.tabLabel}>{cell.label}</span>
              <span className={styles.tabCount}>{cell.chips.length}</span>
            </button>
          ))}
        </div>

        <div className={styles.stage}>
          {bento.map((cell, index) => (
            <div
              key={cell.label}
              role="tabpanel"
              aria-labelledby={`${id}-tab-${index}`}
              hidden={index !== selected}
              tabIndex={index === selected ? 0 : undefined}
              className={styles.panel}
            >
              <div className={styles.panelInner}>
                <span className={styles.ghost} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className={styles.label}>{cell.label}</div>
                {cell.title ? <h3 className={styles.title}>{cell.title}</h3> : null}
                {cell.body ? <p className={styles.body}>{cell.body}</p> : null}
                <ul className={styles.words}>
                  {cell.chips.map((chip, order) => (
                    <li key={chip} className={styles.word} style={{ animationDelay: `${order * 38}ms` }}>
                      {chip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
