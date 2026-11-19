import * as THREE from 'three';
import { createConcreteMaterial } from '../core/materials.js';

/**
 * SEQ 008 — Outro. A clean, sealed, glossy surface with a slow ambient water ripple.
 */
export function createOutro({ device, positions }) {
  const group = new THREE.Group();
  group.position.copy(positions.outro);

  const size = new THREE.Vector2(30, 20);
  const material = createConcreteMaterial(device, {
    size,
    crack: 0,
    smooth: 1,
    wet: 0.75,
    ripple: 1,
    bump: 0.03,
    base: 0x6f7c8c,
  });
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(size.x, size.y), material);
  surface.rotation.x = -Math.PI / 2;
  group.add(surface);

  return {
    group,
    update({ elapsed }) {
      material.uniforms.uTime.value = elapsed;
    },
  };
}
