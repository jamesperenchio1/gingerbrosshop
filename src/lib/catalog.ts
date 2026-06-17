import { useEffect, useState } from 'react';

export interface CatalogPrice {
  priceId: string;
  appId: string | null;
  unitAmount: number | null;
  currency: string;
  nickname: string | null;
  recurring: { interval: string; intervalCount: number } | null;
}

export interface CatalogProduct {
  id: string;
  stripeProductId: string;
  name: string;
  description: string | null;
  images: string[];
  badge: string | null;
  badgeColor: string | null;
  metadata: Record<string, string>;
  prices: CatalogPrice[];
}

// Module-level cache so the catalog is fetched once per page load and shared
// across Shop, ProductDetail, etc.
let cache: CatalogProduct[] | null = null;
let inflight: Promise<CatalogProduct[]> | null = null;

export async function fetchCatalog(): Promise<CatalogProduct[]> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch('/api/products')
    .then(async (res) => {
      if (!res.ok) throw new Error('Failed to load catalog');
      const data = (await res.json()) as { products: CatalogProduct[] };
      cache = data.products ?? [];
      return cache;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Human-readable label for a recurring interval, e.g. "every 2 weeks". */
export function intervalLabel(recurring: CatalogPrice['recurring']): string {
  if (!recurring) return 'one-time';
  const { interval, intervalCount } = recurring;
  if (intervalCount === 1) return `per ${interval}`;
  return `every ${intervalCount} ${interval}s`;
}

/** The default (one-time, else cheapest) price for a product. */
export function defaultPrice(product: CatalogProduct): CatalogPrice | undefined {
  return product.prices.find((p) => !p.recurring) ?? product.prices[0];
}

/** The one-time (non-recurring) price for a product, if it has one. */
export function oneTimePrice(product: CatalogProduct): CatalogPrice | undefined {
  return product.prices.find((p) => !p.recurring);
}

/**
 * Whole-number percent saved by `price` versus the one-time `reference` price.
 * Returns 0 when either amount is missing or there's no saving (so callers can
 * cheaply test `savingsPercent(...) > 0`).
 */
export function savingsPercent(price: CatalogPrice, reference: CatalogPrice | undefined): number {
  const base = reference?.unitAmount;
  const amount = price.unitAmount;
  if (!base || amount == null || amount >= base) return 0;
  return Math.round(((base - amount) / base) * 100);
}

/** The largest subscription saving across a product's prices, as a whole percent. */
export function maxSubscriptionSavings(product: CatalogProduct): number {
  const reference = oneTimePrice(product);
  return product.prices.reduce(
    (max, p) => (p.recurring ? Math.max(max, savingsPercent(p, reference)) : max),
    0,
  );
}

/** The cheapest recurring (subscription) price for a product, if any. */
export function cheapestSubscription(product: CatalogProduct): CatalogPrice | undefined {
  return product.prices
    .filter((p) => p.recurring)
    .sort((a, b) => (a.unitAmount ?? 0) - (b.unitAmount ?? 0))[0];
}

export interface UseCatalogResult {
  products: CatalogProduct[];
  loading: boolean;
  error: string | null;
}

export function useCatalog(): UseCatalogResult {
  const [products, setProducts] = useState<CatalogProduct[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchCatalog()
      .then((p) => {
        if (active) {
          setProducts(p);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : 'Failed to load catalog');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { products, loading, error };
}
