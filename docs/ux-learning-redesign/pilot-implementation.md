# The four notebook pilots

Implementation · 27 September 2026

The first implementation covers **38 stages**: Simple Linear Regression (8), K-Means (9), Naive Bayes (12), and Evaluation Metrics (9). Their existing URLs remain the entry points. This is a bounded first batch; the remaining modules retain their existing interface.

## What changed

The four pages now share a paper notebook layout: short question-led explanations on the left; one persistent, interactive SVG on the right; small calculation receipts beside the text; expandable derivations, assumptions and checks. The warm paper, hand lettering, restrained pen colors and small numbered stage markers retain the handwritten character. Quantitative geometry remains exact.

A single reading-position controller updates the lesson map, active stage and visual. It handles reverse scrolling and reaching the last stage at the bottom of a page. Scrolling changes the view without rerunning a model. On narrow screens the visual opens from a compact summary into a native dialog, then returns the same DOM, model state, focus and reading position to the lesson. Native selectors provide alternatives to clicking plotted marks.

SVG marks keep stable keys. Finite, interruptible transitions animate fitted lines, centroids and posteriors; direct slider input updates immediately. Switching an idea gets a brief opacity transition. There is no permanent animation loop. Reduced motion commits the final view immediately, and hidden-tab handling finishes transitions and pauses algorithm playback. K-Means Run stops at convergence rather than looping forever.

## Where to work

| Responsibility | Source |
|---|---|
| Authored explanations, receipts, deeper material and checks | `lessons/pilots.mjs` |
| Static page generation | `scripts/generate-pilots.mjs` |
| Shared layout and handwritten styling | `modules/notebook/notebook.css` |
| One lesson controller; mobile dialog and focus | `modules/notebook/lesson.js` |
| Keyed SVG marks, finite transitions, native control helpers | `modules/notebook/ui.js` |
| Deterministic, pure calculations | `modules/notebook/models.js` |
| Regression, clustering, Bayes and metrics views | `modules/notebook/{regression,clustering,bayes,metrics}.js` |
| Mathematical and generator checks | `scripts/test-notebook-models.mjs` |
| All-stage responsive and interaction checks | `scripts/test-notebook-browser.mjs` |

Author content in `lessons/pilots.mjs`, then run `npm run generate:pilots`. Generated HTML contains every explanation and answer, including useful default numerical examples. Do not edit the generated page in isolation.

The older regression and K-Means inline renderers and the Naive Bayes sketch board are no longer loaded by the pilots. Deep Learning still uses the existing sketch runtime until its separate reconstruction. Evaluation Metrics no longer uses the synthetic threshold-to-metric formula in `foundation-module.js`; the other foundation lessons still use their current runtime.

## Content and interaction ledger

