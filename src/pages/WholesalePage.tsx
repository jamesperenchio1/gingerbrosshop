import { useState } from 'react';
import { Store, Truck, BadgeCheck, Mail, CheckCircle, Package, TrendingDown, Clock, Minus, Plus, Check } from 'lucide-react';
import SEO from '@/components/SEO';
import { trackPixelEvent } from '@/lib/metaPixel';
import { identifyUser } from '@/lib/posthog';

const INPUT =
  'w-full bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/80 focus:outline-none focus:ring-2 focus:ring-amber/40';

const BUSINESS_TYPES = ['Café', 'Restaurant', 'Bar', 'Hotel / Resort', 'Shop / Grocery', 'Gym / Wellness', 'Event / Catering', 'Other'];
const VOLUMES = ['Just trying it', '1–5 cases / month', '5–20 cases / month', '20+ cases / month'];
const MAX_SAMPLES_PER_DRINK = 3;
/** Flat shipping fee for a sample pack, in baht. Samples themselves are free. */
const SAMPLE_SHIPPING_BAHT = 50;

type Drink = 'Ginger Fizz' | 'Ginger Tea · Thai Spice';
const DRINKS: { name: Drink; note: string }[] = [
  { name: 'Ginger Fizz', note: 'Sparkling · fresh ginger + real lime' },
  { name: 'Ginger Tea · Thai Spice', note: 'Still · ginger, lemongrass + spices' },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-[13px] font-body transition-colors border ${
        active ? 'bg-amber text-deep-brown border-amber font-medium' : 'bg-cream/10 text-cream/85 border-cream/30 hover:bg-cream/20'
      }`}
    >
      {children}
    </button>
  );
}

function TickCard({
  checked, onChange, title, desc,
}: { checked: boolean; onChange: (v: boolean) => void; title: string; desc: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex items-start gap-3 text-left rounded-2xl border-2 px-4 py-3.5 transition-colors ${
        checked ? 'border-amber bg-amber/15' : 'border-cream/25 bg-cream/5 hover:border-cream/50'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 ${
          checked ? 'bg-amber border-amber text-deep-brown' : 'border-cream/50'
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span>
        <span className="block font-body text-[15px] font-semibold text-cream">{title}</span>
        <span className="block font-body text-[13px] text-cream/70">{desc}</span>
      </span>
    </button>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Fewer ${label}`}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/15 text-cream hover:bg-cream/25 disabled:opacity-40"
        disabled={value <= 0}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center font-body text-[17px] font-semibold text-cream" aria-live="polite">{value}</span>
      <button
        type="button"
        aria-label={`More ${label}`}
        onClick={() => onChange(Math.min(MAX_SAMPLES_PER_DRINK, value + 1))}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-amber text-deep-brown hover:bg-warm-gold disabled:opacity-40"
        disabled={value >= MAX_SAMPLES_PER_DRINK}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2.5 font-body text-[15px] font-semibold text-cream">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber text-[12px] font-bold text-deep-brown">{n}</span>
      {children}
    </h3>
  );
}

