// Renders every page to an HTML string. Runs in Node at build time (and in the dev server),
// so the shipped pages are static HTML; main.js only adds behaviour on top.
import {
  ASSET_BASE, EMAIL, SHOW_BADGES, heroMeta, heroPosts, services, steps, specs, quotes, plans, faqs, briefList,
} from './content.js';
import { articles } from './blog.js';
import { esc, pad, map, heading, sectionHead, pageHero, contactForm, layout } from './layout.js';
import posts from './posts.json' with { type: 'json' };

export const SITE = 'https://grydelo.com';

const media = (post, label) =>
  post.src
    ? `<img src="${esc(post.src)}" alt="${esc(post.alt)}" loading="lazy" decoding="async">`
    : `<span class="ph-label">${label}</span>`;

const fmtDate = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/* ---------- Blog pieces ---------- */

const TICKERS = { Compliance: 'CMPL', 'Content strategy': 'CNTS', Telegram: 'TLGM', Localisation: 'LOCL', Video: 'VIDO', Analytics: 'KPIS' };
const ticker = (cat) => TICKERS[cat] || cat.slice(0, 4).toUpperCase();

// Deterministic "price line" per article, so each cover looks like its own chart.
function sparkline(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  let y = 55;
  const pts = Array.from({ length: 26 }, (_, i) => {
    y = Math.min(80, Math.max(12, y + (rand() - 0.42) * 18));
    return [Math.round((i / 25) * 300), Math.round(y)];
  });
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  return { line, area: `${line} L300 90 L0 90 Z`, last: pts[pts.length - 1] };
}

const cover = (a, i) => {
  const s = sparkline(a.slug);
  const id = `g-${a.slug.slice(0, 24)}`;
  return `
    <div class="cover" aria-hidden="true">
      <span class="cover-tk">${ticker(a.category)}</span><span class="cover-no">No. ${String(articles.length - i).padStart(3, '0')}</span>
      <svg viewBox="0 0 300 90" preserveAspectRatio="none">
        <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5a524" stop-opacity=".35"/><stop offset="1" stop-color="#f5a524" stop-opacity="0"/></linearGradient></defs>
        <path d="${s.area}" fill="url(#${id})" opacity=".6"/>
        <path class="spark-line" d="${s.line}"/>
      </svg>
    </div>`;
};

const articleCard = (a, feature = false) => {
  const i = articles.indexOf(a);
  return `
    <a href="/blog/${a.slug}/" class="article-card spot${feature ? ' article-feature' : ''}" data-category="${esc(a.category)}">
      ${cover(a, i)}
      <div class="article-card-body">
        <div class="article-meta"><span class="cat">${esc(a.category)}</span><span>${fmtDate(a.date)}</span><span>${a.minutes} min read</span></div>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.excerpt)}</p>
        <span class="read">Read article <span aria-hidden="true">→</span></span>
      </div>
    </a>`;
};

/* ---------- Home ---------- */

const heroCard = (post, cls, w, h) => `
  <div class="post-card post-card-float ${cls}">
    ${cls === 'post-card--a' ? '<div class="post-card-head"><span class="avatar"></span><span>@yourbroker</span></div>' : ''}
    <div class="post-card-img">${media(post, `Post · ${w}×${h}`)}</div>
    <div class="post-card-foot"><span>${post.caption}</span><span${cls === 'post-card--a' ? ' class="amber"' : ''}>${post.meta}</span></div>
  </div>`;

