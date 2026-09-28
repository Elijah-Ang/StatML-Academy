import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root=resolve(import.meta.dirname,'../..');
const out=import.meta.dirname;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
  try {
    const pathname=new URL(req.url,'http://localhost').pathname;
    const path=resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
    if(!path.startsWith(root+'/'))throw Error('outside root');
    res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');
    res.end(await readFile(path));
  }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
const rows=[];
const pictures=new Set(['index','simple-linear-regression','logistic-regression','kmeans','pca','anova','evaluation-metrics','naive-bayes','deep-learning','neural-networks']);
await mkdir(resolve(out,'screenshots'),{recursive:true});
const modules=(await readdir(resolve(root,'modules'))).filter(f=>f.endsWith('.html')).map(f=>f.replace('.html',''));
try {
 for (const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:width===390?844:1000},deviceScaleFactor:1});
  for(const slug of ['index',...modules]){
   const errors=[];
   const onError=e=>errors.push(e.message);
   page.on('pageerror',onError);
   await page.goto(base+(slug==='index'?'/index.html':`/modules/${slug}.html?academy=1`),{waitUntil:'load',timeout:60000});
   await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,4000))]));
   if(slug==='deep-learning') await page.waitForSelector('.lesson-step');
   await page.waitForTimeout(180);
   const data=await page.evaluate(()=>{
    const candidates='[data-stage],.lesson-step,.stage-section,.stage,.story-section,.chapter,.step';
    const stages=[...document.querySelectorAll('h2')].map(h=>({h,e:h.closest(candidates)})).filter(({h,e})=>e&&e.querySelector('h2')===h);
    const controls=scope=>[...scope.querySelectorAll('input,button,select,details,[role="button"]')].filter(e=>!e.closest('.hw-rough-frame')).map(e=>({tag:e.tagName,type:e.type,id:e.id,label:e.getAttribute('aria-label')||[...(e.labels||[])].map(l=>l.textContent).join(' ')||e.textContent.trim().slice(0,140),value:e.value,min:e.min,max:e.max}));
    return {title:document.title,words:document.body.innerText.trim().split(/\s+/).length,overflow:document.documentElement.scrollWidth>innerWidth+2,bodyWidth:document.documentElement.scrollWidth,
     stages:stages.map(({h,e},i)=>({index:i+1,title:h.textContent.trim(),id:e.id,stage:e.dataset.stage,step:e.dataset.step,text:e.innerText,words:e.innerText.trim().split(/\s+/).length,height:Math.round(e.getBoundingClientRect().height),controls:controls(e)})),
     controls:controls(document),canvases:[...document.querySelectorAll('canvas')].map(e=>({id:e.id,aria:e.getAttribute('aria-label'),role:e.getAttribute('role'),fallback:e.textContent.trim(),width:e.width,height:e.height})),
     visibleLinks:[...document.querySelectorAll('a[href]')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).map(e=>({text:e.textContent.trim(),href:e.getAttribute('href')})),
     resourceScripts:performance.getEntriesByType('resource').filter(e=>/\.js(?:\?|$)/.test(e.name)).map(e=>e.name.replace(location.origin,''))};
   });
   const stageChecks=[];
   for(let i=0;i<data.stages.length;i++){
    const check=await page.evaluate(i=>{
     const candidates='[data-stage],.lesson-step,.stage-section,.stage,.story-section,.chapter,.step';
     const elements=[...document.querySelectorAll('h2')].map(h=>({h,e:h.closest(candidates)})).filter(({h,e})=>e&&e.querySelector('h2')===h).map(x=>x.e);
     elements[i].scrollIntoView({block:'start',behavior:'instant'});
     return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const b=elements[i].getBoundingClientRect();
      r({index:i+1,overflow:document.documentElement.scrollWidth>innerWidth+2,top:Math.round(b.top),height:Math.round(b.height),active:document.querySelector('.statml-stage-button[aria-current="step"]')?.textContent?.trim(),scene:document.querySelector('.study-sketch-board')?.dataset.scene});
     })));
    },i);
    stageChecks.push(check);
   }
   if(pictures.has(slug)){
    if(data.stages.length) await page.evaluate(()=>{
     const h=[...document.querySelectorAll('h2')].find(h=>h.closest('[data-stage],.lesson-step,.stage-section,.stage,.story-section,.chapter,.step'));
     h?.closest('[data-stage],.lesson-step,.stage-section,.stage,.story-section,.chapter,.step')?.scrollIntoView({block:'start',behavior:'instant'});
    });
    else await page.evaluate(()=>scrollTo(0,0));
    await page.waitForTimeout(400);
    await page.screenshot({path:resolve(out,'screenshots',`${slug}-${width}.png`)});
   }
   rows.push({slug,width,...data,stageChecks,errors});
   page.off('pageerror',onError);
   await writeFile(resolve(out,'runtime-inventory.json'),JSON.stringify(rows,null,2));
   console.log(`${width} ${slug}: ${data.stages.length} stages, ${errors.length} JS errors, overflow ${data.overflow||stageChecks.some(s=>s.overflow)}`);
  }
  await page.close();
 }
}finally{await browser.close();server.close();}
