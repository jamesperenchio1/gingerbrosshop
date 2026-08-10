import type { ReactNode } from 'react';
import { Truck, Package, CreditCard, RefreshCw, Thermometer, HelpCircle, MapPin, FlaskConical, CalendarDays, RotateCcw, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router';
import SEO from '@/components/SEO';

type FAQItem = {
  icon: ReactNode;
  q: string;
  a: ReactNode;
  aText?: string;
};

export default function FAQPage() {
  const FAQS: FAQItem[] = [
    {
      icon: <Truck className="w-6 h-6 text-amber" />,
      q: 'Where do you deliver?',
      a: 'We deliver across Thailand. Orders ship via standard courier by default, with an optional cold-chain upgrade for extra protection. We can reach Bangkok, Chiang Mai, Phuket, Korat, and everywhere in between.'
    },
    {
      icon: <Package className="w-6 h-6 text-amber" />,
      q: 'How is my order shipped?',
      a: 'Orders are packed securely and dispatched Monday–Thursday via our courier partner. You will receive a tracking link by email once your order is on the way. A cold-chain upgrade with insulation and ice packs is available at checkout.'
    },
    {
      icon: <Thermometer className="w-6 h-6 text-amber" />,
      q: 'How should I store GingerBros ginger fizz?',
      a: 'GingerBros ginger fizz is brewed fresh and naturally fermented — keep it refrigerated at 2–6°C at all times. It is best consumed within 30 days of bottling. Natural sediment is normal and safe; gently invert before opening.',
    },
    {
      icon: <FlaskConical className="w-6 h-6 text-amber" />,
      q: 'What are the ingredients?',
      a: 'Fresh Thai ginger, filtered water, erythritol, white sugar (fermentation starter), ginger bug culture, acacia fibre (prebiotic), and fresh lime. No artificial flavours, no preservatives, no colourants. The sugar is mostly consumed during the 5-day fermentation process, which is why the final drink contains less than 2g of sugar per serve.',
    },
    {
      icon: <CalendarDays className="w-6 h-6 text-amber" />,
      q: 'What is the shelf life?',
      a: 'Because we do not pasteurise or add preservatives, GingerBros is a fresh, living product. Keep it refrigerated and consume within 30 days of bottling for the best taste and fizz. The "bottled on" date is printed on every bottle.',
    },
    {
      icon: <MapPin className="w-6 h-6 text-amber" />,
      q: 'Do you offer same-day local delivery?',
      a: 'Yes! If you are in the Bangkok, Pathum Thani, or Rangsit area, we can arrange same-day local delivery via Grab or Lineman. Just message us or note it at checkout and we will organise a nearby drop.'
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-amber" />,
      q: 'Do you offer subscriptions?',
      a: 'Yes. You can subscribe to regular deliveries of GingerBros ginger fizz and save on every box. Choose weekly, every 2 weeks, or monthly. Manage, pause, or cancel anytime from your customer portal.',
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-amber" />,
      q: 'What is your return policy?',
      a: 'Due to the perishable nature of our product, we do not accept returns on opened bottles. However, if your order arrives damaged, spoiled, or incorrect, contact us within 24 hours with photos and we will replace or refund it immediately.',
    },
    {
      icon: <CreditCard className="w-6 h-6 text-amber" />,
      q: 'What payment methods do you accept?',
      a: 'We accept credit/debit cards and PromptPay. Payments are processed securely through Stripe.'
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
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-amber" />,
      q: 'How do I manage my subscription?',
      a: 'You can pause, skip, or cancel your subscription at any time through your customer portal. A link to the portal is sent with every order confirmation email. No cancellation fees, no questions asked.',
    },
    {
      icon: <Package className="w-6 h-6 text-amber" />,
      q: 'What is the difference between single bottles and the 6-pack?',
      a: 'The 6-pack gives you six 330ml bottles at a bundled price — better value than buying six singles. Perfect for households, offices, or anyone who drinks GingerBros regularly.',
    },
    {
      icon: <Truck className="w-6 h-6 text-amber" />,
      q: 'How much is shipping?',
      a: 'Standard shipping is a flat ฿100 nationwide. Free on orders over ฿500. A cold-chain upgrade is available for an additional ฿100.',
    },
    {
      icon: <FlaskConical className="w-6 h-6 text-amber" />,
      q: 'Does ginger fizz contain alcohol?',
      a: 'GingerBros is naturally fermented using a ginger bug culture. The fermentation process produces trace amounts of alcohol, typically well below 0.5% ABV — similar to kombucha or other naturally fermented drinks. It is non-intoxicating.',
    },
  ];

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
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
              SUPPORT
            </span>
            <h1 className="font-display font-bold text-deep-brown text-[clamp(2rem,4vw,3rem)] mb-4">
              Frequently Asked Questions
            </h1>
            <p className="font-body text-earth text-lg">
              Everything you need to know about GingerBros ginger fizz.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group bg-cream rounded-[16px] p-6 cursor-pointer open:bg-cream/80 transition-colors"
              >
                <summary className="flex items-start gap-4 list-none">
                  <div className="flex-shrink-0 mt-0.5">{faq.icon}</div>
                  <h3 className="font-body font-semibold text-deep-brown text-[1.05rem] flex-grow">
                    {faq.q}
                  </h3>
                  <span className="text-rust text-xl leading-none group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="font-body text-earth leading-relaxed mt-4 pl-10">
                  {faq.a}
                </p>
              </details>
            ))}
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
      </main>
    </div>
  );
}
