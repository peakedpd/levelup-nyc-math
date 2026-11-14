/* ---------- 2. ARCADE WORKER + PRIZE CORNER (art from John's 03_Assets: Arcade Worker.png, bg_arcade_prize_counter.jpg) ---------- */
const AR=ROOMS.arcade,WK={x:AR.cx,z:AR.cz-5.9};
{const pt=TL.load("tex/prize_counter.webp");pt.colorSpace=T.SRGBColorSpace;const pm=new T.Mesh(new T.PlaneGeometry(11.6,6.5),new T.MeshBasicMaterial({map:pt,toneMapped:false}));pm.position.set(0,3.1,-RD/2+.26);AR.g.add(pm);
  const gc=new T.Mesh(new T.BoxGeometry(7.6,.9,1),new T.MeshStandardMaterial({color:0x99ddff,transparent:true,opacity:.18,roughness:.05}));gc.position.set(0,1.6,-4.6);AR.g.add(gc);
  sign(AR.g,"PRIZE CORNER · TRADE TICKETS",0,.62,-3.98,7.6,.5);sign(AR.g,"TICKET BLASTER",0,2.85,1.95,2.8,.55,"#22ff88","#14123a")}
W2.loadWorker=function(){if(W2.wkLoading)return;W2.wkLoading=true;const go=()=>loadChar(window.WORKER3D_URL,1.9).then(a=>{if(!a)return;ACT.worker=a;a.g.position.set(WK.x,0,WK.z);a.g.visible=AREA==="arcade"});
  if(window.WORKER3D_URL)go();else{const s=document.createElement("script");s.src="worker_data.js";s.onload=go;s.onerror=()=>console.warn("worker model missing");document.head.appendChild(s)}};
const TIX={get n(){return +(localStorage.getItem("lu3d_tickets")||0)},set n(v){localStorage.setItem("lu3d_tickets",String(Math.max(0,v|0)))}};
const TIXEL=document.createElement("div");TIXEL.style.cssText="position:fixed;right:12px;top:"+(/embed/.test(location.search)?"60px":"12px")+";background:#14123a;color:#ffd23f;font:900 16px 'Trebuchet MS',sans-serif;border:3px solid #ffd23f;border-radius:12px;padding:.25rem .6rem;z-index:9;display:none";document.body.appendChild(TIXEL);
function tixHud(){const t="🎟️ "+TIX.n+" tickets";if(TIXEL.textContent!==t)TIXEL.textContent=t;TIXEL.style.display=(AREA==="arcade"&&!QG)?"block":"none"}
const PRIZES=[{id:"stickers",n:"Sticker Pack",c:15,e:"🌟",col:0xff5d8f},{id:"bracelet",n:"Glow Bracelet",c:30,e:"💫",col:0x6dff6b},{id:"ball",n:"Bouncy Ball",c:45,e:"🏀",col:0xff9f1c},{id:"spinner",n:"Fidget Spinner",c:80,e:"🌀",col:0x2bd9ff},{id:"bear",n:"Teddy Bear",c:150,e:"🧸",col:0xc8915a},{id:"trophy",n:"Golden Math Trophy",c:300,e:"🏆",col:0xffc83d}];
function prizeMesh(p){const g=new T.Group(),m=M(p.col,{emissive:p.col,emissiveIntensity:.35,roughness:.4});
  if(p.id==="ball")g.add(new T.Mesh(new T.SphereGeometry(.2,20,16),m));
  else if(p.id==="spinner"){for(let i=0;i<3;i++){const l=new T.Mesh(new T.CylinderGeometry(.09,.09,.05,16),m);l.position.set(Math.cos(i*2.09)*.14,0,Math.sin(i*2.09)*.14);g.add(l)}g.add(new T.Mesh(new T.CylinderGeometry(.06,.06,.07,12),M(0xffffff)))}
  else if(p.id==="bear"){const h=new T.Mesh(new T.SphereGeometry(.14,14,12),m);h.position.y=.27;[-.1,.1].forEach(x=>{const e=new T.Mesh(new T.SphereGeometry(.05,8,6),m);e.position.set(x,.4,0);g.add(e)});g.add(new T.Mesh(new T.SphereGeometry(.2,14,12),m),h)}
  else if(p.id==="trophy"){const c=new T.Mesh(new T.CylinderGeometry(.2,.08,.32,18),m);c.position.y=.3;g.add(c,new T.Mesh(new T.BoxGeometry(.22,.1,.22),m))}
  else if(p.id==="bracelet"){const r=new T.Mesh(new T.TorusGeometry(.15,.035,10,24),m);r.rotation.x=Math.PI/2;g.add(r)}else g.add(new T.Mesh(new T.BoxGeometry(.3,.02,.22),m));
  g.add(new T.PointLight(p.col,3,2));return g}
