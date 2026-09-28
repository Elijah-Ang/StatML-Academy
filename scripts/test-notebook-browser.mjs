import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, join } from "node:path";
import { chromium } from "playwright";
const root = resolve(import.meta.dirname, ".."),
  output = process.env.NOTEBOOK_SCREENSHOTS;
if (output) await mkdir(output, { recursive: true });
const server = createServer(async (req, res) => {
  try {
    const path = resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://local").pathname),
    );
    if (!path.startsWith(root + "/")) throw Error("path");
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
        ".svg": "image/svg+xml",
      }[extname(path)] || "application/octet-stream",
    );
    res.end(await readFile(path));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  report = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (e) => errors.push(e.message));
const modules = {
  "simple-linear-regression": 8,
  kmeans: 9,
  "naive-bayes": 12,
  "evaluation-metrics": 9,
};
const widths = process.env.NOTEBOOK_WIDTHS?.split(",").map(Number) || [
  1440, 1024, 900, 768, 430, 390, 360, 320,
];
const visit = async (slug) => {
  await page.goto(`${base}/modules/${slug}.html`);
  await page.waitForFunction(() => !!window.__notebook);
  await page.evaluate(() => document.fonts.ready);
};
const go = async (i) => {
  await page
    .locator("article .stage")
    .nth(i)
    .evaluate((el) =>
      el.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page
    .waitForFunction((i) => window.__notebook.stage === i, i, { timeout: 5000 })
    .catch(async (e) => {
      console.error(
        "Stage failure",
        page.url(),
        page.viewportSize(),
        i,
        await page.evaluate(() => ({
          active: window.__notebook.stage,
          y: scrollY,
          height: document.documentElement.scrollHeight,
          stages: [...document.querySelectorAll("article .stage")].map(
            (s) => s.getBoundingClientRect().top,
          ),
        })),
      );
      throw e;
    });
};
const input = async (id, value) => {
  await page.locator("#" + id).evaluate((el, v) => {
    el.value = String(v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
};
const settled = async () => {
  await page.waitForFunction(() => !window.__notebook.controller.tween.raf);
  await page.evaluate(() =>
    Promise.all(
      document.getAnimations().map((a) => a.finished.catch(() => {})),
    ),
  );
};
try {
  for (const width of widths) {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 1000 });
    for (const [slug, count] of Object.entries(modules)) {
      await visit(slug);
      assert.equal(await page.locator("article .stage").count(), count);
      for (let i = 0; i < count; i++) {
        await go(i);
        if (width <= 900) await page.locator("[data-open-lab]").click();
        await settled();
        const audit = await page.evaluate(() => {
          const svg = document.querySelector("#lab-panel svg"),
            box = svg.viewBox.baseVal,
            clipped = [];
          for (const text of svg.querySelectorAll("text")) {
            if (text.closest('[display="none"]')) continue;
            const r = text.getBBox();
            if (
              r.x < -0.5 ||
              r.y < -0.5 ||
              r.x + r.width > box.width + 0.5 ||
              r.y + r.height > box.height + 0.5
            )
              clipped.push(text.textContent);
          }
          return {
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            clipped,
            stage: window.__notebook.stage,
            svgCount: document.querySelectorAll("#lab-panel svg").length,
            dialogOverflow:
              document.querySelector("dialog").open &&
              document.querySelector("dialog").scrollWidth >
                document.querySelector("dialog").clientWidth + 1,
          };
        });
        assert.equal(audit.overflow, false, `${slug} ${width} page overflow`);
        assert.equal(audit.dialogOverflow, false, `${slug} dialog overflow`);
        assert.equal(audit.svgCount, 1);
        assert.deepEqual(
          audit.clipped,
          [],
          `${slug} stage ${i + 1} width ${width}: clipped labels`,
        );
        if (
          output &&
          [1440, 390].includes(width) &&
          [0, 2, 4, 6, 7, 8, 10].includes(i)
        )
          await page.screenshot({
            path: join(output, `${slug}-${i + 1}-${width}.png`),
          });
        if (width <= 900) {
          const y = await page.evaluate(() => scrollY);
          await page.keyboard.press("Escape");
          assert.ok(
            Math.abs((await page.evaluate(() => scrollY)) - y) < 2,
            "Reading position changed",
          );
          assert.equal(
            await page
              .locator("[data-open-lab]")
              .evaluate((el) => el === document.activeElement),
            true,
          );
        }
      }
      report.push({ slug, width, stages: count });
      // Reverse navigation and a rapid jump retain exactly one active stage.
      for (const i of [1, count - 2, 0]) await go(i);
      const before = await page.evaluate(() =>
        JSON.stringify(window.__notebook.controller.state),
      );
      await page.setViewportSize({ width: width + 1, height: 1000 });
      await page.waitForTimeout(40);
      assert.equal(
        await page.evaluate(() =>
          JSON.stringify(window.__notebook.controller.state),
        ),
        before,
        "Resize changed scientific state",
      );
      await page.setViewportSize({ width, height: 1000 });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit("simple-linear-regression");
  await go(2);
  await page.evaluate(() => {
    window.keptDot = document.querySelector('[data-key="point-C"]');
  });
  await page.locator("#fit-line").click();
  await settled();
  assert.equal(await page.locator("#trial-sse").textContent(), "1.9");
  assert.equal(
    await page.evaluate(
      () => window.keptDot === document.querySelector('[data-key="point-C"]'),
    ),
    true,
    "Regression replaced retained marks",
  );
  await page.locator('[data-action="B"]').focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#student").inputValue(), "B");
  assert.equal(
    await page
      .locator('[data-action="B"]')
      .evaluate((el) => el === document.activeElement),
    true,
    "Selection lost focus",
  );
  await input("slope", 7);
  await input("intercept", 40);
  assert.equal(await page.locator("#trial-sse").textContent(), "51.0");
  await page.locator('[data-point="C"][data-field="y"]').fill("80");
  assert.equal(
    await page.evaluate(() => window.__notebook.controller.state.points[2].y),
    80,
  );
  for (const id of "ABCDE")
    await page.locator(`[data-point="${id}"][data-field="x"]`).fill("3");
  assert.ok(await page.locator("#fit-line").isDisabled());
  assert.match(
    await page.locator("#reg-notice").textContent(),
    /no unique slope/,
  );
  await page.locator("[data-reset]").click();
  await settled();
  assert.equal(await page.locator("#trial-sse").textContent(), "51.0");
  await go(7);
  await input("query", 9);
  assert.match(
    await page.locator("#reg-notice").textContent(),
    /extrapolation/,
  );
  await visit("kmeans");
  await go(2);
  for (const id of ["P1", "P7", "P20"]) {
    const box = await page.locator(`[data-key="point-${id}"]`).boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    assert.equal(
      await page.evaluate(() => window.__notebook.controller.state.selected),
      id,
      "Overlapping touch target selected a neighboring point",
    );
  }
  const points = await page.evaluate(() =>
    JSON.stringify(window.__notebook.controller.state.points),
  );
  await page.locator("#cluster-step").click();
  const assigned = await page.evaluate(
    () => window.__notebook.controller.state.snapshot,
  );
  assert.equal(assigned.phase, "assigned");
  await page.locator("#cluster-step").click();
  await settled();
  assert.ok(
    (await page.evaluate(
      () => window.__notebook.controller.state.snapshot.wcss,
    )) <= assigned.wcss,
  );
  const snapshot = await page.evaluate(() =>
    JSON.stringify(window.__notebook.controller.state.snapshot),
  );
  await go(8);
  await go(2);
  assert.equal(
    await page.evaluate(() =>
      JSON.stringify(window.__notebook.controller.state.snapshot),
    ),
    snapshot,
  );
  await page.locator("#cluster-back").click();
  await settled();
  assert.deepEqual(
    await page.evaluate(() => window.__notebook.controller.state.snapshot),
    assigned,
  );
  await page.locator("#cluster-run").click();
  await page.waitForFunction(
    () => window.__notebook.controller.state.snapshot.converged,
    null,
    { timeout: 20000 },
  );
  await page.waitForTimeout(700);
  assert.equal(await page.locator("#cluster-run").textContent(), "Run");
  await input("cluster-scale", "raw");
  assert.equal(
    await page.evaluate(() =>
      JSON.stringify(window.__notebook.controller.state.points),
    ),
    points,
  );
  await visit("naive-bayes");
  await go(6);
  await settled();
  assert.equal(await page.locator("#bayes-posterior").textContent(), "97.6%");
  await input("clue-meeting", "absent");
  await settled();
  const absent = await page.evaluate(
    () => window.__notebook.controller.result.p,
  );
  await input("clue-meeting", "ignore");
  await settled();
  assert.notEqual(
    await page.evaluate(() => window.__notebook.controller.result.p),
    absent,
  );
  for (const word of ["free", "winner"]) await input("clue-" + word, "ignore");
  await settled();
  assert.equal(await page.locator("#bayes-posterior").textContent(), "40.0%");
  await go(8);
  await input("clue-unicorn", "present");
  await input("alpha", 0);
  assert.equal(await page.locator("#bayes-posterior").textContent(), "0.0%");
  await input("alpha", 1);
  assert.ok(
    (await page.evaluate(() => window.__notebook.controller.result.p)) > 0,
  );
  await go(7);
  await input("plant-height", 181);
  assert.match(
    await page.locator("#plant-height-value").textContent(),
    /181 cm/,
  );
  await go(9);
  await page.locator('[data-fold="4"]').click();
  assert.equal(
    await page.evaluate(() => window.__notebook.controller.state.fold),
    4,
  );
  await visit("evaluation-metrics");
  await go(2);
  assert.deepEqual(
    await page.evaluate(() => {
      const c = window.__notebook.controller.state.counts;
      return [c.tp, c.fn, c.fp, c.tn];
    }),
    [80, 20, 90, 810],
  );
  await page.locator('[data-action="cell:fp"]').focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#metric-cell").inputValue(), "fp");
  assert.match(
    await page.locator("#metric-inspect").textContent(),
    /actual negative, decision alert/,
  );
  const fixed = await page.evaluate(() =>
    JSON.stringify(window.__notebook.controller.rows),
  );
  await input("metric-threshold", 1);
  assert.equal(
    await page.locator("#metric-precision").textContent(),
    "Undefined",
  );
  assert.equal(await page.locator("#metric-recall").textContent(), "0.0%");
  await go(3);
  assert.match(
    await page.locator("#metrics-plot").textContent(),
    /precision undefined/,
  );
  await input("metric-threshold", 0);
  assert.equal(await page.locator("#metric-alerts").textContent(), "1000");
  await go(7);
  await page.locator('[data-action="bin:0"]').click();
  assert.match(
    await page.locator("#metric-inspect").textContent(),
    /339 cases/,
  );
  assert.equal(
    await page.evaluate(() =>
      JSON.stringify(window.__notebook.controller.rows),
    ),
    fixed,
  );
  await go(8);
  await page.locator('.quiz-option[data-correct="true"]').first().click();
  assert.match(await page.locator(".feedback").first().textContent(), /^Yes/);
  // No repeated animation frames after settling; reduced motion commits immediately.
  for (const slug of Object.keys(modules)) {
    await visit(slug);
    await settled();
    const before = await page.evaluate(
      () => window.__notebook.controller.tween.frames,
    );
    await page.waitForTimeout(120);
    assert.equal(
      await page.evaluate(() => window.__notebook.controller.tween.frames),
      before,
      slug + " idle animation",
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await visit("simple-linear-regression");
  await go(5);
  await page.locator("#fit-line").click();
  assert.equal(
    await page.evaluate(() => window.__notebook.controller.tween.raf),
    0,
  );
  assert.equal(await page.locator("#trial-sse").textContent(), "1.9");
  // Touch/short landscape: open, interact, rotate, close; keep model and reading anchor.
  await page.setViewportSize({ width: 390, height: 844 });
  await visit("simple-linear-regression");
  await go(2);
  await page.locator("[data-open-lab]").click();
  await input("slope", 9);
  await page.setViewportSize({ width: 844, height: 390 });
  assert.ok(await page.locator("#slope").isVisible());
  await page.keyboard.press("Escape");
  assert.equal(
    await page.evaluate(() => window.__notebook.controller.state.m),
    9,
  );
  await page.waitForFunction(() => window.__notebook.stage === 2);
  // Static lesson and answers survive a disabled script environment.
  const noJS = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  for (const [slug, count] of Object.entries(modules)) {
    await noJS.goto(`${base}/modules/${slug}.html`);
    assert.equal(await noJS.locator("article .stage").count(), count);
    assert.ok((await noJS.locator("article").textContent()).length > 5000);
    assert.equal(await noJS.locator(".check").count(), count);
  }
  await noJS.close();
  const touch = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  touch.on("pageerror", (e) => errors.push(e.message));
  for (const slug of Object.keys(modules)) {
    await touch.goto(`${base}/modules/${slug}.html`);
    await touch.waitForFunction(() => !!window.__notebook);
    await touch
      .locator("article .stage")
      .nth(2)
      .evaluate((el) =>
        el.scrollIntoView({ block: "start", behavior: "instant" }),
      );
    await touch.locator(".deeper summary").nth(2).tap();
    assert.ok(
      await touch
        .locator(".deeper")
        .nth(2)
        .evaluate((el) => el.open),
    );
    await touch.locator("[data-open-lab]").tap();
    assert.ok(await touch.locator("dialog").evaluate((el) => el.open));
    await touch.locator("[data-reset]").tap();
    await touch.locator("[data-close-lab]").tap();
    assert.equal(
      await touch.locator("dialog").evaluate((el) => el.open),
      false,
    );
    assert.ok(
      await touch
        .locator(".deeper")
        .nth(2)
        .evaluate((el) => el.open),
      "Opening the visual collapsed the explanation",
    );
    assert.equal(
      await touch.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
    );
  }
  await touch.close();
  assert.deepEqual(errors, []);
  if (output)
    await writeFile(
      join(output, "browser-report.json"),
      JSON.stringify({ report, errors }, null, 2),
    );
  console.log(
    `Notebook browser checks passed: all 38 stages at ${widths.length} widths; arithmetic, edits, reversible clustering, Bayes evidence, threshold decisions, retained DOM/focus, mobile return, no-JS, reduced motion and idle frames.`,
  );
} finally {
  await browser.close();
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
}
