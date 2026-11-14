
/* ---------- 7. STREAK POWERS (regular 3D games) ---------- */
const PWR={fifty:0,dbl:0};
function powerXP(xp,q){let x=xp;if(PWR.dbl>0){x*=2;PWR.dbl--;}if(STREAK>=7)x+=10;return x}
function powerAsk(g){if(!g||PWR.fifty<=0||g.q.ch.length<4)return;PWR.fifty--;const wrong=g.ans.filter(a=>a.v!==g.q.ans).sort(()=>Math.random()-.5).slice(0,2);
  wrong.forEach(a=>{a.used=true;a.m.visible=false;if(a.btn){a.btn.disabled=true;a.btn.style.opacity=".25";a.btn.style.textDecoration="line-through"}});const mm=QC.querySelector("#qcMsg");if(mm){mm.style.color="#1b7a3a";mm.textContent="⚡ 50/50 power used: two wrong answers are gone!"}}
function powerAfter(g){let msg="";if(STREAK===3){PWR.fifty++;msg="🔥 3 in a row! ⚡ 50/50 power"}else if(STREAK===5){PWR.dbl++;msg="🔥 5 in a row! 🚀 Double XP next"}else if(STREAK===7)msg="👑 7 in a row! MATH LEGEND +10 XP each";else if(STREAK>7&&STREAK%3===1){PWR.fifty++;msg="👑 Legend streak! ⚡ +1 50/50"}
  if(msg)setTimeout(()=>{POP.textContent=msg;POP.style.fontSize="34px";POP.style.opacity=1;POP.style.transform="translate(-50%,-50%) scale(1)";speak(msg.replace(/[^\w\s!/+]/g,""));setTimeout(()=>{POP.style.opacity=0;POP.style.fontSize=""},2200)},1900);legendGlow()}
function legendGlow(){const h=ACT.hero&&ACT.hero.g;if(!h)return;if(!W2.aura){W2.aura=new T.Mesh(new T.TorusGeometry(.55,.05,8,40),new T.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.85}));W2.aura.rotation.x=Math.PI/2;W2.aura.add(new T.PointLight(0xffd23f,4,3))}
  if(STREAK>=7){if(W2.aura.parent!==h)h.add(W2.aura)}else if(W2.aura.parent)W2.aura.parent.remove(W2.aura)}
function powerBadge(){const el=QC.querySelector("#qcStreak");if(!el)return;const t=(STREAK>=2?"🔥 "+STREAK+" ":"")+(PWR.fifty?"⚡×"+PWR.fifty+" ":"")+(PWR.dbl?"🚀2×XP ":"")+(STREAK>=7?"👑":"");if(el.textContent!==t)el.textContent=t}

