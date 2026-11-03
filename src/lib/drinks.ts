/**
 * Groups the drink listings in Stripe into the two drink "families" the shop
 * shows (Ginger Fizz, Ginger Tea) with their pack sizes as options, plus the
 * mixed bundles. Every pack is still its own Stripe product, so prices and
 * checkout are unchanged; this only decides how they're presented.
 */
import { bottleCounts, defaultPrice, oneTimePrice, type CatalogProduct } from '@/lib/catalog';
import { FIZZ_SINGLE, TEA_SINGLE } from '@/lib/multiBuy';

export type DrinkKind = 'fizz' | 'tea';

export interface PackOption {
  product: CatalogProduct;
  bottles: number;
  price: number;
  perBottle: number;
  /** Baht saved against buying the same bottles as singles. */
  saving: number;
}

export function drinkKind(product: CatalogProduct): DrinkKind | 'mix' | null {
  const { bottlesFizz, bottlesTea } = bottleCounts(product);
  if (bottlesFizz && bottlesTea) return 'mix';
  if (bottlesFizz) return 'fizz';
  if (bottlesTea) return 'tea';
  return null;
}

function option(product: CatalogProduct): PackOption | null {
  const price = (oneTimePrice(product) ?? defaultPrice(product))?.unitAmount;
  if (price == null) return null;
  const { bottlesFizz, bottlesTea } = bottleCounts(product);
  const bottles = bottlesFizz + bottlesTea;
  const list = bottlesFizz * FIZZ_SINGLE + bottlesTea * TEA_SINGLE;
  return { product, bottles, price, perBottle: Math.round(price / Math.max(1, bottles)), saving: Math.max(0, list - price) };
}

/** Pack options for one drink, smallest first. */
export function packOptions(products: CatalogProduct[], kind: DrinkKind): PackOption[] {
  return products
    .filter((p) => drinkKind(p) === kind)
    .map(option)
    .filter((o): o is PackOption => o !== null)
    .sort((a, b) => a.bottles - b.bottles);
}

/** Mixed Fizz + Tea bundles, smallest first. */
export function mixOptions(products: CatalogProduct[]): PackOption[] {
  return products
    .filter((p) => drinkKind(p) === 'mix')
    .map(option)
    .filter((o): o is PackOption => o !== null)
    .sort((a, b) => a.bottles - b.bottles);
}

/** Taste profile, 1–5, for the little meters on cards and product pages. */
export const TASTE: Record<DrinkKind, { key: string; value: number }[]> = {
  fizz: [
    { key: 'tasteKick', value: 4 },
    { key: 'tasteCitrus', value: 4 },
    { key: 'tasteFizz', value: 5 },
    { key: 'tasteSweet', value: 2 },
  ],
  tea: [
    { key: 'tasteKick', value: 3 },
    { key: 'tasteSpice', value: 4 },
    { key: 'tasteCitrus', value: 2 },
    { key: 'tasteSweet', value: 2 },
  ],
};

/** Equipment sub-groups, matched on product name. */
export const EQUIPMENT_GROUPS: { label: string; match: RegExp }[] = [
  { label: 'Kegs', match: /keg/i },
  { label: 'Taps', match: /tap\b|nukatap/i },
  { label: 'Disconnects', match: /disconnect/i },
  { label: 'Cleaning', match: /sanit|clean/i },
];

export function groupEquipment(products: CatalogProduct[]): { label: string; items: CatalogProduct[] }[] {
  const used = new Set<string>();
  const groups = EQUIPMENT_GROUPS.map(({ label, match }) => {
    const items = products.filter((p) => !used.has(p.id) && match.test(p.name));
    items.forEach((p) => used.add(p.id));
    return { label, items };
  });
  const rest = products.filter((p) => !used.has(p.id));
  if (rest.length) groups.push({ label: 'More gear', items: rest });
  return groups.filter((g) => g.items.length > 0);
}
