# Implemented stage ledger

All 29 remaining modules and 321 stages use the approved notebook structure. Each row maps the actual authored question to its shipped visual scene.

## Analysis of Variance (ANOVA)

Engine: statistics. 16 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | Why do scores differ even within one method? | Compare the group spreads |
| 2 | Is the gap large compared with ordinary variation? | Compare the group spreads |
| 3 | Which assumptions support this comparison? | Compare the group spreads |
| 4 | Where does total variation come from? | Follow the variation |
| 5 | Why divide one mean square by another? | Build the F ratio |
| 6 | Why are only some values free? | Follow the variation |
| 7 | How do the numbers produce F? | Build the F ratio |
| 8 | How do I read an ANOVA table? | Read the calculation |
| 9 | Does a small p-value mean a large effect? | Build the F ratio |
| 10 | Which groups differ? | Compare two groups |
| 11 | Why add a second factor? | Change a difference of differences |
| 12 | What is a marginal mean? | Change a difference of differences |
| 13 | What does an interaction mean? | Change a difference of differences |
| 14 | How is two-way variation partitioned? | Follow the variation |
| 15 | What should I read first in the output? | Read the calculation |
| 16 | When should I choose a different analysis? | Compare the group spreads |

## Bias-Variance Trade-Off & Resampling

Engine: regression-lab. 12 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | Why can fitted predictions differ from reality? | Inspect the fitted prediction |
| 2 | What does a consistently rigid model miss? | Inspect the fitted prediction |
| 3 | What makes a flexible fit unstable? | Refit another training sample |
| 4 | Where does the squared-error decomposition apply? | Separate sources of squared error |
| 5 | Must error always follow a neat U-shape? | Compare the calculations |
| 6 | Why is training error insufficient? | Compare the calculations |
| 7 | Why can one validation split be noisy? | Inspect a held-out fold |
| 8 | What does K-fold validation average? | Inspect a held-out fold |
| 9 | What changes in leave-one-out? | Inspect a held-out fold |
| 10 | What does sampling with replacement mean? | Trace a bootstrap sample |
| 11 | Which resampling method answers my question? | Inspect a held-out fold |
| 12 | Can I distinguish bias, variance, and uncertainty? | Refit another training sample |

## Chi-Square Test of Independence

Engine: statistics. 7 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | Why use counts instead of averages? | Observed and expected counts |
| 2 | What does independence predict? | Observed and expected counts |
| 3 | Why multiply row and column totals? | Observed and expected counts |
| 4 | Why square and divide by expected count? | Follow each contribution |
| 5 | How unusual is the statistic under independence? | Read the reference distribution |
| 6 | What can I conclude from the output? | Observed and expected counts |
| 7 | When is the approximation unsuitable? | Observed and expected counts |

## Classification Trees

Engine: trees. 15 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What is the target category? | Explore the decision surface |
| 2 | Which rows may choose a split? | Keep the partitions separate |
| 3 | What does the root predict before splitting? | Follow the selected path |
| 4 | What is impurity? | Measure split improvement |
| 5 | Why inspect several candidate questions? | Measure split improvement |
| 6 | How is split improvement calculated? | Measure split improvement |
| 7 | How is the procedure reused in a child? | Follow the selected path |
| 8 | Why do tree boundaries look rectangular? | Explore the decision surface |
| 9 | How do depth limits and pruning differ? | Inspect complexity choices |
| 10 | How should we select tree depth? | Compare training and validation |
| 11 | How does one new row travel through the tree? | Follow the selected path |
| 12 | Which errors does the tree make? | Count held-out decisions |
| 13 | What belongs in tree output? | Follow the selected path |
| 14 | What changes when I modify complexity? | Explore the decision surface |
| 15 | When should I prefer another model? | Explore the decision surface |

## Confidence Intervals & Hypothesis Testing

