import { health } from '../lib/health.mjs';

export const applicationRoutes=new Set(['/', '/check-in/about-you', '/check-in/social-media-time', '/check-in/sleep', '/check-in/physical-activity', '/check-in/daily-routine', '/results', '/tools', '/tools/sleep-shield', '/tools/reduction-goal', '/tools/progress']);

export default {
 async fetch(request, env) {
  const path = new URL(request.url).pathname;
  if (path === '/api/health-information') {
   // Cloudflare populates process.env from server-side bindings. No secrets in assets.
   if (request.method === 'POST' && request.headers.get('Origin') === new URL(request.url).origin) {
    if (!process.env.OPENAI_BASE_URL || !process.env.OPENAI_API_KEY) {
     return Response.json({ code: 'cloudflare_research_not_configured', message: 'Live research requires server-side provider configuration on this Cloudflare Worker.' }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } });
    }
   }
   return health(request);
  }
  if (path.startsWith('/api/')) return Response.json({ error: 'Not found' }, { status: 404 });
  // Only known HTML GET/HEAD routes receive the entry document. Assets/API misses stay misses.
  const page=applicationRoutes.has(path)&&['GET','HEAD'].includes(request.method)&&request.headers.get('Accept')?.includes('text/html');
  const assetRequest=page?new Request(new URL('/',request.url),request):request;
  const response = await env.ASSETS.fetch(assetRequest);
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Cache-Control', 'no-cache');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
 }
};
