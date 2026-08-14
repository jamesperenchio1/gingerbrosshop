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
  category: string | null;
  metadata: Record<string, string>;
  prices: CatalogPrice[];
}

// Module-level cache so the catalog is fetched once per page load and shared
// across Shop, ProductDetail, etc. Also persisted to sessionStorage (matching
// the server's 60s s-maxage) so a full page reload can render immediately
// from stale data while a fresh fetch revalidates in the background.
const CACHE_KEY = 'gb_catalog_v1';
const CACHE_TTL_MS = 60_000;

function readStoredCache(): { products: CatalogProduct[]; ts: number } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as { products: CatalogProduct[]; ts: number }) : null;
  } catch {
    return null;
  }
}

function writeStoredCache(products: CatalogProduct[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ products, ts: Date.now() }));
  } catch {
    // sessionStorage unavailable (private browsing, quota) — in-memory cache still works
  }
}

const stored = typeof window !== 'undefined' ? readStoredCache() : null;
let cache: CatalogProduct[] | null = stored?.products ?? null;
let cacheTimestamp = stored?.ts ?? 0;
let inflight: Promise<CatalogProduct[]> | null = null;

export async function fetchCatalog(): Promise<CatalogProduct[]> {
  if (cache && Date.now() - cacheTimestamp < CACHE_TTL_MS) return cache;
  if (inflight) return inflight;
  inflight = fetch('/api/products')
    .then(async (res) => {
      if (!res.ok) throw new Error('Failed to load catalog');
      const data = (await res.json()) as { products: CatalogProduct[] };
      cache = data.products ?? [];
      cacheTimestamp = Date.now();
      writeStoredCache(cache);
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

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

/**
 * Reads stock status from the Stripe product's `stock_status` metadata key
 * (set it to `low_stock` or `out_of_stock` in the Stripe dashboard to flag a
 * product without fully deactivating it — deactivating removes it from the
 * catalog entirely). Defaults to `in_stock` when unset, since the catalog only
 * ever includes active Stripe products/prices in the first place.
 */
export function stockStatus(product: CatalogProduct): StockStatus {
  const raw = product.metadata.stock_status;
  return raw === 'low_stock' || raw === 'out_of_stock' ? raw : 'in_stock';
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
