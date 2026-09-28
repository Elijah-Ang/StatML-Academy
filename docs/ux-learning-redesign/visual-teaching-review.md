# Visual teaching review and next implementation plan

Historical record of the first 28 September visual pass. See [the later storytelling and overlap repair](./visual-storytelling-review.md) for implemented follow-up work; several tasks listed as next below have now been completed.

Review date: 28 September 2026. Scope: all 33 modules and 359 reading sections. The six requested priorities contain 80 sections. Their new experiments are implemented; the remaining 27 modules have been reviewed and have the further work specified below. The existing handwritten paper presentation and comprehensive reference text remain the foundation.

This is a structured review through three perspectives—teaching, visual design, and engineering—not a claim that learner research or an independent academic peer review has taken place.

## What changed in this pass

- **Multiple regression:** a rotatable two-input prediction plane, actual vertical residuals, editable coefficients and least-squares recovery, a fixed-input slice, signed contribution waterfall, controlled confounding comparison, actual ordinary/adjusted R² with an extra noise predictor, and model-based coefficient intervals.
- **Regression and classification trees:** actual spatial partitions linked to a branching tree; root distributions; selectable legal threshold candidates and measured impurity curves; weighted child distributions; query routing; depth comparisons; fixed-tree cost-complexity pruning; row-level errors and controlled single-observation perturbations.
- **Random forest:** individual spatial partitions, before/after sample perturbation, bootstrap multiplicities, eligible OOB voters, individual predictions plus running average, paired-tree prediction agreement, ensemble prediction fields and validation mistakes, and a measured tree-count validation curve.
- **Neural networks:** input coordinates, numerical neuron contributions, distinct hidden-response maps, combined decision fields, nonlinear activation curves, log-loss curves, a computed two-output-weight loss surface, gradient directions, a fixed-origin zoomable landscape and actual update trail, reversible restricted parameter steps, full-network cycles, measured learning curves, validation errors and feature-order failures.
- **Deep learning:** a stable illustrated image with classification/box/mask outputs, a background-shortcut counterexample, tensor entry inspection, numerical convolution products and feature maps, ReLU responses, RNN state trajectories, attention arcs and value-vector aggregation, and trainable/frozen transfer regions.
- **Reading controls:** removed the cross-section visual selector everywhere, including equivalent pilot selectors. The metrics ranking section now shows ROC and PR together. Scrolling selects the section; local controls explore its idea. Logistic final-test reveal is available only in its evaluation section and cannot silently select a different visual.
- **Universe:** all 33 modules share one desktop/mobile inventory. Probability, inference, experimental design, diagnostics, forests, boosting, imbalance, evaluation and workflow lessons now occupy visible desktop positions.
- **Instructional alignment:** all 80 priority sections now have experiment instructions describing the controls and geometry actually present. A CV mini-table was corrected to say five fitted models, each withholding one fold. An omitted row is excluded from the fitted-sample leverage plot.

## Review decisions: teaching × design × engineering

| Question | Teaching objection | Design objection | Engineering constraint | Decision |
| --- | --- | --- | --- | --- |
| Should every complex subject become a 3D plot? | Extra axes can add more burden than they remove. | 3D is useful when depth actually explains the model. | Occlusion and camera changes must not alter model state. | Use 3D for two-input regression and parameter loss surfaces; use 2D for cuts, probabilities, residuals and attention values. Preserve native rotation controls where useful. |
| Should a tree just be a branching diagram? | A branch label alone does not explain what it does to observations. | Long boxes obscure the spatial action. | Node IDs, regions and predictions must agree exactly. | Show the cut in feature space together with a compact real branching tree and one highlighted route. |
| Is animation itself explanatory? | Motion without a changing quantity can imply causality or learning that never occurred. | Constant movement competes with reading. | Repeated frames waste resources; abrupt sliders feel unresponsive. | Use finite, interruptible transitions after a learner action or section change. No auto-training or endless lesson animation. |
| Is an attractive valley acceptable if it is illustrative? | A learner may infer that its height is the actual network loss. | A stock bowl looks elegant but disconnects from the computation. | Full network loss lives in more than two dimensions. | Compute a two-output-weight slice and label the fixed parameters. Show the actual restricted update; distinguish it from full-network training. |
| Should all content be shortened? | Removing assumptions and edge cases makes a beginner explanation fragile. | Large walls of text overwhelm. | Static reading must survive disabled JavaScript. | Keep a short answer, one small example and one experiment up front; retain definitions, derivations, conditions and failures in expandable depth. |
| Can a single family renderer cover every lesson? | Related sections often need different explanations. | Repeating a generic chart makes scrolling visually meaningless. | Shared geometry and model functions are valuable. | Share calculation/geometry primitives, but explicitly author each section’s visual purpose and experiment. |
| What does a correct visual require? | Every plotted mark needs a meaning and every denominator a definition. | Pretty geometry cannot excuse a misleading encoding. | The SVG and receipt can drift if separately calculated. | Compute once, draw and report from the same data object, then verify numerical identities and reading synchronization. |

