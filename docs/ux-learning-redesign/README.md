# StatML Academy: a fluid, handwritten learning experience

Audit and implementation plan · 27 September 2026

The recommended direction is an **interactive notebook with a consistent lesson rhythm**: a clear question on the left, one evolving explanation on the right, and small worked examples beside the prose. Keep the warm paper, hand lettering, pen strokes, and highlighter marks. Give the underlying layout, mathematics, controls, and motion much stricter rules.

The content should become easier to enter without losing its depth. A beginner should understand the essential idea before encountering every assumption, symbol, and exception; an advanced learner should still be able to open the derivation and inspect every step.

The original audit below is a historical baseline. All 33 modules now use the notebook format. The latest pass repairs internal label collisions, adds visual teaching sequences across the weak scenes, and checks all 359 sections at desktop and phone widths. Start with [the current storytelling and overlap review](./visual-storytelling-review.md). The [earlier six-module visual rebuild](./visual-teaching-review.md) and [359-section review](./visual-teaching-stage-review.md) record the preceding work. The [pilot implementation ledger](./pilot-implementation.md) and [first full rollout record](./rollout-implementation.md) preserve earlier milestones.

The companion documents retain the original stage-specific plan:

- [Every module and every stage](./lesson-by-lesson.md): 359 stage-level recommendations across all 33 modules.
- [Implementation examples](./implementation-examples.md): concrete replacements and integration instructions for the current code.
- [Audit evidence](../../audit-evidence/ux-learning-2026-09-27/): reproducible inventory, browser checks, screenshots, and source hashes.

## Scope addition: rebuild the neural visuals

The user explicitly requested that **Neural Networks and Deep Learning have their current visuals stripped back and redesigned in this same direction**, not merely polished with theme overlays. This applies to all 19 Neural Networks stages and all 12 Deep Learning chapters. Preserve the comprehensive teaching, useful controls, scientific examples and handwritten identity; rebuild the visual composition, interaction and motion around the new notebook system.

This is the next neural migration requirement, separate from the four active pilots. First extract Deep Learning’s authored content from its compiled inline bundle, inventory every current interaction and verify the arithmetic. Then replace its active `deep-sketch` composition and the Neural Networks canvas scenes with purpose-built, retained visuals. Do not revive the historical hybrid renderer or retain old art/layout simply because it already exists. Use the existing stage playbook as the coverage ledger. A successful replacement needs the same finite motion, linked calculations, small left-side examples, mobile exploration, keyboard alternatives and beginner-friendly depth as these pilots.

The extraction step may temporarily preserve existing behavior to establish a baseline. That is a migration technique, **not** a requirement to preserve the old visual design in the finished modules.

## 1. What was inspected

The repository contains **33 modules and 359 rendered lesson stages**, plus the universe landing page. The count includes the ten foundation/workflow modules and both neural-network modules, beyond the canonical list of 21 core modules.

| Current implementation family | Modules | Stages | Where changes belong |
|---|---:|---:|---|
| Core pages with page-local renderers, excluding Naive Bayes | 20 | 226 | Individual HTML files, shared stage/navigation/theme layers |
| Generated foundation/workflow pages | 10 | 90 | `scripts/generate-foundations.mjs`, `foundation-module.js`, `foundation-module.css` |
| Naive Bayes sketch board | 1 | 12 | `naive-bayes.html`, `bayes-sketch.js`, `bayes-sketch-scenes.js`, `study-sketch.js` |
| Neural Networks | 1 | 19 | `neural-networks.html` |
| Deep Learning | 1 | 12 | `deep-learning.html`, `deep-sketch.js`, `deep-sketch-scenes.js`, `deep-sketch-art.js`, `study-sketch.js` |

The audit reviewed the source inventory and rendered lesson structure, traversed every stage at 1440 × 1000 and 390 × 844, and inspected screenshots from representative renderer families. Content review prioritized definitions, worked examples, assumptions, evaluation practices, and consistency between explanations and visuals. The current sweep recorded **no page JavaScript exceptions and no horizontal document overflow** at those sizes. These are smoke checks, not proof that every control, calculation, browser, or accessibility requirement works. The stage playbook covers the whole curriculum; a complete independent verification of every statistical computation remains an implementation/review task.

Additional targeted checks tested SVG identity after advancing a diagram, animation scheduling with reduced motion, revisiting a regression stage, and resizing a sampling laboratory. No user analytics or device performance study was performed. The timing and usability targets below are proposed acceptance criteria, not measured improvements.

