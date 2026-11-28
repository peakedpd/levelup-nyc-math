/* ---------- Universe: apartment building fronts in real 3D (the Canva facade painted the door, window, lanterns, planters,
   basement grate and fire-escape ladder at walking height; now each is a real object in front of the art) ---------- */
{const wood=UM(0x4a1a14,{roughness:.55}),woodL=UM(0x5e2419,{roughness:.5}),brass=UM(0xd4a640,{metalness:.85,roughness:.25}),stoneM=UM(0xcdbb9c,{roughness:.85}),
 iron=UM(0x1d1f22,{metalness:.6,roughness:.45}),glassW=UM(0xffd9a0,{emissive:0xffb35c,emissiveIntensity:.55,roughness:.2}),oval=UM(0xe9dcc0,{emissive:0x9a7a40,emissiveIntensity:.25,roughness:.15,metalness:.2}),
 frame=UM(0x2f3b2c,{roughness:.6}),curt=UM(0xe8d6b0,{roughness:.9}),pot=UM(0xb5542b,{roughness:.8}),leaf=UM(0x2e6b2a,{roughness:.8,flatShading:true}),bloom=UM(0xff5c8a),lamp=UM(0xfff0c0,{emissive:0xffc66b,emissiveIntensity:1.3});
 const kit=Kit(),APT=DOORS.filter(d=>d.kind==="apartment"),fronts=[];
 APT.forEach(d=>{const side=Math.sign(d.z),bxC=d.x-(side>0?-2:2);kit.base(mat4(bxC,0,side*9,side>0?Math.PI:0));
  /* double door with raised panels, oval glass, brass handles + kick plates, fanlight above */
  kit.add(bx(2.16,3.55,.1),wood,2,2.97,.04);[-1,1].forEach(s=>{const cx=2+s*.52;kit.add(rbox(.82,3.3,.06,.02),woodL,cx,2.95,.1);kit.add(rbox(.5,1.05,.03,.02),wood,cx,1.95,.14);
   kit.add(sp(.2,14),oval,cx,3.6,.12,0,0,0,1,2.2,.25);kit.add(tor(.2,.025,6,18),brass,cx,3.6,.13,0,0,0,1,2.2,1);kit.add(bx(.7,.22,.02),brass,cx,1.38,.14);kit.add(cy(.025,.025,.42,8),brass,2+s*.1,2.95,.18)});
  kit.add(bx(.04,3.3,.06),UM(0x2a0d09),2,2.95,.12);kit.add(cy(1.02,1.02,.08,20,false),stoneM,2,4.75,.05,Math.PI/2,0,0,1,1,1);kit.add(cy(.9,.9,.09,20),glassW,2,4.75,.06,Math.PI/2);
  for(let i=0;i<7;i++){const a=Math.PI*(i+.5)/7;kit.add(bx(.03,.85,.03),iron,2+Math.cos(a)*.45,4.75+Math.sin(a)*.45,.12,0,0,a-Math.PI/2)}
  kit.add(bx(2.3,.14,.2),stoneM,2,4.72,.12);kit.add(bx(.36,.12,.03),brass,2.85,3.05,.12);
  /* ground-floor window: deep stone surround, lit glass, mullions, curtains, sill + flower box */
  kit.add(bx(1.75,3.0,.06),glassW,-2.05,3.6,.02);kit.add(bx(1.95,.16,.3),stoneM,-2.05,5.15,.12);kit.add(bx(2.05,.16,.4),stoneM,-2.05,2.05,.18);[-1,1].forEach(s=>kit.add(bx(.14,3.1,.24),stoneM,-2.05+s*.94,3.6,.1));
  kit.add(bx(.07,2.9,.08),frame,-2.05,3.6,.08);kit.add(bx(1.7,.07,.08),frame,-2.05,4.1,.08);[-1,1].forEach(s=>{kit.add(bx(.36,2.5,.04),curt,-2.05+s*.62,3.55,.05,0,0,s*.04);kit.add(cy(.05,.05,.1,8),curt,-2.05+s*.55,2.75,.07)});
  kit.add(rbox(1.7,.32,.32,.03),UM(0x6b3a1e),-2.05,2.3,.36);for(let i=0;i<6;i++){kit.add(ico(.13,0),leaf,-2.75+i*.28,2.55,.36);if(i%2==0)kit.add(sp(.06,8),bloom,-2.7+i*.28,2.66,.42)}
  /* lanterns + planters on posts each side of the stoop */
  [.55,3.45].forEach(x=>{kit.add(bx(.08,.08,.32),iron,x,4.5,.16);kit.add(cy(.13,.1,.36,6),lamp,x,4.35,.34);kit.add(cy(.17,.05,.14,6),iron,x,4.6,.34);kit.add(cy(.06,.13,.06,6),iron,x,4.15,.34);
   kit.add(bx(.42,2.6,.42),stoneM,x<2?.25:3.75,1.3,.25);kit.add(cy(.2,.15,.3,12),pot,x<2?.25:3.75,2.75,.25);kit.add(ico(.25,1),leaf,x<2?.25:3.75,3.05,.25)});
  /* basement grate (iron bars in front of the painted one) */
  for(let i=0;i<9;i++)kit.add(cy(.022,.022,1.05,6),iron,-2.95+i*.2,.6,.12);[.15,1.05].forEach(y=>kit.add(bx(1.75,.05,.05),iron,-2.15,y,.12));
  /* fire-escape drop ladder: real rails + rungs (stops above the sidewalk, like the real thing) */
  [-4.45,-3.95].forEach(x=>kit.add(bx(.05,3.9,.05),iron,x,3.75,.35));for(let i=0;i<13;i++)kit.add(cy(.018,.018,.5,6),iron,-4.2,1.95+i*.3,.35,0,0,Math.PI/2);
  fronts.push({d,side,bxC,w:(lx,o)=>({x:bxC+(side>0?-lx:lx),z:side*(9-o)})})});
 kit.build(S,{name:"u_apt_fronts"});
 fronts.forEach((f,i)=>{const W=f.w(-1.5,1.0),G=f.w(-2.9,.7),L=f.w(-4.2,.9);
  utap("street",W.x,W.z,"Press E to peek in the window 🪟",()=>uoffer("🪟",["A cat naps on the windowsill and flicks its tail at you.","Someone inside is baking — it smells like cookies!","A kid inside is practicing times tables out loud."][i%3],"clock","aptwin"+i),1.1);
  utap("street",G.x,G.z,"Press E to look through the basement grate 🕳️",()=>{ubeep(220,.1);if(i%3===1)onceXP("aptGrate"+i,3,"🪙 You fish a shiny coin out of the grate with a stick! +3 XP");else bub("🕳️","Just old leaves and a lost mitten down there.")},.9);
  utap("street",L.x,L.z,"Press E to check the fire-escape ladder 🪜",()=>bub("🪜","The ladder is locked up high. Fire escapes are for emergencies only!"),.9)});
 U.aptFronts=fronts.length}
