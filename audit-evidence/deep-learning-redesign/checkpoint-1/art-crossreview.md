# Deep Learning checkpoint 1 — Chapters 1–4 art cross-review

Date: 2026-08-29  
Review mode: read-only; no application source files were edited for this review.  
Reference brief: [`art-direction.md`](../art-direction.md)

## Decision

**Overall: FAIL — do not accept checkpoint 1 as the visual handoff yet.**

The new renderer is a meaningful architectural improvement over the former
Canvas/mask pass: its geometry is module-local, its paths are seeded, the first
four scenes have distinct drawing functions, and the legacy canvas is hidden
when the replacement owns the scene.  Chapters 1 and 3 are close to the brief
at source level.  Chapters 2 and 4 still fail the “one focal idea, immediate
semantics, deliberate mobile composition” bar, and the source has a responsive
breakpoint mismatch that can clip those scenes in a narrow desktop column.

The renderer passes a syntax check (`node --check modules/deep-learning-renderer.js`).
One live DOM inspection before the Chrome preview connection became unavailable
also showed `data-deep-learning-renderer="v1"`, one visible replacement canvas,
one hidden legacy canvas, corrected “Twelve chapters” shell labelling, and no
console warnings/errors on that load.  The preview connection then timed out on
viewport, screenshot, navigation, and fresh-tab operations; therefore this
cross-review has no new visual screenshot proof.  The verdict is intentionally
conservative: source-level geometry and the existing captured evidence are not
a substitute for the required 1440/1280 desktop and 390/375 mobile renders.

## Gate summary

| Gate | Verdict | Finding |
| --- | --- | --- |
| Renderer parses | PASS | `node --check` succeeds; the waveform loop is currently syntactically closed. |
| One visible painter for Chapters 1–4 | PASS (source-level) | `sync()` hides the React canvas when `active <= 3` and shows the local canvas; the old canvas is still created and its effect still runs in the background. |
| One focal idea per scene | PASS for 1 and 3; FAIL for 2 and 4 | See stage decisions below. |
| Safe responsive bounds | FAIL | The renderer chooses its mobile layout from canvas width (`width < 520`), while the mobile canvas height rule is chosen from viewport width (`max-width: 820px`). A narrow desktop column can therefore use mobile coordinates in a shorter desktop-height canvas. Chapter 2’s default mobile copy also runs below the 390px canvas bottom. |
| Restrained handmade medium | PASS with P2 revision | Seeded two-pass paths and rough panels are coherent; the full-canvas grid and regular heatmap/pixel fills add avoidable texture noise. |
| Generated-art decision | PASS — code-only for 1–4 | All marks are stateful or explanatory. Do not generate a complete diagram. Consider a transparent, text-free Chapter 1 animal cutout only after the coded silhouette has had two deliberate iterations and still fails recognition. |
| Browser evidence | FAIL / pending | The replacement was confirmed in the DOM, but visual screenshot and interaction proof could not be captured because the preview connection timed out repeatedly. |

## Stage decisions

### Chapter 1 — Define the finish line: PASS (source-level, pending screenshot proof)

`sceneOne()` (lines 269–309 of
[`deep-learning-renderer.js`](../../../modules/deep-learning-renderer.js)) now
has the intended visual sentence: one input tile, one directional arrow, and a
single probability list.  The cat is quiet relative to the selected blue
`cat` bar; the three values share a common row rhythm; the winner note is tied
to the output group; and the sum is explicit.  At the intended 390px layout
(approximately 366px canvas width and approximately 491px canvas height), the
computed tile, arrow, bars, winner chip, and footer remain inside the canvas.

The scene is therefore a source-level pass for focal hierarchy, semantics, and
mobile re-composition.  It is not a final visual pass until the actual 390px
and desktop screenshots prove that the utility type remains readable after the
font loads.

Required follow-up before final acceptance:

- Capture Chapter 1 at 1440, 1280, 390, and 375, including the loaded font
  state.  Verify that each percentage is visually separated from its bar and
  that the `predict` label never sits on the cat or arrowhead.
- Keep the input tile modest.  If the live screenshot makes the cat dominate
  again, reduce the silhouette before reaching for an asset; the optional
  asset gate is one transparent, text-free cutout only, never a baked output
  diagram.
- Consider reducing or clipping the global `drawGrid()` background (lines
  183–200) behind this focal scene.  A faint notebook rule is acceptable, but
  it must not compete with the three bars at small size.

### Chapter 2 — Collect reality, not shortcuts: FAIL

`sceneTwo()` (lines 333–366) has a good fixed 3×3 contact-sheet skeleton and
keeps tile positions deterministic, but it does not yet make the causal idea
immediate.

Blocking findings:

