import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChefHat, Heart, Leaf, Sparkles } from 'lucide-react';
import SEO from '@/components/SEO';

type Category = 'Recipe' | 'Health';

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  readTime: string;
  icon: typeof ChefHat;
  content: string;
}

const POSTS: Post[] = [
  {
    slug: 'moscow-mule',
    title: 'The Perfect Moscow Mule with GingerBros',
    excerpt: 'Why our 7-day fermented ginger fizz makes the best Moscow Mule you have ever tasted.',
    category: 'Recipe',
    readTime: '3 min',
    icon: ChefHat,
    content: `A great Moscow Mule starts with great ginger fizz. Our 7-day naturally fermented brew brings a depth of flavor that mass-market ginger fizzs simply cannot match.

Ingredients:
• 60ml vodka
• 15ml fresh lime juice
• GingerBros Unpasteurized Ginger Fizz
• Lime wedge and mint for garnish

Instructions:
Fill a copper mug with ice. Add vodka and lime juice. Top with GingerBros. Stir gently and garnish.

The natural fermentation gives our unpasteurized ginger fizz a subtle funk and complexity that elevates this classic cocktail from good to unforgettable.`,
  },
  {
    slug: 'dark-and-stormy',
    title: 'Dark ’n’ Stormy with a Thai Ginger Kick',
    excerpt: 'A rum-forward classic gets brighter with fresh, fiery Thai ginger and live-culture fizz.',
    category: 'Recipe',
    readTime: '3 min',
    icon: ChefHat,
    content: `The Dark ’n’ Stormy is Bermuda’s national drink for a reason: dark rum and ginger fizz were made for each other. Our version swaps the usual soda for GingerBros, so you get real ginger heat and natural carbonation.

Ingredients:
• 60ml dark rum (Gosling’s Black Seal is traditional)
• 120ml GingerBros Unpasteurized Ginger Fizz
• 10ml fresh lime juice
• Lime wheel and candied ginger for garnish

Instructions:
Fill a tall glass with ice. Pour in the rum and lime juice. Top with GingerBros and stir once. Float the lime wheel on top.

Pro tip: The live cultures in our unpasteurized ginger fizz add a faint tartness that cuts through the rum’s sweetness beautifully.`,
  },
  {
    slug: 'ginger-margarita',
    title: 'Ginger Fizz Margarita',
    excerpt: 'Tequila, lime, and fiery ginger fizz come together in a refreshingly different margarita.',
    category: 'Recipe',
    readTime: '4 min',
    icon: ChefHat,
    content: `Margarita night just got an upgrade. Replacing part of the orange liqueur with ginger fizz gives this cocktail a spicy backbone and lighter body.

Ingredients:
• 45ml blanco tequila
• 30ml fresh lime juice
• 15ml triple sec or orange liqueur
• 60ml GingerBros Unpasteurized Ginger Fizz
• Salt rim and jalapeño slice (optional)

Instructions:
Rim a rocks glass with salt and fill with ice. Shake tequila, lime juice, and triple sec with ice, then strain into the glass. Top with GingerBros and garnish.

The result is tart, spicy, and dangerously drinkable — perfect for tropical afternoons.`,
  },
  {
    slug: 'spicy-ginger-lemonade',
    title: 'Spicy Ginger Lemonade (Zero-Proof)',
    excerpt: 'A bright, alcohol-free refresher that still feels like a special occasion.',
    category: 'Recipe',
    readTime: '3 min',
    icon: ChefHat,
    content: `Not every great drink needs alcohol. This zero-proof lemonade leans on real ginger heat and fresh citrus for a drink that wakes up your palate.

Ingredients:
• 30ml fresh lemon juice
• 15ml honey or simple syrup
• 120ml GingerBros Unpasteurized Ginger Fizz
• Lemon wheel and fresh mint

Instructions:
Shake lemon juice and honey with ice until chilled. Strain into an ice-filled glass. Top with GingerBros and garnish.

It is crisp, naturally effervescent, and low in sugar compared to most lemonades — especially if you let the ginger do most of the flavor work.`,
  },
  {
    slug: 'ginger-glazed-chicken',
    title: 'Ginger Fizz Glazed Chicken Wings',
    excerpt: 'Reduce GingerBros into a sticky, spicy glaze for oven or grill.',
    category: 'Recipe',
    readTime: '5 min',
    icon: ChefHat,
    content: `Ginger fizz is not just for drinking. Reduce it down and it becomes a tangy, caramelized glaze that works on wings, tofu, or roasted vegetables.

Ingredients:
• 500g chicken wings (or firm tofu cubes)
• 240ml GingerBros Unpasteurized Ginger Fizz
• 2 tbsp soy sauce
• 1 tbsp honey
• 1 tsp grated fresh ginger
• 2 cloves garlic, minced
• Sesame seeds and sliced scallions for garnish

Instructions:
Simmer GingerBros, soy sauce, honey, ginger, and garlic in a small saucepan until reduced by half and syrupy. Toss wings in half the glaze and bake at 200°C for 25–30 minutes, turning once. Brush with remaining glaze and broil for 2–3 minutes.

The live cultures cook off, but the real ginger flavor stays intense.`,
  },
  {
    slug: 'gut-health',
    title: 'Ginger Fizz & Gut Health: What You Should Know',
    excerpt: 'The science behind ginger, fermentation, and why your gut loves unpasteurized ginger fizz.',
    category: 'Health',
    readTime: '5 min',
    icon: Heart,
    content: `Ginger has been used for digestive health for thousands of years. Modern research confirms what traditional medicine has long known.

Ginger contains compounds called gingerols and shogaols that have anti-inflammatory and antioxidant effects. These compounds can help:

• Reduce nausea and motion sickness
• Support healthy digestion
• Reduce bloating and gas
• Support a healthy inflammatory response

Our unpasteurized ginger fizz goes a step further by delivering live probiotic cultures from our natural fermentation process. These beneficial bacteria can help support a healthy gut microbiome.

Keep in mind: the probiotic benefits only apply to unpasteurized ginger fizz. Pasteurized versions have had the live cultures heated away.`,
  },
  {
    slug: 'probiotics-prebiotics',
    title: 'Probiotics vs Prebiotics: A Simple Guide',
    excerpt: 'Learn the difference and how to pair unpasteurized ginger fizz with gut-friendly foods.',
    category: 'Health',
    readTime: '4 min',
    icon: Leaf,
    content: `Probiotics are live microorganisms that add to the population of beneficial bacteria in your gut. Prebiotics are the fibers that feed them.

Unpasteurized ginger fizz delivers probiotics thanks to natural fermentation. To get the most from it, pair it with prebiotic-rich foods like:

• Bananas
• Oats
• Garlic and onions
• Asparagus
• Chicory root

Think of probiotics as the seed and prebiotics as the water. You need both for a thriving gut garden. A glass of GingerBros alongside a fiber-rich meal is an easy way to support digestive wellness without overthinking it.`,
  },
  {
    slug: 'ginger-immunity',
    title: 'Ginger for Immunity: Fact or Fad?',
    excerpt: 'What research actually says about ginger, inflammation, and immune support.',
    category: 'Health',
    readTime: '4 min',
    icon: Sparkles,
    content: `Ginger is one of the most studied spices on the planet, and the results are promising — though not magical.

Clinical studies suggest ginger can:

• Support a healthy inflammatory response
• Reduce muscle soreness after exercise
• Help with nausea and digestive discomfort
• Provide antioxidant compounds that protect cells from oxidative stress

None of this means ginger fizz replaces medicine or a balanced diet. But choosing a drink made with real ginger and no artificial junk is a small, enjoyable way to support overall wellness. Our unpasteurized version also adds the probiotic angle, which ties into the growing understanding that gut health and immune health are closely linked.`,
  },
  {
    slug: 'low-sugar-drinking',
    title: 'Why We Keep the Sugar Lower',
    excerpt: 'Most of the sugar in our brew is eaten by the ginger bug during fermentation.',
    category: 'Health',
    readTime: '3 min',
    icon: Heart,
    content: `Traditional ginger fizz recipes are loaded with sugar. We take a different approach.

During our 7-day natural fermentation, the ginger bug consumes much of the cane sugar we start with. What is left is a small amount of residual sugar that balances the ginger heat and supports carbonation.

The result is a ginger fizz that tastes bright and refreshing without being syrupy. For anyone watching their sugar intake, this makes GingerBros a better mixer and standalone drink than most commercial alternatives.

Of course, moderation still matters. But it is nice when the better choice also tastes better.`,
  },
  {
    slug: 'hydration-electrolytes',
    title: 'Ginger Fizz, Hydration, and Hot Days',
    excerpt: 'Can a fermented ginger drink actually help on sweaty afternoons?',
    category: 'Health',
    readTime: '3 min',
    icon: Leaf,
    content: `Thailand is hot. When you sweat, you lose water and electrolytes. While water should always be your first line of defense, a naturally fermented ginger fizz can be a flavorful option that encourages you to drink more.

Ginger contains potassium and magnesium in small amounts. Combined with the carbonation and gentle spice, it can feel more satisfying than plain water on a humid afternoon.

Our take: keep a few bottles chilled, enjoy them after light activity, and do not rely on any drink as a substitute for plain water. Used wisely, GingerBros makes hydration a lot more interesting.`,
  },
];

