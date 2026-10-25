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

// My Tools initializes the planner once, with optional assessment context.
let builds=0,contextChanges=0;const node={draft:null},listeners={};
const view={document:{getElementById:()=>node,addEventListener:(name,fn)=>listeners[name]=fn},AbortController};vm.createContext(view);vm.runInContext(await readFile('public/sleep-shield.js','utf8'),view);
view.build=result=>{builds++;node.draft='retained';assert.equal(result,null);};vm.runInContext('buildSleepShield=build',view);
listeners['view:before']({detail:{view:'shield'}});listeners['view:before']({detail:{view:'shield'}});assert.equal(builds,1);assert.equal(node.draft,'retained');
view.change=()=>contextChanges++;vm.runInContext('shieldRefreshContext=change',view);view.result={reasons:[]};const snapshot=JSON.stringify(view.result);vm.runInContext('renderSleepShield(result)',view);assert.equal(contextChanges,1);assert.equal(builds,1);assert.equal(node.draft,'retained');assert.equal(JSON.stringify(view.result),snapshot);
console.log('PASS standalone Sleep Shield initialization, no duplicate build, retained draft and separate assessment context');

const entry=(answer='Yes',minutes=450,extra={})=>({...night(answer,minutes),...extra});
const seven=()=>Array.from({length:7},()=>entry());
assert.equal(api.shieldVisualData([]).counts.unrecorded,7);
assert.equal(api.shieldVisualData(seven()).achievement,true);
assert.equal(api.shieldVisualData(seven(),false).achievement,false);
for(const last of [entry('Partly'),entry('No'),null,{followed:'Yes'},entry('Yes',1441)])assert.equal(api.shieldVisualData([...seven().slice(0,6),last]).achievement,false);
for(const answer of ['Partly','No'])assert.equal(api.shieldVisualData(seven().map(()=>entry(answer))).achievement,false);
const mixed=api.shieldVisualData([entry('Yes',0),entry('Partly',1440),entry('No',300),null]);
assert.equal(mixed.counts.Yes,1);assert.equal(mixed.counts.Partly,1);assert.equal(mixed.counts.No,1);assert.equal(mixed.counts.unrecorded,4);assert.equal(mixed.maxMinutes,1440);assert.equal(mixed.slots[0].sleepMinutes,0);assert.equal(mixed.slots[3],null);
assert.equal(api.shieldVisualData(Array(7).fill({followed:'Yes',sleepMinutes:'450',rested:'Rested',note:''})).comparison.complete,0);
assert.match(api.shieldFeedback(entry('Yes'),30).title,/Nice work/);
assert.doesNotMatch(JSON.stringify(api.shieldFeedback(entry('Partly'),15)),/shorter|Nice work|🎉/);
assert.match(api.shieldFeedback(entry('Partly'),30).text,/shorter/);
assert.doesNotMatch(JSON.stringify(api.shieldFeedback(entry('No'),15)),/Nice work|🎉/);
assert.equal(api.shieldFeedback(null,30),null);
const differing=seven().map((n,i)=>({...n,recordedAt:'2026-01-15T12:00:00Z',plan:{bedtime:'23:00',window:[15,30,45,60][i%4],activity:'Read'}}));
const original=JSON.stringify(differing);assert(api.shieldVisualData(differing).achievement);assert.equal(JSON.stringify(differing),original);
console.log('PASS seven-slot charts, all achievement exclusions, valid zero/high sleep, legacy/differing plans, immutable data and minimum-window feedback');
