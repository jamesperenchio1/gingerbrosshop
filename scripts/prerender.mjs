// Build-time prerender (SSG). Runs after `vite build` (client -> dist) and
// `vite build --ssr` (server entry -> dist-ssr). For every storefront route it
// renders the React tree to HTML and writes dist/<route>/index.html, so the
// first byte the browser gets is a fully painted page instead of an empty
// <div id="root">. The client then hydrates it (src/main.tsx).
//
// Safety: if anything about a route fails, that route is skipped and keeps
// serving the ordinary SPA shell (vercel.json rewrite), i.e. today's behaviour.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dist = path.join(root, 'dist');
const CATALOG_URL = process.env.CATALOG_URL || 'https://gingerbrosshop.com/api/products';

const STATIC_ROUTES = ['/', '/faq', '/shipping', '/returns', '/privacy', '/terms', '/wholesale', '/track', '/blog'];

async function fetchCatalog() {
  try {
    // Unique query string bypasses the edge cache so a rebuild sees fresh data.
    const res = await fetch(`${CATALOG_URL}?build=${Date.now()}`, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.products) ? data.products : null;
  } catch (e) {
    console.warn(`[prerender] catalog unavailable (${e.message}); product data will load client-side`);
    return null;
  }
}

// Tags Helmet re-emits per page; drop the shell's generic copies first so the
// rendered page doesn't carry duplicates.
function stripShellSeo(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '');
}

// Route -> lazy page chunk, so the browser fetches it alongside the entry
// bundle instead of discovering it only after the entry has run.
const CHUNK_FOR = [
  [/^\/product\//, 'ProductDetail'], [/^\/blog/, 'BlogPage'], [/^\/faq/, 'FAQPage'],
  [/^\/shipping/, 'ShippingPage'], [/^\/returns/, 'ReturnsPage'], [/^\/privacy/, 'PrivacyPage'],
  [/^\/terms/, 'TermsPage'], [/^\/wholesale/, 'WholesalePage'], [/^\/track/, 'TrackOrderPage'],
];

// Preload the above-the-fold image(s) so they download in parallel with the JS.
function resourceHints(route, html, assets) {
  const tags = [];
  const chunk = CHUNK_FOR.find(([re]) => re.test(route))?.[1];
  const file = chunk && assets.find((f) => f.startsWith(`${chunk}-`) && f.endsWith('.js'));
  if (file) tags.push(`<link rel="modulepreload" crossorigin href="/assets/${file}">`);
  if (route === '/') {
    for (const src of ['/images/hero-mug.webp', '/images/bottle-hero-transparent.webp']) {
      tags.push(`<link rel="preload" as="image" type="image/webp" href="${src}" fetchpriority="high">`);
    }
  } else {
    const img = html.match(/<img\b[^>]*fetchpriority="high"[^>]*>/i)?.[0];
    const src = img?.match(/\ssrc="([^"]+)"/)?.[1];
    if (src) tags.push(`<link rel="preload" as="image" href="${src}" fetchpriority="high">`);
  }
  return tags.join('\n');
}

const escapeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

async function main() {
  const template = await readFile(path.join(dist, 'index.html'), 'utf8');
  const { render, BLOG_SLUGS } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
  // Untouched copy of the SPA shell: served for every route that isn't
  // prerendered (see the rewrite in vercel.json and middleware.ts).
  await writeFile(path.join(dist, 'shell.html'), template);
  const catalog = await fetchCatalog();
  const assets = await readdir(path.join(dist, 'assets'));

  const routes = [...STATIC_ROUTES, ...BLOG_SLUGS.map((s) => `/blog/${s}`)];
  if (catalog) routes.push(...catalog.map((p) => `/product/${p.id}`));

  const catalogTag = catalog ? `<script id="__catalog__" type="application/json">${escapeJson(catalog)}</script>` : '';
  let ok = 0;
  for (const route of routes) {
    try {
      const { html, head } = await render(route, catalog);
      if (!html || html.length < 500) throw new Error('empty render');
      let page = stripShellSeo(template)
        .replace('</head>', `${head}\n${resourceHints(route, html, assets)}\n</head>`)
        .replace('<div id="root"></div>', `${catalogTag}<div id="root" data-prerendered="${route}">${html}</div>`);
      const out = route === '/' ? path.join(dist, 'index.html') : path.join(dist, route, 'index.html');
      await mkdir(path.dirname(out), { recursive: true });
      await writeFile(out, page);
      ok++;
    } catch (e) {
      console.warn(`[prerender] skipped ${route}: ${e.message}`);
    }
  }
  console.log(`[prerender] wrote ${ok}/${routes.length} routes`);
}

main().catch((e) => {
  // Never fail the deploy over prerendering: the SPA shell still works.
  console.warn('[prerender] failed, shipping SPA shell only:', e);
});
