import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const sandbox={module:{exports:{}}};vm.createContext(sandbox);
for(const file of ['platforms.js','app.js','sleep-context.js'])vm.runInContext(await readFile(new URL('../public/'+file,import.meta.url),'utf8'),sandbox);
const {sleepContext,sleepReference,sleepBedtimeConnection,sleepShieldIntro}=sandbox.module.exports;
const calculate=vm.runInContext('calculateWithRoutine',sandbox);
const base={name:'Test',age:30,platforms:[{name:'Facebook',hours:3,minutes:30}],'sleep-hours':8,'sleep-minutes':0,'sleep-bedtime':'23:00',prebed:'Never','activity-hours':0,'activity-minutes':30,bedtime:'Never',tasks:'Never',movement:'Never',longer:'Never'};
for(const [i,age,minutes,reference,status] of [[1,13,450,'8–10 hours per 24 hours','not-comparable'],[2,16,540,'8–10 hours per 24 hours','not-comparable'],[3,30,360,'7 or more hours per night','below'],[4,30,480,'7 or more hours per night','within'],[5,62,480,'7–9 hours per night','within'],[6,70,450,'7–8 hours per night','within']]){const c=sleepContext(age,minutes);assert.equal(c.reference,reference);assert.equal(c.status,status);console.log(`PASS Test ${i}`);}
for(const [i,age,hours,prebed,bedtime,related] of [[7,16,6,'Never','Never',false],[8,16,6,'Often','Often',true],[9,16,9,'Often','Sometimes',true],[10,30,8,'Never','Never',false]]){const r=calculate({...base,age,'sleep-hours':hours,prebed,bedtime});assert.equal(sleepBedtimeConnection(r).related,related);assert.equal(r.worthReviewing,bedtime!=='Never');if(related){assert.match(sleepShieldIntro(r),/You reported/);assert.match(sleepShieldIntro(r),new RegExp(bedtime.toLowerCase()+' keeps'));}console.log(`PASS Test ${i}`);}
for(const [i,age] of [[11,12],[12,121]]){assert.throws(()=>calculate({...base,age}),e=>e.fields.age==='Enter a whole-number age from 13 to 120.');console.log(`PASS Test ${i}`);}
for(const age of ['',null,undefined,12.5,13.5])assert.throws(()=>calculate({...base,age}));
for(const [age,group] of [[13,'Teen'],[17,'Teen'],[18,'Adult'],[60,'Adult'],[61,'Adult 61–64'],[64,'Adult 61–64'],[65,'Older adult'],[120,'Older adult']])assert.equal(sleepReference(age).group,group);
for(const minutes of [0,450,480,540,600,720]){const c=sleepContext(13,minutes);assert.equal(c.status,'not-comparable');assert.match(c.text,/nighttime sleep/);assert.match(c.text,/daytime naps/);}
for(const [age,low,high] of [[62,420,540],[70,420,480]]){assert.equal(sleepContext(age,low-1).status,'below');assert.equal(sleepContext(age,low).status,'within');assert.equal(sleepContext(age,high).status,'within');assert.equal(sleepContext(age,high+1).status,'above');assert.match(sleepContext(age,high+1).text,/Individual sleep needs can vary/);}
assert.equal(sleepContext(30,1440).status,'within');assert.equal(sleepContext(30,419).status,'below');assert.equal(sleepContext(30,420).status,'within');
for(const hours of [0,6,8,24]){const r=calculate({...base,'sleep-hours':hours});assert.equal(r.worthReviewing,false);assert.equal(r.daily,210);assert.equal(r.weekly,1470);assert.equal(r.yearly,76650);}
assert.equal(sleepBedtimeConnection(calculate({...base,prebed:'Often'})).related,true);
assert.equal(sleepBedtimeConnection(calculate({...base,bedtime:'Sometimes'})).related,true);
console.log('PASS age boundaries, neutral upper-range wording, either bedtime answer, unchanged concern logic and totals');
