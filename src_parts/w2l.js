
/* ---------- 8. ARCADE CABINET MATH: every machine is a grade-4 math mini-game on E ----------
   One standard per machine (src_learn/cabinets.js, checked by tools/verify_cabinets.js). 3-question rounds with a
   reteach hint after a miss; Prize Claw is an XP wager (5/10/25, capped at 1/4 of your XP, never below 0).
   Ticket Blaster VR (w2k) is separate. Kept in its own part so other arcade work doesn't collide. */
(function(){
if(!window.CABQ){const sc=document.createElement("script");sc.src="learn_cabinets.js";document.head.appendChild(sc)}
const CABS={
  space:{kind:"mult",name:"Space Blasters",img:"tex/cab_space_screen.webp",col:"#ff2bd4",tag:"Blast the right answer!"},
  racer:{kind:"div",name:"Racer X",img:"tex/cab_racer_screen.webp",col:"#ff9a1a",tag:"Pick the right lane: quotient R remainder."},
  jump:{kind:"place",name:"Jump Hero",img:"tex/cab_jump_screen.webp",col:"#3d9bff",tag:"Jump to the right platform."},
  hoop:{kind:"meas",name:"Hoop Shot",img:"tex/cab_hoop_screen.webp",col:"#ff5d1a",tag:"Sink the right conversion."},
  rush:{kind:"money",name:"Neon Coin Rush",img:"tex/neon_coin_rush.webp",col:"#ffd23f",tag:"Grab the coin with the right amount."},
  claw:{kind:"frac",name:"Prize Claw",img:"tex/cab_claw.webp",col:"#2bd9ff",tag:"Bet XP, answer right, and the claw grabs a prize.",wager:true},
  pins:{kind:"addsub",name:"Galaxy Pins",img:"tex/cab_pins_side.webp",col:"#ffb000",tag:"Light up the right score."},
  foos:{kind:"cmp",name:"Foosball",img:null,emoji:"⚽",col:"#22c55e",tag:"Who scored more? Times as many!"},
  hockey:{kind:"factor",name:"Air Hockey",img:"tex/hockey_top.webp",col:"#2bd9ff",tag:"Slap the right puck."}};
const SPOT={space:[-7.55,-4.2],racer:[-7.55,-2.35],jump:[-7.55,-.5],rush:[-7.55,1.4],hoop:[7.55,-3.4],claw:[7.55,-1.35],pins:[6.35,3.15],foos:[-5.6,3.35],hockey:[0,-2.35]};
const ROUND=3;
const st={open:false,id:null,it:null,i:0,tries:0,first:0,xp:0,tix:0,stake:0,phase:null,log:[]};
const lvKey=k=>"lu_cab_lv_"+k,getLv=k=>Math.max(1,Math.min(3,+(localStorage.getItem(lvKey(k))||1))),setLv=(k,v)=>localStorage.setItem(lvKey(k),String(Math.max(1,Math.min(3,v))));
const curXP=()=>{try{return parent.lvXP()}catch(_){return +(localStorage.getItem("lu_cab_xp_fallback")||0)}};
const post=m=>{try{parent.postMessage(m,"*")}catch(_){}};
const sfx=(f,d=.08)=>{try{beep(f,d,"triangle",.05)}catch(_){}};
const UI=document.createElement("div");UI.id="cabui";UI.setAttribute("role","dialog");UI.setAttribute("aria-modal","true");
UI.style.cssText="position:fixed;inset:0;z-index:2147483002;display:none;align-items:center;justify-content:center;background:rgba(6,2,20,.82);font:700 16px 'Trebuchet MS',system-ui,sans-serif;color:#fff";
document.body.appendChild(UI);
const css=document.createElement("style");css.textContent=`
#cabui .cc{width:min(94vw,560px);max-height:94vh;overflow:auto;background:linear-gradient(180deg,#1a0b33,#0d0620);border:3px solid var(--c);border-radius:20px;box-shadow:0 0 30px var(--c);padding:.7rem .85rem}
#cabui .hd{display:flex;gap:.7rem;align-items:center}#cabui .hd img,#cabui .hd .em{width:96px;height:72px;object-fit:cover;border-radius:12px;border:2px solid var(--c);flex:none;background:#000;display:flex;align-items:center;justify-content:center;font-size:44px}
#cabui h2{margin:0;font:900 22px 'Trebuchet MS',sans-serif;color:var(--c);text-shadow:0 0 10px var(--c)}#cabui .chip{display:inline-block;margin-top:.2rem;background:#fff;color:#14123a;border-radius:999px;padding:.05rem .55rem;font:800 12px system-ui}
#cabui .tg{font:600 13px system-ui;opacity:.85;margin-top:.15rem}#cabui .dots{display:flex;gap:.35rem;margin:.6rem 0 .3rem}#cabui .dots i{width:14px;height:14px;border-radius:50%;background:#3a2a5a;display:block}#cabui .dots i.ok{background:#22ff88}#cabui .dots i.no{background:#ff4d6d}#cabui .dots i.now{outline:2px solid var(--c)}
#cabui .q{font:900 23px 'Trebuchet MS',sans-serif;line-height:1.25;margin:.45rem 0 .6rem;min-height:2.4em}
#cabui .ch{display:grid;grid-template-columns:1fr 1fr;gap:.55rem}#cabui .ch button{min-height:58px;border:3px solid var(--c);border-radius:14px;background:#24124a;color:#fff;font:900 21px 'Trebuchet MS',sans-serif;cursor:pointer;touch-action:manipulation}
#cabui .ch button:hover{background:#3a1c70}#cabui .ch button.right{background:#169c55;border-color:#22ff88}#cabui .ch button.wrong{background:#8a1630;border-color:#ff4d6d;opacity:.75}#cabui .ch button:disabled{cursor:default}
#cabui .fb{min-height:1.5em;margin:.55rem 0 .2rem;font:800 17px system-ui}#cabui .hint{background:#fff8e0;color:#14123a;border-radius:12px;padding:.5rem .7rem;font:700 15px system-ui;margin:.3rem 0}
#cabui .ft{display:flex;gap:.5rem;justify-content:flex-end;flex-wrap:wrap;margin-top:.5rem}#cabui .ft button,#cabui .stk button{min-height:48px;min-width:48px;border:3px solid #14123a;border-radius:12px;font:900 17px 'Trebuchet MS',sans-serif;padding:.3rem .9rem;cursor:pointer;touch-action:manipulation}
#cabui .go{background:#ffd23f;color:#14123a}#cabui .x{background:#2a2448;color:#fff;border-color:#fff!important}
#cabui .stk{display:grid;grid-template-columns:repeat(4,1fr);gap:.45rem;margin:.6rem 0}#cabui .stk button{background:#2bd9ff;color:#14123a}#cabui .stk button:disabled{background:#555;color:#999;cursor:not-allowed}#cabui .stk button[data-stake="0"]{background:#fff}
#cabui .clawbox{position:relative;height:120px;background:#120826;border:2px solid var(--c);border-radius:12px;overflow:hidden;margin:.4rem 0}#cabui .clawbox .cl{position:absolute;left:50%;top:-6px;transform:translateX(-50%);font-size:40px;transition:top .7s ease-in}#cabui .clawbox .cl::before{content:"";position:absolute;left:50%;bottom:90%;width:3px;height:200px;background:#ccc}
#cabui .clawbox .pz{position:absolute;bottom:6px;left:0;right:0;text-align:center;font-size:34px;letter-spacing:.3rem}#cabui .clawbox.grab .cl{top:58px}#cabui .clawbox.up .cl{top:-6px}
@media (max-width:420px){#cabui .q{font-size:20px}#cabui .ch button{font-size:19px;min-height:54px}#cabui .hd img,#cabui .hd .em{width:76px;height:58px}}`;document.head.appendChild(css);
function header(c){return `<div class="hd">${c.img?`<img src="${c.img}" alt="${c.name}">`:`<div class="em">${c.emoji||"🕹️"}</div>`}<div><h2>${c.name}</h2><span class="chip">CCSS ${CABQ.KINDS[c.kind].std} · ${CABQ.KINDS[c.kind].name}</span><div class="tg">${c.tag}</div></div></div>`}
function open(id){if(st.open||QG||W2.blaster||(W2.ui&&!st.open))return false;if(!window.CABQ){setTimeout(()=>open(id),300);return true}
  const c=CABS[id];if(!c)return false;try{document.exitPointerLock()}catch(_){}for(const k in K)K[k]=false;
  Object.assign(st,{open:true,id,c,i:0,tries:0,first:0,xp:0,tix:0,stake:0,log:[],it:null});W2.ui=true;UI.style.setProperty("--c",c.col);UI.style.display="flex";
  sfx(660);setTimeout(()=>sfx(880),90);if(c.wager)stakeScreen();else ask();return true}
function close(){if(!st.open)return;UI.style.display="none";st.open=false;st.phase=null;W2.ui=false;for(const k in K)K[k]=false}
function ask(){const c=st.c;st.it=CABQ.make(c.kind,getLv(c.kind));st.tries=0;st.phase="ask";
  UI.innerHTML=`<div class="cc">${header(c)}${c.wager?`<div class="fb">Bet: <b>${st.stake?st.stake+" XP":"practice (no bet)"}</b></div><div class="clawbox" id="cabclaw"><div class="cl">🦾</div><div class="pz">🧸🐙🍬🟢🚗</div></div>`:`<div class="dots">${[...Array(ROUND)].map((_,k)=>`<i class="${k<st.log.length?(st.log[k]?"ok":"no"):k===st.i?"now":""}"></i>`).join("")}</div>`}
    <div class="q" id="cabq">${st.it.text}</div><div class="ch">${st.it.choices.map((v,k)=>`<button data-i="${k}" aria-label="Answer ${k+1}: ${v}"><small style="opacity:.6;font-size:13px">${k+1}</small> ${v}</button>`).join("")}</div>
    <div class="fb" id="cabfb"></div><div id="cabhint"></div><div class="ft"><button class="x" data-x>✕ Close</button></div></div>`;
  UI.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>answer(+b.dataset.i));UI.querySelector("[data-x]").onclick=close}
function answer(k){if(st.phase!=="ask")return;const it=st.it,b=UI.querySelectorAll("[data-i]")[k];if(!b||b.disabled)return;const v=it.choices[k],ok=v===it.ans;st.tries++;
  const fb=UI.querySelector("#cabfb"),hint=UI.querySelector("#cabhint");
  if(st.c.wager)return settleClaw(ok,b);
  if(ok){b.classList.add("right");UI.querySelectorAll("[data-i]").forEach(x=>x.disabled=true);const first=st.tries===1,xp=first?3:1,tix=first?3:1;st.xp+=xp;st.tix+=tix;if(first)st.first++;st.log.push(first);
    fb.textContent=(first?["🔥 Nailed it!","💥 Direct hit!","⚡ Perfect!"][st.i%3]:"✅ Got it on the second try!")+`  +${xp} XP · +${tix} 🎟️`;sfx(first?988:784,.12);
    const sk=CABQ.KINDS[it.kind].sk;if(sk)post({lv3d:"skillres",src:"street",sk,lv:it.lv,tries:st.tries,why:null,ms:0,xp});else st.pend=(st.pend||0)+xp;
    st.phase="next";setTimeout(next,first?900:1400);return}
  b.classList.add("wrong");b.disabled=true;sfx(220,.15);
  hint.innerHTML=`<div class="hint">💡 ${it.hint}</div>`;
  if(st.tries>=2){UI.querySelectorAll("[data-i]").forEach(x=>{x.disabled=true;if(x.textContent.trim().endsWith(it.ans)&&it.choices[+x.dataset.i]===it.ans)x.classList.add("right")});st.log.push(false);
    fb.textContent=`The answer is ${it.ans}. You'll get the next one!`;const sk=CABQ.KINDS[it.kind].sk;if(sk)post({lv3d:"skillres",src:"street",sk,lv:it.lv,tries:2,why:it.hint,ms:0,xp:1});
    st.phase="next";UI.querySelector(".ft").insertAdjacentHTML("afterbegin",`<button class="go" data-n>Next ▶</button>`);UI.querySelector("[data-n]").onclick=next}
  else fb.textContent="Not quite — read the hint and try again."}
function next(){if(!st.open)return;st.i++;if(st.i<ROUND)return ask();summary()}
function summary(){const c=st.c,lv=getLv(c.kind);if(st.first>=ROUND)setLv(c.kind,lv+1);else if(st.first<=1)setLv(c.kind,lv-1);
  TIX.n=TIX.n+st.tix;if(st.pend){post({lv3d:"mres",review:true,id:0,idx:0,tries:1,xp:st.pend,coins:0});st.pend=0}
  st.phase="done";const stars=st.first===3?"⭐⭐⭐":st.first===2?"⭐⭐":st.first===1?"⭐":"💪";
  UI.innerHTML=`<div class="cc">${header(c)}<div class="q" style="text-align:center">${stars}<br>${st.first} of ${ROUND} on the first try</div>
    <div class="fb" style="text-align:center">+${st.xp} XP · +${st.tix} 🎟️ tickets</div><div class="tg" style="text-align:center">${st.first>=ROUND&&lv<3?"Level up! Next round gets harder.":st.first<=1&&lv>1?"Next round is a little easier — you've got this.":""}</div>
    <div class="ft"><button class="go" data-again>Play again</button><button class="x" data-x>✕ Close</button></div></div>`;
  UI.querySelector("[data-again]").onclick=()=>{Object.assign(st,{i:0,first:0,xp:0,tix:0,log:[]});ask()};UI.querySelector("[data-x]").onclick=close;sfx(1046,.15)}
/* --- Prize Claw: XP wager --- */
function stakeScreen(){const c=st.c,xp=curXP(),mx=CABQ.maxStake(xp);st.phase="stake";
  UI.innerHTML=`<div class="cc">${header(c)}<div class="q" style="font-size:19px">Bet some XP on a fraction question.<br><span style="color:#22ff88">Right → win 2× your bet.</span> <span style="color:#ff8fa3">Wrong → lose your bet.</span></div>
    <div class="tg">Your XP: <b id="cabxp">${xp}</b> · biggest bet allowed: <b>${mx}</b> (¼ of your XP). Your XP never goes below 0.</div>
    <div class="stk">${CABQ.STAKES.map(s=>`<button data-stake="${s}" ${CABQ.stakeOK(xp,s)?"":"disabled"}>${s} XP</button>`).join("")}<button data-stake="0">Practice</button></div>
    <div class="ft"><button class="x" data-x>✕ Close</button></div></div>`;
  UI.querySelectorAll("[data-stake]").forEach(b=>b.onclick=()=>{if(b.disabled)return;st.stake=+b.dataset.stake;st.xp0=curXP();ask()});UI.querySelector("[data-x]").onclick=close}
function settleClaw(ok,b){st.phase="settle";const it=st.it,r=CABQ.settle(st.xp0,st.stake,ok);st.result=r;
  UI.querySelectorAll("[data-i]").forEach(x=>{x.disabled=true;if(it.choices[+x.dataset.i]===it.ans)x.classList.add("right")});if(!ok)b.classList.add("wrong");
  const box=UI.querySelector("#cabclaw"),fb=UI.querySelector("#cabfb");box.classList.add("grab");drop3D(ok);sfx(ok?700:300,.2);
  setTimeout(()=>{box.classList.remove("grab");box.classList.add("up");if(ok){box.querySelector(".cl").textContent="🦾🧸";box.querySelector(".pz").textContent="🐙🍬🟢🚗"}
    fb.innerHTML=ok?`🎉 The claw grabbed a prize! <b style="color:#22ff88">+${r.delta} XP</b>`:`😬 The claw slipped! ${r.delta<0?`<b style="color:#ff8fa3">${r.delta} XP</b>`:"No XP lost (practice)."}`;
    if(!ok)UI.querySelector("#cabhint").innerHTML=`<div class="hint">💡 ${it.hint}</div>`;
    if(r.delta)post({lv3d:"mres",review:true,id:0,idx:0,tries:1,xp:r.delta,coins:0});
    st.phase="done";UI.querySelector(".ft").insertAdjacentHTML("afterbegin",`<button class="go" data-again>Play again</button>`);UI.querySelector("[data-again]").onclick=()=>setTimeout(stakeScreen,60)},800)}
/* the real 3D claw drops and lifts too */
let CL=null;function findClaw(){if(CL)return CL;const grp=AR.g.children.find(o=>o.isGroup&&Math.abs(o.position.x-7.55)<.01&&Math.abs(o.position.z+1.35)<.01);if(grp)CL=grp.children.find(o=>o.isGroup&&Math.abs(o.position.y-2.28)<.01)||null;return CL}
function drop3D(ok){const c=findClaw();if(!c)return;const y0=2.28,t0=performance.now();(function f(){const k=(performance.now()-t0)/1600;c.position.y=y0-.8*Math.sin(Math.min(1,k)*Math.PI);if(k<1)requestAnimationFrame(f);else c.position.y=y0})()}
addEventListener("keydown",e=>{if(!st.open)return;if(e.key==="Escape"){close();return}if(st.phase==="ask"&&/^[1-4]$/.test(e.key))answer(+e.key-1);e.stopPropagation()},true);
const _blk=BLOCKIN;BLOCKIN=()=>_blk()||st.open;
/* wire every arcade cabinet's E prompt to its math game */
const lab=id=>{const c=CABS[id],k=CABQ?CABQ.KINDS[c.kind]:null;return `Press E — 🕹️ ${c.name}${c.wager?": bet XP on fractions":k?": "+k.name.toLowerCase():""}`};
function wire(){for(const id in SPOT){const [x,z]=SPOT[id];const t=TAPS.find(t=>t.area==="arcade"&&Math.abs(t.x-(AR.cx+x))<1e-6&&Math.abs(t.z-(AR.cz+z))<1e-6);
  if(t){t.fn=()=>open(id);t.label=window.CABQ?lab(id):"Press E — 🕹️ "+CABS[id].name;t.cab=id}else mkTap("arcade",x,z,"Press E — 🕹️ "+CABS[id].name,()=>open(id),1.35)}}
wire();{const iv=setInterval(()=>{if(window.CABQ){wire();clearInterval(iv)}},300)}
/* a wandering NPC (talk = Q) or another nearby prompt must not steal E while you stand at a cabinet */
function nearCab(){if(AREA!=="arcade")return null;let best=null,bd=1.4;for(const id in SPOT){const d=Math.hypot(P.x-(AR.cx+SPOT[id][0]),P.z-(AR.cz+SPOT[id][1]));if(d<bd){bd=d;best=id}}return best}
const _tdL=tryDoor;tryDoor=function(){if(!st.open&&!QG&&!W2.ui&&!W2.blaster){const id=nearCab(),t=nearDoor&&nearDoor.type;if(id&&(!t||t==="talk"||t==="tap"))return open(id)}return _tdL()};
/* perf: only the room you're in keeps its lights on. Extra room lights (arcade fills, Prize Corner spots...) used to stay
   live on the street and slowed every frame there (CI street fps 3 -> 2, Brock walk-up timed out). */
const _rl=roomLights;roomLights=function(){_rl();for(const k in ROOMS){const g=ROOMS[k].g;if(!g)continue;const on=AREA===k;g.traverse(o=>{if(o.isLight&&o!==ROOMS[k].light&&!(ROOMS[k].light&&o===ROOMS[k].light.userData.hemi))o.visible=on})}};
roomLights();
/* show the cabinet's E prompt even when Theo or the worker is close by (Q still talks) */
const _intL=interactions;interactions=function(){const L=_intL();if(AREA!=="arcade"||QG||st.open||W2.ui||W2.blaster)return L;const id=nearCab();if(!id)return L;
  if(L.some(d=>d.type!=="talk"&&d.type!=="tap"&&Math.hypot(d.x-P.x,d.z-P.z)<d.r))return L;const t=TAPS.find(t=>t.cab===id);if(!t)return L;
  return [{type:"tap",t,x:P.x,z:P.z,r:9,label:t.label}].concat(L.filter(d=>d.type!=="tap"))};
window.CABG={nearCab,open,close,st,CABS,SPOT,answer};
})();
