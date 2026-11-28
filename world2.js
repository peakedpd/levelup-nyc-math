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

  /* Shelves face +x (into the room). Prizes are big, bright and packed, one category per shelf, so they read from the doorway. */
  const gl=(c,i=.35,o={})=>M(c,Object.assign({emissive:c,emissiveIntensity:i,roughness:.4},o));
  const add=(geo,mat,x,y,z,par=g)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);par.add(o);return o};
  const label=(txt,price,bg,x,y,z,w=1.5)=>{const H0=96,t=canvasTex(1024,H0,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.strokeStyle="#14123a";c.lineWidth=8;c.strokeRect(4,4,W-8,H-8);c.textBaseline="middle";c.fillStyle="#14123a";let fs=70;c.font=`900 ${fs}px Trebuchet MS,sans-serif`;while(c.measureText(txt).width>W-330&&fs>30){fs-=2;c.font=`900 ${fs}px Trebuchet MS,sans-serif`}c.textAlign="left";c.fillText(txt,26,H/2+3);
      c.fillStyle="#14123a";c.fillRect(W-280,14,262,H-28);c.fillStyle="#ffd23f";c.textAlign="center";c.font="900 56px Trebuchet MS,sans-serif";c.fillText(price+" TIX",W-149,H/2+3)});
    const m=new T.Mesh(new T.PlaneGeometry(w,w*H0/1024),new T.MeshBasicMaterial({map:t,toneMapped:false}));m.position.set(x,y,z);m.rotation.y=Math.PI/2;g.add(m);return m};
  const word=(txt,bg,fg)=>canvasTex(256,96,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle=fg;c.textAlign="center";c.textBaseline="middle";c.font="900 54px Trebuchet MS,sans-serif";c.fillText(txt,W/2,H/2+3)});
  const decal=(tex,w,h,x,y,z,par=g)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,toneMapped:false,transparent:true}));m.position.set(x,y,z);m.rotation.y=Math.PI/2;par.add(m);return m};
  const PAL=[0xff4d6d,0xffd23f,0x7cff6b,0x2bd9ff,0xc84bff,0xff8a3d,0xff7ad9];
  /* CANDY: glass jars full of candy balls, lollipop cups, gummy bags */
  const gummyT=word("GUMMY","#ff3d7f","#fff");
  const addCandy=(x,y,z,col=0xff4d6d,s=1,kind=0)=>{
    if(kind===0){const jar=add(new T.CylinderGeometry(.11*s,.11*s,.26*s,16),M(0xdff4ff,{roughness:.05,transparent:true,opacity:.35,depthWrite:false}),x,y+.13*s,z);
      for(let i=0;i<14;i++){const a=i*2.4,r=.065*s*((i%3)/2+.3);add(new T.SphereGeometry(.03*s,8,6),gl(PAL[(i+col)%PAL.length],.3),x+Math.cos(a)*r,y+.04*s+Math.floor(i/4)*.05*s,z+Math.sin(a)*r)}
      add(new T.CylinderGeometry(.12*s,.12*s,.04*s,16),gl(col,.25),x,y+.28*s,z)}
    else if(kind===1){add(new T.CylinderGeometry(.07*s,.06*s,.1*s,12),M(0xffffff),x,y+.05*s,z);
      [[-.05,.0],[.05,.03],[0,-.04]].forEach(([dz,dx],i)=>{add(new T.CylinderGeometry(.008*s,.008*s,.26*s,6),M(0xffffff),x+dx*s,y+.18*s,z+dz*s);
        const pop=add(new T.CylinderGeometry(.065*s,.065*s,.025*s,20),gl(PAL[(i*2+col)%PAL.length],.45),x+dx*s,y+.33*s,z+dz*s);pop.rotation.z=Math.PI/2;
        const sw=add(new T.TorusGeometry(.04*s,.008*s,6,20),M(0xffffff,{emissive:0xffffff,emissiveIntensity:.3}),x+dx*s+.014*s,y+.33*s,z+dz*s);sw.rotation.y=Math.PI/2})}
    else {const bag=add(new T.BoxGeometry(.05*s,.24*s,.17*s),gl(PAL[col%PAL.length],.3),x,y+.12*s,z);decal(gummyT,.15*s,.06*s,x+.027*s,y+.14*s,z)}};
  /* SLIME: white tubs with bright glossy goo and a SLIME label */
  const slimeT=word("SLIME","#14123a","#7cff6b");
  const addSlime=(x,y,z,col=0x7cff6b,s=1)=>{add(new T.CylinderGeometry(.12*s,.11*s,.13*s,18),M(0xf6f2ea,{roughness:.5}),x,y+.065*s,z);
    const goo=add(new T.SphereGeometry(.115*s,18,12),gl(col,.3,{roughness:.08,metalness:.1}),x,y+.13*s,z);goo.scale.y=.6;
    const drip=add(new T.SphereGeometry(.03*s,10,8),gl(col,.55,{roughness:.08}),x+.11*s,y+.1*s,z+.03*s);drip.scale.y=1.6;
    decal(slimeT,.17*s,.06*s,x+.122*s,y+.06*s,z)};
  /* FIDGET SPINNERS: three-lobed spinners hanging on a pegboard, facing the room */
  const addSpinner=(x,y,z,col=0x2bd9ff,s=1,peg=true)=>{const sp=new T.Group();sp.position.set(x,y,z);g.add(sp);const m=gl(col,.22,{metalness:.2,roughness:.35});
    for(let i=0;i<3;i++){const a=i*2.094+Math.PI/2;const arm=add(new T.BoxGeometry(.03*s,.06*s,.1*s),m,0,Math.sin(a)*.05*s,Math.cos(a)*.05*s,sp);arm.rotation.x=-a;
      const lobe=add(new T.CylinderGeometry(.055*s,.055*s,.035*s,18),m,0,Math.sin(a)*.1*s,Math.cos(a)*.1*s,sp);lobe.rotation.z=Math.PI/2;
      const bear=add(new T.CylinderGeometry(.025*s,.025*s,.04*s,12),M(0xdddddd,{metalness:.8,roughness:.2}),.002,Math.sin(a)*.1*s,Math.cos(a)*.1*s,sp);bear.rotation.z=Math.PI/2}
    const hub=add(new T.CylinderGeometry(.045*s,.045*s,.05*s,18),M(0xffffff,{metalness:.5,roughness:.2}),0,0,0,sp);hub.rotation.z=Math.PI/2;
    if(peg){const pg=add(new T.CylinderGeometry(.008,.008,.3,6),M(0xbbbbbb,{metalness:.7}),-.12,0,0,sp);pg.rotation.z=Math.PI/2}
    return sp};
  /* SQUISHY TOYS: round plush animals with faces (cat, bear, bunny, frog) */
  const addSquishy=(x,y,z,col=0xff8fb1,s=1,kind=0)=>{const r=.13*s,b=add(new T.SphereGeometry(r,18,14),M(col,{roughness:.85,emissive:col,emissiveIntensity:.18}),x,y+r,z);b.scale.set(.95,1,1.05);
    const fx=x+r*.92,ink=M(0x14123a);[-1,1].forEach(sd=>{add(new T.SphereGeometry(.02*s,8,6),ink,fx,y+r*1.15,z+sd*.045*s);const ch=add(new T.SphereGeometry(.022*s,8,6),M(0xff6f9a,{roughness:.9}),fx-.01*s,y+r*.9,z+sd*.075*s);ch.scale.x=.4});
    const mo=add(new T.TorusGeometry(.02*s,.006*s,6,12,Math.PI),ink,fx+.004,y+r*.95,z);mo.rotation.set(0,Math.PI/2,Math.PI);
    const em=M(col,{roughness:.85,emissive:col,emissiveIntensity:.18});
    if(kind===0)[-1,1].forEach(sd=>{const e=add(new T.ConeGeometry(.04*s,.07*s,4),em,x,y+r*1.95,z+sd*.07*s);e.rotation.x=sd*.25});
    else if(kind===1)[-1,1].forEach(sd=>add(new T.SphereGeometry(.04*s,10,8),em,x,y+r*1.85,z+sd*.08*s));
    else if(kind===2)[-1,1].forEach(sd=>{const e=add(new T.CapsuleGeometry(.025*s,.09*s,4,8),em,x,y+r*2.15,z+sd*.04*s);e.rotation.x=sd*.15});
    else [-1,1].forEach(sd=>{add(new T.SphereGeometry(.04*s,10,8),M(0xffffff),x+r*.5,y+r*1.75,z+sd*.06*s);add(new T.SphereGeometry(.018*s,8,6),ink,x+r*.5+.035*s,y+r*1.75,z+sd*.06*s)})};
  /* RC CARS: bodies with big wheels, spoiler and antenna, plus a remote and a boxed car */
  const addCar=(x,y,z,col=0x2bd9ff,s=1)=>{const m=gl(col,.3,{metalness:.45,roughness:.3});
    add(new T.BoxGeometry(.17*s,.07*s,.34*s),m,x,y+.09*s,z);add(new T.BoxGeometry(.14*s,.06*s,.15*s),M(0x14183a,{roughness:.15,metalness:.4}),x,y+.155*s,z-.02*s);
    const sp=add(new T.BoxGeometry(.17*s,.015*s,.06*s),m,x,y+.18*s,z+.15*s);add(new T.BoxGeometry(.015*s,.05*s,.015*s),m,x,y+.15*s,z+.15*s);
    const wm=M(0x151515,{roughness:.9}),rim=M(0xd0d0d0,{metalness:.8,roughness:.2});
    for(const dz of[-.11,.11])for(const sd of[-1,1]){const w=add(new T.CylinderGeometry(.055*s,.055*s,.045*s,16),wm,x+sd*.1*s,y+.055*s,z+dz*s);w.rotation.z=Math.PI/2;const rr=add(new T.CylinderGeometry(.028*s,.028*s,.048*s,10),rim,x+sd*.1*s,y+.055*s,z+dz*s);rr.rotation.z=Math.PI/2}
    add(new T.CylinderGeometry(.004*s,.004*s,.22*s,6),M(0x222222),x-.05*s,y+.23*s,z+.1*s);add(new T.SphereGeometry(.014*s,8,6),gl(0xff2a2a,.8),x-.05*s,y+.34*s,z+.1*s)};
  const rcBoxT=canvasTex(512,320,(c,W,H)=>{const gr=c.createLinearGradient(0,0,W,H);gr.addColorStop(0,"#ff5d1a");gr.addColorStop(1,"#c8102e");c.fillStyle=gr;c.fillRect(0,0,W,H);c.fillStyle="#ffd23f";c.font="900 72px Trebuchet MS,sans-serif";c.textAlign="center";c.fillText("RC TURBO",W/2,78);
    c.fillStyle="#bfe9ff";c.fillRect(70,110,372,170);c.fillStyle="#2bd9ff";c.fillRect(140,190,232,46);c.fillStyle="#14183a";c.fillRect(190,160,120,36);c.fillStyle="#111";[175,335].forEach(x=>{c.beginPath();c.arc(x,244,30,0,6.3);c.fill()});c.strokeStyle="#111";c.lineWidth=4;c.beginPath();c.moveTo(200,160);c.lineTo(180,112);c.stroke()});
  const addRemote=(x,y,z,s=1)=>{const r=add(new T.BoxGeometry(.06*s,.1*s,.2*s),M(0x222233,{roughness:.4}),x,y+.05*s,z);r.rotation.z=-.5;
    [-.05,.05].forEach(dz=>add(new T.CylinderGeometry(.012*s,.012*s,.05*s,8),gl(0xffd23f,.5),x+.04*s,y+.12*s,z+dz*s));add(new T.CylinderGeometry(.004,.004,.2*s,6),M(0x999999,{metalness:.7}),x-.02*s,y+.2*s,z-.08*s)};

  /* shelf layout (bottom → top): squishies, slime, candy, spinners on a pegboard, RC cars */
  const lip=shX+shD/2+.012, Z0=shZ-shLen/2+.25, Z1=shZ+shLen/2-.25, row=(n,f)=>{for(let i=0;i<n;i++)f(Z0+(Z1-Z0)*i/(n-1),i)};
  const SY=[0.105,.805,1.445,2.085,2.545];
  row(7,(z,i)=>addSquishy(shX+(i%2?.02:-.04),SY[0],z,[0xff8fb1,0xffd23f,0xb9f2ff,0x9be15d,0xc8a2ff,0xffb36b,0x7ad9ff][i],1.3,i%4));
  row(8,(z,i)=>addSlime(shX+(i%2?.04:-.04),SY[1],z,[0x22e04a,0xa020f0,0x1e90ff,0xff2a75,0xffd000,0x22e04a,0xff6a00,0xa020f0][i],1.3));
  row(9,(z,i)=>addCandy(shX+(i%2?.03:-.04),SY[2],z,i,1.25,i%3));
  /* pegboard behind the spinner shelf */
  box(g,.03,.6,shLen-.12,M(0x2a1f3d,{roughness:.8}),shBack+.06,SY[3]+.32,shZ,0);
  row(7,(z,i)=>addSpinner(shX+.08,SY[3]+.34+(i%2?.06:-.04),z,[0xff2a55,0x1e90ff,0x22c55e,0xffb000,0xa020f0,0xff6a00,0x00c2c7][i],1.45));
  addCar(shX,SY[4],Z0+.2,0x1e90ff,1.25);addCar(shX+.03,SY[4],Z0+.75,0xff4a00,1.25);addCar(shX,SY[4],Z0+1.3,0x22c55e,1.25);addRemote(shX+.08,SY[4],Z0+1.75,1.3);
  {const bx=add(new T.BoxGeometry(.18,.32,.52),M(0xc8102e,{roughness:.6}),shX-.05,SY[4]+.16,Z1-.45);const f=decal(rcBoxT,.5,.31,shX+.042,SY[4]+.16,Z1-.45);addCar(shX,SY[4],Z1-.02,0xffd23f,.8)}
  /* big labels on each shelf lip: category + ticket price */
  label("SQUISHY TOYS",45,"#ffb3cf",lip,.075,shZ);
  label("SLIME",30,"#9dff8f",lip,SY[1]-.09,shZ);
  label("CANDY",15,"#ff9fb0",lip,SY[2]-.09,shZ);
  label("FIDGET SPINNERS",80,"#9fe9ff",lip,SY[3]-.09,shZ);
  label("RC CARS",200,"#ffc27a",lip,SY[4]-.09,shZ);
  /* warm shelf lighting: LED strips under each shelf + two spots so the shelves read from the doorway */
  const led=M(0xfff1c8,{emissive:0xffe2a0,emissiveIntensity:2.2});
  SY.slice(1).forEach(y=>box(g,.03,.02,shLen-.1,led,shX+.24,y-.04,shZ,0));
  [[3.95],[6.35]].forEach(([z])=>{const sp=new T.SpotLight(0xffe2b0,18,7,.75,.5,1.2);sp.position.set(-6.9,3.4,shZ+(z-5.15)*.6);sp.target.position.set(shX,1.3,z);g.add(sp);g.add(sp.target)});
  {const fill=new T.PointLight(0xffd9a0,10,3.5);fill.position.set(-7.9,1.4,shZ);g.add(fill)}

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
  addSpinner(gx,1.12,gz-.18,0x2bd9ff,.8,false);addSlime(gx-.12,.99,gz+.14,0x7cff6b,.75);addSquishy(gx+.12,.99,gz+.12,0xff8fb1,.7,1);

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
/* Neon Coin Rush 3D cabinet (with Canva start-screen art) is built in street3d.html at this same (-7.55, 1.4) spot. */
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

/* ---------- 7. TICKET BLASTER VR: FRACTION FRENZY (sit in the pod, goggles on, 3D first-person math blaster) ----------
   Replaces the old purple Ticket Blaster box. Standard CCSS 4.NF.A.1 (equivalent fractions); questions come from
   learn_tbvr.js (src_learn/tbvr.js, checked by tools/verify_tbvr.js). Kept in its own part so other arcade work
   (Prize Corner, worker, doors, cabinets) can change w2c/w2d without touching this. */
(function(){
const VR_STD="4.NF.A.1";
if(!window.TBVR){const sc=document.createElement("script");sc.src="learn_tbvr.js";document.head.appendChild(sc)}
const POD_LX=3.9,POD_LZ=5.25,POD_ROT=-1.92,POD_DIR={x:Math.sin(POD_ROT),z:Math.cos(POD_ROT)};
const PC={x:AR.cx+POD_LX,z:AR.cz+POD_LZ};
const POD={};window.TBPOD=POD;
/* --- remove the old purple box, its mint top and the flat TICKET BLASTER sign --- */
{const kill=[];AR.g.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.parameters)return;const p=o.geometry.parameters,q=o.position;
    if(o.geometry.type==="BoxGeometry"&&Math.abs(q.x-POD_LX)<.05&&Math.abs(q.z-POD_LZ)<.05&&((p.width===3&&p.height===2.2)||(p.width===2.6&&p.height===.05)))kill.push(o);
    if(o.geometry.type==="PlaneGeometry"&&Math.abs(q.x-POD_LX)<.05&&Math.abs(q.z-5.95)<.05&&p.width===2.8)kill.push(o)});
  AR.g.updateMatrixWorld(true);kill.forEach(o=>{const b=new T.Box3().setFromObject(o);for(let i=SOL.length-1;i>=0;i--){const s=SOL[i];if(Math.abs(s.x0-b.min.x)<.02&&Math.abs(s.x1-b.max.x)<.02&&Math.abs(s.z0-b.min.z)<.02&&Math.abs(s.z1-b.max.z)<.02)SOL.splice(i,1)}o.parent.remove(o)});POD.removed=kill.length}
/* --- build the pod --- */
const pg=new T.Group();pg.position.set(POD_LX,0,POD_LZ);pg.rotation.y=POD_ROT;AR.g.add(pg);POD.g=pg;
const glow=(c,i=1.6)=>new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:i,roughness:.4});
const shellM=new T.MeshStandardMaterial({color:0x6a2bd9,metalness:.45,roughness:.22,emissive:0x2a0870,emissiveIntensity:.45,side:T.DoubleSide});POD.shellM=shellM;
{const prof=[[.86,.26],[1.0,.6],[1.07,1.1],[1.03,1.6],[.9,2.05],[.62,2.42],[.28,2.62],[.02,2.67]].map(([r,y])=>new T.Vector2(r,y));
  const gap=.95,sh=new T.Mesh(new T.LatheGeometry(prof,48,gap,Math.PI*2-2*gap),shellM);sh.castShadow=true;pg.add(sh);
  /* inner lining: darker, glittery */const inn=new T.Mesh(new T.LatheGeometry(prof.map(v=>new T.Vector2(v.x*.95,v.y)),40,gap,Math.PI*2-2*gap),new T.MeshStandardMaterial({color:0x1a0838,roughness:.6,side:T.BackSide,emissive:0x12062a}));pg.add(inn);
  /* neon trims along both edges of the opening */[gap,-gap].forEach((ph,i)=>{const pts=prof.map(v=>new T.Vector3(v.x*1.015*Math.sin(ph),v.y,v.x*1.015*Math.cos(ph)));const tb=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),40,.035,8),glow(i?0x2bd9ff:0xff2bd4,2.2));pg.add(tb);(POD.trims=POD.trims||[]).push(tb)});
  [[.32,.88,0xff2bd4],[1.62,1.04,0x2bd9ff]].forEach(([y,r,c])=>{const t=new T.Mesh(new T.TorusGeometry(r,.025,8,64,Math.PI*2-2*gap),glow(c,1.8));t.rotation.x=Math.PI/2;t.rotation.z=-Math.PI/2+gap;t.position.y=y;pg.add(t)})}
/* base platform + floor glow */
{const b=new T.Mesh(new T.CylinderGeometry(1.25,1.36,.26,48),new T.MeshStandardMaterial({color:0x140a26,metalness:.6,roughness:.3}));b.position.y=.13;b.receiveShadow=true;pg.add(b);
  const er=new T.Mesh(new T.TorusGeometry(1.3,.03,8,72),glow(0x2bd9ff,2));er.rotation.x=Math.PI/2;er.position.y=.25;pg.add(er);
  const fr=new T.Mesh(new T.RingGeometry(1.38,1.75,64),new T.MeshBasicMaterial({color:0xff2bd4,transparent:true,opacity:.45,side:T.DoubleSide}));fr.rotation.x=-Math.PI/2;fr.position.y=.012;pg.add(fr);POD.floor=fr;
  /* step plate in front */const st=new T.Mesh(new T.BoxGeometry(1.1,.12,.5),new T.MeshStandardMaterial({color:0x221238,metalness:.5,roughness:.35}));st.position.set(0,.06,1.25);pg.add(st);const sl=new T.Mesh(new T.BoxGeometry(1.0,.02,.04),glow(0xffd23f,1.8));sl.position.set(0,.13,1.48);pg.add(sl)}
/* gamer seat with joystick arms */
{const cush=new T.MeshStandardMaterial({color:0xff2bd4,roughness:.45,emissive:0x5a0040,emissiveIntensity:.4}),frame=new T.MeshStandardMaterial({color:0x1b1030,metalness:.5,roughness:.3});
  const add=(geo,m,x,y,z,rx=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.rotation.x=rx;o.castShadow=true;pg.add(o);return o};
  add(new T.CylinderGeometry(.12,.2,.38,16),frame,0,.45,-.12);add(new T.BoxGeometry(.82,.16,.72),cush,0,.7,-.08);
  add(new T.BoxGeometry(.84,1.0,.16),cush,0,1.25,-.5,-.16);add(new T.BoxGeometry(.52,.3,.14),frame,0,1.88,-.6,-.16);
  add(new T.BoxGeometry(.08,.6,.66),glow(0x2bd9ff,.9),-.45,1.15,-.48,-.16).scale.set(1,1,.2);add(new T.BoxGeometry(.08,.6,.66),glow(0x2bd9ff,.9),.45,1.15,-.48,-.16).scale.set(1,1,.2);
  [-.5,.5].forEach(x=>{add(new T.BoxGeometry(.14,.1,.6),frame,x,.92,-.05);add(new T.CylinderGeometry(.025,.03,.18,10),frame,x,1.05,.15);add(new T.SphereGeometry(.055,14,10),glow(x<0?0xff2bd4:0x6dff6b,1.6),x,1.16,.15)})}
/* VR headset on its hook */
const HS=new T.Group();{const body=new T.Mesh(new T.BoxGeometry(.28,.13,.15),new T.MeshStandardMaterial({color:0x0e0b16,metalness:.6,roughness:.18}));HS.add(body);
  const lens=new T.Mesh(new T.BoxGeometry(.26,.05,.01),glow(0x2bd9ff,2.4));lens.position.set(0,.01,.078);HS.add(lens);
  const strap=new T.Mesh(new T.TorusGeometry(.13,.016,8,30),new T.MeshStandardMaterial({color:0xff2bd4,emissive:0x5a0040}));strap.rotation.x=Math.PI/2;strap.scale.set(1,1.25,1);strap.position.z=-.1;HS.add(strap)}
const HOOK=new T.Vector3(.72,1.5,.62);{const hk=new T.Mesh(new T.CylinderGeometry(.02,.02,.2,8),glow(0xffd23f,.8));hk.rotation.x=Math.PI/2;hk.position.set(HOOK.x,HOOK.y+.1,HOOK.z-.1);pg.add(hk)}
HS.position.copy(HOOK);HS.rotation.y=.4;pg.add(HS);POD.headset=HS;
/* TICKET BLASTER VR marquee with chaser bulbs */
const MQ=canvasTex(1024,256,(c,W,H)=>{const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,"#1a0533");g.addColorStop(.5,"#3a0a6a");g.addColorStop(1,"#1a0533");c.fillStyle=g;c.fillRect(0,0,W,H);
  c.textAlign="center";c.textBaseline="middle";c.font="900 92px Trebuchet MS,sans-serif";c.shadowColor="#ff2bd4";c.shadowBlur=28;c.fillStyle="#ffe14d";c.fillText("TICKET BLASTER",W/2,H*.42);
  c.shadowColor="#2bd9ff";c.font="900 54px Trebuchet MS,sans-serif";c.fillStyle="#bff6ff";c.fillText("\ud83e\udd7d VR \u00b7 FRACTION FRENZY",W/2,H*.8)});
{const mg=new T.Group();mg.position.set(0,2.62,.62);mg.rotation.x=-.18;pg.add(mg);const bd=new T.Mesh(new T.BoxGeometry(2.05,.6,.1),new T.MeshStandardMaterial({color:0x14062a,metalness:.5}));mg.add(bd);
  const pl=new T.Mesh(new T.PlaneGeometry(1.9,.48),new T.MeshBasicMaterial({map:MQ}));pl.position.z=.055;mg.add(pl);POD.bulbs=[];
  for(let i=0;i<18;i++){const t=i/18,per=2*(1.98+.56);let d=t*per,x,y;if(d<1.98){x=-.99+d;y=.28}else if((d-=1.98)<.56){x=.99;y=.28-d}else if((d-=.56)<1.98){x=.99-d;y=-.28}else{d-=1.98;x=-.99;y=-.28+d}
    const b=new T.Mesh(new T.SphereGeometry(.03,8,6),glow(0xffd23f,2));b.position.set(x,y,.07);mg.add(b);POD.bulbs.push(b)}}
/* ticket output slot with a strip of tickets */
{const tg=new T.Group();tg.position.set(-.98,0,.72);tg.rotation.y=.5;pg.add(tg);const bx=new T.Mesh(new T.BoxGeometry(.36,.62,.3),new T.MeshStandardMaterial({color:0x2a1450,metalness:.5,roughness:.3}));bx.position.y=.31;tg.add(bx);
  const slot=new T.Mesh(new T.BoxGeometry(.24,.035,.02),glow(0xff7a1a,2));slot.position.set(0,.5,.155);tg.add(slot);
  const lab=sign(tg,"TICKETS",0,.36,.152,.3,.09,"#ff7a1a","#14062a");lab.material.emissiveIntensity=.6;
  const tk=new T.Group();tk.position.set(0,.5,.16);tg.add(tk);const tkM=new T.MeshStandardMaterial({color:0xff9a3d,emissive:0xff5a00,emissiveIntensity:.35,side:T.DoubleSide});
  for(let i=0;i<6;i++){const p=new T.Mesh(new T.PlaneGeometry(.17,.085),tkM);p.position.set(0,-.045-i*.088,.02+i*.012);p.rotation.x=-.12-i*.08;tk.add(p)}tk.scale.y=.35;POD.tickets=tk;POD.tkOut=0}
/* attract screen on a stand with John's Canva art */
{const sg=new T.Group();sg.position.set(1.42,0,.55);sg.rotation.y=-.35;pg.add(sg);const pole=new T.Mesh(new T.CylinderGeometry(.04,.06,1.2,10),new T.MeshStandardMaterial({color:0x222033,metalness:.6}));pole.position.y=.6;sg.add(pole);
  const fr=new T.Mesh(new T.BoxGeometry(.98,.58,.06),new T.MeshStandardMaterial({color:0x0c0816,metalness:.5}));fr.position.y=1.45;sg.add(fr);
  const tex=new T.TextureLoader().load("img/tbvr_title.webp");tex.colorSpace=T.SRGBColorSpace;const sc=new T.Mesh(new T.PlaneGeometry(.92,.52),new T.MeshBasicMaterial({map:tex}));sc.position.set(0,1.45,.032);sg.add(sc);POD.attract=sc;
  const edge=new T.Mesh(new T.BoxGeometry(1.0,.02,.07),glow(0xff2bd4,2));edge.position.y=1.15;sg.add(edge)}
{const L=new T.PointLight(0xff4fe0,6,4.5);L.position.set(0,1.7,.15);pg.add(L);POD.light=L;const L2=new T.PointLight(0x2bd9ff,3,3.5);L2.position.set(0,.6,1.2);pg.add(L2)}
SOL.push({x0:PC.x-1.15,x1:PC.x+1.15,z0:PC.z-1.15,z1:PC.z+1.15,y0:0,top:2.7});
const FRONT={x:PC.x+POD_DIR.x*1.85,z:PC.z+POD_DIR.z*1.85},SEAT={x:PC.x+POD_DIR.x*.05,z:PC.z+POD_DIR.z*.05},FACE=Math.atan2(POD_DIR.x,POD_DIR.z);
Object.assign(POD,{PC,FRONT,SEAT,dir:POD_DIR});

/* --- interactions: E at the pod --- */
const _ia=interactions;interactions=function(){let L=_ia();if(AREA!=="arcade"||(W2.blaster&&W2.blaster.vr))return L;
  L=L.filter(d=>d.type!=="blaster");if(!W2.blaster&&!W2.ui&&!QG){const e={type:"vrpod",x:PC.x,z:PC.z,r:2.6,label:"Press E \u2014 sit down in \ud83e\udd7d TICKET BLASTER VR (fractions)"};let i=0;while(i<L.length&&(L[i].type==="exit2"||L[i].type==="door"))i++;L.splice(i,0,e)}return L};
