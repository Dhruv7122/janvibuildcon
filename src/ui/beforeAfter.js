/**
 * Before/After comparison slider.
 * Drag anywhere (mouse/touch/pen), or focus the handle and use arrow keys, PageUp/PageDown, Home/End.
 * Horizontal drags are captured; vertical swipes still scroll the page (touch-action: pan-y).
 */
export function createBeforeAfter(root) {
  if (!root) return { set() {}, setImages() {} };
  const handle = root.querySelector('.ba__handle');
  const imgs = root.querySelectorAll('.ba__img');
  let pos = 50;
  let dragging = false;

  function set(v) {
    pos = Math.max(0, Math.min(100, v));
    root.style.setProperty('--pos', `${pos}%`);
    handle.setAttribute('aria-valuenow', Math.round(pos));
    handle.setAttribute('aria-valuetext', `${Math.round(100 - pos)}% after image shown`);
  }

  const fromEvent = (e) => {
    const r = root.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * 100;
  };

  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    root.classList.add('is-dragging');
    root.setPointerCapture(e.pointerId);
    // On touch, wait for horizontal movement so a vertical scroll swipe doesn't jump the handle.
    if (e.pointerType !== 'touch') set(fromEvent(e));
  });
  root.addEventListener('pointermove', (e) => dragging && set(fromEvent(e)));
  const end = (e) => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
    if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
  };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);

  handle.addEventListener('keydown', (e) => {
    const steps = { ArrowLeft: -2, ArrowDown: -2, ArrowRight: 2, ArrowUp: 2, PageDown: -10, PageUp: 10 };
    if (e.key in steps) set(pos + steps[e.key]);
    else if (e.key === 'Home') set(0);
    else if (e.key === 'End') set(100);
    else return;
    e.preventDefault();
    e.stopPropagation();
  });

  return {
    set,
    setImages(before, after, alt = '') {
      imgs[0].src = before;
      imgs[0].alt = `Before: ${alt}`;
      imgs[1].src = after;
      imgs[1].alt = `After: ${alt}`;
    },
  };
}

export function initBeforeAfter() {
  document.querySelectorAll('[data-ba]').forEach((el) => {
    if (!el.closest('[data-lightbox]')) createBeforeAfter(el);
  });
}
