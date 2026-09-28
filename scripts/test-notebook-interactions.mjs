import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { catalog } from "../modules/notebook/catalog.js";
const root = resolve(import.meta.dirname, ".."),
  server = createServer(async (req, res) => {
    try {
      const file = resolve(
        root,
        "." + new URL(req.url, "http://local").pathname,
      );
      if (!file.startsWith(root + "/")) throw Error();
      res.setHeader(
        "Content-Type",
        { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" }[
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
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
  errors = [],
  results = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  for (const slug of Object.keys(catalog)) {
    await page.goto(
      "http://127.0.0.1:" +
        server.address().port +
        "/modules/" +
        slug +
        ".html",
    );
    await page.waitForFunction(() => !!window.__notebook);
    await page.evaluate(() => document.fonts.ready);
    const original = await page.evaluate(() => ({
      state: JSON.stringify(window.__notebook.controller.state),
      data: JSON.stringify(window.__notebook.controller.data),
    }));
    await page.evaluate(() => {
      window.__retainedSVG = document.querySelector("#lab-content svg");
      window.__notebook.controller.resize();
    });
    const resized = await page.evaluate(() => ({
      state: JSON.stringify(window.__notebook.controller.state),
      data: JSON.stringify(window.__notebook.controller.data),
    }));
    assert.deepEqual(
      resized,
      original,
      slug + " resize changed the experiment",
    );
    const control = await page
      .locator('#lab-content input[type="range"]')
      .evaluateAll(
        (els) => els.find((el) => el.getBoundingClientRect().width > 0)?.id,
      );
    if (control) {
      await page.locator("#" + control).focus();
      await page.locator("#" + control).evaluate((el) => {
        for (const f of [0.2, 0.8, 0.4]) {
          el.value = String(+el.min + (+el.max - +el.min) * f);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
      await page.waitForFunction(() => !window.__notebook.controller.tween.raf);
      assert.equal(
        await page.evaluate((id) => document.activeElement.id === id, control),
        true,
        slug + " focus lost",
      );
      assert.equal(
        await page.evaluate(
          () =>
            window.__retainedSVG === document.querySelector("#lab-content svg"),
        ),
        true,
        slug + " replaced SVG",
      );
      const frames = await page.evaluate(
        () => window.__notebook.controller.tween.frames,
      );
      await page.waitForTimeout(120);
      assert.equal(
        await page.evaluate(() => window.__notebook.controller.tween.frames),
        frames,
        slug + " animates while idle",
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.locator("#" + control).evaluate((el) => {
        el.value = el.min;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      });
      assert.equal(
        await page.evaluate(() => window.__notebook.controller.tween.raf),
        0,
        slug + " ignored reduced motion",
      );
      await page.emulateMedia({ reducedMotion: "no-preference" });
    }
    const saved = await page.evaluate(() =>
      JSON.stringify(window.__notebook.controller.state),
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("[data-open-lab]").click();
    assert.equal(
      await page.evaluate(
        () => window.__retainedSVG === document.querySelector("dialog svg"),
      ),
      true,
      slug + " mobile cloned the lab",
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await page.evaluate(() =>
        JSON.stringify(window.__notebook.controller.state),
      ),
      saved,
      slug + " mobile changed parameters",
    );
    assert.equal(
      await page
        .locator("[data-open-lab]")
        .evaluate((el) => el === document.activeElement),
      true,
      slug + " did not restore focus",
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    // Retained references must also fit when opened, including math and tables.
    await page
      .locator("details.deeper")
      .evaluateAll((els) => els.forEach((el) => (el.open = true)));
    await page.setViewportSize({ width: 320, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      true,
      slug + " open reference overflow",
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    results.push({
      slug,
      preservedState: true,
      retainedSVG: true,
      focus: true,
      reducedMotion: true,
      idle: true,
      referenceOverflow: false,
    });
  }
  assert.deepEqual(errors, []);
  await writeFile(
    resolve(root, "audit-evidence/rollout-2026-09-28/interaction-report.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(
    "All 29 modules preserve scientific state, SVG identity, keyboard focus, mobile return, reduced motion, idle frames, and expanded-reference layout.",
  );
} finally {
  await browser.close();
  server.close();
}