const _td=tryDoor;tryDoor=function(){const d=nearDoor;if(d&&d.type==="vrpod")return podStart();return _td()};

/* talk lines: the green machine is now the VR pod */
["Theo","Arcade Worker"].forEach(n=>{const f0=TALK[n];if(typeof f0!=="function")return;TALK[n]=function(){return f0.apply(this,arguments).map(l=>/green machine/.test(l)?(n==="Theo"?"The glowing purple pod is Ticket Blaster VR. Sit down, goggles on, and blast equal fractions!":"Ticket Blaster VR's the purple pod. Better accuracy, more tickets."):l)}});
/* --- sit + goggles sequence --- */
let VRS=null;
function ease(k){k=Math.max(0,Math.min(1,k));return k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2}
function podStart(){if(VRS||W2.blaster||QG)return;try{document.exitPointerLock()}catch(_){}
  TH.x=FRONT.x+POD_DIR.z*2.2;TH.z=FRONT.z-POD_DIR.x*2.2;VRS={vr:1,keys:{},phase:"walk",t0:performance.now(),from:{x:P.x,z:P.z,yaw:P.yaw},camFrom:cam.position.clone()};W2.blaster=VRS;POD.sits=(POD.sits||0)+1;beep(520,.08,"triangle",.05);setTimeout(()=>beep(780,.1,"triangle",.05),90)}
const SEQ={walk:800,sit:700,goggles:1700,out:900};
function eyePos(){return new T.Vector3(SEAT.x,1.42,SEAT.z)}
function lookOut(){return new T.Vector3(SEAT.x+POD_DIR.x*4,1.3,SEAT.z+POD_DIR.z*4)}
const _gcV=gameCam;gameCam=function(dt){if(!VRS)return _gcV(dt);const now=performance.now();if(window.TBVRG&&TBVRG.hold!=null)VRS.t0=now-TBVRG.hold*(SEQ[VRS.phase]||1);const k=(now-VRS.t0)/(SEQ[VRS.phase]||1);
  const outside=new T.Vector3(PC.x+POD_DIR.x*4.6-POD_DIR.z*.9,2.05,PC.z+POD_DIR.z*4.6+POD_DIR.x*.9),podLook=new T.Vector3(PC.x,1.25,PC.z);
  if(VRS.phase==="walk"){const e=ease(k);cam.position.lerpVectors(VRS.camFrom,outside,e);cam.lookAt(podLook);P.x=VRS.from.x+(FRONT.x-VRS.from.x)*e;P.z=VRS.from.z+(FRONT.z-VRS.from.z)*e;P.yaw=Math.atan2(PC.x-P.x,PC.z-P.z);if(k>=1)nextPhase("sit")}
  else if(VRS.phase==="sit"){const e=ease(k);cam.position.copy(outside);cam.lookAt(podLook);P.x=FRONT.x+(SEAT.x-FRONT.x)*e;P.z=FRONT.z+(SEAT.z-FRONT.z)*e;P.yaw=FACE;if(k>=1)nextPhase("goggles")}
  else if(VRS.phase==="goggles"){const e=ease(Math.min(1,k*1.6));cam.position.lerpVectors(outside,eyePos(),e);cam.lookAt(lookOut());
    /* headset lifts off the hook and lowers over the eyes */const hk=pg.localToWorld(HOOK.clone()),fwd=new T.Vector3(POD_DIR.x,0,POD_DIR.z),eye=eyePos();
    const above=eye.clone().add(new T.Vector3(0,.55,0)).addScaledVector(fwd,.35),onEyes=eye.clone().addScaledVector(fwd,.16),k2=Math.max(0,Math.min(1,(k-.25)/.75));
    const wp=k2<.5?hk.clone().lerp(above,ease(k2*2)):above.clone().lerp(onEyes,ease((k2-.5)*2));pg.worldToLocal(wp);HS.position.copy(wp);HS.rotation.set(0,0,0);const s=1+Math.max(0,k2-.6)*3;HS.scale.set(s,s,s);
    visor(Math.max(0,Math.min(1,(k-.35)/.4)));if(k>.78&&!VRS.glitch){VRS.glitch=1;glitch()}if(k>=1){visor(-1);nextPhase("vr")}}
  else if(VRS.phase==="vr"){cam.position.copy(eyePos());cam.lookAt(lookOut())}
  else if(VRS.phase==="out"){const e=ease(k);const back=new T.Vector3(FRONT.x+POD_DIR.x*3.4,2.3,FRONT.z+POD_DIR.z*3.4);cam.position.lerpVectors(eyePos(),back,e);cam.lookAt(new T.Vector3(FRONT.x,1.2,FRONT.z));
    const wp=HOOK.clone();HS.position.lerp(wp,Math.min(1,e*1.4));HS.scale.setScalar(1+(1-e)*.5);if(k>=1)podEnd()}
  return true};
function nextPhase(p){VRS.phase=p;VRS.t0=performance.now();if(p==="vr")vrOpen();if(p==="sit")beep(330,.12,"sine",.05)}
function podEnd(){HS.position.copy(HOOK);HS.scale.set(1,1,1);HS.rotation.set(0,.4,0);P.x=FRONT.x;P.z=FRONT.z;P.fy=0;P.vy=0;P.yaw=FACE;camYaw=FACE+Math.PI-.7;camPitch=.3;camDist=5.2;camSnap=true;
  const paid=VRS.paid||0;VRS=null;W2.blaster=null;POD.lastExit={x:P.x,z:P.z,t:performance.now()};if(paid){POD.tkOut=1.6;say("Arcade Worker",paid+" tickets! Nice blasting. Prize Corner's right over here.",WK.x,2.4,WK.z);BUBW.t=performance.now()+3000}}
const _ugV=updateGame;updateGame=function(dt,now){_ugV(dt,now);const t=now/1000;
  if(AREA==="arcade"){POD.bulbs.forEach((b,i)=>b.material.emissiveIntensity=((i+Math.floor(t*8))%3===0)?2.6:.25);shellM.emissiveIntensity=.35+.2*Math.sin(t*2.2);POD.floor.material.opacity=.3+.2*Math.sin(t*3);POD.light.intensity=5+1.5*Math.sin(t*2.2);
    if(!VRS)HS.position.y=HOOK.y+Math.sin(t*1.5)*.01;if(POD.tkOut>0){POD.tkOut-=dt;POD.tickets.scale.y=Math.min(1.25,POD.tickets.scale.y+dt*.9)}else if(POD.tickets.scale.y>.35)POD.tickets.scale.y-=dt*.08}
  if(VRS&&VRS.phase!=="walk"&&ACT.hero)ACT.hero.g.visible=VRS.phase==="sit"};
let VZ=null;function visor(k){if(k<0){if(VZ){VZ.remove();VZ=null}return}if(!VZ){VZ=document.createElement("div");VZ.id="vrvisor";VZ.style.cssText="position:fixed;left:-10%;width:120%;height:100%;z-index:39;pointer-events:none";
  VZ.innerHTML=`<svg viewBox="0 0 1200 700" preserveAspectRatio="none" style="width:100%;height:100%"><defs><mask id="vm"><rect width="1200" height="700" fill="#fff"/><rect x="170" y="150" width="400" height="330" rx="140" fill="#000"/><rect x="630" y="150" width="400" height="330" rx="140" fill="#000"/></mask></defs><rect width="1200" height="700" fill="#0b0716" mask="url(#vm)"/><rect x="170" y="150" width="400" height="330" rx="140" fill="none" stroke="#2bd9ff" stroke-width="14"/><rect x="630" y="150" width="400" height="330" rx="140" fill="none" stroke="#ff2bd4" stroke-width="14"/><rect x="500" y="40" width="200" height="40" rx="20" fill="#ff2bd4"/><text x="600" y="640" fill="#bff6ff" font-family="Trebuchet MS" font-weight="900" font-size="44" text-anchor="middle">TICKET BLASTER VR</text></svg>`;document.body.appendChild(VZ)}
  VZ.style.top=(-100+100*ease(k))+"%"}
function glitch(){const g=document.createElement("div");g.id="vrglitch";g.style.cssText="position:fixed;inset:0;z-index:40;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.35) 0 2px,transparent 2px 4px),radial-gradient(circle,rgba(43,217,255,.25),rgba(10,0,30,.95) 70%);display:flex;align-items:center;justify-content:center;animation:vrg .55s steps(6) infinite";
  g.innerHTML=`<div style="font:900 clamp(26px,7vw,64px) 'Trebuchet MS',sans-serif;color:#fff;text-shadow:-4px 0 #ff2bd4,4px 0 #2bd9ff;letter-spacing:.06em;text-align:center">GOGGLES ON<br><span style="font-size:.45em;color:#bff6ff">linking to the Fraction Zone\u2026</span></div>`;document.body.appendChild(g);
  beep(220,.3,"sawtooth",.04);setTimeout(()=>beep(880,.25,"square",.03),120);setTimeout(()=>g.remove(),900)}
{const st=document.createElement("style");st.textContent=`@keyframes vrg{0%{transform:translate(0,0);filter:hue-rotate(0)}33%{transform:translate(-6px,2px);filter:hue-rotate(60deg)}66%{transform:translate(5px,-3px);filter:hue-rotate(-40deg)}100%{transform:translate(0,0)}}
@keyframes vrpop{0%{transform:translate(-50%,-50%) scale(.4);opacity:0}20%{transform:translate(-50%,-50%) scale(1.15);opacity:1}100%{transform:translate(-50%,-160%) scale(1);opacity:0}}
@keyframes vrtk{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}
@keyframes vrpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
#vrui button{font:900 18px 'Trebuchet MS',sans-serif;border:3px solid #14062a;border-radius:16px;padding:.6rem 1.1rem;cursor:pointer;touch-action:manipulation}
#vrui .vr-x{position:absolute;right:12px;width:52px;height:52px;border-radius:50%;padding:0;background:#ff4d6d;color:#fff;font-size:22px;z-index:5;pointer-events:auto}`;document.head.appendChild(st)}

/* ======================= the VR game ======================= */
const VC=document.createElement("canvas");VC.id="vrcanvas";VC.style.cssText="position:fixed;inset:0;width:100%;height:100%;z-index:30;display:none;touch-action:none;cursor:none;background:#12002a";document.body.appendChild(VC);
const UI=document.createElement("div");UI.id="vrui";UI.style.cssText="position:fixed;inset:0;z-index:31;display:none;pointer-events:none;font-family:'Trebuchet MS',sans-serif;color:#fff;overflow:hidden";document.body.appendChild(UI);
const TOP=()=>(/embed/.test(location.search)?56:0);
let VR=null,G=null;window.TBVRG={get on(){return !!(G&&G.on)},get state(){return G},get vr(){return VR}};
const _rr=R.render.bind(R);R.render=function(s,c){if(G&&G.on&&VRS&&VRS.phase==="vr")return;_rr(s,c)};
function vrInit(){if(VR)return VR;const r=new T.WebGLRenderer({canvas:VC,antialias:true});r.setPixelRatio(Math.min(2,devicePixelRatio||1));r.outputColorSpace=T.SRGBColorSpace;
  const sc=new T.Scene();sc.fog=new T.Fog(0x2a0650,30,150);
  sc.background=canvasTex(16,256,(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"#07001a");g.addColorStop(.45,"#2a0a5e");g.addColorStop(.62,"#ff2bd4");g.addColorStop(.66,"#3a0a5e");g.addColorStop(1,"#12002a");c.fillStyle=g;c.fillRect(0,0,W,H)});
  const cm=new T.PerspectiveCamera(70,1,.1,400);sc.add(cm);sc.add(new T.HemisphereLight(0xbfa8ff,0x2a0040,1.3));const dl=new T.DirectionalLight(0xffffff,1.2);dl.position.set(3,8,6);sc.add(dl);
  /* synthwave sun */const sun=new T.Mesh(new T.CircleGeometry(26,64),new T.MeshBasicMaterial({transparent:true,fog:false,map:canvasTex(512,512,(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"#ffe14d");g.addColorStop(.55,"#ff7a3d");g.addColorStop(1,"#ff2bd4");c.fillStyle=g;c.beginPath();c.arc(W/2,H/2,W/2,0,7);c.fill();c.globalCompositeOperation="destination-out";for(let i=0;i<9;i++){const y=H*.55+i*i*3.2+i*10;c.fillRect(0,y,W,4+i*1.6)}})}));sun.position.set(0,14,-160);sc.add(sun);
  /* scrolling neon grid floor */const gt=canvasTex(128,128,(c,W,H)=>{c.fillStyle="#12002a";c.fillRect(0,0,W,H);c.strokeStyle="#ff2bd4";c.lineWidth=4;c.shadowColor="#ff2bd4";c.shadowBlur=8;c.strokeRect(0,0,W,H)});gt.wrapS=gt.wrapT=T.RepeatWrapping;gt.repeat.set(60,60);
  const fl=new T.Mesh(new T.PlaneGeometry(480,480),new T.MeshBasicMaterial({map:gt}));fl.rotation.x=-Math.PI/2;fl.position.set(0,-7,-120);sc.add(fl);
  /* neon mountains */const mm=new T.MeshBasicMaterial({color:0x2bd9ff,wireframe:true,transparent:true,opacity:.55});for(let i=0;i<14;i++){const s=i%2?-1:1,m=new T.Mesh(new T.ConeGeometry(8+Math.random()*10,10+Math.random()*16,5),mm);m.position.set(s*(35+Math.random()*50),-3,-60-i*14);sc.add(m)}
  /* stars + speed streaks */const sg=new T.BufferGeometry(),sp=new Float32Array(900*3);for(let i=0;i<900;i++){sp[i*3]=(Math.random()-.5)*300;sp[i*3+1]=Math.random()*120+4;sp[i*3+2]=-Math.random()*220-20}sg.setAttribute("position",new T.BufferAttribute(sp,3));sc.add(new T.Points(sg,new T.PointsMaterial({color:0xffffff,size:.7,fog:false})));
  const kg=new T.BufferGeometry(),kp=new Float32Array(160*3);for(let i=0;i<160;i++){kp[i*3]=(Math.random()-.5)*60;kp[i*3+1]=(Math.random()-.5)*36;kp[i*3+2]=-Math.random()*120}kg.setAttribute("position",new T.BufferAttribute(kp,3));const streaks=new T.Points(kg,new T.PointsMaterial({color:0x9ff3ff,size:.25,transparent:true,opacity:.8}));sc.add(streaks);
  /* twin blasters in front of the camera */const guns=[];[-1,1].forEach(s=>{const g=new T.Group();const b=new T.Mesh(new T.BoxGeometry(.16,.14,.7),new T.MeshStandardMaterial({color:0x1a0f2e,metalness:.7,roughness:.25}));g.add(b);const bar=new T.Mesh(new T.CylinderGeometry(.035,.045,.5,12),new T.MeshStandardMaterial({color:0x2a2440,metalness:.8}));bar.rotation.x=Math.PI/2;bar.position.z=-.5;g.add(bar);
    const tip=new T.Mesh(new T.SphereGeometry(.05,12,8),new T.MeshBasicMaterial({color:s<0?0xff2bd4:0x2bd9ff}));tip.position.z=-.76;g.add(tip);const st=new T.Mesh(new T.BoxGeometry(.05,.02,.5),new T.MeshBasicMaterial({color:s<0?0xff2bd4:0x2bd9ff}));st.position.y=.08;g.add(st);
    g.position.set(s*.5,-.42,-.9);g.scale.setScalar(.75);g.userData.s=s;cm.add(g);guns.push(g)});
  VR={r,sc,cm,sun,gt,streaks,guns,fx:[],targets:[],lasers:[],ray:new T.Raycaster()};return VR}
function sizeVR(){if(!VR)return;const w=innerWidth,h=innerHeight;VR.r.setSize(w,h,false);VR.cm.aspect=w/h;VR.cm.fov=w<h?82:70;VR.cm.updateProjectionMatrix()}
addEventListener("resize",sizeVR);
function labelTex(v,col){return canvasTex(256,256,(c,W,H)=>{c.beginPath();c.arc(W/2,H/2,118,0,7);c.fillStyle="rgba(14,4,36,.88)";c.fill();c.lineWidth=12;c.strokeStyle=col;c.shadowColor=col;c.shadowBlur=24;c.stroke();c.shadowBlur=0;
  c.fillStyle="#fff";c.strokeStyle="#14062a";c.lineWidth=8;c.textAlign="center";c.textBaseline="middle";const s=String(v),m=/^(\d+)\/(\d+)$/.exec(s);
  if(m){const fs=m[1].length+m[2].length>4?62:78;c.font=`900 ${fs}px Trebuchet MS,sans-serif`;c.strokeText(m[1],W/2,H/2-46);c.fillText(m[1],W/2,H/2-46);c.fillRect(W/2-62,H/2-5,124,10);c.strokeText(m[2],W/2,H/2+50);c.fillText(m[2],W/2,H/2+50)}
  else{c.font=`900 ${s.length>2?84:104}px Trebuchet MS,sans-serif`;c.strokeText(s,W/2,H/2+4);c.fillText(s,W/2,H/2+4)}})}
const TCOL=["#2bd9ff","#ff2bd4","#6dff6b","#ffb02e"],TCOLN=[0x2bd9ff,0xff2bd4,0x6dff6b,0xffb02e];
const REACT=["\ud83d\udd25 On fire!","\ud83d\udcaf Perfect!","\u26a1 Zap!","\ud83d\ude0e Smooth!","\ud83e\udde0 Big brain!","\ud83d\ude80 Let's go!","\u2728 Clean hit!","\ud83c\udfaf Bullseye!"];
function loadSave(){try{return JSON.parse(localStorage.getItem("lu3d_tbvr")||"{}")}catch(_){return{}}}
function vrOpen(){vrInit();VC.style.display="block";UI.style.display="block";sizeVR();G={on:true,mode:"start",t:0};showStart();if(!G.raf)G.raf=requestAnimationFrame(vrLoop)}
function vrClose(){visor(-1);if(G&&G.mode==="play")finishRound(true);G.on=false;G.mode="off";VC.style.display="none";UI.style.display="none";UI.innerHTML="";stopMusic();if(VRS){VRS.phase="out";VRS.t0=performance.now()}}
function showStart(){const sv=loadSave(),rk=TBVR?TBVR.rankOf(sv.best||0):{icon:"\ud83e\udd49",name:"Bronze"};G.mode="start";
  UI.innerHTML=`<div id="vrstart" style="position:absolute;inset:0;background:linear-gradient(rgba(10,0,30,.35),rgba(10,0,30,.82)),url(img/tbvr_title.webp) center/cover;display:flex;align-items:flex-end;justify-content:center;pointer-events:auto">
  <button class="vr-x" data-vr="exit" aria-label="Take off goggles" style="top:${TOP()+10}px">\u2715</button>
  <div style="background:rgba(14,4,40,.9);border:3px solid #ff2bd4;box-shadow:0 0 30px #ff2bd4;border-radius:22px;margin:0 10px 14px;padding:14px 16px;max-width:560px;width:100%">
   <div style="font:900 clamp(24px,6.4vw,38px) 'Trebuchet MS';color:#ffe14d;text-shadow:0 0 14px #ff2bd4;line-height:1.05">\ud83e\udd7d TICKET BLASTER VR</div>
   <div style="font-weight:900;color:#bff6ff;font-size:clamp(15px,4vw,19px)">Fraction Frenzy</div>
   <div data-std style="display:inline-block;margin:.4rem 0;background:#2bd9ff;color:#14062a;border-radius:999px;padding:.15rem .7rem;font-weight:900;font-size:14px">CCSS ${VR_STD} \u00b7 Equivalent fractions</div>
   <div style="font-size:15px;line-height:1.4">\ud83c\udfaf Blast the target that matches the mission. Equal fractions = multiply the top <b>and</b> bottom by the same number.<br>\ud83d\udd25 Streaks power you up: 2\u00d7 points, slow-mo, shield. \u2b50 Shoot bonus stars!<br>\ud83c\udf9f\ufe0f The more accurate you are, the more tickets print out. 75 seconds. Go!</div>
   <div style="margin:.35rem 0;font-size:14px;color:#ffd6f3">Your rank: <b>${rk.icon} ${rk.name}</b> \u00b7 best score <b>${sv.best||0}</b> \u00b7 <span style="opacity:.8">aim with mouse/finger or arrows, click/tap/Space to blast, 1\u20134 lock on</span></div>
   <div style="display:flex;gap:10px;flex-wrap:wrap"><button data-vr="go" style="background:#6dff6b;color:#14062a;flex:1;font-size:22px;animation:vrpulse 1.2s infinite">\u25b6 START</button><button data-vr="exit" style="background:#ffd23f;color:#14062a">Take off goggles</button></div></div></div>`;
  UI.querySelectorAll("[data-vr]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();const a=b.dataset.vr;if(a==="go")startRound();else vrClose()}))}
function hudHTML(){return `<div id="vrhud" style="position:absolute;inset:0">
  <button class="vr-x" data-vr="quit" aria-label="Stop and see results" style="top:${TOP()+8}px">\u2715</button>
  <div id="vrq" style="position:absolute;left:50%;top:${TOP()+8}px;transform:translateX(-50%);width:min(92vw,640px);background:rgba(14,4,40,.86);border:3px solid #2bd9ff;box-shadow:0 0 18px #2bd9ff;border-radius:18px;padding:8px 58px 8px 12px;text-align:center;font:900 clamp(17px,4.6vw,26px) 'Trebuchet MS'"></div>
  <div id="vrstats" style="position:absolute;left:10px;top:${TOP()+86}px;font:900 16px 'Trebuchet MS';text-shadow:0 2px 0 #14062a;line-height:1.5"></div>
  <div id="vrtime" style="position:absolute;right:12px;top:${TOP()+86}px;font:900 22px 'Trebuchet MS';text-align:right;text-shadow:0 2px 0 #14062a"></div>
  <div id="vrpow" style="position:absolute;left:50%;bottom:16px;transform:translateX(-50%);font:900 15px 'Trebuchet MS';color:#6dff6b;text-shadow:0 2px 0 #14062a;white-space:nowrap"></div>
  <div id="vrmsg" style="position:absolute;left:50%;bottom:52px;transform:translateX(-50%);width:min(92vw,560px);text-align:center;font:800 16px 'Trebuchet MS';display:none;background:rgba(255,255,255,.95);color:#14062a;border-radius:14px;padding:8px 12px;border:3px solid #ff4d6d"></div>
  <div id="vrxh" style="position:absolute;width:46px;height:46px;margin:-23px 0 0 -23px;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px #2bd9ff,inset 0 0 8px #2bd9ff;left:50%;top:55%"><div style="position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px;background:#ffe14d;border-radius:50%"></div></div>
  <div id="vrflash" style="position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .25s"></div></div>`}
function startRound(){if(!window.TBVR){setTimeout(startRound,150);return}const sv=loadSave();
  Object.assign(G,{mode:"play",t0:performance.now(),time:75,left:75,score:0,correct:0,attempts:0,combo:0,best:0,lvSum:0,lv:Math.max(1,Math.min(6,(sv.lv||1))),streakUp:0,wrongQ:0,wrongRun:0,missRun:0,
    pow:{dbl:0,slow:0,shield:0},rank:TBVR.RANKS[0],log:[],bonus:0,paused:false,aim:{x:innerWidth/2,y:innerHeight*.55},keys:{},shake:0,starT:6+Math.random()*6,qn:0});
  UI.innerHTML=hudHTML();UI.querySelector("[data-vr=quit]").addEventListener("click",e=>{e.stopPropagation();finishRound(false)});startMusic();nextQ();beep(660,.1,"triangle",.06)}
function nextQ(same){if(!same){G.q=TBVR.gen(G.lv);G.qn++;G.wrongQ=0;G.firstTry=true}spawnWave();
  const q=G.q;UI.querySelector("#vrq").innerHTML=q.q.replace(/(\d+\/\d+|\?\/\d+|\d+\/\?)/g,'<span style="color:#ffe14d;font-size:1.2em">$1</span>')+`<div style="font:800 12px 'Trebuchet MS';color:#bff6ff;margin-top:2px">${TBVR.LEVELS[q.lv].label} \u00b7 Level ${q.lv} \u00b7 ${VR_STD}</div>`}
function clearTargets(){VR.targets.forEach(t=>VR.sc.remove(t.g));VR.targets=[]}
function spawnWave(){clearTargets();const port=innerWidth<innerHeight,q=G.q;
  const slots=port?[[-2.4,3.2],[2.4,1.4],[-2.4,-.6],[2.4,-2.4]]:[[-7.2,1.9],[-2.4,-.9],[2.4,1.8],[7.2,-.7]];
  q.ch.forEach((v,i)=>{const g=new T.Group(),col=TCOLN[i];const ring=new T.Mesh(new T.TorusGeometry(1.25,.12,10,40),new T.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:1.6,metalness:.3}));g.add(ring);
    const ring2=new T.Mesh(new T.TorusGeometry(1.5,.04,6,40),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5}));g.add(ring2);
    const sp=new T.Sprite(new T.SpriteMaterial({map:labelTex(v,TCOL[i]),depthWrite:false}));sp.scale.set(2.3,2.3,1);g.add(sp);
    const badge=new T.Sprite(new T.SpriteMaterial({map:canvasTex(64,64,(c,W)=>{c.fillStyle=TCOL[i];c.beginPath();c.arc(32,32,30,0,7);c.fill();c.fillStyle="#14062a";c.font="900 40px Trebuchet MS";c.textAlign="center";c.textBaseline="middle";c.fillText(String(i+1),32,34)}),depthWrite:false}));badge.scale.set(.6,.6,1);badge.position.set(1.2,1.2,.1);g.add(badge);
    const [bx,by]=slots[i];const z=-22-i*1.5;g.position.set(bx,by,z);VR.sc.add(g);VR.targets.push({g,ring,ring2,v,ok:String(v)===String(q.a),bx,by,z,ph:Math.random()*6,alive:true,i})})}
function speed(){return (2.1+G.lv*.3)*(G.pow.slow>0?.45:1)}
function worldToScreen(p){const v=p.clone().project(VR.cm);return{x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight,front:v.z<1}}
function fireAt(x,y){if(!G||G.mode!=="play"||G.paused)return;G.aim.x=x;G.aim.y=y;const nd=new T.Vector2(x/innerWidth*2-1,-(y/innerHeight)*2+1);VR.ray.setFromCamera(nd,VR.cm);
  let best=null,bd=1e9;const touch=matchMedia("(pointer:coarse)").matches;for(const t of VR.targets.concat(G.star?[G.star]:[])){if(!t.alive)continue;const c=t.g.position,d=VR.ray.ray.distanceToPoint(c),r=(t.star?1.3:1.55)*(touch?1.25:1);if(d<r){const dist=c.distanceTo(VR.cm.position);if(dist<bd){bd=dist;best=t}}}
  const hit=best?best.g.position.clone():VR.ray.ray.at(60,new T.Vector3());laser(hit);if(best){if(best.star)hitStar(best);else hitTarget(best)}}
function laser(to){VR.guns.forEach(g=>{const from=new T.Vector3(g.userData.s*.5,-.42,-1.5).applyMatrix4(VR.cm.matrixWorld);const geo=new T.BufferGeometry().setFromPoints([from,to]);const l=new T.Line(geo,new T.LineBasicMaterial({color:g.userData.s<0?0xff2bd4:0x2bd9ff,transparent:true}));VR.sc.add(l);VR.lasers.push({l,t:.14});g.position.z=-.8});beep(1200,.06,"square",.03)}
function burst(pos,cols,n=60,spd=14){const geo=new T.BufferGeometry(),p=new Float32Array(n*3),vel=[],c=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=pos.x;p[i*3+1]=pos.y;p[i*3+2]=pos.z;const v=new T.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(spd*(.4+Math.random()*.8));vel.push(v);const cc=new T.Color(cols[i%cols.length]);c[i*3]=cc.r;c[i*3+1]=cc.g;c[i*3+2]=cc.b}
  geo.setAttribute("position",new T.BufferAttribute(p,3));geo.setAttribute("color",new T.BufferAttribute(c,3));const pts=new T.Points(geo,new T.PointsMaterial({size:.35,vertexColors:true,transparent:true}));VR.sc.add(pts);
  const sw=new T.Mesh(new T.TorusGeometry(1,.06,6,40),new T.MeshBasicMaterial({color:cols[0],transparent:true}));sw.position.copy(pos);VR.sc.add(sw);VR.fx.push({pts,vel,sw,t:0})}
