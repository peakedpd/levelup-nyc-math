
/* =====================================================================
   9. The 3D street is the only world: keys typed while the page (not this frame) has focus are
      forwarded here; "Go to…" / "Take me there" jump the avatar to that place on the street.
   ===================================================================== */
addEventListener("message",e=>{const d=e.data;if(!d)return;
  if(d.lv3d==="key"&&(d.type==="keydown"||d.type==="keyup")){try{dispatchEvent(new KeyboardEvent(d.type,{key:d.key,bubbles:true}))}catch(_){}}
  else if(d.lv3d==="goto")goto3d(d.id)});
function goto3d(id){const kind={school:"school",arcade:"arcade",shop:"clothing",apt:"apartment"}[id];if(AREA!=="street")leaveRoom();
  let x,z,face;if(id==="square"){x=MA.x+1.4;z=MA.z+1.6;face=Math.atan2(MA.x-x,MA.z-z)}
  else{const ds=DOORS.filter(d=>d.kind===kind);if(!ds.length)return;const d=ds.reduce((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)<Math.hypot(b.x-P.x,b.z-P.z)?a:b);x=d.x;z=Math.sign(d.z)*7.0;face=d.z>0?0:Math.PI}
  for(let k=0;k<8&&blocked(x,z,.12);k++)x+=.7;
  P.x=x;P.z=z;P.fy=.12;P.vy=0;P.yaw=face;camYaw=face+Math.PI;camPitch=.32;camDist=7;camSnap=true;TH.x=x+1.2;TH.z=z+(z>0?-.8:.8);target=null;for(const k in K)K[k]=false}
Object.assign(window,{goto3d});

/* =====================================================================
   12. OPENABLES: lockers, trophy case, desk drawer, gym chest (registry in w2b: OPEN, regOpen, FOUND)
   ===================================================================== */
function nearOpen(){if(QG||W2.blaster||W2.ui)return null;let best=null,bd=1.05;for(const o of OPEN){if(o.area&&o.area!==AREA)continue;if(o.area){const dd=Math.hypot(P.x-o.ux,P.z-o.uz);if(dd<1.3&&dd<bd){bd=dd;best=o}continue}if((AREA==="hallway"&&o.id[0]!=="l")||(o.id==="trophy"&&AREA!=="lobby")||(o.id==="gymchest"&&AREA!=="gym")||(o.id==="desk"&&AREA!=="school")||(o.id[0]==="l"&&o.id!=="lobby"&&o.name==="locker"&&AREA!=="hallway"))continue;
    const dd=Math.hypot(P.x-o.ux,P.z-o.uz);if(dd<bd){bd=dd;best=o}}return best}
function useOpen(o){if(o.locked){o.shake=.45;objShot(new T.Vector3(o.ux,1.25,o.uz),"🔒 Locked","This "+o.name+" won't budge.",1.2);return}
  o.isOpen=!o.isOpen;if(o.isOpen&&o.orb&&!FOUND.has(o.id)){FOUND.add(o.id);localStorage.setItem("lu3d_found",JSON.stringify([...FOUND]));o.pay=performance.now()+1600;const ow=o.orb.getWorldPosition(new T.Vector3());objShot(ow,"✨ Secret found","Whoa... something's glowing in here!",1.1)}
  else if(o.id==="fridge"&&o.isOpen)objShot(new T.Vector3(6.6,1.25,ROOMS.apartment.cz+2.5),"Home","Milk! Remember: a gallon is 4 quarts.",1.3)}
const _int12=interactions;interactions=function(){const L=_int12();const o=nearOpen();if(!o)return L;
  const lab=o.locked?"🔒 Locked "+o.name+" (press E to try it)":"Press E to "+(o.isOpen?"close":"open")+" the "+o.name;
  return [{type:"openable",o,x:P.x,z:P.z,r:9,label:lab}].concat(L.filter(d=>d.type==="exit2"&&Math.hypot(d.x-P.x,d.z-P.z)<d.r?false:true))};
