"use strict";
/* =====================================================================
   LevelUp world2.js — loaded after the main street3d script.
   1. School lobby, hallway and rooftop as real walk-in 3D rooms
   2. Arcade Worker (3D model) at the Prize Corner: trade tickets, he hands you the prize
   3. Mr. Sal (the original teacher) runs the Clothing Store counter
   4. Talking to Theo / Ms. Marcia / Ms. Okafor / Arcade Worker / Mr. Sal (Q or 💬)
   5. Ticket Blaster: a real arcade action game for the math (streak powers)
   6. Touch controls (joystick + buttons) for phones and Chromebooks
   ===================================================================== */
const W2={};
function solidsOf(g){g.updateMatrixWorld(true);g.traverse(o=>{if(o.isMesh&&o.userData.solid&&!o.userData.inSol){o.userData.inSol=1;const b=new T.Box3().setFromObject(o);SOL.push({x0:b.min.x,x1:b.max.x,z0:b.min.z,z1:b.max.z,y0:b.min.y,top:b.max.y})}})}
function canvasTex(w,h,draw){const c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t}
function sign(g,txt,x,y,z,w,h,bg="#14123a",fg="#ffd23f",ry=0){const t=canvasTex(1024,Math.round(1024*h/w),(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.strokeStyle=fg;c.lineWidth=14;c.strokeRect(10,10,W-20,H-20);c.fillStyle=fg;c.textAlign="center";c.textBaseline="middle";const fs=Math.min(H*.55,1800/Math.max(6,txt.length));c.font=`900 ${fs}px Trebuchet MS,sans-serif`;c.fillText(txt,W/2,H/2+fs*.05)});const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:t,roughness:.7,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.25}));m.position.set(x,y,z);m.rotation.y=ry;g.add(m);return m}
function checkerTex(a,b,n){const t=canvasTex(256,256,(c,W)=>{const s=W/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){c.fillStyle=(i+j)%2?a:b;c.fillRect(i*s,j*s,s,s)}});t.wrapS=t.wrapT=T.RepeatWrapping;return t}
/* room shell with door gaps: doors=[{wall,at,w}] */
function shell(kind,cz,w,d,h,opt){const g=new T.Group();g.position.set(0,0,cz);S.add(g);
  if(opt.floorMap)opt.floorMap.repeat.set(w/4,d/4);const fm=new T.MeshStandardMaterial({map:opt.floorMap||null,color:opt.floorMap?0xffffff:opt.floor,roughness:.6}),wm=M(opt.wall);
  const fl=new T.Mesh(new T.PlaneGeometry(w,d),fm);fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;g.add(fl);
  if(!opt.open){const ce=new T.Mesh(new T.PlaneGeometry(w,d),M(0xf8f4ec));ce.rotation.x=Math.PI/2;ce.position.y=h;g.add(ce)}
  const wallH=opt.open?1.1:h;
  const seg=(wall,len)=>{const cuts=(opt.doors||[]).filter(x=>x.wall===wall).map(x=>[x.at-x.w/2,x.at+x.w/2]).sort((a,b)=>a[0]-b[0]);let s=-len/2;const parts=[];cuts.forEach(([a,b])=>{if(a>s)parts.push([s,a]);s=b});if(s<len/2)parts.push([s,len/2]);
    const put=(L,c,y,hh)=>{if(wall==="front"||wall==="back")box(g,L,hh,.4,wm,c,y,wall==="front"?d/2:-d/2);else box(g,.4,hh,L,wm,wall==="left"?-w/2:w/2,y,c)};
    parts.forEach(([a,b])=>put(b-a,(a+b)/2,wallH/2,wallH));if(!opt.open)cuts.forEach(([a,b])=>put(b-a,(a+b)/2,3+(h-3)/2,h-3))};
  ["front","back","left","right"].forEach(wl=>seg(wl,wl==="front"||wl==="back"?w:d));
  const Lt=new T.PointLight(opt.light||0xfff1d8,opt.lightI||45,Math.max(w,d)*1.6);Lt.position.set(0,h+(opt.open?3:-.4),0);g.add(Lt);
  if(opt.open){const hl=new T.HemisphereLight(0xcfe6ff,0x8a6a4a,1.2);g.add(hl);Lt.userData.hemi=hl}
  ROOMS[kind]={cx:0,cz,ST:[],g,light:Lt,w,d,h:opt.open?40:h,open:!!opt.open,exit:{x:0,z:cz+d/2-.9},exits:[],spawns:{}};return g}
