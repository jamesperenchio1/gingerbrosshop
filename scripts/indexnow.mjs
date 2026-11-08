// Tell Bing, Yandex and other IndexNow engines which URLs changed. Bing's index
// also feeds ChatGPT search and Copilot, so this speeds up AI discoverability.
//
// Run AFTER a production deploy (the key file must be live at
// https://gingerbrosshop.com/<key>.txt, it lives in public/). Dry run by default:
//   node scripts/indexnow.mjs            # print what would be submitted
//   node scripts/indexnow.mjs --submit   # actually POST to api.indexnow.org
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const HOST = 'gingerbrosshop.com';
const root = process.cwd();
const keyFile = (await readdir(path.join(root, 'public'))).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('no IndexNow key file (<32 hex>.txt) in public/');
const key = keyFile.replace(/\.txt$/, '');

// Prefer the freshly built sitemap; fall back to the live one.
let xml;
try {
  xml = await readFile(path.join(root, 'dist', 'sitemap.xml'), 'utf8');
} catch {
  xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
}
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`${urlList.length} URLs, key ${key}`);

if (!process.argv.includes('--submit')) {
  console.log('dry run: pass --submit to POST them. First 5:\n' + urlList.slice(0, 5).join('\n'));
  process.exit(0);
}

const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList }),
});
console.log(`IndexNow responded HTTP ${res.status} (200/202 = accepted)`);
if (res.status >= 400) process.exit(1);
