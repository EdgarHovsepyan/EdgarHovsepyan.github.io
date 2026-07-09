import { useEffect, useRef, useState } from 'react';
import { ambient } from '../../audio/AmbientAudio.ts';
import { cx } from '../../utils/cx.ts';
import styles from './SoundToggle.module.css';

const KEY = 'portfolio-sound';

export function SoundToggle() {
  const [on, setOn] = useState(false);
  const onRef = useRef(false);

  // Reflect the persisted preference in the icon; audio itself only starts on a gesture.
  useEffect(() => {
    if (!ambient.isSupported) return;
    const pref = localStorage.getItem(KEY) === 'on';
    if (!pref) return;
    setOn(true);
    onRef.current = true;

    // Can't autoplay — arm a one-shot: start on the visitor's first interaction.
    const start = () => {
      if (onRef.current) ambient.enable();
      document.removeEventListener('pointerdown', start);
      document.removeEventListener('keydown', start);
    };
    document.addEventListener('pointerdown', start, { once: true });
    document.addEventListener('keydown', start, { once: true });
    return () => {
      document.removeEventListener('pointerdown', start);
      document.removeEventListener('keydown', start);
    };
  }, []);

  // Suspend/resume with tab visibility.
  useEffect(() => {
    document.addEventListener('visibilitychange', ambient.handleVisibility);
    return () => document.removeEventListener('visibilitychange', ambient.handleVisibility);
  }, []);

  // Subtle UI blips — only while sound is on.
  useEffect(() => {
    if (!on) return;
    const isInteractive = (el: EventTarget | null) =>
      el instanceof Element && !!el.closest('a, button');
    const onOver = (e: PointerEvent) => {
      if (isInteractive(e.target)) ambient.sfx('hover');
    };
    const onDown = (e: PointerEvent) => {
      if (isInteractive(e.target)) ambient.sfx('click');
    };
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [on]);

  if (!ambient.isSupported) return null;

  const toggle = () => {
    const next = !on;
    setOn(next);
    onRef.current = next;
    localStorage.setItem(KEY, next ? 'on' : 'off');
    if (next) ambient.enable();
    else ambient.disable();
  };

  return (
    <button
      type="button"
      className={cx(styles.toggle, on && styles.on)}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Turn ambient sound off' : 'Turn ambient sound on'}
      title={on ? 'Sound on' : 'Sound off'}
    >
      <span className={styles.bars} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}
