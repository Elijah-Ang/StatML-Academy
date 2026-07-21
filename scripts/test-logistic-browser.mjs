import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { chromium } from 'playwright';

const root=resolve(import.meta.dirname,'..');
const types={'.css':'text/css','.html':'text/html','.js':'text/javascript','.mjs':'text/javascript'};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const relative=normalize(pathname).replace(/^[/\\]+/,'')||'index.html';
    let file=join(root,relative);
    if(!(await stat(file)).isFile())file=join(file,'index.html');
    if(!file.startsWith(root))throw new Error('Path outside test root');
    response.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream'});
    response.end(await readFile(file));
  }catch{
    response.writeHead(404);response.end('Not found');
  }
});

await new Promise(resolveListen=>server.listen(0,'127.0.0.1',resolveListen));
const address=server.address();
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const pageErrors=[];
page.on('pageerror',error=>pageErrors.push(error.message));

const expect=(condition,message)=>{if(!condition)throw new Error(message)};
const expectVisual=async(stage,state)=>{
  await page.locator(`[data-stage="${stage}"]`).evaluate(element=>element.scrollIntoView({block:'center'}));
  await page.waitForFunction(expected=>document.querySelector('#mainCanvas')?.dataset.visualState===expected,state);
};

try{
  await page.goto(`http://127.0.0.1:${address.port}/modules/logistic-regression.html`,{waitUntil:'domcontentloaded'});
  await expectVisual(7,'validation');
  expect(await page.locator('#finalTestResults').isHidden(),'Final test results were visible before reveal');
  await expectVisual(8,'validation-roc');
  await expectVisual(9,'coefficients');
  await expectVisual(10,'pipeline');

  await page.locator('#threshSlider').evaluate(element=>{
    element.value='0.42';
    element.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.locator('#btnRevealTest').click();
  expect(await page.locator('#finalTestResults').isVisible(),'Final test results did not appear after reveal');
  expect(await page.locator('#testThreshold').textContent()==='0.42','Final test snapshot did not use the locked threshold');
  expect(await page.locator('#threshSlider').isDisabled(),'Threshold remained editable after final reveal');
  expect(await page.locator('#btnRevealTest').isDisabled(),'Final reveal action remained available after use');
  expect(pageErrors.length===0,`Browser page errors: ${pageErrors.join('; ')}`);
  console.log('Logistic browser stages and one-time final test reveal passed.');
}finally{
  await browser.close();
  await new Promise(resolveClose=>server.close(resolveClose));
}
