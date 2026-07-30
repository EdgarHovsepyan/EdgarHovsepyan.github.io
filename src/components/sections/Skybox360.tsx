import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import styles from './Skybox360.module.css';

/**
 * Skybox360 — a sticky-scroll 360° set piece.
 *
 * An equirectangular casino panorama wraps an inverted sphere; scroll drives a
 * damped cinematic pan (lerp with a 0.06 factor, never a raw bind), the cursor
 * adds a parallax nudge, and a gold/cyan particle shell rotates slightly faster
 * than the camera for depth. The name renders as a screen-space plane with a
 * custom ShaderMaterial: simplex-noise dissolve materializes it on entry, a
 * vertex ribbon wave rolls through it, and scroll velocity splits the RGB
 * channels (chromatic aberration) toward cyan/gold.
 *
 * Performance contract: render-gated (off-screen & hidden-tab pause), DPR
 * capped, no antialiasing (soft content), one small texture per tier, additive
 * points instead of lit meshes, full dispose on unmount. Reduced motion gets a
 * static, fully-visible frame.
 */

const NOISE_GLSL = /* glsl */ `
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

const TEXT_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uVelocity;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float amp = 0.055 + uVelocity * 0.55;
    p.z += sin(p.x * 2.4 + uTime * 1.6 + uProgress * 6.2831) * amp;
    p.y += cos(p.x * 1.7 - uTime * 1.1) * amp * 0.35;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const TEXT_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uDissolve;
  uniform float uVelocity;
  uniform vec2 uMouse;
  varying vec2 vUv;
  ${''}
  __NOISE__
  void main() {
    float shift = uVelocity * 0.03 + uMouse.x * 0.004;
    float aCyan = texture2D(uMap, vUv + vec2(shift, 0.0)).a;
    float aGold = texture2D(uMap, vUv - vec2(shift, 0.0)).a;
    float aCore = texture2D(uMap, vUv).a;

    float n = snoise(vUv * vec2(6.0, 3.0) + uTime * 0.08) * 0.5 + 0.5;
    float reveal = smoothstep(uDissolve - 0.22, uDissolve + 0.08, n);

    vec3 cyan = vec3(0.0, 0.824, 1.0);
    vec3 gold = vec3(0.831, 0.686, 0.216);
    vec3 core = mix(vec3(0.97), mix(gold, cyan, vUv.x), 0.35);

    vec3 col = core * aCore + cyan * aCyan * 0.55 + gold * aGold * 0.55;
    float alpha = max(aCore, max(aCyan, aGold) * 0.8) * reveal;

    float edge = smoothstep(0.0, 0.25, abs(n - uDissolve)) * 0.6 + 0.4;
    col += (1.0 - edge) * mix(gold, cyan, n) * 1.6 * reveal;

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

const POINTS_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aHue;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uVel; // scroll energy 0..1 — particles swell and glow with motion
  varying float vHue;
  varying float vTwinkle;
  void main() {
    vHue = aHue;
    vec3 p = position;
    p.y += sin(uTime * 0.35 + aPhase) * 0.6;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vTwinkle = (0.65 + 0.35 * sin(uTime * (1.2 + aPhase * 0.1) + aPhase * 7.0)) * (1.0 + uVel * 1.1);
    gl_PointSize = aSize * uPixelRatio * (26.0 / -mv.z) * (1.0 + uVel * 1.6);
    gl_Position = projectionMatrix * mv;
  }
`;

// Click-burst: a pre-allocated pool of coin-sparks (zero per-frame allocation,
// zero attribute uploads — the burst is entirely uniform-driven). Fired along
// the camera ray on click; ballistic arc with gravity, shrink + fade over life.
const BURST_VERT = /* glsl */ `
  attribute vec3 aDir;
  attribute float aSpeed;
  attribute float aHue;
  attribute float aSize;
  uniform float uBTime;   // seconds since the burst fired
  uniform vec3 uBOrigin;  // burst origin (world space)
  uniform float uPixelRatio;
  varying float vHue;
  varying float vLife;
  void main() {
    vHue = aHue;
    float life = clamp(uBTime / 1.1, 0.0, 1.0);
    vLife = 1.0 - life;
    float ease = 1.0 - pow(1.0 - life, 2.2);   // explosive start, damped tail
    vec3 p = uBOrigin + aDir * (aSpeed * ease * 4.6);
    p.y -= life * life * 2.4;                   // gravity pulls the sparks down
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio * (30.0 / -mv.z) * (0.35 + vLife);
    gl_Position = projectionMatrix * mv;
  }
`;

