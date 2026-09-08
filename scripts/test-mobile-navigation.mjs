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

const page = await browser.newPage({
  reducedMotion: "reduce",
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
const failures = [];
try {
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(base + "/index.html");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    const home = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 2,
      sky: document.querySelector(".mobile-sky").getBoundingClientRect().height,
      routes: document.querySelectorAll(".mobile-star-route path").length,
      links: [...document.querySelectorAll(".mobile-node[href]")].map((e) =>
        e.getAttribute("href"),
      ),
    }));
    if (home.overflow || home.sky < 80 || home.routes < 15)
      failures.push("Home constellation " + viewport.width);
    const all = (await readdir(root + "/modules")).filter((f) =>
      f.endsWith(".html"),
    );
    for (const file of all)
      if (!home.links.some((link) => link.includes(file)))
        failures.push("Missing mobile link " + file);
    await page.locator("#mobile-menu-button").tap();
    if (
      (await page
        .locator("#mobile-menu-button")
        .getAttribute("aria-expanded")) !== "true"
    )
      failures.push("Menu did not open");
    await page.locator("#mobile-menu a").last().tap();
    await page.waitForTimeout(80);
    if (
      (await page
        .locator("#mobile-menu-button")
        .getAttribute("aria-expanded")) !== "false"
    )
      failures.push("Menu did not close");
    const region = await page.locator("#model-evaluation-mobile").boundingBox();
    if (region.y < 55) failures.push("Mobile menu anchor hidden");
    await page.locator('.mobile-node[href*="deep-learning.html"]').tap();
    await page.waitForURL("**/deep-learning.html*");
    if (viewport.width === 390) {
      await page.goto(base + "/index.html");
      await page.screenshot({ path: "/tmp/mobile-audit/home-final.png" });
      await page.locator(".mobile-group").nth(1).scrollIntoViewIfNeeded();
      await page.screenshot({
        path: "/tmp/mobile-audit/constellation-final.png",
      });
    }
  }
  // Rotate an already-loaded lesson: neither the illustration nor its controls
  // may trap the reader in a very short landscape viewport.
  for (const file of (await readdir(root + "/modules")).filter((f) =>
    f.endsWith(".html"),
  )) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + "/modules/" + file + "?academy=1", {
      timeout: 90000,
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    await page.setViewportSize({ width: 844, height: 390 });
    const stages = page
      .locator(
        ".statml-stage,.stage-section,.stage,.story-section,.lesson-step",
      )
      .filter({ has: page.locator("h2") });
    const count = await stages.count();
    for (const i of [...new Set([0, Math.floor(count / 2), count - 1])]) {
      await stages
        .nth(i)
        .evaluate((e) => e.scrollIntoView({ behavior: "instant" }));
      await page.waitForTimeout(80);
      if (
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 2,
        )
      )
        failures.push(file + " landscape overflow");
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await stages
      .nth(Math.floor(count / 2))
      .evaluate((e) => e.scrollIntoView({ behavior: "instant" }));
    await page.waitForTimeout(400);
    if (
      [
        "anova.html",
        "chi-square.html",
        "hierarchical-clustering.html",
        "kmeans.html",
        "model-selection.html",
      ].includes(file)
    )
      await page.screenshot({
        path: "/tmp/mobile-audit/fixed-" + file + ".png",
      });
    console.log("Rotation checked", file);
  }
  // Exercise native touch controls inside the pinned sheets.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/modules/hierarchical-clustering.html");
  await page
    .locator(".statml-stage")
    .filter({ has: page.locator("h2") })
    .nth(4)
    .evaluate((e) => e.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(250);
  const scrubber = page.locator("#merge-scrubber");
  await scrubber.tap({ position: { x: 20, y: 18 } });
  if (!(await scrubber.isVisible()))
    failures.push("Merge scrubber inaccessible on touch");
  await page.goto(base + "/modules/deep-learning.html?academy=1");
  await page
    .locator("#chapter-7")
    .evaluate((e) => e.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(250);
  await page
    .getByRole("button", { name: "Run one learning step", exact: true })
    .tap();
  await page.waitForTimeout(100);
  if (
    (await page.evaluate(() => window.__deepSketch.board.state.learnStep)) !== 1
  )
    failures.push("Deep Learning touch training step");
  await page.getByRole("button", { name: "Enlarge the diagram", exact: true }).tap();
  if (!(await page.locator("dialog[open]").count()))
    failures.push("Touch enlargement did not open");
  await page.getByRole("button", { name: "Close ×", exact: true }).tap();
  if (failures.length) {
    console.error(failures.join("\n"));
    throw Error(failures.join("\n"));
  }
  console.log(
    "Mobile constellation, all module links, menu navigation, and all 33 lesson rotations passed.",
  );
} finally {
  server.closeAllConnections();
  await browser.close();
  await new Promise((r) => server.close(r));
}
