#!/usr/bin/env node
/**
 * One-time script: update Ginger Fizz product image + create 6-pack listing.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/update-ginger-fizz-and-6pack.js
 *
 * The images must already be live at gingerbrosshop.com (deploy first):
 *   https://gingerbrosshop.com/images/ginger-fizz-new.png  (single-bottle hero)
 *   https://gingerbrosshop.com/images/ginger-fizz-6pack.png  (6-pack)
 */

import Stripe from 'stripe';

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) { console.error('❌  STRIPE_SECRET_KEY required'); process.exit(1); }

const stripe = new Stripe(KEY);

const SITE = 'https://gingerbrosshop.com';
const SINGLE_IMAGE  = `${SITE}/images/ginger-fizz-new.png`;
const SIXPACK_IMAGE = `${SITE}/images/ginger-fizz-6pack.png`;

const SIXPACK_APP_ID = 'ginger-fizz-6pack';

async function run() {
  console.log('\n=== GingerBros: Ginger Fizz image + 6-pack setup ===\n');
  const { data: existing } = await stripe.products.list({ active: true, limit: 100 });

  // ── 1. Update the single-bottle Ginger Fizz image ───────────────────────
  const gingerFizz = existing.find(
    (p) => p.metadata?.app_id === 'ginger-fizz' || p.name?.toLowerCase().includes('ginger fizz'),
  );

  if (gingerFizz) {
    console.log(`Found Ginger Fizz: ${gingerFizz.id} — "${gingerFizz.name}"`);
    const existing = gingerFizz.images.filter(u => !u.includes('ginger-fizz-new'));
    const updated = await stripe.products.update(gingerFizz.id, {
      images: [...existing, SINGLE_IMAGE].slice(0, 8),
    });
    console.log(`✓  Updated images → primary: ${updated.images[0]}, fizz-happens: ${updated.images[updated.images.length - 1]}`);
  } else {
    console.log('⚠️  Ginger Fizz product not found by app_id or name — skipping image update');
  }

  // ── 2. Create 6-pack if it doesn't already exist ────────────────────────
  console.log('');
  const sixpack = existing.find((p) => p.metadata?.app_id === SIXPACK_APP_ID);
  if (sixpack) {
    console.log(`✓  6-pack already exists (${sixpack.id}) — skipping`);
    return;
  }

  console.log('Creating Ginger Fizz 6-pack…');
  const product = await stripe.products.create({
    name: 'Ginger Fizz 6-Pack',
    description:
      'Six bottles of our naturally fermented craft ginger fizz — perfect for sharing or stocking up. Same signature recipe: real ginger, live cultures, zero artificial anything.',
    images: [SIXPACK_IMAGE, SINGLE_IMAGE],
    metadata: {
      app_id: SIXPACK_APP_ID,
      category: 'ginger-fizz',
      short_description: 'Six-bottle bundle — stock up and save.',
      stock_status: 'in_stock',
    },
  });
  console.log(`  Created product ${product.id}`);

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 49900, // ฿499 in satang
    currency: 'thb',
    nickname: 'Ginger Fizz 6-Pack',
  });
  console.log(`  Created price ${price.id} → ฿499`);
  console.log('\n✅ Done! The 6-pack will appear on the site automatically.\n');
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
