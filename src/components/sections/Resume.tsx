import { Reveal } from '../ui/Reveal.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import styles from './Resume.module.css';

interface CvFile {
  name: string;
  format: 'PDF' | 'DOCX';
  note: string;
  href: string;
  dark?: boolean;
}

// One CV, four containers. The two ATS files are built by tools/build_cv.py,
// the two designed ones are printed from tools/cv-print-*.html.
const files: CvFile[] = [
  { name: 'ATS', format: 'PDF', note: 'Two pages for application portals', href: '/cv/Edgar_Hovsepyan_CV_ATS.pdf' },
  { name: 'ATS', format: 'DOCX', note: 'For portals that only take Word', href: '/cv/Edgar_Hovsepyan_CV_ATS.docx' },
  { name: 'Designed', format: 'PDF', note: 'One dark page, for people', href: '/cv/Edgar_Hovsepyan_CV.pdf', dark: true },
  { name: 'Light', format: 'PDF', note: 'One page that prints well', href: '/cv/Edgar_Hovsepyan_CV_Branded.pdf' },
];

const facts = [
  ['Length', 'Two pages for portals, one page designed'],
  ['Updated', 'November 2026'],
  ['Covers', 'Games, platform and tooling'],
  ['Parsing', 'ATS files: plain text layer, standard headings'],
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
              key={file.href}
              href={file.href}
              download
              className={file.dark ? `${styles.sheet} ${styles.dark}` : styles.sheet}
              aria-label={`Download the ${file.name} CV as ${file.format}`}
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
                <span className={styles.format}>
                  {file.name} · {file.format}
                </span>
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
            One CV, four ways to read it. Two files for the portals, two for people.
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
