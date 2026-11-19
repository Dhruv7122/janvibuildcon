// Latin subsets only (self-hosted via @fontsource).
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import 'lenis/dist/lenis.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import content from './content.js';
import { detectDevice } from './core/device.js';
import { createScroll } from './core/scroll.js';
import { createPreloader } from './ui/preloader.js';
import { initReveals, heroIntro } from './ui/splitText.js';
import { initNav } from './ui/nav.js';
import { initGallery } from './ui/gallery.js';
import { initBeforeAfter } from './ui/beforeAfter.js';
import { initCounters, initProcess } from './ui/counters.js';
import { initCarousel } from './ui/carousel.js';
import { initForm } from './ui/form.js';
import { initCursor, initMagnetic } from './ui/cursor.js';
import { initTheme, getTheme } from './ui/theme.js';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out', duration: 0.8 });

const html = document.documentElement;
const device = detectDevice();
html.classList.toggle('reduced-motion', device.reducedMotion);
html.classList.toggle('is-touch', device.touch);
if (!device.webgl) html.classList.add('no-webgl');

// Always start at the top so the preloader → hero sequence plays correctly.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const scroll = createScroll(device);
scroll.stop();

const preloader = createPreloader(device);

// --- UI (independent of WebGL). The gallery pin is created first so every later
// ScrollTrigger accounts for its pin spacing.
initGallery({ projects: content.projects, scroll, reducedMotion: device.reducedMotion });
initNav({ nav: content.nav, scroll, reducedMotion: device.reducedMotion });
initBeforeAfter();
initProcess(device);
initCounters(device);
initCarousel(device);
initForm(content);
if (!device.touch && !device.reducedMotion) {
  initCursor();
  initMagnetic();
}

// --- Fonts (part of the real progress)
const fontsReady = (document.fonts?.ready ?? Promise.resolve()).then(() => preloader.set('fonts', 1));

// --- WebGL world (dynamic import keeps three.js out of the initial bundle)
let world = null;
initTheme({ onChange: (theme, animate) => world?.setTheme(theme, animate) });
const groutState = document.querySelector('[data-grout-state]');

async function loadWorld() {
  if (!device.webgl) {
    preloader.set('world', 1);
    return;
  }
  try {
    const { createWorld } = await import('./core/world.js');
    world = await createWorld({
      canvas: document.querySelector('[data-webgl]'),
      device,
      theme: getTheme(),
      onProgress: (p) => preloader.set('world', p),
      onGroutState: (sealed) => {
        if (!groutState) return;
        groutState.classList.toggle('is-after', sealed);
        groutState.querySelectorAll('[data-state]').forEach((el) => {
          el.classList.toggle('is-active', (el.dataset.state === 'after') === sealed);
        });
      },
    });
  } catch (err) {
    console.error('[janvi] WebGL failed, using static fallback.', err);
    html.classList.add('no-webgl');
  } finally {
    preloader.set('world', 1);
  }
}

// Epoxy colour swatches (radio group: click or arrow keys)
const swatches = [...document.querySelectorAll('[data-swatch]')];
function selectSwatch(btn, focus = false) {
  swatches.forEach((b) => {
    const on = b === btn;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on ? 0 : -1;
  });
  if (focus) btn.focus();
  world?.setEpoxyColor(btn.dataset.swatch);
}
swatches.forEach((btn, i) => {
  btn.tabIndex = i === 0 ? 0 : -1;
  btn.addEventListener('click', () => selectSwatch(btn));
  btn.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    selectSwatch(swatches[(i + step + swatches.length) % swatches.length], true);
  });
});

// Footer year
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

// --- Boot sequence
(async () => {
  await Promise.all([fontsReady, loadWorld()]);
  // Split text after fonts are in so line breaks are measured correctly.
  initReveals(device);
  ScrollTrigger.refresh();
  await preloader.finished;
  await preloader.exit();
  scroll.start();
  heroIntro(device);
  world?.intro();
})();
