# Deep Learning renderer audit

**Audit mode:** read-only; no application source files were changed.  
**Audited page:** `/Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/deep-learning.html`  
**Comparison point:** baseline commit `99e3aaceb229d6028b24ec94159462829b965f79`  
**Browser checks:** local page at `1280 × 720` and `390 × 844`; console warnings/errors were empty on the audited load.

## Executive assessment

The current Deep Learning problem is architectural, not a missing CSS offset.  The page still paints the original fixed-coordinate, one-line React/Canvas renderer, then layers a page-wide Canvas monkey-patch, a second branch-specific Canvas filter, several CSS masks, and a handwritten theme over it.  The interventions hide symptoms in a few screenshots but cannot make the underlying scene geometry responsive or semantically ordered.  They are why the result feels simultaneously noisy, translucent, clipped, and hard to interpret.

The safest maintainable direction is a Deep-Learning-only renderer extraction/re-authoring.  Preserve the existing chapter content, state, controls, and navigation contract, but move the scene painter into an editable module-local source with a scene registry and responsive layout functions.  Do not continue patching the minified bundle at line 2402.  Do not use a generated bitmap for data-dependent diagrams; ImageGen is appropriate only for bounded subject/texture art when all labels, values, arrows, and stateful geometry remain live code.

Highest-priority defects:

1. On mobile the sticky visual stage physically covers the first part of the active article.  At `390 × 844`, after the existing “Begin the journey” anchor settles, the stage is `top=54…526.63` while chapter 1 is `top=74.06…1573.01`.  This is intentional overlap in layout, not pointer-event leakage.
2. Chapter 6 (“Depth builds features”) overdraws four large translucent, sheared sheets and labels in one small canvas.  Its moving white wash is cosmetic and was suppressed by an exact-coordinate filter; the scene still has no focus order.
3. Chapter 9’s Transformer branch places the last token/card beyond the 720-wide logical viewport (`x=648…714`), and CNN/transfer branches are “fixed” with paper-colored edge masks that hide authored pixels.
4. Chapter 10’s transfer-learning branch adds a broad animated/hatch-like lavender field that dominates the bounded diagram; Chapter 12 similarly puts card, arrow, pipeline, and labels in competing layers.
5. Every scene is repainted by `requestAnimationFrame`, including scenes that have no meaningful animation.  Rough paths, filters, and state-dependent overdraw therefore run continuously.

## Source topology and preservation boundary

### What is editable today

- The complete page is in `modules/deep-learning.html` (2,510 lines in the current worktree; 1,727 lines at the baseline commit).
- The React runtime and application are bundled inline.  The complete bundle is one very long script line at line 2402, with no source map and no separate Deep Learning renderer source.  Useful character anchors inside that line are: `_l` chapter data near bundle character 192,825; `be` rounded-paper helper near 214,575; `My` Canvas component near 215,180; `Ss` shell component near 239,046.
- `scripts/build.mjs` lines 10–11 only copy `index.html` and `modules`; no Deep Learning source or bundle is compiled.  A module-local source therefore needs an explicit build/load decision (a checked-in browser module is the least ambiguous option; a source-plus-generated bundle is acceptable if the build step is explicit and reproducible).
- `modules/assets/deep-learning/subjects-v1.png` and `cat-editorial-v1.png` exist, but the page does not reference them.  The subject sheet contains useful dog/cat/rabbit/context material; it is a possible bounded image reference for dataset/subject art, not a replacement for live educational marks.
- No other editable file containing the Deep Learning chapter data, scene branches, or renderer was found outside the page.  `index.html` only supplies the module card/path and icon.

### Current changes against baseline

The current diff is approximately `+786/-3` lines in `modules/deep-learning.html`:

- Lines 22–23 load shared `handwritten-theme.css/js`.
- Lines 1663–1975 append six large page-local style blocks (`material-pass`, `material-override`, `shell-ink`, `no-dashed`, `visual-containment`, and `desktop-rhythm`).  They use broad `body:is(.hw-handwritten,.statml-standardized)` selectors and many `!important` declarations.
- Lines 1979–2191 install a first `document.createElement` Canvas hook.  `patchCanvas` returns the context immediately at line 2024, so the large adapter after that return is dead code.  The comment says the factory is restored, but it is reassigned again immediately afterward.
- Lines 2196–2321 install a second `document.createElement` Canvas hook.  It suppresses exact fill calls, checks active chapter by querying DOM on each fill/text operation, retraces or hatches selected fills, and enlarges small mobile Canvas fonts.
- Lines 2322–2400 add a second hero Canvas and a `ResizeObserver`; this is why the page has two canvases even though the chapter painter is the other one.
- Line 2402 contains the original bundle plus a local rough Proxy prepended to `My`.  The branch geometry is substantially the baseline geometry; the current renderer adds rough path interception and resets `inkCounter` every frame.  The original animation loop and fixed coordinates remain.
- Lines 2469–2508 add the scene-class synchronizer and a second capturing smooth-scroll after React’s own chapter-dot scroll.

