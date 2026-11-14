// P5 verification: codes, cross-device merge, class analytics, recommendations, assignments, growth reports, sync adapters (mock backend).
const C=require('../src_learn/classroom.js');const fails=[];const ok=(c,m)=>{if(!c)fails.push(m)};
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;const DAY=864e5,NOW=Date.UTC(2026,10,14);
const MIS=Object.keys(C.MISSKILL);
function student(i,o){o=o||{};const m={},log=[];const t0=NOW-30*DAY;
  for(const k of C.SK){const lv=1+Math.floor(rnd()*(o.strong?6:4));m[k]={lv,ev:[],checks:[]};
    for(let j=0;j<8;j++){const t=t0+Math.floor(rnd()*29*DAY);const okk=rnd()<(o.weak?.4:.8);m[k].ev.push({t,lv,first:okk,rep:"typed",ind:true,src:"path"});log.push({t,d:new Date(t).toISOString().slice(0,10),sk:k,lv,ok:okk?1:0,code:okk?null:MIS[Math.floor(rnd()*(o.mis?2:MIS.length))]})}
    if(rnd()<.2)m[k].checks.push({lv,at:NOW-DAY,step:0});m[k].ev.sort((a,b)=>a.t-b.t)}
  log.sort((a,b)=>a.t-b.t);const h=[{t:t0,d:"2026-10-15",scale:440+Math.floor(rnd()*40),kind:"full"},{t:NOW-2*DAY,d:"2026-11-12",scale:460+Math.floor(rnd()*60),kind:"checkup"}];
  return{studentId:"s"+i,name:"Kid"+i,xp:100*i,coins:5,learn:{m,log,time:{"2026-11-10":600000},history:h,diag:Object.assign({gaps:o.gap?[{prereq:"groups",skill:"mult"}]:[]},h[1]),base:Object.fromEntries(C.SK.map(k=>[k,1])),sessions:4,interventions:[]}}}
