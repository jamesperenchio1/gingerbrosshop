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
