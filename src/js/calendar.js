// Economic calendar page: renders /api/calendar with day, impact, currency and time zone filters.
import { loadCalendar, countdown, nextHigh } from './calendar-data.js';

const TZ_KEY = 'grydelo.calendar.tz';
const RANK = { high: 3, medium: 2, low: 1, holiday: 0 };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function initCalendar(root) {
  const $ = (sel) => root.querySelector(sel);
  const table = $('[data-cal-table]');
  const head = table.querySelector('.cal-head').outerHTML;
  let tzPref = 'local';
  try { tzPref = localStorage.getItem(TZ_KEY) || 'local'; } catch {}
  const state = { day: 'all', impact: 'medium', tz: tzPref, ccy: '*' };
  let events = [];

  const zone = () => (state.tz === 'utc' ? 'UTC' : undefined);
  const dayKey = (t) => new Date(t).toLocaleDateString('en-CA', { timeZone: zone() });
  const time = (t) => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: zone() });
  const dayLabel = (key, style = 'long') =>
    new Date(`${key}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: style === 'long' ? 'long' : 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  const todayKey = () => dayKey(Date.now());

  const passes = (e, ignoreDay = false) =>
    (state.impact === 'all' || RANK[e.impact] >= RANK[state.impact]) &&
    (state.ccy === '*' || e.ccy === state.ccy) &&
    (ignoreDay || state.day === 'all' || dayKey(e.t) === state.day);

  const setPressed = (group, value) =>
    group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === value)));

  function renderDays() {
    const days = [...new Set(events.map((e) => dayKey(e.t)))];
    const count = (d) => events.filter((e) => passes(e, true) && (d === 'all' || dayKey(e.t) === d)).length;
    $('[data-cal-days]').innerHTML = [
      `<button type="button" data-v="all">Week<span class="n">${count('all')}</span></button>`,
      ...days.map((d) => `<button type="button" data-v="${d}"${d === todayKey() ? ' class="amber"' : ''}>${dayLabel(d, 'short').split(' ')[0]}<span class="n">${count(d)}</span></button>`),
    ].join('');
    setPressed($('[data-cal-days]'), state.day);
  }

  function renderCcys() {
    const ccys = [...new Set(events.map((e) => e.ccy))].filter(Boolean).sort();
    $('[data-cal-ccy]').innerHTML = ['*', ...ccys]
      .map((c) => `<button type="button" class="filter-chip" data-v="${c}" aria-pressed="${c === state.ccy}">${c === '*' ? 'All currencies' : c}</button>`)
      .join('');
  }

  function renderTable() {
    const now = Date.now();
    const list = events.filter((e) => passes(e));
    if (!list.length) {
      table.innerHTML = `${head}<div class="cal-row cal-empty">No events match these filters.</div>`;
      return;
    }
    let html = head;
    let lastDay = null;
    let nowPlaced = false;
    for (const e of list) {
      const t = Date.parse(e.t);
      const d = dayKey(e.t);
      if (d !== lastDay) {
        const n = list.filter((x) => dayKey(x.t) === d).length;
        html += `<div class="cal-row cal-day"><span${d === todayKey() ? ' class="today"' : ''}>${dayLabel(d)}${d === todayKey() ? ' · Today' : ''}</span><span>${n} event${n === 1 ? '' : 's'}</span></div>`;
        lastDay = d;
      }
      if (!nowPlaced && t > now && list[0] !== e && Date.parse(list[0].t) < now) {
        html += '<div class="cal-now" aria-hidden="true"><span>NOW</span></div>';
        nowPlaced = true;
      }
      const cls = [t < now ? 'past' : '', t > now && t - now < 3600e3 ? 'soon' : '', e.impact === 'high' ? 'high' : ''].join(' ');
      html += `
      <div class="cal-row ${cls}">
        <span class="cal-time">${e.impact === 'holiday' ? 'All day' : time(e.t)}</span>
        <span class="cal-ccy">${esc(e.ccy)}</span>
        <span class="cal-impact"><span class="impact-dot impact-dot--${e.impact}"></span>${e.impact}</span>
        <span class="cal-title" title="${esc(e.title)}">${esc(e.title)}</span>
        <span class="cal-nums">
          <span class="cal-num${e.forecast ? '' : ' empty'}" data-label="F">${esc(e.forecast || '—')}</span>
          <span class="cal-num${e.previous ? '' : ' empty'}" data-label="P">${esc(e.previous || '—')}</span>
        </span>
      </div>`;
    }
    table.innerHTML = html;
  }

  function renderSummary() {
    const high = events.filter((e) => e.impact === 'high');
    const first = events[0]?.t;
    const last = events[events.length - 1]?.t;
    $('[data-cal-total]').textContent = events.length;
    $('[data-cal-high]').textContent = high.length;
    if (first) $('[data-cal-range]').textContent = `${dayLabel(dayKey(first), 'short')} – ${dayLabel(dayKey(last), 'short')}`;
    const byCcy = {};
    high.forEach((e) => { byCcy[e.ccy] = (byCcy[e.ccy] || 0) + 1; });
    const top = Object.entries(byCcy).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
    $('[data-cal-ccys]').textContent = top.length ? `Most active: ${top.join(' · ')}` : 'No high-impact releases';
    $('[data-cal-tzlabel]').textContent =
      state.tz === 'utc' ? 'Times in UTC' : `Times in your time zone (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
  }

  function tickNext() {
    const ev = nextHigh(events);
    $('[data-cal-countdown]').textContent = ev ? countdown(Date.parse(ev.t) - Date.now()) : '—';
    $('[data-cal-next]').textContent = ev
      ? `${ev.ccy} · ${ev.title} · ${dayLabel(dayKey(ev.t), 'short')} ${time(ev.t)}`
      : 'No more high-impact releases this week';
  }

  const renderAll = () => { renderDays(); renderCcys(); renderTable(); renderSummary(); tickNext(); };

  $('[data-cal-days]').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    state.day = b.dataset.v;
    setPressed($('[data-cal-days]'), state.day);
    renderTable();
  });
  $('[data-cal-impact]').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    state.impact = b.dataset.v;
    setPressed($('[data-cal-impact]'), state.impact);
    renderDays();
    renderTable();
  });
  $('[data-cal-tz]').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    state.tz = b.dataset.v;
    state.day = 'all';
    try { localStorage.setItem(TZ_KEY, state.tz); } catch {}
    setPressed($('[data-cal-tz]'), state.tz);
    renderAll();
  });
  $('[data-cal-ccy]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]');
    if (!b) return;
    state.ccy = b.dataset.v;
    $('[data-cal-ccy]').querySelectorAll('[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderDays();
    renderTable();
  });
  setPressed($('[data-cal-tz]'), state.tz);

  const load = () =>
    loadCalendar()
      .then((data) => {
        events = data.events;
        renderAll();
        setInterval(tickNext, 1000);
        setInterval(renderTable, 60_000); // keeps past/soon/now markers current
      })
      .catch(() => {
        table.innerHTML = `${head}<div class="cal-row cal-empty">We couldn't load this week's calendar just now. <button type="button" class="btn-text" data-cal-retry>Try again</button></div>`;
        $('[data-cal-next]').textContent = 'Calendar unavailable';
        $('[data-cal-retry]').addEventListener('click', load);
      });
  load();
}
