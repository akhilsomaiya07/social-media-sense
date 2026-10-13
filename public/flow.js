'use strict';
const assessmentStepFields=[['age'],['hours','minutes'],['sleep','sleep-hours','sleep-minutes','prebed'],['activity','activity-hours','activity-minutes'],['bedtime','tasks','movement','people','longer']];
function fieldAssessmentStep(key){return key.startsWith('platform-')?2:assessmentStepFields.findIndex(fields=>fields.includes(key))+1;}
function assessmentErrorsForStep(calculate,data,step){
 try{calculate(data);return {}}catch(error){if(!error.fields)throw error;return Object.fromEntries(Object.entries(error.fields).filter(([key])=>fieldAssessmentStep(key)===step));}
}
function setupAssessmentFlow({form,read,calculate,render,clearFieldErrors,showFieldErrors,resetAssessment}){
 const get=id=>document.getElementById(id),workspace=form.closest('.workspace'),panels=[...form.querySelectorAll('.assessment-step')];
 let step=1,busy=false;
 function move(next,focus=true){
  step=next;form.hidden=false;document.body.classList.remove('results-screen');workspace.classList.remove('results-only');clearFieldErrors();get('error').hidden=true;
  for(const panel of panels)panel.hidden=Number(panel.dataset.step)!==step;
  get('step-count').textContent=`Step ${step} of 5`;get('step-progress').value=step;
  get('flow-back').hidden=step===1;get('flow-next').textContent=step===5?'See My Results':'Next';
  get('result').hidden=true;workspace.classList.add('flow-active');
  if(focus){get(`step-title-${step}`).focus({preventScroll:true});form.scrollIntoView({block:'start',behavior:'auto'});}
 }
 function report(fields){
  clearFieldErrors();showFieldErrors(fields);get('error').textContent=[...new Set(Object.values(fields))].join(' ');get('error').hidden=false;
  const key=Object.keys(fields)[0],input=get(key)||form.querySelector(`input[name="${key}"]`);
  if(input)input.focus();
 }
 function showResults(){
  busy=false;get('flow-loading').hidden=true;form.hidden=true;get('flow-next').disabled=false;
  get('result').hidden=false;workspace.classList.remove('flow-active');workspace.classList.add('results-only');document.body.classList.add('results-screen');
  get('result-title').setAttribute('tabindex','-1');get('result-title').focus({preventScroll:true});get('result').scrollIntoView({block:'start',behavior:'auto'});
 }
 document.addEventListener('checkin:complete',showResults);
 get('start-new-checkin').addEventListener('click',()=>{if(busy)return;resetAssessment();get('flow-loading').hidden=true;get('flow-next').disabled=false;move(1);});
 get('flow-back').addEventListener('click',()=>{if(!busy&&step>1)move(step-1)});
 form.addEventListener('submit',event=>{
  event.preventDefault();if(busy)return;
  if(step<5){const errors=assessmentErrorsForStep(calculate,read(),step);if(Object.keys(errors).length){report(errors);return;}move(step+1);return;}
  let result;
  try{result=calculate(read())}catch(error){if(!error.fields)throw error;const first=Object.keys(error.fields)[0];const target=fieldAssessmentStep(first);move(target||5);report(Object.fromEntries(Object.entries(error.fields).filter(([key])=>fieldAssessmentStep(key)===step)));return;}
  clearFieldErrors();get('error').hidden=true;busy=true;get('flow-next').disabled=true;form.hidden=true;get('result').hidden=true;workspace.classList.add('flow-active');get('flow-loading').hidden=false;
  get('loading-progress').value=1;get('loading-percent').textContent='1%';get('loading-title').focus({preventScroll:true});get('flow-loading').scrollIntoView({block:'start',behavior:'auto'});
  const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?200:1600;let start;
  function tick(timestamp){
   if(start===undefined)start=timestamp;
   const progress=Math.min(100,1+99*(timestamp-start)/duration);
   get('loading-progress').value=progress;get('loading-percent').textContent=Math.floor(progress)+'%';
   if(progress<100)requestAnimationFrame(tick);else requestAnimationFrame(()=>render(result));
  }
  requestAnimationFrame(tick);
 });
 move(1,false);
}
if(typeof module!=='undefined')module.exports={assessmentErrorsForStep,setupAssessmentFlow};

