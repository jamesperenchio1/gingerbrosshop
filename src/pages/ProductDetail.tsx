import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router';
import gsap from 'gsap';
import { useCart } from '@/context/CartContext';
import { PlusIcon, MinusIcon } from '@/components/Icons';
import SEO from '@/components/SEO';
import NotFound from '@/pages/NotFound';
import { useCatalog, defaultPrice, intervalLabel, oneTimePrice, savingsPercent, type CatalogProduct } from '@/lib/catalog';
import { getProductContent } from '@/lib/productContent';
import {
  Leaf,
  ThermometerSnowflake,
  Package,
  Droplets,
  Clock,
  MapPin,
  Wheat,
  Info,
  FlaskConical,
  Recycle,
  CheckCircle2,
  Scale,
  GlassWater,
} from 'lucide-react';

/* ──────────────────────── Icons ──────────────────────── */

function ArrowLeftIcon({ className = '' }: { className?: string }) {
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

function SpecIcon({ label, className = '' }: { label: string; className?: string }) {
  const map: Record<string, React.ComponentType<{ className?: string }>> = {
    volume: GlassWater,
    packaging: Package,
    storage: ThermometerSnowflake,
    servingtemp: ThermometerSnowflake,
    servingtemperature: ThermometerSnowflake,
    carbonation: Droplets,
    fermentation: Clock,
    ph: FlaskConical,
    origin: MapPin,
    dietary: Leaf,
    allergens: Wheat,
    bottlereturn: Recycle,
    shelf: Clock,
    shelflife: Clock,
    weight: Scale,
  };
  const key = label.toLowerCase().replace(/[^a-z]/g, '');
  const Icon = map[key] ?? Info;
  return <Icon className={className} />;
}

function NutritionPanel({ nutrition }: { nutrition: { label: string; value: string }[] }) {
  return (
    <div className="bg-cream/40 rounded-[20px] border border-soft-peach/60 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display font-bold text-deep-brown text-2xl">Nutrition Facts</h3>
          <p className="font-body text-[13px] text-earth/70 mt-1">Amount per serving. %DV based on a 2,000-calorie diet.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-soft-peach/70 text-[12px] font-medium text-deep-brown">
            <Leaf className="w-3.5 h-3.5 text-accent-green" /> Vegan
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-soft-peach/70 text-[12px] font-medium text-deep-brown">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" /> Gluten-Free
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-soft-peach/70 text-[12px] font-medium text-deep-brown">
            <Droplets className="w-3.5 h-3.5 text-amber" /> Low Sugar
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-soft-peach/60 overflow-hidden">
        {nutrition.map((item, i) => {
          const isSub = item.label.startsWith('—');
          const isSubSub = item.label.startsWith('——');
          const isEnergy = item.label === 'Energy';
          const displayLabel = item.label.replace(/^—+\s?/, '');
          return (
            <div
              key={`${item.label}-${i}`}
              className={`flex justify-between items-baseline gap-4 px-5 ${isEnergy ? 'py-4 bg-cream/30' : 'py-3'} ${i < nutrition.length - 1 ? 'border-b border-soft-peach/40' : ''}`}
            >
              <span
                className={`font-body ${isSubSub ? 'pl-6 text-[13px]' : isSub ? 'pl-3 text-[13px]' : 'text-[14px]'} ${isEnergy ? 'text-[16px] font-semibold text-deep-brown' : 'text-earth'} ${isSub ? 'text-earth/80' : 'font-medium'}`}
              >
                {displayLabel}
              </span>
              <span
                className={`font-body text-right whitespace-nowrap ${isEnergy ? 'text-[16px] font-bold text-deep-brown' : 'text-deep-brown'} ${isSub ? 'text-[13px]' : 'text-[14px]'} font-medium`}
              >
                {item.value}
              </span>
            </div>
          );
        })}
      </div>

      <p className="font-body text-[12px] text-earth/50 mt-4">
        * Daily Value percentages are approximate. Values may vary slightly between batches due to natural fermentation.
      </p>
    </div>
  );
}

function SpecCard({ spec }: { spec: { label: string; value: string } }) {
  return (
    <div className="group bg-cream/40 rounded-[16px] p-5 border border-soft-peach/60 flex gap-4 items-start hover:border-amber/40 transition-colors">
      <div className="w-10 h-10 rounded-full bg-white border border-soft-peach/60 flex items-center justify-center flex-shrink-0 text-rust group-hover:text-amber transition-colors">
        <SpecIcon label={spec.label} className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <span className="font-body font-semibold text-[12px] uppercase tracking-[0.07em] text-rust mb-1 block">{spec.label}</span>
        <span className="font-body text-[15px] text-deep-brown leading-snug">{spec.value}</span>
      </div>
    </div>
  );
}

/* ──────────────────────── Related Products ──────────────────────── */

function RelatedProductCard({ product }: { product: CatalogProduct }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const price = defaultPrice(product);
  const image = product.images[0] ?? '';
  const shortDesc = product.metadata.short_description ?? product.description ?? '';
  const hasVariants = product.prices.length > 1 && product.prices.every((p) => !p.recurring && p.nickname?.includes(' · '));

  const handleAdd = useCallback(() => {
    if (!price || hasVariants) return;
    addItem({ id: price.priceId, priceId: price.priceId, productId: product.id, name: product.name, variant: product.id, price: price.unitAmount ?? 0, quantity: 1, image, badge: product.badge ?? '', badgeColor: product.badgeColor ?? '' });
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 800);
  }, [price, hasVariants, addItem, product, image]);

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white border border-soft-peach/60 rounded-[20px] p-5 flex flex-col cursor-pointer hover:shadow-[0_12px_32px_rgba(61,36,16,0.12)] transition-shadow duration-300"
    >
      <div className="flex items-center justify-center h-[160px] mb-4">
        <img src={image} alt={product.name} className="max-h-full w-auto object-contain" />
      </div>
      <h4 className="font-display font-semibold text-deep-brown text-[15px] mb-1 leading-snug">{product.name}</h4>
      <p className="font-body text-earth text-[13px] leading-relaxed mb-4 flex-grow line-clamp-2">{shortDesc}</p>
      <div className="flex items-center justify-between gap-3 mt-auto">
        <span className="font-display font-semibold text-deep-brown text-lg">฿{price?.unitAmount ?? '—'}</span>
        <button
          onClick={(e) => { e.stopPropagation(); if (hasVariants) navigate(`/product/${product.id}`); else handleAdd(); }}
          className={`font-body font-medium text-[12px] uppercase tracking-[0.07em] px-4 py-2 rounded-full transition-all ${added ? 'bg-accent-green text-white' : 'bg-amber text-deep-brown hover:bg-warm-gold'}`}
        >
          {added ? 'Added!' : hasVariants ? 'Options →' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────── Page Component ──────────────────────── */

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
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
  const mainImageContainerRef = useRef<HTMLDivElement>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleImageMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = mainImageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setZoomPos({
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    });
  }, []);

  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setActiveImage(0);
    setQuantity(1);
    setSelectedPriceId(null);
  }

  const images = product?.images ?? [];
  const video = content.video;

  const oneTimeForProduct = product ? oneTimePrice(product) : undefined;
  const selectedPrice = (() => {
    if (!product) return undefined;
    if (selectedPriceId) {
      return product.prices.find((p) => p.priceId === selectedPriceId) ?? defaultPrice(product);
    }
    if (searchParams.get('plan') === 'weekly') {
      const weekly = product.prices.find(
        (p) => p.recurring?.interval === 'week' && p.recurring.intervalCount === 1,
      );
      if (weekly) return weekly;
    }
    return defaultPrice(product);
  })();
  const maxSavings = product
    ? product.prices.reduce(
        (acc, p) => (p.recurring ? Math.max(acc, savingsPercent(p, oneTimeForProduct)) : acc),
        0,
      )
    : 0;

  const isEquipment = product?.category === 'brewing-equipment';

  const isVariantProduct =
    !!product &&
    product.prices.length > 1 &&
    product.prices.every((p) => !p.recurring && p.nickname?.includes(' · '));

  const variantSizes = isVariantProduct
    ? [...new Set(product!.prices.map((p) => p.nickname!.split(' · ')[0]))]
    : [];
  const variantTypes = isVariantProduct
    ? [...new Set(product!.prices.map((p) => p.nickname!.split(' · ')[1]))]
    : [];

  const selectedSize = isVariantProduct && selectedPrice?.nickname
    ? selectedPrice.nickname.split(' · ')[0]
    : null;
  const selectedType = isVariantProduct && selectedPrice?.nickname
    ? selectedPrice.nickname.split(' · ')[1] ?? null
    : null;

  const handleSizeSelect = (size: string) => {
    if (!product || !isVariantProduct) return;
    const match = product.prices.find((p) => p.nickname === `${size} · ${selectedType}`);
    if (match) {
      setSelectedPriceId(match.priceId);
      return;
    }
    const fallback = product.prices.find((p) => p.nickname?.startsWith(`${size} ·`));
    if (fallback) setSelectedPriceId(fallback.priceId);
  };

  const handleTypeSelect = (type: string) => {
    if (!product || !isVariantProduct) return;
    const match = product.prices.find((p) => p.nickname === `${selectedSize} · ${type}`);
    if (match) setSelectedPriceId(match.priceId);
  };

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

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <p className="font-body text-earth">Loading…</p>
      </div>
    );
  }

  if (!product || !selectedPrice) return <NotFound />;

  const lineTotal = (selectedPrice.unitAmount ?? 0) * quantity;

  const handleAdd = () => {
    addItem({
      id: selectedPrice.priceId,
      priceId: selectedPrice.priceId,
      productId: product.id,
      name: product.name,
      variant: isVariantProduct && selectedSize && selectedType
        ? `${selectedSize} · ${selectedType}`
        : product.id,
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
  const hasCompatibility = (content.compatibility?.length ?? 0) > 0;
  const showDrinkTabs = !isEquipment && (!!content.longDescription || hasFeatures || hasNutrition || hasSpecs);

  // Related products from catalog
  const relatedIds = content.relatedProducts ?? [];
  const relatedProducts = relatedIds
    .map((rid) => products.find((p) => p.id === rid))
    .filter((p): p is CatalogProduct => !!p)
    .slice(0, 4);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? '',
    image: images,
    brand: { '@type': 'Brand', name: isEquipment ? 'KegLand' : 'GingerBros' },
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

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title={`${product.name} — GingerBros`}
        description={product.description ?? ''}
        path={`/product/${product.id}`}
        image={images[0] ?? ''}
        type="product"
        jsonLd={[productJsonLd]}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-12 md:pb-16">

        {/* ── Hero: Gallery + Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* Gallery */}
          <div ref={heroRef} className="relative">
            <div
              ref={mainImageContainerRef}
              onMouseMove={handleImageMouseMove}
              onMouseEnter={() => { if (!(video && activeImage === images.length)) setIsZooming(true); }}
              onMouseLeave={() => setIsZooming(false)}
              className="rounded-[20px] overflow-hidden mb-4 h-[400px] md:h-[500px] flex items-center justify-center select-none bg-cream/40"
              style={{ cursor: isZooming ? 'zoom-in' : 'default' }}
            >
              {video && activeImage === images.length ? (
                <video src={video} controls autoPlay muted loop playsInline className="max-h-full max-w-full object-contain" />
              ) : (
                <img
                  src={images[activeImage] ?? images[0]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain pointer-events-none"
                  style={{
                    transform: isZooming ? 'scale(2.2)' : 'scale(1)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transition: isZooming ? 'transform-origin 0ms' : 'transform 0.25s ease',
                  }}
                  draggable={false}
                />
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-amber' : 'border-transparent hover:border-soft-peach'}`}>
                  <img src={img} alt="" className="w-full h-full object-contain p-1" />
                </button>
              ))}
              {video && (
                <button onClick={() => setActiveImage(images.length)} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all relative ${activeImage === images.length ? 'border-amber' : 'border-transparent hover:border-soft-peach'}`}>
                  <video src={video} preload="metadata" className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 bg-deep-brown/40 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div ref={infoRef}>
            <a href="/#shop" className="flex w-fit items-center gap-2 font-body font-medium text-[13px] text-earth hover:text-deep-brown transition-colors mb-4">
              <ArrowLeftIcon />
              {isEquipment ? 'Back to Equipment' : 'Back to Shop'}
            </a>

            {/* Brand (equipment) or Badge (drinks) */}
            {isEquipment && (
              <span className="inline-flex items-center font-body font-semibold text-[11px] uppercase tracking-[0.1em] text-rust/70 mb-3">
                KegLand · Duotight
              </span>
            )}

            {/* Name */}
            <h1 className="font-display font-bold text-deep-brown text-[1.75rem] sm:text-[2rem] md:text-[2.5rem] leading-tight mb-3">
              {product.name}
            </h1>

            {/* Headline */}
            {content.headline && (
              <p className="font-body text-earth text-[15px] leading-relaxed mb-5">
                {content.headline}
              </p>
            )}

            {/* Price + Stock */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-display font-semibold text-deep-brown text-3xl">฿{selectedPrice.unitAmount}</span>
              {selectedPrice.recurring && (
                <span className="font-body font-medium text-[15px] text-rust">{intervalLabel(selectedPrice.recurring)}</span>
              )}
              <span className="flex items-center gap-1.5 font-body font-medium text-[13px] text-accent-green">
                <span className="w-2 h-2 rounded-full bg-accent-green" />
                In Stock
              </span>
            </div>

            {/* ── Variant selector (equipment with size/type options) ── */}
            {isVariantProduct && (
              <div className="mb-8">
                <div className="mb-5">
                  <span className="font-body font-semibold text-[12px] uppercase tracking-[0.08em] text-rust mb-2.5 block">Size</span>
                  <div className="flex flex-wrap gap-2">
                    {variantSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        aria-pressed={selectedSize === size}
                        className={`font-body font-medium text-[13px] px-4 py-2 rounded-xl border-2 transition-all ${selectedSize === size ? 'border-amber bg-amber/10 text-deep-brown' : 'border-soft-peach text-earth hover:border-amber/50'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-body font-semibold text-[12px] uppercase tracking-[0.08em] text-rust mb-2.5 block">Type</span>
                  <div className="flex gap-2">
                    {variantTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleTypeSelect(type)}
                        aria-pressed={selectedType === type}
                        className={`flex items-center gap-2 font-body font-medium text-[13px] px-4 py-2.5 rounded-xl border-2 transition-all ${selectedType === type ? 'border-amber bg-amber/10 text-deep-brown' : 'border-soft-peach text-earth hover:border-amber/50'}`}
                      >
                        <span className={`inline-block w-3 h-3 rounded-full flex-shrink-0 ${type === 'Gas' ? 'bg-orange-400' : 'bg-deep-brown'}`} />
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedSize && selectedType && (
                  <p className="font-body text-[12px] text-earth/50 mt-3">Selected: {selectedSize} · {selectedType}</p>
                )}
              </div>
            )}

            {/* ── Purchase options (drinks subscriptions) ── */}
            {!isVariantProduct && !isEquipment && product.prices.length > 1 && (
              <div className="mb-8">
                <span className="font-body font-semibold text-[12px] uppercase tracking-[0.08em] text-rust mb-2 block">Purchase Options</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.prices.map((p) => {
                    const isActive = p.priceId === selectedPrice.priceId;
                    const label = p.recurring ? intervalLabel(p.recurring) : 'One-time';
                    const save = savingsPercent(p, oneTimeForProduct);
                    return (
                      <button key={p.priceId} onClick={() => setSelectedPriceId(p.priceId)} aria-pressed={isActive}
                        className={`relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${isActive ? 'border-amber bg-amber/10' : 'border-soft-peach hover:border-amber/50'}`}>
                        <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-amber' : 'border-soft-peach'}`}>
                          {isActive && <span className="w-2 h-2 rounded-full bg-amber" />}
                        </span>
                        <span className="flex-1 flex flex-col">
                          <span className="font-body font-medium text-[14px] text-deep-brown capitalize">{label}</span>
                          {save > 0 && <span className="font-body font-semibold text-[11px] text-accent-green">Save {save}%</span>}
                        </span>
                        <span className="flex items-baseline gap-1.5">
                          {save > 0 && oneTimeForProduct?.unitAmount != null && <span className="font-body text-[12px] text-earth/50 line-through">฿{oneTimeForProduct.unitAmount}</span>}
                          <span className="font-body font-semibold text-[15px] text-deep-brown">฿{p.unitAmount}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedPrice.recurring ? (
                  <div className="mt-3 rounded-xl bg-accent-green/[0.07] border border-accent-green/20 px-4 py-3.5">
                    <p className="font-body font-semibold text-[13px] text-deep-brown mb-2">
                      Subscribe &amp; Save{savingsPercent(selectedPrice, oneTimeForProduct) > 0 && ` · ${savingsPercent(selectedPrice, oneTimeForProduct)}% off every delivery`}
                    </p>
                    <ul className="font-body text-[12px] text-earth/80 space-y-1.5">
                      <li className="flex items-start gap-2"><CheckIcon className="text-accent-green flex-shrink-0 mt-0.5" /> Delivered {intervalLabel(selectedPrice.recurring)} — never run out</li>
                      <li className="flex items-start gap-2"><CheckIcon className="text-accent-green flex-shrink-0 mt-0.5" /> A lower price than one-time, locked in</li>
                      <li className="flex items-start gap-2"><CheckIcon className="text-accent-green flex-shrink-0 mt-0.5" /> Pause, skip, or cancel anytime</li>
                    </ul>
                  </div>
                ) : oneTimeForProduct && maxSavings > 0 && (
                  <button onClick={() => { const c = product.prices.filter((p) => p.recurring).sort((a, b) => (a.unitAmount ?? 0) - (b.unitAmount ?? 0))[0]; if (c) setSelectedPriceId(c.priceId); }}
                    className="mt-3 w-full flex items-center justify-between gap-3 rounded-xl border-2 border-amber bg-amber/10 px-4 py-3.5 text-left hover:bg-amber/20 transition-colors group">
                    <div>
                      <p className="font-display font-bold text-deep-brown text-[15px] leading-tight">Subscribe &amp; Save {maxSavings}%</p>
                      <p className="font-body text-[12px] text-earth/70 mt-0.5">Auto-delivery · pause or cancel anytime</p>
                    </div>
                    <span className="flex-shrink-0 bg-deep-brown text-cream font-body font-semibold text-[12px] uppercase tracking-[0.06em] px-3.5 py-1.5 rounded-full group-hover:bg-rust transition-colors">Switch →</span>
                  </button>
                )}
              </div>
            )}

            {/* Short description (from Stripe) */}
            {product.description && (
              <p className="font-body text-earth leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* ── Quantity + Add to Cart ── */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 border-2 border-soft-peach rounded-full py-2.5 px-5">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-earth hover:text-deep-brown transition-colors"><MinusIcon /></button>
                  <span className="font-body font-medium text-earth min-w-[24px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(24, quantity + 1))} className="text-earth hover:text-deep-brown transition-colors"><PlusIcon /></button>
                </div>
                <button
                  onClick={handleAdd}
                  className={`font-body font-medium text-sm uppercase tracking-[0.08em] px-10 py-3.5 rounded-full transition-all duration-200 active:scale-[0.98] ${added ? 'bg-accent-green text-white' : 'bg-amber text-deep-brown hover:bg-warm-gold'}`}
                >
                  {added ? 'Added to Cart!' : `Add to Cart — ฿${lineTotal}`}
                </button>
              </div>

              {/* Processing time notice (equipment only) */}
              {isEquipment && (
                <p className="mt-4 font-body font-semibold text-[13px] text-red-600">
                  ⏱ 7 days processing time
                </p>
              )}

            {/* Gift toggle (drinks only) */}
              {!isEquipment && (
                <div className="mt-5 pt-4 border-t border-soft-peach/50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} data-testid="gift-toggle" className="w-5 h-5 accent-deep-brown rounded" />
                    <span className="font-body font-medium text-deep-brown text-[14px]">This is a gift</span>
                  </label>
                  {isGift && (
                    <div className="mt-3 space-y-3">
                      <input type="text" value={giftName} onChange={(e) => setGiftName(e.target.value)} placeholder="Recipient name" data-testid="gift-name" className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30" />
                      <input type="email" value={giftEmail} onChange={(e) => setGiftEmail(e.target.value)} placeholder="Recipient email" data-testid="gift-email" className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30" />
                      <textarea value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} placeholder="Gift message (optional)" rows={3} data-testid="gift-message" className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30 resize-none" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick feature bullets (drinks) */}
            {!isEquipment && hasFeatures && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {content.features!.slice(0, 4).map((feat) => (
                  <div key={feat} className="flex items-start gap-2">
                    <CheckIcon className="text-accent-green flex-shrink-0 mt-0.5" />
                    <span className="font-body text-[14px] text-earth">{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Ingredients (drinks) */}
            {!isEquipment && (content.ingredients?.length ?? 0) > 0 && (
              <div className="mb-6">
                <span className="font-body font-semibold text-[12px] uppercase tracking-[0.08em] text-rust mb-2 block">Ingredients</span>
                <p className="font-body text-[14px] text-earth">{content.ingredients!.join(', ')}</p>
              </div>
            )}

            {/* Equipment compatibility note (inline) */}
            {isEquipment && (
              <p className="font-body text-[13px] text-earth/60 italic border-t border-soft-peach/40 pt-4">
                Works perfectly with other KegLand and Duotight components.
              </p>
            )}
          </div>
        </div>

        {/* ── Equipment: Scrolling Sections ── */}
        {isEquipment && (
          <div className="mt-20 space-y-16 border-t border-soft-peach/50 pt-14">

            {/* Overview */}
            {content.longDescription && (
              <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16">
                <div>
                  <h3 className="font-display font-semibold text-deep-brown text-[1.1rem] sticky top-28">Overview</h3>
                </div>
                <p className="font-body text-earth text-[15px] leading-[1.8] max-w-[680px]">
                  {content.longDescription}
                </p>
              </div>
            )}

            {/* Features */}
            {hasFeatures && (
              <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16 border-t border-soft-peach/30 pt-12">
                <div>
                  <h3 className="font-display font-semibold text-deep-brown text-[1.1rem] sticky top-28">Features</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[680px]">
                  {content.features!.map((feat) => (
                    <div key={feat} className="flex items-start gap-3 bg-cream/60 rounded-[14px] px-4 py-3.5">
                      <CheckIcon className="text-amber flex-shrink-0 mt-0.5" />
                      <span className="font-body text-[14px] text-deep-brown leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            {hasSpecs && (
              <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16 border-t border-soft-peach/30 pt-12">
                <div>
                  <h3 className="font-display font-semibold text-deep-brown text-[1.1rem] sticky top-28">Specifications</h3>
                </div>
                <div className="max-w-[680px]">
                  <div className="rounded-[16px] overflow-hidden border border-soft-peach/60">
                    {content.specs!.map((spec, i) => (
                      <div key={spec.label} className={`flex gap-4 px-5 py-3.5 ${i % 2 === 0 ? 'bg-white' : 'bg-cream/40'}`}>
                        <span className="font-body font-medium text-[13px] text-rust uppercase tracking-[0.06em] w-40 flex-shrink-0">{spec.label}</span>
                        <span className="font-body text-[14px] text-deep-brown">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Compatibility */}
            {hasCompatibility && (
              <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16 border-t border-soft-peach/30 pt-12">
                <div>
                  <h3 className="font-display font-semibold text-deep-brown text-[1.1rem] sticky top-28">Compatibility</h3>
                </div>
                <div className="max-w-[680px] space-y-3">
                  {content.compatibility!.map((note) => (
                    <div key={note} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber mt-2 flex-shrink-0" />
                      <span className="font-body text-[14px] text-earth leading-relaxed">{note}</span>
                    </div>
                  ))}
                  <p className="font-body text-[13px] text-earth/50 italic pt-2">Works perfectly with other KegLand and Duotight components.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Drinks: Tab Sections ── */}
        {showDrinkTabs && (
          <div className="mt-16 border-t border-soft-peach/50 pt-12">
            <div
              role="tablist"
              aria-label="Product information"
              className="flex gap-4 mb-8 border-b border-soft-peach/50 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 scrollbar-none"
            >
              {(['details', 'nutrition', 'specs'] as const)
                .filter((tab) => tab === 'details' ? !!content.longDescription || hasFeatures : tab === 'nutrition' ? hasNutrition : hasSpecs)
                .map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-shrink-0 font-body font-medium text-[13px] sm:text-[14px] uppercase tracking-[0.08em] pb-3 transition-colors border-b-2 -mb-px whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-t ${activeTab === tab ? 'text-deep-brown border-amber' : 'text-earth/60 border-transparent hover:text-earth'}`}
                  >
                    {tab === 'details' ? 'Product Details' : tab === 'nutrition' ? 'Nutrition Info' : 'Specifications'}
                  </button>
                ))}
            </div>
            <div className="max-w-[860px]">
              {activeTab === 'details' && (content.longDescription || hasFeatures) && (
                <div>
                  {content.longDescription && <p className="font-body text-earth leading-relaxed mb-6">{content.longDescription}</p>}
                  {hasFeatures && (
                    <>
                      <h3 className="font-display font-semibold text-deep-brown text-lg mb-4">Key Features</h3>
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
              {activeTab === 'nutrition' && hasNutrition && <NutritionPanel nutrition={content.nutrition!} />}
              {activeTab === 'specs' && hasSpecs && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.specs!.map((spec) => (
                    <SpecCard key={spec.label} spec={spec} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-soft-peach/50 pt-14">
            <h3 className="font-display font-semibold text-deep-brown text-[1.35rem] mb-8 flex items-center gap-4">
              Related Products
              <span className="flex-1 h-px bg-soft-peach/60 hidden sm:block" />
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rp) => (
                <RelatedProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
