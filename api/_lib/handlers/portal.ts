import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripe } from '../stripe.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // POST returns JSON { url }; GET (e.g. a plain link) redirects straight to the
  // portal so the success-page button works without any client-side fetch.
  const isGet = req.method === 'GET';
  if (req.method !== 'POST' && !isGet) {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  const customerEmail = isGet
    ? ((req.query.email ?? req.query.customer_email) as string | undefined)
    : (req.body?.customer_email as string | undefined);
  if (!customerEmail) {
    res.status(400).json({ error: 'Customer email required' });
    return;
  }

  const stripe = getStripe(secret);
  const origin = (req.headers.origin as string | undefined) ?? 'https://gingerbrosshop.com';

  try {
    // Find or create customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId = customers.data[0]?.id;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: customerEmail });
      customerId = customer.id;
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
    });

    if (isGet) {
      res.redirect(303, portalSession.url);
      return;
    }
    res.status(200).json({ url: portalSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    res.status(500).json({ error: message });
  }
}
