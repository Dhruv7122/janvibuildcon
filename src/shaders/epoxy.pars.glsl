// Injected into MeshPhysicalMaterial (see scenes/epoxy.js):
// a glossy epoxy wave sweeps across a rough concrete floor along +X.
varying vec3 vWPos;
uniform float uWave;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uConcrete;

#include "noise"

float epoxyEdge() {
  return vWPos.x + (vnoise(vec2(vWPos.z * 0.25, 4.0)) - 0.5) * 4.0;
}

float epoxyFront() {
  return mix(-34.0, 34.0, uWave);
}
