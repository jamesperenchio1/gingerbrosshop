import { put } from '@vercel/blob';

const IMAGE_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

/**
 * Upload a base64 data URL to Vercel Blob and return the public URL.
 * Shared by the link-page admin and the product admin.
 */
export async function uploadDataUrl(dataUrl: unknown, prefix: string): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Image uploads need a Vercel Blob store (BLOB_READ_WRITE_TOKEN is not set).');
  }

  const match = typeof dataUrl === 'string' ? dataUrl.match(/^data:([\w/+.-]+);base64,(.+)$/) : null;
  const ext = match ? IMAGE_TYPES[match[1]] : undefined;
  if (!match || !ext) {
    throw new Error('Upload a PNG, JPG, WebP or GIF image.');
  }

  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > MAX_UPLOAD_BYTES) {
    throw new Error('Image is too large (max 2 MB).');
  }

  const blob = await put(`${prefix}/${Date.now()}.${ext}`, bytes, {
    access: 'public',
    contentType: match[1],
    addRandomSuffix: true,
  });
  return blob.url;
}
