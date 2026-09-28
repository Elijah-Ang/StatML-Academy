# Visual storytelling and overlap repair

28 September 2026 · follow-up to the screenshot feedback

This pass repairs the reported overlaps, checks every reading section, and strengthens the visual explanation in the weakest scenes. The handwritten paper, scroll-led structure and comprehensive reference text remain. The review used three simulated perspectives: a data-science professor, a UI/UX engineer, and a beginner who benefits from explicit visual scaffolding. These are design reviews, not real learner research.

## What was wrong

The original geometry checks detected labels outside an SVG but did not detect labels intersecting inside it. A new audit examined visible text bounding boxes across all 33 modules and 359 sections. Its initial desktop/phone scan found 170 candidate intersections in 139 section/viewport cases. Some were small axis-corner collisions; others were the complete overprinted labels in the screenshots.

The screenshot defects had three distinct causes:

| Screenshot | Cause | Implemented repair |
| --- | --- | --- |
| ANOVA interaction | An extra setting legend occupied the y-axis-title band. | Keep the clearly labeled external setting legend; remove the duplicate in-plot text. |
| Neural hidden maps | Combining arrows crossed the sentence and next plot's axis title. | Replace that band with an actual numerical bridge: activation → signed weighted contribution → sum → sigmoid probability. |
| Forest comparisons | Every mini-map repeated its axes under its panel title; successive rows were too close. | Use panel-title bands and one shared axis explanation; reserve separate experiment and aggregation bands. |

Other repairs include endpoint tick alignment, more space between wrapped captions, multiple-regression headings, confusion-matrix headings, candidate-search footers, and the separation between a tree's data map and its root label. A 44-pixel hit target is now invisible; its smaller gold selection ring no longer crowds neighboring annotations. The hit target remains available for touch and keyboard interaction.

## Reviewer discussion and decisions

| Question raised | Teaching judgment | Implemented design response |
| --- | --- | --- |
| “What is one dot: a person or an average?” | A sampling distribution needs a visible change of unit. | Show an actual selected sample, its calculated mean, and that same mean in the repeated-sample cloud. Both plots use the same outcome-to-position scale. |
| “Does 95% mean this particular line has a 95% chance?” | Coverage describes repeated use under a model. | Generate 40 independent intervals against a fixed true effect. Show this batch's actual coverage count and mark misses with crosses as well as color. |
| “Why do these red/blue maps mean different things?” | Hidden response is not class probability. | Use a signed activation scale, retain distinct probability colors, and explicitly show the operation connecting them. |
| “How did these neighbors vote for this answer?” | All selected neighbors must contribute, with the correct denominator. | Show every selected neighbor, distance, normalized weight and class contribution; the strip totals reconcile to the model prediction. |
| “Why are LDA and QDA different if both show two clouds?” | The fitted covariance assumption must be visible. | Plot actual fitted contours and then recenter them on zero, revealing a shared shape or separate shapes. QDA pooling visibly brings the shapes together. |
| “What does the next boosting tree repair?” | Its training targets are residuals from the previous model. | Use three aligned plots: previous fit, residual targets and their small tree, updated fit. One selected row has exact addition arithmetic. |
| “What crossed the train/test boundary?” | A process box conceals which observations were used. | Draw concrete observation tokens, a fitting boundary, a saved mean, and the holdout's permitted or forbidden path. |
| “Does randomization guarantee balance?” | Randomization makes groups comparable on average, not in every realized sample. | Show schools containing pupils and actual baseline comparisons; state the average-case interpretation. |

Keep finite transitions after deliberate actions. Do not run an endless animation while the learner reads. Native controls have local effects; scrolling chooses the section. The removed “Explore a view” selector stays removed.

## Implemented visual teaching changes

