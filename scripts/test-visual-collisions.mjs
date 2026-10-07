import { auditOutput } from "./audit-output.mjs";
import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import assert from "node:assert/strict";
import { resolve, extname } from "node:path";
import { catalog } from "../modules/notebook/catalog.js";
const root = resolve(import.meta.dirname, ".."),
  out = auditOutput(root, "audit-evidence/visual-storytelling-2026-09-28");
const modules = {
  "simple-linear-regression": 8,
  kmeans: 9,
  "naive-bayes": 12,
  "evaluation-metrics": 9,
  ...Object.fromEntries(
    Object.entries(catalog).map(([slug, c]) => [slug, c.scenes.length]),
  ),
};
const prioritized = [
  "neural-networks",
  "deep-learning",
  "random-forest",
  "anova",
  ...Object.keys(modules).filter(
    (s) =>
      !["neural-networks", "deep-learning", "random-forest", "anova"].includes(
        s,
      ),
  ),
];
const slugs = process.env.COLLISION_SLUGS?.split(",") || prioritized;
const widths = (process.env.COLLISION_WIDTHS || "1440,430,320")
  .split(",")
  .map(Number);
const suffix = process.env.COLLISION_LABEL || "final";
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
const base =
  process.env.COLLISION_BASE || "http://127.0.0.1:" + server.address().port;
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const report = {
  started: new Date().toISOString(),
  method:
    "Visible SVG text DOM bounding boxes: intersections above 2 CSS pixels in both dimensions; reports require visual review. Scroll selects each section. Reduced motion; web fonts ready.",
  scenes: [],
  errors: [],
};
let current = "";
page.on("pageerror", (e) => report.errors.push({ current, error: e.message }));
try {
  for (const slug of slugs)
    for (const width of widths) {
      current = `${slug} ${width}`;
      await page.setViewportSize({ width, height: width <= 430 ? 844 : 1000 });
      await page.goto(`${base}/modules/${slug}.html`);
      await page.waitForFunction(
        () => !!window.__notebook,
        {},
        { timeout: 12000 },
      );
      await page.evaluate(() => document.fonts.ready);
      for (let i = 0; i < modules[slug]; i++) {
        current = `${slug} ${width} stage ${i + 1}`;
        await page
          .locator("article .stage")
          .nth(i)
          .evaluate((el) =>
            el.scrollIntoView({ behavior: "instant", block: "start" }),
          );
        try {
          await page.waitForFunction((i) => window.__notebook.stage === i, i, {
            timeout: 2500,
          });
        } catch {
          report.errors.push({ current, error: "scroll/stage mismatch" });
          await page.evaluate((i) => window.__notebook.setStage(i), i);
        }
        if (width <= 900) await page.locator("[data-open-lab]").click();
        await page.waitForFunction(
          () => !window.__notebook.controller.tween?.raf,
        );
        const r = await page.evaluate(() => {
          const svg = document.querySelector("#lab-panel svg"),
            vb = svg.viewBox.baseVal;
          const texts = [...svg.querySelectorAll("text")]
            .filter(
              (t) =>
                !t.closest('[display="none"]') &&
                getComputedStyle(t).display !== "none" &&
                getComputedStyle(t).visibility !== "hidden" &&
                t.textContent.trim(),
            )
            .map((t) => {
              const b = t.getBoundingClientRect(),
                bb = t.getBBox();
              return {
                key: t.dataset.key,
                text: t.textContent,
                box: { x: b.x, y: b.y, w: b.width, h: b.height },
                svgbox: { x: bb.x, y: bb.y, w: bb.width, h: bb.height },
              };
            });
          const pairs = [];
          for (let a = 0; a < texts.length; a++)
            for (let b = a + 1; b < texts.length; b++) {
              const A = texts[a].box,
                B = texts[b].box;
              const dx = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x),
                dy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
              if (dx > 2 && dy > 2)
                pairs.push({
                  a: texts[a],
                  b: texts[b],
                  intersection: { w: dx, h: dy, area: dx * dy },
                });
            }
          const clipped = texts.filter(
            (t) =>
              t.svgbox.x < -0.7 ||
              t.svgbox.y < -0.7 ||
              t.svgbox.x + t.svgbox.w > vb.width + 0.7 ||
              t.svgbox.y + t.svgbox.h > vb.height + 0.7,
          );
          return {
            scene: window.__notebook.controller.scene,
            texts: texts.length,
            svgwidth: vb.width,
            svgheight: vb.height,
            pairs,
            clipped,
          };
        });
        report.scenes.push({ slug, width, stage: i + 1, ...r });
        if (width <= 900) await page.keyboard.press("Escape");
      }
      const relevant = report.scenes.filter(
        (s) => s.slug === slug && s.width === width,
      );
      console.log(
        JSON.stringify({
          slug,
          width,
          stages: relevant.length,
          pairs: relevant.reduce((n, s) => n + s.pairs.length, 0),
          clipped: relevant.reduce((n, s) => n + s.clipped.length, 0),
        }),
      );
      await writeFile(
        resolve(out, `text-collisions-${suffix}.json`),
        JSON.stringify(report, null, 2),
      );
    }
} finally {
  report.finished = new Date().toISOString();
  await writeFile(
    resolve(out, `text-collisions-${suffix}.json`),
    JSON.stringify(report, null, 2),
  );
  await browser.close();
  await new Promise((r) => server.close(r));
}

const failures = report.scenes.filter(
  (s) => s.pairs.length || s.clipped.length,
);
assert.deepEqual(report.errors, []);
assert.equal(
  failures.length,
  0,
  JSON.stringify(
    failures.map((s) => ({
      slug: s.slug,
      width: s.width,
      stage: s.stage,
      pairs: s.pairs.map((p) => [p.a.key, p.b.key]),
      clipped: s.clipped.map((t) => t.key),
    })),
  ),
);
console.log(
  `Passed ${report.scenes.length} scene/viewport checks: no intersecting text boxes or clipped labels.`,
);