/* ---------- 8. ROOFTOP BOSS: THE NUMBER MUNCHER (multi-step 4.OA.A.3) + REWARDS CEREMONY ---------- */
const RF=ROOMS.rooftop,BZ=RF.cz+1.8;
/* problem generator: 2-step word problems; every step's answer is checked by tools/verify_math.js */
function bossProblem(tier,rnd){rnd=rnd||Math.random;const r=(a,b)=>a+Math.floor(rnd()*(b-a+1));const T=Math.max(0,Math.min(2,tier|0));const kind=r(0,3);
  if(kind===0){const R=r(T===2?5:4,T?9:7),C=T===2?r(24,48):T?r(13,29):r(11,18),tot=R*C,p=r(Math.ceil(tot*.3),tot-6);
    return{id:"chairs",text:`The Festival Stage has ${R} rows of chairs with ${C} chairs in each row. ${p} people are already sitting. How many chairs are still empty?`,
      steps:[{ask:`Step 1: How many chairs are there in all?`,eq:`${R} × ${C} = ?`,ans:tot,mis:[[R+C,`That's ${R} + ${C}. ${R} rows of ${C} means multiply!`],[tot-C,`That's one row short: ${R-1} × ${C}.`],[tot+C,`That's one row too many: ${R+1} × ${C}.`],[R*Math.floor(C/10)*10+C%10,`You did ${R} × ${Math.floor(C/10)*10} but forgot ${R} × ${C%10}.`]],hint:`Split ${C} into ${Math.floor(C/10)*10} + ${C%10}. Multiply each part by ${R}, then add.`},
             {ask:`Step 2: ${tot} chairs, ${p} are taken. How many are empty?`,eq:`${tot} − ${p} = ?`,ans:tot-p,mis:[[tot+p,`That's ${tot} + ${p}. Taken chairs are not empty — subtract!`],[p,`${p} is how many are taken, not empty.`],[tot-p+10,`Check your tens when you subtract.`],[tot-p-10,`Check your tens when you subtract.`]],hint:`Empty = all chairs − taken chairs.`}]}}
  if(kind===1){let B,N,K,tot;for(let i=0;i<50;i++){B=r(3,T?8:6);N=T===2?r(12,24):r(6,12);tot=B*N;const ds=[];for(let k=3;k<=9;k++)if(tot%k===0&&k!==B&&k!==N&&tot/k>1)ds.push(k);if(ds.length){K=ds[r(0,ds.length-1)];break}}if(!K){B=4;N=6;K=3;tot=24}const a=tot/K;
    return{id:"cupcakes",text:`Ms. Okafor brings ${B} boxes of cupcakes with ${N} cupcakes in each box. She shares them equally among ${K} festival tables. How many cupcakes go on each table?`,
      steps:[{ask:`Step 1: How many cupcakes are there in all?`,eq:`${B} × ${N} = ?`,ans:tot,mis:[[B+N,`That's ${B} + ${N}. ${B} boxes of ${N} means multiply!`],[tot+N,`One box too many: ${B+1} × ${N}.`],[tot-N,`One box short: ${B-1} × ${N}.`]],hint:`${B} groups of ${N}.`},
             {ask:`Step 2: Share ${tot} cupcakes equally among ${K} tables.`,eq:`${tot} ÷ ${K} = ?`,ans:a,mis:[[tot-K,`That's ${tot} − ${K}. Sharing equally is division: ${K} × ? = ${tot}.`],[a+1,`Check: ${K} × ${a+1} = ${K*(a+1)}, that's more than ${tot}.`],[a-1,`Check: ${K} × ${a-1} = ${K*(a-1)}, that's less than ${tot}.`]],hint:`Think: ${K} × what = ${tot}?`}]}}
  if(kind===2){const G=r(3,T?7:5),Pc=T===2?r(105,180):T?r(12,35):r(6,15),cost=G*Pc,M=Math.ceil((cost+r(5,60))/10)*10;
    return{id:"money",text:`Theo has $${M}. He buys ${G} festival passes that cost $${Pc} each. How much money does Theo have left?`,
      steps:[{ask:`Step 1: How much do the ${G} passes cost?`,eq:`${G} × $${Pc} = ?`,ans:cost,mis:[[G+Pc,`That's ${G} + ${Pc}. ${G} passes at $${Pc} each means multiply!`],[cost+Pc,`One pass too many: ${G+1} × ${Pc}.`],[cost-Pc,`One pass short: ${G-1} × ${Pc}.`]],hint:`${G} × ${Pc}: split ${Pc} into tens and ones.`},
             {ask:`Step 2: Theo had $${M} and spent $${cost}. How much is left?`,eq:`$${M} − $${cost} = ?`,ans:M-cost,mis:[[M+cost,`That's ${M} + ${cost}. Spending money means subtract!`],[M-Pc,`That's only one pass. He bought ${G}!`],[M-cost+10,`Check your tens when you subtract.`]],hint:`Money left = money he had − money he spent.`}]}}
  const s=T===2?r(105,240):T?r(14,45):r(6,15),k=r(2,T?6:4);
  return{id:"pretzels",text:`Ms. Marcia sold ${s} pretzels in the morning. In the afternoon she sold ${k} times as many pretzels. How many pretzels did she sell in all that day?`,
    steps:[{ask:`Step 1: How many pretzels in the afternoon?`,eq:`${k} × ${s} = ?`,ans:k*s,mis:[[s+k,`That's ${s} + ${k}. "${k} times as many" means multiply!`],[k*s+s,`That's already the whole day. Just the afternoon first!`],[(k-1)*s,`That's ${k-1} times as many. Use ${k}.`]],hint:`"Times as many" means multiply: ${k} × ${s}.`},
           {ask:`Step 2: Morning + afternoon. How many in all?`,eq:`${s} + ${k*s} = ?`,ans:s+k*s,mis:[[k*s,`That's only the afternoon. Add the morning too!`],[s,`That's only the morning. Add the afternoon too!`],[s+k*s+10,`Check your tens when you add.`]],hint:`In all = morning + afternoon.`}]}}
