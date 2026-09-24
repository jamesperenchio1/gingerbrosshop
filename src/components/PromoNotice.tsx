import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usePromo } from '@/lib/promo';

const TOASTED_KEY = 'gbros-promo-toasted';

function label(percentOff: number | null, amountOff: number | null) {
  if (percentOff) return `${percentOff}% off`;
  if (amountOff) return `฿${amountOff} off`;
  return 'Discount';
}

/** Tells the shopper their promo is active: a toast on arrival, then a small pill. */
export default function PromoNotice() {
  const promo = usePromo();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!promo) return;
    try {
      if (sessionStorage.getItem(TOASTED_KEY) === promo.code) return;
      sessionStorage.setItem(TOASTED_KEY, promo.code);
    } catch {
      // toast may repeat if storage is blocked
    }
    toast.success(`${label(promo.percentOff, promo.amountOff)} applied`, {
      description: `Code ${promo.code} is taken off at checkout.`,
      duration: 6000,
    });
  }, [promo]);

  if (!promo || hidden) return null;

  return (
    <div
      role="status"
      className="fixed left-3 bottom-3 z-40 flex items-center gap-2 rounded-full bg-deep-brown text-cream pl-4 pr-2 py-2 shadow-lg font-body text-[13px]"
    >
      <span>
        <strong className="font-semibold">{label(promo.percentOff, promo.amountOff)}</strong> applied · {promo.code}
      </span>
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label="Hide discount notice"
        className="w-6 h-6 rounded-full hover:bg-white/15 leading-none"
      >
        ×
      </button>
    </div>
  );
}
