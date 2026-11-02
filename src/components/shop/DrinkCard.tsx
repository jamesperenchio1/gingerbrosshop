import { useState } from 'react';
import { Link } from 'react-router';
import { useI18n } from '@/context/I18nContext';
import ResponsiveImage from '@/components/ResponsiveImage';
import StarRating from '@/components/StarRating';
import TasteMeter from '@/components/shop/TasteMeter';
import PackPicker from '@/components/shop/PackPicker';
import { useAddProduct } from '@/components/shop/useAddProduct';
import { prefetchProductDetail } from '@/lib/prefetch';
import { stockStatus } from '@/lib/catalog';
import type { DrinkKind, PackOption } from '@/lib/drinks';
import type { ReviewSummary } from '@/lib/reviews';

const THEME: Record<DrinkKind, { panel: string; card: string; ink: string; sub: string; button: string }> = {
  fizz: {
    panel: 'bg-[radial-gradient(circle_at_50%_60%,#F2B632_0%,#D4A34B_55%,#C9963A_100%)]',
    card: 'bg-warm-white border border-soft-peach',
    ink: 'text-deep-brown',
    sub: 'text-earth',
    button: 'bg-charcoal text-cream hover:bg-deep-brown',
  },
  tea: {
    panel: 'bg-[radial-gradient(circle_at_50%_60%,#5C3D1E_0%,#2B211A_60%,#1E1A17_100%)]',
    card: 'bg-charcoal border border-charcoal',
    ink: 'text-cream',
    sub: 'text-cream/85',
    button: 'bg-ginger text-charcoal hover:bg-amber',
  },
};

interface Props {
  kind: DrinkKind;
  options: PackOption[];
  review?: ReviewSummary;
  /** First card on the page: load its image at high priority. */
  priority?: boolean;
  headingLevel?: 'h2' | 'h3';
}

/**
 * One drink, every pack size. Picking a pack swaps the image, price and link
 * to that pack's own Stripe product, so "Ginger Fizz ×6" is one tap away
 * instead of a separate card further down the page.
 */
export default function DrinkCard({ kind, options, review, priority, headingLevel = 'h3' }: Props) {
  const { t } = useI18n();
  const add = useAddProduct();
  const [index, setIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const theme = THEME[kind];
  const selected = options[Math.min(index, options.length - 1)];
  if (!selected) return null;
  const { product } = selected;
  const out = stockStatus(product) === 'out_of_stock';
  const Heading = headingLevel;
  const name = t(kind === 'fizz' ? 'fizzName' : 'teaName');

  const onAdd = () => {
    if (add(product)) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1200);
    }
  };

  return (
    <article
      onMouseEnter={prefetchProductDetail}
      onFocus={prefetchProductDetail}
      className={`grid md:grid-cols-[1.05fr_1fr] rounded-[28px] overflow-hidden shadow-card ${theme.card}`}
    >
      <Link
        to={`/product/${product.id}`}
        className={`relative block aspect-square md:aspect-auto md:min-h-[520px] ${theme.panel}`}
        aria-label={`${product.name}: view details`}
      >
        <ResponsiveImage
          name={selected.bottles === 1 ? `bottle-${kind}` : product.id}
          src={product.images[0]}
          alt={product.name}
          priority={priority}
          sizes="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw"
          className={`absolute inset-0 h-full w-full object-contain transition-transform duration-500 hover:scale-[1.03] ${selected.bottles === 1 ? 'px-6 py-8 md:py-12' : 'p-6 md:p-10'}`}
        />
        {product.badge && (
          <span className="absolute left-5 top-5 rounded-full bg-charcoal px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-ginger">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="flex flex-col p-6 sm:p-8 lg:p-10">
        <span className={`font-body text-[12px] font-semibold uppercase tracking-[0.14em] ${kind === 'tea' ? 'text-ginger' : 'text-rust'}`}>
          {t(kind === 'fizz' ? 'fizzThai' : 'teaThai')}
        </span>
        <Heading className={`font-poster mt-2 text-[clamp(2.4rem,5vw,3.6rem)] ${theme.ink}`}>{name}</Heading>
        <p className={`mt-2 font-display text-[1.15rem] font-semibold ${theme.ink}`}>{t(kind === 'fizz' ? 'fizzTagline' : 'teaTagline')}</p>
        {review && review.count > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <StarRating value={Math.round(review.average)} size={14} />
            <span className={`font-body text-[12px] ${theme.sub}`}>({review.count})</span>
          </div>
        )}
        <p className={`mt-4 font-body text-[15px] leading-relaxed ${theme.sub}`}>{t(kind === 'fizz' ? 'fizzDesc' : 'teaDesc')}</p>

        <div className="mt-6">
          <TasteMeter kind={kind} tone={kind === 'tea' ? 'dark' : 'light'} />
        </div>

        <div className="mt-7">
          <PackPicker options={options} value={index} onChange={setIndex} tone={kind === 'tea' ? 'dark' : 'light'} label={`${name}: ${t('packSize')}`} />
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <div className={`font-display text-[2.2rem] font-extrabold leading-none ${theme.ink}`}>฿{selected.price}</div>
            <div className={`mt-1 font-body text-[13px] ${theme.sub}`}>
              ฿{selected.perBottle} {t('perBottle')}
              {selected.saving > 0 && (
                <span className="ml-2 rounded-full bg-green-ink px-2 py-0.5 text-[11px] font-semibold text-white">
                  {t('youSave')} ฿{selected.saving}
                </span>
              )}
            </div>
          </div>
          <Link to={`/product/${product.id}`} className={`font-body text-[13px] font-semibold underline underline-offset-4 ${theme.ink}`}>
            {t('viewDetails')}
          </Link>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={out}
          data-testid={kind === 'fizz' ? 'add-to-cart' : 'add-to-cart-tea'}
          className={`mt-5 w-full rounded-full py-4 font-body text-[14px] font-bold uppercase tracking-[0.1em] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${added ? 'bg-green-ink text-white' : theme.button}`}
        >
          {out ? t('outOfStock') : added ? '✓ Added' : `${t('addToCart')} · ฿${selected.price}`}
        </button>
      </div>
    </article>
  );
}