The browser currently loads the newer `study-sketch`/`deep-sketch` stack for Deep Learning. The older `deep-learning-renderer.js` and `deep-learning-hybrid-renderer.js` are not loaded by that page in this audit. Do not begin work by polishing those historical files. Some legacy rendering code is embedded directly in HTML; a standalone file's presence does not establish runtime ownership.

## 2. Findings that should drive the work

| Priority | Observed condition | Learner consequence | Concrete response |
|---|---|---|---|
| P0 | ANOVA's degrees-of-freedom example says the third of three numbers averaging 10, after 8 and 15, is −13. `anova.html:1273` | The example contradicts its own arithmetic. | Replace with 7; let the learner choose two values and compute the constrained third. |
| P0 | Imbalanced Classification's worked example says 1% prevalence, 90% recall, 95% specificity, but reports 1,305 false positives. Generator line 75 | The key base-rate lesson teaches the wrong counts. | Of 10,000 cases: 100 positives, 9,900 negatives, TP=90, FN=10, FP=495, TN=9,405; 585 alerts; precision=15.4%. Update generator and generated page together. |
| P0 | Neural Networks stage 3 is titled “Clean, encode, scale, then split.” `neural-networks.html:323` | The heading teaches an unsafe sequence even though the body discusses fitting preprocessing on training data. | “Split first; learn preprocessing from training data.” Distinguish deterministic cleaning rules from fitted transforms. |
| P0 | QDA describes diagonal ridge as behaving like LDA, immediately beside a more careful correction. `qda.html:1781` | Two adjacent explanations disagree. | Explain identity-ridge stabilization separately from shrinking class covariances toward one pooled covariance. |
| P1 | Desktop landing page links to 23 modules; mobile links to all 33. `index.html:1178` stores the extras as `mobileCompanions`. | Ten existing lessons are much harder to discover on desktop. | One 33-module manifest drives both views, search, prerequisites, and next-module links. |
| P1 | `study-sketch.js:253` replaces `.sketch-art.innerHTML` on every render; confirmed new SVG identity after a trace step. | Marks jump between states; continuity and focus need manual reconstruction. | Introduce stable mark IDs and persistent SVG groups; transition the changed geometry. |
| P1 | Regression, K-Means, and PCA each scheduled about 60 animation callbacks in one idle second with reduced motion enabled, in this local Chrome check. | Unnecessary rendering continues after the image settles; reduced-motion behavior is incomplete. | Use one invalidation scheduler, finite transitions, visibility pause, and an immediate settled state for reduced motion. This finding does not establish battery use or frame rate. |
| P1 | `samplingLab()` creates random samples inside `draw()`, and resize invokes draw. Recorded means changed 50.1 → 49.7 → 50.5 → 49.7 while only resizing. | The learner cannot tell whether a parameter change caused the result. | Generate data in a seeded model layer; resize only changes projection and drawing. Add an explicit “Draw another sample” action. |
| P1 | The foundation renderer mixes stylized curves and actual calculations. `forestLab`, `boostingLab`, `missingLab`, and `designLab` include hand-authored performance formulas. | Polished metric labels can make illustrations look like measured model results. | Mark the mode beside the plot; use actual tiny fitted examples where the lesson claims measured performance. |
| P1 | Legacy pages have separate observer/state logic for narrative and shared stage UI; K-Means `setStage()` resets the algorithm as sections activate. | Scroll can undo exploration or cause navigation and diagrams to disagree. | One active-stage authority; separate narrative presets from the learner's experiment. Enter a preset once or only on an explicit action. |
| P1 | Long foundation paragraphs place many undefined concepts together; all ten share a repeated “reasoningFrame” paragraph. | Dense completeness takes the place of a teachable sequence. | Replace generic prose with a concrete question, a small example, an explanation, and an optional deeper layer. |
| P2 | The 33 HTML pages contain 7,854 `!important` occurrences. Shared CSS also forces the handwritten face onto all descendants, code, and KaTeX. | Broad overrides make layout and formula changes fragile. | Adopt scoped tokens and one style owner per component; remove old declarations only as each family migrates. Preserve mathematical glyph/layout integrity. |
| P2 | Phone screenshots show a large pinned visual; detailed SVG lettering becomes tiny even when controls fit. | A learner can have little room for reading and still struggle to read the figure. | A compact summary plus “Explore diagram” expansion; recompose charts at phone width, keeping visible labels readable. |

