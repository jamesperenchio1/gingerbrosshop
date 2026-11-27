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

export async function removeStockAlertSubscriber(productId: string, email: string): Promise<void> {
  await redis.srem(key(productId), email.toLowerCase().trim());
}

export async function removeFromAllStockAlerts(email: string): Promise<void> {
  for (const k of await redis.keys(key('*'))) await redis.srem(k, email.toLowerCase().trim());
}
