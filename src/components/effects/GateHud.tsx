import { useEffect, useId, useRef, useState } from "react";
import styles from "./GateHud.module.css";

// Names the gate you are flying through: each chapter of the page is one ring
// of the corridor behind it, and this strip says which.
const CHAPTERS: [id: string, label: string][] = [
  ["top", "Opening"],
  ["awards", "Recognition"],
  ["timeline", "Career"],
  ["work", "Work"],
  ["games", "Games"],
  ["extra-studio", "Studio"],
  ["expertise", "Stack"],
  ["cv", "CV"],
  ["contact", "Contact"],
];

export function GateHud() {
  const [index, setIndex] = useState(0);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const nodes = CHAPTERS.map(([id]) => document.getElementById(id)).filter(
      (node): node is HTMLElement => node !== null,
    );
    // A one-pixel band across the middle of the viewport: whichever section
    // crosses it is the current chapter.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const found = CHAPTERS.findIndex(([id]) => id === entry.target.id);
          if (found >= 0) {
            setIndex((current) => {
              if (current !== found) setPassed(true);
              return found;
            });
          }
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Light dismiss where `closedby` is missing (Safari): close only when both
  // the press and the release land outside the sheet.
  useEffect(() => {
    const node = dialog.current;
    if (!node || 'closedBy' in HTMLDialogElement.prototype) return;
    const outside = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      return (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      );
    };
    let pressedOutside = false;
    const onDown = (event: PointerEvent) => {
      pressedOutside = outside(event);
    };
    const onUp = (event: PointerEvent) => {
      if (pressedOutside && outside(event)) node.close();
    };
    node.addEventListener('pointerdown', onDown);
    node.addEventListener('pointerup', onUp);
    return () => {
      node.removeEventListener('pointerdown', onDown);
      node.removeEventListener('pointerup', onUp);
    };
  }, []);

  // Open on the gate you are at, so one tap or arrow gets you to its neighbour.
  const open = () => {
    const node = dialog.current;
    if (!node) return;
    node.showModal();
    node.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus();
  };

  const travel = (id: string) => {
    dialog.current?.close();
    document.getElementById(id)?.scrollIntoView();
  };

  const number = String(index + 1).padStart(2, "0");
  const total = String(CHAPTERS.length).padStart(2, "0");

  return (
    <>
      {/* Passing a gate: a line of light crosses the screen and the chapter
          number shows for a moment, like a level card. Skips the first paint. */}
      {passed ? (
        <div key={index} className={styles.pass} aria-hidden="true">
          <span className={styles.sweep} />
          <span className={styles.big}>{number}</span>
          <span className={styles.bigName}>{CHAPTERS[index]![1]}</span>
        </div>
      ) : null}
      {/* The strip is also the way around: on a phone it is the only menu. */}
      <button
        type="button"
        className={styles.hud}
        aria-label={`Gate ${number} of ${total}, ${CHAPTERS[index]![1]}. Open the list of sections`}
        onClick={open}
      >
        <span className={styles.ring} aria-hidden="true" />
        <span className={styles.label}>Gate</span>
        <span className={styles.window}>
          <span key={number} className={styles.value}>
            {number}
          </span>
        </span>
        <span className={styles.total}>/ {total}</span>
        <span className={styles.window}>
          <span key={index} className={styles.name}>
            {CHAPTERS[index]![1]}
          </span>
        </span>
        <span className={styles.caret} aria-hidden="true" />
      </button>

      <dialog
        ref={dialog}
        className={styles.sheet}
        aria-labelledby={titleId}
        {...({ closedby: 'any' } as object)}
      >
        <div className={styles.sheetInner}>
          <div className={styles.sheetHead}>
            <h1 id={titleId} className={styles.sheetTitle}>
              Gates
            </h1>
            <form method="dialog">
              <button className={styles.close} aria-label="Close the list of sections">
                Close
              </button>
            </form>
          </div>
          <ol className={styles.gates}>
            {CHAPTERS.map(([id, label], order) => (
              <li key={id}>
                <button
                  type="button"
                  className={styles.gate}
                  aria-current={order === index ? 'true' : undefined}
                  onClick={() => travel(id)}
                >
                  <span className={styles.gateNo}>{String(order + 1).padStart(2, '0')}</span>
                  <span className={styles.gateName}>{label}</span>
                  <span className={styles.gateGo} aria-hidden="true">
                    →
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </dialog>
    </>
  );
}
