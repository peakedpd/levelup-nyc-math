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
const W2={};window.W2=W2;
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
/* ---------- CANVA ROOM ART: a 16:9 Canva Dream Lab wall panel per room, the same way the arcade uses its Prize Corner art ---------- */
function artWall(g,name,x,y,z,w,ry){const t=TL.load("tex/room_"+name+".webp");t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;const h=w*9/16;
  const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,toneMapped:false}));m.position.set(x,Math.max(y,h/2+.02),z);m.rotation.y=ry;g.add(m);return m}
/* ---------- OPENABLES: things students can open (lockers, trophy case, desk drawer, gym chest); some locked, a few hide XP ---------- */
const OPEN=[],FRUIT=[];const FOUND=new Set(JSON.parse(localStorage.getItem("lu3d_found")||"[]"));
function regOpen(o){o.cur=0;o.isOpen=false;o.shake=0;OPEN.push(o);
  if(o.xp&&!FOUND.has(o.id)){const orb=new T.Mesh(new T.SphereGeometry(.13,20,16),M(0x7cf7ff,{emissive:0x2bd9ff,emissiveIntensity:2}));orb.position.copy(o.orbAt);o.parent.add(orb);o.orb=orb}return o}
/* ---------- 1a. LOBBY ---------- */
{const cz=480,w=18,d=16,h=5.6;const g=shell("lobby",cz,w,d,h,{wall:0xf1e2c2,floorMap:checkerTex("#e9e2d0","#2b3d8f",8),doors:[{wall:"front",at:0,w:2.6},{wall:"back",at:0,w:2.6}]});
  sign(g,"WELCOME TO LEVEL UP ACADEMY",0,4.4,-d/2+.22,10,1.1);
  box(g,5,1.1,1.2,M(0x7a4a2a),-4.5,.55,-1);box(g,5.2,.08,1.4,M(0xd8a86a),-4.5,1.14,-1,0);sign(g,"OFFICE",-4.5,.7,-.38,1.6,.45,"#24407a","#fff");
  box(g,.5,.35,.4,M(0x222222),-5.5,1.35,-1.1,0);box(g,.45,.3,.02,M(0x88ccff,{emissive:0x3388ff,emissiveIntensity:.8}),-5.5,1.5,-.88,0);
  box(g,4,2.4,.8,M(0x5a3a22),5.5,1.2,-d/2+.6);const glass=new T.Mesh(new T.BoxGeometry(3.7,1.9,.05),new T.MeshStandardMaterial({color:0xbfe6ff,transparent:true,opacity:.25,roughness:.05}));glass.position.set(5.5,1.35,-d/2+1.02);g.add(glass);{const pv=new T.Group();pv.position.set(5.5-1.85,0,-d/2+1.02);g.add(pv);g.remove(glass);glass.position.set(1.85,1.35,0);pv.add(glass);regOpen({id:"trophy",name:"trophy case",parent:g,pv,axis:"y",openTo:-1.5,ux:5.5,uz:cz-d/2+2,locked:false})}
  const gold=M(0xffc83d,{metalness:.9,roughness:.25,emissive:0x553300,emissiveIntensity:.3});
  for(let i=0;i<4;i++){const cup=new T.Group();const b=new T.Mesh(new T.CylinderGeometry(.18,.08,.3,16),gold);b.position.y=.35;const s=new T.Mesh(new T.CylinderGeometry(.03,.03,.2,8),gold);s.position.y=.12;cup.add(b,s,new T.Mesh(new T.BoxGeometry(.2,.06,.2),gold));cup.position.set(4.2+i*.85,.95+(i%2)*.7,-d/2+.65);g.add(cup)}
  [-6,6].forEach(x=>{box(g,2.6,.12,.7,M(0xc8915a),x,.5,4.5);box(g,.12,.5,.6,M(0x444444),x-1.1,.25,4.5);box(g,.12,.5,.6,M(0x444444),x+1.1,.25,4.5)});
  [[-8,-7],[8,6.8],[-8,6.8]].forEach(([x,z])=>{box(g,.8,.7,.8,M(0xb85c38),x,.35,z);const l=new T.Mesh(new T.SphereGeometry(.6,12,10),M(0x3f8f3a));l.position.set(x,1.2,z);g.add(l)});
  const crest=new T.Mesh(new T.CircleGeometry(1.1,40),new T.MeshStandardMaterial({map:canvasTex(256,256,c=>{c.fillStyle="#24407a";c.beginPath();c.arc(128,128,124,0,7);c.fill();c.fillStyle="#ffd23f";c.textAlign="center";c.font="900 92px Trebuchet MS";c.fillText("LU",128,140);c.font="800 24px Trebuchet MS";c.fillText("× ÷ ACADEMY",128,190)})}));crest.position.set(-4.5,3.3,-d/2+.22);g.add(crest);
  doorFrame(g,0,-d/2+.25,0,"HALLWAY · CLASSROOM ↑");artWall(g,"lobby",-w/2+.23,2.8,0,9.9,Math.PI/2);
  Object.assign(ROOMS.lobby,{spawns:{front:{x:0,z:cz+d/2-2.6,yaw:Math.PI},back:{x:0,z:cz-d/2+2.2,yaw:0}},exits:[{x:0,z:cz+d/2-.9,to:"street",label:"Press E to go back outside"},{x:0,z:cz-d/2+.9,to:"hallway",spawn:"front",label:"Press E — walk down the hallway"}]});solidsOf(g)}