const _try12=tryDoor;tryDoor=function(){const d=nearDoor;if(d&&d.type==="openable")return useOpen(d.o);_try12()};
const _ug12=updateGame;updateGame=function(dt,now){_ug12(dt,now);
  for(const o of OPEN){const want=o.isOpen?o.openTo:0;o.cur+=(want-o.cur)*Math.min(1,dt*8);let v=o.cur;if(o.shake>0){o.shake-=dt;v+=Math.sin(now/25)*.06}
    if(o.axis==="y")o.pv.rotation.y=v;else if(o.axis==="x")o.pv.rotation.x=v;else o.pv.position.z=v;
    if(o.orb){o.orb.rotation.y+=dt*3;o.orb.position.y=o.orbAt.y+Math.sin(now/300)*.04;
      if(o.pay&&now>o.pay){o.pay=0;o.parent.remove(o.orb);o.orb=null;POP.textContent="🔍 Hidden XP! +"+o.xp+" XP ⭐";POP.style.opacity=1;POP.style.transform="translate(-50%,-50%) scale(1.1)";
        try{confetti(P.x,P.fy+1.6,P.z)}catch(_){}try{speak("You found hidden XP!")}catch(_){}try{parent.postMessage({lv3d:"mres",review:true,id:0,idx:0,tries:1,xp:o.xp,coins:0},"*")}catch(_){}
        setTimeout(()=>{POP.style.opacity=0;POP.style.transform="translate(-50%,-50%) scale(.6)"},1800)}}}};
Object.assign(window,{OPEN,useOpen});

/* 13. CAFETERIA FRUIT: E picks up / puts back / drops, F eats (+3 XP). Dropped fruit left behind costs 5 XP; tidy it back onto a tray to earn it back. */
let HELD=null;const xpMsg=(t,xp)=>{POP.textContent=t;POP.style.opacity=1;setTimeout(()=>POP.style.opacity=0,1600);try{parent.postMessage({lv3d:"mres",review:true,id:0,idx:0,tries:1,xp,coins:0},"*")}catch(_){}};
const fw=f=>({x:f.at.x,z:f.at.z+f.cz});
function freeHome(){let b=null,bd=1.3;for(const f of FRUIT){const h={x:f.home.x,z:f.home.z+f.cz};if(FRUIT.some(o=>o.state==="tray"&&o.at.distanceTo(f.home)<.05))continue;const d=Math.hypot(P.x-h.x,P.z-h.z);if(d<bd){bd=d;b=f.home}}return b}
function nearFruit(){if(AREA!=="cafeteria"||QG)return null;let b=null,bd=1.2;for(const f of FRUIT){if(f.state==="held"||f.state==="eaten")continue;const w=fw(f),d=Math.hypot(P.x-w.x,P.z-w.z);if(d<bd){bd=d;b=f}}return b}
function fruitE(){if(HELD){const h=freeHome(),f=HELD;HELD=null;
    if(h){f.at.copy(h);f.state="tray";if(f.pen){f.pen=false;theoSays("Nice! Way to clean up.");xpMsg("🍎 Thanks for cleaning up! +5 XP back",5)}else say("🍎","Back on the tray.",P.x,2.4,P.z)}
    else{f.at.set(P.x,.07,P.z-f.cz);f.state="floor";say("🍎","Oops, it's on the floor! Pick it up before you walk away.",P.x,2.4,P.z)}
    f.m.position.copy(f.at);try{BUBW.t=performance.now()}catch(_){}return}
  const f=nearFruit();if(f){HELD=f;f.state="held"}}
addEventListener("keydown",e=>{if(e.key.toLowerCase()==="f"&&HELD){const f=HELD;HELD=null;f.state="eaten";f.g.remove(f.m);xpMsg("😋 Yum! Healthy snack +3 XP",3)}});
const _int13=interactions;interactions=function(){const L=_int13();if(AREA!=="cafeteria")return L;
  if(HELD)return [{type:"fruit",x:P.x,z:P.z,r:9,label:freeHome()?"E: put the fruit back on the tray · F: eat it":"E: drop the fruit · F: eat it (find an empty tray spot to put it back)"}].concat(L);
  const f=nearFruit();return f?[{type:"fruit",x:P.x,z:P.z,r:9,label:"Press E to pick up the "+(f.state==="floor"?"fruit on the floor":"fruit")}].concat(L):L};
