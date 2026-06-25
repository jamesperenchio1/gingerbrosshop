#!/usr/bin/env node
import Stripe from 'stripe';

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) { console.error('STRIPE_SECRET_KEY required'); process.exit(1); }
const stripe = new Stripe(KEY, { apiVersion: '2025-05-28.basil' });

const CDN = 'https://res.cloudinary.com/dcplqqgwi/image/upload';
const STACKABLE = `${CDN}/v1782380459/gingerbros/shared/stackable_4-01.jpg`;

const IMAGES = {
  kl24235: [
    `${CDN}/v1782380392/gingerbros/kl24235/01.jpg`,
    `${CDN}/v1782380398/gingerbros/kl24235/02.jpg`,
    `${CDN}/v1782380405/gingerbros/kl24235/03.jpg`,
    `${CDN}/v1782380411/gingerbros/kl24235/04.jpg`,
    `${CDN}/v1782380415/gingerbros/kl24235/05.jpg`,
  ],
  kl20763: [
    `${CDN}/v1782380418/gingerbros/kl20763/01.jpg`,
    `${CDN}/v1782380424/gingerbros/kl20763/02.jpg`,
    `${CDN}/v1782380429/gingerbros/kl20763/03.jpg`,
    `${CDN}/v1782380437/gingerbros/kl20763/04.jpg`,
  ],
  kl24242: [
    `${CDN}/v1782380596/gingerbros/kl24242/01.jpg`,
    `${CDN}/v1782380603/gingerbros/kl24242/02.jpg`,
    `${CDN}/v1782380606/gingerbros/kl24242/03.jpg`,
    STACKABLE,
  ],
  kl20770: [
    `${CDN}/v1782380445/gingerbros/kl20770/01.jpg`,
    `${CDN}/v1782380451/gingerbros/kl20770/02.jpg`,
    `${CDN}/v1782380455/gingerbros/kl20770/03.jpg`,
    STACKABLE,
  ],
  kl20756: [
    `${CDN}/v1782380462/gingerbros/kl20756/01.jpg`,
    `${CDN}/v1782380467/gingerbros/kl20756/02.jpg`,
    `${CDN}/v1782380473/gingerbros/kl20756/03.jpg`,
    `${CDN}/v1782380479/gingerbros/kl20756/04.jpg`,
    `${CDN}/v1782380483/gingerbros/kl20756/05.jpg`,
  ],
  kl21418: [
    `${CDN}/v1782380487/gingerbros/kl21418/01.jpg`,
    `${CDN}/v1782380496/gingerbros/kl21418/02.jpg`,
    `${CDN}/v1782380500/gingerbros/kl21418/03.jpg`,
    `${CDN}/v1782380503/gingerbros/kl21418/05.jpg`,
    `${CDN}/v1782380508/gingerbros/kl21418/07.jpg`,
  ],
  kl02899: [
    `${CDN}/v1782380514/gingerbros/kl02899/01.jpg`,
    `${CDN}/v1782380520/gingerbros/kl02899/02.jpg`,
    `${CDN}/v1782380523/gingerbros/kl02899/03.jpg`,
    `${CDN}/v1782380527/gingerbros/kl02899/04.jpg`,
    `${CDN}/v1782380531/gingerbros/kl02899/05.jpg`,
  ],
  'corny-keg-2-5gal': [
    `${CDN}/v1782380537/gingerbros/corny-keg-2-5gal/01.jpg`,
  ],
  'pet-keg-4l': [
    `${CDN}/v1782380543/gingerbros/pet-keg-4l/01.jpg`,
    `${CDN}/v1782380548/gingerbros/pet-keg-4l/02.jpg`,
    `${CDN}/v1782380554/gingerbros/pet-keg-4l/03.jpg`,
    `${CDN}/v1782380560/gingerbros/pet-keg-4l/04.jpg`,
    `${CDN}/v1782380568/gingerbros/pet-keg-4l/05.jpg`,
  ],
};

async function run() {
  console.log('\n=== Updating Stripe product images → Cloudinary ===\n');

  const { data: products } = await stripe.products.list({ active: true, limit: 100 });

  for (const [appId, images] of Object.entries(IMAGES)) {
    const product = products.find((p) => p.metadata?.app_id === appId);
    if (!product) {
      console.warn(`  ⚠ No active product found with app_id="${appId}" — skipping`);
      continue;
    }
    await stripe.products.update(product.id, { images });
    console.log(`✓ ${appId} (${product.id}) → ${images.length} images`);
  }

  console.log('\n=== DONE ===\n');
}

run().catch((err) => { console.error('\n✗ Failed:', err.message); process.exit(1); });
