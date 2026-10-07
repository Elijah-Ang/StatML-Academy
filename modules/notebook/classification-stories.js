import {knnFit} from './science.js';
import {logisticRegions} from './logistic-geometry.js';
import {fmt,palette,pathFrom} from './ui.js';
import {caption,frame} from './spatial.js';

export function knnCrossValidation(rows,scaling=true,weighted=false,threshold=.5){
  return Array.from({length:11},(_,i)=>1+i*2).filter(k=>k<rows.length).map(k=>{
    let correct=0;
    for(let i=0;i<rows.length;i++) {
      const fit=knnFit(rows.filter((_,j)=>j!==i),k,scaling,weighted);
      if(+(fit.predict(rows[i])>=threshold)===rows[i].y)correct++;
    }
    return {k,correct,total:rows.length,accuracy:correct/rows.length};
  });
}

export function linearScoreContours(score,limit=3){
  const b=score({x:0,z:0}),wx=score({x:1,z:0})-b,wz=score({x:0,z:1})-b;
  return [-1,0,1].map(level=>{
    const candidates=[];
    if(Math.abs(wz)>1e-12)for(const x of [-limit,limit])candidates.push([x,(level-b-wx*x)/wz]);
    if(Math.abs(wx)>1e-12)for(const z of [-limit,limit])candidates.push([(level-b-wz*z)/wx,z]);
    const points=candidates.filter(([x,z])=>Math.abs(x)<=limit+1e-9&&Math.abs(z)<=limit+1e-9);
    const unique=points.filter((p,i)=>!points.slice(0,i).some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-9)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    return {level,points:unique.length>=2?[unique[0],unique.at(-1)]:[]};
  });
}

export function gridScoreContours(grid,columns,level){
  const segments=[];
  for(let y=0;y<grid.length/columns-1;y++)for(let x=0;x<columns-1;x++){
    const corners=[grid[y*columns+x],grid[y*columns+x+1],grid[(y+1)*columns+x+1],grid[(y+1)*columns+x]],cross=[];
    for(let edge=0;edge<4;edge++){
      const a=corners[edge],b=corners[(edge+1)%4];
      if((a.score<level)!==(b.score<level)){
        const t=(level-a.score)/(b.score-a.score);
        cross.push([a.x+t*(b.x-a.x),a.z+t*(b.z-a.z)]);
      }
    }
    if(cross.length===2)segments.push(cross);
    else if(cross.length===4){
      const centre=corners.reduce((v,c)=>v+c.score,0)/4;
      const same=(centre>=level)===(corners[0].score>=level);
      segments.push(same?[cross[0],cross[1]]:[cross[0],cross[3]],same?[cross[2],cross[3]]:[cross[1],cross[2]]);
    }
  }
  return segments;
}

export function oddsStory(s,weights){
  s.begin(350);
  let y=caption(s,'odds-title','Turn each input coefficient into an odds multiplier.');
  y=caption(s,'odds-scope','One-unit input increase; keep the other input fixed. This is not a probability multiplier.',y+9);
  for(let i=1;i<weights.length;i++){
    const coefficient=weights[i],ratio=Math.exp(coefficient);
    y=caption(s,'odds-input'+i,`Input ${i===1?'x':'z'}: coefficient ${fmt(coefficient,3)}`,y+20,palette[i-1]);
    const x=18,width=s.w-36;
    s.line('odds-arrow'+i,x+7,y+13,x+width-10,y+13,'#839083',1.5);
    s.path('odds-head'+i,`M${x+width-18},${y+8}L${x+width-10},${y+13}L${x+width-18},${y+18}`,'#839083',1.5);
    const value=ratio>100000?ratio.toExponential(2):fmt(ratio,3);
    y=caption(s,'odds-result'+i,`e^${fmt(coefficient,3)} ≈ ${value} times the odds`,y+41,palette[i-1]);
  }
  y=caption(s,'odds-baseline','Multiplier 1 leaves odds unchanged. Below 1 reduces odds; above 1 increases them.',y+20);
  s.fitHeight(y+20);
}

