import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Text reveals.
 * [data-split]       → headings split into masked lines/words that slide up on enter.
 * [data-reveal]      → fade + rise on enter.
 * [data-reveal-list] → children stagger in.
 * Reduced motion: simple opacity fades only.
 */
export function initReveals({ reducedMotion }) {
  const splits = [];

  document.querySelectorAll('[data-split]').forEach((el) => {
    if (reducedMotion) {
      el.classList.add('is-split');
      gsap.from(el, { opacity: 0, duration: 0.8, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      return;
    }
    const split = SplitText.create(el, {
      type: 'lines,words',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        el.classList.add('is-split');
        return gsap.from(self.words, {
          yPercent: 115,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.04,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
    splits.push(split);
  });

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: reducedMotion ? 0 : 28,
      duration: reducedMotion ? 0.6 : 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });

  document.querySelectorAll('[data-reveal-list]').forEach((el) => {
    gsap.from(el.children, {
      opacity: 0,
      y: reducedMotion ? 0 : 20,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  return splits;
}

/** Hero entrance, played as the preloader wipes away. */
export function heroIntro({ reducedMotion }) {
  const title = document.querySelector('[data-hero-title]');
  const fades = document.querySelectorAll('[data-hero-fade]');
  const header = document.querySelector('[data-header]');
  if (!title) return;

  if (reducedMotion) {
    title.classList.add('is-split');
    gsap.to([title, ...fades], { opacity: 1, duration: 0.6 });
    return;
  }

  const split = SplitText.create(title, { type: 'chars', mask: 'chars' });
  title.classList.add('is-split');
  const tl = gsap.timeline();
  tl.from(split.chars, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.035 })
    .fromTo(fades, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.3)
    .from(header, { yPercent: -100, opacity: 0, duration: 1, ease: 'power3.out' }, 0.2);
}
