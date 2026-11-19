// Generic drifting/dripping particles.
// uMode 0: dust drifting around a centre. uMode 1: drips falling from a start point.
attribute vec3 aStart;
attribute vec4 aSeed;

uniform float uTime;
uniform float uMode;
uniform float uIntensity;
uniform float uSize;
uniform float uPixelRatio;
uniform float uFall;

varying float vAlpha;
varying float vBead;

void main() {
  vec3 p;
  float a;
  if (uMode < 0.5) {
    float t = uTime * (0.05 + aSeed.w * 0.08) + aSeed.z * 6.2831;
    p = aStart + vec3(sin(t) * 0.35, sin(t * 0.7 + aSeed.x * 5.0) * 0.25 + fract(uTime * 0.03 + aSeed.y) * 0.6, cos(t * 0.8) * 0.2);
    a = 0.55 * (0.4 + 0.6 * sin(t * 2.0) * sin(t * 2.0));
  } else {
    float T = fract(uTime * (0.35 + aSeed.w * 0.3) + aSeed.z);
    float creep = smoothstep(0.0, 0.45, T);
    float fall = max(T - 0.45, 0.0) / 0.55;
    p = aStart + vec3(0.0, -creep * 0.25 - fall * fall * uFall, 0.0);
    a = smoothstep(0.0, 0.1, T) * (1.0 - smoothstep(0.85, 1.0, T));
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (0.6 + aSeed.w * 0.8) * (10.0 / -mv.z);
  vAlpha = a * uIntensity;
  vBead = uMode;
}
