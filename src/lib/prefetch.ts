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
