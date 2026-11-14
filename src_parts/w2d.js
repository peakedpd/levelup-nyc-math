/* ---------- interactions: room exits, Prize Corner, Mr. Sal's counter, Ticket Blaster, talk ---------- */
const _interactions=interactions;interactions=function(){if(W2.blaster||W2.ui||W2.hand)return [];let L=_interactions();if(QG)return L;
  if(AREA!=="street"){const R0=ROOMS[AREA];L=L.filter(d=>d.type!=="exit");if(R0.exits)L=R0.exits.map(e=>({type:"exit2",x:e.x,z:e.z,r:1.9,label:e.label,to:e.to,spawn:e.spawn})).concat(L)}
  if(AREA==="arcade"){L=L.filter(d=>d.type!=="game");L.push({type:"blaster",x:AR.cx,z:AR.cz+2.3,r:1.9,label:"Press E to play 🎟️ TICKET BLASTER!"});L=L.map(d=>d.type==="station"&&d.id==="arcade"?Object.assign({},d,{type:"counter",x:AR.cx,z:AR.cz-3.6,r:2.4,label:"Press E — trade tickets at the Prize Corner ("+TIX.n+" 🎟️)"}):d)}
  if(AREA==="clothing")L=L.map(d=>d.type==="station"&&d.id==="shop"?Object.assign({},d,{type:"salshop",x:CL.cx,z:CL.cz-4.2,r:2.6,label:"Press E — Mr. Sal: shop for clothes with City Coins"}):d);
  const tk=nearTalker();if(tk)L=L.map(d=>/^(game|counter|salshop|station)$/.test(d.type)?Object.assign({},d,{label:d.label+"  ·  Q 💬 talk"}):d);
  if(tk&&!L.some(d=>d.type!=="exit2"&&Math.hypot(d.x-P.x,d.z-P.z)<d.r))L.push({type:"talk",x:P.x,z:P.z,r:9,label:"Press Q (or 💬) to talk to "+tk[0]});
  return L.sort((a,b)=>(a.type==="exit2"||a.type==="door"?0:1)-(b.type==="exit2"||b.type==="door"?0:1))};
const _tryDoor=tryDoor;tryDoor=function(){const d=nearDoor;if(!d||W2.blaster||W2.ui)return;if(d.type==="exit2")return goRoom(d.to,d.spawn);if(d.type==="counter")return openPrizes();if(d.type==="salshop")return salShop();if(d.type==="blaster")return startBlaster();if(d.type==="talk")return doTalk();_tryDoor()};
addEventListener("keydown",e=>{if(W2.blaster||W2.ui)return;if(e.key.toLowerCase()==="q")doTalk()});
BLOCKIN=()=>!!(W2.blaster||W2.ui||(W2.hand&&W2.hand.stage<2));

/* ---------- 5. TICKET BLASTER (arcade action game) ---------- */
const TB=document.createElement("canvas");TB.style.cssText="position:fixed;inset:0;width:100%;height:100%;z-index:25;display:none;touch-action:none;background:#0b0620";document.body.appendChild(TB);
function sizeTB(){const r=Math.min(2,devicePixelRatio||1);TB.width=innerWidth*r;TB.height=innerHeight*r}addEventListener("resize",()=>{if(W2.blaster)sizeTB()});
function startBlaster(){if(QG||W2.blaster)return;try{document.exitPointerLock()}catch(_){}const B={t0:performance.now(),time:75,hearts:3,tix:0,combo:0,best:0,correct:0,level:3,shots:[],parts:[],targets:[],cx:.5,msg:"",msgT:0,power:{dbl:0,slow:0,shield:0},banner:"",bannerT:0,keys:{},over:false};W2.blaster=B;TB.style.display="block";sizeTB();nextBQ(B);requestAnimationFrame(blasterLoop)}
function nextBQ(B){let q=null;for(let i=0;i<15;i++){q=makeQ("Theo",["tickets","tokens"],"review",{level:B.level});if(q&&typeof q.ans==="number")break;q=null}if(!q){B.over=true;return}
  B.q=q;const W=TB.width,H=TB.height;B.targets=q.ch.map((v,i)=>({v,x:W*(.14+i*.24),y:H*(.4+(i%2)*.1),vx:(Math.random()<.5?-1:1)*W*(.05+Math.random()*.05+(B.level-3)*.012),r:Math.min(W,H)*(W<H?.075:.06),alive:true}));speak(q.text)}
