'use strict';
// Results presentation only. Existing renderers own all calculations, conditions,
// research requests, event handlers and storage. Move/reuse their DOM output.
if(typeof document!=='undefined'){
 const get=id=>document.getElementById(id),root=get('result');
 const ranking=get('platform-ranking'),more=get('platform-ranking-more');let expanded=false;
 function showPlatforms(){
  Array.from(ranking.children).forEach((item,index)=>{item.hidden=!expanded&&index>=3;});
  more.hidden=ranking.children.length<=3;more.textContent=expanded?'Show fewer platforms':'View all platforms';more.setAttribute('aria-expanded',String(expanded));
 }
 more.addEventListener('click',()=>{expanded=!expanded;showPlatforms();});
 // Keep the source renderer's nodes and IDs; only group its detailed explanation.
 const sleep=get('sleep-context'),sleepDetails=document.createElement('details'),sleepSummary=document.createElement('summary');
 sleepSummary.textContent='Sleep reference and source';sleepDetails.append(sleepSummary);
 for(const id of ['sleep-context-reference','sleep-context-interpretation','sleep-context-connection'])sleepDetails.append(get(id));
 for(const node of [...sleep.children])if(node.matches('.goal-note,a'))sleepDetails.append(node);
 sleep.append(sleepDetails);
 const estimate=document.createElement('p');estimate.className='goal-note';estimate.textContent='These are estimates based on the usage you reported.';get('report-calculation').before(estimate);
 // Selection rules live in goals.js; explain them once with the methodology.
 const selection=get('biggest-opportunity').querySelector('details');
 const explanation=selection.querySelector('p');get('report-method').append(explanation);selection.remove();

 document.addEventListener('checkin:complete',event=>{
  if(!event.detail.assessment)return;
  const assessment=event.detail.assessment;
  root.querySelectorAll('details').forEach(detail=>{detail.open=false;});
  expanded=false;showPlatforms();
  get('sleep-context-title').textContent='Your sleep context';
  const context=sleepContext(assessment.age,assessment.sleepMinutes);
  if(context)get('sleep-context-reported').textContent=context.group==='Teen'?`You reported ${context.time} of nighttime sleep. The age reference covers a full 24-hour day, so nighttime sleep alone cannot be compared directly.`:`You reported ${context.time} of sleep per night. ${context.interpretation}`;
  get('review').querySelector('h4').hidden=!assessment.worthReviewing;
  get('opportunity-why').hidden=!assessment.worthReviewing;
  if(!assessment.worthReviewing){get('review').querySelector('p').hidden=true;get('opportunity-area').textContent='Maintain your current routine';get('opportunity-why').textContent='You did not report social media disrupting your daily routine in this check-in.';}

  get('report-bedtime-observation').hidden=true;
  get('sleep-context-connection').textContent='Your answers did not connect social media with bedtime disruption. This check-in does not assume it explains your sleep amount.';
  if(assessment.age<18)get('sleep-context-interpretation').textContent='The CDC reference covers a full 24-hour day. Nighttime sleep alone cannot be classified against it; daytime naps may also contribute.';
  get('opportunity-why').textContent=get('opportunity-why').textContent.replace(' Your Sleep Shield below provides a bedtime cutoff and wind-down plan.','').replace('Your Sleep Shield below offers a practical wind-down plan to try.','You can explore a wind-down plan in the optional Sleep Shield tool.');
  get('report-health-summary').textContent=assessment.worthReviewing?'Explore benefits and possible risks related to the routine disruptions you reported.':'Explore ways to maintain your routine, plus optional reading about digital well-being.';
 });
}
