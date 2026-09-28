# Deep Learning visual redesign brief

Status: read-only audit and art direction for the next implementation pass

Scope: the twelve Deep Learning chapters in `modules/deep-learning.html`. This brief is deliberately limited to information design, visual composition, interaction meaning, asset direction, and review criteria. It does not authorize changes to other modules.

## Executive direction

The Deep Learning module needs a visual rebuild, not another cosmetic pass. The current renderer has useful educational copy and several good conceptual seeds, but its canvas scenes are being treated as a collection of primitives and post-hoc masks rather than as twelve authored illustrations. The next implementation should make each scene answer one question immediately, with one focal object, one reading direction, and only the annotations needed to explain the idea.

The module should feel like a careful study notebook made by one person: warm paper, dark ink, a restrained blue/indigo structure color, green for a healthy/held-out/selected state, coral for error or risk, and amber for a caution or trade-off. Hand-drawn irregularity should be visible at the edge of a line or a marker swash, never in the geometry or readability of the lesson.

The core rule for every chapter is:

> One visual sentence, one focal idea, three supporting relationships at most.

The written chapter already carries the nuance. The canvas should not repeat the whole paragraph in tiny type. It should make the relationship in the paragraph visible.

## Evidence inspected

### Source and implementation

- `modules/deep-learning.html` is a roughly 2,500-line single-file module containing a bundled React renderer. The live scene painter is the `My` component inside the bundled script; it draws all twelve scenes into one canvas and switches on the active chapter index.
- The authored chapter data contains twelve entries (`_l`), while the story region is labelled “Thirteen chapters of the deep learning journey.” The visible chapter header says `/ 12`. Resolve that wording mismatch during implementation, but do not invent a thirteenth lesson.
- The current worktree adds a large page-local handwritten material pass and compatibility/containment styles after the original module styles. These include broad selectors, pseudo-element seams, canvas backgrounds, chapter-specific masks, a disabled legacy canvas adapter, and fixed desktop/mobile rhythm heights. Treat those additions as suspect until the rebuilt scene has been verified without them.
- The canvas is marked `aria-hidden`; the meaningful explanations and controls remain in the narrative DOM. Keep that accessibility pattern, but make the canvas and caption visually agree with the live state.

### Screenshots and states

I inspected the current final evidence under:

- `audit-evidence/deep-learning-final/desktop-1440/chapter-01.jpg` through `chapter-12.jpg`
- `audit-evidence/deep-learning-final/mobile-390/chapter-01.jpg` through `chapter-12.jpg`
- `audit-evidence/advanced-crossreview/current-deep-learning-desktop.png`
- `audit-evidence/advanced-crossreview/current-deep-learning-mobile.png`
- `audit-evidence/advanced-crossreview/baseline-deep-learning-desktop.png`
- `audit-evidence/advanced-crossreview/baseline-deep-learning-mobile.png`
- live 1280×720 states for CNN, RNN, Transformer, image/text/audio tensor branches, and the shortcut-dataset toggle

### Aesthetic references

The four supplied PNGs were read as aesthetic references only:

- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_55 PM (4).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_53 PM (1).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_54 PM (2).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_55 PM (3).png`

They establish a material language, not a page-layout instruction:

- warm off-white paper with a faint, quiet rule/grid;
- dark, slightly uneven handwritten headings and labels;
- thin ink outlines, imperfect underlines, marker/highlighter swashes, occasional tape or sticky-note callouts;
- blue as the structural or selected accent, green as a healthy/confirmed state, coral/orange as an error or warning, and purple as a secondary teaching accent;
- diagrams with generous breathing room and an obvious reading order;
- a legible mix of hand lettering for the teaching voice and compact utility typography for values, controls, and metadata;
- small, purposeful imperfections rather than an entire page covered in scribbles.

Do not copy the references' phone chrome, two-column lesson shell, module-card layout, number of sections, navigation model, or density. They are not a layout specification for this module.

## Current structural diagnosis

### Why the last pass did not solve the problem

The last pass mainly changes the surface treatment: fonts, paper colors, rough borders, pseudo-element seams, and global selectors. The underlying scene geometry remains the same. In several cases, the CSS pass adds another layer over a scene that is still being painted by the bundled renderer. The result is a scene that looks masked, ghosted, or clipped rather than redrawn.

Specific technical symptoms to address while implementing the art direction:

1. A single canvas owns all scene geometry, but the surrounding CSS adds chapter-specific `::before`/`::after` masks. A rebuilt scene must have one authoritative drawing layer. Do not use a paper mask to hide an old shape that should have been removed.
2. The page contains a disabled compatibility adapter with a legacy canvas patch retained below `return context`. Delete or isolate obsolete code only after proving the live renderer no longer depends on it; do not keep dead overdraw paths in the final implementation.
3. The current roughness adapter and several scene branches derive visual motion from elapsed time or a changing counter. Static hand-drawn geometry must be seeded and cached. A line that changes every animation frame is not a hand-drawn line; it is noise.
4. Several values are painted in very small canvas text while the narrative controls sit elsewhere. The learner can change a control without a sufficiently obvious visual response. Every control must have one visual target and a visible state change.
5. At 390px, the sticky visual stage is approximately 366px wide and over 320px tall before its header/caption. It can cover the narrative as it follows the scroll. That can be retained as a deliberate sticky model, but its boundaries, scroll margins, and chapter transition must be intentional. Do not accept partially hidden lesson cards as a side effect.
6. The 12 navigation dots wrap into a small cluster at the top-right of the visual stage. The cluster is not inherently wrong, but its current spacing and irregular wrapping read as extra decoration. Keep the navigation behavior, but make its rail clearly a progress control rather than an accidental second diagram.
7. Several desktop scenes use logical coordinates close to 720×540 and then scale down to a narrow canvas. Labels that are tolerable at the source coordinates become hairline text at the real viewport size. Use measured text, safe bounds, and a deliberate mobile composition; do not merely scale a desktop drawing until it is technically contained.

## Shared art direction and geometry rules

### Visual sentence and reading order

Before implementing a scene, write one sentence in the renderer specification. For example: “A held-out test set is sealed after training and validation have finished.” The scene must make that sentence apparent without reading every label.

Use one dominant path:

1. focal object or starting input;
2. one directional connector or transformation;
3. resulting object or decision;
4. one short callout for the implication.

If a diagram needs more than one simultaneous reading path, split it into a controlled before/after or tab state. Do not add another arrow to rescue an ambiguous composition.

### Safe coordinate system

Create a scene-level specification with named zones rather than scattered coordinates. A reasonable logical canvas is 720×540 (or a similarly documented ratio), with:

- 32–48 logical units reserved at the top for the scene kicker/title;
- 24–32 units of side padding;
- a central content band for the main diagram;
- a footer band for one takeaway or tiny legend;
- explicit minimum dimensions for labels, controls, and touch targets.

The exact logical dimensions may change, but the following must be true:

- all content is inside a documented safe rectangle;
- no label sits on top of a connector, node, or data mark;
- no value or annotation is placed only because there happens to be blank space;
- every connector has a clear start and end;
- labels are measured before placement and wrapped or moved when they do not fit;
- the mobile layout is recomposed into fewer columns or a vertical sequence, not just shrunk;
- the caption and stage controls do not overlap the canvas.

### Material hierarchy

Use the following as a restrained semantic palette. Existing project tokens may be reused when they map to the same meaning:

| Material/role | Direction |
| --- | --- |
| paper | warm cream/off-white ground; no competing gradient |
| ink | dark brown-black for primary outlines and explanatory type |
| blue/indigo | structure, selected state, primary path, model output |
| green | validation/test seal, correct/healthy state, useful checkpoint |
| coral/red | error, leakage, false positive/negative, risky shortcut |
| amber | caution, bias, trade-off, secondary signal |
| lavender/purple | optional secondary layer or attention accent, used sparingly |

Line hierarchy should be obvious: primary outline 1.5–2px at rendered desktop size, secondary rules around 1px, inactive grid around 0.5–0.8px at low opacity. Do not make every rectangle a dark outlined card. A scene may have one grouping frame, not nested boxes around every item.

### Typography and annotation grammar

- Handwritten display type is appropriate for the scene title and one or two annotation phrases.
- Compact utility type or a clearly legible handwritten face is better for numbers, axes, controls, and percentages. Do not force the largest decorative handwriting onto every tiny value.
- Use sentence case for teaching labels. Reserve all caps for short metadata such as `TRAIN`, `VALIDATE`, and `TEST`.
- Keep labels beside their referent, not over it. A leader line may terminate in a small dot at the referent.
- Use at most three secondary labels in the canvas unless the diagram itself is a table or sequence.
- Never put sentence-length prose inside a small rounded pill. Use the existing caption or narrative for the explanation.
- A highlight is a teaching pointer, not a background texture. One marker swash behind a key word is enough.
- Every color needs a semantic key in the caption or an immediately legible label. Do not use four accent colors merely to make a scene lively.

### Motion and frame stability

- Cosmetic roughness is deterministic and cached per scene/state.
- A static scene must render the same geometry and pixels after repeated frames.
- Animate only an information-bearing event: a sample moving through a pipeline, a filter scanning a grid, a gradient marker moving around a loop after a learning step, or an attention weight changing after a token selection.
- Default scenes should settle rather than loop forever. If a loop is pedagogically necessary, use a slow, low-contrast loop with a clear pause state.
- `prefers-reduced-motion` must remove decorative motion and leave a complete static explanation.
- Do not animate every connector, node, scribble, or background wash.

### Image-generation gate

Use code-first for data-driven, mathematical, labeled, interactive, or responsive content. Image generation is allowed only for a text-free, transparent illustrative layer that remains subordinate to the coded scene.

Generated assets must never contain:

- text, numbers, mathematical symbols, axes, legends, controls, or labels;
- a complete screenshot or complete interactive diagram;
- fake UI, baked-in hit targets, or baked-in state changes;
- visual information that needs to update when a control changes.

If a coded illustration is still visually weak after two considered iterations, generate only the minimum asset needed, inspect the result at desktop and mobile, and integrate it as a positioned layer while keeping all labels, values, hit testing, and animation live in code. Store assets under a Deep Learning-specific path with descriptive names and optimize them. The default decision for this audit is code-only for chapters 2–12. Chapter 1 may use one optional transparent, text-free cat cutout if a controlled coded silhouette cannot reach the desired handmade quality; the probability bars, labels, percentages, and selection must remain code.

## Stage-by-stage visual brief

The chapter numbers below are the authored twelve chapters, not the renderer's zero-based indices.

### 01 — Define the finish line

**Visual sentence:** One specified input image becomes a probability distribution, and the largest score supplies the predicted class.

**Current audit:** The cat illustration is oversized and visually dominates the scene without reading clearly as an input image. Two white square marks have no explained role. The large tan region behind the output makes the image and result feel like one accidental slab. The arrow is isolated. Output labels and percentages are small, and the bars are not visually strong enough to communicate “distribution.” The scene therefore reads as a cat next to some text rather than an input/output contract.

**Target composition:** Use three clean zones on one baseline:

1. a modest framed input tile containing the animal image;
2. one blue hand-drawn arrow labelled `predict` (or no label if the arrow is self-evident);
3. a compact output list with three horizontal bars, a clearly selected `cat` row, and the sum/uncertainty note beneath it.

Give the input tile a small `input` label above its frame and the output group a single `output probabilities` label. Put the “largest score → cat” note directly below the selected row, not in an unrelated corner. The three bars should have a common baseline and visible relative lengths. The `89%`, `8%`, and `3%` values need enough contrast to survive mobile scaling.

Do not add a decorative lens, empty square, second background card, or extra class icon. The output group is the focal teaching object; the animal is a recognizable but quiet input.

**Interaction/motion:** There is no chapter-specific control, so the default is a settled state. If the existing explanatory values remain fixed, show a one-time low-key input-to-output trace when the chapter becomes active and then stop. Reduced motion shows the complete path immediately.

**Asset decision:** Code-only by default. An optional hybrid fallback is one transparent, text-free, hand-drawn animal cutout if the coded silhouette remains awkward after cleanup. Never generate the probability list or input frame.

**Acceptance checks:** no object crosses the input frame; no output bar touches another label; all three percentages are readable at 390px; no unexplained white square remains; the canvas still communicates “largest probability is a prediction, not proof.”

### 02 — Collect reality, not shortcuts

**Visual sentence:** The same class should remain recognizable while lighting, angle, appearance, and background vary; a shortcut view makes an unrelated background cue visibly suspicious.

**Current audit:** The representative state uses repeated animal silhouettes, but large rounded colored blocks dominate the lower half and are not clearly tied to individual examples. A pause-shaped mark appears with no pedagogical explanation. The lower annotation crosses or sits on top of those blocks. In the shortcut state, the dashed boundary runs to the edge, background panels are clipped, and the viewer cannot immediately tell which feature is the shortcut. The “repair the data” state is not a clean before/after; it is mostly a recolored grid.

**Target composition:** Build a small contact sheet of 9–12 example tiles in a deliberate 3×3 or 4×3 arrangement. Keep the animal silhouette consistent enough to represent class identity while varying tile tint, scale, orientation, and a single background mark. Add one unobtrusive top label, `same class · varied context`. In the shortcut state, use a two-column comparison:

- left: animal evidence varies, background is stable;
- right: the stable background cue is circled or highlighted in coral and the scene says `background → dog?`.

The toggle should switch the evidence emphasis, not replace the grid with unrelated rectangles. If a group frame is needed, draw one frame around the examples and one marker swash around the confounder. Remove the pause symbol, stray bottom blocks, and any shape with no referent.

**Interaction/motion:** The `Reveal the shortcut`/`Repair the data` control should visibly change only the background/evidence relationship. Use a short crossfade or marker highlight; do not re-randomize tile geometry. Keep the same tile positions across states so the learner can compare them.

**Asset decision:** Code-only. Repeated simple silhouettes and background marks are stateful and should stay live. A generated animal asset would make repeated examples look pasted and would not improve the concept.

**Acceptance checks:** every tile has a clear boundary; no tile is hidden under an annotation; the shortcut cue is visible without a dashed line running off-canvas; the toggle has an obvious visual difference; the scene remains legible at 390px without reducing the grid to hairline marks.

### 03 — Split before you tune

**Visual sentence:** One dataset is partitioned into train, validation, and sealed test roles, each with a different job.

**Current audit:** The dot cloud on the left does not visibly become the three roles. The large train/validate/test regions are mostly empty, percentages are separated from their roles, and the `test set` text overlaps the green `15%`. A large rounded region enters from the bottom/right and reads as an accidental crop. The renderer can also inherit the chapter 2 biased state and draw a leakage path without a chapter 3 control, which is a confusing hidden dependency.

**Target composition:** Use one compact partition diagram. A small dataset stack or dot cloud sits on the left, followed by a single arrow into a clearly partitioned bar or three vertically stacked sheets. The three regions must each contain:

- role name (`TRAIN`, `VALIDATE`, `TEST`);
- job (`learn weights`, `choose & stop`, `one final exam`);
- percentage as a secondary value.

Keep the region heights proportional only if labels remain readable. If 15% is too short for a label, keep the proportional color band but place the label in a clean adjacent annotation with a leader line. Add one green lock or sealed-stamp mark to the test region, not a large panel. The leakage idea should be a distinct, explicitly labelled alternate state only if the product intentionally exposes one; chapter 2's toggle must not silently alter this scene.

**Interaction/motion:** No continuous animation. A one-time set of dots can travel from the dataset into the three roles when the chapter enters. In reduced motion, show the final partition. If a leakage demonstration is retained, use one coral dashed arrow crossing a boundary with the label `leakage`, then return to the sealed state.

**Asset decision:** Code-only. Dots, partitions, labels, and boundary semantics must remain live and measurable.

**Acceptance checks:** no percentage shares a baseline with another label; the test seal is unmistakable; the three jobs can be read in order; the graphic does not rely on a clipped bottom-right region; chapter 2 state does not produce unexplained chapter 3 behavior.

### 04 — Turn examples into tensors

**Visual sentence:** Pictures, text, and audio are translated into numerical tensors while preserving the structure that matters: space, order, or time.

**Current audit:** The image branch is clean in outline but too sparse: a single grid and a long empty arrow do not show channels or a transformation. The text branch is the weakest live branch: token cards, vertical separators, the highlighted ID, and the embedding row compete; a white band/mask causes the embedding values to disappear at normal scale. The audio branch is more intelligible, but its waveform, sample marks, window, and spectrogram are all at one small scale and need a stronger reading order.

**Target composition:** Treat the three selector states as three versions of the same translation strip, not three unrelated drawings.

**Image state:**

1. small pixel grid or image tile;
2. one arrow;
3. three offset color-channel sheets or a compact stacked-channel icon;
4. a shape note `height × width × colour` and the example `224 × 224 × 3`.

Keep the channel sheets visually distinct but not so large that they become three unexplained cards.

**Text state:**

1. short raw phrase;
2. token chips with `THE · DOG · IS · SLEEP · ING`;
3. IDs under each chip, with `DOG / ID 3912` selected;
4. one highlighted embedding-table row showing a few visible positive/negative values and a note that real vectors are longer.

Use one downward arrow from `ID 3912` to the selected row. Remove repeated vertical bars, the full-width white overlay, and any duplicate sentence that is already in the caption. The row must have dark enough values to remain visible.

**Audio state:**

1. waveform with a few sample dots;
2. a highlighted short window;
3. a compact frequency-energy grid with explicit `low/high frequency` and `time` edges.

Do not make the grid look like an unexplained heatmap; the window-to-spectrogram relationship is the teaching point.

**Interaction/motion:** The selector changes the complete strip while preserving the stage frame and footer. A short, deterministic transition may move the selected representation along the arrow. No looping waveform or blinking cells.

**Asset decision:** Code-only. Every branch is data-driven, labeled, and interactive; generated artwork would make the representation less truthful.

**Acceptance checks:** each branch has one continuous reading path; text embedding values are visible; no branch relies on a white mask; image channels and audio axes remain legible at 390px; changing the selector does not leave stale labels from the previous branch.

### 05 — Inside one neuron

**Visual sentence:** Weighted inputs and a bias meet at a sum, then an activation passes positive evidence onward and clips negative evidence to zero.

**Current audit:** The three colored inputs and central sigma are a good foundation. However, the connector labels sit close to or on the lines, the output blob is visually detached from the actual intermediate value, and the scene does not make the ReLU operation concrete. The large white halo/shadow around the sum competes with the input lines. Tiny text makes the slider relationship hard to verify.

**Target composition:** Use a left-to-right signal diagram with three aligned input rows. Each row has a color chip, a readable feature name, a compact `x` value, and a line whose thickness represents the absolute weight. Place the numeric `x × w` label in a dedicated gutter above or below the connector, never on top of it. The central node should show `Σ`, with a small equation beneath it: `z = Σ(wᵢxᵢ) + b`. Then show a compact ReLU gate or two-part output:

- `z` intermediate value;
- `ReLU(z)` output, with a tiny negative-to-zero sketch or a clear clipped bar.

Negative weights can remain dashed/coral, but do not make the line style the only explanation. Keep the bias label attached to the sum node. Remove the giant shadow and any horizontal rules that do not separate concepts.

**Interaction/motion:** The four sliders are authored controls. Moving one must update that row's thickness, product label, intermediate `z`, and ReLU output. Do not animate unrelated lines. A zero or negative value must still have a readable state. Reduced motion changes values immediately.

**Asset decision:** Code-only. The equations and slider response must stay live.

**Acceptance checks:** no input line crosses a label; `z` and `ReLU(z)` are distinguishable; line thickness has a legend or caption explanation; the output changes on every slider; all labels fit at mobile width.

### 06 — Depth builds features

**Visual sentence:** The same signal passes through increasingly composed descriptions, from pixels to edges to textures to parts and finally a class decision.

**Current audit:** The tracing-sheet metaphor is appropriate, but the four panels are skewed and overlap so much that the first labels fade behind later sheets. The front `parts` panel dominates. A moving white vertical wash crosses the cards and makes the scene look like it is being erased. The final `DOG` chip is detached from the layer sequence. This is a case where intentional overlap has become accidental obstruction.

**Target composition:** Keep the tracing-sheet metaphor but give each sheet a safe, even overlap. Use four cards at a measured staircase or a clean horizontal row, with visible tabs/labels: `pixels`, `edges`, `textures`, `parts`. Each sheet should contain only a few repeated marks that become more composed from left to right. Put one directional arrow between sheets and a final class chip after `parts`. Draw labels above or on a dedicated lower tab so later sheets never cover them. If the metaphor requires translucency, keep it subtle and preserve the text layer above the sheets.

Remove the moving white wash. If showing progression, animate one small signal dot or a highlighted trace along the arrows once on entry; then settle. The scene should still work when frozen.

**Interaction/motion:** No chapter control. Use a one-time, low-contrast left-to-right reveal only if it clarifies layer order. Static and reduced-motion states show all four sheets.

**Asset decision:** Code-only. The tracing marks are simple and the ordering must respond to the stage state.

**Acceptance checks:** every layer name is fully visible; no card hides another card's content; the final class is connected; the front card does not cover the focal explanation; frame captures at 500–1000ms are identical after the reveal settles.

### 07 — How learning happens

**Visual sentence:** A batch moves forward, produces loss, sends blame backward, and updates weights before the next guess.

**Current audit:** The circular four-step loop is one of the more successful scenes, but the large nodes, ring, arrows, node subtitles, center loss, and moving marker compete for the same area. Some subtitles sit too close to the ring. The marker can move continuously even though the meaningful action is the “Run one learning step” control in the narrative. The loop lacks a visually explicit start/end relationship.

**Target composition:** Keep a loop because the cycle itself is the idea, but establish four reserved quadrants around a quiet center. Use four numbered or named nodes—`FORWARD`, `LOSS`, `BACKPROP`, `UPDATE`—with arrows outside the node outlines. Place the short verb under each node (`make a guess`, `measure error`, `assign blame`, `nudge weights`) in a consistent annotation gutter. The center should show the current loss value and one small batch label, not a second diagram. A short footer can state `gradient = direction · learning rate = step size`.

The marker should sit at a meaningful point and move only after `Run one learning step`, tracing the loop once or a small number of times. Use a visible arrowhead for direction; do not rely on a dot whose location is ambiguous.

**Interaction/motion:** The learning-step button increments the step and updates loss/marker. The learning-rate slider changes the step size in a truthful way. Do not let elapsed time continually change the scene when the user has not asked it to move. Reduced motion updates the marker position without interpolation.

**Asset decision:** Code-only. This is a mathematical process with live controls.

**Acceptance checks:** arrows have an unmistakable direction; subtitles do not touch nodes; the center value is not mistaken for a fifth step; pressing the button changes the loop meaningfully; idle frames remain stable.

### 08 — Learn patterns, not the answer sheet

**Visual sentence:** Training loss may keep improving while validation loss turns upward; save the checkpoint at the best validation point, not the final epoch.

**Current audit:** The chart has the correct basic curves and a useful checkpoint marker. Its continuation lines are so faint that they can read as ghost artifacts, the legend and axis labels are small, and the “best validation checkpoint” annotation sits close to the marker/curve. The underfit/useful-fit/overfit regions are subtle enough that the slider state is not obvious.

**Target composition:** Use one honest chart with two clearly distinguishable curves:

- blue/indigo `training`, generally descending;
- coral `validation`, descending then rising.

Use a single vertical green dashed line and dot at the best validation epoch. Put the label in a quiet callout above the plot or in a side gutter, not directly on the curve. Under the x-axis, use three lightly tinted zones labelled `underfit`, `useful fit`, and `overfit`; keep the labels outside the data lines. The current epoch marker should be a small dot or pencil tick that moves with the range input.

The “faint lines show what happens if training continues” idea may remain as a low-opacity continuation, but only one continuation per curve and never so faint that it looks like a rendering glitch. Give the two curves a small explicit legend. Preserve the chapter's validation/checkpoint message in the caption rather than adding more canvas prose.

**Interaction/motion:** The epoch range control reveals the curves up to the selected epoch and moves the current marker. It must be possible to see underfit, useful fit, and overfit at min/default/max values. No animation independent of the slider.

**Asset decision:** Code-only. The chart must be truthful and responsive.

**Acceptance checks:** no legend overlaps the chart; checkpoint label has clear separation from the dot; all three slider regimes are visually distinct; no ghost lines are mistaken for random overdraw; plot remains legible on mobile.

### 09 — Choose an architecture

**Visual sentence:** Different architectures make different information relationships cheap: locality for CNNs, running memory for RNNs, and relevance links for Transformers.

**Current audit:** The architecture tabs work and the CNN state is moderately coherent, but the visual tries to show several stages in one horizontal strip with tiny labels. The RNN state is readable at desktop but its probability panel is cramped. The Transformer state is the most problematic live branch: very large semicircular links cross the token row, repeated `K` labels do not explain key/value roles, and the selected `IT` query is not separated enough from the many unrelated tokens. This looks like a decorative web rather than attention.

Use one mechanism at a time and keep the same frame, headline, and footer across tabs. The active branch should never leave a faint previous branch underneath.

#### CNN state

**Target:** Show a single input grid with one highlighted 3×3 stencil, a compact filter-bank strip, and one resulting feature map. The stencil should visibly move or have a small scan arrow; the output map should show the response from that one filter. If the bank is included, label it `many learned filters` and show only a few swatches. Keep a compact footer distinguishing training (learn filter values) from test (reuse the bank). Do not show four nested maps if one map already explains `one filter → one map`.

**Decision:** Code-only; the stencil and response are interactive/data-driven.

#### RNN state

**Target:** Use a clean left-to-right sequence: token chip → hidden state circle/strip → next hidden state → next-word score list. Three states (`h₁`, `h₂`, `h₃`) are enough. Make the “same update rule” a small repeated stamp or a short annotation above the arrows. Keep the output list on a stable baseline with one highlighted prediction and readable percentages. Avoid arrows entering through circle labels.

**Decision:** Code-only.

#### Transformer state

**Target:** Reduce the sequence to six or fewer tokens, with one selected query token (for example `IT`) clearly marked. Show compact `Q`, `K`, and `V` badges in a dedicated row. Draw no more than three attention links, each in its own lane below the token baseline; vary thickness/opacity by weight. Make the strongest link terminate at the selected query's context box. If a second key/value relationship is needed, show it as a small weight strip rather than another crossing arc. The learner should see “query asks, keys match, values carry context” in one glance.

Remove the oversized semicircle arcs, repeated unlabelled `K` letters, long crossings through tokens, and decorative links with no state meaning. Do not use a generated image: the attention weights and selected token must stay live.

**Interaction/motion:** Tab switching changes the complete mechanism. A short controlled scan/reveal is acceptable for CNN/RNN/Transformer, but the default state must settle. If token selection is not an authored control, keep the selected token fixed and explain it; do not suggest hidden interactivity.

**Acceptance checks:** every architecture branch is legible at 390px; CNN output has a visible relation to the highlighted filter; RNN probabilities are not clipped; Transformer links do not cross labels or dominate the page; there is exactly one active branch.

### 10 — Start from a pretrained model

**Visual sentence:** A frozen general-purpose backbone provides features to a new trainable head; fine-tuning is a later, gentler option.

**Current audit:** The current feature library is represented by a huge lavender diagonally hatched area that visually overwhelms the scene. The `millions of earlier examples` text sits inside the hatch with little relationship to the feature chips. The new head is partly covered by a white/cropped shape, and its class labels do not read as a clear trainable output. The blue arrow does not establish a robust backbone→head pipeline.

**Target composition:** Use three zones:

1. **Pretrained backbone:** one paper card with 4–6 feature chips (`edges`, `textures`, `curves`, `parts`, `shapes`, `colour`) and a small lock or `frozen first` label;
2. **Transfer arrow:** a clear blue arrow with one short label, `reuse general features`;
3. **New head:** a smaller coral-accented card containing `cat`, `dog`, `rabbit`, with a `trainable` marker.

Put `millions of earlier examples` as a small source note under the backbone, not as a full canvas background. Add one optional lower note/branch, `fine-tune gently if validation needs it`, with a dotted amber connector. Remove the giant hatch, the clipped white blob, and any background block that does not carry the frozen/trainable distinction.

**Interaction/motion:** No control is currently exposed in this chapter. A one-time blue sample can travel backbone→head when the stage enters, then stop. Do not continuously move the arrow or animate every feature chip.

**Asset decision:** Code-only. The feature chips, lock state, head classes, and arrows are explanatory and should remain live.

**Acceptance checks:** frozen and trainable states are unmistakable; the new head is fully inside the scene; the transfer arrow has one start and one end; there is no large empty hatch; all class labels remain visible on mobile.

### 11 — Make an honest judgement

**Visual sentence:** The confusion matrix reveals which classes are confused, while the decision threshold trades recall against precision.

**Current audit:** The matrix itself is too faint and its labels are small. The right-side metrics sit beside a slider without a strong grouping. Large translucent green/coral rounded rectangles fill the bottom and right edges with no visible labels or semantic referents; these appear to be legacy overdraw/containment artifacts and must not survive. The `inspect the errors` squiggle and colored blobs do not connect clearly to a particular matrix cell. The cell counts remain fixed while the threshold metrics change, which can feel mathematically dishonest if no “illustrative fixed matrix” explanation is given.

**Target composition:** Make the matrix the focal object on the left: three row labels (`actual`) and three column labels (`predicted`), a clean 3×3 grid, green diagonal cells, coral off-diagonal cells, and readable counts. Add a small legend or caption that says diagonal = correct and off-diagonal = confusion. On the right, stack:

- threshold rail with one visible knob;
- `recall` and `precision` values;
- one small trade-off curve or two-arrow callout;
- a short amber note `accuracy is not enough`.

If the matrix is intentionally fixed while the threshold only changes the metric illustration, label it explicitly as an example and keep the relationship honest. Preferably, derive the displayed counts/metrics from a deterministic sample so changing the threshold changes the relevant predictions as well. In either case, do not show blank colored cells or placeholder blobs.

**Interaction/motion:** The threshold input must move the knob, update the metric values, and update either the matrix counts or an explicit threshold-dependent highlight. No decorative pulsing. At 390px, stack the matrix and metric rail vertically while keeping row/column orientation readable.

**Asset decision:** Code-only. This is a live confusion matrix and threshold visualization.

**Acceptance checks:** no blank rounded rectangles; all matrix cells have a clear role; actual/predicted orientation is unambiguous; threshold changes have a truthful visual response; mobile labels do not collide with cells or metrics.

### 12 — Ship the whole pipeline

**Visual sentence:** A deployable model is a versioned route from raw input through validation, preprocessing, prediction, and decoding—not a weights file alone.

**Current audit:** The left release list and the right vertical pipeline are visually disconnected. A large white rounded region covers the lower scene and reads as a mask. The blue arrow enters the chain without a clear source, while the moving dot travels a path whose relationship to the release bundle is unclear. Tiny labels make the manifest items hard to read. The scene has enough content for a useful diagram, but it needs one spine.

**Target composition:** Build one central route with four numbered nodes:

`1 validate input → 2 prepare → 3 predict (eval mode/no gradients) → 4 decode`.

Place a compact versioned manifest card alongside or above the route containing the required traveling items: weights, preprocessing, class order, threshold, software versions, failure handling. Use small colored dots to link each manifest line to the stage that consumes it, or group them under one clear label `release v27 / one versioned bundle`. Keep the operational footer (`latency · memory · privacy · failures`) in one amber note below the route. Remove the giant white panel, duplicate labels, and any line that does not connect two meaningful objects.

**Interaction/motion:** The sample dot may travel the route once on entry or in response to an existing state. It must stay on the one spine and stop at the current stage. No perpetual bouncing. Reduced motion shows the route and final state immediately.

**Asset decision:** Code-only. The pipeline, manifest, and operational constraints are semantic and must remain live.

**Acceptance checks:** the route has an unmistakable start and end; every manifest item is readable and attached to the bundle; the sample dot never leaves the path; no white masking rectangle remains; mobile uses a vertical route with sufficient gaps.

## Responsive composition requirements

### Desktop (1280–1440px)

- Preserve the existing overall two-column lesson relationship and visual-stage footprint unless a measured implementation proves a small local adjustment is necessary.
- Use a canvas/scene width that lets labels render at an actual readable size. Favor fewer objects over tiny labels.
- Keep the visual stage opaque enough that narrative content cannot ghost through it, but do not use opaque pseudo-elements to hide overdraw.
- Give the stage header, canvas, and caption separate layout boxes. Navigation dots belong to the header rail and must not consume the canvas's teaching area.

### Mobile (390×844)

- Recompose diagrams into a vertical sequence or two well-spaced columns. Do not scale a 720-unit desktop scene until text is unreadable.
- Use larger rendered text and fewer simultaneous annotations. It is acceptable to reveal a second relationship below the first if the stage remains the same chapter visual.
- Keep the sticky stage/caption boundary intentional. The active lesson heading and first readable paragraph must not sit underneath the sticky visual without a deliberate scroll margin.
- Matrix, tensor, architecture, and pipeline scenes need explicit mobile variants because their information is structured, not decorative.
- Maintain touch targets of at least approximately 44 CSS pixels for chapter dots and controls. The canvas remains non-interactive unless a state actually uses hit testing.
- Test at exactly 390×844, not only a wide phone emulation.

## Implementation sequence for Luna

The implementing agent should follow this order and record evidence after each phase:

1. Inspect the dirty worktree and identify the true editable source for the bundled renderer. Do not overwrite unrelated changes.
2. Inventory the twelve scene branches and all control/state dependencies. In particular, verify whether chapter 2's biased state is leaking into chapter 3 and whether any branch leaves stale painted content behind when switching.
3. Remove or bypass obsolete masks/overlays only after taking baseline screenshots. Establish one authoritative renderer per scene.
4. Introduce a scene-spec helper layer: safe bounds, text measurement/wrapping, seeded rough paths, palette roles, connector routing, and a `drawScene` switch. Keep stateful values separate from cosmetic geometry.
5. Rebuild chapters 1–4 first because they establish the input/data contract. Verify image/text/audio states at desktop and mobile before proceeding.
6. Rebuild chapters 5–8 as the mathematical core. Verify sliders, learning-step behavior, epoch extremes, and reduced motion.
7. Rebuild chapter 9 branch by branch. Treat Transformer as a fresh composition, not a minor patch to the current arcs.
8. Rebuild chapters 10–12, removing all blank/hatched/masked regions whose only purpose was to cover old content.
9. Apply the shared material treatment after geometry is stable. Do not use global `!important` rules as a substitute for scene ownership.
10. Add optional image generation only at the asset decision gate. If used, generate a text-free transparent layer and keep all labels, math, data, and interactions in code.
11. Run the mechanical, visual-director, frame-stability, responsive, and preservation checks listed below. Iterate until a screenshot review has no “what is that doing there?” moment in any chapter.

## Review checklist and definition of done

### Per-scene review

For each chapter and each branch/state:

- Can a viewer name the focal relationship in three seconds?
- Is there exactly one obvious reading direction?
- Does every visible object have a referent and a pedagogical job?
- Are all labels outside objects and connectors, with enough breathing room?
- Are colors semantic and reused consistently?
- Are the headline, diagram, caption, and narrative saying the same thing?
- Does every control update the visual target that the control promises to update?
- Is there any masked, ghosted, clipped, or stale prior scene?
- Does the scene settle to a stable frame?
- Does the mobile composition remain intentionally designed rather than merely compressed?

### Mechanical checks

- Open all twelve chapters at 1280×720, 1440×900, and 390×844.
- Exercise each interactive control at minimum, default, and maximum states.
- Exercise image/text/audio and CNN/RNN/Transformer branches.
- Verify no console errors, invalid canvas dimensions, or page-level horizontal overflow.
- Verify chapter navigation, direct `?academy=1` entry, keyboard focus, and reduced-motion behavior.
- Confirm the active scene has one canvas/painter and no old visual behind it.
- Confirm all canvas labels stay inside the safe bounds at desktop and mobile.

### Frame-stability check

Capture every static state twice, 500–1000ms apart. The frames must be pixel-identical except during an explicitly meaningful transition. If a difference comes from a rough line, cache the line's seeded geometry. If a difference comes from a moving marker, prove that the marker is tied to a control or intentional stage transition.

### Preservation check

Compare before/after:

- twelve authored chapter titles and order;
- all authored narrative text and numbers;
- all controls, defaults, ranges, and accessible names;
- chapter navigation and direct-entry behavior;
- interactive outcomes and caption updates;
- overall page structure and stage/caption relationship.

Run the project's normal build and test commands plus `git diff --check`. Report exact files changed, screenshots for every chapter/state, any generated assets and their integration, and any honest remaining limitation.

The final standard is not “the CSS looks more handwritten.” It is: every visual is purposeful, every state is intelligible, every annotation is placed deliberately, and the learner can follow the concept without fighting the illustration.
