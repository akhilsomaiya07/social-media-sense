import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {cleanInput,searchRequest} from '../lib/health.mjs';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const sandbox={module:{exports:{}}};vm.createContext(sandbox);
for(const file of ['platforms.js','app.js','sleep-shield.js'])vm.runInContext(await readFile('public/'+file,'utf8'),sandbox);
const api=sandbox.module.exports;
assert.equal(api.shieldPlan('23:00').cutoff,'10:30 PM');
assert.equal(api.shieldPlan('00:10',30).cutoff,'11:40 PM');assert(api.shieldPlan('00:10',30).previousDay);
assert.equal(api.shieldPlan('00:00',60).cutoff,'11:00 PM');assert.equal(api.shieldPlan('12:00',15).cutoff,'11:45 AM');
assert.throws(()=>api.shieldPlan('25:00'));assert.throws(()=>api.shieldPlan('23:00',-30));assert.throws(()=>api.shieldPlan('23:00',120));
const p=api.shieldPlan('23:00');assert.equal(p.week,210);assert.equal(p.month,900);assert.equal(p.year,10950);assert.equal(api.shieldDuration(p.year),'182h 30m');
const night=(followed,sleepMinutes,rested='Somewhat rested')=>({followed,sleepMinutes,rested,note:''});
const c=api.shieldComparison([night('Yes',420),night('Yes',444),night('No',400),night('Partly',360),null]);assert.equal(c.yes.average,432);assert.equal(c.no.average,400);assert.equal(c.partly.count,1);assert.equal(c.complete,4);assert.equal(c.rating,'Somewhat rested');assert.equal(api.shieldComparison([]).rating,null);assert(!api.validateShieldNight(night('Yes',1441)));assert(api.validateShieldNight(night('Yes',0)));
const data={age:30,name:'Test',platforms:[{name:'Other',hours:3,minutes:30}], 'sleep-hours':7,'sleep-minutes':30,'sleep-bedtime':'23:00',prebed:'Often','activity-hours':1,'activity-minutes':30,bedtime:'Never',tasks:'Never',movement:'Never',people:'Never',longer:'Never'};
const calculation=vm.runInContext('calculateWithRoutine',sandbox);const result=calculation(data);assert.equal(result.daily,210);assert.equal(result.weekly,1470);assert.equal(result.yearly,76650);assert.equal(result.sleep,7.5);assert.equal(result.activity,90);assert.equal(api.shieldOpportunity(result).heading,'Create a screen-free wind-down');
for(const [key,value] of [['prebed',''],['sleep-hours',30],['sleep-minutes',60],['activity-hours',25]])assert.throws(()=>calculation({...data,[key]:value}),e=>Boolean(e.fields[key]));
assert.throws(()=>calculation({...data,platforms:[{name:'A',hours:12,minutes:0},{name:'B',hours:12,minutes:0},{name:'C',hours:0,minutes:5}]}));
assert.equal(calculation({...data,platforms:[{name:'A',hours:12,minutes:0},{name:'B',hours:10,minutes:0}]}).daily,1320);
const ctx={ageGroup:'Adults',dailyMinutes:210,topics:['social media benefits and online social connection','screen use and sleep'],disruption:{bedtime:'Never',tasks:'Never',movement:'Never',people:'Never',longer:'Never'},sleepShield:{age:30,prebed:'Often',notes:'must not send',nights:[night('Yes',420)]}};
const clean=cleanInput(ctx);assert.deepEqual(clean.sleepShield,{age:30,prebed:'Often'});assert(!JSON.stringify(clean).includes('must not send'));assert(searchRequest(clean).instructions.includes('exactly 30 years old'));assert.throws(()=>cleanInput({...ctx,sleepShield:{age:12,prebed:'Often'}}));




for(const value of [undefined,'','invalid']){const r=calculation({...data,'sleep-bedtime':value});assert.equal(r.daily,210);assert.equal(r.worthReviewing,result.worthReviewing);}
assert.equal(api.savedShieldBedtime({bedtime:'00:10'},{}),'00:10');assert.equal(api.savedShieldBedtime({nights:[{plan:{bedtime:'23:00'}}]},{}),'23:00');assert.equal(api.savedShieldBedtime({}, {sleepBedtime:'22:00'}),'22:00');assert.equal(api.savedShieldBedtime({},{}),'');assert(!api.validShieldBedtime('25:00'));

console.log('PASS: optional/legacy assessment bedtime, saved-bedtime discovery, midnight cutoffs, projections, nights, unchanged validation/totals, research privacy.');

// View navigation reuses one planner and never mutates the report or assessment.
const nodes=Object.fromEntries(['sleep-shield','sleep-shield-content','result','shield-open','shield-back','shield-invitation','sleep-shield-title','checkin'].map(id=>[id,{hidden:false,textContent:'',replaceChildren(){this.children=[];},focus(){focused=id;},addEventListener(){}}]));
let focused,builds=0;const view={document:{getElementById:id=>nodes[id]},window:{scrollY:125,scrollTo({top}){this.scrollY=top;}},AbortController};vm.createContext(view);vm.runInContext(await readFile('public/sleep-shield.js','utf8'),view);view.build=()=>{builds++;nodes['sleep-shield-content'].draft='retained';};vm.runInContext('buildSleepShield=build',view);view.result={reasons:[{text:'You said social media kept you up later than intended.',frequency:'Often'}]};vm.runInContext('renderSleepShield(result)',view);
assert.equal(builds,0);assert.equal(nodes['sleep-shield'].hidden,true);const snapshot=JSON.stringify(view.result);nodes['shield-open'].onclick();assert.equal(builds,1);assert.equal(nodes.result.hidden,true);assert.equal(nodes['sleep-shield'].hidden,false);assert.equal(focused,'sleep-shield-title');view.window.scrollY=900;nodes['shield-back'].onclick();assert.equal(view.window.scrollY,125);assert.equal(focused,'shield-open');assert.equal(nodes.result.hidden,false);nodes['shield-open'].onclick();assert.equal(builds,1);assert.equal(view.window.scrollY,900);assert.equal(nodes['sleep-shield-content'].draft,'retained');assert.equal(JSON.stringify(view.result),snapshot);nodes['shield-back'].onclick();view.result={reasons:[]};vm.runInContext('renderSleepShield(result)',view);assert.equal(nodes['shield-invitation'].hidden,true);nodes['shield-open'].onclick();assert.equal(builds,2);console.log('PASS separate Sleep Shield view, lazy single initialization, focus/scroll restoration, retained draft and unchanged assessment');
