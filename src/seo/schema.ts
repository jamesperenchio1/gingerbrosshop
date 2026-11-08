/**
 * JSON-LD builders. Pure functions with relative imports so the React pages,
 * the edge middleware and the build scripts all emit identical markup.
 * Entities are linked by stable @id values so Google/Bing/LLMs see one brand.
 */
import { LOGO_URL, SITE_NAME, SITE_URL, SOCIAL_LINKS, TAGLINE } from '../constants/site';

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const CONTACT_EMAIL = 'gingerbros.brew@gmail.com';

export function organizationNode() {
  return {
    '@type': ['Organization', 'OnlineStore'],
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: LOGO_URL, width: 512, height: 512 },
    image: LOGO_URL,
    slogan: TAGLINE,
    description: 'GingerBros makes modern ginger drinks in Thailand: Ginger Fizz and Ginger Tea, made with fresh Thai ginger.',
    areaServed: { '@type': 'Country', name: 'Thailand' },
    sameAs: SOCIAL_LINKS,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: CONTACT_EMAIL,
      availableLanguage: ['English', 'Thai'],
    },
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    alternateName: ['Ginger Bros', 'จินเจอร์บรอส'],
    url: SITE_URL,
    inLanguage: ['en', 'th'],
    publisher: { '@id': ORG_ID },
  };
}

export interface Crumb {
  name: string;
  /** Router-relative path, e.g. "/shop". "/" is the home page. */
  path: string;
}

export function breadcrumbList(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.path === '/' ? SITE_URL : `${SITE_URL}${c.path}`,
    })),
  };
}

/** Wrap nodes (each without its own @context) in a single @graph document. */
export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

/** Organization + WebSite, the pair emitted on the homepage and in the edge fallback. */
export function siteGraph() {
  return graph(organizationNode(), websiteNode());
}
