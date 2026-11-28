/* ---------- ENV 3D · ROOM DECOR (procedural, merged geometry) ----------
   Arcade: neon light strips along the walls and floor, hanging neon rings that turn slowly, two colored fill lights so the
   machines read, and a NEON switch by the door that cycles the color theme (with a synth sweep).
   Hallway: cork bulletin boards with pinned notices. Apartment: rug, wall shelves with books + toy robot, floor lamp switch.
   Gym: wooden bleachers. Classroom: cubbies with colored bins and a coat-hook rail. */
(()=>{
const ENV=window.ENV3D=window.ENV3D||{};const RM=ENV.rooms={};
const A=ROOMS.arcade;if(A){const g=A.g,w=A.w||RW,d=A.d||RD,h=A.h&&A.h<20?A.h:RH;
  const THEMES=[[0xff2bc0,0x2bd9ff,0xffd23f],[0x7a2bff,0x2bff9e,0xff6b3b],[0xff3b3b,0xffffff,0x3b7bff],[0x2bd9ff,0xff2bc0,0x6dff6b]];
  const nm=[0,1,2].map(i=>new T.MeshStandardMaterial({color:THEMES[0][i],emissive:THEMES[0][i],emissiveIntensity:1.6,roughness:.4}));
  const kit=Kit(),bx=new T.BoxGeometry(1,1,1);
  /* wall-top strips (left, right, back) + floor glow strips */
  [-1,1].forEach(s=>{kit.add(bx,nm[s<0?0:1],s*(w/2-.24),h-.55,0,0,0,0,.06,.09,d-1);kit.add(bx,nm[s<0?1:0],s*(w/2-.23),.09,0,0,0,0,.05,.05,d-1.2)});
  kit.add(bx,nm[2],0,h-.55,-d/2+.24,0,0,0,w-1,.09,.06);kit.add(bx,nm[0],-w/4-1,.09,-d/2+.23,0,0,0,w/2-2.5,.05,.05);kit.add(bx,nm[1],w/4+1,.09,-d/2+.23,0,0,0,w/2-2.5,.05,.05);
  /* zig-zag lightning bolts on the side walls */
  [-1,1].forEach(s=>{for(let k=0;k<3;k++){const z0=-d/2+2.5+k*4.2;[[0,0,.9,.5],[.45,.5,.9,-.5],[.9,0,.9,.5]].forEach(([dz,dy,len,an])=>kit.add(bx,nm[(k+(s>0?1:0))%3],s*(w/2-.24),3.3+dy,z0+dz,an,0,0,.05,.07,len))}});
  kit.build(g,{name:"env_arcade_neon"});
  /* hanging neon rings */
  const rings=[];for(let i=0;i<6;i++){const r=new T.Mesh(new T.TorusGeometry(.45,.035,8,32),nm[i%3]);r.position.set(-5+(i%3)*5,h-1.25,-3+Math.floor(i/3)*5);r.rotation.x=Math.PI/2.5;g.add(r);
    const wire=new T.Mesh(new T.CylinderGeometry(.008,.008,.8,4),UM(0x222222));wire.position.set(r.position.x,h-.45,r.position.z);g.add(wire);rings.push(r)}
  /* colored fill lights (only lit while you're in the arcade: room lights toggle with the area) */
  const L1=new T.PointLight(THEMES[0][0],14,13,1.6),L2=new T.PointLight(THEMES[0][1],14,13,1.6);L1.position.set(-5,3.6,0);L2.position.set(5,3.6,0);g.add(L1,L2);
  /* the NEON switch next to the entrance */
  const sw=new T.Group(),plate=new T.Mesh(new T.BoxGeometry(.5,.7,.06),UM(0x1b1530,{roughness:.5})),knob=new T.Mesh(new T.BoxGeometry(.14,.28,.08),nm[0]);knob.position.z=.05;sw.add(plate,knob);
  sw.position.set(2.6,1.45,d/2-.24);sw.rotation.y=Math.PI;g.add(sw);const lab=sign(g,"NEON",2.6,1.95,d/2-.25,.7,.25,"#1b1530","#ff2bc0",Math.PI);
  RM.arcade={theme:0,rings:rings.length,lights:2};
  utap("arcade",2.6,d/2-1.0,"Press E to flip the NEON switch 💡",()=>{const t=RM.arcade.theme=(RM.arcade.theme+1)%THEMES.length;nm.forEach((m,i)=>{m.color.setHex(THEMES[t][i]);m.emissive.setHex(THEMES[t][i])});L1.color.setHex(THEMES[t][0]);L2.color.setHex(THEMES[t][1]);
      knob.position.y=t%2?-.08:.08;ubeep(220,.35,"sawtooth",.03,660);bub("💡",["Classic pink & blue!","Purple haze!","Red, white & blue!","Mint fresh!"][t])},1.1);
  U.anims.push(dt=>{if(AREA!=="arcade")return;const t=performance.now()/1000;rings.forEach((r,i)=>{r.rotation.z+=dt*.6*(i%2?1:-1)});nm.forEach((m,i)=>m.emissiveIntensity=1.35+Math.sin(t*2+i*2.1)*.3)})}
/* Hallway: two cork bulletin boards above the lockers (3D frame, cork, pinned notices with push pins); read one for a math moment */
const HW=ROOMS.hallway;if(HW){const g=HW.g,w=HW.w||9,kit=Kit(),bx=new T.BoxGeometry(1,1,1),pin=new T.SphereGeometry(.035,8,6);
  const wood=UM(0x7a5236,{roughness:.8}),cork=UM(0xc49a6c,{roughness:1}),paper=[UM(0xfffdf4),UM(0xfff27a),UM(0xa8e6ff),UM(0xffc2d6),UM(0xc8f7c5)],pinM=[UM(0xe53935),UM(0x1e88e5),UM(0x43a047),UM(0xfdd835)];
  RM.boards=[];
  [[-1,-9],[1,4]].forEach(([sd,z],bi)=>{const x=sd*(w/2-.22),ry=-sd*Math.PI/2;kit.base(mat4(x,3.35,z,ry));
    kit.add(bx,wood,0,0,.02,0,0,0,2.6,1.3,.06);kit.add(bx,cork,0,0,.06,0,0,0,2.4,1.1,.03);
    for(let k=0;k<6;k++){const px=-.9+(k%3)*.9,py=(k<3?.22:-.25)+(k%2)*.05,rot=((k*37)%9-4)*.03;kit.add(bx,paper[(k+bi)%5],px,py,.085,0,0,rot,.55,.4,.01);kit.add(pin,pinM[k%4],px,py+.16,.1)}
    RM.boards.push({x,z});
    utap("hallway",x-sd*1.1,z,"Press E to read the bulletin board 📌",()=>{ubeep(700,.06,"triangle",.03);bub("📌",bi?"FIELD TRIP to the Museum of Math! The bus leaves after lunch.":"MATH CLUB meets Tuesday. Bring a puzzle!");setTimeout(()=>uoffer("📌","Bulletin-board time puzzle!","clock","board"+bi),700)},1.2)});
  kit.build(g,{name:"env_hall_boards"})}
/* Theo's apartment: a striped rug, wall shelves with books and a toy robot, and a floor lamp you can switch on */
const AP=ROOMS.apartment;if(AP){const g=AP.g,w=AP.w||RW,kit=Kit(),bx=new T.BoxGeometry(1,1,1);
  const rugT=canvasTex(512,512,(c,W,H)=>{c.fillStyle="#2a6f97";c.fillRect(0,0,W,H);["#f4d35e","#ee964b","#f95738","#faf0ca"].forEach((col,i)=>{c.fillStyle=col;for(let y=i*32;y<H;y+=128)c.fillRect(0,y,W,18)});c.strokeStyle="#faf0ca";c.lineWidth=18;c.strokeRect(9,9,W-18,H-18)});
  const rug=new T.Mesh(new T.PlaneGeometry(4.2,2.8),new T.MeshStandardMaterial({map:rugT,roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(-3,.015,.4);rug.receiveShadow=true;g.add(rug);
  const sh=UM(0x8d6e63,{roughness:.8});const books=[0xc62828,0x1565c0,0x2e7d32,0xf9a825,0x6a1b9a,0xef6c00].map(c=>UM(c,{roughness:.8}));
  [1.7,2.4].forEach((y,r)=>{kit.base(mat4(-w/2+.38,y,4.2,Math.PI/2));kit.add(bx,sh,0,0,0,0,0,0,2.2,.06,.32);[-.9,.9].forEach(px=>kit.add(bx,sh,px,-.12,-.05,0,0,0,.05,.2,.2));
    for(let k=0;k<7;k++){const hgt=.22+((k*7+r*3)%5)*.03;kit.add(bx,books[(k+r)%6],-.8+k*.12,.03+hgt/2,0,0,0,(k===6?-.25:0),.09,hgt,.24)}});
  const steel=UM(0xb0bec5,{metalness:.6,roughness:.3});kit.base(mat4(-w/2+.38,2.4,4.2,Math.PI/2));kit.add(bx,steel,.6,.14,0,0,0,0,.18,.22,.16);kit.add(bx,steel,.6,.31,0,0,0,0,.14,.12,.12);kit.add(new T.SphereGeometry(.025,8,6),UM(0x00e5ff,{emissive:0x00e5ff,emissiveIntensity:1.5}),.6,.32,.065);
  const pole=UM(0x333333,{metalness:.5,roughness:.4});kit.base(mat4(-6.4,0,-4.6,0));kit.add(new T.CylinderGeometry(.22,.25,.05,16),pole,0,.03,0);kit.add(new T.CylinderGeometry(.025,.025,1.9,8),pole,0,1,0);
  kit.build(g,{name:"env_apt_decor"});
  const shadeM=new T.MeshStandardMaterial({color:0xfff3d6,emissive:0xffc66b,emissiveIntensity:0,roughness:.8,side:T.DoubleSide});const shade=new T.Mesh(new T.CylinderGeometry(.22,.34,.4,20,1,true),shadeM);shade.position.set(-6.4,2.05,-4.6);g.add(shade);
  const lt=new T.PointLight(0xffc66b,0,7,1.6);lt.position.set(-6.4,1.9,-4.6);g.add(lt);RM.lamp={on:false};
  utap("apartment",-6.4,-3.7,"Press E to switch on the floor lamp 💡",()=>{const on=RM.lamp.on=!RM.lamp.on;shadeM.emissiveIntensity=on?1.1:0;lt.intensity=on?8:0;ubeep(on?600:300,.06,"square",.03);bub("💡",on?"Cozy!":"Lights out.")},1.0);
  utap("apartment",-w/2+1.2,4.2,"Press E to look at Theo's shelf 📚",()=>{ubeep(400,.1,"triangle",.03);bub("🤖","Theo's toy robot blinks. 7 books on each of 2 shelves.");setTimeout(()=>uoffer("📚","Bookshelf math!","books","aptShelf"),700)},1.0)}
/* Gym: 3-row wooden bleachers on the left wall (sit for a cheer) */
const GY=ROOMS.gym;if(GY){const g=GY.g,w=GY.w||22,d=GY.d||20,kit=Kit(),bx=new T.BoxGeometry(1,1,1),wood=UM(0xc8925a,{roughness:.7}),steel=UM(0x8a949c,{metalness:.6,roughness:.4});
  const x0=-w/2+.5,len=7,zc=4.3;for(let r=0;r<3;r++){const x=x0+.45+r*.7,y=.45+r*.45;kit.add(bx,wood,x,y,zc,0,0,0,.6,.08,len);kit.add(bx,wood,x+.28,y-.22,zc,0,0,0,.05,.44,len)}
  for(let k=0;k<5;k++){const z=zc-len/2+.2+k*(len-.4)/4;kit.add(bx,steel,x0+1.15,.7,z,0,0,-.55,.06,1.9,.06)}
  kit.build(g,{name:"env_gym_bleachers"});usolid(GY.cx+x0,GY.cx+x0+2.2,GY.cz+zc-len/2,GY.cz+zc+len/2,1.4);RM.bleachers=true;
  utap("gym",x0+3,zc,"Press E to cheer from the bleachers 📣",()=>{tune2([523,523,659,784]);bub("📣","Go, Level Up, go! The crowd stomps the bleachers.");setTimeout(()=>uoffer("📣","Bleacher math!","hoop","bleach"),700)},1.3)}
/* Classroom: cubbies by the door with colorful bins and a coat hook rail */
const CR=ROOMS.school;if(CR){const g=CR.g,d=CR.d||RD,kit=Kit(),bx=new T.BoxGeometry(1,1,1),wood=UM(0xe8d2ac,{roughness:.8}),bins=[0xe53935,0x1e88e5,0x43a047,0xfdd835,0x8e24aa,0xfb8c00].map(c=>UM(c,{roughness:.7}));
  const zc=d/2-.45,xc=-5.2;kit.add(bx,wood,xc,.6,zc,0,0,0,3.2,1.2,.6);for(let r=0;r<2;r++)for(let c=0;c<4;c++)kit.add(bx,bins[(r*4+c)%6],xc-1.2+c*.8,.33+r*.55,zc-.12,0,0,0,.66,.4,.42);
  kit.add(bx,UM(0x7a5236),xc,1.75,zc+.05,0,0,0,3.2,.12,.06);for(let c=0;c<5;c++)kit.add(new T.CylinderGeometry(.025,.025,.14,6),UM(0x9e9e9e,{metalness:.7}),xc-1.4+c*.7,1.7,zc-.03,Math.PI/2,0,0);
  kit.build(g,{name:"env_class_cubbies"});usolid(CR.cx+xc-1.6,CR.cx+xc+1.6,CR.cz+zc-.3,CR.cz+zc+.3,1.2);RM.cubbies=true;
  utap("school",xc,zc-1.1,"Press E to check the cubbies 🧺",()=>{ubeep(380,.08,"triangle",.03);bub("🧺","8 bins: crayons, glue sticks, rulers, counters…");setTimeout(()=>uoffer("🧺","Share the supplies equally!","share","cubby"),700)},1.1)}
function tune2(n){n.forEach((f,i)=>setTimeout(()=>ubeep(f,.14,"square",.03),i*160))}
})();
