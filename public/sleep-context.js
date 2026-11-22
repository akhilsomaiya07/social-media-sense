'use strict';
// CDC About Sleep (May 15, 2024). Context only; never part of the concern score.
function sleepReference(age){
 if(!Number.isInteger(Number(age))||Number(age)<15||Number(age)>100)return null;
 age=Number(age);
 if(age<18)return {group:'Teen',min:480,max:600,range:'8–10 hour',reference:'8–10 hours per 24 hours',guidance:'For ages 13–17, CDC guidance recommends 8–10 hours of sleep per 24 hours.',population:'ages 13–17'};
 if(age<=60)return {group:'Adult',min:420,max:null,range:'7 or more hours',reference:'7 or more hours per night',guidance:'For adults ages 18–60, CDC guidance recommends 7 or more hours of sleep per night.',population:'adults ages 18–60'};
 if(age<=64)return {group:'Adult 61–64',min:420,max:540,range:'7–9 hour',reference:'7–9 hours per night',guidance:'For adults ages 61–64, CDC guidance recommends 7–9 hours of sleep per night.',population:'ages 61–64'};
 return {group:'Older adult',min:420,max:480,range:'7–8 hour',reference:'7–8 hours per night',guidance:'For adults age 65 and older, CDC guidance recommends 7–8 hours of sleep per night.',population:'adults age 65 and older'};
}
function sleepContext(age,minutes){
 const reference=sleepReference(age);
 if(!reference||!Number.isInteger(minutes)||minutes<0||minutes>1440)return null;
 const time=(Math.floor(minutes/60)?Math.floor(minutes/60)+'h':'')+(minutes>=60&&minutes%60?' ':'')+(minutes%60?minutes%60+'m':'')||'0m';
 if(reference.group==='Teen'){
  const interpretation='The CDC reference for ages 13–17 is 8–10 hours over a full 24-hour day. Because this check-in asks about nighttime sleep only, it does not label this amount as below or within that reference; daytime naps may also contribute to total sleep.';
  return {...reference,status:'not-comparable',time,interpretation,text:`You reported ${time} of nighttime sleep. ${interpretation}`};
 }
 const below=minutes<reference.min;
 const status=below?'below':reference.max!==null&&minutes>reference.max?'above':'within';
 let interpretation;
 if(reference.max===null)interpretation=below?'This is below the general recommendation of 7 or more hours for adults ages 18–60.':'This meets the general recommendation of at least 7 hours for adults ages 18–60.';
 else if(status==='above')interpretation=`The general reference for ${reference.population} is ${reference.reference}. Individual sleep needs can vary.`;
 else interpretation=`This ${below?'is below':'falls within'} the ${reference.range} age-based reference.`;
 return {...reference,status,time,interpretation,text:`You reported ${time} of sleep. ${interpretation}`};
}
function sleepBedtimeConnection(result){
 const late=result.reasons.find(r=>r.text==='You said social media kept you up later than intended.')?.frequency||'Never';
 return {late,related:['Sometimes','Often'].includes(result.prebed)||['Sometimes','Often'].includes(late)};
}
function sleepShieldIntro(result){
 const context=sleepContext(result.age,Math.round(result.sleep*60)),{late}=sleepBedtimeConnection(result);
 const behavior=late!=='Never'?`You also said that social media ${late.toLowerCase()} keeps you up later than planned.`:`You also said you ${String(result.prebed).toLowerCase()} use social media during the hour before bed.`;
 return `${context?.text||''} ${behavior} Here’s one small experiment you can try tonight.`.trim();
}
function renderSleepContext(result){
 const context=sleepContext(result.age,Math.round(result.sleep*60));
 const root=document.getElementById('sleep-context');root.hidden=!context;if(!context)return;
 document.getElementById('sleep-context-reported').textContent=(context.group==='Teen'?'Reported nighttime sleep: ':'Reported sleep: ')+context.time;
 document.getElementById('sleep-context-reference').textContent='Age-based reference: '+context.reference;
 document.getElementById('sleep-context-interpretation').textContent=context.interpretation;
 const noConnection=document.getElementById('sleep-context-connection');noConnection.hidden=sleepBedtimeConnection(result).related;
 noConnection.textContent='Your answers did not indicate that social media is currently interfering with your bedtime, so this check-in does not assume social media is responsible for your reported sleep amount.';
}
if(typeof module!=='undefined')module.exports={sleepReference,sleepContext,sleepBedtimeConnection,sleepShieldIntro};

// Step 3 guidance only. Does not change report interpretation or validation.
function sleepInputWarning(age,minutes){
 const reference=sleepReference(age);
 if(!reference||!Number.isInteger(minutes)||minutes<0||minutes>1440||minutes>=reference.min)return null;
 const hours=Math.floor(minutes/60),remainder=minutes%60;
 const reported=[hours?`${hours} ${hours===1?'hour':'hours'}`:'',remainder?`${remainder} ${remainder===1?'minute':'minutes'}`:''].filter(Boolean).join(' ')||'0 minutes';
 const recommendation=reference.max?`${reference.min/60}–${reference.max/60} hours`:'at least 7 hours';
 return `You reported ${reported} per night. For your age, the CDC recommends ${recommendation}. Consider making more time for sleep.`;
}
