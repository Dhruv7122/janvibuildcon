// Procedural concrete with a healable crack.
// uHeal: sealant fills the crack from one end to the other (0 → 1).
// uSmooth: the repaired surface blends to a smooth finish (0 → 1).
uniform float uTime;
uniform float uCrack;
uniform float uCrackWidth;
uniform float uHeal;
uniform float uSmooth;
uniform float uWet;
uniform float uRipple;
uniform float uBump;
uniform vec2 uSize;
uniform vec3 uBase;
uniform vec3 uGlow;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform vec3 uSky;
uniform vec3 uGround;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormalW;

#include <common>
#include <fog_pars_fragment>

#include "noise"

float crackY(float x) {
  return 0.5
    + 0.09 * sin(x * 5.1 + 1.3)
    + 0.05 * sin(x * 12.7 + 0.4)
    + (vnoise(vec2(x * 9.0, 1.7)) - 0.5) * 0.10
    + (vnoise(vec2(x * 70.0, 3.1)) - 0.5) * 0.012;
}

// x: coverage, y: param along crack (0..1), z: distance to main crack (world units)
vec3 crack(vec2 uv) {
  float s = (uv.x - 0.06) / 0.88;
  float inRange = step(0.0, s) * step(s, 1.0);
  float taper = smoothstep(0.0, 0.14, s) * smoothstep(1.0, 0.84, s);
  float cy = crackY(uv.x);
  float d = abs(uv.y - cy) * uSize.y;
  float w = uCrackWidth * (0.3 + 0.7 * taper) * (0.7 + 0.6 * vnoise(vec2(uv.x * 30.0, 0.0)));
  float m = (1.0 - smoothstep(w * 0.5, w + 1e-4, d)) * inRange;

  // A short branch splitting off the main crack.
  float bs = (uv.x - 0.38) / 0.24;
  if (bs > 0.0 && bs < 1.0) {
    float by = cy - bs * bs * 0.16 + (vnoise(vec2(uv.x * 40.0, 9.0)) - 0.5) * 0.01;
    float bd = abs(uv.y - by) * uSize.y;
    float bw = uCrackWidth * 0.6 * (1.0 - bs);
    m = max(m, 1.0 - smoothstep(bw * 0.5, bw + 1e-4, bd));
  }
  return vec3(m * uCrack, s, d);
}

// Bump mapping from a scalar height using screen-space derivatives (as in three.js bumpmap).
vec3 perturbNormal(vec3 pos, vec3 n, float h) {
  vec3 dpx = dFdx(pos);
  vec3 dpy = dFdy(pos);
  vec3 r1 = cross(dpy, n);
  vec3 r2 = cross(n, dpx);
  float det = dot(dpx, r1);
  vec2 dh = vec2(dFdx(h), dFdy(h));
  vec3 grad = sign(det) * (dh.x * r1 + dh.y * r2);
  return normalize(abs(det) * n - grad);
}

void main() {
  vec2 p = vUv * uSize;
  vec3 cr = crack(vUv);
  float m = cr.x;
  float s = cr.y;
  float d = cr.z;

  // Sealant front travels along the crack.
  float front = uHeal * 1.08 - 0.04;
  float filled = smoothstep(front + 0.015, front - 0.015, s);
  float open = m * (1.0 - filled);
  float glow = m * exp(-abs(s - front) * 40.0) * step(0.001, uHeal) * (1.0 - uSmooth);

  // Height field. Fine detail fades out when it gets smaller than a pixel (prevents bump aliasing).
  float fw = length(fwidth(p));
  float fine = 1.0 - smoothstep(0.008, 0.025, fw);
  float mid = 1.0 - smoothstep(0.03, 0.09, fw);
  float rough = 1.0 - uSmooth * 0.85;
  float pores = smoothstep(0.74, 0.86, vnoise(p * 22.0 + 7.0) * 0.6 + vnoise(p * 47.0 - 3.0) * 0.4) * fine;
  float h = (fbm(p * 1.3) * 0.6 + vnoise(p * 9.0) * 0.25 * mid) * rough;
  h -= pores * 0.22 * rough;
  h -= open * 1.4;
  h -= m * filled * 0.2 * (1.0 - uSmooth);

  if (uRipple > 0.0) {
    vec2 q = p - uSize * 0.5;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      vec2 c = vec2(sin(fi * 2.1 + 0.5) * 3.5, cos(fi * 1.7) * 2.5);
      float ph = fract(uTime * 0.09 + fi / 3.0);
      float r = length(q - c);
      float rr = ph * 10.0;
      h += uRipple * sin((r - rr) * 6.0) * exp(-abs(r - rr) * 1.4) * (1.0 - ph) * 0.35;
    }
  }

  // Albedo
  float tone = fbm(p * 0.6 + 3.0);
  vec3 albedo = uBase * (0.7 + 0.6 * tone);
  float agg = smoothstep(0.72, 0.9, vnoise(p * 14.0 + 1.3)) * mid;
  albedo = mix(albedo, albedo * 1.35, agg * 0.5 * rough);
  albedo *= 1.0 - pores * 0.25 * rough;
  float stain = exp(-d * 2.5) * uCrack * (1.0 - uHeal) * 0.35;
  albedo *= 1.0 - stain;
  albedo = mix(albedo, vec3(0.012), open);
  vec3 sealant = mix(vec3(0.2, 0.21, 0.23), uBase * 1.05, uSmooth);
  albedo = mix(albedo, sealant, m * filled);

  // Lighting: key light + hemisphere + gloss specular + fresnel
  vec3 N = perturbNormal(vWorldPos, normalize(vNormalW), h * uBump);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 H = normalize(L + V);
  float ndl = max(dot(N, L), 0.0);
  vec3 hemi = mix(uGround, uSky, N.y * 0.5 + 0.5);
  float gloss = clamp(uWet + uSmooth * 0.45 + m * filled * 0.3, 0.0, 1.0);
  float shin = mix(10.0, 200.0, gloss);
  float spec = pow(max(dot(N, H), 0.0), shin) * mix(0.03, 1.1, gloss);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);

  vec3 col = albedo * (uLightColor * ndl + hemi);
  col += uLightColor * spec + uSky * fres * gloss * 0.8;
  col += uGlow * glow * 5.0;
  col += uGlow * m * filled * (1.0 - uSmooth) * 0.3;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
