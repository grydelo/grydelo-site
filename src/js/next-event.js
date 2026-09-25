// Session bar: live countdown to the next high-impact release from the economic calendar.
import { loadCalendar, countdown, nextHigh } from './calendar-data.js';

export function initNextEvent() {
  const box = document.querySelector('[data-next-event]');
  if (!box || !matchMedia('(min-width: 901px)').matches) return;
  loadCalendar()
    .then(({ events }) => {
      const name = box.querySelector('[data-ne-name]');
      const when = box.querySelector('[data-ne-in]');
      const tick = () => {
        const ev = nextHigh(events);
        box.hidden = !ev;
        if (!ev) return;
        name.textContent = `${ev.ccy} ${ev.title}`;
        when.textContent = `in ${countdown(Date.parse(ev.t) - Date.now())}`;
      };
      tick();
      setInterval(tick, 1000);
    })
    .catch(() => {});
}
