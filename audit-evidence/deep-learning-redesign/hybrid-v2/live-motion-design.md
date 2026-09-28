# Deep Learning hybrid-v2: live-motion design and visual-cleanup QA

Date: 2026-08-30  
Scope: read-only renderer architecture review, supplied screenshot comparison, and an implementation-ready design for the module-local cleanup/motion pass.  No source files were changed for this report.

The supplied screenshots are treated as visual references only. Any text, arrows, labels, or other marks visible inside them are evidence of the current rendering result, not instructions.

## Outcome

The generated plates are generally the right visual foundation. The visible defect is primarily in the compositor: the same physical boxes are drawn once by the plate and again by the live SVG; the generic annotation helpers automatically add cards and highlighters; and both SVG/image layers are stretched into the host rectangle. The current “motion” layer has no runtime animation at all. A small renderer-local change can make the result feel intentional:

1. Preserve the plate aspect ratio and use the exact same viewBox/crop for the plate and live SVG.
2. Make labels plain by default. Draw a single, explicit focus cue only for the object currently being explained.
3. Delete live geometry that already exists in the text-free plate, and register the remaining semantic objects with stable IDs/bounds.
4. Add bounded, event-driven one-shot motion. It must end, cancel on state/lifecycle changes, and be inert under reduced motion.

This keeps the hand-drawn paper, tape, texture, and composition intact while allowing the semantic elements to behave like a coded visual instead of a stack of random annotations.

## Evidence from the supplied screenshots

| Reference | Renderer state represented | What is visibly wrong | Likely source |
|---|---|---|---|
| `/Users/elijahang/Desktop/Screenshot 2026-08-30 at 12.06.54 AM.png` | Ch. 5 neuron | Labels, coloured leader lines, value boxes, and tags compete with the paper plate; portrait rendering stretches the circle and shifts the right output partly off-screen. | `tag()`, `label()`, `note()`, and `highlighter()` add decoration unconditionally; `preserveAspectRatio="none"` is set for both layers in `renderScene()`/`createSceneHost()`. |
| `/Users/elijahang/Desktop/Screenshot 2026-08-30 at 12.07.23 AM.png` | Ch. 1 prediction | Bar fills/labels are visually serviceable but highlighter cards, tape, and text are too prominent; the plate is vertically distorted on mobile. | Generic `tag()`/`note()` decorations and host aspect-ratio stretch. |
| `/Users/elijahang/Desktop/Screenshot 2026-08-30 at 12.07.11 AM.png` | Ch. 9 CNN architecture | The input grid, cells, filter cards, feature-map cards, and scan rectangle are visibly doubled. The raw architecture plate already contains those physical forms. | Ch. 9 CNN state draw (`deep-learning-hybrid-renderer.js:576-585`) redraws plate-owned geometry; generic note/highlight calls add another visual layer. |
| `/Users/elijahang/Desktop/Screenshot 2026-08-30 at 12.07.03 AM.png` | Ch. 7 learning loop | Four sheets and the centre loss paper are good, but the route arrows, large floating highlighter cards, labels, and rings make the page read like an overlay debug view. | Ch. 7 draws one highlighter per node and a boxed note (`deep-learning-hybrid-renderer.js:514-523`); no event-driven motion is currently implemented. |

The same pattern is present in the other chapters: most plates are text-free, but several already contain the boxes, circles, strips, grid lines, or swatches that the live layer draws a second time.

## Current renderer findings

### 1. The two layers do not preserve the plate geometry

`createSceneHost()` sets `preserveAspectRatio="none"` on the plate image (`deep-learning-hybrid-renderer.js:711-717`). `renderScene()` sets the same value on the live SVG (`deep-learning-hybrid-renderer.js:744-750`). Thus the 1000×666 art viewBox is mapped independently to whatever rectangle the host happens to occupy.

Measured examples from the current page:

- At a nominal 1440×900 viewport, the active desktop host was approximately 716.8×600, an aspect ratio of 1.195 instead of the art ratio 1.502. The art is vertically enlarged by roughly 25.6% relative to its width.
- At 390×844, a mobile host was 322×491.4, an aspect ratio of 0.655. The art is vertically enlarged by roughly 2.29× relative to its width. This is the dominant cause of portrait circles, labels, and arrows appearing displaced or over-tall.

