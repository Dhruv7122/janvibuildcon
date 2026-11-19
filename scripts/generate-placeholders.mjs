/**
 * Generates lightweight SVG placeholder photos in /public/images.
 * Run: npm run placeholders
 * Replace the generated files with real photos (same names) or edit paths in src/content.js.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const out = (file, svg) => {
  const p = join(root, file);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, svg.trim() + '\n');
  console.log('wrote', p);
};

// Deterministic pseudo-random so output is stable between runs.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function crackPath(x0, y0, x1, y1, steps = 14, jitter = 60) {
  let d = `M${x0} ${y0}`;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t + (rnd() - 0.5) * jitter;
    const y = y0 + (y1 - y0) * t + (rnd() - 0.5) * jitter;
    d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
  }
  return d;
}

const frame = (inner, { base, label, freq = 0.9, texture = 0.35 }) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000">
  <defs>
    <filter id="t" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${Math.floor(rnd() * 100)}"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${texture} 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <radialGradient id="v" cx="50%" cy="45%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".55"/></radialGradient>
  </defs>
  <rect width="1600" height="1000" fill="${base}"/>
  <rect width="1600" height="1000" fill="#fff" filter="url(#t)"/>
  ${inner}
  <rect width="1600" height="1000" fill="url(#v)"/>
  <g font-family="monospace" font-size="26" fill="#fff" fill-opacity=".85" letter-spacing="3">
    <rect x="48" y="44" width="${label.length * 17 + 40}" height="56" fill="#070B12" fill-opacity=".7"/>
    <text x="68" y="82">${label}</text>
  </g>
</svg>`;

const stains = (n, color = '#1b1f24', op = 0.35) =>
  Array.from({ length: n }, () => {
    const cx = 200 + rnd() * 1200;
    const cy = 150 + rnd() * 650;
    return `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${(120 + rnd() * 220).toFixed(0)}" ry="${(80 + rnd() * 140).toFixed(0)}" fill="${color}" fill-opacity="${op}"/>`;
  }).join('');

const cracks = (n, w = 5) =>
  Array.from({ length: n }, () => {
    const x0 = rnd() * 400;
    const y0 = 200 + rnd() * 600;
    return `<path d="${crackPath(x0, y0, 1200 + rnd() * 400, 150 + rnd() * 700)}" fill="none" stroke="#0b0c0e" stroke-width="${w}" stroke-linejoin="round"/>`;
  }).join('');

const projects = [
  {
    id: 'p1',
    name: 'TERRACE',
    before: { base: '#6b6f74', inner: () => stains(5, '#2b2f33', 0.45) + cracks(3, 4) },
    after: {
      base: '#5f8fa3',
      inner: () =>
        `<rect width="1600" height="1000" fill="#2ec4f1" fill-opacity=".18"/><path d="M0 700 L1600 520" stroke="#fff" stroke-opacity=".12" stroke-width="120"/>`,
    },
  },
  {
    id: 'p2',
    name: 'BASEMENT',
    before: { base: '#55595e', inner: () => stains(6, '#14324a', 0.4) + cracks(2, 6) },
    after: {
      base: '#7d8288',
      inner: () =>
        Array.from({ length: 6 }, (_, i) => `<circle cx="${250 + i * 220}" cy="${420 + (i % 2) * 90}" r="14" fill="#ffb703"/>`).join('') +
        `<path d="${crackPath(150, 400, 1450, 560, 12, 30)}" fill="none" stroke="#9aa0a6" stroke-width="10"/>`,
    },
  },
  {
    id: 'p3',
    name: 'FACTORY FLOOR',
    before: { base: '#5d5f61', inner: () => stains(7, '#222', 0.4) + cracks(2, 3) },
    after: {
      base: '#8a9099',
      inner: () =>
        `<rect width="1600" height="1000" fill="#ffb703" fill-opacity=".25"/><path d="M200 1000 L700 300 L800 300 L500 1000Z" fill="#fff" fill-opacity=".14"/><path d="M1000 1000 L1200 300 L1260 300 L1250 1000Z" fill="#fff" fill-opacity=".1"/><path d="M0 760 H1600" stroke="#ffb703" stroke-width="16" stroke-opacity=".9"/>`,
      texture: 0.12,
    },
  },
  {
    id: 'p4',
    name: 'FACADE',
    before: { base: '#8c8a84', inner: () => stains(4, '#3a3a36', 0.3) + cracks(4, 5) },
    after: { base: '#c9c6bd', inner: () => `<rect width="1600" height="1000" fill="#fff" fill-opacity=".08"/>`, texture: 0.15 },
  },
  {
    id: 'p5',
    name: 'WATER TANK',
    before: { base: '#4e5459', inner: () => stains(6, '#3b2a12', 0.35) + cracks(2, 4) },
    after: { base: '#2a7fa0', inner: () => `<ellipse cx="800" cy="500" rx="700" ry="380" fill="#2ec4f1" fill-opacity=".25"/>`, texture: 0.12 },
  },
  {
    id: 'p6',
    name: 'PODIUM PARKING',
    before: { base: '#606366', inner: () => stains(6, '#1f2123', 0.4) + cracks(3, 3) },
    after: {
      base: '#3f6f5a',
      inner: () =>
        Array.from({ length: 5 }, (_, i) => `<path d="M${120 + i * 320} 1000 L${220 + i * 300} 380" stroke="#fff" stroke-width="10" stroke-opacity=".8"/>`).join('') +
        `<rect width="1600" height="1000" fill="#fff" fill-opacity=".05"/>`,
      texture: 0.12,
    },
  },
];

projects.forEach((p, i) => {
  const n = String(i + 1).padStart(2, '0');
  out(`projects/${p.id}-before.svg`, frame(p.before.inner(), { base: p.before.base, label: `PROJECT ${n} — ${p.name} — BEFORE`, texture: p.before.texture ?? 0.38 }));
  out(`projects/${p.id}-after.svg`, frame(p.after.inner(), { base: p.after.base, label: `PROJECT ${n} — ${p.name} — AFTER`, texture: p.after.texture ?? 0.2 }));
});

// Static hero image for the no-WebGL fallback.
out(
  'hero-fallback.svg',
  frame(cracks(1, 6) + `<rect width="1600" height="1000" fill="#070B12" fill-opacity=".55"/>`, {
    base: '#5d6269',
    label: 'JANVI BUILDCON — SEALED. STRONG. BUILT TO LAST.',
    freq: 0.7,
    texture: 0.4,
  })
);