const BURST_FRAG = /* glsl */ `
  varying float vHue;
  varying float vLife;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float glow = smoothstep(0.5, 0.0, length(c));
    glow *= glow;
    vec3 gold = vec3(1.0, 0.78, 0.28);
    vec3 cyan = vec3(0.25, 0.85, 1.0);
    vec3 col = mix(gold, cyan, step(0.72, vHue));
    float a = glow * vLife;
    gl_FragColor = vec4(col * glow * (0.6 + vLife), a);
  }
`;

const SKY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The panorama as a living medium: liquid melt, velocity-driven chromatic
// dream-split, hue-cycling keyed to journey progress, breathing exposure.
// Three texture taps, no extra passes.
const SKY_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uVel;   // scroll energy 0..1
  uniform float uProg;  // journey progress 0..1
  uniform vec2 uRes;    // drawing-buffer size (device px)
  uniform vec2 uMouse;  // cursor, 0..1 bottom-up
  varying vec2 vUv;
  vec3 hueShift(vec3 c, float a) {
    const vec3 k = vec3(0.57735);
    float ca = cos(a), sa = sin(a);
    return c * ca + cross(k, c) * sa + k * dot(k, c) * (1.0 - ca);
  }
  void main() {
    vec2 uv = vUv;
    // Liquid melt — a faint heat-haze at rest that liquefies under scroll.
    float melt = 0.0014 + uVel * 0.006;
    uv.x += sin(uv.y * 28.0 + uTime * 0.5) * melt;
    uv.y += cos(uv.x * 22.0 - uTime * 0.4) * melt;
    // Dream-split — motion separates the color channels like altered vision.
    float split = 0.0007 + uVel * 0.0045;
    vec3 col;
    col.r = texture2D(uMap, uv + vec2(split, 0.0)).r;
    col.g = texture2D(uMap, uv).g;
    col.b = texture2D(uMap, uv - vec2(split, 0.0)).b;
    // Hue-cycle — the spectrum drifts with the journey and surges with speed.
    col = hueShift(col, sin(uProg * 6.28318) * 0.30 + uTime * 0.02 + uVel * 0.45);
    // Breathing exposure — the slow inhale/exhale that makes it feel alive.
    col *= 1.0 + 0.05 * sin(uTime * 0.55) + uVel * 0.22;
    // Torch — a soft warm glow follows the cursor across the panorama (the
    // "aim" cue of the scene's little game loop).
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 sc = gl_FragCoord.xy / uRes;
    vec2 d = vec2((sc.x - uMouse.x) * aspect, sc.y - uMouse.y);
    col += vec3(1.0, 0.82, 0.45) * exp(-dot(d, d) * 9.0) * 0.13;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const POINTS_FRAG = /* glsl */ `
  varying float vHue;
  varying float vTwinkle;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float glow = smoothstep(0.5, 0.0, d);
    glow *= glow;
    vec3 gold = vec3(0.9, 0.72, 0.25);
    vec3 cyan = vec3(0.1, 0.75, 1.0);
    vec3 col = mix(gold, cyan, vHue);
    gl_FragColor = vec4(col * glow * vTwinkle, glow * vTwinkle * 0.9);
  }
`;

function makeNameTexture(THREE: typeof import('three')): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 2048, 512);
    ctx.font = '900 210px "Saira Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('EDGAR HOVSEPYAN', 1024, 236, 1960);
    ctx.font = '500 54px "JetBrains Mono", monospace';
    ctx.fillText('S E N I O R   G A M E   D E V E L O P E R', 1024, 420, 1700);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

