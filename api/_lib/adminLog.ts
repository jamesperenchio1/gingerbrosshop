import { Redis } from '@upstash/redis';

/**
 * Every mutating admin action is recorded here so there is a durable trail of
 * who did what, when, to which object, with what amount and reason. Stored as a
 * capped list in Redis under `admin_actions` (newest first).
 */
export interface AdminAction {
  id: string;
  at: string;
  email: string | null;
  resource: string;
  action: string;
  target: string | null;
  amount: number | null;
  reason: string | null;
  result: string;
  detail?: string | null;
}

const redis = Redis.fromEnv();
const LOG_KEY = 'admin_actions';
const MAX_ENTRIES = 500;

export async function logAdminAction(entry: Omit<AdminAction, 'id' | 'at'>): Promise<AdminAction> {
  const record: AdminAction = {
    id: Math.random().toString(36).slice(2, 10),
    at: new Date().toISOString(),
    ...entry,
  };
  try {
    const existing = (await redis.get<AdminAction[]>(LOG_KEY)) ?? [];
    existing.unshift(record);
    await redis.set(LOG_KEY, existing.slice(0, MAX_ENTRIES));
  } catch (err) {
    console.error('adminLog write error:', err);
  }
  return record;
}

export async function getAdminActions(limit = 100): Promise<AdminAction[]> {
  try {
    const data = (await redis.get<AdminAction[]>(LOG_KEY)) ?? [];
    return data.slice(0, limit);
  } catch (err) {
    console.error('adminLog read error:', err);
    return [];
  }
}
