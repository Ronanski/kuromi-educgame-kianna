// Browser smoke test for "Mabuting Asal": plays every lesson (watch + practice) like a child,
// using ?fast=1 so animations and voice are quick. Run: npm run smoke:values
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('..', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  const path = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  try { res.writeHead(200, { 'content-type': types[extname(path)] || 'text/plain' }); res.end(await readFile(path)); }
  catch { res.writeHead(404); res.end(); }
}).listen(8097);

const out = process.env.SHOT_DIR || join(root, 'tests', 'screenshots');
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

async function centre(handle) {
  const b = await handle.boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

await page.goto('http://localhost:8097/?fast=1');
await page.click('#btn-values');
const ids = await page.$$eval('.lesson-card', (els) => els.map((e) => e.dataset.lesson));
for (const id of ids) {
  await page.click(`[data-lesson="${id}"]`);
  await page.waitForSelector('#lesson-phase.wrong');
  await page.waitForSelector('#lesson-phase.practice', { timeout: 20000 });
  let shot = false;
  // Do whatever the lesson asks until it finishes.
  for (let guard = 0; guard < 20; guard++) {
    const which = await Promise.race([
      page.waitForSelector('#screen-lesson-done.active', { timeout: 15000 }).then(() => 'done'),
      page.waitForSelector('.tap-bubble', { timeout: 15000 }).then(() => 'tap'),
      page.waitForSelector('[data-drag]', { timeout: 15000 }).then(() => 'drag'),
    ]);
    if (which === 'done') break;
    if (!shot) { await page.waitForTimeout(150); await page.screenshot({ path: join(out, `lesson-${id}-practice.png`) }); shot = true; }
    if (which === 'tap') { await page.click('.tap-bubble'); continue; }
    const from = await centre(await page.$('[data-drag]'));
    const to = await centre(await page.$('[data-drop]'));
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(200);
  }
  await page.waitForSelector('#screen-lesson-done.active', { timeout: 15000 });
  if (id === 'mano') await page.screenshot({ path: join(out, 'lesson-done.png') });
  await page.click('#btn-lesson-menu');
}
const doneCount = await page.$$eval('.lesson-card.done', (els) => els.length);
await page.screenshot({ path: join(out, 'values-menu.png') });

// Wrong drop in "pila": dropping Noxie at the front must NOT finish the task.
await page.click('[data-lesson="pila"]');
await page.waitForSelector('[data-drag]', { timeout: 20000 });
const noxie = await centre(await page.$('[data-drag]'));
const front = await centre(await page.$('.actor[data-id="k1"]'));
await page.mouse.move(noxie.x, noxie.y); await page.mouse.down();
await page.mouse.move(front.x, front.y, { steps: 8 }); await page.mouse.up();
await page.waitForTimeout(300);
const stillPractising = await page.$('[data-drag]');
const caption = await page.textContent('#lesson-caption');
await page.click('#btn-lesson-back');

// A parent's custom mascot picture must star in the stories too.
await page.click('#btn-values-home');
await page.click('#btn-parent');
await page.setInputFiles('#mascot-file', join(root, 'icons', 'icon-192.png'));
await page.waitForSelector('#mascot-preview img.custom');
await page.click('#btn-parent-home');
await page.click('#btn-values');
await page.click('[data-lesson="mano"]');
await page.waitForSelector('#stage .actor[data-id="noxie"] img.custom');
const customInStory = true;
await page.click('#btn-lesson-back');

await browser.close();
server.close();
if (!stillPractising) errors.push('wrong drop in "pila" finished the task');
if (!/unahan|dulo/i.test(caption)) errors.push(`wrong drop gave no explanation, caption: ${caption}`);
if (doneCount !== ids.length) errors.push(`expected ${ids.length} lessons done, got ${doneCount}`);
if (errors.length) { console.error('Errors:', errors); process.exit(1); }
console.log(`Values smoke OK: ${ids.length} lessons played, wrong-drop check OK, custom mascot in story: ${customInStory}, screenshots in ${out}`);
