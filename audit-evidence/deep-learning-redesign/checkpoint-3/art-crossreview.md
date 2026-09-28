# Deep Learning checkpoint 3 — art-direction cross-review

Date: 2026-08-29  
Review mode: read-only source review; no browser or screenshot retry.  
Scope: Chapters 9–12 and final legacy/mask retirement, against
[`art-direction.md`](../art-direction.md) §§09–12.

## Decision

**Overall: FAIL for release — Ch9 has definite semantic/annotation blockers,
and the compact Ch12 footer lane is not safely separated at short stages.**

Ch10 and Ch11 are source-level passes. The renderer is now code-first,
deterministic, and state-owned, but the Transformer still paints a connector
through its `selected query` label. The RNN compact layout also places its
prediction/footer in the same vertical band at the common 1280×720 canvas
height. Ch12's compact operations pill is not given a measured exclusion lane
from the final route/footer, producing a collision at 375px and a risky
near-collision in the short desktop canvas.

## Verdict matrix

| Area | Verdict | Exact source finding |
| --- | --- | --- |
| Ch9 — CNN | **PASS** | The compact branch is a single image → stencil → filter bank → map path; the desktop branch has the same three objects and no legacy branch is painted (`modules/deep-learning-renderer.js:1277–1312`). |
| Ch9 — RNN | **FAIL** | Compact `predict BALL` and the footer share the vertical band at short/375px stages; the compact `same update rule` annotation also has no reserved title lane (`:1314–1344`). |
| Ch9 — Transformer | **FAIL** | The middle attention link is drawn vertically through the `selected query` label, and the compact QKV descriptor is only six baseline units below the scene title (`:1346–1386`, `:1389–1397`). |
| Ch10 — transfer learning | **PASS** | Frozen backbone → one transfer arrow → trainable head is a restrained, bounded path in both branches (`:1400–1452`). |
| Ch11 — threshold judgement | **PASS** | Matrix, threshold rail, metrics, and trade-off lane are separated; threshold recomputes the nine-example matrix and metrics (`:1454–1572`). |
| Ch12 — deployment spine | **FAIL** | At short compact heights the operations pill occupies the final-node/footer band; at a 375px phone it intersects the `DECODE` subtitle, and its footer clearance is not measured (`:1588–1664`). |
| Legacy retirement / dead overlays | **PASS active-page source level** | The `v1` flag is set before the bundle; `My` returns before hooks/canvas creation; the local renderer creates the sole canvas. Historical adapters/styles are `text/plain`; active renderer CSS disables the old canvas pseudo-cover and hero masks. |

## Ch9 — architecture choice

### CNN: PASS

The visual sentence is legible as one relationship: a single input grid with
one highlighted 3×3 stencil, a small three-filter bank, and one resulting
feature map. The compact branch recomposes vertically and the desktop branch
reads left-to-right. The stencil is coral (selected operation), the output map
is green, and the footer explains train/test reuse. The objects are all live
code and the branch is cleared before each architecture state; no generated
asset is warranted.

### RNN: FAIL

The branch is conceptually sparse—three hidden states and a next-word score
list—but its compact geometry does not reserve the footer and prediction
badge. At the 1280×720 shell, the visual canvas is approximately 653×420, so
the compact branch is selected by `height < 456` (`:1389–1392`). It then uses
`scoreY = 260`, a 126px score card, and a `predict BALL` chip at y=397–421,
while the footer baseline is y=401 (`:1321`, `:1340–1343`). The footer text
therefore paints over the prediction chip. At a 375px phone canvas (roughly
351×472px), the same chip is y=437–461 and the footer baseline is about 453,
which is an explicit mobile overlap.

There is a second compact reading-order problem: `same update rule` is drawn
at y=42 while the architecture title is drawn at y=49 (`:1322` and `:1394`).
At 390px those centered and left-aligned text envelopes compete in the same
top lane. Move the stamp below the title or allocate a dedicated title/subtitle
row, then derive the prediction/footer positions from the actual stage height.

The desktop noncompact branch is otherwise orderly at the 1440×900 canvas.

### Transformer: FAIL

The chosen token, five-token sequence, dedicated Q/K/V row, and three separate
attention lanes are good ingredients. The critical overlap is deterministic:
the middle link (`target = 3`, `index = 1`) sets `sourceLane = source` and draws
a vertical line from `tokenY + 31` to its lane (`:1366–1380`). The
`selected query` label is centered on that same source x and is drawn just
before the links at baseline `tokenY + 42`/`+45` (`:1365`). The link therefore
passes directly through the selected-query text at both compact and desktop
sizes. This violates the no-connector-over-label and one-focal-reading-path
rules.