Engine: statistics. 9 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What uncertainty does an estimate leave? | Estimate and uncertainty |
| 2 | What do a confidence interval and a p-value ask? | Estimate and uncertainty |
| 3 | How do we compute one interval and test? | Estimate and uncertainty |
| 4 | How do alpha, beta, power, and effect size connect? | Two specified reference models |
| 5 | Why does larger n change precision? | Estimate and uncertainty |
| 6 | When can the nominal result mislead? | Two specified reference models |
| 7 | What should be decided before looking at results? | Estimate and uncertainty |
| 8 | How do we report a result without overclaiming? | Estimate and uncertainty |
| 9 | Can I interpret uncertainty correctly? | Estimate and uncertainty |

## Correlation

Engine: statistics. 10 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What makes observations paired? | Inspect paired observations |
| 2 | What do direction and form tell us? | Inspect paired observations |
| 3 | What does r measure? | Inspect paired observations |
| 4 | What is the null about? | Read the reference distribution |
| 5 | Why multiply deviations from the means? | Multiply the deviations |
| 6 | Can r miss a strong pattern? | Inspect paired observations |
| 7 | Why can one point change r so much? | Inspect paired observations |
| 8 | What does the test result mean? | Read the reference distribution |
| 9 | Why does association not establish cause? | Compare explanations |
| 10 | Which correlation should I use? | Inspect paired observations |

## Data Leakage & Pipelines

Engine: workflow. 9 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | How can a good score be misleading? | What is known at prediction time? |
| 2 | What information is allowed to cross a split? | Fit only on training data |
| 3 | What does leakage change in a concrete example? | Locate the class centers |
| 4 | What kinds of leakage exist? | Trace the information crossing |
| 5 | Can I repair this pipeline? | Fit only on training data |
| 6 | What can pipelines fail to prevent? | What is known at prediction time? |
| 7 | How should nested selection work? | One outer evaluation fold |
| 8 | How do I document a defensible pipeline? | Read the analysis record |
| 9 | Can I spot a new leakage path? | Trace the information crossing |

## Deep Learning

Engine: neural. 12 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What exactly should the system output? | Choose the output contract |
| 2 | What shortcut might the model learn? | Identify a dataset shortcut |
| 3 | Which examples may influence which choices? | Fit only on training data |
| 4 | What is a tensor's shape? | Count the tensor dimensions |
| 5 | What does one neuron do? | Trace products, sum, and activation |
| 6 | Why might depth help? | Compose transformations |
| 7 | How does the correction cycle work? | Step, inspect, and rewind |
| 8 | How do we reduce overfitting? | Training and evaluation differ |
| 9 | Why choose CNN, RNN, or attention? | One mechanism at a time |
| 10 | What is reused during transfer learning? | Choose which parameters can change |
| 11 | What would make an evaluation honest and useful? | Inspect validation decisions |
| 12 | What does deployment actually package? | Check the input contract |

## Experimental Design & Randomisation

Engine: workflow. 9 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What causal comparison do we want? | Define the comparison |
| 2 | What does random assignment accomplish? | One realized allocation |
| 3 | Why are twenty schools not six hundred independent assignments? | Step through the merges |
| 4 | How do blocking, blinding, and intention-to-treat differ? | Follow the planned sequence |
| 5 | How does clustering affect effective information? | Count independent information |
| 6 | What can break a randomized comparison? | Identify the broken comparison |
| 7 | What should be planned before recruitment? | Follow the planned sequence |
| 8 | What belongs in a transparent report? | Read the analysis record |
| 9 | Can I identify the unit and analysis implication? | Step through the merges |

## Gradient Boosting

Engine: trees. 9 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | Why add another learner to the current model? | Inspect the fitted prediction |
| 2 | What is learned at the next round? | Inspect the errors |
| 3 | How do three rounds build a prediction? | Add the scaled corrections |
| 4 | Why do learning rate and round count interact? | Compare training and validation |
| 5 | When should we stop adding rounds? | Compare training and validation |
| 6 | What can a complex boosted model still get wrong? | Inspect the fitted prediction |
| 7 | How should tuning be organized? | Compare training and validation |
| 8 | What do we report about the selected ensemble? | Add the scaled corrections |
| 9 | Can I compute the next prediction? | Add the scaled corrections |

