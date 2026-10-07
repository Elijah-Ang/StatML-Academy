import assert from 'node:assert/strict';
import {illustrativeCounts} from '../modules/notebook/decision-counts.js';
import {oneRFolds,teachingStump,oneRStudy,oneRDetails} from '../modules/notebook/one-r-scenes.js';
import {oneRuleFit,classificationData,splitRows} from '../modules/notebook/science.js';
import {visualRevisions} from '../modules/notebook/visual-revisions.js';
assert.equal(visualRevisions.length,43);
assert.equal(new Set(visualRevisions.map(r=>r.slug+':'+r.section)).size,43);
for(const scenario of ['clouds','rings','unequal'])for(const feature of ['auto','x','z']) {
 const split=splitRows(classificationData(42,scenario)),folds=oneRFolds(split.train,feature);
 assert.equal(folds.reduce((n,f)=>n+f.hold.length,0),split.train.length);
 assert.equal(new Set(folds.flatMap(f=>f.hold.map(r=>r.id))).size,split.train.length);
 for(const f of folds) {
  const fitting=new Set(f.train.map(r=>r.id));
  assert.ok(f.hold.every(r=>!fitting.has(r.id)));
  assert.ok([...f.train,...f.hold].every(r=>!split.test.some(t=>t.id===r.id)));
  assert.equal(f.errors,f.hold.filter(r=>f.fit.predict(r)!==r.y).length);
 }
 // A held-out coordinate perturbation must not change that fold's fitted rule.
 const held=new Set(folds[0].hold.map(r=>r.id));
 const altered=split.train.map(r=>held.has(r.id)?{...r,x:r.x+500,z:r.z-500}:r);
 const checked=oneRFolds(altered,feature)[0].fit;
 assert.equal(checked.key,folds[0].fit.key);assert.deepEqual(checked.cuts,folds[0].fit.cuts);assert.deepEqual(checked.values,folds[0].fit.values);
 const fit=oneRuleFit(split.train,feature),study=oneRStudy({split,fit},{feature});
 assert.equal(fit.bucket({[fit.key]:fit.cuts[0]}),0);
 assert.equal(fit.bucket({[fit.key]:fit.cuts[1]}),1);
 assert.equal(fit.predict({[fit.key]:NaN}),fit.fallback);
 assert.ok(study.stump.errors<=split.train.length);
 const detail=oneRDetails(study,{oneFold:1,inputState:'measured'}, {x:0,z:0},9);
 const values=Object.fromEntries(detail.receipt);
 assert.equal(values['Correct positives (TP)']+values['Misses (FN)']+values['False alerts (FP)']+values['Correct negatives (TN)'],split.validation.length);
}
const rows=[0,1,2,3].map((x,i)=>({id:String(i),x,z:x,y:i===3?1:0}));
const stump=teachingStump(rows,'x');assert.equal(stump.cut,2.5);assert.equal(stump.errors,0);assert.equal(stump.predict({x:2.5}),0);assert.equal(stump.predict({x:2.51}),1);
console.log('Visual revision models passed: 43 copy contracts, all 9 pattern/feature fold combinations, held-out perturbation isolation, exact cut inclusion, missing fallback, validation population, and an independently specified stump.');

assert.deepEqual(illustrativeCounts(1,.5),{tp:90,fn:10,fp:495,tn:9405});
assert.deepEqual(illustrativeCounts(1,1),{tp:0,fn:100,fp:0,tn:9900});
for(const prevalence of [1,10,40])for(const threshold of [0,.1,.5,.9,1]){const c=illustrativeCounts(prevalence,threshold);assert.equal(c.tp+c.fn,prevalence*100);assert.equal(c.fp+c.tn,10000-prevalence*100);}