function stepChoices(st){const set=new Set([st.ans]),why={};st.mis.forEach(([v,w])=>{if(set.size<4&&Number.isInteger(v)&&v>0&&!set.has(v)){set.add(v);why[v]=w}});[st.ans+10,st.ans+1,Math.max(1,st.ans-1),st.ans+2,st.ans*2].forEach(v=>{if(set.size<4&&v>0&&!set.has(v))set.add(v)});return{ch:[...set].sort(()=>Math.random()-.5),why}}
/* the boss model: procedural robot on the Festival Stage */
const BOSS={g:new T.Group(),hp:6,max:6};
{const g=BOSS.g,bm=M(0x5b2bd0,{metalness:.4,roughness:.35}),dm=M(0x2a1170,{metalness:.5,roughness:.4}),gl=M(0xff3bd4,{emissive:0xff3bd4,emissiveIntensity:1.4});
  const body=new T.Mesh(new T.BoxGeometry(2,1.7,1.3),bm);body.position.y=1.25;const belly=new T.Mesh(new T.BoxGeometry(1.2,.8,.05),M(0x14123a,{emissive:0x2bd9ff,emissiveIntensity:.25}));belly.position.set(0,1.15,.66);
  const fc=document.createElement("canvas");fc.width=256;fc.height=160;BOSS.fc=fc;BOSS.ft=new T.CanvasTexture(fc);BOSS.ft.colorSpace=T.SRGBColorSpace;
  const head=new T.Group();head.position.y=2.45;const hb=new T.Mesh(new T.BoxGeometry(1.5,1,1.1),dm);const face=new T.Mesh(new T.PlaneGeometry(1.3,.82),new T.MeshBasicMaterial({map:BOSS.ft,toneMapped:false}));face.position.z=.56;head.add(hb,face);
  const jaw=new T.Mesh(new T.BoxGeometry(1.4,.25,1),dm);jaw.position.set(0,-.62,.02);head.add(jaw);BOSS.jaw=jaw;
  const ant=new T.Mesh(new T.CylinderGeometry(.03,.03,.5,8),dm);ant.position.y=.75;const tip=new T.Mesh(new T.SphereGeometry(.11,12,10),gl);tip.position.y=1.02;head.add(ant,tip);BOSS.tip=tip;
  const arms=[-1,1].map(s=>{const a=new T.Group();a.position.set(s*1.15,1.8,0);const u=new T.Mesh(new T.CylinderGeometry(.14,.14,1.1,10),bm);u.position.y=-.5;const cl=new T.Mesh(new T.BoxGeometry(.4,.3,.4),gl);cl.position.y=-1.1;a.add(u,cl);g.add(a);return a});BOSS.arms=arms;
  [-.5,.5].forEach(x=>{const l=new T.Mesh(new T.BoxGeometry(.45,.5,.6),dm);l.position.set(x,.25,0);g.add(l)});
  g.add(body,belly,head);BOSS.head=head;BOSS.body=body;g.traverse(o=>{if(o.isMesh)o.castShadow=true});
  const hpC=document.createElement("canvas");hpC.width=512;hpC.height=96;BOSS.hpC=hpC;BOSS.hpT=new T.CanvasTexture(hpC);const hpS=new T.Sprite(new T.SpriteMaterial({map:BOSS.hpT,depthTest:false}));hpS.scale.set(2.6,.49,1);hpS.position.y=3.75;hpS.renderOrder=6;g.add(hpS);BOSS.hpS=hpS;
  g.position.set(RF.cx,.3,BZ);g.rotation.y=Math.PI;g.visible=false;S.add(g);BOSS.home=g.position.clone();
  const sl=new T.SpotLight(0xff8af0,0,14,.5,.6);sl.position.set(0,7,BZ-3);sl.target=g;S.add(sl);BOSS.spot=sl}
