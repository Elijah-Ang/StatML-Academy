# Every-section visual review

All 359 sections across 33 topics. Each row records its learning question, current experiment/renderer, and an instructional action or remaining design requirement. Completed priority experiments are distinguished from proposed work. See `visual-teaching-review.md` for module-level judgments, scientific limits, implementation snippets and priorities.

## Simple Linear Regression

8 sections · approved pilot retained.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The editable reality | What is the line trying to explain? | Approved pilot experiment | Change C’s score from 61 to 80. Which part of the pattern changed? |
| 2. Make your guess | What do slope and intercept actually do? | Approved pilot experiment | Change only the slope. Then change only the intercept. Watch which movement each controls. |
| 3. Measuring the mistakes | How wrong is one prediction? | Approved pilot experiment | Select two students on opposite sides of your line. Compare the residual signs. |
| 4. A penalty that cannot cancel | Why square the errors? | Approved pilot experiment | Turn on squared-error tiles. Increase the slope and watch the largest misses dominate. |
| 5. The least-squares engine | How does the best line get its numbers? | Approved pilot experiment | Fit the line, then edit one observation. The calculation receipt updates from those same rows. |
| 6. The optimal line | What does “best” promise? | Approved pilot experiment | Press Fit line. Then nudge the slope in either direction: SSE cannot improve below the optimum. |
| 7. The model scorecard | Better than what—and by how much? | Approved pilot experiment | Edit a score into an outlier. Inspect the fit, the residuals and the scorecard together. |
| 8. Predict with care | When is the line being asked to guess too far? | Approved pilot experiment | Move the prediction input beyond five hours. Notice when the visual marks extrapolation. |

## K-Means Clustering

9 sections · approved pilot retained.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. Start without labels | What can we learn without a target? | Approved pilot experiment | Select a customer. Read their original measurements before thinking about groups. |
| 2. Place the first centers | Why does the starting point matter? | Approved pilot experiment | Try a new start, then step through the same data. Notice where the centers begin. |
| 3. Assign to the nearest center | Which center wins this point? | Approved pilot experiment | Press Next step to assign the points. Select a point near a boundary and inspect its distances. |
| 4. Recenter by averaging | Why does the center move to the mean? | Approved pilot experiment | After assignment, press Next step again. Watch the centers move while memberships stay fixed. |
| 5. Repeat until assignments settle | When should the algorithm stop? | Approved pilot experiment | Run to convergence, then go Back twice. Your earlier snapshots remain inspectable. |
| 6. Measure within-cluster spread | What is WCSS actually adding up? | Approved pilot experiment | Select a point far from its center. Compare its contribution with a nearby point. |
| 7. Look for an elbow | How many groups earn their complexity? | Approved pilot experiment | Switch the visual to the elbow curve. Choose a K near the bend and inspect its groups. |
| 8. Choose what distance means | Should a dollar count as much as a year? | Approved pilot experiment | Choose raw units or standardized units, then press Run. The same customers stay in place while the fitted groups change. |
| 9. Find the limits | When do neat circles tell the wrong story? | Approved pilot experiment | Choose Curved moons or Add outlier, then run. Describe what the method missed. |

## Naive Bayes

12 sections · approved pilot retained.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. Begin with labeled examples | What does the model learn from? | Approved pilot experiment | Inspect the class counts. With all clues ignored, the visual returns to these priors. |
| 2. Separate features from the answer | What can the filter know at prediction time? | Approved pilot experiment | Change “free” from present to absent, then to ignore. These are three different questions. |
| 3. Protect the unseen examples | How do we check learning honestly? | Approved pilot experiment | Inspect the split diagram. Only training information flows into the model. |
| 4. Choose a likelihood for the feature | Why are there several kinds of Naive Bayes? | Approved pilot experiment | Choose a variant to inspect its representation. The email posterior lab remains explicitly Bernoulli. |
| 5. Count within each class | What does “given spam” mean? | Approved pilot experiment | Use only the “free” clue. Compare its two likelihoods with the final posterior. |
| 6. Name the naive assumption | Why can we multiply the clues? | Approved pilot experiment | Duplicate the “free” feature. Watch the model become more confident for the same underlying message. |
| 7. Turn scores into a posterior | How does evidence become a probability? | Approved pilot experiment | Add “meeting” as present. Follow its likelihood factor through both scores before looking at the posterior. |
| 8. A continuous clue needs a density | What changes when the feature is a height? | Approved pilot experiment | Move the plant height marker through the overlap. Read the two density heights and normalized class probability. |
| 9. Avoid zeros and tiny-number trouble | Why add smoothing and use logarithms? | Approved pilot experiment | Set unicorn to present and smoothing to zero. Increase α and inspect the repaired likelihood. |
| 10. Validate the whole recipe | What happens in one cross-validation round? | Approved pilot experiment | Select each validation fold. Trace the held-out role as it moves across rounds. |
| 11. Choose a decision, not just a class | When should a message be flagged? | Approved pilot experiment | Move the threshold past the current posterior. The evidence stays the same; the action changes. |
| 12. Put the whole story together | What should you remember when using it? | Approved pilot experiment | Ignore every clue, then add them one at a time. Explain each change before reading the result. |

## Evaluation Metrics

9 sections · approved pilot retained.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. Begin with the decision | What happens when this model is wrong? | Approved pilot experiment | Inspect the two types of mistakes in the matrix before moving the threshold. |
| 2. Choose the denominator | Whose success rate are we measuring? | Approved pilot experiment | Choose Precision or Recall in the visual. The matrix highlights the cases in its denominator. |
| 3. Worked example | How can 89% accuracy hide so many false alerts? | Approved pilot experiment | Select the false-positive cell to inspect an individual prediction that contributed to it. |
| 4. Separate ranking from decisions | What does a threshold change? | Approved pilot experiment | Compare ROC above with precision–recall below. Move the threshold and follow both operating points. |
| 5. Interactive laboratory | Where should the threshold sit? | Approved pilot experiment | Adjust threshold and error costs. Compare a candidate decision with the starting point. |
| 6. Assumptions and failure modes | When is a metric answering the wrong question? | Approved pilot experiment | Raise the threshold to 1.00. See the high-accuracy all-negative baseline and its zero recall. |
| 7. Use an honest workflow | When do we look at the final test? | Approved pilot experiment | Return to a threshold you can justify. State its trade-off before reading the scores. |
| 8. Report probability quality too | Does “70%” behave like seventy out of a hundred? | Approved pilot experiment | Open the calibration view. Compare each bin’s average prediction with its observed positive fraction. |
| 9. Check the reasoning | Can you explain the result without hiding behind a score? | Approved pilot experiment | Explain the precision denominator, the recall denominator and the reason for your threshold. |

## Analysis of Variance (ANOVA)

16 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Raw Data | Why do scores differ even within one method? | statistics / groups | Select a row to highlight the same dot; distinguish individual scores from group means. |
| 2. The Research Question | Is the gap large compared with ordinary variation? | statistics / groups | Adjust signal or noise separately with a fixed seed; keep the other quantity constant. |
| 3. The Rules of the Game | Which assumptions support this comparison? | statistics / groups | Switch between unequal spread, outlier, and repeated-student examples; state that design cannot be diagnosed from a plot alone. |
| 4. Variance Decomposition | Where does total variation come from? | statistics / partition | Reveal within-group and between-group squared distances in sequence; show their sum with correct weighting. |
| 5. The F-Statistic | Why divide one mean square by another? | statistics / ratio | Link each term of F to its visual component; compare a null-like and separated-groups scenario. |
| 6. Degrees of Freedom | Why are only some values free? | statistics / partition | Correct 8 + 15 + 7; transfer the constraint to k−1 and N−k using group counts. |
| 7. A Worked Example | How do the numbers produce F? | statistics / ratio | Step through the displayed dataset calculation; synchronize the worked values with the current preset. |
| 8. Reading the ANOVA Table | How do I read an ANOVA table? | statistics / table | Focus or tap a table cell to highlight its geometric meaning; keep explanations available without hover. |
| 9. How Big Is The Effect? | Does a small p-value mean a large effect? | statistics / ratio | Link eta-squared to the variance partition; separate association, uncertainty, and causal interpretation. |
| 10. Post-Hoc Testing | Which groups differ? | statistics / contrasts | Reveal adjusted pairwise comparisons together; show the multiplicity family and avoid an automatic unadjusted t-test sequence. |
| 11. Enter Two-Way ANOVA | Why add a second factor? | statistics / interaction | Select a method–sleep cell and reveal its observations; preserve the distinction between factors and outcomes. |
| 12. Cells & Marginal Means | What is a marginal mean? | statistics / interaction | Trace a selected average from its cells; flag that equal averaging here assumes the balanced teaching design. |
| 13. The Interaction Effect | What does an interaction mean? | statistics / interaction | Move from parallel to nonparallel lines; crossing is optional, and observed patterns alone do not establish significance. |
| 14. Building the ANOVA Table | How is two-way variation partitioned? | statistics / partition | Add one component at a time; retain clear balanced-design assumptions behind the decomposition. |
| 15. Reading the Two-Way Table | What should I read first in the output? | statistics / table | Select output rows to highlight relevant lines and cells; remove claims that crossing alone confirms a population interaction. |
| 16. Caveats & Recap | When should I choose a different analysis? | statistics / groups | Run a short scenario choice; distinguish invalid reference inference from an uncomputable F statistic. |

