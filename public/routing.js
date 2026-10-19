'use strict';
// History belongs here; appViews still owns visibility and assessmentFlow owns steps.
(() => {
 const steps=['/check-in/about-you','/check-in/social-media-time','/check-in/sleep','/check-in/physical-activity','/check-in/daily-routine'];
 const views={home:'/',report:'/results',tools:'/tools',shield:'/tools/sleep-shield',reduction:'/tools/reduction-goal',progress:'/tools/progress'};
 let ready=false,restoring=false,run=0;
 const session=crypto.randomUUID();
 const flow=()=>window.assessmentFlow;
 function visiblePath(){return appViews.current==='assessment'||appViews.current==='loading'?steps[flow().step-1]:views[appViews.current];}
 function write(replace=false){
  const path=visiblePath();if(!path)return;
  const state={smsRoute:true,session,run};
  if(replace)history.replaceState(state,'',path);
  else if(location.pathname!==path||location.search||location.hash)history.pushState(state,'',path);
 }
 function notice(message=''){
  const el=document.getElementById('route-notice');el.textContent=message;el.hidden=!message;
 }
 function sync(){if(!ready||restoring)return;notice();write();}
 function restore(initial=false){
  if(flow().busy){write(true);return;} // Keep the single pending completion; never restart its timer.
  restoring=true;
  try{
   notice();const requested=location.pathname;const n=steps.indexOf(requested)+1;
   if(n){
    if(flow().complete){appViews.show('report');}
    else{
     const validVisit=!initial&&history.state?.session===session&&history.state?.run===run;
     const target=validVisit?flow().available(n):1;
     flow().navigate(target);
     if(initial||!validVisit)notice('Unsaved assessment answers are available only during this visit. Please begin at Step 1.');
     else if(target!==n)notice('Please complete the earlier steps before continuing.');
     document.dispatchEvent(new Event('assessment:resumed-route'));
    }
   }else{
    const view=Object.keys(views).find(key=>views[key]===requested);
    if(view==='report'&&!appViews.hasReport){appViews.show('home');notice('Your full report is not available after a refresh or in a new tab. Start a check-in, or review saved values in My Tools.');}
    else if(view)appViews.show(view,!initial||view!=='home');
    else{appViews.show('home');notice('That page is not available. You can start a check-in or explore My Tools.');}
   }
   write(true); // Canonicalize guards without adding history entries during Back/Forward.
  }finally{restoring=false;}
 }
 document.addEventListener('assessment:started',()=>{run++;});
 document.addEventListener('view:shown',sync);
 document.addEventListener('assessment:step',sync);
 window.addEventListener('popstate',()=>restore());
 window.appRouting={start(){ready=true;restore(true);}};
})();
