import { chromium } from 'playwright';
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { pilots } from '../lessons/pilots.mjs';
import { expanded } from '../lessons/expanded.mjs';
import { associationRulesLesson } from './generate-association-rules.mjs';

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')));
const lessons = {...pilots, ...expanded, 'association-rules': associationRulesLesson};
const slugs = args.slugs ? args.slugs.split(',') : Object.keys(lessons);
const widths = (args.widths || '1440,390,320').split(',').map(Number);
const out = resolve(args.out || '/tmp/statml-course-review-2026-10-06', args.round || 'review');
const base = args.base || 'http://127.0.0.1:8150';
const sourceFiles=[...Object.keys(lessons).map(slug=>`modules/${slug}.html`),'lessons/pilots.mjs','lessons/expanded/answers.txt','lessons/expanded/reference.json','lessons/visual-guides.mjs','lessons/association-rules/lesson.json',...(await readdir('modules/notebook')).filter(name=>name.endsWith('.js')).map(name=>`modules/notebook/${name}`),'modules/notebook/notebook.css','modules/academic-rigor.js'];
const snapshot=async()=>Object.fromEntries(await Promise.all(sourceFiles.map(async path=>[path,createHash('sha256').update(await readFile(path)).digest('hex')])));
const sourceHashes=await snapshot();
await mkdir(out, {recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true});
const report = {round:args.round || 'review',started:new Date().toISOString(),sourceHashes,widths,scenes:[],errors:[],findings:[]};
let current = '';
const page = await browser.newPage({reducedMotion:'reduce'});
page.on('pageerror',e => report.errors.push({current,error:e.message}));
try {
  for (const slug of slugs) {
    const folder = join(out, slug);
    await mkdir(folder, {recursive:true});
    for (const width of widths) {
      current=`${slug} / ${width} / opening`;
      await page.setViewportSize({width,height:width<=900 ? 844 : 1050});
      await page.goto(`${base}/modules/${slug}.html`);
      await page.waitForFunction(() => window.__notebook);
      await page.evaluate(() => document.fonts.ready);
      const count = await page.locator('article .stage').count();
      if (count !== lessons[slug].stages.length) throw Error('Section count differs: '+slug);
      for (let i=0;i<count;i++) {
        current = `${slug} / ${width} / ${i+1}`;
        await page.locator('article .stage').nth(i).evaluate(el => el.scrollIntoView({block:'start',behavior:'instant'}));
        await page.waitForFunction(i => window.__notebook.stage === i,i);
        const position = await page.evaluate(() => scrollY);
        if(width<=900) await page.locator('[data-open-lab]').click();
        await page.waitForFunction(() => !window.__notebook.controller.tween?.raf);
        const result = await page.evaluate(() => {
          const svg = document.querySelector('#lab-panel svg'), vb=svg.viewBox.baseVal;
          const texts=[...svg.querySelectorAll('text')].filter(t=> !t.closest('[display="none"]') && getComputedStyle(t).display!=='none' && getComputedStyle(t).visibility!=='hidden' && t.textContent.trim()).map(t=>{
            const b=t.getBoundingClientRect(),s=t.getBBox();
            return {key:t.dataset.key,text:t.textContent,box:{x:b.x,y:b.y,w:b.width,h:b.height},svgbox:{x:s.x,y:s.y,w:s.width,h:s.height}};
          });
          const collisions=[];
          for(let a=0;a<texts.length;a++) for(let b=a+1;b<texts.length;b++) {
            const A=texts[a].box,B=texts[b].box;
            const dx=Math.min(A.x+A.w,B.x+B.w)-Math.max(A.x,B.x),dy=Math.min(A.y+A.h,B.y+B.h)-Math.max(A.y,B.y);
            if(dx>2 && dy>2) collisions.push([texts[a].key,texts[b].key,texts[a].text,texts[b].text]);
          }
          const clipped=texts.filter(t=>t.svgbox.x<-.7 || t.svgbox.y<-.7 || t.svgbox.x+t.svgbox.w>vb.width+.7 || t.svgbox.y+t.svgbox.h>vb.height+.7).map(t=>({key:t.key,text:t.text}));
          return {scene:window.__notebook.controller.scene,svg:{width:vb.width,height:vb.height},collisions,clipped,
            overflow:document.documentElement.scrollWidth>innerWidth+1,
            dialogOverflow:document.querySelector('dialog').open&&document.querySelector('dialog').scrollWidth>document.querySelector('dialog').clientWidth+1,
            nonfiniteGeometry:[...svg.querySelectorAll('*')].some(n=>[...n.attributes].some(a=>/NaN|Infinity/.test(a.value))),
            title:document.querySelector('#lab-title').textContent,
            heading:document.querySelectorAll('article .stage')[window.__notebook.stage].querySelector('h2').textContent,
            prompt:document.querySelector('.scene-prompt')?.textContent || '',
            legend:document.querySelector('.scene-legend')?.textContent || '',
            svgText:texts.map(t=>t.text),
            invalidParagraphs:document.querySelectorAll('p p,p div,p table,p pre').length};
        });
        if(args.shots==='all' || result.collisions.length || result.clipped.length || [0,Math.floor(count/2),count-1].includes(i)) {
          await page.locator('#lab-panel').screenshot({path:join(folder,`${i+1}-${width}-visual.png`)});
          if(width>900) await page.screenshot({path:join(folder,`${i+1}-${width}-reading.png`)});
        }
        if(width<=900) {
          await page.keyboard.press('Escape');
          result.returnPosition=Math.abs(await page.evaluate(()=>scrollY)-position)<3;
          result.returnFocus=await page.locator('[data-open-lab]').evaluate(el=>el===document.activeElement);
        }
        report.scenes.push({slug,section:i+1,width,...result});
        if(result.collisions.length || result.clipped.length || result.overflow || result.dialogOverflow || result.nonfiniteGeometry || result.invalidParagraphs || result.returnPosition===false || result.returnFocus===false) report.findings.push({slug,section:i+1,width,...result});
      }
    }
    await writeFile(join(out,'audit.json'),JSON.stringify(report,null,2));
    console.log(`${slug}: ${lessons[slug].stages.length} sections checked at ${widths.length} widths`);
  }
} catch(error) {
  report.errors.push({current,error:error.message,url:page.url(),body:(await page.locator('body').innerText().catch(()=>'' )).slice(0,500)});
  throw error;
} finally {
  await browser.close();
  report.finished=new Date().toISOString();
  report.sourceStable=JSON.stringify(sourceHashes)===JSON.stringify(await snapshot());
  if(!report.sourceStable)report.errors.push({error:'Lesson source changed during the audit. Repeat on a stable snapshot.'});
  await writeFile(join(out,'audit.json'),JSON.stringify(report,null,2));
}
console.log(JSON.stringify({round:report.round,checks:report.scenes.length,findings:report.findings.length,errors:report.errors.length}));
if(report.errors.length || report.findings.length) process.exitCode=1;
