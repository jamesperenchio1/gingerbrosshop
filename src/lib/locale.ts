/**
 * Locale lives in the URL: English at /…, Thai at /th/…. The router runs with
 * basename "/th" for Thai, so every in-app <Link> stays in the visitor's
 * language without knowing about it.
 */
import type { Locale } from '@/context/I18nContext';
import { THAI_PATHS } from '../seo/routes';

export const TH_PREFIX = '/th';

/** Pages that have real Thai content (prerendered under /th, get hreflang). Derived from src/seo/routes.ts. */
export const TH_PATHS = THAI_PATHS;

export function localeFromPath(pathname: string): Locale {
  return pathname === TH_PREFIX || pathname.startsWith(`${TH_PREFIX}/`) ? 'th' : 'en';
}

export function basenameFor(locale: Locale): string {
  return locale === 'th' ? TH_PREFIX : '';
}

/** Absolute path of `path` (router-relative) in `locale`. */
export function localizedPath(path: string, locale: Locale): string {
  if (locale === 'en') return path;
  return path === '/' ? TH_PREFIX : `${TH_PREFIX}${path}`;
}

export function hasThai(path: string): boolean {
  return TH_PATHS.includes(path);
}
