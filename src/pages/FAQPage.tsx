import { useNavigate } from 'react-router';
import { ArrowLeft, Package, Truck, CreditCard, RotateCcw, HelpCircle } from 'lucide-react';
import SEO from '@/components/SEO';

const FAQS = [
  {
    icon: Package,
    q: 'What is the difference between pasteurized and unpasteurized?',
    a: 'Pasteurized ginger beer is gently heat-treated to stop fermentation, giving it a 6-month shelf life without refrigeration. Unpasteurized is raw and living — it contains active probiotic cultures and must be kept refrigerated. It has a bolder, more complex flavor.',
  },
  {
    icon: Truck,
    q: 'How much is shipping?',
    a: 'We offer flat-rate shipping of ฿50 for orders under ฿500. Orders over ฿500 ship free nationwide within Thailand. Delivery typically takes 2–4 business days depending on your province.',
  },
  {
    icon: CreditCard,
    q: 'What payment methods do you accept?',
    a: 'We accept credit/debit cards via Stripe, PromptPay QR, and Cash on Delivery (COD). For subscriptions, card payment is required.',
  },
  {
    icon: RotateCcw,
    q: 'Can I return or exchange my order?',
    a: 'Due to the perishable nature of our product, we do not accept returns. If your order arrives damaged or incorrect, contact us within 24 hours with photos and we will send a replacement or refund.',
  },
  {
    icon: HelpCircle,
    q: 'How do subscriptions work?',
    a: 'Choose weekly, every 2 weeks, or monthly delivery. You can pause, skip, or cancel anytime from your account. We send a reminder 3 days before each billing date.',
  },
  {
    icon: Package,
    q: 'Do you sell to cafes and restaurants?',
    a: 'Yes! We offer wholesale pricing for B2B customers. Visit our Wholesale page or email us at gingerbros.brew@gmail.com for bulk pricing.',
  },
  {
    icon: Truck,
    q: 'Where do you deliver?',
    a: 'We ship nationwide across Thailand. Unpasteurized ginger beer is currently only available via Grab within Bangkok and surrounding areas due to refrigeration requirements.',
  },
  {
    icon: HelpCircle,
    q: 'How should I store ginger beer?',
    a: 'Pasteurized bottles can be stored at room temperature in a cool, dry place. Unpasteurized must be refrigerated at 2–6°C at all times. Once opened, refrigerate and consume within 3 days.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

export default function FAQPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="FAQ — Ginger Beer Questions Answered | GingerBros"
        description="Answers to common questions about GingerBros craft ginger beer: pasteurized vs unpasteurized, shipping, subscriptions, storage, and wholesale."
        path="/faq"
        jsonLd={[faqSchema]}
      />
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
        <h1 className="font-display font-bold text-deep-brown text-3xl md:text-4xl mb-4 text-center">Frequently Asked Questions</h1>
        <p className="font-body text-earth text-center mb-12">Everything you need to know about GingerBros.</p>

        <div className="space-y-4">
          {FAQS.map((faq, i) => {
            const Icon = faq.icon;
            return (
              <div key={i} className="bg-cream rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-rust" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-deep-brown text-[1.1rem] mb-2">{faq.q}</h3>
                    <p className="font-body text-earth leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="font-body text-earth mb-4">Still have questions?</p>
          <a href="mailto:gingerbros.brew@gmail.com" className="inline-block bg-deep-brown text-cream font-body font-medium px-8 py-3 rounded-full hover:bg-rust transition-colors">
            Email Us
          </a>
        </div>
      </div>
    </div>
  );
}
