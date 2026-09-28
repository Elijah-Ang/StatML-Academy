# Deep Learning hybrid-v2 art bible

Status: binding design and implementation brief for the next Deep Learning
pass. This is a handoff to the implementing agent, not a suggestion list.

Scope: `modules/deep-learning.html`, `modules/deep-learning-renderer.js`,
`modules/deep-learning-renderer.css`, and new assets under
`assets/deep-learning/hybrid-v2/` only.

## 1. Non-negotiable outcome

The current failure is not a missing handwritten font. It is a mismatch of
material: software diagrams have been given a handwritten typeface and
roughened lines. The target is a live study page that looks as if one person
assembled it with pen, pencil, marker, highlighter, scraps of paper, and tape.

The supplied reference PNGs establish material language only. They do not
replace the existing Deep Learning layout, story order, chapter footprint,
scroll rhythm, narrative copy, controls, data, or responsive behavior.

The final module must satisfy all of these statements:

1. The authored twelve-chapter narrative, titles, copy, data, controls,
   defaults, accessible names, navigation, and lesson/stage relationship stay
   intact.
2. Every visible scene has physical notebook qualities: irregular ink edges,
   hand-applied marker/highlighter, imperfect paper/tape grouping, and
   restrained tactile texture.
3. Every data value, label, axis, equation, percentage, control response,
   selected state, and animated state stays live code. Generated art never
   owns changing meaning.
4. Each chapter has one focal relationship, one reading direction, and no
   decorative object without a pedagogical job.
5. The visual is stable when idle. Human irregularity comes from cached authored
   strokes and generated raster underdrawings, not frame-by-frame jitter,
   filters, masks, or vibration.
6. The original stage/caption footprint is preserved. Do not copy the
   compact two-column or phone layouts shown in the references.

The correct mental model is **a live diagram pasted into a real notebook**,
not **a website card wearing a handwriting font**.

## 2. Reference-derived craft rules

The four reference files are:

- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_55 PM (4).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_53 PM (1).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_54 PM (2).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_55 PM (3).png`

They share these observable rules:

- warm cream/off-white paper rather than bright white UI surfaces;
- dark brown-black ink with pressure changes and occasional doubled strokes;
- readable hand-lettered headings and short notes;
- blue as the structural/selected accent;
- green for healthy, confirmed, or held-out state;
- coral/red for error, risk, shortcut, or bad result;
- amber/yellow for caution, highlighter, or sticky-note emphasis;
- occasional lavender/purple secondary emphasis;
- paper scraps, masking tape, underlines, pencil construction marks, and
  highlighter bleed used sparingly;
- charts/diagrams recognizably drawn by hand while retaining a clear axis and
  reading order;
- deliberate imperfections at mark edges, not random wobble over every pixel;
- generous empty paper around the focal object.

Do not copy their browser chrome, phone chrome, two-column lesson shell,
module-card grid, number of sections, navigation model, or density.

## 3. Material specification

### 3.1 Paper and palette

Use the existing module warm paper as the ground. If a token is needed, use:

| Role | Target | Meaning |
| --- | --- | --- |
| paper | `#FBF6E9` | stage ground and asset underlay |
| paper-light | `#FFFDF5` | small paper scraps/label backing |
| ink | `#2C2926` | primary lines, text, numbers, axes |
| pencil | `#6C675F` | quiet construction lines/notes |
| blue | `#356FAE` | main path, selected state, structure |
| green | `#4F956B` | correct, sealed, validated result |
| coral | `#C85E58` | error, leakage, shortcut, false result |
| amber | `#BF8C3D` | caution, highlighter, trade-off |
| lavender | `#7960AE` | secondary teaching accent only |

Material requirements:

- paper grain is subtle and static; it never shimmers or changes between
  frames;
- a highlighter swash has translucent body, uneven leading edge, and at most
  one imperfect return stroke; it sits behind one word or small region;
- tape is two roughly quadrilateral strips with visible fiber/ink variation,
  slightly rotated, and attached to paper; never float tape as decoration;
- a sticky note has mild warm fill, hand-drawn boundary, and at most one short
  live note;
