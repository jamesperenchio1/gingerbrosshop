import { useEffect, useMemo } from 'react';

const STORAGE_KEY = 'gingerbros-recently-viewed';
const MAX_ITEMS = 6;

export function recordProductView(productId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const next = [productId, ...existing.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
}

export function getRecentlyViewed(exclude?: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    return exclude ? ids.filter((id) => id !== exclude) : ids;
  } catch {
    return [];
  }
}

export function useRecentlyViewed(productId?: string) {
  useEffect(() => {
    if (productId) recordProductView(productId);
  }, [productId]);

  return useMemo(() => getRecentlyViewed(productId), [productId]);
}
