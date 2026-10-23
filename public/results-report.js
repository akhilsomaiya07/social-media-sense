'use strict';
// Reuse the same routine selection as saved check-ins; tools stay optional.
function nextStepRecommendation(assessment){
 const selected=selectedRoutine(assessment);
 if(!selected)return {view:'progress',message:'You can finish here. No follow-up action is required.',description:''};
 const message=`You answered “${selected.frequency}”: ${selected.phrase}.`;
 if(selected.key==='bedtime')return {view:'shield',label:'Explore Sleep Shield',message,description:'If you want to try a change, create a bedtime scrolling cutoff and track how your nights go.'};
 if(assessment.daily>120)return {view:'reduction',label:'Explore a Reduction Goal',message,description:"If you'd like, explore a daily target and see how the projected time difference could add up."};
 return {view:'progress',message,description:'You could notice when this happens and compare your routine in a later check-in.'};
}
function routineSummary(assessment){
 const b=assessment.behaviors||{};
 const areas=['bedtime','tasks','movement','people','longer'].map(key=>routineAreas.find(area=>area.key===key));
 const join=items=>items.length<2?items.join(''):items.slice(0,-1).join(', ')+' and '+items.at(-1);
 if(areas.every(area=>b[area.key]==='Never'))return 'You did not report social media interrupting any of the five routine areas asked about.';
 const parts=[];
 for(const [frequency,word] of [['Often','frequent'],['Sometimes','occasional']]){
  const matched=areas.filter(area=>b[area.key]===frequency).map(area=>area.summary);
  if(matched.length)parts.push(`${word} interruptions ${matched.length===5?'in all five routine areas: ':'in '}${join(matched)}`);
 }
 const summary=parts.length?'You reported '+parts.join(' and ')+'.':'';
 const never=areas.filter(area=>b[area.key]==='Never').map(area=>area.summary);
 const remainder=never.length?` No interruptions were reported in ${join(never)}.`:'';
 return (summary+remainder).trim()||'Your recorded routine answers are available below.';
}
if(typeof module!=='undefined')module.exports={nextStepRecommendation,routineSummary};
// Results presentation only. Existing renderers own all calculations, conditions,
// research requests, event handlers and storage. Move/reuse their DOM output.
if(typeof document!=='undefined'){
 const get=id=>document.getElementById(id),root=get('result');
 let nextStep=null,savedState=false;
 function renderNextNavigation(){
  if(!nextStep)return;
  const primary=get('next-step-action'),progress=get('next-step-progress');
  primary.dataset.view=nextStep.view;primary.textContent=nextStep.view==='progress'?(savedState?'Review My Progress':'Go to Progress to Save'):nextStep.label;
  progress.hidden=nextStep.view==='progress';progress.textContent=savedState?'Review My Progress':'Go to Progress to Save';
  get('report-save-note').textContent=savedState?'This check-in is saved on this device. You can review it in Progress.':'This report is not automatically saved. Use Progress to save your check-in. Unsaved results may be lost when you refresh or close this tab.';
 }
 document.addEventListener('checkin:save-state',event=>{savedState=event.detail.saved;renderNextNavigation();});
 const ranking=get('platform-ranking'),more=get('platform-ranking-more');let expanded=false;
 function showPlatforms(){
  Array.from(ranking.children).forEach((item,index)=>{item.hidden=!expanded&&index>=3;});
  more.hidden=ranking.children.length<=3;more.textContent=expanded?'Show fewer platforms':'View all platforms';more.setAttribute('aria-expanded',String(expanded));
 }
 more.addEventListener('click',()=>{expanded=!expanded;showPlatforms();});
 // Keep source-renderer IDs; disclosures are native and closed by default.
 const estimate=document.createElement('p');estimate.className='goal-note';estimate.textContent='Self-reported estimates, not measured device usage.';get('report-calculation').before(estimate);
 document.addEventListener('checkin:complete',event=>{
  if(!event.detail.assessment)return;
  const assessment=event.detail.assessment;
  nextStep=nextStepRecommendation(assessment);
  get('result-sub').hidden=true;
  get('next-step-message').textContent=nextStep.message;
  get('next-step-description').textContent=nextStep.description;get('next-step-description').hidden=!nextStep.description;
  renderNextNavigation();
  root.querySelectorAll('details').forEach(detail=>{detail.open=false;});
  expanded=false;showPlatforms();
  get('review').querySelector('h4').hidden=true;
  const summary=get('review').querySelector('p');summary.hidden=false;summary.textContent=routineSummary(assessment);
  get('review').querySelector('summary').textContent='Review My Answers';
  const selected=selectedRoutine(assessment);
  get('biggest-opportunity').hidden=!selected;
  get('opportunity-why').hidden=false;get('opportunity-why').textContent=nextStep.message;
  get('opportunity-platform').hidden=true;
  get('next-step-message').hidden=!!selected;
  get('report-bedtime-observation').hidden=true;
  if(assessment.age<18)get('sleep-context-reported').textContent='Reported nighttime sleep: '+goalTime(assessment.sleepMinutes)+'. The age reference covers a full 24-hour day.';
  get('report-health-summary').textContent='Health Information and Sources';
 });
}

