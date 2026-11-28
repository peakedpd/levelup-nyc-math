
/* =====================================================================
   20. UNIVERSE · SCHOOL (lobby, hallway, gym, cafeteria, rooftop): the Canva wall pictures of shelves, doors, hoops,
   serving lines become real 3D you can walk up to; Canva art stays only as framed posters. Everything gets an E action.
   ===================================================================== */
function uartOff(R){let n=0;R.g.children.slice().forEach(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==="PlaneGeometry"&&o.material&&o.material.isMeshBasicMaterial&&o.material.map&&Math.abs(o.geometry.parameters.height-o.geometry.parameters.width*9/16)<.01){R.g.remove(o);n++}});return n}
function wallClock(g,x,y,z,ry){const grp=new T.Group();grp.position.set(x,y,z);grp.rotation.y=ry;g.add(grp);const k=Kit();k.add(cy(.38,.38,.07,28),UM(0x222222),0,0,.035,Math.PI/2);k.add(cy(.34,.34,.075,28),UM(0xfafafa),0,0,.04,Math.PI/2);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.add(bx(.025,i%3?.04:.08,.01),UM(0x111111),Math.sin(a)*.29,Math.cos(a)*.29,.08,0,0,-a)}k.build(grp);
  const mk=(L,w,c)=>{const p=new T.Group();p.position.z=.09;const m=new T.Mesh(bx(w,L,.008),UM(c));m.position.y=L/2-.03;p.add(m);grp.add(p);return p};const hh=mk(.18,.03,0x111111),mm=mk(.27,.02,0x111111),ss=mk(.29,.008,0xd62828);
  U.anims.push(()=>{const d=new Date(),s=d.getSeconds(),m=d.getMinutes()+s/60,h=d.getHours()%12+m/60;ss.rotation.z=-s/60*Math.PI*2;mm.rotation.z=-m/60*Math.PI*2;hh.rotation.z=-h/12*Math.PI*2});return grp}
function fountain(g,x,z,ry,area){const grp=new T.Group();grp.position.set(x,0,z);grp.rotation.y=ry;g.add(grp);const st=UM(0xc9ced4,{metalness:.8,roughness:.25}),k=Kit();k.add(rbox(.6,.32,.45,.05),st,0,.92,.22);k.add(bx(.12,.75,.12),st,0,.4,.08);k.add(cy(.17,.12,.06,16),UM(0x9aa0a8,{metalness:.9}),0,1.07,.25);k.add(cy(.02,.02,.08,8),st,0,1.12,.12);k.build(grp);
  const arc=[];for(let i=0;i<8;i++){const d=new T.Mesh(sp(.018,5),UM(0x9fd4ff,{emissive:0x4aa0ff,emissiveIntensity:.4}));d.visible=false;grp.add(d);arc.push(d)}let on=0;
  U.anims.push((dt,now)=>{if(on>0){on-=dt;arc.forEach((d,i)=>{const t=((now/400+i/8)%1);d.visible=on>0;d.position.set(0,1.16+Math.sin(t*Math.PI)*.12,.12+t*.2)})}});
  const wp=new T.Vector3(0,0,.9).applyAxisAngle(new T.Vector3(0,1,0),ry);utap(area,x+wp.x,z+wp.z,"Press E to get a drink from the fountain 💧",()=>{on=3;bub("💧","Ahh, cold water! Stay hydrated, mathematician.")},1.1)}
function binLid(g,x,z,col,label,area,what){const grp=new T.Group();grp.position.set(x,0,z);g.add(grp);const k=Kit(),c=UM(col,{roughness:.5});k.add(rbox(.55,.8,.55,.05),c,0,.4,0);k.add(cy(.22,.22,.02,14),UM(0x161616),0,.79,0);k.build(grp);
  const h=new T.Group();h.position.set(0,.82,-.28);grp.add(h);const lid=new T.Mesh(rbox(.6,.06,.6,.025),c);lid.position.z=.28;h.add(lid);sign(grp,label,0,.5,.29,.45,.14,"#ffffff","#14123a");let o=0,cu=0;
  U.anims.push(dt=>{cu+=((o?1:0)-cu)*Math.min(1,dt*7);h.rotation.x=-cu*1.8});const R=ROOMS[area];usolid(x-.3,x+.3,R.cz+z-.3,R.cz+z+.3,.85);
  utap(area,x,z+.7,"Press E to lift the "+label.toLowerCase()+" bin lid",()=>{o=!o;if(o)bub("🗑️","Inside: "+what)},1)}
