import { Surface, Tween, range, select, stats, palette, setText, announce, motionStatus, fmt, pct } from '../ui.js';
import { caption, frame } from '../spatial.js';
import { ITEMS, CODES, RULES, SOURCE_BASKETS, FP_BASKETS, QUIZ_BASKETS, COHORTS, TOY_PRODUCTS, initialState, compute, allSets, combinations, count, subset, union, key } from './model.js';
const [blue,red,green,gold,purple]=palette;
const neutral='#dce1d5',ink='#303b38';
const code=xs=>xs.map(x=>CODES[x]||x).sort().join('');
const names=xs=>xs.join(' + ');
const esc=t=>String(t).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const scenes=['baskets','rule-cohorts','support','confidence','reverse','lift','thresholds','apriori-property','apriori-levels','rule-splits','fp-build','fp-conditional','tid-intersection','closed-maximal','null-measures','chi-square','constraints','hierarchy','encoding','python-results','revision'];
const notes=[
 'One basket is one transaction. Select a basket, then edit its product checkboxes.',
 'The two rule sides are disjoint. A plus sign means all listed items must occur.',
 'Keep all four baskets in the denominator. Green marks contain every item on both sides.',
 'Zoom into baskets containing X. Successes contain Y as well.',
 'Keep the joint count. Change only which group supplies the denominator.',
 'Separate source cohort: the slider changes joint occurrence, holding N and both margins fixed.',
 'All observed rule positions stay visible. A numeral counts rules sharing the same support/confidence.',
 'Every aligned slot represents the same transaction. Adding requirements can only remove matches.',
 'Follow one candidate through the join, subset check and basket count. Cₖ is the candidate level; Lₖ keeps the frequent sets.',
 'One combined itemset, several disjoint ways to divide it. The denominator follows the left side.',
 'Separate five-transaction lecture example. Filter and order a raw basket, then share its prefix in the tree.',
 'Trace gold suffix paths in the complete source tree. Copy each suffix-node count into its prefix weight.',
 'Aligned IDs make intersections visible. Green IDs belong to both sides.',
 'Separate three-transaction seminar quiz. Lines connect immediate frequent set extensions.',
 'Constructed transactions: both=10, X only=10. Extra neither rows enlarge N without entering either conditional group.',
 'Uncorrected Pearson χ². Count discrepancies, then square and divide by the expected count.',
 'Nonnegative source values. Add one gold item to the blue parent values; compare sums or the min-to-max span.',
 'Simplified source hierarchy per 100 transactions. The two drawn subtypes are disjoint.',
 'Nine invented product records illustrate qcut and token encoding. These are not BlackFriday results.',
 'The current shopping baskets become a Boolean input, frequent itemsets, then rules. Browser miners are exact; the companion runs Python.',
 'Choose a revision problem. Use the visible counts, then commit to an answer.',
];
const REVIEW=[
 {q:'CPU → GPU: which fraction is support?',choices:['1,200 / 10,000 = 12%','1,200 / 6,000 = 20%','1,200 / 1,500 = 80%'],correct:0,why:'Support uses every transaction: 1,200/10,000. The other denominators give forward and reverse confidence.'},
 {q:'Which seminar rules pass 90% confidence?',choices:['A → C and B → C','Also C → A and C → B','Every frequent singleton is a rule'],correct:0,why:'A and B each appear twice, always with C. C appears three times, so its reverse rules have only 2/3 confidence.'},
 {q:'Does lift 3.33 establish a promotion effect?',choices:['No. It suggests a pattern to investigate.','Yes. It measures the causal sales increase.'],correct:0,why:'Lift compares observed conditional occurrence with a baseline. A promotion effect requires an appropriate test or causal design.'},
 {q:'Does upper-sum pruning survive negative prices?',choices:['No. A negative extension can repair a failure.','Yes. Adding items always increases a sum.'],correct:0,why:'A set costing 50 fails a budget of 35. Adding an item worth −30 makes the sum 20. Nonnegative values were the pruning assumption.'},
];
export function create(host) {
  const group=(id,stages,html)=>`<div class="control-group" id="${id}" data-for="${stages.join(',')}">${html}</div>`;
  const setOptions=allSets(ITEMS).filter(xs=>xs.length>=2).map(xs=>[key(xs),names(xs)]);
  host.innerHTML=`<p class="scene-kicker" id="scene-kicker"></p><div class="plot"></div><div class="legend" id="scene-legend"></div>
    ${stats([['metric-one',''],['metric-two',''],['metric-three','']])}
    <div class="lab-controls">
    ${group('basket-controls',[0],range('basket-index','Inspect basket',1,4,1,1)+`<fieldset class="basket-editor"><legend>Items in this basket</legend>${ITEMS.map(item=>`<label><input type="checkbox" data-item="${item}">${item}</label>`).join('')}</fieldset>`)}
    ${group('rule-controls',[1,2,3,4,12],select('rule-choice','Rule to inspect',RULES.map((r,i)=>[i,r.name])))}
    ${group('support-controls',[6,7,8,9,19],range('minimum-support','Minimum support',25,100,25,50))}
    ${group('confidence-controls',[6,9,19],range('minimum-confidence','Minimum confidence',0,100,5,90))}
    ${group('itemset-controls',[7,9],select('itemset-choice','Inspect itemset',setOptions))}
    ${group('level-controls',[8],range('candidate-level','Candidate length k',1,5,1,3)+select('candidate-choice','Trace a candidate',[]))}
    ${group('split-controls',[9],range('rule-split','Inspect a split',1,6,1,1))}
    ${group('fp-step-controls',[10],range('fp-step','Inserted baskets',0,5,1,5))}
    ${group('suffix-controls',[11],select('suffix-choice','Suffix item', ['m','p','b','a','c','f'].map(x=>[x,x])))}
    ${group('cohort-controls',[5],select('cohort-choice','Source example',Object.entries(COHORTS).map(([k,v])=>[k,v.name]))+range('joint-count','Joint count',1750,3000,1,2000))}
    ${group('chi-controls',[15],select('chi-cohort-choice','Source example',Object.entries(COHORTS).map(([k,v])=>[k,v.name]))+range('chi-joint-count','Joint count',3500,6000,1,4000))}
    ${group('closed-controls',[13],range('quiz-minimum','Minimum count',1,3,1,2)+select('pattern-family','Emphasise patterns',[['all','All frequent'],['closed','Closed frequent'],['maximal','Maximal frequent']])+select('pattern-focus','Inspect pattern',[]))}
    ${group('null-controls',[14],range('null-rows','Add neither rows',0,200,1,0)+range('y-only','Y-only rows',1,100,1,10))}
    ${group('constraint-controls',[16],select('constraint-type','Constraint',[['upper','Upper sum: sum ≤ bound'],['lower','Lower sum: sum ≥ bound'],['range','Upper range: range ≤ bound']])+range('constraint-bound','Bound',0,100,1,35)+select('constraint-parent','Parent itemset',[['a|d','{a,d}: values 40,10'],['b|d','{b,d}: values 0,10'],['c|e','{c,e}: values 20,30'],['b|c','{b,c}: values 0,20']]))}
    ${group('hierarchy-controls',[17],range('child-support','Subtype cutoff (%)',1,8,1,5))}
    ${group('encoding-controls',[18],range('product-row','Inspect product row',1,9,1,1)+`<label class="check-control"><input id="encode-absence" type="checkbox">Encode no extra category</label>`)}
    ${group('python-controls',[19],select('python-algorithm','Mining algorithm',[['apriori','Apriori'],['fp','FP-growth']]))}
    ${group('revision-controls',[20],select('revision-question','Revision problem',REVIEW.map((r,i)=>[i,['CPU / GPU denominators','Seminar strong rules','Lift and an action','Pruning assumptions'][i]])))}
    </div>
    <div class="revision-choices" hidden>${REVIEW.map((r,i)=>`<fieldset data-review="${i}"><legend>${esc(r.q)}</legend>${r.choices.map((c,j)=>`<button class="quiz-option" type="button" data-review-answer="${i}:${j}">${esc(c)}</button>`).join('')}</fieldset>`).join('')}<p class="feedback" id="revision-feedback" role="status"></p></div>
    <div class="lab-receipt" id="live-receipt"></div><p class="model-note" id="scope-note"></p>`;
  const s=new Surface(host.querySelector('.plot'),'Association rules: exact counts and conditional groups');
  let state=initialState(),index=0,r=compute(state),reviewAnswers={};
  const tween=new Tween((v,moving)=>{paint(v);motionStatus(moving);});
  const T=(k,x,y,t,attrs={})=>s.text(k,x,y,t,{'font-size':16,...attrs});
  const cap=(k,t,y=24,color=ink)=>caption(s,k,t,y,color);
  function end(y,description) {s.h=y+16;s.svg.setAttribute('viewBox',`0 0 ${s.w} ${s.h}`);s.end(description||notes[index]);}
  function slots(k,title,y,rows,match,color=green) {
    y=cap(k+'-title',title,y);
    if(!rows.length)return cap(k+'-empty','No qualifying baskets: this denominator is zero.',y+17,red)+12;
    const gap=8,cw=(s.w-28-gap*(rows.length-1))/rows.length;
    rows.forEach((row,i)=>{const x=14+i*(cw+gap),yes=match(row);s.rect(k+'-slot-'+row.id,x,y+8,cw,38,yes?color:'#f0f0e6',{opacity:yes?.7:1,stroke:yes?color:'#cbd0c1'});T(k+'-id-'+row.id,x+cw/2,y+33,String(row.id),{'text-anchor':'middle',fill:yes?'#fffef9':ink,'font-size':15});});
    return y+65;
  }
  function chips(k,title,items,y,color=blue,removed=[]) {
    y=cap(k+'-title',title,y);
    const cols=Math.max(1,Math.floor((s.w-28)/46)),start=y+7;
    items.forEach((item,i)=>{
      const x=14+(i%cols)*46,yy=start+Math.floor(i/cols)*43,off=removed.includes(item);
      s.rect(k+'-chip-'+i,x,yy,35,31,off?'#eeeee6':color,{opacity:off?1:.16,stroke:off?'#b8bdaf':color});
      T(k+'-letter-'+i,x+17.5,yy+22,CODES[item]||item,{'text-anchor':'middle',fill:off?'#838c7d':color,'font-size':18});
      if(off)s.line(k+'-strike-'+i,x+5,yy+25,x+30,yy+6,'#838c7d',1.3);
    });
    return start+Math.ceil(items.length/cols)*43+8;
  }
  function valueBar(k,label,value,max,y,color=blue,displayValue=value) {
    y=cap(k+'-caption',label,y);
    const width=s.w-28;
    s.rect(k+'-track',14,y+5,width,25,'#ecede3');
    s.rect(k+'-value',14,y+5,width*Math.max(0,Math.min(1,displayValue/max)),25,color,{opacity:.64});
    T(k+'-amount',s.w-14,y+53,`${fmt(value,Number.isInteger(value)?0:2)} / ${fmt(max,0)}`,{'text-anchor':'end','font-size':15});
    return y+82;
  }
  function proportion(k,label,amount,y,color=blue,display=amount) {
    y=cap(k+'-caption',`${label}: ${pct(amount)}`,y,color);
    s.rect(k+'-track',14,y+3,s.w-28,28,'#ecede3');
    s.rect(k+'-fill',14,y+3,(s.w-28)*(display??0),28,color,{opacity:.65});
    T(k+'-zero',14,y+54,'0%',{'font-size':14});T(k+'-one',s.w-14,y+54,'100%',{'text-anchor':'end','font-size':14});
    return y+82;
  }
  function tree(k,root,y,highlight=[],suffix=null) {
    let leaf=0,maxDepth=0;
    function place(n,depth){maxDepth=Math.max(maxDepth,depth);n.children.forEach(c=>place(c,depth+1));n._x=n.children.length?n.children.reduce((sum,c)=>sum+c._x,0)/n.children.length:leaf++;n._depth=depth;}
    place(root,0);
    const x=n=>leaf<=1?s.w/2:30+n._x*(s.w-60)/(leaf-1), yy=n=>y+n._depth*60;
    const trails=[];
    function collect(n){if(n.item===suffix)trails.push(n.path);n.children.forEach(collect);}if(suffix)collect(root);
    const onPath=n=>n.path.length>0&&(suffix?trails.some(path=>n.path.every((item,i)=>path[i]===item)):highlight.slice(0,n.path.length).join('|')===n.path.join('|'));
    function edges(n){n.children.forEach(c=>{const selected=onPath(c);s.line(k+'-edge-'+c.path.join('-'),x(n),yy(n)+15,x(c),yy(c)-16,selected?gold:'#aab7a7',selected?2.5:1.2);edges(c);});}
    function nodes(n){const id=n.path.join('-')||'root',selected=onPath(n),endpoint=n.item===suffix;s.rect(k+'-node-'+id,x(n)-20,yy(n)-16,40,32,endpoint?'#f3edd9':'#fffef9',{rx:8,stroke:selected?gold:blue,'stroke-width':endpoint?2.8:selected?2.3:1.2});T(k+'-text-'+id,x(n),yy(n)+6,n.path.length?`${n.item}:${n.count}`:'∅',{'text-anchor':'middle','font-size':17,fill:selected?gold:ink});n.children.forEach(nodes);}
    edges(root);nodes(root);return y+maxDepth*60+34;
  }
  function paint(v) {
    s.begin(360);let y=24;
    if(index===0) {
      y=cap('basket-caption','A–E are products. One outlined basket is one transaction.',y);
      y=cap('basket-dictionary','A = Apple; B = Bread; C = Coke; D = DVD; E = Egg.',y+7,blue);
      const cw=(s.w-42)/2,base=y+14;
      state.baskets.forEach((row,i)=>{
        const x=14+(i%2)*(cw+14),by=base+Math.floor(i/2)*146,selected=i===state.basket;
        T('basket-label-'+i,x+cw/2,by+4,`Basket ${row.id}`,{'text-anchor':'middle',fill:selected?gold:ink});
        s.path('basket-handle-'+i,`M${x+cw*.25},${by+25} Q${x+cw*.5},${by+3} ${x+cw*.75},${by+25}`,selected?gold:'#92a493',1.5);
        s.path('basket-body-'+i,`M${x+4},${by+29} L${x+cw-4},${by+29} L${x+cw-14},${by+107} L${x+14},${by+107} Z`,selected?gold:'#92a493',selected?2.3:1.3,'#f2f3e9',{opacity:selected?(.6+.4*v.reveal):1});
        row.items.forEach((item,j)=>{const bx=x+cw/2-25+(j%3)*25,cy=by+50+Math.floor(j/3)*29;s.circle('basket-product-'+i+'-'+item,bx,cy,11,blue,{opacity:.16});T('basket-item-'+i+'-'+item,bx,cy+5,CODES[item],{'text-anchor':'middle',fill:blue});});
        if(!row.items.length)T('basket-empty-'+i,x+cw/2,by+73,'Empty',{'text-anchor':'middle',fill:red});
      });
      y=base+2*146; y=cap('selected-basket',`Selected basket ${state.baskets[state.basket].id}: ${state.baskets[state.basket].items.join(', ')||'no items'}.`,y,gold);
    } else if(index===1) {
      y=cap('rule-words',`${names(r.rule.x)} → ${names(r.rule.y)}`,y,blue);
      const cols=[14,s.w*.32,s.w*.59,s.w-25];
      ['TID',`X:${code(r.rule.x)}`,`Y:${code(r.rule.y)}`,'Both'].forEach((t,i)=>T('rule-col-'+i,cols[i],y+10,t,{'text-anchor':i?'middle':'start','font-size':15}));
      y+=40;
      state.baskets.forEach((row,i)=>{const yy=y+i*49,yesX=subset(r.rule.x,row.items),yesY=subset(r.rule.y,row.items);T('rule-row-'+i,14,yy+5,row.id);[yesX,yesY,yesX&&yesY].forEach((yes,j)=>{s.circle('rule-circle-'+i+'-'+j,cols[j+1],yy,14,yes?(j===2?green:blue):'#eceee5',{opacity:yes?.8:1});T('rule-bit-'+i+'-'+j,cols[j+1],yy+5,yes?'1':'0',{'text-anchor':'middle',fill:yes?'#fffef9':ink});});});
      y+=state.baskets.length*49;y=cap('rule-outcome',`${r.main.a} baskets qualify for X; ${r.main.both} also contain all of Y.`,y+8);
    } else if(index===2) {
      y=slots('support-slots',`${names(union(r.rule.x,r.rule.y))}: count joint matches`,y,state.baskets,row=>subset(union(r.rule.x,r.rule.y),row.items));
      y=proportion('support-result',`${r.main.both} of all ${r.main.n} baskets`,r.main.support,y+16,green,v.support);
      y=cap('support-equation',`Support = ${r.main.both} / ${r.main.n}. Reversing the arrow preserves this count.`,y);
    } else if(index===3) {
      y=slots('confidence-all','Start with all baskets. Blue ones contain X.',y,state.baskets,row=>subset(r.rule.x,row.items),blue);
      const rows=state.baskets.filter(row=>subset(r.rule.x,row.items));
      y=slots('confidence-filtered',`Keep only ${names(r.rule.x)} baskets. Green ones also contain Y.`,y+25,rows,row=>subset(r.rule.y,row.items),green);
      y=proportion('confidence-result',`${r.main.both} successes / ${r.main.a} X baskets`,r.main.confidence,y+15,green,v.confidence);
    } else if(index===4) {
      for(const [k,xs,ys,label] of [['forward',r.rule.x,r.rule.y,r.rule.name],['reverse',r.rule.y,r.rule.x,`${names(r.rule.y)} → ${names(r.rule.x)}`]]) {
        const rows=state.baskets.filter(row=>subset(xs,row.items));
        y=slots(k,label+' — qualifying baskets',y,rows,row=>subset(ys,row.items),green);
        y=cap(k+'-ratio',`${r.main.both} successes / ${rows.length} qualifying baskets = ${pct(rows.length?r.main.both/rows.length:null)}`,y+7);y+=26;
      }
      y=cap('reverse-constant',`Same successful basket IDs. Shared support = ${r.main.both}/${r.main.n} = ${pct(r.main.support)}.`,y);
    } else if(index===5) {
      y=proportion('lift-baseline',`Overall ${r.cohort.y}`,r.comparison.baseline,y,blue,v.baseline);
      y=proportion('lift-conditioned',`${r.cohort.y} given ${r.cohort.x}`,r.comparison.confidence,y,green,v.cohortConfidence);
      y=cap('lift-equation',`Lift = ${pct(r.comparison.confidence)} ÷ ${pct(r.comparison.baseline)} = ${fmt(r.comparison.lift,2)}.`,y,gold);
      y=valueBar('lift-observed','Observed joint count',r.comparison.both,r.cohort.n,y+15,green,v.joint);
      y=valueBar('lift-expected','Expected joint count under independence',r.comparison.expected,r.cohort.n,y,blue);
    } else if(index===6) {
      y=cap('threshold-caption','Coordinates are rule support and confidence. A numeral counts coincident rules.',y);
      const plot=frame(s,'rule-map',{x:49,y:y+20,w:s.w-68,h:190},[0,1],[0,1],[],false);
      const x=plot.x,yf=plot.y;
      s.rect('threshold-region',x(v.minSupport),yf(1),plot.r-x(v.minSupport),yf(v.minConfidence)-yf(1),green,{opacity:.12,rx:0});
      for(const t of [0,.5,1]){T('threshold-x-'+t,x(t),plot.b+23,`${t*100}%`,{'font-size':14,'text-anchor':t===0?'start':t===1?'end':'middle'});T('threshold-y-'+t,plot.l-9,yf(t)+5,`${t*100}%`,{'font-size':14,'text-anchor':'end'});}
      s.line('support-cutoff',x(v.minSupport),plot.t,x(v.minSupport),plot.b,gold,1.7,'5 4');s.line('confidence-cutoff',plot.l,yf(v.minConfidence),plot.r,yf(v.minConfidence),gold,1.7,'5 4');
      const groups=new Map();
      for(const rule of r.mapRules){const id=rule.support.toFixed(6)+'-'+rule.confidence.toFixed(6);if(!groups.has(id))groups.set(id,[]);groups.get(id).push(rule);}
      for(const [id,rs] of groups){const rule=rs[0],supportOK=rule.support+1e-12>=state.minSupport/100,passes=supportOK&&rule.confidence+1e-12>=r.minConf,color=passes?green:supportOK?red:'#909c89';s.circle('threshold-dot-'+id,x(rule.support),yf(rule.confidence),13,color,{stroke:'#fffef9','stroke-width':1.7});T('threshold-number-'+id,x(rule.support),yf(rule.confidence)+5,rs.length,{'text-anchor':'middle',fill:'#fffef9','font-size':15});}
      y=cap('threshold-axis','Horizontal = support. Vertical = confidence. Positions do not move when cutoffs change.',plot.b+58);y=cap('threshold-total',`${r.mapRules.length} observed rule candidates; ${r.rules.length} pass both cutoffs. ${r.mined.frequent.length} itemsets pass support.`,y+8);
    } else if(index===7) {
      const xs=state.set,subs=xs.map((_,i)=>xs.filter((_,j)=>i!==j));
      for(const [i,items] of [...subs,xs].entries()) {
        const c=count(state.baskets,items),whole=i===subs.length,color=whole?gold:c>=r.minCount?blue:red;
        y=slots('property-'+i,`${whole?'Complete set':'Subset'} ${code(items)}: count ${c}${c<r.minCount?' < cutoff '+r.minCount:''}`,y,state.baskets,row=>subset(items,row.items),color);y+=8;
      }
      y=cap('property-message',`Complete count ${count(state.baskets,xs)} cannot exceed any subset count.`,y+5);
    } else if(index===8) {
      const level=r.mined.levels.find(l=>l.k===state.level);
      y=cap('apriori-stage',`C${state.level}: joined candidates at length ${state.level}. Cutoff = ${r.minCount} of ${state.baskets.length}.`,y,blue);
      if(!level||!level.candidates.length)y=cap('apriori-empty','No candidate is generated. The search has stopped at an empty level.',y+28,red);
      else {
        const p=level.candidates.find(p=>key(p.items)===state.candidate)||level.candidates[0];
        if(state.level>1){
          y=cap('join-heading','1. Join two frequent parent sets.',y+12,blue);
          for(const [i,parent] of p.parents.entries())y=chips('join-parent-'+i,`Parent from L${state.level-1}: ${code(parent)}`,parent,y+5,blue);
          y=chips('join-result',`Union: ${code(p.items)}. Shared items are included once.`,p.items,y+7,gold);
          y=cap('subset-heading',`2. Check every ${state.level-1}-item subset against L${state.level-1}.`,y+7,blue);
          const prior=r.mined.levels.find(l=>l.k===state.level-1)?.frequent||[];
          for(const [i,xs] of combinations(p.items,state.level-1).entries()){
            const known=prior.find(q=>key(q.items)===key(xs));
            y=cap('subset-check-'+i,known?`✓ ${code(xs)} is frequent: count ${known.count}.`:`× ${code(xs)} is missing: prune this candidate.`,y+5,known?green:red);
          }
        } else y=chips('singleton-candidate','Start with one candidate per item.',p.items,y+12,gold);
        if(p.pruned)y=cap('candidate-pruned',`Blocked before scanning: ${code(p.items)} cannot be frequent because ${p.missing.map(code).join(', ')} failed.`,y+18,red);
        else {
          y=slots('candidate-scan',`${state.level>1?'3. ':''}Count baskets containing the complete candidate.`,y+17,state.baskets,row=>subset(p.items,row.items),p.count>=r.minCount?green:red);
          y=cap('candidate-decision',`${code(p.items)}: count ${p.count} ${p.count>=r.minCount?'≥':'<'} ${r.minCount}. ${p.count>=r.minCount?'Keep in':'Exclude from'} L${state.level}.`,y+11,p.count>=r.minCount?green:red);
        }
      }
      y=cap('apriori-keep',`L${state.level}: ${level?.frequent.map(p=>code(p.items)).join(', ')||'empty'}.`,y+10,green);
    } else if(index===9) {
      const selected=r.splits[Math.min(state.split,r.splits.length-1)];
      y=cap('split-set',`Combined itemset ${code(state.set)} has count ${count(state.baskets,state.set)}.`,y,blue);
      if(!selected)y=cap('split-empty','No nonempty disjoint split exists.',y+25,red);
      else {
        y=chips('split-left','Antecedent X: '+names(selected.x),selected.x,y+15,blue);
        y=chips('split-right','Consequent Y: '+names(selected.y),selected.y,y+5,green);
        y=cap('split-rule',`${code(selected.x)} → ${code(selected.y)}. Every combined item appears on exactly one side.`,y+8,gold);
        y=slots('split-denominator','Baskets in the antecedent denominator',y+18,state.baskets.filter(row=>subset(selected.x,row.items)),row=>subset(selected.y,row.items),green);
        y=proportion('split-confidence',`${selected.both} / ${selected.a} = confidence`,selected.confidence,y+15,green);
        const passes=selected.support>=state.minSupport/100&&selected.confidence!==null&&selected.confidence>=r.minConf;
        y=cap('split-verdict',selected.confidence===null?'Confidence is undefined: no basket contains the antecedent.':`${passes?'Passes':'Fails'} the current support and confidence cutoffs.`,y,passes?green:red);
      }
    } else if(index===10) {
      const path=r.fp.full.paths[state.fpStep-1]?.items||[];
      y=cap('fp-order',`Global order: ${r.fp.full.order.join(', ')}. Minimum count = 3.`,y,blue);
      if(state.fpStep){
        const raw=FP_BASKETS[state.fpStep-1],removed=raw.filter(item=>!r.fp.full.order.includes(item));
        y=chips('fp-raw',`Raw basket ${state.fpStep*100}: crossed items have global count below 3.`,raw,y+9,blue,removed);
        y=chips('fp-ordered','Filtered path, in the one global order:',path,y+3,gold);
      } else y=cap('fp-empty','No basket inserted yet. Global counts came from the initial scan of all five baskets. The empty root is not an item.',y+8,gold);
      y=tree('fp-build',r.fp.partial.root,y+37,path);
      y=cap('fp-node-caption',`${state.fpStep} inserted transactions; ${r.fp.partial.nodes.length} stored item nodes. Node counts refer to prefixes.`,y+12);
      const cNodes=r.fp.partial.nodes.filter(n=>n.item==='c');
      y=cap('fp-header-link',`Inserted c nodes: ${cNodes.map(n=>n.count).join(' + ')||'0'} = ${cNodes.reduce((sum,n)=>sum+n.count,0)}. Full-data header c = 4.`,y+8,blue);
    } else if(index===11) {
      y=cap('conditional-title',`Suffix ${state.suffix}: complete five-transaction source tree.`,y,blue);
      y=cap('conditional-trace','1. Trace gold paths to the chosen suffix nodes. Use the count at the final node.',y+9,gold);
      y=tree('fp-source-projection',r.fp.full.root,y+33,[],state.suffix);
      y=cap('conditional-base-title','2. Remove the suffix; copy its count to each prefix.',y+18,blue);
      for(const [i,p] of r.fp.base.entries()) y=cap('conditional-prefix-'+i,`${p.items.join(' → ')||'Empty prefix'} : suffix count ${p.weight} → weight ${p.weight}`,y+13,gold);
      y=cap('conditional-filter','3. Add prefix weights per item; keep totals ≥ 3.',y+23,blue);
      for(const [item,n] of r.fp.conditional.totals){
        const weights=r.fp.base.filter(p=>p.items.includes(item)).map(p=>p.weight);
        y=cap('conditional-total-'+item,`${item}: ${weights.join(' + ')} = ${n}. ${n>=3?'Keep.':'Remove below support.'}`,y+5,n>=3?green:red);
      }
      y=tree('fp-conditional',r.fp.conditional.root,y+30);
      y=cap('conditional-patterns',`${r.fp.patterns.length} patterns generated at ordered suffix ${state.suffix}: ${r.fp.patterns.map(p=>p.items.join('')).join(', ')}.`,y+10,green);
      y=cap('conditional-scope','This projection adds only earlier items. Patterns with later items are generated at their later suffix.',y+9);
    } else if(index===12) {
      const idsX=state.baskets.filter(row=>subset(r.rule.x,row.items)).map(row=>row.id),idsY=state.baskets.filter(row=>subset(r.rule.y,row.items)).map(row=>row.id),shared=idsX.filter(id=>idsY.includes(id));
      for(const [i,title,ids] of [[0,`X: ${names(r.rule.x)}`,idsX],[1,`Y: ${names(r.rule.y)}`,idsY],[2,'Intersection: X and Y',shared]]) {
        y=cap('tid-title-'+i,title,y,i===2?green:blue);
        const width=(s.w-28)/4;
        state.baskets.forEach((row,j)=>{const x=14+width*(j+.5),contains=ids.includes(row.id),common=shared.includes(row.id);s.circle('tid-mark-'+i+'-'+row.id,x,y+21,12,contains?(common?green:blue):'#edeee6',{opacity:.8});T('tid-id-'+i+'-'+row.id,x,y+52,row.id,{'text-anchor':'middle','font-size':15});});y+=90;
      }
      y=cap('tid-result',`Intersection count ${shared.length}; support ${shared.length}/${state.baskets.length}.`,y,green);
    } else if(index===13) {
      const patterns=r.classified,maxLevel=Math.max(1,...patterns.map(p=>p.items.length));
      y=cap('closed-title',`Seminar quiz: minimum count ${state.quizMin} of 3.`,y);
      const positions=new Map(),top=y+38;
      for(let level=1;level<=maxLevel;level++) {
        const ps=patterns.filter(p=>p.items.length===level),width=(s.w-42)/Math.max(1,ps.length);
        ps.forEach((p,i)=>positions.set(key(p.items),{x:21+width*(i+.5),y:top+(level-1)*106,p}));
      }
      for(const a of patterns)for(const b of patterns)if(b.items.length===a.items.length+1&&subset(a.items,b.items)){const pa=positions.get(key(a.items)),pb=positions.get(key(b.items));s.line('lattice-edge-'+key(a.items)+'-'+key(b.items),pa.x,pa.y+18,pb.x,pb.y-18,'#b9c6b3',1);}
      for(const [id,{x,y:yy,p}] of positions) {
        const relevant=state.family==='all'||p[state.family],focused=id===state.quizFocus;
        const node=s.node('pattern-action-'+id,'g',{role:'button',tabindex:0,'data-action':'pattern:'+id,'aria-label':`${p.items.join(',')}, count ${p.count}, ${p.closed?'closed':'not closed'}, ${p.maximal?'maximal':'not maximal'}`});
        // Invisible target and visible marks keep stable keys/parents.
        s.node('pattern-hit-'+id,'rect',{x:x-22,y:yy-22,width:44,height:44,fill:'transparent'},undefined,node);
        s.rect('pattern-box-'+id,x-20,yy-17,40,34,p.maximal?'#deebdf':'#fffef9',{stroke:p.closed?blue:'#9fab98','stroke-width':p.closed?2:1,opacity:relevant?1:.25,'pointer-events':'none'});
        if(focused)s.rect('pattern-selected-'+id,x-24,yy-21,48,42,'none',{stroke:gold,'stroke-width':1.6,'pointer-events':'none'});
        T('pattern-label-'+id,x,yy+5,`${p.items.join('')}:${p.count}`,{'text-anchor':'middle','font-size':15,opacity:relevant?1:.35,'pointer-events':'none'});
      }
      y=top+(maxLevel-1)*106+50;
      const p=patterns.find(p=>key(p.items)===state.quizFocus)||patterns[0];
      if(p){
        y=cap('closed-inspection',`${p.items.join('')}: count ${p.count}. ${p.closed?'Closed':'Not closed'}. ${p.maximal?'Maximal':'Not maximal'}.`,y,gold);
        y=slots('closed-baskets',`Baskets containing ${p.items.join('')}`,y+16,QUIZ_BASKETS,row=>subset(p.items,row.items),blue);
        const witness=p.supers.find(q=>q.count===p.count)||p.supers[0];
        if(witness){
          y=slots('extension-baskets',`Add items to obtain ${witness.items.join('')}`,y+10,QUIZ_BASKETS,row=>subset(witness.items,row.items),green);
          y=cap('closed-reason',witness.count===p.count?'No matching basket is lost. Same-count extension means the inspected set is not closed.':'This extension loses baskets. Every frequent extension has a lower count: the inspected set is closed, but not maximal.',y+7);
        } else y=cap('closed-reason','No frequent proper superset exists. The inspected set is maximal and therefore closed.',y+10);
        const closedSupers=patterns.filter(q=>q.closed&&subset(p.items,q.items)),recover=Math.max(...closedSupers.map(q=>q.count));
        y=cap('closed-recovery',`Closed-superset counts: ${closedSupers.map(q=>q.items.join('')+':'+q.count).join(', ')}. Largest = ${recover}, so recover the inspected support as ${recover}/3.`,y+14,blue);
      }
    } else if(index===14) {
      y=cap('null-caption','One circle = one constructed transaction. Blank gold circles contain neither side.',y);
      const values=[10,10,state.bOnly,state.nulls],labels=['Both X and Y','X only','Y only','Neither'],colors=[green,blue,purple,gold],cols=Math.max(1,Math.floor((s.w-28)/17));
      values.forEach((n,i)=>{
        y=cap('null-group-'+i,`${labels[i]}: ${n}`,y+8,colors[i]);
        for(let j=0;j<n;j++)s.circle('null-person-'+i+'-'+j,22+(j%cols)*17,y+7+Math.floor(j/cols)*17,5,i===3?'#fffef9':colors[i],{opacity:i===3?1:.7,stroke:colors[i],'stroke-width':i===3?1.4:0});
        y+=Math.max(1,Math.ceil(n/cols))*17+14;
      });
      y=cap('null-population',`All rows: 10 + 10 + ${state.bOnly} + ${state.nulls} = N ${r.nullMetrics.n}.`,y+10,gold);
      y=proportion('null-support',`Support: ${r.nullMetrics.both}/${r.nullMetrics.n} of all rows`,r.nullMetrics.support,y+10,green,v.nullSupport);
      y=proportion('null-forward',`Y given X: ${r.nullMetrics.both}/${r.nullMetrics.a} X rows`,r.nullMetrics.confidence,y,blue,v.nullForward);
      y=proportion('null-reverse',`X given Y: ${r.nullMetrics.both}/${r.nullMetrics.b} Y rows`,r.nullMetrics.reverse,y,purple,v.nullReverse);
      y=cap('null-result',`Lift = ${fmt(r.nullMetrics.lift,2)}. Only the background changes when you add neither rows.`,y,gold);
    } else if(index===15) {
      y=cap('chi-title',`${r.chiCohort.name}: observed and independence-expected counts.`,y);
      const labels=['Both','X only','Y only','Neither'],max=Math.max(1,...r.chi.observed,...r.chi.expectations),width=s.w-28;
      y=cap('chi-scale',`Every count bar shares the scale 0 to ${fmt(max,0)} transactions.`,y+8);
      const displayJoint=v.chiJoint??r.chi.both,displayObserved=[displayJoint,r.chi.a-displayJoint,r.chi.b-displayJoint,r.chi.n-r.chi.a-r.chi.b+displayJoint];
      for(let i=0;i<4;i++) {
        y=cap('chi-cell-title-'+i,labels[i],y+8);
        for(const [j,value,color] of [[0,r.chi.observed[i],blue],[1,r.chi.expectations[i],'#909f8e']]) {
          const yy=y+5+j*29;s.rect('chi-track-'+i+'-'+j,14,yy,width,23,'#eceee5');s.rect('chi-bar-'+i+'-'+j,14,yy,width*(j===0?displayObserved[i]:value)/max,23,color,{opacity:.6});T('chi-value-'+i+'-'+j,s.w-18,yy+17,fmt(value,0),{'text-anchor':'end','font-size':14});
        }
        const delta=r.chi.observed[i]-r.chi.expectations[i];
        y=cap('chi-contribution-'+i,`Difference ${fmt(delta,0)}. (${fmt(delta,0)})² / ${fmt(r.chi.expectations[i],0)} = ${fmt(r.chi.contributions[i],2)}.`,y+85,gold);y+=12;
      }
      y=cap('chi-total',`Sum χ² = ${fmt(r.chi.chi2,2)}. Squared discrepancies have no direction.`,y+8,gold);
    } else if(index===16) {
      const parent=state.constraintSet.split('|'),base=r.budget;const candidates=[{items:parent,...base},...Object.keys(base.prices).filter(x=>!parent.includes(x)).map(x=>{const items=[...parent,x],vals=items.map(i=>base.prices[i]),total=vals.reduce((a,b)=>a+b,0),span=Math.max(...vals)-Math.min(...vals),value=state.constraintType==='range'?span:total;return {items,total,span,pass:state.constraintType==='lower'?value>=state.cap:value<=state.cap};})];
      y=cap('constraint-caption',`Bound ${state.cap}. ${state.constraintType==='range'?'Value range':'Sum of nonnegative values'} on a shared 0–100 scale.`,y);
      for(const [i,c] of candidates.entries()) {
        const value=state.constraintType==='range'?c.span:c.total,values=c.items.map(item=>base.prices[item]),width=s.w-28;
        y=cap('constraint-row-'+i,`${i?'Extension':'Parent'} {${c.items.join(',')}}: ${state.constraintType==='range'?Math.max(...values)+' − '+Math.min(...values):values.join(' + ')} = ${value}, ${c.pass?'pass':'fail'}`,y+8,c.pass?green:red);
        if(state.constraintType==='range'){
          const xx=n=>14+width*n/100,yy=y+14,lo=Math.min(...values),hi=Math.max(...values);
          s.line('range-axis-'+i,14,yy,s.w-14,yy,'#d3d8ca',1.1);
          s.line('range-span-'+i,xx(lo),yy+10,xx(hi),yy+10,c.pass?green:red,2);
          s.line('range-low-'+i,xx(lo),yy+5,xx(lo),yy+15,c.pass?green:red,1.4);s.line('range-high-'+i,xx(hi),yy+5,xx(hi),yy+15,c.pass?green:red,1.4);
          values.forEach((n,j)=>s.circle('range-item-'+i+'-'+j,xx(n),yy-2,5,j<parent.length?blue:gold,{stroke:'#fffef9','stroke-width':1.3}));
          y+=48;y=cap('range-length-label-'+i,`Compare range length ${value} with bound ${state.cap}:`,y);
        }
        s.rect('constraint-track-'+i,14,y,width,22,'#ecede3');
        if(state.constraintType==='range')s.rect('constraint-range-length-'+i,14,y,width*value/100,22,c.pass?green:red,{opacity:.6});
        else {let running=0;values.forEach((n,j)=>{s.rect('constraint-part-'+i+'-'+j,14+width*running/100,y,width*n/100,22,j<parent.length?blue:gold,{opacity:j<parent.length?.35+.18*(j%2):.62,stroke:'#fffef9','stroke-width':1});running+=n;});}
        s.line('constraint-cutoff-'+i,14+width*state.cap/100,y-2,14+width*state.cap/100,y+24,gold,1.5,'3 3');y+=40;
      }
      y=cap('constraint-conclusion',state.constraintType==='lower'?'A passing parent stays passing on every extension. A failing parent can later pass.':'A failing parent stays failing on every extension. A passing parent can later fail.',y+10);
    } else if(index===17) {
      y=cap('hierarchy-units','Zoomed 0–12% ruler: each cell is one percentage point of support, not a transaction ID.',y);
      y=cap('hierarchy-name-clarity','“2% milk” is a fat category; its support here is 6%.',y+9);
      const w=(s.w-28)/12,values=[10,6,4],labels=['Milk (parent)','2% milk (subtype)','Skim milk (subtype)'];
      values.forEach((n,i)=>{y=cap('hierarchy-name-'+i,`${labels[i]}: ${n}%`,y+8);for(let j=0;j<12;j++)s.rect('hierarchy-cell-'+i+'-'+j,14+j*w,y+3,w-2,31,j>=n?'#eceee5':i===2||i===0&&j>=6?purple:blue,{opacity:j<n?.65:1});const limit=i===0?5:state.childMin;s.line('hierarchy-bound-'+i,14+w*limit,y-2,14+w*limit,y+38,gold,2,'3 3');y=cap('hierarchy-pass-'+i,`Cutoff ${limit}%: ${n>=limit?'passes':'fails'}.`,y+62,n>=limit?green:red);y+=16;});
      y=cap('hierarchy-parts','In this illustration, Milk’s ten filled cells contain six blue and four purple subtype cells.',y+6);
      y=cap('hierarchy-parent-fixed','Parent cutoff stays 5%. Only the subtype cutoff is adjustable.',y+10);
    } else if(index===18) {
      y=cap('encoding-title','Purchase thirds: Low ≤ 1,100; Medium ≤ 1,900; High > 1,900.',y);
      const x=p=>14+(s.w-28)*p/3000,axis=y+60;
      s.rect('low-band',x(0),axis-32,x(1100)-x(0),34,blue,{opacity:.1,rx:0});s.rect('mid-band',x(1100),axis-32,x(1900)-x(1100),34,green,{opacity:.1,rx:0});s.rect('high-band',x(1900),axis-32,x(3000)-x(1900),34,purple,{opacity:.1,rx:0});
      for(const [id,value] of [['low',1100],['high',1900]])s.line('encoding-cut-'+id,x(value),axis-40,x(value),axis+15,gold,1.2,'3 3');
      TOY_PRODUCTS.forEach((p,i)=>s.mark('price-point-'+i,x(p.price),axis-16,p.price<=1100?blue:p.price<=1900?green:purple,`${p.name}, purchase ${p.price}`,i===state.toyRow,'product:'+i));
      s.line('price-axis',x(0),axis+16,x(3000),axis+16,'#8d988e',1.1);
      for(const p of [0,1500,3000])T('price-tick-'+p,x(p),axis+43,String(p),{'font-size':14,'text-anchor':p===0?'start':p===3000?'end':'middle'});
      y=cap('price-unit','Purchase amount (toy units). One dot = one product record.',axis+78);
      y=cap('encoding-selected',`${r.toy.p.name}: ${r.toy.p.price} gives Purchase=${r.toy.bin}; categories ${r.toy.p.categories.join(', ')}.`,y+14,gold);
      y=cap('encoding-token-step',`Named tokens: ${r.toy.tokens.join(', ')}. Each gets its own Boolean column below.`,y+8,blue);
      const cols=s.w>460?2:1,cellW=(s.w-28)/cols,start=y+20;
      r.toy.labels.forEach((label,i)=>{const xx=14+(i%cols)*cellW,yy=start+Math.floor(i/cols)*46;s.rect('encoding-bit-'+label,xx,yy,30,30,r.toy.bits[i]?blue:'#eef0e7',{opacity:r.toy.bits[i]?.7:1});T('encoding-value-'+label,xx+15,yy+21,r.toy.bits[i]?'1':'0',{'text-anchor':'middle',fill:r.toy.bits[i]?'#fffef9':ink});T('encoding-label-'+label,xx+40,yy+21,label,{'font-size':15});});
      y=start+Math.ceil(r.toy.labels.length/cols)*46;y=cap('encoding-result','1 = True, token present. 0 = False, token absent.',y+10,blue);
    } else if(index===19) {
      const patterns=r.pythonPatterns;
      y=cap('python-scope',`${state.pythonAlgo==='apriori'?'Apriori':'FP-growth'}: current four-basket experiment, cutoff count ${r.minCount}.`,y,blue);
      y=cap('python-input-title','1. Boolean input: A Apple, B Bread, C Coke, D DVD, E Egg.',y+8,blue);
      const cellW=(s.w-82)/5,top=y+17;
      T('python-tid-header',14,top,'TID',{'font-size':15});ITEMS.forEach((item,j)=>T('python-item-header-'+j,74+cellW*(j+.5),top,CODES[item],{'text-anchor':'middle','font-size':15}));
      state.baskets.forEach((row,i)=>{const yy=top+14+i*35;T('python-input-id-'+i,14,yy+20,row.id,{'font-size':15});ITEMS.forEach((item,j)=>{const on=row.items.includes(item),xx=74+cellW*j;s.rect('python-input-cell-'+i+'-'+j,xx,yy,cellW-3,28,on?'#dce8db':'#eff0e8');T('python-input-bit-'+i+'-'+j,xx+(cellW-3)/2,yy+20,on?'1':'0',{'text-anchor':'middle','font-size':15});});});
      y=top+4*35+30;y=cap('python-input-caption','TID identifies rows and is removed from the mining input. 1 = True; 0 = False.',y);
      y=cap('python-mining-title','2. Mine the itemsets. Each bar counts matching baskets out of four.',y+12,blue);
      for(const [i,p] of [...patterns].sort((a,b)=>a.items.length-b.items.length||key(a.items).localeCompare(key(b.items))).entries()) {
        y=cap('python-pattern-'+i,`${code(p.items)}: ${p.count}/4 = ${pct(p.count/4)}`,y+5);
        s.rect('python-track-'+i,14,y,s.w-28,20,'#ecede3');s.rect('python-bar-'+i,14,y,(s.w-28)*p.count/4,20,blue,{opacity:.65});y+=36;
      }
      if(!patterns.length)y=cap('python-empty','No frequent itemset passes this cutoff.',y+20,red);
      y=cap('python-result',`3. Generate rules: ${patterns.length} frequent itemsets; ${r.pythonRules.length} rules pass confidence ${state.minConfidence}%. Read them in the table below.`,y+12,green);
    } else {
      const q=state.reviewQuestion;
      if(q===0) {
        const cohort=COHORTS.cpu;
        y=valueBar('review-joint','Joint transactions',cohort.both,cohort.n,y,green);
        y=valueBar('review-antecedent',`${cohort.x} transactions`,cohort.a,cohort.n,y,blue);
        y=valueBar('review-consequent',`${cohort.y} transactions`,cohort.b,cohort.n,y,purple);
        y=cap('review-population',`Full track = all ${cohort.n.toLocaleString()} transactions.`,y);
      } else if(q===2) {
        const cohort=COHORTS.burger,m=measureCounts(cohort);
        y=proportion('review-baseline',`Ketchup in all records: ${cohort.b}/${cohort.n}`,cohort.b/cohort.n,y,purple);
        y=proportion('review-conditional',`Ketchup among burger records: ${cohort.both}/${cohort.a}`,m.confidence,y+12,green);
        y=cap('review-lift',`Lift = ${pct(m.confidence)} / ${pct(cohort.b/cohort.n)} = ${fmt(m.lift,2)}.`,y+8,gold);
        y=cap('review-count-evidence',`Both: ${cohort.both}; burger: ${cohort.a}; ketchup: ${cohort.b}; all records: ${cohort.n}.`,y+12);
      } else if(q===1) {
        const rows=[{id:10,items:['A','B','C']},{id:20,items:['B','C','D']},{id:30,items:['A','C']}];
        y=slots('review-A','A baskets',y,rows,row=>row.items.includes('A'),blue);
        y=slots('review-B','B baskets',y+16,rows,row=>row.items.includes('B'),blue);
        y=slots('review-C','C baskets',y+16,rows,row=>row.items.includes('C'),green);
      } else {
        y=valueBar('review-before','Parent sum = 50 (fails bound 35)',50,100,y,red);
        y=valueBar('review-after','Add value −30: sum becomes 20',20,100,y,green);
        y=cap('negative-warning','This constructed negative extension violates the nonnegative assumption.',y,gold);
      }
    }
    end(y);
  }
  function measureCounts(c){return {support:c.both/c.n,confidence:c.both/c.a,lift:c.both*c.n/(c.a*c.b)};}
  function table(headers,rows) {return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${esc(cell)}</th>`:`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
  function receipt() {
    if(index===0)return table(['Column','Presence'],ITEMS.map(item=>[`${CODES[item]} = ${item}`,state.baskets[state.basket].items.includes(item)?'1 / True':'0 / False']));
    if(index===1)return table(['Group','Basket count'],[['X: '+names(r.rule.x),r.main.a],['Y: '+names(r.rule.y),r.main.b],['All items on both sides',r.main.both]]);
    if(index===2)return table(['Quantity','Exact calculation'],[['Joint matches',r.main.both],['All transactions',r.main.n],['Support',`${r.main.both}/${r.main.n} = ${pct(r.main.support)}`]]);
    if(index===3)return table(['Quantity','Exact calculation'],[['Joint successes',r.main.both],['X baskets',r.main.a],['Confidence',`${r.main.both}/${r.main.a} = ${pct(r.main.confidence)}`]]);
    if(index===4)return table(['Quantity','Exact calculation'],[['Joint count',`${r.main.both} baskets`],['Support',`${r.main.both}/${r.main.n} = ${pct(r.main.support)}`],['Forward confidence',`${r.main.both}/${r.main.a} = ${pct(r.main.confidence)}`],['Reverse confidence',`${r.main.both}/${r.main.b} = ${pct(r.main.reverse)}`]]);
    if(index===12)return table(['ID set','Members / calculation'],[['X: '+names(r.rule.x),state.baskets.filter(row=>subset(r.rule.x,row.items)).map(row=>row.id).join(', ')||'Empty'],['Y: '+names(r.rule.y),state.baskets.filter(row=>subset(r.rule.y,row.items)).map(row=>row.id).join(', ')||'Empty'],['Intersection count',r.main.both],['Support',`${r.main.both}/${r.main.n} = ${pct(r.main.support)}`]]);
    if(index===5)return table(['Source quantity','Count'],[['All transactions N',r.cohort.n],['X: '+r.cohort.x,r.cohort.a],['Y: '+r.cohort.y,r.cohort.b],['Current joint count',state.joint],['Source joint count',r.cohort.both],['Expected if independent',fmt(r.comparison.expected,2)]]);
    if([6,19].includes(index)){const rules=index===19?r.pythonRules:r.rules;return rules.length?table(['Rules passing both thresholds','Confidence / lift'],rules.map(rule=>[`${names(rule.x)} → ${names(rule.y)}`,`${pct(rule.confidence)} / ${fmt(rule.lift,2)}`])):'<p>No rule passes both current thresholds. Try a lower cutoff or inspect the basket data.</p>';}
    if(index===7)return table(['Set / immediate subset','Count / cutoff'],[state.set,...state.set.map((_,i)=>state.set.filter((_,j)=>i!==j))].map(xs=>[names(xs),`${count(state.baskets,xs)} / ${r.minCount}`]));
    if(index===8){const level=r.mined.levels.find(l=>l.k===state.level);return table(['Candidate','Count','Decision'],(level?.candidates||[]).map(p=>[code(p.items),p.count===null?'Not counted':p.count,p.pruned?'Pruned':p.count>=r.minCount?'Frequent':'Below support']));}
    if(index===9)return table(['Candidate split','Confidence','Passes both?'],r.splits.map(rule=>[`${names(rule.x)} → ${names(rule.y)}`,`${rule.both}/${rule.a} = ${pct(rule.confidence)}`,rule.support>=state.minSupport/100&&rule.confidence>=r.minConf?'Yes':'No']));
    if(index===10)return table(['Source header item','Global count'],r.fp.full.order.map(x=>[x,r.fp.full.totals.get(x)]));
    if(index===11)return table(['Conditional item','Weighted count','Keep ≥ 3?'],[...r.fp.conditional.totals].map(([item,n])=>[item,n,n>=3?'Yes':'No']))+table(['Pattern from this projection','Support count'],r.fp.patterns.map(p=>[p.items.join(''),p.count]));
    if(index===13)return table(['Frequent set','Count','Closed / maximal'],r.classified.map(p=>[p.items.join(''),p.count,`${p.closed?'Yes':'No'} / ${p.maximal?'Yes':'No'}`]));
    if(index===14)return table(['Main measure','Exact calculation'],[['Support',`${r.nullMetrics.both}/${r.nullMetrics.n} = ${pct(r.nullMetrics.support)}`],['Y given X',`${r.nullMetrics.both}/${r.nullMetrics.a} = ${pct(r.nullMetrics.confidence)}`],['X given Y',`${r.nullMetrics.both}/${r.nullMetrics.b} = ${pct(r.nullMetrics.reverse)}`],['Lift',fmt(r.nullMetrics.lift,3)]])+`<details id="other-overlap-measures"><summary>Other overlap measures · optional</summary><p>Let c₁ and c₂ be the two confidences. All-confidence takes their smaller value; max-confidence takes the larger. Kulczynski averages them. Cosine is √(c₁c₂). IR compares marginal count imbalance with the count containing at least one side. These scores stay fixed when only neither rows are added.</p>${table(['Measure','Current value'],[['All-confidence',fmt(r.nullMetrics.allConfidence,3)],['Max-confidence',fmt(r.nullMetrics.maxConfidence,3)],['Kulczynski',fmt(r.nullMetrics.kulc,3)],['Cosine',fmt(r.nullMetrics.cosine,3)],['Imbalance ratio',fmt(r.nullMetrics.ir,3)]])}</details>`;
    if(index===15)return table(['Cell','Observed / expected','(O−E)²/E'],['Both','X only','Y only','Neither'].map((label,i)=>[label,`${r.chi.observed[i]} / ${fmt(r.chi.expectations[i],2)}`,fmt(r.chi.contributions[i],2)]));
    if(index===16)return table(['Item','Nonnegative value'],Object.entries(r.budget.prices));
    if(index===17)return table(['Category','Support / cutoff'],[['Milk',`10% / 5%`],['2% milk',`6% / ${state.childMin}%`],['Skim milk',`4% / ${state.childMin}%`]]);
    if(index===18)return table(['Selected record','Encoded meaning'],[['Purchase',`${r.toy.p.price}: ${r.toy.bin}`],['Category tokens',r.toy.p.categories.map(n=>`Cat=${n}`).join(', ')],['All present tokens',r.toy.tokens.join(', ')],['Quantile cuts',r.toy.cuts.join(', ')]]);
    const answer=reviewAnswers[state.reviewQuestion],q=REVIEW[state.reviewQuestion];
    return `<p class="inspection">${answer===undefined?'Choose an answer to see its worked explanation.':esc(q.why)}</p>`;
  }
  function update(animate=true) {
    r=compute(state);
    for(const group of host.querySelectorAll('[data-for]'))group.hidden=!group.dataset.for.split(',').map(Number).includes(index);
    const candidate=host.querySelector('#candidate-choice'),level=r.mined.levels.find(l=>l.k===state.level),candidates=level?.candidates||[],candidateKeys=candidates.map(p=>key(p.items)).join(',');
    if(candidate.dataset.keys!==candidateKeys){candidate.innerHTML=candidates.length?candidates.map(p=>`<option value="${key(p.items)}">${code(p.items)}${p.pruned?' — pruned':''}</option>`).join(''):'<option value="">No joined candidate</option>';candidate.dataset.keys=candidateKeys;}
    if(!candidates.some(p=>key(p.items)===state.candidate))state.candidate=key(candidates[0]?.items||[]);candidate.disabled=!candidates.length;
    const fieldValues={
      'basket-index':state.basket+1,'rule-choice':state.rule,'minimum-support':state.minSupport,'minimum-confidence':state.minConfidence,'itemset-choice':key(state.set),'candidate-level':state.level,'candidate-choice':state.candidate,'rule-split':state.split+1,'fp-step':state.fpStep,'suffix-choice':state.suffix,'cohort-choice':state.cohort,'joint-count':state.joint,'chi-cohort-choice':state.chiCohort,'chi-joint-count':state.chiJoint,'quiz-minimum':state.quizMin,'pattern-family':state.family,'null-rows':state.nulls,'y-only':state.bOnly,'constraint-type':state.constraintType,'constraint-bound':state.cap,'constraint-parent':state.constraintSet,'child-support':state.childMin,'product-row':state.toyRow+1,'python-algorithm':state.pythonAlgo,'revision-question':state.reviewQuestion,
    };
    const joint=host.querySelector('#joint-count');joint.min=Math.max(0,r.cohort.a+r.cohort.b-r.cohort.n);joint.max=Math.min(r.cohort.a,r.cohort.b);
    const chiJoint=host.querySelector('#chi-joint-count');chiJoint.min=Math.max(0,r.chiCohort.a+r.chiCohort.b-r.chiCohort.n);chiJoint.max=Math.min(r.chiCohort.a,r.chiCohort.b);
    const split=host.querySelector('#rule-split');split.max=Math.max(1,r.splits.length);state.split=Math.min(state.split,Math.max(0,r.splits.length-1));fieldValues['rule-split']=state.split+1;
    for(const [id,value] of Object.entries(fieldValues)) {const input=host.querySelector('#'+id);if(input.value!==String(value))input.value=value;setText(id+'-value',value);}
    for(const id of ['minimum-support','minimum-confidence','child-support'])setText(id+'-value',fieldValues[id]+'%');
    for(const c of host.querySelectorAll('[data-item]'))c.checked=state.baskets[state.basket].items.includes(c.dataset.item);
    host.querySelector('#encode-absence').checked=state.absence;
    const pattern=host.querySelector('#pattern-focus'),options=r.classified.filter(p=>state.family==='all'||p[state.family]);
    if(options.map(p=>key(p.items)).join(',')!==pattern.dataset.keys){pattern.innerHTML=options.map(p=>`<option value="${key(p.items)}">${p.items.join('')}: count ${p.count}</option>`).join('');pattern.dataset.keys=options.map(p=>key(p.items)).join(',');}
    if(!options.some(p=>key(p.items)===state.quizFocus))state.quizFocus=key(options[0]?.items||[]);pattern.value=state.quizFocus;
    setText('scene-kicker',notes[index]);
    const legends=[
      [[blue,'Letters = products'],[gold,'Selected basket']],[[blue,'1 = contains this side'],[green,'Both sides present']],[[green,'Contains all required items'],[neutral,'Does not match']],[[blue,'Contains X'],[green,'Contains X and Y']],[[green,'Contains both sides'],[neutral,'Qualifies, but other side absent']],[[blue,'Overall baseline / expected'],[green,'Conditional / observed']],[[green,'Passes both'],[red,'Fails confidence'],['#909c89','Fails support'],[gold,'Thresholds']],[[blue,'Subset passes support'],[red,'Subset fails'],[gold,'Complete set']],[[blue,'Frequent parents'],[gold,'Joined candidate'],[green,'Pass / matching basket'],[red,'Reject or prune']],[[blue,'Antecedent item chips'],[green,'Consequent items / successful baskets'],[neutral,'Antecedent without consequent']],[[blue,'Kept raw items / stored prefixes'],['#838c7d','Crossed = removed'],[gold,'Latest ordered path']],[[gold,'Traced suffix path / prefix weight'],[blue,'Conditional tree'],[red,'Removed by conditional support']],[[blue,'ID in one side only'],[green,'ID in both sides'],[neutral,'Absent ID']],[[blue,'Blue outline = closed'],[green,'Green fill = maximal'],[gold,'Inspected pattern']],[[green,'Both sides'],[blue,'X only / X conditioning'],[purple,'Y only / Y conditioning'],[gold,'Blank circle = neither']],[[blue,'Observed count'],['#909f8e','Expected count'],[gold,'Squared contribution']],[[blue,'Parent item values'],[gold,'Added item / dashed bound'],[green,'Pass'],[red,'Fail']],[[blue,'2% milk'],[purple,'Skim milk'],[gold,'Support cutoff']],[[blue,'Low / present token'],[green,'Medium'],[purple,'High'],[gold,'Selected row']],[[blue,'Input items / exact support count'],[green,'True cell / passing rule']],[[green,'Joint or resulting amount'],[blue,'Antecedent'],[purple,'Consequent']],
    ];
    const revisionLegends=[
      [[green,'Joint transactions'],[blue,'CPU transactions'],[purple,'GPU transactions']],
      [[blue,'Contains A or B in its row'],[green,'Contains C'],[neutral,'Item absent']],
      [[purple,'Ketchup baseline'],[green,'Ketchup given burger']],
      [[red,'Fails upper bound'],[green,'Passes upper bound']],
    ];
    const legend=index===20?revisionLegends[state.reviewQuestion]:legends[index];
    host.querySelector('#scene-legend').innerHTML=legend.map(([c,t])=>`<span style="--legend:${c}">${esc(t)}</span>`).join('');
    let metrics;
    if(index===4)metrics=[['Support',pct(r.main.support)],['Forward confidence',pct(r.main.confidence)],['Reverse confidence',pct(r.main.reverse)]];
    else if(index===12)metrics=[['X IDs',r.main.a],['Y IDs',r.main.b],['Shared IDs',r.main.both]];
    else if(index===0)metrics=[['Baskets',state.baskets.length],['Selected TID',state.baskets[state.basket].id],['Items present',state.baskets[state.basket].items.length]];
    else if(index===1)metrics=[['X baskets',r.main.a],['Y baskets',r.main.b],['Both sides',r.main.both]];
    else if(index===2)metrics=[['Joint matches',r.main.both],['All baskets N',r.main.n],['Support',pct(r.main.support)]];
    else if(index===3)metrics=[['Joint successes',r.main.both],['X baskets',r.main.a],['Confidence',pct(r.main.confidence)]];
    else if(index===5)metrics=[['Joint count',r.comparison.both],['Confidence',pct(r.comparison.confidence)],['Lift',fmt(r.comparison.lift,2)]];
    else if(index===15)metrics=[['Observed joint',r.chi.both],['Expected joint',r.chi.expected],['Pearson χ²',fmt(r.chi.chi2,2)]];
    else if(index===6)metrics=[['Minimum count',r.minCount],['Frequent itemsets',r.mined.frequent.length],['Strong rules',r.rules.length]];
    else if(index===7)metrics=[['Selected count',count(state.baskets,state.set)],['Minimum count',r.minCount],['Immediate subsets',state.set.length]];
    else if(index===8)metrics=[['Joined candidates',candidates.length],['Pruned before scan',candidates.filter(p=>p.pruned).length],['Kept frequent',level?.frequent.length||0]];
    else if(index===9)metrics=[['Possible splits',r.splits.length],['Itemset count',count(state.baskets,state.set)],['Confidence cutoff',state.minConfidence+'%']];
    else if(index===19)metrics=[['Minimum count',r.minCount],['Frequent itemsets',r.pythonPatterns.length],['Strong rules',r.pythonRules.length]];
    else if(index===13)metrics=[['Frequent',r.classified.length],['Closed',r.classified.filter(p=>p.closed).length],['Maximal',r.classified.filter(p=>p.maximal).length]];
    else if(index===14)metrics=[['All rows N',r.nullMetrics.n],['Support',pct(r.nullMetrics.support)],['Lift',fmt(r.nullMetrics.lift,2)]];
    const statsBox=host.querySelector('.lab-stats');statsBox.hidden=!metrics;
    if(metrics)for(let i=0;i<3;i++){statsBox.children[i].querySelector('small').textContent=metrics[i][0];statsBox.children[i].querySelector('strong').textContent=metrics[i][1];}
    const revision=host.querySelector('.revision-choices');revision.hidden=index!==20;
    for(const q of revision.querySelectorAll('[data-review]'))q.hidden=+q.dataset.review!==state.reviewQuestion;
    const answer=reviewAnswers[state.reviewQuestion];setText('revision-feedback',answer===undefined?'':`${answer===REVIEW[state.reviewQuestion].correct?'Yes.':'Check the denominator or assumption.'} ${REVIEW[state.reviewQuestion].why}`);
    for(const b of revision.querySelectorAll('[data-review-answer]')){const [q,a]=b.dataset.reviewAnswer.split(':').map(Number);b.dataset.chosen=String(reviewAnswers[q]===a);}
    const liveReceipt=host.querySelector('#live-receipt'),openDetails=[...liveReceipt.querySelectorAll('details[open][id]')].map(d=>d.id);liveReceipt.innerHTML=receipt();for(const id of openDetails){const detail=liveReceipt.querySelector('#'+id);if(detail)detail.open=true;}
    const source=index===15?r.chiCohort:r.cohort;
    setText('scope-note',[5,15].includes(index)?`${source.source}. Slider edits are hypothetical; source joint count is ${source.both}.`:[10,11].includes(index)?'Lecture FP-tree: five source transactions, fixed minimum count 3.':'Exact small-data computations. Printed reading examples retain their source values. Reset restores the source defaults.');
    if(animate&&tween.current.reveal)tween.current.reveal=.65;
    tween.to({support:r.main.support,confidence:r.main.confidence??0,minSupport:state.minSupport/100,minConfidence:state.minConfidence/100,baseline:r.comparison.baseline,cohortConfidence:r.comparison.confidence??0,joint:state.joint,chiJoint:state.chiJoint,nullSupport:r.nullMetrics.support,nullForward:r.nullMetrics.confidence??0,nullReverse:r.nullMetrics.reverse??0,reveal:1},animate,280);
  }
  const fields={
    'basket-index':v=>state.basket=+v-1,'rule-choice':v=>state.rule=+v,'minimum-support':v=>state.minSupport=+v,'minimum-confidence':v=>state.minConfidence=+v,'itemset-choice':v=>{state.set=v.split('|');state.split=0;},'candidate-level':v=>state.level=+v,'candidate-choice':v=>state.candidate=v,'rule-split':v=>state.split=+v-1,'fp-step':v=>state.fpStep=+v,'suffix-choice':v=>state.suffix=v,'cohort-choice':v=>{state.cohort=v;state.joint=COHORTS[v].both;},'joint-count':v=>state.joint=+v,'chi-cohort-choice':v=>{state.chiCohort=v;state.chiJoint=COHORTS[v].both;},'chi-joint-count':v=>state.chiJoint=+v,'quiz-minimum':v=>state.quizMin=+v,'pattern-family':v=>state.family=v,'pattern-focus':v=>state.quizFocus=v,'null-rows':v=>state.nulls=+v,'y-only':v=>state.bOnly=+v,'constraint-type':v=>state.constraintType=v,'constraint-bound':v=>state.cap=+v,'constraint-parent':v=>state.constraintSet=v,'child-support':v=>state.childMin=+v,'product-row':v=>state.toyRow=+v-1,'python-algorithm':v=>state.pythonAlgo=v,'revision-question':v=>state.reviewQuestion=+v,
  };
  for(const [id,fn] of Object.entries(fields)) {const input=host.querySelector('#'+id);input.addEventListener('input',()=>{fn(input.value);update(!['cohort-choice','chi-cohort-choice'].includes(id));});input.addEventListener('change',()=>announce(host.querySelector('#live-receipt').textContent.trim().slice(0,250)));}
  host.querySelector('#encode-absence').addEventListener('change',e=>{state.absence=e.target.checked;update();});
  for(const c of host.querySelectorAll('[data-item]'))c.addEventListener('change',()=>{const row=state.baskets[state.basket];row.items=c.checked?union(row.items,[c.dataset.item]):row.items.filter(x=>x!==c.dataset.item);update();announce(`Basket ${row.id} now contains ${row.items.join(', ')||'no products'}.`);});
  for(const b of host.querySelectorAll('[data-review-answer]'))b.addEventListener('click',()=>{const [q,a]=b.dataset.reviewAnswer.split(':').map(Number);reviewAnswers[q]=a;update();});
  s.onAction=action=>{if(action.startsWith('product:')){state.toyRow=+action.split(':')[1];update();}else if(action.startsWith('pattern:')){state.quizFocus=action.slice(8);update();}};
  update(false);
  return {stage(i){index=i;update(false);},resize(){tween.finish();update(false);},reset(){state=initialState();reviewAnswers={};update();announce('Restored all source defaults. Reading section unchanged.');},pause(){tween.finish();},get scene(){return scenes[index];},get state(){return structuredClone(state);},get result(){return r;},tween};
}