The shared theme is outside the safe Deep Learning edit boundary.  `modules/handwritten-theme.js` lines 9–20 adds `body.hw-handwritten`, lines 43–76 inject a global SVG filter, and lines 195–235 run a MutationObserver that decorates matching surfaces.  `modules/handwritten-theme.css` lines 149–154 force the handwritten font on every descendant, and lines 319–352 globally style Canvas/visual surfaces.  Do not change these shared files to solve Deep Learning-only geometry.

## Runtime map

### Shell and state

`Ss` (inside line 2402) owns these state values and passes them into `My`:

| State | Default | Control/meaning |
|---|---:|---|
| active chapter | `0` | IntersectionObserver over `.lesson-step`; 12 chapters |
| biased | `false` | Chapter 2 dataset lens toggle |
| tensor mode | `image` | Chapter 4 image/text/audio tabs |
| ear/fur/background weights | `1.2 / .6 / .2` | Chapter 5 feature sliders |
| neuron bias | `-.2` | Chapter 5 bias slider |
| learning step | `3` | Chapter 7 button increments it |
| learning rate | `.5` | Chapter 7 slider |
| epoch | `12` | Chapter 8 slider, 1–24 |
| architecture | `cnn` | Chapter 9 CNN/RNN/Transformer tabs |
| decision threshold | `.5` | Chapter 11 slider, .1–.9 |

`_l.length` is 12 and the chapter-dot map is 12 entries, but the story shell’s ARIA label says “Thirteen chapters.”  This mismatch should be resolved deliberately during extraction, not silently changed with the visual rebuild.  The page’s post-mount `S0` function also rewrites the brand/footer links to `../index.html`; preserve that navigation behavior unless a separate product decision changes it.

The active observer uses `rootMargin: "-30% 0px -42% 0px"` and thresholds `.08/.25/.5`.  The chapter jump handler calls `scrollIntoView({behavior:"smooth", block:"center"})`.  The post-bundle listener at lines 2494–2506 then calls a second `scrollTo` after 760 ms.  These two scroll owners fight each other and are especially visible when a dot is clicked near the top bar.

### Twelve chapter branches

All rows below are branches inside `My`; all are painted into one `720 × 540` logical Canvas.  The state values in parentheses are the live inputs.

