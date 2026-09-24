import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrders, getOrderBySessionId, updateTracking, updateOrder, type Order } from '../orders.js';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { getResend, MAIL_FROM, SUPPORT_REPLY_TO, shippingNotificationHtml, boxReturnRewardHtml } from '../email.js';
import { addCredit } from '../credits.js';
import { getStripe } from '../stripe.js';
import { isAdminAuthorized, getAdminEmail } from '../adminAuth.js';
import { logAdminAction, getAdminActions } from '../adminLog.js';
import { listOrders, getOrderDetail, refundOrder, cancelOrder, orderNumber } from '../admin/orders.js';
import {
  listSubscriptions,
  getSubscriptionDetail,
  cancelSubscription,
  setSubscriptionPaused,
  updateSubscriptionItems,
  createSubscriptionCheckout,
  createSubscriptionDirect,
  listCustomerPaymentMethods,
} from '../admin/subscriptions.js';
import { listCustomers, getCustomerDetail, updateCustomer } from '../admin/customers.js';
import {
  listProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  archiveProduct,
  createPrice,
  updatePrice,
} from '../admin/products.js';
import {
  listCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listPromotionCodes,
  createPromotionCode,
  updatePromotionCode,
} from '../admin/coupons.js';
import { listInvoices, getInvoiceDetail, sendInvoice, voidInvoice } from '../admin/invoices.js';
import {
  listDisputes,
  getDisputeDetail,
  submitDisputeEvidence,
  listPayouts,
  getBalance,
  createPayout,
  cancelPayout,
  listEvents,
  getEventDetail,
} from '../admin/ops.js';
import { uploadDataUrl } from '../upload.js';

