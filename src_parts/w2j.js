
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
