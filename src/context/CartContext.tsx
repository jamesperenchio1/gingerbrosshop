import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { CartItem, CartState, CartAction } from '@/types/cart';

const initialState: CartState = {
  items: [],
  isOpen: false,
};

function loadState(): CartState {
  try {
    const stored = localStorage.getItem('gingerbros-cart');
    if (stored) {
      return { ...JSON.parse(stored), isOpen: false };
    }
  } catch {
    // ignore
  }
  return initialState;
}

function cartReducer(state: CartState, action: CartAction): CartState {
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
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  decrementOrRemove: (id: string) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, loadState);

  useEffect(() => {
    const toStore = { items: state.items, isOpen: false };
    localStorage.setItem('gingerbros-cart', JSON.stringify(toStore));
  }, [state.items]);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const decrementOrRemove = useCallback((id: string) => {
    dispatch({ type: 'DECREMENT_OR_REMOVE', payload: id });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' });
  }, []);

  const openCart = useCallback(() => {
    dispatch({ type: 'OPEN_CART' });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: 'CLOSE_CART' });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
