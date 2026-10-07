import { visualRevision } from '../modules/notebook/visual-revisions.js';
// Short, authored instructions for reading the actual visual objects.
// These describe marks and operations; calculations stay in the model engines.
const common = {
  groups: 'Each dot is one observed score. Compare the group averages with the spread of dots inside each group.',
  partition: 'Follow one score’s two gaps: its group’s gap from the overall average, and its own gap from its group average.',
  ratio: 'Compare spread between groups with spread inside them. The F calculation divides two mean squares, not two raw totals.',
  table: 'Read one row at a time. Follow the same counts through squared spread, degrees of freedom, and the final comparison.',
  contrasts: 'Compare the two group averages. Keep their spread and sample sizes in view while judging the gap.',
  interaction: 'Compare the gaps between groups in each setting. A changed gap is the pattern of interest, not just a high line.',
  scatter: 'Each dot joins two values from the same observation. Look at the direction, curve and unusual points before using r.',
  distribution: 'The curve is a reference model. The marked tail compares the observed statistic with results under that model.',
  deviations: 'Find each value’s gap from its average. Matching signs give a positive product; opposite signs give a negative one.',
  causal: 'Follow the possible paths between variables. A shared cause can create a link without one plotted variable causing the other.',
  counts: 'Each cell is a count. Compare actual counts with the independence model’s expected counts, keeping row and column totals visible.',
  contributions: 'Follow the separate products or scaled gaps into the total. A negative contribution lowers the sum.',
  series: 'Read the observations in time order. Each position along the line is one period’s value; the line links successive periods.',
  components: 'Compare the separate parts with their sum. These are known simulated components, not an estimated real-data decomposition.',
  differences: 'The change at a time point is its value minus an earlier value. The first difference has one fewer entry than the original series.',
  lag: 'Each pair uses two values separated by the chosen time gap. The gap is a lag, not a different input variable.',
  forecast: 'The forecast repeats the last observed season. Future actual values score the prediction; they do not help make it.',
  residuals: 'A residual is actual minus predicted. Follow the same observation from its prediction gap to the error plot.',
  sample: 'The upper dots are sampled individuals. Their average becomes one gold dot in the lower plot of repeated sample averages.',
  density: 'Probability is area over a range. The curve’s height at one value is density, not the chance of that exact continuous value.',
  sampling: 'Each lower dot is a whole sample reduced to one average. Compare its spread with the spread of individual values.',
  interval: 'Each interval is a sample-based range. The fixed true value does not move; another sample can make an interval cover it or miss.',
  power: 'Compare the null and specified alternative models with the rejection boundary. Power concerns detecting that planned alternative.',
  fit: 'Dots are observed outcomes. The fitted line or surface gives predictions; vertical gaps are actual minus predicted.',
  coefficients: 'Each coefficient is a multiplier in the fitted rule. Read its units and compare the combined prediction, not weight size alone.',
  basis: 'The extra columns come from the same input. Squaring or cubing creates new ingredients, not new observed rows.',
  scores: 'Compare calculations made under the same data and evaluation rules. Training fit and held-out error answer different questions.',
  influence: 'Compare the fit before and after changing one case. A point’s influence is the change it causes in the fitted result.',
  diagnostic: 'Each error pattern is a clue to investigate. A tidy residual plot does not prove independent sampling or a causal effect.',
  resamples: 'Each curve comes from a different training sample. Their movement shows how fitted predictions vary across samples.',
  decomposition: 'At the selected input, compare average fitted prediction, variation across fits, and the known simulated noise.',
  folds: 'One group is held out for checking. Fit on the others, rotate the held-out group, and keep final-test data outside this loop.',
  bootstrap: 'A row can be drawn more than once or omitted. The counts show a sample with replacement, not extra independent people.',
  subsets: 'Each candidate uses a different input subset. More possible subsets mean more search work and more chances for a lucky result.',
  criteria: 'Each score balances fit with a stated penalty. Compare candidates under the same criterion rather than mixing unlike score scales.',
  boundary: 'The background shows the predicted decision or probability, as labelled. The dividing line is a fitted rule, not a physical boundary.',
  sigmoid: 'The S-shaped curve turns a raw score into probability. Moving a decision cutoff changes labels while that curve stays fixed.',
  loss: 'Read the penalty at the current prediction. Confident wrong answers can cost much more than uncertain ones.',
  confusion: 'The four counts compare actual labels with predictions. TP and TN are correct; FP is a false alert and FN a missed positive.',
  roc: 'Each point compares recall and false-alarm rate at one cutoff. The scores stay fixed while the decision threshold changes.',
  final: 'Development choices are separate from a locked final evaluation. A changing validation display is not a fresh final test.',
  neighbors: 'The query is the point to predict. Its highlighted neighbours are training examples selected by the displayed distance rule.',
  split: 'Training learns the rule, validation compares choices, and final-test examples stay sealed while those choices change.',
  distances: 'Compare each input gap with its scale. The receipt shows how those gaps form the distance used by the model.',
  votes: 'Follow each selected prediction or neighbour weight into the combined answer. Name the averaging or voting rule.',
  tuning: 'Compare settings on development data. Keep the sample fixed so a change in the score has a clear source.',
  clouds: 'Dots carry known class labels. Outlines describe fitted spread around class centres; they are not hard walls containing every case.',
  means: 'A centre is the average position of a class’s training points. A new query is scored without being added to that average.',
  covariance: 'The outlines show spread and tilt. Compare a point’s gap along a wide direction with the same gap along a narrow one.',
  projection: 'Follow each observation into its new coordinate. Projection changes the representation, not the identity of the observed rows.',
  margin: 'Compare the zero-score boundary with the two margin lines. Marked support points help determine this fitted separator.',
  kernel: 'Similarity falls with the scaled distance between points. A more local influence can create a more detailed boundary.',
  rules: 'A saved value or interval looks up a class. The chosen one-feature rule does not use every input in a new row.',
  prevalence: 'Count actual positives and negatives first. Then count alerts and misses before dividing to form rates.',
  tree: 'The same selected point appears in the map and branching path. Follow its input comparisons to one leaf.',
  gain: 'Compare the parent with both children. Child sizes weight their error or impurity before calculating the improvement.',
  curve: 'Training and validation scores describe different rows. More complexity can improve one while worsening the other.',
  pruning: 'The penalty removes branches from one fixed grown tree. This differs from stopping new branches before they are grown.',
  oob: 'Crossed-out trees used this training row. Only trees that left it out may vote on its out-of-bag prediction.',
  additive: 'Start with the old prediction. Add learning rate times each fitted correction to build the new running total.',
  clusters: 'Each merge joins two current groups. The next comparison uses the updated groups and chosen linkage rule.',
  linkage: 'The connecting distances depend on the rule for comparing groups. Nearest, farthest and average pairs answer different questions.',
  dendrogram: 'Height records the linkage value at a merge. Left-to-right leaf spacing is layout, not a distance between observations.',
  loadings: 'Loadings are weights defining a direction. Scores are the selected row’s coordinates along that direction.',
  scree: 'Bars and the running total show retained sample variance. They do not show a guaranteed fraction of meaning or predictive usefulness.',
  reconstruction: 'Bring a component score back into the original input coordinates. The gap shows what the reduced representation lost.',
  network: 'Follow one input through small numerical units. Connections multiply, units add and transform, and the output gives a probability.',
  inputs: 'Two coordinates form one input row. Its known target is a separate answer used for checking, not an extra prediction input.',
  pipeline: 'Only training rows teach learned preparation or parameters. Validation and final-test rows have separate roles.',
  neuron: 'Multiply the inputs by their connection weights, add the bias, then apply the activation. Read the numbers in that order.',
  activation: 'Compare raw input to output on the activation curve. A bend changes the response, not the meaning of the original input.',
  forward: 'The same gold input travels through the response maps and weighted sum. This calculation does not change weights.',
  backward: 'Gradients measure local loss slopes. They are calculated before an optimizer changes any parameter.',
  update: 'The downhill arrow goes against the gradient. The displayed landscape is a two-weight slice with other parameters fixed.',
  cycle: 'Prediction, loss and gradients use one weight snapshot. Only the update phase changes it; rewind restores the previous snapshot.',
  training: 'Compare training loss with loss on separate validation rows. A checkpoint choice is development, not final-test evidence.',
  settings: 'Architecture and training settings are human choices. The numerical weights and biases are learned within those choices.',
  evaluation: 'The cells count validation decisions. Final-test labels remain sealed while model or threshold choices are still changing.',
  errors: 'Inspect the actual and predicted class for the same point. A single error can be informative without describing the entire population.',
  contract: 'Input order, shape and preparation must match training. Swapped or missing fields can change or invalidate a prediction.',
  architecture: 'Follow one local mechanism: filter products, a carried sequence state, or attention-weighted values. These are teaching computations.',
  task: 'The same picture can need an image label, a location box or a pixel mask. Each task asks for a different output.',
  shortcut: 'Keep the object fixed and change the background. A changed answer exposes the illustrated shortcut rule.',
  tensor: 'A pixel address points to one array entry. Batch, row, column and channel sizes count how the input numbers are organized.',
  hierarchy: 'Follow the input window through filter products, their sum and ReLU. The shown filters illustrate the computation, rather than trained recognition.',
  regularization: 'The fixed mask removes one hidden response. Compare this illustrated forward pass with all-unit evaluation, not a full dropout training run.',
  transfer: 'Frozen blocks keep their parameters. The new head learns, while the control decides whether the later backbone may also change.',
  timing: 'An input measured before prediction may enter the rule. A later outcome cannot travel backwards to help make that prediction.',
  leakage: 'The red path crosses a training boundary. Check which rows taught the saved value before it transforms held-out rows.',
  nested: 'Inner folds choose settings. The outer held-out group remains outside all those choices and checks the selected procedure.',
  report: 'Read the saved rule beside the rows or choices that produced it. A recorded result needs its assumptions and evaluation role.',
  missing: 'A question mark is an unobserved value. Its displayed true position is known here only because the data is simulated.',
  encoding: 'Separate yes/no columns represent unordered categories. A single numeric code can impose an order and distance that may not be justified.',
  mechanism: 'Compare the simulated missingness patterns. Observed blanks in real data do not prove which missingness assumption is true.',
  estimand: 'One person can show only one outcome under one assigned treatment. Comparable groups help estimate the chosen contrast.',
  assignment: 'Each whole school receives one assignment. Pupils in it are not separate independent treatment assignments.',
  protocol: 'Question marks are future outcomes. Define the comparison and analysis before those answers are observed.',
  'design-effect': 'Compare measured pupils with approximate effective sample size. More pupils do not create more randomized schools.',
  threats: 'The crossed pupils illustrate missing follow-up. Losing different people can change which outcomes remain available to compare.',
};
const specific = {
  anova: {table:common.table},
  'chi-square':{contributions:'Every bar is a squared cell gap divided by expected count. These contributions cannot be negative; add them to obtain χ².'},
  'time-series-analysis':{residuals:'Each bar describes how forecast errors vary together at a time gap. Positive and negative values are correlations, rather than raw error units.'},
  'model-selection':{
    subsets:'Each row is a possible input combination. Filled dots include columns; hollow dots leave them out. These are candidates, not fitted search results.',
    criteria:'Both totals add the same fit term and a different parameter penalty. A negative score is possible; it is not a negative prediction error.',
    components:'The same training rows form two centred columns, x and x². Blue uses input spread; gold also uses the outcome. This shows first directions, not full PCR/PLS performance.',
  },
  'bias-variance':{decomposition:'Top dots are predictions from twenty training fits at the same input. The lower bar separates squared bias, prediction variance and known simulated noise.'},
  'multiple-linear-regression': {
    scores:'Compare training R² with its adjusted version on the same sample. An extra noise input can improve training fit without helping new predictions.',
  },
  lda:{projection:'Project the same labelled points onto a line. LDA uses separation between class means relative to spread inside each class.',coefficients:'The bars show class averages along input x. Read the full means, priors and covariance beside them; these are summaries, not causal effects.'},
  qda:{boundary:'The boundary is where the class scores tie. Different fitted spread shapes can leave curved or disconnected decision regions.',coefficients:'The bars show class averages along input x. Priors and class-specific covariance are in the receipt. These summaries describe the fitted data.'},
  knn:{tuning:'Each point is computed leave-one-out accuracy for one K. Every scored training row was kept out of its own scales and neighbour search.'},
  'logistic-regression':{coefficients:'Each input coefficient becomes an odds multiplier through e^coefficient. Keep the other input fixed; this multiplier does not multiply probability.'},
  'support-vector-machine':{margin:'The zero-score separator and ±1 margin contours describe the fitted model. Linear-kernel contours are exact lines; RBF contours are sampled approximations.',loss:'The control inspects true signed label times score. Hinge loss is zero at or beyond the correct unit margin, not a probability error.',split:'Subtract training means and divide by training SDs. The same saved transformation handles validation and later inputs.',scores:'The query’s signed score describes its side of the separator. It is not a probability or a guarantee of correctness.'},
  'one-r':{votes:'Count the two training labels before using any input. The larger count supplies the majority-class baseline.'},
  pca:{projection:'Project the same centred observations onto a trial line. Wider projected spread corresponds to smaller squared reconstruction gaps.'},
  'hierarchical-clustering':{distances:'Each entry is a distance between two observations. Input units and the selected metric determine what close means.'},
  'random-forest':{
    votes:'Compare tree outputs at the same point, then follow their mean. This classifier averages leaf fractions, rather than taking hard-label majority votes.',
    bootstrap:'Each square counts how often an original training row was drawn for this tree. Zero means that tree omitted it.',
  },
  'data-leakage-pipelines':{means:'Follow training values into the saved mean. Held-out values may be transformed using it, but must not help fit it.'},
  'missing-data-encoding':{means:'Observed training dots teach the fill value. Missing or held-out entries use that saved value rather than teaching it.'},
  'experimental-design':{clusters:'Each roof is a randomized school. Dots beneath it are pupils sharing that assignment and possibly related outcomes.'},
};
const pilots = {
  'simple-linear-regression':[
    'Each dot is one student: hours across, score up. The gold ring selects the student whose calculation you inspect.',
    'The red line is your trial prediction. Slope tilts it; intercept moves it up or down.',
    'Vertical dashes are actual-minus-predicted gaps. The selected student begins with a visible nonzero error.',
    'Each complete tile represents one student’s squared error. Tiles share one scale in the current view; their labelled values add to SSE.',
    'The blue dashed line is the least-squares fit. Its coefficients come from the same observed rows.',
    'Compare your trial line with the fitted line on the same dots. Best means minimum training squared error in this line family.',
    'The gold horizontal line predicts the average for everyone. Compare that baseline with the fitted line and its scorecard.',
    'The vertical guide marks the input being predicted. Compare its location with the original observed range.',
  ],
  kmeans:[
    'Dots are customers, with age across and spending up. Colours will represent proposed groups rather than known labels.',
    'Numbered stars are starting centres. Their choice changes the start of the algorithm, not the customer observations.',
    'The connecting lines compare this customer with the current centres. The calculation uses the selected raw or standardized distance.',
    'Outlined members lead to their hollow mean marker. This worked next-step example does not advance the saved algorithm.',
    'Assign all points, then move their group centres. Back and Next let you compare those two separate phases.',
    'WCSS adds each assigned customer’s squared distance to its centre. First assign the points to obtain those contributions.',
    'Each elbow point is a completed fit at a different K. A bend is evidence to discuss, rather than an automatic group count.',
    'The axes retain age and spending units. The distance selector changes the numerical rule used to compare those same customers.',
    'Compare compact clouds with curved or unusual-point examples. A converged result can still be an unhelpful grouping.',
  ],
  'naive-bayes':[
    'The bars count the training classes before reading any new message’s clues. Their proportions are the starting probabilities.',
    'Each word has a measured state: present, absent or ignored. The spam label is an answer, not an input clue.',
    'The boxes separate fitting, development checking and a sealed final test. This diagram does not report an accuracy score.',
    'The representation determines what one feature value means. This selector illustrates variants; it does not refit the email model.',
    'Each bar is a word’s probability within a class, using the selected smoothing. Compare its denominator with the raw training counts.',
    'Follow the prior and clue factors into each class score. Copying a clue repeats its factor, rather than providing new evidence.',
    'The two scores are not yet probabilities. Divide each by their combined total to obtain probabilities adding to one.',
    'The curves are densities for two separate height groups. At the vertical guide, compare the same measurement against both models.',
    'Log scores use sums rather than tiny products. The normalized coloured shares remain probabilities, not lengths proportional to log scores.',
    'One fold checks while the other four fit. Rotate the checking fold and refit all learned preparation each time.',
    'The cutoff changes whether the same estimated spam probability triggers a flag. It does not retrain word likelihoods.',
    'Trace measured clues into class scores, probability and the saved decision rule. Confidence still needs independent evaluation.',
  ],
  'evaluation-metrics':[
    'Rows show actual outcomes; columns show decisions. Correct alerts, false alerts, misses and correct non-alerts occupy four separate cells.',
    'Highlighted cells form the chosen denominator. Precision uses all alerts; recall uses all actual positives.',
    'Read the same fixed counts across the matrix and fractions. Many negatives can make overall accuracy look strong despite false alerts.',
    'Both curves use the same fixed scored cases. The marked point changes with the cutoff, without changing the scores.',
    'Convert mistakes into stated cost weights and count the review workload. A threshold is a decision choice, not a new fitted model.',
    'The matrix describes this sample. Check whether its class frequency and collection method match the use you want to assess.',
    'This remains a validation display while you explore cutoffs. A final evaluation belongs after the whole procedure is locked.',
    'Each bin compares average predicted probability with observed positives. Its count shows how much evidence supports the comparison.',
    'Use the counts and marked denominator to explain the score. One attractive percentage cannot describe every error or consequence.',
  ],
};
export function visualGuide(slug,index,scene){
  const revision=visualRevision(slug,index);
  if(revision)return revision.guide;
  if(slug==='logistic-regression'){
    if(index===0)return 'Dots show known classes. The blue/red background shows predicted classes at the chosen cutoff. Moving the cutoff changes decisions, not fitted probabilities.';
    if(index===1)return 'The valid band is 0 to 1. The thin red line can leave it; green sigmoid stays inside. The moving blue/red field shows which class the cutoff predicts.';
    if(index===2)return 'The gold point links a raw score with its probability. Blue is below the cutoff; red is at or above it. Slide the cutoff and keep the S-curve fixed.';
    if(index===3)return 'The bars build the same raw score and probability used by the map below. Move the cutoff to change the two-colour field without changing those weighted contributions.';
    if(index===4)return 'Move the probability assigned to the true class. The gold point shows the one-case log-loss penalty, rather than a validation error count.';
  }
  if(slug==='classification-trees'){
    if(index===2)return 'The root contains all training labels. Before any split, its class fraction is the same starting estimate for every query.';
    if(index===3)return 'The top marks show a toy label mixture. The lower Gini curve shows how impurity changes from a pure group to an even mix.';
    if(index===14)return 'Compare the original partition with the partition after one training input changes. Both maps use the same query.';
  }
  if(slug==='random-forest'){
    if(index===3)return 'Each dot compares two trees on the same validation case. The diagonal means agreement; rings mark shared mistakes.';
    if(index===5||index===7)return 'The background shows the forest’s averaged prediction in input space. Marked mistakes show where validation cases still disagree with it.';
  }
  if(slug==='pca'){
    if(scene==='scores')return 'Each dot is the same observation in fitted PC1/PC2 coordinates. The gold ring selects a row. Equal axis scales let you compare spread in the two directions.';
    if(index===5)return 'Both lines are fitted axes, rather than a free trial angle. Square scales preserve their right angle; PC2 captures the remaining sample variance.';
    if(scene==='loadings')return 'The bars are fitted PC1 direction weights, not trial-angle weights. Squared weights add to one; they are not probabilities.';
    if(scene==='reconstruction')return 'Green rings reconstruct the selected input scale from fitted components. Keeping both components makes the coordinate gaps zero.';
  }
  if(slug==='neural-networks'&&[11,12].includes(index))return 'At zero updates, only starting losses exist. Train more updates to build the two curves; validation checks different rows from training.';
  if(slug==='multiple-linear-regression' && index===6)return 'Compare the raw relationship with the adjusted one. The same observations remain after removing another input’s fitted contribution.';
  if(slug==='multiple-linear-regression' && index===8)return 'Each dot is a fitted coefficient estimate. Its horizontal interval describes model-based uncertainty, rather than individual outcome spread.';
  if(slug==='regression-trees' && scene==='fit'){
    if(index===0)return 'Each dot is a training outcome. The plot shows input x₁ across and outcome up; later predictions can use both inputs.';
    if(index===2)return 'Red is your constant prediction; green is the training mean. Compare the vertical errors and their mean squared sizes.';
    if(index===11)return 'Compare a smooth model slice with tree steps at the same fixed x₂. The observations still retain their own x₂ values.';
    if(index===14)return 'Both maps use the same query. Compare the original fit with the fit after one training outcome changes.';
    return 'The highlighted region and branching route describe the same point. Its leaf supplies one saved average outcome.';
  }
  if(slug==='anova') {
    if(index===5) return 'Choose two numbers while fixing the average. The third is forced. Then compare that constraint with the live dataset’s degrees of freedom.';
    if(index===8) return 'The whole bar is total squared spread. Its blue part is spread between group means; η² is that part divided by the whole.';
    if(index===13 || index===14) return 'The four bars separate the two factors, their interaction and within-cell error. All four use the same squared-score units.';
    if(index===15) return 'Inspect the two-setting comparison while considering the data’s assumptions. A clear picture alone cannot establish independent observations.';
  }
  if(slug==='confidence-hypothesis-testing' && scene==='interval' && ![1,8].includes(index)) return 'The dot is an estimate and the line its uncertainty interval. The vertical reference is null effect zero, not a known true value.';
  const guide = pilots[slug]?.[index] || specific[slug]?.[scene] || common[scene];
  if (!guide && slug!=='association-rules') throw Error(`Missing visual guide: ${slug} ${index+1} ${scene}`);
  return guide || '';
}
