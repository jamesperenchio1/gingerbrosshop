import type { VercelRequest, VercelResponse } from '@vercel/node';

import checkout from './_lib/handlers/checkout.js';
import products from './_lib/handlers/products.js';
import admin from './_lib/handlers/admin.js';
import trackOrder from './_lib/handlers/track-order.js';
import orderDetails from './_lib/handlers/order-details.js';
import portal from './_lib/handlers/portal.js';
import referral from './_lib/handlers/referral.js';
import saveCart from './_lib/handlers/save-cart.js';
import subscribe from './_lib/handlers/subscribe.js';
import shippingRate from './_lib/handlers/shipping-rate.js';
import abandonedCartCheck from './_lib/handlers/abandoned-cart-check.js';
import credit from './_lib/handlers/credit.js';

type Handler = (req: VercelRequest, res: VercelResponse) => unknown | Promise<unknown>;

// One serverless function fans out to every JSON endpoint, keyed by the first
// path segment after /api. URLs are unchanged (e.g. /api/checkout still works),
// so nothing on the frontend changes. The Stripe webhook stays its own function
// because it needs the raw request body for signature verification.
const routes: Record<string, Handler> = {
  'checkout': checkout,
  'products': products,
  'admin': admin,
  'track-order': trackOrder,
  'order-details': orderDetails,
  'portal': portal,
  'referral': referral,
  'save-cart': saveCart,
  'subscribe': subscribe,
  'shipping-rate': shippingRate,
  'abandoned-cart-check': abandonedCartCheck,
  'credit': credit,
};

/**
 * Resolve the first path segment after `/api`. We parse `req.url` rather than
 * relying on the `[...path]` catch-all query param, which Vercel does not
 * populate reliably for plain Node functions. Falls back to the query param
 * when present.
 */
function resolveRoute(req: VercelRequest): string {
  const pathParam = req.query.path;
  if (Array.isArray(pathParam) && pathParam.length > 0) return pathParam[0];
  if (typeof pathParam === 'string' && pathParam) return pathParam.split('/')[0];

  const pathname = (req.url ?? '').split('?')[0];
  const segments = pathname.split('/').filter(Boolean); // e.g. ['api', 'products'] or ['products']
  const start = segments[0] === 'api' ? 1 : 0;
  return segments[start] ?? '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const route = resolveRoute(req);

  const fn = routes[route];
  if (!fn) {
    res.status(404).json({ error: `Not found: /api/${route}` });
    return;
  }

  return fn(req, res);
}