/* ---------- 1b. HALLWAY ---------- */
{const cz=530,w=9,d=30,h=4.6;const g=shell("hallway",cz,w,d,h,{wall:0xe8eef6,floorMap:checkerTex("#d6d0c0","#c8c0ae",10),doors:[{wall:"front",at:0,w:2.6},{wall:"back",at:0,w:2.6},{wall:"left",at:-4,w:2.6},{wall:"right",at:10,w:2.6},{wall:"right",at:-12,w:2.6}],lightI:55});
  const lockM=[0x2a6bd8,0xe23b3b,0x2a9d8f,0xffb52e].map(c=>M(c,{metalness:.3,roughness:.5}));
  for(let i=0;i<22;i++){const z=-d/2+2+i*1.2;[-1,1].forEach(sd=>{if(sd<0&&Math.abs(z+4)<1.9)return;if(sd>0&&(Math.abs(z-10)<1.9||Math.abs(z+12)<1.9))return;const x=sd*(w/2-.45),mat=lockM[(i+(sd>0?1:0))%4];box(g,.5,2.1,1.1,mat,x,1.05,z);const xf=x-sd*.25;
    const ins=new T.Mesh(new T.PlaneGeometry(1,1.95),M(0x22252e));ins.position.set(xf-sd*.006,1.05,z);ins.rotation.y=-sd*Math.PI/2;g.add(ins);
    const pv=new T.Group();pv.position.set(xf-sd*.03,0,z+.53);g.add(pv);box(pv,.04,2.02,1.05,mat,0,1.05,-.525,0);
    for(let k=0;k<3;k++)box(pv,.02,.04,.6,M(0x111111),-sd*.025,1.75-k*.08,-.525,0);box(pv,.03,.18,.06,M(0xcccccc,{metalness:.8}),-sd*.03,1.05,-.95,0);
    const id="lk"+(sd>0?"R":"L")+i,locked=(i*7+(sd>0?2:0))%3===0,xp=id==="lkR3"||id==="lkL16";
    if(locked)box(pv,.05,.16,.14,M(0xffc83d,{metalness:.9,roughness:.25}),-sd*.05,1.25,-.95,0);
    regOpen({id,name:"locker",parent:g,pv,axis:"y",openTo:sd*1.65,ux:xf-sd*.75,uz:cz+z,locked,xp:xp?25:0,orbAt:new T.Vector3(x-sd*.05,1.3,z)})})}
  sign(g,"MS. OKAFOR · ROOM 4B",-w/2+.25,3.6,-4,3,.6,"#24407a","#fff",Math.PI/2);doorFrame(g,-w/2+.25,-4,Math.PI/2,null,0x2a9d8f);
  sign(g,"GYM 🏀",w/2-.25,3.6,10,2.4,.6,"#c8102e","#fff",-Math.PI/2);doorFrame(g,w/2-.25,10,-Math.PI/2,null,0xc8102e);
  sign(g,"CAFETERIA 🍎",w/2-.25,3.6,-12,2.8,.6,"#2a9d8f","#fff",-Math.PI/2);doorFrame(g,w/2-.25,-12,-Math.PI/2,null,0x2a9d8f);
  artWall(g,"hallway",0,2.3,-d/2+.23,w-.5,0);
  [[w/2-.24,4,-Math.PI/2,"MATH STARS ⭐"],[w/2-.24,-9,-Math.PI/2,"4 × 6 = 24"],[-w/2+.24,8,Math.PI/2,"ARRAYS ROCK"]].forEach(([x,z,r,t])=>sign(g,t,x,2.8,z,2.6,1,"#c89b5a","#14123a",r));
  Object.assign(ROOMS.hallway,{spawns:{front:{x:0,z:cz+d/2-2.4,yaw:Math.PI},classDoor:{x:-w/2+1.7,z:cz-4,yaw:Math.PI/2},roof:{x:0,z:cz-d/2+2.2,yaw:0},gymDoor:{x:w/2-1.7,z:cz+10,yaw:-Math.PI/2},cafeDoor:{x:w/2-1.7,z:cz-12,yaw:-Math.PI/2}},
    exits:[{x:0,z:cz+d/2-.9,to:"lobby",spawn:"back",label:"Press E — back to the lobby"},{x:-w/2+.9,z:cz-4,to:"school",spawn:"door",label:"Press E — go into Ms. Okafor's classroom"},{x:0,z:cz-d/2+.9,to:"rooftop",spawn:"stairs",label:"Press E — climb the stairs to the rooftop garden"},{x:w/2-.9,z:cz+10,to:"gym",spawn:"door",label:"Press E — go into the GYM 🏀"},{x:w/2-.9,z:cz-12,to:"cafeteria",spawn:"door",label:"Press E — go into the CAFETERIA 🍎"}]});solidsOf(g)}
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
/* ---------- 1d. GYM (off the hallway, right wall) ---------- */
{const cz=660,w=22,d=20,h=7;const court=canvasTex(1024,1024,(c,W,H)=>{c.fillStyle="#d9a066";c.fillRect(0,0,W,H);for(let i=0;i<40;i++){c.fillStyle=i%2?"#d29a5f":"#dca76e";c.fillRect(i*W/40,0,W/40,H)}c.strokeStyle="#fff";c.lineWidth=10;c.strokeRect(40,40,W-80,H-80);c.beginPath();c.moveTo(40,H/2);c.lineTo(W-40,H/2);c.stroke();c.beginPath();c.arc(W/2,H/2,120,0,7);c.stroke();c.strokeStyle="#c8102e";c.beginPath();c.arc(W/2,40,230,0,Math.PI);c.stroke()});
  const g=shell("gym",cz,w,d,h,{wall:0xf2e6cf,floor:0xd9a066,doors:[{wall:"front",at:0,w:2.6}],lightI:80});
  {const fl=new T.Mesh(new T.PlaneGeometry(w-.5,d-.5),new T.MeshStandardMaterial({map:court,roughness:.45}));fl.rotation.x=-Math.PI/2;fl.position.y=.01;fl.receiveShadow=true;g.add(fl)}
  artWall(g,"gym",0,3.5,-d/2+.23,w-1,0);
  for(let i=0;i<3;i++)box(g,1.2,.5+i*.5,12,M([0x24407a,0x2a6bd8,0x3d7be0][i]),-w/2+.8+i*1.2,(.5+i*.5)/2,1);  // bleachers
  const ball=M(0xe8742c,{roughness:.6});[[3,4],[5,2.5],[-2,5.5],[6.5,5]].forEach(([x,z])=>{const b=new T.Mesh(new T.SphereGeometry(.24,20,16),ball);b.position.set(x,.24,z);b.castShadow=true;g.add(b)});
  {box(g,2.2,.8,1,M(0x7a4a2a),8.5,.4,-6);const pv=new T.Group();pv.position.set(8.5,.8,-6.5);g.add(pv);box(pv,2.26,.1,1.06,M(0x8a5a32),0,.05,.5,0);sign(g,"GYM GEAR",8.5,.5,-5.48,1.4,.3,"#c8102e","#fff");
   regOpen({id:"gymchest",name:"gym equipment chest",parent:g,pv,axis:"x",openTo:-1.9,ux:8.5,uz:cz-4.9,locked:false,xp:25,orbAt:new T.Vector3(8.5,.75,-6)})}
  doorFrame(g,0,d/2-.25,Math.PI,"HALLWAY",0xc8102e);
  Object.assign(ROOMS.gym,{spawns:{door:{x:0,z:cz+d/2-2.4,yaw:Math.PI}},exits:[{x:0,z:cz+d/2-.9,to:"hallway",spawn:"gymDoor",label:"Press E — back to the hallway"}],exit:{x:0,z:cz+d/2-.9}});
  ROOMS.gym.ST.push({x:5,z:cz-2,label:"play Gym Math with Theo (counting balls & teams)",id:"gym"});solidsOf(g)}
