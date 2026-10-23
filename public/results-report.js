'use strict';
// Reuse the same routine selection as saved check-ins; tools stay optional.
// Copy only; the shared selector in goals.js remains the sole priority rule.
const smallExperiments={
 bedtime:{title:'Protect your bedtime',text:'You could experiment with stopping social media use a little before your planned bedtime.'},
 tasks:{title:'Protect your focus',text:'You could try completing one planned task without checking social media.'},
 movement:{title:'Make room for movement',text:'You could set aside time for an activity you enjoy before opening social media.'},
 people:{title:'Be present for one moment',text:'You could try putting your phone aside during one conversation or shared activity.'},
 longer:{title:'Set an ending point',text:'You could choose when you want to stop one scrolling session and see how closely your actual use matches your intention.'}
};
function nextStepRecommendation(assessment){
 const selected=selectedRoutine(assessment);
 if(!selected)return {view:'progress',message:'You can finish here. No follow-up action is required.',description:'',choice:''};
 const message=`You answered “${selected.frequency}”: ${selected.phrase}.`;
 const ties=routineAreas.filter(area=>assessment.behaviors?.[area.key]===selected.frequency).length;
 const choice=ties>1?'Several routines have the same reported frequency. Only you can decide which matters most to you; the example below is not a personal priority ranking.':'Only you can decide which routine matters most to you. This is one possible experiment, not a prescribed goal.';
 const example={message,choice,title:smallExperiments[selected.key].title,description:smallExperiments[selected.key].text};
 if(selected.key==='bedtime')return {...example,view:'shield',label:'Explore Sleep Shield'};
 if(assessment.daily>120)return {...example,view:'reduction',label:'Explore a Reduction Goal'};
 return {...example,view:'progress'};
}
function routineSummary(assessment){
 const b=assessment.behaviors||{};
 const areas=['bedtime','tasks','movement','people','longer'].map(key=>routineAreas.find(area=>area.key===key));
 const join=items=>items.length<2?items.join(''):items.slice(0,-1).join(', ')+' and '+items.at(-1);
 if(areas.every(area=>b[area.key]==='Never'))return 'You did not report social media interrupting any of the five routine areas asked about.';
 const parts=[];
 for(const [frequency,word] of [['Often','frequent'],['Sometimes','occasional']]){
  const matched=areas.filter(area=>b[area.key]===frequency).map(area=>area.summary);
  if(matched.length)parts.push(`${word} interruptions ${matched.length===5?'in all five routine areas':'in '+join(matched)}`);
 }
 const summary=parts.length?'You reported '+parts.join(' and ')+'.':'';
 return summary||'Your recorded routine answers are available below.';
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
 const estimate=document.createElement('p');estimate.className='goal-note';estimate.textContent='These are estimates based on your answers, not automatically measured phone usage.';get('report-calculation').before(estimate);
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
  // Replace the original detailed answer list once, using the submitted snapshot.
  // All five answers are visible here; pre-bed context lives with sleep/activity.
  const summary=document.createElement('p');summary.textContent=routineSummary(assessment);
  const table=document.createElement('table');table.className='routine-answers';
  const caption=document.createElement('caption');caption.className='sr-only';caption.textContent='Your five routine answers from the past week';table.append(caption);
  const head=document.createElement('thead'),header=document.createElement('tr');
  for(const text of ['Routine','Your answer']){const th=document.createElement('th');th.scope='col';th.textContent=text;header.append(th);}head.append(header);table.append(head);
  const rows=document.createElement('tbody');
  const labels={bedtime:'Going to bed later than intended',tasks:'Interrupting responsibilities',movement:'Taking time away from physical activity',people:'Taking time away from people',longer:'Scrolling longer than planned'};
  for(const [key,label] of Object.entries(labels)){
   const row=document.createElement('tr'),name=document.createElement('th'),answer=document.createElement('td');
   name.scope='row';name.textContent=label;answer.textContent=assessment.behaviors?.[key]||'Not recorded';row.append(name,answer);rows.append(row);
  }
  table.append(rows);get('review').replaceChildren(summary,table);
  get('context').textContent='Reported age: '+assessment.age+'. Physical activity: '+goalTime(assessment.activityMinutes)+' per day. This value does not establish that social media caused reduced activity.';
  get('report-prebed-context').textContent='Social media during the hour before bedtime: '+assessment.prebed+'. This answer alone does not establish a bedtime interruption.';
  const selected=selectedRoutine(assessment);
  get('biggest-opportunity').hidden=!selected;
  get('opportunity-why').hidden=true;get('opportunity-why').textContent=nextStep.message;
  get('opportunity-area').textContent=nextStep.title||'';
  get('report-choice-intro').hidden=!selected;
  get('report-choice-note').hidden=!selected;get('report-choice-note').textContent=nextStep.choice;
  get('opportunity-platform').hidden=true;
  get('next-step-message').hidden=!!selected;
  get('report-tool-note').hidden=!selected||nextStep.view==='progress';
  get('report-tool-note').textContent=nextStep.view==='reduction'?'If you also want to explore a time target, Reduction Goal is available. Reducing total time is not required for this experiment.':'Sleep Shield can help you plan a cutoff. No plan is created unless you choose to save one in the tool.';
  get('report-bedtime-observation').hidden=true;
  if(assessment.age<18)get('sleep-context-reported').textContent='Reported nighttime sleep: '+goalTime(assessment.sleepMinutes)+'. The age reference covers a full 24-hour day.';
  get('report-health-summary').textContent='Health Information and Sources';
 });
}