// ---- codes
for(let i=0;i<200;i++){const S=student(i,{});const snap=C.snapshot(S);const code=C.encode("progress",snap);const d=C.decode(code);ok(d.kind==="progress"&&JSON.stringify(d.data)===JSON.stringify(snap),"roundtrip "+i);
  const pos=20+Math.floor(rnd()*(code.length-21));const ch=code[pos]==="A"?"B":"A";let threw=false;try{C.decode(code.slice(0,pos)+ch+code.slice(pos+1))}catch(e){threw=true}ok(threw,"tamper not detected "+i);
  ok(C.decode(code.replace(/(.{40})/g,"$1\n ")).kind==="progress","whitespace-tolerant "+i)}
{const c=C.encode("class",{id:"c1",name:"4B — Ms. Okafor’s class 🍎",teacher:"Ms. Okafor"});ok(C.decode(c).data.name==="4B — Ms. Okafor’s class 🍎","unicode class code");ok(/^LUC-/.test(c),"class code prefix")}
for(const bad of ["","hello","LUP-zzzz-abc","LUP-00000000-"]){let t=false;try{C.decode(bad)}catch(e){t=true}ok(t,"bad code accepted: "+bad)}
// ---- merge: two devices, nothing lost, idempotent, order-independent for evidence
for(let i=0;i<200;i++){const S=student(i,{});const a=C.snapshot(S);const b=JSON.parse(JSON.stringify(a));
  const split=NOW-10*DAY;a.learn.log=a.learn.log.filter(e=>e.t<split||e.t%2);b.learn.log=b.learn.log.filter(e=>e.t<split||!(e.t%2));
  for(const k of C.SK){b.learn.m[k].ev=b.learn.m[k].ev.concat([{t:NOW-DAY+i,lv:b.learn.m[k].lv,first:true,rep:"visual",ind:true,src:"path"}]);if(k==="mult"){b.learn.m[k].lv=Math.min(6,b.learn.m[k].lv+1)}}
  b.at=a.at+1000;const m1=C.merge(a,b),m2=C.merge(b,a),m3=C.merge(m1,b);
  ok(m1.learn.log.length===S.learn.log.length,"log lost/duplicated "+i+" "+m1.learn.log.length+"/"+S.learn.log.length);
  for(const k of C.SK){ok(m1.learn.m[k].ev.length===S.learn.m[k].ev.length+1,"evidence lost "+k+" "+i);ok(m1.learn.m[k].ev.length===m2.learn.m[k].ev.length,"merge order changes evidence "+k)}
  ok(m1.learn.m.mult.lv===b.learn.m.mult.lv,"newer device level not kept "+i);ok(JSON.stringify(m3.learn.m)===JSON.stringify(m1.learn.m)&&m3.learn.log.length===m1.learn.log.length,"merge not idempotent "+i);
  ok(m1.learn.history.length===2,"history duplicated "+i);ok(m1.xp===a.xp,"xp")}
{const a=C.snapshot(student(1,{})),b=JSON.parse(JSON.stringify(a));b.learn.responses=[{t:5,text:"x",auto:2}];a.learn.responses=[{t:5,text:"x",auto:2,teacher:3,scoredAt:9}];ok(C.merge(b,a).learn.responses[0].teacher===3&&C.merge(a,b).learn.responses[0].teacher===3,"teacher score lost in merge")}
{const a=C.snapshot(student(2,{}));const b=JSON.parse(JSON.stringify(a));a.learn.m.mult.done=NOW-5*DAY;b.learn.m.mult.ev.push({t:NOW,lv:6,first:false,src:"check"});b.learn.m.mult.done=false;ok(!C.merge(a,b).learn.m.mult.done,"slip on newer device must remove mastery")}
// ---- class analytics
const cls=[];for(let i=0;i<28;i++)cls.push(C.snapshot(student(i,i<5?{weak:true,mis:true,gap:true}:i>24?{strong:true}:{})));
cls.push({id:"s99",name:"NewKid",learn:{}});
const A=C.analytics(cls,NOW);ok(A.n===29,"n");ok(C.SK.every(k=>A.skill[k].dist.reduce((a,b)=>a+b,0)===29),"level distribution sums");
ok(A.meanScale>=440&&A.meanScale<=520,"mean scale "+A.meanScale);ok(A.mis.length>0&&A.mis[0].students>=A.mis[A.mis.length-1].students,"misconceptions sorted");
ok(A.needsAttention.includes("NewKid"),"inactive student flagged");ok(["Kid0","Kid1","Kid2","Kid3","Kid4"].filter(n=>A.needsAttention.includes(n)).length>=4,"struggling students flagged: "+A.needsAttention.join(","));
ok(A.groups.every(g=>g.students.length>=2),"groups size");
for(const r of A.rows){ok(C.SK.every(k=>r.levels[k]>=1&&r.levels[k]<=6),"levels range "+r.name);if(r.firstTry14!=null)ok(r.firstTry14>=0&&r.firstTry14<=100,"pct")}
// ---- recommendations
for(const s of cls){const rec=C.recommend(s,NOW);ok(rec.length<=6,"rec count");ok(rec.every(x=>["mission","prereq","memory","practice","conference"].includes(x.type)&&x.why),"rec shape");
  for(let i=1;i<rec.length;i++)ok(rec[i-1].priority<=rec[i].priority,"rec order");
  ok(rec.filter(x=>x.type==="mission").every(x=>C.MISSKILL[x.code]),"mission code valid");
  const keys=rec.map(x=>x.type+(x.code||x.sk||""));ok(new Set(keys).size===keys.length,"rec duplicate")}
{const weak=cls[0],rec=C.recommend(weak,NOW);ok(rec.some(x=>x.type==="mission"),"weak student gets mission");ok(rec.some(x=>x.type==="conference"),"weak student gets conference")}
// ---- assignments
{const a=C.assignment("Ms. Okafor",[{type:"mission",code:"regroup",due:"2026-11-20"},{type:"practice",sk:"mult"}],["s1","Kid2"],NOW);
  const S1=student(1,{}),S2=student(2,{}),S3=student(3,{});const r1=C.applyAssignment(S1,a),r2=C.applyAssignment(S2,a),r3=C.applyAssignment(S3,a),r1b=C.applyAssignment(S1,a);
  ok(r1.added===2&&r2.added===2,"assignment delivered");ok(r3.notForMe,"assignment for others");ok(r1b.dup,"duplicate assignment");
  ok(S1.learn.interventions.filter(x=>x.code==="regroup").length===1&&S1.learn.interventions[0].from==="teacher","mission added once from teacher");
  let st=C.assignmentStatus(C.snapshot(S1),a);ok(st.of===2&&st.done===0&&!st.complete,"status initially open");
  S1.learn.interventions[0].status="completed";for(let j=0;j<5;j++)S1.learn.log.push({t:NOW+1000+j,sk:"mult",lv:3,ok:1});
  st=C.assignmentStatus(C.snapshot(S1),a);ok(st.complete,"status complete after work");
  const all=C.assignment("T",[{type:"checkup"}],"all",NOW);ok(!C.applyAssignment(S3,all).notForMe,"whole-class assignment")}
