// Small touches of life: scroll reveals, cursor spotlight on cards, hero parallax, cycling hero status,
// article reading progress and table-of-contents tracking. Motion is skipped under prefers-reduced-motion.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const REVEAL = [
  '.sec-head', '.desk-head', '.svc-table', '.step', '.about-panel', '.quote', '.plan', '.faq-item',
  '.article-card', '.stat', '.cal-toolbar', '.aside-card', '.cform', '.brief-list li', '.specs > div',
  '.article-cta', '.footer-top > *',
].join(',');

function reveals() {
  const els = [...document.querySelectorAll(REVEAL)].filter((el) => !el.closest('.page-hero, .hero-copy, [data-consent]'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => {
    // Stagger siblings so grids fill in left to right.
    const i = [...el.parentElement.children].filter((c) => els.includes(c)).indexOf(el);
    el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
    el.classList.add('reveal');
    io.observe(el);
  });
}

function spotlight() {
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest?.('.spot');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}

function parallax() {
  const art = document.querySelector('[data-parallax]');
  if (!art || !matchMedia('(pointer: fine)').matches) return;
  const layers = [...art.querySelectorAll('[data-depth]')];
  const hero = art.closest('section');
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    layers.forEach((l) => { l.style.transform = `translate(${x * -18 * l.dataset.depth}px, ${y * -14 * l.dataset.depth}px)`; });
  });
  hero.addEventListener('pointerleave', () => layers.forEach((l) => { l.style.transform = ''; }));
}

const PILL = [
  'Cleared compliance · ready to post',
  'Scheduled · 09:00 LDN',
  'Reel published · TH · EN',
  'Risk warning checked · 3 entities',
  'Telegram note sent · NY open',
];

function pillCycle() {
  const el = document.querySelector('[data-pill-cycle]');
  if (!el) return;
  let i = 0;
  setInterval(() => {
    if (document.hidden) return;
    el.classList.add('out');
    setTimeout(() => {
      i = (i + 1) % PILL.length;
      el.textContent = PILL[i];
      el.classList.remove('out');
    }, 350);
  }, 3600);
}

function articleProgress() {
  const bar = document.querySelector('[data-read-progress]');
  const article = document.querySelector('[data-article]');
  if (!bar || !article) return;
  const links = [...document.querySelectorAll('[data-toc-link]')];
  const heads = links.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean);
  let queued = false;
  const update = () => {
    queued = false;
    const r = article.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight * 0.6)));
    bar.style.transform = `scaleX(${p})`;
    let active = 0;
    heads.forEach((h, i) => { if (h.getBoundingClientRect().top < 140) active = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === active));
  };
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
}

export function initMotion() {
  articleProgress();
  if (reduce) return;
  reveals();
  spotlight();
  parallax();
  pillCycle();
}
