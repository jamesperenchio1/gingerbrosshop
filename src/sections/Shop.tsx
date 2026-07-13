import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import gsap from 'gsap';
import { useCart } from '@/context/CartContext';
import { PlusIcon, MinusIcon, SnowflakeIcon } from '@/components/Icons';
import { useCatalog, defaultPrice, cheapestSubscription, maxSubscriptionSavings, intervalLabel, type CatalogProduct } from '@/lib/catalog';

function ProductCard({ product }: { product: CatalogProduct }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current); };
  }, []);

  const price = defaultPrice(product);
  const subPrice = cheapestSubscription(product);
  const subSavings = maxSubscriptionSavings(product);
  const detailLink = `/product/${product.id}`;
  const isChilled = /chill|cold|fridge|refriger/i.test(product.badge ?? '');
  const badgeClass = isChilled
    ? 'bg-sky-50 text-sky-700 border-sky-200/80'
    : 'bg-accent-green/10 text-accent-green border-accent-green/30';
  const shortDescription = product.metadata.short_description ?? product.description ?? '';
  const image = product.images[0] ?? '';
  const isEquipment = product.category === 'brewing-equipment';
  const unitLabel = isEquipment ? 'per unit' : 'per bottle';

  // Variant products go to PDP for size/type selection
  const hasVariants =
    product.prices.length > 1 &&
    product.prices.every((p) => !p.recurring && p.nickname?.includes(' · '));

  const changeQuantity = useCallback((delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(24, prev + delta)));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!price) return;
    addItem({
      id: price.priceId,
      priceId: price.priceId,
      productId: product.id,
      name: product.name,
      variant: product.id,
      price: price.unitAmount ?? 0,
      quantity,
      image,
      badge: product.badge ?? '',
      badgeColor: product.badgeColor ?? 'bg-sky-500',
    });
    setAdded(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 800);
  }, [price, addItem, product, quantity, image]);

  return (
    <div
      onClick={() => navigate(detailLink)}
      className="bg-white border border-soft-peach/60 shadow-[0_12px_40px_rgba(61,36,16,0.10)] rounded-[24px] p-5 sm:p-8 flex flex-col cursor-pointer hover:shadow-[0_20px_56px_rgba(61,36,16,0.16)] transition-shadow duration-300"
    >
      {/* Product Image */}
      <div className="flex items-center justify-center mb-6 h-[200px] sm:h-[240px]">
        <img
          src={image}
          alt={product.name}
          className="max-h-full w-auto object-contain"
        />
      </div>

      {/* Badge */}
      {product.badge && (
        <span className={`inline-flex items-center gap-1.5 self-start border font-body font-semibold text-[11px] uppercase tracking-[0.06em] px-3 py-1.5 rounded-full mb-3 ${badgeClass}`}>
          {isChilled && <SnowflakeIcon className="w-3.5 h-3.5" />}
          {product.badge.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '').trim()}
        </span>
      )}

      {/* Product Name */}
      <button onClick={() => navigate(detailLink)} className="text-left">
        <h3 className="font-display font-semibold text-deep-brown text-[1.15rem] mb-2 hover:text-rust transition-colors">
          {product.name}
        </h3>
      </button>

      {/* Description */}
      <p className="font-body text-earth text-[14px] leading-relaxed mb-4 flex-grow">
        {shortDescription}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-display font-semibold text-deep-brown text-2xl">฿{price?.unitAmount ?? '—'}</span>
        <span className="font-body font-medium text-[13px] text-rust">{unitLabel}</span>
      </div>

      {/* Subscribe & save nudge (drinks only) */}
      {subPrice && subSavings > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`${detailLink}?plan=weekly`); }}
          className="w-full flex items-center justify-between gap-3 mb-4 rounded-xl border-2 border-amber bg-amber/10 px-4 py-3 text-left hover:bg-amber/20 transition-colors group"
        >
          <div>
            <p className="font-display font-bold text-deep-brown text-[14px] leading-tight">
              Subscribe &amp; Save {subSavings}%
            </p>
            <p className="font-body text-[11px] text-earth/70 mt-0.5">
              From ฿{subPrice.unitAmount}/{intervalLabel(subPrice.recurring).replace(/^per |^every /, '')} · cancel anytime
            </p>
          </div>
          <span className="flex-shrink-0 bg-deep-brown text-cream font-body font-semibold text-[11px] uppercase tracking-[0.05em] px-3 py-1.5 rounded-full group-hover:bg-rust transition-colors">
            See plan →
          </span>
        </button>
      )}

      {/* CTA */}
      {hasVariants ? (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(detailLink); }}
          className="w-full font-body font-medium text-sm uppercase tracking-[0.08em] py-3.5 rounded-full bg-amber text-deep-brown hover:bg-warm-gold active:scale-[0.98] transition-all duration-200"
        >
          Choose Options →
        </button>
      ) : (
        <>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-4 mb-4 border-2 border-soft-peach rounded-full py-2 px-4 self-start"
          >
            <button onClick={() => changeQuantity(-1)} className="text-earth hover:text-deep-brown transition-colors" aria-label="Decrease quantity">
              <MinusIcon />
            </button>
            <span className="font-body font-medium text-earth min-w-[20px] text-center">{quantity}</span>
            <button onClick={() => changeQuantity(1)} className="text-earth hover:text-deep-brown transition-colors" aria-label="Increase quantity">
              <PlusIcon />
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
            data-testid="add-to-cart"
            disabled={!price}
            className={`w-full font-body font-medium text-sm uppercase tracking-[0.08em] py-3.5 rounded-full transition-all duration-200 ${
              added ? 'bg-accent-green text-white' : 'bg-amber text-deep-brown hover:bg-warm-gold active:scale-[0.98]'
            }`}
          >
            {added ? 'Added!' : price ? `Add to Cart — ฿${price.unitAmount}` : 'Unavailable'}
          </button>
        </>
      )}

      <div className="flex items-center gap-2 mt-3">
        <span className="w-2 h-2 bg-accent-green rounded-full" />
        <span className="font-body font-medium text-[13px] text-earth">In Stock</span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); navigate(detailLink); }}
        className="mt-4 text-center font-body font-medium text-[13px] text-rust hover:text-deep-brown hover:underline transition-all"
      >
        View Details →
      </button>
    </div>
  );
}

