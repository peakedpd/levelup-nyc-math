"use strict";
/* =====================================================================
   LevelUp cinematic conversations (cine3d.js, loaded after world2.js).
   Every time the student talks to / is greeted by / is challenged by a person, the game cuts to a short
   movie-style scene: letterbox bars, a collision-aware over-the-shoulder or two-shot camera that frames the
   speaker's face (computed from the model's Head bone), both characters turn to face each other, the speaker
   nods while talking, the line is spoken in that character's own pre-recorded voice (voice/<char>/*.mp3,
   browser voice as fallback for lines with numbers/names), subtitles always on.
   Tap / E / Space / Enter = next line, Esc or ⏭ Skip = skip. Settings (voice on/off, reduce motion) in the top bar.
   Public API: window.CINEMA.play({npc, lines:[{text, who:'npc'|'hero', ms}], kind, onEnd}), CINEMA.register(key, desc).
   ===================================================================== */
(function(){
const V3=T.Vector3,now=()=>performance.now();
/* ---------- settings ---------- */
const ST=(()=>{let d={voice:1,motion:1};try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)d.motion=0}catch(_){}try{Object.assign(d,JSON.parse(localStorage.getItem("lu3d_cine")||"{}"))}catch(_){}return d})();
const saveST=()=>{try{localStorage.setItem("lu3d_cine",JSON.stringify(ST))}catch(_){}};
/* automated browsers keep the old instant behaviour unless a test opts in (window.__cineTest), like the daily greeting */
const enabled=()=>!(navigator.webdriver&&!window.__cineTest);

/* ---------- voices ---------- */
const TTSP={okafor:{pitch:1,rate:.93,g:"f"},marcia:{pitch:1.2,rate:1,g:"f"},theo:{pitch:1.65,rate:1.1,g:"m"},sal:{pitch:.75,rate:.9,g:"m"},worker:{pitch:.95,rate:.88,g:"m"},
  brock:{pitch:1.35,rate:1.06,g:"m"},muncher:{pitch:.2,rate:.85,g:"m"},narrator:{pitch:1.05,rate:.95,g:"f"}};
const FEM=/female|woman|samantha|victoria|karen|moira|tessa|zira|susan|aria|jenny|serena|fiona|allison|ava|joanna|salli|kimberly|libby|sonia|natasha|catherine|google us english$/i,
  MAL=/\bmale\b|daniel|alex\b|fred|david|mark|guy|george|rishi|tom\b|aaron|ryan|christopher|eric|matthew|brian|google uk english male/i;
let VCACHE=null;function sysVoice(g){try{const vs=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));if(!vs.length)return null;
  if(!VCACHE)VCACHE={f:vs.find(v=>FEM.test(v.name)&&!/male/i.test(v.name.replace(/female/i,"")))||vs[0],m:vs.find(v=>MAL.test(v.name)&&!/female/i.test(v.name))||vs[0]};return VCACHE[g]}catch(_){return null}}
