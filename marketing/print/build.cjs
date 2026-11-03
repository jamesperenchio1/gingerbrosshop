// Renders the print designs to PDF + PNG previews.  node marketing/print/build.cjs
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined }); const dir = __dirname;
  for (const [name, w, h] of [['recipe-card', 148, 210], ['table-tent', 210, 148]]) {
    const p = await b.newPage({ viewport: { width: Math.round(w * 3.78), height: Math.round(h * 3.78) }, deviceScaleFactor: 2 });
    await p.goto('file://' + path.join(dir, name + '.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
    await p.pdf({ path: path.join(dir, name + '.pdf'), width: w + 'mm', height: h + 'mm', printBackground: true, pageRanges: '1' });
    await p.screenshot({ path: path.join(dir, name + '.png') });
  }
  await b.close();
})();
