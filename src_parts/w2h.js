
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
