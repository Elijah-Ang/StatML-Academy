# Proposed implementation examples

These are reviewable starting points for the current codebase, not changes already installed in the application. File names marked **new** are proposed. Migrate a pilot module before applying the contract elsewhere. The examples intentionally use native browser APIs and the repository's existing Playwright package.

## 1. Stop validation from regenerating source

**Current targets:** `scripts/generate-foundations.mjs:109`, the write loop in `scripts/core-modules.mjs`, and imports at `scripts/build.mjs:4–5`.

Today, importing the generator runs its top-level `writeFile` loop. `--validate-only` therefore is not truly read-only. First place generation behind an explicit entry-point check, then separate inventory data into a pure file. For the foundation generator, replace the unconditional final loop with:

```js
// Add to the existing imports in generate-foundations.mjs.
import { fileURLToPath } from 'node:url';

// `root`, `lessons`, `page`, `writeFile`, `join`, and `resolve` already exist.
export async function generateFoundationPages() {
  for (const [slug, data] of Object.entries(lessons)) {
    await writeFile(join(root, 'modules', `${slug}.html`), page(slug, data));
  }
}

const invokedDirectly = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await generateFoundationPages();

// Retain the existing `export { lessons };` declaration once.
```

Apply the same pattern around **all** writes in `core-modules.mjs`, including its generated browser inventory. Importing the data must not rewrite any HTML or JS. The existing `build.mjs` can then import safely, or preferably import only the new pure curriculum/lesson-data modules.

Add explicit package scripts, retaining the current browser commands:

```json
{
  "generate": "node scripts/core-modules.mjs && node scripts/generate-foundations.mjs",
  "validate": "node scripts/build.mjs --validate-only",
  "build": "node scripts/build.mjs"
}
```

After extracting authored data, make CI generate into a temporary output directory and compare results, rather than silently updating source during validation. Keep generated output and its editable source clearly identified.

## 2. Create one curriculum and stage contract

**Current targets:** `scripts/core-modules.mjs`, `modules/core-modules.js`, `index.html:1031–1207`. **New proposed file:** `modules/curriculum-data.js`.

Use one object per module. Keep all existing slugs; store the 33 entries in this file and derive both navigation presentations from them. This abbreviated example shows the contract, not a complete replacement inventory:

```js
export const curriculum = [
  {
    slug: 'simple-linear-regression',
    title: 'Simple Linear Regression',
    href: 'modules/simple-linear-regression.html',
    track: 'regression',
    prerequisites: ['correlation'],
    renderer: 'regression-canvas',
    stageCount: 8
  },
  {
    slug: 'evaluation-metrics',
    title: 'Evaluation Metrics',
    href: 'modules/evaluation-metrics.html',
    track: 'evaluation',
    prerequisites: ['probability-sampling'],
    renderer: 'foundation',
    stageCount: 9
  }
];
```

Prerequisites here are proposed teaching links, not a claim about the current manifest. Review them across the full curriculum. A recommended beginner path should start with the required concepts, while free exploration remains available.

For stage content, render static HTML at build time from a structured record. Do not defer all educational text to client-side JS:

```js
export const residualStage = {
  id: 'residuals',
  legacyAnchor: 'stage-3',
  title: 'What is a residual?',
  question: 'How far did our prediction miss?',
  plainAnswer: 'A residual is the actual score minus the predicted score.',
  visual: 'regression-residuals',
  mini: { type: 'calculation-receipt', observationId: 'student-c' },
  interaction: { type: 'select-observation', defaultId: 'student-c' },
  deeper: [
    { title: 'Why vertical distance?', contentKey: 'residual-direction' },
    { title: 'Residual versus unobserved error', contentKey: 'residual-error' }
  ],
  check: {
    prompt: 'Actual score 61; prediction 59. What is the residual?',
    answer: 2,
    explanation: '61 − 59 = +2 score points.'
  }
};
```

Validate references, unique IDs, a real explanation for each check, required concepts, and valid scene names. Replace the current “at least 650 readable words” gate with completeness checks plus editorial review; a padded paragraph is not evidence of comprehensiveness.

## 3. Replace perpetual loops with finite, interruptible transitions

**Current targets:** `simple-linear-regression.html:2103–2163`, `kmeans.html:1460`, `pca.html:2669`, and equivalent active canvas loops. **New proposed file:** `modules/lesson-runtime/pose-renderer.js`.

This complete helper interpolates a **flat numeric view pose**. It does not interpolate data, class labels, algorithm assignments, or arbitrary SVG path strings. Call `setVisible(false)` when the stage is not active/in view. Its exact numeric keys are defined when constructed; mount a new scene if its topology changes.