### Preserve the existing strengths

Keep the live editable regression table, computed K-Means steps and elbow work, PCA's distinction between the 2D teaching slice and the full matrix, the real small SVM fit, the One-R rulebook, and the conditional-independence explanation in Naive Bayes. These are valuable teaching interactions already present.

Preserve the logistic lesson's explicit TRAIN/VALIDATION/TEST separation and locked final test reveal. Treat that as the evaluation pattern to extend to the other classifier lessons. Keep the statistical assumptions, failure cases, reporting advice, and no-JavaScript text available while changing their presentation.

The sketch boards already provide trace steps, keyboard activation for diagram actions, and pause on document visibility change. Extend those behaviors instead of discarding them.

## 3. The visual system

### A calmer notebook

Use the existing paper and ink palette as the starting point. The polish should come from consistent composition and precise motion:

- One paper background, one quiet ruled texture, and one primary ink color. Place texture behind prose; greatly reduce it behind quantitative marks and dense tables.
- One handwritten heading face and one legible handwritten reading face. Start body text around 18–20 px, with 1.55–1.7 line height and approximately 48–65 characters per line. Validate the actual font, rather than treating these numbers as universal.
- Main chart labels at least 14 px at their rendered size where practical. Never shrink a desktop diagram until its annotations become miniature handwriting. Phone diagrams need different label placement, not merely a smaller viewBox.
- Keep equations correctly typeset where required. Do not override KaTeX's internal fonts with a wildcard. Handwritten labels, braces, explanations, and annotations can surround the equation.
- Stable dark text; blue for the concept under discussion; amber for a learner's current guess; red for error or a violation; green for a completed step. Dataset classes keep their own stable color-and-shape identities. A “correct” highlight must not silently change class identity.
- Rough edges belong on a few paper surfaces, arrows, and nonquantitative annotations. Data positions, bar lengths, interval endpoints, and equality boundaries stay mathematically exact. Cosmetic wobble never changes the underlying data.
- Use light underlines and margin notes more often than boxes. The current notebook has many nested frames and sticky notes; limit each stage to one primary callout.
- Align changing numbers in fixed-width spaces. Never let a wider value shove a slider, equation, or diagram sideways.

An optional “clear reading” preference can use a conventional body face while keeping headings and illustrations handwritten. It should be a learner option, not a replacement for the default aesthetic.

### One consistent lesson shell

Desktop: compact navigation → stage heading and purpose → a reading column of roughly 42–46% and an exploration column of 54–58%. The visual stays available while its explanatory steps pass the reading line. Use measured content height and bounded spacing; do not preserve hundreds of hard-coded stage minimum heights.

The stage heading names a question: “Why square the errors?” is more useful than “Reasoning with the method.” A small stage strip shows a meaningful title and position, such as “4 of 8 · Measure the mistakes.” Keep the dots as secondary progress decoration only if they also have accessible labels.

The visual should contain, in this order: its question, the diagram, one primary control or trace action, the current consequence in a sentence, and an optional data/steps view. Do not put a permanent toolbar of every future control above every scene.

Phone: start with the question and a compact visual summary, then the explanation and its mini example. Offer an explicit expanded exploration view when the plot needs more space. Return to the same reading position and preserve state. Do not make each phone stage a permanently occupied half-screen plot. If a sticky preview is retained, cap it by available height, make it collapsible, and test short landscape screens and browser zoom.

Foundation modules should gain the same shell where sustained linked visuals add value. A short definition, reporting example, or quiz may remain inline; it need not invent a large right-hand picture to satisfy a template.

### A single source of navigation truth

Replace the separate 21-core inventory, two concept additions, and mobile-only companion list with one manifest containing all 33 modules, their family, actual route, prerequisites, stage count, and learning track. Keep existing URLs and bookmarked anchors working. Generate human-readable next choices instead of implying that ANOVA must be every beginner's starting point.

Offer “Explore the universe” and “Browse all lessons” from the same data. The illustrated map remains the identity of the site; a searchable text list supplies reliable discovery, keyboard use, and small-screen access. Do not add more planets until the existing 33 are equally discoverable.

## 4. What “buttery” means in implementation

The goal is **continuous cause and effect**, not motion everywhere. A learner should see which thing changed, what stayed fixed, and why the result moved.