- a grouping frame is one irregular outline with a gap/doubled pencil edge,
  never a rounded CSS card with shadow;
- pencil marks are lower contrast and support a relationship without competing
  with live labels.

### 3.2 Stroke and lettering recipe

At rendered desktop size:

- primary ink outline: 1.5–2.0px, round cap/join, one main pass plus an
  occasional offset pencil echo;
- secondary rule/leader: 1.0–1.4px;
- quiet paper rule: 0.5–0.8px at low opacity;
- marker swash: 8–18px wide and alpha approximately 0.18–0.34;
- data/interaction marker: 2–4px outline plus clear fill or halo.

Code roughness is seeded by semantic object ID and cached after layout. Never
call time-dependent random functions while painting a static scene. A generated
asset already contains human irregularity; never roughen it again with a global
Canvas interception layer.

Use the loaded handwritten face for display labels and a readable handwritten
utility face for values. Measure and reserve label lanes. Use sentence case for
teaching labels, short all caps only for roles such as `TRAIN`, `VALIDATE`,
and `TEST`. Never bake text into an image or place a label on a connector,
node, data mark, or tape strip.

## 4. Hybrid asset strategy

### 4.1 Purpose

Image generation is used to establish the physical underdrawing that code
cannot convincingly fake: recognizable subject character, paper fibers,
pencil/marker edges, tape, and small organic illustrations. It is not used for
a screenshot, a complete interactive diagram, a chart with labels, or any
value that changes.

Each generated file is a transparent, text-free supporting layer. The live
renderer composes it with code-owned geometry and text. This gives the scene a
real hand-made base while preserving mathematical truth and interactivity.

### 4.2 Common ImageGen prompt prefix

Prepend this exact style prompt to every chapter-specific prompt. Use the four
reference PNGs as visual style references only:

> Use the supplied StatSketch/StatML reference images only as a material and
> drawing-style reference, not as a layout reference. Create a cohesive
> hand-made educational notebook illustration by the same single human artist:
> warm cream paper residue, dark brown-black felt-tip and pencil contours,
> slight double-stroke registration, blue/green/coral/amber marker accents,
> translucent highlighter bleed, tiny pencil construction marks, uneven hand
> ruled edges, occasional blank masking tape and blank sticky-paper scraps.
> The result must feel physically drawn and assembled on paper, with deliberate
> breathing room and one clear focal object. Isolated components on a
> transparent background, 4:3 asset sheet, generous transparent padding, no
> component touching another component.

Append this exact negative prompt:

> Absolutely no words, letters, numbers, mathematical symbols, equations,
> labels, captions, axes, legends, percentages, controls, buttons, browser
> chrome, website cards, UI panels, logos, stock icons, perfect vector
> geometry, clean digital gradients, glossy 3D rendering, photorealism,
> drop-shadow dashboard cards, repeating scanlines, dense hatch noise,
> unexplained decorative shapes, hidden semantic state, or baked-in
> interaction. Do not imitate the reference layout. Keep every semantic mark
> and all text absent so live code can draw them.

### 4.3 First proof asset verdict

Root's first proof asset is:
`assets/deep-learning/hybrid-v2/ch01-finish-line-v1.png`
(1536×1024, text-free).

**Accept as style evidence:** graphite cat treatment, warm ruled paper,
visible tape fiber, torn output paper edge, imperfect ink outline, blue/green/
coral marker swatches, and the overall “assembled notebook” material. These
are materially closer to the references than CSS roughness.

**Reject as a direct full-scene background:** it bakes the paper ground,
notebook holes, input/output placement, and three empty output tracks into one
image. The tracks would duplicate live bars, the composition cannot reflow
cleanly to mobile, and it would make semantic updates look pasted on top.
Crop/extract only the cat, tape, paper edge, and other static components, or
use the asset as a style calibration reference. Do not place the full PNG
behind a coded scene.

### 4.4 Asset production contract

Store assets under `assets/deep-learning/hybrid-v2/`. Prefer a 2× source
resolution (roughly 1600×1200 for a 4:3 sheet), then optimize final PNGs.
Transparent alpha is required. If ImageGen returns paper-colored background,
matte it to transparency while preserving ink edges, then inspect on cream
paper at desktop and mobile size.

