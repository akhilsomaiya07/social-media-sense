'use strict';
const sleepShieldKey='social-media-sense.sleep-shield.v1';
const shieldWindows=[15,30,45,60];
function shieldClock(minutes){const n=((minutes%1440)+1440)%1440,h=Math.floor(n/60);return `${h%12||12}:${String(n%60).padStart(2,'0')} ${h<12?'AM':'PM'}`;}
function shieldDuration(n){n=Math.round(n);return `${Math.floor(n/60)?Math.floor(n/60)+'h':''}${n>=60&&n%60?' ':''}${n%60?n%60+'m':''}`||'0m';}
function shieldPlan(bedtime,window=30){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(bedtime)||!shieldWindows.includes(window))throw Error('Invalid wind-down plan');const [h,m]=bedtime.split(':').map(Number),end=h*60+m;return {cutoff:shieldClock(end-window),bedtime:shieldClock(end),previousDay:end-window<0,night:window,week:window*7,month:window*30,year:window*365};}
function validateShieldNight(n){return n&&['Yes','Partly','No'].includes(n.followed)&&Number.isInteger(n.sleepMinutes)&&n.sleepMinutes>=0&&n.sleepMinutes<=1440&&['Rested','Somewhat rested','Not very rested'].includes(n.rested)&&typeof n.note==='string'&&n.note.length<=240;}
function shieldComparison(nights){const complete=nights.filter(validateShieldNight),group=answer=>{const a=complete.filter(n=>n.followed===answer);return a.length?{count:a.length,average:Math.round(a.reduce((s,n)=>s+n.sleepMinutes,0)/a.length)}:null;};const ratings={'Not very rested':1,'Somewhat rested':2,Rested:3};const rating=complete.length?Math.round(complete.reduce((s,n)=>s+ratings[n.rested],0)/complete.length):null;return {complete:complete.length,yes:group('Yes'),partly:group('Partly'),no:group('No'),rating:rating?['','Not very rested','Somewhat rested','Rested'][rating]:null};}
// Seven numbered self-reported entries, not verified calendar nights.
function shieldVisualData(nights,persisted=true){
 const slots=Array.from({length:7},(_,i)=>validateShieldNight(nights?.[i])?nights[i]:null);
 const comparison=shieldComparison(slots),counts={Yes:0,Partly:0,No:0,unrecorded:0};
 slots.forEach(n=>counts[n?n.followed:'unrecorded']++);
 return {slots,comparison,counts,maxMinutes:Math.max(1,...slots.map(n=>n?.sleepMinutes||0)),achievement:false};
}
// Evaluate each of the seven saved slots; adherence and weekly averages are not eligibility rules.
function sevenNightSleepSummary(nights,age,persisted=true){
 const slots=Array.from({length:7},(_,i)=>validateShieldNight(nights?.[i])?nights[i]:null);
 const entries=slots.filter(Boolean),reference=sleepReference(age),complete=entries.length;
 const durations=slots.map(n=>n?.sleepMinutes??null),shortest=complete?Math.min(...entries.map(n=>n.sleepMinutes)):null,longest=complete?Math.max(...entries.map(n=>n.sleepMinutes)):null;
 const below=reference?entries.filter(n=>n.sleepMinutes<reference.min).length:null,unrested=entries.filter(n=>n.rested==='Not very rested').length;
 // No new questions: use an explicit interruption answer only if a historical record has one.
 // Free-text notes are never interpreted as diagnoses or structured sleep evidence.
 const interrupted=entries.filter(n=>n.interrupted==='Yes'||n.interrupted===true).length;
 const result={kind:'neutral',complete,reference,durations,below,shortest,longest,difference:complete?longest-shortest:null,unrested,interrupted,title:'Keep Recording Your Sleep',observation:`You have completed ${complete} of 7 check-ins. Complete the remaining entries to view your full seven-night sleep summary.`,advice:'',note:'Based on your self-reported entries, not verified consecutive calendar nights. Sleep duration alone does not establish overall sleep quality or a medically healthy sleep cycle.'};
 if(complete<7)return result;
 if(!persisted)return {...result,title:'Saved Records Needed',observation:'This set could not be confirmed as saved. No sleep-duration acknowledgment is awarded.',advice:'Try saving again when browser storage is available.'};
 if(!reference)return {...result,title:'Age Context Needed',observation:'All seven check-ins are recorded. A valid age from your current assessment is needed to compare these durations with age-specific recommendations.',advice:'You can review the reported durations without an age-based evaluation.'};
 if(below)return {...result,kind:'advice',title:shortest===longest?'Your Reported Sleep Was Shorter':'Your Sleep Duration Varied',observation:`${7-below} of 7 check-ins met the age-based reference minimum; ${below} ${below===1?'was':'were'} shorter. Reported sleep ranged from ${shieldDuration(shortest)} to ${shieldDuration(longest)}, a difference of ${shieldDuration(longest-shortest)}.`,advice:'Consider what was different on the shorter nights and whether protecting a more consistent amount of sleep time could help.'};
 if(unrested)return {...result,kind:'advice',title:'Feeling Rested Matters Too',observation:`All seven reported durations meet the age-based minimum, but ${unrested} ${unrested===1?'entry says':'entries say'} “Not very rested.”`,advice:'Consider whether your routine or sleep environment affects how you feel. If unrefreshing sleep persists or causes significant daytime difficulties, consider discussing it with a healthcare professional.'};
 if(interrupted)return {...result,kind:'advice',title:'You Reported Sleep Interruptions',observation:`All seven durations meet the age-based minimum, but ${interrupted} ${interrupted===1?'entry reports':'entries report'} significant sleep interruption.`,advice:'Consider what differed on those nights and one manageable adjustment to your routine or sleep environment.'};
 return {...result,kind:'positive',title:'Nice Work Making Time for Sleep! 🎉',observation:'Across your seven check-ins, you consistently reported sufficient sleep duration for your age.',advice:'Keep making time for rest and maintaining a routine that works for you!'};
}
function shieldFeedback(night,window){
 if(!validateShieldNight(night))return null;
 if(night.followed==='Yes')return {title:'Night check-in saved',text:'You reported following your wind-down plan for this night. Your sleep duration and how rested you felt are available under View My Progress.'};
 if(night.followed==='Partly')return {title:'You followed part of your plan.',text:window>15?'Would a shorter wind-down period or a different activity make it easier next time?':'Would a different activity or timing make it easier next time?'};
 return {title:"Your plan didn't quite fit this time.",text:'You reported not following your planned wind-down period. Consider adjusting the timing or choosing a different activity for next time.'};
}
function shieldOpportunity(result){const late=result.reasons.find(r=>r.text==='You said social media kept you up later than intended.');if(!late&&['Sometimes','Often'].includes(result.prebed))return {heading:'Create a screen-free wind-down',text:`You reported using social media ${result.prebed.toLowerCase()} during the hour before bed. This experiment focuses on that bedtime habit; it does not assume it caused your reported sleep amount.`};if(!result.reasons.length)return {heading:'Keep your current bedtime routine',text:'Your answers do not currently suggest much bedtime disruption from social media. Sleep Tracker can help you maintain that routine.'};if(late)return {heading:late.frequency==='Often'?'Reduce late-night scrolling':'Protect your bedtime',text:`You reported that social media ${late.frequency.toLowerCase()} keeps you awake later than intended. Late-night social media may be one area worth reviewing.`};return {heading:result.prebed==='Never'?'Keep your current bedtime routine':'Create a screen-free wind-down',text:'You did not report social media keeping you up later than intended. You can use this plan as a practical way to protect your bedtime routine.'};}
let shieldResearchId=0,shieldResearchAbort;
function validShieldBedtime(value){return typeof value==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(value);}
function savedShieldBedtime(stored,result){
 const candidates=[stored.bedtime,result?.sleepBedtime,...(Array.isArray(stored.nights)?stored.nights.slice().reverse().map(n=>n?.plan?.bedtime):[])];
 return candidates.find(validShieldBedtime)||'';
}
let shieldCurrentContext=null,shieldBuilt=false,shieldRefreshContext=null,shieldSummaryReset=null;
function renderSleepShield(result){
 shieldCurrentContext=result;
 if(shieldBuilt&&shieldRefreshContext)shieldRefreshContext(result);
}
function openSleepShield(){
 if(shieldBuilt)return;
 buildSleepShield(shieldCurrentContext,document.getElementById('sleep-shield-content'));
 shieldBuilt=true;
}
if(typeof document!=='undefined'){document.addEventListener('view:before',event=>{if(event.detail.view==='shield')openSleepShield();});document.addEventListener('assessment:started',()=>{shieldCurrentContext=null;shieldSummaryReset?.();});}
function buildSleepShield(result,root){
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const add=(tag,text,cls,parent=root)=>{const n=el(tag,text,cls);parent.append(n);return n;};
 let stored={},storageUnreadable=false;try{stored=JSON.parse(localStorage.getItem(sleepShieldKey)||'{}')||{};if(typeof stored!=='object'||Array.isArray(stored)||(stored.nights!==undefined&&!Array.isArray(stored.nights)))throw Error('Invalid plan');}catch{stored={};storageUnreadable=true;}
 if(storageUnreadable)add('p','Saved Sleep Tracker data could not be read. Nothing will be overwritten. You can try a plan temporarily.','shield-error');
 // Retain raw invalid records on unrelated saves; exclude them from charts/statistics.
 let nights=Array.from({length:7},(_,i)=>stored.nights?.[i]??null);
 let persisted=!storageUnreadable;
 const state={window:shieldWindows.includes(stored.window)?stored.window:30,activity:['Read','Stretch','Shower','Prepare for tomorrow','Journal','Relax','Listen to calm audio','Talk with family','Breathing or relaxation','Other'].includes(stored.activity)?stored.activity:'Read',other:typeof stored.other==='string'?stored.other.slice(0,80):'',parking:['In my bed','Beside my bed','Across the room','Outside the bedroom'].includes(stored.parking)?stored.parking:''};
 let contextResult=result,summaryAge=result?.age;
 let active=false;
 const stageTitle=add('h3','Create Your Bedtime Plan');
 const editor=add('div',undefined,'shield-plan-editor');
 const bedtimeLabel=add('label','What time do you usually try to go to sleep?'),bedtime=el('input');bedtime.type='time';bedtime.setAttribute('aria-required','true');bedtime.id='shield-bedtime';bedtimeLabel.append(bedtime);
 const bedtimeError=add('p','','shield-error');bedtimeError.id='shield-bedtime-error';bedtimeError.setAttribute('role','alert');bedtime.setAttribute('aria-describedby',bedtimeError.id);
 const savedBedtime=savedShieldBedtime(stored,result);
 if(savedBedtime){const reuse=add('button',`Resume My Plan (${shieldClock(Number(savedBedtime.slice(0,2))*60+Number(savedBedtime.slice(3)))})`,'goal-button goal-secondary');reuse.type='button';reuse.addEventListener('click',()=>{bedtime.value=savedBedtime;updatePlan();activate(false);});}

 const previewTitle=add('h4','Your Bedtime Plan');const startNote=add('p','');
 const timeline=add('div',undefined,'shield-timeline');timeline.setAttribute('aria-live','polite');
 function select(label,options,value,parent=root){const wrapper=add('label',label,undefined,parent),input=el('select');for(const [v,t] of options){const o=el('option',t);o.value=v;input.append(o);}input.value=value;wrapper.append(input);return input;}
 const activities=['Read','Stretch','Shower','Prepare for tomorrow','Journal','Relax','Other'];
 // Retain older saved activity choices without silently replacing their plan.
 if(!activities.includes(state.activity)){state.other=state.activity;state.activity='Other';}
 const activity=select('Instead of scrolling',activities.map(t=>[t,t]),state.activity);activity.id='shield-activity';
 const otherLabel=add('label','Your wind-down activity'),other=el('input');other.type='text';other.maxLength=80;other.value=state.other;otherLabel.append(other);other.id='shield-other';
 const parkingNote=add('p','','goal-note');
 const actions=add('div',undefined,'shield-plan-actions');
 const use=add('button','Save My Plan','goal-button',actions);use.type='button';use.id='shield-use';
 const track=add('button','Record a Night','goal-button',actions);track.type='button';track.id='shield-track';
 const editPlan=add('button','Edit My Plan','goal-button goal-secondary',actions);editPlan.type='button';editPlan.id='shield-edit';editPlan.hidden=true;
 const recordHelp=add('p','After you wake up, record how your night went.','goal-note');recordHelp.hidden=true;
 const nightStatus=add('p','','goal-note');nightStatus.setAttribute('role','status');
 const nightList=add('div',undefined,'shield-nights');nightList.hidden=true;
 const feedback=add('div',undefined,'shield-feedback');feedback.id='shield-feedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');feedback.setAttribute('aria-atomic','true');
 const achievement=add('section',undefined,'shield-achievement');achievement.id='shield-achievement';achievement.hidden=true;
 const compactComparison=add('p','','goal-note');compactComparison.hidden=true;
 function disclosure(title){const d=add('details',undefined,'shield-disclosure');add('summary',title,undefined,d);return d;}
 const why=disclosure('Sleep Guidance & Sources');
 const whyDescription=add('p','',undefined,why);add('p','The suggested window is a practical starting point, not a guarantee or a medical requirement.','goal-note',why);
 const wind=select('Adjust wind-down period',shieldWindows.map(n=>[String(n),n+' minutes']),String(state.window));wind.id='shield-window';root.insertBefore(wind.parentElement,bedtimeError.nextSibling);
 const researchContextNote=add('p','','goal-note',why);
 const research=add('div',undefined,'shield-research',why);
 const history=disclosure('View My Progress');
 const sleepSummary=add('section',undefined,'shield-sleep-summary');sleepSummary.id='shield-sleep-summary';sleepSummary.setAttribute('aria-labelledby','shield-sleep-summary-title');sleepSummary.setAttribute('aria-live','polite');sleepSummary.setAttribute('aria-atomic','true');root.insertBefore(sleepSummary,history);
 add('p','Seven numbered check-ins, not seven verified or consecutive dates. Missing entries are not failures. Each answer describes that entry’s own plan; plans may differ.','goal-note',history);
 const charts=add('div',undefined,'shield-charts',history);charts.id='shield-charts';
 const progress=add('p','','goal-note',history),completedList=add('div',undefined,'shield-completed',history),comparison=add('div',undefined,'shield-comparison',history);
 const opportunityDetails=disclosure('How Your Wind-Down Time Adds Up');const totals=add('div',undefined,'shield-summary',opportunityDetails);
 add('p','This is protected bedtime opportunity, not guaranteed additional sleep. These projections assume the same protected window every night; they are not measured reductions in app use.','goal-note',opportunityDetails);
 // Move existing controls, retaining their identity and handlers.
 for(const node of [...root.children])if(node===bedtimeLabel||node===bedtimeError||node===wind.parentElement||node===activity.parentElement||node===otherLabel||(node.tagName==='BUTTON'&&node.textContent.startsWith('Resume My Plan')))editor.append(node);
 function planDisplay(ready){
  editor.hidden=ready;use.hidden=ready;editPlan.hidden=!ready;recordHelp.hidden=!ready;
  stageTitle.textContent=ready?'Your Plan Is Ready':'Create Your Bedtime Plan';
  previewTitle.hidden=ready;startNote.hidden=ready;
 }
 editPlan.addEventListener('click',()=>{planDisplay(false);track.hidden=true;bedtime.focus();});
 const saveStatus=add('p','','goal-note');saveStatus.setAttribute('role','status');
 function persist(){
  if(storageUnreadable){saveStatus.textContent='Not saved. Existing Sleep Tracker data could not be read; nothing was overwritten.';return false;}
  try{const next={...stored,version:1,...state,bedtime:bedtime.value,nights};localStorage.setItem(sleepShieldKey,JSON.stringify(next));stored=next;persisted=true;saveStatus.textContent='Saved on this device.';document.dispatchEvent(new Event('tools:data-changed'));return true;}
  catch{saveStatus.textContent='Not saved. This browser could not save your Sleep Tracker. Your previous saved entries are unchanged; keep this form open to retry.';return false;}
 }
 function updatePlan(){active=false;planDisplay(false);track.hidden=true;history.hidden=true;nightList.hidden=true;nightStatus.hidden=true;compactComparison.hidden=true;otherLabel.hidden=state.activity!=='Other';bedtimeError.textContent='';bedtime.removeAttribute('aria-invalid');if(!validShieldBedtime(bedtime.value)){timeline.hidden=true;timeline.replaceChildren();totals.replaceChildren();startNote.textContent='Choose a bedtime to preview your plan.';return;}const p=shieldPlan(bedtime.value,state.window);timeline.hidden=false;timeline.replaceChildren();add('p',`Social media off: ${p.cutoff}${p.previousDay?' (previous day)':''}`,undefined,timeline);add('p',`Planned bedtime: ${p.bedtime}`,undefined,timeline);add('p',`Wind-down period: ${state.window} minutes`,undefined,timeline);add('p',`Instead of scrolling: ${state.activity==='Other'?state.other||'Other':state.activity}`,undefined,timeline);startNote.textContent=`Try protecting the final ${state.window} minutes before your planned bedtime from social media.`;totals.replaceChildren();for(const [key,label] of [['night','per night'],['week','per week'],['month','per 30-day month'],['year','per 365-day year']]){const cell=add('div',undefined,undefined,totals);add('strong',shieldDuration(p[key]),undefined,cell);add('p',label,'goal-note',cell);}otherLabel.hidden=state.activity!=='Other';parkingNote.hidden=!['In my bed','Beside my bed'].includes(state.parking);parkingNote.textContent='If you usually keep your phone beside you in bed, consider charging it farther away during your Sleep Tracker window.';}
 wind.addEventListener('change',()=>{const value=Number(wind.value);if(!shieldWindows.includes(value))return;state.window=value;updatePlan();});activity.addEventListener('change',()=>{state.activity=activity.value;updatePlan();});other.addEventListener('input',()=>{state.other=other.value.slice(0,80);updatePlan();});updatePlan();
 bedtime.addEventListener('input',updatePlan);
 function activate(save=true){if(!validShieldBedtime(bedtime.value)){bedtimeError.textContent='Choose a valid planned bedtime.';bedtime.setAttribute('aria-invalid','true');bedtime.focus();return;}active=true;if(save)persist();planDisplay(true);track.hidden=false;history.hidden=false;nightStatus.hidden=false;showComparison();if(track.disabled)editPlan.focus();else track.focus();}
 use.addEventListener('click',()=>activate());
 function showComparison(){
  const data=shieldVisualData(nights,persisted),c=data.comparison;
  renderSleepSummary();
  nightStatus.textContent=c.complete?`${c.complete} of 7 check-ins recorded`:'';
  track.disabled=c.complete===7;track.textContent=c.complete===7?'7 check-ins complete':'Record a Night';compactComparison.hidden=true;
  charts.replaceChildren();
  const adherence=add('section',undefined,'shield-chart',charts);add('h4','My Sleep Tracker Progress',undefined,adherence);
  const grid=add('ol',undefined,'shield-status-grid',adherence);
  const labels={Yes:'Followed',Partly:'Partly followed',No:'Not followed'};
  data.slots.forEach((n,i)=>{const item=add('li',undefined,'shield-slot',grid);item.dataset.status=n?n.followed:'Unrecorded';add('strong',`Night ${i+1}`,undefined,item);add('span',n?labels[n.followed]:'Unrecorded',undefined,item);});
  add('p',`${data.counts.Yes} followed · ${data.counts.Partly} partly · ${data.counts.No} not followed · ${data.counts.unrecorded} unrecorded`,'goal-note',adherence);
  const sleep=add('section',undefined,'shield-chart',charts);add('h4','My Reported Sleep Duration',undefined,sleep);
  const bars=add('ol',undefined,'shield-duration-bars',sleep);
  data.slots.forEach((n,i)=>{const row=add('li',undefined,undefined,bars);add('span',`Night ${i+1}`,undefined,row);const bar=add('span',undefined,'shield-duration-track',row);bar.setAttribute('aria-hidden','true');const fill=add('span',undefined,'shield-duration-fill',bar);fill.style.width=(n?n.sleepMinutes/data.maxMinutes*100:0)+'%';if(!n)bar.classList.add('unrecorded');add('strong',n?shieldDuration(n.sleepMinutes):'Not recorded',undefined,row);});
  add('p','These are the sleep durations you reported. Differences between entries do not prove that Sleep Tracker changed your sleep.','goal-note',sleep);
  achievement.hidden=true;achievement.replaceChildren();

  if(nights.some(n=>n!==null&&!validateShieldNight(n)))add('p','Some stored entries are incomplete or invalid. They are excluded from these summaries and retained until you explicitly replace or clear them.','goal-note',charts);
  const legacy=data.slots.some(n=>n&&n.adherenceQuestion!=='wind-down-v1');
  progress.textContent=legacy?'Legacy entries answered “Did you follow your Sleep Tracker?” They do not specifically confirm staying off social media throughout the wind-down period.':'';

  completedList.replaceChildren();
  data.slots.forEach((n,i)=>{if(!n)return;const row=add('div',undefined,'shield-completed-row',completedList);add('p',`Night ${i+1} · ${n.followed} · ${shieldDuration(n.sleepMinutes)} · ${n.rested}`,undefined,row);
   const plan=n.plan;
   add('p',plan&&validShieldBedtime(plan.bedtime)&&shieldWindows.includes(plan.window)?`Recorded plan: ${shieldClock(Number(plan.bedtime.slice(0,2))*60+Number(plan.bedtime.slice(3)))} bedtime · ${plan.window}-minute window${typeof plan.activity==='string'?' · '+plan.activity:''}`:'Original plan settings not recorded.','goal-note',row);
   if(n.adherenceQuestion!=='wind-down-v1')add('p','Legacy answer: general Sleep Tracker plan-following.','goal-note',row);
   if(n.note)add('p',n.note,'goal-note',row);const edit=add('button',`Edit night ${i+1}`,'goal-button goal-secondary',row);edit.type='button';edit.addEventListener('click',()=>buildNight(i));
  });
  comparison.replaceChildren();add('h4','Your personal pattern',undefined,comparison);
  if(!c.complete)add('p','No check-in recorded yet.',undefined,comparison);
  for(const [key,label] of [['yes','following'],['partly','partly following'],['no','not following']])if(c[key])add('p',`Entries reporting ${label} Sleep Tracker: average reported sleep ${shieldDuration(c[key].average)} (${c[key].count} ${c[key].count===1?'entry':'entries'}).`,undefined,comparison);
  if(c.rating)add('p',`Average rested rating: ${c.rating}`,undefined,comparison);
  add('p','These patterns come from your own check-ins and do not prove that social media caused changes in your sleep.','goal-note',comparison);
  add('p','“Partly” entries are shown separately. Rested ratings use 1–3 for the three choices, then round the average to the nearest label. Only saved, complete entries are included.','goal-note',comparison);
 }
 function renderSleepSummary(){
  const summary=sevenNightSleepSummary(nights,summaryAge,persisted);
  sleepSummary.replaceChildren();sleepSummary.dataset.outcome=summary.kind;
  const heading=add('h4','Your Seven-Night Sleep Summary',undefined,sleepSummary);heading.id='shield-sleep-summary-title';
  add('p',summary.title,'shield-sleep-summary-status',sleepSummary);
  add('p',summary.observation,undefined,sleepSummary);
  if(summary.advice)add('p',summary.advice,undefined,sleepSummary);
  if(summary.complete===7&&!summary.reference)add('p',summary.durations.map((minutes,i)=>`Night ${i+1}: ${shieldDuration(minutes)}`).join(' · '),'goal-note',sleepSummary);
  if(summary.reference){
   const context=add('p','Age-based reference: '+summary.reference.reference+'. ','goal-note',sleepSummary);
   const source=el('a','CDC source');source.href='https://www.cdc.gov/sleep/about/index.html';source.target='_blank';source.rel='noopener noreferrer';context.append(source);
   if(summary.reference.group==='Teen')add('p','The teen reference covers total sleep over 24 hours. These nighttime-only records do not include naps; shorter nighttime sleep does not establish insufficient total daily sleep.','goal-note',sleepSummary);
  }
  add('p',summary.note,'goal-note',sleepSummary);
 }
 function buildNight(i){nightList.replaceChildren();nightList.hidden=false;let saved=validateShieldNight(nights[i])?nights[i]:null;const details=add('div',undefined,'shield-night',nightList);feedback.replaceChildren();const title=add('h4',`Night ${i+1}`,undefined,details);title.tabIndex=-1;title.focus();add('p','Complete this after you wake up.','goal-note',details);if(saved?.recordedAt)add('p',`Recorded ${new Date(saved.recordedAt).toLocaleDateString()}${saved.plan?` · ${saved.plan.window}-minute window · ${saved.plan.activity}`:''}`,'goal-note',details);const legacy=saved&&saved.adherenceQuestion!=='wind-down-v1';const followed=select(legacy?'Did you follow your Sleep Tracker?':'Did you stay off social media during your planned wind-down period?',[['','Choose'],...['Yes','Partly','No'].map(t=>[t,t])],saved?.followed||'',details);followed.id='shield-followed';
 if(legacy)add('p','This entry uses the original, broader plan-following question. Editing it keeps that meaning.','goal-note',details);
 else{const explanation=add('p','Yes: I stayed off social media for the planned wind-down period. Partly: I followed part of the plan but still used social media during some of that time. No: I did not follow the planned social-media-free wind-down period. These answers do not establish when you fell asleep or whether you received enough sleep.','goal-note',details);explanation.id='shield-adherence-help';followed.setAttribute('aria-describedby',explanation.id);}
 add('p','How much did you sleep?',undefined,details);const fields=add('div',undefined,'two',details);function number(label,max,value){const wrap=add('label',label,undefined,fields),n=el('input');n.type='number';n.min=0;n.max=max;n.step=1;n.inputMode='numeric';n.value=value;wrap.append(n);return n;}const hours=number('Sleep hours',24,saved?Math.floor(saved.sleepMinutes/60):''),minutes=number('Sleep minutes',59,saved?saved.sleepMinutes%60:'');const rested=select('How rested did you feel?',[['','Choose'],...['Rested','Somewhat rested','Not very rested'].map(t=>[t,t])],saved?.rested||'',details);const noteDetails=add('details',undefined,undefined,details);add('summary','Add a note (optional)',undefined,noteDetails);const noteLabel=add('label','Short note',undefined,noteDetails),note=el('textarea');note.maxLength=240;note.rows=2;note.value=saved?.note||'';noteLabel.append(note);const error=add('p','', 'shield-error',details);error.setAttribute('role','alert');const button=add('button','Save night','goal-button',details);button.type='button';button.addEventListener('click',()=>{const h=Number(hours.value),m=Number(minutes.value);let message='';if(hours.value.trim()===''||!Number.isInteger(h)||h<0||h>24)message='Enter sleep hours from 0 to 24.';else if(minutes.value.trim()===''||!Number.isInteger(m)||m<0||m>59)message='Enter sleep minutes from 0 to 59.';else if(h*60+m>1440)message='Sleep time cannot exceed 24 hours per night.';else if(!followed.value)message='Choose whether you followed your Sleep Tracker.';else if(!rested.value)message='Choose how rested you felt.';error.textContent=message;if(message)return;const previous=nights[i];
 nights[i]={...saved,followed:followed.value,sleepMinutes:h*60+m,rested:rested.value,note:note.value.slice(0,240),recordedAt:saved?.recordedAt||new Date().toISOString(),...(saved?{updatedAt:new Date().toISOString()}:{adherenceQuestion:'wind-down-v1',plan:{bedtime:bedtime.value,window:state.window,activity:state.activity==='Other'?state.other:state.activity,parking:state.parking}})};
 if(!persist()){nights[i]=previous;error.textContent=saveStatus.textContent;return;}
 const messageData=shieldFeedback(nights[i],state.window);feedback.replaceChildren();add('h4',messageData.title,undefined,feedback);add('p',legacy?'Your updated answer describes general plan-following under the original question.':messageData.text,undefined,feedback);feedback.dataset.answer=nights[i].followed;
 saved=nights[i];showComparison();error.textContent='Saved on this device. You can edit this entry or close the check-in.';
 // Keep the form and focus intact. Repeated saves edit the same slot, never add one.
});const cancel=add('button','Close check-in','goal-button goal-secondary',details);cancel.type='button';cancel.addEventListener('click',()=>{nightList.hidden=true;nightList.replaceChildren();track.focus();});}
 track.addEventListener('click',()=>{if(!active)return;const index=nights.findIndex(n=>!validateShieldNight(n));if(index>=0)buildNight(index);});
 showComparison();const clear=add('button','Clear Sleep Tracker nights','goal-button goal-secondary',history);clear.type='button';clear.addEventListener('click',()=>{if(!confirm('Clear your seven Sleep Tracker nights? This cannot be undone.'))return;const previous=nights;nights=Array(7).fill(null);if(!persist()){nights=previous;return;}feedback.replaceChildren();nightList.hidden=true;nightList.replaceChildren();showComparison();});
 add('p','Your Sleep Tracker check-ins are stored on this device.','goal-note');add('p','People using this browser profile can see saved check-ins. No account is required.','goal-note',history);
 track.hidden=true;history.hidden=true;nightStatus.hidden=true;root.dispatchEvent(new Event('shield:ready'));
 function refreshContext(next){
  contextResult=next;summaryAge=next?.age;
  renderSleepSummary();
  whyDescription.textContent=next?shieldOpportunity(next).text:'Choose a wind-down period that fits your routine. No assessment is required to make or resume a plan.';
  researchContextNote.textContent=next?`Research context: your completed check-in, with ${shieldDuration(Math.round(next.sleep*60))} reported sleep per night. Live research uses your age, daily social media time and frequency answers. Plan details and recorded nights are not sent.`:'No current assessment is available. The guidance below is general; no age, sleep duration or disruption answers have been assumed.';
  loadShieldResearch(next,research,el);
 }
 shieldSummaryReset=()=>{summaryAge=undefined;renderSleepSummary();};
 shieldRefreshContext=refreshContext;refreshContext(result);
}

