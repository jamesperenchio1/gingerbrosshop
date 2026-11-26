import { IMAGE_MANIFEST } from './imageManifest';

const CLOUDINARY_UPLOAD_MARKER = '/image/upload/';

/**
 * Requests a right-sized rendition of a Cloudinary-hosted image instead of
 * the raw upload. Some product photos (e.g. the Ginger Fizz bottle shot) are
 * uploaded as multi-megabyte, several-thousand-pixel-wide originals — served
 * untouched into a ~200px card, that's what made the photo appear to never
 * finish loading on slower connections. `f_auto,q_auto` picks the best
 * format/compression for the requesting browser; `w_<width>` caps the
 * resolution to what the layout actually needs. Non-Cloudinary URLs (local
 * `/images/...` assets, other hosts) pass through unchanged.
 */
export function optimizedImageUrl(url: string, width: number): string {
  if (!url) return url;
  const markerIndex = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (markerIndex === -1) return url;
  const insertAt = markerIndex + CLOUDINARY_UPLOAD_MARKER.length;
  return `${url.slice(0, insertAt)}f_auto,q_auto:good,w_${width}/${url.slice(insertAt)}`;
}

/**
 * Maps a local `/images/gen/<name>.jpg` (or .png/.webp/.avif) URL back to its
 * key in the generated manifest, so components can hand it to
 * `<ResponsiveImage name=…>` and let the browser pick an AVIF/WebP width.
 *
 * Blog article covers are stored as their full-size JPEG for email and social
 * (up to ~770 KB), and rendering those raw into a 400px card was shipping a
 * full-resolution photo to every visitor. Returns null for anything that isn't
 * one of our generated images.
 */
export function manifestNameForUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const match = /^\/images\/gen\/([A-Za-z0-9-]+)\.(?:jpe?g|png|webp|avif)$/.exec(url);
  if (!match) return undefined;
  return IMAGE_MANIFEST[match[1]] ? match[1] : undefined;
}