/* ---------- 1e. CAFETERIA ---------- */
{const cz=720,w=22,d=20,h=5.6;const g=shell("cafeteria",cz,w,d,h,{wall:0xfff1d6,floorMap:checkerTex("#f4efe3","#e3d6bf",10),doors:[{wall:"front",at:0,w:2.6}],lightI:60});
  artWall(g,"cafeteria",0,3,-d/2+.23,w-2.2,0);
  const top=M(0x3d7be0),bench=M(0xffb52e),leg=M(0x555555),tray=M(0xff6b8a);
  for(let r=0;r<2;r++)for(let c=0;c<3;c++){const x=-6+c*6,z=-1.5+r*5;box(g,4,.1,1.2,top,x,.78,z);box(g,.15,.74,.9,leg,x-1.6,.37,z);box(g,.15,.74,.9,leg,x+1.6,.37,z);[-1,1].forEach(sd=>box(g,4,.08,.4,bench,x,.45,z+sd*.95));
    for(let k=0;k<3;k++){box(g,.45,.03,.32,tray,x-1.2+k*1.2,.85,z,0);const ap=new T.Mesh(new T.SphereGeometry(.07,10,8),M([0xd92b2b,0x6dff6b,0xffd23f][(r+c+k)%3]));ap.position.set(x-1.2+k*1.2,.93,z);g.add(ap);FRUIT.push({m:ap,g,cz,home:ap.position.clone(),at:ap.position.clone(),state:"tray",pen:false})}}
  doorFrame(g,0,d/2-.25,Math.PI,"HALLWAY",0x2a9d8f);
  Object.assign(ROOMS.cafeteria,{spawns:{door:{x:0,z:cz+d/2-2.4,yaw:Math.PI}},exits:[{x:0,z:cz+d/2-.9,to:"hallway",spawn:"cafeDoor",label:"Press E — back to the hallway"}],exit:{x:0,z:cz+d/2-.9}});
  ROOMS.cafeteria.ST.push({x:0,z:cz-6,label:"play Lunch Line Math with Theo (trays, apples & snacks)",id:"cafe"});solidsOf(g)}
/* ---------- Canva art panels on the original rooms (classroom, clothing store, Theo's apartment) ---------- */
artWall(ROOMS.school.g,"classroom",0,2.8,-RD/2+.42,9.9,0);
{const g=ROOMS.school.g,pv=new T.Group();pv.position.set(0,0,0);g.add(pv);box(pv,1.4,.28,.9,M(0x8a5a32),0,.72,-4.95,0);box(pv,.4,.06,.04,M(0xcccccc,{metalness:.8}),0,.72,-4.48,0);
  for(let k=0;k<3;k++){const pc=new T.Mesh(new T.CylinderGeometry(.02,.02,.32,8),M([0xffc81e,0x3d7be0,0xe23b3b][k]));pc.rotation.z=Math.PI/2;pc.position.set(-.3+k*.3,.88,-4.95);pv.add(pc)}
  regOpen({id:"desk",name:"Ms. Okafor's desk drawer",parent:g,pv,axis:"slide",openTo:.7,ux:0,uz:ROOMS.school.cz-3.8,locked:false})}
artWall(ROOMS.clothing.g,"clothing",0,2.8,-RD/2+.27,9.9,0);
artWall(ROOMS.apartment.g,"apartment",0,2.8,-RD/2+.27,9.9,0);
ROOMS.school.spawns={door:{x:ROOMS.school.cx,z:ROOMS.school.cz+RD/2-2.6,yaw:Math.PI}};
ROOMS.school.exits=[{x:ROOMS.school.exit.x,z:ROOMS.school.exit.z,to:"hallway",spawn:"classDoor",label:"Press E — back to the hallway"}];
["arcade","clothing","apartment"].forEach(k=>{const R=ROOMS[k];if(R)R.exits=[{x:R.exit.x,z:R.exit.z,to:"street",label:"Press E — EXIT to the street"}]});

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
/* ---------- 2. ARCADE WORKER + PRIZE CORNER ---------- */
/* Worker used to share the solid counter box (WK at x=-6.2 inside a 1.3-wide desk at x=-6.5),
   so his legs were buried and a sneaker poked out in front. He now stands on the floor in the
   aisle behind an open-legged counter; shelves are real 3D, not a flat photo. Worker is arcade-only. */
