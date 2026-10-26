'use strict';
const checkinStorageKey='room.saved-checkins.v1';
const behaviorKeys=['bedtime','tasks','movement','people','longer'];
const legacyBehaviorKeys=['bedtime','tasks','movement','longer'];
function goalTime(minutes){const h=Math.floor(minutes/60),m=minutes%60;return (h?h+'h':'')+(h&&m?' ':'')+(m?m+'m':'')||'0m';}
function goalProjection(daily,requested){const reduction=Math.min(daily,Math.max(0,Math.round(Number(requested)||0)));return {daily,reduction,target:daily-reduction,week:reduction*7/60,month:reduction*30/60,year:reduction*365/60,days:reduction*365/1440};}
function groupedPlatforms(platforms){const totals=new Map();for(const p of platforms){const key=p.name.trim().toLowerCase();const existing=totals.get(key)||{name:p.name.trim(),minutes:0};existing.minutes+=p.minutes;totals.set(key,existing);}return [...totals.values()].sort((a,b)=>b.minutes-a.minutes);}
// Presentation priority only, not a clinical ranking. Never use time or pre-bed use
// to infer an interruption. Ties follow this stable, documented order.
const routineAreas=[
 {key:'bedtime',area:'Bedtime',phrase:'social media keeps you up later than intended',summary:'bedtime'},
 {key:'longer',area:'Scrolling longer than planned',phrase:'you scroll longer than planned',summary:'scrolling longer than planned'},
 {key:'tasks',area:'Everyday responsibilities',phrase:'social media interrupts school, work, or everyday responsibilities',summary:'responsibilities'},
 {key:'movement',area:'Physical activity',phrase:'social media takes time away from physical activity',summary:'physical activity'},
 {key:'people',area:'Time with other people',phrase:'social media takes time away from people you wanted to spend time with',summary:'time with other people'}
];
function selectedRoutine(assessment){
 const answers=assessment.behaviors||{};
 for(const frequency of ['Often','Sometimes']){
  const area=routineAreas.find(item=>answers[item.key]===frequency);
  if(area)return {...area,frequency};
 }
 return null;
}
function biggestOpportunity(assessment){
 const selected=selectedRoutine(assessment);
 const opportunity=selected?{key:selected.key,area:selected.area,explanation:`You answered “${selected.frequency}”: ${selected.phrase}.`,platformNote:''}:{key:'balance',area:'Maintain your balance',explanation:'You did not report interruptions in the routine areas asked about. No follow-up action is required.',platformNote:''};
 const top=groupedPlatforms(assessment.platforms||[])[0];
 opportunity.platformNote=assessment.daily>0&&top&&top.minutes/assessment.daily>=.4?`${top.name} accounts for about ${Math.round(top.minutes/assessment.daily*100)}% of your reported social media time.`:'';
 return opportunity;
}
function dailyChange(previous,current){const difference=current-previous;const percent=previous>0?difference/previous*100:current===0?0:null;return {difference,percent};}
function validSavedCheckin(record){
 const minutes=n=>Number.isInteger(n)&&n>=0&&n<=1440;
 return !!record&&typeof record.id==='string'&&record.id.length>0&&record.id.length<=100&&typeof record.date==='string'&&Number.isFinite(Date.parse(record.date))&&minutes(record.daily)&&minutes(record.sleepMinutes)&&minutes(record.activityMinutes)&&Array.isArray(record.platforms)&&record.platforms.every(p=>p&&typeof p.name==='string'&&p.name.trim().length>0&&p.name.length<=60&&minutes(p.minutes))&&record.platforms.reduce((sum,p)=>sum+p.minutes,0)===record.daily&&record.behaviors&&legacyBehaviorKeys.every(key=>['Never','Sometimes','Often'].includes(record.behaviors[key]))&&(record.behaviors.people===undefined||['Never','Sometimes','Often'].includes(record.behaviors.people))&&record.opportunity&&typeof record.opportunity.area==='string'&&typeof record.opportunity.explanation==='string'&&(record.reductionGoal===null||(minutes(record.reductionGoal)&&record.reductionGoal<=record.daily));
}
function createCheckinStore(getStorage){
 function read(){const raw=getStorage().getItem(checkinStorageKey);if(raw===null)return [];const saved=JSON.parse(raw);if(!saved||saved.version!==1||!Array.isArray(saved.checkins)||!saved.checkins.every(validSavedCheckin))throw new Error('Saved check-ins could not be read. Clear them to start a new history.');return saved.checkins;}
 return {read,save(record){if(!validSavedCheckin(record))throw new Error('This check-in could not be saved. Complete the assessment again.');const history=read(),index=history.findIndex(item=>item.id===record.id);if(index>=0)return history;history.push(record);getStorage().setItem(checkinStorageKey,JSON.stringify({version:1,checkins:history}));return history;},clear(){getStorage().removeItem(checkinStorageKey);}};
}
// Goal records are separate from immutable saved check-in snapshots.
const reductionStorageKey='social-media-sense.reduction-goals.v1';
function createGoalStore(getStorage){
 function read(){const raw=getStorage().getItem(reductionStorageKey);if(raw===null)return [];const data=JSON.parse(raw);if(data?.version!==1||!Array.isArray(data.goals)||!data.goals.every(g=>g&&typeof g.checkinId==='string'&&g.checkinId.length>0&&Number.isInteger(g.reduction)&&g.reduction>=0&&g.reduction<=1440&&Number.isFinite(Date.parse(g.updatedAt)))||new Set(data.goals.map(g=>g.checkinId)).size!==data.goals.length)throw Error('Saved goals could not be read.');return data.goals;}
 return {read,save(record,history){if(!record||typeof record.checkinId!=='string'||!Number.isInteger(record.reduction)||record.reduction<0||!Number.isFinite(Date.parse(record.updatedAt)))throw Error('This goal could not be saved.');if(!history.some(c=>c.id===record.checkinId&&c.daily>120&&record.reduction<=c.daily))throw Error('Save the matching eligible check-in first.');const goals=read(),i=goals.findIndex(g=>g.checkinId===record.checkinId);if(i<0)goals.push(record);else goals[i]=record;getStorage().setItem(reductionStorageKey,JSON.stringify({version:1,goals}));return goals;}};
}
function clearCheckinsAndGoals(getStorage){
 // Goals first: if either operation fails, history is never removed while linked
 // goals remain. Report partial failure; do not touch the independent Shield key.
 const storage=getStorage();storage.removeItem(reductionStorageKey);storage.removeItem(checkinStorageKey);
}
function freezeCheckin(value){if(value&&typeof value==='object'){Object.values(value).forEach(freezeCheckin);Object.freeze(value);}return value;}
if(typeof module!=='undefined')module.exports={goalTime,goalProjection,groupedPlatforms,selectedRoutine,routineAreas,biggestOpportunity,dailyChange,validSavedCheckin,createCheckinStore,checkinStorageKey,reductionStorageKey,createGoalStore,clearCheckinsAndGoals,freezeCheckin};
if(typeof document!=='undefined'){
 const get=id=>document.getElementById(id),store=createCheckinStore(()=>window.localStorage),goalStore=createGoalStore(()=>window.localStorage);
 let current=null,history=[],goals=[],historyError=false,goalError=false,goalId='',progressId='',returnGoalId='',sequence=0;
 const drafts=new Map(),goalSlider=get('goal-reduction');
 const message=text=>{get('goal-save-status').textContent=text;};
 const goalMessage=text=>{get('reduction-status').textContent=text;};
 function load(){try{history=store.read();historyError=false;}catch{history=[];historyError=true;}try{goals=goalStore.read();goalError=false;}catch{goals=[];goalError=true;}}
 function records(){return [...history,...(current&&!history.some(r=>r.id===current.id)?[current]:[])];}
 function baseline(id){return records().find(r=>r.id===id);}
 function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
 function label(record){return (record.id===current?.id?'Current check-in':'Saved check-in')+' · '+new Date(record.date).toLocaleString()+' · '+goalTime(record.daily)+'/day';}
 function options(id,selected){const select=get(id);select.replaceChildren();for(const record of records().slice().reverse()){const o=element('option',label(record));o.value=record.id;select.append(o);}select.value=selected;select.hidden=!records().length;get(id==='goal-baseline'?'goal-baseline-label':'progress-record-label').hidden=select.hidden;}
 function defaultId(){return current?.id||history.at(-1)?.id||'';}
 function draft(record){if(!drafts.has(record.id)){const saved=goals.find(g=>g.checkinId===record.id);drafts.set(record.id,saved&&saved.reduction<=record.daily?saved.reduction:record.reductionGoal??0);}return drafts.get(record.id);}
 function updateProjection(){
  const record=baseline(goalId);if(!record||record.daily<=120)return;
  const p=goalProjection(record.daily,draft(record));goalSlider.max=String(record.daily);goalSlider.value=String(p.reduction);goalSlider.disabled=false;
  goalSlider.setAttribute('aria-valuetext',`${p.reduction} minutes less per day`);get('goal-reduction-value').textContent=goalTime(p.reduction);
  get('goal-limit').textContent=`Choose up to ${goalTime(record.daily)} per day. This is a plan, not a recorded change.`;
  get('goal-before').textContent=goalTime(p.daily)+'/day';get('goal-after').textContent=goalTime(p.target)+'/day';get('goal-before-bar').style.width=p.daily/1440*100+'%';get('goal-after-bar').style.width=p.target/1440*100+'%';
  get('goal-daily').textContent=String(p.reduction);for(const key of ['week','month','year'])get('goal-'+key).textContent=p[key].toLocaleString(undefined,{maximumFractionDigits:2});get('goal-days').textContent=p.days.toFixed(1);
  get('report-weekly-saving').textContent=p.reduction?get('goal-week').textContent+' hours saved per week (projected)':'Choose a reduction amount if you want to explore how your time could change.';get('report-goal-breakdown').hidden=!p.reduction;
 }
 function renderGoal(){
  if(!baseline(goalId))goalId=defaultId();options('goal-baseline',goalId);const record=baseline(goalId),eligible=!!record&&record.daily>120,saved=history.some(r=>r.id===goalId);
  get('cutback').hidden=!eligible;get('goal-persistence').hidden=!eligible;get('goal-start').hidden=!!record;
  get('goal-unavailable').textContent=!record?(historyError?'Saved history could not be read. No stored data has been replaced. A completed check-in is needed for a baseline.':'Complete a check-in to use a reported daily baseline. No usage has been assumed.'):!eligible?'This optional tool is available for reported daily use exceeding 2 hours. This is an app feature rule, not a medical cutoff.':'';
  get('goal-baseline-note').textContent=record?label(record)+(saved?'. Goals do not change this saved assessment.':'. Not saved yet. Your draft target stays with this check-in during this visit.') :'';
  get('save-goal').disabled=!saved||goalError||historyError;get('goal-save-assessment').hidden=saved||record?.id!==current?.id;
  if(goalError)goalMessage('Saved goals could not be read. No saved data has been replaced. You can still explore a temporary target.');
  updateProjection();
 }
 function changeText(before,after,unit){const diff=after-before;return diff===0?`No change ${unit}.`:`${Math.abs(diff)} ${Math.abs(diff)===1?'minute':'minutes'} ${diff<0?'less':'more'} ${unit}.`;}
 function addCompare(parent,before,after,beforeLabel,afterLabel){const grid=element('div',undefined,'goal-comparison');for(const [label,value,date] of [[beforeLabel,goalTime(before.daily)+'/day',before.date],[afterLabel,goalTime(after.daily)+'/day',after.date]]){const card=element('div',undefined,'goal-compare-card');card.append(element('span',label,'goal-label'),element('strong',value));const time=element('time',new Date(date).toLocaleString());time.dateTime=date;card.append(time);grid.append(card);}parent.append(grid);}
 function renderComparison(previous,current,area){
  addCompare(area,previous,current,'PREVIOUS CHECK-IN','CURRENT CHECK-IN');
  const change=dailyChange(previous.daily,current.daily);let text=changeText(previous.daily,current.daily,'per day');
  if(change.percent===null)text+=' Percentage change is not defined because previous use was 0.';
  else text+=change.percent===0?' (0% change)':` (${Math.abs(change.percent).toFixed(1)}% ${change.percent<0?'less':'more'})`;
  area.append(element('p',text,'goal-change'));
  if(previous.reductionGoal!==null){const target=previous.daily-previous.reductionGoal,diff=current.daily-target;area.append(element('p',`Previous reduction goal: ${goalTime(previous.reductionGoal)} less per day, for a target of ${goalTime(target)}/day. Current reported use is ${diff===0?'equal to that target':goalTime(Math.abs(diff))+(diff<0?' below':' above')+' that target'}.`));}
  area.append(element('h4','Sleep'),element('p',`${goalTime(previous.sleepMinutes)} → ${goalTime(current.sleepMinutes)} per night. ${changeText(previous.sleepMinutes,current.sleepMinutes,'per night')}`));
  area.append(element('h4','Physical activity'),element('p',`${goalTime(previous.activityMinutes)} → ${goalTime(current.activityMinutes)} per day. ${changeText(previous.activityMinutes,current.activityMinutes,'per day')}`));
  const prior=groupedPlatforms(previous.platforms),now=groupedPlatforms(current.platforms),names=new Map();
  for(const p of [...now.filter(p=>p.minutes>0).slice(0,3),...prior.filter(p=>p.minutes>0).slice(0,3)])names.set(p.name.toLowerCase(),p.name);
  area.append(element('h4','Top social media apps'),element('p','The most-used apps from either check-in, with their reported daily times.','goal-note'));
  if(!names.size)area.append(element('p','No social media time was reported in either check-in.'));
  else{const list=element('ul',undefined,'goal-app-list');for(const [key,name] of names){const a=prior.find(p=>p.name.toLowerCase()===key)?.minutes||0,b=now.find(p=>p.name.toLowerCase()===key)?.minutes||0,item=element('li');item.append(element('strong',name),element('p',`Previous: ${goalTime(a)} · Current: ${goalTime(b)}`),element('p',changeText(a,b,'per day')));list.append(item);}area.append(list);}
  area.append(element('p','These are changes in your reported averages, not a measure of whether you are healthier or unhealthier.','goal-note')); }
 function renderProgress(){
  if(!baseline(progressId))progressId=defaultId();options('progress-record',progressId);
  const selected=baseline(progressId),saved=history.some(r=>r.id===current?.id),area=get('goal-progress-content'),summary=get('progress-summary'),details=get('progress-details'),recordArea=get('saved-record-summary');
  area.replaceChildren();recordArea.replaceChildren();summary.textContent='';details.hidden=true;get('goal-progress').hidden=false;
  get('save-checkin').hidden=!current||selected?.id!==current.id;get('save-checkin').disabled=!current||saved||historyError;get('save-checkin').textContent=saved?'Current Check-In Saved':'Save This Check-In';
  get('clear-checkins').disabled=!history.length&&!historyError&&!goals.length&&!goalError;
  get('return-to-goal').hidden=!returnGoalId||!baseline(returnGoalId);
  get('progress-record-note').textContent=selected?label(selected)+(selected.id===current?.id?'. Saving uses this completed assessment, not your draft answers.':'. Saved fields only; this is not a reconstructed assessment report.'):'';
  if(historyError){summary.textContent='Saved history could not be read. Nothing has been overwritten. Clear history only if you want to remove it and linked goals.';return;}
  if(!selected){summary.textContent='No saved check-ins yet. Complete an assessment, then save it here to compare later.';return;}
  recordArea.append(element('p',`Reported daily use: ${goalTime(selected.daily)} · Sleep: ${goalTime(selected.sleepMinutes)} per night · Physical activity: ${goalTime(selected.activityMinutes)} per day.`));
  const savedFields=element('details'),savedSummary=element('summary','View saved check-in fields');savedFields.append(savedSummary);
  const platforms=element('ul');for(const p of groupedPlatforms(selected.platforms).filter(p=>p.minutes>0))platforms.append(element('li',p.name+' — '+goalTime(p.minutes)));savedFields.append(platforms);
  const titles={bedtime:'Kept you up later',tasks:'Interrupted responsibilities',movement:'Replaced physical activity',people:'Replaced time with people',longer:'Scrolled longer than planned'};
  for(const [key,title] of Object.entries(titles))savedFields.append(element('p',title+': '+(selected.behaviors[key]||'Not recorded in this older check-in')));
  savedFields.append(element('p','Recorded starting point: '+selected.opportunity.area));recordArea.append(savedFields);
  const index=history.findIndex(r=>r.id===selected.id),previous=index>=0?history[index-1]:history.at(-1);
  if(!previous){summary.textContent=history.some(r=>r.id===selected.id)?'This is the first saved check-in. Complete and save another check-in to compare.':'This check-in is not saved yet. Save it here to compare on a later visit.';}
  else{details.hidden=false;summary.textContent=changeText(previous.daily,selected.daily,'per day')+' Compared with the preceding saved check-in.';renderComparison(previous,selected,area);}
  const linked=goals.find(g=>g.checkinId===selected.id);
  if(selected.reductionGoal!==null)recordArea.append(element('p','Historical goal recorded with this check-in: '+goalTime(selected.reductionGoal)+' less per day.','goal-note'));
  if(linked)recordArea.append(element('p',`Separately saved goal: ${goalTime(linked.reduction)} less per day · ${new Date(linked.updatedAt).toLocaleString()}. This is a target, not a change in reported use.`,'goal-note'));
  const orphans=goals.filter(g=>!history.some(r=>r.id===g.checkinId));if(orphans.length)message('Some goals have no matching saved check-in, possibly from a change in another tab. Clear saved history and linked goals to remove them; they cannot be used as baselines.');
 }
 function changed(){
  let saved=false;try{saved=!!current&&store.read().some(r=>r.id===current.id);}catch{}
  document.dispatchEvent(new CustomEvent('checkin:save-state',{detail:{saved}}));
  document.dispatchEvent(new Event('tools:data-changed'));
 }
 // Report shortcuts always open their submitted baseline, not a prior selection.
 document.addEventListener('click',event=>{const button=event.target.closest('[data-current-checkin]');if(!button||!current)return;if(button.dataset.view==='progress')progressId=current.id;if(button.dataset.view==='reduction')goalId=current.id;},true);
 document.addEventListener('checkin:complete',event=>{
  if(!event.detail.assessment)return;const a=event.detail.assessment;
  current=freezeCheckin({id:typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+(++sequence),date:new Date().toISOString(),daily:a.daily,platforms:a.platforms.map(p=>({...p})),sleepMinutes:a.sleepMinutes,activityMinutes:a.activityMinutes,behaviors:{...a.behaviors},opportunity:biggestOpportunity(a),reductionGoal:null});
  goalId=current.id;progressId=current.id;returnGoalId='';drafts.set(current.id,0);message('');goalMessage('');load();
  get('opportunity-area').textContent=current.opportunity.area;get('opportunity-why').textContent=current.opportunity.explanation;get('opportunity-platform').textContent=current.opportunity.platformNote;get('opportunity-platform').hidden=!current.opportunity.platformNote;get('biggest-opportunity').hidden=false;changed();
 });
 document.addEventListener('view:before',event=>{if(['reduction','progress'].includes(event.detail.view)){load();if(event.detail.view==='reduction')renderGoal();else renderProgress();}});
 goalSlider.addEventListener('input',()=>{const record=baseline(goalId);if(!record||record.daily<=120)return;drafts.set(record.id,goalProjection(record.daily,goalSlider.value).reduction);updateProjection();goalMessage('Draft target updated. Select Save My Goal to keep it on this device.');});
 get('goal-baseline').addEventListener('change',()=>{goalId=get('goal-baseline').value;goalMessage('');renderGoal();});
 get('progress-record').addEventListener('change',()=>{progressId=get('progress-record').value;renderProgress();});
 get('goal-save-assessment').addEventListener('click',()=>{returnGoalId=goalId;progressId=goalId;appViews.show('progress');});
 get('return-to-goal').addEventListener('click',()=>{goalId=returnGoalId;appViews.show('reduction');});
 get('save-checkin').addEventListener('click',()=>{if(!current)return;try{history=store.save(current);historyError=false;message('Current check-in saved on this device. A reduction goal is saved separately in Reduction Goal.');renderProgress();changed();}catch{message('Could not save this check-in. Browser storage may be unavailable or contain unreadable data. No previous record has been intentionally replaced.');}});
 get('save-goal').addEventListener('click',()=>{const record=baseline(goalId);if(!record||record.daily<=120)return;try{history=store.read();goals=goalStore.save({checkinId:record.id,reduction:goalProjection(record.daily,draft(record)).reduction,updatedAt:new Date().toISOString()},history);goalMessage('Goal saved for '+label(record)+'. The assessment is unchanged.');changed();}catch{goalMessage('Could not save this goal. Save the matching check-in first and check browser storage. No assessment has been changed.');}});
 get('clear-checkins').addEventListener('click',()=>{
  if(!window.confirm('Clear your saved check-ins and all reduction goals linked to them? This cannot be undone. Sleep Tracker plans and nights will not be deleted.'))return;
  try{clearCheckinsAndGoals(()=>window.localStorage);drafts.clear();if(current)drafts.set(current.id,0);returnGoalId='';goalMessage('Saved history and linked goals were cleared.');message('Saved check-ins and linked reduction goals cleared. Sleep Tracker is unchanged.');}
  catch{message('Clearing could not finish. Linked goals may already have been removed, but check-ins were not intentionally removed before goals. Retry when browser storage is available. Sleep Tracker was not touched.');}
  load();renderProgress();changed();
 });
 window.addEventListener('storage',event=>{if([checkinStorageKey,reductionStorageKey,null].includes(event.key)){load();if(appViews.current==='progress')renderProgress();if(appViews.current==='reduction')renderGoal();changed();}});
}

