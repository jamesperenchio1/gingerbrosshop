#!/usr/bin/env node
import Stripe from 'stripe';

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) { console.error('STRIPE_SECRET_KEY required'); process.exit(1); }
const stripe = new Stripe(KEY, { apiVersion: '2025-05-28.basil' });

const CDN = 'https://res.cloudinary.com/dcplqqgwi/image/upload';

const PRODUCTS = [
  {
    appId: 'star-san',
    name: 'Five Star Star San No-Rinse Sanitizer',
    description: 'Acid-based no-rinse sanitizer for homebrewing. A blend of phosphoric acid and dodecylbenzenesulfonic acid that creates an acidic surface coating preventing microbial growth. Apply after cleaning — no rinsing required. NSF certified, ANSI accredited.',
    shortDescription: 'No-rinse acid sanitizer — clean equipment in minutes, pour without rinsing.',
    brand: 'Five Star',
    sku: 'STAR-SAN',
    images: [
      `${CDN}/v1782382140/gingerbros/star-san/01.jpg`,
      `${CDN}/v1782382144/gingerbros/star-san/02.jpg`,
      `${CDN}/v1782382150/gingerbros/star-san/03.jpg`,
    ],
    prices: [
      { nickname: 'Star San · 2oz', thb: 190 },
      { nickname: 'Star San · 8oz', thb: 350 },
      { nickname: 'Star San · 1 Gallon', thb: 6200 },
    ],
  },
  {
    appId: 'nukatap-fc',
    name: 'NukaTap FC — Flow Control Tap Gen 2',
    description: 'Generation 2 forward-sealing stainless steel beer tap with adjustable flow control. NukaShuttle seamless single-piece design eliminates bacterial fissures. Reduces first-pour foam through lower thermal mass and laminar flow. Chemical-resistant TPV rubber for sour beers and kombucha. Optional auto-close spring compatible.',
    shortDescription: 'Forward-sealing SS tap with adjustable flow control. Less foam, more precision.',
    brand: 'KegLand',
    sku: 'KL15523',
    images: [
      `${CDN}/v1782382182/gingerbros/nukatap-fc/05.jpg`,
      `${CDN}/v1782382189/gingerbros/nukatap-fc/06.jpg`,
      `${CDN}/v1782382194/gingerbros/nukatap-fc/07.jpg`,
      `${CDN}/v1782382198/gingerbros/nukatap-fc/08.jpg`,
      `${CDN}/v1782382157/gingerbros/nukatap-fc/01.jpg`,
      `${CDN}/v1782382163/gingerbros/nukatap-fc/02.jpg`,
      `${CDN}/v1782382170/gingerbros/nukatap-fc/03.jpg`,
      `${CDN}/v1782382177/gingerbros/nukatap-fc/04.jpg`,
    ],
    prices: [
      { nickname: null, thb: 1200 },
    ],
  },
];

async function run() {
  console.log('\n=== GingerBros New Products Setup ===\n');
  const { data: existing } = await stripe.products.list({ active: true, limit: 100 });

  for (const def of PRODUCTS) {
    const found = existing.find((p) => p.metadata?.app_id === def.appId);
    if (found) {
      console.log(`  ✓ "${def.name}" already exists (${found.id}) — skipping`);
      continue;
    }

    process.stdout.write(`Creating "${def.name}"...`);
    const product = await stripe.products.create({
      name: def.name,
      description: def.description,
      images: def.images.slice(0, 8),
      metadata: {
        app_id: def.appId,
        category: 'brewing-equipment',
        brand: def.brand,
        sku: def.sku,
        short_description: def.shortDescription,
      },
    });

    for (const p of def.prices) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: p.thb * 100,
        currency: 'thb',
        ...(p.nickname ? { nickname: p.nickname } : {}),
        metadata: { app_id: def.appId },
      });
      console.log(`\n  Price: ${price.id} — ${p.nickname ?? 'default'} (฿${p.thb})`);
    }

    console.log(`✓ ${def.appId} → ${product.id}\n`);
  }

  console.log('=== DONE ===\n');
}

run().catch((err) => { console.error('\n✗ Failed:', err.message); process.exit(1); });