function doorFrame(g,x,z,ry,label,col=0x3a6fd8){const f=new T.Group();f.position.set(x,0,z);f.rotation.y=ry;g.add(f);
  box(f,2.6,3,.08,M(col,{emissive:col,emissiveIntensity:.35}),0,1.5,-.05,0);box(f,.25,3.2,.5,M(0xeee6d6),-1.42,1.6,0,0);box(f,.25,3.2,.5,M(0xeee6d6),1.42,1.6,0,0);box(f,3.1,.3,.5,M(0xeee6d6),0,3.15,0,0);
  if(label)sign(f,label,0,3.75,.02,3.4,.6);return f}
/* camera-facing sprite character (used for Mr. Sal) */
function spriteChar(texs,h,x,z){const ts={};for(const k in texs){const t=TL.load(texs[k]);t.colorSpace=T.SRGBColorSpace;ts[k]=t}const geo=new T.PlaneGeometry(1,1);geo.translate(0,.5,0);const mat=new T.MeshStandardMaterial({map:ts.idle,alphaTest:.5,side:T.DoubleSide,roughness:.9});const m=new T.Mesh(geo,mat);m.scale.set(h*.55,h,1);m.position.set(x,0,z);m.castShadow=true;S.add(m);
  return {m,mat,ts,h,x,z,aspect:{},set(k){const t=ts[k];if(!t||mat.map===t)return;mat.map=t;mat.needsUpdate=true;const im=t.image;if(im&&im.width)this.m.scale.set(h*im.width/im.height,h,1)}}}
