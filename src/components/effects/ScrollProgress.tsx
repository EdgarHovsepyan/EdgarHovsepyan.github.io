import { useEffect, useRef } from 'react';
import styles from './ScrollProgress.module.css';

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      node.style.width = `${ratio * 100}%`;
      // Publish page progress (0→1) globally so other elements can react to it.
      document.documentElement.style.setProperty('--scroll', ratio.toFixed(4));
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return <div ref={ref} className={styles.bar} aria-hidden="true" />;
}
