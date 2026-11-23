import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CapsuleGeometry,
  DirectionalLight,
  Fog,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PMREMGenerator,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TorusKnotGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';
import type { Material, Object3D } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// The page as a flight: one luminous gate per chapter, and between the gates the
// things the work is made of — obsidian dice, gold coins, chrome, cut glass. Scroll moves
// the camera down the corridor; the cursor leans it. Everything is procedural
// (no model downloads) and the whole module is loaded lazily after first paint.

export interface GateSceneOptions {
  mobile: boolean;
  reducedMotion: boolean;
  gates: number;
}

export interface GateScene {
  dispose: () => void;
}

const BLUE = '#4d7cff';
const CYAN = '#22d3ee';
const GOLD = '#e5c07b';
const GATE_SPACING = 9;

/** Small deterministic PRNG so the layout is identical on every visit. */
function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function texture(size: number, height: number, paint: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (context) paint(context);
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

const PIPS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.27, 0.27], [0.73, 0.73]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.28, 0.22], [0.72, 0.22], [0.28, 0.5], [0.72, 0.5], [0.28, 0.78], [0.72, 0.78]],
};

// Obsidian die with inlaid gold pips that carry a faint glow of their own.
function dieMaterials() {
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z — opposite faces sum to 7.
  return [1, 6, 2, 5, 3, 4].map((value) => {
    const paint = (ground: string, pip: string) =>
      texture(256, 256, (c) => {
        c.fillStyle = ground;
        c.fillRect(0, 0, 256, 256);
        c.fillStyle = pip;
        for (const [x, y] of PIPS[value] ?? []) {
          c.beginPath();
          c.arc(x * 256, y * 256, 20, 0, Math.PI * 2);
          c.fill();
        }
      });
    return new MeshPhysicalMaterial({
      map: paint('#090b12', GOLD),
      emissive: new Color(GOLD),
      emissiveMap: paint('#000000', '#ffffff'),
      emissiveIntensity: 0.55,
      roughness: 0.14,
      metalness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    });
  });
}

/** Coin cross-section, revolved: a raised rim around a recessed face. */
const COIN_PROFILE = [
  [0, 0.035], [0.3, 0.035], [0.33, 0.06], [0.44, 0.06], [0.465, 0.035],
  [0.465, -0.035], [0.44, -0.06], [0.33, -0.06], [0.3, -0.035], [0, -0.035],
].map(([x, y]) => new Vector2(x, y));

interface Floater {
  node: Object3D;
  baseY: number;
  spin: [number, number, number];
  bob: number;
  phase: number;
  scale: number;
}

