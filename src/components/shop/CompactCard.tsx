import { useState } from 'react';
import { Link } from 'react-router';
import { useI18n } from '@/context/I18nContext';
import ResponsiveImage from '@/components/ResponsiveImage';
import { useAddProduct } from '@/components/shop/useAddProduct';
import { prefetchProductDetail } from '@/lib/prefetch';
import { defaultPrice, hasVariantPrices, stockStatus, type CatalogProduct } from '@/lib/catalog';

interface Props {
  product: CatalogProduct;
  /** Optional per-bottle and saving line for drink bundles. */
  perBottle?: number;
  saving?: number;
  subtitle?: string;
  /** Wider, shorter image box (for the two-up mixed bundles). */
  landscape?: boolean;
}

/**
 * Small card: image, name, one line, price, add. Used for the mixed bundles
 * and the equipment tab. Whole card links to the product (stretched link).
 */
export default function CompactCard({ product, perBottle, saving, subtitle, landscape }: Props) {
  const { t } = useI18n();
  const add = useAddProduct();
  const [added, setAdded] = useState(false);
  const price = defaultPrice(product);
  const out = stockStatus(product) === 'out_of_stock';
  const variants = hasVariantPrices(product);
  const line = subtitle ?? product.metadata.short_description ?? product.description ?? '';

  return (
    <article
      onMouseEnter={prefetchProductDetail}
      onFocus={prefetchProductDetail}
      className="group relative flex flex-col rounded-3xl border border-soft-peach bg-white p-4 shadow-panel transition-shadow hover:shadow-panel-hover focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-amber"
    >
      <div className={`relative mb-4 overflow-hidden rounded-2xl bg-cream/60 ${landscape ? 'aspect-[16/10]' : 'aspect-square'}`}>
        <ResponsiveImage
          name={product.id}
          src={product.images[0]}
          alt={product.name}
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
          className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {saving ? (
          <span className="absolute left-3 top-3 rounded-full bg-green-ink px-2.5 py-1 font-body text-[11px] font-bold text-white">
            {t('youSave')} ฿{saving}
          </span>
        ) : null}
      </div>
      <h3 className="font-display text-[1.1rem] font-bold leading-tight text-deep-brown">
        <Link to={`/product/${product.id}`} className="outline-none after:absolute after:inset-0 after:rounded-3xl after:content-['']">
          {product.name}
        </Link>
      </h3>
      {line && <p className="mt-1.5 line-clamp-2 flex-grow font-body text-[13px] leading-snug text-earth">{line}</p>}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <span className="font-display text-[1.35rem] font-extrabold text-deep-brown">฿{price?.unitAmount ?? '—'}</span>
          {perBottle ? <span className="ml-1.5 font-body text-[12px] text-earth">฿{perBottle} {t('perBottle')}</span> : null}
        </div>
        {variants ? (
          <Link to={`/product/${product.id}`} className="relative z-10 rounded-full bg-charcoal px-4 py-2 font-body text-[12px] font-bold uppercase tracking-[0.08em] text-cream hover:bg-deep-brown">
            {t('viewDetails')}
          </Link>
        ) : (
          <button
            type="button"
            disabled={out || !price}
            onClick={() => {
              if (add(product)) {
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1200);
              }
            }}
            aria-label={`${t('addToCart')}: ${product.name}`}
            className={`relative z-10 rounded-full px-4 py-2 font-body text-[12px] font-bold uppercase tracking-[0.08em] transition-colors disabled:opacity-60 ${added ? 'bg-green-ink text-white' : 'bg-charcoal text-cream hover:bg-deep-brown'}`}
          >
            {out ? t('outOfStock') : added ? '✓' : '+ Add'}
          </button>
        )}
      </div>
    </article>
  );
}