function pop(text,x,y,col="#ffe14d",size=34){const d=document.createElement("div");d.textContent=text;d.style.cssText=`position:absolute;left:${x}px;top:${y}px;font:900 ${size}px 'Trebuchet MS';color:${col};text-shadow:0 3px 0 #14062a,0 0 16px ${col};white-space:nowrap;pointer-events:none;animation:vrpop 1.1s ease-out forwards`;UI.appendChild(d);setTimeout(()=>d.remove(),1150)}
function flash(col){const f=UI.querySelector("#vrflash");if(!f)return;f.style.background=col;f.style.opacity=".55";setTimeout(()=>f.style.opacity="0",120)}
function msg(t,ms=3500,good){const m=UI.querySelector("#vrmsg");if(!m)return;m.textContent=t;m.style.borderColor=good?"#6dff6b":"#ff4d6d";m.style.display="block";clearTimeout(G.msgT);G.msgT=setTimeout(()=>m.style.display="none",ms)}
function hitTarget(t){const q=G.q,sp=worldToScreen(t.g.position);t.alive=false;VR.sc.remove(t.g);G.attempts++;
  if(t.ok){G.correct++;G.combo++;G.best=Math.max(G.best,G.combo);G.lvSum+=q.lv;const dbl=G.pow.dbl>0;if(dbl)G.pow.dbl--;const pts=TBVR.points(q.lv,G.combo,dbl);G.score+=pts;G.wrongRun=0;G.missRun=0;
    G.log.push({lv:q.lv,core:q.core,ok:G.firstTry,why:null,q:q.q});burst(t.g.position,["#ffe14d","#6dff6b","#2bd9ff","#ff2bd4"],90,16);G.shake=.25;
    pop("+"+pts+(dbl?" (2\u00d7)":""),sp.x,sp.y,"#6dff6b");pop(REACT[Math.floor(Math.random()*REACT.length)],innerWidth/2,innerHeight*.42,"#ffe14d",Math.min(44,innerWidth/11));
    [660,880,1100].forEach((f,i)=>setTimeout(()=>beep(f,.09,"triangle",.06),i*70));tickBurst(sp.x,sp.y,4);
    if(G.combo===3){G.pow.dbl=3;banner("\ud83d\udd25 x3 COMBO \u2014 2\u00d7 POINTS!")}else if(G.combo===5){G.pow.slow=8;banner("\ud83d\udc22 x5 UNSTOPPABLE \u2014 SLOW-MO!")}else if(G.combo===8){G.pow.shield=1;banner("\ud83d\udee1\ufe0f x8 LEGENDARY \u2014 SHIELD!")}else if(G.combo>8&&G.combo%4===0)banner("\ud83c\udf1f x"+G.combo+" COMBO!");
    const nr=TBVR.rankOf(G.score);if(nr.id!==G.rank.id){G.rank=nr;setTimeout(()=>banner("RANK UP! "+nr.icon+" "+nr.name.toUpperCase()),500);[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.14,"square",.04),500+i*110))}
    if(G.firstTry){G.streakUp++;if(G.streakUp>=2){G.streakUp=0;if(G.lv<6){G.lv++;setTimeout(()=>pop("\u2b06\ufe0f Level "+G.lv,innerWidth/2,innerHeight*.3,"#2bd9ff",28),300)}}}else G.streakUp=0;
    setTimeout(()=>{if(G.mode==="play")nextQ()},380)}
  else{G.firstTry&&G.log.push({lv:q.lv,core:q.core,ok:false,why:q.why[String(t.v)]||q.hint,q:q.q});G.firstTry=false;G.wrongQ++;G.wrongRun++;G.streakUp=0;
    burst(t.g.position,["#ff4d6d","#ff9a9a"],50,10);G.shake=.55;flash("radial-gradient(circle,transparent 40%,rgba(255,40,80,.85))");beep(150,.28,"sawtooth",.06);
    if(G.pow.shield){G.pow.shield=0;banner("\ud83d\udee1\ufe0f Shield saved your combo!")}else{G.combo=0;pop("combo reset",sp.x,sp.y,"#ff9a9a",22)}
    msg("Not quite! "+(q.why[String(t.v)]||q.hint),4200);
    if(G.wrongQ>=2||G.wrongRun>=3){G.lv=Math.max(1,G.lv-1);setTimeout(()=>reteachCard(),500)}
    else if(!VR.targets.some(x=>x.alive&&x.ok))nextQ(true)}}
function hitStar(s){s.alive=false;VR.sc.remove(s.g);G.star=null;G.bonus+=3;G.score+=15;const sp=worldToScreen(s.g.position);burst(s.g.position,["#ffe14d","#fff"],70,14);pop("\u2b50 +15 \u00b7 +3 \ud83c\udf9f\ufe0f",sp.x,sp.y,"#ffe14d",28);beep(1500,.12,"triangle",.05);tickBurst(sp.x,sp.y,3)}
function tickBurst(x,y,n){for(let i=0;i<n;i++){const d=document.createElement("div");d.textContent="\ud83c\udf9f\ufe0f";d.style.cssText=`position:absolute;left:${x}px;top:${y}px;font-size:26px;pointer-events:none;--dx:${(-x+40+Math.random()*30)}px;--dy:${(-y+TOP()+110+Math.random()*20)}px;--r:${Math.random()*720-360}deg;animation:vrtk ${.7+Math.random()*.3}s ease-in forwards`;UI.appendChild(d);setTimeout(()=>d.remove(),1100)}}
function banner(t){pop(t,innerWidth/2,innerHeight*.56,"#ffe14d",Math.min(40,innerWidth/13))}
function reteachCard(){G.paused=true;G.pauseAt=performance.now();clearTargets();const q=G.q,rt=TBVR.reteach(q);const card=document.createElement("div");card.id="vrreteach";
  card.style.cssText="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(10,0,30,.6);pointer-events:auto";
  card.innerHTML=`<div style="background:#fff8e8;color:#14062a;border:4px solid #2bd9ff;border-radius:20px;padding:14px 16px;width:min(92vw,520px);text-align:center"><div style="font:900 22px 'Trebuchet MS'">\ud83e\udde0 Quick reteach \u2014 no penalty!</div><canvas width="480" height="170" style="width:100%;max-width:480px"></canvas><div style="font:800 16px 'Trebuchet MS';line-height:1.35">${rt.lines.join("<br>")}</div><button data-vr="ok" style="margin-top:10px;background:#6dff6b;color:#14062a">Got it \u2014 back to blasting! \ud83d\ude80</button></div>`;
  UI.appendChild(card);const c=card.querySelector("canvas").getContext("2d");rt.rows.forEach((row,ri)=>{const y=18+ri*80,x0=70,w=390;c.font="900 22px Trebuchet MS";c.fillStyle="#14062a";c.textAlign="right";c.textBaseline="middle";c.fillText(row.label,x0-10,y+25);for(let i=0;i<row.parts;i++){c.fillStyle=i<row.shade?(ri?"#ff2bd4":"#2bd9ff"):"#efe6d2";c.fillRect(x0+i*w/row.parts,y,w/row.parts,50);c.strokeStyle="#14062a";c.lineWidth=2;c.strokeRect(x0+i*w/row.parts,y,w/row.parts,50)}});
  try{speak(rt.lines.join(" ").replace(/(\d+)\/(\d+)/g,"$1 over $2"))}catch(_){}
  card.querySelector("button").addEventListener("click",e=>{e.stopPropagation();card.remove();G.paused=false;G.t0+=performance.now()-G.pauseAt;G.wrongQ=0;G.wrongRun=0;G.reteaches=(G.reteaches||0)+1;nextQ(true)})}
function finishRound(silent){if(!G||G.mode!=="play")return;G.mode="results";stopMusic();clearTargets();if(G.star){VR.sc.remove(G.star.g);G.star=null}
  const pay=TBVR.payout(G.correct,G.attempts,G.best,G.lvSum),tickets=pay.tickets+(G.correct?G.bonus:0);G.tickets=tickets;TIX.n=TIX.n+tickets;if(VRS)VRS.paid=(VRS.paid||0)+tickets;
  const sv=loadSave(),nb=G.score>(sv.best||0);sv.best=Math.max(sv.best||0,G.score);sv.lv=G.lv;sv.plays=(sv.plays||0)+1;localStorage.setItem("lu3d_tbvr",JSON.stringify(sv));
  /* mastery evidence: first try on each question -> the fractions skill (4.NF.A.1) in the learning record */
  G.log.slice(-10).forEach(e=>{try{parent.postMessage({lv3d:"skillres",src:"street",sk:"fractions",lv:e.core,tries:e.ok?1:2,why:e.why,ms:0,xp:4},"*")}catch(_){}});G.sent=Math.min(10,G.log.length);
  if(silent)return;const rk=TBVR.rankOf(G.score),acc=Math.round(pay.acc*100);
  UI.innerHTML=`<div id="vrres" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(58,10,106,.85),rgba(10,0,30,.95));pointer-events:auto">
  <button class="vr-x" data-vr="exit" aria-label="Take off goggles" style="top:${TOP()+10}px">\u2715</button>
  <div style="text-align:center;width:min(92vw,520px)"><div style="font:900 clamp(30px,8vw,48px) 'Trebuchet MS';color:#ffe14d;text-shadow:0 0 18px #ff2bd4">ROUND COMPLETE!</div>
   <div style="font-size:64px;line-height:1.1;animation:vrpulse 1s infinite">${rk.icon}</div><div style="font:900 24px 'Trebuchet MS'">${rk.name} rank${nb?' \u00b7 <span style="color:#6dff6b">NEW BEST!</span>':""}</div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0;font:800 17px 'Trebuchet MS'">
    <div style="background:rgba(255,255,255,.1);border-radius:12px;padding:8px">\u2705 ${G.correct} right</div><div style="background:rgba(255,255,255,.1);border-radius:12px;padding:8px">\ud83c\udfaf ${acc}% accuracy</div>
    <div style="background:rgba(255,255,255,.1);border-radius:12px;padding:8px">\ud83d\udd25 best combo ${G.best}</div><div style="background:rgba(255,255,255,.1);border-radius:12px;padding:8px">\u26a1 ${G.score} points</div></div>
   <div id="vrtix" style="font:900 30px 'Trebuchet MS';color:#ff9a3d;text-shadow:0 0 12px #ff5a00">+0 \ud83c\udf9f\ufe0f tickets</div>
   <div style="font-size:14px;color:#ffd6f3;margin:.2rem 0 .7rem">${acc>=90?"Sharp shooting! Accuracy doubled your tickets.":acc>=75?"Great aim! Accuracy gave you 1.5\u00d7 tickets.":G.correct?"Every right answer prints tickets. Aim for 75%+ to boost them!":"Warm-up round! Multiply the top and bottom by the same number, then blast."}</div>
   <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button data-vr="again" style="background:#6dff6b;color:#14062a">\ud83d\udd01 Play again</button><button data-vr="exit" style="background:#ffd23f;color:#14062a">\ud83e\udd7d Take off goggles</button></div></div></div>`;
  UI.querySelectorAll("[data-vr]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();if(b.dataset.vr==="again")startRound();else vrClose()}));
  let n=0;const el=UI.querySelector("#vrtix"),step=Math.max(1,Math.ceil(tickets/30)),iv=setInterval(()=>{n=Math.min(tickets,n+step);if(el)el.textContent="+"+n+" \ud83c\udf9f\ufe0f tickets";beep(900+(n%5)*60,.03,"square",.025);if(n>=tickets)clearInterval(iv)},40);
  for(let i=0;i<Math.min(18,tickets);i++)setTimeout(()=>tickBurst(innerWidth/2,innerHeight*.62,1),i*60)}
/* bonus star */
function spawnStar(){const g=new T.Group();const shape=new T.Shape();for(let i=0;i<10;i++){const r=i%2?.45:1,a=i/10*Math.PI*2+Math.PI/2;i?shape.lineTo(Math.cos(a)*r,Math.sin(a)*r):shape.moveTo(Math.cos(a)*r,Math.sin(a)*r)}
  const m=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.25,bevelEnabled:false}),new T.MeshStandardMaterial({color:0xffe14d,emissive:0xffb000,emissiveIntensity:1.4}));g.add(m);const s=Math.random()<.5?-1:1;g.position.set(s*14,3+Math.random()*2,-30);VR.sc.add(g);G.star={g,star:true,alive:true,vx:-s*5.5}}
/* music: a small synth arpeggio loop */
let MUS=null;function startMusic(){stopMusic();const notes=[220,277,330,440,330,277,247,311,370,494,370,311];let i=0;MUS=setInterval(()=>{if(G&&!G.paused){beep(notes[i%notes.length],.12,"triangle",.018);if(i%4===0)beep(notes[i%notes.length]/2,.2,"sine",.03)}i++},150)}
function stopMusic(){if(MUS){clearInterval(MUS);MUS=null}}
/* input */
VC.addEventListener("pointermove",e=>{if(G&&G.mode==="play"){G.aim.x=e.clientX;G.aim.y=e.clientY}});
VC.addEventListener("pointerdown",e=>{e.preventDefault();if(!G||G.mode!=="play"||G.paused)return;fireAt(e.clientX,e.clientY)});
UI.addEventListener("pointermove",e=>{if(G&&G.mode==="play"){G.aim.x=e.clientX;G.aim.y=e.clientY}});
function vrKeys(e){const k=e.key;if(!G||!G.on){if(e.key==="Escape"&&VRS&&VRS.phase!=="out"&&VRS.phase!=="vr"){}return true}
  if(G.mode==="start"){if(k==="Enter"||k===" "){e.preventDefault();startRound()}if(k==="Escape")vrClose();return true}
  if(G.mode==="results"){if(k==="Enter"||k===" "){e.preventDefault();startRound()}if(k==="Escape")vrClose();return true}
  if(G.paused){if(k==="Enter"||k===" "){e.preventDefault();const b=UI.querySelector("#vrreteach button");if(b)b.click()}return true}
  if(k==="Escape"){finishRound(false);return true}
  const kl=k.toLowerCase();if(["arrowleft","arrowright","arrowup","arrowdown","a","d","w","s"].includes(kl)){G.keys[kl]=true;e.preventDefault()}
  if(k===" "||k==="Enter"){e.preventDefault();fireAt(G.aim.x,G.aim.y)}
  const n=+k;if(n>=1&&n<=4){const t=VR.targets.find(x=>x.i===n-1&&x.alive);if(t){const sp=worldToScreen(t.g.position);fireAt(sp.x,sp.y)}}return true}
addEventListener("keyup",e=>{if(G&&G.keys)G.keys[e.key.toLowerCase()]=false});
const _okV=window.OVERLAY_KEYS;window.OVERLAY_KEYS=e=>{if(W2.blaster&&W2.blaster.vr){vrKeys(e);return true}return _okV?_okV(e):false};
/* main VR loop */
function vrLoop(now){G.raf=requestAnimationFrame(vrLoop);if(!G.on){cancelAnimationFrame(G.raf);G.raf=0;return}const dt=Math.min(.05,(now-(G.last||now))/1000);G.last=now;const t=now/1000;
  const cm=VR.cm;VR.gt.offset.y+=dt*(G.mode==="play"?1.6:.5)*(G.pow&&G.pow.slow>0?.45:1);VR.sun.material.opacity=1;
  {const a=VR.streaks.geometry.attributes.position;for(let i=0;i<a.count;i++){let z=a.getZ(i)+dt*(G.mode==="play"?45:15);if(z>2)z=-120;a.setZ(i,z)}a.needsUpdate=true}
  if(G.mode==="play"&&!G.paused){G.left=Math.max(0,G.time-(now-G.t0)/1000);if(G.left<=0){finishRound(false)}
    const ks=G.keys,sp=innerWidth*.9*dt;if(ks.arrowleft||ks.a)G.aim.x-=sp;if(ks.arrowright||ks.d)G.aim.x+=sp;if(ks.arrowup||ks.w)G.aim.y-=sp;if(ks.arrowdown||ks.s)G.aim.y+=sp;G.aim.x=Math.max(0,Math.min(innerWidth,G.aim.x));G.aim.y=Math.max(TOP(),Math.min(innerHeight,G.aim.y));
    if(G.pow.slow>0)G.pow.slow-=dt;const v=speed();let passed=false;
    VR.targets.forEach(tg=>{if(!tg.alive)return;tg.z+=v*dt;const w=Math.sin(t*1.3+tg.ph);tg.g.position.set(tg.bx+w*.9,tg.by+Math.cos(t*1.1+tg.ph)*.5,tg.z);tg.ring.rotation.z+=dt*1.5;tg.ring2.rotation.z-=dt*.8;tg.ring2.scale.setScalar(1+.06*Math.sin(t*6+tg.i));if(tg.z>-4.5)passed=true});
    if(passed&&G.mode==="play"){G.combo=0;G.firstTry&&G.log.push({lv:G.q.lv,core:G.q.core,ok:false,why:"too slow",q:G.q.q});G.firstTry=false;G.missRun++;msg("Too slow! Here they come again \ud83d\udd01 "+G.q.hint,3500);beep(200,.2,"sine",.05);if(G.missRun>=2){G.missRun=0;reteachCard()}else nextQ(true)}
    G.starT-=dt;if(G.starT<=0&&!G.star){spawnStar();G.starT=14+Math.random()*8}if(G.star){G.star.g.position.x+=G.star.vx*dt;G.star.g.rotation.y+=dt*4;if(Math.abs(G.star.g.position.x)>16){VR.sc.remove(G.star.g);G.star=null}}
    const st=UI.querySelector("#vrstats");if(st)st.innerHTML=`\u26a1 ${G.score}<br>\ud83d\udd25 x${G.combo}<br>${G.rank.icon} ${G.rank.name}`;
    const tm=UI.querySelector("#vrtime");if(tm){tm.innerHTML=`\u23f1 ${Math.ceil(G.left)}s<br><span style="font-size:15px">\u2705 ${G.correct}</span>`;tm.style.color=G.left<10?"#ff4d6d":"#fff"}
    const pw=UI.querySelector("#vrpow");if(pw)pw.textContent=[G.pow.dbl>0?"2\u00d7 POINTS ("+G.pow.dbl+")":"",G.pow.slow>0?"\ud83d\udc22 SLOW-MO":"",G.pow.shield?"\ud83d\udee1\ufe0f SHIELD":""].filter(Boolean).join("  \u00b7  ");
    const xh=UI.querySelector("#vrxh");if(xh){xh.style.left=G.aim.x+"px";xh.style.top=G.aim.y+"px"}}
  /* camera sway toward the aim + screen shake */
  const ax=G.aim?(G.aim.x/innerWidth-.5):0,ay=G.aim?(G.aim.y/innerHeight-.5):0;G.shake=Math.max(0,(G.shake||0)-dt*1.6);const sh=G.shake;
  cm.position.set((Math.random()-.5)*sh,(Math.random()-.5)*sh,0);cm.rotation.set(-ay*.12+Math.sin(t*.7)*.01,-ax*.16,Math.sin(t*.5)*.01);
  VR.guns.forEach(g=>{g.position.z+=(-.9-g.position.z)*Math.min(1,dt*12);g.rotation.y=-ax*.3*g.userData.s*.2;g.rotation.x=-ay*.2});
  VR.lasers=VR.lasers.filter(L=>{L.t-=dt;L.l.material.opacity=Math.max(0,L.t/.14);if(L.t<=0){VR.sc.remove(L.l);return false}return true});
  VR.fx=VR.fx.filter(f=>{f.t+=dt;const a=f.pts.geometry.attributes.position;for(let i=0;i<a.count;i++){const v=f.vel[i];a.setXYZ(i,a.getX(i)+v.x*dt,a.getY(i)+v.y*dt,a.getZ(i)+v.z*dt);v.multiplyScalar(.96)}a.needsUpdate=true;f.pts.material.opacity=Math.max(0,1-f.t/.9);f.sw.scale.setScalar(1+f.t*8);f.sw.material.opacity=Math.max(0,1-f.t/.5);if(f.t>.9){VR.sc.remove(f.pts);VR.sc.remove(f.sw);return false}return true});
  VR.r.render(VR.sc,cm)}
Object.assign(window.TBVRG,{fireAt,worldToScreen,start:podStart,startRound,finishRound,close:vrClose,
  targets:()=>VR?VR.targets.filter(x=>x.alive).map(x=>Object.assign({v:x.v,ok:x.ok,i:x.i},worldToScreen(x.g.position))):[],
  timeLeft:s=>{if(G&&G.mode==="play")G.t0=performance.now()-(G.time-s)*1000}});
Object.defineProperty(window.TBVRG,"phase",{get(){return VRS?VRS.phase:null}});
})();

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
W2.followFix=true;let FADE=1;function heroFade(a){const H=ACT.hero;if(!H||Math.abs(a-FADE)<.01&&!(a<1&&!H.g.userData.fadeMats))return;FADE=a;
  H.g.traverse(o=>{if(!o.isMesh||!o.material)return;if(!o.userData.fadeMat){o.userData.fadeMat=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();o.userData.origMat=o.material}
    if(a>=.999){o.material=o.userData.origMat}else{o.material=o.userData.fadeMat;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.transparent=true;m.opacity=a;m.depthWrite=a>.6})}});H.g.userData.fadeMats=1}
const _ugL=updateGame;updateGame=function(dt,now){_ugL(dt,now);try{clawTick()}catch(e){CA.on=false}
  let fade=1;if(W2.followFix&&W2.camFree&&AREA==="arcade"&&camDist>1.3&&!W2.ui&&!QG){const hy=P.y+1.75,head=new T.Vector3(P.x,hy,P.z),base=cam.position.clone(),R0=ROOMS.arcade;
    const fwd=new T.Vector3(P.x-base.x,0,P.z-base.z);const fl=fwd.length();if(fl>.05){fwd.multiplyScalar(1/fl);const right=new T.Vector3(-fwd.z,0,fwd.x);
      const near=Math.max(0,1-(head.distanceTo(base)-.6)/2.4);/* the closer the camera is pushed in, the more it lifts and slides over the shoulder */
      const up=Math.min(.75*near+.25,(R0.h||5.6)-.4-base.y),side=.38+.3*near;const p=base.clone().addScaledVector(right,side);p.y+=Math.max(0,up);
      const x0=R0.cx-(R0.w||18)/2+.35,x1=R0.cx+(R0.w||18)/2-.35,z0=R0.cz-(R0.d||16)/2+.35,z1=R0.cz+(R0.d||16)/2-.35;p.x=Math.min(x1,Math.max(x0,p.x));p.z=Math.min(z1,Math.max(z0,p.z));
      cam.position.copy(p);cam.lookAt(head.x+fwd.x*3.2+right.x*side,hy-.15-near*.35,head.z+fwd.z*3.2+right.z*side);CA.restore=base;
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

/* =====================================================================
   17. LEVEL UP UNIVERSE — fine 3D detail + "interact with everything"
   Core: merged-geometry kit (few draw calls), rounded/bevelled parts, shared materials, colliders,
   per-frame animations, a light quiz card for optional grade-4 math moments, and a flat-panel audit.
   ===================================================================== */
const U={anims:[],taps:[],flatOK:new WeakSet(),built:{}};window.U=U;
/*UQ-BEGIN — pure question generators (checked by tools/verify_universe.js: 0 math errors) */
const UQ=(()=>{
  const rng=s=>()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648};
  const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1));
  const money=c=>"$"+Math.floor(c/100)+"."+String(c%100).padStart(2,"0");
  const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,",");
  const pack=(r,id,std,text,ans,wrong,explain,p)=>{const ch=[String(ans)];for(const w of wrong){const s=String(w);if(!ch.includes(s)&&ch.length<4)ch.push(s)}
    let k=1;while(ch.length<4){const s=typeof ans==="number"?String(ans+k*(k%2?1:-1)*(1+Math.floor(k/2))):String(ans)+" ";if(!ch.includes(s)&&!(typeof ans==="number"&&+s<0))ch.push(s);k++}
    for(let i=ch.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[ch[i],ch[j]]=[ch[j],ch[i]]}return {id,std,text,ans:String(ans),choices:ch,explain,p}};
  const G={
    mult(s){const r=rng(s),a=ri(r,3,9),b=ri(r,3,9),x=a*b;return pack(r,"mult","4.NBT.B.5",`The crumpled worksheet says ${a} × ${b} = ?`,x,[a+b,x+a,x-b],`${a} groups of ${b} make ${x}.`,{a,b})},
    hydrant(s){const r=rng(s),g=ri(r,2,9),t=ri(r,4,9),x=g*t;return pack(r,"hydrant","4.OA.A.2",`The hydrant sprays ${g} gallons every second. How many gallons in ${t} seconds?`,x,[g+t,x+g,x-t],`${t} seconds × ${g} gallons = ${x} gallons.`,{g,t})},
    fruit(s){const r=rng(s),c=5*ri(r,5,19),n=ri(r,2,4),x=c*n;return pack(r,"fruit","4.MD.A.2",`Apples cost ${c}¢ each. How much for ${n} apples?`,money(x),[money(c+n),money(x+c),money(x-5)],`${n} × ${c}¢ = ${x}¢ = ${money(x)}.`,{c,n})},
    round(s){const r=rng(s),v=ri(r,1101,9899),h=Math.round(v/100)*100;return pack(r,"round","4.NBT.A.3",`HEADLINE: ${fmt(v)} kids rode the subway today! Round ${fmt(v)} to the nearest hundred.`,fmt(h),[fmt(h+100),fmt(h-100),fmt(Math.round(v/10)*10),fmt(Math.round(v/1000)*1000),fmt(h+200)],`Look at the tens digit: ${fmt(v)} is closer to ${fmt(h)} than to any other hundred.`,{v})},
    train(s){const r=rng(s),m=[4,5,6,10,12,15][ri(r,0,5)],x=60/m;return pack(r,"train","4.OA.A.2",`A train comes every ${m} minutes. How many trains come in 1 hour (60 minutes)?`,x,[60-m,x+1,m],`60 ÷ ${m} = ${x} trains.`,{m})},
    shop(s){const r=rng(s),a=ri(r,21,59),b=ri(r,8,19),x=a+b;return pack(r,"shop","4.NBT.B.4",`A jacket costs $${a} and a hat costs $${b}. How much for both?`,"$"+x,["$"+(x+10),"$"+(x-10),"$"+(a-b)],`$${a} + $${b} = $${x}.`,{a,b})},
    pizza(s){const r=rng(s),k=ri(r,1,7),x=(8-k)+"/8";return pack(r,"pizza","4.NF.A.1",`A pizza has 8 equal slices. ${k} slice${k>1?"s are":" is"} eaten. What fraction is left?`,x,[k+"/8",(8-k)+"/"+k,"8/"+(8-k),(9-k)+"/8",(7-k)+"/8"],`8 − ${k} = ${8-k} slices are left out of 8, so ${x}.`,{k})},
    clock(s){const r=rng(s),h=ri(r,1,11),m=5*ri(r,0,11),add=[15,20,30,45][ri(r,0,3)],t=h*60+m+add,H=Math.floor(t/60)>12?Math.floor(t/60)-12:Math.floor(t/60),M=t%60;const f=(a,b)=>a+":"+String(b).padStart(2,"0");
      return pack(r,"clock","4.MD.A.2",`The clock says ${f(h,m)}. Recess starts in ${add} minutes. What time is recess?`,f(H,M),[f(h,(m+add)%60),f(H,(M+10)%60),f(H,(M+50)%60),f(h===12?1:h+1,m),f(H===12?1:H+1,M)],`${f(h,m)} + ${add} minutes = ${f(H,M)}.`,{h,m,add})},
    meters(s){const r=rng(s),m=ri(r,2,9),x=m*100;return pack(r,"meters","4.MD.A.1",`This bench is ${m} meters long. How many centimeters is that?`,x,[m*10,m*1000,m+100],`1 meter = 100 cm, so ${m} × 100 = ${x} cm.`,{m})},
    lamps(s){const r=rng(s),n=ri(r,6,12),sides=2,x=n*sides;return pack(r,"lamps","4.OA.A.1",`There are ${n} street lamps on each side of the street. How many lamps in all?`,x,[n+sides,n,x+2],`${n} × 2 sides = ${x} lamps.`,{n})},
    shirts(s){const r=rng(s),st=ri(r,3,6),per=ri(r,4,8),x=st*per;return pack(r,"shirts","4.NBT.B.5",`Mr. Sal folds ${st} stacks with ${per} shirts in each. How many shirts?`,x,[st+per,x+per,x-st],`${st} × ${per} = ${x} shirts.`,{st,per})},
    books(s){const r=rng(s),sh=ri(r,3,5),per=ri(r,6,12),x=sh*per;return pack(r,"books","4.NBT.B.5",`The bookshelf has ${sh} shelves with ${per} books on each. How many books?`,x,[sh+per,x-per,x+sh],`${sh} × ${per} = ${x} books.`,{sh,per})},
    share(s){const r=rng(s),k=ri(r,2,6),each=ri(r,3,9),x=k*each;return pack(r,"share","4.NBT.B.6",`${x} grapes are shared equally by ${k} friends. How many does each friend get?`,each,[x-k,each+1,k],`${x} ÷ ${k} = ${each}.`,{k,each})}
  };return {G,money,fmt}})();
