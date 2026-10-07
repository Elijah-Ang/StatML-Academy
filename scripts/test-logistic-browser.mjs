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
    expect(await page.locator('[data-key="probability-linear"]').isVisible(), "The line-versus-probability demonstration is missing");
    expect(await page.locator("#threshold").isVisible(), "The approved threshold control was removed from the probability comparison");
    const comparison=await page.evaluate(()=>({curve:document.querySelector('[data-key="probability-sigmoid"]').getAttribute('d'),line:document.querySelector('[data-key="probability-linear"]').getAttribute('d'),weights:JSON.stringify(window.__notebook.controller.data.fit.weights)}));
    for(const threshold of [.2,.8]){
      const result=await page.evaluate(threshold=>{
        const c=window.__notebook.controller;c.update({threshold},false);
        const get=k=>document.querySelector(`[data-key="${k}"]`),red=+get('probability-class-1').getAttribute('height'),blue=+get('probability-class-0').getAttribute('height');
        return {fraction:blue/(red+blue),curve:get('probability-sigmoid').getAttribute('d'),line:get('probability-linear').getAttribute('d'),weights:JSON.stringify(c.data.fit.weights)};
      },threshold);
      close(result.fraction,threshold,'Comparison field failed to move');
      expect(result.curve===comparison.curve&&result.line===comparison.line&&result.weights===comparison.weights,'The cutoff changed the comparison curves or fitted model');
    }
    if (width <= 900) await page.keyboard.press("Escape");
    await expectVisual(3, "sigmoid");
    if (width <= 900) await page.locator("[data-open-lab]").click();
    const original = await page.evaluate(() => ({
      curve: document.querySelector('[data-key="function"]').getAttribute("d"),
      weights: JSON.stringify(window.__notebook.controller.data.fit.weights),
    }));
    for (const threshold of [0, 0.2, 0.5, 0.8, 1]) {
      await page.locator('#threshold').focus();
      await page.locator('#threshold').evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},threshold);
      await page.waitForFunction(()=>!window.__notebook.controller.tween.raf);
      const result = await page.evaluate(() => {
        const c=window.__notebook.controller,get=key=>document.querySelector(`[data-key="${key}"]`),cutoff=get('probability-threshold'),red=get('probability-class-1'),blue=get('probability-class-0');
        return {curve:get('function').getAttribute('d'), weights:JSON.stringify(c.data.fit.weights), cutoffShown:cutoff&&cutoff.getAttribute('display')!=='none',line:+cutoff.getAttribute('y1'),redTop:+red.getAttribute('y'),redHeight:+red.getAttribute('height'),blueTop:+blue.getAttribute('y'),blueHeight:+blue.getAttribute('height'),focus:document.activeElement.id};
      });
      expect(result.curve===original.curve&&result.weights===original.weights,"A cutoff changed the fitted probability mapping");
      expect(result.cutoffShown,"The approved two-colour probability field lost its moving cutoff");
      close(result.blueHeight/(result.redHeight+result.blueHeight),threshold,'Probability colours do not follow the threshold');
      close(result.line,result.redTop+result.redHeight,'Red probability fill misses the cutoff');
      close(result.line,result.blueTop,'Blue probability fill misses the cutoff');
      expect(result.focus==='threshold','Restored control lost keyboard focus');
    }
    await page.emulateMedia({reducedMotion:'no-preference'});
    const moving=await page.evaluate(async()=>{
      const c=window.__notebook.controller,before=JSON.stringify(c.data.fit.weights);
      c.update({threshold:.05},false);c.update({threshold:.95},true);
      const samples=[];
      for(let i=0;i<5;i++){
        await new Promise(requestAnimationFrame);
        const get=k=>document.querySelector(`[data-key="${k}"]`),r=get('probability-class-1'),b=get('probability-class-0'),line=+get('probability-threshold').getAttribute('y1');
        samples.push(Math.abs(+r.getAttribute('y')+(+r.getAttribute('height'))-line)<1e-7&&Math.abs(+b.getAttribute('y')-line)<1e-7);
      }
      return {samples,sameWeights:before===JSON.stringify(c.data.fit.weights)};
    });
    expect(moving.samples.every(Boolean)&&moving.sameWeights,'Animated colour fills separated from their cutoff or changed the fit');
    await page.waitForFunction(()=>!window.__notebook.controller.tween.raf);
    await page.emulateMedia({reducedMotion:'reduce'});
    if(width<=900)await page.keyboard.press('Escape');
    await expectVisual(4,'contributions');
    if(width<=900)await page.locator('[data-open-lab]').click();
    expect(await page.locator('[data-key="clue-part0"]').isVisible(),'The supporting contribution diagram was removed');
    expect(await page.locator('[data-key="clue-decision-class-1"]').isVisible(),'The weighted-clues decision field is missing');
    const weighted=await page.evaluate(()=>({weights:JSON.stringify(window.__notebook.controller.data.fit.weights),probability:window.__notebook.controller.data.fit.predict({x:window.__notebook.controller.state.query,z:window.__notebook.controller.state.second}),parts:JSON.stringify(window.__notebook.controller.data.parts)}));
    for(const threshold of [.2,.98]){
      const r=await page.evaluate(threshold=>{
        const c=window.__notebook.controller;c.update({threshold},false);const svg=document.querySelector('#lab-panel svg'),get=k=>svg.querySelector(`[data-key="${k}"]`),line=get('clue-decision-boundary'),x=get('clue-map-space-x'),y=get('clue-map-space-y');
        const l=+x.getAttribute('x1'),right=+x.getAttribute('x2'),top=+y.getAttribute('y1'),bottom=+y.getAttribute('y2'),limit=c.data.limit;
        return {endpoints:[1,2].map(i=>c.data.fit.predict({x:-limit+2*limit*(+line.getAttribute('x'+i)-l)/(right-l),z:-limit+2*limit*(bottom-+line.getAttribute('y'+i))/(bottom-top)})),weights:JSON.stringify(c.data.fit.weights),probability:c.data.fit.predict({x:c.state.query,z:c.state.second}),parts:JSON.stringify(c.data.parts),decision:c.data.fit.predict({x:c.state.query,z:c.state.second})>=threshold};
      },threshold);
      r.endpoints.forEach(p=>close(p,threshold,'Weighted-clues field boundary is not the selected cutoff'));
      expect(r.weights===weighted.weights&&r.parts===weighted.parts&&r.probability===weighted.probability,'Moving the field changed the contributions, probability or fit');
      expect(r.decision===(weighted.probability>=threshold),'The restored field gives the wrong decision');
    }
    if (width <= 900) await page.keyboard.press("Escape");
    await expectVisual(6, "boundary");
    if (width <= 900) await page.locator("[data-open-lab]").click();
    for (const threshold of [0, 0.2, 0.5, 0.8, 1]) {
      await page.locator("#threshold").focus();
      await page.locator("#threshold").evaluate((el,value)=>{
        el.value=String(value);el.dispatchEvent(new Event("input",{bubbles:true}));
      },threshold);
      await page.waitForFunction(()=>!window.__notebook.controller.tween.raf);
      expect(await page.evaluate(()=>document.activeElement.id==='threshold'&&window.__notebook.stage===5),'Cutoff interaction lost focus or changed the reading section');
      const result = await page.evaluate((threshold) => {
        const c = window.__notebook.controller;
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
                x: -c.data.limit + (2*c.data.limit * (+line.getAttribute("x" + i) - l)) / (r - l),
                z: -c.data.limit + (2*c.data.limit * (b - +line.getAttribute("y" + i))) / (b - t),
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
    await page.locator("#threshold").press("ArrowLeft");
    await page.waitForFunction(()=>!window.__notebook.controller.tween.raf);
    close(await page.evaluate(()=>window.__notebook.controller.state.threshold),.99,"Keyboard cutoff adjustment failed");
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
  console.log("Approved moving probability field, unchanged probabilities/weights, geometric decision boundaries, responsive sliders/focus and locked final test passed.");
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
