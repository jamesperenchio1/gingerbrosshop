import { describe, it, expect } from 'vitest';
import { resolveRate, FALLBACK_USD_PER_THB, thbToUsdcAtomic, shippingThb, validateDelivery, MAX_ORDER_THB } from '../../api/_lib/x402Pricing';

describe('x402 pricing', () => {
  it('converts baht to USDC atomic units, rounded up with a buffer', () => {
    // ฿100 * 0.03 = $3.00, +2% = $3.06
    expect(thbToUsdcAtomic(100, 0.03)).toBe('3060000');
    expect(BigInt(thbToUsdcAtomic(119, 0.029806))).toBeGreaterThan(BigInt(Math.floor(119 * 0.029806 * 1e6)));
  });
  it('rejects bad amounts or rates', () => {
    expect(() => thbToUsdcAtomic(0, 0.03)).toThrow();
    expect(() => thbToUsdcAtomic(100, 0)).toThrow();
  });
  it('matches the card-checkout shipping rules', () => {
    expect(shippingThb(499, false)).toBe(100);
    expect(shippingThb(500, false)).toBe(0);
    expect(shippingThb(499, true)).toBe(200);
    expect(shippingThb(500, true)).toBe(100);
  });
  it('has a sane order ceiling', () => expect(MAX_ORDER_THB).toBe(3000));
  it('validates delivery details', () => {
    const good = { email: 'A@B.co', name: 'Som Chai', phone: '0812345678', address: { line1: '1 Sukhumvit', province: 'Bangkok', postalCode: '10110' } };
    const r = validateDelivery(good);
    expect(r.ok && r.email).toBe('a@b.co');
    expect(validateDelivery({ ...good, email: 'nope' }).ok).toBe(false);
    expect(validateDelivery({ ...good, address: { ...good.address, postalCode: '1011' } }).ok).toBe(false);
    expect(validateDelivery({ ...good, phone: '123' }).ok).toBe(false);
    expect(validateDelivery({ ...good, address: { province: 'Bangkok', postalCode: '10110' } }).ok).toBe(false);
  });

  it('uses the hour cache first, then live sources in order', async () => {
    expect((await resolveRate({ cached: 0.03, sources: [], last: null })).tier).toBe('cached');
    const r = await resolveRate({ cached: null, sources: [async () => { throw new Error('x'); }, async () => 0.0299], last: 0.02 });
    expect(r).toEqual({ rate: 0.0299, tier: 'live' });
  });
  it('skips nonsense rates, then falls back to the last known rate, then the fixed one', async () => {
    const bad = async () => 5;
    expect(await resolveRate({ cached: null, sources: [bad], last: 0.0295 })).toEqual({ rate: 0.0295, tier: 'last' });
    expect(await resolveRate({ cached: null, sources: [bad], last: null })).toEqual({ rate: FALLBACK_USD_PER_THB, tier: 'fallback' });
  });
});