/*UQ-END*/
window.UQ=UQ;
/* ---------- shared materials (one material per look = fewer shader switches) ---------- */
const UMC={};function UM(c,o){const k=c+"|"+(o?JSON.stringify(o):"");return UMC[k]||(UMC[k]=M(c,o||{}))}
const GLASS=new T.MeshStandardMaterial({color:0xcfe9ff,transparent:true,opacity:.22,roughness:.05,metalness:.2,depthWrite:false});
/* rounded / bevelled box (extruded rounded rectangle), cached by size */
const RBC={};function rbox(w,h,d,r){r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);const k=[w,h,d,r].map(v=>v.toFixed(3)).join();if(RBC[k])return RBC[k];
  const s=new T.Shape(),x=-w/2+r,y=-h/2+r,W=w-2*r,H=h-2*r;s.moveTo(x,y-r);s.lineTo(x+W,y-r);s.quadraticCurveTo(x+W+r,y-r,x+W+r,y);s.lineTo(x+W+r,y+H);s.quadraticCurveTo(x+W+r,y+H+r,x+W,y+H+r);s.lineTo(x,y+H+r);s.quadraticCurveTo(x-r,y+H+r,x-r,y+H);s.lineTo(x-r,y);s.quadraticCurveTo(x-r,y-r,x,y-r);
  const g=new T.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r*.999,bevelSegments:2,curveSegments:3});g.translate(0,0,-(d-2*r)/2);return RBC[k]=g}
const GC={};const bx=(w,h,d)=>GC["b"+w+","+h+","+d]||(GC["b"+w+","+h+","+d]=new T.BoxGeometry(w,h,d));
const cy=(a,b,h,s=16,open=false)=>{const k="c"+[a,b,h,s,open];return GC[k]||(GC[k]=new T.CylinderGeometry(a,b,h,s,1,open))};
const sp=(r,s=12)=>GC["s"+r+","+s]||(GC["s"+r+","+s]=new T.SphereGeometry(r,s,Math.max(6,s*.75|0)));
const ico=(r,d=1)=>GC["i"+r+","+d]||(GC["i"+r+","+d]=new T.IcosahedronGeometry(r,d));
const tor=(R,r,a=8,b=20)=>GC["t"+[R,r,a,b]]||(GC["t"+[R,r,a,b]]=new T.TorusGeometry(R,r,a,b));
/* merge kit: add many parts in local space (optionally under a parent transform), build = one mesh per material */
function Kit(){const by=new Map();let base=new T.Matrix4();const tmp=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),sc=new T.Vector3();
  const K2={base(m){base=m||new T.Matrix4();return K2},
    add(geo,mat,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1){q.setFromEuler(e.set(rx,ry,rz));tmp.compose(v.set(x,y,z),q,sc.set(sx,sy,sz));const g=geo.index?geo.toNonIndexed():geo.clone();if(!g.attributes.uv)g.setAttribute("uv",new T.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
      g.applyMatrix4(new T.Matrix4().multiplyMatrices(base,tmp));if(!by.has(mat))by.set(mat,[]);by.get(mat).push(g);return K2},
    build(parent,opt={}){const out=[];for(const [mat,gs] of by){let n=0;gs.forEach(g=>n+=g.attributes.position.count);const P2=new Float32Array(n*3),N2=new Float32Array(n*3),UV=new Float32Array(n*2);let o=0;
      for(const g of gs){P2.set(g.attributes.position.array,o*3);N2.set(g.attributes.normal.array,o*3);UV.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count;g.dispose()}
      const geo=new T.BufferGeometry();geo.setAttribute("position",new T.BufferAttribute(P2,3));geo.setAttribute("normal",new T.BufferAttribute(N2,3));geo.setAttribute("uv",new T.BufferAttribute(UV,2));geo.computeBoundingSphere();
      const me=new T.Mesh(geo,mat);me.castShadow=opt.shadow!==false&&!mat.transparent;me.receiveShadow=true;if(opt.name)me.name=opt.name;parent.add(me);out.push(me)}by.clear();return out}};return K2}
const mat4=(x,y,z,ry=0)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(0,ry,0)),new T.Vector3(1,1,1));
/* world-space collider box (x0..x1, z0..z1, y0..top) */
function usolid(x0,x1,z0,z1,top,y0=0){SOL.push({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),y0,top})}
/* a tap that can change its label later; area-relative coords like mkTap */
function utap(area,x,z,label,fn,r=1.3){mkTap(area,x,z,label,fn,r);const t=TAPS[TAPS.length-1];U.taps.push(t);return t}
/* remove meshes from a parent that match a test (used to swap old boxy placeholders for detailed ones) */
function uremove(parent,test){const rm=[];parent.children.forEach(o=>{if(o.isMesh&&test(o))rm.push(o)});rm.forEach(o=>parent.remove(o));return rm.length}
const near2=(o,x,y,z,t=.05)=>Math.abs(o.position.x-x)<t&&Math.abs(o.position.y-y)<t&&Math.abs(o.position.z-z)<t;
/* tiny sound effects (WebAudio, created on first use) */
let UAC=null;function ubeep(f=440,d=.15,type="square",vol=.05,slide=0){try{UAC=UAC||new (window.AudioContext||window.webkitAudioContext)();const o=UAC.createOscillator(),g=UAC.createGain(),t=UAC.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.linearRampToValueAtTime(f+slide,t+d);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(UAC.destination);o.start(t);o.stop(t+d+.02)}catch(_){}}
/* particles (water, leaves, sparkles): one shared pool of tiny meshes */
const UPART=[];function upuff(parent,x,y,z,n,col,spd=2,up=3,life=1.2,size=.05,grav=9){const m=UM(col,{emissive:col,emissiveIntensity:.25});for(let i=0;i<n;i++){const p=new T.Mesh(sp(size,6),m);p.position.set(x,y,z);parent.add(p);UPART.push({p,parent,vx:(Math.random()-.5)*spd,vy:up*(.6+Math.random()*.6),vz:(Math.random()-.5)*spd,t:life*(.6+Math.random()*.6),grav})}}
U.anims.push((dt)=>{for(let i=UPART.length-1;i>=0;i--){const q=UPART[i];q.t-=dt;q.vy-=q.grav*dt;q.p.position.x+=q.vx*dt;q.p.position.y+=q.vy*dt;q.p.position.z+=q.vz*dt;if(q.p.position.y<.02){q.p.position.y=.02;q.vy=0;q.vx*=.5;q.vz*=.5}if(q.t<=0){q.parent.remove(q.p);UPART.splice(i,1)}}});
/* ---------- QUIZ CARD: optional, never costs XP; first-try right = +3 XP (max 3 per object per day) ---------- */
const UQZ=document.createElement("div");UQZ.id="uquiz";UQZ.style.cssText="position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483002;display:none;width:min(560px,94vw);background:rgba(20,18,58,.96);color:#fff;border:3px solid #ffd23f;border-radius:18px;padding:14px 16px;font:600 17px system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4)";document.body.appendChild(UQZ);
U.quiz=null;
function uquiz(kind,id,emoji){if(U.quiz)return;const q=UQ.G[kind](Math.floor(Math.random()*1e9));U.quiz={q,id,tries:0};
  UQZ.innerHTML=`<div style="font:800 13px system-ui;color:#ffd23f;letter-spacing:.5px">${emoji||"🧮"} MATH MOMENT · ${q.std} · optional</div><div id="uqT" style="margin:6px 0 10px">${q.text}</div><div id="uqC" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"></div><div id="uqF" style="min-height:22px;margin-top:8px;font-weight:700"></div><div style="text-align:right"><button id="uqX" style="border:0;border-radius:10px;padding:.4rem .9rem;background:#2a2448;color:#fff;font:700 14px system-ui;cursor:pointer">Close (Esc)</button></div>`;
  q.choices.forEach((c,i)=>{const b=document.createElement("button");b.textContent=(i+1)+") "+c;b.dataset.v=c;b.style.cssText="border:0;border-radius:12px;padding:.6rem;background:#ffd23f;color:#14123a;font:800 17px system-ui;cursor:pointer";b.onclick=()=>uanswer(c,b);UQZ.querySelector("#uqC").appendChild(b)});
  UQZ.querySelector("#uqX").onclick=uclose;UQZ.style.display="block";for(const k in K)K[k]=false}
function uanswer(c,b){const Z=U.quiz;if(!Z||Z.done)return;Z.tries++;const F=UQZ.querySelector("#uqF");
  if(c===Z.q.ans){Z.done=1;b.style.background="#6dff6b";const key="lu3d_uq_"+new Date().toDateString()+"_"+Z.id,n=+(localStorage.getItem(key)||0);
    if(Z.tries===1&&n<3){localStorage.setItem(key,n+1);F.textContent="✅ Correct! "+Z.q.explain+" +3 XP";xpMsg("🧮 Math moment! +3 XP",3)}else F.textContent="✅ Correct! "+Z.q.explain;ubeep(880,.12,"triangle",.06,300);setTimeout(uclose,2600)}
  else{b.style.background="#ff8f8f";b.disabled=true;F.textContent=Z.tries>=2?"💡 "+Z.q.explain:"Not quite — try again!";ubeep(200,.15,"sawtooth",.04)}}
function uclose(){UQZ.style.display="none";U.quiz=null}
window.uquiz=uquiz;window.uclose=uclose;
{const _bU=BLOCKIN;BLOCKIN=()=>_bU()||!!U.quiz}
{const _okU=OVERLAY_KEYS;OVERLAY_KEYS=e=>{if(U.quiz){if(e.key==="Escape")uclose();else if(/^[1-4]$/.test(e.key)){const b=UQZ.querySelectorAll("#uqC button")[+e.key-1];if(b&&!b.disabled)b.click()}return true}return _okU?_okU(e):false}}
/* a reaction bubble + an offer to do the math moment (press M or tap the card) */
function uoffer(emoji,text,kind,id){bub(emoji,text);if(!kind)return;U.offer={kind,id,emoji,t:performance.now()};UOF.innerHTML=`${emoji} ${text.length>70?"":"" }<b>Math moment?</b> Press <b>M</b> or tap here`;UOF.style.display="block";clearTimeout(UOF._t);UOF._t=setTimeout(()=>{UOF.style.display="none";U.offer=null},6000)}
const UOF=document.createElement("div");UOF.id="uoffer";UOF.style.cssText="position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:2147483001;display:none;background:#ffd23f;color:#14123a;border-radius:999px;padding:.45rem 1rem;font:700 15px system-ui;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3)";document.body.appendChild(UOF);
UOF.onclick=()=>{const o=U.offer;UOF.style.display="none";U.offer=null;if(o)uquiz(o.kind,o.id,o.emoji)};
addEventListener("keydown",e=>{if(e.key.toLowerCase()==="m"&&U.offer&&!U.quiz&&!QG){const o=U.offer;U.offer=null;UOF.style.display="none";uquiz(o.kind,o.id,o.emoji)}});
/* per-frame hook */
{const _ugU=updateGame;updateGame=function(dt,now){_ugU(dt,now);for(const f of U.anims){try{f(dt,now)}catch(e){}}}}
/* ---------- FLAT-PANEL AUDIT: textured image planes/faces that stand in for 3D objects inside walkable space ---------- */
function flatAudit(){const out=[],bb=new T.Box3(),sz=new T.Vector3();S.updateMatrixWorld(true);
  S.traverse(o=>{if(!o.isMesh||!o.visible&&false)return;const mats=Array.isArray(o.material)?o.material:[o.material];
    const img=mats.find(m=>m&&m.map&&m.map.image&&!(m.map.image instanceof HTMLCanvasElement)&&!(m.alphaTest>0)&&!m.map.isVideoTexture);if(!img)return;
    if(U.flatOK.has(o)||o.userData.flatOK)return;if(o.geometry&&o.geometry.type==="CylinderGeometry")return;/* skyline drums */
    bb.setFromObject(o);bb.getSize(sz);if(sz.y<.05)return;/* floors / ceilings */
    const big=Math.max(sz.x,sz.z)>=1.4&&sz.y>=1;if(!big||bb.min.y>2.2)return;
    const cz=(bb.min.z+bb.max.z)/2;let area="street";for(const k in ROOMS){const R=ROOMS[k];const d=(R.d||RD)/2+1;if(cz>R.cz-d&&cz<R.cz+d){area=k;break}}
    const src=(img.map.image.currentSrc||img.map.image.src||"").split("/").pop();out.push({area,src,w:+Math.max(sz.x,sz.z).toFixed(2),h:+sz.y.toFixed(2),x:+((bb.min.x+bb.max.x)/2).toFixed(1),z:+cz.toFixed(1)})});return out}
window.flatAudit=flatAudit;

/* =====================================================================
   18. UNIVERSE · STREET: detailed NYC street furniture, every piece interactive (press E / tap)
   trash cans (lid lifts, see what's inside) · hydrants (spray) · lamps (switch) · trees (shake) · benches ·
   USPS mailbox · newsstand (math headlines) · subway entrance · fruit stand · taxis (wave one down) ·
   3D display windows on every clothing store · school planters + notice case
   ===================================================================== */
const ST3={cans:[],lamps:[],trees:[],hyd:[]};U.street=ST3;
const iron=UM(0x1d2a24,{metalness:.6,roughness:.45}),canG=UM(0x2f6b3a,{metalness:.35,roughness:.55}),canD=UM(0x1f4a28,{metalness:.4,roughness:.5}),bagM=UM(0x161616,{roughness:.9}),
  silver=UM(0xc9ced4,{metalness:.8,roughness:.3}),wood=UM(0x9a6234,{roughness:.75}),woodD=UM(0x6b4123,{roughness:.8}),stoneM=UM(0xd9cdb8,{roughness:.9}),concrete=UM(0x9a968e,{roughness:.95});
/* ---------- TRASH CANS (same spots the litter clean-up uses) ---------- */
{const n0=CANS.length;CANS.forEach(([x,z])=>uremove(S,o=>Math.abs(o.position.x-x)<.6&&Math.abs(o.position.z-z)<.6&&o.position.y>.3&&o.position.y<1.5));
 const kit=Kit(),R0=.38;
 CANS.forEach(([x,z],i)=>{kit.base(mat4(x,.12,z));kit.add(cy(.34,.31,.08,20),canD,0,.04,0);kit.add(cy(.355,.32,.9,20,true),bagM,0,.5,0);
   for(let k=0;k<18;k++){const a=k/18*Math.PI*2;kit.add(bx(.055,.92,.022),canG,Math.cos(a)*R0,.51,Math.sin(a)*R0,0,-a+Math.PI/2,0)}
   [.12,.5,.88].forEach(y=>kit.add(tor(R0,.024,6,28),canD,0,y,0,Math.PI/2));kit.add(tor(R0+.01,.035,8,28),canD,0,.97,0,Math.PI/2);
   usolid(x-.42,x+.42,z-.42,z+.42,1.1)});
 kit.build(S,{name:"u_cans"});
 const items=[["banana peel",(g)=>{const y=UM(0xffd23f,{roughness:.6});for(let k=0;k<4;k++){const m=new T.Mesh(bx(.05,.012,.2),y);m.rotation.set(-.4,k*Math.PI/2,0);m.position.set(Math.sin(k*Math.PI/2)*.07,.02,Math.cos(k*Math.PI/2)*.07);g.add(m)}const c=new T.Mesh(sp(.035,8),UM(0x6b4a1f));c.position.y=.04;g.add(c)}],
   ["crumpled worksheet",(g)=>{const m=new T.Mesh(ico(.09,0),UM(0xf4f1e8,{flatShading:true}));m.scale.set(1.2,.8,1);m.position.y=.06;g.add(m);const m2=new T.Mesh(ico(.06,0),UM(0xe6e9ff,{flatShading:true}));m2.position.set(.12,.04,.05);g.add(m2)}],
   ["soda can and a pizza crust",(g)=>{const c=new T.Mesh(cy(.035,.035,.12,12),UM(0xc0392b,{metalness:.6}));c.rotation.z=Math.PI/2;c.position.set(-.06,.04,0);g.add(c);const cr=new T.Mesh(tor(.09,.025,6,12,Math.PI),UM(0xc98a3c));cr.rotation.x=-Math.PI/2;cr.position.set(.08,.03,.04);g.add(cr)}],
   ["apple core",(g)=>{const a=new T.Mesh(cy(.03,.03,.08,10),UM(0xf5e6c8));a.position.y=.05;g.add(a);[-1,1].forEach(s=>{const e=new T.Mesh(sp(.045,10),UM(0xd92b2b));e.scale.y=.5;e.position.y=.05+s*.05;g.add(e)})}]];
 CANS.forEach(([x,z],i)=>{const grp=new T.Group();grp.position.set(x,.12,z);S.add(grp);
   const cont=new T.Group();cont.position.y=.9;grp.add(cont);const kind=i%items.length;items[kind][1](cont);
   const coin=(i===1||i===3)?new T.Mesh(cy(.06,.06,.015,18),UM(0xffc83d,{metalness:.9,roughness:.25,emissive:0x664400,emissiveIntensity:.4})):null;if(coin){coin.position.set(.1,.07,-.08);coin.rotation.x=.3;cont.add(coin)}
   /* lid on a back hinge: dome + rim + handle */
   const hinge=new T.Group();hinge.position.set(0,.99,(R0+.02)*Math.sign(z));grp.add(hinge);const lid=new T.Group();lid.position.set(0,0,-(R0+.02)*Math.sign(z));hinge.add(lid);
   const dome=new T.Mesh(new T.SphereGeometry(.42,22,8,0,Math.PI*2,0,Math.PI/2.4),canD);dome.scale.y=.35;dome.castShadow=true;lid.add(dome);
   const rim=new T.Mesh(tor(.41,.03,6,28),canG);rim.rotation.x=Math.PI/2;lid.add(rim);const hd=new T.Mesh(tor(.08,.018,6,14,Math.PI),silver);hd.position.y=.13;lid.add(hd);
   const C={i,x,z,grp,hinge,cont,coin,item:items[kind][0],open:0,cur:0};ST3.cans.push(C);
   C.tap=utap("street",x,z,"Press E to lift the trash can lid 🗑️",()=>{C.open=!C.open;ubeep(C.open?520:330,.12,"square",.03,C.open?200:-120);C.tap.label=C.open?"Press E to put the lid back on":"Press E to lift the trash can lid 🗑️";
     if(!C.open)return;const what=C.coin&&C.coin.parent?"a "+C.item+"… and a shiny coin!":"a "+C.item+".";
     setTimeout(()=>{if(C.coin&&C.coin.parent&&onceXP("canCoin"+i,10,"🪙 A coin was hiding in the trash can! +10 XP")){C.cont.remove(C.coin);return}
       if(C.item==="crumpled worksheet")uoffer("📄","Inside: a crumpled math worksheet! Can you solve it?","mult","can"+i);else uoffer("🗑️","Inside: "+what+(C.item==="banana peel"?" Ew!":" Yuck."),i%2?"meters":null,"can"+i)},420)},1.25)});
 if(ONCE.has("canCoin1"))ST3.cans[1].cont.remove(ST3.cans[1].coin);if(ONCE.has("canCoin3"))ST3.cans[3].cont.remove(ST3.cans[3].coin);
 U.anims.push((dt)=>{for(const C of ST3.cans){const w=C.open?1:0;C.cur+=(w-C.cur)*Math.min(1,dt*7);C.hinge.rotation.x=C.cur*1.95*Math.sign(C.z);C.hinge.position.y=.99+C.cur*.08}})}
/* ---------- FIRE HYDRANTS ---------- */
{const red=UM(0xc8202a,{metalness:.3,roughness:.45}),kit=Kit();const HY=[[-33.5,4.95],[8.5,4.95],[-24.6,-4.95],[45,-4.95]];
 HY.forEach(([x,z])=>{const f=z>0?Math.PI:0;kit.base(mat4(x,.12,z,f));kit.add(cy(.2,.23,.08,16),red,0,.04,0);kit.add(cy(.13,.15,.58,16),red,0,.37,0);kit.add(cy(.17,.17,.06,16),red,0,.68,0);
   kit.add(new T.SphereGeometry(.14,16,8,0,Math.PI*2,0,Math.PI/2),silver,0,.71,0);kit.add(cy(.04,.05,.08,5),silver,0,.88,0);
   [-1,1].forEach(s=>{kit.add(cy(.055,.06,.14,12),red,s*.18,.48,0,0,0,Math.PI/2);kit.add(cy(.07,.07,.04,6),silver,s*.26,.48,0,0,0,Math.PI/2)});
   kit.add(cy(.075,.08,.13,12),red,0,.46,.17,Math.PI/2);kit.add(cy(.09,.09,.04,6),silver,0,.46,.25,Math.PI/2);for(let k=0;k<4;k++)kit.add(tor(.022,.006,4,8),silver,.08+k*.03,.4-k*.012,.2,0,k%2*Math.PI/2);
   usolid(x-.26,x+.26,z-.26,z+.26,.95)});
 kit.build(S,{name:"u_hydrants"});
 HY.forEach(([x,z],i)=>{const H={x,z,on:0,pud:null};ST3.hyd.push(H);const dirz=z>0?-1:1;
   const pud=new T.Mesh(new T.CircleGeometry(1,28),new T.MeshStandardMaterial({color:0x6fb6ff,transparent:true,opacity:0,roughness:.05,metalness:.3,depthWrite:false}));pud.rotation.x=-Math.PI/2;pud.position.set(x,.125,z+dirz*1.5);pud.scale.setScalar(.01);S.add(pud);H.pud=pud;
   H.tap=utap("street",x,z+dirz*.5,"Press E to open the fire hydrant 💦",()=>{if(H.on>0)return;H.on=4;ubeep(160,.5,"sawtooth",.03,-60);uoffer("💦","Summer splash! The hydrant is spraying.","hydrant","hyd"+i)},1.3)});
 U.anims.push((dt)=>{for(const H of ST3.hyd){const dz=H.z>0?-1:1;if(H.on>0){H.on-=dt;if(AREA==="street")for(let k=0;k<3;k++){const p=new T.Mesh(sp(.04,5),UM(0x9fd4ff,{emissive:0x4aa0ff,emissiveIntensity:.3}));p.position.set(H.x,.58,H.z+dz*.3);S.add(p);UPART.push({p,parent:S,vx:(Math.random()-.5)*.8,vy:2.4+Math.random(),vz:dz*(3+Math.random()*1.2),t:.9,grav:9})}
   H.pud.material.opacity=Math.min(.55,H.pud.material.opacity+dt*.3);H.pud.scale.setScalar(Math.min(1.3,H.pud.scale.x+dt*.4))}else if(H.pud.material.opacity>0){H.pud.material.opacity=Math.max(0,H.pud.material.opacity-dt*.05);if(H.pud.material.opacity===0)H.pud.scale.setScalar(.01)}}})}
/* ---------- STREET LAMPS: cast-iron base, fluted pole, crook arm, lantern; each has a switch ---------- */
{uremove(S,o=>o.geometry&&o.geometry.type==="CylinderGeometry"&&o.geometry.parameters.radiusTop===.09&&Math.abs(Math.abs(o.position.z)-4.6)<.01);
 uremove(S,o=>o.geometry&&o.geometry.type==="SphereGeometry"&&o.geometry.parameters.radius===.28&&Math.abs(o.position.y-4.7)<.01);
 const lampG=UM(0x2f4f3a,{metalness:.55,roughness:.4}),kit=Kit(),on=UM(0xfff2c0,{emissive:0xffd77a,emissiveIntensity:1.6}),off=UM(0x8a8574,{roughness:.3,metalness:.2});ST3.lampOn=on;ST3.lampOff=off;
 const arm=new T.TorusGeometry(.42,.04,8,18,Math.PI);
 for(let x=-54;x<=54;x+=12)[-4.6,4.6].forEach(z=>{const f=z>0?Math.PI:0;kit.base(mat4(x,.12,z,f));
   kit.add(cy(.2,.26,.5,8),lampG,0,.25,0);kit.add(cy(.16,.2,.12,8),lampG,0,.56,0);kit.add(cy(.075,.1,4.1,10),lampG,0,2.6,0);[1.2,2.6,4.2].forEach(y=>kit.add(cy(.11,.11,.06,10),lampG,0,y,0));
   kit.add(arm,lampG,0,4.65,.42,0,Math.PI/2,0);
   kit.add(cy(.05,.22,.2,10),lampG,0,4.58,.84);kit.add(cy(.23,.23,.04,10),lampG,0,4.47,.84);kit.add(sp(.03,6),lampG,0,4.72,.84);
   const b=new T.Mesh(sp(.17,14),on);b.position.set(x,.12+4.36,z+(z>0?-.84:.84));b.scale.y=1.2;S.add(b);const Lp={x,z,b,on:true};ST3.lamps.push(Lp);
   Lp.tap=utap("street",x,z,"Press E to flip the street lamp switch 💡",()=>{Lp.on=!Lp.on;Lp.b.material=Lp.on?on:off;ubeep(Lp.on?700:300,.06,"square",.03);const n=ST3.lamps.filter(l=>l.on).length;uoffer("💡",Lp.on?"Lamp ON. "+n+" of "+ST3.lamps.length+" lamps are lit.":"Lamp OFF. "+n+" of "+ST3.lamps.length+" lamps are lit.","lamps","lamp")},1.05)});
 kit.build(S,{name:"u_lamps"});
 /* street-name blades on the lamp at x=-6 */
 {const g=new T.Group();g.position.set(-6,3.4,-4.6);S.add(g);[["LEVEL UP AVE",0],["MULTIPLICATION ST",Math.PI/2]].forEach(([t,r],k)=>{const s=new T.Group();s.rotation.y=r;s.position.y=k*.28;g.add(s);sign(s,t,.75,0,0,1.5,.24,"#0b6b3a","#ffffff");sign(s,t,.75,0,-.012,1.5,.24,"#0b6b3a","#ffffff",Math.PI)})}}
/* ---------- TREES: tree pit + iron guard, tapered trunk with branches, clustered low-poly canopy; shake them ---------- */
{uremove(S,o=>o.geometry&&((o.geometry.type==="CylinderGeometry"&&o.geometry.parameters.height===2.4&&o.geometry.parameters.radiusTop===.15)||(o.geometry.type==="SphereGeometry"&&o.geometry.parameters.radius===1.3)));
 const bark=UM(0x6b4a2f,{roughness:.95}),leaf1=UM(0x4f9a4a,{roughness:.9,flatShading:true}),leaf2=UM(0x3c7d3a,{roughness:.9,flatShading:true}),soil=UM(0x4a3526,{roughness:1}),kit=Kit();
 let ti=0;for(let x=-48;x<=48;x+=24)[-8.2,8.2].forEach(z=>{const X=x+6;kit.base(mat4(X,.12,z));kit.add(bx(1.3,.03,1.3),soil,0,.015,0);[[0,.62],[0,-.62],[.62,0],[-.62,0]].forEach(([a,b])=>kit.add(bx(a?.06:1.3,.1,a?1.3:.06),stoneM,a,.05,b));
   [[0,.6],[0,-.6],[.6,0],[-.6,0]].forEach(([a,b])=>{kit.add(bx(a?.03:1.2,.03,a?1.2:.03),iron,a,.45,b);for(let k=-2;k<=2;k++)kit.add(bx(.025,.45,.025),iron,a||k*.28,.23,b||k*.28)});
   kit.add(cy(.13,.22,2.7,10),bark,0,1.35,0);kit.add(cy(.05,.09,1.1,7),bark,.32,2.5,.1,0,0,-.75);kit.add(cy(.05,.09,1,7),bark,-.28,2.6,-.12,0,0,.7);kit.add(cy(.04,.07,.9,7),bark,.05,2.7,-.35,.7,0,0);
   const can=new T.Group();can.position.set(X,.12,z);S.add(can);const ck=Kit();[[0,3.35,0,1.05,leaf1],[.65,3.05,.2,.75,leaf2],[-.6,3.15,-.2,.8,leaf1],[.1,3.9,-.3,.7,leaf2],[-.2,3.0,.55,.7,leaf2],[.35,3.6,.5,.65,leaf1]].forEach(([a,b,c,r,m])=>ck.add(ico(r,1),m,a,b,c));
   const piv=new T.Group();can.add(piv);ck.build(piv);usolid(X-.25,X+.25,z-.25,z+.25,2.6);
   const Tr={x:X,z,piv,shake:0,i:ti++};ST3.trees.push(Tr);
   Tr.tap=utap("street",X,z+(z>0?-.9:.9),"Press E to shake the tree 🌳",()=>{Tr.shake=1.2;upuff(S,X,3.2,z,18,0x5aa84f,2.4,.4,2.2,.06,2.2);
     if(Tr.i===3&&onceXP("treeCoin",10,"🐿️ A squirrel dropped a coin! +10 XP"))return;bub("🍃",["Leaves everywhere! 🍃","A squirrel ran up the trunk! 🐿️","Whoa, the whole tree rustled.","An acorn bonked Theo on the head!"][Math.floor(Math.random()*4)])},1.1)});
 kit.build(S,{name:"u_trees"});
 U.anims.push((dt,now)=>{for(const Tr of ST3.trees){if(Tr.shake>0){Tr.shake-=dt;Tr.piv.rotation.z=Math.sin(now/45)*.05*Tr.shake;Tr.piv.rotation.x=Math.cos(now/60)*.03*Tr.shake}else if(Tr.piv.rotation.z){Tr.piv.rotation.z=Tr.piv.rotation.x=0}}})}
