/**
 * Site identity — canonical URL, brand name, social profiles, default share
 * image. Imported by the SEO component, the homepage JSON-LD and the edge
 * middleware so these strings exist in exactly one place.
 */

/**
 * Canonical origin, without a trailing slash.
 * Deliberately a plain constant: this module is also imported by the edge
 * middleware, which isn't built by Vite and has no `import.meta.env`.
 */
export const SITE_URL = 'https://gingerbrosshop.com';

export const SITE_NAME = 'GingerBros';

/** Default Open Graph / Twitter share image (1200×630, scripts/build-og.mjs). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og/default.jpg`;
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

/** Square brand mark for Organization.logo. */
export const LOGO_URL = `${SITE_URL}/icon-512.png`;

export const SOCIAL_LINKS = [
  'https://www.instagram.com/drinkgingerbros',
  'https://www.tiktok.com/@gingerbrosbrew',
  'https://shopee.co.th/gingerbros',
  'https://line.me/R/ti/p/@852nqred',
];

export const TAGLINE = 'Think Ginger. Drink Different.';
