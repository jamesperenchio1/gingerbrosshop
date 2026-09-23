import { useRef, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { STARTER_STICKERS, type LinkBlock, type LinkPageConfig, type Sticker } from '@/lib/linkpage';
import { Field, inputClass } from './fields';
import { newId, uploadImage } from './api';

type Props = {
  config: LinkPageConfig;
  onChange: (c: LinkPageConfig) => void;
  token: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

function anchorLabel(id: string, blocks: LinkBlock[]): string {
  if (id === 'header') return 'Profile header';
  if (id === 'socials') return 'Social icons';
  const b = blocks.find((x) => x.id === id);
  if (!b) return id;
  return b.type === 'signup' ? b.headline : b.type === 'product' ? b.title || b.productId : b.title;
}

export default function StickersEditor({ config, onChange, token, selectedId, onSelect }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selected = config.stickers.find((s) => s.id === selectedId) ?? null;

  const add = (imageUrl: string) => {
    const sticker: Sticker = { id: newId('st'), imageUrl, anchor: 'header', x: 0.8, y: 0.3, rotation: 0, scale: 1, zIndex: config.stickers.length };
    onChange({ ...config, stickers: [...config.stickers, sticker] });
    onSelect(sticker.id);
  };

  const patch = (p: Partial<Sticker>) =>
    selected && onChange({ ...config, stickers: config.stickers.map((s) => (s.id === selected.id ? { ...s, ...p } : s)) });

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      add(await uploadImage(token, file, 400));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const anchors = ['header', 'socials', ...config.blocks.map((b) => b.id)];

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-soft-peach p-4">
        <h3 className="font-display text-[18px] text-deep-brown">Add a sticker</h3>
        <p className="font-body text-[13px] text-earth mt-1">Pick one, then drag it around in the preview.</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-3">
          {STARTER_STICKERS.map((s) => (
            <button key={s.url} type="button" onClick={() => add(s.url)} title={s.name} className="aspect-square rounded-lg bg-cream hover:bg-soft-peach p-2 transition-colors">
              <img src={s.url} alt={s.name} className="w-full h-full object-contain" />
            </button>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-soft-peach hover:border-earth flex flex-col items-center justify-center gap-1 font-body text-[11px] text-earth disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            {busy ? '…' : 'Upload'}
          </button>
        </div>
        <p className="font-body text-[12px] text-earth/80 mt-2">Tip: transparent PNGs look best.</p>
        {error && <p className="font-body text-[12px] text-rust mt-1">{error}</p>}
        <input ref={input} type="file" accept="image/png,image/webp,image/gif,image/jpeg" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      </section>

      <section className="bg-white rounded-xl border border-soft-peach p-4">
        <h3 className="font-display text-[18px] text-deep-brown mb-3">On the page</h3>
        {config.stickers.length === 0 && <p className="font-body text-[13px] text-earth">No stickers yet.</p>}
        <div className="flex flex-wrap gap-2">
          {config.stickers.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={`w-14 h-14 rounded-lg p-1.5 bg-cream border-2 ${s.id === selectedId ? 'border-deep-brown' : 'border-transparent'}`}
            >
              <img src={s.imageUrl} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-4 pt-4 border-t border-soft-peach space-y-4">
            <Field label="Attached to" hint="The sticker moves with this part of the page.">
              <select value={selected.anchor} onChange={(e) => patch({ anchor: e.target.value, x: 0.8, y: 0.3 })} className={inputClass}>
                {anchors.map((a) => (
                  <option key={a} value={a}>
                    {anchorLabel(a, config.blocks)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`Size · ${selected.scale.toFixed(2)}×`}>
              <input type="range" min={0.3} max={3} step={0.01} value={selected.scale} onChange={(e) => patch({ scale: Number(e.target.value) })} className="w-full accent-deep-brown" />
            </Field>
            <Field label={`Rotation · ${Math.round(selected.rotation)}°`}>
              <input type="range" min={-180} max={180} step={1} value={selected.rotation} onChange={(e) => patch({ rotation: Number(e.target.value) })} className="w-full accent-deep-brown" />
            </Field>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button type="button" onClick={() => patch({ zIndex: Math.min(50, selected.zIndex + 1) })} className="px-3 py-1.5 rounded-lg bg-cream font-body text-[13px] text-deep-brown">
                  Bring forward
                </button>
                <button type="button" onClick={() => patch({ zIndex: Math.max(0, selected.zIndex - 1) })} className="px-3 py-1.5 rounded-lg bg-cream font-body text-[13px] text-deep-brown">
                  Send back
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange({ ...config, stickers: config.stickers.filter((s) => s.id !== selected.id) });
                  onSelect(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-[13px] text-rust hover:bg-rust/10"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