## Bias-Variance Trade-Off & Resampling

12 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Prediction Problem | Why can fitted predictions differ from reality? | regression-lab / fit | Use a known simulated population and label which quantities are hidden in real data. |
| 2. High Bias (Underfitting) | What does a consistently rigid model miss? | regression-lab / fit | Resample with a fixed population and show their mean prediction as well as individual fits. |
| 3. High Variance (Overfitting) | What makes a flexible fit unstable? | regression-lab / resamples | Compare repeated fits; separate variability across datasets from residual noise within one dataset. |
| 4. The Error Decomposition | Where does the squared-error decomposition apply? | regression-lab / decomposition | Accumulate terms from repeated simulated samples; label empirical estimates and squared-error conditions. |
| 5. Interactive: The Trade-Off | Must error always follow a neat U-shape? | regression-lab / scores | Scrub complexity and inspect repeated-sample results; avoid treating the illustrated sweet spot as a universal law. |
| 6. The Testing Problem | Why is training error insufficient? | regression-lab / scores | Reveal an untouched development holdout and ask which score supports selection. |
| 7. 1. The Validation Set | Why can one validation split be noisy? | regression-lab / folds | Redraw an explicit development split; rename Test labels to Validation and keep final test separate. |
| 8. 2. k-Fold Cross-Validation | What does K-fold validation average? | regression-lab / folds | Step the folds with distinct fitted models; explain dependence among scores and limits on uncertainty claims. |
| 9. 3. Leave-One-Out (LOOCV) | What changes in leave-one-out? | regression-lab / folds | Select a row, inspect its held-out error, and discuss computation and estimator-dependent variance without absolute claims. |
| 10. 4. The Bootstrap | What does sampling with replacement mean? | regression-lab / bootstrap | Draw one bootstrap sample, then many; link duplicate counts to the estimator distribution and interval method. |
| 11. Limitations in Practice | Which resampling method answers my question? | regression-lab / folds | Choose a method for a scenario; include block or cluster resampling where independence fails. |
| 12. Summary & Synthesis | Can I distinguish bias, variance, and uncertainty? | regression-lab / resamples | Require an explanation before revealing the method; retain a comparison table for later reference. |

## Chi-Square Test of Independence

7 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Raw Counts | Why use counts instead of averages? | statistics / counts | Select a person and highlight their table cell; distinguish observed counts from percentages. |
| 2. Hypotheses & Marginals | What does independence predict? | statistics / counts | Lock margins and compare tables with different association patterns. |
| 3. Expected Counts | Why multiply row and column totals? | statistics / counts | Highlight each denominator and margin as the expected cell fills; reveal the other cells only after a prediction. |
| 4. Residuals & Contributions | Why square and divide by expected count? | statistics / contributions | Select a cell and link its signed residual with its nonnegative contribution; sum unrounded values. |
| 5. The Reference Distribution | How unusual is the statistic under independence? | statistics / distribution | Move a hypothetical statistic along the reference curve; replace the claim that chance has been ruled out. |
| 6. Reading the Output | What can I conclude from the output? | statistics / counts | Link the report to residual signs and effect size; mark descriptive size conventions as context dependent. |
| 7. Assumptions & Caveats | When is the approximation unsuitable? | statistics / counts | Inspect a sparse-count case and choose exact or simulation-based inference where appropriate; keep the original observed data visible. |

## Classification Trees

15 sections · priority visuals rebuilt this pass.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Raw Data | What is the target category? | Implemented: Inspect a point in the two-input space. Blue dots and red crossed dots distinguish the two target classes. | Retain section alignment; validate the scientific conditions in the module review. |
| 2. The Train / Test Split | Which rows may choose a split? | Implemented: Inspect the three sample groups. Test outcomes remain sealed while thresholds and leaf values are learned from training data. | Retain section alignment; validate the scientific conditions in the module review. |
| 3. The Root Node | What does the root predict before splitting? | Implemented: Count the two classes in the root. Before any split, every query would receive this same class-1 fraction. | Retain section alignment; validate the scientific conditions in the module review. |
| 4. Measuring Messiness | What is impurity? | Implemented: Move the toy class proportion from 0 to 1. Compare a pure node with a half-and-half node on the Gini curve. | Retain section alignment; validate the scientific conditions in the module review. |
| 5. Testing Every Question | Why inspect several candidate questions? | Implemented: Scrub legal midpoint thresholds and switch the candidate feature. Compare the spatial cut with the minimum of the impurity curve. | Retain section alignment; validate the scientific conditions in the module review. |
| 6. How the Tree Scores One Split | How is split improvement calculated? | Implemented: Compare the class mixtures in the two children. Weight their impurities by their sample sizes before subtracting from the parent. | Retain section alignment; validate the scientific conditions in the module review. |
| 7. Recursive Splitting | How is the procedure reused in a child? | Implemented: Reveal another split level. The new question applies only inside the parent’s rectangle. | Retain section alignment; validate the scientific conditions in the module review. |
| 8. The Decision Boundary | Why do tree boundaries look rectangular? | Implemented: Move a query across a cut. Follow the gold rectangle to its leaf and notice why axis-aligned splits make rectangular regions. | Retain section alignment; validate the scientific conditions in the module review. |
| 9. Depth Limiting vs. Post-Pruning | How do depth limits and pruning differ? | Implemented: Raise the post-pruning penalty. The experiment starts from a fixed depth-5 tree, so it removes existing branches rather than stopping early. | Retain section alignment; validate the scientific conditions in the module review. |
| 10. Choosing Tree Depth | How should we select tree depth? | Implemented: Compare training and validation error across maximum depths. Use held-out development evidence to choose complexity. | Retain section alignment; validate the scientific conditions in the module review. |
| 11. Classifying Test Points | How does one new row travel through the tree? | Implemented: Move the query across a threshold. Follow the yes/left or no/right route and verify the resulting leaf fraction. | Retain section alignment; validate the scientific conditions in the module review. |
| 12. Performance Metrics | Which errors does the tree make? | Implemented: Read the validation points inside each confusion-matrix cell. Identify false positives and false negatives before comparing the counts. | Retain section alignment; validate the scientific conditions in the module review. |
| 13. Reading Tree Output | What belongs in tree output? | Implemented: Trace a query and reconcile its path, leaf sample size and predicted class fraction. A leaf fraction is not a guarantee of correctness. | Retain section alignment; validate the scientific conditions in the module review. |
| 14. Interactive Playground | What changes when I modify complexity? | Implemented: Change depth or minimum leaf size while keeping the sample fixed. Inspect how the decision regions change. | Retain section alignment; validate the scientific conditions in the module review. |
| 15. Limitations & Model Choice | When should I prefer another model? | Implemented: Move one training input and compare the resulting partitions. A small data change can alter a greedy tree. | Retain section alignment; validate the scientific conditions in the module review. |

## Confidence Intervals & Hypothesis Testing