function bossFace(mode){const c=BOSS.fc.getContext("2d");c.fillStyle="#0b0620";c.fillRect(0,0,256,160);c.fillStyle=mode==="hurt"?"#ff4d6d":mode==="sleep"?"#7c6cff":"#2bd9ff";c.font="900 54px Trebuchet MS";c.textAlign="center";c.textBaseline="middle";
  if(mode==="sleep"){c.fillText("—  —",128,62);c.font="800 28px Trebuchet MS";c.fillText("z z z",205,26)}else if(mode==="hurt"){c.fillText("× ×",128,62)}else{c.beginPath();c.arc(78,62,22,0,7);c.arc(178,62,22,0,7);c.fill();c.fillStyle="#0b0620";c.beginPath();c.arc(84+(mode==="look"?6:0),66,9,0,7);c.arc(184+(mode==="look"?6:0),66,9,0,7);c.fill()}
  c.fillStyle="#ffd23f";c.font="900 30px Trebuchet MS";c.fillText(mode==="happy"?"◡":"÷ × ÷ ×",128,126);BOSS.ft.needsUpdate=true}
function bossHP(){const c=BOSS.hpC.getContext("2d");c.clearRect(0,0,512,96);c.fillStyle="rgba(20,18,58,.9)";c.beginPath();c.roundRect(4,4,504,88,24);c.fill();c.fillStyle="#fff";c.font="800 26px Trebuchet MS";c.textAlign="center";c.fillText("👾 NUMBER MUNCHER",256,30);
  c.fillStyle="#333";c.fillRect(30,50,452,26);c.fillStyle=BOSS.hp>2?"#ff3bd4":"#ff4d6d";c.fillRect(30,50,452*BOSS.hp/BOSS.max,26);c.strokeStyle="#fff";c.lineWidth=3;c.strokeRect(30,50,452,26);BOSS.hpT.needsUpdate=true}
bossFace("sleep");bossHP();
/* boss UI card */
const BCD=document.createElement("div");BCD.id="bosscard";BCD.style.cssText="box-sizing:border-box;position:fixed;left:50%;bottom:10px;transform:translateX(-50%);width:min(94vw,660px);background:rgba(255,255,255,.97);color:#14123a;border:4px solid #5b2bd0;border-radius:18px;padding:.5rem .8rem .6rem;font:700 16px 'Trebuchet MS',sans-serif;z-index:14;display:none;box-shadow:0 8px 24px rgba(0,0,0,.4);max-height:58vh;overflow:auto";document.body.appendChild(BCD);
function bossTier(){return Math.min(2,+(localStorage.getItem("lu3d_bosswins")||0))}
function bossStart(){if(QG||W2.boss)return;try{document.exitPointerLock()}catch(_){}const tier=bossTier(),used=new Set(),probs=[];for(let i=0;i<30&&probs.length<3;i++){const p=bossProblem(tier);if(!used.has(p.id)){used.add(p.id);probs.push(p)}}
  W2.boss={probs,pi:0,si:0,hearts:3,t0:performance.now(),phase:"intro",tier,wrong:0,fx:[]};BOSS.hp=BOSS.max=probs.length*2;bossHP();bossFace("look");BOSS.spot.intensity=60;
  P.x=RF.cx;P.z=BZ-5;P.yaw=0;P.vy=0;TH.x=RF.cx-1.6;TH.z=BZ-5.6;camSnap=true;
  say("Number Muncher","ROAR! I munch numbers for breakfast! Solve my 2-step problems to stop me!",BOSS.g.position.x,4.2,BOSS.g.position.z);BUBW.t=performance.now()+3000;speak("Roar! I munch numbers for breakfast! Solve my two step problems to stop me!");
  setTimeout(()=>{if(W2.boss){W2.boss.phase="fight";bossCard()}},2200)}
