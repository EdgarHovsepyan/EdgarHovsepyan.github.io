import { useEffect, useState } from "react";
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
      <div className={styles.hud} aria-hidden="true">
        <span className={styles.ring} />
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
      </div>
    </>
  );
}
