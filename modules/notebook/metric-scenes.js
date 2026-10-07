import { fmt, palette, pathFrom } from './ui.js';
import { caption, frame, dot, line } from './spatial.js';
import { normalPDF } from './science.js';
import { illustrativeCounts } from './decision-counts.js';

const cap=(s,k,t,y=23,c)=>caption(s,'metric-'+k,t,y,c);
const finish=(s,y)=>{s.h=Math.max(310,y+18);s.svg.setAttribute('viewBox',`0 0 ${s.w} ${s.h}`);};
const share=(n,total)=>total?`${fmt(100*n/total,1)}%`:'Undefined (no denominator cases)';
function pool(s,P,key,label,a,b,y,colors) {
  const n=a+b;y=cap(s,key+'-name',`${label}: ${fmt(n,0)} cases`,y);
  s.rect('metric-'+key+'-track',14,y+4,s.w-28,28,'#e8ebdf');
  const p=P('metric-'+key+'-share',n?(s.w-28)*a/n:0,y+4);
  s.rect('metric-'+key+'-first',14,y+4,p[0],28,colors[0],{opacity:.7,rx:0});
  s.rect('metric-'+key+'-second',14+p[0],y+4,n?(s.w-28)-p[0]:0,28,colors[1],{opacity:.65,rx:0});
  return y+58;
}
export function imbalanceScene(s,P,c,index,prevalence,threshold) {
  const pos=c.tp+c.fn,neg=c.fp+c.tn,alerts=c.tp+c.fp,n=pos+neg;let y=23;
  y=cap(s,'imb-scope',`Illustrative population: ${fmt(n,0)} cases; prevalence ${fmt(prevalence,0)}%; threshold ${fmt(threshold,2)}.`,y);
  if(index===0) {
    y=cap(s,'imb-population-key','One tile = 100 cases. Gold tiles are actual positives; blue tiles are actual negatives.',y+10);
    const columns=Math.max(5,Math.floor((s.w-28)/24)),gap=(s.w-28)/columns;
    for(let i=0;i<100;i++)s.rect('metric-population-tile-'+i,14+i%columns*gap,y+Math.floor(i/columns)*24,gap-4,20,i<prevalence?palette[3]:palette[0],{opacity:.65,rx:2});
    y+=Math.ceil(100/columns)*24+23;
    y=cap(s,'imb-population-positive',`Actual positives: ${fmt(pos,0)} / ${fmt(n,0)} = ${fmt(prevalence,0)}%`,y,palette[3]);
    y=cap(s,'imb-population-negative',`Actual negatives: ${fmt(neg,0)}. Start with the actual labels, then inspect decisions.`,y+9,palette[0]);
    y=cap(s,'imb-population-note','Changing the threshold changes decisions, not these actual-label pools.',y+9);
    finish(s,y);return;
  }
  if(index===1) {
    y=cap(s,'imb-lazy',`Predict negative for everyone: ${fmt(neg,0)} correct out of ${fmt(n,0)}.`,y+16);
    y=pool(s,P,'lazy','Majority-only accuracy',neg,pos,y+8,[palette[0],palette[3]]);
    y=cap(s,'imb-lazy-rate',`Accuracy ${share(neg,n)}, but recall 0%: every actual positive is missed.`,y+7,palette[3]);
    y=pool(s,P,'alerts','Current model alerts',c.tp,c.fp,y+18,[palette[2],palette[1]]);
    y=cap(s,'imb-alert-meaning',`${c.tp} real positives + ${c.fp} false alerts = ${alerts}. Precision = ${c.tp}/${alerts} = ${share(c.tp,alerts)}.`,y+8);
    y=cap(s,'imb-two-questions','Accuracy asks about every case. Precision asks about alerts.',y+12);
    finish(s,y);return;
  }
  if(index===5) {
    y=cap(s,'imb-curve-fixed',`Keep threshold ${fmt(threshold,2)} fixed. Change prevalence and inspect genuine alerts.`,y+12);
    const values=Array.from({length:40},(_,i)=>{const c=illustrativeCounts(i+1,threshold);return {prevalence:i+1,precision:c.tp+c.fp?c.tp/(c.tp+c.fp):null};});
    if(values[0].precision==null)y=cap(s,'imb-no-alert-curve','No alerts at this threshold: precision is undefined at every prevalence.',y+24,palette[1]);
    else {
      const a=frame(s,'imb-prevalence',{x:49,y:y+20,w:s.w-68,h:200},[1,40],[0,100],['Actual positives (%)','Genuine alerts (%)']);
      line(s,P,'metric-imb-prevalence-curve',values.map(v=>[a.x(v.prevalence),a.y(v.precision*100)]),palette[2],2.3);
      s.circle('metric-imb-prevalence-point',a.x(prevalence),a.y(100*c.tp/alerts),6,palette[3]);
      y=a.b+65;
    }
    y=cap(s,'imb-prevalence-receipt',`Current alert pool: ${c.tp} genuine + ${c.fp} false. Precision ${share(c.tp,alerts)}.`,y+9,palette[2]);
    y=cap(s,'imb-prevalence-limits','This rate model holds sensitivity and false-alarm rate fixed at a chosen threshold. Real populations may also change those rates.',y+9);
    finish(s,y);return;
  }
  if(index===6) {
    for(const [i,text] of ['1. Learn preparation and model on training rows.','2. Choose and lock the decision threshold during development.','3. Apply the locked procedure to an independent final sample.','4. Count outcomes and report their denominators.'].entries()) {
      y=cap(s,'imb-lock-'+i,text,y+17,i===1?palette[3]:palette[0]);
      if(i<3){s.line('metric-imb-workflow-arrow-'+i,25,y,25,y+17,palette[2],2);y+=21;}
    }
    y=cap(s,'imb-workflow-status','The live 10,000-case scenario remains illustrative development evidence. It has no revealed final-test sample.',y+15);
    finish(s,y);return;
  }
  if(index===7) {
    y=cap(s,'imb-report-counts',`Counts: ${c.tp} found positives, ${c.fn} misses, ${c.fp} false alerts, ${c.tn} correct negatives.`,y+12);
    for(const [i,[name,a,b,color]] of [['Recall',c.tp,pos,palette[3]],['Precision',c.tp,alerts,palette[2]],['Accuracy',c.tp+c.tn,n,palette[0]]].entries()) {
      y=cap(s,'imb-report-fraction-'+i,`${name}: ${a} / ${fmt(b,0)} = ${share(a,b)}`,y+20,color);
      y=cap(s,'imb-report-denominator-'+i,['Denominator: all actual positives.','Denominator: every alert, including false alerts.','Denominator: every case in the population.'][i],y+5);
    }
    y=cap(s,'imb-report-scope','Report prevalence, threshold, and the population role beside these scores.',y+18);
    finish(s,y);return;
  }
  y=pool(s,P,'positives','Actual positives',c.tp,c.fn,y+8,[palette[2],palette[3]]);
  y=cap(s,'positive-counts',`${c.tp} found positives (TP) + ${c.fn} misses (FN) = ${pos}`,y,palette[2]);
  y=pool(s,P,'negatives','Actual negatives',c.fp,c.tn,y+15,[palette[1],palette[0]]);
  y=cap(s,'negative-counts',`${c.fp} false alerts (FP) + ${c.tn} correct negatives (TN) = ${neg}`,y,palette[0]);
  y=cap(s,'scales','Each pool fills its own track; track lengths do not compare pool sizes.',y+9);
  y=pool(s,P,'alerts','Alerts',c.tp,c.fp,y+16,[palette[2],palette[1]]);
  y=cap(s,'alert-counts',`${c.tp} real positives + ${c.fp} false alerts = ${alerts}`,y);
  const fractions=[['Recall',c.tp,pos,palette[3]],['Precision',c.tp,alerts,palette[2]],['Accuracy',c.tp+c.tn,n,palette[0]]];
  for(const [i,[name,a,b,color]] of fractions.entries()) {
    y=cap(s,'fraction-'+i,`${name} = ${name==='Accuracy'?`(${c.tp}+${c.tn})`:a} / ${b} = ${share(a,b)}`,y+14,color);
    s.rect('metric-fraction-track-'+i,14,y,s.w-28,14,'#e8ebdf');
    s.rect('metric-fraction-fill-'+i,14,y,b?(s.w-28)*a/b:0,14,color,{opacity:.55,rx:0});y+=32;
  }
  y=cap(s,'imb-eval','Illustrative rate scenario; not a locked final-test result.',y+12);
  finish(s,y);
}
export function knnDistanceScene(s,P,d,q,k,scaled) {
  const fit=d.fit,near=fit.neighbors(q),first=near[0],rows=d.split.train;
  const tx=r=>r.x/fit.sx,tz=r=>r.z/fit.sz,dx=(first.x-q.x)/fit.sx,dz=(first.z-q.z)/fit.sz;
  let y=cap(s,'distance-scope',`Distance coordinates: ${scaled?'training SD-scaled':'raw'}. Closest row: ${first.id}.`,23);
  const xs=[...rows.map(tx),tx(q)],zs=[...rows.map(tz),tz(q)],lo=Math.min(...xs,...zs)-.25,hi=Math.max(...xs,...zs)+.25;
  const size=Math.min(s.w-74,250),a=frame(s,'distance-map',{x:49,y:y+21,w:size,h:size},[lo,hi],[lo,hi],[scaled?'x / training SD':'Input x',scaled?'z / training SD':'Input z']);
  rows.forEach(r=>dot(s,P,'metric-distance-point-'+r.id,a.x(tx(r)),a.y(tz(r)),r.y,near.some(n=>n.id===r.id),r.id));
  const x1=a.x(tx(q)),y1=a.y(tz(q)),x2=a.x(tx(first)),y2=a.y(tz(first));
  s.line('metric-distance-horizontal',x1,y1,x2,y1,palette[3],2,'4 3');
  s.line('metric-distance-vertical',x2,y1,x2,y2,palette[3],2,'4 3');
  s.line('metric-distance-hypotenuse',x1,y1,x2,y2,palette[2],2.3);
  s.circle('metric-distance-query',x1,y1,6,palette[3]);
  y=a.b+68;
  const side=s.w>=580,zoomTop=side?a.t:y+20,sizeZoom=side?170:Math.min(190,s.w-74),leftZoom=side?s.w-210:49;
  const magnitude=Math.max(Math.abs(dx),Math.abs(dz),.01),dl=Math.min(0,dx,dz)-magnitude*.2,dh=Math.max(0,dx,dz)+magnitude*.2;
  if(!side)y=cap(s,'distance-zoom-key','Distance detail: zoomed, with equal axis scales.',y);
  else s.text('metric-distance-zoom-heading',leftZoom,zoomTop-10,'Zoomed gaps',{'font-size':14});
  const z=frame(s,'distance-zoom',{x:leftZoom,y:side?zoomTop:y+18,w:sizeZoom,h:sizeZoom},[dl,dh],[dl,dh],[],false);
  s.line('metric-distance-zoom-x',z.x(0),z.y(0),z.x(dx),z.y(0),palette[3],2,'4 3');
  s.line('metric-distance-zoom-z',z.x(dx),z.y(0),z.x(dx),z.y(dz),palette[3],2,'4 3');
  s.line('metric-distance-zoom-d',z.x(0),z.y(0),z.x(dx),z.y(dz),palette[2],2.4);
  s.circle('metric-distance-zoom-query',z.x(0),z.y(0),5,palette[3]);
  s.circle('metric-distance-zoom-row',z.x(dx),z.y(dz),5,palette[first.y]);
  if(side){s.text('metric-distance-zoom-legend',leftZoom,z.b+23,'Equal axis scales',{'font-size':14});}
  else y=z.b+32;
  y=cap(s,'distance-zoom-description','Gold: query. Colored endpoint: closest row. Green diagonal: distance. The detail is zoomed; numbers use the original distance coordinates.',y);
  y=cap(s,'distance-dx',`Δx = ${fmt(dx,3)}; Δz = ${fmt(dz,3)}`,y,palette[3]);
  y=cap(s,'distance-formula',`Distance = √((${fmt(dx,3)})² + (${fmt(dz,3)})²) = ${fmt(first.distance,3)}`,y+9,palette[2]);
  y=cap(s,'distance-ranked',`Nearest first; K = ${k}. The ranked receipt lists every selected row.`,y+9);
  y=cap(s,'distance-scale','Training-only scaling; original observations stay unchanged.',y+9);
  finish(s,y);
}
export function encodingScene(s,P,encoding) {
  let y=cap(s,'encode-mode',encoding==='onehot'?'Saved category indicators':'Ordinal codes assume an order and numerical distances.');
  const columns=encoding==='onehot'?['Red','Blue','Green','New?']:['Code'];
  const rows=encoding==='onehot'?[['Red',1,0,0,0],['Blue',0,1,0,0],['Green',0,0,1,0],['Purple',0,0,0,1]]:[['Red',0],['Blue',1],['Green',2],['Purple','?']];
  const left=82,width=(s.w-left-14)/columns.length,top=y+18;
  s.text('metric-encode-category',14,top,'Category',{'font-size':14});
  columns.forEach((c,j)=>s.text('metric-encode-heading-'+j,left+width*(j+.5),top,c,{'text-anchor':'middle','font-size':14}));
  rows.forEach((r,i)=>{
    const yy=top+20+i*54;
    s.text('metric-encode-row-'+i,14,yy+24,r[0],{'font-size':16});
    r.slice(1).forEach((v,j)=>{
      const p=P('metric-encode-cell-'+i+'-'+j,left+j*width,yy);
      s.rect('metric-encode-cell-'+i+'-'+j,...p,Math.max(20,width-4),34,v===1?palette[2]+'45':'#eceee4');
      s.text('metric-encode-value-'+i+'-'+j,p[0]+(width-4)/2,p[1]+24,String(v),{'text-anchor':'middle','font-size':18});
    });
  });
  y=top+rows.length*54+35;
  y=cap(s,'encode-unknown',encoding==='onehot'?'New? = 1 when the category was absent from training. Purple is unknown, rather than a fourth known category.':'Unknown category: no saved ordinal code. The ? is handled by a stated fallback policy.',y);
  finish(s,y);
}
export function powerScene(s,P,d,st) {
  const critical=1.9599639845*d.se,lo=Math.min(-4.5*d.se,st.alternative-4.5*d.se),hi=Math.max(4.5*d.se,st.alternative+4.5*d.se),max=normalPDF(0,0,d.se)*1.12;
  let y=23;
  const intervals=[[lo,-critical],[-critical,critical],[critical,hi]];
  for(const [j,mu] of [0,st.alternative].entries()) {
    y=cap(s,'power-title-'+j,j?`Planned truth: effect ${fmt(mu,2)}`:'Null truth: effect 0',y,palette[j]);
    const a=frame(s,'power-panel-'+j,{x:49,y:y+20,w:s.w-68,h:125},[lo,hi],[0,max],['Estimated effect','Sampling density']);
    intervals.forEach(([l,r],part)=>{
      if(!j&&part===1)return;
      const coords=Array.from({length:81},(_,i)=>{const v=l+(r-l)*i/80;return [a.x(v),a.y(normalPDF(v,mu,d.se))];});
      const color=j?(part===1?palette[3]:palette[2]):palette[0];
      s.path('metric-power-area-'+j+'-'+part,pathFrom([[a.x(l),a.b],...coords,[a.x(r),a.b]])+' Z','none',0,color,{opacity:.23});
    });
    const curve=Array.from({length:161},(_,i)=>{const x=lo+(hi-lo)*i/160;return [a.x(x),a.y(normalPDF(x,mu,d.se))];});
    line(s,P,'metric-power-curve-'+j,curve,palette[j],2);
    for(const sign of [-1,1])s.line('metric-power-critical-'+j+'-'+sign,a.x(sign*critical),a.t,a.x(sign*critical),a.b,palette[3],1.5,'4 3');
    y=a.b+63;
    y=cap(s,'power-area-label-'+j,j?`Power: reject under this alternative = ${fmt(d.power*100,1)}%. Missed detection β = ${fmt((1-d.power)*100,1)}%.`:'Two-sided false-alarm probability α = 5%: both shaded tails together.',y,j?palette[2]:palette[0]);
    y+=22;
  }
  y=cap(s,'power-critical-value',`Same rejection boundaries: ±${fmt(critical,3)}. Independent normal observations; known population SD.`,y);
  y=cap(s,'power-interpretation','These are planned sampling probabilities, not the probability a hypothesis is true.',y+9);
  finish(s,y);
}
export function correlationAreaScene(s,P,d,selected) {
  const rows=d.rows,row=rows[selected-1]||rows[0],dx=row.x-d.mx,dy=row.y-d.my,product=dx*dy;
  let y=cap(s,'corr-sign',product>=0?'Matching signs: positive product':'Opposite signs: negative product',23,product>=0?palette[2]:palette[1]);
  const xs=rows.map(r=>r.x),ys=rows.map(r=>r.y),pad=(a)=>{const lo=Math.min(...a),hi=Math.max(...a),p=(hi-lo||1)*.12;return [lo-p,hi+p];};
  const a=frame(s,'corr-area',{x:49,y:y+20,w:s.w-68,h:220},pad(xs),pad(ys),['Input x','Outcome y']);
  s.rect('metric-corr-product-area',Math.min(a.x(row.x),a.x(d.mx)),Math.min(a.y(row.y),a.y(d.my)),Math.abs(a.x(row.x)-a.x(d.mx)),Math.abs(a.y(row.y)-a.y(d.my)),product>=0?palette[2]:palette[1],{opacity:.18,rx:0});
  s.line('metric-corr-mean-x',a.x(d.mx),a.t,a.x(d.mx),a.b,palette[3],1.3,'4 3');
  s.line('metric-corr-mean-y',a.l,a.y(d.my),a.r,a.y(d.my),palette[3],1.3,'4 3');
  rows.forEach((r,i)=>dot(s,P,'metric-corr-point-'+i,a.x(r.x),a.y(r.y),0,i===selected-1,r.id));
  y=a.b+64;
  y=cap(s,'corr-dx',`Δx = ${fmt(row.x,2)} − ${fmt(d.mx,2)} = ${fmt(dx,3)}`,y);
  y=cap(s,'corr-dy',`Δy = ${fmt(row.y,2)} − ${fmt(d.my,2)} = ${fmt(dy,3)}`,y+7);
  y=cap(s,'corr-product',`Selected product: (${fmt(dx,3)}) × (${fmt(dy,3)}) = ${fmt(product,3)}`,y+7,product>=0?palette[2]:palette[1]);
  y=cap(s,'corr-total',`Sum of all products = ${fmt(d.xy,3)}`,y+7);
  y=cap(s,'corr-normalize',`r = sum of products / √(sum Δx² × sum Δy²) = ${fmt(d.r,3)}`,y+7);
  finish(s,y);
}
export function penaltyScene(s,P,d,st) {
  let y=cap(s,'penalty-fixed',`Fixed degree: ${st.degree}. Current λ = ${fmt(st.lambda,2)}. ${d.penalty==='ridge'?'Ridge':'Lasso'}.`);
  const max=Math.max(.1,...d.penaltyCurve.flatMap(r=>[r.train,r.validation]))*1.1;
  const a=frame(s,'penalty-axes',{x:49,y:y+20,w:s.w-68,h:200},[0,2],[0,max],['Penalty strength λ','Mean squared prediction error']);
  for(const [j,k] of ['train','validation'].entries()) {
    line(s,P,'metric-penalty-curve-'+k,d.penaltyCurve.map(r=>[a.x(r.lambda),a.y(r[k])]),palette[j],2.2);
    s.circle('metric-penalty-current-'+k,a.x(st.lambda),a.y(k==='train'?d.trainLoss:d.valLoss),5,palette[j],{stroke:'#fffef9','stroke-width':1.5});
  }
  s.line('metric-penalty-marker',a.x(st.lambda),a.t,a.x(st.lambda),a.b,palette[3],1.5,'4 3');
  y=a.b+65;
  y=cap(s,'penalty-labels','Blue: training. Red: validation. Same rows across λ.',y);
  y=cap(s,'penalty-scope','Development holdout comparison. Final-test rows are not used.',y+9);
  finish(s,y);
}
export function influenceScene(s,P,d,st) {
  const all=d.influence.all,without=d.influence.without,rows=d.split.train,row=rows.find(r=>r.id===st.selected),q={x:st.query,z:st.slice};
  const curves=[all,without].map(f=>Array.from({length:81},(_,i)=>{const x=-2.4+4.8*i/80;return {x,y:f.predict({x,z:st.slice})};}));
  const ys=[...rows.map(r=>r.y),...curves.flat().map(r=>r.y)],lo=Math.min(...ys),hi=Math.max(...ys),pad=(hi-lo||1)*.1;
  let y=cap(s,'influence-compare',`Same query x = ${fmt(q.x,2)}. Selected row ${row.id}.`);
  const a=frame(s,'influence-axes',{x:49,y:y+20,w:s.w-68,h:210},[-2.6,2.6],[lo-pad,hi+pad],['Input x','Outcome / prediction']);
  rows.forEach(r=>dot(s,P,'metric-influence-row-'+r.id,a.x(r.x),a.y(r.y),0,r.id===row.id,r.id));
  curves.forEach((curve,i)=>line(s,P,'metric-influence-curve-'+i,curve.map(r=>[a.x(r.x),a.y(r.y)]),palette[i],2.3,i?'5 3':null));
  const p1=all.predict(q),p2=without.predict(q);
  s.line('metric-influence-query',a.x(q.x),a.t,a.x(q.x),a.b,palette[3],1.3,'3 3');
  [p1,p2].forEach((v,i)=>s.circle('metric-influence-prediction-'+i,a.x(q.x),a.y(v),5,palette[i]));
  y=a.b+65;
  y=cap(s,'influence-all',`Fit with every training row (blue): ${fmt(p1,3)} at this query.`,y,palette[0]);
  y=cap(s,'influence-without',`Fit without ${row.id} (dashed red): ${fmt(p2,3)} at this query.`,y+7,palette[1]);
  y=cap(s,'influence-delta',`Change = ${fmt(p2,3)} − ${fmt(p1,3)} = ${fmt(p2-p1,3)}`,y+9,palette[3]);
  y=cap(s,'influence-active',`Active fit: ${st.omit==='yes'?'without selected row':'every training row'}. Original observations stay saved.`,y+9);
  finish(s,y);
}