const _try13=tryDoor;tryDoor=function(){const d=nearDoor;if(d&&d.type==="fruit")return fruitE();_try13()};
const _ug13=updateGame;updateGame=function(dt,now){_ug13(dt,now);
  if(HELD){if(AREA!=="cafeteria"){HELD.at.set(P.x,.07,0);HELD.state="floor";HELD.m.position.copy(HELD.at);HELD=null}else HELD.m.position.set(P.x+.35,P.fy+1.1,P.z-HELD.cz)}
  for(const f of FRUIT)if(f.state==="floor"&&!f.pen){const w=fw(f);if(AREA!=="cafeteria"||Math.hypot(P.x-w.x,P.z-w.z)>4){f.pen=true;theoSays("Hey! You can't just leave food on the floor!",true);xpMsg("🗑️ You left fruit on the floor! -5 XP",-5)}}};
/* 14. MS. OKAFOR'S DESK: items can be picked up, but you never touch a teacher's desk. Put it back within 4 s = no penalty; keep it longer = -10 XP. */
const DESKI=[];{const g=ROOMS.school.g;[["mug",0xffffff,-1.1,new T.CylinderGeometry(.09,.08,.18,14)],["apple",0xd92b2b,-.5,new T.SphereGeometry(.09,12,10)],["stapler",0x222222,.9,new T.BoxGeometry(.32,.08,.1)],["grade book",0x3d7be0,1.4,new T.BoxGeometry(.4,.05,.3)]].forEach(([n,c,x,geo])=>{const m=new T.Mesh(geo,M(c));m.position.set(x,1.06,-5.2);g.add(m);DESKI.push({n,m,home:m.position.clone()})})}
let DH=null;const dskD=()=>Math.hypot(P.x,P.z-(ROOMS.school.cz-5.2));
function deskE(){if(DH){if(dskD()<2.4){DH.it.m.position.copy(DH.it.home);if(!DH.pen){okaforSays("Thank you. Good choice.");}else okaforSays("Thank you... next time, don't touch.");DH=null}else say("✋","Put it back on Ms. Okafor's desk!",P.x,2.4,P.z);try{BUBW.t=performance.now()}catch(_){}return}
  let b=null,bd=1.6;for(const it of DESKI){const d=Math.hypot(P.x-it.home.x,P.z-(it.home.z+ROOMS.school.cz));if(d<bd){bd=d;b=it}}if(b){DH={it:b,t:performance.now(),pen:false};okaforSays("Please put that back.")}}
const _int14=interactions;interactions=function(){const L=_int14();if(AREA!=="school"||QG)return L;
  if(DH)return [{type:"deskitem",x:P.x,z:P.z,r:9,label:"Press E to put Ms. Okafor's "+DH.it.n+" back"}].concat(L);
  for(const it of DESKI)if(Math.hypot(P.x-it.home.x,P.z-(it.home.z+ROOMS.school.cz))<1.6)return [{type:"deskitem",x:P.x,z:P.z,r:9,label:"Press E to pick up the "+it.n+" on Ms. Okafor's desk"}].concat(L);return L};
const _try14=tryDoor;tryDoor=function(){const d=nearDoor;if(d&&d.type==="deskitem")return deskE();_try14()};
const _ug14=updateGame;updateGame=function(dt,now){_ug14(dt,now);if(!DH)return;
  if(AREA!=="school"){DH.it.m.position.copy(DH.it.home);if(!DH.pen)xpMsg("🚫 You walked off with a teacher's things! -10 XP",-10);DH=null;return}
  DH.it.m.position.set(P.x+.35,P.fy+1.1,P.z-ROOMS.school.cz);if(!DH.pen&&now-DH.t>4000){DH.pen=true;okaforSays("Are you serious?",true);xpMsg("🚫 Never take things from a teacher's desk! -10 XP",-10)}};
/* 15. MORE INTERACTIVES across the Universe.
   CARRY: pick up with E, bring to the right spot, E again. TAP: press E for a reaction (some pay a one-time XP find). */
