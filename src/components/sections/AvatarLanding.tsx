import { useEffect, useRef } from 'react';
import type * as THREE from 'three';
import { cloneAvatar, loadAvatarModel } from '../../lib/avatarAssets';
import styles from './AvatarLanding.module.css';

/**
 * AvatarLanding — "ПРИЗԵՄЛЕНИЕ": a sticky-scroll cinematic where the Avaturn
 * avatar (public/assets/avatar.glb) performs its superhero landing, scrubbed by
 * scroll.
 *
 * GLB analysis (baked into the choreography below):
 *   clip 'Animation', 2.00s, 52 joint rotations + Hips translation;
 *   airborne at 2.52m → first touch t≈0.60s → deepest crouch t≈0.633s →
 *   hero-pose settle to 2.0s. Character height 1.85m, origin at feet.
 *
 * Scroll choreography (four beats over the sticky travel):
 *   1. the fall + superhero landing (clip scrub; impact fires shock ring,
 *      gold burst, camera shake, bloom spike)
 *   2. hero settle
 *   3. camera push-in on the head — the glasses frames pulse emissive
 *   4. final wide zoom-out — the character stays fully visible and centered
 *      while surface-sampled energy dots shed off him and rain down.
 *
 * Performance contract: everything (three, GLTFLoader, post) lazy-loads when
 * the section approaches; render loop is in-view + tab-visibility gated; DPR
 * capped (mobile 1.5); bloom is desktop-only; reduced motion gets the landed
 * hero pose as a static frame. Full dispose on unmount.
 */

const IMPACT_TIME = 0.62; // s — first ground contact in the clip
const CLIP_END = 1.98;
// Overall scroll phases: landing → head close-up (the frames) → dissolve+rain.
const PHASE_CLIP = 0.6; // scroll fraction owned by the landing animation
const PHASE_CLOSE = 0.74; // close-up fully framed here; dissolve starts after
const PHASE_END = 0.96; // zoom-out fully wide here — never clipped by the exit

const GROUND_FRAG = /* glsl */ `
  uniform float uImpact; // 1 at impact, decays to 0
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    // soft contact shadow
    float shadow = smoothstep(0.55, 0.05, r) * 0.85;
    // expanding gold shock ring on impact
    float ringR = (1.0 - uImpact) * 0.9 + 0.08;
    float ring = exp(-pow((r - ringR) * 14.0, 2.0)) * uImpact;
    vec3 col = vec3(0.0);
    col += vec3(1.0, 0.78, 0.35) * ring * 1.6;
    float alpha = max(shadow, ring * 0.9);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha * 0.9);
  }
`;

