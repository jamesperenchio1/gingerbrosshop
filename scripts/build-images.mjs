#!/usr/bin/env node
/**
 * Builds every product, gallery and lifestyle image the storefront uses from
 * the full-resolution sources in assets-src/, and writes
 * src/lib/imageManifest.ts so components know each image's real size.
 *
 *   assets-src/bottles/   transparent bottle cutouts (from the print artwork)
 *   assets-src/photos/    real phone photos of the Fizz bottle
 *   assets-src/lifestyle/ text-free campaign shots (gingerbros-image-gen)
 *
 * Output (public/images/gen/<name>-<width>.{avif,webp}, plus <name>.jpg at
 * full size for Stripe, email and social). Re-run after changing a source:
 *
 *   node scripts/build-images.mjs
 */
import sharp from 'sharp';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const SRC = path.join(root, 'assets-src');
const OUT = path.join(root, 'public/images/gen');
const WIDTHS = [160, 320, 480, 800, 1200, 1600];
const CREAM = { r: 0xfd, g: 0xf8, b: 0xf0 };

const manifest = {};

async function emit(name, input, { alt = false, jpgBg = CREAM } = {}) {
  const meta = await sharp(input).metadata();
  const widths = WIDTHS.filter((w) => w < meta.width).concat(meta.width > 1600 ? [] : [meta.width]);
  const uniq = [...new Set(widths)].sort((a, b) => a - b);
  for (const w of uniq) {
    const r = sharp(input).resize({ width: w });
    await r.clone().avif({ quality: 55, effort: 6 }).toFile(path.join(OUT, `${name}-${w}.avif`));
    await r.clone().webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(path.join(OUT, `${name}-${w}.webp`));
  }
  const top = Math.min(meta.width, 1600);
  await sharp(input).resize({ width: top }).flatten({ background: jpgBg })
    .jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(OUT, `${name}.jpg`));
  manifest[name] = { w: meta.width, h: meta.height, widths: uniq, alpha: alt };
}

const bottle = (n, height) => sharp(path.join(SRC, 'bottles', `ginger-${n}.png`)).resize({ height }).png().toBuffer();

/** Soft elliptical contact shadow under a group of bottles. */
function shadowSvg(width, height, cx, cy, rx, ry, opacity = 0.32) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs><radialGradient id="g"><stop offset="0" stop-color="#2a1608" stop-opacity="${opacity}"/>
      <stop offset="1" stop-color="#2a1608" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#g)"/></svg>`,
  );
}

/**
 * Bottles in a row, slightly overlapping, centre bottles a touch forward.
 * `kinds` is e.g. ['fizz','tea','fizz','tea'].
 */
async function group(kinds, { width, height, bottleH }) {
  const imgs = await Promise.all(kinds.map((k) => bottle(k, bottleH)));
  const metas = await Promise.all(imgs.map((b) => sharp(b).metadata()));
  const overlap = kinds.length > 3 ? 0.14 : 0.06;
  const step = metas.map((m) => m.width * (1 - overlap));
  const total = step.reduce((a, b) => a + b, 0) + metas.at(-1).width * overlap;
  let x = Math.round((width - total) / 2);
  const baseY = height - Math.round(height * 0.06);
  const layers = [{ input: shadowSvg(width, height, width / 2, baseY - 6, total * 0.56, height * 0.035), left: 0, top: 0 }];
  // Draw outer bottles first so the middle ones sit in front.
  const order = kinds.map((_, i) => i).sort((a, b) => Math.abs(b - (kinds.length - 1) / 2) - Math.abs(a - (kinds.length - 1) / 2));
  const pos = [];
  for (let i = 0; i < kinds.length; i++) { pos.push(x); x += step[i]; }
  for (const i of order) {
    const lift = Math.round(Math.abs(i - (kinds.length - 1) / 2) * bottleH * 0.012);
    layers.push({ input: imgs[i], left: Math.round(pos[i]), top: baseY - metas[i].height - lift });
  }
  return sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers).png().toBuffer();
}

