import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, Copy, Trash2, Pencil, QrCode as QrIcon, Check } from 'lucide-react';
import { LINK_PAGE_URL, type LinkBlock } from '@/lib/linkpage';
import { adminApi } from './api';
import { ColorField, Field, TextField, Toggle, inputClass } from './fields';

// Printed codes point at the main domain so they work regardless of the link.
// subdomain, and the redirect target can be changed later without reprinting.
const SHORT_BASE = 'https://gingerbrosshop.com/q/';

interface QrCodeRow {
  slug: string;
  name: string;
  targetUrl: string;
  fg: string;
  bg: string;
  createdAt: string;
  scans: number;
}

interface Draft {
  name: string;
  slug: string;
  slugEdited: boolean;
  target: string; // 'page' | block id | 'custom'
  customUrl: string;
  fg: string;
  bg: string;
  editing: boolean;
}

const EMPTY: Draft = { name: '', slug: '', slugEdited: false, target: 'page', customUrl: 'https://', fg: '#000000', bg: '#ffffff', editing: false };

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

function blockUrl(b: LinkBlock): string | null {
  if (b.type === 'link' || b.type === 'social-card') return b.url;
  if (b.type === 'product') return `https://gingerbrosshop.com/product/${b.productId}`;
  return null;
}

function qrOptions(fg: string, bg: string, width: number) {
  return { width, margin: 2, errorCorrectionLevel: 'M' as const, color: { dark: fg, light: bg } };
}