export function oneRuleStory(s,fit,rows,query,missing=false){
  s.begin(400);
  let y=caption(s,'one-rule-title',missing ? `Missing ${fit.key}: use the saved training-majority fallback.` : `Read only input ${fit.key}; look up its interval’s saved class.`);
  if(missing){
    const positive=rows.filter(r=>r.y===1).length;
    y=caption(s,'one-rule-missing','An unknown value is not zero and does not belong in the rightmost interval.',y+12);
    y=caption(s,'one-rule-fallback-counts',`${positive} of ${rows.length} training rows have class 1.`,y+24);
    y=caption(s,'one-rule-fallback',`Saved fallback: class ${fit.fallback}. A tie uses class 1 in this example.`,y+12);
    s.rect('one-rule-fallback-box',16,y+12,s.w-32,45,palette[fit.fallback]+'22');
    s.text('one-rule-fallback-label',s.w/2,y+40,`Return class ${fit.fallback}`,{'text-anchor':'middle','font-size':21});
    s.fitHeight(y+80);return;
  }
  y=caption(s,'one-rule-query',`New ${fit.key} = ${fmt(query[fit.key],3)} → saved class ${fit.predict(query)}.`,y+12,palette[3]);
  const labels=[`${fit.key} ≤ ${fmt(fit.cuts[0],2)}`,`${fmt(fit.cuts[0],2)} < ${fit.key} ≤ ${fmt(fit.cuts[1],2)}`,`${fit.key} > ${fmt(fit.cuts[1],2)}`];
  const active=query[fit.key]<=fit.cuts[0]?0:query[fit.key]<=fit.cuts[1]?1:2;
  fit.values.forEach((r,i)=>{
    const top=y+17;
    y=caption(s,'one-rule-bin'+i,labels[i],y+17);
    const columns=Math.max(1,Math.floor((s.w-38)/9));
    for(let j=0;j<r.n;j++)s.circle(`one-rule-row-${i}-${j}`,19+(j%columns)*9,y+14+Math.floor(j/columns)*12,3,j<r.positive?palette[1]:palette[0]);
    y=caption(s,'one-rule-value'+i,r.n?`${r.positive}/${r.n} are class 1 → saved class ${r.prediction}`:`No training rows here → saved fallback class ${fit.fallback}`,y+Math.ceil(r.n/columns)*12+30);
    if(i===active)s.line('one-rule-active',s.w-10,top-14,s.w-10,y+3,palette[3],3);
  });
  y=caption(s,'one-rule-key','Dots are training rows with known classes. The gold side mark selects the new input’s interval.',y+18);
  s.fitHeight(y+20);
}

export function scalingStory(s,q,scaler,count){
  s.begin(380);
  let y=caption(s,'scaler-title',`Means and SDs come only from ${count} training rows.`);
  for(const [key,m,sd] of [['x',scaler.mx,scaler.sx],['z',scaler.mz,scaler.sz]]){
    y=caption(s,'scaler-input'+key,`Raw ${key} = ${fmt(q[key],3)}`,y+22);
    y=caption(s,'scaler-subtract'+key,`Subtract training mean ${fmt(m,3)}.`,y+9);
    y=caption(s,'scaler-divide'+key,`Divide by training SD ${fmt(sd,3)} → ${fmt((q[key]-m)/sd,3)}`,y+9,palette[0]);
  }
  y=caption(s,'scaler-future','Reuse these same saved means and SDs for validation and later rows.',y+20);
  s.fitHeight(y+20);
}

export function contributionsStory(s,parts,probability){
  s.begin(430);
  let y=caption(s,'clues-title','Multiply each input by its weight, then add the intercept.');
  const totals=[parts[0],parts[0]+parts[1],parts[0]+parts[1]+parts[2]],all=[0,...totals],lo=Math.min(...all),hi=Math.max(...all),pad=(hi-lo)*.2||1;
  const a=frame(s,'clue-total',{x:54,y:y+18,w:s.w-82,h:145},[-.5,3.5],[lo-pad,hi+pad],['','Raw score s']);
  for(let i=0;i<=2;i++)s.nodes.get('clue-total-xt'+i)?.setAttribute('display','none');
  const labels=['Start','+ x','+ z','Total'];
  for(let i=0;i<4;i++){
    const before=i===0||i===3?0:totals[i-1],after=i===3?totals[2]:totals[i],x=a.x(i)-12;
    s.rect('clue-part'+i,x,Math.min(a.y(before),a.y(after)),24,Math.abs(a.y(after)-a.y(before)),palette[i]+'66',{stroke:palette[i],rx:1});
    s.text('clue-label'+i,a.x(i),a.b+21,labels[i],{'text-anchor':'middle','font-size':13});
  }
  y=caption(s,'clue-products',`Rounded parts: ${parts.map(v=>fmt(v,3)).join(' + ')} ≈ ${fmt(totals[2],3)}`,a.b+57);
  y=caption(s,'clue-probability',`Sigmoid turns that score into probability ${fmt(probability,4)}.`,y+11);
  s.fitHeight(y+20);
}

