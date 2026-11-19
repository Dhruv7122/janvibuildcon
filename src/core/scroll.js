import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scrolling: Lenis driven by gsap.ticker and synced to ScrollTrigger.
 * With reduced motion we keep native scrolling (lenis = null).
 */
export function createScroll({ reducedMotion }) {
  let lenis = null;

  if (!reducedMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      autoRaf: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const api = {
    lenis,
    get y() {
      return lenis ? lenis.scroll : window.scrollY;
    },
    get velocity() {
      return lenis ? lenis.velocity : 0;
    },
    stop() {
      lenis?.stop();
      document.documentElement.classList.add('scroll-locked');
    },
    start() {
      lenis?.start();
      document.documentElement.classList.remove('scroll-locked');
    },
    scrollTo(target, opts = {}) {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (lenis) {
        lenis.scrollTo(el ?? target, { duration: 1.6, easing: (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2), ...opts });
      } else if (el?.getBoundingClientRect) {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'auto' });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'auto' });
      }
    },
  };

  // Route in-page anchor clicks through the smooth scroller.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    api.scrollTo(el);
    history.replaceState(null, '', id);
    // Move focus for keyboard / screen-reader users without a jump.
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  });

  return api;
}
