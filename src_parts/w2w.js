
/* =====================================================================
   19. UNIVERSE · CLOTHING STORE + THEO'S APARTMENT: the Canva wall pictures become real 3D furniture you can walk
   up to, look at from the side and use. (The Canva art now hangs only as framed posters, which really are flat.)
   ===================================================================== */
/* crop part of a Canva room picture into a framed poster: u0,v0,u1,v1 in 0..1 of the image */
function uposter(g,name,u0,v0,u1,v1,x,y,z,w,ry=0,frame=0x2a1a10){const t=TL.load("tex/room_"+name+".webp");t.colorSpace=T.SRGBColorSpace;t.repeat.set(u1-u0,v1-v0);t.offset.set(u0,1-v1);
  const h=w*((v1-v0)*9)/((u1-u0)*16),grp=new T.Group();grp.position.set(x,y,z);grp.rotation.y=ry;g.add(grp);const fr=new T.Mesh(rbox(w+.12,h+.12,.05,.015),UM(frame));grp.add(fr);
  const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:t,roughness:.7}));p.position.z=.03;grp.add(p);U.flatOK.add(p);return grp}
/* T-shirt and hoodie silhouettes (extruded, bevelled) + a wire hanger */
const SHIRT=(()=>{const s=new T.Shape();s.moveTo(-.12,.3);s.lineTo(-.25,.25);s.lineTo(-.34,.08);s.lineTo(-.24,.03);s.lineTo(-.18,.13);s.lineTo(-.18,-.32);s.lineTo(.18,-.32);s.lineTo(.18,.13);s.lineTo(.24,.03);s.lineTo(.34,.08);s.lineTo(.25,.25);s.lineTo(.12,.3);s.quadraticCurveTo(0,.2,-.12,.3);
  const g=new T.ExtrudeGeometry(s,{depth:.03,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1,curveSegments:4});g.translate(0,0,-.015);return g})();
