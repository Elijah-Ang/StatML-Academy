"""Independent NumPy/SciPy reference values, stored so Node tests need no Python."""
import json
from pathlib import Path
import numpy as np
from scipy import stats
from scipy.cluster.hierarchy import linkage
from sklearn.svm import SVC
root=Path(__file__).resolve().parents[1]
points=np.array([[-1.9,-1.2],[-1.5,-.7],[-.9,-.9],[-.3,.3],[.2,.1],[.6,.8],[1.2,.9],[1.8,1.7]])
groups=[[2,4,5,7],[5,6,8,9],[9,10,12,13]]
cells=np.array([[30,10],[30,30]])
classification=np.array([[-2,-1],[-1,-2],[-1,-.2],[-.2,-1],[.3,.7],[1,.2],[1,2],[2,1]])
labels=[0,0,0,0,1,1,1,1]
result={
 "provenance":"Generated with NumPy eigvalsh/cov and SciPy stats/linkage, scikit-learn SVC. See generate-science-fixtures.py.",
 "f":[[f,a,b,float(stats.f.sf(f,a,b))] for f,a,b in [(0,2,27),(1,2,21),(6,2,27),(40,4,50)]],
 "t":[[t,df,float(2*stats.t.sf(abs(t),df))] for t,df in [(0,10),(2.5,28),(-3,7),(12,100)]],
 "chi":[[x,df,float(stats.chi2.sf(x,df))] for x,df in [(0,1),(3.84,1),(10,4),(80,20)]],
 "normal":[[x,float(stats.norm.cdf(x))] for x in [-6,-2,0,1.96,4]],
 "pca":{"points":points.tolist(),"eigenvalues":np.linalg.eigvalsh(np.cov(points.T))[::-1].tolist()},
 "hierarchical":{kind:linkage(points,method=kind)[:,2].tolist() for kind in ['single','complete','average','ward']},
 "anova":{"groups":groups,"F":float(stats.f_oneway(*groups).statistic),"p":float(stats.f_oneway(*groups).pvalue)},
 "contingency":{"cells":cells.flatten().tolist(),"stat":float(stats.chi2_contingency(cells,correction=False).statistic),"p":float(stats.chi2_contingency(cells,correction=False).pvalue)},
 "svm":{"points":classification.tolist(),"labels":labels,"linear":SVC(C=1,kernel='linear',tol=1e-10).fit(classification,labels).decision_function(classification).tolist(),"rbf":SVC(C=1,kernel='rbf',gamma=.8,tol=1e-10).fit(classification,labels).decision_function(classification).tolist()}
}
(root/'lessons/expanded/science-fixtures.json').write_text(json.dumps(result,indent=2)+'\n')
