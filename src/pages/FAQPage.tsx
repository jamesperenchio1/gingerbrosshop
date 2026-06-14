import { Truck, Package, CreditCard, RefreshCw, Thermometer, HelpCircle } from 'lucide-react';
import SEO from '@/components/SEO';

export default function FAQPage() {
  const FAQS = [
    {
      icon: <Truck className="w-6 h-6 text-amber" />,
      q: 'Where do you deliver?',
      a: 'We deliver across Thailand. Unpasteurized ginger beer is shipped chilled with insulation and ice packs, so it can travel safely to Bangkok, Chiang Mai, Phuket, Korat, and everywhere in between.',
    },
    {
      icon: <Package className="w-6 h-6 text-amber" />,
      q: 'How is my order shipped?',
      a: 'Orders are packed in insulated boxes with ice packs and dispatched Monday–Thursday via our chilled courier partner. You will receive a tracking link by email once your order is on the way.',
    },
    {
      icon: <Thermometer className="w-6 h-6 text-amber" />,
      q: 'How should I store unpasteurized ginger beer?',
      a: 'Unpasteurized ginger beer is raw and alive — keep it refrigerated at 2–6°C at all times. It is best consumed within 30 days of bottling. Natural sediment is normal and safe; gently invert before opening.',
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-amber" />,
      q: 'Do you offer subscriptions?',
      a: 'Yes. You can subscribe to regular deliveries of unpasteurized ginger beer and save on every box. Manage, pause, or cancel anytime from your customer portal.',
    },
    {
      icon: <CreditCard className="w-6 h-6 text-amber" />,
      q: 'What payment methods do you accept?',
      a: 'We accept credit/debit cards, PromptPay, and cash on delivery (COD) for most areas in Thailand. Card and PromptPay payments are processed securely through Stripe.',
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-amber" />,
      q: 'Can I buy GingerBros for my cafe, bar, or restaurant?',
      a: 'Absolutely. We offer wholesale pricing for businesses. Visit our Wholesale page or email hello@gingerbrosshop.com with your venue details and estimated volume.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
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
              Everything you need to know about GingerBros unpasteurized ginger beer.
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
        </div>
      </main>
    </div>
  );
}
