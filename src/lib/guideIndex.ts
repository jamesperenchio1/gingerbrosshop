/**
 * Short, stable lists of guide articles to link from outside the guide index.
 *
 * Every article used to be reachable only from /guide, which meant Google
 * discovered them but crawled them rarely (Search Console: "Discovered —
 * currently not indexed"). These lists put the best ones a single click from
 * the homepage and in the footer of every page.
 *
 * Dependency-free on purpose: BlogSeoMeta carries title/excerpt/image, and
 * nothing here pulls in React or the article bodies.
 */
import { BLOG_SEO_META, type BlogSeoMeta } from './blogSeoMeta';

/** Shown in the homepage "Ginger Guide" module. Keep this to three. */
export const FEATURED_GUIDE_SLUGS = ['how-to-serve-ginger-fizz', 'ginger-and-thai-food', 'ginger-mocktails'];

/** Site-wide footer column: the guides most likely to earn a click. */
export const POPULAR_GUIDE_SLUGS = [
  'how-to-serve-ginger-fizz',
  'ginger-and-thai-food',
  'ginger-mocktails',
  'ginger-tea-hot-or-iced',
  'thai-ginger-101',
];

/** Resolve slugs to meta in the order given, skipping anything that no longer exists. */
export function guidesFor(slugs: readonly string[]): BlogSeoMeta[] {
  const bySlug = new Map(BLOG_SEO_META.map((m) => [m.slug, m]));
  return slugs.map((s) => bySlug.get(s)).filter((m): m is BlogSeoMeta => Boolean(m));
}

/**
 * Footer-sized labels. Article titles are 40–55 characters, which wraps badly
 * in a link column; these say the same thing in four words.
 */
export const GUIDE_SHORT_LABELS: Record<string, string> = {
  'how-to-serve-ginger-fizz': 'How to serve Fizz',
  'ginger-and-thai-food': 'Drinks with Thai food',
  'ginger-mocktails': 'Ginger mocktails',
  'ginger-tea-hot-or-iced': 'Tea: hot or iced',
  'thai-ginger-101': 'Thai ginger 101',
};
