import { useEffect, useRef } from 'react';
import type * as THREE from 'three';
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
 * Scroll mapping: the fall owns ~65% of the scroll travel, the settle the
 * rest; crossing the real impact frame fires the payoff — ground shock ring,
 * gold spark burst, camera shake and (desktop) a bloom spike.
 *
 * Performance contract: everything (three, GLTFLoader, post) lazy-loads when
 * the section approaches; render loop is in-view + tab-visibility gated; DPR
 * capped (mobile 1.5); bloom is desktop-only; reduced motion gets the landed
 * hero pose as a static frame. Full dispose on unmount.
 */

const IMPACT_TIME = 0.62; // s — first ground contact in the clip
const CLIP_END = 1.98;

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

export function AvatarLanding() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootEl = root.current;
    const host = canvasHost.current;
    if (!rootEl || !host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 700px)').matches;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const boot = async () => {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
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
      scene.fog = new THREE.Fog(0x07070a, 6, 13);

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
      const gltf = await new GLTFLoader().loadAsync('/assets/avatar.glb');
      if (disposed) {
        composer?.dispose();
        renderer.dispose();
        return;
      }
      const avatar = gltf.scene;
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
      rootEl.dataset.ready = 'on';

      // --- Scroll choreography ------------------------------------------------
      let t = 0;
      let tSmooth = 0;
      let impactEnergy = 0;
      let fired = false;
      let bTime = -1;
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

        const animTime = timeMap(tSmooth);
        mixer?.setTime(animTime);

        // Impact payoff — fired once per pass over the real landing frame.
        if (animTime >= IMPACT_TIME && !fired) {
          fired = true;
          impactEnergy = 1;
          bTime = 0;
          burst.visible = true;
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

        // Cinematic camera: high wide shot tracking the fall, settling into a
        // low hero angle; micro mouse parallax; impact shake.
        const c = tSmooth;
        const camX = Math.sin(c * 1.4) * 0.55 + mouse.x * 0.12;
        const camY = 2.5 - c * 1.55 + mouse.y * -0.08;
        const camZ = 4.3 - c * 1.5;
        const shake = impactEnergy * 0.06;
        camera.position.set(
          camX + (Math.random() - 0.5) * shake,
          camY + (Math.random() - 0.5) * shake,
          camZ,
        );
        const lookY = 1.85 - c * 0.85;
        camera.lookAt(0, lookY, 0);
        camera.rotation.z += impactEnergy * (Math.random() - 0.5) * 0.02;

        // DOM titles: present through the fall, gone once the hero settles.
        if (titleRef.current) {
          const o = Math.min(1, tSmooth * 6) * (1 - Math.min(1, Math.max(0, (tSmooth - 0.8) * 5)));
          titleRef.current.style.opacity = o.toFixed(3);
          titleRef.current.style.transform = `translateY(${(1 - o) * 14}px)`;
        }

        if (composer && bloom) {
          bloom.strength = 0.32 + impactEnergy * 0.95;
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
        // Static hero pose, fully landed.
        mixer?.setTime(clipDuration);
        camera.position.set(0.3, 1.0, 2.9);
        camera.lookAt(0, 1.0, 0);
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
        bloom?.dispose();
        composer?.dispose();
        groundMat.dispose();
        ground.geometry.dispose();
        avatar.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.geometry.dispose();
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
          <span className={styles.kicker}>Enter the developer</span>
          <span className={styles.big}>THE LANDING</span>
          <span className={styles.ru}>приземление</span>
        </div>
        <div className={styles.hint} aria-hidden="true">
          scroll — he lands
        </div>
      </div>
    </section>
  );
}
