
/* ---------- 9. TEACH ME in 3D: Ms. Okafor demonstrates on her desk (arrays, equal groups, sharing, area model) ---------- */
const TCD=document.createElement("div");TCD.style.cssText="box-sizing:border-box;position:fixed;left:50%;bottom:10px;transform:translateX(-50%);width:min(94vw,640px);background:rgba(255,255,255,.97);color:#14123a;border:4px solid #2fbf71;border-radius:18px;padding:.5rem .8rem;font:700 16px 'Trebuchet MS',sans-serif;z-index:14;display:none;box-shadow:0 8px 24px rgba(0,0,0,.4)";document.body.appendChild(TCD);
function teachStart(d){if(QG||W2.boss||W2.blaster)return;if(AREA!=="school"){if(AREA!=="street")leaveRoom();goRoom("school","door")}
  const R=ROOMS.school,DX=R.cx,DZ=R.cz-5.2,Y=1.02,g=new T.Group();S.add(g);const tm={d,g,k:0,t0:performance.now(),objs:[],DX,DZ,Y};W2.teach=tm;
  P.x=DX-.4;P.z=DZ+2.6;P.yaw=Math.PI;TH.x=DX+1.3;TH.z=DZ+2.9;camSnap=true;
  const v=d.vis||{};const mar=i=>{const m=OBJ.marbles.make(i);m.castShadow=true;return m};const bowl=(x,z)=>{const b=new T.Mesh(new T.CylinderGeometry(.22,.17,.12,20,1,true),new T.MeshStandardMaterial({color:0xc89b5a,side:T.DoubleSide,roughness:.6}));b.position.set(x,Y+.06,z);g.add(b);return b};
  const drop=(m,x,y,z,delay,stage)=>{m.position.set(x,y+1.6,z);m.visible=false;m.userData={tx:x,ty:y,tz:z,delay,stage};g.add(m);tm.objs.push(m)};
  if(v.type==="groups"||v.type==="share"){const k=v.type==="share"?v.d:v.k,n=v.type==="share"?v.N/v.d:v.n,sp=Math.min(.55,2.8/k);
    for(let b=0;b<k;b++){const x=DX-((k-1)*sp)/2+b*sp;bowl(x,DZ+.1);for(let i=0;i<n;i++)drop(mar(b),x+((i%3)-1)*.08,Y+.09+Math.floor(i/3)*.07,DZ+.1+((Math.floor(i/3)%2)-.5)*.06,b*.35+i*.05,v.type==="share"?2:(b===0?1:2))}
    if(v.type==="share")for(let i=0;i<v.N;i++)drop(mar(i),DX-1.3+(i%6)*.1,Y+.09,DZ-.35+Math.floor(i/6)*.1,i*.03,1)}
  else if(v.type==="compare"){for(let i=0;i<v.n;i++){const c=new T.Mesh(new T.BoxGeometry(.12,.12,.12),M(0x2bd9ff));drop(c,DX-1.4+i*.15,Y+.06,DZ-.4,i*.06,1)}
    for(let r=0;r<v.k;r++)for(let i=0;i<v.n;i++){const c=new T.Mesh(new T.BoxGeometry(.12,.12,.12),M(r%2?0xffd23f:0xff9f1c));drop(c,DX-1.4+i*.15,Y+.06,DZ-.15+r*.15,r*.4+i*.04,2)}}
  else if(v.type==="area"){const parts=String(v.y).split("").map((c,i,a)=>+c*10**(a.length-1-i)).filter(p=>p),tot=parts.reduce((a,b)=>a+b,0);let x0=DX-1.3;const H=.8;
    parts.forEach((p,i)=>{const w=Math.max(.6,2.6*p/tot),bx=new T.Mesh(new T.BoxGeometry(w-.03,.04,H),M([0xffd23f,0x2bd9ff,0xff9fcf,0x9be37a][i%4]));drop(bx,x0+w/2,Y+.02,DZ,i*.5,1);const lb=labelSprite(fmtN(p)+" × "+v.x,1);lb.position.set(x0+w/2,Y+.45+(i%2)*.32,DZ-.5);lb.visible=false;lb.userData={stage:1,delay:i*.5,label:1};g.add(lb);tm.objs.push(lb);
      const pr=labelSprite("= "+fmtN(p*v.x),.9);pr.position.set(x0+w/2,Y+.22+(i%2)*.3,DZ+.2);pr.visible=false;pr.userData={stage:2,delay:i*.5,label:1};g.add(pr);tm.objs.push(pr);x0+=w})}
  TCD.style.display="block";teachCard();try{document.exitPointerLock()}catch(_){}}