## Module-by-module evaluation and next tasks

Priority: **A** = a material teaching gap; **B** = useful next enhancement; **C** = preserve with small refinements. “Next” means planned work, not an already implemented experiment.

| Module | Current assessment | Next concrete change | Calculation / acceptance condition | Priority |
| --- | --- | --- | --- | --- |
| Simple Linear Regression | Approved pilot; directly editable observations, residuals and fit explain the model well. | Retain. Add a compact left-side residual → square → total receipt if learner testing finds RSS hard to follow. | Each squared gap sums to the displayed RSS; degenerate x values remain explicit. | C |
| Multiple Linear Regression | Rebuilt in this pass. Spatial plane and conditional slice replace generic coefficient views. | Next: an optional observed-data-support overlay for correlated predictors, and prediction intervals separate from coefficient intervals. | Distinguish extrapolation from a supported conditional comparison; distinguish mean-response and individual prediction uncertainty. | B |
| Polynomial Regression | Curve fitting works; “basis” is still a set of bars rather than a feature transformation. | Show x alongside x²/x³ ribbons, then blend their signed contributions into the curve. Add a clearly shaded extrapolation region. | Same coefficients reconstruct every plotted fitted value; degree changes preserve the sample. | B |
| Regression Trees | Rebuilt: cuts, residuals, recursive regions, paths, pre/post-pruning, errors. | Next: allow selection of an internal node to inspect its own candidate-search objective, rather than only the root. | Node-local candidates use exactly the rows that reach that node; child counts sum to parent n. | B |
| Classification Trees | Rebuilt: classes have shape identity, actual Gini/search/pruning and linked regions. | Next: select a confusion cell to brush exactly its cases back into feature space; inspect internal-node class counts. | Brushed IDs and displayed denominators match the same validation predictions. | B |
| Random Forest | Rebuilt: spatial diversity, real bootstrap/OOB, averaging, agreement and measured errors. | Next: show random candidate feature sets at individual split searches and an explicit distribution-shift counterexample. | Feature-subset choices must come from stored training traces; OOB exclusions remain exact. | B |
| Gradient Boosting | Actual residual-fitting and validation curves are present; additions are still summarized with bars. | Three synchronized plots: current fit, signed residuals, next tree correction. Animate η × correction into the current function and keep a reversible round snapshot. | Fₘ(x)=Fₘ₋₁(x)+ηhₘ(x); the next learner was fit to training residuals only. | A |
| Neural Networks | Rebuilt around data fields, numerical operations, a measured loss surface and reversible training. | Next: a chain-rule microscope for one edge, additional hidden widths with fresh runs, and a deliberate lock-and-reveal final-test workflow. | Analytical edge derivatives match finite differences; unchanged edge identities stay fixed; final-test outcomes never choose settings. | B |
| Deep Learning | Rebuilt with image/task distinctions and different architecture mechanisms. | Next: learned rather than fixed convolution filters on a tiny declared dataset; explicit duplicate-group splitting; augmentation and domain-shift examples. | Label training data, fit boundaries and measured results. Do not present the current fixed filters or transfer illustration as trained image inference. | B |
| ANOVA | Group dots and two-factor interactions are useful. Several variance stages still collapse to bars. | Draw observation → group mean → grand mean segments, then corresponding squared areas. Add a computed F reference curve and tail only in the test section. | SST=SSB+SSW in the applicable design; MS denominators and F degrees of freedom agree with the receipt. | A |
| Correlation | Strong visual anchor. Scatter and centered contributions support the reading. The causal caution is still a word flow. | Preserve the scatter. Replace the causal flow with a controlled common-cause example: same raw observations, colored by the third variable, and within-group comparisons. | Mark the causal story as an assumed simulation; association alone remains insufficient. | C |
| Chi-Square Test | Counts/contributions and the reference distribution compute correctly. Counts need a more concrete visual identity. | Start with a 2×2 area mosaic; morph observed counts into expected counts while preserving row/column margins. Reveal each cell’s squared deviation contribution. | Eᵢⱼ = row total × column total / n; all contributions sum to χ². Keep small-expected-count cautions. | B |
| Time Series Analysis | Forecast origin and measured seasonal-naive errors are sound. Components share a scale that suppresses small seasonal/noise signals. | Stack aligned small multiples for observed/trend/season/noise, with a shared time cursor. Distinguish known simulation components from estimated decomposition. | Components reconstruct the simulated series; every forecast uses only observations at/before the origin. | A |
| Probability & Sampling | Independent samples and theoretical SE are computed. Repeated dots do not fully explain how a sample becomes one mean. | Animate one finite sample collapsing to one mean-dot; compare raw-observation and sample-mean distributions with shared units. Add skewed populations before teaching the CLT. | Means are recomputed from actual sampled rows; Monte Carlo variability is shown; normal-only simulation is not evidence for every CLT setting. | A |
| Confidence Intervals & Hypothesis Testing | Known-σ interval and prospective-power calculations are explicit. Repeated-use meaning of coverage is missing visually. | Show a batch of independently generated intervals crossing/missing a fixed population mean. Link null-tail shading to the p-value; keep power under a separately specified alternative. | Approximate repeated coverage approaches the declared level; do not describe the realized parameter as randomly inside an interval. | A |
| Logistic Regression | Boundary, sigmoid, loss and locked evaluation are useful. Split and coefficient scenes remain generic. | Link x-space location → signed logit → sigmoid probability → threshold decision using a persistent query; use a native number line for odds. | All stages use the same query/model; odds multipliers are not probability multipliers; final choices remain locked. | B |
| K-Nearest Neighbors | Actual neighbor selection and voting work. Distances/covariate scaling deserve more spatial emphasis. | Animate the neighbor radius to the kth point; compare the same cloud before/after fitted feature scaling; link each neighbor distance to its vote weight. | Ties, exact matches, scaling fitted on train, and weighted denominators are explicit. | B |
| Linear Discriminant Analysis | Projection and boundary are useful; covariance stages mostly reuse clouds. | Show each class center, one shared covariance ellipse, Mahalanobis rings and the discriminant projection. | Shared covariance matches the fitted pooled estimate; the projection and decision scores reconcile. | A |
| Quadratic Discriminant Analysis | The boundary changes, but class-specific covariance is not made tangible. | Separate class ellipses with eigenvector handles, then show their quadratic log-density difference; visualize shrinkage toward the pooled estimate. | Positive-definite covariance, log determinant and quadratic-form terms agree; pooled shrinkage is not mislabeled identity regularization. | A |
| Support Vector Machine | Margin/boundary and bounded SMO are present; kernel and tuning scenes are less explanatory. | Link support vectors to margin distances and hinge penalties; add a 3D lifted-feature example for an explicitly defined polynomial map alongside RBF similarity. | Do not equate an RBF kernel to that finite lift; signed scores are not probabilities; retain approximation scope. | B |
| One-R | Training-only bins and rule scoring are real; rule bars do not expose observations. | Show feature-axis bins populated by class-coded observations, majority assignment within each bin, and the same rules on held-out rows. | Boundaries, tie policy, majority labels and held-out errors come from the stored rule. | A |
| Naive Bayes | Approved pilot: evidence changes connect to log scores/posteriors. | Retain. Next add a very small joint-frequency counterexample for duplicated/correlated clues. | Work in logs; normalize posterior probabilities; explain the conditional-independence assumption. | C |
| Imbalanced Classification | Scenario rates are honestly labeled; repeated confusion bars undersell prevalence. | A population dot field with a magnified alerts sample. Change prevalence while holding sensitivity/FPR fixed, then show precision as a changing composition. | All 10,000 scenario counts reconcile; the synthetic threshold-response assumptions remain visible. | A |
| K-Means | Approved pilot: assignments, centroid means, reversible steps and scaling work well. | Retain. Add an optional non-spherical-cluster counterexample using the same assignment/mean machinery. | Lloyd steps do not increase the stated WCSS objective; initialization dependence stays visible. | C |
| Hierarchical Clustering | Real merges and dendrogram are sound, but spatial clusters and dendrogram are separate stages. | During each merge, show cluster hulls above and the corresponding new dendrogram branch below; reveal the actual linkage pair(s). | Single/complete/average/Ward use their own definitions. Ward height is the chosen ΔSSE convention, not Euclidean distance. | B |
| PCA | Projection and reconstruction are strong. Loadings and scores can be made more connected. | Link a selected row across centered feature space, the score axis and reconstructed point; make lost perpendicular distance visible. | Orthogonal projection, eigenvalues and reconstruction SSE reconcile. Variance share is not predictive-information retention. | B |
| Regression Diagnostics | Residual/Q–Q/scale/leverage and row omission are computed. Some labels need more precise conventions. | Link observed point → fitted value → residual; add standardized residuals and Cook’s-distance contours. Make an omitted case visually distinct in comparison views. | Hat values use the fitted design; standardization uses residual df and 1−hᵢᵢ. The current square-root raw residual view is not a studentized plot. | B |
| Bias–Variance & Resampling | Real repeated fits and Monte Carlo receipts; fold/replica views have useful raw material. | Fix one query and show a distribution of repeated predictions centered against the known truth; connect its spread and offset to variance and bias². | Finite-simulation estimates are labeled; no decorative universal U-shape. Every fold relearns transformations. | B |
| Model Selection & Regularization | Honest about its scope, but subset/PCR/PLS stages still use word flows with a polynomial fit elsewhere. | Use a four-feature subset lattice with measured validation loss; show Ridge/Lasso shrinkage trajectories; implement actual PCR/PLS on one declared dataset. | Match objectives, intercept treatment, scaling, effective df and data split. Never label a polynomial fit as PCR/PLS. | A |
| Evaluation Metrics | Approved pilot; ROC and PR now stay together in their corresponding section. | Retain. Next allow brushing a curve segment to highlight its newly included cases. | AUC, threshold endpoints, undefined precision, calibration bins and counts remain linked to fixed scores. | C |
| Data Leakage & Pipelines | Receipts are defensible, but most stages still display word boxes. | Draw rows as colored data tokens crossing train/holdout boundaries; a transformation vessel acquires statistics only from permitted tokens. Add a time-axis feature-availability example. | Learned means/scales/encoders use train rows only; future or outcome-derived features cannot cross the prediction-time boundary. | A |
| Missing Data & Encoding | Missing values and encodings have concrete grids; mechanism explanations revert to flows. | Show a joint data cloud before/after masking under MCAR/MAR/MNAR, then where an imputed value lands. Compare category geometry under one-hot and ordinal encoding. | Missingness mechanisms are simulated assumptions, not identified from observed data alone; unknown-category behavior is explicit. | A |
| Experimental Design | Randomized-school tiles and design-effect receipts work; protocol/threats still read as diagrams of words. | Draw students nested within schools, randomize schools as whole clusters, and show balance distributions across rerandomizations. Add interference and attrition counterexamples. | DE=1+(m−1)ICC is a simplified equal-size illustration; effective n is not a power calculation; randomization unit is explicit. | A |