const RAIN_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vFade;
  void main() {
    vec3 p = position;
    // endless fall: wrap each drop over a 6m column at its own speed
    float speed = 1.6 + aSeed * 2.2;
    p.y = 5.5 - mod(aSeed * 37.0 + uTime * speed, 6.0);
    vFade = 0.25 + 0.5 * fract(aSeed * 7.31);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (1.4 + aSeed * 1.8) * uPixelRatio * (18.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const RAIN_FRAG = /* glsl */ `
  varying float vFade;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    // vertical streak, not a dot
    float streak = smoothstep(0.5, 0.0, abs(c.x) * 3.2) * smoothstep(0.5, 0.1, abs(c.y));
    gl_FragColor = vec4(vec3(0.55, 0.75, 1.0), streak * vFade * 0.5);
  }
`;

const BURST_VERT = /* glsl */ `
  attribute vec3 aDir;
  attribute float aSpeed;
  uniform float uBTime;
  uniform float uPixelRatio;
  varying float vLife;
  void main() {
    float life = clamp(uBTime / 0.9, 0.0, 1.0);
    vLife = 1.0 - life;
    float ease = 1.0 - pow(1.0 - life, 2.4);
    vec3 p = vec3(0.0, 0.06, 0.0) + aDir * (aSpeed * ease * 2.6);
    p.y += aDir.y * 0.4 * ease - life * life * 1.1;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (2.2 + aSpeed) * uPixelRatio * (20.0 / -mv.z) * (0.3 + vLife);
    gl_Position = projectionMatrix * mv;
  }
`;

const BURST_FRAG = /* glsl */ `
  varying float vLife;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float glow = smoothstep(0.5, 0.0, length(c));
    glow *= glow;
    gl_FragColor = vec4(vec3(1.0, 0.8, 0.34) * glow * (0.5 + vLife), glow * vLife);
  }
`;

const DOTS_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uDissolve; // 0 = solid model, 1 = fully rained away
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vA;
  varying vec3 vCol;
  void main() {
    vec3 p = position;
    // Head releases first, feet last; every dot staggered by its own seed.
    float head = clamp(position.y / 1.85, 0.0, 1.0);
    float form = clamp(uDissolve * 1.6 - (1.0 - head) * 0.35 - aSeed * 0.2, 0.0, 1.0);
    // brief shimmer off the surface, then rain straight down — with a
    // continuous time-driven drift so the dots always feel alive.
    p.x += sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 43.0) * form * 0.07;
    p.z += cos(uTime * (1.3 + aSeed) + aSeed * 17.0) * form * 0.07;
    float fall = pow(max(form - 0.22, 0.0) / 0.78, 1.6) * (2.8 + aSeed * 1.6);
    fall += form * (0.22 + 0.18 * sin(uTime * 0.9 + aSeed * 31.0));
    p.y = max(p.y - fall, 0.015);
    vA = smoothstep(0.0, 0.05, uDissolve) * smoothstep(0.015, 0.12, p.y) * (1.0 - form * 0.55);
    vCol = mix(vec3(0.62, 0.8, 1.0), vec3(1.0, 0.8, 0.42), smoothstep(0.72, 0.85, fract(aSeed * 3.71)));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (1.5 + aSeed * 1.7) * uPixelRatio * (8.0 / -mv.z) * (1.0 - form * 0.35);
    gl_Position = projectionMatrix * mv;
  }
`;

const DOTS_FRAG = /* glsl */ `
  varying float vA;
  varying vec3 vCol;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float glow = smoothstep(0.5, 0.05, length(c));
    gl_FragColor = vec4(vCol * glow * 0.9, glow * vA * 0.38);
  }
