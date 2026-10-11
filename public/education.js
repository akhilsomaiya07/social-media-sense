'use strict';
function healthSearchContext(result){
 const ageGroup=result.age<13?'Children':result.age<18?'Adolescents':result.age<65?'Adults':'Older adults';
 const topics=['social media benefits and online social connection','social media risks and digital well-being'];
 const texts=result.reasons.map(r=>r.text);
 if(texts.includes('You said social media kept you up later than intended.'))topics.push('screen use and sleep');
 if(texts.includes('You said social media took time away from physical activity.'))topics.push('sedentary behavior and physical activity');
 if(texts.includes('You said social media took time away from people you wanted to spend time with.'))topics.push('offline social connection and relationships');
 if(texts.includes('You said you spent longer scrolling than planned.'))topics.push('problematic or compulsive social media use');
 if(texts.includes('You said social media interrupted your everyday responsibilities.'))topics.push('school work and everyday responsibilities');
 if(!result.reasons.length)topics.push('social comparison and cyberbullying');
 const reportTexts={bedtime:'You said social media kept you up later than intended.',movement:'You said social media took time away from physical activity.',people:'You said social media took time away from people you wanted to spend time with.',longer:'You said you spent longer scrolling than planned.',tasks:'You said social media interrupted your everyday responsibilities.'};
 const disruption=Object.fromEntries(Object.entries(reportTexts).map(([key,text])=>[key,result.reasons.find(r=>r.text===text)?.frequency||'Never']));
 return {ageGroup,topics,dailyMinutes:result.daily,disruption};
}
// Presentation only: preserve every statement and citation, with four cards initially visible.
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
function educationHeading(statement,kind){
 const labels=[[/sleep|bedtime/i,'Sleep and screen use'],[/physical|sedentary|movement|exercise/i,'Time for physical activity'],[/scroll|compulsive|problematic|control|autoplay/i,'Scrolling habits'],[/school|work|responsibilit|attention|distract/i,'Everyday responsibilities'],[/comparison|compare/i,'Social comparison'],[/bully|harass/i,'Cyberbullying and harassment'],[/mislead|harmful content|misinformation/i,'Content awareness'],[/support|communit/i,'Support and community'],[/connect|relationship|friend|family/i,'Staying connected'],[/learn|information/i,'Learning and information'],[/creativ|express/i,'Creative expression']];
 return labels.find(([pattern])=>pattern.test(statement))?.[1]||(kind==='benefits'?'Potential benefit':'Possible risk');
}
function balancedHealthPresentation(result){
 // Valid time is context, not a medical cutoff. The current concern flag is worthReviewing.
 return Number.isInteger(result.daily)&&result.daily>=0&&result.daily<=1440&&Array.isArray(result.reasons)&&result.reasons.length===0&&!result.worthReviewing;
}
function setHealthPresentation(result){
 const balanced=balancedHealthPresentation(result),get=id=>document.getElementById(id);
 get('education-benefits-title').textContent=balanced?'Keep Your Balance':'Potential Benefits of Social Media';
 get('education-balance-tips').hidden=!balanced;
 get('education-benefits').hidden=balanced;
 get('education-risks-section').hidden=balanced;
 if(balanced)get('education-benefits-more').hidden=true;
 get('health-resources-title').textContent=balanced?'Learn More':'Helpful Resources for Your Results';
 get('health-resources-intro').textContent=balanced?'Optional reading about connection, everyday routines, and digital well-being.':'Sources selected from this assessment’s live search for relevance and evidence quality. Strong sources may appear again in future check-ins.';
 return balanced;
}
function balancedFallbackResources(result){
 const list=document.getElementById('health-resource-list');list.replaceChildren();
 const seen=new Set();
 for(const item of verifiedHealthFallback.benefits){
  if(seen.has(item.url)||(result.age>=18&&/youth|adolescent/i.test(item.sourceText)))continue;
  seen.add(item.url);
  const li=document.createElement('li'),heading=document.createElement('h4'),source=document.createElement('p'),link=document.createElement('a');
  heading.textContent=item.heading;source.className='education-source';source.textContent=item.sourceText;
  link.textContent='Read Source';link.className='resource-button';link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';li.append(heading,source,link);list.append(li);
  if(seen.size===3)break;
 }
 document.getElementById('health-resources').hidden=!seen.size;
}
function showHealthFallback(result){
 const get=id=>document.getElementById(id);
 const notes={
  'education-bedtime':['You said social media kept you up later than intended.'],
  'education-movement':['You said social media took time away from physical activity.','You said social media took time away from people you wanted to spend time with.'],
  'education-longer':['You said you spent longer scrolling than planned.'],
  'education-tasks':['You said social media interrupted your everyday responsibilities.']
 };
 for(const [kind,items] of Object.entries(verifiedHealthFallback)){
  const list=get('education-'+kind);list.replaceChildren();
  const frequencyScore=value=>value==='Often'?2:value==='Sometimes'?1:0;
  const ranked=items.map((item,index)=>{
   const matches=result.reasons.filter(r=>(notes[item.noteId]||[]).includes(r.text));
   const reason=matches.sort((a,b)=>frequencyScore(b.frequency)-frequencyScore(a.frequency))[0];
   return {item,index,reason};
  }).sort((a,b)=>Number(Boolean(b.reason))-Number(Boolean(a.reason))||a.index-b.index);
  for(const {item,reason} of ranked){
   const li=document.createElement('li'),heading=document.createElement('h4'),text=document.createElement('p');heading.textContent=item.heading;text.textContent=item.statement;li.append(heading,text);
   if(reason){const personal=document.createElement('p');personal.className='education-personal';personal.textContent=`Your check-in: “${reason.frequency}”. ${reason.text} This may be an area of your routine to review.`;li.append(personal)}
   const source=document.createElement('p');source.className='education-source';source.textContent=item.sourceText+' · ';const link=document.createElement('a');link.textContent='View source';link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';source.append(link);li.append(source);list.append(li);
  }
  limitEducationCards(kind);
 }
 get('education-fallback-note').hidden=false;get('education-fallback-note').textContent='The information below is general educational guidance from previously verified health sources. It was not refreshed for this assessment.';
 const scope=result.age>=18?'Some sources focus on children and adolescents; those findings do not automatically apply to adults or older adults.':'Some sources focus on adolescents; they do not automatically apply to every child or young person.';
 get('education-age').textContent=scope+' '+(result.reasons.length?'Personal notes reflect only your reported answers, not a diagnosis.':'You reported no routine disruption. These are general possibilities, not problems identified in your check-in.');
 get('education-checked').hidden=true;
 if(setHealthPresentation(result))balancedFallbackResources(result);
}
let healthRequest=0,healthAbort;
async function renderHealthEducation(result){
 const requestId=++healthRequest;if(healthAbort)healthAbort.abort();healthAbort=new AbortController();const controller=healthAbort;
 const get=id=>document.getElementById(id),status=get('education-live-status'),benefits=get('education-benefits'),risks=get('education-risks');
 get('health-resources').hidden=true;get('health-resource-list').replaceChildren();showHealthFallback(result);status.textContent='Checking current health sources…';status.hidden=false;
 const context=healthSearchContext(result);
 const timeout=setTimeout(()=>controller.abort(),50000);
 try{
  const response=await fetch('/api/health-information',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify(context),signal:controller.signal});
  const data=await response.json();if(!response.ok){const error=new Error('Refresh unavailable');error.code=data.code||'retrieval_failed';throw error;}if(requestId!==healthRequest)return;
  if(!Array.isArray(data.benefits)||!data.benefits.length||!Array.isArray(data.risks)||!data.risks.length||!Number.isFinite(Date.parse(data.checkedAt)))throw Error('Invalid evidence');
  function element(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
  function renderItems(items,kind){const fragment=document.createDocumentFragment();for(const item of items){if(typeof item.statement!=='string'||typeof item.population!=='string'||typeof item.applicability!=='string'||!Array.isArray(item.sources)||!item.sources.length)throw Error('Invalid item');const li=document.createElement('li');li.append(element('h4',educationHeading(item.statement,kind)),element('p',item.statement),element('p',`Evidence population: ${item.population}. ${item.applicability}`,'education-scope'));for(const source of item.sources){const url=new URL(source.url);if(url.protocol!=='https:'||typeof source.title!=='string'||typeof source.organization!=='string')throw Error('Invalid source');const citation=element('p',source.organization+' · ','education-source');const detail=document.createElement('details');detail.className='education-citation-detail';detail.append(element('summary','Source details'),element('p',`${source.title}. ${source.date?'Published/updated: '+source.date:'Publication/update date not available'}.`,'education-source'));const link=element('a','View source');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`View source: ${source.title} (opens in a new tab)`);citation.append(link);li.append(citation,detail)}fragment.append(li)}return fragment;}
  if(!Array.isArray(data.resources)||!data.resources.length||data.resources.length>6)throw Error('Invalid resources');
  const resourceNodes=document.createDocumentFragment();
  for(const resource of data.resources){
   const url=new URL(resource.url);if(url.protocol!=='https:'||['title','organization','whyRelevant','population','applicability'].some(key=>typeof resource[key]!=='string'||!resource[key].trim()))throw Error('Invalid resource');
   const li=document.createElement('li');li.append(element('p',resource.organization,'education-source'),element('h4',resource.title),element('p',resource.date?'Published/updated: '+resource.date:'Publication/update date not available','education-source'),element('p','Why this may be useful: '+resource.whyRelevant),element('p',`Evidence population: ${resource.population}. ${resource.applicability}`,'education-scope'));
   const link=element('a','Read Source','resource-button');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`Read source: ${resource.title} (opens in a new tab)`);li.append(link);resourceNodes.append(li);
  }
  const benefitNodes=renderItems(data.benefits,'benefits'),riskNodes=renderItems(data.risks,'risks');benefits.replaceChildren();risks.replaceChildren();benefits.append(benefitNodes);risks.append(riskNodes);limitEducationCards('benefits');limitEducationCards('risks');status.hidden=true;get('education-fallback-note').hidden=true;get('education-age').textContent=`Sources selected for ${context.ageGroup.toLowerCase()}. Age-group applicability is shown with each statement.`;
  get('education-checked').textContent='Current sources checked for this assessment · '+new Date(data.checkedAt).toLocaleString();get('education-checked').hidden=false;get('health-resource-list').replaceChildren();get('health-resource-list').append(resourceNodes);get('health-resources').hidden=false;
  if(setHealthPresentation(result)){Array.from(get('health-resource-list').children).forEach((node,index)=>{node.hidden=index>=3;});}
 }catch{if(requestId===healthRequest){showHealthFallback(result);status.hidden=false;status.textContent='Live sources could not be refreshed right now.';}}
 finally{clearTimeout(timeout)}
}
if(typeof document!=='undefined')document.getElementById('checkin').addEventListener('input',()=>{healthRequest++;healthAbort?.abort();});
if(typeof module!=='undefined')module.exports={healthSearchContext,showHealthFallback,renderHealthEducation,balancedHealthPresentation};
