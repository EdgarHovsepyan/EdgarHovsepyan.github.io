import { Reveal } from '../ui/Reveal.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { profile } from '../../data/profile.ts';
import { socials, contactDetails } from '../../data/contact.ts';
import { useMagnetic } from '../../hooks/useMagnetic.ts';
import { useParallaxVar } from '../../hooks/useParallaxVar.ts';
import { cx } from '../../utils/cx.ts';
import styles from './Contact.module.css';

const ICONS: Record<string, string> = {
  GitHub:
    'M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z',
  LinkedIn:
    'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  Telegram:
    'M11.94 2.5C6.73 2.5 2.5 6.73 2.5 11.94c0 5.2 4.23 9.43 9.44 9.43 5.2 0 9.43-4.23 9.43-9.43 0-5.21-4.23-9.44-9.43-9.44zm4.38 6.46-1.46 6.9c-.11.49-.4.61-.81.38l-2.24-1.65-1.08 1.04c-.12.12-.22.22-.45.22l.16-2.28 4.15-3.75c.18-.16-.04-.25-.28-.09l-5.13 3.23-2.21-.69c-.48-.15-.49-.48.1-.71l8.63-3.33c.4-.15.75.09.62.71z',
};

function SocialButton({ label, href }: { label: string; href: string }) {
  const ref = useMagnetic<HTMLAnchorElement>();
  return (
    <a ref={ref} href={href} target="_blank" rel="me noopener noreferrer" className={styles.social}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={ICONS[label]} />
      </svg>
      {label}
    </a>
  );
}

export function Contact() {
  const cta = useMagnetic<HTMLAnchorElement>();
  const glow = useParallaxVar<HTMLDivElement>(0.14);
  const mailto = `mailto:${profile.email}`;

  return (
    <section id="contact" className={styles.section}>
      <div ref={glow} className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <Reveal>
          <SectionHeader index="07" label="Let’s build" />
        </Reveal>
        <Reveal>
          <h2 className={styles.heading}>
            Got a game
            <br />
            to <span className={styles.ship}>ship?</span>
          </h2>
        </Reveal>
        <Reveal className={styles.actions}>
          <a ref={cta} href={mailto} className={styles.primary}>
            Start a conversation
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </a>
          <a href={mailto} className={styles.email}>
            {profile.email}
          </a>
        </Reveal>
        <Reveal className={styles.socials}>
          {socials.map((social) => (
            <SocialButton key={social.href} label={social.label} href={social.href} />
          ))}
        </Reveal>
        <Reveal className={styles.details}>
          {contactDetails.map((detail) => (
            <div key={detail.label}>
              <div className={styles.detailLabel}>{detail.label}</div>
              {detail.href ? (
                <a
                  href={detail.href}
                  className={cx(styles.detailValue, detail.tone === 'green' && styles.green)}
                >
                  {detail.value}
                </a>
              ) : (
                <div className={cx(styles.detailValue, detail.tone === 'green' && styles.green)}>
                  {detail.value}
                </div>
              )}
            </div>
          ))}
          <div>
            <div className={styles.detailLabel}>Elsewhere</div>
            <div className={styles.elsewhere}>
              {socials.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className={styles.detailLink}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
