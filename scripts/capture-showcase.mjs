// Documentation capture only: real local UI, isolated synthetic storage, no live APIs.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(root,process.env.SCREENSHOT_DIR||'artifacts/screenshots');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
await fs.mkdir(output,{recursive:true});
// Remove only outputs this script owns; a failed run cannot retain a stale gallery.
const names=['homepage','assessment-step-2','results-report','my-tools','sleep-shield','reduction-goal','progress','mobile-results'];
for(const name of [...names.map(n=>n+'.png'),'manifest.json','failure.png','failure.txt'])await fs.rm(path.join(output,name),{force:true});
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
async function capture(name,selector){
 await page.evaluate(async()=>{await document.fonts.ready;window.scrollTo(0,0);if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});
 if(name==='assessment-step-2')await page.locator('.platform-row').first().evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-130));
 await page.mouse.move(0,0);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name}: horizontal overflow`);
 const target=selector?page.locator(selector):page;
 const buffer=await target.screenshot({type:'png',animations:'disabled',caret:'hide',scale:'css',...(selector?{}:{fullPage:false})});
 await fs.writeFile(path.join(output,name+'.png'),buffer);
 captures.push({file:name+'.png',viewport:page.viewportSize(),framing:selector||'viewport (scrollable content may continue below)',bytes:buffer.length,sha256:createHash('sha256').update(buffer).digest('hex')});
 console.log('Captured '+name);
}
async function usePlatform(name,minutes){await page.getByRole('slider',{name:name+' daily usage',exact:true}).evaluate((el,n)=>{el.value=platformPosition(n);el.dispatchEvent(new Event('input',{bubbles:true}));},minutes);}
async function finishAssessment(facebook){
 await usePlatform('Facebook',facebook);await usePlatform('Instagram',90);await usePlatform('YouTube',30);
 await page.click('#flow-next');await page.fill('#sleep-hours','7');await page.fill('#sleep-minutes','30');await page.check('input[name="prebed"][value="Sometimes"]');
 await page.click('#flow-next');await page.fill('#activity-hours','0');await page.fill('#activity-minutes','45');await page.click('#flow-next');
 for(const [key,value] of Object.entries({bedtime:'Sometimes',tasks:'Never',movement:'Never',people:'Never',longer:'Sometimes'}))await page.check(`input[name="${key}"][value="${value}"]`);
 await page.click('#flow-next');await page.locator('#result').waitFor({state:'visible'});
 await page.waitForFunction(()=>document.getElementById('education-live-status').textContent.includes('could not'));
}
async function begin(){await page.fill('#name','Demo');await page.fill('#age','30');await page.click('#flow-next');}
async function hub(){await page.locator('[data-view="tools"]:visible').first().click();}
async function tool(view){await page.locator(`#tools-screen [data-view="${view}"]`).click();}
try{
 await page.goto('https://showcase.local/');assert.equal(await page.evaluate(()=>localStorage.length),0);await capture('homepage');
 await page.click('#home-start');await begin();await finishAssessment(120);
 await page.click('#next-step-progress');await page.click('#save-checkin');await hub();await page.click('#tools-report');await page.click('#start-new-checkin');
 await page.clock.setFixedTime(new Date('2026-01-22T12:00:00Z'));await begin();
 await usePlatform('Facebook',60);await usePlatform('Instagram',90);await usePlatform('YouTube',30);
 await capture('assessment-step-2');await finishAssessment(60);assert.equal(await page.locator('#daily').textContent(),'3h');
 await capture('results-report');await page.setViewportSize({width:390,height:844});await capture('mobile-results');await page.setViewportSize({width:1280,height:900});
 await page.click('#explore-tools');await capture('my-tools');await tool('shield');
 await page.fill('#shield-bedtime','23:00');await page.selectOption('#shield-window','30');await page.selectOption('#shield-activity','Read');await page.click('#shield-use');await capture('sleep-shield');
 await hub();await tool('reduction');await page.locator('#goal-reduction').fill('30');await capture('reduction-goal');
 await hub();await tool('progress');assert.match(await page.locator('#progress-summary').textContent(),/60 minutes less/);await page.click('#save-checkin');await capture('progress');
 assert.deepEqual(errors,[]);assert.equal(captures.length,8);
 await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify({fixture:'Synthetic Demo, age 30; 240m prior / 180m current; fixed Jan 2026 UTC dates',research:'503 fixture: existing fallback guidance, no successful live retrieval',browser:browser.version(),captures},null,2)+'\n');
 console.log('PASS: eight local UI captures, isolated synthetic storage, fallback research and no overflow.');
}catch(error){await fs.writeFile(path.join(output,'failure.txt'),String(error.stack||error));await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});throw error;}
finally{await context.close();await browser.close();}
