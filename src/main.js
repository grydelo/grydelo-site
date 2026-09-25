import './styles.css';
import { initTheme } from './js/theme.js';
import { initSession } from './js/session.js';
import { initMenu } from './js/menu.js';
import { initConsent } from './js/consent.js';
import { initFeed } from './js/feed.js';
import { initFaq } from './js/faq.js';
import { initMotion } from './js/motion.js';
import { initBlogFilters } from './js/filters.js';
import { initContactForms } from './js/contact-form.js';
import { initNextEvent } from './js/next-event.js';

initTheme();
initSession();
initMenu();
initConsent();
initFeed();
initFaq();
initMotion();
initBlogFilters();
initContactForms();
initNextEvent();

// The calendar page loads its renderer on demand.
const calendar = document.querySelector('[data-calendar]');
if (calendar) import('./js/calendar.js').then((m) => m.initCalendar(calendar));