const CARRY=[],TAPS=[];let CH=null;const ONCE=new Set(JSON.parse(localStorage.getItem("lu3d_once")||"[]"));
const roomOf=a=>a==="street"?{g:S,cx:0,cz:0}:{g:ROOMS[a].g,cx:ROOMS[a].cx||0,cz:ROOMS[a].cz};
function mkCarry(area,mesh,x,y,z,o){const R=roomOf(area);mesh.position.set(x,y,z);R.g.add(mesh);CARRY.push(Object.assign({area,m:mesh,R,home:new T.Vector3(x,y,z),state:"home"},o))}
function mkTap(area,x,z,label,fn,r=1.5){const R=roomOf(area);TAPS.push({area,x:R.cx+x,z:R.cz+z,label,fn,r})}
function onceXP(id,xp,msg){if(ONCE.has(id))return false;objShot(new T.Vector3(P.x+Math.sin(P.yaw||0)*-.9,1,P.z+Math.cos(P.yaw||0)*-.9),"✨ Lucky find",{bench:"A shiny coin under the bench!",couch:"Coins in the couch? Jackpot!",cab3L:"A token stuck in the coin return!"}[id]||"Look what you found!",1.6);ONCE.add(id);localStorage.setItem("lu3d_once",JSON.stringify([...ONCE]));xpMsg(msg,xp);try{confetti(P.x,P.fy+1.6,P.z)}catch(_){}return true}
const bub=(e,t)=>{say(e,t,P.x,2.4,P.z);try{BUBW.t=performance.now()}catch(_){}};
/* --- STREET: litter clean-up (+5 XP each into a trash can), mailbox, hydrant, hidden coin under a bench --- */
const CANS=[[-12,6.4],[12,-6.4],[34,6.4],[-34,-6.4]];CANS.forEach(([x,z])=>{box(S,.8,1.1,.8,M(0x2f6b3a),x,.55,z);box(S,.9,.08,.9,M(0x1f4a28),x,1.12,z,0);sign(S,"♻ TRASH",x,1.35,z+(z>0?-.46:.46),.8,.22,"#1f4a28","#fff",z>0?Math.PI:0)});
[[-20,5.8],[-8,-6],[6,6.1],[22,5.9],[40,5.9],[-40,6.1]].forEach(([x,z],k)=>{const m=k%2?new T.Mesh(new T.CylinderGeometry(.07,.07,.22,10),M(0xc0392b,{metalness:.6})):new T.Mesh(new T.BoxGeometry(.28,.04,.2),M(0xf1c40f));if(k%2)m.rotation.z=Math.PI/2;
  mkCarry("street",m,x,.1,z,{name:k%2?"soda can":"snack wrapper",targets:CANS.map(([a,b])=>({x:a,z:b,r:1.7})),tlabel:"trash can",done:c=>{c.R.g.remove(c.m);c.state="gone";if(!window._lit){window._lit=1;theoSays("You picked up trash? That's what real heroes do!")}xpMsg("♻ Great citizen! You cleaned up the street. +5 XP",5)}})});
