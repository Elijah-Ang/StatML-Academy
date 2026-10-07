import { oneRuleFit } from './science.js';
import { fmt, palette } from './ui.js';
import { caption, dot } from './spatial.js';

const majority = rows => rows.length&&rows.filter(r=>r.y===1).length*2>=rows.length?1:0;
const mistakes = (rows,predict) => rows.filter(r=>predict(r)!==r.y).length;
export function oneRFolds(rows,feature='auto') {
  const bins=[[],[],[]];
  for(const label of [0,1])rows.filter(r=>r.y===label).forEach((r,i)=>bins[i%3].push(r));
  return bins.map((hold,i)=>{
    const train=bins.flatMap((group,j)=>j===i?[]:group),fit=oneRuleFit(train,feature);
    return {train,hold,fit,errors:mistakes(hold,fit.predict)};
  });
}
export function teachingStump(rows,key) {
  const values=[...new Set(rows.map(r=>r[key]).filter(Number.isFinite))].sort((a,b)=>a-b);
  const cuts=values.length>1?values.slice(1).map((v,i)=>(values[i]+v)/2):[values[0]??0];
  const fallback=majority(rows);
  return cuts.map(cut=>{
    const left=rows.filter(r=>r[key]<=cut),right=rows.filter(r=>r[key]>cut);
    const labels=[left.length?majority(left):fallback,right.length?majority(right):fallback];
    const predict=r=>!Number.isFinite(r[key])?fallback:labels[+(r[key]>cut)];
    return {cut,labels,predict,errors:mistakes(rows,predict)};
  }).reduce((a,b)=>a.errors<=b.errors?a:b);
}
export function oneRStudy(d,st) {
  const rows=d.split.train,fit=d.fit;
  return {rows,fit,validation:d.split.validation,x:oneRuleFit(rows,'x'),z:oneRuleFit(rows,'z'),automatic:oneRuleFit(rows),folds:oneRFolds(rows,st.feature),stump:teachingStump(rows,fit.key)};
}
const countLabel = rows => [rows.filter(r=>r.y===0).length,rows.filter(r=>r.y===1).length];
const finish=(s,y)=>{s.h=Math.max(310,y+12);s.svg.setAttribute('viewBox',`0 0 ${s.w} ${s.h}`);};
const cap=(s,k,text,y=23,color)=>caption(s,'one-'+k,text,y,color);
function marks(s,P,k,rows,y,predict=null) {
  const columns=Math.max(4,Math.floor((s.w-34)/21));
  rows.forEach((r,i)=>{
    const x=23+(i%columns)*21,yy=y+9+Math.floor(i/columns)*23;
    dot(s,P,'one-'+k+'-'+r.id,x,yy,r.y);
    if(predict&&predict(r)!==r.y)s.circle('one-'+k+'-error-'+r.id,x,yy,8,'none',{stroke:palette[3],'stroke-width':1.6});
  });
  return y+Math.max(1,Math.ceil(rows.length/columns))*23+12;
}
function ruleBounds(fit,i) {
  const [a,b]=fit.cuts.map(v=>fmt(v,2));
  return [ `${fit.key} ≤ ${a}`,`${a} < ${fit.key} ≤ ${b}`,`${fit.key} > ${b}` ][i];
}
function ruler(s,P,k,fit,rows,q,y) {
  y=cap(s,k+'-head',`Saved input ${fit.key}; training-only cuts ${fit.cuts.map(v=>fmt(v,2)).join(', ')}.`,y);
  const values=rows.map(r=>r[fit.key]),v=q[fit.key],lo=Math.min(...values,Number.isFinite(v)?v:0)-.2,hi=Math.max(...values,Number.isFinite(v)?v:0)+.2;
  const x=a=>22+(s.w-44)*(a-lo)/(hi-lo||1),base=y+42;
  const bounds=[lo,...fit.cuts,hi];
  fit.values.forEach((b,i)=>{
    s.rect('one-'+k+'-band-'+i,x(bounds[i]),base-21,Math.max(0,x(bounds[i+1])-x(bounds[i])),40,palette[b.prediction],{opacity:.13,rx:0});
    s.text('one-'+k+'-number-'+i,(x(bounds[i])+x(bounds[i+1]))/2,base+6,String(i+1),{'text-anchor':'middle','font-size':16});
  });
  s.line('one-'+k+'-axis',x(lo),base+23,x(hi),base+23,'#7b8e80',1.2);
  rows.forEach((r,i)=>s.line('one-'+k+'-rug-'+r.id,x(r[fit.key]),base-26-(i%2)*5,x(r[fit.key]),base-17,palette[r.y],1.4));
  fit.cuts.forEach((v,i)=>s.line('one-'+k+'-cut-'+i,x(v),base-26,x(v),base+26,palette[3],1.5,'3 3'));
  if(Number.isFinite(v)) {
    const p=P('one-'+k+'-query',x(v),base+22);s.circle('one-'+k+'-query',...p,5,palette[3]);
    const active=fit.bucket(q);
    s.rect('one-'+k+'-active-band',x(bounds[active]),base-21,Math.max(0,x(bounds[active+1])-x(bounds[active])),40,'none',{stroke:palette[3],'stroke-width':1.8,rx:0});
  }
  y=base+60;
  fit.values.forEach((b,i)=>{const top=y;y=cap(s,k+'-bound-'+i,`${i+1}: ${ruleBounds(fit,i)} → class ${b.prediction}`,y);if(Number.isFinite(v)&&fit.bucket(q)===i)s.line('one-rule-active',s.w-9,top-12,s.w-9,y-8,palette[3],3);});
  y=cap(s,k+'-answer',Number.isFinite(v)?`Query ${fmt(v,2)} → interval ${fit.bucket(q)+1} → class ${fit.predict(q)}`:`Required input ${fit.key} is missing → fallback class ${fit.fallback}`,y+7,palette[3]);
  return y;
}
function newRow(s,k,fit,q,y) {
  y=cap(s,k+'-row',`New row: x = ${fmt(q.x,2)}; z = ${fmt(q.z,2)}`,y);
  y=cap(s,k+'-read',`Saved input: ${fit.key}. Unused input: ${fit.key==='x'?'z':'x'}.`,y+6,palette[0]);
  return y;
}
export function oneRDetails(study,st,q,index) {
  const {rows,fit,x,z,folds,stump}=study,[n0,n1]=countLabel(rows);
  if(index===1)return {metrics:[['Training class 0',n0],['Training class 1',n1],['Baseline mistakes',mistakes(rows,()=>fit.fallback)]],receipt:[['Saved majority label',fit.fallback],['Baseline mistakes',`${mistakes(rows,()=>fit.fallback)} / ${rows.length}`],['Tie rule','An equal count chooses class 1 in this teaching model.']]};
  if(index===9){const val=study.validation,c={tp:0,fn:0,fp:0,tn:0};val.forEach(r=>c[r.y?(fit.predict(r)?'tp':'fn'):(fit.predict(r)?'fp':'tn')]++);return {metrics:[['Validation rows',val.length],['Validation mistakes',c.fp+c.fn],['Correct decisions',c.tp+c.tn]],receipt:[['Correct positives (TP)',c.tp],['Misses (FN)',c.fn],['False alerts (FP)',c.fp],['Correct negatives (TN)',c.tn],['Precision',c.tp+c.fp?`${c.tp}/${c.tp+c.fp}`:'Undefined: no positive predictions'],['Recall',c.tp+c.fn?`${c.tp}/${c.tp+c.fn}`:'Undefined: no actual positives'],['Accuracy',`${c.tp+c.tn}/${val.length}`]]};}
  const base=[['Saved input',fit.key],['Training-only cuts',fit.cuts.map(v=>fmt(v,4)).join(', ')],['Query prediction',fit.predict(q)],['Training mistakes',`${fit.errors} / ${rows.length}`]];
  if(index===3)base.push(['Input x mistakes',x.errors],['Input z mistakes',z.errors],['Selection policy','Lower training error; equal errors choose x. Manual feature choices override selection.']);
  if(index===8){const f=folds[st.oneFold-1];return {metrics:[['Fold fit rows',f.train.length],['Fold holdout rows',f.hold.length],['Fold mistakes',f.errors]],receipt:[['Held-out fold',st.oneFold],['Refitted input',f.fit.key],['Refitted cuts',f.fit.cuts.map(v=>fmt(v,4)).join(', ')],...folds.map((f,i)=>['Fold '+(i+1),`${f.errors}/${f.hold.length} mistakes`]),['Scope','Training-only three-fold illustration. Separate validation and final-test rows are outside this loop.']]};}
  if(index===10)base.push(['Teaching stump split',fmt(stump.cut,4)],['Teaching stump mistakes',stump.errors],['Stump query prediction',stump.predict(q)],['Comparison criterion','Fewest training mistakes on the same input; not CART impurity.']);
  if([5,11].includes(index))base.push(['Input status',st.inputState],['Saved training majority',`${n0} class 0; ${n1} class 1`],['Missing fallback',fit.fallback]);
  return {metrics:[['Training mistakes',fit.errors],['Returned class',fit.predict(q)],['Saved input',fit.key]],receipt:base};
}
export function oneRScene(s,P,study,q,st,index,counts,d) {
  const {rows,fit,x,z,automatic,folds,stump}=study;let y=23;
  if(index===1) {
    const groups=[rows.filter(r=>r.y===0),rows.filter(r=>r.y===1)];
    groups.forEach((group,i)=>{y=cap(s,'baseline-'+i,`Class ${i}: ${group.length} training rows`,y,palette[i]);y=marks(s,P,'baseline-'+i,group,y);});
    y=cap(s,'majority',`Always predict class ${fit.fallback}. Baseline mistakes: ${mistakes(rows,()=>fit.fallback)} / ${rows.length}.`,y+7,palette[3]);
    y=cap(s,'baseline-tie','An equal count chooses class 1 in this teaching model.',y+7);
  } else if(index===2) {
    fit.values.forEach((v,i)=>{
      const group=rows.filter(r=>fit.bucket(r)===i),errors=v.prediction?v.n-v.positive:v.positive;
      y=cap(s,'bin-'+i,`Interval ${i+1}: ${ruleBounds(fit,i)}`,y,palette[0]);
      y=marks(s,P,'bin-'+i,group,y,fit.predict);
      y=cap(s,'bin-count-'+i,`Class 0: ${v.n-v.positive}; class 1: ${v.positive}. Save class ${v.prediction}; mistakes ${errors}.`,y);
      if(!v.n)y=cap(s,'bin-empty-'+i,'Empty interval: use the saved training-majority fallback.',y);
      y+=16;
    });
    y=cap(s,'errors',`Total mistakes: ${fit.values.map(v=>v.prediction?v.n-v.positive:v.positive).join(' + ')} = ${fit.errors}. Gold rings mark mistakes.`,y,palette[3]);
    y=cap(s,'bin-tie','Equal class counts choose class 1; empty groups use the training majority.',y+8);
  } else if(index===3) {
    for(const [i,f] of [x,z].entries()) {
      y=cap(s,'compare-'+i,`Input ${f.key}: ${f.errors} / ${rows.length} mistakes`,y,palette[i]);
      s.rect('one-compare-track-'+i,14,y+4,s.w-28,24,'#e8ebdf');
      const p=P('one-compare-bar-'+i,(s.w-28)*f.errors/rows.length,y+4);
      s.rect('one-compare-bar-'+i,14,y+4,p[0],24,palette[i],{opacity:.7});y+=61;
    }
    y=cap(s,'auto',`Automatic choice: ${automatic.key}. Active choice: ${fit.key}.`,y,palette[3]);
    y=cap(s,'auto-tie','Equal errors choose x. Manual selection overrides that choice.',y+8);
    y=cap(s,'auto-population','Both rules use the same training rows. Validation checks different rows.',y+8);
  } else if(index===8) {
    const fold=folds[st.oneFold-1],hold=new Set(fold.hold.map(r=>r.id));
    y=cap(s,'fold-role',`Fold ${st.oneFold}: fit ${fold.train.length}; check ${fold.hold.length}. Blue fits; red checks.`,y);
    const columns=Math.max(5,Math.floor((s.w-30)/18));
    rows.forEach((r,i)=>s.rect('one-fold-row-'+r.id,16+i%columns*18,y+Math.floor(i/columns)*20,13,13,hold.has(r.id)?palette[1]:palette[0],{opacity:.7}));
    y+=Math.ceil(rows.length/columns)*20+25;
    y=cap(s,'fold-saved',`Refit input ${fold.fit.key}; cuts ${fold.fit.cuts.map(v=>fmt(v,2)).join(', ')}.`,y,palette[0]);
    y=cap(s,'fold-check',`Held-out mistakes: ${fold.errors} / ${fold.hold.length}`,y+8,palette[1]);
    for(const [i,f] of folds.entries())y=cap(s,'fold-score-'+i,`Fold ${i+1}: ${f.errors}/${f.hold.length} mistakes; saved input ${f.fit.key}.`,y+7);
    y=cap(s,'fold-scope','Automatic mode reselects the input inside every fold. Manual mode checks that fixed feature.',y+8);
    y=cap(s,'fold-final','Separate 16-row validation and 16-row final test stay outside these training-only folds.',y+8);
  } else if(index===9) {
    const c=counts,parts=[['Correct positive (TP)',c.tp,r=>r.y&&fit.predict(r)===1,palette[2]],['Missed positive (FN)',c.fn,r=>r.y&&fit.predict(r)===0,palette[3]],['False alert (FP)',c.fp,r=>!r.y&&fit.predict(r)===1,palette[1]],['Correct negative (TN)',c.tn,r=>!r.y&&fit.predict(r)===0,palette[0]]];
    for(const [i,[name,n,filter,color]] of parts.entries()){y=cap(s,'validation-cell-'+i,`${name}: ${n}`,y,color);y=marks(s,P,'validation-'+i,d.split.validation.filter(filter),y);}
    const ratio=(a,b)=>b?fmt(a/b*100,1)+'%':'Undefined';
    y=cap(s,'precision',`Precision: ${c.tp} / (${c.tp} + ${c.fp}) = ${ratio(c.tp,c.tp+c.fp)}`,y);
    y=cap(s,'recall',`Recall: ${c.tp} / (${c.tp} + ${c.fn}) = ${ratio(c.tp,c.tp+c.fn)}`,y+7);
    y=cap(s,'accuracy',`Accuracy: (${c.tp} + ${c.tn}) / ${d.split.validation.length} = ${ratio(c.tp+c.tn,d.split.validation.length)}`,y+7);
    y=cap(s,'validation-scope','These are separate validation rows. Final-test rows stay sealed.',y+7);
  } else if(index===10) {
    y=cap(s,'one-model',`One-R: three saved intervals; ${fit.errors} mistakes.`,y,palette[0]);
    y=ruler(s,P,'compare-one',fit,rows,q,y+5);
    y=cap(s,'stump-model',`Teaching stump: one split; ${stump.errors} mistakes.`,y+20,palette[2]);
    y=cap(s,'stump-left',`${fit.key} ≤ ${fmt(stump.cut,2)} → class ${stump.labels[0]}`,y);
    y=cap(s,'stump-right',`${fit.key} > ${fmt(stump.cut,2)} → class ${stump.labels[1]}`,y);
    const values=rows.map(r=>r[fit.key]),lo=Math.min(...values,q[fit.key])-.2,hi=Math.max(...values,q[fit.key])+.2,xx=v=>22+(s.w-44)*(v-lo)/(hi-lo);
    s.line('one-stump-ruler',xx(lo),y+15,xx(hi),y+15,palette[2],2);
    s.line('one-stump-cut',xx(stump.cut),y,xx(stump.cut),y+28,palette[3],1.5);
    s.circle('one-stump-query',xx(q[fit.key]),y+15,5,palette[3]);y+=55;
    y=cap(s,'stump-answer',`Same input ${fit.key}; same ${rows.length} training rows. Query → One-R class ${fit.predict(q)}; stump class ${stump.predict(q)}.`,y);
    y=cap(s,'stump-criterion','This comparison stump minimizes mistakes; it is not a CART impurity demonstration.',y+8);
  } else {
    y=newRow(s,'new',fit,q,y);
    if([5,11].includes(index)&&st.inputState==='missing') {
      const [n0,n1]=countLabel(rows);
      y=cap(s,'missing-status',`Required input: ${fit.key}. Input status: Missing.`,y+20,palette[3]);
      y=cap(s,'fallback-counts',`Saved training majority: ${n0} class 0; ${n1} class 1.`,y+10);
      y=cap(s,'fallback',`Fallback → class ${fit.fallback}. Missing is not zero. No interval is looked up.`,y+12,palette[fit.fallback]);
    } else y=ruler(s,P,'lookup',fit,rows,q,y+16);
    if(index===5 && st.inputState!=='missing'){const [n0,n1]=countLabel(rows);y=cap(s,'missing-route-preview',`If ${fit.key} is missing: bypass these intervals. Saved counts ${n0} class 0; ${n1} class 1 → fallback class ${fit.fallback}.`,y+14,palette[3]);}
    if(index===4)y=cap(s,'boundary-include','A value exactly on a cut belongs to the interval on its left.',y+8);
    if([0,6].includes(index))y=cap(s,'no-refit','Training rows teach the rule. Moving a query does not refit the model.',y+8);
    if(index===11) {
      y=cap(s,'summary-fit',`Training mistakes: ${fit.errors} / ${rows.length}`,y+12);
      y=cap(s,'summary-validation',`Validation mistakes: ${counts.fp+counts.fn} / ${d.split.validation.length}`,y+7);
      y=cap(s,'summary-fallback',`A missing required input uses class ${fit.fallback}.`,y+7);
    }
  }
  finish(s,y);
}