function bFire(B){if(B.over){endBlaster();return}if(B.shots.length>2)return;B.shots.push({x:B.cx*TB.width,y:TB.height*.86});beep(880,.05)}
let AC=null;function beep(f,d,type="square",v=.05){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.stop(AC.currentTime+d)}catch(_){}}
function bHit(B,tg){const q=B.q,W=TB.width,ok=tg.v===q.ans;for(let i=0;i<26;i++)B.parts.push({x:tg.x,y:tg.y,vx:(Math.random()-.5)*W*.5,vy:(Math.random()-.5)*W*.5,l:.8,c:ok?["#ffd23f","#6dff6b","#2bd9ff"][i%3]:"#ff4d4d"});
  if(ok){B.combo++;B.best=Math.max(B.best,B.combo);B.correct++;let gain=10+Math.min(5,B.combo)*2+(q.level-3)*3;if(B.power.dbl>0){gain*=2;B.power.dbl--}B.tix+=gain;
    if(B.combo===3){B.power.dbl=3;B.banner="🔥 STREAK 3 — DOUBLE TICKETS!";B.bannerT=2}else if(B.combo===5){B.power.slow=8;B.banner="🐢 STREAK 5 — SLOW-MO!";B.bannerT=2}else if(B.combo===7){B.power.shield=1;B.banner="🛡️ STREAK 7 — SHIELD!";B.bannerT=2}
    B.msg="+"+gain+" 🎟️  "+q.ans+" is right!";B.msgT=1.4;beep(660,.08,"triangle",.07);setTimeout(()=>beep(990,.12,"triangle",.07),90);
    try{parent.postMessage({lv3d:"mres",id:q.mid,idx:q.idx,tries:1,review:true,xp:5+(q.level-1)*2,coins:1},"*")}catch(_){}
    if(B.correct%2===0)B.level=Math.min(6,B.level+1);nextBQ(B)}
  else{tg.alive=false;if(B.power.shield){B.power.shield=0;B.banner="🛡️ Shield saved you!";B.bannerT=1.6}else{B.hearts--;B.combo=0}B.msg="💡 "+((q.why&&q.why[tg.v])||q.hints[0]||"Check the groups again!");B.msgT=4.5;beep(160,.25,"sawtooth",.06);speak(B.msg.slice(2));if(B.hearts<=0)B.over=true}}
