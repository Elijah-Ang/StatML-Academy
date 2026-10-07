// Exact computations for the displayed course examples. No network or randomness.
export const ITEMS = ['Apple','Bread','Coke','DVD','Egg'];
export const CODES = {Apple:'A',Bread:'B',Coke:'C',DVD:'D',Egg:'E'};
export const SOURCE_BASKETS = [
  {id:100,items:['Apple','Coke','DVD']},
  {id:200,items:['Bread','Coke','Egg']},
  {id:300,items:['Apple','Bread','Coke','Egg']},
  {id:400,items:['Bread','Egg']},
];
export const RULES = [
  {name:'Apple → Coke',x:['Apple'],y:['Coke']},
  {name:'Coke → Apple',x:['Coke'],y:['Apple']},
  {name:'Bread → Egg',x:['Bread'],y:['Egg']},
  {name:'Bread → Coke',x:['Bread'],y:['Coke']},
  {name:'Bread + Coke → Egg',x:['Bread','Coke'],y:['Egg']},
  {name:'Coke + Egg → Bread',x:['Coke','Egg'],y:['Bread']},
];
export const QUIZ_BASKETS = [{id:10,items:['A','B','C']},{id:20,items:['B','C','D']},{id:30,items:['A','C']}];
export const FP_BASKETS = [
  ['a','c','d','f','g','i','m','p'], ['a','b','c','f','i','m','o'],
  ['b','f','h','j','o'], ['b','c','k','s','p'], ['a','c','e','f','l','m','n','p'],
];
export const COHORTS = {
  basketball:{name:'Basketball / cereal',x:'Basketball',y:'Cereal',n:5000,a:3000,b:3750,both:2000,source:'Lecture p.49; seminar slide 51'},
  cpu:{name:'CPU / GPU',x:'CPU',y:'GPU',n:10000,a:6000,b:1500,both:1200,source:'Seminar slides 55–56'},
  burger:{name:'Burger / ketchup',x:'Burger',y:'Ketchup',n:1000,a:150,b:100,both:50,source:'Practical pp.3–4'},
  games:{name:'Games / videos',x:'Games',y:'Videos',n:10000,a:6000,b:7500,both:4000,source:'Textbook Examples 6.7–6.9'},
};
export const TOY_PRODUCTS = [
  {price:300,categories:[5],name:'P1'}, {price:600,categories:[5,8],name:'P2'},
  {price:900,categories:[3],name:'P3'}, {price:1200,categories:[3,8],name:'P4'},
  {price:1500,categories:[5],name:'P5'}, {price:1800,categories:[8],name:'P6'},
  {price:2100,categories:[1,8],name:'P7'}, {price:2400,categories:[1],name:'P8'},
  {price:2700,categories:[1,3],name:'P9'},
];
export const key = xs => [...xs].sort().join('|');
export const subset = (xs,ys) => xs.every(x=>ys.includes(x));
export const union = (x,y) => [...new Set([...x,...y])].sort();
export function combinations(xs,k) {
  if(k===0)return [[]]; if(k>xs.length)return [];
  return xs.flatMap((x,i)=>combinations(xs.slice(i+1),k-1).map(rest=>[x,...rest]));
}
export function allSets(xs) { return xs.flatMap((_,i)=>combinations(xs,i+1)); }
export const count = (rows,xs) => rows.filter(r=>subset(xs,r.items)).length;
export function measure(rows,x,y) {
  if(!x.length||!y.length||x.some(i=>y.includes(i)))throw Error('Rule sides must be nonempty and disjoint');
  const n=rows.length,a=count(rows,x),b=count(rows,y),both=count(rows,union(x,y));
  return fromCounts({n,a,b,both});
}
export function fromCounts({n,a,b,both}) {
  if(n<=0||a<0||b<0||a>n||b>n||both<Math.max(0,a+b-n)||both>Math.min(a,b))throw Error('Invalid contingency counts');
  const confidence=a?both/a:null,reverse=b?both/b:null,expected=a*b/n;
  const observed=[both,a-both,b-both,n-a-b+both];
  const expectations=[expected,a-expected,b-expected,n-a-b+expected];
  const contributions=observed.map((o,i)=>expectations[i]>0?(o-expectations[i])**2/expectations[i]:null);
  return {n,a,b,both,support:both/n,confidence,reverse,lift:a&&b?both*n/(a*b):null,baseline:b/n,expected,observed,expectations,contributions,
    chi2:contributions.every(x=>x!==null)?contributions.reduce((s,v)=>s+v,0):null,
    allConfidence:confidence!==null&&reverse!==null?Math.min(confidence,reverse):null,
    maxConfidence:confidence!==null&&reverse!==null?Math.max(confidence,reverse):null,
    kulc:confidence!==null&&reverse!==null?(confidence+reverse)/2:null,
    cosine:a&&b?both/Math.sqrt(a*b):null,ir:a+b-both?Math.abs(a-b)/(a+b-both):null};
}
// Compare unrounded rates. An absent antecedent never has defined confidence,
// including at a zero cutoff. Control cutoffs are percentages; equality passes.
export function ruleThresholds(rule,minSupport,minConfidence) {
  const supportPass=Number.isFinite(rule.support)&&rule.support>=minSupport/100;
  const confidencePass=Number.isFinite(rule.confidence)&&rule.confidence>=minConfidence/100;
  return {supportPass,confidencePass,bothPass:supportPass&&confidencePass};
}
export function bruteFrequent(rows,minCount,items=[...new Set(rows.flatMap(r=>r.items))].sort()) {
  return allSets(items).map(items=>({items,count:count(rows,items)})).filter(p=>p.count>=minCount);
}
export function apriori(rows,minCount,items=ITEMS) {
  let prior=[],levels=[];
  for(let k=1;k<=items.length;k++) {
    const joined=[],origins=new Map();
    if(k===1)joined.push(...items.map(i=>[i]));
    else for(let i=0;i<prior.length;i++)for(let j=i+1;j<prior.length;j++) {
      const a=[...prior[i].items].sort(),b=[...prior[j].items].sort();
      if(a.slice(0,k-2).join('|')===b.slice(0,k-2).join('|')) {
        const u=union(a,b);
        if(u.length===k&&!joined.some(c=>key(c)===key(u))){joined.push(u);origins.set(key(u),[a,b]);}
      }
    }
    const known=new Set(prior.map(p=>key(p.items)));
    const candidates=joined.map(xs=>{
      const missing=k>1?combinations(xs,k-1).filter(s=>!known.has(key(s))):[];
      return {items:xs,parents:origins.get(key(xs))||[],missing,pruned:missing.length>0,count:missing.length?null:count(rows,xs)};
    });
    const frequent=candidates.filter(c=>!c.pruned&&c.count>=minCount);
    levels.push({k,candidates,frequent});prior=frequent;
    if(!frequent.length)break;
  }
  return {levels,frequent:levels.flatMap(l=>l.frequent)};
}
export function splitRules(rows,items) {
  return allSets(items).filter(x=>x.length<items.length).map(x=>{
    const y=items.filter(i=>!x.includes(i));return {x,y,...measure(rows,x,y)};
  });
}
export function generateRules(rows,patterns,minConfidence=0) {
  return patterns.flatMap(p=>splitRules(rows,p.items)).filter(r=>r.confidence!==null&&r.confidence+1e-12>=minConfidence);
}
export function classify(rows,minCount) {
  const frequent=bruteFrequent(rows,minCount);
  return frequent.map(p=>{
    const supers=frequent.filter(q=>q.items.length>p.items.length&&subset(p.items,q.items));
    return {...p,closed:!supers.some(q=>q.count===p.count),maximal:supers.length===0,supers};
  });
}
// Tree nodes count complete prefixes, not every occurrence of the item globally.
export function buildTree(weighted,minCount=3,preferred=['f','c','a','b','m','p']) {
  const totals=new Map();
  for(const r of weighted)for(const item of new Set(r.items))totals.set(item,(totals.get(item)||0)+r.weight);
  const tie=x=>preferred.includes(x)?preferred.indexOf(x):preferred.length+x.charCodeAt(0);
  const order=[...totals].filter(([,n])=>n>=minCount).sort((a,b)=>b[1]-a[1]||tie(a[0])-tie(b[0])).map(([x])=>x);
  const root={item:'∅',count:0,path:[],children:[]},nodes=[],paths=[];
  for(const r of weighted) {
    const path=order.filter(x=>r.items.includes(x));paths.push({items:path,weight:r.weight});root.count+=r.weight;
    let parent=root;
    for(const item of path) {
      let node=parent.children.find(n=>n.item===item);
      if(!node){node={item,count:0,path:[...parent.path,item],children:[]};parent.children.push(node);nodes.push(node);}
      node.count+=r.weight;parent=node;
    }
  }
  return {root,nodes,order,totals,paths,minCount};
}
export function conditionalBase(tree,item) {
  return tree.nodes.filter(n=>n.item===item).map(n=>({items:n.path.slice(0,-1),weight:n.count}));
}
export function mineFP(weighted,minCount=3,suffix=[]) {
  const tree=buildTree(weighted,minCount),patterns=[];
  for(const item of [...tree.order].reverse()) {
    const next=[...suffix,item];patterns.push({items:[...next].sort(),count:tree.totals.get(item)});
    const base=conditionalBase(tree,item).filter(r=>r.items.length);
    if(base.length)patterns.push(...mineFP(base,minCount,next));
  }
  return patterns;
}
export function fpExample(step=5,suffix='m') {
  const full=buildTree(FP_BASKETS.map(items=>({items,weight:1})),3);
  // Initial scan establishes one global order; partial insertion keeps that order.
  const ordered=full.paths.slice(0,step);
  const root={item:'∅',count:step,path:[],children:[]},nodes=[];
  for(const r of ordered) {
    let parent=root;
    for(const item of r.items) {
      let node=parent.children.find(n=>n.item===item);
      if(!node){node={item,count:0,path:[...parent.path,item],children:[]};parent.children.push(node);nodes.push(node);}
      node.count++;parent=node;
    }
  }
  const base=conditionalBase(full,suffix),conditional=buildTree(base,3);
  const patterns=[{items:[suffix],count:full.totals.get(suffix)},...mineFP(base,3,[suffix])];
  return {full,partial:{root,nodes,order:full.order,paths:ordered},base,conditional,patterns};
}
export function quantile(values,q) {
  const sorted=[...values].sort((a,b)=>a-b),p=(sorted.length-1)*q,i=Math.floor(p),f=p-i;
  return sorted[i]+f*((sorted[i+1]??sorted[i])-sorted[i]);
}
export function encodeToy(row,includeAbsence=false) {
  const cuts=[quantile(TOY_PRODUCTS.map(p=>p.price),1/3),quantile(TOY_PRODUCTS.map(p=>p.price),2/3)];
  const p=TOY_PRODUCTS[row],bin=p.price<=cuts[0]?'Low':p.price<=cuts[1]?'Medium':'High';
  const labels=['Cat=1','Cat=3','Cat=5','Cat=8',...(includeAbsence?['NoExtraCategory']:[]),'Purchase=Low','Purchase=Medium','Purchase=High'];
  const tokens=[...p.categories.map(n=>`Cat=${n}`),...(includeAbsence&&p.categories.length===1?['NoExtraCategory']:[]),`Purchase=${bin}`];
  return {p,cuts,bin,labels,tokens,bits:labels.map(t=>tokens.includes(t))};
}
export function constraint(items,type,cap) {
  const prices={a:40,b:0,c:20,d:10,e:30,f:30,g:20,h:10};
  const values=items.map(i=>prices[i]),total=values.reduce((a,b)=>a+b,0),span=Math.max(...values)-Math.min(...values);
  return {total,span,pass:type==='upper'?total<=cap:type==='lower'?total>=cap:span<=cap,prices};
}
export function initialState() {
  return {baskets:SOURCE_BASKETS.map(r=>({id:r.id,items:[...r.items]})),basket:0,rule:0,minSupport:50,minConfidence:90,set:['Bread','Coke','Egg'],level:3,candidate:'Bread|Coke|Egg',split:0,aprioriPhase:0,projectionPhase:0,workflowPhase:0,fpStep:5,suffix:'m',quizMin:2,quizFocus:'A',family:'all',cohort:'basketball',joint:2000,chiCohort:'games',chiJoint:4000,nulls:0,bOnly:10,constraintType:'upper',cap:35,constraintSet:'a|d',childMin:5,toyRow:0,absence:false,pythonAlgo:'apriori',reviewQuestion:2};
}
export function compute(state) {
  const rule=RULES[state.rule],main=measure(state.baskets,rule.x,rule.y),minCount=Math.ceil(state.baskets.length*state.minSupport/100-1e-12),minConf=state.minConfidence/100;
  const mined=apriori(state.baskets,minCount),splits=splitRules(state.baskets,state.set),rules=generateRules(state.baskets,mined.frequent,minConf);
  const cohort=COHORTS[state.cohort],comparison=fromCounts({...cohort,both:state.joint}),nullMetrics=fromCounts({n:20+state.bOnly+state.nulls,a:20,b:10+state.bOnly,both:10});
  const chiCohort=COHORTS[state.chiCohort],chi=fromCounts({...chiCohort,both:state.chiJoint});
  const mapRules=generateRules(state.baskets,bruteFrequent(state.baskets,1,ITEMS),0);
  const pythonPatterns=state.pythonAlgo==='apriori'?mined.frequent:mineFP(state.baskets.map(row=>({items:row.items,weight:1})),minCount);
  const pythonRules=generateRules(state.baskets,pythonPatterns,minConf);
  return {rule,main,minCount,minConf,mined,splits,rules,mapRules,cohort,comparison,chiCohort,chi,nullMetrics,pythonPatterns,pythonRules,fp:fpExample(state.fpStep,state.suffix),classified:classify(QUIZ_BASKETS,state.quizMin),toy:encodeToy(state.toyRow,state.absence),budget:constraint(state.constraintSet.split('|'),state.constraintType,state.cap)};
}