/* ---------- LOBBY ---------- */
{const R=ROOMS.lobby,g=R.g,cz=R.cz,wx=-9+.22;uartOff(R);const k=Kit(),cork=UM(0xc49a6c,{roughness:1}),fr=UM(0x7a4a2a),pin=[0xd62828,0x2a6bd8,0xffd23f,0x2a9d8f];
 /* cork bulletin board with real pinned papers (left wall) */
 k.add(bx(.08,1.9,3.6),fr,wx+.04,2.3,-2.4);k.add(bx(.04,1.7,3.4),cork,wx+.09,2.3,-2.4);
 [[-3.6,2.7,0xffffff],[-2.9,2.75,0xfff3a8],[-2.2,2.65,0xbfe6ff],[-1.5,2.7,0xffd0e0],[-3.4,1.9,0xd7ffd0],[-2.5,1.85,0xffffff],[-1.6,1.9,0xfff3a8]].forEach(([z,y,c],i)=>{k.add(bx(.012,.55,.45),UM(c),wx+.12,y,z,0,0,(i%3-1)*.04);k.add(sp(.025,6),UM(pin[i%4]),wx+.14,y+.22,z)});
 const notes=["Spelling Bee — Thursday!","Math Club: 4 × 6 = 24 members","Lost: blue water bottle","Field Day: bring sneakers","Book Fair: books are $4 each","Art show in the gym","Kindness Challenge ⭐"];
 notes.forEach((t,i)=>{});sign(g,"WELCOME EXPLORERS!",wx+.14,3.35,-2.4,3,.32,"#24407a","#ffd23f",Math.PI/2);
 utap("lobby",-7.9,-2.4,"Press E to read the bulletin board 📌",()=>{const t=notes[Math.floor(Math.random()*notes.length)];uoffer("📌","Notice: "+t,/\$4/.test(t)?"fruit":"mult","lobbyboard")},1.6);
 /* wall clock + framed Canva posters */
 wallClock(g,wx+.05,4.2,1.8,Math.PI/2);utap("lobby",-7.9,1.8,"Press E to check the clock 🕒",()=>{const d=new Date();uoffer("🕒","It's "+((d.getHours()%12)||12)+":"+String(d.getMinutes()).padStart(2,"0")+". How long until recess?","clock","lobbyclock")},1.4);
 uposter(g,"lobby",.71,.1,.92,.33,wx+.06,2.4,2.2,1.5,Math.PI/2,0x24407a);uposter(g,"lobby",.02,.15,.25,.43,wx+.06,2.5,5.2,1.4,Math.PI/2,0x24407a);
 fountain(g,wx+.25,-5.2,Math.PI/2,"lobby");
 /* office counter: bell, sign-in clipboard, pencil cup */
 k.add(cy(.09,.11,.03,16),UM(0x7a4a2a),-3.6,1.2,-1.2);const bell=new T.Mesh(new T.SphereGeometry(.08,14,6,0,Math.PI*2,0,Math.PI/2),UM(0xffd23f,{metalness:.9,roughness:.2}));bell.position.set(-3.6,1.21,-1.2);g.add(bell);
 k.add(bx(.32,.02,.42),UM(0x8a6a44),-4.6,1.19,-1.1);k.add(bx(.28,.005,.36),UM(0xffffff),-4.6,1.205,-1.1);k.add(bx(.1,.03,.05),silver,-4.6,1.21,-1.3);k.add(cy(.06,.05,.14,12),UM(0x2a6bd8),-6.5,1.25,-1.2);
 for(let i=0;i<4;i++)k.add(cy(.008,.008,.2,5),UM([0xffd23f,0xe23b3b,0x2a9d8f,0x3d7be0][i]),-6.5+(i-1.5)*.025,1.35,-1.2,(i-1.5)*.15);
 let ring=0;U.anims.push(dt=>{ring=Math.max(0,ring-dt);bell.position.y=1.21+Math.abs(Math.sin(ring*40))*.02*ring});
 utap("lobby",-3.6,0,"Press E to ring the office bell 🛎️",()=>{ring=.8;ubeep(1760,.5,"sine",.06);bub("🛎️","Ding! \"Welcome! Sign in on the clipboard, please.\"")},1.1);
 utap("lobby",-4.6,0,"Press E to sign in on the clipboard 📋",()=>bub("📋","You signed in: "+(window.PNAME||"Explorer")+" — 8:05 AM. Right on time!"),1);
 /* lost & found box with a hinged lid */
 const lf=new T.Group();lf.position.set(7.6,0,2.2);g.add(lf);{const lk=Kit();lk.add(bx(1.1,.6,.7),UM(0x8a5a32),0,.3,0);lk.build(lf);sign(lf,"LOST & FOUND",0,.4,.36,.9,.2,"#24407a","#fff")}
 const lh=new T.Group();lh.position.set(0,.6,-.35);lf.add(lh);{const l=new T.Mesh(bx(1.14,.05,.74),UM(0x6b4123));l.position.z=.35;lh.add(l)}
 for(const [c,x,y] of [[0xe23b3b,-.3,.5],[0x2a6bd8,.1,.52],[0x6dff6b,.35,.48]]){const m=new T.Mesh(ico(.13,0),UM(c,{flatShading:true}));m.position.set(x,y,0);m.scale.y=.6;lf.add(m)}
 let lo=0,lc=0;U.anims.push(dt=>{lc+=((lo?1:0)-lc)*Math.min(1,dt*7);lh.rotation.x=-lc*1.7});usolid(7.05,8.15,cz+1.85,cz+2.55,.65);
 utap("lobby",7.6,3.1,"Press E to open the Lost & Found box 🧤",()=>{lo=!lo;if(!lo)return;if(onceXP("lostfound",10,"🧤 You returned a lost glove to the office! +10 XP"))return;bub("🧤","A red mitten, a blue hat, and a green yo-yo. No name tags!")},1.2);
 /* plants get pots with rims + leaves; benches get slats */
 [[-8,-7],[8,6.8],[-8,6.8]].forEach(([x,z])=>{k.add(tor(.42,.05,6,16),UM(0x9a4a2a),x,.7,z,Math.PI/2);for(let i=0;i<7;i++){const a=i*.9;k.add(new T.CapsuleGeometry(.06,.5,2,6),UM(0x2f7a2a,{flatShading:true}),x+Math.cos(a)*.25,1.4+i%2*.15,z+Math.sin(a)*.25,Math.sin(a)*.5,0,Math.cos(a)*.5)}});
 utap("lobby",-7.2,-6.2,"Press E to water the plant 🪴",()=>{upuff(g,-8,1.3,-7,10,0x6fb6ff,.6,1,.6,.03);bub("🪴","Glug glug. The plant looks happier already!")},1.2);
 k.build(g,{name:"u_lobby"})}
