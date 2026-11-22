// Real local pages with synthetic inputs; research is tested separately with controlled fixtures.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {startRoutingServer} from './routing-server.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=await startRoutingServer(),browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
const output=process.env.AGE_CAPTURE_DIR||'artifacts/age';await fs.mkdir(output,{recursive:true});
const under='Social Media Sense is designed for people ages 15–100. Please enter an eligible age to continue.';
try{for(const width of [320,390,768,1280]){
 const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width<500,reducedMotion:width===320?'reduce':'no-preference'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(server.origin);await page.click('#home-start');await page.waitForTimeout(300);
 await page.screenshot({path:`${output}/after-${width}.jpg`,quality:85,fullPage:true});
 // Both fields are required, but no errors appear before interaction.
 assert.equal(await page.locator('#name-error').count(),0);assert.equal(await page.locator('#age-error').count(),0);
 for(const id of ['name','age']){assert(await page.locator('#'+id).evaluate(e=>e.required));assert.match(await page.locator('#'+id).evaluate(e=>e.closest('label').textContent),/\*/);}
 assert(!/optional/i.test(await page.locator('#name').evaluate(e=>e.closest('label').textContent)));
 await page.click('#flow-next');assert.equal(await page.evaluate(()=>document.activeElement.id),'name');
 assert.equal(await page.locator('#name-error').textContent(),'Enter your name or nickname to continue.');assert(await page.locator('#age-error').isVisible());
 await page.fill('#age','25');
 for(const name of ['   ','12345','1@#$%','Akhil123','John@','!!!','😀','<script>','---','-Anne','Anne-','Anne--Marie']){
  await page.fill('#name',name);await page.click('#flow-next');assert.equal(await page.locator('#step-count').textContent(),'Step 1 of 5');assert.equal(await page.evaluate(()=>document.activeElement.id),'name');
  assert.equal(await page.locator('#name').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('#name').getAttribute('aria-describedby'),'name-error');assert.equal(await page.locator('#name-error').getAttribute('role'),'alert');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.fill('#name','John@');assert.equal(await page.locator('#name-error').textContent(),'Use letters only. Spaces, hyphens, and apostrophes are allowed.');assert.equal(await page.locator('#name').inputValue(),'John@');
 for(const name of ['Akhil','Mary Jane','Anne-Marie',"O'Connor",'José','Nguyễn','李','A','A'.repeat(200)]){
  await page.fill('#name',name);assert.equal(await page.locator('#name-error').count(),0);assert.equal(await page.locator('#name').getAttribute('aria-invalid'),null);
  await page.locator('#name').press('Enter');assert.equal(await page.locator('#step-count').textContent(),'Step 2 of 5');await page.click('#flow-back');assert.equal(await page.locator('#name').inputValue(),name);
 }
 await page.fill('#name','  Mary   Jane  ');await page.locator('#name').press('Tab');assert.equal(await page.locator('#name').inputValue(),'Mary Jane');
 // An invalid restored/edited name cannot bypass prerequisites through direct navigation.
 await page.fill('#name','');await page.evaluate(()=>assessmentFlow.navigate(2));assert.equal(await page.locator('#step-count').textContent(),'Step 1 of 5');
 await page.fill('#name','Example');await page.fill('#age','1');assert.equal(await page.locator('#age-error').count(),0);await page.locator('#age').press('5');assert.equal(await page.locator('#age').inputValue(),'15');assert.equal(await page.locator('#age-error').count(),0);
 const step1=page.url();const storage=await page.evaluate(()=>({...localStorage}));
 for(const [age,message,title] of [['0',under,'Age requirement not met'],['13',under,'Age requirement not met'],['14',under,'Age requirement not met'],['101','Social Media Sense currently supports ages 15–100. Please check the age you entered.','Age outside supported range'],['120','Social Media Sense currently supports ages 15–100. Please check the age you entered.','Age outside supported range'],['','Please enter your age to continue.','Check your age'],['15.5','Please enter your age in whole years.','Check your age']]){
  await page.fill('#age',age);await page.locator('#age').press('Tab');assert.equal(await page.locator('#age-error>span:last-child').textContent(),message);assert.equal(await page.locator('.age-warning-title').textContent(),title);
  assert.equal(await page.locator('#age').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('#age').getAttribute('aria-describedby'),'age-error');assert.equal(await page.locator('#age-error').getAttribute('role'),'alert');assert.equal(await page.locator('.age-warning-icon').getAttribute('aria-hidden'),'true');
  await page.evaluate(()=>window.originalAgeAlert=document.getElementById('age-error'));await page.click('#flow-next');assert(await page.evaluate(()=>window.originalAgeAlert===document.getElementById('age-error')));assert.equal(await page.locator('#age-error').count(),1);assert(!await page.locator('#error').isVisible());assert.equal(page.url(),step1);assert.equal(await page.locator('#step-count').textContent(),'Step 1 of 5');assert.equal(await page.locator('#step-progress').evaluate(e=>e.value),1);assert.equal(await page.evaluate(()=>document.activeElement.id),'age');assert.equal(await page.locator('#name').inputValue(),'Example');
 }
 // Native number inputs sanitize alphabetic text; an incomplete exponent exposes badInput.
 await page.fill('#age','');await page.locator('#age').press('e');assert(await page.locator('#age').evaluate(e=>e.validity.badInput));await page.click('#flow-next');assert.equal(await page.locator('#age-error>span:last-child').textContent(),'Please enter a valid whole-number age between 15 and 100.');
 await page.fill('#age','14');await page.locator('#age').press('Tab');await page.locator('#age').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/underage-${width}.jpg`,quality:85,fullPage:true});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.locator('#age-error').evaluate(e=>getComputedStyle(e).animationName),'none');
 for(const age of ['15','16','17','18','29','30','64','65','99','100']){
  await page.fill('#age',age);assert.equal(await page.locator('#age-error').count(),0);assert.equal(await page.locator('#age').getAttribute('aria-invalid'),null);await page.click('#flow-next');assert.match(page.url(),/\/check-in\/social-media-time$/);assert.equal(await page.locator('#step-count').textContent(),'Step 2 of 5');await page.click('#flow-back');assert.equal(page.url(),step1);assert.equal(await page.locator('#age').inputValue(),age);
 }

 await page.fill('#name','Test User');await page.fill('#age','25');await page.click('#flow-next');await page.click('#flow-next');
 assert.equal(await page.locator('[data-step="3"] [name="prebed"]').count(),0);
 await page.fill('#sleep-hours','7');await page.click('#flow-next');await page.fill('#activity-hours','0');await page.click('#flow-next');
 assert.equal(await page.locator('#questions fieldset').count(),6);
 assert.equal(await page.locator('#questions fieldset').nth(1).getAttribute('id'),'prebed-question');
 assert.equal(await page.locator('#prebed-question legend').textContent(),'Do you usually use social media during the hour before you try to sleep?');
 await page.click('#flow-next');assert.equal(await page.locator('#step-count').textContent(),'Step 5 of 5');
 for(const value of ['Never','Sometimes','Often']){await page.check(`[name="prebed"][value="${value}"]`);await page.click('#flow-back');await page.click('#flow-next');assert(await page.locator(`[name="prebed"][value="${value}"]`).isChecked());}
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 for(let i=0;i<4;i++)await page.click('#flow-back');
 assert.deepEqual(await page.evaluate(()=>({...localStorage})),storage);
 await page.emulateMedia({forcedColors:'active'});await page.fill('#age','14');await page.click('#flow-next');assert(await page.locator('#age-error').isVisible());assert.notEqual(await page.locator('#age').evaluate(e=>getComputedStyle(e).borderStyle),'none');
 assert.deepEqual(errors,[]);await context.close();console.log(`PASS age browser ${width}px: messages, blur/typing, focus, routes, boundaries, no overflow/storage writes, forced colors`);
}}finally{await browser.close();await server.close();}
