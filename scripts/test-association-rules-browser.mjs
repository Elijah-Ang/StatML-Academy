import { auditOutput } from './audit-output.mjs';
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, join } from "node:path";
import { topics } from "../modules/notebook/topics.js";
import { CORE_MODULES } from "./core-modules.mjs";
import { associationRulesPage, associationRulesLesson } from "./generate-association-rules.mjs";

const root = resolve(import.meta.dirname, "..");
assert.equal(await readFile(resolve(root, "modules/association-rules.html"), "utf8"), associationRulesPage(), "Generated Association Rules source drift");
const server = createServer(async (req, res) => {
  try {
    const file = resolve(root, "." + decodeURIComponent(new URL(req.url, "http://local").pathname));
    if (!file.startsWith(root + "/")) throw Error();
    res.setHeader("Content-Type", { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".pdf": "application/pdf" }[extname(file)] || "application/octet-stream");
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ reducedMotion: "reduce", viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
const visit = async () => {
  await page.goto(base + "/modules/association-rules.html");
  await page.waitForFunction(() => window.__notebook);
  await page.evaluate(() => document.fonts.ready);
};
const stage = async i => {
  await page.locator("article .stage").nth(i).evaluate(el => el.scrollIntoView({ behavior: "instant", block: "start" }));
  await page.waitForFunction(i => window.__notebook.stage === i, i);
};
try {
  // Both curriculum maps expose the new lesson in its own unsupervised family.
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto(base + "/index.html");
    const map = width > 1100 ? ".module-node" : ".mobile-node";
    const route = page.locator(`${map} a[href='modules/association-rules.html'], a${map}[href='modules/association-rules.html']`);
    assert.equal(await route.count(), 1);
    await route.click();
    await page.waitForFunction(() => window.__notebook);
    assert.equal(await page.locator("article .stage").count(), 21);
    await page.locator(".statml-site-nav .brand").click();
    assert.equal(new URL(page.url()).pathname, "/index.html");
  }
  // Every existing lesson supplies the same directory and reset control.
  for (const slug of Object.keys(topics)) {
    await page.goto(`${base}/modules/${slug}.html`);
    await page.waitForFunction(() => window.__notebook);
    assert.equal(await page.locator(".topic-directory a").count(), Object.keys(topics).length, slug);
    assert.equal(await page.locator('.topic-directory a[href="association-rules.html"]').count(), 1, slug);
    assert.equal(await page.locator("[data-reset]").getAttribute("aria-label"), "Reset notebook", slug);
    assert.equal(await page.locator('.topic-directory [aria-current="page"]').getAttribute("href"), `${slug}.html`);
  }
  await visit();
  const coreIndex = CORE_MODULES.findIndex(m => m.slug === "association-rules");
  const sequence = await page.locator(".statml-core-sequence a").evaluateAll(links => links.map(a => a.getAttribute("href")));
  assert.deepEqual(sequence, [CORE_MODULES[coreIndex - 1].slug + ".html", CORE_MODULES[coreIndex + 1].slug + ".html"]);
  const sourceLinks = await page.locator('#sources a[href^="../assets/"], a[download]').evaluateAll(links => links.map(a => a.href));
  assert.equal(sourceLinks.length, 7);
  for (const url of sourceLinks) assert.equal((await page.request.get(url)).status(), 200, url);

  // Scrolling, visible titles and phone dialogs stay coupled for all 21 ideas.
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width <= 900 ? 844 : 1100 });
    await visit();
    for (let i = 0; i < 21; i++) {
      await stage(i);
      assert.equal(await page.locator("#lab-title").textContent(), associationRulesLesson.stages[i].title);
      const readingY = await page.evaluate(() => { window.retainedPanel = document.querySelector("#lab-panel"); return scrollY; });
      if (width <= 900) await page.locator("[data-open-lab]").click();
      assert.equal(await page.evaluate(() => window.__notebook.stage), i);
      assert.ok(await page.locator("#lab-content svg").isVisible());
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      if (width <= 900) {
        await page.keyboard.press("Escape");
        assert.ok(await page.evaluate(y => !document.querySelector("dialog").open && document.querySelector("#lab-panel") === window.retainedPanel && document.querySelector("#lab-panel").parentElement.matches(".lab-home") && Math.abs(scrollY - y) < 3 && document.activeElement.matches("[data-open-lab]"), readingY));
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1100 });
  await visit();
  await page.locator('[data-item="Coke"]').uncheck();
  assert.equal(await page.evaluate(() => window.__notebook.controller.state.baskets[0].items.includes("Coke")), false);
  await stage(19);
  const changed = await page.evaluate(() => window.__notebook.controller.result.pythonPatterns.length);
  await page.locator("[data-reset]").click();
  assert.equal(await page.evaluate(() => window.__notebook.stage), 19);
  assert.deepEqual(await page.evaluate(() => [window.__notebook.controller.result.pythonPatterns.length, window.__notebook.controller.result.pythonRules.length]), [9, 5]);
  assert.notEqual(changed, 9);
  await stage(20);
  await page.locator("#revision-question").selectOption("0");
  await page.locator('[data-review-answer="0:0"]').click();
  assert.ok((await page.locator("#revision-feedback").textContent()).includes("Support uses every transaction"));
  await page.setViewportSize({ width: 390, height: 844 });
  await stage(20);
  await page.locator("[data-open-lab]").click();
  await page.locator('[data-review-answer="0:1"]').click();
  await page.locator("[data-close-lab]").click();
  await page.locator("[data-open-lab]").click();
  assert.ok(await page.locator('[data-review-answer="0:1"]').evaluate(el => el.dataset.chosen === "true"));
  await page.keyboard.press("Escape");
  // Independently check the learner-visible cutoff decisions, altered controls,
  // empty antecedents, phone geometry and rapid interrupted input updates.
  const cutoffOut=auditOutput(root,'audit-evidence/association-rule-cutoffs-2026-10-07');
  await mkdir(cutoffOut,{recursive:true});
  const cutoffReport={browser:'Native Google Chrome on the connected Mac',states:[]};
  const input=async(id,value)=>page.locator('#'+id).evaluate((el,value)=>{
    el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));
  },value);
  const settled=()=>page.waitForFunction(()=>!window.__notebook.controller.tween.raf);
  const verifyCutoffs=async(label)=>{
    await settled();
    const evidence=await page.evaluate(()=>{
      const c=window.__notebook.controller,s=c.state,r=c.result,rule=r.splits[Math.min(s.split,r.splits.length-1)];
      const joint=s.baskets.filter(row=>[...rule.x,...rule.y].every(item=>row.items.includes(item))).length;
      const left=s.baskets.filter(row=>rule.x.every(item=>row.items.includes(item))).length;
      const support=joint/s.baskets.length,confidence=left?joint/left:null;
      const supportPass=support>=s.minSupport/100,confidencePass=confidence!==null&&confidence>=s.minConfidence/100;
      const text=prefix=>[...document.querySelectorAll('#lab-content svg text')].filter(n=>!n.closest('[display="none"]')&&n.dataset.key?.startsWith(prefix)).map(n=>n.textContent).join(' ');
      const rate=x=>x===null?'Undefined':(x*100).toFixed(1)+'%';
      const supportExpected=`Support: ${joint}/${s.baskets.length} = ${rate(support)}; cutoff ${rate(s.minSupport/100)}; ${supportPass?'passes':'does not pass'}.`;
      const confidenceExpected=`Confidence: ${joint}/${left} = ${rate(confidence)}${confidence===null?' (no baskets contain X)':''}; cutoff ${rate(s.minConfidence/100)}; ${confidencePass?'passes':'does not pass'}.`;
      const svg=document.querySelector('#lab-content svg'),vb=svg.viewBox.baseVal;
      const ts=[...svg.querySelectorAll('text')].filter(n=>!n.closest('[display="none"]')&&n.textContent.trim()).map(n=>({text:n.textContent,b:n.getBBox()}));
      const clipped=ts.filter(({b})=>b.x<-.7||b.y<-.7||b.x+b.width>vb.width+.7||b.y+b.height>vb.height+.7).map(n=>n.text);
      const collisions=[];for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){const a=ts[i].b,b=ts[j].b;if(Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>2&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>2)collisions.push([ts[i].text,ts[j].text]);}
      const receipt=[...document.querySelectorAll('#live-receipt tbody tr')].map(row=>[...row.children].map(cell=>cell.textContent));
      const receiptDecisions=r.splits.map(p=>{
        const j=s.baskets.filter(row=>[...p.x,...p.y].every(item=>row.items.includes(item))).length;
        const a=s.baskets.filter(row=>p.x.every(item=>row.items.includes(item))).length;
        return j/s.baskets.length>=s.minSupport/100&&a>0&&j/a>=s.minConfidence/100?'Yes':'No';
      });
      return {support:text('split-support-check'),confidence:text('split-confidence-check'),verdict:text('split-verdict'),supportExpected,confidenceExpected,verdictExpected:supportPass&&confidencePass?'Passes both cutoffs.':'Does not pass both cutoffs.',receipt,receiptDecisions,clipped,collisions,overflow:document.documentElement.scrollWidth>innerWidth+1};
    });
    assert.equal(evidence.support,evidence.supportExpected,label);
    assert.equal(evidence.confidence,evidence.confidenceExpected,label);
    assert.equal(evidence.verdict,evidence.verdictExpected,label);
    assert.deepEqual(evidence.receipt.map(row=>row[3]),evidence.receiptDecisions,label);
    assert.deepEqual(evidence.clipped,[],label);assert.deepEqual(evidence.collisions,[],label);assert.equal(evidence.overflow,false,label);
    cutoffReport.states.push({label,...evidence});
  };
  for(const width of [1440,430,320])for(const motion of ['reduce','no-preference']){
    await page.emulateMedia({reducedMotion:motion});
    await page.setViewportSize({width,height:width<=900?844:1100});await visit();await stage(9);
    if(width<=900)await page.locator('[data-open-lab]').click();
    for(const [support,confidence] of [[50,90],[50,60],[75,60],[75,90]]){
      await input('minimum-support',support);await input('minimum-confidence',confidence);
      await verifyCutoffs(`${width}/${motion}: support ${support}, confidence ${confidence}`);
    }
    await input('minimum-support',50);await input('minimum-confidence',90);
    for(let split=1;split<=6;split++){await input('rule-split',split);await verifyCutoffs(`${width}/${motion}: split ${split}`);}
    await page.locator('#itemset-choice').selectOption('Apple|DVD');await input('minimum-support',25);await input('minimum-confidence',50);
    await verifyCutoffs(`${width}/${motion}: confidence equality`);
    await page.locator('#itemset-choice').selectOption('Apple|Bread|DVD');await input('rule-split',6);await input('minimum-confidence',0);
    await verifyCutoffs(`${width}/${motion}: empty antecedent at zero confidence cutoff`);
    await page.locator('#itemset-choice').selectOption('Bread|Coke|Egg');
    await page.locator('#minimum-confidence').evaluate(el=>{for(const value of [0,100,5,95,60,90]){el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));}});
    await input('minimum-support',50);await verifyCutoffs(`${width}/${motion}: rapid interrupted inputs settle to 90`);
    if(width<=900){
      await page.locator('dialog[open]').evaluate(el=>{el.scrollTop=0;});await page.screenshot({path:join(cutoffOut,`section10-${width}-${motion}-top.png`)});
      await page.locator('dialog[open]').evaluate(el=>{el.scrollTop=el.scrollHeight;});await page.screenshot({path:join(cutoffOut,`section10-${width}-${motion}-bottom.png`)});
      await page.keyboard.press('Escape');await page.locator('[data-open-lab]').click();await verifyCutoffs(`${width}/${motion}: repeated modal reopen`);await page.keyboard.press('Escape');
    }else await page.locator('#lab-content svg').screenshot({path:join(cutoffOut,`section10-${width}-${motion}.png`)});
  }
  await writeFile(join(cutoffOut,'cutoff-states.json'),JSON.stringify(cutoffReport,null,2));
  console.log(`Association Rules cutoff review passed: ${cutoffReport.states.length} rendered states at 1440/430/320px, normal/reduced motion, separate decisions, equality, undefined confidence, altered splits, repeated modal use and interrupted inputs.`);
  const noJS = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 844 } });
  await noJS.goto(base + "/modules/association-rules.html");
  assert.equal(await noJS.locator("article .stage").count(), 21);
  assert.ok(await noJS.locator(".answer").first().isVisible());
  assert.equal(await noJS.locator("[data-open-lab]").isVisible(), false);
  await noJS.locator(".deeper summary").first().click();
  assert.notEqual(await noJS.locator(".deeper").first().getAttribute("open"), null);
  await noJS.close();
  assert.deepEqual(errors, []);
  console.log("Association Rules integration passed: 34 directories, both Universe maps, core neighbors, seven downloads, 105 section/width cases, reset, revision answers and no-JavaScript reading.");
} finally { await browser.close(); server.close(); }
