import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
class Node{constructor(tag=''){this.tag=tag;this.children=[];this.hidden=false;this.attributes={}}append(...nodes){this.children.push(...nodes)}replaceChildren(...nodes){this.children=[...nodes]}setAttribute(k,v){this.attributes[k]=v}}
const ids=Object.fromEntries(['education-guidance','education-risks-title','education-risks-toggle','education-risks-context','education-live-status','education-benefits','education-risks','education-checked','education-age','education-fallback-note','health-resources','health-resource-list','education-benefits-more','education-risks-more','education-benefits-title','education-balance-tips','education-risks-section','health-resources-title','health-resources-intro'].map(id=>[id,new Node()]));
let requests=0;const sandbox={module:{exports:{}},fetch(){requests++;throw Error('Network forbidden')},document:{getElementById:id=>ids[id],createElement:t=>new Node(t),createTextNode:t=>({textContent:t})}};
vm.createContext(sandbox);
for(const file of ['health-fallback','education'])vm.runInContext(await readFile(`public/${file}.js`,'utf8'),sandbox);
const library=vm.runInContext('curatedHealthSources',sandbox),select=vm.runInContext('selectHealthResources',sandbox),render=vm.runInContext('renderLocalEducation',sandbox);
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
assert.equal(requests,0);
assert(!(await readFile('public/education.js','utf8')).includes('openrouter.ai'));
console.log('PASS local education: citation metadata, exact age boundaries, all disruption topics, sleep/activity relevance, no time-only health cutoff, immutable inputs, offline rendering');
await import('./test-health-diagnostics.mjs');

// Exercise the optional frontend request with controlled responses, never a provider.
sandbox.AbortController=AbortController;sandbox.setTimeout=setTimeout;sandbox.clearTimeout=clearTimeout;
const asyncRender=vm.runInContext('renderHealthEducation',sandbox);
let sent; sandbox.fetch=async(url,options)=>{requests++;assert.equal(url,'/api/health-information');sent=JSON.parse(options.body);const data=select(base);return {ok:true,json:async()=>({mode:'ai',benefits:data.benefits.slice(0,2).map(c=>c.id),risks:data.risks.slice(0,2).map(c=>c.id)})}};
await asyncRender({...base,name:'Must not transmit'});
assert(!JSON.stringify(sent).includes('Must not transmit'));assert.equal(sent.age,30);
assert.equal(ids['education-benefits'].children.length,2);assert.equal(ids['education-risks'].children.length,2);
assert.match(ids['education-fallback-note'].textContent,/AI helped/);
await asyncRender(base);assert.equal(requests,1,'Repeated context uses frontend cache');
sandbox.fetch=async()=>{requests++;throw Error('offline')};
await asyncRender({...base,age:40});assert(ids['education-benefits'].children.length>=3);assert(ids['education-risks'].children.length>=3);
assert(!ids['education-risks-section'].hidden);
sandbox.fetch=async()=>({ok:true,json:async()=>({mode:'ai',benefits:['invented'],risks:['invented']})});
await asyncRender({...base,age:41});assert(ids['education-benefits'].children.length>=3,'Invalid server IDs cannot replace local cards');
let release;sandbox.fetch=()=>new Promise(resolve=>{release=resolve});const earlier=asyncRender({...base,age:42});
sandbox.fetch=async()=>({ok:true,json:async()=>({mode:'local'})});await asyncRender({...base,age:43});
const before=ids['education-fallback-note'].textContent;release({ok:true,json:async()=>({mode:'ai',benefits:select(base).benefits.slice(0,2).map(c=>c.id),risks:select(base).risks.slice(0,2).map(c=>c.id)})});await earlier;
assert.equal(ids['education-fallback-note'].textContent,before,'Stale response cannot overwrite a newer report');
console.log('PASS frontend local-first rendering, optional success, duplicate suppression, offline/malformed fallback, no name transmission and stale-response protection');


