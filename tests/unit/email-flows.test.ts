import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const h = vi.hoisted(() => {
  process.env.RESEND_API_KEY = 're_test';
  process.env.SELLER_EMAIL = 'owner@example.com';
  process.env.CRON_SECRET = 'cron';
  process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 't';

  const store = new Map<string, unknown>();
  const sets = new Map<string, Set<string>>();
  const lists = new Map<string, unknown[]>();
  const set = (k: string) => sets.get(k) ?? sets.set(k, new Set()).get(k)!;
  const list = (k: string) => lists.get(k) ?? lists.set(k, []).get(k)!;
  const redis = {
    get: async (k: string) => store.get(k) ?? null,
    set: async (k: string, v: unknown, o?: { nx?: boolean }) => {
      if (o?.nx && store.has(k)) return null;
      store.set(k, v);
      return 'OK';
    },
    del: async (k: string) => void (store.delete(k), sets.delete(k)),
    incr: async (k: string) => {
      const n = Number(store.get(k) ?? 0) + 1;
      store.set(k, n);
      return n;
    },
    expire: async () => 1,
    keys: async (pattern: string) =>
      [...store.keys(), ...sets.keys()].filter((k) => k.startsWith(pattern.replace('*', ''))),
    sadd: async (k: string, v: string) => void set(k).add(v),
    srem: async (k: string, v: string) => void set(k).delete(v),
    sismember: async (k: string, v: string) => (set(k).has(v) ? 1 : 0),
    smembers: async (k: string) => [...set(k)],
    rpush: async (k: string, v: unknown) => list(k).push(v),
    lpop: async (k: string) => list(k).shift() ?? null,
    llen: async (k: string) => list(k).length,
    pipeline: () => {
      const ops: Array<() => Promise<unknown>> = [];
      const p = {
        incr: (k: string) => (ops.push(() => redis.incr(k)), p),
        expire: () => (ops.push(() => redis.expire()), p),
        exec: async () => {
          const out = [];
          for (const op of ops) out.push(await op());
          return out;
        },
      };
      return p;
    },
  };

  return {
    store,
    sets,
    lists,
    redis,
    send: vi.fn(),
    contactCreate: vi.fn(async () => ({ data: { id: 'c' }, error: null })),
    contactUpdate: vi.fn(async () => ({ data: { id: 'c' }, error: null })),
    promoCreate: vi.fn(async () => ({ code: 'SAVE10' })),
    orders: [] as Array<Record<string, unknown>>,
    updateOrder: vi.fn(),
  };
});

vi.mock('@upstash/redis', () => ({ Redis: { fromEnv: () => h.redis } }));
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: h.send }, contacts: { create: h.contactCreate, update: h.contactUpdate } };
  }),
}));
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      coupons: { create: vi.fn(async () => ({ id: 'co' })) },
      promotionCodes: { create: h.promoCreate },
      products: { list: () => ({ autoPagingToArray: async () => [] }) },
    };
  }),
}));
vi.mock('../../api/_lib/orders.js', () => ({
  getOrders: async () => h.orders,
  updateOrder: h.updateOrder,
}));

import { sendEmail, sendOrQueue, flushOutbox, withUnsubscribe } from '../../api/_lib/mailer';
import { suppressEmail, isSuppressed } from '../../api/_lib/subscribers';
import { welcomeHtml, boxReturnRewardHtml, wholesaleInquiryHtml, MAIL_FROM } from '../../api/_lib/email';
import { sanitizeCart } from '../../api/_lib/carts';
import unsubscribe from '../../api/_lib/handlers/unsubscribe';
import resendWebhook from '../../api/_lib/handlers/resend-webhook';
import wholesale from '../../api/_lib/handlers/wholesale';
import abandonedCart from '../../api/_lib/handlers/abandoned-cart-check';
import reviewRequest from '../../api/_lib/handlers/review-request';
import verifyEmail from '../../api/_lib/handlers/verify-email';

const ok = { data: { id: 'em_1' }, error: null };
const fail = (name = 'application_error') => ({ data: null, error: { name, message: 'nope' } });

function res() {
  const r = {
    statusCode: 200,
    body: null as unknown,
    headers: {} as Record<string, string>,
    status(c: number) {
      r.statusCode = c;
      return r;
    },
    json(b: unknown) {
      r.body = b;
      return r;
    },
    send(b: unknown) {
      r.body = b;
      return r;
    },
    setHeader(k: string, v: string) {
      r.headers[k] = v;
      return r;
    },
  };
  return r;
}

