import { useState, useMemo, type ReactNode } from 'react';
import {
  Truck, Package, CreditCard, RefreshCw, Thermometer, HelpCircle, MapPin,
  FlaskConical, CalendarDays, RotateCcw, HeartHandshake, ChevronDown,
  Store, Zap, Search
} from 'lucide-react';
import { Link } from 'react-router';
import SEO from '@/components/SEO';

type Category = 'all' | 'shipping' | 'product' | 'orders' | 'subscription' | 'wholesale';

type FAQItem = {
  icon: ReactNode;
  q: string;
  a: ReactNode;
  aText?: string;
  category: Category;
};

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All Questions',
  shipping: 'Shipping & Delivery',
  product: 'Product & Storage',
  orders: 'Orders & Payment',
  subscription: 'Subscriptions',
  wholesale: 'Wholesale',
};

const CATEGORY_ICONS: Record<Category, ReactNode> = {
  all: <Search className="w-4 h-4" />,
  shipping: <Truck className="w-4 h-4" />,
  product: <FlaskConical className="w-4 h-4" />,
  orders: <Package className="w-4 h-4" />,
  subscription: <RefreshCw className="w-4 h-4" />,
  wholesale: <Store className="w-4 h-4" />,
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const FAQS: FAQItem[] = [
    {
      icon: <Truck className="w-6 h-6 text-amber" />,
      q: 'Where do you deliver?',
      a: 'We deliver across Thailand. Orders ship via standard courier by default, with an optional cold-chain upgrade for extra protection. We can reach Bangkok, Chiang Mai, Phuket, Korat, and everywhere in between.',
      category: 'shipping',
    },
    {
      icon: <Package className="w-6 h-6 text-amber" />,
      q: 'How is my order shipped?',
      a: 'Orders are packed securely and dispatched Monday–Thursday via our courier partner. You will receive a tracking link by email once your order is on the way. A cold-chain upgrade with insulation and ice packs is available at checkout.',
      category: 'shipping',
    },
    {
      icon: <Thermometer className="w-6 h-6 text-amber" />,
      q: 'How should I store GingerBros ginger fizz?',
      a: 'GingerBros ginger fizz is brewed fresh and naturally fermented — keep it refrigerated at 2–6°C at all times. It is best consumed within 30 days of bottling. Natural sediment is normal and safe; gently invert before opening.',
      category: 'product',
    },
    {
      icon: <FlaskConical className="w-6 h-6 text-amber" />,
      q: 'What are the ingredients?',
      a: 'Fresh Thai ginger, filtered water, erythritol, white sugar (fermentation starter), ginger bug culture, acacia fibre (prebiotic), and fresh lime. No artificial flavours, no preservatives, no colourants. The sugar is mostly consumed during the natural fermentation process, which is why the final drink contains less than 2g of sugar per serve.',
      category: 'product',
    },
    {
      icon: <CalendarDays className="w-6 h-6 text-amber" />,
      q: 'What is the shelf life?',
      a: 'GingerBros is a fresh, living product. We lightly pasteurise to stabilise the brew while keeping live cultures intact, but no artificial preservatives are added. When stored refrigerated at 2–6°C, GingerBros stays fresh and flavourful for 3–4 months. For the best taste and fizz, we recommend enjoying within 30 days of bottling. The "bottled on" date is printed on every bottle.',
      category: 'product',
    },
    {
      icon: <MapPin className="w-6 h-6 text-amber" />,
      q: 'Do you offer same-day local delivery?',
      a: 'Yes! If you are in the Bangkok, Pathum Thani, or Rangsit area, we can arrange same-day local delivery via Grab or Lineman. Just message us or note it at checkout and we will organise a nearby drop.',
      category: 'shipping',
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-amber" />,
      q: 'Do you offer subscriptions?',
      a: 'Yes. You can subscribe to regular deliveries of GingerBros ginger fizz and save on every box. Choose weekly, every 2 weeks, or monthly. Manage, pause, or cancel anytime from your customer portal.',
      category: 'subscription',
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-amber" />,
      q: 'What is your return policy?',
      a: 'Due to the perishable nature of our product, we do not accept returns on opened bottles. However, if your order arrives damaged, spoiled, or incorrect, contact us within 24 hours with photos and we will replace or refund it immediately.',
      category: 'orders',
    },
    {
      icon: <CreditCard className="w-6 h-6 text-amber" />,
      q: 'What payment methods do you accept?',
      a: 'We accept credit/debit cards and PromptPay. Payments are processed securely through Stripe.',
      category: 'orders',
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-amber" />,
      q: 'Can I buy GingerBros for my cafe, bar, or restaurant?',
      a: (
        <>
          Absolutely. We offer wholesale pricing for businesses. Visit our{' '}
          <Link to="/wholesale" className="text-rust font-semibold underline underline-offset-2 hover:text-amber transition-colors">
            Wholesale page
          </Link>{' '}
          or email{' '}
          <a href="mailto:gingerbros.brew@gmail.com" className="text-rust font-semibold underline underline-offset-2 hover:text-amber transition-colors">
            gingerbros.brew@gmail.com
          </a>{' '}
          with your venue details and estimated volume.
        </>
      ),
      aText: 'Absolutely. We offer wholesale pricing for businesses. Visit our Wholesale page (/wholesale) or email gingerbros.brew@gmail.com with your venue details and estimated volume.',
      category: 'wholesale',
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-amber" />,
      q: 'How do I manage my subscription?',
      a: 'You can pause, skip, or cancel your subscription at any time through your customer portal. A link to the portal is sent with every order confirmation email. No cancellation fees, no questions asked.',
      category: 'subscription',
    },
    {
      icon: <Package className="w-6 h-6 text-amber" />,
      q: 'What is the difference between single bottles and the 6-pack?',
      a: 'The 6-pack gives you six 330ml bottles at a bundled price — better value than buying six singles. Perfect for households, offices, or anyone who drinks GingerBros regularly.',
      category: 'product',
    },
    {
      icon: <Truck className="w-6 h-6 text-amber" />,
      q: 'How much is shipping?',
      a: 'Standard shipping is a flat ฿100 nationwide. Free on orders over ฿500. A cold-chain upgrade is available for an additional ฿100.',
      category: 'shipping',
    },
    {
      icon: <FlaskConical className="w-6 h-6 text-amber" />,
      q: 'Does ginger fizz contain alcohol?',
      a: 'GingerBros is naturally fermented using a ginger bug culture. The fermentation process produces trace amounts of alcohol, typically well below 0.5% ABV — similar to kombucha or other naturally fermented drinks. It is non-intoxicating.',
      category: 'product',
    },
    {
      icon: <Zap className="w-6 h-6 text-amber" />,
      q: 'How do I track my order?',
      a: 'Once your order is dispatched, you will receive an email with a tracking link from our courier partner. You can also visit the My Orders page and enter your order email to see the latest status.',
      category: 'orders',
    },
  ];

  const filteredFaqs = useMemo(() => {
    let items = activeCategory === 'all' ? FAQS : FAQS.filter((f) => f.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((f) => f.q.toLowerCase().includes(q) || (f.aText ?? String(f.a)).toLowerCase().includes(q));
    }
    return items;
  }, [activeCategory, searchQuery]);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.aText ?? f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="Frequently Asked Questions — GingerBros"
        description="Find answers about GingerBros delivery, subscriptions, storage, wholesale, and payments."
        path="/faq"
        jsonLd={faqSchema}
      />
      <main className="pt-28 pb-20">
        <div className="max-w-[1120px] mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
              SUPPORT
            </span>
            <h1 className="font-display font-bold text-deep-brown text-[clamp(2rem,4vw,3rem)] mb-4">
              Frequently Asked Questions
            </h1>
            <p className="font-body text-earth text-lg max-w-[600px] mx-auto">
              Everything you need to know about GingerBros ginger fizz.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-[480px] mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth/50" />
              <label htmlFor="faq-search" className="sr-only">Search questions</label>
              <input
                id="faq-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-3 bg-cream rounded-full font-body text-sm text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-amber/50"
              />
            </div>
          </div>

          {/* Mobile category pills (horizontal scroll) */}
          <div className="lg:hidden mb-8">
            <div role="tablist" className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full font-body text-sm transition-colors ${
                    activeCategory === cat
                      ? 'bg-deep-brown text-cream'
                      : 'bg-cream text-earth hover:bg-cream/80'
                  }`}
                >
                  {CATEGORY_ICONS[cat]}
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-10">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-[260px] flex-shrink-0">
              <div className="sticky top-24 space-y-1">
                <p className="font-body font-semibold text-[13px] uppercase tracking-[0.08em] text-rust mb-3 px-3">
                  Categories
                </p>
                {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-left transition-colors ${
                      activeCategory === cat
                        ? 'bg-deep-brown text-cream'
                        : 'text-earth hover:bg-cream'
                    }`}
                  >
                    {CATEGORY_ICONS[cat]}
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </aside>

            {/* FAQ list */}
            <div className="flex-1 min-w-0">
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <details
                    key={faq.q}
                    className="group bg-cream rounded-2xl p-6 cursor-pointer open:bg-cream/80 transition-colors"
                  >
                    <summary className="flex items-start gap-4 list-none">
                      <div className="flex-shrink-0 mt-0.5">{faq.icon}</div>
                      <h3 className="font-body font-semibold text-deep-brown text-[1.05rem] flex-grow">
                        {faq.q}
                      </h3>
                      <span className="text-rust text-xl leading-none group-open:rotate-180 transition-transform">
                        <ChevronDown className="w-5 h-5" />
                      </span>
                    </summary>
                    <div className="font-body text-earth leading-relaxed mt-4 pl-10">
                      {faq.a}
                    </div>
                  </details>
                ))}
                {filteredFaqs.length === 0 && (
                  <div className="text-center py-12">
                    <p className="font-body text-earth text-lg">No questions found.</p>
                    <button
                      onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                      className="mt-2 text-rust font-body font-medium hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-12 bg-deep-brown rounded-2xl p-8 text-cream text-center">
                <h3 className="font-display font-semibold text-[1.1rem] mb-2">Still have questions?</h3>
                <p className="font-body text-cream/80 text-[14px] mb-4 max-w-[480px] mx-auto">
                  We are happy to help with anything not covered here. Drop us a line and we will get back to you within 24 hours.
                </p>
                <a
                  href="mailto:gingerbros.brew@gmail.com"
                  className="inline-flex items-center gap-2 bg-amber text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-7 py-3 rounded-full hover:bg-warm-gold transition-colors"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
