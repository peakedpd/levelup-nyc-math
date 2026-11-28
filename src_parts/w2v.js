
/* =====================================================================
   18. UNIVERSE · STREET: detailed NYC street furniture, every piece interactive (press E / tap)
   trash cans (lid lifts, see what's inside) · hydrants (spray) · lamps (switch) · trees (shake) · benches ·
   USPS mailbox · newsstand (math headlines) · subway entrance · fruit stand · taxis (wave one down) ·
   3D display windows on every clothing store · school planters + notice case
   ===================================================================== */
const ST3={cans:[],lamps:[],trees:[],hyd:[]};U.street=ST3;
const iron=UM(0x1d2a24,{metalness:.6,roughness:.45}),canG=UM(0x2f6b3a,{metalness:.35,roughness:.55}),canD=UM(0x1f4a28,{metalness:.4,roughness:.5}),bagM=UM(0x161616,{roughness:.9}),
  silver=UM(0xc9ced4,{metalness:.8,roughness:.3}),wood=UM(0x9a6234,{roughness:.75}),woodD=UM(0x6b4123,{roughness:.8}),stoneM=UM(0xd9cdb8,{roughness:.9}),concrete=UM(0x9a968e,{roughness:.95});
/* ---------- TRASH CANS (same spots the litter clean-up uses) ---------- */
{const n0=CANS.length;CANS.forEach(([x,z])=>uremove(S,o=>Math.abs(o.position.x-x)<.6&&Math.abs(o.position.z-z)<.6&&o.position.y>.3&&o.position.y<1.5));
 const kit=Kit(),R0=.38;
 CANS.forEach(([x,z],i)=>{kit.base(mat4(x,.12,z));kit.add(cy(.34,.31,.08,20),canD,0,.04,0);kit.add(cy(.355,.32,.9,20,true),bagM,0,.5,0);
   for(let k=0;k<18;k++){const a=k/18*Math.PI*2;kit.add(bx(.055,.92,.022),canG,Math.cos(a)*R0,.51,Math.sin(a)*R0,0,-a+Math.PI/2,0)}
   [.12,.5,.88].forEach(y=>kit.add(tor(R0,.024,6,28),canD,0,y,0,Math.PI/2));kit.add(tor(R0+.01,.035,8,28),canD,0,.97,0,Math.PI/2);
   usolid(x-.42,x+.42,z-.42,z+.42,1.1)});
 kit.build(S,{name:"u_cans"});
 const items=[["banana peel",(g)=>{const y=UM(0xffd23f,{roughness:.6});for(let k=0;k<4;k++){const m=new T.Mesh(bx(.05,.012,.2),y);m.rotation.set(-.4,k*Math.PI/2,0);m.position.set(Math.sin(k*Math.PI/2)*.07,.02,Math.cos(k*Math.PI/2)*.07);g.add(m)}const c=new T.Mesh(sp(.035,8),UM(0x6b4a1f));c.position.y=.04;g.add(c)}],
   ["crumpled worksheet",(g)=>{const m=new T.Mesh(ico(.09,0),UM(0xf4f1e8,{flatShading:true}));m.scale.set(1.2,.8,1);m.position.y=.06;g.add(m);const m2=new T.Mesh(ico(.06,0),UM(0xe6e9ff,{flatShading:true}));m2.position.set(.12,.04,.05);g.add(m2)}],
   ["soda can and a pizza crust",(g)=>{const c=new T.Mesh(cy(.035,.035,.12,12),UM(0xc0392b,{metalness:.6}));c.rotation.z=Math.PI/2;c.position.set(-.06,.04,0);g.add(c);const cr=new T.Mesh(tor(.09,.025,6,12,Math.PI),UM(0xc98a3c));cr.rotation.x=-Math.PI/2;cr.position.set(.08,.03,.04);g.add(cr)}],
   ["apple core",(g)=>{const a=new T.Mesh(cy(.03,.03,.08,10),UM(0xf5e6c8));a.position.y=.05;g.add(a);[-1,1].forEach(s=>{const e=new T.Mesh(sp(.045,10),UM(0xd92b2b));e.scale.y=.5;e.position.y=.05+s*.05;g.add(e)})}]];
 CANS.forEach(([x,z],i)=>{const grp=new T.Group();grp.position.set(x,.12,z);S.add(grp);
   const cont=new T.Group();cont.position.y=.9;grp.add(cont);const kind=i%items.length;items[kind][1](cont);
   const coin=(i===1||i===3)?new T.Mesh(cy(.06,.06,.015,18),UM(0xffc83d,{metalness:.9,roughness:.25,emissive:0x664400,emissiveIntensity:.4})):null;if(coin){coin.position.set(.1,.07,-.08);coin.rotation.x=.3;cont.add(coin)}
   /* lid on a back hinge: dome + rim + handle */
   const hinge=new T.Group();hinge.position.set(0,.99,(R0+.02)*Math.sign(z));grp.add(hinge);const lid=new T.Group();lid.position.set(0,0,-(R0+.02)*Math.sign(z));hinge.add(lid);
   const dome=new T.Mesh(new T.SphereGeometry(.42,22,8,0,Math.PI*2,0,Math.PI/2.4),canD);dome.scale.y=.35;dome.castShadow=true;lid.add(dome);
   const rim=new T.Mesh(tor(.41,.03,6,28),canG);rim.rotation.x=Math.PI/2;lid.add(rim);const hd=new T.Mesh(tor(.08,.018,6,14,Math.PI),silver);hd.position.y=.13;lid.add(hd);
   const C={i,x,z,grp,hinge,cont,coin,item:items[kind][0],open:0,cur:0};ST3.cans.push(C);
   C.tap=utap("street",x,z,"Press E to lift the trash can lid 🗑️",()=>{C.open=!C.open;ubeep(C.open?520:330,.12,"square",.03,C.open?200:-120);C.tap.label=C.open?"Press E to put the lid back on":"Press E to lift the trash can lid 🗑️";
     if(!C.open)return;const what=C.coin&&C.coin.parent?"a "+C.item+"… and a shiny coin!":"a "+C.item+".";
     setTimeout(()=>{if(C.coin&&C.coin.parent&&onceXP("canCoin"+i,10,"🪙 A coin was hiding in the trash can! +10 XP")){C.cont.remove(C.coin);return}
       if(C.item==="crumpled worksheet")uoffer("📄","Inside: a crumpled math worksheet! Can you solve it?","mult","can"+i);else uoffer("🗑️","Inside: "+what+(C.item==="banana peel"?" Ew!":" Yuck."),i%2?"meters":null,"can"+i)},420)},1.25)});
 if(ONCE.has("canCoin1"))ST3.cans[1].cont.remove(ST3.cans[1].coin);if(ONCE.has("canCoin3"))ST3.cans[3].cont.remove(ST3.cans[3].coin);
 U.anims.push((dt)=>{for(const C of ST3.cans){const w=C.open?1:0;C.cur+=(w-C.cur)*Math.min(1,dt*7);C.hinge.rotation.x=C.cur*1.95*Math.sign(C.z);C.hinge.position.y=.99+C.cur*.08}})}
