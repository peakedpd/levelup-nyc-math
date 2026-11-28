/* ---------- Universe: Brock's challenge-spot props as real 3D street objects (were a brown box + colored slab) ---------- */
{const PM=UM,wood=PM(0x7a5230,{roughness:.75}),steel=PM(0xb9c0c8,{metalness:.7,roughness:.3}),dark=PM(0x2c2f33,{metalness:.4,roughness:.5}),
 wht=PM(0xf5f2ea),red=PM(0xc62828),grn=PM(0x1b7a3d),yel=PM(0xf9c623),org=PM(0xef6c00),blu=PM(0x1e88e5),tire=PM(0x1d1d1d,{roughness:.9}),
 glass=PM(0x9fd3ff,{transparent:true,opacity:.35,roughness:.1,metalness:.1}),bread=PM(0xb5651d,{roughness:.6}),saus=PM(0xb5442a,{roughness:.5}),cheese=PM(0xffcf4a),crust=PM(0xd9a15c);
 const awning=(k,c,w,y,z)=>{for(let i=0;i<8;i++)k.add(bx(w/8,.04,.7),i%2?wht:c,-w/2+w/16+i*w/8,y,z,.35,0,0);k.add(bx(w,.14,.03),c,0,y-.18,z+.33)};
 const wheel=(k,x,y,z,r=.22)=>{k.add(tor(r,.06,8,18),tire,x,y,z,0,Math.PI/2,0);k.add(cy(r*.6,r*.6,.05,12),steel,x,y,z,0,0,Math.PI/2)};
 const B={
  placevalue:k=>{k.add(rbox(2,.95,.8,.04),grn,0,.48,0);k.add(bx(2.04,.06,.84),wood,0,.98,0);awning(k,grn,2.2,2.05,.15);[-1,1].forEach(s=>k.add(cy(.03,.03,1.1,8),dark,s*1.02,1.5,.45));
   for(let i=0;i<6;i++)k.add(cy(.05,.05,.13,12),[red,blu,yel][i%3],-.8+i*.32,1.08,.1);for(let i=0;i<4;i++)k.add(rbox(.2,.28,.07,.02),[org,red,yel,blu][i],-.6+i*.4,1.15,-.22)},
  groups:k=>{for(let i=0;i<3;i++){k.add(bx(.6,.3,.5),wood,-.7+i*.7,.75,0,-.2,0,0);for(let j=0;j<6;j++)k.add(sp(.075,10),[red,org,grn][i],-.85+i*.7+(j%3)*.15,.95,-.08+(j/3|0)*.15)}
   k.add(bx(2,.6,.6),wood,0,.3,0);awning(k,red,2.2,2,.1);[-1,1].forEach(s=>k.add(cy(.03,.03,1.4,8),dark,s*1.02,1.3,.4))},
  rounding:k=>{[-1,1].forEach(s=>{k.add(cy(.05,.05,1.2,10),grn,s*.9,.6,0);k.add(sp(.16,14),PM(0xd8ffe0,{emissive:0x55ff88,emissiveIntensity:.8}),s*.9,1.32,0)});
   for(let i=0;i<10;i++)k.add(cy(.022,.022,.9,6),grn,-.9+i*.2,.45,.32);k.add(bx(1.9,.05,.05),grn,0,.92,.32);k.add(rbox(1.3,.32,.05,.02),grn,0,1.7,0);k.add(cy(.04,.04,1.6,8),dark,0,.85,-.05)},
  addsub:k=>{k.add(rbox(1.7,.7,.75,.05),steel,0,.75,0);k.add(bx(1.74,.05,.79),wht,0,1.12,0);wheel(k,-.6,.22,.4);wheel(k,.6,.22,.4);k.add(cy(.025,.025,1.5,8),dark,-.75,1.85,0);
   k.add(cy(0,1.15,.45,16,true),yel,-.75,2.75,0);k.add(cy(1.15,1.15,.03,16),blu,-.75,2.52,0);for(let i=0;i<4;i++){k.add(cy(.045,.045,.34,8),bread,-.2+i*.18,1.19,.05,0,0,Math.PI/2);k.add(cy(.03,.03,.38,8),saus,-.2+i*.18,1.22,.05,0,0,Math.PI/2)}
   k.add(bx(.06,.06,.6),dark,.95,.95,0)},
  mult:k=>{k.add(cy(.07,.07,2.9,10),dark,.6,1.45,-.2);k.add(bx(1.1,.7,.05),wht,.6,2.9,0);k.add(bx(.36,.26,.01),red,.6,2.82,.03);k.add(tor(.22,.02,6,20),org,.6,2.6,.25,Math.PI/2);
   for(let i=0;i<6;i++)k.add(cy(.004,.004,.28,4),wht,.6+Math.cos(i)*.2,2.45,.25+Math.sin(i)*.2);k.add(sp(.12,14),org,-.5,.24,.2);k.add(bx(.9,.5,.4),dark,-.5,.25,-.2);k.add(sp(.12,14),org,-.5,.62,-.2)},
  divide:k=>{k.add(rbox(1.9,.95,.8,.05),PM(0x8b2d16),0,.48,0);k.add(bx(1.95,.05,.85),wht,0,.98,0);k.add(rbox(1.9,.5,.05,.03),red,0,2,-.3);[-1,1].forEach(s=>k.add(cy(.03,.03,1.1,8),dark,s*.9,1.5,-.3));
   k.add(cy(.42,.42,.04,24),crust,-.3,1.03,.05);k.add(cy(.38,.38,.02,24),cheese,-.3,1.06,.05);for(let i=0;i<7;i++)k.add(cy(.045,.045,.015,10),red,-.3+Math.cos(i*.9)*.22,1.08,.05+Math.sin(i*.9)*.22);
   k.add(bx(.36,.08,.36),PM(0xd9c09a),.5,1.05,0);k.add(bx(.36,.08,.36),PM(0xd9c09a),.5,1.13,0)},
  factors:k=>{for(let i=0;i<4;i++)k.add(tor(.36,.03,6,16),steel,-.75+i*.5,.12,0);k.add(bx(1.8,.04,.12),steel,0,.03,0);
   const bike=(x,c)=>{wheel(k,x-.38,.32,.12,.3);wheel(k,x+.38,.32,.12,.3);k.add(cy(.022,.022,.8,6),c,x,.6,.12,0,0,Math.PI/2);k.add(cy(.022,.022,.55,6),c,x-.2,.45,.12,0,0,.9);k.add(cy(.022,.022,.55,6),c,x+.2,.45,.12,0,0,-.9);
    k.add(bx(.2,.05,.08),dark,x-.2,.8,.12);k.add(cy(.018,.018,.4,6),dark,x+.38,.85,.12,Math.PI/2,0,0)};bike(-.4,red);bike(.6,blu)},
  multistep:k=>{[-1,1].forEach(s=>k.add(bx(.06,2.2,.06),dark,s*1,1.1,-.35));k.add(bx(2.1,.06,.9),dark,0,2.2,0);k.add(bx(2,1.5,.02),glass,0,1.2,-.38);k.add(bx(.02,1.5,.7),glass,-1,1.2,0);
   k.add(bx(1.6,.06,.35),wood,0,.48,-.18);[-.7,.7].forEach(x=>k.add(bx(.05,.45,.05),dark,x,.24,-.18));k.add(cy(.035,.035,2.6,8),dark,1.25,1.3,.35);k.add(rbox(.5,.5,.04,.02),blu,1.25,2.45,.35);k.add(bx(.7,1,.02),wht,.4,1.3,-.36)},
  fractions:k=>{k.add(rbox(1.5,.75,.7,.05),PM(0x5d4037),0,.75,0);wheel(k,-.55,.22,.36);wheel(k,.55,.22,.36);k.add(bx(1.2,.5,.5),glass,0,1.38,0);k.add(bx(1.24,.04,.54),steel,0,1.65,0);
   for(let i=0;i<6;i++)k.add(tor(.09,.03,6,14),bread,-.4+(i%3)*.4,1.2+(i/3|0)*.2,.02);[-1,1].forEach(s=>k.add(cy(.025,.025,1.2,8),dark,s*.72,1.9,0));k.add(bx(1.6,.05,.75),PM(0x8d6e63),0,2.5,0)}};
 const KIND={placevalue:["shop","🏪","Bodega: snacks lined up in rows of 10. Count by place value!"],groups:["fruit","🍎","Crates of apples, oranges and limes, in equal groups."],rounding:["round","🚇","The subway sign says the station is about 400 feet away."],
  addsub:["meters","🌭","Hot dogs sizzling! The vendor is adding up today's sales."],mult:["mult","🏀","Swish! Every basket counts 2 points."],divide:["pizza","🍕","A fresh pie cut into equal slices."],factors:["share","🚲","Bikes locked in rows: how many ways can you arrange them?"],
  multistep:["train","🚌","Bus timetable: buses come every few minutes."],fractions:["pizza","🥨","Warm pretzels, some split into equal parts."]};
 const _bp=brockProp;brockProp=function(sk){if(BRK.prop){S.remove(BRK.prop);BRK.prop=null}if(BRK.sol){const i=SOL.indexOf(BRK.sol);if(i>=0)SOL.splice(i,1);BRK.sol=null}
  const pr=BRK_PROP[sk];if(!pr||!B[sk])return _bp(sk);const g=new T.Group(),x=BRK_X[sk]-1.4,z=BRK_Z-1.3,k=Kit();B[sk](k);k.build(g,{name:"u_brockprop_"+sk});
  const lb=labelSprite(pr[0],1.9);lb.position.set(0,sk==="addsub"?3.2:2.55,.2);g.add(lb);g.position.set(x,.12,z);S.add(g);BRK.prop=g;BRK.spot=sk;
  BRK.sol={x0:x-1,x1:x+1,z0:z-.45,z1:z+.45,y0:0,top:1.2};SOL.push(BRK.sol)};
 const tap=utap("street",0,0,"",()=>{const sk=BRK.spot,K2=KIND[sk];if(!K2||!BRK.prop)return;BRK.prop.rotation.z=.02;setTimeout(()=>BRK.prop&&(BRK.prop.rotation.z=0),160);uoffer(K2[1],K2[2],K2[0],"brk_"+sk)},1.1);tap.area="__off";
 U.anims.push(()=>{const on=!!(BRK.prop&&BRK.prop.visible&&KIND[BRK.spot]);tap.area=on?"street":"__off";if(on){tap.x=BRK_X[BRK.spot]-2.75;tap.z=BRK_Z-1.3;tap.label="Press E to check out the "+BRK_PROP[BRK.spot][0].replace(/^\S+\s/,"")+" "+KIND[BRK.spot][1]}});
 if(BRK.spot){const s=BRK.spot,v=BRK.prop&&BRK.prop.visible;BRK.spot=null;brockProp(s);if(BRK.prop)BRK.prop.visible=!!v}}
