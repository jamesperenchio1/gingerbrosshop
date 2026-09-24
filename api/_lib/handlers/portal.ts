import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripe } from '../stripe.js';
import { rateLimit, getClientIp } from '../rateLimit.js';

/**
 * Stripe customer portal.
 *
 * Access is keyed to the checkout `session_id`, which only the purchaser has
 * (it comes from the success-page URL). Looking a customer up by email would let
 * anyone open anyone's portal. Without a session_id we fall back to Stripe's own
 * email-code login page, if it has been enabled in the dashboard.
 *
 * POST returns { url }; GET redirects, so a plain link works.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isGet = req.method === 'GET';
  if (req.method !== 'POST' && !isGet) {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { allowed } = await rateLimit({ key: `portal:${getClientIp(req)}`, limit: 20, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  const raw = isGet ? req.query.session_id : req.body?.session_id;
  const sessionId = typeof raw === 'string' && /^cs_[A-Za-z0-9_]+$/.test(raw) ? raw : null;

  const stripe = getStripe(secret);
  const origin = (req.headers.origin as string | undefined) ?? 'https://gingerbrosshop.com';
  const send = (url: string) => (isGet ? res.redirect(303, url) : res.status(200).json({ url }));

  try {
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
      if (customerId) {
        const portal = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${origin}/`,
        });
        send(portal.url);
        return;
      }
    }

    const configs = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 });
    const loginUrl = configs.data[0]?.login_page?.enabled ? configs.data[0].login_page.url : null;
    if (loginUrl) {
      send(loginUrl);
      return;
    }
    res.status(404).json({ error: 'Customer portal is not available for this order.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    res.status(500).json({ error: message });
  }
}
