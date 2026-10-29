import '../public/health-fallback.js';
const {selectHealthResources}=globalThis.socialMediaSenseEducation;
const VERSION='curated-2026-10-29-v1';
const freeModel=value=>typeof value==='string'&&/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+:free$/.test(value);
function contextOf(raw){
 if(!raw||!Number.isInteger(raw.age)||raw.age<15||raw.age>100)throw Error('context');
 if(!Number.isInteger(raw.daily)||raw.daily<0||raw.daily>1440||!Number.isInteger(raw.sleepMinutes)||raw.sleepMinutes<0||raw.sleepMinutes>1440||!Number.isInteger(raw.activity)||raw.activity<0||raw.activity>1440)throw Error('context');
 const behaviors={};for(const key of ['bedtime','tasks','movement','people','longer']){if(!['Never','Sometimes','Often'].includes(raw.behaviors?.[key]))throw Error('context');behaviors[key]=raw.behaviors[key];}
 return {age:raw.age,daily:raw.daily,sleepMinutes:raw.sleepMinutes,activity:raw.activity,behaviors};
}
const texts={bedtime:'You said social media kept you up later than intended.',tasks:'You said social media interrupted your everyday responsibilities.',movement:'You said social media took time away from physical activity.',people:'You said social media took time away from people you wanted to spend time with.',longer:'You said you spent longer scrolling than you planned.'};
function prepared(ctx){return {age:ctx.age,daily:ctx.daily,sleep:ctx.sleepMinutes/60,activity:ctx.activity,reasons:Object.entries(ctx.behaviors).filter(([,v])=>v!=='Never').map(([k,frequency])=>({text:texts[k],frequency}))};}
function pattern(ctx,data){return {ageGroup:ctx.age<18?'15–17':ctx.age<30?'18–29':ctx.age<65?'30–64':'65–100',dailyHalfHours:Math.round(ctx.daily/30),sleepHalfHours:Math.round(ctx.sleepMinutes/30),activityHalfHours:Math.round(ctx.activity/30),behaviors:ctx.behaviors,eligibleCards:data.benefits.concat(data.risks).map(c=>c.id)};}
function validateSelection(output,data){
 if(!output||typeof output!=='object'||Array.isArray(output)||Object.keys(output).some(k=>!['benefits','risks'].includes(k)))throw Error('invalid');
 const selected={};for(const kind of ['benefits','risks']){const input=output[kind];if(!Array.isArray(input)||input.length<1||input.length>4)throw Error('invalid');const seen=new Set();selected[kind]=input.map(item=>{const card=data[kind].find(c=>c.id===item?.id);if(!card||seen.has(card.id)||item.statement!==card.statement||!Array.isArray(item.sourceIds)||JSON.stringify(item.sourceIds)!==JSON.stringify(card.sourceIds)||Object.keys(item).some(k=>!['id','statement','sourceIds'].includes(k)))throw Error('invalid');seen.add(card.id);return card.id;});}return selected;
}
function response(body,status=200){return Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
// Bounded, ephemeral per-isolate protection. No paid storage and no user identifiers.
export function createHealthService({transport=fetch,now=Date.now,timeoutMs=12000,ttlMs=21600000,maxCache=128,minuteLimit=2,dayLimit=20}={}){
 const cache=new Map(),pending=new Map();let minute=0,minuteCount=0,day=0,dayCount=0;
 function put(key,value,ttl){if(cache.size>=maxCache)cache.delete(cache.keys().next().value);cache.set(key,{value,expires:now()+ttl});}
 return async function health(request,env={}){
  if(request.method!=='POST')return response({error:'Method not allowed'},405);
  if(request.headers.get('Origin')!==new URL(request.url).origin)return response({error:'Forbidden'},403);
  if(Number(request.headers.get('Content-Length'))>2500)return response({error:'Invalid context'},413);
  let ctx;try{const body=await request.text();if(body.length>2500)return response({error:'Invalid context'},413);ctx=contextOf(JSON.parse(body));}catch{return response({error:'Invalid context'},400);}
  // Only runtime bindings supplied by the Worker are used, never process.env or build secrets.
  const model=env.OPENROUTER_MODEL,key=env.OPENROUTER_API_KEY;
  if(!freeModel(model)||typeof key!=='string'||!key.trim())return response({mode:'local'});
  const data=selectHealthResources(prepared(ctx)),patternData=pattern(ctx,data),cacheKey=JSON.stringify([VERSION,model,patternData]);
  for(const [k,v]of cache)if(v.expires<=now())cache.delete(k);
  const hit=cache.get(cacheKey);if(hit)return response(hit.value);
  if(pending.has(cacheKey))return response(await pending.get(cacheKey));
  const m=Math.floor(now()/60000),d=Math.floor(now()/86400000);if(m!==minute){minute=m;minuteCount=0}if(d!==day){day=d;dayCount=0}
  if(minuteCount>=minuteLimit||dayCount>=dayLimit||pending.size>=2)return response({mode:'local'});
  minuteCount++;dayCount++;
  const work=(async()=>{
   const controller=new AbortController();let timer;
   try{
    const candidates={benefits:data.benefits.map(({id,statement,sourceIds})=>({id,statement,sourceIds})),risks:data.risks.map(({id,statement,sourceIds})=>({id,statement,sourceIds}))};
    const body={model,stream:false,max_tokens:1600,temperature:0,response_format:{type:'json_object'},provider:{allow_fallbacks:false,require_parameters:true,data_collection:'deny',zdr:true,max_price:{prompt:0,completion:0,request:0}},messages:[{role:'system',content:'Assemble brief balanced educational explanations from reviewed candidates. Choose 2–3 benefits and 2–4 risks relevant to the supplied routine frequencies and age scope, prioritizing Often over Sometimes. Use daily time, sleep and activity as context only, never diagnostic or medical cutoffs. Return ONLY a JSON object with benefits and risks arrays. Each item must contain id, statement and sourceIds copied EXACTLY from that category’s candidates. Never create text, IDs, citations or medical claims. No tools, search, or outside knowledge. There is no live research.'},{role:'user',content:JSON.stringify({context:patternData,candidates,sources:data.resources.map(({id,organization,title,population,summary})=>({id,organization,title,population,summary}))})}]};
    const upstream=await Promise.race([transport('https://openrouter.ai/api/v1/chat/completions',{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},signal:controller.signal,body:JSON.stringify(body)}).then(async r=>({ok:r.ok,raw:await r.text()})),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('timeout'))},timeoutMs)})]);
    if(!upstream.ok)throw Error('unavailable');
    const raw=upstream.raw;if(raw.length>30000)throw Error('size');const result=JSON.parse(raw);
    if(result.error||result.model!==model||result.choices?.[0]?.finish_reason!=='stop')throw Error('model');
    const value={mode:'ai',...validateSelection(JSON.parse(result.choices[0].message.content),data)};put(cacheKey,value,ttlMs);return value;
   }catch{const value={mode:'local'};put(cacheKey,value,60000);return value;}finally{clearTimeout(timer);}
  })();pending.set(cacheKey,work);try{return response(await work)}finally{pending.delete(cacheKey)}
 };
}
export const health=createHealthService();
export {freeModel,contextOf,validateSelection};
