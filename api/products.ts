import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Stripe treats most currencies as 2-decimal (minor units). These are the
// zero-decimal currencies where unit_amount is already the major-unit value.
const ZERO_DECIMAL = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg',
  'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
]);

function toMajorUnits(amount: number | null, currency: string): number | null {
  if (amount == null) return null;
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? amount : amount / 100;
}

interface CatalogPrice {
  priceId: string;
  appId: string | null;
  unitAmount: number | null;
  currency: string;
  nickname: string | null;
  recurring: { interval: string; intervalCount: number } | null;
}

interface CatalogProduct {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  const stripe = new Stripe(secret);

  try {
    // Pull every active price and its (expanded) product in one pass — this is
    // the source of truth, so anything added in Stripe shows up automatically.
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
      expand: ['data.product'],
    });

    const productMap = new Map<string, CatalogProduct>();

    for (const price of prices.data) {
      const product = price.product;
      // Skip prices whose product is deleted or archived.
      if (typeof product === 'string' || product.deleted || !product.active) {
        continue;
      }

      const metadata = product.metadata ?? {};
      const appId = metadata.app_id || product.id;

      if (!productMap.has(product.id)) {
        productMap.set(product.id, {
          id: appId,
          stripeProductId: product.id,
          name: product.name,
          description: product.description ?? null,
          images: product.images ?? [],
          badge: metadata.badge ?? null,
          badgeColor: metadata.badge_color ?? null,
          metadata,
          prices: [],
        });
      }

      productMap.get(product.id)!.prices.push({
        priceId: price.id,
        appId: price.metadata?.app_id ?? null,
        unitAmount: toMajorUnits(price.unit_amount, price.currency),
        currency: price.currency,
        nickname: price.nickname ?? null,
        recurring: price.recurring
          ? { interval: price.recurring.interval, intervalCount: price.recurring.interval_count }
          : null,
      });
    }

    // Sort one-time prices first, then by amount, so the default buy option is stable.
    const products = Array.from(productMap.values()).map((p) => ({
      ...p,
      prices: p.prices.sort((a, b) => {
        if (!!a.recurring !== !!b.recurring) return a.recurring ? 1 : -1;
        return (a.unitAmount ?? 0) - (b.unitAmount ?? 0);
      }),
    }));

    // Cache at the edge: fast, but new Stripe changes appear within a minute.
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({ products });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    res.status(500).json({ error: message });
  }
}
