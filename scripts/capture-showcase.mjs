// Documentation capture only: real local UI, isolated synthetic storage, no live APIs.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(root,process.env.SCREENSHOT_DIR||'artifacts/screenshots');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
await fs.mkdir(output,{recursive:true});
// Remove only outputs this script owns; a failed run cannot retain a stale gallery.
const names=['homepage','assessment-name-validation-mobile','assessment-sleep-warning-mobile','assessment-step-1','assessment-age-validation-mobile','assessment-step-2','assessment-step-2-sliders','assessment-step-3','assessment-step-4','assessment-step-5','results-report','results-insights','results-next-steps','health-education','my-tools','sleep-tracker','sleep-tracker-tracking','sleep-tracker-seven-night-summary','reduction-goal','reduction-savings','progress','progress-comparison'];
const reportReviews=['no-preference','reduce'].flatMap(mode=>[320,390,768,1280].map(width=>`report-${width}-${mode}.png`));
for(const name of [...reportReviews,...names.map(n=>n+'.png'),'mobile-results.png','manifest.json','failure.png','failure.txt'])await fs.rm(path.join(output,name),{force:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:process.env.CHROMIUM_PATH?['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox']:[]});
const context=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1,locale:'en-US',timezoneId:'UTC',colorScheme:'light',reducedMotion:'reduce',serviceWorkers:'block'});
const page=await context.newPage(),errors=[],captures=[];page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
await context.route('**/*',async route=>{
 const url=new URL(route.request().url());
 if(url.origin!=='https://showcase.local')return route.abort();
 if(url.pathname==='/api/health-information')return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({code:'showcase_offline_fixture'})});
 const file=path.resolve(root,'public',url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1)));
 if(!file.startsWith(path.join(root,'public')+path.sep))return route.abort();
 try{await route.fulfill({body:await fs.readFile(file),contentType:file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html'});}catch{await route.fulfill({status:404,body:'Not found'});}
});
// Capture complete semantic sections, not a fixed-height screen. A range of
// selectors frames adjacent content without moving, hiding or rebuilding UI.
async function capture(name,selectors,width=1280){
 await page.setViewportSize({width,height:900});
 await page.evaluate(async()=>{await document.fonts.ready;window.scrollTo(0,0);if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});
 await page.mouse.move(0,0);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const frame=async()=>page.evaluate(selectors=>{
  const pad=selectors.includes('.shield-night')?0:selectors.some(s=>s.startsWith('.platform-row'))?6:16;
  const boxes=selectors.flatMap(s=>[...document.querySelectorAll(s)]).filter(e=>e.getClientRects().length).map(e=>e.getBoundingClientRect());
  if(!boxes.length)throw Error('No visible capture targets');
  const x=Math.max(0,Math.floor(Math.min(...boxes.map(b=>b.left))-pad));
  const y=Math.max(0,Math.floor(Math.min(...boxes.map(b=>b.top))+scrollY-pad));
  const right=Math.min(innerWidth,Math.ceil(Math.max(...boxes.map(b=>b.right))+pad));
  const bottom=Math.ceil(Math.max(...boxes.map(b=>b.bottom))+scrollY+pad);
  return {x,y,width:right-x,height:bottom-y};
 },selectors);
 let clip=await frame();
 // Keep the entire capture in the viewport so sticky totals do not obscure
 // labels when Chromium scrolls a long locator into view.
 await page.setViewportSize({width,height:Math.max(900,clip.y+clip.height+24)});
 await page.evaluate(()=>window.scrollTo(0,0));clip=await frame();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name}: horizontal overflow`);
 const buffer=await page.screenshot({type:'png',animations:'disabled',caret:'hide',scale:'css',clip});
 await fs.writeFile(path.join(output,name+'.png'),buffer);
 captures.push({file:name+'.png',viewport:page.viewportSize(),framing:selectors,dimensions:{width:clip.width,height:clip.height},bytes:buffer.length,sha256:createHash('sha256').update(buffer).digest('hex')});
 console.log('Captured '+name+' '+clip.width+'×'+clip.height);
}
// Preserve the former motion-suite stills in the dedicated visual stage.
// Freeze animation only during capture; motion behavior is tested without this setting.
async function captureReportReviews(){
 for(const reducedMotion of ['no-preference','reduce'])for(const width of [320,390,768,1280]){
  await page.emulateMedia({reducedMotion});await page.setViewportSize({width,height:1000});
  await page.locator('#result-title').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`report review ${width}: overflow`);
  const file=`report-${width}-${reducedMotion}.png`;
  const buffer=await page.screenshot({type:'png',animations:'disabled',caret:'hide',scale:'css'});
  await fs.writeFile(path.join(output,file),buffer);
  captures.push({file,viewport:page.viewportSize(),reducedMotion,animations:'disabled for still capture only',bytes:buffer.length,sha256:createHash('sha256').update(buffer).digest('hex')});
  console.log('Captured review '+file);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
}
async function usePlatform(name,minutes){await page.getByRole('slider',{name:name+' daily usage',exact:true}).evaluate((el,n)=>{el.value=platformPosition(n);el.dispatchEvent(new Event('input',{bubbles:true}));},minutes);}
async function finishAssessment(instagram,showAllSteps=false){
 await usePlatform('Instagram',instagram);await usePlatform('YouTube',60);await usePlatform('TikTok',30);
 await page.click('#flow-next');await page.fill('#sleep-hours','7');await page.fill('#sleep-minutes','30');
 if(showAllSteps){await capture('assessment-step-3',['#checkin']);await page.fill('#sleep-hours','6');await capture('assessment-sleep-warning-mobile',['#checkin'],390);await page.fill('#sleep-hours','7');}
 await page.click('#flow-next');await page.fill('#activity-hours','0');await page.fill('#activity-minutes','45');
 if(showAllSteps)await capture('assessment-step-4',['#checkin']);
 await page.click('#flow-next');await page.check('input[name="prebed"][value="Sometimes"]');
 for(const [key,value] of Object.entries({bedtime:'Sometimes',tasks:'Sometimes',movement:'Never',people:'Sometimes',longer:'Sometimes'}))await page.check(`input[name="${key}"][value="${value}"]`);
 if(showAllSteps){assert.equal(await page.locator('#questions fieldset').count(),6);await capture('assessment-step-5',['#checkin']);}
 await page.click('#flow-next');await page.locator('#result').waitFor({state:'visible'});
 await page.waitForFunction(()=>document.getElementById('education-live-status').textContent.includes('Evidence-based educational resources'));
}
async function begin(){await page.fill('#name','Test User');await page.fill('#age','25');await page.click('#flow-next');}
async function hub(){await page.locator('[data-view="tools"]:visible').first().click();}
async function tool(view){await page.locator(`#tools-screen [data-view="${view}"]`).click();}
try{
 await page.goto('https://showcase.local/');assert.equal(await page.evaluate(()=>localStorage.length),0);await capture('homepage',['header','#home-screen','.creator-credit','footer']);
 await page.click('#home-start');await begin();await finishAssessment(180);
 await page.click('#next-step-progress');await page.click('#save-checkin');await hub();await page.click('#tools-report');await page.click('#start-new-checkin');
 await page.clock.setFixedTime(new Date('2026-01-22T12:00:00Z'));await page.fill('#name','Test User');await page.fill('#age','25');await page.fill('#name','John@');await page.click('#flow-next');await capture('assessment-name-validation-mobile',['#checkin'],390);await page.fill('#name','Test User');await capture('assessment-step-1',['#checkin']);await page.setViewportSize({width:390,height:900});await page.fill('#age','14');await page.click('#flow-next');assert.equal(await page.locator('#step-count').textContent(),'Step 1 of 5');await capture('assessment-age-validation-mobile',['#checkin'],390);await page.fill('#age','25');await page.click('#flow-next');
 await usePlatform('Instagram',120);await usePlatform('YouTube',60);await usePlatform('TikTok',30);
 await capture('assessment-step-2',['.assessment-nav','.flow-progress','[data-step="2"] > .section-title','[data-step="2"] > .help','#platform-total-wrap','.platform-reference-legend','.platform-reference-info']);
 await capture('assessment-step-2-sliders',['.platform-row:nth-child(-n+4)']);
 await finishAssessment(120,true);assert.equal(await page.locator('#daily').textContent(),'3h 30m');
 await capture('results-report',['.result-top','#result-title','#report-snapshot']);
 await capture('results-insights',['#report-insights']);
 await capture('results-next-steps',['#report-next']);
 await captureReportReviews();
 await page.locator('#report-health > summary').click();
 await page.locator('#report-health-details > summary').click();
 await capture('health-education',['#report-health-details']);
 await page.locator('#report-health > summary').click();
 await page.click('#explore-tools');await capture('my-tools',['#tools-screen']);await tool('shield');
 await page.fill('#shield-bedtime','23:00');await page.selectOption('#shield-window','30');await page.selectOption('#shield-activity','Read');await page.click('#shield-use');await capture('sleep-tracker',['#sleep-shield']);
 await page.click('#shield-track');await page.locator('.shield-night select').nth(0).selectOption('Yes');await page.getByLabel('Sleep hours',{exact:true}).fill('7');await page.getByLabel('Sleep minutes',{exact:true}).fill('30');await page.locator('.shield-night select').nth(1).selectOption('Rested');
 await capture('sleep-tracker-tracking',['.shield-night']);await page.getByRole('button',{name:'Save night',exact:true}).click();
 // Record six more nights in the isolated synthetic browser profile; no production data is read or written.
 await page.getByRole('button',{name:'Close check-in',exact:true}).click();
 for(let night=2;night<=7;night++){
  await page.click('#shield-track');
  await page.locator('.shield-night select').nth(0).selectOption('Yes');
  await page.getByLabel('Sleep hours',{exact:true}).fill('8');
  await page.getByLabel('Sleep minutes',{exact:true}).fill('0');
  await page.locator('.shield-night select').nth(1).selectOption('Rested');
  await page.getByRole('button',{name:'Save night',exact:true}).click();
  await page.getByRole('button',{name:'Close check-in',exact:true}).click();
 }
 assert.equal(await page.locator('#shield-sleep-summary').getAttribute('data-outcome'),'positive','seven-night summary should be positive with seven suitable synthetic entries');
 assert.match(await page.locator('#shield-sleep-summary').innerText(),/7.*check-ins|Nice Work Making Time for Sleep/i);
 await capture('sleep-tracker-seven-night-summary',['#shield-sleep-summary']);
 await hub();await tool('reduction');await page.locator('#goal-reduction').fill('30');await capture('reduction-goal',['#reduction-screen']);
 await page.locator('#report-goal-breakdown > summary').click();await capture('reduction-savings',['#report-goal-breakdown']);
 assert.equal(await page.locator('#goal-year').textContent(),'182.5');
 await hub();await tool('progress');assert.match(await page.locator('#progress-summary').textContent(),/60 minutes less/);await page.click('#save-checkin');await capture('progress',['#progress-screen']);
 await page.locator('#progress-details > summary').click();await capture('progress-comparison',['#progress-details']);
 assert.deepEqual(errors,[]);assert.equal(captures.length,names.length+reportReviews.length);
 await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify({sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),productionReference:{verified:false,captureSource:'local checkout; production equivalence not established by this script'},fixture:'Synthetic Test User, age 25; 270m prior / 210m current; fixed Jan 2026 UTC dates',research:'Bundled curated educational resources; no provider requests',browser:browser.version(),captures},null,2)+'\n');
 console.log(`PASS: ${captures.length} complete section captures, isolated synthetic storage, fallback research and no overflow.`);
}catch(error){await fs.writeFile(path.join(output,'failure.txt'),String(error.stack||error));await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});throw error;}
finally{await context.close();await browser.close();}

