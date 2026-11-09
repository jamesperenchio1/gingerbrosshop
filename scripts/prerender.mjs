// Build-time prerender (SSG). Runs after `vite build` (client -> dist) and
// `vite build --ssr` (server entry -> dist-ssr). For every storefront route it
// renders the React tree to HTML and writes dist/<route>/index.html, so the
// first byte the browser gets is a fully painted page instead of an empty
// <div id="root">. The client then hydrates it (src/main.tsx).
//
// The route list, Thai pages and sitemap rules come from src/seo/routes.ts via
// the SSR bundle, so adding a page there is the only step.
//
// Failure policy:
//   - Local/preview builds: a route that fails keeps serving the SPA shell.
//   - Strict builds (Vercel production, or SEO_STRICT=1): any failed route or a
//     missing catalog fails the build, so SEO can never regress silently.
//   - Catalog: live API first, then scripts/catalog.snapshot.json (refresh with
//     `node scripts/snapshot-catalog.mjs`), so a transient API blip does not
//     drop product pages.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dist = path.join(root, 'dist');
const CATALOG_URL = process.env.CATALOG_URL || 'https://gingerbrosshop.com/api/products';
const STRICT = process.env.VERCEL_ENV === 'production' || process.env.SEO_STRICT === '1';

const SITE = 'https://gingerbrosshop.com';

async function loadCatalog() {
  try {
    // Unique query string bypasses the edge cache so a rebuild sees fresh data.
    const res = await fetch(`${CATALOG_URL}?build=${Date.now()}`, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.products) || data.products.length === 0) throw new Error('empty catalog');
    return { products: data.products, source: 'live' };
  } catch (e) {
    console.warn(`[prerender] live catalog unavailable (${e.message}); trying scripts/catalog.snapshot.json`);
  }
  try {
    const data = JSON.parse(await readFile(path.join(root, 'scripts', 'catalog.snapshot.json'), 'utf8'));
    if (Array.isArray(data.products) && data.products.length > 0) {
      console.warn('[prerender] WARNING: using the committed catalog snapshot; prices in prerendered HTML may be stale');
      return { products: data.products, source: 'snapshot' };
    }
  } catch (e) {
    console.warn(`[prerender] snapshot unavailable (${e.message})`);
  }
  return null;
}

