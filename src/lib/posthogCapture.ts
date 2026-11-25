const posthogConfigured = Boolean(import.meta.env.VITE_POSTHOG_KEY && import.meta.env.VITE_POSTHOG_HOST);

/** Loads the browser SDK only while handling a browser action. */
export function capturePosthogEvent(event: string, properties?: Record<string, unknown>): void {
  if (!posthogConfigured || typeof window === 'undefined') return;

  void import('posthog-js')
    .then(({ default: posthog }) => posthog.capture(event, properties))
    .catch(() => {
      // Analytics must never interrupt the shopper's action.
    });
}

/** Sends only purpose-written browser records through PostHog's native logger. */
export function capturePosthogLog(
  message: string,
  properties?: Record<string, string | number | boolean>,
): void {
  if (!posthogConfigured || typeof window === 'undefined') return;

  void import('posthog-js')
    .then(({ default: posthog }) => posthog.logger.info(message, properties))
    .catch(() => {
      // Logging must never interrupt the shopper's action.
    });
}
