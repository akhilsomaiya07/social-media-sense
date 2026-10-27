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
// Native range positions are presentation coordinates, never stored usage minutes.
// Each third of the track covers 0–30m, 30–120m, then 120–720m.
// 1080 positions let every 5-minute selection map to an exact integer position.
function platformPosition(minutes){return minutes<=30?minutes*12:minutes<=120?360+(minutes-30)*4:720+(minutes-120)*0.6;}
function platformMinutes(position){
 const p=Math.max(0,Math.min(1080,Number(position)));
 const minutes=p<=360?p/12:p<=720?30+(p-360)/4:120+(p-720)/0.6;
 return Math.round(minutes/5)*5;
}
function setupPlatformInputs(){
 const get=id=>document.getElementById(id),list=get('platform-list');let rows=[],pointerSlider=null,nextId=0;
 const rowMinutes=row=>row.nameInput?Number(row.slider.value):platformMinutes(row.slider.value);
 const setMinutes=(row,minutes)=>{row.slider.value=String(row.nameInput?minutes:platformPosition(minutes));};
 // Feedback observes actual minutes, not nonlinear presentation coordinates.
 function clearReferenceFeedback(row){
  for(const timer of row.feedbackTimers||[])clearTimeout(timer);
  row.feedbackTimers=[];
  row.slider.classList.remove('reference-press','reference-rebound');
  row.marker30.classList.remove('reference-hit');row.marker2h.classList.remove('reference-hit');
 }
 function referenceFeedback(row,previous){
  const minutes=rowMinutes(row);
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
  const index=nextId++,row=document.createElement('div');row.className='platform-row platform-slider-row';
  const heading=document.createElement('div');heading.className='platform-heading';
  const title=document.createElement('div');title.className='platform-name';let nameInput=null;
  if(custom){const label=document.createElement('label');label.textContent=index===socialPlatforms.length?'Other':'Another platform';nameInput=document.createElement('input');nameInput.type='text';nameInput.maxLength=60;nameInput.placeholder='Platform name (optional)';nameInput.value=name==='Other'?'':name;label.append(nameInput);title.append(label);}else title.textContent=name;
  const output=document.createElement('output');output.className='platform-selected-time';output.setAttribute('for',`platform-${index}-time`);output.textContent='0m';heading.append(title,output);row.append(heading);
  const label=document.createElement('label');const caption=document.createElement('span');caption.className='sr-only';caption.textContent=`${name} daily usage`;
  const slider=document.createElement('input');slider.type='range';slider.className='platform-slider';slider.id=`platform-${index}-time`;slider.min='0';slider.max=custom?'720':'1080';slider.step=custom?'5':'1';slider.value='0';slider.setAttribute('aria-label',`${name} daily usage`);slider.setAttribute('aria-valuemin','0');slider.setAttribute('aria-valuemax','720');if(!custom)slider.setAttribute('aria-describedby','platform-scale-help');label.append(caption,slider);row.append(label);
  const limits=document.createElement('div');limits.className='platform-slider-limits';const startLabel=document.createElement('span');startLabel.className='platform-scale-start';startLabel.textContent='0m';const marker30=document.createElement('span');marker30.className='platform-ref-marker ref-30';marker30.textContent='30m';const marker2h=document.createElement('span');marker2h.className='platform-ref-marker ref-2h';marker2h.textContent='2h';const endLabel=document.createElement('span');endLabel.className='platform-scale-end';endLabel.textContent='12h';limits.append(startLabel,marker30,marker2h,endLabel);row.append(limits);
  if(custom){marker30.hidden=true;marker2h.hidden=true;limits.classList.add('platform-custom-scale');}
  const entry={name,nameInput,slider,output,marker30,marker2h,previousMinutes:0,feedbackTimers:[]};
  if(custom){
   row.classList.add('platform-custom-row');
   const remove=document.createElement('button');remove.type='button';remove.className='platform-remove';remove.textContent='Remove';entry.remove=remove;
   const confirmation=document.createElement('div');confirmation.className='platform-remove-confirm';confirmation.id=`platform-${index}-confirmation`;confirmation.hidden=true;confirmation.setAttribute('role','group');
   const message=document.createElement('p');message.id=`platform-${index}-remove-message`;message.textContent='Remove this platform? Its entered name and usage time will be removed from this check-in.';confirmation.setAttribute('aria-labelledby',message.id);
   const cancel=document.createElement('button');cancel.type='button';cancel.className='platform-remove';cancel.textContent='Cancel';
   const confirm=document.createElement('button');confirm.type='button';confirm.className='platform-remove';confirm.textContent='Remove Platform';
   remove.setAttribute('aria-controls',confirmation.id);remove.setAttribute('aria-expanded','false');
   function dismiss(){confirmation.hidden=true;remove.setAttribute('aria-expanded','false');remove.focus();}
   function removeEntry(){
    clearReferenceFeedback(entry);if(pointerSlider===slider)pointerSlider=null;
    const limitMessage=get('platform-limit-error').textContent;
    rows=rows.filter(item=>item!==entry);row.remove();refresh();
    if(get('platform-limit-error').hidden){
     get('platform-total-error')?.remove();get('platform-total').removeAttribute('aria-invalid');get('platform-total').removeAttribute('aria-describedby');
     const error=get('error');if(error&&limitMessage&&error.textContent===limitMessage)error.hidden=true;
    }
    get('add-platform').focus();list.dispatchEvent(new Event('input',{bubbles:true}));
   }
   remove.addEventListener('click',()=>{if(!nameInput.value.trim()&&rowMinutes(entry)===0){removeEntry();return;}confirmation.hidden=false;remove.setAttribute('aria-expanded','true');cancel.focus();});
   cancel.addEventListener('click',dismiss);confirm.addEventListener('click',removeEntry);
   confirmation.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismiss();}});
   confirmation.append(message,cancel,confirm);row.append(remove,confirmation);
  }
  list.append(row);rows.push(entry);return nameInput;
 }
 function readEntries(){return rows.map(row=>{const minutes=rowMinutes(row);return {name:row.nameInput?row.nameInput.value||'Other':row.name,hours:Math.floor(minutes/60),minutes:minutes%60};});}
 function refresh(){
  const previousLimitMessage=get('platform-limit-error').textContent;
  for(const row of rows){if(row.remove)row.remove.setAttribute('aria-label',row.nameInput.value.trim()?`Remove custom platform: ${row.nameInput.value.trim()}`:'Remove unnamed custom platform');const minutes=rowMinutes(row),h=Math.floor(minutes/60),m=minutes%60;row.output.textContent=platformTime(minutes);row.slider.style.setProperty('--usage',`${Number(row.slider.value)/Number(row.slider.max)*100}%`);row.slider.setAttribute('aria-label',`${row.nameInput?row.nameInput.value.trim()||'Other':row.name} daily usage`);row.slider.setAttribute('aria-valuenow',String(minutes));row.slider.setAttribute('aria-valuetext',`${h} hours ${m} minutes per day`);row.previousMinutes=minutes;}
  const summary=platformSummary(readEntries());get('platform-total').textContent=summary.fieldsValid?`Total reported social media time: ${platformTime(summary.total)} / 24h`:'Total reported social media time: check the invalid app times.';
  const over=summary.fieldsValid&&summary.total>1440,near=summary.fieldsValid&&summary.total>=1200&&!over;
  get('platform-total-wrap').classList.toggle('near-limit',near);get('platform-total-wrap').classList.toggle('over-limit',over);
  get('platform-limit-status').hidden=!near;get('platform-limit-status').textContent=summary.total===1440?'At the 24-hour daily limit.':'Approaching the 24-hour daily limit.';
  get('platform-overage').hidden=!over;get('platform-overage').textContent=over?`Currently ${platformTime(summary.total-1440)} over the daily limit.`:'';
  const limitError=get('platform-limit-error');limitError.hidden=!summary.errors['platform-total'];limitError.textContent=summary.errors['platform-total']||'';
  // Remove only the stale platform-limit text from the shared alert. Other
  // field errors may have been reported at the same time and must remain.
  if(previousLimitMessage&&limitError.hidden){
   const error=get('error');
   if(error&&error.textContent.includes(previousLimitMessage)){
    error.textContent=error.textContent.replace(previousLimitMessage,'').trim();
    error.hidden=!error.textContent;
   }
  }
 }
 function reset(includeOther=true){for(const row of rows)clearReferenceFeedback(row);list.replaceChildren();rows=[];nextId=0;for(const name of socialPlatforms)addRow(name);if(includeOther)addRow('Other',true);refresh();}
 function setEntries(entries){
  const summary=platformSummary(entries);if(!summary.fieldsValid)throw new Error(Object.values(summary.errors).join(' '));
  reset(false);for(const entry of entries){let row=rows.find(r=>!r.nameInput&&r.name===entry.name);if(!row){row=rows.find(r=>r.nameInput&&!r.nameInput.value&&r.slider.value==='0');if(!row){addRow(entry.name||'Other',true);row=rows.at(-1);}row.nameInput.value=entry.name||'Other';}setMinutes(row,Number(entry.hours)*60+Number(entry.minutes));}refresh();
 }
 // Keep native pointer/touch dragging; snap its position to an actual 5-minute value.
 list.addEventListener('pointerdown',event=>{pointerSlider=event.target.closest('.platform-slider');});
 for(const type of ['pointerup','pointercancel','blur'])window.addEventListener(type,()=>{pointerSlider=null;});
 list.addEventListener('input',event=>{
  const row=rows.find(item=>item.slider===event.target),previous=row?.previousMinutes;
  if(row&&!row.nameInput){
   const position=Number(row.slider.value);let minutes=platformMinutes(position);
   // Native assistive-technology increment/decrement actions can use the raw
   // range step. Ensure these also advance 5 minutes in the expanded sections.
   if(pointerSlider!==row.slider&&minutes===previous&&position!==platformPosition(previous))minutes=Math.max(0,Math.min(720,previous+Math.sign(position-platformPosition(previous))*5));
   setMinutes(row,minutes);
  }
  refresh();if(row)referenceFeedback(row,previous);
 });
 list.addEventListener('keydown',event=>{
  const row=rows.find(item=>item.slider===event.target);if(!row||row.nameInput)return;
  const current=rowMinutes(row),values={ArrowRight:current+5,ArrowUp:current+5,ArrowLeft:current-5,ArrowDown:current-5,PageUp:current+60,PageDown:current-60,Home:0,End:720};
  if(!(event.key in values))return;
  event.preventDefault();setMinutes(row,Math.max(0,Math.min(720,values[event.key])));
  row.slider.dispatchEvent(new Event('input',{bubbles:true}));row.slider.dispatchEvent(new Event('change',{bubbles:true}));
 });get('add-platform').addEventListener('click',()=>{const nameInput=addRow('Other',true);refresh();nameInput.focus();});
 reset();refresh();return {readEntries,setEntries,reset};
}
if(typeof module!=='undefined')module.exports={platformSummary,socialPlatforms,platformTime,platformPosition,platformMinutes};



