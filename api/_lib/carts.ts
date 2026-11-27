import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const ABANDONED_KEY = 'abandoned_carts';

export interface CartSnapshot {
  email: string;
  items: Array<{ name: string; price: number; quantity: number; image: string }>;
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
// Reminder safety. Anyone can post a cart for any address, and the reminder goes
// out from our domain, so nothing sender-typed may become a link elsewhere.
// ---------------------------------------------------------------------------

const SITE_URL = 'https://gingerbrosshop.com';
const OWN_HOSTS = new Set(['gingerbrosshop.com', 'www.gingerbrosshop.com']);
const IMAGE_HOSTS = new Set([...OWN_HOSTS, 'files.stripe.com']);
/** Brewing-equipment photos: our own Cloudinary folder only. */
const CLOUDINARY_PREFIX = 'https://res.cloudinary.com/yqbe4rnq/';

function httpsOn(value: unknown, hosts: Set<string>): string | null {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' && hosts.has(url.hostname) ? url.href : null;
  } catch {
    return null;
  }
}

function clamp(value: unknown, min: number, max: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
}

function plainText(value: unknown): string {
  const text = String(value ?? '').replace(/(?:https?:\/\/|www\.)\S*/gi, '').replace(/\s+/g, ' ').trim();
  return text.slice(0, 80) || 'GingerBros';
}

export function sanitizeCart(snapshot: CartSnapshot): CartSnapshot {
  const items = (Array.isArray(snapshot.items) ? snapshot.items : []).slice(0, 20).map((item) => {
    const image = String(item?.image ?? '');
    return {
      name: plainText(item?.name),
      price: clamp(item?.price, 0, 100_000),
      quantity: Math.round(clamp(item?.quantity, 1, 999)),
      image: /^\/(?!\/)/.test(image) || image.startsWith(CLOUDINARY_PREFIX) ? image : httpsOn(image, IMAGE_HOSTS) ?? '',
    };
  });
  return {
    ...snapshot,
    items,
    subtotal: clamp(snapshot.subtotal, 0, 10_000_000),
    url: httpsOn(snapshot.url, OWN_HOSTS) ?? `${SITE_URL}/shop`,
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