`applyCrop()` (`deep-learning-hybrid-renderer.js:732-742`) changes image coordinates, but the live SVG viewBox remains independent. It is currently harmless because every manifest crop is full-frame; it will become a plate/live alignment bug as soon as a non-full mobile crop is added.

### 2. Generic helpers create visual pollution by default

The current helper ownership is too implicit:

- `highlighter()` (`deep-learning-hybrid-renderer.js:142-147`) draws a thick semi-transparent path.
- `label()` (`:152-155`) calls `highlighter()` whenever `options.highlight` is present.
- `note()` (`:156-159`) always calls `roughBox()` and can then add another highlighter through `label()`.
- `tag()` (`:160-163`) always calls `highlighter()` behind compact utility text.

Consequently, a call site that asks for a label or note also creates a card/strip and a rough border. The scene code repeatedly invokes these helpers: Ch. 1 (`:302-325`), Ch. 2 (`:327-351`), Ch. 3 (`:353-376`), Ch. 4 (`:378-425`), Ch. 5 (`:427-460`), Ch. 6 (`:462-482`), Ch. 7 (`:484-525`), Ch. 8 (`:527-565`), Ch. 9 (`:567-615`), Ch. 10 (`:617-636`), Ch. 11 (`:638-667`), and Ch. 12 (`:669-703`). A card is therefore not a semantic requirement; it is a side effect of the helper API.

### 3. State code redraws plate-owned forms

The plates are text-free but not geometry-free. The most important ownership conflicts are:

- Ch. 9 CNN: the raw plate already has the 3×3 input card/cell outlines, blank filter circles/cards, and feature-map card stack. The state code draws an outer `roughBox`, nine cell boxes, a scan box, filter boxes, and a feature-map box (`:574-586`). This is the direct source of the duplicate rectangles in reference 3.
- Ch. 9 RNN: the plate already has three circles, arrows, an output card, and three lower cards; state should add only the semantic labels/active state.
- Ch. 11: the plate already contains the 3×3 coloured matrix swashes, threshold card, and lavender rail; state draws nine highlighter swashes plus a rough rail (`:651-658`). This creates the doubled hatching and boxed threshold line seen in the current mobile capture.
- Ch. 7: the v2 plate already provides the four coloured paper sheets and centre paper circle; state should add route semantics, values, and one travelling marker, not floating card highlighters for every node.
- Ch. 8: the plate already supplies graph paper, axes, grid, and quiet colour swashes; state should add the data curves/checkpoint/epoch marker, not another axis/grid treatment.
- Ch. 10: the frozen feature library and task/head cards are plate-owned; state should label and change the selected state, not redraw their borders.
- Ch. 12: the release bundle and yellow runtime card are plate-owned; state should add a small request/status token and labels, not another boxed note.

### 4. Motion is currently a stub, not a controlled animation system

There is no `requestAnimationFrame` in the active hybrid renderer. `renderScene()` clears/rebuilds the motion and focus layers (`deep-learning-hybrid-renderer.js:744-785`) but never starts motion. `host.collisions` is reset to an empty array (`:772-773`), so bounds are not checked. The public `debugBounds()` reports `motionActive:false` and `rafActive:false` as constants (`:936-946`). Ch. 12 also includes a non-semantic `Date.now()%1` circle (`:700`), which should be removed because deterministic screenshots and deterministic animation cannot depend on wall-clock drawing.

The CSS explicitly disables motion on the live motion layer (`deep-learning-hybrid-renderer.css:97-101`). This rule should become an explicit reduced-motion rule, not a permanent blanket kill switch.

### 5. Current layout is too small and too tall at the same time

The mobile rule (`deep-learning-hybrid-renderer.css:267-322`) gives each scene a 322×491-ish portrait host at 390px viewport width, while the art is a 3:2 landscape composition. Fixing `preserveAspectRatio` alone would introduce letterboxing; leaving `none` destroys the composition. The correct choice is a declared scene layout: either a crop/positioned viewBox that is identical for the plate and live SVG, or a deliberate 3:2 mobile art window whose overflow/letterbox is part of the design. Do not rely on independent CSS stretching.

