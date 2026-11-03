import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation, Link } from 'react-router';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { PlusIcon, MinusIcon } from '@/components/Icons';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '@/components/SEO';
import NotFound from '@/pages/NotFound';
import { useCatalog, defaultPrice, bottleCounts, intervalLabel, oneTimePrice, savingsPercent, stockStatus, hasVariantPrices, type CatalogProduct } from '@/lib/catalog';
import { getDeliveryEstimateMessage } from '@/constants/store';
import { startCheckout, trackInitiateCheckout } from '@/lib/checkout';
import type { CartItem } from '@/types/cart';
import { useRecentlyViewed, getRecentlyViewed } from '@/hooks/use-recently-viewed';
import { Skeleton } from '@/components/ui/skeleton';
import ImageLightbox from '@/components/ImageLightbox';
import StockAlertForm from '@/components/StockAlertForm';
import ProductReviews from '@/components/ProductReviews';
import { getProductContent } from '@/lib/productContent';
import { useReveal } from '@/lib/reveal';
import { optimizedImageUrl } from '@/lib/image';
import { trackPixelEvent } from '@/lib/metaPixel';
import ResponsiveImage from '@/components/ResponsiveImage';
import CompactCard from '@/components/shop/CompactCard';
import PackPicker from '@/components/shop/PackPicker';
import TasteMeter from '@/components/shop/TasteMeter';
import { packOptions, mixOptions, drinkKind } from '@/lib/drinks';
import { manifestJpg, thumbUrl } from '@/lib/productImages';
import { OG_IMAGES } from '@/lib/ogImages';
import { IMAGE_MANIFEST } from '@/lib/imageManifest';
import { useReviewSummaries } from '@/lib/reviews';
import { SITE_URL } from '@/constants/site';
import { useI18n } from '@/context/I18nContext';
import {
  Leaf,
  ThermometerSnowflake,
  Package,
  Droplets,
  Clock,
  MapPin,
  Wheat,
  Info,
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
    <div className="bg-cream/40 rounded-xxl border border-soft-peach/60 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display font-bold text-deep-brown text-2xl">Nutrition Facts</h3>
          <p className="font-body text-[13px] text-earth/80 mt-1">Amount per serving. %DV based on a 2,000-calorie diet.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-soft-peach/70 text-[12px] font-medium text-deep-brown">
            <Leaf className="w-3.5 h-3.5 text-green-ink" /> Vegan
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-soft-peach/70 text-[12px] font-medium text-deep-brown">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-ink" /> Gluten-Free
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-soft-peach/70 text-[12px] font-medium text-deep-brown">
            <Droplets className="w-3.5 h-3.5 text-amber" /> Low Sugar
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-soft-peach/60 overflow-hidden">
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

      <p className="font-body text-[12px] text-earth/80 mt-4">
        * Daily Value percentages are approximate. Values may vary slightly between batches.
      </p>
    </div>
  );
}

