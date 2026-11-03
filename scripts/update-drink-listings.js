#!/usr/bin/env node
/**
 * Brings the drink listings in Stripe in line with the rebrand:
 * - images → the full-resolution 1600px JPEGs from scripts/build-images.mjs
 *   (public/images/gen/<app_id>.jpg; deploy them before running --apply)
 * - description / short_description / badge rewritten without fermentation
 *   or health claims.
 *
 * Products only: no prices change and nothing is charged. Dry run by default.
 *
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/update-drink-listings.js
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/update-drink-listings.js --apply
 */
import Stripe from 'stripe';

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) { console.error('STRIPE_SECRET_KEY required'); process.exit(1); }
const APPLY = process.argv.includes('--apply');
const stripe = new Stripe(KEY);
const IMG = 'https://gingerbrosshop.com/images/gen';

const COPY = {
  'ginger-fizz': {
    description: 'Sparkling Ginger Fizz made in Thailand with fresh Thai ginger and real lime. Bright, low in sugar and properly gingery. Best ice cold.',
    short: 'Sparkling. Bright. A proper kick. Fresh Thai ginger, real lime, low sugar.',
    badge: 'Signature',
  },
  'ginger-tea': {
    description: 'Ginger Tea · Thai Spice: real ginger slowly simmered with lemongrass, lime and spices. Still, smooth and warming, with no artificial colours or flavours. Great iced or warm.',
    short: 'Slow-simmered. Warm spice. Smooth. Real ginger with lemongrass, lime and spices.',
    badge: 'New',
  },
  'ginger-fizz-2pack': { description: 'Two bottles of Ginger Fizz: fresh Thai ginger, real lime, low sugar, proper sparkle.', short: 'Two bottles of Ginger Fizz for ฿260.', badge: 'Deal' },
  'ginger-fizz-3pack': { description: 'Three bottles of Ginger Fizz: fresh Thai ginger, real lime, low sugar, proper sparkle.', short: 'Three bottles of Ginger Fizz for ฿390.', badge: 'Deal' },
  'ginger-fizz-6pack': { description: 'Six bottles of Ginger Fizz: fresh Thai ginger, real lime, low sugar, proper sparkle. Our best value per bottle.', short: 'Six bottles of Ginger Fizz. Stock the fridge, share the kick.', badge: 'Best value' },
  'ginger-tea-2pack': { description: 'Two bottles of Ginger Tea · Thai Spice: real ginger slowly simmered with lemongrass, lime and spices.', short: 'Two bottles of Ginger Tea for ฿220.', badge: 'Deal' },
  'ginger-tea-3pack': { description: 'Three bottles of Ginger Tea · Thai Spice: real ginger slowly simmered with lemongrass, lime and spices.', short: 'Three bottles of Ginger Tea for ฿315.', badge: 'Deal' },
  'ginger-tea-6pack': { description: 'Six bottles of Ginger Tea · Thai Spice at our best price per bottle. Great iced or warm.', short: 'Six bottles of Ginger Tea. Our best value.', badge: 'Best value' },
  'fizz-tea-duo': { description: 'One sparkling Ginger Fizz and one slow-simmered Ginger Tea · Thai Spice. Try both side by side.', short: "Can't pick? One of each for ฿240.", badge: 'Try both' },
  'fizz-tea-4pack': { description: 'Two Ginger Fizz and two Ginger Tea · Thai Spice. Built for sharing.', short: 'Two of each for ฿460.', badge: 'Deal' },
};

async function run() {
  console.log(`\n=== Drink listings ${APPLY ? '' : '(dry run, pass --apply to write)'} ===\n`);
  const all = await stripe.products.list({ active: true, limit: 100 }).autoPagingToArray({ limit: 1000 });
  for (const [appId, copy] of Object.entries(COPY)) {
    const product = all.find((p) => p.metadata?.app_id === appId);
    if (!product) { console.log(`⚠️  ${appId} not found, skipping`); continue; }
    const image = `${IMG}/${appId}.jpg`;
    if (APPLY) {
      const head = await fetch(image, { method: 'HEAD' });
      if (!head.ok || !head.headers.get('content-type')?.startsWith('image/')) {
        console.log(`⚠️  ${image} isn't live yet (deploy first), skipping ${appId}`);
        continue;
      }
    }
    console.log(`${APPLY ? '→' : '[dry run]'} ${appId} (${product.id}): image ${image}, badge "${copy.badge}"`);
    if (APPLY) {
      await stripe.products.update(product.id, {
        images: [image],
        description: copy.description,
        metadata: { short_description: copy.short, badge: copy.badge },
      });
    }
  }
  console.log(`\n${APPLY ? '✅ Done. The catalog cache refreshes within ~5 minutes; redeploy to refresh prerendered pages.' : 'Dry run complete, nothing written.'}\n`);
}

run().catch((err) => { console.error('Error:', err.message); process.exit(1); });
