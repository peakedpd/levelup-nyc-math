/* Ms. Okafor's classroom — 3D pilot.
   Real CC0 models (Kenney Furniture Kit, via Poly Pizza) + CC0 Poly Haven textures replace the boxy placeholders.
   Rule: nothing that is an object is painted on a wall. Whiteboard, clock, flag, shelves, desks, plants are real 3D;
   flat art is only for posters / the whiteboard's writing. Credits: CREDITS.txt */
(()=>{"use strict";
const R0=typeof ROOMS!=="undefined"&&ROOMS.school;if(!R0||!R0.g||window.__cls3d)return;window.__cls3d=1;
const g=R0.g,TLc=new T.TextureLoader(),GLd=new GLTFLoader(),AN=Math.min(4,R.capabilities.getMaxAnisotropy()),HW=RW/2-.2,HD=RD/2-.2;
const tx=(u,srgb,rx,ry)=>{const t=TLc.load(u);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.anisotropy=AN;if(srgb)t.colorSpace=T.SRGBColorSpace;return t};
const near=(a,b)=>Math.abs(a-b)<1e-4;
/* ---- 1. retire the placeholders (student desks/chairs stay as invisible colliders; the painted mural and the white box "whiteboard" go) ---- */
g.children.slice().forEach(o=>{if(!o.isMesh)return;const p=o.geometry.parameters||{},ty=o.geometry.type;
  if(ty==="BoxGeometry"&&[[1.6,.08,1],[1.5,.74,.9],[.6,.5,.6],[.6,.6,.08],[6,2.4,.1]].some(s=>near(p.width,s[0])&&near(p.height,s[1])&&near(p.depth,s[2])))o.visible=false;
  if(ty==="PlaneGeometry"&&near(p.width,9.9)&&o.material.isMeshBasicMaterial)o.visible=false;               // flat Canva mural
  if(ty==="PlaneGeometry"&&near(p.width,RW)&&near(p.height,RD)&&o.rotation.x<0){                              // floor
    o.material=new T.MeshStandardMaterial({color:0xfff0dc,map:tx("tex/classroom/floor_diff.webp",1,6,5.3),normalMap:tx("tex/classroom/floor_nor.webp",0,6,5.3),normalScale:new T.Vector2(.8,.8),roughnessMap:tx("tex/classroom/floor_rough.webp",0,6,5.3),roughness:1})}
  if(ty==="BoxGeometry"&&o.material.color&&o.material.color.getHex()===0xf4e3b5){const m=o.material;m.normalMap=tx("tex/classroom/wall_nor.webp",0,5,2);m.normalScale.set(.7,.7);m.needsUpdate=true}
  if(ty==="BoxGeometry"&&near(p.width,3.4)&&near(p.height,1)&&near(p.depth,1.4)){o.material=new T.MeshStandardMaterial({color:0xffe6c4,map:tx("tex/classroom/oak_diff.webp",1,3,1),roughnessMap:tx("tex/classroom/oak_rough.webp",0,3,1),roughness:1})}   // teacher desk
});
const mk=(geo,mat,x,y,z,ry=0,par=g)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=m.receiveShadow=true;par.add(m);return m};
const bx=(w,h,d,mat,x,y,z,ry,par)=>mk(new T.BoxGeometry(w,h,d),mat,x,y,z,ry,par);
const oak=tx("tex/classroom/oak_diff.webp",1,1,1),oakR=tx("tex/classroom/oak_rough.webp",0,1,1);
const MOAK=new T.MeshStandardMaterial({color:0xffe9c9,map:oak,roughnessMap:oakR,roughness:1}),
  MDK=new T.MeshStandardMaterial({color:0x7a4a28,map:oak,roughness:.7}),
  WHITE=new T.MeshStandardMaterial({color:0xf4f4f0,roughness:.5}),
  ALU=new T.MeshStandardMaterial({color:0xc4ccd2,metalness:.7,roughness:.35});
/* ---- 2. real walls: teal painted back wall, oak wainscot + rail + baseboard on all walls, plaster normal map ---- */
{const tealWall=new T.MeshStandardMaterial({color:0x8fd0c8,roughness:.85,normalMap:tx("tex/classroom/wall_nor.webp",0,5,2),normalScale:new T.Vector2(.7,.7)});
  mk(new T.PlaneGeometry(RW-.4,RH),tealWall,0,RH/2,-HD+.01,0);
  const wains=(len,x,z,ry)=>{const par=new T.Group();par.position.set(x,0,z);par.rotation.y=ry;g.add(par);
    const m=MOAK.clone();m.map=oak.clone();m.map.repeat.set(len/1.4,1);m.map.needsUpdate=true;
    bx(len,1.0,.05,m,0,.6,0,0,par);bx(len,.14,.08,MDK,0,.07,.015,0,par);bx(len,.07,.1,MDK,0,1.13,.02,0,par)};
  wains(RD-.4,-HW+.03,0,Math.PI/2);wains(RD-.4,HW-.03,0,-Math.PI/2);wains(RW-.4,0,-HD+.03,0);
  [-1,1].forEach(s=>wains(7.2,s*5.1,HD-.03,Math.PI))}
/* ---- 3. windows on the left wall: frame, mullions, sill, painted NYC sky (it's a view, not an object) + light shafts on the floor ---- */
{const cv=document.createElement("canvas");cv.width=256;cv.height=288;const c=cv.getContext("2d"),gr=c.createLinearGradient(0,0,0,288);gr.addColorStop(0,"#6fc0ff");gr.addColorStop(.65,"#cfeeff");gr.addColorStop(1,"#f6ecd2");c.fillStyle=gr;c.fillRect(0,0,256,288);
  c.fillStyle="rgba(255,255,255,.9)";[[50,60,34,12],[70,56,26,10],[180,100,40,12],[200,95,26,9]].forEach(([x,y,rx,ry])=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill()});
  c.fillStyle="#8da4c4";[[10,170,38,118],[60,150,30,138],[96,185,40,103],[150,160,34,128],[190,140,28,148],[222,178,34,110]].forEach(([x,y,w,h])=>c.fillRect(x,y,w,h));
  c.fillStyle="#6a84a8";[[0,205,30,83],[40,195,26,93],[80,215,24,73],[130,200,30,88],[175,210,26,78],[210,198,46,90]].forEach(([x,y,w,h])=>c.fillRect(x,y,w,h));
  c.fillStyle="#b8a27a";c.fillRect(146,128,16,10);c.fillRect(150,138,8,12);                                   // water tower
  const sky=new T.CanvasTexture(cv);sky.colorSpace=T.SRGBColorSpace;
  const gv=document.createElement("canvas");gv.width=64;gv.height=8;const gc=gv.getContext("2d"),gg=gc.createLinearGradient(0,0,64,0);gg.addColorStop(0,"#fff");gg.addColorStop(1,"#000");gc.fillStyle=gg;gc.fillRect(0,0,64,8);const shaft=new T.CanvasTexture(gv);
  [-4.6,0,4.6].forEach(zc=>{const w=new T.Group();w.position.set(-HW+.02,3.1,zc);w.rotation.y=Math.PI/2;g.add(w);
    mk(new T.PlaneGeometry(2,2.3),new T.MeshBasicMaterial({map:sky,toneMapped:false}),0,0,0,0,w);
    [[2.3,.14,0,1.2],[2.3,.14,0,-1.2]].forEach(([W,H,x,y])=>bx(W,H,.14,WHITE,x,y,.05,0,w));[[-1.08],[1.08]].forEach(([x])=>bx(.14,2.5,.14,WHITE,x,0,.05,0,w));
    bx(.06,2.3,.08,WHITE,0,0,.04,0,w);bx(2,.06,.08,WHITE,0,.1,.04,0,w);
    bx(2.7,.09,.34,WHITE,0,-1.27,.18,0,w);
    const q=new T.BufferGeometry(),y0=.03,a=[-HW,y0,zc-1.05,-HW,y0,zc+1.05,-HW+4.6,y0,zc+1.05+1.5,-HW+4.6,y0,zc-1.05+1.5];
    q.setAttribute("position",new T.Float32BufferAttribute(a,3));q.setAttribute("uv",new T.Float32BufferAttribute([0,0,0,1,1,1,1,0],2));q.setIndex([0,1,2,0,2,3]);
    const m=new T.Mesh(q,new T.MeshBasicMaterial({map:shaft,transparent:true,opacity:.34,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false,color:0xfff0c8,side:T.DoubleSide}));m.renderOrder=2;g.add(m)})}
