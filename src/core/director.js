import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

/**
 * Scroll director.
 * One scroll value is mapped to a "section time" (section i spans time i → i+1, where
 * time i = section i's top reaching the top of the viewport). A paused GSAP timeline,
 * authored in those section units, is scrubbed to that time each frame and drives:
 * camera curve parameter, fog/background, view shift and every scene's progress.
 */

// Per-section look (keyed by section id): background/fog colour (dark + light theme), fog density, horizontal shift of the 3D subject.
const LOOKS = {
  hero: { bg: 0x070b12, light: 0xeef1f4, fog: 0.045, shift: 0, lift: 0 },
  leak: { bg: 0x090b12, light: 0xeceff3, fog: 0.035, shift: -0.2, lift: 1 }, // panel right
  waterproofing: { bg: 0x06121d, light: 0xe3eef5, fog: 0.032, shift: 0.2, lift: 1 }, // panel left
  crack: { bg: 0x0b0d11, light: 0xeceef1, fog: 0.05, shift: -0.2, lift: 1 }, // panel right
  grouting: { bg: 0x050a13, light: 0xe6ecf3, fog: 0.04, shift: 0.2, lift: 1 }, // panel left
  epoxy: { bg: 0x0e0c08, light: 0xf3efe6, fog: 0.028, shift: -0.12, lift: 1 }, // panel right
  tile: { bg: 0x0c0d10, light: 0xf1f0ec, fog: 0.035, shift: 0.2, lift: 1 }, // panel left
  projects: { bg: 0x070b12, light: 0xeef1f4, fog: 0.05, shift: 0, lift: 0 }, // covered
  about: { bg: 0x070b12, light: 0xeef1f4, fog: 0.05, shift: 0, lift: 0 }, // covered
  contact: { bg: 0x08101a, light: 0xe8eef4, fog: 0.04, shift: 0, lift: 0 },
};
const DEFAULT_LOOK = LOOKS.hero;

// Reduced-motion "poster": offset within each section where its scene is fully resolved.
const POSTER = { leak: 0.58, waterproofing: 0.55, crack: 0.62, grouting: 0.62, epoxy: 0.62, tile: 0.62 };

export function createState() {
  return {
    time: 0,
    progress: 0,
    camT: 0,
    intro: 0,
    shift: 0,
    lift: 0,
    bg: new THREE.Color(LOOKS.hero.bg),
    bgLight: new THREE.Color(LOOKS.hero.light),
    fogDensity: LOOKS.hero.fog,
    leak: { scan: 0, lock: 0, marker: 0 },
    water: { explode: 0, rain: 0, labels: 0 },
    crack: { heal: 0, smooth: 0 },
    grout: { ports: 0, flow: 0, orbit: 0 },
    epoxy: { wave: 0 },
    tile: { fill: 0, shine: 0 },
  };
}

