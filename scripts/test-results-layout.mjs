// Browser regression checks. Use an installed Playwright package and Chromium;
// PLAYWRIGHT_MODULE and CHROMIUM_PATH can point to runtime-provided installations.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
let live=false,requests=0;
const source={organization:'CDC',title:'Controlled test fixture',url:'https://www.cdc.gov/sleep/about/',date:null};
const evidence={statement:'Controlled educational fixture.',population:'Adults',applicability:'Fixture for display testing only.',sources:[source]};
await page.route('https://preview.local/**',async route=>{
 const url=new URL(route.request().url());
 if(url.pathname==='/api/health-information'){requests++;return route.fulfill({status:live?200:503,contentType:'application/json',body:JSON.stringify(live?{benefits:[evidence],risks:[evidence],resources:[{...source,whyRelevant:'Controlled relevance fixture.',population:'Adults',applicability:'Fixture only.'}],checkedAt:new Date().toISOString()}:{code:'test_unavailable'})});}
 const file=path.resolve('public',url.pathname==='/'?'index.html':url.pathname.slice(1));
 return route.fulfill({body:await fs.readFile(file),contentType:file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html'});
});
const visible=id=>page.locator(id).isVisible();
const text=id=>page.locator(id).textContent();
async function assess(minutes=300,answer='Often',age=30){
 await page.fill('#name','Akhil');await page.fill('#age',String(age));await page.click('#flow-next');
 await page.locator('.platform-slider').first().evaluate((el,m)=>{el.value=platformPosition(m);el.dispatchEvent(new Event('input',{bubbles:true}));},minutes);
 await page.click('#flow-next');await page.fill('#sleep-hours','7');await page.check('input[name="prebed"][value="'+answer+'"]');await page.click('#flow-next');await page.fill('#activity-hours','1');await page.click('#flow-next');
 for(const key of ['bedtime','tasks','movement','people','longer'])await page.check(`input[name="${key}"][value="${answer}"]`);
 await page.click('#flow-next');await page.locator('#result').waitFor({state:'visible'});
}
async function restart(){await page.click('#start-new-checkin');}
async function noOverflow(){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
async function saveNight(hour='7',follow='Yes'){
 const night=page.locator('.shield-night');await night.locator('select').first().selectOption(follow);await night.getByLabel('Sleep hours',{exact:true}).fill(hour);await night.getByLabel('Sleep minutes',{exact:true}).fill('30');await night.locator('select').last().selectOption('Rested');await night.getByRole('button',{name:'Save night',exact:true}).click();
}
try{
 await page.goto('https://preview.local/');await assess();
 assert.equal(await text('#daily'),'5h');assert.equal(await text('#weekly'),'35h');assert.equal(await text('#yearly'),'1,825h');assert(!await visible('#checkin'));assert(!await visible('#yearly'));assert(!await visible('#goal-reduction'));assert(await visible('#save-checkin'));assert(!await visible('#balance-card'));
 await page.locator('#report-calculation>summary').click();assert(await visible('#yearly'));await page.locator('#report-calculation>summary').click();
 await page.locator('#report-cutback-tool>summary').focus();await page.keyboard.press('Enter');assert(await visible('#goal-reduction'));assert(!await visible('#report-goal-breakdown'));await page.locator('#goal-reduction').evaluate(el=>{el.value=60;el.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await text('#goal-week'),'7');assert.equal(await text('#goal-month'),'30');assert.equal(await text('#goal-year'),'365');assert.equal(await text('#goal-days'),'15.2');assert.equal(await text('#goal-after'),'4h/day');
 await page.click('#save-checkin');assert.match(await text('#goal-save-status'),/saved/);
 const report=await page.locator('#result').innerHTML();await page.click('#shield-open');assert(!await visible('#result'));assert(!await visible('#shield-track'));await page.click('#shield-back');assert.equal(await page.locator('#result').innerHTML(),report);
 await page.click('#shield-open');const openedRequests=requests;await page.click('#shield-use');assert.match(await text('#shield-bedtime-error'),/valid planned bedtime/);await page.fill('#shield-bedtime','00:10');await page.selectOption('#shield-window','30');await page.selectOption('#shield-activity','Other');await page.fill('#shield-other','Read poetry');assert.match(await text('.shield-timeline'),/11:40 PM.*previous day/s);await page.click('#shield-use');assert(!await visible('#shield-use'));assert(await visible('#shield-track'));assert(await visible('#shield-edit'));assert(!await visible('#shield-bedtime'));assert.equal(await page.evaluate(()=>document.activeElement.id),'shield-track');
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:900});await noOverflow();const a=await page.locator('#shield-track').boundingBox(),b=await page.locator('#shield-edit').boundingBox();assert(a&&b);assert(Math.abs(a.width-b.width)<1);assert(Math.abs(a.height-b.height)<1);assert(b.y>=a.y+a.height+12||b.x>=a.x+a.width+12);
  if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`shield-${width}.png`),fullPage:true});
 }
 await page.locator('#shield-track').tap();await page.locator('.shield-night').getByLabel('Sleep hours',{exact:true}).fill('6');await page.click('#shield-back');await page.click('#shield-open');assert.equal(await page.locator('.shield-night').getByLabel('Sleep hours',{exact:true}).inputValue(),'6');assert.equal(requests,openedRequests);await saveNight();assert.match(await text('#sleep-shield-content'),/1 of 7 nights recorded/);
 await page.getByText('View My Progress',{exact:true}).click();await page.getByRole('button',{name:'Edit night 1',exact:true}).click();await saveNight('8');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('social-media-sense.sleep-shield.v1')).nights[0].sleepMinutes),510);
 await page.click('#shield-edit');await page.selectOption('#shield-window','45');assert(!await visible('#shield-track'));await page.click('#shield-use');await page.click('#shield-back');assert.equal(await text('#daily'),'5h');assert.equal(await text('#goal-after'),'4h/day');assert.equal(await page.evaluate(()=>document.activeElement.id),'shield-open');
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});await noOverflow();if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`report-${width}.png`),fullPage:true});}
 await page.locator('#report-health>summary').click();assert.match(await text('#education-live-status'),/could not be refreshed/);assert(await page.locator('#education-risks li').count()>0);
 // Saved comparisons: decreases, unchanged, increases; no automatic saving.
 await restart();await assess(240,'Never');assert.match(await text('#progress-summary'),/60 minutes less/);assert(await visible('#balance-card'));assert(await visible('#balance-celebrate'));await page.click('#balance-celebrate');assert(await page.locator('#balance-confetti').locator('*').count()>0);
 await restart();await assess(300,'Never');assert.match(await text('#progress-summary'),/No change/);
 await restart();await assess(360,'Often');assert.match(await text('#progress-summary'),/60 minutes more/);
 // Live fixture success and age-specific scope, then low/zero usage.
 live=true;await restart();await assess(30,'Never',16);await page.waitForFunction(()=>!document.getElementById('education-checked').hidden);assert(!await visible('#cutback'));assert.match(await text('#sleep-context-reported'),/24-hour day/);assert.match(await text('#education-age'),/adolescents/);
 await restart();await assess(0,'Never');assert.equal(await text('#daily'),'0m');assert(!await visible('#platform-breakdown'));assert(!await visible('#cutback'));
 // Reload preserves plan/nights and legacy bedtime reuse; clear explicitly only.
 await page.reload();await assess(300,'Never');await page.click('#shield-open');assert.equal(await page.locator('#shield-bedtime').inputValue(),'');await page.getByRole('button',{name:/Reuse saved bedtime/}).click();assert.equal(await page.locator('#shield-bedtime').inputValue(),'00:10');assert.equal(await page.locator('#shield-window').inputValue(),'45');await page.click('#shield-use');await page.getByText('View My Progress',{exact:true}).click();assert(await visible('.shield-completed-row'));page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Clear Sleep Shield nights',exact:true}).click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('social-media-sense.sleep-shield.v1')).nights.filter(Boolean).length),0);
 // Complete the seven-night sequence, verify disabled completion action and re-enable after clearing.
 for(let i=0;i<7;i++){await page.click('#shield-track');await saveNight(String(6+i%3),i%2?'No':'Yes');}
 assert(await page.locator('#shield-track').isDisabled());assert.match(await text('#sleep-shield-content'),/7 of 7 nights recorded/);
 assert.match(await text('.shield-comparison'),/do not prove/);
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Clear Sleep Shield nights',exact:true}).click();assert(!await page.locator('#shield-track').isDisabled());
 await page.click('#shield-back');await page.emulateMedia({reducedMotion:'reduce'});await page.click('#balance-celebrate');assert.equal(await page.locator('.balance-confetti-piece').count(),0);
 // Capture the initial, collapsed reading order as well as the expanded tool state.
 await page.locator('#result details').evaluateAll(nodes=>nodes.forEach(n=>n.open=false));
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});await noOverflow();if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`report-initial-${width}.png`),fullPage:true});}
 assert.deepEqual(errors,[]);console.log('PASS report hierarchy, goal projections, save/comparison states, optional plan stages, midnight cutoff, night save/edit/clear, reload, report/draft preservation, live/fallback fixtures, celebration, keyboard/touch, and 320/390/768/1280 layout');
}finally{await browser.close();}
