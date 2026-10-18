import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const box={module:{exports:{}}};vm.createContext(box);vm.runInContext(await readFile('public/results-report.js','utf8'),box);const {nextStepRecommendation:select}=box.module.exports;
const cases=[[45,'Never','Never','progress'],[90,'Often','Never','shield'],[120,'Never','Sometimes','progress'],[121,'Never','Often','reduction'],[180,'Never','Never','progress'],[300,'Often','Often','shield'],[0,'Never','Never','progress']];
for(const [daily,bedtime,tasks,expected] of cases){const a={daily,prebed:'Often',behaviors:{bedtime,tasks,movement:'Never',people:'Never',longer:'Never'}},original=JSON.stringify(a);const r=select(a);assert.equal(r.view,expected);assert.equal(JSON.stringify(a),original);if(tasks!=='Never'&&bedtime==='Never')assert.match(r.message,/responsibilities/);}
for(const key of ['tasks','movement','people','longer']){const a={daily:121,behaviors:{bedtime:'Never',tasks:'Never',movement:'Never',people:'Never',longer:'Never',[key]:'Sometimes'}};assert.equal(select(a).view,'reduction');a.daily=120;assert.equal(select(a).view,'progress');}
assert(!select({daily:300,behaviors:{}}).message.includes('did not report'));
console.log('PASS seven next-step cases, exact 120/121 threshold, all five answers, pre-bed independence, immutable input and missing-answer safety');
