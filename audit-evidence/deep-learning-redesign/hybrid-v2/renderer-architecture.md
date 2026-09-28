# Deep Learning hybrid-v2 renderer architecture

**Status:** implementation design; read-only source review, no application source changes

**Owner:** Deep Learning only (`modules/deep-learning.html` and module-local assets/renderer)

**Comparison point:** baseline commit `99e3aaceb229d6028b24ec94159462829b965f79`

**Design intent:** turn the current “handwritten font on a coded diagram” into a small set of authored, text-free, image-generated notebook illustrations with live, measurable code layered on top. The illustration supplies materiality (paper, graphite, marker, tape, imperfect edges); code supplies every value, label, arrow, selection, control response, hit target, and animation.

## 1. Non-negotiable contract

This is a visual-medium replacement, not a lesson rewrite or a layout redesign.

The implementation must preserve, byte-for-byte unless a separately approved accessibility correction is required:

- the twelve `_l` chapter records, chapter titles, body copy, `why`, `how`, `mental`, `note`, `visual`, and `keys` strings;
- the `ps` tensor-mode explanations and `Di` architecture explanations;
- chapter order, `id="chapter-1"` through `id="chapter-12"`, the chapter-dot map, footer/brand navigation, and the existing intersection-based active-chapter behavior;
- all defaults, control labels, ranges, steps, keyboard behavior, and ARIA state;
- the existing desktop/mobile stage footprint and narrative scroll rhythm. The art layer may not alter stage height or collapse the original chapter spacing;
- the existing shared handwritten theme files. No change to `modules/handwritten-theme.css` or `modules/handwritten-theme.js` is part of this design;
- the reduced-motion behavior and the live caption/narrative as the accessible explanation of each scene.

The supplied reference images define material and drawing language only: warm ruled paper, graphite/ink outlines, marker swashes, sticky notes, taped scraps, uneven contours, and a single-person study-notebook voice. They do **not** authorize copying their phone chrome, two-column layouts, module-card layout, or density.

The generated images are not screenshots and must not contain readable text, numbers, mathematical symbols, axes, legends, controls, percentages, or baked-in state. They are bounded illustrations beneath live code.

## 2. Why the current renderer cannot be incrementally patched

The current module-local renderer is a useful source boundary, but it is still a primitive painter. It paints all twelve branches into one Canvas with a 720×540 coordinate system and then relies on code-generated panels, fonts, paths, and labels. The surrounding page still has the old bundled React painter guarded at its `My` seam and several inert historical style blocks.

Relevant current source regions:

| Region | Current responsibility | Hybrid-v2 decision |
|---|---|---|
| `modules/deep-learning.html:19-26` | renderer flag and asset/script loading | Keep the early module-local flag; switch to a versioned v2 loader only after the v2 smoke test passes. |
| `modules/deep-learning.html:1665-1977` | old material, shell-ink, containment, and rhythm style blocks (currently `type="text/plain"`) | Keep inert during migration; remove only after v2 evidence proves no selector is needed. Never reactivate them. |
| `modules/deep-learning.html:1983-2404` | retired adapter and legacy painter region | Keep the surgical `My` guard as rollback protection during migration; retire the old region after the v2 renderer owns every chapter and no legacy Canvas/RAF exists. |
| `modules/deep-learning-renderer.js:101-275` | rough paths, panels, arrows, dots, grid, cat/dog primitives | Replace as the primary visual medium. Retain only seeded stroke/label helpers needed for live overlays, with no per-frame jitter. |
| `modules/deep-learning-renderer.js:277-685` | Chapters 1–4 scene painters | Replace scene bodies with registry entries; retain state semantics and data values. |
| `modules/deep-learning-renderer.js:697-972` | Chapter 5–6 painters | Chapter 5 can retain a live code layer; Chapter 6 should be re-authored around separated asset/overlay lanes. |
| `modules/deep-learning-renderer.js:972-1192` | learning trace and Chapters 7–8 | Retain state math; move chart/loop visuals into cached static plus event-driven live layers. |
| `modules/deep-learning-renderer.js:1195-1705` | Chapters 9–12 painters | Replace branch painter with three architecture plates and bounded live overlays; preserve architecture/threshold/release semantics. |
| `modules/deep-learning-renderer.js:1707-1871` | dispatch, DOM state extraction, Canvas creation, observers, global renderer API | Refactor to a scene host/compositor API. Retain observers/state extraction; remove `drawScene` chain and Canvas-only assumptions. |

The failure mode to avoid is adding another CSS mask, Canvas filter, global interception hook, or animation pass to hide a shape. Every visible object must have exactly one authoritative owner.

## 3. Medium decision: raster illustration + live SVG overlay

### 3.1 Primary compositor

Use a module-local scene host with this conceptual structure:

```html
<div class="deep-scene-host" data-chapter="1">
  <div class="deep-scene-art" aria-hidden="true">
    <img class="deep-scene-plate" alt="" decoding="async">
    <canvas class="deep-scene-texture" aria-hidden="true"></canvas>
  </div>
  <svg class="deep-scene-live" viewBox="0 0 1000 666" role="img"
       aria-label="Live visual; explanation appears in the chapter text">
    <g data-layer="live-static"></g>
    <g data-layer="live-state"></g>
    <g data-layer="live-motion"></g>
    <g data-layer="focus"></g>
  </svg>
</div>
```

