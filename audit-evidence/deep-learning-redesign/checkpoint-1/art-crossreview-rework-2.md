# Deep Learning checkpoint 1 — rework-2 art-direction cross-review

Date: 2026-08-29  
Review mode: read-only source review; no application source files were edited.  
Compared against: [`art-direction.md`](../art-direction.md) and the prior
checkpoint review [`art-crossreview.md`](art-crossreview.md).

## Release decision

**Overall: FAIL / hold checkpoint 2.**

Rework-2 addresses the central semantic gaps identified in the prior review:
Chapter 2 now draws actual angle, lighting, and background variation; its
shortcut callout is attached to one repeated grass cue; and Chapter 4 now has
a same-pixel bridge, a text-arrow gutter, waveform sample marks, and a quieter
spectrogram/grid treatment. Those are real improvements and the source is much
closer to the requested one-sentence illustrations.

The handoff is still not releasable on source evidence alone. The compact
Chapter 2 default state has a near-collision between the dataset footer label
and the variation legend, the narrow-height fallback still has an audio arrow
that can reverse or miss its target, and the hero loop's direction is not
explicit enough to guarantee the intended `data → features → prediction →
feedback` reading. The required desktop/mobile screenshots are also still
missing: the browser transport was unavailable for this pass, so this report
does not claim visual proof that the canvas type geometry matches the live CSS
at 1440, 1280, 390, and 375 widths.

## Evidence and checks

Files inspected:

- [`modules/deep-learning-renderer.js`](../../../modules/deep-learning-renderer.js), current checkpoint-1 rework-2 source;
- [`modules/deep-learning-renderer.css`](../../../modules/deep-learning-renderer.css), current containment and hero rules;
- [`modules/deep-learning.html`](../../../modules/deep-learning.html), renderer gate, shell, legacy fallback, and hero markup;
- [`art-direction.md`](../art-direction.md), the stage-by-stage visual brief;
- [`art-crossreview.md`](art-crossreview.md), the prior checkpoint findings.

Static checks available for this review:

- `node --check modules/deep-learning-renderer.js` — PASS;
- `node scripts/build.mjs --validate-only` — PASS (34 pages validated);
- `git diff --check` — PASS.

One bounded browser attempt had already timed out, and the parent requested
that no more browser retries be made. Therefore all judgments below are
source-evidence judgments, with screenshot capture listed as a release gate,
not as completed evidence.

## Gate summary

| Gate | Verdict | Source evidence |
| --- | --- | --- |
| Renderer syntax and build | PASS | The renderer parses and the project validator completes. |
| One visible painter for Chapters 1–4 | PASS, source-level | The `v1` gate is active; `sync()` shows the replacement canvas and hides the legacy canvas for active chapters 1–4. The legacy React painter is still mounted and can continue work behind the hidden canvas. |
| Chapter 1 focal sentence | PASS, pending screenshots | Input tile → one `predict` arrow → three probability bars, with selected largest score and sum note. |
| Chapter 2 causal semantics | IMPROVED, but FAIL for release | Variation marks and the stable grass cue are now real; compact default label lanes remain too tight. |
| Chapter 3 focal sentence | PASS with P2 polish | Dataset and three role cards are clear in source; arrow-to-train implication and unkeyed multicolor dots remain. |
| Chapter 4 image/text/audio | PASS, source-level with P2 edge case | Requested bridge/gutter/sample/contrast repairs are present; narrow fallback audio geometry is not fully safe. |
| Hero composition | FAIL / conditional | Bounded and quieter than the prior crossing-line composition, but the loop direction and three-loop hierarchy are not self-evident; current `v1` path bypasses the old ink overlay. |
| Mobile/desktop visual proof | FAIL / pending | No current rework-2 screenshots were available in this pass. |
| Image-generation decision for Chapters 1–4 | PASS — stay code-only | These scenes are responsive, labeled, and interactive. No generated asset is justified by the current source evidence. |

## Stage review

### Chapter 1 — Define the finish line

**Verdict: PASS at source level; screenshot gate remains.**

