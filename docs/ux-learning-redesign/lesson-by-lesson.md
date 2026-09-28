# Every module, every lesson stage

27 September 2026 · 33 modules · 359 stages

Each row is a concrete authoring and interaction task for an existing stage. Current titles are retained here for traceability; replace generic headings with the learner question when implementing. Numbers are one-based reading order. Deep Learning currently uses zero-based `data-step` internally; adapt that index explicitly.

The proposed left-side miniature explains one small relationship. The right-side interaction should expose the larger mechanism. Reuse the same scientific state when both show the same example. Keep definitions, derivations, assumptions, failure modes, and reporting details in the visible explanation or an accessible deeper section; use a content ledger to verify preservation.

For every row, also verify a useful initial state, a changed state, keyboard/touch operation, reduced motion, readable phone labels, and stable state after resize and navigation. An interaction may be a short prediction, a selected highlight, or a worked-step reveal; not every stage needs another slider.

Implementation order and shared infrastructure are in [the main plan](./README.md); exact proposed code is in [implementation examples](./implementation-examples.md).

| Module | Stages |
|---|---:|
| [Analysis of Variance (ANOVA)](#anova) | 16 |
| [Correlation](#correlation) | 10 |
| [Chi-Square Test of Independence](#chi-square) | 7 |
| [Time Series Analysis](#time-series-analysis) | 10 |
| [Simple Linear Regression](#simple-linear-regression) | 8 |
| [Multiple Linear Regression](#multiple-linear-regression) | 9 |
| [Polynomial Regression](#polynomial-regression) | 8 |
| [Regression Trees](#regression-trees) | 16 |
| [K-Means Clustering](#kmeans) | 9 |
| [Hierarchical Clustering](#hierarchical-clustering) | 9 |
| [Principal Component Analysis (PCA)](#pca) | 10 |
| [Logistic Regression](#logistic-regression) | 10 |
| [K-Nearest Neighbors (KNN)](#knn) | 14 |
| [Linear Discriminant Analysis (LDA)](#lda) | 15 |
| [Quadratic Discriminant Analysis (QDA)](#qda) | 10 |
| [Classification Trees](#classification-trees) | 15 |
| [Support Vector Machines — Separate classes with breathing room](#support-vector-machine) | 14 |
| [One-R](#one-r) | 12 |
| [Naive Bayes](#naive-bayes) | 12 |
| [Bias-Variance Trade-Off & Resampling](#bias-variance) | 12 |
| [Model Selection & Regularization](#model-selection) | 12 |
| [Neural Networks](#neural-networks) | 19 |
| [Deep Learning](#deep-learning) | 12 |
| [Probability & Sampling Distributions](#probability-sampling) | 9 |
| [Confidence Intervals & Hypothesis Testing](#confidence-hypothesis-testing) | 9 |
| [Evaluation Metrics](#evaluation-metrics) | 9 |
| [Data Leakage & Pipelines](#data-leakage-pipelines) | 9 |
| [Regression Diagnostics](#regression-diagnostics) | 9 |
| [Random Forest](#random-forest) | 9 |
| [Gradient Boosting](#gradient-boosting) | 9 |
| [Missing Data & Encoding](#missing-data-encoding) | 9 |
| [Imbalanced Classification](#imbalanced-classification) | 9 |
| [Experimental Design & Randomisation](#experimental-design) | 9 |

<a id="anova"></a>

## Analysis of Variance (ANOVA)

Source: [anova.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html>) · 16 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Raw Data](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1173>) | Why do scores differ even within one method? | Three students, their group, and their score. | Select a row to highlight the same dot; distinguish individual scores from group means. |
| [02 · The Research Question](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1184>) | Is the gap large compared with ordinary variation? | Same mean gap with small versus large within-group spread. | Adjust signal or noise separately with a fixed seed; keep the other quantity constant. |
| [03 · The Rules of the Game](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1216>) | Which assumptions support this comparison? | Assumption → visual symptom → appropriate response. | Switch between unequal spread, outlier, and repeated-student examples; state that design cannot be diagnosed from a plot alone. |
| [04 · Variance Decomposition](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1238>) | Where does total variation come from? | One observation's distance to its group mean and the grand mean. | Reveal within-group and between-group squared distances in sequence; show their sum with correct weighting. |
| [05 · The F-Statistic](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1256>) | Why divide one mean square by another? | A two-row MS-between / MS-within comparison. | Link each term of F to its visual component; compare a null-like and separated-groups scenario. |
| [06 · Degrees of Freedom](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1267>) | Why are only some values free? | Two editable numbers, a fixed total of 30, and computed third number. | Correct 8 + 15 + 7; transfer the constraint to k−1 and N−k using group counts. |
| [07 · A Worked Example](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1297>) | How do the numbers produce F? | SS → df → MS → F arithmetic receipt. | Step through the displayed dataset calculation; synchronize the worked values with the current preset. |
| [08 · Reading the ANOVA Table](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1324>) | How do I read an ANOVA table? | Column glossary with SS, df, MS, F, and p. | Focus or tap a table cell to highlight its geometric meaning; keep explanations available without hover. |
| [09 · How Big Is The Effect?](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1339>) | Does a small p-value mean a large effect? | Same effect size under two sample sizes. | Link eta-squared to the variance partition; separate association, uncertainty, and causal interpretation. |
| [10 · Post-Hoc Testing](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1365>) | Which groups differ? | Three pairwise differences with intervals. | Reveal adjusted pairwise comparisons together; show the multiplicity family and avoid an automatic unadjusted t-test sequence. |
| [11 · Enter Two-Way ANOVA](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1382>) | Why add a second factor? | A 3 × 2 design grid. | Select a method–sleep cell and reveal its observations; preserve the distinction between factors and outcomes. |
| [12 · Cells & Marginal Means](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1401>) | What is a marginal mean? | Cell means, row means, column means, and weighting. | Trace a selected average from its cells; flag that equal averaging here assumes the balanced teaching design. |
| [13 · The Interaction Effect](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1460>) | What does an interaction mean? | Difference of differences with a concrete numeric example. | Move from parallel to nonparallel lines; crossing is optional, and observed patterns alone do not establish significance. |
| [14 · Building the ANOVA Table](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1484>) | How is two-way variation partitioned? | Method / sleep / interaction / residual contribution ledger. | Add one component at a time; retain clear balanced-design assumptions behind the decomposition. |
| [15 · Reading the Two-Way Table](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1534>) | What should I read first in the output? | Interaction, then conditional comparisons, then qualified main effects. | Select output rows to highlight relevant lines and cells; remove claims that crossing alone confirms a population interaction. |
| [16 · Caveats & Recap](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/anova.html:1555>) | When should I choose a different analysis? | Design/variance condition → suitable method family. | Run a short scenario choice; distinguish invalid reference inference from an uncomputable F statistic. |

<a id="correlation"></a>

## Correlation

Source: [correlation.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/correlation.html>) · 10 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Raw Data](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/correlation.html:903>) | What makes observations paired? | One student's two measurements and units. | Link a table row to its point; intentionally swap a pair to show why row identity matters. |
| [02 · Direction and Form](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/correlation.html:927>) | What do direction and form tell us? | Positive, negative, and curved mini scatterplots. | Select a pattern while preserving axes; name linear versus non-linear association before showing r. |
| [03 · Measuring Strength: r](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/correlation.html:938>) | What does r measure? | Sign versus magnitude in two short rows. | Change noise with the same underlying points; keep slope and r conceptually distinct. |
| [04 · Formal Hypotheses](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/correlation.html:963>) | What is the null about? | Sample r versus population rho. | Predict whether a sample can have nonzero r when population rho is zero; replace the significant-alternative wording. |
| [05 · How it works: Covariability](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/correlation.html:981>) | Why multiply deviations from the means? | One row with x−mean(x), y−mean(y), and their product. | Brush each quadrant and accumulate signed contributions; link the denominator to scaling rather than unexplained normalization. |
| [06 · Assumptions: Paired & Linear](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/correlation.html:1000>) | Can r miss a strong pattern? | A straight cloud versus a U-shaped cloud. | Toggle the U-shape and reveal near-zero r; do not call this absence of all dependence. |
| [07 · Robustness Check: Outliers](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/correlation.html:1018>) | Why can one point change r so much? | Before/after r with the outlier's contribution. | Move one selected point using drag or numeric inputs; retain a ghost of its original location. |
| [08 · The Inferential Result](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/correlation.html:1028>) | What does the test result mean? | r, interval, n, p, and their distinct questions. | Step through the null reference and report; define inference assumptions separately from calculating descriptive r. |
| [09 · The Golden Rule: Causation](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/correlation.html:1055>) | Why does association not establish cause? | A three-node common-cause sketch. | Reveal temperature as a shared cause of two measures; require an association-only conclusion. |
| [10 · Limitations & Summary](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/correlation.html:1069>) | Which correlation should I use? | Pearson / Spearman / neither, with conditions. | Classify linear, monotonic curved, and U-shaped examples; give corrective feedback rather than a blanket switch rule. |

<a id="chi-square"></a>

## Chi-Square Test of Independence

Source: [chi-square.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/chi-square.html>) · 7 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Raw Counts](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/chi-square.html:1313>) | Why use counts instead of averages? | Four people allocated to four mutually exclusive cells. | Select a person and highlight their table cell; distinguish observed counts from percentages. |
| [02 · Hypotheses & Marginals](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/chi-square.html:1324>) | What does independence predict? | Marginal totals and a common conditional proportion. | Lock margins and compare tables with different association patterns. |
| [03 · Expected Counts](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/chi-square.html:1343>) | Why multiply row and column totals? | 30 Art students × 25/50 apple share = 15. | Highlight each denominator and margin as the expected cell fills; reveal the other cells only after a prediction. |
| [04 · Residuals & Contributions](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/chi-square.html:1452>) | Why square and divide by expected count? | Observed → residual → square → contribution. | Select a cell and link its signed residual with its nonnegative contribution; sum unrounded values. |
| [05 · The Reference Distribution](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/chi-square.html:1498>) | How unusual is the statistic under independence? | Statistic, df, alpha, and right-tail area. | Move a hypothetical statistic along the reference curve; replace the claim that chance has been ruled out. |
| [06 · Reading the Output](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/chi-square.html:1510>) | What can I conclude from the output? | Evidence / association size / direction / causation, each separate. | Link the report to residual signs and effect size; mark descriptive size conventions as context dependent. |
| [07 · Assumptions & Caveats](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/chi-square.html:1623>) | When is the approximation unsuitable? | Expected counts, independent units, and sparse-table alternatives. | Inspect a sparse-count case and choose exact or simulation-based inference where appropriate; keep the original observed data visible. |

<a id="time-series-analysis"></a>

## Time Series Analysis

Source: [time-series-analysis.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/time-series-analysis.html>) · 10 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Raw Data & The Question](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/time-series-analysis.html:972>) | Why does row order matter? | Two neighboring months and their dates. | Compare chronological and shuffled views of the same data; explain what temporal relationships shuffling breaks. |
| [02 · The Time Plot](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/time-series-analysis.html:1006>) | What should I notice before modeling? | Trend, recurring pattern, and unusual point thumbnails. | Tap or focus a date to pin its value; highlight time windows without requiring a hover. |
| [03 · Decomposing the Pattern](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/time-series-analysis.html:1016>) | How do components add up? | One month's trend + seasonality + remainder. | Toggle components on the same scale; label these as known simulation components, not estimated decomposition. |
| [04 · The Assumption of Stationarity](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/time-series-analysis.html:1040>) | What stays stable in a stationary process? | Mean, variance, and lag covariance definitions. | Compare drifting mean and changing variance separately; use a reading window without implying it proves stationarity. |
| [05 · Fixing It: Differencing](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/time-series-analysis.html:1056>) | What does differencing actually subtract? | This month − previous month, with original units. | Select two adjacent values and trace the resulting difference; show that differencing does not guarantee stationarity. |
| [06 · Looking to the Past (Lags & ACF)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/time-series-analysis.html:1088>) | What is a lag? | The same series shifted by one and twelve periods. | Scrub lag while linking paired points and the ACF bar; explain approximate bounds and multiple-lag interpretation. |
| [07 · Forecasting the Future](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/time-series-analysis.html:1108>) | How do we evaluate forecasts honestly? | Expanding-window train/validation strip. | Step the forecast origin forward; compare a real naive baseline, and label the current forecast fan as heuristic until calibrated intervals replace it. |
| [08 · Diagnostics: Evaluating Residuals](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/time-series-analysis.html:1129>) | What patterns should residuals not retain? | Residual definition with one date's calculation. | Toggle a missing seasonal component and show residual ACF; distinguish random-looking residuals from proven model validity. |
| [09 · Reading the Output](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/time-series-analysis.html:1161>) | What belongs in a forecast report? | Horizon, baseline, error metric, and interval meaning. | Link every reported number to its date range and model; avoid a nominal 95% label for an uncalibrated fan. |
| [10 · Limitations & Caveats](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/time-series-analysis.html:1181>) | When might yesterday stop predicting tomorrow? | Stable period versus structural break. | Add a level shift and compare rolling versus expanding fitting windows; explain the conditional nature of forecasts. |

<a id="simple-linear-regression"></a>

## Simple Linear Regression

Source: [simple-linear-regression.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/simple-linear-regression.html>) · 8 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Editable Reality](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/simple-linear-regression.html:894>) | How does one table row become one point? | Editable student row with hours and score. | Link row, point, and tooltip; use numeric edits as an alternative to dragging; preserve observation identity. |
| [02 · Make Your Guess](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/simple-linear-regression.html:922>) | What do slope and intercept change? | One-unit x increase → predicted score change. | Move slope and intercept independently with immediate control response; keep actual data fixed. |
| [03 · Measuring the Mistakes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/simple-linear-regression.html:959>) | What is a residual? | Actual − predicted = signed error for the selected student. | Select a point to highlight its vertical gap and corresponding table row; avoid confusing vertical and perpendicular distance. |
| [04 · The Penalty for Being Wrong](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/simple-linear-regression.html:997>) | Why square the mistakes? | +4 and −4 versus their squares and absolute errors. | Reveal residual squares and their numerical contributions; accurately label squared units and avoid misleading unequal-axis square areas. |
| [05 · The Least Squares Engine](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/simple-linear-regression.html:1011>) | Why does the fitted line pass through the means? | Means, cross-products, denominator, slope, intercept. | Walk one observation through the sums, then reveal the full calculation; show the identical-x edge case explicitly. |
| [06 · The Optimal Line](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/simple-linear-regression.html:1032>) | What makes this line optimal? | Your SSE versus least-squares SSE on the same rows. | Animate the displayed line to the exact fit; compute metrics from the actual coefficients, with clear labels during motion. |
| [07 · The Model Scorecard](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/simple-linear-regression.html:1076>) | What does R-squared compare? | Mean-only errors beside fitted-model errors. | Switch between baseline and fitted residuals; separate in-sample fit, prediction accuracy, and uncertainty intervals. |
| [08 · Interactive Playground](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/simple-linear-regression.html:1147>) | When is a prediction an extrapolation? | Observed x range and one proposed x. | Move a query point; show numeric prediction, range warning, and a short explain-your-choice check. |

<a id="multiple-linear-regression"></a>

## Multiple Linear Regression

Source: [multiple-linear-regression.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/multiple-linear-regression.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Multi-Variable World](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/multiple-linear-regression.html:882>) | Why use more than one predictor? | Study, sleep, practice, and target in a single student row. | Link the row to a 2D/3D teaching slice; explicitly name the dimension held fixed. |
| [02 · The Secret Recipe](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/multiple-linear-regression.html:903>) | How does the equation combine clues? | Term / value / units / contribution. | Highlight one coefficient and its contribution; translate beta and epsilon before matrix notation. |
| [03 · Finding the Fit](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/multiple-linear-regression.html:938>) | What changes when I adjust one coefficient? | A fixed student's old and new prediction. | Update the plane slice and full-model residual together; keep practice's contribution visible outside the slice. |
| [04 · The Least Squares Method](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/multiple-linear-regression.html:988>) | How does least squares select the weights? | A tiny design matrix and residual sum. | Reveal fitted coefficients with one action; retain rank-deficiency and nonunique-solution caveats in deeper detail. |
| [05 · The Superpower: Holding Constant](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/multiple-linear-regression.html:1010>) | What does holding constant mean? | Two hypothetical rows differing only in study hours. | Slide along a fixed-sleep/practice slice; distinguish conditional association from a causal intervention. |
| [06 · Building the Prediction](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/multiple-linear-regression.html:1037>) | How is a prediction assembled? | Intercept plus three signed contributions. | Build a waterfall with a consistent scale and numeric receipt; preserve negative contributions. |
| [07 · The Spurious Trap](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/multiple-linear-regression.html:1087>) | Why can an apparent relationship disappear? | Simple versus adjusted coefficient, with a confounder sketch. | Compare fits on the same data; explain why adjustment alone does not establish causality. |
| [08 · The Adjusted R² Penalty](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/multiple-linear-regression.html:1111>) | Why can training R-squared reward useless variables? | Training R², adjusted R², and validation error. | Add a seeded noise predictor; recompute all three without implying adjusted R² always rejects it. |
| [09 · Reading the Model Output](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/multiple-linear-regression.html:1135>) | How do I read a regression summary? | Estimate / SE / interval / test statistic / units. | Select a coefficient row and link its interval and prediction effect; replace universal t≈2 shortcuts with conditions. |

<a id="polynomial-regression"></a>

## Polynomial Regression

Source: [polynomial-regression.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/polynomial-regression.html>) · 8 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · Inspect the Raw Data](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/polynomial-regression.html:1182>) | Why might a straight line miss the pattern? | Three local regions of a curved dataset. | Highlight systematic residual patterns using the same points; begin with a question rather than declaring linear methods inadequate. |
| [02 · Fit a Straight Line](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/polynomial-regression.html:1205>) | What does a baseline teach us? | Baseline prediction and observed value. | Fit degree one and reveal residual structure; state that polynomial regression remains linear in its coefficients. |
| [03 · Expand the Features](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/polynomial-regression.html:1228>) | Why create x-squared and x-cubed? | One raw x transformed into basis columns. | Brush a row across the raw table and design matrix; label training-fitted centering/scaling. |
| [04 · Fit the Weights](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/polynomial-regression.html:1251>) | What do the weights do? | Signed basis contribution bars. | Toggle individual basis terms and their sum; update the full equation without swapping the dataset. |
| [05 · Compute Errors](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/polynomial-regression.html:1274>) | What do residual patterns tell us? | Prediction → error → squared error. | Link a residual plot point with its original observation; preserve the training/validation distinction. |
| [06 · Check for Overfitting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/polynomial-regression.html:1297>) | Why can a flexible curve do worse on new data? | Same degree with train and validation errors. | Scrub degree on a fixed split; highlight boundary oscillation and label any schematic curve. |
| [07 · Find the Sweet Spot](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/polynomial-regression.html:1320>) | How should we select the degree? | Near-best validation candidates with complexity. | Compare candidate degrees using fixed folds or a fixed holdout; noise regeneration must be explicit. |
| [08 · Lock in the Model](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/polynomial-regression.html:1362>) | What gets locked before final evaluation? | Basis, transforms, degree, coefficients, and threshold if relevant. | Commit the chosen setup, reveal final test once, and explain extrapolation/monitoring limits instead of claiming proof. |

<a id="regression-trees"></a>

## Regression Trees

Source: [regression-trees.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html>) · 16 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Raw Target](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:961>) | What are we predicting? | One home's features and numeric price. | Link the row to the plotted house; keep outcome units on axes and prediction labels. |
| [02 · From Dataset to Model](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:971>) | Which rows can influence training? | Train/validation/test role cards with immutable IDs. | Reveal membership without allowing test outcomes to guide splits. |
| [03 · The Clumsy Guess](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1001>) | Why start with the mean? | Three target values, their mean, and squared errors. | Compare candidate constant predictions and locate the minimum RSS at the mean. |
| [04 · The First Split](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1012>) | How can one question improve the prediction? | Left and right child counts and means. | Slide a split and show piecewise-constant predictions; keep equality routing explicit. |
| [05 · The Error Engine (RSS)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1023>) | How is a split scored? | Parent RSS minus left RSS minus right RSS. | Select a candidate threshold and trace both children's contributions to total improvement. |
| [06 · Real Trees Check Many Questions](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1066>) | Why test many candidate questions? | Feature/threshold/RSS ranking table. | Step through adjacent-value midpoint candidates; keep ties deterministic and explain greedy search. |
| [07 · Recursive Splitting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1119>) | What makes the process recursive? | The same split recipe reused in one child. | Expand one node at a time and update its spatial region; keep other nodes stable. |
| [08 · The Anatomy of a Tree](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1131>) | How do I read a tree? | Root, question, branch, leaf, prediction. | Trace one selected house through both tree and feature space, with keyboard step controls. |
| [09 · The Overfitting Trap](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1148>) | Why can a deeper tree overfit? | Leaf sizes and train/validation error comparison. | Increase depth on a fixed dataset; show tiny leaves without revealing final test metrics. |
| [10 · Stopping Rules](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1208>) | Which stopping rules constrain growth? | Maximum depth versus minimum leaf size. | Change one rule at a time and explain which proposed split becomes invalid. |
| [11 · Pruning: Let It Grow, Then Cut It Back](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1330>) | How does pruning differ from stopping early? | Full subtree versus pruned leaf and its penalty. | Scrub a pruning path; keep validation-based selection separate from training cost complexity. |
| [12 · Trees vs. Lines](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1346>) | When does a tree differ from a line? | Smooth additive trend versus stepwise prediction. | Compare both fits on identical observations and splits; avoid implying one always wins. |
| [13 · Interactive Playground](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1362>) | What changes when I alter the data? | Before/after prediction for one selected house. | Preserve a baseline snapshot while changing noise or size; announce an explicit new experiment. |
| [14 · Sample Output: Reading the Tree Result](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1377>) | What do the reported metrics mean? | MAE, RMSE, RSS, units, and split. | Highlight per-row error contributions and reconcile reported numbers with current predictions. |
| [15 · Reality Check: Limitations](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1470>) | What are the characteristic failure cases? | Extrapolation, instability, staircase, and axis-aligned split thumbnails. | Switch a labeled failure scenario; use a controlled data perturbation to show instability. |
| [16 · Synthesis](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-trees.html:1527>) | Can I reconstruct the algorithm? | Arrange root → candidates → best split → recurse → validate → leaf. | Complete the sequence and explain why an ensemble may help; do not promise every ensemble removes bias. |

<a id="kmeans"></a>

## K-Means Clustering

Source: [kmeans.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/kmeans.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Unlabeled Data](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/kmeans.html:679>) | What is a cluster when there are no labels? | Customer row with age and spending units. | Select a row/point before coloring any group; explain that a useful grouping depends on a chosen metric. |
| [02 · The Blind Guess (Initialization)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/kmeans.html:696>) | Why do starting centers matter? | Random partition versus k-means++ initialization. | Compare seeded starts on identical points; label the current algorithm's actual initializer. |
| [03 · Nearest Neighbor Assignment](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/kmeans.html:709>) | Why does each point choose the nearest center? | Distances from one selected point to all centers. | Predict the nearest center, then reveal assignment; ties follow a declared deterministic rule. |
| [04 · Recentering](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/kmeans.html:720>) | Why move a center to the mean? | (2,4) and (4,8) average to (3,6). | Move only displayed centroid geometry between exact snapshots; preserve data-space coordinates. |
| [05 · The Convergence Loop](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/kmeans.html:735>) | What repeats, and when do we stop? | Assign → recenter with iteration count. | Step, pause, and rewind real snapshots; stop at convergence and preserve the run when scrolling away. |
| [06 · Measuring Tightness (WCSS)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/kmeans.html:748>) | What does WCSS measure? | One point's squared distance and cluster subtotal. | Select a cluster, then accumulate all contributions; evaluate WCSS from exact model state, not eased positions. |
| [07 · The Elbow Heuristic](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/kmeans.html:758>) | Why is an elbow only a clue? | WCSS, stability, and practical usefulness comparison. | Inspect candidate K values with repeated seeded starts; show an ambiguous/no-elbow example. |
| [08 · The Scaling Trap](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/kmeans.html:768>) | How do units change what near means? | Raw and standardized distance contributions for one pair. | Compare metrics on the same customers; explain when standardization is a justified choice. |
| [09 · Limitations & Outliers](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/kmeans.html:778>) | When do center-based groups fail? | Crescent, unequal-density, and outlier mini examples. | Select a failure case and inspect assignments; compare with a suitable alternative concept without declaring recovered truth. |

<a id="hierarchical-clustering"></a>

## Hierarchical Clustering

Source: [hierarchical-clustering.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/hierarchical-clustering.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Uncharted Planet](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/hierarchical-clustering.html:1328>) | What does grouping without an answer key mean? | Two reasonable partitions of the same objects. | Select the feature representation first; avoid claiming there is one natural grouping waiting to be discovered. |
| [02 · Measuring "Close"](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/hierarchical-clustering.html:1340>) | How do we define close? | One distance calculation with x/y contributions. | Link a distance-matrix cell to two points; compare Euclidean and an appropriate alternative. |
| [03 · The First Merge](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/hierarchical-clustering.html:1354>) | Why merge this pair first? | Sorted candidate distances with a tie policy. | Predict the closest pair, then merge while preserving member identities. |
| [04 · Defining Group Distance (Linkage)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/hierarchical-clustering.html:1368>) | How far apart are groups? | Single / complete / average / Ward definitions. | Highlight contributing pairs and recompute the selected linkage; label Ward's increase-in-variance meaning. |
| [05 · The Process in Motion](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/hierarchical-clustering.html:1423>) | How is the merge history built? | Before/after group membership for one merge. | Scrub cached merge snapshots in both directions; synchronize point clusters, matrix, and dendrogram. |
| [06 · The Family Tree (Dendrogram)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/hierarchical-clustering.html:1446>) | What does dendrogram height represent? | One merge annotated with the selected criterion. | Highlight a branch and its original members; never imply all linkage heights mean the same distance. |
| [07 · Cutting the Tree](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/hierarchical-clustering.html:1457>) | How does a horizontal cut produce K groups? | Cut height → intersected branches → memberships. | Drag or numerically set the cut; keep leaf identity and colors stable across nearby cuts. |
| [08 · The Detective's Challenge](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/hierarchical-clustering.html:1480>) | How sensitive is the tree to preprocessing? | Same data under raw scale, standardized scale, and one outlier. | Compare alternative trees with stable leaf IDs; make each metric change explicit. |
| [09 · Synthesis & Recap](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/hierarchical-clustering.html:1496>) | When is this preferable to K-Means? | Output, K choice, geometry, scale, and computational tradeoffs. | Choose a method for a scenario and justify the tradeoff; include stability and domain validation. |

<a id="pca"></a>

## Principal Component Analysis (PCA)

Source: [pca.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/pca.html>) · 10 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Unsupervised Explorer](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/pca.html:1157>) | What can we learn without a target? | Rows, six features, and the absence of a y column. | Select one student across the source table and 2D slice; label the slice versus the full fit. |
| [02 · The "Too Much Information" Problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/pca.html:1171>) | Why compress several measurements? | Original point and projections on two candidate axes. | Compare reconstruction loss after discarding a direction; avoid equating sample variance with all information. |
| [03 · Finding the First Principal Component](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/pca.html:1183>) | Why maximize projected variance? | Candidate direction, projected spread, reconstruction error. | Rotate a candidate axis continuously and mark the fitted PC1 optimum; use a centered dataset. |
| [04 · The Secret Sauce: Loadings](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/pca.html:1197>) | What are loadings? | One score as a weighted sum of standardized features. | Select a loading, highlight the source column, and trace its contribution for one student. |
| [05 · When Scaling Is Appropriate](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/pca.html:1212>) | Why might scaling change the answer? | Raw units, mean, SD, centered value, z-score. | Switch raw-centered and standardized fits on identical rows; retain units and model-choice explanation. |
| [06 · Capturing the Leftovers: PC2](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/pca.html:1244>) | How is PC2 selected? | Remaining variation after PC1 with an orthogonality constraint. | Reveal the second eigen-direction; distinguish PCA score decorrelation from arbitrary perpendicular axes. |
| [07 · The Transformation (Scores)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/pca.html:1255>) | What are scores? | One original row versus its new coordinates. | Animate coordinates into the new basis with identity preserved; show reconstruction when all components are kept. |
| [08 · Proportion of Variance Explained](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/pca.html:1287>) | What fraction of variance is retained? | Eigenvalue / total eigenvalue and cumulative PVE. | Select component count on a scree plot; distinguish variance retained from predictive information preserved. |
| [09 · Interactive Playground](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/pca.html:1306>) | Can I discover the best projection? | Candidate-angle score compared with fitted PCA. | Give a predict/try/reveal exercise; do not call every user-selected axis a principal component. |
| [10 · The Best Summary](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/pca.html:1337>) | What should I report and avoid claiming? | Scaling, component count, loadings, PVE, and limitations. | Explain a chosen representation; include a low-variance predictive-signal counterexample in deeper reading. |

<a id="logistic-regression"></a>

## Logistic Regression

Source: [logistic-regression.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/logistic-regression.html>) · 10 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · It Starts with Data](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/logistic-regression.html:695>) | What is the binary outcome? | One weather/day row and whether a purchase occurred. | Link the row to the plotted observation; label class and feature units independently. |
| [02 · Why Lines Break](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/logistic-regression.html:729>) | Why is an ordinary line awkward for probability? | A linear prediction below zero or above one. | Compare the raw linear score and a probability output using the same observations. |
| [03 · From a Raw Score to a Probability](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/logistic-regression.html:756>) | What does the sigmoid do? | z → exp(−z) → probability, with a small value table. | Scrub z and move a marker along the sigmoid; keep this distinct from changing a fitted coefficient. |
| [04 · Weighted Clues](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/logistic-regression.html:809>) | How do weighted clues form z? | Intercept plus each feature's signed contribution. | Change one input or coefficient at a time; synchronize the contribution receipt and score-to-probability diagram. |
| [05 · Learning from Mistakes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/logistic-regression.html:919>) | What does learning minimize? | One prediction's log loss and gradient direction. | Step an actual parameter update and plot loss; distinguish gradients from the optimizer's action. |
| [06 · Drawing the Line](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/logistic-regression.html:1015>) | Why does a probability need a decision threshold? | Probability / threshold / resulting action. | Move the threshold and immediately update labels on development data; preserve continuous probabilities. |
| [07 · Select the Decision Rule on Validation Data](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/logistic-regression.html:1072>) | Which mistakes does this threshold create? | Confusion-cell definitions with their actual denominators. | Select TP/FP/FN/TN to brush corresponding validation cases; update counts and costs together. |
| [08 · The Validation ROC Curve](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/logistic-regression.html:1179>) | What does the ROC curve summarize? | TPR and FPR denominator mini diagrams. | Sweep a validation threshold and move its ROC operating point; keep AUC separate from accuracy and calibration. |
| [09 · What the Numbers Mean](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/logistic-regression.html:1232>) | What is an odds ratio? | Probability ↔ odds ↔ log-odds with one coefficient example. | Change a feature by one unit while holding others fixed; avoid interpreting coefficient size as causal importance. |
| [10 · The Full Picture](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/logistic-regression.html:1310>) | What is locked before the final test? | Training, validation choices, locked model, final evaluation. | Preserve the existing one-time reveal; demonstrate that threshold changes cannot silently tune the sealed test. |

<a id="knn"></a>

## K-Nearest Neighbors (KNN)

Source: [knn.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html>) · 14 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Raw Data](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:793>) | What is stored by KNN? | One labeled row and its two coordinates. | Select an observation and explain that training largely stores usable examples rather than a boundary formula. |
| [02 · Choosing Good Features](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:841>) | What makes a feature useful for distance? | Relevant signal versus a seeded irrelevant feature. | Compare neighbor identity after adding noise; do not choose features from final test outcomes. |
| [03 · Train / Test Split](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:874>) | Why separate development and final evaluation? | Immutable train/validation/test membership. | Reveal the split and keep held-out labels out of the neighbor pool. |
| [04 · Feature Scaling](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:901>) | Why do units affect neighbors? | Each feature's contribution to distance. | Switch a training-fitted scaler on the same data; never refit scaling on a queried/test row. |
| [05 · Measuring Distance](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:940>) | How is distance calculated? | Delta x, delta y, squared terms, total. | Select two points and trace the calculation; offer numeric query coordinates alongside direct manipulation. |
| [06 · Choosing K](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:987>) | Why does K change the behavior? | Small-K versus large-K neighbor sets. | Scrub K on fixed data; show a query's changing vote and validation performance. |
| [07 · Finding Neighbors](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:1076>) | Which observations are the nearest? | A sorted distance list with row IDs. | Highlight the first K entries and expand the neighborhood; do not move observations to create the animation. |
| [08 · The Majority Vote](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:1088>) | How do neighbors vote? | Counts or distance weights, denominator, and tie rule. | Reveal votes one neighbor at a time; distinguish vote fraction from calibrated probability. |
| [09 · Decision Boundary](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:1133>) | Where do predictions change? | Two nearby query points with different winning votes. | Move a query through a persistent decision surface; recompute surface only when data or K changes. |
| [10 · Classifying Test Points](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:1173>) | How do unseen points get a label? | Query → scaling → neighbors → vote. | Step through a fixed evaluation example without inserting its true label into training. |
| [11 · Evaluating the Model](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:1185>) | What does the confusion matrix count? | One case's actual/predicted pair. | Select errors to locate their queries; use validation for ongoing exploration and reserve final test for a locked run. |
| [12 · The Effect of K](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:1221>) | How do we choose K? | Fold-level validation errors with uncertainty across splits. | Compare a precomputed candidate sweep; avoid repeated final-test optimization. |
| [13 · Strengths and Weaknesses](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:1308>) | When does KNN become unreliable or expensive? | Density, dimensionality, scaling, missingness, and query cost. | Add an irrelevant dimension or reduce local density in a labeled toy example. |
| [14 · Interactive Playground](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/knn.html:1359>) | Can I explain a new prediction? | A compact neighbor receipt. | Let the learner choose K, query location, and vote rule; capture a before/after comparison and ask why it changed. |

<a id="lda"></a>

## Linear Discriminant Analysis (LDA)

Source: [lda.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html>) · 15 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Raw Data](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:799>) | What do the labeled clouds represent? | One observation, two features, and a class. | Link table and point before introducing ellipses or a separating direction. |
| [02 · Choosing Good Features](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:849>) | Why does feature choice matter? | Two informative features versus a redundant or noisy one. | Inspect a seeded feature alternative using validation; retain feature units and provenance. |
| [03 · Train / Test Split](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:868>) | Which data estimate the class distributions? | Split roles and class counts. | Show training observations contributing to estimates; keep held-out rows visually distinct. |
| [04 · Group by Class](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:893>) | Why group observations by class? | Labeled rows sorted into class-specific columns. | Brush one class and reveal its sample size without changing point positions. |
| [05 · Compute Class Means](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:908>) | What is a class mean? | Coordinate-wise average of three points. | Draw deviations into a class center; show the center can sit where no observation exists. |
| [06 · Within-Class Scatter](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:940>) | What does within-class scatter describe? | Two variances and one covariance. | Link covariance-matrix entries to ellipse spread and tilt with a short symbol dictionary. |
| [07 · The Shared Covariance Assumption](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:979>) | Why share one covariance estimate? | Separate class covariances versus pooled covariance. | Compare shared and separate shapes; explain the stability-versus-flexibility tradeoff. |
| [08 · Between-Class Scatter](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:1016>) | What counts as between-class separation? | Class means versus the overall mean. | Highlight mean differences independently from within-class spread. |
| [09 · The Optimal Direction](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:1041>) | Why project along this direction? | Separation divided by projected within-class spread. | Rotate a candidate projection, then reveal the fitted LDA direction; distinguish this from PCA. |
| [10 · The Decision Boundary](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:1065>) | Why is the boundary linear? | Shared quadratic terms that cancel in a score difference. | Link mean, covariance, and prior changes to the boundary; keep algebra in expandable steps. |
| [11 · Classifying Test Points](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:1115>) | How is a new case classified? | Class score terms and the chosen class. | Move/select a query and compare its class scores; probability claims must use the model assumptions. |
| [12 · Evaluating the Model](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:1141>) | How do we judge the classifier? | Confusion counts, chosen positive class, metric denominators. | Brush validation mistakes; use a separate locked final-test demonstration. |
| [13 · Reading LDA Output](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:1188>) | What does an LDA summary mean? | Priors, means, shared covariance, coefficients. | Select an output item and highlight the quantity it controls; clarify empirical versus specified priors. |
| [14 · Assumptions & Limitations](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:1219>) | When is the shared-shape assumption costly? | Similar shapes / unequal shapes / small samples. | Compare fixed LDA and QDA scenarios on identical splits; discuss singularity and regularization. |
| [15 · Interactive Playground](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/lda.html:1259>) | Can I predict how the boundary will move? | Before/after settings and class-score receipt. | Change one mean, spread, or prior; preserve dataset seed and ask the learner to explain the outcome. |

<a id="qda"></a>

## Quadratic Discriminant Analysis (QDA)

Source: [qda.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/qda.html>) · 10 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Raw Data Cloud](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/qda.html:1486>) | What differs between these class clouds? | Class size, center, spread, and tilt. | Inspect classes with stable row IDs and color/shape labels. |
| [02 · Train / Test Split](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/qda.html:1545>) | Why hold out examples? | Training estimates versus validation comparisons versus final test. | Use immutable split roles; keep subsequent shape/regularization tuning on development data. |
| [03 · The Straight-Line Trap (LDA)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/qda.html:1585>) | When is a straight boundary too restrictive? | One ambiguous point under shared and separate covariance. | Compare LDA/QDA on the same points; avoid implying QDA always improves generalization. |
| [04 · Fitting QDA: What the Model Learns](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/qda.html:1607>) | Which parameters does QDA estimate? | Prior, mean, covariance; matrix entries with units. | Select a matrix cell to highlight ellipse spread/tilt; explain determinant volume and inverse scaling separately. |
| [05 · Testing with Shape-Aware Distance](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/qda.html:1647>) | What is shape-aware distance? | Euclidean versus Mahalanobis distance for one query. | Move the query by pointer or coordinate inputs; show contours and the computed class terms. |
| [06 · The Curved Boundary](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/qda.html:1683>) | Why do unequal covariances yield a quadratic boundary? | Shared versus nonshared quadratic terms. | Toggle linear/quadratic boundaries with direct labels; distinguish geometric shape from a confidence claim. |
| [07 · Evaluating QDA on Unseen Data](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/qda.html:1715>) | How should performance be evaluated while exploring? | One confusion-cell calculation. | Display validation metrics while tuning; reserve test for locked settings and remove advice to repeatedly inspect changing test scores. |
| [08 · Reading QDA Output](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/qda.html:1742>) | What do prior and covariance outputs mean? | Output item → source data → interpretation. | Focus/tap the log/table entries; state whether priors came from training frequencies or were supplied. |
| [09 · Regularization & Shape Playground](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/qda.html:1764>) | What does regularization stabilize? | Identity ridge versus pooled-covariance shrinkage. | Give separate controls or separate demonstrations; only the pooled path should be labeled as moving toward LDA. |
| [10 · Assumptions, Complexity & Synthesis](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/qda.html:1826>) | When is the extra flexibility worth its cost? | Parameter count by K and p with required sample support. | Change K/p and inspect covariance stability; conclude with a validation-based choice, not a shape-only rule. |

<a id="classification-trees"></a>

## Classification Trees

Source: [classification-trees.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html>) · 15 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Raw Data](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:681>) | What is the target category? | One labeled observation with its features. | Link row and point; give classes text/shape identities before coloring regions. |
| [02 · The Train / Test Split](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:727>) | Which rows may choose a split? | Train/validation/test role strip. | Keep test labels sealed during depth and pruning comparisons. |
| [03 · The Root Node](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:768>) | What does the root predict before splitting? | Class counts and majority baseline. | Select a class count and show the corresponding observations. |
| [04 · Measuring Messiness](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:783>) | What is impurity? | Two tiny class mixtures and their Gini calculation. | Adjust a toy proportion; contrast pure, mixed, and maximum-impurity nodes. |
| [05 · Testing Every Question](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:830>) | Why inspect several candidate questions? | Candidate feature/threshold list. | Move a threshold over valid candidate positions; preserve the same parent node. |
| [06 · How the Tree Scores One Split](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:856>) | How is split improvement calculated? | Parent impurity minus weighted child impurities. | Reveal child weights and contributions; show why an unweighted average can choose the wrong split. |
| [07 · Recursive Splitting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:884>) | How is the procedure reused in a child? | The split recipe copied into one branch. | Expand one selected node and its corresponding region in feature space. |
| [08 · The Decision Boundary](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:917>) | Why do tree boundaries look rectangular? | One feature threshold extended into a region. | Link successive tree questions to axis-aligned partitions without moving the underlying points. |
| [09 · Depth Limiting vs. Post-Pruning](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:950>) | How do depth limits and pruning differ? | Stop-growing rule versus cut-back subtree. | Compare both on a fixed full tree; show the selected leaves and validation consequences. |
| [10 · Choosing Tree Depth](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:1002>) | How should we select tree depth? | Training and validation curve with selected candidate. | Scrub depth with fixed splits; keep final-test accuracy unavailable during selection. |
| [11 · Classifying Test Points](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:1031>) | How does one new row travel through the tree? | A yes/no decision receipt. | Trace the query across nodes and spatial regions; display equality rules and missing-value policy. |
| [12 · Performance Metrics](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:1043>) | Which errors does the tree make? | Confusion matrix with actual/predicted definitions. | Select a cell to reveal member rows; derive all rates from the same counts. |
| [13 · Reading Tree Output](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:1080>) | What belongs in tree output? | Node rule, n, impurity, class distribution, prediction. | Link each output row to its node and region; keep confidence claims qualified. |
| [14 · Interactive Playground](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:1095>) | What changes when I modify complexity? | Saved baseline versus current tree summary. | Explore depth/leaf size with preserved seed and validation data; allow replay of one prediction path. |
| [15 · Limitations & Model Choice](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/classification-trees.html:1114>) | When should I prefer another model? | Instability, interaction capacity, axis alignment, and ensemble options. | Perturb one training case and compare the tree; explain tradeoffs rather than declaring a universal winner. |

<a id="support-vector-machine"></a>

## Support Vector Machines — Separate classes with breathing room

Source: [support-vector-machine.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html>) · 14 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · Points, labels, and a decision boundary](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1188>) | What does a decision boundary decide? | Signed score and class label for one point. | Select a point and inspect its score; reserve probability language for calibrated output. |
| [02 · Why not choose any separating line?](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1199>) | Why is one separator preferable to another? | Two correct separators with different nearest-point clearance. | Slide a candidate line and highlight the limiting points. |
| [03 · The margin is protected space](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1213>) | What is the margin? | Decision plane versus ±1 support planes and geometric width. | Link the weight norm to margin width; keep functional and geometric margins distinct. |
| [04 · Support vectors are the points that matter most](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1224>) | Why do support vectors matter? | A safely distant point versus a constraining point. | Move each in a fixed-data example and compare refits; qualify ties and soft-margin cases. |
| [05 · Hard margins break when reality overlaps](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1235>) | Why allow violations? | Slack 0, between 0 and 1, and above 1 examples. | Introduce an overlapping point and show the constrained fit; handle the boundary case ξ=1 precisely. |
| [06 · C decides how expensive violations are](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1253>) | What does C penalize? | Wider margin with violations versus expensive violations. | Scrub C on a logarithmic scale; compare actual training objective terms and validation behavior. |
| [07 · Scale features before comparing distances](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1267>) | Why fit scaling inside a fold? | Training mean/SD applied to a new row. | Compare raw and scaled geometry with the same data; preserve feature-unit explanations. |
| [08 · Hinge loss ignores easy correct points](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1278>) | Why do easy correct points have zero hinge loss? | y·f(x) and max(0,1−margin). | Move a query along the hinge-loss curve and link its margin position. |
| [09 · The decision score is not automatically a probability](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1296>) | Why is a score not a probability? | Score / signed distance / calibrated probability distinctions. | Inspect a score and an explicitly fitted calibration example; never relabel sigmoid output as calibrated without evidence. |
| [10 · A straight boundary cannot solve every pattern](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1307>) | How can a nonlinear feature help? | x₁, x₂, and squared radius for one point. | Map a ring example to radius space and show the resulting simple threshold. |
| [11 · The kernel trick avoids explicit feature explosion](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1318>) | What does a kernel compute? | Similarity of two selected points at two gamma values. | Inspect an RBF influence profile; link C/gamma changes to the real fitted boundary with stale-fit cancellation. |
| [12 · Tune the whole pipeline inside cross-validation](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1332>) | How do we choose C and gamma? | Pipeline inside each inner fold, outer evaluation separate. | Explore a bounded validation grid; use train-fitted scaling and keep final test sealed. |
| [13 · Measure the errors the problem actually cares about](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1348>) | What matters beyond accuracy? | Error costs, minority recall, calibration, and multiclass strategy. | Select a concrete goal and inspect matching validation metrics; explain OVR/OVO separately from the binary illustration. |
| [14 · Change the knobs and watch the boundary answer back](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/support-vector-machine.html:1364>) | Can I diagnose the fitted boundary? | Support count, chosen settings, validation result, and a query receipt. | Add a labeled training point explicitly, refit, and compare; preserve a baseline and provide an equivalent form input. |

<a id="one-r"></a>

## One-R

Source: [one-r.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html>) · 12 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · What problem is One-R solving?](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html:1151>) | What does one feature mean? | Features versus target in one umbrella row. | Select a column and keep the target clearly separate. |
| [02 · First, make the lazy prediction.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html:1170>) | Why start with a majority baseline? | 8 Yes / 6 No → 8 of 14 correct. | Predict the baseline before revealing it; add an imbalanced case where accuracy is misleading. |
| [03 · Make a rule from one categorical feature.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html:1185>) | How is a rule built for each value? | Value-level class counts and majority. | Select a category and trace its chosen prediction and errors. |
| [04 · Test every feature. Keep the lowest-error rule.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html:1208>) | How is the winning feature selected? | Competing feature rulebooks and training errors. | Inspect each feature without changing rows; reveal the declared tie policy. |
| [05 · Turn numeric values into intervals.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html:1240>) | Why bucket numeric values? | Exact-value lookup versus training-derived intervals. | Move a query through fixed intervals; explain that exact-value rules can memorize the sample. |
| [06 · Missing values and unseen categories are part of the model.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html:1267>) | What happens with missing or unseen values? | Missing, unseen category, tie, out-of-range cases. | Choose an edge case and trace the declared fallback; do not infer a rule from test labels. |
| [07 · Prediction is deliberately cheap.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html:1288>) | Why is prediction inexpensive? | Read feature → find category → return rule. | Change irrelevant input fields and show the prediction stays unchanged for the fitted one-feature model. |
| [08 · One feature cannot express an interaction.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html:1315>) | What can a single feature miss? | A two-feature interaction table. | Reveal a pattern that requires both features and compare One-R with a richer rule. |
| [09 · Validate the whole learning process](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html:1334>) | What must be refitted inside each fold? | Buckets, feature selection, value rules, and scoring. | Step a fold with training-only learning; show why selecting a feature globally leaks selection information. |
| [10 · Evaluate each fold. Decide what to do next.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html:1350>) | Which metric matches the decision? | Actual denominators and concrete FP/FN costs. | Compare fold outcomes and workload; avoid tying entire industries universally to precision or recall. |
| [11 · Use simple models as diagnostic instruments.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html:1425>) | How does One-R differ from a stump? | Majority baseline / categorical One-R / one split / full tree. | Run the same row through each representation and explain the tradeoff. |
| [12 · Build the rule, then explain what it means.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/one-r.html:1453>) | Can I build and explain a rule? | A partially completed value-level rulebook. | Complete a rule, test a new case, and explain what the unselected features might still contribute elsewhere. |

<a id="naive-bayes"></a>

## Naive Bayes

Source: [naive-bayes.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html>) · 12 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · Start with a pile of labeled emails.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html:37>) | Where does the model's evidence come from? | One email row and its binary word indicators. | Select an email to link its words, feature row, and label; retain accessible table access. |
| [02 · Separate the target from the clues.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html:45>) | Which column is the answer? | Features versus class with a marked target column. | Toggle a word clue while keeping the true label separate from the model prediction. |
| [03 · Keep the final exam hidden.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html:53>) | Why keep the final exam hidden? | Train/validation/test roles with concrete email IDs. | Trace which emails contribute counts; keep final-test examples outside parameter and threshold selection. |
| [04 · Choose the version that fits the feature.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html:61>) | Which Naive Bayes variant fits the data? | Binary presence / nonnegative count / continuous value. | Match a feature representation to Bernoulli, Multinomial, or Gaussian likelihood; state each model's assumptions. |
| [05 · Count what each class tends to contain.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html:70>) | How do counts become probabilities? | Count, denominator, smoothing, resulting likelihood. | Select class/word cells and update linked likelihood bars; explain Bernoulli absence terms. |
| [06 · Pretend the clues can speak separately.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html:79>) | What does conditional independence mean? | Joint evidence versus product of class-conditional terms. | Duplicate a correlated clue and show overconfident evidence; distinguish conditional from unconditional independence. |
| [07 · Prior × evidence = a class score.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html:87>) | Why multiply prior and evidence? | Prior × likelihoods → unnormalized scores → normalization. | Trace one email through stable marks; compute posterior from the same inputs and show the denominator. |
| [08 · Numbers need a different likelihood.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html:96>) | How do continuous features contribute? | Value, class mean, SD, and density. | Move a numeric probe on two density curves; explain that density height is not point probability. |
| [09 · Two small engineering fixes.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html:105>) | Why use smoothing and logs? | Zero count before/after smoothing; products versus log sums. | Add an unseen feature value and trace the score; preserve ranking under valid log conversion. |
| [10 · Use folds while you build.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html:113>) | What must be recomputed in each fold? | Vocabulary/counts/likelihoods inside training. | Step fold-specific fitting and held-out prediction; keep the test set independent. |
| [11 · A prediction is a decision with consequences.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html:122>) | How does a probability become an action? | Posterior, threshold, false-alarm cost, missed-case cost. | Change a validation threshold and update the confusion receipt; discuss calibration despite good classification. |
| [12 · Prior → likelihoods → posterior.](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/naive-bayes.html:131>) | Can I explain the whole prediction? | Prior → class-conditional evidence → normalized posterior. | Complete one missing arithmetic step, replay the calculation, and identify the independence limitation. |

<a id="bias-variance"></a>

## Bias-Variance Trade-Off & Resampling

Source: [bias-variance.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html>) · 12 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Prediction Problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html:843>) | Why can fitted predictions differ from reality? | True function, noisy observation, fitted prediction. | Use a known simulated population and label which quantities are hidden in real data. |
| [02 · High Bias (Underfitting)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html:862>) | What does a consistently rigid model miss? | Several underfit curves on repeated samples. | Resample with a fixed population and show their mean prediction as well as individual fits. |
| [03 · High Variance (Overfitting)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html:888>) | What makes a flexible fit unstable? | The same x with predictions from several training samples. | Compare repeated fits; separate variability across datasets from residual noise within one dataset. |
| [04 · The Error Decomposition](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html:909>) | Where does the squared-error decomposition apply? | Noise + squared bias + variance at a fixed input. | Accumulate terms from repeated simulated samples; label empirical estimates and squared-error conditions. |
| [05 · Interactive: The Trade-Off](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html:939>) | Must error always follow a neat U-shape? | Actual simulated error versus a schematic tradeoff curve. | Scrub complexity and inspect repeated-sample results; avoid treating the illustrated sweet spot as a universal law. |
| [06 · The Testing Problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html:967>) | Why is training error insufficient? | Same model on seen versus unseen examples. | Reveal an untouched development holdout and ask which score supports selection. |
| [07 · 1. The Validation Set](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html:988>) | Why can one validation split be noisy? | Split IDs and validation MSE. | Redraw an explicit development split; rename Test labels to Validation and keep final test separate. |
| [08 · 2. k-Fold Cross-Validation](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html:1029>) | What does K-fold validation average? | Per-fold fit, held-out prediction, score, and mean. | Step the folds with distinct fitted models; explain dependence among scores and limits on uncertainty claims. |
| [09 · 3. Leave-One-Out (LOOCV)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html:1068>) | What changes in leave-one-out? | One held-out row and almost-overlapping training sets. | Select a row, inspect its held-out error, and discuss computation and estimator-dependent variance without absolute claims. |
| [10 · 4. The Bootstrap](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html:1105>) | What does sampling with replacement mean? | Original IDs and a resample with repeated IDs. | Draw one bootstrap sample, then many; link duplicate counts to the estimator distribution and interval method. |
| [11 · Limitations in Practice](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html:1166>) | Which resampling method answers my question? | Model selection / uncertainty / groups / time decision table. | Choose a method for a scenario; include block or cluster resampling where independence fails. |
| [12 · Summary & Synthesis](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/bias-variance.html:1184>) | Can I distinguish bias, variance, and uncertainty? | Three short scenarios with different sources of error. | Require an explanation before revealing the method; retain a comparison table for later reference. |

<a id="model-selection"></a>

## Model Selection & Regularization

Source: [model-selection.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html>) · 12 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The Overfitting Trap](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html:1156>) | Why can extra flexibility hurt new predictions? | Training and validation errors on the same candidate models. | Add a seeded noise feature; avoid claiming more features always cause overfitting. |
| [02 · The n-p Puzzle](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html:1168>) | What happens when coefficients are not identifiable? | n, p, rank, and two equally fitting coefficient vectors. | Show nonunique coefficients separately from generalization; introduce regularization as an additional constraint. |
| [03 · Picking the Best Team](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html:1187>) | Why not search every subset? | Candidate counts for small p, then 2^p. | Step forward/backward selection on a tiny example; describe computational growth without saying all sizes are impossible. |
| [04 · The Scorecards](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html:1213>) | What does each scorecard penalize? | Criterion / objective / direction / assumptions / parameter count. | Compare identical fitted candidates; standardize AIC/BIC/Cp conventions and distinguish ranking-equivalent rescalings. |
| [05 · The Shrinking Trick](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html:1250>) | What does shrinkage trade away? | Prediction error plus coefficient penalty. | Change lambda on a fixed standardized training matrix; keep the intercept treatment explicit. |
| [06 · Ridge Regression (L2)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html:1273>) | Why does Ridge usually keep all predictors? | Two correlated coefficients and the L2 penalty. | Animate actual solution paths; replace the absolute never-zero claim and explain units. |
| [07 · Lasso Regression (L1)](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html:1305>) | Why can Lasso produce zeros? | L1 constraint geometry and a coefficient path. | Follow a coefficient to zero; show instability under correlated features and an Elastic Net comparison in deeper reading. |
| [08 · Finding the Sweet Spot](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html:1336>) | How do we choose lambda honestly? | Fold-safe transforms and a validation-error curve. | Compare candidates using the same folds; expose the one-SE choice only with an explicit uncertainty calculation. |
| [09 · The "Super-Variable" Secret](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html:1369>) | How do PCR and PLS differ? | Whether y participates in choosing the new directions. | Compare a high-variance irrelevant direction with a predictive direction; fit all transforms inside training folds. |
| [10 · Decision Helper](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html:1389>) | Which tradeoff matters for this task? | Prediction, compact explanation, correlated inputs, and causal questions. | Return conditional options with reasons; stop equating feature selection with causal explanation. |
| [11 · Common Mistakes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html:1417>) | How does repeated evaluation bias our choices? | Training, repeated validation decisions, sealed test. | Demonstrate selection optimism and nested evaluation; avoid universal claims about every training score. |
| [12 · Final Synthesis](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/model-selection.html:1438>) | Can I justify the selected model? | Chosen method, validation basis, preprocessing, limits. | Produce a short model card from explicit choices; check that no final-test result influenced the selection. |

<a id="neural-networks"></a>

## Neural Networks

Source: [neural-networks.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html>) · 19 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The whole idea: learn patterns from examples](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:298>) | What does learning from examples mean? | Conventional rule versus learned parameters. | Trace a labeled student example to a prediction; keep the running example consistent with the visuals. |
| [02 · Data becomes features and labels](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:308>) | How do rows become inputs and targets? | Raw row, encoded feature vector, separate label. | Select a student and follow every value; explain dimensions and units before introducing tensors. |
| [03 · Clean, encode, scale, then split](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:323>) | When should preprocessing be learned? | Split first → fit transforms on train → apply unchanged. | Correct the heading; contrast a safe pipeline with one that uses held-out statistics. |
| [04 · A network is layers of tiny calculators](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:340>) | What does a layer compute? | Input vector → neuron calculations → output vector. | Reveal one layer at a time without moving all nodes or shrinking annotations. |
| [05 · One feature has a different weight into every hidden neuron](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:362>) | Why does each connection have its own weight? | One input feeding two neurons through different weights. | Select an edge and trace its contribution; changing one weight must not change unrelated edges. |
| [06 · Non-linearity lets stacked layers learn bends](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:380>) | Why are nonlinear activations necessary? | Two linear layers collapsed into one versus a nonlinear bend. | Toggle activation on a tiny deterministic network; state that extra linear layers alone remain linear. |
| [07 · Forward propagation makes one pass-score prediction](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:408>) | What happens in one forward pass? | Multiply → sum → bias → activation receipt. | Step a single student's actual values through the network; preserve the same selected row throughout. |
| [08 · Loss measures how wrong the prediction was](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:421>) | What does loss measure? | Prediction, label, selected loss, numeric contribution. | Change the prediction and show the loss curve; explain the difference between a probability, decision, and loss. |
| [09 · Backpropagation computes gradients—only gradients](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:433>) | What does backpropagation compute? | Local derivative × upstream derivative. | Trace gradients backward while keeping weights fixed; make this distinction explicit in the controls. |
| [10 · The optimizer takes iterative, local steps](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:445>) | What does the optimizer change? | Current weight − learning rate × gradient. | Apply one update; compare step sizes and overshoot in the model behavior without decorative numeric overshoot. |
| [11 · One update has a strict causal order](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:463>) | Why must operations happen in this order? | Forward → loss → gradients → update. | Require the learner to choose the next operation; snapshot all values for reversible inspection. |
| [12 · Choose the model before validation gets worse](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:479>) | Why monitor validation during training? | Train and validation curves with checkpoint markers. | Scrub real or honestly labeled illustrative epochs; select the best validation checkpoint and preserve test isolation. |
| [13 · Humans choose the architecture and hyperparameters](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:500>) | Which settings do humans choose? | Parameter versus hyperparameter table. | Change layer width, activation, or learning rate in separate experiments; show computation and capacity tradeoffs. |
| [14 · The test set evaluates both scores and decisions](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:517>) | What is evaluated on the final test set? | Scores, chosen decision threshold, and confusion counts. | Lock the threshold before reveal; offer a distinct validation workspace for experimentation. |
| [15 · Error analysis starts with individual students](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:532>) | What can an individual error teach us? | One wrong student's inputs, score, action, true outcome. | Brush error groups and inspect cases; avoid selecting future model changes by repeated final-test checking. |
| [16 · Saving, deployment, and monitoring finish the lifecycle](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:553>) | What must be saved with the weights? | Feature order, transforms, architecture, weights, threshold. | Introduce a feature-order or scaling mismatch and trace its impact; restore the correct pipeline. |
| [17 · Different network families organize information differently](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:566>) | Why do different architectures exist? | Tabular, image, and sequence structure. | Choose a representation and show the relevant inductive assumption; avoid forcing every family into one tiny network diagram. |
| [18 · Try the tiny student-pass network](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:575>) | Can I predict this tiny network's answer? | A fully numeric input-to-output calculation. | Expose one controlled input/weight at a time; add a reset to the authored example and a computed receipt. |
| [19 · One full training cycle](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/neural-networks.html:588>) | Can I explain a complete training cycle? | One row or batch across all four learning operations. | Step, rewind, and replay once; end playback at completion and test that gradients precede weight updates. |

<a id="deep-learning"></a>

## Deep Learning

Source: [deep-learning.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/deep-learning.html>) · 12 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| 01 · Define the finish line | What exactly should the system output? | Classify / locate / segment, with one input image. | Keep the image stable while outputs change; explain that example scores are illustrative. |
| 02 · Collect reality, not shortcuts | What shortcut might the model learn? | Animal label versus background, with counterexamples. | Select a suspicious cue and reveal a counterexample; connect data collection choices to failure modes. |
| 03 · Split before you tune | Which examples may influence which choices? | Training weights / validation choices / sealed final test. | Move a duplicate or related-source group into an intentionally wrong split, then repair it with keyboard controls. |
| 04 · Turn examples into tensors | What is a tensor's shape? | One image channel, token ID, embedding row, or audio window. | Follow one input through the chosen representation; avoid implying token IDs have numeric semantic distances. |
| 05 · Inside one neuron | What does one neuron do? | x·w terms, bias, sum, activation. | Change one weight and trace a computed result; synchronize the left receipt and right neuron. |
| 06 · Depth builds features | Why might depth help? | Local pattern → composition → task-useful feature. | Step through a labeled illustrative hierarchy; explain that every network need not learn literal ears or eyes. |
| 07 · How learning happens | How does the correction cycle work? | Forward/loss/backprop/update with one numeric parameter. | Keep marks persistent across phases; gradients appear before weights change; provide pause and rewind. |
| 08 · Learn patterns, not the answer sheet | How do we reduce overfitting? | Method / what changes / when used / tradeoff. | Compare dropout training/evaluation, augmentation, weight decay, and early stopping as distinct interventions. |
| 09 · Choose an architecture | Why choose CNN, RNN, or attention? | Locality / sequential state / pairwise context comparison. | Give each architecture a readable subscene and one traceable input; avoid fitting all mechanisms into miniature labels. |
| 10 · Start from a pretrained model | What is reused during transfer learning? | Frozen backbone, new head, then selected unfrozen layers. | Toggle trainable regions with clear parameter labels; show the exact adaptation sequence and domain-mismatch caveat. |
| 11 · Make an honest judgement | What would make an evaluation honest and useful? | Per-class counts, calibration, subgroup slices, chosen threshold. | Inspect errors after a locked choice; label subsequent model revisions as needing fresh evaluation. |
| 12 · Ship the whole pipeline | What does deployment actually package? | Input contract → transforms → model → decision → monitoring. | Break one contract deliberately and repair it; show drift monitoring without implying drift alone proves failure. |

<a id="probability-sampling"></a>

## Probability & Sampling Distributions

Source: [probability-sampling.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/probability-sampling.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/probability-sampling.html:1>) | Why does a sample answer vary? | Population, sample, statistic, and parameter in four labeled positions. | Draw one explicit sample and show its mean; retain the population as the stable reference. |
| [02 · Intuition and objective](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/probability-sampling.html:1>) | How are probability, density, and frequency different? | Discrete mass versus continuous interval area. | Select an interval and accumulate area; do not interpret continuous curve height as point probability. |
| [03 · Worked example](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/probability-sampling.html:1>) | How is a standard error calculated? | SD, n, square root of n, and SE with units. | Work one numerical example; contrast individual-score spread with mean-estimate spread. |
| [04 · Reasoning with the method](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/probability-sampling.html:1>) | What is the sampling distribution? | One sample produces one dot in a distribution of means. | Reveal the population → sample → mean chain before showing hundreds of means; explain CLT conditions in deeper reading. |
| [05 · Interactive laboratory](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/probability-sampling.html:1>) | What changes with sample size? | Fixed seed, sample size, repeat count, and theoretical SE. | Generate samples outside draw; resize without resampling; animate added means and offer an explicit resample action. |
| [06 · Assumptions and failure modes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/probability-sampling.html:1>) | When is the usual SE misleading? | Independent versus clustered observations. | Compare samples with the same row count but different dependence; explain heavy-tail and design limits. |
| [07 · Practical workflow](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/probability-sampling.html:1>) | Which sampling design matches the question? | Population frame, selection, weighting, and estimator. | Build a simple sampling workflow with a bias scenario; separate random sampling from random assignment. |
| [08 · Interpretation and reporting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/probability-sampling.html:1>) | What should a sampling result report? | Estimate, design, n, SE/interval, and limitations. | Fill a short report from the actual sample state; identify the population to which it refers. |
| [09 · Knowledge checks](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/probability-sampling.html:1>) | Can I tell SD from SE? | One short classification task plus a missing calculation. | Mix answer positions and explain every distractor; retain static answers and a new numerical transfer example. |

<a id="confidence-hypothesis-testing"></a>

## Confidence Intervals & Hypothesis Testing

Source: [confidence-hypothesis-testing.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/confidence-hypothesis-testing.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/confidence-hypothesis-testing.html:1>) | What uncertainty does an estimate leave? | Point estimate and plausible values under a stated model. | Compare two samples with the same estimated effect but different precision. |
| [02 · Intuition and objective](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/confidence-hypothesis-testing.html:1>) | What do a confidence interval and a p-value ask? | Repeated-procedure coverage versus tail probability under H₀. | Select one question and highlight its reference distribution; avoid posterior-probability interpretations. |
| [03 · Worked example](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/confidence-hypothesis-testing.html:1>) | How do we compute one interval and test? | Effect, SE, statistic, tail area, interval endpoints. | Step a fully stated toy model; put assumptions and approximation labels beside the numbers. |
| [04 · Reasoning with the method](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/confidence-hypothesis-testing.html:1>) | How do alpha, beta, power, and effect size connect? | A true-null/false-null decision table. | Compare null and specified alternative distributions; power is prospective for an alternative, not observed truth probability. |
| [05 · Interactive laboratory](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/confidence-hypothesis-testing.html:1>) | Why does larger n change precision? | Fixed effect with two SE values. | Adjust n/effect with dynamic chart domains so extreme intervals remain visible; keep units and reference model explicit. |
| [06 · Assumptions and failure modes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/confidence-hypothesis-testing.html:1>) | When can the nominal result mislead? | Dependence, optional stopping, multiplicity, and model failure. | Select a failure scenario and inspect which inference condition breaks. |
| [07 · Practical workflow](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/confidence-hypothesis-testing.html:1>) | What should be decided before looking at results? | Question → meaningful effect → design → analysis plan → data. | Arrange the analysis sequence and explain corrections for a prespecified family of tests. |
| [08 · Interpretation and reporting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/confidence-hypothesis-testing.html:1>) | How do we report a result without overclaiming? | Estimate + interval + model + p + practical importance. | Compare two drafted conclusions; distinguish lack of evidence from evidence of negligible effect. |
| [09 · Knowledge checks](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/confidence-hypothesis-testing.html:1>) | Can I interpret uncertainty correctly? | A new interval/p-value pair and a sentence completion. | Use misconception-specific feedback and nonfixed answer positions; retain deeper explanations. |

<a id="evaluation-metrics"></a>

## Evaluation Metrics

Source: [evaluation-metrics.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/evaluation-metrics.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/evaluation-metrics.html:1>) | Which mistake actually matters? | An alert, a missed case, and their consequences. | Choose a concrete decision and establish the positive class before presenting metrics. |
| [02 · Intuition and objective](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/evaluation-metrics.html:1>) | Why do precision and recall use different denominators? | Highlight predicted-positive versus actual-positive sets. | Select a metric and brush its numerator/denominator; place regression and probability metrics in separate readable groups. |
| [03 · Worked example](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/evaluation-metrics.html:1>) | How do counts become the reported rates? | TP=80, FN=20, FP=90, TN=810 calculation table. | Reveal accuracy 89%, recall 80%, precision about 47.1%; link each rate to actual cases. |
| [04 · Reasoning with the method](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/evaluation-metrics.html:1>) | Which metric answers which question? | Error magnitude / label quality / ranking / calibration / decision cost. | Compare MAE/RMSE, ROC/PR, Brier/log loss, and reliability using topic-specific mini examples instead of one dense paragraph. |
| [05 · Interactive laboratory](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/evaluation-metrics.html:1>) | What changes when the threshold moves? | Counts, rate denominators, and expected cost. | Use fixed validation predictions or explicitly label the current scenario formula; update matrix, points, and operating point together. |
| [06 · Assumptions and failure modes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/evaluation-metrics.html:1>) | When does a metric hide a problem? | Rare positives, undefined precision, miscalibration, and distribution shift. | Show a majority classifier and a confident wrong predictor; handle zero denominators honestly. |
| [07 · Practical workflow](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/evaluation-metrics.html:1>) | How do we choose a metric and threshold? | Goal → validation → costs/capacity → locked action. | Select a threshold under a stated workload limit; keep final test separate. |
| [08 · Interpretation and reporting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/evaluation-metrics.html:1>) | What belongs beside a score? | Split, prevalence, threshold, sample count, interval, and baseline. | Assemble a report and flag omitted denominators; make uncertainty estimators explicit. |
| [09 · Knowledge checks](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/evaluation-metrics.html:1>) | Can I choose and compute the right metric? | One novel confusion matrix and one regression example. | Complete a missing cell/rate and explain which metric matches the decision; do not reward the same answer position repeatedly. |

<a id="data-leakage-pipelines"></a>

## Data Leakage & Pipelines

Source: [data-leakage-pipelines.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/data-leakage-pipelines.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/data-leakage-pipelines.html:1>) | How can a good score be misleading? | A feature available before versus after the outcome. | Reveal the timing of each feature and identify an unavailable-at-prediction clue. |
| [02 · Intuition and objective](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/data-leakage-pipelines.html:1>) | What information is allowed to cross a split? | Fit on train; transform held-out rows with frozen parameters. | Trace a scaler statistic across a pipeline and expose an intentionally leaked version. |
| [03 · Worked example](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/data-leakage-pipelines.html:1>) | What does leakage change in a concrete example? | Safe versus leaked workflow with identical split IDs. | Compare an explicitly computed toy example or labeled schematic; explain why score inflation is not a fixed amount. |
| [04 · Reasoning with the method](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/data-leakage-pipelines.html:1>) | What kinds of leakage exist? | Features, duplicate rows, groups, time, and repeated selection. | Inspect one case per type; replace the repeated generic paragraph with specific causal paths. |
| [05 · Interactive laboratory](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/data-leakage-pipelines.html:1>) | Can I repair this pipeline? | Current ordering of split, imputation, scaling, selection, fit, score. | Select/move steps using buttons as well as drag; show exactly which fit call crossed the boundary. |
| [06 · Assumptions and failure modes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/data-leakage-pipelines.html:1>) | What can pipelines fail to prevent? | Bad timestamps, target proxies, wrong groups, and changing availability. | Show an operationally impossible feature that remains invalid despite correct software ordering. |
| [07 · Practical workflow](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/data-leakage-pipelines.html:1>) | How should nested selection work? | Outer evaluation around an inner tuning loop. | Step one outer fold and reveal refitted inner transforms; preserve group/time constraints. |
| [08 · Interpretation and reporting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/data-leakage-pipelines.html:1>) | How do I document a defensible pipeline? | Feature availability, split unit, fitted steps, and sealed test. | Produce a compact provenance checklist from concrete choices. |
| [09 · Knowledge checks](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/data-leakage-pipelines.html:1>) | Can I spot a new leakage path? | One unfamiliar grouped/time-dependent scenario. | Ask which information crossed the boundary and how to repair it; give specific feedback for the chosen misconception. |

<a id="regression-diagnostics"></a>

## Regression Diagnostics

Source: [regression-diagnostics.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-diagnostics.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-diagnostics.html:1>) | Why can a high R-squared coexist with a bad model? | Similar summary score, different residual patterns. | Compare two labeled examples on equal axes and ask which model claim is unsupported. |
| [02 · Intuition and objective](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-diagnostics.html:1>) | What is a residual checking? | Actual − fitted value, with one row. | Link raw plot, fitted value, and residual plot by observation ID. |
| [03 · Worked example](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-diagnostics.html:1>) | How does an influential point differ from an outlier? | Residual size, leverage, and coefficient change. | Remove/restore a selected point in a controlled comparison; do not prescribe automatic deletion. |
| [04 · Reasoning with the method](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-diagnostics.html:1>) | Which diagnostic answers which question? | Residual/fitted, Q–Q, scale-location, leverage, and VIF. | Focus one diagnostic at a time with a question and response; distinguish predictor normality from residual inference assumptions. |
| [05 · Interactive laboratory](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-diagnostics.html:1>) | What does a curve or funnel suggest? | Healthy/curved/fanning residual thumbnails. | Select a pattern with a stable dataset; link a possible remedy to a refit, labeled illustrative if no fit occurs. |
| [06 · Assumptions and failure modes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-diagnostics.html:1>) | What cannot a residual plot establish? | Independence from design, causal validity, and limited sample power. | Show a time/group violation even when the scatter looks harmless. |
| [07 · Practical workflow](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-diagnostics.html:1>) | How should a diagnostic change the analysis? | Symptom → investigate → justified model change → validate. | Choose a response and compare outcomes; retain the original dataset and model for sensitivity analysis. |
| [08 · Interpretation and reporting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-diagnostics.html:1>) | What should the report say? | Finding, changed assumption/model, sensitivity, and resulting uncertainty. | Assemble a short diagnostic note; distinguish a confidence interval from a prediction interval. |
| [09 · Knowledge checks](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/regression-diagnostics.html:1>) | Can I match symptom and response? | A novel plot and a choice of scientifically justified actions. | Require a reason before reveal; include a keep-and-investigate answer rather than always delete or transform. |

<a id="random-forest"></a>

## Random Forest

Source: [random-forest.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/random-forest.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/random-forest.html:1>) | Why combine several trees? | One unstable tree versus an average/vote. | Perturb one training sample and compare variability of single-tree and ensemble predictions. |
| [02 · Intuition and objective](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/random-forest.html:1>) | What makes trees different? | Bootstrap rows and random candidate features. | Reveal one tree's sample and a node's feature subset; distinguish row sampling from feature sampling. |
| [03 · Worked example](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/random-forest.html:1>) | How is a forest prediction produced? | Three trees' votes or numeric predictions. | Accumulate one selected row's tree outputs; compute the aggregate directly. |
| [04 · Reasoning with the method](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/random-forest.html:1>) | Why does correlation between trees matter? | Independent versus highly similar prediction errors. | Compare averaging behavior under clearly labeled scenarios; keep bias and variance separate. |
| [05 · Interactive laboratory](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/random-forest.html:1>) | What is an out-of-bag prediction? | In-bag membership across trees for one observation. | Compute votes only from trees that omitted the row; replace the current stylized OOB error curve if it remains labeled measured error. |
| [06 · Assumptions and failure modes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/random-forest.html:1>) | What problems do more trees not solve? | Leakage, biased sampling, drift, and unreliable importance. | Show an ensemble agreeing on a wrong shortcut; explain permutation importance with correlated predictors. |
| [07 · Practical workflow](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/random-forest.html:1>) | How should a forest be tuned and validated? | Leaf size, feature subset, class weights, OOB/CV, final test. | Tune on development estimates and compare to a baseline; do not treat OOB as an unlimited unbiased tuning resource. |
| [08 · Interpretation and reporting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/random-forest.html:1>) | What should be reported? | Evaluation design, parameters, class metrics, calibration, and importance limits. | Build a forest summary with explicit predictive rather than causal interpretation. |
| [09 · Knowledge checks](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/random-forest.html:1>) | Can I trace a held-out vote? | A row present in some bootstrap samples and absent in others. | Select the valid OOB voters and compute the result; give feedback explaining excluded trees. |

<a id="gradient-boosting"></a>

## Gradient Boosting

Source: [gradient-boosting.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/gradient-boosting.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/gradient-boosting.html:1>) | Why add another learner to the current model? | Current prediction, error, proposed correction. | Show a weak learner contributing a small improvement rather than replacing the ensemble. |
| [02 · Intuition and objective](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/gradient-boosting.html:1>) | What is learned at the next round? | Negative loss gradient; squared-error residual as a special case. | Highlight targets for a new learner under squared loss, then explain why other losses differ. |
| [03 · Worked example](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/gradient-boosting.html:1>) | How do three rounds build a prediction? | Initial prediction + learning-rate-scaled corrections. | Step the additive calculation with actual values and a consistent selected row. |
| [04 · Reasoning with the method](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/gradient-boosting.html:1>) | Why do learning rate and round count interact? | Few large steps versus many small contributions. | Compare trajectories with fixed training data; explain that their product alone is not a complete equivalence. |
| [05 · Interactive laboratory](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/gradient-boosting.html:1>) | When should we stop adding rounds? | Train/validation loss and the selected checkpoint. | Use computed or visibly illustrative curves; fix vertical orientation, label axes, and freeze final-test data. |
| [06 · Assumptions and failure modes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/gradient-boosting.html:1>) | What can a complex boosted model still get wrong? | Overfit, leakage, miscalibration, and shifted data. | Inspect a failure case and compare regularization options without presenting gain importance as causality. |
| [07 · Practical workflow](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/gradient-boosting.html:1>) | How should tuning be organized? | Rate, depth, rounds, subsampling, validation. | Change one setting, refit on train, choose on validation; use cancellation for obsolete computations. |
| [08 · Interpretation and reporting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/gradient-boosting.html:1>) | What do we report about the selected ensemble? | Loss, validation strategy, stopping round, parameters, baseline, limitations. | Produce a compact model record and explain why training loss did not select the final round. |
| [09 · Knowledge checks](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/gradient-boosting.html:1>) | Can I compute the next prediction? | Initial 10 plus a learner's correction scaled by eta. | Complete one update and identify when residual fitting is valid; explain the distractors. |

<a id="missing-data-encoding"></a>

## Missing Data & Encoding

Source: [missing-data-encoding.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/missing-data-encoding.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/missing-data-encoding.html:1>) | What might an empty cell mean? | Missing, structural absence, and a real zero. | Select a missing value and show possible mechanisms without pretending the mechanism is identifiable from appearance. |
| [02 · Intuition and objective](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/missing-data-encoding.html:1>) | What assumptions do filling and encoding add? | Imputation assumptions and unordered/ordered category geometry. | Compare a raw row with transformed columns; name the modeling goal before choosing a method. |
| [03 · Worked example](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/missing-data-encoding.html:1>) | Why can mean filling distort an analysis? | Observed values, filled value, and changed variability. | Trace a high-income missingness example; preserve the uncertainty about unseen values. |
| [04 · Reasoning with the method](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/missing-data-encoding.html:1>) | How do MCAR, MAR, MNAR, and encoding differ? | Mechanism assumptions separately from representation choices. | Use one miniature for mechanisms and one for one-hot/ordinal/target encoding; do not overload a single chart. |
| [05 · Interactive laboratory](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/missing-data-encoding.html:1>) | How should methods be compared fairly? | Scenario assumptions, missing rate, method, target metric. | Replace fixed universal bias rankings with computed toy scenarios or clearly labeled illustrative indices; expose sensitivity to the mechanism. |
| [06 · Assumptions and failure modes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/missing-data-encoding.html:1>) | What can imputation not recover automatically? | Uncertainty, unseen categories, leakage, and false ordering. | Inspect a target-encoding leakage case and a category-order counterexample. |
| [07 · Practical workflow](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/missing-data-encoding.html:1>) | What belongs in the fitted pipeline? | Split → train-fit imputer/encoder → frozen transform. | Step a new category through the saved unknown-level policy; show cross-fitting for target encoding. |
| [08 · Interpretation and reporting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/missing-data-encoding.html:1>) | What must be documented? | Missingness rate, assumptions, method, references, unknown policy, sensitivity. | Build a transformation record from the current scenario without implying assumptions were proven. |
| [09 · Knowledge checks](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/missing-data-encoding.html:1>) | Can I choose a safe transformation? | A new unordered category or missing-not-at-random case. | Ask for the assumption and pipeline placement, not merely a method name; retain all answer explanations. |

<a id="imbalanced-classification"></a>

## Imbalanced Classification

Source: [imbalanced-classification.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/imbalanced-classification.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/imbalanced-classification.html:1>) | Why can 99% accuracy be useless? | 99 negatives and one positive under an always-negative rule. | Reveal the missed positive and its cost before introducing a metric dashboard. |
| [02 · Intuition and objective](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/imbalanced-classification.html:1>) | Why does prevalence change precision? | Actual positives versus all predicted positives. | Keep sensitivity/specificity fixed while changing prevalence; separate this from threshold-induced changes. |
| [03 · Worked example](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/imbalanced-classification.html:1>) | How many false alerts occur in the worked example? | 10,000 → 100 positive / 9,900 negative → TP90 / FP495. | Correct the counts, 585 alerts, and 15.4% precision; link the full confusion matrix to a workload view. |
| [04 · Reasoning with the method](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/imbalanced-classification.html:1>) | Which tradeoffs matter for rare positives? | Recall, precision, PR/ROC, calibration, cost, and capacity. | Explain each with one denominator or decision; replace generic reasoning prose with linked mini examples. |
| [05 · Interactive laboratory](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/imbalanced-classification.html:1>) | What happens when we lower the threshold? | Alerts, missed positives, false alerts, and expected cost. | Use fixed validation score distributions or explicitly label the current scenario model; give a capacity constraint. |
| [06 · Assumptions and failure modes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/imbalanced-classification.html:1>) | Why can resampling mislead evaluation? | Training-only resampling versus natural evaluation prevalence. | Compare a falsely balanced test report with natural-prevalence precision; explain recalibration conditions. |
| [07 · Practical workflow](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/imbalanced-classification.html:1>) | How do we choose a usable operating point? | Costs/capacity → train-fold weighting/resampling → validation threshold. | Lock a feasible choice before final test; preserve group/time structure as needed. |
| [08 · Interpretation and reporting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/imbalanced-classification.html:1>) | What should accompany the final score? | Prevalence, counts, threshold, PR metrics, calibration, uncertainty. | Generate a concise decision report with investigation workload, not just a percentage. |
| [09 · Knowledge checks](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/imbalanced-classification.html:1>) | Can I compute workload for a new prevalence? | A fresh cohort with fixed sensitivity and specificity. | Complete TP/FP and precision; use feedback specific to confusing specificity with precision. |

<a id="experimental-design"></a>

## Experimental Design & Randomisation

Source: [experimental-design.html](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/experimental-design.html>) · 9 stages

| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |
|---|---|---|---|
| [01 · The problem](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/experimental-design.html:1>) | What causal comparison do we want? | Population, treatment, comparator, outcome, time. | Choose a concrete estimand before choosing a statistical test. |
| [02 · Intuition and objective](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/experimental-design.html:1>) | What does random assignment accomplish? | Confounder balance in expectation versus one realized allocation. | Randomize repeatedly and show finite-sample imbalance; separate assignment from random sampling. |
| [03 · Worked example](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/experimental-design.html:1>) | Why are twenty schools not six hundred independent assignments? | School clusters with student members. | Select an assignment unit and highlight all its students; keep the independent unit explicit. |
| [04 · Reasoning with the method](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/experimental-design.html:1>) | How do blocking, blinding, and intention-to-treat differ? | Design choice / threat addressed / what it does not fix. | Trace one participant from assignment through analysis; retain noncompliance and interference caveats. |
| [05 · Interactive laboratory](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/experimental-design.html:1>) | How does clustering affect effective information? | Design effect 1+(m−1)ICC and n/design effect. | Adjust n, cluster size, and ICC; label approximation assumptions and replace the ad hoc power formula before presenting it as calculated power. |
| [06 · Assumptions and failure modes](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/experimental-design.html:1>) | What can break a randomized comparison? | Attrition, spillover, noncompliance, and outcome switching. | Select a failure and show the broken comparison; do not suggest randomization cures every later bias. |
| [07 · Practical workflow](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/experimental-design.html:1>) | What should be planned before recruitment? | Estimand, unit, allocation, power, outcomes, analysis, missingness. | Build the protocol in causal order; include plausible attrition and number of clusters. |
| [08 · Interpretation and reporting](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/experimental-design.html:1>) | What belongs in a transparent report? | Allocation, exclusions, adherence, effect/interval, harms, deviations. | Fill a short report and identify a missing design fact. |
| [09 · Knowledge checks](</Users/elijahang/Library/Mobile Documents/com~apple~CloudDocs/StatML Academy/modules/experimental-design.html:1>) | Can I identify the unit and analysis implication? | A new clinic/classroom randomization scenario. | Choose the independent unit and explain why row count is insufficient; retain static feedback. |
