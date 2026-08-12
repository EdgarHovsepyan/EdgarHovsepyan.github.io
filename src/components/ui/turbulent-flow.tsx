import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cx } from '@/utils/cx';
import styles from './turbulent-flow.module.css';

// Raw WebGL — no three.js. The background is one fullscreen triangle and a
// fragment program; hand-rolling the ~40 lines of GL plumbing removes the
// entire 190KB-gzip three chunk from the site.
const vertexShader = `
  attribute vec2 a_pos;
  varying vec2 vUv;
  void main() {
    vUv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
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
  uniform float u_vel;         // smoothed scroll energy 0..1 — the field reacts to it
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
      // Scroll energy stirs the medium: extra domain-warp while the user moves.
      vec3 q = p + (u_distortion * 6.0 + u_vel * 3.2) * (w - 0.5);
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
    // Chromatic aberration + cool edge bloom; scroll energy surges the split
    // (a subtle "speed" cue at the frame edges while the page is in motion).
    float ab = 0.08 + u_vel * 0.22;
    c.r *= 1.0 + ab * r * r; c.b *= 1.0 - (0.05 + u_vel * 0.12) * r * r;
    c += vec3(0.015, 0.025, 0.05) * r * (1.0 + u_vel * 0.8);
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

const UNIFORM_NAMES = [
  'u_time',
  'u_resolution',
  'u_mouse',
  'u_noise_scale',
  'u_distortion',
  'u_turbulence',
  'u_sharpness',
  'u_vel',
] as const;

export function TurbulentFlow({ className, maxDpr = 2 }: TurbulentFlowProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Device tier: fewer march steps + lower internal resolution on phones and
    // low-core machines, so the volumetric shader stays smooth everywhere. The
    // CSS aurora paints instantly underneath while the program compiles.
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const mobile = coarse || window.innerWidth < 820;
    const cores = navigator.hardwareConcurrency || 8;
    const steps = mobile ? 12 : cores <= 4 ? 24 : 34;
    const renderScale = mobile ? 0.5 : 0.62;
    const minFrameMs = mobile ? 33 : 16;

    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    }) ?? undefined) as WebGLRenderingContext | undefined;
    if (!gl) return; // no WebGL — the veil + page background stay

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, `#define STEPS ${steps}\n${fragmentBody}`));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // One fullscreen triangle — fewer helper invocations than a quad.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const loc = {} as Record<(typeof UNIFORM_NAMES)[number], WebGLUniformLocation | null>;
    for (const name of UNIFORM_NAMES) loc[name] = gl.getUniformLocation(program, name);

    // GSAP animates these plain {value} holders exactly as it did the three
    // uniforms; the tick uploads them each frame.
    const u = {
      noiseScale: { value: 4.0 },
      distortion: { value: 0.15 },
      turbulence: { value: 0.8 },
      sharpness: { value: 1.4 },
    };

    canvas.className = styles.canvas ?? '';
    mount.appendChild(canvas);

    const pixelRatio = () => Math.min(window.devicePixelRatio, maxDpr) * renderScale;
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      const pr = pixelRatio();
      canvas.width = Math.max(1, Math.round(w * pr));
      canvas.height = Math.max(1, Math.round(h * pr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(loc.u_resolution, canvas.width, canvas.height);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const draw = () => {
      gl.uniform1f(loc.u_noise_scale, u.noiseScale.value);
      gl.uniform1f(loc.u_distortion, u.distortion.value);
      gl.uniform1f(loc.u_turbulence, u.turbulence.value);
      gl.uniform1f(loc.u_sharpness, u.sharpness.value);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const dispose = () => {
      resizeObserver.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };

    if (reduced) {
      gl.uniform1f(loc.u_time, 12);
      gl.uniform2f(loc.u_mouse, 0, 0);
      gl.uniform1f(loc.u_vel, 0);
      draw();
      return dispose;
    }

    let time = 0;
    let frameId = 0;
    // Smoothed pointer for the lens.
    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    let lastFrame = 0;
    // Scroll energy: impulses from the scroll handler, eased + bled off in the
    // tick, fed to the shader as u_vel. One float — zero extra GPU cost.
    let velImpulse = 0;
    let vel = 0;
    let lastScrollY = window.scrollY;

    // Self-scheduling loop — always runs while mounted; it only skips the render
    // when the tab is hidden or within the frame-rate cap. No external gating
    // (observer / running flag) that could ever freeze it.
    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      if (document.hidden) return;
      if (now - lastFrame < minFrameMs) return; // frame-rate cap (~30fps on mobile)
      lastFrame = now;
      // Scroll energy: ease toward the latest impulse, then bleed the impulse
      // away so the field settles ~1s after the user stops scrolling.
      vel += (velImpulse - vel) * 0.1;
      velImpulse *= 0.92;
      // Time flows faster while scrolling — the nebula visibly "stirs".
      time += 0.008 * (minFrameMs / 16.67) * (1 + vel * 2.2);
      mx += (tmx - mx) * 0.06;
      my += (tmy - my) * 0.06;
      gl.uniform1f(loc.u_time, time);
      gl.uniform2f(loc.u_mouse, mx, my);
      gl.uniform1f(loc.u_vel, vel);
      draw();
    };

    // GSAP "breathing" — slow drift of the field parameters.
    const timeline = gsap.timeline({ repeat: -1 });
    timeline
      .to(u.turbulence, { value: 1.2, duration: 6, ease: 'sine.inOut' })
      .to(u.noiseScale, { value: 6.0, duration: 8, ease: 'power2.inOut' }, 0)
      .to(u.distortion, { value: 0.24, duration: 7, ease: 'power1.inOut' }, 1)
      .to(u.sharpness, { value: 1.8, duration: 5, ease: 'power2.inOut' }, 2)
      .to(u.turbulence, { value: 0.5, duration: 9, ease: 'sine.inOut' })
      .to(u.noiseScale, { value: 2.8, duration: 10, ease: 'power2.inOut' }, '-=4')
      .to(u.distortion, { value: 0.1, duration: 8, ease: 'power1.inOut' }, '-=6')
      .to(u.sharpness, { value: 1.0, duration: 7, ease: 'power2.inOut' }, '-=5');

    const onMouseMove = (event: MouseEvent) => {
      tmx = event.clientX / window.innerWidth - 0.5;
      tmy = -(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onScroll = () => {
      const y = window.scrollY;
      // Normalize: a fast flick ≈ one viewport per second → impulse ~1.
      velImpulse = Math.min(1, velImpulse + Math.abs(y - lastScrollY) / window.innerHeight);
      lastScrollY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Start the loop and the GSAP "breathing" immediately and unconditionally.
    timeline.play();
    frameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frameId);
      timeline.kill();
      dispose();
    };
  }, [reduced, maxDpr]);

  return <div ref={mountRef} className={cx(styles.mount, className)} aria-hidden="true" />;
}