## Implementation sequence

1. **Mechanisms before decoration:** ANOVA, sampling/inference, boosting and LDA/QDA. They have clear geometric quantities and existing reliable calculations. Each section should have one dominant visual action and a short readout that derives from it.
2. **Data flow as visible observations:** leakage, missingness, One-R and experimental design. Replace word-box pipelines with actual rows, masks, groups and boundaries. Keep written process order on the left.
3. **Advanced comparisons with honest models:** model selection, covariance shrinkage, kernel maps, learned image features, final-test locks and domain shift. Implement or clearly delimit the scientific procedure before drawing its outcome.
4. **Targeted polish of the successful plots:** linked brushing, locally appropriate controls, labels, coordinate support, keyboard targets, mobile layouts and interrupted animation. Keep the approved pilot character.

Avoid batch-replacing every section in a family with the same new drawing. Complete and verify one topic’s full reading sequence, then apply the underlying primitives to another topic with different visual semantics.

## Concrete implementation patterns

Current reusable pieces are in `modules/notebook/spatial.js` (geometry), `spatial-science.js` (pure calculations), and the topic controllers. Pure functions should not read the DOM. Renderers should not fit a model inside an animation frame.

### ANOVA decomposition task

Implement a pure `anovaDeviations(rows)` and test its identities before adding a painter:

