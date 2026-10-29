'use strict';
// Keep the longer-scrolling reason consistent with the assessment question in app.js.
const longerScrollingReason='You said you spent longer scrolling than you planned.';
// Legacy pure context helper retained for compatibility; nothing is transmitted.
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
function renderHealthEducation(result){
 const get=id=>document.getElementById(id),data=selectHealthResources(result),balanced=balancedHealthPresentation(result);
 function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
 function citation(source,parent){
  const text=element('p',`${source.organization} · ${source.title} · ${source.date?'Published/updated: '+source.date:'Publication/update date not available'}`,'education-source');
  const link=element('a','View source');link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`View source: ${source.title} (opens in a new tab)`);text.append(document.createTextNode(' · '),link);parent.append(text,element('p',source.population,'education-scope'));
 }
 get('education-live-status').hidden=false;get('education-live-status').textContent='Evidence-based educational resources';
 get('education-checked').hidden=true;get('education-fallback-note').hidden=false;
 get('education-fallback-note').textContent='Selected from a locally curated library. No live search or AI service is used. Sources may have newer versions; open each citation to check.';
 get('education-age').textContent='Resources are filtered to their stated age scope. General guidance is not an age-specific study. Your answers guide relevance, not a diagnosis or a judgment about safe usage.';
 get('education-benefits-title').textContent='Potential Benefits of Social Media';get('education-balance-tips').hidden=!balanced;get('education-benefits').hidden=false;get('education-risks-section').hidden=false;
 for(const kind of ['benefits','risks']){
  const list=get('education-'+kind);list.replaceChildren();
  for(const item of data[kind]){const li=element('li');li.append(element('h4',item.heading),element('p',item.statement));if(item.personal)li.append(element('p',item.personal,'education-personal'));for(const source of item.sources)citation(source,li);list.append(li);}
  limitEducationCards(kind);
 }
 get('health-resources-title').textContent=balanced?'Learn More':'Helpful Resources for Your Results';
 get('health-resources-intro').textContent='Curated resources selected locally for your age and reported routines. Not a live research search.';
 const resources=get('health-resource-list');resources.replaceChildren();
 for(const source of data.resources.slice(0,balanced?3:6)){const li=element('li');li.append(element('h4',source.title),element('p',source.summary),element('p',source.whyRelevant,'education-personal'));citation(source,li);resources.append(li);}
 get('health-resources').hidden=false;
}
if(typeof module!=='undefined')module.exports={healthSearchContext,renderHealthEducation,balancedHealthPresentation};
