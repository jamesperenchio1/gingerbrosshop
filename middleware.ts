/**
 * Vercel Edge Middleware — injects route-specific SEO meta into the SPA shell
 * and returns real HTTP 404 status for unknown product / content routes.
 *
 * Runs before Vercel's SPA rewrite, so crawlers receive the correct title,
 * description, Open Graph tags, canonical, and JSON-LD in the initial HTML.
 */

const SITE_URL = 'https://gingerbrosshop.com';

interface RouteMeta {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  jsonLd?: object;
}

const FALLBACK_IMAGE = `${SITE_URL}/images/product-unpasteurized-2.jpg`;

const KNOWN_ROUTES: Record<string, RouteMeta> = {
  '/': {
    title: 'GingerBros — Naturally Brewed Craft Ginger Fizz from Thailand',
    description:
      '7-day naturally fermented craft ginger fizz brewed in Thailand. Raw, unpasteurized, and delivered chilled to your door nationwide.',
    image: FALLBACK_IMAGE,
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: 'GingerBros',
          url: SITE_URL,
          logo: `${SITE_URL}/images/product-unpasteurized-2.jpg`,
          sameAs: [
            'https://www.instagram.com/drinkgingerbros',
            'https://www.tiktok.com/@gingerbrosbrew',
          ],
        },
        {
          '@type': 'WebSite',
          name: 'GingerBros',
          url: SITE_URL,
        },
        {
          '@type': 'ItemList',
          name: 'GingerBros Craft Ginger Fizz Products',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              url: `${SITE_URL}/product/unpasteurized`,
              name: 'Unpasteurized Ginger Fizz',
            },
          ],
        },
      ],
    },
  },
  '/product/unpasteurized': {
    title: 'Unpasteurized Ginger Fizz — GingerBros',
    description:
      'Raw, living ginger fizz with active probiotic cultures. 7-day naturally fermented, refrigerated delivery across Thailand.',
    image: `${SITE_URL}/images/product-unpasteurized-2.jpg`,
    type: 'product',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Unpasteurized Ginger Fizz',
      description:
        'Raw, living ginger fizz with active probiotic cultures. 7-day naturally fermented, refrigerated delivery across Thailand.',
      image: [
        `${SITE_URL}/images/product-unpasteurized-2.jpg`,
        `${SITE_URL}/images/product-unpasteurized.jpg`,
      ],
      brand: { '@type': 'Brand', name: 'GingerBros' },
      sku: 'unpasteurized',
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/product/unpasteurized`,
        priceCurrency: 'THB',
        price: '140',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'GingerBros' },
      },
    },
  },
  '/blog': {
    title: 'The Brew Blog — Ginger Fizz Recipes, Gut Health & Brewing Tips | GingerBros',
    description:
      'Explore GingerBros blog for ginger fizz recipes, probiotic gut health guides, and behind-the-scenes craft brewing stories from Thailand.',
    image: FALLBACK_IMAGE,
    type: 'website',
  },
  '/faq': {
    title: 'Frequently Asked Questions — GingerBros',
    description:
      'Find answers about GingerBros delivery, subscriptions, storage, wholesale, and payments.',
    image: FALLBACK_IMAGE,
    type: 'website',
  },
  '/wholesale': {
    title: 'Wholesale — GingerBros',
    description:
      'Wholesale pricing for cafes, restaurants, bars, and retailers. Order chilled unpasteurized ginger fizz in Thailand.',
    image: FALLBACK_IMAGE,
    type: 'website',
  },
  '/shipping': {
    title: 'Shipping Information — GingerBros',
    description:
      'Shipping rates and delivery information for GingerBros unpasteurized ginger fizz. Chilled nationwide delivery across Thailand.',
    image: FALLBACK_IMAGE,
    type: 'website',
  },
  '/track': {
    title: 'Track Your Order — GingerBros',
    description: 'Track your GingerBros order status with your email and order reference.',
    image: FALLBACK_IMAGE,
    type: 'website',
    noindex: true,
  },
  '/order/success': {
    title: 'Thank You for Your Order — GingerBros',
    description: 'Your GingerBros order has been received.',
    image: FALLBACK_IMAGE,
    type: 'website',
    noindex: true,
  },
  '/admin/orders': {
    title: 'Admin Orders — GingerBros',
    description: 'GingerBros order management dashboard.',
    image: FALLBACK_IMAGE,
    type: 'website',
    noindex: true,
  },
  '/privacy': {
    title: 'Privacy Policy — GingerBros',
    description: 'GingerBros privacy policy and data practices.',
    image: FALLBACK_IMAGE,
    type: 'website',
  },
  '/terms': {
    title: 'Terms of Service — GingerBros',
    description: 'GingerBros terms of service.',
    image: FALLBACK_IMAGE,
    type: 'website',
  },
  '/returns': {
    title: 'Returns & Refunds — GingerBros',
    description: 'GingerBros returns, refunds, and replacement policy.',
    image: FALLBACK_IMAGE,
    type: 'website',
  },
};

const VALID_PRODUCT_IDS = new Set(['unpasteurized']);

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
  matcher: ['/((?!api|assets|images|index.html|favicon|site.webmanifest|sitemap.xml|robots.txt).*)'],
};

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, '') || '/';

  const htmlUrl = new URL('/index.html', request.url);
  const response = await fetch(htmlUrl);
  if (!response.ok) {
    return fetch(request);
  }

  let html = await response.text();

  const productMatch = pathname.match(/^\/product\/([^/]+)\/?$/);
  if (productMatch) {
    const productId = productMatch[1];
    if (!VALID_PRODUCT_IDS.has(productId)) {
      const notFoundMeta: RouteMeta = {
        title: 'Page Not Found — GingerBros',
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
  }

  const meta = KNOWN_ROUTES[pathname] ?? {
    title: 'Page Not Found — GingerBros',
    description: 'The page you are looking for could not be found.',
    image: FALLBACK_IMAGE,
    noindex: true,
  };
  const status = pathname in KNOWN_ROUTES ? 200 : 404;

  html = injectMeta(html, meta, pathname);

  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