9 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The problem | What uncertainty does an estimate leave? | statistics / interval | Compare two samples with the same estimated effect but different precision. |
| 2. Intuition and objective | What do a confidence interval and a p-value ask? | statistics / interval | Select one question and highlight its reference distribution; avoid posterior-probability interpretations. |
| 3. Worked example | How do we compute one interval and test? | statistics / interval | Step a fully stated toy model; put assumptions and approximation labels beside the numbers. |
| 4. Reasoning with the method | How do alpha, beta, power, and effect size connect? | statistics / power | Compare null and specified alternative distributions; power is prospective for an alternative, not observed truth probability. |
| 5. Interactive laboratory | Why does larger n change precision? | statistics / interval | Adjust n/effect with dynamic chart domains so extreme intervals remain visible; keep units and reference model explicit. |
| 6. Assumptions and failure modes | When can the nominal result mislead? | statistics / power | Select a failure scenario and inspect which inference condition breaks. |
| 7. Practical workflow | What should be decided before looking at results? | statistics / interval | Arrange the analysis sequence and explain corrections for a prespecified family of tests. |
| 8. Interpretation and reporting | How do we report a result without overclaiming? | statistics / interval | Compare two drafted conclusions; distinguish lack of evidence from evidence of negligible effect. |
| 9. Knowledge checks | Can I interpret uncertainty correctly? | statistics / interval | Use misconception-specific feedback and nonfixed answer positions; retain deeper explanations. |

## Correlation

10 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Raw Data | What makes observations paired? | statistics / scatter | Link a table row to its point; intentionally swap a pair to show why row identity matters. |
| 2. Direction and Form | What do direction and form tell us? | statistics / scatter | Select a pattern while preserving axes; name linear versus non-linear association before showing r. |
| 3. Measuring Strength: r | What does r measure? | statistics / scatter | Change noise with the same underlying points; keep slope and r conceptually distinct. |
| 4. Formal Hypotheses | What is the null about? | statistics / distribution | Predict whether a sample can have nonzero r when population rho is zero; replace the significant-alternative wording. |
| 5. How it works: Covariability | Why multiply deviations from the means? | statistics / deviations | Brush each quadrant and accumulate signed contributions; link the denominator to scaling rather than unexplained normalization. |
| 6. Assumptions: Paired & Linear | Can r miss a strong pattern? | statistics / scatter | Toggle the U-shape and reveal near-zero r; do not call this absence of all dependence. |
| 7. Robustness Check: Outliers | Why can one point change r so much? | statistics / scatter | Move one selected point using drag or numeric inputs; retain a ghost of its original location. |
| 8. The Inferential Result | What does the test result mean? | statistics / distribution | Step through the null reference and report; define inference assumptions separately from calculating descriptive r. |
| 9. The Golden Rule: Causation | Why does association not establish cause? | statistics / causal | Reveal temperature as a shared cause of two measures; require an association-only conclusion. |
| 10. Limitations & Summary | Which correlation should I use? | statistics / scatter | Classify linear, monotonic curved, and U-shaped examples; give corrective feedback rather than a blanket switch rule. |

## Data Leakage & Pipelines

9 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The problem | How can a good score be misleading? | workflow / timing | Reveal the timing of each feature and identify an unavailable-at-prediction clue. |
| 2. Intuition and objective | What information is allowed to cross a split? | workflow / pipeline | Trace a scaler statistic across a pipeline and expose an intentionally leaked version. |
| 3. Worked example | What does leakage change in a concrete example? | workflow / means | Compare an explicitly computed toy example or labeled schematic; explain why score inflation is not a fixed amount. |
| 4. Reasoning with the method | What kinds of leakage exist? | workflow / leakage | Inspect one case per type; replace the repeated generic paragraph with specific causal paths. |
| 5. Interactive laboratory | Can I repair this pipeline? | workflow / pipeline | Select/move steps using buttons as well as drag; show exactly which fit call crossed the boundary. |
| 6. Assumptions and failure modes | What can pipelines fail to prevent? | workflow / timing | Show an operationally impossible feature that remains invalid despite correct software ordering. |
| 7. Practical workflow | How should nested selection work? | workflow / nested | Step one outer fold and reveal refitted inner transforms; preserve group/time constraints. |
| 8. Interpretation and reporting | How do I document a defensible pipeline? | workflow / report | Produce a compact provenance checklist from concrete choices. |
| 9. Knowledge checks | Can I spot a new leakage path? | workflow / leakage | Ask which information crossed the boundary and how to repair it; give specific feedback for the chosen misconception. |

## Deep Learning

12 sections · priority visuals rebuilt this pass.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. Define the finish line | What exactly should the system output? | Implemented: Keep the apple image fixed. Compare an image label, a location box and a pixel mask: each task asks for a different output. | Retain section alignment; validate the scientific conditions in the module review. |
| 2. Collect reality, not shortcuts | What shortcut might the model learn? | Implemented: Change only the background. The illustrated shortcut rule changes its prediction even though the apple is identical. | Retain section alignment; validate the scientific conditions in the module review. |
| 3. Split before you tune | Which examples may influence which choices? | Implemented: Inspect the disjoint training, validation and test groups. Only training examples may update weights or fit preprocessing. | Retain section alignment; validate the scientific conditions in the module review. |
| 4. Turn examples into tensors | What is a tensor's shape? | Implemented: Select a pixel address. Find its entry in the array, then count how eight examples create a batch of 200 numbers. | Retain section alignment; validate the scientific conditions in the module review. |
| 5. Inside one neuron | What does one neuron do? | Implemented: Change one input or weight. Follow multiplication, addition of bias and the nonlinear activation as separate numerical operations. | Retain section alignment; validate the scientific conditions in the module review. |
| 6. Depth builds features | Why might depth help? | Implemented: Move the edge filter over the image patch. Compare its raw feature response with the response after ReLU; these are explicit teaching filters. | Retain section alignment; validate the scientific conditions in the module review. |
| 7. How learning happens | How does the correction cycle work? | Implemented: Step through forward prediction, loss, gradients and update. Check that the gradient exists before any weights move. | Retain section alignment; validate the scientific conditions in the module review. |
| 8. Learn patterns, not the answer sheet | How do we reduce overfitting? | Implemented: Compare all-unit evaluation with the fixed dropout mask. See the removed hidden response and its effect on the combined prediction. | Retain section alignment; validate the scientific conditions in the module review. |
| 9. Choose an architecture | Why choose CNN, RNN, or attention? | Implemented: Trace one complete local mechanism: CNN products and sum, RNN carried state, or attention’s weighted-average context vector. | Retain section alignment; validate the scientific conditions in the module review. |
| 10. Start from a pretrained model | What is reused during transfer learning? | Implemented: Toggle whether the later backbone is trainable. Early features remain frozen; the new task head is trainable in both settings. | Retain section alignment; validate the scientific conditions in the module review. |
| 11. Make an honest judgement | What would make an evaluation honest and useful? | Implemented: Inspect validation errors by actual and predicted class. Test rows remain sealed until a final evaluation procedure is fixed. | Retain section alignment; validate the scientific conditions in the module review. |
| 12. Ship the whole pipeline | What does deployment actually package? | Implemented: Swap feature order or remove a required input. Trace the resulting coordinate change or rejection, then restore the saved contract. | Retain section alignment; validate the scientific conditions in the module review. |

## Experimental Design & Randomisation

9 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The problem | What causal comparison do we want? | workflow / estimand | Choose a concrete estimand before choosing a statistical test. |
| 2. Intuition and objective | What does random assignment accomplish? | workflow / assignment | Randomize repeatedly and show finite-sample imbalance; separate assignment from random sampling. |
| 3. Worked example | Why are twenty schools not six hundred independent assignments? | workflow / clusters | Select an assignment unit and highlight all its students; keep the independent unit explicit. |
| 4. Reasoning with the method | How do blocking, blinding, and intention-to-treat differ? | workflow / protocol | Trace one participant from assignment through analysis; retain noncompliance and interference caveats. |
| 5. Interactive laboratory | How does clustering affect effective information? | workflow / design-effect | Adjust n, cluster size, and ICC; label approximation assumptions and replace the ad hoc power formula before presenting it as calculated power. |
| 6. Assumptions and failure modes | What can break a randomized comparison? | workflow / threats | Select a failure and show the broken comparison; do not suggest randomization cures every later bias. |
| 7. Practical workflow | What should be planned before recruitment? | workflow / protocol | Build the protocol in causal order; include plausible attrition and number of clusters. |
| 8. Interpretation and reporting | What belongs in a transparent report? | workflow / report | Fill a short report and identify a missing design fact. |
| 9. Knowledge checks | Can I identify the unit and analysis implication? | workflow / clusters | Choose the independent unit and explain why row count is insufficient; retain static feedback. |