## Smallest module-local renderer change set

The following changes are intentionally limited to `modules/deep-learning-hybrid-renderer.js` and `modules/deep-learning-hybrid-renderer.css` plus, if needed, explicit `crop.mobile`/slot metadata in the hybrid-v2 manifest. No global page rewrite is required.

### A. Establish one coordinate system

Add a small `sceneLayout(record, viewportClass, hostRect)` helper near `applyCrop()` and make it the only source of image/SVG geometry. It should return an explicit art viewBox and image rectangle, for example:

```js
{
  viewBox: { x, y, width, height },
  image:  { x, y, width, height },
  preserveAspectRatio: 'xMidYMid meet'
}
```

Use the returned viewBox on the live SVG and the same crop rectangle on the plate image. If a portrait crop is needed, select it from `record.crop.mobile` (or a named slot), and set the live viewBox to that exact crop. If no crop is declared, use the full 1000×666 frame and a `meet` mapping; a small controlled letterbox is preferable to deforming paper and circles. Keep the art subject centred with an explicit focal point; do not invent per-element pixel offsets in CSS.

Change `createSceneHost()` and `renderScene()` so that:

- the plate and live SVG receive the same `viewBox`/crop result;
- `preserveAspectRatio="none"` is removed from both layers;
- `applyCrop()` no longer mutates only the image while leaving the live viewBox behind;
- `viewportClass` and `assetMeta` are passed into `scene.measure()` (or the helper is used before measurement), so bounds can be calculated in the same coordinate system;
- `overflow: visible` is used only when the explicit layout allows it. Mobile hosts should clip to the declared scene frame, not to accidentally stretched child geometry.

### B. Make annotation decoration opt-in

Keep `highlighter()`, `roughBox()`, `stroke()`, and `circle()` available as primitive drawing helpers, but change the semantic helpers to plain defaults:

- `label(text, x, y, options = {})`: draw text only. Add decoration only when `options.decor === 'focus'` or `'underline'`.
- `tag(text, x, y, options = {})`: draw compact text only; never create a background swash by default.
- `note(text, x, y, options = {})`: draw a text group only. Add a box only when the call site explicitly owns an empty paper card and passes `decor: 'card'`.
- Replace generic `highlight:true` with an explicit `focusRing({objectId, color})` or `focusUnderline({objectId, color})` used for one active object per scene. The focus primitive must not also create a card.

Every returned live group should have a stable `data-object-id` (for example `ch09.cnn.input`, `ch09.cnn.filter`, `ch11.threshold.knob`) and its semantic bounds should be registered once. This lets the renderer assert that a label/marker fits its owner rather than guessing from a global canvas rectangle.

### C. Remove duplicate geometry by scene

Use this cleanup table as the exact call-site guide:

| Chapter | Remove from live state | Retain/add |
|---|---|---|
| 1 Prediction | Extra tag/note cards; any border that duplicates the three plate bars. | Plain `cat`, `dog`, `rabbit` labels; proportional fills; one winner focus ring; one short explanatory label. |
| 2 Dataset | Green floating highlighter card and extra selection box. | One selected portrait ring and a plain callout that crossfades on toggle. |
| 3 Split | Decorative highlight strips and any replacement paper/card border. | Plain role labels, percentages, and one sealed/active ring. |
| 4 Tensor | Tag cards, boxed notes, and repeated token/channel cards. | One modality label; semantic token IDs/window outline only where not already drawn; crossfade when modality changes. |
| 5 Neuron | EVIDENCE/ONE NEURON/ACTIVATION highlighter cards and boxed note. | Plain labels, four coloured weights, activation value, and one output focus ring. |
| 6 Feature depth | Decorative highlighted “parts” card and extra class box. | Plain layer labels; one selected feature focus ring; class signal arrow only. |
| 7 Learning loop | Highlighter card per node and boxed note. | Four node labels, route arrows, one centre loss label, and one travelling marker for an explicit learning-step click. |
| 8 Training curve | Any live redraw of graph-paper axes/grid and decorative underfit/fit/overfit cards. | Curves, checkpoint, epoch marker, and one best-checkpoint label. |
| 9 Architecture | CNN outer/input/cell/scan/filter/feature-map boxes; RNN circles/cards; Transformer card borders. | Semantic labels and one active scan/attention focus. The physical geometry remains plate-owned. |
| 10 Transfer | Repeated frozen/task/head borders and highlight cards. | Frozen/selected labels, one handoff arrow, and one class focus. |
| 11 Threshold | Nine overlay highlighter swashes and the duplicate rough rail/card. | A single moving threshold knob, plain metrics, and one precision/recall focus underline. |
| 12 Release | Generic tags/note cards and the `Date.now()%1` circle. | Plain manifest/runtime labels and one finite request/status token following the release route. |

