import { useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Clock,
  Calendar,
  Tag as TagIcon,
  X,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import SEO from '@/components/SEO';
import Newsletter from '@/components/Newsletter';
import { CATEGORY_META, POSTS, ALL_CATEGORIES } from '@/lib/blogContent';
import type { Category, Post } from '@/lib/blogContent';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Render inline markdown inside a single block: **bold**, *italic*, and
 * [label](url) links. Links open in a new tab.
 */
function renderInline(text: string, keyPrefix = ''): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let k = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}b${k}`} className="font-semibold text-deep-brown">
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      nodes.push(<em key={`${keyPrefix}i${k}`}>{match[2]}</em>);
    } else {
      nodes.push(
        <a
          key={`${keyPrefix}a${k}`}
          href={match[4]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rust font-medium underline decoration-amber/60 underline-offset-2 hover:text-deep-brown transition-colors"
        >
          {match[3]}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
    k++;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/** Lightweight markdown-ish renderer for post bodies. */
function renderContent(content: string) {
  const blocks = content.split('\n\n');
  return blocks.map((block, i) => {
    const trimmed = block.trim();

    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} className="font-display font-bold text-deep-brown text-xl md:text-2xl mt-8 mb-3 first:mt-0">
          {renderInline(trimmed.replace(/^##\s+/, ''), `${i}-`)}
        </h2>
      );
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={i} className="font-display font-semibold text-deep-brown text-lg mt-6 mb-2">
          {renderInline(trimmed.replace(/^###\s+/, ''), `${i}-`)}
        </h3>
      );
    }
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote
          key={i}
          className="border-l-4 border-amber bg-amber/10 rounded-r-xl pl-5 pr-4 py-3 my-6 font-display italic text-deep-brown text-lg leading-relaxed"
        >
          {renderInline(trimmed.replace(/^>\s+/, ''), `${i}-`)}
        </blockquote>
      );
    }

    // Inline image: ![alt](src)
    const imgMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(trimmed);
    if (imgMatch) {
      const [, alt, src] = imgMatch;
      return (
        <figure key={i} className="my-8 -mx-2 sm:mx-0">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full rounded-2xl border border-soft-peach/60 shadow-sm object-cover max-h-[420px]"
          />
          {alt && (
            <figcaption className="mt-2 text-center font-body text-[13px] text-earth/60 italic">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    const lines = trimmed.split('\n');
    const isList = lines.length > 0 && lines.every((line) => /^[•\-\d]/.test(line.trim()));
    if (isList) {
      return (
        <ul key={i} className="space-y-2 mb-5">
          {lines.map((line, j) => (
            <li key={j} className="flex items-start gap-3 font-body text-earth leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-rust flex-shrink-0" />
              <span>{renderInline(line.replace(/^[•\-\d]+\.?\s*/, ''), `${i}-${j}-`)}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className="font-body text-earth leading-relaxed mb-4 last:mb-0">
        {renderInline(block, `${i}-`)}
      </p>
    );
  });
}

function PostCard({ post }: { post: Post }) {
  const meta = CATEGORY_META[post.category];
  const Icon = post.icon;
  return (
    <Link
      to={`/blog/${post.slug}`}
      data-testid={`blog-post-${post.slug}`}
      className="group blog-card flex flex-col text-left bg-warm-white rounded-3xl overflow-hidden border border-soft-peach/60 hover:border-amber/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`relative h-44 w-full overflow-hidden bg-gradient-to-br ${meta.gradient}`}>
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-14 h-14 text-deep-brown/30 group-hover:scale-110 transition-transform duration-500" />
          </div>
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 font-body font-semibold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-warm-white/90 backdrop-blur text-rust">
          <Icon className="w-3 h-3" />
          {post.category}
        </span>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-3 mb-2 text-earth/50">
          <span className="inline-flex items-center gap-1 font-body text-[12px]">
            <Calendar className="w-3 h-3" /> {formatDate(post.date)}
          </span>
          <span className="inline-flex items-center gap-1 font-body text-[12px]">
            <Clock className="w-3 h-3" /> {post.readTime}
          </span>
        </div>
        <h3 className="font-display font-semibold text-deep-brown text-lg leading-snug mb-2 group-hover:text-rust transition-colors">
          {post.title}
        </h3>
        <p className="font-body text-earth text-[14px] leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 font-body font-medium text-sm text-rust">
          Read article
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const [filter, setFilter] = useState<'All' | Category>('All');
  const [query, setQuery] = useState('');

  const activePost = slug ? POSTS.find((p) => p.slug === slug) ?? null : null;

  const closePost = () => navigate('/blog');

  // A slug that matches no post should fall back to the journal index.
  useEffect(() => {
    if (slug && !activePost) navigate('/blog', { replace: true });
  }, [slug, activePost, navigate]);

  // Scroll to the top whenever we switch between the index and an article,
  // or move from one article to another.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);
  const featured = POSTS.find((p) => p.featured) ?? POSTS[0];

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: POSTS.length };
    for (const c of ALL_CATEGORIES) {
      if (c === 'All') continue;
      map[c] = POSTS.filter((p) => p.category === c).length;
    }
    return map;
  }, []);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POSTS.filter((p) => {
      const matchesCat = filter === 'All' || p.category === filter;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [filter, query]);

  const relatedPosts = useMemo(() => {
    if (!activePost) return [];
    return POSTS.filter((p) => p.slug !== activePost.slug && p.category === activePost.category).slice(0, 3);
  }, [activePost]);

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'The GingerBros Brew Journal',
    url: 'https://gingerbrosshop.com/blog',
    description:
      'Ginger fizz recipes, gut health science, brewing stories, and wellness guides from GingerBros Thailand.',
    blogPost: POSTS.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.excerpt,
      datePublished: p.date,
      author: { '@type': 'Organization', name: p.author },
      url: `https://gingerbrosshop.com/blog/${p.slug}`,
    })),
  };

  const activePostSchema = activePost
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: activePost.title,
        description: activePost.excerpt,
        articleBody: activePost.content,
        datePublished: activePost.date,
        keywords: activePost.tags.join(', '),
        url: `https://gingerbrosshop.com/blog/${activePost.slug}`,
        author: { '@type': 'Organization', name: activePost.author },
        publisher: {
          '@type': 'Organization',
          name: 'GingerBros',
          logo: {
            '@type': 'ImageObject',
            url: 'https://gingerbrosshop.com/images/ginger-fizz-new.png',
          },
        },
      }
    : null;

  return (
    <div className="min-h-screen bg-warm-white">
      {activePost ? (
        <SEO
          title={`${activePost.title} — GingerBros Brew Journal`}
          description={activePost.excerpt}
          path={`/blog/${activePost.slug}`}
          type="article"
          image={activePost.image ? `https://gingerbrosshop.com${activePost.image}` : undefined}
          jsonLd={activePostSchema ? [activePostSchema] : undefined}
        />
      ) : (
        <SEO
          title="The Brew Journal — Ginger Fizz Recipes, Gut Health & Brewing Stories | GingerBros"
          description="Explore the GingerBros Brew Journal: ginger fizz cocktail recipes, probiotic gut-health science, brewing deep-dives, and low-sugar wellness guides from Thailand."
          path="/blog"
          jsonLd={[blogListSchema]}
        />
      )}

      {/* Sticky top bar */}
      <div className="sticky top-0 z-50 bg-warm-white/95 backdrop-blur-xl border-b border-soft-peach/50">
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-body font-medium text-sm text-earth hover:text-deep-brown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </button>
          <span className="font-display font-bold text-lg text-deep-brown">GingerBros</span>
          <div className="w-20" />
        </div>
      </div>

      {!activePost ? (
        <>
          {/* Hero header */}
          <div className="relative overflow-hidden border-b border-soft-peach/50">
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(240,212,168,0.45) 0%, #FDF8F0 100%)' }}
            />
            <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-amber/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-accent-green/15 blur-3xl" />

            <div className="relative max-w-[1280px] mx-auto px-6 pt-16 pb-12 text-center">
              <h1 className="font-display font-bold text-deep-brown text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
                The Brew Journal
              </h1>
              <p className="font-body text-earth text-base md:text-lg max-w-[620px] mx-auto mb-8">
                Living-culture recipes, gut-health science, brewing deep-dives, and the people and places behind
                every bottle of GingerBros.
              </p>

              {/* Search */}
              <div className="max-w-[480px] mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth/50" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search recipes, gut health, brewing…"
                  className="w-full bg-warm-white border border-soft-peach rounded-full pl-11 pr-10 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30 shadow-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-earth/50 hover:text-rust transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-[1280px] mx-auto px-6 py-12">
            {/* Featured post — only when not searching/filtering */}
            {filter === 'All' && !query && (
              <section className="mb-14">
                <h2 className="font-body font-semibold text-[12px] uppercase tracking-[0.12em] text-rust mb-4">
                  Featured
                </h2>
                <Link
                  to={`/blog/${featured.slug}`}
                  data-testid={`blog-featured-${featured.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-2 gap-0 w-full text-left bg-warm-white rounded-3xl overflow-hidden border border-soft-peach/60 hover:border-amber/60 hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`relative min-h-[260px] lg:min-h-[380px] bg-gradient-to-br ${CATEGORY_META[featured.category].gradient}`}>
                    {featured.image ? (
                      <img
                        src={featured.image}
                        alt={featured.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <featured.icon className="w-20 h-20 text-deep-brown/25" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center p-8 lg:p-12">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 font-body font-semibold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-amber/20 text-rust">
                        <featured.icon className="w-3 h-3" /> {featured.category}
                      </span>
                      <span className="inline-flex items-center gap-1 font-body text-[12px] text-earth/50">
                        <Clock className="w-3 h-3" /> {featured.readTime} read
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-deep-brown text-2xl md:text-3xl leading-tight mb-3 group-hover:text-rust transition-colors">
                      {featured.title}
                    </h3>
                    <p className="font-body text-earth leading-relaxed mb-6">{featured.excerpt}</p>
                    <span className="inline-flex items-center gap-2 font-body font-medium text-rust">
                      Read the full story
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </section>
            )}

            {/* Category filters */}
            <div
              role="group"
              aria-label="Filter articles by category"
              className="flex items-center justify-center gap-2 mb-10 flex-wrap"
            >
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  aria-pressed={filter === cat}
                  aria-label={`${cat} (${counts[cat]} ${counts[cat] === 1 ? 'article' : 'articles'})`}
                  data-testid={`blog-filter-${cat}`}
                  className={`font-body font-medium text-sm px-4 py-2 rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rust/40 ${
                    filter === cat
                      ? 'bg-deep-brown text-cream border-deep-brown'
                      : 'bg-warm-white text-earth border-soft-peach hover:border-amber hover:text-deep-brown'
                  }`}
                >
                  {cat} <span className="opacity-60" aria-hidden="true">({counts[cat]})</span>
                </button>
              ))}
            </div>

            {/* Results meta */}
            {(query || filter !== 'All') && (
              <p className="font-body text-sm text-earth/60 mb-6" aria-live="polite">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                {query && (
                  <>
                    {' '}
                    matching <span className="font-medium text-deep-brown">“{query}”</span>
                  </>
                )}
              </p>
            )}

            {/* Grid */}
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="w-10 h-10 text-earth/30 mx-auto mb-4" />
                <h3 className="font-display font-semibold text-deep-brown text-xl mb-2">No articles found</h3>
                <p className="font-body text-earth mb-6">Try a different search or browse all categories.</p>
                <button
                  onClick={() => {
                    setQuery('');
                    setFilter('All');
                  }}
                  className="inline-flex items-center gap-2 bg-deep-brown text-cream font-body font-medium px-6 py-3 rounded-full hover:bg-rust transition-colors"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {/* Newsletter CTA */}
          <Newsletter />
        </>
      ) : (
        /* ---------- Article detail view ---------- */
        <article className="pb-20">
          {/* Article hero */}
          <div className={`relative overflow-hidden bg-gradient-to-br ${CATEGORY_META[activePost.category].gradient}`}>
            {activePost.image && (
              <>
                <img src={activePost.image} alt={activePost.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/80 via-deep-brown/30 to-transparent" />
              </>
            )}
            <div className="relative max-w-[760px] mx-auto px-6 pt-10 pb-12 md:pt-14 md:pb-16">
              <button
                onClick={closePost}
                data-testid="blog-back"
                className={`inline-flex items-center gap-2 font-body font-medium text-sm mb-8 transition-colors ${
                  activePost.image ? 'text-cream/90 hover:text-cream' : 'text-earth hover:text-deep-brown'
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Back to Journal
              </button>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 font-body font-semibold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-warm-white/90 backdrop-blur text-rust">
                  <activePost.icon className="w-3 h-3" /> {activePost.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-body text-[12px] ${
                    activePost.image ? 'text-cream/80' : 'text-earth/60'
                  }`}
                >
                  <Clock className="w-3 h-3" /> {activePost.readTime} read
                </span>
              </div>
              <h1
                className={`font-display font-bold text-3xl md:text-4xl leading-tight mb-4 ${
                  activePost.image ? 'text-cream' : 'text-deep-brown'
                }`}
              >
                {activePost.title}
              </h1>
              <div
                className={`flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm ${
                  activePost.image ? 'text-cream/80' : 'text-earth/70'
                }`}
              >
                <span>By {activePost.author}</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(activePost.date)}
                </span>
              </div>
            </div>
          </div>

          {/* Article body */}
          <div data-testid="blog-article-content" className="max-w-[720px] mx-auto px-6 pt-10">
            <p className="font-body text-lg text-earth leading-relaxed mb-8 pb-8 border-b border-soft-peach">
              {activePost.excerpt}
            </p>
            <div className="prose-blog">{renderContent(activePost.content)}</div>

            {/* References */}
            {activePost.references && activePost.references.length > 0 && (
              <div className="mt-12 pt-8 border-t border-soft-peach">
                <h2 className="flex items-center gap-2 font-display font-bold text-deep-brown text-xl mb-4">
                  <BookOpen className="w-5 h-5 text-rust" /> References &amp; further reading
                </h2>
                <ol className="space-y-3">
                  {activePost.references.map((ref, i) => (
                    <li key={ref.url} className="flex gap-3 font-body text-[14px] leading-relaxed">
                      <span className="font-semibold text-rust flex-shrink-0">{i + 1}.</span>
                      <span className="text-earth">
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="font-medium text-deep-brown underline decoration-amber/60 underline-offset-2 hover:text-rust transition-colors inline-flex items-start gap-1"
                        >
                          {ref.label}
                          <ExternalLink className="w-3 h-3 mt-1 flex-shrink-0" />
                        </a>
                        <span className="block text-earth/60 text-[13px] italic">{ref.source}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 font-body text-[12px] text-earth/50 italic">
                  Sources are provided for general education. This article is not medical advice; consult a
                  healthcare professional for personal guidance.
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-soft-peach">
              <TagIcon className="w-4 h-4 text-earth/50" />
              {activePost.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-body text-[13px] text-rust bg-amber/15 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Shop CTA */}
            <div className="mt-12 bg-gradient-to-br from-amber/20 to-soft-peach/30 rounded-3xl p-8 text-center border border-soft-peach/60">
              <h3 className="font-display font-bold text-deep-brown text-2xl mb-2">Taste the difference</h3>
              <p className="font-body text-earth mb-6 max-w-[420px] mx-auto">
                Real ginger, 5-day fermentation, live cultures. Get a bottle of GingerBros and try it for yourself.
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 bg-deep-brown text-cream font-body font-medium px-7 py-3.5 rounded-full hover:bg-rust transition-colors"
              >
                Shop GingerBros <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className="max-w-[1280px] mx-auto px-6 mt-20">
              <h2 className="font-display font-bold text-deep-brown text-2xl mb-6 text-center">
                More from {activePost.category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
}