import gsap from 'gsap';

/**
 * Draggable testimonials carousel: pointer drag with momentum snap,
 * prev/next buttons and arrow keys when the viewport is focused.
 */
export function initCarousel({ reducedMotion }) {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;
  const viewport = root.querySelector('[data-carousel-viewport]');
  const track = root.querySelector('[data-carousel-track]');
  const slides = [...track.children];
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');

  let index = 0;
  let maxX = 0;
  const setX = gsap.quickSetter(track, 'x', 'px');

  const measure = () => {
    maxX = Math.max(0, track.scrollWidth - viewport.clientWidth);
  };
  const snapPoints = () => slides.map((s) => Math.min(s.offsetLeft, maxX));

  function goTo(i, duration = reducedMotion ? 0 : 0.9) {
    const pts = snapPoints();
    const lastStop = pts.findIndex((p) => p >= maxX);
    index = Math.max(0, Math.min(lastStop === -1 ? slides.length - 1 : lastStop, i));
    gsap.to(track, { x: -pts[index], duration, ease: 'power3.out' });
    slides.forEach((s, j) => s.classList.toggle('is-active', j === index));
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === (lastStop === -1 ? slides.length - 1 : lastStop);
  }

  // Drag
  let startX = 0;
  let startPos = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;
  let dragging = false;
  let moved = false;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    moved = false;
    startX = lastX = e.clientX;
    lastT = performance.now();
    startPos = gsap.getProperty(track, 'x');
    gsap.killTweensOf(track);
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add('is-dragging');
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    let nx = startPos + dx;
    // Rubber-band past the ends.
    if (nx > 0) nx *= 0.35;
    if (nx < -maxX) nx = -maxX + (nx + maxX) * 0.35;
    setX(nx);
    const now = performance.now();
    velocity = (e.clientX - lastX) / Math.max(1, now - lastT);
    lastX = e.clientX;
    lastT = now;
  });

  const release = (e) => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
    const projected = gsap.getProperty(track, 'x') + velocity * 220;
    const pts = snapPoints();
    let best = 0;
    pts.forEach((p, i) => {
      if (Math.abs(-p - projected) < Math.abs(-pts[best] - projected)) best = i;
    });
    goTo(best);
  };
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);
  // Prevent accidental clicks after a drag.
  viewport.addEventListener('click', (e) => moved && e.preventDefault(), true);

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(index - 1);
    else if (e.key === 'ArrowRight') goTo(index + 1);
    else return;
    e.preventDefault();
  });

  window.addEventListener('resize', () => {
    measure();
    goTo(index, 0);
  });
  measure();
  goTo(0, 0);
}
