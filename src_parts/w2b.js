/* ---------- 1a. LOBBY ---------- */
{const cz=480,w=18,d=16,h=5.6;const g=shell("lobby",cz,w,d,h,{wall:0xf1e2c2,floorMap:checkerTex("#e9e2d0","#2b3d8f",8),doors:[{wall:"front",at:0,w:2.6},{wall:"back",at:0,w:2.6}]});
  sign(g,"WELCOME TO LEVEL UP ACADEMY",0,4.4,-d/2+.22,10,1.1);
  box(g,5,1.1,1.2,M(0x7a4a2a),-4.5,.55,-1);box(g,5.2,.08,1.4,M(0xd8a86a),-4.5,1.14,-1,0);sign(g,"OFFICE",-4.5,.7,-.38,1.6,.45,"#24407a","#fff");
  box(g,.5,.35,.4,M(0x222222),-5.5,1.35,-1.1,0);box(g,.45,.3,.02,M(0x88ccff,{emissive:0x3388ff,emissiveIntensity:.8}),-5.5,1.5,-.88,0);
  box(g,4,2.4,.8,M(0x5a3a22),5.5,1.2,-d/2+.6);const glass=new T.Mesh(new T.BoxGeometry(3.7,1.9,.05),new T.MeshStandardMaterial({color:0xbfe6ff,transparent:true,opacity:.25,roughness:.05}));glass.position.set(5.5,1.35,-d/2+1.02);g.add(glass);
  const gold=M(0xffc83d,{metalness:.9,roughness:.25,emissive:0x553300,emissiveIntensity:.3});
  for(let i=0;i<4;i++){const cup=new T.Group();const b=new T.Mesh(new T.CylinderGeometry(.18,.08,.3,16),gold);b.position.y=.35;const s=new T.Mesh(new T.CylinderGeometry(.03,.03,.2,8),gold);s.position.y=.12;cup.add(b,s,new T.Mesh(new T.BoxGeometry(.2,.06,.2),gold));cup.position.set(4.2+i*.85,.95+(i%2)*.7,-d/2+.65);g.add(cup)}
  [-6,6].forEach(x=>{box(g,2.6,.12,.7,M(0xc8915a),x,.5,4.5);box(g,.12,.5,.6,M(0x444444),x-1.1,.25,4.5);box(g,.12,.5,.6,M(0x444444),x+1.1,.25,4.5)});
  [[-8,-7],[8,6.8],[-8,6.8]].forEach(([x,z])=>{box(g,.8,.7,.8,M(0xb85c38),x,.35,z);const l=new T.Mesh(new T.SphereGeometry(.6,12,10),M(0x3f8f3a));l.position.set(x,1.2,z);g.add(l)});
  const crest=new T.Mesh(new T.CircleGeometry(1.1,40),new T.MeshStandardMaterial({map:canvasTex(256,256,c=>{c.fillStyle="#24407a";c.beginPath();c.arc(128,128,124,0,7);c.fill();c.fillStyle="#ffd23f";c.textAlign="center";c.font="900 92px Trebuchet MS";c.fillText("LU",128,140);c.font="800 24px Trebuchet MS";c.fillText("× ÷ ACADEMY",128,190)})}));crest.position.set(-4.5,3.3,-d/2+.22);g.add(crest);
  doorFrame(g,0,-d/2+.25,0,"HALLWAY · CLASSROOM ↑");
  Object.assign(ROOMS.lobby,{spawns:{front:{x:0,z:cz+d/2-2.6,yaw:Math.PI},back:{x:0,z:cz-d/2+2.2,yaw:0}},exits:[{x:0,z:cz+d/2-.9,to:"street",label:"Press E to go back outside"},{x:0,z:cz-d/2+.9,to:"hallway",spawn:"front",label:"Press E — walk down the hallway"}]});solidsOf(g)}
/* ---------- 1b. HALLWAY ---------- */
{const cz=530,w=9,d=30,h=4.6;const g=shell("hallway",cz,w,d,h,{wall:0xe8eef6,floorMap:checkerTex("#d6d0c0","#c8c0ae",10),doors:[{wall:"front",at:0,w:2.6},{wall:"back",at:0,w:2.6},{wall:"left",at:-4,w:2.6}],lightI:55});
  const lockM=[0x2a6bd8,0xe23b3b,0x2a9d8f,0xffb52e].map(c=>M(c,{metalness:.3,roughness:.5}));
  for(let i=0;i<22;i++){const z=-d/2+2+i*1.2;[-1,1].forEach(sd=>{if(sd<0&&Math.abs(z+4)<1.9)return;const x=sd*(w/2-.45);box(g,.5,2.1,1.1,lockM[(i+(sd>0?1:0))%4],x,1.05,z);for(let k=0;k<3;k++)box(g,.02,.04,.6,M(0x111111),x-sd*.26,1.75-k*.08,z,0)})}
  sign(g,"MS. OKAFOR · ROOM 4B",-w/2+.25,3.6,-4,3,.6,"#24407a","#fff",Math.PI/2);doorFrame(g,-w/2+.25,-4,Math.PI/2,null,0x2a9d8f);
  sign(g,"ROOFTOP GARDEN ↑",0,3.6,-d/2+.22,3.6,.6);doorFrame(g,0,-d/2+.25,0,null,0x7a2bd0);
  [[w/2-.24,4,-Math.PI/2,"MATH STARS ⭐"],[w/2-.24,-9,-Math.PI/2,"4 × 6 = 24"],[-w/2+.24,8,Math.PI/2,"ARRAYS ROCK"]].forEach(([x,z,r,t])=>sign(g,t,x,2.8,z,2.6,1,"#c89b5a","#14123a",r));
  Object.assign(ROOMS.hallway,{spawns:{front:{x:0,z:cz+d/2-2.4,yaw:Math.PI},classDoor:{x:-w/2+1.7,z:cz-4,yaw:Math.PI/2},roof:{x:0,z:cz-d/2+2.2,yaw:0}},
    exits:[{x:0,z:cz+d/2-.9,to:"lobby",spawn:"back",label:"Press E — back to the lobby"},{x:-w/2+.9,z:cz-4,to:"school",spawn:"door",label:"Press E — go into Ms. Okafor's classroom"},{x:0,z:cz-d/2+.9,to:"rooftop",spawn:"stairs",label:"Press E — climb the stairs to the rooftop garden"}]});solidsOf(g)}
