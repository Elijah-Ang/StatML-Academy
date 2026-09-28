import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'http://127.0.0.1:4173/modules/deep-learning.html?academy=1';
const out = '/tmp/deep-hybrid-v2';
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { runs: [] };

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport });
  const events = [];
  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') events.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', error => events.push(`pageerror: ${error.message}`));
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('.deep-hybrid-host', { state: 'attached' });
  await page.waitForTimeout(500);
  const run = { viewport, chapters: [], events };

  for (let chapter = 1; chapter <= 12; chapter += 1) {
    await page.evaluate(index => {
      const article = document.querySelector(`.lesson-step[data-step="${index}"]`);
      article?.scrollIntoView({ block: 'center' });
    }, chapter - 1);
    await page.waitForFunction(index => window.__statmlDeepLearningRenderer?.getState().active === index, chapter - 1);
    await page.waitForTimeout(180);
    const stage = viewport.name === 'mobile'
      ? page.locator(`.lesson-step[data-step="${chapter - 1}"] .deep-mobile-scene`)
      : page.locator('.visual-stage');
    const box = await stage.boundingBox();
    const state = await page.evaluate(() => ({
      renderer: window.__statmlDeepLearningRenderer?.getState(),
      debug: window.__statmlDeepLearningRenderer?.debugBounds(),
      diagnostics: window.__statmlDeepLearningRendererDiagnostics || [],
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    run.chapters.push({ chapter, box, state });
    await stage.screenshot({ path: `${out}/${viewport.name}-ch${String(chapter).padStart(2, '0')}.png` });
  }

  if (viewport.name === 'desktop') {
    await page.evaluate(() => document.querySelector('.lesson-step[data-step="1"]')?.scrollIntoView({ block: 'center' }));
    await page.waitForFunction(() => window.__statmlDeepLearningRenderer?.getState().active === 1);
    await page.locator('.toggle-button').click();
    await page.waitForTimeout(100);
    await page.locator('.visual-stage').screenshot({ path: `${out}/desktop-ch02-biased.png` });

    await page.evaluate(() => document.querySelector('.lesson-step[data-step="3"]')?.scrollIntoView({ block: 'center' }));
    await page.waitForFunction(() => window.__statmlDeepLearningRenderer?.getState().active === 3);
    for (const mode of ['text', 'audio']) {
      await page.getByRole('button', { name: mode, exact: true }).click();
      await page.waitForTimeout(100);
      await page.locator('.visual-stage').screenshot({ path: `${out}/desktop-ch04-${mode}.png` });
    }

    await page.evaluate(() => document.querySelector('.lesson-step[data-step="8"]')?.scrollIntoView({ block: 'center' }));
    await page.waitForFunction(() => window.__statmlDeepLearningRenderer?.getState().active === 8);
    for (const architecture of ['RNN', 'TRANSFORMER']) {
      await page.locator('.architecture-tabs button').filter({ hasText: architecture }).click();
      await page.waitForTimeout(140);
      await page.locator('.visual-stage').screenshot({ path: `${out}/desktop-ch09-${architecture.toLowerCase()}.png` });
    }
  }
  report.runs.push(run);
  await page.close();
}

await browser.close();
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(`${out}/report.json`);