## Hierarchical Clustering

Engine: unsupervised. 9 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What does grouping without an answer key mean? | Step through the merges |
| 2 | How do we define close? | Inspect a distance receipt |
| 3 | Why merge this pair first? | Step through the merges |
| 4 | How far apart are groups? | Compare group-distance rules |
| 5 | How is the merge history built? | Read the merge history |
| 6 | What does dendrogram height represent? | Read the merge history |
| 7 | How does a horizontal cut produce K groups? | Read the merge history |
| 8 | How sensitive is the tree to preprocessing? | Step through the merges |
| 9 | When is this preferable to K-Means? | Read the merge history |

## Imbalanced Classification

Engine: classification. 9 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | Why can 99% accuracy be useless? | Follow the denominators |
| 2 | Why does prevalence change precision? | Follow the denominators |
| 3 | How many false alerts occur in the worked example? | Count held-out decisions |
| 4 | Which tradeoffs matter for rare positives? | Count held-out decisions |
| 5 | What happens when we lower the threshold? | Count held-out decisions |
| 6 | Why can resampling mislead evaluation? | Follow the denominators |
| 7 | How do we choose a usable operating point? | Lock and evaluate once |
| 8 | What should accompany the final score? | Count held-out decisions |
| 9 | Can I compute workload for a new prevalence? | Follow the denominators |

## K-Nearest Neighbors (KNN)

Engine: classification. 14 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What is stored by KNN? | Move a query among training rows |
| 2 | What makes a feature useful for distance? | Move a query among training rows |
| 3 | Why separate development and final evaluation? | Keep the partitions separate |
| 4 | Why do units affect neighbors? | Move a query among training rows |
| 5 | How is distance calculated? | Inspect a distance receipt |
| 6 | Why does K change the behavior? | Move a query among training rows |
| 7 | Which observations are the nearest? | Inspect a distance receipt |
| 8 | How do neighbors vote? | Accumulate the predictions |
| 9 | Where do predictions change? | Explore the decision surface |
| 10 | How do unseen points get a label? | Move a query among training rows |
| 11 | What does the confusion matrix count? | Count held-out decisions |
| 12 | How do we choose K? | Compare development settings |
| 13 | When does KNN become unreliable or expensive? | Move a query among training rows |
| 14 | Can I explain a new prediction? | Accumulate the predictions |

## Linear Discriminant Analysis (LDA)

Engine: classification. 15 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What do the labeled clouds represent? | Compare class distributions |
| 2 | Why does feature choice matter? | Compare class distributions |
| 3 | Which data estimate the class distributions? | Keep the partitions separate |
| 4 | Why group observations by class? | Compare class distributions |
| 5 | What is a class mean? | Locate the class centers |
| 6 | What does within-class scatter describe? | Inspect spread and orientation |
| 7 | Why share one covariance estimate? | Inspect spread and orientation |
| 8 | What counts as between-class separation? | Locate the class centers |
| 9 | Why project along this direction? | Rotate the coordinate system |
| 10 | Why is the boundary linear? | Explore the decision surface |
| 11 | How is a new case classified? | Compare the calculations |
| 12 | How do we judge the classifier? | Count held-out decisions |
| 13 | What does an LDA summary mean? | Read the fitted weights |
| 14 | When is the shared-shape assumption costly? | Compare class distributions |
| 15 | Can I predict how the boundary will move? | Explore the decision surface |

## Logistic Regression

Engine: classification. 10 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What is the binary outcome? | Explore the decision surface |
| 2 | Why is an ordinary line awkward for probability? | Turn a score into a probability |
| 3 | What does the sigmoid do? | Turn a score into a probability |
| 4 | How do weighted clues form z? | Follow each contribution |
| 5 | What does learning minimize? | Inspect the loss |
| 6 | Why does a probability need a decision threshold? | Explore the decision surface |
| 7 | Which mistakes does this threshold create? | Count held-out decisions |
| 8 | What does the ROC curve summarize? | Trace validation thresholds |
| 9 | What is an odds ratio? | Read the fitted weights |
| 10 | What is locked before the final test? | Lock and evaluate once |

