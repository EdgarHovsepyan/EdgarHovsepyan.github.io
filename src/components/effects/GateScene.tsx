import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import styles from './GateScene.module.css';

/**
 * Lazy mount for the 3D corridor. three.js is a separate chunk fetched only
 * once the page is idle, so it never competes with first paint; if WebGL is
 * unavailable the CSS backdrop simply stays as it is.
 */
export function GateScene() {
  const mount = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = mount.current;
    if (!node) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    const start = () => {
      void import('../../three/createGateScene.ts').then(({ createGateScene }) => {
        if (cancelled) return;
        const mobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 820;
        const gates = Math.max(4, document.querySelectorAll('main > *').length - 2);
        const scene = createGateScene(node, { mobile, reducedMotion: reduced, gates });
        if (!scene) return;
        dispose = scene.dispose;
        node.classList.add(styles.live!);
      });
    };

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 2500 })
      : window.setTimeout(start, 1200);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      dispose?.();
    };
  }, [reduced]);

  return <div ref={mount} className={styles.mount} aria-hidden="true" />;
}
