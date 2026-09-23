import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Link2, ExternalLink, Download, RotateCcw, Smartphone } from 'lucide-react';
import LinkPageView from '@/components/linkpage/LinkPageView';
import BlocksEditor from '@/components/linkpage/admin/BlocksEditor';
import AppearanceEditor from '@/components/linkpage/admin/AppearanceEditor';
import StickersEditor from '@/components/linkpage/admin/StickersEditor';
import QrCodes from '@/components/linkpage/admin/QrCodes';
import Analytics from '@/components/linkpage/admin/Analytics';
import { adminApi, AdminApiError, TOKEN_KEY } from '@/components/linkpage/admin/api';
import { fetchCatalog, type CatalogProduct } from '@/lib/catalog';
import { LINK_PAGE_URL, publicView, type LinkPageConfig } from '@/lib/linkpage';

type Tab = 'links' | 'appearance' | 'stickers' | 'qr' | 'analytics' | 'signups' | 'history';
const TABS: { id: Tab; label: string }[] = [
  { id: 'links', label: 'Links' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'stickers', label: 'Stickers' },
  { id: 'qr', label: 'QR codes' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'signups', label: 'Signups' },
  { id: 'history', label: 'History' },
];

interface HistoryEntry {
  savedAt: string;
  config: LinkPageConfig;
}