const AR=ROOMS.arcade,WK={x:AR.cx-7.55,z:AR.cz+5.15};
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
/* ---------- interactions: room exits, Prize Corner, Mr. Sal's counter, Ticket Blaster, talk ---------- */
const _interactions=interactions;interactions=function(){if(W2.blaster||W2.ui||W2.hand)return [];let L=_interactions();if(QG)return L;
  if(AREA!=="street"){const R0=ROOMS[AREA];L=L.filter(d=>d.type!=="exit");if(R0.exits)L=R0.exits.map(e=>({type:"exit2",x:e.x,z:e.z,r:1.9,label:e.label,to:e.to,spawn:e.spawn})).concat(L)}
  if(AREA==="arcade"){L=L.filter(d=>d.type!=="game");L.push({type:"blaster",x:AR.cx+3.9,z:AR.cz+5.25,r:1.9,label:"Press E to play 🎟️ TICKET BLASTER!"});L=L.map(d=>d.type==="station"&&d.id==="arcade"?Object.assign({},d,{type:"counter",x:AR.cx-6.15,z:AR.cz+5.15,r:2.2,label:"Press E — trade tickets at the Prize Corner ("+TIX.n+" 🎟️)"}):d)}
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
  else{const b=k===1?"fq_b":"bq_b";key=(f%2&&tx[b])?b:["","fq","","bq"][k]}
  if(!moving&&k<=1&&tx.blink){HS.bl=(HS.bl||0)-dt;if(HS.bl<-.14)HS.bl=2.4+Math.random()*2.6;if(HS.bl<0)key="blink"}
  const t2=tx[key]||tx.fq;if(HS.mat.map!==t2){HS.mat.map=t2;HS.mat.needsUpdate=true}
  const h=2.0,asp=HS.asp[key]||HS.asp.fq||.55,flip=((k>0&&k<4&&rel<0)?-1:1)*HS.FLIP*(mir?-1:1),ph=HS.t*walkHz*Math.PI,bob=moving?Math.abs(Math.sin(ph))*.07:Math.sin(now/650)*.012;
  HS.mesh.scale.set(h*asp*flip*(moving?1:1+bob*.15),h*(1+(moving?0:bob*.6)),1);HS.mesh.position.set(g.position.x,g.position.y+(moving?bob:0),g.position.z);HS.mesh.rotation.set(0,ca,moving?Math.sin(ph)*.025:0)}
addEventListener("message",e=>{const d=e.data;if(d&&(d.lv3d==="hero"||(d.lv3d==="name"&&d.hero!==undefined))&&(d.hero|0)!==HS.idx)heroSpriteSet(d.hero|0)});
const _ug5=updateGame;updateGame=function(dt,now){_ug5(dt,now);updateHeroSprite(dt,now);if(HS.mesh&&BLOBS.hero)BLOBS.hero.visible=HS.mesh.visible};
Object.assign(window,{heroSpriteSet,HS});

/* =====================================================================
   8. Brock the Block in the 3D street — the Weakness Challenge boss stands at the NYC spot
      of the student's current challenge (Fruit Stand, Pizza Shop, …). Camera-facing billboard
      (Canva art: crossed arms far away, taunting up close, friendly once beaten). Walking up to
      him starts the challenge in the game (parent page); once beaten he steps aside, friendly.
   ===================================================================== */
const BRK={on:false,info:null,tex:{},asp:{cross:.38,taunt:.387,hit:.53,friend:.415},x:0,z:0,auto:0,armed:true,prop:null,spot:null};
const BRK_X={placevalue:-40,groups:-30,rounding:-20,addsub:0,mult:10,divide:20,factors:30,multistep:40,fractions:50},BRK_Z=-5.6;
const BRK_PROP={placevalue:["🏪 Bodega Corner",0x2e7d32],groups:["🍎 Fruit Stand",0xc62828],rounding:["🚇 Subway Stairs",0x1565c0],addsub:["🌭 Hot-Dog Cart",0xf9a825],mult:["🏀 Basketball Court",0xef6c00],
  divide:["🍕 Pizza Shop",0xd84315],factors:["🚲 Bike Rack",0x546e7a],multistep:["🚌 Bus Stop",0x1e88e5],fractions:["🥨 Pretzel Stand",0x8d6e63]};
["cross","taunt","hit","friend"].forEach(k=>{const x=TL.load("tex/brock_"+k+".webp",t=>{if(t.image&&t.image.height)BRK.asp[k]=t.image.width/t.image.height});x.colorSpace=T.SRGBColorSpace;BRK.tex[k]=x});
{const geo=new T.PlaneGeometry(1,1);geo.translate(0,.5,0);BRK.mat=new T.MeshStandardMaterial({map:BRK.tex.cross,alphaTest:.5,side:T.DoubleSide,roughness:.9});BRK.mesh=new T.Mesh(geo,BRK.mat);BRK.mesh.castShadow=true;BRK.mesh.visible=false;S.add(BRK.mesh);
 BRK.shadow=new T.Mesh(new T.CircleGeometry(.36,24),new T.MeshBasicMaterial({color:0,transparent:true,opacity:.28}));BRK.shadow.rotation.x=-Math.PI/2;BRK.shadow.visible=false;S.add(BRK.shadow)}
function brockProp(sk){if(BRK.prop){S.remove(BRK.prop);BRK.prop=null}const pr=BRK_PROP[sk];if(!pr)return;const g=new T.Group(),x=BRK_X[sk]-1.4,z=BRK_Z-1.3;
  box(g,1.9,.95,.85,M(0x6d4c41),0,.6,0,0);box(g,2.2,.08,1.15,M(pr[1]),0,1.95,.1,0);[-1,1].forEach(s=>box(g,.07,1.4,.07,M(0x333333),s*.98,1.25,.45,0));
  const lb=labelSprite(pr[0],1.9);lb.position.set(0,1.45,.5);g.add(lb);g.position.set(x,.12,z);S.add(g);BRK.prop=g;BRK.spot=sk}
function brockSet(d){BRK.info=d;BRK.on=!!(d&&d.on&&BRK_X[d.sk]!==undefined);if(!BRK.on){BRK.mesh.visible=BRK.shadow.visible=false;if(BRK.prop)BRK.prop.visible=false;return}
  if(BRK.spot!==d.sk)brockProp(d.sk);BRK.prop.visible=true;BRK.x=BRK_X[d.sk]+(d.done?1.7:0);BRK.z=BRK_Z+(d.done?-.7:0);if(!d.done)BRK.armed=true}