/* ---------- 1a. LOBBY ---------- */
{const cz=480,w=18,d=16,h=5.6;const g=shell("lobby",cz,w,d,h,{wall:0xf1e2c2,floorMap:checkerTex("#e9e2d0","#2b3d8f",8),doors:[{wall:"front",at:0,w:2.6},{wall:"back",at:0,w:2.6}]});
  sign(g,"WELCOME TO LEVEL UP ACADEMY",0,4.4,-d/2+.22,10,1.1);
  box(g,5,1.1,1.2,M(0x7a4a2a),-4.5,.55,-1);box(g,5.2,.08,1.4,M(0xd8a86a),-4.5,1.14,-1,0);sign(g,"OFFICE",-4.5,.7,-.38,1.6,.45,"#24407a","#fff");
  box(g,.5,.35,.4,M(0x222222),-5.5,1.35,-1.1,0);box(g,.45,.3,.02,M(0x88ccff,{emissive:0x3388ff,emissiveIntensity:.8}),-5.5,1.5,-.88,0);
  box(g,4,2.4,.8,M(0x5a3a22),5.5,1.2,-d/2+.6);const glass=new T.Mesh(new T.BoxGeometry(3.7,1.9,.05),new T.MeshStandardMaterial({color:0xbfe6ff,transparent:true,opacity:.25,roughness:.05}));glass.position.set(5.5,1.35,-d/2+1.02);g.add(glass);
  const gold=M(0xffc83d,{metalness:.9,roughness:.25,emissive:0x553300,emissiveIntensity:.3});
  for(let i=0;i<4;i++){const cup=new T.Group();const b=new T.Mesh(new T.CylinderGeometry(.18,.08,.3,16),gold);b.position.y=.35;const s=new T.Mesh(new T.CylinderGeometry(.03,.03,.2,8),gold);s.position.y=.12;cup.add(b,s,new T.Mesh(new T.BoxGeometry(.2,.06,.2),gold));cup.position.set(4.2+i*.85,.95+(i%2)*.7,-d/2+.65);g.add(cup)}
  [-6,6].forEach(x=>{box(g,2.6,.12,.7,M(0xc8915a),x,.5,4.5);box(g,.12,.5,.6,M(0x444444),x-1.1,.25,4.5);box(g,.12,.5,.6,M(0x444444),x+1.1,.25,4.5)});
  [[-8,-7],[8,6.8],[-8,6.8]].forEach(([x,z])=>{box(g,.8,.7,.8,M(0xb85c38),x,.35,z);const l=new T.Mesh(new T.SphereGeometry(.6,12,10),M(0x3f8f3a));l.position.set(x,1.2,z);g.add(l)});
  const crest=new T.Mesh(new T.CircleGeometry(1.1,40),new T.MeshStandardMaterial({map:canvasTex(256,256,c=>{c.fillStyle="#24407a";c.beginPath();c.arc(128,128,124,0,7);c.fill();c.fillStyle="#ffd23f";c.textAlign="center";c.font="900 92px Trebuchet MS";c.fillText("LU",128,140);c.font="800 24px Trebuchet MS";c.fillText("× ÷ ACADEMY",128,190)})}));crest.position.set(-4.5,3.3,-d/2+.22);g.add(crest);
  doorFrame(g,0,-d/2+.25,0,"HALLWAY · CLASSROOM ↑");
  Object.assign(ROOMS.lobby,{spawns:{front:{x:0,z:cz+d/2-2.6,yaw:Math.PI},back:{x:0,z:cz-d/2+2.2,yaw:0}},exits:[{x:0,z:cz+d/2-.9,to:"street",label:"Press E to go back outside"},{x:0,z:cz-d/2+.9,to:"hallway",spawn:"front",label:"Press E — walk down the hallway"}]});solidsOf(g)}
/* ---------- 1b. HALLWAY ---------- */
{const cz=530,w=9,d=30,h=4.6;const g=shell("hallway",cz,w,d,h,{wall:0xe8eef6,floorMap:checkerTex("#d6d0c0","#c8c0ae",10),doors:[{wall:"front",at:0,w:2.6},{wall:"back",at:0,w:2.6},{wall:"left",at:-4,w:2.6}],lightI:55});
  const lockM=[0x2a6bd8,0xe23b3b,0x2a9d8f,0xffb52e].map(c=>M(c,{metalness:.3,roughness:.5}));
  for(let i=0;i<22;i++){const z=-d/2+2+i*1.2;[-1,1].forEach(sd=>{if(sd<0&&Math.abs(z+4)<1.9)return;const x=sd*(w/2-.45);box(g,.5,2.1,1.1,lockM[(i+(sd>0?1:0))%4],x,1.05,z);for(let k=0;k<3;k++)box(g,.02,.04,.6,M(0x111111),x-sd*.26,1.75-k*.08,z,0)})}
  sign(g,"MS. OKAFOR · ROOM 4B",-w/2+.25,3.6,-4,3,.6,"#24407a","#fff",Math.PI/2);doorFrame(g,-w/2+.25,-4,Math.PI/2,null,0x2a9d8f);
  sign(g,"ROOFTOP GARDEN ↑",0,3.6,-d/2+.22,3.6,.6);doorFrame(g,0,-d/2+.25,0,null,0x7a2bd0);
  [[w/2-.24,4,-Math.PI/2,"MATH STARS ⭐"],[w/2-.24,-9,-Math.PI/2,"4 × 6 = 24"],[-w/2+.24,8,Math.PI/2,"ARRAYS ROCK"]].forEach(([x,z,r,t])=>sign(g,t,x,2.8,z,2.6,1,"#c89b5a","#14123a",r));
  Object.assign(ROOMS.hallway,{spawns:{front:{x:0,z:cz+d/2-2.4,yaw:Math.PI},classDoor:{x:-w/2+1.7,z:cz-4,yaw:Math.PI/2},roof:{x:0,z:cz-d/2+2.2,yaw:0}},
    exits:[{x:0,z:cz+d/2-.9,to:"lobby",spawn:"back",label:"Press E — back to the lobby"},{x:-w/2+.9,z:cz-4,to:"school",spawn:"door",label:"Press E — go into Ms. Okafor's classroom"},{x:0,z:cz-d/2+.9,to:"rooftop",spawn:"stairs",label:"Press E — climb the stairs to the rooftop garden"}]});solidsOf(g)}
