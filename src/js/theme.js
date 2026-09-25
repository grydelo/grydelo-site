// Light/dark toggle. The initial theme is applied before paint by the inline script in index.html.
const KEY = 'grydelo.theme';
const COLORS = { light: '#f6f5f1', dark: '#0a0a0c' };

function apply(theme, animate) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add('theme-anim');
    setTimeout(() => root.classList.remove('theme-anim'), 400);
  }
  root.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLORS[theme]);
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  });
}

export function initTheme() {
  apply(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next, true);
      try { localStorage.setItem(KEY, next); } catch {}
    }),
  );
}