/* ---------- FIRE HYDRANTS ---------- */
{const red=UM(0xc8202a,{metalness:.3,roughness:.45}),kit=Kit();const HY=[[-33.5,4.95],[8.5,4.95],[-24.6,-4.95],[45,-4.95]];
 HY.forEach(([x,z])=>{const f=z>0?Math.PI:0;kit.base(mat4(x,.12,z,f));kit.add(cy(.2,.23,.08,16),red,0,.04,0);kit.add(cy(.13,.15,.58,16),red,0,.37,0);kit.add(cy(.17,.17,.06,16),red,0,.68,0);
   kit.add(new T.SphereGeometry(.14,16,8,0,Math.PI*2,0,Math.PI/2),silver,0,.71,0);kit.add(cy(.04,.05,.08,5),silver,0,.88,0);
   [-1,1].forEach(s=>{kit.add(cy(.055,.06,.14,12),red,s*.18,.48,0,0,0,Math.PI/2);kit.add(cy(.07,.07,.04,6),silver,s*.26,.48,0,0,0,Math.PI/2)});
   kit.add(cy(.075,.08,.13,12),red,0,.46,.17,Math.PI/2);kit.add(cy(.09,.09,.04,6),silver,0,.46,.25,Math.PI/2);for(let k=0;k<4;k++)kit.add(tor(.022,.006,4,8),silver,.08+k*.03,.4-k*.012,.2,0,k%2*Math.PI/2);
   usolid(x-.26,x+.26,z-.26,z+.26,.95)});
 kit.build(S,{name:"u_hydrants"});
 HY.forEach(([x,z],i)=>{const H={x,z,on:0,pud:null};ST3.hyd.push(H);const dirz=z>0?-1:1;
   const pud=new T.Mesh(new T.CircleGeometry(1,28),new T.MeshStandardMaterial({color:0x6fb6ff,transparent:true,opacity:0,roughness:.05,metalness:.3,depthWrite:false}));pud.rotation.x=-Math.PI/2;pud.position.set(x,.125,z+dirz*1.5);pud.scale.setScalar(.01);S.add(pud);H.pud=pud;
   H.tap=utap("street",x,z+dirz*.5,"Press E to open the fire hydrant 💦",()=>{if(H.on>0)return;H.on=4;ubeep(160,.5,"sawtooth",.03,-60);uoffer("💦","Summer splash! The hydrant is spraying.","hydrant","hyd"+i)},1.3)});
 U.anims.push((dt)=>{for(const H of ST3.hyd){const dz=H.z>0?-1:1;if(H.on>0){H.on-=dt;if(AREA==="street")for(let k=0;k<3;k++){const p=new T.Mesh(sp(.04,5),UM(0x9fd4ff,{emissive:0x4aa0ff,emissiveIntensity:.3}));p.position.set(H.x,.58,H.z+dz*.3);S.add(p);UPART.push({p,parent:S,vx:(Math.random()-.5)*.8,vy:2.4+Math.random(),vz:dz*(3+Math.random()*1.2),t:.9,grav:9})}
   H.pud.material.opacity=Math.min(.55,H.pud.material.opacity+dt*.3);H.pud.scale.setScalar(Math.min(1.3,H.pud.scale.x+dt*.4))}else if(H.pud.material.opacity>0){H.pud.material.opacity=Math.max(0,H.pud.material.opacity-dt*.05);if(H.pud.material.opacity===0)H.pud.scale.setScalar(.01)}}})}
