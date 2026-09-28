# Deep Learning checkpoint 2 — Chapters 5–8 art-direction review

Date: 2026-08-29  
Review mode: read-only source review; no application source files were edited.  
Scope: Chapters 5–8 in `modules/deep-learning-renderer.js`, compared with
Sections 05–08 of [`art-direction.md`](../art-direction.md).

## Decision

**Overall: FAIL — targeted layout repairs are still required.**

The new branches have the right conceptual ingredients and are materially
cleaner than the legacy painter: Chapter 5 has live weighted inputs and a
ReLU gate, Chapter 6 has a restrained pixels-to-class sequence, Chapter 7 has
a directional loop tied to the learning-step button, and Chapter 8 has a
truthful epoch-controlled loss chart. The remaining failures are not requests
for more decoration. They are measurable responsive collisions and one
state-dependent annotation collision that would violate the art brief at
ordinary target sizes.

Browser automation was intentionally not retried. This is therefore a
source-evidence verdict; it does not claim screenshot proof. Static checks
remain clean: `node --check modules/deep-learning-renderer.js`, `git diff
--check`, and `node scripts/build.mjs --validate-only` pass.

## Blocker summary

| Chapter | Verdict | Blocking source finding |
| --- | --- | --- |
| 05 — Inside one neuron | **FAIL** | The ReLU-to-output connector reverses/degenerates in the current horizontal formulas at common 1280px desktop content width and at 375px mobile content width. |
| 06 — Depth builds features | **FAIL** | The width-only tight/compact branch can clamp the final class upward into the `parts` sheet in a short narrow desktop canvas; its final arrow can run backwards through the focal card. |
| 07 — How learning happens | **FAIL** | The moving `step` label is not collision-aware and enters the `BACKPROP` node after ordinary button-driven progress values. |
| 08 — Learn patterns, not the answer sheet | **FAIL** | At a 375px compact canvas the validation legend has no exclusion lane from the best-validation chip; the horizontal `loss` label also shares the y-axis tick envelope. |

No image-generation asset is justified for these chapters. All marks are
data-driven, responsive, or control-driven and must remain code/live.

## Chapter 5 — Inside one neuron

**Verdict: FAIL.**

### What is working

`sceneFive()` (`deep-learning-renderer.js:751–831`) has the intended visual
sentence at a conceptual level:

- three named feature rows (`ear shape`, `fur texture`, `background`);
- live `x × w = product` labels in a dedicated lane above each connector;
- connector thickness derived from `|w|`, with coral/dashed negative weights;
- a bias attached to the `Σ` node;
- distinct `z`, `ReLU(z)`, clipped-negative cue, and output value/bar;
- footer legend explaining line weight and negative dashed lines.

The four authored sliders are read into products, `z`, `relu`, connector
thickness, and output bar/value (`deep-learning-renderer.js:756–796`). This is
truthful and code-first. There is no unexplained decorative object that needs
an asset.

### Blocking responsive geometry

The layout uses `compact = mobile || width < 560` (`deep-learning-renderer.js:753–755`),
but the horizontal activation path is not derived from available width.

In the compact branch, the ReLU-to-output arrow is drawn from

```text
start = width × .39 + 92 + 8
end   = width − 18 − 76 − 8
```

so its available span is approximately `0.61 × width − 202`.

- At a 375px viewport the canvas is approximately 333px wide after the
  story-shell padding. The arrow span is about 1px; its 7px arrowhead can
  touch/cover the output panel rather than reading as a connector.
- At a 390px viewport the canvas is approximately 366px wide and the span is
  about 21px, which is just usable but leaves little safety margin.
- At a narrower valid phone/embedded width around 318px the end is actually
  before the start, so the arrow points backward.

The noncompact branch has the inverse problem at common desktop widths. Its
arrow span is approximately `0.43 × width − 303`. A 1280px shell produces a
visual canvas around 651px wide after the visual-stage margins; the source
then computes a start around `x=552` and an end around `x=529`, so the arrow
reverses into the output region. At an approximately 717px canvas the span is
only about 5px. This is a blocking reading-order failure at the requested
1280px desktop state, not a theoretical extreme.

### Required repair

Use one measured layout contract for the activation path:

- derive the output panel first, then place the gate and `z` card with a
  minimum connector span; or
- select a vertical/stacked activation path whenever the horizontal fit is
  below a documented minimum (including 375px and the 1280px shell); or
- use a true responsive breakpoint based on both canvas width and height,
  not `width < 560` alone.

After repair, prove slider states at negative, zero, default, and positive
weights. The output must change without any label or product crossing a line.

## Chapter 6 — Depth builds features

**Verdict: FAIL.**

### What is working

`sceneSix()` (`deep-learning-renderer.js:879–924`) is conceptually aligned
with the brief. It gives each sheet one label (`pixels`, `edges`, `textures`,
`parts`), progressively changes the marks, uses one direction of travel, and
connects `parts` to a live `DOG · class` chip. The desktop branch gives the
sheets a measured row; the compact branch avoids shrinking four desktop cards
into an unreadable strip. The drawing is deterministic and has no wash,
looping RAF, or unexplained overlay.

### Blocking responsive geometry

The compact branch is selected by `compact = mobile || width < 560`
(`deep-learning-renderer.js:881–883`) even when the canvas is not guaranteed
to be 456px tall. Its fixed vertical route is:

- cards at `y = 62, 140, 218, 296`, each 58px tall;
- final arrow starts at `y = 361`;
- final class position is `min(height - 60, 375)`.

