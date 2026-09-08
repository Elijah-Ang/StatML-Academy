/* Exercise the actual lesson controls and every new SVG scene on desktop/phone.
   Optional STUDY_SKETCH_SCREENSHOTS writes settled review images outside the site. */
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, extname, join } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};
const server = createServer(async (req, res) => {
  try {
    const file = resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
    );
    if (!file.startsWith(root + "/")) throw Error("Outside root");
    res.setHeader(
      "Content-Type",
      mime[extname(file)] || "application/octet-stream",
    );
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
const expect = (ok, message) => {
  if (!ok) throw Error(message);
};
const modules = [
  {
    file: "deep-learning",
    key: "__deepSketch",
    selector: ".lesson-step",
    count: 12,
  },
  {
    file: "naive-bayes",
    key: "__bayesSketch",
    selector: ".chapter",
    count: 12,
  },
];
const output = process.env.STUDY_SKETCH_SCREENSHOTS;
if (output) await mkdir(output, { recursive: true });
await new Promise((r) => server.listen(0, "127.0.0.1", r));
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    ...(!existsSync(chromium.executablePath()) ? { channel: "chrome" } : {}),
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const visit = async (name) => {
    await page.goto(
      `http://127.0.0.1:${server.address().port}/modules/${name}.html?academy=1`,
    );
    await page.evaluate(() => document.fonts.ready);
  };
  const go = async (m, i) => {
    await page
      .locator(m.selector)
      .nth(i)
      .evaluate((el) =>
        el.scrollIntoView({ block: "start", behavior: "instant" }),
      );
    await page.waitForFunction(({ key, i }) => window[key]?.board.index === i, {
      key: m.key,
      i,
    });
  };
  const input = async (selector, value) => {
    await page.locator(selector).evaluate((el, value) => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      ).set.call(el, String(value));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
    await page.waitForTimeout(80);
  };
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const m of modules) {
      await visit(m.file);
      expect(
        (await page.locator(m.selector).count()) === m.count,
        `${m.file}: lesson count changed`,
      );
      for (let i = 0; i < m.count; i++) {
        await go(m, i);
        const audit = await page.evaluate(
          ({ key }) => {
            const b = window[key].board,
              labels = [],
              unchanged = [];
            const signature = () =>
              b.host
                .querySelector(".sketch-art")
                .innerHTML.replaceAll(/sketch\d+-/g, "");
            for (let k = 0; k < b.scenes[b.index].steps; k++) {
              b.step = k;
              b.render();
              for (const text of b.host.querySelectorAll(".sketch-art text")) {
                const r = text.getBBox();
                if (
                  r.x < 0 ||
                  r.y < 0 ||
                  r.x + r.width > 642 ||
                  r.y + r.height > 444
                )
                  labels.push(text.textContent);
              }
            }
            b.step = 0;
            b.render();
            if (b.scenes[b.index].steps > 1) {
              const before = signature();
              b.advance(1);
              if (signature() === before) unchanged.push(b.index);
              b.advance(-1);
            }
            const caption = b.host
                .querySelector(".sketch-caption")
                .getBoundingClientRect(),
              board = b.host.getBoundingClientRect();
            return {
              labels,
              unchanged,
              captionFits: caption.bottom <= board.bottom + 2,
              overflow: document.documentElement.scrollWidth > innerWidth + 2,
              canvas: b.host.querySelectorAll("canvas,img").length,
            };
          },
          { key: m.key },
        );
        expect(
          !audit.labels.length,
          `${m.file} scene ${i + 1}: clipped SVG text ${audit.labels}`,
        );
        expect(
          !audit.unchanged.length,
          `${m.file} scene ${i + 1}: trace did nothing`,
        );
        expect(
          audit.captionFits,
          `${m.file} scene ${i + 1}: caption clipped at ${width}`,
        );
        expect(!audit.overflow, `${m.file}: page overflow at ${width}`);
        expect(
          audit.canvas === 0,
          `${m.file}: obsolete visual renderer remains`,
        );
        if (output) {
          await page.waitForTimeout(350);
          await page.screenshot({
            path: join(output, `${m.file}-${i + 1}-${width}.png`),
          });
        }
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit("deep-learning");
  await go(modules[0], 3);
  for (const type of ["text", "audio", "image"]) {
    await page
      .locator(".tensor-control button")
      .filter({ hasText: type })
      .click();
    await page.waitForFunction(
      (type) => window.__deepSketch.board.state.tensorMode === type,
      type,
    );
  }
  await go(modules[0], 6);
  await page.locator(".control-stack button").click();
  await page.waitForFunction(() =>
    document.querySelector(".sketch-art").textContent.includes("0.562"),
  );
  expect(
    (await page.locator(".sketch-art").textContent()).includes("0.562"),
    "DL one-step sigmoid gradient calculation differs",
  );
  await go(modules[0], 8);
  await page
    .locator(".architecture-tabs button")
    .filter({ hasText: "TRANSFORMER" })
    .click();
  await page.waitForFunction(
    () => window.__deepSketch.board.state.architecture === "transformer",
  );
  expect(
    (await page.locator(".sketch-art").textContent()).includes("context"),
    "DL architecture selection disconnected",
  );
  await go(modules[0], 10);
  await input(".threshold-control input", 0.7);
  expect(
    (await page.locator(".sketch-art").textContent()).includes("TP 2"),
    "DL confusion matrix mismatch",
  );

  // The detailed views use live, consistent arithmetic and retain keyboard access.
  await visit("deep-learning");
  await go(modules[0], 1);
  await page.locator('[data-action="dataset:1"]').click();
  expect(
    (await page.locator(".sketch-caption").textContent()).includes(
      "by a window",
    ),
    "Selected environment is not reflected in the scene",
  );
  await page.locator(".control-panel .toggle-button").click();
  await page.waitForFunction(() => window.__deepSketch.board.state.biased);
  expect(
    (await page.locator(".sketch-art").textContent()).match(/cat \/ sofa/g)
      .length === 3,
    "Shortcut collection should put every cat on a sofa",
  );
  await go(modules[0], 3);
  await page.locator('[data-action="pixel:6"]').click();
  expect(
    (await page.locator(".sketch-art").textContent()).includes(
      "row 2, column 3",
    ),
    "Pixel position does not match selection",
  );
  expect(
    (await page.locator(".sketch-art").textContent()).includes("138"),
    "Pixel RGB value does not match selection",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await go(modules[0], 3);
  await page.locator(".deep-inspect").click();
  expect(
    await page.locator(".deep-zoom-dialog").evaluate((el) => el.open),
    "Enlarged view did not open",
  );
  await page.locator('.deep-zoom-dialog [data-action="pixel:0"]').focus();
  await page.keyboard.press("Enter");
  expect(
    await page
      .locator('.deep-zoom-dialog [data-action="pixel:0"]')
      .evaluate((el) => el === document.activeElement),
    "Expanded SVG lost keyboard focus",
  );
  await page.locator('[data-zoom="fit"]').click();
  expect(
    await page
      .locator(".deep-zoom-dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 2),
    "Fit mode still requires sideways scrolling",
  );
  await page.keyboard.press("Escape");
  expect(
    await page
      .locator(".deep-inspect")
      .evaluate((el) => el === document.activeElement),
    "Closing the diagram did not restore focus",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go(modules[0], 6);
  await page.locator(".control-stack button").click();
  await page.waitForFunction(
    () => window.__deepSketch.board.state.weight === 0.25,
  );
  await page.locator('[data-deep-tool="training:reset"]').click();
  expect(
    await page.evaluate(() => window.__deepSketch.board.state.weight === 0),
    "Reset did not clear the toy weight",
  );
  await page.locator(".control-stack button").click();
  await page.waitForFunction(() =>
    document.querySelector(".sketch-art").textContent.includes("0.562"),
  );
  await input(".control-stack .range-row input", 0.1);
  expect(
    await page.evaluate(() => window.__deepSketch.board.state.weight === 0.25),
    "Changing learning rate rewrote the earlier update",
  );
  await page.locator(".control-stack button").click();
  await page.waitForFunction(
    () => window.__deepSketch.board.state.learnStep === 2,
  );
  expect(
    await page.evaluate(
      () =>
        Math.abs(window.__deepSketch.board.state.weight - 0.2937823499114202) <
        1e-10,
    ),
    "Mixed learning rates produced an incorrect update",
  );
  await go(modules[0], 8);
  const convolution = await page.evaluate(() => {
    const m = DeepSketchMath;
    return Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => m.convolve(m.filters.vertical, r, c)),
    );
  });
  expect(
    JSON.stringify(convolution) === "[[3,3,0],[2,2,0],[1,1,0]]",
    "Displayed filter-response example differs",
  );
  await page
    .locator(".architecture-tabs button")
    .filter({ hasText: "TRANSFORMER" })
    .click();
  await page.waitForFunction(
    () => window.__deepSketch.board.state.architecture === "transformer",
  );
  expect(
    await page.evaluate(
      () =>
        Math.abs(
          DeepSketchMath.attention(0).weights.reduce((a, b) => a + b) - 1,
        ) < 1e-12,
    ),
    "Attention weights do not sum to 1",
  );
  await page.locator('[data-sketch="play"]').click();
  await page.waitForFunction(() => window.__deepSketch.board.step > 0);
  await page.locator('[data-sketch="play"]').click();
  expect(
    await page.evaluate(() => !window.__deepSketch.board.timer),
    "Pause did not stop the diagram",
  );
  const highlights = await page.evaluate(() =>
    [...document.querySelectorAll(".pen-note")].every((g) => {
      const t = g.querySelector("text").getBBox(),
        p = g.querySelector("path").getBBox();
      return (
        Math.abs(p.y + p.height / 2 - (t.y + t.height / 2)) < t.height * 0.2 &&
        p.width >= t.width
      );
    }),
  );
  expect(highlights, "A highlight sits above its text");

  await visit("naive-bayes");
  await go(modules[1], 6);
  expect(
    (await page.locator("#predictionConfidence").textContent()).includes(
      "98.4",
    ),
    "NB initial posterior differs",
  );
  await page.locator('[data-action="clue:meeting"]').focus();
  await page.keyboard.press("Enter");
  expect(
    (await page.locator("#predictionConfidence").textContent()).includes(
      "85.7",
    ),
    "NB evidence multiplication differs",
  );
  expect(
    await page
      .locator('[data-action="clue:meeting"]')
      .evaluate((el) => el === document.activeElement),
    "SVG keyboard focus lost on update",
  );
  await page.locator('[data-action="clue:free"]').click();
  await page.locator('[data-action="clue:winner"]').click();
  expect(
    (await page.locator("#predictionLabel").textContent()) === "Not Spam",
    "NB class decision differs",
  );
  expect(
    (await page.locator("#predictionConfidence").textContent()).includes(
      "93.8",
    ),
    "NB meeting-only posterior differs",
  );
  await go(modules[1], 3);
  await page.locator('[data-model="gaussian"]').click();
  expect(
    (await page.locator(".sketch-art").textContent()).includes("Gaussian"),
    "NB variant disconnected",
  );
  await go(modules[1], 7);
  await input("#heightSlider", 181);
  expect(
    (await page.locator(".sketch-art").textContent()).includes("181 cm"),
    "NB height slider disconnected",
  );
  await go(modules[1], 9);
  await page.locator('[data-fold="4"]').click();
  await page.locator('[data-sketch="next"]').click();
  expect(
    (await page.locator("#foldCaption").textContent()) ===
      "Round 5 · Fold 5 validates",
    "NB traced fold and narrative disagree",
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  await visit("deep-learning");
  await go(modules[0], 0);
  expect(
    (await page
      .locator(".sketch-art .pen-line")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName)) === "none",
    "Reduced-motion preference ignored",
  );
  // Neural Networks has its former canvas renderer and controls again.
  await visit("neural-networks");
  expect(
    (await page.locator("#mainCanvas").count()) === 1,
    "Neural Networks canvas was not restored",
  );
  expect(
    (await page.locator(".study-sketch-board").count()) === 0,
    "Discarded Neural Networks rebuild is still active",
  );
  expect(
    (await page.locator(".statml-stage").count()) === 19,
    "Neural Networks lesson structure changed",
  );
  await input("#threshold", 70);
  expect(
    (await page.locator("#tpCount").textContent()) === "2" &&
      (await page.locator("#fpCount").textContent()) === "0",
    "Restored Neural Networks threshold control failed",
  );
  expect(!errors.length, errors.join("\n"));
  console.log(
    "Study-sketch checks passed: all 24 scenes at desktop and phone widths, live controls, numeric examples, keyboard actions, pause, and reduced motion.",
  );
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
}
