/**
 * Single source of truth for blog-post SEO/meta fields, shared between the
 * blog UI (src/pages/BlogPage.tsx) and the Vercel Edge middleware that serves
 * crawler-facing <title>/description/OG tags for /guide/:slug deep links.
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
    slug: 'how-to-serve-ginger-fizz',
    title: 'How to Serve Ginger Fizz (5 Simple Rules)',
    excerpt: 'Cold, lots of ice, a squeeze of lime. The quick guide to getting the most out of every bottle of GingerBros Ginger Fizz.',
    date: '2026-11-02',
    author: 'The GingerBros Kitchen',
    image: '/images/gen/life-pour-cold.jpg',
  },
  {
    slug: 'ginger-tea-hot-or-iced',
    title: 'Ginger Tea: Hot or Iced? How to Serve It Both Ways',
    excerpt: 'Ginger Tea · Thai Spice is still, not sparkling, so it works over ice or gently warmed. Here is how to do both.',
    date: '2026-11-01',
    author: 'The GingerBros Kitchen',
    image: '/images/gen/bottle-tea.jpg',
  },
  {
    slug: 'ginger-and-thai-food',
    title: 'What to Drink with Thai Food: A Ginger Pairing Cheat Sheet',
    excerpt: 'Som tam, pad kra pao, khao man gai, tom yum: which GingerBros drink goes with which Thai dish, and why ginger works so well.',
    date: '2026-10-30',
    author: 'The GingerBros Kitchen',
    image: '/images/gen/life-limes-overhead.jpg',
  },
  {
    slug: 'ginger-mocktails',
    title: '5 Easy Ginger Mocktails You Can Make at Home',
    excerpt: 'A Bangkok Mule, a lemongrass cooler, a tamarind spritz and more: five zero-proof ginger drinks, no shaker needed.',
    date: '2026-10-28',
    author: 'The GingerBros Kitchen',
    image: '/images/gen/life-ice-stool.jpg',
  },
  {
    slug: 'thai-ginger-101',
    title: 'Thai Ginger 101: Khing, Kha, Krachai and Why Ginger Burns',
    excerpt: 'Ginger vs galangal vs fingerroot, young vs mature ginger, and the science behind the heat. A crash course in Thai ginger.',
    date: '2026-10-25',
    author: 'GingerBros Stories',
    image: '/images/gen/life-night-market.jpg',
  },
  {
    slug: 'moscow-mule',
    title: 'Ginger Beer Moscow Mule: The Perfect Recipe',
    excerpt: 'Why fresh Thai ginger fizz makes the best Moscow Mule you have ever tasted, and the copper-mug ritual that goes with it.',
    date: '2026-05-28',
    author: 'The GingerBros Kitchen',
    image: '/images/gen/life-pour-cold.jpg',
  },
  {
    slug: 'dark-and-stormy',
    title: 'Dark ’n’ Stormy Recipe with Thai Ginger',
    excerpt: 'A rum-forward classic gets brighter with fresh, fiery Thai ginger fizz.',
    date: '2026-05-20',
    author: 'The GingerBros Kitchen',
    image: '/images/gen/life-night-market.jpg',
  },
  {
    slug: 'ginger-margarita',
    title: 'Ginger Margarita Recipe with Ginger Fizz',
    excerpt: 'Tequila, lime, and fiery ginger fizz come together in a refreshingly different margarita.',
    date: '2026-05-12',
    author: 'The GingerBros Kitchen',
    image: '/images/gen/life-cheers.jpg',
  },
  {
    slug: 'spicy-ginger-lemonade',
    title: 'Spicy Ginger Lemonade Recipe (Zero-Proof)',
    excerpt: 'A bright, alcohol-free refresher that still feels like a special occasion.',
    date: '2026-05-05',
    author: 'The GingerBros Kitchen',
    image: '/images/gen/life-ice-stool.jpg',
  },
  {
    slug: 'ginger-glazed-chicken',
    title: 'Ginger Glazed Chicken Wings Recipe',
    excerpt: 'Reduce GingerBros into a sticky, spicy glaze for oven or grill.',
    date: '2026-04-26',
    author: 'The GingerBros Kitchen',
    image: '/images/gen/life-limes-overhead.jpg',
  },
  {
    slug: 'ginger-affogato-float',
    title: 'Ginger Affogato Float: A Ginger Ice Cream Soda',
    excerpt: 'A grown-up dessert: cold ginger fizz poured over vanilla ice cream and a shot of espresso.',
    date: '2026-04-18',
    author: 'The GingerBros Kitchen',
    image: '/images/gen/photo-tea-studio.jpg',
  },
  {
    slug: 'history-of-ginger-beer',
    title: 'A Short, Spicy History of Ginger Beer',
    excerpt: 'From 18th-century England to Thai street stalls, how the ginger drink spread around the world.',
    date: '2026-04-14',
    author: 'GingerBros Stories',
    image: '/images/gen/fizz-six-lineup.jpg',
  },
  {
    slug: 'thai-ginger-vs-the-world',
    title: 'Thai Ginger vs the World: Why Origin Matters',
    excerpt: 'Not all ginger is created equal. Here is what makes the Thai rhizome special.',
    date: '2026-04-06',
    author: 'GingerBros Stories',
    image: '/images/gen/life-stoop.jpg',
  },
  {
    slug: 'flavor-pairing-guide',
    title: 'What to Eat with Ginger Soda: A Pairing Guide',
    excerpt: 'What to eat, mix, and serve alongside ginger fizz for maximum deliciousness.',
    date: '2026-03-28',
    author: 'The GingerBros Kitchen',
    image: '/images/gen/life-crate-duo.jpg',
  },
  {
    slug: 'ginger-fizz-bar-menu',
    title: 'Building a Ginger Fizz Cocktail Menu for Your Bar',
    excerpt: 'How bars and restaurants can build a focused, profitable ginger fizz menu, from signature serves to garnish stations and staff training.',
    date: '2026-06-12',
    author: 'The GingerBros Trade Team',
    image: '/images/gen/life-night-market.jpg',
  },
  {
    slug: 'batching-cocktails-for-service',
    title: 'Batching Ginger Fizz Cocktails for Busy Service',
    excerpt: 'Pre-batch the base, pour the fizz fresh. A practical guide to speed, consistency, and carbonation for high-volume bars.',
    date: '2026-06-10',
    author: 'The GingerBros Trade Team',
    image: '/images/gen/fizz-six-lineup.jpg',
  },
  {
    slug: 'zero-proof-restaurant-drinks',
    title: 'Zero-Proof Drinks That Restaurants Can Actually Sell',
    excerpt: 'Why the mocktail menu matters, how to price it, and three zero-proof builds that work on a restaurant floor.',
    date: '2026-06-07',
    author: 'The GingerBros Trade Team',
    image: '/images/gen/life-cheers.jpg',
  },
];