| Change | Proposed behavior | Initial timing to test |
|---|---|---|
| Slider or point drag | The controlled mark follows the input immediately; derived work is scheduled once per frame. | Input response next frame; no easing that makes the handle lag |
| Click a new value or apply a fitted solution | Move from the currently displayed geometry to the new geometry. A new request cancels/replaces the old destination. | 180–300 ms |
| Step an algorithm | Preserve object identity; highlight assignments, then move centers or weights. Keep each causal phase visible. | 300–500 ms per phase, learner-paced |
| Open a “why” or worked calculation | Expand a small local section without jumping the scroll position. | 140–220 ms, or instant if content/anchor stability is safer |
| Advance a lesson | Reuse the same points and axes when meaning continues; introduce a different representation with a clear handoff. | 200–350 ms |
| A categorical state changes | Update its label directly. Cross-fade categorical fills only if that does not suggest a fractional class. | 120–180 ms |
| A dataset or distance system changes | Label the change; reset explicitly or show old/new side by side. Do not animate through fake scientific states. | Deliberate handoff |
| Reduced motion | Immediate final geometry, preserved highlights, counts, and an equivalent text explanation. | 0 ms spatial transition |

These are design starting points, not universal timing laws. Use monotonic easing for quantitative values; reserve a very small spring for nonquantitative controls if user testing supports it. No overshoot in probabilities, counts, convergence, confidence bounds, or fitted coefficients. No looping ambient particles while a learner is trying to read.

The regression page currently lerps by `0.08` per frame (`simple-linear-regression.html:2135`), so duration depends on display refresh rate and the animation has a long tail. Replace this with elapsed-time interpolation. K-Means should animate displayed centroids between exact algorithm snapshots; never use interpolated centroid coordinates to compute the next assignments. The sketch board needs persistent marks rather than an SVG replacement on every step.