`sceneOne()` (`deep-learning-renderer.js:277–317`) now contains one modest
input tile, a single blue arrow labelled `predict`, a compact three-row
probability list, a selected `cat` row, a `largest score → cat` note, and the
explicit sum. This matches the visual sentence in the art brief and removes
the prior unexplained square/secondary slab problem. The mobile formulas use
the measured canvas width rather than simply shrinking a desktop drawing.

The code-only decision remains correct. The cat is a state-independent coded
silhouette, and the bars, percentages, selection, and arrow must stay live.
Do not generate a whole diagram. If the live screenshot still makes the cat
look awkward after two deliberate silhouette passes, the only permissible
hybrid is one transparent, text-free animal cutout.

Required release evidence:

- capture 1440px and 1280px desktop states plus 390px and 375px mobile states;
- verify the `predict` label, cat silhouette, bar labels, and percentages have
  separate ink space after the handwritten font loads;
- verify the quiet global grid does not compete with the output distribution.

### Chapter 2 — Collect reality, not shortcuts

**Verdict: FAIL for release, with the causal repair itself PASS.**

The rework-2 source correctly responds to the prior semantic failure:

- `drawDatasetTile()` (`deep-learning-renderer.js:319–347`) uses a deterministic
  `variation = index % 3`; the animal is rotated with three fixed angles;
  variation 1 receives a visible soft light mark; and variation 2 receives a
  visible ground/background line;
- positions remain fixed between `biased=false` and `biased=true`, so the
  toggle changes evidence rather than re-randomising the comparison;
- in the biased state, the same green horizontal grass cue is repeated across
  the tiles, the bottom-right cue is circled in coral, and a coral leader runs
  from that mark to the `background → dog?` callout (`sceneTwo()`,
  `deep-learning-renderer.js:382–407`). This is now a concrete causal
  referent, not prose pasted beside an arbitrary panel;
- the mobile callout is placed directly below the contact sheet rather than
  being independently bottom-anchored.

The remaining blocker is the default compact composition. At the intended
390px viewport, the source's compact branch is approximately 366px wide and
491px tall. With `tile = 82` and `gridY = 64`, the group frame ends near
`y = 338`; `same class` is written at baseline `y = 336`, and `what should
vary?` begins at baseline `y = 348` at nearly the same left reading edge. The
first label is therefore pressed against the frame boundary and the second
label has only a small typographic gap. It is not a mathematically clipped
paragraph anymore, but it remains exactly the kind of noisy near-collision
that the brief rejects.

Required revision before PASS:

1. Reserve a named label lane below the frame. Move `same class` into the
   frame header or give it at least 8–12px of measured separation from the
   `what should vary?` heading; do not rely on the current coincidental
   baselines.
2. Measure the complete compact legend and footer together. The footer at
   `height - 24` is now contained, but it must not crowd the last `background`
   row on shorter valid phone heights.
3. Keep the current tile geometry, cue circle, and leader unless a screenshot
   demonstrates that the line crosses a tile or callout. The semantics are now
   sound; do not add a second legend, more arrows, or decorative texture.
4. Re-capture both toggle states at 390px and 375px. Confirm the same tile
   positions, visible angle/light/background marks, one stable grass cue, and
   no legend/frame/footnote overlap.

**Asset decision: code-only.** The repeated dog, rotation, light mark, and
grass cue are stateful teaching evidence. A generated animal would make the
contact sheet less coherent and less truthful.

### Chapter 3 — Split before you tune

**Verdict: PASS at source level, with two P2 polish items.**

`sceneThree()` (`deep-learning-renderer.js:442–461`) has one bounded dataset
cloud, one arrow, three consistently sized role cards, percentage labels, and
a green seal on `TEST`. It no longer reads the Chapter 2 toggle, so there is
no hidden cross-chapter bias/leakage state. The compact branch deliberately
uses a side-by-side source/cards composition instead of shrinking the
desktop strip until it becomes unreadable.

Two details still weaken the visual sentence but do not block the current
checkpoint if the screenshot confirms the source-to-role relationship:

- the arrow terminates at the upper `TRAIN` card, which may imply that only
  training receives the dataset. Aim the next polish pass at a shared
  partition bracket or one fork entry point;