addEventListener("message",e=>{const d=e.data;if(d&&d.lv3d==="brock")brockSet(d)});
function brockGo(){for(const k in K)K[k]=false;try{JOY.x=JOY.z=0}catch(_){}BRK.armed=false;BRK.auto=0;try{parent.postMessage({lv3d:"brock_go",sk:BRK.info&&BRK.info.sk},"*")}catch(_){}}
function brockBusy(){return !!(QG||W2.blaster||W2.ui||W2.hand||W2.boss||W2.teach)}
const _int8=interactions;interactions=function(){const base=_int8();if(!BRK.on||AREA!=="street"||brockBusy())return base;const d=Math.hypot(P.x-BRK.x,P.z-BRK.z);if(d>2.4)return base;
  return [{type:"brock",x:BRK.x,z:BRK.z,r:2.4,label:BRK.info.done?"Press E — Brock (now your friend) has a bonus round!":"Press E — take on "+BRK.info.title+"!"}].concat(base)};
const _td8=tryDoor;tryDoor=function(){if(nearDoor&&nearDoor.type==="brock")return brockGo();return _td8()};
function updateBrock(dt,now){const vis=BRK.on&&AREA==="street";BRK.mesh.visible=BRK.shadow.visible=vis;if(BRK.prop)BRK.prop.visible=vis;if(!vis)return;
  const d=Math.hypot(P.x-BRK.x,P.z-BRK.z),done=BRK.info.done;const key=done?"friend":d<7?"taunt":"cross";if(BRK.mat.map!==BRK.tex[key]){BRK.mat.map=BRK.tex[key];BRK.mat.needsUpdate=true}
  const h=1.9,bob=Math.sin(now/520)*.012;BRK.mesh.scale.set(h*BRK.asp[key],h*(1+bob),1);BRK.mesh.position.set(BRK.x,.12,BRK.z);BRK.shadow.position.set(BRK.x,.13,BRK.z);
  BRK.mesh.rotation.y=Math.atan2(cam.position.x-BRK.x,cam.position.z-BRK.z);
  if(d<7&&!brockBusy())say(done?"Brock":BRK.info.title,BRK.info.say||"",BRK.x,2.35,BRK.z);
  if(d>4)BRK.armed=!done;
  if(!done&&BRK.armed&&d<1.9&&!brockBusy()){if(!BRK.auto)BRK.auto=now;else if(now-BRK.auto>700)brockGo()}else BRK.auto=0}
const _ug8=updateGame;updateGame=function(dt,now){_ug8(dt,now);try{updateBrock(dt,now)}catch(e){}};
Object.assign(window,{BRK,brockSet,BRK_X});
try{parent.postMessage({lv3d:"brockreq"},"*")}catch(_){}

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

/* =====================================================================
   12. REAL-LIFE GAMES: every skill becomes things a kid can see in the street (bags of pretzels,
       stockroom crates, cash stacks, a subway line, theater seats, pizzas…). The plan comes from
       learn_scenes.js (built from the item's own numbers, checked by tools/verify_scenes.js);
       this part only draws it and runs it through the same pads, card, win dance and orb as missions.
   ===================================================================== */
const SGM={},sgM=(c,e)=>SGM[c+"_"+(e||0)]||(SGM[c+"_"+(e||0)]=new T.MeshStandardMaterial({color:c,emissive:e||0,emissiveIntensity:e?.7:0,roughness:.55})),SGT={};
function sgFace(txt,bg,fg){const k=txt+"|"+bg;if(!SGT[k])SGT[k]=new T.MeshStandardMaterial({map:numTex(txt,bg,fg||"#14123a"),roughness:.6});return SGT[k]}
function sgLabel(txt,w){const c=document.createElement("canvas");c.width=512;c.height=128;const g=c.getContext("2d");let fs=54;g.font=`800 ${fs}px Trebuchet MS,sans-serif`;while(fs>22&&g.measureText(txt).width>470){fs-=2;g.font=`800 ${fs}px Trebuchet MS,sans-serif`}
  g.fillStyle="rgba(20,18,58,.85)";g.beginPath();g.roundRect(4,4,504,120,40);g.fill();g.fillStyle="#fff";g.textAlign="center";g.textBaseline="middle";g.fillText(txt,256,68);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(w,w/4,1);s.renderOrder=5;return s}
function sgBox(w,h,d,mat){return new T.Mesh(new T.BoxGeometry(w,h,d),mat)}
function sgCrate(s,txt,bg){const side=sgM(0xb98a4e),top=sgFace(txt,bg||"#f3d9a4");return new T.Mesh(new T.BoxGeometry(s,s*.8,s),[side,side,top,side,side,side])}
/* one base-ten piece for place p (0 ones … 5 hundred thousands), in stockroom or cash style */
const SG_PV=["1","10","100","1,000","10,000","100,000"];
function sgPiece(p,unit,hi){const e=hi?0x664400:0;
  if(unit==="cash"){if(p===0){const m=new T.Mesh(new T.CylinderGeometry(.05,.05,.02,18),sgM(0xffc83d,e));m.userData.h=.02;return m}
    if(p<=2){const m=new T.Mesh(new T.BoxGeometry(.2,.022,.1),[sgM(0x3f8f4f,e),sgM(0x3f8f4f,e),sgFace("$"+SG_PV[p],p===1?"#bfe8b0":"#9fd88f"),sgM(0x3f8f4f,e),sgM(0x3f8f4f,e),sgM(0x3f8f4f,e)]);m.userData.h=.022;return m}
    const s=[0,0,0,.2,.24,.28][p],m=sgCrate(s,"$"+SG_PV[p],hi?"#ffe066":"#d8f0c8");m.userData.h=s*.8;return m}
  if(p===0){const m=sgBox(.07,.07,.07,sgM(0xff9f1c,e));m.userData.h=.07;return m}
  if(p===1){const m=sgBox(.07,.07,.5,sgM(0x2bb3ff,e));m.userData.h=.07;return m}
  if(p===2){const m=sgBox(.5,.05,.5,sgM(0x8a5cff,e));m.userData.h=.05;return m}
  const s=[0,0,0,.24,.28,.32][p],m=sgCrate(s,SG_PV[p],hi?"#ffe066":"#f3d9a4");m.userData.h=s*.8;return m}
