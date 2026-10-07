import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pilots} from '../lessons/pilots.mjs';
import {expanded} from '../lessons/expanded.mjs';
import {associationRulesLesson} from './generate-association-rules.mjs';
const args=Object.fromEntries(process.argv.slice(2).filter(a=>a.includes('=')).map(a=>a.replace(/^--/,'').split('=')));
const out=resolve(args.out||process.env.STATML_AUDIT_ROOT||'/tmp/statml-visual-states'),base=args.base||process.env.STATML_PREVIEW||'http://127.0.0.1:8157';await mkdir(out,{recursive:true});
const slugs=Object.keys({...pilots,...expanded,'association-rules':associationRulesLesson});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'});
const report=process.argv.includes('--target-only')?JSON.parse(await readFile(join(out,'states.json'),'utf8')):{browser:'Native Google Chrome on the connected Mac',base,states:[],errors:[],findings:[],started:new Date().toISOString()};
page.on('pageerror',e=>report.errors.push(e.message));
const settled=()=>page.waitForFunction(()=>!window.__notebook.controller.tween?.raf);
async function visit(slug,width=1440){await page.setViewportSize({width,height:width<=900?844:1050});await page.goto(`${base}/modules/${slug}.html`);await page.waitForFunction(()=>window.__notebook);await page.evaluate(()=>document.fonts.ready);}
async function stage(index,width){if(await page.locator('dialog[open]').count())await page.keyboard.press('Escape');await page.locator('article .stage').nth(index).evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));await page.waitForFunction(i=>window.__notebook.stage===i,index);if(width<=900)await page.locator('[data-open-lab]').click();await settled();}
async function select(id,value){await page.locator('#'+id).selectOption(String(value));await settled();}
async function edge(id,key){await page.locator('#'+id).press(key);await settled();}
async function save(slug,label,width=1440,shot=true){
 const info=await page.evaluate(()=>{
  const svg=document.querySelector('#lab-panel svg'),vb=svg.viewBox.baseVal;
  const ts=[...svg.querySelectorAll('text')].filter(n=>!n.closest('[display="none"]')&&n.textContent.trim()).map(n=>({text:n.textContent,key:n.dataset.key,b:(()=>{const b=n.getBBox();return {x:b.x,y:b.y,width:b.width,height:b.height};})()}));
  const clipped=ts.filter(t=>t.b.x<-.7||t.b.y<-.7||t.b.x+t.b.width>vb.width+.7||t.b.y+t.b.height>vb.height+.7).map(t=>t.text);
  const collisions=[];for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){const a=ts[i].b,b=ts[j].b;if(Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>2&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>2)collisions.push([ts[i].text,ts[j].text]);}
  return {stage:window.__notebook.stage,scene:window.__notebook.controller.scene,svgText:ts.map(t=>t.text),panelText:document.querySelector('#lab-panel').innerText,clipped,collisions,overflow:document.documentElement.scrollWidth>innerWidth+1,nonfinite:[...svg.querySelectorAll('*')].some(n=>[...n.attributes].some(a=>/NaN|Infinity/.test(a.value)))};
 });
 const folder=join(out,slug);await mkdir(folder,{recursive:true});
 const path=join(folder,`${label}-${width}.png`);
 if(shot){
  if(width<=900){
   const dialog=page.locator('dialog[open]'),scroll=await dialog.evaluate(el=>el.scrollTop);
   await dialog.evaluate(el=>{el.scrollTop=0;});await page.screenshot({path});info.screenshot=path;
   info.bottomScreenshot=join(folder,`${label}-bottom-${width}.png`);
   await dialog.evaluate(el=>{el.scrollTop=el.scrollHeight;});await page.screenshot({path:info.bottomScreenshot});
   await dialog.evaluate((el,scroll)=>{el.scrollTop=scroll;},scroll);
  }else{await page.locator('#lab-panel').screenshot({path});info.screenshot=path;}
  if(width>900){const old=await page.locator('#lab-panel').getAttribute('style');await page.evaluate(()=>{const panel=document.querySelector('#lab-panel'),r=panel.getBoundingClientRect();Object.assign(panel.style,{position:'fixed',top:'0px',left:r.x+'px',width:r.width+'px',maxHeight:'none',overflow:'visible'});});await page.locator('#lab-panel svg').screenshot({path:join(folder,`${label}-diagram.png`)});await page.locator('#lab-panel').evaluate((el,old)=>old==null?el.removeAttribute('style'):el.setAttribute('style',old),old);}
 }
 report.states.push({slug,label,width,...info});if(info.clipped.length||info.collisions.length||info.overflow||info.nonfinite)report.findings.push({slug,label,width,...info});
 await writeFile(join(out,'states.json'),JSON.stringify(report,null,2));
}
try {
 // One real alternate control state in every module, with screenshots for review.
 for(const slug of (process.argv.includes('--target-only')?[]:slugs)) {
  await visit(slug);let changed=false;
  const count=await page.locator('article .stage').count();
  for(let i=0;i<count&&!changed;i++){
   await stage(i,1440);
   const controls=await page.locator('#lab-panel select, #lab-panel input[type="range"]').evaluateAll(es=>es.filter(e=>e.checkVisibility()&&!e.disabled).map(e=>({id:e.id,type:e.tagName,options:e.options?[...e.options].map(o=>o.value):[],value:e.value})));
   const control=controls.find(c=>c.type==='SELECT'&&c.options.length>1)||controls[0];
   if(!control)continue;
   if(control.type==='SELECT')await select(control.id,control.options.find(v=>v!==control.value));else await edge(control.id,'End');
   await save(slug,'course-alternate',1440);changed=true;
  }
  if(!changed){await stage(0,1440);const b=page.locator('#lab-panel button').filter({visible:true});if(await b.count())await b.first().click();await settled();await save(slug,'course-alternate',1440);}
  console.log('Alternate rendered: '+slug);
 }
 for(const width of [1440,320]) {
  await visit('one-r',width);
  await stage(3,width);for(const feature of ['x','z','auto']){await select('feature',feature);await save('one-r','feature-'+feature,width);}
  await stage(5,width);for(const state of ['missing','measured','missing','measured']){await select('inputState',state);await save('one-r','input-'+state,width);}
  await stage(8,width);for(const fold of [1,2,3]){await select('oneFold',fold);await save('one-r','fold-'+fold,width);}
  await select('scenario','rings');await stage(7,width);await save('one-r','rings-map',width);
  await stage(10,width);await save('one-r','rings-stump',width);
  await stage(6,width);
  const before=await page.evaluate(()=>{const c=window.__notebook.controller;return {key:c.data.fit.key,cuts:c.data.fit.cuts,values:c.data.fit.values,answer:c.data.fit.predict({x:c.state.query,z:c.state.second})};});
  await edge(before.key==='x'?'second':'query','End');
  const after=await page.evaluate(()=>{const c=window.__notebook.controller;return {key:c.data.fit.key,cuts:c.data.fit.cuts,values:c.data.fit.values,answer:c.data.fit.predict({x:c.state.query,z:c.state.second})};});assert.deepEqual(after,before,'Unused input refitted or changed One-R');
  await save('one-r','unused-input',width);
  await visit('association-rules',width);await stage(8,width);
  for(const phase of [0,1,2,3]){await select('apriori-step',phase);await save('association-rules','apriori-'+phase,width);}
  await edge('minimum-support','Home');await select('candidate-choice','Apple|Bread|DVD');await select('apriori-step','2');
  assert.match(await page.locator('#lab-panel svg').textContent(),/Pruned before scanning.*Counting\s*is skipped/s);await save('association-rules','pruned-candidate',width);
  await stage(10,width);await page.locator('#fp-replay').click();await settled();
  for(let step=0;step<=5;step++){if(step)await page.locator('#fp-next').click();await settled();assert.equal(await page.locator('#fp-step').inputValue(),String(step));await save('association-rules','fp-insert-'+step,width);}assert.ok(await page.locator('#fp-next').isDisabled());
  await stage(11,width);for(const suffix of ['m','p','b','a','c','f']){await select('suffix-choice',suffix);for(const phase of [0,1,2,3]){await select('projection-step',phase);await save('association-rules','projection-'+suffix+'-'+phase,width,suffix==='m'||suffix==='f');}}
  await stage(19,width);for(const algorithm of ['apriori','fp']){await select('python-algorithm',algorithm);for(const phase of [0,1,2,3]){await select('workflow-step',phase);await save('association-rules','workflow-'+algorithm+'-'+phase,width,algorithm==='fp');}}
  await page.locator('[data-reset]').click();await settled();assert.equal(await page.locator('#workflow-step').inputValue(),'0');
  // Empty conditioning group retains all transactions and names undefined confidence.
  await stage(0,width);await page.locator('[data-item="Apple"]').uncheck();await edge('basket-index','End');await page.locator('#basket-index').press('ArrowLeft');await settled();await page.locator('[data-item="Apple"]').uncheck();
  await stage(3,width);assert.equal(await page.evaluate(()=>window.__notebook.controller.result.main.confidence),null);await save('association-rules','empty-denominator',width);
  await visit('imbalanced-classification',width);await stage(4,width);await edge('threshold','End');
  assert.match(await page.locator('#lab-panel svg').textContent(),/Precision.*Undefined/s);await save('imbalanced-classification','no-alerts',width);
  await stage(5,width);await save('imbalanced-classification','undefined-curve',width);await edge('threshold','Home');await edge('prevalence','End');await save('imbalanced-classification','prevalence-high',width);
  await visit('missing-data-encoding',width);await stage(1,width);for(const encoding of ['onehot','ordinal','onehot']){await select('encoding',encoding);await save('missing-data-encoding','encoding-'+encoding,width);}
  await visit('knn',width);await stage(4,width);for(const scaling of ['yes','no']){await select('scaling',scaling);await edge('query','End');await edge('second','Home');await save('knn','distance-'+scaling,width);}
  await visit('correlation',width);await stage(4,width);await select('pattern','negative');await edge('selected','End');await save('correlation','negative-product',width);
  await visit('confidence-hypothesis-testing',width);await stage(3,width);await edge('alternative','Home');await edge('n','End');await save('confidence-hypothesis-testing','negative-effect-large-n',width);await edge('alternative','End');await edge('n','Home');await save('confidence-hypothesis-testing','positive-effect-small-n',width);
  await visit('model-selection',width);await stage(7,width);for(const penalty of ['ridge','lasso']){await select('penalty',penalty);await edge('degree','End');await edge('lambda','End');const correct=await page.evaluate(()=>{const c=window.__notebook.controller,d=c.data,row=d.penaltyCurve.find(r=>r.lambda===c.state.lambda);return row&&Math.abs(row.train-d.trainLoss)<1e-10&&Math.abs(row.validation-d.valLoss)<1e-10;});assert.ok(correct,'Current λ does not match its plotted model');await save('model-selection','penalty-'+penalty,width);}
  await visit('regression-diagnostics',width);await stage(2,width);await select('scenario','outlier');for(const omit of ['yes','no']){await select('omit',omit);await edge('query','End');await save('regression-diagnostics','influence-'+omit,width);}
 }
 // Finite normal-motion interruptions and reduced/hidden settling on changed scenes.
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(const [slug,index,id,values] of [['one-r',6,'query',[-2.5,2.5,-1,1]],['association-rules',10,'fp-step',[0,5,2,4]],['knn',4,'query',[-2.5,2.5,0]]]) {
  await visit(slug);await stage(index,1440);
  const checks=await page.evaluate(({id,values})=>{
   const el=document.getElementById(id),svg=document.querySelector('#lab-panel svg');
   for(const value of values){el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));}
   return {sameSVG:svg===document.querySelector('#lab-panel svg'),value:el.value};
  },{id,values});assert.ok(checks.sameSVG);await settled();assert.equal(+checks.value,values.at(-1));await save(slug,'interrupted-controls',1440);
  await page.emulateMedia({reducedMotion:'reduce'});await edge(id,'Home');assert.equal(await page.evaluate(()=>window.__notebook.controller.tween.raf),0);await page.emulateMedia({reducedMotion:'no-preference'});
 }
 report.finished=new Date().toISOString();assert.deepEqual(report.errors,[]);assert.deepEqual(report.findings,[],'Interactive layout findings');
 console.log(JSON.stringify({states:report.states.length,findings:report.findings.length,errors:report.errors.length}));
} finally {await writeFile(join(out,'states.json'),JSON.stringify(report,null,2));await browser.close();}
