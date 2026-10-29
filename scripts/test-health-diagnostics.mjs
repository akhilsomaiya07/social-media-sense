import assert from 'node:assert/strict';
import {createHealthService,freeModel,validateSelection,contextOf} from '../lib/health.mjs';
const {selectHealthResources}=globalThis.socialMediaSenseEducation;
const ctx={age:30,daily:180,sleepMinutes:420,activity:30,behaviors:{bedtime:'Often',tasks:'Never',movement:'Never',people:'Never',longer:'Sometimes'}};
const env={OPENROUTER_API_KEY:'fixture-credential',OPENROUTER_MODEL:'fixture/model:free'};
const req=(extra={})=>new Request('https://test.invalid/api/health-information',{method:'POST',headers:{Origin:'https://test.invalid','Content-Type':'application/json'},body:JSON.stringify({...ctx,...extra})});
const data=selectHealthResources({age:30,sleep:7,activity:30,reasons:[]});
const selected={benefits:data.benefits.slice(0,2).map(({id,statement,sourceIds})=>({id,statement,sourceIds})),risks:data.risks.slice(0,2).map(({id,statement,sourceIds})=>({id,statement,sourceIds}))};
const reply=(content=selected,model=env.OPENROUTER_MODEL)=>new Response(JSON.stringify({model,choices:[{finish_reason:'stop',message:{content:JSON.stringify(content)}}]}));
let calls=0,clock=100000;let last;
const transport=async(url,options)=>{calls++;assert.equal(url,'https://openrouter.ai/api/v1/chat/completions');last=JSON.parse(options.body);assert.equal(last.model,env.OPENROUTER_MODEL);assert(!last.models&&!last.tools&&!last.plugins);assert.equal(last.provider.allow_fallbacks,false);assert.equal(last.provider.zdr,true);assert.deepEqual(last.provider.max_price,{prompt:0,completion:0,request:0});assert(!options.body.includes('PRIVATE-NAME'));return reply();};
const make=options=>createHealthService({transport,now:()=>clock,ttlMs:2000,...options});
assert(freeModel('fixture/model:free'));for(const m of ['',undefined,'openrouter/free','fixture/model','fixture/model:free:online'])assert(!freeModel(m));
const handler=make();for(const bad of [{},{OPENROUTER_MODEL:'fixture/model:free'},{...env,OPENROUTER_MODEL:'fixture/paid'}])assert.equal((await (await handler(req(),bad)).json()).mode,'local');assert.equal(calls,0);
assert.equal((await (await handler(req({name:'PRIVATE-NAME'}),env)).json()).mode,'ai');assert.equal(calls,1);
assert.equal((await (await handler(req(),env)).json()).mode,'ai');assert.equal(calls,1,'cache hit');clock+=2001;await handler(req(),env);assert.equal(calls,2,'cache expiration');
assert.equal(last.messages[1].content.includes('PRIVATE-NAME'),false);const sent=JSON.parse(last.messages[1].content);assert(!('age' in sent.context));assert.equal(sent.context.ageGroup,'30–64');assert(!('name' in contextOf({...ctx,name:'PRIVATE-NAME'})));
for(const status of [401,404,429,500]){let n=0;const h=make({transport:async()=>{n++;return new Response('{}',{status})}});assert.equal((await (await h(req(),env)).json()).mode,'local');await h(req(),env);assert.equal(n,1,'no retry; negative cache');}
const timeout=make({transport:()=>new Promise(()=>{}),timeoutMs:5});assert.equal((await (await timeout(req(),env)).json()).mode,'local');
const hungBody=make({transport:async()=>({ok:true,text:()=>new Promise(()=>{})}),timeoutMs:5});assert.equal((await (await hungBody(req(),env)).json()).mode,'local');
for(const value of [{benefits:[{id:'invented',statement:'invented',sourceIds:['new']}],risks:selected.risks},{...selected,benefits:[{...selected.benefits[0],statement:'A medical claim'}]},{...selected,risks:[{...selected.risks[0],sourceIds:['invented-url']}]}])assert.throws(()=>validateSelection(value,data));
for(const result of [()=>reply(selected,'fixture/paid'),()=>reply({invented:true}),()=>new Response('broken')]){const h=make({transport:async()=>result()});assert.equal((await (await h(req(),env)).json()).mode,'local');}
let count=0;const limited=make({minuteLimit:1,transport:async()=>{count++;return reply()}});await limited(req(),env);assert.equal((await (await limited(req({daily:300}),env)).json()).mode,'local');assert.equal(count,1);clock+=60001;await limited(req({daily:300}),env);assert.equal(count,2);
const daily=make({minuteLimit:10,dayLimit:1});await daily(req(),env);clock+=60001;assert.equal((await (await daily(req({daily:300}),env)).json()).mode,'local');
let release,n=0;const dedupe=make({transport:()=>{n++;return new Promise(r=>release=r)}});const a=dedupe(req(),env);await new Promise(r=>setTimeout(r,0));const b=dedupe(req(),env);await new Promise(r=>setTimeout(r,0));release(reply());await Promise.all([a,b]);assert.equal(n,1,'coalesce duplicate requests');
const bounded=make({maxCache:1,minuteLimit:20,dayLimit:20});const before=calls;await bounded(req(),env);await bounded(req({daily:300}),env);await bounded(req(),env);assert.equal(calls,before+3,'bounded cache evicts');
assert.equal((await handler(req({age:14}),env)).status,400);
console.log('PASS free-only configuration, zero-price routing, missing/unavailable models, 429/timeout/body timeout, strict reviewed text/citations, bounded cache/expiry, request dedupe, per-isolate minute/day limits and privacy');
