/**
 * Vercel Edge Middleware — injects route-specific SEO meta into the SPA shell
 * and returns real HTTP 404 status for unknown product / content routes.
 *
 * Runs before Vercel's SPA rewrite, so crawlers receive the correct title,
 * description, Open Graph tags, canonical, and JSON-LD in the initial HTML.
 */

import { BLOG_SEO_META } from './src/lib/blogSeoMeta';
import { SITE_URL, DEFAULT_OG_IMAGE, LOGO_URL } from './src/constants/site';
import { OG_IMAGES } from './src/lib/ogImages';
import { ROUTE_SEO, THAI_PATHS, routeSeo } from './src/seo/routes';
import { siteGraph } from './src/seo/schema';
import { drinkSeo } from './src/lib/seoMeta';

interface RouteMeta {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  jsonLd?: object;
}

const FALLBACK_IMAGE = DEFAULT_OG_IMAGE;
const TH_PATHS = THAI_PATHS;

/**
 * Static-route meta comes from src/seo/routes.ts, the same table the React pages
 * (<SEO route="…">), the sitemap and the audit read, so nothing is repeated here.
 */
function metaFor(path: string, locale: 'en' | 'th'): RouteMeta {
  const m = routeSeo(path, locale)!;
  return {
    title: m.title,
    description: m.description,
    image: m.image,
    type: 'website',
    noindex: !m.indexable,
    ...(path === '/' ? { jsonLd: siteGraph() } : {}),
  };
}

const KNOWN_ROUTES: Record<string, RouteMeta> = Object.fromEntries(Object.keys(ROUTE_SEO).map((p) => [p, metaFor(p, 'en')]));

/** Thai meta for the pages that have a Thai version. */
const TH_KNOWN_ROUTES: Record<string, RouteMeta> = Object.fromEntries(THAI_PATHS.map((p) => [p, metaFor(p, 'th')]));

interface CatalogPrice {
  unitAmount: number | null;
  currency: string;
  recurring: unknown;
}

interface CatalogProduct {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  metadata: Record<string, string>;
  prices: CatalogPrice[];
}

/**
 * Products live only in Stripe (see CLAUDE.md) — there is no static id list to
 * check against. We fetch the same catalog the SPA uses so /product/:id meta
 * (and the 200/404 status) stays correct as products are added or removed in
 * the Stripe dashboard, instead of drifting out of sync like a hardcoded set.
 */
async function fetchCatalogProduct(origin: string, id: string): Promise<CatalogProduct | null> {
  try {
    const res = await fetch(new URL('/api/products', origin));
    if (!res.ok) return null;
    const data = (await res.json()) as { products: CatalogProduct[] };
    return data.products?.find((p) => p.id === id) ?? null;
  } catch {
    return null;
  }
}

function productRouteMeta(product: CatalogProduct, pathname: string): RouteMeta {
  const image = OG_IMAGES.has(product.id) ? `${SITE_URL}/images/og/${product.id}.jpg` : product.images[0] ?? FALLBACK_IMAGE;
  const seo = drinkSeo(product.id, product.name);
  const description =
    seo?.description ?? product.metadata.short_description ?? product.description ?? `${product.name} from GingerBros.`;
  const price = product.prices.find((p) => !p.recurring) ?? product.prices[0];

  return {
    title: `${seo?.title ?? product.name} | GingerBros`,
    description,
    image,
    type: 'product',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description,
      image: [image],
      brand: { '@type': 'Brand', name: 'GingerBros' },
      sku: product.id,
      ...(price?.unitAmount != null
        ? {
            offers: {
              '@type': 'Offer',
              url: `${SITE_URL}${pathname}`,
              priceCurrency: price.currency.toUpperCase(),
              price: String(price.unitAmount),
              availability: product.metadata.stock_status === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
              seller: { '@type': 'Organization', name: 'GingerBros' },
            },
          }
        : {}),
    },
  };
}

const BLOG_POSTS_BY_SLUG = new Map(BLOG_SEO_META.map((post) => [post.slug, post]));

function blogPostMeta(slug: string): RouteMeta | null {
  const post = BLOG_POSTS_BY_SLUG.get(slug);
  if (!post) return null;
  const url = `${SITE_URL}/guide/${slug}`;
  const image = post.image ? `${SITE_URL}${post.image}` : FALLBACK_IMAGE;
  return {
    title: post.title.includes('GingerBros') ? post.title : `${post.title} | GingerBros`,
    description: post.excerpt,
    image,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      image,
      url,
      author: { '@type': 'Organization', name: post.author },
      publisher: {
        '@type': 'Organization',
        name: 'GingerBros',
        logo: {
          '@type': 'ImageObject',
          url: LOGO_URL,
        },
      },
    },
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function injectMeta(html: string, meta: RouteMeta, pathname: string): string {
  const canonical = `${SITE_URL}${pathname}`;
  const image = meta.image ?? FALLBACK_IMAGE;

  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);

  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  );

  const robots = meta.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

  if (/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i.test(html)) {
    html = html.replace(
      /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="robots" content="${robots}" />`
    );
  } else {
    html = html.replace(/<\/head>/i, `<meta name="robots" content="${robots}" />\n</head>`);
  }

  if (/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i.test(html)) {
    html = html.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${canonical}" />`
    );
  } else {
    html = html.replace(/<\/head>/i, `<link rel="canonical" href="${canonical}" />\n</head>`);
  }

  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="${meta.type ?? 'website'}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${canonical}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${image}" />`
  );

  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${image}" />`
  );

  // Remove any existing JSON-LD before injecting fresh markup
  html = html.replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '');
  if (meta.jsonLd) {
    const script = `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`;
    html = html.replace(/<\/head>/i, `${script}\n</head>`);
  }

  return html;
}

