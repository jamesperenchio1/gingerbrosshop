import { Redis } from '@upstash/redis';
import { DEFAULT_LINKPAGE_CONFIG, linkPageConfigSchema, type LinkPageConfig } from './linkpageSchema.js';

const redis = Redis.fromEnv();

const CONFIG_KEY = 'linkpage:config';
const HISTORY_KEY = 'linkpage:history';
const SIGNUPS_KEY = 'linkpage:signups';
const STATS_PREFIX = 'linkpage:stats:';
const HISTORY_LIMIT = 10;
const STATS_TTL_SECONDS = 60 * 60 * 24 * 400;

export interface HistoryEntry {
  savedAt: string;
  config: LinkPageConfig;
}

/** The saved config, or the Linktree snapshot if nothing has been saved (or the stored copy is invalid). */
export async function getLinkPageConfig(): Promise<LinkPageConfig> {
  const raw = await redis.get<unknown>(CONFIG_KEY);
  if (!raw) return DEFAULT_LINKPAGE_CONFIG;
  const parsed = linkPageConfigSchema.safeParse(raw);
  if (!parsed.success) {
    console.error('Stored linkpage config is invalid, serving default:', parsed.error.message);
    return DEFAULT_LINKPAGE_CONFIG;
  }
  return parsed.data;
}

/** Save a new config, pushing the one it replaces onto the revert history. */
export async function saveLinkPageConfig(config: LinkPageConfig): Promise<void> {
  const previous = await getLinkPageConfig();
  const entry: HistoryEntry = { savedAt: new Date().toISOString(), config: previous };
  await redis
    .pipeline()
    .lpush(HISTORY_KEY, JSON.stringify(entry))
    .ltrim(HISTORY_KEY, 0, HISTORY_LIMIT - 1)
    .set(CONFIG_KEY, JSON.stringify(config))
    .exec();
}

export async function getLinkPageHistory(): Promise<HistoryEntry[]> {
  const rows = await redis.lrange<HistoryEntry | string>(HISTORY_KEY, 0, HISTORY_LIMIT - 1);
  return rows.map((r) => (typeof r === 'string' ? (JSON.parse(r) as HistoryEntry) : r));
}

// ── Analytics ──────────────────────────────────────────────────────────────
// One Redis hash per day (Bangkok time) holding every counter for that day:
//   views, clicks, qr (scans via /q/<slug>), click:<blockId>, country:<CC>, device:<type>, ref:<host>

export type LinkEvent =
  | { type: 'view'; country: string; device: string; referrer: string }
  | { type: 'click'; blockId: string };

