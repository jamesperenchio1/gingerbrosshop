import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { htmlToMarkdown, prefersMarkdown } from '../../src/seo/htmlToMarkdown';

const pub = (f: string) => readFileSync(path.resolve(__dirname, '../../public', f), 'utf8');
const json = (f: string) => JSON.parse(pub(f));

describe('markdown negotiation', () => {
  it('detects Accept preference', () => {
    expect(prefersMarkdown('text/markdown')).toBe(true);
    expect(prefersMarkdown('text/markdown, text/html;q=0.5')).toBe(true);
    expect(prefersMarkdown('text/html,application/xhtml+xml,*/*;q=0.8')).toBe(false);
    expect(prefersMarkdown('text/markdown;q=0.1, text/html')).toBe(false);
    expect(prefersMarkdown(null)).toBe(false);
  });
  it('converts a page', () => {
    const md = htmlToMarkdown(
      '<html><head><title>Fizz | GingerBros</title><meta name="description" content="Fresh &amp; bright"></head><body><nav>menu</nav><h1>Fizz | GingerBros</h1><p>Real <strong>ginger</strong> <a href="/shop">shop</a></p><script>x()</script><ul><li>One</li></ul></body></html>',
      'https://gingerbrosshop.com/product/ginger-fizz',
    );
    expect(md).toContain('# Fizz | GingerBros');
    expect(md).toContain('> Fresh & bright');
    expect(md).toContain('Real **ginger** [shop](https://gingerbrosshop.com/shop)');
    expect(md).toContain('- One');
    expect(md).not.toContain('menu');
    expect(md).not.toContain('x()');
  });
});

describe('discovery documents', () => {
  it('api-catalog is a linkset with service-desc and service-doc', () => {
    const { linkset } = json('.well-known/api-catalog');
    expect(linkset.length).toBeGreaterThan(0);
    for (const e of linkset) {
      expect(e.anchor).toMatch(/^https:\/\//);
      expect(e['service-desc'][0].href).toBeTruthy();
      expect(e['service-doc'][0].href).toBeTruthy();
    }
  });
  it('openapi declares x-payment-info with intent, method, amount', () => {
    const api = json('openapi.json');
    const infos = Object.values<any>(api.paths).flatMap((p) => Object.values<any>(p)).map((o) => o['x-payment-info']).filter(Boolean);
    expect(infos.length).toBeGreaterThan(0);
    for (const i of infos) {
      expect(['charge', 'session']).toContain(i.intent);
      expect(['tempo', 'stripe', 'lightning', 'card']).toContain(i.method);
      expect(i.amount).toBeTruthy();
    }
  });
  it('acp and ucp documents have required fields', () => {
    const acp = json('.well-known/acp.json');
    expect(acp.protocol).toMatchObject({ name: 'acp' });
    expect(acp.protocol.version).toBeTruthy();
    expect(acp.api_base_url).toMatch(/^https?:\/\//);
    expect(acp.transports.length).toBeGreaterThan(0);
    expect(acp.capabilities.services.length).toBeGreaterThan(0);
    const ucp = json('.well-known/ucp');
    for (const k of ['protocol_version', 'services', 'capabilities', 'endpoints']) expect(ucp[k]).toBeTruthy();
  });
  it('auth.md has an h1 with auth.md; robots.txt has Content-Signal', () => {
    expect(pub('auth.md')).toMatch(/^# .*auth\.md/m);
    expect(pub('robots.txt')).toMatch(/^Content-Signal: .*ai-train=no/m);
  });
});
