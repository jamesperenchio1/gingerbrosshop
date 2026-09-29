const STORAGE_KEY = 'gbros-source';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// Ad platforms append these click ids on their own, so an ad link is
// recognised even when nobody tagged it with ?src=.
const CLICK_ID_SOURCES: Array<[param: string, source: string]> = [
  ['fbclid', 'meta'],
  ['ttclid', 'tiktok'],
  ['gclid', 'google'],
];

function clean(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
}

/** Remembers where the visitor came from (`?src=`, `?utm_source=`, or an ad click id).
 *  Last tagged visit wins; a plain return visit keeps the earlier source. */
export function captureSourceFromUrl() {
  try {
    const params = new URL(window.location.href).searchParams;
    let source = clean(params.get('src') ?? params.get('utm_source') ?? '');
    if (!source) {
      source = CLICK_ID_SOURCES.find(([p]) => params.has(p))?.[1] ?? '';
    }
    if (!source) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ source, at: Date.now() }));
  } catch {
    // storage unavailable: the order just won't carry a source
  }
}

export function getStoredSource(): string | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const { source, at } = JSON.parse(raw) as { source?: string; at?: number };
    if (!source || !at || Date.now() - at > MAX_AGE_MS) return undefined;
    return source;
  } catch {
    return undefined;
  }
}