const HANGER=(()=>{const k=Kit(),m=UM(0xc9ced4,{metalness:.8,roughness:.3}),g=new T.Group();k.add(new T.TorusGeometry(.04,.006,4,10,Math.PI*1.4),m,0,.38,0,0,0,-.2);k.add(bx(.5,.012,.012),m,0,.3,0);k.add(bx(.012,.1,.012),m,0,.33,0);k.build(g,{shadow:false});return g.children[0].geometry})();
/* ---------- CLOTHING STORE ---------- */
{const C=ROOMS.clothing,g=C.g,cz=C.cz;
 uremove(g,o=>o.material&&o.material.map&&/room_clothing/.test((o.material.map.image&&o.material.map.image.src)||"")||o.geometry&&o.geometry.type==="PlaneGeometry"&&Math.abs(o.position.z-(-RD/2+.27))<.01&&o.geometry.parameters.width===9.9);
 const kit=Kit(),oak=UM(0xb98552,{roughness:.6}),oakD=UM(0x7a5236,{roughness:.7}),white=UM(0xf4f1ea,{roughness:.6}),metal=UM(0x3a3a3a,{metalness:.7,roughness:.35}),
   tee=[0xe23b3b,0xffd23f,0x2a9d8f,0x3d5af1,0xff8fb1,0x1d1d1d,0xffffff,0x7cc33a].map(c=>UM(c,{roughness:.8}));
 /* back-left: cubby wall of folded shirt stacks (5 x 4 cubbies) */
 {const x0=-8.55,w=5.2,h=3.2,d=.55,zb=-RD/2+.2;kit.add(bx(w,h,.04),oakD,x0+w/2,h/2,zb+.02);for(let c=0;c<=5;c++)kit.add(bx(.05,h,d),oak,x0+c*w/5,h/2,zb+d/2);for(let r=0;r<=4;r++)kit.add(bx(w,.05,d),oak,x0+w/2,.1+r*(h-.1)/4,zb+d/2);
  let n=0;for(let c=0;c<5;c++)for(let r=0;r<4;r++){const cx=x0+w/10+c*w/5,y=.13+r*(h-.1)/4;const st=2+((c+r)%3);for(let k=0;k<st;k++){kit.add(rbox(.72,.07,.38,.025),tee[(c*4+r+k)%8],cx,y+.04+k*.075,zb+.3);n++}}
  usolid(x0,x0+w,cz+zb,cz+zb+d+.05,h);C.cubbyN=n;
  utap("clothing",x0+w/2,zb+1.3,"Press E to look through the folded shirts 👕",()=>uoffer("👕","Soft cotton tees, folded neat in stacks.","shirts","cubby"),1.6)}
 /* back-right: shoe wall with sneakers + Timberland boots on display */
 const shoes=[];{const x0=3.35,w=5.2,h=3.2,zb=-RD/2+.2;kit.add(bx(w,h,.04),white,x0+w/2,h/2,zb+.02);[-0.03,w+.03].forEach(a=>kit.add(bx(.06,h,.42),oakD,x0+a,h/2,zb+.21));
  for(let r=0;r<5;r++){const y=.35+r*.62;kit.add(rbox(w,.05,.36,.015),oak,x0+w/2,y,zb+.2);
   for(let k=0;k<6;k++){const sx=x0+.45+k*.86,boot=r===2&&k>=3,col=boot?UM(0xc8913a,{roughness:.85}):tee[(r*6+k)%8],sole=boot?UM(0x5a3a1a):white;
     if(boot){kit.add(rbox(.2,.24,.36,.05),col,sx,y+.15,zb+.2);kit.add(rbox(.22,.07,.38,.02),sole,sx,y+.06,zb+.2);kit.add(cy(.06,.06,.25,8),col,sx,y+.3,zb+.13)}
     else{kit.add(rbox(.2,.1,.36,.045),col,sx,y+.1,zb+.2);kit.add(rbox(.21,.045,.38,.02),sole,sx,y+.045,zb+.2);kit.add(rbox(.17,.08,.14,.035),col,sx,y+.16,zb+.12)}
     shoes.push({x:sx,y,boot})}}
  sign(g,"TIMBERLAND BOOTS · 150 XP",x0+w*.75,1.95,zb+.42,1.9,.22,"#5a3a1a","#ffd23f");usolid(x0,x0+w,cz+zb,cz+zb+.45,h);
  utap("clothing",x0+w/2,zb+1.2,"Press E to check out the shoe wall 👟",()=>uoffer("👟","Fresh kicks! The Timberland boots are an XP upgrade in the shop (150 XP).","shop","shoes"),1.6)}
 /* neon MR. SAL'S over the counter (a real lit tube sign, not a picture) */
 {const t=canvasTex(1024,256,(c,W,H)=>{c.clearRect(0,0,W,H);c.font="900 170px 'Brush Script MT',cursive";c.textAlign="center";c.textBaseline="middle";c.shadowColor="#ff2bc0";c.shadowBlur=40;c.fillStyle="#ffe6fb";c.fillText("Mr. Sal's",W/2,H/2+8)});
  const p=new T.Mesh(new T.PlaneGeometry(4,1),new T.MeshBasicMaterial({map:t,transparent:true,toneMapped:false}));p.position.set(0,4.35,-RD/2+.32);g.add(p);U.flatOK.add(p);kit.add(rbox(4.3,1.15,.08,.03),UM(0x1b1b2a),0,4.35,-RD/2+.24);
  const nl=new T.PointLight(0xff5ad8,6,6);nl.position.set(0,4.2,-RD/2+1.2);g.add(nl)}
 /* counter: oak top, panelled front, register, bag stack (replaces the plain box) */
 uremove(g,o=>o.geometry&&o.geometry.type==="BoxGeometry"&&o.geometry.parameters.width===4&&o.geometry.parameters.height===1.1&&Math.abs(o.position.z+5.3)<.01);
 kit.add(rbox(4.2,.08,1.3,.03),oak,0,1.12,-5.3);kit.add(bx(4,1.04,1.1),UM(0x1f7a72,{roughness:.6}),0,.54,-5.3);for(let k=0;k<4;k++)kit.add(rbox(.85,.7,.04,.02),UM(0x26948a,{roughness:.55}),-1.5+k,.55,-4.73);
 kit.add(bx(4.04,.08,1.14),oakD,0,.04,-5.3);
 const reg=new T.Group();reg.position.set(-1.2,1.16,-5.3);g.add(reg);{const rk=Kit();rk.add(rbox(.5,.18,.42,.03),UM(0x2b2f36,{metalness:.3}),0,.09,0);rk.add(rbox(.42,.26,.06,.02),UM(0x2b2f36),0,.33,-.12,-.3);rk.add(bx(.36,.18,.01),UM(0x6fd0ff,{emissive:0x2bb0ff,emissiveIntensity:.8}),0,.34,-.085,-.3);
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)rk.add(bx(.06,.025,.05),UM(0xeeeeee),-.08+i*.08,.19,.02+j*.07);rk.build(reg)}
 const drawer=new T.Mesh(rbox(.46,.08,.36,.015),UM(0x3a3f48,{metalness:.4}));drawer.position.set(0,.04,.02);reg.add(drawer);
 for(let k=0;k<4;k++)kit.add(bx(.36,.02,.48),UM(0xe9d8b4),1.3,1.17+k*.02,-5.3);
 /* hoodies on a wall rail (left wall) */
 {kit.add(cy(.025,.025,5,8),metal,-8.6,2.1,0,Math.PI/2);[-2.4,2.4].forEach(z=>kit.add(bx(.3,.05,.05),metal,-8.72,2.1,z));for(let k=0;k<10;k++){const z=-2.2+k*.48;kit.add(HANGER,metal,-8.55,1.75,z,0,Math.PI/2,0);kit.add(SHIRT,tee[(k+3)%8],-8.55,1.72,z,0,Math.PI/2,0,1.2,1.5,1.4)}}
 /* hat pegboard (right wall) */
 const hats=[];{kit.add(bx(.05,1.6,3),UM(0xd8c3a0),8.78,2,3.5);for(let r=0;r<2;r++)for(let k=0;k<5;k++){const z=2.3+k*.6,y=1.6+r*.75,c=tee[(r*5+k+1)%8];kit.add(cy(.012,.012,.18,6),metal,8.68,y,z,0,0,Math.PI/2);
  kit.add(new T.SphereGeometry(.15,12,6,0,Math.PI*2,0,Math.PI/2),c,8.6,y-.02,z,0,0,Math.PI/2);kit.add(cy(.15,.15,.02,12,false),c,8.48,y-.1,z,Math.PI/2.4,0,Math.PI/2);hats.push({y,z,c})}}
 utap("clothing",8,3.5,"Press E to try on a hat 🧢",()=>{const h=hats[Math.floor(Math.random()*hats.length)];bub("🧢","Looking fresh! (Hats are 12 coins in the shop.)")},1.4);
 /* fitting room booth with a sliding curtain (front-left corner) */
 const cur=new T.Group();{const x=-7.7,z=5.2;kit.add(bx(1.8,2.6,.06),white,x,1.3,z-.9);kit.add(bx(1.8,2.6,.06),white,x,1.3,z+.9);kit.add(bx(.06,2.6,1.8),white,x-.88,1.3,z);kit.add(bx(1.9,.1,1.9),oakD,x,2.65,z);
  kit.add(rbox(.04,1.3,.6,.02),UM(0xcfe6ff,{metalness:.9,roughness:.05}),x-.84,1.4,z);kit.add(bx(.04,.04,1.8),metal,x+.88,2.45,z);sign(g,"FITTING ROOM",x+.92,2.75,z,1.5,.25,"#1f7a72","#fff",Math.PI/2);
  cur.position.set(x+.88,0,z);g.add(cur);const cm=UM(0x8a1f2d,{roughness:.9,side:T.DoubleSide});for(let k=0;k<8;k++){const m=new T.Mesh(cy(.06,.06,2.2,8,true),cm);m.position.set(0,1.32,-.8+k*.23);m.scale.set(.6,1,1);cur.add(m)}
  usolid(cz*0+x-.9,x+.9,cz+z-.95,cz+z-.85,2.6);usolid(x-.9,x+.9,cz+z+.85,cz+z+.95,2.6);usolid(x-.95,x-.85,cz+z-.9,cz+z+.9,2.6)}
 let curO=0,curC=0;utap("clothing",-6.4,5.2,"Press E to open the fitting room curtain 🪞",()=>{curO=!curO;ubeep(curO?600:400,.08,"triangle",.03);bub("🪞",curO?"Step in and try something on!":"Curtain closed.");},1.4);
 /* mannequins in outfits (replace the plain boxes) */
 uremove(g,o=>o.geometry&&o.geometry.type==="BoxGeometry"&&((o.geometry.parameters.width===.9&&o.geometry.parameters.height===.15)||(o.geometry.parameters.width===.6&&o.geometry.parameters.height===1.4))&&Math.abs(Math.abs(o.position.x)-6)<.01);
 [-6,6].forEach((x,i)=>{const j=tee[i?3:0],pants=UM(i?0x2a3a5a:0x3a2a1a);kit.add(cy(.3,.34,.06,20),oakD,x,.03,3);kit.add(cy(.02,.02,.7,6),metal,x,.4,3);
   kit.add(new T.CapsuleGeometry(.11,.6,2,8),pants,x-.1,.78,3);kit.add(new T.CapsuleGeometry(.11,.6,2,8),pants,x+.1,.78,3);kit.add(new T.CapsuleGeometry(.2,.4,2,10),j,x,1.42,3,0,0,0,1.2,1,.75);
   kit.add(new T.CapsuleGeometry(.065,.5,2,6),j,x-.32,1.36,3,0,0,.15);kit.add(new T.CapsuleGeometry(.065,.5,2,6),j,x+.32,1.36,3,0,0,-.15);kit.add(cy(.05,.05,.12,8),white,x,1.83,3);kit.add(sp(.13,10),white,x,2.0,3,0,0,0,.85,1.1,.9);
   kit.add(new T.SphereGeometry(.15,12,6,0,Math.PI*2,0,Math.PI/2),tee[i?1:4],x,2.06,3);usolid(x-.35,x+.35,cz+2.65,cz+3.35,2.1)});
 utap("clothing",-6,2,"Press E to check the mannequin's outfit 👖",()=>bub("👖","Red hoodie + brown cargo pants. A whole outfit!"),1.2);
 utap("clothing",6,2,"Press E to check the mannequin's outfit 👖",()=>bub("👖","Blue tee + navy jeans + a yellow cap. Classic!"),1.2);
 kit.build(g,{name:"u_clothing"});
 /* the rack shirts become real T-shirt shapes on hangers (same meshes, so try-on/put-back still works) */
 g.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==="BoxGeometry"&&o.geometry.parameters.width===.4&&o.geometry.parameters.height===1&&o.geometry.parameters.depth===.12){o.geometry=SHIRT;o.scale.set(1.05,1.5,1);o.rotation.y=0;const hg=new T.Mesh(HANGER,metal);hg.position.y=-.02;hg.scale.set(1/1.05,1/1.5,1);o.add(hg)}});
 uposter(g,"clothing",.33,.18,.67,.44,0,2.0,-RD/2+.25,1.6,0);/* Canva "Mr. Sal's" doorway art as a framed poster behind the counter */
 U.anims.push((dt,now)=>{if(AREA!=="clothing")return;curC+=((curO?1:0)-curC)*Math.min(1,dt*6);cur.children.forEach((m,k)=>{m.position.z=-.8+k*.23*(1-curC*.8)})});
 utap("clothing",-1.2,-4.3,"Press E to ring up the register 💵",()=>{ubeep(1300,.08,"square",.04);setTimeout(()=>ubeep(1700,.12,"square",.04),110);drawer.position.z=.25;setTimeout(()=>drawer.position.z=.02,1500);uoffer("💵","Ka-ching! The drawer slides open.","shop","register")},.9)}