type ActiveCategory = 'drinks' | 'brewing-equipment';

export default function Shop() {
  const { products, loading } = useCatalog();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>(
    () => (sessionStorage.getItem('shopTab') as ActiveCategory | null) ?? 'drinks',
  );

  const handleCategoryChange = useCallback((cat: ActiveCategory) => {
    sessionStorage.setItem('shopTab', cat);
    setActiveCategory(cat);
  }, []);

  const hasEquipment = products.some((p) => p.category === 'brewing-equipment');
  const hasDrinks = products.some((p) => p.category === 'drinks' || p.category === null);
  const showTabs = hasEquipment && hasDrinks;

  const visibleProducts =
    activeCategory === 'brewing-equipment'
      ? products.filter((p) => p.category === 'brewing-equipment')
      : products.filter((p) => p.category === 'drinks' || p.category === null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0, y: 40, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (loading) return;
    const cards = cardsRef.current?.children;
    if (!cards || cards.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from(Array.from(cards), {
        opacity: 0, y: 50, scale: 0.96, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, products.length]);

  useEffect(() => {
    const cards = cardsRef.current?.children;
    if (!cards || cards.length === 0) return;
    gsap.fromTo(
      Array.from(cards),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' },
    );
  }, [activeCategory]);

  const gridClass =
    visibleProducts.length === 1
      ? 'grid grid-cols-1 md:grid-cols-3 gap-8 [&>*]:md:col-start-2'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';

  const categoryHeading = activeCategory === 'brewing-equipment'
    ? { eyebrow: 'BREWING EQUIPMENT', title: 'KegLand Equipment', sub: 'Precision-engineered components for homebrewing, carbonation, and draft systems.' }
    : { eyebrow: 'OUR BREWS', title: 'Ginger Fizz', sub: 'Real fermented ginger with prebiotic acacia fibre. Brewed slow, enjoyed easy.' };

  return (
    <section id="shop" ref={sectionRef} className="bg-warm-white py-[60px] md:py-[80px]">
      <div className="max-w-[1100px] mx-auto px-6">

        {/* Category tabs */}
        {showTabs && !loading && (
          <div className="flex gap-8 mb-10 border-b border-soft-peach/60 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 scrollbar-none">
            {(['drinks', 'brewing-equipment'] as const).map((cat) => {
              const label = cat === 'drinks' ? 'Drinks' : 'Brewing Equipment';
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`flex-shrink-0 font-body font-semibold text-[13px] sm:text-[14px] uppercase tracking-[0.1em] pb-3.5 transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    active
                      ? 'text-deep-brown border-amber'
                      : 'text-earth/50 border-transparent hover:text-earth hover:border-soft-peach'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Header */}
        <div ref={headerRef} className="text-center mb-10 md:mb-14">
          <span className="font-body font-medium text-[12px] uppercase tracking-[0.1em] text-rust mb-3 block">
            {categoryHeading.eyebrow}
          </span>
          <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-3">
            {categoryHeading.title}
          </h2>
          <p className="font-body text-earth max-w-[480px] mx-auto">{categoryHeading.sub}</p>
        </div>

        {/* Processing time notice for brewing equipment */}
        {activeCategory === 'brewing-equipment' && !loading && (
          <p className="text-center font-body font-semibold text-[13px] text-red-600 mb-8">
            ⏱ 7 days processing time
          </p>
        )}

        {loading ? (
          <div className="text-center font-body text-earth py-12">Loading…</div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center font-body text-earth py-12">No products available right now.</div>
        ) : (
          <div ref={cardsRef} className={gridClass}>
            {visibleProducts.map((product) => (
              <ProductCard key={product.stripeProductId} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
