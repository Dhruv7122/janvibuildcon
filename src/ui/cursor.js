import gsap from 'gsap';

/**
 * Custom cursor: a dot that tracks the pointer exactly + a trailing ring (lerped).
 * Grows over interactive elements; shows "View" over project cards. Desktop only.
 */
export function initCursor() {
  const root = document.querySelector('[data-cursor-root]');
  if (!root) return;
  document.documentElement.classList.add('has-cursor');
  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');
  const label = root.querySelector('[data-cursor-label]');

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { ...pos };
  const setDot = { x: gsap.quickSetter(dot, 'x', 'px'), y: gsap.quickSetter(dot, 'y', 'px') };
  const setRing = { x: gsap.quickSetter(ring, 'x', 'px'), y: gsap.quickSetter(ring, 'y', 'px') };
  const setLabel = { x: gsap.quickSetter(label, 'x', 'px'), y: gsap.quickSetter(label, 'y', 'px') };

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pos.x = e.clientX;
    pos.y = e.clientY;
    setDot.x(pos.x);
    setDot.y(pos.y);
    root.classList.remove('is-hidden');
  });
  document.addEventListener('pointerleave', () => root.classList.add('is-hidden'));

  const interactive = 'a, button, [role="slider"], [data-cursor], label, select, input, textarea, [data-carousel-viewport]';
  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest(interactive);
    root.classList.toggle('is-hover', !!el && el.dataset.cursor !== 'view');
    root.classList.toggle('is-view', el?.dataset.cursor === 'view');
    if (el?.dataset.cursor === 'view') label.textContent = 'View';
  });

  gsap.ticker.add((_t, dms) => {
    const k = 1 - Math.exp(-(dms / 1000) * 14);
    ringPos.x += (pos.x - ringPos.x) * k;
    ringPos.y += (pos.y - ringPos.y) * k;
    setRing.x(ringPos.x);
    setRing.y(ringPos.y);
    setLabel.x(ringPos.x);
    setLabel.y(ringPos.y);
  });
}

/** Magnetic buttons: elements with [data-magnetic] lean toward the cursor. */
export function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const inner = el.querySelector('span');
    const strength = el.classList.contains('swatch') ? 0.2 : 0.3;
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.6, ease: 'power3.out' });
      if (inner) gsap.to(inner, { x: dx * 0.12, y: dy * 0.12, duration: 0.6, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.4)' });
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.4)' });
    });
  });
}
