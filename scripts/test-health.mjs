import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
class Node{constructor(tag=''){this.tag=tag;this.children=[];this.hidden=false;this.attributes={}}append(...nodes){this.children.push(...nodes)}replaceChildren(...nodes){this.children=[...nodes]}setAttribute(k,v){this.attributes[k]=v}}
const ids=Object.fromEntries(['education-live-status','education-benefits','education-risks','education-checked','education-age','education-fallback-note','health-resources','health-resource-list','education-benefits-more','education-risks-more','education-benefits-title','education-balance-tips','education-risks-section','health-resources-title','health-resources-intro'].map(id=>[id,new Node()]));
let requests=0;const sandbox={module:{exports:{}},fetch(){requests++;throw Error('Network forbidden')},document:{getElementById:id=>ids[id],createElement:t=>new Node(t),createTextNode:t=>({textContent:t})}};
vm.createContext(sandbox);
for(const file of ['health-fallback','education'])vm.runInContext(await readFile(`public/${file}.js`,'utf8'),sandbox);
const library=vm.runInContext('curatedHealthSources',sandbox),select=vm.runInContext('selectHealthResources',sandbox),render=vm.runInContext('renderHealthEducation',sandbox);
const base={age:30,daily:180,sleep:7,activity:30,prebed:'Never',worthReviewing:false,reasons:[]};
const original=JSON.stringify(base);
for(const s of library){assert(s.id&&s.organization&&s.title&&s.summary&&s.population);assert.equal(new URL(s.url).protocol,'https:');assert(s.topics.length);assert.equal(s.applicableAges.length,2);assert(s.date===null||/^\d{4}(-\d{2}(-\d{2})?)?$/.test(s.date));}
assert.equal(new Set(library.map(s=>s.id)).size,library.length);
for(const age of [15,17,18,19,29,30,32,33,64,65,100]){
 const result=select({...base,age});assert(result.benefits.length>=3);assert(result.risks.length>=3);
 for(const s of result.resources)assert(age>=s.applicableAges[0]&&age<=s.applicableAges[1]);
 assert.equal(result.resources.some(s=>s.id==='hhs-youth'),age<18);assert.equal(result.resources.some(s=>s.id==='aap-media'),age<18);assert.equal(result.resources.some(s=>s.id==='sleep-study'),age>=19&&age<=32);
 for(const c of [...result.benefits,...result.risks])for(const s of c.sources)assert(age>=s.applicableAges[0]&&age<=s.applicableAges[1]);
 render({...base,age});assert.equal(ids['education-live-status'].textContent,'Evidence-based educational resources');assert(!ids['education-risks-section'].hidden);assert(ids['education-checked'].hidden);
}
const reasons={bedtime:'You said social media kept you up later than intended.',tasks:'You said social media interrupted your everyday responsibilities.',movement:'You said social media took time away from physical activity.',people:'You said social media took time away from people you wanted to spend time with.',longer:'You said you spent longer scrolling than you planned.'};
for(const [topic,text] of Object.entries(reasons)){
 const result=select({...base,worthReviewing:true,reasons:[{text,frequency:'Often'}]});assert(result.risks[0].topics.includes(topic));assert(result.risks.some(c=>c.personal.includes(text)));
}
assert(select(base).resources.find(s=>s.id==='cdc-sleep').whyRelevant.includes('Sleep duration'));
assert(select(base).resources.find(s=>s.id==='cdc-activity').whyRelevant.includes('Physical activity'));
assert(select(base).risks.every(c=>!c.personal));assert(select({...base,prebed:'Often'}).risks.every(c=>!c.personal),'Pre-bed frequency does not establish disruption');
assert.deepEqual(select({...base,daily:0}),select({...base,daily:1440}),'Daily hours alone do not change educational concerns');
render({...base,reasons:[{text:reasons.bedtime,frequency:'Sometimes'}],worthReviewing:true});assert(ids['education-balance-tips'].hidden);assert(ids['education-risks'].children.some(c=>c.children.some(n=>n.className==='education-personal')));
assert.equal(JSON.stringify(base),original);assert.equal(requests,0);
// Existing Sleep Tracker uses the same local library and does not start a request.
const shieldSandbox={module:{exports:{}},fetch(){requests++;throw Error('Network forbidden')}};vm.createContext(shieldSandbox);
for(const file of ['health-fallback','sleep-shield'])vm.runInContext(await readFile(`public/${file}.js`,'utf8'),shieldSandbox);
const load=vm.runInContext('loadShieldResearch',shieldSandbox);const root=new Node();const el=(tag,text,cls)=>Object.assign(new Node(tag),{textContent:text,className:cls});
for(const context of [undefined,base,{...base,age:16},{...base,age:65}]){load(context,root,el);assert(root.children.length>=3);assert.equal(root.children[0].textContent,'Evidence-based educational resources');}
assert.equal(requests,0);
for(const file of ['education','sleep-shield']){const code=await readFile(`public/${file}.js`,'utf8');assert(!/\bfetch\s*\(/.test(code));assert(!/new OpenAI/.test(code));}
console.log('PASS local education: citation metadata, exact age boundaries, all disruption topics, sleep/activity relevance, no time-only health cutoff, immutable inputs, offline rendering and Sleep Tracker');
await import('./test-health-diagnostics.mjs');