- the 18-dot cloud cycles blue, lavender, amber, and coral without a key. Use
  one quiet ink/blue treatment unless color is intentionally labelled. Four
  accents currently risk implying four classes or four hidden data roles.

Keep this scene code-only. The partition, percentages, seal, and any later
leakage demonstration must remain live and measurable.

### Chapter 4 — Turn examples into tensors

**Verdict: PASS for the requested rework at source level; P2 responsive edge
case and screenshot proof remain.**

The rework-2 changes now line up with the art brief:

#### Image branch

`sceneImageTensor()` and `channelStack()` (`deep-learning-renderer.js:463–533`)
draw a highlighted cell at a fixed row/column in the source grid, place a
matching coral marker at the same relative location in each R/G/B sheet, and
label the desktop connector `same pixel`. The shape note has its own lane
under the output stack, and the compact branch uses a clean vertical
`picture → channels → 224 × 224 × 3` strip. This is the needed semantic bridge;
no extra card or generated image is required.

#### Text branch

`sceneTextTensor()` (`deep-learning-renderer.js:552–585`) keeps the selected
`DOG / 3912` token live and gives the second token row a measured 44px center
gutter. The lookup arrow now occupies that gutter, leaving approximately
22px on either side of the `SLEEP` and `ING` cards at a 390px layout. This
directly addresses the prior arrow/token collision. The embedding values are
still drawn as live positive/negative values in the selected row.

#### Audio branch

`waveform()` (`deep-learning-renderer.js:587–602`) adds four deterministic
amber sample dots and ticks. `spectrogram()` (`604–620`) reduces the regular
heatmap opacity to approximately `.06–.30` and retains explicit frequency and
time labels. The compact branch now reads vertically as waveform → short
window → spectrogram; the desktop branch remains horizontal.

One small layering polish remains: the amber window fill is drawn after the
waveform sample marks (`sceneAudioTensor()`, `622–645`), so a sample that falls
inside the window can be partially covered. Either redraw the selected sample
marks above the window or intentionally mark one selected sample inside the
window. Do not add more dots.

#### Remaining responsive edge case

The height-aware contract is present (`COMPACT_MIN_HEIGHT = 456` and
`isCompactLayout(width, height)` at `deep-learning-renderer.js:31–35`), and the
mobile CSS reserves `min-height: 456px` (`deep-learning-renderer.css:48–70`).
That fixes the original “mobile coordinates in a 385px canvas” failure for
the normal phone viewport.

It does not make every narrow desktop fallback safe. If `width < 520` but
`height < 456`, the source intentionally takes the desktop branch. In a
roughly 450px-wide column, the audio desktop arrow starts around `x = 264`
but its target, `width * .58`, is around `x = 261`, while the spectrogram begins
around `x = 274.5`. The arrow can point slightly backwards or stop short of
the output. Compute the audio output/arrow positions from the actual wave and
spectrogram bounds, or choose a compact horizontal-safe branch when the
available width cannot fit the desktop strip.

Required release evidence:

- image, text, and audio at 1440px/1280px desktop and 390px/375px mobile;
- selector transitions in both directions with no stale branch labels or
  marks;
- screenshot confirmation that the image marker actually aligns across all
  channel sheets, the text arrow has a visible gutter, and audio axes/sample
  marks remain readable;
- one narrow two-column smoke case around 450–500px wide, or a documented
  layout contract proving that such a canvas cannot occur in the shell.

**Asset decision: code-only.** These are labeled, data-shaped, responsive
representations. Generated art would make the transformation less truthful
and would break the selector's live state.

## Hero re-review

**Verdict: FAIL / conditional pending one small semantic redesign.**

The rework-2 CSS (`deep-learning-renderer.css:79–268`) materially improves the
hero boundary compared with the prior crossing-line state:

- the broad pseudo-element backgrounds are disabled;
- the outer blue orbit and inner coral orbit are bounded, low contrast, and
  no longer bleed into the page as a gray disc;