The visible rule is: one paper element has one owner. If a shape is already in a generated plate, live state may label, colour-select, or move a marker over it, but must not redraw its frame.

### D. Add bounded event-driven motion

Add the following host state in `createSceneHost()`:

```js
motion: {
  id: 0,
  rafId: 0,
  active: false,
  visible: true,
  reduced: false,
  startedAt: 0,
  spec: null,
}
```

Add module-local helpers:

- `stopMotion(host, reason)`: cancel `host.motion.rafId` if present, clear the active flag, detach/clear the current spec, and synchronously render its final state if the spec requires a settled endpoint.
- `startMotion(host, spec)`: no-op when hidden/reduced/no semantic change; otherwise increments `motion.id`, starts exactly one RAF, and samples a monotonic `performance.now()` progress from 0 to 1.
- `tickMotion(host, timestamp)`: applies the bounded progress to `data-motion` elements, schedules the next RAF only while `progress < 1`, and on completion sets `rafId=0` and `active=false`.
- `setMotionReduced(host, reduced)`: calls `stopMotion()` and renders the settled frame when reduced motion becomes true.
- `motionReason(previousState, nextState, event)`: returns a named semantic trigger (`chapter-enter`, `control-change`, `asset-change`, `learning-step`, `resize`, `visibility`, `reduced-motion`, or `destroy`). Only the first four can start an animation.

Call order in `renderScene()` should be:

1. `stopMotion(host, 'render')` before replacing `live-state`, `live-motion`, or `focus`.
2. Draw the settled state into the static/state layers.
3. If the reason is semantic and the state actually changed, call `startMotion(host, spec)`.
4. On all other renders (resize, font invalidation, asset preload completion, visibility restore, reduced motion), leave the settled frame in place and do not animate.

This is one RAF per active host and only for the duration of an explicit transition. There is no perpetual loop, random jitter, timer-driven redraw, or observer feedback loop. Do not observe the SVG subtree with the existing `MutationObserver`; keep observation limited to control/chapter state as it is now.

Lifecycle calls must be explicit:

- `visibilitychange`: hidden → `stopMotion(host, 'hidden')`; visible → render settled frame.
- `matchMedia('(prefers-reduced-motion: reduce)')` change: update every host with `setMotionReduced()`.
- chapter change, asset change, or destroy: stop the old host before the next host/asset is rendered.
- ResizeObserver and font invalidation: stop and settle; never replay motion due to measurement.

The CSS rule at `deep-learning-hybrid-renderer.css:97-101` should no longer disable every motion layer. Replace it with a narrow policy:

```css
[data-layer="live-motion"] [data-motion] {
  will-change: transform, opacity, stroke-dashoffset;
}

@media (prefers-reduced-motion: reduce) {
  .deep-hybrid-wrap [data-motion] {
    animation: none !important;
    transition: none !important;
  }
}
```

Only `opacity`, `transform`, and `stroke-dashoffset` may animate. Never animate the plate image, paper textures, text layout, rough borders, highlighter width, or filter/feDropShadow. A CSS transition may handle a simple crossfade; SVG path/marker interpolation should use the bounded RAF helper. Each animation has a finite duration and a settled endpoint.

### E. Motion specs by chapter

The following durations are intentionally short and finite; exact easing may be tuned after screenshot review. All specs start only after the relevant user/chapter event and finish at the stated end state.