CSS transforms and opacity are good defaults for moving interface elements. Changing chart geometry may legitimately require SVG attribute updates or canvas redraws; measure that work and keep it bounded. Do not add `transition: all`, animate every layout dimension, or assume a library alone will fix timing. [Chrome's animation guidance](https://web.dev/articles/animations-guide) supports profiling the rendering work and favoring compositor-friendly properties when appropriate.

### Shared state and rendering responsibilities

1. **Lesson state:** active stage, open explanations, selected case, playback, and saved exploration settings.
2. **Scientific state:** raw observations, immutable split IDs, model parameters, algorithm snapshots, and computed metrics.
3. **View state:** interpolated positions, opacity, pointer hover, and chart projection.
4. **Renderer:** a pure projection of the scientific and view states. Resizing cannot sample data, train a model, or choose a threshold.

Have one stage controller publish the active stage to navigation, prose highlighting, and the renderer. Batch scroll/resize reads in one animation frame; do not observe and decorate every freshly painted data mark. Clean up observers, timers, listeners, and pending workers on disposal.

Start with native ES modules, CSS, SVG, canvas, and the Web Animations API. The existing project does not need a framework migration to achieve this. D3 joins/scales can help dense plots if introduced deliberately; a broad React rewrite would add scope without first resolving the observed issues.

## 5. Interactions that teach something

| Interaction | What the learner learns | Suitable lessons |
|---|---|---|
| Select a table row and highlight its mark | A row, point, prediction, and error are the same observation. | Regression, KNN, LDA/QDA, classification metrics |
| “Predict, then reveal” | Form a hypothesis before watching the answer. | Outliers, thresholds, splits, centroids, regularization |
| A reversible algorithm timeline | Distinguish intermediate operations and their order. | K-Means, clustering merges, trees, boosting, training |
| One-variable counterfactual | Isolate why a result changes. | ANOVA spread, PCA scaling, costs, class prevalence |
| A pinned before/after comparison | Compare on identical data, axes, and splits. | LDA vs QDA, underfit vs overfit, scaled vs raw |
| A small expandable arithmetic table | Connect symbols to actual numbers. | SSE, expected counts, likelihoods, class votes |
| Hover, focus, or tap a formula term | Identify its definition and corresponding marks. | ANOVA, correlation, logistic score, PCA loadings |
| Inspect a failure case | Learn when the method stops being useful. | Curved relationships, non-spherical clusters, leakage |
| Complete one missing step | Retrieve the mechanism, not merely recognize a sentence. | All modules |

Every main interaction must have a named learning purpose, a visible consequence, and a usable keyboard/touch alternative. Provide click-to-select plus “move left/right/up/down” or numeric inputs for draggable marks. WCAG 2.2's dragging criterion requires a non-drag pointer alternative; its AA target-size criterion is 24 CSS pixels with exceptions. Aim for roughly 44 px controls on touch as this product's more generous design target. [W3C guidance](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).

Do not turn the whole canvas into hundreds of keyboard stops. Expose selected observations through a native selector and a data table, keep actions native, and announce a settled result once. A canvas `aria-label` is a useful start but does not make every data value or interaction accessible.

## 6. Simplifying the teaching while retaining the detail

### A repeatable six-part structure

For each stage, write:

1. **The question:** the exact confusion this stage resolves.
2. **The short answer:** usually 2–4 sentences, using the running example.
3. **A tiny example:** one calculation, a two-row comparison, a miniature visual, or a before/after table on the left.
4. **Try it:** one purposeful action in the main diagram, followed by “What changed?”
5. **Why this works / show every step:** optional derivation and definitions, with no unexplained symbols.
6. **Check and limitation:** a brief prediction or completion task and one important boundary on the conclusion.

Do not require six visible boxes per stage. These are authoring responsibilities. Most should appear as ordinary prose, a small example, and one expandable section. Aim initially for about 80–140 words in the first pass for a typical concept stage, then test actual comprehension. Keep important safety-of-interpretation caveats visible; only the longer justification moves into deeper reading.

This approach uses worked examples, concrete-plus-abstract representations, retrieval, and explanatory questions. Those are supported by the [IES learning practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1). The proposed six-part structure and word budget are design judgments for this site, not a prescribed research formula.

### The beginner's “why ladder”

Before publishing a stage, ask in order: What problem exists? What does this word mean? What quantity are we computing? Why this operation? Why not the obvious alternative? What assumption lets us do it? How do we read the output? When could that reading fail?

For example, “covariance matrix” should not first appear as a four-symbol grid. Show two columns of fruit measurements; show how each varies; show whether they vary together; then name the grid that stores those facts. Keep the technical name so learners can later recognize documentation.

Use an on-demand glossary for reusable terms: observation, feature, target, parameter, hyperparameter, residual, loss, likelihood, probability, variance, covariance, distribution, sample, population, and validation. A glossary explains a term locally without taking the reader away from the lesson. First mentions still receive a short definition in the sentence.

### Which mini visuals belong on the left

- **Symbol dictionary:** symbol / plain meaning / current value / units. Three or four rows, not a full formula encyclopedia.
- **One-observation receipt:** actual → predicted → residual → squared residual.
- **Denominator lens:** highlight exactly which people enter precision versus recall.
- **Pipeline strip:** training fit → frozen transform → held-out prediction.
- **Method contrast:** two or three rows comparing when a choice helps and what it costs.
- **Assumption → symptom → response:** a short diagnostic table, instead of a wall of caveats.
- **A worked step with a blank:** reveal only after an attempted answer.

The left example explains one small relationship. The right diagram shows the whole system. They share state when they show the same example; a fixed teaching example must be explicitly named if it differs from the live data. Do not silently show old numbers beside a freshly changed graph.

### Three sample rewrites

**Least squares — why square the errors?**

> A residual is the actual score minus the predicted score. If our model misses one student by +4 and another by −4, adding the misses gives zero—even though both predictions were wrong. Squaring gives 16 + 16 = 32, so the mistakes cannot cancel. Larger misses count more heavily. Least squares chooses the line with the smallest total squared error.

Place a two-row receipt beside it. Then reveal: absolute errors also avoid cancellation; least squares chooses a different penalty with useful algebra and a greater sensitivity to large misses. Do not teach that squaring is the only way to measure error. Give SSE units as score-points squared, not simply “points.”

**ANOVA — why do we lose a degree of freedom?**

> Pick three numbers whose average must be 10. Their total has to be 30. You may choose the first two: 8 and 15. The last one is forced to be 7. Two numbers were free to change; one was determined by the constraint. That is the idea behind two degrees of freedom.

Use two number inputs and one computed value. Follow with the actual ANOVA quantities: each group mean consumes one constraint for its within-group residuals; show `N − k` and `k − 1`, then explain the mean squares. The F statistic compares those mean squares, not an unspecified “signal” to an unspecified “noise.” [NIST ANOVA reference](https://www.itl.nist.gov/div898/handbook/prc/section4/prc433.htm).

**PCA — why look for a direction with large spread?**

> Imagine keeping only each point's position along one line. If the projected points bunch together, many different observations become hard to distinguish. PCA chooses a direction whose projections have the largest sample variance. For centered data and this squared-distance objective, that also gives the best one-direction reconstruction. A direction with large variance is not necessarily the direction that best predicts a target.

Show three tiny projections at 0°, 45°, and the fitted PC1 direction. Keep the full-data eigenvectors separate from the adjustable 2D teaching slice. Explain that PCA's chosen scores are uncorrelated; arbitrary perpendicular axes are not enough to guarantee that. [scikit-learn decomposition reference](https://sklearn.org/stable/modules/decomposition.html).

### Resolve contradictory explanations, not just individual sentences

The content audit should include the following specific edits:

| Area | Current issue | Required wording/behavior |
|---|---|---|
| Correlation stage 4 | A nonzero alternative is described as “significant”; the null says any observed relationship is “just random chance.” | H₀ is a population statement, ρ=0; H₁ is ρ≠0. Significance is an outcome of a test under assumptions. |
| Chi-square stage 5 | “Too large to be attributed to random chance.” | “Unusual under the independence model at the chosen threshold, assuming the test conditions hold.” |
| ANOVA recap | Severe violations make the F-statistic “completely meaningless”; repeated data “must” use one named alternative. | Distinguish the computed statistic from invalid reference inference; discuss design-appropriate repeated-measures or mixed models. |
| K-Means stage 8 | The final takeaway implies standardization is universally required, despite more careful notes elsewhere. | Explain what metric the units impose and when choosing standardized distance is appropriate. |
| PCA stages 6 and 9 | Perpendicular is presented as sufficient for uncorrelated scores; a freely rotated axis is called PC1. | Reserve PC names for the fitted eigen-directions; label arbitrary choices “candidate axis” and “perpendicular axis.” |
| QDA stage 9 | Ridge to the identity is described as moving to LDA. | Only shared-covariance shrinkage directly interpolates to the LDA model; identity ridge is a different target. [LDA/QDA reference](https://scikit-learn.org/stable/modules/lda_qda.html). |
| Bias–variance stage 7 | “Validation” prose is paired with “50% Train / 50% Test” and “Computed Test MSE.” | Use development validation labels consistently; final test remains sealed. |
| QDA stage 7 and classifier playgrounds | Test scores are presented beside settings that learners may repeatedly adjust. | Use validation for exploration; lock choices before a separate test reveal, or explicitly label a standalone fixed evaluation demonstration. |
| Polynomial regression stage 8 | Validation “proves” it works and the equation is “ready for the real world.” | Validation supports a choice; deployment also needs final evaluation, domain checks, preprocessing parity, and monitoring. |
| Ridge | “Never exactly zero” is too absolute. | Ridge does not generally create sparse solutions; exact zeros can occur in special cases. |
| Model-choice helper | Selecting variables is offered as explaining “why” and identifying important drivers. | Separate compact predictive explanations from causal identification. Fewer coefficients do not prove causes. |
| Foundation labs | Formula-generated OOB error, bias indices, or rough power may look empirically fitted. | Put “Illustrative scenario” in the immediate caption, specify assumptions, and replace with computed examples where needed. |

For leakage guidance, keep transformations fitted inside training folds, with test data excluded from model choice. [scikit-learn's common pitfalls](https://scikit-learn.org/1.5/common_pitfalls.html) is a useful reference for this rule. Match any eventual library examples to the project's chosen version.

## 7. An implementation sequence that can be reviewed in pieces

Work in batches of roughly one renderer capability plus one or two modules. Each batch must include source changes, the matching lesson edits, mobile behavior, mathematical checks, and a short before/after demonstration. Preserve stable URLs and use an opt-in migration marker such as `data-lesson-version="2"` while both shells coexist.

| Phase | Scope and dependencies | Completion gate | Rough effort, person-days |
|---|---|---|---:|
| 0 | Capture baseline; fix numerical contradictions; separate generation from validation | Validation reads files without rewriting them; corrected examples agree across prose and visual | 2–3 |
| 1 | Tokens, 33-module manifest, stage controller, rendering lifecycle, accessible control contracts | One owner for navigation/state; all modules discoverable at both widths | 6–10 |
| 2 | Pilot Simple Linear Regression, K-Means, Naive Bayes, Evaluation Metrics | Four different renderer/content families meet the same behavior and teaching criteria | 8–12 |
| 3 | Statistical methods and remaining regression pages | Source-backed arithmetic, linked tables, assumptions and uncertainty integrated | 10–16 |
| 4 | Remaining classifiers and model evaluation/selection | Selection uses validation; all controls have a clear purpose and failure case | 10–16 |
| 5 | PCA, Hierarchical Clustering, and consolidate K-Means patterns | Stable identities, reversible snapshots, scale/linkage distinctions correct | 8–12 |
| 6 | Remaining foundation/workflow lessons | Generic stage prose replaced; each simulation accurately labeled and coherent | 8–12 |
| 7 | Neural Networks and Deep Learning | Editable content source; readable mobile diagrams; causal training steps; finite playback | 6–10 |
| 8 | Cross-module QA and beginner evaluation | All 359 stages inventoried and signed off; no missing concepts or routes | 4–6 |

Total planning range: **62–97 person-days** for a thorough content-and-interaction revision, not merely a CSS refresh. This is an initial scope estimate with substantial uncertainty, particularly around extracting the compiled Deep Learning source and replacing stylized simulations. Re-estimate after the four pilots. Parallel work may reduce calendar time; this document does not initiate delegation.

### Copy-ready implementation tasks

**UX-01 — Make inventory and validation safe**

> Extract curriculum data into a pure module used by the landing page, module navigation, and validation. Include all 33 current HTML modules. Guard the write loops in `scripts/generate-foundations.mjs` and `scripts/core-modules.mjs` so imports never generate files. Separate `generate`, `validate`, and `build`. Preserve existing URLs and statistical-content checks. Prove that validate-only leaves all source hashes unchanged, and verify the same module destinations are available on desktop and mobile.

**UX-02 — Introduce a finite rendering lifecycle**

> Add an opt-in shared scheduler for the v2 lessons. It must coalesce input/resize work, paint final state immediately for reduced motion, stop at convergence of the visual transition, stop when hidden/offscreen, cancel stale transitions, and dispose listeners. Keep scientific state separate from interpolated drawing state. Pilot against `simple-linear-regression.html:2103`, `kmeans.html:1460`, and `pca.html:2669`. Compare identical dataset and model outputs before and after. Do not rewrite the statistical algorithms in this task.

**UX-03 — Keep sketch objects alive between steps**

> Refactor `study-sketch.js` so migrated scenes mount their structure once, identify marks with stable IDs, and update geometry without replacing `.sketch-art.innerHTML`. Add a scene adapter rather than converting every diagram at once. Preserve existing keyboard actions and accessible captions. First migrate Naive Bayes's count-to-posterior sequence and one Deep Learning training scene. Stop Play at the last step; make Replay explicit. Verify focus and selected state survive a step change.

**UX-04 — Give one controller ownership of the current lesson stage**

> Unify `.statml-stage-button`, reading-position detection, narrative highlights, and renderer activation behind one stage event. Integrate with `mobile-reading.js` without running the old per-page stage observer in parallel on migrated pages. Persist each stage's experiment state. In K-Means, replace repeated `setStage()` resets with explicit preset entry and a restart action. Verify top-to-bottom, reverse scroll, rapid jumps, browser back, and mobile expand/return behavior.

**UX-05 — Rewrite the foundation generator into topic-specific lesson blocks**

> Replace the common `reasoningFrame` paragraph and generic stage labels in `scripts/generate-foundations.mjs` with structured blocks: question, plain answer, miniature worked example, assumptions, practical steps, and check. Retain every substantive concept and reporting requirement. Keep static HTML and answer explanations available without JavaScript. Use the stage playbook for all ten modules. Do not optimize for a minimum word count; validate required concepts and interactions instead.

**UX-06 — Make experiments reproducible and honestly labeled**

> Move sample generation out of `foundation-module.js` drawing functions. Use explicit seed and sample identity. Resizing or opening an explanation must not change a statistic. Classify each lab as a computed fit, a known-data simulation, or an illustrative schematic and show that distinction in learner language. Replace fabricated OOB/validation claims with real calculations for a bounded toy dataset, or change the labels and lesson claims together. Correct plot orientation, axes, and units.

**UX-07 — Build the left-side explanation components**

> Add scoped components for a symbol dictionary, one-observation calculation, denominator highlight, assumption/symptom/response table, glossary disclosure, and predict-then-reveal check. Start with residuals, degrees of freedom, precision/recall, and PCA loadings. Use native HTML controls, stable layout, shared scientific state, and clear first-mention definitions. Keep hand lettering, but protect math layout and the readability of numbers.

**UX-08 — Apply the lesson-by-lesson playbook in bounded batches**

> For the selected module, complete every row in `lesson-by-lesson.md`. Record the original stage, the learner's question, its left miniature, the right-side causal interaction, retained deeper detail, and one acceptance check. Do not remove content without mapping where the concept now lives. Present a short before/after example for that module and run the mathematical and browser checks appropriate to its renderer.

**UX-09 — Make the phone experience readable**

> Introduce compact and expanded exploration modes, preserve the selected data and reading anchor across them, and recompose labels at 320–430 px. Keep touch targets around 44 px, give drag operations a non-drag equivalent, and maintain readable charts at 200% and 400% zoom. Remove per-stage height patches only after the replacement layout handles the actual content. Verify short landscape screens and sticky focus visibility.

**UX-10 — Make Deep Learning editable at the source**

> Recover or extract the current lesson content from the compiled inline React bundle into an authored content module before editing it. Preserve all twelve current chapters and document the current scientific behavior before replacing the visuals. The finished redesign must replace the current composition and scene art according to the neural scope addition above. Do not revive the older hybrid renderer. Verify extracted text, control state, active scenes, and routes against the baseline before improving the lesson content.

## 8. Verification and completion criteria

### Mathematical and content checks

Retain existing leakage protections and add checks tied to the concepts, not the current DOM implementation:

- Confusion cells total N; precision and recall use the intended denominators; zero denominators have explicit behavior.
- Regression fitted coefficients agree with the toy dataset; residuals and displayed SSE come from the same state; undefined slopes and R² are explained.
- K-Means WCSS does not increase during exact assignment/recentering for fixed data and K, subject to the declared empty-cluster policy. Restarts and metric changes are separate experiments.
- PCA eigenvalues, reconstruction, score covariance, and PVE agree; sign flips do not masquerade as changed conclusions; scaling modes are explicit.
- ANOVA SS, df, MS, and F agree; chi-square expected margins and contributions agree with the table.
- Training, validation, and test IDs are disjoint; changing a tuning control cannot read or rewrite the sealed test result.
- Every figure declares when it is illustrative, and every percentage/interval has a meaningful denominator or model assumption.
- A content ledger maps old definitions, assumptions, derivations, caveats, and worked steps to their new visible/deeper location. “Simplify” cannot mean silently deleting these.

### Interaction and visual checks

Test an initial state, changed state, extreme state, reset, stage leave/return, resize, reduced motion, keyboard use, and touch alternatives. A visual test must assert that its outcome changes correctly, not only that a button can be clicked.

Use the existing Playwright scripts as a starting point. Add a manifest-driven all-stage smoke sweep, selected meaningful model tests, and screenshot coverage of each scene family. Avoid relying on the current build's source-string regexes to establish mathematical correctness. Run focused checks after each migration, then the cross-module suite at release boundaries.

Proposed performance gates on a documented mid-range device: no idle lesson animation loop; no work from hidden scenes; input work coalesced to one scheduled paint; no attributable long task above 50 ms during ordinary controls; for a 60 Hz target, aim for most active animation frames to fit within the 16.7 ms frame budget. Use frame traces and interaction latency together—an attractive frame rate alone does not prove responsive input. Move genuinely expensive fitting to a worker if profiling demonstrates the need; discard stale worker results with a request version.

Layout coverage: 1440 desktop, 1024 and 768 transitions, 430/390/360/320 phones, short landscape, font loading/failure, text zoom, and expanded disclosures. Check text collision, focus visibility, axis units, legend consistency, chart contrast, and whether the reading position moves unexpectedly. Full WCAG conformance requires a broader audit than these checks; reduced-motion support is a product requirement here even though animation-from-interaction is an AAA criterion. [W3C criterion](https://www.w3.org/TR/wcag/#animation-from-interactions).

### Beginner review

After the pilots, observe 5–8 beginners performing concrete tasks: explain a residual, predict an outlier's effect, distinguish precision from recall, perform one K-Means iteration, and describe what PCA preserves. Ask them to explain the “why” without reading the answer. Record where they need help, whether they notice the control's effect, and whether they can find the deeper explanation. Compare against the current lesson before claiming a learning improvement.

Completion means all 33 modules and all 359 stages have a reviewed purpose, readable explanation, coherent visual state, intentional interaction where useful, retained detail, and an applicable verification result. Not every paragraph needs an animation; every animation needs an explanatory job.
