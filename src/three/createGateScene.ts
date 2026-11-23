import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CapsuleGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Fog,
  Group,
  HalfFloatType,
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
  Shape,
  ShapeGeometry,
  TorusGeometry,
  TorusKnotGeometry,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";
import type { Material, Object3D } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// The page as a flight: one luminous gate per chapter, and between the gates the
// things the work is made of — black-and-gold cards, obsidian dice, coins, glass. Scroll moves
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

const BLUE = "#4d7cff";
const CYAN = "#22d3ee";
const GOLD = "#e5c07b";
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

function texture(
  size: number,
  height: number,
  paint: (c: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) paint(context);
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

const PIPS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [
    [0.27, 0.27],
    [0.73, 0.73],
  ],
  3: [
    [0.25, 0.25],
    [0.5, 0.5],
    [0.75, 0.75],
  ],
  4: [
    [0.27, 0.27],
    [0.73, 0.27],
    [0.27, 0.73],
    [0.73, 0.73],
  ],
  5: [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.5, 0.5],
    [0.25, 0.75],
    [0.75, 0.75],
  ],
  6: [
    [0.28, 0.22],
    [0.72, 0.22],
    [0.28, 0.5],
    [0.72, 0.5],
    [0.28, 0.78],
    [0.72, 0.78],
  ],
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
      map: paint("#090b12", GOLD),
      emissive: new Color(GOLD),
      emissiveMap: paint("#000000", "#ffffff"),
      emissiveIntensity: 0.55,
      roughness: 0.14,
      metalness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    });
  });
}

/** Award cup cross-section: foot, stem with a knop, flared bowl, and the
 *  inside wall so the rim has thickness. */
const TROPHY_PROFILE = [
  [0, -0.5], [0.25, -0.5], [0.26, -0.465], [0.21, -0.44], [0.1, -0.38], [0.055, -0.24],
  [0.05, -0.17], [0.095, -0.13], [0.05, -0.09], [0.06, -0.04], [0.19, 0.06], [0.29, 0.2],
  [0.335, 0.38], [0.35, 0.5], [0.325, 0.5], [0.305, 0.38], [0.262, 0.22], [0.17, 0.09], [0, 0.05],
].map(([x, y]) => new Vector2(x, y));

const PLINTH_PROFILE = [
  [0, -0.68], [0.3, -0.68], [0.31, -0.66], [0.31, -0.54], [0.28, -0.5], [0, -0.5],
].map(([x, y]) => new Vector2(x, y));

/** The revolved coin, re-mapped so a flat drawing lands on each face. */
function coinGeometry() {
  const lathe = new LatheGeometry(COIN_PROFILE, 96);
  const position = lathe.getAttribute('position');
  const uv = lathe.getAttribute('uv');
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, position.getX(i) / 0.93 + 0.5, position.getZ(i) / 0.93 + 0.5);
  }
  uv.needsUpdate = true;
  return lathe;
}

/** Coin cross-section, revolved: a raised rim around a recessed face. */
const COIN_PROFILE = [
  [0, 0.035],
  [0.3, 0.035],
  [0.33, 0.06],
  [0.44, 0.06],
  [0.465, 0.035],
  [0.465, -0.035],
  [0.44, -0.06],
  [0.33, -0.06],
  [0.3, -0.035],
  [0, -0.035],
].map(([x, y]) => new Vector2(x, y));

// --- playing cards: black stock, gold and blue ink ---------------------------
type Suit = "spade" | "heart" | "diamond" | "club";
const CARD_W = 0.78;
const CARD_H = 1.1;
const PALE_BLUE = "#8fb0ff";