Every asset must have:

- no baked text, numbers, UI frame, or changing semantic data;
- separately crop-able components with generous transparent spacing;
- no source-boundary cropping;
- matching material recipe across the whole module;
- no duplicate geometry that the renderer will draw live;
- code-drawn fallback when loading fails.

Keep a module-local manifest with explicit anchors:

```js
const HYBRID_ART = {
  ch01: { src: 'assets/deep-learning/hybrid-v2/ch01-input.png', anchor: 'input' },
  ch02: { src: 'assets/deep-learning/hybrid-v2/ch02-dogs.png', anchor: 'contact-sheet' },
  // ch04-image/text/audio and ch09-cnn/rnn/transformer are separate entries
};
```

Paint order is always:

1. stage paper ground and quiet paper rule;
2. generated static underdrawing/assets;
3. cached non-changing code marks, tape, and grouping edges;
4. live data geometry, axes, equations, and connectors;
5. live labels, values, and semantic highlights;
6. one information-bearing transition marker, if applicable;
7. DOM caption and controls outside the canvas.

There must be one authoritative visible scene. Permanently bypass the old
painter, global `createElement`/Canvas hooks, CSS masks, paper-colored cover
rectangles, and duplicate hero/scene overlays after the hybrid renderer owns
all twelve chapters. Never hide old geometry with a new image.

### 4.5 Always code-owned

Never generate or bake:

- titles, kickers, body copy, notes, equations, labels, values, axes, legends,
  role names, metrics, or captions;
- dots, bars, probabilities, matrix counts, curves, token IDs, embeddings,
  slider output, loss, epoch marker, architecture selection, threshold marker,
  release route, or any stateful geometry;
- controls, hit targets, keyboard behavior, ARIA, responsive layout, or
  animation state.

## 5. Asset manifest and generation prompts

Generate each listed sheet with the common prefix and negative prompt. The
names in parentheses are internal crop IDs, not text to put in the image.

### `ch01-input.png` — Define the finish line

**Prompt suffix:**

> A single friendly cat subject drawn as a small imperfect ink-and-pencil
> silhouette, three-quarter view, recognizable ears, whiskers, and paws,
> lightly colored muted warm gray with one blue pencil accent. Include a
> separate blank torn-paper photo-corner scrap and two tiny blank tape strips
> as isolated components. Keep the cat modest in scale with no frame and no
> written marks; leave the right half open for live probability bars.

Use only the cat, paper corners, and tape. The input frame, arrow, probability
bars, percentages, winner ring, and all labels are live.

### `ch02-contact-sheet.png` — Collect reality, not shortcuts

**Prompt suffix:**

> A contact-sheet asset of nine separate friendly dog silhouettes in varied
> poses and orientations, each with a slightly different hand-colored paper
> tint. Add a small set of separate simple context marks—sun patch, grass
> scribble, floor shadow, and corner pattern—each isolated and blank of text.
> Keep all dogs and context marks individually separable, with no rectangles or
> UI card borders, so code can place stable subjects and emphasize one
> background cue.

Use one dog/context cutout per coded tile, optionally recolored or repositioned.
Tile boundaries, toggle state, coral confounder circle, and the live shortcut
label are code-owned.

### `ch03-split-materials.png` — Split before you tune

**Prompt suffix:**

> Three separate blank paper slips in cream, blue-green, and pale amber, one
> small green hand-drawn seal/lock mark, and one loose handful of blank ink
> dots as isolated components. The slips have torn edges and slight handmade
> rotation but no text, symbols, or numbers. Keep them distinct without making
> them UI cards.

Use paper texture and the sealed-test mark only. Dataset dots, proportions,
roles, job labels, percentages, arrows, and leakage state are live.

### `ch04-tensor-materials.png` — Turn examples into tensors

**Prompt suffix:**

> Three separated groups of text-free educational materials: first, a small
> hand-painted abstract picture tile plus three offset translucent acetate
> colour sheets; second, a blank strip of separate token-paper chips with
> subtle ink separators and one blank highlighted chip; third, a small
> microphone/sound-wave doodle, a few blank waveform sample marks, and a quiet
> blank spectrogram paper patch. No letters or digits. Keep each group
> separately crop-able and leave open space for live labels, IDs, values,
> arrows, and axes.

