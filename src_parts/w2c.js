/* ---------- 2. ARCADE WORKER + PRIZE CORNER ---------- */
/* Worker used to share the solid counter box (WK at x=-6.2 inside a 1.3-wide desk at x=-6.5),
   so his legs were buried and a sneaker poked out in front. He now stands on the floor in the
   aisle behind an open-legged counter; shelves are real 3D, not a flat photo. Worker is arcade-only. */
const AR=ROOMS.arcade,WK={x:AR.cx-7.2,z:AR.cz+4.85};
(function buildPrizeCorner(){
  const g=AR.g, wood=M(0x6b3a1a,{roughness:.7}), dark=M(0x3d2212,{roughness:.65}), edge=M(0x8a5a30,{roughness:.6});
  /* wall shelves: back against x=-9, front around x=-8.22, leaving an aisle for the worker */
  const shX=-8.55, shZ=5.15, shLen=3.5, shD=.62, shBack=-8.86;
  box(g,.07,2.55,shLen,dark,shBack,1.28,shZ);
  box(g,.62,2.55,.07,wood,shX,.28+1.0,shZ-shLen/2+.03);
  box(g,.62,2.55,.07,wood,shX,.28+1.0,shZ+shLen/2-.03);
  [0.08,.78,1.42,2.06,2.52].forEach(y=>box(g,shD,.05,shLen,edge,shX,y,shZ));
  /* uprights */
  [-1.15,0,1.15].forEach(dz=>box(g,.05,2.45,.05,wood,shX,1.28,shZ+dz,0));

  const tag=(txt,x,y,z)=>{const t=canvasTex(256,96,(c,W,H)=>{c.fillStyle="#fff8e0";c.fillRect(0,0,W,H);c.strokeStyle="#14123a";c.lineWidth=8;c.strokeRect(4,4,W-8,H-8);c.fillStyle="#14123a";c.textAlign="center";c.textBaseline="middle";c.font="800 36px Trebuchet MS,sans-serif";c.fillText(txt,W/2,H/2)});
    const m=new T.Mesh(new T.PlaneGeometry(.34,.13),new T.MeshBasicMaterial({map:t,toneMapped:false}));m.position.set(x,y,z);m.rotation.y=Math.PI/2;g.add(m)};

  const addCandy=(x,y,z,col=0xff4d6d)=>{const jar=new T.Mesh(new T.CylinderGeometry(.075,.08,.15,12),M(col,{roughness:.3,transparent:true,opacity:.82,metalness:.05}));jar.position.set(x,y+.08,z);g.add(jar);
    const lid=new T.Mesh(new T.CylinderGeometry(.085,.085,.03,12),M(0xffd23f,{roughness:.45}));lid.position.set(x,y+.165,z);g.add(lid);
    const bag=new T.Mesh(new T.BoxGeometry(.1,.14,.05),M(col,{roughness:.55}));bag.position.set(x+.13,y+.08,z);bag.rotation.z=.12;g.add(bag)};
  const addSlime=(x,y,z,col=0x7cff6b)=>{const tub=new T.Mesh(new T.CylinderGeometry(.1,.1,.07,14),M(0xf4f0e6,{roughness:.5}));tub.position.set(x,y+.035,z);g.add(tub);
    const goo=new T.Mesh(new T.SphereGeometry(.085,14,10),M(col,{roughness:.12,metalness:.08}));goo.scale.y=.55;goo.position.set(x,y+.085,z);g.add(goo)};
  const addSpinner=(x,y,z,col=0x2bd9ff)=>{const m=M(col,{emissive:col,emissiveIntensity:.25,roughness:.35});const s=new T.Group();
    for(let i=0;i<3;i++){const l=new T.Mesh(new T.CylinderGeometry(.045,.045,.03,12),m);l.position.set(Math.cos(i*2.09)*.07,0,Math.sin(i*2.09)*.07);s.add(l)}
    s.add(new T.Mesh(new T.CylinderGeometry(.03,.03,.04,12),M(0xffffff)));s.rotation.x=Math.PI/2;s.position.set(x,y+.03,z);g.add(s)};
  const addSquishy=(x,y,z,col=0xff8fb1)=>{const b=new T.Mesh(new T.SphereGeometry(.09,14,12),M(col,{roughness:.75}));b.scale.set(1.05,1.2,.95);b.position.set(x,y+.1,z);g.add(b);
    const eye=M(0x14123a);[-.03,.03].forEach(dx=>{const e=new T.Mesh(new T.SphereGeometry(.015,8,6),eye);e.position.set(x+dx,y+.13,z+.07);g.add(e)})};
  const addCar=(x,y,z,col=0x2bd9ff)=>{const body=new T.Mesh(new T.BoxGeometry(.22,.06,.12),M(col,{roughness:.35,metalness:.35}));body.position.set(x,y+.075,z);g.add(body);
    const cab=new T.Mesh(new T.BoxGeometry(.1,.05,.11),M(0x1a2448,{roughness:.3}));cab.position.set(x+.02,y+.12,z);g.add(cab);
    const wm=M(0x1a1a1a,{roughness:.8});for(const dx of[-.07,.07])for(const dz of[-.075,.075]){const w=new T.Mesh(new T.CylinderGeometry(.032,.032,.036,10),wm);w.rotation.z=Math.PI/2;w.position.set(x+dx,y+.032,z+dz);g.add(w)}};

  /* shelf items — five identifiable prize types, with ticket tags on the lip */
  const lip=shX+shD/2-.02;
  [[-1.35,0xff4d6d],[-1.1,0xff9f1c],[-.85,0x7a5cff]].forEach(([z,c])=>addCandy(shX,0.13,shZ+z,c));
  [[-1.35,0xff4d6d],[-1.05,0xffc83d]].forEach(([z,c])=>addCandy(shX,.83,shZ+z,c));
  tag("CANDY  15🎟️",lip,.55,shZ-1.1);
  [[-.45,0x7cff6b],[-.2,0xc84bff],[.05,0x2bd9ff]].forEach(([z,c])=>addSlime(shX,0.13,shZ+z,c));
  [[-.45,0x7cff6b],[-.18,0xff5d8f]].forEach(([z,c])=>addSlime(shX,.83,shZ+z,c));
  tag("SLIME  30🎟️",lip,.55,shZ-.2);
  [[.45,0x2bd9ff],[.7,0xffd23f],[.95,0xff5d8f]].forEach(([z,c])=>addSpinner(shX,.83,shZ+z,c));
  addSpinner(shX,1.47,shZ+.7,0x6dff6b);addSpinner(shX,1.47,shZ+.95,0x2bd9ff);
  tag("SPINNER  80🎟️",lip,1.18,shZ+.7);
  [[.4,0xff8fb1],[.65,0xffd23f],[.9,0x7cff6b]].forEach(([z,c])=>addSquishy(shX,0.13,shZ+z,c));
  addSquishy(shX,1.47,shZ+.4,0xff8fb1);
  tag("SQUISHY  45🎟️",lip,.55,shZ+.65);
  addCar(shX,2.12,shZ-1.2,0x2bd9ff);addCar(shX,2.12,shZ-.85,0xff5d1a);addCar(shX,2.12,shZ-.5,0x6dff6b);
  addCar(shX,1.47,shZ-1.2,0xffc83d);
  tag("RC CAR  200🎟️",lip,1.85,shZ-.85);

  /* open-legged counter: top + short apron + legs, so feet show in the aisle behind it */
  const cx=-6.5, cz=5.15, cw=.78, cd=2.55, topY=.95;
  box(g,cw,.08,cd,wood,cx,topY,cz);
  box(g,.05,.22,cd,dark,cx+cw/2-.03,topY-.15,cz,0); /* front apron, leaves a gap to the floor */
  const leg=M(0x2a1a10,{roughness:.7});
  for(const dx of[-cw/2+.06,cw/2-.06])for(const dz of[-cd/2+.08,cd/2-.08])box(g,.07,topY-.04,.07,leg,cx+dx,(topY-.04)/2,cz+dz);
  const block=box(g,cw,topY,cd,wood,cx,topY/2,cz);block.visible=false; /* keep the player from walking through the desk */
  /* glass display case on the room-end of the counter, not in front of the worker */
  const gx=cx, gz=cz-1.05;
  const glass=M(0xb8e0ff,{roughness:.08,metalness:.15,transparent:true,opacity:.28,depthWrite:false});
  box(g,.7,.04,0.7,wood,gx,.02,gz,0);
  box(g,.7,.03,0.7,wood,gx,topY+.42,gz,0);
  box(g,.03,.42,.7,glass,gx-cw/2+.04,(topY+.42)/2,gz,0);
  box(g,.03,.42,.7,glass,gx+cw/2-.04,(topY+.42)/2,gz,0);
  box(g,.7,.42,.03,glass,gx,(topY+.42)/2,gz-.34,0);
  box(g,.7,.42,.03,glass,gx,(topY+.42)/2,gz+.34,0);
  addSpinner(gx,.99,gz-.12,0x2bd9ff);addSlime(gx-.16,.99,gz+.12,0x7cff6b);addSquishy(gx+.16,.99,gz+.1,0xff8fb1);

  /* ticket counter machine — chunky 3D kiosk at the entrance-end of the desk */
  const tx=cx, tz=cz+1.15;
  box(g,.36,.7,.32,M(0x2a1838,{roughness:.5}),tx,1.3,tz);
  box(g,.28,.18,.02,M(0x22ff88,{emissive:0x22ff88,emissiveIntensity:1.1}),tx,1.48,tz+.17,0);
  box(g,.2,.04,.04,M(0x14123a),tx,1.18,tz+.17,0);
  box(g,.22,.08,.22,M(0xffd23f,{emissive:0xffc83d,emissiveIntensity:.35}),tx,1.0,tz);
  sign(g,"TICKETS",tx+.2,1.68,tz,.7,.16,"#14123a","#22ff88",Math.PI/2);

  /* neon PRIZE CORNER sign — thick lit box, not a flat wall sticker */
  box(g,.14,.46,2.6,M(0x1a0828,{emissive:0xff2bc0,emissiveIntensity:.55}),-8.12,3.12,shZ,0);
  const neon=M(0xff7ad9,{emissive:0xff7ad9,emissiveIntensity:2.2});
  box(g,.05,.05,2.7,neon,-8.04,3.33,shZ,0);box(g,.05,.05,2.7,neon,-8.04,2.91,shZ,0);
  sign(g,"PRIZE CORNER",-8.04,3.12,shZ,2.4,.32,"#1a0828","#ffd6f3",Math.PI/2);
  const lamp=new T.PointLight(0xffe0b8,22,9);lamp.position.set(-6.3,2.7,5.15);g.add(lamp);
  sign(g,"TICKET BLASTER",3.9,2.85,5.95,2.8,.55,"#22ff88","#14123a");
})();
W2.loadWorker=function(){if(W2.wkLoading)return;W2.wkLoading=true;const go=()=>loadChar(window.WORKER3D_URL,1.9).then(a=>{if(!a)return;ACT.worker=a;a.g.position.set(WK.x,0,WK.z);a.g.visible=AREA==="arcade"});
  go()};