function drawSuit(
  c: CanvasRenderingContext2D,
  suit: Suit,
  cx: number,
  cy: number,
  s: number,
) {
  c.beginPath();
  if (suit === "heart") {
    c.moveTo(cx, cy + s * 0.45);
    c.bezierCurveTo(
      cx - s * 0.9,
      cy - s * 0.15,
      cx - s * 0.45,
      cy - s * 0.75,
      cx,
      cy - s * 0.3,
    );
    c.bezierCurveTo(
      cx + s * 0.45,
      cy - s * 0.75,
      cx + s * 0.9,
      cy - s * 0.15,
      cx,
      cy + s * 0.45,
    );
  } else if (suit === "diamond") {
    c.moveTo(cx, cy - s * 0.55);
    c.lineTo(cx + s * 0.4, cy);
    c.lineTo(cx, cy + s * 0.55);
    c.lineTo(cx - s * 0.4, cy);
  } else {
    if (suit === "spade") {
      c.moveTo(cx, cy - s * 0.55);
      c.bezierCurveTo(
        cx + s * 0.9,
        cy + s * 0.05,
        cx + s * 0.45,
        cy + s * 0.6,
        cx,
        cy + s * 0.2,
      );
      c.bezierCurveTo(
        cx - s * 0.45,
        cy + s * 0.6,
        cx - s * 0.9,
        cy + s * 0.05,
        cx,
        cy - s * 0.55,
      );
    } else {
      for (const [x, y] of [
        [0, -0.28],
        [-0.27, 0.08],
        [0.27, 0.08],
      ] as const) {
        c.moveTo(cx + x * s + s * 0.24, cy + y * s);
        c.arc(cx + x * s, cy + y * s, s * 0.24, 0, Math.PI * 2);
      }
    }
    c.moveTo(cx, cy + s * 0.05);
    c.lineTo(cx + s * 0.18, cy + s * 0.55);
    c.lineTo(cx - s * 0.18, cy + s * 0.55);
  }
  c.closePath();
  c.fill();
}

function cardFace(rank: string, suit: Suit) {
  const ink = suit === "heart" || suit === "diamond" ? PALE_BLUE : GOLD;
  const map = texture(372, 528, (c) => {
    c.fillStyle = "#161b2b";
    c.fillRect(0, 0, 372, 528);
    c.strokeStyle = "rgba(229, 192, 123, 0.8)";
    c.lineWidth = 2;
    c.strokeRect(20, 20, 332, 488);
    c.fillStyle = ink;
    c.textAlign = "center";
    c.textBaseline = "middle";
    const corner = () => {
      c.font = '600 58px Georgia, "Times New Roman", serif';
      c.fillText(rank, 58, 70);
      drawSuit(c, suit, 58, 124, 34);
    };
    corner();
    c.save();
    c.translate(372, 528);
    c.rotate(Math.PI);
    corner();
    c.restore();
    drawSuit(c, suit, 186, 264, 150);
  });
  map.repeat.set(1 / CARD_W, 1 / CARD_H);
  map.offset.set(0.5, 0.5);
  return map;
}

