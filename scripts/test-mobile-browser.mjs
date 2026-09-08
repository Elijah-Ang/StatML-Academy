import { chromium } from "playwright";
import { readdir, writeFile, mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve(import.meta.dirname, "..");
const cache = new Map();
const server = createServer(async (req, res) => {
  try {
    const path = resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://local").pathname),
    );
    if (!path.startsWith(root + "/")) throw Error("path");
    if (!cache.has(path)) cache.set(path, readFile(path));
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
      }[extname(path)] || "application/octet-stream",
    );
    res.end(await cache.get(path));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + server.address().port;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const failures = [];
await mkdir("/tmp/mobile-audit", { recursive: true });
try {
  const sweeps = await Promise.allSettled(
    [320, 360, 390, 430].map(async (width) => {
      const page = await browser.newPage({
        viewport: { width, height: width <= 360 ? 740 : 844 },
        reducedMotion: "reduce",
      });
      for (const file of (await readdir(root + "/modules")).filter((x) =>
        x.endsWith(".html"),
      )) {
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(base + "/modules/" + file + "?academy=1", {
          waitUntil: "load",
          timeout: 90000,
        });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(200); // Let responsive measurements settle before exercising anchors.
        const selector =
          ".statml-stage,.stage-section,.stage,.story-section,.lesson-step";
        const stages = page
          .locator(selector)
          .filter({ has: page.locator("h2") });
        const row = {
          file,
          width,
          count: await stages.count(),
          errors,
          stages: [],
        };
        for (let i = 0; i < row.count; i++) {
          await stages
            .nth(i)
            .evaluate((e) =>
              e.scrollIntoView({ behavior: "instant", block: "start" }),
            );
          await page.waitForTimeout(100);
          // Wait for the scroll-driven renderer, rather than treating one busy
          // animation frame during concurrent browser checks as a wrong stage.
          await page
            .waitForFunction(
              (index) => {
                const buttons = [
                  ...document.querySelectorAll(".statml-stage-button"),
                ];
                if (buttons.length)
                  return (
                    buttons.findIndex(
                      (b) => b.getAttribute("aria-current") === "step",
                    ) === index
                  );
                if (window.__deepSketch)
                  return window.__deepSketch.board.index === index;
                if (window.__bayesSketch)
                  return window.__bayesSketch.board.index === index;
                return true;
              },
              i,
              { timeout: 3000 },
            )
            .catch(() => {});
          row.stages.push(
            await stages.nth(i).evaluate((e) => {
              const h = e.querySelector("h2").getBoundingClientRect();
              const v = document.querySelector(".statml-visual,.visual-stage");
              const vr = v?.getBoundingClientRect();
              const canvas =
                v?.querySelector("canvas,.sketch-art") ||
                v?.querySelector("svg:not(.hw-rough-frame)");
              const cr = canvas?.getBoundingClientRect();
              return {
                id: e.id,
                heading: h.top,
                visual: vr && {
                  top: vr.top,
                  bottom: vr.bottom,
                  height: vr.height,
                },
                art: cr && { width: cr.width, height: cr.height },
                overflow: document.documentElement.scrollWidth > innerWidth + 2,
                rail: [
                  ...document.querySelectorAll(".statml-stage-button"),
                ].findIndex((b) => b.getAttribute("aria-current") === "step"),
                actual: (() => {
                  try {
                    return eval("currentStage");
                  } catch {
                    return null;
                  }
                })(),
                active: document.querySelector(
                  ".statml-stage.is-active,.statml-stage.active,.stage.active,.chapter.is-active",
                )?.id,
                deep: window.__deepSketch?.board.index,
                bayes: window.__bayesSketch?.board.index,
              };
            }),
          );
          if (width === 390 && i === Math.floor(row.count / 2))
            await page.screenshot({
              path: "/tmp/mobile-audit/" + file + ".png",
            });
        }
        for (const [i, s] of row.stages.entries()) {
          if (s.overflow)
            failures.push(
              `${file} ${width} stage ${i + 1}: horizontal overflow`,
            );
          if (s.visual && s.heading < s.visual.bottom - 2)
            failures.push(`${file} ${width} stage ${i + 1}: obscured heading`);
          if (s.rail >= 0 && s.rail !== i)
            failures.push(
              `${file} ${width} stage ${i + 1}: wrong active navigation (${s.rail})`,
            );
          if (
            (s.deep != null && s.deep !== i) ||
            (s.bayes != null && s.bayes !== i)
          )
            failures.push(
              `${file} ${width} stage ${i + 1}: wrong illustration`,
            );
        }
        if (errors.length)
          failures.push(`${file} ${width}: ${errors.join("; ")}`);
        // Reverse scrolling must select the earlier lesson again.
        if (row.count > 2) {
          await stages
            .nth(1)
            .evaluate((e) => e.scrollIntoView({ behavior: "instant" }));
          await page.waitForTimeout(100);
          const current = await page
            .locator(".statml-stage-button")
            .evaluateAll((bs) =>
              bs.findIndex((b) => b.getAttribute("aria-current") === "step"),
            );
          if (current >= 0 && current !== 1)
            failures.push(
              `${file} ${width}: reverse scroll selected ${current}`,
            );
        }
        results.push(row);

        console.log(
          width,
          file,
          row.count,
          JSON.stringify(
            row.stages.filter(
              (s) =>
                s.overflow || (s.visual && s.heading < s.visual.bottom - 2),
            ),
          ),
        );
        page.removeAllListeners("pageerror");
      }
      await page.close();
    }),
  );
  sweeps.forEach((sweep) => {
    if (sweep.status === "rejected") failures.push(String(sweep.reason));
  });
  await writeFile(
    "/tmp/mobile-audit/results.json",
    JSON.stringify(results, null, 2),
  );
} finally {
  server.closeAllConnections();
  await browser.close();
  await new Promise((r) => server.close(r));
}
if (failures.length) throw new Error(failures.join("\n"));
console.log(
  `Mobile checks passed: ${results.length} module/viewport combinations, ${results.reduce((n, r) => n + r.count, 0)} section visits, including reverse scrolling.`,
);