/* ---------- 1c. ROOFTOP (open air, skyline all around) ---------- */
{const cz=600,w=22,d=20;const g=shell("rooftop",cz,w,d,1.1,{wall:0x9a5a44,floor:0x6b6f76,open:true,lightI:30});
  const sk=TL.load("tex/skyline.webp");sk.colorSpace=T.SRGBColorSpace;sk.wrapS=T.RepeatWrapping;sk.repeat.x=-2;const cyl=new T.Mesh(new T.CylinderGeometry(70,70,44,48,1,true),new T.MeshBasicMaterial({map:sk,side:T.BackSide,fog:false,toneMapped:false}));cyl.position.y=12;g.add(cyl);
  box(g,3,3,2.6,M(0x7b4a3a),0,1.5,-d/2+1.5);doorFrame(g,0,-d/2+2.85,0,"STAIRS ↓",0x7a2bd0);
  for(let i=0;i<4;i++){const x=-8+i*5.3;box(g,3.6,.6,1.2,M(0x8a5a32),x,.3,6.8);for(let k=0;k<5;k++){const p=new T.Mesh(new T.SphereGeometry(.28,10,8),M([0x3f8f3a,0xff6b8a,0xffd23f,0x8a5cff][(i+k)%4]));p.position.set(x-1.4+k*.7,.75,6.8);g.add(p)}}
  box(g,2.6,.12,.7,M(0xc8915a),-7,.5,-3);box(g,2.6,.12,.7,M(0xc8915a),7,.5,-3);
  for(let i=0;i<16;i++){const b=new T.Mesh(new T.SphereGeometry(.09,8,6),M(0xfff2c0,{emissive:0xffd77a,emissiveIntensity:1.6}));b.position.set(-10+i*1.33,3.2-Math.sin(i/15*Math.PI)*.6,0);g.add(b)}
  [-10.4,10.4].forEach(x=>box(g,.12,3.3,.12,M(0x333333),x,1.65,0));
  box(g,8,.3,5,M(0x24407a),0,.15,1.5);sign(g,"FESTIVAL STAGE",0,.32,4.05,6,.5,"#24407a","#ffd23f");
  Object.assign(ROOMS.rooftop,{spawns:{stairs:{x:3.4,z:cz-d/2+3.6,yaw:0}},exits:[{x:0,z:cz-d/2+3.4,to:"hallway",spawn:"roof",label:"Press E — take the stairs back down"}],exit:{x:0,z:cz-d/2+3.4}});solidsOf(g)}
