# grydelo-site

Marketing site for Grydelo. Vite + vanilla JS, prerendered to static HTML at build time.

```sh
npm install
npm run dev      # local dev server with reload
npm run build    # outputs dist/
npm run preview  # serve dist/ locally
```

## Where things live

- `src/content.js`: copy and data (nav, footer, services, process, pricing, FAQ, testimonials, form options, asset URLs)
- `src/render.js`: every page (home, contact, blog, articles, calendar, privacy, 404) rendered to static HTML at build time
- `src/layout.js`: shared chrome: session bar, header with theme toggle, footer, cookie banner, contact form
- `src/blog/*.md`: blog articles (frontmatter + markdown), loaded by `src/blog.js`
- `src/posts.json`: portfolio carousels for "The feed" and their row order. Slides live in `public/posts/<slug>/1.webp`..`N.webp` (1080×1350) plus a 640×800 `cover.webp`; clicking a tile opens them in the viewer. Concept work for fictional brokers, so no real client names, handles or logos.
- `src/main.js` + `src/js/`: browser behaviour (theme, consent, session clock, calendar, contact form, motion)
- `src/styles.css`: light theme on `:root`, dark on `[data-theme='dark']`, then components and responsive rules
- `worker/`: the Cloudflare Worker. `/api/contact` emails briefs; `/api/calendar` serves the Forex Factory weekly feed, cached. `npm run dev` runs the same handlers locally (emails are printed, not sent).
- `public/img/`: Grydelo's own imagery

## Contact form email

Workers can only send to a verified Email Routing destination. Briefs go to `CONTACT_INBOX` (the inbox `hello@grydelo.com` forwards to) and are addressed to `hello@grydelo.com`. If hello@'s forwarding changes, update `CONTACT_INBOX` and `allowed_destination_addresses` in `wrangler.jsonc`.

## Blog drafts

```sh
DEEPSEEK_API_KEY=... node scripts/generate-posts.mjs [slug ...]
```

Topics live at the top of the script. New drafts land in `src/blog/`. Review each one before publishing.

## Deploy (Cloudflare Workers, auto on push)

`wrangler.jsonc` deploys the Worker and serves `dist/` as static assets (Worker name `grydelo`, custom domain `grydelo.com`). Manual deploy: `npm run deploy` with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` set. One-time setup in the Cloudflare dashboard:

1. Workers & Pages → Create → Import a repository → pick `grydelo/grydelo-site`.
2. Build command: `npm run build`. Deploy command: `npx wrangler deploy`. Production branch: `main`.
3. Add the custom domain (`grydelo.com`) under the Worker's Settings → Domains & Routes.

After that, every push to `main` deploys to production. Pushes to other branches get preview URLs.

## Before launch

Stand-ins from the design handoff are still in place: some hotlinked imagery (`ASSET_BASE` in `src/content.js`: icons, world map, testimonial portraits), testimonial quotes and names, and pricing figures. The privacy page has not had legal review.