/* ---------- STREET LAMPS: cast-iron base, fluted pole, crook arm, lantern; each has a switch ---------- */
{uremove(S,o=>o.geometry&&o.geometry.type==="CylinderGeometry"&&o.geometry.parameters.radiusTop===.09&&Math.abs(Math.abs(o.position.z)-4.6)<.01);
 uremove(S,o=>o.geometry&&o.geometry.type==="SphereGeometry"&&o.geometry.parameters.radius===.28&&Math.abs(o.position.y-4.7)<.01);
 const lampG=UM(0x2f4f3a,{metalness:.55,roughness:.4}),kit=Kit(),on=UM(0xfff2c0,{emissive:0xffd77a,emissiveIntensity:1.6}),off=UM(0x8a8574,{roughness:.3,metalness:.2});ST3.lampOn=on;ST3.lampOff=off;
 const arm=new T.TorusGeometry(.42,.04,8,18,Math.PI);
 for(let x=-54;x<=54;x+=12)[-4.6,4.6].forEach(z=>{const f=z>0?Math.PI:0;kit.base(mat4(x,.12,z,f));
   kit.add(cy(.2,.26,.5,8),lampG,0,.25,0);kit.add(cy(.16,.2,.12,8),lampG,0,.56,0);kit.add(cy(.075,.1,4.1,10),lampG,0,2.6,0);[1.2,2.6,4.2].forEach(y=>kit.add(cy(.11,.11,.06,10),lampG,0,y,0));
   kit.add(arm,lampG,0,4.65,.42,0,Math.PI/2,0);
   kit.add(cy(.05,.22,.2,10),lampG,0,4.58,.84);kit.add(cy(.23,.23,.04,10),lampG,0,4.47,.84);kit.add(sp(.03,6),lampG,0,4.72,.84);
   const b=new T.Mesh(sp(.17,14),on);b.position.set(x,.12+4.36,z+(z>0?-.84:.84));b.scale.y=1.2;S.add(b);const Lp={x,z,b,on:true};ST3.lamps.push(Lp);
   Lp.tap=utap("street",x,z,"Press E to flip the street lamp switch 💡",()=>{Lp.on=!Lp.on;Lp.b.material=Lp.on?on:off;ubeep(Lp.on?700:300,.06,"square",.03);const n=ST3.lamps.filter(l=>l.on).length;uoffer("💡",Lp.on?"Lamp ON. "+n+" of "+ST3.lamps.length+" lamps are lit.":"Lamp OFF. "+n+" of "+ST3.lamps.length+" lamps are lit.","lamps","lamp")},1.05)});
 kit.build(S,{name:"u_lamps"});
 /* street-name blades on the lamp at x=-6 */
 {const g=new T.Group();g.position.set(-6,3.4,-4.6);S.add(g);[["LEVEL UP AVE",0],["MULTIPLICATION ST",Math.PI/2]].forEach(([t,r],k)=>{const s=new T.Group();s.rotation.y=r;s.position.y=k*.28;g.add(s);sign(s,t,.75,0,0,1.5,.24,"#0b6b3a","#ffffff");sign(s,t,.75,0,-.012,1.5,.24,"#0b6b3a","#ffffff",Math.PI)})}}
/* ---------- TREES: tree pit + iron guard, tapered trunk with branches, clustered low-poly canopy; shake them ---------- */
{uremove(S,o=>o.geometry&&((o.geometry.type==="CylinderGeometry"&&o.geometry.parameters.height===2.4&&o.geometry.parameters.radiusTop===.15)||(o.geometry.type==="SphereGeometry"&&o.geometry.parameters.radius===1.3)));
 const bark=UM(0x6b4a2f,{roughness:.95}),leaf1=UM(0x4f9a4a,{roughness:.9,flatShading:true}),leaf2=UM(0x3c7d3a,{roughness:.9,flatShading:true}),soil=UM(0x4a3526,{roughness:1}),kit=Kit();
 let ti=0;for(let x=-48;x<=48;x+=24)[-8.2,8.2].forEach(z=>{const X=x+6;kit.base(mat4(X,.12,z));kit.add(bx(1.3,.03,1.3),soil,0,.015,0);[[0,.62],[0,-.62],[.62,0],[-.62,0]].forEach(([a,b])=>kit.add(bx(a?.06:1.3,.1,a?1.3:.06),stoneM,a,.05,b));
   [[0,.6],[0,-.6],[.6,0],[-.6,0]].forEach(([a,b])=>{kit.add(bx(a?.03:1.2,.03,a?1.2:.03),iron,a,.45,b);for(let k=-2;k<=2;k++)kit.add(bx(.025,.45,.025),iron,a||k*.28,.23,b||k*.28)});
   kit.add(cy(.13,.22,2.7,10),bark,0,1.35,0);kit.add(cy(.05,.09,1.1,7),bark,.32,2.5,.1,0,0,-.75);kit.add(cy(.05,.09,1,7),bark,-.28,2.6,-.12,0,0,.7);kit.add(cy(.04,.07,.9,7),bark,.05,2.7,-.35,.7,0,0);
   const can=new T.Group();can.position.set(X,.12,z);S.add(can);const ck=Kit();[[0,3.35,0,1.05,leaf1],[.65,3.05,.2,.75,leaf2],[-.6,3.15,-.2,.8,leaf1],[.1,3.9,-.3,.7,leaf2],[-.2,3.0,.55,.7,leaf2],[.35,3.6,.5,.65,leaf1]].forEach(([a,b,c,r,m])=>ck.add(ico(r,1),m,a,b,c));
   const piv=new T.Group();can.add(piv);ck.build(piv);usolid(X-.25,X+.25,z-.25,z+.25,2.6);
   const Tr={x:X,z,piv,shake:0,i:ti++};ST3.trees.push(Tr);
   Tr.tap=utap("street",X,z+(z>0?-.9:.9),"Press E to shake the tree 🌳",()=>{Tr.shake=1.2;upuff(S,X,3.2,z,18,0x5aa84f,2.4,.4,2.2,.06,2.2);
     if(Tr.i===3&&onceXP("treeCoin",10,"🐿️ A squirrel dropped a coin! +10 XP"))return;bub("🍃",["Leaves everywhere! 🍃","A squirrel ran up the trunk! 🐿️","Whoa, the whole tree rustled.","An acorn bonked Theo on the head!"][Math.floor(Math.random()*4)])},1.1)});
 kit.build(S,{name:"u_trees"});
 U.anims.push((dt,now)=>{for(const Tr of ST3.trees){if(Tr.shake>0){Tr.shake-=dt;Tr.piv.rotation.z=Math.sin(now/45)*.05*Tr.shake;Tr.piv.rotation.x=Math.cos(now/60)*.03*Tr.shake}else if(Tr.piv.rotation.z){Tr.piv.rotation.z=Tr.piv.rotation.x=0}}})}
