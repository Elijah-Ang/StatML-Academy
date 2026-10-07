import { fmt,palette } from './ui.js';
import { caption,frame } from './spatial.js';
import { pca,mean,variance } from './science.js';

export function componentDirections(rows){
  const points=rows.map(r=>({...r,z:r.x*r.x})),fit=pca(points),ym=mean(points.map(r=>r.y));
  const covariance=fit.centered.reduce((v,r)=>[v[0]+r.x*(r.y-ym),v[1]+r.z*(r.y-ym)],[0,0]);
  const norm=Math.hypot(...covariance),pc=[Math.cos(fit.angle),Math.sin(fit.angle)],pls=norm>1e-12?covariance.map(v=>v/norm):null;
  const summary=w=>{
    const scores=fit.centered.map(r=>r.x*w[0]+r.z*w[1]);
    return {variance:variance(scores),covariance:scores.reduce((sum,v,i)=>sum+v*(points[i].y-ym),0)/(points.length-1)};
  };
  return {points:fit.centered,pc,pls,pcSummary:summary(pc),plsSummary:pls?summary(pls):null};
}

export function subsetStory(s,p){
  s.begin(440);
  let y=caption(s,'subset-title',`${p} optional columns give 2^${p} = ${2**p} possible subsets.`);
  y=caption(s,'subset-scope','Here the columns are powers of x. These are possible combinations, not fitted subset-search results.',y+9);
  const left=54,cw=(s.w-left-16)/p,shown=Math.min(8,2**p);
  s.text('subset-choice',12,y+25,'Choice',{'font-size':13});
  for(let j=0;j<p;j++)s.text('subset-head'+j,left+(j+.5)*cw,y+25,`x^${j+1}`,{'font-size':12,'text-anchor':'middle'});
  for(let mask=0;mask<shown;mask++){
    const yy=y+53+mask*32;
    s.text('subset-name'+mask,15,yy+5,mask===0?'None':String(mask),{'font-size':14});
    for(let j=0;j<p;j++)s.circle(`subset-${mask}-${j}`,left+(j+.5)*cw,yy,5,(mask & 1<<j)?palette[0]:'#fffef9',{stroke:palette[0],'stroke-width':1.3});
  }
  y=caption(s,'subset-key','Filled = include the column. Hollow = leave it out. The intercept stays in every candidate.',y+shown*32+78);
  if(shown<2**p)y=caption(s,'subset-more',`Showing ${shown} of ${2**p} combinations. More columns double the number of choices.`,y+9);
  s.fitHeight(y+20);
}

export function componentStory(s,d,selected){
  s.begin(420);
  let y=caption(s,'component-title','Two first directions from the same training rows.');
  y=caption(s,'component-scope','Centred x and x² only: this illustrates directions, not full PCR/PLS prediction performance.',y+8);
  const xs=d.points.map(r=>r.x),zs=d.points.map(r=>r.z);
  const pad=vs=>{const lo=Math.min(...vs,0),hi=Math.max(...vs,0),gap=(hi-lo)*.14||1;return [lo-gap,hi+gap];};
  const xd=pad(xs),zd=pad(zs);
  const a=frame(s,'component-space',{x:48,y:y+12,w:s.w-75,h:175},xd,zd,['Centred x','Centred x²']);
  d.points.forEach(r=>s.mark('component-point'+r.id,a.x(r.x),a.y(r.z),'#65766d',`${r.id}: centred x ${fmt(r.x,2)}, centred x² ${fmt(r.z,2)}, outcome ${fmt(r.y,2)}`,r.id===selected,r.id));
  const line=(key,w,color)=>{
    const length=Math.min(...[...xd.map(Math.abs),...zd.map(Math.abs)].filter(v=>v>0))*.9;
    s.line(key,a.x(-w[0]*length),a.y(-w[1]*length),a.x(w[0]*length),a.y(w[1]*length),color,3);
  };
  line('component-pcr',d.pc,palette[0]);
  if(d.pls)line('component-pls',d.pls,palette[3]);
  y=caption(s,'component-pcr-note',`Blue: PCA first weights ${d.pc.map(v=>fmt(v,3)).join(', ')}. Input-score variance ${fmt(d.pcSummary.variance,3)}.`,a.b+58,palette[0]);
  y=caption(s,'component-pls-note',d.pls?`Gold: PLS first weights ${d.pls.map(v=>fmt(v,3)).join(', ')}. Score–outcome covariance ${fmt(d.plsSummary.covariance,3)}.`:'No input–outcome covariance: this PLS direction is unavailable.',y+9,palette[3]);
  y=caption(s,'component-goals','PCA maximizes input spread. This first PLS direction maximizes covariance with y under a unit-weight constraint.',y+12);
  s.fitHeight(y+20);
}

export function decompositionStory(s,b){
  s.begin(480);
  let y=caption(s,'decomp-title',`One input x=${fmt(b.x,2)}; twenty separate training fits.`);
  y=caption(s,'decomp-dots','Each dot is one fitted prediction at that input, not one observed outcome.',y+8);
  const values=[...b.predictions,b.truth,b.average],lo=Math.min(...values),hi=Math.max(...values),pad=(hi-lo)*.2||.1;
  const a=frame(s,'decomp-predictions',{x:44,y:y+12,w:s.w-72,h:85},[lo-pad,hi+pad],[0,1],['Prediction in outcome units'],false);
  for(let i=0;i<=2;i++){
    const value=lo-pad+(hi-lo+2*pad)*i/2,x=a.x(value);
    s.line('decomp-tick'+i,x,a.b,x,a.b+4,'#839083',1);
    s.text('decomp-tick-label'+i,x,a.b+19,fmt(value,2),{'text-anchor':i===0?'start':i===2?'end':'middle','font-size':12});
  }
  s.text('decomp-predictions-xl',(a.l+a.r)/2,a.b+53,'Prediction in outcome units',{'text-anchor':'middle','font-size':14});
  b.predictions.forEach((v,i)=>s.circle('decomp-fit'+i,a.x(v),a.t+20+(i%4)*10,3,palette[0]));
  s.line('decomp-truth',a.x(b.truth),a.t,a.x(b.truth),a.b,palette[3],2,'3 4');
  s.line('decomp-average',a.x(b.average),a.t,a.x(b.average),a.b,palette[2],2);
  y=caption(s,'decomp-values',`Gold: known simulated mean ${fmt(b.truth,3)}. Green: average fitted prediction ${fmt(b.average,3)}.`,a.b+92);
  const total=b.bias2+b.variance+b.noise,width=s.w-32;
  let x=16;
  for(const [name,value,color] of [['bias',b.bias2,palette[1]],['variance',b.variance,palette[0]],['noise',b.noise,palette[3]]]){
    const part=total?width*value/total:0;
    s.rect('decomp-part'+name,x,y+10,part,31,color+'aa');x+=part;
  }
  y=caption(s,'decomp-bias',`Squared estimated bias: ${fmt(b.bias2,4)}`,y+68,palette[1]);
  y=caption(s,'decomp-variance',`Prediction variance across fits: ${fmt(b.variance,4)}`,y+6,palette[0]);
  y=caption(s,'decomp-noise',`Known simulated noise variance: ${fmt(b.noise,4)}`,y+6,palette[3]);
  y=caption(s,'decomp-total',`Estimated sum: ${fmt(total,4)} in squared outcome units.`,y+13);
  s.fitHeight(y+20);
}