export const config = {
  // Skip API routes, the /q/ QR redirects, built assets, and anything that looks
  // like a file (has an extension) — public/ files such as /analytics.js must be
  // served as-is, not replaced with the SPA shell.
  matcher: ['/((?!api/|q/|assets/|images/|.*\\.[a-zA-Z0-9]+$).*)'],
};

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, '') || '/';

  // link.gingerbrosshop.com is the link-in-bio page. Its root serves the SPA
  // (App renders LinkPage for this host); any other path belongs to the shop.
  if (url.hostname.startsWith('link.')) {
    const shopHost = url.hostname.slice('link.'.length);
    if (pathname === '/admin/links') {
      return Response.redirect(`https://${shopHost}/admin/links`, 302);
    }
    if (pathname === '/admin') {
      return Response.redirect(`https://${shopHost}/admin/orders`, 302);
    }
    if (pathname !== '/') {
      return Response.redirect(`https://${shopHost}${url.pathname}${url.search}`, 302);
    }
  }

  // Canonicalise the admin entry point to the orders console.
  if (pathname === '/admin') {
    return Response.redirect(new URL('/admin/orders', request.url).toString(), 302);
  }

  // Pages prerendered at build time (scripts/prerender.mjs) already carry their
  // own head tags and content, so serve them as-is. Anything else (unknown
  // routes, the link-in-bio host) falls through to the SPA shell below.
  // Forward the visitor's cookies so these internal fetches also work on
  // deployments behind Vercel's preview protection.
  const internal = { headers: { cookie: request.headers.get('cookie') ?? '' } };
  if (!url.hostname.startsWith('link.')) {
    const prerendered = await fetch(new URL(pathname === '/' ? '/index.html' : `${pathname}/index.html`, request.url), internal);
    if (prerendered.ok) {
      const body = await prerendered.text();
      if (body.includes('data-prerendered=')) {
        return new Response(body, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate' },
        });
      }
    }
  }

  // /th/* pages without a Thai version (e.g. a product opened from the Thai
  // shop, then refreshed or shared) live at the English URL.
  const thStripped = pathname === '/th' ? '/' : pathname.startsWith('/th/') ? `/${pathname.slice(4).replace(/^[/\\]+/, '')}` : null;
  if (thStripped && !TH_PATHS.includes(thStripped)) {
    // Collapse leading slashes so "/th//evil.com" can't become an off-site redirect.
    const target = new URL(`${thStripped}${url.search}`, request.url);
    return Response.redirect(target.origin === url.origin ? target.toString() : new URL('/', request.url).toString(), 302);
  }

  // Untouched SPA shell (index.html itself is the prerendered homepage).
  const htmlUrl = new URL('/shell.html', request.url);
  const response = await fetch(htmlUrl, internal);
  if (!response.ok) {
    return fetch(request);
  }

  let html = await response.text();

  const productMatch = pathname.match(/^\/product\/([^/]+)\/?$/);
  if (productMatch) {
    const productId = productMatch[1];
    // A handful of flagship products (e.g. ginger-fizz) have hand-tuned copy in
    // KNOWN_ROUTES; everything else in the live Stripe catalog gets meta
    // generated from the catalog itself so new products aren't 404s by default.
    const knownMeta = KNOWN_ROUTES[pathname];
    const catalogProduct = knownMeta ? null : await fetchCatalogProduct(url.origin, productId);
    const meta = knownMeta ?? (catalogProduct ? productRouteMeta(catalogProduct, pathname) : null);

    if (!meta) {
      const notFoundMeta: RouteMeta = {
        title: 'Page Not Found | GingerBros',
        description: 'The page you are looking for could not be found.',
        image: FALLBACK_IMAGE,
        noindex: true,
      };
      html = injectMeta(html, notFoundMeta, pathname);
      return new Response(html, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    html = injectMeta(html, meta, pathname);
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Individual guide articles live at /guide/:slug. Valid slugs return 200 with
  // per-article meta; unknown slugs fall through to the 404 handling below.
  const blogMatch = pathname.match(/^\/guide\/([^/]+)\/?$/);
  if (blogMatch) {
    const articleMeta = blogPostMeta(blogMatch[1]);
    if (articleMeta) {
      html = injectMeta(html, articleMeta, pathname);
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  }

  if (url.hostname.startsWith('link.')) {
    html = injectMeta(html, KNOWN_ROUTES['/links'], '/links');
    html = html.replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="https://${url.hostname}/" />`,
    );
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // A supported Thai page that wasn't prerendered: serve the SPA shell with the
  // page's meta (never redirect it, or a Thai visitor would bounce EN↔TH).
  const isThai = !!thStripped && TH_PATHS.includes(thStripped);
  const metaKey = isThai ? thStripped! : pathname;
  const meta = (isThai ? TH_KNOWN_ROUTES[metaKey] : undefined) ?? KNOWN_ROUTES[metaKey] ?? {
    title: 'Page Not Found | GingerBros',
    description: 'The page you are looking for could not be found.',
    image: FALLBACK_IMAGE,
    noindex: true,
  };
  const status = metaKey in KNOWN_ROUTES ? 200 : 404;

  html = injectMeta(html, meta, pathname);
  if (isThai) {
    html = html
      .replace('<html lang="en">', '<html lang="th">')
      .replace(/<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i, '<meta property="og:locale" content="th_TH" />');
  }

  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
