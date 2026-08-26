/**
 * Single source of truth for blog-post SEO/meta fields, shared between the
 * blog UI (src/pages/BlogPage.tsx) and the Vercel Edge middleware that serves
 * crawler-facing <title>/description/OG tags for /blog/:slug deep links.
 *
 * Deliberately has zero dependencies (no lucide-react, no React, no long
 * article bodies) so it stays cheap to import into the edge runtime.
 */

export interface BlogSeoMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
}

export const BLOG_SEO_META: BlogSeoMeta[] = [
  {
    slug: 'art-of-the-ginger-bug',
    title: 'The Art of the Ginger Bug: How We Brew Living Fizz',
    excerpt: 'Step inside our Bangkok brewhouse for a look at the wild ferment that powers every bottle — from raw rhizome to bubbling, living soda.',
    date: '2026-06-02',
    author: 'James, Founder',
    image: '/images/story-brewing.webp',
  },
  {
    slug: 'moscow-mule',
    title: 'The Perfect Moscow Mule with GingerBros',
    excerpt: 'Why our 5-day fermented ginger fizz makes the best Moscow Mule you have ever tasted — and the copper-mug ritual that goes with it.',
    date: '2026-05-28',
    author: 'The GingerBros Kitchen',
    image: '/images/ginger-fizz-new.png',
  },
  {
    slug: 'dark-and-stormy',
    title: 'Dark ’n’ Stormy with a Thai Ginger Kick',
    excerpt: 'A rum-forward classic gets brighter with fresh, fiery Thai ginger and live-culture fizz.',
    date: '2026-05-20',
    author: 'The GingerBros Kitchen',
    image: '/images/ginger-fizz-new.png',
  },
  {
    slug: 'ginger-margarita',
    title: 'Ginger Fizz Margarita',
    excerpt: 'Tequila, lime, and fiery ginger fizz come together in a refreshingly different margarita.',
    date: '2026-05-12',
    author: 'The GingerBros Kitchen',
    image: '/images/ginger-fizz-new.png',
  },
  {
    slug: 'spicy-ginger-lemonade',
    title: 'Spicy Ginger Lemonade (Zero-Proof)',
    excerpt: 'A bright, alcohol-free refresher that still feels like a special occasion.',
    date: '2026-05-05',
    author: 'The GingerBros Kitchen',
    image: '/images/ginger-fizz-new.png',
  },
  {
    slug: 'ginger-glazed-chicken',
    title: 'Ginger Fizz Glazed Chicken Wings',
    excerpt: 'Reduce GingerBros into a sticky, spicy glaze for oven or grill.',
    date: '2026-04-26',
    author: 'The GingerBros Kitchen',
    image: '/images/product-ginger-fizz-2.jpg',
  },
  {
    slug: 'ginger-affogato-float',
    title: 'Ginger Fizz Affogato Float',
    excerpt: 'A grown-up dessert: cold ginger fizz poured over vanilla ice cream and a shot of espresso.',
    date: '2026-04-18',
    author: 'The GingerBros Kitchen',
    image: '/images/bundle-6pack.jpg',
  },
  {
    slug: 'gut-health',
    title: 'Ginger Fizz & Gut Health: What You Should Know',
    excerpt: 'The science behind ginger, fermentation, and why your gut loves our ginger fizz.',
    date: '2026-06-08',
    author: 'GingerBros Wellness',
    image: '/images/product-ginger-fizz-3.png',
  },
  {
    slug: 'probiotics-prebiotics',
    title: 'Probiotics vs Prebiotics: A Simple Guide',
    excerpt: 'Learn the difference and how to pair our ginger fizz with gut-friendly foods.',
    date: '2026-05-30',
    author: 'GingerBros Wellness',
    image: '/images/product-pasteurized.png',
  },
  {
    slug: 'ginger-immunity',
    title: 'Ginger for Immunity: Fact or Fad?',
    excerpt: 'What research actually says about ginger, inflammation, and immune support.',
    date: '2026-05-22',
    author: 'GingerBros Wellness',
    image: '/images/bottle hero.png',
  },
  {
    slug: 'low-sugar-drinking',
    title: 'Why We Keep the Sugar Lower',
    excerpt: 'Most of the sugar in our brew is eaten by the ginger bug during fermentation.',
    date: '2026-05-14',
    author: 'GingerBros Wellness',
    image: '/images/ginger-fizz-new.png',
  },
  {
    slug: 'hydration-electrolytes',
    title: 'Ginger Fizz, Hydration, and Hot Days',
    excerpt: 'Can a fermented ginger drink actually help on sweaty afternoons?',
    date: '2026-05-08',
    author: 'GingerBros Wellness',
    image: '/images/ginger-fizz-new.png',
  },
  {
    slug: 'storing-living-fizz',
    title: 'How to Store Living Fizz (and Open It Safely)',
    excerpt: 'Live cultures keep working in the bottle. Here is how to keep yours happy and avoid a fountain.',
    date: '2026-04-22',
    author: 'The GingerBros Kitchen',
    image: '/images/product-ginger-fizz-2.jpg',
  },
  {
    slug: 'history-of-ginger-beer',
    title: 'A Short, Spicy History of Ginger Beer',
    excerpt: 'From 18th-century England to Thai street stalls, the global journey of fermented ginger.',
    date: '2026-04-14',
    author: 'GingerBros Stories',
    image: '/images/story-brewing.jpg',
  },
  {
    slug: 'thai-ginger-vs-the-world',
    title: 'Thai Ginger vs the World: Why Origin Matters',
    excerpt: 'Not all ginger is created equal. Here is what makes the Thai rhizome special.',
    date: '2026-04-06',
    author: 'GingerBros Stories',
    image: '/images/story-brewing.webp',
  },
  {
    slug: 'flavor-pairing-guide',
    title: 'The GingerBros Flavor Pairing Guide',
    excerpt: 'What to eat, mix, and serve alongside ginger fizz for maximum deliciousness.',
    date: '2026-03-28',
    author: 'The GingerBros Kitchen',
    image: '/images/bundle-6pack.jpg',
  },
  {
    slug: 'meet-the-brewers',
    title: 'Meet the Brewers Behind the Bottle',
    excerpt: 'The small Bangkok team that hand-balances every batch — and why they do it by taste, not by formula.',
    date: '2026-03-20',
    author: 'GingerBros Stories',
    image: '/images/story-brewing.jpg',
  },
  {
    slug: 'ginger-bug-at-home',
    title: 'Start Your Own Ginger Bug at Home',
    excerpt: 'A beginner-friendly walkthrough to culture your own wild ginger starter — the same idea behind our brew.',
    date: '2026-03-12',
    author: 'James, Founder',
    image: '/images/product-ginger-fizz-3.png',
  },
  {
    slug: 'sustainability-bottle-to-soil',
    title: 'From Bottle to Soil: Our Sustainability Promise',
    excerpt: 'Recyclable glass, ginger pulp that becomes compost, and the climate cost we are still working on.',
    date: '2026-03-04',
    author: 'GingerBros Stories',
    image: '/images/ginger-fizz-new.png',
  },
  {
    slug: 'ginger-fizz-bar-menu',
    title: 'Building a Ginger Fizz Cocktail Menu for Your Bar',
    excerpt: 'How bars and restaurants can build a focused, profitable ginger fizz menu — from signature serves to garnish stations and staff training.',
    date: '2026-06-12',
    author: 'The GingerBros Trade Team',
    image: '/images/ginger-fizz-new.png',
  },
  {
    slug: 'batching-cocktails-for-service',
    title: 'Batching Ginger Fizz Cocktails for Busy Service',
    excerpt: 'Pre-batch the base, pour the fizz fresh. A practical guide to speed, consistency, and carbonation for high-volume bars.',
    date: '2026-06-10',
    author: 'The GingerBros Trade Team',
    image: '/images/ginger-fizz-new.png',
  },
  {
    slug: 'zero-proof-restaurant-drinks',
    title: 'Zero-Proof Drinks That Restaurants Can Actually Sell',
    excerpt: 'Why the mocktail menu matters, how to price it, and three zero-proof builds that work on a restaurant floor.',
    date: '2026-06-07',
    author: 'The GingerBros Trade Team',
    image: '/images/ginger-fizz-new.png',
  },
];