For a narrow desktop column around 450–500px wide with the existing short
canvas height around 385px, `classY` clamps to 325 and the final arrow ends at
317. It therefore runs upward from 361, through the fourth `parts` sheet
(`y=296..354`), and the class chip is placed inside that same sheet's vertical
band. The class transition becomes an overlap rather than a readable
`parts → class` relationship.

Even in the normal compact phone height, the inter-sheet arrow line is only
`step - cardHeight - 14 = 6px` long before the arrowhead. That is not a hard
overflow by itself, but it is too small to carry the main reading direction
reliably at 375px.

### Required repair

Make the compact selection depend on both width and available height, or
compute a vertical rhythm from the actual height. The final class chip must
remain below the `parts` sheet with a positive, readable connector span. Give
each inter-sheet arrow at least a small measured lane (or use a clear inline
connector mark) and verify the 375px phone plus the 450–500px short-column
case. Keep the current quiet blue dot cloud and live code; no asset is needed.

## Chapter 7 — How learning happens

**Verdict: FAIL.**

### What is working

`sceneSeven()` (`deep-learning-renderer.js:989–1035`) now has a coherent
forward → loss → backprop → update route:

- four arrows run around the outside of the node areas;
- the center card contains only current loss, batch, and rate;
- the update vector length is tied to the learning-rate slider;
- `syncLearningTrace()` changes loss and marker progress only when the
  tracked learning-step value changes (`deep-learning-renderer.js:933–957`);
- the click capture increments that value only for the authored
  `Run one learning step` button (`deep-learning-renderer.js:1249–1254`);
- the replacement renderer has no idle `requestAnimationFrame` loop.

This satisfies the truthful-control and settled-motion requirements in the
brief. The route direction and four node subtitles are source-level sound.

### Blocking state-dependent overlap

The marker label is always placed at `marker[0] + 10, marker[1] - 9`
(`deep-learning-renderer.js:1031–1033`) without checking which route segment
or node is nearest. At compact 390px geometry (`routeRight ≈ 232`, right
bottom node panel `x≈240..344`, `y≈276..332`), the normal initial progress
`.26` advances to approximately `.48` after two button clicks. At `.48`, the
marker is near `(232, 292)` and the `step N` label begins near `(242, 283)`—
inside the `BACKPROP` panel's horizontal and vertical bounds. The same issue
appears in the desktop geometry near the lower-right node.

This is a reproducible control-state collision, and it makes the button-driven
state change visually noisy exactly where the lesson asks the learner to watch
the loop.

### Required repair

Put the step number in a fixed center/corner badge, or route the marker label
to the empty side of the loop based on the active segment and clamp it outside
all node rectangles. Preserve the moving marker and its button-only behavior;
do not add a second animation or extra arrows.

## Chapter 8 — Learn patterns, not the answer sheet

**Verdict: FAIL.**

### What is working

`sceneEight()` (`deep-learning-renderer.js:1041–1110`) has a truthful chart
model:

- deterministic training and validation curves;
- validation turns upward after the computed best point (epoch 10);
- epoch input reveals the curves through the selected epoch;
- best-validation line/dot appears once the selected epoch reaches it;
- underfit/useful-fit/overfit zones are below the x-axis;
- the current epoch has a tick and label;
- no idle animation or ghost continuation lines are drawn.

The chart is restrained and the slider state is meaningful. Its main failure
is exclusion geometry around the labels.

### Blocking mobile legend/callout collision

At an approximately 375px viewport, the compact canvas is about 333px wide.
The source then computes:

- `plotLeft = 43`, `plotRight = 315`;
- validation legend text starts at `plotLeft + 101 = 144`;
- best-validation chip starts at `plotRight - 130 = 185` and spans to 315.

There is no measured exclusion lane between the validation label and the chip.
The expected 10px utility word `validation` extends into that chip start by
several pixels. At 390px the extra width hides the issue, but the 375px state
is not safe by construction.

### Blocking y-axis label collision

The vertical-axis title is drawn as unrotated horizontal text at
`plotLeft - 31` (`deep-learning-renderer.js:1071`), while the y-axis tick
labels are right-aligned at `plotLeft - 9` (`1064–1068`). At the middle tick,
both occupy the same vertical baseline and their horizontal envelopes overlap
for normal `loss`/`0.7`-style utility text widths. This makes the chart's left
margin read as a text tangle instead of an axis.

### Required repair

Give the legend and best-validation chip separate measured rows at compact
width, or move the chip into a right-side/under-plot lane after measuring the
actual legend text. Give `loss` a dedicated left gutter (or rotate it
vertically) so it cannot share the tick-label envelope. Preserve the current
curve/zone/control logic and verify epoch 1, 10, 12, and 24 at 390px, 375px,
1280px, and 1440px.

## Cross-cutting conclusion

The Chapters 5–8 visual language is now appropriately code-first: seeded
roughness, restrained palette, and live labels/values are present. The
failure is primarily an incomplete responsive contract:

- Chapters 5 and 6 use a width-only `width < 560` compact/tight switch even
  when the CSS height guard does not reserve the compact canvas height;
- Chapters 7 and 8 contain dynamic annotations whose positions are not
  checked against neighboring node/label bounds;
- static frame and reduced-motion behavior are otherwise source-level sound.

Do not reach for ImageGen to solve these failures. Fix the layout math and
annotation lanes first, then capture source/interaction evidence for the
required states. Generated art would not solve a connector that reverses, a
marker label that enters a node, or a chart legend with no exclusion gutter.
