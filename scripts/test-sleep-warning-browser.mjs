import assert from 'node:assert/strict';
import {startRoutingServer} from './routing-server.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=await startRoutingServer();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
try{for(const width of [320,390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:1000}});
 await page.goto(server.origin);await page.click('#home-start');await page.fill('#name','Test User');await page.fill('#age','16');await page.click('#flow-next');await page.click('#flow-next');
 const warning=page.locator('#sleep-input-warning');assert(!await warning.isVisible());
 await page.fill('#sleep-hours','6');await page.fill('#sleep-minutes','30');assert(await warning.isVisible());assert.match(await warning.textContent(),/6 hours 30 minutes/);assert.equal(await page.locator('#sleep-hours').getAttribute('aria-invalid'),null);
 assert.equal(await warning.locator('a').getAttribute('href'),'https://www.cdc.gov/sleep/about/');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`/tmp/sleep-warning-${width}.png`,fullPage:true});
 await page.click('#flow-next');assert.equal(await page.locator('#step-count').textContent(),'Step 4 of 5');await page.click('#flow-back');assert(await warning.isVisible());
 await page.fill('#sleep-hours','8');assert(!await warning.isVisible());await page.fill('#sleep-hours','6');assert(await warning.isVisible());
 await page.fill('#sleep-minutes','60');assert(!await warning.isVisible());await page.click('#flow-next');assert.equal(await page.locator('#step-count').textContent(),'Step 3 of 5');assert.equal(await page.locator('#sleep-minutes').getAttribute('aria-invalid'),'true');
 await page.fill('#sleep-minutes','');assert(!await warning.isVisible());assert.equal(await warning.count(),1);await page.close();console.log(`PASS sleep warning ${width}px`);
}}finally{await browser.close();await server.close();}