/* ---------- HALLWAY: real double doors to the rooftop stairs, clock, fountain, fire extinguisher cabinet, bins ---------- */
{const R=ROOMS.hallway,g=R.g,cz=R.cz,zb=-15+.22;uartOff(R);const k=Kit(),teal=UM(0x2a8fa8,{metalness:.3,roughness:.4}),bar=UM(0xc9ced4,{metalness:.85,roughness:.25});
 [-1,1].forEach(s=>{const x=s*.66;k.add(rbox(1.28,2.8,.08,.02),teal,x,1.4,zb+.05);k.add(bx(.7,1.2,.02),UM(0x1d2a38,{roughness:.1,metalness:.5}),x,1.95,zb+.1);k.add(bx(.9,.07,.07),bar,x,1.1,zb+.15);[-.4,.4].forEach(a=>k.add(bx(.05,.1,.1),bar,x+a,1.1,zb+.11))});
 k.add(bx(2.9,.18,.2),UM(0x1f5f70),0,2.9,zb+.08);[-1.45,1.45].forEach(x=>k.add(bx(.14,3,.2),UM(0x1f5f70),x,1.5,zb+.08));sign(g,"ROOFTOP GARDEN ↑",0,3.35,zb+.06,2.6,.35,"#1f5f70","#ffffff");
 wallClock(g,2.9,3.4,zb+.02,0);uposter(g,"hallway",.0,.06,.12,.3,-3.1,2.4,zb+.06,1.1,0,0x24407a);uposter(g,"hallway",.79,.06,1,.3,3,2.3,zb+.06,1.6,0,0x24407a);
 fountain(g,-4.28,13.6,Math.PI/2,"hallway");
 /* fire extinguisher cabinet: glass door swings, red extinguisher inside */
 const fe=new T.Group();fe.position.set(4.28,1.3,13.6);fe.rotation.y=-Math.PI/2;g.add(fe);{const fk=Kit();fk.add(bx(.6,.9,.2),UM(0xd8d8d8,{metalness:.5}),0,0,.1);fk.add(cy(.09,.09,.5,14),UM(0xd62828,{metalness:.3}),0,-.05,.12);fk.add(cy(.03,.04,.12,8),UM(0x222222),0,.26,.12);fk.add(new T.TorusGeometry(.06,.012,4,10,Math.PI),UM(0x222222),.06,.3,.12);fk.build(fe)}
 const fd=new T.Group();fd.position.set(-.3,0,.21);fe.add(fd);{const d=new T.Mesh(bx(.6,.9,.02),GLASS);d.position.x=.3;fd.add(d);const fr=new T.Mesh(bx(.6,.04,.03),UM(0xbbbbbb));fr.position.set(.3,.43,0);fd.add(fr)}sign(fe,"FIRE EXTINGUISHER",0,.55,.21,.6,.12,"#d62828","#fff");
 let fo=0,fc=0;U.anims.push(dt=>{fc+=((fo?1:0)-fc)*Math.min(1,dt*7);fd.rotation.y=-fc*1.6});
 utap("hallway",3.6,13.6,"Press E to open the fire extinguisher cabinet 🧯",()=>{fo=!fo;if(fo)bub("🧯","Only grown-ups use this — in a real fire, walk calmly outside with your class!")},1);
 binLid(g,-3.2,-14.2,0x2a6bd8,"RECYCLE","hallway","crumpled drafts of a times-table poster and 3 juice boxes.");binLid(g,3.2,-14.2,0x2f6b3a,"TRASH","hallway","pencil shavings and a banana peel. Ew!");
 k.build(g,{name:"u_hallway"})}