/* ---------- BENCHES: slatted wood on cast-iron legs ---------- */
{const kit=Kit(),BEN=[[-12.6,-7.95,0],[10,7.95,Math.PI],[-40.5,7.95,Math.PI]];
 BEN.forEach(([x,z,r])=>{kit.base(mat4(x,.12,z,r));for(let k=0;k<4;k++)kit.add(rbox(2,.04,.1,.015),wood,0,.46,-.18+k*.12);for(let k=0;k<3;k++)kit.add(rbox(2,.1,.035,.012),wood,0,.66+k*.13,-.27,-.18);
   [-.85,.85].forEach(sx=>{kit.add(bx(.06,.46,.06),iron,sx,.23,.15);kit.add(bx(.06,.46,.06),iron,sx,.23,-.22);kit.add(bx(.06,.06,.5),iron,sx,.44,-.03);kit.add(bx(.05,.5,.05),iron,sx,.75,-.29,-.18);kit.add(rbox(.06,.05,.5,.02),iron,sx,.63,-.03)});
   const c=Math.abs(Math.cos(r))>.5;usolid(x-1.05,x+1.05,z-.35,z+.35,.5)});
 kit.build(S,{name:"u_benches"});
 /* the old 'check under the bench' coin now has a real bench; after the coin, measure the bench */
 const bt=TAPS.find(t=>t.area==="street"&&/under the bench/.test(t.label));if(bt){const f0=bt.fn;bt.fn=()=>{if(ONCE.has("bench")){uoffer("🪑","Nothing under the bench. It's a nice long bench, though!","meters","bench");return}f0()}}
 utap("street",10,7.2,"Press E to sit on the bench and rest 🪑",()=>uoffer("🪑","Ahh, nice break. Benches in NYC parks are about 2 meters long.","meters","bench2"),1.2);
 utap("street",-40.5,7.2,"Press E to sit on the bench 🪑",()=>uoffer("🐦","A pigeon lands next to you and coos. 🐦",null),1.2)}
/* ---------- USPS MAILBOX: rounded top, legs, pull-down chute that opens when you mail a letter ---------- */
{const mx=-26,mz=6.6;uremove(S,o=>Math.abs(o.position.x-mx)<.5&&Math.abs(o.position.z-mz)<.5&&o.position.y>.3);
 const blue=UM(0x1f4aa8,{metalness:.35,roughness:.45}),kit=Kit();kit.base(mat4(mx,.12,mz,Math.PI));
 kit.add(rbox(.62,.72,.52,.04),blue,0,.98,0);kit.add(new T.CylinderGeometry(.31,.31,.52,20,1,false,-Math.PI/2,Math.PI),blue,0,1.34,0,Math.PI/2,0,0);
 [[-.27,-.22],[.27,-.22],[-.27,.22],[.27,.22]].forEach(([a,b])=>kit.add(bx(.05,.62,.05),blue,a,.31,b));kit.add(bx(.66,.05,.56),UM(0x173a86),0,.6,0);
 kit.build(S,{name:"u_mailbox"});
 const g=new T.Group();g.position.set(mx,.12,mz);g.rotation.y=Math.PI;S.add(g);sign(g,"UNITED STATES POSTAL SERVICE",0,.78,.27,.56,.14,"#1f4aa8","#ffffff");
 const chute=new T.Group();chute.position.set(0,1.3,.27);g.add(chute);const fl=new T.Mesh(rbox(.42,.16,.03,.01),UM(0x2a5cc8,{metalness:.5,roughness:.35}));fl.position.y=-.08;chute.add(fl);const hd=new T.Mesh(rbox(.22,.035,.04,.01),silver);hd.position.set(0,-.13,.025);chute.add(hd);
 usolid(mx-.34,mx+.34,mz-.3,mz+.3,1.6);let op=0,cur=0;U.anims.push(dt=>{op=Math.max(0,op-dt);const w=op>0?1:0;cur+=(w-cur)*Math.min(1,dt*8);chute.rotation.x=cur*.9});
 const mt=TAPS.find(t=>t.area==="street"&&/mail a letter/.test(t.label));if(mt){const f0=mt.fn;mt.fn=()=>{op=1.6;ubeep(260,.12,"square",.03);f0()}}}
/* ---------- NEWSSTAND: kiosk with vendor window, magazine racks, newspaper stacks; read the math headline ---------- */
{const nx=0,nz=7.65,g=new T.Group();g.position.set(nx,.12,nz);g.rotation.y=Math.PI;S.add(g);const kit=Kit(),grn=UM(0x0b6b3a,{metalness:.3,roughness:.5}),grnD=UM(0x084a28,{metalness:.3,roughness:.5});
 kit.add(rbox(3.2,2.3,1.3,.05),grn,0,1.15,0);kit.add(rbox(3.6,.14,1.8,.04),grnD,0,2.37,.15);kit.add(bx(3.4,.18,.06),UM(0xffd23f),0,2.27,1.04);
 kit.add(bx(1.5,.9,.06),UM(0x2a2418),0,1.45,.63);kit.add(bx(1.6,.06,.35),wood,0,.98,.78);[-.78,.78].forEach(x=>kit.add(bx(.06,1,.1),grnD,x,1.45,.66));
 const cols=[0xe23b3b,0x3d7be0,0xffb52e,0x8a5cff,0x2a9d8f,0xff6b8a];
 [-1,1].forEach(s=>{for(let r=0;r<3;r++){kit.add(bx(.62,.04,.22),grnD,s*1.22,.5+r*.45,.76,-.35);for(let k=0;k<3;k++)kit.add(bx(.17,.24,.02),UM(cols[(r*3+k+(s>0?2:0))%6]),s*1.22-.2+k*.2,.64+r*.45,.81,-.35)}});
 for(let k=0;k<3;k++)kit.add(bx(.36,.08+k*.02,.26),UM(0xf2efe6),-.45+k*.45,1.05+k*.01,.82);
 kit.build(g,{name:"u_newsstand"});sign(g,"NEWS · MAGAZINES · SNACKS",0,2.05,.67,2.6,.32,"#0b6b3a","#ffd23f");
 const vend=new T.Mesh(new T.CapsuleGeometry(.16,.3,4,10),UM(0x7a4a2a));vend.position.set(.1,1.25,.35);g.add(vend);const vh=new T.Mesh(sp(.13,12),UM(0x8d5a3b));vh.position.set(.1,1.68,.35);g.add(vh);const cap=new T.Mesh(cy(.14,.14,.06,12),UM(0x1f4aa8));cap.position.set(.1,1.8,.35);g.add(cap);
 usolid(nx-1.65,nx+1.65,nz-.85,nz+.7,2.4);
 utap("street",nx,nz-1.4,"Press E to read today's newspaper 📰",()=>{const q=UQ.G.round(Math.floor(Math.random()*1e6));uoffer("📰",q.text.split("!")[0]+"!","round","news")},1.4)}
/* ---------- SUBWAY ENTRANCE: stairs going down (hole in the sidewalk), green rails, globe lamps, MetroCard machine ---------- */
{const sx=-30,X0=sx-.8,X1=sx+.8,Z0=6.15,Z1=8.6;
 const cut=m=>{m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nvarying vec3 vUW;").replace("#include <begin_vertex>","#include <begin_vertex>\nvUW=(modelMatrix*vec4(transformed,1.0)).xyz;");
   sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nvarying vec3 vUW;").replace("void main() {",`void main() {\nif(vUW.x>${X0.toFixed(2)}&&vUW.x<${X1.toFixed(2)}&&vUW.z>${Z0.toFixed(2)}&&vUW.z<${Z1.toFixed(2)})discard;`)};m.needsUpdate=true};
 S.children.forEach(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==="PlaneGeometry"&&((o.geometry.parameters.width===LEN&&o.geometry.parameters.height===5&&o.position.z>0)||o.geometry.parameters.width===900))cut(o.material)});
 const kit=Kit(),tile=UM(0xe8e2d0,{roughness:.6}),step=UM(0x7c7a76,{roughness:.9}),nose=UM(0xb8a040,{metalness:.6,roughness:.4}),dark=UM(0x22201e);
 const N=10,run=(Z1-Z0)/N,rise=.22;for(let k=0;k<N;k++){const y=.12-(k+1)*rise;kit.add(bx(1.6,rise,run+.02),step,sx,y+rise/2,Z0+run*(k+.5));kit.add(bx(1.6,.03,.04),nose,sx,y+rise,Z0+run*k+.02)}
 kit.add(bx(1.6,.1,1.2),step,sx,.12-N*rise-.05,Z1+.6);[-1,1].forEach(s=>kit.add(bx(.08,N*rise+.3,Z1-Z0+1.4),tile,sx+s*.84,.12-(N*rise)/2+.1,(Z0+Z1)/2+.6));
 kit.add(bx(1.7,N*rise+.3,.08),tile,sx,.12-(N*rise)/2+.1,Z1+1.2);kit.add(bx(1.6,.05,1.4),dark,sx,.12-.05,Z1+.6);
 /* rails: front gate + sides + back */
 [-1,1].forEach(s=>{const x=sx+s*.9;for(let k=0;k<=6;k++)kit.add(bx(.035,1,.035),iron,x,.62,Z0+k*(Z1-Z0+.1)/6);kit.add(bx(.06,.06,Z1-Z0+.2),iron,x,1.12,(Z0+Z1)/2);kit.add(bx(.05,.05,Z1-Z0+.2),iron,x,.35,(Z0+Z1)/2);
   kit.add(cy(.05,.06,2,10),iron,x,1.12,Z0-.05);});
 for(let k=0;k<=8;k++)kit.add(bx(.03,1,.03),iron,sx-.9+k*.225,.62,Z1+.1);kit.add(bx(1.85,.06,.06),iron,sx,1.12,Z1+.1);
 kit.build(S,{name:"u_subway"});
 const gate=new T.Group();gate.position.set(sx,.12,Z0-.05);S.add(gate);const gk=Kit();for(let k=0;k<9;k++)gk.add(bx(.025,.95,.025),iron,-.8+k*.2,.5,0);gk.add(bx(1.7,.04,.04),iron,0,.95,0);gk.add(bx(1.7,.04,.04),iron,0,.15,0);for(let k=0;k<8;k++)gk.add(bx(.02,.28,.02),iron,-.7+k*.2,.55,0,0,0,.6);gk.build(gate);
 [-1,1].forEach(s=>{const gl=new T.Mesh(sp(.15,14),UM(0x6dff6b,{emissive:0x2bd94f,emissiveIntensity:1.4}));gl.position.set(sx+s*.9,.12+2.2,Z0-.05);S.add(gl)});
 const bar=new T.Group();bar.position.set(sx,.12+1.82,Z0-.05);S.add(bar);sign(bar,"SUBWAY  ④ ⑤ ⑥",0,0,.04,1.75,.32,"#111111","#ffffff");sign(bar,"SUBWAY  ④ ⑤ ⑥",0,0,-.04,1.75,.32,"#111111","#ffffff",Math.PI);
 usolid(X0-.15,X1+.15,Z0-.15,Z1+.3,1.2);
 const mc=Kit();mc.add(rbox(.6,1.5,.45,.05),UM(0x2b2f36,{metalness:.4}),0,.75,0);mc.add(bx(.4,.3,.02),UM(0x6fd0ff,{emissive:0x2bb0ff,emissiveIntensity:.9}),0,1.15,.23);mc.add(bx(.3,.05,.03),UM(0xffd23f),0,.85,.23);mc.add(bx(.36,.12,.05),UM(0x111111),0,.5,.23);
 const mg=new T.Group();mg.position.set(sx+1.6,.12,7.4);mg.rotation.y=Math.PI;S.add(mg);mc.build(mg);sign(mg,"MetroCard",0,1.4,.235,.5,.1,"#ffd23f","#14123a");usolid(sx+1.28,sx+1.92,7.15,7.65,1.5);
 let gt=0;U.anims.push(dt=>{gt=Math.max(0,gt-dt);gate.position.y=.12+Math.sin(gt*20)*.01*gt});
 utap("street",sx,Z0-.9,"Press E to check when the next train comes 🚇",()=>{gt=1;ubeep(90,.9,"sawtooth",.04,-30);uoffer("🚇","Rumble... a train passes under the street! The gate opens at 5 AM.","train","subway")},1.3);
 utap("street",sx+1.6,6.6,"Press E to use the MetroCard machine 🎫",()=>{ubeep(900,.08,"square",.03);setTimeout(()=>ubeep(1200,.08,"square",.03),120);uoffer("🎫","Beep! One ride costs $2.90.","fruit","metro")},1.1)}
/* ---------- FRUIT STAND: crates of apples, oranges, bananas, grapes; striped awning; hanging scale ---------- */
{const fx=19.5,fz=7.75,g=new T.Group();g.position.set(fx,.12,fz);g.rotation.y=Math.PI;S.add(g);const kit=Kit();
 kit.add(rbox(3,.08,1.2,.02),wood,0,.82,0);[[-1.4,-.5],[1.4,-.5],[-1.4,.5],[1.4,.5]].forEach(([a,b])=>kit.add(bx(.07,.82,.07),woodD,a,.41,b));kit.add(bx(2.9,.05,1.1),woodD,0,.25,0);
 const crate=(x,z,tilt)=>{kit.add(bx(.85,.04,.6),woodD,x,.9,z,tilt);[-1,1].forEach(s=>{kit.add(bx(.85,.18,.03),wood,x,.98,z+s*.29,tilt);kit.add(bx(.03,.18,.6),wood,x+s*.41,.98,z,tilt)})};
 const fr={apple:UM(0xd92b2b,{roughness:.45}),orange:UM(0xff8c1a,{roughness:.6}),lime:UM(0x7cc33a,{roughness:.5}),grape:UM(0x6b2a8a,{roughness:.4}),banana:UM(0xffd23f,{roughness:.6})};
 [[-1,.18,"apple"],[0,.18,"orange"],[1,.18,"lime"]].forEach(([x,z,k])=>{crate(x,z,-.15);for(let i=0;i<5;i++)for(let j=0;j<3;j++)kit.add(sp(.075,7),fr[k],x-.32+i*.16,1.05+j*.02+(i+j)%2*.03,z-.16+j*.16)});
 crate(-.6,-.3,0);for(let b=0;b<4;b++)for(let k=0;k<4;k++)kit.add(new T.TorusGeometry(.16,.03,6,10,Math.PI*.6),fr.banana,-.85+b*.17,1.02,-.3+k*.03-.05,Math.PI/2,0,b*.3);
 crate(.6,-.3,0);for(let c=0;c<3;c++)for(let k=0;k<14;k++){const a=k*2.4,rr=.05+k*.004;kit.add(sp(.03,6),fr.grape,.35+c*.25+Math.cos(a)*rr,1.08-k*.008,-.3+Math.sin(a)*rr)}
 [-1.45,1.45].forEach(x=>{kit.add(cy(.035,.035,2.2,8),woodD,x,1.1,.55)});
 const aw=canvasTex(512,128,(c,W,H)=>{for(let i=0;i<8;i++){c.fillStyle=i%2?"#ffffff":"#d62828";c.fillRect(i*W/8,0,W/8,H)}});kit.build(g,{name:"u_fruit"});
 const awn=new T.Mesh(new T.BoxGeometry(3.3,.05,1.5),[stoneM,stoneM,new T.MeshStandardMaterial({map:aw,roughness:.8}),stoneM,stoneM,stoneM]);awn.position.set(0,2.15,.1);awn.rotation.x=-.25;awn.castShadow=true;g.add(awn);U.flatOK.add(awn);
 for(let i=0;i<10;i++){const fl=new T.Mesh(bx(.33,.14,.01),i%2?UM(0xffffff):UM(0xd62828));fl.position.set(-1.5+i*.33,1.98,.84);fl.rotation.x=-.25;g.add(fl)}
 sign(g,"FRESH FRUIT · 45¢ ea",0,1.62,.58,1.8,.26,"#2e7d32","#ffffff");
 const scale=new T.Group();scale.position.set(1.1,1.9,.45);g.add(scale);const sc=new T.Mesh(cy(.11,.11,.06,16),silver);sc.rotation.x=Math.PI/2;scale.add(sc);const dish=new T.Mesh(new T.SphereGeometry(.16,14,6,0,Math.PI*2,Math.PI/2,Math.PI/2),silver);dish.position.y=-.35;scale.add(dish);
 const chn=new T.Mesh(cy(.006,.006,.25,4),silver);chn.position.y=-.2;scale.add(chn);let sw=0;U.anims.push((dt,now)=>{sw=Math.max(0,sw-dt);scale.rotation.z=Math.sin(now/120)*.18*sw});
 usolid(fx-1.55,fx+1.55,fz-.65,fz+.65,1.1);
 utap("street",fx-.7,fz-1.25,"Press E to buy some fruit 🍎",()=>{ubeep(1000,.06,"triangle",.04);uoffer("🍎","\"Fresh apples, get your apples!\"","fruit","fruitstand")},1.2);
 utap("street",fx+1,fz-1.25,"Press E to weigh grapes on the scale ⚖️",()=>{sw=1.5;uoffer("🍇","The scale swings… a bunch of grapes!","share","grapes")},1.1)}
/* ---------- TAXIS: rounded body, cabin glass, chrome bumpers, lights, checker stripe, roof sign; wave one down ---------- */
{const yel=UM(0xffc81e,{roughness:.35,metalness:.2}),glassD=UM(0x1d2a38,{roughness:.15,metalness:.5}),tire=UM(0x161616,{roughness:.9}),hub=UM(0xbfc5cc,{metalness:.85,roughness:.3}),
   chk=new T.MeshStandardMaterial({map:canvasTex(256,32,(c,W,H)=>{for(let i=0;i<32;i++)for(let j=0;j<4;j++){c.fillStyle=(i+j)%2?"#111":"#fff";c.fillRect(i*8,j*8,8,8)}}),roughness:.5}),
   roofT=new T.MeshStandardMaterial({map:canvasTex(256,64,(c,W,H)=>{c.fillStyle="#fffbe0";c.fillRect(0,0,W,H);c.fillStyle="#111";c.font="900 44px system-ui";c.textAlign="center";c.fillText("TAXI",W/2,48)}),emissive:0xfff4c0,emissiveIntensity:.5,emissiveMap:null});
 TAXIS.forEach((t,i)=>{S.remove(t.m);const g=new T.Group(),kit=Kit();const head=M(0xfffbe8,{emissive:0xfff2c0,emissiveIntensity:.6}),tail=UM(0xd01010,{emissive:0xa00000,emissiveIntensity:.6});
   kit.add(rbox(4.2,.62,1.84,.14),yel,0,.62,0);kit.add(rbox(1.2,.2,1.78,.1),yel,1.3,.98,0,0,0,-.08);kit.add(rbox(2.3,.66,1.66,.2),glassD,-.15,1.22,0);kit.add(rbox(2.0,.08,1.6,.04),yel,-.15,1.56,0);
   [-1.2,-.15,.9].forEach(x=>kit.add(bx(.07,.6,1.68),yel,x,1.22,0));[-1,1].forEach(s=>{kit.add(bx(3.9,.12,.02),chk,0,.72,s*.925);kit.add(bx(.1,.04,.02),hub,-.6,.85,s*.93);kit.add(bx(.1,.04,.02),hub,.4,.85,s*.93);
     kit.add(rbox(.12,.1,.18,.03),yel,.95,1.2,s*.98)});
   [-1,1].forEach(s=>{kit.add(rbox(.16,.22,1.9,.06),hub,s*2.12,.45,0)});
   [[1.35,.92],[1.35,-.92],[-1.35,.92],[-1.35,-.92]].forEach(([x,z])=>{kit.add(cy(.36,.36,.26,18),tire,x,.36,z,Math.PI/2);kit.add(cy(.2,.2,.27,12),hub,x,.36,z,Math.PI/2)});
   const sg=new T.Mesh(rbox(.7,.22,.3,.05),[roofT,roofT]);sg.position.set(-.15,1.72,0);g.add(sg);kit.build(g);
   const hl=[];[-.65,.65].forEach(z=>{const h=new T.Mesh(cy(.1,.1,.04,12),head);h.rotation.z=Math.PI/2;h.position.set(2.12,.7,z);g.add(h);hl.push(h);const tl=new T.Mesh(bx(.04,.14,.24),tail);tl.position.set(-2.12,.72,z);g.add(tl)});
   S.add(g);t.m=g;t.head=head;t.flash=0;t.stop=0;
   t.tap=utap("street",t.x,t.z,"Press E to wave down the taxi 🚕",()=>{t.stop=2.6;t.flash=1.2;ubeep(420,.18,"square",.05);setTimeout(()=>ubeep(420,.25,"square",.05),230);bub("🚕",["\"Where to, kid? The meter says $3.00 to start.\"","Beep beep! The driver waves at you.","\"Can't stop long — I've got 4 more rides before lunch!\""][i%3])},2.4)});
 U.anims.push((dt,now)=>{for(const t of TAXIS){if(!t.tap)continue;if(t.stop>0){t.stop-=dt;if(t.v0===undefined){t.v0=t.v;t.v=Math.sign(t.v)*1e-4}}else if(t.v0!==undefined){t.v=t.v0;t.v0=undefined}
   t.tap.x=t.x;t.tap.z=t.z;if(t.flash>0){t.flash-=dt;t.head.emissiveIntensity=Math.sin(now/60)>0?2.5:.3}else t.head.emissiveIntensity=.6}})}
/* ---------- 3D DISPLAY WINDOWS on every clothing store, planters + notice case at the school ---------- */
{const kit=Kit(),frm=UM(0x1f3a33,{metalness:.3,roughness:.5}),back=UM(0x3a2a20,{roughness:.8}),plinth=UM(0xd8c3a0,{roughness:.6}),manq=UM(0xf2efe8,{roughness:.5}),
   jac=[0xe23b3b,0x2a6bd8,0xffb52e,0x2a9d8f,0x6b4a2f,0x222222].map(c=>UM(c,{roughness:.7})),strip=UM(0xfff1c8,{emissive:0xffe2a0,emissiveIntensity:1.2}),glassList=[];
 const bld=DOORS.map(d=>{const side=Math.sign(d.z),bx0=d.x-(d.kind==="apartment"?(side>0?-2:2):0);return {kind:d.kind,side,x:bx0,m:mat4(bx0,0,side*14,side>0?Math.PI:0)}});
 const toW=(b,lx,lz)=>({x:b.x+(b.side>0?-lx:lx),z:b.side*(14-lz)});let bi=0;
 bld.filter(b=>b.kind==="clothing").forEach(b=>{[[-2.95,2.7],[2.8,2.8]].forEach(([cx,w],k)=>{const y0=.8,h=2.3,yc=y0+h/2,z0=5,dz=.56;kit.base(b.m);
   kit.add(bx(w,y0,dz),UM(0x1b2a26,{roughness:.6}),cx,y0/2,z0+dz/2);kit.add(bx(w+.2,.1,dz+.14),stoneM,cx,y0+.05,z0+dz/2+.04);kit.add(bx(w-.08,h,.04),back,cx,yc,z0+.03);kit.add(bx(w-.1,.12,dz-.06),plinth,cx,y0+.16,z0+dz/2);
   kit.add(bx(w,.1,dz),frm,cx,y0+h+.05,z0+dz/2);[-1,1].forEach(s=>kit.add(bx(.08,h,dz),frm,cx+s*(w/2-.04),yc,z0+dz/2));kit.add(bx(w-.2,.04,.04),strip,cx,y0+h-.06,z0+dz-.1);kit.add(bx(.04,h,.04),frm,cx,yc,z0+dz-.02);
   [-1,1].forEach((s,m)=>{const mx=cx+s*w/4,j=jac[(bi+m+k)%jac.length];kit.add(cy(.12,.14,.02,14),hub0(),mx,y0+.23,z0+.28);kit.add(cy(.015,.015,.6,6),hub0(),mx,y0+.55,z0+.28);
     kit.add(new T.CapsuleGeometry(.16,.34,2,8),j,mx,y0+1.12,z0+.28,0,0,0,1.25,1,.7);kit.add(sp(.09,7),j,mx-.2,y0+1.38,z0+.28);kit.add(sp(.09,7),j,mx+.2,y0+1.38,z0+.28);
     kit.add(new T.CapsuleGeometry(.05,.4,2,6),j,mx-.24,y0+1.08,z0+.3,0,0,.12);kit.add(new T.CapsuleGeometry(.05,.4,2,6),j,mx+.24,y0+1.08,z0+.3,0,0,-.12);
     kit.add(cy(.035,.04,.1,8),manq,mx,y0+1.52,z0+.28);kit.add(sp(.1,8),manq,mx,y0+1.68,z0+.28,0,0,0,.85,1.05,.9);
     for(let q=0;q<3;q++)kit.add(bx(.3,.06,.22),jac[(bi+q+2)%jac.length],cx+s*.08,y0+.25+q*.065,z0+.42)});
   const gm=new T.Mesh(bx(w-.16,h-.1,.02),GLASS);const p=new T.Vector3(cx,yc,z0+dz-.01).applyMatrix4(b.m);gm.position.copy(p);gm.rotation.y=b.side>0?Math.PI:0;S.add(gm);
   const A=toW(b,cx-w/2,z0),B=toW(b,cx+w/2,z0+dz+.04);usolid(A.x,B.x,A.z,B.z,y0+h+.1);const tp=toW(b,cx,z0+1.25);
   utap("street",tp.x,tp.z,"Press E to window-shop 🧥",()=>uoffer("🧥","Jackets and hoodies on display. Price tags are in dollars!","shop","window"),1.05);bi++})});
 bld.filter(b=>b.kind==="school").forEach(b=>{kit.base(b.m);const hedge=UM(0x3f7f3a,{roughness:.9,flatShading:true});
   [-3.7,3.7].forEach(cx=>{kit.add(rbox(2.3,.55,.85,.05),stoneM,cx,.28,5.5);for(let k=0;k<5;k++)kit.add(ico(.34,1),hedge,cx-.9+k*.45,.72+(k%2)*.05,5.5,0,k,0,1,.8,1);for(let k=0;k<4;k++)kit.add(sp(.05,6),UM(0xffd23f),cx-.7+k*.45,.95,5.78)});
   kit.add(bx(1.8,1.5,.14),UM(0x24407a),-3.85,3.5,5.07);kit.add(bx(1.6,1.3,.02),UM(0xc49a6c,{roughness:1}),-3.85,3.5,5.15);
   [[-.5,.3,0xffffff],[.2,.35,0xfff3a8],[-.3,-.3,0xbfe6ff],[.45,-.25,0xffd0e0]].forEach(([a,c,col])=>kit.add(bx(.42,.5,.012),UM(col),-3.85+a,3.5+c,5.17,0,0,a*.1));
   const gm=new T.Mesh(bx(1.62,1.32,.02),GLASS);gm.position.copy(new T.Vector3(-3.85,3.5,5.2).applyMatrix4(b.m));gm.rotation.y=b.side>0?Math.PI:0;S.add(gm);
   [-3.7,3.7].forEach(cx=>{const A=toW(b,cx-1.15,5.07),B=toW(b,cx+1.15,5.93);usolid(A.x,B.x,A.z,B.z,.6)});
   const tp=toW(b,-3.85,6.1);utap("street",tp.x,tp.z,"Press E to read the school notice board 📌",()=>uoffer("📌","FIELD DAY FRIDAY! Every class needs teams of 4.","shirts","notice"),1.2)});
 kit.build(S,{name:"u_storefronts"});
 function hub0(){return silver}}
