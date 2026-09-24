import { useCallback, useEffect, useRef, useState } from 'react';
import { Archive, ImagePlus, Package, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import {
  adminApi,
  baht,
  type AdminPrice,
  type AdminProduct,
  type ProductListResponse,
} from './api';
import ConfirmActionDialog from './ConfirmActionDialog';

async function compressImage(file: File, maxSize = 1200): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load image'));
    image.src = dataUrl;
  });
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/webp', 0.85);
}

const METADATA_FIELDS: Array<{ key: string; label: string; placeholder?: string }> = [
  { key: 'app_id', label: 'App ID', placeholder: 'ginger-fizz' },
  { key: 'category', label: 'Category', placeholder: 'drinks' },
  { key: 'badge', label: 'Badge', placeholder: 'Best seller' },
  { key: 'badge_color', label: 'Badge colour', placeholder: 'bg-accent-green' },
  { key: 'short_description', label: 'Short description' },
];

export default function ProductsTab() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(
    async (opts: { reset?: boolean; cursor?: string | null } = {}) => {
      setLoading(true);
      setError('');
      try {
        const res = await adminApi<ProductListResponse>({
          resource: 'products',
          action: 'list',
          query: {
            limit: 25,
            search: search.trim() || undefined,
            cursor: opts.reset ? undefined : opts.cursor ?? undefined,
          },
        });
        setProducts((prev) => (opts.reset ? res.products : [...prev, ...res.products]));
        setHasMore(res.hasMore);
        setCursor(res.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load({ reset: true });
        }}
        className="flex flex-wrap items-center gap-2 mb-4"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-earth/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or app ID"
            className="w-full bg-cream border border-soft-peach rounded-lg pl-9 pr-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-rust text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-deep-brown transition-colors"
        >
          <Plus className="w-4 h-4" /> New product
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-deep-brown text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-rust transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </form>

      {error && <p className="mb-4 font-body text-[13px] text-rust">{error}</p>}

      {!loading && products.length === 0 && !error && (
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-earth/30 mx-auto mb-3" />
          <p className="font-body text-earth">No products found.</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="bg-cream rounded-2xl overflow-hidden">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => setSelectedId(product.id)}
              className="w-full text-left px-5 py-4 border-b border-soft-peach/50 last:border-0 hover:bg-warm-white/60 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-warm-white border border-soft-peach/60 overflow-hidden shrink-0 flex items-center justify-center">
                {product.images[0] ? (
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-5 h-5 text-earth/30" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-deep-brown truncate">{product.name}</span>
                  {!product.active && (
                    <span className="text-[11px] font-body px-2 py-0.5 rounded-full bg-earth/15 text-earth">
                      Archived
                    </span>
                  )}
                  {product.hidden && (
                    <span className="text-[11px] font-body px-2 py-0.5 rounded-full bg-deep-brown/10 text-earth">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="font-body text-[13px] text-earth/80 mt-0.5 truncate">
                  {product.appId ?? '—'}
                  {product.category ? ` · ${product.category}` : ''} · {product.prices.length}{' '}
                  {product.prices.length === 1 ? 'price' : 'prices'}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-body text-sm text-deep-brown">
                  {product.prices[0] ? baht(product.prices[0].unitAmount) : '—'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={() => load({ cursor })}
            disabled={loading}
            className="font-body text-sm text-deep-brown hover:text-rust underline disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {selectedId && (
        <ProductDetailPanel
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => load({ reset: true })}
        />
      )}
      {creating && (
        <CreateProductPanel
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            load({ reset: true });
          }}
        />
      )}
    </div>
  );
}

function ProductDetailPanel({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [hidden, setHidden] = useState(false);

  const [priceOpen, setPriceOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { product } = await adminApi<{ product: AdminProduct }>({
        resource: 'products',
        action: 'get',
        query: { id },
      });
      setDetail(product);
      setName(product.name);
      setDescription(product.description ?? '');
      setImages(product.images);
      setMetadata(product.metadata);
      setHidden(product.hidden);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function onPickImage(file: File) {
    setBusy(true);
    setError('');
    try {
      const dataUrl = await compressImage(file);
      const { url } = await adminApi<{ url: string }>({
        resource: 'products',
        method: 'POST',
        body: { action: 'upload', dataUrl },
      });
      setImages((prev) => [...prev, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function save() {
    if (!detail) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const nextMetadata = { ...metadata };
      if (hidden) nextMetadata.hidden = 'true';
      else delete nextMetadata.hidden;
      await adminApi({
        resource: 'products',
        method: 'POST',
        body: {
          action: 'update',
          id,
          name,
          description: description || null,
          images,
          metadata: nextMetadata,
        },
      });
      setMessage('Saved.');
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(active: boolean) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await adminApi({ resource: 'products', method: 'POST', body: { action: 'update', id, active } });
      setMessage(active ? 'Product restored.' : 'Product archived.');
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  async function setPriceActive(price: AdminPrice, active: boolean) {
    setBusy(true);
    setError('');
    try {
      await adminApi({
        resource: 'products',
        method: 'POST',
        body: { action: 'update-price', id: price.id, active },
      });
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-xl h-full bg-warm-white overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-warm-white border-b border-soft-peach/60 px-5 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-deep-brown truncate">
            {detail?.name ?? 'Product'}
          </h2>
          <button onClick={onClose} className="p-2 text-earth hover:text-deep-brown">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
          </div>
        ) : !detail ? (
          <p className="px-5 py-6 font-body text-[13px] text-rust">{error || 'Not found'}</p>
        ) : (
          <div className="px-5 py-5 space-y-5">
            {error && <p className="font-body text-[13px] text-rust">{error}</p>}
            {message && <p className="font-body text-[13px] text-accent-green">{message}</p>}

            <section className="bg-cream rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-deep-brown">Details</h3>
                <span className="font-body text-[11px] text-earth/70">{detail.id}</span>
              </div>
              <label className="block">
                <span className="font-body text-[13px] text-earth">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
                />
              </label>
              <label className="block">
                <span className="font-body text-[13px] text-earth">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30 resize-y"
                />
              </label>
              <label className="flex items-center gap-2 font-body text-[13px] text-deep-brown">
                <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
                Hide from storefront
              </label>
            </section>

            <section className="bg-cream rounded-2xl p-4 space-y-3">
              <h3 className="font-display text-deep-brown">Images</h3>
              <div className="flex flex-wrap gap-2">
                {images.map((src) => (
                  <div
                    key={src}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-soft-peach/60 group"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((s) => s !== src))}
                      className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-lg border border-dashed border-soft-peach flex flex-col items-center justify-center gap-1 text-earth hover:text-deep-brown hover:border-rust/50 transition-colors disabled:opacity-50"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="font-body text-[11px]">Add</span>
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onPickImage(file);
                }}
              />
            </section>

            <section className="bg-cream rounded-2xl p-4 space-y-3">
              <h3 className="font-display text-deep-brown">Metadata</h3>
              {METADATA_FIELDS.map((field) => (
                <label key={field.key} className="block">
                  <span className="font-body text-[13px] text-earth">{field.label}</span>
                  <input
                    value={metadata[field.key] ?? ''}
                    onChange={(e) =>
                      setMetadata((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
                  />
                </label>
              ))}
            </section>

            <div className="flex items-center gap-2">
              <button
                onClick={save}
                disabled={busy}
                className="font-body text-sm px-4 py-2 rounded-lg bg-rust text-cream hover:bg-deep-brown disabled:opacity-50"
              >
                Save changes
              </button>
              <button
                onClick={() => toggleActive(!detail.active)}
                disabled={busy}
                className="font-body text-sm px-4 py-2 rounded-lg text-earth hover:text-deep-brown disabled:opacity-50"
              >
                {detail.active ? 'Archive' : 'Restore'}
              </button>
            </div>

            <section className="bg-cream rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-deep-brown">Prices</h3>
                <button
                  onClick={() => setPriceOpen(true)}
                  className="flex items-center gap-1 font-body text-[13px] text-rust hover:text-deep-brown"
                >
                  <Plus className="w-3.5 h-3.5" /> Add price
                </button>
              </div>
              {detail.prices.length === 0 && (
                <p className="font-body text-[13px] text-earth/70">No prices yet.</p>
              )}
              <div className="space-y-2">
                {detail.prices.map((price) => (
                  <div
                    key={price.id}
                    className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2 border border-soft-peach/50"
                  >
                    <div className="min-w-0">
                      <div className="font-body text-sm text-deep-brown">
                        {baht(price.unitAmount)}{' '}
                        {price.type === 'recurring' && price.recurring
                          ? `/ ${price.recurring.intervalCount > 1 ? `${price.recurring.intervalCount} ` : ''}${price.recurring.interval}`
                          : ''}
                      </div>
                      <div className="font-body text-[12px] text-earth/70 truncate">
                        {price.nickname ?? price.type}
                        {!price.active ? ' · inactive' : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <CopyButton value={price.id} />
                      <button
                        onClick={() => setPriceActive(price, !price.active)}
                        disabled={busy}
                        className="font-body text-[12px] text-earth hover:text-deep-brown disabled:opacity-50"
                      >
                        {price.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-cream rounded-2xl p-4">
              <button
                onClick={() => setArchiveOpen(true)}
                disabled={busy}
                className="flex items-center gap-2 font-body text-sm text-rust hover:text-deep-brown disabled:opacity-50"
              >
                <Archive className="w-4 h-4" /> Archive product
              </button>
            </section>
          </div>
        )}
      </div>

      {priceOpen && (
        <AddPricePanel
          productId={id}
          onClose={() => setPriceOpen(false)}
          onCreated={async () => {
            setPriceOpen(false);
            await load();
            onChanged();
          }}
        />
      )}

      {archiveOpen && (
        <ConfirmActionDialog
          title="Archive product"
          description="The product will be set inactive and hidden from the storefront."
          confirmPhrase={detail?.name ?? ''}
          requireReason
          busy={busy}
          confirmLabel="Archive"
          onCancel={() => setArchiveOpen(false)}
          onConfirm={async ({ confirm, reason }) => {
            setBusy(true);
            setError('');
            try {
              await adminApi({
                resource: 'products',
                method: 'POST',
                body: { action: 'archive', id, confirm, reason },
              });
              setArchiveOpen(false);
              setMessage('Product archived.');
              await load();
              onChanged();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Archive failed');
              setArchiveOpen(false);
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
    </div>
  );
}

function AddPricePanel({
  productId,
  onClose,
  onCreated,
}: {
  productId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [unitAmount, setUnitAmount] = useState('');
  const [nickname, setNickname] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [interval, setInterval] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [intervalCount, setIntervalCount] = useState('1');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    const satang = Math.round(Number(unitAmount) * 100);
    if (!Number.isFinite(satang) || satang <= 0) {
      setError('Enter a price greater than 0.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await adminApi({
        resource: 'products',
        method: 'POST',
        body: {
          action: 'create-price',
          productId,
          unitAmount: satang,
          nickname: nickname || null,
          recurring: recurring
            ? { interval, intervalCount: Number(intervalCount) || 1 }
            : null,
        },
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create price');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-warm-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-display text-lg text-deep-brown mb-4">Add price</h3>
        {error && <p className="mb-3 font-body text-[13px] text-rust">{error}</p>}
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Amount (THB)</span>
          <input
            value={unitAmount}
            onChange={(e) => setUnitAmount(e.target.value)}
            inputMode="decimal"
            placeholder="140"
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </label>
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Nickname (optional)</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Single bottle"
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </label>
        <label className="flex items-center gap-2 font-body text-[13px] text-deep-brown mb-3">
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          Recurring (subscription)
        </label>
        {recurring && (
          <div className="flex items-center gap-2 mb-3">
            <span className="font-body text-[13px] text-earth">Every</span>
            <input
              value={intervalCount}
              onChange={(e) => setIntervalCount(e.target.value)}
              inputMode="numeric"
              className="w-16 bg-white border border-soft-peach rounded-lg px-2 py-1.5 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
            />
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value as typeof interval)}
              className="bg-white border border-soft-peach rounded-lg px-2 py-1.5 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
            >
              <option value="day">day</option>
              <option value="week">week</option>
              <option value="month">month</option>
              <option value="year">year</option>
            </select>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="font-body text-sm px-4 py-2 rounded-lg text-earth hover:text-deep-brown"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="font-body text-sm px-4 py-2 rounded-lg bg-rust text-cream hover:bg-deep-brown disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create price'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateProductPanel({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [appId, setAppId] = useState('');
  const [category, setCategory] = useState('drinks');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!name.trim()) {
      setError('Enter a product name.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const metadata: Record<string, string> = {};
      if (appId.trim()) metadata.app_id = appId.trim();
      if (category.trim()) metadata.category = category.trim();
      await adminApi({
        resource: 'products',
        method: 'POST',
        body: {
          action: 'create',
          name: name.trim(),
          description: description.trim() || null,
          metadata,
        },
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create product');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-warm-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-display text-lg text-deep-brown mb-4">New product</h3>
        {error && <p className="mb-3 font-body text-[13px] text-rust">{error}</p>}
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </label>
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">App ID</span>
          <input
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            placeholder="ginger-fizz"
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </label>
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Category</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </label>
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30 resize-y"
          />
        </label>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="font-body text-sm px-4 py-2 rounded-lg text-earth hover:text-deep-brown"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="font-body text-sm px-4 py-2 rounded-lg bg-rust text-cream hover:bg-deep-brown disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create product'}
          </button>
        </div>
      </div>
    </div>
  );
}
