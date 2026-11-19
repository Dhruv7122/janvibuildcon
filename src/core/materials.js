import * as THREE from 'three';
import noise from '../shaders/noise.glsl?raw';
import concreteVert from '../shaders/concrete.vert.glsl?raw';
import concreteFrag from '../shaders/concrete.frag.glsl?raw';
import pointsFrag from '../shaders/points.frag.glsl?raw';

/** Resolves our custom `#include "noise"` directive. */
export const glsl = (src) => src.replace('#include "noise"', noise);

/** Light rig shared by the custom concrete shader (keeps it consistent with three.js lights). */
export const LIGHT = {
  dir: new THREE.Vector3(-0.45, 0.8, 0.55).normalize(),
  color: new THREE.Color(1.0, 0.96, 0.9).multiplyScalar(1.15),
  sky: new THREE.Color(0x2a3d55),
  ground: new THREE.Color(0x07090d),
};

// Hemisphere colours per theme; world.js blends LIGHT.sky/ground between them.
export const LIGHT_THEMES = {
  dark: { sky: new THREE.Color(0x2a3d55), ground: new THREE.Color(0x07090d) },
  light: { sky: new THREE.Color(0x9fb4ca), ground: new THREE.Color(0x4a525c) },
};

export function createConcreteMaterial(device, opts = {}) {
  const material = new THREE.ShaderMaterial({
    vertexShader: concreteVert,
    fragmentShader: glsl(concreteFrag),
    defines: { OCTAVES: device.octaves },
    fog: true,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uTime: { value: 0 },
        uCrack: { value: opts.crack ?? 1 },
        uCrackWidth: { value: opts.crackWidth ?? 0.03 },
        uHeal: { value: opts.heal ?? 0 },
        uSmooth: { value: opts.smooth ?? 0 },
        uWet: { value: opts.wet ?? 0.15 },
        uRipple: { value: opts.ripple ?? 0 },
        uBump: { value: opts.bump ?? 0.025 },
        uSize: { value: opts.size ?? new THREE.Vector2(10, 10) },
        uBase: { value: new THREE.Color(opts.base ?? 0x8a9099).multiplyScalar(0.55) },
        uGlow: { value: new THREE.Color(opts.glow ?? 0x2ec4f1) },
        uLightDir: { value: LIGHT.dir },
        uLightColor: { value: LIGHT.color },
        uSky: { value: LIGHT.sky },
        uGround: { value: LIGHT.ground },
      },
    ]),
  });
  // merge() clones values; point back at the shared objects so theme changes propagate.
  material.uniforms.uLightDir.value = LIGHT.dir;
  material.uniforms.uLightColor.value = LIGHT.color;
  material.uniforms.uSky.value = LIGHT.sky;
  material.uniforms.uGround.value = LIGHT.ground;
  return material;
}

export function createPointsMaterial(vertexShader, uniforms, { additive = false } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: pointsFrag,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: {
      uColor: { value: new THREE.Color(0x9fe3ff) },
      uColor2: { value: new THREE.Color(0xe8fbff) },
      ...uniforms,
    },
  });
}

/** Small procedural canvas textures (no downloads). */
function canvasTexture(size, draw, repeat = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 4;
  return tex;
}

export function makeSpeckleTexture(base = '#6f757d', repeat = 1, size = 256) {
  return canvasTexture(
    size,
    (ctx, s) => {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < s * 6; i++) {
        const v = Math.random();
        ctx.fillStyle = v > 0.5 ? `rgba(255,255,255,${v * 0.12})` : `rgba(0,0,0,${(1 - v) * 0.18})`;
        const r = Math.random() * 1.8 + 0.3;
        ctx.fillRect(Math.random() * s, Math.random() * s, r, r);
      }
    },
    repeat
  );
}

export function makeTileTexture(repeat = 4) {
  return canvasTexture(
    256,
    (ctx, s) => {
      ctx.fillStyle = '#cfcac0';
      ctx.fillRect(0, 0, s, s);
      const g = ctx.createLinearGradient(0, 0, s, s);
      g.addColorStop(0, 'rgba(255,255,255,0.12)');
      g.addColorStop(1, 'rgba(0,0,0,0.1)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#7d7870';
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, s, s);
    },
    repeat
  );
}
