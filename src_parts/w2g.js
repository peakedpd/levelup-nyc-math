
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