| Module(s) | New or revised teaching scene | What stays numerically grounded |
| --- | --- | --- |
| ANOVA | Selected score → group mean → grand mean, colored distance segments, aggregate squared-distance partition. | Each signed deviation reconciles; total SS equals between SS plus within SS over the sample. Cross-term cancellation is explained at sample level. |
| Probability & Sampling | An actual sample becomes one mean; 200 means sit below individuals on a shared scale; inspect any sample. | Every mean comes from its sampled observations. All generated values fit the scale; stacked marks stay inside their plot. Increasing n visibly reduces mean dispersion. |
| Confidence Intervals & Hypothesis Testing | Repeated coverage against a fixed truth; separate observed-estimate and planned-alternative controls. | Exact normal known-σ intervals and prospective power. Changing an observed estimate cannot silently change the planned alternative. Power and coverage sections have their own relevant readouts. |
| Time Series | Four aligned plots for observed values, trend/level, season and remainder. | Components add back to each observed value. Separate vertical scales and known simulation components are explicitly stated. |
| Multiple Regression | More space for the plane, its heading and R² comparisons. | Existing fitted plane, conditional slices, scores and intervals are retained. |
| Regression Trees / Classification Trees | Clear map/tree handoff, separated comparison titles, search and confusion annotations. | Existing thresholds, leaf values, candidate costs, pruning and predictions are retained. |
| Random Forest | Legible before/after small multiples, shared axes, experiment band and aggregation band. | The initial zero perturbation explicitly means identical samples; individual tree fractions and the forest average remain computed. |
| Neural Networks | Distinct scene for one input's different incoming weights; hidden response maps → weighted products + bias → sigmoid; direct observation inspection. | The slopes use actual incoming weights. Weighted contributions reconcile to the actual score. Selected observations exclude sealed test data. |
| Deep Learning | Clear signed response and probability semantics; fixed-mask contribution explanation; stable geometry when toggling evaluation/masked modes. | Dropped units contribute zero; retained responses scale by 1.5. The fixed-mask demonstration remains a forward-pass illustration, not a claim of stochastic dropout training. |
| Neural loss / activations | True inspected activation range; named downhill −∇L direction; fixed-hidden-feature loss-slice scope. | An activation outside ±4 is plotted at its true coordinate. The two-output-weight surface is convex conditional on fixed features, not a claim about the full network loss. |
| kNN | All-neighbor voting strip followed by a complete responsive neighbor breakdown. | Uniform, inverse-distance and exact-match conventions match the fitted model; positive contributions sum to the vote share. |
| LDA / QDA | Fitted centers and covariance contours; centered shape comparison; local Mahalanobis-radius control. | Contour points satisfy the fitted quadratic form. LDA shares covariance; fully pooled QDA shares shape. No unsupported 95% interpretation is attached. |
| Model Selection | Correctly scoped unpenalized AIC/BIC scorecards. | A separate OLS candidate supplies RSS. Parameter count includes residual variance. Scores do not change with penalties selected in other sections. |
| Data Leakage & Pipelines | Feature-availability timeline, row tokens and holdout barrier, before/after centering, explicit nested-fold tokens. | Training-only fitted values and outer holdout isolation; future information remains unavailable at prediction time. |
| Missing Data & Encoding | Concrete masked-observation clouds and conditional missingness, alongside the existing data/encoding grids. | Mechanisms are declared simulations. Values hidden in a real study are shown only because this toy simulator knows them. Imputation counts use contributing rows. |
| Experimental Design | School buildings containing pupils, actual baseline comparison, estimand and attrition illustrations. | Randomization unit is explicit; rendered pupils match school count × class size. Illustrative outcomes are labeled and are not treated as estimated effects. |

The other modules were included in the full spacing/scroll audit and retain their current diagrams. This pass does not claim every section has been given a new bespoke illustration. Richness is useful when it explains a mechanism; the successful scatter, projection, clustering and metric plots do not need decorative replacement.

## Authoring pattern for the next visual

Start with the same concrete observation across adjacent sections. Make one visible operation dominant. Name what each mark means. Put the result beside the operation, and make the receipt use the same computed object.

```js
let next = caption(surface, "question", question);
next = caption(surface, "meaning", "One dot = one sample mean", next + 8);
const plot = frame(surface, "means", {
  x: 47, y: next + 24, w: surface.w - 75, h: 120,
}, outcomeDomain, [0, 1], ["Outcome units"], false);
// Reserve bands around the plot. Do not put a second title at plot.y - 10.
// Coordinates, arithmetic, metrics and text come from the same model object.
```

Shared layout primitives live in `modules/notebook/spatial.js` and `ui.js`. Topic-specific scenes remain in their own renderers, including the new statistics, boosting and workflow scene files. Section instructions live in `lessons/story-prompts.mjs` and `lessons/workflow-prompts.mjs`; they are generated into the readable HTML.

## Verification and remaining boundaries

The reproducible evidence is in `audit-evidence/visual-storytelling-2026-09-28/`. See its `verification.md` for final command results. Automated geometry checks use visible SVG text boxes, a two-CSS-pixel intersection threshold and a small subpixel clipping tolerance. They supplement, rather than replace, screenshot inspection of arrows, shapes, color semantics and hierarchy.

New tests cover exact weighted votes, independent OLS criterion arithmetic, 7,020 covariance-contour identities, shared sampling coordinates, observation containment, interval construction, separate power inputs, ANOVA sums, component reconstruction and boosting updates. Existing tests cover scroll synchronization, mobile return, native controls, retained geometry, rewind, reduced motion, idle behavior, disabled JavaScript and sealed final tests.

The stronger diagrams still use declared teaching datasets. Image-task/transfer scenes and fixed convolution filters are not newly trained vision models. Actual testing with learners who have different accessibility needs remains the appropriate next source of evidence for comprehension, reading load and preferred pacing.
