import { Redis } from '@upstash/redis';

export interface Order {
  sessionId: string;
  paymentIntentId: string | null;
  subscriptionId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: Record<string, unknown> | null;
  items: Array<{ id: string; description: string; quantity: number; amountTotal: number }>;
  amountTotal: number;
  currency: string;
  status: string;
  mode?: string;
  isGift?: boolean;
  recipientEmail?: string | null;
  recipientName?: string | null;
  giftMessage?: string | null;
  referralCode?: string;
  createdAt: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
}

const redis = Redis.fromEnv();
const ORDERS_KEY = 'orders';

async function readOrders(): Promise<Order[]> {
  try {
    const data = await redis.get<Order[]>(ORDERS_KEY);
    return data ?? [];
  } catch (err) {
    console.error('Redis read error:', err);
    return [];
  }
}

async function writeOrders(orders: Order[]) {
  try {
    await redis.set(ORDERS_KEY, orders);
  } catch (err) {
    console.error('Redis write error:', err);
  }
}

export async function getOrders(): Promise<Order[]> {
  return readOrders();
}

export async function getOrderBySessionId(sessionId: string): Promise<Order | undefined> {
  const orders = await readOrders();
  return orders.find((o) => o.sessionId === sessionId);
}

export async function saveOrder(order: Order) {
  const orders = await readOrders();
  const existingIndex = orders.findIndex((o) => o.sessionId === order.sessionId);
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.unshift(order);
  }
  await writeOrders(orders);
}

export async function updateTracking(
  sessionId: string,
  trackingNumber: string,
  trackingCarrier?: string
): Promise<Order | null> {
  const orders = await readOrders();
  const idx = orders.findIndex((o) => o.sessionId === sessionId);
  if (idx === -1) return null;
  orders[idx].trackingNumber = trackingNumber;
  if (trackingCarrier) orders[idx].trackingCarrier = trackingCarrier;
  await writeOrders(orders);
  return orders[idx];
}
