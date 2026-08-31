import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { PlusIcon, MinusIcon } from '@/components/Icons';
import {
  useCatalog,
  defaultPrice,
  cheapestSubscription,
  maxSubscriptionSavings,
  intervalLabel,
  stockStatus,
  hasVariantPrices,
  unitLabel,
  type CatalogProduct,
} from '@/lib/catalog';
import { Skeleton } from '@/components/ui/skeleton';
import StockAlertForm from '@/components/StockAlertForm';
import { useReveal } from '@/lib/reveal';
import { prefetchProductDetail } from '@/lib/prefetch';

function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-soft-peach/60 shadow-card rounded-3xl p-5 sm:p-8 flex flex-col">
      <Skeleton className="w-full aspect-square rounded-2xl mb-5" />
      <Skeleton className="h-5 w-2/3 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-5" />
      <Skeleton className="h-12 w-full rounded-full mb-3" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

/**
 * Card layout note: the whole card is clickable via a "stretched link" — a real
 * `<Link>` on the title whose `::after` covers the card. That keeps
 * cmd/middle-click, right-click → open in new tab and crawlable `<a href>`
 * working (a `div role="link"` + `navigate()` gives you none of those), and it
 * removes the pile of `stopPropagation` calls the nested-button version needed.
 * Anything interactive that sits on top just needs `relative z-10`.
 */
function ProductCard({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current); };
  }, []);

  const price = defaultPrice(product);
  const stock = stockStatus(product);
  const subPrice = cheapestSubscription(product);
  const subSavings = maxSubscriptionSavings(product);
  const detailLink = `/product/${product.id}`;
  const shortDescription = product.metadata.short_description ?? product.description ?? '';
  const image = product.images[0] ?? '';
  const hasVariants = hasVariantPrices(product);

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
    toast.success(`${product.name} added to cart`);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 800);
  }, [price, addItem, product, quantity, image]);

  return (
    <article
      onMouseEnter={prefetchProductDetail}
      onFocus={prefetchProductDetail}
      className="relative bg-white border border-soft-peach/60 shadow-card rounded-3xl p-5 sm:p-8 flex flex-col hover:shadow-card-hover transition-shadow duration-300 focus-within:outline focus-within:outline-2 focus-within:outline-amber focus-within:outline-offset-2"
    >
      <div className="flex items-center justify-center mb-6 h-[180px] sm:h-[200px] bg-cream/50 rounded-2xl p-4">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <h3 className="font-display font-semibold text-deep-brown text-[1.15rem] mb-2">
        <Link
          to={detailLink}
          className="outline-none after:absolute after:inset-0 after:content-[''] after:rounded-3xl hover:text-rust transition-colors"
        >
          {product.name}
        </Link>
      </h3>

      <p className="font-body text-earth text-[14px] leading-relaxed mb-4 flex-grow">
        {shortDescription}
      </p>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-display font-semibold text-deep-brown text-2xl">฿{price?.unitAmount ?? '—'}</span>
        <span className="font-body font-medium text-[13px] text-rust">{unitLabel(product)}</span>
      </div>

      {subPrice && subSavings > 0 && (
        <Link
          to={`${detailLink}?plan=weekly`}
          className="relative z-10 w-full flex items-center justify-between gap-3 mb-4 rounded-xl border-2 border-amber bg-amber/10 px-4 py-3 text-left hover:bg-amber/20 transition-colors group"
        >
          <span className="block">
            <span className="block font-display font-bold text-deep-brown text-[14px] leading-tight">
              Subscribe &amp; Save {subSavings}%
            </span>
            <span className="block font-body text-[11px] text-earth/70 mt-0.5">
              From ฿{subPrice.unitAmount}/{intervalLabel(subPrice.recurring).replace(/^per |^every /, '')} · cancel anytime
            </span>
          </span>
          <span className="flex-shrink-0 bg-deep-brown text-cream font-body font-semibold text-[11px] uppercase tracking-[0.05em] px-3 py-1.5 rounded-full group-hover:bg-rust transition-colors">
            See plan →
          </span>
        </Link>
      )}

      {hasVariants ? (
        <Link
          to={detailLink}
          className="relative z-10 w-full text-center font-body font-medium text-sm uppercase tracking-[0.08em] py-3.5 rounded-full bg-amber text-deep-brown hover:bg-warm-gold active:scale-[0.98] transition-all duration-200"
        >
          Choose Options →
        </Link>
      ) : (
        <>
          <div className="relative z-10 flex items-center justify-center gap-2 mb-4 border-2 border-soft-peach rounded-full py-1 px-2 self-start">
            <button onClick={() => changeQuantity(-1)} className="text-earth hover:text-deep-brown transition-colors p-2" aria-label={`Decrease ${product.name} quantity`}>
              <MinusIcon />
            </button>
            <span className="font-body font-medium text-earth min-w-[20px] text-center">{quantity}</span>
            <button onClick={() => changeQuantity(1)} className="text-earth hover:text-deep-brown transition-colors p-2" aria-label={`Increase ${product.name} quantity`}>
              <PlusIcon />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            data-testid="add-to-cart"
            disabled={!price || stock === 'out_of_stock'}
            className={`relative z-10 w-full font-body font-medium text-sm uppercase tracking-[0.08em] py-3.5 rounded-full transition-all duration-200 ${
              added
                ? 'bg-accent-green text-white'
                : stock === 'out_of_stock'
                ? 'bg-soft-peach text-earth/60 cursor-not-allowed'
                : 'bg-amber text-deep-brown hover:bg-warm-gold active:scale-[0.98]'
            }`}
          >
            {added
              ? 'Added!'
              : stock === 'out_of_stock'
              ? 'Out of Stock'
              : price
              ? `Add to Cart — ฿${price.unitAmount}`
              : 'Unavailable'}
          </button>
        </>
      )}

      <div className="flex items-center gap-2 mt-3">
        <span className={`w-2 h-2 rounded-full ${stock === 'out_of_stock' ? 'bg-earth/40' : stock === 'low_stock' ? 'bg-amber' : 'bg-accent-green'}`} />
        <span className="font-body font-medium text-[13px] text-earth">
          {stock === 'out_of_stock' ? 'Out of Stock' : stock === 'low_stock' ? 'Low Stock' : 'In Stock'}
        </span>
      </div>
      {stock === 'out_of_stock' && (
        <div className="relative z-10">
          <StockAlertForm productId={product.stripeProductId} className="mt-3" />
        </div>
      )}

      <span aria-hidden="true" className="mt-4 text-center font-body font-medium text-[13px] text-rust">
        View Details →
      </span>
    </article>
  );
}

