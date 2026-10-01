import assert from "node:assert/strict";
import { topics } from "../modules/notebook/topics.js";
const topicCount = Object.keys(topics).length;
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { resolve, extname, join } from "node:path";
const root = resolve(import.meta.dirname, ".."),
  out = join(root, "audit-evidence/visual-teaching-2026-09-28");
await mkdir(out, { recursive: true });
const server = createServer(async (req, res) => {
  try {
    const file = resolve(root, "." + new URL(req.url, "http://local").pathname);
    if (!file.startsWith(root + "/")) throw Error();
    res.setHeader(
      "Content-Type",
      { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" }[
        extname(file)
      ] || "application/octet-stream",
    );
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + server.address().port,
  browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  }),
  errors = [],
  report = [];
page.on("pageerror", (e) => errors.push(e.message));
const visit = async (slug) => {
  await page.goto(base + "/modules/" + slug + ".html");
  await page.waitForFunction(() => window.__notebook);
  await page.evaluate(() => document.fonts.ready);
};
const stage = async (i) => {
  await page
    .locator("article .stage")
    .nth(i)
    .evaluate((el) =>
      el.scrollIntoView({ behavior: "instant", block: "start" }),
    );
  await page.waitForFunction((i) => window.__notebook.stage === i, i);
};
const input = async (id, value) =>
  page.locator("#" + id).evaluate((el, v) => {
    el.value = String(v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
try {
  for (const width of [1440, 1280, 1200, 1110, 430, 320]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto(base + "/index.html");
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => {
      const selector =
          innerWidth > 1100 ? ".module-node a" : ".mobile-node[href]",
        links = [...document.querySelectorAll(selector)];
      const entries = links.map((a) => ({
        text: a.textContent.trim(),
        path: new URL(a.href).pathname,
        ...(() => {
          const r = a.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        })(),
      }));
      const collisions = [];
      for (let i = 0; i < entries.length; i++)
        for (let j = i + 1; j < entries.length; j++) {
          const a = entries[i],
            b = entries[j];
          if (
            Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 3 &&
            Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 3
          )
            collisions.push([a.text, b.text]);
        }
      return {
        width: innerWidth,
        count: entries.length,
        unique: new Set(entries.map((a) => a.path)).size,
        clipped: entries.filter(
          (a) => a.x < -0.5 || a.x + a.w > innerWidth + 0.5,
        ),
        collisions,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    report.push(result);
    if (
      result.count !== topicCount ||
      result.unique !== topicCount ||
      result.clipped.length ||
      result.collisions.length ||
      result.overflow
    )
      errors.push("Universe " + JSON.stringify(result));
    if (width === 1440)
      await page.screenshot({
        path: join(out, "universe-desktop.png"),
        fullPage: true,
      });
  }
  const slugs = (await readdir(join(root, "modules")))
    .filter((n) => n.endsWith(".html"))
    .map((n) => n.slice(0, -5));
  await page.setViewportSize({ width: 1440, height: 1100 });
  for (const slug of slugs) {
    await visit(slug);
    assert.equal(
      await page.locator("#view,#cluster-view,#metric-view").count(),
      0,
      slug + " allows unrelated visual navigation",
    );
  }
  const shots = {
    "multiple-linear-regression": [0, 4, 6, 8],
    "regression-trees": [3, 7, 10],
    "classification-trees": [4, 7, 8],
    "random-forest": [0, 1, 4],
    "neural-networks": [0, 4, 8, 9, 16],
    "deep-learning": [0, 1, 3, 5, 8, 9],
  };
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [slug, stages] of Object.entries(shots)) {
      await visit(slug);
      for (const i of stages) {
        await stage(i);
        if (width <= 900) await page.locator("[data-open-lab]").click();
        const state = await page.evaluate(() => ({
          stage: window.__notebook.stage,
          visual: document.querySelector("#lab-panel svg").dataset.visual,
          flow: [
            ...document.querySelectorAll('#lab-panel [data-key^="flow"]'),
          ].filter((n) => !n.closest('[display="none"]')).length,
        }));
        assert.ok(state.visual, slug + " lacks a semantic visual");
        assert.equal(state.flow, 0);
        await page.screenshot({
          path: join(out, slug + "-" + (i + 1) + "-" + width + ".png"),
        });
        if (width <= 900) await page.keyboard.press("Escape");
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1100 });
  await visit("neural-networks");
  await stage(9);
  const before = await page.evaluate(() =>
    structuredClone(window.__notebook.controller.data.model),
  );
  const origin = await page.evaluate(
    () => window.__notebook.controller.data.landscape.origin,
  );
  const ballBefore = await page
    .locator("[data-key=loss-here]")
    .getAttribute("cx");
  await page.locator("#landscape-step").click();
  const after = await page.evaluate(() =>
    structuredClone(window.__notebook.controller.data.model),
  );
  assert.deepEqual(
    await page.evaluate(
      () => window.__notebook.controller.data.landscape.origin,
    ),
    origin,
  );
  assert.notEqual(
    await page.locator("[data-key=loss-here]").getAttribute("cx"),
    ballBefore,
    "The gradient point should move in fixed coordinates",
  );
  assert.equal(
    await page.evaluate(
      () => window.__notebook.controller.data.landscapeTrail.length,
    ),
    2,
  );
  assert.deepEqual(after.hidden, before.hidden);
  assert.equal(after.bias, before.bias);
  assert.equal(after.out[2], before.out[2]);
  assert.notEqual(after.out[0], before.out[0]);
  await page.locator("#cycle-back").click();
  assert.deepEqual(
    await page.evaluate(() => window.__notebook.controller.data.model),
    before,
  );
  await visit("regression-trees");
  await stage(10);
  const grown = await page.evaluate(
    () => window.__notebook.controller.data.pruned.leaves,
  );
  await input("alpha", 2);
  assert.ok(
    (await page.evaluate(
      () => window.__notebook.controller.data.pruned.leaves,
    )) < grown,
  );
  await visit("multiple-linear-regression");
  await stage(3);
  await input("b1", -2);
  const loss = await page.evaluate(
    () => window.__notebook.controller.data.coefficients[1],
  );
  await page.locator("#fit-plane").click();
  assert.notEqual(
    await page.evaluate(
      () => window.__notebook.controller.data.coefficients[1],
    ),
    loss,
  );
  await writeFile(
    join(out, "visual-teaching-browser.json"),
    JSON.stringify({ universe: report, errors }, null, 2),
  );
  assert.deepEqual(errors, []);
  console.log(
    "Visual teaching checks passed: all registered lessons follow reading; all registered universe entries at six widths; spatial screenshots, no word-box flows in priority scenes, restricted-gradient rewind, real pruning and least squares.",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
