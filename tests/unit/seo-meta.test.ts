import { describe, it, expect } from 'vitest';
import { drinkSeo, drinkSeoKind } from '@/lib/seoMeta';

const PRODUCTS: Array<[string, string]> = [
  ['ginger-fizz', 'Ginger Fizz'],
  ['ginger-fizz-6pack', 'Ginger Fizz 6-Pack'],
  ['ginger-tea', 'Ginger Tea · Thai Spice'],
  ['ginger-tea-6pack', 'Ginger Tea 6-Pack'],
  ['fizz-tea-duo', 'Fizz & Tea Duo'],
  ['fizz-tea-4pack', 'Fizz & Tea 4-Pack'],
];

describe('drink search wording', () => {
  it('classifies drink ids and ignores equipment', () => {
    expect(drinkSeoKind('ginger-fizz-3pack')).toBe('fizz');
    expect(drinkSeoKind('ginger-tea-2pack')).toBe('tea');
    expect(drinkSeoKind('fizz-tea-duo')).toBe('mix');
    expect(drinkSeo('keg-19l', 'Keg')).toBeNull();
  });

  it.each(PRODUCTS)('%s fits search results', (id, name) => {
    const seo = drinkSeo(id, name)!;
    // + " | GingerBros" suffix added by the page.
    expect(`${seo.title} | GingerBros`.length).toBeLessThanOrEqual(65);
    expect(seo.description.length).toBeGreaterThanOrEqual(90);
    expect(seo.description.length).toBeLessThanOrEqual(160);
    expect(seo.title + seo.description).not.toMatch(/ferment|probiotic|prebiotic|gut|immun|health/i);
  });
});