function bossCard(){const b=W2.boss;if(!b)return;const p=b.probs[b.pi],st=p.steps[b.si],cc=stepChoices(st);b.cur={st,why:cc.why,ch:cc.ch,tries:0};
  const done=p.steps.slice(0,b.si).map(s=>`<div style="color:#1b7a3a">✅ ${s.eq.replace("?",s.ans)}</div>`).join("");
  BCD.innerHTML=`<div style="display:flex;gap:.4rem;align-items:center;font-size:13px;flex-wrap:wrap"><span style="background:#5b2bd0;color:#fff;border-radius:999px;padding:.1rem .55rem">👾 BOSS · Problem ${b.pi+1}/${b.probs.length}</span><span>${"❤️".repeat(b.hearts)}${"🖤".repeat(3-b.hearts)}</span><span style="flex:1"></span><button id="bcRead" style="font:700 13px inherit;border:2px solid #14123a;border-radius:10px;background:#ffd23f;cursor:pointer">🔊</button><button id="bcQuit" style="font:700 13px inherit;border:2px solid #14123a;border-radius:10px;background:#eee;cursor:pointer">✕</button></div>
  <div style="margin:.35rem 0;line-height:1.3">${p.text}</div>${done}<div style="margin:.3rem 0;font-weight:900;color:#5b2bd0">${st.ask} <span style="background:#f1ebff;border-radius:8px;padding:0 .35rem">${st.eq}</span></div>
  <div id="bcAns" style="display:flex;gap:.45rem;flex-wrap:wrap">${cc.ch.map(v=>`<button data-v="${v}" style="flex:1 1 40%;min-height:46px;font:900 19px 'Trebuchet MS',sans-serif;border:3px solid #14123a;border-radius:14px;background:#ff8af0;color:#14123a;cursor:pointer;touch-action:manipulation">${v}</button>`).join("")}</div><div id="bcMsg" style="font-size:14px;color:#b3261e;margin-top:.3rem"></div>`;
  BCD.style.display="block";BCD.querySelectorAll("[data-v]").forEach(bt=>bt.onclick=e=>{e.stopPropagation();bossAnswer(+bt.dataset.v,bt)});BCD.querySelector("#bcRead").onclick=()=>speak(p.text+" "+st.ask);BCD.querySelector("#bcQuit").onclick=()=>bossEnd(false,true);
  speak((b.si===0?p.text+" ":"")+st.ask)}
function bossAnswer(v,bt){const b=W2.boss;if(!b||b.phase!=="fight"||!b.cur)return;const st=b.cur.st;b.cur.tries++;
  if(v===st.ans){bt.style.background="#6dff6b";b.phase="hit";BOSS.hp--;bossHP();bossLaser();bossFace("hurt");BOSS.hurtT=performance.now();
    const line=["POW! 💥","ZAP! ⚡","BOOM! 💫","KAPOW! 🌟"][Math.floor(Math.random()*4)];POP.textContent=line;POP.style.opacity=1;POP.style.transform="translate(-50%,-50%) scale(1)";speak("Yes! "+st.ans+"!");
    setTimeout(()=>{POP.style.opacity=0;if(!W2.boss)return;bossFace("look");b.si++;if(b.si>=b.probs[b.pi].steps.length){b.si=0;b.pi++}if(b.pi>=b.probs.length||BOSS.hp<=0)return bossWin();b.phase="fight";bossCard()},1400)}
  else{b.wrong++;bt.disabled=true;bt.style.background="#ff8a8a";bt.style.textDecoration="line-through";const w=b.cur.why[v]||st.hint;const mm=BCD.querySelector("#bcMsg");if(mm)mm.textContent="💡 "+w;speak(w);
    if(b.cur.tries===1){b.hearts--;BOSS.chompT=performance.now();say("Number Muncher","CHOMP! 😋",BOSS.g.position.x,4.2,BOSS.g.position.z);BUBW.t=performance.now()+1200;
      BCD.querySelector("span:nth-child(2)").textContent="❤️".repeat(b.hearts)+"🖤".repeat(3-b.hearts);if(b.hearts<=0){b.phase="lost";setTimeout(()=>bossEnd(false),1800)}}}}