box(S,.7,1.2,.6,M(0x1f4aa8),-26,.6,6.6);sign(S,"US MAIL",-26,1.05,6.28,.6,.18,"#1f4aa8","#fff",Math.PI);
mkTap("street",-26,5.8,"Press E to mail a letter",()=>bub("📬","Letter mailed to Grandma! Fun fact: a stamp costs about 78¢."));
mkTap("street",-12,-6.2,"Press E to check under the bench",()=>{if(!onceXP("bench",10,"🪙 You found a lucky coin under the bench! +10 XP"))bub("🪑","Nothing else under here.")});
/* --- ARCADE: cabinets from John's Canva redesign (DAHbrDGkWtg); Neon Coin Rush (DAHbq31X4qY) is a playable cabinet --- */
function showNeonRush(){let el=document.getElementById("ncr");if(!el){el=document.createElement("div");el.id="ncr";
  el.style.cssText="position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;background:rgba(6,2,20,.86)";
  el.innerHTML='<div style="position:relative;max-width:96vw;max-height:96vh"><img id="ncrImg" src="tex/neon_coin_rush.webp" alt="Neon Coin Rush" style="max-width:96vw;max-height:88vh;border-radius:16px;display:block"><canvas id="ncrCv" width="900" height="520" style="display:none;max-width:96vw;background:#140c28;border-radius:16px"></canvas><div id="ncrBar" style="position:absolute;left:0;right:0;bottom:16px;display:flex;gap:12px;justify-content:center"><button id="ncrGo" style="border:0;border-radius:14px;padding:.7rem 1.3rem;font:800 18px system-ui;background:#ffd23f;color:#14123a;cursor:pointer">Start Game →</button><button id="ncrX" style="border:0;border-radius:14px;padding:.7rem 1.1rem;font:700 16px system-ui;background:#2a2448;color:#fff;cursor:pointer">Close</button></div></div>';
  document.body.appendChild(el);
  const close=()=>{el.style.display="none";el._run=0;for(const k in K)K[k]=false;document.getElementById("ncrImg").style.display="block";document.getElementById("ncrCv").style.display="none";document.getElementById("ncrGo").style.display=""};
  document.getElementById("ncrX").onclick=close;
  document.getElementById("ncrGo").onclick=()=>{const cv=document.getElementById("ncrCv"),img=document.getElementById("ncrImg"),go=document.getElementById("ncrGo");img.style.display="none";cv.style.display="block";go.style.display="none";
    const ctx=cv.getContext("2d"),lanes=[150,450,750];let lane=1,score=0,t=45,items=[],acc=0,over=0;el._run=1;const onKey=e=>{if(e.key==="a"||e.key==="ArrowLeft")lane=Math.max(0,lane-1);if(e.key==="d"||e.key==="ArrowRight")lane=Math.min(2,lane+1);if(e.key==="Escape")close()};
    addEventListener("keydown",onKey);const tick=now=>{if(!el._run){removeEventListener("keydown",onKey);return}const dt=Math.min(.05,(now-(tick.t||now))/1000);tick.t=now;if(!over){t-=dt;acc+=dt;if(acc>.45){acc=0;items.push({lane:Math.floor(Math.random()*3),y:-40,bomb:Math.random()<.28,vy:220+Math.random()*80+(45-t)*4})}
      items.forEach(it=>it.y+=it.vy*dt);items=items.filter(it=>{if(it.y>400&&it.y<500&&it.lane===lane){score+=it.bomb?-15:10;return false}return it.y<560});if(t<=0){over=1;t=0;try{TIX.n=TIX.n+Math.max(0,Math.floor(score/20))}catch(_){}try{parent.postMessage({lv3d:"mres",review:true,id:0,idx:0,tries:1,xp:Math.max(0,Math.floor(score/10)),coins:0},"*")}catch(_){}}}
      ctx.fillStyle="#140c28";ctx.fillRect(0,0,900,520);ctx.fillStyle="#ffd23f";ctx.font="700 22px system-ui";ctx.fillText("NEON COIN RUSH    score "+score+"    time "+Math.ceil(t),24,36);
      lanes.forEach((x,i)=>{ctx.fillStyle=i===lane?"#3a2a6a":"#22183c";ctx.fillRect(x-70,70,140,420)});
      items.forEach(it=>{ctx.beginPath();ctx.fillStyle=it.bomb?"#c0392b":"#ffd23f";ctx.arc(lanes[it.lane],it.y,16,0,6.28);ctx.fill()});
      ctx.fillStyle="#ffb52e";ctx.fillRect(lanes[lane]-28,430,56,50);
      if(over){ctx.fillStyle="rgba(6,2,20,.72)";ctx.fillRect(0,180,900,140);ctx.fillStyle="#fff";ctx.font="800 32px system-ui";ctx.textAlign="center";ctx.fillText("Time's up! Score "+score+"  ·  +" + Math.max(0,Math.floor(score/20))+" tickets",450,255);ctx.textAlign="left"}
      requestAnimationFrame(tick)};requestAnimationFrame(tick)};
  addEventListener("keydown",e=>{if(e.key==="Escape"&&el.style.display==="flex"){el.style.display="none";el._run=0}})}
  el.style.display="flex"}