/* ---------- BENCHES: slatted wood on cast-iron legs ---------- */
{const kit=Kit(),BEN=[[-12.6,-7.95,0],[10,7.95,Math.PI],[-40.5,7.95,Math.PI]];
 BEN.forEach(([x,z,r])=>{kit.base(mat4(x,.12,z,r));for(let k=0;k<4;k++)kit.add(rbox(2,.04,.1,.015),wood,0,.46,-.18+k*.12);for(let k=0;k<3;k++)kit.add(rbox(2,.1,.035,.012),wood,0,.66+k*.13,-.27,-.18);
   [-.85,.85].forEach(sx=>{kit.add(bx(.06,.46,.06),iron,sx,.23,.15);kit.add(bx(.06,.46,.06),iron,sx,.23,-.22);kit.add(bx(.06,.06,.5),iron,sx,.44,-.03);kit.add(bx(.05,.5,.05),iron,sx,.75,-.29,-.18);kit.add(rbox(.06,.05,.5,.02),iron,sx,.63,-.03)});
   const c=Math.abs(Math.cos(r))>.5;usolid(x-1.05,x+1.05,z-.35,z+.35,.5)});
 kit.build(S,{name:"u_benches"});
 /* the old 'check under the bench' coin now has a real bench; after the coin, measure the bench */
 const bt=TAPS.find(t=>t.area==="street"&&/under the bench/.test(t.label));if(bt){const f0=bt.fn;bt.fn=()=>{if(ONCE.has("bench")){uoffer("🪑","Nothing under the bench. It's a nice long bench, though!","meters","bench");return}f0()}}
 utap("street",10,7.2,"Press E to sit on the bench and rest 🪑",()=>uoffer("🪑","Ahh, nice break. Benches in NYC parks are about 2 meters long.","meters","bench2"),1.2);
 utap("street",-40.5,7.2,"Press E to sit on the bench 🪑",()=>uoffer("🐦","A pigeon lands next to you and coos. 🐦",null),1.2)}
/* ---------- USPS MAILBOX: rounded top, legs, pull-down chute that opens when you mail a letter ---------- */
{const mx=-26,mz=6.6;uremove(S,o=>Math.abs(o.position.x-mx)<.5&&Math.abs(o.position.z-mz)<.5&&o.position.y>.3);
 const blue=UM(0x1f4aa8,{metalness:.35,roughness:.45}),kit=Kit();kit.base(mat4(mx,.12,mz,Math.PI));
 kit.add(rbox(.62,.72,.52,.04),blue,0,.98,0);kit.add(new T.CylinderGeometry(.31,.31,.52,20,1,false,-Math.PI/2,Math.PI),blue,0,1.34,0,Math.PI/2,0,0);
 [[-.27,-.22],[.27,-.22],[-.27,.22],[.27,.22]].forEach(([a,b])=>kit.add(bx(.05,.62,.05),blue,a,.31,b));kit.add(bx(.66,.05,.56),UM(0x173a86),0,.6,0);
 kit.build(S,{name:"u_mailbox"});
 const g=new T.Group();g.position.set(mx,.12,mz);g.rotation.y=Math.PI;S.add(g);sign(g,"UNITED STATES POSTAL SERVICE",0,.78,.27,.56,.14,"#1f4aa8","#ffffff");
 const chute=new T.Group();chute.position.set(0,1.3,.27);g.add(chute);const fl=new T.Mesh(rbox(.42,.16,.03,.01),UM(0x2a5cc8,{metalness:.5,roughness:.35}));fl.position.y=-.08;chute.add(fl);const hd=new T.Mesh(rbox(.22,.035,.04,.01),silver);hd.position.set(0,-.13,.025);chute.add(hd);
 usolid(mx-.34,mx+.34,mz-.3,mz+.3,1.6);let op=0,cur=0;U.anims.push(dt=>{op=Math.max(0,op-dt);const w=op>0?1:0;cur+=(w-cur)*Math.min(1,dt*8);chute.rotation.x=cur*.9});
 const mt=TAPS.find(t=>t.area==="street"&&/mail a letter/.test(t.label));if(mt){const f0=mt.fn;mt.fn=()=>{op=1.6;ubeep(260,.12,"square",.03);f0()}}}
/* ---------- NEWSSTAND: kiosk with vendor window, magazine racks, newspaper stacks; read the math headline ---------- */
{const nx=0,nz=7.65,g=new T.Group();g.position.set(nx,.12,nz);g.rotation.y=Math.PI;S.add(g);const kit=Kit(),grn=UM(0x0b6b3a,{metalness:.3,roughness:.5}),grnD=UM(0x084a28,{metalness:.3,roughness:.5});
 kit.add(rbox(3.2,2.3,1.3,.05),grn,0,1.15,0);kit.add(rbox(3.6,.14,1.8,.04),grnD,0,2.37,.15);kit.add(bx(3.4,.18,.06),UM(0xffd23f),0,2.27,1.04);
 kit.add(bx(1.5,.9,.06),UM(0x2a2418),0,1.45,.63);kit.add(bx(1.6,.06,.35),wood,0,.98,.78);[-.78,.78].forEach(x=>kit.add(bx(.06,1,.1),grnD,x,1.45,.66));
 const cols=[0xe23b3b,0x3d7be0,0xffb52e,0x8a5cff,0x2a9d8f,0xff6b8a];
 [-1,1].forEach(s=>{for(let r=0;r<3;r++){kit.add(bx(.62,.04,.22),grnD,s*1.22,.5+r*.45,.76,-.35);for(let k=0;k<3;k++)kit.add(bx(.17,.24,.02),UM(cols[(r*3+k+(s>0?2:0))%6]),s*1.22-.2+k*.2,.64+r*.45,.81,-.35)}});
 for(let k=0;k<3;k++)kit.add(bx(.36,.08+k*.02,.26),UM(0xf2efe6),-.45+k*.45,1.05+k*.01,.82);
 kit.build(g,{name:"u_newsstand"});sign(g,"NEWS · MAGAZINES · SNACKS",0,2.05,.67,2.6,.32,"#0b6b3a","#ffd23f");
 const vend=new T.Mesh(new T.CapsuleGeometry(.16,.3,4,10),UM(0x7a4a2a));vend.position.set(.1,1.25,.35);g.add(vend);const vh=new T.Mesh(sp(.13,12),UM(0x8d5a3b));vh.position.set(.1,1.68,.35);g.add(vh);const cap=new T.Mesh(cy(.14,.14,.06,12),UM(0x1f4aa8));cap.position.set(.1,1.8,.35);g.add(cap);
 usolid(nx-1.65,nx+1.65,nz-.85,nz+.7,2.4);
 utap("street",nx,nz-1.4,"Press E to read today's newspaper 📰",()=>{const q=UQ.G.round(Math.floor(Math.random()*1e6));uoffer("📰",q.text.split("!")[0]+"!","round","news")},1.4)}
