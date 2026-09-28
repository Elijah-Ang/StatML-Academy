import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const browser=await chromium.launch({channel:'chrome',headless:true});
const base='http://127.0.0.1:8137';
const results=[];
try{
 for(const slug of ['simple-linear-regression','kmeans','pca','naive-bayes','deep-learning','probability-sampling']){
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await page.addInitScript(()=>{
   window.__auditRAF=0;
   const raf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>raf(t=>{window.__auditRAF++;cb(t)});
  });
  await page.goto(`${base}/modules/${slug}.html?academy=1`);
  await page.evaluate(()=>document.fonts.ready);
  if(slug==='deep-learning')await page.waitForSelector('.lesson-step');
  await page.waitForTimeout(600);
  const before=await page.evaluate(()=>window.__auditRAF);
  await page.waitForTimeout(1000);
  const idle=await page.evaluate(()=>window.__auditRAF);
  const row={slug,reducedMotionRAFinOneIdleSecond:idle-before};
  if(['naive-bayes','deep-learning'].includes(slug)){
   await page.evaluate(()=>{
    document.querySelector('.chapter,.lesson-step')?.scrollIntoView({block:'start',behavior:'instant'});
    window.__auditOriginalSVG=document.querySelector('.sketch-art svg');
   });
   await page.waitForTimeout(200);
   await page.locator('[data-sketch="next"]').click();
   row.sameSVGAfterStep=await page.evaluate(()=>window.__auditOriginalSVG===document.querySelector('.sketch-art svg'));
   await page.locator('[data-sketch="play"]').click();
   row.playStartedInReducedMotion=await page.locator('[data-sketch="play"]').getAttribute('aria-pressed');
   await page.locator('[data-sketch="play"]').click();
  }
  if(slug==='probability-sampling'){
   row.means=[];
   for(const w of [1440,1000,1200,1440]){
    await page.setViewportSize({width:w,height:1000});
    await page.waitForTimeout(300);
    row.means.push({width:w,metrics:await page.locator('.metrics').innerText()});
   }
  }
  if(slug==='simple-linear-regression'){
   const getState=()=>page.evaluate(()=>({stage:state.stage,showPlayground:state.showPlayground,active:[...document.querySelectorAll('.stage-section.active')].map(e=>e.dataset.stage)}));
   await page.locator('.stage-section').last().evaluate(e=>e.scrollIntoView({behavior:'instant',block:'start'}));
   await page.waitForTimeout(600);
   row.last=await getState();
   await page.locator('.stage-section').first().evaluate(e=>e.scrollIntoView({behavior:'instant',block:'start'}));
   await page.waitForTimeout(1200);
   row.backToFirst=await getState();
  }
  results.push(row);
  await page.close();
 }
}finally{await browser.close();}
await writeFile(resolve(import.meta.dirname,'targeted-results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
