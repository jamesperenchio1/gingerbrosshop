#!/usr/bin/env node
/**
 * Ginger Tea + print-shop multi-buy deals.
 *
 * - Creates Ginger Tea (Thai Spice, ฿119) and the bundle listings from the
 *   print-shop price list (2/3 Fizz, 2/3/6 Tea, 1+1 and 2+2 Fizz & Tea).
 * - Moves the Fizz 6-pack's one-time price to ฿780 (archives the old one).
 * - Tags every drink with bottles_fizz / bottles_tea so cart + checkout can
 *   apply multi-buy deals (api/_lib/multiBuy.ts), and strips the old
 *   fermentation wording from the Fizz listings.
 *
 * Idempotent: products are matched by metadata.app_id and skipped if present.
 * Dry run by default; pass --apply to write.
 *
 * The images must already be live at gingerbrosshop.com (deploy first).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/setup-tea-and-deals.js           # dry run
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/setup-tea-and-deals.js --apply
 */

import Stripe from 'stripe';

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) { console.error('STRIPE_SECRET_KEY required'); process.exit(1); }
const APPLY = process.argv.includes('--apply');
const stripe = new Stripe(KEY);

const IMG = 'https://gingerbrosshop.com/images';

const FIZZ_COPY = {
  description: 'Sparkling ginger fizz made with fresh Thai ginger and real lime. Bold, bright and best served ice cold.',
  short_description: 'Sparkling ginger fizz with fresh Thai ginger and real lime.',
  badge: 'Signature',
};

const NEW_PRODUCTS = [
  {
    appId: 'ginger-tea',
    name: 'Ginger Tea · Thai Spice',
    description: 'Real ginger, slowly simmered with lemongrass, lime and spices. No artificial colours or flavours. ชาขิงกลมกล่อม สูตร Thai Spice.',
    short: 'Real ginger slowly simmered with lemongrass, lime and spices.',
    badge: 'New', badgeColor: 'bg-amber',
    images: [`${IMG}/ginger-tea.png`],
    fizz: 0, tea: 1, thb: 119,
  },
  { appId: 'ginger-fizz-2pack', name: 'Ginger Fizz 2-Pack', short: 'Two bottles of Ginger Fizz.', badge: 'Deal', fizz: 2, tea: 0, thb: 260 },
  { appId: 'ginger-fizz-3pack', name: 'Ginger Fizz 3-Pack', short: 'Three bottles of Ginger Fizz.', badge: 'Deal', fizz: 3, tea: 0, thb: 390 },
  { appId: 'ginger-tea-2pack', name: 'Ginger Tea 2-Pack', short: 'Two bottles of Ginger Tea, Thai Spice.', badge: 'Deal', fizz: 0, tea: 2, thb: 220 },
  { appId: 'ginger-tea-3pack', name: 'Ginger Tea 3-Pack', short: 'Three bottles of Ginger Tea, Thai Spice.', badge: 'Deal', fizz: 0, tea: 3, thb: 315 },
  { appId: 'ginger-tea-6pack', name: 'Ginger Tea 6-Pack', short: 'Six bottles of Ginger Tea, Thai Spice.', badge: 'Best value', fizz: 0, tea: 6, thb: 600 },
  { appId: 'fizz-tea-duo', name: 'Fizz & Tea Duo', short: 'One Ginger Fizz and one Ginger Tea. Try both.', badge: 'Try both', fizz: 1, tea: 1, thb: 240 },
  { appId: 'fizz-tea-4pack', name: 'Fizz & Tea 4-Pack', short: 'Two Ginger Fizz and two Ginger Tea.', badge: 'Deal', fizz: 2, tea: 2, thb: 460 },
];

const step = async (label, fn) => {
  console.log(`${APPLY ? '→' : '[dry run]'} ${label}`);
  if (APPLY) return fn();
  return null;
};

async function run() {
  console.log(`\n=== GingerBros: Ginger Tea + multi-buy deals ${APPLY ? '' : '(dry run — pass --apply to write)'} ===\n`);
  const existing = await stripe.products.list({ active: true, limit: 100 }).autoPagingToArray({ limit: 1000 });
  const byAppId = (id) => existing.find((p) => p.metadata?.app_id === id);

  // ── Existing Fizz listings: bottle counts + copy without fermentation ──
  const fizz = byAppId('ginger-fizz');
  if (fizz) {
    await step(`update ginger-fizz (${fizz.id}): bottles_fizz=1, new copy`, () =>
      stripe.products.update(fizz.id, {
        description: FIZZ_COPY.description,
        metadata: { bottles_fizz: '1', bottles_tea: '0', short_description: FIZZ_COPY.short_description, badge: FIZZ_COPY.badge },
      }));
  } else {
    console.log('⚠️  ginger-fizz not found — skipping');
  }

  const sixpack = byAppId('ginger-fizz-6pack');
  if (sixpack) {
    await step(`update ginger-fizz-6pack (${sixpack.id}): bottles_fizz=6, new copy`, () =>
      stripe.products.update(sixpack.id, {
        description: 'Six bottles of Ginger Fizz: fresh Thai ginger, real lime, sparkling and bright. Stock up and save.',
        metadata: { bottles_fizz: '6', bottles_tea: '0', short_description: 'Six bottles of Ginger Fizz. Stock up and save.' },
      }));
    const prices = await stripe.prices.list({ product: sixpack.id, active: true, limit: 100 });
    const oneTime = prices.data.filter((p) => !p.recurring);
    let newPrice = oneTime.find((p) => p.unit_amount === 78000);
    if (newPrice) {
      console.log('  ✓ 6-pack already has a ฿780 one-time price');
    } else {
      newPrice = await step('create 6-pack one-time price ฿780', () =>
        stripe.prices.create({ product: sixpack.id, unit_amount: 78000, currency: 'thb', nickname: 'Ginger Fizz 6-Pack' }));
    }
    // The old price can't be archived while it is the product's default.
    if (newPrice && sixpack.default_price !== newPrice.id) {
      await step(`set 6-pack default price → ${newPrice.id}`, () =>
        stripe.products.update(sixpack.id, { default_price: newPrice.id }));
    }
    for (const old of oneTime.filter((p) => p.unit_amount !== 78000)) {
      await step(`archive old 6-pack price ${old.id} (฿${(old.unit_amount ?? 0) / 100})`, () =>
        stripe.prices.update(old.id, { active: false }));
    }
  } else {
    console.log('⚠️  ginger-fizz-6pack not found — skipping');
  }

  // ── New listings ──
  for (const def of NEW_PRODUCTS) {
    const found = byAppId(def.appId);
    if (found) {
      console.log(`  ✓ ${def.appId} already exists (${found.id}) — skipping`);
      continue;
    }
    const product = await step(`create ${def.appId} "${def.name}" at ฿${def.thb}`, () =>
      stripe.products.create({
        name: def.name,
        description: def.description ?? def.short,
        images: def.images ?? [`${IMG}/${def.appId}.png`],
        metadata: {
          app_id: def.appId,
          category: 'drinks',
          short_description: def.short,
          badge: def.badge,
          badge_color: def.badgeColor ?? 'bg-amber',
          stock_status: 'in_stock',
          bottles_fizz: String(def.fizz),
          bottles_tea: String(def.tea),
        },
      }));
    if (product) {
      await stripe.prices.create({ product: product.id, unit_amount: def.thb * 100, currency: 'thb', nickname: def.name });
    }
  }

  console.log(`\n${APPLY ? '✅ Done. Redeploy (or let the Stripe webhook rebuild) to refresh prerendered pages.' : 'Dry run complete — nothing was written.'}\n`);
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
