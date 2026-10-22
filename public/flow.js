'use strict';
const assessmentStepFields=[['age'],['hours','minutes'],['sleep','sleep-hours','sleep-minutes','prebed'],['activity','activity-hours','activity-minutes'],['bedtime','tasks','movement','people','longer']];
function fieldAssessmentStep(key){return key.startsWith('platform-')?2:assessmentStepFields.findIndex(fields=>fields.includes(key))+1;}
function assessmentErrorsForStep(calculate,data,step){
 try{calculate(data);return {}}catch(error){if(!error.fields)throw error;return Object.fromEntries(Object.entries(error.fields).filter(([key])=>fieldAssessmentStep(key)===step));}
}
function setupAssessmentFlow({form,read,calculate,render,clearFieldErrors,showFieldErrors,resetAssessment}){
 const get=id=>document.getElementById(id),workspace=form.closest('.workspace'),panels=[...form.querySelectorAll('.assessment-step')];
 let step=1,busy=false,complete=false,reached=1;
 function move(next,focus=true){
  // Direction is presentation-only. Never delay validation, focus, or URL updates.
  if(next!==step)form.dataset.stepDirection=next>step?'forward':'backward';
  step=next;if(typeof appViews!=='undefined')appViews.show('assessment',false);form.hidden=false;document.body.classList.remove('results-screen');workspace.classList.remove('results-only');clearFieldErrors();get('error').hidden=true;
  for(const panel of panels)panel.hidden=Number(panel.dataset.step)!==step;
  get('step-count').textContent=`Step ${step} of 5`;get('step-progress').value=step;
  get('flow-back').hidden=step===1;get('flow-next').textContent=step===5?'See My Results':'Next';
  get('result').hidden=true;workspace.classList.add('flow-active');
  document.dispatchEvent(new CustomEvent('assessment:step',{detail:{step}}));
  if(focus){get(`step-title-${step}`).focus({preventScroll:true});form.scrollIntoView({block:'start',behavior:'auto'});}
 }
 function report(fields){
  clearFieldErrors(Boolean(fields.age));showFieldErrors(fields);
  // The age field has its own live alert; retain the summary for other fields only.
  const messages=Object.entries(fields).filter(([key])=>key!=='age').map(([,message])=>message);
  get('error').textContent=[...new Set(messages)].join(' ');get('error').hidden=!messages.length;
  const key=Object.keys(fields)[0],input=get(key)||form.querySelector(`input[name="${key}"]`);
  if(input)input.focus();
 }
 function showResults(){
  busy=false;complete=true;get('flow-loading').hidden=true;form.hidden=true;get('flow-next').disabled=false;
  if(typeof appViews!=='undefined')appViews.show('report',false);get('result').hidden=false;workspace.classList.remove('flow-active');workspace.classList.add('results-only');document.body.classList.add('results-screen');
  get('result-title').setAttribute('tabindex','-1');get('result-title').focus({preventScroll:true});get('result').scrollIntoView({block:'start',behavior:'auto'});
 }
 document.addEventListener('checkin:complete',showResults);
 function start(){if(busy)return;complete=false;reached=1;resetAssessment();get('flow-loading').hidden=true;get('flow-next').disabled=false;document.dispatchEvent(new Event('assessment:started'));move(1);}
 get('start-new-checkin').addEventListener('click',start);document.addEventListener('assessment:start',start);document.addEventListener('assessment:resume',()=>{if(!busy)move(step);});
 get('flow-back').addEventListener('click',()=>{if(!busy&&step>1)move(step-1)});
 form.addEventListener('submit',event=>{
  event.preventDefault();if(busy)return;
  if(step<5){const errors=assessmentErrorsForStep(calculate,read(),step);if(Object.keys(errors).length){report(errors);return;}reached=Math.max(reached,step+1);move(step+1);return;}
  let result;
  try{result=calculate(read())}catch(error){if(!error.fields)throw error;const first=Object.keys(error.fields)[0];const target=fieldAssessmentStep(first);move(target||5);report(Object.fromEntries(Object.entries(error.fields).filter(([key])=>fieldAssessmentStep(key)===step)));return;}
  clearFieldErrors();get('error').hidden=true;busy=true;get('flow-next').disabled=true;form.hidden=true;get('result').hidden=true;workspace.classList.add('flow-active');get('flow-loading').hidden=false;
  if(typeof appViews!=='undefined')appViews.show('loading',false);
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
 window.assessmentFlow={
  get step(){return step;},get busy(){return busy;},get complete(){return complete;},
  // Recheck prerequisites: an earlier answer may have become invalid since visiting a later step.
  available(requested){
   let target=Math.min(Math.max(1,requested),reached);
   for(let n=1;n<target;n++)if(Object.keys(assessmentErrorsForStep(calculate,read(),n)).length)return n;
   return target;
  },
  navigate(requested){if(!busy&&!complete)move(this.available(requested));}
 };
 move(1,false);
}
if(typeof module!=='undefined')module.exports={assessmentErrorsForStep,setupAssessmentFlow};