## Missing Data & Encoding

Engine: workflow. 9 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What might an empty cell mean? | A blank is not a zero |
| 2 | What assumptions do filling and encoding add? | Choose category geometry |
| 3 | Why can mean filling distort an analysis? | Locate the class centers |
| 4 | How do MCAR, MAR, MNAR, and encoding differ? | State the missingness assumption |
| 5 | How should methods be compared fairly? | A blank is not a zero |
| 6 | What can imputation not recover automatically? | Choose category geometry |
| 7 | What belongs in the fitted pipeline? | Fit only on training data |
| 8 | What must be documented? | Read the analysis record |
| 9 | Can I choose a safe transformation? | Choose category geometry |

## Model Selection & Regularization

Engine: regression-lab. 12 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | Why can extra flexibility hurt new predictions? | Compare the calculations |
| 2 | What happens when coefficients are not identifiable? | Read the fitted weights |
| 3 | Why not search every subset? | Count the candidate models |
| 4 | What does each scorecard penalize? | Compare selection criteria |
| 5 | What does shrinkage trade away? | Read the fitted weights |
| 6 | Why does Ridge usually keep all predictors? | Read the fitted weights |
| 7 | Why can Lasso produce zeros? | Read the fitted weights |
| 8 | How do we choose lambda honestly? | Compare the calculations |
| 9 | How do PCR and PLS differ? | Separate the components |
| 10 | Which tradeoff matters for this task? | Read the fitted weights |
| 11 | How does repeated evaluation bias our choices? | Inspect a held-out fold |
| 12 | Can I justify the selected model? | Compare the calculations |

## Multiple Linear Regression

Engine: regression-lab. 9 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | Why use more than one predictor? | Inspect the fitted prediction |
| 2 | How does the equation combine clues? | Follow each contribution |
| 3 | What changes when I adjust one coefficient? | Inspect the fitted prediction |
| 4 | How does least squares select the weights? | Inspect the fitted prediction |
| 5 | What does holding constant mean? | Follow each contribution |
| 6 | How is a prediction assembled? | Follow each contribution |
| 7 | Why can an apparent relationship disappear? | Read the fitted weights |
| 8 | Why can training R-squared reward useless variables? | Compare the calculations |
| 9 | How do I read a regression summary? | Read the fitted weights |

## Neural Networks

Engine: neural. 19 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What does learning from examples mean? | A fully computed small network |
| 2 | How do rows become inputs and targets? | One row becomes two inputs |
| 3 | When should preprocessing be learned? | Fit only on training data |
| 4 | What does a layer compute? | Trace products, sum, and activation |
| 5 | Why does each connection have its own weight? | Trace products, sum, and activation |
| 6 | Why are nonlinear activations necessary? | Change the nonlinear mapping |
| 7 | What happens in one forward pass? | Follow the forward values |
| 8 | What does loss measure? | Inspect the loss |
| 9 | What does backpropagation compute? | Gradients before updates |
| 10 | What does the optimizer change? | Apply one simultaneous update |
| 11 | Why must operations happen in this order? | Step, inspect, and rewind |
| 12 | Why monitor validation during training? | Compare learning curves |
| 13 | Which settings do humans choose? | Control the learning process |
| 14 | What is evaluated on the final test set? | Inspect validation decisions |
| 15 | What can an individual error teach us? | Inspect one prediction error |
| 16 | What must be saved with the weights? | Check the input contract |
| 17 | Why do different architectures exist? | One mechanism at a time |
| 18 | Can I predict this tiny network's answer? | A fully computed small network |
| 19 | Can I explain a complete training cycle? | Step, inspect, and rewind |