The compact branch also writes `dedicated query · key · value row` at baseline
55 (`:1363`) while the scene title is at baseline 49 (`:1394`), leaving no
measured title/descriptor lane on a 390px canvas. Move the descriptor into the
QKV row or lower the row/raise the title before release. Do not add another
attention arc; the current three links are sufficient.

## Ch10 — transfer learning: PASS

The scene now presents the intended three zones: a bounded frozen backbone
with six feature chips, one blue `reuse general features` arrow, and a bounded
coral trainable head with the three classes. The fine-tune note is separate and
amber rather than a background wash. Compact geometry is vertical and desktop
geometry is horizontal; at the 390×844 and 1280×720 source dimensions all
panels, chips, and footer remain inside their authored bands. No controls are
exposed here, so there is no false interactivity. Code-only is correct.

## Ch11 — honest judgement: PASS

The confusion matrix is the focal object, with explicit `predicted →` and
rotated `actual →` orientation, green diagonal cells, coral off-diagonals, and
visible counts. The compact branch reserves matrix, legend, threshold rail,
metrics, and trade-off rows (`:1518–1547`); the desktop branch separates the
matrix from the right-side rail (`:1548–1571`). `thresholdMatrix()` recomputes
predictions, counts, accuracy, recall, and precision from the authored nine
examples for each threshold (`:1454–1481`), so the control response is
truthful rather than a fixed matrix with moving decoration. No unexplained
colored block or generated image remains in this scene.

## Ch12 — deployment spine: FAIL

The manifest and numbered route are materially clearer than the legacy scene,
and the route itself is one spine with the intended four stages. The compact
branch still needs a lower-lane contract. Its operations pill is placed at
`height - 52` with height 26, while the footer is written at `height - 19`
(`modules/deep-learning-renderer.js:1630–1663`). There is only 7px from the
pill bottom to the footer baseline, before accounting for the footer glyph
height. At the short 1280×720 canvas (about 420px), the route uses
`routeTop = 236`, `routeStep = 46`; `DECODE` is centered at y=374 with its
subtitle at y=388, while the operations pill occupies y=368–394. At the
supported 375px mobile width, the normal-height compact route places `DECODE`
at y=412 with its subtitle at y=426 and the operations pill at roughly
y=420–447, directly through that subtitle's band.

Required repair: reserve an explicit operations/footer gutter and derive the
route step or operations y-position from it. Keep the manifest and one-spine
semantics; do not reintroduce a large panel or a second route. At minimum,
prove the 390px mobile and 1280×720 short-canvas states after the repair.

## Legacy retirement and active overlays: PASS, with scope noted

The active-page ownership boundary is sound in source:

- `document.documentElement.dataset.deepLearningRenderer = "v1"` is set
  before the deferred bundle (`modules/deep-learning.html:19`).
- The bundled `My` component checks that flag and returns before `useRef`,
  `useEffect`, legacy canvas JSX, or its old RAF setup (the single minified
  seam is documented in `checkpoint-3/verification.md`).
- The module-local renderer creates `.deep-learning-renderer-canvas`, owns
  all twelve dispatches (`deep-learning-renderer.js:1666–1678`), and contains
  no idle `requestAnimationFrame`.
- The old adapter and broad material/mask styles are inside
  `type="text/plain"` blocks, so their `document.createElement` patch,
  chapter-specific cover seams, and old canvas painting are not executable.
- Under the active `v1` selector, the renderer CSS disables the old
  `.canvas-wrap::before/::after` cover layer and the base hero `::before/::after`
  masks (`deep-learning-renderer.css:35–38, 86–92`). The remaining active
  pseudo-elements are intentional module chrome (paper inset shadow, progress
  dots, hero orbit marker, and the single signal marker), not dead scene masks.

This PASS is specifically about active ownership and visibility. The inert
historical source remains in the HTML for compatibility/reference and is not a
Chapter 9–12 art blocker.

## Release blockers only

1. Ch9 Transformer: move the middle attention link or the `selected query`
   label so they cannot overlap; give the compact QKV descriptor its own lane.
2. Ch9 RNN: derive compact prediction/footer positions from canvas height and
   move `same update rule` out of the title lane.
3. Ch12: reserve a measured compact operations/footer gutter and keep it clear
   of the final `DECODE` subtitle at short/mobile heights.

Static source checks remain the existing checkpoint-3 passes; this review does
not claim browser pixels or loaded-font measurements.
