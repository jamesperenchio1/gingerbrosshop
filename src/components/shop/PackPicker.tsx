import { useRef, type KeyboardEvent } from 'react';
import { useI18n } from '@/context/I18nContext';
import type { PackOption } from '@/lib/drinks';

interface Props {
  options: PackOption[];
  value: number;
  onChange: (index: number) => void;
  tone?: 'light' | 'dark';
  label: string;
}

/** Radio-group of pack sizes (×1 ×2 ×3 ×6), arrow-key navigable. */
export default function PackPicker({ options, value, onChange, tone = 'light', label }: Props) {
  const { t } = useI18n();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (value + dir + options.length) % options.length;
    onChange(next);
    refs.current[next]?.focus();
  };

  const idle = tone === 'dark' ? 'border-cream/25 text-cream hover:border-cream/60' : 'border-deep-brown/20 text-deep-brown hover:border-deep-brown/60';
  const active = tone === 'dark' ? 'border-ginger bg-ginger text-charcoal' : 'border-charcoal bg-charcoal text-cream';
  const eyebrow = tone === 'dark' ? 'text-cream/85' : 'text-earth';

  return (
    <div>
      <div className={`mb-2 font-body text-[11px] uppercase tracking-[0.12em] ${eyebrow}`}>{t('packSize')}</div>
      <div role="radiogroup" aria-label={label} onKeyDown={onKey} className="grid grid-cols-4 gap-2">
        {options.map((o, i) => (
          <button
            key={o.product.id}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={i === value}
            tabIndex={i === value ? 0 : -1}
            onClick={() => onChange(i)}
            className={`relative rounded-2xl border-2 px-1 py-2.5 text-center transition-colors ${i === value ? active : idle}`}
          >
            <span className="block font-display text-[1.15rem] font-extrabold leading-none">×{o.bottles}</span>
            <span className="mt-1 block font-body text-[11px] opacity-90">฿{o.price}</span>
            {o.saving > 0 && i !== value && (
              <span aria-hidden="true" className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-green-ink px-1.5 text-[9px] font-bold text-white">
                -฿{o.saving}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
