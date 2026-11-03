import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import * as Tabs from '@radix-ui/react-tabs';
import { useI18n } from '@/context/I18nContext';
import { useCatalog } from '@/lib/catalog';
import { packOptions, mixOptions, groupEquipment } from '@/lib/drinks';
import { useReviewSummaries } from '@/lib/reviews';
import DrinkCard from '@/components/shop/DrinkCard';
import CompactCard from '@/components/shop/CompactCard';
import { Skeleton } from '@/components/ui/skeleton';

type Tab = 'drinks' | 'equipment';
const TAB_KEY = 'shopTab';

function Loading() {
  return (
    <div className="space-y-8">
      {[0, 1].map((i) => (
        <Skeleton key={i} className="h-[520px] w-full rounded-[28px]" />
      ))}
    </div>
  );
}

/** Ginger Fizz + Ginger Tea (with pack sizes), the mixed bundles, subscription strip. */
export function DrinksLineup({ headingLevel = 'h3' }: { headingLevel?: 'h2' | 'h3' }) {
  const { t } = useI18n();
  const { products, loading, error } = useCatalog();
  const ids = useMemo(() => products.map((p) => p.id), [products]);
  const reviews = useReviewSummaries(ids);
  const fizz = packOptions(products, 'fizz');
  const tea = packOptions(products, 'tea');
  const mix = mixOptions(products);
  const subscribable = fizz.find((o) => o.product.prices.some((p) => p.recurring));

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 font-body text-earth">We couldn&apos;t load the shop just now. This is on us, not on your connection.</p>
        <button onClick={() => window.location.reload()} className="rounded-full bg-charcoal px-6 py-3 font-body text-sm font-semibold uppercase tracking-[0.08em] text-cream">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-10">
      {fizz.length > 0 && <DrinkCard kind="fizz" options={fizz} review={reviews[fizz[0].product.id]} priority headingLevel={headingLevel} />}
      {tea.length > 0 && <DrinkCard kind="tea" options={tea} review={reviews[tea[0].product.id]} headingLevel={headingLevel} />}

      {mix.length > 0 && (
        <div className="rounded-[28px] bg-cream/70 p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-poster text-[2rem] text-deep-brown">{t('mixMatchTitle')}</h3>
            <p className="font-body text-[14px] text-earth">{t('mixMatchSub')}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {mix.map((o) => (
              <CompactCard key={o.product.id} product={o.product} perBottle={o.perBottle} saving={o.saving} landscape />
            ))}
          </div>
        </div>
      )}

      {subscribable && (
        <Link
          to={`/product/${subscribable.product.id}?plan=weekly`}
          className="flex flex-col items-start justify-between gap-3 rounded-[28px] bg-charcoal p-6 text-cream transition-colors hover:bg-deep-brown sm:flex-row sm:items-center sm:p-8"
        >
          <span className="font-body text-[15px] leading-relaxed text-cream/90">{t('subscribeStrip')}</span>
          <span className="flex-shrink-0 rounded-full bg-ginger px-5 py-2.5 font-body text-[13px] font-bold uppercase tracking-[0.08em] text-charcoal">
            {t('subscribeStripCta')} →
          </span>
        </Link>
      )}
    </div>
  );
}

function EquipmentGrid() {
  const { products } = useCatalog();
  const groups = groupEquipment(products.filter((p) => p.category === 'brewing-equipment'));
  return (
    <div className="space-y-10">
      <p className="max-w-[560px] font-body text-earth">KegLand and Five Star gear for kegging, carbonating and pouring at home.</p>
      {groups.map((g) => (
        <section key={g.label} aria-labelledby={`eq-${g.label}`}>
          <h3 id={`eq-${g.label}`} className="mb-4 font-display text-[1.4rem] font-bold text-deep-brown">{g.label}</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {g.items.map((p) => <CompactCard key={p.id} product={p} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * The shop. On the homepage it's just the drinks lineup; on /shop it adds the
 * Drinks / Brewing Equipment tabs.
 */
export default function Shop({ variant = 'home' }: { variant?: 'home' | 'page' }) {
  const { t } = useI18n();
  const { products } = useCatalog();
  const hasEquipment = products.some((p) => p.category === 'brewing-equipment');
  const [tab, setTab] = useState<Tab>('drinks');

  // Restore the remembered tab after hydration so the first render matches the prerendered HTML.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring the saved tab after hydration
      if (sessionStorage.getItem(TAB_KEY) === 'equipment') setTab('equipment');
    } catch { /* storage unavailable */ }
  }, []);

  const changeTab = (v: string) => {
    const next = v === 'equipment' ? 'equipment' : 'drinks';
    setTab(next);
    try { sessionStorage.setItem(TAB_KEY, next); } catch { /* ignore */ }
  };

  const isPage = variant === 'page';
  const Title = isPage ? 'h1' : 'h2';

  return (
    <section id="shop" aria-labelledby="shop-title" className={`bg-warm-white ${isPage ? 'pb-20 pt-28 md:pt-32' : 'py-16 md:py-24'}`}>
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <header className="mb-10 md:mb-14">
          <span className="font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-rust">{t(isPage ? 'shopLabel' : 'lineupLabel')}</span>
          <Title id="shop-title" className="font-poster mt-3 text-[clamp(2.6rem,7vw,5.5rem)] text-deep-brown">
            {t(isPage ? 'shopTitle' : 'lineupTitle')}
          </Title>
          <p className="mt-4 max-w-[560px] font-body text-[16px] leading-relaxed text-earth">{t('shopSub')}</p>
        </header>

        {isPage && hasEquipment ? (
          <Tabs.Root value={tab} onValueChange={changeTab}>
            <Tabs.List aria-label="Shop categories" className="mb-10 flex gap-2 overflow-x-auto">
              {(['drinks', 'equipment'] as const).map((v) => (
                <Tabs.Trigger
                  key={v}
                  value={v}
                  className="whitespace-nowrap rounded-full border-2 border-charcoal px-5 py-2.5 font-body text-[13px] font-bold uppercase tracking-[0.1em] text-charcoal transition-colors data-[state=active]:bg-charcoal data-[state=active]:text-cream"
                >
                  {t(v === 'drinks' ? 'shopTabDrinks' : 'shopTabEquipment')}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content value="drinks" className="outline-none">
              <DrinksLineup headingLevel="h2" />
            </Tabs.Content>
            <Tabs.Content value="equipment" className="outline-none">
              <EquipmentGrid />
            </Tabs.Content>
          </Tabs.Root>
        ) : (
          <DrinksLineup headingLevel={isPage ? 'h2' : 'h3'} />
        )}

        {!isPage && hasEquipment && (
          <p className="mt-10 text-center font-body text-[14px] text-earth">
            Homebrewer? <Link to="/shop" className="font-semibold text-deep-brown underline underline-offset-4">Browse brewing equipment →</Link>
          </p>
        )}
      </div>
    </section>
  );
}
