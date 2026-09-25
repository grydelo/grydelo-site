// First-visit consent banner. Stores the choice locally and announces it, so analytics or marketing
// scripts can be loaded only once allowed:  window.addEventListener('grydelo:consent', (e) => e.detail.analytics && load())
const KEY = 'grydelo.consent.v1';

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
};

export function initConsent() {
  const box = document.querySelector('[data-consent]');
  if (!box) return;
  const prefs = box.querySelector('[data-consent-prefs]');
  const btn = (a) => box.querySelector(`[data-consent-action="${a}"]`);
  const boxes = { analytics: prefs.querySelector('[name=analytics]'), marketing: prefs.querySelector('[name=marketing]') };

  const publish = (choice) => {
    window.grydeloConsent.value = choice;
    window.dispatchEvent(new CustomEvent('grydelo:consent', { detail: choice }));
  };
  const save = (analytics, marketing) => {
    const choice = { analytics, marketing, at: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch {}
    box.hidden = true;
    publish(choice);
  };
  const customise = (on) => {
    prefs.hidden = !on;
    btn('customise').hidden = on;
    btn('save').hidden = !on;
  };
  const open = () => {
    const c = read();
    boxes.analytics.checked = !!c?.analytics;
    boxes.marketing.checked = !!c?.marketing;
    customise(!!c);
    box.hidden = false;
    box.querySelector('button:not([hidden])')?.focus({ preventScroll: true });
  };

  window.grydeloConsent = { value: read(), open };
  btn('accept').addEventListener('click', () => save(true, true));
  btn('reject').addEventListener('click', () => save(false, false));
  btn('save').addEventListener('click', () => save(boxes.analytics.checked, boxes.marketing.checked));
  btn('customise').addEventListener('click', () => customise(true));
  document.querySelectorAll('[data-consent-open]').forEach((el) => el.addEventListener('click', open));

  const existing = read();
  if (existing) publish(existing);
  else setTimeout(() => { box.hidden = false; }, 900); // let the page settle first
}
