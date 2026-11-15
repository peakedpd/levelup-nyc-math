
/* =====================================================================
   9. The 3D street is the only world: keys typed while the page (not this frame) has focus are
      forwarded here; "Go to…" / "Take me there" jump the avatar to that place on the street.
   ===================================================================== */
addEventListener("message",e=>{const d=e.data;if(!d)return;
  if(d.lv3d==="key"&&(d.type==="keydown"||d.type==="keyup")){try{dispatchEvent(new KeyboardEvent(d.type,{key:d.key,bubbles:true}))}catch(_){}}
  else if(d.lv3d==="goto")goto3d(d.id)});
function goto3d(id){const kind={school:"school",arcade:"arcade",shop:"clothing",apt:"apartment"}[id];if(AREA!=="street")leaveRoom();
  let x,z,face;if(id==="square"){x=MA.x+1.4;z=MA.z+1.6;face=Math.atan2(MA.x-x,MA.z-z)}
  else{const ds=DOORS.filter(d=>d.kind===kind);if(!ds.length)return;const d=ds.reduce((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)<Math.hypot(b.x-P.x,b.z-P.z)?a:b);x=d.x;z=Math.sign(d.z)*7.0;face=d.z>0?0:Math.PI}
  for(let k=0;k<8&&blocked(x,z,.12);k++)x+=.7;
  P.x=x;P.z=z;P.fy=.12;P.vy=0;P.yaw=face;camYaw=face+Math.PI;camPitch=.32;camDist=7;camSnap=true;TH.x=x+1.2;TH.z=z+(z>0?-.8:.8);target=null;for(const k in K)K[k]=false}
Object.assign(window,{goto3d});
