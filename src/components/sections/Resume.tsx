import { Reveal } from '../ui/Reveal.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import styles from './Resume.module.css';

interface CvFile {
  format: 'PDF' | 'DOCX';
  note: string;
  href: string;
}

// One CV, two containers. Both are built from the same source by
// tools/build_cv.py, so they cannot drift apart.
const files: CvFile[] = [
  { format: 'PDF', note: 'For reading and for application portals', href: '/cv/Edgar_Hovsepyan_CV_ATS.pdf' },
  { format: 'DOCX', note: 'For portals that only take Word', href: '/cv/Edgar_Hovsepyan_CV_ATS.docx' },
];

const facts = [
  ['Length', 'Two pages, single column'],
  ['Updated', 'November 2026'],
  ['Covers', 'Games, platform and tooling'],
  ['Parsing', 'Plain text layer, standard headings'],
];

const outline = ['Summary', 'Experience', 'Selected Projects', 'Skills', 'Education', 'Awards'];

export function Resume() {
  return (
    <section id="cv" className={styles.section}>
      <Reveal className={styles.header}>
        <SectionHeader index="06" label="Résumé" title="Download the CV" />
      </Reveal>

      <div className={styles.layout}>
        <Reveal className={styles.desk} from="scale">
          {files.map((file) => (
            <a
              key={file.format}
              href={file.href}
              download
              className={styles.sheet}
              aria-label={`Download the CV as ${file.format}`}
            >
              <span className={styles.scan} aria-hidden="true" />
              <span className={styles.sheetName}>Edgar Hovsepyan</span>
              <span className={styles.sheetRole}>Senior iGaming Engineer</span>
              <span className={styles.rule} aria-hidden="true" />
              <span className={styles.outline} aria-hidden="true">
                {outline.map((item, index) => (
                  <span key={item} className={styles.block}>
                    <span className={styles.blockLabel}>{item}</span>
                    <span className={styles.lines} style={{ height: `${index === 1 ? 54 : 18}px` }} />
                  </span>
                ))}
              </span>
              <span className={styles.foot}>
                <span className={styles.format}>{file.format}</span>
                <span className={styles.note}>{file.note}</span>
                <span className={styles.get}>
                  Download <span aria-hidden="true">↓</span>
                </span>
              </span>
            </a>
          ))}
        </Reveal>

        <Reveal className={styles.facts} from="left">
          <p className={styles.lead}>
            One CV in two containers. The same two pages, as a PDF and as a Word file.
          </p>
          <dl className={styles.list}>
            {facts.map(([label, value]) => (
              <div key={label} className={styles.row}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
