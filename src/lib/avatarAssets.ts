import type { AnimationClip, Group, Material, Mesh, Object3D } from 'three';

/**
 * Shared Avaturn avatar assets. The 5MB character downloads and parses ONCE
 * (module-level promise cache) no matter how many scenes use it; each scene
 * takes a SkeletonUtils clone with its own materials so per-scene effects
 * (dissolve fades, emissive pulses) never bleed across scenes. Geometry and
 * textures — the heavy GPU payload — stay shared.
 *
 * The backflip lives in avatar-flip.glb: a 137KB animation-only GLB stripped
 * offline from the second Avaturn export (same 52-joint rig, no meshes or
 * textures), so the second scene never re-downloads the character.
 */

type AvatarGltf = { scene: Group; animations: AnimationClip[] };

let modelPromise: Promise<AvatarGltf> | undefined;
let flipPromise: Promise<AnimationClip | undefined> | undefined;

export function loadAvatarModel(
  onProgress?: (loaded: number, total: number) => void,
): Promise<AvatarGltf> {
  modelPromise ??= (async () => {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    return new GLTFLoader().loadAsync('/assets/avatar.glb', (e) => {
      if (e.total) onProgress?.(e.loaded, e.total);
    });
  })();
  return modelPromise;
}

export function loadFlipClip(): Promise<AnimationClip | undefined> {
  flipPromise ??= (async () => {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const gltf = await new GLTFLoader().loadAsync('/assets/avatar-flip.glb');
    return gltf.animations[0];
  })();
  return flipPromise;
}

/** Skeleton-aware clone with per-clone materials (geometry/textures shared). */
export async function cloneAvatar(source: Group): Promise<Group> {
  const { clone } = await import('three/examples/jsm/utils/SkeletonUtils.js');
  const copy = clone(source) as Group;
  copy.traverse((o: Object3D) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    m.material = Array.isArray(m.material)
      ? m.material.map((mat: Material) => mat.clone())
      : m.material.clone();
  });
  return copy;
}
