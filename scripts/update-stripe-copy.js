import Stripe from 'stripe';

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error('STRIPE_SECRET_KEY not set');
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: '2025-06-30.basil' });

async function run() {
  const { data: products } = await stripe.products.list({ active: true, limit: 100 });

  // 1. Update the Ginger Fizz drink product metadata
  const drink = products.find((p) => p.metadata?.app_id === 'ginger-fizz');
  if (drink) {
    const shortDescription = '7-day naturally fermented craft ginger fizz with fresh Thai ginger, real lime, and prebiotic acacia fibre.';
    await stripe.products.update(drink.id, {
      description: shortDescription,
      metadata: {
        ...drink.metadata,
        badge: 'Naturally Fermented',
        badge_color: 'bg-accent-green',
        short_description: shortDescription,
      },
    });
    console.log(`✓ Updated Ginger Fizz product (${drink.id})`);
  } else {
    console.log('✗ Ginger Fizz product not found');
  }

  // 2. Rename the internal subscription delivery product so it no longer says "Chilled"
  const delivery = products.find((p) => p.name === 'Chilled Delivery' || p.metadata?.app_id === 'chilled-delivery');
  if (delivery) {
    await stripe.products.update(delivery.id, {
      name: 'Delivery',
      description: 'Flat delivery fee for subscription orders.',
      metadata: {
        ...delivery.metadata,
        app_id: 'delivery',
      },
    });
    console.log(`✓ Renamed Chilled Delivery → Delivery (${delivery.id})`);
  } else {
    console.log('✗ Chilled Delivery product not found');
  }
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