function bossLaser(){const from=new T.Vector3(P.x,P.fy+1.3,P.z),to=BOSS.g.position.clone().add(new T.Vector3(0,2.3,0)),d=to.clone().sub(from),L=d.length();
  const m=new T.Mesh(new T.CylinderGeometry(.07,.07,L,10),new T.MeshBasicMaterial({color:0x7cf7ff,transparent:true,opacity:.95}));m.position.copy(from).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());S.add(m);W2.boss.fx.push({m,l:.45});confetti(to.x,to.y,to.z);if(P.onG){P.vy=6;P.onG=false}}
function bossWin(){const b=W2.boss;b.phase="defeat";b.t0=performance.now();BCD.style.display="none";const wins=+(localStorage.getItem("lu3d_bosswins")||0)+1;localStorage.setItem("lu3d_bosswins",wins);
  say("Number Muncher","Nooo! You out-mathed me! 🫠",BOSS.g.position.x,4.2,BOSS.g.position.z);BUBW.t=performance.now()+2000;speak("Nooo! You out mathed me!")}
function bossEnd(won,quit){const b=W2.boss;if(!b)return;BCD.style.display="none";CERE.style.display="none";b.fx.forEach(f=>S.remove(f.m));if(W2.cTrophy){S.remove(W2.cTrophy);W2.cTrophy=null}if(W2.cPed){S.remove(W2.cPed);W2.cPed=null}if(W2.cOk)W2.cOk.visible=false;
  BOSS.g.visible=AREA==="rooftop";BOSS.g.scale.setScalar(1);BOSS.g.rotation.set(0,Math.PI,0);BOSS.g.position.copy(BOSS.home);BOSS.spot.intensity=0;bossFace("sleep");BOSS.hp=BOSS.max;bossHP();W2.boss=null;camSnap=true;
  if(!won&&!quit){say("Theo","So close! The Muncher burped and ran. Let's try again! 💪",TH.x,2.4,TH.z);BUBW.t=performance.now()+2500}}
