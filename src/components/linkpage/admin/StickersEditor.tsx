import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Trash2, Upload } from 'lucide-react';
import {
  FLUENT_STYLES,
  MAX_STICKERS,
  STICKER_SOURCES,
  emojitwoSticker,
  fluentSticker,
  notoSticker,
  parseFluentSticker,
  stickerThumb,
  twemojiSticker,
  type FluentStyle,
  type LinkBlock,
  type LinkPageConfig,
  type Sticker,
  type StickerSource,
} from '@/lib/linkpage';
import { Field, Toggle, inputClass } from './fields';
import { newId, uploadImage } from './api';

type Props = {
  config: LinkPageConfig;
  onChange: (c: LinkPageConfig) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

interface LibraryItem {
  name: string;
  keywords: string;
  url: string;
  source: StickerSource;
  codepoint: string;
  style?: FluentStyle;
}

// Shown before you search: good fits for a drinks brand (resolved by codepoint).
const FEATURED = ['1fada', '1f431', '1f446', '1f6d2', '1f34e', '1f379', '2728', '1f525', '1f929', '1f389', '1f37e', '1f34b', '2764_fe0f', '1f31f', '1f4af', '1f381', '1f4e3', '1f449', '1f60d', '1f680', '1f60b'];

const SOURCE_ORDER = Object.keys(STICKER_SOURCES) as StickerSource[];

/** Load one source's index and turn its rows into picker items. */
async function loadSource(source: StickerSource): Promise<LibraryItem[]> {
  const src = STICKER_SOURCES[source];
  const res = await fetch(src.indexUrl);
  if (!res.ok) throw new Error(`Failed to load ${src.label}`);
  const data = (await res.json()) as { items: Record<string, string>[] };
  return data.items.map((i) => {
    const name = i.n ?? '';
    const item: LibraryItem = {
      name,
      keywords: `${name} ${i.k ?? ''}`.toLowerCase(),
      url: '',
      source,
      codepoint: i.c ?? '',
    };
    if (source === 'noto') item.url = notoSticker(i.c);
    else if (source === 'fluent') {
      item.url = fluentSticker(i.name, i.snake, '3d');
      item.style = '3d';
    } else if (source === 'twemoji') item.url = twemojiSticker(i.c);
    else item.url = emojitwoSticker(i.c);
    return item;
  });
}

let libraryCache: Promise<LibraryItem[]> | null = null;
function loadLibrary(): Promise<LibraryItem[]> {
  libraryCache ??= Promise.allSettled(SOURCE_ORDER.map(loadSource)).then((settled) => {
    // One source failing shouldn't take the whole picker down.
    const items = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
    if (items.length === 0) throw new Error('Could not load the sticker library.');
    return items;
  });
  return libraryCache;
}

/** Round-robin across sources so one style doesn't fill the whole first screen. */
function interleaveBySource(items: LibraryItem[]): LibraryItem[] {
  const buckets = new Map<StickerSource, LibraryItem[]>();
  for (const it of items) {
    const b = buckets.get(it.source);
    if (b) b.push(it);
    else buckets.set(it.source, [it]);
  }
  const order = SOURCE_ORDER.filter((s) => buckets.has(s));
  const out: LibraryItem[] = [];
  for (let more = true; more; ) {
    more = false;
    for (const s of order) {
      const b = buckets.get(s)!;
      const next = b.shift();
      if (next) {
        out.push(next);
        more = true;
      }
    }
  }
  return out;
}

function anchorLabel(id: string, blocks: LinkBlock[]): string {
  if (id === 'header') return 'Profile header';
  if (id === 'socials') return 'Social icons';
  const b = blocks.find((x) => x.id === id);
  if (!b) return id;
  return b.type === 'signup' ? b.headline : b.type === 'product' ? b.title || b.productId : b.title;
}

export default function StickersEditor({ config, onChange, selectedId, onSelect }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selected = config.stickers.find((s) => s.id === selectedId) ?? null;
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadLibrary()
      .then(setLibrary)
      .catch(() => setError('Could not load the sticker library.'));
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // One starter sticker per codepoint, preferring the animated Noto art.
      const byCodepoint = new Map<string, LibraryItem>();
      for (const item of library) {
        const existing = byCodepoint.get(item.codepoint);
        if (!existing || SOURCE_ORDER.indexOf(item.source) < SOURCE_ORDER.indexOf(existing.source)) {
          byCodepoint.set(item.codepoint, item);
        }
      }
      return FEATURED.map((c) => byCodepoint.get(c)).filter((i): i is LibraryItem => !!i);
    }
    return interleaveBySource(library.filter((i) => i.keywords.includes(q))).slice(0, 120);
  }, [library, query]);

  const add = (imageUrl: string) => {
    if (config.stickers.length >= MAX_STICKERS) {
      setError(`You can add up to ${MAX_STICKERS} stickers.`);
      return;
    }
    const sticker: Sticker = { id: newId('st'), imageUrl, anchor: 'header', x: 0.8, y: 0.3, rotation: 0, scale: 1, zIndex: config.stickers.length, outline: true };
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
      add(await uploadImage(file, 400));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const anchors = ['header', 'socials', ...config.blocks.map((b) => b.id)];
  const fluent = selected ? parseFluentSticker(selected.imageUrl) : null;
  const atCap = config.stickers.length >= MAX_STICKERS;

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-soft-peach p-4">
        <h3 className="font-display text-[18px] text-deep-brown">Add a sticker</h3>
        <p className="font-body text-[13px] text-earth mt-1">Search 4,600+ free stickers, pick one, then drag it around in the preview.</p>
        <div className="relative mt-3">
          <Search className="w-4 h-4 text-earth absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: cat, lemon, fire, heart…"
            className={`${inputClass} pl-9`}
          />
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mt-3 max-h-[320px] overflow-y-auto pr-1">
          <button
            type="button"
            disabled={busy || atCap}
            onClick={() => input.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-soft-peach hover:border-earth flex flex-col items-center justify-center gap-1 font-body text-[11px] text-earth disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            {busy ? '…' : 'Upload'}
          </button>
          {results.map((s) => (
            <button
              key={s.url}
              type="button"
              disabled={atCap}
              onClick={() => add(s.url)}
              title={`${s.name} · ${STICKER_SOURCES[s.source].label}`}
              className="aspect-square rounded-lg bg-cream hover:bg-soft-peach p-1.5 transition-colors disabled:opacity-40 disabled:hover:bg-cream"
            >
              <img src={stickerThumb(s.url)} alt={s.name} loading="lazy" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
        {query && results.length === 0 && library.length > 0 && <p className="font-body text-[13px] text-earth mt-2">No stickers match “{query}”.</p>}
        <p className="font-body text-[12px] text-earth mt-2">
          {config.stickers.length}/{MAX_STICKERS} stickers on this page{atCap ? '. Remove one to add another.' : '.'}
        </p>
        <p className="font-body text-[11px] text-earth/80 mt-2">
          Free for commercial use, from{' '}
          <a href="https://googlefonts.github.io/noto-emoji-animation/" target="_blank" rel="noopener noreferrer" className="underline">
            Google Noto
          </a>
          ,{' '}
          <a href="https://github.com/microsoft/fluentui-emoji" target="_blank" rel="noopener noreferrer" className="underline">
            Microsoft Fluent
          </a>
          ,{' '}
          <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noopener noreferrer" className="underline">
            Twemoji
          </a>{' '}
          and{' '}
          <a href="https://github.com/EmojiTwo/emojitwo" target="_blank" rel="noopener noreferrer" className="underline">
            EmojiTwo
          </a>
          . The page shows the credit automatically. You can also upload your own transparent PNGs.
        </p>
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
              <img src={stickerThumb(s.imageUrl)} alt="" className="w-full h-full object-contain" />
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
            {fluent && (
              <Field label="Fluent style">
                <div className="flex gap-2">
                  {(Object.keys(FLUENT_STYLES) as FluentStyle[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => patch({ imageUrl: fluentSticker(fluent.name, fluent.snake, st) })}
                      className={`px-3 py-1.5 rounded-lg font-body text-[13px] ${
                        fluent.style === st ? 'bg-deep-brown text-white' : 'bg-cream text-deep-brown'
                      }`}
                    >
                      {FLUENT_STYLES[st].label}
                    </button>
                  ))}
                </div>
              </Field>
            )}
            <Toggle label="White sticker border" checked={selected.outline} onChange={(outline) => patch({ outline })} />
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