| # | Lesson/branch | Main authored geometry | Current risk | Motion |
|---:|---|---|---|---|
| 1 | Define the finish line | Cat/input card at roughly `(68,102,306,322)`, arrow, output probability bars at `x=484`, score chip and caption | Large empty card plus very small labels at narrow scale; visual and narrative both carry the same example | none semantically; still repainted every frame |
| 2 | Collect reality, not shortcuts | 15 animal/context cards in a `5 × 3` grid; biased mode adds a large dashed red outline and “grass → dog?” chip | Cards, context colors, border, and chip compete for one reading order; the shortcut annotation is not spatially tied to one example | no meaningful animation |
| 3 | Split before you tune | Colored dot cloud feeds three stacked train/validate/test rectangles; biased mode adds a leakage Bézier and label | Dot cloud is visually disconnected; leakage path is an overlay; large blank/right-heavy cards; narrative also repeats `70/15/15` | no meaningful animation |
| 4 | Turn examples into tensors | Image: 8×8 pixels → feature maps. Text: raw sentence, five token cards/IDs/vector boxes. Audio: waveform + spectrogram/window | Text row ends near the right edge (`x≈668`); at mobile, all three levels shrink instead of becoming a staged vertical flow. Text seam pseudo-element at lines 1913–1929 draws over the canvas. Audio labels compete with spectrogram | image static; text/audio branch redrawn continuously |
| 5 | Inside one neuron | Three weighted input signals converge at Σ/ReLU/output; four sliders drive line widths/output | Most coherent branch, but fixed labels/lines become tiny and overlap at narrow widths; controls are far below the canvas rather than visually co-located | none semantically |
| 6 | Depth builds features | Four sheared feature sheets at x≈68/200/332/464, each with internal paths, labels around y≈420, dog node at x≈666 | Highest overdraw/noise: translucent sheets and repeated strokes obscure labels; moving white `fillRect` wash `(y=105,w=40,h=330)` has no teaching meaning and required a filter | moving wash in baseline; current wrapper suppresses exact call |
| 7 | How learning happens | Circular FORWARD → LOSS → BACKPROP → UPDATE loop centered near `(355,282)`; moving marker and loss chip | Cycle is understandable, but old detached “step N” pill is suppressed by DOM-aware Canvas filter; no reserved legend/annotation lane | marker/loss depends on time and learn state |
| 8 | Learn patterns, not the answer sheet | Training/validation chart with underfit/useful/overfit regions, checkpoint line, epoch marker/chips | Curves, region labels, checkpoint annotation and chip share narrow lanes; still fixed-size and tiny on mobile | epoch marker and curve redraw |
| 9 | Choose an architecture | CNN: 7×7 image/filter bank/map stack. RNN: state circles and next-word card. Transformer: nine tokens, K/query/value labels and attention curves | CNN stack is near right edge and paper-masked by `.deep-scene-cnn`; Transformer last token extends to `x≈714`, beyond safe logical width, and attention curves/labels collide; all branches should not share one dense layout | CNN selection rectangle moves; RNN mostly static; Transformer attention static |
| 10 | Start from a pretrained model | Lavender library `(60,142,360,282)`, six features, arrow, new-head card `(510,188,150,188)` and chips | Broad pale field/hatching dominates and the transfer boundary is weak; right-edge seam hides content; “millions…” wash reads as a panel rather than context | hatching/wash from intervention, not lesson state |
| 11 | Make an honest judgement | 3×3 confusion matrix around x=139+, threshold line/slider at x≈484–654, metrics and callout | Matrix, slider curve, metric labels, colored callout and bottom annotation compete; lower/right annotations have no lane and become detached at mobile scale | threshold state changes metrics/marker |
| 12 | Ship the whole pipeline | Release card `(42,150,286,328)`, arrow to vertical route at x≈432, four stages and moving token | Card, arrow, route labels and translucent background read as overlapping slabs; labels sit too close to the route/right edge | production token moves; static scene still repaints |

## Renderer mechanics and root causes

### Fixed logical canvas with no collision/layout pass

The `My` effect obtains the Canvas context, caps device pixel ratio at 2, then computes:

```text
C  = canvasWidth / 720
rt = canvasHeight / 540
el = min(C, rt)
Ni = (canvasWidth - 720*el) / 2
A0 = (canvasHeight - 540*el) / 2
translate(Ni, A0); scale(el, el)
```

This is a valid coordinate transform, but it only scales the authored desktop diagram.  There is no minimum readable text size, safe-margin constraint, line-wrap engine, occupied-bounds check, or branch-specific responsive layout.  `Jn` shrinks a font until text fits its own maximum width; it does not know about adjacent shapes, curves, cards, or the canvas edge.  Fixed placement therefore becomes crowding rather than reflow.

Concrete bounds that should be treated as failing constraints in a replacement:

- logical safe content should remain inside roughly `x=54…686`; Transformer tokens use `x=48+75*i`, with the final token card reaching about `714`;
- text-tensor cards reach `x≈668`, leaving only a small margin before scale/ink/filter expansion;
- CNN map stack and RNN output reach `x≈670`; the current CSS seams at lines 1885–1907 cover 6–12% of the right side instead of fixing placement;
- sheared Chapter 6 sheets have overlapping projected bounds by design, while labels are placed in a shared y band;
- Chapter 12’s route and labels use the same narrow right lane as the card-to-route arrow.

### Continuous animation and roughness stack

The effect has `requestAnimationFrame(m)` unconditionally unless `prefers-reduced-motion` is active.  It clears, lays out, and redraws the entire scene every frame.  Time is used in at least the dataset dot jitter, audio waveform, feature-hierarchy wash, learning-cycle marker/loss, CNN selection rectangle, and production token.  Even “static” scenes pay the redraw cost.

Current roughness has three conceptual owners:

1. `My` adds a `Proxy` around its own 2D context near the start of the component.  It intercepts rectangle/arc/path/text primitives and maps fonts to Patrick Hand.  `inkCounter` is reset inside each frame, so the path wobble is deterministic within a frame but still multiplied with every primitive and with animated redraw.
2. Lines 1979–2191 install a first global Canvas hook.  Its real `patchCanvas` exits at line 2024; the retained adapter/prototype code is dead but materially increases confusion and preservation risk.
3. Lines 2196–2321 install a second global Canvas hook.  It performs DOM queries during Canvas operations, suppresses exact calls, hatches selected fills, and scales mobile fonts.  Exact-coordinate and exact-color rules are brittle: any legitimate future use of those values is silently lost.

