import{G as y,B as X,i as u,t as M,m as Y,r as V,s as L,E as Z,v as j,y as $,C as ee,V as oe,l as O,T as D,S as te,U as ne,b as ae,a as t,z as b,w as P,x as re,M as S}from"./three-CVDBZP3O.js";import{p as se}from"./particles.vert-B41EPLkG.js";import{d as ie}from"./world-Ctk6HFUz.js";import"./index-D5DhNhPH.js";const le=`varying vec2 vUv;\r
\r
#include <common>\r
#include <fog_pars_vertex>\r
\r
void main() {\r
  vUv = uv;\r
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r
  gl_Position = projectionMatrix * mvPosition;\r
  #include <fog_vertex>\r
}\r
`,ce=`// Injection resin travelling through the crack channel (tube uv.x = distance along crack).\r
uniform float uFill;\r
uniform float uTime;\r
uniform vec3 uPU;\r
uniform vec3 uEpoxy;\r
\r
varying vec2 vUv;\r
\r
#include <common>\r
#include <fog_pars_fragment>\r
\r
void main() {\r
  float t = vUv.x;\r
  if (t > uFill + 0.002) discard;\r
  vec3 base = mix(uPU, uEpoxy, smoothstep(0.42, 0.62, t));\r
  float flow = 0.65 + 0.35 * sin(t * 90.0 - uTime * 6.0);\r
  float front = exp(-(uFill - t) * 22.0);\r
  vec3 col = base * (flow * 1.4 + front * 4.0);\r
  gl_FragColor = vec4(col, 1.0);\r
  #include <tonemapping_fragment>\r
  #include <colorspace_fragment>\r
  #include <fog_fragment>\r
}\r
`;function pe({device:C,positions:W,pixelRatio:q}){const x=new y;x.position.copy(W.grout);const n=new y;x.add(n);const a={w:6,h:4,d:3},k=new X(a.w,a.h,a.d),w=new u(k,new M({color:9080985,roughness:.9,transparent:!0,opacity:.16,depthWrite:!1,side:Y}));w.renderOrder=2,n.add(w);const U=new V({color:13620959,transparent:!0,opacity:.55});n.add(new L(new Z(k),U));const F=[];for(let e=-6/2+.4;e<a.w/2;e+=.4)F.push(e,-4/2,a.d/2,e+.6,-4/2+.6,a.d/2);const G=new j;G.setAttribute("position",new $(F,3)),n.add(new L(G,new V({color:3065073,transparent:!0,opacity:.25})));const v=new ee([[-2.9,1.95,.3],[-2,1.1,.5],[-1.2,1.25,.2],[-.3,.3,.4],[.6,.05,.1],[1.5,-.9,.35],[2.3,-1.2,.15],[2.9,-1.95,.3]].map(e=>new oe(...e))),A=C.tier==="low"?120:220,T=new O({color:866895,transparent:!0,opacity:.85});n.add(new u(new D(v,A,.09,8),T));const d=new te({vertexShader:le,fragmentShader:ce,fog:!0,uniforms:ne.merge([ae.fog,{uFill:{value:0},uTime:{value:0},uPU:{value:new t(3065073)},uEpoxy:{value:new t(16758531)}}])});n.add(new u(new D(v,A,.1,10),d));const _=[.08,.28,.5,.72,.92],H=new b(.11,.11,.38,12),J=new b(.16,.16,.1,6),K=new M({color:13225686,metalness:.85,roughness:.3}),N=_.map(e=>{const s=v.getPointAt(e),o=new y;o.position.set(s.x,s.y,0);const r=a.d/2-s.z,f=new u(new b(.035,.035,r,6),new O({color:5923952}));f.rotation.x=Math.PI/2,f.position.z=s.z+r/2;const m=new M({color:3065073,emissive:3065073,emissiveIntensity:0,roughness:.4}),p=new u(H,K);p.rotation.x=Math.PI/2,p.position.z=a.d/2+.19;const c=new u(J,m);return c.rotation.x=Math.PI/2,c.position.z=a.d/2+.42,o.add(f,p,c),o.scale.setScalar(1e-4),n.add(o),{g:o,t:e,capMat:m}}),g=Math.round(220*C.particleScale)+30,B=new Float32Array(g*3),I=new Float32Array(g*4);for(let e=0;e<g;e++){const s=v.getPointAt(.15+Math.random()*.85);B.set([s.x,s.y,a.d/2+.03],e*3),I.set([Math.random(),Math.random(),Math.random(),Math.random()],e*4)}const h=new j;h.setAttribute("position",new P(new Float32Array(g*3),3)),h.setAttribute("aStart",new P(B,3)),h.setAttribute("aSeed",new P(I,4));const i=ie(se,{uTime:{value:0},uMode:{value:1},uIntensity:{value:1},uSize:{value:1.6},uFall:{value:4.5},uPixelRatio:{value:q}}),z=new re(h,i);z.frustumCulled=!1,n.add(z);const E=new t(3065073),R=new t(16758531),Q=new t(5857643),l={edge:[new t(13620959),new t(2765632)],leak:[new t(10478591),new t(1341864)],block:[new t(9080985),new t(6186608)]};return{group:x,setTheme(e){U.color.lerpColors(l.edge[0],l.edge[1],e),i.uniforms.uColor.value.lerpColors(l.leak[0],l.leak[1],e),i.uniforms.uColor2.value.copy(i.uniforms.uColor.value),w.material.color.lerpColors(l.block[0],l.block[1],e),w.material.opacity=.16+e*.1,d.uniforms.uPU.value.copy(E).multiplyScalar(1-e*.5),d.uniforms.uEpoxy.value.copy(R).multiplyScalar(1-e*.5)},setPixelRatio(e){i.uniforms.uPixelRatio.value=e},update({elapsed:e,state:s}){const o=s.grout;n.rotation.y=-.55+o.orbit*1.1,n.rotation.x=.08-o.orbit*.06,d.uniforms.uFill.value=o.flow,d.uniforms.uTime.value=e,T.opacity=.85-o.flow*.5,N.forEach((r,f)=>{const m=S.clamp(o.ports*_.length-f,0,1),p=m===0?1e-4:1-Math.pow(1-m,3);r.g.scale.setScalar(p);const c=S.clamp((o.flow-r.t+.06)*12,0,1);r.capMat.color.copy(Q).lerp(r.t<.5?E:R,c),r.capMat.emissive.copy(r.capMat.color),r.capMat.emissiveIntensity=c*2.2}),i.uniforms.uTime.value=e,i.uniforms.uIntensity.value=1-S.smoothstep(o.flow,.6,.95)}}}export{pe as createGrouting};