const _blockNcr=BLOCKIN;BLOCKIN=()=>_blockNcr()||!!(document.getElementById("ncr")&&document.getElementById("ncr").style.display==="flex");
const ARCADE_GAMES=[{id:"space",name:"Space Blasters",x:-7.55,z:-4.2,line:"Space Blasters! High score: 8 × 7 = 56. Blast those meteors!"},{id:"racer",name:"Racer X",x:-7.55,z:-2.35,line:"Racer X: you finished in 3/4 of a minute. That's 45 seconds!"},{id:"jump",name:"Jump Hero",x:-7.55,z:-.5,line:"Jump Hero: you jumped 3 times as high as last time. 2 × 3 = 6!"},{id:"hoop",name:"Hoop Shot",x:7.55,z:-3.4,line:"Hoop Shot! 4 baskets × 2 points each = 8 points."},{id:"claw",name:"Prize Claw",x:7.55,z:-1.35,line:"Prize Claw: a teddy is 150 tickets. You've got this!"},{id:"pins",name:"Galaxy Pins",x:6.35,z:3.15,line:"Galaxy Pins! Knock down 9 pins, 3 are left. 9 − 3 = 6."},{id:"foos",name:"foosball table",x:-5.6,z:3.35,line:"Foosball! Each team has 3 rows of 4 players. 3 × 4 = 12 players."},{id:"hockey",name:"air hockey table",x:0,z:-2.35,line:"Air hockey! The puck is a circle. A circle has no corners — 0 sides, just a curve."},{id:"rush",name:"Neon Coin Rush",x:-7.55,z:1.4,fn:showNeonRush,line:null}];
ARCADE_GAMES.forEach(g=>mkTap("arcade",g.x,g.z,g.fn?"Press E to play Neon Coin Rush":"Press E to play "+g.name,()=>{if(g.id==="claw"&&onceXP("clawToken",10,"🎟️ A token was stuck in the Prize Claw coin return! +10 XP"))return;if(g.fn)return showNeonRush();bub("🕹️",g.line)},1.35));
/* a Neon Coin Rush cabinet of its own (Pixel Palace, from John's DAHbq31X4qY start screen) */
{const g=ROOMS.arcade.g;box(g,1.05,2.25,1.05,M(0x140a1c),-7.55,1.125,1.4);box(g,.06,.78,.78,M(0xffd23f,{emissive:0xff2bc0,emissiveIntensity:1.5}),-7.0,1.55,1.4,0);sign(g,"NEON COIN RUSH",-7.55,2.45,1.95,2.1,.32,"#14123a","#ffd23f")}
/* --- APARTMENT (home): pick up toys into the toy box (+5 XP each), fridge with a snack, lamp switch, couch cushion coin --- */
{const A=ROOMS.apartment,g=A.g;box(g,1.4,.7,.9,M(0xffb52e),-6.5,.35,1.8);sign(g,"TOYS",-6.5,.55,2.26,.8,.25,"#c8102e","#fff");
 [[-2,.5],[-4.2,-.2],[-1.5,-1.8],[1,0.6]].forEach(([x,z],k)=>{const m=k%2?new T.Mesh(new T.SphereGeometry(.15,14,10),M([0xe23b3b,0x3d7be0][k>>1])):new T.Mesh(new T.BoxGeometry(.25,.25,.25),M([0x6dff6b,0xffd23f][k>>1]));
   mkCarry("apartment",m,x,.15,z,{name:k%2?"toy ball":"toy block",targets:[{x:-6.5,z:A.cz+1.8,r:1.8}],tlabel:"toy box",done:c=>{c.R.g.remove(c.m);c.state="gone";xpMsg("🧸 Room cleaned! Chores done. +5 XP",5)}})});
 box(g,1.3,2.4,1.1,M(0xe8eef2),6.6,1.2,2.5);const pv=new T.Group();pv.position.set(6.6-.65,0,2.5+.56);g.add(pv);box(pv,1.3,2.38,.06,M(0xf5f8fa),.65,1.2,0,0);box(pv,.06,.5,.06,M(0x999999),1.15,1.4,.05,0);
 const milk=new T.Mesh(new T.BoxGeometry(.2,.35,.2),M(0xffffff));milk.position.set(6.6,1.2,2.5);g.add(milk);
 regOpen({id:"fridge",name:"fridge",parent:g,pv,axis:"y",openTo:-1.7,ux:6.6,uz:A.cz+3.9,locked:false,area:"apartment"});
 const lampL=new T.PointLight(0xffd59a,0,9);lampL.position.set(-6,2,-5);g.add(lampL);box(g,.1,1.8,.1,M(0x333333),-6.5,.9,-5.5);const shade=box(g,.7,.5,.7,M(0xfff3c4,{emissive:0xffd59a,emissiveIntensity:0}),-6.5,2,-5.5,0);
 mkTap("apartment",-6.5,-4.6,"Press E to switch the lamp on/off",()=>{const on=lampL.intensity===0;lampL.intensity=on?25:0;shade.material.emissiveIntensity=on?1.2:0;bub("💡",on?"Lamp on!":"Lamp off. Saving energy!")});
 mkTap("apartment",-3,-2.4,"Press E to look under the couch cushions",()=>{if(!onceXP("couch",10,"🛋️ You found coins in the couch! +10 XP"))bub("🛋️","Just crumbs now.")})}