ROOMS.school.spawns={door:{x:ROOMS.school.cx,z:ROOMS.school.cz+RD/2-2.6,yaw:Math.PI}};
ROOMS.school.exits=[{x:ROOMS.school.exit.x,z:ROOMS.school.exit.z,to:"hallway",spawn:"classDoor",label:"Press E — back to the hallway"}];
["arcade","clothing","apartment"].forEach(k=>{ROOMS[k].exits=[{x:ROOMS[k].exit.x,z:ROOMS[k].exit.z,to:"street",label:"Press E to go back outside"}]});
function roomLights(){for(const k in ROOMS){const L=ROOMS[k].light;if(!L)continue;L.visible=(AREA===k);if(L.userData.hemi)L.userData.hemi.visible=(AREA===k)}}
function goRoom(to,spawn){if(to==="street"){leaveRoom();return}const R0=ROOMS[to];if(!R0)return;if(AREA==="street")RET={x:P.x,z:P.z-Math.sign(P.z||1)*1.2};
  const sp=(spawn&&R0.spawns&&R0.spawns[spawn])||{x:R0.exit.x,z:R0.exit.z-2.6,yaw:Math.PI};AREA=to;P.x=sp.x;P.z=sp.z;P.fy=0;P.vy=0;P.yaw=sp.yaw;TH.x=P.x-Math.cos(sp.yaw)*1.1;TH.z=P.z+Math.sin(sp.yaw)*1.1;
  camYaw=sp.yaw+Math.PI;camPitch=.32;camDist=5.2;camSnap=true;roomLights();if(to==="arcade")W2.loadWorker();try{parent.postMessage({lv3d:"area",area:to},"*")}catch(_){}}
window.goRoom=goRoom;
const _enterRoom=enterRoom;enterRoom=function(kind){if(kind==="school"&&AREA==="street"){RET={x:P.x,z:P.z-Math.sign(P.z||1)*1.2};AREA="__";goRoom("lobby","front");return}_enterRoom(kind);roomLights();if(kind==="arcade")W2.loadWorker()};
const _leaveRoom=leaveRoom;leaveRoom=function(){_leaveRoom();roomLights()};
roomLights();
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

/* ---------- 9. TEACH ME in 3D: Ms. Okafor demonstrates on her desk (arrays, equal groups, sharing, area model) ---------- */
const TCD=document.createElement("div");TCD.style.cssText="box-sizing:border-box;position:fixed;left:50%;bottom:10px;transform:translateX(-50%);width:min(94vw,640px);background:rgba(255,255,255,.97);color:#14123a;border:4px solid #2fbf71;border-radius:18px;padding:.5rem .8rem;font:700 16px 'Trebuchet MS',sans-serif;z-index:14;display:none;box-shadow:0 8px 24px rgba(0,0,0,.4)";document.body.appendChild(TCD);
function teachStart(d){if(QG||W2.boss||W2.blaster)return;if(AREA!=="school"){if(AREA!=="street")leaveRoom();goRoom("school","door")}
  const R=ROOMS.school,DX=R.cx,DZ=R.cz-5.2,Y=1.02,g=new T.Group();S.add(g);const tm={d,g,k:0,t0:performance.now(),objs:[],DX,DZ,Y};W2.teach=tm;
  P.x=DX-.4;P.z=DZ+2.6;P.yaw=Math.PI;TH.x=DX+1.3;TH.z=DZ+2.9;camSnap=true;
  const v=d.vis||{};const mar=i=>{const m=OBJ.marbles.make(i);m.castShadow=true;return m};const bowl=(x,z)=>{const b=new T.Mesh(new T.CylinderGeometry(.22,.17,.12,20,1,true),new T.MeshStandardMaterial({color:0xc89b5a,side:T.DoubleSide,roughness:.6}));b.position.set(x,Y+.06,z);g.add(b);return b};
  const drop=(m,x,y,z,delay,stage)=>{m.position.set(x,y+1.6,z);m.visible=false;m.userData={tx:x,ty:y,tz:z,delay,stage};g.add(m);tm.objs.push(m)};
  if(v.type==="groups"||v.type==="share"){const k=v.type==="share"?v.d:v.k,n=v.type==="share"?v.N/v.d:v.n,sp=Math.min(.55,2.8/k);
    for(let b=0;b<k;b++){const x=DX-((k-1)*sp)/2+b*sp;bowl(x,DZ+.1);for(let i=0;i<n;i++)drop(mar(b),x+((i%3)-1)*.08,Y+.09+Math.floor(i/3)*.07,DZ+.1+((Math.floor(i/3)%2)-.5)*.06,b*.35+i*.05,v.type==="share"?2:(b===0?1:2))}
    if(v.type==="share")for(let i=0;i<v.N;i++)drop(mar(i),DX-1.3+(i%6)*.1,Y+.09,DZ-.35+Math.floor(i/6)*.1,i*.03,1)}
  else if(v.type==="compare"){for(let i=0;i<v.n;i++){const c=new T.Mesh(new T.BoxGeometry(.12,.12,.12),M(0x2bd9ff));drop(c,DX-1.4+i*.15,Y+.06,DZ-.4,i*.06,1)}
    for(let r=0;r<v.k;r++)for(let i=0;i<v.n;i++){const c=new T.Mesh(new T.BoxGeometry(.12,.12,.12),M(r%2?0xffd23f:0xff9f1c));drop(c,DX-1.4+i*.15,Y+.06,DZ-.15+r*.15,r*.4+i*.04,2)}}
  else if(v.type==="area"){const parts=String(v.y).split("").map((c,i,a)=>+c*10**(a.length-1-i)).filter(p=>p),tot=parts.reduce((a,b)=>a+b,0);let x0=DX-1.3;const H=.8;
    parts.forEach((p,i)=>{const w=Math.max(.6,2.6*p/tot),bx=new T.Mesh(new T.BoxGeometry(w-.03,.04,H),M([0xffd23f,0x2bd9ff,0xff9fcf,0x9be37a][i%4]));drop(bx,x0+w/2,Y+.02,DZ,i*.5,1);const lb=labelSprite(fmtN(p)+" × "+v.x,1);lb.position.set(x0+w/2,Y+.45+(i%2)*.32,DZ-.5);lb.visible=false;lb.userData={stage:1,delay:i*.5,label:1};g.add(lb);tm.objs.push(lb);
      const pr=labelSprite("= "+fmtN(p*v.x),.9);pr.position.set(x0+w/2,Y+.22+(i%2)*.3,DZ+.2);pr.visible=false;pr.userData={stage:2,delay:i*.5,label:1};g.add(pr);tm.objs.push(pr);x0+=w})}
  TCD.style.display="block";teachCard();try{document.exitPointerLock()}catch(_){}}
