// Sparse section-specific overrides for the visual storytelling pass.
// These are local experiments; scrolling alone chooses a lesson visual.
export const storyPrompts = {
  "logistic-regression": {
    1: "Move the decision threshold. Watch the dashed horizontal line and the red/blue regions move together while the sigmoid curve stays fixed. Red predicts class 1 at or above the cutoff; blue predicts class 0 below it.",
    2: "Raise the decision threshold, then lower it. Compare the expanding blue region with the shrinking red region. The cutoff changes the decision rule, not the fitted probability.",
    5: "Move the decision threshold and watch the dashed boundary slide through input space. The colored regions show the resulting decisions; the observations and fitted probabilities stay fixed.",
  },
  lda: {
    5: "Change the contour radius. Follow the gold query from each hollow class center, then compare the shapes after both centers move to zero.",
    6: "Choose Unequal covariance. Notice that LDA still fits one shared contour shape: the centered solid and dashed outlines coincide.",
  },
  qda: {
    3: "Change the contour radius, then move the gold query. Compare the fitted centers, ellipse shapes, and shape-adjusted distances in the receipt.",
    8: "Increase Shrink toward pooled covariance from 0 to 1. Watch the centered contours converge to the same shape.",
  },
  knn: {
    7: "Change K and vote weighting. Trace every neighbor’s distance and weight into the colored contribution strip; the class-1 total gives the vote share.",
    13: "Move the query and compare uniform with inverse-distance voting. Explain which neighbors gained influence and whether the threshold decision changed.",
  },
  "model-selection": {
    3: "Change polynomial degree. Compare the unpenalized AIC/BIC and RSS; each added coefficient increases the complexity penalty. Penalty settings from other sections do not affect these OLS scorecards.",
  },
  anova: {
    3: "Select a score. Follow the purple distance to its group mean, then the gold distance to the grand mean. Compare those signed distances with the squared totals for all observations.",
  },
  "probability-sampling": {
    0: "Inspect a sample number. Follow its observations to the gold mean dot, then find that same mean among the 200 repeated samples.",
    2: "Increase observations per sample. Compare the spread of individual values with the spread of sample means on the same outcome scale; check SD ÷ √n.",
    3: "Change the inspected sample number. Each gold dot below represents an entire sample above, reduced to one mean.",
    4: "Keep population SD fixed and increase n. The individuals remain spread out while the cloud of sample means narrows. Draw a new batch to see sampling variability.",
    8: "Before moving n, predict which cloud will narrow: individual values or sample means. Then check the theoretical SE against the computed spread of 200 means.",
  },
  "confidence-hypothesis-testing": {
    1: "Count intervals crossing the fixed true effect 0. Draw a new batch: the count can change even though the confidence procedure stays at 95%.",
    3: "Change the planned true effect, then sample size. Compare the alternative distribution with the fixed null rejection boundaries and read prospective power.",
    5: "Compare the two specified sampling models. These curves assume independent normal observations and known population SD; they cannot diagnose a violated assumption.",
    8: "Draw several batches. Explain why an individual interval either covers the fixed truth or misses it, while 95% describes the repeated procedure.",
  },
  "time-series-analysis": {
    2: "Change the trend or seasonal amplitude and follow the affected component into the observed series above. All rows use the same months; their vertical scales differ.",
  },
  "gradient-boosting": {
    1: "Select a training row. Its vertical error in the first plot becomes its residual target in the middle plot. The small tree fits those residuals.",
    2: "Add one learner. Follow the selected row from its previous prediction through learning rate × correction to its updated prediction, then rewind one round.",
    7: "Compare a small and large learning rate. Read the exact addition for one row and check the validation curve in its corresponding section.",
    8: "Explain all three panels for one row: previous prediction, residual-fitting tree, and updated prediction. Verify the arithmetic before adding another learner.",
  },
  "neural-networks": {
    4: "Move the shared input x₁ and follow its gold guide to three different weighted contributions. Change the first connection weight: only unit 1’s line tilts.",
    6: "Pick an observation in the bottom map, or move the input sliders. Follow the gold input through three activation maps, inspect the signed weighted contributions, and see their sum become a probability.",
    10: "Follow one input through the forward calculation, loss, gradient and update. Advance one phase at a time; rewind restores the exact earlier weights.",
  },
  "deep-learning": {
    6: "Follow one gold input through the hidden response maps and weighted contributions. Then advance through loss, gradient and update; rewind restores the earlier model.",
    7: "Compare all-unit evaluation with the fixed dropout mask. The crossed unit contributes zero; kept activations are scaled by 1.5 before the weighted sum. This illustrates the forward calculation, not stochastic dropout training.",
  },
};
