import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/_lib/rateLimit.js', () => ({
  rateLimit: vi.fn(async () => ({ allowed: true, remaining: 10, reset: Date.now() })),
  getClientIp: vi.fn(() => '127.0.0.1'),
}));

let lastSessionCreateParams: Record<string, unknown> | null = null;
const createSessionMock = vi.fn(async (params: Record<string, unknown>) => {
  lastSessionCreateParams = params;
  return { url: 'https://checkout.stripe.com/test-session' };
});

// Mock price catalog: ids containing "sub" are recurring; "does-not-exist" throws.
const retrievePriceMock = vi.fn(async (id: string) => {
  if (id === 'does-not-exist') {
    throw new Error('No such price');
  }
  return {
    id,
    active: true,
    currency: 'thb',
    unit_amount: 14000,
    recurring: id.includes('sub') ? { interval: 'week', interval_count: 1 } : null,
  };
});

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      prices: {
        retrieve: retrievePriceMock,
      },
      checkout: {
        sessions: {
          create: createSessionMock,
        },
      },
    };
  }),
}));

import handler from '../../api/_lib/handlers/checkout';

function mockReq(overrides: Partial<Parameters<typeof handler>[0]> = {}): Parameters<typeof handler>[0] {
  return {
    method: 'POST',
    headers: {},
    socket: { remoteAddress: '127.0.0.1' },
    body: { items: [] },
    ...overrides,
  } as Parameters<typeof handler>[0];
}

interface MockRes {
  statusCode: number;
  _json: unknown;
  status(code: number): MockRes;
  json(data: unknown): MockRes;
}

function mockRes() {
  const res: MockRes = {
    statusCode: 200,
    _json: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: unknown) {
      this._json = data;
      return this;
    },
  };
  return res as Parameters<typeof handler>[1];
}

describe('checkout API handler', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_validation';
    lastSessionCreateParams = null;
    createSessionMock.mockClear();
    retrievePriceMock.mockClear();
  });

  it('rejects non-POST requests', async () => {
    const req = mockReq({ method: 'GET' });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
    expect(res._json).toEqual({ error: 'Method not allowed' });
  });

  it('rejects empty cart', async () => {
    const req = mockReq({ body: { items: [] } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._json.error).toMatch(/Cart is empty/i);
  });

  it('rejects unknown product', async () => {
    const req = mockReq({ body: { items: [{ id: 'does-not-exist', quantity: 1 }] } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._json.error).toMatch(/Unknown product/i);
  });

  it('rejects mixed one-time and subscription items', async () => {
    const req = mockReq({
      body: {
        items: [
          { id: 'ginger-fizz', quantity: 1, productId: 'ginger-fizz' },
          { id: 'ginger-fizz-sub-week', quantity: 1, productId: 'ginger-fizz' },
        ],
      },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._json.error).toMatch(/Cannot mix/i);
  });

  it('rejects missing stripe secret', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const req = mockReq({ body: { items: [{ id: 'ginger-fizz', quantity: 1, productId: 'ginger-fizz' }] } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
    expect(res._json.error).toMatch(/STRIPE_SECRET_KEY not configured/i);
  });

  it('passes gift info into Stripe session metadata', async () => {
    const req = mockReq({
      body: {
        items: [{ id: 'ginger-fizz', quantity: 1, productId: 'ginger-fizz' }],
        giftInfo: {
          isGift: true,
          recipientEmail: 'gift@example.com',
          recipientName: 'Gift Recipient',
          message: 'Enjoy!',
        },
      },
    });
    const res = mockRes();
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._json.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);

    expect(lastSessionCreateParams?.metadata).toMatchObject({
      isGift: 'true',
      recipientEmail: 'gift@example.com',
      recipientName: 'Gift Recipient',
      giftMessage: 'Enjoy!',
    });
  });

  it('passes referral code into Stripe session metadata', async () => {
    const req = mockReq({
      body: {
        items: [{ id: 'ginger-fizz', quantity: 1, productId: 'ginger-fizz' }],
        referralCode: 'BRO1234',
      },
    });
    const res = mockRes();
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(lastSessionCreateParams?.metadata).toMatchObject({ referralCode: 'BRO1234' });
  });
});