/* builders: each returns {w, d, pieces:[{m,x,y,z,lab}]} in local units (x right, z away from the player) */
const SGB={
 pile(b){const o=OBJ[b.kind]||OBJ.marbles,n=b.count,cols=Math.max(1,Math.ceil(Math.sqrt(n*1.6))),sp=.2,out=[];
  for(let i=0;i<n;i++)out.push({m:o.make(i),x:(i%cols)*sp+sp/2,y:o.h,z:Math.floor(i/cols)*sp+sp/2});return{w:cols*sp,d:Math.ceil(n/cols)*sp,pieces:out,tag:b.tag}},
 bags(b){const o=OBJ[b.kind]||OBJ.marbles,out=[],sp=.56;for(let k=0;k<b.n;k++){const cx=k*sp+sp/2,bag=new T.Mesh(new T.CylinderGeometry(.25,.21,.2,18,1,true),new T.MeshStandardMaterial({color:0xc89b5a,side:T.DoubleSide}));out.push({m:bag,x:cx,y:.1,z:.3});
   if(b.asBlocks){const d=SCENE.digits(b.each);for(let t=0;t<(d[1]||0);t++){const r=sgBox(.03,.03,.3,sgM(0x2bb3ff));out.push({m:r,x:cx-.15+t*.035,y:.05,z:.3})}for(let u=0;u<d[0];u++){const c=sgBox(.035,.035,.035,sgM(0xff9f1c));out.push({m:c,x:cx+.08+(u%3)*.045,y:.05,z:.22+Math.floor(u/3)*.045})}if(k===0)out.push({lab:String(b.each),x:cx,y:.55,z:.3,w:.7})}
   else{const c=b.each>9?4:3;for(let i=0;i<b.each;i++)out.push({m:o.make(i),x:cx+((i%c)-(c-1)/2)*.1,y:o.h+.01,z:.3+(Math.floor(i/c)-1)*.1})}}
  return{w:b.n*sp,d:.6,pieces:out,tag:b.label}},
 blocks(b){const out=[];let x=0;const top=b.d.length-1;
  for(let p=top;p>=0;p--){const c=b.d[p],hi=b.hi===p;let w;
   if(p<=2){w=p===2&&b.unit!=="cash"?.55:p===1&&b.unit!=="cash"?.12:b.unit==="cash"?.24:.12;
    for(let i=0;i<c;i++){const m=sgPiece(p,b.unit,hi),h=m.userData.h;out.push({m,x:x+w/2,y:h/2+i*(h+.012),z:.3})}}
   else{const s=[0,0,0,.24,.28,.32][p];w=s*3+.04;for(let i=0;i<c;i++){const m=sgPiece(p,b.unit,hi);out.push({m,x:x+s/2+(i%3)*(s+.02),y:m.userData.h/2,z:.1+Math.floor(i/3)*(s+.02)})}}
   out.push({lab:b.unit==="cash"?"$"+SG_PV[p]:SG_PV[p]+"s",x:x+w/2,y:.02,z:-.12,w:.62,small:1});
   if(hi)out.push({m:new T.Mesh(new T.RingGeometry(.16,.24,28),new T.MeshBasicMaterial({color:0xffd23f,side:T.DoubleSide})),x:x+w/2,y:.01,z:.3,flat:1,ring:1});
   x+=w+.1}
  return{w:x,d:1,pieces:out,tag:b.tag}},
 bins(b){const out=[],sp=.46;for(let k=0;k<b.n;k++){const m=new T.Mesh(new T.CylinderGeometry(.2,.17,.2,4,1,true),new T.MeshStandardMaterial({color:[0x2bd9ff,0xff3bd4,0x6dff6b,0xffd23f][k%4],side:T.DoubleSide,roughness:.5}));m.rotation.y=Math.PI/4;out.push({m,x:k*sp+sp/2,y:.1,z:.3})}return{w:b.n*sp,d:.5,pieces:out,tag:b.label}},
 tray(b){return{w:.5,d:.4,pieces:[{m:sgBox(.42,.03,.32,sgM(0xc0c6cc)),x:.25,y:.015,z:.3}],tag:b.label}},
 kids(b){const out=[],cols=Math.max(1,Math.ceil(Math.sqrt(b.n*1.4))),sp=.15;for(let i=0;i<b.n;i++){const m=new T.Mesh(new T.CapsuleGeometry(.035,.08,4,8),sgM([0xff6b3b,0x2bd9ff,0x6dff6b,0xff3bd4,0xffd23f][i%5]));out.push({m,x:(i%cols)*sp+sp/2,y:.075,z:Math.floor(i/cols)*sp+sp/2})}return{w:cols*sp,d:Math.ceil(b.n/cols)*sp,pieces:out,tag:b.tag}},
 van(b){const out=[{m:sgBox(.9,.32,.42,sgM(0xffffff)),x:.45,y:.2,z:.3},{m:sgBox(.6,.14,.43,sgM(0x223344)),x:.4,y:.3,z:.3}];[.18,.72].forEach(x=>out.push({m:new T.Mesh(new T.CylinderGeometry(.07,.07,.44,14),sgM(0x1a1a1a)),x,y:.07,z:.3,rx:1}));
  for(let i=0;i<b.seats;i++)out.push({m:sgBox(.05,.04,.05,sgM(0x2bd9ff)),x:.15+(i%10)*.07,y:.4,z:.2+Math.floor(i/10)*.08});return{w:.9,d:.5,pieces:out,tag:b.label}},
 seats(b){const sp=Math.min(.14,2.6/b.cols),out=[];for(let r=0;r<b.rows;r++)for(let c=0;c<b.cols;c++){const i=r*b.cols+c,m=sgBox(sp*.7,sp*.7,sp*.7,sgM(i<b.taken?0xe23b3b:0x3d7be0));out.push({m,x:c*sp+sp/2,y:sp*.35,z:r*sp+sp/2})}return{w:b.cols*sp,d:b.rows*sp,pieces:out,tag:b.rows+" rows of "+b.cols+" seats"}},
 area(b){const X=b.xs.reduce((s,v)=>s+v,0),Y=b.ys.reduce((s,v)=>s+v,0),ws=b.xs.map(v=>.4+1.8*v/X),ds=b.ys.map(v=>.3+1.0*v/Y),out=[];let x=0;
  b.xs.forEach((xv,i)=>{let z=0;b.ys.forEach((yv,j)=>{const m=sgBox(ws[i]-.04,.06,ds[j]-.04,sgM([0x5aa845,0x7cc35a,0x4f9a4a,0x8fd16c][(i+j)%4]));out.push({m,x:x+ws[i]/2,y:.03,z:z+ds[j]/2});out.push({lab:SCENE.fmt(xv)+" × "+SCENE.fmt(yv),x:x+ws[i]/2,y:.25,z:z+ds[j]/2,w:.85,small:1});z+=ds[j]});x+=ws[i]});
  return{w:x,d:ds.reduce((s,v)=>s+v,0),pieces:out,tag:SCENE.fmt(b.x)+" × "+SCENE.fmt(b.y)+" garden"}},
 line(b){const L=2.6,out=[],rail=sgM(0x8a8f99);[-.05,.05].forEach(dz=>out.push({m:sgBox(L,.02,.02,rail),x:L/2,y:.01,z:.3+dz}));
  for(let i=0;i<=10;i++)out.push({m:sgBox(.02,.025,i===5?.26:.16,sgM(i===0||i===10?0x14123a:i===5?0xff3bd4:0x5b4a3a)),x:i*L/10,y:.012,z:.3});
  [[0,b.lo],[L,b.hi]].forEach(([x,v])=>{out.push({m:sgBox(.06,.55,.06,sgM(0x14123a)),x,y:.28,z:.55});out.push({lab:SCENE.fmt(v),x,y:.72,z:.55,w:.9})});
  out.push({lab:"halfway "+SCENE.fmt(b.lo+b.p/2),x:L/2,y:.4,z:.6,w:.95,small:1});
  const tx=(b.at-b.lo)/b.p*L;out.push({m:sgBox(.28,.16,.14,sgM(0xffc81e,0x332200)),x:tx,y:.1,z:.3});out.push({lab:"train: "+SCENE.fmt(b.at),x:tx,y:.45,z:.15,w:1});return{w:L,d:.8,pieces:out}},
 benches(b){const out=[];for(let k=0;k<b.n;k++){const len=b.seats*.13;out.push({m:sgBox(len,.04,.14,sgM(0x9a5a24)),x:len/2,y:.12,z:.2+k*.3});for(let s=0;s<b.seats;s++)out.push({m:sgBox(.1,.02,.1,sgM(0xffd23f)),x:s*.13+.065,y:.15,z:.2+k*.3})}return{w:b.seats*.13,d:b.n*.3,pieces:out,tag:b.label}},
 chairs(b){const out=[],G=2.39996;for(let i=0;i<b.n;i++){const r=.055*Math.sqrt(i+.5),a=i*G,m=new T.Group();m.add(sgBox(.07,.02,.07,sgM(0xe23b3b)));const bk=sgBox(.07,.07,.015,sgM(0xb02a2a));bk.position.set(0,.045,-.03);m.add(bk);m.rotation.y=a;out.push({m,x:.65+Math.cos(a)*r,y:.06,z:.5+Math.sin(a)*r})}return{w:1.3,d:1,pieces:out,tag:b.n+" chairs"}},
 piles(b){const out=[];let x=0;b.vals.forEach(v=>{const sub=SGB.blocks({d:SCENE.digits(v),unit:"stock"});sub.pieces.filter(p=>!p.lab).forEach(p=>out.push(Object.assign({},p,{x:p.x+x})));out.push({lab:String(v),x:x+sub.w/2,y:.6,z:.3,w:.6});x+=sub.w+.15});return{w:x,d:.8,pieces:out}},
 pizza(b){const R=.42,out=[{m:new T.Mesh(new T.CylinderGeometry(R+.04,R+.04,.03,40),sgM(0xc98a3f)),x:R+.04,y:.015,z:R+.04}],g=.05,seg=2*Math.PI/b.d;
  for(let i=0;i<b.d;i++){const m=new T.Mesh(new T.CylinderGeometry(R,R,.03,Math.max(3,Math.ceil(40/b.d)),1,false,i*seg+g/2,seg-g),sgM(i<b.n?0xd94f2b:0xf2c46d));out.push({m,x:R+.04,y:.045,z:R+.04})}
  if(b.unknown)out.push({lab:b.d+" slices: ? covered",x:R+.04,y:.5,z:R+.04,w:1.1});else out.push({lab:b.d+" equal slices",x:R+.04,y:.5,z:R+.04,w:1});return{w:2*R+.08,d:2*R+.08,pieces:out}},
 sign(b){return{w:0,d:0,pieces:[],sign:b.text}}};
