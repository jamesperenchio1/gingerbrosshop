export interface CartItem {
  // Unique cart-line key. Equals the Stripe price ID for catalog items.
  id: string;
  // The Stripe price ID sent to checkout (defaults to `id` when omitted).
  priceId?: string;
  // The catalog product ID (Stripe metadata.app_id), used for routing to the
  // product detail page.
  productId?: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
  badge: string;
  badgeColor: string;
  isSubscription?: boolean;
  interval?: string;
  isGift?: boolean;
  recipientEmail?: string;
  recipientName?: string;
  giftMessage?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'DECREMENT_OR_REMOVE'; payload: string }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'CLEAR_CART' };