// Display boundaries apply equally to the local library and validated AI selections.
for(const [daily,topic,frequency,showRisks] of [
 [0,null,null,false],[20,null,null,false],[29,null,null,false],[30,null,null,false],
 [60,null,null,false],[119,null,null,false],[120,null,null,true],[121,null,null,true],
 [180,null,null,true],[20,'bedtime','Often',true],[90,'tasks','Sometimes',true],
 [5,'movement','Sometimes',true],[5,'people','Often',true],[5,'longer','Sometimes',true]
])for(const ai of [false,true]){
 const result={...base,daily,reasons:topic?[{text:reasons[topic],frequency}]:[]};
 const saved=JSON.stringify(result),data=select(result);
 const selection=ai?{benefits:data.benefits.slice(0,2).map(c=>c.id),risks:data.risks.slice(0,2).map(c=>c.id)}:undefined;
 render(result,selection);
 assert.equal(ids['education-benefits'].hidden,false);
 assert.equal(ids['education-risks-section'].hidden,!showRisks,`${daily}m ${topic} AI=${ai}`);
 assert.equal(ids['education-risks-toggle'].hidden,showRisks);
 assert.equal(ids['education-risks-title'].textContent,'Potential Risks of Social Media');
 if(!showRisks){
  assert.equal(ids['education-risks-toggle'].attributes['aria-expanded'],'false');
  ids['education-risks-toggle'].onclick();assert(!ids['education-risks-section'].hidden);
  render(result,selection);assert(!ids['education-risks-section'].hidden,'AI refresh preserves optional expansion');
  ids['education-risks-toggle'].onclick();assert(ids['education-risks-section'].hidden);
 }else if(!topic)assert.match(ids['education-risks-context'].textContent,/not evidence that you have a problem/);
 assert.equal(JSON.stringify(result),saved);
}
render({...base,daily:20,prebed:'Often',reasons:[]});
assert(ids['education-risks-section'].hidden,'Pre-bed usage alone is not a reported interruption');
console.log('PASS education display boundaries, local/AI parity, optional risk access, choice preservation and immutable reports');


// Compact citations must never discard evidence, metadata or population limits.
const textOf=node=>[node.textContent||'',...(node.children||[]).map(textOf)].join(' ');
for(const age of [15,17,18,25,40,70])for(const ai of [false,true]){
 const result={...base,age,daily:20,reasons:[]},data=select(result);
 const selection=ai?{benefits:data.benefits.slice(0,2).map(c=>c.id),risks:data.risks.slice(0,2).map(c=>c.id)}:undefined;
 render(result,selection);
 assert.equal(ids['health-resources-title'].textContent,'Sources and Further Reading');
 assert.equal(ids['health-resource-list'].children.length,data.resources.length,'All eligible source details remain available');
 for(const [i,source] of data.resources.entries()){
  const node=ids['health-resource-list'].children[i],text=textOf(node);
  for(const value of [source.organization,source.title,source.summary,source.whyRelevant,source.population,source.date||'Publication/update date not available'])assert(text.includes(value),value);
  assert(node.children.some(p=>p.children.some(a=>a.href===source.url)));
 }
 for(const kind of ['benefits','risks']){
  const expected=selection?selection[kind].map(id=>data[kind].find(c=>c.id===id)):data[kind];
  assert.equal(ids['education-'+kind].children.length,expected.length);
  for(const [i,card] of expected.entries()){
   const node=ids['education-'+kind].children[i],text=textOf(node);
   assert(text.includes(card.heading));assert(text.includes(card.statement));if(card.personal)assert(text.includes(card.personal));
   for(const source of card.sources){assert(text.includes(source.organization));assert(text.includes(source.population));assert(node.children.some(p=>p.children.some(a=>a.href===source.url)));}
  }
  const before=ids['education-'+kind].children.length,button=ids['education-'+kind+'-more'];
  button.onclick();assert(ids['education-'+kind].children.every(c=>!c.hidden));assert.equal(button.attributes['aria-expanded'],'true');
  button.onclick();assert.equal(ids['education-'+kind].children.filter(c=>!c.hidden).length,Math.min(4,before));assert.equal(ids['education-'+kind].children.length,before);
 }
 assert.equal(ids['education-guidance'].hidden,ids['education-balance-tips'].hidden);
 render(result,selection);assert.equal(ids['health-resource-list'].children.length,data.resources.length,'No duplicate sources on refresh');
}
render({...base,reasons:[{text:reasons.bedtime,frequency:'Often'}]});assert(ids['education-guidance'].hidden);
console.log('PASS organized education: intact claims, full citation metadata, direct links, age scopes, guidance and show-more/local/AI parity');
