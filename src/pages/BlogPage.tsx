import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, ChefHat, Heart } from 'lucide-react';
import SEO from '@/components/SEO';

const POSTS = [
  {
    slug: 'moscow-mule',
    title: 'The Perfect Moscow Mule with GingerBros',
    excerpt: 'Why our 7-day fermented ginger beer makes the best Moscow Mule you have ever tasted.',
    category: 'Recipe',
    readTime: '3 min',
    icon: ChefHat,
    content: `A great Moscow Mule starts with great ginger beer. Our 7-day naturally fermented brew brings a depth of flavor that mass-market ginger beers simply cannot match.

Ingredients:
• 60ml vodka
• 15ml fresh lime juice
• GingerBros Pasteurized Ginger Beer
• Lime wedge and mint for garnish

Instructions:
Fill a copper mug with ice. Add vodka and lime juice. Top with GingerBros. Stir gently and garnish.

The natural fermentation gives our ginger beer a subtle funk and complexity that elevates this classic cocktail from good to unforgettable.`,
  },
  {
    slug: 'gut-health',
    title: 'Ginger Beer & Gut Health: What You Should Know',
    excerpt: 'The science behind ginger, fermentation, and why your gut loves unpasteurized ginger beer.',
    category: 'Health',
    readTime: '5 min',
    icon: Heart,
    content: `Ginger has been used for digestive health for thousands of years. Modern research confirms what traditional medicine has long known.

Ginger contains compounds called gingerols and shogaols that have anti-inflammatory and antioxidant effects. These compounds can help:

• Reduce nausea and motion sickness
• Support healthy digestion
• Reduce bloating and gas
• Support a healthy inflammatory response

Our unpasteurized ginger beer goes a step further by delivering live probiotic cultures from our natural fermentation process. These beneficial bacteria can help support a healthy gut microbiome.`,
  },
  {
    slug: 'brewing-process',
    title: 'Inside Our 7-Day Brewing Process',
    excerpt: 'From fresh Thai ginger to bottled craft ginger beer — here is how we do it.',
    category: 'Process',
    readTime: '4 min',
    icon: Clock,
    content: `Every bottle of GingerBros starts the same way: with fresh Thai ginger, grated by hand.

Day 1-2: We combine grated ginger, filtered water, and raw cane sugar in small batches. We add our ginger bug — a symbiotic culture of wild yeast and beneficial bacteria that we have been nurturing for months.

Day 3-5: Fermentation begins. The ginger bug consumes the sugar and produces natural carbonation, B vitamins, and complex flavor compounds. We taste and monitor each batch daily.

Day 6-7: The brew reaches its peak flavor and carbonation. We carefully strain and bottle immediately for our unpasteurized line, or gently pasteurize for our shelf-stable line.

The result is a ginger beer with real depth, real ingredients, and none of the artificial aftertaste of commercial sodas.`,
  },
];

export default function BlogPage() {
  const navigate = useNavigate();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const activePost = POSTS.find((p) => p.slug === activeSlug);

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'The GingerBros Brew Blog',
    url: 'https://gingerbrosshop.com/blog',
    description: 'Recipes, gut health tips, and craft brewing stories from GingerBros Thailand.',
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
          logo: { '@type': 'ImageObject', url: 'https://gingerbrosshop.com/images/product-pasteurized.png' },
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
          title="The Brew Blog — Ginger Beer Recipes, Gut Health & Brewing Tips | GingerBros"
          description="Explore GingerBros blog for Moscow Mule recipes, probiotic gut health guides, and behind-the-scenes craft ginger beer brewing stories from Thailand."
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
            <p className="font-body text-earth text-center mb-12">Recipes, health tips, and stories from the GingerBros kitchen.</p>

            <div className="space-y-6">
              {POSTS.map((post) => {
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
            <div className="bg-cream rounded-2xl p-8">
              {activePost.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="font-body text-earth leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
