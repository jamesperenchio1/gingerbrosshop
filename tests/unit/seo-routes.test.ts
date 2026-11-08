import { describe, expect, it } from 'vitest';
import { ROUTE_SEO, THAI_PATHS, PRERENDER_PATHS, SITEMAP_PATHS, routeSeo, isIndexable } from '../../src/seo/routes';
import { breadcrumbList, graph, organizationNode, siteGraph, ORG_ID, WEBSITE_ID } from '../../src/seo/schema';

describe('SEO route registry', () => {
  const entries = Object.entries(ROUTE_SEO);

  it('has unique titles and descriptions across indexable routes', () => {
    const indexable = entries.filter(([, r]) => r.indexable !== false);
    expect(new Set(indexable.map(([, r]) => r.title)).size).toBe(indexable.length);
    expect(new Set(indexable.map(([, r]) => r.description)).size).toBe(indexable.length);
  });

  it('keeps titles and descriptions within search-result limits', () => {
    for (const [path, r] of entries) {
      expect(r.title.length, `title ${path}`).toBeGreaterThan(9);
      expect(r.title.length, `title ${path}`).toBeLessThanOrEqual(75);
      if (r.indexable !== false) expect(r.description.length, `description ${path}`).toBeGreaterThan(39);
      expect(r.description.length, `description ${path}`).toBeLessThanOrEqual(200);
      if (r.titleTh) expect(r.titleTh.length, `th title ${path}`).toBeLessThanOrEqual(90);
    }
  });

  it('gives every Thai route both a title and a description', () => {
    for (const [path, r] of entries) {
      expect(Boolean(r.titleTh), `titleTh ${path}`).toBe(Boolean(r.descriptionTh));
    }
    expect(THAI_PATHS).toContain('/');
  });

  it('never lists noindex or non-prerendered routes in the sitemap', () => {
    for (const p of SITEMAP_PATHS) {
      expect(isIndexable(p)).toBe(true);
      expect(PRERENDER_PATHS).toContain(p);
    }
    expect(SITEMAP_PATHS).not.toContain('/track');
    expect(SITEMAP_PATHS).not.toContain('/orders');
  });

  it('resolves Thai copy and falls back to English', () => {
    expect(routeSeo('/shop', 'th')?.title).toBe(ROUTE_SEO['/shop'].titleTh);
    expect(routeSeo('/returns', 'th')?.title).toBe(ROUTE_SEO['/returns'].title);
    expect(routeSeo('/nope')).toBeUndefined();
  });

  it('carries no health or fermentation claims', () => {
    const banned = /ferment|probiotic|prebiotic|gut|immun|detox|healing|cure/i;
    for (const [path, r] of entries) {
      expect(`${r.title} ${r.description} ${r.titleTh ?? ''} ${r.descriptionTh ?? ''}`, path).not.toMatch(banned);
    }
  });
});

describe('schema builders', () => {
  it('links entities by stable @id and serialises cleanly', () => {
    const doc = siteGraph();
    expect(doc['@context']).toBe('https://schema.org');
    const org = doc['@graph'].find((n) => (n as { '@id'?: string })['@id'] === ORG_ID);
    const site = doc['@graph'].find((n) => (n as { '@id'?: string })['@id'] === WEBSITE_ID) as { publisher?: { '@id': string } };
    expect(org).toBeTruthy();
    expect(site.publisher?.['@id']).toBe(ORG_ID);
    expect(() => JSON.parse(JSON.stringify(doc))).not.toThrow();
    expect(graph(organizationNode())['@graph']).toHaveLength(1);
  });

  it('builds breadcrumbs with absolute URLs', () => {
    const list = breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }]);
    expect(list.itemListElement[0].item).toBe('https://gingerbrosshop.com');
    expect(list.itemListElement[1].item).toBe('https://gingerbrosshop.com/shop');
    expect(list.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });
});
