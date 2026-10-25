'use strict';
// Sleep Shield multiweek diary. App heuristics, not clinical diagnostics.
const sleepDiaryKey='social-media-sense.sleep-diary.v1';
function sleepLocalDate(now=new Date()){
 return String(now.getFullYear())+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
}
function sleepDateOrdinal(value){
 if(typeof value!=='string'||!/^(\d{4})-(\d{2})-(\d{2})$/.test(value))return null;
 const [y,m,d]=value.split('-').map(Number),date=new Date(Date.UTC(y,m-1,d));
 return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?Math.round(date.getTime()/86400000):null;
}
function sleepClockMinute(value){
 if(typeof value!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))return null;
 const [h,m]=value.split(':').map(Number);return h*60+m;
}
function sleepDiaryValid(entry){
 return !!entry&&sleepDateOrdinal(entry.sleepDate)!==null&&Number.isInteger(entry.sleepMinutes)&&entry.sleepMinutes>=0&&entry.sleepMinutes<=1440&&
 ['Rested','Somewhat rested','Not very rested'].includes(entry.rested)&&
 (entry.fellAsleep==null||entry.fellAsleep===''||sleepClockMinute(entry.fellAsleep)!==null)&&
 (entry.wokeUp==null||entry.wokeUp===''||sleepClockMinute(entry.wokeUp)!==null)&&
 (entry.interrupted==null||entry.interrupted===''||['Yes','No'].includes(entry.interrupted))&&
 (entry.followed==null||entry.followed===''||['Yes','Partly','No'].includes(entry.followed))&&
 typeof entry.note==='string'&&entry.note.length<=240;
}
function sleepClockVariation(times){
 if(!times.length)return null;
 // Minimum maximum circular distance to an observed center; midnight wraps correctly.
 return Math.min(...times.map(center=>Math.max(...times.map(t=>Math.min(Math.abs(t-center),1440-Math.abs(t-center))))));
}
function sleepDiaryAnalyze(raw,age,today=sleepLocalDate()){
 const todayOrd=sleepDateOrdinal(today);
 const valid=Array.isArray(raw)?raw.filter(sleepDiaryValid).filter(e=>sleepDateOrdinal(e.sleepDate)<=todayOrd):[];
 const counts=new Map();valid.forEach(e=>counts.set(e.sleepDate,(counts.get(e.sleepDate)||0)+1));
 const unique=valid.filter(e=>counts.get(e.sleepDate)===1).sort((a,b)=>a.sleepDate.localeCompare(b.sleepDate));
 const latest=unique.at(-1),last14=latest?unique.filter(e=>sleepDateOrdinal(e.sleepDate)>=sleepDateOrdinal(latest.sleepDate)-13):[];
 const complete=last14.length===14&&last14.every((e,i)=>i===0||sleepDateOrdinal(e.sleepDate)-sleepDateOrdinal(last14[i-1].sleepDate)===1);
 const fresh=!!latest&&todayOrd-sleepDateOrdinal(latest.sleepDate)<=2;
 const reference=typeof sleepReference==='function'?sleepReference(age):null;
 const min=reference?.min??null;
 const short=min===null?[]:last14.filter(e=>e.sleepMinutes<min);
 const interrupted=last14.filter(e=>e.interrupted==='Yes');
 const unrested=last14.filter(e=>e.rested==='Not very rested');
 const sleeps=last14.map(e=>e.sleepMinutes);
 const range=sleeps.length?Math.max(...sleeps)-Math.min(...sleeps):0;
 const hasTimes=last14.length>0&&last14.every(e=>sleepClockMinute(e.fellAsleep)!==null&&sleepClockMinute(e.wokeUp)!==null);
 const sleepSpread=hasTimes?sleepClockVariation(last14.map(e=>sleepClockMinute(e.fellAsleep))):null;
 const wakeSpread=hasTimes?sleepClockVariation(last14.map(e=>sleepClockMinute(e.wokeUp))):null;
 const interruptionsKnown=last14.every(e=>e.interrupted==='Yes'||e.interrupted==='No');
 const base={complete,fresh,reference,shortCount:short.length,interruptionCount:interrupted.length,unrestedCount:unrested.length,rangeMinutes:range,sleepSpread,wakeSpread,last14,entries:unique};
 const result=(kind,title,text,tip)=>({...base,kind,title,text,tip});
 if(!latest)return result('insufficient','Start your sleep diary','No dated sleep records yet. Record your sleep after waking to begin seeing patterns.','Sleep information is self-reported.');
 const period='Across '+last14.length+' recorded '+(last14.length===1?'night':'nights')+', ';
 if(!fresh)return result('insufficient','Your latest sleep records are older','You can still review previous patterns, but they do not establish how you are sleeping now.','Record recent nights to see a current two-week picture.');
 if(min!==null&&short.length>0&&last14.length>=2)return result('advice','Some nights were shorter',period+short.length+' '+(short.length===1?'night was':'nights were')+' below the general sleep-duration reference for your age.','Consider what differed on shorter nights and whether you can protect more time for sleep.');
 if(range>=90&&last14.length>=2)return result('advice','Your sleep duration varied',period+'reported sleep duration ranged from '+Math.floor(Math.min(...sleeps)/60)+'h '+String(Math.min(...sleeps)%60).padStart(2,'0')+'m to '+Math.floor(Math.max(...sleeps)/60)+'h '+String(Math.max(...sleeps)%60).padStart(2,'0')+'m.','Notice what was different on shorter nights and consider one manageable change.');
 if(unrested.length>0)return result('advice','Feeling rested matters too','You reported not feeling very rested on '+unrested.length+' of the recorded nights in this period.','Consider your sleep environment and routine; persistent difficulties are worth discussing with a healthcare professional.');
 if(interrupted.length>0)return result('advice','You noticed interrupted sleep','You reported sleep interruptions on '+interrupted.length+' of the recorded nights in this period.','Consider whether a calmer sleep environment or more consistent routine would help; this does not establish a cause.');
 if(hasTimes&&(sleepSpread>60||wakeSpread>60)&&last14.length>=2)return result('advice','Your sleep schedule varied','Your recorded sleep or wake times shifted by more than the one-hour consistency guideline used by this app.','Review the timing chart and consider a steadier schedule if your circumstances allow.');
 if(!complete||!fresh)return result('insufficient','Keep building your sleep picture','You have '+last14.length+' of 14 distinct consecutive nights needed for a complete multiweek comparison. Missing dates are unknown, not poor sleep.','Continue recording your sleep when you can.');
 if(!reference)return result('insufficient','Add age for tailored sleep guidance','Your two-week diary is available, but we cannot compare sleep duration to an age-based reference without your age.','You can enter your age in Sleep Shield, or continue using the charts without this comparison.');
 if(!hasTimes)return result('insufficient','Add actual sleep and wake times','Your two-week diary is recorded, but there is not enough timing information to evaluate schedule consistency.','Record approximate actual sleep and wake times, when known.');
 if(!interruptionsKnown)return result('insufficient','Add interruption information','Your two-week diary is recorded, but some nights have no interruption answer.','Complete the optional interruption question when you know the answer.');
 if(sleepSpread>60||wakeSpread>60)return result('advice','Your sleep schedule varied','Your sleep and wake times were not within the one-hour timing window used by this app.','Consider what might make your routine steadier, if practical.');
 return result('celebrate','Nice Work on Your Sleep Routine! 🎉','Your last two weeks of check-ins show a consistent pattern of sufficient reported sleep. Keep making time for rest!','Based only on self-reported records. This is not a medical assessment.');
}
if(typeof globalThis!=='undefined')globalThis.sleepPatternTools={sleepDiaryKey,sleepLocalDate,sleepDateOrdinal,sleepClockMinute,sleepDiaryValid,sleepClockVariation,sleepDiaryAnalyze};
if(typeof module!=='undefined'&&module.exports)module.exports={sleepDiaryKey,sleepLocalDate,sleepDateOrdinal,sleepClockMinute,sleepDiaryValid,sleepClockVariation,sleepDiaryAnalyze};
