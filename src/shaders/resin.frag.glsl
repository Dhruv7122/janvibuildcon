// Injection resin travelling through the crack channel (tube uv.x = distance along crack).
uniform float uFill;
uniform float uTime;
uniform vec3 uPU;
uniform vec3 uEpoxy;

varying vec2 vUv;

#include <common>
#include <fog_pars_fragment>

void main() {
  float t = vUv.x;
  if (t > uFill + 0.002) discard;
  vec3 base = mix(uPU, uEpoxy, smoothstep(0.42, 0.62, t));
  float flow = 0.65 + 0.35 * sin(t * 90.0 - uTime * 6.0);
  float front = exp(-(uFill - t) * 22.0);
  vec3 col = base * (flow * 1.4 + front * 4.0);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