function wrapText(c,t,x,y,mw,lh){const ws=String(t).split(" "),ls=[];let cur="";ws.forEach(w=>{if(c.measureText(cur+" "+w).width>mw&&cur){ls.push(cur);cur=w}else cur=cur?cur+" "+w:w});ls.push(cur);ls.forEach((l,i)=>c.fillText(l,x,y+(i-(ls.length-1)/2)*lh))}
function blasterLoop(now){const B=W2.blaster;if(!B)return;const c=TB.getContext("2d"),W=TB.width,H=TB.height,dt=Math.min(.05,(now-(B.last||now))/1000);B.last=now;const sc=W<H?W/470:Math.min(W,H)/700;
  const left=Math.max(0,B.time-(now-B.t0)/1000);if(left<=0)B.over=true;
  if(!B.over){if(B.keys.left)B.cx-=dt*.9;if(B.keys.right)B.cx+=dt*.9;B.cx=Math.max(.04,Math.min(.96,B.cx));const slow=B.power.slow>0?.45:1;if(B.power.slow>0)B.power.slow-=dt;
    B.targets.forEach(t=>{if(!t.alive)return;t.x+=t.vx*dt*slow;if(t.x<t.r*1.3||t.x>W-t.r*1.3){t.vx*=-1;t.x=Math.max(t.r*1.3,Math.min(W-t.r*1.3,t.x))}});
    B.shots.forEach(s=>s.y-=H*1.4*dt);B.shots=B.shots.filter(s=>{if(s.y<0)return false;for(const t of B.targets)if(t.alive&&Math.abs(s.x-t.x)<t.r*1.3&&Math.abs(s.y-t.y)<t.r*.8){bHit(B,t);return false}return true})}
  B.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=H*.6*dt;p.l-=dt});B.parts=B.parts.filter(p=>p.l>0);
  const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#1a0b3d");gr.addColorStop(1,"#3a0f5c");c.fillStyle=gr;c.fillRect(0,0,W,H);
  c.strokeStyle="rgba(255,59,212,.25)";c.lineWidth=2*sc;for(let i=0;i<14;i++){const y=H*.55+i*i*H*.004;c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}for(let i=-10;i<=10;i++){c.beginPath();c.moveTo(W/2+i*W*.02,H*.55);c.lineTo(W/2+i*W*.12,H);c.stroke()}
  const TOP=(/embed/.test(location.search)?54:0)*sc;c.textBaseline="middle";c.textAlign="center";c.font=`900 ${22*sc}px Trebuchet MS`;c.fillStyle="#ffd23f";c.fillText("🎟️ TICKET BLASTER",W/2,TOP+24*sc);
  c.font=`800 ${16*sc}px Trebuchet MS`;c.fillStyle="#fff";c.textAlign="left";c.fillText("❤️".repeat(Math.max(0,B.hearts))+"  🎟️ "+B.tix+"   🔥 "+B.combo,14*sc,TOP+24*sc);c.textAlign="right";c.fillText("⏱ "+Math.ceil(left)+"s  L"+(B.q?B.q.level:B.level),W-14*sc,TOP+24*sc);
  c.textAlign="center";if(B.power.dbl>0||B.power.slow>0||B.power.shield){c.fillStyle="#6dff6b";c.fillText((B.power.dbl>0?"2× TICKETS ("+B.power.dbl+")  ":"")+(B.power.slow>0?"🐢 SLOW-MO  ":"")+(B.power.shield?"🛡️ SHIELD":""),W/2,TOP+48*sc)}
  if(B.q){const bw=Math.min(W*.94,900*sc),bx=(W-bw)/2,by=TOP+62*sc;c.fillStyle="rgba(255,255,255,.95)";c.beginPath();c.roundRect(bx,by,bw,88*sc,16*sc);c.fill();c.fillStyle="#14123a";c.font=`800 ${20*sc}px Trebuchet MS`;wrapText(c,B.q.text,W/2,by+44*sc,bw-30*sc,22*sc)}
  B.targets.forEach(t=>{if(!t.alive)return;c.save();c.translate(t.x,t.y);c.fillStyle="#ff4d6d";c.strokeStyle="#ffd23f";c.lineWidth=5*sc;c.beginPath();c.roundRect(-t.r*1.25,-t.r*.75,t.r*2.5,t.r*1.5,t.r*.25);c.fill();c.stroke();c.fillStyle="#2a0f4a";[-1,1].forEach(s=>{c.beginPath();c.arc(s*t.r*1.25,0,t.r*.22,0,7);c.fill()});
    c.fillStyle="#fff";c.font=`900 ${t.r*(String(t.v).length>3?.62:.8)}px Trebuchet MS`;c.fillText(String(t.v),0,t.r*.05);c.restore()});
  B.shots.forEach(s=>{c.fillStyle="#6dff6b";c.shadowColor="#6dff6b";c.shadowBlur=14*sc;c.fillRect(s.x-3*sc,s.y-14*sc,6*sc,22*sc);c.shadowBlur=0});
  B.parts.forEach(p=>{c.globalAlpha=Math.max(0,p.l);c.fillStyle=p.c;c.fillRect(p.x,p.y,6*sc,6*sc)});c.globalAlpha=1;
  const bx=B.cx*W,byy=H*.9;c.fillStyle="#2bd9ff";c.beginPath();c.moveTo(bx,byy-36*sc);c.lineTo(bx-30*sc,byy+18*sc);c.lineTo(bx+30*sc,byy+18*sc);c.closePath();c.fill();c.fillStyle="#ffd23f";c.fillRect(bx-6*sc,byy-46*sc,12*sc,18*sc);
  if(B.msgT>0){B.msgT-=dt;c.font=`800 ${17*sc}px Trebuchet MS`;c.fillStyle=B.msg.startsWith("💡")?"#ffc2c2":"#6dff6b";wrapText(c,B.msg,W/2,H*.64,W*.9,22*sc)}
  if(B.bannerT>0){B.bannerT-=dt;c.font=`900 ${30*sc}px Trebuchet MS`;c.fillStyle="#ffd23f";c.strokeStyle="#14123a";c.lineWidth=6*sc;c.strokeText(B.banner,W/2,H*.53);c.fillText(B.banner,W/2,H*.53)}
  c.font=`700 ${13*sc}px Trebuchet MS`;c.fillStyle="rgba(255,255,255,.75)";c.fillText("← → or drag to move · Space or tap to shoot · Esc to quit",W/2,H-12*sc);
  if(B.over){if(!B.paid){B.paid=true;TIX.n=TIX.n+B.tix}c.fillStyle="rgba(10,6,40,.86)";c.fillRect(0,0,W,H);c.fillStyle="#ffd23f";c.font=`900 ${40*sc}px Trebuchet MS`;c.fillText("GAME OVER",W/2,H*.32);c.fillStyle="#fff";c.font=`800 ${22*sc}px Trebuchet MS`;c.fillText("You won "+B.tix+" 🎟️ tickets!",W/2,H*.44);c.fillText(B.correct+" right · best streak "+B.best,W/2,H*.52);c.fillStyle="#6dff6b";c.fillText("Tap or press Space to collect",W/2,H*.64)}
  requestAnimationFrame(blasterLoop)}
