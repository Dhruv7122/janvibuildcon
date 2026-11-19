import * as THREE from 'three';
import rainVert from '../shaders/rain.vert.glsl?raw';
import { createPointsMaterial, makeSpeckleTexture, makeTileTexture } from '../core/materials.js';

/**
 * SEQ 002 — Waterproofing.
 * A terrace cross-section (slab → primer → membrane → screed → tile) that explodes apart
 * on scroll. Rain seeps through the porous top layers, stops on the membrane,
 * beads and slides off its edges. Water never passes the membrane.
 */
export function createWaterproofing({ device, positions, pixelRatio }) {
  const group = new THREE.Group();
  group.position.copy(positions.water);
  group.rotation.y = -0.35;

  const W = 8;
  const D = 5;
  const layerDefs = [
    { h: 0.9, mat: new THREE.MeshStandardMaterial({ map: makeSpeckleTexture('#6c727a', 2), roughness: 0.95 }) },
    { h: 0.1, mat: new THREE.MeshStandardMaterial({ color: 0xb7791f, roughness: 0.6, transparent: true, opacity: 0.92 }) },
    {
      h: 0.18,
      mat: new THREE.MeshStandardMaterial({ color: 0x1593c4, roughness: 0.25, metalness: 0.1, emissive: 0x0b6f96, emissiveIntensity: 0.6 }),
    },
    { h: 0.5, mat: new THREE.MeshStandardMaterial({ map: makeSpeckleTexture('#8f8a83', 2), roughness: 0.9 }) },
    { h: 0.16, mat: new THREE.MeshStandardMaterial({ map: makeTileTexture(5), roughness: 0.35 }) },
  ];
  const MEMBRANE = 2;
  const GAP = 1.05;

  const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 });
  let y = -1.2;
  const layers = layerDefs.map((def, i) => {
    const geo = new THREE.BoxGeometry(W, def.h, D);
    const mesh = new THREE.Mesh(geo, def.mat);
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
    const baseY = y + def.h / 2;
    y += def.h;
    mesh.position.y = baseY;
    group.add(mesh);
    return { mesh, baseY, h: def.h, index: i };
  });

  // Blueprint frame under the stack.
  const grid = new THREE.GridHelper(14, 28, 0x2ec4f1, 0x1a2a3a);
  grid.position.y = -1.3;
  grid.material.transparent = true;
  grid.material.opacity = 0.25;
  group.add(grid);

  // Rain
  const count = Math.round(1600 * device.particleScale);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    seeds.set([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random(), Math.random()], i * 4);
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  rainGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  const rainMat = createPointsMaterial(rainVert, {
    uTime: { value: 0 },
    uTop: { value: 7 },
    uMembrane: { value: 0 },
    uHalf: { value: new THREE.Vector2(W / 2, D / 2) },
    uIntensity: { value: 0 },
    uSize: { value: 2.2 },
    uPixelRatio: { value: pixelRatio },
  });
  const rain = new THREE.Points(rainGeo, rainMat);
  rain.frustumCulled = false;
  group.add(rain);

  const anchor = new THREE.Vector3();
  const rainDark = [new THREE.Color(0x9fe3ff), new THREE.Color(0xe8fbff)];
  const rainLight = [new THREE.Color(0x1479a8), new THREE.Color(0x0d5f88)];

  return {
    group,
    /** 0 = dark theme, 1 = light theme. */
    setTheme(mix) {
      rainMat.uniforms.uColor.value.lerpColors(rainDark[0], rainLight[0], mix);
      rainMat.uniforms.uColor2.value.lerpColors(rainDark[1], rainLight[1], mix);
      grid.material.opacity = 0.25 + mix * 0.2;
    },
    setPixelRatio(pr) {
      rainMat.uniforms.uPixelRatio.value = pr;
    },
    update({ elapsed, state }) {
      const e = state.water.explode;
      for (const l of layers) l.mesh.position.y = l.baseY + e * l.index * GAP;
      const membrane = layers[MEMBRANE];
      rainMat.uniforms.uMembrane.value = membrane.mesh.position.y + membrane.h / 2;
      rainMat.uniforms.uTop.value = layers[4].mesh.position.y + 3.5;
      rainMat.uniforms.uIntensity.value = state.water.rain;
      rainMat.uniforms.uTime.value = elapsed;
      // Membrane pulses gently while it holds the water back.
      membrane.mesh.material.emissiveIntensity = 0.45 + state.water.rain * (0.35 + Math.sin(elapsed * 3) * 0.15);
    },
    /** World-space anchor for each layer label. side: 1 = right edge, 0 = front centre. */
    labelAnchors(out, side = 1) {
      layers.forEach((l, i) => {
        anchor.set((side * W) / 2, l.mesh.position.y, D / 2);
        out[i] = group.localToWorld(out[i] ? out[i].copy(anchor) : anchor.clone());
      });
      return out;
    },
  };
}
