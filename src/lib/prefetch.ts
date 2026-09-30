/**
 * Route chunk prefetching.
 *
 * `ProductDetail` is lazy-loaded, and essentially every visitor opens it — so
 * without this the first product click always costs a full-screen spinner while
 * the chunk downloads. Warming it on hover/focus of a product card hides that
 * latency behind the user's own reaction time. Vite dedupes the dynamic import
 * with the `lazy()` one in App.tsx, so this is the same chunk, fetched once.
 */
let productDetailRequested = false;

export function prefetchProductDetail() {
  if (productDetailRequested) return;
  productDetailRequested = true;
  void import('@/pages/ProductDetail');
}

/**
 * Warm the product chunk once the browser is idle (skipped on Save-Data / 2G-3G
 * connections, where the bytes matter more than the head start). Called from the
 * homepage, where a product click is by far the most likely next step.
 */
export function prefetchProductDetailWhenIdle() {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData || /(^|-)(2g|3g)$/.test(conn?.effectiveType ?? '')) return;
  const ric = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
  if (ric) ric(() => prefetchProductDetail(), { timeout: 4000 });
  else window.setTimeout(prefetchProductDetail, 2500);
}
