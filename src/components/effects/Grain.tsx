import styles from './Grain.module.css';

export function Grain() {
  return (
    <>
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.scanlines} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />
    </>
  );
}
