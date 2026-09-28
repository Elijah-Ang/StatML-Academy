import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve(import.meta.dirname, ".."),
  out = resolve(root, "audit-evidence/visual-storytelling-2026-09-28");
await mkdir(out, { recursive: true });
const server = createServer(async (req, res) => {
  try {
    const p = resolve(root, "." + new URL(req.url, "http://local").pathname);
    if (!p.startsWith(root + "/")) throw Error();
    res.setHeader(
      "Content-Type",
      { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" }[
        extname(p)
      ] || "application/octet-stream",
    );
    res.end(await readFile(p));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + server.address().port,
  browser = await chromium.launch({ channel: "chrome", headless: true }),
  page = await browser.newPage({ reducedMotion: "reduce" }),
  errors = [],
  report = [];
page.on("pageerror", (e) => errors.push(e.message));
const open = async (slug, stage, width) => {
  await page.goto(base + "/modules/" + slug + ".html");
  await page.waitForFunction(() => window.__notebook);
  await page.evaluate(() => document.fonts.ready);
  await page
    .locator("article .stage")
    .nth(stage)
    .evaluate((el) =>
      el.scrollIntoView({ behavior: "instant", block: "start" }),
    );
  await page.waitForFunction((i) => window.__notebook.stage === i, stage);
  if (width <= 900) await page.locator("[data-open-lab]").click();
};
try {
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await open("probability-sampling", 4, width);
    for (const n of [4, 144])
      for (const sigma of [1, 20]) {
        const result = await page.evaluate(
          ({ n, sigma }) => {
            const c = window.__notebook.controller;
            c.update({ n, sigma, sampleIndex: 200 }, false);
            const d = c.data,
              s = document.querySelector("#lab-panel svg"),
              get = (k) => s.querySelector(`[data-key="${k}"]`);
            const topMean = +get("one-mean").getAttribute("cx"),
              lowerMean = +get("mean-199").getAttribute("cx");
            const marks = [
              ...s.querySelectorAll('circle[data-key^="mean-"]'),
            ].filter((e) => !e.closest('[display="none"]'));
            const bottom = +get("sample-means-x").getAttribute("y1");
            return {
              n,
              sigma,
              error: Math.max(
                ...d.samples.map((r, i) =>
                  Math.abs(
                    r.reduce((a, b) => a + b, 0) / r.length - d.means[i],
                  ),
                ),
              ),
              sameScale: Math.abs(topMean - lowerMean),
              range: d.sampleDomain,
              allIncluded: d.samples
                .flat()
                .every((v) => v >= d.sampleDomain[0] && v <= d.sampleDomain[1]),
              allInBand: marks.every(
                (e) =>
                  +e.getAttribute("cy") >= bottom - 96 &&
                  +e.getAttribute("cy") <= bottom,
              ),
              se: d.se,
              retained: s === c.surface.svg,
            };
          },
          { n, sigma },
        );
        report.push({ width, ...result });
        assert.ok(result.error < 1e-12);
        assert.ok(result.sameScale < 1e-9);
        assert.ok(result.allIncluded && result.allInBand && result.retained);
        assert.equal(result.se, sigma / Math.sqrt(n));
      }
    await page
      .locator("#lab-panel svg")
      .screenshot({ path: resolve(out, `sampling-story-${width}.png`) });
    await open("confidence-hypothesis-testing", 1, width);
    const coverage = await page.evaluate(() => {
      const c = window.__notebook.controller;
      c.update({ n: 400, sigma: 20 }, false);
      const d = c.data;
      return {
        count: d.coverage.length,
        correct: d.coverage.every(
          (r, i) =>
            Math.abs(r.mean - (d.means[i] - 50)) < 1e-10 &&
            r.covers === (r.lo <= 0 && r.hi >= 0) &&
            Math.abs(r.hi - r.lo - 2 * 1.9599639845 * d.se) < 1e-10,
        ),
      };
    });
    assert.equal(coverage.count, 40);
    assert.ok(coverage.correct);
    await page
      .locator("#lab-panel svg")
      .screenshot({ path: resolve(out, `coverage-story-${width}.png`) });
    const power = await page.evaluate(() => {
      const c = window.__notebook.controller;
      c.update({ alternative: 4, effect: 0 }, false);
      const p = c.data.power;
      c.update({ effect: 10 }, false);
      return { before: p, after: c.data.power };
    });
    assert.equal(power.before, power.after);
    await open("anova", 3, width);
    const decomposition = await page.evaluate(() => {
      const d = window.__notebook.controller.data,
        r = d.result;
      return {
        total: d.rows.reduce((n, row) => n + (row.y - r.grand) ** 2, 0),
        parts: r.between + r.within,
      };
    });
    assert.ok(Math.abs(decomposition.total - decomposition.parts) < 1e-8);
    await page
      .locator("#lab-panel svg")
      .screenshot({ path: resolve(out, `anova-story-${width}.png`) });
    await open("time-series-analysis", 2, width);
    assert.ok(
      await page.evaluate(() =>
        window.__notebook.controller.data.rows.every(
          (r) => Math.abs(r.y - r.trend - r.seasonal - r.noise) < 1e-10,
        ),
      ),
    );
    await page
      .locator("#lab-panel svg")
      .screenshot({ path: resolve(out, `components-story-${width}.png`) });
    await open("gradient-boosting", 2, width);
    const additive = await page.evaluate(async () => {
      const { treePredict } = await import("/modules/notebook/science.js"),
        c = window.__notebook.controller;
      let error = 0;
      for (const round of [0, 1, 8, 30]) {
        c.update({ round }, false);
        const d = c.data;
        for (const r of d.split.train) {
          const prior = d.ensemble.predict(r, Math.max(0, round - 1)),
            delta = round ? treePredict(d.ensemble.trees[round - 1], r) : 0;
          error = Math.max(
            error,
            Math.abs(
              d.ensemble.predict(r, round) - prior - c.state.rate * delta,
            ),
          );
        }
      }
      return error;
    });
    assert.ok(additive < 1e-10);
    await page
      .locator("#lab-panel svg")
      .screenshot({ path: resolve(out, `boosting-story-${width}.png`) });
  }
  assert.deepEqual(errors, []);
  await writeFile(
    resolve(out, "statistics-stories-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    "Statistical story checks passed: shared value scales, all sample values included, means confined to their band, exact coverage construction, separate prospective power, ANOVA decomposition, additive time components, boosting identity at four rounds. Desktop/phone screenshots saved.",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
