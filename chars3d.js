/* ---------- Meshy 3D characters (from the Canva renders in img/characters_3d): Ms. Okafor in 3D at school and on the street,
   the 12 picked heroes as rigged 3D models (no more flat sprites), and talk / wave / cheer body language ---------- */
(()=>{
const OK_H=2.15,HERO_H=2.0;
const FILES=["hero00","hero01","hero02","hero03","hero04","hero05","hero06","hero07","hero08","hero09","hero10","hero11"];
window.CHARS3D={okafor:null,okafor_st:null,heroes:{},want:0,log:[]};
/* Ms. Okafor: one rigged model in the classroom (walks her route) and one outside the school */
function hideCard(mat,sh){if(mat){mat.visible=false}if(sh)sh.visible=false}
loadChar(window.OKAFOR3D_URL,OK_H).then(a=>{if(!a)return;ACT.okafor=CHARS3D.okafor=a;a.g.position.set(TCH.x,TCH.fy||0,TCH.z);a.yaw=TCH.yaw||0;a.g.visible=AREA==="school";hideCard(TCH.mat,TCH.shadow);a.last={x:TCH.x,z:TCH.z}});
loadChar(window.OKAFOR3D_URL,OK_H).then(a=>{if(!a)return;ACT.okafor_st=CHARS3D.okafor_st=a;a.g.position.set(STREET_OK.x,.12,STREET_OK.z);a.g.visible=AREA==="street";hideCard(W2.okMat)});
function updOkafor(dt,now){const a=ACT.okafor;if(a){a.g.visible=AREA==="school";if(a.g.visible){const mv=Math.hypot(TCH.x-a.last.x,TCH.z-a.last.z)/Math.max(dt,1e-3);a.last={x:TCH.x,z:TCH.z};
      a.g.position.set(TCH.x,TCH.fy||0,TCH.z);turn(a,TCH.yaw||0,dt);if(TCH.meet&&!(window.CINEMA&&CINEMA.active))charPose(a,now-TCH.meet<1800?"wave":"talk",300);step(a,mv>.3,dt,Math.max(1.2,mv))}}
  const b=ACT.okafor_st;if(b){b.g.visible=AREA==="street";if(b.g.visible){const d=Math.hypot(P.x-STREET_OK.x,P.z-STREET_OK.z);turn(b,d<7?Math.atan2(P.x-STREET_OK.x,P.z-STREET_OK.z):0,dt);
      if(W2.okHi&&now-W2.okHi<1800)charPose(b,"wave",300);b.g.position.set(STREET_OK.x,.12,STREET_OK.z);step(b,false,dt)}}}
/* the arcade worker waves when you walk up, Theo talks when he has something to say */
function updOthers(dt,now){const t=ACT.theo;if(t&&TH.chat&&now-TH.chat.t<2500&&!(window.CINEMA&&CINEMA.active))charPose(t,"talk",200)}
/* picked hero -> that hero's 3D model (replaces the old camera-facing sprite for heroes 1-11) */
function swapHero(o,i){const H=ACT.hero;if(!o||CHARS3D.want!==i)return;if(H===o)return;if(H){o.g.position.copy(H.g.position);o.yaw=H.yaw;o.g.rotation.y=H.yaw;H.g.visible=false;S.remove(H.g)}
  S.add(o.g);o.g.visible=true;ACT.hero=o;CHARS3D.idx=i;CHARS3D.log.push(i)}
function heroLoad(i){const f=FILES[i]||FILES[0];if(!CHARS3D.heroes[f])CHARS3D.heroes[f]=loadChar(CHAR3D(f),HERO_H).then(o=>{if(o)S.remove(o.g);return o});return CHARS3D.heroes[f]}
heroSpriteSet=function(i){i=Math.max(0,Math.min(11,i|0));HS.idx=i;if(HS.mesh){S.remove(HS.mesh);HS.mesh=null}CHARS3D.want=i;heroLoad(i).then(o=>swapHero(o,i))};
window.heroSpriteSet=heroSpriteSet;CHARS3D.idx=0;
const _ug=updateGame;updateGame=function(dt,now){_ug(dt,now);try{updOkafor(dt,now);updOthers(dt,now)}catch(e){if(!CHARS3D.err){CHARS3D.err=String(e);console.error(e)}}};
const _gcC=gameCam;gameCam=function(dt){const o=CHARS3D.camOv;if(!o)return _gcC(dt);cam.position.set(o.x,o.y,o.z);cam.lookAt(o.lx,o.ly,o.lz);return true};
Object.assign(CHARS3D,{heroLoad,FILES});
})();
