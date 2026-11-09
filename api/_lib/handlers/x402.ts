import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
import { getStripe } from '../stripe.js';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { multiBuyDiscount, bottlesFromMetadata, type BottleLine } from '../multiBuy.js';
import { saveOrder, type Order } from '../orders.js';
import { getResend, MAIL_FROM, FROM_EMAIL, SELLER_EMAIL } from '../email.js';
import {
  USDC_BASE,
  MAX_ORDER_THB,
  shippingThb,
  thbToUsdcAtomic,
  validateDelivery,
} from '../x402Pricing.js';

// x402 (HTTP 402) checkout. An agent POSTs an order to /api/x402/order, gets a
// 402 quoting the exact USDC price (Base mainnet), pays, and the order is
// recorded and the seller emailed for fulfilment. Payments settle directly to
// the shop wallet through the PayAI facilitator. Stripe is only read for prices.
const PAY_TO = '0x941eb61c0052da28d09e39f7ddc946a9631a5eeb';
const FACILITATOR = 'https://facilitator.payai.network';
const ORDER_URL = 'https://gingerbrosshop.com/api/x402/order';
const RATE_URL = 'https://api.frankfurter.dev/v1/latest?base=THB&symbols=USD';

interface Line {
  priceId: string;
  quantity: number;
}

