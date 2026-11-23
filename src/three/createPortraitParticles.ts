import {
  BufferAttribute,
  BufferGeometry,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three';

// The hero portrait rebuilt out of points. Every lit pixel of the photo becomes
// a particle with a home position and a depth taken from its brightness, so the
// face has real relief under perspective. The cloud assembles on load, parts
// around the cursor, takes a shockwave on click, and blows away downwind as the
// hero scrolls out. One draw call; all motion lives in the vertex shader.

export interface PortraitParticles {
  dispose: () => void;
}

interface Options {
  src: string;
  /** object-position of the <img> this replaces, as 0..1 fractions. */
  focus: [number, number];
  onReady: () => void;
}

const FOV = 35;

const vertexShader = /* glsl */ `
  attribute vec2 aData; // x: luminance, y: per-particle seed
  uniform float uTime;
  uniform float uScatter; // 1 → 0 while the portrait assembles
  uniform float uBlow;    // 0 → 1 as the hero scrolls away
  uniform float uSize;
  uniform float uCamZ;
  uniform float uHalfW;
  uniform vec2  uMouse;
  uniform float uMouseOn;
  uniform vec2  uShock;
  uniform float uShockT;  // seconds since the last click, < 0 when idle
  varying float vAlpha;
  varying vec3  vColor;

  float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

  void main() {
    float lum = aData.x;
    float seed = aData.y;
    vec3 p = position;
    float u = (p.x + uHalfW) / (2.0 * uHalfW);

    // Relief: bright pixels come forward.
    p.z += (lum - 0.35) * 70.0;
    // Idle shimmer so the face is never perfectly still.
    p.xy += vec2(sin(uTime * 0.7 + seed * 40.0), cos(uTime * 0.6 + seed * 31.0)) * 0.9;

    // Cursor: particles part around it and lift toward the viewer.
    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float f = smoothstep(170.0, 0.0, dist) * uMouseOn;
    p.xy += d / (dist + 0.001) * f * f * 95.0;
    p.z += f * 150.0;

    // Click: an expanding ring that kicks whatever it crosses.
    vec2 ds = p.xy - uShock;
    float dl = length(ds);
    float ring = uShockT * 950.0;
    float w = exp(-pow((dl - ring) / 55.0, 2.0)) * exp(-uShockT * 1.8) * step(0.0, uShockT);
    p.xy += ds / (dl + 0.001) * w * 46.0;
    p.z += w * 90.0;

    vec3 rnd = vec3(hash(seed), hash(seed + 1.3), hash(seed + 2.7)) - 0.5;

    // Assemble: each particle flies in from its own random spot, staggered.
    float a = smoothstep(0.0, 1.0, clamp(uScatter * 1.5 - seed * 0.5, 0.0, 1.0));
    p += rnd * vec3(1500.0, 1500.0, 900.0) * a;

    // Blow away: the right edge leaves first, carried up and downwind.
    float b = smoothstep(0.0, 1.0, clamp(uBlow * 2.0 - (1.0 - u) * 0.7 - seed * 0.3, 0.0, 1.0));
    p += vec3(
      520.0 + rnd.x * 620.0,
      180.0 + rnd.y * 640.0 + sin(seed * 50.0 + uTime * 1.3) * 60.0,
      rnd.z * 900.0
    ) * b;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float tone = pow(lum, 0.62);
    gl_PointSize = uSize * (0.8 + tone * 0.6) * (1.0 + f * 0.9 + b * 1.1) * (uCamZ / -mv.z);

    // Same left-edge fade the photo had, so the text column stays clean.
    float mask = smoothstep(0.0, 0.48, u);
    // Near-black backdrop pixels fade out instead of reading as grain.
    vAlpha = mask * smoothstep(0.035, 0.15, lum) * min(1.0, 0.45 + tone) * (1.0 - a * 0.85) * (1.0 - b);
    vec3 base = vec3(min(1.0, tone * 1.28)) * vec3(0.95, 0.975, 1.0);
    vColor = mix(base, vec3(0.45, 0.65, 1.0), f * 0.55 + w * 0.3 + b * 0.5);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  varying float vAlpha;
  varying vec3  vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.32, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

export function createPortraitParticles(mount: HTMLElement, options: Options): PortraitParticles | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setClearAlpha(0);
  mount.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 1, 6000);
  const uniforms = {
    uTime: { value: 0 },
    uScatter: { value: 1 },
    uBlow: { value: 0 },
    uSize: { value: 3 },
    uCamZ: { value: 1 },
    uHalfW: { value: 1 },
    uMouse: { value: new Vector2(-9999, -9999) },
    uMouseOn: { value: 0 },
    uShock: { value: new Vector2() },
    uShockT: { value: -1 },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: NormalBlending,
  });
  let points: Points | undefined;
  let disposed = false;
  let width = 1;
  let height = 1;

  const image = new Image();
  image.decoding = 'async';
  image.src = options.src;

  const build = () => {
    if (disposed || !image.naturalWidth) return;
    width = mount.clientWidth || 1;
    height = mount.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    const camZ = height / 2 / Math.tan((FOV * Math.PI) / 360);
    camera.aspect = width / height;
    camera.position.set(0, 0, camZ);
    camera.updateProjectionMatrix();

    // ~3 CSS px between particles: dense enough to read as a photo.
    const step = Math.max(2.6, Math.sqrt((width * height) / 110000));
    const cols = Math.floor(width / step);
    const rows = Math.floor(height / step);
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    // Reproduce `object-fit: cover` + object-position in the sample grid.
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const dw = image.naturalWidth * scale;
    const dh = image.naturalHeight * scale;
    const ox = (width - dw) * options.focus[0];
    const oy = (height - dh) * options.focus[1];
    context.drawImage(image, ox / step, oy / step, dw / step, dh / step);
    const pixels = context.getImageData(0, 0, cols, rows).data;

    const position: number[] = [];
    const data: number[] = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const o = (j * cols + i) * 4;
        let lum = (0.299 * pixels[o]! + 0.587 * pixels[o + 1]! + 0.114 * pixels[o + 2]!) / 255;
        lum = Math.min(1, Math.max(0, ((lum - 0.5) * 1.06 + 0.5) * 0.92));
        if (lum < 0.02) continue; // the black backdrop needs no particles
        position.push((i + 0.5) * step - width / 2, height / 2 - (j + 0.5) * step, 0);
        data.push(lum, Math.random());
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(position), 3));
    geometry.setAttribute('aData', new BufferAttribute(new Float32Array(data), 2));
    if (points) {
      scene.remove(points);
      points.geometry.dispose();
    }
    points = new Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);
    uniforms.uSize.value = step * dpr * 1.5;
    uniforms.uCamZ.value = camZ;
    uniforms.uHalfW.value = width / 2;
  };

  // --- interaction --------------------------------------------------------
  const target = new Vector2(-9999, -9999);
  let mouseOn = 0;
  let inside = false;
  let blow = 0;
  let visible = true;
  let frame = 0;
  let previous = 0;
  let started = 0;

  const toLocal = (event: PointerEvent, out: Vector2) => {
    const rect = mount.getBoundingClientRect();
    out.set(event.clientX - rect.left - rect.width / 2, rect.height / 2 - (event.clientY - rect.top));
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  };
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    inside = toLocal(event, target);
  };
  const onDown = (event: PointerEvent) => {
    if ((event.target as Element | null)?.closest('a, button, input, [role="button"]')) return;
    if (!toLocal(event, uniforms.uShock.value)) return;
    uniforms.uShockT.value = 0;
  };
  const onScroll = () => {
    const rect = mount.getBoundingClientRect();
    blow = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height * 0.8)));
  };

  const loop = (now: number) => {
    frame = requestAnimationFrame(loop);
    if (!visible || document.hidden || !points) {
      previous = 0;
      return;
    }
    const dt = previous ? Math.min(0.05, (now - previous) / 1000) : 0.016;
    previous = now;
    if (!started) started = now;
    const intro = Math.min(1, (now - started) / 2600);
    uniforms.uScatter.value = 1 - (1 - Math.pow(1 - intro, 3));
    uniforms.uTime.value += dt;
    uniforms.uMouse.value.lerp(target, Math.min(1, dt * 9));
    mouseOn += ((inside ? 1 : 0) - mouseOn) * Math.min(1, dt * 5);
    uniforms.uMouseOn.value = mouseOn;
    uniforms.uBlow.value += (blow - uniforms.uBlow.value) * Math.min(1, dt * 6);
    if (uniforms.uShockT.value >= 0) {
      uniforms.uShockT.value += dt;
      if (uniforms.uShockT.value > 3) uniforms.uShockT.value = -1;
    }
    renderer.render(scene, camera);
  };

  let resizeTimer = 0;
  const resizeObserver = new ResizeObserver(() => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(build, 180);
  });
  const viewObserver = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
  });

  const begin = () => {
    if (disposed) return;
    build();
    if (!points) return;
    resizeObserver.observe(mount);
    viewObserver.observe(mount);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    frame = requestAnimationFrame(loop);
    options.onReady();
  };
  if (image.complete && image.naturalWidth) begin();
  else image.addEventListener('load', begin, { once: true });

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll);
      points?.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
