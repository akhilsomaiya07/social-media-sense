'use strict';
const checkinStorageKey='room.saved-checkins.v1';
const behaviorKeys=['bedtime','tasks','movement','longer'];
function goalTime(minutes){const h=Math.floor(minutes/60),m=minutes%60;return (h?h+'h':'')+(h&&m?' ':'')+(m?m+'m':'')||'0m';}
function goalProjection(daily,requested){const reduction=Math.min(daily,Math.max(0,Math.round(Number(requested)||0)));return {daily,reduction,target:daily-reduction,week:reduction*7/60,month:reduction*30/60,year:reduction*365/60,days:reduction*365/1440};}
function groupedPlatforms(platforms){const totals=new Map();for(const p of platforms){const key=p.name.trim().toLowerCase();const existing=totals.get(key)||{name:p.name.trim(),minutes:0};existing.minutes+=p.minutes;totals.set(key,existing);}return [...totals.values()].sort((a,b)=>b.minutes-a.minutes);}
function biggestOpportunity(assessment){
 const choices=[
  {key:'bedtime',area:'Late-night scrolling',why:'social media keeps you up later than intended.',start:'Choosing a time to stop scrolling before bed may be a practical place to start.'},
  {key:'longer',area:'Scrolling longer than intended',why:'you scroll longer than planned.',start:'A small daily time goal may be a practical place to start.'},
  {key:'tasks',area:'Time for everyday responsibilities',why:'social media interrupts school, work, or everyday responsibilities.',start:'Choosing a task to do without checking social media may be a practical place to start.'},
  {key:'movement',area:'Time for activity or other people',why:'social media takes the place of physical activity or time with others.',start:'Choosing one offline activity you want to make time for may be a practical place to start.'}
 ];
 const score=value=>value==='Often'?2:value==='Sometimes'?1:0;
 const selected=choices.sort((a,b)=>score(assessment.behaviors[b.key])-score(assessment.behaviors[a.key]))[0];
 const answer=assessment.behaviors[selected.key];
 const opportunity=score(answer)?{key:selected.key,area:selected.area,explanation:`You answered “${answer}”: ${selected.why} ${selected.start}`}:{key:'balance',area:'Maintain your balance',explanation:'You did not report routine disruption in this check-in. You can still use the tools below to understand where your time goes.'};
 if(opportunity.key==='bedtime'){opportunity.area='Protect your bedtime';opportunity.explanation+=' Your Sleep Shield below provides a bedtime cutoff and wind-down plan.';}
 else if(opportunity.key!=='balance'&&assessment.prebed==='Often'&&score(answer)<2){opportunity.key='bedtime';opportunity.area='Protect your bedtime';opportunity.explanation='You reported frequent social media use in the hour before sleep. Your Sleep Shield below offers a practical wind-down plan to try.';}
 const top=groupedPlatforms(assessment.platforms)[0];opportunity.platformNote=assessment.daily>0&&top&&top.minutes/assessment.daily>=.4?`${top.name} accounts for about ${Math.round(top.minutes/assessment.daily*100)}% of your reported social media time.`:'';return opportunity;
}
function dailyChange(previous,current){const difference=current-previous;const percent=previous>0?difference/previous*100:current===0?0:null;return {difference,percent};}
function validSavedCheckin(record){
 const minutes=n=>Number.isInteger(n)&&n>=0&&n<=1440;
 return !!record&&typeof record.id==='string'&&record.id.length>0&&record.id.length<=100&&typeof record.date==='string'&&Number.isFinite(Date.parse(record.date))&&minutes(record.daily)&&minutes(record.sleepMinutes)&&minutes(record.activityMinutes)&&Array.isArray(record.platforms)&&record.platforms.every(p=>p&&typeof p.name==='string'&&p.name.trim().length>0&&p.name.length<=60&&minutes(p.minutes))&&record.platforms.reduce((sum,p)=>sum+p.minutes,0)===record.daily&&record.behaviors&&behaviorKeys.every(key=>['Never','Sometimes','Often'].includes(record.behaviors[key]))&&record.opportunity&&typeof record.opportunity.area==='string'&&typeof record.opportunity.explanation==='string'&&(record.reductionGoal===null||(minutes(record.reductionGoal)&&record.reductionGoal<=record.daily));
}
function createCheckinStore(getStorage){
 function read(){const raw=getStorage().getItem(checkinStorageKey);if(raw===null)return [];const saved=JSON.parse(raw);if(!saved||saved.version!==1||!Array.isArray(saved.checkins)||!saved.checkins.every(validSavedCheckin))throw new Error('Saved check-ins could not be read. Clear them to start a new history.');return saved.checkins;}
 return {read,save(record){if(!validSavedCheckin(record))throw new Error('This check-in could not be saved. Complete the assessment again.');const history=read(),index=history.findIndex(item=>item.id===record.id);if(index<0)history.push(record);else history[index]=record;getStorage().setItem(checkinStorageKey,JSON.stringify({version:1,checkins:history}));return history;},clear(){getStorage().removeItem(checkinStorageKey);}};
}
if(typeof module!=='undefined')module.exports={goalTime,goalProjection,groupedPlatforms,biggestOpportunity,dailyChange,validSavedCheckin,createCheckinStore,checkinStorageKey};
if(typeof document!=='undefined'){
 const get=id=>document.getElementById(id),store=createCheckinStore(()=>window.localStorage);let current=null,history=[],historyError=false,stale=false,saved=false,goalChosen=false,sequence=0;
 const goalSlider=get('goal-reduction');
 function message(text){get('goal-save-status').textContent=text;}
 function loadHistory(){try{history=store.read();historyError=false;return true;}catch{history=[];historyError=true;message('Saved check-ins could not be read. Browser storage may be blocked or the saved data may be invalid. No saved data has been replaced.');return false;}}
 function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
 function changeText(before,after,unit){const diff=after-before;return diff===0?`No change ${unit}.`:`${Math.abs(diff)} ${Math.abs(diff)===1?'minute':'minutes'} ${diff<0?'less':'more'} ${unit}.`;}
 function addCompare(parent,before,after,beforeLabel,afterLabel){const grid=element('div',undefined,'goal-comparison');for(const [label,value,date] of [[beforeLabel,goalTime(before.daily)+'/day',before.date],[afterLabel,goalTime(after.daily)+'/day',after.date]]){const card=element('div',undefined,'goal-compare-card');card.append(element('span',label,'goal-label'),element('strong',value));const time=element('time',new Date(date).toLocaleString());time.dateTime=date;card.append(time);grid.append(card);}parent.append(grid);}
 function renderProgress(){
  if(!current)return;const area=get('goal-progress-content');area.replaceChildren();get('clear-checkins').disabled=!history.length&&!historyError;get('save-checkin').disabled=stale||saved||historyError;
  if(historyError){area.append(element('p','Saved history is unavailable. You can still use the current results and projections.'));return;}
  const previous=history.filter(item=>item.id!==current.id).at(-1);
  if(!previous){area.append(element('p',saved?'Check-in saved. Complete another assessment later to compare it with this one.':'This is your first saved check-in. Save it now and come back later to compare your progress.'));return;}
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
  area.append(element('p','These are changes in your reported averages, not a measure of whether you are healthier or unhealthier.','goal-note'));
 }
 function updateProjection(chosen=false){
  if(!current)return;const projection=goalProjection(current.daily,Number(goalSlider.value));if(chosen)goalChosen=true;
  goalSlider.max=String(current.daily);goalSlider.value=String(projection.reduction);goalSlider.disabled=stale||current.daily===0;
  goalSlider.setAttribute('aria-valuetext',`${projection.reduction} minutes less per day`);get('goal-reduction-value').textContent=goalTime(projection.reduction);
  get('goal-limit').textContent=stale?'Your answers changed. Select “See My Results” to update the comparison.':current.daily===0?'You entered 0 minutes of daily use, so there is no time to reduce.':`Choose up to ${goalTime(current.daily)} per day. This is a plan, not a recorded change.`;
  get('goal-before').textContent=goalTime(projection.daily)+'/day';get('goal-after').textContent=goalTime(projection.target)+'/day';get('goal-before-bar').style.width=projection.daily/1440*100+'%';get('goal-after-bar').style.width=projection.target/1440*100+'%';
  get('goal-daily').textContent=String(projection.reduction);for(const key of ['week','month','year'])get('goal-'+key).textContent=projection[key].toLocaleString(undefined,{maximumFractionDigits:2});get('goal-days').textContent=projection.days.toFixed(1);
  current.reductionGoal=goalChosen?projection.reduction:null;
  if(chosen){saved=false;message('Goal updated. Use “Save This Check-In” to save this goal on this device.');renderProgress();}
 }
 document.addEventListener('checkin:complete',event=>{
  if(!event.detail.assessment)return;const assessment=event.detail.assessment;
  current={id:typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+(++sequence),date:new Date().toISOString(),daily:assessment.daily,platforms:assessment.platforms.map(p=>({...p})),sleepMinutes:assessment.sleepMinutes,activityMinutes:assessment.activityMinutes,behaviors:{...assessment.behaviors},opportunity:biggestOpportunity(assessment),reductionGoal:null};
  const showCutback=assessment.daily>120;
  stale=false;saved=false;
  if(!showCutback)goalSlider.value='0';
  goalChosen=showCutback&&Number(goalSlider.value)>0;message('');loadHistory();
  get('opportunity-area').textContent=current.opportunity.area;get('opportunity-why').textContent=current.opportunity.explanation;get('opportunity-platform').textContent=current.opportunity.platformNote;get('opportunity-platform').hidden=!current.opportunity.platformNote;
  get('biggest-opportunity').hidden=false;get('goal-progress').hidden=false;get('cutback').hidden=!showCutback;updateProjection();renderProgress();
 });
 goalSlider.addEventListener('input',()=>{if(current&&!stale)updateProjection(true);});
 get('checkin').addEventListener('input',()=>{if(!current)return;stale=true;updateProjection();renderProgress();message('Your answers changed. Complete the check-in again before saving.');});
 get('save-checkin').addEventListener('click',()=>{
  if(!current||stale||saved||historyError)return;
  try{history=store.save(current);historyError=false;saved=true;message('Check-in saved on this device.');renderProgress();}
  catch(error){message('Could not save this check-in. Browser storage may be blocked, full, or contain unreadable data. Your previous saved data has not been intentionally removed.');}
 });
 get('clear-checkins').addEventListener('click',()=>{
  if(!window.confirm('Clear your saved check-ins? This cannot be undone.'))return;
  try{store.clear();history=[];historyError=false;saved=false;message('Saved check-in history cleared.');renderProgress();}catch{message('Could not clear saved check-ins because browser storage is unavailable.');}
 });
 window.addEventListener('storage',event=>{if((event.key===checkinStorageKey||event.key===null)&&current){loadHistory();saved=history.some(item=>item.id===current.id&&item.reductionGoal===current.reductionGoal);renderProgress();}});
}
