'use strict';
// A presentation rule for this card only, not a health threshold or assessment score.
function balanceExperience(assessment){
 if(!assessment||!Number.isInteger(assessment.daily)||assessment.daily<0||assessment.daily>1440)return 'hidden';
 const answers=['bedtime','tasks','movement','longer'].map(key=>assessment.behaviors?.[key]);
 if(answers.some(answer=>!['Never','Sometimes','Often'].includes(answer)))return 'hidden';
 const disruptions=answers.filter(answer=>answer!=='Never').length;
 if(answers.includes('Often')||disruptions>1)return 'hidden';
 return disruptions===0?(assessment.worthReviewing?'hidden':'positive'):'neutral';
}
if(typeof module!=='undefined')module.exports={balanceExperience};
if(typeof document!=='undefined'){
 const get=id=>document.getElementById(id),card=get('balance-card'),button=get('balance-celebrate'),confetti=get('balance-confetti');
 let busy=false,timer;
 function reset(){clearTimeout(timer);busy=false;button.disabled=false;button.textContent='Celebrate My Balance 🎉';confetti.replaceChildren();get('balance-celebration-status').textContent='';}
 document.addEventListener('checkin:complete',event=>{
  reset();const assessment=event.detail.assessment,mode=balanceExperience(assessment);card.hidden=mode==='hidden';button.hidden=mode!=='positive';if(card.hidden)return;
  const name=get('name').value.trim().slice(0,60);
  get('balance-title').textContent=mode==='positive'?(name?`Nice work, ${name}! 🎉`:'Nice work! 🎉'):'Your routine check-in';
  get('balance-message').textContent=mode==='positive'?'Your answers suggest that social media is not currently causing much disruption to your everyday routine. Keeping that balance is worth maintaining.':Object.values(assessment.behaviors).every(answer=>answer==='Never')?'You reported no routine disruption. Keep considering how your reported time fits with the rest of your day.':'Your answers are mixed: you reported occasional disruption in one area. The personalized guidance above can help you decide whether to make a change.';
 });
 get('checkin').addEventListener('input',()=>{reset();card.hidden=true;});
 button.addEventListener('click',()=>{
  if(busy||card.hidden||button.hidden)return;
  busy=true;button.disabled=true;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reducedMotion){
   for(let i=0;i<20;i++){
    const piece=document.createElement('span');piece.className='balance-confetti-piece';
    piece.style.setProperty('--x',`${(i%5-2)*36}px`);piece.style.setProperty('--y',`${-35-(i%4)*19}px`);piece.style.setProperty('--turn',`${(i%2?1:-1)*(100+i*19)}deg`);piece.style.setProperty('--delay',`${(i%4)*45}ms`);piece.style.background=['#d9f786','#9ad9d5','#c5b6e6','#f1daa1'][i%4];confetti.append(piece);
   }
  }
  timer=setTimeout(()=>{confetti.replaceChildren();button.textContent='Keep It Going! ✓';get('balance-celebration-status').textContent='Keep it going!';timer=setTimeout(reset,1600);},reducedMotion?0:1700);
 });
}