const hero = () => `
<section class="hero rule" id="top">
  <img class="hero-map" src="${ASSET_BASE}graphic/world-map-dots.svg" alt="" aria-hidden="true">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <div class="hero-eyebrow"><span class="hero-eyebrow-rule"></span>A social media agency for forex brokers</div>
      <h1>Social media for forex brokers, <span class="dim">handled in full.</span></h1>
      <p class="lede">We run Instagram, Facebook and Telegram for brokers who want their social to look like their platform: precise, credible, hard to ignore.</p>
      <div class="hero-ctas">
        <a href="/contact/" class="btn-amber">Send a brief <span aria-hidden="true">→</span></a>
        <a href="#work" class="btn-outline-mono">See the work</a>
      </div>
      <dl class="hero-meta">
        ${map(heroMeta, (m) => `<div><dt>${m.k}</dt><dd>${m.v}</dd></div>`)}
      </dl>
    </div>
    <div class="hero-art" aria-hidden="true" data-parallax>
      <div class="hero-glow"></div>
      <div class="hero-ring"></div>
      <div class="layer" data-depth="0.35"><img class="hero-person" src="/img/hero-person.webp" alt="" fetchpriority="high"></div>
      <div class="layer" data-depth="1.3"><img class="hero-coin" src="/img/hero-badge.webp" alt=""></div>
      <div class="layer" data-depth="0.9">${heroCard(heroPosts.tall, 'post-card--a', 1080, 1350)}</div>
      <div class="layer" data-depth="0.7">${heroCard(heroPosts.square, 'post-card--b', 1080, 1080)}</div>
      <div class="hero-pill"><span class="check">✓</span><span class="hero-pill-text" data-pill-cycle>Cleared compliance · ready to post</span></div>
    </div>
  </div>
</section>`;

const servicesSection = () => `
<section class="section rule" id="services">
  <div class="wrap">
    ${sectionHead('01 / Services', 'What we run, listed like a watchlist.', 'Every channel is fully managed: strategy, design, copy, posting and community.')}
    <div class="svc-table" role="table" aria-label="Services">
      <div class="svc-row svc-head" role="row"><span role="columnheader">Ticker</span><span></span><span role="columnheader">Service</span><span role="columnheader">Format</span><span role="columnheader" class="right">Status</span></div>
      ${map(services, (s) => `
      <div class="svc-row" role="row">
        <span class="svc-tk" role="cell">${s.tk}</span>
        <span class="icon-tile"><img src="${s.icon}" alt="" class="amberize" loading="lazy"></span>
        <div class="svc-main" role="cell"><div class="svc-name">${s.name}</div><div class="svc-desc">${s.desc}</div></div>
        <span class="svc-fmt" role="cell">${s.fmt}</span>
        <span class="svc-status" role="cell"><span class="dot"></span>Available</span>
      </div>`)}
    </div>
  </div>
</section>`;

const carousels = Object.fromEntries(posts.carousels.map((c) => [c.slug, c]));

const tile = (slug) => {
  const c = carousels[slug];
  return `
        <button type="button" class="tile tile--tall" data-carousel="${c.slug}" data-category="${esc(c.category)}" data-slides="${c.slides}" data-caption="${esc(`${c.category} · ${c.title}`)}" aria-label="Open carousel: ${esc(c.title)}, ${c.slides} slides">
          <img src="/posts/${c.slug}/cover.webp" alt="" width="640" height="800" loading="lazy" decoding="async">
          ${SHOW_BADGES ? `<span class="tile-badge">${esc(c.category)}</span>` : ''}
          <span class="tile-count" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="3.5" width="9" height="11" rx="1.5"/><path d="M5.5 1.5h7a2 2 0 0 1 2 2v9"/></svg>${c.slides}</span>
        </button>`;
};

// Full-screen carousel viewer for the feed (main.js fills it in when a tile is clicked).
const lightbox = () => `
<dialog class="lightbox" data-lightbox aria-label="Carousel">
  <div class="lb-stage">
    <button type="button" class="lb-nav lb-prev" data-lb-prev aria-label="Previous slide">←</button>
    <div class="lb-frame"><div class="lb-track" data-lb-track></div></div>
    <button type="button" class="lb-nav lb-next" data-lb-next aria-label="Next slide">→</button>
  </div>
  <div class="lb-bar">
    <span class="lb-caption" data-lb-caption></span>
    <span class="lb-dots" data-lb-dots></span>
    <button type="button" class="lb-close" data-lb-close aria-label="Close">Close <span aria-hidden="true">×</span></button>
  </div>
</dialog>`;

