// Loads every prerendered route in a real browser and fails on React hydration
// errors. Usage: node scripts/check-hydration.mjs http://localhost:4174
import { chromium } from '@playwright/test';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const base = process.argv[2] || 'http://localhost:4174';
const dist = path.join(process.cwd(), 'dist');
const routes = ['/'];
(function walk(dir, rel = '') {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) {
      if (!['assets', 'images', 'stickers', 'linkpage'].includes(f)) walk(p, `${rel}/${f}`);
    } else if (f === 'index.html' && rel) routes.push(rel);
  }
})(dist);

const browser = await chromium.launch();
let bad = 0;
for (const route of routes) {
  const page = await browser.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' && /React error|[Hh]ydrat/.test(m.text())) errs.push(m.text().slice(0, 160)); });
  page.on('pageerror', (e) => { if (/React error|[Hh]ydrat/.test(e.message)) errs.push(e.message.slice(0, 160)); });
  await page.goto(base + route, { waitUntil: 'load' }).catch(() => {});
  await page.waitForTimeout(800);
  if (errs.length) { bad++; console.log('FAIL', route, errs[0]); } else console.log('ok  ', route);
  await page.close();
}
await browser.close();
console.log(bad ? `${bad} route(s) with hydration errors` : 'all routes hydrate cleanly');
process.exit(bad ? 1 : 0);