export function bangkokDay(date: Date = new Date()): string {
  return new Date(date.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
}

export async function recordLinkEvent(event: LinkEvent): Promise<void> {
  const key = STATS_PREFIX + bangkokDay();
  const p = redis.pipeline();
  if (event.type === 'view') {
    p.hincrby(key, 'views', 1);
    p.hincrby(key, `country:${event.country}`, 1);
    p.hincrby(key, `device:${event.device}`, 1);
    p.hincrby(key, `ref:${event.referrer}`, 1);
  } else {
    p.hincrby(key, 'clicks', 1);
    p.hincrby(key, `click:${event.blockId}`, 1);
  }
  p.expire(key, STATS_TTL_SECONDS);
  await p.exec();
}

export interface LinkAnalytics {
  days: { day: string; views: number; clicks: number; qr: number }[];
  totals: { views: number; clicks: number; qr: number };
  clicksByBlock: Record<string, number>;
  countries: Record<string, number>;
  devices: Record<string, number>;
  referrers: Record<string, number>;
}

export async function getLinkAnalytics(dayCount: number): Promise<LinkAnalytics> {
  const today = Date.now();
  const dayKeys: string[] = [];
  for (let i = dayCount - 1; i >= 0; i--) dayKeys.push(bangkokDay(new Date(today - i * 86400_000)));

  const p = redis.pipeline();
  for (const d of dayKeys) p.hgetall(STATS_PREFIX + d);
  const hashes = (await p.exec()) as (Record<string, number | string> | null)[];

  const result: LinkAnalytics = {
    days: [],
    totals: { views: 0, clicks: 0, qr: 0 },
    clicksByBlock: {},
    countries: {},
    devices: {},
    referrers: {},
  };
  const bump = (bucket: Record<string, number>, k: string, n: number) => {
    bucket[k] = (bucket[k] ?? 0) + n;
  };

  dayKeys.forEach((day, i) => {
    const h = hashes[i] ?? {};
    const num = (k: string) => Number(h[k] ?? 0);
    const row = { day, views: num('views'), clicks: num('clicks'), qr: num('qr') };
    result.days.push(row);
    result.totals.views += row.views;
    result.totals.clicks += row.clicks;
    result.totals.qr += row.qr;
    for (const [field, value] of Object.entries(h)) {
      const n = Number(value);
      const sep = field.indexOf(':');
      if (sep < 0) continue;
      const kind = field.slice(0, sep);
      const name = field.slice(sep + 1);
      if (kind === 'click') bump(result.clicksByBlock, name, n);
      else if (kind === 'country') bump(result.countries, name, n);
      else if (kind === 'device') bump(result.devices, name, n);
      else if (kind === 'ref') bump(result.referrers, name, n);
    }
  });
  return result;
}

// ── Signups ────────────────────────────────────────────────────────────────

export async function addLinkPageSignup(email: string): Promise<void> {
  // NX keeps the first signup time if someone submits twice.
  await redis.zadd(SIGNUPS_KEY, { nx: true }, { score: Date.now(), member: email });
}

export async function listLinkPageSignups(): Promise<{ email: string; signedUpAt: string }[]> {
  const rows = await redis.zrange<(string | number)[]>(SIGNUPS_KEY, 0, -1, { withScores: true, rev: true });
  const out: { email: string; signedUpAt: string }[] = [];
  for (let i = 0; i < rows.length; i += 2) {
    out.push({ email: String(rows[i]), signedUpAt: new Date(Number(rows[i + 1])).toISOString() });
  }
  return out;
}

// ── QR codes ───────────────────────────────────────────────────────────────
// Each code points at a short URL (/q/<slug>) that counts the scan and then
// 302s to the target, so a printed code keeps working if the target changes.

const QR_KEY = 'linkpage:qrcodes';
const QR_SCANS_KEY = 'linkpage:qrscans';

export interface QrCode {
  slug: string;
  name: string;
  targetUrl: string;
  fg: string;
  bg: string;
  createdAt: string;
}

export async function listQrCodes(): Promise<(QrCode & { scans: number })[]> {
  const [codes, scans] = await Promise.all([
    redis.hgetall<Record<string, QrCode | string>>(QR_KEY),
    redis.hgetall<Record<string, number | string>>(QR_SCANS_KEY),
  ]);
  return Object.values(codes ?? {})
    .map((c) => (typeof c === 'string' ? (JSON.parse(c) as QrCode) : c))
    .map((c) => ({ ...c, scans: Number(scans?.[c.slug] ?? 0) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getQrCode(slug: string): Promise<QrCode | null> {
  const c = await redis.hget<QrCode | string>(QR_KEY, slug);
  if (!c) return null;
  return typeof c === 'string' ? (JSON.parse(c) as QrCode) : c;
}

export async function saveQrCode(code: QrCode): Promise<void> {
  await redis.hset(QR_KEY, { [code.slug]: JSON.stringify(code) });
}

export async function deleteQrCode(slug: string): Promise<void> {
  await redis.pipeline().hdel(QR_KEY, slug).hdel(QR_SCANS_KEY, slug).exec();
}

export async function recordQrScan(slug: string): Promise<void> {
  const day = STATS_PREFIX + bangkokDay();
  await redis.pipeline().hincrby(QR_SCANS_KEY, slug, 1).hincrby(day, 'qr', 1).expire(day, STATS_TTL_SECONDS).exec();
}
