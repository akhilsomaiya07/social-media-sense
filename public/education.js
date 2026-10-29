'use strict';
// Keep the longer-scrolling reason consistent with the assessment question in app.js.
const longerScrollingReason='You said you spent longer scrolling than you planned.';
// Pure context helper retained for compatibility; only the minimal context below is transmitted.
function healthSearchContext(result){
 const ageGroup=result.age<18?'Adolescents':result.age<30?'Young adults':result.age<65?'Adults':'Older adults';
 const topics=['social media benefits and online social connection','social media risks and digital well-being'];
 const texts=result.reasons.map(r=>r.text);
 if(texts.includes('You said social media kept you up later than intended.'))topics.push('screen use and sleep');
 if(texts.includes('You said social media took time away from physical activity.'))topics.push('sedentary behavior and physical activity');
 if(texts.includes('You said social media took time away from people you wanted to spend time with.'))topics.push('offline social connection and relationships');
 if(texts.includes(longerScrollingReason))topics.push('problematic or compulsive social media use');
 if(texts.includes('You said social media interrupted your everyday responsibilities.'))topics.push('school work and everyday responsibilities');
 if(!result.reasons.length)topics.push('social comparison and cyberbullying');
 const reportTexts={bedtime:'You said social media kept you up later than intended.',movement:'You said social media took time away from physical activity.',people:'You said social media took time away from people you wanted to spend time with.',longer:longerScrollingReason,tasks:'You said social media interrupted your everyday responsibilities.'};
 const disruption=Object.fromEntries(Object.entries(reportTexts).map(([key,text])=>[key,result.reasons.find(r=>r.text===text)?.frequency||'Never']));
 return {ageGroup,topics,dailyMinutes:result.daily,disruption};
}
function limitEducationCards(kind){
 const list=document.getElementById('education-'+kind),button=document.getElementById('education-'+kind+'-more');
 let expanded=false;
 function update(){
  Array.from(list.children).forEach((card,index)=>{card.hidden=!expanded&&index>=4;});
  button.hidden=list.children.length<=4;
  button.textContent=expanded?'Show less':'Show more '+kind+' ('+Math.max(0,list.children.length-4)+')';
  button.setAttribute('aria-expanded',String(expanded));
 }
 button.onclick=()=>{expanded=!expanded;update();};update();
}

function balancedHealthPresentation(result){return Number.isInteger(result.daily)&&result.daily>=0&&result.daily<=1440&&Array.isArray(result.reasons)&&result.reasons.length===0&&!result.worthReviewing;}
function renderLocalEducation(result,selection){
 const get=id=>document.getElementById(id),data=selectHealthResources(result),balanced=balancedHealthPresentation(result);
 function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
 function citation(source,parent){
  const text=element('p',`${source.organization} · ${source.title} · ${source.date?'Published/updated: '+source.date:'Publication/update date not available'}`,'education-source');
  const link=element('a','View source');link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`View source: ${source.title} (opens in a new tab)`);text.append(document.createTextNode(' · '),link);parent.append(text,element('p',source.population,'education-scope'));
 }
 get('education-live-status').hidden=false;get('education-live-status').textContent='Evidence-based educational resources';
 get('education-checked').hidden=true;get('education-fallback-note').hidden=false;
 get('education-fallback-note').textContent='Selected from a locally curated library. No live search is performed. Optional AI selection uses only reviewed library explanations. Sources may have newer versions; open each citation to check.';
 get('education-age').textContent='Resources are filtered to their stated age scope. General guidance is not an age-specific study. Your answers guide relevance, not a diagnosis or a judgment about safe usage.';
 get('education-benefits-title').textContent='Potential Benefits of Social Media';get('education-balance-tips').hidden=!balanced;get('education-benefits').hidden=false;get('education-risks-section').hidden=false;
 for(const kind of ['benefits','risks']){
  const list=get('education-'+kind);list.replaceChildren();
  if(selection?.[kind])data[kind]=selection[kind].map(id=>data[kind].find(c=>c.id===id)).filter(Boolean);
  for(const item of data[kind]){const li=element('li');li.append(element('h4',item.heading),element('p',item.statement));if(item.personal)li.append(element('p',item.personal,'education-personal'));for(const source of item.sources)citation(source,li);list.append(li);}
  limitEducationCards(kind);
 }
 get('health-resources-title').textContent=balanced?'Learn More':'Helpful Resources for Your Results';
 get('health-resources-intro').textContent='Reviewed resources appropriate to your age and reported routines. Not a live research search.';
 const resources=get('health-resource-list');resources.replaceChildren();
 for(const source of data.resources.slice(0,balanced?3:6)){const li=element('li');li.append(element('h4',source.title),element('p',source.summary),element('p',source.whyRelevant,'education-personal'));citation(source,li);resources.append(li);}
 get('health-resources').hidden=false;
}

let educationSequence=0;const educationCache=new Map();
async function renderHealthEducation(result){
 const sequence=++educationSequence;renderLocalEducation(result);
 const context={age:result.age,daily:result.daily,sleepMinutes:Math.round(result.sleep*60),activity:result.activity,behaviors:healthSearchContext(result).disruption};
 const key=JSON.stringify(context),cached=educationCache.get(key);let promise;
 if(cached&&cached.expires>Date.now())promise=cached.promise;
 else{if(educationCache.size>=50)educationCache.delete(educationCache.keys().next().value);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  promise=fetch('/api/health-information',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',signal:controller.signal,body:JSON.stringify(context)}).then(async response=>{if(!response.ok)throw Error('unavailable');return response.json()}).catch(()=>({mode:'local'})).finally(()=>clearTimeout(timer));
  const entry={promise,expires:Date.now()+60000};educationCache.set(key,entry);promise.then(data=>{if(data?.mode==='ai')entry.expires=Date.now()+21600000;});
 }
 const selection=await promise;if(sequence!==educationSequence||selection?.mode!=='ai')return;
 const local=selectHealthResources(result);
 for(const kind of ['benefits','risks'])if(!Array.isArray(selection[kind])||selection[kind].length<1||selection[kind].length>4||new Set(selection[kind]).size!==selection[kind].length||selection[kind].some(id=>!local[kind].some(c=>c.id===id)))return;
 renderLocalEducation(result,selection);
 document.getElementById('education-fallback-note').textContent='AI helped select and arrange reviewed explanations from the curated library. No live web research was performed. Educational information, not a medical diagnosis.';
}
if(typeof module!=='undefined')module.exports={healthSearchContext,renderLocalEducation,renderHealthEducation,balancedHealthPresentation};