## Gradient Boosting

9 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The problem | Why add another learner to the current model? | trees / fit | Show a weak learner contributing a small improvement rather than replacing the ensemble. |
| 2. Intuition and objective | What is learned at the next round? | trees / residuals | Highlight targets for a new learner under squared loss, then explain why other losses differ. |
| 3. Worked example | How do three rounds build a prediction? | trees / additive | Step the additive calculation with actual values and a consistent selected row. |
| 4. Reasoning with the method | Why do learning rate and round count interact? | trees / curve | Compare trajectories with fixed training data; explain that their product alone is not a complete equivalence. |
| 5. Interactive laboratory | When should we stop adding rounds? | trees / curve | Use computed or visibly illustrative curves; fix vertical orientation, label axes, and freeze final-test data. |
| 6. Assumptions and failure modes | What can a complex boosted model still get wrong? | trees / fit | Inspect a failure case and compare regularization options without presenting gain importance as causality. |
| 7. Practical workflow | How should tuning be organized? | trees / curve | Change one setting, refit on train, choose on validation; use cancellation for obsolete computations. |
| 8. Interpretation and reporting | What do we report about the selected ensemble? | trees / additive | Produce a compact model record and explain why training loss did not select the final round. |
| 9. Knowledge checks | Can I compute the next prediction? | trees / additive | Complete one update and identify when residual fitting is valid; explain the distractors. |

## Hierarchical Clustering

9 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Uncharted Planet | What does grouping without an answer key mean? | unsupervised / clusters | Select the feature representation first; avoid claiming there is one natural grouping waiting to be discovered. |
| 2. Measuring "Close" | How do we define close? | unsupervised / distances | Link a distance-matrix cell to two points; compare Euclidean and an appropriate alternative. |
| 3. The First Merge | Why merge this pair first? | unsupervised / clusters | Predict the closest pair, then merge while preserving member identities. |
| 4. Defining Group Distance (Linkage) | How far apart are groups? | unsupervised / linkage | Highlight contributing pairs and recompute the selected linkage; label Ward's increase-in-variance meaning. |
| 5. The Process in Motion | How is the merge history built? | unsupervised / dendrogram | Scrub cached merge snapshots in both directions; synchronize point clusters, matrix, and dendrogram. |
| 6. The Family Tree (Dendrogram) | What does dendrogram height represent? | unsupervised / dendrogram | Highlight a branch and its original members; never imply all linkage heights mean the same distance. |
| 7. Cutting the Tree | How does a horizontal cut produce K groups? | unsupervised / dendrogram | Drag or numerically set the cut; keep leaf identity and colors stable across nearby cuts. |
| 8. The Detective's Challenge | How sensitive is the tree to preprocessing? | unsupervised / clusters | Compare alternative trees with stable leaf IDs; make each metric change explicit. |
| 9. Synthesis & Recap | When is this preferable to K-Means? | unsupervised / dendrogram | Choose a method for a scenario and justify the tradeoff; include stability and domain validation. |

## Imbalanced Classification

9 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The problem | Why can 99% accuracy be useless? | classification / prevalence | Reveal the missed positive and its cost before introducing a metric dashboard. |
| 2. Intuition and objective | Why does prevalence change precision? | classification / prevalence | Keep sensitivity/specificity fixed while changing prevalence; separate this from threshold-induced changes. |
| 3. Worked example | How many false alerts occur in the worked example? | classification / confusion | Correct the counts, 585 alerts, and 15.4% precision; link the full confusion matrix to a workload view. |
| 4. Reasoning with the method | Which tradeoffs matter for rare positives? | classification / confusion | Explain each with one denominator or decision; replace generic reasoning prose with linked mini examples. |
| 5. Interactive laboratory | What happens when we lower the threshold? | classification / confusion | Use fixed validation score distributions or explicitly label the current scenario model; give a capacity constraint. |
| 6. Assumptions and failure modes | Why can resampling mislead evaluation? | classification / prevalence | Compare a falsely balanced test report with natural-prevalence precision; explain recalibration conditions. |
| 7. Practical workflow | How do we choose a usable operating point? | classification / final | Lock a feasible choice before final test; preserve group/time structure as needed. |
| 8. Interpretation and reporting | What should accompany the final score? | classification / confusion | Generate a concise decision report with investigation workload, not just a percentage. |
| 9. Knowledge checks | Can I compute workload for a new prevalence? | classification / prevalence | Complete TP/FP and precision; use feedback specific to confusing specificity with precision. |

## K-Nearest Neighbors (KNN)

14 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Raw Data | What is stored by KNN? | classification / neighbors | Select an observation and explain that training largely stores usable examples rather than a boundary formula. |
| 2. Choosing Good Features | What makes a feature useful for distance? | classification / neighbors | Compare neighbor identity after adding noise; do not choose features from final test outcomes. |
| 3. Train / Test Split | Why separate development and final evaluation? | classification / split | Reveal the split and keep held-out labels out of the neighbor pool. |
| 4. Feature Scaling | Why do units affect neighbors? | classification / neighbors | Switch a training-fitted scaler on the same data; never refit scaling on a queried/test row. |
| 5. Measuring Distance | How is distance calculated? | classification / distances | Select two points and trace the calculation; offer numeric query coordinates alongside direct manipulation. |
| 6. Choosing K | Why does K change the behavior? | classification / neighbors | Scrub K on fixed data; show a query's changing vote and validation performance. |
| 7. Finding Neighbors | Which observations are the nearest? | classification / distances | Highlight the first K entries and expand the neighborhood; do not move observations to create the animation. |
| 8. The Majority Vote | How do neighbors vote? | classification / votes | Reveal votes one neighbor at a time; distinguish vote fraction from calibrated probability. |
| 9. Decision Boundary | Where do predictions change? | classification / boundary | Move a query through a persistent decision surface; recompute surface only when data or K changes. |
| 10. Classifying Test Points | How do unseen points get a label? | classification / neighbors | Step through a fixed evaluation example without inserting its true label into training. |
| 11. Evaluating the Model | What does the confusion matrix count? | classification / confusion | Select errors to locate their queries; use validation for ongoing exploration and reserve final test for a locked run. |
| 12. The Effect of K | How do we choose K? | classification / tuning | Compare a precomputed candidate sweep; avoid repeated final-test optimization. |
| 13. Strengths and Weaknesses | When does KNN become unreliable or expensive? | classification / neighbors | Add an irrelevant dimension or reduce local density in a labeled toy example. |
| 14. Interactive Playground | Can I explain a new prediction? | classification / votes | Let the learner choose K, query location, and vote rule; capture a before/after comparison and ask why it changed. |

## Linear Discriminant Analysis (LDA)

15 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Raw Data | What do the labeled clouds represent? | classification / clouds | Link table and point before introducing ellipses or a separating direction. |
| 2. Choosing Good Features | Why does feature choice matter? | classification / clouds | Inspect a seeded feature alternative using validation; retain feature units and provenance. |
| 3. Train / Test Split | Which data estimate the class distributions? | classification / split | Show training observations contributing to estimates; keep held-out rows visually distinct. |
| 4. Group by Class | Why group observations by class? | classification / clouds | Brush one class and reveal its sample size without changing point positions. |
| 5. Compute Class Means | What is a class mean? | classification / means | Draw deviations into a class center; show the center can sit where no observation exists. |
| 6. Within-Class Scatter | What does within-class scatter describe? | classification / covariance | Link covariance-matrix entries to ellipse spread and tilt with a short symbol dictionary. |
| 7. The Shared Covariance Assumption | Why share one covariance estimate? | classification / covariance | Compare shared and separate shapes; explain the stability-versus-flexibility tradeoff. |
| 8. Between-Class Scatter | What counts as between-class separation? | classification / means | Highlight mean differences independently from within-class spread. |
| 9. The Optimal Direction | Why project along this direction? | classification / projection | Rotate a candidate projection, then reveal the fitted LDA direction; distinguish this from PCA. |
| 10. The Decision Boundary | Why is the boundary linear? | classification / boundary | Link mean, covariance, and prior changes to the boundary; keep algebra in expandable steps. |
| 11. Classifying Test Points | How is a new case classified? | classification / scores | Move/select a query and compare its class scores; probability claims must use the model assumptions. |
| 12. Evaluating the Model | How do we judge the classifier? | classification / confusion | Brush validation mistakes; use a separate locked final-test demonstration. |
| 13. Reading LDA Output | What does an LDA summary mean? | classification / coefficients | Select an output item and highlight the quantity it controls; clarify empirical versus specified priors. |
| 14. Assumptions & Limitations | When is the shared-shape assumption costly? | classification / clouds | Compare fixed LDA and QDA scenarios on identical splits; discuss singularity and regularization. |
| 15. Interactive Playground | Can I predict how the boundary will move? | classification / boundary | Change one mean, spread, or prior; preserve dataset seed and ask the learner to explain the outcome. |