const feed = () => `
<section class="section rule feed" id="work">
  <div class="wrap">
    ${sectionHead('02 / The feed', 'Carousels built to clear compliance.', 'Concept work for fictional brokers: company news, industry news and promotions. A different brand every time, the same discipline underneath. Tap any post to flip through it.', 380)}
    <div class="blog-filters feed-filters" role="group" aria-label="Filter posts by category" data-feed-filters>
      <button type="button" class="filter-chip" aria-pressed="true" data-filter="*">All<span>${posts.carousels.length}</span></button>
      ${map([...new Set(posts.carousels.map((c) => c.category))], (cat) => `<button type="button" class="filter-chip" aria-pressed="false" data-filter="${esc(cat)}">${esc(cat)}<span>${posts.carousels.filter((c) => c.category === cat).length}</span></button>`)}
    </div>
  </div>
  ${map(posts.rows, (row, r) => `
  <div class="feed-row" data-row data-dir="${r % 2 ? -1 : 1}">
    <div class="wrap feed-controls">
      <button type="button" class="arrow" data-nav="-1" aria-label="Scroll row ${r + 1} back">←</button>
      <button type="button" class="arrow" data-nav="1" aria-label="Scroll row ${r + 1} forward">→</button>
    </div>
    <div class="track" data-track tabindex="0" aria-label="Sample carousels, row ${r + 1}">${map(row, tile)}
    </div>
  </div>`)}
  ${lightbox()}
</section>`;

const process = () => `
<section class="section rule" id="process">
  <div class="wrap">
    ${heading('03 / Process', 'From brief to first post in three weeks.')}
    <ol class="steps">
      ${map(steps, (s) => `
      <li class="step">
        <span class="step-dot"></span>
        <div class="step-top"><span class="step-label">${s.n} · ${s.when}</span><img src="${s.icon}" alt="" class="amberize" loading="lazy"></div>
        <div class="step-title">${s.t}</div>
        <p class="step-body">${s.d}</p>
      </li>`)}
    </ol>
  </div>
</section>`;

const about = () => `
<section class="section rule" id="about">
  <div class="wrap about-grid">
    <div>
      ${heading('04 / About', 'A small agency that speaks broker.')}
      <p class="about-intro">Broker marketing usually looks like broker marketing. We think that's the problem.</p>
      <p class="about-body">We know the regulations you operate under, the entities you route traffic through, and the line between messaging that clears compliance and messaging that gets flagged. We take on a limited number of brokers at a time, in the languages your traders speak.</p>
      <dl class="specs">${map(specs, (s) => `<div><dt>${s.k}</dt><dd>${s.v}</dd></div>`)}</dl>
    </div>
    <div class="about-panel">
      <img src="/img/about-phones.webp" alt="" class="about-phones" loading="lazy">
      <div class="about-caption"><span>Built for traders, not for likes</span><span class="amber">SEA · MENA · LatAm</span></div>
    </div>
  </div>
</section>`;

const clients = () => `
<section class="section rule" id="clients">
  <div class="wrap">
    ${heading('05 / Clients', 'What brokers say.')}
    <div class="quotes">
      ${map(quotes, (q) => `
      <figure class="quote spot">
        <div><div class="quote-mark" aria-hidden="true">“</div><blockquote>${q.q}</blockquote></div>
        <figcaption><img src="${q.img}" alt="" loading="lazy"><div><div class="quote-name">${q.name}</div><div class="quote-role">${q.role}</div></div></figcaption>
      </figure>`)}
    </div>
  </div>
</section>`;

const pricing = () => `
<section class="section rule" id="pricing">
  <div class="wrap">
    ${sectionHead('06 / Pricing', 'Monthly retainers. No lock-in.', 'Every plan includes strategy, design, copy, posting and a monthly report.', 300)}
    <div class="plans">
      ${map(plans, (p) => `
      <div class="plan spot${p.featured ? ' plan--featured' : ''}">
        ${p.tab ? `<span class="plan-tab">${p.tab}</span>` : ''}
        <div class="plan-label">${p.label}</div>
        <div><div class="plan-pre">${p.pre}</div><div class="plan-price">${p.price}${p.per ? `<span>${p.per}</span>` : ''}</div></div>
        <ul class="plan-features">${map(p.features, (f) => `<li>— ${f}</li>`)}</ul>
        <a href="/contact/?plan=${encodeURIComponent(p.subject)}#brief" class="${p.featured ? 'btn-amber btn-block' : 'btn-outline btn-block'}">${p.cta}</a>
      </div>`)}
    </div>
  </div>
</section>`;

const desk = () => `
<section class="section rule" id="desk">
  <div class="wrap">
    <div class="desk-head">
      <div>${heading('07 / From the desk', 'Notes on broker social.')}</div>
      <a href="/blog/" class="link-arrow">All articles <span aria-hidden="true">→</span></a>
    </div>
    <div class="article-grid">${map(articles.slice(0, 3), (a) => articleCard(a))}</div>
  </div>
</section>`;