type ActiveCategory = 'drinks' | 'brewing-equipment';

const SHOP_TAB_STORAGE_KEY = 'shopTab';

function readStoredTab(): ActiveCategory {
  try {
    const stored = sessionStorage.getItem(SHOP_TAB_STORAGE_KEY);
    return stored === 'brewing-equipment' ? 'brewing-equipment' : 'drinks';
  } catch {
    return 'drinks';
  }
}

export default function Shop() {
  const { products, loading, error } = useCatalog();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>(readStoredTab);

  const handleCategoryChange = useCallback((cat: ActiveCategory) => {
    try {
      sessionStorage.setItem(SHOP_TAB_STORAGE_KEY, cat);
    } catch {
      // sessionStorage unavailable (private browsing / quota) — non-fatal.
    }
    setActiveCategory(cat);
  }, []);

  const hasEquipment = products.some((p) => p.category === 'brewing-equipment');
  const hasDrinks = products.some((p) => p.category === 'drinks' || p.category === null);
  const showTabs = hasEquipment && hasDrinks;

  const visibleProducts =
    activeCategory === 'brewing-equipment'
      ? products.filter((p) => p.category === 'brewing-equipment')
      : products.filter((p) => p.category === 'drinks' || p.category === null);

  // One reveal path for both first paint and tab switches. `useReveal` plays
  // immediately when the target is already on screen, so switching tabs fades
  // the new cards in without a second, competing animation.
  useReveal(
    sectionRef,
    (reveal) => {
      reveal(headerRef.current, { trigger: sectionRef.current, start: 'top 80%' });
      reveal(cardsRef.current?.children, {
        y: 50,
        scale: 0.96,
        duration: 0.8,
        stagger: 0.12,
        trigger: cardsRef.current,
        start: 'top 80%',
      });
    },
    [loading, activeCategory, visibleProducts.length],
  );

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
        {showTabs && !loading && (
          <div role="tablist" className="flex gap-8 mb-10 border-b border-soft-peach/60 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 scrollbar-none">
            {(['drinks', 'brewing-equipment'] as const).map((cat) => {
              const label = cat === 'drinks' ? 'Drinks' : 'Brewing Equipment';
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={active}
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

        <div ref={headerRef} className="text-center mb-10 md:mb-14">
          <span className="font-body font-medium text-[12px] uppercase tracking-[0.1em] text-rust mb-3 block">
            {categoryHeading.eyebrow}
          </span>
          <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-3">
            {categoryHeading.title}
          </h2>
          <p className="font-body text-earth max-w-[480px] mx-auto">{categoryHeading.sub}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          /* Previously an API failure rendered "No products available right
             now", which reads as "sold out" rather than "we broke". */
          <div className="text-center py-12">
            <p className="font-body text-earth mb-4">
              We couldn&apos;t load the shop just now. This is on us, not on your connection.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="font-body font-medium text-sm uppercase tracking-[0.08em] px-6 py-3 rounded-full bg-amber text-deep-brown hover:bg-warm-gold transition-colors"
            >
              Try again
            </button>
          </div>
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