The actual DOM shape may remain a single Canvas if the existing stage contract makes that safer, but the v2 implementation should treat the scene as these explicit layers. SVG is the preferred live layer because it provides measurable bounds, crisp responsive scaling, semantic groups, `pointer-events` control, and straightforward hit-region testing. The generated bitmap is decorative and `aria-hidden`; the existing DOM caption/narrative remains the authoritative accessible description.

Use Canvas only for a genuinely dense, stateful surface that is difficult to express as SVG (for example the Chapter 8 curve texture or a small Chapter 4 spectrogram). It must be a module-local, cached layer, never a monkey-patched global context. A Canvas fallback may be drawn underneath the same SVG overlay.

WebGL is **not** the default. The twelve scenes do not contain enough dense imagery to justify WebGL's context/lifecycle and accessibility complexity. The compositor may expose a `webgl` strategy hook for a later measured need, but v2 must use SVG plus raster and optional 2D Canvas. If WebGL is ever selected, it must have an automatic SVG/Canvas fallback, no visual difference in layout, and no dependency on a GPU-only filter.

### 3.2 Ownership rule

| Object type | Owner | Reason |
|---|---|---|
| paper grain, notebook rules, tape, hand-drawn subject silhouette, quiet material stains | generated raster plate | These are the high-fidelity human marks that code currently fails to reproduce. |
| labels, numbers, equations, axis titles, percentages, legends, arrows | SVG/Canvas live layer | They must remain readable, responsive, accessible, and stateful. |
| slider/threshold/selection values | existing HTML controls plus live overlay | The input remains keyboard-operable; the overlay mirrors its state. |
| data points, matrix cells, curves, loss, attention weights, moving token | live code | These must update truthfully with state. |
| selection rings and focus indicators | live code | They must move with the current target and never be baked into art. |
| purely decorative accent mark | raster or one seeded SVG mark | It must be authored once and remain pixel-stable. |

No object may be painted by both the plate and live code unless the overlap is intentional and documented (for example, code text filling a blank bar printed in `ch01-finish-line-v1.png`).

## 4. Asset production specification

### 4.1 Required asset family

Generate one primary text-free illustration plate for every chapter, plus state/branch plates only where the visual subject materially changes. Generate at a common 3:2 artboard (recommended 1536×1024 or 1800×1200) with a generous 8–10% safe margin. Use the same paper stock, graphite darkness, blue/green/coral/amber/lavender marker palette, tape style, and imperfect contour language across all plates so they look drawn by one person.

The asset prompt must say:

> warm off-white ruled notebook paper; one person's careful hand-drawn study notes; graphite pencil texture, dark ink outlines with slight pressure variation, blue/green/coral/amber/lavender marker and highlighter; uneven hand-cut paper edges; occasional translucent masking tape; sparse, calm, well-spaced; no typography, no letters, no numerals, no mathematical symbols, no chart axes, no UI, no buttons, no fake screenshot, no gradients or glossy digital effects; leave clean blank lanes for live labels and values.

The final generated image must be visually reviewed at 100% and 390px width. Reject it if it contains pseudo-letters, malformed writing, accidental UI, crowded hatching, a hard digital border, or a subject that cannot be cropped without losing its focal object.

### 4.2 Current concrete asset

The first proof plate already exists:

`/Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/assets/deep-learning/hybrid-v2/ch01-finish-line-v1.png`

It is a 1536×1024 opaque RGB PNG (~2.1 MB), text-free. It contains a graphite cat input taped to ruled paper and a taped blank probability sheet with three colored swatches and blank bars. It is a valid v2 plate, with one important integration rule: the three blank bars and their swatches are structural slots. Code must place `cat`, `dog`, `rabbit`, `89%`, `8%`, `3%`, and the live fills over those slots; it must not draw a second frame or second set of colored circles on top.

For Chapter 1, use `object-fit: contain`/equivalent aspect-preserving draw, not a stretched crop. Desktop and mobile crop metadata should keep the cat and all three blank bars visible. If the mobile stage is too narrow for the whole plate, use a v2 mobile crop/variant with the same art, not CSS distortion. The live overlay should use normalized coordinates derived from the source image (approximate slots measured from the asset, then verified visually), not the old 720×540 coordinates.

### 4.3 Planned asset IDs and generation brief

The following is the minimum asset set. Asset IDs are stable API names; filenames may be versioned.