/* --- CLOTHING STORE: try on clothes, but walking out with a shirt you didn't buy costs 10 XP --- */
{const C=ROOMS.clothing;for(let rk=0;rk<4;rk++){const x=-6+rk*4,m=new T.Mesh(new T.BoxGeometry(.4,1,.12),M([0xe23b3b,0xffd23f,0x2a9d8f,0x3d5af1][rk]));
  mkCarry("clothing",m,x+1.6,1.15,-.9,{name:"shirt",targets:[{x:x+1.6,z:C.cz-.9,r:1.8}],tlabel:"rack",steal:true,done:c=>{c.m.position.copy(c.home);c.state="home";bub("👕","Back on the rack. Nice and neat!")}})}
 mkTap("clothing",-6,2.2,"Press E to look in the mirror",()=>bub("🪞","Looking sharp! Keep leveling up."),1.4)}
/* --- GYM: shoot a basketball (E) --- */
if(ROOMS.gym)mkTap("gym",0,2,"Press E to shoot a free throw",()=>{const ok=Math.random()<.6;bub("🏀",ok?"Swish! 2 points. Shoot 3 more and you'll have 4 × 2 = 8!":"Clank! Off the rim. Try again!")},3);
/* shared logic */
function nearCarry(){let b=null,bd=1.3;for(const c of CARRY){if(c.area!==AREA||c.state==="gone"||c.state==="held")continue;const p=c.m.position,d=Math.hypot(P.x-(c.R.cx+p.x),P.z-(c.R.cz+p.z));if(d<bd){bd=d;b=c}}return b}
const atTarget=c=>c.targets.find(t=>Math.hypot(P.x-t.x,P.z-t.z)<t.r);
function nearTap(){let b=null,bd=9;for(const t of TAPS){if(t.area!==AREA)continue;const d=Math.hypot(P.x-t.x,P.z-t.z);if(d<t.r&&d<bd){bd=d;b=t}}return b}
const _int15=interactions;interactions=function(){const L=_int15();if(QG||HELD||DH)return L;
  if(CH)return [{type:"carry",x:P.x,z:P.z,r:9,label:atTarget(CH)?"Press E to put the "+CH.name+" in the "+CH.tlabel:"Carrying a "+CH.name+" — find the "+CH.tlabel+" (E to set it down)"}].concat(L);
  // Don't let street/room props (mailbox, litter, cabinets) steal E from Brock, NPCs, or doors already in range.
  if(L.some(d=>d.type==="brock"||d.type==="talk"||d.type==="game"||d.type==="station"||d.type==="door"||d.type==="boss"))return L;
  const c=nearCarry();if(c)return [{type:"carry",c,x:P.x,z:P.z,r:9,label:"Press E to pick up the "+c.name}].concat(L);
  const t=nearTap();if(t)return [{type:"tap",t,x:P.x,z:P.z,r:9,label:t.label}].concat(L);return L};
const _try15=tryDoor;tryDoor=function(){const d=nearDoor;if(d&&d.type==="tap")return d.t.fn();
  if(d&&d.type==="carry"){if(CH){const c=CH;CH=null;if(atTarget(c))return c.done(c);c.m.position.set(P.x-c.R.cx,.12,P.z-c.R.cz);c.state="down";return}CH=d.c;CH.state="held";if(CH.steal)bub("👕","Trying it on? Put it back on the rack before you leave!");return}_try15()};
