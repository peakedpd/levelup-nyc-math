/* LevelUp Classroom (P5): pluggable sync layer + teacher-platform logic (pure JS; node + browser).
   Adapters: "local" (this device, works now), "file" (class-code / progress-file export-import, works now),
   "supabase" (centralized accounts + cross-device sync; ready, needs a project URL + anon key — see docs/backend/SETUP.md). */
(function(root){
const VERSION=1;
/* ---------- codes: base64url(JSON) + FNV-1a checksum; tamper/typo detection ---------- */
function fnv(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(16).padStart(8,"0")}
const b64e=s=>typeof Buffer!=="undefined"?Buffer.from(s,"utf8").toString("base64url"):btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const b64d=s=>{if(typeof Buffer!=="undefined")return Buffer.from(s,"base64url").toString("utf8");s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return decodeURIComponent(escape(atob(s)))};
function encode(kind,obj){const body=JSON.stringify({v:VERSION,k:kind,d:obj});const b=b64e(body);return`LU${kind[0].toUpperCase()}-${fnv(b)}-${b}`}
function decode(code){const m=String(code||"").trim().replace(/\s+/g,"").match(/^LU([A-Z])-([0-9a-f]{8})-([A-Za-z0-9_-]+)$/);if(!m)throw new Error("Not a Level Up code");if(fnv(m[3])!==m[2])throw new Error("Code is damaged or mistyped (checksum)");
  const o=JSON.parse(b64d(m[3]));if(o.v!==VERSION)throw new Error("Code from a different version");return{kind:o.k,data:o.d}}
/* ---------- student snapshot (what syncs) ---------- */
function snapshot(S,opts){opts=opts||{};const l=S.learn||{};const logN=opts.logN||400;
  return{id:S.studentId||null,name:S.name||"Student",classCode:S.classCode||null,at:Date.now(),xp:S.xp||0,coins:S.coins||0,
    learn:{m:l.m||{},log:(l.log||[]).slice(-logN),time:l.time||{},diag:l.diag||null,base:l.base||null,history:l.history||[],sessions:l.sessions||0,interventions:l.interventions||[],responses:(l.responses||[]).slice(-60),reasons:(l.reasons||[]).slice(-60),depth:(l.depth||[]).slice(-60),assignments:l.assignments||[]}}}
/* ---------- merge (cross-device): union evidence by timestamp, never lose progress ---------- */
const byT=(a,b,key)=>{const k=key||(x=>x.t+"|"+(x.sk||"")+"|"+(x.lv||"")+"|"+(x.src||""));const m=new Map();for(const x of (a||[]).concat(b||[]))if(x)m.set(k(x),Object.assign({},m.get(k(x))||{},x));return[...m.values()].sort((x,y)=>(x.t||0)-(y.t||0))};
function mergeSkill(a,b){if(!a)return b;if(!b)return a;const la=Math.max(0,...(a.ev||[]).map(e=>e.t)),lb=Math.max(0,...(b.ev||[]).map(e=>e.t));const base=Object.assign({},la>=lb?a:b);
  base.ev=byT(a.ev,b.ev,e=>e.t+"|"+e.lv+"|"+e.src).slice(-200);base.checks=(la>=lb?a.checks:b.checks)||[];base.diagEv=byT(a.diagEv,b.diagEv,e=>e.t);
  for(const k of ["secure","retained","transfer","done"])base[k]=a[k]&&b[k]?Math.max(+a[k],+b[k]):(la>=lb?a[k]:b[k]);base.taught=Math.max(a.taught||0,b.taught||0);return base}
function merge(a,b){if(!a)return b;if(!b)return a;const A=a.learn||{},B=b.learn||{};const m={};for(const k of new Set(Object.keys(A.m||{}).concat(Object.keys(B.m||{}))))m[k]=mergeSkill((A.m||{})[k],(B.m||{})[k]);
  const time={};for(const k of new Set(Object.keys(A.time||{}).concat(Object.keys(B.time||{}))))time[k]=Math.max((A.time||{})[k]||0,(B.time||{})[k]||0);
  const hist=byT(A.history,B.history,h=>h.t);const iv=byT(A.interventions,B.interventions,x=>(x.code||x.id)+"|"+x.t).map(x=>x);
  const resp=byT(A.responses,B.responses,r=>r.t).map(r=>{const o=[...(A.responses||[]),...(B.responses||[])].filter(x=>x.t===r.t&&x.teacher!=null).sort((x,y)=>(y.scoredAt||0)-(x.scoredAt||0))[0];return o?Object.assign({},r,{teacher:o.teacher,scoredAt:o.scoredAt}):r});
  const newer=(a.at||0)>=(b.at||0)?a:b;
  return{id:a.id||b.id,name:newer.name,classCode:newer.classCode||a.classCode||b.classCode,at:Math.max(a.at||0,b.at||0),xp:Math.max(a.xp||0,b.xp||0),coins:newer.coins,
    learn:{m,log:byT(A.log,B.log).slice(-1500),time,diag:hist.length?hist[hist.length-1]:(A.diag||B.diag),base:A.base||B.base,history:hist,sessions:Math.max(A.sessions||0,B.sessions||0),interventions:iv,responses:resp,reasons:byT(A.reasons,B.reasons,r=>r.t),depth:byT(A.depth,B.depth,r=>r.t),assignments:byT(A.assignments,B.assignments,x=>x.id)}}}
/* ---------- class analytics ---------- */
const NAMES={placevalue:"Place Value",groups:"Equal Groups",addsub:"Add & Subtract",rounding:"Rounding",mult:"Multiplication",factors:"Factors & Multiples",divide:"Division",fractions:"Fractions",multistep:"Multi-Step Problems"};
const SK=["placevalue","groups","addsub","rounding","mult","factors","divide","fractions","multistep"];
function lvOf(m){return m?(m.done?6:m.lv||1):1}
function studentRow(s,now){now=now||Date.now();const L=s.learn||{},m=L.m||{};const log=(L.log||[]).filter(e=>e.src!=="diag");const recent=log.filter(e=>now-e.t<14*864e5);
  const first=recent.length?Math.round(recent.filter(e=>e.ok).length/recent.length*100):null;const h=(L.history||[]).filter(x=>x.scale);
  const mis={};log.filter(e=>e.code&&e.code!=="other").forEach(e=>mis[e.code]=(mis[e.code]||0)+1);const mins=Math.round(Object.values(L.time||{}).reduce((a,b)=>a+b,0)/60000);
  const due=SK.flatMap(k=>((m[k]||{}).checks||[]).filter(c=>c.at<=now).map(c=>({sk:k,lv:c.lv})));
  return{id:s.id,name:s.name,levels:Object.fromEntries(SK.map(k=>[k,lvOf(m[k])])),mastered:SK.filter(k=>m[k]&&m[k].done),scale:h.length?h[h.length-1].scale:null,growth:h.length>1?h[h.length-1].scale-h[0].scale:null,
    firstTry14:first,items14:recent.length,mins,mis,due,lastActive:log.length?log[log.length-1].t:null,openMissions:(L.interventions||[]).filter(x=>x.status!=="completed").map(x=>x.code||x.id),gaps:(L.diag&&L.diag.gaps)||[]}}
function analytics(students,now){const rows=students.map(s=>studentRow(s,now));const n=rows.length||1;
  const skill=Object.fromEntries(SK.map(k=>{const lv=rows.map(r=>r.levels[k]);const dist=[1,2,3,4,5,6].map(L=>lv.filter(x=>x===L).length);return[k,{mean:+(lv.reduce((a,b)=>a+b,0)/n).toFixed(2),dist,mastered:rows.filter(r=>r.mastered.includes(k)).length,below3:lv.filter(x=>x<3).length}]}));
  const mis={};rows.forEach(r=>Object.entries(r.mis).forEach(([c,k])=>{mis[c]=mis[c]||{students:0,count:0};mis[c].students++;mis[c].count+=k}));
  const sc=rows.filter(r=>r.scale!=null);return{n:rows.length,rows,skill,mis:Object.entries(mis).sort((a,b)=>b[1].students-a[1].students||b[1].count-a[1].count).map(([code,v])=>Object.assign({code},v)),
    meanScale:sc.length?Math.round(sc.reduce((a,r)=>a+r.scale,0)/sc.length):null,meanGrowth:rows.filter(r=>r.growth!=null).length?Math.round(rows.filter(r=>r.growth!=null).reduce((a,r)=>a+r.growth,0)/rows.filter(r=>r.growth!=null).length):null,
    needsAttention:rows.filter(r=>(r.firstTry14!=null&&r.firstTry14<60)||r.due.length>2||!r.lastActive||(now||Date.now())-r.lastActive>7*864e5).map(r=>r.name),
    groups:SK.map(k=>({sk:k,students:rows.filter(r=>r.levels[k]<=2).map(r=>r.name)})).filter(g=>g.students.length>=2)}}
/* ---------- individual recommendations ---------- */
const MISSKILL={regroup:"addsub",remainder:"divide",fraction:"fractions",partial:"mult",rounding:"rounding",factmult:"factors",placeval:"placevalue",addmult:"groups",onestep:"multistep",wrongop:"multistep",count:"groups",array:"groups"};
const PRE={placevalue:[],groups:[],rounding:["placevalue"],addsub:["placevalue"],mult:["groups","placevalue"],divide:["groups","mult"],factors:["groups"],multistep:["addsub","mult","divide"],fractions:["factors","groups"]};
function recommend(s,now){const r=studentRow(s,now);const out=[];
  Object.entries(r.mis).filter(([c,k])=>k>=2&&MISSKILL[c]&&!r.openMissions.includes(c)).sort((a,b)=>b[1]-a[1]).slice(0,2).forEach(([c,k])=>out.push({type:"mission",code:c,why:`${k} recent errors of this kind`,priority:k>=4?1:2}));
  for(const g of r.gaps)if(r.levels[g.prereq]<=2)out.push({type:"prereq",sk:g.prereq,why:`building block for ${NAMES[g.skill]||g.skill}`,priority:1});
  r.due.slice(0,2).forEach(d=>out.push({type:"memory",sk:d.sk,lv:d.lv,why:"Memory Check is due",priority:2}));
  const low=SK.filter(k=>r.levels[k]<=2&&!(PRE[k]||[]).some(p=>r.levels[p]<=2));low.slice(0,2).forEach(k=>out.push({type:"practice",sk:k,why:`working at L${r.levels[k]}`,priority:3}));
  if(r.firstTry14!=null&&r.firstTry14<60)out.push({type:"conference",why:`first-try accuracy ${r.firstTry14}% in the last 2 weeks — check in 1:1`,priority:1});
  const seen=new Set();return out.filter(x=>{const k=x.type+(x.code||x.sk||"");if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>a.priority-b.priority).slice(0,6)}
/* ---------- teacher-assigned missions ---------- */
function assignment(teacher,items,students,now){now=now||Date.now();return{id:"A"+now.toString(36),teacher:teacher||"Teacher",at:now,for:students||"all",items:items.map(x=>({type:x.type,code:x.code||null,sk:x.sk||null,lv:x.lv||null,due:x.due||null,note:x.note||""}))}}
function applyAssignment(S,a){const l=S.learn=S.learn||{};l.assignments=l.assignments||[];if(l.assignments.some(x=>x.id===a.id))return{added:0,dup:true};
  if(a.for!=="all"&&Array.isArray(a.for)&&!a.for.includes(S.studentId)&&!a.for.includes(S.name))return{added:0,notForMe:true};
  l.assignments.push({id:a.id,teacher:a.teacher,at:a.at,items:a.items,status:"assigned"});l.interventions=l.interventions||[];let added=0;
  for(const it of a.items)if(it.type==="mission"&&it.code){if(!l.interventions.some(x=>(x.code||x.id)===it.code&&x.status!=="completed")){l.interventions.push({id:it.code,code:it.code,name:it.code,from:"teacher",teacher:a.teacher,t:Date.now(),status:"assigned",due:it.due});added++}else{const x=l.interventions.find(x=>(x.code||x.id)===it.code&&x.status!=="completed");x.from="teacher";x.teacher=a.teacher}}else added++;
  return{added}}
/* ---------- growth report ---------- */
function growthReport(s,now){const r=studentRow(s,now),L=s.learn||{};const h=(L.history||[]).filter(x=>x.scale);const base=L.base||{};
  return{name:s.name,generated:new Date(now||Date.now()).toISOString().slice(0,10),scale:h.map(x=>({d:x.d,kind:x.kind||"full",scale:x.scale})),growth:r.growth,
    skills:SK.map(k=>{const m=(L.m||{})[k]||{};const ev=(m.ev||[]).filter(e=>e.src!=="diag");return{sk:k,placed:base[k]||null,now:r.levels[k],change:base[k]?r.levels[k]-base[k]:null,status:m.done?"mastered":m.secure?"secure":"learning",firstTry:ev.length?Math.round(ev.filter(e=>e.first).length/ev.length*100):null,memoryChecks:ev.filter(e=>e.src==="check").length}}),
    minutes:r.mins,missions:(L.interventions||[]).map(x=>({code:x.code||x.id,status:x.status,from:x.from})),recommendations:recommend(s,now)}}
/* ---------- assignment progress ---------- */
function assignmentStatus(s,a){const L=s.learn||{},log=L.log||[],iv=L.interventions||[];
  const items=(a.items||[]).map(it=>{let done=false,progress="";
    if(it.type==="mission"){const x=iv.find(x=>(x.code||x.id)===it.code&&(x.t||0)>=a.at-6e4)||iv.find(x=>(x.code||x.id)===it.code&&x.from==="teacher");done=!!(x&&x.status==="completed");progress=x?x.status:"not started"}
    else if(it.type==="practice"||it.type==="prereq"){const n=log.filter(e=>e.sk===it.sk&&e.src!=="diag"&&e.t>=a.at&&(!it.lv||e.lv>=it.lv)).length;done=n>=5;progress=n+"/5 problems"}
    else if(it.type==="memory"){const ev=(((L.m||{})[it.sk]||{}).ev||[]).filter(e=>e.src==="check"&&e.t>=a.at);done=ev.length>0;progress=done?"checked":"due"}
    else if(it.type==="checkup"){done=(L.history||[]).some(h=>h.t>=a.at);progress=done?"taken":"not yet"}
    return Object.assign({},it,{done,progress})});
  return{id:a.id,items,done:items.filter(x=>x.done).length,of:items.length,complete:items.length>0&&items.every(x=>x.done)}}
/* ---------- class CSV (one row per student) ---------- */
function classCSV(students,now){const A=analytics(students,now);const q=v=>`"${String(v==null?"":v).replace(/"/g,'""')}"`;
  const head=["student","scale score","growth","first-try % (14d)","items (14d)","minutes","mastered","open missions","top misconception","last active"].concat(SK.map(k=>k+" level"));
  const rows=A.rows.map(r=>{const top=Object.entries(r.mis).sort((a,b)=>b[1]-a[1])[0];return[r.name,r.scale,r.growth,r.firstTry14,r.items14,r.mins,r.mastered.length,r.openMissions.join(" "),top?top[0]+" x"+top[1]:"",r.lastActive?new Date(r.lastActive).toISOString().slice(0,10):"never"].concat(SK.map(k=>r.levels[k]))});
  return[head].concat(rows).map(r=>r.map(q).join(",")).join("\n")}
/* ---------- pluggable sync ---------- */
/* Every adapter: push(snapshot) -> merged/ok, pull(id) -> snapshot|null. Class-level: pullClass(code) -> [snapshots], pushAssignment(a), pullAssignments(code).
   Supabase design (docs/backend/SETUP.md + schema.sql): teacher = Supabase Auth email (magic link); students = anonymous sign-in joined to a class by class code (no student emails, COPPA-friendly);
   Row Level Security: a student reads/writes only their own progress row, the class teacher reads every row in their class. */
function sbHeaders(cfg,session,extra){return Object.assign({apikey:cfg.anonKey,Authorization:`Bearer ${session&&session.access_token||cfg.anonKey}`,"Content-Type":"application/json"},extra||{})}
function sbFetch(){return(typeof fetch!=="undefined"?fetch:null)}
const ADAPTERS={
 local:{name:"This device",ready:()=>true,
   async push(snap,store){store=store||(typeof localStorage!=="undefined"?localStorage:null);if(!store)return false;const k="lu_sync_"+(snap.id||snap.name);const prev=store.getItem(k);const m=merge(prev?JSON.parse(prev):null,snap);store.setItem(k,JSON.stringify(m));return m},
   async pull(id,store){store=store||(typeof localStorage!=="undefined"?localStorage:null);const v=store&&store.getItem("lu_sync_"+id);return v?JSON.parse(v):null}},
 file:{name:"Class code / progress file",ready:()=>true,async push(snap){return encode("progress",snap)},async pull(code){const d=decode(code);if(d.kind!=="progress")throw new Error("That is not a progress code");return d.data}},
 supabase:{name:"Supabase (centralized accounts)",ready:cfg=>!!(cfg&&/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.url||"")&&cfg.anonKey),
   async signInAnon(cfg,f){f=f||sbFetch();const r=await f(`${cfg.url}/auth/v1/signup`,{method:"POST",headers:sbHeaders(cfg),body:JSON.stringify({data:{}})});if(!r.ok)throw new Error("anonymous sign-in failed "+r.status);return r.json()},
   async magicLink(cfg,email,redirect,f){f=f||sbFetch();const r=await f(`${cfg.url}/auth/v1/otp`,{method:"POST",headers:sbHeaders(cfg),body:JSON.stringify({email,create_user:true,options:{email_redirect_to:redirect}})});if(!r.ok)throw new Error("magic link failed "+r.status);return true},
   sessionFromHash(hash){const p=new URLSearchParams(String(hash||"").replace(/^#/,""));return p.get("access_token")?{access_token:p.get("access_token"),refresh_token:p.get("refresh_token"),expires_at:Date.now()+(+p.get("expires_in")||3600)*1000}:null},
   async joinClass(cfg,session,classCode,nickname,f){f=f||sbFetch();const r=await f(`${cfg.url}/rest/v1/rpc/join_class`,{method:"POST",headers:sbHeaders(cfg,session),body:JSON.stringify({p_class_code:classCode,p_nickname:nickname})});if(!r.ok)throw new Error("join failed "+r.status);return r.json()},
   async push(snap,cfg,session,f){if(!this.ready(cfg))throw new Error("Backend not configured");f=f||sbFetch();
     /* merge with the server copy first so two devices never overwrite each other */
     let server=null;try{server=await this.pull(snap.id,cfg,session,f)}catch(e){}const m=merge(server,snap);
     const r=await f(`${cfg.url}/rest/v1/progress?on_conflict=student_id`,{method:"POST",headers:sbHeaders(cfg,session,{Prefer:"resolution=merge-duplicates,return=minimal"}),body:JSON.stringify({student_id:m.id,class_code:m.classCode,data:m,updated_at:new Date(m.at).toISOString()})});if(!r.ok)throw new Error("sync failed "+r.status);return m},
   async pull(id,cfg,session,f){if(!this.ready(cfg))throw new Error("Backend not configured");f=f||sbFetch();const r=await f(`${cfg.url}/rest/v1/progress?student_id=eq.${encodeURIComponent(id)}&select=data`,{headers:sbHeaders(cfg,session)});if(!r.ok)throw new Error("pull failed "+r.status);const j=await r.json();return j[0]?j[0].data:null},
   async pullClass(classCode,cfg,session,f){f=f||sbFetch();const r=await f(`${cfg.url}/rest/v1/progress?class_code=eq.${encodeURIComponent(classCode)}&select=data`,{headers:sbHeaders(cfg,session)});if(!r.ok)throw new Error("class pull failed "+r.status);return(await r.json()).map(x=>x.data)},
   async pushAssignment(a,classCode,cfg,session,f){f=f||sbFetch();const r=await f(`${cfg.url}/rest/v1/assignments`,{method:"POST",headers:sbHeaders(cfg,session,{Prefer:"return=minimal"}),body:JSON.stringify({id:a.id,class_code:classCode,data:a})});if(!r.ok)throw new Error("assign failed "+r.status);return true},
   async pullAssignments(classCode,cfg,session,f){f=f||sbFetch();const r=await f(`${cfg.url}/rest/v1/assignments?class_code=eq.${encodeURIComponent(classCode)}&select=data&order=created_at.desc&limit=50`,{headers:sbHeaders(cfg,session)});if(!r.ok)throw new Error("assignments pull failed "+r.status);return(await r.json()).map(x=>x.data)}}};
function adapter(cfg){return cfg&&ADAPTERS.supabase.ready(cfg)?"supabase":"local"}
const API={VERSION,encode,decode,fnv,snapshot,merge,analytics,studentRow,recommend,assignment,applyAssignment,growthReport,assignmentStatus,classCSV,ADAPTERS,adapter,SK,MISSKILL,PRE};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.CLASSROOM=API})(typeof window!=="undefined"?window:globalThis);
