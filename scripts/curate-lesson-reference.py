"""Remove retired UI instructions and correct overclaims in the migration reference."""
from pathlib import Path
import json,re
from bs4 import BeautifulSoup,Comment,NavigableString
root=Path(__file__).resolve().parents[1]
path=root/'lessons/expanded/reference.json'
data=json.loads(path.read_text())
overrides={
('bias-variance',4):"""At a fixed input x, assume Y = f(x) + ε with zero-mean noise independent of the training sample. Under squared loss, expected prediction error equals squared bias of the fitted prediction plus its variance across training samples plus the noise variance. Expectations refer to repeated training samples and a new outcome, not the residuals of one fitted dataset. Greater flexibility can change bias and variance, but neither the decomposition nor a neat U-shaped validation curve is a universal law for every learning problem or loss.""",
('bias-variance',9):"""Leave-one-out cross-validation fits n models, each withholding one of n observations, and averages the n held-out losses. Nearly all observations are available to every fit, but the fitted models overlap heavily. Its bias and variability depend on the learning procedure and the population; it is not uniformly better or worse than K-fold validation. Computational cost can be high, although some linear-model calculations have efficient shortcuts. The live fold selector illustrates five development folds; this paragraph explains the distinct leave-one-out procedure.""",
('bias-variance',11):"""A validation split is simple but its estimate can depend strongly on the allocation of a small dataset. K-fold cross-validation spreads held-out evaluation across the development observations. Leave-one-out uses the largest possible training fraction in each fold but can be computationally demanding or variable. Bootstrap resampling draws with replacement and supports many uncertainty procedures under suitable assumptions. These methods do not automatically handle temporal, spatial, or grouped dependence: the resampling unit must reflect the data-generating and deployment process.""",
('gradient-boosting',3):"""Start with the training mean, for example F₀ = 10. If three fitted learners return 4, −1, and 2 for the same row, a learning rate of 0.2 gives F₃ = 10 + 0.2(4 − 1 + 2) = 11. Each learner was fitted to the loss gradient created by the preceding model, so changing the learning rate generally requires refitting the entire sequence. The live experiment uses actual residual trees and measured training and validation MSE; no universal best learning rate or stopping round is assumed.""",
('model-selection',6):"""Ridge minimizes squared-error fit plus a squared coefficient penalty. In this notebook the objective is mean squared error divided by two plus λ times the sum of squared non-intercept coefficients divided by two. The intercept is unpenalized. Larger λ discourages large weights and can stabilize an ill-conditioned design. Ridge generally does not create sparse solutions, although a coefficient can equal zero in special cases. Penalty strength depends on feature units, so scaling is part of the modeling choice and must be learned inside training folds.""",
('model-selection',11):"""Model selection uses information even when a human, rather than a fitting algorithm, makes the decision. Repeatedly choosing settings after inspecting the same held-out scores can overfit that evaluation set. Separate parameter fitting, development selection, and final evaluation. Use cross-validation or an appropriate group/time validation design for development; an outer evaluation loop can estimate the performance of the whole selection procedure. Report uncertainty and the number and type of choices considered.""",
('polynomial-regression',8):"""Before final evaluation, freeze the feature preparation, polynomial degree, regularization, fitting or refitting rule, and evaluation metric. Validation provides evidence about those choices; it does not prove future reliability. Evaluate the locked procedure on independent observations representative of its use. Extrapolation, distribution shift, and limited sample size remain concerns. Revising the model after a final-test result requires fresh evidence or an explicit exploratory interpretation.""",
('pca',1):"""PCA uses numerical inputs without a target label to estimate directions of variation. The live example contains eight observations and two features so every coordinate can be inspected. For centered matrix X, sample covariance is XᵀX/(n − 1). Its eigenvectors define orthogonal loading directions and its eigenvalues give variances of the corresponding component scores. Higher-dimensional PCA follows the same idea; a two-dimensional drawing cannot show every feature or component of such a model.""",
('knn',8):"""For uniform binary voting with an odd K, equal class counts cannot occur. Distance-weighted votes can still tie, even with an odd K; multiclass voting can also tie. Define a reproducible rule for both tied neighbor distances and tied class votes. A class fraction among selected neighbors is a local empirical estimate, not a guaranteed calibrated probability. Inverse-distance weighting must handle zero distance explicitly; this notebook uses the labels of exact matches directly.""",
('neural-networks',18):"""The live network has two inputs, three hidden units, and one sigmoid output. For hidden unit j, zⱼ = wⱼ₁x₁ + wⱼ₂x₂ + bⱼ and aⱼ = g(zⱼ). The output logit is u = Σvⱼaⱼ + b and the probability is σ(u). A binary label is produced only after choosing a threshold. For binary cross-entropy, the derivative with respect to u is p − y. The learning demonstration averages gradients over training rows; the inspectable input sliders do not change the training dataset.""",
('time-series-analysis',6):"""Lag k compares observations k time units apart. The displayed sample autocorrelation uses a common normalization: sum of (yₜ − mean)(yₜ₋ₖ − mean), divided by the sum of squared centered values across the full series. Its interpretation depends on trend, seasonality, sample size, and the fitted model. Approximate significance bands are not displayed here; a sequence of sample correlations should not be interpreted as independent causal tests. The lag view shows the actual paired values used for the selected gap.""",
('experimental-design',5):"""For equal cluster sizes m and intraclass correlation ρ, the approximation DE = 1 + (m − 1)ρ describes inflation in variance relative to simple independent sampling under its assumptions. Effective n = n/DE is a rough information comparison. It is not a complete power calculation: power also depends on the number of clusters, allocation, effect and outcome variance, analysis model, unequal sizes, attrition, and multiplicity. The live example reports design effect and approximate effective sample size only."""
}
ui=re.compile(r'(?i)(?:notice on the right|click\b|tap and drag|hover\b|canvas|dashboard|weights overlay|control panel|redraw split|run one learning|use the buttons|use the slider|slide the slider|set threshold|at current threshold|regularization control|dropout rate during training|live visual simulation|interactive (?:confusion|demo|test your|slider))')
for slug,module in data.items():
 for i,stage in enumerate(module['stages'],1):
  if (slug,i) in overrides:
   stage['reference']='<p>'+overrides[slug,i]+'</p>'
   continue
  soup=BeautifulSoup(stage['reference'],'html.parser')
  for comment in soup.find_all(string=lambda s:isinstance(s,Comment)):comment.extract()
  for tag in list(soup.find_all(['p','li','h3','h4','summary'])):
   if tag.name and ui.search(tag.get_text(' ',strip=True)):
    # Remove the legacy instruction block; the new static and live receipts replace it.
    tag.decompose()
  for text in list(soup.find_all(string=True)):
   if not text.parent or text.parent.name in ['math','mi','mo','mn','mtext','mrow','code','pre']:continue
   value=str(text)
   if ui.search(value):text.replace_with('')
  for table in list(soup.find_all('table')):
   # Discard unfilled dynamic matrix/report scaffolds, keeping numerical reference tables.
   if len(table.get_text(' ',strip=True))<15:table.decompose()
  # Orphan labels and empty dynamic values are the residue of retired controls.
  top=[]
  for node in list(soup.contents):
   if isinstance(node,NavigableString):
    text=re.sub(r'\s+',' ',str(node)).strip()
    text=re.sub(r'^(?:Stage\s*)?\d{1,2}\s*','',text)
    if not text or len(text)<30 or re.fullmatch(r'[\W\d]+',text):continue
    if re.search(r'(?i)(resulting clusters|PC1 Variance|PC2 Leftover|toy pass|threshold0|answer and explanation|teaching interaction|within-group spread|group differences)',text):continue
    p=soup.new_tag('p');p.string=text;top.append(str(p))
   else:
    if not node.get_text(' ',strip=True) and not node.find('math'):continue
    top.append(str(node))
  notes='\n'.join(top)
  replacements={
   'the black lines':'the group-mean markers',
   'black line':'group mean',
   'Lower RSS is always better.':'Lower training RSS means a closer training fit, not necessarily better prediction.',
   'they never reach exactly zero':'they usually remain nonzero',
   'which invalidates our p-value':'which can make the approximation unreliable',
   'best chance to learn perfectly':'a large training sample',
   'This is why we always read the interaction row first.':'This is why interactions should be considered before summarizing main effects.',
   'We only deploy a model after validation proves it works.':'Deployment requires suitable validation evidence and continued monitoring.',
   'squared residuals across all 3 dimensions simultaneously':'squared outcome residuals at the observed input combinations',
   'settles perfectly into the optimal fit':'finds the least-squares fit under the model',
   'genuinely':'actually'
  }
  for a,b in replacements.items():notes=notes.replace(a,b)
  if (slug,i) in [('knn',10),('lda',11),('qda',7)]:notes=re.sub(r'\btest\b','validation',notes,flags=re.I)
  stage['reference']=notes
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Curated retained notes: removed retired UI scaffolds and corrected method-specific overclaims.')
