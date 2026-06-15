import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart, cartReducer, loadState } from '@/context/CartContext';
import type { CartItem } from '@/types/cart';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const sampleItem: CartItem = {
  id: 'unpasteurized',
  name: 'Unpasteurized Ginger Fizz',
  variant: 'unpasteurized',
  price: 140,
  quantity: 1,
  image: '/images/product-unpasteurized-2.jpg',
  badge: 'CHILLED DELIVERY',
  badgeColor: 'bg-grab-green',
};

const sampleItem2: CartItem = {
  id: 'pasteurized',
  name: 'Pasteurized Ginger Fizz',
  variant: 'unpasteurized',
  price: 120,
  quantity: 2,
  image: '/images/product-pasteurized.png',
  badge: 'SHELF STABLE',
  badgeColor: 'bg-amber',
};

describe('cartReducer', () => {
  it('adds a new item and opens the cart', () => {
    const state = cartReducer({ items: [], isOpen: false }, { type: 'ADD_ITEM', payload: sampleItem });
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(sampleItem);
    expect(state.isOpen).toBe(true);
  });

  it('increments quantity when adding an existing item', () => {
    const state = cartReducer(
      { items: [sampleItem], isOpen: false },
      { type: 'ADD_ITEM', payload: { ...sampleItem, quantity: 2 } }
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
    expect(state.isOpen).toBe(true);
  });

  it('removes an item', () => {
    const state = cartReducer(
      { items: [sampleItem, sampleItem2], isOpen: true },
      { type: 'REMOVE_ITEM', payload: sampleItem.id }
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe(sampleItem2.id);
  });

  it('updates quantity', () => {
    const state = cartReducer(
      { items: [sampleItem], isOpen: true },
      { type: 'UPDATE_QUANTITY', payload: { id: sampleItem.id, quantity: 5 } }
    );
    expect(state.items[0].quantity).toBe(5);
  });

  it('removes item when quantity is set to 0', () => {
    const state = cartReducer(
      { items: [sampleItem], isOpen: true },
      { type: 'UPDATE_QUANTITY', payload: { id: sampleItem.id, quantity: 0 } }
    );
    expect(state.items).toHaveLength(0);
  });

  it('decrements quantity', () => {
    const state = cartReducer(
      { items: [{ ...sampleItem, quantity: 3 }], isOpen: true },
      { type: 'DECREMENT_OR_REMOVE', payload: sampleItem.id }
    );
    expect(state.items[0].quantity).toBe(2);
  });

  it('removes item when decrementing from 1', () => {
    const state = cartReducer(
      { items: [sampleItem], isOpen: true },
      { type: 'DECREMENT_OR_REMOVE', payload: sampleItem.id }
    );
    expect(state.items).toHaveLength(0);
  });

  it('toggles cart visibility', () => {
    const open = cartReducer({ items: [], isOpen: false }, { type: 'TOGGLE_CART' });
    expect(open.isOpen).toBe(true);
    const closed = cartReducer(open, { type: 'TOGGLE_CART' });
    expect(closed.isOpen).toBe(false);
  });

  it('clears the cart', () => {
    const state = cartReducer(
      { items: [sampleItem, sampleItem2], isOpen: true },
      { type: 'CLEAR_CART' }
    );
    expect(state.items).toHaveLength(0);
  });
});

describe('loadState', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns initial state when localStorage is empty', () => {
    const state = loadState();
    expect(state.items).toEqual([]);
    expect(state.isOpen).toBe(false);
  });

  it('loads persisted items and forces isOpen to false', () => {
    window.localStorage.setItem(
      'gingerbros-cart',
      JSON.stringify({ items: [sampleItem], isOpen: true })
    );
    const state = loadState();
    expect(state.items).toHaveLength(1);
    expect(state.isOpen).toBe(false);
  });

  it('ignores corrupted localStorage data', () => {
    window.localStorage.setItem('gingerbros-cart', 'not-json');
    const state = loadState();
    expect(state.items).toEqual([]);
    expect(state.isOpen).toBe(false);
  });
});

describe('CartProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists items to localStorage when added', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(sampleItem);
    });

    expect(result.current.totalItems).toBe(1);
    expect(result.current.subtotal).toBe(140);

    const stored = JSON.parse(window.localStorage.getItem('gingerbros-cart') ?? '{}');
    expect(stored.items).toHaveLength(1);
    expect(stored.isOpen).toBe(false);
  });

  it('loads persisted cart on mount', () => {
    window.localStorage.setItem(
      'gingerbros-cart',
      JSON.stringify({ items: [{ ...sampleItem, quantity: 2 }], isOpen: true })
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.totalItems).toBe(2);
    expect(result.current.subtotal).toBe(280);
    expect(result.current.state.isOpen).toBe(false);
  });

  it('reports correct item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ ...sampleItem, quantity: 4 });
    });
    expect(result.current.getItemQuantity(sampleItem.id)).toBe(4);
    expect(result.current.getItemQuantity('unknown')).toBe(0);
  });
});
