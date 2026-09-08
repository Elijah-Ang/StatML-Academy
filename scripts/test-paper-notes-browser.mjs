/* Shared-theme regression: run after build validation.
 * Uses Playwright Chromium, or installed Chrome when its bundle is absent.
 * PAPER_NOTES_SCREENSHOTS=/absolute/path saves review images outside the site.
 */
import { createServer } from 'node:http';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + path);
    if (!file.startsWith(root + '/')) throw new Error('Outside root');
    response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch {
    response.writeHead(404); response.end('Not found');
  }
});
const expect = (condition, message) => { if (!condition) throw new Error(message); };
const pages = ['index.html', ...(await readdir(join(root, 'modules'))).filter(f => f.endsWith('.html')).map(f => 'modules/' + f)];
const failures = [];
const screenshots = process.env.PAPER_NOTES_SCREENSHOTS;
if (screenshots) await mkdir(screenshots, { recursive: true });
await new Promise(resolveListen => server.listen(0, '127.0.0.1', resolveListen));
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    ...(!existsSync(chromium.executablePath()) ? { channel: 'chrome' } : {})
  });
  const page = await browser.newPage();
  let errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const path of pages) {
      errors = [];
      try {
        await page.goto(`http://127.0.0.1:${server.address().port}/${path}${path.includes('deep-learning') ? '?academy=1' : ''}`, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        expect(await page.locator('body.paper-notes').count(), path + ': shared finish not loaded');
        const stage = page.locator('.statml-stage,.stage-section,.stage,.story-section').filter({ has: page.locator('h2') }).first();
        if (await stage.count()) {
          await stage.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
          await page.waitForTimeout(80);
        }
        const geometry = await page.evaluate(() => {
          const visual = document.querySelector('.statml-visual');
          const rect = visual?.getBoundingClientRect();
          const children = visual ? [...visual.children].filter(el => {
            const s = getComputedStyle(el);
            return !el.matches('svg,.mobile-sheet-hint') && s.position !== 'absolute' && s.display !== 'none' && el.getBoundingClientRect().height > 0;
          }) : [];
          return {
            overflow: document.documentElement.scrollWidth > innerWidth + 2,
            themeError: window.__statmlHandwrittenThemeError,
            row: visual?.classList.contains('paper-visual-row'),
            align: visual && getComputedStyle(visual).alignItems,
            visualWidth: rect?.width,
            boardBottom: rect?.bottom,
            firstHeadingTop: document.querySelector('.statml-stage h2')?.getBoundingClientRect().top,
            children: children.map(el => ({ height: el.getBoundingClientRect().height, name: el.id || el.className }))
          };
        });
        expect(!geometry.overflow, path + ': horizontal page overflow at ' + width);
        expect(!geometry.themeError, path + ': decoration error');
        if (width === 390 && geometry.visualWidth > 0 && geometry.firstHeadingTop != null) {
          expect(geometry.firstHeadingTop >= geometry.boardBottom - 2, path + ': stage heading hidden by pinned chart');
        }
        if (width > 900 && geometry.row) expect(geometry.align === 'center', path + ': chart not centered');
        if (geometry.visualWidth > 0) for (const child of geometry.children) expect(child.height > 20, path + ': collapsed visual ' + child.name);
        expect(!errors.length, path + ': ' + errors.join('; '));
        if (screenshots && /index|correlation|one-r|probability-sampling|deep-learning|naive-bayes/.test(path)) {
          await page.waitForTimeout(450); // capture settled ink, not an in-progress stage fade
          await page.screenshot({ path: join(screenshots, path.replace('modules/', '').replace('.html', '') + '-' + width + '.png') });
        }
      } catch (error) { failures.push(error.message); }
    }
  }
  // Verify selection and feedback survive decoration/re-decoration.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`http://127.0.0.1:${server.address().port}/modules/one-r.html`);
  for (const metric of ['accuracy', 'precision', 'recall']) {
    const button = page.locator(`[data-cv-metric="${metric}"]`);
    await button.click();
    expect(await button.getAttribute('aria-pressed') === 'true', 'One-R metric selection failed');
  }
  await page.goto(`http://127.0.0.1:${server.address().port}/modules/probability-sampling.html`);
  await page.locator('.quiz-option[data-correct="true"]').first().click();
  expect((await page.locator('.feedback').first().textContent()).trim().length > 0, 'Quiz feedback missing');
  if (failures.length) throw new Error(failures.join('\n'));
  console.log(`Paper-notes checks passed: ${pages.length} pages at desktop and phone widths, plus CV selection and quiz feedback.`);
} finally {
  await browser?.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