/* ---------- SUBWAY ENTRANCE: stairs going down (hole in the sidewalk), green rails, globe lamps, MetroCard machine ---------- */
{const sx=-30,X0=sx-.8,X1=sx+.8,Z0=6.15,Z1=8.6;
 const cut=m=>{m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nvarying vec3 vUW;").replace("#include <begin_vertex>","#include <begin_vertex>\nvUW=(modelMatrix*vec4(transformed,1.0)).xyz;");
   sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nvarying vec3 vUW;").replace("void main() {",`void main() {\nif(vUW.x>${X0.toFixed(2)}&&vUW.x<${X1.toFixed(2)}&&vUW.z>${Z0.toFixed(2)}&&vUW.z<${Z1.toFixed(2)})discard;`)};m.needsUpdate=true};
 S.children.forEach(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==="PlaneGeometry"&&((o.geometry.parameters.width===LEN&&o.geometry.parameters.height===5&&o.position.z>0)||o.geometry.parameters.width===900))cut(o.material)});
 const kit=Kit(),tile=UM(0xe8e2d0,{roughness:.6}),step=UM(0x7c7a76,{roughness:.9}),nose=UM(0xb8a040,{metalness:.6,roughness:.4}),dark=UM(0x22201e);
 const N=10,run=(Z1-Z0)/N,rise=.22;for(let k=0;k<N;k++){const y=.12-(k+1)*rise;kit.add(bx(1.6,rise,run+.02),step,sx,y+rise/2,Z0+run*(k+.5));kit.add(bx(1.6,.03,.04),nose,sx,y+rise,Z0+run*k+.02)}
 kit.add(bx(1.6,.1,1.2),step,sx,.12-N*rise-.05,Z1+.6);[-1,1].forEach(s=>kit.add(bx(.08,N*rise+.3,Z1-Z0+1.4),tile,sx+s*.84,.12-(N*rise)/2+.1,(Z0+Z1)/2+.6));
 kit.add(bx(1.7,N*rise+.3,.08),tile,sx,.12-(N*rise)/2+.1,Z1+1.2);kit.add(bx(1.6,.05,1.4),dark,sx,.12-.05,Z1+.6);
 /* rails: front gate + sides + back */
 [-1,1].forEach(s=>{const x=sx+s*.9;for(let k=0;k<=6;k++)kit.add(bx(.035,1,.035),iron,x,.62,Z0+k*(Z1-Z0+.1)/6);kit.add(bx(.06,.06,Z1-Z0+.2),iron,x,1.12,(Z0+Z1)/2);kit.add(bx(.05,.05,Z1-Z0+.2),iron,x,.35,(Z0+Z1)/2);
   kit.add(cy(.05,.06,2,10),iron,x,1.12,Z0-.05);});
 for(let k=0;k<=8;k++)kit.add(bx(.03,1,.03),iron,sx-.9+k*.225,.62,Z1+.1);kit.add(bx(1.85,.06,.06),iron,sx,1.12,Z1+.1);
 kit.build(S,{name:"u_subway"});
 const gate=new T.Group();gate.position.set(sx,.12,Z0-.05);S.add(gate);const gk=Kit();for(let k=0;k<9;k++)gk.add(bx(.025,.95,.025),iron,-.8+k*.2,.5,0);gk.add(bx(1.7,.04,.04),iron,0,.95,0);gk.add(bx(1.7,.04,.04),iron,0,.15,0);for(let k=0;k<8;k++)gk.add(bx(.02,.28,.02),iron,-.7+k*.2,.55,0,0,0,.6);gk.build(gate);
 [-1,1].forEach(s=>{const gl=new T.Mesh(sp(.15,14),UM(0x6dff6b,{emissive:0x2bd94f,emissiveIntensity:1.4}));gl.position.set(sx+s*.9,.12+2.2,Z0-.05);S.add(gl)});
 const bar=new T.Group();bar.position.set(sx,.12+1.82,Z0-.05);S.add(bar);sign(bar,"SUBWAY  ④ ⑤ ⑥",0,0,.04,1.75,.32,"#111111","#ffffff");sign(bar,"SUBWAY  ④ ⑤ ⑥",0,0,-.04,1.75,.32,"#111111","#ffffff",Math.PI);
 usolid(X0-.15,X1+.15,Z0-.15,Z1+.3,1.2);
 const mc=Kit();mc.add(rbox(.6,1.5,.45,.05),UM(0x2b2f36,{metalness:.4}),0,.75,0);mc.add(bx(.4,.3,.02),UM(0x6fd0ff,{emissive:0x2bb0ff,emissiveIntensity:.9}),0,1.15,.23);mc.add(bx(.3,.05,.03),UM(0xffd23f),0,.85,.23);mc.add(bx(.36,.12,.05),UM(0x111111),0,.5,.23);
 const mg=new T.Group();mg.position.set(sx+1.6,.12,7.4);mg.rotation.y=Math.PI;S.add(mg);mc.build(mg);sign(mg,"MetroCard",0,1.4,.235,.5,.1,"#ffd23f","#14123a");usolid(sx+1.28,sx+1.92,7.15,7.65,1.5);
 let gt=0;U.anims.push(dt=>{gt=Math.max(0,gt-dt);gate.position.y=.12+Math.sin(gt*20)*.01*gt});
 utap("street",sx,Z0-.9,"Press E to check when the next train comes 🚇",()=>{gt=1;ubeep(90,.9,"sawtooth",.04,-30);uoffer("🚇","Rumble... a train passes under the street! The gate opens at 5 AM.","train","subway")},1.3);
 utap("street",sx+1.6,6.6,"Press E to use the MetroCard machine 🎫",()=>{ubeep(900,.08,"square",.03);setTimeout(()=>ubeep(1200,.08,"square",.03),120);uoffer("🎫","Beep! One ride costs $2.90.","fruit","metro")},1.1)}
