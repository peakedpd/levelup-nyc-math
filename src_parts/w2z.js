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
