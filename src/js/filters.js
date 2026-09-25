// Blog index: category filter chips.
export function initBlogFilters() {
  const bar = document.querySelector('[data-blog-filters]');
  if (!bar) return;
  const cards = [...document.querySelectorAll('.article-card[data-category]')];
  bar.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-filter]');
    if (!chip) return;
    bar.querySelectorAll('[data-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    const f = chip.dataset.filter;
    cards.forEach((card) => {
      card.hidden = f !== '*' && card.dataset.category !== f;
      if (!card.hidden) card.classList.add('in');
    });
  });
}