export function createGateScene(mount: HTMLElement, options: GateSceneOptions): GateScene | null {
  const { mobile, reducedMotion, gates } = options;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: 'high-performance' });
  } catch {
    return null; // no WebGL — the CSS backdrop stays on its own
  }
  // No GPU, no corridor: a software rasteriser would turn every frame into
  // main-thread work. `?gl=force` overrides this for review and tests.
  const force = window.location.search.includes('gl=force');
  const context = renderer.getContext();
  const info = context.getExtension('WEBGL_debug_renderer_info');
  const gpu = info ? String(context.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? '') : '';
  if (!force && /swiftshader|llvmpipe|software|basic render/i.test(gpu)) {
    renderer.dispose();
    return null;
  }
  renderer.setClearAlpha(0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  mount.appendChild(renderer.domElement);

  const scene = new Scene();
  scene.fog = new Fog(new Color('#07070a'), 5, 24);

  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.7;

  const key = new DirectionalLight(new Color(BLUE), 3.2);
  key.position.set(-4, 5, 6);
  const rim = new DirectionalLight(new Color(CYAN), 2.2);
  rim.position.set(5, -2, -4);
  const warm = new DirectionalLight(new Color(GOLD), 1.4);
  warm.position.set(2, 4, -6);
  scene.add(key, rim, warm);

  const camera = new PerspectiveCamera(45, 1, 0.1, 60);

  // --- shared geometry + materials -------------------------------------
  // One restrained palette — obsidian, gold, chrome, blue glass — so the pieces
  // read as a set rather than a toy box.
  const geometry = {
    die: new RoundedBoxGeometry(0.8, 0.8, 0.8, 5, 0.13),
    coin: new LatheGeometry(COIN_PROFILE, 72),
    knot: new TorusKnotGeometry(0.34, 0.115, 180, 28),
    gem: new OctahedronGeometry(0.5, 0),
    orb: new SphereGeometry(0.42, 48, 32),
    pill: new CapsuleGeometry(0.2, 0.55, 8, 28),
    gate: new TorusGeometry(3.3, 0.012, 8, 160, Math.PI * 1.72),
    halo: new TorusGeometry(3.42, 0.004, 6, 160),
    // A fat, faint, additive twin of the gate: bloom without a post pass.
    glow: new TorusGeometry(3.3, 0.09, 8, 160, Math.PI * 1.72),
  };
  // Real refraction on desktop; phones get an iridescent solid instead of the
  // extra transmission pass.
  const glass = (flat: boolean) =>
    mobile
      ? new MeshPhysicalMaterial({
          color: '#7ea0ff',
          metalness: 0.2,
          roughness: 0.06,
          iridescence: 1,
          clearcoat: 1,
          flatShading: flat,
        })
      : new MeshPhysicalMaterial({
          color: '#c4d4ff',
          transmission: 1,
          thickness: 1.1,
          ior: 1.52,
          dispersion: 5,
          roughness: 0.03,
          attenuationColor: new Color(BLUE),
          attenuationDistance: 1.4,
          iridescence: 0.5,
          clearcoat: 1,
          flatShading: flat,
        });
  const material = {
    die: dieMaterials(),
    gold: new MeshPhysicalMaterial({ color: '#d7b26a', metalness: 1, roughness: 0.2 }),
    chrome: new MeshPhysicalMaterial({ color: '#dfe6ff', metalness: 1, roughness: 0.05 }),
    gem: glass(true),
    orb: glass(false),
    anodized: new MeshPhysicalMaterial({
      color: '#2747c9',
      metalness: 0.9,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    }),
    gate: new MeshBasicMaterial({ color: BLUE }),
    gateAlt: new MeshBasicMaterial({ color: CYAN }),
    halo: new MeshBasicMaterial({ color: '#9fb8ff', transparent: true, opacity: 0.35 }),
    glow: new MeshBasicMaterial({
      color: BLUE,
      transparent: true,
      opacity: 0.16,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
    glowAlt: new MeshBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.13,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  };

  const makers: (() => Mesh)[] = [
    () => new Mesh(geometry.die, material.die),
    () => new Mesh(geometry.gem, material.gem),
    () => new Mesh(geometry.coin, material.gold),
    () => new Mesh(geometry.knot, material.chrome),
    () => new Mesh(geometry.orb, material.orb),
    () => new Mesh(geometry.pill, material.anodized),
  ];

  // --- corridor ---------------------------------------------------------
  const random = mulberry(20261123);
  const floaters: Floater[] = [];
  const rings: Group[] = [];
  const perGate = mobile ? 2 : 3;
  let made = 0;

  for (let g = 0; g < gates; g++) {
    const z = -g * GATE_SPACING;

    const ring = new Group();
    ring.add(new Mesh(geometry.gate, g % 2 ? material.gateAlt : material.gate));
    ring.add(new Mesh(geometry.halo, material.halo));
    ring.add(new Mesh(geometry.glow, g % 2 ? material.glowAlt : material.glow));
    ring.position.z = z;
    ring.rotation.z = random() * Math.PI * 2;
    scene.add(ring);
    rings.push(ring);

    // The hero keeps its stage clear: the first stretch has the gate only.
    for (let i = 0; g > 0 && i < perGate; i++) {
      const mesh = makers[made++ % makers.length]!();
      // Keep the reading column clear: objects live left and right of centre.
      const side = (g + i) % 2 ? 1 : -1;
      const x = side * (2.6 + random() * 1.8);
      const y = (random() - 0.5) * 3.2;
      mesh.position.set(x, y, z - 1.2 - random() * (GATE_SPACING - 2.4));
      mesh.rotation.set(random() * 6.28, random() * 6.28, random() * 6.28);
      const scale = 0.9 + random() * 0.8;
      mesh.scale.setScalar(scale);
      scene.add(mesh);
      floaters.push({
        node: mesh,
        baseY: y,
        spin: [(random() - 0.5) * 0.5, (random() - 0.5) * 0.6, (random() - 0.5) * 0.3],
        bob: 0.08 + random() * 0.16,
        phase: random() * 6.28,
        scale,
      });
    }
  }

  // Dust: thousands of motes down the whole corridor. They carry the sense of
  // speed and depth for almost nothing — one draw call.
  const dustCount = mobile ? 700 : 2200;
  const dustPosition = new Float32Array(dustCount * 3);
  const length = gates * GATE_SPACING + 8;
  for (let i = 0; i < dustCount; i++) {
    const angle = random() * Math.PI * 2;
    const radius = 0.9 + random() * 5.2;
    dustPosition[i * 3] = Math.cos(angle) * radius;
    dustPosition[i * 3 + 1] = Math.sin(angle) * radius * 0.7;
    dustPosition[i * 3 + 2] = 6 - random() * length;
  }
  const dustGeometry = new BufferGeometry();
  dustGeometry.setAttribute('position', new BufferAttribute(dustPosition, 3));
  const dustMaterial = new PointsMaterial({
    color: '#a9c1ff',
    size: 0.035,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const dust = new Points(dustGeometry, dustMaterial);
  dust.frustumCulled = false;
  scene.add(dust);

  const travel = (gates - 1) * GATE_SPACING + 3;
  const startZ = 5.5;

  // --- sizing -----------------------------------------------------------
  let spread = 1;
  let quality = 1; // drops when frames run long, see loop()
  const resize = () => {
    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.5) * quality);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // Portrait screens are narrow: pull the objects in so they stay in frame.
    spread = Math.min(1, Math.max(0.42, camera.aspect / 1.5));
    for (const floater of floaters) {
      const home = (floater.node.userData.x ??= floater.node.position.x) as number;
      floater.node.position.x = home * spread;
    }
    if (reducedMotion) render(0);
  };

  // --- scroll + pointer ---------------------------------------------------
  let maxScroll = 1;
  const measure = () => {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  };
  let progress = 0;
  let energy = 0;
  let lastY = window.scrollY;
  let pointerX = 0;
  let pointerY = 0;
  let leanX = 0;
  let leanY = 0;
  let clock = 0;

  const render = (dt: number) => {
    const target = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    progress += reducedMotion ? target - progress : (target - progress) * Math.min(1, dt * 5);
    energy *= Math.max(0, 1 - dt * 2.4);
    clock += dt * (1 + energy * 3);

    leanX += (pointerX - leanX) * Math.min(1, dt * 2.5);
    leanY += (pointerY - leanY) * Math.min(1, dt * 2.5);
    camera.position.set(leanX * 0.55, leanY * 0.35, startZ - progress * travel);
    camera.rotation.set(leanY * -0.035, leanX * -0.05, leanX * -0.012);

    for (const floater of floaters) {
      const { node, spin } = floater;
      node.rotation.x += spin[0] * dt * (1 + energy * 4);
      node.rotation.y += spin[1] * dt * (1 + energy * 4);
      node.rotation.z += spin[2] * dt;
      node.position.y = floater.baseY + Math.sin(clock * 0.5 + floater.phase) * floater.bob;
      // Pieces shrink away as the camera reaches them, so nothing ever fills
      // the screen in front of the text.
      const ahead = camera.position.z - node.position.z;
      const near = Math.min(1, Math.max(0, (ahead - 1.6) / 3.2));
      node.scale.setScalar(floater.scale * near * near * (3 - 2 * near));
    }
    for (let i = 0; i < rings.length; i++) {
      rings[i]!.rotation.z += dt * (i % 2 ? -0.05 : 0.05) * (1 + energy * 6);
    }
    dust.rotation.z += dt * 0.012;
    renderer.render(scene, camera);
  };

  let frame = 0;
  let previous = 0;
  let slow = 0;
  const loop = (now: number) => {
    frame = requestAnimationFrame(loop);
    if (document.hidden) {
      previous = 0;
      return;
    }
    const elapsed = previous ? now - previous : 16;
    const dt = Math.min(0.05, elapsed / 1000);
    previous = now;
    // Watchdog: if frames keep running past 34ms, halve the resolution once;
    // if that is not enough either, stop drawing and leave the CSS backdrop.
    slow = elapsed > 34 ? slow + 1 : Math.max(0, slow - 2);
    if (slow > 90) {
      slow = 0;
      if (quality === 1) {
        quality = 0.6;
        resize();
      } else {
        cancelAnimationFrame(frame);
        mount.style.opacity = '0';
        return;
      }
    }
    render(dt);
  };

  const onScroll = () => {
    const y = window.scrollY;
    energy = Math.min(1, energy + Math.abs(y - lastY) / window.innerHeight);
    lastY = y;
    if (reducedMotion) render(0);
  };
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = -(event.clientY / window.innerHeight - 0.5) * 2;
  };

  const mountObserver = new ResizeObserver(resize);
  mountObserver.observe(mount);
  const pageObserver = new ResizeObserver(measure);
  pageObserver.observe(document.body);
  measure();
  resize();
  window.addEventListener('scroll', onScroll, { passive: true });
  if (!reducedMotion) {
    window.addEventListener('pointermove', onPointer, { passive: true });
    frame = requestAnimationFrame(loop);
  } else {
    render(0);
  }

  return {
    dispose() {
      cancelAnimationFrame(frame);
      mountObserver.disconnect();
      pageObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      for (const item of Object.values(geometry)) item.dispose();
      const dispose = (entry: Material) => {
        (entry as MeshPhysicalMaterial).map?.dispose();
        entry.dispose();
      };
      for (const item of Object.values(material)) {
        if (Array.isArray(item)) item.forEach(dispose);
        else dispose(item);
      }
      dustGeometry.dispose();
      dustMaterial.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
