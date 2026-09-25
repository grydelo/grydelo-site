// Loads blog articles from src/blog/*.md (simple "key: value" frontmatter + markdown body). Build time only.
import { readdirSync, readFileSync } from 'node:fs';
import { marked } from 'marked';

const DIR = new URL('./blog/', import.meta.url);

function parse(file) {
  const src = readFileSync(new URL(file, DIR), 'utf8').replace(/\r\n/g, '\n');
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing frontmatter`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const v = line.slice(i + 1).trim();
    meta[line.slice(0, i).trim()] = v.startsWith('"') ? JSON.parse(v) : v;
  }
  const html = marked.parse(m[2]);
  // "## Heading" sections become the article's table of contents.
  const toc = [];
  const body = html.replace(/<h2>(.*?)<\/h2>/g, (_, text) => {
    const id = text.replace(/<[^>]+>/g, '').toLowerCase().replace(/&[a-z0-9#]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    toc.push({ id, text });
    return `<h2 id="${id}">${text}</h2>`;
  });
  return { slug: file.replace(/\.md$/, ''), ...meta, minutes: Number(meta.minutes) || 4, body, toc };
}

export const articles = readdirSync(DIR)
  .filter((f) => f.endsWith('.md'))
  .map(parse)
  .sort((a, b) => b.date.localeCompare(a.date));