const fmtN=n=>Number(n).toLocaleString("en-US");
function teachCard(){const tm=W2.teach;if(!tm)return;const d=tm.d,k=tm.k,st=d.steps||[],last=k>st.length;
  TCD.innerHTML=`<div style="display:flex;gap:.4rem;align-items:center;font-size:13px"><span style="background:#2fbf71;color:#fff;border-radius:999px;padding:.1rem .55rem">📖 TEACH ME · ${d.who}</span><span style="flex:1"></span><button id="tcRead" style="font:700 13px inherit;border:2px solid #14123a;border-radius:10px;background:#ffd23f">🔊</button></div>
  <div style="margin:.3rem 0">${d.q}</div>${st.slice(0,k).map(s=>`<div>✏️ ${s}</div>`).join("")}${last?`<div style="color:#1b7a3a;font-weight:900">✅ Answer: ${d.a}</div>`:""}
  <div style="display:flex;gap:.5rem;margin-top:.4rem">${last?`<button id="tcGo" style="flex:1;min-height:46px;font:900 18px 'Trebuchet MS';border:3px solid #14123a;border-radius:14px;background:#2fbf71;color:#fff">🙋 My turn!</button>`:`<button id="tcNext" style="flex:1;min-height:46px;font:900 18px 'Trebuchet MS';border:3px solid #14123a;border-radius:14px;background:#ffd23f">${k===0?"▶ Show me":"Next step ▶"}</button>`}</div>`;
  const line=k===0?d.intro:last?"So the answer is "+d.a+". Now you try!":st[k-1];say(d.who,line,TCH.x,2.5,TCH.z);BUBW.t=performance.now()+6000;speak(line);
  TCD.querySelector("#tcRead").onclick=()=>speak(line);const nb=TCD.querySelector("#tcNext");if(nb)nb.onclick=()=>{tm.k++;tm.stageT=performance.now();teachCard()};const gb=TCD.querySelector("#tcGo");if(gb)gb.onclick=teachEnd}