Use the selected image/text/audio source material. Token names, IDs, embedding
row, waveform samples, frequency/time axes, and mode transitions are live.

### `ch05-neuron-material.png` — Inside one neuron

**Prompt suffix:**

> One organic hand-drawn neuron/sum-node asset: a modest circular ink node
> with a pencil construction halo, four short blank input tabs, and one blank
> output tab, all as separable components. Use blue, green, coral, and amber
> pencil accents but do not draw equations, weights, arrows, or labels. The
> node should feel like a notebook sketch rather than a polished network icon.

Use the node underdrawing and paper texture only. Input lines, products, sigma,
z, ReLU output, slider state, and values are live.

### `ch06-feature-sheets.png` — Depth builds features

**Prompt suffix:**

> Four separate translucent tracing-paper sheets with imperfect pencil edges,
> each containing a progressively composed abstract mark: tiny pixel dots,
> short edge strokes, repeated texture dashes, and a simple part silhouette.
> Include two blank tape strips as separate components. The sheets are
> transparent enough to layer gently but spaced enough to arrange in a
> non-overlapping row. No labels, letters, arrows, or class symbol.

Use the four sheets and tape. Layer names, directional arrows, class output,
selection/reveal, and the final semantic relationship are live.

### Asset quality gate for chapters 1–6

Accept a generated asset only when it visibly contributes graphite/marker/
tape/paper material at normal stage size and does not repeat any semantic
geometry that code must update. Reject it when it contains text-like marks,
perfect UI framing, a full screenshot, hard-to-remove paper background, or
so much detail that the live labels become secondary.

### `ch07-learning-loop-material.png` — How learning happens

**Prompt suffix:**

> Four small blank notebook scraps in blue, coral, lavender, and amber, each
> with a different hand-drawn marker edge and tiny pencil registration marks;
> one separate blank circular center paper and four small blank arrowhead
> swashes. Components are isolated and contain no words, numbers, meaningful
> arrows, or diagram labels. Keep the materials quiet enough for a live
> four-step learning loop to sit above them.

Use the scraps as backing for the four live loop nodes and center loss note.
Loop geometry, direction, step, loss, marker, and learning-rate response are
live; do not paint an unchanging loop into the asset.

### `ch08-training-chart-material.png` — Learn patterns, not the answer sheet

**Prompt suffix:**

> A small blank piece of hand-ruled graph paper, a blue pencil swash, one
> coral pencil swash, and one green vertical marker strip, all separate
> transparent components. The graph paper has no axes, numbers, curves, labels,
> or values; the swashes are blank and imperfect. Leave a broad clean area for
> live training and validation curves.

Use the graph underlay and marker only. Curves, axes, checkpoint, epoch marker,
regime labels, legend, and range-control response are live.

### `ch09-architecture-materials.png` — Choose an architecture

**Prompt suffix:**

> Three text-free architecture study groups separated with generous
> transparent space: first, a hand-drawn 3-by-3 pencil stencil over a small
> abstract image patch and a compact stack of blank filter swatches; second,
> three blank circular memory-state scraps with a soft lavender pencil loop;
> third, a row of five blank token-paper chips with one lavender-highlighted
> chip and a few separate blank thread swatches. No letters, numbers, Q/K/V
> marks, attention percentages, arrows, or UI tabs.

Use the selected group's static underdrawing. The active tab, input grid,
filter response, hidden states, score list, tokens, Q/K/V badges, attention
links, weights, and context handoff are live. Only one group is visible.

### `ch10-transfer-material.png` — Start from a pretrained model

**Prompt suffix:**

> A blank lavender-tinted paper folder/backbone sheet with six separate tiny
> abstract feature swatches (edge, texture, curve, part, shape, colour), a
> small blank lock sticker, one blank coral paper scrap for a new head, and
> two small blank tape strips. Feature swatches are hand-drawn and tactile but
> contain no words, symbols, or labels. No large hatch field and no UI card
> border; leave space for live chips and the transfer arrow.

