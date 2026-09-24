import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory Upstash stand-in so the real adminLog module records to `admin_actions`.
const mocks = vi.hoisted(() => ({
  store: new Map<string, unknown>(),
  authorized: { value: true },
  listOrders: vi.fn(async () => ({ orders: [{ sessionId: 'cs_test_12345678' }], hasMore: false, nextCursor: null })),
  getOrderDetail: vi.fn(async () => ({ sessionId: 'cs_test_12345678' })),
  refundOrder: vi.fn(async () => ({ refundId: 're_1', amount: 1000, refundableRemaining: 0 })),
  cancelOrder: vi.fn(async () => ({ kind: 'refund', refundId: 're_2' })),
  listInvoices: vi.fn(async () => ({ invoices: [], hasMore: false, nextCursor: null })),
  getInvoiceDetail: vi.fn(async () => ({ id: 'in_1' })),
  sendInvoice: vi.fn(async () => ({ id: 'in_1', number: 'INV-0001', amountDue: 5000 })),
  voidInvoice: vi.fn(async () => ({ id: 'in_1', number: 'INV-0001', status: 'void' })),
  listPayouts: vi.fn(async () => ({ payouts: [], hasMore: false, nextCursor: null })),
  getBalance: vi.fn(async () => ({ available: [], pending: [] })),
  createPayout: vi.fn(async () => ({ id: 'po_1', amount: 1000, status: 'pending' })),
  cancelPayout: vi.fn(async () => ({ id: 'po_1', status: 'canceled' })),
}));

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({
      get: async (k: string) => mocks.store.get(k) ?? null,
      set: async (k: string, v: unknown) => void mocks.store.set(k, v),
      getdel: async (k: string) => {
        const v = mocks.store.get(k) ?? null;
        mocks.store.delete(k);
        return v;
      },
      del: async (k: string) => void mocks.store.delete(k),
    }),
  },
}));

vi.mock('../../api/_lib/rateLimit.js', () => ({
  rateLimit: vi.fn(async () => ({ allowed: true, remaining: 10, reset: Date.now() })),
  getClientIp: vi.fn(() => '127.0.0.1'),
}));

vi.mock('../../api/_lib/adminAuth.js', () => ({
  isAdminAuthorized: vi.fn(async () => mocks.authorized.value),
  getAdminEmail: vi.fn(async () => 'boss@example.com'),
}));

vi.mock('../../api/_lib/email.js', () => ({
  getResend: () => ({ emails: { send: vi.fn(async () => ({ error: null })) } }),
  MAIL_FROM: 'GingerBros <orders@gingerbrosshop.com>',
  SUPPORT_REPLY_TO: 'orders@gingerbrosshop.com',
  shippingNotificationHtml: () => '<p>shipped</p>',
  boxReturnRewardHtml: () => '<p>reward</p>',
}));

vi.mock('../../api/_lib/credits.js', () => ({ addCredit: vi.fn(async () => 5000) }));

vi.mock('../../api/_lib/upload.js', () => ({ uploadDataUrl: vi.fn(async () => 'https://blob.test/x.png') }));

vi.mock('../../api/_lib/orders.js', () => ({
  getOrders: vi.fn(async () => []),
  getOrderBySessionId: vi.fn(async () => null),
  updateTracking: vi.fn(async () => null),
  updateOrder: vi.fn(async () => null),
}));

vi.mock('../../api/_lib/admin/orders.js', () => ({
  orderNumber: (sessionId: string) => sessionId.slice(-8).toUpperCase(),
  listOrders: mocks.listOrders,
  getOrderDetail: mocks.getOrderDetail,
  refundOrder: mocks.refundOrder,
  cancelOrder: mocks.cancelOrder,
}));

vi.mock('../../api/_lib/admin/invoices.js', () => ({
  listInvoices: mocks.listInvoices,
  getInvoiceDetail: mocks.getInvoiceDetail,
  sendInvoice: mocks.sendInvoice,
  voidInvoice: mocks.voidInvoice,
}));

vi.mock('../../api/_lib/admin/ops.js', () => ({
  listDisputes: vi.fn(async () => ({ disputes: [], hasMore: false, nextCursor: null })),
  getDisputeDetail: vi.fn(async () => ({ id: 'dp_1' })),
  submitDisputeEvidence: vi.fn(async () => ({ id: 'dp_1', amount: 1000, status: 'needs_response' })),
  listPayouts: mocks.listPayouts,
  getBalance: mocks.getBalance,
  createPayout: mocks.createPayout,
  cancelPayout: mocks.cancelPayout,
  listEvents: vi.fn(async () => ({ events: [], hasMore: false, nextCursor: null })),
  getEventDetail: vi.fn(async () => ({ id: 'evt_1' })),
}));

import handler from '../../api/_lib/handlers/admin';
import { getAdminActions } from '../../api/_lib/adminLog';
import { isAdminAuthorized } from '../../api/_lib/adminAuth';

type Req = Parameters<typeof handler>[0];
type Res = Parameters<typeof handler>[1];

function req(overrides: {
  method?: string;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
} = {}): Req {
  return {
    method: overrides.method ?? 'GET',
    url: '/api/admin',
    query: overrides.query ?? {},
    body: overrides.body,
    headers: { host: 'gingerbrosshop.com', origin: 'https://gingerbrosshop.com' },
  } as unknown as Req;
}