const CATEGORIES: { label: 'All' | Category; count: number }[] = [
  { label: 'All', count: POSTS.length },
  { label: 'Recipe', count: POSTS.filter((p) => p.category === 'Recipe').length },
  { label: 'Health', count: POSTS.filter((p) => p.category === 'Health').length },
];

function renderContent(content: string) {
  const blocks = content.split('\n\n');
  return blocks.map((block, i) => {
    const lines = block.split('\n');
    const isList = lines.every((line) => /^[•\-\d]/.test(line.trim()));
    if (isList) {
      return (
        <ul key={i} className="list-disc list-inside font-body text-earth leading-relaxed mb-4 space-y-1">
          {lines.map((line, j) => (
            <li key={j}>{line.replace(/^[•\-\d]+\.?\s*/, '')}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="font-body text-earth leading-relaxed mb-4 last:mb-0">
        {block}
      </p>
    );
  });
}

export default function BlogPage() {
  const navigate = useNavigate();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | Category>('All');
  const activePost = POSTS.find((p) => p.slug === activeSlug);

  const filteredPosts = useMemo(() => {
    if (filter === 'All') return POSTS;
    return POSTS.filter((p) => p.category === filter);
  }, [filter]);

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'The GingerBros Brew Blog',
    url: 'https://gingerbrosshop.com/blog',
    description: 'Ginger fizz recipes, gut health tips, and wellness ideas from GingerBros Thailand.',
    blogPost: POSTS.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.excerpt,
      url: `https://gingerbrosshop.com/blog#${p.slug}`,
    })),
  };

  const activePostSchema = activePost
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: activePost.title,
        description: activePost.excerpt,
        articleBody: activePost.content,
        url: `https://gingerbrosshop.com/blog#${activePost.slug}`,
        author: { '@type': 'Organization', name: 'GingerBros' },
        publisher: {
          '@type': 'Organization',
          name: 'GingerBros',
          logo: { '@type': 'ImageObject', url: 'https://gingerbrosshop.com/images/product-unpasteurized-2.jpg' },
        },
      }
    : null;

  return (
    <div className="min-h-screen bg-warm-white">
      {activePost ? (
        <SEO
          title={`${activePost.title} — GingerBros Blog`}
          description={activePost.excerpt}
          path="/blog"
          type="article"
          jsonLd={activePostSchema ? [activePostSchema] : undefined}
        />
      ) : (
        <SEO
          title="The Brew Blog — Ginger Fizz Recipes, Gut Health & Wellness | GingerBros"
          description="Explore the GingerBros blog for ginger fizz cocktail recipes, probiotic gut health guides, and low-sugar wellness tips from Thailand."
          path="/blog"
          jsonLd={[blogListSchema]}
        />
      )}
      <div className="sticky top-0 z-50 bg-warm-white/95 backdrop-blur-xl border-b border-soft-peach/50">
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-body font-medium text-sm text-earth hover:text-deep-brown transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </button>
          <span className="font-display font-bold text-lg text-deep-brown">GingerBros</span>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-16">
        {!activePost ? (
          <>
            <h1 className="font-display font-bold text-deep-brown text-3xl md:text-4xl mb-4 text-center">The Brew Blog</h1>
            <p className="font-body text-earth text-center mb-8 max-w-[500px] mx-auto">
              Real ginger fizz recipes, gut-health explainers, and low-sugar drinking ideas from the GingerBros kitchen.
            </p>

            {/* Category filters */}
            <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setFilter(cat.label)}
                  className={`font-body font-medium text-sm px-4 py-2 rounded-full transition-colors ${
                    filter === cat.label
                      ? 'bg-deep-brown text-cream'
                      : 'bg-cream text-earth hover:bg-soft-peach/50'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {filteredPosts.map((post) => {
                const Icon = post.icon;
                return (
                  <button
                    key={post.slug}
                    onClick={() => setActiveSlug(post.slug)}
                    className="w-full text-left bg-cream rounded-2xl p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-rust" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-body font-semibold text-[11px] uppercase tracking-wider text-rust">
                            {post.category}
                          </span>
                          <span className="font-body text-[12px] text-earth/50">{post.readTime} read</span>
                        </div>
                        <h2 className="font-display font-semibold text-deep-brown text-lg mb-2">{post.title}</h2>
                        <p className="font-body text-earth text-[14px]">{post.excerpt}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setActiveSlug(null)} className="flex items-center gap-2 font-body font-medium text-sm text-earth hover:text-deep-brown transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </button>
            <span className="inline-block font-body font-semibold text-[11px] uppercase tracking-wider text-rust mb-3">
              {activePost.category}
            </span>
            <h1 className="font-display font-bold text-deep-brown text-2xl md:text-3xl mb-4">{activePost.title}</h1>
            <p className="font-body text-earth/50 text-sm mb-8">{activePost.readTime} read</p>
            <div className="bg-cream rounded-2xl p-8">{renderContent(activePost.content)}</div>
          </>
        )}
      </div>
    </div>
  );
}
