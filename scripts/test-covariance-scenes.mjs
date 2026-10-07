import { auditOutput } from "./audit-output.mjs";
import assert from "node:assert/strict";
import { covarianceContour, squaredMahalanobis } from "../modules/notebook/classification.js";
import { classificationData, splitRows, discriminantFit } from "../modules/notebook/science.js";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, join } from "node:path";

let contourChecks = 0;
for (const scenario of ["clouds", "unequal", "rings"])
  for (const separate of [false, true])
    for (const shrink of [0, 0.5, 1]) {
      const fit = discriminantFit(splitRows(classificationData(42, scenario)).train, separate, shrink),
        centered = [];
      for (const e of fit.estimates) {
        assert.ok(e.det > 0);
        for (const radius of [0.5, 1, 2])
          for (const point of covarianceContour(e, radius)) {
            assert.ok(Math.abs(squaredMahalanobis(e, point) - radius ** 2) < 1e-10);
            contourChecks++;
          }
        centered.push(covarianceContour(e).map((p) => [p.x - e.mx, p.z - e.mz]));
      }
      if (!separate || shrink === 1)
        centered[0].forEach((p, i) => p.forEach((v, j) => assert.ok(Math.abs(v - centered[1][i][j]) < 1e-10)));
    }

const root = resolve(import.meta.dirname, ".."), out = auditOutput(root, "audit-evidence/visual-storytelling-2026-09-28");
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
  page = await browser.newPage({ reducedMotion: "reduce" }), errors = [], report = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  for (const width of [1440, 430, 320]) for (const slug of ["lda", "qda"]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + "/modules/" + slug + ".html");
    await page.waitForFunction(() => window.__notebook);
    await page.evaluate(() => document.fonts.ready);
    const stage = slug === "lda" ? 5 : 3;
    await page.locator("article .stage").nth(stage).evaluate((el) => el.scrollIntoView({ behavior: "instant", block: "start" }));
    await page.waitForFunction((stage) => window.__notebook.stage === stage, stage);
    if (width <= 900) await page.locator("[data-open-lab]").click();
    for (const radius of [0.5, 1, 2]) for (const shrink of slug === "qda" ? [0, 0.5, 1] : [0]) {
      await page.evaluate(({ radius, shrink }) => window.__notebook.controller.update({ radius, shrink, scenario: "unequal" }, false), { radius, shrink });
      const result = await page.evaluate(() => {
        const svg = document.querySelector("#lab-panel svg"), bounds = svg.viewBox.baseVal,
          text = [...svg.querySelectorAll("text")].filter((el) => !el.closest('[display="none"]')).map((el) => {
            const b = el.getBBox(); return { text: el.textContent, x: b.x, y: b.y, w: b.width, h: b.height };
          }),
          clipped = text.filter((b) => b.x < -0.7 || b.y < -0.7 || b.x + b.w > bounds.width + 0.7 || b.y + b.h > bounds.height + 0.7), overlaps = [];
        for (let i = 0; i < text.length; i++) for (let j = i + 1; j < text.length; j++) {
          const a = text[i], b = text[j];
          if (Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 1 && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 1) overlaps.push([a.text, b.text]);
        }
        const visible = (key) => svg.querySelector(`[data-key="${key}"]`)?.getAttribute("display") !== "none";
        return { clipped, overlaps, stage: window.__notebook.stage, visual: svg.dataset.visual, centers: [0, 1].map((j) => visible("class-center-" + j)), contours: [0, 1].map((j) => visible("centered-contour-" + j)) };
      });
      report.push({ width, slug, radius, shrink, ...result });
      assert.deepEqual(result.clipped, [], JSON.stringify(report.at(-1)));
      assert.deepEqual(result.overlaps, [], JSON.stringify(report.at(-1)));
      assert.deepEqual(result.centers, [true, true]); assert.deepEqual(result.contours, [true, true]);
      assert.equal(result.stage, stage);
    }
    await page.evaluate(() => window.__notebook.controller.update({ radius: 1, shrink: 0 }, false));
    await page.screenshot({ path: join(out, `${slug}-covariance-${width}.png`) });
  }
  assert.deepEqual(errors, []);
  await writeFile(join(out, "covariance-report.json"), JSON.stringify({ contourChecks, report }, null, 2));
  console.log(`Covariance checks passed: ${contourChecks} contour identities, shared/fully pooled shape equality, ${report.length} responsive scenes without label collisions.`);
} finally { await browser.close(); await new Promise((r) => server.close(r)); }
