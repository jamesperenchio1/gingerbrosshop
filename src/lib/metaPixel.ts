// Thin wrapper around the `fbq` queue bootstrapped in `public/analytics.js`.
// `eventId` lets a client-side event dedupe against the matching server-side
// Conversions API event fired from api/webhook.ts for the same order.

export type PixelEvent = 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'Subscribe' | 'Lead';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackPixelEvent(name: PixelEvent, params?: Record<string, unknown>, eventId?: string): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  if (eventId) {
    window.fbq('track', name, params ?? {}, { eventID: eventId });
  } else {
    window.fbq('track', name, params ?? {});
  }
}
