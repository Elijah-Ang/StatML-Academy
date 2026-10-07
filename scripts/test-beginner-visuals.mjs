import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {pilots} from '../lessons/pilots.mjs';
import {expanded} from '../lessons/expanded.mjs';
import {associationRulesLesson} from './generate-association-rules.mjs';

const root=resolve(import.meta.dirname,'..');
const lessons={...pilots,...expanded,'association-rules':associationRulesLesson};
const server=createServer(async(req,res)=>{
  try{
    const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
    if(!path.startsWith(root+'/'))throw Error('Path outside test root');
    res.setHeader('Content-Type',{'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml'}[extname(path)]||'application/octet-stream');
    res.end(await readFile(path));
  }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const open=async(slug,index)=>{
  await page.goto(`${base}/modules/${slug}.html`);
  await page.waitForFunction(()=>window.__notebook);
  await page.evaluate(()=>document.fonts.ready);
  await go(index);
};
const go=async(index)=>{
  await page.locator('article .stage').nth(index).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.waitForFunction(i=>window.__notebook.stage===i,index);
  await page.waitForFunction(()=>!window.__notebook.controller.tween?.raf);
};
const input=async(id,value)=>page.locator('#'+id).evaluate((el,value)=>{
  el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));
},value);
try{
  await open('simple-linear-regression',2);
  assert.equal(await page.evaluate(()=>window.__notebook.controller.state.selected),'D');
  assert.ok(await page.locator('[data-key="residual-D"]').evaluate(el=>Math.abs(+el.getAttribute('y1')-+el.getAttribute('y2'))>2));
  await go(3);
  for(const id of ['slope','intercept'])await page.locator('#'+id).evaluate(el=>{el.value=el.max;el.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.ok(await page.evaluate(()=>{
    const c=window.__notebook.controller,s=c.state,svg=document.querySelector('#lab-panel svg'),get=key=>svg.querySelector(`[data-key="${key}"]`),points=s.points;
    const cy=id=>get('point-'+id).transform.baseVal.consolidate().matrix.f;
    const scale=(cy('A')-cy('E'))/(points[0].y-points[4].y),r=points.find(p=>p.id==='D'),visibleResidual=(cy('D')-+get('prediction-D').getAttribute('cy'))/scale;
    // SVG transform matrices use single-precision coordinates in Chrome.
    if(Math.abs(visibleResidual-(r.y-s.m*r.x-s.b))>.001)return false;
    let area=0,errors=0,unit;
    for(const row of points){
      const tile=get('square-'+row.id),width=+tile.getAttribute('width'),height=+tile.getAttribute('height'),error=(row.y-s.m*row.x-s.b)**2;
      if(Math.abs(width-height)>1e-9||+tile.getAttribute('x')+width>svg.viewBox.baseVal.width+.1||+tile.getAttribute('y')+height>svg.viewBox.baseVal.height+.1)return false;
      if(error&&unit===undefined)unit=width*height/error;
      area+=width*height;errors+=error;
    }
    return Math.abs(area/unit-errors)<1e-7;
  }),'Extreme predictions are clipped or squared-error tiles lose their true area ratios');
  await page.locator('[data-reset]').click();
  await go(6);
  const fit=await page.evaluate(()=>window.__notebook.controller.fit);
  assert.ok(Math.abs(fit.r2-(1-1.9/242))<1e-10);
  assert.ok(Math.abs(fit.rse-Math.sqrt(1.9/3))<1e-10);
  await go(7);
  await page.locator('[data-point="A"][data-field="x"]').evaluate(el=>{el.value='10';el.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await page.evaluate(()=>window.__notebook.controller.state.points.find(r=>r.id==='A').x),10,'The edited input was not accepted');
  assert.ok(await page.locator('[data-key="point-A"]').evaluate(el=>{
    const svg=el.ownerSVGElement,b=el.getBBox(),m=el.transform.baseVal.consolidate().matrix;
    return m.e+b.x+b.width<=svg.viewBox.baseVal.width+.1;
  }),'The prediction view loses edited observations beyond the original input range');

  await open('kmeans',0);
  const start=await page.evaluate(()=>window.__notebook.controller.state);
  await go(3);
  const preview=await page.evaluate(()=>window.__notebook.controller.state);
  assert.deepEqual(preview.history,start.history,'Reading the mean example advanced the algorithm');
  assert.equal(preview.position,start.position);
  assert.ok(await page.locator('[data-key="group-mean-target"]').isVisible());
  await page.locator('#cluster-step').click();
  const assigned=await page.evaluate(()=>window.__notebook.controller.state);
  assert.equal(assigned.snapshot.phase,'assigned');
  assert.ok(assigned.snapshot.assignments.every(j=>j>=0));

  await open('naive-bayes',1);
  assert.equal(await page.locator('#bayes-posterior').isVisible(),false);
  assert.ok(await page.locator('[data-key="input-title"]').isVisible());
  await go(6);
  const probabilityBars=await page.evaluate(()=>{
    const result=window.__notebook.controller.result,get=key=>document.querySelector(`[data-key="${key}"]`);
    return {p:result.p,width:+get('chain-bar-0').getAttribute('width')/+get('chain-bg-0').getAttribute('width'),label:get('chain-score-0').textContent};
  });
  assert.ok(Math.abs(probabilityBars.width-probabilityBars.p)<1e-12);
  assert.ok(probabilityBars.label.includes('%'));
  assert.ok(Math.abs(parseFloat(probabilityBars.label)/100-probabilityBars.p)<.001,'Normalized bar carries a raw-score label');
  await go(10);
  await input('clue-unicorn','present');await input('alpha',0);
  assert.equal(await page.evaluate(()=>window.__notebook.controller.result.p),0);
  assert.equal(await page.locator('[data-key="spam-fill"]').evaluate(el=>+el.getAttribute('width')),0);
  // A test-only count fixture covers the valid zero-evidence edge case for
  // both classes. The authored example has one ordinary "unicorn" email.
  const originalModel=await readFile(resolve(root,'modules/notebook/models.js'),'utf8');
  const zeroEvidenceModel=originalModel.replace(/meeting: 30, unicorn: 1/, 'meeting: 30, unicorn: 0');
  assert.notEqual(zeroEvidenceModel,originalModel);
  await page.route('**/modules/notebook/models.js',route=>route.fulfill({body:zeroEvidenceModel,contentType:'text/javascript'}));
  await open('naive-bayes',10);
  await input('clue-unicorn','present');await input('alpha',0);
  assert.equal(await page.evaluate(()=>window.__notebook.controller.result.p),null);
  for(const key of ['spam-fill','ham-fill'])assert.equal(await page.locator(`[data-key="${key}"]`).evaluate(el=>+el.getAttribute('width')),0);
  await page.unroute('**/modules/notebook/models.js');

  await open('logistic-regression',0);
  assert.ok(await page.locator('#threshold').isVisible(),'Approved decision control is missing');
  assert.ok(await page.locator('[data-key="decision-class-1"]').isVisible(),'Approved input-space decision field is missing');
  await go(1);
  assert.ok(await page.locator('[data-key="probability-linear"]').isVisible());
  await go(2);
  assert.equal(await page.locator('[data-key="probability-class-1"]').isVisible(),true);
  assert.ok(await page.locator('[data-key="sigmoid-current"]').isVisible());
  await go(3);
  assert.ok(await page.locator('[data-key="clue-decision-class-1"]').isVisible(),'Weighted-clues view lost the approved decision field');
  const weighted=await page.evaluate(()=>{
    const d=window.__notebook.controller.data,s=window.__notebook.controller.state;
    return {parts:d.parts,raw:d.rawScore,p:d.fit.predict({x:s.query,z:s.second})};
  });
  assert.ok(Math.abs(weighted.parts.reduce((a,b)=>a+b,0)-weighted.raw)<1e-12);
  assert.ok(Math.abs(1/(1+Math.exp(-weighted.raw))-weighted.p)<1e-12);
  await go(4);
  const weights=await page.evaluate(()=>window.__notebook.controller.data.fit.weights);
  await input('lossInput',.1);
  assert.ok(Math.abs(await page.evaluate(()=>window.__notebook.controller.data.lossDemo.value)-Math.log(10))<1e-12);
  assert.deepEqual(await page.evaluate(()=>window.__notebook.controller.data.fit.weights),weights);
  assert.ok(await page.locator('[data-key="loss-inspection"]').isVisible());

  await open('knn',11);
  const cv=await page.evaluate(()=>window.__notebook.controller.data.cvScores);
  assert.equal(cv.length,11);assert.ok(cv.every(r=>r.total===48&&r.correct>=0&&r.correct<=48));
  assert.equal(await page.locator('circle[data-key^="knn-cv-point"]').count(),11);
  assert.equal(await page.locator('#query').isVisible(),false);
  const before=structuredClone(cv);
  await input('query',2);
  assert.deepEqual(await page.evaluate(()=>window.__notebook.controller.data.cvScores),before,'Query changed training-only CV');

  await open('support-vector-machine',2);
  assert.ok(await page.locator('line[data-key^="svm-contour-"]').count()>=3);
  await go(6);
  assert.ok(await page.locator('[data-key="scaler-title0"]').isVisible());
  assert.equal(await page.locator('#C').isVisible(),false);
  await go(7);await input('lossInput',-.5);
  assert.equal(await page.evaluate(()=>window.__notebook.controller.data.lossDemo.value),1.5);

  await open('one-r',5);await input('inputState','missing');
  assert.equal(await page.evaluate(()=>{
    const c=window.__notebook.controller;return c.data.fit.predict({x:NaN,z:NaN})===c.data.fit.fallback;
  }),true);
  assert.ok((await page.locator('#lab-receipt').innerText()).includes('Missing'));
  await input('inputState','measured');
  assert.ok(await page.locator('[data-key="one-rule-active"]').evaluate(el=>el.getAttribute('display')!=='none'&&+el.getAttribute('y2')>+el.getAttribute('y1')));

  await open('pca',5);
  assert.ok(await page.evaluate(()=>{
    const a=document.querySelector('[data-key="pca-first-axis"]'),b=document.querySelector('[data-key="pca-second-axis"]');
    const vector=el=>[+el.getAttribute('x2')-+el.getAttribute('x1'),+el.getAttribute('y2')-+el.getAttribute('y1')],u=vector(a),v=vector(b);
    return Math.abs((u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)))<1e-12;
  }),'Fitted PCA directions do not look orthogonal');
  await go(9);await input('components',2);
  assert.equal(await page.evaluate(()=>window.__notebook.controller.data.reconstructionError),0);
  await go(6);await input('selected','F');
  assert.ok(await page.evaluate(()=>{
    const c=window.__notebook.controller,r=c.data.pca.scores.find(r=>r.id==='F');
    return Math.abs(parseFloat(document.querySelector('#stat-b').textContent)-r.pc1)<.001&&Math.abs(parseFloat(document.querySelector('#stat-c').textContent)-r.pc2)<.001;
  }),'PCA score receipt uses a trial direction rather than fitted coordinates');

  await open('hierarchical-clustering',0);
  assert.equal(await page.locator('#lab-legend span').count(),8);
  assert.ok(await page.locator('#lab-legend span').evaluateAll(els=>els.every(el=>el.style.getPropertyValue('--legend')&&!el.style.getPropertyValue('--legend').includes('undefined'))));
  await go(3);
  for(const rule of ['single','complete','average','ward'])for(const merge of [0,2,4,6,7]){
    const check=await page.evaluate(({rule,merge})=>{
      const c=window.__notebook.controller;c.update({linkage:rule,merge},false);
      return !c.data.next?c.data.linkage===null:Math.abs(c.data.next.height-c.data.linkage[rule])<1e-10;
    },{rule,merge});
    assert.ok(check,`${rule}: displayed group calculation differs from the next merge`);
  }
  await open('correlation',8);
  assert.equal(await page.locator('#noise').isVisible(),false);
  assert.equal(await page.locator('path[data-key^="weather-to-"][data-key$="-tip"]').count(),2);

  // Read every lesson's complete content without JavaScript, including the
  // optional depth, on a narrow phone and a desktop. Interactive facts remain
  // supplementary to the complete static teaching content.
  const staticPage=await browser.newPage({javaScriptEnabled:false});
  let sections=0;
  for(const [slug,lesson] of Object.entries(lessons)){
    await staticPage.goto(`${base}/modules/${slug}.html`);
    assert.equal(await staticPage.locator('article .stage').count(),lesson.stages.length);
    sections+=lesson.stages.length;
    await staticPage.locator('details.deeper').evaluateAll(els=>els.forEach(el=>el.open=true));
    for(const width of [1440,320]){
      await staticPage.setViewportSize({width,height:844});
      assert.equal(await staticPage.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${slug}: expanded static reading overflows ${width}px`);
    }
    assert.equal(await staticPage.locator('p p,p div,p table,p pre').count(),0,`${slug}: malformed paragraph nesting`);
  }
  assert.equal(sections,380);assert.deepEqual(errors,[]);
  console.log('Beginner visual checks passed: meaningful controls, visible errors, undefined bars, weighted totals, loss rules, CV isolation, orthogonal PCA, complete group legends and all 380 static sections at desktop/phone widths.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
