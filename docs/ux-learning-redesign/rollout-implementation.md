# Notebook curriculum rollout

Historical first-rollout record. For the subsequent spatial visual rebuild, actual post-pruning implementation, reading-only visual selection and desktop-map repair, see [the current review](./visual-teaching-review.md).

The approved four-pilot design now covers all 33 modules and 359 stages. This rollout adds the remaining **29 modules / 321 stages**. The four pilot content sources remain intact; they share the updated navigation and small typography fixes.

The learner experience uses the same cream paper, handwritten headings, two-column reading/experiment layout, left-side examples, expandable depth, and mobile experiment dialog. Each new stage has a plain-language answer, a small worked table, an experiment prompt, a quick check with an answer, and retained technical reading. Approximately 35,000 words of deeper reference material remain available.

## What is implemented

| Family | Experiments and calculations |
| --- | --- |
| Statistics | Computed one- and balanced two-way ANOVA, paired correlation with point inspection, observed/expected chi-square counts and contributions, chronological seasonal-naive forecasts, independent sampling distributions, known-σ intervals and prospective power |
| Regression and selection | Polynomial and multiple-input fits, loss comparisons, coefficient/basis receipts, Ridge/Lasso, residual/Q–Q/scale-location/leverage views, omission sensitivity, development folds, bootstrap membership, repeated-fit bias/variance examples |
| Classification | Logistic probabilities/loss/ROC, threshold counts, real KNN neighbors and votes, LDA/QDA covariance estimates and likelihood scores, LDA projection, pooled covariance shrinkage, bounded SVM fitting, One-R bins, explicit rare-class rate scenarios |
| Trees and ensembles | Actual CART paths and split gains, depth comparisons, bootstrap forests, eligible out-of-bag voters, squared-loss boosting corrections and measured training/validation curves |
| Unsupervised learning | PCA loadings/scores/reconstruction/variance, candidate-axis rotation, exact hierarchical merges, linkage comparisons, dendrogram cuts |
| Workflow | Train-only versus leaked transformation receipts, missingness assumptions, encoding and unknown categories, nested-selection diagrams, randomized school assignments, design effect and effective sample size |
| Neural networks and deep learning | Rebuilt SVG scenes; actual 2→3→1 forward/loss/gradient/update computation, rewindable training, validation curves, activation functions, fixed-mask dropout demonstration, convolution window/products, recurrent state, attention softmax/context, tensor shapes, transfer-region and input-contract diagrams |

Neural Networks and Deep Learning load the new notebook engine. The legacy compiled React/canvas/sketch renderers are no longer loaded by these pages.

## Scientific boundaries

- Training, validation and final-test IDs remain separate. Logistic Regression has an explicit one-time lock-and-reveal action; its model, threshold and dataset controls lock together.
- PCA variance is not labeled retained predictive information. QDA pooling toward a shared covariance is distinguished from an identity ridge.
- Forest OOB votes use only trees that omitted the inspected row. Boosting curves come from actual fitted learners.
- The neural optimizer calculates all gradients before any simultaneous parameter update. Backpropagation and the optimizer remain distinct.
- Architecture, transfer, pipeline and protocol diagrams are labeled as illustrations. There is no fabricated image-classifier accuracy, transfer-learning performance, or cluster-trial power.
- The imbalance example states its assumed sensitivity/false-positive-rate response. It is a scenario, not measured classifier performance.
- The SVM uses a bounded deterministic SMO solver and is described as an approximation. Its signed score is not presented as a calibrated probability.
- Some advanced concepts retain explanatory rather than fully fitted experiments: PCR/PLS comparisons, exhaustive subset search, cost-complexity post-pruning, and full cluster-trial power. Their scope is stated beside the visuals.

## Authoring and runtime

- lessons/expanded/answers.txt: all 321 beginner answers, mini tables, questions and solutions.
- lessons/expanded/reference.json: curated deeper explanations and original section anchors.
- lessons/expanded.mjs: assembles complete static lessons.
- modules/notebook/catalog.js: explicit stage-to-scene mapping.
- modules/notebook/science.js: deterministic pure calculations.
- Seven family controllers share lab.js, ui.js, lesson.js and the approved stylesheet.
- Engines load on demand. SVG nodes and native controls persist. Finite transitions settle when idle and respect reduced motion; resizing and scrolling do not resample or retrain.
- All module pages and the homepage provide a static directory linking all 33 topics.

Run npm run generate:all after editing authored lesson data. The generate:pilots and generate:notebooks commands remain available separately. The foundation generator delegates to the notebook generator, so it cannot accidentally restore the old foundation layout. Extraction/curation scripts are historical migration helpers; the curated JSON is now an authoring source.

## Verification

- npm test: content/local-link checks; four-pilot mathematics and browser regressions; independent scientific fixtures; extended browser sweep; focused Logistic lock; state, focus and motion tests.
- Four pilots: all **38 stages at eight widths**.
- Remaining modules: all **321 stages at five widths** (1440, 1024, 768, 430, 320), **1,605 stage/viewport combinations**.
- Every native control exercised; no runtime errors, nonfinite SVG geometry, clipped SVG text, page overflow, or mobile-dialog overflow in the sweep.
- All 29 new modules checked with JavaScript disabled.
- All 29 checked for retained SVG identity, stable scientific state on resize, keyboard focus, mobile return, finite idle frames, reduced motion, and expanded-reference layout at 320px.
- Neural gradients checked by finite differences; distribution functions and PCA/linkage checked against NumPy/SciPy fixtures; SVM scores checked against independent SVC results.
- Shared-paper checks: all 34 pages at desktop and phone widths.
- Navigation/rotation: all 33 lessons, mobile constellation links and touch controls.
- Final production build validates and copies 34 pages.

Evidence is in audit-evidence/rollout-2026-09-28/, including the pre-change archive, content hashes, browser reports, interaction report and screenshots. A few clipped ticks, an overcrowded fold diagram, and a wide code block found during verification were repaired.

Independent documentation consulted: [SciPy ANOVA](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.f_oneway.html), [scikit-learn LDA/QDA mathematics](https://scikit-learn.org/stable/modules/lda_qda.html), and [scikit-learn SVM mathematics](https://scikit-learn.org/stable/modules/svm.html). Stored fixtures allow the Node test suite to run without a Python/SciPy installation.