const PACKS = {
  'ginger-fizz': ['fizz'],
  'ginger-tea': ['tea'],
  'ginger-fizz-2pack': ['fizz', 'fizz'],
  'ginger-fizz-3pack': ['fizz', 'fizz', 'fizz'],
  'ginger-fizz-6pack': ['fizz', 'fizz', 'fizz', 'fizz', 'fizz', 'fizz'],
  'ginger-tea-2pack': ['tea', 'tea'],
  'ginger-tea-3pack': ['tea', 'tea', 'tea'],
  'ginger-tea-6pack': ['tea', 'tea', 'tea', 'tea', 'tea', 'tea'],
  'fizz-tea-duo': ['fizz', 'tea'],
  'fizz-tea-4pack': ['fizz', 'tea', 'fizz', 'tea'],
};

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  // Product images: one shared 1:1 canvas so every card lines up.
  for (const [id, kinds] of Object.entries(PACKS)) {
    let buf;
    if (kinds.length === 6) {
      // Two staggered rows of three, like a real six-pack: back row raised.
      const back = await group(kinds.slice(0, 3), { width: 1600, height: 1600, bottleH: 1120 });
      const front = await group(kinds.slice(3), { width: 1600, height: 1600, bottleH: 1180 });
      buf = await sharp({ create: { width: 1600, height: 1600, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([
          { input: await sharp(back).extract({ left: 0, top: 230, width: 1540, height: 1370 }).modulate({ brightness: 0.8 }).toBuffer(), left: 60, top: 0 },
          { input: await sharp(front).extract({ left: 60, top: 0, width: 1540, height: 1600 }).toBuffer(), left: 0, top: 0 },
        ]).png().toBuffer();
    } else {
      const bottleH = kinds.length >= 3 ? 1300 : 1400;
      buf = await group(kinds, { width: 1600, height: 1600, bottleH });
    }
    await emit(id, buf, { alt: true });
    console.log('product', id);
  }

  // Lone bottles, tall and tight, for the hero and the lineup panels.
  for (const n of ['fizz', 'tea']) {
    await emit(`bottle-${n}`, await bottle(n, 2000), { alt: true });
  }

  // Real photos of the Fizz bottle on its grey sweep, padded to 4:5.
  for (const n of ['angle', 'back', 'story']) {
    const src = path.join(SRC, 'photos', `fizz-${n}.jpg`);
    const m = await sharp(src).metadata();
    const H = m.height + 240;
    const W = Math.round(H * 0.8);
    const buf = await sharp(src).extend({
      top: 120, bottom: 120, left: Math.round((W - m.width) / 2), right: W - m.width - Math.round((W - m.width) / 2),
      background: { r: 240, g: 238, b: 234 },
    }).resize({ width: 1600 }).jpeg({ quality: 92 }).toBuffer();
    await emit(`fizz-${n}`, buf);
  }
  await emit('fizz-six-lineup', path.join(SRC, 'photos', 'fizz-six-lineup.jpg'));

  for (const n of ['pair-som-tam', 'pair-kra-pao', 'pair-mango', 'night-market', 'cheers', 'pour-cold', 'ice-stool', 'stoop']) {
    await emit(`life-${n}`, path.join(SRC, 'lifestyle', `${n}.jpg`));
  }

  const ts = `// Generated by scripts/build-images.mjs. Do not edit by hand.
export interface ImageEntry { w: number; h: number; widths: number[]; alpha: boolean }
export const IMAGE_MANIFEST: Record<string, ImageEntry> = ${JSON.stringify(manifest, null, 2)};
`;
  await writeFile(path.join(root, 'src/lib/imageManifest.ts'), ts);
  console.log(`wrote ${Object.keys(manifest).length} images`);
}

main().catch((e) => { console.error(e); process.exit(1); });
