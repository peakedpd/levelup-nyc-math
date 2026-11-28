
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
#cabui.mini{background:transparent!important;align-items:flex-end!important;pointer-events:none}#cabui.mini .cc{pointer-events:auto;width:min(96vw,500px);margin-bottom:10px;padding:.45rem .6rem;background:rgba(16,8,38,.9)}
#cabui.mini .hd img{width:54px;height:40px}#cabui.mini h2{font-size:17px}#cabui.mini .tg{display:none}#cabui.mini .q{font-size:19px;margin:.25rem 0 .35rem;min-height:0}
#cabui.mini .ch{gap:.4rem}#cabui.mini .ch button{min-height:48px;font-size:18px}#cabui.mini .fb{margin:.3rem 0 .1rem;font-size:15px}#cabui.mini .hint{font-size:14px;padding:.35rem .55rem}#cabui.mini .ft{margin-top:.3rem}#cabui.mini .ft button{min-height:44px}
#cabui.mini .stk{margin:.35rem 0}#cabui.mini .stk button{min-height:46px}
@media (min-width:700px){#cabui.mini{justify-content:flex-end!important;padding-right:16px}#cabui.mini .cc{width:min(44vw,440px)}}
@media (max-width:420px){#cabui .q{font-size:20px}#cabui .ch button{font-size:19px;min-height:54px}#cabui .hd img,#cabui .hd .em{width:76px;height:58px}}`;document.head.appendChild(css);
function header(c){return `<div class="hd">${c.img?`<img src="${c.img}" alt="${c.name}">`:`<div class="em">${c.emoji||"🕹️"}</div>`}<div><h2>${c.name}</h2><span class="chip">CCSS ${CABQ.KINDS[c.kind].std} · ${CABQ.KINDS[c.kind].name}</span><div class="tg">${c.tag}</div></div></div>`}
function open(id){if(st.open||QG||W2.blaster||(W2.ui&&!st.open))return false;if(!window.CABQ){setTimeout(()=>open(id),300);return true}
  const c=CABS[id];if(!c)return false;try{document.exitPointerLock()}catch(_){}for(const k in K)K[k]=false;
  Object.assign(st,{open:true,id,c,i:0,tries:0,first:0,xp:0,tix:0,stake:0,log:[],it:null});W2.ui=true;UI.style.setProperty("--c",c.col);UI.classList.toggle("mini",!!c.wager);UI.style.display="flex";if(c.wager)clawReset();
  sfx(660);setTimeout(()=>sfx(880),90);if(c.wager)stakeScreen();else ask();return true}
function close(){if(!st.open)return;UI.style.display="none";st.open=false;st.phase=null;W2.ui=false;for(const k in K)K[k]=false}
function ask(){const c=st.c;st.it=CABQ.make(c.kind,getLv(c.kind));st.tries=0;st.phase="ask";
  UI.innerHTML=`<div class="cc">${header(c)}${c.wager?`<div class="fb">Bet: <b>${st.stake?st.stake+" XP":"practice (no bet)"}</b></div>`:`<div class="dots">${[...Array(ROUND)].map((_,k)=>`<i class="${k<st.log.length?(st.log[k]?"ok":"no"):k===st.i?"now":""}"></i>`).join("")}</div>`}
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
  const fb=UI.querySelector("#cabfb");fb.textContent=ok?"✅ Right! The claw is going for it…":"❌ Not quite… the claw is going anyway…";sfx(ok?700:300,.2);
  clawGo(ok,prize=>{if(!st.open)return;
    fb.innerHTML=ok?`🎉 The claw grabbed the ${prize}! <b style="color:#22ff88">+${r.delta} XP</b>`:`😬 The ${prize} slipped out of the claw! ${r.delta<0?`<b style="color:#ff8fa3">${r.delta} XP</b>`:"No XP lost (practice)."}`;
    if(!ok)UI.querySelector("#cabhint").innerHTML=`<div class="hint">💡 ${it.hint}</div>`;
    if(r.delta)post({lv3d:"mres",review:true,id:0,idx:0,tries:1,xp:r.delta,coins:0});
    st.phase="done";UI.querySelector(".ft").insertAdjacentHTML("afterbegin",`<button class="go" data-again>Play again</button>`);UI.querySelector("[data-again]").onclick=()=>setTimeout(()=>{clawReset();stakeScreen()},60)})}
/* ---- the real 3D claw machine: prizes you can recognize inside the glass, a claw that moves, drops, closes and lifts ---- */
let CL=null,CG=null,FING=[],PZ=[];const CA={on:false};
function clawGrp(){if(CG)return CG;CG=AR.g.children.find(o=>o.isGroup&&Math.abs(o.position.x-7.55)<.01&&Math.abs(o.position.z+1.35)<.01)||null;return CG}
function findClaw(){if(CL)return CL;const g=clawGrp();if(g)CL=g.children.find(o=>o.isGroup&&Math.abs(o.position.y-2.28)<.01)||null;if(CL)FING=CL.children.filter(m=>m.geometry&&m.geometry.type==="BoxGeometry").map(m=>({m,rx:m.rotation.x,rz:m.rotation.z,px:m.position.x,pz:m.position.z}));return CL}
const mt=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.5},o||{}));
const ms=(g,geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
function mkSquishy(){const g=new T.Group(),c=mt(0xff8fc8,{roughness:.9});const b=ms(g,new T.SphereGeometry(.11,16,12),c,0,.1,0);b.scale.set(1,.85,1);
  ms(g,new T.SphereGeometry(.04,10,8),c,-.075,.19,0);ms(g,new T.SphereGeometry(.04,10,8),c,.075,.19,0);const k=mt(0x111111);
  ms(g,new T.SphereGeometry(.014,8,6),k,-.04,.12,.095);ms(g,new T.SphereGeometry(.014,8,6),k,.04,.12,.095);ms(g,new T.SphereGeometry(.018,8,6),mt(0xff5a8c),-.07,.08,.085);ms(g,new T.SphereGeometry(.018,8,6),mt(0xff5a8c),.07,.08,.085);return g}
function mkSlime(){const g=new T.Group();ms(g,new T.CylinderGeometry(.085,.075,.1,18),mt(0xe8f4ff,{transparent:true,opacity:.85}),0,.05,0);
  const goo=ms(g,new T.SphereGeometry(.08,16,10,0,Math.PI*2,0,Math.PI/2),mt(0x39ff6a,{emissive:0x1a8a33,emissiveIntensity:.5,roughness:.15}),0,.095,0);goo.scale.y=.55;
  ms(g,new T.CylinderGeometry(.087,.087,.035,18),mt(0x8a2be2),0,.045,0);return g}
function mkCandy(){const g=new T.Group();ms(g,new T.CylinderGeometry(.008,.008,.2,6),mt(0xffffff),0,.1,0);
  const d=ms(g,new T.CylinderGeometry(.075,.075,.025,20),mt(0xff2b6a,{roughness:.25}),0,.24,0);d.rotation.x=Math.PI/2;
  const r=ms(g,new T.TorusGeometry(.045,.012,8,20),mt(0xfff35a,{roughness:.25}),0,.24,.014);const r2=ms(g,new T.TorusGeometry(.02,.009,8,16),mt(0x3dc2ff,{roughness:.25}),0,.24,.016);return g}
function mkSpinner(){const g=new T.Group(),c=mt(0x2bd9ff,{metalness:.5,roughness:.3});for(let i=0;i<3;i++){const a=i*Math.PI*2/3,l=ms(g,new T.CylinderGeometry(.045,.045,.025,16),c,Math.cos(a)*.065,.02,Math.sin(a)*.065);ms(g,new T.CylinderGeometry(.02,.02,.03,10),mt(0x333344,{metalness:.8}),Math.cos(a)*.065,.02,Math.sin(a)*.065)}
  ms(g,new T.CylinderGeometry(.035,.035,.03,14),c,0,.02,0);ms(g,new T.CylinderGeometry(.02,.02,.035,10),mt(0xffd23f,{metalness:.7}),0,.02,0);g.rotation.z=.25;return g}
function mkCar(){const g=new T.Group();ms(g,new T.BoxGeometry(.22,.06,.12),mt(0xff3b30,{metalness:.3,roughness:.35}),0,.06,0);ms(g,new T.BoxGeometry(.11,.05,.1),mt(0x111a2a,{metalness:.4,roughness:.2}),-.01,.115,0);
  const wm=mt(0x111111);[[-.075,-.065],[.075,-.065],[-.075,.065],[.075,.065]].forEach(([x,z])=>{const w=ms(g,new T.CylinderGeometry(.03,.03,.025,12),wm,x,.03,z);w.rotation.x=Math.PI/2});
  ms(g,new T.CylinderGeometry(.004,.004,.14,5),mt(0x222222),.08,.16,-.04);ms(g,new T.SphereGeometry(.012,8,6),mt(0xffd23f),.08,.235,-.04);return g}
const PRIZE_DEF=[["squishy toy",mkSquishy,-.3,-.25],["slime tub",mkSlime,.05,-.3],["lollipop",mkCandy,.32,-.12],["fidget spinner",mkSpinner,-.2,.18],["RC car",mkCar,.2,.22],["squishy toy",mkSquishy,.32,.32],["slime tub",mkSlime,-.36,.05]];
function buildPrizes(){const g=clawGrp();if(!g||PZ.length)return;findClaw();
  g.children.filter(o=>o.isMesh&&o.geometry.type==="SphereGeometry"&&o.position.y<1.3).forEach(o=>{o.scale.setScalar(.7);o.position.y=.98+o.geometry.parameters.radius*.7});
  PRIZE_DEF.forEach(([name,mk,x,z],i)=>{const m=mk();m.position.set(x,.955,z);m.rotation.y=i*1.3;m.userData.home=m.position.clone();m.userData.rot=m.rotation.clone();m.userData.name=name;g.add(m);PZ.push(m)});
  ms(g,new T.BoxGeometry(.3,.02,.3),mt(0x2a1a44,{emissive:0x2bd9ff,emissiveIntensity:.25}),-.42,.955,.42).name="chute";const L=new T.PointLight(0xfff1d6,4,2.6,1.6);L.position.set(0,2.15,0);L.visible=AREA==="arcade";g.add(L)}
function clawReset(){buildPrizes();const c=findClaw();if(!c)return;CA.on=false;if(CA.pz&&CA.pz.parent!==clawGrp()){clawGrp().attach(CA.pz)}PZ.forEach(m=>{m.position.copy(m.userData.home);m.rotation.copy(m.userData.rot);m.visible=true});c.position.set(.08,2.28,0);setFing(0);CA.pz=null}
function setFing(k){FING.forEach(f=>{f.m.rotation.x=f.rx*(1-k*.85);f.m.rotation.z=f.rz*(1-k*.85);f.m.position.x=f.px*(1-k*.45);f.m.position.z=f.pz*(1-k*.45)})}
const lerp=(a,b,k)=>a+(b-a)*k,ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
function clawGo(ok,done){clawReset();const c=findClaw();if(!c){setTimeout(()=>done("prize"),300);return}
  const vis=PZ.filter(m=>m.visible),pz=vis[(Math.random()*vis.length)|0];Object.assign(CA,{on:true,ok,pz,t0:performance.now(),done,from:c.position.clone(),fired:false});W2.claw=CA}
/* timeline (s): 0-1.1 move over the prize · 1.1-1.9 drop · 1.9-2.3 close · 2.3-3.1 lift · win: 3.1-4.0 carry to the chute, drop it in · loss: the prize slips out at 2.7 and falls back */
function clawTick(){if(!CA.on)return;const c=findClaw(),pz=CA.pz,t=(performance.now()-CA.t0)/1000,H=pz.userData.home,topY=.955+.25,hi=2.28,lo=topY+.42;
  if(t<1.1){const k=ease(t/1.1);c.position.set(lerp(CA.from.x,H.x,k),hi,lerp(CA.from.z,H.z,k))}
  else if(t<1.9){c.position.set(H.x,lerp(hi,lo,ease((t-1.1)/.8)),H.z)}
  else if(t<2.3){setFing((t-1.9)/.4);if(!CA.grab){CA.grab=1;c.attach(pz)}}
  else if(t<3.1||(!CA.ok&&t<3.6)){const k=ease(Math.min(1,(t-2.3)/.8));c.position.y=lerp(lo,hi,k);
    if(!CA.ok&&t>=2.7&&!CA.slip){CA.slip=1;clawGrp().attach(pz);setFing(.2);CA.vy=0}
    if(CA.slip){CA.vy-=9.8*.016;pz.position.y=Math.max(H.y,pz.position.y+CA.vy*.016);pz.rotation.z+=.05}}
  else if(CA.ok&&t<4.0){const k=ease((t-3.1)/.9);c.position.x=lerp(H.x,-.42,k);c.position.z=lerp(H.z,.42,k)}
  else if(CA.ok&&t<4.5){setFing(1-(t-4.0)/.5);if(!CA.drop){CA.drop=1;clawGrp().attach(pz)}pz.position.y=Math.max(.6,pz.position.y-.03);if(pz.position.y<.97)pz.visible=false}
  else{if(!CA.ok){pz.position.copy(H)}else pz.visible=false;CA.on=false;if(!CA.fired){CA.fired=true;CA.done(pz.userData.name)}}}
/* claw close-up camera: the machine fills the screen, the question panel stays small at the bottom */
const _gcL=gameCam;gameCam=function(dt){if(CA.restore){cam.position.copy(CA.restore);CA.restore=null}
  if(st.open&&st.c&&st.c.wager&&AREA==="arcade"){const [x,z]=SPOT.claw,cx=AR.cx+x,cz=AR.cz+z,tall=innerHeight>innerWidth;
    const want=new T.Vector3(cx-(tall?3.9:2.6),tall?2.25:2.15,cz+(tall?0:.75)),look=new T.Vector3(cx,tall?1.0:1.2,cz+(tall?0:.75));
    if(!CA.camOn){CA.camOn=1;cam.position.copy(want)}else cam.position.lerp(want,Math.min(1,dt*6));cam.lookAt(look);W2.camFree=false;return true}
  CA.camOn=0;const r=_gcL(dt);W2.camFree=!r;return r};
/* arcade follow camera: lift it and look past the avatar so the Prize Corner/counter aren't hidden behind your head; fade the avatar when the camera is right on it */
W2.followFix=false;let FADE=1;function heroFade(a){const H=ACT.hero;if(!H||Math.abs(a-FADE)<.01&&!(a<1&&!H.g.userData.fadeMats))return;FADE=a;
  H.g.traverse(o=>{if(!o.isMesh||!o.material)return;if(!o.userData.fadeMat){o.userData.fadeMat=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();o.userData.origMat=o.material}
    if(a>=.999){o.material=o.userData.origMat}else{o.material=o.userData.fadeMat;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.transparent=true;m.opacity=a;m.depthWrite=a>.6})}});H.g.userData.fadeMats=1}
const _ugL=updateGame;updateGame=function(dt,now){_ugL(dt,now);try{clawTick()}catch(e){CA.on=false}
  let fade=1;if(W2.followFix&&W2.camFree&&AREA==="arcade"&&camDist>1.3&&!W2.ui&&!QG){const hy=P.y+1.75,head=new T.Vector3(P.x,hy,P.z),base=cam.position.clone(),R0=ROOMS.arcade;
    const fwd=new T.Vector3(P.x-base.x,0,P.z-base.z);const fl=fwd.length();if(fl>.05){fwd.multiplyScalar(1/fl);const right=new T.Vector3(-fwd.z,0,fwd.x);
      const near=Math.max(0,1-(head.distanceTo(base)-.6)/2.4);/* the closer the camera is pushed in, the more it lifts and slides over the shoulder */
      const up=Math.min(.75*near+.25,(R0.h||5.6)-.4-base.y),side=.42*near;const p=base.clone().addScaledVector(right,side);p.y+=Math.max(0,up);
      const x0=R0.cx-(R0.w||18)/2+.35,x1=R0.cx+(R0.w||18)/2-.35,z0=R0.cz-(R0.d||16)/2+.35,z1=R0.cz+(R0.d||16)/2-.35;p.x=Math.min(x1,Math.max(x0,p.x));p.z=Math.min(z1,Math.max(z0,p.z));
      cam.position.copy(p);cam.lookAt(head.x+fwd.x*3.2,hy-.15-near*.35,head.z+fwd.z*3.2);CA.restore=base;
      const d=p.distanceTo(head);fade=d<1.05?.25:d<1.7?.25+.75*(d-1.05)/.65:1}}
  if(CA.camOn&&ACT.hero){fade=1;ACT.hero.g.visible=false}if(st.open)PR.style.display="none";heroFade(fade);W2.camFree=false};
addEventListener("keydown",e=>{if(!st.open)return;if(e.key==="Escape"){close();return}if(st.phase==="ask"&&/^[1-4]$/.test(e.key))answer(+e.key-1);e.stopPropagation()},true);
const _blk=BLOCKIN;BLOCKIN=()=>_blk()||st.open;
/* wire every arcade cabinet's E prompt to its math game */
const lab=id=>{const c=CABS[id],k=CABQ?CABQ.KINDS[c.kind]:null;return `Press E — 🕹️ ${c.name}${c.wager?": bet XP on fractions":k?": "+k.name.toLowerCase():""}`};
function wire(){for(const id in SPOT){const [x,z]=SPOT[id];const t=TAPS.find(t=>t.area==="arcade"&&Math.abs(t.x-(AR.cx+x))<1e-6&&Math.abs(t.z-(AR.cz+z))<1e-6);
  if(t){t.fn=()=>open(id);t.label=window.CABQ?lab(id):"Press E — 🕹️ "+CABS[id].name;t.cab=id}else mkTap("arcade",x,z,"Press E — 🕹️ "+CABS[id].name,()=>open(id),1.35)}}
wire();{const iv=setInterval(()=>{if(window.CABQ){wire();clearInterval(iv)}},300)}
/* a wandering NPC (talk = Q) or another nearby prompt must not steal E while you stand at a cabinet */
function nearCab(){if(AREA!=="arcade")return null;let best=null,bd=1.4;for(const id in SPOT){const d=Math.hypot(P.x-(AR.cx+SPOT[id][0]),P.z-(AR.cz+SPOT[id][1]));if(d<bd){bd=d;best=id}}return best}
const _tdL=tryDoor;tryDoor=function(){if(!st.open&&!QG&&!W2.ui&&!W2.blaster){const id=nearCab(),t=nearDoor&&nearDoor.type;if(id&&(!t||t==="talk"||t==="tap"||(t==="vrpod"&&Math.hypot(nearDoor.x-P.x,nearDoor.z-P.z)>Math.hypot(P.x-(AR.cx+SPOT[id][0]),P.z-(AR.cz+SPOT[id][1])))))return open(id)}return _tdL()};
/* perf: only the room you're in keeps its lights on. Extra room lights (arcade fills, Prize Corner spots...) used to stay
   live on the street and slowed every frame there (CI street fps 3 -> 2, Brock walk-up timed out). */
const _rl=roomLights;roomLights=function(){_rl();for(const k in ROOMS){const g=ROOMS[k].g;if(!g)continue;const on=AREA===k;g.traverse(o=>{if(o.isLight&&o!==ROOMS[k].light&&!(ROOMS[k].light&&o===ROOMS[k].light.userData.hemi))o.visible=on})}};
roomLights();
/* show the cabinet's E prompt even when Theo or the worker is close by (Q still talks) */
const _intL=interactions;interactions=function(){const L=_intL();if(AREA!=="arcade"||QG||st.open||W2.ui||W2.blaster)return L;const id=nearCab();if(!id)return L;
  const dc=Math.hypot(P.x-(AR.cx+SPOT[id][0]),P.z-(AR.cz+SPOT[id][1]));if(L.some(d=>d.type!=="talk"&&d.type!=="tap"&&Math.hypot(d.x-P.x,d.z-P.z)<d.r&&!(d.type==="vrpod"&&Math.hypot(d.x-P.x,d.z-P.z)>dc)))return L;const t=TAPS.find(t=>t.cab===id);if(!t)return L;
  return [{type:"tap",t,x:P.x,z:P.z,r:9,label:t.label}].concat(L.filter(d=>d.type!=="tap"))};
window.CABG={CA,PZ,clawReset,nearCab,open,close,st,CABS,SPOT,answer};
})();
