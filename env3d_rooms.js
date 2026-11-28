/* ---------- ENV 3D · ROOM DECOR (procedural, merged geometry) ----------
   Arcade: neon light strips along the walls and floor, hanging neon rings that turn slowly, two colored fill lights so the
   machines read, and a NEON switch by the door that cycles the color theme (with a synth sweep). */
(()=>{
const ENV=window.ENV3D=window.ENV3D||{};const RM=ENV.rooms={};
const A=ROOMS.arcade;if(A){const g=A.g,w=A.w||RW,d=A.d||RD,h=A.h&&A.h<20?A.h:RH;
  const THEMES=[[0xff2bc0,0x2bd9ff,0xffd23f],[0x7a2bff,0x2bff9e,0xff6b3b],[0xff3b3b,0xffffff,0x3b7bff],[0x2bd9ff,0xff2bc0,0x6dff6b]];
  const nm=[0,1,2].map(i=>new T.MeshStandardMaterial({color:THEMES[0][i],emissive:THEMES[0][i],emissiveIntensity:1.6,roughness:.4}));
  const kit=Kit(),bx=new T.BoxGeometry(1,1,1);
  /* wall-top strips (left, right, back) + floor glow strips */
  [-1,1].forEach(s=>{kit.add(bx,nm[s<0?0:1],s*(w/2-.06),h-.55,0,0,0,0,.06,.09,d-1);kit.add(bx,nm[s<0?1:0],s*(w/2-.06),.09,0,0,0,0,.05,.05,d-1.2)});
  kit.add(bx,nm[2],0,h-.55,-d/2+.06,0,0,0,w-1,.09,.06);kit.add(bx,nm[0],-w/4-1,.09,-d/2+.08,0,0,0,w/2-2.5,.05,.05);kit.add(bx,nm[1],w/4+1,.09,-d/2+.08,0,0,0,w/2-2.5,.05,.05);
  /* zig-zag lightning bolts on the side walls */
  [-1,1].forEach(s=>{for(let k=0;k<3;k++){const z0=-d/2+2.5+k*4.2;[[0,0,.9,.5],[.45,.5,.9,-.5],[.9,0,.9,.5]].forEach(([dz,dy,len,an])=>kit.add(bx,nm[(k+(s>0?1:0))%3],s*(w/2-.07),3.3+dy,z0+dz,an,0,0,.05,.07,len))}});
  kit.build(g,{name:"env_arcade_neon"});
  /* hanging neon rings */
  const rings=[];for(let i=0;i<6;i++){const r=new T.Mesh(new T.TorusGeometry(.45,.035,8,32),nm[i%3]);r.position.set(-5+(i%3)*5,h-1.25,-3+Math.floor(i/3)*5);r.rotation.x=Math.PI/2.5;g.add(r);
    const wire=new T.Mesh(new T.CylinderGeometry(.008,.008,.8,4),UM(0x222222));wire.position.set(r.position.x,h-.45,r.position.z);g.add(wire);rings.push(r)}
  /* colored fill lights (only lit while you're in the arcade: room lights toggle with the area) */
  const L1=new T.PointLight(THEMES[0][0],14,13,1.6),L2=new T.PointLight(THEMES[0][1],14,13,1.6);L1.position.set(-5,3.6,0);L2.position.set(5,3.6,0);g.add(L1,L2);
  /* the NEON switch next to the entrance */
  const sw=new T.Group(),plate=new T.Mesh(new T.BoxGeometry(.5,.7,.06),UM(0x1b1530,{roughness:.5})),knob=new T.Mesh(new T.BoxGeometry(.14,.28,.08),nm[0]);knob.position.z=.05;sw.add(plate,knob);
  sw.position.set(2.6,1.45,d/2-.08);sw.rotation.y=Math.PI;g.add(sw);const lab=sign(g,"NEON",2.6,1.95,d/2-.1,.7,.25,"#1b1530","#ff2bc0",Math.PI);
  RM.arcade={theme:0,rings:rings.length,lights:2};
  utap("arcade",2.6,d/2-1.0,"Press E to flip the NEON switch 💡",()=>{const t=RM.arcade.theme=(RM.arcade.theme+1)%THEMES.length;nm.forEach((m,i)=>{m.color.setHex(THEMES[t][i]);m.emissive.setHex(THEMES[t][i])});L1.color.setHex(THEMES[t][0]);L2.color.setHex(THEMES[t][1]);
      knob.position.y=t%2?-.08:.08;ubeep(220,.35,"sawtooth",.03,660);bub("💡",["Classic pink & blue!","Purple haze!","Red, white & blue!","Mint fresh!"][t])},1.1);
  U.anims.push(dt=>{if(AREA!=="arcade")return;const t=performance.now()/1000;rings.forEach((r,i)=>{r.rotation.z+=dt*.6*(i%2?1:-1)});nm.forEach((m,i)=>m.emissiveIntensity=1.35+Math.sin(t*2+i*2.1)*.3)})}
})();