/* the Canva facade art above the 3D storefront level is a true flat backdrop (upper floors), not a walk-up object */
S.traverse(o=>{if(o.isMesh&&Array.isArray(o.material)&&o.material.some(m=>m&&m.map&&FAC&&Object.values(FAC).includes(m.map)))U.flatOK.add(o)});
/* Theo's idle "review challenge" offer follows you everywhere; when you are right at a street object, the object gets E
   (doors, Brock, Ms. Marcia and every other NPC still win). Talking to Theo (Q) is unchanged. */
{const _intU=interactions;interactions=function(){const L=_intU();if(QG||CH||U.quiz||HELD||DH)return L;const t=nearTap();if(!t||L.some(d=>d.type==="tap"&&d.t===t))return L;
  const inR=L.filter(d=>Math.hypot(d.x-P.x,d.z-P.z)<d.r);
  /* an NPC/door/Brock that is actually in range keeps E; one that is merely listed but out of range no longer hides the object */
  const qt=d=>d.type==="talk"&&d.r===9&&/^Press Q/.test(d.label||"");
         if(inR.some(d=>d.type!=="skill"&&!qt(d)&&!(d.type==="game"&&d.npc==="Theo"&&!d.indoor)&&d.type!=="none"))return L;
  if(inR.length&&Math.hypot(P.x-t.x,P.z-t.z)>Math.min(t.r,1.4))return L;
  const hasQ=L.some(qt);return [{type:"tap",t,x:P.x,z:P.z,r:9,label:t.label+(hasQ?"  ·  Q 💬 talk":"")}].concat(L.filter(d=>!qt(d)))}}

/* perf: rooms you're not in are hidden (all rooms always rendered before: ~1900 draw calls inside Mr. Sal's, 2 fps on CI).
   Inside a room the camera's far plane is 150 m so the street (250+ m away) isn't drawn either. Rooms are sealed boxes, so nothing visible changes; colliders (SOL) and animations are unaffected. */
{const _rlU=roomLights;roomLights=function(){_rlU();for(const k in ROOMS){const g=ROOMS[k].g;if(g&&g!==S&&!(window.HERO&&HERO.parent===g))g.visible=(AREA===k)}const f=AREA==="street"?400:150;if(cam.far!==f){cam.far=f;cam.updateProjectionMatrix()}};roomLights()}

/* =====================================================================
   19. UNIVERSE · CLOTHING STORE + THEO'S APARTMENT: the Canva wall pictures become real 3D furniture you can walk
   up to, look at from the side and use. (The Canva art now hangs only as framed posters, which really are flat.)
   ===================================================================== */
/* crop part of a Canva room picture into a framed poster: u0,v0,u1,v1 in 0..1 of the image */
function uposter(g,name,u0,v0,u1,v1,x,y,z,w,ry=0,frame=0x2a1a10){const t=TL.load("tex/room_"+name+".webp");t.colorSpace=T.SRGBColorSpace;t.repeat.set(u1-u0,v1-v0);t.offset.set(u0,1-v1);
  const h=w*((v1-v0)*9)/((u1-u0)*16),grp=new T.Group();grp.position.set(x,y,z);grp.rotation.y=ry;g.add(grp);const fr=new T.Mesh(rbox(w+.12,h+.12,.05,.015),UM(frame));grp.add(fr);
  const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:t,roughness:.7}));p.position.z=.03;grp.add(p);U.flatOK.add(p);return grp}
/* T-shirt and hoodie silhouettes (extruded, bevelled) + a wire hanger */
const SHIRT=(()=>{const s=new T.Shape();s.moveTo(-.12,.3);s.lineTo(-.25,.25);s.lineTo(-.34,.08);s.lineTo(-.24,.03);s.lineTo(-.18,.13);s.lineTo(-.18,-.32);s.lineTo(.18,-.32);s.lineTo(.18,.13);s.lineTo(.24,.03);s.lineTo(.34,.08);s.lineTo(.25,.25);s.lineTo(.12,.3);s.quadraticCurveTo(0,.2,-.12,.3);
  const g=new T.ExtrudeGeometry(s,{depth:.03,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1,curveSegments:4});g.translate(0,0,-.015);return g})();
const HANGER=(()=>{const k=Kit(),m=UM(0xc9ced4,{metalness:.8,roughness:.3}),g=new T.Group();k.add(new T.TorusGeometry(.04,.006,4,10,Math.PI*1.4),m,0,.38,0,0,0,-.2);k.add(bx(.5,.012,.012),m,0,.3,0);k.add(bx(.012,.1,.012),m,0,.33,0);k.build(g,{shadow:false});return g.children[0].geometry})();
/* ---------- CLOTHING STORE ---------- */
{const C=ROOMS.clothing,g=C.g,cz=C.cz;
 uremove(g,o=>o.material&&o.material.map&&/room_clothing/.test((o.material.map.image&&o.material.map.image.src)||"")||o.geometry&&o.geometry.type==="PlaneGeometry"&&Math.abs(o.position.z-(-RD/2+.27))<.01&&o.geometry.parameters.width===9.9);
 const kit=Kit(),oak=UM(0xb98552,{roughness:.6}),oakD=UM(0x7a5236,{roughness:.7}),white=UM(0xf4f1ea,{roughness:.6}),metal=UM(0x3a3a3a,{metalness:.7,roughness:.35}),
   tee=[0xe23b3b,0xffd23f,0x2a9d8f,0x3d5af1,0xff8fb1,0x1d1d1d,0xffffff,0x7cc33a].map(c=>UM(c,{roughness:.8}));
 /* back-left: cubby wall of folded shirt stacks (5 x 4 cubbies) */
 {const x0=-8.55,w=5.2,h=3.2,d=.55,zb=-RD/2+.2;kit.add(bx(w,h,.04),oakD,x0+w/2,h/2,zb+.02);for(let c=0;c<=5;c++)kit.add(bx(.05,h,d),oak,x0+c*w/5,h/2,zb+d/2);for(let r=0;r<=4;r++)kit.add(bx(w,.05,d),oak,x0+w/2,.1+r*(h-.1)/4,zb+d/2);
  let n=0;for(let c=0;c<5;c++)for(let r=0;r<4;r++){const cx=x0+w/10+c*w/5,y=.13+r*(h-.1)/4;const st=2+((c+r)%3);for(let k=0;k<st;k++){kit.add(rbox(.72,.07,.38,.025),tee[(c*4+r+k)%8],cx,y+.04+k*.075,zb+.3);n++}}
  usolid(x0,x0+w,cz+zb,cz+zb+d+.05,h);C.cubbyN=n;
  utap("clothing",x0+w/2,zb+1.3,"Press E to look through the folded shirts 👕",()=>uoffer("👕","Soft cotton tees, folded neat in stacks.","shirts","cubby"),1.6)}
 /* back-right: shoe wall with sneakers + Timberland boots on display */
 const shoes=[];{const x0=3.35,w=5.2,h=3.2,zb=-RD/2+.2;kit.add(bx(w,h,.04),white,x0+w/2,h/2,zb+.02);[-0.03,w+.03].forEach(a=>kit.add(bx(.06,h,.42),oakD,x0+a,h/2,zb+.21));
  for(let r=0;r<5;r++){const y=.35+r*.62;kit.add(rbox(w,.05,.36,.015),oak,x0+w/2,y,zb+.2);
   for(let k=0;k<6;k++){const sx=x0+.45+k*.86,boot=r===2&&k>=3,col=boot?UM(0xc8913a,{roughness:.85}):tee[(r*6+k)%8],sole=boot?UM(0x5a3a1a):white;
     if(boot){kit.add(rbox(.2,.24,.36,.05),col,sx,y+.15,zb+.2);kit.add(rbox(.22,.07,.38,.02),sole,sx,y+.06,zb+.2);kit.add(cy(.06,.06,.25,8),col,sx,y+.3,zb+.13)}
     else{kit.add(rbox(.2,.1,.36,.045),col,sx,y+.1,zb+.2);kit.add(rbox(.21,.045,.38,.02),sole,sx,y+.045,zb+.2);kit.add(rbox(.17,.08,.14,.035),col,sx,y+.16,zb+.12)}
     shoes.push({x:sx,y,boot})}}
  sign(g,"TIMBERLAND BOOTS · 150 XP",x0+w*.75,1.95,zb+.42,1.9,.22,"#5a3a1a","#ffd23f");usolid(x0,x0+w,cz+zb,cz+zb+.45,h);
  utap("clothing",x0+w/2,zb+1.2,"Press E to check out the shoe wall 👟",()=>uoffer("👟","Fresh kicks! The Timberland boots are an XP upgrade in the shop (150 XP).","shop","shoes"),1.6)}
 /* neon MR. SAL'S over the counter (a real lit tube sign, not a picture) */
 {const t=canvasTex(1024,256,(c,W,H)=>{c.clearRect(0,0,W,H);c.font="900 170px 'Brush Script MT',cursive";c.textAlign="center";c.textBaseline="middle";c.shadowColor="#ff2bc0";c.shadowBlur=40;c.fillStyle="#ffe6fb";c.fillText("Mr. Sal's",W/2,H/2+8)});
  const p=new T.Mesh(new T.PlaneGeometry(4,1),new T.MeshBasicMaterial({map:t,transparent:true,toneMapped:false}));p.position.set(0,4.35,-RD/2+.32);g.add(p);U.flatOK.add(p);kit.add(rbox(4.3,1.15,.08,.03),UM(0x1b1b2a),0,4.35,-RD/2+.24);
  const nl=new T.PointLight(0xff5ad8,6,6);nl.position.set(0,4.2,-RD/2+1.2);g.add(nl)}
 /* counter: oak top, panelled front, register, bag stack (replaces the plain box) */
 uremove(g,o=>o.geometry&&o.geometry.type==="BoxGeometry"&&o.geometry.parameters.width===4&&o.geometry.parameters.height===1.1&&Math.abs(o.position.z+5.3)<.01);
 kit.add(rbox(4.2,.08,1.3,.03),oak,0,1.12,-5.3);kit.add(bx(4,1.04,1.1),UM(0x1f7a72,{roughness:.6}),0,.54,-5.3);for(let k=0;k<4;k++)kit.add(rbox(.85,.7,.04,.02),UM(0x26948a,{roughness:.55}),-1.5+k,.55,-4.73);
 kit.add(bx(4.04,.08,1.14),oakD,0,.04,-5.3);
 const reg=new T.Group();reg.position.set(-1.2,1.16,-5.3);g.add(reg);{const rk=Kit();rk.add(rbox(.5,.18,.42,.03),UM(0x2b2f36,{metalness:.3}),0,.09,0);rk.add(rbox(.42,.26,.06,.02),UM(0x2b2f36),0,.33,-.12,-.3);rk.add(bx(.36,.18,.01),UM(0x6fd0ff,{emissive:0x2bb0ff,emissiveIntensity:.8}),0,.34,-.085,-.3);
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)rk.add(bx(.06,.025,.05),UM(0xeeeeee),-.08+i*.08,.19,.02+j*.07);rk.build(reg)}
 const drawer=new T.Mesh(rbox(.46,.08,.36,.015),UM(0x3a3f48,{metalness:.4}));drawer.position.set(0,.04,.02);reg.add(drawer);
 for(let k=0;k<4;k++)kit.add(bx(.36,.02,.48),UM(0xe9d8b4),1.3,1.17+k*.02,-5.3);
 /* hoodies on a wall rail (left wall) */
 {kit.add(cy(.025,.025,5,8),metal,-8.6,2.1,0,Math.PI/2);[-2.4,2.4].forEach(z=>kit.add(bx(.3,.05,.05),metal,-8.72,2.1,z));for(let k=0;k<10;k++){const z=-2.2+k*.48;kit.add(HANGER,metal,-8.55,1.75,z,0,Math.PI/2,0);kit.add(SHIRT,tee[(k+3)%8],-8.55,1.72,z,0,Math.PI/2,0,1.2,1.5,1.4)}}
 /* hat pegboard (right wall) */
 const hats=[];{kit.add(bx(.05,1.6,3),UM(0xd8c3a0),8.78,2,3.5);for(let r=0;r<2;r++)for(let k=0;k<5;k++){const z=2.3+k*.6,y=1.6+r*.75,c=tee[(r*5+k+1)%8];kit.add(cy(.012,.012,.18,6),metal,8.68,y,z,0,0,Math.PI/2);
  kit.add(new T.SphereGeometry(.15,12,6,0,Math.PI*2,0,Math.PI/2),c,8.6,y-.02,z,0,0,Math.PI/2);kit.add(cy(.15,.15,.02,12,false),c,8.48,y-.1,z,Math.PI/2.4,0,Math.PI/2);hats.push({y,z,c})}}
 utap("clothing",8,3.5,"Press E to try on a hat 🧢",()=>{const h=hats[Math.floor(Math.random()*hats.length)];bub("🧢","Looking fresh! (Hats are 12 coins in the shop.)")},1.4);
 /* fitting room booth with a sliding curtain (front-left corner) */
 const cur=new T.Group();{const x=-7.7,z=5.2;kit.add(bx(1.8,2.6,.06),white,x,1.3,z-.9);kit.add(bx(1.8,2.6,.06),white,x,1.3,z+.9);kit.add(bx(.06,2.6,1.8),white,x-.88,1.3,z);kit.add(bx(1.9,.1,1.9),oakD,x,2.65,z);
  kit.add(rbox(.04,1.3,.6,.02),UM(0xcfe6ff,{metalness:.9,roughness:.05}),x-.84,1.4,z);kit.add(bx(.04,.04,1.8),metal,x+.88,2.45,z);sign(g,"FITTING ROOM",x+.92,2.75,z,1.5,.25,"#1f7a72","#fff",Math.PI/2);
  cur.position.set(x+.88,0,z);g.add(cur);const cm=UM(0x8a1f2d,{roughness:.9,side:T.DoubleSide});for(let k=0;k<8;k++){const m=new T.Mesh(cy(.06,.06,2.2,8,true),cm);m.position.set(0,1.32,-.8+k*.23);m.scale.set(.6,1,1);cur.add(m)}
  usolid(cz*0+x-.9,x+.9,cz+z-.95,cz+z-.85,2.6);usolid(x-.9,x+.9,cz+z+.85,cz+z+.95,2.6);usolid(x-.95,x-.85,cz+z-.9,cz+z+.9,2.6)}
 let curO=0,curC=0;utap("clothing",-6.4,5.2,"Press E to open the fitting room curtain 🪞",()=>{curO=!curO;ubeep(curO?600:400,.08,"triangle",.03);bub("🪞",curO?"Step in and try something on!":"Curtain closed.");},1.4);
 /* mannequins in outfits (replace the plain boxes) */
 uremove(g,o=>o.geometry&&o.geometry.type==="BoxGeometry"&&((o.geometry.parameters.width===.9&&o.geometry.parameters.height===.15)||(o.geometry.parameters.width===.6&&o.geometry.parameters.height===1.4))&&Math.abs(Math.abs(o.position.x)-6)<.01);
 [-6,6].forEach((x,i)=>{const j=tee[i?3:0],pants=UM(i?0x2a3a5a:0x3a2a1a);kit.add(cy(.3,.34,.06,20),oakD,x,.03,3);kit.add(cy(.02,.02,.7,6),metal,x,.4,3);
   kit.add(new T.CapsuleGeometry(.11,.6,2,8),pants,x-.1,.78,3);kit.add(new T.CapsuleGeometry(.11,.6,2,8),pants,x+.1,.78,3);kit.add(new T.CapsuleGeometry(.2,.4,2,10),j,x,1.42,3,0,0,0,1.2,1,.75);
   kit.add(new T.CapsuleGeometry(.065,.5,2,6),j,x-.32,1.36,3,0,0,.15);kit.add(new T.CapsuleGeometry(.065,.5,2,6),j,x+.32,1.36,3,0,0,-.15);kit.add(cy(.05,.05,.12,8),white,x,1.83,3);kit.add(sp(.13,10),white,x,2.0,3,0,0,0,.85,1.1,.9);
   kit.add(new T.SphereGeometry(.15,12,6,0,Math.PI*2,0,Math.PI/2),tee[i?1:4],x,2.06,3);usolid(x-.35,x+.35,cz+2.65,cz+3.35,2.1)});
 utap("clothing",-6,2,"Press E to check the mannequin's outfit 👖",()=>bub("👖","Red hoodie + brown cargo pants. A whole outfit!"),1.2);
 utap("clothing",6,2,"Press E to check the mannequin's outfit 👖",()=>bub("👖","Blue tee + navy jeans + a yellow cap. Classic!"),1.2);
 kit.build(g,{name:"u_clothing"});
 /* the rack shirts become real T-shirt shapes on hangers (same meshes, so try-on/put-back still works) */
 g.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==="BoxGeometry"&&o.geometry.parameters.width===.4&&o.geometry.parameters.height===1&&o.geometry.parameters.depth===.12){o.geometry=SHIRT;o.scale.set(1.05,1.5,1);o.rotation.y=0;const hg=new T.Mesh(HANGER,metal);hg.position.y=-.02;hg.scale.set(1/1.05,1/1.5,1);o.add(hg)}});
 uposter(g,"clothing",.33,.18,.67,.44,0,2.0,-RD/2+.25,1.6,0);/* Canva "Mr. Sal's" doorway art as a framed poster behind the counter */
 U.anims.push((dt,now)=>{if(AREA!=="clothing")return;curC+=((curO?1:0)-curC)*Math.min(1,dt*6);cur.children.forEach((m,k)=>{m.position.z=-.8+k*.23*(1-curC*.8)})});
 utap("clothing",-1.2,-4.3,"Press E to ring up the register 💵",()=>{ubeep(1300,.08,"square",.04);setTimeout(()=>ubeep(1700,.12,"square",.04),110);drawer.position.z=.25;setTimeout(()=>drawer.position.z=.02,1500);uoffer("💵","Ka-ching! The drawer slides open.","shop","register")},.9)}
/* ---------- THEO'S APARTMENT ---------- */
{const A=ROOMS.apartment,g=A.g,cz=A.cz;
 uremove(g,o=>o.geometry&&o.geometry.type==="PlaneGeometry"&&Math.abs(o.position.z-(-RD/2+.27))<.01&&o.geometry.parameters.width===9.9);
 const kit=Kit(),oak=UM(0xa8743f,{roughness:.6}),oakD=UM(0x6b4123,{roughness:.7}),white=UM(0xf4f1ea,{roughness:.6}),metal=UM(0x9aa0a8,{metalness:.8,roughness:.3}),fab=UM(0x3d6fb0,{roughness:.95}),fab2=UM(0x335d96,{roughness:.95}),
   bk=[0xc0392b,0x2a6bd8,0xffb52e,0x2a9d8f,0x8a5cff,0x6b4a2f,0xe8e0d0,0x1d1d1d].map(c=>UM(c,{roughness:.8})),zb=-RD/2+.2;
 /* couch, coffee table, bed (replace the plain boxes) */
 uremove(g,o=>o.geometry&&o.geometry.type==="BoxGeometry"&&o.material&&o.material.color&&[0x3d6fb0,0x7a4a2a,0xe8e0d0].includes(o.material.color.getHex())&&o.position.z<0&&o.position.z>-7&&o.geometry.parameters.width>=2.4);
 kit.add(rbox(4.2,.42,1.5,.08),fab2,-3,.3,-3.1);[-1,0,1].forEach(k=>{kit.add(rbox(1.32,.22,1.2,.08),fab,-3+k*1.36,.62,-2.95);kit.add(rbox(1.3,.75,.3,.1),fab,-3+k*1.36,.95,-3.7,-.12)});
 [-1,1].forEach(s=>kit.add(rbox(.32,.75,1.5,.1),fab2,-3+s*2.2,.55,-3.1));[[-4.9,-3.75],[-1.1,-3.75],[-4.9,-2.45],[-1.1,-2.45]].forEach(([x,z])=>kit.add(cy(.04,.03,.12,6),oakD,x,.06,z));
 kit.add(rbox(.42,.4,.12,.05),UM(0xffb52e,{roughness:.95}),-4.4,.92,-3.45,-.2,.3);kit.add(rbox(.42,.4,.12,.05),UM(0xe23b3b,{roughness:.95}),-1.6,.92,-3.45,-.2,-.3);
 kit.add(rbox(2.4,.07,1.2,.03),oak,-3,.44,-.8);[[-1.1,-.3],[1.1,-.3],[-1.1,.3],[1.1,.3]].forEach(([a,b])=>kit.add(bx(.06,.4,.06),oakD,-3+a,.2,-.8+b));kit.add(bx(2.2,.03,1),oakD,-3,.12,-.8);
 kit.add(rbox(.16,.03,.06,.01),UM(0x222222),-3.4,.49,-.7,0,.4);kit.add(rbox(.3,.04,.22,.01),bk[1],-2.5,.5,-.9,0,-.2);kit.add(cy(.05,.045,.1,10),white,-2.2,.53,-.6);
 kit.add(rbox(2.6,.35,4,.05),oakD,5.5,.2,-4.5);kit.add(rbox(2.5,.3,3.9,.12),white,5.5,.5,-4.5);kit.add(rbox(2.56,.12,2.6,.06),UM(0x2a9d8f,{roughness:.95}),5.5,.67,-3.75);
 [-.6,.6].forEach(a=>kit.add(rbox(.9,.18,.45,.09),UM(0xffffff,{roughness:.9}),5.5+a,.72,-6.05));kit.add(rbox(2.7,1.3,.12,.05),oakD,5.5,.75,-6.6);
 /* bookshelf (back-left) with real books */
 {const x0=-8.7,w=1.9,h=3,d=.4;kit.add(bx(w,h,.03),oakD,x0+w/2,h/2,zb+.015);[0,w].forEach(a=>kit.add(bx(.05,h,d),oak,x0+a,h/2,zb+d/2));for(let r=0;r<=5;r++)kit.add(bx(w,.04,d),oak,x0+w/2,.05+r*(h-.1)/5,zb+d/2);
  let n=0;for(let r=0;r<5;r++){let x=x0+.08;const y=.07+r*(h-.1)/5;while(x<x0+w-.15){const bw=.05+((n*7)%5)*.012,bh=.3+((n*3)%4)*.04;kit.add(bx(bw,bh,.26),bk[n%8],x+bw/2,y+bh/2,zb+.2,0,0,(n%9===0)?.12:0);x+=bw+.006;n++}}
  A.books=n;usolid(x0,x0+w,cz+zb,cz+zb+d,h);utap("apartment",x0+w/2,zb+1.1,"Press E to pull a book off the shelf 📚",()=>uoffer("📚","Theo's books: comics, a dinosaur guide, and Math Mysteries!","books","shelf"),1.3)}
 /* window with a sill, mullions, a city view set back behind the glass, plants */
 {const W=3,H=2.2,y=2.5;const sk=TL.load("tex/skyline.webp");sk.colorSpace=T.SRGBColorSpace;const view=new T.Mesh(new T.PlaneGeometry(W,H),new T.MeshBasicMaterial({map:sk,toneMapped:false}));view.position.set(-1.6,y,zb+.01);g.add(view);U.flatOK.add(view);
  [-1,1].forEach(s=>kit.add(bx(.14,H+.2,.32),white,-1.6+s*(W/2+.07),y,zb+.16));kit.add(bx(W+.28,.14,.32),white,-1.6,y+H/2+.07,zb+.16);kit.add(rbox(W+.5,.08,.42,.02),white,-1.6,y-H/2-.04,zb+.21);
  kit.add(bx(.05,H,.05),white,-1.6,y,zb+.1);kit.add(bx(W,.05,.05),white,-1.6,y+.2,zb+.1);const gl=new T.Mesh(bx(W,H,.01),GLASS);gl.position.set(-1.6,y,zb+.12);g.add(gl);
  [-2.6,-.6].forEach(x=>{kit.add(cy(.12,.09,.18,12),UM(0xb85c38),x,y-H/2+.09,zb+.25);for(let k=0;k<5;k++)kit.add(ico(.08,0),UM(0x3f8f3a,{flatShading:true}),x+Math.cos(k)*.07,y-H/2+.25+k*.03,zb+.25+Math.sin(k)*.07)});
  uposter(g,"apartment",.29,.25,.4,.52,-4.8,2.7,zb+.03,.75,0);uposter(g,"apartment",.69,.15,.79,.43,1.3,2.9,zb+.03,.7,0)}
 /* TV on a media console; press E for a math game show */
 const tvS=new T.Mesh(bx(1.5,.85,.02),UM(0x0a0a12,{emissive:0x000000,roughness:.2}));{kit.add(rbox(2.2,.55,.5,.04),oakD,2.3,.28,zb+.3);[-.55,0,.55].forEach(a=>kit.add(rbox(.66,.4,.03,.01),oak,2.3+a,.28,zb+.56));kit.add(rbox(1.6,.95,.06,.03),UM(0x111111),2.3,1.15,zb+.2);
  kit.add(bx(.3,.03,.18),UM(0x222222),2.3,.57,zb+.3);kit.add(bx(.05,.08,.05),UM(0x222222),2.3,.62,zb+.25);tvS.position.set(2.3,1.15,zb+.235);g.add(tvS);usolid(1.2,3.4,cz+zb,cz+zb+.6,1.6)}
 const tvT=canvasTex(512,288,(c,W,H)=>{c.fillStyle="#2b1a6a";c.fillRect(0,0,W,H);c.fillStyle="#ffd23f";c.font="900 54px system-ui";c.textAlign="center";c.fillText("MATH MASTERS",W/2,110);c.font="700 34px system-ui";c.fillStyle="#fff";c.fillText("tonight at 7:00",W/2,170);c.fillText("🍕 pizza fractions round",W/2,220)});let tvOn=false;
 utap("apartment",2.3,zb+1.3,"Press E to turn on the TV 📺",function(){tvOn=!tvOn;tvS.material=tvOn?new T.MeshBasicMaterial({map:tvT,toneMapped:false}):UM(0x0a0a12,{roughness:.2});ubeep(tvOn?500:250,.1,"sine",.04);if(tvOn)uoffer("📺","\"Welcome to MATH MASTERS! Tonight: pizza fractions!\"","pizza","tv");else bub("📺","TV off.")},1.3);
 /* kitchen run along the right wall: base cabinets with doors, sink + faucet, stove + pot, microwave */
 {const x=8.45,z0=-1.9,len=3.4;kit.add(bx(.85,.9,len),white,x,.45,z0+len/2);kit.add(rbox(.95,.06,len+.05,.02),UM(0x3a3f48,{roughness:.35}),x-.04,.93,z0+len/2);
  kit.add(bx(.6,.12,.7),UM(0xb8bcc2,{metalness:.8,roughness:.25}),x-.05,.92,z0+.6);kit.add(cy(.02,.02,.32,8),metal,x+.25,1.1,z0+.6);kit.add(cy(.018,.018,.25,8),metal,x+.12,1.26,z0+.6,0,0,Math.PI/2);
  [[-.15,.15],[.15,.15],[-.15,-.15],[.15,-.15]].forEach(([a,b])=>kit.add(tor(.09,.012,4,14),UM(0x222222),x-.05+a,.965,z0+2.5+b,Math.PI/2));kit.add(bx(.05,.22,.6),UM(0x222222),x-.44,.75,z0+2.5);
  kit.add(cy(.13,.12,.16,14),UM(0xc0392b,{metalness:.4}),x-.05,1.05,z0+2.4);kit.add(rbox(.5,.32,.6,.03),UM(0xdedede,{metalness:.4}),x-.05,1.12,z0+1.55);kit.add(bx(.12,.2,.01),UM(0x111111),x-.31,1.12,z0+1.35);
  for(let k=0;k<4;k++)kit.add(bx(.02,.7,.8),UM(0xe8e2d6),x-.44,.45,z0+.43+k*.85);usolid(x-.45,x+.45,cz+z0,cz+z0+len,1)}
 const mwd=new T.Group();mwd.position.set(8.4-.31,1.12,-1.9+1.25);g.add(mwd);{const d=new T.Mesh(bx(.02,.28,.4),UM(0x222a30,{roughness:.2,metalness:.3}));d.position.z=.2;mwd.add(d)}
 const water=new T.Mesh(cy(.012,.012,.17,6),new T.MeshStandardMaterial({color:0x9fd4ff,transparent:true,opacity:.7}));water.position.set(8.4+.12-.13,1.06,-1.9+.6);water.visible=false;g.add(water);
 let tapOn=0,mwO=0,mwC=0,boil=0;
 utap("apartment",7.4,-1.3,"Press E to turn on the kitchen faucet 🚰",()=>{tapOn=tapOn?0:6;water.visible=!!tapOn;bub("🚰",tapOn?"Water's running! Don't forget to turn it off.":"Faucet off. Saving water!")},1);
 utap("apartment",7.4,-.35,"Press E to open the microwave ⏲️",()=>{mwO=!mwO;ubeep(mwO?800:600,.06,"square",.03);if(mwO)uoffer("⏲️","Popcorn time: the microwave says 2:30. That's 150 seconds!","clock","microwave")},1);
 utap("apartment",7.4,.6,"Press E to cook on the stove 🍲",()=>{boil=5;bub("🍲","Mmm, Theo's grandma's soup is bubbling!")},1);
 U.anims.push((dt,now)=>{if(AREA!=="apartment")return;if(tapOn>0){tapOn-=dt;water.scale.x=1+Math.sin(now/40)*.15;if(tapOn<=0)water.visible=false}mwC+=((mwO?1:0)-mwC)*Math.min(1,dt*7);mwd.rotation.y=-mwC*1.7;
   if(boil>0){boil-=dt;if(Math.random()<.3)upuff(g,8.4,1.16,-1.9+2.4,1,0xffffff,.1,.6,.6,.025,-.3)}});
 /* string lights along the top of the back wall */
 for(let i=0;i<22;i++){const b=new T.Mesh(sp(.045,6),UM([0xffd23f,0xff6b8a,0x6fd0ff,0x6dff6b][i%4],{emissive:[0xffd23f,0xff6b8a,0x6fd0ff,0x6dff6b][i%4],emissiveIntensity:1.5}));b.position.set(-8+i*.76,5.1-Math.sin((i%11)/10*Math.PI)*.3,zb+.12);g.add(b)}
 kit.build(g,{name:"u_apartment"})}

