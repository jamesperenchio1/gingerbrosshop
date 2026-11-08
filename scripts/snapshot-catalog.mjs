// Refresh scripts/catalog.snapshot.json from the live catalog. The prerender
// falls back to this file when /api/products is unreachable at build time.
// Run after changing products or prices in Stripe, then commit the result.
//   node scripts/snapshot-catalog.mjs
import { writeFile } from 'node:fs/promises';

const url = process.env.CATALOG_URL || 'https://gingerbrosshop.com/api/products';
const res = await fetch(`${url}?snapshot=${Date.now()}`, { signal: AbortSignal.timeout(20000) });
if (!res.ok) throw new Error(`catalog fetch failed: HTTP ${res.status}`);
const data = await res.json();
if (!Array.isArray(data.products) || data.products.length === 0) throw new Error('catalog is empty, refusing to overwrite the snapshot');
await writeFile(new URL('./catalog.snapshot.json', import.meta.url), JSON.stringify({ products: data.products }));
console.log(`snapshot written: ${data.products.length} products`);
