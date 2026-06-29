import { Reveal } from '../ui/Reveal.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { cx } from '../../utils/cx.ts';
import styles from './Resume.module.css';

interface CvFile {
  label: string;
  format: 'PDF' | 'DOCX';
  desc: string;
  href: string;
  featured?: boolean;
}

const cvs: CvFile[] = [
  {
    label: 'Premium CV',
    format: 'PDF',
    desc: 'Designed, single-page, on-brand — for recruiters, LinkedIn, referrals & direct-to-studio.',
    href: '/cv/Edgar_Hovsepyan_CV.pdf',
    featured: true,
  },
  {
    label: 'ATS CV',
    format: 'PDF',
    desc: 'Single-column, parser-friendly — for online application portals and ATS screening.',
    href: '/cv/Edgar_Hovsepyan_CV_ATS.pdf',
  },
  {
    label: 'ATS CV',
    format: 'DOCX',
    desc: 'Word version with identical content — for portals that only accept .docx.',
    href: '/cv/Edgar_Hovsepyan_CV_ATS.docx',
  },
  {
    label: 'Branded CV',
    format: 'PDF',
    desc: 'Light, print-friendly layout with accent styling — a middle-ground option.',
    href: '/cv/Edgar_Hovsepyan_CV_Branded.pdf',
  },
];

export function Resume() {
  return (
    <section id="cv" className={styles.section}>
      <Reveal className={styles.header}>
        <div>
          <SectionHeader index="06" label="Résumé" title="Download the CV" />
        </div>
        <div className={styles.hint}>Pick the format for your channel</div>
      </Reveal>

      <div className={styles.grid}>
        {cvs.map((cv) => (
          <Reveal key={cv.label + cv.format}>
            <a
              href={cv.href}
              download
              className={cx(styles.card, cv.featured && styles.featured)}
              aria-label={`Download ${cv.label} (${cv.format})`}
            >
              <div className={styles.top}>
                <span className={styles.tag}>{cv.format}</span>
                {cv.featured ? (
                  <span className={styles.star} aria-hidden="true">
                    ★
                  </span>
                ) : null}
              </div>
              <h3 className={styles.title}>{cv.label}</h3>
              <p className={styles.desc}>{cv.desc}</p>
              <span className={styles.dl}>
                Download
                <span className={styles.arrow} aria-hidden="true">
                  ↓
                </span>
              </span>
              <div className={styles.glow} aria-hidden="true" />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
