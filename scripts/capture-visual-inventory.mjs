import {chromium} from 'playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const args=Object.fromEntries(process.argv.slice(2).map(a=>a.replace(/^--/,'').split('=')));
const audit=JSON.parse(await readFile(resolve(args.audit),'utf8'));
const out=resolve(args.out);await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'});
const errors=[],copy=[];page.on('pageerror',e=>errors.push(e.message));
try{
 for(const slug of [...new Set(audit.scenes.map(s=>s.slug))]){
  await mkdir(join(out,slug),{recursive:true});
  await page.goto(`${args.base}/modules/${slug}.html`);await page.waitForFunction(()=>window.__notebook);await page.evaluate(()=>document.fonts.ready);
  // Isolate the full drawing without the sticky panel's viewport clipping.
  // Viewport/modal usability is checked separately by the course audit.
  for(const row of audit.scenes.filter(s=>s.slug===slug&&s.width===1440)){
   await page.evaluate(()=>document.querySelector('#lab-panel').removeAttribute('style'));
   await page.locator('article .stage').nth(row.section-1).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
   await page.waitForFunction(i=>window.__notebook.stage===i,row.section-1);await page.waitForFunction(()=>!window.__notebook.controller.tween?.raf);
   await page.evaluate(()=>{const panel=document.querySelector('#lab-panel'),r=panel.getBoundingClientRect();Object.assign(panel.style,{maxHeight:'none',overflow:'visible',position:'fixed',top:'0px',left:r.x+'px',width:r.width+'px'});});
   await page.locator('#lab-panel svg').screenshot({path:join(out,slug,`${row.section}.png`)});
   copy.push({slug,section:row.section,...await page.evaluate(()=>({panelText:document.querySelector('#lab-panel').innerText,controls:[...document.querySelectorAll('#lab-panel input,#lab-panel select,#lab-panel button')].filter(el=>el.checkVisibility()).map(el=>({id:el.id,label:el.closest('label')?.querySelector('span')?.textContent||el.getAttribute('aria-label')||el.textContent,value:el.value??null,options:el.options?[...el.options].map(o=>({value:o.value,label:o.textContent})):undefined,disabled:el.disabled}))}))});
  }
  console.log(slug);
 }
}finally{await browser.close();await writeFile(join(out,'runtime-errors.json'),JSON.stringify(errors));await writeFile(join(out,'exact-rendered-copy.json'),JSON.stringify(copy,null,2));}
if(errors.length)throw Error(errors.join('\n'));
