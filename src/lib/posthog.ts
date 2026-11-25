/**
 * PostHog client wrapper.
 *
 * The SDK is loaded lazily (never during the SSR/prerender build) and every
 * export is a safe no-op until `initPostHog()` has succeeded. That means event
 * calls can be sprinkled anywhere without guarding for `window` or for a
 * missing project key — important here because the site is prerendered and the
 * same modules run in Node during `npm run build`.
 *
 * Config:
 *  - `VITE_POSTHOG_KEY`  project API key (`phc_...`)
 *  - `VITE_POSTHOG_HOST` optional override; defaults to the first-party
 *    `/ingest` reverse proxy configured in vercel.json
 */

type PostHogClient = import('posthog-js').PostHogInterface;
type EventProperties = Record<string, unknown>;

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || '/ingest';

let client: PostHogClient | null = null;
let loading: Promise<PostHogClient | null> | null = null;
let ready = false;

/** Events captured before the SDK finishes loading. */
const pending: Array<{ event: string; properties: EventProperties }> = [];
/** Identify calls captured before the SDK finishes loading. */
let pendingIdentify: { distinctId: string; properties: EventProperties } | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/** True once the SDK is initialised and able to accept events. */
export function isPostHogReady(): boolean {
  return ready;
}

/**
 * Initialise PostHog once. Safe to call from module scope on the client; does
 * nothing in SSR, when the key is missing, or when the visitor sends DNT.
 */
export function initPostHog(): void {
  if (!isBrowser() || ready || loading) return;
  if (!KEY || KEY.includes('phc_your')) return;

  loading = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(KEY, {
        api_host: HOST,
        // Where to deep-link people from PostHog (toolbar, replays).
        ui_host: 'https://us.posthog.com',
        // Route changes are captured manually (see PageViewTracker) so the
        // SPA doesn't double-count the initial load.
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: true,
        person_profiles: 'identified_only',
        persistence: 'localStorage+cookie',
        respect_dnt: true,
        // Session replay, with form fields and anything marked [data-ph-mask]
        // redacted. Card data never touches this site (Stripe Checkout is a
        // redirect), but emails/names still get masked.
        disable_session_recording: false,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: '[data-ph-mask], .ph-mask',
        },
        enable_heatmaps: true,
        // Keep the bundle small; we don't use surveys/toolbar in production.
        disable_surveys: true,
        loaded: (ph) => {
          client = ph;
          ready = true;
          if (pendingIdentify) {
            ph.identify(pendingIdentify.distinctId, pendingIdentify.properties);
            pendingIdentify = null;
          }
          for (const item of pending.splice(0)) ph.capture(item.event, item.properties);
        },
      });
      return posthog as PostHogClient;
    })
    .catch(() => null);

  // If the chunk fails to load (offline, blocked), stop retrying for this page.
  void loading.then((ph) => {
    if (!ph) loading = null;
  });
}

/** Capture a custom event. No-ops outside the browser or without a key. */
export function captureEvent(event: string, properties: EventProperties = {}): void {
  if (!isBrowser() || !KEY) return;
  if (client && ready) {
    client.capture(event, properties);
    return;
  }
  pending.push({ event, properties });
  initPostHog();
}

/**
 * Capture a `$pageview`. Deduplicated by the caller: only fires on route
 * changes, never during render.
 */
export function capturePageView(path: string, href?: string): void {
  if (!isBrowser()) return;
  const url = href ?? window.location.href;
  captureEvent('$pageview', {
    $current_url: url,
    path,
    // PostHog uses these to resolve the previous page for funnels/paths.
    $host: window.location.host,
  });
}

/** Associate subsequent events with a person. */
export function identifyUser(distinctId: string, properties: EventProperties = {}): void {
  if (!isBrowser() || !KEY || !distinctId) return;
  if (client && ready) {
    client.identify(distinctId, properties);
    return;
  }
  pendingIdentify = { distinctId, properties };
  initPostHog();
}

/** Clear the current person (e.g. after logout). */
export function resetUser(): void {
  if (client && ready) client.reset();
  pendingIdentify = null;
}