## Logistic Regression

10 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. It Starts with Data | What is the binary outcome? | classification / boundary | Link the row to the plotted observation; label class and feature units independently. |
| 2. Why Lines Break | Why is an ordinary line awkward for probability? | classification / sigmoid | Compare the raw linear score and a probability output using the same observations. |
| 3. From a Raw Score to a Probability | What does the sigmoid do? | classification / sigmoid | Scrub z and move a marker along the sigmoid; keep this distinct from changing a fitted coefficient. |
| 4. Weighted Clues | How do weighted clues form z? | classification / contributions | Change one input or coefficient at a time; synchronize the contribution receipt and score-to-probability diagram. |
| 5. Learning from Mistakes | What does learning minimize? | classification / loss | Step an actual parameter update and plot loss; distinguish gradients from the optimizer's action. |
| 6. Drawing the Line | Why does a probability need a decision threshold? | classification / boundary | Move the threshold and immediately update labels on development data; preserve continuous probabilities. |
| 7. Select the Decision Rule on Validation Data | Which mistakes does this threshold create? | classification / confusion | Select TP/FP/FN/TN to brush corresponding validation cases; update counts and costs together. |
| 8. The Validation ROC Curve | What does the ROC curve summarize? | classification / roc | Sweep a validation threshold and move its ROC operating point; keep AUC separate from accuracy and calibration. |
| 9. What the Numbers Mean | What is an odds ratio? | classification / coefficients | Change a feature by one unit while holding others fixed; avoid interpreting coefficient size as causal importance. |
| 10. The Full Picture | What is locked before the final test? | classification / final | Preserve the existing one-time reveal; demonstrate that threshold changes cannot silently tune the sealed test. |

## Missing Data & Encoding

9 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The problem | What might an empty cell mean? | workflow / missing | Select a missing value and show possible mechanisms without pretending the mechanism is identifiable from appearance. |
| 2. Intuition and objective | What assumptions do filling and encoding add? | workflow / encoding | Compare a raw row with transformed columns; name the modeling goal before choosing a method. |
| 3. Worked example | Why can mean filling distort an analysis? | workflow / means | Trace a high-income missingness example; preserve the uncertainty about unseen values. |
| 4. Reasoning with the method | How do MCAR, MAR, MNAR, and encoding differ? | workflow / mechanism | Use one miniature for mechanisms and one for one-hot/ordinal/target encoding; do not overload a single chart. |
| 5. Interactive laboratory | How should methods be compared fairly? | workflow / missing | Replace fixed universal bias rankings with computed toy scenarios or clearly labeled illustrative indices; expose sensitivity to the mechanism. |
| 6. Assumptions and failure modes | What can imputation not recover automatically? | workflow / encoding | Inspect a target-encoding leakage case and a category-order counterexample. |
| 7. Practical workflow | What belongs in the fitted pipeline? | workflow / pipeline | Step a new category through the saved unknown-level policy; show cross-fitting for target encoding. |
| 8. Interpretation and reporting | What must be documented? | workflow / report | Build a transformation record from the current scenario without implying assumptions were proven. |
| 9. Knowledge checks | Can I choose a safe transformation? | workflow / encoding | Ask for the assumption and pipeline placement, not merely a method name; retain all answer explanations. |

## Model Selection & Regularization

12 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Overfitting Trap | Why can extra flexibility hurt new predictions? | regression-lab / scores | Add a seeded noise feature; avoid claiming more features always cause overfitting. |
| 2. The n-p Puzzle | What happens when coefficients are not identifiable? | regression-lab / coefficients | Show nonunique coefficients separately from generalization; introduce regularization as an additional constraint. |
| 3. Picking the Best Team | Why not search every subset? | regression-lab / subsets | Step forward/backward selection on a tiny example; describe computational growth without saying all sizes are impossible. |
| 4. The Scorecards | What does each scorecard penalize? | regression-lab / criteria | Compare identical fitted candidates; standardize AIC/BIC/Cp conventions and distinguish ranking-equivalent rescalings. |
| 5. The Shrinking Trick | What does shrinkage trade away? | regression-lab / coefficients | Change lambda on a fixed standardized training matrix; keep the intercept treatment explicit. |
| 6. Ridge Regression (L2) | Why does Ridge usually keep all predictors? | regression-lab / coefficients | Animate actual solution paths; replace the absolute never-zero claim and explain units. |
| 7. Lasso Regression (L1) | Why can Lasso produce zeros? | regression-lab / coefficients | Follow a coefficient to zero; show instability under correlated features and an Elastic Net comparison in deeper reading. |
| 8. Finding the Sweet Spot | How do we choose lambda honestly? | regression-lab / scores | Compare candidates using the same folds; expose the one-SE choice only with an explicit uncertainty calculation. |
| 9. The "Super-Variable" Secret | How do PCR and PLS differ? | regression-lab / components | Compare a high-variance irrelevant direction with a predictive direction; fit all transforms inside training folds. |
| 10. Decision Helper | Which tradeoff matters for this task? | regression-lab / coefficients | Return conditional options with reasons; stop equating feature selection with causal explanation. |
| 11. Common Mistakes | How does repeated evaluation bias our choices? | regression-lab / folds | Demonstrate selection optimism and nested evaluation; avoid universal claims about every training score. |
| 12. Final Synthesis | Can I justify the selected model? | regression-lab / scores | Produce a short model card from explicit choices; check that no final-test result influenced the selection. |

## Multiple Linear Regression

9 sections · priority visuals rebuilt this pass.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Multi-Variable World | Why use more than one predictor? | Implemented: Rotate the data space. Select a blue observation and follow its vertical residual down to the green prediction plane. | Retain section alignment; validate the scientific conditions in the module review. |
| 2. The Secret Recipe | How does the equation combine clues? | Implemented: Change x₁, then x₂. Follow each signed contribution into the total; a negative contribution lowers the prediction. | Retain section alignment; validate the scientific conditions in the module review. |
| 3. Finding the Fit | What changes when I adjust one coefficient? | Implemented: Tilt β₁ while leaving β₂ alone. Compare the plane, the residual threads, and training MSE on the same data. | Retain section alignment; validate the scientific conditions in the module review. |
| 4. The Least Squares Method | How does least squares select the weights? | Implemented: Try a poor slope, then choose “Find the least-squares plane”. Check that the training error falls while the observations stay fixed. | Retain section alignment; validate the scientific conditions in the module review. |
| 5. The Superpower: Holding Constant | What does holding constant mean? | Implemented: Move x₁ along the green line while keeping x₂ fixed. The rise for a one-unit move is β₁. Then change the held value of x₂. | Retain section alignment; validate the scientific conditions in the module review. |
| 6. Building the Prediction | How is a prediction assembled? | Implemented: Choose a negative input and follow the running total. Add the intercept and both products by hand before checking the last column. | Retain section alignment; validate the scientific conditions in the module review. |
| 7. The Spurious Trap | Why can an apparent relationship disappear? | Implemented: Compare the raw cloud with the residual cloud after removing x₂. These are the same observations; the adjusted slope can be very different. | Retain section alignment; validate the scientific conditions in the module review. |
| 8. The Adjusted R² Penalty | Why can training R-squared reward useless variables? | Implemented: Include and remove the seeded noise predictor. Compare training R² with adjusted R², then draw another sample to see a chance result change. | Retain section alignment; validate the scientific conditions in the module review. |
| 9. Reading the Model Output | How do I read a regression summary? | Implemented: Increase outcome noise and watch the coefficient intervals widen. Read the dot as the estimate and the line as its model-based uncertainty. | Retain section alignment; validate the scientific conditions in the module review. |

