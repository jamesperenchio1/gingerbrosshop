import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { isAdminAuthorized } from '../adminAuth.js';
import {
  getLinkPageConfig,
  saveLinkPageConfig,
  getLinkPageHistory,
  getLinkAnalytics,
  listLinkPageSignups,
  listQrCodes,
  getQrCode,
  saveQrCode,
  deleteQrCode,
} from '../linkpage.js';
import { linkPageConfigSchema } from '../linkpageSchema.js';

const IMAGE_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { allowed } = await rateLimit({ key: `links-admin:${getClientIp(req)}`, limit: 60, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const view = String(req.query.view ?? 'config');
      if (view === 'config') {
        const [config, history] = await Promise.all([getLinkPageConfig(), getLinkPageHistory()]);
        res.status(200).json({ config, history });
        return;
      }
      if (view === 'analytics') {
        const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
        res.status(200).json(await getLinkAnalytics(days));
        return;
      }
      if (view === 'signups') {
        res.status(200).json({ signups: await listLinkPageSignups() });
        return;
      }
      if (view === 'qr') {
        res.status(200).json({ codes: await listQrCodes() });
        return;
      }
      res.status(400).json({ error: 'Unknown view' });
      return;
    }

    if (req.method === 'PUT') {
      const parsed = linkPageConfigSchema.safeParse(req.body?.config);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        res.status(400).json({ error: `${issue.path.join('.')}: ${issue.message}` });
        return;
      }
      await saveLinkPageConfig(parsed.data);
      res.status(200).json({ config: parsed.data, history: await getLinkPageHistory() });
      return;
    }

    if (req.method === 'POST') {
      const body = (req.body ?? {}) as Record<string, unknown>;

      if (body.action === 'revert') {
        const history = await getLinkPageHistory();
        const entry = history[Number(body.index)];
        if (!entry) {
          res.status(404).json({ error: 'That version no longer exists' });
          return;
        }
        const parsed = linkPageConfigSchema.parse(entry.config);
        await saveLinkPageConfig(parsed);
        res.status(200).json({ config: parsed, history: await getLinkPageHistory() });
        return;
      }

      if (body.action === 'upload') {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          res.status(500).json({ error: 'Image uploads need a Vercel Blob store (BLOB_READ_WRITE_TOKEN is not set).' });
          return;
        }
        const match = typeof body.dataUrl === 'string' ? body.dataUrl.match(/^data:([\w/+.-]+);base64,(.+)$/) : null;
        const ext = match ? IMAGE_TYPES[match[1]] : undefined;
        if (!match || !ext) {
          res.status(400).json({ error: 'Upload a PNG, JPG, WebP or GIF image.' });
          return;
        }
        const bytes = Buffer.from(match[2], 'base64');
        if (bytes.length > MAX_UPLOAD_BYTES) {
          res.status(413).json({ error: 'Image is too large (max 2 MB).' });
          return;
        }
        const blob = await put(`linkpage/${Date.now()}.${ext}`, bytes, {
          access: 'public',
          contentType: match[1],
          addRandomSuffix: true,
        });
        res.status(200).json({ url: blob.url });
        return;
      }

      if (body.action === 'qr-save') {
        const slug = String(body.slug ?? '').toLowerCase().trim();
        const name = String(body.name ?? '').trim().slice(0, 80);
        const targetUrl = String(body.targetUrl ?? '').trim();
        const fg = String(body.fg ?? '#000000');
        const bg = String(body.bg ?? '#ffffff');
        if (!SLUG_RE.test(slug)) {
          res.status(400).json({ error: 'Short name: lowercase letters, numbers and dashes (max 40).' });
          return;
        }
        if (!/^https?:\/\//i.test(targetUrl) || targetUrl.length > 2048) {
          res.status(400).json({ error: 'Target must be an http(s) URL.' });
          return;
        }
        if (!COLOR_RE.test(fg) || !COLOR_RE.test(bg)) {
          res.status(400).json({ error: 'Colours must be #RRGGBB.' });
          return;
        }
        const existing = await getQrCode(slug);
        if (existing && body.overwrite !== true) {
          res.status(409).json({ error: `"${slug}" is already used by another QR code.` });
          return;
        }
        await saveQrCode({
          slug,
          name: name || slug,
          targetUrl,
          fg,
          bg,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
        });
        res.status(200).json({ codes: await listQrCodes() });
        return;
      }

      if (body.action === 'qr-delete') {
        await deleteQrCode(String(body.slug ?? ''));
        res.status(200).json({ codes: await listQrCodes() });
        return;
      }

      res.status(400).json({ error: 'Unknown action' });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('links-admin error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
