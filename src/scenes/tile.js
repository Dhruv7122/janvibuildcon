import * as THREE from 'three';
import concreteVert from '../shaders/concrete.vert.glsl?raw';
import groutFrag from '../shaders/grout.frag.glsl?raw';
import { glsl, LIGHT } from '../core/materials.js';

/**
 * SEQ 007 — Tile epoxy filling.
 * A tiled floor with raked-out (dark, empty) joints. On scroll, glittering epoxy grout
 * sweeps diagonally through every joint while a grout float rides the fill front.
 */
export function createTile({ positions }) {
  const group = new THREE.Group();
  group.position.copy(positions.tile);

  const COLS = 16;
  const ROWS = 12;
  const PITCH = 1;
  const TILE = 0.9;
  const TOP = 0.08;
  const size = new THREE.Vector2(COLS * PITCH, ROWS * PITCH);

  // Tiles: one instanced mesh with slight colour variation.
  const tileMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.22,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
    envMapIntensity: 0.8,
  });
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(TILE, 0.12, TILE), tileMat, COLS * ROWS);
  const m4 = new THREE.Matrix4();
  const tint = new THREE.Color();
  let n = 0;
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      m4.makeTranslation((i - COLS / 2 + 0.5) * PITCH, TOP - 0.06, (j - ROWS / 2 + 0.5) * PITCH);
      tiles.setMatrixAt(n, m4);
      tint.setHSL(0.09, 0.12, 0.78 + (Math.random() - 0.5) * 0.05);
      tiles.setColorAt(n, tint);
      n++;
    }
  }
  group.add(tiles);

  // Deep, empty joints visible before the grout arrives.
  const deep = new THREE.Mesh(new THREE.PlaneGeometry(size.x, size.y), new THREE.MeshBasicMaterial({ color: 0x050608 }));
  deep.rotation.x = -Math.PI / 2;
  deep.position.y = -0.15;
  group.add(deep);

  // Epoxy grout surface, slightly recessed below the tile tops.
  const groutMat = new THREE.ShaderMaterial({
    vertexShader: concreteVert,
    fragmentShader: glsl(groutFrag),
    defines: { OCTAVES: 3 },
    fog: true,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uFill: { value: 0 },
        uShine: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: size },
        uGrout: { value: new THREE.Color(0xc9a85a) },
        uGlow: { value: new THREE.Color(0xffb703) },
        uLightDir: { value: null },
        uLightColor: { value: null },
      },
    ]),
  });
  // Shared light objects (merge() would have cloned them).
  groutMat.uniforms.uLightDir.value = LIGHT.dir;
  groutMat.uniforms.uLightColor.value = LIGHT.color;
  const grout = new THREE.Mesh(new THREE.PlaneGeometry(size.x, size.y), groutMat);
  grout.rotation.x = -Math.PI / 2;
  grout.position.y = TOP - 0.025;
  group.add(grout);

  // Rubber grout float that rides the fill front.
  const float = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.55), new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.7 }));
  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.16, 0.14),
    new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.4, metalness: 0.2 })
  );
  handle.position.y = 0.2;
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.1), handle.material);
  post.position.y = 0.09;
  float.add(blade, handle, post);
  float.rotation.y = -Math.PI / 4;
  group.add(float);

  const halfDiag = size.length() / 2 + 1;
  const along = new THREE.Vector2(1, 1).normalize();

  return {
    group,
    update({ elapsed, state }) {
      const { fill, shine } = state.tile;
      const u = groutMat.uniforms;
      u.uFill.value = fill;
      u.uShine.value = shine;
      u.uTime.value = elapsed;

      // Front line s = (-x + z)/√2 = f; slide back and forth along it.
      const f = THREE.MathUtils.lerp(-halfDiag, halfDiag, fill) - 0.6;
      const t = Math.sin(elapsed * 1.4) * 2.5;
      float.position.set(-f * Math.SQRT1_2 + t * along.x, TOP + 0.04, f * Math.SQRT1_2 + t * along.y);
      float.rotation.z = Math.sin(elapsed * 1.4 + 1) * 0.05;
      float.visible = fill > 0.01 && fill < 0.99;
    },
  };
}
