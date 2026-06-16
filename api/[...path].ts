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
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathParam = req.query.path;
  const segments = Array.isArray(pathParam) ? pathParam : pathParam ? [pathParam] : [];
  const route = segments[0] ?? '';

  const fn = routes[route];
  if (!fn) {
    res.status(404).json({ error: `Not found: /api/${segments.join('/')}` });
    return;
  }

  return fn(req, res);
}