function WholesaleForm() {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('');

  const [wantsQuote, setWantsQuote] = useState(true);
  const [wantsSamples, setWantsSamples] = useState(false);

  // Quote details
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [sixPacks, setSixPacks] = useState(false);
  const [volume, setVolume] = useState('');
  const [coldChain, setColdChain] = useState(false);

  // Sample details
  const [sampleFizz, setSampleFizz] = useState(2);
  const [sampleTea, setSampleTea] = useState(2);
  const [address, setAddress] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const toggleDrink = (d: Drink) => setDrinks((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  const sampleTotal = sampleFizz + sampleTea;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!wantsQuote && !wantsSamples) {
      setError('Tick at least one: a price quote or free samples.');
      return;
    }
    if (wantsSamples && sampleTotal === 0) {
      setError('Choose how many sample bottles you would like.');
      return;
    }
    if (wantsSamples && !address.trim()) {
      setError('Add an address so we know where to send your samples.');
      return;
    }

    const lines: string[] = [];
    lines.push(`Request: ${[wantsQuote && 'Price quote', wantsSamples && 'Free samples'].filter(Boolean).join(' + ')}`);
    if (businessType) lines.push(`Business type: ${businessType}`);
    if (wantsQuote) {
      lines.push('', '— QUOTE —');
      lines.push(`Drinks: ${drinks.join(', ') || 'Not specified'}${sixPacks ? ' (+ interested in retail 6-packs)' : ''}`);
      lines.push(`Volume: ${volume || 'Not specified'}`);
      lines.push(`Delivery: ${coldChain ? 'Cold-chain (insulated, with ice packs)' : 'Standard courier'}`);
    }
    if (wantsSamples) {
      lines.push('', '— SAMPLES —');
      lines.push(`Ginger Fizz: ${sampleFizz} bottle${sampleFizz === 1 ? '' : 's'}`);
      lines.push(`Ginger Tea · Thai Spice: ${sampleTea} bottle${sampleTea === 1 ? '' : 's'}`);
      lines.push(`Total: ${sampleTotal} bottles`);
      lines.push(`Shipping: flat ฿${SAMPLE_SHIPPING_BAHT}, paid by the sender`);
      lines.push(`Send to: ${address.trim()}`);
    }
    if (message.trim()) lines.push('', 'Notes:', message.trim());

    setLoading(true);
    try {
      const res = await fetch('/api/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName, contactName, email, phone,
          wantsQuote, wantsSamples,
          message: lines.join('\n'),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.');
      trackPixelEvent('Lead', { content_name: wantsSamples ? 'wholesale_samples' : 'wholesale_quote' });
      identifyUser(email.trim().toLowerCase(), { email: email.trim().toLowerCase(), business_name: businessName });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send inquiry.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-start gap-3 text-cream">
        <CheckCircle className="mt-0.5 w-6 h-6 text-green-ink flex-shrink-0" />
        <p className="font-body text-[15px] leading-relaxed">
          Thanks, {contactName.split(' ')[0]}! We have your request for <strong>{businessName}</strong>
          {wantsSamples ? ` (including ${sampleTotal} sample bottle${sampleTotal === 1 ? '' : 's'})` : ''} and will reply within 24 hours.
          {wantsSamples ? ` Samples are free; we will confirm how to pay the flat ฿${SAMPLE_SHIPPING_BAHT} shipping before we send them.` : ''}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1 — who */}
      <section>
        <StepTitle n={1}>Who are you?</StepTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="wholesale-business-name" className="sr-only">Business name</label>
            <input id="wholesale-business-name" required autoComplete="organization" value={businessName}
              onChange={(e) => setBusinessName(e.target.value)} placeholder="Business name *" className={INPUT} />
          </div>
          <div>
            <label htmlFor="wholesale-contact-name" className="sr-only">Your name</label>
            <input id="wholesale-contact-name" required autoComplete="name" value={contactName}
              onChange={(e) => setContactName(e.target.value)} placeholder="Your name *" className={INPUT} />
          </div>
          <div>
            <label htmlFor="wholesale-email" className="sr-only">Email</label>
            <input id="wholesale-email" required type="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="Email *" className={INPUT} />
          </div>
          <div>
            <label htmlFor="wholesale-phone" className="sr-only">Phone or LINE</label>
            <input id="wholesale-phone" autoComplete="tel" value={phone}
              onChange={(e) => setPhone(e.target.value)} placeholder="Phone or LINE (optional)" className={INPUT} />
          </div>
        </div>
        <p className="mt-4 mb-2 font-body text-[13px] text-cream/70">What kind of place is it? (optional)</p>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_TYPES.map((b) => (
            <Chip key={b} active={businessType === b} onClick={() => setBusinessType(businessType === b ? '' : b)}>{b}</Chip>
          ))}
        </div>
      </section>

      {/* 2 — what */}
      <section>
        <StepTitle n={2}>What do you need?</StepTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TickCard checked={wantsQuote} onChange={setWantsQuote} title="A price quote" desc="Trade prices for your venue." />
          <TickCard checked={wantsSamples} onChange={setWantsSamples} title="Taste it first (free samples)" desc={`Try the drinks with your team. Up to ${MAX_SAMPLES_PER_DRINK} of each, for a flat ฿${SAMPLE_SHIPPING_BAHT} shipping fee.`} />
        </div>
      </section>

      {/* 3a — samples */}
      {wantsSamples && (
        <section className="rounded-2xl border border-cream/20 bg-cream/5 p-4 sm:p-5">
          <StepTitle n={3}>How many sample bottles?</StepTitle>
          <ul className="divide-y divide-cream/15">
            {[
              { name: 'Ginger Fizz', note: DRINKS[0].note, value: sampleFizz, set: setSampleFizz },
              { name: 'Ginger Tea · Thai Spice', note: DRINKS[1].note, value: sampleTea, set: setSampleTea },
            ].map((d) => (
              <li key={d.name} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                <div>
                  <p className="font-body text-[15px] font-medium text-cream">{d.name}</p>
                  <p className="font-body text-[12px] text-cream/65">{d.note}</p>
                </div>
                <Stepper label={d.name} value={d.value} onChange={d.set} />
              </li>
            ))}
          </ul>
          <p className="mt-2 font-body text-[13px] text-cream/75">
            {sampleTotal === 0 ? 'Pick at least one bottle.' : `${sampleTotal} bottle${sampleTotal === 1 ? '' : 's'} in total (up to ${MAX_SAMPLES_PER_DRINK} of each). Samples are free; shipping is a flat ฿${SAMPLE_SHIPPING_BAHT}.`}
          </p>
          <label htmlFor="wholesale-address" className="mt-4 mb-1.5 block font-body text-[13px] text-cream/70">Where should we send them? *</label>
          <textarea id="wholesale-address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="Venue name, street, district, province, postcode" className={`${INPUT} resize-none`} />
        </section>
      )}

      {/* 3b — quote */}
      {wantsQuote && (
        <section className="rounded-2xl border border-cream/20 bg-cream/5 p-4 sm:p-5">
          <StepTitle n={wantsSamples ? 4 : 3}>Tell us about your quote</StepTitle>
          <p className="mb-2 font-body text-[13px] text-cream/70">Which drinks? Tap all that apply.</p>
          <div className="flex flex-wrap gap-2">
            {DRINKS.map((d) => (
              <Chip key={d.name} active={drinks.includes(d.name)} onClick={() => toggleDrink(d.name)}>{d.name}</Chip>
            ))}
            <Chip active={sixPacks} onClick={() => setSixPacks((v) => !v)}>6-packs for retail shelves</Chip>
          </div>
          <p className="mt-4 mb-2 font-body text-[13px] text-cream/70">Roughly how much per month?</p>
          <div className="flex flex-wrap gap-2">
            {VOLUMES.map((v) => (
              <Chip key={v} active={volume === v} onClick={() => setVolume(volume === v ? '' : v)}>{v}</Chip>
            ))}
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={coldChain} onChange={(e) => setColdChain(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#F2B632]" />
            <span className="font-body text-[14px] text-cream">
              Cold-chain delivery
              <span className="block text-[12px] text-cream/65">Insulated box with ice packs (extra charge). Otherwise standard courier.</span>
            </span>
          </label>
        </section>
      )}

      {/* last — anything else */}
      <section>
        <label htmlFor="wholesale-message" className="mb-2 block font-body text-[13px] text-cream/70">Anything else we should know? (optional)</label>
        <textarea id="wholesale-message" value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Your venue, timing, questions…" rows={3} className={`${INPUT} resize-none`} />
      </section>

      {error && <p role="alert" className="font-body text-[14px] text-amber">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-amber text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-8 py-3.5 rounded-full hover:bg-warm-gold active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-deep-brown/30 border-t-deep-brown rounded-full animate-spin" />
        ) : (
          <Mail className="w-5 h-5" />
        )}
        {loading ? 'Sending…' : wantsQuote && wantsSamples ? 'Send quote + samples request' : wantsSamples ? 'Request free samples' : 'Request my quote'}
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
      description: 'Scheduled wholesale deliveries across Thailand by standard courier, with cold-chain delivery available as an option.',
    },
    {
      icon: <BadgeCheck className="w-8 h-8 text-amber" />,
      title: 'Consistent Quality',
      description: 'Fresh Thai ginger in every bottle. Ginger Fizz with real lime, Ginger Tea slow-simmered with lemongrass and spices.',
    },
    {
      icon: <TrendingDown className="w-8 h-8 text-amber" />,
      title: 'Volume Discounts',
      description: 'Tiered pricing starting at just 1 case. Save more as your volume grows, no long-term contract required.',
    },
    {
      icon: <Package className="w-8 h-8 text-amber" />,
      title: 'Flexible Packaging',
      description: 'Ginger Fizz and Ginger Tea by the case. Mix and match to suit your menu.',
    },
    {
      icon: <Clock className="w-8 h-8 text-amber" />,
      title: 'Fresh Rotation',
      description: 'Every bottle is dated, and we plan deliveries with you so your fridge is always stocked with fresh bottles.',
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
    {
      product: 'Ginger Fizz',
      what: 'Sparkling ginger drink. Fresh Thai ginger, real lime, low sugar. Best served ice cold, or in cocktails and mocktails.',
    },
    {
      product: 'Ginger Tea · Thai Spice',
      what: 'Still, not fizzy. Real ginger slowly simmered with lemongrass, lime and spices. Serve iced or warm.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'GingerBros for Business',
    description: 'Wholesale pricing and the Signature Serve programme for cafés, restaurants, bars and hotels in Thailand.',
    url: 'https://gingerbrosshop.com/business',
    mainEntity: {
      '@type': 'Organization',
      name: 'GingerBros',
      url: 'https://gingerbrosshop.com',
    },
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        route="/business"
        jsonLd={jsonLd}
      />

      <div className="pt-28 pb-20">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
              FOR CAFÉS, BARS, RESTAURANTS &amp; HOTELS
            </span>
            <h1 className="font-poster text-deep-brown text-[clamp(2.6rem,7vw,5rem)] mb-4">
              Put GingerBros on your menu.
            </h1>
            <p className="font-body text-earth text-lg max-w-[600px] mx-auto leading-relaxed">
              Modern ginger drinks your guests haven&apos;t seen before. Great margins, reliable supply, and a drink people ask about by name.
            </p>
            <a
              href="#quote"
              className="mt-6 inline-block rounded-full bg-charcoal px-8 py-4 font-body text-[13px] font-bold uppercase tracking-[0.1em] text-cream hover:bg-deep-brown"
            >
              Request a quote →
            </a>
          </div>

          {/* Signature Serve programme */}
          <div className="bg-charcoal text-cream rounded-[28px] p-8 md:p-10 mb-16">
            <span className="font-body text-[12px] font-bold uppercase tracking-[0.16em] text-ginger">The Signature Serve programme</span>
            <h2 className="font-poster text-[clamp(2rem,5vw,3.2rem)] mt-3 mb-6">Everything you need to sell it.</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Free samples', 'Taste Fizz and Tea with your team before you commit. Up to 3 of each drink. Samples are free; shipping is a flat ฿50.'],
                ['Recipe card', 'Three signature serves your staff can make in seconds.'],
                ['Menu copy', 'Ready-to-use descriptions in Thai and English.'],
                ['Tabletop display', 'A small branded stand so guests notice it.'],
                ['Wholesale pricing', 'Trade rates that get better as you grow.'],
                ['Social collabs', 'We feature our partner venues on our channels.'],
              ].map(([title, desc]) => (
                <li key={title} className="rounded-2xl bg-cream/[0.06] p-5">
                  <h3 className="font-display text-[1.1rem] font-bold text-ginger">{title}</h3>
                  <p className="mt-1 font-body text-[14px] text-cream/85">{desc}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-cream rounded-xxl p-6">
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
          <div className="bg-cream rounded-xxl p-8 md:p-10 mb-12">
            <h2 className="font-display font-semibold text-deep-brown text-[1.35rem] mb-6">
              Volume Pricing Tiers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <div key={tier.name} className="bg-warm-white rounded-2xl p-5 text-center border-2 border-soft-peach/40 hover:border-amber transition-colors">
                  <p className="font-display font-bold text-deep-brown text-lg">{tier.name}</p>
                  <p className="font-body text-rust font-semibold text-[14px] mt-1">{tier.min}</p>
                  <p className="font-body text-green-ink font-semibold text-[13px] mt-0.5">{tier.discount}</p>
                  <p className="font-body text-earth text-[13px] mt-3 leading-relaxed">{tier.description}</p>
                </div>
              ))}
            </div>
            <p className="font-body text-[13px] text-earth/80 mt-6 text-center">
              Exact trade pricing is customised based on your volume, frequency, and location. Request a quote below.
            </p>
          </div>

          {/* Products */}
          <div className="bg-cream rounded-xxl p-8 md:p-10 mb-12">
            <h2 className="font-display font-semibold text-deep-brown text-[1.35rem] mb-2">
              Wholesale Products
            </h2>
            <p className="font-body text-[14px] text-earth mb-6">
              Two drinks. Both come in a 330ml bottle, 24 bottles to a case. Mix and match.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((row) => (
                <div key={row.product} className="bg-warm-white rounded-2xl p-5 border-2 border-soft-peach/40">
                  <p className="font-display font-bold text-deep-brown text-lg">{row.product}</p>
                  <p className="font-body text-rust font-semibold text-[13px] mt-1">330ml bottle · 24 per case</p>
                  <p className="font-body text-earth text-[14px] mt-3 leading-relaxed">{row.what}</p>
                </div>
              ))}
            </div>
            <p className="font-body text-[13px] text-earth/80 mt-5">
              Selling in a shop? Ask for 6-packs (6 × 330ml, 4 packs per case). Same bottles, just packed for shelves.
            </p>
          </div>

          {/* How to Order */}
          <div id="quote" className="scroll-mt-24 bg-deep-brown rounded-xxl p-8 md:p-10 text-cream">
            <h2 className="font-display font-semibold text-[1.35rem] mb-4">
              Request a Quote
            </h2>
            <p className="font-body text-[15px] text-cream/80 leading-relaxed mb-6">
              Tell us about your business and the volume you need. We will respond with custom trade pricing and delivery options within 24 hours.
            </p>
            <WholesaleForm />
          </div>
        </div>
      </div>
    </div>
  );
}