function teachEnd(){const tm=W2.teach;if(!tm)return;S.remove(tm.g);W2.teach=null;TCD.style.display="none";camSnap=true;try{parent.postMessage({lv3d:"teachdone"},"*")}catch(_){}}
function updateTeach(dt,now){const tm=W2.teach;if(!tm)return;TCH.x=tm.DX+1.5;TCH.z=tm.DZ-.6;TCH.meet=0;const stage=tm.k>=2?2:tm.k>=1?1:0,st0=tm.stageT||tm.t0;
  tm.objs.forEach(m=>{const u=m.userData;if(u.stage>stage){m.visible=false;return}const t=(now-st0)/1000-(u.stage===stage?u.delay:-99);if(t<0){if(u.stage===stage&&!u.shown)m.visible=false;return}m.visible=true;u.shown=1;if(!u.label){const k=Math.min(1,t/.4);m.position.y=u.ty+(1-k*k)*1.6}});
  if(tm.d.vis&&tm.d.vis.type==="share"&&stage>=2)tm.objs.forEach(m=>{if(m.userData.stage===1)m.visible=false})}
const _gc3=gameCam;gameCam=function(dt){const tm=W2.teach;if(tm&&AREA==="school"){const want=new T.Vector3(tm.DX+.3,2.35,tm.DZ+2.3),look=new T.Vector3(tm.DX,1.0,tm.DZ-.1);if(camSnap){cam.position.copy(want);camSnap=false}else cam.position.lerp(want,Math.min(1,dt*3));cam.lookAt(look);return true}return _gc3(dt)};
const _blk3=BLOCKIN;BLOCKIN=()=>_blk3()||!!W2.teach;
const _int3=interactions;interactions=function(){return W2.teach?[]:_int3()};
const _ug3=updateGame;updateGame=function(dt,now){_ug3(dt,now);updateTeach(dt,now);if(W2.teach)TC.style.visibility="hidden"};
addEventListener("message",e=>{const d=e.data;if(d&&d.lv3d==="teach")teachStart(d)});
Object.assign(window,{teachStart,teachEnd});

