"""One-time migration: retain authored prose/math, remove retired controls and decoration."""
from pathlib import Path
from bs4 import BeautifulSoup
import json,re,zipfile
root=Path(__file__).resolve().parents[1]
pilots={'simple-linear-regression','kmeans','naive-bayes','evaluation-metrics'}
runtime={r['slug']:r for r in json.loads((root/'audit-evidence/ux-learning-2026-09-27/runtime-inventory.json').read_text()) if r['width']==1440 and r['slug']!='index'}
plans={};slug=None
for line in (root/'docs/ux-learning-redesign/stage-directives.txt').read_text().splitlines():
 if not line.strip():continue
 if line.startswith('['):slug=line[1:-1];plans[slug]=[]
 else:plans[slug].append([x.strip() for x in line.split('|')])
allowed={'p','strong','em','i','b','sub','sup','ul','ol','li','h3','h4','table','thead','tbody','tr','th','td','details','summary','pre','code','br','math','mrow','mi','mn','mo','msub','msup','mfrac','msqrt','mover','munder','munderover','msubsup','mtable','mtr','mtd','mtext','mspace','semantics'}
result={}
archive=zipfile.ZipFile(root/'audit-evidence/rollout-2026-09-28/before.zip')
for slug,r in runtime.items():
 if slug in pilots:continue
 path=root/'modules'/f'{slug}.html'
 raw=(root/'audit-evidence/rollout-2026-09-28/deep-rendered.snapshot').read_text() if slug=='deep-learning' else archive.read(f'modules/{slug}.html').decode()
 soup=BeautifulSoup(raw,'html.parser');sections=[]
 if slug=='deep-learning':sections=soup.select('.lesson-step')
 else:
  for h in soup.select('h2'):
   s=h.find_parent(lambda e:e.has_attr('data-stage') or any(c in e.get('class',[]) for c in ['step','stage','stage-section','story-section','lesson-step','chapter']))
   if s and s.select_one('h2')==h:sections.append(s)
 assert len(sections)==len(plans[slug]),(slug,len(sections),len(plans[slug]))
 out=[]
 for index,(original,plan,baseline) in enumerate(zip(sections,plans[slug],r['stages'])):
  clone=BeautifulSoup(str(original),'html.parser')
  for e in clone.select('script,style,button,input,select,textarea,canvas,svg,img,.katex-html,annotation,.stage-label,.stage-kicker,.stage-badge,.stage-tag,.statml-rigor-panel,.control-panel,.control-group,.controls,.slider-container'):
   e.decompose()
  for e in clone.select('h2'):e.decompose()
  for el in list(clone.find_all(True)):
   if not el.name:continue
   if el.name not in allowed:el.unwrap()
   else:
    el.attrs={k:v for k,v in el.attrs.items() if k in ['colspan','rowspan','display','mathvariant']}
  notes=str(clone).strip()
  notes=re.sub(r'<(p|h3|h4|details|summary|li)>\s*</\1>','',notes)
  notes=notes.replace('Clean, encode, scale, then split','Split first; fit preprocessing on training data')
  if slug=='anova' and index==5:notes='<p>Degrees of freedom count independent pieces of information after constraints are imposed. Three values with a fixed mean of 10 must sum to 30. If the first two are 8 and 15, the third is forced to be 7. For k groups and N observations, between-group df = k − 1 and within-group df = N − k. Dividing sums of squares by their appropriate df produces mean squares on a comparable variance scale.</p>'
  if slug=='imbalanced-classification' and index==2:notes='<p>In 10,000 people with 1% prevalence, 100 are positive and 9,900 are negative. At sensitivity 90% and specificity 95%, TP = 90, FN = 10, FP = 495, TN = 9,405. There are 585 alerts and precision is 90/585 = 15.4%. The large negative population explains why a small false-positive rate can still generate a large review workload.</p>'
  if slug=='qda' and index==8:notes='<p>A class covariance can be unstable or singular when there are few observations relative to features. Adding a small positive multiple of the identity improves invertibility but does not make unequal class covariances equal. Shrinking every class covariance toward the same pooled covariance creates a path toward LDA. The lab uses pooled shrinkage and a small numerical diagonal floor; the two interventions have different roles. Select the amount with validation, not the final test.</p>'
  out.append({'title':baseline['title'],'question':plan[0],'miniPlan':plan[1],'interactionPlan':plan[2],'reference':notes,'legacyId':original.get('id'),'originalIndex':index+1})
 result[slug]={'stages':out,'title':soup.title.get_text().split(' | ')[0].split(' · ')[0] if soup.title else slug}
(root/'lessons/expanded/reference.json').write_text(json.dumps(result,indent=2,ensure_ascii=False))
print('Extracted',len(result),'modules,',sum(len(x['stages']) for x in result.values()),'stages with retained reference notes.')