- the signal area is a bounded ellipse with a central dot;
- the four labels are cardinally separated into `data` (left), `features`
  (top), `prediction` (right), and `feedback` (bottom), each in a restrained
  paper label;
- the scroll cue is a simple bottom/right text-plus-line treatment with no
  clip-path or background slab;
- the mobile rules keep the loop in the upper-right and avoid the old
  full-width diagonal spine.

The remaining issue is semantic specificity, not decoration. There are three
nested loop/ring cues (outer orbit, inner orbit, signal ellipse) but only one
small arrowhead (`orbit-one::after`, lines 114–125). From source alone, it is
not guaranteed which ring the arrow belongs to or how the learner should
traverse the four labels. The cardinal label placement can support the desired
clockwise sequence, but the arrowhead is not an explicit enough start/end
cue, especially when the central ellipse is read as a competing loop. This
violates the brief's requirement for one dominant reading path.

Choose one of these minimal repairs:

1. keep one loop only and place a single clear arrowhead on that loop, with
   labels aligned to its direction;
2. retain the nested rings as material accents but make only the outer ring
   directional and add a tiny `data → ...` start cue; or
3. make the four labels a clearly ordered clockwise path with a single
   highlighted segment that advances from `data` to `features`, then
   `prediction`, then `feedback`.

Do not restore the old label-to-label connector spine or add crossing lines.
The CSS hero is intentionally static under `v1`; the old `mountHeroInk()` path
inside the early-returned legacy IIFE (`deep-learning.html:1984–1986` and
`2366–2403`) is not a current visible painter. If a rough handmade line is
desired, add one bounded deterministic treatment to the chosen loop rather
than reviving a second full-hero canvas.

The hero remains code/CSS-only. Image generation is not appropriate for a
directional, responsive, labeled learning loop.

## Cross-cutting findings

### What now meets the brief

- The renderer's palette and seeded rough paths are coherent with the supplied
  warm-paper/ink/blue/green/coral/amber references.
- `drawGrid()` is quieter (`rgba(...,.045)` and 36px spacing), so it no longer
  competes as strongly with the scene marks.
- The replacement painter clears the scene before every branch, and Chapter 4
  no longer needs a paper mask to erase stale branch content.
- The canvas labels, IDs, percentages, tensor shapes, and controls stay live
  in code. No generated asset is needed for Chapters 1–4.
- The mobile CSS now removes sticky-stage behavior and reserves a bounded
  vertical canvas/caption lane under 820px, which is a good containment choice
  for the current story shell.

### Still needing explicit acceptance

- The hidden legacy canvas is still created and its React effect can still
  animate in the background. This is not visible under the current `sync()`
  ownership rule, but it should be removed or fully suspended after Chapters
  5–12 have a clean fallback plan.
- The authored `.story-shell` still contains the literal “Thirteen chapters”
  ARIA label in the bundled markup; the replacement normalizes it at runtime
  to “Twelve chapters.” Keep the runtime guard for now, but repair the source
  string in the later cleanup so accessibility does not depend on mutation
  timing.
- No current screenshot proves that the handwritten font, CSS stage height,
  chapter header, caption, and canvas all settle together. Source geometry is
  necessary but not sufficient for this visual handoff.

## Checkpoint-2 entry criteria

Checkpoint 2 should remain blocked until all of the following are true:

1. Chapter 2 default compact label lane is separated by measurement, and both
   toggle states are screenshot-verified at 390px and 375px.
2. Chapter 4 audio geometry is safe in the narrow desktop fallback, and all
   image/text/audio states are screenshot-verified at desktop and mobile.
3. The hero has one unmistakable directional loop with no redundant competing
   path, and desktop/mobile hero screenshots show no title, label, orbit, or
   scroll-cue collision.
4. Chapters 1–4 screenshots are taken after fonts settle, with reduced-motion
   enabled once to confirm a stable static frame.
5. The next cross-review records exact screenshot paths and a selector/state
   matrix; source-only PASS is not enough for visual acceptance.

Until then, the correct status is **FAIL / targeted revision required**, not a
generated-asset experiment. The current failures are layout-contract and
reading-order issues that should be fixed in code first.