export default function AdminLinks() {
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [authError, setAuthError] = useState('');

  const [saved, setSaved] = useState<LinkPageConfig | null>(null);
  const [draft, setDraft] = useState<LinkPageConfig | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [tab, setTab] = useState<Tab>('links');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const load = useCallback(
    (t: string) => {
      setAuthError('');
      adminApi<{ config: LinkPageConfig; history: HistoryEntry[] }>(t, { query: 'view=config' })
        .then((d) => {
          setSaved(d.config);
          setDraft(d.config);
          setHistory(d.history);
          try {
            sessionStorage.setItem(TOKEN_KEY, t);
          } catch {
            // ignore
          }
        })
        .catch((e: Error) => {
          if (e instanceof AdminApiError && e.status === 401) {
            setToken('');
            setAuthError('Wrong admin secret.');
          } else {
            setAuthError(e.message);
          }
        });
    },
    [],
  );

  useEffect(() => {
    if (token) load(token);
  }, [token, load]);

  useEffect(() => {
    fetchCatalog().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(t);
  }, [message]);

  const dirty = useMemo(() => !!draft && !!saved && JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const d = await adminApi<{ config: LinkPageConfig; history: HistoryEntry[] }>(token, { method: 'PUT', body: { config: draft } });
      setSaved(d.config);
      setDraft(d.config);
      setHistory(d.history);
      setMessage({ kind: 'ok', text: 'Published. Live within ~30 seconds.' });
    } catch (e) {
      setMessage({ kind: 'error', text: e instanceof Error ? e.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const revert = async (index: number) => {
    if (!confirm('Restore this version? Your current page is kept in History.')) return;
    try {
      const d = await adminApi<{ config: LinkPageConfig; history: HistoryEntry[] }>(token, { method: 'POST', body: { action: 'revert', index } });
      setSaved(d.config);
      setDraft(d.config);
      setHistory(d.history);
      setMessage({ kind: 'ok', text: 'Version restored and published.' });
    } catch (e) {
      setMessage({ kind: 'error', text: e instanceof Error ? e.message : 'Restore failed' });
    }
  };

  if (!token || !draft) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center px-6">
        <form
          className="w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            setToken(tokenInput.trim());
          }}
        >
          <div className="text-center mb-6">
            <Link2 className="w-10 h-10 text-deep-brown mx-auto mb-3" />
            <h1 className="font-display text-2xl text-deep-brown">Link page editor</h1>
            <p className="font-body text-earth text-sm">{token && !authError ? 'Loading…' : 'Enter your admin secret.'}</p>
          </div>
          {(!token || authError) && (
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Admin secret"
                autoFocus
                className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-3 pr-12 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
              />
              <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth hover:text-deep-brown">
                {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          )}
          {authError && <p className="mt-3 font-body text-[13px] text-rust text-center">{authError}</p>}
        </form>
      </div>
    );
  }

  // Preview what visitors will see right now (hidden/scheduled-out links removed),
  // except on the Links tab where it helps to see everything you're editing.
  const previewConfig = tab === 'links' ? { ...draft, blocks: draft.blocks.filter((b) => b.enabled) } : publicView(draft);

  const preview = (
    <div className="w-[375px] max-w-full h-[760px] max-h-[calc(100vh-120px)] rounded-[44px] border-[10px] border-deep-brown bg-deep-brown shadow-panel overflow-hidden">
      <div className="w-full h-full overflow-y-auto rounded-[34px] overscroll-contain" style={{ backgroundColor: draft.theme.background.color }}>
        <LinkPageView
          config={previewConfig}
          products={products}
          pageUrl={LINK_PAGE_URL}
          preview
          onSignup={async () => ({ ok: true, message: 'Preview only' })}
          editStickers={tab === 'stickers'}
          selectedStickerId={selectedSticker}
          onStickerSelect={setSelectedSticker}
          onStickerMove={(id, x, y) =>
            setDraft((d) => (d ? { ...d, stickers: d.stickers.map((s) => (s.id === id ? { ...s, x, y } : s)) } : d))
          }
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-warm-white/95 backdrop-blur border-b border-soft-peach">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link2 className="w-5 h-5 text-deep-brown" />
          <h1 className="font-display text-[20px] text-deep-brown">Link page</h1>
          <a
            href={LINK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 font-body text-[13px] text-earth hover:text-deep-brown"
          >
            {LINK_PAGE_URL.replace('https://', '')} <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <div className="ml-auto flex items-center gap-2">
            {dirty && (
              <button type="button" onClick={() => setDraft(saved)} className="px-3 py-2 rounded-lg font-body text-[13px] text-earth hover:bg-cream">
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="px-4 py-2 rounded-lg bg-deep-brown text-cream font-body font-semibold text-[14px] disabled:opacity-40 hover:bg-earth transition-colors"
            >
              {saving ? 'Publishing…' : dirty ? 'Publish' : 'Published'}
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto pb-2 -mb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 rounded-lg font-body text-[14px] whitespace-nowrap ${
                tab === t.id ? 'bg-deep-brown text-cream' : 'text-deep-brown hover:bg-cream'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[1fr_395px] gap-8 items-start">
        <main className="min-w-0">
          {tab === 'links' && <BlocksEditor blocks={draft.blocks} onChange={(blocks) => setDraft({ ...draft, blocks })} products={products} token={token} />}
          {tab === 'appearance' && <AppearanceEditor config={draft} onChange={setDraft} token={token} />}
          {tab === 'stickers' && (
            <StickersEditor config={draft} onChange={setDraft} token={token} selectedId={selectedSticker} onSelect={setSelectedSticker} />
          )}
          {tab === 'qr' && <QrCodes token={token} blocks={draft.blocks} />}
          {tab === 'analytics' && <Analytics token={token} blocks={draft.blocks} />}
          {tab === 'signups' && <Signups token={token} />}
          {tab === 'history' && <History history={history} onRevert={revert} />}
        </main>

        <aside className="hidden lg:flex sticky top-[120px] justify-center">{preview}</aside>
      </div>

      {/* Phone/tablet: preview as an overlay */}
      <button
        type="button"
        onClick={() => setShowPreview(true)}
        className="lg:hidden fixed bottom-5 right-5 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-deep-brown text-cream font-body font-semibold text-[14px] shadow-panel"
      >
        <Smartphone className="w-4 h-4" /> Preview
      </button>
      {showPreview && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 flex flex-col items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div onClick={(e) => e.stopPropagation()}>{preview}</div>
          <button type="button" onClick={() => setShowPreview(false)} className="mt-3 px-4 py-2 rounded-full bg-white font-body text-[14px]">
            Close preview
          </button>
        </div>
      )}

      {message && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-50 px-4 py-2.5 rounded-full font-body text-sm shadow-panel ${
            message.kind === 'ok' ? 'bg-deep-brown text-cream' : 'bg-rust text-white'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

function Signups({ token }: { token: string }) {
  const [rows, setRows] = useState<{ email: string; signedUpAt: string }[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi<{ signups: { email: string; signedUpAt: string }[] }>(token, { query: 'view=signups' })
      .then((d) => setRows(d.signups))
      .catch((e: Error) => setError(e.message));
  }, [token]);

  const exportCsv = () => {
    if (!rows) return;
    const csv = ['email,signed_up_at', ...rows.map((r) => `${r.email},${r.signedUpAt}`)].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `gingerbros-link-signups-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <section className="bg-white rounded-xl border border-soft-peach p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[18px] text-deep-brown">
          Email signups {rows && <span className="font-body text-[14px] text-earth">({rows.length})</span>}
        </h3>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!rows?.length}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream font-body text-[13px] text-deep-brown disabled:opacity-40"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
      <p className="font-body text-[13px] text-earth mb-3">
        People who subscribed from the link page. They're also added to the Resend newsletter audience and get the welcome code.
      </p>
      {error && <p className="font-body text-[13px] text-rust">{error}</p>}
      {rows && rows.length === 0 && <p className="font-body text-[13px] text-earth">No signups yet. Add an “Email signup” block on the Links tab, or use the Subscribe button.</p>}
      {rows && rows.length > 0 && (
        <table className="w-full font-body text-[14px]">
          <tbody className="divide-y divide-soft-peach">
            {rows.map((r) => (
              <tr key={r.email}>
                <td className="py-2 text-deep-brown">{r.email}</td>
                <td className="py-2 text-earth text-right tabular-nums">{new Date(r.signedUpAt).toLocaleString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function History({ history, onRevert }: { history: HistoryEntry[]; onRevert: (index: number) => void }) {
  return (
    <section className="bg-white rounded-xl border border-soft-peach p-4">
      <h3 className="font-display text-[18px] text-deep-brown">Previous versions</h3>
      <p className="font-body text-[13px] text-earth mt-1 mb-3">Each publish keeps the version it replaced (last 10).</p>
      {history.length === 0 && <p className="font-body text-[13px] text-earth">Nothing yet. Versions appear after your first publish.</p>}
      <ul className="divide-y divide-soft-peach">
        {history.map((h, i) => (
          <li key={h.savedAt + i} className="py-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-body text-[14px] text-deep-brown">Replaced {new Date(h.savedAt).toLocaleString('en-GB')}</p>
              <p className="font-body text-[12px] text-earth">
                {h.config.blocks.length} links · {h.config.stickers.length} stickers
              </p>
            </div>
            <button type="button" onClick={() => onRevert(i)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream font-body text-[13px] text-deep-brown">
              <RotateCcw className="w-4 h-4" /> Restore
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
