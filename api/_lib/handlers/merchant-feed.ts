import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getStripe } from '../stripe.js';

/**
 * Google Merchant Center product feed (RSS 2.0 + the `g:` namespace).
 *
 * Google fetches this URL on its own schedule, which is what puts the drinks in
 * the free Shopping tab listings. Everything comes from the live Stripe catalog
 * so a price or stock edit in the dashboard shows up here without a deploy.
 *
 * Add it in Merchant Center → Products → Feeds → Add feed → "Scheduled fetch",
 * URL https://gingerbrosshop.com/api/merchant-feed.
 */

const SITE = process.env.SITE_URL || 'https://gingerbrosshop.com';
const BRAND = 'GingerBros';
const CURRENCY = 'THB';

/** Free shipping over ฿500, otherwise a flat ฿100 — mirrors src/constants/store.ts. */
const FREE_SHIPPING_THRESHOLD = 500;
const FLAT_SHIPPING = 100;

const ZERO_DECIMAL = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg',
  'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
]);

function toMajorUnits(amount: number | null, currency: string): number | null {
  if (amount == null) return null;
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? amount : amount / 100;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Google wants "140.00 THB", not a symbol and not satang. */
function price(amount: number, currency = CURRENCY): string {
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
}

/** Absolute URL for a catalog image, some of which are site-relative. */
function absoluteImage(src: string | undefined): string | null {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  return `${SITE}${src.startsWith('/') ? '' : '/'}${src}`;
}

interface FeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string | null;
  amount: number;
  currency: string;
  inStock: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  try {
    const stripe = getStripe(secret);
    const allPrices = await stripe.prices
      .list({ active: true, limit: 100, expand: ['data.product'] })
      .autoPagingToArray({ limit: 1000 });

    const byProduct = new Map<string, FeedItem>();

    for (const p of allPrices) {
      // Only one-time prices are sellable as a Shopping listing; a subscription
      // price in the feed gets disapproved for a price mismatch on the landing page.
      if (p.recurring) continue;
      const expanded = p.product;
      if (typeof expanded === 'string' || (expanded as Stripe.DeletedProduct).deleted) continue;

      const product = expanded as Stripe.Product;
      if (!product.active) continue;
      const metadata = product.metadata ?? {};
      if (metadata.hidden === 'true') continue;

      const amount = toMajorUnits(p.unit_amount, p.currency);
      if (amount == null) continue;

      const appId = metadata.app_id || product.id;
      const existing = byProduct.get(product.id);
      // Keep the cheapest one-time price (the single bottle, not the 6-pack).
      if (existing && existing.amount <= amount) continue;

      const description = (product.description ?? '').trim();
      byProduct.set(product.id, {
        id: appId,
        title: product.name,
        // Merchant Center rejects very short descriptions; pad from the name.
        description:
          description.length >= 70
            ? description
            : `${description} ${product.name} by ${BRAND}, made in Thailand.`.trim(),
        link: `${SITE}/product/${appId}`,
        image: absoluteImage(product.images?.[0]),
        amount,
        currency: p.currency,
        inStock: metadata.stock_status !== 'out_of_stock',
      });
    }

    const items = [...byProduct.values()].filter((i) => i.image);

    const body = items
      .map((item) => {
        const shipping = item.amount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
        return `    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.title)}</g:title>
      <g:description>${escapeXml(item.description.slice(0, 5000))}</g:description>
      <g:link>${escapeXml(item.link)}</g:link>
      <g:image_link>${escapeXml(item.image!)}</g:image_link>
      <g:price>${price(item.amount, item.currency)}</g:price>
      <g:availability>${item.inStock ? 'in stock' : 'out of stock'}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(BRAND)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Beverages</g:google_product_category>
      <g:shipping>
        <g:country>TH</g:country>
        <g:service>Standard</g:service>
        <g:price>${price(shipping, item.currency)}</g:price>
      </g:shipping>
    </item>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(BRAND)}</title>
    <link>${SITE}/shop</link>
    <description>Ginger drinks and brewing equipment from ${escapeXml(BRAND)}, Bangkok.</description>
${body}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    res.status(500).json({ error: message });
  }
}
