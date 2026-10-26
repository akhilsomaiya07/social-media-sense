import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startRoutingServer} from './routing-server.mjs';
const server=await startRoutingServer();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox']});
const key='social-media-sense.sleep-shield.v1',dir='artifacts/shield-progress';await fs.mkdir(dir,{recursive:true});
const entry=(followed='Yes',sleepMinutes=450)=>({followed,sleepMinutes,rested:'Rested',note:'Synthetic note',recordedAt:'2026-01-15T12:00:00Z',plan:{bedtime:'23:00',window:30,activity:'Read'}});
async function open(p){await p.goto(server.origin);await p.getByRole('button',{name:'Explore My Tools',exact:true}).click();await p.click('#shield-open');}
async function plan(p,window='30'){await p.fill('#shield-bedtime','00:10');await p.selectOption('#shield-window',window);await p.click('#shield-use');assert.match(await p.locator('.shield-timeline').innerText(),/previous day/);}
async function fill(p,answer='Yes',hours='7',minutes='30'){await p.locator('.shield-night select').nth(0).selectOption(answer);await p.getByLabel('Sleep hours',{exact:true}).fill(hours);await p.getByLabel('Sleep minutes',{exact:true}).fill(minutes);await p.locator('.shield-night select').nth(1).selectOption('Rested');}
async function save(p){await p.getByRole('button',{name:'Save night',exact:true}).click();}
async function progress(p){const d=p.locator('details').filter({has:p.locator('summary').filter({hasText:/^View My Progress$/})});if(await d.getAttribute('open')===null)await d.locator(':scope > summary').press('Enter');}
try{
for(const width of [320,390,768,1280]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:width<500?'reduce':'no-preference'}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 await context.route('**/api/health-information',r=>r.fulfill({status:503,body:'{}'}));
 await open(p);await plan(p,'15');await progress(p);
 assert.equal(await p.locator('.shield-slot').count(),7);assert.equal(await p.locator('.shield-slot[data-status="Unrecorded"]').count(),7);assert(!await p.locator('#shield-achievement').isVisible());
 await p.click('#shield-track');assert.match(await p.locator('#shield-adherence-help').innerText(),/do not establish/);
 await fill(p,'Yes','0','0');await save(p);assert.match(await p.locator('#shield-feedback').innerText(),/Night check-in saved/);assert.equal(await p.evaluate(()=>document.activeElement.textContent),'Save night');assert(await p.locator('.shield-night').isVisible());
 assert.equal(await p.locator('.shield-duration-bars li').first().locator('strong').innerText(),'0m');assert.equal(await p.locator('.shield-duration-bars li').nth(1).locator('strong').innerText(),'Not recorded');
 await p.getByRole('button',{name:'Close check-in',exact:true}).click();
 await p.click('#shield-track');await fill(p,'Partly','24','0');await save(p);assert.doesNotMatch(await p.locator('#shield-feedback').innerText(),/Nice work|shorter/);await p.getByRole('button',{name:'Close check-in',exact:true}).click();
 await p.click('#shield-track');await fill(p,'No');await save(p);assert.match(await p.locator('#shield-feedback').innerText(),/didn't quite fit/);await p.getByRole('button',{name:'Close check-in',exact:true}).click();
 assert.equal(await p.locator('.shield-slot[data-status="Unrecorded"]').count(),4);assert.equal(await p.locator('.shield-duration-fill').nth(1).evaluate(e=>e.style.width),'100%');
 await p.screenshot({path:`${dir}/mixed-${width}.png`,fullPage:true});
 // Edit in both directions and retain original plan even after editing current settings.
 await p.click('#shield-edit');await p.selectOption('#shield-window','60');await p.click('#shield-use');
 for(let i=0;i<3;i++){await p.getByRole('button',{name:`Edit night ${i+1}`,exact:true}).click();await fill(p,'Yes');await save(p);await p.getByRole('button',{name:'Close check-in',exact:true}).click();}
 for(let i=3;i<7;i++){await p.click('#shield-track');await fill(p,'Yes');if(i===6){await p.evaluate(()=>{window.failSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('failed seventh save');};});await save(p);assert(!await p.locator('#shield-achievement').isVisible());assert.equal(await p.locator('.shield-slot[data-status="Yes"]').count(),6);assert.equal(await p.locator('#shield-feedback').innerText(),'');await p.evaluate(()=>Storage.prototype.setItem=window.failSet);}await save(p);if(i<6)assert(!await p.locator('#shield-achievement').isVisible());await p.getByRole('button',{name:'Close check-in',exact:true}).click();}
 assert(!await p.locator('#shield-achievement').isVisible());assert.equal(await p.locator('#shield-achievement').evaluate(e=>e.getAnimations({subtree:true}).length),0);
 let data=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(data.nights[0].plan.window,15);assert.equal(data.nights[6].plan.window,60);assert(data.nights.every(n=>n.adherenceQuestion==='wind-down-v1'));
 await p.screenshot({path:`${dir}/seven-${width}.png`,fullPage:true});
 await p.getByRole('button',{name:'Edit night 1',exact:true}).click();await fill(p,'No');await save(p);assert(!await p.locator('#shield-achievement').isVisible());assert.match(await p.locator('#shield-feedback').innerText(),/didn't quite fit/);await fill(p,'Yes');await save(p);assert(!await p.locator('#shield-achievement').isVisible());
 await p.reload();await p.locator('#sleep-shield').waitFor({state:'visible'});
 await p.getByRole('button',{name:/Resume My Plan/}).click();await progress(p);assert(!await p.locator('#shield-achievement').isVisible());assert.equal(await p.locator('#shield-feedback').innerText(),'');
 await p.getByRole('button',{name:'Edit night 1',exact:true}).click();await fill(p,'No');
 await p.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('storage fixture');};});await save(p);assert.match(await p.locator('.shield-night .shield-error').innerText(),/Not saved/);assert(!await p.locator('#shield-achievement').isVisible());assert.equal(await p.locator('#shield-feedback').innerText(),'');
 await p.evaluate(()=>Storage.prototype.setItem=window.originalSet);await save(p);assert(!await p.locator('#shield-achievement').isVisible());
 p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Clear Sleep Tracker nights',exact:true}).click();assert.equal(await p.locator('.shield-slot[data-status="Unrecorded"]').count(),7);assert(!await p.locator('#shield-achievement').isVisible());assert.equal(await p.locator('#shield-feedback').innerText(),'');
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);await context.close();console.log(`PASS shield progress ${width}px: charts, feedback, edit, clear, persistence, failed save, focus, overflow and motion`);
}
// Legacy, invalid and unreadable storage: isolated contexts, no destructive rewrite.
for(const fixture of ['legacy','invalid','unreadable','unavailable']){
 const context=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'}),p=await context.newPage();
 const value=fixture==='unreadable'?'{broken':JSON.stringify({window:30,bedtime:'23:00',activity:'Read',nights:fixture==='invalid'?[entry(),{followed:'Yes',sleepMinutes:2000,note:'retain'}]:Array.from({length:7},()=>entry())});
 await p.addInitScript(({key,value,fixture})=>{if(!sessionStorage.getItem('fixture')){localStorage.setItem(key,value);sessionStorage.setItem('fixture','1');}if(fixture==='unavailable')Storage.prototype.setItem=()=>{throw Error('unavailable fixture');};},{key,value,fixture});
 await open(p);if(fixture==='unreadable')await plan(p);else await p.getByRole('button',{name:/Resume My Plan/}).click();await progress(p);
 if(fixture==='legacy'){assert.match(await p.locator('.shield-night-progress,.shield-charts + p').innerText(),/Legacy/);assert(!await p.locator('#shield-achievement').isVisible());await p.getByRole('button',{name:'Edit night 1',exact:true}).click();assert.equal(await p.locator('#shield-followed').locator('..').textContent().then(t=>t.includes('Did you follow your Sleep Tracker?')),true);await fill(p,'No');await save(p);assert.equal(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).nights[0].adherenceQuestion,key),undefined);}
 if(fixture==='invalid'){assert.equal(await p.locator('.shield-slot[data-status="Unrecorded"]').count(),6);await p.click('#shield-edit');await p.click('#shield-use');assert.equal(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).nights[1].sleepMinutes,key),2000);}
 if(['unreadable','unavailable'].includes(fixture)){if(fixture==='unavailable'){await p.getByRole('button',{name:'Edit night 1',exact:true}).click();}else await p.click('#shield-track');await fill(p);await save(p);assert.match(await p.locator('.shield-night .shield-error').innerText(),/Not saved/);assert.equal(await p.evaluate(k=>localStorage.getItem(k),key),value);assert.equal(await p.locator('#shield-feedback').innerText(),'');}
 await context.close();console.log('PASS storage '+fixture);
}
}finally{await browser.close();await server.close();}
