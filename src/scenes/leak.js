import * as THREE from 'three';
import concreteVert from '../shaders/concrete.vert.glsl?raw';
import thermalFrag from '../shaders/thermal.frag.glsl?raw';
import { createConcreteMaterial, glsl } from '../core/materials.js';

/**
 * SEQ 002 — Thermal leak detection.
 * A bathroom wall looks normal until a thermal scan sweeps across it, exposing the cold
 * moisture plume under a hidden pipe joint. The scan then locks onto the source.
 */
export function createLeak({ device, positions }) {
  const group = new THREE.Group();
  group.position.copy(positions.leak);

  const size = new THREE.Vector2(12, 7);
  const leakUv = new THREE.Vector2(0.4, 0.52);
  const material = new THREE.ShaderMaterial({
    vertexShader: concreteVert,
    fragmentShader: glsl(thermalFrag),
    defines: { OCTAVES: Math.min(device.octaves, 4) },
    fog: true,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uTime: { value: 0 },
        uScan: { value: 0 },
        uLock: { value: 0 },
        uSize: { value: size },
        uLeak: { value: leakUv },
        uScanColor: { value: new THREE.Color(0x2ec4f1) },
      },
    ]),
  });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(size.x, size.y), material);
  wall.position.y = size.y / 2 - 1.5;
  group.add(wall);

  // Floor slab for context.
  const floorSize = new THREE.Vector2(16, 8);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(floorSize.x, floorSize.y),
    createConcreteMaterial(device, { size: floorSize, crack: 0, wet: 0.3, bump: 0.02 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -1.5, floorSize.y / 2);
  group.add(floor);

  // Thermal camera "viewfinder" frame riding the scan line.
  const frameGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.6, size.y + 0.4));
  const frameMat = new THREE.LineBasicMaterial({ color: 0x2ec4f1, transparent: true, opacity: 0 });
  const frame = new THREE.LineSegments(frameGeo, frameMat);
  frame.position.set(0, wall.position.y, 0.05);
  group.add(frame);

  const markerLocal = new THREE.Vector3((leakUv.x - 0.5) * size.x, wall.position.y + (leakUv.y - 0.5) * size.y, 0.02);

  return {
    group,
    update({ elapsed, state }) {
      const { scan, lock } = state.leak;
      const u = material.uniforms;
      u.uTime.value = elapsed;
      u.uScan.value = scan;
      u.uLock.value = lock;
      frame.position.x = (scan * 1.06 - 0.03 - 0.5) * size.x;
      frameMat.opacity = scan > 0.001 && scan < 0.999 ? 0.8 : 0;
    },
    /** World position of the leak source (for the HTML marker). */
    markerAnchor(out) {
      return group.localToWorld(out.copy(markerLocal));
    },
  };
}