/* ---------- FRUIT STAND: crates of apples, oranges, bananas, grapes; striped awning; hanging scale ---------- */
{const fx=19.5,fz=7.75,g=new T.Group();g.position.set(fx,.12,fz);g.rotation.y=Math.PI;S.add(g);const kit=Kit();
 kit.add(rbox(3,.08,1.2,.02),wood,0,.82,0);[[-1.4,-.5],[1.4,-.5],[-1.4,.5],[1.4,.5]].forEach(([a,b])=>kit.add(bx(.07,.82,.07),woodD,a,.41,b));kit.add(bx(2.9,.05,1.1),woodD,0,.25,0);
 const crate=(x,z,tilt)=>{kit.add(bx(.85,.04,.6),woodD,x,.9,z,tilt);[-1,1].forEach(s=>{kit.add(bx(.85,.18,.03),wood,x,.98,z+s*.29,tilt);kit.add(bx(.03,.18,.6),wood,x+s*.41,.98,z,tilt)})};
 const fr={apple:UM(0xd92b2b,{roughness:.45}),orange:UM(0xff8c1a,{roughness:.6}),lime:UM(0x7cc33a,{roughness:.5}),grape:UM(0x6b2a8a,{roughness:.4}),banana:UM(0xffd23f,{roughness:.6})};
 [[-1,.18,"apple"],[0,.18,"orange"],[1,.18,"lime"]].forEach(([x,z,k])=>{crate(x,z,-.15);for(let i=0;i<5;i++)for(let j=0;j<3;j++)kit.add(sp(.075,7),fr[k],x-.32+i*.16,1.05+j*.02+(i+j)%2*.03,z-.16+j*.16)});
 crate(-.6,-.3,0);for(let b=0;b<4;b++)for(let k=0;k<4;k++)kit.add(new T.TorusGeometry(.16,.03,6,10,Math.PI*.6),fr.banana,-.85+b*.17,1.02,-.3+k*.03-.05,Math.PI/2,0,b*.3);
 crate(.6,-.3,0);for(let c=0;c<3;c++)for(let k=0;k<14;k++){const a=k*2.4,rr=.05+k*.004;kit.add(sp(.03,6),fr.grape,.35+c*.25+Math.cos(a)*rr,1.08-k*.008,-.3+Math.sin(a)*rr)}
 [-1.45,1.45].forEach(x=>{kit.add(cy(.035,.035,2.2,8),woodD,x,1.1,.55)});
 const aw=canvasTex(512,128,(c,W,H)=>{for(let i=0;i<8;i++){c.fillStyle=i%2?"#ffffff":"#d62828";c.fillRect(i*W/8,0,W/8,H)}});kit.build(g,{name:"u_fruit"});
 const awn=new T.Mesh(new T.BoxGeometry(3.3,.05,1.5),[stoneM,stoneM,new T.MeshStandardMaterial({map:aw,roughness:.8}),stoneM,stoneM,stoneM]);awn.position.set(0,2.15,.1);awn.rotation.x=-.25;awn.castShadow=true;g.add(awn);U.flatOK.add(awn);
 for(let i=0;i<10;i++){const fl=new T.Mesh(bx(.33,.14,.01),i%2?UM(0xffffff):UM(0xd62828));fl.position.set(-1.5+i*.33,1.98,.84);fl.rotation.x=-.25;g.add(fl)}
 sign(g,"FRESH FRUIT · 45¢ ea",0,1.62,.58,1.8,.26,"#2e7d32","#ffffff");
 const scale=new T.Group();scale.position.set(1.1,1.9,.45);g.add(scale);const sc=new T.Mesh(cy(.11,.11,.06,16),silver);sc.rotation.x=Math.PI/2;scale.add(sc);const dish=new T.Mesh(new T.SphereGeometry(.16,14,6,0,Math.PI*2,Math.PI/2,Math.PI/2),silver);dish.position.y=-.35;scale.add(dish);
 const chn=new T.Mesh(cy(.006,.006,.25,4),silver);chn.position.y=-.2;scale.add(chn);let sw=0;U.anims.push((dt,now)=>{sw=Math.max(0,sw-dt);scale.rotation.z=Math.sin(now/120)*.18*sw});
 usolid(fx-1.55,fx+1.55,fz-.65,fz+.65,1.1);
 utap("street",fx-.7,fz-1.25,"Press E to buy some fruit 🍎",()=>{ubeep(1000,.06,"triangle",.04);uoffer("🍎","\"Fresh apples, get your apples!\"","fruit","fruitstand")},1.2);
 utap("street",fx+1,fz-1.25,"Press E to weigh grapes on the scale ⚖️",()=>{sw=1.5;uoffer("🍇","The scale swings… a bunch of grapes!","share","grapes")},1.1)}
