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
  return `${url.slice(0, insertAt)}f_auto,q_auto,w_${width}/${url.slice(insertAt)}`;
}