```js
const pieces = rows.map(row => ({
  id: row.id,
  total: row.y - grandMean,
  between: groupMeans[row.group] - grandMean,
  within: row.y - groupMeans[row.group],
}));
// Each row: total = between + within.
// Across rows in ordinary one-way ANOVA: SST = SSB + SSW.
```

The renderer should keep the observation fixed, move only the explanatory guides, and highlight the same row in the left receipt. Squared terms need a common area scale, not arbitrary rectangle sizes.

### Sampling-distribution task

Add an explicit `sampleIndex` and finite transport step. Do not redraw random samples on resize or scroll:

```js
const samples = generateSamples({ seed, population, n, repetitions: 200 });
const means = samples.map(sample => mean(sample));
const shown = samples[state.sampleIndex];
// One event advances the sample index; only the display interpolates.
```

The individual-value and sample-mean axes should share meaningful units. Increasing n should affect SE and the computed means; a decorative animation must not stand in for actual repeated sampling.

### Boosting task

Preserve the learner round and correction from the fitted training history:

```js
const before = ensemble.predict(row, Math.max(0, round - 1));
const correction = round ? treePredict(ensemble.trees[round - 1], row) : 0;
const after = before + learningRate * correction;
```

Use that same triple for the signed arrow, outcome curve and receipt. Verify against `ensemble.predict(row, round)` on every row; never refit a learner as a side effect of plotting.

