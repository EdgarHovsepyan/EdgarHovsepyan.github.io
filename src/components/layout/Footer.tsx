import { profile } from '../../data/profile.ts';
import { socials } from '../../data/contact.ts';
import { useParallax } from '../../hooks/useParallax.ts';
import styles from './Footer.module.css';

export function Footer() {
  const watermark = useParallax<HTMLImageElement>(0.05);

  return (
    <footer className={styles.footer}>
      <img ref={watermark} className={styles.watermark} src={profile.wordmark} alt="" aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.monogram}>{profile.initials}</span>
          <div className={styles.id}>
            {profile.fullName}
            <br />
            <span className={styles.role}>{profile.title}</span>
          </div>
        </div>
        <div className={styles.links}>
          {socials.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {social.label}
            </a>
          ))}
          <span>© 2026 · Yerevan, Armenia</span>
        </div>
      </div>
    </footer>
  );
}