```js
export function createPoseRenderer({ initial, paint, duration = 260 }) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const keys = Object.keys(initial);
  let shown = { ...initial };
  let from = { ...initial };
  let target = { ...initial };
  let started = 0;
  let raf = 0;
  let visible = true;
  let disposed = false;
  let moving = false;
  const canPaint = () => visible && !document.hidden && !disposed;
  const ease = t => 1 - (1 - t) ** 3;

  function cancelFrame() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  function queue() {
    if (!raf && canPaint()) raf = requestAnimationFrame(frame);
  }
  function settle() {
    cancelFrame();
    shown = { ...target };
    moving = false;
    if (canPaint()) paint(shown, { settled: true });
  }
  function frame(now) {
    raf = 0;
    if (!canPaint()) return;
    const progress = moving
      ? Math.min(1, Math.max(0, (now - started) / duration))
      : 1;
    const t = ease(progress);
    shown = Object.fromEntries(keys.map(key => [
      key, from[key] + (target[key] - from[key]) * t
    ]));
    moving = progress < 1;
    paint(shown, { settled: !moving });
    if (moving) queue();
  }
  function to(next, { immediate = false } = {}) {
    if (disposed) return;
    if (Object.keys(next).length !== keys.length
        || keys.some(key => !Number.isFinite(next[key]))) {
      throw new TypeError('A view pose must keep the same finite numeric keys.');
    }
    target = { ...next };
    from = { ...shown }; // Retarget from the last displayed position.
    if (immediate || media.matches || duration <= 0 || !canPaint()) {
      settle();
      return;
    }
    moving = keys.some(key => target[key] !== shown[key]);
    started = performance.now();
    queue();
  }
  document.addEventListener('visibilitychange', settle,
    { signal: events.signal });
  media.addEventListener('change', () => {
    if (media.matches) settle();
  }, { signal: events.signal });
  paint(shown, { settled: true });

  return {
    to,
    invalidate: queue, // Resize redraws current state; it creates no samples.
    setVisible(value) {
      visible = Boolean(value);
      settle(); // Return to an exact snapshot instead of replaying hidden time.
    },
    dispose() {
      disposed = true;
      cancelFrame();
      events.abort();
    }
  };
}
```

For the regression pilot, extract the drawing body into `drawRegressionFrame(pose)`, leaving dataset fitting in the model layer. Then the integration is:

```js
const view = createPoseRenderer({
  initial: { slope: state.userM, intercept: state.userB, residualOpacity: 0 },
  paint: pose => drawRegressionFrame(pose)
});

// A deliberate transition, such as “Show fitted line”.
view.to({ slope: stats.optM, intercept: stats.optB, residualOpacity: 1 });

// Direct manipulation must track the learner's hand without easing lag.
slopeInput.addEventListener('input', () => {
  state.userM = Number(slopeInput.value);
  view.to({
    slope: state.userM,
    intercept: state.userB,
    residualOpacity: 1
  }, { immediate: true });
});
```

`drawRegressionFrame` is a proposed extraction, not an existing function. If the receipt describes the currently drawn trial line, derive its residuals from that pose too. If the value instead describes the exact destination fit, label it as the fitted target during the transition. Do not show mismatched line geometry and unlabeled SSE.

For K-Means, preserve exact snapshots such as `{centroids, assignments, wcss, iteration}`. Flatten only the displayed centroid coordinates into a pose. Advance the algorithm from exact snapshots, never from interpolated locations. Assignment colors change at an explicit phase boundary. A visual transition is not another optimization iteration.

## 4. Give the sketch board persistent scene instances

**Current target:** `study-sketch.js:242–264`, especially the `.innerHTML = p.svg(...)` assignment.

Introduce a per-scene `mount`/`update`/`dispose` contract. Initially only migrated scenes implement it. Keep the old Pen renderer as a clearly marked fallback so the entire site does not need simultaneous conversion.

```js
// Proposed replacement for the art-rendering portion of Board.render().
const art = this.host.querySelector('.sketch-art');
if (scene.mount) {
  if (this.activeScene !== scene) {
    this.activeView?.dispose?.();
    this.activeView = null;
    art.replaceChildren(); // Once on a genuinely different scene.
    this.activeView = scene.mount(art, this.state);
    this.activeScene = scene;
  }
  this.activeView.update(this.state, this.step);
} else {
  // Temporary compatibility path. Do not claim it has persistent marks.
  this.activeView?.dispose?.();
  this.activeView = null;
  this.activeScene = null;
  const pen = new Pen();
  scene.draw(pen, this.state, this.step);
  art.innerHTML = pen.svg(scene.title);
}
```

