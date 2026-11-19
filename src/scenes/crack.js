import * as THREE from 'three';
import particlesVert from '../shaders/particles.vert.glsl?raw';
import { createConcreteMaterial, createPointsMaterial } from '../core/materials.js';

/**
 * SEQ 003 — Crack filling.
 * A close-up concrete wall. On scroll a glowing sealant fills the crack end to end
 * (shader uHeal), then the surface blends smooth (uSmooth) and the dust settles.
 */
export function createCrack({ device, positions, pixelRatio }) {
  const group = new THREE.Group();
  group.position.copy(positions.crack);

  const size = new THREE.Vector2(14, 8);
  const material = createConcreteMaterial(device, {
    size,
    crackWidth: 0.075,
    glow: 0xffb703,
    wet: 0.08,
    bump: 0.022,
  });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(size.x, size.y), material);
  group.add(wall);

  // Dust motes hovering around the crack line.
  const count = Math.round(260 * device.particleScale) + 40;
  const starts = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const u = 0.06 + Math.random() * 0.88;
    starts.set([(u - 0.5) * size.x, (Math.random() - 0.5) * 1.6, 0.1 + Math.random() * 1.6], i * 3);
    seeds.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('aStart', new THREE.BufferAttribute(starts, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  const dustMat = createPointsMaterial(
    particlesVert,
    {
      uTime: { value: 0 },
      uMode: { value: 0 },
      uIntensity: { value: 1 },
      uSize: { value: 0.9 },
      uFall: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    },
    { additive: true }
  );
  dustMat.uniforms.uColor.value.set(0xd9d2c3);
  const dust = new THREE.Points(geo, dustMat);
  dust.frustumCulled = false;
  group.add(dust);

  return {
    group,
    setPixelRatio(pr) {
      dustMat.uniforms.uPixelRatio.value = pr;
    },
    update({ elapsed, state }) {
      const u = material.uniforms;
      u.uTime.value = elapsed;
      u.uHeal.value = state.crack.heal;
      u.uSmooth.value = state.crack.smooth;
      dustMat.uniforms.uTime.value = elapsed;
      dustMat.uniforms.uIntensity.value = 1 - state.crack.heal * 0.6 - state.crack.smooth * 0.4;
    },
  };
}
