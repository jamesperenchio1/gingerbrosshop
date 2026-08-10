import { useState } from 'react';
import { Store, Truck, BadgeCheck, Mail, CheckCircle, Package, TrendingDown, Clock } from 'lucide-react';
import SEO from '@/components/SEO';

function WholesaleForm() {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [products, setProducts] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const toggleProduct = (p: string) => {
    setProducts((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName, contactName, email, phone,
          message: `Business type: ${businessType}\nMonthly volume estimate: ${monthlyVolume}\nProducts interested: ${products.join(', ') || 'Not specified'}\n\n${message}`,
        }),
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
          Thanks! We have received your inquiry for <strong>{businessName}</strong> and will reply within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Business name *"
          className="bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-amber/40"
        />
        <input
          required
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="Contact name *"
          className="bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-amber/40"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email *"
          className="bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-amber/40"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          className="bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-amber/40"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          className="bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown focus:outline-none focus:ring-2 focus:ring-amber/40 appearance-none"
        >
          <option value="">Business type (optional)</option>
          <option value="Cafe / Coffee Shop">Cafe / Coffee Shop</option>
          <option value="Restaurant">Restaurant</option>
          <option value="Bar / Pub">Bar / Pub</option>
          <option value="Hotel / Resort">Hotel / Resort</option>
          <option value="Gym / Wellness">Gym / Wellness</option>
          <option value="Retail / Grocery">Retail / Grocery</option>
          <option value="Office / Corporate">Office / Corporate</option>
          <option value="Event / Catering">Event / Catering</option>
          <option value="Other">Other</option>
        </select>
        <select
          value={monthlyVolume}
          onChange={(e) => setMonthlyVolume(e.target.value)}
          className="bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown focus:outline-none focus:ring-2 focus:ring-amber/40 appearance-none"
        >
          <option value="">Monthly volume (optional)</option>
          <option value="1–5 cases">1–5 cases</option>
          <option value="5–20 cases">5–20 cases</option>
          <option value="20–50 cases">20–50 cases</option>
          <option value="50+ cases">50+ cases</option>
        </select>
      </div>

      <div>
        <p className="font-body text-[13px] text-cream/70 mb-2">Products you are interested in:</p>
        <div className="flex flex-wrap gap-2">
          {['Ginger Fizz Single Bottles', 'Ginger Fizz 6-Pack', 'Both'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggleProduct(p)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-body transition-colors border ${
                products.includes(p)
                  ? 'bg-amber text-deep-brown border-amber'
                  : 'bg-cream/20 text-cream/80 border-cream/30 hover:bg-cream/30'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tell us about your venue, estimated volume, and any specific requirements"
        rows={4}
        className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-amber/40 resize-none"
      />
      {error && <p className="font-body text-[13px] text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-amber text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-8 py-3.5 rounded-full hover:bg-warm-gold transition-colors disabled:opacity-70"
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
      title: 'Real Trade Pricing',
      description: 'Competitive wholesale margins for cafes, restaurants, bars, hotels, gyms, and retailers. The more you commit, the better your rate.',
    },
    {
      icon: <Truck className="w-8 h-8 text-amber" />,
      title: 'Reliable Delivery',
      description: 'Scheduled wholesale deliveries across Thailand. Standard or cold-chain options to keep every bottle fresh.',
    },
    {
      icon: <BadgeCheck className="w-8 h-8 text-amber" />,
      title: 'Consistent Quality',
      description: 'Every batch is naturally fermented for 5 days using fresh Thai ginger, real lime, and prebiotic acacia fibre.',
    },
    {
      icon: <TrendingDown className="w-8 h-8 text-amber" />,
      title: 'Volume Discounts',
      description: 'Tiered pricing starting at just 1 case. Save more as your volume grows — no long-term contract required.',
    },
    {
      icon: <Package className="w-8 h-8 text-amber" />,
      title: 'Flexible Packaging',
      description: 'Order single bottles (24 per case) or 6-packs (4 per case). Mix and match to suit your venue.',
    },
    {
      icon: <Clock className="w-8 h-8 text-amber" />,
      title: 'Fresh Rotation',
      description: 'We date every batch and work with you on rotation so your stock is always fresh. 30-day shelf life when refrigerated.',
    },
  ];

  const tiers = [
    {
      name: 'Starter',
      min: '1 case',
      discount: 'Trade rate',
      description: 'Perfect for small cafes and trial placements.',
    },
    {
      name: 'Regular',
      min: '5+ cases',
      discount: 'Volume pricing',
      description: 'Best for established venues with steady demand.',
    },
    {
      name: 'Partner',
      min: '20+ cases',
      discount: 'Partner rates',
      description: 'For chains, hotels, and high-volume accounts.',
    },
  ];

  const products = [
    { product: 'Ginger Fizz Single Bottle', unit: '330ml', caseQty: '24 bottles', sku: 'GB-GF-330' },
    { product: 'Ginger Fizz 6-Pack', unit: '6 × 330ml', caseQty: '4 packs (24 bottles)', sku: 'GB-GF-6PK' },
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
        description="Wholesale pricing for cafes, restaurants, bars, and retailers. Order GingerBros craft ginger fizz in Thailand."
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
              Serve Thailand&apos;s best craft ginger fizz at your venue. Premium margins, reliable supply, and a product customers actually remember.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
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

          {/* Volume Tiers */}
          <div className="bg-cream rounded-[20px] p-8 md:p-10 mb-12">
            <h2 className="font-display font-semibold text-deep-brown text-[1.35rem] mb-6">
              Volume Pricing Tiers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <div key={tier.name} className="bg-warm-white rounded-2xl p-5 text-center border-2 border-soft-peach/40 hover:border-amber transition-colors">
                  <p className="font-display font-bold text-deep-brown text-lg">{tier.name}</p>
                  <p className="font-body text-rust font-semibold text-[14px] mt-1">{tier.min}</p>
                  <p className="font-body text-accent-green font-semibold text-[13px] mt-0.5">{tier.discount}</p>
                  <p className="font-body text-earth text-[13px] mt-3 leading-relaxed">{tier.description}</p>
                </div>
              ))}
            </div>
            <p className="font-body text-[13px] text-earth/70 mt-6 text-center">
              Exact trade pricing is customised based on your volume, frequency, and location. Request a quote below.
            </p>
          </div>

          {/* Products Table */}
          <div className="bg-cream rounded-[20px] p-8 md:p-10 mb-12">
            <h2 className="font-display font-semibold text-deep-brown text-[1.35rem] mb-6">
              Wholesale Products
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-soft-peach/50">
                    <th className="text-left font-body font-semibold text-[13px] uppercase tracking-[0.08em] text-rust pb-3">Product</th>
                    <th className="text-left font-body font-semibold text-[13px] uppercase tracking-[0.08em] text-rust pb-3">Unit</th>
                    <th className="text-left font-body font-semibold text-[13px] uppercase tracking-[0.08em] text-rust pb-3">Case Qty</th>
                    <th className="text-left font-body font-semibold text-[13px] uppercase tracking-[0.08em] text-rust pb-3">SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((row) => (
                    <tr key={row.sku} className="border-b border-soft-peach/30 last:border-0">
                      <td className="font-body text-deep-brown py-4">{row.product}</td>
                      <td className="font-body text-earth py-4">{row.unit}</td>
                      <td className="font-body text-earth py-4">{row.caseQty}</td>
                      <td className="font-body text-earth/70 py-4 font-mono text-[13px]">{row.sku}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Order */}
          <div className="bg-deep-brown rounded-[20px] p-8 md:p-10 text-cream">
            <h2 className="font-display font-semibold text-[1.35rem] mb-4">
              Request a Quote
            </h2>
            <p className="font-body text-[15px] text-cream/80 leading-relaxed mb-6">
              Tell us about your business and the volume you need. We will respond with custom trade pricing and delivery options within 24 hours.
            </p>
            <WholesaleForm />
          </div>
        </div>
      </main>
    </div>
  );
}
