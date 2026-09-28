# Simulated beginner accessibility review

28 September 2026. This is a source-informed design critique using hypothetical learner questions. It is not a study with learners and does not represent every person with learning or attention difficulties.

## Readability findings

A browser audit visited all 359 sections at 1440px and 320px, loading the handwriting font and selecting each section by scrolling. The initial report contains 718 section/viewport checks, 170 intersecting text pairs across 139 checks and 13 modules, and no JavaScript errors. These are bounding-box candidates, not 170 independently confirmed glyph collisions. Repeated lower-left tick collisions account for many candidates; the larger title/axis/caption collisions corroborate the supplied screenshots.

Evidence: `text-collisions-initial.json`; reproducible script: `audit-text-collisions.mjs`. The report measures internal SVG text overlap, which the older view-box clipping tests did not measure.

## What the learner might ask, and what the image should answer

| Hypothetical question | Current obstacle in the source | Proposed visual response |
|---|---|---|
| “What is one dot? What does the gold dot mean?” | In dense neural/tree maps, generic `Input x₁` / `Input x₂` headings assume familiarity with coordinate space. Selected observations and new queries may have similar gold emphasis. | Open with one observation and coordinate guides before revealing its neighbors. Describe gold as either the selected query or inspected observation in that scene. Preserve the same point identity through all linked panels. |
| “Why did three numbers become this probability?” | `neural-scenes.js:features` initially connects three hidden activations to the output map with arrows only. Neither output weights, bias, nor sigmoid is shown in the bridge. | Three labelled steps: what each unit notices; how strongly it counts (`weight × response`, with signed bars); how the total becomes probability. The exact equation belongs in the receipt. |
| “Does red mean the same thing everywhere?” | Blue/red represents class identity and output probability in one panel, but low/high or negative/positive activation in another. | Give hidden responses their own labelled numeric scale, retain unit identity through numbering and position, and reserve a stated class scale for the output map. Pair class color with dot/cross shape. |
| “Which of these controls should I touch?” | Priority controllers hide irrelevant controls, but older `workflow.js` shows transformation, feature timing and step controls together even when the picture does not respond meaningfully to every control. | Make each section name one recommended experiment. Show only controls that change that scene; retain values when they reappear. A control must cause a visible, interpretable change and update the receipt. |
| “Where did the missing value go?” | Workflow mechanisms and data leakage often fall back to stacked word boxes. These repeat the text instead of showing its consequence. | Draw the same row tokens before masking, after masking, and after imputation; show a held-out boundary and a fitted-statistic container. A leaking held-out token crosses the boundary visibly. |
| “How did a whole sample turn into one dot?” | Sampling views show distributions without a persistent journey from the sampled observations to their mean. | Keep one sample visible, mark its mean on the same outcome scale, then place one mean-dot into the sampling distribution. Distinguish an observation-dot from a sample-mean-dot in the labels and shape. |
| “Why did this neighbor count more?” | The original kNN votes renderer shows five decorative class bars rather than all selected neighbors and their actual weights. | Preserve neighbor IDs from the data plot. Show each selected neighbor's distance and normalized vote contribution, then a class-1 share tally. For exact matches, explain why all other weights become zero. |
| “How is a forest more than four pictures?” | Forest before/after panels repeat axes, use colliding titles and expose multiple quantities at once. | Separate the causal comparison into two labelled rows: original sample, one row changed. Keep two representative trees in fixed columns, then show all-tree mean below. Explicitly say the two displayed trees are examples, not the full forest. |
| “What changed when I scrolled?” | Several neighboring sections share a renderer and may look identical while the left text changes substantially. | Persist one object but change its explanatory layer: observation → gap → square → sum; query → route → leaf → ensemble average. Give each section one distinct visual action and a short consequence caption. |

## Design rules endorsed in the team discussion

- One scene has one teaching question and one dominant visual action. Extra richness should reveal the mechanism, not add simultaneous decoration.
- Keep handwriting for voice and captions; preserve readable size. Add height or stack panels on a phone instead of shrinking annotation text.
- Reserve vertical bands for title, chart header, data, tick labels, x-axis label and footer. Caption wrapping must move the next band, not merely extend the SVG boundary.
- Arrows should terminate at a mark, bar or panel edge; never run through an explanatory sentence. If a transformation matters, show the quantity that changes along the route.
- Keep a selected object, axis scale and object ID stable when a comparison requires them. Avoid regenerating observations on resize or ordinary scroll.
- Use 3D only for a concept whose third dimension explains something: regression plane or loss surface. A 2D slice and a numerical receipt remain useful orientation aids.
- Motion is finite and interruptible. Learners control repetition with an explicit step or replay action; reading should not trigger endless movement.
- After every scene, a learner should be able to answer: “What is each mark? What stayed fixed? What changed? Why did that change the answer?”

## Brief interdisciplinary discussion

The UI reviewer proposed a hidden-response → signed weighted-contribution → output-probability sequence. The learner review supported it, requesting stable unit numbers, an explicit zero line and separate activation/probability color meanings. The professor review agreed the missing multiplication is conceptually important: a strong hidden response can contribute little or subtract because of its output weight.

The professor reviewer identified incomplete kNN vote displays and proposed all-neighbor contributions. The learner review requested row identity, distance-to-weight linkage and a visible numerator/denominator. The implementation plan now uses a full contribution strip plus a row grid, avoiding unreadably narrow text inside small strip segments.

## Follow-up validation with real learners

A short think-aloud session should ask learners to predict a change before moving a control, explain a gold mark and a color scale, and reconstruct one calculation from the visual. Observed hesitation would determine where to reduce simultaneous detail or add an intermediate scene. No learner outcomes or accessibility certification are claimed by this simulated review.