/** 1024px PNG, optionally with the code's name printed underneath (handy for labels and posters). */
async function renderPng(code: { slug: string; name: string; fg: string; bg: string }, caption: boolean): Promise<Blob> {
  const url = SHORT_BASE + code.slug;
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, url, qrOptions(code.fg, code.bg, 1024));
  if (!caption) return new Promise((r) => qrCanvas.toBlob((b) => r(b!), 'image/png'));

  const pad = 150;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024 + pad;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = code.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(qrCanvas, 0, 0);
  ctx.fillStyle = code.fg;
  ctx.textAlign = 'center';
  ctx.font = '600 54px "Albert Sans", system-ui, sans-serif';
  ctx.fillText(code.name, 512, 1024 + 40, 960);
  ctx.font = '400 34px "Albert Sans", system-ui, sans-serif';
  ctx.fillText(url.replace('https://', ''), 512, 1024 + 100, 960);
  return new Promise((r) => canvas.toBlob((b) => r(b!), 'image/png'));
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export default function QrCodes({ blocks }: { blocks: LinkBlock[] }) {
  const [codes, setCodes] = useState<QrCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');

  const targets = useMemo(
    () => blocks.map((b) => ({ id: b.id, url: blockUrl(b), label: 'title' in b ? b.title || b.id : b.id })).filter((t) => t.url),
    [blocks],
  );

  const targetUrl =
    draft.target === 'page' ? `${LINK_PAGE_URL}/?src=qr` : draft.target === 'custom' ? draft.customUrl : targets.find((t) => t.id === draft.target)?.url ?? '';

  useEffect(() => {
    adminApi<{ codes: QrCodeRow[] }>({ query: 'view=qr' })
      .then((d) => setCodes(d.codes))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const slug = draft.slug || 'your-code';
    QRCode.toDataURL(SHORT_BASE + slug, qrOptions(draft.fg, draft.bg, 320)).then(setPreview).catch(() => setPreview(''));
  }, [draft.slug, draft.fg, draft.bg]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(''), 2000);
    return () => clearTimeout(t);
  }, [flash]);

  const save = async () => {
    setError('');
    setSaving(true);
    try {
      const d = await adminApi<{ codes: QrCodeRow[] }>({
        method: 'POST',
        body: { action: 'qr-save', slug: draft.slug, name: draft.name, targetUrl, fg: draft.fg, bg: draft.bg, overwrite: draft.editing },
      });
      setCodes(d.codes);
      setFlash(draft.editing ? 'QR code updated' : 'QR code created');
      setDraft(EMPTY);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const edit = (c: QrCodeRow) => {
    const block = targets.find((t) => t.url === c.targetUrl);
    const isPage = c.targetUrl === `${LINK_PAGE_URL}/?src=qr`;
    setDraft({
      name: c.name,
      slug: c.slug,
      slugEdited: true,
      target: isPage ? 'page' : block ? block.id : 'custom',
      customUrl: c.targetUrl,
      fg: c.fg,
      bg: c.bg,
      editing: true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (c: QrCodeRow) => {
    if (!confirm(`Delete "${c.name}"? Printed copies of this code will stop working.`)) return;
    try {
      const d = await adminApi<{ codes: QrCodeRow[] }>({ method: 'POST', body: { action: 'qr-delete', slug: c.slug } });
      setCodes(d.codes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete');
    }
  };

  const share = async (c: QrCodeRow) => {
    const url = SHORT_BASE + c.slug;
    try {
      const file = new File([await renderPng(c, caption)], `gingerbros-qr-${c.slug}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: c.name, text: url });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: c.name, url });
        return;
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    setFlash('Link copied');
  };

  const downloadSvg = async (c: QrCodeRow) => {
    const svg = await QRCode.toString(SHORT_BASE + c.slug, { ...qrOptions(c.fg, c.bg, 1024), type: 'svg' });
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `gingerbros-qr-${c.slug}.svg`);
  };

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-soft-peach p-4">
        <h3 className="font-display text-[18px] text-deep-brown">{draft.editing ? `Edit “${draft.name}”` : 'Create a QR code'}</h3>
        <p className="font-body text-[13px] text-earth mt-1">
          Every code goes through a short link that counts scans. You can change where it points later without reprinting.
        </p>

        <div className="mt-4 grid sm:grid-cols-[1fr_180px] gap-4">
          <div className="space-y-3">
            <TextField
              label="Name"
              value={draft.name}
              placeholder="Bottle label, Market stall poster…"
              onChange={(name) => setDraft((d) => ({ ...d, name, slug: d.slugEdited ? d.slug : slugify(name) }))}
            />
            <Field label="Short link" hint={`${SHORT_BASE.replace('https://', '')}${draft.slug || '…'}`}>
              <input
                value={draft.slug}
                disabled={draft.editing}
                onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value), slugEdited: true }))}
                className={`${inputClass} disabled:opacity-60`}
                placeholder="bottle-label"
              />
            </Field>
            <Field label="Opens">
              <select value={draft.target} onChange={(e) => setDraft((d) => ({ ...d, target: e.target.value }))} className={inputClass}>
                <option value="page">My link page</option>
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    Link: {t.label}
                  </option>
                ))}
                <option value="custom">Custom URL…</option>
              </select>
            </Field>
            {draft.target === 'custom' && (
              <TextField label="Custom URL" value={draft.customUrl} onChange={(customUrl) => setDraft((d) => ({ ...d, customUrl }))} />
            )}
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Code colour" value={draft.fg} onChange={(fg) => setDraft((d) => ({ ...d, fg }))} />
              <ColorField label="Background" value={draft.bg} onChange={(bg) => setDraft((d) => ({ ...d, bg }))} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            {preview ? <img src={preview} alt="QR preview" className="w-[180px] h-[180px] rounded-lg border border-soft-peach" /> : <div className="w-[180px] h-[180px]" />}
            <span className="font-body text-[11px] text-earth text-center">Keep strong contrast so it scans reliably.</span>
          </div>
        </div>

        {error && <p className="mt-3 font-body text-[13px] text-rust">{error}</p>}
        <div className="mt-4 flex gap-2 justify-end">
          {draft.editing && (
            <button type="button" onClick={() => setDraft(EMPTY)} className="px-4 py-2 rounded-lg font-body text-[14px] text-earth hover:bg-cream">
              Cancel
            </button>
          )}
          <button
            type="button"
            disabled={saving || !draft.slug || !draft.name.trim()}
            onClick={save}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-deep-brown text-cream font-body font-semibold text-[14px] disabled:opacity-50"
          >
            <QrIcon className="w-4 h-4" /> {saving ? 'Saving…' : draft.editing ? 'Update' : 'Create QR code'}
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-soft-peach p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-display text-[18px] text-deep-brown">Your QR codes</h3>
          <Toggle label="Name under PNG" checked={caption} onChange={setCaption} />
        </div>
        {loading && <p className="font-body text-[13px] text-earth">Loading…</p>}
        {!loading && codes.length === 0 && <p className="font-body text-[13px] text-earth">No QR codes yet.</p>}
        <div className="divide-y divide-soft-peach">
          {codes.map((c) => (
            <QrRow
              key={c.slug}
              code={c}
              onPng={async () => downloadBlob(await renderPng(c, caption), `gingerbros-qr-${c.slug}.png`)}
              onSvg={() => downloadSvg(c)}
              onShare={() => share(c)}
              onCopy={async () => {
                await navigator.clipboard.writeText(SHORT_BASE + c.slug).catch(() => {});
                setFlash('Link copied');
              }}
              onEdit={() => edit(c)}
              onDelete={() => remove(c)}
            />
          ))}
        </div>
      </section>

      {flash && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 px-4 py-2 rounded-full bg-deep-brown text-cream font-body text-sm flex items-center gap-2">
          <Check className="w-4 h-4" /> {flash}
        </div>
      )}
    </div>
  );
}

function QrRow({
  code,
  onPng,
  onSvg,
  onShare,
  onCopy,
  onEdit,
  onDelete,
}: {
  code: QrCodeRow;
  onPng: () => void;
  onSvg: () => void;
  onShare: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [img, setImg] = useState('');
  useEffect(() => {
    QRCode.toDataURL(SHORT_BASE + code.slug, qrOptions(code.fg, code.bg, 160)).then(setImg).catch(() => {});
  }, [code.slug, code.fg, code.bg]);

  const btn = 'flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-body text-[12px] text-deep-brown bg-cream hover:bg-soft-peach';
  return (
    <div className="py-3 flex gap-3">
      {img && <img src={img} alt="" className="w-20 h-20 rounded-md border border-soft-peach shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-body font-semibold text-[15px] text-deep-brown truncate">{code.name}</p>
          <p className="font-body text-[13px] text-earth shrink-0">
            <span className="font-semibold text-deep-brown tabular-nums">{code.scans.toLocaleString()}</span> scans
          </p>
        </div>
        <p className="font-mono text-[12px] text-earth truncate">{SHORT_BASE.replace('https://', '')}{code.slug}</p>
        <p className="font-body text-[12px] text-earth/80 truncate">→ {code.targetUrl}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button type="button" className={btn} onClick={onPng}>
            <Download className="w-3.5 h-3.5" /> PNG
          </button>
          <button type="button" className={btn} onClick={onSvg}>
            <Download className="w-3.5 h-3.5" /> SVG
          </button>
          <button type="button" className={btn} onClick={onShare}>
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button type="button" className={btn} onClick={onCopy}>
            <Copy className="w-3.5 h-3.5" /> Copy link
          </button>
          <button type="button" className={btn} onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button type="button" className={`${btn} !text-rust`} onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
