import * as THREE from 'three';
import basicVert from '../shaders/basic.vert.glsl?raw';
import resinFrag from '../shaders/resin.frag.glsl?raw';
import particlesVert from '../shaders/particles.vert.glsl?raw';
import { createPointsMaterial } from '../core/materials.js';

/**
 * SEQ 004 — Injection grouting.
 * A semi-transparent concrete block with a leak path. Packers pop in along the crack,
 * then resin (cyan PU → amber epoxy) flows through the channel from port to port.
 * Leaking drips stop once the channel is sealed.
 */
export function createGrouting({ device, positions, pixelRatio }) {
  const group = new THREE.Group();
  group.position.copy(positions.grout);
  const pivot = new THREE.Group();
  group.add(pivot);

  const B = { w: 6, h: 4, d: 3 };
  const blockGeo = new THREE.BoxGeometry(B.w, B.h, B.d);
  const block = new THREE.Mesh(
    blockGeo,
    new THREE.MeshStandardMaterial({ color: 0x8a9099, roughness: 0.9, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide })
  );
  block.renderOrder = 2;
  pivot.add(block);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xcfd6df, transparent: true, opacity: 0.55 });
  pivot.add(new THREE.LineSegments(new THREE.EdgesGeometry(blockGeo), edgeMat));

  // Hatched cross-section lines on the front face (blueprint feel).
  const hatchPts = [];
  for (let i = -B.w / 2 + 0.4; i < B.w / 2; i += 0.4) hatchPts.push(i, -B.h / 2, B.d / 2, i + 0.6, -B.h / 2 + 0.6, B.d / 2);
  const hatchGeo = new THREE.BufferGeometry();
  hatchGeo.setAttribute('position', new THREE.Float32BufferAttribute(hatchPts, 3));
  pivot.add(new THREE.LineSegments(hatchGeo, new THREE.LineBasicMaterial({ color: 0x2ec4f1, transparent: true, opacity: 0.25 })));

  // Leak path through the block.
  const curve = new THREE.CatmullRomCurve3(
    [
      [-2.9, 1.95, 0.3],
      [-2.0, 1.1, 0.5],
      [-1.2, 1.25, 0.2],
      [-0.3, 0.3, 0.4],
      [0.6, 0.05, 0.1],
      [1.5, -0.9, 0.35],
      [2.3, -1.2, 0.15],
      [2.9, -1.95, 0.3],
    ].map((p) => new THREE.Vector3(...p))
  );
  const segs = device.tier === 'low' ? 120 : 220;
  const voidMat = new THREE.MeshBasicMaterial({ color: 0x0d3a4f, transparent: true, opacity: 0.85 });
  pivot.add(new THREE.Mesh(new THREE.TubeGeometry(curve, segs, 0.09, 8), voidMat));

  const resinMat = new THREE.ShaderMaterial({
    vertexShader: basicVert,
    fragmentShader: resinFrag,
    fog: true,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uFill: { value: 0 },
        uTime: { value: 0 },
        uPU: { value: new THREE.Color(0x2ec4f1) },
        uEpoxy: { value: new THREE.Color(0xffb703) },
      },
    ]),
  });
  pivot.add(new THREE.Mesh(new THREE.TubeGeometry(curve, segs, 0.1, 10), resinMat));

  // Packers: drill line from crack to the front face + a packer head outside it.
  const PORTS = [0.08, 0.28, 0.5, 0.72, 0.92];
  const headGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.38, 12);
  const capGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 6);
  const metal = new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.85, roughness: 0.3 });
  const packers = PORTS.map((t) => {
    const p = curve.getPointAt(t);
    const g = new THREE.Group();
    g.position.set(p.x, p.y, 0);
    const drillLen = B.d / 2 - p.z;
    const drill = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, drillLen, 6), new THREE.MeshBasicMaterial({ color: 0x5a6470 }));
    drill.rotation.x = Math.PI / 2;
    drill.position.z = p.z + drillLen / 2;
    const capMat = new THREE.MeshStandardMaterial({ color: 0x2ec4f1, emissive: 0x2ec4f1, emissiveIntensity: 0, roughness: 0.4 });
    const head = new THREE.Mesh(headGeo, metal);
    head.rotation.x = Math.PI / 2;
    head.position.z = B.d / 2 + 0.19;
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.rotation.x = Math.PI / 2;
    cap.position.z = B.d / 2 + 0.42;
    g.add(drill, head, cap);
    g.scale.setScalar(0.0001);
    pivot.add(g);
    return { g, t, capMat };
  });

  // Leak drips emerging along the crack on the front face.
  const count = Math.round(220 * device.particleScale) + 30;
  const starts = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const p = curve.getPointAt(0.15 + Math.random() * 0.85);
    starts.set([p.x, p.y, B.d / 2 + 0.03], i * 3);
    seeds.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('aStart', new THREE.BufferAttribute(starts, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  const leakMat = createPointsMaterial(particlesVert, {
    uTime: { value: 0 },
    uMode: { value: 1 },
    uIntensity: { value: 1 },
    uSize: { value: 1.6 },
    uFall: { value: 4.5 },
    uPixelRatio: { value: pixelRatio },
  });
  const leak = new THREE.Points(geo, leakMat);
  leak.frustumCulled = false;
  pivot.add(leak);

  const pu = new THREE.Color(0x2ec4f1);
  const ep = new THREE.Color(0xffb703);
  const idle = new THREE.Color(0x59616b);
  const themeCols = {
    edge: [new THREE.Color(0xcfd6df), new THREE.Color(0x2a3340)],
    leak: [new THREE.Color(0x9fe3ff), new THREE.Color(0x1479a8)],
    block: [new THREE.Color(0x8a9099), new THREE.Color(0x5e6670)],
  };

  return {
    group,
    /** 0 = dark theme, 1 = light theme. */
    setTheme(mix) {
      edgeMat.color.lerpColors(themeCols.edge[0], themeCols.edge[1], mix);
      leakMat.uniforms.uColor.value.lerpColors(themeCols.leak[0], themeCols.leak[1], mix);
      leakMat.uniforms.uColor2.value.copy(leakMat.uniforms.uColor.value);
      block.material.color.lerpColors(themeCols.block[0], themeCols.block[1], mix);
      block.material.opacity = 0.16 + mix * 0.1;
      // Dimmer HDR resin keeps its hue against the brighter light-theme exposure.
      resinMat.uniforms.uPU.value.copy(pu).multiplyScalar(1 - mix * 0.5);
      resinMat.uniforms.uEpoxy.value.copy(ep).multiplyScalar(1 - mix * 0.5);
    },
    setPixelRatio(pr) {
      leakMat.uniforms.uPixelRatio.value = pr;
    },
    update({ elapsed, state }) {
      const g = state.grout;
      pivot.rotation.y = -0.55 + g.orbit * 1.1;
      pivot.rotation.x = 0.08 - g.orbit * 0.06;
      resinMat.uniforms.uFill.value = g.flow;
      resinMat.uniforms.uTime.value = elapsed;
      voidMat.opacity = 0.85 - g.flow * 0.5;

      packers.forEach((p, i) => {
        const s = THREE.MathUtils.clamp(g.ports * PORTS.length - i, 0, 1);
        const eased = s === 0 ? 0.0001 : 1 - Math.pow(1 - s, 3);
        p.g.scale.setScalar(eased);
        const reached = THREE.MathUtils.clamp((g.flow - p.t + 0.06) * 12, 0, 1);
        p.capMat.color.copy(idle).lerp(p.t < 0.5 ? pu : ep, reached);
        p.capMat.emissive.copy(p.capMat.color);
        p.capMat.emissiveIntensity = reached * 2.2;
      });

      leakMat.uniforms.uTime.value = elapsed;
      leakMat.uniforms.uIntensity.value = 1 - THREE.MathUtils.smoothstep(g.flow, 0.6, 0.95);
    },
  };
}
