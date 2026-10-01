import assert from 'node:assert/strict';
import { ITEMS, SOURCE_BASKETS, RULES, FP_BASKETS, QUIZ_BASKETS, COHORTS, initialState, compute, apriori, bruteFrequent, mineFP, key, subset, measure, fromCounts, generateRules, classify, fpExample, encodeToy, constraint, splitRules } from '../modules/notebook/association-rules/model.js';
let checks=0; const test=(name,fn)=>{fn();checks++;};
const map=patterns=>Object.fromEntries(patterns.map(p=>[key(p.items),p.count]).sort(([a],[b])=>a.localeCompare(b)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('Lecture default counts and denominators',()=>{
 const r=compute(initialState()); assert.equal(r.mined.frequent.length,9);assert.equal(r.rules.length,5);
 near(r.main.support,.5);near(r.main.confidence,1);near(r.main.reverse,2/3);near(r.main.lift,4/3);
 assert.deepEqual(new Set(r.rules.map(p=>`${key(p.x)}=>${key(p.y)}`)),new Set(['Apple=>Coke','Bread=>Egg','Egg=>Bread','Bread|Coke=>Egg','Coke|Egg=>Bread']));
});
test('Both exact miners match independent enumeration across altered data and every threshold',()=>{
 let seed=47; const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 const cases=[SOURCE_BASKETS,...Array.from({length:60},()=>Array.from({length:4},(_,i)=>({id:i,items:ITEMS.filter(()=>random()<.55)})))];
 for(const rows of cases)for(let cut=1;cut<=4;cut++){
  const truth=map(bruteFrequent(rows,cut,ITEMS)); assert.deepEqual(map(apriori(rows,cut).frequent),truth);assert.deepEqual(map(mineFP(rows.map(row=>({items:row.items,weight:1})),cut)),truth);
 }
});
test('Apriori subset viability is not sufficient frequency',()=>{
 const rows=[{items:['A','B']},{items:['A','C']},{items:['B','C']}];
 const level=apriori(rows,1,['A','B','C']).levels[2];assert.equal(level.candidates[0].pruned,false);assert.equal(level.candidates[0].count,0);assert.equal(level.frequent.length,0);
});
test('FP prefix counts and weighted projection use suffix counts',()=>{
 const fp=fpExample(5,'m');assert.deepEqual(fp.base,[{items:['f','c','a'],weight:2},{items:['f','c','a','b'],weight:1}]);assert.equal(fp.conditional.totals.get('b'),1);assert.equal(fp.patterns.length,8);
 const rows=FP_BASKETS.map(items=>({items}));assert.deepEqual(map(mineFP(FP_BASKETS.map(items=>({items,weight:1})),3)),map(bruteFrequent(rows,3)));
 for(let step=0;step<=5;step++){const partial=fpExample(step).partial;for(const n of partial.nodes)assert.equal(n.count,partial.paths.filter(r=>n.path.every((x,i)=>r.items[i]===x)).length);}
});
test('Seminar closed and maximal sets, and reconstruction of support',()=>{
 const patterns=classify(QUIZ_BASKETS,2);
 assert.deepEqual(patterns.filter(p=>p.closed).map(p=>key(p.items)),['C','A|C','B|C']);assert.deepEqual(patterns.filter(p=>p.maximal).map(p=>key(p.items)),['A|C','B|C']);
 const strong=generateRules(QUIZ_BASKETS,patterns,.9);assert.deepEqual(new Set(strong.map(p=>key(p.x)+'=>'+key(p.y))),new Set(['A=>C','B=>C']));
 for(let cut=1;cut<=3;cut++){const ps=classify(QUIZ_BASKETS,cut);for(const p of ps){assert.equal(p.count,Math.max(...ps.filter(q=>q.closed&&subset(p.items,q.items)).map(q=>q.count)));if(p.maximal)assert.ok(p.closed);}}
});
test('Lecture, seminar and practical lift calculations',()=>{
 near(fromCounts(COHORTS.basketball).lift,8/9);near(fromCounts(COHORTS.cpu).support,.12);near(fromCounts(COHORTS.cpu).confidence,.2);near(fromCounts(COHORTS.cpu).reverse,.8);near(fromCounts(COHORTS.burger).lift,10/3);near(fromCounts(COHORTS.games).chi2,5000/9);
 for(const c of Object.values(COHORTS)){const m=fromCounts({...c,both:c.a*c.b/c.n});near(m.lift,1);near(m.chi2,0);assert.equal(m.observed.reduce((a,b)=>a+b),c.n);}
});
test('Null invariance and changing background are distinct',()=>{
 const a=fromCounts({n:30,a:20,b:20,both:10}),b=fromCounts({n:130,a:20,b:20,both:10});near(a.lift,.75);near(b.lift,3.25);
 for(const k of ['confidence','reverse','allConfidence','maxConfidence','kulc','cosine','ir'])near(a[k],b[k]);assert.notEqual(a.support,b.support);assert.notEqual(a.chi2,b.chi2);
});
test('Impossible contingencies and undefined confidence are handled',()=>{
 assert.throws(()=>fromCounts({n:10,a:8,b:7,both:2}));const m=measure([{items:[]}],['Apple'],['Coke']);assert.equal(m.confidence,null);assert.equal(m.lift,null);assert.equal(m.chi2,null);
 assert.throws(()=>measure(SOURCE_BASKETS,['Apple'],['Apple']));
});
test('Every proper split remains visible even with an undefined denominator',()=>{
 const candidates=splitRules(SOURCE_BASKETS,ITEMS);assert.equal(candidates.length,30);assert.ok(candidates.some(p=>p.confidence===null));assert.ok(generateRules(SOURCE_BASKETS,[{items:ITEMS}],0).every(p=>p.confidence!==null));
});
test('Toy quantile edges and token presence preserve their meaning',()=>{
 const row=encodeToy(6);assert.deepEqual(row.cuts,[1100,1900]);assert.equal(row.bin,'High');assert.deepEqual(row.tokens,['Cat=1','Cat=8','Purchase=High']);
 assert.ok(encodeToy(0,true).tokens.includes('NoExtraCategory'));assert.ok(!encodeToy(1,true).tokens.includes('NoExtraCategory'));
});
test('Nonnegative budget extensions obey the declared monotonicity',()=>{
 for(const parent of [['a','d'],['b','d'],['c','e']])for(let bound=0;bound<=100;bound++)for(const item of ['a','b','c','d','e','f','g','h'].filter(x=>!parent.includes(x))){
  if(!constraint(parent,'upper',bound).pass)assert.equal(constraint([...parent,item],'upper',bound).pass,false);
  if(constraint(parent,'lower',bound).pass)assert.equal(constraint([...parent,item],'lower',bound).pass,true);
  if(!constraint(parent,'range',bound).pass)assert.equal(constraint([...parent,item],'range',bound).pass,false);
 }
});
test('Apriori joins retain their actual parents and distinguish pruning from failed counts',()=>{
 const defaultThird=apriori(SOURCE_BASKETS,2).levels[2].candidates[0];
 assert.deepEqual(defaultThird.parents,[['Bread','Coke'],['Bread','Egg']]);assert.equal(defaultThird.count,2);
 const low=apriori(SOURCE_BASKETS,1).levels[2].candidates.find(p=>key(p.items)==='Apple|DVD|Egg');
 assert.deepEqual(low.parents,[['Apple','DVD'],['Apple','Egg']]);assert.deepEqual(low.missing,[['DVD','Egg']]);assert.equal(low.pruned,true);assert.equal(low.count,null);
 const pair=apriori(SOURCE_BASKETS,2).levels[1].candidates.find(p=>key(p.items)==='Apple|Bread');assert.equal(pair.pruned,false);assert.equal(pair.count,1);
});
test('Threshold map preserves rejected observations and each algorithm supplies its own rule result',()=>{
 const state=initialState(),a=compute(state);state.minSupport=75;const b=compute(state);
 assert.deepEqual(a.mapRules,b.mapRules);assert.equal(a.rules.length,5);assert.equal(b.rules.length,2);
 for(const algo of ['apriori','fp']){state.pythonAlgo=algo;state.minSupport=50;const r=compute(state);assert.deepEqual(map(r.pythonPatterns),map(bruteFrequent(SOURCE_BASKETS,2)));assert.deepEqual(new Set(r.pythonRules.map(rule=>key(rule.x)+'=>'+key(rule.y))),new Set(['Apple=>Coke','Bread=>Egg','Egg=>Bread','Bread|Coke=>Egg','Coke|Egg=>Bread']));}
});
test('Chi-square and lift examples have independent state and align with the printed first cases',()=>{
 const state=initialState();state.cohort='cpu';state.joint=900;const a=compute(state);near(a.comparison.lift,1);near(a.chi.chi2,5000/9);assert.equal(a.chi.both,4000);
 state.chiJoint=4500;const b=compute(state);near(b.chi.chi2,0);assert.deepEqual(b.chi.observed,b.chi.expectations);assert.equal(b.comparison.both,900);
});
console.log(`${checks} domain tests passed: independent miners, 244 data/threshold cases, source answers, projections, candidate joins, retained rule observations, state separation and edge cases.`);
