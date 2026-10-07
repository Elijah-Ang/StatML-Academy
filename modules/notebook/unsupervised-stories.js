import {caption,frame} from './spatial.js';
import {fmt,palette} from './ui.js';

export function linkageCalculation(rows,left,right){
  const center=members=>({x:members.reduce((v,i)=>v+rows[i].x,0)/members.length,z:members.reduce((v,i)=>v+rows[i].z,0)/members.length});
  const a=center(left),b=center(right),pairs=left.flatMap(i=>right.map(j=>({i,j,distance:Math.hypot(rows[i].x-rows[j].x,rows[i].z-rows[j].z)})));
  return {left,right,a,b,pairs,single:Math.min(...pairs.map(p=>p.distance)),complete:Math.max(...pairs.map(p=>p.distance)),average:pairs.reduce((v,p)=>v+p.distance,0)/pairs.length,ward:left.length*right.length/(left.length+right.length)*((a.x-b.x)**2+(a.z-b.z)**2)};
}

export function linkageStory(s,rows,d,rule,colors){
  s.begin(400);
  if(!d){let y=caption(s,'linkage-complete','All observations already belong to one group.');y=caption(s,'linkage-return','Reduce Merge steps to inspect another next-pair comparison.',y+15);s.fitHeight(y+20);return;}
  const names=members=>members.map(i=>rows[i].id).join(', ');
  let y=caption(s,'linkage-pair-title',`Next merge: ${names(d.left)} with ${names(d.right)}.`);
  y=caption(s,'linkage-pair-scope','This picture zooms in on those two current groups.',y+9);
  const shown=[...d.left,...d.right].map(i=>rows[i]),xs=shown.map(r=>r.x),zs=shown.map(r=>r.z),minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs),half=Math.max(.1,maxX-minX,maxZ-minZ)*.65,mx=(minX+maxX)/2,mz=(minZ+maxZ)/2,side=s.w-77;
  const a=frame(s,'linkage-pair-space',{x:48,y:y+20,w:side,h:side},[mx-half,mx+half],[mz-half,mz+half],['Input x','Input z']);
  d.pairs.forEach((p,i)=>{
    const chosen=rule==='average'||rule==='single'&&Math.abs(p.distance-d.single)<1e-9||rule==='complete'&&Math.abs(p.distance-d.complete)<1e-9;
    s.line('linkage-pair'+i,a.x(rows[p.i].x),a.y(rows[p.i].z),a.x(rows[p.j].x),a.y(rows[p.j].z),chosen?palette[1]:'#c5c9bd',chosen?2:1,chosen?null:'3 4');
  });
  if(rule==='ward'){
    s.line('linkage-centers',a.x(d.a.x),a.y(d.a.z),a.x(d.b.x),a.y(d.b.z),palette[1],2.5,'4 3');
    [d.a,d.b].forEach((c,i)=>s.circle('linkage-center'+i,a.x(c.x),a.y(c.z),9,'#fffef9',{stroke:colors[i],'stroke-width':2}));
  }
  [d.left,d.right].forEach((members,g)=>members.forEach(i=>{
    s.circle('linkage-row'+i,a.x(rows[i].x),a.y(rows[i].z),4,colors[g]);
    s.text('linkage-id'+i,a.x(rows[i].x)+8,a.y(rows[i].z)-9,rows[i].id,{'font-size':15});
  }));
  const ruleText={single:`Closest cross-group pair: ${fmt(d.single,3)}.`,complete:`Farthest cross-group pair: ${fmt(d.complete,3)}.`,average:`Average of ${d.pairs.length} cross-group distances: ${fmt(d.average,3)}.`,ward:`Joining the groups adds ${fmt(d.ward,3)} to within-group squared spread.`};
  y=caption(s,'linkage-result',ruleText[rule],a.b+75,palette[1]);
  y=caption(s,'linkage-choices',`Closest ${fmt(d.single,3)} · farthest ${fmt(d.complete,3)} · average ${fmt(d.average,3)}`,y+10);
  y=caption(s,'linkage-units',rule==='ward'?'Ward uses squared units and group sizes. Hollow rings mark group means.':'Red connections show the pairs used by this rule. Compare them with the other possible cross-group pairs.',y+10);
  s.fitHeight(y+20);
}

