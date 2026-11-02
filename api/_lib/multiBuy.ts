/**
 * Multi-buy deal pricing, shared by the cart (via src/lib/multiBuy.ts) and the
 * checkout handler so the price a shopper sees is the price Stripe charges.
 *
 * Prices are whole baht. Every bottle-carrying Stripe product declares how many
 * bottles it holds in metadata (`bottles_fizz`, `bottles_tea`) — singles are
 * 1/0 or 0/1, bundles are e.g. 6/0 or 1/1. The cart is charged the cheapest
 * combination of the deals below for its total bottle count, so loose bottles
 * and bundle listings price identically and never double-discount.
 */

export interface Deal {
  fizz: number;
  tea: number;
  price: number;
}

// From the print-shop price list. Keep in sync with the bundle listings in Stripe.
export const DEALS: Deal[] = [
  { fizz: 1, tea: 0, price: 140 },
  { fizz: 0, tea: 1, price: 119 },
  { fizz: 2, tea: 0, price: 260 },
  { fizz: 3, tea: 0, price: 390 },
  { fizz: 6, tea: 0, price: 780 },
  { fizz: 0, tea: 2, price: 220 },
  { fizz: 0, tea: 3, price: 315 },
  { fizz: 0, tea: 6, price: 600 },
  { fizz: 1, tea: 1, price: 240 },
  { fizz: 2, tea: 2, price: 460 },
];

export const FIZZ_SINGLE = 140;
export const TEA_SINGLE = 119;
const SIX_FIZZ = 780;
const SIX_TEA = 600;

/** Cheapest total (baht) for this many bottles using any mix of DEALS. */
export function bestPrice(fizz: number, tea: number): number {
  let f = Math.max(0, Math.floor(fizz));
  let t = Math.max(0, Math.floor(tea));
  // Large counts: peel off 6-packs first (the cheapest per-bottle rate, and no
  // mixed deal beats them), so the table below never grows with the input.
  let base = 0;
  while (f >= 18) { f -= 6; base += SIX_FIZZ; }
  while (t >= 18) { t -= 6; base += SIX_TEA; }
  // cost[i][j] = cheapest price for i fizz and j tea (at most 17 × 17).
  const cost: number[][] = Array.from({ length: f + 1 }, () => new Array(t + 1).fill(Infinity));
  cost[0][0] = 0;
  for (let i = 0; i <= f; i++) {
    for (let j = 0; j <= t; j++) {
      if (i === 0 && j === 0) continue;
      for (const d of DEALS) {
        if (d.fizz <= i && d.tea <= j) {
          const c = cost[i - d.fizz][j - d.tea] + d.price;
          if (c < cost[i][j]) cost[i][j] = c;
        }
      }
    }
  }
  return base + cost[f][t];
}

export interface BottleLine {
  /** Unit price in baht, as listed. */
  price: number;
  quantity: number;
  bottlesFizz?: number;
  bottlesTea?: number;
}

/** Parse a metadata value like "6" into a bottle count (0 when absent). */
export function bottlesFromMetadata(value: string | null | undefined): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Baht off the listed total for the bottle-carrying lines. Lines without
 * bottles (equipment, subscriptions) are ignored. Never negative.
 */
export function multiBuyDiscount(lines: BottleLine[]): number {
  let fizz = 0;
  let tea = 0;
  let listed = 0;
  for (const line of lines) {
    const bf = line.bottlesFizz ?? 0;
    const bt = line.bottlesTea ?? 0;
    if (bf + bt === 0) continue;
    fizz += bf * line.quantity;
    tea += bt * line.quantity;
    listed += line.price * line.quantity;
  }
  if (fizz + tea === 0) return 0;
  return Math.max(0, listed - bestPrice(fizz, tea));
}

/**
 * A short "add one more" hint for the cart: which bottle to add and how much
 * the deal takes off it. Null when no single extra bottle unlocks a deal.
 */
export function nextDealHint(fizz: number, tea: number): { kind: 'fizz' | 'tea'; saving: number } | null {
  if (fizz + tea === 0) return null;
  const now = bestPrice(fizz, tea);
  const options = [
    { kind: 'fizz' as const, saving: now + FIZZ_SINGLE - bestPrice(fizz + 1, tea) },
    { kind: 'tea' as const, saving: now + TEA_SINGLE - bestPrice(fizz, tea + 1) },
  ];
  const best = options.filter((o) => o.saving > 0).sort((a, b) => b.saving - a.saving)[0];
  return best ?? null;
}