1. **Default mobile overflow.** At a 390px viewport the new CSS gives the
   canvas roughly 491px of height and the source computes `tile = 82`,
   `gridY = 64`, and the lower explanation start `y = 368`.  The three bullet
   labels occupy baselines near 400, 428, and 456; `writeWrapped()` then starts
   its sentence at `y = 484` and can add another line at 500.  That last line
   is below the canvas bottom.  At 375px the height is about 473px, so the
   clipping is worse.  This is a deterministic geometry failure, not a
   screenshot judgement.
2. **The representative state does not actually show all three advertised
   variations.** The code draws a small dot for the non-biased background and
   changes dog position/size/color, but it does not visibly encode angle or
   lighting.  The labels `angle`, `light`, and `background` consequently read
   like a legend added after the fact.
3. **The shortcut state is not tied to one referent.** Every tile receives the
   same green horizontal line, while the callout says `background → dog?`.
   Nothing identifies that line as grass or circles one stable confounder.  The
   learner must infer the relationship from prose rather than seeing one
   comparison.
4. **The mobile callout is bottom-anchored rather than causally anchored.**
   `y = height - 98` (line 359) leaves the callout separated from the tile that
   is supposed to explain it.  It may fit, but it does not establish a clean
   grid → highlighted background reading path.

Required revision:

- Reserve the mobile layout in measured vertical lanes: contact sheet, one
  highlighted comparison/cue, then a short caption.  Compute the total height
  from the wrapped text; never place the paragraph at a fixed `y` that can
  exceed the canvas.
- Keep the 3×3 tile positions identical between toggle states.  In the
  representative state, show one concrete visual for angle, one for light,
  and one for context, or change the labels to match what is actually drawn.
- In shortcut state, keep the same animals but make one stable background mark
  explicit (for example a small grass stripe) and use one coral ring/leader
  anchored to that mark with `background → dog?`.  Remove any dot, underline,
  or panel that has no referent.
- The callout should sit next to or immediately below the highlighted tile;
  do not rely on bottom anchoring.  Keep the lower text to one short sentence
  in the canvas and leave the nuance to the live caption.
- Re-capture default and biased states at 390/375 and verify there is no clip,
  horizontal overflow, or tile/annotation overlap.

### Chapter 3 — Split before you tune: PASS (source-level, with semantic polish)

`sceneThree()` (lines 399–418) has one clear path: a bounded “one dataset”
cloud, one arrow, and three labelled role cards.  The mobile branch deliberately
places the source and cards side by side instead of shrinking the desktop
drawing.  With the intended 390px canvas dimensions, the source, cards, seal,
and `keep the exam sealed` footer fit within the declared canvas.  The hidden
Chapter 2 bias state is not consulted, so the earlier cross-chapter leakage
coupling is removed from this replacement scene.

Two revisions are still required to make the PASS durable:

- The three cards are the same height even though the percentages are 70/15/15
  (lines 410–416).  Equal cards are acceptable only if the percentages are
  deliberately treated as labels.  Prefer one visibly partitioned bar or
  stacked sheet with proportional color bands, with labels moved into a clean
  adjacent lane when 15% is too small for text.
- The single arrow currently terminates at the upper `TRAIN` card (line 413),
  which can imply that only train receives the dataset.  Aim it at a shared
  partition bracket/entry point or add a small fork that clearly denotes the
  three-way split.  Keep one fork, not three competing arrows.

The colored dot cloud is visually pleasant but currently has no key.  Use one
quiet ink/blue dot treatment, or explicitly label the colors if they represent
classes; do not let four accents imply an unstated semantic dimension.

### Chapter 4 — Turn examples into tensors: FAIL

The branch separation in `sceneFour()` (lines 449–577) is a sound foundation:
the selector fully clears and redraws the scene, the text branch keeps IDs and
embedding values live, and the image/audio branches use code rather than a
bitmap.  However, the four-stage requirement is not yet met consistently.

Blocking findings:

1. **Breakpoint/height mismatch applies here too.** `sceneImageTensor()`,
   `sceneTextTensor()`, and `sceneAudioTensor()` choose mobile coordinates when
   the canvas is narrower than 520px (lines 450, 488, and 548), but the
   replacement CSS only guarantees the 456px+ canvas height under the viewport
   `max-width: 820px`.  A narrow desktop column can therefore choose the
   mobile audio layout and place the spectrogram/time label below the available
   canvas.  The live DOM snapshot observed a replacement canvas around 484×385
   in the default preview window, which is enough to trigger this path; this
   must be resolved even if the acceptance screenshots are wider.
2. **Image state is too abstract.** The 8×8 grid, three channel cards, and
   shape string communicate a tensor only after reading the labels.  Add one
   small visual bridge (for example a highlighted pixel block repeated in the
   channel sheets) so `picture → channels` is visible, without adding another
   card or generated image.
3. **Text arrow clearance is fragile.** In the mobile layout the vertical
   `DOG/ID 3912` arrow (lines 503–505) runs immediately beside the second-row
   `ING` chip.  It must have a measured exclusion gutter; an arrow touching a
   token edge reads as a collision, not a lookup relationship.  Keep the
   selected token and embedding row, but move the second row or route the arrow
   through a dedicated center lane.
