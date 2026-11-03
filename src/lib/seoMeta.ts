/**
 * Search-result wording for drink product pages, shared by the product page
 * (src/pages/ProductDetail.tsx) and the edge middleware (middleware.ts) so
 * crawlers see the same title and description either way. Dependency-free so
 * it stays cheap in the edge runtime. Titles omit the " | GingerBros" suffix.
 */
export type DrinkSeoKind = 'fizz' | 'tea' | 'mix';

/** Drink family from the product id (ginger-fizz*, ginger-tea*, fizz-tea-*). */
export function drinkSeoKind(id: string): DrinkSeoKind | null {
  if (id.startsWith('ginger-fizz')) return 'fizz';
  if (id.startsWith('ginger-tea')) return 'tea';
  if (id.startsWith('fizz-tea')) return 'mix';
  return null;
}

export function drinkSeo(id: string, name: string): { title: string; description: string } | null {
  switch (drinkSeoKind(id)) {
    case 'fizz':
      return {
        title: `${name} | Thai Ginger Soda`,
        description: `${name}: sparkling ginger soda with fresh Thai ginger, real lime and low sugar. Order online, delivered across Thailand.`,
      };
    case 'tea':
      return {
        title: `${name} | Iced Ginger Tea`,
        description: `${name}: ginger tea simmered with lemongrass, lime and spices. No artificial colours or flavours. Delivered across Thailand.`,
      };
    case 'mix':
      return {
        title: `${name} | Ginger Drinks Bundle`,
        description: `${name}: Ginger Fizz and Ginger Tea together. Fresh Thai ginger, real lime, lemongrass and spice. Delivered across Thailand.`,
      };
    default:
      return null;
  }
}
