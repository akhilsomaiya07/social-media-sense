import assert from 'node:assert/strict';
import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const sandbox={module:{exports:{}}};vm.createContext(sandbox);vm.runInContext(await readFile('public/goals.js','utf8'),sandbox);const api=sandbox.module.exports;
const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
const store=api.createCheckinStore(()=>storage),goals=api.createGoalStore(()=>storage);
const record={id:'legacy',date:'2026-01-01T00:00:00.000Z',daily:300,platforms:[{name:'Facebook',minutes:300}],sleepMinutes:420,activityMinutes:60,behaviors:{bedtime:'Never',tasks:'Never',movement:'Never',longer:'Never'},opportunity:{area:'Maintain your balance',explanation:'Legacy record'},reductionGoal:60};
assert(api.validSavedCheckin(record));store.save(record);const original=storage.getItem(api.checkinStorageKey);store.save({...record,reductionGoal:120});assert.equal(storage.getItem(api.checkinStorageKey),original,'saving cannot overwrite a historical snapshot');
goals.save({checkinId:'legacy',reduction:90,updatedAt:'2026-01-02T00:00:00.000Z'},store.read());assert.equal(storage.getItem(api.checkinStorageKey),original);assert.equal(goals.read()[0].reduction,90);
assert.throws(()=>goals.save({checkinId:'unknown',reduction:10,updatedAt:'2026-01-02'},store.read()));assert.throws(()=>goals.save({checkinId:'legacy',reduction:301,updatedAt:'2026-01-02'},store.read()));
const frozen=api.freezeCheckin(JSON.parse(JSON.stringify(record)));assert(Object.isFrozen(frozen.platforms[0]));assert.throws(()=>frozen.platforms[0].minutes=0);
const shield='social-media-sense.sleep-shield.v1';storage.setItem(shield,'retain exactly');api.clearCheckinsAndGoals(()=>storage);assert.equal(storage.getItem(api.checkinStorageKey),null);assert.equal(storage.getItem(api.reductionStorageKey),null);assert.equal(storage.getItem(shield),'retain exactly');
store.save(record);storage.setItem(api.reductionStorageKey,'malformed');assert.throws(()=>goals.read());assert.equal(storage.getItem(api.reductionStorageKey),'malformed');
// A failure removing goals must leave history intact.
assert.throws(()=>api.clearCheckinsAndGoals(()=>({...storage,removeItem:k=>{if(k===api.reductionStorageKey)throw Error('blocked');storage.removeItem(k);}})));assert.equal(storage.getItem(api.checkinStorageKey),original);
// If history removal fails after goal removal, do not leave orphaned goals.
assert.throws(()=>api.clearCheckinsAndGoals(()=>({...storage,removeItem:k=>{if(k===api.checkinStorageKey)throw Error('blocked');storage.removeItem(k);}})));assert.equal(storage.getItem(api.reductionStorageKey),null);assert.equal(storage.getItem(api.checkinStorageKey),original);
console.log('PASS legacy schema, immutable saved records, separate validated goal storage, explicit joint deletion, failure ordering and Sleep Shield isolation');