function SpecCard({ spec }: { spec: { label: string; value: string } }) {
  return (
    <div className="group bg-cream/40 rounded-2xl p-5 border border-soft-peach/60 flex gap-4 items-start hover:border-amber/40 transition-colors">
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

/* ──────────────────────── Recently Viewed ──────────────────────── */

function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const { products } = useCatalog();
  const recentlyViewedIds = useMemo(
    () => getRecentlyViewed(currentProductId),
    [currentProductId],
  );
  const recentlyViewed = useMemo(
    () => recentlyViewedIds.map((id) => products.find((p) => p.id === id)).filter((p): p is CatalogProduct => !!p),
    [recentlyViewedIds, products],
  );

  if (recentlyViewed.length === 0) return null;

  return (
    <div className="mt-20 border-t border-soft-peach/50 pt-14">
      <h2 className="font-display font-bold text-deep-brown text-[1.35rem] mb-8 flex items-center gap-4">
        Recently viewed
        <span className="flex-1 h-px bg-soft-peach/60 hidden sm:block" />
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {recentlyViewed.map((rp) => (
          <CompactCard key={rp.id} product={rp} />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────── Mix & match ──────────────────────── */

// Drinks only: links to the mixed Fizz + Tea bundles, and the reminder that
// deals stack up automatically however you build the cart.
function MixStrip({ products, currentId }: { products: CatalogProduct[]; currentId: string }) {
  const mixes = mixOptions(products).filter((o) => o.product.id !== currentId);
  if (mixes.length === 0) return null;
  return (
    <div className="mb-6 rounded-2xl bg-cream px-4 py-3.5">
      <p className="mb-2 font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-rust">Mix Fizz &amp; Tea</p>
      <div className="flex flex-wrap gap-2">
        {mixes.map((o) => (
          <Link key={o.product.id} to={`/product/${o.product.id}`} className="rounded-full border-2 border-charcoal/15 bg-white px-3.5 py-1.5 font-body text-[13px] font-semibold text-deep-brown hover:border-charcoal">
            {o.product.name} · ฿{o.price}{o.saving > 0 ? ` (save ฿${o.saving})` : ''}
          </Link>
        ))}
      </div>
      <p className="mt-2 font-body text-[12px] text-earth">Multi-buy deals apply automatically in your cart, however you mix it.</p>
    </div>
  );
}

/* ──────────────────────── Related Products ──────────────────────── */

/* ──────────────────────── Page Component ──────────────────────── */

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();
  // Depends on the visitor's clock, so it can't be part of the prerendered HTML.
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  useEffect(() => setDeliveryEstimate(getDeliveryEstimateMessage()), []);
  // "Buy now" skips the cart: the Stripe session is created as soon as the
  // shopper shows intent (hover / touch / focus) so the click itself redirects.
  const [buyingNow, setBuyingNow] = useState(false);
  const buyNowSession = useRef<{ key: string; promise: Promise<string> } | null>(null);
  const { products, loading } = useCatalog();

  const product = products.find((p) => p.id === id);
  const content = getProductContent(id);
  const navigate = useNavigate();
  const { t } = useI18n();
  const reviewSummary = useReviewSummaries(useMemo(() => (id ? [id] : []), [id]))[id ?? ''];

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'nutrition' | 'specs'>('details');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftName, setGiftName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  const galleryScopeRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const mainImageContainerRef = useRef<HTMLDivElement>(null);
  const [showStickyAtc, setShowStickyAtc] = useState(false);
  const atcRef = useRef<HTMLDivElement>(null);

  // Gallery: generated full-res images first (product shot, then editorial
  // shots from productContent), Stripe images only for products we didn't
  // generate (equipment). Each slide is a manifest key or a plain URL.
  const kind = product ? drinkKind(product) : null;
  const heroName = product
    ? (bottleCounts(product).bottlesFizz + bottleCounts(product).bottlesTea === 1 && (kind === 'fizz' || kind === 'tea')
      ? `bottle-${kind}`
      : IMAGE_MANIFEST[product.id] ? product.id : undefined)
    : undefined;
  const slides: { name?: string; src: string }[] = heroName
    ? [heroName, ...(content.gallery ?? [])].filter((n) => IMAGE_MANIFEST[n]).map((n) => ({ name: n, src: manifestJpg(n)! }))
    : (product?.images ?? []).map((src) => ({ src }));
  const images = slides.map((sl) => sl.src);
  const video = content.video;
  const slideCount = images.length + (video ? 1 : 0);
  const goToPrevSlide = () => setActiveImage((i) => (i === 0 ? slideCount - 1 : i - 1));
  const goToNextSlide = () => setActiveImage((i) => (i === slideCount - 1 ? 0 : i + 1));

  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setActiveImage(0);
    setQuantity(1);
    setSelectedPriceId(null);
  }

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

  // Track this product as recently viewed.
  useRecentlyViewed(product?.id);

  useEffect(() => {
    if (!product) return;
    trackPixelEvent('ViewContent', {
      content_ids: [product.id],
      contents: [{ id: product.id, quantity: 1, item_price: oneTimeForProduct?.unitAmount ?? defaultPrice(product)?.unitAmount ?? 0, name: product.name }],
      content_type: 'product',
      content_name: product.name,
      value: oneTimeForProduct?.unitAmount ?? defaultPrice(product)?.unitAmount ?? 0,
      currency: 'THB',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const isVariantProduct = !!product && hasVariantPrices(product);

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

  const keepScroll = (useLocation().state as { keepScroll?: boolean } | null)?.keepScroll;
  useEffect(() => {
    if (keepScroll) return; // switching pack size: stay on the picker
    window.scrollTo(0, 0);
  }, [id, loading, keepScroll]);

  // Show sticky mobile ATC when the main CTA scrolls out of view.
  useEffect(() => {
    const el = atcRef.current;
    if (!el || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyAtc(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [id]);

  useReveal(
    galleryScopeRef,
    (reveal) => {
      reveal(heroRef.current, { y: 20, immediate: true });
      reveal(infoRef.current, { y: 20, delay: 0.15, immediate: true });
    },
    [id, product?.id],
  );

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-warm-white">
        <div className="max-w-[1100px] mx-auto px-6 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <Skeleton className="w-full h-[480px] md:h-[600px] rounded-xxl mb-4" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-20 h-20 rounded-xl" />)}
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-9 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-8" />
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-14 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product || !selectedPrice) return <NotFound />;

  const stock = stockStatus(product);
  const lineTotal = (selectedPrice.unitAmount ?? 0) * quantity;

  const buildCartItem = (): CartItem => ({
      id: selectedPrice.priceId,
      priceId: selectedPrice.priceId,
      productId: product.id,
      name: product.name,
      variant: isVariantProduct && selectedSize && selectedType
        ? `${selectedSize} · ${selectedType}`
        : product.id,
      price: selectedPrice.unitAmount ?? 0,
      quantity,
      image: thumbUrl(product.id, product.images[0] ?? ''),
      badge: product.badge ?? '',
      badgeColor: product.badgeColor ?? 'bg-sky-500',
      isSubscription: !!selectedPrice.recurring,
      interval: selectedPrice.recurring ? intervalLabel(selectedPrice.recurring) : undefined,
      ...bottleCounts(product),
      isGift,
      recipientEmail: isGift ? giftEmail : undefined,
      recipientName: isGift ? giftName : undefined,
      giftMessage: isGift ? giftMessage : undefined,
  });

  const handleAdd = () => {
    if (stock === 'out_of_stock') return;
    addItem(buildCartItem());
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdded(false), 800);
  };

  const buyNowKey = `${selectedPrice.priceId}:${quantity}:${isGift ? `${giftName}|${giftEmail}|${giftMessage}` : ''}`;

  /** Start creating the checkout session early; safe to call repeatedly. */
  const prefetchBuyNow = () => {
    if (stock === 'out_of_stock' || buyNowSession.current?.key === buyNowKey) return;
    const promise = startCheckout([buildCartItem()], { prefetch: true });
    promise.catch(() => { if (buyNowSession.current?.promise === promise) buyNowSession.current = null; });
    buyNowSession.current = { key: buyNowKey, promise };
  };

  const handleBuyNow = async () => {
    if (stock === 'out_of_stock' || buyingNow) return;
    setBuyingNow(true);
    try {
      const item = buildCartItem();
      trackInitiateCheckout([item]);
      const pending = buyNowSession.current?.key === buyNowKey ? buyNowSession.current.promise : null;
      let url: string;
      try {
        url = pending ? await pending : await startCheckout([item], { prefetch: true });
      } catch {
        // The early attempt failed (e.g. rate limited): try once more for real.
        url = await startCheckout([item], { prefetch: true });
      }
      window.location.href = url;
    } catch (err) {
      setBuyingNow(false);
      toast.error(err instanceof Error ? err.message : 'Could not start checkout. Please try again.');
    }
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

  const productUrl = `${SITE_URL}/product/${product.id}`;
  const absImages = images.map((src) => (src.startsWith('http') ? src : `${SITE_URL}${src}`));
  const ogCard = OG_IMAGES.has(product.id) ? `${SITE_URL}/images/og/${product.id}.jpg` : null;
  const description = content.longDescription ?? product.description ?? '';
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    image: absImages,
    brand: { '@type': 'Brand', name: isEquipment ? (product.metadata.brand ?? 'KegLand') : 'GingerBros' },
    sku: product.id,
    category: isEquipment ? 'Homebrewing equipment' : 'Beverages > Ginger drinks',
    ...(reviewSummary && reviewSummary.count > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: reviewSummary.average.toFixed(1), reviewCount: reviewSummary.count } }
      : {}),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: (selectedPrice.currency ?? 'thb').toUpperCase(),
      price: selectedPrice.unitAmount ?? 0,
      availability: stock === 'out_of_stock' ? 'https://schema.org/OutOfStock' : stock === 'low_stock' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'GingerBros' },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 100, currency: 'THB' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'TH' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 4, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'TH',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 1,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
      { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
    ],
  };
  const packOpts = kind === 'fizz' || kind === 'tea' ? packOptions(products, kind) : [];
  const packIndex = packOpts.findIndex((o) => o.product.id === product.id);

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title={`${product.name}${isEquipment ? '' : kind === 'tea' ? ' | Ginger Drink Made in Thailand' : kind === 'fizz' ? ' | Ginger Soda Made in Thailand' : ' | Ginger Fizz & Tea Bundle'} | GingerBros`}
        description={(content.headline ?? description).slice(0, 300)}
        path={`/product/${product.id}`}
        image={ogCard ?? absImages[0] ?? undefined}
        imageWidth={ogCard ? 1200 : undefined}
        imageHeight={ogCard ? 630 : undefined}
        type="product"
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-12 md:pb-16">

        {/* ── Hero: Gallery + Info ── */}
        <div ref={galleryScopeRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* Gallery */}
          <div ref={heroRef} className="relative">
            {/* The button must be `h-full`, not `max-h-full`: a percentage
                max-height resolves against an *auto*-height parent as `none`,
                so the image ignored it, rendered at its natural pixel size and
                got cropped by the container's `overflow-hidden`, the "zoomed
                in" bottle. Giving the button a definite height makes
                `max-h-full` on the image resolve, and `object-contain` finally
                does what it says. */}
            <div
              ref={mainImageContainerRef}
              className={`relative rounded-[28px] overflow-hidden mb-3 aspect-square max-h-[52vh] sm:aspect-[4/5] sm:max-h-[78vh] w-full flex items-center justify-center select-none ${kind === 'tea' ? 'bg-[radial-gradient(circle_at_50%_60%,#5C3D1E_0%,#1E1A17_100%)]' : 'bg-[radial-gradient(circle_at_50%_60%,#F2B632_0%,#D4A34B_60%,#C9963A_100%)]'}`}
            >
              {video && activeImage === images.length ? (
                <video src={video} controls autoPlay muted loop playsInline className="max-h-full max-w-full object-contain" />
              ) : (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute inset-0 cursor-zoom-in"
                  aria-label={`Open ${product.name} image gallery`}
                >
                  <ResponsiveImage
                    key={activeImage}
                    name={slides[activeImage]?.name}
                    src={slides[activeImage]?.src ?? slides[0]?.src}
                    alt={activeImage === 0 ? product.name : `${product.name}, photo ${activeImage + 1}`}
                    priority={activeImage === 0}
                    sizes="(min-width: 1024px) 600px, 100vw"
                    className={`h-full w-full pointer-events-none ${slides[activeImage]?.name?.startsWith('life-') ? 'object-cover' : 'object-contain p-6 md:p-10'}`}
                    draggable={false}
                  />
                </button>
              )}
              {slideCount > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevSlide();
                    }}
                    aria-label="Previous photo"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 text-deep-brown shadow-md hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNextSlide();
                    }}
                    aria-label="Next photo"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 text-deep-brown shadow-md hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {slides.length > 1 && slides.map((sl, i) => (
                <button key={i} onClick={() => setActiveImage(i)} aria-label={`View ${product.name} photo ${i + 1}`} aria-current={activeImage === i} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 bg-cream transition-all ${activeImage === i ? 'border-charcoal' : 'border-transparent hover:border-soft-peach'}`}>
                  <img src={sl.name ? thumbUrl(sl.name, sl.src) : optimizedImageUrl(sl.src, 160)} alt="" loading="lazy" decoding="async" className={`w-full h-full ${sl.name?.startsWith('life-') ? 'object-cover' : 'object-contain p-1'}`} />
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
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex flex-wrap items-center gap-1.5 font-body text-[13px] text-earth">
                <li><Link to="/" className="hover:text-deep-brown">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link to="/shop" className="inline-flex items-center gap-1 hover:text-deep-brown"><ArrowLeftIcon className="w-3.5 h-3.5" />Shop</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="font-semibold text-deep-brown">{product.name}</li>
              </ol>
            </nav>

            {/* Brand (equipment) or Badge (drinks) */}
            {isEquipment && (
              <span className="inline-flex items-center font-body font-semibold text-[11px] uppercase tracking-[0.1em] text-rust/70 mb-3">
                KegLand · Duotight
              </span>
            )}

            {/* Name */}
            <h1 className="font-poster text-deep-brown text-[clamp(2.4rem,6vw,4rem)] mb-3">
              {product.name}
            </h1>
            {reviewSummary && reviewSummary.count > 0 && (
              <a href="#reviews" className="mb-3 inline-flex items-center gap-1.5 font-body text-[13px] text-earth hover:text-deep-brown">
                <span aria-hidden="true" className="text-amber">{'★'.repeat(Math.round(reviewSummary.average))}</span>
                {reviewSummary.average.toFixed(1)} · {reviewSummary.count} review{reviewSummary.count === 1 ? '' : 's'}
              </a>
            )}

            {/* Headline */}
            {content.headline && (
              <p className="font-display font-semibold text-deep-brown text-[1.15rem] leading-snug mb-5">
                {content.headline}
              </p>
            )}

            {/* Price + Stock */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-display font-semibold text-deep-brown text-3xl">฿{selectedPrice.unitAmount}</span>
              {selectedPrice.recurring && (
                <span className="font-body font-medium text-[15px] text-rust">{intervalLabel(selectedPrice.recurring)}</span>
              )}
              <span className={`flex items-center gap-1.5 font-body font-medium text-[13px] ${stock === 'out_of_stock' ? 'text-earth/80' : stock === 'low_stock' ? 'text-amber-ink' : 'text-green-ink'}`}>
                <span className={`w-2 h-2 rounded-full ${stock === 'out_of_stock' ? 'bg-earth/40' : stock === 'low_stock' ? 'bg-amber' : 'bg-accent-green'}`} />
                {stock === 'out_of_stock' ? 'Out of Stock' : stock === 'low_stock' ? 'Low Stock' : 'In Stock'}
              </span>
            </div>

            {/* Pack size: each pack is its own product page */}
            {packOpts.length > 1 && packIndex >= 0 && !selectedPrice.recurring && (
              <div className="mb-6 max-w-[440px]">
                <PackPicker
                  options={packOpts}
                  value={packIndex}
                  onChange={(i) => navigate(`/product/${packOpts[i].product.id}`, { replace: true, state: { keepScroll: true } })}
                  label={`${product.name}: ${t('packSize')}`}
                />
                {packOpts[packIndex].bottles > 1 && (
                  <p className="mt-2 font-body text-[13px] text-earth">
                    ฿{packOpts[packIndex].perBottle} {t('perBottle')}
                    {packOpts[packIndex].saving > 0 && <> · <span className="font-semibold text-green-ink">{t('youSave')} ฿{packOpts[packIndex].saving}</span></>}
                  </p>
                )}
              </div>
            )}

            {/* Mix & match (drinks, one-time purchase) */}
            {!selectedPrice.recurring && !isEquipment && kind && <MixStrip products={products} currentId={product.id} />}

            {/* Back-in-stock alert signup */}
            {stock === 'out_of_stock' && (
              <div className="mb-6">
                <p className="text-sm text-earth mb-2">Get notified when this is back:</p>
                <StockAlertForm productId={product.stripeProductId} />
              </div>
            )}

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
                  <p className="font-body text-[12px] text-earth/80 mt-3">Selected: {selectedSize} · {selectedType}</p>
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
                          {save > 0 && <span className="font-body font-semibold text-[11px] text-green-ink">Save {save}%</span>}
                        </span>
                        <span className="flex items-baseline gap-1.5">
                          {save > 0 && oneTimeForProduct?.unitAmount != null && <span className="font-body text-[12px] text-earth/80 line-through">฿{oneTimeForProduct.unitAmount}</span>}
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
                      <li className="flex items-start gap-2"><CheckIcon className="text-green-ink flex-shrink-0 mt-0.5" /> Delivered {intervalLabel(selectedPrice.recurring)}, never run out</li>
                      <li className="flex items-start gap-2"><CheckIcon className="text-green-ink flex-shrink-0 mt-0.5" /> A lower price than one-time, locked in</li>
                      <li className="flex items-start gap-2"><CheckIcon className="text-green-ink flex-shrink-0 mt-0.5" /> Pause, skip, or cancel anytime</li>
                    </ul>
                  </div>
                ) : oneTimeForProduct && maxSavings > 0 && (
                  <button onClick={() => { const c = product.prices.filter((p) => p.recurring).sort((a, b) => (a.unitAmount ?? 0) - (b.unitAmount ?? 0))[0]; if (c) setSelectedPriceId(c.priceId); }}
                    className="mt-3 w-full flex items-center justify-between gap-3 rounded-xl border-2 border-amber bg-amber/10 px-4 py-3.5 text-left hover:bg-amber/20 transition-colors group">
                    <div>
                      <p className="font-display font-bold text-deep-brown text-[15px] leading-tight">Subscribe &amp; Save {maxSavings}%</p>
                      <p className="font-body text-[12px] text-earth/80 mt-0.5">Auto-delivery · pause or cancel anytime</p>
                    </div>
                    <span className="flex-shrink-0 bg-deep-brown text-cream font-body font-semibold text-[12px] uppercase tracking-[0.06em] px-3.5 py-1.5 rounded-full group-hover:bg-rust transition-colors">Switch →</span>
                  </button>
                )}
              </div>
            )}

            {/* Short description (from Stripe) */}
            {description && (
              <p className="font-body text-earth text-[16px] leading-relaxed mb-8">
                {description}
              </p>
            )}

            {/* ── Quantity + Add to Cart ── */}
            <div ref={atcRef} className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 border-2 border-soft-peach rounded-full py-1.5 px-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" className="text-earth hover:text-deep-brown transition-colors p-2"><MinusIcon /></button>
                  <span className="font-body font-medium text-earth min-w-[24px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(24, quantity + 1))} aria-label="Increase quantity" className="text-earth hover:text-deep-brown transition-colors p-2"><PlusIcon /></button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={stock === 'out_of_stock'}
                  className={`font-body font-medium text-sm uppercase tracking-[0.08em] px-10 py-3.5 rounded-full transition-all duration-200 active:scale-[0.98] ${
                    added
                      ? 'bg-accent-green text-white'
                      : stock === 'out_of_stock'
                      ? 'bg-soft-peach text-earth/80 cursor-not-allowed active:scale-100'
                      : 'bg-amber text-deep-brown hover:bg-warm-gold'
                  }`}
                >
                  {added ? 'Added to Cart!' : stock === 'out_of_stock' ? 'Out of Stock' : `Add to Cart · ฿${lineTotal}`}
                </button>
              </div>
              {stock !== 'out_of_stock' && (
                <button
                  onClick={handleBuyNow}
                  onPointerEnter={prefetchBuyNow}
                  onTouchStart={prefetchBuyNow}
                  onFocus={prefetchBuyNow}
                  disabled={buyingNow}
                  data-testid="buy-now"
                  className="mt-3 w-full sm:w-auto font-body font-medium text-sm uppercase tracking-[0.08em] px-10 py-3.5 rounded-full bg-deep-brown text-cream hover:bg-rust transition-colors duration-200 active:scale-[0.98] disabled:opacity-70"
                >
                  {buyingNow ? 'Taking you to checkout…' : 'Buy now'}
                </button>
              )}

              {/* Processing time notice (equipment only) */}
              {isEquipment && (
                <p className="mt-4 font-body font-semibold text-[13px] text-rust">
                  ⏱ 5 days processing time
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
                      <label htmlFor="gift-recipient-name" className="sr-only">Recipient name</label>
                      <input id="gift-recipient-name" type="text" value={giftName} onChange={(e) => setGiftName(e.target.value)} placeholder="Recipient name" data-testid="gift-name" className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/80 focus:outline-none focus:ring-2 focus:ring-rust/30" />
                      <label htmlFor="gift-recipient-email" className="sr-only">Recipient email</label>
                      <input id="gift-recipient-email" type="email" value={giftEmail} onChange={(e) => setGiftEmail(e.target.value)} placeholder="Recipient email" data-testid="gift-email" className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/80 focus:outline-none focus:ring-2 focus:ring-rust/30" />
                      <label htmlFor="gift-message" className="sr-only">Gift message</label>
                      <textarea id="gift-message" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} placeholder="Gift message (optional)" rows={3} data-testid="gift-message" className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/80 focus:outline-none focus:ring-2 focus:ring-rust/30 resize-none" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delivery estimate */}
            {!isEquipment && (
              <p className="font-body text-[13px] text-green-ink mb-6 min-h-[1.25rem]">
                {deliveryEstimate}
              </p>
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
              <p className="font-body text-[13px] text-earth/80 italic border-t border-soft-peach/40 pt-4">
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
                    <div key={feat} className="flex items-start gap-3 bg-cream/60 rounded-xl px-4 py-3.5">
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
                  <div className="rounded-2xl overflow-hidden border border-soft-peach/60">
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
                  <p className="font-body text-[13px] text-earth/80 italic pt-2">Works perfectly with other KegLand and Duotight components.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Drinks: taste, serves, pairings ── */}
        {!isEquipment && (content.tasting || content.serves || content.pairings) && (
          <section aria-labelledby="taste-title" className="mt-16 grid gap-6 lg:grid-cols-3">
            {content.tasting && (
              <div className={`rounded-[24px] p-7 ${kind === 'tea' ? 'bg-charcoal text-cream' : 'bg-ginger text-charcoal'}`}>
                <h2 id="taste-title" className="font-poster text-[2rem]">Tastes like</h2>
                <p className="mt-3 font-body text-[15px] leading-relaxed">{content.tasting}</p>
                {(kind === 'fizz' || kind === 'tea') && (
                  <div className="mt-6"><TasteMeter kind={kind} tone={kind === 'tea' ? 'dark' : 'light'} /></div>
                )}
              </div>
            )}
            {content.serves && (
              <div className="rounded-[24px] bg-cream p-7">
                <h2 className="font-poster text-[2rem] text-deep-brown">How to serve</h2>
                <ol className="mt-4 space-y-4">
                  {content.serves.map((sv, i) => (
                    <li key={sv.title} className="flex gap-3">
                      <span aria-hidden="true" className="font-poster text-[1.6rem] leading-none text-rust">{i + 1}</span>
                      <div>
                        <h3 className="font-display text-[1.05rem] font-bold text-deep-brown">{sv.title}</h3>
                        <p className="font-body text-[14px] text-earth">{sv.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link to="/guide" className="mt-5 inline-block font-body text-[13px] font-semibold text-deep-brown underline underline-offset-4">More serves in the Ginger Guide →</Link>
              </div>
            )}
            {content.pairings && (
              <div className="rounded-[24px] border-2 border-charcoal/10 bg-white p-7">
                <h2 className="font-poster text-[2rem] text-deep-brown">Pairs with</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {content.pairings.map((d) => (
                    <li key={d} className="rounded-full bg-cream px-3.5 py-1.5 font-body text-[14px] font-medium text-deep-brown">{d}</li>
                  ))}
                </ul>
                <Link to="/guide/ginger-and-thai-food" className="mt-5 inline-block font-body text-[13px] font-semibold text-deep-brown underline underline-offset-4">The Thai food pairing cheat sheet →</Link>
              </div>
            )}
          </section>
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
                    className={`flex-shrink-0 font-body font-medium text-[13px] sm:text-[14px] uppercase tracking-[0.08em] pb-3 transition-colors border-b-2 -mb-px whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-t ${activeTab === tab ? 'text-deep-brown border-amber' : 'text-earth/80 border-transparent hover:text-earth'}`}
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
                            <CheckIcon className="text-green-ink flex-shrink-0 mt-0.5" />
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
            <h2 className="font-poster text-deep-brown text-[clamp(2rem,5vw,3rem)] mb-8 flex items-center gap-4">
              You might also like
              <span className="flex-1 h-px bg-soft-peach/60 hidden sm:block" />
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rp) => (
                <CompactCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}

        <RecentlyViewed currentProductId={product.id} />

        <ProductReviews key={product.id} productId={product.id} productName={product.name} />

        <ImageLightbox
          images={images}
          activeIndex={activeImage}
          productName={product.name}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onChange={setActiveImage}
        />

        {/* Sticky mobile Add to Cart bar */}
        {showStickyAtc && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-warm-white/95 backdrop-blur-xl border-t border-soft-peach/50 px-4 py-3 md:hidden">
            <div className="flex items-center gap-3 max-w-[1280px] mx-auto">
              <img src={thumbUrl(heroName ?? product.id, product.images[0] ?? '')} alt="" className="h-11 w-11 flex-shrink-0 rounded-lg bg-cream object-contain p-0.5" />
              <span className="min-w-0 flex-1 truncate font-display text-[14px] font-bold text-deep-brown">{product.name}</span>
              <div className="flex items-center gap-3 border-2 border-soft-peach rounded-full py-2 px-3 flex-shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-earth hover:text-deep-brown transition-colors"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="font-body font-medium text-earth min-w-[20px] text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(24, quantity + 1))}
                  className="text-earth hover:text-deep-brown transition-colors"
                  aria-label="Increase quantity"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={stock === 'out_of_stock'}
                className={`flex-shrink-0 px-4 font-body font-bold text-[13px] uppercase tracking-[0.06em] py-3 rounded-full transition-all duration-200 active:scale-[0.98] ${
                  added
                    ? 'bg-accent-green text-white'
                    : stock === 'out_of_stock'
                    ? 'bg-soft-peach text-earth/80 cursor-not-allowed active:scale-100'
                    : 'bg-amber text-deep-brown hover:bg-warm-gold'
                }`}
              >
                {added ? 'Added!' : stock === 'out_of_stock' ? 'Out of Stock' : `Add · ฿${lineTotal}`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