export function Skybox360() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  // Phones skip the WebGL scene; show the real panorama art with a Ken-Burns pan
  // instead (loaded only on mobile so desktop never fetches the mobile texture).
  const [showPoster, setShowPoster] = useState(false);
  useEffect(() => {
    setShowPoster(window.matchMedia('(max-width: 700px)').matches);
  }, []);

  useEffect(() => {
    const rootEl = root.current;
    const host = canvasHost.current;
    if (!rootEl || !host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 700px)').matches;

    // The 360° scene runs on mobile too (lower DPR, the smaller panorama and a
    // reduced particle count below). The poster art shows until it takes over.
    // Load three.js on demand so it is fetched only when the effect runs.
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('three').then((THREE) => {
      if (disposed || !root.current || !canvasHost.current) return;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
        });
      } catch {
        return; // no WebGL: the DOM fallback title stays visible
      }
    rootEl.dataset.webgl = 'on';

    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(72, host.clientWidth / host.clientHeight, 0.1, 120);
    camera.position.set(0, 0, 0.01);

    // --- Skybox: equirect panorama on an inverted sphere -------------------
    const panoUrl = isMobile ? '/assets/skybox/pano-mobile.webp' : '/assets/skybox/pano.webp';
    const panoTex = new THREE.TextureLoader().load(panoUrl, (t) => {
      // RepeatWrapping lets the liquid-melt UV warp cross the seam cleanly.
      t.wrapS = THREE.RepeatWrapping;
      t.needsUpdate = true;
    });
    const skyMat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      uniforms: {
        uMap: { value: panoTex },
        uTime: { value: 0 },
        uVel: { value: 0 },
        uProg: { value: 0 },
        uRes: { value: new THREE.Vector2(host.clientWidth * dpr, host.clientHeight * dpr) },
        uMouse: { value: new THREE.Vector2(0.5, 0.55) },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 48, 32), skyMat);
    scene.add(sky);

    // --- Parallax particle shell (gold/cyan glow points) --------------------
    const COUNT = isMobile ? 120 : 220;
    const pos = new Float32Array(COUNT * 3);
    const size = new Float32Array(COUNT);
    const hue = new Float32Array(COUNT);
    const phase = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = 8 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 26;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * r;
      size[i] = 1.5 + Math.random() * 3.5;
      hue[i] = Math.random() < 0.62 ? 0 : 1; // mostly gold, some cyan
      phase[i] = Math.random() * Math.PI * 2;
    }
    const ptsGeo = new THREE.BufferGeometry();
    ptsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    ptsGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    ptsGeo.setAttribute('aHue', new THREE.BufferAttribute(hue, 1));
    ptsGeo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    const ptsMat = new THREE.ShaderMaterial({
      vertexShader: POINTS_VERT,
      fragmentShader: POINTS_FRAG,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: dpr }, uVel: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(ptsGeo, ptsMat);
    scene.add(points);

    // --- Click-burst pool (the "act" of the scene's game loop) --------------
    // 90 coin-sparks pre-allocated once; firing a burst touches two uniforms
    // and a visibility flag — no allocation, no attribute upload, ever.
    const B_COUNT = 90;
    const bPos = new Float32Array(B_COUNT * 3); // unused, required by Points
    const bDir = new Float32Array(B_COUNT * 3);
    const bSpeed = new Float32Array(B_COUNT);
    const bHue = new Float32Array(B_COUNT);
    const bSize = new Float32Array(B_COUNT);
    for (let i = 0; i < B_COUNT; i++) {
      // random unit sphere, biased slightly upward like a chip toss
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      bDir[i * 3] = r * Math.cos(th);
      bDir[i * 3 + 1] = u * 0.85 + 0.35;
      bDir[i * 3 + 2] = r * Math.sin(th);
      bSpeed[i] = 0.5 + Math.random() * 0.9;
      bHue[i] = Math.random();
      bSize[i] = 1.6 + Math.random() * 2.6;
    }
    const burstGeo = new THREE.BufferGeometry();
    burstGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
    burstGeo.setAttribute('aDir', new THREE.BufferAttribute(bDir, 3));
    burstGeo.setAttribute('aSpeed', new THREE.BufferAttribute(bSpeed, 1));
    burstGeo.setAttribute('aHue', new THREE.BufferAttribute(bHue, 1));
    burstGeo.setAttribute('aSize', new THREE.BufferAttribute(bSize, 1));
    const burstMat = new THREE.ShaderMaterial({
      vertexShader: BURST_VERT,
      fragmentShader: BURST_FRAG,
      uniforms: {
        uBTime: { value: 0 },
        uBOrigin: { value: new THREE.Vector3() },
        uPixelRatio: { value: dpr },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const burst = new THREE.Points(burstGeo, burstMat);
    burst.visible = false;
    burst.frustumCulled = false;
    scene.add(burst);

    let bTime = -1; // <0 = idle
    let clickKick = 0; // impact energy fed into the sky/particles on click
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const fireBurst = (clientX: number, clientY: number) => {
      ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      (burstMat.uniforms.uBOrigin!.value as THREE.Vector3)
        .copy(raycaster.ray.direction)
        .multiplyScalar(9);
      bTime = 0;
      burst.visible = true;
      clickKick = 1;
    };
    const onStageClick = (e: MouseEvent) => {
      if (!inView) return;
      fireBurst(e.clientX, e.clientY);
    };
    rootEl.addEventListener('click', onStageClick);

    // --- The name: camera-attached plane with dissolve/aberration/wave ------
    const nameTex = makeNameTexture(THREE);
    const nameMat = new THREE.ShaderMaterial({
      vertexShader: TEXT_VERT,
      fragmentShader: TEXT_FRAG.replace('__NOISE__', NOISE_GLSL),
      uniforms: {
        uMap: { value: nameTex },
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uDissolve: { value: 1.2 },
        uVelocity: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      transparent: true,
      depthTest: false,
    });
    const namePlane = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 1.85, 96, 12), nameMat);
    namePlane.position.set(0, 0, -5.4);
    namePlane.renderOrder = 10;
    camera.add(namePlane);
    scene.add(camera);

    // Redraw the name once the display fonts are actually loaded.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        nameTex.image = makeNameTexture(THREE).image;
        nameTex.needsUpdate = true;
      });
    }

    // --- Scroll / mouse state ----------------------------------------------
    let t = 0; // section progress 0..1
    let tSmooth = 0;
    let velocity = 0;
    let roll = 0; // signed, velocity-driven camera bank — cinematic weight
    let yaw = -0.55;
    let pitch = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const readScroll = () => {
      const rect = rootEl.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      t = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
    };
    const onScroll = () => readScroll();
    const onMouse = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMouse, { passive: true });

    const onResize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      (skyMat.uniforms.uRes!.value as THREE.Vector2).set(w * dpr, h * dpr);
    };
    window.addEventListener('resize', onResize);

    // --- Render loop, gated ---------------------------------------------------
    let raf = 0;
    let running = false;
    let inView = false;
    let prevTime = 0;
    const clock = new THREE.Clock();

    const frame = () => {
      const time = clock.getElapsedTime();
      const tPrev = tSmooth;
      tSmooth += (t - tSmooth) * 0.09;
      const dv = (tSmooth - tPrev) * 34; // signed scroll velocity
      velocity += (Math.min(1, Math.abs(dv)) - velocity) * 0.12;
      // Bank into the motion like a drone turning — signed roll, heavily damped.
      roll += (Math.max(-1, Math.min(1, dv)) * 0.05 - roll) * 0.07;

      // damped cinematic pan: ~205° sweep with a gentle pitch arc
      const targetYaw = -0.55 + tSmooth * 3.6 + mouse.x * 0.09;
      const targetPitch = Math.sin(tSmooth * Math.PI) * 0.14 - 0.02 + mouse.y * 0.06;
      yaw += (targetYaw - yaw) * 0.06;
      pitch += (targetPitch - pitch) * 0.06;
      camera.rotation.set(pitch, -yaw, roll, 'YXZ');

      // Game-loop energy: scroll velocity + click impact + the end-of-journey
      // "win ceremony" (a pulsing gold surge as the 205° pan completes) all
      // feed one scalar that every effect listens to.
      const dt2 = Math.min(Math.max(time - prevTime, 0), 0.05);
      prevTime = time;
      clickKick *= 0.9;
      const award =
        THREE.MathUtils.smoothstep(tSmooth, 0.86, 0.985) * (0.55 + 0.45 * Math.sin(time * 2.4));
      const energy = Math.min(1, velocity + clickKick * 0.75 + Math.max(0, award) * 0.6);

      // Burst lifecycle — pure uniform advance; hides itself when spent.
      if (bTime >= 0) {
        bTime += dt2;
        burstMat.uniforms.uBTime!.value = bTime;
        if (bTime > 1.15) {
          bTime = -1;
          burst.visible = false;
        }
      }

      // The "boom": energy punches the FOV like a dolly-zoom — the world bursts
      // wider under fast scrolling, clicks and the ceremony — and the panorama
      // itself gets dragged slightly by the motion.
      const targetFov = 72 + energy * 10;
      if (Math.abs(camera.fov - targetFov) > 0.03) {
        camera.fov += (targetFov - camera.fov) * 0.1;
        camera.updateProjectionMatrix();
      }
      sky.rotation.y += dv * 0.05;

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      // particles: rotate faster than the camera for depth
      points.rotation.y = yaw * 0.35 + time * 0.01;

      // name: materialize 6–38%, hold, dissolve 72–96%
      const inRamp = THREE.MathUtils.smoothstep(tSmooth, 0.06, 0.38);
      const outRamp = 1 - THREE.MathUtils.smoothstep(tSmooth, 0.72, 0.96);
      const visible = Math.min(inRamp, outRamp);
      nameMat.uniforms.uDissolve!.value = 1.05 - visible * 1.15;
      nameMat.uniforms.uTime!.value = time;
      nameMat.uniforms.uProgress!.value = tSmooth;
      nameMat.uniforms.uVelocity!.value = velocity;
      (nameMat.uniforms.uMouse!.value as THREE.Vector2).set(mouse.x, mouse.y);
      ptsMat.uniforms.uTime!.value = time;
      ptsMat.uniforms.uVel!.value = energy;
      skyMat.uniforms.uTime!.value = time;
      skyMat.uniforms.uVel!.value = energy;
      skyMat.uniforms.uProg!.value = tSmooth;
      (skyMat.uniforms.uMouse!.value as THREE.Vector2).set(
        mouse.x * 0.5 + 0.5,
        0.5 - mouse.y * 0.5,
      );

      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      clock.start();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false;
        if (inView && !document.hidden) start();
        else stop();
      },
      { rootMargin: '120px 0px' },
    );
    io.observe(rootEl);
    const onVis = () => {
      if (document.hidden) stop();
      else if (inView) start();
    };
    document.addEventListener('visibilitychange', onVis);

    // Reduced motion: one static, fully-materialized frame.
    if (reduced) {
      readScroll();
      nameMat.uniforms.uDissolve!.value = -0.1;
      camera.rotation.set(0.02, 0.35, 0, 'YXZ');
      renderer.render(scene, camera);
    }

      cleanup = () => {
        stop();
        io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('pointermove', onMouse);
        window.removeEventListener('resize', onResize);
        rootEl.removeEventListener('click', onStageClick);
        burstGeo.dispose();
        burstMat.dispose();
        ptsGeo.dispose();
        ptsMat.dispose();
        nameMat.dispose();
        nameTex.dispose();
        panoTex.dispose();
        sky.geometry.dispose();
        (sky.material as THREE.Material).dispose();
        renderer.dispose();
        host.removeChild(renderer.domElement);
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <section
      ref={root}
      className={styles.section}
      aria-label="360 degree casino floor panorama with the name Edgar Hovsepyan"
    >
      <div ref={stage} className={styles.stage}>
        <div ref={canvasHost} className={styles.canvasHost} />
        {showPoster && (
          <img
            className={styles.poster}
            src="/assets/skybox/pano-mobile.webp"
            alt=""
            aria-hidden="true"
            decoding="async"
            loading="lazy"
          />
        )}
        <div className={styles.fallback} aria-hidden="true">
          <span className={styles.fallbackName}>Edgar Hovsepyan</span>
          <span className={styles.fallbackRole}>Senior Game Developer</span>
        </div>
        <div className={styles.hint} aria-hidden="true">
          360° · scroll · tap for sparks
        </div>
      </div>
    </section>
  );
}
