import assert from 'node:assert/strict';
import {startRoutingServer} from './routing-server.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=await startRoutingServer();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const width of [320,390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await context.route('**/api/health-information',r=>r.fulfill({status:200,json:{mode:'local'}}));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(server.origin);
  for(const ai of [false,true])for(const [daily,topic,frequency,expected] of [[29,null,null,false],[30,null,null,false],[60,null,null,false],[119,null,null,false],[120,null,null,true],[121,null,null,true],[20,'bedtime','Often',true],[90,'tasks','Sometimes',true],[180,null,null,true]]){
   // Exercise the real renderer and native controls with isolated synthetic report fixtures.
   await page.evaluate(({daily,topic,frequency,ai})=>{
    const texts={bedtime:'You said social media kept you up later than intended.',tasks:'You said social media interrupted your everyday responsibilities.'};
    const result={age:25,daily,sleep:7.5,activity:30,reasons:topic?[{text:texts[topic],frequency}]:[]};
    const data=selectHealthResources(result);
    renderLocalEducation(result,ai?{benefits:data.benefits.slice(0,2).map(c=>c.id),risks:data.risks.slice(0,2).map(c=>c.id)}:undefined);
    document.getElementById('home-screen').hidden=true;document.getElementById('checkin').hidden=true;
    document.getElementById('result').hidden=false;
    document.querySelector('.workspace').classList.remove('flow-active');document.querySelector('.workspace').classList.add('results-only');document.body.classList.add('results-screen');
    document.getElementById('report-health').open=true;document.getElementById('report-health-details').open=true;
   },{daily,topic,frequency,ai});
   assert(await page.locator('#education-benefits').isVisible());
   assert.equal(await page.locator('#education-risks-section').isVisible(),expected);
   if(!expected){
    const toggle=page.locator('#education-risks-toggle');await toggle.focus();await toggle.press('Enter');
    assert(await page.locator('#education-risks-section').isVisible());assert.equal(await toggle.getAttribute('aria-expanded'),'true');
    await toggle.click();assert(!await page.locator('#education-risks-section').isVisible());
   }
   assert(await page.locator('#education-benefits a').count()>0);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  assert.deepEqual(errors,[]);await context.close();console.log(`PASS education display browser ${width}px: local/AI fixtures, boundaries, keyboard/touch control, citations, no overflow/errors`);
 }
}finally{await browser.close();await server.close();}