/* lay the parts out side by side on the mat in front of the player, scaled to fit, and drop them in */
function sgBuild(Q,plan){const built=plan.parts.map(b=>SGB[b.k]?SGB[b.k](b):null).filter(Boolean),gap=.3;
  const W=built.reduce((s,b)=>s+b.w,0)+gap*Math.max(0,built.filter(b=>b.w>0).length-1),D=Math.max(.5,...built.map(b=>b.d)),sc=Math.min(1.9,3.2/W,1.7/D),yaw=Math.atan2(Q.fx,Q.fz);
  let x0=-W*sc/2;/* Q.rx points to the player's left, so flip it: biggest place on the left, read like a number */
  const Z0=-.15,toW=(lx,lz)=>({x:Q.ax-Q.rx*lx+Q.fx*lz,z:Q.az-Q.rz*lx+Q.fz*lz}),Y=Q.baseY;
  if(!Q.indoor){const mat=sgBox(Math.max(1.2,W*sc+.4),.02,D*sc+.5,sgM(0x3a3550));const c=toW(0,D*sc/2+Z0);mat.position.set(c.x,Y+.005,c.z);mat.rotation.y=yaw;mat.receiveShadow=true;Q.g.add(mat)}
  const total=built.reduce((s,b)=>s+b.pieces.filter(p=>!p.lab&&!p.ring).length,0),step=Math.max(.03,Math.min(.25,2/Math.max(1,total)));let n=0;built.forEach(b=>{if(b.sign){const s=sgLabel(b.sign,2.4);const c=toW(0,D*sc+.1);s.position.set(c.x,Y+1.25,c.z);Q.g.add(s);return}
   b.pieces.forEach(p=>{const lx=x0+p.x*sc,lz=Z0+p.z*sc,c=toW(lx,lz);
    if(p.lab){const s=sgLabel(p.lab,(p.w||.8)*Math.max(.7,sc));s.position.set(c.x,Y+p.y*sc+(p.small?.12:.18),c.z);if(p.small)s.material.opacity=.92;Q.g.add(s);return}
    const m=p.m;m.scale.multiplyScalar(sc);m.castShadow=true;if(p.flat)m.rotation.x=-Math.PI/2;if(p.rx)m.rotation.x=Math.PI/2;m.rotation.y+=yaw;
    if(p.ring){m.position.set(c.x,Y+.012,c.z);Q.g.add(m);return}
    m.userData={tx:c.x,ty:Y+p.y*sc,tz:c.z,delay:Math.min(2.4,n++*step)};m.position.set(c.x,Y+3,c.z);m.visible=false;Q.g.add(m);Q.items.push(m)});
   if(b.tag){const s=sgLabel(b.tag,1.4*Math.max(.75,sc)),c=toW(x0+b.w*sc/2,Z0+b.d*sc+.05);s.position.set(c.x,Y+.85,c.z);Q.g.add(s)}
   x0+=b.w*sc+gap*sc});
  /* intro camera: between the player and the scene (so heads never block it), high enough to see all of it */
  const mid=toW(0,Z0+D*sc/2),span=Math.max(W*sc,D*sc*1.6);Q.sgCam={c:new T.Vector3(mid.x,Y+.2,mid.z),back:Math.min(2.1,.9+span*.4),up:1.1+span*.6};
  return n}