async function loadShieldResearch(result,root,el){
 const id=++shieldResearchId;shieldResearchAbort?.abort();const controller=new AbortController();shieldResearchAbort=controller;const timeout=setTimeout(()=>controller.abort(),50000);
 function fallback(notice){root.replaceChildren(el('p',notice,'goal-note'));const p=el('p','Previously verified general guidance: CDC includes switching off electronic devices before bedtime among its sleep-habit tips. This is general education, not a personalized sleep-duration recommendation.','goal-note'),a=el('a','CDC · About Sleep · Read Source');a.href='https://www.cdc.gov/sleep/about/index.html';a.target='_blank';a.rel='noopener noreferrer';root.append(p,a);}
 if(!result){fallback('General guidance from previously verified sources. Complete a check-in for personalized research context.');clearTimeout(timeout);return;}
 fallback('Checking current sleep sources…');
 try{const context=healthSearchContext(result);const response=await fetch('/api/health-information',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',signal:controller.signal,body:JSON.stringify({...context,sleepShield:{age:result.age,prebed:result.prebed}})});const data=await response.json();if(id!==shieldResearchId)return;if(!response.ok||!Array.isArray(data.benefits)||!data.benefits.length||!Array.isArray(data.risks)||!Number.isFinite(Date.parse(data.checkedAt)))throw Error('Unavailable');const fragment=document.createDocumentFragment();fragment.append(el('p','Current sleep sources checked for this assessment · '+new Date(data.checkedAt).toLocaleString(),'goal-note'));const items=result.reasons.length?[...data.benefits,...data.risks].slice(0,4):data.benefits.slice(0,3);for(const item of items){if(typeof item.statement!=='string'||typeof item.population!=='string'||typeof item.applicability!=='string'||!Array.isArray(item.sources)||!item.sources.length)throw Error('Malformed');const card=el('div',undefined,'shield-research-card');card.append(el('p',item.statement),el('p',`Evidence population: ${item.population}. ${item.applicability}`,'goal-note'));for(const s of item.sources){const url=new URL(s.url);if(url.protocol!=='https:'||typeof s.organization!=='string'||typeof s.title!=='string')throw Error('Malformed source');card.append(el('p',`${s.organization} — ${s.title}${s.date?' · '+s.date:' · Date not available'}`,'goal-note'));const a=el('a','Read Source');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}fragment.append(card);}root.replaceChildren(fragment);}catch{if(id===shieldResearchId)fallback('Live sleep research could not be refreshed right now.');}finally{clearTimeout(timeout);}
}
if(typeof module!=='undefined')module.exports={validShieldBedtime,savedShieldBedtime,shieldPlan,shieldClock,shieldDuration,validateShieldNight,shieldComparison,shieldVisualData,sevenNightSleepSummary,shieldFeedback,shieldOpportunity};


