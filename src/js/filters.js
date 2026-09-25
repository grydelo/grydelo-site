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

// Feed: category chips hide non-matching carousel tiles across every row and restart each row at its start.
export function initFeedFilters() {
  const bar = document.querySelector('[data-feed-filters]');
  if (!bar) return;
  const tiles = [...document.querySelectorAll('.tile[data-category]')];
  bar.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-filter]');
    if (!chip) return;
    bar.querySelectorAll('[data-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    const f = chip.dataset.filter;
    tiles.forEach((t) => { t.hidden = f !== '*' && t.dataset.category !== f; });
    document.querySelectorAll('[data-track]').forEach((track) => track.dispatchEvent(new Event('feed:reset')));
  });
}
