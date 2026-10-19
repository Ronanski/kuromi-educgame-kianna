// Browser smoke test: plays one full round of each subject and saves screenshots.
// Run: npm run smoke   (needs Playwright + Chromium; serves the folder on :8099)
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('..', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  const path = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  try { res.writeHead(200, { 'content-type': types[extname(path)] || 'text/plain' }); res.end(await readFile(path)); }
  catch { res.writeHead(404); res.end(); }
}).listen(8099);

const out = process.env.SHOT_DIR || join(root, 'tests', 'screenshots');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto('http://localhost:8099/');
await page.waitForTimeout(500);
await page.screenshot({ path: join(out, 'home.png') });

for (const subject of ['math', 'english', 'filipino']) {
  await page.click(`[data-subject=${subject}]`);
  for (let i = 0; i < 5; i++) {
    await page.waitForSelector('#screen-quiz.active .choice:not(.right)');
    if (i === 0) await page.waitForTimeout(2500);
    if (i === 0) await page.screenshot({ path: join(out, `quiz-${subject}.png`) });
    // The answer is not exposed to the page, so tap choices like a child would until one is right.
    const buttons = await page.$$('#q-choices .choice');
    for (const b of buttons) {
      await b.click();
      if (await b.evaluate((el) => el.classList.contains('right'))) break;
    }
    await page.waitForTimeout(1400);
  }
  await page.waitForSelector('#screen-result.active');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(out, `result-${subject}.png`) });
  await page.click('#btn-result-home');
}
const stars = await page.textContent('#star-total');
await page.click('#btn-stickers');
await page.waitForTimeout(500);
await page.screenshot({ path: join(out, 'stickers.png') });

// Parent: custom mascot picture replaces the default and survives a reload.
await page.click('#btn-stickers-home');
await page.click('#btn-parent');
await page.setInputFiles('#mascot-file', join(root, 'icons', 'icon-192.png'));
await page.waitForSelector('#mascot-preview img.custom');
await page.waitForTimeout(400);
await page.screenshot({ path: join(out, 'parent-custom-mascot.png') });
await page.reload();
const customAfterReload = await page.$('#mascot-home img.custom');
if (!customAfterReload) errors.push('custom mascot not kept after reload');
await page.click('#btn-parent');
await page.click('#btn-mascot-default');
if (!(await page.$('#mascot-home svg.noxie'))) errors.push('default mascot not restored');
await browser.close();
server.close();

if (errors.length) { console.error('Page errors:', errors); process.exit(1); }
if (Number(stars) < 3) { console.error(`Expected >=3 stars after 3 rounds, got ${stars}`); process.exit(1); }
console.log(`Smoke OK: 3 rounds played, custom mascot OK, stars=${stars}, screenshots in ${out}`);
