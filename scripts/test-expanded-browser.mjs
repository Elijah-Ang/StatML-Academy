import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, extname, join } from "node:path";
import { catalog } from "../modules/notebook/catalog.js";
const root = resolve(import.meta.dirname, ".."),
  out = resolve(root, "audit-evidence/rollout-2026-09-28");
await mkdir(out, { recursive: true });
const server = createServer(async (req, res) => {
  try {
    const path = resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://local").pathname),
    );
    if (!path.startsWith(root + "/")) throw Error("path");
    res.setHeader(
      "Content-Type",
      { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" }[
        extname(path)
      ] || "application/octet-stream",
    );
    res.end(await readFile(path));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + server.address().port,
  browser = await chromium.launch({ channel: "chrome", headless: true }),
  errors = [],
  report = [],
  page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
let current = "";
page.on("pageerror", (e) => errors.push(current + ": " + e.message));
const widths = (process.env.ROLLOUT_WIDTHS || "1440,1024,768,430,320")
  .split(",")
  .map(Number);
const slugs = process.env.ROLLOUT_SLUGS?.split(",") || Object.keys(catalog);
const input = async (id, value) =>
  page.locator("#" + id).evaluate((el, v) => {
    el.value = String(v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
try {
  for (const width of widths) {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 1000 });
    for (const slug of slugs) {
      current = slug + " " + width;
      await page.goto(base + "/modules/" + slug + ".html");
      try {
        await page.waitForFunction(
          () => !!window.__notebook,
          {},
          { timeout: 10000 },
        );
      } catch {
        errors.push(current + ": runtime failed to start");
        continue;
      }
      await page.evaluate(() => document.fonts.ready);
      assert.equal(
        await page.locator("article .stage").count(),
        catalog[slug].scenes.length,
      );
      for (let i = 0; i < catalog[slug].scenes.length; i++) {
        current = slug + " " + width + " stage " + (i + 1);
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
          errors.push(current + ": scroll/stage mismatch");
          await page.evaluate((i) => window.__notebook.setStage(i), i);
        }
        if (width <= 900) await page.locator("[data-open-lab]").click();
        const audit = await page.evaluate(() => {
          const s = document.querySelector("#lab-panel svg"),
            box = s.viewBox.baseVal,
            clipped = [];
          for (const t of s.querySelectorAll("text")) {
            if (t.closest('[display="none"]')) continue;
            const r = t.getBBox();
            if (
              r.x < -0.7 ||
              r.y < -0.7 ||
              r.x + r.width > box.width + 0.7 ||
              r.y + r.height > box.height + 0.7
            )
              clipped.push({
                text: t.textContent,
                x: r.x,
                y: r.y,
                width: r.width,
              });
          }
          return {
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            clipped,
            stage: window.__notebook.stage,
            svg: document.querySelectorAll("#lab-panel svg").length,
            scene: window.__notebook.controller.scene,
            finite: ![...s.querySelectorAll("*")].some((n) =>
              [...n.attributes].some((a) => /(?:NaN|Infinity)/.test(a.value)),
            ),
            dialogOverflow:
              document.querySelector("dialog").open &&
              document.querySelector("dialog").scrollWidth >
                document.querySelector("dialog").clientWidth + 1,
          };
        });
        for (const k of ["overflow", "dialogOverflow"])
          if (audit[k]) errors.push(current + ": " + k);
        if (audit.clipped.length)
          errors.push(current + ": clipped " + JSON.stringify(audit.clipped));
        if (!audit.finite) errors.push(current + ": nonfinite geometry");
        if (audit.svg !== 1)
          errors.push(current + ": expected one retained SVG");
        report.push({
          slug,
          width,
          stage: i + 1,
          scene: audit.scene,
          clipped: audit.clipped.length,
        });
        if (
          process.env.ROLLOUT_SHOTS &&
          [1440, 430].includes(width) &&
          [0, 4, 8].includes(i)
        )
          await page.screenshot({
            path: join(out, slug + "-" + (i + 1) + "-" + width + ".png"),
          });
        if (width <= 900) {
          const y = await page.evaluate(() => scrollY);
          await page.keyboard.press("Escape");
          const returned = await page.evaluate(() => scrollY);
          if (Math.abs(y - returned) > 2)
            errors.push(current + ": reading position changed");
        }
      }
      // Exercise every control while all scene-specific controls retain their DOM.
      for (const control of await page
        .locator("#lab-content input,#lab-content select:not(#view)")
        .evaluateAll((els) =>
          els.map((el) => ({
            id: el.id,
            type: el.tagName,
            min: el.min,
            max: el.max,
            options: el.options ? [...el.options].map((o) => o.value) : [],
          })),
        )) {
        const vals =
          control.type === "SELECT"
            ? control.options
            : [control.max, control.min];
        for (const value of vals) await input(control.id, value);
      }
      await page.evaluate(() => window.__notebook.controller.reset());
      await page.evaluate(() => window.__notebook.controller.resize());
      if (errors.some((e) => e.startsWith(slug + " " + width + ": runtime")))
        break;
    }
  }
  // Parameter updates, rewind, and the exact CNN/attention examples.
  current = "neural behavior";
  await page.goto(base + "/modules/neural-networks.html");
  await page.waitForFunction(() => !!window.__notebook);
  const before = await page.evaluate(() =>
    JSON.stringify(window.__notebook.controller.data.model),
  );
  await page.evaluate(() => window.__notebook.setStage(10));
  await page.locator("#cycle-next").evaluate((el) => el.click());
  await page.locator("#cycle-next").evaluate((el) => el.click());
  assert.equal(
    await page.evaluate(() =>
      JSON.stringify(window.__notebook.controller.data.model),
    ),
    before,
    "Gradients changed weights before the update phase",
  );
  await page.locator("#cycle-next").evaluate((el) => el.click());
  assert.notEqual(
    await page.evaluate(() =>
      JSON.stringify(window.__notebook.controller.data.model),
    ),
    before,
  );
  await page.locator("#cycle-back").evaluate((el) => el.click());
  assert.equal(
    await page.evaluate(() =>
      JSON.stringify(window.__notebook.controller.data.model),
    ),
    before,
    "Rewind failed to restore weights",
  );
  await page.goto(base + "/modules/deep-learning.html");
  await page.waitForFunction(() => !!window.__notebook);
  await page.evaluate(() => window.__notebook.setStage(8));
  await input("architecture", "cnn");
  await input("window", 0);
  assert.equal(
    await page.evaluate(() => window.__notebook.controller.data.convolution),
    3,
  );
  await input("architecture", "attention");
  assert.ok(
    Math.abs(
      (await page.evaluate(() =>
        window.__notebook.controller.data.attention.weights.reduce(
          (a, b) => a + b,
          0,
        ),
      )) - 1,
    ) < 1e-12,
  );
  // Final-test boundary: isolated, frozen, one-time; resizes cannot refit.
  current = "logistic lock";
  await page.goto(base + "/modules/logistic-regression.html");
  await page.waitForFunction(() => !!window.__notebook);
  await input("threshold", 0.63);
  const pre = await page.evaluate(() => {
    const d = window.__notebook.controller.data;
    return {
      train: d.split.train.map((r) => r.id),
      validation: d.split.validation.map((r) => r.id),
      test: d.split.test.map((r) => r.id),
      counts: d.counts,
      weights: d.fit.weights,
    };
  });
  assert.equal(
    new Set([...pre.train, ...pre.validation, ...pre.test]).size,
    80,
  );
  assert.equal(
    Object.values(pre.counts).reduce((a, b) => a + b),
    16,
  );
  await page.locator("#reveal-test").evaluate((el) => el.click());
  const locked = await page.evaluate(() =>
    JSON.stringify(window.__notebook.controller.data.sealed),
  );
  assert.equal(await page.locator("#threshold").isDisabled(), true);
  await page.locator("#reveal-test").evaluate((el) => el.click());
  await page.evaluate(() => window.__notebook.controller.resize());
  assert.equal(
    await page.evaluate(() =>
      JSON.stringify(window.__notebook.controller.data.sealed),
    ),
    locked,
  );
  assert.deepEqual(
    await page.evaluate(() => window.__notebook.controller.data.fit.weights),
    pre.weights,
  );
  // No-JavaScript keeps every authored stage and explanation.
  const nojs = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  for (const slug of slugs) {
    await nojs.goto(base + "/modules/" + slug + ".html");
    assert.equal(
      await nojs.locator("article .stage").count(),
      catalog[slug].scenes.length,
    );
    assert.equal(
      await nojs.locator(".check").count(),
      catalog[slug].scenes.length,
    );
    assert.ok((await nojs.locator("article").innerText()).length > 2500);
  }
  await nojs.close();
  await writeFile(
    join(
      out,
      process.env.ROLLOUT_SLUGS
        ? "browser-report-" +
            process.env.ROLLOUT_SLUGS.replaceAll(",", "-") +
            ".json"
        : "browser-report.json",
    ),
    JSON.stringify(
      { checks: report.length, widths, errors, stages: report },
      null,
      2,
    ),
  );
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else
    console.log(
      "Extended notebook browser checks passed: " +
        report.length +
        " stage/viewport combinations, all controls, no-JS, neural rewind, and locked final test.",
    );
} finally {
  await browser.close();
  server.close();
}