/* ---- 4. REAL 3D whiteboard (frame, tray, markers, eraser); only the writing on it is flat art ---- */
const img=new Image();img.onload=()=>{
  const sc=img.naturalWidth/1280,crop=(x,y,w,h)=>{x*=sc;y*=sc;w*=sc;h*=sc;const c=document.createElement("canvas");c.width=Math.round(w);c.height=Math.round(h);c.getContext("2d").drawImage(img,x,y,w,h,0,0,c.width,c.height);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=AN;return t};
  const k=9.9/1280,Z=-HD+.03;
  /* whiteboard */
  {const bw=4.2,bh=bw*400/638,cy=1.05+bh/2,t=crop(322,242,634,396),b=new T.Group();b.position.set(0,cy,Z);g.add(b);
    bx(bw+.2,bh+.2,.05,ALU,0,0,.02,0,b);
    mk(new T.PlaneGeometry(bw,bh),new T.MeshStandardMaterial({map:t,roughness:.28,metalness:0,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.55}),0,0,.05,0,b);
    bx(bw+.3,.07,.16,ALU,0,-bh/2-.12,.1,0,b);
    [[0xe23b3b,-1.5],[0x3d7be0,-1.3],[0x2a9d3a,-1.1],[0x222222,-.9]].forEach(([c,x])=>{const m=mk(new T.CylinderGeometry(.014,.014,.14,10),new T.MeshStandardMaterial({color:c,roughness:.4}),x,-bh/2-.07,.13,0,b);m.rotation.z=Math.PI/2;m.rotation.y=.2});
    bx(.13,.045,.06,new T.MeshStandardMaterial({color:0x3d7be0,roughness:.8}),1.3,-bh/2-.065,.12,.1,b)}
  /* posters: thin framed 3D panels carrying flat art */
  const poster=(sx,sy,sw,sh,x,y,w,fc)=>{const p=new T.Group();p.position.set(x,y,Z);g.add(p);const h=w*sh/sw;
    bx(w+.1,h+.1,.04,fc||WHITE,0,0,.02,0,p);mk(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:crop(sx,sy,sw,sh),toneMapped:false}),0,0,.045,0,p)};
  poster(28,12,1227,76,0,5.1,9.2,new T.MeshStandardMaterial({color:0x24407a,roughness:.6}));   // alphabet strip
  poster(18,234,262,192,-3.9,3.0,2.0);poster(18,448,262,214,-3.9,1.45,2.0);                       // place value, fractions
  poster(994,164,270,224,3.9,3.45,2.0);poster(994,408,270,244,3.9,1.5,2.0);                        // math stars, multiplication strategies
  /* clock: real, ticking */
  {const cg=new T.Group();cg.position.set(0,4.3,Z);g.add(cg);
    const f=document.createElement("canvas");f.width=f.height=256;const c=f.getContext("2d");c.fillStyle="#fff";c.beginPath();c.arc(128,128,126,0,7);c.fill();c.fillStyle="#222";c.font="bold 30px sans-serif";c.textAlign="center";c.textBaseline="middle";
    for(let i=1;i<=12;i++){const a=i/12*Math.PI*2;c.fillText(i,128+Math.sin(a)*98,128-Math.cos(a)*98)}for(let i=0;i<60;i++){const a=i/60*Math.PI*2,r=i%5?118:110;c.fillRect(128+Math.sin(a)*r-1,128-Math.cos(a)*r-1,i%5?2:4,i%5?2:4)}
    const ft=new T.CanvasTexture(f);ft.colorSpace=T.SRGBColorSpace;
    mk(new T.CylinderGeometry(.42,.42,.06,40),new T.MeshStandardMaterial({color:0xd7262b,roughness:.4}),0,0,.04,0,cg).rotation.x=Math.PI/2;
    mk(new T.CircleGeometry(.37,40),new T.MeshStandardMaterial({map:ft,roughness:.3,emissive:0xffffff,emissiveMap:ft,emissiveIntensity:.5}),0,0,.075,0,cg);
    const hm=new T.MeshStandardMaterial({color:0x111111,roughness:.5}),hh=new T.Group(),mh=new T.Group(),sh=new T.Group();hh.position.z=mh.position.z=sh.position.z=.09;cg.add(hh,mh,sh);
    bx(.025,.2,.01,hm,0,.1,0,0,hh);bx(.018,.3,.01,hm,0,.15,.005,0,mh);bx(.008,.33,.01,new T.MeshStandardMaterial({color:0xd7262b}),0,.12,.01,0,sh);
    const upd=()=>{const d=new Date,s=d.getSeconds(),m=d.getMinutes()+s/60,h=d.getHours()%12+m/60;hh.rotation.z=-h/12*Math.PI*2;mh.rotation.z=-m/60*Math.PI*2;sh.rotation.z=-s/60*Math.PI*2};upd();setInterval(upd,1000)}
  /* flag: rod + brackets + a cloth that waves a little */
  {const fl=new T.Group();fl.position.set(-6.5,4.05,Z);g.add(fl);
    const fc=document.createElement("canvas");fc.width=190;fc.height=100;const c=fc.getContext("2d");for(let i=0;i<13;i++){c.fillStyle=i%2?"#fff":"#b22234";c.fillRect(0,i*100/13,190,100/13+1)}c.fillStyle="#3c3b6e";c.fillRect(0,0,80,54);c.fillStyle="#fff";for(let r=0;r<5;r++)for(let q=0;q<6;q++)c.fillRect(7+q*12+(r%2)*6,6+r*10,3,3);
    const t=new T.CanvasTexture(fc);t.colorSpace=T.SRGBColorSpace;const geo=new T.PlaneGeometry(1.1,.58,10,4);geo.translate(0,-.29,0);const m=mk(geo,new T.MeshStandardMaterial({map:t,roughness:.8,side:T.DoubleSide}),0,0,.14,0,fl);
    const rod=mk(new T.CylinderGeometry(.018,.018,1.3,8),ALU,0,0,.12,0,fl);rod.rotation.z=Math.PI/2;[-.55,.55].forEach(x=>bx(.03,.03,.12,ALU,x,0,.06,0,fl));
    [-.66,.66].forEach(x=>mk(new T.SphereGeometry(.035,10,8),new T.MeshStandardMaterial({color:0xd4a017,metalness:.8,roughness:.3}),x,0,.12,0,fl));
    const p0=geo.attributes.position.array.slice();let T0=0;(function tick(){requestAnimationFrame(tick);if(AREA!=="school")return;T0+=.05;const a=geo.attributes.position;for(let i=0;i<a.count;i++){const x=p0[i*3],y=p0[i*3+1];a.setZ(i,Math.sin(x*4+T0)*.03*(-y/.58+.2))}a.needsUpdate=true})()}
};img.src="tex/room_classroom.webp";
/* ---- 5. CC0 furniture (Kenney) ---- */
const matCache={},P=(c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.65},o));
const MAT={wood:MOAK,woodDark:P(0xb25d33,{roughness:.8}),plant:P(0x2faa55,{roughness:.8}),metal:P(0xc2ccd0,{metalness:.6,roughness:.4}),metalDark:P(0x2a3438,{metalness:.4,roughness:.5}),metalMedium:P(0x3d4a50,{metalness:.5,roughness:.45}),
  carpet:P(0x2a9d8f,{roughness:1}),carpetDarker:P(0x1d6f66,{roughness:1}),carpetWhite:P(0xf2f2f2),lamp:P(0xffd35a,{emissive:0xffc850,emissiveIntensity:1.1})};
