import { defineConfig } from 'vite';
import { fileURLToPath, pathToFileURL } from 'node:url';

const renderEntry = fileURLToPath(new URL('./src/render.js', import.meta.url));

const fill = (html, page) => html.replace('<!--head-->', page.head).replace('<!--app-->', page.body);

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

// Prerenders every route in src/render.js into its own static HTML file, using index.html as the shell.
const pages = () => ({
  name: 'grydelo-pages',
  enforce: 'post',

  // Dev: render whichever route the browser asked for (Vite serves index.html for every page URL).
  async transformIndexHtml(html, ctx) {
    if (!ctx.server) return html;
    const { renderRoute } = await ctx.server.ssrLoadModule('/src/render.js');
    return fill(html, renderRoute(ctx.originalUrl || '/'));
  },

  handleHotUpdate({ file, server }) {
    if (/src[\\/](render|content|layout|blog)\.js$|posts\.json$|src[\\/]blog[\\/].+\.md$/.test(file)) {
      server.moduleGraph.invalidateAll();
      server.ws.send({ type: 'full-reload' });
    }
  },

  // Dev: /api/* runs the same handlers as the Worker, with local stand-ins for the Cloudflare bindings.
  configureServer(server) {
    const mem = new Map();
    server.middlewares.use(async (req, res, next) => {
      if (!req.url.startsWith('/api/')) return next();
      try {
        const { handleApi } = await server.ssrLoadModule('/worker/api.js');
        const hasBody = !['GET', 'HEAD'].includes(req.method);
        const request = new Request(`http://localhost${req.url}`, {
          method: req.method,
          headers: { 'Content-Type': req.headers['content-type'] || '', Accept: req.headers.accept || '' },
          body: hasBody ? await readBody(req) : undefined,
        });
        const response = await handleApi(request, {
          from: 'forms@grydelo.com',
          to: 'hello@grydelo.com',
          sendMail: async ({ raw }) => {
            const [headers, body] = raw.split('\r\n\r\n');
            console.log(`\n[dev] contact email (not sent)\n${headers}\n\n${Buffer.from(body.replace(/\r\n/g, ''), 'base64')}\n`);
          },
          fetchFeed: (u) => fetch(u),
          cacheGet: async (k) => {
            const hit = mem.get(k);
            return hit && hit.exp > Date.now() ? hit.value : null;
          },
          cachePut: async (k, value, ttl) => mem.set(k, { value, exp: Date.now() + ttl * 1000 }),
          meta: () => ({ country: 'DEV' }),
        });
        res.statusCode = response.status;
        response.headers.forEach((v, k) => res.setHeader(k, v));
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch (err) {
        next(err);
      }
    });
  },

  // Build: the processed index.html (with hashed asset links) becomes the shell for every page.
  async generateBundle(_, bundle) {
    const index = bundle['index.html'];
    const shell = String(index.source);
    const { renderRoute, routePaths, sitemap, SITE } = await import(pathToFileURL(renderEntry).href);
    for (const path of routePaths()) {
      const html = fill(shell, renderRoute(path));
      if (path === '/') index.source = html;
      else this.emitFile({ type: 'asset', fileName: `${path.slice(1)}index.html`, source: html });
    }
    this.emitFile({ type: 'asset', fileName: '404.html', source: fill(shell, renderRoute('/__not-found__/')) });
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap() });
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n` });
  },
});

export default defineConfig({
  plugins: [pages()],
});
