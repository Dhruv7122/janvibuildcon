import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Header: current-section indicator (01–08) and the fullscreen menu overlay
 * with staggered link reveals, focus management, Escape to close.
 */
export function initNav({ nav, scroll, reducedMotion }) {
  const numEl = document.querySelector('[data-indicator-num]');
  const labelEl = document.querySelector('[data-indicator-label]');
  const sections = [...document.querySelectorAll('[data-section]')];
  let current = -1;

  function setActive(i) {
    if (i === current || i < 0) return;
    const dir = i > current ? 1 : -1;
    current = i;
    const update = () => {
      numEl.textContent = String(i + 1).padStart(2, '0');
      labelEl.textContent = nav[i]?.label ?? '';
    };
    if (reducedMotion) return update();
    gsap.to([numEl, labelEl], {
      yPercent: -60 * dir,
      opacity: 0,
      duration: 0.25,
      ease: 'power3.in',
      onComplete: () => {
        update();
        gsap.fromTo([numEl, labelEl], { yPercent: 60 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
      },
    });
  }

  sections.forEach((s, i) => {
    ScrollTrigger.create({
      trigger: s,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => self.isActive && setActive(i),
    });
  });
  setActive(0);

  // --- Menu overlay
  const btn = document.querySelector('[data-menu-btn]');
  const btnText = document.querySelector('[data-menu-text]');
  const menu = document.querySelector('[data-menu]');
  if (!btn || !menu) return;
  const bg = menu.querySelector('.menu__bg');
  const links = [...menu.querySelectorAll('[data-menu-link]')];
  const aside = menu.querySelector('.menu__aside');
  const outside = [document.querySelector('main'), document.querySelector('.footer')];
  let open = false;
  let tl = null;

  function openMenu() {
    open = true;
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    btnText.textContent = 'Close';
    outside.forEach((el) => el && (el.inert = true));
    scroll.stop();
    tl?.kill();
    tl = gsap.timeline();
    if (reducedMotion) {
      tl.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.set(bg, { clipPath: 'inset(0% 0% 0% 0%)' });
    } else {
      tl.set(menu, { opacity: 1 })
        .fromTo(bg, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' })
        .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06 }, '-=0.35')
        .fromTo(aside, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.7');
    }
    links[0]?.focus({ preventScroll: true });
  }

  function closeMenu(after) {
    if (!open) return;
    open = false;
    btn.setAttribute('aria-expanded', 'false');
    btnText.textContent = 'Menu';
    outside.forEach((el) => el && (el.inert = false));
    tl?.kill();
    const finish = () => {
      menu.hidden = true;
      scroll.start();
      after?.();
    };
    if (reducedMotion) {
      tl = gsap.timeline({ onComplete: finish }).to(menu, { opacity: 0, duration: 0.25 });
    } else {
      tl = gsap
        .timeline({ onComplete: finish })
        .to(links, { yPercent: -110, duration: 0.6, ease: 'power3.in', stagger: 0.03 })
        .to(aside, { opacity: 0, duration: 0.4 }, 0)
        .to(bg, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' }, 0.2);
    }
  }

  btn.addEventListener('click', () => (open ? closeMenu(() => btn.focus()) : openMenu()));

  links.forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = a.getAttribute('href');
      const target = document.querySelector(id);
      closeMenu(() => {
        if (!target) return;
        scroll.scrollTo(target, { duration: 1.2 });
        history.replaceState(null, '', id);
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    })
  );

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      closeMenu(() => btn.focus());
      return;
    }
    // Keep Tab focus inside the menu and its toggle button.
    if (e.key === 'Tab') {
      const items = [btn, ...links, ...aside.querySelectorAll('a')];
      const i = items.indexOf(document.activeElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
      items[next].focus();
      e.preventDefault();
    }
  });
}