const ttsText=t=>String(t).replace(/×/g," times ").replace(/÷/g," divided by ").replace(/−/g," minus ").replace(/=/g," equals ").replace(/\bMs\./g,"Miz").replace(/\bMr\./g,"Mister").replace(/[\u{1F000}-\u{1FFFF}\u2600-\u27BF\uFE0F]/gu,"").replace(/[“”"]/g,"");
let AUD=null,VTOK=0;
function stopVoice(){VTOK++;if(AUD){try{AUD.pause()}catch(_){}AUD=null}try{speechSynthesis.cancel()}catch(_){}}
function tts(key,text,tok){return new Promise(res=>{let done=false;const fin=how=>{if(!done){done=true;res(how)}};
  try{if(!window.speechSynthesis)return fin("none");const u=new SpeechSynthesisUtterance(ttsText(text)),p=TTSP[key]||TTSP.narrator,v=sysVoice(p.g);if(v)u.voice=v;u.pitch=Math.min(2,p.pitch);u.rate=p.rate;
    u.onend=()=>fin("tts");u.onerror=()=>fin("none");speechSynthesis.speak(u);setTimeout(()=>fin(tok===VTOK?"tts":"stopped"),String(text).length*85+2500)}catch(_){fin("none")}})}
function findLine(key,text){const M=window.VOICE_MAN||{},n=voiceNorm(text);if(M[key]&&M[key][n])return{key,f:M[key][n]};for(const k in M)if(M[k][n])return{key:k,f:M[k][n]};return null}
/* play a line in a character's voice; resolves when it has finished ("audio" | "tts" | "muted" | "none") */
function voice(key,text){stopVoice();const tok=VTOK;CINE.lastVoice={key,text,how:"pending"};
  if(!ST.voice||!text)return Promise.resolve(CINE.lastVoice.how="muted");
  const hit=findLine(key,text);
  const p=hit?new Promise(res=>{const a=new Audio("voice/"+hit.f);AUD=a;a.preload="auto";a.volume=key==="brock"?1:.92;let ok=false;
      a.onended=()=>res("audio");a.onerror=()=>{if(tok===VTOK)tts(key,text,tok).then(res);else res("stopped")};
      a.play().then(()=>{ok=true;CINE.lastVoice.file=hit.f}).catch(()=>{if(tok===VTOK)tts(key,text,tok).then(res);else res("stopped")})})
    :tts(key,text,tok);
  return p.then(how=>{if(tok===VTOK)CINE.lastVoice.how=how;return how})}
/* every existing speak() call now uses the right character's voice */
let LASTSAY={who:"",t:0},QUIET=0;
const _say=say;say=function(who,text){LASTSAY={who,t:now()};try{greetCheck(who,text)}catch(_){}return _say.apply(this,arguments)};
const _speak=speak;speak=function(t){if(CUR&&!CUR.ownSpeak)return;if(now()<QUIET)return;let key="narrator";const hit=findLine("narrator",t);
  if(hit)key=hit.key;else if(now()-LASTSAY.t<300)key=voiceKey(LASTSAY.who);else if(QG&&QG.npc)key=voiceKey(QG.npc);else if(W2.teach)key="okafor";else if(W2.boss)key="muncher";
  voice(key,t)};

/* ---------- people (positions, faces, how to pin / turn them) ---------- */
const hb=a=>{if(!a)return null;if(a._hb===undefined){a._hb=null;a.g.traverse(o=>{if(!a._hb&&o.isBone&&/^head$/i.test(o.name))a._hb=o})}return a._hb};
function boneHead(a,fb){const b=hb(a);if(b&&a.g.visible){const v=new V3();b.getWorldPosition(v);v.y+=.09;if(Math.abs(v.x-fb.x)<1&&Math.abs(v.z-fb.z)<1&&v.y>fb.y-.7&&v.y<fb.y+.5)return v}return fb}
const NPC={
 theo:{name:"Theo",key:"theo",pos:()=>({x:TH.x,z:TH.z}),head:()=>boneHead(ACT.theo,new V3(TH.x,(TH.fy||0)+1.72,TH.z)),act:()=>ACT.theo,pin:s=>{TH.x=s.x;TH.z=s.z;if(ACT.theo)ACT.theo.g.position.set(TH.x,TH.fy||0,TH.z)}},
 marcia:{name:"Ms. Marcia",key:"marcia",pos:()=>({x:MA.x,z:MA.z}),head:()=>boneHead(ACT.marcia,new V3(MA.x,.12+2.08,MA.z)),act:()=>ACT.marcia,pin:s=>{MA.x=s.x;MA.z=s.z;if(ACT.marcia)ACT.marcia.g.position.set(MA.x,.12,MA.z)}},
 okafor_street:{name:"Ms. Okafor",key:"okafor",pos:()=>({x:STREET_OK.x,z:STREET_OK.z}),head:()=>new V3(STREET_OK.x,.12+1.93,STREET_OK.z),bill:()=>W2.ok,solid:true},
 okafor:{name:"Ms. Okafor",key:"okafor",pos:()=>({x:TCH.x,z:TCH.z}),head:()=>new V3(TCH.x,(TCH.fy||0)+1.93,TCH.z),bill:()=>TCH.mesh,face:y=>{TCH.yaw=y},pin:s=>{TCH.x=s.x;TCH.z=s.z;TCH.mesh.position.x=s.x;TCH.mesh.position.z=s.z}},
 worker:{name:"Arcade Worker",key:"worker",pos:()=>({x:WK.x,z:WK.z}),head:()=>boneHead(ACT.worker,new V3(WK.x,1.7,WK.z)),act:()=>ACT.worker},
 sal:{name:"Mr. Sal",key:"sal",pos:()=>({x:SAL.x,z:SAL.z}),head:()=>new V3(SAL.x,2.0,SAL.z),bill:()=>W2.sal&&W2.sal.m},
 brock:{name:"Brock",key:"brock",pos:()=>({x:BRK.x,z:BRK.z}),head:()=>new V3(BRK.x,.12+1.62,BRK.z),bill:()=>BRK.mesh},
 muncher:{name:"Number Muncher",key:"muncher",pos:()=>({x:BOSS.g.position.x,z:BOSS.g.position.z}),head:()=>{const v=new V3();(BOSS.head||BOSS.g).getWorldPosition(v);return v},bill:()=>null}
};
function npcFor(who){const k=voiceKey(who);if(k==="okafor")return AREA==="school"?NPC.okafor:NPC.okafor_street;return NPC[k]||null}
const heroHead=()=>boneHead(ACT.hero,new V3(P.x,(P.fy||0)+(P.y||0)+1.72,P.z));

/* ---------- camera placement: never inside walls/props, never behind a head ---------- */
function bounds(sub){const B=bounds0();if(B&&sub&&!(sub.x>B.x0-1&&sub.x<B.x1+1&&sub.z>B.z0-1&&sub.z<B.z1+1))return null;return B}
function bounds0(){if(AREA==="street")return{x0:-60,x1:60,z0:-8.7,z1:8.7,y0:.35,y1:30};const R0=ROOMS[AREA];if(!R0)return null;const rw=R0.w||RW,rd=R0.d||RD;
  return{x0:R0.cx-rw/2+.4,x1:R0.cx+rw/2-.4,z0:R0.cz-rd/2+.4,z1:R0.cz+rd/2-.4,y0:.35,y1:(R0.h||RH)-.3}}
function solids(){const B=bounds0();return SOL.filter(b=>b.top>.5&&(!B||!(b.x1<B.x0-2||b.x0>B.x1+2||b.z1<B.z0-2||b.z0>B.z1+2)))}
function inSolid(p,L){for(const b of L)if(p.x>b.x0-.15&&p.x<b.x1+.15&&p.z>b.z0-.15&&p.z<b.z1+.15&&p.y>(b.y0||0)-.1&&p.y<b.top+.1)return true;return false}
function segHits(a,c,L,skip){const d=c.clone().sub(a);for(const b of L){if(skip.some(s=>s.x>b.x0-.05&&s.x<b.x1+.05&&s.z>b.z0-.05&&s.z<b.z1+.05))continue;
  let t0=0,t1=.97,ok=true;for(const[o,dd,a0,a1]of[[a.x,d.x,b.x0,b.x1],[a.y,d.y,b.y0||0,b.top],[a.z,d.z,b.z0,b.z1]]){if(Math.abs(dd)<1e-6){if(o<a0||o>a1){ok=false;break}continue}let u=(a0-o)/dd,v=(a1-o)/dd;if(u>v)[u,v]=[v,u];t0=Math.max(t0,u);t1=Math.min(t1,v);if(t0>t1){ok=false;break}}if(ok)return true}return false}
function segDist(p,a,c){const d=c.clone().sub(a),t=Math.max(0,Math.min(1,p.clone().sub(a).dot(d)/d.lengthSq()));return a.clone().addScaledVector(d,t).distanceTo(p)}
/* subject = face we film, other = the person they talk to. Returns {pos, look, kind}. */
function frame(subject,other,o){o=o||{};const B=bounds(subject),L=solids(),skip=[{x:subject.x,z:subject.z},{x:other.x,z:other.z}];
  const f=new V3(subject.x-other.x,0,subject.z-other.z);let D=f.length();if(D<.05){f.set(Math.sin(P.yaw),0,Math.cos(P.yaw));D=.05}f.normalize();const r=new V3(-f.z,0,f.x);
  const low=o.low?-.32:.1,cands=[];
  for(const s of(o.side>0?[1,-1]:[-1,1])){cands.push({kind:"ots",pos:other.clone().addScaledVector(f,-.9).addScaledVector(r,s*.85).add(new V3(0,low+.05,0)),look:subject.clone()});}
  for(const s of[1,-1])for(const k of[1.3,1])cands.push({kind:"ots",pos:other.clone().addScaledVector(f,-.6*k).addScaledVector(r,s*.75*k).add(new V3(0,low*.6,0)),look:subject.clone()});
  const mid=subject.clone().lerp(other,.5);
  for(const s of[1,-1])for(const k of[1,.7])cands.push({kind:"two",pos:mid.clone().addScaledVector(r,s*Math.max(1.6,D*1.15)*k).addScaledVector(f,-.25).add(new V3(0,.12+low*.5,0)),look:subject.clone().lerp(other,innerWidth<innerHeight?0:.18)});
  if(D>1.3)cands.push({kind:"single",pos:subject.clone().addScaledVector(f,-Math.min(1.1,D-.35)),look:subject.clone()});
  cands.push({kind:"close",pos:subject.clone().addScaledVector(f,-.75).add(new V3(0,.05,0)),look:subject.clone()});
  const okB=p=>!B||(p.x>B.x0&&p.x<B.x1&&p.z>B.z0&&p.z<B.z1&&p.y>B.y0&&p.y<B.y1);
  for(const c of cands){if(!okB(c.pos)||inSolid(c.pos,L)||segHits(c.pos,c.look,L,skip))continue;
    if(segDist(other,c.pos,subject)<.42&&c.kind!=="close")continue;               // the other person's head would block the face
    if(c.pos.distanceTo(subject)<.55)continue;return c}
  const c=cands[cands.length-1];if(B){c.pos.x=Math.min(B.x1,Math.max(B.x0,c.pos.x));c.pos.z=Math.min(B.z1,Math.max(B.z0,c.pos.z));c.pos.y=Math.min(B.y1,Math.max(B.y0,c.pos.y))}return c}

/* ---------- UI ---------- */
const css=document.createElement("style");css.textContent=`
#cnT,#cnB{position:fixed;left:0;right:0;background:#000;z-index:2147483100;visibility:hidden;font-family:'Trebuchet MS',system-ui,sans-serif;color:#fff}
#cnT{top:0;height:max(56px,11vh);transform:translateY(-101%);display:flex;align-items:center;justify-content:flex-end;gap:6px;padding:0 10px;box-sizing:border-box}
#cnB{bottom:0;min-height:max(104px,17vh);transform:translateY(101%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 16px 12px;box-sizing:border-box;text-align:center}
.cnOn #cnT,.cnOn #cnB{visibility:visible}.cnQ #qcard{visibility:hidden!important}
#cnW{font-size:clamp(12px,3.2vw,15px);letter-spacing:.16em;text-transform:uppercase;font-weight:900;color:#ffd23f}
#cnS{font-size:clamp(16px,4.4vw,25px);font-weight:700;line-height:1.25;margin-top:4px;max-width:900px;text-shadow:0 2px 0 #000}
#cnH{font-size:12px;opacity:.6;margin-top:6px}
#cnT button{font:800 13px 'Trebuchet MS',sans-serif;color:#fff;background:#222;border:2px solid #555;border-radius:10px;min-height:40px;min-width:44px;padding:0 10px;cursor:pointer;touch-action:manipulation}
#cnT #cnSkip{background:#ffd23f;color:#14123a;border-color:#ffd23f}
#cnTap{position:fixed;inset:0;z-index:2147483050;display:none;cursor:pointer;touch-action:none}.cnOn #cnTap{display:block}
#cnFlash{position:fixed;inset:0;z-index:2147483040;pointer-events:none;background:radial-gradient(circle,rgba(255,40,40,0) 40%,rgba(255,30,30,.35));opacity:0;transition:opacity .25s}`;
if(/embed/.test(location.search))css.textContent+=`#cnT{height:calc(max(56px,11vh) + 56px);padding-top:56px}`;
document.head.appendChild(css);
const ui=document.createElement("div");ui.innerHTML=`<div id="cnTap" aria-hidden="true"></div><div id="cnFlash"></div><div id="cnT" role="toolbar" aria-label="Scene controls"><button id="cnVoice" aria-label="Voices on or off"></button><button id="cnMotion" aria-label="Reduce motion"></button><button id="cnSkip" aria-label="Skip scene">Skip ⏭</button></div>
<div id="cnB" role="dialog" aria-live="polite"><div id="cnW"></div><div id="cnS"></div><div id="cnH">tap · E · Space = next</div></div>`;document.body.appendChild(ui);
const $=id=>document.getElementById(id);
function paintST(){$("cnVoice").textContent=ST.voice?"🔊 Voices on":"🔇 Voices off";$("cnMotion").textContent=ST.motion?"🎥 Motion: full":"🎥 Motion: reduced";document.body.classList.toggle("cnRM",!ST.motion)}paintST();
const stop=e=>{e.stopPropagation();e.preventDefault()};
$("cnVoice").addEventListener("pointerdown",stop);$("cnMotion").addEventListener("pointerdown",stop);$("cnSkip").addEventListener("pointerdown",stop);
$("cnVoice").onclick=e=>{stop(e);ST.voice=ST.voice?0:1;saveST();paintST();if(!ST.voice)stopVoice();else if(CUR)speakLine()};
$("cnMotion").onclick=e=>{stop(e);ST.motion=ST.motion?0:1;saveST();paintST()};
$("cnSkip").onclick=e=>{stop(e);end(true)};
$("cnTap").addEventListener("pointerdown",e=>{stop(e);next()});
addEventListener("keydown",e=>{if(!CUR)return;const k=e.key.toLowerCase();if(k==="e"||k===" "||k==="enter")next();else if(k==="escape")end(true);else if(k==="v")$("cnVoice").click();e.stopImmediatePropagation();e.preventDefault()},true);

/* ---------- scene player ---------- */
let CUR=null;
/* letterbox slide-in driven by the game loop (CSS transitions can stall in background tabs) */
function bars(k){const e=1-Math.pow(1-k,3);$("cnT").style.transform="translateY("+(-101*(1-e))+"%)";$("cnB").style.transform="translateY("+(101*(1-e))+"%)"}
function play(o){if(!o||!o.npc||!o.lines||!o.lines.length)return false;if(CUR)end(true,true);
  const n=o.npc;const p0=n.pos();CUR={o,n,i:-1,t0:now(),pin:{x:p0.x,z:p0.z},kind:o.kind||"talk",cam:!o.keepCam,bob:[]};
  try{document.exitPointerLock()}catch(_){}for(const k in K)K[k]=false;try{JOY.x=JOY.z=0}catch(_){}
  document.body.classList.add("cnOn");document.body.classList.toggle("cnQ",!!o.blockQG||o.kind==="win");bars(0)
  if(n===NPC.brock&&BRK.prop)BRK.prop.traverse(x=>{if(x.isSprite&&x.visible){x.visible=false;(CUR.hid=CUR.hid||[]).push(x)}});
  if(o.blockQG&&QG)QG.t0=now();
  CINE.count++;CINE.log.push({npc:n.key,name:o.who||n.name,kind:CUR.kind,t:Date.now()});nextLine();return true}
function nextLine(){const c=CUR;if(!c)return;c.i++;if(c.i>=c.o.lines.length)return end(false);
  const l=c.o.lines[c.i];c.line=l;c.lt0=now();c.vdone=false;const hero=l.who==="hero";
  $("cnW").textContent=hero?(window.PNAME||"You"):(c.o.who||c.n.name);$("cnW").style.color=hero?"#7cf7ff":"#ffd23f";$("cnS").textContent=l.text?"“"+l.text.replace(/^["“]+|["”]+$/g,"")+"”":"";
  c.shotFor=hero?"hero":"npc";c.shot=null;c.frames=0;c.shake=(c.kind==="confront"&&ST.motion)?now():0;
  if(c.kind==="confront"&&ST.motion){const fl=$("cnFlash");fl.style.opacity=1;setTimeout(()=>fl.style.opacity=0,260)}
  speakLine()}
function speakLine(){const c=CUR;if(!c)return;const l=c.line,key=c.line.who==="hero"?"narrator":c.n.key,id=c.i;
  if(!l.text||l.who==="hero"&&!l.voice){c.vdone=true;return}
  voice(key,l.text).then(how=>{if(CUR!==c||c.i!==id)return;c.vdone=true;c.how=how})}
function next(){if(!CUR)return;if(now()-CUR.lt0<250)return;stopVoice();nextLine()}
function end(skipped,silent){const c=CUR;if(!c)return;CUR=null;stopVoice();document.body.classList.remove("cnOn","cnQ");
  (c.hid||[]).forEach(x=>x.visible=true);undoBob(c);if(c.cam){camYaw=Math.atan2(cam.position.x-P.x,cam.position.z-P.z);try{camSnap=false}catch(_){}}
  CINE.last={npc:c.n.key,skipped:!!skipped,lines:c.i+1};if(!silent&&c.o.onEnd)try{c.o.onEnd(skipped)}catch(e){console.error(e)}}
function lineDone(c,t){const l=c.line;if(CINE.hold&&!l.ms)return false;/* tests: wait for tap */if(l.ms)return t-c.lt0>l.ms;const minT=l.text?Math.max(1300,l.text.length*(c.vdone&&c.how==="audio"?20:58)+600):900;return c.vdone&&t-c.lt0>minT||t-c.lt0>minT+9000}

/* ---------- per-frame: camera, people, bars ---------- */
const _gc=gameCam;gameCam=function(dt){const c=CUR;if(!c||!c.cam)return _gc(dt);c.frames=(c.frames||0)+1;
  const sub=c.shotFor==="hero"?heroHead():c.n.head(),oth=c.shotFor==="hero"?c.n.head():heroHead();
  if(!c.shot||now()-(c.shotT||0)>700){const s=frame(sub,oth,{low:c.kind==="confront",side:c.kind==="confront"?(c.shotFor==="hero"?1:-1):1});if(!c.shot||s.kind!==c.shot.kind||s.pos.distanceTo(c.shot.pos)>.4){c.shot=s;c.cut=true}else{c.shot.pos.lerp(s.pos,.3)}c.shotT=now()}
  const s=c.shot,t=now(),k=Math.min(1,(t-c.lt0)/3500),e=1-Math.pow(1-k,3);
  const back=s.pos.clone().sub(s.look).normalize();const want=s.pos.clone().addScaledVector(back,ST.motion?(1-e)*.35:0);
  if(c.shake&&t-c.shake<420){const a=(1-(t-c.shake)/420)*.05;want.x+=(Math.random()-.5)*a;want.y+=(Math.random()-.5)*a;want.z+=(Math.random()-.5)*a}
  if(c.cut&&(!ST.motion||c.i===0&&t-c.t0<60||cam.position.distanceTo(want)>4)){cam.position.copy(want);c.cut=false}else cam.position.lerp(want,Math.min(1,dt*(ST.motion?4:12)));
  const look=sub.clone();if(c.shotFor==="npc"&&s.kind==="two"&&innerWidth>=innerHeight)look.lerp(oth,.15);cam.lookAt(look);try{PR.style.display="none"}catch(_){}return true};
function undoBob(c){for(const b of c.bob){if(b.q&&b.o.quaternion.equals(b.qa))b.o.quaternion.copy(b.q);if(b.dy&&Math.abs(b.o.position.y-b.ya)<1e-6)b.o.position.y-=b.dy}c.bob=[]}
const _ug=updateGame;updateGame=function(dt,t){if(CUR&&CUR.o.blockQG&&QG&&QG.phase==="intro")QG.t0=t;_ug(dt,t);const c=CUR;
  if(!c){if(PEND&&PEND.go)playPending();return}
  if(QG&&c.o.blockQG&&QG.phase==="intro")QG.t0=t;
  if(c.o.until&&!c.o.until()){end(false,true);return}
  bars(ST.motion?Math.min(1,(t-c.t0)/380):1);
  undoBob(c);const n=c.n,a=n.act&&n.act();
  if(c.cam){for(const k in K)K[k]=false;try{JOY.x=JOY.z=0}catch(_){}if(n.pin)n.pin(c.pin);
    const np=n.pos(),yawN=Math.atan2(P.x-np.x,P.z-np.z),yawP=Math.atan2(np.x-P.x,np.z-P.z);P.yaw=yawP;const H=ACT.hero;if(H){H.g.visible=true;H.yaw=H.g.rotation.y=yawP}
    if(a){a.yaw=a.g.rotation.y=yawN}if(n.face)n.face(yawN)}
  const talking=c.line&&c.line.text&&c.line.who!=="hero"&&!c.vdone,ts=t/1000;
  if(talking&&ST.motion){const b=hb(a);if(b){const q=b.quaternion.clone();b.rotateX(Math.sin(ts*9)*.07);b.rotateY(Math.sin(ts*3.3)*.05);c.bob.push({o:b,q,qa:b.quaternion.clone()})}
    else{const m=n.bill&&n.bill();if(m){const dy=Math.abs(Math.sin(ts*10))*.035;m.position.y+=dy;c.bob.push({o:m,dy,ya:m.position.y})}}}
  if(lineDone(c,t))nextLine()};
const _ub=updateBubble;updateBubble=function(t){if(CUR&&CUR.cam){BUB.style.display="none";return}return _ub(t)};
const _bl=BLOCKIN;BLOCKIN=()=>!!CUR||_bl();
const _bb=brockBusy;brockBusy=function(){return !!CUR||_bb()};

/* ---------- hooks: every contact with a person is a scene ---------- */
const L=CINE_LINES,line=t=>({who:"npc",text:String(t).replace(/^["“\s]+|["”\s]+$/g,"")});
// talking (Q / 💬 / E on "talk")
const _talk=talkTo;talkTo=function(who,x,y,z){const n=npcFor(who);if(!enabled()||!n||!TALK[who])return _talk.apply(this,arguments);
  const Ls=TALK[who](),i=(W2.talkI[who]||0)%Ls.length;W2.talkI[who]=i+1;play({npc:n,lines:[line(Ls[i])],kind:"talk"})};
// greetings when you walk up (once per visit)
const GREET={},GRE=[["Ms. Okafor",/^Good morning/,()=>L.okafor.greet],["Mr. Sal",/Mr\. Sal here/,()=>L.sal.greet],["Arcade Worker",/^Yo\. Prize Corner/,()=>L.worker.greet]];
function greetCheck(who,text){if(CUR||!enabled()||QG||W2.ui||W2.blaster)return;for(const[w,re,f]of GRE)if(who===w&&re.test(text)){const id=w+"@"+AREA;if(GREET[id]&&now()-GREET[id]<120000)return;GREET[id]=now();const n=npcFor(w);if(n)setTimeout(()=>{if(!CUR)play({npc:n,lines:[line(f())],kind:"greet"})},0);return}}
// math challenge start (Ms. Marcia, Ms. Okafor, Theo): the intro line is the scene, the question waits behind it
const _sg=startGame;startGame=function(npc){const had=QG;const r=_sg.apply(this,arguments);if(!enabled()||had||!QG||QG.npc!==npc)return r;const n=npcFor(npc);
  const txt=QG.intro||(n&&L[n.key]&&L[n.key].start)||"Ready? Here comes a math challenge!";if(n)play({npc:n,lines:[line(txt)],kind:"start",blockQG:true,until:()=>!!QG});return r};
// math win: Theo/Marcia/Okafor hand over the XP orb (the game's own two-shot) with letterbox + their voice
const _ug2=updateGame;updateGame=function(dt,t){_ug2(dt,t);if(!enabled()||CUR||!QG||QG.phase!=="hand"||QG._cine)return;QG._cine=1;const n=npcFor(QG.npc);
  if(n&&L[n.key]&&L[n.key].win)play({npc:n,lines:[line(L[n.key].win)],kind:"win",keepCam:true,until:()=>!!QG})};
// Brock: a face-off before every challenge (dramatic low angle, shake, red flash, hero reaction shot)
const unq=s=>String(s||"").replace(/\s*\(Press E[^)]*\)\s*$/,"").replace(/^["“\s]+|["”\s]+$/g,"");
const _bg=brockGo;brockGo=function(){if(!enabled()||!BRK.info)return _bg.apply(this,arguments);BRK.armed=false;BRK.auto=0;
  const done=BRK.info.done,ls=done?[line(L.brock.bonus)]:[{who:"hero",text:"",ms:850},line(unq(BRK.info.say)||L.brock.dare),line(L.brock.dare)];
  play({npc:NPC.brock,who:done?"Brock":BRK.info.title,lines:ls,kind:done?"talk":"confront",onEnd:()=>_bg()})};
// Brock's reaction after the battle (sent by the challenge screen); plays when you're back in the street with him
let PEND=null;
addEventListener("message",e=>{const d=e.data;if(!d)return;if(d.lv3d==="brock_result")PEND={r:d.result,t:now()};if(d.lv3d==="brock"&&PEND&&d.done&&PEND.r==="defeated")PEND.say=unq(d.say)});
const arm=()=>{if(PEND)PEND.go=true};addEventListener("pointerdown",arm,true);addEventListener("keydown",arm,true);addEventListener("focus",arm);
function playPending(){const p=PEND;PEND=null;if(!enabled()||AREA!=="street"||!BRK.on||now()-p.t>600000)return;if(Math.hypot(P.x-BRK.x,P.z-BRK.z)>14)return;
  const txt=p.r==="defeated"?(p.say||"Okay, okay — that was really cool. Friends? I'll stop blocking the corner."):p.r==="slipped"?L.brock.slip:p.r==="quit"?L.brock.quit:L.brock.lose;
  play({npc:NPC.brock,who:"Brock",lines:[line(txt)],kind:p.r==="defeated"?"talk":"confront"})}
// Arcade Worker: Prize Corner
const _op=openPrizes;openPrizes=function(){if(!enabled()||CUR||QG||W2.blaster||W2._pzCine&&now()-W2._pzCine<60000)return _op.apply(this,arguments);W2._pzCine=now();
  play({npc:NPC.worker,lines:[line(L.worker.prizes)],kind:"talk",onEnd:()=>_op()})};
// Mr. Sal: shop
const _ss=salShop;salShop=function(){if(!enabled())return _ss.apply(this,arguments);play({npc:NPC.sal,lines:[line(L.sal.shop)],kind:"talk",onEnd:()=>{QUIET=now()+600;_ss()}})};
// Number Muncher boss intro
if(typeof bossStart==="function"){const _bs=bossStart;bossStart=function(){if(!enabled()||QG||W2.boss)return _bs.apply(this,arguments);
  play({npc:NPC.muncher,lines:[line(L.muncher.roar)],kind:"confront",onEnd:()=>{QUIET=now()+700;_bs()}})}}
// Ms. Okafor / Theo reactions (desk items, litter, fruit, shoplifting) — same scene system, fixes the back-of-the-head camera
const _ok=okaforSays;okaforSays=function(t){if(!enabled()||AREA!=="school")return _ok.apply(this,arguments);play({npc:NPC.okafor,lines:[line(t)],kind:"react"})};
const _th=theoSays;theoSays=function(t){if(!enabled())return _th.apply(this,arguments);if(Math.hypot(TH.x-P.x,TH.z-P.z)>6){TH.x=P.x+1.3;TH.z=P.z+.9}play({npc:NPC.theo,lines:[line(t)],kind:"react"})};

const CINE={play,end,next,voice,stopVoice,frame,NPC,npcFor,heroHead,settings:ST,saveST,paintST,enabled,count:0,log:[],lastVoice:null,last:null,
  get active(){return !!CUR},get cur(){return CUR&&{npc:CUR.n.key,i:CUR.i,kind:CUR.kind,frames:CUR.frames||0,shot:CUR.shot&&CUR.shot.kind,text:CUR.line&&CUR.line.text}},
  register(key,d){NPC[key]=d},talk(who,lines,onEnd){const n=typeof who==="string"?(NPC[who]||npcFor(who)):who;return play({npc:n,lines:lines.map(x=>typeof x==="string"?line(x):x),onEnd})}};
window.CINEMA=CINE;
})();
