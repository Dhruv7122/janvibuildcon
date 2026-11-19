// Procedural concrete surface (hero slab, crack wall, outro surface).
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormalW;

#include <common>
#include <fog_pars_vertex>

void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
