'use strict';
const questions = [
 {id:'bedtime',text:'keep you up later than you intended?',reason:'You said social media kept you up later than intended.'},
 {id:'tasks',text:'interrupt school, work, or everyday responsibilities?',reason:'You said social media interrupted your everyday responsibilities.'},
 {id:'movement',text:'take time away from physical activity?',reason:'You said social media took time away from physical activity.'},
 {id:'people',text:'take time away from people you wanted to spend time with?',reason:'You said social media took time away from people you wanted to spend time with.'},
 {id:'longer',text:'keep you scrolling longer than you planned?',reason:'You said you spent longer scrolling than you planned.'}
];
// Format validation only: Unicode letters/marks and single separators between name parts.
function normalizeName(value){return typeof value==='string'?value.normalize('NFC').trim().replace(/\s+/gu,' '):'';}
function nameValidation(value){
 const name=normalizeName(value);
 if(!name)return {message:'Enter your name or nickname to continue.'};
 if(!/^(?:\p{L}[\p{L}\p{M}]*)(?:[ \-'’](?:\p{L}[\p{L}\p{M}]*))*$/u.test(name))return {message:'Use letters only. Spaces, hyphens, and apostrophes are allowed.'};
 if(name.length>200)return {message:'Use 200 characters or fewer for your name or nickname.'};
 return null;
}
// Shared by submission, blur feedback, and non-DOM assessment callers.
function ageValidation(value){
 if(value===undefined||value===null||String(value).trim()==='')return {message:'Please enter your age to continue.'};
 if(!['string','number'].includes(typeof value)||!Number.isFinite(Number(value)))return {message:'Please enter a valid whole-number age between 15 and 100.'};
 const age=Number(value);
 if(!Number.isInteger(age))return {message:'Please enter your age in whole years.'};
 if(typeof value==='string'&&!/^[+-]?\d+$/.test(value.trim()))return {message:'Please enter a valid whole-number age between 15 and 100.'};
 if(age<15)return {title:'Age requirement not met',message:'Social Media Sense is designed for people ages 15–100. Please enter an eligible age to continue.'};
 if(age>100)return {title:'Age outside supported range',message:'Social Media Sense currently supports ages 15–100. Please check the age you entered.'};
 return null;
}
function calculate(data){
 const errors={};
 const invalid=(key,message)=>{errors[key]=message};
 const integer=(key,min,max,label)=>{const value=data[key];if(value===undefined||value===null||String(value).trim()===''||!Number.isInteger(Number(value))||Number(value)<min||Number(value)>max)invalid(key,label);return Number(value)};
 const nameError=nameValidation(data.name);if(nameError)invalid('name',nameError.message);
 const age=Number(data.age),ageError=ageValidation(data.age);
 if(ageError)invalid('age',ageError.message);
 const hours=integer('hours',0,24,'Enter social media hours from 0 to 24. Use 0 if none.');
 const minutes=integer('minutes',0,59,'Enter social media minutes from 0 to 59. Use 0 if none.');
 const daily=hours*60+minutes;
 const sleep=Number(data.sleep);
 if(data.sleep===undefined||data.sleep===null||String(data.sleep).trim()===''||!Number.isFinite(sleep)||sleep<0||sleep>24)invalid('sleep','Enter sleep hours from 0 to 24.');
 else if(Math.abs(sleep*60-Math.round(sleep*60))>1e-8)invalid('sleep','Enter sleep time in whole minutes.');
 const activity=integer('activity',0,1440,'Enter physical activity from 0 to 1,440 whole minutes per day.');
 const reasons=[];for(const q of questions){if(!['Never','Sometimes','Often'].includes(data[q.id]))invalid(q.id,`Choose Never, Sometimes, or Often: How often did social media ${q.text}`);else if(data[q.id]!=='Never')reasons.push({text:q.reason,frequency:data[q.id]});}
 const timeValid=!errors.hours&&!errors.minutes;
 if(timeValid&&daily>1440)invalid('hours','Social media time cannot exceed 24 hours per day.');
 if(timeValid&&daily===0&&reasons.length)invalid('hours','You entered no daily use but reported social media interruptions. Enter a representative daily average, or review your answers.');
 if(Object.keys(errors).length){const error=new Error([...new Set(Object.values(errors))].join(' '));error.fields=errors;throw error;}

 return {name:normalizeName(data.name),age,sleep,activity,daily,weekly:daily*7,yearly:daily*365,reasons,worthReviewing:reasons.length>0};
}
function calculateWithPlatforms(data){
 if(!data.platforms)return calculate(data);
 const summary=platformSummary(data.platforms),errors={...summary.errors};let result;
 try{result=calculate({...data,hours:Math.floor(summary.total/60),minutes:summary.total%60});}catch(error){
  if(!error.fields)throw error;
  for(const [key,message] of Object.entries(error.fields)){
   if(key==='hours'||key==='minutes'){if(!Object.keys(summary.errors).length)errors['platform-total']=message;}
   else errors[key]=message;
  }
 }
 if(Object.keys(errors).length){const error=new Error([...new Set(Object.values(errors))].join(' '));error.fields=errors;throw error;}
 return {...result,platforms:summary.platforms};
}
function routineTime(data,prefix){
 const errors={},label=prefix==='sleep'?'sleep':'physical activity';
 for(const [part,max] of [['hours',24],['minutes',59]]){
  const key=prefix+'-'+part,value=data[key];
  if(value===undefined||value===null||String(value).trim()===''||!Number.isInteger(Number(value))||Number(value)<0||Number(value)>max)errors[key]=`Enter ${label} ${part} from 0 to ${max}. Use whole numbers.`;
 }
 const total=Number(data[prefix+'-hours'])*60+Number(data[prefix+'-minutes']);
 if(!Object.keys(errors).length&&total>1440)errors[prefix+'-hours']=prefix==='sleep'?'Sleep time cannot exceed 24 hours per night.':'Physical activity cannot exceed 24 hours per day.';
 return {total,errors};
}
function calculateWithRoutine(data){
 const sleep=routineTime(data,'sleep'),activity=routineTime(data,'activity'),errors={...sleep.errors,...activity.errors};let result;
 if(!['Never','Sometimes','Often'].includes(data.prebed))errors.prebed='Choose Never, Sometimes, or Often for social media use before sleep.';
 try{result=calculateWithPlatforms({...data,sleep:Object.keys(sleep.errors).length?undefined:sleep.total/60,activity:Object.keys(activity.errors).length?undefined:activity.total});}
 catch(error){
  if(!error.fields)throw error;
  for(const [key,message] of Object.entries(error.fields)){
   if(key==='sleep'){if(!Object.keys(sleep.errors).length)errors['sleep-hours']=message;}
   else if(key==='activity'){if(!Object.keys(activity.errors).length)errors['activity-hours']=message;}
   else errors[key]=message;
  }
 }
 if(Object.keys(errors).length){const error=new Error([...new Set(Object.values(errors))].join(' '));error.fields=errors;throw error;}
 return {...result,sleepBedtime:data['sleep-bedtime'],prebed:data.prebed};
}
function duration(minutes){const h=Math.floor(minutes/60),m=minutes%60;return (h?h.toLocaleString('en-US')+'h':'')+(h&&m?' ':'')+(m?m+'m':'')||'0m'}
if(typeof module!=='undefined')module.exports={normalizeName,nameValidation,ageValidation,calculate,calculateWithPlatforms,calculateWithRoutine,routineTime,duration};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id), form=$('checkin');let latest=null;
 const platformUI=setupPlatformInputs();
 $('questions').innerHTML=questions.map(q=>`<fieldset class="question"><legend>${q.text}</legend><div class="choices">${['Never','Sometimes','Often'].map((v,i)=>`<label class="choice"><input type="radio" name="${q.id}" value="${v}" required><span>${v}</span></label>`).join('')}</div></fieldset>`).join('');
 $('questions').firstElementChild.after($('prebed-question'));
 function clearFieldErrors(preserveAge=false){
  for(const node of form.querySelectorAll('.field-error'))if(node.id!=='platform-limit-error'&&!(preserveAge&&node.id==='age-error'))node.remove();
  for(const input of form.querySelectorAll('[aria-invalid]')){if(preserveAge&&input.id==='age')continue;input.removeAttribute('aria-invalid');input.removeAttribute('aria-describedby');}
 }
 function showFieldErrors(fields){
  for(const [key,message] of Object.entries(fields||{})){
   const input=$(key)||form.querySelector(`input[name="${key}"]`);
   if(!input)continue;
   if(key==='name'){showNameError(message);continue;}
   if(key==='age'){showAgeError(message);continue;}
   const note=document.createElement('span');note.id=key+'-error';note.className='field-error';note.textContent=message;
   const question=input.closest('.question');
   if(question){question.append(note);for(const radio of question.querySelectorAll('input')){radio.setAttribute('aria-invalid','true');radio.setAttribute('aria-describedby',note.id);}}
   else{(input.closest('label')||input.parentElement).append(note);input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',note.id);}
  }
 }
 function clearNameError(){
  $('name-error')?.remove();$('name').removeAttribute('aria-invalid');$('name').removeAttribute('aria-describedby');
 }
 function showNameError(message){
  if($('name-error')?.textContent===message)return;
  clearNameError();const note=document.createElement('span');note.id='name-error';note.className='field-error';note.setAttribute('role','alert');note.setAttribute('aria-atomic','true');note.textContent=message;
  $('name').closest('label').append(note);$('name').setAttribute('aria-invalid','true');$('name').setAttribute('aria-describedby',note.id);
 }
 $('name').addEventListener('input',event=>{
  if(event.isComposing)return;
  const error=nameValidation($('name').value);
  if(!error)clearNameError();else if(normalizeName($('name').value)||$('name-error'))showNameError(error.message);
 });
 $('name').addEventListener('compositionend',()=>$('name').dispatchEvent(new Event('input')));
 $('name').addEventListener('blur',()=>{const error=nameValidation($('name').value);if(error)showNameError(error.message);else{$('name').value=normalizeName($('name').value);clearNameError();}});
 function ageValue(){return $('age').validity.badInput?NaN:$('age').value;}
 function clearAgeError(){
  $('age-error')?.remove();$('age').removeAttribute('aria-invalid');$('age').removeAttribute('aria-describedby');
 }
 function showAgeError(message){
  // Reuse an existing alert on blur followed by submit; do not announce it twice.
  if($('age-error')?.dataset.message===message)return;
  clearAgeError();
  const note=document.createElement('span');note.id='age-error';note.className='field-error age-warning';note.dataset.message=message;note.setAttribute('role','alert');note.setAttribute('aria-atomic','true');
  const icon=document.createElement('span');icon.className='age-warning-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" focusable="false"><path d="M12 3 2 21h20Z"/><path d="M12 9v5m0 3v1"/></svg>';
  const title=document.createElement('strong');title.className='age-warning-title';title.textContent=ageValidation(ageValue())?.title||'Check your age';
  const body=document.createElement('span');body.textContent=message;
  note.append(icon,title,body);$('age').closest('.two').append(note);$('age').setAttribute('aria-invalid','true');$('age').setAttribute('aria-describedby',note.id);
 }
 $('age').addEventListener('blur',()=>{const error=ageValidation(ageValue());if(error)showAgeError(error.message);else clearAgeError();});
 $('age').addEventListener('input',()=>{if(!ageValidation(ageValue()))clearAgeError();});
 function read(){const data={};for(const id of ['name','age','sleep-hours','sleep-minutes','activity-hours','activity-minutes'])data[id]=$(id).value;data.age=ageValue();data.prebed=form.querySelector('input[name="prebed"]:checked')?.value;data.platforms=platformUI.readEntries();for(const q of questions)data[q.id]=form.querySelector(`input[name="${q.id}"]:checked`)?.value;return data}
 function refreshRoutineTimes(){
  const data=read();
  const reference=sleepReference(data.age),sleepTime=routineTime(data,'sleep');
  $('sleep-age-reference').hidden=!reference;
  $('sleep-age-guidance').textContent=reference?.guidance||'';
  $('sleep-age-scope').textContent=reference?.group==='Teen'?'This reference covers total sleep over 24 hours. This check-in asks about nighttime sleep only, so daytime naps may also matter.':'';
  const context=Object.keys(sleepTime.errors).length?null:sleepContext(data.age,sleepTime.total);
  $('sleep-age-feedback').textContent=context?.text||'';
  const warning=Object.keys(sleepTime.errors).length?null:sleepInputWarning(data.age,sleepTime.total);
  $('sleep-input-warning').hidden=!warning;
  if($('sleep-input-warning-text').textContent!==(warning||''))$('sleep-input-warning-text').textContent=warning||'';

  for(const prefix of ['sleep','activity']){const time=routineTime(data,prefix);$(prefix+'-selected').textContent=Object.keys(time.errors).length?'Enter valid hours and minutes to see your total.':duration(time.total)+(prefix==='sleep'?' per night':' of physical activity per day');}
 }
 for(const id of ['age','sleep-hours','sleep-minutes','activity-hours','activity-minutes'])$(id).addEventListener('input',refreshRoutineTimes);
 document.addEventListener('assessment:step',event=>{if(event.detail.step===3)refreshRoutineTimes();});
 refreshRoutineTimes();
 function render(result){clearFieldErrors();latest=result;$('error').hidden=true;$('state-label').textContent='CHECK-IN COMPLETE';$('result-title').textContent=result.name?`${result.name}, here’s your check-in.`:'Here’s your check-in.';$('result-sub').textContent="Here's a summary of your reported social media time and daily routine.";for(const key of ['daily','weekly','yearly'])$(key).textContent=duration(result[key]);$('day-fill').style.width=(result.daily/1440*100)+'%';$('day-caption').textContent=(result.daily/1440*100).toFixed(1)+'% of a 24-hour day';
 const review=$('review');review.replaceChildren();const heading=document.createElement('h4');heading.textContent=result.worthReviewing?'Some habits may be worth reviewing':'No routine disruption reported';review.append(heading);const explanation=document.createElement('p');explanation.textContent=result.worthReviewing?'Your answers identified routine interruptions. Choose one place to start below.':'Your answers did not identify routine interruptions in this check-in.';review.append(explanation);
 const detail=document.createElement('details'),summary=document.createElement('summary'),list=document.createElement('ul');summary.textContent='Review all my answers';
 for(const q of questions){const item=document.createElement('li');item.textContent='How often did social media '+q.text+' '+(result.reasons.find(r=>r.text===q.reason)?.frequency||'Never');list.append(item);}
 const prebed=document.createElement('li');prebed.textContent='Social media during the hour before bedtime: '+result.prebed;list.append(prebed);detail.append(summary,list);review.append(detail);

 const disclaimer=document.createElement('p');disclaimer.textContent='This is not a diagnosis. The amount of time alone does not determine the result.';review.append(disclaimer);$('context').hidden=false;$('context').textContent=`Your context: age ${result.age} · ${duration(Math.round(result.sleep*60))} of sleep per night · ${result.activity} minutes of activity per day. These details are shown for context, not graded against health targets.`;
 const ranking=$('platform-ranking');ranking.replaceChildren();for(const platform of result.platforms||[]){const item=document.createElement('li');item.textContent=platform.name+' — '+duration(platform.minutes);ranking.append(item);}$('platform-breakdown').hidden=!(result.platforms?.length);
 renderHealthEducation(result);
 renderSleepContext(result);
 renderSleepShield(result);
 document.dispatchEvent(new CustomEvent('checkin:complete',{detail:{report:JSON.parse(JSON.stringify(result)),daily:result.daily,assessment:{age:result.age,name:result.name,sleepBedtime:result.sleepBedtime,prebed:result.prebed,daily:result.daily,worthReviewing:result.worthReviewing,platforms:platformUI.readEntries().map(p=>({name:String(p.name||'Other').trim().slice(0,60)||'Other',minutes:Number(p.hours)*60+Number(p.minutes)})),sleepMinutes:Math.round(result.sleep*60),activityMinutes:result.activity,behaviors:Object.fromEntries(questions.map(q=>[q.id,form.querySelector(`input[name="${q.id}"]:checked`)?.value]))}}}));
 }
 function resetAssessment(){
  latest=null;form.reset();platformUI.reset();refreshRoutineTimes();form.dispatchEvent(new Event('input',{bubbles:true}));
 }
 setupAssessmentFlow({form,read,calculate:calculateWithRoutine,render,clearFieldErrors,showFieldErrors,resetAssessment});

 if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'calculate_social_media_checkin',title:'Calculate social media check-in',description:'Validate entries, put the supplied combined social media time in Other, fill the form, and show a social media time and routine check-in.',inputSchema:{type:'object',properties:{sleepBedtime:{type:'string',pattern:'^([01][0-9]|2[0-3]):[0-5][0-9]$'},prebed:{type:'string',enum:['Never','Sometimes','Often']},name:{type:'string'},age:{type:'integer',minimum:15,maximum:100},hours:{type:'integer',minimum:0,maximum:12},minutes:{type:'integer',minimum:0,maximum:55,multipleOf:5},sleep:{type:'number',minimum:0,maximum:24},activity:{type:'integer',minimum:0,maximum:1440},...Object.fromEntries(questions.map(q=>[q.id,{type:'string',enum:['Never','Sometimes','Often']}]))},required:['name','prebed','age','hours','minutes','sleep','activity',...questions.map(q=>q.id)],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(data){const entries=[{name:'Other',hours:data.hours,minutes:data.minutes}];const result={...calculateWithPlatforms({...data,platforms:entries}),sleepBedtime:data.sleepBedtime,prebed:data.prebed};for(const input of form.querySelectorAll('input[name="prebed"]'))input.checked=input.value===data.prebed;platformUI.setEntries(entries);for(const id of ['name','age'])$(id).value=data[id]??'';for(const [prefix,total] of [['sleep',Math.round(data.sleep*60)],['activity',data.activity]]){$(prefix+'-hours').value=Math.floor(total/60);$(prefix+'-minutes').value=total%60;}refreshRoutineTimes();for(const q of questions)for(const input of form.querySelectorAll(`input[name="${q.id}"]`))input.checked=input.value===data[q.id];render(result);return result;}})).catch(()=>{});}catch{}}
}


