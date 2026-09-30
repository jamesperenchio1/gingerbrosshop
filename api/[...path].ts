import type { VercelRequest, VercelResponse } from '@vercel/node';

type Handler = (req: VercelRequest, res: VercelResponse) => unknown | Promise<unknown>;
// Handlers are loaded on demand so a cold start only pays for the code (and
// SDKs: Resend, Blob, ...) of the endpoint actually being hit.
type Loader = () => Promise<{ default: Handler }>;

// One serverless function fans out to every JSON endpoint, keyed by the first
// path segment after /api. URLs are unchanged (e.g. /api/checkout still works),
// so nothing on the frontend changes. The Stripe webhook stays its own function
// because it needs the raw request body for signature verification.
const routes: Record<string, Loader> = {
  'checkout': () => import('./_lib/handlers/checkout.js'),
  'products': () => import('./_lib/handlers/products.js'),
  'admin': () => import('./_lib/handlers/admin.js'),
  'track-order': () => import('./_lib/handlers/track-order.js'),
  'order-details': () => import('./_lib/handlers/order-details.js'),
  'portal': () => import('./_lib/handlers/portal.js'),
  'referral': () => import('./_lib/handlers/referral.js'),
  'save-cart': () => import('./_lib/handlers/save-cart.js'),
  'subscribe': () => import('./_lib/handlers/subscribe.js'),
  'verify-email': () => import('./_lib/handlers/verify-email.js'),
  'shipping-rate': () => import('./_lib/handlers/shipping-rate.js'),
  'abandoned-cart-check': () => import('./_lib/handlers/abandoned-cart-check.js'),
  'credit': () => import('./_lib/handlers/credit.js'),
  'wholesale': () => import('./_lib/handlers/wholesale.js'),
  'stock-alert': () => import('./_lib/handlers/stock-alert.js'),
  'share-cart': () => import('./_lib/handlers/share-cart.js'),
  'orders-by-email': () => import('./_lib/handlers/orders-by-email.js'),
  'email-tracking': () => import('./_lib/handlers/email-tracking.js'),
  'reviews': () => import('./_lib/handlers/reviews.js'),
  'links': () => import('./_lib/handlers/links.js'),
  'links-admin': () => import('./_lib/handlers/links-admin.js'),
  'auth': () => import('./_lib/handlers/auth.js'),
  'promo': () => import('./_lib/handlers/promo.js'),
  // /q/<slug> QR short links are rewritten here (see vercel.json)
  'q': () => import('./_lib/handlers/links.js'),
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

  const load = Object.prototype.hasOwnProperty.call(routes, route) ? routes[route] : undefined;
  if (!load) {
    res.status(404).json({ error: `Not found: /api/${route}` });
    return;
  }

  const { default: fn } = await load();
  return fn(req, res);
}