function res() {
  const r = {
    statusCode: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(c: number) { r.statusCode = c; return r; },
    json(b: unknown) { r.body = b; return r; },
    setHeader(k: string, v: string) { r.headers[k.toLowerCase()] = v; return r; },
    end() { return r; },
  };
  return r;
}

async function call(overrides: Parameters<typeof req>[0]) {
  const r = res();
  await handler(req(overrides), r as unknown as Res);
  return r;
}

const logs = async () => (await getAdminActions(50)) as Array<{ resource: string; action: string; target: string | null; amount: number | null; reason: string | null }>;

describe('admin API dispatcher', () => {
  beforeEach(() => {
    mocks.store.clear();
    mocks.authorized.value = true;
    mocks.listOrders.mockClear();
    mocks.refundOrder.mockClear();
    mocks.sendInvoice.mockClear();
    mocks.createPayout.mockClear();
    vi.mocked(isAdminAuthorized).mockClear();
  });

  it('rejects unauthenticated requests with 401', async () => {
    mocks.authorized.value = false;
    const r = await call({ query: { resource: 'orders', action: 'list' } });
    expect(r.statusCode).toBe(401);
    expect(r.body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 501 for an unknown resource', async () => {
    const r = await call({ query: { resource: 'wat' } });
    expect(r.statusCode).toBe(501);
  });

  it('serves the audit log on the activity resource', async () => {
    await call({
      method: 'POST',
      body: { resource: 'orders', action: 'refund', sessionId: 'cs_test_12345678', confirm: '12345678', reason: 'customer request' },
    });
    const r = await call({ query: { resource: 'activity' } });
    expect(r.statusCode).toBe(200);
    const body = r.body as { actions: unknown[] };
    expect(body.actions.length).toBeGreaterThan(0);
  });

  it('dispatches the orders list to the orders module', async () => {
    const r = await call({ query: { resource: 'orders', action: 'list', limit: '10' } });
    expect(r.statusCode).toBe(200);
    expect(mocks.listOrders).toHaveBeenCalledTimes(1);
    expect(r.body).toMatchObject({ orders: [{ sessionId: 'cs_test_12345678' }], hasMore: false });
  });

  it('requires the typed confirmation phrase for a refund', async () => {
    const r = await call({
      method: 'POST',
      body: { resource: 'orders', action: 'refund', sessionId: 'cs_test_12345678', confirm: 'wrong', reason: 'customer request' },
    });
    expect(r.statusCode).toBe(400);
    expect((r.body as { error: string }).error).toContain('Confirmation failed');
    expect(mocks.refundOrder).not.toHaveBeenCalled();
  });

  it('requires a reason of at least 3 characters for a refund', async () => {
    const r = await call({
      method: 'POST',
      body: { resource: 'orders', action: 'refund', sessionId: 'cs_test_12345678', confirm: '12345678', reason: 'no' },
    });
    expect(r.statusCode).toBe(400);
    expect((r.body as { error: string }).error).toContain('reason is required');
    expect(mocks.refundOrder).not.toHaveBeenCalled();
  });

  it('performs a refund and writes an audit entry', async () => {
    const r = await call({
      method: 'POST',
      body: { resource: 'orders', action: 'refund', sessionId: 'cs_test_12345678', confirm: '12345678', reason: 'customer request', amount: 1000 },
    });
    expect(r.statusCode).toBe(200);
    expect(mocks.refundOrder).toHaveBeenCalledTimes(1);
    const entries = await logs();
    const entry = entries.find((e) => e.resource === 'orders' && e.action === 'refund');
    expect(entry).toBeTruthy();
    expect(entry!.target).toBe('12345678');
    expect(entry!.amount).toBe(1000);
    expect(entry!.reason).toBe('customer request');
  });

  it('sends an invoice only with confirmation and a reason', async () => {
    const bad = await call({ method: 'POST', body: { resource: 'invoices', action: 'send', id: 'in_1', confirm: 'nope', reason: 'send it' } });
    expect(bad.statusCode).toBe(400);
    expect(mocks.sendInvoice).not.toHaveBeenCalled();

    const ok = await call({ method: 'POST', body: { resource: 'invoices', action: 'send', id: 'in_1', confirm: 'in_1', reason: 'send it' } });
    expect(ok.statusCode).toBe(200);
    expect(mocks.sendInvoice).toHaveBeenCalledTimes(1);
    expect(ok.body).toMatchObject({ success: true, invoice: { id: 'in_1' } });
  });

  it('creates a payout only when the PAYOUT phrase is typed', async () => {
    const bad = await call({ method: 'POST', body: { resource: 'ops', section: 'payouts', action: 'create', amount: 1000, confirm: 'pay', reason: 'withdraw' } });
    expect(bad.statusCode).toBe(400);
    expect(mocks.createPayout).not.toHaveBeenCalled();

    const ok = await call({ method: 'POST', body: { resource: 'ops', section: 'payouts', action: 'create', amount: 1000, confirm: 'PAYOUT', reason: 'withdraw' } });
    expect(ok.statusCode).toBe(200);
    expect(mocks.createPayout).toHaveBeenCalledTimes(1);
  });
});