const faq = () => `
<section class="section rule" id="faq">
  <div class="wrap faq-grid">
    <div>${heading('08 / FAQ', 'Questions brokers ask first.')}</div>
    <div class="faq-list" data-faq>
      ${map(faqs, (f, i) => `
      <div class="faq-item">
        <button type="button" class="faq-trigger" aria-expanded="${i === 0}" aria-controls="faq-${i}" id="faq-q-${i}">
          <span class="faq-n">${pad(i)}</span><span class="faq-q">${f.q}</span><span class="faq-sign" aria-hidden="true">${i === 0 ? '−' : '+'}</span>
        </button>
        <p class="faq-a" id="faq-${i}" role="region" aria-labelledby="faq-q-${i}"${i === 0 ? '' : ' hidden'}>${f.a}</p>
      </div>`)}
    </div>
  </div>
</section>`;

const contact = () => `
<section class="section contact" id="contact">
  <div class="contact-glow" aria-hidden="true"></div>
  <div class="wrap contact-grid">
    <div>
      ${heading('09 / Contact', 'Send us a brief.')}
      <div class="status-pill"><span class="dot"></span>OPEN FOR NEW BRIEFS · REPLY &lt; 24H</div>
      <p class="contact-lede">Tell us about your brokerage. The form goes straight to our team, and a strategist replies within 24 hours.</p>
      <ol class="brief-list">${map(briefList, (b, i) => `<li><span>${pad(i)}</span>${b}</li>`)}</ol>
    </div>
    <div class="contact-form-wrap">
      <img src="/img/contact-plane.webp" alt="" class="contact-plane" loading="lazy">
      ${contactForm('compact')}
    </div>
  </div>
</section>`;

const home = () => ({
  title: 'Grydelo — Social media agency for forex brokers',
  description: 'Grydelo runs Instagram, Facebook and Telegram for forex brokers. Compliance-aware, region-specific, built for regulated markets.',
  active: '/',
  main: [hero(), servicesSection(), feed(), process(), about(), clients(), pricing(), desk(), faq(), contact()].join('\n'),
});

/* ---------- Contact ---------- */

const hours = [
  { k: 'Sydney', v: '22:00 UTC' },
  { k: 'London', v: '07:00 UTC' },
  { k: 'New York', v: '13:30 UTC' },
];

const contactPage = () => ({
  title: 'Contact us — Grydelo',
  description: 'Send Grydelo a brief. Tell us about your brokerage, regions and channels, and a strategist replies within 24 hours.',
  active: '/contact/',
  main: `
${pageHero('Contact us', 'Tell us about <span class="dim">your brokerage.</span>', 'A few details are enough to start. Your brief goes straight to our team, and a strategist replies within 24 hours, usually sooner.')}
<section class="wrap contact-page">
  <div id="brief">${contactForm('full')}</div>
  <aside class="contact-aside">
    <div class="aside-card spot">
      <div class="eyebrow">Email</div>
      <a href="mailto:${EMAIL}" class="aside-email">${EMAIL}<span class="amber" aria-hidden="true">↗</span></a>
      <p>Prefer email? Write to us directly. Same team, same 24-hour reply.</p>
    </div>
    <div class="aside-card spot">
      <div class="eyebrow">What happens next</div>
      <ol class="aside-steps">
        <li><span>01</span><b>We read your brief</b><p>A strategist replies within 24 hours with questions or a call slot.</p></li>
        <li><span>02</span><b>Audit in week one</b><p>Your channels, competitors and the compliance lines you can't cross.</p></li>
        <li><span>03</span><b>First posts in week three</b><p>Approved by you and your compliance team before anything ships.</p></li>
      </ol>
    </div>
    <div class="aside-card spot">
      <div class="eyebrow">We work the sessions</div>
      <ul class="aside-hours" data-hours>
        ${map(hours, (h) => `<li data-session="${h.k}"><b>${h.k}</b><span>opens ${h.v}</span></li>`)}
      </ul>
    </div>
  </aside>
</section>`,
});