/* ---------- GYM: 3D hoop with net, scoreboard, wall pads, banners, ball rack, slatted bleachers ---------- */
{const R=ROOMS.gym,g=R.g,cz=R.cz,zb=-10+.22;uartOff(R);const k=Kit(),white=UM(0xffffff,{roughness:.4}),orange=UM(0xff6a1a,{metalness:.3,roughness:.4}),steel=UM(0x5a5f66,{metalness:.7,roughness:.4});
 k.add(bx(.16,.16,1.2),steel,0,3.7,zb+.6);k.add(bx(.12,.9,.12),steel,0,3.3,zb+.1);k.add(rbox(1.8,1.05,.06,.02),white,0,3.95,zb+1.2);k.add(bx(.6,.45,.065),UM(0xd62828),0,3.75,zb+1.21);k.add(bx(.5,.35,.07),white,0,3.75,zb+1.215);
 k.add(tor(.23,.018,6,24),orange,0,3.48,zb+1.5,Math.PI/2);k.add(bx(.1,.04,.2),orange,0,3.48,zb+1.28);
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.add(cy(.006,.006,.42,3),white,Math.cos(a)*.19,3.28,zb+1.5+Math.sin(a)*.19,Math.sin(a)*.18,0,-Math.cos(a)*.18)}k.add(tor(.15,.006,3,16),white,0,3.1,zb+1.5,Math.PI/2);
 const pads=[0xc8102e,0x24407a,0x2a9d8f,0x3d7be0];for(let i=0;i<10;i++)k.add(rbox(2,1.6,.15,.05),UM(pads[i%4],{roughness:.8}),-9+i*2,.85,zb+.08);
 const sbT=document.createElement("canvas");sbT.width=512;sbT.height=200;const sbx=sbT.getContext("2d"),sbTex=new T.CanvasTexture(sbT);sbTex.colorSpace=T.SRGBColorSpace;let home=0,guest=12;
 const drawSB=()=>{sbx.fillStyle="#0b0b12";sbx.fillRect(0,0,512,200);sbx.font="800 30px system-ui";sbx.fillStyle="#fff";sbx.textAlign="center";sbx.fillText("HOME",110,44);sbx.fillText("GUEST",402,44);sbx.fillText("LEVEL UP",256,44);
   sbx.font="900 96px monospace";sbx.fillStyle="#ff3b3b";sbx.fillText(String(home).padStart(2,"0"),110,150);sbx.fillText(String(guest).padStart(2,"0"),402,150);sbx.fillStyle="#ffd23f";sbx.font="900 60px monospace";sbx.fillText("4",256,140);sbTex.needsUpdate=true};drawSB();
 k.add(rbox(3.4,1.4,.25,.05),UM(0x14141c),0,5.6,zb+.15);const sb=new T.Mesh(new T.PlaneGeometry(3.2,1.25),new T.MeshBasicMaterial({map:sbTex,toneMapped:false}));sb.position.set(0,5.6,zb+.29);g.add(sb);U.flatOK.add(sb);
 [["CHAMPS 2024","#24407a"],["ALL-STARS","#2e7d32"],["DISTRICT CUP","#c8102e"],["FAIR PLAY","#6a1b9a"]].forEach(([t,c],i)=>{const x=[-8,-5,5,8][i];const p=new T.Group();p.position.set(x,4.6,zb+.05);g.add(p);sign(p,t,0,0,0,1.3,1.6,c,"#ffd23f");k.add(cy(.03,.03,1.5,6),UM(0xc9a227,{metalness:.8}),x,5.45,zb+.07,0,0,Math.PI/2)});
 /* ball rack with balls */
 const rx=9.6,rz=-2;k.add(bx(.06,1,.06),steel,rx-.5,.5,rz-.9);k.add(bx(.06,1,.06),steel,rx-.5,.5,rz+.9);k.add(bx(.06,1,.06),steel,rx+.2,.5,rz-.9);k.add(bx(.06,1,.06),steel,rx+.2,.5,rz+.9);[.3,.75].forEach(y=>{k.add(bx(.06,.06,1.85),steel,rx-.5,y,rz);k.add(bx(.06,.06,1.85),steel,rx+.2,y,rz)});
 for(let r=0;r<2;r++)for(let i=0;i<4;i++)k.add(sp(.12,12),UM(0xe8742c,{roughness:.6}),rx-.15,.45+r*.45,rz-.66+i*.44);usolid(rx-.55,rx+.25,cz+rz-.95,cz+rz+.95,1);
 /* bleachers get seat planks, risers and a hand rail */
 for(let i=0;i<3;i++){const x=-11+.8+i*1.2,h=.5+i*.5;k.add(rbox(1.0,.06,11.8,.02),UM(0xd9a066,{roughness:.5}),x+.1,h+.03,1);k.add(bx(.04,.25,11.8),UM(0x1d2a5a),x+.6,h-.12,1)}
 [ -4.9,0,4.9,6.9].forEach(z=>k.add(cy(.03,.03,1.2,6),steel,-11+.8+2*1.2+.4,1.5+.6,1+z*.98));k.add(cy(.03,.03,11.8,6),steel,-11+.8+2*1.2+.4,2.1,1,Math.PI/2);
 k.build(g,{name:"u_gym"});
 /* free throws now fly at the 3D hoop and count on the scoreboard */
 const ball=new T.Mesh(sp(.12,14),UM(0xe8742c,{roughness:.6}));ball.visible=false;g.add(ball);let fly=null;
 const ft=TAPS.find(t=>t.area==="gym"&&/free throw/.test(t.label));if(ft){ft.x=0;ft.z=cz-2.5;ft.r=2.6;ft.fn=()=>{if(fly)return;const ok=Math.random()<.6;fly={t:0,ok,from:new T.Vector3(P.x-R.cx,1.6,P.z-cz)};ball.visible=true}}
 U.anims.push(dt=>{if(!fly)return;fly.t+=dt/1.1;const t=Math.min(1,fly.t),to=new T.Vector3(fly.ok?0:.28,3.5,zb+1.5);ball.position.lerpVectors(fly.from,to,t);ball.position.y+=Math.sin(t*Math.PI)*1.6;
   if(t>=1){ball.visible=false;const ok=fly.ok;fly=null;if(ok){home+=2;drawSB();ubeep(880,.15,"triangle",.05,200);uoffer("🏀","Swish! HOME has "+home+" points now.","mult","hoop")}else{ubeep(150,.2,"square",.04);bub("🏀","Clank! Off the rim. Try again!")}}});
 utap("gym",0,zb+5.2,"Press E to look at the scoreboard 🏟️",()=>uoffer("🏟️","HOME "+home+" · GUEST "+guest+". Each basket is 2 points.","mult","scoreboard"),1)}
