/**
 * Editorial content that doesn't belong in (or fit within) Stripe — long-form
 * copy, nutrition tables, specs, feature lists, and product video.
 *
 * Commerce data (name, price, images, description, purchasability) comes live
 * from Stripe via /api/products. This map is *optional* enrichment keyed by the
 * Stripe product's `metadata.app_id`. A brand-new product added in Stripe will
 * render and check out fine without an entry here — it simply won't show the
 * extra nutrition/specs/video tabs until one is added.
 */

export interface ProductContent {
  headline?: string;
  longDescription?: string;
  video?: string;
  ingredients?: string[];
  specs?: { label: string; value: string }[];
  nutrition?: { label: string; value: string }[];
  features?: string[];
}

export const PRODUCT_CONTENT: Record<string, ProductContent> = {
  unpasteurized: {
    headline: 'Raw, living ginger fizz with active cultures. Maximum probiotics, maximum flavor.',
    longDescription:
      'Our unpasteurized ginger fizz is ginger fizz in its purest form. After 7 days of natural fermentation, we strain and bottle immediately — no heat treatment, no filtering, no intervention. This means every bottle contains billions of live, active probiotic cultures that continue to develop the flavor over time. The taste is bold, complex, and naturally effervescent. Because it is a living product, it must be kept refrigerated and consumed within 30 days of bottling. The natural sediment you may see is normal — it is the live cultures and ginger particles that make this brew so special.',
    video: '/images/product-unpasteurized.mp4',
    ingredients: ['Fresh Ginger', 'Filtered Water', 'Raw Cane Sugar', 'Live Cultures (Ginger Bug)'],
    specs: [
      { label: 'Volume', value: '330ml per bottle' },
      { label: 'Shelf Life', value: '30 days (refrigerated)' },
      { label: 'Storage', value: 'Keep refrigerated at 2-6°C at all times' },
      { label: 'Serving Temp', value: 'Ice cold (2-4°C)' },
      { label: 'Fermentation', value: '7 days natural ferment' },
      { label: 'Pasteurized', value: 'No — raw and living' },
      { label: 'Origin', value: 'Brewed and bottled in Thailand' },
      { label: 'Dietary', value: 'Vegan, Gluten-Free, Raw, No Artificial Additives' },
    ],
    nutrition: [
      { label: 'Serving Size', value: '330ml' },
      { label: 'Energy', value: '98 kcal' },
      { label: 'Total Carbohydrates', value: '23g' },
      { label: '— Sugars', value: '19g' },
      { label: 'Sodium', value: '5mg' },
      { label: 'Vitamin B6', value: '0.4mg (24% DV)' },
      { label: 'Vitamin B12', value: '0.6mcg (25% DV)' },
      { label: 'Active Probiotic CFU', value: '1+ billion per bottle' },
    ],
    features: [
      'Raw and unpasteurized — maximum probiotic content',
      'Living cultures continue to develop flavor in the bottle',
      'Bold, complex, naturally effervescent flavour',
      'Billions of active CFUs per serving',
      'Natural sediment is normal and healthy',
      'Best consumed within 30 days for peak freshness',
    ],
  },
};

export function getProductContent(appId: string | undefined): ProductContent {
  return (appId && PRODUCT_CONTENT[appId]) || {};
}
