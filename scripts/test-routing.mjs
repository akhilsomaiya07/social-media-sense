import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {startRoutingServer} from './routing-server.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=await startRoutingServer(),output='artifacts/routing';await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox']});
const paths=['/check-in/about-you','/check-in/social-media-time','/check-in/sleep','/check-in/physical-activity','/check-in/daily-routine'];
const saved={id:'synthetic',date:'2026-01-01T12:00:00Z',daily:180,platforms:[{name:'Facebook',minutes:180}],sleepMinutes:420,activityMinutes:60,behaviors:{bedtime:'Never',tasks:'Never',movement:'Never',people:'Never',longer:'Never'},opportunity:{area:'Maintain your balance',explanation:'Synthetic fixture'},reductionGoal:null};
const history={version:1,checkins:[saved]};
const shield={bedtime:'23:00',window:30,activity:'Read',other:'',nights:[]};
const captures=[];
async function capture(page,label){if(process.env.ROUTING_CAPTURE!=='1'||![390,1280].includes(page.viewportSize().width))return;await page.waitForTimeout(300);await page.evaluate(()=>scrollTo(0,0));const file=`${label}-${page.viewportSize().width}.jpg`;await page.screenshot({path:output+'/'+file,quality:78});captures.push({file,url:page.url(),viewport:page.viewportSize()});await fs.writeFile(output+'/urls.json',JSON.stringify(captures,null,2));}
async function expectPath(p,path){await p.waitForURL(server.origin+path);assert.equal(new URL(p.url()).pathname,path);assert.equal(new URL(p.url()).search,'');assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));assert(!await p.evaluate(()=>document.activeElement.closest('[hidden]')));}
async function next(p,n){await p.click('#flow-next');await expectPath(p,paths[n-1]);assert.equal(await p.locator('#step-progress').evaluate(e=>e.value),n);assert.equal(await p.evaluate(()=>document.activeElement.id),`step-title-${n}`);}
async function answers(p){await p.fill('#age','30');await next(p,2);await p.locator('.platform-slider').first().evaluate(e=>{e.value=platformPosition(180);e.dispatchEvent(new Event('input',{bubbles:true}));});await next(p,3);await p.fill('#sleep-hours','7');await p.check('[name="prebed"][value="Sometimes"]');await next(p,4);await p.fill('#activity-hours','1');await next(p,5);for(const key of ['bedtime','tasks','movement','people','longer'])await p.check(`[name="${key}"][value="Never"]`);}
try{
 for(const width of [320,390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<500,reducedMotion:'no-preference'}),page=await context.newPage(),errors=[];let requests=0;
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/api/health-information',r=>{requests++;return r.fulfill({status:503,contentType:'application/json',body:'{"code":"routing_test"}'});});
  await page.addInitScript(()=>{window.routeAudit={complete:0,reveal:0};document.addEventListener('checkin:complete',()=>window.routeAudit.complete++);document.addEventListener('animationstart',e=>{if(e.animationName==='report-arrive'&&e.target.id==='report-snapshot')window.routeAudit.reveal++;});});
  try{
   await page.goto(server.origin);await expectPath(page,'/');const initialHistory=await page.evaluate(()=>history.length);
   await page.click('#home-start');await expectPath(page,paths[0]);await page.click('#flow-next');await expectPath(page,paths[0]);assert.equal(await page.evaluate(()=>document.activeElement.id),'age');
   await page.fill('#name','Routing Demo');await page.fill('#age','30');await next(page,2);assert.equal(await page.evaluate(()=>history.length),initialHistory+2);await capture(page,'social-media-time');
   await page.goBack();await expectPath(page,paths[0]);assert.equal(await page.locator('#name').inputValue(),'Routing Demo');await page.goForward();await expectPath(page,paths[1]);assert.equal(await page.locator('#age').inputValue(),'30');
   // Previously valid earlier answers are rechecked before a Forward entry is restored.
   await page.goBack();await page.fill('#age','');await page.goForward();await expectPath(page,paths[0]);assert.match(await page.locator('#route-notice').textContent(),/earlier steps/);await page.fill('#age','30');await next(page,2);
   await page.locator('.platform-slider').first().evaluate(e=>{e.value=platformPosition(180);e.dispatchEvent(new Event('input',{bubbles:true}));});await next(page,3);await page.fill('#sleep-hours','7');await page.check('[name="prebed"][value="Sometimes"]');await next(page,4);await page.fill('#activity-hours','1');await next(page,5);
   await page.goBack();await expectPath(page,paths[3]);assert.equal(await page.locator('#activity-hours').inputValue(),'1');await page.goForward();await expectPath(page,paths[4]);
   for(const key of ['bedtime','tasks','movement','people','longer'])await page.check(`[name="${key}"][value="Never"]`);
   assert.equal(await page.evaluate(()=>{document.getElementById('checkin').requestSubmit();return document.getElementById('loading-progress').value;}),1);assert.equal(new URL(page.url()).pathname,paths[4]);
   // Back while loading is safely held at the final-step URL; no second completion.
   await page.evaluate(()=>{history.back();appViews.show('tools');});await page.locator('#result').waitFor({state:'visible'});await expectPath(page,'/results');assert.equal(await page.locator('#loading-progress').evaluate(e=>e.value),100);
   await page.waitForTimeout(550);assert.equal(await page.locator('#daily').textContent(),'3h');assert.equal(await page.locator('#weekly').textContent(),'21h');assert.equal(await page.locator('#yearly').textContent(),'1,095h');
   await capture(page,'results');const report=await page.locator('#result').innerText(),callCount=requests;assert.deepEqual(await page.evaluate(()=>window.routeAudit),{complete:1,reveal:1});assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),[]);
   await page.click('#explore-tools');await expectPath(page,'/tools');await page.goBack();await expectPath(page,'/results');assert.equal(await page.locator('#result').innerText(),report);assert.equal(requests,callCount);await page.goForward();await expectPath(page,'/tools');
   for(const [view,path] of [['shield','/tools/sleep-shield'],['reduction','/tools/reduction-goal'],['progress','/tools/progress']]){
    await page.locator(`#tools-screen [data-view="${view}"]`).click();await expectPath(page,path);await page.goBack();await expectPath(page,'/tools');await page.goForward();await expectPath(page,path);await page.locator(`[data-view="tools"]:visible`).first().click();await expectPath(page,'/tools');
   }
   await page.click('#tools-report');await expectPath(page,'/results');assert.equal(await page.locator('#result').innerText(),report);assert.deepEqual(await page.evaluate(()=>window.routeAudit),{complete:1,reveal:1});assert.equal(requests,callCount+1,'Sleep Shield may request its existing research once; report returns must not refresh it');assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),[]);
   // New draft can coexist with the prior immutable report; history cannot reset it.
   await page.click('#start-new-checkin');await expectPath(page,paths[0]);await page.fill('#name','New Draft');await page.goBack();await expectPath(page,'/results');assert.equal(await page.locator('#result').innerText(),report);assert.equal(requests,callCount+1);await page.goForward();await expectPath(page,paths[0]);assert.equal(await page.locator('#name').inputValue(),'New Draft');await answers(page);await page.click('#flow-next');await expectPath(page,'/results');assert.equal(await page.evaluate(()=>window.routeAudit.complete),2);assert.match(await page.locator('#result-title').textContent(),/New Draft/);
   // Refresh cannot manufacture a full report from saved summaries.
   await page.reload();await expectPath(page,'/');assert.match(await page.locator('#route-notice').textContent(),/full report is not available/);assert(await page.locator('#result').isHidden());
   for(const path of paths){await page.goto(server.origin+path);await expectPath(page,paths[0]);assert.equal(await page.locator('#age').inputValue(),'');}
   await page.fill('#age','30');await next(page,2);await page.reload();await expectPath(page,paths[0]);assert.equal(await page.locator('#age').inputValue(),'');
   for(const [path,id] of [['/tools','tools-screen'],['/tools/sleep-shield','sleep-shield'],['/tools/reduction-goal','reduction-screen'],['/tools/progress','progress-screen']]){await page.goto(server.origin+path);await expectPath(page,path);assert(await page.locator('#'+id).isVisible());await page.reload();await expectPath(page,path);}
   assert(await page.locator('#save-checkin').isDisabled());
   await page.evaluate(({history,shield})=>{localStorage.setItem('room.saved-checkins.v1',JSON.stringify(history));localStorage.setItem('social-media-sense.sleep-shield.v1',JSON.stringify(shield));},{history,shield});
   const stored=await page.evaluate(()=>({...localStorage}));await page.goto(server.origin+'/tools/progress');assert.match(await page.locator('#saved-record-summary').textContent(),/3h/);
   await page.goto(server.origin+'/tools/sleep-shield');await page.getByRole('button',{name:'Resume My Plan (11:00 PM)',exact:true}).click();assert.equal(await page.locator('input[type="time"]').inputValue(),'23:00');await capture(page,'sleep-shield');
   await page.goto(server.origin+'/tools/reduction-goal');assert(await page.locator('#goal-reduction').isVisible());assert.deepEqual(await page.evaluate(()=>({...localStorage})),stored);
   await page.evaluate(()=>{const data=JSON.parse(localStorage.getItem('room.saved-checkins.v1'));data.checkins[0].daily=120;data.checkins[0].platforms[0].minutes=120;localStorage.setItem('room.saved-checkins.v1',JSON.stringify(data));});await page.reload();assert(await page.locator('#goal-reduction').isDisabled()||await page.locator('#goal-reduction').isHidden());
   await page.goto(server.origin+'/tools');await page.locator('#tools-screen [data-view="home"]').press('Enter');await expectPath(page,'/');assert.equal(await page.evaluate(()=>document.activeElement.closest('[hidden]')===null),true);
   assert.deepEqual(errors,[]);console.log(`PASS routing ${width}px: history, guards, loading, immutable report, direct routes/refresh, saved tools, eligibility, no new storage, focus and overflow`);
  }catch(error){await page.screenshot({path:`${output}/failure-${width}.png`}).catch(()=>{});throw error;}finally{await context.close();}
 }
}finally{await browser.close();await server.close();}