const OVR={chair:{wood:P(0x2f6fd6,{roughness:.45})},chairDesk:{carpet:P(0x24407a,{roughness:.9})},books:{carpetDarker:P(0xb23a3a),carpetWhite:P(0xf4efe2),plant:P(0x2faa55),metal:P(0x3d7be0)},
  bench:{wood:P(0x2a9d8f,{roughness:.5})},cardboardBoxClosed:{}};
const boxUV=(geo,s)=>{const p=geo.attributes.position,n=geo.attributes.normal,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));let u,v;if(ay>=ax&&ay>=az){u=p.getX(i);v=p.getZ(i)}else if(ax>=az){u=p.getZ(i);v=p.getY(i)}else{u=p.getX(i);v=p.getY(i)}uv[2*i]=u*s*1.2;uv[2*i+1]=v*s*1.2}geo.setAttribute("uv",new T.BufferAttribute(uv,2))};
const SC={table:2.2,chair:2.1,chairDesk:2,bookcaseClosedWide:2.3,bookcaseOpen:2.3,bookcaseOpenLow:2.3,books:2,pottedPlant:2.6,plantSmall1:3,computerScreen:2,laptop:2,trashcan:1.7,rugRound:3.4,lampRoundFloor:2,coatRackStanding:2.2,bench:2.4,cardboardBoxClosed:1.8,sideTable:2.2,ceilingFan:3.4};
const TPL={};const tpl=n=>TPL[n]||(TPL[n]=new Promise(res=>GLd.load("models/classroom/"+n+".glb",gl=>{const o=gl.scene,s=SC[n];
  o.traverse(m=>{if(!m.isMesh)return;m.castShadow=m.receiveShadow=true;const k=m.material.name;if(k==="wood"&&!(OVR[n]&&OVR[n].wood)&&m.geometry.attributes.normal)boxUV(m.geometry,s);m.material=(OVR[n]&&OVR[n][k])||MAT[k]||m.material});
  const bb=new T.Box3().setFromObject(o),w=new T.Group();o.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2);w.add(o);w.scale.setScalar(s);w.userData.h=(bb.max.y-bb.min.y)*s;res(w)},undefined,()=>res(null))));
