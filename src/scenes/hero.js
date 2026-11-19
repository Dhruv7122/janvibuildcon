import * as THREE from 'three';
import { createConcreteMaterial } from '../core/materials.js';

/**
 * SEQ 001 — The Surface.
 * A large rough concrete slab with a visible hairline crack and water droplets
 * that bead and slowly roll across it. Tilts toward the cursor.
 */
export function createHero({ device, positions }) {
  const group = new THREE.Group();
  group.position.copy(positions.hero);

  const size = new THREE.Vector2(26, 16);
  const material = createConcreteMaterial(device, {
    size,
    crackWidth: 0.035,
    wet: 0.22,
    bump: 0.03,
    base: 0x5d636b,
  });
  const slab = new THREE.Mesh(new THREE.PlaneGeometry(size.x, size.y), material);
  slab.rotation.x = -Math.PI / 2;
  group.add(slab);

  // --- Droplets: one instanced mesh, flattened spheres that roll toward the camera.
  const count = Math.round(45 * device.particleScale) + 8;
  const dropMat = new THREE.MeshPhysicalMaterial({
    color: 0x6f8fa3,
    roughness: 0.04,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    transparent: true,
    opacity: 0.4,
    envMapIntensity: 0.9,
  });
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 12), dropMat, count);
  drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(drops);

  const area = { x: 9, zMin: -5, zMax: 4.5 };
  const data = Array.from({ length: count }, () => spawn({}, true));

  function spawn(d, anywhere = false) {
    d.r = 0.03 + Math.random() ** 2 * 0.08;
    d.x = (Math.random() * 2 - 1) * area.x;
    d.z = anywhere ? THREE.MathUtils.lerp(area.zMin, area.zMax, Math.random()) : area.zMin;
    // Only some droplets roll; the rest bead in place and wobble.
    d.speed = Math.random() < 0.35 ? 0.08 + Math.random() * 0.25 : 0;
    d.wobble = Math.random() * Math.PI * 2;
    d.life = 0;
    return d;
  }

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const tilt = new THREE.Vector2();

  return {
    group,
    material,
    update({ dt, elapsed, pointer }) {
      material.uniforms.uTime.value = elapsed;

      // Slab leans subtly toward the cursor (lerped).
      tilt.x += (pointer.y * 0.06 - tilt.x) * 0.05;
      tilt.y += (pointer.x * 0.08 - tilt.y) * 0.05;
      group.rotation.set(tilt.x, tilt.y * 0.5, -tilt.y * 0.4);

      for (let i = 0; i < count; i++) {
        const d = data[i];
        d.life += dt;
        if (d.speed) {
          d.z += d.speed * dt * (0.8 + Math.sin(elapsed * 2 + d.wobble) * 0.2);
          d.x += Math.sin(elapsed * 0.7 + d.wobble) * dt * 0.03;
          if (d.z > area.zMax) spawn(d);
        }
        const grow = Math.min(d.life * 2, 1);
        const w = 1 + Math.sin(elapsed * 3 + d.wobble) * 0.04;
        scl.set(d.r * w * grow, d.r * 0.42 * grow, d.r * (d.speed ? 1.25 : 1) * grow);
        pos.set(d.x, d.r * 0.32, d.z);
        drops.setMatrixAt(i, m4.compose(pos, q, scl));
      }
      drops.instanceMatrix.needsUpdate = true;
    },
  };
}
