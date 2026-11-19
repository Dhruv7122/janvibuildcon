import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Animated number counters, triggered once when the stats row enters the viewport. */
export function initCounters({ reducedMotion }) {
  const root = document.querySelector('[data-stats]');
  if (!root || reducedMotion) return;
  const els = [...root.querySelectorAll('[data-count]')];
  const fmt = (n) => Math.round(n).toLocaleString('en-IN');
  els.forEach((el) => (el.textContent = '0'));

  ScrollTrigger.create({
    trigger: root,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      els.forEach((el, i) => {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: Number(el.dataset.count),
          duration: 1.2,
          delay: i * 0.1,
          ease: 'power3.out',
          onUpdate: () => (el.textContent = fmt(obj.v)),
        });
      });
    },
  });
}

/** Process steps: SVG icons and connector lines draw in via stroke-dashoffset. */
export function initProcess({ reducedMotion }) {
  const root = document.querySelector('[data-process]');
  if (!root) return;
  if (reducedMotion) {
    root.classList.add('is-drawn');
    return;
  }
  const steps = [...root.querySelectorAll('.step')];
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => root.classList.add('is-drawn'),
  });
  steps.forEach((step, i) => {
    const at = i * 0.22;
    tl.fromTo(step.querySelectorAll('.step__line path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power3.inOut' }, at)
      .fromTo(step.querySelectorAll('.step__icon > *'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power3.out', stagger: 0.1 }, at + 0.1)
      .from(step.querySelectorAll('.step__num, .step__title, .step__text'), { opacity: 0, y: 18, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, at + 0.2);
  });
  ScrollTrigger.create({ trigger: root, start: 'top 78%', once: true, onEnter: () => tl.play() });
}
