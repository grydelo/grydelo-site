// Shared fetch for /api/calendar with a short sessionStorage cache, so page-to-page navigation stays instant.
const KEY = 'grydelo.calendar';
const TTL = 5 * 60 * 1000;
let pending;

export function loadCalendar() {
  if (pending) return pending;
  try {
    const hit = JSON.parse(sessionStorage.getItem(KEY));
    if (hit && Date.now() - hit.at < TTL) return (pending = Promise.resolve(hit.data));
  } catch {}
  pending = fetch('/api/calendar', { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`calendar ${r.status}`))))
    .then((data) => {
      try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), data })); } catch {}
      return data;
    });
  pending.catch(() => { pending = null; });
  return pending;
}

export function countdown(ms) {
  if (ms <= 0) return 'now';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const p = (n) => String(n).padStart(2, '0');
  return d ? `${d}d ${p(h)}h ${p(m)}m` : `${p(h)}:${p(m)}:${p(s % 60)}`;
}

export const nextHigh = (events, now = Date.now()) => events.find((e) => e.impact === 'high' && Date.parse(e.t) > now);