Keep the heading, control state, caption, and `alignNotes` responsibilities from the original method. A migrated scene should create marks once, keyed by observation or concept ID, then update attributes or transforms. Retain the current deterministic pen geometry for cosmetic strokes; do not generate a different wobble on every animation frame.

For example, a mounted scene can preserve a map of existing nodes:

```js
const SVG_NS = 'http://www.w3.org/2000/svg';
function mountPointMarks(group, observations) {
  const marks = new Map();
  for (const row of observations) {
    const mark = document.createElementNS(SVG_NS, 'circle');
    mark.dataset.observationId = row.id;
    mark.setAttribute('r', '5');
    group.append(mark);
    marks.set(row.id, mark);
  }
  return {
    update(project, selectedId) {
      for (const row of observations) {
        const mark = marks.get(row.id);
        const point = project(row);
        mark.setAttribute('cx', String(point.x));
        mark.setAttribute('cy', String(point.y));
        mark.classList.toggle('is-selected', row.id === selectedId);
      }
    },
    dispose() { marks.clear(); }
  };
}
```

This is the identity mechanism, not a complete accessible chart. Pair it with an observation selector/table, native buttons for actions, an SVG title/description, hit testing for pointer use, and the finite transition driver. Changing point counts requires an explicit keyed enter/update/exit operation. A topology change should not interpolate unrelated path segments.

Change `Board.advance()` so Next stops at the final step; add an explicit replay/reset action. Replace the repeating `setInterval` with a timeout scheduled only after the current step transition completes. Pause on stage exit, hidden document, and manual interaction. In reduced motion, trace steps remain available; optional timed playback can advance discrete settled steps only through an explicit user action, with pause available and no spatial animation.

## 5. Separate sampling from rendering

**Current target:** `foundation-module.js:925–947`. `draw()` currently runs `Math.random()`, so resizing changes the experiment.

Use a seeded pool and derive the displayed means from it. The following reproduces the current teaching population's approximate normal generator while keeping a sample prefix stable when n changes. It is an approximation, not an exact normal RNG.

```js
function randomFrom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeSamplePool(seed, maxDraws = 300, maxN = 144) {
  const random = randomFrom(seed);
  const observation = () => {
    let sum = 0;
    for (let j = 0; j < 12; j++) sum += random();
    return 50 + 12 * (sum - 6);
  };
  return Array.from({ length: maxDraws }, () =>
    Array.from({ length: maxN }, observation));
}

function sampleMeans(pool, n, draws) {
  if (!Number.isInteger(n) || n < 1 || n > pool[0].length
      || !Number.isInteger(draws) || draws < 1 || draws > pool.length) {
    throw new RangeError('Invalid teaching sample dimensions.');
  }
  return pool.slice(0, draws).map(sample =>
    sample.slice(0, n).reduce((sum, value) => sum + value, 0) / n);
}

let experiment = { seed: 2041, n: 16, draws: 100 };
let pool = makeSamplePool(experiment.seed);
let means = sampleMeans(pool, experiment.n, experiment.draws);

function updateSampleSettings(patch) {
  experiment = { ...experiment, ...patch };
  means = sampleMeans(pool, experiment.n, experiment.draws);
  draw();
}
function drawAnotherExperiment() {
  experiment = { ...experiment, seed: experiment.seed + 1 };
  pool = makeSamplePool(experiment.seed);
  means = sampleMeans(pool, experiment.n, experiment.draws);
  draw();
}
function draw() {
  // Move only the existing histogram drawing and metric display here.
  // Read `means` and `experiment`; do not sample, refit, or mutate either.
}
```

Keep the data pool separate from cosmetic pen-stroke randomness. A sample-size change is an explicit recomputation; a window-size change is only a projection change. Add axes “Sample mean (score points)” and “Number of samples,” with bins/domains that contain all generated means rather than silently clamping extreme values into end bins.

## 6. Update metrics without replacing their DOM

**Current target:** `foundation-module.js:616–618`. Replacing metric markup on every slider event causes unnecessary DOM work and triggers the decoration observer repeatedly.

Mount metric slots once, using labels and IDs owned by the lab:

```html
<dl class="lesson-metrics">
  <div><dt>True positives</dt><dd data-metric="tp">80</dd></div>
  <div><dt>False positives</dt><dd data-metric="fp">90</dd></div>
  <div><dt>Precision</dt><dd data-metric="precision">47.1%</dd></div>
</dl>
<p class="lesson-status" role="status" aria-live="polite"></p>
```

