import { navLinks } from '../../data/navigation.ts';
import { profile } from '../../data/profile.ts';
import { useMagnetic } from '../../hooks/useMagnetic.ts';
import styles from './Nav.module.css';

export function Nav() {
  const available = useMagnetic<HTMLAnchorElement>();

  return (
    <nav className={styles.nav}>
      <a href="#top" className={styles.brand}>
        <span className={styles.monogram}>{profile.initials}</span>
        <span className={styles.name}>{profile.fullName}</span>
      </a>

      <div className={styles.links}>
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} className={styles.link}>
            {link.label}
          </a>
        ))}
      </div>

      <a ref={available} href="#contact" className={styles.available}>
        <span className={styles.status} aria-hidden="true" />
        Available
      </a>
    </nav>
  );
}