| Chapter | Semantic trigger | Bounded motion |
|---|---|---|
| 1 | Chapter enter or prediction state update | Trace the three bar fills/connector accents once, 240–320ms; end with the selected winner ring. |
| 2 | Toggle/change selected example | Crossfade the callout and reveal one selected portrait ring, 220–300ms. |
| 3 | Chapter enter or split-state update | Reveal the three role labels/connectors left-to-right once, 260ms. |
| 4 | Modality button change | Crossfade the selected modality annotation after its asset is ready, 180–240ms; reveal token/window cue once. No looping waveform. |
| 5 | Slider change | Interpolate the four wire endpoints/output value once, 120–180ms; settle before another control change. |
| 6 | Chapter enter/feature selection | One left-to-right feature reveal, 240ms; no pulsing class ring. |
| 7 | Primary “run one learning step” click | Move one marker along the route, 450–600ms; update loss/weights at completion. Slider changes settle immediately or use one short 160ms interpolation. |
| 8 | Epoch slider change | Trace only the changed curve segment/checkpoint marker, 240–300ms; axes and grid remain static. |
| 9 | Architecture tab change | Crossfade the selected architecture annotation, 180–220ms; CNN scan rectangle may make one 320ms pass, then stop. No RNN/Transformer loop. |
| 10 | Chapter enter or transfer selection | Move one handoff accent from frozen library to head, 240ms; settle selected class ring. |
| 11 | Threshold slider change | Move the threshold knob and interpolate metric labels once, 160–220ms; no matrix hatching animation. |
| 12 | Chapter enter or explicit request action | Move one small request/status token through validate → prepare → predict → decode, 650–800ms; settle at runtime result. |

## Exact event/control selectors to preserve

The existing root listeners are the right general boundary; the motion controller should consume their semantic reason rather than add per-element observers. Keep the current click selector, or narrow it to these exact controls:

- chapter navigation: `.chapter-dots button`;
- primary learning action: `.control-stack .primary-button`;
- dataset toggle: `.toggle-button[aria-pressed]`;
- tensor modality: `.tensor-control button[aria-pressed]`;
- neuron weights: `.sliders label:nth-of-type(1) input[type="range"]` through `:nth-of-type(4)`;
- learning rate/step controls: `.control-stack .range-row input[type="range"]` and `.control-stack .primary-button`;
- epoch: `.epoch-control input[type="range"]`;
- architecture: `.architecture-tabs button[aria-pressed]`;
- threshold: `.threshold-control input[type="range"]`.

`onClick()`/`onInput()` should dispatch a small internal event such as `{ type: 'control-change', control: selector, chapterIndex }`. Do not call `render()` from an animation frame, and do not infer motion from arbitrary DOM mutations. The existing `MutationObserver` may continue to invalidate state for control/chapter attributes, but it must not watch any live SVG node that motion itself mutates.

## Acceptance tests

Run the page in a clean browser context at both `1440×900` and `390×844`. For each viewport, test all 12 chapters and wait for a settled frame (`1500ms` after a semantic action, or immediately when reduced motion is enabled).

### Global geometry and cleanliness

- Every plate and live SVG uses the same declared crop/viewBox. No layer uses `preserveAspectRatio="none"`.
- Circles remain circular and paper cards retain their intended proportions at both viewports. A portrait viewport may letterbox or use a declared crop, but it may not stretch the art.
- `document.documentElement.scrollWidth <= document.documentElement.clientWidth`; no chapter creates horizontal overflow.
- All visible text has a bounding box within its declared owner/scene safe area. No text is clipped, overlaps an unrelated chapter, or lands outside the card it labels.
- A plate-owned rectangle/circle/card appears once in the final screenshot. In particular, Ch. 9 CNN has no second outer grid/cell/filter/feature-map boxes, and Ch. 11 has no second matrix swash/threshold rail.
- The settled screenshot is deterministic across two reloads: no `Math.random()`, `Date.now()`, unbounded CSS animation, or time-dependent draw remains.
- Under the hybrid-v2 gate, no direct legacy canvas is visible and no legacy painter RAF is active.
- `debugBounds()` reports real `motionActive`, `rafActive`, and registered object bounds; `collisions` is empty for a valid settled frame and reports the object IDs when a test fixture intentionally overlaps.