const sentPage = () => ({
  title: 'Brief received — Grydelo',
  description: 'Thanks for your brief.',
  active: '/contact/',
  noindex: true,
  main: `
<section class="not-found">
  <div class="wrap">
    <div class="hero-eyebrow" style="justify-content:center"><span class="hero-eyebrow-rule"></span>Brief received</div>
    <h1 class="page-title">Thanks. We're on it.</h1>
    <p class="lede">We'll reply from ${EMAIL} within 24 hours. In the meantime, the desk is open.</p>
    <div class="hero-ctas"><a href="/blog/" class="btn-amber">Read the blog <span aria-hidden="true">→</span></a><a href="/" class="btn-outline-mono">Back home</a></div>
  </div>
</section>`,
});

/* ---------- Blog ---------- */

const blogIndex = () => {
  const cats = [...new Set(articles.map((a) => a.category))];
  return {
    title: 'Blog — Grydelo',
    description: 'Practical notes on social media for forex and CFD brokers: compliance, content planning, Telegram, localisation, video and reporting.',
    active: '/blog/',
    main: `
${pageHero('The desk', 'Notes on <span class="dim">broker social.</span>', 'Practical writing on compliance, content planning, channels and reporting for forex and CFD brokers. No hype, no predictions.')}
<section class="section-sm">
  <div class="wrap">
    <div class="blog-filters" role="group" aria-label="Filter by category" data-blog-filters>
      <button type="button" class="filter-chip" aria-pressed="true" data-filter="*">All<span>${articles.length}</span></button>
      ${map(cats, (c) => `<button type="button" class="filter-chip" aria-pressed="false" data-filter="${esc(c)}">${esc(c)}<span>${articles.filter((a) => a.category === c).length}</span></button>`)}
    </div>
    ${articleCard(articles[0], true)}
    <div class="article-grid" style="margin-top:16px" data-blog-grid>${map(articles.slice(1), (a) => articleCard(a))}</div>
  </div>
</section>`,
  };
};

const articlePage = (a) => {
  const i = articles.indexOf(a);
  const newer = articles[i - 1];
  const older = articles[i + 1];
  const related = articles.filter((x) => x !== a).slice(0, 3);
  return {
    title: `${a.title} — Grydelo`,
    description: a.excerpt,
    active: '/blog/',
    type: 'article',
    jsonld: {
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.title, description: a.excerpt,
      datePublished: a.date, author: { '@type': 'Organization', name: 'Grydelo' },
      publisher: { '@type': 'Organization', name: 'Grydelo' }, mainEntityOfPage: `${SITE}/blog/${a.slug}/`,
    },
    main: `
<div class="read-progress" data-read-progress aria-hidden="true"></div>
<section class="page-hero rule">
  <div class="page-hero-glow" aria-hidden="true"></div>
  <div class="wrap article-head">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/blog/">Blog</a><span>/</span><span class="amber">${esc(a.category)}</span></nav>
    <h1 class="page-title">${esc(a.title)}</h1>
    <p class="lede">${esc(a.excerpt)}</p>
    <div class="article-meta"><span>${fmtDate(a.date)}</span><span>${a.minutes} min read</span></div>
    <div class="byline"><span class="byline-mark">G.</span><span><b>Grydelo editorial</b>Strategy desk</span></div>
  </div>
</section>
<div class="wrap article-layout">
  <aside class="toc" aria-label="On this page">
    <div class="toc-title">On this page</div>
    <ol>${map(a.toc, (t) => `<li><a href="#${t.id}" data-toc-link>${t.text}</a></li>`)}</ol>
  </aside>
  <div>
    <article class="prose" data-article>${a.body}</article>
    <div class="article-cta">
      <div><h3>Want this run for your brokerage?</h3><p>We plan, write, design and post, and your compliance team signs off.</p></div>
      <a href="/contact/" class="btn-amber">Send a brief <span aria-hidden="true">→</span></a>
    </div>
    <nav class="article-nav" aria-label="More articles">
      ${older ? `<a href="/blog/${older.slug}/"><span>← Previous</span>${esc(older.title)}</a>` : ''}
      ${newer ? `<a href="/blog/${newer.slug}/" class="next"><span>Next →</span>${esc(newer.title)}</a>` : ''}
    </nav>
  </div>
</div>
<section class="section-sm" style="border-top:1px solid var(--line)">
  <div class="wrap">
    <div class="desk-head"><div>${heading('Keep reading', 'More from the desk.')}</div><a href="/blog/" class="link-arrow">All articles <span aria-hidden="true">→</span></a></div>
    <div class="article-grid">${map(related, (r) => articleCard(r))}</div>
  </div>
</section>`,
  };
};

