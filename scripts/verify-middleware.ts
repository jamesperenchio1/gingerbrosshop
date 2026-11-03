import middleware from '../middleware.ts';

const BASE = 'http://localhost:4174';

const cases = [
  { path: '/', expectStatus: 200, title: 'GingerBros | Ginger Fizz &amp; Ginger Tea' },
  { path: '/th', expectStatus: 200, title: 'GingerBros | น้ำขิงซ่า' },
  { path: '/shop', expectStatus: 200, title: 'Shop Ginger Fizz, Ginger Tea' },
  { path: '/product/ginger-fizz', expectStatus: 200, title: 'Ginger Fizz | Ginger Soda Made in Thailand' },
  { path: '/product/unknown-id', expectStatus: 404, title: 'Page Not Found | GingerBros' },
  { path: '/faq', expectStatus: 200, title: 'Frequently Asked Questions | GingerBros' },
  { path: '/shipping', expectStatus: 200, title: 'Shipping Information | GingerBros' },
  { path: '/business', expectStatus: 200, title: 'GingerBros for Cafés' },
  { path: '/guide', expectStatus: 200, title: 'The Ginger Guide' },
  { path: '/guide/moscow-mule', expectStatus: 200, title: 'The Perfect Moscow Mule with GingerBros' },
  { path: '/guide/not-a-real-article', expectStatus: 404, title: 'Page Not Found | GingerBros' },
  { path: '/track', expectStatus: 200, title: 'Track Your Order | GingerBros' },
  { path: '/admin/orders', expectStatus: 200, title: 'Admin Orders | GingerBros' },
  { path: '/this-does-not-exist', expectStatus: 404, title: 'Page Not Found | GingerBros' },
];

async function run() {
  let passed = 0;
  let failed = 0;

  for (const c of cases) {
    const req = new Request(`${BASE}${c.path}`);
    const res = await middleware(req);
    const html = await res.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const actualTitle = titleMatch?.[1] ?? 'NO TITLE';
    const ok = res.status === c.expectStatus && actualTitle.includes(c.title);

    if (ok) {
      console.log(`✅ ${c.path} → ${res.status} — ${actualTitle}`);
      passed++;
    } else {
      console.log(`❌ ${c.path}`);
      console.log(`   Expected: ${c.expectStatus} / title includes "${c.title}"`);
      console.log(`   Actual:   ${res.status} / ${actualTitle}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
