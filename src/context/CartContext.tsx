import { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useRef, type ReactNode } from 'react';
import type { CartItem, CartState, CartAction } from '@/types/cart';
import { trackPixelEvent } from '@/lib/metaPixel';
import { captureEvent, identifyUser } from '@/lib/posthog';
import { multiBuyDiscount as computeMultiBuyDiscount } from '@/lib/multiBuy';

import { getCartEmail } from '@/lib/cartEmail';
const CART_STORAGE_KEY = 'gingerbros-cart';

function snapshotCart(email: string | null, items: CartItem[], subtotal: number) {
  if (!email || items.length === 0) return;
  fetch('/api/save-cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, items, subtotal, url: window.location.href }),
  }).catch(() => {});
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

export function loadState(): CartState {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return { ...JSON.parse(stored), isOpen: false };
    }
  } catch {
    // ignore
  }
  return initialState;
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(item => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          isOpen: true,
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        isOpen: true,
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'DECREMENT_OR_REMOVE': {
      const item = state.items.find(i => i.id === action.payload);
      if (!item) return state;
      if (item.quantity <= 1) {
        return {
          ...state,
          items: state.items.filter(i => i.id !== action.payload),
        };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload ? { ...i, quantity: i.quantity - 1 } : i
        ),
      };
    }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'HYDRATE':
      // Restored from localStorage after mount. Keep anything already added.
      return state.items.length > 0 ? state : { ...action.payload, isOpen: state.isOpen };
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem, opts?: { silent?: boolean }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  decrementOrRemove: (id: string) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  // Baht off the subtotal from multi-buy deals (one-time bottles only).
  multiBuyDiscount: number;
  // Fizz / Tea bottles on one-time lines, for the "add one more" deal hint.
  bottles: { fizz: number; tea: number };
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // Start empty so the first client render matches the prerendered HTML, then
  // restore the saved cart right after hydration.
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const restored = useRef(false);

  useEffect(() => {
    const saved = loadState();
    if (saved.items.length > 0) dispatch({ type: 'HYDRATE', payload: saved });
    // If we already know who this is (email captured at checkout/newsletter),
    // tie the session to that person so server-side purchases join up.
    const email = getCartEmail();
    if (email) identifyUser(email, { email });
    restored.current = true;
  }, []);

  useEffect(() => {
    // Don't overwrite the saved cart with the empty pre-restore state.
    if (!restored.current) return;
    const toStore = { items: state.items, isOpen: false };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(toStore));
    const email = typeof window !== 'undefined' ? getCartEmail() : null;
    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const id = window.setTimeout(() => { snapshotCart(email, state.items, subtotal); }, 1500);
    return () => window.clearTimeout(id);
  }, [state.items]);

  const addItem = useCallback((item: CartItem, opts?: { silent?: boolean }) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    if (opts?.silent) return;
    trackPixelEvent('AddToCart', {
      content_ids: [item.productId ?? item.id],
      contents: [{ id: item.productId ?? item.id, quantity: item.quantity, item_price: item.price, name: item.name }],
      content_type: 'product',
      content_name: item.name,
      value: item.price * item.quantity,
      currency: 'THB',
    });
    captureEvent('add_to_cart', {
      product_id: item.productId ?? item.id,
      price_id: item.priceId ?? item.id,
      product_name: item.name,
      variant: item.variant,
      quantity: item.quantity,
      price: item.price,
      value: item.price * item.quantity,
      currency: 'THB',
      is_subscription: !!item.isSubscription,
      subscription_interval: item.interval,
      is_gift: !!item.isGift,
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    const item = state.items.find((i) => i.id === id);
    if (item) {
      captureEvent('remove_from_cart', {
        product_id: item.productId ?? item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        value: item.price * item.quantity,
        currency: 'THB',
      });
    }
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, [state.items]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const item = state.items.find((i) => i.id === id);
    if (item) {
      captureEvent('cart_quantity_updated', {
        product_id: item.productId ?? item.id,
        product_name: item.name,
        previous_quantity: item.quantity,
        quantity,
        price: item.price,
        value: item.price * Math.max(quantity, 0),
        currency: 'THB',
      });
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, [state.items]);

  const decrementOrRemove = useCallback((id: string) => {
    const item = state.items.find((i) => i.id === id);
    if (!item) {
      dispatch({ type: 'DECREMENT_OR_REMOVE', payload: id });
      return;
    }
    if (item.quantity <= 1) {
      captureEvent('remove_from_cart', {
        product_id: item.productId ?? item.id,
        product_name: item.name,
        quantity: 1,
        price: item.price,
        value: item.price,
        currency: 'THB',
      });
    } else {
      captureEvent('cart_quantity_updated', {
        product_id: item.productId ?? item.id,
        product_name: item.name,
        previous_quantity: item.quantity,
        quantity: item.quantity - 1,
        price: item.price,
        value: item.price * (item.quantity - 1),
        currency: 'THB',
      });
    }
    dispatch({ type: 'DECREMENT_OR_REMOVE', payload: id });
  }, [state.items]);

  const toggleCart = useCallback(() => {
    if (!state.isOpen) {
      captureEvent('cart_opened', {
        source: 'toggle',
        item_count: state.items.reduce((sum, item) => sum + item.quantity, 0),
        value: state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        currency: 'THB',
      });
    }
    dispatch({ type: 'TOGGLE_CART' });
  }, [state.isOpen, state.items]);

  const openCart = useCallback(() => {
    captureEvent('cart_opened', {
      source: 'open',
      item_count: state.items.reduce((sum, item) => sum + item.quantity, 0),
      value: state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      currency: 'THB',
    });
    dispatch({ type: 'OPEN_CART' });
  }, [state.items]);

  const closeCart = useCallback(() => {
    dispatch({ type: 'CLOSE_CART' });
  }, []);

  const clearCart = useCallback(() => {
    captureEvent('cart_cleared', {
      item_count: state.items.reduce((sum, item) => sum + item.quantity, 0),
      value: state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      currency: 'THB',
    });
    dispatch({ type: 'CLEAR_CART' });
  }, [state.items]);

  const totalItems = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items],
  );
  const subtotal = useMemo(
    () => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [state.items],
  );
  const oneTimeItems = useMemo(() => state.items.filter((item) => !item.isSubscription), [state.items]);
  const multiBuyDiscount = useMemo(() => computeMultiBuyDiscount(oneTimeItems), [oneTimeItems]);
  const bottles = useMemo(
    () => oneTimeItems.reduce(
      (acc, item) => ({
        fizz: acc.fizz + (item.bottlesFizz ?? 0) * item.quantity,
        tea: acc.tea + (item.bottlesTea ?? 0) * item.quantity,
      }),
      { fizz: 0, tea: 0 },
    ),
    [oneTimeItems],
  );
  const getItemQuantity = useCallback((id: string) => {
    return state.items.find(item => item.id === id)?.quantity ?? 0;
  }, [state.items]);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        decrementOrRemove,
        toggleCart,
        openCart,
        closeCart,
        clearCart,
        totalItems,
        subtotal,
        multiBuyDiscount,
        bottles,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
