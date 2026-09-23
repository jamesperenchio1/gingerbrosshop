import { useEffect, useState } from 'react';
import LinkPageView from '@/components/linkpage/LinkPageView';
import { fetchCatalog, type CatalogProduct } from '@/lib/catalog';
import { trackPixelEvent } from '@/lib/metaPixel';
import { DEFAULT_LINKPAGE_CONFIG, LINK_PAGE_URL, sendLinkEvent, type LinkPageConfig } from '@/lib/linkpage';

const CACHE_KEY = 'gb_linkpage_v1';

function readCached(): LinkPageConfig | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as LinkPageConfig) : null;
  } catch {
    return null;
  }
}

/** Public link-in-bio page (link.gingerbrosshop.com and /links). */
export default function LinkPage() {
  // Render instantly from the last-seen config, then refresh. First-time visitors
  // wait for the fetch (falling back to the built-in snapshot if the API fails).
  const [config, setConfig] = useState<LinkPageConfig | null>(() => readCached());
  const [products, setProducts] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    fetch('/api/links')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { config: LinkPageConfig }) => {
        setConfig(data.config);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data.config));
        } catch {
          // storage unavailable — fine, we just won't have a warm start next time
        }
      })
      .catch(() => setConfig((c) => c ?? DEFAULT_LINKPAGE_CONFIG));

    const src = new URLSearchParams(window.location.search).get('src');
    sendLinkEvent({ type: 'view', referrer: document.referrer, src });
  }, []);

  useEffect(() => {
    if (config) document.title = config.seo.title || config.profile.name;
  }, [config]);

  const needsProducts = !!config?.blocks.some((b) => b.type === 'product');
  useEffect(() => {
    if (needsProducts) fetchCatalog().then(setProducts).catch(() => {});
  }, [needsProducts]);

  const onSignup = async (email: string) => {
    try {
      const res = await fetch('/api/links?action=signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) return { ok: false, message: data.error ?? 'Something went wrong. Please try again.' };
      trackPixelEvent('Lead', { content_name: 'linkpage-signup' });
      return { ok: true, message: "You're in! Check your inbox." };
    } catch {
      return { ok: false, message: 'Network error. Please try again.' };
    }
  };

  const pageUrl = window.location.hostname.startsWith('link.') ? `${window.location.origin}/` : LINK_PAGE_URL;

  if (!config) return <div className="min-h-[100dvh]" style={{ backgroundColor: DEFAULT_LINKPAGE_CONFIG.theme.background.color }} />;

  return (
    <LinkPageView
      config={config}
      products={products}
      pageUrl={pageUrl}
      onLinkClick={(blockId) => sendLinkEvent({ type: 'click', blockId })}
      onSignup={onSignup}
    />
  );
}