// Default reward for returning the foam box + bottles: ฿50 in satang. A returned
// box saves ~฿80, so ฿50 stays margin-positive while still delighting customers.
const BOX_RETURN_CREDIT = 5000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { allowed } = await rateLimit({ key: `admin:${getClientIp(req)}`, limit: 60, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }

  if (!(await isAdminAuthorized(req))) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const adminEmail = await getAdminEmail(req);
  const resource = String((req.query.resource as string) || (req.body?.resource as string) || '').trim();

  if (resource) {
    try {
      if (resource === 'orders') {
        await handleOrders(req, res, adminEmail);
        return;
      }
      if (resource === 'subscriptions') {
        await handleSubscriptions(req, res, adminEmail);
        return;
      }
      if (resource === 'customers') {
        await handleCustomers(req, res, adminEmail);
        return;
      }
      if (resource === 'products') {
        await handleProducts(req, res, adminEmail);
        return;
      }
      if (resource === 'coupons') {
        await handleCoupons(req, res, adminEmail);
        return;
      }
      if (resource === 'invoices') {
        await handleInvoices(req, res, adminEmail);
        return;
      }
      if (resource === 'ops') {
        await handleOps(req, res, adminEmail);
        return;
      }
      if (resource === 'activity') {
        if (req.method !== 'GET') {
          res.status(405).json({ error: 'Method not allowed' });
          return;
        }
        const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
        res.status(200).json({ actions: await getAdminActions(limit) });
        return;
      }
      res.status(501).json({ error: `Resource "${resource}" is not implemented yet.` });
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      res.status(400).json({ error: message });
      return;
    }
  }

  // ---- Legacy endpoints (kept for backward compatibility) ----
  if (req.method === 'GET') {
    const orders = await getOrders();
    res.status(200).json({ orders });
    return;
  }

  if (req.method === 'POST') {
    const body = req.body ?? {};

    if (body.action === 'grant-credit') {
      await handleGrantCredit(body, res, adminEmail);
      return;
    }

    if (body.action === 'grant-code') {
      await handleGrantCode(body, res, adminEmail);
      return;
    }

    await handleTracking(body, res, adminEmail);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

// ---------------------------------------------------------------------------
// Orders resource
// ---------------------------------------------------------------------------

async function handleOrders(req: VercelRequest, res: VercelResponse, adminEmail: string | null) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const stripe = secret ? getStripe(secret) : null;

  if (req.method === 'GET') {
    if (!stripe) {
      res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
      return;
    }
    const action = String((req.query.action as string) || 'list');
    if (action === 'get') {
      const id = String((req.query.id as string) || '');
      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }
      res.status(200).json({ order: await getOrderDetail(stripe, id) });
      return;
    }
    const result = await listOrders(stripe, {
      limit: Number(req.query.limit) || 25,
      startingAfter: (req.query.cursor as string) || undefined,
      status: (req.query.status as string) || undefined,
      email: (req.query.email as string) || undefined,
    });
    res.status(200).json(result);
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const action = String(body.action || '');

  if (action === 'refund') {
    if (!stripe) {
      res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
      return;
    }
    const sessionId = String(body.sessionId || '');
    if (!sessionId) {
      res.status(400).json({ error: 'Missing sessionId' });
      return;
    }
    requireConfirm(body, orderNumber(sessionId));
    const reason = String(body.reason || '').trim();
    if (reason.length < 3) {
      res.status(400).json({ error: 'A reason is required (at least 3 characters).' });
      return;
    }
    const amount = Number.isFinite(body.amount) && body.amount > 0 ? Math.round(body.amount) : undefined;

    const result = await refundOrder(stripe, {
      sessionId,
      amount,
      reason,
      reasonCode: body.reasonCode,
      adminEmail,
    });

    const local = await getOrderBySessionId(sessionId);
    if (local) {
      const fullyRefunded = result.refundableRemaining <= 0;
      await updateOrder(sessionId, { status: fullyRefunded ? 'refunded' : 'partially_refunded' });
    }

    await logAdminAction({
      email: adminEmail,
      resource: 'orders',
      action: 'refund',
      target: orderNumber(sessionId),
      amount: result.amount,
      reason,
      result: 'success',
      detail: result.refundId,
    });

    res.status(200).json({ success: true, ...result });
    return;
  }

  if (action === 'cancel') {
    if (!stripe) {
      res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
      return;
    }
    const sessionId = String(body.sessionId || '');
    if (!sessionId) {
      res.status(400).json({ error: 'Missing sessionId' });
      return;
    }
    requireConfirm(body, orderNumber(sessionId));
    const reason = String(body.reason || '').trim();
    if (reason.length < 3) {
      res.status(400).json({ error: 'A reason is required (at least 3 characters).' });
      return;
    }

    const result = await cancelOrder(stripe, { sessionId, reason, adminEmail });
    const local = await getOrderBySessionId(sessionId);
    if (local) await updateOrder(sessionId, { status: 'cancelled' });

    await logAdminAction({
      email: adminEmail,
      resource: 'orders',
      action: 'cancel',
      target: orderNumber(sessionId),
      amount: result.kind === 'refunded' ? result.amount : null,
      reason,
      result: 'success',
      detail: result.kind,
    });

    res.status(200).json({ success: true, ...result });
    return;
  }

  if (action === 'note') {
    const sessionId = String(body.sessionId || '');
    const note = String(body.note || '').trim();
    if (!sessionId || !note) {
      res.status(400).json({ error: 'Missing sessionId or note' });
      return;
    }
    const order = await updateOrder(sessionId, { orderNote: note });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    await logAdminAction({
      email: adminEmail,
      resource: 'orders',
      action: 'note',
      target: orderNumber(sessionId),
      amount: null,
      reason: null,
      result: 'success',
    });
    res.status(200).json({ success: true, order });
    return;
  }

  // Default: tracking update.
  await handleTracking(body, res, adminEmail);
}

// ---------------------------------------------------------------------------
// Subscriptions resource
// ---------------------------------------------------------------------------

async function handleSubscriptions(req: VercelRequest, res: VercelResponse, adminEmail: string | null) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const stripe = secret ? getStripe(secret) : null;
  if (!stripe) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  if (req.method === 'GET') {
    const action = String((req.query.action as string) || 'list');

    if (action === 'get') {
      const id = String((req.query.id as string) || '');
      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }
      res.status(200).json({ subscription: await getSubscriptionDetail(stripe, id) });
      return;
    }

    if (action === 'payment-methods') {
      const customerId = String((req.query.customerId as string) || '');
      if (!customerId) {
        res.status(400).json({ error: 'Missing customerId' });
        return;
      }
      res.status(200).json({ paymentMethods: await listCustomerPaymentMethods(stripe, customerId) });
      return;
    }

    if (action === 'prices') {
      const prices = await stripe.prices.list({ active: true, type: 'recurring', limit: 100, expand: ['data.product'] });
      res.status(200).json({
        prices: prices.data.map((p) => {
          const product = p.product && typeof p.product !== 'string' ? p.product : null;
          return {
            priceId: p.id,
            unitAmount: p.unit_amount,
            currency: p.currency,
            nickname: p.nickname,
            interval: p.recurring?.interval ?? null,
            intervalCount: p.recurring?.interval_count ?? null,
            productId: typeof p.product === 'string' ? p.product : product?.id ?? null,
            productName: product && 'name' in product ? product.name ?? null : null,
          };
        }),
      });
      return;
    }

    const result = await listSubscriptions(stripe, {
      limit: Number(req.query.limit) || 25,
      startingAfter: (req.query.cursor as string) || undefined,
      status: (req.query.status as string) || undefined,
      email: (req.query.email as string) || undefined,
    });
    res.status(200).json(result);
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const action = String(body.action || '');

  if (action === 'cancel') {
    const id = String(body.id || '');
    if (!id) {
      res.status(400).json({ error: 'Missing id' });
      return;
    }
    requireConfirm(body, id);
    const reason = String(body.reason || '').trim();
    if (reason.length < 3) {
      res.status(400).json({ error: 'A reason is required (at least 3 characters).' });
      return;
    }
    const atPeriodEnd = Boolean(body.atPeriodEnd);
    const result = await cancelSubscription(stripe, { id, atPeriodEnd, reason, adminEmail });
    await logAdminAction({
      email: adminEmail,
      resource: 'subscriptions',
      action: atPeriodEnd ? 'cancel-at-period-end' : 'cancel',
      target: id,
      amount: null,
      reason,
      result: 'success',
      detail: result.status,
    });
    res.status(200).json({ success: true, ...result });
    return;
  }

  if (action === 'pause' || action === 'resume') {
    const id = String(body.id || '');
    if (!id) {
      res.status(400).json({ error: 'Missing id' });
      return;
    }
    requireConfirm(body, id);
    const paused = action === 'pause';
    const reason = String(body.reason || '').trim();
    const result = await setSubscriptionPaused(stripe, { id, paused, reason, adminEmail });
    await logAdminAction({
      email: adminEmail,
      resource: 'subscriptions',
      action,
      target: id,
      amount: null,
      reason: reason || null,
      result: 'success',
      detail: result.status,
    });
    res.status(200).json({ success: true, ...result });
    return;
  }

  if (action === 'update-items') {
    const id = String(body.id || '');
    const items = Array.isArray(body.items)
      ? (body.items as Array<{ id?: string; quantity?: number }>)
          .filter((i) => i && i.id)
          .map((i) => ({ id: String(i.id), quantity: Number(i.quantity) || 0 }))
      : [];
    if (!id || items.length === 0) {
      res.status(400).json({ error: 'Missing id or items' });
      return;
    }
    requireConfirm(body, id);
    const result = await updateSubscriptionItems(stripe, {
      id,
      items,
      prorationBehavior: body.prorationBehavior,
      reason: body.reason,
      adminEmail,
    });
    await logAdminAction({
      email: adminEmail,
      resource: 'subscriptions',
      action: 'update-items',
      target: id,
      amount: null,
      reason: body.reason ? String(body.reason) : null,
      result: 'success',
      detail: items.map((i) => `${i.id}:${i.quantity}`).join(', '),
    });
    res.status(200).json({ success: true, ...result });
    return;
  }

  if (action === 'create-checkout') {
    const priceId = String(body.priceId || '');
    if (!priceId) {
      res.status(400).json({ error: 'Missing priceId' });
      return;
    }
    const origin = `https://${req.headers.host ?? 'gingerbrosshop.com'}`;
    const result = await createSubscriptionCheckout(stripe, {
      priceId,
      quantity: Number(body.quantity) || 1,
      customerId: body.customerId ? String(body.customerId) : null,
      email: body.email ? String(body.email) : null,
      trialDays: Number(body.trialDays) || 0,
      successUrl: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/?checkout=cancelled`,
      adminEmail,
    });
    await logAdminAction({
      email: adminEmail,
      resource: 'subscriptions',
      action: 'create-checkout-link',
      target: result.sessionId,
      amount: null,
      reason: null,
      result: 'success',
      detail: priceId,
    });
    res.status(200).json({ success: true, ...result });
    return;
  }

  if (action === 'create-direct') {
    const customerId = String(body.customerId || '');
    const priceId = String(body.priceId || '');
    if (!customerId || !priceId) {
      res.status(400).json({ error: 'Missing customerId or priceId' });
      return;
    }
    requireConfirm(body, customerId);
    const result = await createSubscriptionDirect(stripe, {
      customerId,
      priceId,
      quantity: Number(body.quantity) || 1,
      paymentMethodId: body.paymentMethodId ? String(body.paymentMethodId) : null,
      trialDays: Number(body.trialDays) || 0,
      adminEmail,
    });
    await logAdminAction({
      email: adminEmail,
      resource: 'subscriptions',
      action: 'create-direct',
      target: result.id,
      amount: null,
      reason: null,
      result: 'success',
      detail: `${customerId} ${priceId}`,
    });
    res.status(200).json({ success: true, ...result });
    return;
  }

  res.status(400).json({ error: `Unknown subscription action "${action}".` });
}

// ---------------------------------------------------------------------------
// Customers resource
// ---------------------------------------------------------------------------

async function handleCustomers(req: VercelRequest, res: VercelResponse, adminEmail: string | null) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const stripe = secret ? getStripe(secret) : null;
  if (!stripe) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  if (req.method === 'GET') {
    const action = String((req.query.action as string) || 'list');
    if (action === 'get') {
      const id = String((req.query.id as string) || '');
      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }
      res.status(200).json({ customer: await getCustomerDetail(stripe, id) });
      return;
    }
    const result = await listCustomers(stripe, {
      limit: Number(req.query.limit) || 25,
      startingAfter: (req.query.cursor as string) || undefined,
      email: (req.query.email as string) || undefined,
    });
    res.status(200).json(result);
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const action = String(body.action || '');

  if (action === 'update') {
    const id = String(body.id || '');
    if (!id) {
      res.status(400).json({ error: 'Missing id' });
      return;
    }
    requireConfirm(body, id);
    const result = await updateCustomer(stripe, {
      id,
      name: body.name !== undefined ? String(body.name) : undefined,
      email: body.email !== undefined ? String(body.email) : undefined,
      phone: body.phone !== undefined ? String(body.phone) : undefined,
      address: body.address !== undefined ? (body.address as Record<string, unknown>) : undefined,
    });
    await logAdminAction({
      email: adminEmail,
      resource: 'customers',
      action: 'update',
      target: id,
      amount: null,
      reason: null,
      result: 'success',
    });
    res.status(200).json({ success: true, ...result });
    return;
  }

  if (action === 'credit') {
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: 'A positive amount (in satang) is required.' });
      return;
    }
    requireConfirm(body, email);
    const reason = String(body.reason || '').trim();
    if (reason.length < 3) {
      res.status(400).json({ error: 'A reason is required (at least 3 characters).' });
      return;
    }
    const rounded = Math.round(amount);
    const balance = await addCredit(email, rounded);
    await logAdminAction({
      email: adminEmail,
      resource: 'customers',
      action: 'store-credit',
      target: email,
      amount: rounded,
      reason,
      result: 'success',
      detail: `balance=${balance}`,
    });
    res.status(200).json({ success: true, email, granted: rounded, balance });
    return;
  }

  res.status(400).json({ error: `Unknown customer action "${action}".` });
}

// ---------------------------------------------------------------------------
// Products resource
// ---------------------------------------------------------------------------

async function handleProducts(req: VercelRequest, res: VercelResponse, adminEmail: string | null) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const stripe = secret ? getStripe(secret) : null;
  if (!stripe) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  if (req.method === 'GET') {
    const action = String((req.query.action as string) || 'list');
    if (action === 'get') {
      const id = String((req.query.id as string) || '');
      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }
      res.status(200).json({ product: await getProductDetail(stripe, id) });
      return;
    }
    const result = await listProducts(stripe, {
      limit: Number(req.query.limit) || 25,
      startingAfter: (req.query.cursor as string) || undefined,
      search: (req.query.search as string) || undefined,
    });
    res.status(200).json(result);
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const action = String(body.action || '');

  if (action === 'upload') {
    const url = await uploadDataUrl(body.dataUrl, 'products');
    res.status(200).json({ url });
    return;
  }

  if (action === 'create') {
    const product = await createProduct(stripe, {
      name: body.name !== undefined ? String(body.name) : undefined,
      description: body.description !== undefined ? (body.description === null ? null : String(body.description)) : undefined,
      images: Array.isArray(body.images) ? (body.images as unknown[]).map(String) : undefined,
      active: body.active !== undefined ? Boolean(body.active) : undefined,
      metadata: normalizeMetadata(body.metadata),
    });
    await logAdminAction({
      email: adminEmail,
      resource: 'products',
      action: 'create',
      target: product.id,
      amount: null,
      reason: null,
      result: 'success',
      detail: product.name,
    });
    res.status(200).json({ success: true, product });
    return;
  }

  if (action === 'update') {
    const id = String(body.id || '');
    if (!id) {
      res.status(400).json({ error: 'Missing id' });
      return;
    }
    const product = await updateProduct(stripe, id, {
      name: body.name !== undefined ? String(body.name) : undefined,
      description: body.description !== undefined ? (body.description === null ? null : String(body.description)) : undefined,
      images: Array.isArray(body.images) ? (body.images as unknown[]).map(String) : undefined,
      active: body.active !== undefined ? Boolean(body.active) : undefined,
      metadata: normalizeMetadata(body.metadata),
    });
    await logAdminAction({
      email: adminEmail,
      resource: 'products',
      action: 'update',
      target: id,
      amount: null,
      reason: null,
      result: 'success',
      detail: product.name,
    });
    res.status(200).json({ success: true, product });
    return;
  }

  if (action === 'archive') {
    const id = String(body.id || '');
    if (!id) {
      res.status(400).json({ error: 'Missing id' });
      return;
    }
    requireConfirm(body, id);
    const reason = String(body.reason || '').trim();
    if (reason.length < 3) {
      res.status(400).json({ error: 'A reason is required (at least 3 characters).' });
      return;
    }
    const product = await archiveProduct(stripe, id);
    await logAdminAction({
      email: adminEmail,
      resource: 'products',
      action: 'archive',
      target: id,
      amount: null,
      reason,
      result: 'success',
      detail: product.name,
    });
    res.status(200).json({ success: true, product });
    return;
  }

  if (action === 'create-price') {
    const price = await createPrice(stripe, {
      product: String(body.productId || ''),
      unitAmount: Number(body.unitAmount),
      currency: body.currency ? String(body.currency) : undefined,
      nickname: body.nickname !== undefined ? (body.nickname === null ? null : String(body.nickname)) : undefined,
      recurring: parseRecurring(body.recurring),
      metadata: normalizeMetadata(body.metadata),
    });
    await logAdminAction({
      email: adminEmail,
      resource: 'products',
      action: 'create-price',
      target: price.id,
      amount: price.unitAmount,
      reason: null,
      result: 'success',
      detail: `${body.productId} ${price.type}`,
    });
    res.status(200).json({ success: true, price });
    return;
  }

  if (action === 'update-price') {
    const id = String(body.id || '');
    if (!id) {
      res.status(400).json({ error: 'Missing id' });
      return;
    }
    const price = await updatePrice(stripe, id, {
      active: body.active !== undefined ? Boolean(body.active) : undefined,
      nickname: body.nickname !== undefined ? (body.nickname === null ? null : String(body.nickname)) : undefined,
      metadata: normalizeMetadata(body.metadata),
    });
    await logAdminAction({
      email: adminEmail,
      resource: 'products',
      action: 'update-price',
      target: id,
      amount: null,
      reason: null,
      result: 'success',
      detail: `active=${price.active}`,
    });
    res.status(200).json({ success: true, price });
    return;
  }

  res.status(400).json({ error: `Unknown product action "${action}".` });
}

function normalizeMetadata(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v === undefined || v === null) continue;
    out[k] = String(v);
  }
  return out;
}

function parseRecurring(
  value: unknown,
): { interval: 'day' | 'week' | 'month' | 'year'; intervalCount?: number } | null {
  if (!value || typeof value !== 'object') return null;
  const interval = String((value as Record<string, unknown>).interval || '');
  if (!['day', 'week', 'month', 'year'].includes(interval)) return null;
  const count = Number((value as Record<string, unknown>).intervalCount);
  return {
    interval: interval as 'day' | 'week' | 'month' | 'year',
    intervalCount: Number.isFinite(count) && count > 0 ? Math.round(count) : 1,
  };
}

// ---------------------------------------------------------------------------
// Coupons resource
// ---------------------------------------------------------------------------

async function handleCoupons(req: VercelRequest, res: VercelResponse, adminEmail: string | null) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const stripe = secret ? getStripe(secret) : null;
  if (!stripe) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  if (req.method === 'GET') {
    const action = String((req.query.action as string) || 'list');

    if (action === 'get') {
      const id = String((req.query.id as string) || '');
      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }
      res.status(200).json({ coupon: await getCoupon(stripe, id) });
      return;
    }

    if (action === 'promotion-codes') {
      const result = await listPromotionCodes(stripe, {
        limit: Number(req.query.limit) || 25,
        startingAfter: (req.query.cursor as string) || undefined,
        coupon: (req.query.coupon as string) || undefined,
        active: req.query.active === undefined ? undefined : req.query.active === 'true',
      });
      res.status(200).json(result);
      return;
    }

    const result = await listCoupons(stripe, {
      limit: Number(req.query.limit) || 25,
      startingAfter: (req.query.cursor as string) || undefined,
    });
    res.status(200).json(result);
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const action = String(body.action || '');

  if (action === 'create') {
    requireConfirm(body, 'CREATE');
    const coupon = await createCoupon(stripe, {
      name: body.name !== undefined ? (body.name === null ? null : String(body.name)) : undefined,
      percentOff: body.percentOff !== undefined && body.percentOff !== null ? Number(body.percentOff) : null,
      amountOff: body.amountOff !== undefined && body.amountOff !== null ? Number(body.amountOff) : null,
      currency: body.currency ? String(body.currency) : undefined,
      duration: String(body.duration || 'once') as 'once' | 'repeating' | 'forever',
      durationInMonths: body.durationInMonths !== undefined && body.durationInMonths !== null ? Number(body.durationInMonths) : null,
      maxRedemptions: body.maxRedemptions !== undefined && body.maxRedemptions !== null ? Number(body.maxRedemptions) : null,
      redeemBy: body.redeemBy ? String(body.redeemBy) : null,
      metadata: normalizeMetadata(body.metadata),
    });
    await logAdminAction({
      email: adminEmail,
      resource: 'coupons',
      action: 'create',
      target: coupon.id,
      amount: coupon.amountOff,
      reason: null,
      result: 'success',
      detail: coupon.percentOff ? `${coupon.percentOff}%` : coupon.name ?? '',
    });
    res.status(200).json({ success: true, coupon });
    return;
  }

  if (action === 'update') {
    const id = String(body.id || '');
    if (!id) {
      res.status(400).json({ error: 'Missing id' });
      return;
    }
    const coupon = await updateCoupon(stripe, id, {
      name: body.name !== undefined ? (body.name === null ? null : String(body.name)) : undefined,
      metadata: normalizeMetadata(body.metadata),
    });
    await logAdminAction({
      email: adminEmail,
      resource: 'coupons',
      action: 'update',
      target: id,
      amount: null,
      reason: null,
      result: 'success',
    });
    res.status(200).json({ success: true, coupon });
    return;
  }

  if (action === 'delete') {
    const id = String(body.id || '');
    if (!id) {
      res.status(400).json({ error: 'Missing id' });
      return;
    }
    requireConfirm(body, id);
    const reason = String(body.reason || '').trim();
    if (reason.length < 3) {
      res.status(400).json({ error: 'A reason is required (at least 3 characters).' });
      return;
    }
    await deleteCoupon(stripe, id);
    await logAdminAction({
      email: adminEmail,
      resource: 'coupons',
      action: 'delete',
      target: id,
      amount: null,
      reason,
      result: 'success',
    });
    res.status(200).json({ success: true });
    return;
  }

  if (action === 'create-promotion-code') {
    const promotionCode = await createPromotionCode(stripe, {
      coupon: String(body.couponId || ''),
      code: body.code ? String(body.code) : null,
      maxRedemptions: body.maxRedemptions !== undefined && body.maxRedemptions !== null ? Number(body.maxRedemptions) : null,
      expiresAt: body.expiresAt ? String(body.expiresAt) : null,
      metadata: normalizeMetadata(body.metadata),
    });
    await logAdminAction({
      email: adminEmail,
      resource: 'coupons',
      action: 'create-promotion-code',
      target: promotionCode.id,
      amount: null,
      reason: null,
      result: 'success',
      detail: promotionCode.code,
    });
    res.status(200).json({ success: true, promotionCode });
    return;
  }

  if (action === 'update-promotion-code') {
    const id = String(body.id || '');
    if (!id) {
      res.status(400).json({ error: 'Missing id' });
      return;
    }
    const promotionCode = await updatePromotionCode(stripe, id, {
      active: body.active !== undefined ? Boolean(body.active) : undefined,
    });
    await logAdminAction({
      email: adminEmail,
      resource: 'coupons',
      action: 'update-promotion-code',
      target: id,
      amount: null,
      reason: null,
      result: 'success',
      detail: `active=${promotionCode.active}`,
    });
    res.status(200).json({ success: true, promotionCode });
    return;
  }

  res.status(400).json({ error: `Unknown coupon action "${action}".` });
}

// ---------------------------------------------------------------------------
// Invoices resource (read + send/void)
// ---------------------------------------------------------------------------

async function handleInvoices(req: VercelRequest, res: VercelResponse, adminEmail: string | null) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const stripe = secret ? getStripe(secret) : null;
  if (!stripe) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  if (req.method === 'GET') {
    const action = String((req.query.action as string) || 'list');
    if (action === 'get') {
      const id = String((req.query.id as string) || '');
      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }
      res.status(200).json({ invoice: await getInvoiceDetail(stripe, id) });
      return;
    }
    const result = await listInvoices(stripe, {
      limit: Number(req.query.limit) || 25,
      startingAfter: (req.query.cursor as string) || undefined,
      status: (req.query.status as string) || undefined,
      customer: (req.query.customer as string) || undefined,
      email: (req.query.email as string) || undefined,
    });
    res.status(200).json(result);
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const action = String(body.action || '');
  const id = String(body.id || '');
  if (!id) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }

  if (action === 'send') {
    requireConfirm(body, id);
    const reason = String(body.reason || '').trim();
    if (reason.length < 3) {
      res.status(400).json({ error: 'A reason is required (at least 3 characters).' });
      return;
    }
    const invoice = await sendInvoice(stripe, { id, adminEmail });
    await logAdminAction({
      email: adminEmail,
      resource: 'invoices',
      action: 'send',
      target: id,
      amount: invoice.amountDue,
      reason,
      result: 'success',
      detail: invoice.number ?? '',
    });
    res.status(200).json({ success: true, invoice });
    return;
  }

  if (action === 'void') {
    requireConfirm(body, id);
    const reason = String(body.reason || '').trim();
    if (reason.length < 3) {
      res.status(400).json({ error: 'A reason is required (at least 3 characters).' });
      return;
    }
    const invoice = await voidInvoice(stripe, { id, adminEmail });
    await logAdminAction({
      email: adminEmail,
      resource: 'invoices',
      action: 'void',
      target: id,
      amount: null,
      reason,
      result: 'success',
      detail: invoice.number ?? '',
    });
    res.status(200).json({ success: true, invoice });
    return;
  }

  res.status(400).json({ error: `Unknown invoice action "${action}".` });
}

// ---------------------------------------------------------------------------
// Ops resource (disputes, payouts, events/webhook log)
// ---------------------------------------------------------------------------

async function handleOps(req: VercelRequest, res: VercelResponse, adminEmail: string | null) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const stripe = secret ? getStripe(secret) : null;
  if (!stripe) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  const section = String(
    (req.query.section as string) || (req.body?.section as string) || 'disputes',
  );

  if (req.method === 'GET') {
    const action = String((req.query.action as string) || 'list');

    if (section === 'disputes') {
      if (action === 'get') {
        const id = String((req.query.id as string) || '');
        if (!id) {
          res.status(400).json({ error: 'Missing id' });
          return;
        }
        res.status(200).json({ dispute: await getDisputeDetail(stripe, id) });
        return;
      }
      res.status(200).json(
        await listDisputes(stripe, {
          limit: Number(req.query.limit) || 25,
          startingAfter: (req.query.cursor as string) || undefined,
        }),
      );
      return;
    }

    if (section === 'payouts') {
      if (action === 'balance') {
        res.status(200).json(await getBalance(stripe));
        return;
      }
      res.status(200).json(
        await listPayouts(stripe, {
          limit: Number(req.query.limit) || 25,
          startingAfter: (req.query.cursor as string) || undefined,
          status: (req.query.status as string) || undefined,
        }),
      );
      return;
    }

    if (section === 'events') {
      if (action === 'get') {
        const id = String((req.query.id as string) || '');
        if (!id) {
          res.status(400).json({ error: 'Missing id' });
          return;
        }
        res.status(200).json({ event: await getEventDetail(stripe, id) });
        return;
      }
      res.status(200).json(
        await listEvents(stripe, {
          limit: Number(req.query.limit) || 25,
          startingAfter: (req.query.cursor as string) || undefined,
          type: (req.query.type as string) || undefined,
        }),
      );
      return;
    }

    res.status(400).json({ error: `Unknown ops section "${section}".` });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const action = String(body.action || '');

  if (section === 'disputes') {
    if (action === 'evidence') {
      const id = String(body.id || '');
      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }
      const submit = Boolean(body.submit);
      if (submit) requireConfirm(body, id);
      const reason = String(body.reason || '').trim();
      if (submit && reason.length < 3) {
        res.status(400).json({ error: 'A reason is required to submit evidence (at least 3 characters).' });
        return;
      }
      const evidence = (body.evidence && typeof body.evidence === 'object'
        ? body.evidence
        : {}) as Record<string, unknown>;
      const dispute = await submitDisputeEvidence(stripe, { id, evidence, submit, adminEmail });
      await logAdminAction({
        email: adminEmail,
        resource: 'ops',
        action: submit ? 'dispute-submit-evidence' : 'dispute-save-evidence',
        target: id,
        amount: dispute.amount,
        reason: reason || null,
        result: 'success',
        detail: dispute.status,
      });
      res.status(200).json({ success: true, dispute });
      return;
    }
    res.status(400).json({ error: `Unknown dispute action "${action}".` });
    return;
  }

  if (section === 'payouts') {
    if (action === 'create') {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        res.status(400).json({ error: 'A positive amount (in satang) is required.' });
        return;
      }
      requireConfirm(body, 'PAYOUT');
      const reason = String(body.reason || '').trim();
      if (reason.length < 3) {
        res.status(400).json({ error: 'A reason is required (at least 3 characters).' });
        return;
      }
      const payout = await createPayout(stripe, {
        amount,
        currency: body.currency ? String(body.currency) : undefined,
        adminEmail,
      });
      await logAdminAction({
        email: adminEmail,
        resource: 'ops',
        action: 'payout-create',
        target: payout.id,
        amount: payout.amount,
        reason,
        result: 'success',
        detail: payout.status,
      });
      res.status(200).json({ success: true, payout });
      return;
    }

    if (action === 'cancel') {
      const id = String(body.id || '');
      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }
      requireConfirm(body, id);
      const reason = String(body.reason || '').trim();
      if (reason.length < 3) {
        res.status(400).json({ error: 'A reason is required (at least 3 characters).' });
        return;
      }
      const payout = await cancelPayout(stripe, { id, adminEmail });
      await logAdminAction({
        email: adminEmail,
        resource: 'ops',
        action: 'payout-cancel',
        target: id,
        amount: payout.amount,
        reason,
        result: 'success',
        detail: payout.status,
      });
      res.status(200).json({ success: true, payout });
      return;
    }

    res.status(400).json({ error: `Unknown payout action "${action}".` });
    return;
  }

  res.status(400).json({ error: `Unknown ops section "${section}".` });
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Strict confirm: the client must echo the exact target (e.g. the order number). */
function requireConfirm(body: Record<string, unknown>, expected: string) {
  const confirm = String(body.confirm ?? '').trim().toUpperCase();
  if (confirm !== expected.toUpperCase()) {
    throw new Error(`Confirmation failed. Type "${expected}" to proceed.`);
  }
}

async function handleTracking(body: Record<string, unknown>, res: VercelResponse, adminEmail: string | null) {
  const sessionId = String(body.sessionId || '');
  const trackingNumber = String(body.trackingNumber || '');
  const trackingCarrier = body.trackingCarrier ? String(body.trackingCarrier) : undefined;
  if (!sessionId || !trackingNumber) {
    res.status(400).json({ error: 'Missing sessionId or trackingNumber' });
    return;
  }
  const previous = await getOrderBySessionId(sessionId);
  const order = await updateTracking(sessionId, trackingNumber, trackingCarrier);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const trackingChanged = previous?.trackingNumber !== order.trackingNumber;
  let emailed = false;
  if (trackingChanged) {
    emailed = await sendShippingNotification(order);
  }

  await logAdminAction({
    email: adminEmail,
    resource: 'orders',
    action: 'tracking',
    target: orderNumber(sessionId),
    amount: null,
    reason: null,
    result: trackingChanged ? 'updated' : 'unchanged',
    detail: `${trackingCarrier ?? ''} ${trackingNumber}`.trim(),
  });

  res.status(200).json({ success: true, order, emailed });
}

async function handleGrantCredit(body: Record<string, unknown>, res: VercelResponse, adminEmail: string | null) {
  const email = (body.email as string | undefined)?.trim().toLowerCase();
  if (!email) {
    res.status(400).json({ error: 'Missing email' });
    return;
  }
  const amount = Number.isFinite(body.amount) && (body.amount as number) > 0 ? Math.round(body.amount as number) : BOX_RETURN_CREDIT;
  const balance = await addCredit(email, amount);

  let emailed = false;
  const resend = getResend();
  if (resend) {
    try {
      await resend.emails.send({
        from: MAIL_FROM,
        to: email,
        replyTo: SUPPORT_REPLY_TO,
        subject: `Your ฿${Math.round(amount / 100)} box-return reward is ready`,
        html: boxReturnRewardHtml(Math.round(amount / 100)),
      });
      emailed = true;
    } catch (err) {
      console.error('Failed to send box-return reward email:', err);
    }
  }

  await logAdminAction({
    email: adminEmail,
    resource: 'orders',
    action: 'grant-credit',
    target: email,
    amount,
    reason: null,
    result: 'success',
    detail: `balance=${balance} emailed=${emailed}`,
  });

  res.status(200).json({ success: true, email, granted: amount, balance, emailed });
}

async function handleGrantCode(body: Record<string, unknown>, res: VercelResponse, adminEmail: string | null) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }
  const amount = Number.isFinite(body.amount) && (body.amount as number) > 0 ? Math.round(body.amount as number) : BOX_RETURN_CREDIT;
  const stripe = getStripe(secret);
  try {
    const coupon = await stripe.coupons.create({
      amount_off: amount,
      currency: 'thb',
      duration: 'once',
      name: 'Box-return reward',
    });
    const promo = await stripe.promotionCodes.create({
      promotion: { type: 'coupon', coupon: coupon.id },
      max_redemptions: 1,
    });

    const email = (body.email as string | undefined)?.trim().toLowerCase();
    let emailed = false;
    const resend = getResend();
    if (email && resend) {
      try {
        await resend.emails.send({
          from: MAIL_FROM,
          to: email,
          replyTo: SUPPORT_REPLY_TO,
          subject: `Your ฿${Math.round(amount / 100)} box-return reward is ready`,
          html: boxReturnRewardHtml(Math.round(amount / 100), promo.code),
        });
        emailed = true;
      } catch (err) {
        console.error('Failed to send box-return code email:', err);
      }
    }

    await logAdminAction({
      email: adminEmail,
      resource: 'orders',
      action: 'grant-code',
      target: email ?? null,
      amount,
      reason: null,
      result: 'success',
      detail: promo.code,
    });

    res.status(200).json({ success: true, code: promo.code, granted: amount, emailed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    res.status(500).json({ error: message });
  }
}

/**
 * Notify the customer (and gift recipient, if any) that their order has shipped.
 * Failures are logged but never block the tracking update — the order is the
 * source of truth, the email is best-effort. Returns whether at least one email
 * was sent.
 */
async function sendShippingNotification(order: Order): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn('[SHIPPING NOTIFICATION] RESEND_API_KEY not configured — skipping email for', order.sessionId);
    return false;
  }

  const recipients = new Set<string>();
  if (order.customerEmail) recipients.add(order.customerEmail);
  if (order.isGift && order.recipientEmail) recipients.add(order.recipientEmail);
  if (recipients.size === 0) return false;

  const orderId = orderNumber(order.sessionId);
  const html = shippingNotificationHtml(order);
  let sent = false;
  for (const to of recipients) {
    try {
      await resend.emails.send({
        from: MAIL_FROM,
        to,
        replyTo: SUPPORT_REPLY_TO,
        subject: `Order #${orderId} has shipped${order.trackingNumber ? `, tracking ${order.trackingNumber}` : ''}`,
        html,
      });
      sent = true;
    } catch (err) {
      console.error('Failed to send shipping email to', to, err);
    }
  }
  return sent;
}
