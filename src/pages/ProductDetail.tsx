import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import gsap from 'gsap';
import { useCart } from '@/context/CartContext';
import { PlusIcon, MinusIcon, SnowflakeIcon } from '@/components/Icons';
import SEO from '@/components/SEO';
import NotFound from '@/pages/NotFound';
import { useCatalog, defaultPrice, intervalLabel, type CatalogPrice } from '@/lib/catalog';
import { getProductContent } from '@/lib/productContent';

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

/* ──────────────────────── Page Component ──────────────────────── */

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { products, loading } = useCatalog();

  const product = products.find((p) => p.id === id);
  const content = getProductContent(id);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'nutrition' | 'specs'>('details');
  const [isGift, setIsGift] = useState(false);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftName, setGiftName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  // Reset per-product UI state when the product changes (render-phase, per React docs).
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setActiveImage(0);
    setQuantity(1);
    setSelectedPriceId(null);
  }

  const images = product?.images ?? [];
  const video = content.video;

  const selectedPrice: CatalogPrice | undefined = useMemo(() => {
    if (!product) return undefined;
    return product.prices.find((p) => p.priceId === selectedPriceId) ?? defaultPrice(product);
  }, [product, selectedPriceId]);

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

  // Keep all hooks above these guards so hook order is stable across renders.
  if (loading && !product) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <p className="font-body text-earth">Loading…</p>
      </div>
    );
  }

  if (!product || !selectedPrice) {
    return <NotFound />;
  }

  const lineTotal = (selectedPrice.unitAmount ?? 0) * quantity;

  const handleAdd = () => {
    addItem({
      id: selectedPrice.priceId,
      priceId: selectedPrice.priceId,
      productId: product.id,
      name: product.name,
      variant: product.id,
      price: selectedPrice.unitAmount ?? 0,
      quantity,
      image: images[0] ?? '',
      badge: product.badge ?? '',
      badgeColor: product.badgeColor ?? 'bg-sky-500',
      isSubscription: !!selectedPrice.recurring,
      interval: selectedPrice.recurring ? intervalLabel(selectedPrice.recurring) : undefined,
      isGift,
      recipientEmail: isGift ? giftEmail : undefined,
      recipientName: isGift ? giftName : undefined,
      giftMessage: isGift ? giftMessage : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  const hasNutrition = (content.nutrition?.length ?? 0) > 0;
  const hasSpecs = (content.specs?.length ?? 0) > 0;
  const hasFeatures = (content.features?.length ?? 0) > 0;
  const showTabs = !!content.longDescription || hasFeatures || hasNutrition || hasSpecs;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? '',
    image: images,
    brand: { '@type': 'Brand', name: 'GingerBros' },
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `https://gingerbrosshop.com/product/${product.id}`,
      priceCurrency: (selectedPrice.currency ?? 'thb').toUpperCase(),
      price: selectedPrice.unitAmount ?? 0,
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
        description={product.description ?? ''}
        path={`/product/${product.id}`}
        image={images[0] ?? ''}
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
              {video && activeImage === images.length ? (
                <video
                  src={video}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <img
                  src={images[activeImage] ?? images[0]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
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
              {video && (
                <button
                  onClick={() => setActiveImage(images.length)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all relative ${
                    activeImage === images.length ? 'border-amber' : 'border-transparent hover:border-soft-peach'
                  }`}
                >
                  <video src={video} className="w-full h-full object-cover" muted />
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
            {product.badge && (
              <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200/80 font-body font-semibold text-[11px] uppercase tracking-[0.06em] px-3 py-1.5 rounded-full mb-4">
                <SnowflakeIcon className="w-3.5 h-3.5" />
                {product.badge}
              </span>
            )}

            {/* Name */}
            <h1 className="font-display font-bold text-deep-brown text-[2rem] md:text-[2.5rem] leading-tight mb-3">
              {product.name}
            </h1>

            {/* Headline */}
            {content.headline && (
              <p className="font-body text-earth text-[15px] leading-relaxed mb-5">
                {content.headline}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display font-semibold text-deep-brown text-3xl">
                ฿{selectedPrice.unitAmount}
              </span>
              {selectedPrice.recurring && (
                <span className="font-body font-medium text-[15px] text-rust">
                  {intervalLabel(selectedPrice.recurring)}
                </span>
              )}
            </div>

            {/* Purchase options (one-time + subscriptions) */}
            {product.prices.length > 1 && (
              <div className="mb-8">
                <span className="font-body font-semibold text-[12px] uppercase tracking-[0.08em] text-rust mb-2 block">
                  Purchase Options
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.prices.map((p) => {
                    const isActive = p.priceId === selectedPrice.priceId;
                    const label = p.recurring ? intervalLabel(p.recurring) : 'One-time';
                    return (
                      <button
                        key={p.priceId}
                        onClick={() => setSelectedPriceId(p.priceId)}
                        className={`flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                          isActive ? 'border-amber bg-amber/10' : 'border-soft-peach hover:border-soft-peach/80'
                        }`}
                      >
                        <span className="font-body font-medium text-[14px] text-deep-brown capitalize">{label}</span>
                        <span className="font-body font-semibold text-[14px] text-deep-brown">฿{p.unitAmount}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedPrice.recurring && (
                  <p className="font-body text-[12px] text-earth/70 mt-2">
                    Billed {intervalLabel(selectedPrice.recurring)}. Pause, skip, or cancel anytime.
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="font-body text-earth leading-relaxed mb-8">
                {product.description}
              </p>
            )}

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
                  {added ? 'Added to Cart!' : `Add to Cart — ฿${lineTotal}`}
                </button>
              </div>

              {/* Gift Toggle */}
              <div className="mt-5 pt-4 border-t border-soft-peach/50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    data-testid="gift-toggle"
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
                      data-testid="gift-name"
                      className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
                    />
                    <input
                      type="email"
                      value={giftEmail}
                      onChange={(e) => setGiftEmail(e.target.value)}
                      placeholder="Recipient email"
                      data-testid="gift-email"
                      className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
                    />
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Gift message (optional)"
                      rows={3}
                      data-testid="gift-message"
                      className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30 resize-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Features */}
            {hasFeatures && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {content.features!.slice(0, 4).map((feat) => (
                  <div key={feat} className="flex items-start gap-2">
                    <CheckIcon className="text-accent-green flex-shrink-0 mt-0.5" />
                    <span className="font-body text-[14px] text-earth">{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Ingredients */}
            {(content.ingredients?.length ?? 0) > 0 && (
              <div className="mb-6">
                <span className="font-body font-semibold text-[12px] uppercase tracking-[0.08em] text-rust mb-2 block">
                  Ingredients
                </span>
                <p className="font-body text-[14px] text-earth">
                  {content.ingredients!.join(', ')}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Tabs Section */}
        {showTabs && (
          <div className="mt-16 border-t border-soft-peach/50 pt-12">
            {/* Tab Buttons */}
            <div className="flex gap-6 mb-8 border-b border-soft-peach/50">
              {(['details', 'nutrition', 'specs'] as const)
                .filter((tab) =>
                  tab === 'details'
                    ? !!content.longDescription || hasFeatures
                    : tab === 'nutrition'
                    ? hasNutrition
                    : hasSpecs
                )
                .map((tab) => (
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
              {activeTab === 'details' && (content.longDescription || hasFeatures) && (
                <div>
                  {content.longDescription && (
                    <p className="font-body text-earth leading-relaxed mb-6">
                      {content.longDescription}
                    </p>
                  )}
                  {hasFeatures && (
                    <>
                      <h3 className="font-display font-semibold text-deep-brown text-lg mb-4">
                        Key Features
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {content.features!.map((feat) => (
                          <div key={feat} className="flex items-start gap-2">
                            <CheckIcon className="text-accent-green flex-shrink-0 mt-0.5" />
                            <span className="font-body text-[14px] text-earth">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'nutrition' && hasNutrition && (
                <div className="bg-cream/50 rounded-[16px] p-6 md:p-8">
                  <h3 className="font-display font-semibold text-deep-brown text-lg mb-2">
                    Nutritional Information
                  </h3>
                  <p className="font-body text-[13px] text-earth/70 mb-6">
                    Amount per serving. Percent Daily Values are based on a 2,000 calorie diet.
                  </p>
                  <div className="space-y-0">
                    {content.nutrition!.map((item, i) => (
                      <div
                        key={item.label}
                        className={`flex justify-between py-3 ${
                          i < content.nutrition!.length - 1 ? 'border-b border-soft-peach/50' : ''
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

              {activeTab === 'specs' && hasSpecs && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.specs!.map((spec) => (
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
        )}

      </div>
    </div>
  );
}
