/**
 * Server-side PostHog capture.
 *
 * Vercel freezes a function as soon as the response is sent, so a background
 * flush is not reliable. Each capture creates a short-lived client, sends the
 * event and shuts it down (PostHog's documented serverless pattern), racing a
 * timeout so analytics can never hold up a customer-facing request.
 *
 * Env:
 *  - `POSTHOG_API_KEY` project key (`phc_...`) — server-side twin of VITE_POSTHOG_KEY
 *  - `POSTHOG_HOST`    defaults to US cloud
 */

import { PostHog } from 'posthog-node';

const KEY = process.env.POSTHOG_API_KEY;
const HOST = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';
const TIMEOUT_MS = 1500;

export type ServerEventProperties = Record<string, unknown>;

/**
 * Capture one server-side event. Always resolves; never throws, so callers can
 * `await` it inline in a handler without a try/catch.
 */
export async function captureServerEvent(
  event: string,
  distinctId: string,
  properties: ServerEventProperties = {},
): Promise<void> {
  if (!KEY || !distinctId) return;

  const client = new PostHog(KEY, {
    host: HOST,
    flushAt: 1,
    flushInterval: 0,
    requestTimeout: TIMEOUT_MS,
  });

  const send = (async () => {
    client.capture({ distinctId, event, properties });
    await client.shutdown();
  })().catch(() => {});

  await Promise.race([
    send,
    new Promise<void>((resolve) => setTimeout(resolve, TIMEOUT_MS)),
  ]);
}

/** Fire-and-forget variant for non-critical paths. */
export function captureServerEventSoon(
  event: string,
  distinctId: string,
  properties: ServerEventProperties = {},
): void {
  void captureServerEvent(event, distinctId, properties);
}

/**
 * Build a stable anonymous id from the request when no email is known yet.
 * Hashed so raw IPs never reach PostHog.
 */
export function anonymousId(req: { headers?: Record<string, string | string[] | undefined> }, prefix = 'anon'): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || 'unknown';
  let hash = 0;
  for (let i = 0; i < ip.length; i += 1) {
    hash = (hash * 31 + ip.charCodeAt(i)) | 0;
  }
  return `${prefix}:${Math.abs(hash).toString(36)}`;
}

/**
 * Report a server-side exception to PostHog Error Tracking. Fire-and-forget:
 * a failing analytics call must never mask the real error.
 */
export function captureServerException(
  error: unknown,
  distinctId: string,
  properties: ServerEventProperties = {},
): void {
  if (!KEY) return;
  const err = error instanceof Error ? error : new Error(String(error));
  const frames = (err.stack ?? '')
    .split('\n')
    .slice(1, 25)
    .map((line) => ({ platform: 'custom', raw: line.trim() }));

  captureServerEventSoon('$exception', distinctId || 'server', {
    ...properties,
    $exception_level: 'error',
    $exception_list: [
      {
        type: err.name || 'Error',
        value: err.message,
        mechanism: { handled: false, synthetic: false },
        stacktrace: { type: 'raw', frames },
      },
    ],
  });
}

/** Split a cart into the property shape analytics tools expect. */export function cartProperties(items: Array<{ id?: string; productId?: string; name?: string; price?: number; quantity?: number }>) {
  const contents = items.map((item) => ({
    id: item.productId ?? item.id ?? 'unknown',
    quantity: item.quantity ?? 1,
    item_price: item.price ?? 0,
    name: item.name ?? '',
  }));
  return {
    product_ids: contents.map((c) => c.id),
    contents,
    num_items: contents.reduce((sum, c) => sum + c.quantity, 0),
    value: contents.reduce((sum, c) => sum + c.item_price * c.quantity, 0),
    currency: 'THB',
  };
}
