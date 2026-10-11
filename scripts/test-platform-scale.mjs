import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const sandbox={module:{exports:{}}};vm.createContext(sandbox);
vm.runInContext(await readFile(new URL('../public/platforms.js',import.meta.url),'utf8'),sandbox);
const {platformPosition:position,platformMinutes:minutes,platformSummary:summary}=sandbox.module.exports;
assert.deepEqual([0,30,120,720].map(position),[0,360,720,1080]);
for(let m=0;m<=720;m+=5){assert(Number.isInteger(position(m)));assert.equal(minutes(position(m)),m);if(m)assert(position(m)>position(m-5));}
let last=-1;
for(let p=0;p<=1080;p++){const m=minutes(p);assert(m>=last);assert.equal(m%5,0);assert(m>=0&&m<=720);last=m;}
assert.equal(minutes(-1),0);assert.equal(minutes(2000),720);
for(const [m,expected] of [[30,30],[120,120],[210,210],[720,720]]){const actual=minutes(position(m));const s=summary([{name:'Facebook',hours:Math.floor(actual/60),minutes:actual%60}]);assert.equal(s.total,expected);assert.equal(Object.keys(s.errors).length,0);}
const entries=[{name:'Facebook',hours:12,minutes:0},{name:'Instagram',hours:12,minutes:0}];assert.equal(summary(entries).total,1440);assert.equal(Object.keys(summary(entries).errors).length,0);assert.equal(summary([...entries,{name:'Other',hours:0,minutes:5}]).errors['platform-total'],'Your entries add up to more than 24 hours in one day. Some app usage may overlap. Adjust the times so your total reflects your actual day.');
console.log('PASS nonlinear marker positions, all 145 selectable times round-trip, monotonic 5-minute quantization, unchanged totals and 24-hour validation');
