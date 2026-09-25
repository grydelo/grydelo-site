// Mobile menu: toggles the full-width link panel under the header.
export function initMenu() {
  const btn = document.querySelector('[data-menu-btn]');
  const panel = document.querySelector('[data-menu]');
  if (!btn || !panel) return;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) set(false); });
}
