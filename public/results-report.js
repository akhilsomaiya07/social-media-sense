'use strict';
// Results presentation only. Existing renderers own all calculations, conditions,
// research requests, event handlers and storage. Move/reuse their DOM output.
if(typeof document!=='undefined'){
 const get=id=>document.getElementById(id),root=get('result');
 const ranking=get('platform-ranking'),more=get('platform-ranking-more');let expanded=false;
 function showPlatforms(){
  Array.from(ranking.children).forEach((item,index)=>{item.hidden=!expanded&&index>=3;});
  more.hidden=ranking.children.length<=3;more.textContent=expanded?'Show fewer platforms':'Show all platforms';more.setAttribute('aria-expanded',String(expanded));
 }
 more.addEventListener('click',()=>{expanded=!expanded;showPlatforms();});
 function showWeeklySaving(){get('report-weekly-saving').textContent=get('goal-week').textContent+' hours saved per week (projected)';}
 get('goal-reduction').addEventListener('input',showWeeklySaving);
 document.addEventListener('checkin:complete',event=>{
  if(!event.detail.assessment)return;
  const assessment=event.detail.assessment;
  root.querySelectorAll('details').forEach(detail=>{detail.open=false;});
  expanded=false;showPlatforms();showWeeklySaving();
  const shieldVisible=!get('sleep-shield').hidden;
  get('report-bedtime-plan').hidden=!shieldVisible;
  get('sleep-context-title').textContent=shieldVisible?'Your Sleep Shield':'Sleep Context';
  const note=get('report-bedtime-observation');note.hidden=!shieldVisible;
  const late=assessment.behaviors.bedtime;
  note.textContent=late!=='Never'?`You reported that social media ${late.toLowerCase()} keeps you up later than planned.`:`You reported using social media ${String(assessment.prebed).toLowerCase()} during the hour before bed.`;
  // Sleep Context already explains duration. Keep the plan free of a duplicate intro.
  get('sleep-shield-content').querySelector('.shield-short-summary')?.remove();
  get('sleep-context-connection').textContent='Your answers did not connect social media with bedtime disruption. This check-in does not assume it explains your sleep amount.';
  if(Number(get('age').value)<18)get('sleep-context-interpretation').textContent='The CDC reference covers a full 24-hour day. Nighttime sleep alone cannot be classified against it; daytime naps may also contribute.';
  get('opportunity-why').textContent=get('opportunity-why').textContent.replace(' Your Sleep Shield below provides a bedtime cutoff and wind-down plan.','');
  get('report-health-summary').textContent=assessment.worthReviewing?'Explore benefits and possible risks related to the routine disruptions you reported.':'Explore ways to maintain your routine, plus optional reading about digital well-being.';
 });
}
