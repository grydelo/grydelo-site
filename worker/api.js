// /api/* handlers. Platform-free: the Worker (worker/index.js) and the Vite dev server (vite.config.js)
// each pass in their own `deps` for sending mail, caching and rate limiting.

const FEED_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
const IMPACTS = { High: 'high', Medium: 'medium', Low: 'low', Holiday: 'holiday' };
const EMAIL_RE = /^[^\s@<>()"',;:]+@[^\s@<>()"',;:]+\.[a-z]{2,}$/i;

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } });

export async function handleApi(request, deps) {
  const { pathname } = new URL(request.url);
  if (pathname === '/api/calendar' && request.method === 'GET') return calendar(deps);
  if (pathname === '/api/contact') {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
    return contact(request, deps);
  }
  return json({ error: 'Not found' }, 404);
}

/* ---------- Economic calendar ---------- */

// Normalises the Forex Factory weekly feed to [{ t, ccy, title, impact, forecast, previous }], sorted by time.
export function normaliseFeed(raw) {
  return raw
    .map((e) => ({
      t: new Date(e.date).toISOString(),
      ccy: String(e.country || '').toUpperCase(),
      title: String(e.title || '').trim(),
      impact: IMPACTS[e.impact] || 'low',
      forecast: e.forecast || '',
      previous: e.previous || '',
    }))
    .filter((e) => e.title && !Number.isNaN(Date.parse(e.t)))
    .sort((a, b) => a.t.localeCompare(b.t));
}

async function calendar({ cacheGet, cachePut, fetchFeed }) {
  const fresh = await cacheGet('calendar:fresh');
  if (fresh) return json(fresh, 200, { 'Cache-Control': 'public, max-age=300', 'X-Cache': 'HIT' });
  try {
    const res = await fetchFeed(FEED_URL);
    if (!res.ok) throw new Error(`feed ${res.status}`);
    const events = normaliseFeed(await res.json());
    if (!events.length) throw new Error('feed empty');
    const body = { updated: new Date().toISOString(), source: 'Forex Factory', events };
    await cachePut('calendar:fresh', body, 1800);
    await cachePut('calendar:stale', body, 7 * 86400);
    return json(body, 200, { 'Cache-Control': 'public, max-age=300', 'X-Cache': 'MISS' });
  } catch (err) {
    // The feed rate-limits aggressively; serve the last good copy rather than an empty calendar.
    const stale = await cacheGet('calendar:stale');
    if (stale) return json({ ...stale, stale: true }, 200, { 'Cache-Control': 'public, max-age=60', 'X-Cache': 'STALE' });
    return json({ error: 'Calendar temporarily unavailable', detail: String(err.message || err) }, 503, { 'Cache-Control': 'no-store' });
  }
}

/* ---------- Contact form ---------- */

const clean = (v, max) => String(v ?? '').replace(/\r\n?/g, '\n').trim().slice(0, max);
const oneLine = (v, max) => clean(v, max).replace(/\s+/g, ' ');

async function readForm(request) {
  const type = request.headers.get('Content-Type') || '';
  if (type.includes('application/json')) return { data: await request.json(), wantsJson: true };
  const fd = await request.formData();
  const data = {};
  for (const [k, v] of fd.entries()) data[k] = k === 'channels' ? [...(data[k] || []), v] : v;
  return { data, wantsJson: false };
}

function validate(d) {
  const f = {
    name: oneLine(d.name, 100),
    email: oneLine(d.email, 160),
    company: oneLine(d.company, 120),
    website: oneLine(d.website, 200),
    plan: oneLine(d.plan, 60),
    region: oneLine(d.region, 60),
    channels: (Array.isArray(d.channels) ? d.channels : d.channels ? [d.channels] : []).map((c) => oneLine(c, 20)).slice(0, 8),
    message: clean(d.message, 5000),
    page: oneLine(d.page, 200),
  };
  const errors = [];
  if (!f.name) errors.push('Please add your name.');
  if (!EMAIL_RE.test(f.email)) errors.push('Please use a valid email address.');
  if (!f.company) errors.push('Please add your brokerage or company.');
  if (f.message.length < 10) errors.push('Please tell us a little more in your brief.');
  if (!['yes', 'true', 'on', true].includes(d.consent)) errors.push('Please agree to be contacted about your brief.');
  return { f, errors };
}

const isSpam = (d) => {
  if (d.fax) return true; // honeypot
  const ts = Number(d.ts);
  return ts > 0 && Date.now() - ts < 2500; // filled in faster than a person can
};

// Base64-encodes UTF-8 text (btoa only takes Latin-1).
const b64 = (s) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};

export function buildEmail({ from, to, replyTo, subject, text, id }) {
  const body = b64(text).replace(/.{1,76}/g, '$&\r\n');
  return [
    `From: "Grydelo website" <${from}>`,
    `To: <${to}>`,
    `Reply-To: <${replyTo}>`,
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${id}@grydelo.com>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    body,
  ].join('\r\n');
}

async function contact(request, deps) {
  let parsed;
  try {
    parsed = await readForm(request);
  } catch {
    return json({ error: 'Could not read the form.' }, 400);
  }
  const { data, wantsJson } = parsed;
  const fail = (msg, status = 400) =>
    wantsJson
      ? json({ error: msg }, status)
      : new Response(`<!doctype html><meta charset="utf-8"><title>Brief not sent</title><body style="font:16px system-ui;max-width:560px;margin:80px auto;padding:0 20px"><h1>Your brief wasn't sent</h1><p>${msg.replace(/</g, '&lt;')}</p><p><a href="/contact/">Back to the form</a> or email <a href="mailto:${deps.to}">${deps.to}</a>.</p>`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  const done = (id) =>
    wantsJson ? json({ ok: true, id }) : Response.redirect(new URL('/contact/sent/', request.url).toString(), 303);

  // Quietly accept spam so bots don't learn what tripped them.
  if (isSpam(data)) return done('GRY-0000');

  const { f, errors } = validate(data);
  if (errors.length) return fail(errors.join(' '));

  if (deps.limit && !(await deps.limit(request))) return fail('Too many submissions from your network. Please try again in a minute, or email us.', 429);

  const id = `GRY-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const meta = deps.meta ? deps.meta(request) : {};
  const text = [
    `New brief from the website (${id})`,
    '',
    `Name:      ${f.name}`,
    `Email:     ${f.email}`,
    `Company:   ${f.company}`,
    f.website ? `Website:   ${f.website}` : null,
    `Plan:      ${f.plan || '—'}`,
    f.region ? `Regions:   ${f.region}` : null,
    f.channels.length ? `Channels:  ${f.channels.join(', ')}` : null,
    '',
    'Brief:',
    f.message,
    '',
    '—',
    `Sent from ${f.page || 'unknown page'} at ${new Date().toISOString()}`,
    meta.country ? `Country: ${meta.country}` : null,
    'Reply to this email to answer the sender directly.',
  ].filter((l) => l !== null).join('\n');

  try {
    await deps.sendMail({
      from: deps.from,
      to: deps.inbox || deps.to, // envelope recipient; the header below still reads hello@
      raw: buildEmail({ from: deps.from, to: deps.to, replyTo: f.email, subject: `New brief: ${f.company} — ${f.plan || 'no plan picked'}`, text, id }),
    });
  } catch (err) {
    console.error('contact: send failed', err);
    return fail(`We couldn't send your brief just now. Please email ${deps.to} instead.`, 502);
  }
  return done(id);
}