The result is not “one handwritten medium”; it is a baseline painter plus interception, suppression, hatching, CSS masking, and a separate hero painter.  The shared theme’s global MutationObserver and all-descendant font rule add a fourth presentation layer.

### CSS masks hide geometry instead of correcting it

`deep-learning-scene-state` adds `deep-scene-cnn`, `deep-scene-transfer`, and `deep-scene-text` classes based on active controls.  The `visual-containment` block then paints paper-colored pseudo-elements above CNN/transfer edges and diagonal seams over the text branch.  These masks are z-indexed above the live Canvas, so they can delete authored labels/marks and will drift when Canvas layout changes.  They must not be carried into an extracted renderer.

### Layout/scroll collision

Desktop `.visual-stage` is sticky at lines 590–604, while mobile lines 1415–1422 keep it sticky at `top:62px` (later forced to `54px`) and reorder it before the narrative.  The mobile intervention explicitly sets `pointer-events:none` on the stage at lines 1829–1837, but pointer events do not change paint order or reserve space.  The stage still occludes the active article.  Hard-coded chapter `min-height` calibration at lines 1943–1973 preserves prior scroll rhythm but makes a layout that is already tall and sparse harder to refactor.

The single-scroll policy should be restored: one owner, a topbar-aware `scroll-margin-top`, and no delayed second smooth-scroll.  On mobile the safest default is a normal-flow visual block (`position:static`) before the current article, optionally with only a compact header sticky.  If product insists on a sticky full stage, reserve its exact height in flow and test every anchor/control; `pointer-events:none` is not a fix.

## Semantic and visual audit by area

- **Chapters 1–3:** The ideas are valid, but each scene presents too many marks at once.  Keep one focal example plus a small comparison lane.  The 15-card dataset scene should use a real bounded image grid (the existing subjects asset could supply crops) and a single highlighted shortcut card; the split scene should make three lanes and show leakage as one explicit crossed boundary.
- **Chapter 4:** Keep image/text/audio as three genuinely different layouts.  On narrow screens use a vertical sequence (raw input → tensor representation → downstream shape), not a 720-wide strip scaled below legibility.  Keep token IDs and embeddings only if they are needed by the narrative; otherwise show one token expansion.
- **Chapter 5:** Preserve the live weight/bias controls, but give the neuron diagram a two-lane layout with labels above/below lines and reserve a separate output lane.  This branch can remain code-rendered.
- **Chapter 6:** Rebuild first.  Four separated columns/cards or a left-to-right “pixel → edge → texture → part” ladder is clearer than overlapping sheets.  Use one highlighted layer and quiet ghosted predecessors; remove the moving wash entirely.  Keep only one animated cue if it explains composition.
- **Chapter 7:** Keep the cycle, but reserve four quadrants and one annotation lane.  Show step/loss state in the caption or a single anchored badge; do not suppress a painter’s old pill through a Canvas filter.
- **Chapter 8:** Keep the chart but separate plot, checkpoint annotation, and explanatory legend.  Ensure the epoch line cannot cross text and the validation curve remains distinguishable in reduced motion.
- **Chapter 9:** Give CNN, RNN, and Transformer each a small 3-stage composition with identical outer margins.  For Transformer, use 5–6 tokens or wrap into two rows with an explicit query token; no token may exceed the safe bounds.  The architectural tabs are live, so all labels/curves must remain code-rendered.
- **Chapter 10:** Rebuild as two bounded columns: frozen backbone/features → trainable head.  Any texture/hatch should be a low-opacity background inside the library card, never an animated full-panel wash crossing labels.
- **Chapter 11:** Make the confusion matrix the focal object and put threshold/precision/recall in a separate right (desktop) or below (mobile) lane.  Remove detached colored blocks/callouts unless they encode a metric or are directly anchored to a cell.
- **Chapter 12:** Use a two-column release bundle → runtime route with one moving token.  Keep card contents and route labels in reserved rows; remove translucent overlapping slabs and broad background panels.

## Recommended implementation plan for Luna Max