/* ---------- CAFETERIA: steel serving line with real food, sneeze guard, milk cooler, menu board, windows, bins ---------- */
{const R=ROOMS.cafeteria,g=R.g,cz=R.cz,zb=-10+.22;uartOff(R);const k=Kit(),steel=UM(0xc9ced4,{metalness:.85,roughness:.25}),steelD=UM(0x8a9098,{metalness:.8,roughness:.3});
 const x0=-6,len=12,zc=zb+1.3;k.add(bx(len,.9,.9),steelD,x0+len/2,.45,zc);k.add(rbox(len+.1,.06,.95,.02),steel,x0+len/2,.93,zc);for(let i=0;i<6;i++)k.add(rbox(1.8,.65,.03,.02),steel,x0+1+i*2,.45,zc+.46);
 k.add(bx(len,.04,.35),steel,x0+len/2,.82,zc+.65);[0,len].forEach(a=>k.add(bx(.04,.1,.06),steel,x0+a,.8,zc+.5));
 const gl=new T.Mesh(bx(len,.02,.6),GLASS);gl.position.set(x0+len/2,1.4,zc+.15);gl.rotation.x=-.5;g.add(gl);for(let i=0;i<=6;i++)k.add(cy(.015,.015,.5,6),steel,x0+i*2,1.2,zc);
 const pans=[["pizza",0xf2c46d],["apples",0xd92b2b],["bananas",0xffd23f],["carrots",0xff8c1a],["salad",0x3f8f3a],["milk",0xffffff]];
 pans.forEach(([n,c],i)=>{const px=x0+1+i*2;k.add(bx(1.7,.08,.6),steel,px,.98,zc);
   if(n==="pizza"){for(let s=0;s<8;s++){const a=s/8*Math.PI*2;k.add(new T.CylinderGeometry(.3,.3,.04,8,1,false,a,Math.PI/4-.04),UM(0xf2c46d),px,1.04,zc);if(s%2)k.add(sp(.03,5),UM(0xb3261e),px+Math.sin(a+.4)*.18,1.07,zc+Math.cos(a+.4)*.18)}}
   else if(n==="apples")for(let a=0;a<9;a++)k.add(sp(.07,8),UM([0xd92b2b,0x6dbf3a][a%2]),px-.5+(a%5)*.25,1.07+(a>4?.05:0),zc-.12+(a>4?.18:0));
   else if(n==="bananas")for(let a=0;a<6;a++)k.add(new T.TorusGeometry(.16,.03,5,8,Math.PI*.6),UM(0xffd23f),px-.4+a*.16,1.05,zc,Math.PI/2,0,.4);
   else if(n==="carrots")for(let a=0;a<14;a++)k.add(cy(.012,.025,.22,6),UM(0xff8c1a),px-.6+a*.09,1.04,zc,Math.PI/2,0,(a%3-1)*.4);
   else if(n==="salad")for(let a=0;a<12;a++)k.add(ico(.06,0),UM(a%3?0x3f8f3a:0xd92b2b,{flatShading:true}),px-.6+(a%6)*.24,1.05,zc-.1+(a>5?.2:0));
   else for(let a=0;a<8;a++){const mx=px-.6+(a%4)*.38,mz=zc-.12+(a>3?.24:0);k.add(bx(.12,.2,.12),UM(a%2?0xffffff:0xd6e9ff),mx,1.12,mz);k.add(new T.ConeGeometry(.09,.06,4),UM(0x2a6bd8),mx,1.25,mz,0,Math.PI/4)}});
 usolid(x0,x0+len,cz+zc-.5,cz+zc+.7,1.1);
 const menu=canvasTex(1024,512,(c,W,H)=>{c.fillStyle="#173322";c.fillRect(0,0,W,H);c.strokeStyle="#c49a6c";c.lineWidth=20;c.strokeRect(10,10,W-20,H-20);c.fillStyle="#ffd23f";c.font="900 64px system-ui";c.textAlign="center";c.fillText("TODAY'S LUNCH",W/2,95);
   c.font="600 46px system-ui";c.fillStyle="#fff";["Pizza slice (1/8 pie) .... $1.25","Apple or banana .... 45¢","Carrot sticks .... 35¢","Milk .... 50¢"].forEach((t,i)=>c.fillText(t,W/2,190+i*80))});
 const mb=new T.Mesh(new T.PlaneGeometry(4,2),new T.MeshStandardMaterial({map:menu,roughness:.9}));mb.position.set(0,3.4,zb+.05);g.add(mb);U.flatOK.add(mb);k.add(rbox(4.2,2.2,.06,.02),UM(0x7a5236),0,3.4,zb+.02);
 /* windows with frames, sills and the playground outside set back behind glass */
 [-8,8].forEach(x=>{const v=TL.load("tex/skyline.webp");v.colorSpace=T.SRGBColorSpace;const p=new T.Mesh(new T.PlaneGeometry(2.4,1.8),new T.MeshBasicMaterial({map:v,toneMapped:false}));p.position.set(x,3.2,zb+.01);g.add(p);U.flatOK.add(p);
   [-1,1].forEach(s=>k.add(bx(.14,2,.3),UM(0xffffff),x+s*1.27,3.2,zb+.15));k.add(bx(2.7,.14,.3),UM(0xffffff),x,4.27,zb+.15);k.add(rbox(2.9,.08,.4,.02),UM(0xffffff),x,2.26,zb+.2);k.add(bx(.05,1.8,.05),UM(0xffffff),x,3.2,zb+.1)});
 uposter(g,"cafeteria",.02,.25,.2,.7,-10.75,2.6,0,1.3,Math.PI/2,0x2a9d8f);uposter(g,"cafeteria",.8,.25,1,.7,10.75,2.6,0,1.3,-Math.PI/2,0x2a9d8f);
 /* milk cooler with a sliding glass lid */
 const mc=new T.Group();mc.position.set(8.2,0,zc);g.add(mc);{const ck=Kit();ck.add(rbox(1.4,.9,.8,.04),UM(0x2a6bd8,{metalness:.3}),0,.45,0);for(let a=0;a<10;a++)ck.add(bx(.12,.2,.12),UM(a%2?0xffffff:0xd6e9ff),-.5+(a%5)*.25,.95,-.15+(a>4?.3:0));ck.build(mc);sign(mc,"MILK 50¢",0,.55,.41,.8,.2,"#2a6bd8","#fff")}
 const lid=new T.Mesh(bx(1.36,.03,.78),GLASS);lid.position.set(0,1.1,0);mc.add(lid);let lo=0,lcur=0;U.anims.push(dt=>{lcur+=((lo?1:0)-lcur)*Math.min(1,dt*6);lid.position.x=lcur*.6});usolid(7.5,8.9,cz+zc-.4,cz+zc+.4,1.1);
 utap("cafeteria",8.2,zc+1,"Press E to slide open the milk cooler 🥛",()=>{lo=!lo;if(lo)uoffer("🥛","Cold milk! Each carton is 50¢.","fruit","milk")},1.1);
 utap("cafeteria",x0+1,zc+1.1,"Press E to take a slice of pizza 🍕",()=>uoffer("🍕","The pizza is cut into 8 equal slices.","pizza","pizza"),1.3);
 utap("cafeteria",x0+3,zc+1.1,"Press E to grab an apple 🍎",()=>uoffer("🍎","Crunchy! Apples are 45¢ each.","fruit","cafapple"),1.1);
 utap("cafeteria",x0+5,zc+1.1,"Press E to take some bananas 🍌",()=>uoffer("🍌","Bananas: great brain food!","share","banana"),1.1);
 binLid(g,-9.8,6,0x2f6b3a,"TRASH","cafeteria","napkins and an empty chip bag.");binLid(g,-9.8,7,0x2a6bd8,"RECYCLE","cafeteria","milk cartons and a water bottle.");binLid(g,-9.8,8,0x8a5a32,"COMPOST","cafeteria","apple cores and banana peels.");
 /* tables get rounded tops, round stools-style benches and trays with real food */
 k.build(g,{name:"u_cafeteria"})}
