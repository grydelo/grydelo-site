// Feed carousel viewer: click a tile to flip through its slides (swipe, arrows, keyboard, dots).
export function initLightbox() {
  const dlg = document.querySelector('[data-lightbox]');
  if (!dlg) return;
  const track = dlg.querySelector('[data-lb-track]');
  const dots = dlg.querySelector('[data-lb-dots]');
  const caption = dlg.querySelector('[data-lb-caption]');
  const prev = dlg.querySelector('[data-lb-prev]');
  const next = dlg.querySelector('[data-lb-next]');
  let count = 0;

  const index = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = (i) => track.scrollTo({ left: Math.max(0, Math.min(count - 1, i)) * track.clientWidth, behavior: 'smooth' });
  const sync = () => {
    const i = index();
    dots.querySelectorAll('button').forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    prev.disabled = i <= 0;
    next.disabled = i >= count - 1;
  };

  function open(tile) {
    const slug = tile.dataset.carousel;
    count = Number(tile.dataset.slides) || 1;
    caption.textContent = tile.dataset.caption || '';
    track.innerHTML = Array.from({ length: count }, (_, k) =>
      `<img src="/posts/${slug}/${k + 1}.webp" alt="Slide ${k + 1} of ${count}" width="1080" height="1350" decoding="async"${k ? ' loading="lazy"' : ''}>`,
    ).join('');
    dots.innerHTML = Array.from({ length: count }, (_, k) => `<button type="button" aria-label="Slide ${k + 1}"></button>`).join('');
    dlg.showModal();
    track.scrollLeft = 0;
    sync();
    next.focus({ preventScroll: true });
  }

  document.addEventListener('click', (e) => {
    const tile = e.target.closest('[data-carousel]');
    if (tile) open(tile);
  });
  prev.addEventListener('click', () => go(index() - 1));
  next.addEventListener('click', () => go(index() + 1));
  dots.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) go([...dots.children].indexOf(b));
  });
  dlg.querySelector('[data-lb-close]').addEventListener('click', () => dlg.close());
  // Click on the dimmed backdrop (the dialog itself, outside the slides and controls) closes it.
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.classList.contains('lb-stage')) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index() - 1); }
  });
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  dlg.addEventListener('close', () => { track.innerHTML = ''; });
}