/* school front: real blue double doors (grilles, push bars, kick plates), "104" fanlight, brass lanterns — over the painted ones */
{const blue=UM(0x1f4fa0,{roughness:.45,metalness:.2}),blueD=UM(0x173c7a,{roughness:.5}),brass=UM(0xd4a640,{metalness:.85,roughness:.25}),iron=UM(0x1d1f22,{metalness:.6,roughness:.45}),
 gl=UM(0x9fc4e8,{emissive:0x334455,emissiveIntensity:.3,roughness:.1,metalness:.3}),stoneM=UM(0xe6dcc8,{roughness:.8}),lamp=UM(0xfff0c0,{emissive:0xffc66b,emissiveIntensity:1.3}),fan=UM(0xfff4d8,{emissive:0xd9b26a,emissiveIntensity:.35});
 const kit=Kit();DOORS.filter(d=>d.kind==="school").forEach(d=>{const side=Math.sign(d.z);kit.base(mat4(d.x,0,side*9,side>0?Math.PI:0));
  kit.add(bx(2.6,2.75,.1),blueD,0,3.12,.04);[-1,1].forEach(s=>{const cx=s*.64;kit.add(rbox(1.2,2.6,.07,.02),blue,cx,3.12,.1);kit.add(bx(.62,.9,.03),gl,cx,3.75,.14);
   for(let i=0;i<4;i++)kit.add(cy(.012,.012,.9,5),iron,cx-.24+i*.16,3.75,.16);kit.add(tor(.18,.015,5,16),iron,cx,3.75,.16);kit.add(bx(1.1,.3,.02),brass,cx,1.98,.14);kit.add(cy(.03,.03,1,8),brass,cx,2.95,.2,0,0,Math.PI/2);[-.42,.42].forEach(o=>kit.add(bx(.04,.04,.1),brass,cx+o,2.95,.16))});
  kit.add(cy(1.3,1.3,.08,24),stoneM,0,4.55,.05,Math.PI/2);kit.add(cy(1.15,1.15,.09,24),fan,0,4.55,.06,Math.PI/2);for(let i=0;i<9;i++){const a=Math.PI*(i+.5)/9;kit.add(bx(.03,1.1,.03),UM(0x6b5a3a),Math.cos(a)*.57,4.55+Math.sin(a)*.57,.12,0,0,a-Math.PI/2)}
  kit.add(bx(2.9,.12,.2),stoneM,0,4.52,.12);kit.add(rbox(.5,.22,.03,.02),UM(0x1b2a4a),0,4.95,.13);
  [-2.05,2.05].forEach(x=>{kit.add(bx(.08,.08,.32),iron,x,4.5,.16);kit.add(cy(.14,.1,.4,6),lamp,x,4.3,.34);kit.add(cy(.18,.05,.15,6),brass,x,4.58,.34);kit.add(cy(.06,.14,.06,6),brass,x,4.08,.34)})});
 kit.build(S,{name:"u_school_doors"})}