/* ---------- 1c. ROOFTOP (open air, skyline all around) ---------- */
{const cz=600,w=22,d=20;const g=shell("rooftop",cz,w,d,1.1,{wall:0x9a5a44,floor:0x6b6f76,open:true,lightI:30});
  const sk=TL.load("tex/skyline.webp");sk.colorSpace=T.SRGBColorSpace;sk.wrapS=T.RepeatWrapping;sk.repeat.x=-2;const cyl=new T.Mesh(new T.CylinderGeometry(70,70,44,48,1,true),new T.MeshBasicMaterial({map:sk,side:T.BackSide,fog:false,toneMapped:false}));cyl.position.y=12;g.add(cyl);
  box(g,3,3,2.6,M(0x7b4a3a),0,1.5,-d/2+1.5);doorFrame(g,0,-d/2+2.85,0,"STAIRS ↓",0x7a2bd0);
  for(let i=0;i<4;i++){const x=-8+i*5.3;box(g,3.6,.6,1.2,M(0x8a5a32),x,.3,6.8);for(let k=0;k<5;k++){const p=new T.Mesh(new T.SphereGeometry(.28,10,8),M([0x3f8f3a,0xff6b8a,0xffd23f,0x8a5cff][(i+k)%4]));p.position.set(x-1.4+k*.7,.75,6.8);g.add(p)}}
  box(g,2.6,.12,.7,M(0xc8915a),-7,.5,-3);box(g,2.6,.12,.7,M(0xc8915a),7,.5,-3);
  for(let i=0;i<16;i++){const b=new T.Mesh(new T.SphereGeometry(.09,8,6),M(0xfff2c0,{emissive:0xffd77a,emissiveIntensity:1.6}));b.position.set(-10+i*1.33,3.2-Math.sin(i/15*Math.PI)*.6,0);g.add(b)}
  [-10.4,10.4].forEach(x=>box(g,.12,3.3,.12,M(0x333333),x,1.65,0));
  box(g,8,.3,5,M(0x24407a),0,.15,1.5);sign(g,"FESTIVAL STAGE",0,.32,4.05,6,.5,"#24407a","#ffd23f");
  Object.assign(ROOMS.rooftop,{spawns:{stairs:{x:3.4,z:cz-d/2+3.6,yaw:0}},exits:[{x:0,z:cz-d/2+3.4,to:"hallway",spawn:"roof",label:"Press E — take the stairs back down"}],exit:{x:0,z:cz-d/2+3.4}});solidsOf(g)}
ROOMS.school.spawns={door:{x:ROOMS.school.cx,z:ROOMS.school.cz+RD/2-2.6,yaw:Math.PI}};
ROOMS.school.exits=[{x:ROOMS.school.exit.x,z:ROOMS.school.exit.z,to:"hallway",spawn:"classDoor",label:"Press E — back to the hallway"}];
["arcade","clothing","apartment"].forEach(k=>{ROOMS[k].exits=[{x:ROOMS[k].exit.x,z:ROOMS[k].exit.z,to:"street",label:"Press E to go back outside"}]});
function roomLights(){for(const k in ROOMS){const L=ROOMS[k].light;if(!L)continue;L.visible=(AREA===k);if(L.userData.hemi)L.userData.hemi.visible=(AREA===k)}}
function goRoom(to,spawn){if(to==="street"){leaveRoom();return}const R0=ROOMS[to];if(!R0)return;if(AREA==="street")RET={x:P.x,z:P.z-Math.sign(P.z||1)*1.2};
  const sp=(spawn&&R0.spawns&&R0.spawns[spawn])||{x:R0.exit.x,z:R0.exit.z-2.6,yaw:Math.PI};AREA=to;P.x=sp.x;P.z=sp.z;P.fy=0;P.vy=0;P.yaw=sp.yaw;TH.x=P.x-Math.cos(sp.yaw)*1.1;TH.z=P.z+Math.sin(sp.yaw)*1.1;
  camYaw=sp.yaw+Math.PI;camPitch=.32;camDist=5.2;camSnap=true;roomLights();if(to==="arcade")W2.loadWorker();try{parent.postMessage({lv3d:"area",area:to},"*")}catch(_){}}
window.goRoom=goRoom;
const _enterRoom=enterRoom;enterRoom=function(kind){if(kind==="school"&&AREA==="street"){RET={x:P.x,z:P.z-Math.sign(P.z||1)*1.2};AREA="__";goRoom("lobby","front");return}_enterRoom(kind);roomLights();if(kind==="arcade")W2.loadWorker()};
const _leaveRoom=leaveRoom;leaveRoom=function(){_leaveRoom();roomLights()};
roomLights();
