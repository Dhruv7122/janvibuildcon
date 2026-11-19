// Film grain + vignette post pass (runs before OutputPass, in linear space).
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uGrain;
uniform float uVignette;

varying vec2 vUv;

float rand(vec2 co, float t) {
  return fract(sin(dot(co + t, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 c = texture2D(tDiffuse, vUv);
  float n = rand(vUv * 1000.0, fract(uTime)) - 0.5;
  c.rgb += n * uGrain * (0.4 + c.rgb);
  vec2 q = vUv - 0.5;
  float v = 1.0 - dot(q, q) * uVignette;
  c.rgb *= clamp(v, 0.0, 1.0);
  gl_FragColor = c;
}