```js
function updateMetricSlots(root, values) {
  for (const [key, value] of Object.entries(values)) {
    const slot = root.querySelector(`[data-metric="${CSS.escape(key)}"]`);
    if (slot) slot.textContent = String(value);
  }
}

let pendingPaint = 0;
thresholdInput.addEventListener('input', () => {
  model.threshold = Number(thresholdInput.value);
  if (!pendingPaint) pendingPaint = requestAnimationFrame(() => {
    pendingPaint = 0;
    renderFromModel();
  });
});
thresholdInput.addEventListener('change', () => {
  root.querySelector('.lesson-status').textContent = summarize(model);
});
```

`model`, `renderFromModel`, and `summarize` are lab adapter responsibilities. Cancel `pendingPaint` on disposal. Avoid an `aria-live` region around every rapidly updating value; announce the committed or debounced summary instead of each animation frame.

## 7. Render a left-side miniature and deeper explanation

**Current targets:** the foundation `page()` generator and authored core stage content. This example uses native static HTML; its answer remains available without JS.

```html
<section class="lesson-step" id="why-square-errors"
         aria-labelledby="square-question">
  <p class="lesson-kicker">Measure the mistakes · 4 of 8</p>
  <h2 id="square-question">Why square the errors?</h2>
  <p>One prediction is 4 points too low. Another is 4 points too high.
     Adding the signed errors hides both mistakes. Squaring keeps
     both mistakes in our score and gives large misses more weight.</p>

  <table class="mini-calculation">
    <caption>Two mistakes that should not cancel</caption>
    <thead><tr><th scope="col">Case</th><th scope="col">Residual</th>
      <th scope="col">Squared residual</th></tr></thead>
    <tbody>
      <tr><th scope="row">A</th><td>+4 points</td><td>16 points²</td></tr>
      <tr><th scope="row">B</th><td>−4 points</td><td>16 points²</td></tr>
    </tbody>
    <tfoot><tr><th scope="row">Total</th><td>0 points</td>
      <td>32 points²</td></tr></tfoot>
  </table>

  <details class="lesson-deeper">
    <summary>Why not use absolute errors instead?</summary>
    <p>We can. Absolute error also prevents cancellation. Squared error
       gives large misses more influence and leads to the least-squares
       solution. That choice can also make the fit more sensitive to outliers.</p>
  </details>

  <details class="lesson-check">
    <summary>Check: what do +2 and −2 contribute to SSE?</summary>
    <p>2² + (−2)² = 8 points². The signed total is zero, but the
       predictions still made two mistakes.</p>
  </details>
</section>
```

Use the currently selected live observation for a linked miniature; label this example “Two illustrative mistakes” if the live graph contains different data. Add a real attempt-and-feedback control when retrieval is the goal. Keep distractor feedback specific and avoid the current foundation pattern where the correct answer is consistently first.

## 8. Scope the visual system and protect readable math

**Current targets:** `handwritten-theme.css:150`, `handwritten-theme.css:180`, page-local standardized CSS, and generated inline foundation theme. **New proposed file:** `modules/lesson-ui.css`.

Before applying the following styles, exclude migrated v2 roots from the old wildcard `!important` rules and equivalent high-specificity page-local rules. Simply appending another normal stylesheet cannot overcome those rules. Change the old wildcard selector to `body.hw-handwritten:not([data-lesson-version="2"]) *`, and apply the same explicit legacy guard to the standardized wildcard and formula-font overrides. Audit each migrated page's computed styles; this is not a blanket deletion of the current theme.

