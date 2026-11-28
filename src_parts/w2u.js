
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
    if(U.flatOK.has(o)||o.userData.flatOK||o.isSkinnedMesh)return;/* rigged 3D characters are never flat cards */if(o.geometry&&o.geometry.type==="CylinderGeometry")return;/* skyline drums */
    bb.setFromObject(o);bb.getSize(sz);if(sz.y<.05)return;/* floors / ceilings */
    const big=Math.max(sz.x,sz.z)>=1.4&&sz.y>=1;if(!big||bb.min.y>2.2)return;
    const cz=(bb.min.z+bb.max.z)/2;let area="street";for(const k in ROOMS){const R=ROOMS[k];const d=(R.d||RD)/2+1;if(cz>R.cz-d&&cz<R.cz+d){area=k;break}}
    const src=(img.map.image.currentSrc||img.map.image.src||"").split("/").pop();out.push({area,src,w:+Math.max(sz.x,sz.z).toFixed(2),h:+sz.y.toFixed(2),x:+((bb.min.x+bb.max.x)/2).toFixed(1),z:+cz.toFixed(1)})});return out}
window.flatAudit=flatAudit;
