import { useState } from 'react';
import { Store, Truck, BadgeCheck, Mail, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';

function WholesaleForm() {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, contactName, email, phone, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send inquiry.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-3 text-cream">
        <CheckCircle className="w-6 h-6 text-accent-green flex-shrink-0" />
        <p className="font-body text-[15px]">
          Thanks! We've got your inquiry for <strong>{businessName}</strong> and will reply within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input
        required
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        placeholder="Business name"
        className="bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-amber/40"
      />
      <input
        required
        value={contactName}
        onChange={(e) => setContactName(e.target.value)}
        placeholder="Contact name"
        className="bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-amber/40"
      />
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-amber/40"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone (optional)"
        className="bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-amber/40"
      />
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What you serve, and the volume you're interested in"
        rows={4}
        className="sm:col-span-2 bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-amber/40 resize-none"
      />
      {error && <p className="sm:col-span-2 font-body text-[13px] text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-amber text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-8 py-3.5 rounded-full hover:bg-warm-gold transition-colors disabled:opacity-70"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-deep-brown/30 border-t-deep-brown rounded-full animate-spin" />
        ) : (
          <Mail className="w-5 h-5" />
        )}
        {loading ? 'Sending…' : 'Request Wholesale Quote'}
      </button>
    </form>
  );
}

export default function WholesalePage() {
  const benefits = [
    {
      icon: <Store className="w-8 h-8 text-amber" />,
      title: 'Real Retailer Pricing',
      description: 'Wholesale rates for cafes, restaurants, bars, hotels, and retailers. The more you order, the better your margin.',
    },
    {
      icon: <Truck className="w-8 h-8 text-amber" />,
      title: 'Reliable Delivery',
      description: 'We ship wholesale orders across Thailand with standard or cold-chain options to suit your venue.',
    },
    {
      icon: <BadgeCheck className="w-8 h-8 text-amber" />,
      title: 'Consistent Quality',
      description: 'Every batch is naturally fermented for 7 days using the same ginger-bug starter, Thai ginger, white sugar, and fresh lime.',
    },
  ];

  const products = [
    { product: 'Ginger Fizz Bottles', moq: '24 bottles (1 case)' },
    { product: 'Ginger Fizz Cases', moq: '5+ cases' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Wholesale — GingerBros',
    description: 'Wholesale pricing for cafes, restaurants, bars, and retailers. Order GingerBros ginger fizz in Thailand.',
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
        description="Wholesale pricing for cafes, restaurants, bars, and retailers. Order chilled ginger fizz in Thailand."
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
            <WholesaleForm />
          </div>
        </div>
      </main>
    </div>
  );
}