type Handler = (req: never, res: never) => unknown;
async function call(handler: unknown, req: Record<string, unknown>) {
  const r = res();
  await (handler as Handler)({ method: 'POST', headers: {}, query: {}, ...req } as never, r as never);
  return r;
}

const msg = { from: MAIL_FROM, to: 'a@example.com', subject: 's', html: '<p>x</p>' };
const outbox = () => (h.lists.get('email:outbox') ?? []) as Array<{ tries: number }>;

beforeEach(() => {
  h.store.clear();
  h.sets.clear();
  h.lists.clear();
  h.orders.length = 0;
  h.send.mockReset().mockResolvedValue(ok);
  h.promoCreate.mockReset().mockResolvedValue({ code: 'SAVE10' });
  h.contactUpdate.mockClear();
  h.contactCreate.mockClear();
  h.updateOrder.mockClear();
});

describe('sendEmail', () => {
  it('throws when Resend returns an error instead of reporting success', async () => {
    h.send.mockResolvedValue(fail('validation_error'));
    await expect(sendEmail(msg)).rejects.toMatchObject({ code: 'validation_error' });
  });

  it('retries a per-second rate limit', async () => {
    h.send.mockResolvedValueOnce(fail('rate_limit_exceeded')).mockResolvedValueOnce(ok);
    await expect(sendEmail(msg)).resolves.toBe('em_1');
    expect(h.send).toHaveBeenCalledTimes(2);
  });
});

describe('outbox', () => {
  it('keeps a failed email and sends it on a later flush', async () => {
    h.send.mockResolvedValueOnce(fail());
    await expect(sendOrQueue(msg, { context: 'test' })).resolves.toBe('queued');
    expect(outbox()).toHaveLength(1);
    await expect(flushOutbox()).resolves.toMatchObject({ sent: 1 });
    expect(outbox()).toHaveLength(0);
  });

  it('gives up after repeated failures', async () => {
    h.send.mockResolvedValue(fail());
    await sendOrQueue(msg, { context: 'test' });
    for (let i = 0; i < 10; i++) await flushOutbox();
    expect(outbox()).toHaveLength(0);
    expect(h.send.mock.calls.length).toBeLessThanOrEqual(6);
  });

  it('does not use up retries while the daily quota is exhausted', async () => {
    h.send.mockResolvedValue(fail('daily_quota_exceeded'));
    await sendOrQueue(msg, { context: 'test' });
    for (let i = 0; i < 10; i++) await flushOutbox();
    expect(outbox()).toHaveLength(1);
  });

  it('drops queued marketing mail once the address unsubscribes', async () => {
    h.send.mockResolvedValueOnce(fail());
    await sendOrQueue(msg, { context: 'test', marketing: true });
    await suppressEmail('a@example.com');
    h.send.mockClear();
    await flushOutbox();
    expect(h.send).not.toHaveBeenCalled();
    expect(outbox()).toHaveLength(0);
  });
});