## Neural Networks

19 sections · priority visuals rebuilt this pass.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The whole idea: learn patterns from examples | What does learning from examples mean? | Implemented: Inspect the initial decision field, then train 20 updates. The examples stay fixed while the network reshapes its prediction boundary. | Retain section alignment; validate the scientific conditions in the module review. |
| 2. Data becomes features and labels | How do rows become inputs and targets? | Implemented: Move x₁ and x₂. Follow the coordinate guides to one input point; its label is a separate target, not another input coordinate. | Retain section alignment; validate the scientific conditions in the module review. |
| 3. Clean, encode, scale, then split | When should preprocessing be learned? | Implemented: Follow the three disjoint sample groups. Preprocessing and weight updates learn from training data; validation measures choices and test stays sealed. | Retain section alignment; validate the scientific conditions in the module review. |
| 4. A network is layers of tiny calculators | What does a layer compute? | Implemented: Change an input or the first weight. Follow the two products and bias into the weighted sum, then through the activation curve. | Retain section alignment; validate the scientific conditions in the module review. |
| 5. One feature has a different weight into every hidden neuron | Why does each connection have its own weight? | Implemented: Change the first connection weight. Only unit 1’s input response changes directly; compare all three responses at the same gold query. | Retain section alignment; validate the scientific conditions in the module review. |
| 6. Non-linearity lets stacked layers learn bends | Why are nonlinear activations necessary? | Implemented: Choose an activation and compare its bend with the decision boundary below. Changing activation starts a fresh run. | Retain section alignment; validate the scientific conditions in the module review. |
| 7. Forward propagation makes one pass-score prediction | What happens in one forward pass? | Implemented: Follow the same gold point through all three hidden-response maps and into the combined output. Read the computed values in the receipt. | Retain section alignment; validate the scientific conditions in the module review. |
| 8. Loss measures how wrong the prediction was | What does loss measure? | Implemented: Change the inspected true label while retaining the same prediction. Follow the point on the corresponding cross-entropy curve. | Retain section alignment; validate the scientific conditions in the module review. |
| 9. Backpropagation computes gradients—only gradients | What does backpropagation compute? | Implemented: Inspect the measured loss surface and gradient components. The downhill arrow is opposite the gradient; computing it alone has not updated weights. | Retain section alignment; validate the scientific conditions in the module review. |
| 10. The optimizer takes iterative, local steps | What does the optimizer change? | Implemented: Choose a learning rate, predict the change in loss, then take one two-weight step. Rewind to recover the exact previous parameters. | Retain section alignment; validate the scientific conditions in the module review. |
| 11. One update has a strict causal order | Why must operations happen in this order? | Implemented: Step through forward, loss, gradients and update. Verify that weights change only at update, then rewind and replay. | Retain section alignment; validate the scientific conditions in the module review. |
| 12. Choose the model before validation gets worse | Why monitor validation during training? | Implemented: Train another batch of updates. Compare training loss with validation loss and the best stored validation step. | Retain section alignment; validate the scientific conditions in the module review. |
| 13. Humans choose the architecture and hyperparameters | Which settings do humans choose? | Implemented: Change activation to restart the run, or change learning rate for the next updates. Observe the measured development curves. | Retain section alignment; validate the scientific conditions in the module review. |
| 14. The test set evaluates both scores and decisions | What is evaluated on the final test set? | Implemented: Inspect the validation confusion matrix. This experiment keeps final-test labels sealed; final-test evaluation requires a frozen procedure. | Retain section alignment; validate the scientific conditions in the module review. |
| 15. Error analysis starts with individual students | What can an individual error teach us? | Implemented: Locate the gold-ringed validation mistakes in input space. Compare errors near and far from the current decision boundary. | Retain section alignment; validate the scientific conditions in the module review. |
| 16. Saving, deployment, and monitoring finish the lifecycle | What must be saved with the weights? | Implemented: Swap the input columns and follow the displaced point and changed probability. A missing second input is rejected instead of guessed. | Retain section alignment; validate the scientific conditions in the module review. |
| 17. Different network families organize information differently | Why do different architectures exist? | Implemented: Choose an architecture mechanism: trace a CNN window, an RNN state through time, or attention weights into a context vector. | Retain section alignment; validate the scientific conditions in the module review. |
| 18. Try the tiny student-pass network | Can I predict this tiny network's answer? | Implemented: Move one input and predict which side of the boundary it will occupy. Compare its probability before and after training. | Retain section alignment; validate the scientific conditions in the module review. |
| 19. One full training cycle | Can I explain a complete training cycle? | Implemented: Complete one ordered cycle, rewind it, and replay it. Match the visual phase to the unchanged or updated model parameters. | Retain section alignment; validate the scientific conditions in the module review. |

## One-R

12 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. What problem is One-R solving? | What does one feature mean? | classification / rules | Select a column and keep the target clearly separate. |
| 2. First, make the lazy prediction. | Why start with a majority baseline? | classification / votes | Predict the baseline before revealing it; add an imbalanced case where accuracy is misleading. |
| 3. Make a rule from one categorical feature. | How is a rule built for each value? | classification / rules | Select a category and trace its chosen prediction and errors. |
| 4. Test every feature. Keep the lowest-error rule. | How is the winning feature selected? | classification / rules | Inspect each feature without changing rows; reveal the declared tie policy. |
| 5. Turn numeric values into intervals. | Why bucket numeric values? | classification / rules | Move a query through fixed intervals; explain that exact-value rules can memorize the sample. |
| 6. Missing values and unseen categories are part of the model. | What happens with missing or unseen values? | classification / rules | Choose an edge case and trace the declared fallback; do not infer a rule from test labels. |
| 7. Prediction is deliberately cheap. | Why is prediction inexpensive? | classification / rules | Change irrelevant input fields and show the prediction stays unchanged for the fitted one-feature model. |
| 8. One feature cannot express an interaction. | What can a single feature miss? | classification / boundary | Reveal a pattern that requires both features and compare One-R with a richer rule. |
| 9. Validate the whole learning process | What must be refitted inside each fold? | classification / split | Step a fold with training-only learning; show why selecting a feature globally leaks selection information. |
| 10. Evaluate each fold. Decide what to do next. | Which metric matches the decision? | classification / confusion | Compare fold outcomes and workload; avoid tying entire industries universally to precision or recall. |
| 11. Use simple models as diagnostic instruments. | How does One-R differ from a stump? | classification / rules | Run the same row through each representation and explain the tradeoff. |
| 12. Build the rule, then explain what it means. | Can I build and explain a rule? | classification / rules | Complete a rule, test a new case, and explain what the unselected features might still contribute elsewhere. |

## Principal Component Analysis (PCA)

10 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Unsupervised Explorer | What can we learn without a target? | unsupervised / projection | Select one student across the source table and 2D slice; label the slice versus the full fit. |
| 2. The "Too Much Information" Problem | Why compress several measurements? | unsupervised / projection | Compare reconstruction loss after discarding a direction; avoid equating sample variance with all information. |
| 3. Finding the First Principal Component | Why maximize projected variance? | unsupervised / projection | Rotate a candidate axis continuously and mark the fitted PC1 optimum; use a centered dataset. |
| 4. The Secret Sauce: Loadings | What are loadings? | unsupervised / loadings | Select a loading, highlight the source column, and trace its contribution for one student. |
| 5. When Scaling Is Appropriate | Why might scaling change the answer? | unsupervised / projection | Switch raw-centered and standardized fits on identical rows; retain units and model-choice explanation. |
| 6. Capturing the Leftovers: PC2 | How is PC2 selected? | unsupervised / projection | Reveal the second eigen-direction; distinguish PCA score decorrelation from arbitrary perpendicular axes. |
| 7. The Transformation (Scores) | What are scores? | unsupervised / scores | Animate coordinates into the new basis with identity preserved; show reconstruction when all components are kept. |
| 8. Proportion of Variance Explained | What fraction of variance is retained? | unsupervised / scree | Select component count on a scree plot; distinguish variance retained from predictive information preserved. |
| 9. Interactive Playground | Can I discover the best projection? | unsupervised / projection | Give a predict/try/reveal exercise; do not call every user-selected axis a principal component. |
| 10. The Best Summary | What should I report and avoid claiming? | unsupervised / reconstruction | Explain a chosen representation; include a low-variance predictive-signal counterexample in deeper reading. |