| Chapter | Asset ID(s) | Generated subject/material | Must remain live |
|---:|---|---|---|
| 1 | `ch01.finish-line` | cat photo-sketch taped to a notebook and blank probability sheet; the existing `ch01-finish-line-v1.png` is the first candidate | three labels, fills, percentages, prediction arrow, selected winner, sum note |
| 2 | `ch02.dataset-neutral`, `ch02.dataset-shortcut` | 3×3 contact-sheet scraps with repeated hand-drawn dog studies and varied/constant context marks; no labels | tile positions, highlighted confounder, toggle state, one leader/circle, comparison note |
| 3 | `ch03.split-notebook` | one paper dataset stack feeding three empty taped sheets or a single partition strip | train/validate/test roles, 70/15/15, jobs, sealed-test mark, live partition cue |
| 4 | `ch04.image`, `ch04.text`, `ch04.audio` | three separate blank representation studies: pixel paper, token scraps, waveform/spectrogram paper | mode-specific labels, IDs, dimensions, channel/sequence/time arrows, highlighted sample/window |
| 5 | `ch05.neuron` | quiet pencil neuron/desk texture with a blank central node and three hand-drawn input threads | weights, products, bias, Σ/ReLU/output values, slider response, all arrows |
| 6 | `ch06.feature-ladder` | four separated paper scraps showing increasingly recognizable marks: pixels, edges, texture, parts | layer labels, arrows, selected/highlighted layer, class result; no overdraw or moving wash |
| 7 | `ch07.learning-loop` | four corner notes connected by a single ink loop on ruled paper; central blank loss note | FORWARD/LOSS/BACKPROP/UPDATE labels, step, loss, learning-rate response, one event marker |
| 8 | `ch08.training-curve-paper` | blank graph paper with soft hand-drawn axes and a few non-semantic marker swash guides | exact training/validation curves, epoch marker, checkpoint, underfit/useful/overfit regions, legend |
| 9 | `ch09.cnn`, `ch09.rnn`, `ch09.transformer` | three distinct hand-drawn architecture studies: image/filter/map scraps; state bubbles; token/attention threads | architecture labels/tabs, current selection, filter/window, states, attention weights/links, all explanatory text |
| 10 | `ch10.transfer` | taped frozen feature library and blank trainable head, with quiet feature doodles inside the library | frozen/trainable labels, feature names, class chips, hand-off arrow, fine-tune note |
| 11 | `ch11.threshold-matrix` | blank matrix paper with lightly inked cell grid and a separate threshold slider scrap | matrix counts, threshold knob, recall/precision/accuracy, trade-off arrows, correct/error coloring |
| 12 | `ch12.release-pipeline` | taped release bundle and an empty vertical route/spine on ruled paper | manifest values, four route stages, one moving request token, operational trade-off note |

Generated plates should be text-free even if an image generator can produce handwriting. This prevents malformed text and lets the existing authored strings remain the sole copy source.

## 5. Asset manifest and loading contract

Create `assets/deep-learning/hybrid-v2/manifest.json`. It is a checked-in source artifact, not generated at runtime. Every asset entry must include provenance so a future agent can regenerate the same illustration without guessing.

Recommended schema:

```json
{
  "schema": "statml.deep-learning.hybrid-scene@2",
  "version": "2026-08-29-v2",
  "baseUrl": "../../assets/deep-learning/hybrid-v2/",
  "style": {
    "referenceSet": ["statml-handwritten-01", "statml-handwritten-02"],
    "paper": "warm-ruled-cream",
    "ink": "graphite-ink",
    "palette": {"structure": "blue", "healthy": "green", "risk": "coral", "caution": "amber", "secondary": "lavender"}
  },
  "assets": {
    "ch01.finish-line": {
      "chapter": 1,
      "src": "ch01-finish-line-v1.png",
      "fallback": "ch01-finish-line-v1.svg",
      "kind": "plate",
      "intrinsic": {"width": 1536, "height": 1024},
      "textFree": true,
      "opaque": true,
      "focal": {"x": 0.5, "y": 0.5},
      "crop": {
        "desktop": {"x": 0.02, "y": 0.02, "width": 0.96, "height": 0.96},
        "mobile": {"x": 0.00, "y": 0.05, "width": 1.00, "height": 0.90}
      },
      "slots": {
        "probabilityRows": [
          {"x": 0.68, "y": 0.33, "width": 0.24, "height": 0.055},
          {"x": 0.68, "y": 0.49, "width": 0.24, "height": 0.055},
          {"x": 0.68, "y": 0.65, "width": 0.24, "height": 0.055}
        ]
      },
      "provenance": {
        "promptFile": "prompts/ch01-finish-line-v1.txt",
        "referenceImages": ["user-supplied-statml-handwriting-set"],
        "generator": "imagegen",
        "sha256": "fill-after-asset-freeze"
      }
    }
  }
}
```

Schema rules:

- `chapter` is one-based and must be 1–12; `assetId` is the stable key used by the scene registry.
- `textFree` is mandatory and must be manually verified. `false` is a build failure for a generated plate.
- `intrinsic`, `focal`, and normalized `crop` values are mandatory. No runtime code may guess a crop from the current viewport.
- `fallback` is an optional same-composition SVG/PNG fallback. It must be text-free and stylistically quiet; it is not a screenshot or a digital restyling.
- `slots` names reserved areas that live overlays may fill. Slots are normalized to 0–1 source coordinates and are verified against the actual plate.
- `provenance` records the prompt, references, generator, and content hash. Do not commit opaque generated assets without provenance.
- Add `srcset`/`variants` only when the asset has a genuinely hand-authored mobile crop or optimized WebP/AVIF derivative. Never use a derivative with a different composition under the same key.

### Preload/fallback behavior

`loadManifest()` must validate the schema and resolve URLs relative to the renderer module, not `location.href`.

`AssetRegistry` should:

1. synchronously expose a deterministic fallback scene skeleton so the stage never shows a blank or broken-image icon;
2. preload Chapter 1's plate and the active chapter's plate; after the first paint, preload the next and previous chapter plates with low priority;
3. call `img.decode()` before swapping a plate into the visible layer, with a timeout and an `onerror` fallback;
4. use `createImageBitmap` only when supported and when it measurably improves decode/composite cost;
5. keep a small LRU cache (active + neighbors, at least three plates) and evict decoded bitmaps when memory pressure or `deviceMemory` suggests it;
6. preserve the same normalized slot coordinates for the fallback, and report one non-fatal diagnostic to `window.__statmlDeepLearningRenderer` if a generated asset fails;
7. never reflow the stage when an image resolves. The plate is `position:absolute; inset:0` inside an already sized art layer.

