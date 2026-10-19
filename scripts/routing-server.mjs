// Local integration harness: actual Worker handler, filesystem Static Assets stand-in.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import worker from '../cloudflare/worker.mjs';
export async function startRoutingServer(){
 const root=resolve('public');
 const env={ASSETS:{async fetch(request){
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
  const path=new URL(request.url).pathname;
  // Mirror the canonical HTML redirect; the Worker must request /, not /index.html.
  if(path==='/index.html')return Response.redirect(new URL('/',request.url),301);
  const file=resolve(root,'.'+(path==='/'?'/index.html':path));
  if(!file.startsWith(root+'/'))return new Response('Not found',{status:404});
  try{const body=await readFile(file);return new Response(request.method==='HEAD'?null:body,{headers:{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream'}});}catch{return new Response('Not found',{status:404});}
 }}};
 const server=createServer(async(req,res)=>{
  try{const chunks=[];for await(const c of req)chunks.push(c);const request=new Request(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.writeHead(500);res.end(String(e));}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 return {origin:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(r=>server.close(r))};
}
