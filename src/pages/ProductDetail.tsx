import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import gsap from 'gsap';
import { useCart } from '@/context/CartContext';
import { PlusIcon, MinusIcon, StarIcon } from '@/components/Icons';

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
  originalPrice?: number;
  badge: string;
  badgeColor: string;
  images: string[];
  description: string;
  longDescription: string;
  ingredients: string[];
  specs: { label: string; value: string }[];
  nutrition: { label: string; value: string }[];
  features: string[];
  addable: boolean;
  variant: 'pasteurized' | 'unpasteurized';
  isBundle?: boolean;
  bundleSize?: number;
  subscription?: {
    options: Array<{
      id: string;
      price: number;
      interval: string;
      intervalLabel: string;
      savingsLabel: string;
    }>;
  };
}

const PRODUCTS: Record<string, ProductData> = {
  pasteurized: {
    id: 'pasteurized',
    name: 'Pasteurized Ginger Beer',
    headline: 'Our signature craft ginger beer — spicy, refreshing, and shelf-stable.',
    price: 120,
    badge: 'AVAILABLE EVERYWHERE',
    badgeColor: 'bg-accent-green',
    images: [
      '/images/product-pasteurized.png',
      '/images/product-detail-1.jpg',
      '/images/product-detail-2.jpg',
      '/images/product-detail-3.jpg',
    ],
    description: 'The original GingerBros pasteurized ginger beer. Naturally brewed over 7 days, then gently pasteurized to lock in the flavor and extend shelf life without preservatives. Same bold ginger taste, longer lasting. Perfect for home, bars, and restaurants.',
    longDescription: 'Every bottle starts with fresh Thai ginger, grated by hand and combined with filtered water, raw cane sugar, and our proprietary ginger bug (a symbiotic culture of wild yeast and beneficial bacteria). Over 7 days of natural fermentation, the brew develops its signature effervescence, complex flavor profile, and beneficial compounds from ginger. After fermentation, we gently pasteurize the brew to halt fermentation while preserving the taste, then bottle it immediately to capture the carbonation. The result is a ginger beer that stays fresh for months without refrigeration — while still delivering that authentic, fiery ginger kick you expect from a craft brew.',
    ingredients: ['Fresh Ginger', 'Filtered Water', 'Raw Cane Sugar', 'Live Cultures (Ginger Bug)'],
    specs: [
      { label: 'Volume', value: '330ml per bottle' },
      { label: 'Shelf Life', value: '6 months from bottling date' },
      { label: 'Storage', value: 'Cool, dry place. Refrigerate after opening.' },
      { label: 'Serving Temp', value: 'Chilled (4-6°C)' },
      { label: 'Fermentation', value: '7 days natural ferment' },
      { label: 'Pasteurized', value: 'Yes — gently heat-treated' },
      { label: 'Origin', value: 'Brewed and bottled in Thailand' },
      { label: 'Dietary', value: 'Vegan, Gluten-Free, No Artificial Additives' },
    ],
    nutrition: [
      { label: 'Serving Size', value: '330ml' },
      { label: 'Energy', value: '95 kcal' },
      { label: 'Total Carbohydrates', value: '22g' },
      { label: '— Sugars', value: '18g' },
      { label: 'Sodium', value: '5mg' },
      { label: 'Vitamin B6', value: '0.3mg (18% DV)' },
      { label: 'Vitamin B12', value: '0.5mcg (21% DV)' },
      { label: 'Ginger Compounds', value: 'Naturally present' },
    ],
    features: [
      '7-day natural fermentation for complex flavor',
      'Ginger provides natural prebiotic compounds',
      'Low sugar compared to commercial sodas',
      'Naturally carbonated — no forced CO2',
      'Shelf-stable for 6 months without refrigeration',
      'Made with fresh Thai ginger — not extract',
    ],
    addable: true,
    variant: 'pasteurized',
    subscription: {
      options: [
        { id: 'pasteurized-sub-week', price: 114, interval: 'week', intervalLabel: 'weekly', savingsLabel: 'Save 5%' },
        { id: 'pasteurized-sub-2week', price: 110, interval: 'week', intervalLabel: 'every 2 weeks', savingsLabel: 'Save 8%' },
        { id: 'pasteurized-sub-month', price: 108, interval: 'month', intervalLabel: 'monthly', savingsLabel: 'Save 10%' },
      ],
    },
  },
  'pasteurized-6pack': {
    id: 'pasteurized-6pack',
    name: '6-Pack Pasteurized Bundle',
    headline: 'Stock up and save. Six bottles of craft ginger beer at a better price.',
    price: 650,
    originalPrice: 720,
    badge: 'BEST VALUE — SAVE ฿70',
    badgeColor: 'bg-amber',
    images: [
      '/images/bundle-6pack.jpg',
      '/images/product-pasteurized.png',
      '/images/product-detail-3.jpg',
    ],
    description: 'Six bottles of our signature pasteurized ginger beer in one convenient bundle. Perfect for gatherings, weekly stocking, or gifting to fellow ginger beer lovers.',
    longDescription: 'Our 6-pack bundle gives you six 330ml bottles of our pasteurized ginger beer at a discounted price. Each bottle is individually capped and labeled, making them easy to share or store. Whether you are hosting a dinner party, stocking your fridge for the week, or sending a gift to a craft beverage enthusiast, this bundle offers the best value per bottle. The pasteurized variant means you can store these at room temperature for up to 6 months — no rush to finish them.',
    ingredients: ['Fresh Ginger', 'Filtered Water', 'Raw Cane Sugar', 'Live Cultures (Ginger Bug)'],
    specs: [
      { label: 'Contents', value: '6 x 330ml bottles' },
      { label: 'Total Volume', value: '1,980ml' },
      { label: 'Shelf Life', value: '6 months from bottling date' },
      { label: 'Storage', value: 'Cool, dry place' },
      { label: 'Packaging', value: 'Recyclable cardboard carrier' },
      { label: 'Savings', value: '฿70 off individual pricing' },
      { label: 'Origin', value: 'Brewed and bottled in Thailand' },
      { label: 'Dietary', value: 'Vegan, Gluten-Free' },
    ],
    nutrition: [
      { label: 'Serving Size', value: '330ml (per bottle)' },
      { label: 'Servings Per Bundle', value: '6' },
      { label: 'Energy (per bottle)', value: '95 kcal' },
      { label: 'Total Sugars (per bottle)', value: '18g' },
      { label: 'Probiotic Cultures', value: 'Present' },
    ],
    features: [
      'Save ฿70 compared to buying individually',
      'Perfect for parties, events, or weekly fridge stocking',
      'Individually sealed — share or save for later',
      'Shelf-stable for 6 months',
      'Eco-friendly recyclable packaging',
      'Includes free shipping within Thailand',
    ],
    addable: true,
    variant: 'pasteurized',
    isBundle: true,
    bundleSize: 6,
    subscription: {
      options: [
        { id: 'pasteurized-6pack-sub-week', price: 618, interval: 'week', intervalLabel: 'weekly', savingsLabel: 'Save ฿32/wk' },
        { id: 'pasteurized-6pack-sub-2week', price: 598, interval: 'week', intervalLabel: 'every 2 weeks', savingsLabel: 'Save ฿52/2wk' },
        { id: 'pasteurized-6pack-sub-month', price: 585, interval: 'month', intervalLabel: 'monthly', savingsLabel: 'Save ฿65/mo' },
      ],
    },
  },
  unpasteurized: {
    id: 'unpasteurized',
    name: 'Unpasteurized Ginger Beer',
    headline: 'Raw, living ginger beer with active cultures. Maximum probiotics, maximum flavor.',
    price: 140,
    badge: 'GRAB EXCLUSIVE',
    badgeColor: 'bg-grab-green',
    images: [
      '/images/product-unpasteurized.png',
      '/images/product-detail-1.jpg',
      '/images/product-detail-2.jpg',
    ],
    description: 'Our unpasteurized ginger beer is the raw, living version — never heated, never filtered. Packed with active probiotic cultures and a bolder, more complex flavor. Must be kept refrigerated.',
    longDescription: 'The unpasteurized variant is ginger beer in its purest form. After 7 days of natural fermentation, we strain and bottle immediately — no heat treatment, no filtering, no intervention. This means every bottle contains billions of live, active probiotic cultures that continue to develop the flavor over time. The taste is bolder, more complex, and slightly more effervescent than the pasteurized version. Because it is a living product, it must be kept refrigerated and consumed within 30 days of bottling. The natural sediment you may see is normal — it is the live cultures and ginger particles that make this brew so special.',
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
      'Bolder, more complex taste than pasteurized version',
      'Billions of active CFUs per serving',
      'Natural sediment is normal and healthy',
      'Best consumed within 30 days for peak freshness',
    ],
    addable: false,
    variant: 'unpasteurized',
  },
};