const SGN={sal:"Ms. Okafor",marcia:"Ms. Marcia",theo:"Theo"};
function skillGameStart(d){const it=d&&d.it,plan=it&&window.SCENE&&SCENE.plan(it);
  const busy=QG||W2.teach||W2.blaster||W2.ui;if(!plan||busy){try{parent.postMessage({lv3d:"skillres",src:d&&d.src,sk:it&&it.sk,lv:it&&it.lv,skipped:1},"*")}catch(_){}return false}
  const npc=d.npc||(AREA==="school"?"Ms. Okafor":AREA==="street"&&Math.hypot(P.x-MA.x,P.z-MA.z)<4?"Ms. Marcia":"Theo"),indoor=AREA!=="street";
  const q={level:Math.max(1,Math.min(6,it.lv|0)),lvTag:"Level "+(it.lv|0),badge:"🎮 Real life · "+plan.title,why:it.why||{},text:it.q,ans:it.a,ch:it.ch.slice(),hints:[it.hint].filter(Boolean),expl:(it.steps||[]).slice(-1)[0]||"",kind:"marbles",mode:"none",review:true,mid:"",idx:0,count:1,title:plan.title,
    skill:{src:d.src||"street",sk:it.sk,lv:it.lv,t0:performance.now()}};
  /* on the street, face the open road so the scene and the answer pads land on clear ground */
  if(AREA==="street"){P.yaw=P.z>0?Math.PI:0;camYaw=P.yaw+Math.PI;if(npc==="Theo"&&Math.hypot(P.x-TH.x,P.z-TH.z)>3){TH.x=P.x+1.4;TH.z=P.z}}
  startGame(npc,indoor,["marbles"],"review",{q,intro:plan.intro,build:Q=>sgBuild(Q,plan)});if(!QG)return false;QG.firstWhy=null;return true}
/* a wrong first tap is the misconception the learning log keeps */
const _ans6=answer;answer=function(a){if(QG&&QG.q.skill&&QG.phase==="ask"&&a&&a.v!==QG.q.ans&&!QG.q.skill.why)QG.q.skill.why=(QG.q.why&&QG.q.why[a.v])||"";return _ans6(a)};
const _ug6=updateGame;updateGame=function(dt,now){_ug6(dt,now);if(QG&&QG.sgCam&&QG.phase==="intro"){const k=QG.sgCam;QG.camWant=new T.Vector3(k.c.x-QG.fx*k.back,k.c.y+k.up,k.c.z-QG.fz*k.back);QG.camLook=k.c}};
addEventListener("message",e=>{const d=e.data;if(d&&d.lv3d==="skillgame")skillGameStart(d)});
/* Theo on the street now offers a real-life game from any skill (the page picks the skill and level) */
const _int6=interactions;interactions=function(){return _int6().map(x=>x.type==="game"&&x.npc==="Theo"&&!x.indoor?Object.assign({},x,{type:"skill",label:"Press E — Theo has a real-life math game for you!"}):x)};
const _try6=tryDoor;tryDoor=function(){const d=nearDoor;if(d&&d.type==="skill"&&!QG){try{parent.postMessage({lv3d:"skillreq",npc:"Theo"},"*")}catch(_){}return}return _try6()};
Object.assign(window,{skillGameStart,sgBuild});
