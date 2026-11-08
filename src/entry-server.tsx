/* eslint-disable react-refresh/only-export-components */
import { StaticRouter } from 'react-router';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { prerender } from 'react-dom/static';
import App from './App';
import { seedCatalog, type CatalogProduct } from '@/lib/catalog';
import { BLOG_SLUGS } from '@/pages/BlogPage';
import { localeFromPath, basenameFor } from '@/lib/locale';

export { TH_PATHS } from '@/lib/locale';
export { ROUTE_SEO, PRERENDER_PATHS, SITEMAP_PATHS, THAI_PATHS } from '@/seo/routes';

export { BLOG_SLUGS };
export { BLOG_SEO_META } from '@/lib/blogSeoMeta';

export interface RenderResult {
  html: string;
  head: string;
}

/**
 * Build-time render of one storefront route. Called by scripts/prerender.mjs;
 * never runs in the browser or in production request handling.
 */
export async function render(url: string, catalog: CatalogProduct[] | null): Promise<RenderResult> {
  seedCatalog(catalog);
  const helmetContext: { helmet?: HelmetServerState } = {};
  const { prelude } = await prerender(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url} basename={basenameFor(localeFromPath(url))}>
        <App />
      </StaticRouter>
    </HelmetProvider>,
  );
  const html = await new Response(prelude).text();
  const h = helmetContext.helmet;
  const head = h
    ? [h.title, h.meta, h.link, h.script].map((x) => x.toString()).join('')
    : '';
  return { html, head };
}