Use folder, swatches, lock, scrap, and tape. Feature names, frozen/trainable
labels, arrow, class list, fine-tuning note, and entry cue are live.

### `ch11-threshold-material.png` — Make an honest judgement

**Prompt suffix:**

> A blank hand-drawn notebook matrix substrate: one imperfect 3-by-3 pencil
> grid, separate muted green diagonal brush swatches, separate coral
> off-diagonal swatches, one small amber sticky-note scrap, and a slim blank
> threshold rail. No counts, row/column labels, arrows, curve, or text. Keep
> all pieces separable and leave open space for live metrics and controls.

Use matrix paper and semantic color underlay. Cell counts, actual/predicted
orientation, threshold knob, precision/recall, trade-off curve, and any
threshold-dependent highlight are live.

### `ch12-release-material.png` — Ship the whole pipeline

**Prompt suffix:**

> A blank hand-drawn release-folder/paper-bundle illustration: a small cream
> folder with layered paper edges, four blank colored route tabs, one green
> validation sticker, one amber operational sticky-note scrap, and two pieces
> of transparent masking tape. No words, numbers, arrows, checklists, icons,
> or software symbols. Components are separable and modest in scale, with open
> space for the live manifest and pipeline spine.

Use folder, tabs, sticker, note, and tape. Version, manifest items, four route
nodes, spine, stage labels, traveling token, and operational footer are live.

## 6. Chapter-by-chapter composition contract

The following is the binding split between generated static art (A) and live
code (B). These are the authored chapters; do not renumber, merge, or replace
them with generated screenshots.

### Chapter 01 — Define the finish line

**Visual sentence:** one specified input becomes a probability distribution,
and the largest score supplies the prediction.

**A — generated static art:** `ch01-input.png` cat cutout, optional blank
photo-corner paper, and attached blank tape. Cat remains quiet and modest.

**B — live code:** input tile bounds; `predict` arrow; output rows; cat/dog/
rabbit labels; bars and `0.89/0.08/0.03`; winner highlight; uncertainty note;
all text and responsive placement.

**Z-order:** paper → blank photo/tape → cat → live input frame → arrow → live
bars → winner ring/highlighter → labels and values.

**State transition:** no authored control. Optional one-time input-to-output
trace stops on entry. Reduced motion shows the settled state immediately.

**Ban:** white square placeholders, tan slab, generated probability text,
extra animal icons, or card-inside-card framing.

### Chapter 02 — Collect reality, not shortcuts

**Visual sentence:** class identity stays recognizable while context varies;
a shortcut is an unrelated background cue that looks suspicious.

**A — generated static art:** dog/context cutouts from
`ch02-contact-sheet.png`.

**B — live code:** stable 3×3/4×3 tile geometry; tint/scale/rotation values;
context positions; Dataset lens toggle; coral circle/highlighter; shortcut
relationship and mode caption.

**Z-order:** paper → tile dog/context underdrawing → tile boundaries →
live marker/circle → live label and state cue.

**State transition:** `biased=false` shows representative variation.
`biased=true` keeps positions and emphasizes the stable background cue; it
does not re-randomize or replace the contact sheet.

**Ban:** pause-shaped mark, unattached blocks, off-canvas dashed outline, or
context with no tile referent.

### Chapter 03 — Split before you tune

**Visual sentence:** one dataset has three roles: learn, choose/stop, and a
sealed final exam.

**A — generated static art:** blank slips, loose dot underdrawing, and green
seal/lock from `ch03-split-materials.png`.

**B — live code:** dataset dots/stack; one directional arrow; proportional
train/validate/test partitions; role names, job descriptions, percentages;
sealed-test state. Chapter 2's boolean cannot affect this scene.

**Z-order:** paper → source dots/slip → live partition geometry → live seal →
role labels and percentages.

**State transition:** optional one-time dot-to-role movement then freeze;
default is final partition. No hidden leakage animation.

**Ban:** empty software cards, `test set`/`15%` collision, or a large
bottom-right rounded crop.

### Chapter 04 — Turn examples into tensors

**Visual sentence:** pictures, text, and audio become tensors while preserving
space, order, or time.

