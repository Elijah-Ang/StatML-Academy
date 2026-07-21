import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

export const CORE_MODULES = [
  ['anova','ANOVA'],
  ['correlation','Correlation'],
  ['chi-square','Chi-Square Test'],
  ['time-series-analysis','Time Series Analysis'],
  ['simple-linear-regression','Simple Linear Regression'],
  ['multiple-linear-regression','Multiple Linear Regression'],
  ['polynomial-regression','Polynomial Regression'],
  ['regression-trees','Regression Trees'],
  ['logistic-regression','Logistic Regression'],
  ['knn','K-Nearest Neighbors (KNN)'],
  ['lda','Linear Discriminant Analysis'],
  ['qda','Quadratic Discriminant Analysis'],
  ['classification-trees','Classification Trees'],
  ['support-vector-machine','Support Vector Machines'],
  ['one-r','One-R'],
  ['naive-bayes','Naive Bayes'],
  ['kmeans','K-Means Clustering'],
  ['hierarchical-clustering','Hierarchical Clustering'],
  ['pca','Principal Component Analysis (PCA)'],
  ['bias-variance','Bias-Variance Trade-Off & Resampling Methods'],
  ['model-selection','Model Selection & Regularization']
].map(([slug,title])=>({slug,title,path:`modules/${slug}.html`}));

const root=resolve(import.meta.dirname,'..');
const total=CORE_MODULES.length;
for(const [index,module] of CORE_MODULES.entries()){
  const file=join(root,module.path);
  const html=await readFile(file,'utf8');
  const label=`module ${String(index+1).padStart(2,'0')}/${total}`;
  let updated=html.replace(/(<span class="statml-nav-meta">)[^<]*(<\/span>)/,`$1${label}$2`);
  if(!updated.includes('core-modules.js'))updated=updated.replace('<script src="academic-rigor.js"></script>','<script src="core-modules.js"></script>\n<script src="academic-rigor.js"></script>');
  if(updated===html && !html.includes(label))throw new Error(`${module.path}: cannot generate module navigation metadata`);
  await writeFile(file,updated);
}

const browserInventory=`(()=>{\n  const modules=${JSON.stringify(CORE_MODULES)};\n  globalThis.STATML_CORE_MODULES=Object.freeze(modules.map(Object.freeze));\n  const slug=location.pathname.split('/').pop()?.replace(/\\.html$/,'');\n  const index=modules.findIndex(module=>module.slug===slug);\n  if(index<0)return;\n  const nav=document.querySelector('.statml-site-nav');\n  if(!nav)return;\n  const previous=modules[index-1],next=modules[index+1];\n  const links=document.createElement('span');\n  links.className='statml-core-sequence';\n  links.style.cssText='display:flex;gap:.55rem;margin-left:auto;font-size:.78rem;white-space:nowrap';\n  if(previous)links.insertAdjacentHTML('beforeend',\`<a href="\${previous.slug}.html" title="Previous module: \${previous.title}" aria-label="Previous module: \${previous.title}">←</a>\`);\n  if(next)links.insertAdjacentHTML('beforeend',\`<a href="\${next.slug}.html" title="Next module: \${next.title}" aria-label="Next module: \${next.title}">→</a>\`);\n  const meta=nav.querySelector('.statml-nav-meta');\n  nav.insertBefore(links,meta);\n})();\n`;
await writeFile(join(root,'modules','core-modules.js'),browserInventory);
