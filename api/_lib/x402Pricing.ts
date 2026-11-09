// Pure helpers for x402 (USDC on Base) order pricing. Kept free of I/O so they
// can be unit-tested.

export const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const USDC_DECIMALS = 6;
/** Buffer on top of the THB→USD rate to absorb the rate moving between quote and sale. */
export const RATE_BUFFER = 0.02;
/** Hard ceiling per x402 order, in baht (limits the blast radius of any bug). */
export const MAX_ORDER_THB = 3000;
const SHIPPING_FLAT_THB = 100;
const FREE_SHIPPING_THB = 500;

export function shippingThb(subtotalAfterDealsThb: number, coldChain: boolean): number {
  const free = subtotalAfterDealsThb >= FREE_SHIPPING_THB;
  if (coldChain) return free ? SHIPPING_FLAT_THB : SHIPPING_FLAT_THB * 2;
  return free ? 0 : SHIPPING_FLAT_THB;
}

/** Baht total → USDC atomic units (6 decimals), rounded up so the shop is never short. */
export function thbToUsdcAtomic(thb: number, usdPerThb: number): string {
  if (!(thb > 0) || !(usdPerThb > 0)) throw new Error('Invalid amount or rate');
  const usd = thb * usdPerThb * (1 + RATE_BUFFER);
  return String(Math.ceil(usd * 10 ** USDC_DECIMALS));
}

export interface AddressInput {
  line1?: unknown;
  line2?: unknown;
  district?: unknown;
  province?: unknown;
  postalCode?: unknown;
}

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Validate the delivery details. Returns the cleaned fields or an error message. */
export function validateDelivery(body: Record<string, any>):
  | { ok: true; email: string; name: string; phone: string; address: { line1: string; line2: string; city: string; state: string; postal_code: string; country: 'TH' }; note: string }
  | { ok: false; error: string } {
  const email = clean(body.email, 200).toLowerCase();
  const name = clean(body.name, 120);
  const phone = clean(body.phone, 30);
  const a = (body.address ?? {}) as AddressInput;
  const line1 = clean(a.line1, 200);
  const province = clean(a.province, 80);
  const postal = clean(a.postalCode, 10);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'A valid email is required' };
  if (name.length < 2) return { ok: false, error: 'name is required' };
  if (phone.replace(/\D/g, '').length < 8) return { ok: false, error: 'A valid phone number is required' };
  if (line1.length < 3) return { ok: false, error: 'address.line1 is required' };
  if (!province) return { ok: false, error: 'address.province is required' };
  if (!/^\d{5}$/.test(postal)) return { ok: false, error: 'address.postalCode must be a 5-digit Thai postcode' };
  return {
    ok: true,
    email,
    name,
    phone,
    address: { line1, line2: clean(a.line2, 200), city: clean(a.district, 80), state: province, postal_code: postal, country: 'TH' },
    note: clean(body.note, 500),
  };
}

/** Last-resort USD per THB, deliberately a little above the market (about 0.0298) so a stale rate never underprices an order. */
export const FALLBACK_USD_PER_THB = 0.031;

const validRate = (r: unknown): r is number => typeof r === 'number' && r > 0.005 && r < 0.2;

/**
 * Pick the exchange rate: this hour's cached rate, else the first live source
 * that answers sensibly, else the last rate we ever saw, else the fixed fallback.
 * Returns the rate and which tier supplied it (so live rates can be remembered).
 */
export async function resolveRate(opts: {
  cached: number | null;
  sources: Array<() => Promise<number>>;
  last: number | null;
}): Promise<{ rate: number; tier: 'cached' | 'live' | 'last' | 'fallback' }> {
  if (validRate(opts.cached)) return { rate: opts.cached, tier: 'cached' };
  for (const get of opts.sources) {
    try {
      const r = await get();
      if (validRate(r)) return { rate: r, tier: 'live' };
    } catch {
      /* try the next source */
    }
  }
  if (validRate(opts.last)) return { rate: opts.last, tier: 'last' };
  return { rate: FALLBACK_USD_PER_THB, tier: 'fallback' };
}
