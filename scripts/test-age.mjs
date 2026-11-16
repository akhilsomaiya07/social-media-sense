import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const s={module:{exports:{}}};vm.createContext(s);
for(const file of ['platforms','app','sleep-context','health-fallback','education','flow'])vm.runInContext(await readFile(`public/${file}.js`,'utf8'),s);
const base={name:'Test User',age:30,platforms:[{name:'Facebook',hours:3,minutes:30}],'sleep-hours':7,'sleep-minutes':30,'activity-hours':1,'activity-minutes':30,prebed:'Never',bedtime:'Never',tasks:'Never',movement:'Never',people:'Never',longer:'Never'};
const under='Social Media Sense is designed for people ages 15–100. Please enter an eligible age to continue.',over='Social Media Sense currently supports ages 15–100. Please check the age you entered.';
for(const [age,message,title] of [[0,under,'Age requirement not met'],[13,under,'Age requirement not met'],[14,under,'Age requirement not met'],[101,over,'Age outside supported range'],[120,over,'Age outside supported range'],['','Please enter your age to continue.'],[15.5,'Please enter your age in whole years.'],['text','Please enter a valid whole-number age between 15 and 100.'],[NaN,'Please enter a valid whole-number age between 15 and 100.']]){
 const error=s.ageValidation(age);assert.equal(error.message,message);if(title)assert.equal(error.title,title);
 assert.throws(()=>s.calculateWithRoutine({...base,age}),e=>e.fields.age===message);assert.equal(s.sleepReference(age),null);
 assert.equal(s.assessmentErrorsForStep(s.calculateWithRoutine,{...base,age},1).age,message);
}
for(const age of [15,16,17,18,29,30,64,65,99,100]){
 assert.equal(s.ageValidation(age),null);const result=s.calculateWithRoutine({...base,age});assert.equal(result.daily,210);assert.equal(result.weekly,1470);assert.equal(result.yearly,76650);assert.equal(result.sleep,7.5);assert.equal(result.activity,90);assert.equal(result.worthReviewing,false);assert(s.sleepReference(age));
 const selected=s.selectHealthResources(result);assert(selected.resources.every(source=>age>=source.applicableAges[0]&&age<=source.applicableAges[1]));
 const group=age<18?'Adolescents':age<30?'Young adults':age<65?'Adults':'Older adults',context=s.healthSearchContext(result);assert.equal(context.ageGroup,group);assert.deepEqual(Object.keys(context).sort(),['ageGroup','dailyMinutes','disruption','topics']);
}
assert.match(s.sleepReference(15).population,/13–17/);assert.equal(s.sleepContext(15,450).status,'not-comparable');
console.log('PASS age boundaries, exact messages, unchanged totals, sleep source bands, age groups and research privacy contract');


for(const name of ['Akhil','Mary Jane','Anne-Marie',"O'Connor",'O’Connor','José','Nguyễn','A','李','محمد','अनिता','Jose\u0301','A'.repeat(200)]){
 assert.equal(s.nameValidation(name),null,name);assert.equal(s.calculateWithRoutine({...base,name}).name,s.normalizeName(name));
}
for(const name of ['', '   ', '12345','1@#$%','Akhil123','John@','!!!','😀','<script>','---','-Anne','Anne-','Anne--Marie',"O''Connor",'Anne - Marie','\u0301']){
 assert(s.nameValidation(name),name);assert.throws(()=>s.calculateWithRoutine({...base,name}),e=>Boolean(e.fields.name));assert(s.assessmentErrorsForStep(s.calculateWithRoutine,{...base,name},1).name);
}
assert.equal(s.normalizeName('  Mary   Jane  '),'Mary Jane');
assert.equal(s.calculateWithRoutine({...base,name:'  Mary   Jane  '}).name,'Mary Jane');
assert(s.nameValidation('A'.repeat(201)));assert(s.nameValidation(null));
assert.deepEqual(Object.keys(s.assessmentErrorsForStep(s.calculateWithRoutine,{...base,name:'',age:''},1)),['name','age']);
assert.equal(s.nameValidation('').message,'Enter your name or nickname to continue.');
assert.equal(s.nameValidation('1@#$%').message,'Use letters only. Spaces, hyphens, and apostrophes are allowed.');
console.log('PASS required Unicode names, separators, normalization, length and Step 1 validation');

for(const age of [-1,'2e1','0x17','23.0'])assert(s.ageValidation(age));