/* rewards ceremony */
const CERE=document.createElement("div");CERE.style.cssText="box-sizing:border-box;position:fixed;left:50%;bottom:16px;transform:translateX(-50%);width:min(92vw,520px);background:linear-gradient(#fff8d6,#ffe27a);color:#14123a;border:5px solid #14123a;border-radius:22px;padding:.8rem 1rem;font:800 17px 'Trebuchet MS',sans-serif;z-index:15;display:none;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.45)";document.body.appendChild(CERE);
function ceremony(){const b=W2.boss;b.phase="ceremony";b.t0=performance.now();const stars=b.hearts>=3?3:b.hearts===2?2:1,xp=40+20*stars+10*b.tier,coins=10+5*stars,tix=30+20*stars;b.reward={stars,xp,coins,tix};TIX.n=TIX.n+tix;
  P.x=RF.cx;P.z=BZ-2.2;P.vy=4;P.onG=false;P.yaw=Math.PI;TH.x=RF.cx+1.4;TH.z=BZ-2.4;
  if(!W2.cOk){const h=2.2,geo=new T.PlaneGeometry(h*.7,h);geo.translate(0,h/2,0);W2.cOk=new T.Mesh(geo,new T.MeshStandardMaterial({map:TV.wave||TV.front,alphaTest:.5,side:T.DoubleSide}));S.add(W2.cOk)}W2.cOk.visible=true;W2.cOk.position.set(RF.cx-1.6,.3,BZ-2.6);
  const tr=prizeMesh(PRIZES.find(p=>p.id==="trophy"));tr.scale.setScalar(1.7);tr.position.set(RF.cx,9,BZ+.6);const ped=new T.Mesh(new T.CylinderGeometry(.45,.55,1,20),M(0xffffff,{roughness:.3}));ped.position.set(RF.cx,.8,BZ+.6);S.add(ped);W2.cPed=ped;S.add(tr);W2.cTrophy=tr;BOSS.spot.intensity=90;BOSS.spot.color.setHex(0xffe27a);
  CERE.innerHTML=`<div style="font-size:30px">🏆 FESTIVAL CHAMPION! 🏆</div><div style="font-size:38px;letter-spacing:.2rem">${"⭐".repeat(stars)}${"☆".repeat(3-stars)}</div><div>${window.PNAME||"You"} beat the Number Muncher with ${b.hearts} heart${b.hearts===1?"":"s"} left!</div>
   <div style="display:flex;justify-content:center;gap:.6rem;margin:.5rem 0;flex-wrap:wrap;font-size:19px"><span>+${xp} XP ⭐</span><span>+${coins} 🪙</span><span>+${tix} 🎟️</span></div><div style="font-size:14px">Ms. Okafor: "Two-step problems: find the hidden number first, then use it. You did it!"</div>
   <button id="ceOk" style="margin-top:.5rem;font:900 20px 'Trebuchet MS';border:3px solid #14123a;border-radius:14px;background:#2bd9ff;padding:.4rem 1.4rem;cursor:pointer;min-height:46px">Awesome! 🎉</button>`;
  setTimeout(()=>{if(W2.boss&&W2.boss.phase==="ceremony"){CERE.style.display="block";CERE.querySelector("#ceOk").onclick=()=>bossEnd(true)}},1600);
  speak("Festival champion! "+stars+" stars!");try{parent.postMessage({lv3d:"boss",xp,coins,stars,tix},"*")}catch(_){}}
function updateBoss(dt,now){const b=W2.boss;BOSS.g.visible=AREA==="rooftop";if(AREA!=="rooftop")return;const t=now/1000;BOSS.tip.material.emissiveIntensity=1+Math.sin(t*4)*.6;
  if(!b){BOSS.g.position.y=.3+Math.sin(t*1.2)*.03;BOSS.head.rotation.z=Math.sin(t*.8)*.05;BOSS.jaw.position.y=-.62;return}
  b.fx.forEach(f=>{f.l-=dt;f.m.material.opacity=Math.max(0,f.l*2)});b.fx=b.fx.filter(f=>{if(f.l<=0){S.remove(f.m);return false}return true});
  const ch=BOSS.chompT?Math.max(0,1-(now-BOSS.chompT)/700):0,hu=BOSS.hurtT?Math.max(0,1-(now-BOSS.hurtT)/500):0;
  BOSS.jaw.position.y=-.62-Math.abs(Math.sin(t*(ch?18:3)))*(ch?.35:.08);BOSS.arms.forEach((a,i)=>a.rotation.x=Math.sin(t*2+i*3)*.3-(ch?1.2*ch:0));BOSS.g.position.x=BOSS.home.x+(hu?Math.sin(now/25)*.12*hu:0);BOSS.g.position.z=BOSS.home.z-ch*.6;
  BOSS.body.material.emissive.setHex(hu?0xff2244:0x000000);BOSS.body.material.emissiveIntensity=hu;
  if(b.phase==="defeat"){const k=(now-b.t0)/1000;BOSS.g.rotation.y=Math.PI+k*k*6;BOSS.g.scale.setScalar(Math.max(.01,1-k/1.8));if(k>.4&&!b.boom1){b.boom1=1;confetti(BOSS.home.x,2,BOSS.home.z)}if(k>1.2&&!b.boom2){b.boom2=1;confetti(BOSS.home.x-1,2.5,BOSS.home.z);confetti(BOSS.home.x+1,2.5,BOSS.home.z)}if(k>1.9){BOSS.g.visible=false;ceremony()}}
  if(b.phase==="ceremony"){BOSS.g.visible=false;const k=(now-b.t0)/1000;if(W2.cTrophy){W2.cTrophy.position.y=Math.max(1.32,9-k*5);W2.cTrophy.rotation.y+=dt*1.5}if(W2.cOk)W2.cOk.rotation.y=Math.atan2(cam.position.x-W2.cOk.position.x,cam.position.z-W2.cOk.position.z);
    if(P.onG&&k<6&&Math.floor(k/1.1)>(b.jumps||0)){b.jumps=Math.floor(k/1.1);P.vy=7;P.onG=false}if(Math.floor(k*1.3)!==b.cf&&k<4){b.cf=Math.floor(k*1.3);confetti(RF.cx+(Math.random()-.5)*4,4,BZ-1.5)}}}