Do not use a remote image URL at runtime. The final build must work offline from the checked-in asset folder.

## 6. Responsive artboard and cropping

### 6.1 Normalized scene coordinates

Use a documented 1000×666 logical artboard for v2 (approximately the generated 3:2 plate). Every live object is specified as normalized coordinates or as a lane-relative layout result. Do not translate the old 720×540 positions mechanically.

The scene host keeps the existing stage dimensions. The plate uses aspect-preserving `contain` semantics by default, with a per-asset crop only when the manifest explicitly declares it. The live SVG uses the same transform matrix as the displayed plate, so an overlay slot cannot drift when the stage changes size.

### 6.2 Layout modes

Define three layout classes rather than a single “mobile scale” boolean:

- **wide:** `>= 1100 CSS px` visual width; two or three lanes, comfortable annotation gaps;
- **column:** `560–1099 CSS px`; fewer columns, larger reserved label lanes;
- **phone:** `<560 CSS px` or a measured available stage height below the scene minimum; vertical stack or a mobile crop.

Each scene's `measure(viewport, state, assetMeta)` returns named boxes:

```js
{
  art: {x, y, width, height},
  lanes: [{id, x, y, width, height, purpose}],
  objects: [{id, bounds, anchor, minFont, z, hitId?}],
  safe: {x: 24, y: 20, right: width - 24, bottom: height - 20}
}
```

The layout function must verify every object against `safe`, `assetMeta.slots`, and all other high-priority objects. A collision is a failed render in debug mode, not something to cover with paper-colored CSS.

### 6.3 Mobile rule

At phone width, the plate is allowed to crop to one focal object and one live result lane, but it must not crop away the concept. If an entire 3:2 plate cannot support the chapter at 390px, provide a mobile art variant with the same visual sentence. Do not compress five labels into 8px type and do not stretch a desktop image into a tall, blurry strip.

The stage remains in normal flow at the existing v2 mobile breakpoint unless an explicit baseline comparison proves otherwise. The renderer does not set `position: sticky`, `top`, or scroll behavior.

## 7. Layering, z-order, and interaction ownership

Every scene uses the following global z-order (back to front):

1. `paper-ground` (CSS background or opaque plate);
2. `plate` (generated raster art);
3. `plate-accent` (optional cached texture Canvas, clipped to its declared plate bounds);
4. `live-static` (axes, fixed lines, code-owned blank slots, non-state labels);
5. `live-state` (current data values, selected colors, state-dependent fills);
6. `live-motion` (only a semantic transition or marker, never background jitter);
7. `focus` (keyboard/focus ring or debug bounds);
8. `hit-targets` (transparent SVG/DOM targets, pointer-events only where needed).

Generated plates must never sit above live values. No pseudo-element may be used as a mask over layers 3–7.

Hit-target rules:

- Existing HTML controls remain the only source of truth and remain keyboard accessible. The visual overlay mirrors them; it does not silently invent alternate state.
- Decorative plate and non-interactive SVG groups use `pointer-events:none` and `aria-hidden="true"`.
- If a visual target is made clickable, its actual hit region is at least 44×44 CSS px, has a visible focus style, and delegates to the existing control (`button`/`input`) rather than duplicating state.
- Every live target has a stable `data-hit-id`; debug mode can draw its box. There must be no target whose visible mark is hidden behind another layer.
- Event listeners are attached once in `boot()` and disposed in `destroy()`. No global Canvas context hook and no document-wide click interception.

## 8. Per-chapter scene registry and z-order map

The scene registry is one object per chapter. Each entry must declare `asset`, `visualSentence`, `measure`, `drawStatic`, `drawState`, optional `motion`, and `hitTargets`. The table below is the required ownership map.

