#!/usr/bin/env node
/**
 * Stripe setup: GingerBros Brewing Equipment catalog.
 * Run: STRIPE_SECRET_KEY=sk_live_... node scripts/setup-brewing-equipment.js
 *
 * - Archives old variant-based duotight product
 * - Tags drink products with category: drinks
 * - Creates 9 individual brewing equipment products with images and prices
 */
import Stripe from 'stripe';

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) { console.error('STRIPE_SECRET_KEY required'); process.exit(1); }
const stripe = new Stripe(KEY, { apiVersion: '2025-05-28.basil' });

const PRODUCTS = [
  {
    appId: 'kl24235',
    name: 'Duotight Ball Lock Disconnect 6.35mm Liquid',
    description: 'Compact push-fit liquid disconnect for 6.35mm (1/4″) beer lines. Tool-free installation, hand-disassembly for cleaning. Engineered polyketone body rated to 150 psi.',
    shortDescription: 'Compact push-fit liquid disconnect. No clamps, no tools — snap in and pour.',
    priceThb: 159,
    sku: 'KL24235',
    images: [
      'https://thaibrewshop.co/wp-content/uploads/2023/06/KL24235-duotight-6mm-ball-lock-disconnect-01.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2023/06/KL24235-duotight-6mm-ball-lock-disconnect-02.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2023/06/KL24235-duotight-6mm-ball-lock-disconnect-03.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2023/06/KL24235-duotight-6mm-ball-lock-disconnect-04.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2023/06/KL24235-duotight-6mm-ball-lock-disconnect-05.jpg',
    ],
  },
  {
    appId: 'kl20763',
    name: 'Duotight Ball Lock Disconnect 9.5mm Liquid',
    description: 'High-flow liquid disconnect for 9.5mm (3/8″) beer lines. Duotight push-fit, tool-free disassembly, stainless internals. 150 psi rated.',
    shortDescription: 'High-flow liquid disconnect for 9.5mm lines. Reliable, fast, and easy to clean.',
    priceThb: 159,
    sku: 'KL20763',
    images: [
      'https://thaibrewshop.co/wp-content/uploads/2022/06/kl20763-duotight-ball-lock-disconnect-liquid-1.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/06/kl20763-duotight-ball-lock-disconnect-liquid-2.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/06/kl20763-duotight-ball-lock-disconnect-liquid-3.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/06/kl20763-duotight-ball-lock-disconnect-liquid-4.jpg',
    ],
  },
  {
    appId: 'kl24242',
    name: 'Duotight Ball Lock Disconnect 6.35mm Gas',
    description: 'Compact gas-side Duotight ball lock disconnect for 6.35mm (1/4″) CO₂ and mixed gas lines. Engineered polyketone body, stainless internals, 150 psi rated.',
    shortDescription: 'Compact gas disconnect for 6.35mm CO₂ lines. Leak-free push-fit, 150 psi rated.',
    priceThb: 159,
    sku: 'KL24242',
    images: [
      'https://thaibrewshop.co/wp-content/uploads/2025/08/KL24242-duotight-6mm-ball-lock-disconnect-gas.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2025/08/KL24242-duotight-6mm-ball-lock-disconnect-gas-2.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/01/duotight_8mm_x_ball_lock_disconnect-01_1.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/01/stackable_4-01.jpg',
    ],
  },
  {
    appId: 'kl20770',
    name: 'Duotight Ball Lock Disconnect 9.5mm Gas',
    description: 'Gas-side Duotight ball lock disconnect for 9.5mm (3/8″) CO₂ lines. Push-fit connection, tool-free disassembly, overmoulded poppet rated to 150 psi.',
    shortDescription: 'Precision gas disconnect for 9.5mm lines. 150 psi rated, chemical resistant.',
    priceThb: 159,
    sku: 'KL20770',
    images: [
      'https://thaibrewshop.co/wp-content/uploads/2022/06/kl20770-duotight-ball-lock-disconnect-gas-1.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/06/kl20770-duotight-ball-lock-disconnect-gas-2.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/06/kl20770-duotight-ball-lock-disconnect-gas-3.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/01/stackable_4-01.jpg',
    ],
  },
  {
    appId: 'kl20756',
    name: 'Duotight Ball Lock Disconnect 8mm Gas',
    description: 'Professional gas-side Duotight ball lock disconnect for 8mm (5/16″) gas lines. Engineered polyketone, stainless internals, 150 psi rated. Tool-free clean.',
    shortDescription: 'Professional 8mm gas disconnect. Zero-tool clean, 150 psi rated.',
    priceThb: 159,
    sku: 'KL20756',
    images: [
      'https://thaibrewshop.co/wp-content/uploads/2022/01/kl20756_-_gas_ball_lock_disconnect_-_profile-01.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/01/kl20756_-_gas_ball_lock_disconnect_-_angle-01.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/01/kl20756_-_gas_ball_lock_disconnect_-_angle-02.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/01/kl20756_-_gas_ball_lock_disconnect_-_angle-03.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/01/kl20756_-_gas_ball_lock_disconnect_-_breakdown-02.jpg',
    ],
  },
  {
    appId: 'kl21418',
    name: 'Duotight Flow Control Ball Lock Disconnect',
    description: 'Adjustable flow control integrated into a Duotight ball lock disconnect. Dial in pour resistance at the keg to eliminate foam. 8mm push-fit, 150 psi rated.',
    shortDescription: 'Dial in perfect pour pressure at the keg. Adjustable flow control in a push-fit disconnect.',
    priceThb: 219,
    sku: 'KL21418',
    images: [
      'https://thaibrewshop.co/wp-content/uploads/2022/07/KL21418-duotight-flow-control-quick-disconnect-01.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/07/KL21418-duotight-flow-control-quick-disconnect-02.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/07/KL21418-duotight-flow-control-quick-disconnect-03.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/07/KL21418-duotight-flow-control-quick-disconnect-05.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2022/07/KL21418-duotight-flow-control-quick-disconnect-07.jpg',
    ],
  },
  {
    appId: 'kl02899',
    name: '5 Gallon Ball Lock Corny Keg',
    description: 'KegLand 19L passivated stainless ball lock keg with LOW2 oxygen-barrier O-rings, robotic orbital welding, PRV lid, and rubber handles. Professional-grade for homebrewers.',
    shortDescription: 'Passivated 19L stainless keg with LOW2 oxygen barrier technology. Built to last.',
    priceThb: 3090,
    sku: 'KL02899',
    images: [
      'https://thaibrewshop.co/wp-content/uploads/2024/12/KegLandKeg19L-01.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2024/12/KegLandKeg19L-02.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2024/12/KegLandKeg19L-03.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2024/12/KegLandKeg19L-04.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2024/12/KegLandKeg19L-05.jpg',
    ],
  },
  {
    appId: 'corny-keg-2-5gal',
    name: '2.5 Gallon Cornelius Keg',
    description: 'Brand new 9.5L stainless steel Cornelius ball lock keg. 304 stainless, 130 psi rated, standard ball lock posts. Compact format for small batches and specialty beverages.',
    shortDescription: 'Compact 9.5L stainless Cornelius keg for small batch brewing and dispensing.',
    priceThb: 2890,
    sku: 'CORNY-2.5G',
    images: [
      'https://thaibrewshop.co/wp-content/uploads/2023/03/9.5L-Keg-600x603.jpg',
    ],
  },
  {
    appId: 'pet-keg-4l',
    name: '4L PET Keg with Tapping Head Kit',
    description: 'Oxebar Mono high-barrier 4L PET keg bundled with PCO38 tapping head assembly (ball lock posts, dip tube, PRV). Up to 65 psi, 6-month shelf life, under 1kg empty.',
    shortDescription: 'Lightweight 4L PET keg with tapping head. Portable pressure dispensing anywhere.',
    priceThb: 659,
    sku: 'KB16225-WS01',
    images: [
      'https://thaibrewshop.co/wp-content/uploads/2024/02/6-01.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2024/02/6-02.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2024/02/6-03.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2024/02/6-04.jpg',
      'https://thaibrewshop.co/wp-content/uploads/2024/02/6-05.jpg',
    ],
  },
];

