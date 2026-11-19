import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createBeforeAfter } from './beforeAfter.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Projects: pinned horizontal-scroll gallery on desktop (vertical list on mobile / reduced motion)
 * and a keyboard-accessible <dialog> lightbox with a before/after slider.
 */
export function initGallery({ projects, scroll, reducedMotion }) {
  const section = document.querySelector('#projects');
  const pin = section?.querySelector('[data-projects-pin]');
  const track = section?.querySelector('[data-projects-track]');
  const bar = section?.querySelector('[data-projects-progress]');
  if (!section || !track) return;

  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 768px)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
    const { desktop, reduce } = ctx.conditions;
    if (!desktop || reduce || reducedMotion) return;
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => bar && (bar.style.transform = `scaleX(${self.progress})`),
      },
    });
  });

  // --- Lightbox
  const dialog = document.querySelector('[data-lightbox]');
  if (!dialog) return;
  const title = dialog.querySelector('[data-lightbox-title]');
  const meta = dialog.querySelector('[data-lightbox-meta]');
  const count = dialog.querySelector('[data-lightbox-count]');
  const slider = createBeforeAfter(dialog.querySelector('[data-ba]'));
  let current = 0;
  let opener = null;

  function show(i) {
    current = (i + projects.length) % projects.length;
    const p = projects[current];
    title.textContent = p.title;
    meta.textContent = `${p.service} · ${p.location} · ${p.year}`;
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
    slider.setImages(p.before, p.after, p.alt);
    slider.set(50);
  }

  section.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-project]');
    if (!btn) return;
    opener = btn;
    show(Number(btn.dataset.project));
    scroll.stop();
    dialog.showModal();
    dialog.querySelector('[data-lightbox-close]').focus();
  });

  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(current + 1));
  // Click on the backdrop closes.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      dialog.close();
      return;
    }
    if (e.target.closest('[role="slider"]')) return;
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  dialog.addEventListener('close', () => {
    scroll.start();
    opener?.focus({ preventScroll: true });
  });
}
