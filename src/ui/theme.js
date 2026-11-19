/**
 * Dark / light theme toggle. Choice is saved in localStorage ('jb-theme');
 * the inline script in index.html applies it before first paint.
 */
const KEY = 'jb-theme';
const META = { dark: '#070B12', light: '#EEF1F4' };

export const getTheme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

export function initTheme({ onChange } = {}) {
  const html = document.documentElement;
  const btn = document.querySelector('[data-theme-btn]');
  const meta = document.querySelector('meta[name="theme-color"]');
  let timer = 0;

  function apply(theme, animate) {
    if (animate) {
      html.classList.add('theme-transition');
      clearTimeout(timer);
      timer = setTimeout(() => html.classList.remove('theme-transition'), 700);
    }
    if (theme === 'light') html.dataset.theme = 'light';
    else delete html.dataset.theme;
    meta?.setAttribute('content', META[theme]);
    if (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'light'));
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
    onChange?.(theme, animate);
  }

  btn?.addEventListener('click', () => {
    const next = getTheme() === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable (private mode) — theme still switches for this visit */
    }
    apply(next, true);
  });

  apply(getTheme(), false);
}