// ---- growth report
for(const s of cls.slice(0,10)){const g=C.growthReport(s,NOW);ok(g.skills.length===C.SK.length,"report skills");ok(g.scale.length===2&&g.growth===g.scale[1].scale-g.scale[0].scale,"report growth");ok(g.skills.every(k=>k.change===k.now-1),"report change vs placement")}
{const g=C.growthReport(cls[28],NOW);ok(g.scale.length===0&&g.growth==null,"empty report")}
// ---- CSV
{const csv=C.classCSV(cls,NOW).split("\n");ok(csv.length===30,"csv rows");ok(csv[0].split(",").length===10+C.SK.length,"csv cols")}
// ---- sync adapters (mock Supabase REST)
(async()=>{const db={progress:{},assignments:[]};const calls=[];
  const mock=async(url,o)=>{o=o||{};calls.push({url,method:o.method||"GET",headers:o.headers});const u=new URL(url);
    if(u.pathname==="/auth/v1/signup")return{ok:true,json:async()=>({access_token:"tok",refresh_token:"r",expires_in:3600})};
    if(u.pathname==="/rest/v1/progress"&&o.method==="POST"){const b=JSON.parse(o.body);db.progress[b.student_id]=b;return{ok:true,json:async()=>[]}}
    if(u.pathname==="/rest/v1/progress"){const sid=u.searchParams.get("student_id"),cc=u.searchParams.get("class_code");const rows=Object.values(db.progress).filter(r=>sid?("eq."+r.student_id)===sid:("eq."+r.class_code)===cc);return{ok:true,json:async()=>rows.map(r=>({data:r.data}))}}
    if(u.pathname==="/rest/v1/assignments"&&o.method==="POST"){db.assignments.push(JSON.parse(o.body));return{ok:true}}
    if(u.pathname==="/rest/v1/assignments")return{ok:true,json:async()=>db.assignments.map(a=>({data:a.data}))};
    return{ok:false,status:404}};
  const SB=C.ADAPTERS.supabase,cfg={url:"https://abcd1234.supabase.co",anonKey:"anon"};
  ok(SB.ready(cfg)&&!SB.ready({url:"http://evil.com",anonKey:"x"})&&!SB.ready({url:"https://abcd.supabase.co"}),"ready() validation");
  ok(C.adapter(cfg)==="supabase"&&C.adapter(null)==="local","adapter choice");
  const sess=await SB.signInAnon(cfg,mock);ok(sess.access_token==="tok","anon sign-in");
  const S=student(5,{});S.classCode="c1";const a=C.snapshot(S),b=JSON.parse(JSON.stringify(a));
  a.learn.log=a.learn.log.slice(0,20);b.learn.log=b.learn.log.slice(20);
  await SB.push(a,cfg,sess,mock);const merged=await SB.push(b,cfg,sess,mock);
  ok(merged.learn.log.length===S.learn.log.length,"cloud push merges devices "+merged.learn.log.length+"/"+S.learn.log.length);
  ok((await SB.pull(a.id,cfg,sess,mock)).learn.log.length===S.learn.log.length,"cloud pull");
  ok(calls.filter(c=>c.url.includes("/rest/")).every(c=>c.headers.Authorization==="Bearer tok"&&c.headers.apikey==="anon"),"auth headers");
  const S6=C.snapshot(Object.assign(student(6,{}),{classCode:"c1"}));await SB.push(S6,cfg,sess,mock);ok((await SB.pullClass("c1",cfg,sess,mock)).length===2,"class pull");
  const asg=C.assignment("T",[{type:"checkup"}],"all",NOW);await SB.pushAssignment(asg,"c1",cfg,sess,mock);ok((await SB.pullAssignments("c1",cfg,sess,mock))[0].id===asg.id,"assignment sync");
  ok(SB.sessionFromHash("#access_token=abc&refresh_token=r&expires_in=3600").access_token==="abc"&&SB.sessionFromHash("#x=1")===null,"magic-link session parse");
  // local + file adapters
  const store={d:{},getItem(k){return this.d[k]||null},setItem(k,v){this.d[k]=v}};await C.ADAPTERS.local.push(a,store);const lm=await C.ADAPTERS.local.push(b,store);ok(lm.learn.log.length===S.learn.log.length,"local adapter merge");
  const code=await C.ADAPTERS.file.push(a);ok((await C.ADAPTERS.file.pull(code)).id===a.id,"file adapter");let t=false;try{await C.ADAPTERS.file.pull(C.encode("class",{}))}catch(e){t=true}ok(t,"file adapter rejects class code");
  const out={check:"classroom",students:cls.length,meanScale:A.meanScale,topMisconception:A.mis[0]&&A.mis[0].code,needsAttention:A.needsAttention.length,fails:fails.slice(0,30),failCount:fails.length};
  console.log(JSON.stringify(out,null,1));process.exit(fails.length?1:0)})();