const PZ=document.createElement("div");PZ.style.cssText="position:fixed;inset:0;z-index:30;display:none;align-items:center;justify-content:center;background:rgba(10,6,40,.55);font:700 15px 'Trebuchet MS',sans-serif";document.body.appendChild(PZ);
const btnCss="border:3px solid #14123a;border-radius:12px;font:900 16px 'Trebuchet MS';min-width:48px;min-height:44px;cursor:pointer;margin:.2rem;touch-action:manipulation";
function openPrizes(){if(QG||W2.blaster)return;try{document.exitPointerLock()}catch(_){}W2.ui=true;const n=TIX.n;
  PZ.innerHTML=`<div style="background:#fff8e8;border:4px solid #14123a;border-radius:20px;width:min(94vw,620px);max-height:92vh;overflow:auto;padding:.8rem 1rem;color:#14123a"><div style="display:flex;gap:.8rem;align-items:center"><img src="img/arcade_worker_ref.webp" alt="Arcade Worker" style="height:110px;border-radius:12px;background:#efe6d2"><div><div style="font:900 22px 'Trebuchet MS'">🎟️ Prize Corner</div><div><b>Arcade Worker:</b> "Yo. You've got <b>${n}</b> tickets. Pick something and I'll grab it for you."</div><div style="font-size:13px;margin-top:.25rem;color:#5a6286">Earn tickets by playing <b>Ticket Blaster</b> — the green machine.</div></div></div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:.5rem;margin-top:.7rem">${PRIZES.map(p=>`<button data-pz="${p.id}" ${p.c>n?"disabled":""} style="text-align:left;border:3px solid #14123a;border-radius:14px;padding:.45rem .6rem;background:${p.c>n?"#ddd":"#ffd23f"};font:800 15px 'Trebuchet MS';cursor:${p.c>n?"not-allowed":"pointer"}"><span style="font-size:1.6rem">${p.e}</span> ${p.n}<br><small>${p.c} tickets</small></button>`).join("")}</div>
  <div id="pzq" style="margin-top:.6rem"></div><div style="text-align:right;margin-top:.5rem"><button data-pzx style="${btnCss};background:#fff">✕ Close</button></div></div>`;
  PZ.style.display="flex";PZ.querySelector("[data-pzx]").onclick=closePrizes;PZ.querySelectorAll("[data-pz]").forEach(b=>b.onclick=()=>askQty(PRIZES.find(x=>x.id===b.dataset.pz)));speak("You've got "+n+" tickets. Pick a prize.")}
/* buying more than one = a multiplication check before the worker rings it up */
function askQty(p){const max=Math.min(4,Math.floor(TIX.n/p.c)),q=PZ.querySelector("#pzq");
  q.innerHTML=`<div style="background:#e9f3ff;border:3px solid #14123a;border-radius:14px;padding:.5rem .7rem"><b>${p.e} ${p.n}</b> costs ${p.c} tickets. How many? ${[1,2,3,4].filter(k=>k<=max).map(k=>`<button data-q="${k}" style="${btnCss};background:#2bd9ff">${k}</button>`).join("")}<div id="pzc"></div></div>`;
  q.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{const k=+b.dataset.q;if(k===1)return buy(p,1);const tot=k*p.c;const opts=[tot,tot+p.c,k+p.c,tot-p.c].filter((v,i,a)=>v>0&&a.indexOf(v)===i).slice(0,3).sort(()=>Math.random()-.5);
    q.querySelector("#pzc").innerHTML=`<div style="margin-top:.4rem"><b>Arcade Worker:</b> "${k} × ${p.c} tickets is how many tickets?" ${opts.map(v=>`<button data-t="${v}" style="${btnCss};background:#ffd23f">${v}</button>`).join("")}<div id="pzm" style="color:#b3261e"></div></div>`;speak(k+" times "+p.c+" tickets is how many tickets?");
    q.querySelectorAll("[data-t]").forEach(bb=>bb.onclick=()=>{const v=+bb.dataset.t;if(v===tot)return buy(p,k);bb.disabled=true;bb.style.background="#ff8a8a";const msg=v===k+p.c?`That's ${k} + ${p.c}. ${k} prizes at ${p.c} each is ${k} groups of ${p.c}: multiply!`:`Count the groups: ${k} groups of ${p.c}. Skip count by ${p.c}.`;q.querySelector("#pzm").textContent="💡 "+msg;speak(msg)})})}
function closePrizes(){PZ.style.display="none";W2.ui=false}
function buy(p,k){TIX.n=TIX.n-p.c*k;closePrizes();W2.hand={p,k,t0:performance.now(),stage:0};const got=JSON.parse(localStorage.getItem("lu3d_prizes")||"[]");for(let i=0;i<k;i++)got.push(p.id);localStorage.setItem("lu3d_prizes",JSON.stringify(got));
  try{parent.postMessage({lv3d:"prize",id:p.id,name:p.n,qty:k,emoji:p.e},"*")}catch(_){}}
/* handoff cinematic: worker turns to the shelf, grabs the prize, turns back and tosses it; you catch it and jump */
function updateWorker(dt,now){const a=ACT.worker;if(a)a.g.visible=AREA==="arcade";if(AREA!=="arcade")return;const H=W2.hand;let want=Math.atan2(P.x-WK.x,P.z-WK.z);
  if(H){const t=(now-H.t0)/1000;if(H.stage===0){want=Math.PI;say("Arcade Worker","One "+H.p.n+", coming up…",WK.x,2.4,WK.z);if(t>1){H.stage=1;H.mesh=prizeMesh(H.p);H.mesh.position.set(WK.x,1.6,WK.z-.4);S.add(H.mesh)}}
    else if(H.stage===1){const k=Math.min(1,(t-1)/1.2),sx=WK.x,sz=WK.z+.5;H.mesh.position.set(sx+(P.x-sx)*k,1.6+Math.sin(k*Math.PI)*1.4+(P.fy-.3)*k,sz+(P.z-sz)*k);H.mesh.rotation.y+=dt*6;say("Arcade Worker","Catch! "+H.p.e,WK.x,2.4,WK.z);
      if(k>=1){H.stage=2;H.t2=now;if(P.onG)P.vy=7;confetti(P.x,P.fy+2,P.z);POP.textContent=H.p.e+" "+(H.k>1?H.k+" × ":"")+H.p.n+"!";POP.style.opacity=1;POP.style.transform="translate(-50%,-50%) scale(1)";speak("You got the "+H.p.n+"!")}}
    else{H.mesh.position.set(P.x,P.fy+2.3+Math.sin(now/200)*.05,P.z);H.mesh.rotation.y+=dt*3;if(now-H.t2>2200){S.remove(H.mesh);POP.style.opacity=0;POP.style.transform="translate(-50%,-50%) scale(.6)";W2.hand=null}}}
  else if(Math.hypot(P.x-WK.x,P.z-WK.z)<5&&!W2.wkHi){W2.wkHi=1;say("Arcade Worker","Yo. Prize Corner's open. Tickets go here.",WK.x,2.4,WK.z);BUBW.t=now+2500}
  if(a){turn(a,want,dt);a.g.position.set(WK.x,0,WK.z);step(a,false,dt)}}

/* ---------- 3. MR. SAL at the Clothing Store counter (his original art: img/characters_mr_sal_*) ---------- */
const CL=ROOMS.clothing,SAL={x:CL.cx,z:CL.cz-6.3};
W2.sal=spriteChar({idle:"img/characters_mr_sal_mrsal_hands_on_hips_full.webp",wave:"img/characters_mr_sal_mrsal_waving_full.webp",point:"img/characters_mr_sal_mrsal_pointing_up_full.webp",think:"img/characters_mr_sal_mrsal_thinking_full.webp"},2.3,SAL.x,SAL.z);
sign(CL.g,"MR. SAL'S STYLE COUNTER",0,2.75,-RD/2+.3,5,.55,"#1f7a72","#fff");
{const nm=labelSprite("Mr. Sal",1.3);nm.position.set(SAL.x,2.6,SAL.z);S.add(nm);W2.salName=nm}
function updateSal(now){const s=W2.sal;s.m.visible=W2.salName.visible=AREA==="clothing";if(AREA!=="clothing")return;const d=Math.hypot(P.x-SAL.x,P.z-SAL.z);
  s.m.rotation.y=Math.atan2(cam.position.x-SAL.x,cam.position.z-SAL.z);
  if(d<6.5&&!W2.salHi){W2.salHi=now;const nm=window.PNAME||"friend";say("Mr. Sal","Hey "+nm+"! Mr. Sal here — I used to teach at Level Up Academy. Now I run the Clothing Store. Press E to shop!",SAL.x,2.6,SAL.z);BUBW.t=now+3500;speak("Hey "+nm+"! Mister Sal here. I run the Clothing Store now. Press E to shop!")}
  if(d>9)W2.salHi=0;s.set(W2.salShop&&now-W2.salShop<2500?"point":W2.salHi&&now-W2.salHi<3000?"wave":d<4?"think":"idle")}
function salShop(){W2.salShop=performance.now();say("Mr. Sal","Great choice! Let's find you a new look — spend your City Coins.",SAL.x,2.6,SAL.z);BUBW.t=performance.now()+1800;setTimeout(()=>{try{parent.postMessage({lv3d:"door",id:"shop"},"*")}catch(_){}},500)}

/* ---------- 4. TALKING (Q or 💬) ---------- */
const STREET_OK={x:-55+2.7,z:-6.3};
{const h=2.2,geo=new T.PlaneGeometry(h*.7,h);geo.translate(0,h/2,0);W2.okMat=new T.MeshStandardMaterial({map:TV.front,alphaTest:.5,side:T.DoubleSide,roughness:.9});W2.ok=new T.Mesh(geo,W2.okMat);W2.ok.position.set(STREET_OK.x,.12,STREET_OK.z);W2.ok.castShadow=true;S.add(W2.ok);
  SOL.push({x0:STREET_OK.x-.3,x1:STREET_OK.x+.3,z0:STREET_OK.z-.3,z1:STREET_OK.z+.3,y0:0,top:2.2})}
function updateStreetOk(now){W2.ok.visible=AREA==="street";if(AREA!=="street")return;const d=Math.hypot(P.x-STREET_OK.x,P.z-STREET_OK.z),fy=d<7?Math.atan2(P.x-STREET_OK.x,P.z-STREET_OK.z):0;
  const ca=Math.atan2(cam.position.x-STREET_OK.x,cam.position.z-STREET_OK.z),rel=wrapA(ca-fy),k=Math.min(4,Math.round(Math.abs(rel)/(Math.PI/4)));let key=["front","fq","side","bq","back"][k];if(k===0&&d<4)key=(Math.floor(now/2500)%3===0)?"wave":"talk";
  if(W2.okMat.map!==TV[key]){W2.okMat.map=TV[key];W2.okMat.needsUpdate=true}W2.ok.scale.x=(k>0&&k<4&&rel>0)?-1:1;W2.ok.rotation.y=ca;
  if(d<3.2&&!W2.okHi&&!QG){W2.okHi=now;say("Ms. Okafor","Good morning, "+(window.PNAME||"friend")+"! Class is inside — come on in! 👋",STREET_OK.x,2.5,STREET_OK.z);BUBW.t=now+2500}if(d>6)W2.okHi=0}
const nextM=()=>{for(const m of MS){const sv=PROG[m.id]||{};if(!sv.done)return m}return null};
const TALK={
 "Theo":()=>{const m=nextM();return ["Why was 6 afraid of 7? Because 7 8 9! 😂","Tip: skip counting is a superpower. 4, 8, 12, 16…","The green machine in the arcade is Ticket Blaster. Shoot the right answer!","Trade tickets at the Prize Corner. The worker hands you the prize!",m?"Next up: "+m.title+". "+(m.loc==="school"?"Ms. Okafor has it at school.":"Ms. Marcia has it out here."):"You finished every mission! You're a legend.","Mr. Sal used to be our teacher. Now he runs the Clothing Store!"]},
 "Ms. Marcia":()=>{const m=nextM();return ["Hi sweetie! The festival needs a LOT of supplies.","When things come in equal packs, I multiply. Saves me so much time!","Sharing a pile fairly? That's division. Every table gets the same.",m&&m.loc!=="school"?"Press E and help me with "+m.title+"!":"Ms. Okafor's class is doing great work. Keep it up!"]},
 "Ms. Okafor":()=>{const m=nextM();return ["Arrays are just equal rows. 3 rows of 7 is 3 × 7.","'Times as many' means multiply. 4 times as many as 6 is 4 × 6 = 24.","Every division fact has a multiplication twin: 42 ÷ 7 = 6 because 6 × 7 = 42.",m?"Your next mission is "+m.title+". You can do it!":"You're a math star!","Mistakes help your brain grow. Try, check, try again!"]},
 "Arcade Worker":()=>["Tickets? Prize Corner. Right here.","Fidget spinners are 80 tickets. Just saying.","Ticket Blaster's the green machine. Streaks get you double tickets.","Buying more than one? Multiply. That's how I ring it up."],
 "Mr. Sal":()=>["I taught at Level Up Academy for years. Ms. Okafor is doing an amazing job!","Pricing tip: 3 shirts at 12 coins each is 3 × 12 = 36 coins.","There's more than one way to solve a problem — and more than one way to wear a hoodie.","Press E at my counter to try on clothes and spend your City Coins."]};
W2.talkI={};
function talkTo(who,x,y,z){const L=TALK[who]();const i=(W2.talkI[who]||0)%L.length;W2.talkI[who]=i+1;say(who,L[i]+"  💬",x,y,z);BUBW.t=performance.now()+3800;speak(L[i])}
function talkers(){const c=[["Theo",TH.x,2.4+(TH.fy||0),TH.z,2.6]];if(AREA==="street")c.push(["Ms. Marcia",MA.x,2.75,MA.z,3.2],["Ms. Okafor",STREET_OK.x,2.5,STREET_OK.z,3.2]);if(AREA==="school")c.push(["Ms. Okafor",TCH.x,2.5,TCH.z,3.2]);if(AREA==="arcade")c.push(["Arcade Worker",WK.x,2.4,WK.z,4.4]);if(AREA==="clothing")c.push(["Mr. Sal",SAL.x,2.6,SAL.z,4.4]);return c}
function nearTalker(){let best=null,bd=1e9;talkers().forEach(n=>{const d=Math.hypot(P.x-n[1],P.z-n[3]);if(d<n[4]&&d<bd){bd=d;best=n}});
  /* prefer a grown-up over Theo when both are close */const g=talkers().filter(n=>n[0]!=="Theo"&&Math.hypot(P.x-n[1],P.z-n[3])<n[4]);return g.length?g[0]:best}
function doTalk(){if(QG||W2.blaster||W2.ui)return;const n=nearTalker();if(n)talkTo(n[0],n[1],n[2],n[3])}
