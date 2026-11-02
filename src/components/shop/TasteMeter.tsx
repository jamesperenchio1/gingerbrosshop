import { useI18n } from '@/context/I18nContext';
import { TASTE, type DrinkKind } from '@/lib/drinks';

/** Four little 1–5 bars: ginger kick, citrus, fizz/spice, sweetness. */
export default function TasteMeter({ kind, tone = 'light' }: { kind: DrinkKind; tone?: 'light' | 'dark' }) {
  const { t } = useI18n();
  const on = tone === 'dark' ? 'bg-ginger' : 'bg-deep-brown';
  const off = tone === 'dark' ? 'bg-cream/20' : 'bg-deep-brown/15';
  const label = tone === 'dark' ? 'text-cream/85' : 'text-earth';
  return (
    <dl className="grid grid-cols-2 gap-x-5 gap-y-2.5">
      {TASTE[kind].map(({ key, value }) => (
        <div key={key}>
          <dt className={`font-body text-[11px] uppercase tracking-[0.1em] mb-1 ${label}`}>{t(key)}</dt>
          <dd className="flex gap-1" aria-label={`${value} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= value ? on : off}`} />
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
