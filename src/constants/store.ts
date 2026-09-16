/**
 * Storefront business constants.
 * Kept in one place so marketing copy can be updated without touching UI code.
 */

/** Free shipping threshold in Thai Baht. */
export const FREE_SHIPPING_THRESHOLD = 500;

/** Currency symbol used in customer-facing copy. */
export const CURRENCY_SYMBOL = '฿';

/**
 * Delivery estimate rules.
 * Cut-off is 14:00 Thailand time. Every order ships on a 2–4 business day
 * transit window; ordering before the cut-off keeps it on the earliest
 * possible dispatch.
 */
export const DELIVERY_CUTOFF_HOUR = 14;

/** Customer-facing transit window shown alongside every delivery estimate. */
export const DELIVERY_WINDOW_LABEL = '2–4 business days';

/**
 * Human-readable delivery estimate message, e.g.
 * "Order within 2h 14m for delivery in 2–4 business days".
 */
export function getDeliveryEstimateMessage(from: Date = new Date()): string {
  const cutoff = new Date(from);
  cutoff.setHours(DELIVERY_CUTOFF_HOUR, 0, 0, 0);

  if (from >= cutoff) {
    return `Order now for delivery in ${DELIVERY_WINDOW_LABEL}`;
  }

  const msUntilCutoff = cutoff.getTime() - from.getTime();
  const hours = Math.floor(msUntilCutoff / (1000 * 60 * 60));
  const minutes = Math.floor((msUntilCutoff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return `Order within ${minutes}m for delivery in ${DELIVERY_WINDOW_LABEL}`;
  }

  return `Order within ${hours}h ${minutes}m for delivery in ${DELIVERY_WINDOW_LABEL}`;
}
