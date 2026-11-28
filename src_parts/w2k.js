
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
  VRS={vr:1,keys:{},phase:"walk",t0:performance.now(),from:{x:P.x,z:P.z,yaw:P.yaw},camFrom:cam.position.clone()};W2.blaster=VRS;POD.sits=(POD.sits||0)+1;beep(520,.08,"triangle",.05);setTimeout(()=>beep(780,.1,"triangle",.05),90)}
const SEQ={walk:800,sit:700,goggles:1700,out:900};
function eyePos(){return new T.Vector3(SEAT.x,1.42,SEAT.z)}
function lookOut(){return new T.Vector3(SEAT.x+POD_DIR.x*4,1.3,SEAT.z+POD_DIR.z*4)}
const _gcV=gameCam;gameCam=function(dt){if(!VRS)return _gcV(dt);const now=performance.now(),k=(now-VRS.t0)/(SEQ[VRS.phase]||1);
  const outside=new T.Vector3(PC.x+POD_DIR.x*4.2-POD_DIR.z*1.2,2.2,PC.z+POD_DIR.z*4.2+POD_DIR.x*1.2),podLook=new T.Vector3(PC.x,1.25,PC.z);
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