const SHD=(()=>{const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d"),gr=x.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,"rgba(0,0,0,.55)");gr.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=gr;x.fillRect(0,0,64,64);return new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})})();
const shade=(x,z,w,d)=>{const m=new T.Mesh(new T.PlaneGeometry(w,d),SHD);m.rotation.x=-Math.PI/2;m.position.set(x,.016,z);PG.add(m)};
const solids=[];const solid=(x,z,w,d,h)=>{const m=bx(w,h,d,WHITE,x,h/2,z,0);m.visible=false;m.castShadow=false;m.userData.solid=1;solids.push(m)};
const FANS=[],PG=new T.Group(),PUTS=[];g.add(PG);
function put(n,x,z,o={}){const {ry=0,y=0,sh=1}=o;const pr=tpl(n).then(t=>{if(!t)return;const m=t.clone(true);m.position.set(x,y,z);m.rotation.y=ry;(n==='ceilingFan'?g:PG).add(m);const s=SC[n],bb=new T.Box3().setFromObject(m);
  if(sh)shade(x,z,(bb.max.x-bb.min.x)*1.25,(bb.max.z-bb.min.z)*1.25);if(n==="ceilingFan")FANS.push(m);return m});PUTS.push(pr);return pr}
/* student desks: 3 rows x 4 — kid-height tables, blue chairs facing the board, books / a plant on some */
for(let rr=0;rr<3;rr++)for(let c=0;c<4;c++){const x=-5.4+c*3.6,z=-1.5+rr*2.8,i=rr*4+c;put("table",x,z,{sh:1});put("chair",x+(i%2?.1:-.1),z+.95,{ry:(i%3-1)*.06});
  if(i%3===0)put("books",x-.5,z,{y:.73,sh:0,ry:.3*i});if(i%5===2)put("plantSmall1",x+.55,z-.1,{y:.73,sh:0})}
/* teacher area */
put("chairDesk",-.2,-6.55,{ry:.35});put("laptop",.35,-5.62,{y:1.0,sh:0,ry:Math.PI});put("plantSmall1",-1.5,-5.6,{y:1.0,sh:0});
/* right wall: shelves full of books, reading corner */
[-6.3,-4.35,-2.4].forEach((z,i)=>{put("bookcaseClosedWide",HW-.33,z,{ry:-Math.PI/2});solid(HW-.33,z,.65,1.9,1.8)});
put("books",HW-.3,-6.3,{y:1.82,sh:0,ry:-Math.PI/2});put("plantSmall1",HW-.3,-4.35,{y:1.82,sh:0});put("books",HW-.3,-2.4,{y:1.82,sh:0,ry:-1.2});
put("bookcaseOpen",HW-.33,-.75,{ry:-Math.PI/2});solid(HW-.33,-.75,.65,.95,2);put("books",HW-.4,-.75,{y:2.02,sh:0,ry:-Math.PI/2});
put("rugRound",6.1,4.9,{sh:0,y:.012});
put("bookcaseOpenLow",HW-.33,3.8,{ry:-Math.PI/2});put("bookcaseOpenLow",HW-.33,4.95,{ry:-Math.PI/2});solid(HW-.33,4.4,.65,2.2,.95);
put("books",HW-.4,3.8,{y:.92,sh:0,ry:-Math.PI/2});put("bench",HW-1.35,2.7,{ry:-Math.PI/2});solid(HW-1.35,2.7,.5,1,.5);
put("pottedPlant",HW-.5,1.3,{});solid(HW-.5,1.3,.6,.6,1.6);put("pottedPlant",HW-.5,6.9,{});solid(HW-.5,6.9,.6,.6,1.6);
put("cardboardBoxClosed",HW-1.2,6.85,{ry:.4});put("trashcan",HW-.4,5.9,{});
/* left wall: side tables + plants under the windows, coat rack, lamp, corner plant */
[-4.6,0,4.6].forEach((z,i)=>{put("sideTable",-HW+.75,z,{ry:Math.PI/2});put(i===1?"plantSmall1":"plantSmall1",-HW+.75,z,{y:.84,sh:0})});
put("coatRackStanding",-HW+.5,6.2,{});solid(-HW+.5,6.2,.6,.6,1.7);put("lampRoundFloor",-HW+.5,-7.0,{});put("pottedPlant",-HW+.5,-2.3,{});solid(-HW+.5,-2.3,.6,.6,1.6);put("pottedPlant",-HW+.5,2.3,{});solid(-HW+.5,2.3,.6,.6,1.6);
/* ceiling: tube-light panels + two spinning fans */
[-4.5,0,4.5].forEach(x=>{const m=bx(1.2,.06,3.2,P(0xffffff,{emissive:0xfff6e0,emissiveIntensity:1.4}),x,RH-.04,-.5,0);m.castShadow=false});
[-4.5,4.5].forEach(x=>put("ceilingFan",x,2.6,{y:RH-.47,sh:0}));
if(solids.length)solidsOf(g);
/* draw-call diet for phones: once every model is in, bake all static props that share a material into ONE mesh each */
function bake(){g.updateMatrixWorld(true);const inv=new T.Matrix4().copy(g.matrixWorld).invert(),by=new Map();
  PG.traverse(m=>{if(m.isMesh){if(!by.has(m.material))by.set(m.material,[]);by.get(m.material).push(m)}});
  by.forEach((ms,mat)=>{let np=0,ni=0;ms.forEach(m=>{const G=m.geometry;np+=G.attributes.position.count;ni+=G.index?G.index.count:G.attributes.position.count});
    const Pp=new Float32Array(np*3),Nn=new Float32Array(np*3),Uu=new Float32Array(np*2),Ii=new Uint32Array(ni);let po=0,io=0;const v=new T.Vector3(),nm=new T.Matrix3(),rel=new T.Matrix4();
    ms.forEach(m=>{const G=m.geometry,p=G.attributes.position,n=G.attributes.normal,u=G.attributes.uv;rel.multiplyMatrices(inv,m.matrixWorld);nm.getNormalMatrix(rel);
      for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(rel);Pp.set([v.x,v.y,v.z],(po+i)*3);if(n){v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();Nn.set([v.x,v.y,v.z],(po+i)*3)}if(u)Uu.set([u.getX(i),u.getY(i)],(po+i)*2)}
      if(G.index)for(let i=0;i<G.index.count;i++)Ii[io++]=G.index.getX(i)+po;else for(let i=0;i<p.count;i++)Ii[io++]=po+i;po+=p.count});
    const geo=new T.BufferGeometry();geo.setAttribute("position",new T.BufferAttribute(Pp,3));geo.setAttribute("normal",new T.BufferAttribute(Nn,3));geo.setAttribute("uv",new T.BufferAttribute(Uu,2));geo.setIndex(new T.BufferAttribute(Ii,1));
    const mm=new T.Mesh(geo,mat);mm.castShadow=mat!==SHD;mm.receiveShadow=true;if(mat===SHD)mm.renderOrder=1;g.add(mm)});
  g.remove(PG);PG.traverse(m=>{if(m.isMesh)m.geometry.dispose()})}
Promise.all(PUTS).then(bake).catch(e=>console.warn("classroom bake skipped",e));
(function spin(){requestAnimationFrame(spin);if(AREA==="school")FANS.forEach(f=>f.rotation.y+=.05)})();
})();
