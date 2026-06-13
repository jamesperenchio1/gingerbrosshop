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
