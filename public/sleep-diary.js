'use strict';
(function(){
 if(typeof document==='undefined')return;
 const K='social-media-sense.sleep-diary.v1';
 let mounted=false;
 function e(tag,text,cls,parent){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;if(parent)parent.append(n);return n;}
 function init(){
  if(mounted)return;
  const root=document.getElementById('sleep-shield-content');if(!root)return;mounted=true;
  const section=e('section',undefined,'shield-diary',root);
  e('h3','Your Multiweek Sleep Diary',undefined,section);
  e('p','Track sleep across actual dates. Charts and suggestions use what you report, not automatic sleep measurements. The older seven-check-in history remains separate.', 'goal-note',section);
  const status=e('p','','shield-error',section);status.setAttribute('role','status');
  const form=e('form',undefined,'shield-diary-form',section);form.noValidate=true;
  function input(label,type,required=false){const wrap=e('label',label,undefined,form),field=e('input',undefined,undefined,wrap);field.type=type;field.required=required;return field;}
  function select(label,options,required=false){const wrap=e('label',label,undefined,form),field=e('select',undefined,undefined,wrap);for(const [value,title] of options){const opt=e('option',title,undefined,field);opt.value=value;}field.required=required;return field;}
  const date=input('Sleep date (when this sleep period began)','date',true);date.max=sleepPatternTools.sleepLocalDate();date.value=date.max;
  const age=input('Age (optional, 15–100; for age-specific context)','number');age.min='15';age.max='100';age.step='1';
  const hours=input('Hours slept','number',true);hours.min='0';hours.max='24';hours.step='1';
  const minutes=input('Additional minutes slept','number',true);minutes.min='0';minutes.max='59';minutes.step='1';
  const rested=select('How rested did you feel?',[['','Choose'],['Rested','Rested'],['Somewhat rested','Somewhat rested'],['Not very rested','Not very rested']],true);
  const asleep=input('Approximate time you fell asleep (optional)','time');
  const awoke=input('Approximate time you woke up (optional)','time');
  const interruption=select('Was your sleep significantly interrupted? (optional)',[['','Not recorded'],['No','No'],['Yes','Yes']]);
  const followed=select('Did you follow your wind-down plan? (optional)',[['','Not recorded'],['Yes','Yes'],['Partly','Partly'],['No','No']]);
  const notes=e('label','Optional short note',undefined,form),note=e('textarea',undefined,undefined,notes);note.rows=2;note.maxLength=240;
  const buttons=e('div',undefined,'shield-diary-actions',form),save=e('button','Save This Night','goal-button',buttons);save.type='submit';
  const cancel=e('button','Cancel Edit','goal-button goal-secondary',buttons);cancel.type='button';cancel.hidden=true;
  const error=e('p','','shield-error',form);error.setAttribute('role','alert');
  const feedback=e('section',undefined,'shield-pattern-feedback',section);feedback.setAttribute('role','status');
  const chartArea=e('div',undefined,'shield-pattern-charts',section);
  const history=e('details',undefined,'shield-disclosure',section);e('summary','Review and Edit Dated Entries',undefined,history);
  const list=e('div',undefined,'shield-diary-list',history);
  const clear=e('button','Clear Dated Sleep Diary','goal-button goal-secondary',history);clear.type='button';
  e('p','Dated records stay only in this browser. Older seven-slot Sleep Shield records are not included in this diary and will not be erased here. You can review them in the original View My Progress section.', 'goal-note',section);
  let entries=[],editing=null,readable=true,storedAge=null;
  try{const raw=localStorage.getItem(K);if(raw){const data=JSON.parse(raw);if(!data||!Array.isArray(data.entries))throw Error('Invalid diary');entries=data.entries;storedAge=data.age??null;}}catch{readable=false;status.textContent='Saved sleep diary data could not be read. Nothing will be overwritten.';}
  if(storedAge!==null)age.value=storedAge;
  function write(next,ageValue){
   if(!readable)return false;
   try{localStorage.setItem(K,JSON.stringify({version:1,entries:next,age:ageValue}));entries=next;storedAge=ageValue;status.textContent='Saved on this device.';return true;}
   catch{status.textContent='This browser could not save the diary. Previous records remain unchanged.';return false;}
  }
  function reset(){editing=null;date.value=sleepPatternTools.sleepLocalDate();date.max=date.value;hours.value='';minutes.value='';rested.value='';asleep.value='';awoke.value='';interruption.value='';followed.value='';note.value='';save.textContent='Save This Night';cancel.hidden=true;error.textContent='';}
  function timeText(raw){if(!raw)return 'Not recorded';const [h,m]=raw.split(':').map(Number);return (h%12||12)+':'+String(m).padStart(2,'0')+' '+(h>=12?'PM':'AM');}
  function render(){
   const today=sleepPatternTools.sleepLocalDate();date.max=today;
   const ageValue=Number.isInteger(Number(storedAge))&&Number(storedAge)>=15&&Number(storedAge)<=100?Number(storedAge):null;
   const a=sleepPatternTools.sleepDiaryAnalyze(entries,ageValue,today);
   feedback.replaceChildren();feedback.dataset.kind=a.kind;
   e('h4',a.title,undefined,feedback);e('p',a.text,undefined,feedback);e('p',a.tip,'goal-note',feedback);
   if(a.kind==='celebrate')feedback.dataset.celebrated='true';else delete feedback.dataset.celebrated;
   chartArea.replaceChildren();
   const recentStart=sleepPatternTools.sleepDateOrdinal(today)-27;
   const recent=entries.filter(sleepPatternTools.sleepDiaryValid).filter(x=>{const n=sleepPatternTools.sleepDateOrdinal(x.sleepDate);return n>=recentStart&&n<=sleepPatternTools.sleepDateOrdinal(today)}).sort((x,y)=>x.sleepDate.localeCompare(y.sleepDate));
   const byDate=new Map(recent.map(x=>[x.sleepDate,x]));
   const dur=e('section',undefined,'shield-pattern-chart',chartArea);e('h4','Sleep Duration: Last 28 Nights',undefined,dur);
   const bars=e('div',undefined,'shield-pattern-duration',dur);
   const scale=Math.max(600,...recent.map(x=>x.sleepMinutes));
   for(let i=0;i<28;i++){const ord=recentStart+i,day=new Date(ord*86400000).toISOString().slice(0,10),item=byDate.get(day),bar=e('div',undefined,'shield-pattern-night',bars);
    const title=e('span',day.slice(5),undefined,bar);title.title=day;
    const track=e('span',undefined,'shield-duration-track',bar);track.setAttribute('aria-hidden','true');if(!item)track.classList.add('unrecorded');const fill=e('span',undefined,'shield-duration-fill',track);fill.style.width=(item?item.sleepMinutes/scale*100:0)+'%';
    e('strong',item?Math.floor(item.sleepMinutes/60)+'h '+String(item.sleepMinutes%60).padStart(2,'0')+'m':'Not recorded',undefined,bar);
   }
   e('p','Bars are self-reported sleep duration; missing dates are not zero sleep. Older entries are preserved in the diary.', 'goal-note',dur);
   const timing=e('section',undefined,'shield-pattern-chart',chartArea);e('h4','Sleep and Wake Times: Recent Entries',undefined,timing);
   const table=e('table',undefined,'shield-pattern-table',timing),thead=e('thead',undefined,undefined,table),tr=e('tr',undefined,undefined,thead);
   ['Sleep date','Fell asleep','Woke up'].forEach(x=>e('th',x,undefined,tr));
   const body=e('tbody',undefined,undefined,table);
   if(!recent.length)e('p','No dated records yet. Record approximate sleep and wake times to explore your schedule.', 'goal-note',timing);
   recent.slice(-14).forEach(x=>{const row=e('tr',undefined,undefined,body);e('td',x.sleepDate,undefined,row);e('td',timeText(x.fellAsleep),undefined,row);e('td',timeText(x.wokeUp),undefined,row);});
   e('p','Times reflect your estimates, not planned bedtime. Midnight crossings and missing time fields are not treated as irregularities by themselves.', 'goal-note',timing);
   const week=e('section',undefined,'shield-pattern-chart',chartArea);e('h4','Weekly Overview',undefined,week);
   for(let w=0;w<4;w++){const end=sleepPatternTools.sleepDateOrdinal(today)-7*w,start=end-6,subset=recent.filter(x=>{const n=sleepPatternTools.sleepDateOrdinal(x.sleepDate);return n>=start&&n<=end});const first=new Date(start*86400000).toISOString().slice(0,10),last=new Date(end*86400000).toISOString().slice(0,10);
    let desc=first+' to '+last+': '+subset.length+' of 7 nights recorded';
    if(subset.length){const vals=subset.map(x=>x.sleepMinutes);desc+=' · '+Math.floor(Math.min(...vals)/60)+'h '+String(Math.min(...vals)%60).padStart(2,'0')+'m to '+Math.floor(Math.max(...vals)/60)+'h '+String(Math.max(...vals)%60).padStart(2,'0')+'m';if(a.reference)desc+=' · '+subset.filter(x=>x.sleepMinutes<a.reference.min).length+' nights below age-based reference';}
    e('p',desc,undefined,week);
   }
   list.replaceChildren();
   entries.slice().sort((a,b)=>String(b.sleepDate).localeCompare(String(a.sleepDate))).forEach(x=>{const row=e('div',undefined,'shield-completed-row',list);e('p',(x.sleepDate||'Invalid date')+' · '+(sleepPatternTools.sleepDiaryValid(x)?Math.floor(x.sleepMinutes/60)+'h '+String(x.sleepMinutes%60).padStart(2,'0')+'m · '+x.rested:'Invalid entry'),undefined,row);
    if(x.note)e('p',x.note,'goal-note',row);
    const editBtn=e('button','Edit '+x.sleepDate,'goal-button goal-secondary',row);editBtn.type='button';editBtn.addEventListener('click',()=>{editing=x.sleepDate;date.value=x.sleepDate;hours.value=Math.floor(x.sleepMinutes/60);minutes.value=x.sleepMinutes%60;rested.value=x.rested;asleep.value=x.fellAsleep||'';awoke.value=x.wokeUp||'';interruption.value=x.interrupted||'';followed.value=x.followed||'';note.value=x.note||'';save.textContent='Update This Night';cancel.hidden=false;form.scrollIntoView?.({block:'nearest'});date.focus();});
   });
  }
  cancel.addEventListener('click',reset);
  form.addEventListener('submit',ev=>{
   ev.preventDefault();error.textContent='';
   const h=Number(hours.value),m=Number(minutes.value),a=age.value.trim(),ageValue=a===''?null:Number(a),sleepDate=date.value;
   if(!readable){error.textContent='Stored diary could not be read. No records were overwritten.';return;}
   if(sleepPatternTools.sleepDateOrdinal(sleepDate)===null||sleepPatternTools.sleepDateOrdinal(sleepDate)>sleepPatternTools.sleepDateOrdinal(sleepPatternTools.sleepLocalDate())){error.textContent='Choose a valid past or current local sleep date.';return;}
   if(hours.value.trim()===''||minutes.value.trim()===''||!Number.isInteger(h)||h<0||h>24||!Number.isInteger(m)||m<0||m>59||h*60+m>1440){error.textContent='Enter sleep hours 0–24 and additional minutes 0–59, totaling no more than 24 hours.';return;}
   if(a!==''&&(!Number.isInteger(ageValue)||ageValue<15||ageValue>100)){error.textContent='Enter a whole-number age between 15 and 100, or leave age blank.';return;}
   const record={sleepDate,sleepMinutes:h*60+m,rested:rested.value,fellAsleep:asleep.value,wokeUp:awoke.value,interrupted:interruption.value,followed:followed.value,note:note.value.slice(0,240)};
   if(!sleepPatternTools.sleepDiaryValid(record)){error.textContent='Choose how rested you felt and check any optional times and responses.';return;}
   if(entries.some(x=>x.sleepDate===sleepDate&&x.sleepDate!==editing)){error.textContent='A check-in already exists for that sleep date. Edit that entry instead.';return;}
   if(editing&&!entries.some(x=>x.sleepDate===editing)){error.textContent='The original entry no longer exists.';return;}
   const next=editing?entries.map(x=>x.sleepDate===editing?record:x):[...entries,record];
   if(!write(next,ageValue)){error.textContent=status.textContent;return;}
   reset();render();
  });
  clear.addEventListener('click',()=>{if(!readable)return;if(!confirm('Clear dated Sleep Shield diary records? The original seven check-ins will remain. This cannot be undone.'))return;if(write([],storedAge)){reset();render();}});
  render();
 }
 document.addEventListener('view:before',ev=>{if(ev.detail.view==='shield')init();});
})();
