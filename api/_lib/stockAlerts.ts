import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

function key(productId: string) {
  return `stock_alerts:${productId}`;
}

export async function subscribeStockAlert(productId: string, email: string): Promise<void> {
  await redis.sadd(key(productId), email.toLowerCase().trim());
}

export async function getStockAlertSubscribers(productId: string): Promise<string[]> {
  return redis.smembers<string>(key(productId));
}

export async function clearStockAlertSubscribers(productId: string): Promise<void> {
  await redis.del(key(productId));
}
