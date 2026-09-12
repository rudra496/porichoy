/* Records the live Porichoy demo (3 clips) via real Chrome + recordVideo.
   Run: node record_demo.js   → clips/  */
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  fs.mkdirSync('clips', { recursive: true });
  const base = 'https://rudra496.github.io/porichoy/';
  const browser = await chromium.launch({ channel: 'chrome', headless: false });

  async function record(name, actions) {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: 'clips', size: { width: 1280, height: 720 } },
    });
    const page = await ctx.newPage();
    await actions(page);
    await page.waitForTimeout(800);
    await ctx.close(); // flushes the video file
    // rename newest webm to name
    const files = fs.readdirSync('clips').filter((f) => f.endsWith('.webm'));
    const newest = files.map((f) => ({ f, t: fs.statSync('clips/' + f).mtimeMs })).sort((a, b) => b.t - a.t)[0];
    fs.renameSync('clips/' + newest.f, 'clips/' + name + '.webm');
    console.log('recorded', name);
  }

  // clip 1: landing hook + problem
  await record('01_landing', async (page) => {
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1600);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1200);
  });

  // clip 2: sample ingest + dashboard scores
  await record('02_dashboard', async (page) => {
    await page.goto(base + '#/app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    await page.evaluate(async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) await r.unregister();
      const keys = await caches.keys();
      for (const k of keys) await caches.delete(k);
      localStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.getByText('Load sample data').click();
    await page.waitForTimeout(3200);
    await page.getByText('Provenance chain live').waitFor({ timeout: 15000 });
    await page.waitForTimeout(2500);
  });

  // clip 3: QR + passport buyer view
  await record('03_passport', async (page) => {
    await page.goto(base + '#/app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    await page.getByText('Load sample data').click();
    await page.waitForTimeout(3500);
    await page.goto(base + '#/app/po/PO-1002', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    await page.getByText('Generate QR & passport').click();
    await page.waitForTimeout(2600);
    const link = await page.evaluate(() => {
      const m = document.querySelector('.mono')?.innerText || '';
      return m.startsWith('http') ? m : null;
    });
    if (!link) throw new Error('no passport link found');
    await page.goto(link, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200);
    await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
    await page.waitForTimeout(2200);
  });

  await browser.close();
  console.log('all clips recorded');
})();
