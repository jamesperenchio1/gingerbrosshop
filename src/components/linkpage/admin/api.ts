export class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Call /api/links-admin with the admin session cookie. Throws AdminApiError with the server's message. */
export async function adminApi<T>(init: { method?: string; query?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/links-admin${init.query ? `?${init.query}` : ''}`, {
    method: init.method ?? 'GET',
    credentials: 'same-origin',
    headers: init.body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new AdminApiError(res.status, data.error ?? `Request failed (${res.status})`);
  return data;
}

/** Downscale to at most `maxSize` px and re-encode as WebP (PNG for GIF-free transparency fallback). */
export async function compressImage(file: File, maxSize = 800): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const webp = canvas.toDataURL('image/webp', 0.88);
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/png');
}

export async function uploadImage(file: File, maxSize?: number): Promise<string> {
  const dataUrl = await compressImage(file, maxSize);
  const { url } = await adminApi<{ url: string }>({ method: 'POST', body: { action: 'upload', dataUrl } });
  return url;
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