const DRINK_APP_IDS = ['unpasteurized', 'pasteurized', 'pasteurized-6pack'];
const OLD_VARIANT_APP_ID = 'duotight-ball-lock-disconnect';

async function run() {
  console.log('\n=== GingerBros Brewing Equipment Catalog Setup ===\n');

  const { data: existingProducts } = await stripe.products.list({ active: true, limit: 100 });
  console.log(`Found ${existingProducts.length} active products.\n`);

  // ── 1. Hide Chilled Delivery ───────────────────────────────────────────────
  const chilled = existingProducts.find((p) => p.name === 'Chilled Delivery' || p.metadata?.app_id === 'chilled-delivery');
  if (chilled && chilled.metadata?.hidden !== 'true') {
    await stripe.products.update(chilled.id, { metadata: { ...chilled.metadata, hidden: 'true' } });
    console.log(`✓ Hid Chilled Delivery (${chilled.id})`);
  }

  // ── 2. Tag drink products ──────────────────────────────────────────────────
  for (const p of existingProducts) {
    if (!DRINK_APP_IDS.includes(p.metadata?.app_id ?? '')) continue;
    if (p.metadata?.category === 'drinks') { console.log(`  ✓ "${p.name}" already tagged as drinks`); continue; }
    await stripe.products.update(p.id, { metadata: { ...p.metadata, category: 'drinks' } });
    console.log(`✓ Tagged "${p.name}" → drinks`);
  }
  console.log();

  // ── 3. Archive old variant duotight product ────────────────────────────────
  const oldVariant = existingProducts.find((p) => p.metadata?.app_id === OLD_VARIANT_APP_ID);
  if (oldVariant) {
    await stripe.products.update(oldVariant.id, { active: false });
    console.log(`✓ Archived old variant product "${oldVariant.name}" (${oldVariant.id})\n`);
  }

  // ── 4. Create new individual products ─────────────────────────────────────
  // Reload products after archiving
  const { data: currentProducts } = await stripe.products.list({ active: true, limit: 100 });

  for (const def of PRODUCTS) {
    const existing = currentProducts.find((p) => p.metadata?.app_id === def.appId);

    if (existing) {
      console.log(`  ✓ "${def.name}" already exists (${existing.id}) — skipping`);
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
        brand: 'KegLand',
        sku: def.sku,
        short_description: def.shortDescription,
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: def.priceThb * 100,
      currency: 'thb',
      metadata: { app_id: def.appId },
    });

    console.log(` ✓\n  Product: ${product.id}\n  Price:   ${price.id} (฿${def.priceThb})\n`);
  }

  console.log('=== DONE ===\n');
}

run().catch((err) => { console.error('\n✗ Failed:', err.message); process.exit(1); });