| # | Registry key and focal visual | Plate/live composition | Required live state and hits | Motion policy |
|---:|---|---|---|---|
| 1 | `finishLine` | Plate: taped cat + blank three-row sheet. Live static: `predict` connector and row labels. Live state: proportional bars, values, winner marker, sum note. | No chapter control. Plate is never interactive; `data-hit-id="prediction-result"` is informational only. | Optional one-shot input→result trace on chapter entry; settle and stop. Reduced motion shows final state. |
| 2 | `dataset` | Plate: stable 3×3 contact sheet. Live state: neutral/shortcut emphasis layer, one circle/leader, short callout. | Existing `.control-panel .toggle-button` is authoritative; `biased` only. Tile geometry must remain identical across toggle. | 220–300ms crossfade/marker reveal on toggle, no re-randomization and no loop. |
| 3 | `split` | Plate: one dataset scrap and three separated sheets. Live state: 70/15/15 bands/labels, jobs, one green seal. | No hidden dependency on Chapter 2 `biased`; no new control. Informational partition groups only. | Optional one-shot dots-to-roles trace on entry, then stop. |
| 4 | `tensor` | Three asset variants. Live state: image channels/dimensions; text one expanded token/ID/vector; audio window/wave/spectrogram samples. | Existing `.tensor-control button[aria-pressed="true"]` (`image|text|audio`) is authoritative. Three buttons remain keyboard-operable. | Crossfade/short structural transition on mode change; no continuous waveform drift. |
| 5 | `neuron` | Plate: quiet neuron/paper marks. Live state: three weights/lines, products, bias, Σ→ReLU→output, values. | Existing four `.sliders input[type=range]` values: ear, fur, background, bias. Overlay reacts only to those values. | No loop. Animate only a 120–180ms line/value interpolation after input, with reduced-motion snap. |
| 6 | `featureDepth` | Plate: four separated feature scraps/ladders. Live state: one selected layer and live class result; no overlapping translucent sheets. | No chapter control. Informational layer groups only. | Settled still image; optional one-shot left→right reveal on entry. No moving wash, no perpetual RAF. |
| 7 | `learningLoop` | Plate: four corner notes and one loop. Live state: step/loss/rate badge and marker. | Existing `.control-stack .primary-button` increments `learnStep`; `.control-stack .range-row input` is `learningRate`. Hit IDs map to those controls if a visual action is exposed. | Marker moves only after button click, one bounded tour, then stops. Rate changes update next vector, not an infinite animation. |
| 8 | `trainingCurve` | Plate: quiet graph paper. Live state owns exact curves, checkpoint, epoch, regime bands, legend. | Existing `.epoch-control input[type=range]`, min 1/max 24. Epoch readout remains live. | 180–300ms trace to selected epoch on input; no animated background. Static delayed captures identical. |
| 9 | `architecture` with `cnn`, `rnn`, `transformer` | Three separate plates with same outer safe bounds. Live SVG overlays branch-specific labels/links and selection. | Existing `.architecture-tabs button[aria-pressed]` (`cnn|rnn|transformer`). No final token beyond safe bounds; attention links have reserved lanes. | Branch crossfade only; CNN scan/filter cue may run once on selection, then stop. |
| 10 | `transferLearning` | Plate: frozen library → trainable head. Live state: feature names, class chips, hand-off arrow, fine-tune note. | No chapter control. Informational group IDs only. | Settled plate; optional one-shot hand-off arrow. No hatch wash or animation loop. |
| 11 | `thresholdJudgement` | Plate: blank matrix + threshold scrap. Live state owns counts, cell tint, threshold knob, metrics and trade-off annotations. | Existing `.threshold-control input[type=range]`, min .1/max .9/step .05. | Metrics and knob interpolate on input; no loop. Reduced motion snaps. |
| 12 | `releasePipeline` | Plate: taped release bundle and route spine. Live state: manifest values, four nodes, one request token. | Existing release checklist is informational and must remain complete; no invented controls. | One request token travels validate→prepare→predict→decode on entry/activation, then stops. |

### Chapter-specific z-order notes

- **Chapter 1:** live bar fills go *inside* the three blank bars already present in `ch01-finish-line-v1.png`; labels go above/left in reserved blank paper, winner ring above bar but below label.
- **Chapter 2:** the shortcut circle/leader is above the plate but below the explanatory callout; it must point to one stable tile, not a full-bleed border.
- **Chapter 3:** the green test seal is above the test sheet; the partition percentages are in a dedicated adjacent lane if the 15% sheet is too narrow.
- **Chapter 4:** the selected token/window highlight is above the representation plate; waveform samples and tensor values are above highlight but never in the spectrogram grid.
- **Chapter 5:** input wires sit below labels and above the neuron plate; Σ/ReLU/output values sit above cards; slider response must not paint over controls in the narrative.
- **Chapter 6:** four paper scraps are separate; selected layer highlight is above its scrap only; class result is in a separate final lane.
- **Chapter 7:** loop route is below node labels; moving marker is above route but below the current-loss note; step badge has a reserved corner box.
- **Chapter 8:** regime bands are below curves; curves are below checkpoint/epoch labels; legend is outside the plot bounds.
- **Chapter 9:** plate is lowest; architecture-specific links and state nodes are above; selected token/filter ring is above links; labels are in dedicated lanes and never used as link waypoints.
- **Chapter 10:** feature doodles remain clipped inside the frozen card; live hand-off arrow runs in the gap; trainable head and values are above both.
- **Chapter 11:** matrix grid is below cell values/tints; threshold/metrics occupy a distinct right or lower lane; trade-off arrows do not cross cells.
- **Chapter 12:** manifest plate is below live key/value rows; route spine is below nodes; request token is above spine but below node text; operations note occupies the reserved footer lane.

## 9. Exact state and control bridge

Keep the current DOM extraction contract, but make it an explicit adapter with tests. The following values and selectors must not change:

| State key | Default/current source | Chapter | Required v2 behavior |
|---|---|---:|---|
| `active` | active `.chapter-dots button.is-active`, fallback 0 | 1–12 | registry index 0–11; never infer from art pixels |
| `biased` | `.control-panel .toggle-button[aria-pressed] === "true"` | 2 | swap emphasis/variant only; stable plate positions |
| `tensorMode` | `.tensor-control button[aria-pressed="true"]` text | 4 | resolve `ch04.image/text/audio` |
| `earWeight` | slider index 0, default 1.2, range −2..2, step .1 | 5 | recompute ear signal and output |
| `furWeight` | slider index 1, default .6, range −2..2, step .1 | 5 | recompute fur signal and output |
| `backgroundWeight` | slider index 2, default .2, range −2..2, step .1 | 5 | recompute background signal and output |
| `neuronBias` | slider index 3, default −.2, range −1..1, step .1 | 5 | recompute sum/ReLU/output |
| `learnStep` | tracked primary-button count, initial 3 | 7 | increment only on that button; no scene-wide time counter |
| `learningRate` | `.control-stack .range-row input`, default .5, .1..1, step .1 | 7 | change prospective update vector; button commits step |
| `epoch` | `.epoch-control input`, default 12, 1..24 | 8 | exact current curve endpoint and regime marker |
| `architecture` | `.architecture-tabs button[aria-pressed]` span | 9 | resolve `cnn`, `rnn`, or `transformer` plate |
| `threshold` | `.threshold-control input`, default .5, .1.. .9, step .05 | 11 | recompute matrix/metrics truthfully |

