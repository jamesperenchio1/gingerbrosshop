import { IMAGE_MANIFEST } from '@/lib/imageManifest';

/** Where scripts/build-images.mjs writes its output. */
export const GEN_BASE = '/images/gen';

/** Full-size JPEG of a manifest image — for Stripe, OG tags and email. */
export function manifestJpg(name: string): string | null {
  return IMAGE_MANIFEST[name] ? `${GEN_BASE}/${name}.jpg` : null;
}

/** Small image URL for thumbnails (cart lines, emails) with a fallback. */
export function thumbUrl(appId: string | null | undefined, fallback: string): string {
  const e = appId ? IMAGE_MANIFEST[appId] : undefined;
  return e ? `${GEN_BASE}/${appId}-${e.widths[0]}.webp` : fallback;
}