function endBlaster(){const B=W2.blaster;if(!B)return;if(!B.paid){B.paid=true;TIX.n=TIX.n+B.tix}W2.blaster=null;TB.style.display="none";say("Arcade Worker",B.tix?"Nice. "+B.tix+" tickets. Prize Corner's right here.":"Wanna try again?",WK.x,2.4,WK.z);BUBW.t=performance.now()+2500}
window.OVERLAY_KEYS=e=>{const B=W2.blaster;if(B){const k=e.key;if(k==="ArrowLeft"||k==="a"||k==="A")B.keys.left=true;if(k==="ArrowRight"||k==="d"||k==="D")B.keys.right=true;if(k===" "||k==="ArrowUp"||k==="w"){e.preventDefault();bFire(B)}if(k==="Escape"){B.over=true;endBlaster()}return true}if(W2.ui){if(e.key==="Escape")closePrizes();return true}return false};
addEventListener("keyup",e=>{const B=W2.blaster;if(!B)return;const k=e.key;if(k==="ArrowLeft"||k==="a"||k==="A")B.keys.left=false;if(k==="ArrowRight"||k==="d"||k==="D")B.keys.right=false});
TB.addEventListener("pointerdown",e=>{const B=W2.blaster;if(!B)return;const r=TB.getBoundingClientRect();if(!B.over)B.cx=(e.clientX-r.left)/r.width;B.dragging=true;bFire(B)});TB.addEventListener("pointermove",e=>{const B=W2.blaster;if(B&&B.dragging){const r=TB.getBoundingClientRect();B.cx=(e.clientX-r.left)/r.width}});addEventListener("pointerup",()=>{if(W2.blaster)W2.blaster.dragging=false});
Object.assign(window,{W2,TIX,startBlaster,endBlaster,openPrizes,buy,salShop,doTalk,bHit});

