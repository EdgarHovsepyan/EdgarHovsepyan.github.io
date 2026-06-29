import { cx } from '../../utils/cx.ts';
import styles from './SideRails.module.css';

export function SideRails() {
  return (
    <>
      <div className={cx(styles.rail, styles.left)} aria-hidden="true">
        ՀԱՅ · Yerevan, Armenia
        <span className={styles.tick} />
      </div>
      <div className={cx(styles.rail, styles.right)} aria-hidden="true">
        <span className={styles.tick} />
        Est. 2017 · 7+ YRS
      </div>
    </>
  );
}