/* ---------- TAXIS: rounded body, cabin glass, chrome bumpers, lights, checker stripe, roof sign; wave one down ---------- */
{const yel=UM(0xffc81e,{roughness:.35,metalness:.2}),glassD=UM(0x1d2a38,{roughness:.15,metalness:.5}),tire=UM(0x161616,{roughness:.9}),hub=UM(0xbfc5cc,{metalness:.85,roughness:.3}),
   chk=new T.MeshStandardMaterial({map:canvasTex(256,32,(c,W,H)=>{for(let i=0;i<32;i++)for(let j=0;j<4;j++){c.fillStyle=(i+j)%2?"#111":"#fff";c.fillRect(i*8,j*8,8,8)}}),roughness:.5}),
   roofT=new T.MeshStandardMaterial({map:canvasTex(256,64,(c,W,H)=>{c.fillStyle="#fffbe0";c.fillRect(0,0,W,H);c.fillStyle="#111";c.font="900 44px system-ui";c.textAlign="center";c.fillText("TAXI",W/2,48)}),emissive:0xfff4c0,emissiveIntensity:.5,emissiveMap:null});
 TAXIS.forEach((t,i)=>{S.remove(t.m);const g=new T.Group(),kit=Kit();const head=M(0xfffbe8,{emissive:0xfff2c0,emissiveIntensity:.6}),tail=UM(0xd01010,{emissive:0xa00000,emissiveIntensity:.6});
   kit.add(rbox(4.2,.62,1.84,.14),yel,0,.62,0);kit.add(rbox(1.2,.2,1.78,.1),yel,1.3,.98,0,0,0,-.08);kit.add(rbox(2.3,.66,1.66,.2),glassD,-.15,1.22,0);kit.add(rbox(2.0,.08,1.6,.04),yel,-.15,1.56,0);
   [-1.2,-.15,.9].forEach(x=>kit.add(bx(.07,.6,1.68),yel,x,1.22,0));[-1,1].forEach(s=>{kit.add(bx(3.9,.12,.02),chk,0,.72,s*.925);kit.add(bx(.1,.04,.02),hub,-.6,.85,s*.93);kit.add(bx(.1,.04,.02),hub,.4,.85,s*.93);
     kit.add(rbox(.12,.1,.18,.03),yel,.95,1.2,s*.98)});
   [-1,1].forEach(s=>{kit.add(rbox(.16,.22,1.9,.06),hub,s*2.12,.45,0)});
   [[1.35,.92],[1.35,-.92],[-1.35,.92],[-1.35,-.92]].forEach(([x,z])=>{kit.add(cy(.36,.36,.26,18),tire,x,.36,z,Math.PI/2);kit.add(cy(.2,.2,.27,12),hub,x,.36,z,Math.PI/2)});
   const sg=new T.Mesh(rbox(.7,.22,.3,.05),[roofT,roofT]);sg.position.set(-.15,1.72,0);g.add(sg);kit.build(g);
   const hl=[];[-.65,.65].forEach(z=>{const h=new T.Mesh(cy(.1,.1,.04,12),head);h.rotation.z=Math.PI/2;h.position.set(2.12,.7,z);g.add(h);hl.push(h);const tl=new T.Mesh(bx(.04,.14,.24),tail);tl.position.set(-2.12,.72,z);g.add(tl)});
   S.add(g);t.m=g;t.head=head;t.flash=0;t.stop=0;
   t.tap=utap("street",t.x,t.z,"Press E to wave down the taxi 🚕",()=>{t.stop=2.6;t.flash=1.2;ubeep(420,.18,"square",.05);setTimeout(()=>ubeep(420,.25,"square",.05),230);bub("🚕",["\"Where to, kid? The meter says $3.00 to start.\"","Beep beep! The driver waves at you.","\"Can't stop long — I've got 4 more rides before lunch!\""][i%3])},2.4)});
 U.anims.push((dt,now)=>{for(const t of TAXIS){if(!t.tap)continue;if(t.stop>0){t.stop-=dt;if(t.v0===undefined){t.v0=t.v;t.v=Math.sign(t.v)*1e-4}}else if(t.v0!==undefined){t.v=t.v0;t.v0=undefined}
   t.tap.x=t.x;t.tap.z=t.z;if(t.flash>0){t.flash-=dt;t.head.emissiveIntensity=Math.sin(now/60)>0?2.5:.3}else t.head.emissiveIntensity=.6}})}
