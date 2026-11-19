import{g as x}from"./world-Ctk6HFUz.js";import{G as y,a as t,n as h,i as c,k as w,B as u,t as C,l as M}from"./three-CVDBZP3O.js";import"./index-D5DhNhPH.js";const _=`// Injected into MeshPhysicalMaterial (see scenes/epoxy.js):\r
// a glossy epoxy wave sweeps across a rough concrete floor along +X.\r
varying vec3 vWPos;\r
uniform float uWave;\r
uniform float uTime;\r
uniform vec3 uColor;\r
uniform vec3 uConcrete;\r
\r
#include "noise"\r
\r
float epoxyEdge() {\r
  return vWPos.x + (vnoise(vec2(vWPos.z * 0.25, 4.0)) - 0.5) * 4.0;\r
}\r
\r
float epoxyFront() {\r
  return mix(-34.0, 34.0, uWave);\r
}\r
`;function G({device:f,positions:m}){const n=new y;n.position.copy(m.epoxy);const a={uWave:{value:0},uTime:{value:0},uColor:{value:new t(9080985)},uConcrete:{value:new t(4869717)}},s=new h({color:16777215,roughness:.9,metalness:0,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:.9});s.defines.OCTAVES=Math.min(f.octaves,4),s.onBeforeCompile=e=>{Object.assign(e.uniforms,a),e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vWPos;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
${x(_)}`).replace("#include <color_fragment>",`#include <color_fragment>
        vec2 fp = vWPos.xz;
        float edge = epoxyEdge();
        float front = epoxyFront();
        float eMask = smoothstep(front + 0.9, front - 0.9, edge);
        float joints = max(smoothstep(0.04, 0.0, abs(fract(fp.x / 4.0) - 0.5) - 0.48), smoothstep(0.04, 0.0, abs(fract(fp.y / 4.0) - 0.5) - 0.48));
        vec3 concreteCol = uConcrete * (0.55 + 0.7 * fbm(fp * 0.7)) * (1.0 - joints * 0.5);
        concreteCol *= 1.0 - smoothstep(0.75, 0.9, vnoise(fp * 9.0)) * 0.3;
        vec3 epoxyCol = uColor * 0.5 * (0.92 + 0.08 * vnoise(fp * 0.4));
        diffuseColor.rgb = mix(concreteCol, epoxyCol, eMask);
        float waveGlow = exp(-abs(edge - front) * 3.0) * step(0.001, uWave) * (1.0 - step(0.999, uWave));`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
roughnessFactor = mix(0.95, 0.12, eMask);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(1.0, 0.72, 0.2) * waveGlow * 1.4;`).replace("#include <lights_physical_fragment>",`#include <lights_physical_fragment>
#ifdef USE_CLEARCOAT
material.clearcoat *= eMask;
#endif`)};const l=new c(new w(80,48,1,1),s);l.rotation.x=-Math.PI/2,n.add(l);const p=new u(.9,9,.9),v=new C({color:3817287,roughness:.85}),d=new u(6,.08,.3),g=new M({color:new t(1,.9,.75).multiplyScalar(3)});for(let e=-3;e<=3;e++){const o=new c(p,v);o.position.set(e*8,4.5,-10),n.add(o);const i=new c(d,g);i.position.set(e*8+4,6.5,-4),n.add(i)}const r=new t;return{group:n,update({elapsed:e,state:o}){a.uWave.value=o.epoxy.wave,a.uTime.value=e},setColor(e,o){r.set(e),o.to(a.uColor.value,{r:r.r,g:r.g,b:r.b,duration:.9,ease:"power3.out"})}}}export{G as createEpoxy};