/* ---------- Economic calendar ---------- */

const calendarPage = () => {
  const guide = articles.find((a) => a.slug === 'plan-a-week-of-content-around-the-economic-calendar');
  const skeleton = map(Array.from({ length: 8 }), () => `
      <div class="cal-row"><div class="skeleton" style="width:60px"></div><div class="skeleton" style="width:36px"></div><div class="skeleton" style="width:60px"></div><div class="skeleton" style="width:70%"></div><div class="skeleton"></div><div class="skeleton"></div></div>`);
  return {
    title: 'Economic calendar — Grydelo',
    description: "This week's economic calendar for forex: CPI, NFP, central bank decisions and more, in your time zone, with a live countdown to the next high-impact release.",
    active: '/calendar/',
    main: `
${pageHero('Economic calendar', 'The week in <span class="dim">market events.</span>', "This week's scheduled releases, in your time zone. We plan broker content around this calendar, and so can you.")}
<section class="section-sm" data-calendar>
  <div class="wrap">
    <div class="cal-summary" style="margin-top:0">
      <div class="stat stat--next spot">
        <div class="stat-k"><span class="impact-dot impact-dot--high"></span>Next high impact</div>
        <div class="stat-v" data-cal-countdown>—</div>
        <div class="stat-sub" data-cal-next>Loading this week's calendar…</div>
      </div>
      <div class="stat spot"><div class="stat-k">Events this week</div><div class="stat-v" data-cal-total>—</div><div class="stat-sub" data-cal-range>&nbsp;</div></div>
      <div class="stat spot"><div class="stat-k">High impact</div><div class="stat-v" data-cal-high>—</div><div class="stat-sub" data-cal-ccys>&nbsp;</div></div>
    </div>
    <div class="cal-toolbar">
      <div class="seg" role="group" aria-label="Day" data-cal-days></div>
      <div class="cal-toolbar-group">
        <div class="seg" role="group" aria-label="Impact" data-cal-impact>
          <button type="button" data-v="all" aria-pressed="false">All impact</button>
          <button type="button" data-v="medium" aria-pressed="true">Medium +</button>
          <button type="button" data-v="high" aria-pressed="false">High</button>
        </div>
        <div class="seg" role="group" aria-label="Time zone" data-cal-tz>
          <button type="button" data-v="local" aria-pressed="true">Local</button>
          <button type="button" data-v="utc" aria-pressed="false">UTC</button>
        </div>
      </div>
    </div>
    <div class="blog-filters" style="margin:16px 0 0" role="group" aria-label="Currency" data-cal-ccy></div>
    <div class="cal-table" data-cal-table aria-live="polite">
      <div class="cal-row cal-head"><span>Time</span><span>Ccy</span><span>Impact</span><span>Event</span><span class="right">Forecast</span><span class="right">Previous</span></div>
      ${skeleton}
    </div>
    <noscript><p class="cal-note">The calendar needs JavaScript to load this week's events.</p></noscript>
    <div class="cal-note">
      <span data-cal-tzlabel>Times in your local time zone</span>
      <span>Source: <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener">Forex Factory</a> weekly feed · refreshed every 30 min · not investment advice</span>
    </div>
    ${guide ? `
    <div class="article-cta cal-promo">
      <div><h3>Turn this week into a content plan.</h3><p>Explainers before, live posts during, recaps after, and never predictions.</p></div>
      <a href="/blog/${guide.slug}/" class="btn-amber">Read the guide <span aria-hidden="true">→</span></a>
    </div>` : ''}
  </div>
</section>`,
  };
};

/* ---------- Privacy + 404 ---------- */

