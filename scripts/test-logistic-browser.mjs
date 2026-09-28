import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright";
import { logisticRegions } from "../modules/notebook/logistic-geometry.js";

const root = resolve(import.meta.dirname, "..");
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
};
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const relative = normalize(pathname).replace(/^[/\\]+/, "") || "index.html";
    let file = join(root, relative);
    if (!(await stat(file)).isFile()) file = join(file, "index.html");
    if (!file.startsWith(root)) throw new Error("Path outside test root");
    response.writeHead(200, {
      "content-type": types[extname(file)] || "application/octet-stream",
    });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

await new Promise((resolveListen) =>
  server.listen(0, "127.0.0.1", resolveListen),
);
const address = server.address();
const browser = await chromium.launch({
  headless: true,
  ...(!existsSync(chromium.executablePath()) ? { channel: "chrome" } : {}),
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};
const close = (actual, expected, message) =>
  expect(Math.abs(actual - expected) < 1e-7, message);
const area = (points) =>
  Math.abs(
    points.reduce((sum, a, i) => {
      const b = points[(i + 1) % points.length];
      return sum + a[0] * b[1] - b[0] * a[1];
    }, 0),
  ) / 2;
// Independent geometry invariants, including horizontal, vertical and constant fits.
for (const weights of [
  [0, 1, 0],
  [0, 0, 1],
  [0.5, 1, -2],
  [0, 0, 0],
])
  for (const threshold of [0, 0.01, 0.2, 0.5, 0.8, 0.99, 1]) {
    const regions = logisticRegions(weights, threshold);
    close(
      area(regions.positive) + area(regions.negative),
      36,
      "Decision regions do not partition the square",
    );
    for (const [x, z] of regions.boundary)
      close(
        1 / (1 + Math.exp(-weights[0] - weights[1] * x - weights[2] * z)),
        threshold,
        "Boundary does not match the model cutoff",
      );
    for (const [points, positive] of [
      [regions.positive, true],
      [regions.negative, false],
    ]) {
      if (!points.length) continue;
      const center = points.reduce(
        (acc, p) => [
          acc[0] + p[0] / points.length,
          acc[1] + p[1] / points.length,
        ],
        [0, 0],
      );
      const probability =
        1 /
        (1 +
          Math.exp(
            -weights[0] - weights[1] * center[0] - weights[2] * center[1],
          ));
      expect(
        positive
          ? probability >= threshold - 1e-10
          : probability < threshold + 1e-10,
        "Region color denotes the wrong class",
      );
    }
  }
const expectVisual = async (stage, scene) => {
  await page
    .locator('[data-stage="' + stage + '"]')
    .evaluate((el) =>
      el.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page.waitForFunction(
    ([stage, scene]) =>
      window.__notebook?.stage === stage - 1 &&
      window.__notebook.controller.scene === scene,
    [stage, scene],
  );
};
try {
  await page.goto(
    "http://127.0.0.1:" + address.port + "/modules/logistic-regression.html",
  );
  await page.waitForFunction(() => !!window.__notebook);
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1440, 430, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expectVisual(2, "sigmoid");
    if (width <= 900) await page.locator("[data-open-lab]").click();
    const original = await page.evaluate(() => ({
      curve: document.querySelector('[data-key="function"]').getAttribute("d"),
      weights: JSON.stringify(window.__notebook.controller.data.fit.weights),
    }));
    for (const threshold of [0, 0.2, 0.5, 0.8, 1]) {
      await page.locator("#threshold").focus();
      await page.locator("#threshold").evaluate((el, value) => {
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }, String(threshold));
      await page.waitForFunction(() => !window.__notebook.controller.tween.raf);
      const visual = await page.evaluate(() => {
        const svg = document.querySelector("#lab-panel svg"),
          line = svg.querySelector('[data-key="probability-threshold"]'),
          red = svg.querySelector('[data-key="probability-class-1"]'),
          blue = svg.querySelector('[data-key="probability-class-0"]');
        return {
          y: +line.getAttribute("y1"),
          top: +red.getAttribute("y"),
          red: +red.getAttribute("height"),
          blue: +blue.getAttribute("height"),
          blueY: +blue.getAttribute("y"),
          curve: svg.querySelector('[data-key="function"]').getAttribute("d"),
          weights: JSON.stringify(
            window.__notebook.controller.data.fit.weights,
          ),
          focus: document.activeElement.id,
          stage: window.__notebook.stage,
        };
      });
      close(
        visual.blue / (visual.red + visual.blue),
        threshold,
        "Shaded probability regions do not track the threshold",
      );
      close(visual.y, visual.top + visual.red, "Red region misses the line");
      close(visual.y, visual.blueY, "Blue region misses the line");
      expect(
        visual.curve === original.curve && visual.weights === original.weights,
        "Changing a cutoff refitted or moved the probability curve",
      );
      expect(
        visual.focus === "threshold" && visual.stage === 1,
        "Threshold interaction lost focus or changed the reading section",
      );
    }
    await page.locator("#threshold").press("ArrowLeft");
    await page.waitForFunction(() => !window.__notebook.controller.tween.raf);
    close(
      await page.evaluate(() => window.__notebook.controller.state.threshold),
      0.99,
      "Keyboard cutoff adjustment failed",
    );
    if (width <= 900) await page.keyboard.press("Escape");
    await expectVisual(6, "boundary");
    if (width <= 900) await page.locator("[data-open-lab]").click();
    for (const threshold of [0, 0.2, 0.5, 0.8, 1]) {
      const result = await page.evaluate((threshold) => {
        const c = window.__notebook.controller;
        c.update({ threshold }, false);
        const svg = document.querySelector("#lab-panel svg"),
          line = svg.querySelector('[data-key="decision-threshold-line"]'),
          visible = line && line.getAttribute("display") !== "none",
          l = 47,
          r = svg.viewBox.baseVal.width - 16,
          t = 28,
          b = svg.viewBox.baseVal.height - 47;
        const probabilities = visible
          ? [1, 2].map((i) =>
              c.data.fit.predict({
                x: -3 + (6 * (+line.getAttribute("x" + i) - l)) / (r - l),
                z: -3 + (6 * (b - +line.getAttribute("y" + i))) / (b - t),
              }),
            )
          : [];
        return {
          probabilities,
          visible,
          finite: ![...svg.querySelectorAll("*")].some((n) =>
            [...n.attributes].some((a) => /NaN|Infinity/.test(a.value)),
          ),
        };
      }, threshold);
      for (const p of result.probabilities)
        close(
          p,
          threshold,
          "Displayed input-space line is not at the probability cutoff",
        );
      expect(
        result.finite,
        "Threshold endpoint creates nonfinite SVG geometry",
      );
      if (threshold === 0 || threshold === 1)
        expect(
          !result.visible,
          "Infinite logit cutoff must not draw a finite input-space line",
        );
    }
    if (width <= 900) await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await expectVisual(7, "confusion");
  expect(
    await page.evaluate(
      () => window.__notebook.controller.data.sealed === null,
    ),
    "Test was already revealed",
  );
  await expectVisual(8, "roc");
  await expectVisual(9, "coefficients");
  await expectVisual(10, "final");
  await page.locator("#threshold").evaluate((el) => {
    el.value = "0.42";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.locator("#reveal-test").click();
  expect(
    await page.evaluate(
      () => window.__notebook.controller.data.sealed.threshold === 0.42,
    ),
    "Locked threshold differs",
  );
  expect(
    await page.locator("#threshold").isDisabled(),
    "Threshold remained editable",
  );
  expect(
    await page.locator("#reveal-test").isDisabled(),
    "Final reveal remains available",
  );
  expect(pageErrors.length === 0, "Browser errors: " + pageErrors.join("; "));
  console.log(
    "Logistic threshold line/regions, geometric class boundaries, desktop/mobile sliders, keyboard/focus, unchanged fitted curve, notebook stages and locked final-test reveal passed.",
  );
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
