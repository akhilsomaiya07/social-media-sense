'use strict';
// Optional presentation only: no calculation, navigation, storage or requests.
(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const progress = document.getElementById('step-progress');
 if (progress) {
  // Keep the native accessible value. A transform-only layer avoids browser-
  // specific native-progress animation behavior. Without this file it stays native.
  const track = document.createElement('span');
  track.className = 'step-progress-track';
  const fill = document.createElement('span');
  fill.className = 'step-progress-fill';
  fill.setAttribute('aria-hidden', 'true');
  const sync = () => {
   fill.style.transform = `scaleX(${Math.max(0, Math.min(1, progress.value / progress.max))})`;
  };
  sync();
  progress.before(track);
  track.append(progress, fill);
  new MutationObserver(sync).observe(progress, {attributes:true, attributeFilter:['value','max']});
 }
 const report = document.getElementById('result');
 if (!report) return;
 let lastAssessment;
 const clear = () => report.classList.remove('report-enter');
 document.addEventListener('checkin:complete', event => {
  const assessment = event.detail?.assessment;
  if (!assessment || assessment === lastAssessment) return;
  lastAssessment = assessment;
  clear();
  if (!reduced.matches) report.classList.add('report-enter');
 });
 // Leaving mid-reveal cancels it, so returning from a tool never replays it.
 document.addEventListener('view:before', event => { if (event.detail.view !== 'report') clear(); });
 document.addEventListener('assessment:started', clear);
 report.addEventListener('animationend', event => {
  if (event.target.id === 'report-next' && event.animationName === 'report-arrive') clear();
 });
 reduced.addEventListener('change', clear);
})();
