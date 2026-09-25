// Shared page chrome and helpers: session bar, header, footer, consent banner, contact form.
import { EMAIL, nav, footerCols, formPlans, formChannels } from './content.js';

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const pad = (i) => String(i + 1).padStart(2, '0');
export const map = (list, fn) => list.map(fn).join('');

export const heading = (eyebrow, title) => `<div class="eyebrow">${eyebrow}</div><h2>${title}</h2>`;

export const sectionHead = (eyebrow, title, note, noteWidth = 320) => `
  <div class="sec-head">
    <div>
      <div class="eyebrow">${eyebrow}</div>
      <h2>${title}</h2>
    </div>
    ${note ? `<p class="sec-note" style="max-width:${noteWidth}px">${note}</p>` : ''}
  </div>`;

// Inner-page intro block (every page except home).
export const pageHero = (eyebrow, title, lede, extra = '') => `
<section class="page-hero rule">
  <div class="page-hero-glow" aria-hidden="true"></div>
  <div class="wrap">
    <div class="hero-eyebrow"><span class="hero-eyebrow-rule"></span>${eyebrow}</div>
    <h1 class="page-title">${title}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
    ${extra}
  </div>
</section>`;

const sessionBar = () => `
<div class="session rule">
  <div class="wrap session-inner">
    <div class="session-left">
      <span class="live"><span class="dot"></span>Live</span>
      <span class="utc-clock" data-utc-clock>--:--:-- UTC</span>
      <span>Session <span data-session-now>London</span></span>
      <span class="slash">/</span>
      <span data-session-next>New York opens 13:30 UTC</span>
    </div>
    <div class="session-right">
      <a href="/calendar/" class="next-event" data-next-event hidden>
        <span class="impact-dot impact-dot--high" aria-hidden="true"></span>
        <span>Next high impact</span><span class="next-event-name" data-ne-name></span><span class="amber" data-ne-in></span>
      </a>
      <span data-briefs-open>Open for new briefs</span><span class="amber" data-briefs-open>Reply &lt; 24h</span>
    </div>
  </div>
</div>`;

const header = (active) => `
<header class="nav rule" data-nav>
  <div class="wrap nav-inner">
    <a href="/" class="logo" aria-label="Grydelo home">GRYDELO<span class="amber">.</span></a>
    <nav class="nav-links" aria-label="Primary">
      ${map(nav, (l) => `<a href="${l.href}"${l.href === active ? ' aria-current="page"' : ''}>${l.label}</a>`)}
    </nav>
    <div class="nav-right">
      <button type="button" class="theme-btn" data-theme-toggle aria-label="Switch to dark theme" title="Switch theme">
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"/></svg>
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>
      </button>
      <a href="/contact/" class="btn-light">Send a brief</a>
      <button type="button" class="menu-btn" aria-expanded="false" aria-controls="mobile-menu" data-menu-btn>
        <span class="sr-only">Menu</span><span class="menu-icon" aria-hidden="true"></span>
      </button>
    </div>
  </div>
  <div class="mobile-menu" id="mobile-menu" data-menu hidden>
    <nav class="wrap" aria-label="Mobile">
      ${map(nav, (l, i) => `<a href="${l.href}"${l.href === active ? ' aria-current="page"' : ''}><span>${pad(i)}</span>${l.label}</a>`)}
    </nav>
  </div>
</header>`;

const footer = () => `
<footer class="footer">
  <div class="wrap footer-top">
    <div class="footer-brand">
      <a href="/" class="logo" aria-label="Grydelo home">GRYDELO<span class="amber">.</span></a>
      <p>A boutique social media agency for forex and CFD brokers. Instagram, Facebook, Telegram, LinkedIn and X, run in full.</p>
      <a href="mailto:${EMAIL}" class="footer-email">${EMAIL}<span class="amber" aria-hidden="true">↗</span></a>
      <div class="status-pill"><span class="dot"></span>OPEN FOR NEW BRIEFS · REPLY &lt; 24H</div>
    </div>
    ${map(footerCols, (c) => `
    <div class="footer-col">
      <div class="footer-col-title">${c.title}</div>
      <ul>${map(c.links, (l) => `<li><a href="${l.href}">${l.label}</a></li>`)}</ul>
    </div>`)}
    <div class="footer-col">
      <div class="footer-col-title">Coverage</div>
      <ul class="footer-facts">
        <li><span>Regions</span>SEA · MENA · LatAm</li>
        <li><span>Languages</span>EN · TH · AR · VI</li>
        <li><span>Platforms</span>MT4 · MT5 · cTrader</li>
        <li><span>Hours</span>Sydney open → NY close</li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-disclaimer">
    Grydelo is a marketing agency. We are not a broker and do not provide investment advice. Trading forex and CFDs on margin
    carries a high level of risk and may not be suitable for all investors. Market data on this site is for information only.
  </div>
  <div class="wrap footer-inner">
    <span>© ${new Date().getFullYear()} Grydelo · Social media agency for forex brokers</span>
    <span class="footer-legal">
      <a href="/privacy/">Privacy</a>
      <button type="button" class="link-btn" data-consent-open>Cookie settings</button>
      <span data-utc-clock>--:--:-- UTC</span>
    </span>
  </div>
</footer>`;

