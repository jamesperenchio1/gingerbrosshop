import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
    })),
  },
}));

vi.mock('../../api/_lib/orders.js', () => ({
  saveOrder: vi.fn(),
}));

const constructEventMock = vi.fn();
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      webhooks: {
        constructEvent: constructEventMock,
      },
      checkout: {
        sessions: {
          listLineItems: vi.fn(async () => ({ data: [] })),
        },
      },
    };
  }),
}));

import handler from '../../api/webhook';
import { saveOrder } from '../../api/_lib/orders.js';

const saveOrderMock = saveOrder as ReturnType<typeof vi.fn>;

function mockReq(bodyBuffer: Buffer): Parameters<typeof handler>[0] {
  return {
    method: 'POST',
    headers: { 'stripe-signature': 'sig_fake' },
    [Symbol.asyncIterator]: async function* () {
      yield bodyBuffer;
    },
  } as unknown as Parameters<typeof handler>[0];
}

function mockRes() {
  const res: any = {
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

describe('webhook handler', () => {
  beforeEach(() => {
    saveOrderMock.mockClear();
    constructEventMock.mockReset();
  });

  it('rejects non-POST requests', async () => {
    const req = { method: 'GET', headers: {} } as Parameters<typeof handler>[0];
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  it('saves gift metadata to the order on checkout.session.completed', async () => {
    const session = {
      id: 'cs_test_123',
      status: 'complete',
      mode: 'payment',
      payment_status: 'paid',
      amount_total: 14000,
      currency: 'thb',
      created: Math.floor(Date.now() / 1000),
      payment_intent: 'pi_test_123',
      subscription: null,
      metadata: {
        isGift: 'true',
        recipientEmail: 'gift@example.com',
        recipientName: 'Gift Recipient',
        giftMessage: 'Enjoy!',
        referralCode: 'BRO1234',
      },
      customer_details: {
        email: 'buyer@example.com',
        name: 'Buyer Name',
        phone: '+66912345678',
      },
      shipping_details: {
        name: 'Gift Recipient',
        address: {
          line1: '123 Main St',
          city: 'Bangkok',
          postal_code: '10110',
          country: 'TH',
        },
      },
      line_items: {
        data: [
          {
            id: 'li_test',
            description: 'Unpasteurized Ginger Fizz',
            quantity: 1,
            amount_total: 14000,
            price: { product: 'prod_test', unit_amount: 14000 },
          },
        ],
      },
    };

    constructEventMock.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: session },
    });

    const req = mockReq(Buffer.from(JSON.stringify({ id: 'evt_test' })));
    const res = mockRes();
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(saveOrderMock).toHaveBeenCalledOnce();
    const savedOrder = saveOrderMock.mock.calls[0][0];
    expect(savedOrder.isGift).toBe(true);
    expect(savedOrder.recipientEmail).toBe('gift@example.com');
    expect(savedOrder.recipientName).toBe('Gift Recipient');
    expect(savedOrder.giftMessage).toBe('Enjoy!');
    expect(savedOrder.referralCode).toBe('BRO1234');
  });
});