4. **Audio is missing the promised sample cue.** `waveform()` (lines 518–527)
   draws a baseline and a smooth deterministic trace, but no sample dots or
   tick marks.  The amber window is useful, yet the spectrogram is a dense,
   regular purple heatmap that can read as a decorative texture.  Add only a
   handful of live sample marks and lower the cell contrast; keep explicit
   frequency/time edges and the window-to-spectrogram arrow.
5. **The full-canvas grid is repeated under every representation.** This is
   acceptable as a very quiet material cue, but the current scene already has
   pixel cells, channel stripes, token cards, embedding values, or heatmap
   cells.  Reduce the grid density/opacity or limit it to the unused margin so
   the representation itself is the focal object.

Required revision:

- Replace the width-only `const mobile = width < 520` checks with a documented
  layout contract that considers both available width and height, or guarantee
  the required height for every canvas that can select the compact layout.  Do
  not let a desktop two-column shell silently enter a mobile composition that
  is taller than its row.
- Use a shared vertical-strip layout for all three states at mobile widths:
  source, one transformation arrow, output representation, one shape/axis note.
  Keep all labels/value text live in code.
- Move the text arrow into a dedicated lane and confirm values are visible at
  390 and 375.
- Add three to five sample dots/ticks to the waveform, not a second waveform or
  a continuously animated trace.  Static and reduced-motion frames must be
  identical.
- Re-capture image, text, and audio selector states and prove that no stale
  labels, separators, masks, or prior-branch marks remain after switching.

## Cross-cutting art-direction review

### What is working

- The source has a recognizable material system: warm paper, dark ink, blue
  structure, green confirmation, coral warning, amber caution, and sparing
  lavender.  The roughness is generated from stable seeds rather than frame
  time, which is much closer to a handmade study notebook than the prior
  random repaint.
- `begin()` clears the scene before each branch, so Chapter 4 does not need a
  paper-colored mask to erase the previous selector state.
- `writeWrapped()` is a useful primitive, and the renderer keeps labels,
  percentages, IDs, and axis notes in live code.  This is the correct reason
  not to use ImageGen for these scenes.
- `deep-learning-renderer.css` scopes its replacement to the Deep-only data
  attribute and hides the old `canvas-wrap` pseudo-layers for the replacement
  scenes.  No image-generated whole screenshot should be introduced to paper
  over remaining geometry.

### What still blocks a clean handoff

- The legacy React canvas remains mounted and its original effect can continue
  its idle animation even while hidden.  This is not currently a visible second
  painter in the inspected DOM, but it is a performance and ownership hazard.
  Stop or isolate the old effect once the remaining chapters have an explicit
  migration boundary; do not solve this with another global Canvas hook.
- The historical inline hook code remains in `deep-learning.html` below the
  early Deep-only guard (lines 1984–2325).  It is currently bypassed by the
  `v1` flag, but the final implementation should remove or clearly isolate the
  dead adapter after the fallback plan is closed.  Keeping an exact-coordinate
  filter in the final renderer would violate the brief.
- The new CSS makes the mobile visual stage normal flow, which is the right
  direction for avoiding article occlusion.  Before final approval, verify the
  active article heading, caption, chapter controls, and all anchor jumps at
  390 and 375; a normal-flow stage still needs intentional vertical rhythm.
- `drawGrid()` is currently a universal decoration.  Treat it as a material
  token with a density/opacity budget, not a required layer in every visual.

## Required evidence for checkpoint 2

The next pass should not be accepted from source inspection alone.  Capture a
review matrix with:

| Scene/state | Desktop | Mobile |
| --- | --- | --- |
| Chapter 1 default | 1440×900 and 1280×720 | 390×844 and 375×844 |
| Chapter 2 default + shortcut | same four sizes | same four sizes |
| Chapter 3 default | same four sizes | same four sizes |
| Chapter 4 image/text/audio | same four sizes | same four sizes |

For each capture, record the canvas CSS size, whether the replacement or legacy
canvas is visible, the active chapter/selector state, and any console errors.
Also run these mechanical checks:

- `node --check modules/deep-learning-renderer.js`
- `node scripts/build.mjs --validate-only`
- `git diff --check`
- `document.documentElement.scrollWidth === document.documentElement.clientWidth`
  at 390 and 375;
- two delayed captures of a static scene to prove geometry/pixels are stable;
- reduced-motion captures for all four states;
- keyboard activation of the Chapter 2 toggle and Chapter 4 selector;
- a post-toggle screenshot proving Chapter 3 does not change when Chapter 2’s
  biased state changes.

No generated asset is required by this checkpoint.  If Chapter 1’s coded
silhouette is still visually weak after two iterations, the only permitted
hybrid experiment is a transparent, text-free subject layer with the bars,
labels, arrow, state, and accessibility contract retained in code.