const _gameCam=gameCam;gameCam=function(dt){const b=W2.boss;if(b&&AREA==="rooftop"){const t=performance.now()/1000;let want,look;
  if(b.phase==="ceremony"){const a=Math.sin(t*.4)*.6;want=new T.Vector3(RF.cx+Math.sin(a)*6.5,2.5,BZ-2-Math.cos(a)*6.5);look=new T.Vector3(RF.cx,1.6,BZ-1.6)}
  else{want=new T.Vector3(P.x+2.6,P.fy+2.2,P.z-3.6);look=new T.Vector3(BOSS.home.x,1.2,BOSS.home.z)}
  if(camSnap){cam.position.copy(want);camSnap=false}else cam.position.lerp(want,Math.min(1,dt*3));cam.lookAt(look);return true}return _gameCam(dt)};
/* hooks into the regular game loop */
const _blk2=BLOCKIN;BLOCKIN=()=>_blk2()||!!W2.boss;
const _int2=interactions;interactions=function(){if(W2.boss)return [];let L=_int2();if(AREA==="rooftop"&&!QG&&Math.hypot(P.x-RF.cx,P.z-(BZ-2.6))<3.2){L=L.filter(d=>d.type!=="talk");L.unshift({type:"boss",x:RF.cx,z:BZ-2.6,r:3.2,label:"Press E — wake the 👾 Number Muncher (BOSS)!"})}return L};
const _try2=tryDoor;tryDoor=function(){if(W2.boss)return;if(nearDoor&&nearDoor.type==="boss")return bossStart();_try2()};
function camHide(){const th=ACT.theo&&ACT.theo.g;if(th){const near=Math.hypot(cam.position.x-TH.x,cam.position.y-(TH.fy||0)-1.2,cam.position.z-TH.z)<1.4;th.visible=!near}const bz=!!(QG||W2.boss||W2.blaster||W2.ui);if(bz!==W2.busy){W2.busy=bz;try{parent.postMessage({lv3d:"busy",on:bz},"*")}catch(_){}}}
const _ug2=updateGame;updateGame=function(dt,now){_ug2(dt,now);camHide();updateBoss(dt,now);if(QG)powerBadge();if(QG&&QG.phase==="ask"&&!QG.pwrDone){QG.pwrDone=true;powerAsk(QG)}if(W2.boss)TC.style.visibility="hidden";if(W2.aura&&W2.aura.parent&&STREAK<7)legendGlow()};
const _ok2=window.OVERLAY_KEYS;window.OVERLAY_KEYS=e=>{if(W2.boss){if(e.key==="Escape")bossEnd(false,true);const n=+e.key;if(n>=1&&n<=4&&W2.boss.phase==="fight"){const bt=BCD.querySelectorAll("[data-v]")[n-1];if(bt&&!bt.disabled)bossAnswer(+bt.dataset.v,bt)}return true}return _ok2(e)};
Object.assign(window,{bossProblem,stepChoices,bossStart,bossAnswer,bossEnd,BOSS,PWR,powerAfter});