/* clothing store entrance: real framed glass doors (pulls, kick plates, "OPEN" card), transom, wall lanterns */
{const fr=UM(0x1b2a26,{roughness:.5,metalness:.3}),brass=UM(0xd4a640,{metalness:.85,roughness:.25}),gl=UM(0xbfe3ff,{transparent:true,opacity:.28,roughness:.05,metalness:.2}),
 inside=UM(0x6b4f35,{emissive:0x3a2614,emissiveIntensity:.4,roughness:.8}),card=UM(0xffffff,{emissive:0x55ff99,emissiveIntensity:.35}),lamp=UM(0xfff0c0,{emissive:0xffc66b,emissiveIntensity:1.3});
 const kit=Kit();DOORS.filter(d=>d.kind==="clothing").forEach(d=>{const side=Math.sign(d.z);kit.base(mat4(d.x,0,side*9,side>0?Math.PI:0));
  kit.add(bx(1.75,2.75,.04),inside,0,1.4,.01);[-1,1].forEach(s=>{const cx=s*.43;kit.add(bx(.84,2.55,.03),gl,cx,1.33,.12);[-1,1].forEach(e=>kit.add(bx(.07,2.6,.08),fr,cx+e*.39,1.33,.12));
   kit.add(bx(.84,.07,.08),fr,cx,2.6,.12);kit.add(bx(.84,.28,.06),brass,cx,.2,.12);kit.add(cy(.022,.022,.75,8),brass,cx-s*.3,1.3,.2);[-.33,.33].forEach(o=>kit.add(bx(.03,.03,.08),brass,cx-s*.3,1.3+o,.16))});
  kit.add(bx(1.9,.42,.1),fr,0,2.92,.1);kit.add(bx(1.5,.26,.02),UM(0x2c1e12,{emissive:0x553311,emissiveIntensity:.4}),0,2.92,.16);kit.add(bx(.3,.2,.01),card,.43,1.75,.14);
  [-1.15,1.15].forEach(x=>{kit.add(bx(.06,.06,.26),fr,x,2.35,.13);kit.add(cy(.1,.08,.3,6),lamp,x,2.2,.28);kit.add(cy(.13,.04,.1,6),fr,x,2.4,.28)})});
 kit.build(S,{name:"u_clothing_doors"})}
/* perf: adaptive quality. Soft shadows are the single biggest per-frame cost on software GL / low-end phones (measured 2.75 -> 5.75 fps
   on the street with shadows off). If the game runs under ~12 fps for 3 s, shadows switch off once (everything else stays). Uses wall-clock time: the frame dt is capped at 50 ms. */
{let t0=0,n=0,slow=0;U.lowFx=false;U.anims.push(()=>{if(U.lowFx||document.hidden)return;const now=performance.now();if(!t0){t0=now;n=0;return}n++;const el=(now-t0)/1000;if(el<1)return;const fps=n/el;t0=now;n=0;slow=fps<12?slow+1:0;
  if(slow>=3){U.lowFx=true;R.shadowMap.enabled=false;S.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)});try{console.info("LevelUp: low-FPS mode (shadows off)")}catch(_){}}})}
