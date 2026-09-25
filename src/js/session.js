// Session bar: current forex session and the next one to open, from UTC time, plus ticking UTC clocks.
const SESSIONS = [
  { name: 'Sydney', open: 22 * 60 },
  { name: 'London', open: 7 * 60 },
  { name: 'New York', open: 13 * 60 + 30 },
];
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

function updateSession() {
  const now = new Date();
  const mins = now.getUTCHours() * 60 + now.getUTCMinutes();
  // Sessions are listed in the order they open through the UTC day, starting from 00:00 (inside Sydney).
  const byOpen = [...SESSIONS].sort((a, b) => a.open - b.open);
  let current = byOpen[byOpen.length - 1];
  for (const s of byOpen) if (mins >= s.open) current = s;
  const next = SESSIONS[(SESSIONS.indexOf(current) + 1) % SESSIONS.length];
  const nowEl = document.querySelector('[data-session-now]');
  const nextEl = document.querySelector('[data-session-next]');
  if (nowEl) nowEl.textContent = current.name;
  if (nextEl) nextEl.textContent = `${next.name} opens ${hhmm(next.open)} UTC`;
  // Contact page: highlight the session that's open now.
  document.querySelectorAll('[data-hours] [data-session]').forEach((li) => {
    const on = li.dataset.session === current.name;
    li.classList.toggle('on', on);
    li.querySelector('span').textContent = on ? 'open now' : `opens ${hhmm(SESSIONS.find((s) => s.name === li.dataset.session).open)} UTC`;
  });
}

function updateClocks() {
  const t = new Date().toISOString().slice(11, 19);
  document.querySelectorAll('[data-utc-clock]').forEach((el) => { el.textContent = `${t} UTC`; });
}

export function initSession() {
  updateSession();
  updateClocks();
  setInterval(updateSession, 30_000);
  setInterval(updateClocks, 1000);
}
