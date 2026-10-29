import assert from 'node:assert/strict';
import {health} from '../lib/health.mjs';
import worker from '../cloudflare/worker.mjs';
const prior=globalThis.fetch,key=process.env.OPENAI_API_KEY,base=process.env.OPENAI_BASE_URL;
let calls=0;globalThis.fetch=()=>{calls++;throw Error('Network forbidden')};
const request=()=>new Request('https://test.invalid/api/health-information',{method:'POST',headers:{Origin:'https://test.invalid'},body:'{}'});
try{
 for(const configured of [false,true]){if(configured){process.env.OPENAI_API_KEY='fixture-not-a-key';process.env.OPENAI_BASE_URL='https://fixture.invalid'}else{delete process.env.OPENAI_API_KEY;delete process.env.OPENAI_BASE_URL;}
 for(const response of [await health(request()),await worker.fetch(request(),{})]){assert.equal(response.status,410);assert.equal((await response.json()).code,'research_retired');}}
 assert.equal(calls,0);assert.equal((await health(new Request('https://test.invalid/api/health-information'))).status,405);
 assert.equal((await health(new Request('https://test.invalid/api/health-information',{method:'POST'}))).status,403);
}finally{globalThis.fetch=prior;for(const [name,value]of [['OPENAI_API_KEY',key],['OPENAI_BASE_URL',base]])if(value===undefined)delete process.env[name];else process.env[name]=value;}
console.log('PASS retired research endpoint: no provider calls with or without credentials, origin/method protections retained');
