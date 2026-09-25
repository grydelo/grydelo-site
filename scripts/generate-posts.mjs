// Drafts blog articles with DeepSeek and writes them to src/blog/<slug>.md.
// Usage: DEEPSEEK_API_KEY=... node scripts/generate-posts.mjs [slug ...]
// Existing files are skipped unless their slug is passed explicitly. Review every draft before publishing.
import { writeFile, mkdir, access } from 'node:fs/promises';

const KEY = process.env.DEEPSEEK_API_KEY;
if (!KEY) throw new Error('Set DEEPSEEK_API_KEY');
const OUT = new URL('../src/blog/', import.meta.url);

const TOPICS = [
  {
    slug: 'instagram-compliance-for-forex-brokers', date: '2026-09-22', category: 'Compliance',
    brief: 'How forex and CFD brokers can run an engaging Instagram account without tripping compliance: risk warnings, performance claims, testimonials, bonuses, jurisdiction targeting, and a pre-publish review workflow between the agency and the broker compliance team.',
  },
  {
    slug: 'plan-a-week-of-content-around-the-economic-calendar', date: '2026-09-15', category: 'Content strategy',
    brief: 'Using the economic calendar (CPI, NFP, central bank decisions, PMIs) to plan a week of broker social content: pre-event explainers, live session posts, post-event recaps, and what never to post (predictions, signals). Mention readers can follow the week on our economic calendar page at /calendar/ (use a markdown link).',
  },
  {
    slug: 'telegram-channels-traders-actually-read', date: '2026-09-08', category: 'Telegram',
    brief: 'Building a broker Telegram channel that traders actually read: channel vs group, posting cadence by trading session, formats (morning notes, session open posts, education series), moderation, scam impersonators, and measuring retention instead of subscriber counts.',
  },
  {
    slug: 'localising-broker-content-for-sea-and-mena', date: '2026-08-31', category: 'Localisation',
    brief: 'Localising broker social content for Southeast Asia (Thailand, Vietnam, Indonesia, Malaysia) and MENA: why translation is not enough, trading slang, right-to-left design for Arabic, local platforms and posting times, cultural and religious considerations such as swap-free accounts, and working with native writers who trade.',
  },
  {
    slug: 'reels-for-regulated-brokers', date: '2026-08-24', category: 'Video',
    brief: 'Short-form video (Reels, Shorts) for regulated brokers: formats that work (platform walkthroughs, market-term explainers, behind-the-desk, event recaps), hooks in the first two seconds, on-screen risk warnings, captions for sound-off viewing, and a lean production pipeline that still passes compliance review.',
  },
  {
    slug: 'social-media-kpis-for-forex-brokers', date: '2026-08-17', category: 'Analytics',
    brief: 'Which social media KPIs matter for forex brokers: moving past vanity metrics to reach in licensed regions, saves and shares, profile-to-site clicks, lead quality, demo-to-live signals, community health, and building a monthly report a head of marketing can take to the board. Keep attribution caveats honest.',
  },
];

const SYSTEM = `You write articles for the blog of Grydelo, a boutique social media agency that runs Instagram, Facebook, Telegram, LinkedIn and X for forex and CFD brokers.
Voice: precise, calm, practitioner. Short sentences. Concrete examples. British English spelling.
Hard rules:
- No invented statistics, percentages, studies or quotes. No named brokers, clients or people.
- Do not cite specific rule numbers. Refer to regulators (FCA, CySEC, ASIC and similar) only in general terms and tell readers to confirm specifics with their compliance team.
- Never give trading or investment advice, predictions or signals.
- Avoid clichés: "in today's fast-paced world", "game-changer", "delve", "landscape", "unlock", "elevate", "navigate", "leverage" (as a verb), "robust", "seamless".
- No H1. Use "##" H2 sections (4 to 6), with an occasional "###", short paragraphs, and bullet lists where they help. Bold sparingly.
- End with a "## Checklist" section of 5 to 7 bullets.
- 900 to 1200 words.
Return JSON only: {"title": string (max 70 chars, sentence case), "excerpt": string (one sentence, max 170 chars), "body": string (markdown)}.`;

async function draft(topic) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `Write the article. Category: ${topic.category}. Brief: ${topic.brief}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`${topic.slug}: ${res.status} ${await res.text()}`);
  const { choices } = await res.json();
  const post = JSON.parse(choices[0].message.content);
  const words = post.body.split(/\s+/).length;
  const fm = [
    '---',
    `title: ${JSON.stringify(post.title)}`,
    `excerpt: ${JSON.stringify(post.excerpt)}`,
    `category: ${JSON.stringify(topic.category)}`,
    `date: ${topic.date}`,
    `minutes: ${Math.max(3, Math.round(words / 220))}`,
    '---',
    '',
  ].join('\n');
  await writeFile(new URL(`${topic.slug}.md`, OUT), fm + post.body.trim() + '\n');
  return `${topic.slug} (${words} words)`;
}

const only = process.argv.slice(2);
await mkdir(OUT, { recursive: true });
const todo = [];
for (const t of TOPICS) {
  if (only.length && !only.includes(t.slug)) continue;
  const exists = await access(new URL(`${t.slug}.md`, OUT)).then(() => true, () => false);
  if (exists && !only.length) continue;
  todo.push(t);
}
const results = await Promise.allSettled(todo.map(draft));
for (const r of results) console.log(r.status === 'fulfilled' ? `ok   ${r.value}` : `FAIL ${r.reason.message}`);
