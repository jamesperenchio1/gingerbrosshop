// SEO audit gate. Runs after the prerender (see `npm run build`) and exits 1 on
// any error, so an SEO regression can never ship silently.
//   node scripts/seo-audit.mjs [distDir]
//
// Checks every prerendered page and the sitemap:
//   sitemap URLs exist in dist · one <title> and description of sane length ·
//   unique titles/descriptions · self-canonical · noindex pages stay out of the
//   sitemap and are not blocked in robots.txt · exactly one <h1> · valid JSON-LD
//   · reciprocal hreflang · robots.txt names the sitemap.
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');
const SITE = 'https://gingerbrosshop.com';
const errors = [];
const warnings = [];
const err = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'");
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'assets' || e.name === 'images' || e.name === '.vite') continue;
      yield* walk(p);
    } else if (e.name === 'index.html') yield p;
  }
}

const routeOf = (file) => {
  const rel = path.relative(dist, path.dirname(file)).split(path.sep).join('/');
  return rel ? `/${rel}` : '/';
};
const urlOf = (route) => (route === '/' ? SITE : `${SITE}${route}`);

function parsePage(html) {
  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1]));
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const descriptions = metas.filter((t) => attr(t, 'name') === 'description').map((t) => decode(attr(t, 'content') ?? ''));
  const robots = metas.filter((t) => attr(t, 'name') === 'robots').map((t) => attr(t, 'content') ?? '');
  const canonicals = links.filter((t) => attr(t, 'rel') === 'canonical').map((t) => attr(t, 'href'));
  const alternates = links.filter((t) => attr(t, 'rel') === 'alternate' && attr(t, 'hreflang')).map((t) => ({ lang: attr(t, 'hreflang'), href: attr(t, 'href') }));
  const h1s = (html.match(/<h1[\s>]/gi) ?? []).length;
  const jsonld = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  return { titles, descriptions, robots, canonicals, alternates, h1s, jsonld };
}

async function main() {
  // sitemap
  let sitemap;
  try {
    sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
  } catch {
    err('sitemap.xml', 'missing from dist');
    return;
  }
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
  if (new Set(sitemapUrls).size !== sitemapUrls.length) err('sitemap.xml', 'contains duplicate URLs');
  const sitemapSet = new Set(sitemapUrls);

  // robots.txt
  let robots = '';
  try {
    robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
  } catch {
    err('robots.txt', 'missing from dist');
  }
  if (robots && !/^Sitemap:\s*https:\/\/gingerbrosshop\.com\/sitemap\.xml/im.test(robots)) err('robots.txt', 'does not reference the sitemap');
  const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)/gim)].map((m) => m[1]);

  // pages
  const pages = new Map();
  for await (const file of walk(dist)) {
    const html = await readFile(file, 'utf8');
    if (!html.includes('data-prerendered=')) continue; // shell / non-prerendered
    pages.set(routeOf(file), parsePage(html));
  }
  if (pages.size === 0) err('dist', 'no prerendered pages found');

  const seenTitles = new Map();
  const seenDescriptions = new Map();
  for (const [route, p] of pages) {
    const noindex = p.robots.some((r) => /noindex/i.test(r));
    const inSitemap = sitemapSet.has(urlOf(route));

    if (p.titles.length !== 1) err(route, `expected exactly one <title>, found ${p.titles.length}`);
    else {
      const t = p.titles[0];
      if (t.length < 10 || t.length > 80) err(route, `title length ${t.length} outside 10-80: "${t}"`);
      else if (t.length > 65) warn(route, `title is ${t.length} chars, may truncate in results`);
    }
    if (p.descriptions.length !== 1) err(route, `expected exactly one meta description, found ${p.descriptions.length}`);
    else {
      const d = p.descriptions[0];
      if (d.length < 40 || d.length > 220) err(route, `description length ${d.length} outside 40-220`);
      else if (d.length > 170) warn(route, `description is ${d.length} chars, may truncate in results`);
    }
    if (p.robots.length !== 1) err(route, `expected exactly one robots meta, found ${p.robots.length}`);
    if (p.h1s !== 1) err(route, `expected exactly one <h1>, found ${p.h1s}`);

    for (const raw of p.jsonld) {
      try {
        JSON.parse(raw);
      } catch (e) {
        err(route, `invalid JSON-LD: ${e.message}`);
      }
    }

    if (noindex) {
      if (inSitemap) err(route, 'is noindex but listed in the sitemap');
      if (disallowed.some((d) => route === d.replace(/\/$/, '') || route.startsWith(d))) err(route, 'is noindex but blocked in robots.txt, so crawlers never see the noindex');
      continue;
    }

    if (!inSitemap) err(route, 'is indexable but missing from the sitemap');
    if (p.canonicals.length !== 1) err(route, `expected exactly one canonical, found ${p.canonicals.length}`);
    else if (p.canonicals[0] !== urlOf(route)) {
      // Thai-browsed pages without a Thai version canonicalise to English; those are not prerendered under /th.
      err(route, `canonical ${p.canonicals[0]} is not self-referential (${urlOf(route)})`);
    }

    if (p.titles[0]) {
      const prev = seenTitles.get(p.titles[0]);
      if (prev) err(route, `duplicate title also used by ${prev}`);
      else seenTitles.set(p.titles[0], route);
    }
    if (p.descriptions[0]) {
      const prev = seenDescriptions.get(p.descriptions[0]);
      if (prev) err(route, `duplicate meta description also used by ${prev}`);
      else seenDescriptions.set(p.descriptions[0], route);
    }

    // hreflang: every alternate must exist, include itself and link back
    if (p.alternates.length) {
      const langs = p.alternates.map((a) => a.lang);
      if (!langs.includes('x-default')) err(route, 'hreflang set has no x-default');
      for (const a of p.alternates) {
        if (!sitemapSet.has(a.href)) err(route, `hreflang ${a.lang} target ${a.href} is not in the sitemap`);
        const targetRoute = a.href === SITE ? '/' : a.href.replace(SITE, '');
        const target = pages.get(targetRoute);
        if (!target) err(route, `hreflang ${a.lang} target ${a.href} was not prerendered`);
        else if (!target.alternates.some((b) => b.href === urlOf(route))) err(route, `hreflang is not reciprocal: ${a.href} does not link back`);
      }
    }
  }

  // every sitemap URL must exist as a prerendered page
  for (const url of sitemapUrls) {
    const route = url === SITE ? '/' : url.replace(SITE, '');
    if (!pages.has(route)) err('sitemap.xml', `${url} has no prerendered page in dist`);
    try {
      await stat(path.join(dist, route === '/' ? 'index.html' : path.join(route, 'index.html')));
    } catch {
      err('sitemap.xml', `${url} has no file in dist`);
    }
  }

  console.log(`[seo-audit] ${pages.size} pages, ${sitemapUrls.length} sitemap URLs`);
}

await main();
for (const w of warnings) console.warn(`[seo-audit] warn  ${w}`);
for (const e of errors) console.error(`[seo-audit] ERROR ${e}`);
if (errors.length) {
  console.error(`[seo-audit] FAILED with ${errors.length} error(s)`);
  process.exit(1);
}
console.log(`[seo-audit] passed (${warnings.length} warning(s))`);
