// Local browser regression coverage. Synthetic storage and explicit research fallback.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'artifacts/motion');
await fs.mkdir(output,{recursive:true});
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox']});
async function fixture(width,reducedMotion,withoutMotion=false){
 const record=process.env.MOTION_VIDEO==='1'&&width===1280&&reducedMotion==='no-preference'&&!withoutMotion;
 const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width<500,reducedMotion,locale:'en-US',timezoneId:'UTC',serviceWorkers:'block',...(record?{recordVideo:{dir:path.join(output,'video'),size:{width,height:1000}}}:{})});
 const page=await context.newPage(),errors=[];let requests=0;
 page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.motionAudit={completed:0,reveals:0,steps:[],loading:[],totals:[]};
  document.addEventListener('checkin:complete',()=>window.motionAudit.completed++);
  document.addEventListener('animationstart',e=>{
   if(e.animationName==='report-arrive'&&e.target.id==='report-snapshot')window.motionAudit.reveals++;
   if(e.animationName==='step-appear')window.motionAudit.steps.push(e.target.dataset.step);
  });
  document.addEventListener('DOMContentLoaded',()=>{
   const loading=document.getElementById('loading-progress');
   new MutationObserver(()=>window.motionAudit.loading.push(loading.value)).observe(loading,{attributes:true,attributeFilter:['value']});
   new MutationObserver(()=>window.motionAudit.totals.push([document.getElementById('daily').textContent,document.getElementById('weekly').textContent])).observe(document.getElementById('report-snapshot'),{subtree:true,childList:true,characterData:true});
  });
 });
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!=='https://motion.local')return route.abort();
  if(url.pathname==='/api/health-information'){requests++;return route.fulfill({status:503,contentType:'application/json',body:'{"code":"motion_test_fallback"}'});}
  if(withoutMotion&&url.pathname==='/motion.js')return route.fulfill({contentType:'text/javascript',body:'/* optional enhancement unavailable */'});
  const file=path.resolve(root,'public',url.pathname==='/'?'index.html':url.pathname.slice(1));
  assert(file.startsWith(path.join(root,'public')+path.sep));
  await route.fulfill({body:await fs.readFile(file),contentType:file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html; charset=utf-8'});
 });
 await page.goto('https://motion.local/');
 if(record)await page.waitForTimeout(600);
 return {context,page,errors,requests:()=>requests};
}
const style=(p,selector,key,pseudo)=>p.locator(selector).evaluate((e,{key,pseudo})=>getComputedStyle(e,pseudo)[key],{key,pseudo});
const overflow=p=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
async function step(page,n,enhanced=true){
 assert.equal(await page.locator('#step-count').textContent(),`Step ${n} of 5`);
 assert.equal(await page.locator('#step-progress').evaluate(e=>e.value),n);
 assert.equal(await page.locator('.assessment-step:visible').count(),1);
 assert.equal(await page.locator('.assessment-step:visible').getAttribute('data-step'),String(n));
 assert.equal(await page.evaluate(()=>document.activeElement.id),`step-title-${n}`);
 if(enhanced){await page.waitForFunction(n=>document.querySelector('.step-progress-fill').style.transform===`scaleX(${n/5})`,n);assert.equal(await page.locator('.step-progress-fill').getAttribute('aria-hidden'),'true');}
 assert(!await overflow(page));
 if(process.env.MOTION_VIDEO==='1'&&page.viewportSize().width===1280)await page.waitForTimeout(280);
}
async function enterUsage(page){
 await page.locator('.platform-slider').first().evaluate(el=>{el.value=platformPosition(180);el.dispatchEvent(new Event('input',{bubbles:true}));});
}
async function answerRoutine(page){for(const key of ['bedtime','tasks','movement','people','longer'])await page.check(`input[name="${key}"][value="${key==='bedtime'?'Sometimes':'Never'}"]`);}
async function finish(page){
 const initial=await page.evaluate(()=>{document.getElementById('checkin').requestSubmit();return {value:document.getElementById('loading-progress').value,visible:!document.getElementById('flow-loading').hidden};});
 assert.deepEqual(initial,{value:1,visible:true});
 await page.locator('#result').waitFor({state:'visible'});
 await page.waitForFunction(()=>document.getElementById('education-live-status').textContent.includes('could not'));
 assert.equal(await page.locator('#loading-progress').evaluate(e=>e.value),100);
 assert.equal(await page.locator('#daily').textContent(),'3h');
 assert.equal(await page.locator('#weekly').textContent(),'21h');
 assert.equal(await page.locator('#yearly').textContent(),'1,095h');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'result-title');
 assert(await page.locator('#checkin').isHidden());
}
try{
 for(const reducedMotion of ['no-preference','reduce'])for(const width of [320,390,768,1280]){
  const f=await fixture(width,reducedMotion),{page}=f;const reduced=reducedMotion==='reduce';
  try{
   assert.equal(await style(page,'body','animationName','::before'),reduced?'none':'atmosphere-drift');
   if(!reduced)assert.equal(await style(page,'body','animationDuration','::before'),'40s');
   if(width===1280&&!reduced){
    const cdp=await f.context.newCDPSession(page);await cdp.send('Performance.enable');
    const before=await cdp.send('Performance.getMetrics'),box=await page.locator('#home-title').boundingBox();
    await page.waitForTimeout(1050);const after=await cdp.send('Performance.getMetrics');
    const layouts=m=>m.metrics.find(v=>v.name==='LayoutCount').value;
    assert.equal(layouts(after),layouts(before));assert.deepEqual(await page.locator('#home-title').boundingBox(),box);await cdp.detach();
   }
   assert(!await overflow(page));
   await page.locator('#home-start').focus();assert.notEqual(await style(page,'#home-start','outlineStyle'),'none');
   if(width>=768){
    await page.hover('#home-start');await page.waitForTimeout(210);assert.equal((await style(page,'#home-start','transform'))==='none',reduced);
    await page.mouse.down();await page.waitForTimeout(90);const pressed=await style(page,'#home-start','transform');assert.equal(pressed==='none',reduced);if(!reduced)assert.match(pressed,/0\.99/);
    await page.mouse.move(0,0);await page.mouse.up();
   }
   await page.locator('#home-start').press('Enter');await step(page,1);
   await page.click('#flow-next');assert.equal(await page.evaluate(()=>document.activeElement.id),'age');assert(await page.locator('#age-error').isVisible());assert(!await page.locator('#error').isVisible());assert.equal(await page.locator('#step-progress').evaluate(e=>e.value),1);
   await page.fill('#name','Motion Demo');await page.fill('#age','30');
   await page.evaluate(()=>document.getElementById('checkin').requestSubmit());await page.waitForTimeout(90);
   const scale=await page.locator('.step-progress-fill').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a);
   assert(reduced?Math.abs(scale-.4)<.001:scale>.2&&scale<.4,`progress must ${reduced?'jump immediately':'interpolate'}: ${scale}`);
   await step(page,2);await enterUsage(page);
   await page.click('#flow-back');await step(page,1);assert.equal(await page.locator('#age').inputValue(),'30');await page.click('#flow-next');await step(page,2);
   assert.match(await page.locator('#platform-total').textContent(),/3h/);
   await page.click('#flow-next');await step(page,3);
   await page.fill('#sleep-hours','30');await page.click('#flow-next');assert.equal(await page.evaluate(()=>document.activeElement.id),'sleep-hours');assert.match(await page.locator('#error').textContent(),/sleep hours/);
   await page.fill('#sleep-hours','7');await page.fill('#sleep-minutes','30');await page.check('input[name="prebed"][value="Sometimes"]');await page.click('#flow-next');await step(page,4);
   await page.fill('#activity-hours','0');await page.fill('#activity-minutes','45');await page.click('#flow-next');await step(page,5);await answerRoutine(page);
   await page.click('#flow-back');await step(page,4);assert.equal(await page.locator('#activity-minutes').inputValue(),'45');await page.click('#flow-next');await step(page,5);
   // Rapid alternating navigation interrupts CSS naturally; never queues a stale step.
   await page.evaluate(()=>{document.getElementById('flow-back').click();document.getElementById('checkin').requestSubmit();document.getElementById('flow-back').click();});
   await step(page,4);await page.click('#flow-next');await step(page,5);assert(await page.locator('input[name="bedtime"][value="Sometimes"]').isChecked());
   await finish(page);
   await page.waitForTimeout(550);
   const audit=await page.evaluate(()=>window.motionAudit);
   assert.equal(audit.completed,1);assert.equal(audit.reveals,reduced?0:1);assert.equal(audit.steps.length===0,reduced);
   assert.equal(audit.loading.at(-1),100);assert(audit.loading.every((x,i,a)=>i===0||x>=a[i-1]));
   assert(audit.totals.filter(a=>a[0]!=='—').every(a=>a[0]==='3h'&&a[1]==='21h'));
   assert(!await page.locator('#result').evaluate(e=>e.classList.contains('report-enter')));
   assert.equal(await page.locator('#result details[open]').count(),0);
   const report=await page.locator('#result').innerText(),requests=f.requests();
   await page.click('#explore-tools');assert.equal(await style(page,'.tools-grid > :first-child','transform'),'none');
   await page.locator('#tools-screen [data-view="reduction"]').click();assert(await page.locator('#save-goal').isDisabled());await page.hover('#save-goal');assert.equal(await style(page,'#save-goal','transform'),'none');await page.locator('#reduction-screen [data-view="tools"]').click();
   await page.locator('#tools-report').press('Enter');assert.equal(await page.locator('#result').innerText(),report);assert.equal(f.requests(),requests);
   assert.equal(await page.evaluate(()=>window.motionAudit.reveals),reduced?0:1);assert(!await overflow(page));
   await page.screenshot({path:path.join(output,`report-${width}-${reducedMotion}.png`)});
   // Mid-session preference changes must not revive an old reveal.
   await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await style(page,'body','animationName','::before'),'none');
   await page.emulateMedia({forcedColors:'active'});
   assert.equal(await style(page,'.step-progress-fill','display'),'none');assert.equal(await style(page,'#step-progress','opacity'),'1');
   await page.emulateMedia({forcedColors:'none',reducedMotion});
   await page.click('#start-new-checkin');await step(page,1);assert.equal(await page.locator('#name').inputValue(),'');
   if(width===1280){
    await page.fill('#age','30');await page.click('#flow-next');await enterUsage(page);await page.click('#flow-next');await page.fill('#sleep-hours','7');await page.check('input[name="prebed"][value="Never"]');await page.click('#flow-next');await page.fill('#activity-hours','0');await page.click('#flow-next');await answerRoutine(page);await finish(page);await page.waitForTimeout(550);
    assert.equal(await page.evaluate(()=>window.motionAudit.completed),2);assert.equal(await page.evaluate(()=>window.motionAudit.reveals),reduced?0:2);
   }
   assert.deepEqual(f.errors,[]);console.log(`PASS motion ${width}px ${reducedMotion}: steps, values, validation, focus, progress, loading, figures, report return, reset, forced colors, no overflow/errors`);
  }finally{const video=page.video();await f.context.close();if(video)await video.saveAs(path.join(output,'motion-demo.webm'));}
 }
 const f=await fixture(390,'no-preference',true),{page}=f;
 try{
  assert.equal(await page.locator('.step-progress-track').count(),0);
  await page.click('#home-start');await step(page,1,false);await page.fill('#age','30');await page.click('#flow-next');await step(page,2,false);await enterUsage(page);await page.click('#flow-next');await page.fill('#sleep-hours','7');await page.check('input[name="prebed"][value="Never"]');await page.click('#flow-next');await page.fill('#activity-hours','0');await page.click('#flow-next');await answerRoutine(page);await finish(page);assert.deepEqual(f.errors,[]);
  console.log('PASS optional motion script unavailable: native progress, navigation and report still work');
 }finally{await f.context.close();}
}finally{await browser.close();}
