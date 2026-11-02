#!/usr/bin/env node
/**
 * Renders the 1200×630 share cards (Open Graph / LINE / X previews) with
 * Playwright, using the real brand fonts and the generated bottle images.
 * Run after scripts/build-images.mjs:
 *
 *   node scripts/build-og.mjs
 *
 * Writes public/images/og/<name>.jpg and src/lib/ogImages.ts.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const OUT = path.join(root, 'public/images/og');
const GEN = path.join(root, 'public/images/gen');

const font = async (pkg, file) =>
  `data:font/woff2;base64,${(await readFile(path.join(root, 'node_modules/@fontsource-variable', pkg, 'files', file))).toString('base64')}`;
/** Largest generated WebP of `name` that is at most 1200px wide. */
const img = async (name) => {
  const files = (await readdir(GEN)).filter((f) => new RegExp(`^${name}-(\\d+)\\.webp$`).test(f));
  const best = files.map((f) => [f, Number(f.match(/-(\d+)\.webp$/)[1])]).filter(([, w]) => w <= 1200).sort((a, b) => b[1] - a[1])[0][0];
  return `data:image/webp;base64,${(await readFile(path.join(GEN, best))).toString('base64')}`;
};

const CARDS = [
  { id: 'default', title: 'Think Ginger.<br><em>Drink Different.</em>', sub: 'Ginger Fizz &amp; Ginger Tea · Made in Thailand', images: ['bottle-tea', 'bottle-fizz'], dark: true },
  { id: 'ginger-fizz', title: 'Ginger<br><em>Fizz.</em>', sub: 'Fresh Thai ginger · Real lime · Low sugar · ฿140', images: ['bottle-fizz'] },
  { id: 'ginger-tea', title: 'Ginger<br><em>Tea.</em>', sub: 'Slow-simmered · Lemongrass · Thai spice · ฿119', images: ['bottle-tea'], dark: true },
  { id: 'ginger-fizz-2pack', title: 'Ginger Fizz<br><em>×2</em>', sub: '2 bottles for ฿260', images: ['ginger-fizz-2pack'], wide: true },
  { id: 'ginger-fizz-3pack', title: 'Ginger Fizz<br><em>×3</em>', sub: '3 bottles for ฿390', images: ['ginger-fizz-3pack'], wide: true },
  { id: 'ginger-fizz-6pack', title: 'Ginger Fizz<br><em>×6</em>', sub: '6 bottles for ฿780', images: ['ginger-fizz-6pack'], wide: true },
  { id: 'ginger-tea-2pack', title: 'Ginger Tea<br><em>×2</em>', sub: '2 bottles for ฿220', images: ['ginger-tea-2pack'], wide: true, dark: true },
  { id: 'ginger-tea-3pack', title: 'Ginger Tea<br><em>×3</em>', sub: '3 bottles for ฿315', images: ['ginger-tea-3pack'], wide: true, dark: true },
  { id: 'ginger-tea-6pack', title: 'Ginger Tea<br><em>×6</em>', sub: '6 bottles for ฿600', images: ['ginger-tea-6pack'], wide: true, dark: true },
  { id: 'fizz-tea-duo', title: 'Fizz &amp; Tea<br><em>Duo.</em>', sub: 'One of each for ฿240', images: ['fizz-tea-duo'], wide: true },
  { id: 'fizz-tea-4pack', title: 'Fizz &amp; Tea<br><em>×4</em>', sub: 'Two of each for ฿460', images: ['fizz-tea-4pack'], wide: true },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const display = await font('bricolage-grotesque', 'bricolage-grotesque-latin-wght-normal.woff2');
  const body = await font('inter', 'inter-latin-wght-normal.woff2');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  for (const c of CARDS) {
    const pics = await Promise.all(c.images.map(img));
    const bg = c.dark ? '#1E1A17' : '#F2B632';
    const ink = c.dark ? '#F5E6C8' : '#1E1A17';
    const accent = c.dark ? '#F2B632' : '#3D2410';
    await page.setContent(`<!doctype html><html><head><style>
      @font-face{font-family:D;src:url(${display}) format('woff2');font-weight:200 800}
      @font-face{font-family:B;src:url(${body}) format('woff2');font-weight:100 900}
      *{margin:0;box-sizing:border-box}
      body{width:1200px;height:630px;background:${bg};color:${ink};font-family:B;overflow:hidden;position:relative}
      .glow{position:absolute;right:-80px;top:40px;width:720px;height:720px;border-radius:50%;
        background:radial-gradient(circle, ${c.dark ? 'rgba(242,182,50,.35)' : 'rgba(255,255,255,.45)'}, transparent 65%)}
      .copy{position:absolute;left:72px;top:64px;bottom:64px;width:${c.wide ? 520 : 640}px;display:flex;flex-direction:column}
      .brand{font-family:D;font-weight:800;font-size:40px;letter-spacing:-.03em}
      .brand span{color:${c.dark ? '#F2B632' : '#8B5A2B'}}
      h1{font-family:D;font-weight:800;font-size:${c.wide ? 104 : 118}px;line-height:.9;letter-spacing:-.04em;text-transform:uppercase;margin-top:auto}
      h1 em{font-style:normal;color:${accent}}
      p{font-size:26px;font-weight:600;margin-top:24px;opacity:.92}
      .pics{position:absolute;right:${c.wide ? 30 : 70}px;bottom:24px;top:24px;display:flex;align-items:flex-end;gap:0}
      .pics img{height:${c.wide ? '100%' : '100%'};width:auto;filter:drop-shadow(0 30px 40px rgba(0,0,0,.45))}
      .pics img+img{margin-left:-40px}
      .pics img:first-child:not(:only-child){transform:rotate(-6deg) translateY(10px);height:90%}
    </style></head><body><div class="glow"></div>
      <div class="copy"><div class="brand">GingerBros<span>.</span></div><h1>${c.title}</h1><p>${c.sub}</p></div>
      <div class="pics">${pics.map((src) => `<img src="${src}">`).join('')}</div>
    </body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `${c.id}.jpg`), type: 'jpeg', quality: 88 });
    console.log('og', c.id);
  }
  await browser.close();
  await writeFile(
    path.join(root, 'src/lib/ogImages.ts'),
    `// Generated by scripts/build-og.mjs. Do not edit by hand.\nexport const OG_IMAGES = new Set<string>(${JSON.stringify(CARDS.map((c) => c.id))});\n`,
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
