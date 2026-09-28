import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, join } from "node:path";
const root = resolve(import.meta.dirname, ".."),
  out = join(root, "audit-evidence/visual-storytelling-2026-09-28");
await mkdir(out, { recursive: true });
const server = createServer(async (req, res) => {
  try {
    const file = resolve(root, "." + new URL(req.url, "http://local").pathname);
    if (!file.startsWith(root + "/")) throw Error();
    res.setHeader("Content-Type", { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" }[extname(file)] || "application/octet-stream");
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + server.address().port,
  browser = await chromium.launch({ channel: "chrome", headless: true }),
  page = await browser.newPage({ reducedMotion: "reduce" }),
  errors = [], report = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  for (const width of [1440, 430, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + "/modules/knn.html");
    await page.waitForFunction(() => window.__notebook);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.__notebook.setStage(7));
    if (width <= 900) await page.locator("[data-open-lab]").click();
    for (const k of [1, 5, 21]) for (const weighted of ["no", "yes"]) for (const exact of [false, true]) {
      await page.evaluate(({ k, weighted, exact }) => {
        const c = window.__notebook.controller, row = c.data.split.train[0];
        c.update({ k, weighted, query: exact ? row.x : 0, second: exact ? row.z : 0 }, false);
      }, { k, weighted, exact });
      const result = await page.evaluate(() => {
        const c = window.__notebook.controller, svg = document.querySelector("#lab-panel svg"),
          bounds = svg.viewBox.baseVal,
          text = [...svg.querySelectorAll("text")].filter((el) => !el.closest('[display="none"]')).map((el) => {
            const b = el.getBBox(); return { text: el.textContent, x: b.x, y: b.y, w: b.width, h: b.height };
          }),
          clipped = text.filter((b) => b.x < -0.7 || b.y < -0.7 || b.x + b.w > bounds.width + 0.7 || b.y + b.h > bounds.height + 0.7),
          overlaps = [];
        for (let i = 0; i < text.length; i++) for (let j = i + 1; j < text.length; j++) {
          const a = text[i], b = text[j];
          if (Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 1 && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 1) overlaps.push([a.text, b.text]);
        }
        return {
          count: text.filter((t) => /^C\d+$/.test(t.text)).length,
          weight: c.data.votes.rows.reduce((n, r) => n + r.weight, 0),
          share: c.data.votes.classOne,
          prediction: c.data.fit.predict({ x: c.state.query, z: c.state.second }),
          exactMatches: c.data.votes.exactMatches,
          clipped, overlaps, viewControls: document.querySelectorAll("#view").length,
        };
      });
      report.push({ width, k, weighted, exact, ...result });
      assert.equal(result.count, k);
      assert.ok(Math.abs(result.weight - 1) < 1e-10);
      assert.ok(Math.abs(result.share - result.prediction) < 1e-10);
      assert.equal(result.exactMatches > 0, exact);
      assert.deepEqual(result.clipped, [], JSON.stringify(report.at(-1)));
      assert.deepEqual(result.overlaps, [], JSON.stringify(report.at(-1)));
      assert.equal(result.viewControls, 0);
    }
    await page.evaluate(() => window.__notebook.controller.update({ query: 0, second: 0 }, false));
    await page.locator("#lab-panel svg").screenshot({ path: join(out, `knn-votes-${width}.png`) });
    await page.goto(base + "/modules/model-selection.html");
    await page.waitForFunction(() => window.__notebook);
    await page.evaluate(() => window.__notebook.setStage(3));
    const scores = await page.evaluate(() => {
      const c = window.__notebook.controller, scores = [];
      for (const penalty of ["ridge", "lasso"]) for (const lambda of [0, 0.8, 2]) {
        c.update({ penalty, lambda }, false);
        scores.push({ penalty, lambda, aic: c.data.criteria.aic, bic: c.data.criteria.bic, rss: c.data.criteria.rss,
          candidate: c.data.criteria.fit.coefficients, penalized: c.data.fit.coefficients,
          label: document.querySelector("#lab-receipt").textContent });
      }
      return scores;
    });
    for (const score of scores) {
      assert.equal(score.aic, scores[0].aic); assert.equal(score.bic, scores[0].bic); assert.equal(score.rss, scores[0].rss);
      assert.match(score.label, /Unpenalized/);
    }
    assert.notDeepEqual(scores[0].penalized, scores[2].penalized);
    report.push({ width, criteria: scores });
  }
  assert.deepEqual(errors, []);
  await writeFile(join(out, "vote-criteria-report.json"), JSON.stringify(report, null, 2));
  console.log("Browser vote/criteria checks passed: 36 vote cases across desktop/mobile widths, all neighbors visible, no label collisions, exact weights, no view selector, penalty-independent AIC/BIC.");
} finally { await browser.close(); await new Promise((r) => server.close(r)); }
