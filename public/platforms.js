'use strict';
const socialPlatforms=['Facebook','Instagram','WhatsApp','Messenger','LinkedIn','X (Twitter)','Threads','YouTube','TikTok','Snapchat','Twitch','Telegram','Discord','Reddit','Pinterest'];
function platformTime(minutes){const h=Math.floor(minutes/60),m=minutes%60;return (h?h+'h':'')+(h&&m?' ':'')+(m?m+'m':'')||'0m';}
function platformSummary(entries){
 const errors={},platforms=[];let total=0;
 entries.forEach((entry,index)=>{
  const name=String(entry.name||'').trim().slice(0,60)||'Other';
  const hours=Number(entry.hours),extra=Number(entry.minutes),minutes=hours*60+extra;
  if(entry.hours===undefined||entry.hours===null||String(entry.hours).trim()===''||entry.minutes===undefined||entry.minutes===null||String(entry.minutes).trim()===''||!Number.isInteger(hours)||!Number.isInteger(extra)||hours<0||extra<0||extra>59||minutes>720||minutes%5!==0)errors[`platform-${index}-time`]=`Choose ${name} time from 0 minutes to 12 hours in 5-minute steps.`;
  else{total+=minutes;if(minutes>0)platforms.push({name,minutes});}
 });
 const fieldsValid=Object.keys(errors).length===0;
 if(fieldsValid&&total>1440)errors['platform-total']='Your entries add up to more than 24 hours in one day. Some app usage may overlap. Adjust the times so your total reflects your actual day.';
 return {total,errors,fieldsValid,platforms:platforms.sort((a,b)=>b.minutes-a.minutes)};
}
function setupPlatformInputs(){
 const get=id=>document.getElementById(id),list=get('platform-list');let rows=[];
 // Visual feedback only: never change the range value or intercept native input.
 function clearReferenceFeedback(row){
  for(const timer of row.feedbackTimers||[])clearTimeout(timer);
  row.feedbackTimers=[];
  row.slider.classList.remove('reference-press','reference-rebound');
  row.marker30.classList.remove('reference-hit');row.marker2h.classList.remove('reference-hit');
 }
 function referenceFeedback(row,previous){
  const minutes=Number(row.slider.value);
  if(previous===minutes)return;
  clearReferenceFeedback(row);
  if(row.nameInput||(minutes!==30&&minutes!==120))return;
  const marker=minutes===30?row.marker30:row.marker2h;
  marker.classList.add('reference-hit');
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   row.slider.classList.add('reference-press');
   row.feedbackTimers.push(setTimeout(()=>{row.slider.classList.remove('reference-press');row.slider.classList.add('reference-rebound');},70));
   row.feedbackTimers.push(setTimeout(()=>row.slider.classList.remove('reference-rebound'),160));
  }
  row.feedbackTimers.push(setTimeout(()=>clearReferenceFeedback(row),420));
 }
 function addRow(name,custom=false){
  const index=rows.length,row=document.createElement('div');row.className='platform-row platform-slider-row';
  const heading=document.createElement('div');heading.className='platform-heading';
  const title=document.createElement('div');title.className='platform-name';let nameInput=null;
  if(custom){const label=document.createElement('label');label.textContent=index===socialPlatforms.length?'Other':'Another platform';nameInput=document.createElement('input');nameInput.type='text';nameInput.maxLength=60;nameInput.placeholder='Platform name (optional)';nameInput.value=name==='Other'?'':name;label.append(nameInput);title.append(label);}else title.textContent=name;
  const output=document.createElement('output');output.className='platform-selected-time';output.setAttribute('for',`platform-${index}-time`);output.textContent='0m';heading.append(title,output);row.append(heading);
  const label=document.createElement('label');const caption=document.createElement('span');caption.className='sr-only';caption.textContent=`${name} daily usage`;
  const slider=document.createElement('input');slider.type='range';slider.className='platform-slider';slider.id=`platform-${index}-time`;slider.min='0';slider.max='720';slider.step='5';slider.value='0';slider.setAttribute('aria-label',`${name} daily usage`);label.append(caption,slider);row.append(label);
  const limits=document.createElement('div');limits.className='platform-slider-limits';const startLabel=document.createElement('span');startLabel.className='platform-scale-start';startLabel.textContent='0m';const marker30=document.createElement('span');marker30.className='platform-ref-marker ref-30';marker30.textContent='30m';const marker2h=document.createElement('span');marker2h.className='platform-ref-marker ref-2h';marker2h.textContent='2h';const endLabel=document.createElement('span');endLabel.className='platform-scale-end';endLabel.textContent='12h';limits.append(startLabel,marker30,marker2h,endLabel);row.append(limits);
  if(custom){marker30.hidden=true;marker2h.hidden=true;}
  list.append(row);rows.push({name,nameInput,slider,output,marker30,marker2h,previousMinutes:0,feedbackTimers:[]});return nameInput;
 }
 function readEntries(){return rows.map(row=>{const minutes=Number(row.slider.value);return {name:row.nameInput?row.nameInput.value||'Other':row.name,hours:Math.floor(minutes/60),minutes:minutes%60};});}
 function refresh(){
  for(const row of rows){const minutes=Number(row.slider.value),h=Math.floor(minutes/60),m=minutes%60;row.output.textContent=platformTime(minutes);row.slider.style.setProperty('--usage',`${minutes/720*100}%`);row.slider.setAttribute('aria-label',`${row.nameInput?row.nameInput.value.trim()||'Other':row.name} daily usage`);row.slider.setAttribute('aria-valuetext',`${h} hours ${m} minutes per day`);row.previousMinutes=minutes;}
  const summary=platformSummary(readEntries());get('platform-total').textContent=summary.fieldsValid?`Total reported social media time: ${platformTime(summary.total)} / 24h`:'Total reported social media time: check the invalid app times.';
  const over=summary.fieldsValid&&summary.total>1440,near=summary.fieldsValid&&summary.total>=1200&&!over;
  get('platform-total-wrap').classList.toggle('near-limit',near);get('platform-total-wrap').classList.toggle('over-limit',over);
  get('platform-limit-status').hidden=!near;get('platform-limit-status').textContent=summary.total===1440?'At the 24-hour daily limit.':'Approaching the 24-hour daily limit.';
  get('platform-overage').hidden=!over;get('platform-overage').textContent=over?`Currently ${platformTime(summary.total-1440)} over the daily limit.`:'';
  get('platform-limit-error').hidden=!summary.errors['platform-total'];get('platform-limit-error').textContent=summary.errors['platform-total']||'';
 }
 function reset(){for(const row of rows)clearReferenceFeedback(row);list.replaceChildren();rows=[];for(const name of socialPlatforms)addRow(name);addRow('Other',true);}
 function setEntries(entries){
  const summary=platformSummary(entries);if(!summary.fieldsValid)throw new Error(Object.values(summary.errors).join(' '));
  reset();for(const entry of entries){let row=rows.find(r=>!r.nameInput&&r.name===entry.name);if(!row){row=rows.find(r=>r.nameInput&&!r.nameInput.value&&r.slider.value==='0');if(!row){addRow(entry.name||'Other',true);row=rows.at(-1);}row.nameInput.value=entry.name||'Other';}row.slider.value=String(Number(entry.hours)*60+Number(entry.minutes));}refresh();
 }
 list.addEventListener('input',event=>{const row=rows.find(item=>item.slider===event.target),previous=row?.previousMinutes;refresh();if(row)referenceFeedback(row,previous);});get('add-platform').addEventListener('click',()=>{const nameInput=addRow('Other',true);refresh();nameInput.focus();});
 reset();refresh();return {readEntries,setEntries};
}
if(typeof module!=='undefined')module.exports={platformSummary,socialPlatforms,platformTime};

