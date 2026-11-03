// Build-time prerender (SSG). Runs after `vite build` (client -> dist) and
// `vite build --ssr` (server entry -> dist-ssr). For every storefront route it
// renders the React tree to HTML and writes dist/<route>/index.html, so the
// first byte the browser gets is a fully painted page instead of an empty
// <div id="root">. The client then hydrates it (src/main.tsx).
//
// Safety: if anything about a route fails, that route is skipped and keeps
// serving the ordinary SPA shell (vercel.json rewrite), i.e. today's behaviour.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dist = path.join(root, 'dist');
const CATALOG_URL = process.env.CATALOG_URL || 'https://gingerbrosshop.com/api/products';

const SITE = 'https://gingerbrosshop.com';
const STATIC_ROUTES = ['/', '/shop', '/story', '/find-us', '/business', '/guide', '/faq', '/shipping', '/returns', '/privacy', '/terms', '/track', '/orders'];
// Never listed in the sitemap.
const PRIVATE_ROUTES = new Set(['/track', '/orders']);

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
  [/^\/product\//, 'ProductDetail'], [/^\/guide/, 'BlogPage'], [/^\/faq/, 'FAQPage'],
  [/^\/shipping/, 'ShippingPage'], [/^\/returns/, 'ReturnsPage'], [/^\/privacy/, 'PrivacyPage'],
  [/^\/terms/, 'TermsPage'], [/^\/business/, 'WholesalePage'], [/^\/track/, 'TrackOrderPage'],
  [/^\/shop/, 'ShopPage'], [/^\/story/, 'StoryPage'], [/^\/find-us/, 'FindUsPage'], [/^\/orders/, 'OrdersPage'],
];

// Preload the above-the-fold image(s) so they download in parallel with the JS.
function resourceHints(route, html, manifest) {
  const tags = [];
  const bare = route.replace(/^\/th(?=\/|$)/, '') || '/';
  const chunk = CHUNK_FOR.find(([re]) => re.test(bare))?.[1];
  const entryKey = chunk && Object.keys(manifest).find((k) => k.endsWith(`/pages/${chunk}.tsx`));
  if (entryKey) {
    // The route chunk plus everything it statically imports (minus what the
    // shell already preloads), so the whole tree downloads in parallel.
    const shell = new Set(Object.values(manifest).filter((m) => m.isEntry).flatMap((m) => [m.file, ...(m.imports ?? []).map((k) => manifest[k].file)]));
    const seen = new Set();
    const walk = (k) => {
      if (seen.has(k)) return;
      seen.add(k);
      (manifest[k].imports ?? []).forEach(walk);
    };
    walk(entryKey);
    for (const k of seen) {
      const file = manifest[k].file;
      if (!shell.has(file)) tags.push(`<link rel="modulepreload" crossorigin href="/${file}">`);
    }
  }
  // The first high-priority <picture>: preload its AVIF set responsively.
  const pic = html.match(/<picture[^>]*>\s*<source type="image\/avif" srcSet="([^"]+)" sizes="([^"]+)"/i);
  if (pic) {
    tags.push(`<link rel="preload" as="image" type="image/avif" imagesrcset="${pic[1]}" imagesizes="${pic[2]}" fetchpriority="high">`);
  } else {
    const img = html.match(/<img\b[^>]*fetchpriority="high"[^>]*>/i)?.[0];
    const src = img?.match(/\ssrc="([^"]+)"/)?.[1];
    if (src) tags.push(`<link rel="preload" as="image" href="${src}" fetchpriority="high">`);
  }
  return tags.join('\n');
}

const escapeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

/**
 * React renders each page's <title>/<meta>/<link> (from react-helmet-async)
 * where the component sits, i.e. inside #root. Crawlers only trust them in
 * <head>, so lift them out. React 19 treats these as hoistable and matches
 * them in <head> on hydration, so moving them is hydration-safe. JSON-LD
 * <script>s are left in place (valid anywhere).
 */
