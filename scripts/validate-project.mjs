import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const html=await readFile('public/index.html','utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
 const path=match[1].split('?')[0];if(/^(https?:|data:|mailto:)/.test(path))continue;
 const file=resolve('public',['/','./','.'].includes(path)?'index.html':path.replace(/^\//,''));assert(file.startsWith(resolve('public')+'/'));await readFile(file);
}
for(const file of await readdir('public')){const contents=await readFile('public/'+file,'utf8');if(file.endsWith('.js'))new Script(contents,{filename:file});assert(!/sk-(?:proj-)?[A-Za-z0-9_-]{20,}/.test(contents),'Possible secret in public files');}
const module=await import('../netlify/functions/health-information.mjs');assert.equal(typeof module.default,'function');assert.equal(module.config.path,'/api/health-information');
console.log('Project valid: all browser assets present, JavaScript parses, Netlify function and route load.');
