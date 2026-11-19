import{G as b,S as k,U as S,b as L,a as T,c as m,i as d,k as v,E as U,r as V,s as z,V as C}from"./three-CVDBZP3O.js";import{a as M,g as j,c as _}from"./world-Ctk6HFUz.js";import"./index-D5DhNhPH.js";const G=`// Leak detection wall: normal view (plaster + tiles) revealed as a thermal false-colour\r
// image behind a sweeping scan line. The leak shows as a cold blob below a pipe joint.\r
uniform float uTime;\r
uniform float uScan;   // 0 → 1 sweep of the thermal reveal\r
uniform float uLock;   // 0 → 1 lock-on rings at the leak\r
uniform vec2 uSize;\r
uniform vec2 uLeak;    // leak position in uv\r
uniform vec3 uScanColor;\r
\r
varying vec2 vUv;\r
varying vec3 vWorldPos;\r
varying vec3 vNormalW;\r
\r
#include <common>\r
#include <fog_pars_fragment>\r
\r
#include "noise"\r
\r
float segDist(vec2 p, vec2 a, vec2 b) {\r
  vec2 pa = p - a;\r
  vec2 ba = b - a;\r
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);\r
  return length(pa - ba * h);\r
}\r
\r
// Rainbow thermal palette: cold (deep blue) → hot (red).\r
vec3 thermal(float t) {\r
  t = clamp(t, 0.0, 1.0);\r
  vec3 c = mix(vec3(0.05, 0.05, 0.35), vec3(0.0, 0.35, 0.9), smoothstep(0.0, 0.2, t));\r
  c = mix(c, vec3(0.0, 0.8, 0.7), smoothstep(0.2, 0.4, t));\r
  c = mix(c, vec3(0.6, 0.9, 0.1), smoothstep(0.4, 0.6, t));\r
  c = mix(c, vec3(1.0, 0.55, 0.0), smoothstep(0.6, 0.8, t));\r
  return mix(c, vec3(1.0, 0.15, 0.1), smoothstep(0.8, 1.0, t));\r
}\r
\r
void main() {\r
  vec2 p = vUv * uSize;\r
  vec2 L = uLeak * uSize;\r
  vec2 joint = L + vec2(0.0, 0.45);\r
\r
  // --- Temperature field\r
  float T = 0.42 + 0.22 * fbm(p * 0.45 + 2.0) + vUv.y * 0.12;\r
  float pipe = segDist(p, vec2(uSize.x - 0.3, joint.y), joint);\r
  T += 0.3 * exp(-pipe * pipe * 14.0);\r
  vec2 d = p - L;\r
  d.y *= d.y < 0.0 ? 0.45 : 1.2; // moisture spreads downward\r
  float cold = exp(-dot(d, d) * 0.55) * (0.92 + 0.08 * sin(uTime * 1.5));\r
  T -= 0.62 * cold;\r
\r
  // --- Normal (visible light) view: plaster above, tiles below the dado line\r
  float tileZone = step(vUv.y, 0.42);\r
  vec2 tg = fract(p / vec2(0.6, 0.6));\r
  float joints = 1.0 - smoothstep(0.0, 0.03, min(min(tg.x, 1.0 - tg.x), min(tg.y, 1.0 - tg.y)));\r
  vec3 plaster = vec3(0.62, 0.6, 0.57) * (0.85 + 0.25 * fbm(p * 2.0));\r
  vec3 tile = mix(vec3(0.7, 0.72, 0.74), vec3(0.32, 0.33, 0.35), joints);\r
  vec3 albedo = mix(plaster, tile, tileZone);\r
  albedo *= 1.0 - cold * 0.12; // a barely visible damp shadow\r
  float light = 0.55 + 0.45 * vUv.y;\r
  vec3 normalView = albedo * light * 0.75;\r
\r
  // --- Thermal view with sensor scanlines\r
  vec3 thermalView = thermal(T) * (0.92 + 0.08 * sin(vUv.y * 420.0)) * 1.15;\r
\r
  float front = uScan * 1.06 - 0.03;\r
  float reveal = smoothstep(front + 0.004, front - 0.004, vUv.x);\r
  vec3 col = mix(normalView, thermalView, reveal);\r
  float scanLine = exp(-abs(vUv.x - front) * 260.0) * step(0.001, uScan) * (1.0 - step(0.999, uScan));\r
  col += uScanColor * scanLine * 3.0;\r
\r
  // --- Lock-on rings at the leak\r
  float r = length(p - L);\r
  float rings = smoothstep(0.9, 1.0, sin(r * 7.0 - uTime * 5.0)) * exp(-r * 1.3) * uLock;\r
  col += vec3(1.0) * rings * 0.7;\r
\r
  gl_FragColor = vec4(col, 1.0);\r
  #include <tonemapping_fragment>\r
  #include <colorspace_fragment>\r
  #include <fog_fragment>\r
}\r
`;function A({device:p,positions:h}){const n=new b;n.position.copy(h.leak);const e=new m(12,7),t=new m(.4,.52),u=new k({vertexShader:M,fragmentShader:j(G),defines:{OCTAVES:Math.min(p.octaves,4)},fog:!0,uniforms:S.merge([L.fog,{uTime:{value:0},uScan:{value:0},uLock:{value:0},uSize:{value:e},uLeak:{value:t},uScanColor:{value:new T(3065073)}}])}),r=new d(new v(e.x,e.y),u);r.position.y=e.y/2-1.5,n.add(r);const o=new m(16,8),i=new d(new v(o.x,o.y),_(p,{size:o,crack:0,wet:.3,bump:.02}));i.rotation.x=-Math.PI/2,i.position.set(0,-1.5,o.y/2),n.add(i);const g=new U(new v(1.6,e.y+.4)),f=new V({color:3065073,transparent:!0,opacity:0}),l=new z(g,f);l.position.set(0,r.position.y,.05),n.add(l);const w=new C((t.x-.5)*e.x,r.position.y+(t.y-.5)*e.y,.02);return{group:n,update({elapsed:c,state:y}){const{scan:a,lock:x}=y.leak,s=u.uniforms;s.uTime.value=c,s.uScan.value=a,s.uLock.value=x,l.position.x=(a*1.06-.03-.5)*e.x,f.opacity=a>.001&&a<.999?.8:0},markerAnchor(c){return n.localToWorld(c.copy(w))}}}export{A as createLeak};