/* ---------- ROOFTOP GARDEN: sunflowers + tomato stakes, watering can (plants grow), telescope, compost bin ---------- */
{const R=ROOMS.rooftop,g=R.g,cz=R.cz,k=Kit();const flowers=new T.Group();g.add(flowers);const fk=Kit();
 for(let i=0;i<4;i++){const x=-8+i*5.3;for(let j=0;j<3;j++){const fx=x-1.2+j*1.2;fk.add(cy(.02,.025,1.1,6),UM(0x3f8f3a),fx,1.15,7.1);fk.add(cy(.16,.16,.05,14),UM(0xffc81e),fx,1.75,7.15,Math.PI/2.4);fk.add(cy(.07,.07,.06,10),UM(0x5a3a1a),fx,1.76,7.18,Math.PI/2.4)}
   for(let j=0;j<2;j++){const tx=x-.6+j*1.2;k.add(cy(.012,.012,1.2,4),UM(0x8a6a44),tx,1.2,6.5);for(let t=0;t<4;t++)k.add(sp(.06,7),UM(0xd62828),tx+.06,.8+t*.18,6.5+(t%2?.05:-.05))}}
 fk.build(flowers);let grow=0,gs=1;
 const can=new T.Group();can.position.set(9,.12,4.5);g.add(can);{const ck=Kit();ck.add(cy(.16,.18,.32,14),UM(0x2a9d8f,{metalness:.5}),0,.16,0);ck.add(cy(.02,.035,.4,8),UM(0x2a9d8f,{metalness:.5}),.24,.3,0,0,0,-.9);ck.add(new T.TorusGeometry(.12,.015,4,10,Math.PI),UM(0x2a9d8f,{metalness:.5}),0,.34,0,0,Math.PI/2,0);ck.build(can)}
 utap("rooftop",9,4.5,"Press E to water the garden 🚿",()=>{grow=2;upuff(g,0,1.4,6.8,30,0x6fb6ff,8,.5,1,.03);bub("🌻","The sunflowers drink it up and grow taller!")},1.2);
 U.anims.push(dt=>{if(grow>0){grow-=dt;gs=Math.min(1.35,gs+dt*.15);flowers.scale.y=gs;flowers.position.y=-(gs-1)*.7}});
 /* telescope on a tripod at the edge */
 const tel=new T.Group();tel.position.set(-9,0,-6);g.add(tel);{const tk=Kit();[0,2.1,4.2].forEach(a=>tk.add(cy(.02,.02,1.3,5),UM(0x333333),Math.cos(a)*.25,.6,Math.sin(a)*.25,Math.sin(a)*.2,0,-Math.cos(a)*.2));tk.add(cy(.07,.09,.9,14),UM(0xeeeeee,{metalness:.4}),0,1.3,0,0,0,1.2);tk.add(cy(.1,.1,.06,14),UM(0x222222),.38,1.45,0,0,0,1.2);tk.build(tel)}
 usolid(-9.35,-8.65,cz-6.35,cz-5.65,1.4);utap("rooftop",-8.2,-5.4,"Press E to look through the telescope 🔭",()=>uoffer("🔭","You can see the whole skyline! That tall tower is 1,454 feet.","round","telescope"),1.2);
 /* compost bin with a lid: worms inside */
 binLid(g,9,-4,0x6b4123,"COMPOST","rooftop","rich dark soil… and wiggly worms! 🪱 They turn food scraps into dirt for the garden.");
 k.build(g,{name:"u_rooftop"})}