The shell's current ARIA correction to `Twelve chapters of the deep learning journey` must remain. The HTML currently uses a guarded `My` seam; v2 must not change the authored shell/copy/controls to bypass it.

## 10. Renderer API and function-level integration plan

Implement the following module-local pieces in `modules/deep-learning-hybrid-renderer.js` (or replace the existing renderer file atomically once the v2 branch is verified). The function names are an integration contract, not a demand to use a specific framework.

### Asset and scene infrastructure

```js
loadManifest(url) -> Promise<Manifest>
createAssetRegistry(manifest, {baseUrl, cacheLimit}) -> AssetRegistry
assetRegistry.preload(assetId, priority) -> Promise<DecodedAsset>
assetRegistry.resolve(assetId, viewportClass) -> AssetRecord
createSceneRegistry({assetRegistry, reducedMotion}) -> Map<number, SceneDefinition>
```

`SceneDefinition`:

```js
{
  key,
  asset: string | ((state) => string),
  visualSentence,
  measure({width, height, viewportClass, state, assetMeta}),
  drawStatic({svg, canvas, layout, assetMeta, seed}),
  drawState({svg, canvas, layout, state, assetMeta, seed}),
  motion: null | {duration, play({from, to, progress}), settle()},
  hitTargets({layout, state})
}
```

### Compositor and lifecycle

```js
createSceneHost(wrap)                 // plate <img>, optional texture canvas, SVG overlay
setViewport(host, rect, devicePixelRatio)
renderScene(host, scene, {state, forceStatic = false})
invalidate(host, reason)              // coalesced microtask; never frame-loop by default
startMotion(host, motion)             // creates one RAF only while motion is active
stopMotion(host)                      // cancels RAF and clears animation state
assertSceneBounds(layout, {debug})    // throws/reports on collision or safe-bound failure
destroyRenderer()                     // disconnect observers/listeners, release bitmaps
```

`renderScene` should compute a `staticKey` from chapter, asset version, viewport class, and all state values that affect static geometry. It may reuse a cached static SVG group/Canvas bitmap when the key is unchanged. State values that affect only live marks must not force asset decode or regenerate the plate.

### Existing bridge refactor

- Keep `normalizeShellLabel`, `getActive`, and the state adapter logic from `modules/deep-learning-renderer.js:1733-1768`, but expose them as `readShellState()` and test the selector/range contract.
- Replace `ensureCanvases()` with `ensureSceneHost()`. It may retain the existing `.canvas-wrap` node and stage sizing. Do not create a second hidden painter.
- Replace `resizeAndDraw()` with `resizeHost()` + `renderScene()`. DPR scaling applies only to the optional texture Canvas; SVG uses CSS pixels/viewBox.
- Replace the `drawScene` if-chain at `1707-1720` with `sceneRegistry.get(active)`.
- Keep the `MutationObserver` for state/active classes and `ResizeObserver` for the host, but coalesce changes. Observe only the root and host attributes required by the existing shell.
- Keep `document.fonts.ready` as a one-time invalidation for live labels; it must not restart motion or mutate static plate pixels.
- Keep the public diagnostic surface as `window.__statmlDeepLearningRenderer`, with `{version, getState, render, debugBounds, preload, destroy}`. `render()` is a one-shot render; it must not start a perpetual RAF.
- Remove the renderer's document-level capturing click listener. If learning-step tracking is still needed, bind to the exact `.control-stack .primary-button` once and use an abortable listener.
- Do not add a second scroll owner. The renderer must never call `scrollIntoView`, `scrollTo`, or set sticky geometry.

## 11. Static, motion, and no-idle-RAF policy

The user specifically reports vibration and noise. A frame that changes without a semantic state change is a defect.

### Static layer

- Seed all imperfections by `(assetVersion, chapter, objectId, viewportClass)` and generate them once per static key.
- Do not use elapsed time, an incrementing ink counter, `Math.random()`, animated filters, CSS hatching, or moving masks in static scenes.
- Capture the static SVG/Canvas layer once. A second delayed screenshot at 500–1500ms must be pixel-identical except for browser text rasterization that is outside the scene layer.

### Motion layer

- A scene may create a single `requestAnimationFrame` loop only while a declared `motion` is active, the scene is visible, and `prefers-reduced-motion` is false.
- Stop and remove the loop on completion, chapter change, hidden tab (`visibilitychange`), reduced-motion change, or renderer destruction.
- Never animate plate position, scale, paper grain, filters, hatches, labels, or borders. Animate only a learner-observable event: a sample handoff, one marker route, a curve trace to the selected epoch, metric interpolation, or an explicit state transition.
- Static chapters 1, 2, 3, 6, and 10 should not create an RAF after their optional one-shot entry cue settles. Chapters 5, 8, and 11 can use short input transitions; Chapter 7 and 12 can use bounded event motion.
- `prefers-reduced-motion: reduce` must skip interpolation, set the final state synchronously, and leave all labels/values visible.