const privacyPage = () => ({
  title: 'Privacy & cookies — Grydelo',
  description: 'How Grydelo handles personal data submitted through this website, and how we use cookies and browser storage.',
  active: '',
  main: `
${pageHero('Legal', 'Privacy &amp; <span class="dim">cookies.</span>', 'Plain language, short and specific. Last updated 25 September 2026.')}
<section class="wrap plain">
  <div class="prose">
    <h2 id="who">Who we are</h2>
    <p>Grydelo is a social media agency for forex and CFD brokers. For questions about this policy or your data, email <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
    <h2 id="what">What we collect</h2>
    <p>When you send a brief through our contact form we receive what you enter: your name, work email, company, website, target regions, channels, plan and message. We also record the page you sent it from, the time, and your approximate country as reported by our hosting provider, to help us filter spam.</p>
    <p>We don't ask for, and you shouldn't send, trading account details, identity documents or payment information.</p>
    <h2 id="use">How we use it</h2>
    <ul>
      <li>To reply to your brief and discuss working together.</li>
      <li>To keep a record of our correspondence with you.</li>
      <li>To protect the form from abuse.</li>
    </ul>
    <p>We don't sell your data or add you to marketing lists without asking.</p>
    <h2 id="where">Where it goes</h2>
    <p>Form submissions are delivered by email to our team through Cloudflare, which hosts this website. Our email is handled by our email provider. We keep correspondence for as long as needed to handle your enquiry and any resulting working relationship, then delete it.</p>
    <h2 id="cookies">Cookies and browser storage</h2>
    <p>This site doesn't set advertising cookies. We use your browser's local storage for a few essentials:</p>
    <ul>
      <li><strong>Consent choice</strong>: remembers what you picked in the cookie banner.</li>
      <li><strong>Theme</strong>: remembers whether you prefer the light or dark theme.</li>
    </ul>
    <p><strong>Analytics</strong> and <strong>marketing</strong> measurement only run if you allow them in the banner. You can change your choice at any time with the <em>Cookie settings</em> link in the footer.</p>
    <p>The economic calendar shows data from the Forex Factory weekly feed, fetched by our server. Your browser doesn't contact Forex Factory unless you follow the source link. Fonts are loaded from Google Fonts.</p>
    <h2 id="rights">Your rights</h2>
    <p>Depending on where you live, you may have the right to access, correct or delete the personal data we hold about you, or to object to how we use it. Email <a href="mailto:${EMAIL}">${EMAIL}</a> and we'll respond within 30 days.</p>
  </div>
</section>`,
});

const notFound = () => ({
  title: 'Page not found — Grydelo',
  description: 'This page does not exist.',
  active: '',
  noindex: true,
  main: `
<section class="not-found">
  <div class="wrap">
    <div class="hero-eyebrow" style="justify-content:center"><span class="hero-eyebrow-rule"></span>Error 404</div>
    <h1 class="page-title">Market closed <span class="dim">on this page.</span></h1>
    <p class="lede">The page you're looking for doesn't exist or has moved.</p>
    <div class="hero-ctas"><a href="/" class="btn-amber">Back home <span aria-hidden="true">→</span></a><a href="/blog/" class="btn-outline-mono">Read the blog</a></div>
  </div>
</section>`,
});

/* ---------- Routing ---------- */

const ROUTES = {
  '/': home,
  '/contact/': contactPage,
  '/contact/sent/': sentPage,
  '/blog/': blogIndex,
  '/calendar/': calendarPage,
  '/privacy/': privacyPage,
  ...Object.fromEntries(articles.map((a) => [`/blog/${a.slug}/`, () => articlePage(a)])),
};

// Every path that gets its own index.html at build time (404.html is emitted separately).
export const routePaths = () => Object.keys(ROUTES);

function head(page, path) {
  const url = `${SITE}${path}`;
  return [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    page.noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:type" content="${page.type || 'website'}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="Grydelo" />`,
    page.jsonld ? `<script type="application/ld+json">${JSON.stringify(page.jsonld).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n  ');
}

// Returns { head, body, status } for a URL path, falling back to the 404 page.
export function renderRoute(rawPath) {
  let path = rawPath.split(/[?#]/)[0];
  if (!path.endsWith('/') && !path.includes('.')) path += '/';
  const make = ROUTES[path];
  const page = make ? make() : notFound();
  return { head: head(page, make ? path : '/404'), body: layout(page.active, page.main), status: make ? 200 : 404 };
}

export const sitemap = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routePaths().filter((p) => p !== '/contact/sent/').map((p) => {
  const a = articles.find((x) => p === `/blog/${x.slug}/`);
  return `  <url><loc>${SITE}${p}</loc>${a ? `<lastmod>${a.date}</lastmod>` : ''}</url>`;
}).join('\n')}
</urlset>
`;
