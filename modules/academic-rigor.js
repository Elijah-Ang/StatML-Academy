/* StatML Academy shared statistical-integrity layer. */
(() => {
  const slug = location.pathname.split('/').pop().replace('.html', '');
  const panels = {
    'simple-linear-regression': {
      title: 'Model diagnostics and honest interpretation',
      items: [
        '<strong>Interpretation.</strong> The slope is the estimated change in the outcome (in its units) for a one-unit increase in the predictor. The intercept is the estimated outcome at X = 0 and may be meaningless when zero is outside the observed range.',
        '<strong>Trust checks.</strong> Inspect residuals versus fitted values for functional form and constant variance, a Q–Q plot when classical inference needs residual normality, and leverage/Cook’s distance for influential cases. Independence comes from the study design, not a residual plot.',
        '<strong>Uncertainty.</strong> Report coefficient confidence intervals and residual standard error. A confidence interval describes uncertainty in the estimated mean response; a wider prediction interval describes uncertainty for one new observation.',
        '<strong>Limits.</strong> Correlation is symmetric while regression predicts Y from X. R² measures in-sample variation explained, not correctness, causality, or future usefulness. Avoid extrapolation and repeat the analysis with influential points investigated.'
      ]
    },
    'multiple-linear-regression': {
      title: 'Association, diagnostics, and model structure',
      items: [
        '<strong>Interpret coefficients carefully.</strong> Say “the estimated association between X and Y, holding the included predictors constant.” This is not automatically a causal effect.',
        '<strong>Confounding.</strong> Add a plausible confounder and compare coefficients: a substantial change signals omitted-variable bias in the smaller model. Correlated predictors can inflate standard errors and make signs unstable; inspect VIFs and uncertainty intervals.',
        '<strong>Structure.</strong> Encode categorical predictors with documented reference levels, test scientifically motivated interactions, and model nonlinear relationships rather than forcing a plane.',
        '<strong>Diagnostics.</strong> Check residual–fitted, Q–Q, scale–location, leverage and influence plots. Report coefficient intervals, residual error, validation performance, and both confidence and prediction intervals.'
      ]
    },
    'polynomial-regression': {
      title: 'Select degree without touching the test set',
      warning: true,
      items: [
        '<strong>Workflow.</strong> Fit candidate degrees on training folds; compare validation or cross-validation error; lock the degree and preprocessing; refit using the chosen setup; evaluate once on the untouched test set.',
        '<strong>Form.</strong> Polynomial regression is nonlinear in x but linear in its coefficients. Retain lower-order terms when using higher-order terms.',
        '<strong>Stability.</strong> High-degree curves can oscillate near boundaries and are dangerous for extrapolation. Centring/scaling and orthogonal polynomial bases can improve numerical stability.',
        '<strong>Diagnostics.</strong> Inspect residual form, unequal variance, influential cases and uncertainty bands; report the distribution of validation errors, not only the best mean.'
      ]
    },
    'classification-trees': {
      title: 'Validation, pruning, and implementation details', warning: true,
      items: [
        '<strong>Depth selection.</strong> Tune depth and pruning on validation data or within cross-validation. Only after locking the tree, report final test accuracy once.',
        '<strong>Impurity.</strong> Gini impurity 0.5 is the maximum only for a balanced binary node. An unrestricted tree does not necessarily achieve zero training error when observations conflict or constraints remain.',
        '<strong>Categories.</strong> Trees can conceptually split categories, but software differs: some libraries require encoded inputs while others support categorical splits natively.',
        '<strong>Uncertainty.</strong> Report confusion-matrix metrics with intervals or resampling distributions, and examine tree stability across samples.'
      ]
    },
    'logistic-regression': {
      title: 'Optimisation, calibration, and decisions', warning: true,
      items: [
        '<strong>Fitting.</strong> Gradient descent is one of several solvers. Scaling often helps numerical optimisation and matters especially with regularisation; fit the scaler inside each training fold.',
        '<strong>Probabilities are not decisions.</strong> Accuracy and probability quality differ. Assess calibration plots, Brier score and log loss as well as discrimination.',
        '<strong>Thresholds.</strong> 0.5 is only one cutoff. Choose a threshold on validation data using error costs, prevalence and the objective; examine precision–recall curves and class weighting when imbalance matters.',
        '<strong>Final evaluation.</strong> Lock features, regularisation, calibration and threshold before evaluating the test set.'
      ]
    },
    knn: {
      title: 'Distance, ties, and leakage safeguards', warning: true,
      items: [
        '<strong>Scaling.</strong> Scaling is usually necessary when features have different units or magnitudes because distance is scale-sensitive. Fit scaling and imputation on training data only.',
        '<strong>Ties.</strong> Odd K prevents equal vote counts only in binary classification. Multiclass ties can remain; software tie rules and distance weighting can change predictions.',
        '<strong>Failure modes.</strong> KNN deteriorates in high dimensions, is sensitive to irrelevant features, and needs an explicit missing-value strategy.',
        '<strong>Selection.</strong> Choose K, distance and weighting with validation or cross-validation, then use the untouched test set once.'
      ]
    },
    pca: {
      title: 'Variance is not automatically information', warning: true,
      items: [
        '<strong>Meaning.</strong> Say “the components explain X% of the sample variance,” not “preserve X% of the information.” PCA is unsupervised and ignores the target; low-variance directions can still be scientifically or predictively important.',
        '<strong>Noise.</strong> Removing low-variance components may reduce noise when noise mainly occupies those directions, but this is not guaranteed. Components can also be difficult to interpret.',
        '<strong>Scaling.</strong> Standardise when units differ or raw scale should not control the components (for example, centimetres versus dollars). With identical units and meaningful variance differences, standardisation may be undesirable.',
        '<strong>Leakage.</strong> Fit scaling and PCA only on training data and repeat both transformations inside every cross-validation fold.'
      ]
    },
    'model-selection': {
      title: 'High dimensions, stable selection, and valid resampling', warning: true,
      items: [
        '<strong>When p &gt; n.</strong> Ordinary least squares lacks a unique coefficient solution unless constraints are imposed because the design is rank deficient. Prediction may still be possible; Ridge and Lasso provide constrained solutions.',
        '<strong>Lasso.</strong> It supports sparse prediction and variable selection, but selections are not automatically causal or uniquely important. With correlated predictors, small sample changes may swap which predictor is selected. Elastic Net often shares signal more stably.',
        '<strong>Choose resampling by structure.</strong> Use stratified CV for imbalanced classes, grouped CV for repeated subjects or organisations, time-series CV for ordered data, repeated CV for stability, and nested CV when model selection and unbiased evaluation must both occur.',
        '<strong>Pipeline rule.</strong> Imputation, scaling, encoding, feature selection, PCA, outlier rules, oversampling and threshold tuning must be learned inside training folds.'
      ]
    },
    correlation: {
      title: 'Uncertainty and what correlation tests mean',
      items: [
        '<strong>Parameter versus estimate.</strong> ρ is the population correlation; r is its sample estimate. Report r with a confidence interval and sample size. Equal r values can have very different uncertainty when n differs.',
        '<strong>Test.</strong> H₀: ρ = 0. A small p-value means the observed result would be unusual under the null, assuming the model assumptions hold; it is not the probability the null is true or that chance “caused” the result.',
        '<strong>Pearson versus Spearman.</strong> Pearson measures linear association; Spearman measures monotonic rank association. Spearman is not simply an outlier-proof Pearson, and neither fixes confounding, dependence or a non-monotonic relationship.',
        '<strong>Design cautions.</strong> Examine restriction of range, extreme observations and non-independent repeated pairs. Discuss the magnitude and practical relevance, not significance alone.'
      ]
    },
    anova: {
      title: 'Choose the test and report magnitude',
      items: [
        '<strong>Interpretation.</strong> A small p-value means the observed F statistic would be unusual under the null, assuming the model assumptions hold. It is not the probability the null is true, proof of causality, or a measure of importance.',
        '<strong>Decision guide.</strong> Use ordinary one-way ANOVA for similar variances; Welch ANOVA for unequal variances; Kruskal–Wallis or a robust alternative for strong non-normality or ordinal outcomes; and repeated-measures or mixed models for repeated observations.',
        '<strong>After the omnibus test.</strong> Use planned contrasts or multiplicity-corrected post-hoc comparisons. Report group estimates and confidence intervals plus an effect size.',
        '<strong>Effect sizes differ.</strong> Eta-squared is total variance attributed to a term; partial eta-squared conditions on other terms; omega-squared adjusts bias; regression R² describes the full model. Name the quantity used and discuss practical significance.'
      ]
    },
    'chi-square': {
      title: 'Evidence, effect size, and cell diagnostics',
      items: [
        '<strong>Conclusion.</strong> Say “the data provide evidence against independence under the assumptions of the chi-square test,” not that variables are definitely related.',
        '<strong>Conditions.</strong> Check expected counts and use Fisher’s exact test or an appropriate exact/Monte Carlo method for sparse small tables.',
        '<strong>Magnitude and location.</strong> Report Cramér’s V with uncertainty where feasible. Inspect standardised or adjusted residuals to learn which cells drive the omnibus statistic.',
        '<strong>Multiplicity.</strong> Examining many cells creates multiple comparisons; use a correction or label the inspection exploratory. Association does not establish causality.'
      ]
    },
    'time-series-analysis': {
      title: 'Time-aware validation and residual dependence', warning: true,
      items: [
        '<strong>Never shuffle time.</strong> Use a chronological holdout, expanding-window or rolling-window evaluation. Specify one-step or multi-step forecasting because the tasks differ.',
        '<strong>Baselines.</strong> Compare against naïve, seasonal-naïve, drift and moving-average forecasts before calling a complex model useful.',
        '<strong>Dependence checks.</strong> ACF bars outside approximate bounds suggest autocorrelation, but interpret the pattern collectively and in model context. Compare ACF with PACF, inspect residual ACF and use a Ljung–Box test.',
        '<strong>Cautions.</strong> Non-stationarity and seasonality can create misleading ACF patterns; multiple lag inspection is not a collection of independent 5% tests.'
      ]
    },
    kmeans: {
      title: 'Operational safeguards for K-means',
      items: [
        '<strong>Fit robustly.</strong> Use k-means++ initialisation and multiple random restarts; document the seed and handle empty clusters explicitly.',
        '<strong>K is not revealed.</strong> The elbow is a heuristic and may be ambiguous or absent. Combine it with silhouette scores, domain usefulness and stability under resampling.',
        '<strong>Failure modes.</strong> Results are sensitive to scaling, initialisation, outliers and non-spherical clusters. Check whether solutions persist across starts and samples.',
        '<strong>Alternatives.</strong> Compare Gaussian mixtures for probabilistic elliptical clusters and density-based methods for irregular shapes or noise.'
      ]
    },
    'hierarchical-clustering': {
      title: 'Linkage geometry and stability',
      items: [
        '<strong>Ward linkage.</strong> Ward’s criterion is tied to Euclidean geometry and minimising within-cluster variance; linkage and distance choices are not freely interchangeable.',
        '<strong>Shape biases.</strong> Single linkage can chain; complete linkage favours compact groups; average linkage is a compromise.',
        '<strong>Read heights carefully.</strong> Dendrogram height does not represent the same quantity under every linkage method.',
        '<strong>Robustness.</strong> Scaling can change the tree dramatically. Compare reasonable preprocessing choices and assess cluster stability under resampling.'
      ]
    },
    qda: {
      title: 'Regularisation targets and covariance volume',
      items: [
        '<strong>Shrinkage is specific.</strong> A class covariance can shrink toward a diagonal matrix, an identity matrix, or a shared pooled covariance. Only shrinkage toward the shared covariance moves QDA directly toward LDA.',
        '<strong>Geometry.</strong> The determinant is a covariance-volume scaling factor; √|Σ| corresponds more closely to geometric volume.',
        '<strong>Validation.</strong> Choose shrinkage within cross-validation and evaluate the locked classifier on the untouched test set.',
        '<strong>Data demand.</strong> Separate covariance matrices become unstable with small classes or many features; report regularisation and uncertainty.'
      ]
    },
    'bias-variance': {
      title: 'Where the exact decomposition applies',
      items: [
        '<strong>Conditions.</strong> The familiar exact decomposition applies most directly to squared-error prediction at a fixed input, across repeated training samples, with an irreducible-noise model.',
        '<strong>Classification.</strong> Bias and variance remain useful concepts, but the same squared-error algebra does not automatically apply to classification loss.',
        '<strong>Uncertainty.</strong> Show fold or repeat distributions, not only mean error. Ask whether the conclusion changes under another reasonable sample.',
        '<strong>Nested evaluation.</strong> When resampling chooses a model, use a separate outer loop or final untouched test set for an unbiased performance estimate.'
      ]
    }
  };

  const replacements = [
    [/test error used to select degree/gi, 'validation error used to select degree'],
    [/compare training and test error/gi, 'compare training and validation error'],
    [/best depth based on test accuracy/gi, 'best depth based on validation accuracy'],
    [/the result is likely real/gi, 'the result is unusual under the null model'],
    [/variables are definitely related/gi, 'the data provide evidence against independence'],
    [/preserve(?:s|d)? (\d+)% of the information/gi, 'explain $1% of the sample variance'],
    [/always standardi[sz]e before PCA/gi, 'standardise before PCA when units differ or scale should not dominate'],
    [/the model is completely lost/gi, 'ordinary least squares has no unique coefficient solution'],
    [/feature scaling is essential/gi, 'feature scaling is usually necessary when units or magnitudes differ']
  ];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) { return /^(SCRIPT|STYLE|TEXTAREA)$/.test(node.parentElement?.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
  });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => replacements.forEach(([from, to]) => { node.nodeValue = node.nodeValue.replace(from, to); }));

  const applicable = new Set(['polynomial-regression','classification-trees','logistic-regression','knn','pca','model-selection','support-vector-machine','regression-trees','qda','lda']);
  const stages = [...document.querySelectorAll('[data-stage]')].filter(el => Number(el.dataset.stage) > 0);
  const target = stages.at(-1) || document.querySelector('main') || document.body;
  if (applicable.has(slug)) {
    const warning = document.createElement('aside');
    warning.className = 'statml-integrity-warning';
    warning.innerHTML = '<strong>Untouched-test rule</strong><span>The test set must remain untouched until all model and preprocessing choices are final.</span>';
    target.prepend(warning);
  }
  const panel = panels[slug];
  if (panel) {
    const section = document.createElement('section');
    section.className = 'statml-rigor-panel';
    section.setAttribute('aria-label', panel.title);
    section.innerHTML = `<p class="statml-rigor-kicker">Assumptions · failure modes · reporting</p><h3>${panel.title}</h3><div class="statml-rigor-grid">${panel.items.map(x => `<p>${x}</p>`).join('')}</div>`;
    target.append(section);
  }
})();