**A — generated static art:** the three separated groups from
`ch04-tensor-materials.png`.

**B — live code:** selected image/text/audio branch; labels; image channels and
`height × width × colour`; token chips/IDs and embedding row; waveform
samples/window/spectrogram axes and highlights.

**Z-order:** paper → selected source material → representation geometry →
bridge arrows → labels/IDs/values → one selected highlight.

**State transition:** changing `tensorMode` replaces the complete strip and
clears stale marks. Optional short deterministic movement must settle. Mobile
uses vertical lanes.

**Ban:** white mask/seam, duplicate bars, malformed token text, stale mode
labels, or a generated heatmap pretending to be data.

### Chapter 05 — Inside one neuron

**Visual sentence:** weighted evidence and bias meet at a sum; activation
passes positive evidence and clips negative evidence.

**A — generated static art:** organic node underdrawing from
`ch05-neuron-material.png`.

**B — live code:** four input rows/weights; connector thickness; products;
`Σ`, `z`, bias, ReLU gate/output; all four range sliders; live values and
positive/negative emphasis.

**Z-order:** paper → node underdrawing → live connectors → live numbers/equation
→ live activation/output marks.

**State transition:** each slider updates only its row and derived `z`/ReLU.
No unrelated animation; reduced motion updates immediately.

**Ban:** giant halo, labels on lines, detached output blob, or generated
equations/weights.

### Chapter 06 — Depth builds features

**Visual sentence:** one signal becomes richer from pixels to edges to textures
to parts and finally a class decision.

**A — generated static art:** four tracing sheets and tape from
`ch06-feature-sheets.png`.

**B — live code:** layer names/tabs; arrows; progression emphasis; final DOG
class output; optional small reveal marker.

**Z-order:** paper → separated sheet underdrawings → live labels/tabs →
directional arrows → class output → optional one-time marker.

**State transition:** static state shows all four. Optional one-time
left-to-right highlight then settles. No white wash, repeated redraw, or
continuous scan.

**Ban:** stacked opaque sheets that hide labels, eraser wash, front-card
dominance, or class chip detached from `parts`.

### Chapter 07 — How learning happens

**Visual sentence:** a batch moves forward, produces loss, sends blame
backward, and updates weights before the next guess.

**A — generated static art:** four colored notebook scraps, center paper, and
quiet marker swashes from `ch07-learning-loop-material.png`.

**B — live code:** four loop nodes; arrows outside node bounds; current loss;
step marker; batch label; Run one learning step; learning-rate slider; step and
loss state.

**Z-order:** paper → four material scraps → live loop route → live nodes and
center loss → live step marker/arrowhead and values.

**State transition:** idle scene is frozen. The button increments step, updates
loss, and advances the marker once. Learning rate changes the next update
meaningfully. No elapsed-time loop; reduced motion jumps to the new state.

**Ban:** detached step pill, marker vibration, subtitles touching the loop, or
four nodes plus an unexplained fifth center step.

### Chapter 08 — Learn patterns, not the answer sheet

**Visual sentence:** training loss may keep falling while validation loss turns
up; keep the checkpoint at the best validation point.

**A — generated static art:** blank graph-paper patch and restrained marker
swashes from `ch08-training-chart-material.png`.

**B — live code:** training/validation curves; axes/ticks; underfit/useful-fit/
overfit zones; best-validation line and label; epoch marker; range input;
legend and live values.

**Z-order:** paper → blank graph underlay → live axes/zones → live curves →
checkpoint marker → live legend and epoch label.

**State transition:** epoch range reveals the correct curve prefix and moves
the marker. Minimum/default/maximum must show different regimes. Any
continuation is one low-opacity cached path, never decorative jitter.

**Ban:** ghost curves that look like overdraw, checkpoint label on a curve, or
generated graph values.

### Chapter 09 — Choose an architecture

**Visual sentence:** CNNs make locality cheap, RNNs carry running memory, and
Transformers select relevant relationships.

**A — generated static art:** three branch groups from
`ch09-architecture-materials.png`.

