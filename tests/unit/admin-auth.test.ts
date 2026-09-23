import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory stand-in for Upstash so the real adminAuth logic runs.
const { store, sendEmail } = vi.hoisted(() => ({
  store: new Map<string, string>(),
  sendEmail: vi.fn<(msg: { to: string; html: string }) => Promise<{ error: null }>>(async () => ({ error: null })),
}));
vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({
      set: async (k: string, v: string) => void store.set(k, v),
      get: async (k: string) => store.get(k) ?? null,
      getdel: async (k: string) => {
        const v = store.get(k) ?? null;
        store.delete(k);
        return v;
      },
      del: async (k: string) => void store.delete(k),
    }),
  },
}));
vi.mock('../../api/_lib/rateLimit.js', () => ({
  rateLimit: vi.fn(async () => ({ allowed: true, remaining: 10, reset: Date.now() })),
  getClientIp: vi.fn(() => '127.0.0.1'),
}));
vi.mock('../../api/_lib/email.js', () => ({
  getResend: () => ({ emails: { send: sendEmail } }),
  MAIL_FROM: 'GingerBros <orders@gingerbrosshop.com>',
  adminLoginHtml: (link: string) => `<a href="${link}">Log in</a>`,
}));

process.env.ADMIN_EMAILS = 'boss@example.com, Second@Example.com';

import handler from '../../api/_lib/handlers/auth';
import { isAdminAuthorized } from '../../api/_lib/adminAuth';

type Req = Parameters<typeof handler>[0];
type Res = Parameters<typeof handler>[1];

function req(action: string, init: { method?: string; body?: unknown; cookie?: string; origin?: string } = {}): Req {
  return {
    method: init.method ?? 'POST',
    url: `/api/auth?action=${action}`,
    query: { action },
    body: init.body,
    headers: { host: 'gingerbrosshop.com', ...(init.cookie ? { cookie: init.cookie } : {}), ...(init.origin ? { origin: init.origin } : {}) },
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

async function loginAs(email: string): Promise<string> {
  await handler(req('request', { body: { email } }), res() as unknown as Res);
  const html = sendEmail.mock.calls.at(-1)![0].html;
  const token = decodeURIComponent(html.match(/token=([^&"]+)/)![1]);
  const r = res();
  await handler(req('verify', { body: { token } }), r as unknown as Res);
  expect(r.statusCode).toBe(200);
  return r.headers['set-cookie'];
}

describe('admin magic-link auth', () => {
  beforeEach(() => {
    store.clear();
    sendEmail.mockClear();
  });

  it('answers identically for non-admin emails and sends nothing', async () => {
    const a = res();
    const b = res();
    await handler(req('request', { body: { email: 'boss@example.com' } }), a as unknown as Res);
    await handler(req('request', { body: { email: 'stranger@example.com' } }), b as unknown as Res);
    expect(a.statusCode).toBe(200);
    expect(b.body).toEqual(a.body);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail.mock.calls[0][0].to).toBe('boss@example.com');
  });

  it('is case-insensitive on the allow-list', async () => {
    await handler(req('request', { body: { email: 'second@example.com' } }), res() as unknown as Res);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it('issues an HttpOnly, Secure, SameSite=Strict session cookie and a single-use link', async () => {
    const cookie = await loginAs('boss@example.com');
    expect(cookie).toMatch(/^gb_admin=[\w-]+; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000$/);
    // the raw token is not what's stored
    expect([...store.keys()].some((k) => k.includes(cookie.split(';')[0].split('=')[1]))).toBe(false);

    const html = sendEmail.mock.calls.at(-1)![0].html;
    const token = decodeURIComponent(html.match(/token=([^&"]+)/)![1]);
    const again = res();
    await handler(req('verify', { body: { token } }), again as unknown as Res);
    expect(again.statusCode).toBe(401);
  });

  it('authorizes requests with the session cookie, and not after logout', async () => {
    const cookie = (await loginAs('boss@example.com')).split(';')[0];
    expect(await isAdminAuthorized(req('me', { method: 'GET', cookie }))).toBe(true);
    expect(await isAdminAuthorized(req('me', { method: 'GET' }))).toBe(false);
    expect(await isAdminAuthorized(req('me', { method: 'GET', cookie: 'gb_admin=forged-value-forged-value-123' }))).toBe(false);

    await handler(req('logout', { cookie }), res() as unknown as Res);
    expect(await isAdminAuthorized(req('me', { method: 'GET', cookie }))).toBe(false);
  });

  it('rejects cross-origin writes even with a valid cookie', async () => {
    const cookie = (await loginAs('boss@example.com')).split(';')[0];
    expect(await isAdminAuthorized(req('x', { method: 'POST', cookie, origin: 'https://evil.example' }))).toBe(false);
    expect(await isAdminAuthorized(req('x', { method: 'POST', cookie, origin: 'https://gingerbrosshop.com' }))).toBe(true);
  });

  it('revokes sessions when an email is removed from ADMIN_EMAILS', async () => {
    const cookie = (await loginAs('second@example.com')).split(';')[0];
    process.env.ADMIN_EMAILS = 'boss@example.com';
    expect(await isAdminAuthorized(req('me', { method: 'GET', cookie }))).toBe(false);
    process.env.ADMIN_EMAILS = 'boss@example.com, Second@Example.com';
  });
});