## Polynomial Regression

8 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. Inspect the Raw Data | Why might a straight line miss the pattern? | regression-lab / fit | Highlight systematic residual patterns using the same points; begin with a question rather than declaring linear methods inadequate. |
| 2. Fit a Straight Line | What does a baseline teach us? | regression-lab / fit | Fit degree one and reveal residual structure; state that polynomial regression remains linear in its coefficients. |
| 3. Expand the Features | Why create x-squared and x-cubed? | regression-lab / basis | Brush a row across the raw table and design matrix; label training-fitted centering/scaling. |
| 4. Fit the Weights | What do the weights do? | regression-lab / coefficients | Toggle individual basis terms and their sum; update the full equation without swapping the dataset. |
| 5. Compute Errors | What do residual patterns tell us? | regression-lab / residuals | Link a residual plot point with its original observation; preserve the training/validation distinction. |
| 6. Check for Overfitting | Why can a flexible curve do worse on new data? | regression-lab / scores | Scrub degree on a fixed split; highlight boundary oscillation and label any schematic curve. |
| 7. Find the Sweet Spot | How should we select the degree? | regression-lab / scores | Compare candidate degrees using fixed folds or a fixed holdout; noise regeneration must be explicit. |
| 8. Lock in the Model | What gets locked before final evaluation? | regression-lab / fit | Commit the chosen setup, reveal final test once, and explain extrapolation/monitoring limits instead of claiming proof. |

## Probability & Sampling Distributions

9 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The problem | Why does a sample answer vary? | statistics / sample | Draw one explicit sample and show its mean; retain the population as the stable reference. |
| 2. Intuition and objective | How are probability, density, and frequency different? | statistics / density | Select an interval and accumulate area; do not interpret continuous curve height as point probability. |
| 3. Worked example | How is a standard error calculated? | statistics / sample | Work one numerical example; contrast individual-score spread with mean-estimate spread. |
| 4. Reasoning with the method | What is the sampling distribution? | statistics / sampling | Reveal the population → sample → mean chain before showing hundreds of means; explain CLT conditions in deeper reading. |
| 5. Interactive laboratory | What changes with sample size? | statistics / sampling | Generate samples outside draw; resize without resampling; animate added means and offer an explicit resample action. |
| 6. Assumptions and failure modes | When is the usual SE misleading? | statistics / sampling | Compare samples with the same row count but different dependence; explain heavy-tail and design limits. |
| 7. Practical workflow | Which sampling design matches the question? | statistics / sample | Build a simple sampling workflow with a bias scenario; separate random sampling from random assignment. |
| 8. Interpretation and reporting | What should a sampling result report? | statistics / sampling | Fill a short report from the actual sample state; identify the population to which it refers. |
| 9. Knowledge checks | Can I tell SD from SE? | statistics / sampling | Mix answer positions and explain every distractor; retain static answers and a new numerical transfer example. |

## Quadratic Discriminant Analysis (QDA)

10 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Raw Data Cloud | What differs between these class clouds? | classification / clouds | Inspect classes with stable row IDs and color/shape labels. |
| 2. Train / Test Split | Why hold out examples? | classification / split | Use immutable split roles; keep subsequent shape/regularization tuning on development data. |
| 3. The Straight-Line Trap (LDA) | When is a straight boundary too restrictive? | classification / boundary | Compare LDA/QDA on the same points; avoid implying QDA always improves generalization. |
| 4. Fitting QDA: What the Model Learns | Which parameters does QDA estimate? | classification / covariance | Select a matrix cell to highlight ellipse spread/tilt; explain determinant volume and inverse scaling separately. |
| 5. Testing with Shape-Aware Distance | What is shape-aware distance? | classification / distances | Move the query by pointer or coordinate inputs; show contours and the computed class terms. |
| 6. The Curved Boundary | Why do unequal covariances yield a quadratic boundary? | classification / boundary | Toggle linear/quadratic boundaries with direct labels; distinguish geometric shape from a confidence claim. |
| 7. Evaluating QDA on Unseen Data | How should performance be evaluated while exploring? | classification / confusion | Display validation metrics while tuning; reserve test for locked settings and remove advice to repeatedly inspect changing test scores. |
| 8. Reading QDA Output | What do prior and covariance outputs mean? | classification / coefficients | Focus/tap the log/table entries; state whether priors came from training frequencies or were supplied. |
| 9. Regularization & Shape Playground | What does regularization stabilize? | classification / covariance | Give separate controls or separate demonstrations; only the pooled path should be labeled as moving toward LDA. |
| 10. Assumptions, Complexity & Synthesis | When is the extra flexibility worth its cost? | classification / boundary | Change K/p and inspect covariance stability; conclude with a validation-based choice, not a shape-only rule. |

## Random Forest

9 sections · priority visuals rebuilt this pass.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The problem | Why combine several trees? | Implemented: Compare individual spatial partitions and move one training input. Check how the single trees and the all-tree prediction respond. | Retain section alignment; validate the scientific conditions in the module review. |
| 2. Intuition and objective | What makes trees different? | Implemented: Choose a tree and a training row. A square shows how many times that original row appeared in the bootstrap sample; zero means it was omitted. | Retain section alignment; validate the scientific conditions in the module review. |
| 3. Worked example | How is a forest prediction produced? | Implemented: Follow the individual tree fractions and their running mean. Increase the tree count and recompute the same query’s aggregate. | Retain section alignment; validate the scientific conditions in the module review. |
| 4. Reasoning with the method | Why does correlation between trees matter? | Implemented: Compare two trees’ predictions on the same validation observations. Points near the diagonal indicate agreement; gold rings identify shared mistakes. | Retain section alignment; validate the scientific conditions in the module review. |
| 5. Interactive laboratory | What is an out-of-bag prediction? | Implemented: Select a training row and inspect its voters. Crossed-out trees sampled that row, so they must not contribute to its out-of-bag prediction. | Retain section alignment; validate the scientific conditions in the module review. |
| 6. Assumptions and failure modes | What problems do more trees not solve? | Implemented: Move one training input. Inspect the aggregate prediction field and gold-ringed validation mistakes; more trees do not guarantee correct predictions. | Retain section alignment; validate the scientific conditions in the module review. |
| 7. Practical workflow | How should a forest be tuned and validated? | Implemented: Increase the number of trees and compare the measured validation-error curve. It need not improve after every added tree. | Retain section alignment; validate the scientific conditions in the module review. |
| 8. Interpretation and reporting | What should be reported? | Implemented: Inspect the forest prediction in the original input space. Report the sample split, tree settings, aggregation rule and held-out error together. | Retain section alignment; validate the scientific conditions in the module review. |
| 9. Knowledge checks | Can I trace a held-out vote? | Implemented: Choose a row and identify eligible voters before reading its OOB fraction. If no tree omitted it, the estimate is unavailable. | Retain section alignment; validate the scientific conditions in the module review. |

## Regression Diagnostics

9 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The problem | Why can a high R-squared coexist with a bad model? | regression-lab / residuals | Compare two labeled examples on equal axes and ask which model claim is unsupported. |
| 2. Intuition and objective | What is a residual checking? | regression-lab / residuals | Link raw plot, fitted value, and residual plot by observation ID. |
| 3. Worked example | How does an influential point differ from an outlier? | regression-lab / influence | Remove/restore a selected point in a controlled comparison; do not prescribe automatic deletion. |
| 4. Reasoning with the method | Which diagnostic answers which question? | regression-lab / diagnostic | Focus one diagnostic at a time with a question and response; distinguish predictor normality from residual inference assumptions. |
| 5. Interactive laboratory | What does a curve or funnel suggest? | regression-lab / residuals | Select a pattern with a stable dataset; link a possible remedy to a refit, labeled illustrative if no fit occurs. |
| 6. Assumptions and failure modes | What cannot a residual plot establish? | regression-lab / residuals | Show a time/group violation even when the scatter looks harmless. |
| 7. Practical workflow | How should a diagnostic change the analysis? | regression-lab / fit | Choose a response and compare outcomes; retain the original dataset and model for sensitivity analysis. |
| 8. Interpretation and reporting | What should the report say? | regression-lab / scores | Assemble a short diagnostic note; distinguish a confidence interval from a prediction interval. |
| 9. Knowledge checks | Can I match symptom and response? | regression-lab / diagnostic | Require a reason before reveal; include a keep-and-investigate answer rather than always delete or transform. |

