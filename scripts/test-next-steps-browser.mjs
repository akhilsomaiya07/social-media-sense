// Requires an existing Playwright/Chromium installation; no app dependency added.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:900},hasTouch:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(10000);
let live=false,requests=0;
const source={organization:'CDC',title:'Controlled test fixture',url:'https://www.cdc.gov/sleep/about/',date:null};const evidence={statement:'Controlled educational fixture.',population:'Adults',applicability:'Fixture for display testing only.',sources:[source]};
await context.route('https://preview.local/**',async route=>{const url=new URL(route.request().url());if(url.pathname==='/api/health-information'){requests++;return route.fulfill({status:live?200:503,contentType:'application/json',body:JSON.stringify(live?{benefits:[evidence],risks:[evidence],resources:[{...source,whyRelevant:'Controlled relevance fixture.',population:'Adults',applicability:'Fixture only.'}],checkedAt:new Date().toISOString()}:{code:'test_unavailable'})});}const file=path.resolve('public',url.pathname==='/'?'index.html':url.pathname.slice(1));return route.fulfill({body:await fs.readFile(file),contentType:file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html'});});
const visible=id=>page.locator(id).isVisible(),text=id=>page.locator(id).textContent();
const getStorage=()=>page.evaluate(()=>({...localStorage}));
async function hub(){const id=await page.evaluate(()=>appViews.current);if(id==='report')await page.click('#explore-tools');else if(id==='home')await page.locator('#home-screen [data-view="tools"]').click();else if(id!=='tools')await page.locator('#'+({shield:'sleep-shield',reduction:'reduction-screen',progress:'progress-screen'})[id]+' [data-view="tools"]').click();}
async function tool(name){await hub();await page.locator('#tools-screen [data-view="'+name+'"]').click();}
async function report(){await hub();await page.click('#tools-report');}
async function start(){const view=await page.evaluate(()=>appViews.current);if(view==='report')await page.click('#start-new-checkin');else{await hub();await page.locator('#tools-screen [data-view="home"]').click();await page.click('#home-start');}}
async function assess(minutes=300,answer='Often',age=30){await start();await page.fill('#name','Demo');await page.fill('#age',String(age));await page.click('#flow-next');await page.locator('.platform-slider').first().evaluate((el,m)=>{el.value=platformPosition(m);el.dispatchEvent(new Event('input',{bubbles:true}));},minutes);await page.click('#flow-next');await page.fill('#sleep-hours','7');await page.click('#flow-next');await page.fill('#activity-hours','1');await page.click('#flow-next');await page.check('input[name="prebed"][value="'+answer+'"]');for(const key of ['bedtime','tasks','movement','people','longer'])await page.check(`input[name="${key}"][value="${answer}"]`);await page.click('#flow-next');await page.locator('#result').waitFor({state:'visible'});}
async function capture(name){for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});await page.evaluate(()=>window.scrollTo(0,0));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' overflow at '+width);if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`${name}-${width}.png`),fullPage:true});}}
async function setGoal(n){await page.locator('#goal-reduction').evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},n);}
async function saveNight(hours='7',followed='Yes'){const n=page.locator('.shield-night');await n.locator('select').first().selectOption(followed);await n.getByLabel('Sleep hours',{exact:true}).fill(hours);await n.getByLabel('Sleep minutes',{exact:true}).fill('30');await n.locator('select').last().selectOption('Rested');await n.getByRole('button',{name:'Save night',exact:true}).click();}
try{
 await page.goto('https://preview.local/');
 await page.evaluate(()=>document.addEventListener('checkin:complete',e=>window.lastSubmitted=structuredClone(e.detail)));
 const cases=[[45,'Never','Never','progress'],[90,'Often','Never','shield'],[120,'Never','Sometimes','progress'],[121,'Never','Often','reduction'],[180,'Never','Never','progress'],[300,'Often','Often','shield'],[0,'Never','Never','progress']];
 for(const [daily,bedtime,tasks,view] of cases){
  // Native platform controls select in five-minute increments. The 121 boundary
  // is additionally exercised with an exact submitted-snapshot fixture.
  await assess(daily===121?125:daily,'Never');
  await page.evaluate(({daily,bedtime,tasks})=>{const d=structuredClone(window.lastSubmitted);d.daily=daily;d.assessment.daily=daily;d.assessment.platforms=[{name:'Other',minutes:daily}];d.assessment.prebed='Often';d.assessment.behaviors={bedtime,tasks,movement:'Never',people:'Never',longer:'Never'};document.dispatchEvent(new CustomEvent('checkin:complete',{detail:d}));},{daily,bedtime,tasks});
  assert.equal(await page.locator('#next-step-action').getAttribute('data-view'),view);
  assert.equal(await page.locator('#report-next .next-step-actions .goal-button:visible').count(),1);
  const msg=await text('#next-step-message');if(tasks!=='Never'&&bedtime==='Never')assert.match(msg,/responsibilities/);if(bedtime==='Never'&&tasks==='Never')assert.match(msg,/did not report/);
  const before=await getStorage();const html=await page.locator('#result').innerHTML();
  await page.locator('#next-step-action').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>appViews.current),view);assert.deepEqual(await getStorage(),before);await report();assert.equal(await page.locator('#result').innerHTML(),html);
  await page.click(view==='progress'?'#next-step-action':'#next-step-progress');assert(await visible('#progress-screen'));await page.click('#save-checkin');await report();assert.match(await text(view==='progress'?'#next-step-action':'#next-step-progress'),/Review My Progress/);assert.match(await text('#report-save-note'),/saved on this device/);
 }
 // Screenshots from actual form submissions, including mixed low-use disruption.
 for(const [name,daily,bedtime,tasks] of [['no-disruption',180,'Never','Never'],['sleep-shield',90,'Often','Never'],['reduction-goal',180,'Never','Often'],['low-use-disruption',120,'Never','Sometimes']]){
  await start();await page.fill('#name','Demo');await page.fill('#age','30');await page.click('#flow-next');await page.locator('.platform-slider').first().evaluate((el,n)=>{el.value=platformPosition(n);el.dispatchEvent(new Event('input',{bubbles:true}));},daily);await page.click('#flow-next');await page.fill('#sleep-hours','7');await page.click('#flow-next');await page.fill('#activity-hours','1');await page.click('#flow-next');await page.check('input[name="prebed"][value="Often"]');for(const [key,value] of Object.entries({bedtime,tasks,movement:'Never',people:'Never',longer:'Never'}))await page.check(`input[name="${key}"][value="${value}"]`);await page.click('#flow-next');await page.locator('#result').waitFor({state:'visible'});
  assert.match(await text('#report-save-note'),/not automatically saved/);
  for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#report-next').screenshot({path:path.join(process.env.SCREENSHOT_DIR,`${name}-${width}.png`)});}
 }
 assert.deepEqual(errors,[]);console.log('PASS next-step navigation, exact submitted 120/121 fixtures, no autosave, unchanged report round trips, explicit saved wording, fresh assessments, prebed independence, keyboard and four responsive widths');
}finally{await browser.close();}
