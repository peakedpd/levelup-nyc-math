/* LevelUp Placement Quest v2 + Check-Ups — UI on top of ASSESS (src_learn/assess.js).
   Formats: multiple choice, number keypad, fraction keypad, tap/drag array builder, word problems.
   Saves/resumes mid-quest; results show start point, confidence, prerequisite gaps, flagged misconceptions, scale score + growth. */
(function(){const A=window.ASSESS,LN=window.LEARN;if(!A||!window.LUI)return;const {L,record,runItem,WHO,lvTag,show}=LUI._,vis=LUI.vis;
document.head.insertAdjacentHTML("beforeend",`<style>
.dg-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;max-width:300px;margin:.5rem auto 0}
.dg-pad button{font:900 1.4rem 'Trebuchet MS',sans-serif;min-height:52px;border-radius:14px;border:3px solid var(--navy);background:#fff;cursor:pointer;touch-action:manipulation}
.dg-pad button.go{background:#2fbf71;color:#fff}.dg-pad button:active{transform:translateY(2px)}
.dg-disp{font:900 2rem 'Trebuchet MS',sans-serif;text-align:center;min-height:56px;border:3px dashed var(--navy);border-radius:14px;background:#fffbe8;margin:.4rem auto;max-width:300px;display:flex;align-items:center;justify-content:center;gap:.3rem}
.dg-disp .fr{display:inline-flex;flex-direction:column;align-items:center;line-height:1}.dg-disp .fr span{min-width:2.2rem;padding:0 .2rem;border-radius:8px}.dg-disp .fr span.on{background:#ffd23f}.dg-disp .fr hr{width:100%;border:0;border-top:4px solid var(--navy);margin:.15rem 0}
.dg-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;width:min(320px,92%);margin:.4rem auto;touch-action:none;user-select:none}
.dg-grid i{aspect-ratio:1;border-radius:50%;background:#e8e6f5;border:2px solid #c9c5e8}.dg-grid i.on{background:#ff5d8f;border-color:#b3264f}
.dg-tag{display:inline-block;font:800 .72rem sans-serif;padding:.1rem .45rem;border-radius:99px;background:#24407a;color:#fff;margin-left:.3rem;vertical-align:middle}
.dg-conf{font:800 .75rem sans-serif;padding:.1rem .4rem;border-radius:8px}.dg-conf.high{background:#c8f7d6}.dg-conf.medium{background:#fff1b8}.dg-conf.low{background:#ffd0d0}
.dg-scale{font:900 2.2rem 'Trebuchet MS',sans-serif;color:#24407a;text-align:center}
</style>`);
const FMTNAME={mc:"Pick one",num:"Type it",frac:"Type the fraction",array:"Build it",word:"Story problem"};
const isWordQ=A.isWord;
function genItem(st,nx){return A.chooseItem(LN,nx.sk,nx.lv,nx.k,(st.seed||1)+st.n*7919)}
function persist(st){const l=L();l.diagState=st;save()}
function start(opt){opt=opt||{};const l=L();let st=l.diagState&&l.diagState.v===2?l.diagState:null;
  if(!st){const kind=opt.kind||(l.diag?"checkup":"full");const prior=kind==="checkup"?Object.fromEntries(A.ORDER.map(sk=>[sk,Math.max(0,((l.m[sk]||{}).done?6:(l.m[sk]||{lv:1}).lv)-1)])):null;
    st=A.newState({kind,prior});st.seed=Math.floor(Math.random()*1e9)}
  persist(st);step(st)}
function step(st){const nx=A.next(st);if(!nx)return finish(st);const {it,fmt}=genItem(st,nx);const est=st.order.length*4,pct=Math.min(98,st.n/est*100);
  window.__luDiag={sk:nx.sk,lv:nx.lv,fmt,a:String(it.a),x:it.v&&it.v.x,n:st.n};window.__luLastAns=String(it.a);
  const title=st.kind==="checkup"?"🩺 Check-Up":"🧭 Placement Quest";const s=LN.SK[nx.sk];
  const talk=st.n===0?(st.kind==="checkup"?"Time for a quick Check-Up! It shows how much you've GROWN. Some questions get harder when you're ready.":"This quest shows me what you already know, so your path fits YOU. Questions get easier or harder as you go — that's on purpose! No hints this time, just try your best."):["Take your time.","You're doing great — keep going!","Tricky ones are how I learn about you.","Use scratch paper if you like!","Nice focus!"][st.n%5];
  openModal(`<div class="phead"><h2>${title}</h2><span class="small">${s.icon} ${s.name}<span class="dg-tag">${FMTNAME[fmt]}</span></span></div><div class="lu-bar"><i style="width:${pct}%"></i></div>
   <div class="lu-who"><img src="${WHO.sal.pic}" alt="Ms. Okafor"><div><b>Ms. Okafor</b><div>${talk}</div></div></div><div id="luItem" class="card" data-fmt="${fmt}"></div>
   <div class="ans"><button class="btn alt sm" data-x="pause">⏸ Save & finish later</button></div>`,m=>{m.querySelector("[data-x=pause]").onclick=()=>{persist(st);closeModal&&closeModal();toast("Saved! Your quest will resume where you left off.")};
     const box=m.querySelector("#luItem"),t0=performance.now();
     const done=(ok,why,code)=>{const ms=performance.now()-t0;const mis=ok?null:(code||A.misCode(why)||"other");A.answer(st,nx.sk,nx.lv,ok,{fmt,mis,ms:Math.round(ms),word:isWordQ(it.q)||undefined});record(nx.sk,nx.lv,ok,ms,why,"diag");persist(st);setTimeout(()=>step(st),ok===null?0:550)};
     if(fmt==="mc")runItem(box,it,{diag:true,hint:false,done:(ok,ms,why)=>done(ok,why)});else entry(box,it,fmt,done)})}
function ack(box){const msg=box.querySelector(".lu-msg");msg.style.color="#24407a";msg.textContent=["Got it! ✨","Thanks! On to the next one!","Nice effort! 💪","Recorded! ⭐"][Math.floor(Math.random()*4)];sfx("tap")}
function entry(box,it,fmt,done){const q=`<div class="lu-q">${it.q} <button class="btn alt sm" data-x="read" aria-label="Read aloud">🔊</button></div>`;let locked=false;
  if(fmt==="array"){const [k,n]=it.v.x;let R=0,C=0,drag=false;
    box.innerHTML=q+`<div class="small">Tap or drag to build an <b>array</b> that matches the problem (rows × columns). Then check your total.</div><div class="dg-grid" role="grid" aria-label="array builder">${Array.from({length:100},(_,i)=>`<i data-r="${Math.floor(i/10)+1}" data-c="${i%10+1}"></i>`).join("")}</div><div class="dg-disp" aria-live="polite">0 × 0 = 0</div><div class="ans"><button class="btn good" data-x="ok">✓ Check</button></div><div class="lu-msg"></div>`;
    const g=box.querySelector(".dg-grid"),disp=box.querySelector(".dg-disp");const paint=()=>{g.querySelectorAll("i").forEach(c=>c.classList.toggle("on",+c.dataset.r<=R&&+c.dataset.c<=C));disp.textContent=`${R} × ${C} = ${R*C}`};
    const at=e=>{const el=document.elementFromPoint(e.clientX,e.clientY);if(el&&el.dataset&&el.dataset.r){R=+el.dataset.r;C=+el.dataset.c;paint()}};
    g.addEventListener("pointerdown",e=>{drag=true;at(e)});g.addEventListener("pointermove",e=>{if(drag)at(e)});g.addEventListener("pointerup",()=>drag=false);g.addEventListener("pointerleave",()=>drag=false);
    g.querySelectorAll("i").forEach(c=>c.onclick=()=>{R=+c.dataset.r;C=+c.dataset.c;paint()});
    window.__luSetArray=(r,c)=>{R=r;C=c;paint()};
    box.querySelector("[data-x=ok]").onclick=()=>{if(locked)return;if(!R||!C){box.querySelector(".lu-msg").textContent="Build an array first!";return}locked=true;const r=A.checkEntry(it,"array",{rows:R,cols:C});ack(box);done(r.ok,r.why,r.code)}}
  else{const frac=fmt==="frac";let a="",b="",slot=0;
    box.innerHTML=q+`<div class="lu-vis">${vis(it.vis)}</div><div class="dg-disp" aria-live="polite"></div><div class="dg-pad">${[1,2,3,4,5,6,7,8,9].map(d=>`<button data-d="${d}">${d}</button>`).join("")}<button data-d="del" aria-label="delete">⌫</button><button data-d="0">0</button><button data-d="ok" class="go" aria-label="check">✓</button></div>${frac?`<div class="ans"><button class="btn alt sm" data-x="sw">↕ top / bottom</button></div>`:""}<div class="lu-msg"></div>`;
    const disp=box.querySelector(".dg-disp"),msg=box.querySelector(".lu-msg");const paint=()=>{disp.innerHTML=frac?`<span class="fr"><span data-s="0" class="${slot===0?"on":""}">${a||"&nbsp;"}</span><hr><span data-s="1" class="${slot===1?"on":""}">${b||"&nbsp;"}</span></span>`:(a?show(+a):"&nbsp;")};paint();if(frac)disp.onclick=e=>{const t=e.target.closest("[data-s]");if(t){slot=+t.dataset.s;paint()}};
    if(frac)box.querySelector("[data-x=sw]").onclick=()=>{slot=1-slot;paint()};
    const submit=()=>{if(locked)return;const resp=frac?`${a}/${b}`:a;const r=A.checkEntry(it,frac?"frac":"num",resp);if(r.invalid){msg.style.color="#b3261e";msg.textContent=frac?"Type a top and a bottom number.":"Type a number first.";return}locked=true;ack(box);done(r.ok,r.why,r.code)};
    const key=d=>{if(locked)return;if(d==="ok")return submit();if(d==="del"){if(frac&&slot===1&&!b)slot=0;else if(frac&&slot===1)b=b.slice(0,-1);else a=a.slice(0,-1)}else{if(frac&&slot===1){if(b.length<3)b+=d}else if(a.length<(frac?3:7)){a+=d}}paint()};
    box.querySelectorAll("[data-d]").forEach(x=>x.onclick=()=>key(x.dataset.d));
    const kh=e=>{if(!box.isConnected)return removeEventListener("keydown",kh);if(/^\d$/.test(e.key))key(e.key);else if(e.key==="Backspace")key("del");else if(e.key==="Enter")key("ok");else if(frac&&(e.key==="/"||e.key==="Tab")){e.preventDefault();slot=1;paint()}};addEventListener("keydown",kh);
    window.__luType=(s)=>{String(s).split("").forEach(ch=>{if(ch==="/"){slot=1;paint()}else if(/\d/.test(ch))key(ch)});key("ok")}}
  box.querySelector("[data-x=read]").onclick=()=>speak(it.q);if(S.settings&&S.settings.read)speak(it.q)}
const INTERV={regroup:"Regrouping Rescue (base-ten blocks)",remainder:"Remainder Detective",fraction:"Fraction Pizza Lab",partial:"Area-Model Builder",rounding:"Rounding Hills",factmult:"Factor Hunt",placeval:"Place-Value Garage",addmult:"Array Builder: × vs +",onestep:"Two-Step Story Mission",wrongop:"Operation Detective",count:"Equal-Groups Check",array:"Array Builder",other:"Teacher review"};
function finish(st){const l=L(),R=A.results(st),first=!l.diag;const place={},est={};
  A.ORDER.forEach(sk=>{const r=R.skills[sk];place[sk]=r.start;est[sk]=r.est;const m=l.m[sk]=l.m[sk]||{lv:1,recent:[],n:0,ok:0,taught:0};
    if(st.kind==="checkup"){/* retake: keep mastery evidence; only move the start point, never erase a finished skill */m.diagEv=(m.diagEv||[]).concat([{t:Date.now(),est:r.est,conf:r.confidence}]).slice(-10);if(!m.done){m.lv=r.start;m.taught=Math.min(m.taught||0,r.start)}}
    else{m.lv=r.start;m.recent=[];m.taught=r.start-1;m.diagEv=[{t:Date.now(),est:r.est,conf:r.confidence}]}});
  const rec={d:today(),t:Date.now(),kind:st.kind,sess:l.sessions||0,scale:R.scale,place,est,gaps:R.gaps,flagged:R.flagged,items:R.n,mins:R.mins,conf:Object.fromEntries(A.ORDER.map(sk=>[sk,R.skills[sk].confidence]))};
  l.diag=rec;if(!l.base)l.base=Object.assign({},place);l.history=(l.history||[]).concat([rec]).slice(-24);delete l.diagState;
  l.interventions=R.flagged.map(f=>({id:f.id,name:INTERV[f.id]||f.name,mis:f.name,from:"diagnostic",t:Date.now(),status:"assigned"}));save();award(30,10,"mission");sfx("level");
  const g=A.growth(l.history.filter(h=>h.scale));
  openModal(`<div class="phead"><h2>🎉 ${st.kind==="checkup"?"Check-Up":"Quest"} complete!</h2><span class="small">${R.n} questions · ${R.mins} min</span></div>
   <div class="lu-who"><img src="${WHO.sal.pic2}" alt="Ms. Okafor"><div><b>Ms. Okafor</b><div>Wonderful work, ${S.name||"friend"}! I ${first?"built":"updated"} <b>My Path</b> just for you. You'll start each skill where you're ready.</div></div></div>
   <div class="dg-scale" id="dgScale">${R.scale}<div class="small" style="font-size:.8rem">LevelUp scale score (380–560)${g&&g.checks>1?` · growth <b>${g.delta>=0?"+":""}${g.delta}</b> since first quest`:""}</div></div>
   <table class="lu-tbl" id="dgTbl"><tr><th>Skill</th><th>Start at</th><th>Evidence</th><th>Confidence</th></tr>${A.ORDER.map(sk=>{const r=R.skills[sk];return`<tr data-sk="${sk}"><td>${LN.SK[sk].icon} ${LN.SK[sk].name}<div class="small">${LN.SK[sk].std}</div></td><td>${lvTag(r.start)}</td><td class="small">${r.correct}/${r.items} · ${r.formats.map(f=>FMTNAME[f]||f).join(", ")}</td><td><span class="dg-conf ${r.confidence}">${r.confidence}</span></td></tr>`}).join("")}</table>
   ${R.gaps.length?`<div class="card" id="dgGaps" style="margin-top:.4rem"><b>🧱 Building blocks first</b>${Object.entries(R.gaps.reduce((o,x)=>((o[x.prereq]=o[x.prereq]||[]).push(x.skill),o),{})).map(([p,ks])=>`<div class="small">Strengthen <b>${LN.SK[p].name}</b> first → it unlocks ${ks.map(k=>LN.SK[k].name).join(", ")}</div>`).join("")}</div>`:""}
   ${R.flagged.length?`<div class="card" id="dgMis" style="margin-top:.4rem"><b>🔎 Things to practice</b>${R.flagged.map(f=>`<div class="small">${f.name} ×${f.count} → mission: <b>${INTERV[f.id]||"Teacher review"}</b></div>`).join("")}</div>`:""}
   <div class="ans"><button class="btn good" data-x="path">🗺️ Open My Path</button><span class="small">+30 XP · +10 coins for finishing!</span></div>`,m=>m.querySelector("[data-x=path]").onclick=()=>LUI.openPath())}
window.DIAG={start,finish,genItem,INTERV};})();