const _ug15=updateGame;updateGame=function(dt,now){_ug15(dt,now);if(!CH)return;
  if(AREA!==CH.area){const c=CH;CH=null;c.m.position.copy(c.home);c.state="home";if(c.steal){setTimeout(()=>theoSays("Dude... you didn't pay for that!",true),250);xpMsg("🚫 You left the store with a shirt you didn't pay for! -10 XP",-10)}else c.m.position.copy(c.home);return}
  CH.m.position.set(P.x+.35-CH.R.cx,P.fy+1.1,P.z-CH.R.cz)};

/* 16. CINEMATIC ZOOM-IN MOMENTS: letterbox bars + slow push-in on a face or object, with a spoken line. */
const CB=document.createElement("div");CB.innerHTML='<div id="cbT"></div><div id="cbB"><div id="cbW"></div><div id="cbS"></div></div>';document.body.appendChild(CB);
{const st=document.createElement("style");st.textContent=`#cbT,#cbB{position:fixed;left:0;right:0;height:0;background:#000;z-index:2147483000;transition:height .45s ease;pointer-events:none}#cbT{top:0}#cbB{bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:system-ui,sans-serif;overflow:hidden}
#cbW{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#ffd23f;font-weight:800}#cbS{font-size:24px;font-weight:700;margin-top:4px;text-align:center;padding:0 20px}.cbOn #cbT,.cbOn #cbB{height:13vh}`;document.head.appendChild(st)}
let CINE=null;
function cine(o){/* o:{look:Vector3, dir:{x,z} (direction from look to camera), dist, h, who, say, dur, tight} */
  const d=o.dir||{x:Math.sin(P.yaw||0),z:Math.cos(P.yaw||0)},n=Math.hypot(d.x,d.z)||1,look=o.look.clone(),dist=o.dist||1.6;
  CINE={look,dx:d.x/n,dz:d.z/n,d0:dist,d1:dist*(o.tight?.45:.7),h:o.h??.05,t0:performance.now(),dur:o.dur||3200};
  document.getElementById("cbW").textContent=o.who||"";document.getElementById("cbS").textContent=o.say?"“"+o.say+"”":"";document.body.classList.add("cbOn");
  if(o.say)try{speak(o.say)}catch(_){}clearTimeout(cine.t);cine.t=setTimeout(()=>{CINE=null;document.body.classList.remove("cbOn");camSnap=false},CINE.dur)}
const faceOf=(x,z,y)=>new T.Vector3(x,y,z);
function okaforSays(line,tight){TCH.yaw=Math.atan2(P.x-TCH.x,P.z-TCH.z);cine({look:faceOf(TCH.x,TCH.z,1.72),dir:{x:P.x-TCH.x,z:P.z-TCH.z},dist:1.5,who:"Ms. Okafor",say:line,tight,dur:tight?3600:3000})}
function theoSays(line,tight){if(Math.hypot(TH.x-P.x,TH.z-P.z)>6){TH.x=P.x+1.3;TH.z=P.z+.9}const ry=(ACT.theo&&ACT.theo.g.rotation.y)||0;cine({look:faceOf(TH.x,TH.z,(TH.fy||0)+1.35),dir:{x:Math.sin(ry),z:Math.cos(ry)},dist:1.3,who:"Theo",say:line,tight})}
function objShot(v,who,line,dist){cine({look:v,dir:{x:P.x-v.x,z:P.z-v.z},dist:dist||1.4,h:.35,who,say:line})}
const _gc16=gameCam;gameCam=function(dt){if(CINE){const k=Math.min(1,(performance.now()-CINE.t0)/CINE.dur),e=1-Math.pow(1-k,3),dd=CINE.d0+(CINE.d1-CINE.d0)*e;
  const want=new T.Vector3(CINE.look.x+CINE.dx*dd,CINE.look.y+CINE.h,CINE.look.z+CINE.dz*dd);cam.position.lerp(want,Math.min(1,dt*5));cam.lookAt(CINE.look);PR.style.display="none";return true}return _gc16(dt)};
Object.assign(window,{cine,okaforSays,theoSays});