**B — live code:** exactly one active branch. CNN owns input grid/stencil/filter
bank/feature map; RNN owns token chips/hidden states/score list; Transformer
owns tokens, Q/K/V badges, no more than three attention links, weights, and
context handoff.

**Z-order:** paper → selected branch underdrawing → live branch geometry →
labels/values/highlights. No previous branch remains faintly visible.

**State transition:** `architecture` switches the complete branch. Optional
one-time scan/reveal settles; mobile recomposes vertically.

**Ban:** oversized semicircle web, repeated unlabelled K marks, transformer
links crossing text, CNN output with no filter relation, clipped RNN scores,
or branch-specific masks.

### Chapter 10 — Start from a pretrained model

**Visual sentence:** a frozen general backbone supplies features to a new
trainable head; fine-tuning is a later, gentler option.

**A — generated static art:** lavender folder, feature swatches, lock, coral
head scrap, and tape from `ch10-transfer-material.png`.

**B — live code:** frozen-backbone grouping; six feature names/chips; blue
backbone-to-head arrow; trainable class list; fine-tuning note; optional entry
sample cue.

**Z-order:** paper → folder/swatches/lock → live feature labels → live arrow →
head scrap → live classes and note.

**State transition:** optional one-time sample travels from frozen features to
head and stops. No full-field hatch animation. All labels remain live.

**Ban:** giant lavender hatch, clipped white blob, detached head, or generated
feature library containing words.

### Chapter 11 — Make an honest judgement

**Visual sentence:** the confusion matrix reveals mistakes while threshold
selection trades recall against precision.

**A — generated static art:** blank matrix substrate, green/coral swatches,
amber note, and threshold rail from `ch11-threshold-material.png`.

**B — live code:** actual/predicted labels and cell counts; threshold control;
knob; recall/precision; trade-off cue/curve; amber accuracy note; truthful
threshold-dependent highlight or matrix update.

**Z-order:** paper → blank matrix underlay → live grid/counts/labels → live
threshold rail and metrics → anchored trade-off note.

**State transition:** threshold changes knob, metrics, and an explicit visual
consequence. No pulsing blobs. Mobile stacks matrix then metrics with clear
orientation labels.

**Ban:** blank colored rectangles, detached squiggle, unexplained fixed matrix
while metrics change, or opaque cell mask.

### Chapter 12 — Ship the whole pipeline

**Visual sentence:** a deployable model is a versioned route from raw input
through validation, preparation, prediction, and decoding.

**A — generated static art:** release folder, tabs, seal, amber note, and tape
from `ch12-release-material.png`.

**B — live code:** versioned manifest items; one central four-stage spine;
stage labels/subtitles; moving sample token; operational constraints; entry
state.

**Z-order:** paper → folder/tabs/seal → live manifest text → live route/spine →
live moving token → operational note.

**State transition:** token may travel the one spine once on entry or stop at
the current stage. Reduced motion shows the complete route. No perpetual
bouncing and no second competing route.

**Ban:** giant white lower mask, disconnected manifest and route, edge-clipped
labels, or broad translucent slabs without a pipeline role.

## 7. State and preservation matrix

No chapter may silently inherit a visual state from another chapter.

| Chapter | Existing state/control | Only the following may change visually |
| --- | --- | --- |
| 1 | none | optional one-time entry trace |
| 2 | `biased`, Dataset lens toggle | context emphasis, confounder marker, mode note |
| 3 | none | static partition; no Chapter 2 leakage side effect |
| 4 | `tensorMode`: image/text/audio | complete selected representation strip |
| 5 | ear/fur/background/bias sliders | corresponding evidence line, sum, ReLU output |
| 6 | none | optional one-time feature progression |
| 7 | learning-step button, `learningRate` | step, loss, marker, update vector |
| 8 | `epoch` range | curve prefix, checkpoint/regime marker |
| 9 | `architecture`: CNN/RNN/Transformer | complete active architecture branch only |
| 10 | none | optional one-time transfer cue |
| 11 | `threshold` range | knob, metrics, truthful matrix/highlight response |
| 12 | none | optional one-time route token |

Do not change authored HTML text or control contracts to make an asset fit.
Remove only non-semantic decoration and recompute live layout.

