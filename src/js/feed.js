export function initFeed() {
  // The feed: rows drift slowly and ping-pong between their ends. rAF (not CSS) so manual scrolling keeps working.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SPEED = 0.45; // px per frame
  const rows = [...document.querySelectorAll('[data-row]')].map((row) => {
    const el = row.querySelector('[data-track]');
    const d = { el, dir: Number(row.dataset.dir) || 1, pos: null, hover: false, pauseUntil: 0, sync: true, visible: false };
    const pause = (ms) => { d.pauseUntil = performance.now() + ms; };

    row.querySelectorAll('[data-nav]').forEach((btn) =>
      btn.addEventListener('click', () => {
        pause(900);
        el.scrollBy({ left: Number(btn.dataset.nav) * 680, behavior: 'smooth' });
      }),
    );
    el.addEventListener('mouseenter', () => { d.hover = true; });
    el.addEventListener('mouseleave', () => { d.hover = false; });
    el.addEventListener('wheel', () => pause(1500), { passive: true });
    el.addEventListener('touchstart', () => pause(4000), { passive: true });
    el.addEventListener('focusin', () => { d.hover = true; });
    el.addEventListener('focusout', () => { d.hover = false; });
    // Filters reset rows to their start (see initFeedFilters).
    el.addEventListener('feed:reset', () => { d.pos = 0; d.dir = 1; el.scrollLeft = 0; });
    return d;
  });

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const d = rows.find((r) => r.el === e.target);
      if (d) d.visible = e.isIntersecting;
    }
  });
  rows.forEach((d) => io.observe(d.el));

  function tick() {
    const now = performance.now();
    for (const d of rows) {
      const max = d.el.scrollWidth - d.el.clientWidth;
      if (max <= 0 || !d.visible) continue;
      if (reduceMotion.matches || d.hover || now < d.pauseUntil) { d.sync = true; continue; }
      if (d.pos == null) d.pos = d.dir < 0 ? max : 0;
      else if (d.sync) d.pos = d.el.scrollLeft;
      d.sync = false;
      d.pos += d.dir * SPEED;
      if (d.pos >= max) { d.pos = max; d.dir = -1; }
      if (d.pos <= 0) { d.pos = 0; d.dir = 1; }
      d.el.scrollLeft = d.pos;
    }
    requestAnimationFrame(tick);
  }
  if (rows.length) requestAnimationFrame(tick);
}