/* =====================================================================
   20. UNIVERSE · SCHOOL (lobby, hallway, gym, cafeteria, rooftop): the Canva wall pictures of shelves, doors, hoops,
   serving lines become real 3D you can walk up to; Canva art stays only as framed posters. Everything gets an E action.
   ===================================================================== */
function uartOff(R){let n=0;R.g.children.slice().forEach(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==="PlaneGeometry"&&o.material&&o.material.isMeshBasicMaterial&&o.material.map&&Math.abs(o.geometry.parameters.height-o.geometry.parameters.width*9/16)<.01){R.g.remove(o);n++}});return n}
function wallClock(g,x,y,z,ry){const grp=new T.Group();grp.position.set(x,y,z);grp.rotation.y=ry;g.add(grp);const k=Kit();k.add(cy(.38,.38,.07,28),UM(0x222222),0,0,.035,Math.PI/2);k.add(cy(.34,.34,.075,28),UM(0xfafafa),0,0,.04,Math.PI/2);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.add(bx(.025,i%3?.04:.08,.01),UM(0x111111),Math.sin(a)*.29,Math.cos(a)*.29,.08,0,0,-a)}k.build(grp);
  const mk=(L,w,c)=>{const p=new T.Group();p.position.z=.09;const m=new T.Mesh(bx(w,L,.008),UM(c));m.position.y=L/2-.03;p.add(m);grp.add(p);return p};const hh=mk(.18,.03,0x111111),mm=mk(.27,.02,0x111111),ss=mk(.29,.008,0xd62828);
  U.anims.push(()=>{const d=new Date(),s=d.getSeconds(),m=d.getMinutes()+s/60,h=d.getHours()%12+m/60;ss.rotation.z=-s/60*Math.PI*2;mm.rotation.z=-m/60*Math.PI*2;hh.rotation.z=-h/12*Math.PI*2});return grp}
function fountain(g,x,z,ry,area){const grp=new T.Group();grp.position.set(x,0,z);grp.rotation.y=ry;g.add(grp);const st=UM(0xc9ced4,{metalness:.8,roughness:.25}),k=Kit();k.add(rbox(.6,.32,.45,.05),st,0,.92,.22);k.add(bx(.12,.75,.12),st,0,.4,.08);k.add(cy(.17,.12,.06,16),UM(0x9aa0a8,{metalness:.9}),0,1.07,.25);k.add(cy(.02,.02,.08,8),st,0,1.12,.12);k.build(grp);
  const arc=[];for(let i=0;i<8;i++){const d=new T.Mesh(sp(.018,5),UM(0x9fd4ff,{emissive:0x4aa0ff,emissiveIntensity:.4}));d.visible=false;grp.add(d);arc.push(d)}let on=0;
  U.anims.push((dt,now)=>{if(on>0){on-=dt;arc.forEach((d,i)=>{const t=((now/400+i/8)%1);d.visible=on>0;d.position.set(0,1.16+Math.sin(t*Math.PI)*.12,.12+t*.2)})}});
  const wp=new T.Vector3(0,0,.9).applyAxisAngle(new T.Vector3(0,1,0),ry);utap(area,x+wp.x,z+wp.z,"Press E to get a drink from the fountain 💧",()=>{on=3;bub("💧","Ahh, cold water! Stay hydrated, mathematician.")},1.1)}
function binLid(g,x,z,col,label,area,what){const grp=new T.Group();grp.position.set(x,0,z);g.add(grp);const k=Kit(),c=UM(col,{roughness:.5});k.add(rbox(.55,.8,.55,.05),c,0,.4,0);k.add(cy(.22,.22,.02,14),UM(0x161616),0,.79,0);k.build(grp);
  const h=new T.Group();h.position.set(0,.82,-.28);grp.add(h);const lid=new T.Mesh(rbox(.6,.06,.6,.025),c);lid.position.z=.28;h.add(lid);sign(grp,label,0,.5,.29,.45,.14,"#ffffff","#14123a");let o=0,cu=0;
  U.anims.push(dt=>{cu+=((o?1:0)-cu)*Math.min(1,dt*7);h.rotation.x=-cu*1.8});const R=ROOMS[area];usolid(x-.3,x+.3,R.cz+z-.3,R.cz+z+.3,.85);
  utap(area,x,z+.7,"Press E to lift the "+label.toLowerCase()+" bin lid",()=>{o=!o;if(o)bub("🗑️","Inside: "+what)},1)}
/* ---------- LOBBY ---------- */
{const R=ROOMS.lobby,g=R.g,cz=R.cz,wx=-9+.22;uartOff(R);const k=Kit(),cork=UM(0xc49a6c,{roughness:1}),fr=UM(0x7a4a2a),pin=[0xd62828,0x2a6bd8,0xffd23f,0x2a9d8f];
 /* cork bulletin board with real pinned papers (left wall) */
 k.add(bx(.08,1.9,3.6),fr,wx+.04,2.3,-2.4);k.add(bx(.04,1.7,3.4),cork,wx+.09,2.3,-2.4);
 [[-3.6,2.7,0xffffff],[-2.9,2.75,0xfff3a8],[-2.2,2.65,0xbfe6ff],[-1.5,2.7,0xffd0e0],[-3.4,1.9,0xd7ffd0],[-2.5,1.85,0xffffff],[-1.6,1.9,0xfff3a8]].forEach(([z,y,c],i)=>{k.add(bx(.012,.55,.45),UM(c),wx+.12,y,z,0,0,(i%3-1)*.04);k.add(sp(.025,6),UM(pin[i%4]),wx+.14,y+.22,z)});
 const notes=["Spelling Bee — Thursday!","Math Club: 4 × 6 = 24 members","Lost: blue water bottle","Field Day: bring sneakers","Book Fair: books are $4 each","Art show in the gym","Kindness Challenge ⭐"];
 notes.forEach((t,i)=>{});sign(g,"WELCOME EXPLORERS!",wx+.14,3.35,-2.4,3,.32,"#24407a","#ffd23f",Math.PI/2);
 utap("lobby",-7.9,-2.4,"Press E to read the bulletin board 📌",()=>{const t=notes[Math.floor(Math.random()*notes.length)];uoffer("📌","Notice: "+t,/\$4/.test(t)?"fruit":"mult","lobbyboard")},1.6);
 /* wall clock + framed Canva posters */
 wallClock(g,wx+.05,4.2,1.8,Math.PI/2);utap("lobby",-7.9,1.8,"Press E to check the clock 🕒",()=>{const d=new Date();uoffer("🕒","It's "+((d.getHours()%12)||12)+":"+String(d.getMinutes()).padStart(2,"0")+". How long until recess?","clock","lobbyclock")},1.4);
 uposter(g,"lobby",.71,.1,.92,.33,wx+.06,2.4,2.2,1.5,Math.PI/2,0x24407a);uposter(g,"lobby",.02,.15,.25,.43,wx+.06,2.5,5.2,1.4,Math.PI/2,0x24407a);
 fountain(g,wx+.25,-5.2,Math.PI/2,"lobby");
 /* office counter: bell, sign-in clipboard, pencil cup */
 k.add(cy(.09,.11,.03,16),UM(0x7a4a2a),-3.6,1.2,-1.2);const bell=new T.Mesh(new T.SphereGeometry(.08,14,6,0,Math.PI*2,0,Math.PI/2),UM(0xffd23f,{metalness:.9,roughness:.2}));bell.position.set(-3.6,1.21,-1.2);g.add(bell);
 k.add(bx(.32,.02,.42),UM(0x8a6a44),-4.6,1.19,-1.1);k.add(bx(.28,.005,.36),UM(0xffffff),-4.6,1.205,-1.1);k.add(bx(.1,.03,.05),silver,-4.6,1.21,-1.3);k.add(cy(.06,.05,.14,12),UM(0x2a6bd8),-6.5,1.25,-1.2);
 for(let i=0;i<4;i++)k.add(cy(.008,.008,.2,5),UM([0xffd23f,0xe23b3b,0x2a9d8f,0x3d7be0][i]),-6.5+(i-1.5)*.025,1.35,-1.2,(i-1.5)*.15);
 let ring=0;U.anims.push(dt=>{ring=Math.max(0,ring-dt);bell.position.y=1.21+Math.abs(Math.sin(ring*40))*.02*ring});
 utap("lobby",-3.6,0,"Press E to ring the office bell 🛎️",()=>{ring=.8;ubeep(1760,.5,"sine",.06);bub("🛎️","Ding! \"Welcome! Sign in on the clipboard, please.\"")},1.1);
 utap("lobby",-4.6,0,"Press E to sign in on the clipboard 📋",()=>bub("📋","You signed in: "+(window.PNAME||"Explorer")+" — 8:05 AM. Right on time!"),1);
 /* lost & found box with a hinged lid */
 const lf=new T.Group();lf.position.set(7.6,0,2.2);g.add(lf);{const lk=Kit();lk.add(bx(1.1,.6,.7),UM(0x8a5a32),0,.3,0);lk.build(lf);sign(lf,"LOST & FOUND",0,.4,.36,.9,.2,"#24407a","#fff")}
 const lh=new T.Group();lh.position.set(0,.6,-.35);lf.add(lh);{const l=new T.Mesh(bx(1.14,.05,.74),UM(0x6b4123));l.position.z=.35;lh.add(l)}
 for(const [c,x,y] of [[0xe23b3b,-.3,.5],[0x2a6bd8,.1,.52],[0x6dff6b,.35,.48]]){const m=new T.Mesh(ico(.13,0),UM(c,{flatShading:true}));m.position.set(x,y,0);m.scale.y=.6;lf.add(m)}
 let lo=0,lc=0;U.anims.push(dt=>{lc+=((lo?1:0)-lc)*Math.min(1,dt*7);lh.rotation.x=-lc*1.7});usolid(7.05,8.15,cz+1.85,cz+2.55,.65);
 utap("lobby",7.6,3.1,"Press E to open the Lost & Found box 🧤",()=>{lo=!lo;if(!lo)return;if(onceXP("lostfound",10,"🧤 You returned a lost glove to the office! +10 XP"))return;bub("🧤","A red mitten, a blue hat, and a green yo-yo. No name tags!")},1.2);
 /* plants get pots with rims + leaves; benches get slats */
 [[-8,-7],[8,6.8],[-8,6.8]].forEach(([x,z])=>{k.add(tor(.42,.05,6,16),UM(0x9a4a2a),x,.7,z,Math.PI/2);for(let i=0;i<7;i++){const a=i*.9;k.add(new T.CapsuleGeometry(.06,.5,2,6),UM(0x2f7a2a,{flatShading:true}),x+Math.cos(a)*.25,1.4+i%2*.15,z+Math.sin(a)*.25,Math.sin(a)*.5,0,Math.cos(a)*.5)}});
 utap("lobby",-7.2,-6.2,"Press E to water the plant 🪴",()=>{upuff(g,-8,1.3,-7,10,0x6fb6ff,.6,1,.6,.03);bub("🪴","Glug glug. The plant looks happier already!")},1.2);
 k.build(g,{name:"u_lobby"})}
/* ---------- HALLWAY: real double doors to the rooftop stairs, clock, fountain, fire extinguisher cabinet, bins ---------- */
{const R=ROOMS.hallway,g=R.g,cz=R.cz,zb=-15+.22;uartOff(R);const k=Kit(),teal=UM(0x2a8fa8,{metalness:.3,roughness:.4}),bar=UM(0xc9ced4,{metalness:.85,roughness:.25});
 [-1,1].forEach(s=>{const x=s*.66;k.add(rbox(1.28,2.8,.08,.02),teal,x,1.4,zb+.05);k.add(bx(.7,1.2,.02),UM(0x1d2a38,{roughness:.1,metalness:.5}),x,1.95,zb+.1);k.add(bx(.9,.07,.07),bar,x,1.1,zb+.15);[-.4,.4].forEach(a=>k.add(bx(.05,.1,.1),bar,x+a,1.1,zb+.11))});
 k.add(bx(2.9,.18,.2),UM(0x1f5f70),0,2.9,zb+.08);[-1.45,1.45].forEach(x=>k.add(bx(.14,3,.2),UM(0x1f5f70),x,1.5,zb+.08));sign(g,"ROOFTOP GARDEN ↑",0,3.35,zb+.06,2.6,.35,"#1f5f70","#ffffff");
 wallClock(g,2.9,3.4,zb+.02,0);uposter(g,"hallway",.0,.06,.12,.3,-3.1,2.4,zb+.06,1.1,0,0x24407a);uposter(g,"hallway",.79,.06,1,.3,3,2.3,zb+.06,1.6,0,0x24407a);
 fountain(g,-4.28,13.6,Math.PI/2,"hallway");
 /* fire extinguisher cabinet: glass door swings, red extinguisher inside */
 const fe=new T.Group();fe.position.set(4.28,1.3,13.6);fe.rotation.y=-Math.PI/2;g.add(fe);{const fk=Kit();fk.add(bx(.6,.9,.2),UM(0xd8d8d8,{metalness:.5}),0,0,.1);fk.add(cy(.09,.09,.5,14),UM(0xd62828,{metalness:.3}),0,-.05,.12);fk.add(cy(.03,.04,.12,8),UM(0x222222),0,.26,.12);fk.add(new T.TorusGeometry(.06,.012,4,10,Math.PI),UM(0x222222),.06,.3,.12);fk.build(fe)}
 const fd=new T.Group();fd.position.set(-.3,0,.21);fe.add(fd);{const d=new T.Mesh(bx(.6,.9,.02),GLASS);d.position.x=.3;fd.add(d);const fr=new T.Mesh(bx(.6,.04,.03),UM(0xbbbbbb));fr.position.set(.3,.43,0);fd.add(fr)}sign(fe,"FIRE EXTINGUISHER",0,.55,.21,.6,.12,"#d62828","#fff");
 let fo=0,fc=0;U.anims.push(dt=>{fc+=((fo?1:0)-fc)*Math.min(1,dt*7);fd.rotation.y=-fc*1.6});
 utap("hallway",3.6,13.6,"Press E to open the fire extinguisher cabinet 🧯",()=>{fo=!fo;if(fo)bub("🧯","Only grown-ups use this — in a real fire, walk calmly outside with your class!")},1);
 binLid(g,-3.2,-14.2,0x2a6bd8,"RECYCLE","hallway","crumpled drafts of a times-table poster and 3 juice boxes.");binLid(g,3.2,-14.2,0x2f6b3a,"TRASH","hallway","pencil shavings and a banana peel. Ew!");
 k.build(g,{name:"u_hallway"})}
/* ---------- GYM: 3D hoop with net, scoreboard, wall pads, banners, ball rack, slatted bleachers ---------- */
{const R=ROOMS.gym,g=R.g,cz=R.cz,zb=-10+.22;uartOff(R);const k=Kit(),white=UM(0xffffff,{roughness:.4}),orange=UM(0xff6a1a,{metalness:.3,roughness:.4}),steel=UM(0x5a5f66,{metalness:.7,roughness:.4});
 k.add(bx(.16,.16,1.2),steel,0,3.7,zb+.6);k.add(bx(.12,.9,.12),steel,0,3.3,zb+.1);k.add(rbox(1.8,1.05,.06,.02),white,0,3.95,zb+1.2);k.add(bx(.6,.45,.065),UM(0xd62828),0,3.75,zb+1.21);k.add(bx(.5,.35,.07),white,0,3.75,zb+1.215);
 k.add(tor(.23,.018,6,24),orange,0,3.48,zb+1.5,Math.PI/2);k.add(bx(.1,.04,.2),orange,0,3.48,zb+1.28);
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.add(cy(.006,.006,.42,3),white,Math.cos(a)*.19,3.28,zb+1.5+Math.sin(a)*.19,Math.sin(a)*.18,0,-Math.cos(a)*.18)}k.add(tor(.15,.006,3,16),white,0,3.1,zb+1.5,Math.PI/2);
 const pads=[0xc8102e,0x24407a,0x2a9d8f,0x3d7be0];for(let i=0;i<10;i++)k.add(rbox(2,1.6,.15,.05),UM(pads[i%4],{roughness:.8}),-9+i*2,.85,zb+.08);
 const sbT=document.createElement("canvas");sbT.width=512;sbT.height=200;const sbx=sbT.getContext("2d"),sbTex=new T.CanvasTexture(sbT);sbTex.colorSpace=T.SRGBColorSpace;let home=0,guest=12;
 const drawSB=()=>{sbx.fillStyle="#0b0b12";sbx.fillRect(0,0,512,200);sbx.font="800 30px system-ui";sbx.fillStyle="#fff";sbx.textAlign="center";sbx.fillText("HOME",110,44);sbx.fillText("GUEST",402,44);sbx.fillText("LEVEL UP",256,44);
   sbx.font="900 96px monospace";sbx.fillStyle="#ff3b3b";sbx.fillText(String(home).padStart(2,"0"),110,150);sbx.fillText(String(guest).padStart(2,"0"),402,150);sbx.fillStyle="#ffd23f";sbx.font="900 60px monospace";sbx.fillText("4",256,140);sbTex.needsUpdate=true};drawSB();
 k.add(rbox(3.4,1.4,.25,.05),UM(0x14141c),0,5.6,zb+.15);const sb=new T.Mesh(new T.PlaneGeometry(3.2,1.25),new T.MeshBasicMaterial({map:sbTex,toneMapped:false}));sb.position.set(0,5.6,zb+.29);g.add(sb);U.flatOK.add(sb);
 [["CHAMPS 2024","#24407a"],["ALL-STARS","#2e7d32"],["DISTRICT CUP","#c8102e"],["FAIR PLAY","#6a1b9a"]].forEach(([t,c],i)=>{const x=[-8,-5,5,8][i];const p=new T.Group();p.position.set(x,4.6,zb+.05);g.add(p);sign(p,t,0,0,0,1.3,1.6,c,"#ffd23f");k.add(cy(.03,.03,1.5,6),UM(0xc9a227,{metalness:.8}),x,5.45,zb+.07,0,0,Math.PI/2)});
 /* ball rack with balls */
 const rx=9.6,rz=-2;k.add(bx(.06,1,.06),steel,rx-.5,.5,rz-.9);k.add(bx(.06,1,.06),steel,rx-.5,.5,rz+.9);k.add(bx(.06,1,.06),steel,rx+.2,.5,rz-.9);k.add(bx(.06,1,.06),steel,rx+.2,.5,rz+.9);[.3,.75].forEach(y=>{k.add(bx(.06,.06,1.85),steel,rx-.5,y,rz);k.add(bx(.06,.06,1.85),steel,rx+.2,y,rz)});
 for(let r=0;r<2;r++)for(let i=0;i<4;i++)k.add(sp(.12,12),UM(0xe8742c,{roughness:.6}),rx-.15,.45+r*.45,rz-.66+i*.44);usolid(rx-.55,rx+.25,cz+rz-.95,cz+rz+.95,1);
 /* bleachers get seat planks, risers and a hand rail */
 for(let i=0;i<3;i++){const x=-11+.8+i*1.2,h=.5+i*.5;k.add(rbox(1.0,.06,11.8,.02),UM(0xd9a066,{roughness:.5}),x+.1,h+.03,1);k.add(bx(.04,.25,11.8),UM(0x1d2a5a),x+.6,h-.12,1)}
 [ -4.9,0,4.9,6.9].forEach(z=>k.add(cy(.03,.03,1.2,6),steel,-11+.8+2*1.2+.4,1.5+.6,1+z*.98));k.add(cy(.03,.03,11.8,6),steel,-11+.8+2*1.2+.4,2.1,1,Math.PI/2);
 k.build(g,{name:"u_gym"});
 /* free throws now fly at the 3D hoop and count on the scoreboard */
 const ball=new T.Mesh(sp(.12,14),UM(0xe8742c,{roughness:.6}));ball.visible=false;g.add(ball);let fly=null;
 const ft=TAPS.find(t=>t.area==="gym"&&/free throw/.test(t.label));if(ft){ft.x=0;ft.z=cz-2.5;ft.r=2.6;ft.fn=()=>{if(fly)return;const ok=Math.random()<.6;fly={t:0,ok,from:new T.Vector3(P.x-R.cx,1.6,P.z-cz)};ball.visible=true}}
 U.anims.push(dt=>{if(!fly)return;fly.t+=dt/1.1;const t=Math.min(1,fly.t),to=new T.Vector3(fly.ok?0:.28,3.5,zb+1.5);ball.position.lerpVectors(fly.from,to,t);ball.position.y+=Math.sin(t*Math.PI)*1.6;
   if(t>=1){ball.visible=false;const ok=fly.ok;fly=null;if(ok){home+=2;drawSB();ubeep(880,.15,"triangle",.05,200);uoffer("🏀","Swish! HOME has "+home+" points now.","mult","hoop")}else{ubeep(150,.2,"square",.04);bub("🏀","Clank! Off the rim. Try again!")}}});
 utap("gym",0,zb+5.2,"Press E to look at the scoreboard 🏟️",()=>uoffer("🏟️","HOME "+home+" · GUEST "+guest+". Each basket is 2 points.","mult","scoreboard"),1)}
/* ---------- CAFETERIA: steel serving line with real food, sneeze guard, milk cooler, menu board, windows, bins ---------- */
{const R=ROOMS.cafeteria,g=R.g,cz=R.cz,zb=-10+.22;uartOff(R);const k=Kit(),steel=UM(0xc9ced4,{metalness:.85,roughness:.25}),steelD=UM(0x8a9098,{metalness:.8,roughness:.3});
 const x0=-6,len=12,zc=zb+1.3;k.add(bx(len,.9,.9),steelD,x0+len/2,.45,zc);k.add(rbox(len+.1,.06,.95,.02),steel,x0+len/2,.93,zc);for(let i=0;i<6;i++)k.add(rbox(1.8,.65,.03,.02),steel,x0+1+i*2,.45,zc+.46);
 k.add(bx(len,.04,.35),steel,x0+len/2,.82,zc+.65);[0,len].forEach(a=>k.add(bx(.04,.1,.06),steel,x0+a,.8,zc+.5));
 const gl=new T.Mesh(bx(len,.02,.6),GLASS);gl.position.set(x0+len/2,1.4,zc+.15);gl.rotation.x=-.5;g.add(gl);for(let i=0;i<=6;i++)k.add(cy(.015,.015,.5,6),steel,x0+i*2,1.2,zc);
 const pans=[["pizza",0xf2c46d],["apples",0xd92b2b],["bananas",0xffd23f],["carrots",0xff8c1a],["salad",0x3f8f3a],["milk",0xffffff]];
 pans.forEach(([n,c],i)=>{const px=x0+1+i*2;k.add(bx(1.7,.08,.6),steel,px,.98,zc);
   if(n==="pizza"){for(let s=0;s<8;s++){const a=s/8*Math.PI*2;k.add(new T.CylinderGeometry(.3,.3,.04,8,1,false,a,Math.PI/4-.04),UM(0xf2c46d),px,1.04,zc);if(s%2)k.add(sp(.03,5),UM(0xb3261e),px+Math.sin(a+.4)*.18,1.07,zc+Math.cos(a+.4)*.18)}}
   else if(n==="apples")for(let a=0;a<9;a++)k.add(sp(.07,8),UM([0xd92b2b,0x6dbf3a][a%2]),px-.5+(a%5)*.25,1.07+(a>4?.05:0),zc-.12+(a>4?.18:0));
   else if(n==="bananas")for(let a=0;a<6;a++)k.add(new T.TorusGeometry(.16,.03,5,8,Math.PI*.6),UM(0xffd23f),px-.4+a*.16,1.05,zc,Math.PI/2,0,.4);
   else if(n==="carrots")for(let a=0;a<14;a++)k.add(cy(.012,.025,.22,6),UM(0xff8c1a),px-.6+a*.09,1.04,zc,Math.PI/2,0,(a%3-1)*.4);
   else if(n==="salad")for(let a=0;a<12;a++)k.add(ico(.06,0),UM(a%3?0x3f8f3a:0xd92b2b,{flatShading:true}),px-.6+(a%6)*.24,1.05,zc-.1+(a>5?.2:0));
   else for(let a=0;a<8;a++){const mx=px-.6+(a%4)*.38,mz=zc-.12+(a>3?.24:0);k.add(bx(.12,.2,.12),UM(a%2?0xffffff:0xd6e9ff),mx,1.12,mz);k.add(new T.ConeGeometry(.09,.06,4),UM(0x2a6bd8),mx,1.25,mz,0,Math.PI/4)}});
 usolid(x0,x0+len,cz+zc-.5,cz+zc+.7,1.1);
 const menu=canvasTex(1024,512,(c,W,H)=>{c.fillStyle="#173322";c.fillRect(0,0,W,H);c.strokeStyle="#c49a6c";c.lineWidth=20;c.strokeRect(10,10,W-20,H-20);c.fillStyle="#ffd23f";c.font="900 64px system-ui";c.textAlign="center";c.fillText("TODAY'S LUNCH",W/2,95);
   c.font="600 46px system-ui";c.fillStyle="#fff";["Pizza slice (1/8 pie) .... $1.25","Apple or banana .... 45¢","Carrot sticks .... 35¢","Milk .... 50¢"].forEach((t,i)=>c.fillText(t,W/2,190+i*80))});
 const mb=new T.Mesh(new T.PlaneGeometry(4,2),new T.MeshStandardMaterial({map:menu,roughness:.9}));mb.position.set(0,3.4,zb+.05);g.add(mb);U.flatOK.add(mb);k.add(rbox(4.2,2.2,.06,.02),UM(0x7a5236),0,3.4,zb+.02);
 /* windows with frames, sills and the playground outside set back behind glass */
 [-8,8].forEach(x=>{const v=TL.load("tex/skyline.webp");v.colorSpace=T.SRGBColorSpace;const p=new T.Mesh(new T.PlaneGeometry(2.4,1.8),new T.MeshBasicMaterial({map:v,toneMapped:false}));p.position.set(x,3.2,zb+.01);g.add(p);U.flatOK.add(p);
   [-1,1].forEach(s=>k.add(bx(.14,2,.3),UM(0xffffff),x+s*1.27,3.2,zb+.15));k.add(bx(2.7,.14,.3),UM(0xffffff),x,4.27,zb+.15);k.add(rbox(2.9,.08,.4,.02),UM(0xffffff),x,2.26,zb+.2);k.add(bx(.05,1.8,.05),UM(0xffffff),x,3.2,zb+.1)});
 uposter(g,"cafeteria",.02,.25,.2,.7,-10.75,2.6,0,1.3,Math.PI/2,0x2a9d8f);uposter(g,"cafeteria",.8,.25,1,.7,10.75,2.6,0,1.3,-Math.PI/2,0x2a9d8f);
 /* milk cooler with a sliding glass lid */
 const mc=new T.Group();mc.position.set(8.2,0,zc);g.add(mc);{const ck=Kit();ck.add(rbox(1.4,.9,.8,.04),UM(0x2a6bd8,{metalness:.3}),0,.45,0);for(let a=0;a<10;a++)ck.add(bx(.12,.2,.12),UM(a%2?0xffffff:0xd6e9ff),-.5+(a%5)*.25,.95,-.15+(a>4?.3:0));ck.build(mc);sign(mc,"MILK 50¢",0,.55,.41,.8,.2,"#2a6bd8","#fff")}
 const lid=new T.Mesh(bx(1.36,.03,.78),GLASS);lid.position.set(0,1.1,0);mc.add(lid);let lo=0,lcur=0;U.anims.push(dt=>{lcur+=((lo?1:0)-lcur)*Math.min(1,dt*6);lid.position.x=lcur*.6});usolid(7.5,8.9,cz+zc-.4,cz+zc+.4,1.1);
 utap("cafeteria",8.2,zc+1,"Press E to slide open the milk cooler 🥛",()=>{lo=!lo;if(lo)uoffer("🥛","Cold milk! Each carton is 50¢.","fruit","milk")},1.1);
 utap("cafeteria",x0+1,zc+1.1,"Press E to take a slice of pizza 🍕",()=>uoffer("🍕","The pizza is cut into 8 equal slices.","pizza","pizza"),1.3);
 utap("cafeteria",x0+3,zc+1.1,"Press E to grab an apple 🍎",()=>uoffer("🍎","Crunchy! Apples are 45¢ each.","fruit","cafapple"),1.1);
 utap("cafeteria",x0+5,zc+1.1,"Press E to take some bananas 🍌",()=>uoffer("🍌","Bananas: great brain food!","share","banana"),1.1);
 binLid(g,-9.8,6,0x2f6b3a,"TRASH","cafeteria","napkins and an empty chip bag.");binLid(g,-9.8,7,0x2a6bd8,"RECYCLE","cafeteria","milk cartons and a water bottle.");binLid(g,-9.8,8,0x8a5a32,"COMPOST","cafeteria","apple cores and banana peels.");
 /* tables get rounded tops, round stools-style benches and trays with real food */
 k.build(g,{name:"u_cafeteria"})}
