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
    ingredients: ['Fresh Ginger', 'Filtered Water', 'Erythritol', 'Raw Cane Sugar (ferment starter)', 'Live Cultures (Ginger Bug)'],
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
      { label: 'Energy', value: '30 kcal' },
      { label: 'Total Carbohydrates', value: '8g' },
      { label: '— Sugars', value: '4g' },
      { label: 'Sweetened with', value: 'Erythritol' },
      { label: 'Sodium', value: '5mg' },
      { label: 'Vitamin B6', value: '0.4mg (24% DV)' },
      { label: 'Vitamin B12', value: '0.6mcg (25% DV)' },
      { label: 'Active Probiotic CFU', value: '1+ billion per bottle' },
    ],
    features: [
      'Low sugar — sweetened with erythritol, not loaded with cane sugar',
      'Raw and unpasteurized — maximum probiotic content',
      'Living cultures continue to develop flavor in the bottle',
      'Bold, complex, naturally effervescent flavour',
      'Billions of active CFUs per serving',
      'Best consumed within 30 days for peak freshness',
    ],
  },
  pasteurized: {
    headline: 'The same bold ginger kick, gently heat-stabilized so it travels anywhere and keeps in the pantry.',
    longDescription:
      'Ginger Pop is our pasteurized take on the brew. We ferment it the same slow, natural way, then gently heat-treat each bottle to lock in the flavour and make it shelf-stable. The result is a crisp, lively ginger soda you can stock at room temperature, take on the road, and ship anywhere in the country — no cold chain required. It is the easy, everyday way to enjoy real fermented ginger, with the bright bite you expect from GingerBros.',
    ingredients: ['Fresh Ginger', 'Filtered Water', 'Erythritol', 'Raw Cane Sugar (ferment starter)', 'Live Cultures (Ginger Bug)'],
    specs: [
      { label: 'Volume', value: '330ml per bottle' },
      { label: 'Shelf Life', value: '6 months (unopened, room temperature)' },
      { label: 'Storage', value: 'Store in a cool, dry place. Refrigerate after opening.' },
      { label: 'Serving Temp', value: 'Best served chilled' },
      { label: 'Fermentation', value: '7 days natural ferment, then pasteurized' },
      { label: 'Pasteurized', value: 'Yes — shelf-stable' },
      { label: 'Origin', value: 'Brewed and bottled in Thailand' },
      { label: 'Dietary', value: 'Vegan, Gluten-Free, No Artificial Additives' },
    ],
    nutrition: [
      { label: 'Serving Size', value: '330ml' },
      { label: 'Energy', value: '25 kcal' },
      { label: 'Total Carbohydrates', value: '7g' },
      { label: '— Sugars', value: '3g' },
      { label: 'Sweetened with', value: 'Erythritol' },
      { label: 'Sodium', value: '5mg' },
      { label: 'Vitamin B6', value: '0.3mg (18% DV)' },
    ],
    features: [
      'Low sugar — sweetened with erythritol, not loaded with cane sugar',
      'Pasteurized and shelf-stable — no refrigeration needed',
      'Ships nationwide without a cold chain',
      'Crisp, bright, refreshing ginger flavour',
      'Perfect for the pantry, the office, or the road',
      'Same slow 7-day natural ferment',
    ],
  },
};

export function getProductContent(appId: string | undefined): ProductContent {
  return (appId && PRODUCT_CONTENT[appId]) || {};
}
