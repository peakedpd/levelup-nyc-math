/* ---------- ENV 3D · STREET: real 3D upper floors on every building ----------
   The Canva facade art now covers only the storefront / stoop floor. Everything above it is real geometry:
   recessed double-hung windows (frames, mullions, sills, lintels with keystones), curtains, shades, lit rooms,
   flower boxes, AC units, string courses between floors, and proper NYC fire escapes (slatted platforms,
   railings with balusters, brackets, stairs between floors and a drop ladder you can pull down).
   Interactions: pull the fire-escape ladder (🪜), look up and count the windows (🪟 math moment),
   and the trash-can lid now gives a peek-inside camera. Instanced boxes keep it to a few draw calls. */
(()=>{
const ENV=window.ENV3D=window.ENV3D||{};const E=ENV.street={bld:[],ladders:[],taps:0,parts:0};
const CUT={school:.68,arcade:.53,clothing:.45,apartment:.6};
const FACK=new Map(Object.entries(FAC).map(([k,v])=>[v,k]));
/* ---- instancer: one InstancedMesh per material/geometry ---- */
const IB=new T.BoxGeometry(1,1,1),IBL=new T.IcosahedronGeometry(.5,0),IN={};
const MAT={glass:M(0x1e2a3a,{roughness:.12,metalness:.65}),sky:M(0x6f8fb0,{roughness:.1,metalness:.7}),lit:M(0xffe2a0,{emissive:0xffc06a,emissiveIntensity:.8,roughness:.3}),
  frW:M(0xf1ebdf,{roughness:.7}),frK:M(0x1f1a24,{roughness:.5,metalness:.3}),frG:M(0x1f5a52,{roughness:.6}),frC:M(0xe6d7bd,{roughness:.75}),
  stone:M(0xd9cdb8,{roughness:.9}),band:M(0xc9b9a0,{roughness:.9}),iron:M(0x1c1c1f,{metalness:.55,roughness:.5}),
  cuR:M(0xb23a48,{roughness:.9}),cuB:M(0x3a5ab2,{roughness:.9}),cuY:M(0xd9b44a,{roughness:.9}),shade:M(0xf3e9d0,{roughness:.9,emissive:0x332a14,emissiveIntensity:.3}),
  wood:M(0x6b4423,{roughness:.9}),leaf:M(0x3f8f3a,{roughness:.9,flatShading:true}),flP:M(0xe84a8a,{roughness:.8,flatShading:true}),flY:M(0xf2c230,{roughness:.8,flatShading:true}),
  ac:M(0xc3c7cc,{metalness:.35,roughness:.5}),grill:M(0x5b6066,{metalness:.4,roughness:.6})};
const CAST=new Set(["iron"]);
const _m=new T.Matrix4(),_q=new T.Quaternion(),_e=new T.Euler(),_v=new T.Vector3(),_s=new T.Vector3();
function ip(key,base,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0,geo){const k=key+(geo?"|ico":"");(IN[k]||(IN[k]={key,geo:geo||IB,list:[]})).list.push(new T.Matrix4().multiplyMatrices(base,_m.compose(_v.set(x,y,z),_q.setFromEuler(_e.set(rx,ry,rz)),_s.set(sx,sy,sz))));E.parts++}
function seeded(n){let s=(n*9301+49297)%233280;return()=>{s=(s*9301+49297)%233280;return s/233280}}
/* ---- find the street buildings (group with the 10×10×10 box whose front face wears a FAC texture) ---- */
const B=[];S.children.forEach(g=>{if(!g.isGroup)return;const b=g.children.find(o=>o.isMesh&&Array.isArray(o.material)&&o.material[4]&&FACK.has(o.material[4].map));if(b)B.push({g,b,kind:FACK.get(b.material[4].map)})});
const ROWS={school:{ys:[8.35],w:1.5,h:2.0,xs:[-3.3,-1.1,1.1,3.3],fr:"frW"},arcade:{ys:[6.55,8.5],w:1.15,h:1.4,xs:[-3.3,-1.1,1.1,3.0],fr:"frK"},
  clothing:{ys:[6.0,8.25],w:1.2,h:1.5,xs:[-3.3,-1.1,1.1,3.3],fr:"frG"},apartment:{ys:[7.0,8.6],w:1.1,h:1.25,xs:[-3.3,-1.1,1.0,3.3],fr:"frC"}};
B.forEach(({g,b,kind},bi)=>{const R=ROWS[kind],cut=CUT[kind],W=10,H=10,fz=5,rnd=seeded(bi*17+3);g.updateMatrixWorld(true);const base=g.matrixWorld.clone();
  /* 1) storefront art only on the ground floor; brick above (the painted upper floors are gone) */
  const fm=b.material[4],t=fm.map.clone();t.needsUpdate=true;t.repeat.set(1,cut);t.offset.set(0,0);t.colorSpace=fm.map.colorSpace;
  const sm=new T.MeshStandardMaterial({map:t,roughness:.8,emissive:fm.emissive.clone(),emissiveIntensity:fm.emissiveIntensity,emissiveMap:fm.emissiveMap?t:null});
  const pl=new T.Mesh(new T.PlaneGeometry(W,H*cut),sm);pl.position.set(0,H*cut/2,fz+.012);pl.receiveShadow=true;pl.userData.flatOK=true;pl.name="env_storefront";g.add(pl);try{U.flatOK.add(pl)}catch(_){}
  const mats=b.material.slice();mats[4]=mats[0];b.material=mats;
  /* the old flat iron slabs that stood in for fire escapes */
  uremove(g,o=>{const p=o.geometry&&o.geometry.parameters;return p&&Math.abs(p.width-3.4)<.01&&((Math.abs(p.height-.1)<.01&&Math.abs(p.depth-1.1)<.01)||(Math.abs(p.height-.9)<.01&&Math.abs(p.depth-.05)<.01))});
  /* 2) a stone string course at the storefront line and between floors */
  ip("band",base,0,H*cut+.05,fz+.07,W-1,.2,.16);if(R.ys.length>1)ip("band",base,0,(R.ys[0]+R.ys[1])/2,fz+.05,W-1,.14,.1);
  /* 3) windows */
  const lit=[];R.ys.forEach((wy,ri)=>R.xs.forEach((wx,ci)=>{const w=R.w,h=R.h,u=rnd();
    const gl=u<.3?"lit":u<.55?"sky":"glass";ip(gl,base,wx,wy,fz+.01,w,h,.02);if(gl==="lit")lit.push([wx,wy]);
    ip(R.fr,base,wx-w/2-.06,wy,fz+.08,.12,h+.12,.16);ip(R.fr,base,wx+w/2+.06,wy,fz+.08,.12,h+.12,.16);ip(R.fr,base,wx,wy+h/2+.06,fz+.08,w+.24,.12,.16);ip(R.fr,base,wx,wy-h/2-.03,fz+.06,w+.24,.07,.12);
    ip(R.fr,base,wx,wy+h*.08,fz+.05,w,.07,.07);ip(R.fr,base,wx,wy,fz+.04,.05,h,.05);
    if(kind==="school"){ip(R.fr,base,wx,wy+h*.33,fz+.04,w,.04,.04);ip(R.fr,base,wx,wy-h*.25,fz+.04,w,.04,.04)}
    ip("stone",base,wx,wy-h/2-.12,fz+.15,w+.4,.12,.3);ip("stone",base,wx,wy+h/2+.22,fz+.1,w+.42,.2,.2);ip("stone",base,wx,wy+h/2+.25,fz+.15,.22,.3,.24);
    const v=rnd();if(gl!=="sky"&&v<.45){const cu=["cuR","cuB","cuY"][Math.floor(rnd()*3)];ip(cu,base,wx-w/2+.15,wy,fz+.025,.26,h*.96,.02);ip(cu,base,wx+w/2-.15,wy,fz+.025,.26,h*.96,.02)}
    else if(v<.7)ip("shade",base,wx,wy+h/2-h*.22,fz+.025,w*.98,h*.42,.02);
    const fb=rnd();if(fb<.28&&!(kind!=="school"&&ci<2)){ip("wood",base,wx,wy-h/2-.02,fz+.3,w*.85,.2,.24);for(let k=0;k<5;k++){const px=wx-w*.36+k*w*.18;ip("leaf",base,px,wy-h/2+.14,fz+.3,.2,.16,.2,0,k,0,IBL);if(k%2===0)ip(rnd()<.5?"flP":"flY",base,px+.04,wy-h/2+.22,fz+.36,.09,.09,.09,0,0,0,IBL)}}
    else if(fb>.84&&!(kind!=="school"&&ci<2)){ip("ac",base,wx,wy-h/2+.25,fz+.26,.72,.44,.52);ip("grill",base,wx,wy-h/2+.25,fz+.53,.6,.32,.02)}}));
  /* 4) fire escape over the left two window columns (not on the school) */
  let fe=null;if(kind!=="school"){const cx=-2.2,fw=3.8,dep=1.1,z0=fz+.02,zf=z0+dep,ys=R.ys.map(y=>y-R.h/2-.2);fe={ys};
    ys.forEach((py,k)=>{ip("iron",base,cx,py,z0+dep/2,fw,.04,dep);for(let s=0;s<9;s++)ip("iron",base,cx,py+.035,z0+.08+s*(dep-.16)/8,fw,.03,.03);
      ip("iron",base,cx,py+.95,zf,fw,.05,.05);ip("iron",base,cx,py+.5,zf,fw,.035,.035);[-1,1].forEach(sd=>{ip("iron",base,cx+sd*fw/2,py+.95,z0+dep/2,.05,.05,dep);ip("iron",base,cx+sd*fw/2,py+.5,z0+dep/2,.035,.035,dep)});
      for(let i=0;i<=12;i++)ip("iron",base,cx-fw/2+i*fw/12,py+.47,zf,.025,.94,.025);[-1,1].forEach(sd=>{for(let i=1;i<4;i++)ip("iron",base,cx+sd*fw/2,py+.47,z0+i*dep/4,.025,.94,.025)});
      [-1.4,1.4].forEach(bx=>ip("iron",base,cx+bx,py-.45,z0+.5,.05,.05,1.25,.78,0,0));
      if(k<ys.length-1){const dy=ys[k+1]-py,dx=2.4,L=Math.hypot(dx,dy),an=Math.atan2(dy,dx),mx=cx-fw/2+.45+dx/2,zz=zf-.32;
        [zz-.22,zz+.22].forEach(sz=>ip("iron",base,mx,py+dy/2,sz,L,.08,.04,0,0,an));for(let r=1;r<9;r++){const f=r/9;ip("iron",base,cx-fw/2+.45+dx*f,py+dy*f,zz,.05,.03,.44)}
        ip("iron",base,mx,py+dy/2+.7,zz+.25,L,.035,.035,0,0,an)}});
    /* the drop ladder hangs under the lowest platform; pull it down */
    const lg=new T.Group(),lk=Kit(),lx=-0.85,lz=zf-.18,top=ys[0]-.05,len=2.4;[-.22,.22].forEach(sx=>lk.add(IB,MAT.iron,sx,-len/2,0,0,0,0,.05,len,.05));for(let r=0;r<8;r++)lk.add(IB,MAT.iron,0,-.15-r*.3,0,0,0,0,.44,.035,.035);
    lk.build(lg);lg.position.set(lx,top,lz);g.add(lg);const wp=g.localToWorld(new T.Vector3(lx,0,fz+1.4));
    const maxDrop=kind==="apartment"?top-len-.12:.6;const L={g:lg,top,down:0,cur:0,maxDrop,kind,x:wp.x,z:wp.z};E.ladders.push(L);
    L.tap=utap("street",wp.x,wp.z,"Press E to pull down the fire-escape ladder 🪜",()=>{L.down=L.down?0:1;ubeep(L.down?180:240,.25,"sawtooth",.035,L.down?-90:120);setTimeout(()=>ubeep(110,.08,"square",.04),L.down?520:380);
        L.tap.label=L.down?"Press E to push the ladder back up":"Press E to pull down the fire-escape ladder 🪜";
        if(L.down)bub("🪜",kind==="apartment"?"Clank! The ladder slides down to the sidewalk. Fire escapes are for emergencies, so we'll stay on the street.":"Clunk… it's stuck on the awning! Up it goes.");if(L.down&&kind!=="apartment")setTimeout(()=>{L.down=0;L.tap.label="Press E to pull down the fire-escape ladder 🪜"},1400)},1.0);E.taps++}
  /* 5) look up and count the windows (math moment) */
  {const rows=R.ys.length,cols=R.xs.length,wp=g.localToWorld(new T.Vector3(3.9,0,fz+1.6)),lookW=g.localToWorld(new T.Vector3(0,(R.ys[0]+R.ys[R.ys.length-1])/2,fz)),outW=g.localToWorld(new T.Vector3(0,0,fz+8)).sub(g.localToWorld(new T.Vector3(0,0,fz)));
    const info={kind,rows,cols,lit:lit.length,x:wp.x,z:wp.z,look:lookW};E.bld.push(info);
    info.tap=utap("street",wp.x,wp.z,"Press E to look up at the windows 🪟",()=>{cine({look:lookW,dir:{x:outW.x,z:outW.z},dist:7.5,h:-5,who:"🪟 Look up!",say:`${rows} row${rows>1?"s":""} of ${cols} windows. ${lit.length} have the lights on.`,dur:2600});
        ubeep(660,.08,"sine",.03,220);E.lastWall=info;setTimeout(()=>uoffer("🪟",`This wall has ${rows} row${rows>1?"s":""} of ${cols} windows. How many windows?`,"windows","win"+bi),900)},1.0);E.taps++}});
/* windows quiz: uses the wall you just looked at */
UQ.G.windows=s=>{const w=E.lastWall||{rows:2,cols:4,lit:3},r=seeded(s%9973),x=w.rows*w.cols,ch=[String(x)];[w.rows+w.cols,x+w.cols,x-1,x+2].forEach(v=>{v=String(v);if(!ch.includes(v)&&ch.length<4&&+v>0)ch.push(v)});
  for(let i=ch.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[ch[i],ch[j]]=[ch[j],ch[i]]}
  return {id:"windows",std:"4.OA.A.1",text:`The wall has ${w.rows} row${w.rows>1?"s":""} of ${w.cols} windows. How many windows in all?`,ans:String(x),choices:ch,explain:`${w.rows} × ${w.cols} = ${x} windows.`,p:{rows:w.rows,cols:w.cols}}};
/* build the instanced meshes */
for(const k in IN){const it=IN[k],im=new T.InstancedMesh(it.geo,MAT[it.key],it.list.length);it.list.forEach((m,i)=>im.setMatrixAt(i,m));im.instanceMatrix.needsUpdate=true;im.castShadow=CAST.has(it.key);im.receiveShadow=true;
  im.computeBoundingSphere&&im.computeBoundingSphere();im.frustumCulled=false;im.name="env_"+k;im.userData.env="street";S.add(im)}
E.meshes=Object.keys(IN).length;E.buildings=B.length;
/* perf: the street facade meshes are never culled (one mesh spans the street), so hide them while you're inside a room */
E.ims=S.children.filter(o=>o.userData&&o.userData.env==="street");let lastA=null;U.anims.push(()=>{if(AREA===lastA)return;lastA=AREA;const on=AREA==="street";E.ims.forEach(o=>o.visible=on)});
let lastT=performance.now();U.anims.push(()=>{const nw=performance.now(),dt=Math.min(.25,(nw-lastT)/1000);lastT=nw;if(AREA!=="street")return;for(const L of E.ladders){const w=L.down?L.maxDrop:0;if(Math.abs(L.cur-w)<.001)continue;L.cur+=(w-L.cur)*Math.min(1,dt*(L.down?9:5));L.g.position.y=L.top-L.cur}});
/* ---- trash cans: lifting the lid now swings the camera over the rim so you can see what's inside ---- */
try{(ST3.cans||[]).forEach(C=>{const t=C.tap;if(!t||t._env)return;const f0=t.fn;t._env=1;t.fn=function(){f0.apply(this,arguments);if(!C.open)return;const v=new T.Vector3();C.cont.getWorldPosition(v);v.y+=.02;
    setTimeout(()=>cine({look:v,dir:{x:P.x-C.x,z:P.z-C.z},dist:.9,h:1.15,who:"🗑️ Inside the can",say:"",dur:1900}),120)};
  /* fill the can a bit more: a crumpled bag and a newspaper under the main item */
  const bag=new T.Mesh(ico(.16,0),UM(0x8a6a44,{flatShading:true,roughness:.95}));bag.position.set(-.12,-.06,.08);bag.scale.set(1,.6,1);C.cont.add(bag);
  const np=new T.Mesh(new T.BoxGeometry(.28,.02,.2),UM(0xe9e4d6,{roughness:.95}));np.position.set(.08,-.1,-.06);np.rotation.y=.6;C.cont.add(np)})}catch(e){console.warn("env3d cans",e)}
})();