const TIX={get n(){return +(localStorage.getItem("lu3d_tickets")||0)},set n(v){localStorage.setItem("lu3d_tickets",String(Math.max(0,v|0)))}};
const TIXEL=document.createElement("div");TIXEL.style.cssText="position:fixed;right:12px;top:"+(/embed/.test(location.search)?"60px":"12px")+";background:#14123a;color:#ffd23f;font:900 16px 'Trebuchet MS',sans-serif;border:3px solid #ffd23f;border-radius:12px;padding:.25rem .6rem;z-index:9;display:none";document.body.appendChild(TIXEL);
function tixHud(){const t="🎟️ "+TIX.n+" tickets";if(TIXEL.textContent!==t)TIXEL.textContent=t;TIXEL.style.display=(AREA==="arcade"&&!QG)?"block":"none"}
const PRIZES=[{id:"candy",n:"Candy Bag",c:15,e:"🍬",col:0xff4d6d},{id:"slime",n:"Slime Tub",c:30,e:"🟢",col:0x7cff6b},{id:"squishy",n:"Squishy Toy",c:45,e:"🐙",col:0xff8fb1},{id:"spinner",n:"Fidget Spinner",c:80,e:"🌀",col:0x2bd9ff},{id:"rccar",n:"Remote Control Car",c:200,e:"🚗",col:0xff5d1a}];
function prizeMesh(p){const g=new T.Group(),m=M(p.col,{emissive:p.col,emissiveIntensity:.35,roughness:.4});
  if(p.id==="spinner"){for(let i=0;i<3;i++){const l=new T.Mesh(new T.CylinderGeometry(.09,.09,.05,16),m);l.position.set(Math.cos(i*2.09)*.14,0,Math.sin(i*2.09)*.14);g.add(l)}g.add(new T.Mesh(new T.CylinderGeometry(.06,.06,.07,12),M(0xffffff)))}
  else if(p.id==="slime"){const tub=new T.Mesh(new T.CylinderGeometry(.16,.16,.1,16),M(0xf4f0e6));g.add(tub);const goo=new T.Mesh(new T.SphereGeometry(.14,14,10),m);goo.scale.y=.55;goo.position.y=.08;g.add(goo)}
  else if(p.id==="squishy"){const b=new T.Mesh(new T.SphereGeometry(.16,14,12),m);b.scale.set(1.05,1.2,.95);b.position.y=.02;g.add(b)}
  else if(p.id==="rccar"){const body=new T.Mesh(new T.BoxGeometry(.36,.1,.2),m);body.position.y=.08;g.add(body);const cab=new T.Mesh(new T.BoxGeometry(.16,.08,.18),M(0x1a2448));cab.position.set(.04,.16,0);g.add(cab);const wm=M(0x1a1a1a);for(const dx of[-.12,.12])for(const dz of[-.12,.12]){const w=new T.Mesh(new T.CylinderGeometry(.05,.05,.05,10),wm);w.rotation.z=Math.PI/2;w.position.set(dx,.05,dz);g.add(w)}}
  else {const jar=new T.Mesh(new T.CylinderGeometry(.12,.13,.22,14),m);jar.position.y=.05;g.add(jar);const lid=new T.Mesh(new T.CylinderGeometry(.14,.14,.04,14),M(0xffd23f));lid.position.y=.18;g.add(lid)}
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
  if(H){const t=(now-H.t0)/1000;if(H.stage===0){want=-Math.PI/2;say("Arcade Worker","One "+H.p.n+", coming up…",WK.x,2.4,WK.z);if(t>1){H.stage=1;H.mesh=prizeMesh(H.p);H.mesh.position.set(WK.x-.35,1.5,WK.z);S.add(H.mesh)}}
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
