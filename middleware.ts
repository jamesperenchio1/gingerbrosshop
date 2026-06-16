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

interface BlogPostMeta {
  title: string;
  description: string;
  date: string;
  author: string;
  image?: string;
}

/**
 * Lightweight mirror of the blog catalogue in src/pages/BlogPage.tsx, used so
 * crawlers and link-preview bots get correct per-article meta and a 200 status
 * on /blog/:slug deep links (instead of the generic SPA 404 fallback).
 */
const BLOG_POSTS: Record<string, BlogPostMeta> = {
  'art-of-the-ginger-bug': {
    title: 'The Art of the Ginger Bug: How We Brew Living Fizz',
    description:
      'Step inside our Bangkok brewhouse for a look at the wild ferment that powers every bottle — from raw rhizome to bubbling, living soda.',
    date: '2026-06-02',
    author: 'James, Founder',
    image: `${SITE_URL}/images/story-brewing.webp`,
  },
  'moscow-mule': {
    title: 'The Perfect Moscow Mule with GingerBros',
    description:
      'Why our 7-day fermented ginger fizz makes the best Moscow Mule you have ever tasted — and the copper-mug ritual that goes with it.',
    date: '2026-05-28',
    author: 'The GingerBros Kitchen',
    image: `${SITE_URL}/images/product-unpasteurized-2.jpg`,
  },
  'dark-and-stormy': {
    title: 'Dark ’n’ Stormy with a Thai Ginger Kick',
    description: 'A rum-forward classic gets brighter with fresh, fiery Thai ginger and live-culture fizz.',
    date: '2026-05-20',
    author: 'The GingerBros Kitchen',
  },
  'ginger-margarita': {
    title: 'Ginger Fizz Margarita',
    description: 'Tequila, lime, and fiery ginger fizz come together in a refreshingly different margarita.',
    date: '2026-05-12',
    author: 'The GingerBros Kitchen',
  },
  'spicy-ginger-lemonade': {
    title: 'Spicy Ginger Lemonade (Zero-Proof)',
    description: 'A bright, alcohol-free refresher that still feels like a special occasion.',
    date: '2026-05-05',
    author: 'The GingerBros Kitchen',
  },
  'ginger-glazed-chicken': {
    title: 'Ginger Fizz Glazed Chicken Wings',
    description: 'Reduce GingerBros into a sticky, spicy glaze for oven or grill.',
    date: '2026-04-26',
    author: 'The GingerBros Kitchen',
  },
  'ginger-affogato-float': {
    title: 'Ginger Fizz Affogato Float',
    description: 'A grown-up dessert: cold ginger fizz poured over vanilla ice cream and a shot of espresso.',
    date: '2026-04-18',
    author: 'The GingerBros Kitchen',
  },
  'gut-health': {
    title: 'Ginger Fizz & Gut Health: What You Should Know',
    description: 'The science behind ginger, fermentation, and why your gut loves unpasteurized ginger fizz.',
    date: '2026-06-08',
    author: 'GingerBros Wellness',
  },
  'probiotics-prebiotics': {
    title: 'Probiotics vs Prebiotics: A Simple Guide',
    description: 'Learn the difference and how to pair unpasteurized ginger fizz with gut-friendly foods.',
    date: '2026-05-30',
    author: 'GingerBros Wellness',
  },
  'ginger-immunity': {
    title: 'Ginger for Immunity: Fact or Fad?',
    description: 'What research actually says about ginger, inflammation, and immune support.',
    date: '2026-05-22',
    author: 'GingerBros Wellness',
  },
  'low-sugar-drinking': {
    title: 'Why We Keep the Sugar Lower',
    description: 'Most of the sugar in our brew is eaten by the ginger bug during fermentation.',
    date: '2026-05-14',
    author: 'GingerBros Wellness',
  },
  'hydration-electrolytes': {
    title: 'Ginger Fizz, Hydration, and Hot Days',
    description: 'Can a fermented ginger drink actually help on sweaty afternoons?',
    date: '2026-05-08',
    author: 'GingerBros Wellness',
  },
  'unpasteurized-vs-pasteurized': {
    title: 'Unpasteurized vs Pasteurized: The Honest Difference',
    description: 'A clear, no-spin comparison so you can choose the bottle that fits your life.',
    date: '2026-04-30',
    author: 'GingerBros Wellness',
  },
  'storing-living-fizz': {
    title: 'How to Store Living Fizz (and Open It Safely)',
    description:
      'Live cultures keep working in the bottle. Here is how to keep yours happy and avoid a fountain.',
    date: '2026-04-22',
    author: 'The GingerBros Kitchen',
  },
  'history-of-ginger-beer': {
    title: 'A Short, Spicy History of Ginger Beer',
    description: 'From 18th-century England to Thai street stalls, the global journey of fermented ginger.',
    date: '2026-04-14',
    author: 'GingerBros Stories',
  },
  'thai-ginger-vs-the-world': {
    title: 'Thai Ginger vs the World: Why Origin Matters',
    description: 'Not all ginger is created equal. Here is what makes the Thai rhizome special.',
    date: '2026-04-06',
    author: 'GingerBros Stories',
  },
  'flavor-pairing-guide': {
    title: 'The GingerBros Flavor Pairing Guide',
    description: 'What to eat, mix, and serve alongside ginger fizz for maximum deliciousness.',
    date: '2026-03-28',
    author: 'The GingerBros Kitchen',
  },
  'meet-the-brewers': {
    title: 'Meet the Brewers Behind the Bottle',
    description:
      'The small Bangkok team that hand-balances every batch — and why they do it by taste, not by formula.',
    date: '2026-03-20',
    author: 'GingerBros Stories',
    image: `${SITE_URL}/images/product-unpasteurized.jpg`,
  },
  'ginger-bug-at-home': {
    title: 'Start Your Own Ginger Bug at Home',
    description:
      'A beginner-friendly walkthrough to culture your own wild ginger starter — the same idea behind our brew.',
    date: '2026-03-12',
    author: 'James, Founder',
  },
  'sustainability-bottle-to-soil': {
    title: 'From Bottle to Soil: Our Sustainability Promise',
    description: 'Recyclable glass, ginger pulp that becomes compost, and the climate cost we are still working on.',
    date: '2026-03-04',
    author: 'GingerBros Stories',
  },
};

function blogPostMeta(slug: string): RouteMeta | null {
  const post = BLOG_POSTS[slug];
  if (!post) return null;
  const url = `${SITE_URL}/blog/${slug}`;
  const image = post.image ?? FALLBACK_IMAGE;
  return {
    title: `${post.title} — GingerBros Brew Journal`,
    description: post.description,
    image,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      image,
      url,
      author: { '@type': 'Organization', name: post.author },
      publisher: {
        '@type': 'Organization',
        name: 'GingerBros',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/images/product-unpasteurized-2.jpg`,
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

  // Individual blog articles live at /blog/:slug. Valid slugs return 200 with
  // per-article meta; unknown slugs fall through to the 404 handling below.
  const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
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
