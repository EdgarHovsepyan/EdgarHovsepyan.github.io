import { cx } from '../../utils/cx.ts';
import styles from './Chip.module.css';

interface ChipProps {
  label: string;
  accent?: boolean;
}

export function Chip({ label, accent }: ChipProps) {
  return <span className={cx(styles.chip, accent && styles.accent)}>{label}</span>;
}
