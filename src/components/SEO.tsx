import { Helmet } from 'react-helmet-async';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_OG_IMAGE_HEIGHT,
} from '@/constants/site';
import { useI18n } from '@/context/I18nContext';
import { hasThai, localizedPath } from '@/lib/locale';
import { routeSeo } from '@/seo/routes';

interface SEOProps {
  /**
   * Static routes: pass `route` and the title, description, image and noindex
   * flag come from src/seo/routes.ts (the single source of truth, also used by
   * the edge middleware and the sitemap). Dynamic pages pass title/description.
   */
  route?: string;
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  jsonLd?: object | object[];
  /** Only set these when the image really is that size. */
  imageWidth?: number;
  imageHeight?: number;
}

export default function SEO({
  route,
  title: titleProp,
  description: descriptionProp,
  path: pathProp,
  image: imageProp,
  type = 'website',
  noindex: noindexProp,
  jsonLd,
  imageWidth,
  imageHeight,
}: SEOProps) {
  const { locale } = useI18n();
  const registry = route ? routeSeo(route, locale) : undefined;
  if (route && !registry) throw new Error(`SEO: unknown route "${route}" (add it to src/seo/routes.ts)`);
  const title = titleProp ?? registry?.title ?? '';
  const description = descriptionProp ?? registry?.description ?? '';
  const image = imageProp ?? registry?.image ?? DEFAULT_OG_IMAGE;
  const noindex = noindexProp ?? (registry ? !registry.indexable : false);
  const routePath = pathProp || route || '/';
  // Only pages with a real Thai version get a /th canonical; everything else
  // (product pages, guide…) is canonical in English even when browsed under /th.
  const canonical = `${SITE_URL}${localizedPath(routePath, hasThai(routePath) ? locale : 'en')}`.replace(/\/$/, '') || SITE_URL;
  const alternates = hasThai(routePath)
    ? [
        { lang: 'en', href: `${SITE_URL}${routePath === '/' ? '' : routePath}` },
        { lang: 'th', href: `${SITE_URL}${localizedPath(routePath, 'th')}` },
        { lang: 'x-default', href: `${SITE_URL}${routePath === '/' ? '' : routePath}` },
      ]
    : [];
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  // Only declare dimensions we actually know. Previously every page claimed
  // 1200×630, including product pages using a portrait Stripe photo — which
  // makes scrapers render a broken first-share preview.
  const isDefaultImage = image === DEFAULT_OG_IMAGE;
  const ogWidth = imageWidth ?? (isDefaultImage ? DEFAULT_OG_IMAGE_WIDTH : undefined);
  const ogHeight = imageHeight ?? (isDefaultImage ? DEFAULT_OG_IMAGE_HEIGHT : undefined);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
      )}
      {!noindex && <link rel="canonical" href={canonical} />}
      {!noindex && alternates.map((a) => <link key={a.lang} rel="alternate" hrefLang={a.lang} href={a.href} />)}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      {ogWidth && <meta property="og:image:width" content={String(ogWidth)} />}
      {ogHeight && <meta property="og:image:height" content={String(ogHeight)} />}
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content={locale === 'th' ? 'th_TH' : 'en_US'} />
      {alternates.length > 0 && <meta property="og:locale:alternate" content={locale === 'th' ? 'en_US' : 'th_TH'} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  );
}
