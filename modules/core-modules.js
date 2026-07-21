(()=>{
  const modules=[{"slug":"anova","title":"ANOVA","path":"modules/anova.html"},{"slug":"correlation","title":"Correlation","path":"modules/correlation.html"},{"slug":"chi-square","title":"Chi-Square Test","path":"modules/chi-square.html"},{"slug":"time-series-analysis","title":"Time Series Analysis","path":"modules/time-series-analysis.html"},{"slug":"simple-linear-regression","title":"Simple Linear Regression","path":"modules/simple-linear-regression.html"},{"slug":"multiple-linear-regression","title":"Multiple Linear Regression","path":"modules/multiple-linear-regression.html"},{"slug":"polynomial-regression","title":"Polynomial Regression","path":"modules/polynomial-regression.html"},{"slug":"regression-trees","title":"Regression Trees","path":"modules/regression-trees.html"},{"slug":"logistic-regression","title":"Logistic Regression","path":"modules/logistic-regression.html"},{"slug":"knn","title":"K-Nearest Neighbors (KNN)","path":"modules/knn.html"},{"slug":"lda","title":"Linear Discriminant Analysis","path":"modules/lda.html"},{"slug":"qda","title":"Quadratic Discriminant Analysis","path":"modules/qda.html"},{"slug":"classification-trees","title":"Classification Trees","path":"modules/classification-trees.html"},{"slug":"support-vector-machine","title":"Support Vector Machines","path":"modules/support-vector-machine.html"},{"slug":"one-r","title":"One-R","path":"modules/one-r.html"},{"slug":"naive-bayes","title":"Naive Bayes","path":"modules/naive-bayes.html"},{"slug":"kmeans","title":"K-Means Clustering","path":"modules/kmeans.html"},{"slug":"hierarchical-clustering","title":"Hierarchical Clustering","path":"modules/hierarchical-clustering.html"},{"slug":"pca","title":"Principal Component Analysis (PCA)","path":"modules/pca.html"},{"slug":"bias-variance","title":"Bias-Variance Trade-Off & Resampling Methods","path":"modules/bias-variance.html"},{"slug":"model-selection","title":"Model Selection & Regularization","path":"modules/model-selection.html"}];
  globalThis.STATML_CORE_MODULES=Object.freeze(modules.map(Object.freeze));
  const slug=location.pathname.split('/').pop()?.replace(/\.html$/,'');
  const index=modules.findIndex(module=>module.slug===slug);
  if(index<0)return;
  const nav=document.querySelector('.statml-site-nav');
  if(!nav)return;
  const previous=modules[index-1],next=modules[index+1];
  const links=document.createElement('span');
  links.className='statml-core-sequence';
  links.style.cssText='display:flex;gap:.55rem;margin-left:auto;font-size:.78rem;white-space:nowrap';
  if(previous)links.insertAdjacentHTML('beforeend',`<a href="${previous.slug}.html" title="Previous module: ${previous.title}" aria-label="Previous module: ${previous.title}">←</a>`);
  if(next)links.insertAdjacentHTML('beforeend',`<a href="${next.slug}.html" title="Next module: ${next.title}" aria-label="Next module: ${next.title}">→</a>`);
  const meta=nav.querySelector('.statml-nav-meta');
  nav.insertBefore(links,meta);
})();