## One-R

Engine: classification. 12 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What does one feature mean? | Read the one-feature rule |
| 2 | Why start with a majority baseline? | Accumulate the predictions |
| 3 | How is a rule built for each value? | Read the one-feature rule |
| 4 | How is the winning feature selected? | Read the one-feature rule |
| 5 | Why bucket numeric values? | Read the one-feature rule |
| 6 | What happens with missing or unseen values? | Read the one-feature rule |
| 7 | Why is prediction inexpensive? | Read the one-feature rule |
| 8 | What can a single feature miss? | Explore the decision surface |
| 9 | What must be refitted inside each fold? | Keep the partitions separate |
| 10 | Which metric matches the decision? | Count held-out decisions |
| 11 | How does One-R differ from a stump? | Read the one-feature rule |
| 12 | Can I build and explain a rule? | Read the one-feature rule |

## Principal Component Analysis (PCA)

Engine: unsupervised. 10 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What can we learn without a target? | Rotate the coordinate system |
| 2 | Why compress several measurements? | Rotate the coordinate system |
| 3 | Why maximize projected variance? | Rotate the coordinate system |
| 4 | What are loadings? | Read the direction weights |
| 5 | Why might scaling change the answer? | Rotate the coordinate system |
| 6 | How is PC2 selected? | Rotate the coordinate system |
| 7 | What are scores? | Compare the calculations |
| 8 | What fraction of variance is retained? | Count retained variance |
| 9 | Can I discover the best projection? | Rotate the coordinate system |
| 10 | What should I report and avoid claiming? | Project back to the inputs |

## Polynomial Regression

Engine: regression-lab. 8 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | Why might a straight line miss the pattern? | Inspect the fitted prediction |
| 2 | What does a baseline teach us? | Inspect the fitted prediction |
| 3 | Why create x-squared and x-cubed? | Build the input columns |
| 4 | What do the weights do? | Read the fitted weights |
| 5 | What do residual patterns tell us? | Inspect the errors |
| 6 | Why can a flexible curve do worse on new data? | Compare the calculations |
| 7 | How should we select the degree? | Compare the calculations |
| 8 | What gets locked before final evaluation? | Inspect the fitted prediction |

## Probability & Sampling Distributions

Engine: statistics. 9 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | Why does a sample answer vary? | One sample, one estimate |
| 2 | How are probability, density, and frequency different? | Area means probability |
| 3 | How is a standard error calculated? | One sample, one estimate |
| 4 | What is the sampling distribution? | Repeat the sampling process |
| 5 | What changes with sample size? | Repeat the sampling process |
| 6 | When is the usual SE misleading? | Repeat the sampling process |
| 7 | Which sampling design matches the question? | One sample, one estimate |
| 8 | What should a sampling result report? | Repeat the sampling process |
| 9 | Can I tell SD from SE? | Repeat the sampling process |

## Quadratic Discriminant Analysis (QDA)

Engine: classification. 10 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What differs between these class clouds? | Compare class distributions |
| 2 | Why hold out examples? | Keep the partitions separate |
| 3 | When is a straight boundary too restrictive? | Explore the decision surface |
| 4 | Which parameters does QDA estimate? | Inspect spread and orientation |
| 5 | What is shape-aware distance? | Inspect a distance receipt |
| 6 | Why do unequal covariances yield a quadratic boundary? | Explore the decision surface |
| 7 | How should performance be evaluated while exploring? | Count held-out decisions |
| 8 | What do prior and covariance outputs mean? | Read the fitted weights |
| 9 | What does regularization stabilize? | Inspect spread and orientation |
| 10 | When is the extra flexibility worth its cost? | Explore the decision surface |

## Random Forest