describe('unsubscribe', () => {
  const linkFor = async (to: string) => {
    const m = await withUnsubscribe({ ...msg, to, html: welcomeHtml() });
    return { m, url: new URL(m.headers!['List-Unsubscribe'].match(/<(https:[^>]+)>/)![1]) };
  };

  it('puts a one-click https link in the headers and the footer', async () => {
    const { m, url } = await linkFor('a@example.com');
    expect(url.pathname).toBe('/api/unsubscribe');
    expect(m.headers!['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    expect(m.html).toContain(url.href);
    expect(m.html).not.toContain('{{');
  });

  it('opening the link does not unsubscribe (mail scanners follow links)', async () => {
    const { url } = await linkFor('a@example.com');
    const r = await call(unsubscribe, { method: 'GET', query: { t: url.searchParams.get('t') } });
    expect(r.statusCode).toBe(200);
    expect(String(r.body)).toContain('<form method="post"');
    expect(await isSuppressed('a@example.com')).toBe(false);
  });

  it('POST unsubscribes and removes stock alerts', async () => {
    await h.redis.sadd('stock_alerts:prod_1', 'a@example.com');
    const { url } = await linkFor('A@Example.com');
    const r = await call(unsubscribe, { query: { t: url.searchParams.get('t') } });
    expect(r.statusCode).toBe(200);
    expect(await isSuppressed('a@example.com')).toBe(true);
    expect(await h.redis.smembers('stock_alerts:prod_1')).toEqual([]);
    expect(h.contactUpdate).toHaveBeenCalledWith({ email: 'a@example.com', unsubscribed: true });
  });

  it('rejects an unknown token', async () => {
    const r = await call(unsubscribe, { query: { t: 'nope' } });
    expect(r.statusCode).toBe(404);
  });

  it('transactional mail has no unsubscribe placeholder', () => {
    expect(boxReturnRewardHtml(50)).not.toContain('{{');
  });
});

describe('bounce alerts', () => {
  const event = (over: Record<string, unknown> = {}) => ({
    type: 'email.bounced',
    data: {
      email_id: 'em_9',
      from: 'GingerBros Orders <order@gingerbrosshop.com>',
      to: ['typo@example.com'],
      subject: 'Your <quote>',
      bounce: { type: 'Permanent', message: 'mailbox unavailable' },
    },
    ...over,
  });
  const fromResend = { 'x-forwarded-for': '44.228.126.217' };

  it('rejects callers that are not Resend', async () => {
    const r = await call(resendWebhook, { headers: { 'x-forwarded-for': '1.2.3.4' }, body: event() });
    expect(r.statusCode).toBe(401);
    expect(h.send).not.toHaveBeenCalled();
  });

  it('accepts the documented IPv6 range', async () => {
    const r = await call(resendWebhook, { headers: { 'x-forwarded-for': '2600:1f24:64:8abc::1' }, body: event() });
    expect(r.statusCode).toBe(200);
  });

  it('emails the owner once, escaped, and stops marketing to a dead address', async () => {
    await call(resendWebhook, { headers: fromResend, body: event() });
    await call(resendWebhook, { headers: fromResend, body: event() });
    expect(h.send).toHaveBeenCalledTimes(1);
    const sent = h.send.mock.calls[0][0];
    expect(sent.to).toBe('owner@example.com');
    expect(sent.subject).toContain('typo@example.com');
    expect(sent.html).toContain('mailbox unavailable');
    expect(sent.html).toContain('Your &lt;quote&gt;');
    expect(await isSuppressed('typo@example.com')).toBe(true);
  });

  it('never alerts about mail to the alert address itself', async () => {
    const e = event();
    e.data.to = ['owner@example.com'];
    const r = await call(resendWebhook, { headers: fromResend, body: e });
    expect(r.statusCode).toBe(200);
    expect(h.send).not.toHaveBeenCalled();
  });

  it('asks Resend to retry if the alert cannot be sent', async () => {
    h.send.mockResolvedValueOnce(fail());
    const first = await call(resendWebhook, { headers: fromResend, body: event() });
    expect(first.statusCode).toBe(500);
    const retry = await call(resendWebhook, { headers: fromResend, body: event() });
    expect(retry.statusCode).toBe(200);
    expect(h.send).toHaveBeenCalledTimes(2);
  });

  it('ignores delivery events', async () => {
    await call(resendWebhook, { headers: fromResend, body: event({ type: 'email.delivered' }) });
    expect(h.send).not.toHaveBeenCalled();
  });
});

describe('wholesale form', () => {
  const body = { businessName: 'Cafe', contactName: 'Som', email: 's@example.com', message: 'hi' };

  it('shows an error with a fallback address when the lead cannot be sent', async () => {
    h.send.mockResolvedValue(fail('daily_quota_exceeded'));
    const r = await call(wholesale, { body });
    expect(r.statusCode).toBe(500);
    expect(JSON.stringify(r.body)).toContain('order@gingerbrosshop.com');
  });

  it('confirms to one address only once a day', async () => {
    await call(wholesale, { body });
    await call(wholesale, { body, headers: { 'x-forwarded-for': '9.9.9.9' } });
    const confirmations = h.send.mock.calls.filter((c) => c[0].to === 's@example.com');
    expect(confirmations).toHaveLength(1);
  });

  it('refuses links in the names that get echoed back', async () => {
    const r = await call(wholesale, { body: { ...body, contactName: 'see http://evil.test' } });
    expect(r.statusCode).toBe(400);
    expect(h.send).not.toHaveBeenCalled();
  });

  it('the lead alert has no internal footer to leak into a reply', () => {
    expect(wholesaleInquiryHtml(body, 'AB')).not.toContain('internal notification');
  });
});

describe('cart reminders', () => {
  const cron = { method: 'GET', headers: { authorization: 'Bearer cron' } };
  const cart = (over: Record<string, unknown> = {}) => ({
    email: 'c@example.com',
    items: [{ name: 'Ginger Fizz', price: 140, quantity: 1, image: '/images/gen/ginger-fizz.jpg' }],
    subtotal: 140,
    url: 'https://gingerbrosshop.com/shop',
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    ...over,
  });
  const saved = () => h.store.get('abandoned_carts:c@example.com') as { recovered?: boolean };

  it('rewrites off-site links and link text from a forged cart', () => {
    const clean = sanitizeCart(
      cart({
        url: 'https://evil.test/login',
        items: [{ name: 'Verify at http://evil.test now', price: 1, quantity: 1, image: 'https://evil.test/x.png' }],
      }) as never,
    );
    expect(JSON.stringify(clean)).not.toContain('evil.test');
    expect(clean.url).toBe('https://gingerbrosshop.com/shop');
  });

  it('keeps our own product photos', () => {
    for (const image of ['/images/gen/x.jpg', 'https://res.cloudinary.com/yqbe4rnq/image/upload/kl.jpg']) {
      const item = { name: 'Tap', price: 1, quantity: 1, image };
      expect(sanitizeCart(cart({ items: [item] }) as never).items[0].image).toBe(image);
    }
  });

  it('leaves the cart pending when the send fails', async () => {
    h.store.set('abandoned_carts:c@example.com', cart());
    h.send.mockResolvedValue(fail());
    await call(abandonedCart, cron);
    expect(saved().recovered).toBeFalsy();
  });

  it('marks it done after a successful send, and does not remind again that week', async () => {
    h.store.set('abandoned_carts:c@example.com', cart());
    await call(abandonedCart, cron);
    expect(saved().recovered).toBe(true);
    h.store.set('abandoned_carts:c@example.com', cart());
    h.send.mockClear();
    await call(abandonedCart, cron);
    expect(h.send).not.toHaveBeenCalled();
  });

  it('skips unsubscribed addresses', async () => {
    h.store.set('abandoned_carts:c@example.com', cart());
    await suppressEmail('c@example.com');
    await call(abandonedCart, cron);
    expect(h.send).not.toHaveBeenCalled();
  });

  it('review requests are not marked asked when the send fails', async () => {
    h.orders.push({
      sessionId: 'cs_1', customerEmail: 'r@example.com', status: 'paid', items: [],
      createdAt: new Date(Date.now() - 10 * 86400_000).toISOString(),
    });
    h.send.mockResolvedValue(fail());
    await call(reviewRequest, cron);
    expect(h.updateOrder).not.toHaveBeenCalled();
  });
});

describe('newsletter verification', () => {
  const req = { body: { email: 'n@example.com', code: '123456' } };

  it('says the email was not sent, still hands over the code, and records the subscriber', async () => {
    h.store.set('verify:n@example.com', '123456');
    h.send.mockResolvedValue(fail());
    const r = await call(verifyEmail, req);
    expect(r.body).toMatchObject({ success: true, sent: false, promoCode: 'SAVE10' });
    expect(await h.redis.smembers('newsletter:subscribers')).toEqual(['n@example.com']);
  });

  // The Redis client parses "123456" back into the number 123456.
  it('accepts the correct code as the database returns it', async () => {
    h.store.set('verify:n@example.com', 123456);
    const r = await call(verifyEmail, req);
    expect(r.body).toMatchObject({ success: true, sent: true });
  });

  it('keeps the verification code usable when the discount cannot be created', async () => {
    h.store.set('verify:n@example.com', '123456');
    h.promoCreate.mockRejectedValue(new Error('stripe down'));
    const r = await call(verifyEmail, req);
    expect(r.statusCode).toBe(502);
    expect(h.store.get('verify:n@example.com')).toBe('123456');
  });
});

describe('public contact address', () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? files(p) : /\.(tsx?|mjs|json|md|txt|html)$|\/ucp$/.test(p) ? [p] : [];
    });

  it('never publishes the Gmail inbox on the website', () => {
    const offenders = [...files('src'), ...files('public'), 'scripts/prerender.mjs', 'index.html'].filter((f) =>
      readFileSync(f, 'utf8').includes('gingerbros.brew@'),
    );
    expect(offenders).toEqual([]);
  });
});
