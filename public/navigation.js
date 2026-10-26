'use strict';
// View changes never recalculate an assessment or dispatch checkin:complete.
const appViews=(()=>{
 const get=id=>document.getElementById(id);
 const ids={home:'home-screen',assessment:'checkin',loading:'flow-loading',report:'result',tools:'tools-screen',shield:'sleep-shield',reduction:'reduction-screen',progress:'progress-screen'};
 const titles={home:'home-title',report:'result-title',tools:'tools-title',shield:'sleep-shield-title',reduction:'reduction-title',progress:'progress-title'};
 let current='home',hasReport=false,assessmentStarted=false,completed=false;
 const scrolls=new Map(),triggers=new Map();
 function refresh(){
  let saved=false,plan=false,storageProblem=false;
  try{const h=JSON.parse(localStorage.getItem('room.saved-checkins.v1')||'null');saved=!!h?.checkins?.length;}catch{storageProblem=true;}
  try{const p=JSON.parse(localStorage.getItem('social-media-sense.sleep-shield.v1')||'null');plan=!!p&&(validShieldBedtime(p.bedtime)||p.nights?.some(n=>validShieldBedtime(n?.plan?.bedtime)));}catch{storageProblem=true;}
  get('tools-report').hidden=!hasReport;get('home-report').hidden=!hasReport;
  get('shield-open').textContent=plan?'Resume My Plan':'Open Sleep Tracker';
  get('home-start').textContent=assessmentStarted&&!completed?'Continue My Check-In':hasReport?'Start a New Check-In':'Start My Check-In';
  const note=hasReport?'Your current report is available during this visit. Save it in Progress if you want to keep its check-in values.':saved?'Saved check-ins are available in Progress. They are not complete historical assessment reports.':plan?'Your saved Sleep Tracker plan is available. You do not need another assessment to resume it.':'No assessment is required to explore My Tools. Reduction Goal needs a current or saved check-in.';
  get('tools-state').textContent=storageProblem?'Some saved data could not be read. Open the relevant tool for details; nothing has been replaced.':note;
 }
 function show(view,focus=true){
  if(window.assessmentFlow?.busy&&view!=='loading')return;
  if(view==='report'&&!hasReport)view='tools';
  scrolls.set(current,window.scrollY);
  if(document.activeElement?.matches('button,a'))triggers.set(current,document.activeElement);
  document.dispatchEvent(new CustomEvent('view:before',{detail:{view}}));
  for(const [key,id] of Object.entries(ids))get(id).hidden=key!==view;
  current=view;
  const intro=document.querySelector('.intro'),home=get('home-screen');
  if(view==='home')home.prepend(intro);else home.before(intro);
  intro.hidden=view!=='home'&&view!=='assessment'&&view!=='loading';
  intro.querySelector('h1+p').textContent=view==='home'?"In five steps, estimate your social media time, reflect on sleep, physical activity, and everyday routines, then see a personal summary based on your answers.":'A few details. A clearer picture. No scores or labels.';
  document.body.classList.toggle('homepage',view==='home');
  const workspace=get('checkin').closest('.workspace');workspace.hidden=view==='home';
  workspace.classList.toggle('flow-active',view==='assessment'||view==='loading');workspace.classList.toggle('results-only',view!=='assessment'&&view!=='loading');
  document.body.classList.toggle('results-screen',view!=='home'&&view!=='assessment'&&view!=='loading');
  refresh();
  if(focus){const previous=triggers.get(view);const title=get(titles[view]);const target=previous&&previous.isConnected&&previous.getClientRects().length?previous:title;if(target){target.focus({preventScroll:true});}window.scrollTo({top:scrolls.get(view)||0,behavior:'instant'});}
  document.dispatchEvent(new CustomEvent('view:shown',{detail:{view}}));
 }
 document.addEventListener('click',event=>{const b=event.target.closest('[data-view]');if(b){event.preventDefault();show(b.dataset.view);}const start=event.target.closest('[data-start]');if(start){event.preventDefault();document.dispatchEvent(new Event(assessmentStarted&&!completed?'assessment:resume':'assessment:start'));assessmentStarted=true;completed=false;refresh();}});
 document.addEventListener('checkin:complete',()=>{hasReport=true;completed=true;refresh();});
 document.addEventListener('assessment:started',()=>{assessmentStarted=true;completed=false;});
 document.addEventListener('assessment:resumed-route',()=>{assessmentStarted=true;completed=false;refresh();});
 window.addEventListener('storage',refresh);document.addEventListener('tools:data-changed',refresh);
 document.addEventListener('DOMContentLoaded',()=>window.appRouting?window.appRouting.start():show('home',false));
 return {show,refresh,get hasReport(){return hasReport;},get current(){return current;}};
})();
