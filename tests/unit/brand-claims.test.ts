/**
 * GingerBros drinks are not fermented, and the site must not make health or
 * medical claims (Thai FDA rules). This fails the build if any of that copy
 * creeps back into storefront source, meta or public files.
 *
 * KegLand equipment content legitimately talks about brewing and kombucha, so
 * the equipment entries in productContent.ts are excluded.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');

const BANNED: RegExp[] = [
  /ferment/i, /prebiotic/i, /probiotic/i, /ginger bug/i, /live[- ]cultures?/i, /living (brew|fizz|culture)/i,
  /\bgut\b/i, /immun/i, /blood sugar/i, /inflammat/i, /detox/i, /naturally brewed/i,
  /หมัก/, /พรีไบโอติก/, /โพรไบโอติก/, /จุลินทรีย์/, /ลำไส้/, /ภูมิคุ้มกัน/,
];

/** Lines that may mention these words for a legitimate reason. */
const ALLOWED: RegExp[] = [
  /^\s*(\/\/|\*|\/\*)/, // code comments
  /(are|is) not fermented/i, // saying so is the point
  /Fermented ginger beer became hugely popular in 18th-century England/, // history post, about ginger beer in general
  /\*\*Ginger beer\*\* stayed true to its roots: fermented/,
  /ginger ale.*little or no fermentation/i,
  /\/blog\/(gut-health|probiotics-prebiotics|ginger-immunity|ginger-bug-at-home)/, // 301 redirects
];

function files(dir: string, exts: string[]): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === 'admin' || name === 'linkpage' ? [] : files(full, exts);
    return exts.some((e) => name.endsWith(e)) ? [full] : [];
  });
}

function equipmentFree(file: string, text: string): string {
  if (!file.endsWith('productContent.ts')) return text;
  // Keep only the drink section (everything after the drinks marker).
  const i = text.indexOf('// ─── Drink products');
  const shared = text.indexOf('/** Shared by Ginger Fizz');
  return (shared >= 0 ? text.slice(shared, text.indexOf('export const PRODUCT_CONTENT')) : '') + (i >= 0 ? text.slice(i) : '');
}

const TARGETS = [
  ...files(path.join(root, 'src'), ['.ts', '.tsx']).filter((f) => !f.includes(`${path.sep}pages${path.sep}Admin`)),
  path.join(root, 'index.html'),
  path.join(root, 'middleware.ts'),
  path.join(root, 'public/site.webmanifest'),
  path.join(root, 'public/llms.txt'),
  path.join(root, 'api/_lib/linkpageSchema.ts'),
];

describe('brand claims', () => {
  it.each(TARGETS.map((f) => [path.relative(root, f), f]))('%s has no fermentation or health claims', (_rel, file) => {
    const text = equipmentFree(file, readFileSync(file, 'utf8'));
    const hits = text
      .split('\n')
      .map((line, n) => ({ line, n: n + 1 }))
      .filter(({ line }) => !line.includes('brand-claims') && BANNED.some((re) => re.test(line)) && !ALLOWED.some((re) => re.test(line)))
      .map(({ line, n }) => `${n}: ${line.trim().slice(0, 140)}`);
    expect(hits).toEqual([]);
  });
});
