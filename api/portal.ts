import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  const { customer_email } = req.body ?? {};
  if (!customer_email) {
    res.status(400).json({ error: 'Customer email required' });
    return;
  }

  const stripe = new Stripe(secret);

  try {
    // Find or create customer
    const customers = await stripe.customers.list({ email: customer_email, limit: 1 });
    let customerId = customers.data[0]?.id;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: customer_email });
      customerId = customer.id;
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.origin ?? 'https://gingerbrosshop.com'}/`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    res.status(500).json({ error: message });
  }
}
