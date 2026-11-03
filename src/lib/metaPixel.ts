// Thin wrapper around the `fbq` and `gtag` queues bootstrapped in
// `public/analytics.js`. Every Meta event is mirrored to GA4 under its
// recommended ecommerce name, so both tools see the same funnel.
// `eventId` lets a client-side event dedupe against the matching server-side
// Conversions API event fired from api/webhook.ts for the same order.

export type PixelEvent = 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'Subscribe' | 'Lead';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const GA4_NAME: Record<PixelEvent, string> = {
  ViewContent: 'view_item',
  AddToCart: 'add_to_cart',
  InitiateCheckout: 'begin_checkout',
  Purchase: 'purchase',
  Subscribe: 'sign_up',
  Lead: 'generate_lead',
};

function trackGa4(name: PixelEvent, params: Record<string, unknown> = {}, eventId?: string): void {
  if (typeof window.gtag !== 'function') return;
  // Prefer Meta's `contents` (id, quantity, item_price) so GA4 gets real
  // quantities and unit prices; fall back to bare ids.
  type Content = { id: string; quantity?: number; item_price?: number; name?: string };
  const contents: Content[] = Array.isArray(params.contents)
    ? (params.contents as Content[])
    : (Array.isArray(params.content_ids) ? (params.content_ids as string[]) : []).map((id) => ({ id }));
  window.gtag('event', GA4_NAME[name], {
    currency: params.currency ? String(params.currency).toUpperCase() : 'THB',
    value: params.value,
    ...(name === 'Purchase' && eventId ? { transaction_id: eventId.replace(/-purchase$/, '') } : {}),
    items: contents.map((c) => ({
      item_id: c.id,
      item_name: c.name ?? (contents.length === 1 ? (params.content_name as string | undefined) : undefined) ?? c.id,
      ...(c.quantity != null ? { quantity: c.quantity } : {}),
      ...(c.item_price != null ? { price: c.item_price } : {}),
    })),
  });
}

/** Virtual page view for in-app (client-side) navigation. */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined') return;
  window.fbq?.('track', 'PageView');
  window.gtag?.('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
}

export function trackPixelEvent(name: PixelEvent, params?: Record<string, unknown>, eventId?: string): void {
  if (typeof window === 'undefined') return;
  trackGa4(name, params, eventId);
  if (typeof window.fbq !== 'function') return;
  if (eventId) {
    window.fbq('track', name, params ?? {}, { eventID: eventId });
  } else {
    window.fbq('track', name, params ?? {});
  }
}
