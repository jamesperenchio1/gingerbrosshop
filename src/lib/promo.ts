import { useEffect, useState } from 'react';

const STORAGE_KEY = 'gbros-promo';
const CHANGE_EVENT = 'gbros-promo-change';

export interface PromoInfo {
  code: string;
  percentOff: number | null;
  /** Fixed amount off, in baht. */
  amountOff: number | null;
}

export function getStoredPromo(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredPromo(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code.trim().toUpperCase());
  } catch {
    // storage unavailable: the code just won't persist
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearStoredPromo() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Saves `?promo=CODE` from the landing URL and strips it from the address bar. */
export function capturePromoFromUrl() {
  try {
    const url = new URL(window.location.href);
    const promo = url.searchParams.get('promo');
    if (!promo) return;
    if (/^[A-Za-z0-9_-]{3,40}$/.test(promo)) setStoredPromo(promo);
    url.searchParams.delete('promo');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  } catch {
    // ignore malformed URLs
  }
}

/** What a percentage or fixed promo takes off a subtotal, in baht. */
export function promoDiscount(promo: PromoInfo | null, subtotal: number): number {
  if (!promo) return 0;
  if (promo.percentOff) return Math.round((subtotal * promo.percentOff) / 100);
  if (promo.amountOff) return Math.min(promo.amountOff, subtotal);
  return 0;
}

/** The shopper's stored promo, checked against Stripe. Null when none or invalid. */
export function usePromo(): PromoInfo | null {
  const [code, setCode] = useState<string | null>(getStoredPromo);
  const [info, setInfo] = useState<PromoInfo | null>(null);

  useEffect(() => {
    const sync = () => setCode(getStoredPromo());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    fetch(`/api/promo?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.valid) setInfo({ code: d.code ?? code, percentOff: d.percentOff ?? null, amountOff: d.amountOff ?? null });
        else {
          setInfo(null);
          clearStoredPromo(); // expired or used: stop advertising it
        }
      })
      .catch(() => {
        if (!cancelled) setInfo(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return code ? info : null;
}
