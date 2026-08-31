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

/** Default Open Graph / Twitter share image (1200×630). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/ginger-fizz-new.png`;
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

export const SOCIAL_LINKS = [
  'https://www.instagram.com/drinkgingerbros',
  'https://www.tiktok.com/@gingerbrosbrew',
];

/**
 * How long the ferment runs, in days. Used in marketing copy so the number
 * can't drift between the page, the meta description and the edge middleware.
 */
export const FERMENT_DAYS = 5;