export function createDirector({ state, path, sections, reducedMotion }) {
  const N = sections.length - 1;
  const tl = gsap.timeline({ paused: true });
  const seg = (obj, key, from, to, start, end, ease = 'none') =>
    tl.fromTo(obj, { [key]: from }, { [key]: to, duration: end - start, ease, immediateRender: false }, start);
  const u = path.u;
  const ids = sections.map((s) => s.id);
  const index = Object.fromEntries(ids.map((id, i) => [id, i]));
  // Section time: T('crack', 0.5) = halfway through the crack section.
  const T = (id, t = 0) => (index[id] ?? 0) + t;

  // --- Camera path
  seg(state, 'camT', u('heroStart'), u('leak'), 0.02, T('leak'), 'power2.inOut');
  seg(state, 'camT', u('leak'), u('leakEnd'), T('leak'), T('leak', 0.62), 'none');
  seg(state, 'camT', u('leakEnd'), u('water'), T('leak', 0.64), T('waterproofing'), 'power2.inOut');
  seg(state, 'camT', u('water'), u('waterEnd'), T('waterproofing'), T('waterproofing', 0.62), 'none');
  seg(state, 'camT', u('waterEnd'), u('crack'), T('waterproofing', 0.64), T('crack'), 'power2.inOut');
  seg(state, 'camT', u('crack'), u('crackClose'), T('crack'), T('crack', 0.55), 'power1.inOut');
  seg(state, 'camT', u('crackClose'), u('grout'), T('crack', 0.66), T('grouting'), 'power2.inOut');
  seg(state, 'camT', u('grout'), u('groutEnd'), T('grouting'), T('grouting', 0.62), 'none');
  if (index.epoxy !== undefined) {
    seg(state, 'camT', u('groutEnd'), u('epoxy'), T('grouting', 0.65), T('epoxy'), 'power2.inOut');
    seg(state, 'camT', u('epoxy'), u('epoxyEnd'), T('epoxy'), T('epoxy', 0.64), 'none');
    seg(state, 'camT', u('epoxyEnd'), u('tile'), T('epoxy', 0.67), T('tile'), 'power2.inOut');
  } else {
    seg(state, 'camT', u('groutEnd'), u('tile'), T('grouting', 0.65), T('tile'), 'power2.inOut');
  }
  seg(state, 'camT', u('tile'), u('tileEnd'), T('tile'), T('tile', 0.62), 'none');
  seg(state, 'camT', u('tileEnd'), u('hold'), T('tile', 0.67), T('projects'), 'power2.in');
  seg(state, 'camT', u('hold'), u('outro'), T('about', 0.3), T('contact'), 'power2.out');

  // --- Scene progress
  seg(state.leak, 'scan', 0, 1, T('leak', 0.02), T('leak', 0.42), 'power1.inOut');
  seg(state.leak, 'lock', 0, 1, T('leak', 0.42), T('leak', 0.5), 'power2.out');
  seg(state.leak, 'marker', 0, 1, T('leak', 0.44), T('leak', 0.5));
  seg(state.leak, 'marker', 1, 0, T('leak', 0.62), T('leak', 0.66));

  seg(state.water, 'rain', 0, 1, T('waterproofing', -0.25), T('waterproofing', 0.1));
  seg(state.water, 'explode', 0, 1, T('waterproofing'), T('waterproofing', 0.48), 'power2.inOut');
  seg(state.water, 'labels', 0, 1, T('waterproofing', 0.25), T('waterproofing', 0.38));
  seg(state.water, 'labels', 1, 0, T('waterproofing', 0.6), T('waterproofing', 0.66));
  seg(state.water, 'rain', 1, 0, T('waterproofing', 0.7), T('waterproofing', 0.95));

  seg(state.crack, 'heal', 0, 1, T('crack', 0.08), T('crack', 0.5), 'power1.inOut');
  seg(state.crack, 'smooth', 0, 1, T('crack', 0.5), T('crack', 0.64), 'power1.out');

  seg(state.grout, 'ports', 0, 1, T('grouting'), T('grouting', 0.2), 'power1.out');
  seg(state.grout, 'flow', 0, 1, T('grouting', 0.18), T('grouting', 0.56), 'power1.inOut');
  seg(state.grout, 'orbit', 0, 1, T('grouting'), T('grouting', 0.64), 'none');

  if (index.epoxy !== undefined) seg(state.epoxy, 'wave', 0, 1, T('epoxy', 0.04), T('epoxy', 0.56), 'power1.inOut');

  seg(state.tile, 'fill', 0, 1, T('tile', 0.04), T('tile', 0.5), 'power1.inOut');
  seg(state.tile, 'shine', 0, 1, T('tile', 0.48), T('tile', 0.62), 'power1.out');

  // --- Looks: colour, fog, subject shift — blended across each section boundary
  for (let i = 0; i < N; i++) {
    const a = LOOKS[ids[i]] ?? DEFAULT_LOOK;
    const b = LOOKS[ids[i + 1]] ?? DEFAULT_LOOK;
    const start = i === 0 ? 0.35 : i + 0.66;
    const end = i + 1;
    const ca = new THREE.Color(a.bg);
    const cb = new THREE.Color(b.bg);
    tl.fromTo(state.bg, { r: ca.r, g: ca.g, b: ca.b }, { r: cb.r, g: cb.g, b: cb.b, duration: end - start, ease: 'none', immediateRender: false }, start);
    const la = new THREE.Color(a.light);
    const lb = new THREE.Color(b.light);
    tl.fromTo(state.bgLight, { r: la.r, g: la.g, b: la.b }, { r: lb.r, g: lb.g, b: lb.b, duration: end - start, ease: 'none', immediateRender: false }, start);
    seg(state, 'fogDensity', a.fog, b.fog, start, end);
    seg(state, 'shift', a.shift, b.shift, start, end, 'power2.inOut');
    seg(state, 'lift', a.lift, b.lift, start, end, 'power2.inOut');
  }
  tl.set({}, {}, N);
  tl.time(0);

  // --- Scroll → section time
  let anchors = [];
  let bottoms = [];
  let opaque = [];
  function measure() {
    const y = window.scrollY;
    const max = ScrollTrigger.maxScroll(window);
    anchors = sections.map((s) => Math.min(s.getBoundingClientRect().top + y, max));
    bottoms = sections.map((s) => s.getBoundingClientRect().bottom + y);
    opaque = sections.map((s) => s.hasAttribute('data-opaque'));
  }
  measure();
  ScrollTrigger.addEventListener('refresh', measure);

  function timeAt(y) {
    for (let i = N - 1; i >= 0; i--) {
      if (y >= anchors[i]) {
        const span = Math.max(1, anchors[i + 1] - anchors[i]);
        return Math.min(i + (y - anchors[i]) / span, N);
      }
    }
    return 0;
  }

  let smooth = timeAt(window.scrollY);
  let posterIndex = -1;

  return {
    timeline: tl,
    /** Section time for an id + offset (used to place scene visibility windows). */
    sectionTime: T,
    /** Returns true when an opaque section fully covers the viewport (rendering can pause). */
    update(dt) {
      const y = window.scrollY;
      const target = timeAt(y);
      if (reducedMotion) {
        const idx = Math.min(N, Math.floor(target + 0.25));
        if (idx !== posterIndex) {
          posterIndex = idx;
          smooth = idx + (POSTER[ids[idx]] ?? 0);
        }
      } else {
        smooth += (target - smooth) * (1 - Math.exp(-dt * 10));
        if (Math.abs(target - smooth) < 1e-4) smooth = target;
      }
      state.time = smooth;
      state.progress = smooth / N;
      tl.time(smooth);

      const vh = window.innerHeight;
      for (let i = 0; i < sections.length; i++) {
        if (opaque[i] && y >= anchors[i] - 1 && y + vh <= bottoms[i] + 1) return true;
      }
      return false;
    },
    get posterIndex() {
      return posterIndex;
    },
    dispose() {
      ScrollTrigger.removeEventListener('refresh', measure);
      tl.kill();
    },
  };
}