```css
body[data-lesson-version="2"] {
  --lesson-paper: #fbf4e2;
  --lesson-surface: #fffbef;
  --lesson-ink: #293a32;
  --lesson-muted: #566057;
  --lesson-blue: #2869ad;
  --lesson-error: #a6493d;
  --lesson-rule: #d7cfb9;
  --lesson-hand: "Patrick Hand", "Kalam", cursive;
  color: var(--lesson-ink);
  background: var(--lesson-paper);
  font-family: var(--lesson-hand);
}

[data-lesson-version="2"] .lesson-layout {
  display: grid;
  grid-template-columns: minmax(0, .82fr) minmax(0, 1fr);
  gap: clamp(1.5rem, 4vw, 4rem);
  max-width: 84rem;
  margin-inline: auto;
  padding: 2rem clamp(1rem, 4vw, 3rem);
  align-items: start;
}

[data-lesson-version="2"] .lesson-copy {
  max-width: 60ch;
  font-size: 1.1875rem;
  line-height: 1.65;
}

[data-lesson-version="2"] .lesson-visual {
  position: sticky;
  top: calc(var(--lesson-nav-height, 3.5rem) + 1rem);
  min-width: 0;
}

[data-lesson-version="2"] .lesson-metrics dd {
  min-width: 7ch;
  margin: 0;
  font-variant-numeric: tabular-nums;
}

[data-lesson-version="2"] .mini-calculation {
  width: 100%;
  border-collapse: collapse;
}
[data-lesson-version="2"] .mini-calculation :is(th, td) {
  padding: .55rem .35rem;
  border-bottom: 1px solid var(--lesson-rule);
  text-align: start;
}

@media (max-width: 56.25rem) {
  [data-lesson-version="2"] .lesson-layout { grid-template-columns: 1fr; }
  [data-lesson-version="2"] .lesson-visual { position: static; }
  [data-lesson-version="2"] .lesson-control {
    min-height: 2.75rem;
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  [data-lesson-version="2"] .lesson-motion {
    animation: none;
    transition: none;
  }
}
```

This stylesheet establishes the token and layout contract; it is not a finished mobile expansion component. Implement that as an explicit view with a return anchor and preserved state. Maintain visible focus styling. The CSS media query does not stop canvas JS loops; use the runtime motion preference too.

## 9. Use one stage authority

**Current targets:** `mobile-reading.js`, each migrated page's observer, and shared stage-navigation code. The controller should choose the stage containing a single reading line, measured from the actual sticky UI—not whichever observer callback runs last.

```js
function stageAtReadingLine(stages, readingY) {
  const measured = stages.map(element => ({
    element, rect: element.getBoundingClientRect()
  }));
  const containing = measured.find(({ rect }) =>
    rect.top <= readingY && rect.bottom > readingY);
  if (containing) return containing.element;
  return measured.reduce((best, candidate) => {
    if (!best) return candidate;
    return Math.abs(candidate.rect.top - readingY)
      < Math.abs(best.rect.top - readingY) ? candidate : best;
  }, null)?.element ?? null;
}
```

Call this from one coalesced scroll/resize scheduler; update the active stage only if its ID changes. Keep all geometry reads together before class/style writes. Navigation, progress, prose, and diagram subscribe to that ID. Disable the old observers on v2 pages, preserve each stage's user settings, and do not call a randomizing `resetAlgorithm()` merely because a heading crossed the line.

For expensive fits, add request versioning to a worker adapter: each control change increments a version, and the UI applies only the result with the current version. Preserve the last valid plot while an actual calculation is pending. If errors occur, retain the current controls and explain the failed calculation instead of showing an empty stage.

## 10. Meaningful tests to accompany the migration

The repository has `playwright`, not `@playwright/test`, in its current package manifest. Extend its existing standalone scripts, or consciously add a new test runner in a separate change. Do not copy a new runner's imports and assume they will work.

Add these behavioral assertions to the appropriate existing server/browser harness:

```js
// Proposed v2 test hook: a read-only snapshot of scientific state.
// Expose it only in a development/test build or behind the existing test mode.
const before = await page.evaluate(() => window.__lessonTest.modelSnapshot());
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => new Promise(resolve =>
  requestAnimationFrame(() => requestAnimationFrame(resolve))));
const after = await page.evaluate(() => window.__lessonTest.modelSnapshot());
assert.deepEqual(after, before, 'Resize must not resample or refit the model');

// A migrated diagram keeps mark identity between trace steps.
await page.evaluate(() => {
  window.__originalMark = document.querySelector('[data-observation-id="email-1"]');
});
await page.locator('[data-sketch="next"]').click();
assert.equal(await page.evaluate(() =>
  window.__originalMark === document.querySelector('[data-observation-id="email-1"]')
), true);
```

The IDs and test hook above are proposed contracts and must be introduced by the pilot; these assertions are not claimed to pass against today's pages. Use Playwright polling for a known settled state rather than arbitrary long sleeps when testing final geometry.

Add pure mathematical tests for the corrected imbalanced example, regression fit, ANOVA table, K-Means snapshots, and PCA outputs. Add a regression test that the final test split cannot affect selection. Check keyboard focus after a scene update, a non-drag pointer alternative, reduced-motion final state, return from expanded mobile exploration, and no callbacks after disposal. These test scientific meaning and user behavior rather than mirroring individual implementation lines.