/* ──────────────────────── Related Products ──────────────────────── */

const RELATED = [
  { id: 'pasteurized', name: 'Pasteurized — Single', price: 120, image: '/images/product-pasteurized.png', badge: 'POPULAR', badgeColor: 'bg-accent-green' },
  { id: 'pasteurized-6pack', name: '6-Pack Bundle', price: 650, image: '/images/bundle-6pack.jpg', badge: 'SAVE ฿70', badgeColor: 'bg-amber' },
  { id: 'unpasteurized', name: 'Unpasteurized', price: 140, image: '/images/product-unpasteurized.png', badge: 'GRAB ONLY', badgeColor: 'bg-grab-green' },
];

/* ──────────────────────── Page Component ──────────────────────── */

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const product = PRODUCTS[id ?? ''] ?? PRODUCTS['pasteurized'];
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'nutrition' | 'specs'>('details');

  const heroRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0);
    setQuantity(1);
  }, [id]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(heroRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      gsap.to(infoRef.current, { opacity: 1, y: 0, duration: 0.7, delay: 0.15, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, [id]);

  const [subIndex, setSubIndex] = useState<number | null>(null);
  const [isGift, setIsGift] = useState(false);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftName, setGiftName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  const handleAdd = () => {
    if (!product.addable) return;
    const sub = subIndex !== null && product.subscription ? product.subscription.options[subIndex] : undefined;
    addItem({
      id: sub ? sub.id : product.id,
      name: sub ? `${product.name} (${sub.intervalLabel})` : product.name,
      variant: product.variant,
      price: sub ? sub.price : product.price,
      quantity,
      image: product.images[0],
      badge: sub ? 'SUBSCRIPTION' : product.badge,
      badgeColor: sub ? 'bg-rust' : product.badgeColor,
      isSubscription: !!sub,
      interval: sub ? sub.intervalLabel : undefined,
      isGift,
      recipientEmail: isGift ? giftEmail : undefined,
      recipientName: isGift ? giftName : undefined,
      giftMessage: isGift ? giftMessage : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  const handleRelatedClick = (relatedId: string) => {
    if (relatedId === 'unpasteurized') {
      navigate('/product/unpasteurized');
    } else {
      navigate(`/product/${relatedId}`);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-warm-white/95 backdrop-blur-xl border-b border-soft-peach/50">
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-body font-medium text-sm text-earth hover:text-deep-brown transition-colors"
          >
            <ArrowLeftIcon2 />
            Back to Shop
          </button>
          <span className="font-display font-bold text-lg text-deep-brown">GingerBros</span>
          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1280px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Image Gallery */}
          <div ref={heroRef} className="opacity-0 translate-y-[20px]">
            {/* Main Image */}
            <div className="rounded-[20px] overflow-hidden bg-cream mb-4 h-[400px] md:h-[500px] flex items-center justify-center">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
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
            </div>
          </div>

          {/* Right: Product Info */}
          <div ref={infoRef} className="opacity-0 translate-y-[20px]">
            {/* Badge */}
            <span className={`inline-block ${product.badgeColor} text-white font-body font-semibold text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full mb-4`}>
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

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="text-amber w-4 h-4" filled />
                ))}
              </div>
              <span className="font-body font-medium text-[13px] text-earth">4.9 (127 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-display font-semibold text-deep-brown text-3xl">
                ฿{product.price}
              </span>
              {product.originalPrice && (
                <span className="font-body font-medium text-[15px] text-earth/50 line-through">
                  ฿{product.originalPrice}
                </span>
              )}
              {product.isBundle && (
                <span className="font-body font-semibold text-[13px] text-accent-green">
                  Save ฿{product.originalPrice! - product.price}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="font-body text-earth leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Quantity + Add to Cart */}
            {product.addable ? (
              <div className="mb-8">
                {product.subscription && (
                  <div className="mb-4">
                    <p className="font-body font-semibold text-[12px] uppercase tracking-wider text-deep-brown mb-2">
                      Delivery Frequency
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSubIndex(null)}
                        className={`font-body font-medium text-[13px] px-4 py-2 rounded-full transition-all border ${
                          subIndex === null
                            ? 'bg-deep-brown text-cream border-deep-brown'
                            : 'bg-cream text-earth border-soft-peach hover:border-deep-brown'
                        }`}
                      >
                        One-time — ฿{product.price}
                      </button>
                      {product.subscription.options.map((opt, idx) => (
                        <button
                          key={opt.id}
                          onClick={() => setSubIndex(idx)}
                          className={`font-body font-medium text-[13px] px-4 py-2 rounded-full transition-all border ${
                            subIndex === idx
                              ? 'bg-deep-brown text-cream border-deep-brown'
                              : 'bg-cream text-earth border-soft-peach hover:border-deep-brown'
                          }`}
                        >
                          {opt.intervalLabel} — ฿{opt.price}
                          <span className="ml-1.5 text-[11px] text-accent-green">{opt.savingsLabel}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                        : subIndex !== null
                        ? 'bg-deep-brown text-cream hover:bg-rust'
                        : 'bg-amber text-deep-brown hover:bg-warm-gold'
                    }`}
                  >
                    {added
                      ? 'Added to Cart!'
                      : subIndex !== null && product.subscription
                      ? `Subscribe — ฿${product.subscription.options[subIndex].price * quantity}/${product.subscription.options[subIndex].intervalLabel}`
                      : `Add to Cart — ฿${product.price * quantity}`}
                  </button>
                </div>

                {subIndex !== null && product.subscription && (
                  <p className="font-body text-[13px] text-accent-green mt-2">
                    {product.subscription.options[subIndex].savingsLabel} — billed {product.subscription.options[subIndex].intervalLabel}, cancel anytime.
                  </p>
                )}

                {/* Gift Toggle */}
                {product.addable && (
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
                )}
              </div>
            ) : (
              <div className="mb-8">
                <button
                  disabled
                  className="w-full sm:w-auto font-body font-medium text-sm uppercase tracking-[0.08em] px-10 py-3.5 rounded-full bg-soft-peach text-earth/50 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  Available on Grab Only
                </button>
                <a
                  href="https://www.grab.com/th/en/food/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 font-body font-medium text-[14px] text-grab-green hover:underline"
                >
                  Order on Grab instead
                </a>
              </div>
            )}

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

            {/* Cross-sell: 6-Pack on single bottle page */}
            {product.id === 'pasteurized' && (
              <button
                onClick={() => navigate('/product/pasteurized-6pack')}
                className="w-full bg-cream border-2 border-amber/40 rounded-[16px] p-4 flex items-center gap-4 hover:border-amber hover:bg-amber/10 transition-all text-left"
              >
                <img
                  src="/images/bundle-6pack.jpg"
                  alt="6-Pack Bundle"
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-display font-semibold text-deep-brown text-[15px] block">
                    6-Pack Bundle
                  </span>
                  <span className="font-body text-[13px] text-earth">
                    6 bottles for ฿650 — Save ฿70 vs. buying singles
                  </span>
                </div>
                <span className="font-body font-semibold text-sm text-accent-green flex-shrink-0 bg-accent-green/10 px-3 py-1 rounded-full">
                  Save ฿70
                </span>
              </button>
            )}
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

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="font-display font-semibold text-deep-brown text-2xl mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {RELATED.filter((r) => r.id !== product.id).map((item) => (
              <button
                key={item.id}
                onClick={() => handleRelatedClick(item.id)}
                className="text-left bg-cream rounded-[20px] p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="h-[160px] flex items-center justify-center mb-4">
                  <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                </div>
                <span className={`inline-block ${item.badgeColor} text-white font-body font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full mb-2`}>
                  {item.badge}
                </span>
                <h4 className="font-display font-semibold text-deep-brown text-[1rem] mb-1">{item.name}</h4>
                <span className="font-display font-semibold text-rust">฿{item.price}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
