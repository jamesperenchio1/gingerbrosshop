import { Store, Truck, BadgeCheck, Mail } from 'lucide-react';
import SEO from '@/components/SEO';

export default function WholesalePage() {
  const benefits = [
    {
      icon: <Store className="w-8 h-8 text-amber" />,
      title: 'Real Retailer Pricing',
      description: 'Wholesale rates for cafes, restaurants, bars, hotels, and retailers. The more you order, the better your margin.',
    },
    {
      icon: <Truck className="w-8 h-8 text-amber" />,
      title: 'Chilled Delivery',
      description: 'Our unpasteurized ginger fizz is shipped chilled with insulated packaging and ice packs to keep cultures alive.',
    },
    {
      icon: <BadgeCheck className="w-8 h-8 text-amber" />,
      title: 'Consistent Quality',
      description: 'Every batch is naturally fermented for 7 days using the same ginger-bug starter, Thai ginger, and raw cane sugar.',
    },
  ];

  const products = [
    { product: 'Unpasteurized Bottles', moq: '24 bottles (1 case)' },
    { product: 'Unpasteurized Cases', moq: '5+ cases' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Wholesale — GingerBros',
    description: 'Wholesale pricing for cafes, restaurants, bars, and retailers. Order chilled unpasteurized ginger fizz in Thailand.',
    url: 'https://gingerbrosshop.com/wholesale',
    mainEntity: {
      '@type': 'Organization',
      name: 'GingerBros',
      url: 'https://gingerbrosshop.com',
    },
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="Wholesale — GingerBros"
        description="Wholesale pricing for cafes, restaurants, bars, and retailers. Order chilled unpasteurized ginger fizz in Thailand."
        path="/wholesale"
        jsonLd={jsonLd}
      />

      <main className="pt-28 pb-20">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
              B2B / TRADE
            </span>
            <h1 className="font-display font-bold text-deep-brown text-[clamp(2rem,4vw,3rem)] mb-4">
              GingerBros Wholesale
            </h1>
            <p className="font-body text-earth text-lg max-w-[600px] mx-auto leading-relaxed">
              Serve Thailand’s best craft ginger fizz at your venue. Premium margins, reliable supply, and a product customers actually remember.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-cream rounded-[20px] p-6">
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="font-display font-semibold text-deep-brown text-[1.1rem] mb-2">
                  {benefit.title}
                </h3>
                <p className="font-body text-[14px] text-earth leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* MOQ Table */}
          <div className="bg-cream rounded-[20px] p-8 md:p-10 mb-12">
            <h2 className="font-display font-semibold text-deep-brown text-[1.35rem] mb-6">
              Wholesale Products & Minimum Order Quantities
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-soft-peach/50">
                    <th className="text-left font-body font-semibold text-[13px] uppercase tracking-[0.08em] text-rust pb-3">Product</th>
                    <th className="text-left font-body font-semibold text-[13px] uppercase tracking-[0.08em] text-rust pb-3">Minimum Order</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((row) => (
                    <tr key={row.product} className="border-b border-soft-peach/30 last:border-0">
                      <td className="font-body text-deep-brown py-4">{row.product}</td>
                      <td className="font-body text-earth py-4">{row.moq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="font-body text-[13px] text-earth/70 mt-4">
              Larger volume pricing and recurring supply contracts are available on request.
            </p>
          </div>

          {/* How to Order */}
          <div className="bg-deep-brown rounded-[20px] p-8 md:p-10 text-cream">
            <h2 className="font-display font-semibold text-[1.35rem] mb-4">
              How to Order
            </h2>
            <p className="font-body text-[15px] text-cream/80 leading-relaxed mb-6">
              Send us a short message with your business name, what you serve, and the volume you are interested in. We will respond with trade pricing and delivery options within 24 hours.
            </p>
            <a
              href="mailto:hello@gingerbrosshop.com?subject=Wholesale%20Inquiry"
              className="inline-flex items-center gap-2 bg-amber text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-8 py-3.5 rounded-full hover:bg-warm-gold transition-colors"
            >
              <Mail className="w-5 h-5" />
              Request Wholesale Quote
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