/* ---------- THEO'S APARTMENT ---------- */
{const A=ROOMS.apartment,g=A.g,cz=A.cz;
 uremove(g,o=>o.geometry&&o.geometry.type==="PlaneGeometry"&&Math.abs(o.position.z-(-RD/2+.27))<.01&&o.geometry.parameters.width===9.9);
 const kit=Kit(),oak=UM(0xa8743f,{roughness:.6}),oakD=UM(0x6b4123,{roughness:.7}),white=UM(0xf4f1ea,{roughness:.6}),metal=UM(0x9aa0a8,{metalness:.8,roughness:.3}),fab=UM(0x3d6fb0,{roughness:.95}),fab2=UM(0x335d96,{roughness:.95}),
   bk=[0xc0392b,0x2a6bd8,0xffb52e,0x2a9d8f,0x8a5cff,0x6b4a2f,0xe8e0d0,0x1d1d1d].map(c=>UM(c,{roughness:.8})),zb=-RD/2+.2;
 /* couch, coffee table, bed (replace the plain boxes) */
 uremove(g,o=>o.geometry&&o.geometry.type==="BoxGeometry"&&o.material&&o.material.color&&[0x3d6fb0,0x7a4a2a,0xe8e0d0].includes(o.material.color.getHex())&&o.position.z<0&&o.position.z>-7&&o.geometry.parameters.width>=2.4);
 kit.add(rbox(4.2,.42,1.5,.08),fab2,-3,.3,-3.1);[-1,0,1].forEach(k=>{kit.add(rbox(1.32,.22,1.2,.08),fab,-3+k*1.36,.62,-2.95);kit.add(rbox(1.3,.75,.3,.1),fab,-3+k*1.36,.95,-3.7,-.12)});
 [-1,1].forEach(s=>kit.add(rbox(.32,.75,1.5,.1),fab2,-3+s*2.2,.55,-3.1));[[-4.9,-3.75],[-1.1,-3.75],[-4.9,-2.45],[-1.1,-2.45]].forEach(([x,z])=>kit.add(cy(.04,.03,.12,6),oakD,x,.06,z));
 kit.add(rbox(.42,.4,.12,.05),UM(0xffb52e,{roughness:.95}),-4.4,.92,-3.45,-.2,.3);kit.add(rbox(.42,.4,.12,.05),UM(0xe23b3b,{roughness:.95}),-1.6,.92,-3.45,-.2,-.3);
 kit.add(rbox(2.4,.07,1.2,.03),oak,-3,.44,-.8);[[-1.1,-.3],[1.1,-.3],[-1.1,.3],[1.1,.3]].forEach(([a,b])=>kit.add(bx(.06,.4,.06),oakD,-3+a,.2,-.8+b));kit.add(bx(2.2,.03,1),oakD,-3,.12,-.8);
 kit.add(rbox(.16,.03,.06,.01),UM(0x222222),-3.4,.49,-.7,0,.4);kit.add(rbox(.3,.04,.22,.01),bk[1],-2.5,.5,-.9,0,-.2);kit.add(cy(.05,.045,.1,10),white,-2.2,.53,-.6);
 kit.add(rbox(2.6,.35,4,.05),oakD,5.5,.2,-4.5);kit.add(rbox(2.5,.3,3.9,.12),white,5.5,.5,-4.5);kit.add(rbox(2.56,.12,2.6,.06),UM(0x2a9d8f,{roughness:.95}),5.5,.67,-3.75);
 [-.6,.6].forEach(a=>kit.add(rbox(.9,.18,.45,.09),UM(0xffffff,{roughness:.9}),5.5+a,.72,-6.05));kit.add(rbox(2.7,1.3,.12,.05),oakD,5.5,.75,-6.6);
 /* bookshelf (back-left) with real books */
 {const x0=-8.7,w=1.9,h=3,d=.4;kit.add(bx(w,h,.03),oakD,x0+w/2,h/2,zb+.015);[0,w].forEach(a=>kit.add(bx(.05,h,d),oak,x0+a,h/2,zb+d/2));for(let r=0;r<=5;r++)kit.add(bx(w,.04,d),oak,x0+w/2,.05+r*(h-.1)/5,zb+d/2);
  let n=0;for(let r=0;r<5;r++){let x=x0+.08;const y=.07+r*(h-.1)/5;while(x<x0+w-.15){const bw=.05+((n*7)%5)*.012,bh=.3+((n*3)%4)*.04;kit.add(bx(bw,bh,.26),bk[n%8],x+bw/2,y+bh/2,zb+.2,0,0,(n%9===0)?.12:0);x+=bw+.006;n++}}
  A.books=n;usolid(x0,x0+w,cz+zb,cz+zb+d,h);utap("apartment",x0+w/2,zb+1.1,"Press E to pull a book off the shelf 📚",()=>uoffer("📚","Theo's books: comics, a dinosaur guide, and Math Mysteries!","books","shelf"),1.3)}
 /* window with a sill, mullions, a city view set back behind the glass, plants */
 {const W=3,H=2.2,y=2.5;const sk=TL.load("tex/skyline.webp");sk.colorSpace=T.SRGBColorSpace;const view=new T.Mesh(new T.PlaneGeometry(W,H),new T.MeshBasicMaterial({map:sk,toneMapped:false}));view.position.set(-1.6,y,zb+.01);g.add(view);U.flatOK.add(view);
  [-1,1].forEach(s=>kit.add(bx(.14,H+.2,.32),white,-1.6+s*(W/2+.07),y,zb+.16));kit.add(bx(W+.28,.14,.32),white,-1.6,y+H/2+.07,zb+.16);kit.add(rbox(W+.5,.08,.42,.02),white,-1.6,y-H/2-.04,zb+.21);
  kit.add(bx(.05,H,.05),white,-1.6,y,zb+.1);kit.add(bx(W,.05,.05),white,-1.6,y+.2,zb+.1);const gl=new T.Mesh(bx(W,H,.01),GLASS);gl.position.set(-1.6,y,zb+.12);g.add(gl);
  [-2.6,-.6].forEach(x=>{kit.add(cy(.12,.09,.18,12),UM(0xb85c38),x,y-H/2+.09,zb+.25);for(let k=0;k<5;k++)kit.add(ico(.08,0),UM(0x3f8f3a,{flatShading:true}),x+Math.cos(k)*.07,y-H/2+.25+k*.03,zb+.25+Math.sin(k)*.07)});
  uposter(g,"apartment",.29,.25,.4,.52,-4.8,2.7,zb+.03,.75,0);uposter(g,"apartment",.69,.15,.79,.43,1.3,2.9,zb+.03,.7,0)}
 /* TV on a media console; press E for a math game show */
 const tvS=new T.Mesh(bx(1.5,.85,.02),UM(0x0a0a12,{emissive:0x000000,roughness:.2}));{kit.add(rbox(2.2,.55,.5,.04),oakD,2.3,.28,zb+.3);[-.55,0,.55].forEach(a=>kit.add(rbox(.66,.4,.03,.01),oak,2.3+a,.28,zb+.56));kit.add(rbox(1.6,.95,.06,.03),UM(0x111111),2.3,1.15,zb+.2);
  kit.add(bx(.3,.03,.18),UM(0x222222),2.3,.57,zb+.3);kit.add(bx(.05,.08,.05),UM(0x222222),2.3,.62,zb+.25);tvS.position.set(2.3,1.15,zb+.235);g.add(tvS);usolid(1.2,3.4,cz+zb,cz+zb+.6,1.6)}
 const tvT=canvasTex(512,288,(c,W,H)=>{c.fillStyle="#2b1a6a";c.fillRect(0,0,W,H);c.fillStyle="#ffd23f";c.font="900 54px system-ui";c.textAlign="center";c.fillText("MATH MASTERS",W/2,110);c.font="700 34px system-ui";c.fillStyle="#fff";c.fillText("tonight at 7:00",W/2,170);c.fillText("🍕 pizza fractions round",W/2,220)});let tvOn=false;
 utap("apartment",2.3,zb+1.3,"Press E to turn on the TV 📺",function(){tvOn=!tvOn;tvS.material=tvOn?new T.MeshBasicMaterial({map:tvT,toneMapped:false}):UM(0x0a0a12,{roughness:.2});ubeep(tvOn?500:250,.1,"sine",.04);if(tvOn)uoffer("📺","\"Welcome to MATH MASTERS! Tonight: pizza fractions!\"","pizza","tv");else bub("📺","TV off.")},1.3);
 /* kitchen run along the right wall: base cabinets with doors, sink + faucet, stove + pot, microwave */
 {const x=8.45,z0=-1.9,len=3.4;kit.add(bx(.85,.9,len),white,x,.45,z0+len/2);kit.add(rbox(.95,.06,len+.05,.02),UM(0x3a3f48,{roughness:.35}),x-.04,.93,z0+len/2);
  kit.add(bx(.6,.12,.7),UM(0xb8bcc2,{metalness:.8,roughness:.25}),x-.05,.92,z0+.6);kit.add(cy(.02,.02,.32,8),metal,x+.25,1.1,z0+.6);kit.add(cy(.018,.018,.25,8),metal,x+.12,1.26,z0+.6,0,0,Math.PI/2);
  [[-.15,.15],[.15,.15],[-.15,-.15],[.15,-.15]].forEach(([a,b])=>kit.add(tor(.09,.012,4,14),UM(0x222222),x-.05+a,.965,z0+2.5+b,Math.PI/2));kit.add(bx(.05,.22,.6),UM(0x222222),x-.44,.75,z0+2.5);
  kit.add(cy(.13,.12,.16,14),UM(0xc0392b,{metalness:.4}),x-.05,1.05,z0+2.4);kit.add(rbox(.5,.32,.6,.03),UM(0xdedede,{metalness:.4}),x-.05,1.12,z0+1.55);kit.add(bx(.12,.2,.01),UM(0x111111),x-.31,1.12,z0+1.35);
  for(let k=0;k<4;k++)kit.add(bx(.02,.7,.8),UM(0xe8e2d6),x-.44,.45,z0+.43+k*.85);usolid(x-.45,x+.45,cz+z0,cz+z0+len,1)}
 const mwd=new T.Group();mwd.position.set(8.4-.31,1.12,-1.9+1.25);g.add(mwd);{const d=new T.Mesh(bx(.02,.28,.4),UM(0x222a30,{roughness:.2,metalness:.3}));d.position.z=.2;mwd.add(d)}
 const water=new T.Mesh(cy(.012,.012,.17,6),new T.MeshStandardMaterial({color:0x9fd4ff,transparent:true,opacity:.7}));water.position.set(8.4+.12-.13,1.06,-1.9+.6);water.visible=false;g.add(water);
 let tapOn=0,mwO=0,mwC=0,boil=0;
 utap("apartment",7.4,-1.3,"Press E to turn on the kitchen faucet 🚰",()=>{tapOn=tapOn?0:6;water.visible=!!tapOn;bub("🚰",tapOn?"Water's running! Don't forget to turn it off.":"Faucet off. Saving water!")},1);
 utap("apartment",7.4,-.35,"Press E to open the microwave ⏲️",()=>{mwO=!mwO;ubeep(mwO?800:600,.06,"square",.03);if(mwO)uoffer("⏲️","Popcorn time: the microwave says 2:30. That's 150 seconds!","clock","microwave")},1);
 utap("apartment",7.4,.6,"Press E to cook on the stove 🍲",()=>{boil=5;bub("🍲","Mmm, Theo's grandma's soup is bubbling!")},1);
 U.anims.push((dt,now)=>{if(AREA!=="apartment")return;if(tapOn>0){tapOn-=dt;water.scale.x=1+Math.sin(now/40)*.15;if(tapOn<=0)water.visible=false}mwC+=((mwO?1:0)-mwC)*Math.min(1,dt*7);mwd.rotation.y=-mwC*1.7;
   if(boil>0){boil-=dt;if(Math.random()<.3)upuff(g,8.4,1.16,-1.9+2.4,1,0xffffff,.1,.6,.6,.025,-.3)}});
 /* string lights along the top of the back wall */
 for(let i=0;i<22;i++){const b=new T.Mesh(sp(.045,6),UM([0xffd23f,0xff6b8a,0x6fd0ff,0x6dff6b][i%4],{emissive:[0xffd23f,0xff6b8a,0x6fd0ff,0x6dff6b][i%4],emissiveIntensity:1.5}));b.position.set(-8+i*.76,5.1-Math.sin((i%11)/10*Math.PI)*.3,zb+.12);g.add(b)}
 kit.build(g,{name:"u_apartment"})}
