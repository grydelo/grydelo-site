// All page copy and data lives here. Sections are rendered from it at build time (see render.js).

// Stand-in imagery from the design handoff. Replace with Grydelo-owned assets before launch.
export const ASSET_BASE =
  'https://mamhodabqvalbcvsqqgp.supabase.co/storage/v1/object/public/marketing-assets/design-library/assets/';
const icon = (name) => `${ASSET_BASE}icon/${name}.svg`;

export const EMAIL = 'hello@grydelo.com';

// Shows "03 · 4:5" style badges on gallery tiles.
export const SHOW_BADGES = true;

export const nav = [
  { label: 'Services', href: '/#services' },
  { label: 'Work', href: '/#work' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Calendar', href: '/calendar/' },
  { label: 'Contact', href: '/contact/' },
];

export const footerCols = [
  { title: 'Services', links: [
    { label: 'Instagram', href: '/#services' },
    { label: 'Facebook', href: '/#services' },
    { label: 'Telegram', href: '/#services' },
    { label: 'LinkedIn', href: '/#services' },
    { label: 'X', href: '/#services' },
  ] },
  { title: 'Agency', links: [
    { label: 'Work', href: '/#work' },
    { label: 'Process', href: '/#process' },
    { label: 'About', href: '/#about' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' },
  ] },
  { title: 'Resources', links: [
    { label: 'Blog', href: '/blog/' },
    { label: 'Economic calendar', href: '/calendar/' },
    { label: 'Contact us', href: '/contact/' },
    { label: 'Privacy & cookies', href: '/privacy/' },
  ] },
];

// Contact form options. `plan` values match plans[].subject so pricing buttons can preselect one.
export const formPlans = ['Single plan', 'Full stack plan', 'Multi-market plan', 'Not sure yet'];
export const formChannels = ['Instagram', 'Facebook', 'Telegram', 'LinkedIn', 'X'];

export const heroMeta = [
  { k: 'Platforms', v: 'IG · FB · TG · IN · X' },
  { k: 'Languages', v: 'EN · TH · AR · VI' },
  { k: 'Fluent in', v: 'MT4 · MT5 · cTrader' },
];

// Hero floating post cards (sample carousels from src/posts.json).
export const heroPosts = {
  tall: { src: '/posts/promotion/cover.webp', alt: 'Sample promotion carousel cover: 0 commission on gold', caption: 'Promotion · 1/3', meta: '09:00 LDN' },
  square: { src: '/img/hero-post-square.webp', alt: 'Sample industry news post: central bank week', caption: 'Industry news', meta: 'EN · AR' },
};

export const services = [
  { tk: 'INST', name: 'Instagram accounts', desc: 'Full page management: content, posting, community. Editorial, on brand, on schedule.', fmt: 'Reel · Carousel', icon: icon('chart-growth') },
  { tk: 'FCBK', name: 'Facebook pages', desc: 'Posts, groups and community, run to the same editorial standard.', fmt: 'Reel · Carousel', icon: icon('multi-account-cards') },
  { tk: 'TLGM', name: 'Telegram channels', desc: 'Channel setup, daily market notes and moderation for your funded traders.', fmt: 'Channel · Broadcast', icon: icon('chat-bubble') },
  { tk: 'LNKD', name: 'LinkedIn presence', desc: 'Company page and executive posting for partner, IB and institutional audiences.', fmt: 'Post · Article', icon: icon('document-text') },
  { tk: 'XTWR', name: 'X accounts', desc: 'Market commentary and session recaps, posted in real time where traders already are.', fmt: 'Post · Thread', icon: icon('lightning-deals') },
];

export const steps = [
  { n: '01', when: 'Day 1', t: 'Brief', d: 'Send your entity, markets and platforms. We reply within 24 hours.', icon: icon('mail') },
  { n: '02', when: 'Week 1', t: 'Audit', d: "We review your channels, competitors and the compliance lines you can't cross.", icon: icon('market-analysis') },
  { n: '03', when: 'Week 2', t: 'Build', d: 'Brand system, content pillars and the first month of posts, approved before anything ships.', icon: icon('sliders') },
  { n: '04', when: 'Week 3 →', t: 'Run', d: 'Daily posting, community and reporting. You sign off, we publish.', icon: icon('refresh') },
];

export const specs = [
  { k: 'Location', v: 'Global · Remote' },
  { k: 'Regions', v: 'SEA · MENA · LatAm' },
  { k: 'Languages', v: 'EN · TH · AR · VI' },
  { k: 'Fluent in', v: 'MT4 · MT5 · cTrader' },
  { k: 'Capacity', v: 'Limited · By brief' },
];

// PLACEHOLDER quotes from the design. Replace with real, approved testimonials before launch.
export const quotes = [
  { q: 'They understood our regulator’s wording before we explained it. The first month cleared compliance with no rewrites.', name: 'Mariya K.', role: 'Head of Marketing · Retail broker', img: `${ASSET_BASE}photo/portrait-woman.png` },
  { q: 'Our Thai Instagram finally reads like it was written by traders, not a translator.', name: 'Anan S.', role: 'Growth Lead · APAC broker', img: `${ASSET_BASE}photo/portrait-man-asian.png` },
  { q: 'Fast, precise, and they never miss a session. Our Telegram channel feels alive again.', name: 'Daniel R.', role: 'CMO · Multi-asset broker', img: `${ASSET_BASE}photo/portrait-man-coat.png` },
];

export const plans = [
  {
    label: 'SINGLE', pre: 'From', price: '$1,900', per: ' /mo',
    features: ['One platform', '20 posts a month', 'Community management', 'One language'],
    cta: 'Start with one', subject: 'Single plan',
  },
  {
    label: 'FULL STACK', pre: 'From', price: '$4,500', per: ' /mo', featured: true, tab: 'MOST BROKERS',
    features: ['Instagram, Facebook, Telegram', '60 posts a month, reels included', 'Two languages', 'Compliance-ready copy review', 'Weekly reporting'],
    cta: 'Send a brief →', subject: 'Full stack plan',
  },
  {
    label: 'MULTI-MARKET', pre: 'Scoped', price: 'By brief',
    features: ['Up to five platforms', 'Four or more languages', 'Dedicated account lead', 'Launch and campaign work'],
    cta: 'Talk to us', subject: 'Multi-market plan',
  },
];

export const faqs = [
  { q: 'Do you handle compliance?', a: "We write to your regulator's rules and flag risky wording before you see it. Your compliance team keeps final sign-off on every post." },
  { q: 'Which languages do you cover?', a: 'English, Thai, Arabic and Vietnamese in-house. Other markets through vetted native writers who know trading.' },
  { q: 'Can you work with offshore entities?', a: "Yes. Messaging is tailored per entity and region, and we never point traffic at jurisdictions you're not licensed for." },
  { q: 'How fast can we start?', a: 'Audit within a week of your brief. First posts are usually live about three weeks later.' },
  { q: 'Who owns the content and accounts?', a: 'You do. Source files, templates and account access all stay with you.' },
];

export const briefList = [
  'Broker name + regulatory entity',
  'Target regions and languages',
  "Current channels, and what's not working",
  'Trading platform + product mix',
];
