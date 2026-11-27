import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const ABANDONED_KEY = 'abandoned_carts';

export interface CartSnapshot {
  email: string;
  items: Array<{ id?: string; priceId?: string; name: string; price: number; quantity: number; image: string }>;
  subtotal: number;
  url: string;
  createdAt: string;
  recovered?: boolean;
}

export async function saveCartSnapshot(email: string, snapshot: CartSnapshot) {
  const key = `${ABANDONED_KEY}:${email.toLowerCase()}`;
  await redis.set(key, snapshot);
}

export async function getCartSnapshot(email: string): Promise<CartSnapshot | null> {
  const key = `${ABANDONED_KEY}:${email.toLowerCase()}`;
  return redis.get<CartSnapshot>(key);
}

export async function markCartRecovered(email: string) {
  const key = `${ABANDONED_KEY}:${email.toLowerCase()}`;
  const snap = await redis.get<CartSnapshot>(key);
  if (snap) {
    snap.recovered = true;
    await redis.set(key, snap);
  }
}

// ---------------------------------------------------------------------------
// Reminder safety. Anyone can post a cart for any address and the reminder goes
// out from our domain, so only price ids and quantities are taken from it.
// ---------------------------------------------------------------------------

const SITE_URL = 'https://gingerbrosshop.com';
const OWN_HOSTS = new Set(['gingerbrosshop.com', 'www.gingerbrosshop.com']);

/** Stripe price id -> what that product really is. */
export type PriceCatalog = Map<string, { name: string; price: number; image: string }>;

function ownUrl(value: unknown): string | null {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' && OWN_HOSTS.has(url.hostname) ? url.href : null;
  } catch {
    return null;
  }
}

function clamp(value: unknown, min: number, max: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
}

/** The cart as safe to email, or null when it holds nothing we sell. */
export function rebuildCart(snapshot: CartSnapshot, catalog: PriceCatalog): CartSnapshot | null {
  const items = (Array.isArray(snapshot.items) ? snapshot.items : []).slice(0, 20).flatMap((item) => {
    const real = catalog.get(String(item?.priceId ?? item?.id ?? ''));
    return real ? [{ ...real, quantity: Math.round(clamp(item.quantity, 1, 999)) }] : [];
  });
  if (items.length === 0) return null;
  return {
    ...snapshot,
    items,
    subtotal: clamp(snapshot.subtotal, 0, 10_000_000),
    url: ownUrl(snapshot.url) ?? `${SITE_URL}/shop`,
  };
}

const remindedKey = (email: string) => `cart_reminded:${email.toLowerCase()}`;

export async function recentlyReminded(email: string): Promise<boolean> {
  return (await redis.get(remindedKey(email))) !== null;
}

export async function markReminded(email: string): Promise<void> {
  await redis.set(remindedKey(email), 1, { ex: 7 * 86400 });
}

// ---------------------------------------------------------------------------
// Shareable cart links — stored by UUID with a 7-day TTL
// ---------------------------------------------------------------------------

export interface SharedCartItem {
  id: string;
  priceId: string;
  productId?: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  image: string;
  badge?: string;
  badgeColor?: string;
  isSubscription?: boolean;
  interval?: string;
}

export async function saveSharedCart(id: string, items: SharedCartItem[]): Promise<void> {
  await redis.set(`shared_cart:${id}`, items, { ex: 60 * 60 * 24 * 7 }); // 7 days
}

export async function getSharedCart(id: string): Promise<SharedCartItem[] | null> {
  return redis.get<SharedCartItem[]>(`shared_cart:${id}`);
}

export async function getAllAbandonedCarts(): Promise<Array<{ email: string; snapshot: CartSnapshot }>> {
  const keys = await redis.keys(`${ABANDONED_KEY}:*`);
  const result: Array<{ email: string; snapshot: CartSnapshot }> = [];
  for (const key of keys) {
    const snap = await redis.get<CartSnapshot>(key);
    if (snap && !snap.recovered) {
      const email = key.replace(`${ABANDONED_KEY}:`, '');
      result.push({ email, snapshot: snap });
    }
  }
  return result;
}