// Tags Helmet re-emits per page; drop the shell's generic copies first so the
// rendered page doesn't carry duplicates.
function stripShellSeo(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+name="keywords"[^>]*>/gi, '')
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
  const urls = entries.map(({ loc, lastmod, alternates = [], images = [] }) => [
    '  <url>',
    `    <loc>${xml(loc)}</loc>`,
    ...(lastmod ? [`    <lastmod>${xml(lastmod)}</lastmod>`] : []),
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

const baht = (n) => `฿${n}`;
const oneTimePrice = (p) => p?.prices?.find((x) => !x.recurring && x.unitAmount != null)?.unitAmount;

/** llms.txt, generated from the catalog and the guide metadata so it cannot drift. */
function llmsTxt(catalog, posts) {
  const drinks = (catalog ?? []).filter((p) => p.category === 'drinks');
  const byId = Object.fromEntries(drinks.map((p) => [p.id, p]));
  const fizz = oneTimePrice(byId['ginger-fizz']);
  const tea = oneTimePrice(byId['ginger-tea']);
  const lines = [
    '# GingerBros',
    '',
    `> GingerBros makes modern ginger drinks in Thailand. Tagline: "Think Ginger. Drink Different." Two drinks: Ginger Fizz (sparkling, fresh Thai ginger and real lime, low sugar${fizz ? `, ${baht(fizz)} per 330ml bottle` : ''}) and Ginger Tea · Thai Spice (still, real ginger slowly simmered with lemongrass, lime and spices, no artificial colours or flavours${tea ? `, ${baht(tea)} per 330ml bottle` : ''}). The drinks are not fermented. Sold online at gingerbrosshop.com with delivery across Thailand, plus LINE and Shopee.`,
    '',
    '## Shop',
    `- [Shop all drinks](${SITE}/shop): singles, 2/3/6-packs, Fizz & Tea mixed bundles, subscriptions. Multi-buy deals apply automatically in the cart.`,
    ...drinks.map((p) => {
      const price = oneTimePrice(p);
      return `- [${p.name}](${SITE}/product/${p.id})${price ? `: ${baht(price)}` : ''}${p.description ? `. ${p.description.replace(/\s+/g, ' ').trim()}` : ''}`;
    }),
    '',
    '## Learn',
    ...posts.map((post) => `- [${post.title}](${SITE}/guide/${post.slug}): ${post.excerpt}`),
    `- [The Ginger Guide](${SITE}/guide) · [Our Story](${SITE}/story)`,
    `- [FAQ](${SITE}/faq) · [Shipping](${SITE}/shipping) · [Returns](${SITE}/returns)`,
    '',
    '## Business',
    `- [For cafés, bars & restaurants](${SITE}/business): wholesale pricing and the Signature Serve programme.`,
    '- Contact: gingerbros.brew@gmail.com',
    '',
  ];
  return lines.join('\n');
}

async function main() {
  const template = await readFile(path.join(dist, 'index.html'), 'utf8');
  const ssr = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
  const { render, BLOG_SLUGS, BLOG_SEO_META, TH_PATHS, PRERENDER_PATHS, SITEMAP_PATHS, getProductContent } = ssr;
  // Untouched copy of the SPA shell: served for every route that isn't
  // prerendered (see the rewrite in vercel.json and middleware.ts).
  await writeFile(path.join(dist, 'shell.html'), template);
  const loaded = await loadCatalog();
  if (!loaded && STRICT) throw new Error('no catalog (live or snapshot) in a strict build');
  const catalog = loaded?.products ?? null;
  const manifest = JSON.parse(await readFile(path.join(dist, '.vite', 'manifest.json'), 'utf8'));

  const routes = [...PRERENDER_PATHS, ...BLOG_SLUGS.map((s) => `/guide/${s}`)];
  if (catalog) routes.push(...catalog.map((p) => `/product/${p.id}`));
  const thRoutes = TH_PATHS.map((p) => (p === '/' ? '/th' : `/th${p}`));
  routes.push(...thRoutes);

  const catalogTag = catalog ? `<script id="__catalog__" type="application/json">${escapeJson(catalog)}</script>` : '';
  const failures = [];
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
      failures.push(route);
      console.warn(`[prerender] skipped ${route}: ${e.message}`);
    }
  }
  console.log(`[prerender] wrote ${ok}/${routes.length} routes (catalog: ${loaded?.source ?? 'none'})`);
  if (STRICT && failures.length) throw new Error(`strict build: ${failures.length} route(s) failed to prerender: ${failures.join(', ')}`);

  // sitemap.xml: every indexable route, Thai alternates, product images.
  const genImage = (id) => `${SITE}/images/gen/${id}.jpg`;
  const indexable = new Set(SITEMAP_PATHS);
  const entries = routes
    .filter((r) => !r.startsWith('/th') && (indexable.has(r) || r.startsWith('/guide/') || r.startsWith('/product/')))
    .map((r) => {
      const loc = r === '/' ? SITE : `${SITE}${r}`;
      const th = TH_PATHS.includes(r);
      const alternates = th
        ? [{ lang: 'en', href: loc }, { lang: 'th', href: `${SITE}/th${r === '/' ? '' : r}` }, { lang: 'x-default', href: loc }]
        : [];
      const slug = r.match(/^\/guide\/(.+)$/)?.[1];
      const lastmod = slug ? BLOG_SEO_META.find((p) => p.slug === slug)?.date : undefined;
      const id = r.match(/^\/product\/(.+)$/)?.[1];
      const product = id && catalog?.find((p) => p.id === id);
      const gallery = product?.category === 'drinks' ? (getProductContent(id).gallery ?? []) : [];
      const images = product ? (product.category === 'drinks' ? [genImage(id), ...gallery.map(genImage)] : product.images.slice(0, 1)) : [];
      const pageImages = r === '/story' ? ['life-stoop', 'life-ice-stool'].map(genImage) : r === '/' ? ['life-booth-park-silom', 'life-hand-fizz'].map(genImage) : [];
      return { loc, lastmod, alternates, images: [...new Set([...images, ...pageImages])] };
    });
  for (const r of TH_PATHS) {
    const en = r === '/' ? SITE : `${SITE}${r}`;
    const loc = `${SITE}/th${r === '/' ? '' : r}`;
    entries.push({ loc, alternates: [{ lang: 'en', href: en }, { lang: 'th', href: loc }, { lang: 'x-default', href: en }] });
  }
  await writeFile(path.join(dist, 'sitemap.xml'), sitemapXml(entries));
  console.log(`[prerender] sitemap.xml: ${entries.length} urls`);

  await writeFile(path.join(dist, 'llms.txt'), llmsTxt(catalog, BLOG_SEO_META));
  console.log('[prerender] llms.txt generated from the catalog');
}

main().catch((e) => {
  if (STRICT) {
    console.error('[prerender] FAILED (strict build):', e);
    process.exit(1);
  }
  // Local/preview builds never fail over prerendering: the SPA shell still works.
  console.warn('[prerender] failed, shipping SPA shell only:', e);
});
