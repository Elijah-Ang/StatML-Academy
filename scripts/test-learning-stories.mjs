import assert from 'node:assert/strict';
import {knnCrossValidation,linearScoreContours,gridScoreContours} from '../modules/notebook/classification-stories.js';
import {componentDirections} from '../modules/notebook/regression-stories.js';
import {oneRuleFit,variance,mean} from '../modules/notebook/science.js';
import {linkageCalculation} from '../modules/notebook/unsupervised-stories.js';

// A self-neighbour would give 100%; honest leave-one-out gives two of three.
const neighbours=[{x:0,z:0,y:0},{x:1,z:0,y:0},{x:10,z:0,y:1}];
const original=structuredClone(neighbours);
for(const scaling of [false,true])for(const weighted of [false,true]){
  const cv=knnCrossValidation(neighbours,scaling,weighted);
  assert.equal(cv.length,1);assert.equal(cv[0].correct,2);assert.equal(cv[0].accuracy,2/3);
}
assert.deepEqual(neighbours,original);
const links=linkageCalculation([{x:0,z:0},{x:2,z:0},{x:5,z:0},{x:7,z:0}],[0,1],[2,3]);
assert.equal(links.single,3);assert.equal(links.complete,7);assert.equal(links.average,5);assert.equal(links.ward,25);

const rule=oneRuleFit([{x:0,z:2,y:1},{x:1,z:3,y:1},{x:2,z:4,y:0}],'x');
for(const x of [undefined,NaN,Infinity,null])assert.equal(rule.predict({x}),1);
const missing=oneRuleFit([{x:NaN,z:2,y:1},{x:NaN,z:3,y:1},{x:NaN,z:4,y:0}],'x');
assert.equal(missing.predict({x:2}),1);

const score=r=>2*r.x-3*r.z+.25;
for(const c of linearScoreContours(score,5)){
  assert.equal(c.points.length,2);
  for(const [x,z] of c.points){assert.ok(Math.abs(score({x,z})-c.level)<1e-10);assert.ok(Math.abs(x)<=5&&Math.abs(z)<=5);}
}
const grid=Array.from({length:21*21},(_,i)=>{const x=-5+(i%21)/2,z=-5+Math.floor(i/21)/2;return {x,z,score:score({x,z})};});
for(const level of [-1,0,1])for(const segment of gridScoreContours(grid,21,level))for(const [x,z] of segment)assert.ok(Math.abs(score({x,z})-level)<1e-10);

const rows=[-2,-1.5,-1,-.5,.5,1,1.5,2].map(x=>({x,y:.3*x+1.1*x*x})),d=componentDirections(rows);
assert.ok(Math.abs(Math.hypot(...d.pc)-1)<1e-12);
assert.ok(Math.abs(Math.hypot(...d.pls)-1)<1e-12);
const ym=mean(d.points.map(r=>r.y));
for(let i=0;i<721;i++){
  const angle=i*Math.PI/720,w=[Math.cos(angle),Math.sin(angle)],scores=d.points.map(r=>w[0]*r.x+w[1]*r.z);
  const covariance=Math.abs(scores.reduce((sum,v,j)=>sum+v*(d.points[j].y-ym),0)/(scores.length-1));
  assert.ok(d.pcSummary.variance+1e-9>=variance(scores));
  assert.ok(Math.abs(d.plsSummary.covariance)+1e-9>=covariance);
}
console.log('Learning story checks passed: hand-calculated group linkages, honest LOO, missing-input fallback, exact contour levels, and independent angular-search checks for PCA/first-PLS directions.');
