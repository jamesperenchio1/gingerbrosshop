import { createHash } from 'crypto';

// Server-side mirror of the client-side Purchase/Subscribe pixel events fired
// from src/pages/OrderSuccess.tsx. Shares the same event_id per order so Meta
// deduplicates the browser and server copies into a single counted event.
// Failures here must never block order saving or email delivery — this is
// fire-and-forget, same as the Resend calls elsewhere in api/webhook.ts.

const PIXEL_ID = '927558480333349';
const capiAccessToken = process.env.META_CAPI_ACCESS_TOKEN;

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

interface OrderForCapi {
  sessionId: string;
  amountTotal: number;
  currency: string;
  mode: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  items: { id: string; quantity: number }[];
}

async function sendCapiEvent(
  eventName: 'Purchase' | 'Subscribe',
  order: OrderForCapi,
  eventUrl: string,
) {
  if (!capiAccessToken) {
    console.warn('[Meta CAPI] META_CAPI_ACCESS_TOKEN not configured — skipping', eventName, order.sessionId);
    return;
  }

  const userData: Record<string, string[]> = {};
  if (order.customerEmail) userData.em = [sha256(order.customerEmail)];
  if (order.customerPhone) userData.ph = [sha256(order.customerPhone.replace(/[^\d]/g, ''))];

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: `${order.sessionId}-${eventName.toLowerCase()}`,
        event_source_url: eventUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: {
          currency: order.currency,
          value: order.amountTotal / 100,
          content_ids: order.items.map((i) => i.id),
          content_type: 'product',
        },
      },
    ],
  };

  try {
    // access_token goes in the body, not the query string, so it doesn't end up in
    // request logs or proxy access logs.
    const res = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, access_token: capiAccessToken }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[Meta CAPI] ${eventName} failed:`, res.status, body);
    }
  } catch (err) {
    console.error(`[Meta CAPI] ${eventName} request error:`, err);
  }
}

export async function sendMetaPurchaseEvents(order: OrderForCapi, eventUrl: string) {
  await sendCapiEvent('Purchase', order, eventUrl);
  if (order.mode === 'subscription') {
    await sendCapiEvent('Subscribe', order, eventUrl);
  }
}
