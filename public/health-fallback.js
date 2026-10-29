'use strict';
// Curated and checked against original sources on 2026-10-29 (UTC).
// Dates below are source publication/update dates, never assessment timestamps.
// Existing filename retained for script-order compatibility; this is now the primary local library.
const curatedHealthSources=[
 {
  "id": "nih-social",
  "organization": "NIH — News in Health",
  "title": "Healthy Social Media Habits",
  "url": "https://newsinhealth.nih.gov/2022/09/healthy-social-media-habits",
  "date": "2022-09",
  "applicableAges": [
   15,
   100
  ],
  "population": "General educational information; not an age-specific study",
  "topics": [
   "connection",
   "community",
   "activity",
   "people",
   "longer",
   "comparison",
   "content",
   "tasks"
  ],
  "summary": "Online interaction can provide support. How people use social media, what they encounter, and time for offline activities also matter."
 },
 {
  "id": "cdc-sleep",
  "organization": "CDC",
  "title": "About Sleep",
  "url": "https://www.cdc.gov/sleep/about/",
  "date": "2024-05-15",
  "applicableAges": [
   15,
   100
  ],
  "population": "General sleep guidance with separate age bands",
  "topics": [
   "bedtime",
   "sleep"
  ],
  "summary": "Sleep needs vary by age. CDC includes switching off electronic devices before bedtime among its sleep-habit tips; sleep quality matters as well as duration."
 },
 {
  "id": "cdc-activity",
  "organization": "CDC",
  "title": "Benefits of Physical Activity",
  "url": "https://www.cdc.gov/physical-activity-basics/benefits/",
  "date": "2025-12-04",
  "applicableAges": [
   15,
   100
  ],
  "population": "General guidance covering children, adults, and older adults",
  "topics": [
   "activity",
   "movement"
  ],
  "summary": "Physical activity has benefits across age groups. This resource is background about movement, not evidence that social media caused inactivity."
 },
 {
  "id": "hhs-youth",
  "organization": "U.S. Surgeon General / HHS",
  "title": "Social Media and Youth Mental Health: The U.S. Surgeon General’s Advisory",
  "url": "https://www.hhs.gov/sites/default/files/sg-youth-mental-health-social-media-advisory.pdf",
  "date": "2023",
  "applicableAges": [
   15,
   17
  ],
  "population": "Children and adolescents; selected here only for ages 15–17",
  "topics": [
   "community",
   "learning",
   "creative",
   "longer",
   "bullying",
   "content",
   "bedtime"
  ],
  "summary": "The youth advisory describes opportunities for community, information, and expression, alongside concerns about harmful content, harassment, and disruptive patterns of use."
 },
 {
  "id": "aap-media",
  "organization": "American Academy of Pediatrics",
  "title": "Screen Time Guidelines",
  "url": "https://www.aap.org/en/patient-care/media-and-children/center-of-excellence-on-social-media-and-youth-mental-health/qa-portal/qa-portal-library/qa-portal-library-questions/screen-time-guidelines/",
  "date": "2025",
  "applicableAges": [
   15,
   17
  ],
  "population": "Children and teens; not adult guidance",
  "topics": [
   "bedtime",
   "movement",
   "tasks",
   "people",
   "longer"
  ],
  "summary": "AAP emphasizes the quality and context of children’s and teens’ media use rather than a single screen-time limit for everyone."
 },
 {
  "id": "sleep-study",
  "organization": "Preventive Medicine",
  "title": "The association between social media use and sleep disturbance among young adults",
  "url": "https://pubmed.ncbi.nlm.nih.gov/26791323/",
  "date": "2016-04",
  "applicableAges": [
   19,
   32
  ],
  "population": "U.S. adults ages 19–32 in a cross-sectional study",
  "topics": [
   "bedtime",
   "sleep"
  ],
  "summary": "This study found an association between social media use and sleep disturbance. Its cross-sectional design does not establish cause or direction, and its age range does not cover all adults."
 }
];
const curatedHealthCards=[
 {
  "id": "connection",
  "kind": "benefits",
  "heading": "Staying connected",
  "statement": "Active online conversations can help people maintain social support.",
  "sourceIds": [
   "nih-social"
  ],
  "topics": [
   "connection"
  ]
 },
 {
  "id": "community",
  "kind": "benefits",
  "heading": "Finding community",
  "statement": "Online groups can offer connections with people who share interests or experiences.",
  "sourceIds": [
   "nih-social"
  ],
  "topics": [
   "community"
  ]
 },
 {
  "id": "information",
  "kind": "benefits",
  "heading": "Finding information",
  "statement": "Social media can help people find health information and hear others’ experiences. Check information against reliable sources.",
  "sourceIds": [
   "nih-social"
  ],
  "topics": [
   "content"
  ]
 },
 {
  "id": "youth-expression",
  "kind": "benefits",
  "heading": "Learning and expression",
  "statement": "For some young people, social media offers information, community, and space for creative expression.",
  "sourceIds": [
   "hhs-youth"
  ],
  "topics": [
   "learning",
   "creative"
  ]
 },
 {
  "id": "sleep",
  "kind": "risks",
  "heading": "Protecting bedtime",
  "statement": "Electronic-device use near bedtime is one part of a sleep routine worth considering. CDC includes switching devices off before bed among its sleep-habit tips.",
  "sourceIds": [
   "cdc-sleep"
  ],
  "topics": [
   "bedtime",
   "sleep"
  ]
 },
 {
  "id": "offline",
  "kind": "risks",
  "heading": "Time for offline activities",
  "statement": "Time online can displace movement, hobbies, or time with other people.",
  "sourceIds": [
   "nih-social"
  ],
  "topics": [
   "movement",
   "people",
   "activity"
  ]
 },
 {
  "id": "scroll",
  "kind": "risks",
  "heading": "Scrolling longer than intended",
  "statement": "Passive scrolling through upsetting content may leave some people feeling worse. Notice both the content and the time spent.",
  "sourceIds": [
   "nih-social"
  ],
  "topics": [
   "longer"
  ]
 },
 {
  "id": "comparison",
  "kind": "risks",
  "heading": "Social comparison",
  "statement": "Viewing others’ posts can leave some people feeling excluded or believing others have better lives.",
  "sourceIds": [
   "nih-social"
  ],
  "topics": [
   "comparison"
  ]
 },
 {
  "id": "content",
  "kind": "risks",
  "heading": "Checking content carefully",
  "statement": "Health information on social media can be misleading. Check important claims against reliable sources.",
  "sourceIds": [
   "nih-social"
  ],
  "topics": [
   "content"
  ]
 },
 {
  "id": "youth-harassment",
  "kind": "risks",
  "heading": "Cyberbullying and harassment",
  "statement": "The youth advisory identifies online harassment and bullying as concerns for young people. These experiences do not happen to everyone.",
  "sourceIds": [
   "hhs-youth"
  ],
  "topics": [
   "bullying"
  ]
 },
 {
  "id": "youth-context",
  "kind": "risks",
  "heading": "Keeping routines in view",
  "statement": "For children and teens, AAP recommends considering how media fits into everyday life instead of treating one time limit as a universal health rule.",
  "sourceIds": [
   "aap-media"
  ],
  "topics": [
   "tasks",
   "people",
   "movement",
   "bedtime"
  ]
 }
];

