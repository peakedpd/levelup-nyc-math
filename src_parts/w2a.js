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