`window.__statmlDeepLearningRenderer.debugBounds()` should report `{active, staticKey, motionActive, rafActive, assetId, collisions}`. Acceptance requires `rafActive === false` for a settled static scene and after any motion completes.

## 12. Performance, retina, and offline behavior

- The plate `<img>` is displayed at CSS pixels with `object-fit:contain`/manifest crop; do not redraw it every frame.
- Optional Canvas textures use `width = round(cssWidth × min(devicePixelRatio, 2))`, `height` equivalent, then `ctx.setTransform(ratio,0,0,ratio,0,0)`. Reuse the bitmap; do not grow a canvas on every resize.
- SVG paths use CSS pixels/viewBox and should not duplicate high-DPR geometry.
- Decode only active + adjacent plates eagerly. Do not preload all twelve 2 MB PNGs on first paint. Add optimized WebP/AVIF derivatives only after visual equivalence is verified; keep PNG fallback.
- Avoid CSS `filter`, `backdrop-filter`, huge box shadows, blend-mode stacks, and full-screen texture canvases. Materiality comes from the bounded plate.
- Maintain a per-host `AbortController`; abort stale image fetch/decode and release `ImageBitmap.close()` on eviction.
- Use `content-visibility` only if it does not change baseline scroll geometry; never apply it to the active visual/narrative in a way that changes chapter heights.
- The final route must work with the network disabled after local assets are loaded. Missing plate fallback must still show a clean, live code composition rather than a blank box.

## 13. Accessibility and semantics

- Keep the generated plate `alt=""` and `aria-hidden="true"`. It is visual material, not the lesson's textual explanation.
- Keep the existing `.visual-caption[aria-live="polite"]` and narrative DOM. If the live state changes a value, the existing visible output/label or an `aria-live` status must expose that change without relying on pixels.
- Do not put the only explanation of a state in a generated image. The existing chapter text and controls must remain sufficient when images fail or are hidden.
- Use `role="img"` only for the composite SVG if it has a useful short label; avoid creating many focusable SVG nodes. Decorative groups `aria-hidden="true"`.
- Existing controls retain their accessible names, `aria-pressed`, ranges, outputs, and keyboard behavior. Visual overlay hit targets are not replacements for inputs.
- If visual selection is clickable, expose a real button or proxy with a 44×44 CSS px focus ring and synchronize `aria-current`/`aria-pressed` with the source control.
- Test Windows High Contrast/forced-colors enough to ensure live controls remain visible; decorative raster may disappear without harming comprehension.
- Keep visible labels sentence case except established compact metadata (`TRAIN`, `VALIDATE`, `TEST`, `Q`, `K`, `V`). Do not bake text into image assets.

## 14. Files and migration boundary

### Add

- `assets/deep-learning/hybrid-v2/manifest.json`
- `assets/deep-learning/hybrid-v2/prompts/ch01-finish-line-v1.txt` and one prompt record per generated plate/variant
- generated plates and optimized derivatives under `assets/deep-learning/hybrid-v2/`
- `modules/deep-learning-hybrid-renderer.js` (or an atomic v2 replacement of `modules/deep-learning-renderer.js`)
- `modules/deep-learning-hybrid-renderer.css` for scoped host/layer rules only
- `audit-evidence/deep-learning-redesign/hybrid-v2/` verification reports and captures

### Modify, only after review

- `modules/deep-learning.html:19-26`: load v2 CSS/JS and set `data-deep-learning-renderer="v2"` after static smoke tests. Keep the old guard as rollback until final review.
- Existing `modules/deep-learning-renderer.css`: either leave as v1 rollback CSS while v2 uses a separate stylesheet, or replace atomically after no v1 selector is active. Do not append another patch block.
- Existing `modules/deep-learning-renderer.js`: once v2 is proven, remove the old primitive scene chain rather than keeping two active painters.

### Do not modify

- `modules/handwritten-theme.css`, `modules/handwritten-theme.js`, other module pages, shared build tokens, or the authored React shell/data/control markup, except the narrowly scoped asset/script hooks and the already-approved twelve-chapter ARIA correction.

### Retirement checklist

After v2 owns all scenes and evidence passes, remove or permanently leave inert:

- the bundled `My` Canvas painter and its surgical guard;
- all document/global `createElement`/Canvas interception code and dead adapters;
- `deep-learning-scene-state`, branch CSS masks, paper-colored pseudo-element seams, and the hero Canvas/mask workaround;
- the old `begin`/`drawGrid`/`panel`/`drawCat`/`drawDog` scene chain when no longer referenced;
- duplicate deep-only style blocks (`material-pass`, `material-override`, `shell-ink`, `no-dashed`, `visual-containment`, `desktop-rhythm`) only after a selector audit confirms v2 does not depend on them;
- any second smooth-scroll owner or delayed capturing listener.

Keep the authored shell's navigation and one scroll owner. “Retire” means remove the source, not hide it behind another mask, once rollback evidence is archived.

## 15. Implementation order for Luna Max

