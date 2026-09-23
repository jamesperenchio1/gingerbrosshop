// One-time generator for the link-page sticker library indexes.
//
// Produces three committed indexes under public/stickers/:
//   fluent.json    Microsoft Fluent Emoji (MIT)  — styles: 3d, color, flat
//   twemoji.json   Twemoji (CC BY 4.0)
//   emojitwo.json  EmojiTwo (CC BY 4.0)
//
// Noto animated (public/stickers/noto-animated.json) is generated elsewhere and
// kept as-is. Twemoji/EmojiTwo are codepoint-addressable, so their index is the
// union of Fluent + Noto codepoints that actually resolve on the CDN.
//
// Run: node scripts/build-sticker-indexes.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'stickers');

const FLUENT_REPO = 'microsoft/fluentui-emoji';
const FLUENT_BASE = `https://cdn.jsdelivr.net/gh/${FLUENT_REPO}@main/assets/`;
const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/';
const EMOJITWO_BASE = 'https://cdn.jsdelivr.net/gh/EmojiTwo/emojitwo@master/svg/';

const STYLE_DIRS = { '3d': '3D', color: 'Color', flat: 'Flat' };
const STYLE_SUFFIX = { '3d': '_3d.png', color: '_color.svg', flat: '_flat.svg' };

/** Strip variation selectors and normalise separators to a canonical key. */
export function normalizeCodepoint(cp) {
  return cp
    .toLowerCase()
    .replace(/_fe0f|_fe0e/g, '')
    .replace(/[_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'gingerbros-sticker-index' } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return await res.json();
    } catch (err) {
      if (i === tries - 1) throw err;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return out;
}

async function buildFluent() {
  console.log('• Fluent: fetching repo tree…');
  const tree = await getJson(
    `https://api.github.com/repos/${FLUENT_REPO}/git/trees/main?recursive=1`,
  );
  if (!tree?.tree) throw new Error('Fluent: no tree');

  // name -> { snake, styles:Set }
  const byName = new Map();
  for (const node of tree.tree) {
    const m = /^assets\/(.+)\/(3D|Color|Flat)\/(.+)$/.exec(node.path);
    if (!m) continue;
    const [, name, dir, file] = m;
    const style = Object.keys(STYLE_DIRS).find((s) => STYLE_DIRS[s] === dir);
    if (!style) continue;
    const suffix = STYLE_SUFFIX[style];
    if (!file.endsWith(suffix)) continue;
    const snake = file.slice(0, -suffix.length);
    const entry = byName.get(name) ?? { snake, styles: new Set() };
    entry.snake = snake;
    entry.styles.add(style);
    byName.set(name, entry);
  }
  console.log(`  ${byName.size} emoji folders`);

  const names = [...byName.keys()];
  const items = (
    await mapLimit(names, 24, async (name) => {
      const url = `${FLUENT_BASE}${encodeURIComponent(name)}/metadata.json`;
      const meta = await getJson(url).catch(() => null);
      if (!meta?.unicode || !meta?.cldr) return null;
      const entry = byName.get(name);
      const styles = ['3d', 'color', 'flat'].filter((s) => entry.styles.has(s));
      if (styles.length === 0) return null;
      return {
        c: meta.unicode,
        u: normalizeCodepoint(meta.unicode),
        n: meta.cldr,
        k: [meta.group, ...(meta.keywords ?? [])].filter(Boolean).join(' '),
        name,
        snake: entry.snake,
        s: styles,
      };
    })
  ).filter(Boolean);

  console.log(`  ${items.length} emoji with metadata`);
  return {
    source: 'Microsoft Fluent Emoji',
    license: 'MIT',
    licenseUrl: 'https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE',
    home: 'https://github.com/microsoft/fluentui-emoji',
    base: FLUENT_BASE,
    items,
  };
}

/** Codepoints available in a jsDelivr-hosted svg repo, from its git tree. */
async function svgCodepoints(repo, branch) {
  const tree = await getJson(
    `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`,
  );
  const set = new Set();
  for (const node of tree?.tree ?? []) {
    const m = /^(?:assets\/)?svg\/(.+)\.svg$/.exec(node.path);
    if (m) set.add(normalizeCodepoint(m[1]));
  }
  return set;
}

function indexFromCodepoints(name, license, licenseUrl, home, base, available, seeds) {
  const seen = new Set();
  const items = [];
  for (const seed of seeds) {
    const key = seed.u;
    if (!key || seen.has(key) || !available.has(key)) continue;
    seen.add(key);
    items.push({ c: key, n: seed.n, k: seed.k });
  }
  console.log(`  ${items.length} available`);
  return { source: name, license, licenseUrl, home, base, items };
}

async function main() {
  const fluent = await buildFluent();
  await writeFile(join(OUT, 'fluent.json'), JSON.stringify(fluent) + '\n');

  const noto = JSON.parse(
    await readFile(join(OUT, 'noto-animated.json'), 'utf8'),
  );
  const notoItems = noto?.items ?? [];

  // Seed names/keywords: Fluent first (richest), then Noto for anything new.
  const seeds = new Map();
  for (const it of fluent.items) seeds.set(it.u, { u: it.u, n: it.n, k: it.k });
  for (const it of notoItems) {
    const u = normalizeCodepoint(it.c);
    if (!seeds.has(u)) seeds.set(u, { u, n: it.n, k: it.k });
  }
  const seedList = [...seeds.values()];
  console.log(`• ${seedList.length} candidate codepoints`);

  console.log('• Twemoji: fetching tree…');
  const twemojiSet = await svgCodepoints('jdecked/twemoji', 'main');
  const twemoji = indexFromCodepoints(
    'Twemoji',
    'CC BY 4.0',
    'https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS',
    'https://github.com/jdecked/twemoji',
    TWEMOJI_BASE,
    twemojiSet,
    seedList,
  );
  await writeFile(join(OUT, 'twemoji.json'), JSON.stringify(twemoji) + '\n');

  console.log('• EmojiTwo: fetching tree…');
  const emojitwoSet = await svgCodepoints('EmojiTwo/emojitwo', 'master');
  const emojitwo = indexFromCodepoints(
    'EmojiTwo',
    'CC BY 4.0',
    'https://github.com/EmojiTwo/emojitwo',
    'https://github.com/EmojiTwo/emojitwo',
    EMOJITWO_BASE,
    emojitwoSet,
    seedList,
  );
  await writeFile(join(OUT, 'emojitwo.json'), JSON.stringify(emojitwo) + '\n');

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
