import assert from 'node:assert/strict';
import {applicationRoutes} from '../cloudflare/worker.mjs';
import {startRoutingServer} from './routing-server.mjs';
const server=await startRoutingServer();
try{
 for(const path of applicationRoutes){
  const r=await fetch(server.origin+path,{headers:{Accept:'text/html'}});assert.equal(r.status,200,path);assert.equal(r.url,server.origin+path,'deep URL must not redirect to /');const html=await r.text();assert.match(html,/<title>Social Media Sense/);assert.match(html,/src="\/routing.js/);assert.equal(r.headers.get('X-Content-Type-Options'),'nosniff');assert.equal(r.headers.get('Cache-Control'),'no-cache');
  const head=await fetch(server.origin+path,{method:'HEAD',headers:{Accept:'text/html'}});assert.equal(head.status,200);assert.equal(await head.text(),'');
 }
 for(const path of ['/missing','/missing.js','/tools/missing','/api/missing']){const r=await fetch(server.origin+path,{headers:{Accept:'text/html'}});assert.equal(r.status,404,path);assert(!r.headers.get('content-type')?.includes('text/html'));}
 for(const path of ['/tools','/check-in/sleep']){
  assert.equal((await fetch(server.origin+path,{method:'POST',headers:{Accept:'text/html'},body:'x'})).status,405);
  assert.equal((await fetch(server.origin+path,{headers:{Accept:'application/json'}})).status,404);
 }
 for(const [path,type] of [['/app.js','javascript'],['/style.css','css']]){const r=await fetch(server.origin+path);assert.equal(r.status,200);assert(r.headers.get('content-type').includes(type));}
 const api=await fetch(server.origin+'/api/health-information',{method:'GET'});assert.notEqual(api.status,200);assert(api.headers.get('content-type').includes('json'));
 console.log('PASS actual Worker handler: 11 direct GET/HEAD routes, absolute assets, security/cache headers, missing routes/assets/APIs and non-page methods; filesystem asset binding (not deployed Cloudflare)');
}finally{await server.close();}