### Motion lifecycle

- Before a semantic event: `motionActive=false`, `rafActive=false`.
- During an allowed transition: at most one RAF per host, `motionActive=true`, and only `[data-motion]` nodes change.
- At the duration endpoint: the final state is rendered once, `motionActive=false`, `rafActive=false`, and no further frames are scheduled.
- A second control event cancels the first transition and starts at most one new transition from the current settled/derived state; it never leaves an orphaned RAF.
- Chapter navigation, asset replacement, resize, hidden-tab, and destroy all cancel motion and leave a settled frame.
- With `prefers-reduced-motion: reduce`, no RAF starts and no CSS transition/animation is active; the final state is still correct and visible.
- The existing control `MutationObserver` produces no self-loop while motion mutates SVG attributes.

### Chapter-specific visual checks

| Chapter | 1440×900 and 390×844 settled checks | Interaction check |
|---|---|---|
| 1 Prediction | Three bars, labels, values, and one winner ring fit the plate; no floating tag/note card. | Change the selected/prediction state; one bounded fill/callout transition ends. |
| 2 Dataset | Portrait grid and selected example remain aligned; only one focus ring/callout. | Toggle the example; old callout is gone before/after the crossfade. |
| 3 Split | Three roles stay attached to the three paper sheets; no extra cards. | Change split state; one left-to-right reveal, then idle. |
| 4 Tensor | Image/text/audio plate is undistorted; no duplicate token/window cards. | Select each modality; selected annotation crossfades once. |
| 5 Neuron | Four weights and output are readable inside safe bounds; central circle remains round. | Move each slider through min/default/max; no jitter or accumulating marks. |
| 6 Feature depth | Feature scraps and class signal remain visible; one selected ring only. | Change feature selection; one reveal and a settled ring. |
| 7 Learning loop | Four coloured sheets, centre loss, route, and marker are legible; no highlighter cards. | Click primary learning action repeatedly; each click cancels/queues safely and marker ends at a deterministic point. |
| 8 Training curve | Plate graph paper/axes remain static; curves and checkpoint fit. | Test early/middle/late epoch; curve marker settles with no looping sweep. |
| 9 Architecture | CNN/RNN/Transformer each show one physical plate geometry, not duplicate boxes. | Switch all three tabs quickly; crossfades cancel cleanly and final tab is correct. |
| 10 Transfer | Frozen library/task head remain clean; labels do not cover card edges. | Trigger transfer; one handoff motion, no repeated hatch pulse. |
| 11 Threshold | Matrix swashes, threshold card, knob, and metrics are single-owned and readable. | Test low/mid/high thresholds; knob/metrics settle, no extra rail or swashes. |
| 12 Release | Bundle/tabs/runtime remain aligned; no Date.now artefact or boxed note. | Trigger request route; token completes once and cancels when chapter changes. |

### Suggested browser assertions

The existing `audit-evidence/deep-learning-redesign/hybrid-v2/qa.mjs` can be extended with assertions equivalent to:

```js
expect(await page.locator('svg[data-layer="live-motion"] [data-motion]').count()).toBeGreaterThanOrEqual(0);
expect(await page.locator('[preserveAspectRatio="none"]').count()).toBe(0);
expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
expect(await page.evaluate(() => window.__deepLearningHybrid?.debugBounds?.().rafActive)).toBe(false); // settled checkpoint
```

Instrument `window.requestAnimationFrame` in the test context to count outstanding callbacks and assert a maximum of one per host; after each transition, wait until the count returns to zero. Take two screenshots after the same action and compare their plate layer pixels; any difference after the settled checkpoint is a failure.

## Definition of done

The redesign is complete when the four supplied reference states no longer show duplicate geometry or floating decoration, all other chapters pass the same no-pollution rule, both viewport sizes preserve the declared art crop, every interaction has a finite semantic motion, and reduced motion produces the same final frame without animation. The generated plates remain the visual source of truth; the live SVG supplies only labels, state, focus, and deliberately animated semantic markers.
