// Leak detection wall: normal view (plaster + tiles) revealed as a thermal false-colour
// image behind a sweeping scan line. The leak shows as a cold blob below a pipe joint.
uniform float uTime;
uniform float uScan;   // 0 → 1 sweep of the thermal reveal
uniform float uLock;   // 0 → 1 lock-on rings at the leak
uniform vec2 uSize;
uniform vec2 uLeak;    // leak position in uv
uniform vec3 uScanColor;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormalW;

#include <common>
#include <fog_pars_fragment>

#include "noise"

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Rainbow thermal palette: cold (deep blue) → hot (red).
vec3 thermal(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(vec3(0.05, 0.05, 0.35), vec3(0.0, 0.35, 0.9), smoothstep(0.0, 0.2, t));
  c = mix(c, vec3(0.0, 0.8, 0.7), smoothstep(0.2, 0.4, t));
  c = mix(c, vec3(0.6, 0.9, 0.1), smoothstep(0.4, 0.6, t));
  c = mix(c, vec3(1.0, 0.55, 0.0), smoothstep(0.6, 0.8, t));
  return mix(c, vec3(1.0, 0.15, 0.1), smoothstep(0.8, 1.0, t));
}

void main() {
  vec2 p = vUv * uSize;
  vec2 L = uLeak * uSize;
  vec2 joint = L + vec2(0.0, 0.45);

  // --- Temperature field
  float T = 0.42 + 0.22 * fbm(p * 0.45 + 2.0) + vUv.y * 0.12;
  float pipe = segDist(p, vec2(uSize.x - 0.3, joint.y), joint);
  T += 0.3 * exp(-pipe * pipe * 14.0);
  vec2 d = p - L;
  d.y *= d.y < 0.0 ? 0.45 : 1.2; // moisture spreads downward
  float cold = exp(-dot(d, d) * 0.55) * (0.92 + 0.08 * sin(uTime * 1.5));
  T -= 0.62 * cold;

  // --- Normal (visible light) view: plaster above, tiles below the dado line
  float tileZone = step(vUv.y, 0.42);
  vec2 tg = fract(p / vec2(0.6, 0.6));
  float joints = 1.0 - smoothstep(0.0, 0.03, min(min(tg.x, 1.0 - tg.x), min(tg.y, 1.0 - tg.y)));
  vec3 plaster = vec3(0.62, 0.6, 0.57) * (0.85 + 0.25 * fbm(p * 2.0));
  vec3 tile = mix(vec3(0.7, 0.72, 0.74), vec3(0.32, 0.33, 0.35), joints);
  vec3 albedo = mix(plaster, tile, tileZone);
  albedo *= 1.0 - cold * 0.12; // a barely visible damp shadow
  float light = 0.55 + 0.45 * vUv.y;
  vec3 normalView = albedo * light * 0.75;

  // --- Thermal view with sensor scanlines
  vec3 thermalView = thermal(T) * (0.92 + 0.08 * sin(vUv.y * 420.0)) * 1.15;

  float front = uScan * 1.06 - 0.03;
  float reveal = smoothstep(front + 0.004, front - 0.004, vUv.x);
  vec3 col = mix(normalView, thermalView, reveal);
  float scanLine = exp(-abs(vUv.x - front) * 260.0) * step(0.001, uScan) * (1.0 - step(0.999, uScan));
  col += uScanColor * scanLine * 3.0;

  // --- Lock-on rings at the leak
  float r = length(p - L);
  float rings = smoothstep(0.9, 1.0, sin(r * 7.0 - uTime * 5.0)) * exp(-r * 1.3) * uLock;
  col += vec3(1.0) * rings * 0.7;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
