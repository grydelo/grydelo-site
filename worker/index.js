// Cloudflare Worker: /api/* goes through handleApi, everything else is served from the static build (dist/).
import { EmailMessage } from 'cloudflare:email';
import { handleApi } from './api.js';

// Cache API keys live under our own hostname; nothing is ever served from these URLs.
const cacheKey = (k) => new Request(`https://grydelo.com/__cache/${k}`);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    const cache = caches.default;
    return handleApi(request, {
      from: env.CONTACT_FROM,
      to: env.CONTACT_TO,
      inbox: env.CONTACT_INBOX,
      sendMail: ({ from, to, raw }) => env.SEND_EMAIL.send(new EmailMessage(from, to, raw)),
      fetchFeed: (u) =>
        fetch(u, { headers: { 'User-Agent': 'grydelo.com economic calendar' }, cf: { cacheTtl: 900, cacheEverything: true } }),
      cacheGet: async (k) => {
        const hit = await cache.match(cacheKey(k));
        return hit ? hit.json() : null;
      },
      cachePut: (k, value, ttl) =>
        cache.put(cacheKey(k), new Response(JSON.stringify(value), { headers: { 'Cache-Control': `public, max-age=${ttl}` } })),
      limit: async (req) =>
        !env.CONTACT_LIMIT || (await env.CONTACT_LIMIT.limit({ key: req.headers.get('CF-Connecting-IP') || 'unknown' })).success,
      meta: (req) => ({ country: req.cf?.country }),
    });
  },
};