Engine: trees. 9 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | Why combine several trees? | Accumulate the predictions |
| 2 | What makes trees different? | Trace a bootstrap sample |
| 3 | How is a forest prediction produced? | Accumulate the predictions |
| 4 | Why does correlation between trees matter? | Accumulate the predictions |
| 5 | What is an out-of-bag prediction? | Count only eligible voters |
| 6 | What problems do more trees not solve? | Accumulate the predictions |
| 7 | How should a forest be tuned and validated? | Compare training and validation |
| 8 | What should be reported? | Accumulate the predictions |
| 9 | Can I trace a held-out vote? | Count only eligible voters |

## Regression Diagnostics

Engine: regression-lab. 9 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | Why can a high R-squared coexist with a bad model? | Inspect the errors |
| 2 | What is a residual checking? | Inspect the errors |
| 3 | How does an influential point differ from an outlier? | Remove and restore one point |
| 4 | Which diagnostic answers which question? | Choose a diagnostic view |
| 5 | What does a curve or funnel suggest? | Inspect the errors |
| 6 | What cannot a residual plot establish? | Inspect the errors |
| 7 | How should a diagnostic change the analysis? | Inspect the fitted prediction |
| 8 | What should the report say? | Compare the calculations |
| 9 | Can I match symptom and response? | Choose a diagnostic view |

## Regression Trees

Engine: trees. 16 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What are we predicting? | Inspect the fitted prediction |
| 2 | Which rows can influence training? | Keep the partitions separate |
| 3 | Why start with the mean? | Inspect the fitted prediction |
| 4 | How can one question improve the prediction? | Follow the selected path |
| 5 | How is a split scored? | Measure split improvement |
| 6 | Why test many candidate questions? | Measure split improvement |
| 7 | What makes the process recursive? | Follow the selected path |
| 8 | How do I read a tree? | Follow the selected path |
| 9 | Why can a deeper tree overfit? | Compare training and validation |
| 10 | Which stopping rules constrain growth? | Follow the selected path |
| 11 | How does pruning differ from stopping early? | Inspect complexity choices |
| 12 | When does a tree differ from a line? | Inspect the fitted prediction |
| 13 | What changes when I alter the data? | Inspect the fitted prediction |
| 14 | What do the reported metrics mean? | Compare training and validation |
| 15 | What are the characteristic failure cases? | Inspect the fitted prediction |
| 16 | Can I reconstruct the algorithm? | Follow the selected path |

## Support Vector Machines — Separate classes with breathing room

Engine: classification. 14 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | What does a decision boundary decide? | Explore the decision surface |
| 2 | Why is one separator preferable to another? | Explore the decision surface |
| 3 | What is the margin? | Inspect the signed margin |
| 4 | Why do support vectors matter? | Inspect the signed margin |
| 5 | Why allow violations? | Inspect the signed margin |
| 6 | What does C penalize? | Explore the decision surface |
| 7 | Why fit scaling inside a fold? | Keep the partitions separate |
| 8 | Why do easy correct points have zero hinge loss? | Inspect the loss |
| 9 | Why is a score not a probability? | Compare the calculations |
| 10 | How can a nonlinear feature help? | Explore the decision surface |
| 11 | What does a kernel compute? | Compare feature-space similarity |
| 12 | How do we choose C and gamma? | Compare development settings |
| 13 | What matters beyond accuracy? | Count held-out decisions |
| 14 | Can I diagnose the fitted boundary? | Inspect the signed margin |

## Time Series Analysis

Engine: statistics. 10 stages.

| Stage | Learner question | Visual scene |
| --- | --- | --- |
| 1 | Why does row order matter? | Read the ordered series |
| 2 | What should I notice before modeling? | Read the ordered series |
| 3 | How do components add up? | Separate the components |
| 4 | What stays stable in a stationary process? | Read the ordered series |
| 5 | What does differencing actually subtract? | Subtract a previous value |
| 6 | What is a lag? | Compare shifted values |
| 7 | How do we evaluate forecasts honestly? | Forecast from past information |
| 8 | What patterns should residuals not retain? | Inspect the errors |
| 9 | What belongs in a forecast report? | Forecast from past information |
| 10 | When might yesterday stop predicting tomorrow? | Read the ordered series |