1. **Freeze the contract.** Before touching visuals, snapshot `_l`, `ps`, and `Di` data, all 12 titles/body/how/visual/keys strings, state defaults, control ranges, ARIA labels, chapter-dot mapping, footer/brand navigation, and reduced-motion behavior. Resolve the 12-vs-13 ARIA wording as an explicit decision.
2. **Create a module-local source boundary.** Add an editable `modules/deep-learning-renderer.js` (or a clearly documented source directory plus deterministic generated browser file). Keep the React shell only if it is already a supported runtime dependency; do not hand-edit the one-line bundle. The renderer API should be explicit, for example `renderDeepScene(canvasOrSvg, {chapter, state, width, height, reducedMotion})`.
3. **Use a scene registry.** Define one entry per chapter with `layout(viewport,state)`, `drawStatic(layer,layout,state)`, and optional `drawAnimated(layer,time,layout,state)`. Static geometry must be cacheable; only Chapters 7/8/11/12 (and a deliberate interaction cue elsewhere) should animate. Stop the RAF when the active scene has no animated layer.
4. **Make layout data-driven.** Give every semantic object a measured bounds box, anchor, lane, and priority. Enforce safe margins and minimum text sizes. Desktop can use a compact 2–3 lane composition; mobile should switch to stacked lanes or a taller viewBox, not shrink all 720×540 coordinates. Add a debug-only bounds mode for QA.
5. **Choose the medium per object, not globally.** SVG is preferred for labels, arrows, semantic groups, and responsive viewBox behavior; Canvas remains acceptable for dense numeric texture if it is isolated and cached. If retaining Canvas, render text with explicit wrap/measure helpers and separate static/animated layers. Roughness must be seeded per semantic object and generated once per state/layout, never by patching every primitive or introducing frame-random noise.
6. **Use assets selectively.** For Chapter 2 or Chapter 1 subject imagery, crop the existing `subjects-v1.png`/`cat-editorial-v1.png` or generate a new bounded illustration only if the available asset does not meet the visual brief. Never bake labels, probabilities, metrics, arrows, or control-dependent state into an image. Keep a code overlay and an accessible caption for any bitmap.
7. **Rebuild dense scenes in order:** Chapter 6, Chapter 9 Transformer/CNN, Chapter 10, Chapter 12, then Chapters 2–4/11. After each branch is stable, remove its corresponding CSS seam/filter rather than adding another mask. The end state must have no `document.createElement` monkey-patch, no dead Canvas adapter, no exact-coordinate suppression, no branch CSS clipping, and no global Deep-only font/visual overrides.
8. **Fix mobile flow and navigation.** Make the visual stage normal flow at `≤820px` unless an explicit reserved-space design proves sticky is needed. Remove the delayed capturing scroll listener; set `scroll-margin-top` once and use one scroll owner. Restore a mobile chapter-jump affordance if hiding dots removes the only navigation control.
9. **Keep shared files untouched.** Scope any Deep-specific handwritten treatment under a module root/data attribute. Do not change `handwritten-theme.css/js` or other modules while fixing Deep Learning.
10. **Verify every state.** Render/screenshot chapters 1–12 at 1440/1280 desktop and 390/375 mobile; test every toggle/tab/slider at default, min, and max; compare reduced-motion mode; inspect text/ARIA/control counts; assert `scrollWidth === clientWidth`; capture console errors; and take two delayed screenshots of static scenes to prove pixel stability. Run `node scripts/build.mjs --validate-only` and the project’s existing checks before handoff.

## Acceptance gates

- No scene object or label crosses its declared safe bounds at 375, 390, 1280, or 1440 widths.
- No text is hidden behind a pseudo-element, paper seam, stage border, or sticky visual.
- A static scene’s pixels do not change between delayed frames; animated motion is intentional and stops under reduced motion.
- Every stateful control visibly changes the intended scene only; there are no exact-coordinate/color suppression rules.
- Chapter content and controls remain complete and in the same order; live caption remains synchronized and accessible.
- Mobile chapter anchors place the article heading below the top bar and below any visual block; no double smooth-scroll.
- `handwritten-theme.js` may still provide shared typography/material treatment, but Deep Learning owns its own scene geometry and does not patch global Canvas APIs.

## Evidence files

The current screenshots are in `audit-evidence/deep-learning-final/desktop-1440/chapter-01.jpg` through `chapter-12.jpg` and the corresponding `mobile-390` directory. Particularly diagnostic examples are:

- `desktop-1440/chapter-06.jpg`: translucent feature sheets/overdraw;
- `desktop-1440/chapter-10.jpg`: broad transfer-learning hatch field and weak card boundary;
- `mobile-390/chapter-01.jpg`: sticky visual/caption covering the beginning of the narrative after anchor scroll;
- `mobile-390/chapter-09.jpg`: tiny CNN composition and crowded caption/article transition.

Baseline/current hero comparisons are in `audit-evidence/advanced-crossreview/baseline-deep-learning-desktop.png`, `baseline-deep-learning-mobile.png`, `current-deep-learning-desktop.png`, and `current-deep-learning-mobile.png`. The prior runtime measurements are recorded in `audit-evidence/advanced-crossreview/current-deep-audit.json`, while the live mobile occlusion measurement above was reproduced during this audit.