export function pcaProjectionStory(s,P,pc,st,mode,projection){
  s.begin(400);
  let y=caption(s,'pca-picture-title',mode==='pc2'?'Two fitted directions at right angles.':mode==='reconstruction'?`Reconstruct using ${st.components} fitted component${st.components===1?'':'s'}.`:'Compare a trial direction with the observed points.');
  const all=[...pc.centered,...projection.map(r=>({x:r.reconstructedX,z:r.reconstructedZ}))],limit=Math.max(.1,...all.flatMap(r=>[Math.abs(r.x),Math.abs(r.z)]))*1.22;
  const side=s.w-77,a=frame(s,'pca-square',{x:48,y:y+20,w:side,h:side},[-limit,limit],[-limit,limit],[st.scale==='yes'?'Standardized x':'Centred x',st.scale==='yes'?'Standardized z':'Centred z']);
  const angle=mode==='trial'?st.angle*Math.PI/180:pc.angle,c=Math.cos(angle),sn=Math.sin(angle);
  const axis=(key,v,color)=>{
    const reach=limit/Math.max(Math.abs(v[0]),Math.abs(v[1]));
    s.line(key,a.x(-reach*v[0]),a.y(-reach*v[1]),a.x(reach*v[0]),a.y(reach*v[1]),color,2);
  };
  axis('pca-first-axis',[c,sn],mode==='trial'?palette[3]:palette[0]);
  if(mode==='pc2'||mode==='reconstruction'&&st.components===2){
    axis('pca-second-axis',[-sn,c],palette[2]);
    const x=a.x(0),z=a.y(0),size=13,u=[c*size,-sn*size],v=[-sn*size,-c*size];
    s.path('pca-right-angle',`M${x+u[0]},${z+u[1]}L${x+u[0]+v[0]},${z+u[1]+v[1]}L${x+v[0]},${z+v[1]}`,'#879083',1.2);
  }
  if(mode!=='pc2')projection.forEach(r=>{
    const p=P('pca-projection'+r.id,a.x(r.reconstructedX),a.y(r.reconstructedZ));
    s.line('pca-gap'+r.id,a.x(r.x),a.y(r.z),p[0],p[1],palette[2]+'77',1.2,'3 4');
    s.circle('pca-reconstructed'+r.id,p[0],p[1],mode==='reconstruction'?7:3,'#fffef9',{stroke:palette[2],'stroke-width':1.7});
  });
  pc.centered.forEach(r=>{
    s.mark('pca-observed'+r.id,a.x(r.x),a.y(r.z),'#596860',`${r.id}: x ${fmt(r.x,3)}, z ${fmt(r.z,3)}`,r.id===st.selected,r.id);
    s.text('pca-id'+r.id,a.x(r.x)+8,a.y(r.z)-9,r.id,{'font-size':15});
  });
  y=caption(s,'pca-picture-key',mode==='pc2'?'Blue: fitted PC1. Green: fitted PC2. Equal axis scales preserve the right angle.':mode==='reconstruction'?'Grey dots are observations; green rings are reconstructed coordinates. Two components recover both input coordinates in the chosen scale.':'Green marks are projections onto the gold trial axis. Square axes make the displayed angle match the numerical angle.',a.b+73);
  s.fitHeight(y+20);
}

export function pairDistanceStory(s,P,rows,selected,nearest){
  s.begin(400);
  let y=caption(s,'pair-distance-title',`Observation ${selected.id} and its nearest other point ${nearest.id}.`);
  const limit=Math.max(1,...rows.flatMap(r=>[Math.abs(r.x),Math.abs(r.z)]))*1.22,side=s.w-77;
  const a=frame(s,'pair-distance-square',{x:48,y:y+19,w:side,h:side},[-limit,limit],[-limit,limit],['Input x','Input z']);
  s.line('pair-distance-x',a.x(selected.x),a.y(selected.z),a.x(nearest.x),a.y(selected.z),palette[0],2,'3 4');
  s.line('pair-distance-z',a.x(nearest.x),a.y(selected.z),a.x(nearest.x),a.y(nearest.z),palette[2],2,'3 4');
  s.line('pair-distance-direct',a.x(selected.x),a.y(selected.z),a.x(nearest.x),a.y(nearest.z),palette[3],2.5);
  rows.forEach(r=>{
    s.mark('pair-distance-row'+r.id,a.x(r.x),a.y(r.z),'#697b72',r.id,r.id===selected.id||r.id===nearest.id,r.id);
    s.text('pair-distance-id'+r.id,a.x(r.x)+8,a.y(r.z)-9,r.id,{'font-size':15});
  });
  const dx=nearest.x-selected.x,dz=nearest.z-selected.z;
  y=caption(s,'pair-distance-gaps',`Axis gaps: x ${fmt(dx,3)}, z ${fmt(dz,3)}.`,a.b+74);
  y=caption(s,'pair-distance-result',`Distance = √(${fmt(dx*dx,3)} + ${fmt(dz*dz,3)}) = ${fmt(Math.hypot(dx,dz),3)}`,y+9);
  y=caption(s,'pair-distance-scope','This is point-to-point distance. A linkage rule separately defines how whole groups are compared.',y+12);
  s.fitHeight(y+20);
}