/* ---------- 6. TOUCH CONTROLS ---------- */
const TC=document.createElement("div");TC.id="touch";TC.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:10;display:none";
TC.innerHTML=`<div id="joy" style="position:absolute;left:18px;bottom:22px;width:130px;height:130px;border-radius:50%;background:rgba(255,255,255,.18);border:3px solid rgba(255,255,255,.55);pointer-events:auto;touch-action:none"><div id="knob" style="position:absolute;left:37px;top:37px;width:50px;height:50px;border-radius:50%;background:rgba(255,210,63,.92);border:3px solid #14123a"></div></div>
<div style="position:absolute;right:16px;bottom:22px;display:grid;grid-template-columns:repeat(2,66px);gap:10px;pointer-events:auto">${[["tE","E","#ffd23f"],["tJ","⤒","#2bd9ff"],["tQ","💬","#fff"],["tR","🏃","#6dff6b"]].map(([id,t,c])=>`<button id="${id}" aria-label="${{tE:"Use / enter",tJ:"Jump",tQ:"Talk",tR:"Run"}[id]}" style="width:66px;height:66px;border-radius:50%;border:3px solid #14123a;background:${c};font:900 24px 'Trebuchet MS';touch-action:manipulation">${t}</button>`).join("")}</div>`;
document.body.appendChild(TC);
function showTouch(){if(TC.style.display==="block")return;TC.style.display="block";const hp=document.getElementById("help");if(hp)hp.style.display="none";LK.style.display="none";PR.style.bottom="170px"}
if(matchMedia("(pointer:coarse)").matches)showTouch();addEventListener("touchstart",showTouch,{once:true,passive:true});
{const joy=TC.querySelector("#joy"),kn=TC.querySelector("#knob");let id=null,cx=0,cy=0;
  const mv=e=>{if(e.pointerId!==id)return;let dx=(e.clientX-cx)/55,dy=(e.clientY-cy)/55;const L=Math.hypot(dx,dy);if(L>1){dx/=L;dy/=L}JOY.x=dx;JOY.z=dy;kn.style.left=37+dx*40+"px";kn.style.top=37+dy*40+"px";K.shift=!!W2.run};
  joy.addEventListener("pointerdown",e=>{e.stopPropagation();e.preventDefault();id=e.pointerId;try{joy.setPointerCapture(id)}catch(_){}const r=joy.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;mv(e)});
  joy.addEventListener("pointermove",mv);const up=e=>{if(e.pointerId!==id)return;id=null;JOY.x=JOY.z=0;K.shift=false;kn.style.left="37px";kn.style.top="37px"};joy.addEventListener("pointerup",up);joy.addEventListener("pointercancel",up);
  const tap=(sel,fn)=>TC.querySelector(sel).addEventListener("pointerdown",e=>{e.stopPropagation();e.preventDefault();fn()});
  tap("#tE",()=>{if(QG&&QG.phase==="ask"&&QG.nearPad)answer(QG.nearPad);else tryDoor()});tap("#tJ",()=>{if(P.onG)P.vy=7.5});tap("#tQ",doTalk);tap("#tR",()=>{W2.run=!W2.run;TC.querySelector("#tR").style.outline=W2.run?"4px solid #ffd23f":"none"})}
window.showTouch=showTouch;

/* ---------- per-frame hooks ---------- */
const _updateGame=updateGame;updateGame=function(dt,now){_updateGame(dt,now);updateWorker(dt,now);updateSal(now);updateStreetOk(now);tixHud();TC.style.visibility=(W2.blaster||W2.ui)?"hidden":"visible"};