## 8. Renderer implementation rules for Luna Max

1. Capture the current module as a baseline before changing assets. Preserve
   the original stage/caption relationship and measure desktop/mobile footprint.
2. Keep one editable scene registry in `deep-learning-renderer.js`. Every
   chapter branch declares safe bounds, asset anchors, live object bounds, and
   reading direction before painting.
3. Load generated images once and cache them. Do not re-decode or redraw an
   asset because a marker moved.
4. Separate static and dynamic layers. A control update may repaint the active
   scene deterministically, but it must not add a canvas or global hook.
5. Permanently bypass the old bundled painter, `createElement`/Canvas hooks,
   `requestAnimationFrame` for idle scenes, CSS masks, paper-colored cover
   rectangles, and duplicate hero/scene overlays once replacement ownership is
   proven. Hiding an artifact with a new rectangle is not a fix.
6. Keep code-drawn lines imperfect through seeded geometry, not per-frame
   jitter. Generated raster already supplies tactile irregularity.
7. Measure every live label. Use named lanes and collision checks for labels,
   connectors, nodes, asset bounds, and caption/footer bounds.
8. Preserve prior desktop canvas aspect/footprint. At 390px, recompose
   internally into a vertical sequence when necessary; do not shrink 720×540
   until words become hairlines.
9. Keep the visual stage in normal flow on mobile or reserve its exact space.
   It must never paint over the active narrative heading or control.
10. Under `prefers-reduced-motion`, settle all meaningful states with no
    decorative motion. Idle captures 500–1000ms apart must be pixel-identical.

## 9. Review gates

### Gate A — generated asset quality

For every asset:

- inspect the original PNG on a cream paper swatch and at 390px scale;
- verify alpha edges, no baked text, no accidental UI frame, and no cropping;
- compare material to all four supplied references;
- confirm that a human can name the physical object;
- confirm it is subordinate to and does not duplicate live code geometry;
- confirm the normal module path visibly uses it, with a code fallback on load
  failure.

The Chapter 1 proof asset
`assets/deep-learning/hybrid-v2/ch01-finish-line-v1.png` passes as a
material reference (graphite cat, tape fiber, torn paper, marker swatches) but
fails as a full-scene background because it bakes the paper ground, notebook
holes, output tracks, and fixed placement. Crop/extract static components only.

### Gate B — composition quality

For every chapter and branch/state:

- identify the focal relationship in three seconds;
- follow one reading direction without crossing a label;
- account for every visible mark;
- see a real mix of ink, pencil, marker/highlighter, paper, or tape;
- see no clean website-card grid or perfect dashboard rectangles;
- see no old scene behind the current scene;
- see no overlapping or vibrating static elements;
- find all text inside safe bounds at 1280px and 390px.

### Gate C — interaction truth

- exercise every control at minimum, default, and maximum;
- confirm only its declared visual target changes;
- verify no stale generated branch remains after tensor or architecture switch;
- verify learning-step/rate, epoch, sliders, and threshold are live/readable;
- verify entry animations settle and reduced motion is complete.

### Gate D — mechanical and preservation evidence

Capture every chapter at 1280×720, 1440×900, and 390×844, plus every branch
and control state. Record:

- no console/page errors or invalid canvas dimensions;
- no horizontal overflow;
- one visible painter/canvas and no legacy painter/RAF/listener;
- two identical idle frames 500–1000ms apart;
- all live labels inside safe bounds;
- exact chapter title/order/body/copy/control/default/ARIA parity with
  baseline `99e3aaceb229d6028b24ec94159462829b965f79`;
- `git diff --check`, syntax checks, `npm run build`, and `npm test`.

The final report must list every generated asset, its prompt family, fallback
behavior, integration anchor, and screenshots proving that it is visible.

## 10. Definition of done

Do not call the pass complete because the words use a handwritten font. It is
complete only when the left narrative content and right visual read as one
coherent tactile notebook made by one artist; existing lesson meaning and
interactions are preserved; generated underdrawings are actually visible; and
a reviewer cannot find a clean coded card, masked seam, unexplained blob,
overlap, vibration, stale branch, or decorative noise in any chapter/state.