/* ---------- 3D DISPLAY WINDOWS on every clothing store, planters + notice case at the school ---------- */
{const kit=Kit(),frm=UM(0x1f3a33,{metalness:.3,roughness:.5}),back=UM(0x3a2a20,{roughness:.8}),plinth=UM(0xd8c3a0,{roughness:.6}),manq=UM(0xf2efe8,{roughness:.5}),
   jac=[0xe23b3b,0x2a6bd8,0xffb52e,0x2a9d8f,0x6b4a2f,0x222222].map(c=>UM(c,{roughness:.7})),strip=UM(0xfff1c8,{emissive:0xffe2a0,emissiveIntensity:1.2}),glassList=[];
 const bld=DOORS.map(d=>{const side=Math.sign(d.z),bx0=d.x-(d.kind==="apartment"?(side>0?-2:2):0);return {kind:d.kind,side,x:bx0,m:mat4(bx0,0,side*14,side>0?Math.PI:0)}});
 const toW=(b,lx,lz)=>({x:b.x+(b.side>0?-lx:lx),z:b.side*(14-lz)});let bi=0;
 bld.filter(b=>b.kind==="clothing").forEach(b=>{[[-2.95,2.7],[2.8,2.8]].forEach(([cx,w],k)=>{const y0=.8,h=2.3,yc=y0+h/2,z0=5,dz=.56;kit.base(b.m);
   kit.add(bx(w,y0,dz),UM(0x1b2a26,{roughness:.6}),cx,y0/2,z0+dz/2);kit.add(bx(w+.2,.1,dz+.14),stoneM,cx,y0+.05,z0+dz/2+.04);kit.add(bx(w-.08,h,.04),back,cx,yc,z0+.03);kit.add(bx(w-.1,.12,dz-.06),plinth,cx,y0+.16,z0+dz/2);
   kit.add(bx(w,.1,dz),frm,cx,y0+h+.05,z0+dz/2);[-1,1].forEach(s=>kit.add(bx(.08,h,dz),frm,cx+s*(w/2-.04),yc,z0+dz/2));kit.add(bx(w-.2,.04,.04),strip,cx,y0+h-.06,z0+dz-.1);kit.add(bx(.04,h,.04),frm,cx,yc,z0+dz-.02);
   [-1,1].forEach((s,m)=>{const mx=cx+s*w/4,j=jac[(bi+m+k)%jac.length];kit.add(cy(.12,.14,.02,14),hub0(),mx,y0+.23,z0+.28);kit.add(cy(.015,.015,.6,6),hub0(),mx,y0+.55,z0+.28);
     kit.add(new T.CapsuleGeometry(.16,.34,2,8),j,mx,y0+1.12,z0+.28,0,0,0,1.25,1,.7);kit.add(sp(.09,7),j,mx-.2,y0+1.38,z0+.28);kit.add(sp(.09,7),j,mx+.2,y0+1.38,z0+.28);
     kit.add(new T.CapsuleGeometry(.05,.4,2,6),j,mx-.24,y0+1.08,z0+.3,0,0,.12);kit.add(new T.CapsuleGeometry(.05,.4,2,6),j,mx+.24,y0+1.08,z0+.3,0,0,-.12);
     kit.add(cy(.035,.04,.1,8),manq,mx,y0+1.52,z0+.28);kit.add(sp(.1,8),manq,mx,y0+1.68,z0+.28,0,0,0,.85,1.05,.9);
     for(let q=0;q<3;q++)kit.add(bx(.3,.06,.22),jac[(bi+q+2)%jac.length],cx+s*.08,y0+.25+q*.065,z0+.42)});
   const gm=new T.Mesh(bx(w-.16,h-.1,.02),GLASS);const p=new T.Vector3(cx,yc,z0+dz-.01).applyMatrix4(b.m);gm.position.copy(p);gm.rotation.y=b.side>0?Math.PI:0;S.add(gm);
   const A=toW(b,cx-w/2,z0),B=toW(b,cx+w/2,z0+dz+.04);usolid(A.x,B.x,A.z,B.z,y0+h+.1);const tp=toW(b,cx,z0+1.25);
   utap("street",tp.x,tp.z,"Press E to window-shop 🧥",()=>uoffer("🧥","Jackets and hoodies on display. Price tags are in dollars!","shop","window"),1.05);bi++})});
 bld.filter(b=>b.kind==="school").forEach(b=>{kit.base(b.m);const hedge=UM(0x3f7f3a,{roughness:.9,flatShading:true});
   [-3.7,3.7].forEach(cx=>{kit.add(rbox(2.3,.55,.85,.05),stoneM,cx,.28,5.5);for(let k=0;k<5;k++)kit.add(ico(.34,1),hedge,cx-.9+k*.45,.72+(k%2)*.05,5.5,0,k,0,1,.8,1);for(let k=0;k<4;k++)kit.add(sp(.05,6),UM(0xffd23f),cx-.7+k*.45,.95,5.78)});
   kit.add(bx(1.8,1.5,.14),UM(0x24407a),-3.85,3.5,5.07);kit.add(bx(1.6,1.3,.02),UM(0xc49a6c,{roughness:1}),-3.85,3.5,5.15);
   [[-.5,.3,0xffffff],[.2,.35,0xfff3a8],[-.3,-.3,0xbfe6ff],[.45,-.25,0xffd0e0]].forEach(([a,c,col])=>kit.add(bx(.42,.5,.012),UM(col),-3.85+a,3.5+c,5.17,0,0,a*.1));
   const gm=new T.Mesh(bx(1.62,1.32,.02),GLASS);gm.position.copy(new T.Vector3(-3.85,3.5,5.2).applyMatrix4(b.m));gm.rotation.y=b.side>0?Math.PI:0;S.add(gm);
   [-3.7,3.7].forEach(cx=>{const A=toW(b,cx-1.15,5.07),B=toW(b,cx+1.15,5.93);usolid(A.x,B.x,A.z,B.z,.6)});
   const tp=toW(b,-3.85,6.1);utap("street",tp.x,tp.z,"Press E to read the school notice board 📌",()=>uoffer("📌","FIELD DAY FRIDAY! Every class needs teams of 4.","shirts","notice"),1.2)});
 kit.build(S,{name:"u_storefronts"});
 function hub0(){return silver}}
/* the Canva facade art above the 3D storefront level is a true flat backdrop (upper floors), not a walk-up object */
S.traverse(o=>{if(o.isMesh&&Array.isArray(o.material)&&o.material.some(m=>m&&m.map&&FAC&&Object.values(FAC).includes(m.map)))U.flatOK.add(o)});
/* Theo's idle "review challenge" offer follows you everywhere; when you are right at a street object, the object gets E
   (doors, Brock, Ms. Marcia and every other NPC still win). Talking to Theo (Q) is unchanged. */
{const _intU=interactions;interactions=function(){const L=_intU();if(QG||CH||U.quiz||HELD||DH)return L;const t=nearTap();if(!t||L.some(d=>d.type==="tap"&&d.t===t))return L;
  const inR=L.filter(d=>Math.hypot(d.x-P.x,d.z-P.z)<d.r);
  /* an NPC/door/Brock that is actually in range keeps E; one that is merely listed but out of range no longer hides the object */
  const qt=d=>d.type==="talk"&&d.r===9&&/^Press Q/.test(d.label||"");
         if(inR.some(d=>d.type!=="skill"&&!qt(d)&&!(d.type==="game"&&d.npc==="Theo"&&!d.indoor)&&d.type!=="none"))return L;
  if(inR.length&&Math.hypot(P.x-t.x,P.z-t.z)>Math.min(t.r,1.4))return L;
  const hasQ=L.some(qt);return [{type:"tap",t,x:P.x,z:P.z,r:9,label:t.label+(hasQ?"  ·  Q 💬 talk":"")}].concat(L.filter(d=>!qt(d)))}}

/* perf: rooms you're not in are hidden (all rooms always rendered before: ~1900 draw calls inside Mr. Sal's, 2 fps on CI).
   Inside a room the camera's far plane is 150 m so the street (250+ m away) isn't drawn either. Rooms are sealed boxes, so nothing visible changes; colliders (SOL) and animations are unaffected. */
{const _rlU=roomLights;roomLights=function(){_rlU();for(const k in ROOMS){const g=ROOMS[k].g;if(g&&g!==S&&!(window.HERO&&HERO.parent===g))g.visible=(AREA===k)}const f=AREA==="street"?400:150;if(cam.far!==f){cam.far=f;cam.updateProjectionMatrix()}};roomLights()}