`;

export function AvatarLanding() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootEl = root.current;
    const host = canvasHost.current;
    if (!rootEl || !host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 700px)').matches;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    // Warm the model into the HTTP cache while the page is idle, so the scene
    // is ready the moment the visitor reaches it. Skipped when the visitor
    // asked to save data; the lazy boot below still works either way.
    let warmT = 0;
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    if (!saveData) {
      const warm = () => void fetch('/assets/avatar.glb').catch(() => {});
      const idle = (
        window as unknown as {
          requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
        }
      ).requestIdleCallback;
      if (idle) idle(warm, { timeout: 6000 });
      else warmT = window.setTimeout(warm, 2500);
    }

    const boot = async () => {
      const THREE = await import('three');
      if (disposed || !root.current || !canvasHost.current) return;
      // Bloom is desktop-only: three post modules load only where they'll run.
      let post:
        | {
            EffectComposer: typeof import('three/examples/jsm/postprocessing/EffectComposer.js').EffectComposer;
            RenderPass: typeof import('three/examples/jsm/postprocessing/RenderPass.js').RenderPass;
            UnrealBloomPass: typeof import('three/examples/jsm/postprocessing/UnrealBloomPass.js').UnrealBloomPass;
          }
        | undefined;
      if (!isMobile) {
        const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }] = await Promise.all([
          import('three/examples/jsm/postprocessing/EffectComposer.js'),
          import('three/examples/jsm/postprocessing/RenderPass.js'),
          import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
        ]);
        post = { EffectComposer, RenderPass, UnrealBloomPass };
      }
      if (disposed || !root.current || !canvasHost.current) return;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: !isMobile,
          alpha: false,
          powerPreference: 'high-performance',
        });
      } catch {
        return; // DOM fallback (titles on gradient) stays
      }
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.75);
      renderer.setPixelRatio(dpr);
      renderer.setSize(host.clientWidth, host.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      host.appendChild(renderer.domElement);
      rootEl.dataset.webgl = 'on';

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x07070a);
      // Far fog only — the finale camera sits ~6–11m out (portrait fit) and
      // the character must stay crisp through the whole zoom-out.
      scene.fog = new THREE.Fog(0x07070a, 9, 24);

      const camera = new THREE.PerspectiveCamera(
        42,
        host.clientWidth / host.clientHeight,
        0.1,
        40,
      );

      // Desktop bloom: rim highlights and the gold burst glow; strength spikes
      // on impact so the landing frame visibly blooms.
      let composer: InstanceType<NonNullable<typeof post>['EffectComposer']> | undefined;
      let bloom: InstanceType<NonNullable<typeof post>['UnrealBloomPass']> | undefined;
      if (post) {
        composer = new post.EffectComposer(renderer);
        composer.setPixelRatio(dpr);
        composer.setSize(host.clientWidth, host.clientHeight);
        composer.addPass(new post.RenderPass(scene, camera));
        bloom = new post.UnrealBloomPass(
          new THREE.Vector2(host.clientWidth, host.clientHeight),
          0.32, // strength (base)
          0.55, // radius
          0.72, // threshold — only true highlights bloom
        );
        composer.addPass(bloom);
      }

      // Cinematic three-point light: cool key, gold + cyan rims (brand palette).
      scene.add(new THREE.HemisphereLight(0x35406a, 0x0a0a10, 1.1));
      const key = new THREE.DirectionalLight(0xdfe8ff, 2.4);
      key.position.set(2.2, 3.4, 2.6);
      scene.add(key);
      const rimGold = new THREE.DirectionalLight(0xe5c07b, 1.6);
      rimGold.position.set(-2.6, 1.6, -2.2);
      scene.add(rimGold);
      const rimCyan = new THREE.DirectionalLight(0x22d3ee, 1.1);
      rimCyan.position.set(2.4, 0.8, -2.6);
      scene.add(rimCyan);

      // Ground: contact shadow + impact shock ring.
      const groundMat = new THREE.ShaderMaterial({
        vertexShader:
          'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader: GROUND_FRAG,
        uniforms: { uImpact: { value: 0 } },
        transparent: true,
        depthWrite: false,
      });
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0.001;
      scene.add(ground);

      // Ambient rain streaks (shader-driven, endless wrap — zero JS per frame).
      const R_COUNT = isMobile ? 70 : 150;
      const rPos = new Float32Array(R_COUNT * 3);
      const rSeed = new Float32Array(R_COUNT);
      for (let i = 0; i < R_COUNT; i++) {
        rPos[i * 3] = (Math.random() - 0.5) * 7;
        rPos[i * 3 + 1] = 0;
        rPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 0.5;
        rSeed[i] = Math.random();
      }
      const rainGeo = new THREE.BufferGeometry();
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
      rainGeo.setAttribute('aSeed', new THREE.BufferAttribute(rSeed, 1));
      const rainMat = new THREE.ShaderMaterial({
        vertexShader: RAIN_VERT,
        fragmentShader: RAIN_FRAG,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: dpr } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const rain = new THREE.Points(rainGeo, rainMat);
      rain.frustumCulled = false;
      scene.add(rain);

      // Impact spark burst — pooled once, uniform-driven (zero-GC).
      const B_COUNT = 70;
      const bPos = new Float32Array(B_COUNT * 3);
      const bDir = new Float32Array(B_COUNT * 3);
      const bSpeed = new Float32Array(B_COUNT);
      for (let i = 0; i < B_COUNT; i++) {
        const th = Math.random() * Math.PI * 2;
        bDir[i * 3] = Math.cos(th);
        bDir[i * 3 + 1] = 0.25 + Math.random() * 0.7;
        bDir[i * 3 + 2] = Math.sin(th);
        bSpeed[i] = 0.5 + Math.random() * 0.9;
      }
      const burstGeo = new THREE.BufferGeometry();
      burstGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
      burstGeo.setAttribute('aDir', new THREE.BufferAttribute(bDir, 3));
      burstGeo.setAttribute('aSpeed', new THREE.BufferAttribute(bSpeed, 1));
      const burstMat = new THREE.ShaderMaterial({
        vertexShader: BURST_VERT,
        fragmentShader: BURST_FRAG,
        uniforms: { uBTime: { value: 0 }, uPixelRatio: { value: dpr } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const burst = new THREE.Points(burstGeo, burstMat);
      burst.visible = false;
      burst.frustumCulled = false;
      scene.add(burst);

      // The avatar.
      let mixer: THREE.AnimationMixer | undefined;
      let clipDuration = CLIP_END;
      const gltf = await loadAvatarModel((loaded, total) => {
        if (hintRef.current) {
          const pct = Math.min(99, Math.round((loaded / total) * 100));
          hintRef.current.textContent = `materialising · ${pct}%`;
        }
      });
      const avatar = await cloneAvatar(gltf.scene);
      if (disposed) {
        composer?.dispose();
        renderer.dispose();
        return;
      }
      avatar.traverse((o) => {
        // Skinned bounds lag the animation — never let culling hide the body.
        if ((o as THREE.SkinnedMesh).isSkinnedMesh) o.frustumCulled = false;
      });
      scene.add(avatar);
      const clip = gltf.animations[0];
      if (clip) {
        clipDuration = Math.min(clip.duration - 0.02, CLIP_END);
        mixer = new THREE.AnimationMixer(avatar);
        mixer.clipAction(clip).play();
        mixer.setTime(0);
      }

      // Pose the skeleton at the landed hero frame and sample the skinned
      // surface once — these points are the dissolve/rain targets.
      if (mixer) {
        mixer.setTime(clipDuration);
        avatar.updateMatrixWorld(true);
      }
      const targets: number[] = [];
      const seeds: number[] = [];
      const dotBudget = isMobile ? 4500 : 9000;
      const skinned: THREE.SkinnedMesh[] = [];
      avatar.traverse((o) => {
        if ((o as THREE.SkinnedMesh).isSkinnedMesh) skinned.push(o as THREE.SkinnedMesh);
      });
      const totalVerts = skinned.reduce((n, m) => n + m.geometry.attributes.position!.count, 0);
      const sampleStep = Math.max(1, Math.round(totalVerts / dotBudget));
      const sv = new THREE.Vector3();
      for (const m of skinned) {
        const posAttr = m.geometry.attributes.position!;
        for (let i = 0; i < posAttr.count; i += sampleStep) {
          sv.fromBufferAttribute(posAttr, i);
          m.applyBoneTransform(i, sv);
          sv.applyMatrix4(m.matrixWorld);
          targets.push(sv.x, sv.y, sv.z);
          seeds.push(Math.random());
        }
      }
      if (mixer) mixer.setTime(0);
      avatar.updateMatrixWorld(true);
      const dotsGeo = new THREE.BufferGeometry();
      dotsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(targets), 3));
      dotsGeo.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(seeds), 1));
      const dotsMat = new THREE.ShaderMaterial({
        vertexShader: DOTS_VERT,
        fragmentShader: DOTS_FRAG,
        uniforms: { uDissolve: { value: 0 }, uTime: { value: 0 }, uPixelRatio: { value: dpr } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const dots = new THREE.Points(dotsGeo, dotsMat);
      dots.visible = false;
      dots.frustumCulled = false;
      scene.add(dots);

      // The glasses frames get a soft emissive pulse during the head close-up.
      const glassesMats: THREE.MeshStandardMaterial[] = [];
      avatar.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshStandardMaterial[];
        if (o.name.toLowerCase().includes('glasses')) glassesMats.push(...mats);
      });
      for (const gm of glassesMats) if (gm.emissive) gm.emissive.set(0x9fd4ff);

      // Camera-framing anchors. The clip has ROOT MOTION — the Hips travel
      // from (−0.04, 2.52, 1.05) to (−0.32, 0.41, 1.65) — so nothing may
      // assume he is at the origin: camera, ground FX and burst all follow
      // the live bone world positions every frame.
      const hipsNode = avatar.getObjectByName('Hips');
      const headNode = avatar.getObjectByName('Head');
      const hipsV = new THREE.Vector3(0, 1, 0);
      const headV = new THREE.Vector3(0, 1.6, 0);
      const lookV = new THREE.Vector3();

      rootEl.dataset.ready = 'on';
      if (hintRef.current) hintRef.current.textContent = 'scroll — he lands';

      // --- Scroll choreography ------------------------------------------------
      let t = 0;
      let tSmooth = 0;
      let impactEnergy = 0;
      let fired = false;
      let bTime = -1;
      let lastAnim = -1;
      let lastTitleO = -1;
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
        composer?.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      // The fall owns 65% of the scroll; the hero settle the rest.
      const timeMap = (p: number) =>
        p < 0.65 ? (p / 0.65) * IMPACT_TIME : IMPACT_TIME + ((p - 0.65) / 0.35) * (clipDuration - IMPACT_TIME);

      let raf = 0;
      let running = false;
      let inView = false;
      let prevNow = 0;
      const clock = new THREE.Clock();

      const frame = () => {
        const now = clock.getElapsedTime();
        const dt = Math.min(Math.max(now - prevNow, 0), 0.05);
        prevNow = now;
        tSmooth += (t - tSmooth) * 0.1;
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;

        const u = tSmooth;
        const clipPhase = Math.min(1, u / PHASE_CLIP);
        const closeX = Math.min(1, Math.max(0, (u - PHASE_CLIP) / (PHASE_CLOSE - PHASE_CLIP)));
        const closeB = closeX * closeX * (3 - 2 * closeX); // head close-up blend
        const dissolve = Math.min(1, Math.max(0, (u - PHASE_CLOSE) / (PHASE_END - PHASE_CLOSE)));

        const animTime = timeMap(clipPhase);
        // Only resample the clip when the scrub actually moved — while the
        // scroll idles, the skeleton costs nothing.
        if (mixer && Math.abs(animTime - lastAnim) > 0.0004) {
          mixer.setTime(animTime);
          lastAnim = animTime;
        }

        // Live character anchors (world space, root motion included).
        if (hipsNode) hipsNode.getWorldPosition(hipsV);
        if (headNode) headNode.getWorldPosition(headV);
        // Grounded FX follow him: contact shadow + shock ring under his feet.
        ground.position.set(hipsV.x, 0.001, hipsV.z);

        // Impact payoff — fired once per pass over the real landing frame,
        // at his actual floor position.
        if (animTime >= IMPACT_TIME && !fired) {
          fired = true;
          impactEnergy = 1;
          bTime = 0;
          burst.visible = true;
          burst.position.set(hipsV.x, 0, hipsV.z);
        }
        if (animTime < IMPACT_TIME - 0.08) fired = false;
        impactEnergy *= 0.93;
        groundMat.uniforms.uImpact!.value = impactEnergy;
        if (bTime >= 0) {
          bTime += dt;
          burstMat.uniforms.uBTime!.value = bTime;
          if (bTime > 0.95) {
            bTime = -1;
            burst.visible = false;
          }
        }
        rainMat.uniforms.uTime!.value = now;

        // Cinematic camera — fully RELATIVE to the character. The look target
        // blends body-center → head (close-up) → body (finale), and the
        // camera sits at a beat-blended offset FROM that target, so he is
        // dead-center at every scroll position regardless of root motion.
        const c = clipPhase;
        lookV.set(hipsV.x, hipsV.y + 0.12, hipsV.z);
        lookV.lerp(headV, closeB);
        lookV.x += (hipsV.x - lookV.x) * dissolve;
        lookV.y += (hipsV.y + 0.25 - lookV.y) * dissolve;
        lookV.z += (hipsV.z - lookV.z) * dissolve;

        let offX = Math.sin(c * 1.4) * 0.55 + mouse.x * 0.12;
        let offY = 0.75 - c * 0.55 + mouse.y * -0.08;
        let offZ = 4.2 - c * 1.2;
        // Head close-up beat (the glasses moment) — in FRONT of his face,
        // slightly below head level since the hero pose tilts the head down.
        offX += (0.32 + mouse.x * 0.06 - offX) * closeB;
        offY += (-0.12 - offY) * closeB;
        offZ += (1.35 - offZ) * closeB;
        // Final beat: pure zoom-out — full body, never hidden.
        offX += (0.3 + mouse.x * 0.1 - offX) * dissolve;
        offY += (0.45 - offY) * dissolve;
        offZ += (6.2 - offZ) * dissolve;
        // Portrait fit: on narrow screens the horizontal frustum shrinks, so
        // widen the shot with distance — he never crops at the sides.
        const fit = Math.min(2.1, Math.max(1, 1.05 / Math.max(camera.aspect, 0.4)));
        offX *= fit;
        offZ *= fit;
        camera.fov = 42 - closeB * 8 + dissolve * 14;
        camera.updateProjectionMatrix();
        const shake = impactEnergy * 0.06;
        camera.position.set(
          lookV.x + offX + (Math.random() - 0.5) * shake,
          lookV.y + offY + (Math.random() - 0.5) * shake,
          lookV.z + offZ,
        );
        camera.lookAt(lookV);
        camera.rotation.z += impactEnergy * (Math.random() - 0.5) * 0.02;

        // Glasses glow through the close-up. The character himself is never
        // hidden — the dots are an energy aura shedding off his surface.
        const glow = closeB * (0.45 + 0.25 * Math.sin(now * 2.2)) * (1 - dissolve);
        for (const gm of glassesMats) gm.emissiveIntensity = glow;
        dots.visible = dissolve > 0.001;
        dotsMat.uniforms.uDissolve!.value = dissolve;
        dotsMat.uniforms.uTime!.value = now;

        // DOM titles: present through the fall, gone before the close-up.
        // Style writes are skipped while the value is stable.
        if (titleRef.current) {
          const o = Math.min(1, u * 6) * (1 - Math.min(1, Math.max(0, (u - 0.5) * 5)));
          if (Math.abs(o - lastTitleO) > 0.002) {
            lastTitleO = o;
            titleRef.current.style.opacity = o.toFixed(3);
            titleRef.current.style.transform = `translateY(${(1 - o) * 14}px)`;
          }
        }

        if (composer && bloom) {
          bloom.strength = 0.32 + impactEnergy * 0.95 + closeB * 0.18 + dissolve * 0.12;
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
        if (running) raf = requestAnimationFrame(frame);
      };

      const start = () => {
        if (running || reduced) return;
        running = true;
        clock.start();
        prevNow = clock.getElapsedTime();
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

      if (reduced) {
        // Static hero pose, fully landed — framed on his real position.
        mixer?.setTime(clipDuration);
        avatar.updateMatrixWorld(true);
        if (hipsNode) hipsNode.getWorldPosition(hipsV);
        ground.position.set(hipsV.x, 0.001, hipsV.z);
        camera.position.set(hipsV.x + 0.35, hipsV.y + 0.6, hipsV.z + 3.2);
        camera.lookAt(hipsV.x, hipsV.y + 0.3, hipsV.z);
        if (titleRef.current) titleRef.current.style.opacity = '1';
        if (composer) composer.render();
        else renderer.render(scene, camera);
      }

      cleanup = () => {
        stop();
        io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('pointermove', onMouse);
        window.removeEventListener('resize', onResize);
        rainGeo.dispose();
        rainMat.dispose();
        burstGeo.dispose();
        burstMat.dispose();
        dotsGeo.dispose();
        dotsMat.dispose();
        bloom?.dispose();
        composer?.dispose();
        groundMat.dispose();
        ground.geometry.dispose();
        // Materials are per-clone — dispose them; geometry and textures are
        // shared through the module cache and must survive for other scenes.
        avatar.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            const mats = Array.isArray(m.material) ? m.material : [m.material];
            mats.forEach((mat) => mat.dispose());
          }
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    // Lazy boot: three + loader + 5MB model only when the section approaches.
    const bootIo = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          bootIo.disconnect();
          void boot();
        }
      },
      { rootMargin: '160% 0px' },
    );
    bootIo.observe(rootEl);

    return () => {
      disposed = true;
      clearTimeout(warmT);
      bootIo.disconnect();
      cleanup?.();
    };
  }, []);

  return (
    <section
      ref={root}
      className={styles.section}
      aria-label="Cinematic 3D avatar of Edgar Hovsepyan performing a superhero landing"
    >
      <div ref={stage} className={styles.stage}>
        <div ref={canvasHost} className={styles.canvasHost} />
        <div ref={titleRef} className={styles.titles} aria-hidden="true">
          <span className={styles.kicker}>Enter the visual technologist</span>
          <span className={styles.big}>THE LANDING</span>
          <span className={styles.sub}>developer power</span>
        </div>
        <div ref={hintRef} className={styles.hint} aria-hidden="true">
          scroll — he lands
        </div>
      </div>
    </section>
  );
}
