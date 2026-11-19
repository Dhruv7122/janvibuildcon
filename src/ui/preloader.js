import gsap from 'gsap';

/**
 * Preloader (seq 001): a 000% → 100% counter tied to real loading progress
 * (fonts + the WebGL world's LoadingManager), smoothed so it never jumps,
 * then a flip of the counter and a vertical clip-path wipe.
 */
export function createPreloader({ reducedMotion }) {
  const root = document.querySelector('[data-preloader]');
  const countEl = root?.querySelector('[data-preloader-count]');
  const barEl = root?.querySelector('[data-preloader-bar]');
  const minDuration = reducedMotion ? 0.4 : 1.6;

  const parts = { fonts: 0, world: 0 };
  const weights = { fonts: 0.15, world: 0.85 };
  let shown = 0;
  let start = performance.now();
  let resolveDone;
  const finished = new Promise((r) => (resolveDone = r));
  let complete = false;

  const target = () => Object.keys(parts).reduce((s, k) => s + parts[k] * weights[k], 0);

  function tick() {
    if (!root) return;
    const elapsed = (performance.now() - start) / 1000;
    const cap = Math.min(1, elapsed / minDuration);
    const goal = Math.min(target(), cap);
    shown += Math.max((goal - shown) * 0.12, Math.min(0.004, goal - shown));
    if (goal - shown < 0.0005) shown = goal;
    const pct = Math.round(shown * 100);
    countEl.textContent = String(pct).padStart(3, '0');
    barEl.style.transform = `scaleX(${shown})`;
    root.setAttribute('aria-valuenow', pct);
    if (shown >= 1 && !complete) {
      complete = true;
      gsap.ticker.remove(tick);
      resolveDone();
    }
  }

  if (root) gsap.ticker.add(tick);
  else resolveDone();

  return {
    set(part, value) {
      parts[part] = Math.max(parts[part], Math.min(1, value));
    },
    /** Resolves when the counter reaches 100%. */
    finished,
    /** Flip the counter and wipe the overlay away. */
    exit() {
      document.documentElement.classList.remove('is-loading');
      if (!root) return Promise.resolve();
      if (reducedMotion) {
        return gsap.to(root, { opacity: 0, duration: 0.6, onComplete: () => root.remove() }).then();
      }
      const tl = gsap.timeline({ onComplete: () => root.remove() });
      tl.to(countEl, { yPercent: -100, rotateX: 90, opacity: 0, duration: 0.6, ease: 'power3.in' })
        .to(root.querySelectorAll('.preloader__top, .preloader__name, .preloader__bar'), { opacity: 0, duration: 0.6, ease: 'power3.out' }, '<')
        .fromTo(root, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.2, ease: 'expo.inOut' }, '-=0.2');
      // Resolve slightly before the wipe ends so the hero animates in underneath it.
      return new Promise((r) => tl.call(r, null, '-=0.7'));
    },
  };
}
