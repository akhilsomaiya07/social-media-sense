import assert from 'node:assert/strict';
import {health} from '../lib/health.mjs';
import worker from '../cloudflare/worker.mjs';
const origin='https://test.invalid', request=()=>new Request(origin+'/api/health-information',{method:'POST',headers:{Origin:origin},body:JSON.stringify({ageGroup:'Adults',topics:['screen use and sleep','social media risks and digital well-being'],dailyMinutes:30,disruption:Object.fromEntries(['bedtime','movement','people','longer','tasks'].map(k=>[k,'Never']))})});
const logs=[],warn=console.warn,fetchOriginal=globalThis.fetch;
console.warn=x=>logs.push(JSON.parse(x));
const key=process.env.OPENAI_API_KEY,base=process.env.OPENAI_BASE_URL;
const marker='PRIVATE-DO-NOT-LOG';
async function check(response,code,validation){const data=await response.json(),log=logs.at(-1);assert.equal(data.code,code);assert.equal(log.category,code);assert.equal(log.status,response.status);assert.equal(log.requestId,data.requestId);assert.equal(response.headers.get('X-Request-ID'),data.requestId);assert.match(data.requestId,/^[0-9a-f-]{36}$/);if(validation)assert.equal(log.validationCategory,validation);assert.deepEqual(Object.keys(log).sort(),(validation?['category','status','requestId','validationCategory']:['category','status','requestId']).sort());assert(!JSON.stringify(logs).includes(marker));return data.requestId;}
try{
 delete process.env.OPENAI_BASE_URL;delete process.env.OPENAI_API_KEY;
 const a=await check(await health(request()),'gateway_not_active');
 await check(await worker.fetch(request(),{}),'cloudflare_research_not_configured');
 process.env.OPENAI_BASE_URL='https://provider.invalid/v1';
 const b=await check(await health(request()),'gateway_credential_missing');assert.notEqual(a,b);
 process.env.OPENAI_API_KEY=marker;
 for(const [status,code] of [[401,'provider_auth_failed'],[403,'provider_auth_failed'],[429,'provider_rate_limited'],[500,'provider_unavailable']]){
 globalThis.fetch=async()=>new Response(JSON.stringify({error:{message:marker}}),{status,headers:{'Content-Type':'application/json'}});
 await check(await health(request()),code);}
 const url='https://www.cdc.gov/test';
 const item={statement:'Fixture',population:'Adults',applicability:'Fixture',whyRelevant:'Fixture',sources:[{organization:'Fixture',title:'Fixture',url,date:null}]};
 const good={status:'completed',output:[{type:'web_search_call',status:'completed',action:{sources:[{url}]}},{type:'message',content:[{type:'output_text',text:JSON.stringify({benefits:[item],risks:[item]})}]}]};
 async function result(body){globalThis.fetch=async()=>new Response(JSON.stringify(body),{headers:{'Content-Type':'application/json'}});return health(request());}
 const before=logs.length;const ok=await result(good);assert.equal(ok.status,200);const success=await ok.json();assert(!('requestId' in success));assert.equal(logs.length,before);assert.equal(success.benefits[0].statement,'Fixture');
 const malformed=structuredClone(good);malformed.output[1].content[0].text=marker;
 await check(await result(malformed),'invalid_source_response','invalid_json');
 const incomplete={status:'incomplete',output:[]};await check(await result(incomplete),'invalid_source_response','search_incomplete');
 const badCitation=structuredClone(good);badCitation.output[0].action.sources=[];await check(await result(badCitation),'invalid_source_response','unverified_citation');
 const broken=structuredClone(good);broken.output[1].content[0].text='null';await check(await result(broken),'invalid_source_response','invalid_structure');
 globalThis.fetch=async()=>{throw new Error(marker)};await check(await health(request()),'provider_unavailable');
 assert(!JSON.stringify(logs).includes(url));assert(!JSON.stringify(logs).includes('Never'));
}finally{console.warn=warn;globalThis.fetch=fetchOriginal;for(const [k,v] of [['OPENAI_API_KEY',key],['OPENAI_BASE_URL',base]]){if(v===undefined)delete process.env[k];else process.env[k]=v}}
console.log('PASS safe diagnostics, categories, IDs, unchanged successful response, privacy and unexpected exceptions');
