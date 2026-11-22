import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startRoutingServer} from './routing-server.mjs';
const before=process.env.REPORT_BEFORE==='1',cwd=process.cwd();
if(before)process.chdir('artifacts/everyday-balance/baseline');
const server=await startRoutingServer();process.chdir(cwd);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox']});
const never={bedtime:'Never',tasks:'Never',movement:'Never',people:'Never',longer:'Never'};
const cases=[
 {id:'A',daily:60,age:21,tie:true,b:Object.fromEntries(Object.keys(never).map(k=>[k,'Sometimes'])),view:'shield',key:'bedtime',summary:/occasional interruptions in all five/},
 {id:'B',daily:180,age:30,b:never,view:'progress',key:'balance',summary:/did not report/},
 {id:'C',daily:30,age:16,b:{...never,bedtime:'Often'},view:'shield',key:'bedtime',summary:/frequent interruptions in bedtime/},
 {id:'D',daily:240,age:70,b:{...never,bedtime:'Sometimes',tasks:'Often'},view:'reduction',key:'tasks',summary:/frequent interruptions in responsibilities/},
 {id:'E',daily:180,age:30,b:{...never,tasks:'Often',movement:'Often'},view:'reduction',key:'tasks',summary:/frequent interruptions in responsibilities and physical activity/},
 {id:'F',daily:0,age:30,b:never,view:'progress',key:'balance',summary:/did not report/},
 {id:'G',daily:45,age:15,b:never,view:'progress',key:'balance',summary:/did not report/},
 {id:'H',daily:90,age:75,b:{...never,movement:'Sometimes'},view:'progress',key:'movement',summary:/occasional interruptions in physical activity/},
 {id:'I',daily:180,age:40,b:Object.fromEntries(Object.keys(never).map(k=>[k,'Often'])),view:'shield',key:'bedtime',summary:/frequent interruptions in all five/},
 {id:'J',daily:120,age:100,b:{...never,people:'Often'},view:'progress',key:'people',summary:/frequent interruptions in time with other people/}
];
await fs.mkdir('artifacts/everyday-balance',{recursive:true});
try{
 for(const width of before?[390,1280]:[320,390,768,1280]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',hasTouch:width<500}),p=await context.newPage(),errors=[];let requests=0;
 p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 await context.route('**/api/health-information',route=>{requests++;return route.fulfill({status:503,contentType:'application/json',body:'{"code":"clarity_fallback_fixture"}'});});
 try{
  await p.goto(server.origin);await p.click('#home-start');
  for(const c of before?cases.filter(c=>['A','D'].includes(c.id)):cases){
   await p.fill('#name','Demo');await p.fill('#age',String(c.age));await p.click('#flow-next');
   for(const [name,time] of c.tie?[['Facebook',30],['Instagram',30]]:[['Facebook',c.daily]])await p.getByRole('slider',{name:name+' daily usage',exact:true}).evaluate((el,m)=>{el.value=platformPosition(m);el.dispatchEvent(new Event('input',{bubbles:true}));},time);
   await p.click('#flow-next');await p.fill('#sleep-hours','7');await p.fill('#sleep-minutes','0');await p.click('#flow-next');await p.fill('#activity-hours','1');await p.fill('#activity-minutes','0');await p.click('#flow-next');await p.check('[name="prebed"][value="Often"]');
   for(const [key,value] of Object.entries(c.b))await p.check(`[name="${key}"][value="${value}"]`);
   await p.click('#flow-next');await p.locator('#result').waitFor({state:'visible'});await p.waitForFunction(()=>document.getElementById('education-live-status').textContent.includes('Evidence-based educational resources'));
   if(!before){
    assert.deepEqual(await p.locator('#result > .report-group > h3').allTextContents(),['Your Time','Your Everyday Balance','Make Room for What Matters']);
    assert.match(await p.locator('#report-routine-summary').innerText(),c.summary);assert.equal(await p.locator('#next-step-action').getAttribute('data-view'),c.view);
    assert.equal(await p.evaluate(()=>biggestOpportunity({behaviors:Object.fromEntries([...document.querySelectorAll('#questions input:checked')].map(e=>[e.name,e.value]))}).key),c.key);
    assert.equal(await p.locator('#result input,#result select,#result textarea').count(),0);assert.equal(await p.locator('#result details[open]').count(),0);
    assert.equal(await p.locator('#balance-celebrate').isVisible(),['B','F','G'].includes(c.id));
    if(c.tie){const list=await p.locator('#platform-ranking').innerText();assert.match(list,/Facebook — 30m/);assert.match(list,/Instagram — 30m/);assert.equal(await p.locator('#platform-ranking').evaluate(e=>e.tagName),'UL');}
    await p.locator('#report-health > summary').press('Enter');await p.locator('#report-answers > summary').press('Enter');
    await p.locator('#report-calculation > summary').press('Enter');assert.equal(await p.locator('#yearly').innerText(),await p.evaluate(m=>duration(m*365),c.daily));await p.locator('#report-calculation > summary').press('Enter');
    await p.locator('#report-sleep > summary').press('Enter');assert.match(await p.locator('#sleep-context-reference').innerText(),c.age<18?/24 hours/:c.age>=65?/7–8/:/7 or more/);await p.locator('#report-sleep > summary').press('Enter');
    assert.deepEqual(await p.locator('.routine-answers tbody td').allTextContents(),['bedtime','tasks','movement','people','longer'].map(k=>c.b[k]));
    assert.equal(await p.locator('.routine-answers tbody th[scope="row"]').count(),5);
    assert(await p.locator('.routine-answers tbody td').evaluateAll(cells=>cells.every(e=>getComputedStyle(e).whiteSpace==='nowrap'&&e.scrollWidth<=e.clientWidth)));
    assert.equal(await p.locator('#review details').count(),0);
    assert.equal(await p.locator('#biggest-opportunity').isVisible(),c.key!=='balance');
    if(c.key!=='balance'){
     assert.match(await p.locator('#opportunity-title').innerText(),/optional example/);
     assert.match(await p.locator('#report-choice-note').innerText(),/Only you can decide/);
     assert.match(await p.locator('#next-step-description').innerText(),/You could/);
     if(['A','E'].includes(c.id))assert.match(await p.locator('#report-choice-note').innerText(),/same reported frequency/);
    }
    assert.match(await p.locator('#report-save-note').innerText(),/not automatically saved/);
    const countBefore=requests,storageBefore=await p.evaluate(()=>({...localStorage}));
    await p.locator('#report-health-details > summary').press('Enter');
    assert(await p.locator('#education-benefits').isVisible());assert(await p.locator('#education-risks').isVisible());
    assert.match(await p.locator('#education-fallback-note').innerText(),/locally curated/);assert(!await p.locator('#education-checked').isVisible());
    assert((await p.locator('#education-benefits a[href^="https:"]').count())>0);
    assert.equal(await p.locator('#education-benefits a').first().evaluate(e=>getComputedStyle(e).color),'rgb(224, 251, 158)');
    assert.equal(await p.locator('#daily').innerText(),await p.evaluate(m=>duration(m),c.daily));
    assert.equal(await p.locator('#weekly').innerText(),await p.evaluate(m=>duration(m*7),c.daily));
    await p.locator('#report-health-details > summary').press('Enter');
    assert.equal(requests,countBefore);assert.deepEqual(await p.evaluate(()=>({...localStorage})),storageBefore);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await p.locator('#report-health > summary').press('Enter');
   }
   if([390,1280].includes(width)){await p.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});await p.screenshot({path:`artifacts/everyday-balance/${before?'before':'after'}-${c.id}-${width}.png`,fullPage:true,animations:'disabled'});}
   if([390,1280].includes(width)&&c.id==='A'){
    await p.locator('#report-health > summary').press('Enter');await p.locator('#report-calculation > summary').press('Enter');await p.locator('#report-sleep > summary').press('Enter');
    if(!before)await p.locator('#report-health-details > summary').press('Enter');
    await p.screenshot({path:`artifacts/everyday-balance/${before?'before':'after'}-expanded-${width}.png`,fullPage:true,animations:'disabled'});
    await p.evaluate(()=>document.querySelectorAll('#result details').forEach(d=>d.open=false));
   }
   if(!before){
    const snapshot=await p.locator('#report-snapshot').innerText(),count=requests;
    await p.click(c.view==='progress'?'#next-step-action':'#next-step-progress');assert(await p.locator('#progress-screen').isVisible());const previous=await p.evaluate(()=>JSON.parse(localStorage.getItem('room.saved-checkins.v1')||'{"checkins":[]}').checkins.length);
    if(width===390&&c.id==='B'){
     await p.evaluate(()=>{window.restoreStorageWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Test storage unavailable','QuotaExceededError');};});
     await p.click('#save-checkin');assert.match(await p.locator('#goal-save-status').innerText(),/could not|unable|not saved/i);
     assert.match(await p.locator('#report-save-note').textContent(),/not automatically saved/);
     await p.evaluate(()=>{Storage.prototype.setItem=window.restoreStorageWrite;delete window.restoreStorageWrite;});
    }
    await p.click('#save-checkin');assert(await p.locator('#save-checkin').isDisabled());await p.locator('#save-checkin').evaluate(e=>e.click());assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('room.saved-checkins.v1')).checkins.length),previous+1);
    await p.locator('[data-view="tools"]:visible').first().click();await p.click('#tools-report');assert.equal(requests,count);assert.equal(await p.locator('#report-snapshot').innerText(),snapshot);assert.match(await p.locator('#report-save-note').innerText(),/saved on this device/);
    if(c.view!=='progress'){await p.click('#next-step-action');assert(await p.locator(c.view==='shield'?'#sleep-shield':'#reduction-screen').isVisible());await p.locator('[data-view="tools"]:visible').first().click();await p.click('#tools-report');assert.equal(await p.locator('#report-snapshot').innerText(),snapshot);}
   }
   await p.click('#start-new-checkin');
   console.log(`PASS ${before?'baseline':'clarity'} ${c.id} ${width}px`);
  }
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
 }
}finally{await browser.close();await server.close();}

