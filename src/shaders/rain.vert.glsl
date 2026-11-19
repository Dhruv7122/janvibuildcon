// Rain that falls through the porous top layers, stops on the membrane,
// beads, slides to the nearest edge and drips off. Fully GPU-animated.
attribute vec4 aSeed; // xy: position in [-1,1], z: phase offset, w: speed jitter

uniform float uTime;
uniform float uTop;
uniform float uMembrane;
uniform vec2 uHalf;
uniform float uIntensity;
uniform float uSize;
uniform float uPixelRatio;

varying float vAlpha;
varying float vBead;

void main() {
  float T = fract(uTime * (0.22 + aSeed.w * 0.16) + aSeed.z);
  vec2 xz = aSeed.xy * uHalf * 0.92;
  vec3 p;
  float bead = 0.0;
  float fallEnd = 0.5;

  if (T < fallEnd) {
    float k = T / fallEnd;
    p = vec3(xz.x, mix(uTop, uMembrane + 0.05, k * k), xz.y);
  } else {
    float k = (T - fallEnd) / (1.0 - fallEnd);
    float dir = aSeed.x >= 0.0 ? 1.0 : -1.0;
    float slideEnd = 0.7;
    bead = 1.0;
    if (k < slideEnd) {
      float s = k / slideEnd;
      p = vec3(mix(xz.x, dir * uHalf.x, s * s), uMembrane + 0.06, xz.y);
    } else {
      float s = (k - slideEnd) / (1.0 - slideEnd);
      p = vec3(dir * (uHalf.x + 0.12 + s * 0.2), uMembrane - s * s * 5.0, xz.y);
    }
  }

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float sizeMul = mix(0.8, 1.7, bead);
  gl_PointSize = uSize * uPixelRatio * sizeMul * (10.0 / -mv.z);
  vAlpha = uIntensity * smoothstep(0.0, 0.04, T) * (1.0 - smoothstep(0.93, 1.0, T));
  vBead = bead;
}