## Regression Trees

16 sections · priority visuals rebuilt this pass.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Raw Target | What are we predicting? | Implemented: Select a dot. Read its numerical outcome, then keep that observation in mind as the following sections construct predictions. | Retain section alignment; validate the scientific conditions in the module review. |
| 2. From Dataset to Model | Which rows can influence training? | Implemented: Count the training, validation and sealed test observations. Only the training outcomes may determine a split or a leaf mean. | Retain section alignment; validate the scientific conditions in the module review. |
| 3. The Clumsy Guess | Why start with the mean? | Implemented: Move the constant prediction above and below the green mean. Follow the vertical gaps and compare your MSE with the best constant MSE. | Retain section alignment; validate the scientific conditions in the module review. |
| 4. The First Split | How can one question improve the prediction? | Implemented: Slide the candidate midpoint. The two horizontal predictions are the means on either side; observations equal to a threshold go left. | Retain section alignment; validate the scientific conditions in the module review. |
| 5. The Error Engine (RSS) | How is a split scored? | Implemented: Keep a candidate cut fixed. Compare its child sample sizes, residual spreads and weighted impurity with the original parent. | Retain section alignment; validate the scientific conditions in the module review. |
| 6. Real Trees Check Many Questions | Why test many candidate questions? | Implemented: Move through candidate midpoints, then change the feature being tested. Compare the gold candidate with the green minimum of this feature’s cost curve. | Retain section alignment; validate the scientific conditions in the module review. |
| 7. Recursive Splitting | What makes the process recursive? | Implemented: Reveal one more split level. Notice how a child’s cut stops at the edge of its own region. | Retain section alignment; validate the scientific conditions in the module review. |
| 8. The Anatomy of a Tree | How do I read a tree? | Implemented: Move the query in either input. Follow the gold region above and the same gold branching route below to its leaf prediction. | Retain section alignment; validate the scientific conditions in the module review. |
| 9. The Overfitting Trap | Why can a deeper tree overfit? | Implemented: Increase maximum depth. Compare the training and validation curves; a better training fit need not improve held-out error. | Retain section alignment; validate the scientific conditions in the module review. |
| 10. Stopping Rules | Which stopping rules constrain growth? | Implemented: Change the minimum leaf size on the same sample. Inspect which spatial cuts and branches are no longer allowed. | Retain section alignment; validate the scientific conditions in the module review. |
| 11. Pruning: Let It Grow, Then Cut It Back | How does pruning differ from stopping early? | Implemented: Raise α to remove branches from one fixed grown tree. Compare retained leaves, training risk and validation error. This is post-pruning. | Retain section alignment; validate the scientific conditions in the module review. |
| 12. Trees vs. Lines | When does a tree differ from a line? | Implemented: Hold x₂ fixed and compare the line-model slice with the tree’s steps. The background observations retain their own x₂ values. | Retain section alignment; validate the scientific conditions in the module review. |
| 13. Interactive Playground | What changes when I alter the data? | Implemented: Change one growth setting at a time. Trace the same query before drawing a new dataset. | Retain section alignment; validate the scientific conditions in the module review. |
| 14. Sample Output: Reading the Tree Result | What do the reported metrics mean? | Implemented: Select a row and follow its vertical residual. Its prediction uses both inputs, even though this outcome plot shows x₁ on the horizontal axis. | Retain section alignment; validate the scientific conditions in the module review. |
| 15. Reality Check: Limitations | What are the characteristic failure cases? | Implemented: Perturb one training outcome. Compare the before-and-after partitions and the prediction at the same query. | Retain section alignment; validate the scientific conditions in the module review. |
| 16. Synthesis | Can I reconstruct the algorithm? | Implemented: Trace a query from its location to a leaf. Explain the cut, the branch direction, the leaf sample size and its mean before checking the receipt. | Retain section alignment; validate the scientific conditions in the module review. |

## Support Vector Machines — Separate classes with breathing room

14 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. Points, labels, and a decision boundary | What does a decision boundary decide? | classification / boundary | Select a point and inspect its score; reserve probability language for calibrated output. |
| 2. Why not choose any separating line? | Why is one separator preferable to another? | classification / boundary | Slide a candidate line and highlight the limiting points. |
| 3. The margin is protected space | What is the margin? | classification / margin | Link the weight norm to margin width; keep functional and geometric margins distinct. |
| 4. Support vectors are the points that matter most | Why do support vectors matter? | classification / margin | Move each in a fixed-data example and compare refits; qualify ties and soft-margin cases. |
| 5. Hard margins break when reality overlaps | Why allow violations? | classification / margin | Introduce an overlapping point and show the constrained fit; handle the boundary case ξ=1 precisely. |
| 6. C decides how expensive violations are | What does C penalize? | classification / boundary | Scrub C on a logarithmic scale; compare actual training objective terms and validation behavior. |
| 7. Scale features before comparing distances | Why fit scaling inside a fold? | classification / split | Compare raw and scaled geometry with the same data; preserve feature-unit explanations. |
| 8. Hinge loss ignores easy correct points | Why do easy correct points have zero hinge loss? | classification / loss | Move a query along the hinge-loss curve and link its margin position. |
| 9. The decision score is not automatically a probability | Why is a score not a probability? | classification / scores | Inspect a score and an explicitly fitted calibration example; never relabel sigmoid output as calibrated without evidence. |
| 10. A straight boundary cannot solve every pattern | How can a nonlinear feature help? | classification / boundary | Map a ring example to radius space and show the resulting simple threshold. |
| 11. The kernel trick avoids explicit feature explosion | What does a kernel compute? | classification / kernel | Inspect an RBF influence profile; link C/gamma changes to the real fitted boundary with stale-fit cancellation. |
| 12. Tune the whole pipeline inside cross-validation | How do we choose C and gamma? | classification / tuning | Explore a bounded validation grid; use train-fitted scaling and keep final test sealed. |
| 13. Measure the errors the problem actually cares about | What matters beyond accuracy? | classification / confusion | Select a concrete goal and inspect matching validation metrics; explain OVR/OVO separately from the binary illustration. |
| 14. Change the knobs and watch the boundary answer back | Can I diagnose the fitted boundary? | classification / margin | Add a labeled training point explicitly, refit, and compare; preserve a baseline and provide an equivalent form input. |

## Time Series Analysis

10 sections · reviewed; further visual work is planned.

| Section | Learning question | Current experiment / renderer | Action or next requirement |
| --- | --- | --- | --- |
| 1. The Raw Data & The Question | Why does row order matter? | statistics / series | Compare chronological and shuffled views of the same data; explain what temporal relationships shuffling breaks. |
| 2. The Time Plot | What should I notice before modeling? | statistics / series | Tap or focus a date to pin its value; highlight time windows without requiring a hover. |
| 3. Decomposing the Pattern | How do components add up? | statistics / components | Toggle components on the same scale; label these as known simulation components, not estimated decomposition. |
| 4. The Assumption of Stationarity | What stays stable in a stationary process? | statistics / series | Compare drifting mean and changing variance separately; use a reading window without implying it proves stationarity. |
| 5. Fixing It: Differencing | What does differencing actually subtract? | statistics / differences | Select two adjacent values and trace the resulting difference; show that differencing does not guarantee stationarity. |
| 6. Looking to the Past (Lags & ACF) | What is a lag? | statistics / lag | Scrub lag while linking paired points and the ACF bar; explain approximate bounds and multiple-lag interpretation. |
| 7. Forecasting the Future | How do we evaluate forecasts honestly? | statistics / forecast | Step the forecast origin forward; compare a real naive baseline, and label the current forecast fan as heuristic until calibrated intervals replace it. |
| 8. Diagnostics: Evaluating Residuals | What patterns should residuals not retain? | statistics / residuals | Toggle a missing seasonal component and show residual ACF; distinguish random-looking residuals from proven model validity. |
| 9. Reading the Output | What belongs in a forecast report? | statistics / forecast | Link every reported number to its date range and model; avoid a nominal 95% label for an uncalibrated fan. |
| 10. Limitations & Caveats | When might yesterday stop predicting tomorrow? | statistics / series | Add a level shift and compare rolling versus expanding fitting windows; explain the conditional nature of forecasts. |