| Pilot / original stage | Preserved teaching and new place to inspect it |
|---|---|
| Regression 1 · editable reality | Editable five-row dataset, point selection, feature/target/observational-unit explanation, association versus causation. |
| Regression 2 · guess | Independent slope and intercept controls; equation, units, hat notation and intercept limits. |
| Regression 3 · residuals | Selected actual → predicted → signed residual receipt; vertical versus perpendicular distance. |
| Regression 4 · penalty | Cancellation example, SSE versus MAE, squared units and outlier sensitivity; proportional error tiles with explicit clipping note. |
| Regression 5 · least squares | Means, cross-products, denominator, slope, intercept; normal-equation explanation and identical-x degeneracy. |
| Regression 6 · optimum | Trial-versus-fit SSE, finite fit animation, the exact training promise, mean-point and residual-sum properties. |
| Regression 7 · scorecard | SST baseline, fitted SSE, R² and RSE; degrees of freedom, constant-y undefined case, diagnostics and distinct interval meanings. |
| Regression 8 · playground | Prediction input, both line predictions, observed range and extrapolation notice, independent evaluation and reporting. |
| K-Means 1 · unlabeled data | Stable synthetic customers; raw measurements available through a selector and point inspection; clustering is not a discovered ground truth. |
| K-Means 2 · initialization | Named Forgy initializer, stable seed and explicit new start; distinction from K-means++ and random partitions. |
| K-Means 3 · assignment | Every selected point’s exact squared distance to each center; consistent tie rule and same-center assignment phase. |
| K-Means 4 · recentering | Mean update, exact committed snapshot, finite centroid motion, explicit retain-empty-center policy. |
| K-Means 5 · convergence | Reversible saved phases, one-shot Run/Pause, monotone WCSS and local-minimum caveat; scrolling preserves the run. |
| K-Means 6 · WCSS | Selected point contribution and total; dependence on K, sample size, features and distance units. |
| K-Means 7 · elbow | Real fits for K=1…6 with five deterministic starts each; selectable K; stability/silhouette/domain limitations. |
| K-Means 8 · scaling | Same customers under raw-unit or z-score distance; axes remain original units; no universal standardization claim. |
| K-Means 9 · limitations | Explicit outlier and curved-moon stress tests; alternative-method context, fitted transformations and reporting. |
| Bayes 1 · examples | One consistent 40/60 training class count and prior. |
| Bayes 2 · features | Inputs versus target; present, absent and ignored are distinct operations. |
| Bayes 3 · split | Training, development validation and sealed final test; preprocessing leakage and dependence-aware splits. |
| Bayes 4 · variants | Interactive Bernoulli/count/category/density representations; email arithmetic remains explicitly Bernoulli. |
| Bayes 5 · likelihood | Actual class counts for all three named words; likelihood denominator versus posterior denominator. |
| Bayes 6 · independence | A deliberately duplicated feature demonstrates redundant evidence; conditional versus unconditional independence. |
| Bayes 7 · posterior | Prior × each selected likelihood → unnormalized scores → normalization, all tied to the same counts and α. |
| Bayes 8 · continuous | Separate, labeled two-group plant-height density example; means/SDs, density versus probability and equal priors. |
| Bayes 9 · numerics | Unseen unicorn feature, zero smoothing, α smoothing and stable log-space normalization; distinction between smoothing and logs. |
| Bayes 10 · validation | Five selectable folds and whole-pipeline refitting; no invented validation performance. |
| Bayes 11 · action | Live threshold changes the message decision without changing its posterior; precision/recall/cost/calibration explanation. |
| Bayes 12 · synthesis | Baseline use, assumptions, drift, rare features, full workflow and reporting. |
| Metrics 1 · problem | Consequences before metric choice; fixed illustrative validation sample and clearly bounded claims. |
| Metrics 2 · intuition | Accuracy, precision, recall, specificity and F1 denominators; MAE/RMSE mini example and MAPE caveat. |
| Metrics 3 · worked example | TP80/FN20/FP90/TN810 at 0.50; live count receipts and inspection of contributing cases; all-negative baseline. |
| Metrics 4 · reasoning | Actual ROC and PR curves at all distinct score thresholds; selected operating point; AUC, prevalence and ranking-versus-calibration. |
| Metrics 5 · laboratory | Threshold, exact confusion counts, alert workload and adjustable FN/FP cost receipt from fixed predictions. |
| Metrics 6 · failures | Representativeness, label quality, leakage, prevalence shift, subgroup and dependence caveats; undefined precision explicitly shown. |
| Metrics 7 · workflow | Define → develop → lock → test, with fold-safe preprocessing and appropriate uncertainty/resampling. |
| Metrics 8 · reporting | Brier and log loss from all rows; five-bin calibration plot, bin counts, inspectable bin values and calibration limitations. |
| Metrics 9 · checks | Five interactive questions plus static answers, explanation prompt and evaluation-chain synthesis. |

## Validation and review

`npm test` includes statistical/source validation, pure-model checks, the notebook browser suite and the existing Logistic Regression browser regression. `npm run test:sketch` retains the legacy Deep Learning and Neural Networks checks; migrated Bayes is exercised in the notebook suite. `npm run test:paper` checks the broader theme, and `npm run test:mobile` covers existing mobile navigation and rotations.

The notebook browser suite checks every stage at 1440, 1024, 900, 768, 430, 390, 360 and 320 CSS pixels, then exercises edited data, undefined regression slopes, exact fit arithmetic, reversible clustering, convergence, Bayes evidence semantics, threshold extremes, sample immutability, retained mark identity and focus, mobile return, no-script reading, reduced motion and settled animation frames. Optional `NOTEBOOK_SCREENSHOTS` captures review images. Short landscape and open explanations are also part of visual review.

The pre-implementation sources and their hashes are retained in `audit-evidence/pilots-2026-09-27/before.zip` and `before-hashes.json`. The archive is a recovery reference, not a second site to ship. Validation imports no longer have generator side effects. The foundation generator explicitly hands the metrics page to the new pilot generator, so regeneration cannot restore the previous lab.

These are implementation and browser checks, not evidence of improved learner outcomes. The next review should use the plan’s beginner tasks to assess comprehension and discover where people still need guidance.

## Verified results

Completed on 27 September 2026:

- `npm test` passed: source/content validation, model fixtures, the complete eight-width notebook sweep and the Logistic Regression regression checks.
- `npm run test:pilots` passed again after refining the elbow/calibration controls: all 38 stages at eight widths, with no browser errors or clipped plot labels.
- A final focused browser run passed after improving nearest-point selection for overlapping touch targets. It exercises pointer selection in the dense customer cloud as well as the full interaction assertions and 390px lesson sweep.
- `node scripts/test-study-sketch-browser.mjs` passed for the existing Deep Learning scenes and Neural Networks controls.
- `node scripts/test-paper-notes-browser.mjs` passed for all 34 pages at desktop and phone widths.
- `node scripts/test-mobile-navigation.mjs` passed the universe navigation, all module links, touch controls and all 33 module rotations.
- `npm run build` passed and refreshed the production output after the final source change.

The calibration view now shows Brier score, log loss, sample count and a native bin inspector. Matrix-only controls are hidden there. The elbow view shows the best WCSS found for the selected K, uses integer K ticks and hides the stepper for the separate single-run experiment. Scientific state remains intact when switching views.

Review captures and the eight-width report are in `audit-evidence/pilots-2026-09-27/screenshots/`. The local preview runs at `http://127.0.0.1:8137/`; the four existing module URLs load the pilots. This work has not been published remotely.
