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
 * Cut-off is 14:00 Thailand time. Orders before cut-off deliver on the next
 * shipping day; orders after cut-off deliver on the shipping day after that.
 * Shipping days are Monday–Friday.
 */
export const DELIVERY_CUTOFF_HOUR = 14;
export const DELIVERY_DAYS = [1, 2, 3, 4, 5]; // Monday = 1, Friday = 5

/**
 * Returns the estimated delivery date for an order placed at the given time.
 * Defaults to "now" when called from the browser.
 */
export function getEstimatedDeliveryDate(from: Date = new Date()): Date {
  const date = new Date(from);
  const hour = date.getHours();
  const isBeforeCutoff = hour < DELIVERY_CUTOFF_HOUR;

  // Move to the next available shipping day, respecting cut-off.
  const daysToAdd = isBeforeCutoff ? 1 : 2;
  date.setDate(date.getDate() + daysToAdd);

  // Skip weekends until we land on a shipping day.
  while (!DELIVERY_DAYS.includes(date.getDay())) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

/**
 * Human-readable delivery estimate message, e.g.
 * "Order within 2h 14m for delivery by Thursday, 6 Aug".
 */
export function getDeliveryEstimateMessage(from: Date = new Date()): string {
  const cutoff = new Date(from);
  cutoff.setHours(DELIVERY_CUTOFF_HOUR, 0, 0, 0);

  const delivery = getEstimatedDeliveryDate(from);
  const deliveryLabel = delivery.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  if (from >= cutoff) {
    return `Order now for delivery by ${deliveryLabel}`;
  }

  const msUntilCutoff = cutoff.getTime() - from.getTime();
  const hours = Math.floor(msUntilCutoff / (1000 * 60 * 60));
  const minutes = Math.floor((msUntilCutoff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return `Order within ${minutes}m for delivery by ${deliveryLabel}`;
  }

  return `Order within ${hours}h ${minutes}m for delivery by ${deliveryLabel}`;
}
