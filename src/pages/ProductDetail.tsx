import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useParams } from 'react-router';
import gsap from 'gsap';
import { useCart } from '@/context/CartContext';
import { PlusIcon, MinusIcon, SnowflakeIcon } from '@/components/Icons';
import SEO from '@/components/SEO';
import NotFound from '@/pages/NotFound';

/* ──────────────────────── Icons ──────────────────────── */

function ArrowLeftIcon2({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ──────────────────────── Product Data ──────────────────────── */

interface ProductData {
  id: string;
  name: string;
  headline: string;
  price: number;
  badge: string;
  badgeColor: string;
  images: string[];
  video?: string;
  description: string;
  longDescription: string;
  ingredients: string[];
  specs: { label: string; value: string }[];
  nutrition: { label: string; value: string }[];
  features: string[];
}

const PRODUCTS: Record<string, ProductData> = {
  unpasteurized: {
    id: 'unpasteurized',
    name: 'Unpasteurized Ginger Fizz',
    headline: 'Raw, living ginger fizz with active cultures. Maximum probiotics, maximum flavor.',
    price: 140,
    badge: 'Chilled Delivery',
    badgeColor: 'bg-sky-500',
    images: [
      '/images/product-unpasteurized-2.jpg',
      '/images/product-unpasteurized.jpg',
    ],
    video: '/images/product-unpasteurized.mp4',
    description: 'Our unpasteurized ginger fizz is the raw, living version — never heated, never filtered. Packed with active probiotic cultures and a bolder, more complex flavor. Must be kept refrigerated.',
    longDescription: 'Our unpasteurized ginger fizz is ginger fizz in its purest form. After 7 days of natural fermentation, we strain and bottle immediately — no heat treatment, no filtering, no intervention. This means every bottle contains billions of live, active probiotic cultures that continue to develop the flavor over time. The taste is bold, complex, and naturally effervescent. Because it is a living product, it must be kept refrigerated and consumed within 30 days of bottling. The natural sediment you may see is normal — it is the live cultures and ginger particles that make this brew so special.',
    ingredients: ['Fresh Ginger', 'Filtered Water', 'Raw Cane Sugar', 'Live Cultures (Ginger Bug)'],
    specs: [
      { label: 'Volume', value: '330ml per bottle' },
      { label: 'Shelf Life', value: '30 days (refrigerated)' },
      { label: 'Storage', value: 'Keep refrigerated at 2-6°C at all times' },
      { label: 'Serving Temp', value: 'Ice cold (2-4°C)' },
      { label: 'Fermentation', value: '7 days natural ferment' },
      { label: 'Pasteurized', value: 'No — raw and living' },
      { label: 'Origin', value: 'Brewed and bottled in Thailand' },
      { label: 'Dietary', value: 'Vegan, Gluten-Free, Raw, No Artificial Additives' },
    ],
    nutrition: [
      { label: 'Serving Size', value: '330ml' },
      { label: 'Energy', value: '98 kcal' },
      { label: 'Total Carbohydrates', value: '23g' },
      { label: '— Sugars', value: '19g' },
      { label: 'Sodium', value: '5mg' },
      { label: 'Vitamin B6', value: '0.4mg (24% DV)' },
      { label: 'Vitamin B12', value: '0.6mcg (25% DV)' },
      { label: 'Active Probiotic CFU', value: '1+ billion per bottle' },
    ],
    features: [
      'Raw and unpasteurized — maximum probiotic content',
      'Living cultures continue to develop flavor in the bottle',
      'Bold, complex, naturally effervescent flavour',
      'Billions of active CFUs per serving',
      'Natural sediment is normal and healthy',
      'Best consumed within 30 days for peak freshness',
    ],
  },
};


/* ──────────────────────── Page Component ──────────────────────── */

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const product = PRODUCTS[id ?? ''];

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'nutrition' | 'specs'>('details');
  const [isGift, setIsGift] = useState(false);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftName, setGiftName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  const heroRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  // Reset per-product UI state when the product changes (render-phase, per React docs).
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setActiveImage(0);
    setQuantity(1);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useLayoutEffect(() => {
    if (!product) return;
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out' });
      gsap.from(infoRef.current, { opacity: 0, y: 20, duration: 0.7, delay: 0.15, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, [id, product]);

  // Keep all hooks above this guard so hook order is stable across renders.
  if (!product) {
    return <NotFound />;
  }

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      variant: 'unpasteurized',
      price: product.price,
      quantity,
      image: product.images[0],
      badge: product.badge,
      badgeColor: product.badgeColor,
      isGift,
      recipientEmail: isGift ? giftEmail : undefined,
      recipientName: isGift ? giftName : undefined,
      giftMessage: isGift ? giftMessage : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((img) => `https://gingerbrosshop.com${img}`),
    brand: { '@type': 'Brand', name: 'GingerBros' },
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `https://gingerbrosshop.com/product/${product.id}`,
      priceCurrency: 'THB',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'GingerBros' },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gingerbrosshop.com/' },
      { '@type': 'ListItem', position: 2, name: product.name, item: `https://gingerbrosshop.com/product/${product.id}` },
    ],
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title={`${product.name} — GingerBros`}
        description={product.description}
        path={`/product/${product.id}`}
        image={`https://gingerbrosshop.com${product.images[0]}`}
        type="product"
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />
      {/* Main Content */}
      <div className="max-w-[1280px] mx-auto px-6 pt-24 md:pt-28 pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Image Gallery */}
          <div ref={heroRef}>
            {/* Main Media */}
            <div className="rounded-[20px] overflow-hidden bg-cream mb-4 h-[400px] md:h-[500px] flex items-center justify-center">
              {product.video && activeImage === product.images.length ? (
                <video
                  src={product.video}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <img
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-amber' : 'border-transparent hover:border-soft-peach'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {product.video && (
                <button
                  onClick={() => setActiveImage(product.images.length)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all relative ${
                    activeImage === product.images.length ? 'border-amber' : 'border-transparent hover:border-soft-peach'
                  }`}
                >
                  <video src={product.video} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 bg-deep-brown/40 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div ref={infoRef}>
            <a
              href="/"
              className="inline-flex items-center gap-2 font-body font-medium text-[13px] text-earth hover:text-deep-brown transition-colors mb-4"
            >
              <ArrowLeftIcon2 />
              Back to Shop
            </a>

            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200/80 font-body font-semibold text-[11px] uppercase tracking-[0.06em] px-3 py-1.5 rounded-full mb-4">
              <SnowflakeIcon className="w-3.5 h-3.5" />
              {product.badge}
            </span>

            {/* Name */}
            <h1 className="font-display font-bold text-deep-brown text-[2rem] md:text-[2.5rem] leading-tight mb-3">
              {product.name}
            </h1>

            {/* Headline */}
            <p className="font-body text-earth text-[15px] leading-relaxed mb-5">
              {product.headline}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-display font-semibold text-deep-brown text-3xl">
                ฿{product.price}
              </span>
            </div>

            {/* Description */}
            <p className="font-body text-earth leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Quantity + Add to Cart */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 border-2 border-soft-peach rounded-full py-2.5 px-5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-earth hover:text-deep-brown transition-colors"
                  >
                    <MinusIcon />
                  </button>
                  <span className="font-body font-medium text-earth min-w-[24px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(24, quantity + 1))}
                    className="text-earth hover:text-deep-brown transition-colors"
                  >
                    <PlusIcon />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className={`font-body font-medium text-sm uppercase tracking-[0.08em] px-10 py-3.5 rounded-full transition-all duration-200 active:scale-[0.98] ${
                    added
                      ? 'bg-accent-green text-white'
                      : 'bg-amber text-deep-brown hover:bg-warm-gold'
                  }`}
                >
                  {added ? 'Added to Cart!' : `Add to Cart — ฿${product.price * quantity}`}
                </button>
              </div>

              {/* Gift Toggle */}
              <div className="mt-5 pt-4 border-t border-soft-peach/50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="w-5 h-5 accent-deep-brown rounded"
                  />
                  <span className="font-body font-medium text-deep-brown text-[14px]">This is a gift 🎁</span>
                </label>
                {isGift && (
                  <div className="mt-3 space-y-3">
                    <input
                      type="text"
                      value={giftName}
                      onChange={(e) => setGiftName(e.target.value)}
                      placeholder="Recipient name"
                      className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
                    />
                    <input
                      type="email"
                      value={giftEmail}
                      onChange={(e) => setGiftEmail(e.target.value)}
                      placeholder="Recipient email"
                      className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
                    />
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Gift message (optional)"
                      rows={3}
                      className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30 resize-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {product.features.slice(0, 4).map((feat) => (
                <div key={feat} className="flex items-start gap-2">
                  <CheckIcon className="text-accent-green flex-shrink-0 mt-0.5" />
                  <span className="font-body text-[14px] text-earth">{feat}</span>
                </div>
              ))}
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <span className="font-body font-semibold text-[12px] uppercase tracking-[0.08em] text-rust mb-2 block">
                Ingredients
              </span>
              <p className="font-body text-[14px] text-earth">
                {product.ingredients.join(', ')}
              </p>
            </div>

          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16 border-t border-soft-peach/50 pt-12">
          {/* Tab Buttons */}
          <div className="flex gap-6 mb-8 border-b border-soft-peach/50">
            {(['details', 'nutrition', 'specs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-body font-medium text-[14px] uppercase tracking-[0.08em] pb-3 transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'text-deep-brown border-amber'
                    : 'text-earth/60 border-transparent hover:text-earth'
                }`}
              >
                {tab === 'details' ? 'Product Details' : tab === 'nutrition' ? 'Nutrition Info' : 'Specifications'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-[800px]">
            {activeTab === 'details' && (
              <div>
                <p className="font-body text-earth leading-relaxed mb-6">
                  {product.longDescription}
                </p>
                <h3 className="font-display font-semibold text-deep-brown text-lg mb-4">
                  Key Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2">
                      <CheckIcon className="text-accent-green flex-shrink-0 mt-0.5" />
                      <span className="font-body text-[14px] text-earth">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="bg-cream/50 rounded-[16px] p-6 md:p-8">
                <h3 className="font-display font-semibold text-deep-brown text-lg mb-2">
                  Nutritional Information
                </h3>
                <p className="font-body text-[13px] text-earth/70 mb-6">
                  Amount per serving. Percent Daily Values are based on a 2,000 calorie diet.
                </p>
                <div className="space-y-0">
                  {product.nutrition.map((item, i) => (
                    <div
                      key={item.label}
                      className={`flex justify-between py-3 ${
                        i < product.nutrition.length - 1 ? 'border-b border-soft-peach/50' : ''
                      }`}
                    >
                      <span className="font-body text-[14px] text-earth">{item.label}</span>
                      <span className="font-body font-medium text-[14px] text-deep-brown">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="font-body text-[12px] text-earth/50 mt-4">
                  * Daily Value (DV) percentages are approximate. Values may vary slightly between batches due to the natural fermentation process.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="bg-cream/50 rounded-[12px] p-4">
                    <span className="font-body font-medium text-[12px] uppercase tracking-[0.08em] text-rust mb-1 block">
                      {spec.label}
                    </span>
                    <span className="font-body text-[14px] text-deep-brown">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
