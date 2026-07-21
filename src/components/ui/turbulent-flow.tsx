import { useEffect, useRef } from 'react';
import type * as THREE from 'three';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cx } from '@/utils/cx';
import styles from './turbulent-flow.module.css';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Volumetric raymarched nebula in the site palette (indigo -> blue -> cyan ->
// gold). STEPS is injected per device so weaker GPUs compile a cheaper program.
const fragmentBody = `
  precision highp float;
  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_mouse;       // centered, ~-0.5..0.5
  uniform float u_noise_scale; // GSAP-driven, subtle base-frequency breathing
  uniform float u_distortion;  // GSAP-driven, domain-warp amount
  uniform float u_turbulence;  // GSAP-driven, density gain
  uniform float u_sharpness;   // GSAP-driven, edge tightness
  varying vec2  vUv;

  float hash(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float vnoise(vec3 x){
    vec3 i = floor(x), f = fract(x); f = f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                   mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                   mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*vnoise(p); p*=2.02; a*=0.5; } return s; }
  vec3 pal(float t){ return vec3(0.5) + vec3(0.48,0.46,0.44)*cos(6.28318*(vec3(1.0)*t + vec3(0.62,0.50,0.34))); }
  vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

  void main(){
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    vec2 uv = (vUv - 0.5); uv.x *= aspect;
    float T = u_time * 0.4;
    float ns = mix(0.86, 1.16, clamp((u_noise_scale - 2.5) / 3.5, 0.0, 1.0));

    // Cursor gravitational lens — the field bends toward the pointer.
    vec2 m = vec2(u_mouse.x * aspect, u_mouse.y);
    uv -= (uv - m) * 0.05 / (dot(uv - m, uv - m) + 0.35);

    vec3 ro = vec3(0.0, 0.0, -3.2);
    vec3 rd = normalize(vec3(uv, 1.35));
    float a = T * 0.03;
    ro.xz = rot(a) * ro.xz; rd.xz = rot(a) * rd.xz;
    ro.y += sin(T * 0.15) * 0.12;

    vec3 acc = vec3(0.0); float trans = 1.0; float t = 1.4;
    for (int i = 0; i < STEPS; i++) {
      vec3 p = ro + rd * t;
      vec3 w = vec3(
        fbm(p * 0.6 * ns + vec3(0.0, 0.0, T*0.05)),
        fbm(p * 0.6 * ns + vec3(5.2, 1.3, T*0.05)),
        fbm(p * 0.6 * ns + vec3(9.1, 4.7, T*0.05)));
      vec3 q = p + (u_distortion * 6.0) * (w - 0.5);
      float f = fbm(q * 0.85 * ns + vec3(0.0, 0.0, T*0.06));
      float dens = smoothstep(0.5, 0.86, f) * (0.8 + u_turbulence * 0.5);
      dens *= smoothstep(2.6, 0.4, length(p.xy));
      if (dens > 0.001) {
        float ci = clamp(0.28 + p.y*0.14 + f*0.7, 0.0, 1.0);
        vec3 col = pal(ci);
        float grad = fbm(q * 0.85 * ns + 0.06) - f;
        float fres = pow(clamp(1.0 - abs(grad) * 7.0, 0.0, 1.0), 2.5);
        col += pal(ci + 0.25) * fres * 0.5;
        float aStep = dens * (0.14 + u_sharpness * 0.02);
        acc += trans * col * aStep * (1.3 + fres);
        trans *= 1.0 - aStep;
        if (trans < 0.03) break;
      }
      t += 0.09 + (1.0 - dens) * 0.05;
    }

    // Parallax particle depth — two hashed layers.
    float star = 0.0;
    for (int L = 0; L < 2; L++) {
      float sc = 7.0 + float(L) * 10.0;
      vec2 gv = uv * sc + vec2(T * (0.03 + 0.02 * float(L)), -T * 0.015);
      vec2 id = floor(gv); vec2 fv = fract(gv) - 0.5;
      float h = hash(vec3(id, float(L)));
      star += smoothstep(0.06, 0.0, length(fv)) * step(0.9, h) * (0.5 + 0.5 * sin(T*2.0 + h*30.0));
    }
    acc += pal(0.62) * star * 0.4;

    vec3 c = acc;
    float r = length(uv);
    // Chromatic aberration + cool edge bloom.
    c.r *= 1.0 + 0.08 * r * r; c.b *= 1.0 - 0.05 * r * r;
    c += vec3(0.015, 0.025, 0.05) * r;
    // ACES tonemap, vignette, grain.
    c = aces(c * 1.12);
    c *= smoothstep(1.3, 0.2, r);
    float g = hash(vec3(gl_FragCoord.xy, fract(T))) - 0.5;
    c += g * 0.025;

    gl_FragColor = vec4(c, 1.0);
  }
`;

interface TurbulentFlowProps {
  className?: string;
  maxDpr?: number;
}

export function TurbulentFlow({ className, maxDpr = 2 }: TurbulentFlowProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Device tier: fewer march steps + lower internal resolution on phones and
    // low-core machines, so the volumetric shader stays smooth everywhere.
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const mobile = coarse || window.innerWidth < 820;
    const cores = navigator.hardwareConcurrency || 8;

    // Mobile / touch devices skip the WebGL raymarch entirely — a full-screen
    // volumetric fragment shader saturates the main thread and GPU on weak
    // phones (it was the dominant cost in the mobile Lighthouse profile). The
    // static CSS gradient in Background.module.css is the backdrop there.
    if (mobile) return;

    const steps = cores <= 4 ? 24 : 34;
    const renderScale = 0.62;
    const fragmentShader = `#define STEPS ${steps}\n${fragmentBody}`;

    // Load three.js on demand (desktop only) so it never ships to phones, which
    // returned above. Vite splits import('three') into its own chunk.
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('three').then((THREE) => {
      if (disposed || !mountRef.current) return;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
      } catch {
        return; // no WebGL — the veil + page background stay
      }
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const sizeOf = () => [mount.clientWidth || 1, mount.clientHeight || 1] as const;
    const [initialWidth, initialHeight] = sizeOf();

    const pixelRatio = () => Math.min(window.devicePixelRatio, maxDpr) * renderScale;
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(initialWidth, initialHeight);
    mount.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(initialWidth, initialHeight) },
        u_mouse: { value: new THREE.Vector2(0, 0) },
        u_noise_scale: { value: 4.0 },
        u_distortion: { value: 0.15 },
        u_turbulence: { value: 0.8 },
        u_sharpness: { value: 1.4 },
      },
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
      const [width, height] = sizeOf();
      renderer.setPixelRatio(pixelRatio());
      renderer.setSize(width, height);
      material.uniforms.u_resolution.value.set(width * pixelRatio(), height * pixelRatio());
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    material.uniforms.u_resolution.value.set(initialWidth * pixelRatio(), initialHeight * pixelRatio());

    const dispose = () => {
      resizeObserver.disconnect();
      renderer.domElement.remove();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };

    if (reduced) {
      material.uniforms.u_time.value = 12;
      renderer.render(scene, camera);
      cleanup = dispose;
      return;
    }

    let time = 0;
    let frameId = 0;
    let running = false;
    let onScreen = false;
    // Smoothed pointer for the lens.
    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;

    const tick = () => {
      time += 0.008;
      mx += (tmx - mx) * 0.06;
      my += (tmy - my) * 0.06;
      material.uniforms.u_time.value = time;
      material.uniforms.u_mouse.value.set(mx, my);
      renderer.render(scene, camera);
      if (running) frameId = requestAnimationFrame(tick);
    };

    // GSAP "breathing" — slow drift of the field parameters.
    const timeline = gsap.timeline({ repeat: -1 });
    timeline
      .to(material.uniforms.u_turbulence, { value: 1.2, duration: 6, ease: 'sine.inOut' })
      .to(material.uniforms.u_noise_scale, { value: 6.0, duration: 8, ease: 'power2.inOut' }, 0)
      .to(material.uniforms.u_distortion, { value: 0.24, duration: 7, ease: 'power1.inOut' }, 1)
      .to(material.uniforms.u_sharpness, { value: 1.8, duration: 5, ease: 'power2.inOut' }, 2)
      .to(material.uniforms.u_turbulence, { value: 0.5, duration: 9, ease: 'sine.inOut' })
      .to(material.uniforms.u_noise_scale, { value: 2.8, duration: 10, ease: 'power2.inOut' }, '-=4')
      .to(material.uniforms.u_distortion, { value: 0.1, duration: 8, ease: 'power1.inOut' }, '-=6')
      .to(material.uniforms.u_sharpness, { value: 1.0, duration: 7, ease: 'power2.inOut' }, '-=5');

    const start = () => {
      if (running) return;
      running = true;
      timeline.play();
      frameId = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frameId);
      timeline.pause();
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

    const onMouseMove = (event: MouseEvent) => {
      tmx = event.clientX / window.innerWidth - 0.5;
      tmy = -(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

      cleanup = () => {
        observer.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(frameId);
        timeline.kill();
        dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [reduced, maxDpr]);

  return <div ref={mountRef} className={cx(styles.mount, className)} aria-hidden="true" />;
}
