// Soft round particle used by rain, leaks and dust.
uniform vec3 uColor;
uniform vec3 uColor2;

varying float vAlpha;
varying float vBead;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.1, d) * vAlpha;
  // Tiny highlight makes beads read as droplets.
  float hi = smoothstep(0.18, 0.0, length(c + vec2(0.14, 0.14)));
  vec3 col = mix(uColor, uColor2, vBead) + hi * 0.8;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
