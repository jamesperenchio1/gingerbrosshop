/**
 * Email used for abandoned-cart reminders. It is only ever set once the
 * visitor has verified a newsletter signup (see components/Newsletter.tsx),
 * i.e. they have asked to hear from us, never from a bare form field.
 */
export const CART_EMAIL_KEY = 'gingerbros-cart-email';

export function setCartEmail(email: string) {
  try { localStorage.setItem(CART_EMAIL_KEY, email.trim().toLowerCase()); } catch { /* storage unavailable */ }
}

export function getCartEmail(): string | null {
  try { return localStorage.getItem(CART_EMAIL_KEY); } catch { return null; }
}