curatedHealthCards.push({id:'responsibilities',kind:'risks',heading:'Room for responsibilities',statement:'Consider what time online replaces. This reading offers general context, not evidence that social media caused any interruption.',sourceIds:['nih-social'],topics:['tasks']});

function selectHealthResources(result){
 const age=Number(result?.age);
 const eligible=Number.isInteger(age)&&age>=15&&age<=100;
 // Without an assessment, show only general guidance; never invent an age.
 const sources=curatedHealthSources.filter(s=>eligible?age>=s.applicableAges[0]&&age<=s.applicableAges[1]:s.applicableAges[0]===15&&s.applicableAges[1]===100);
 const byId=new Map(sources.map(s=>[s.id,s]));
 const signals={bedtime:'You said social media kept you up later than intended.',tasks:'You said social media interrupted your everyday responsibilities.',movement:'You said social media took time away from physical activity.',people:'You said social media took time away from people you wanted to spend time with.',longer:'You said you spent longer scrolling than you planned.'};
 const weights={connection:1,community:1,content:1};
 const personal={};
 for(const [key,text] of Object.entries(signals)){
  const reason=(result?.reasons||[]).find(r=>r.text===text&&['Sometimes','Often'].includes(r.frequency));
  if(reason){weights[key]=reason.frequency==='Often'?6:4;personal[key]=`Your check-in: “${reason.frequency}”. ${text}`;}
 }
 if(Number.isFinite(result?.sleep))weights.sleep=2;
 if(Number.isFinite(result?.activity))weights.activity=2;
 if(['Sometimes','Often'].includes(result?.prebed))weights.sleep=3; // Frequency alone is not disruption.
 const score=topics=>topics.reduce((n,t)=>n+(weights[t]||0),0);
 const cards=curatedHealthCards.filter(c=>c.sourceIds.every(id=>byId.has(id))).map(c=>({...c,sources:c.sourceIds.map(id=>byId.get(id)),personal:c.topics.map(t=>personal[t]).filter(Boolean).join(' ')})).sort((a,b)=>score(b.topics)-score(a.topics));
 const resources=sources.map(s=>({...s,whyRelevant:s.topics.map(t=>personal[t]).find(Boolean)||(s.id==='cdc-sleep'&&Number.isFinite(result?.sleep)?'Sleep duration was included in your check-in; this is general context, not a diagnosis.':s.id==='cdc-activity'&&Number.isFinite(result?.activity)?'Physical activity was included in your check-in; this resource explains general benefits of movement.':'Optional background appropriate to the source’s stated population.')})).sort((a,b)=>score(b.topics)-score(a.topics));
 return {benefits:cards.filter(c=>c.kind==='benefits'),risks:cards.filter(c=>c.kind==='risks'),resources};
}
// Share the same reviewed library with the Worker bundle, without duplicating evidence.
if(typeof document==='undefined')globalThis.socialMediaSenseEducation={curatedHealthSources,curatedHealthCards,selectHealthResources};
