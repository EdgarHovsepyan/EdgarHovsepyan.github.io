import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cx } from '@/utils/cx';
import styles from './shader-lines.module.css';

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform vec2 resolution;
  uniform float time;

  float random(in float x) { return fract(sin(x) * 1e4); }

  void main(void) {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    vec2 fMosaicScal = vec2(4.0, 2.0);
    vec2 vScreenSize = vec2(256.0, 256.0);
    uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
    uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

    float t = time * 0.06 + random(uv.x) * 0.4;
    float lineWidth = 0.0008;

    vec3 color = vec3(0.0);
    for (int j = 0; j < 3; j++) {
      for (int i = 0; i < 5; i++) {
        color[j] += lineWidth * float(i * i) / abs(fract(t - 0.01 * float(j) + float(i) * 0.01) - length(uv));
      }
    }

    gl_FragColor = vec4(color[2], color[1], color[0], 1.0);
  }
`;

interface ShaderLinesProps {
  className?: string;
}

export function ShaderLines({ className }: ShaderLinesProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const resize = () => {
      renderer.setSize(mount.clientWidth || 1, mount.clientHeight || 1);
      uniforms.resolution.value.set(renderer.domElement.width, renderer.domElement.height);
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const dispose = () => {
      resizeObserver.disconnect();
      renderer.domElement.remove();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };

    if (reduced) {
      renderer.render(scene, camera);
      return dispose;
    }

    let frameId = 0;
    let running = false;
    let onScreen = false;

    const tick = () => {
      uniforms.time.value += 0.05;
      renderer.render(scene, camera);
      if (running) frameId = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      frameId = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? false;
        if (onScreen && !document.hidden) start();
        else stop();
      },
      { rootMargin: '120px' },
    );
    observer.observe(mount);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (onScreen) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(frameId);
      dispose();
    };
  }, [reduced]);

  return <div ref={mountRef} className={cx(styles.mount, className)} aria-hidden="true" />;
}
