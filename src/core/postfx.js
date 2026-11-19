import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import grainFrag from '../shaders/grain.frag.glsl?raw';

/**
 * Optional post-processing (high tier only, loaded on demand):
 * bloom on glowing resin/sealant + subtle grain and vignette.
 */
export function createPostFX({ renderer, scene, camera, width, height }) {
  // Default composer targets are HalfFloat, so HDR glow values survive until bloom.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(new THREE.Vector2(width / 2, height / 2), 0.55, 0.5, 0.82);
  composer.addPass(bloom);

  const grain = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uGrain: { value: 0.06 },
      uVignette: { value: 1.1 },
    },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: grainFrag,
  });
  composer.addPass(grain);
  composer.addPass(new OutputPass());

  return {
    render(elapsed) {
      grain.uniforms.uTime.value = elapsed;
      composer.render();
    },
    setSize(w, h, pr) {
      composer.setPixelRatio(pr);
      composer.setSize(w, h);
      bloom.resolution.set(w / 2, h / 2);
    },
    /** 0 = dark, 1 = light: a bright background must not bloom, and a dark vignette looks dirty on light paper. */
    setTheme(mix) {
      bloom.threshold = 0.82 + mix * 0.5;
      bloom.strength = 0.55 - mix * 0.2;
      grain.uniforms.uVignette.value = 1.1 - mix * 0.8;
      grain.uniforms.uGrain.value = 0.06 - mix * 0.03;
    },
    dispose() {
      composer.passes.forEach((p) => p.dispose?.());
      composer.dispose();
    },
  };
}