/* ---------- 10. REALISM: soft contact shadows under every character (grounds them, no floating) ---------- */
const BLOBT=(()=>{const c=document.createElement("canvas");c.width=c.height=128;const g=c.getContext("2d"),gr=g.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,"rgba(0,0,0,.55)");gr.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=gr;g.fillRect(0,0,128,128);const t=new T.CanvasTexture(c);return t})();
const BLOBS={};function blobFor(k){if(!BLOBS[k]){const m=new T.Mesh(new T.PlaneGeometry(1.1,1.1),new T.MeshBasicMaterial({map:BLOBT,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.renderOrder=1;S.add(m);BLOBS[k]=m}return BLOBS[k]}
function updateBlobs(){[["hero",ACT.hero],["theo",ACT.theo],["marcia",ACT.marcia],["worker",ACT.worker]].forEach(([k,a])=>{if(!a)return;const b=blobFor(k),g=a.g;b.visible=g.visible;if(!g.visible)return;let gy=g.position.y,lift=0;if(k==="hero"){gy=(P.fy||0);lift=Math.max(0,g.position.y-gy)}b.position.set(g.position.x,gy+.02,g.position.z);const s=Math.max(.4,1-lift*.25);b.scale.set(s,s,1);b.material.opacity=s})}
const _ug4=updateGame;updateGame=function(dt,now){_ug4(dt,now);updateBlobs()};

/* ---------- 11. PICKED HERO ON THE 3D STREET: 8-direction camera-facing sprite from the hero's own art (+ Canva stride frames when present) ---------- */
const HS={idx:0,mesh:null,tex:{},t:0,FLIP:1};
function heroSpriteSet(i){HS.idx=i;if(HS.mesh){S.remove(HS.mesh);HS.mesh=null}if(!i)return;const id=String(i).padStart(2,"0"),k=["front","fq","side","bq","back"],src={front:`img/hero${id}_fq.webp`,fq:`img/hero${id}_fq.webp`,side:`img/hero${id}_side.webp`,bq:`img/hero${id}_bq.webp`,back:`img/hero${id}_back.webp`};
  const man=window.HERO_SPRITES&&window.HERO_SPRITES[id];if(man)Object.assign(src,man);HS.tex={};HS.asp={};
  for(const key in src){const t=TL.load(src[key],tx=>{HS.asp[key]=tx.image.width/tx.image.height});t.colorSpace=T.SRGBColorSpace;HS.tex[key]=t}
  const geo=new T.PlaneGeometry(1,1);geo.translate(0,.5,0);HS.mat=new T.MeshStandardMaterial({map:HS.tex.fq,alphaTest:.45,side:T.DoubleSide,roughness:.85});HS.mesh=new T.Mesh(geo,HS.mat);HS.mesh.castShadow=true;S.add(HS.mesh)}
function updateHeroSprite(dt,now){if(!HS.mesh||!ACT.hero)return;const H=ACT.hero,g=H.g;const fp=camDist<1.3;g.visible=false;HS.mesh.visible=!fp;if(fp)return;
  const moving=(H.blend||0)>.2;HS.t+=moving?dt:0;const ca=Math.atan2(cam.position.x-g.position.x,cam.position.z-g.position.z),rel=wrapA(ca-H.yaw),k=Math.min(4,Math.round(Math.abs(rel)/(Math.PI/4)));
  const walkHz=K.shift?7:4.6,f=Math.floor(HS.t*walkHz);let key,mir=false,tx=HS.tex;
  if(!moving)key=[tx.front_idle?"front_idle":"fq",tx.front_idle?"front_idle":"fq",tx.side_idle?"side_idle":"side",tx.back_idle?"back_idle":"bq",tx.back_idle?"back_idle":"back"][k];
  else if(k===0){if(tx.front_w1)key=f%2?"front_w2":"front_w1";else{key="fq"}}
  else if(k===4){key="back";mir=f%2===1}
  else if(k===2){key=(f%2&&tx.side_idle)?"side_idle":"side"}
  else key=["","fq","","bq"][k];
  const t2=tx[key]||tx.fq;if(HS.mat.map!==t2){HS.mat.map=t2;HS.mat.needsUpdate=true}
  const h=2.0,asp=HS.asp[key]||HS.asp.fq||.55,flip=((k>0&&k<4&&rel<0)?-1:1)*HS.FLIP*(mir?-1:1),ph=HS.t*walkHz*Math.PI,bob=moving?Math.abs(Math.sin(ph))*.07:Math.sin(now/650)*.012;
  HS.mesh.scale.set(h*asp*flip*(moving?1:1+bob*.15),h*(1+(moving?0:bob*.6)),1);HS.mesh.position.set(g.position.x,g.position.y+(moving?bob:0),g.position.z);HS.mesh.rotation.set(0,ca,moving?Math.sin(ph)*.025:0)}
addEventListener("message",e=>{const d=e.data;if(d&&(d.lv3d==="hero"||(d.lv3d==="name"&&d.hero!==undefined))&&(d.hero|0)!==HS.idx)heroSpriteSet(d.hero|0)});
const _ug5=updateGame;updateGame=function(dt,now){_ug5(dt,now);updateHeroSprite(dt,now);if(HS.mesh&&BLOBS.hero)BLOBS.hero.visible=HS.mesh.visible};
Object.assign(window,{heroSpriteSet,HS});