const fmtN=n=>Number(n).toLocaleString("en-US");
function teachCard(){const tm=W2.teach;if(!tm)return;const d=tm.d,k=tm.k,st=d.steps||[],last=k>st.length;
  TCD.innerHTML=`<div style="display:flex;gap:.4rem;align-items:center;font-size:13px"><span style="background:#2fbf71;color:#fff;border-radius:999px;padding:.1rem .55rem">📖 TEACH ME · ${d.who}</span><span style="flex:1"></span><button id="tcRead" style="font:700 13px inherit;border:2px solid #14123a;border-radius:10px;background:#ffd23f">🔊</button></div>
  <div style="margin:.3rem 0">${d.q}</div>${st.slice(0,k).map(s=>`<div>✏️ ${s}</div>`).join("")}${last?`<div style="color:#1b7a3a;font-weight:900">✅ Answer: ${d.a}</div>`:""}
  <div style="display:flex;gap:.5rem;margin-top:.4rem">${last?`<button id="tcGo" style="flex:1;min-height:46px;font:900 18px 'Trebuchet MS';border:3px solid #14123a;border-radius:14px;background:#2fbf71;color:#fff">🙋 My turn!</button>`:`<button id="tcNext" style="flex:1;min-height:46px;font:900 18px 'Trebuchet MS';border:3px solid #14123a;border-radius:14px;background:#ffd23f">${k===0?"▶ Show me":"Next step ▶"}</button>`}</div>`;
  const line=k===0?d.intro:last?"So the answer is "+d.a+". Now you try!":st[k-1];say(d.who,line,TCH.x,2.5,TCH.z);BUBW.t=performance.now()+6000;speak(line);
  TCD.querySelector("#tcRead").onclick=()=>speak(line);const nb=TCD.querySelector("#tcNext");if(nb)nb.onclick=()=>{tm.k++;tm.stageT=performance.now();teachCard()};const gb=TCD.querySelector("#tcGo");if(gb)gb.onclick=teachEnd}
function teachEnd(){const tm=W2.teach;if(!tm)return;S.remove(tm.g);W2.teach=null;TCD.style.display="none";camSnap=true;try{parent.postMessage({lv3d:"teachdone"},"*")}catch(_){}}
function updateTeach(dt,now){const tm=W2.teach;if(!tm)return;TCH.x=tm.DX+1.5;TCH.z=tm.DZ-.6;TCH.meet=0;const stage=tm.k>=2?2:tm.k>=1?1:0,st0=tm.stageT||tm.t0;
  tm.objs.forEach(m=>{const u=m.userData;if(u.stage>stage){m.visible=false;return}const t=(now-st0)/1000-(u.stage===stage?u.delay:-99);if(t<0){if(u.stage===stage&&!u.shown)m.visible=false;return}m.visible=true;u.shown=1;if(!u.label){const k=Math.min(1,t/.4);m.position.y=u.ty+(1-k*k)*1.6}});
  if(tm.d.vis&&tm.d.vis.type==="share"&&stage>=2)tm.objs.forEach(m=>{if(m.userData.stage===1)m.visible=false})}
const _gc3=gameCam;gameCam=function(dt){const tm=W2.teach;if(tm&&AREA==="school"){const want=new T.Vector3(tm.DX+.3,2.35,tm.DZ+2.3),look=new T.Vector3(tm.DX,1.0,tm.DZ-.1);if(camSnap){cam.position.copy(want);camSnap=false}else cam.position.lerp(want,Math.min(1,dt*3));cam.lookAt(look);return true}return _gc3(dt)};
const _blk3=BLOCKIN;BLOCKIN=()=>_blk3()||!!W2.teach;
const _int3=interactions;interactions=function(){return W2.teach?[]:_int3()};
const _ug3=updateGame;updateGame=function(dt,now){_ug3(dt,now);updateTeach(dt,now);if(W2.teach)TC.style.visibility="hidden"};
addEventListener("message",e=>{const d=e.data;if(d&&d.lv3d==="teach")teachStart(d)});
Object.assign(window,{teachStart,teachEnd});

/* ---------- 10. REALISM: soft contact shadows under every character (grounds them, no floating) ---------- */
const BLOBT=(()=>{const c=document.createElement("canvas");c.width=c.height=128;const g=c.getContext("2d"),gr=g.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,"rgba(0,0,0,.55)");gr.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=gr;g.fillRect(0,0,128,128);const t=new T.CanvasTexture(c);return t})();
const BLOBS={};function blobFor(k){if(!BLOBS[k]){const m=new T.Mesh(new T.PlaneGeometry(1.1,1.1),new T.MeshBasicMaterial({map:BLOBT,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.renderOrder=1;S.add(m);BLOBS[k]=m}return BLOBS[k]}
function updateBlobs(){[["hero",ACT.hero],["theo",ACT.theo],["marcia",ACT.marcia],["worker",ACT.worker]].forEach(([k,a])=>{if(!a)return;const b=blobFor(k),g=a.g;b.visible=g.visible;if(!g.visible)return;let gy=g.position.y,lift=0;if(k==="hero"){gy=(P.fy||0);lift=Math.max(0,g.position.y-gy)}b.position.set(g.position.x,gy+.02,g.position.z);const s=Math.max(.4,1-lift*.25);b.scale.set(s,s,1);b.material.opacity=s})}
const _ug4=updateGame;updateGame=function(dt,now){_ug4(dt,now);updateBlobs()};
