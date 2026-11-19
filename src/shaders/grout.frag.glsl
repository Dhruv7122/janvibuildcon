// Epoxy grout surface sitting just below the tile tops. Everything past the fill front is
// discarded, so the dark, raked-out joints show until the grout sweeps across.
uniform float uFill;
uniform float uShine;
uniform float uTime;
uniform vec2 uSize;
uniform vec3 uGrout;
uniform vec3 uGlow;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormalW;

#include <common>
#include <fog_pars_fragment>

#include "noise"

void main() {
  vec2 p = (vUv - 0.5) * uSize;
  // Diagonal sweep from the far-right corner toward near-left: s = (-x + z)/√2 (plane uv.y runs along -Z).
  float s = (-p.x - p.y) * 0.7071;
  float half_ = length(uSize) * 0.5;
  float front = mix(-half_ - 1.0, half_ + 1.0, uFill) + (vnoise(vec2((p.x + p.y) * 0.8, 3.0)) - 0.5) * 1.2;
  if (s > front) discard;

  float glow = exp(-(front - s) * 2.5) * (1.0 - step(0.999, uFill));
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 H = normalize(normalize(uLightDir) + V);
  float spec = pow(max(H.y, 0.0), 140.0) * (0.5 + uShine);
  float fres = pow(1.0 - max(V.y, 0.0), 3.0) * 0.25;

  // Epoxy glitter flakes twinkle as the view changes.
  vec2 cell = floor(p * 90.0);
  float h = hash12(cell);
  float glitter = step(0.965, h) * (0.5 + 0.5 * sin(uTime * 3.0 + h * 40.0 + dot(V.xz, vec2(9.0))));

  vec3 col = uGrout * (0.6 + 0.25 * vnoise(p * 3.0));
  col += uLightColor * spec + vec3(fres);
  col += vec3(1.0, 0.9, 0.6) * glitter * (0.5 + uShine * 0.8);
  col += uGlow * glow * 2.5;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
