export function initFaq() {
  // FAQ: single-open accordion; clicking the open row closes it.
  const faq = document.querySelector('[data-faq]');
  if (faq) {
    const items = [...faq.querySelectorAll('.faq-item')];
    const setOpen = (item, open) => {
      item.querySelector('.faq-trigger').setAttribute('aria-expanded', String(open));
      item.querySelector('.faq-sign').textContent = open ? '−' : '+';
      item.querySelector('.faq-a').hidden = !open;
    };
    items.forEach((item) =>
      item.querySelector('.faq-trigger').addEventListener('click', () => {
        const wasOpen = item.querySelector('.faq-trigger').getAttribute('aria-expanded') === 'true';
        items.forEach((other) => setOpen(other, false));
        if (!wasOpen) setOpen(item, true);
      }),
    );
  }
}
