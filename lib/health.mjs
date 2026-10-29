// Retired provider endpoint retained for old clients and hosting-route compatibility.
// Educational resources are bundled with the frontend; no API credentials or network calls.
function json(data,status){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}
async function health(request){
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Forbidden'},403);
 return json({code:'research_retired',message:'Educational resources are now selected locally in the app.'},410);
}
export {health};
