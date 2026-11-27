import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  process.env.RESEND_API_KEY = 're_test';
  process.env.SELLER_EMAIL = 'owner@example.com';
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 't';
  const writes: string[] = [];
  const redis: Record<string, unknown> = {};
  for (const name of ['get', 'smembers', 'keys', 'lrange']) redis[name] = async () => (name === 'get' ? null : []);
  for (const name of ['set', 'sadd', 'srem', 'del', 'rpush', 'incr', 'expire', 'lpush', 'hset'])
    redis[name] = async (k: string) => (writes.push(`${name} ${k}`), 1);
  redis.scard = async () => 0;
  redis.sismember = async () => 0;
  redis.pipeline = () => {
    const p = { incr: () => p, expire: () => p, exec: async () => [1, 1] };
    return p;
  };
  return { writes, redis, send: vi.fn(async () => ({ data: { id: 'x' }, error: null })) };
});

vi.mock('@upstash/redis', () => ({ Redis: { fromEnv: () => h.redis } }));
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: h.send }, contacts: {} };
  }),
}));
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function () {
    return { checkout: { sessions: { retrieve: vi.fn(async () => ({ status: 'open' })) } }, promotionCodes: { list: vi.fn(async () => ({ data: [] })) } };
  }),
}));

async function call(name: string, req: Record<string, unknown>) {
  const { default: handler } = await import(`../../api/_lib/handlers/${name}.ts`);
  const r = {
    statusCode: 200,
    body: null as unknown,
    status(c: number) { r.statusCode = c; return r; },
    json(b: unknown) { r.body = b; return r; },
    send(b: unknown) { r.body = b; return r; },
    end() { return r; },
    setHeader() { return r; },
    redirect() { return r; },
  };
  await handler({ method: 'POST', headers: {}, query: {}, body: {}, ...req }, r);
  return r;
}

const two = ['a@b.co', 'c@d.co'];

/** Each of these returned a 500 from the live site. */
describe('malformed input is rejected, not crashed on', () => {
  it.each([
    ['subscribe', { body: { email: 123 } }],
    ['subscribe', { body: { email: two } }],
    ['verify-email', { body: { email: 'x@y.co', code: 123456 } }],
    ['verify-email', { body: { email: {}, code: '1' } }],
    ['wholesale', { body: { businessName: 1, contactName: 2, email: 3, message: 4 } }],
    ['stock-alert', { body: { email: 5, productId: 6 } }],
    ['email-tracking', { body: { email: 5, order: 6 } }],
    ['email-tracking', { query: { email: two, order: 'X' } }],
    ['track-order', { method: 'GET', query: { email: two, order: '1' } }],
    ['orders-by-email', { method: 'GET', query: { email: two } }],
    ['referral', { method: 'GET', query: { email: two } }],
    ['credit', { method: 'GET', query: { email: two } }],
    ['reviews', { method: 'GET', query: { productId: two } }],
    ['reviews', { method: 'GET', query: { productIds: two } }],
    ['reviews', { body: { productId: 1, name: 2, rating: 'x', text: 3 } }],
    ['share-cart', { method: 'GET', query: { id: two } }],
    ['shipping-rate', { method: 'GET', query: { province: two } }],
    ['order-details', { method: 'GET', query: { session_id: two } }],
  ])('%s %j', async (name, req) => {
    const r = await call(name, req);
    expect(r.statusCode).toBeLessThan(500);
  });

  it('checkout ignores non-text optional fields instead of crashing', async () => {
    const r = await call('checkout', { body: { items: [], email: 5, promoCode: {}, source: 1, orderNote: [] } });
    expect(r.statusCode).toBe(400);
  });
});

describe('referral credit', () => {
  // Credit comes off real orders, so it may only be granted by a completed purchase (the Stripe webhook).
  it('cannot be granted by calling the API', async () => {
    h.writes.length = 0;
    (h.redis as { get: unknown }).get = async (k: string) => (k.startsWith('referral:owner') ? 'me@example.com' : null);
    const r = await call('referral', { body: { code: 'BROABC', email: 'anyone@example.com' } });
    expect(r.statusCode).toBe(405);
    expect(h.writes.filter((w) => w.includes('store_credit'))).toEqual([]);
  });
});