export function probabilityShapesStory(s,rawScore,probability,threshold,P){
  s.begin(380);
  let y=caption(s,'probability-shapes-title','A straight line can leave the valid probability range.');
  const limit=Math.max(6,Math.abs(rawScore)+1),side=s.w-75;
  const a=frame(s,'probability-shapes',{x:48,y:y+18,w:side,h:190},[-limit,limit],[-.25*limit+.35,.25*limit+.65],['Raw score s','Proposed probability']);
  s.rect('probability-valid-range',a.l,a.y(1),a.r-a.l,a.y(0)-a.y(1),palette[2]+'18',{rx:0});
  const cutoff=P('decision-threshold',0,threshold)[1],cutoffY=a.y(cutoff);
  s.rect('probability-class-1',a.l,a.y(1),a.r-a.l,cutoffY-a.y(1),palette[1]+'24',{rx:0});
  s.rect('probability-class-0',a.l,cutoffY,a.r-a.l,a.y(0)-cutoffY,palette[0]+'24',{rx:0});
  s.line('probability-band-top',a.l,a.y(1),a.r,a.y(1),palette[2],1,'3 3');
  s.line('probability-band-bottom',a.l,a.y(0),a.r,a.y(0),palette[2],1,'3 3');
  const values=Array.from({length:121},(_,i)=>-limit+2*limit*i/120);
  const curve=(key,fn,color)=>s.path(key,pathFrom(values.map(v=>[a.x(v),a.y(fn(v))])),color,2.5);
  curve('probability-linear',v=>.5+.25*v,palette[1]);
  curve('probability-sigmoid',v=>1/(1+Math.exp(-v)),palette[2]);
  if(Math.abs(rawScore)<=limit)s.circle('probability-current',a.x(rawScore),a.y(probability),6,palette[3]);
  s.line('probability-threshold',a.l,cutoffY,a.r,cutoffY,'#344a48',2,'6 4');
  y=caption(s,'probability-shapes-key','The valid band is 0 to 1. Blue background predicts 0; red background predicts 1.',a.b+73);
  y=caption(s,'probability-shapes-curves','Green: sigmoid. Thin red line: illustrative straight line. Move the cutoff; the curves stay fixed.',y+11);
  y=caption(s,'probability-shapes-scope','The red line is a shape illustration, not a fit to these training rows.',y+11);
  s.fitHeight(y+20);
}

// Keep the approved moving decision field alongside the weighted calculation.
// It uses the same fitted weights, query and animated cutoff as the main map.
export function appendLogisticDecisionField(s,P,data,query,threshold){
  let y=caption(s,'clue-map-title','The same probability becomes a class decision.',s.h+17);
  const a=frame(s,'clue-map-space',{x:48,y:y+20,w:s.w-77,h:185},[-data.limit,data.limit],[-data.limit,data.limit],['Input x','Input z']);
  const cutoff=P('decision-threshold',0,threshold)[1],weights=data.fit.weights.map((v,i)=>P('decision-weight'+i,v,0)[0]),regions=logisticRegions(weights,cutoff,[-data.limit,data.limit]);
  for(const [key,points,color] of [['clue-decision-class-1',regions.positive,palette[1]],['clue-decision-class-0',regions.negative,palette[0]]]){
    if(points.length>=3)s.path(key,points.map(([x,z],i)=>`${i?'L':'M'}${a.x(x)},${a.y(z)}`).join(' ')+'Z','none',0,color+'24');
  }
  if(regions.boundary.length===2){const [from,to]=regions.boundary;s.line('clue-decision-boundary',a.x(from[0]),a.y(from[1]),a.x(to[0]),a.y(to[1]),'#344a48',2,'6 4');}
  data.split.train.forEach(r=>{
    const p=P('clue-map-row'+r.id,a.x(r.x),a.y(r.z));
    s.mark('clue-map-row'+r.id,...p,palette[r.y],r.id+' · known class '+r.y,false,r.id);
  });
  s.circle('clue-map-query',...P('clue-map-query',a.x(query.x),a.y(query.z)),7,palette[3],{stroke:'#fffef9','stroke-width':2});
  y=caption(s,'clue-map-key','Dots: known labels. Background: predicted labels. Gold: the point you are predicting.',a.b+75);
  y=caption(s,'clue-map-rule',`At cutoff ${fmt(threshold,2)}, probability ${fmt(data.fit.predict(query),4)} gives class ${+(data.fit.predict(query)>=threshold)}.`,y+11);
  y=caption(s,'clue-map-action','Move the decision threshold. The two colour regions move; the weights and probability stay fixed.',y+11);
  s.fitHeight(y+20);
}
