// Registers the five poster QR codes (see scripts/poster-qr.py) so /q/<slug> counts
// scans and shows them in Admin → QR Codes. Existing slugs are left untouched, so it
// is safe to re-run. Edit a target later in the admin page — no reprint needed.
//
// Run (needs UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, e.g. from `vercel env pull`):
//   node --env-file=.env.local scripts/seed-poster-qr.mjs [--dry]

const QR_KEY = 'linkpage:qrcodes'; // same hash as api/_lib/linkpage.ts
const LINK_PAGE = 'https://link.gingerbrosshop.com/?src=qr';

const CODES = [
  { slug: 'poster-promo-popcorn', name: 'Poster: Promo popcorn deals', targetUrl: LINK_PAGE },
  { slug: 'poster-promo-6pack', name: 'Poster: Promo 6-packs', targetUrl: LINK_PAGE },
  { slug: 'poster-fizz-tea', name: 'Poster: Fizz + Tea', targetUrl: LINK_PAGE },
  { slug: 'poster-fizz', name: 'Poster: Ginger Fizz', targetUrl: 'https://gingerbrosshop.com/product/ginger-fizz' },
  { slug: 'poster-tea', name: 'Poster: Ginger Tea', targetUrl: LINK_PAGE },
];

const dry = process.argv.includes('--dry');
const redis = dry ? null : (await import('@upstash/redis')).Redis.fromEnv();

for (const c of CODES) {
  const code = { ...c, fg: '#2b2118', bg: '#fff4e0', createdAt: new Date().toISOString() };
  if (dry) {
    console.log('[dry]', code.slug, '→', code.targetUrl);
    continue;
  }
  const added = await redis.hsetnx(QR_KEY, code.slug, JSON.stringify(code));
  console.log(added ? 'created' : 'exists ', code.slug, '→', code.targetUrl);
}