const consentBanner = () => `
<div class="consent" data-consent role="dialog" aria-modal="false" aria-labelledby="consent-title" hidden>
  <div class="consent-body">
    <div class="consent-head">
      <div class="eyebrow" id="consent-title">Cookie preferences</div>
      <p>We use essential browser storage to run this site. With your permission we'd also use analytics to see which pages brokers read. No ad tracking, ever. <a href="/privacy/#cookies">Privacy &amp; cookies</a></p>
    </div>
    <div class="consent-prefs" data-consent-prefs hidden>
      <label class="consent-opt"><input type="checkbox" checked disabled><span><b>Essential</b>Remembers this choice and keeps forms working. Always on.</span></label>
      <label class="consent-opt"><input type="checkbox" name="analytics"><span><b>Analytics</b>Anonymous page and traffic statistics.</span></label>
      <label class="consent-opt"><input type="checkbox" name="marketing"><span><b>Marketing</b>Measuring campaigns that bring brokers to this site.</span></label>
    </div>
    <div class="consent-actions">
      <button type="button" class="btn-text" data-consent-action="customise">Customise</button>
      <button type="button" class="btn-text" data-consent-action="save" hidden>Save choices</button>
      <button type="button" class="btn-outline-sm" data-consent-action="reject">Essential only</button>
      <button type="button" class="btn-amber-sm" data-consent-action="accept">Accept all</button>
    </div>
  </div>
</div>`;

// Contact form. Works without JS (plain POST, the Worker redirects); main.js upgrades it to fetch.
export const contactForm = (variant = 'full') => {
  const full = variant === 'full';
  const field = (name, label, input, cls = '') => `
      <label class="field ${cls}"><span class="field-label">${label}</span>${input}</label>`;
  return `
<form class="cform cform--${variant}" action="/api/contact" method="post" data-contact-form>
  <div class="cform-grid" data-form-fields>
    ${field('name', 'Your name', '<input name="name" autocomplete="name" required maxlength="100" placeholder="Jane Doe">')}
    ${field('email', 'Work email', '<input name="email" type="email" autocomplete="email" required maxlength="160" placeholder="jane@broker.com">')}
    ${field('company', 'Brokerage / company', '<input name="company" autocomplete="organization" required maxlength="120" placeholder="Broker name + regulatory entity">')}
    ${full ? field('website', 'Website <em>optional</em>', '<input name="website" type="url" inputmode="url" maxlength="200" placeholder="https://">') : ''}
    ${field('plan', 'Plan', `<select name="plan" data-plan-select>${map(formPlans, (p) => `<option${p === 'Not sure yet' ? ' selected' : ''}>${p}</option>`)}</select>`)}
    ${full ? field('region', 'Target regions', `<select name="region">${map(['Southeast Asia', 'MENA', 'LatAm', 'Europe', 'Multiple regions', 'Other'], (r) => `<option>${r}</option>`)}</select>`) : ''}
    ${full ? `
      <fieldset class="field field--wide">
        <legend class="field-label">Channels <em>pick any</em></legend>
        <div class="chips">${map(formChannels, (c) => `<label class="chip"><input type="checkbox" name="channels" value="${c}"><span>${c}</span></label>`)}</div>
      </fieldset>` : ''}
    ${field('message', 'Brief', `<textarea name="message" required minlength="10" maxlength="5000" rows="${full ? 6 : 4}" placeholder="Current channels, languages, what's not working, and when you'd like to start."></textarea>`, 'field--wide')}
    <label class="hp" aria-hidden="true">Fax<input name="fax" tabindex="-1" autocomplete="off"></label>
    <input type="hidden" name="ts" value="" data-form-ts>
    <input type="hidden" name="page" value="" data-form-page>
    <label class="consent-check field--wide"><input type="checkbox" name="consent" value="yes" required><span>I agree to Grydelo contacting me about this brief. See our <a href="/privacy/">privacy policy</a>.</span></label>
    <div class="cform-foot field--wide">
      <button type="submit" class="btn-amber" data-submit><span data-submit-label>Send brief</span><span aria-hidden="true">→</span></button>
      <p class="cform-note">Goes straight to <a href="mailto:${EMAIL}">${EMAIL}</a>. Reply within 24 hours.</p>
    </div>
    <p class="cform-error" role="alert" data-form-error hidden></p>
  </div>
  <div class="cform-done" data-form-done hidden tabindex="-1">
    <span class="cform-done-icon" aria-hidden="true">✓</span>
    <div class="cform-done-title">Brief received.</div>
    <p>Thanks. We'll reply from <b>${EMAIL}</b> within 24 hours. <span class="mono" data-form-ref></span></p>
  </div>
</form>`;
};

// Full HTML body for a page: chrome + main content.
export const layout = (active, main) =>
  [sessionBar(), header(active), `<main id="main">${main}</main>`, footer(), consentBanner()].join('\n');