/** USD per THB, fixed for each UTC hour so a quote and its payment use the same rate. */
async function usdPerThb(): Promise<number> {
  const redis = Redis.fromEnv();
  const key = `x402:rate:${new Date().toISOString().slice(0, 13)}`;
  try {
    const cached = await redis.get<number>(key);
    if (cached && cached > 0) return Number(cached);
  } catch {
    /* fall through to a live fetch */
  }
  const r = await fetch(RATE_URL, { signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error('Exchange rate unavailable');
  const rate = Number(((await r.json()) as any)?.rates?.USD);
  if (!(rate > 0) || rate > 1) throw new Error('Exchange rate unavailable');
  try {
    await redis.set(key, rate, { ex: 7200 });
  } catch {
    /* non-fatal */
  }
  return rate;
}

function requirements(amount: string, description: string) {
  return {
    scheme: 'exact',
    network: 'base',
    maxAmountRequired: amount,
    resource: ORDER_URL,
    description,
    mimeType: 'application/json',
    payTo: PAY_TO,
    maxTimeoutSeconds: 60,
    asset: USDC_BASE,
    extra: { name: 'USD Coin', version: '2' },
  };
}

function v2Header(r: ReturnType<typeof requirements>, error: string) {
  return Buffer.from(
    JSON.stringify({
      x402Version: 2,
      error,
      resource: { url: r.resource, description: r.description, mimeType: r.mimeType },
      accepts: [
        {
          scheme: r.scheme,
          network: 'eip155:8453',
          amount: r.maxAmountRequired,
          asset: r.asset,
          payTo: r.payTo,
          maxTimeoutSeconds: r.maxTimeoutSeconds,
          extra: r.extra,
        },
      ],
    }),
  ).toString('base64');
}

function challenge(res: VercelResponse, r: ReturnType<typeof requirements>, error: string) {
  res.setHeader('PAYMENT-REQUIRED', v2Header(r, error));
  res.setHeader('Cache-Control', 'no-store');
  res.status(402).json({ x402Version: 1, error, accepts: [r] });
}

async function facilitator(path: 'verify' | 'settle', payload: unknown) {
  const r = await fetch(`${FACILITATOR}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(25000),
  });
  return (await r.json()) as Record<string, any>;
}

/** Price the cart from Stripe's own prices (never the client's) and the deal rules. */
async function quote(items: Line[], coldChain: boolean) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('Store not configured');
  const stripe = getStripe(secret);

  const merged = new Map<string, number>();
  for (const it of items) {
    const qty = Math.max(1, Math.min(24, Math.floor(Number(it.quantity) || 1)));
    merged.set(it.priceId, (merged.get(it.priceId) ?? 0) + qty);
  }

  let subtotalThb = 0;
  const bottleLines: BottleLine[] = [];
  const lines: Order['items'] = [];
  for (const [priceId, qty] of merged) {
    let price: Stripe.Price;
    try {
      price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
    } catch {
      throw new Error(`Unknown product: ${priceId}`);
    }
    const product = price.product as Stripe.Product | string | Stripe.DeletedProduct;
    if (!price.active || price.recurring || price.currency !== 'thb' || typeof product === 'string' || (product as Stripe.DeletedProduct).deleted) {
      throw new Error(`Not available for x402 checkout: ${priceId}`);
    }
    const p = product as Stripe.Product;
    if (!p.active || p.metadata?.hidden === 'true' || p.metadata?.stock_status === 'out_of_stock') {
      throw new Error(`Not available: ${p.name}`);
    }
    const unitThb = (price.unit_amount ?? 0) / 100;
    subtotalThb += unitThb * qty;
    bottleLines.push({
      price: unitThb,
      quantity: qty,
      bottlesFizz: bottlesFromMetadata(p.metadata?.bottles_fizz),
      bottlesTea: bottlesFromMetadata(p.metadata?.bottles_tea),
    });
    lines.push({ id: p.id, description: p.name, quantity: qty, amountTotal: Math.round(unitThb * qty * 100) });
  }

  const afterDeals = subtotalThb - multiBuyDiscount(bottleLines);
  const totalThb = afterDeals + shippingThb(afterDeals, coldChain);
  if (!(totalThb > 0)) throw new Error('Empty order');
  if (totalThb > MAX_ORDER_THB) throw new Error(`x402 orders are limited to ฿${MAX_ORDER_THB}. Split the order or use card checkout.`);
  const rate = await usdPerThb();
  return { lines, totalThb, amount: thbToUsdcAtomic(totalThb, rate) };
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = (req.url ?? '').split('?')[0].replace(/\/+$/, '');
  const isOrder = path.endsWith('/x402/order');

  // Discovery probe (/api, /api/v1, /api/x402): describes the order endpoint with
  // an example quote — one Ginger Tea (฿119) delivered (฿100). No payment is taken here.
  if (!isOrder) {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    try {
      const amount = thbToUsdcAtomic(219, await usdPerThb());
      challenge(res, requirements(amount, 'GingerBros x402 checkout. Example price: 1 Ginger Tea delivered in Thailand. POST your order (items, email, name, phone, address) to /api/x402/order for an exact quote.'), 'POST an order to /api/x402/order');
    } catch {
      res.status(503).json({ error: 'Pricing temporarily unavailable' });
    }
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST /api/x402/order' });
    return;
  }

  const { allowed } = await rateLimit({ key: `x402:${getClientIp(req)}`, limit: 20, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }

  const body = (req.body ?? {}) as Record<string, any>;
  const items = (Array.isArray(body.items) ? body.items : [])
    .map((i: any) => ({ priceId: String(i?.priceId ?? i?.id ?? ''), quantity: Number(i?.quantity) }))
    .filter((i: Line) => i.priceId) as Line[];
  if (items.length === 0 || items.length > 20) {
    res.status(400).json({ error: 'items must be 1-20 entries of { priceId, quantity }' });
    return;
  }
  const delivery = validateDelivery(body);
  if (!delivery.ok) {
    res.status(400).json({ error: delivery.error });
    return;
  }
  const coldChain = body.coldChain === true;

  let priced: Awaited<ReturnType<typeof quote>>;
  try {
    priced = await quote(items, coldChain);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unable to price order' });
    return;
  }

  const accepts = requirements(priced.amount, `GingerBros order: ${priced.lines.map((l) => `${l.quantity}x ${l.description}`).join(', ')} (฿${priced.totalThb} incl. delivery)`.slice(0, 250));
  const header = req.headers['x-payment'];
  const payment = Array.isArray(header) ? header[0] : header;
  if (!payment) return challenge(res, accepts, 'X-PAYMENT header is required');

  let payload: any;
  try {
    payload = JSON.parse(Buffer.from(payment, 'base64').toString('utf8'));
  } catch {
    return challenge(res, accepts, 'Invalid X-PAYMENT header');
  }

  const redis = Redis.fromEnv();
  const nonce = String(payload?.payload?.authorization?.nonce ?? '');
  if (!/^0x[0-9a-fA-F]{64}$/.test(nonce)) return challenge(res, accepts, 'Invalid payment authorization');
  const factBody = { x402Version: 1, paymentPayload: payload, paymentRequirements: accepts };

  try {
    const verified = await facilitator('verify', factBody);
    if (!verified.isValid) return challenge(res, accepts, verified.invalidReason || 'Payment invalid');

    // One authorization can only ever buy one order.
    const first = await redis.set(`x402:nonce:${nonce}`, '1', { nx: true, ex: 60 * 60 * 24 * 7 });
    if (!first) {
      res.status(409).json({ error: 'This payment was already used' });
      return;
    }
    const settled = await facilitator('settle', factBody);
    if (!settled.success) {
      await redis.del(`x402:nonce:${nonce}`);
      return challenge(res, accepts, settled.errorReason || 'Settlement failed');
    }

    // Money has moved: record the order and tell the seller. Everything below
    // is best-effort and never turns a settled payment into an error.
    const tx = String(settled.transaction ?? '');
    const orderId = `x402_${tx}`;
    const usdc = (Number(priced.amount) / 1e6).toFixed(2);
    const order: Order = {
      sessionId: orderId,
      paymentIntentId: null,
      subscriptionId: null,
      customerEmail: delivery.email,
      customerName: delivery.name,
      customerPhone: delivery.phone,
      shippingAddress: delivery.address,
      items: priced.lines,
      amountTotal: priced.totalThb * 100,
      currency: 'THB',
      status: 'paid',
      mode: 'payment',
      orderNote: [`Paid ${usdc} USDC on Base, tx ${tx}`, coldChain ? 'Cold-chain delivery' : '', delivery.note].filter(Boolean).join('\n'),
      source: 'x402',
      createdAt: new Date().toISOString(),
      trackingNumber: null,
      trackingCarrier: null,
    };
    try {
      await saveOrder(order);
    } catch (err) {
      console.error('x402 saveOrder failed:', err);
    }

    const resend = getResend();
    const summary = `${priced.lines.map((l) => `${l.quantity}x ${esc(l.description)}`).join('<br>')}<br><br>Total: ฿${priced.totalThb} (${usdc} USDC)<br>Tx: ${esc(tx)}`;
    const ship = `${esc(delivery.name)}<br>${esc(delivery.address.line1)} ${esc(delivery.address.line2)}<br>${esc(delivery.address.city)} ${esc(delivery.address.state)} ${esc(delivery.address.postal_code)}<br>${esc(delivery.phone)} · ${esc(delivery.email)}`;
    if (resend && SELLER_EMAIL) {
      resend.emails
        .send({
          from: `GingerBros Orders <${FROM_EMAIL}>`,
          to: SELLER_EMAIL,
          subject: `New x402 (USDC) order ${orderId.slice(-8).toUpperCase()}, ฿${priced.totalThb}`,
          html: `<p><strong>Paid in USDC on Base. Please fulfil.</strong>${coldChain ? ' Cold-chain delivery.' : ''}</p><p>${summary}</p><p><strong>Ship to</strong><br>${ship}</p>${delivery.note ? `<p>Note: ${esc(delivery.note)}</p>` : ''}`,
        })
        .catch((err) => console.error('x402 seller email failed:', err));
    } else {
      console.warn('[x402] RESEND_API_KEY or SELLER_EMAIL missing — order', orderId, 'was paid but the seller was not emailed');
    }
    if (resend) {
      resend.emails
        .send({
          from: MAIL_FROM,
          to: delivery.email,
          subject: `Your GingerBros order ${orderId.slice(-8).toUpperCase()}`,
          html: `<p>Thanks for your order! We received your payment of ${usdc} USDC.</p><p>${summary}</p><p>We'll ship to:<br>${ship}</p><p>Track it at https://gingerbrosshop.com/track with this email and order number ${orderId.slice(-8).toUpperCase()}.</p>`,
        })
        .catch((err) => console.error('x402 customer email failed:', err));
    }

    res.setHeader('X-PAYMENT-RESPONSE', Buffer.from(JSON.stringify(settled)).toString('base64'));
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ orderId: orderId.slice(-8).toUpperCase(), transaction: tx, totalThb: priced.totalThb, paidUsdc: usdc });
  } catch (err) {
    console.error('x402 order error:', err);
    res.status(502).json({ error: 'Payment could not be processed. You were not charged unless a transaction hash was returned.' });
  }
}
