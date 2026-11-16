import assert from 'node:assert/strict';
import {startRoutingServer} from './routing-server.mjs';

const server=await startRoutingServer();
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox']});
const longName='N'.repeat(200);

async function completeAssessment(page,name){
 await page.goto(server.origin);
 await page.click('#home-start');
 await page.fill('#name',name);
 await page.fill('#age','30');
 await page.click('#flow-next');
 assert.equal(await page.locator('#step-count').textContent(),'Step 2 of 5');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'assessment overflow on step 2');
 await page.click('#flow-next');
 assert.equal(await page.locator('#step-count').textContent(),'Step 3 of 5');
 await page.fill('#sleep-hours','7');
 await page.check('input[name="prebed"][value="Never"]');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'assessment overflow on step 3');
 await page.click('#flow-next');
 assert.equal(await page.locator('#step-count').textContent(),'Step 4 of 5');
 await page.fill('#activity-hours','0');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'assessment overflow on step 4');
 await page.click('#flow-next');
 assert.equal(await page.locator('#step-count').textContent(),'Step 5 of 5');
 for(const id of ['bedtime','tasks','movement','people','longer'])await page.check(`input[name="${id}"][value="Never"]`);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'assessment overflow on step 5');
 await page.click('#flow-next');
 await page.locator('#result').waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('#result-title')?.textContent!=='Make room for perspective.');
}

function assertNoHorizontalOverflow(metrics,label){
 assert(metrics.scrollWidth<=metrics.clientWidth,`${label}: page scrollWidth ${metrics.scrollWidth}px exceeds viewport ${metrics.clientWidth}px`);
 assert(metrics.reportScrollWidth<=metrics.reportClientWidth,`${label}: report scrollWidth ${metrics.reportScrollWidth}px exceeds report width ${metrics.reportClientWidth}px`);
 assert(metrics.buttons.every(({left,right})=>left>=-1&&right<=metrics.clientWidth+1),`${label}: a report button extends beyond the viewport`);
}

try{
 const context=await browser.newContext({viewport:{width:320,height:900}});
 const page=await context.newPage();
 await context.route('**/api/health-information',route=>route.fulfill({status:503,contentType:'application/json',body:'{"code":"test-unavailable"}'}));
 await completeAssessment(page,longName);
 assert.equal(await page.locator('#name').getAttribute('maxlength'),'200','nickname input preserves the supported 200-character limit');
 for(const width of [320,375,390,1366]){
  await page.setViewportSize({width,height:900});
  const title=await page.locator('#result-title').textContent();
  const balanceTitle=await page.locator('#balance-title').textContent();
  assert(title.includes(longName),'full nickname should remain in the report title');
  assert(balanceTitle.includes(longName),'full nickname should remain in the personalized result heading');
  const metrics=await page.evaluate(()=>({
   clientWidth:document.documentElement.clientWidth,
   scrollWidth:document.documentElement.scrollWidth,
   reportClientWidth:document.querySelector('#result').clientWidth,
   reportScrollWidth:document.querySelector('#result').scrollWidth,
   buttons:[...document.querySelectorAll('#result button:not([hidden])')].map(button=>({left:button.getBoundingClientRect().left,right:button.getBoundingClientRect().right}))
  }));
  assertNoHorizontalOverflow(metrics,`200-character nickname at ${width}px`);
 }
 await context.close();

 for(const nickname of ['Maya','A']){
  const small=await browser.newContext({viewport:{width:320,height:900}}),smallPage=await small.newPage();
  await smallPage.route('**/api/health-information',route=>route.fulfill({status:503,contentType:'application/json',body:'{"code":"test-unavailable"}'}));
  await completeAssessment(smallPage,nickname);
  const metrics=await smallPage.evaluate(()=>({clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,reportClientWidth:document.querySelector('#result').clientWidth,reportScrollWidth:document.querySelector('#result').scrollWidth,buttons:[...document.querySelectorAll('#result button:not([hidden])')].map(button=>({left:button.getBoundingClientRect().left,right:button.getBoundingClientRect().right}))}));
  assertNoHorizontalOverflow(metrics,`${nickname?'normal':'empty'} nickname at 320px`);
  await small.close();
 }
 console.log('PASS long, normal, and single-letter nickname report layout at 320px, 375px, 390px, and 1366px; full name retained; Steps 1–5 checked for overflow; report buttons remain within viewport');
}finally{
 await browser.close();
 await server.close();
}