### LDA/QDA covariance task

For a positive-definite 2×2 covariance with eigensystem `(λ, V)`, transform a unit circle into an ellipse:

```js
const point = add(mu, multiply(V, [
  Math.sqrt(lambda[0]) * radius * Math.cos(theta),
  Math.sqrt(lambda[1]) * radius * Math.sin(theta),
]));
```

Label the Mahalanobis radius. If claiming a probability contour, derive its radius from the correct χ² distribution. Do not call a one-standard-deviation ellipse a 95% region.

### Section-authoring contract

Use one explicit intent per section:

```js
{
  question: "Why weight the child impurities?",
  visual: "parent-and-child-distributions",
  controls: ["candidateThreshold"],
  inspect: "one parent, the same observations in two children",
  invariant: "nLeft + nRight === nParent",
  receipt: "parentImpurity - weightedChildImpurity"
}
```

Local controls may change the experiment within that section. They must never select a visual belonging to another reading section. Native inputs, retained SVG marks and a textual receipt provide keyboard and small-screen access.

## Verification and boundaries

See `audit-evidence/visual-teaching-2026-09-28/` and `scripts/test-spatial-science.mjs` for numerical and browser evidence. The per-section inventory is in `visual-teaching-stage-review.md`.

New mathematical checks cover spatial leaf membership against tree prediction, candidate-threshold search, pruning against exhaustive subtree enumeration, classical coefficient intervals against independent NumPy/SciPy values, analytic loss gradients against finite differences, restricted gradient updates and exact OOB exclusions. The existing suite checks distribution functions, PCA/linkage, classifiers, data splits, neural gradients, convolution and attention.

Visual checks are necessary in addition to arithmetic: inspect desktop/phone screenshots, verify plots and their legends describe the same sample and objective, and test changing a control at its extremes. A layout test passing does not establish that an explanation teaches well. The next validation step should include beginner think-aloud sessions: ask a learner to predict the visual change and explain why it happened.

Current limits remain explicit: the image/task and transfer scenes are illustrations; CNN filters, RNN and attention vectors are fixed teaching examples; dropout is a fixed-mask forward demonstration; the tiny dense network is not an image recognizer. The valley fixes all but two output weights and includes their selected L2 penalty. Its coordinate origin stays fixed during restricted steps; its radius can be zoomed and expands if needed to keep the current weights in range. A full-network training step starts a new slice because the other parameters changed. A 2D slice is not the full high-dimensional optimization problem. Neural validation errors remain distinct from a final-test result. Advanced subset/PCR/PLS experiments are future work, not silently claimed as completed.

Scientific conventions were cross-checked against [scikit-learn’s pruning definition](https://scikit-learn.org/stable/modules/tree.html#minimal-cost-complexity-pruning), [Stanford CS231n’s optimization explanation](https://cs231n.github.io/optimization-1/) and [its chain-rule treatment of backpropagation](https://cs231n.github.io/optimization-2/). The implementation uses sample-weighted leaf impurity for pruning risk and keeps gradient calculation separate from parameter updates.
