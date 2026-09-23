import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/_lib/rateLimit.js', () => ({
  rateLimit: vi.fn(async () => ({ allowed: true, remaining: 10, reset: Date.now() })),
  getClientIp: vi.fn(() => '127.0.0.1'),
}));

const { recordLinkEvent, recordQrScan } = vi.hoisted(() => ({
  recordLinkEvent: vi.fn<(event: unknown) => Promise<void>>(async () => {}),
  recordQrScan: vi.fn<(slug: string) => Promise<void>>(async () => {}),
}));
vi.mock('../../api/_lib/linkpage.js', () => ({
  getLinkPageConfig: vi.fn(async () => (await import('../../api/_lib/linkpageSchema')).DEFAULT_LINKPAGE_CONFIG),
  recordLinkEvent,
  addLinkPageSignup: vi.fn(async () => {}),
  getQrCode: vi.fn(async (slug: string) =>
    slug === 'bottle' ? { slug, name: 'Bottle', targetUrl: 'https://link.gingerbrosshop.com/?src=qr', fg: '#000000', bg: '#ffffff', createdAt: '' } : null,
  ),
  recordQrScan,
}));
vi.mock('../../api/_lib/handlers/subscribe.js', () => ({ default: vi.fn() }));

import handler from '../../api/_lib/handlers/links';

type Req = Parameters<typeof handler>[0];
type Res = Parameters<typeof handler>[1];

function mockReq(url: string, query: Record<string, string>, init: Partial<Req> = {}): Req {
  return { method: 'GET', url, query, headers: { 'user-agent': 'Mozilla/5.0 (iPhone)' }, body: undefined, ...init } as unknown as Req;
}

function mockRes() {
  const res = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    status(code: number) { res.statusCode = code; return res; },
    json(b: unknown) { res.body = b; return res; },
    setHeader(k: string, v: string) { res.headers[k.toLowerCase()] = v; return res; },
    end() { return res; },
  };
  return res;
}

describe('/api/links handler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('serves the public config', async () => {
    const res = mockRes();
    await handler(mockReq('/api/links', {}), res as unknown as Res);
    expect(res.statusCode).toBe(200);
    expect((res.body as { config: { blocks: unknown[] } }).config.blocks).toHaveLength(8);
  });

  it('records a click beacon sent as text/plain via ?action=event', async () => {
    const res = mockRes();
    await handler(
      mockReq('/api/links?action=event', { action: 'event' }, { method: 'POST', body: '{"type":"click","blockId":"shop"}' }),
      res as unknown as Res,
    );
    expect(res.statusCode).toBe(204);
    expect(recordLinkEvent).toHaveBeenCalledWith({ type: 'click', blockId: 'shop' });
  });

  it('redirects a QR code and counts the scan (rewritten and original URL forms)', async () => {
    for (const [url, query] of [['/api/links?qr=bottle', { qr: 'bottle' }], ['/q/bottle', {}]] as const) {
      const res = mockRes();
      await handler(mockReq(url, query), res as unknown as Res);
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('https://link.gingerbrosshop.com/?src=qr');
    }
    expect(recordQrScan).toHaveBeenCalledTimes(2);
  });

  it('sends unknown QR codes home without counting', async () => {
    const res = mockRes();
    await handler(mockReq('/api/links?qr=nope', { qr: 'nope' }), res as unknown as Res);
    expect(res.headers.location).toBe('/');
    expect(recordQrScan).not.toHaveBeenCalled();
  });
});
