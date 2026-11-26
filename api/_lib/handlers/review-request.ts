import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrders, updateOrder } from '../orders.js';
import { getResend, MAIL_FROM, reviewRequestHtml } from '../email.js';
import { getStripe } from '../stripe.js';

const SITE_URL = 'https://gingerbrosshop.com';

/** Long enough that the bottles are drunk, short enough that they remember. */
const MIN_AGE_DAYS = 7;
const MAX_AGE_DAYS = 30;
/** Safety valve: a backlog (or a bad deploy) must never blast the whole list. */
const MAX_SENDS_PER_RUN = 50;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Resolve the Stripe product ids on an order to the public PDP path. Orders
 * store `line_items[].price.product`, not our `app_id`, so the catalog is the
 * only honest mapping. Failures fall back to the shop page rather than blocking
 * the send.
 */
async function productUrlMap(): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return urls;

  try {
    const stripe = getStripe(secret);
    const products = await stripe.products.list({ active: true, limit: 100 }).autoPagingToArray({ limit: 1000 });
    for (const product of products) {
      const appId = product.metadata?.app_id;
      // Delivery-fee and other internal products have no storefront page.
      if (!appId || product.metadata?.hidden === 'true') continue;
      urls.set(product.id, `${SITE_URL}/product/${appId}`);
    }
  } catch (err) {
    console.error('review-request: could not load product catalog:', err);
  }

  return urls;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Only Vercel Cron (Bearer CRON_SECRET) may trigger this.
  const auth = req.headers.authorization;
  const cronToken = process.env.CRON_SECRET;
  if (!cronToken || auth !== `Bearer ${cronToken}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const orders = await getOrders();
  const now = Date.now();

  // Anyone who has already been asked once is never asked again, even if they
  // ordered again later — one review request per customer, not per order.
  const alreadyAsked = new Set(
    orders
      .filter((order) => order.reviewRequestedAt && order.customerEmail)
      .map((order) => order.customerEmail!.toLowerCase())
  );

  const due = orders
    .filter((order) => {
      if (!order.customerEmail) return false;
      // `status` mirrors Stripe's payment_status: paid | unpaid | no_payment_required.
      // Admin cancellations overwrite it with `cancelled`.
      if (order.status !== 'paid') return false;
      if (order.isGift) return false;
      if (order.reviewRequestedAt) return false;
      if (alreadyAsked.has(order.customerEmail.toLowerCase())) return false;

      const createdAt = new Date(order.createdAt).getTime();
      if (!Number.isFinite(createdAt)) return false;
      const age = now - createdAt;
      return age >= MIN_AGE_DAYS * DAY_MS && age <= MAX_AGE_DAYS * DAY_MS;
    })
    .slice(0, MAX_SENDS_PER_RUN);

  if (due.length === 0) {
    res.status(200).json({ checked: orders.length, due: 0, sent: 0 });
    return;
  }

  const urls = await productUrlMap();
  const resend = getResend();
  let sent = 0;

  for (const order of due) {
    if (!resend) break;

    const items = order.items
      .filter((item) => item.id && urls.has(item.id))
      .map((item) => ({ name: item.description, url: urls.get(item.id)! }))
      .slice(0, 3);

    // Nothing purchasable to link to (e.g. a delivery-only line item) — still
    // worth asking, so point at the shop where both drinks live.
    const targets = items.length > 0 ? items : [{ name: 'GingerBros', url: `${SITE_URL}/shop` }];
    const subject =
      items.length === 1 ? `How was your ${order.items[0]?.description ?? 'ginger'}?` : 'How was your ginger?';

    try {
      await resend.emails.send({
        from: MAIL_FROM,
        to: order.customerEmail!,
        subject,
        html: reviewRequestHtml(order.customerName, targets),
      });
      await updateOrder(order.sessionId, { reviewRequestedAt: new Date().toISOString() });
      alreadyAsked.add(order.customerEmail!.toLowerCase());
      sent++;
    } catch (err) {
      console.error(`review-request: failed to send for ${order.sessionId}:`, err);
    }
  }

  res.status(200).json({ checked: orders.length, due: due.length, sent });
}