function hoistHead(html) {
  const tags = [];
  const body = html.replace(/<title>[\s\S]*?<\/title>|<meta\b[^>]*\/?>|<link\b[^>]*rel="(?:canonical|alternate)"[^>]*\/?>/gi, (m) => {
    tags.push(m);
    return '';
  });
  return { body, head: tags.join('\n') };
}

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function sitemapXml(entries) {
  const urls = entries.map(({ loc, alternates = [], images = [] }) => [
    '  <url>',
    `    <loc>${xml(loc)}</loc>`,
    ...alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${xml(a.lang)}" href="${xml(a.href)}"/>`),
    ...images.map((img) => `    <image:image><image:loc>${xml(img)}</image:loc></image:image>`),
    '  </url>',
  ].join('\n'));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;
}

async function main() {
  const template = await readFile(path.join(dist, 'index.html'), 'utf8');
  const { render, BLOG_SLUGS, TH_PATHS } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
  // Untouched copy of the SPA shell: served for every route that isn't
  // prerendered (see the rewrite in vercel.json and middleware.ts).
  await writeFile(path.join(dist, 'shell.html'), template);
  const catalog = await fetchCatalog();
  const manifest = JSON.parse(await readFile(path.join(dist, '.vite', 'manifest.json'), 'utf8'));

  const routes = [...STATIC_ROUTES, ...BLOG_SLUGS.map((s) => `/guide/${s}`)];
  if (catalog) routes.push(...catalog.map((p) => `/product/${p.id}`));
  const thRoutes = TH_PATHS.map((p) => (p === '/' ? '/th' : `/th${p}`));
  routes.push(...thRoutes);

  const catalogTag = catalog ? `<script id="__catalog__" type="application/json">${escapeJson(catalog)}</script>` : '';
  let ok = 0;
  for (const route of routes) {
    try {
      const rendered = await render(route, catalog);
      if (!rendered.html || rendered.html.length < 500) throw new Error('empty render');
      const { body: html, head } = hoistHead(rendered.html);
      const lang = route === '/th' || route.startsWith('/th/') ? 'th' : 'en';
      let page = stripShellSeo(template)
        .replace('<html lang="en">', `<html lang="${lang}">`)
        .replace('</head>', `${rendered.head}${head}\n${resourceHints(route, html, manifest)}\n</head>`)
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

  // sitemap.xml: every public route, Thai alternates, product images.
  const genImage = (id) => `${SITE}/images/gen/${id}.jpg`;
  const entries = routes
    .filter((r) => !PRIVATE_ROUTES.has(r) && !r.startsWith('/th'))
    .map((r) => {
      const loc = r === '/' ? SITE : `${SITE}${r}`;
      const th = TH_PATHS.includes(r);
      const alternates = th
        ? [{ lang: 'en', href: loc }, { lang: 'th', href: `${SITE}/th${r === '/' ? '' : r}` }, { lang: 'x-default', href: loc }]
        : [];
      const id = r.match(/^\/product\/(.+)$/)?.[1];
      const product = id && catalog?.find((p) => p.id === id);
      const images = product ? (product.category === 'drinks' ? [genImage(id)] : product.images.slice(0, 1)) : [];
      return { loc, alternates, images };
    });
  for (const r of TH_PATHS) {
    const en = r === '/' ? SITE : `${SITE}${r}`;
    const loc = `${SITE}/th${r === '/' ? '' : r}`;
    entries.push({ loc, alternates: [{ lang: 'en', href: en }, { lang: 'th', href: loc }, { lang: 'x-default', href: en }] });
  }
  await writeFile(path.join(dist, 'sitemap.xml'), sitemapXml(entries));
  console.log(`[prerender] sitemap.xml: ${entries.length} urls`);
}

main().catch((e) => {
  // Never fail the deploy over prerendering: the SPA shell still works.
  console.warn('[prerender] failed, shipping SPA shell only:', e);
});