function cardBack() {
  const map = texture(372, 528, (c) => {
    c.fillStyle = "#0a0c13";
    c.fillRect(0, 0, 372, 528);
    c.save();
    c.beginPath();
    c.rect(26, 26, 320, 476);
    c.clip();
    c.strokeStyle = "rgba(229, 192, 123, 0.5)";
    c.lineWidth = 1.5;
    for (let i = -528; i < 900; i += 26) {
      c.beginPath();
      c.moveTo(i, 0);
      c.lineTo(i + 528, 528);
      c.moveTo(i + 528, 0);
      c.lineTo(i, 528);
      c.stroke();
    }
    c.restore();
    c.strokeStyle = GOLD;
    c.lineWidth = 3;
    c.strokeRect(26, 26, 320, 476);
    c.fillStyle = "#0a0c13";
    c.beginPath();
    c.arc(186, 264, 58, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.fillStyle = GOLD;
    drawSuit(c, "spade", 186, 262, 62);
  });
  map.repeat.set(1 / CARD_W, 1 / CARD_H);
  map.offset.set(0.5, 0.5);
  return map;
}

function cardOutline() {
  const w = CARD_W / 2;
  const h = CARD_H / 2;
  const r = 0.045;
  const shape = new Shape();
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.absarc(w - r, -h + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(w, h - r);
  shape.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-w + r, h);
  shape.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-w, -h + r);
  shape.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

/**
 * Coin faces: a colour map and a height map painted from the same drawing, so
 * the raised parts are also the brighter ones. Beaded border, a ring, a spade
 * in the middle, and radial reeding out at the rim.
 */
function coinMaps() {
  const paint = (ground: string, raised: string, recess: string) =>
    texture(512, 512, (c) => {
      c.fillStyle = ground;
      c.fillRect(0, 0, 512, 512);
      c.translate(256, 256);
      // reeded rim
      c.strokeStyle = raised;
      c.lineWidth = 5;
      for (let i = 0; i < 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        c.beginPath();
        c.moveTo(Math.cos(a) * 226, Math.sin(a) * 226);
        c.lineTo(Math.cos(a) * 254, Math.sin(a) * 254);
        c.stroke();
      }
      // recessed field
      c.fillStyle = recess;
      c.beginPath();
      c.arc(0, 0, 172, 0, Math.PI * 2);
      c.fill();
      // beads
      c.fillStyle = raised;
      for (let i = 0; i < 44; i++) {
        const a = (i / 44) * Math.PI * 2;
        c.beginPath();
        c.arc(Math.cos(a) * 156, Math.sin(a) * 156, 5.5, 0, Math.PI * 2);
        c.fill();
      }
      c.lineWidth = 4;
      c.beginPath();
      c.arc(0, 0, 138, 0, Math.PI * 2);
      c.stroke();
      drawSuit(c, 'spade', 0, -4, 150);
    });
  const colour = paint('#c9a45c', '#f1d18a', '#8a6a34');
  const height = paint('#808080', '#ffffff', '#303030');
  return { colour, height };
}

interface Floater {
  node: Object3D;
  baseY: number;
  spin: [number, number, number];
  bob: number;
  phase: number;
  scale: number;
  // pointer physics: offset from home and its velocity, plus a spin kick
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  kick: number;
}

export function createGateScene(
  mount: HTMLElement,
  options: GateSceneOptions,
): GateScene | null {
  const { mobile, reducedMotion, gates } = options;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      alpha: true,
      antialias: !mobile,
      powerPreference: "high-performance",
    });
  } catch {
    return null; // no WebGL — the CSS backdrop stays on its own
  }
  // No GPU, no corridor: a software rasteriser would turn every frame into
  // main-thread work. `?gl=force` overrides this for review and tests.
  const force = window.location.search.includes("gl=force");
  const context = renderer.getContext();
  const info = context.getExtension("WEBGL_debug_renderer_info");
  const gpu = info
    ? String(context.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? "")
    : "";
  if (!force && /swiftshader|llvmpipe|software|basic render/i.test(gpu)) {
    renderer.dispose();
    return null;
  }
  renderer.setClearAlpha(0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  mount.appendChild(renderer.domElement);

  const scene = new Scene();
  scene.fog = new Fog(new Color("#07070a"), 5, 24);

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
    coin: coinGeometry(),
    trophy: new LatheGeometry(TROPHY_PROFILE, 80),
    plinth: new LatheGeometry(PLINTH_PROFILE, 64),
    handle: new TorusGeometry(0.15, 0.02, 14, 48, Math.PI * 1.15),
    knot: new TorusKnotGeometry(0.34, 0.115, 180, 28),
    gem: new OctahedronGeometry(0.5, 0),
    orb: new SphereGeometry(0.42, 48, 32),
    pill: new CapsuleGeometry(0.2, 0.55, 8, 28),
    cardBody: new ExtrudeGeometry(cardOutline(), {
      depth: 0.012,
      bevelEnabled: false,
      curveSegments: 8,
    }),
    cardBack: new ShapeGeometry(cardOutline(), 8),
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
          color: "#7ea0ff",
          metalness: 0.2,
          roughness: 0.06,
          iridescence: 1,
          clearcoat: 1,
          flatShading: flat,
        })
      : new MeshPhysicalMaterial({
          color: "#c4d4ff",
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
    gold: new MeshPhysicalMaterial({
      color: "#d7b26a",
      metalness: 1,
      roughness: 0.2,
    }),
    chrome: new MeshPhysicalMaterial({
      color: "#dfe6ff",
      metalness: 1,
      roughness: 0.05,
    }),
    coin: (() => {
      const { colour, height } = coinMaps();
      return new MeshPhysicalMaterial({
        map: colour,
        bumpMap: height,
        bumpScale: 2.4,
        metalness: 1,
        roughness: 0.24,
      });
    })(),
    trophy: new MeshPhysicalMaterial({
      color: "#e6c070",
      metalness: 1,
      roughness: 0.13,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    }),
    obsidian: new MeshPhysicalMaterial({
      color: "#0a0c14",
      metalness: 0.35,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      iridescence: 0.35,
    }),
    gem: glass(true),
    orb: glass(false),
    anodized: new MeshPhysicalMaterial({
      color: "#2747c9",
      metalness: 0.9,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    }),
    cardFaces: (
      [
        ["A", "spade"],
        ["K", "heart"],
        ["Q", "diamond"],
        ["J", "club"],
      ] as const
    ).map(([rank, suit]) => {
      const map = cardFace(rank, suit);
      // The ink also glows a little, so a card reads even in the fog.
      return new MeshPhysicalMaterial({
        map,
        emissive: new Color("#ffffff"),
        emissiveMap: map,
        emissiveIntensity: 0.35,
        roughness: 0.38,
        clearcoat: 1,
        clearcoatRoughness: 0.2,
      });
    }),
    cardBack: new MeshPhysicalMaterial({
      map: cardBack(),
      roughness: 0.38,
      clearcoat: 1,
      clearcoatRoughness: 0.2,
      side: DoubleSide,
    }),
    cardEdge: new MeshPhysicalMaterial({
      color: "#d7b26a",
      metalness: 1,
      roughness: 0.3,
    }),
    gate: new MeshBasicMaterial({ color: BLUE }),
    gateAlt: new MeshBasicMaterial({ color: CYAN }),
    halo: new MeshBasicMaterial({
      color: "#9fb8ff",
      transparent: true,
      opacity: 0.35,
    }),
    glow: new MeshBasicMaterial({
      color: BLUE,
      transparent: true,
      opacity: mobile ? 0.16 : 0.05,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
    glowAlt: new MeshBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: mobile ? 0.13 : 0.04,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  };

  let dealt = 0;
  const card = (): Object3D => {
    const group = new Group();
    const face = material.cardFaces[dealt++ % material.cardFaces.length]!;
    group.add(new Mesh(geometry.cardBody, [face, material.cardEdge]));
    const back = new Mesh(geometry.cardBack, material.cardBack);
    back.position.z = -0.0008;
    group.add(back);
    return group;
  };
  const die = () => new Mesh(geometry.die, material.die);
  const coin = () => new Mesh(geometry.coin, material.coin);
  const gem = () => new Mesh(geometry.gem, material.gem);
  const orb = () => new Mesh(geometry.orb, material.orb);
  const knot = () => new Mesh(geometry.knot, material.chrome);
  const pill = () => new Mesh(geometry.pill, material.anodized);

  // Sculpted pieces (CC0 geometry from Poly Haven, see public/models/CREDITS.md)
  // arrive after the scene is up. Each maker returns a mesh on an empty
  // geometry that is swapped for the real one when its file lands; if a file
  // never arrives, that piece simply stays invisible.
  const sculpted = new Map<string, BufferGeometry>();
  let disposed = false;
  const sculpt = (name: string, skin: Material, size: number) => () => {
    let shared = sculpted.get(name);
    if (!shared) {
      shared = new BufferGeometry();
      sculpted.set(name, shared);
      const target = shared;
      void fetch(`/models/${name}.bin`)
        .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(response.status)))
        .then((buffer) => {
          if (disposed) return;
          const [vertices, indices] = new Uint32Array(buffer, 0, 2) as unknown as [number, number];
          const normalBytes = Math.ceil((vertices * 3) / 4) * 4;
          const positions = new Float32Array(buffer, 8, vertices * 3);
          const normals = new Int8Array(buffer, 8 + vertices * 12, vertices * 3);
          const index = new Uint16Array(buffer, 8 + vertices * 12 + normalBytes, indices);
          target.setAttribute('position', new BufferAttribute(positions, 3));
          target.setAttribute('normal', new BufferAttribute(normals, 3, true));
          target.setIndex(new BufferAttribute(index, 1));
          target.scale(size, size, size);
          target.computeBoundingSphere();
        })
        .catch(() => undefined);
    }
    return new Mesh(shared, skin);
  };
  const knight = sculpt('knight', material.obsidian, 1.25);
  const king = sculpt('king', material.gold, 1.45);
  const queen = sculpt('queen', material.chrome, 1.4);
  // The trophy: a two-handled cup on an obsidian plinth, turned on the lathe
  // rather than loaded, so the silhouette is ours.
  const goblet = (): Object3D => {
    const group = new Group();
    group.add(new Mesh(geometry.trophy, material.trophy));
    group.add(new Mesh(geometry.plinth, material.obsidian));
    for (const side of [1, -1]) {
      const handle = new Mesh(geometry.handle, material.trophy);
      handle.position.set(side * 0.33, 0.28, 0);
      handle.rotation.z = side > 0 ? -Math.PI * 0.62 : Math.PI * 0.47;
      group.add(handle);
    }
    group.scale.setScalar(1.25);
    const wrapper = new Group();
    wrapper.add(group);
    return wrapper;
  };

  // The corridor plays one round, over and over: the deal, the roll, the
  // thinking, the win, and then the machinery that makes it fair. Each stretch
  // between two gates carries the pieces of its beat.
  const kits: (() => Object3D)[][] = [
    [card, card, gem, card],
    [die, orb, die, die],
    [knight, king, queen, knight],
    [goblet, coin, coin, card],
    [knot, pill, orb, gem],
  ];

  // --- corridor ---------------------------------------------------------
  const random = mulberry(20261123);
  const floaters: Floater[] = [];
  const placed: { x: number; y: number; z: number; r: number }[] = [];
  const rings: Group[] = [];
  const perGate = mobile ? 2 : 3;

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
      const kit = kits[(g - 1) % kits.length]!;
      const mesh = kit[i % kit.length]!();
      // Keep the reading column clear: objects live left and right of centre.
      // Rejection-sample a spot: left or right of the reading column, and far
      // enough from every piece already placed that no two can intersect,
      // even at full size and mid-bob.
      const side = (g + i) % 2 ? 1 : -1;
      const scale = 0.9 + random() * 0.8;
      let x = 0;
      let y = 0;
      let depth = 0;
      for (let attempt = 0; attempt < 40; attempt++) {
        x = side * (2.6 + random() * 1.8);
        y = (random() - 0.5) * 3.2;
        depth = z - 1.4 - random() * (GATE_SPACING - 2.8);
        const clear = placed.every(
          (other) => Math.hypot(other.x - x, other.y - y, other.z - depth) > 1.2 + other.r + scale * 0.75,
        );
        if (clear) break;
      }
      placed.push({ x, y, z: depth, r: scale * 0.75 });
      mesh.userData.x = x;
      mesh.position.set(x, y, depth);
      mesh.rotation.set(random() * 6.28, random() * 6.28, random() * 6.28);
      mesh.scale.setScalar(scale);
      scene.add(mesh);
      floaters.push({
        node: mesh,
        baseY: y,
        spin: [
          (random() - 0.5) * 0.5,
          (random() - 0.5) * 0.6,
          (random() - 0.5) * 0.3,
        ],
        bob: 0.08 + random() * 0.16,
        phase: random() * 6.28,
        scale,
        ox: 0,
        oy: 0,
        vx: 0,
        vy: 0,
        kick: 0,
      });
    }
  }

  // Finale: past the last gate the round ends on a full hand. A ring of cards
  // turns slowly around the trophy, waiting behind the contact section.
  const finale = new Group();
  const hand = new Group();
  const handSize = mobile ? 5 : 7;
  for (let i = 0; i < handSize; i++) {
    const angle = (i / handSize) * Math.PI * 2;
    const piece = card();
    piece.position.set(Math.cos(angle) * 1.75, Math.sin(angle) * 1.75, 0);
    piece.rotation.set(0.25, 0.35, angle - Math.PI / 2);
    piece.scale.setScalar(0.95);
    hand.add(piece);
  }
  const trophy = goblet();
  trophy.scale.setScalar(1.7);
  const crown = new Mesh(geometry.halo, material.gate);
  crown.scale.setScalar(0.72);
  finale.add(hand, trophy, crown);
  finale.position.set(0, 0, -(gates - 1) * GATE_SPACING - 3.6);
  scene.add(finale);

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
  dustGeometry.setAttribute("position", new BufferAttribute(dustPosition, 3));
  const dustMaterial = new PointsMaterial({
    color: "#a9c1ff",
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

  // --- post: bloom on desktop -------------------------------------------
  // Gates, gold pips and card ink are the only things bright enough to pass
  // the threshold, so they bleed light while the dark pieces stay crisp. The
  // canvas is premultiplied, so the halo composites as added light over the
  // page. Phones skip the pass.
  let composer: EffectComposer | undefined;
  if (!mobile) {
    const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, target);
    const scenePass = new RenderPass(scene, camera);
    scenePass.clearColor = new Color(0x000000);
    scenePass.clearAlpha = 0;
    composer.addPass(scenePass);
    composer.addPass(new UnrealBloomPass(new Vector2(1, 1), 0.32, 0.6, 0.92));
    composer.addPass(new OutputPass());
  }
  const draw = () => {
    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  // --- sizing -----------------------------------------------------------
  let spread = 1;
  let quality = 1; // drops when frames run long, see loop()
  const resize = () => {
    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;
    const ratio = Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.5) * quality;
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    composer?.setPixelRatio(ratio);
    composer?.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // Portrait screens are narrow: pull the objects in so they stay in frame.
    spread = Math.min(1, Math.max(0.42, camera.aspect / 1.5));
    if (reducedMotion) render(0);
  };

  // --- scroll + pointer ---------------------------------------------------
  let maxScroll = 1;
  const measure = () => {
    maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
  };
  let progress = 0;
  let energy = 0;
  let lastY = window.scrollY;
  let pointerX = 0;
  let pointerY = 0;
  let pointerActive = false;
  const click = { x: 0, y: 0, pending: false };
  const probe = new Vector3();
  let leanX = 0;
  let leanY = 0;
  let clock = 0;

  const render = (dt: number) => {
    const target = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    progress += reducedMotion
      ? target - progress
      : (target - progress) * Math.min(1, dt * 5);
    energy *= Math.max(0, 1 - dt * 2.4);
    clock += dt * (1 + energy * 3);

    leanX += (pointerX - leanX) * Math.min(1, dt * 2.5);
    leanY += (pointerY - leanY) * Math.min(1, dt * 2.5);
    camera.position.set(leanX * 0.55, leanY * 0.35, startZ - progress * travel);
    camera.rotation.set(leanY * -0.035, leanX * -0.05, leanX * -0.012);

    const blast = click.pending;
    click.pending = false;
    for (const floater of floaters) {
      const { node, spin } = floater;
      const ahead = camera.position.z - node.position.z;

      // Pointer physics in screen space: pieces drift away from the cursor and
      // take a real kick from a click or tap, then spring back home.
      if (ahead > 0.6 && ahead < 22) {
        probe.copy(node.position).project(camera);
        const dx = (probe.x - pointerX) * camera.aspect;
        const dy = probe.y - pointerY;
        const d = Math.hypot(dx, dy) || 0.001;
        if (pointerActive && d < 0.38) {
          const push = (0.38 - d) / 0.38;
          floater.vx += (dx / d) * push * dt * 9;
          floater.vy += (dy / d) * push * dt * 9;
          floater.kick = Math.max(floater.kick, push * 0.6);
        }
        if (blast) {
          const bx = (probe.x - click.x) * camera.aspect;
          const by = probe.y - click.y;
          const bd = Math.hypot(bx, by) || 0.001;
          if (bd < 0.9) {
            const power = (0.9 - bd) / 0.9;
            floater.vx += (bx / bd) * power * 4.2;
            floater.vy += (by / bd) * power * 4.2;
            floater.kick = 1;
          }
        }
      }
      floater.vx -= floater.ox * 5 * dt;
      floater.vy -= floater.oy * 5 * dt;
      const drag = Math.max(0, 1 - dt * 2.6);
      floater.vx *= drag;
      floater.vy *= drag;
      floater.ox += floater.vx * dt;
      floater.oy += floater.vy * dt;
      floater.kick *= Math.max(0, 1 - dt * 1.4);

      const whirl = 1 + energy * 4 + floater.kick * 9;
      node.rotation.x += spin[0] * dt * whirl;
      node.rotation.y += spin[1] * dt * whirl;
      node.rotation.z += spin[2] * dt;
      node.position.x = (node.userData.x as number) * spread + floater.ox;
      node.position.y =
        floater.baseY +
        Math.sin(clock * 0.5 + floater.phase) * floater.bob +
        floater.oy;
      // Pieces shrink away as the camera reaches them, so nothing ever fills
      // the screen in front of the text.
      const near = Math.min(1, Math.max(0, (ahead - 1.6) / 3.2));
      node.scale.setScalar(floater.scale * near * near * (3 - 2 * near));
    }
    for (let i = 0; i < rings.length; i++) {
      rings[i]!.rotation.z += dt * (i % 2 ? -0.05 : 0.05) * (1 + energy * 6);
    }
    dust.rotation.z += dt * 0.012;
    hand.rotation.z += dt * (0.12 + energy * 0.9);
    trophy.rotation.y += dt * 0.5;
    finale.position.x = 1.9 * (spread - 0.42) * 1.72;
    draw();
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
        mount.style.opacity = "0";
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
    if (event.pointerType !== "mouse") return;
    pointerActive = true;
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = -(event.clientY / window.innerHeight - 0.5) * 2;
  };
  // Click or tap anywhere: a shove for whatever is near, and a surge of speed.
  const onDown = (event: PointerEvent) => {
    click.x = (event.clientX / window.innerWidth - 0.5) * 2;
    click.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    click.pending = true;
    energy = Math.min(1, energy + 0.5);
  };

  const mountObserver = new ResizeObserver(resize);
  mountObserver.observe(mount);
  const pageObserver = new ResizeObserver(measure);
  pageObserver.observe(document.body);
  measure();
  resize();
  window.addEventListener("scroll", onScroll, { passive: true });
  if (!reducedMotion) {
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    frame = requestAnimationFrame(loop);
  } else {
    render(0);
  }

  return {
    dispose() {
      cancelAnimationFrame(frame);
      mountObserver.disconnect();
      pageObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
      for (const item of Object.values(geometry)) item.dispose();
      const dispose = (entry: Material) => {
        (entry as MeshPhysicalMaterial).map?.dispose();
        entry.dispose();
      };
      for (const item of Object.values(material)) {
        if (Array.isArray(item)) item.forEach(dispose);
        else dispose(item);
      }
      disposed = true;
      for (const item of sculpted.values()) item.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      composer?.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
