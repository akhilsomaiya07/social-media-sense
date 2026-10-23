import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startRoutingServer} from './routing-server.mjs';
const before=process.env.REPORT_BEFORE==='1',cwd=process.cwd();
if(before)process.chdir('artifacts/clarity/baseline');
const server=await startRoutingServer();process.chdir(cwd);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox']});
const never={bedtime:'Never',tasks:'Never',movement:'Never',people:'Never',longer:'Never'};
const cases=[
 {id:'A',daily:60,age:30,b:Object.fromEntries(Object.keys(never).map(k=>[k,'Sometimes'])),view:'shield',key:'bedtime',summary:/occasional interruptions in all five/},
 {id:'B',daily:180,age:30,b:never,view:'progress',key:'balance',summary:/did not report/},
 {id:'C',daily:30,age:16,b:{...never,bedtime:'Often'},view:'shield',key:'bedtime',summary:/frequent interruptions in bedtime/},
 {id:'D',daily:240,age:70,b:{...never,bedtime:'Sometimes',tasks:'Often'},view:'reduction',key:'tasks',summary:/frequent interruptions in responsibilities/},
 {id:'E',daily:60,age:30,b:{...never,people:'Sometimes'},view:'progress',key:'people',summary:/occasional interruptions in time with other people/,tie:true},
 {id:'F',daily:5,age:30,b:never,view:'progress',key:'balance',summary:/did not report/}
];
await fs.mkdir('artifacts/clarity',{recursive:true});
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
   await p.click('#flow-next');await p.fill('#sleep-hours','7');await p.fill('#sleep-minutes','30');await p.check('[name="prebed"][value="Often"]');await p.click('#flow-next');await p.fill('#activity-hours','0');await p.fill('#activity-minutes','45');await p.click('#flow-next');
   for(const [key,value] of Object.entries(c.b))await p.check(`[name="${key}"][value="${value}"]`);
   await p.click('#flow-next');await p.locator('#result').waitFor({state:'visible'});await p.waitForFunction(()=>document.getElementById('education-live-status').textContent.includes('could not'));
   if(!before){
    assert.deepEqual(await p.locator('#result > .report-group > h3').allTextContents(),['Your Time','What Stood Out','What You Can Do Next']);
    assert.match(await p.locator('#review > p').first().innerText(),c.summary);assert.equal(await p.locator('#next-step-action').getAttribute('data-view'),c.view);
    assert.equal(await p.evaluate(()=>biggestOpportunity({behaviors:Object.fromEntries([...document.querySelectorAll('#questions input:checked')].map(e=>[e.name,e.value]))}).key),c.key);
    assert.equal(await p.locator('#result input,#result select,#result textarea').count(),0);assert.equal(await p.locator('#result details[open]').count(),0);
    assert.equal(await p.locator('#balance-celebrate').isVisible(),['B','F'].includes(c.id));
    if(c.tie){const list=await p.locator('#platform-ranking').innerText();assert.match(list,/Facebook — 30m/);assert.match(list,/Instagram — 30m/);assert.equal(await p.locator('#platform-ranking').evaluate(e=>e.tagName),'UL');}
    await p.locator('#report-calculation > summary').press('Enter');assert.equal(await p.locator('#yearly').innerText(),await p.evaluate(m=>duration(m*365),c.daily));await p.locator('#report-calculation > summary').press('Enter');
    await p.locator('#report-sleep > summary').press('Enter');assert.match(await p.locator('#sleep-context-reference').innerText(),c.age===16?/24 hours/:c.age===70?/7–8/:/7 or more/);await p.locator('#report-sleep > summary').press('Enter');
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   }
   if([390,1280].includes(width)){await p.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});await p.screenshot({path:`artifacts/clarity/${before?'before':'after'}-${c.id}-${width}.png`,fullPage:true,animations:'disabled'});}
   if(!before){
    const snapshot=await p.locator('#report-snapshot').innerText(),count=requests;
    await p.click(c.view==='progress'?'#next-step-action':'#next-step-progress');assert(await p.locator('#progress-screen').isVisible());const previous=await p.evaluate(()=>JSON.parse(localStorage.getItem('room.saved-checkins.v1')||'{"checkins":[]}').checkins.length);
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
