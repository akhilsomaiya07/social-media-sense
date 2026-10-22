import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {startRoutingServer} from './routing-server.mjs';
import {chromium} from 'playwright';
const server=await startRoutingServer();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox']});
await fs.mkdir('artifacts/review',{recursive:true});
try{
 for(const width of [320,390,768,1280])for(const bedtime of ['Never','Sometimes']){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/api/health-information',r=>r.fulfill({status:503,contentType:'application/json',body:'{"code":"review_fixture"}'}));
  try{
   await page.goto(server.origin);await page.click('#home-start');await page.fill('#name','Review Demo');await page.fill('#age','30');await page.click('#flow-next');
   await page.locator('.platform-slider').first().evaluate(e=>{e.value=platformPosition(180);e.dispatchEvent(new Event('input',{bubbles:true}));});
   await page.click('#flow-next');await page.fill('#sleep-hours','7');await page.fill('#sleep-minutes','30');await page.check('[name="prebed"][value="Sometimes"]');
   await page.click('#flow-next');await page.fill('#activity-hours','0');await page.fill('#activity-minutes','45');await page.click('#flow-next');
   for(const key of ['bedtime','tasks','movement','people','longer'])await page.check(`[name="${key}"][value="${key==='bedtime'?bedtime:'Never'}"]`);
   await page.click('#flow-next');await page.locator('#result').waitFor({state:'visible'});
   const snapshot=await page.locator('#report-snapshot').innerText();assert.match(snapshot,/3h/);
   const button=page.locator(bedtime==='Never'?'#next-step-action':'#next-step-progress');
   assert.equal(await button.innerText(),'Go to Progress to Save');
   await button.focus();await button.press('Enter');await page.locator('#progress-screen').waitFor({state:'visible'});
   assert.equal(await page.evaluate(()=>localStorage.getItem('room.saved-checkins.v1')),null);
   await page.click('#save-checkin');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('room.saved-checkins.v1')).checkins.length),1);
   await page.locator('[data-view="tools"]:visible').first().click();await page.click('#tools-report');
   assert.equal(await button.innerText(),'Review My Progress');assert.equal(await page.locator('#report-snapshot').innerText(),snapshot);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
   console.log(`PASS save navigation ${width}px / bedtime ${bedtime}: keyboard, no automatic save, explicit save, unchanged snapshot, no overflow/errors`);
  }finally{await context.close();}
 }
}finally{await browser.close();await server.close();}