/* ---------- ROOFTOP GARDEN: sunflowers + tomato stakes, watering can (plants grow), telescope, compost bin ---------- */
{const R=ROOMS.rooftop,g=R.g,cz=R.cz,k=Kit();const flowers=new T.Group();g.add(flowers);const fk=Kit();
 for(let i=0;i<4;i++){const x=-8+i*5.3;for(let j=0;j<3;j++){const fx=x-1.2+j*1.2;fk.add(cy(.02,.025,1.1,6),UM(0x3f8f3a),fx,1.15,7.1);fk.add(cy(.16,.16,.05,14),UM(0xffc81e),fx,1.75,7.15,Math.PI/2.4);fk.add(cy(.07,.07,.06,10),UM(0x5a3a1a),fx,1.76,7.18,Math.PI/2.4)}
   for(let j=0;j<2;j++){const tx=x-.6+j*1.2;k.add(cy(.012,.012,1.2,4),UM(0x8a6a44),tx,1.2,6.5);for(let t=0;t<4;t++)k.add(sp(.06,7),UM(0xd62828),tx+.06,.8+t*.18,6.5+(t%2?.05:-.05))}}
 fk.build(flowers);let grow=0,gs=1;
 const can=new T.Group();can.position.set(9,.12,4.5);g.add(can);{const ck=Kit();ck.add(cy(.16,.18,.32,14),UM(0x2a9d8f,{metalness:.5}),0,.16,0);ck.add(cy(.02,.035,.4,8),UM(0x2a9d8f,{metalness:.5}),.24,.3,0,0,0,-.9);ck.add(new T.TorusGeometry(.12,.015,4,10,Math.PI),UM(0x2a9d8f,{metalness:.5}),0,.34,0,0,Math.PI/2,0);ck.build(can)}
 utap("rooftop",9,4.5,"Press E to water the garden 🚿",()=>{grow=2;upuff(g,0,1.4,6.8,30,0x6fb6ff,8,.5,1,.03);bub("🌻","The sunflowers drink it up and grow taller!")},1.2);
 U.anims.push(dt=>{if(grow>0){grow-=dt;gs=Math.min(1.35,gs+dt*.15);flowers.scale.y=gs;flowers.position.y=-(gs-1)*.7}});
 /* telescope on a tripod at the edge */
 const tel=new T.Group();tel.position.set(-9,0,-6);g.add(tel);{const tk=Kit();[0,2.1,4.2].forEach(a=>tk.add(cy(.02,.02,1.3,5),UM(0x333333),Math.cos(a)*.25,.6,Math.sin(a)*.25,Math.sin(a)*.2,0,-Math.cos(a)*.2));tk.add(cy(.07,.09,.9,14),UM(0xeeeeee,{metalness:.4}),0,1.3,0,0,0,1.2);tk.add(cy(.1,.1,.06,14),UM(0x222222),.38,1.45,0,0,0,1.2);tk.build(tel)}
 usolid(-9.35,-8.65,cz-6.35,cz-5.65,1.4);utap("rooftop",-8.2,-5.4,"Press E to look through the telescope 🔭",()=>uoffer("🔭","You can see the whole skyline! That tall tower is 1,454 feet.","round","telescope"),1.2);
 /* compost bin with a lid: worms inside */
 binLid(g,9,-4,0x6b4123,"COMPOST","rooftop","rich dark soil… and wiggly worms! 🪱 They turn food scraps into dirt for the garden.");
 k.build(g,{name:"u_rooftop"})}
/* ---------- Universe: Brock's challenge-spot props as real 3D street objects (were a brown box + colored slab) ---------- */
{const PM=UM,wood=PM(0x7a5230,{roughness:.75}),steel=PM(0xb9c0c8,{metalness:.7,roughness:.3}),dark=PM(0x2c2f33,{metalness:.4,roughness:.5}),
 wht=PM(0xf5f2ea),red=PM(0xc62828),grn=PM(0x1b7a3d),yel=PM(0xf9c623),org=PM(0xef6c00),blu=PM(0x1e88e5),tire=PM(0x1d1d1d,{roughness:.9}),
 glass=PM(0x9fd3ff,{transparent:true,opacity:.35,roughness:.1,metalness:.1}),bread=PM(0xb5651d,{roughness:.6}),saus=PM(0xb5442a,{roughness:.5}),cheese=PM(0xffcf4a),crust=PM(0xd9a15c);
 const awning=(k,c,w,y,z)=>{for(let i=0;i<8;i++)k.add(bx(w/8,.04,.7),i%2?wht:c,-w/2+w/16+i*w/8,y,z,.35,0,0);k.add(bx(w,.14,.03),c,0,y-.18,z+.33)};
 const wheel=(k,x,y,z,r=.22)=>{k.add(tor(r,.06,8,18),tire,x,y,z,0,Math.PI/2,0);k.add(cy(r*.6,r*.6,.05,12),steel,x,y,z,0,0,Math.PI/2)};
 const B={
  placevalue:k=>{k.add(rbox(2,.95,.8,.04),grn,0,.48,0);k.add(bx(2.04,.06,.84),wood,0,.98,0);awning(k,grn,2.2,2.05,.15);[-1,1].forEach(s=>k.add(cy(.03,.03,1.1,8),dark,s*1.02,1.5,.45));
   for(let i=0;i<6;i++)k.add(cy(.05,.05,.13,12),[red,blu,yel][i%3],-.8+i*.32,1.08,.1);for(let i=0;i<4;i++)k.add(rbox(.2,.28,.07,.02),[org,red,yel,blu][i],-.6+i*.4,1.15,-.22)},
  groups:k=>{for(let i=0;i<3;i++){k.add(bx(.6,.3,.5),wood,-.7+i*.7,.75,0,-.2,0,0);for(let j=0;j<6;j++)k.add(sp(.075,10),[red,org,grn][i],-.85+i*.7+(j%3)*.15,.95,-.08+(j/3|0)*.15)}
   k.add(bx(2,.6,.6),wood,0,.3,0);awning(k,red,2.2,2,.1);[-1,1].forEach(s=>k.add(cy(.03,.03,1.4,8),dark,s*1.02,1.3,.4))},
  rounding:k=>{[-1,1].forEach(s=>{k.add(cy(.05,.05,1.2,10),grn,s*.9,.6,0);k.add(sp(.16,14),PM(0xd8ffe0,{emissive:0x55ff88,emissiveIntensity:.8}),s*.9,1.32,0)});
   for(let i=0;i<10;i++)k.add(cy(.022,.022,.9,6),grn,-.9+i*.2,.45,.32);k.add(bx(1.9,.05,.05),grn,0,.92,.32);k.add(rbox(1.3,.32,.05,.02),grn,0,1.7,0);k.add(cy(.04,.04,1.6,8),dark,0,.85,-.05)},
  addsub:k=>{k.add(rbox(1.7,.7,.75,.05),steel,0,.75,0);k.add(bx(1.74,.05,.79),wht,0,1.12,0);wheel(k,-.6,.22,.4);wheel(k,.6,.22,.4);k.add(cy(.025,.025,1.5,8),dark,-.75,1.85,0);
   k.add(cy(0,1.15,.45,16,true),yel,-.75,2.75,0);k.add(cy(1.15,1.15,.03,16),blu,-.75,2.52,0);for(let i=0;i<4;i++){k.add(cy(.045,.045,.34,8),bread,-.2+i*.18,1.19,.05,0,0,Math.PI/2);k.add(cy(.03,.03,.38,8),saus,-.2+i*.18,1.22,.05,0,0,Math.PI/2)}
   k.add(bx(.06,.06,.6),dark,.95,.95,0)},
  mult:k=>{k.add(cy(.07,.07,2.9,10),dark,.6,1.45,-.2);k.add(bx(1.1,.7,.05),wht,.6,2.9,0);k.add(bx(.36,.26,.01),red,.6,2.82,.03);k.add(tor(.22,.02,6,20),org,.6,2.6,.25,Math.PI/2);
   for(let i=0;i<6;i++)k.add(cy(.004,.004,.28,4),wht,.6+Math.cos(i)*.2,2.45,.25+Math.sin(i)*.2);k.add(sp(.12,14),org,-.5,.24,.2);k.add(bx(.9,.5,.4),dark,-.5,.25,-.2);k.add(sp(.12,14),org,-.5,.62,-.2)},
  divide:k=>{k.add(rbox(1.9,.95,.8,.05),PM(0x8b2d16),0,.48,0);k.add(bx(1.95,.05,.85),wht,0,.98,0);k.add(rbox(1.9,.5,.05,.03),red,0,2,-.3);[-1,1].forEach(s=>k.add(cy(.03,.03,1.1,8),dark,s*.9,1.5,-.3));
   k.add(cy(.42,.42,.04,24),crust,-.3,1.03,.05);k.add(cy(.38,.38,.02,24),cheese,-.3,1.06,.05);for(let i=0;i<7;i++)k.add(cy(.045,.045,.015,10),red,-.3+Math.cos(i*.9)*.22,1.08,.05+Math.sin(i*.9)*.22);
   k.add(bx(.36,.08,.36),PM(0xd9c09a),.5,1.05,0);k.add(bx(.36,.08,.36),PM(0xd9c09a),.5,1.13,0)},
  factors:k=>{for(let i=0;i<4;i++)k.add(tor(.36,.03,6,16),steel,-.75+i*.5,.12,0);k.add(bx(1.8,.04,.12),steel,0,.03,0);
   const bike=(x,c)=>{wheel(k,x-.38,.32,.12,.3);wheel(k,x+.38,.32,.12,.3);k.add(cy(.022,.022,.8,6),c,x,.6,.12,0,0,Math.PI/2);k.add(cy(.022,.022,.55,6),c,x-.2,.45,.12,0,0,.9);k.add(cy(.022,.022,.55,6),c,x+.2,.45,.12,0,0,-.9);
    k.add(bx(.2,.05,.08),dark,x-.2,.8,.12);k.add(cy(.018,.018,.4,6),dark,x+.38,.85,.12,Math.PI/2,0,0)};bike(-.4,red);bike(.6,blu)},
  multistep:k=>{[-1,1].forEach(s=>k.add(bx(.06,2.2,.06),dark,s*1,1.1,-.35));k.add(bx(2.1,.06,.9),dark,0,2.2,0);k.add(bx(2,1.5,.02),glass,0,1.2,-.38);k.add(bx(.02,1.5,.7),glass,-1,1.2,0);
   k.add(bx(1.6,.06,.35),wood,0,.48,-.18);[-.7,.7].forEach(x=>k.add(bx(.05,.45,.05),dark,x,.24,-.18));k.add(cy(.035,.035,2.6,8),dark,1.25,1.3,.35);k.add(rbox(.5,.5,.04,.02),blu,1.25,2.45,.35);k.add(bx(.7,1,.02),wht,.4,1.3,-.36)},
  fractions:k=>{k.add(rbox(1.5,.75,.7,.05),PM(0x5d4037),0,.75,0);wheel(k,-.55,.22,.36);wheel(k,.55,.22,.36);k.add(bx(1.2,.5,.5),glass,0,1.38,0);k.add(bx(1.24,.04,.54),steel,0,1.65,0);
   for(let i=0;i<6;i++)k.add(tor(.09,.03,6,14),bread,-.4+(i%3)*.4,1.2+(i/3|0)*.2,.02);[-1,1].forEach(s=>k.add(cy(.025,.025,1.2,8),dark,s*.72,1.9,0));k.add(bx(1.6,.05,.75),PM(0x8d6e63),0,2.5,0)}};
 const KIND={placevalue:["shop","🏪","Bodega: snacks lined up in rows of 10. Count by place value!"],groups:["fruit","🍎","Crates of apples, oranges and limes, in equal groups."],rounding:["round","🚇","The subway sign says the station is about 400 feet away."],
  addsub:["meters","🌭","Hot dogs sizzling! The vendor is adding up today's sales."],mult:["mult","🏀","Swish! Every basket counts 2 points."],divide:["pizza","🍕","A fresh pie cut into equal slices."],factors:["share","🚲","Bikes locked in rows: how many ways can you arrange them?"],
  multistep:["train","🚌","Bus timetable: buses come every few minutes."],fractions:["pizza","🥨","Warm pretzels, some split into equal parts."]};
 const _bp=brockProp;brockProp=function(sk){if(BRK.prop){S.remove(BRK.prop);BRK.prop=null}if(BRK.sol){const i=SOL.indexOf(BRK.sol);if(i>=0)SOL.splice(i,1);BRK.sol=null}
  const pr=BRK_PROP[sk];if(!pr||!B[sk])return _bp(sk);const g=new T.Group(),x=BRK_X[sk]-1.4,z=BRK_Z-1.3,k=Kit();B[sk](k);k.build(g,{name:"u_brockprop_"+sk});
  const lb=labelSprite(pr[0],1.9);lb.position.set(0,sk==="addsub"?3.2:2.55,.2);g.add(lb);g.position.set(x,.12,z);S.add(g);BRK.prop=g;BRK.spot=sk;
  BRK.sol={x0:x-1,x1:x+1,z0:z-.45,z1:z+.45,y0:0,top:1.2};SOL.push(BRK.sol)};
 const tap=utap("street",0,0,"",()=>{const sk=BRK.spot,K2=KIND[sk];if(!K2||!BRK.prop)return;BRK.prop.rotation.z=.02;setTimeout(()=>BRK.prop&&(BRK.prop.rotation.z=0),160);uoffer(K2[1],K2[2],K2[0],"brk_"+sk)},1.1);tap.area="__off";
 U.anims.push(()=>{const on=!!(BRK.prop&&BRK.prop.visible&&KIND[BRK.spot]);tap.area=on?"street":"__off";if(on){tap.x=BRK_X[BRK.spot]-2.75;tap.z=BRK_Z-1.3;tap.label="Press E to check out the "+BRK_PROP[BRK.spot][0].replace(/^\S+\s/,"")+" "+KIND[BRK.spot][1]}});
 if(BRK.spot){const s=BRK.spot,v=BRK.prop&&BRK.prop.visible;BRK.spot=null;brockProp(s);if(BRK.prop)BRK.prop.visible=!!v}}
/* ---------- Universe: apartment building fronts in real 3D (the Canva facade painted the door, window, lanterns, planters,
   basement grate and fire-escape ladder at walking height; now each is a real object in front of the art) ---------- */
{const wood=UM(0x4a1a14,{roughness:.55}),woodL=UM(0x5e2419,{roughness:.5}),brass=UM(0xd4a640,{metalness:.85,roughness:.25}),stoneM=UM(0xcdbb9c,{roughness:.85}),
 iron=UM(0x1d1f22,{metalness:.6,roughness:.45}),glassW=UM(0xffd9a0,{emissive:0xffb35c,emissiveIntensity:.55,roughness:.2}),oval=UM(0xe9dcc0,{emissive:0x9a7a40,emissiveIntensity:.25,roughness:.15,metalness:.2}),
 frame=UM(0x2f3b2c,{roughness:.6}),curt=UM(0xe8d6b0,{roughness:.9}),pot=UM(0xb5542b,{roughness:.8}),leaf=UM(0x2e6b2a,{roughness:.8,flatShading:true}),bloom=UM(0xff5c8a),lamp=UM(0xfff0c0,{emissive:0xffc66b,emissiveIntensity:1.3});
 const kit=Kit(),APT=DOORS.filter(d=>d.kind==="apartment"),fronts=[];
 APT.forEach(d=>{const side=Math.sign(d.z),bxC=d.x-(side>0?-2:2);kit.base(mat4(bxC,0,side*9,side>0?Math.PI:0));
  /* double door with raised panels, oval glass, brass handles + kick plates, fanlight above */
  kit.add(bx(2.16,3.55,.1),wood,2,2.97,.04);[-1,1].forEach(s=>{const cx=2+s*.52;kit.add(rbox(.82,3.3,.06,.02),woodL,cx,2.95,.1);kit.add(rbox(.5,1.05,.03,.02),wood,cx,1.95,.14);
   kit.add(sp(.2,14),oval,cx,3.6,.12,0,0,0,1,2.2,.25);kit.add(tor(.2,.025,6,18),brass,cx,3.6,.13,0,0,0,1,2.2,1);kit.add(bx(.7,.22,.02),brass,cx,1.38,.14);kit.add(cy(.025,.025,.42,8),brass,2+s*.1,2.95,.18)});
  kit.add(bx(.04,3.3,.06),UM(0x2a0d09),2,2.95,.12);kit.add(cy(1.02,1.02,.08,20,false),stoneM,2,4.75,.05,Math.PI/2,0,0,1,1,1);kit.add(cy(.9,.9,.09,20),glassW,2,4.75,.06,Math.PI/2);
  for(let i=0;i<7;i++){const a=Math.PI*(i+.5)/7;kit.add(bx(.03,.85,.03),iron,2+Math.cos(a)*.45,4.75+Math.sin(a)*.45,.12,0,0,a-Math.PI/2)}
  kit.add(bx(2.3,.14,.2),stoneM,2,4.72,.12);kit.add(bx(.36,.12,.03),brass,2.85,3.05,.12);
  /* ground-floor window: deep stone surround, lit glass, mullions, curtains, sill + flower box */
  kit.add(bx(1.75,3.0,.06),glassW,-2.05,3.6,.02);kit.add(bx(1.95,.16,.3),stoneM,-2.05,5.15,.12);kit.add(bx(2.05,.16,.4),stoneM,-2.05,2.05,.18);[-1,1].forEach(s=>kit.add(bx(.14,3.1,.24),stoneM,-2.05+s*.94,3.6,.1));
  kit.add(bx(.07,2.9,.08),frame,-2.05,3.6,.08);kit.add(bx(1.7,.07,.08),frame,-2.05,4.1,.08);[-1,1].forEach(s=>{kit.add(bx(.36,2.5,.04),curt,-2.05+s*.62,3.55,.05,0,0,s*.04);kit.add(cy(.05,.05,.1,8),curt,-2.05+s*.55,2.75,.07)});
  kit.add(rbox(1.7,.32,.32,.03),UM(0x6b3a1e),-2.05,2.3,.36);for(let i=0;i<6;i++){kit.add(ico(.13,0),leaf,-2.75+i*.28,2.55,.36);if(i%2==0)kit.add(sp(.06,8),bloom,-2.7+i*.28,2.66,.42)}
  /* lanterns + planters on posts each side of the stoop */
  [.55,3.45].forEach(x=>{kit.add(bx(.08,.08,.32),iron,x,4.5,.16);kit.add(cy(.13,.1,.36,6),lamp,x,4.35,.34);kit.add(cy(.17,.05,.14,6),iron,x,4.6,.34);kit.add(cy(.06,.13,.06,6),iron,x,4.15,.34);
   kit.add(bx(.42,2.6,.42),stoneM,x<2?.25:3.75,1.3,.25);kit.add(cy(.2,.15,.3,12),pot,x<2?.25:3.75,2.75,.25);kit.add(ico(.25,1),leaf,x<2?.25:3.75,3.05,.25)});
  /* basement grate (iron bars in front of the painted one) */
  for(let i=0;i<9;i++)kit.add(cy(.022,.022,1.05,6),iron,-2.95+i*.2,.6,.12);[.15,1.05].forEach(y=>kit.add(bx(1.75,.05,.05),iron,-2.15,y,.12));
  /* fire-escape drop ladder: real rails + rungs (stops above the sidewalk, like the real thing) */
  [-4.45,-3.95].forEach(x=>kit.add(bx(.05,3.9,.05),iron,x,3.75,.35));for(let i=0;i<13;i++)kit.add(cy(.018,.018,.5,6),iron,-4.2,1.95+i*.3,.35,0,0,Math.PI/2);
  fronts.push({d,side,bxC,w:(lx,o)=>({x:bxC+(side>0?-lx:lx),z:side*(9-o)})})});
 kit.build(S,{name:"u_apt_fronts"});
 fronts.forEach((f,i)=>{const W=f.w(-1.5,1.0),G=f.w(-2.9,.7),L=f.w(-4.2,.9);
  utap("street",W.x,W.z,"Press E to peek in the window 🪟",()=>uoffer("🪟",["A cat naps on the windowsill and flicks its tail at you.","Someone inside is baking — it smells like cookies!","A kid inside is practicing times tables out loud."][i%3],"clock","aptwin"+i),1.1);
  utap("street",G.x,G.z,"Press E to look through the basement grate 🕳️",()=>{ubeep(220,.1);if(i%3===1)onceXP("aptGrate"+i,3,"🪙 You fish a shiny coin out of the grate with a stick! +3 XP");else bub("🕳️","Just old leaves and a lost mitten down there.")},.9);
  utap("street",L.x,L.z,"Press E to check the fire-escape ladder 🪜",()=>bub("🪜","The ladder is locked up high. Fire escapes are for emergencies only!"),.9)});
 U.aptFronts=fronts.length}
/* school front: real blue double doors (grilles, push bars, kick plates), "104" fanlight, brass lanterns — over the painted ones */
{const blue=UM(0x1f4fa0,{roughness:.45,metalness:.2}),blueD=UM(0x173c7a,{roughness:.5}),brass=UM(0xd4a640,{metalness:.85,roughness:.25}),iron=UM(0x1d1f22,{metalness:.6,roughness:.45}),
 gl=UM(0x9fc4e8,{emissive:0x334455,emissiveIntensity:.3,roughness:.1,metalness:.3}),stoneM=UM(0xe6dcc8,{roughness:.8}),lamp=UM(0xfff0c0,{emissive:0xffc66b,emissiveIntensity:1.3}),fan=UM(0xfff4d8,{emissive:0xd9b26a,emissiveIntensity:.35});
 const kit=Kit();DOORS.filter(d=>d.kind==="school").forEach(d=>{const side=Math.sign(d.z);kit.base(mat4(d.x,0,side*9,side>0?Math.PI:0));
  kit.add(bx(2.6,2.75,.1),blueD,0,3.12,.04);[-1,1].forEach(s=>{const cx=s*.64;kit.add(rbox(1.2,2.6,.07,.02),blue,cx,3.12,.1);kit.add(bx(.62,.9,.03),gl,cx,3.75,.14);
   for(let i=0;i<4;i++)kit.add(cy(.012,.012,.9,5),iron,cx-.24+i*.16,3.75,.16);kit.add(tor(.18,.015,5,16),iron,cx,3.75,.16);kit.add(bx(1.1,.3,.02),brass,cx,1.98,.14);kit.add(cy(.03,.03,1,8),brass,cx,2.95,.2,0,0,Math.PI/2);[-.42,.42].forEach(o=>kit.add(bx(.04,.04,.1),brass,cx+o,2.95,.16))});
  kit.add(cy(1.3,1.3,.08,24),stoneM,0,4.55,.05,Math.PI/2);kit.add(cy(1.15,1.15,.09,24),fan,0,4.55,.06,Math.PI/2);for(let i=0;i<9;i++){const a=Math.PI*(i+.5)/9;kit.add(bx(.03,1.1,.03),UM(0x6b5a3a),Math.cos(a)*.57,4.55+Math.sin(a)*.57,.12,0,0,a-Math.PI/2)}
  kit.add(bx(2.9,.12,.2),stoneM,0,4.52,.12);kit.add(rbox(.5,.22,.03,.02),UM(0x1b2a4a),0,4.95,.13);
  [-2.05,2.05].forEach(x=>{kit.add(bx(.08,.08,.32),iron,x,4.5,.16);kit.add(cy(.14,.1,.4,6),lamp,x,4.3,.34);kit.add(cy(.18,.05,.15,6),brass,x,4.58,.34);kit.add(cy(.06,.14,.06,6),brass,x,4.08,.34)})});
 kit.build(S,{name:"u_school_doors"})}
/* clothing store entrance: real framed glass doors (pulls, kick plates, "OPEN" card), transom, wall lanterns */
{const fr=UM(0x1b2a26,{roughness:.5,metalness:.3}),brass=UM(0xd4a640,{metalness:.85,roughness:.25}),gl=UM(0xbfe3ff,{transparent:true,opacity:.28,roughness:.05,metalness:.2}),
 inside=UM(0x6b4f35,{emissive:0x3a2614,emissiveIntensity:.4,roughness:.8}),card=UM(0xffffff,{emissive:0x55ff99,emissiveIntensity:.35}),lamp=UM(0xfff0c0,{emissive:0xffc66b,emissiveIntensity:1.3});
 const kit=Kit();DOORS.filter(d=>d.kind==="clothing").forEach(d=>{const side=Math.sign(d.z);kit.base(mat4(d.x,0,side*9,side>0?Math.PI:0));
  kit.add(bx(1.75,2.75,.04),inside,0,1.4,.01);[-1,1].forEach(s=>{const cx=s*.43;kit.add(bx(.84,2.55,.03),gl,cx,1.33,.12);[-1,1].forEach(e=>kit.add(bx(.07,2.6,.08),fr,cx+e*.39,1.33,.12));
   kit.add(bx(.84,.07,.08),fr,cx,2.6,.12);kit.add(bx(.84,.28,.06),brass,cx,.2,.12);kit.add(cy(.022,.022,.75,8),brass,cx-s*.3,1.3,.2);[-.33,.33].forEach(o=>kit.add(bx(.03,.03,.08),brass,cx-s*.3,1.3+o,.16))});
  kit.add(bx(1.9,.42,.1),fr,0,2.92,.1);kit.add(bx(1.5,.26,.02),UM(0x2c1e12,{emissive:0x553311,emissiveIntensity:.4}),0,2.92,.16);kit.add(bx(.3,.2,.01),card,.43,1.75,.14);
  [-1.15,1.15].forEach(x=>{kit.add(bx(.06,.06,.26),fr,x,2.35,.13);kit.add(cy(.1,.08,.3,6),lamp,x,2.2,.28);kit.add(cy(.13,.04,.1,6),fr,x,2.4,.28)})});
 kit.build(S,{name:"u_clothing_doors"})}
/* perf: adaptive quality. Soft shadows are the single biggest per-frame cost on software GL / low-end phones (measured 2.75 -> 5.75 fps
   on the street with shadows off). If the game runs under ~12 fps for 3 s, shadows switch off once (everything else stays). Uses wall-clock time: the frame dt is capped at 50 ms. */
{let t0=0,n=0,slow=0;U.lowFx=false;U.anims.push(()=>{if(U.lowFx||document.hidden)return;const now=performance.now();if(!t0){t0=now;n=0;return}n++;const el=(now-t0)/1000;if(el<1)return;const fps=n/el;t0=now;n=0;slow=fps<12?slow+1:0;
  if(slow>=3){U.lowFx=true;R.shadowMap.enabled=false;S.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)});try{console.info("LevelUp: low-FPS mode (shadows off)")}catch(_){}}})}
