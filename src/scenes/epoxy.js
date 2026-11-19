import * as THREE from 'three';
import { glsl } from '../core/materials.js';
import epoxyPars from '../shaders/epoxy.pars.glsl?raw';

/**
 * SEQ 005 — Epoxy work.
 * A wide floor: a glossy epoxy wave sweeps across dull concrete, animating
 * colour, roughness and clearcoat per-pixel. Reflections come from the scene environment map.
 */
export function createEpoxy({ device, positions }) {
  const group = new THREE.Group();
  group.position.copy(positions.epoxy);

  const uniforms = {
    uWave: { value: 0 },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x8a9099) },
    uConcrete: { value: new THREE.Color(0x4a4e55) },
  };

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 0.9,
  });
  // Keep the built-in STANDARD/PHYSICAL defines.
  mat.defines.OCTAVES = Math.min(device.octaves, 4);
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${glsl(epoxyPars)}`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        vec2 fp = vWPos.xz;
        float edge = epoxyEdge();
        float front = epoxyFront();
        float eMask = smoothstep(front + 0.9, front - 0.9, edge);
        float joints = max(smoothstep(0.04, 0.0, abs(fract(fp.x / 4.0) - 0.5) - 0.48), smoothstep(0.04, 0.0, abs(fract(fp.y / 4.0) - 0.5) - 0.48));
        vec3 concreteCol = uConcrete * (0.55 + 0.7 * fbm(fp * 0.7)) * (1.0 - joints * 0.5);
        concreteCol *= 1.0 - smoothstep(0.75, 0.9, vnoise(fp * 9.0)) * 0.3;
        vec3 epoxyCol = uColor * 0.5 * (0.92 + 0.08 * vnoise(fp * 0.4));
        diffuseColor.rgb = mix(concreteCol, epoxyCol, eMask);
        float waveGlow = exp(-abs(edge - front) * 3.0) * step(0.001, uWave) * (1.0 - step(0.999, uWave));`
      )
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(0.95, 0.12, eMask);')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(1.0, 0.72, 0.2) * waveGlow * 1.4;')
      .replace(
        '#include <lights_physical_fragment>',
        '#include <lights_physical_fragment>\n#ifdef USE_CLEARCOAT\nmaterial.clearcoat *= eMask;\n#endif'
      );
  };

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 48, 1, 1), mat);
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);

  // Columns + warm light strips give the gloss something to read against.
  const colGeo = new THREE.BoxGeometry(0.9, 9, 0.9);
  const colMat = new THREE.MeshStandardMaterial({ color: 0x3a3f47, roughness: 0.85 });
  const stripGeo = new THREE.BoxGeometry(6, 0.08, 0.3);
  const stripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.9, 0.75).multiplyScalar(3) });
  for (let i = -3; i <= 3; i++) {
    const c = new THREE.Mesh(colGeo, colMat);
    c.position.set(i * 8, 4.5, -10);
    group.add(c);
    const s = new THREE.Mesh(stripGeo, stripMat);
    s.position.set(i * 8 + 4, 6.5, -4);
    group.add(s);
  }

  const target = new THREE.Color();

  return {
    group,
    update({ elapsed, state }) {
      uniforms.uWave.value = state.epoxy.wave;
      uniforms.uTime.value = elapsed;
    },
    setColor(hex, gsap) {
      target.set(hex);
      gsap.to(uniforms.uColor.value, { r: target.r, g: target.g, b: target.b, duration: 0.9, ease: 'power3.out' });
    },
  };
}
