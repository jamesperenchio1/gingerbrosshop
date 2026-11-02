import { describe, it, expect } from 'vitest';
import { bestPrice, multiBuyDiscount, nextDealHint } from '../../api/_lib/multiBuy';

describe('bestPrice', () => {
  it.each([
    [1, 0, 140], [0, 1, 119],
    [2, 0, 260], [3, 0, 390], [6, 0, 780],
    [0, 2, 220], [0, 3, 315], [0, 6, 600],
    [1, 1, 240], [2, 2, 460],
  ])('%i fizz + %i tea = ฿%i (print-shop price list)', (f, t, price) => {
    expect(bestPrice(f, t)).toBe(price);
  });

  it('prices counts the list does not show from the deals', () => {
    expect(bestPrice(0, 4)).toBe(434); // 3 tea + 1
    expect(bestPrice(4, 0)).toBe(520);
    expect(bestPrice(3, 2)).toBe(600); // 2F+2T + 1F beats 3F + 2T (610)
    expect(bestPrice(0, 0)).toBe(0);
  });

  it('stays exact and fast for large orders', () => {
    expect(bestPrice(24, 0)).toBe(24 * 130);
    expect(bestPrice(0, 24)).toBe(4 * 600);
    const start = Date.now();
    expect(bestPrice(1_000_000, 1_000_000)).toBeGreaterThan(0);
    expect(Date.now() - start).toBeLessThan(1000);
  });
});

describe('multiBuyDiscount', () => {
  it('discounts loose bottles to the deal price', () => {
    expect(multiBuyDiscount([{ price: 140, quantity: 3, bottlesFizz: 1 }])).toBe(30);
  });

  it('does not double-discount a bundle, and tops it up with a loose bottle', () => {
    expect(multiBuyDiscount([{ price: 260, quantity: 1, bottlesFizz: 2 }])).toBe(0);
    expect(multiBuyDiscount([
      { price: 260, quantity: 1, bottlesFizz: 2 },
      { price: 140, quantity: 1, bottlesFizz: 1 },
    ])).toBe(10);
  });

  it('mixes fizz and tea', () => {
    expect(multiBuyDiscount([
      { price: 140, quantity: 1, bottlesFizz: 1 },
      { price: 119, quantity: 1, bottlesTea: 1 },
    ])).toBe(19);
  });

  it('ignores lines without bottles', () => {
    expect(multiBuyDiscount([{ price: 1200, quantity: 1 }])).toBe(0);
  });
});

describe('nextDealHint', () => {
  it('suggests the bottle that unlocks a deal', () => {
    expect(nextDealHint(1, 0)).not.toBeNull();
    expect(nextDealHint(0, 0)).toBeNull();
  });
});