1. **Freeze and hash the contract.** Extract `_l`, `ps`, `Di`, control selector/range snapshots, stage/narrative geometry at 1280×720 and 390×844, and current v1 screenshots. Fail before implementation if visible text changes.
2. **Build the host/compositor seam.** Add manifest loader, asset registry, SVG host, normalized transforms, fallback, DPR handling, and debug bounds without changing scene visuals yet.
3. **Integrate the concrete Chapter 1 plate.** Measure the existing `ch01-finish-line-v1.png` slots, place live labels/fills over its blank bars, verify no duplicate shapes, and compare desktop/mobile crops.
4. **Migrate one easy branch as a vertical slice.** Use Chapter 5 or 11 to prove live HTML controls → `readShellState()` → SVG state overlay → bounded one-shot transition. Do not migrate all twelve before the seam is visually proven.
5. **Migrate dense/failed scenes first.** Chapter 6, Chapter 9 (all three branches), Chapter 10, and Chapter 12 need asset-backed composition before cosmetic scenes. Remove their v1 masks as soon as their v2 layers pass.
6. **Migrate Chapters 2–4 and 7–8.** Ensure state variants reuse plate positions and that charts/matrices stay code-truthful.
7. **Retire v1 only after all twelve branches are active.** Confirm one scene host, one visible plate, no legacy Canvas, no global hooks, and no idle RAF.
8. **Run dual review.** Luna Max performs implementation and machine QA; a second Luna Max review pass compares screenshots to the reference images and baseline geometry. Root/orchestrator reviews reports and decides whether an asset or layout is accepted.

## 16. Acceptance tests and evidence gates

### Contract/preservation

- Compare normalized visible text of `_l`, `ps`, and `Di` against commit `99e3aace`; exact match required.
- Assert 12 `.lesson-step` articles, 12 chapter dots, unchanged IDs/order, unchanged control selectors, defaults, min/max/step, and `aria-pressed`/`aria-current` behavior.
- Assert baseline stage/body geometry at `1280×720` and `390×844` remains within the already-approved calibration tolerance. v2 art must not change chapter height.
- `node scripts/build.mjs --validate-only`, `npm test`, `node --check` for renderer, `git diff --check`.

### Asset integrity

- Manifest schema validates; every chapter resolves to an asset ID; every generated asset has `textFree:true`, intrinsic dimensions, crop/focal metadata, provenance, and a content hash.
- Check every plate at 100% for accidental letters/numbers/UI and at 390px for subject/crop loss.
- Offline/missing-asset run produces fallback live scene, no broken image icon, no layout shift, and one diagnostic only.
- Chapter 1 must prove bar/label slot alignment against `ch01-finish-line-v1.png`; no second frame/swatches or old cat drawing may be visible.

### Geometry and layering

- Render 1440×900, 1280×720, 1099, 820, 560, 390×844, and 375×812 where supported.
- For every chapter/state, assert all named objects and labels lie inside safe bounds; assert no pair of high-priority objects intersects unless explicitly whitelisted.
- Assert `scrollWidth === clientWidth`; no label is clipped by stage, caption, plate crop, pseudo-element, or sticky visual.
- Capture debug-bounds screenshots for Chapters 6, 9 Transformer, 10, 11, and 12; collisions array must be empty.
- Ensure desktop/mobile visual centering follows the original stage footprint; no new top shove or expanded Chi-square-style visual.

### Control matrix

- Chapter 2 toggle false→true→false: same tiles, changed confounder emphasis, no random layout shift.
- Chapter 4 image→text→audio→image: correct plate/overlay each time, no old mode pixels, no seam/mask.
- Chapter 5 all four sliders at min/default/max: output changes only according to corresponding value; no clipped labels.
- Chapter 7 click step twice and vary rate min/max: one marker tour per click; settled frame has `rafActive:false`.
- Chapter 8 epoch 1/12/24: curves/endpoints/checkpoint readable, no label crossing plot.
- Chapter 9 CNN/RNN/Transformer tabs: correct plate and controls, all links inside safe bounds, no branch state leakage.
- Chapter 11 threshold .1/.5/.9: matrix and metrics update truthfully; matrix remains focal and readable.
- Chapter 12 route token completes and stops; manifest/operations copy remains readable.

### Motion/stability

- For each static chapter, capture at t=0.5s and t=1.5s and compare scene pixels; exact or documented browser-raster tolerance only.
- For each animated scene, capture before/during/after; movement must be limited to the declared motion group and must settle.
- Under `prefers-reduced-motion: reduce`, no RAF is active and final state is visible immediately.
- On chapter change, asset preload may continue but previous scene motion and observers must stop.
- At hidden-tab and back/forward transitions, no duplicate RAF/listeners appear.

### Accessibility/performance

- Keyboard through every original control; focus rings visible; no generated asset is focusable.
- Accessible DOM still explains every scene with image hidden/failed; live state readouts update.
- Record first paint/decoded plate timing and scene render timing at desktop/mobile. No large synchronous decode on chapter navigation; no long-running idle work.
- Assert only one visible scene host/plate and zero legacy Canvas/RAF/listener hooks once v2 is final.

## 17. Definition of done

The hybrid v2 pass is complete only when the module still has the old authored lesson and scroll story, but every visible visual reads as one coherent person's notebook work: real paper and tape from the generated plates, hand-drawn marks with natural pressure variation, live values and arrows that remain crisp and truthful, and calm intentional motion. A screenshot that merely shows Patrick Hand text inside rounded digital cards is not a pass.

The final handoff must include:

- manifest, prompt provenance, asset hashes, and the Chapter 1 slot measurement;
- all twelve desktop/mobile captures and key state captures;
- preservation, collision, overflow, console, reduced-motion, and static-frame evidence;
- explicit proof that no CSS mask/global Canvas patch/legacy painter is hiding content and no idle RAF remains;
- a concise list of any intentional generated-art fallback or crop choice, reviewed against the supplied reference images and baseline layout.

