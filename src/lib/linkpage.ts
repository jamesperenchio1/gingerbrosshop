// Client-side helpers for the link-in-bio page. The schema, defaults and
// pure helpers are shared with the API so validation stays in one place.
export * from '../../api/_lib/linkpageSchema';
import type { SocialType } from '../../api/_lib/linkpageSchema';

export const LINK_HOST_PREFIX = 'link.';
export const LINK_PAGE_URL = 'https://link.gingerbrosshop.com';

/** True on link.gingerbrosshop.com (or link.localhost for local testing). */
export function isLinkHost(): boolean {
  return typeof window !== 'undefined' && window.location.hostname.startsWith(LINK_HOST_PREFIX);
}

/** Fire-and-forget analytics beacon; survives the page navigating away on a link tap. */
export function sendLinkEvent(payload: Record<string, unknown>): void {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon?.('/api/links/event', body)) return;
  } catch {
    // fall through to fetch
  }
  fetch('/api/links/event', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
}

const loadedFonts = new Set<string>();

/** Inject a Google Fonts stylesheet for the page font (plus Noto Sans Thai for the Thai bio text). */
export function ensureFontLoaded(font: string): void {
  if (typeof document === 'undefined' || loadedFonts.has(font)) return;
  loadedFonts.add(font);
  const family = (f: string) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${family(font)}&${family('Noto Sans Thai')}&display=swap`;
  document.head.appendChild(link);
}

export const SOCIAL_LABELS: Record<SocialType, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  line: 'LINE',
  youtube: 'YouTube',
  x: 'X',
  shopee: 'Shopee',
  email: 'Email',
  website: 'Website',
};

