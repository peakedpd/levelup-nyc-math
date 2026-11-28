/* ---------- ENV 3D · PROPS: Meshy text-to-3D hero props (models/props/*.glb, ~2-6k triangles, 512px WebP) ----------
   Street: hot-dog cart, ice-cream cart, newspaper boxes, payphone, parking meters.
   Arcade: gumball machine, popcorn machine, skee-ball lane, jukebox, claw machine, basketball hoop game, photo booth.
   School: real teacher's desk + globe, bookcase, backpacks, gym lockers, lobby couch, cafeteria fridge + menu TV.
   Clothing store: mannequins, rolling rack, folded-shirt table, sneaker wall, fitting room (try-on opens the shop), register on Mr. Sal's counter, mirror.
   Lobby: couch, trophy case, plant. Hallway: water fountain. Apartment: plant.
   Every prop is interactive (press E / tap): a small animation + sound, and most offer an optional math moment.
   Room props load the first time you walk into that room. */
(()=>{
const ENV=window.ENV3D=window.ENV3D||{};const PR=ENV.props={list:[],loaded:0,failed:0,want:0,err:null};
const url=n=>"models/props/"+n+".glb";
/* ---- tiny seeded quiz builder (answers verified in test/p15env.js) ---- */
const rng=s=>()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648},ri=(r,a,b)=>a+Math.floor(r()*(b-a+1));
function mkq(r,id,std,text,ans,wrong,explain){const A=String(ans),ch=[A];for(const w of wrong){const s=String(w);if(!ch.includes(s)&&ch.length<4&&!/^-|^\$-/.test(s)&&s!=="0"&&s!=="$0")ch.push(s)}
  let k=1;while(ch.length<4){const s=typeof ans==="number"?String(ans+k):A+"·".repeat(k);if(!ch.includes(s))ch.push(s);k++}
  for(let i=ch.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[ch[i],ch[j]]=[ch[j],ch[i]]}return {id,std,text,ans:A,choices:ch,explain}}
const G={
  hotdog(s){const r=rng(s),c=ri(r,2,5),n=ri(r,2,6),x=c*n;return mkq(r,"hotdog","4.MD.A.2",`Hot dogs cost $${c} each. How much for ${n} hot dogs?`,"$"+x,["$"+(c+n),"$"+(x+c),"$"+(x-c)],`${n} × $${c} = $${x}.`)},
  icecream(s){const r=rng(s),sc=ri(r,2,4),k=ri(r,3,9),x=sc*k;return mkq(r,"icecream","4.NBT.B.5",`Each cone gets ${sc} scoops. ${k} kids buy cones. How many scoops?`,x,[sc+k,x+sc,x-k],`${k} × ${sc} = ${x} scoops.`)},
  meter(s){const r=rng(s),q=ri(r,2,8),x=15*q;return mkq(r,"meter","4.MD.A.2",`Each quarter buys 15 minutes of parking. How many minutes for ${q} quarters?`,x,[q+15,x+15,x-15],`${q} × 15 = ${x} minutes.`)},
  phone(s){const r=rng(s),d=ri(r,1,3),x=4*d;return mkq(r,"phone","4.MD.A.2",`A call costs 25¢. How many calls can you make with $${d}?`,x,[x+1,d*25,x-1],`$1 = four quarters, so $${d} = ${x} calls.`)},
  gumball(s){const r=rng(s),R=ri(r,1,5),B=ri(r,1,5),Gn=ri(r,1,5),t=R+B+Gn;return mkq(r,"gumball","4.NF.A.1",`The machine has ${R} red, ${B} blue and ${Gn} green gumballs. What fraction are red?`,R+"/"+t,[B+"/"+t,R+"/"+(B+Gn),t+"/"+R,(R+1)+"/"+t],`${R} red out of ${t} gumballs = ${R}/${t}.`)},
  popcorn(s){const r=rng(s),c=ri(r,3,6),n=ri(r,3,8),x=c*n;return mkq(r,"popcorn","4.NBT.B.5",`Each bag holds ${c} cups of popcorn. How many cups fill ${n} bags?`,x,[c+n,x+c,x-n],`${n} × ${c} = ${x} cups.`)},
  skee(s){const r=rng(s),v=[10,20,30,40,50],a=v[ri(r,0,4)],b=v[ri(r,0,4)],c=v[ri(r,0,4)],x=a+b+c;return mkq(r,"skee","4.NBT.B.4",`You roll three balls and score ${a}, ${b} and ${c}. What is your total?`,x,[x+10,x-10,a+b],`${a} + ${b} + ${c} = ${x}.`)},
  jukebox(s){const r=rng(s),m=ri(r,3,5),n=ri(r,3,8),x=m*n;return mkq(r,"jukebox","4.MD.A.2",`Each song is ${m} minutes long. How long do ${n} songs play?`,x+" minutes",[(m+n)+" minutes",(x+m)+" minutes",(x-n)+" minutes"],`${n} × ${m} = ${x} minutes.`)},
  lockers(s){const r=rng(s),st=ri(r,3,9),k=ri(r,5,9),x=st*k;return mkq(r,"lockers","4.OA.C.5",`The lockers are numbered by ${st}s: ${st}, ${2*st}, ${3*st}, … What number is the ${k}th locker?`,x,[x+st,x-st,st+k],`The ${k}th number counting by ${st}s is ${k} × ${st} = ${x}.`)},
  globe(s){const r=rng(s),sp=ri(r,3,9),k=ri(r,3,9),t=sp*k;return mkq(r,"globe","4.NBT.B.6",`The globe spins once every ${sp} seconds. How many spins in ${t} seconds?`,k,[k+1,t-sp,sp],`${t} ÷ ${sp} = ${k} spins.`)},
  change(s){const r=rng(s),a=ri(r,8,19),x=20-a;return mkq(r,"change","4.MD.A.2",`A T-shirt costs $${a}. You pay with a $20 bill. How much change?`,"$"+x,["$"+(x+1),"$"+(a-x),"$"+(x+10)],`$20 − $${a} = $${x}.`)},
  claw(s){const r=rng(s),t=ri(r,2,4),n=ri(r,3,8),x=t*n;return mkq(r,"claw","4.NBT.B.6",`One claw game costs ${t} tokens. You have ${x} tokens. How many games can you play?`,n,[x-t,n+1,t],`${x} ÷ ${t} = ${n} games.`)},
  hoop(s){const r=rng(s),b=ri(r,2,9),c=ri(r,1,5),x=2*b+3*c;return mkq(r,"hoop","4.OA.A.3",`You sink ${b} two-point shots and ${c} three-point shots. How many points?`,x,[b+c,2*b+c,x+2],`${b} × 2 + ${c} × 3 = ${2*b} + ${3*c} = ${x}.`)},
  trophy(s){const r=rng(s),sh=ri(r,2,4),t=ri(r,4,9),x=sh*t;return mkq(r,"trophy","4.NBT.B.5",`The trophy case has ${sh} shelves with ${t} trophies on each. How many trophies?`,x,[sh+t,x+t,x-sh],`${sh} × ${t} = ${x} trophies.`)},
  shoes(s){const r=rng(s),sh=ri(r,3,5),p=ri(r,3,6),x=sh*p*2;return mkq(r,"shoes","4.OA.A.2",`The wall has ${sh} shelves with ${p} pairs of sneakers on each. How many single shoes?`,x,[sh*p,x+2,sh+p],`${sh} × ${p} = ${sh*p} pairs, and ${sh*p} × 2 = ${x} shoes.`)},
  tv(s){const r=rng(s),m=ri(r,2,6)*5,d=ri(r,3,7),x=m*d;return mkq(r,"tv","4.NBT.B.5",`The lunch menu TV shows a ${m}-second ad for each of ${d} meals. How many seconds in all?`,x,[m+d,x+m,x-d],`${d} × ${m} = ${x} seconds.`)}};
Object.assign(UQ.G,G);ENV.qgen=G;
/* ---- placement: avoid colliders and other taps; keep inside the room ---- */
function roomBox(area){if(area==="street")return null;const R=ROOMS[area];return {cx:R.cx,cz:R.cz,w:R.w||RW,d:R.d||RD}}
function isFree(area,wx,wz,hw,hd,self){for(const b of SOL){if(b===self||b.top<.25||b.y0>1.6)continue;if(wx+hw>b.x0&&wx-hw<b.x1&&wz+hd>b.z0&&wz-hd<b.z1)return false}
  for(const t of TAPS){if(Math.hypot(t.x-wx,t.z-wz)<Math.max(hw,hd)+.5&&t.area===area)return false}
  const R=roomBox(area);if(R){if(Math.abs(wx-R.cx)+hw>R.w/2-.15||Math.abs(wz-R.cz)+hd>R.d/2-.15)return false;if(Math.abs(wx-R.cx)<2.2&&wz-R.cz>R.d/2-3)return false}return true}
function findSpot(area,wx,wz,hw,hd){if(isFree(area,wx,wz,hw,hd))return [wx,wz];for(let rad=.25;rad<=3;rad+=.25)for(let a=0;a<16;a++){const x=wx+Math.cos(a/16*Math.PI*2)*rad,z=wz+Math.sin(a/16*Math.PI*2)*rad;if(isFree(area,x,z,hw,hd))return [x,z]}return [wx,wz]}
const RC=new T.Raycaster();function topY(par,wx,wz,fallback){RC.set(new T.Vector3(wx,6,wz),new T.Vector3(0,-1,0));const hits=RC.intersectObject(par,true).filter(h=>h.object.visible&&h.object.isMesh&&!(h.object.userData&&h.object.userData.envProp));return hits.length?hits[0].point.y:fallback}
/* ---- animations ---- */
const ANIM=[];U.anims.push(dt=>{const now=performance.now();for(const a of ANIM){const p=a.p,m=p.m;if(!m||!m.visible)continue;const t=(now-p.t0)/1000;
  if(p.anim==="spin"){m.rotation.y=p.ry+Math.max(0,1-t/2.2)*Math.min(1,t*4)*Math.PI*4*(t<2.2?t/2.2:1)}
  else if(p.anim==="wobble"){m.rotation.z=Math.sin(t*22)*.05*Math.max(0,1-t/1.2)}
  else if(p.anim==="pop"){const k=t<.9?1+Math.sin(t*28)*.03*(1-t/.9):1;m.scale.set(p.sc*k,p.sc*(2-k),p.sc*k)}
  else if(p.anim==="pulse"){const k=t<4?1+Math.abs(Math.sin(t*Math.PI*2.2))*.025:1;m.scale.set(p.sc*k,p.sc*k,p.sc*k)}}});
function play(p){p.t0=performance.now();if(!ANIM.find(a=>a.p===p))ANIM.push({p})}
const tune=(notes,step=.16,type="triangle",vol=.035)=>notes.forEach((f,i)=>setTimeout(()=>ubeep(f,step*.9,type,vol),i*step*1000));
/* ---- the props ---- */
const D=[
 // street (world coords; area "street")
 {n:"hotdog_cart",area:"street",x:-18,z:6.7,ry:Math.PI,h:2.6,anim:"wobble",label:"Press E to buy a hot dog 🌭",act:p=>{tune([523,659,784]);bub("🌭","One hot dog with mustard, coming right up!");return ["🌭","Hot dogs! Can you work out the price?","hotdog"]}},
 {n:"icecream_cart",area:"street",x:24,z:6.7,ry:Math.PI,h:2.5,anim:"wobble",label:"Press E to ring the ice-cream bell 🍦",act:p=>{tune([784,659,784,880,784,659],.14,"sine");bub("🍦","Ding-a-ling! Ice cream!");return ["🍦","Ice cream for everybody! How many scoops?","icecream"]}},
 {n:"news_box",area:"street",x:-6,z:8.1,ry:Math.PI,h:1.45,anim:"pop",label:"Press E to grab a newspaper 📰",act:p=>{ubeep(300,.08,"square",.03);setTimeout(()=>ubeep(220,.1,"square",.03),120);bub("📰","Extra! Extra! Today's headline is a number puzzle.");return ["📰","Read the headline and round the number.","round"]}},
 {n:"payphone",area:"street",x:16,z:8.1,ry:Math.PI,h:2.6,anim:"pop",label:"Press E to pick up the payphone ☎️",act:p=>{ubeep(350,.6,"sine",.03);setTimeout(()=>ubeep(440,.6,"sine",.02),0);setTimeout(()=>tune([697,770,852,941],.12,"square",.02),700);bub("☎️","Dial tone! Beep boop beep… nobody's home.");return ["☎️","A payphone call costs 25¢. How many calls?","phone"]}},
 {n:"parking_meter",area:"street",x:-28,z:5.35,ry:Math.PI,h:1.6,anim:"wobble",label:"Press E to feed the parking meter 🪙",act:p=>{ubeep(900,.05,"square",.03);setTimeout(()=>ubeep(600,.12,"triangle",.03),90);bub("🅿️","Clink! 15 more minutes on the meter.");return ["🪙","Each quarter buys 15 minutes.","meter"]}},
 {n:"parking_meter",area:"street",x:30,z:5.35,ry:Math.PI,h:1.6,anim:"wobble",label:"Press E to feed the parking meter 🪙",act:p=>{ubeep(900,.05,"square",.03);bub("🅿️","Clink! 15 more minutes.");return ["🪙","Each quarter buys 15 minutes.","meter"]}},
 {n:"parking_meter",area:"street",x:-14,z:-5.35,ry:0,h:1.6,anim:"wobble",label:"Press E to feed the parking meter 🪙",act:p=>{ubeep(900,.05,"square",.03);bub("🅿️","Clink! 15 more minutes.");return ["🪙","Each quarter buys 15 minutes.","meter"]}},
 // arcade (room-relative)
 {n:"gumball",area:"arcade",x:-7.9,z:5.6,ry:Math.PI/2,h:1.75,anim:"wobble",label:"Press E to turn the gumball crank 🍬",act:p=>{tune([400,450,500,560],.08,"square",.025);const v=p.m.getWorldPosition(new T.Vector3());upuff(S,v.x,v.y+.9,v.z,6,[0xff3b5c,0x3bb0ff,0x5cdc4a,0xffd23f][Math.floor(Math.random()*4)],1.6,2.2,1.1,.07);bub("🍬","Crank, crank… plink! A gumball rolls out.");return ["🍬","What fraction of the gumballs are red?","gumball"]}},
 {n:"popcorn",area:"arcade",x:7.9,z:5.6,ry:-Math.PI/2,h:2.2,anim:"pop",label:"Press E to pop some popcorn 🍿",act:p=>{const v=p.m.getWorldPosition(new T.Vector3());for(let i=0;i<8;i++)setTimeout(()=>{ubeep(1200+Math.random()*600,.03,"square",.02);upuff(S,v.x,v.y+1.5,v.z,3,0xfff4d0,1.2,2.4,.9,.05)},i*110);bub("🍿","Pop pop pop! Fresh popcorn.");return ["🍿","How many cups of popcorn?","popcorn"]}},
 {n:"skeeball",area:"arcade",x:-4.6,z:-6.0,ry:0,h:2.3,anim:"pulse",label:"Press E to roll a skee-ball 🎳",act:p=>{const sc=[10,20,30,40,50][Math.floor(Math.random()*5)];ubeep(160,.5,"triangle",.04,120);setTimeout(()=>tune([660,880,1100],.1,"square",.03),600);bub("🎳",`Rolling… thunk! ${sc} points!`);return ["🎳","Add up three rolls!","skee"]}},
 {n:"jukebox",area:"arcade",x:4.8,z:-6.9,ry:0,h:2.1,anim:"pulse",label:"Press E to play the jukebox 🎵",act:p=>{tune([392,494,587,494,659,587,494,392],.2,"triangle",.03);bub("🎵","The jukebox plays an old-school tune!");return ["🎵","How long do the songs play?","jukebox"]}},
 // school
 {n:"teacher_desk",area:"school",x:0,z:-5.6,ry:0,h:1.35,anim:"wobble",replaceDesk:true,label:"Press E to check Ms. Okafor's desk 🍎",act:p=>{ubeep(500,.1,"sine",.03);bub("🍎","An apple, a stack of graded tests and a clock. Ms. Okafor runs a tight schedule!");return ["🕒","Ms. Okafor's desk clock has a question.","clock"]}},
 {n:"globe",area:"school",x:1.15,z:-5.75,ry:0,h:.55,onTop:true,anim:"spin",label:"Press E to spin the globe 🌍",act:p=>{ubeep(300,.6,"sine",.03,300);bub("🌍","Whirr! Round and round goes the world.");return ["🌍","How many spins?","globe"]}},
 {n:"bookcase",area:"school",x:-8.55,z:-5.2,ry:Math.PI/2,h:2.0,anim:"wobble",label:"Press E to pull a book off the shelf 📚",act:p=>{ubeep(260,.08,"triangle",.03);bub("📚","You found a book about the subway map!");return ["📚","Count the books on the shelves.","books"]}},
 {n:"backpack",area:"school",x:-6.6,z:5.4,ry:.4,h:.7,anim:"pop",label:"Press E to peek in the backpack 🎒",act:p=>{ubeep(420,.1,"square",.02,-100);bub("🎒","A lunchbox, crayons and a pack of pencils to share.");return ["🎒","Share the pencils fairly!","share"]}},
 {n:"lockers",area:"gym",x:-10.3,z:-6,ry:Math.PI/2,h:2.3,anim:"wobble",label:"Press E to open a locker 🔐",act:p=>{ubeep(700,.05,"square",.03);setTimeout(()=>ubeep(180,.18,"sawtooth",.03),120);bub("🔐","Clang! Somebody left a math note taped inside.");return ["🔐","Locker numbers follow a pattern.","lockers"]}},
 {n:"lockers",area:"gym",x:-10.3,z:-1.5,ry:Math.PI/2,h:2.3,anim:"wobble",label:"Press E to open a locker 🔐",act:p=>{ubeep(700,.05,"square",.03);setTimeout(()=>ubeep(180,.18,"sawtooth",.03),120);bub("🔐","Clang! Gym socks. Phew!");return ["🔐","Locker numbers follow a pattern.","lockers"]}},
 {n:"backpack",area:"hallway",x:-3.6,z:1.6,ry:1.2,h:.7,anim:"pop",label:"Press E to peek in the backpack 🎒",act:p=>{ubeep(420,.1,"square",.02,-100);bub("🎒","Somebody forgot their backpack. There's a lost-and-found sticker on it.");return null}},
 {n:"couch",area:"lobby",x:-7.9,z:2.2,ry:Math.PI/2,h:1.15,anim:"pop",label:"Press E to sit on the lobby couch 🛋️",act:p=>{ubeep(200,.2,"sine",.03,-60);bub("🛋️","Ahh, comfy. Waiting for the bell…");return null}},
 {n:"fridge",area:"cafeteria",x:-9.6,z:-8.6,ry:0,h:2.3,anim:"wobble",label:"Press E to open the milk fridge 🥛",act:p=>{ubeep(150,.4,"sawtooth",.015);const v=p.m.getWorldPosition(new T.Vector3());upuff(S,v.x,v.y+1.2,v.z+.6,10,0xdff4ff,1.2,.6,1.2,.06,-.5);bub("🥛","Brrr! Cold milk cartons. Grab one for lunch.");return ["🍇","Share the grapes equally!","share"]}},
 {n:"tv_stand",area:"cafeteria",x:5,z:-8.8,ry:0,h:1.6,anim:"pulse",label:"Press E to check the lunch-menu TV 📺",act:p=>{ubeep(520,.1,"sine",.03);bub("📺","Today's lunch: pizza, tacos and apple slices!");return ["📺","How long is the menu show?","tv"]}},
 // clothing store
 {n:"mannequin",area:"clothing",x:-7.4,z:5.5,ry:Math.PI/2,h:2.3,anim:"spin",label:"Press E to spin the mannequin's outfit 👕",act:p=>{ubeep(500,.2,"triangle",.03,200);bub("👕","Teal jacket + white tee + jeans. Want to try this look? Talk to Mr. Sal!");return ["👕","Outfit math: jacket + hat.","shop"]}},
 {n:"mannequin",area:"clothing",x:7.4,z:5.5,ry:-Math.PI/2,h:2.3,anim:"spin",label:"Press E to spin the mannequin's outfit 👕",act:p=>{ubeep(500,.2,"triangle",.03,200);bub("👕","Fresh fit! Spin, spin.");return ["👕","Outfit math: jacket + hat.","shop"]}},
 {n:"clothes_rack",area:"clothing",x:-5.6,z:-3.2,ry:.3,h:2.0,anim:"wobble",label:"Press E to flip through the rack 👚",act:p=>{for(let i=0;i<5;i++)setTimeout(()=>ubeep(1500+i*80,.03,"square",.015),i*70);bub("👚","Swish, swish… so many colors!");return ["👚","Count the folded shirts.","shirts"]}},
 {n:"register",area:"clothing",x:1.6,z:-5.4,ry:0,h:.5,onTop:true,anim:"pop",label:"Press E to ring the register 💵",act:p=>{tune([1046,1318],.12,"square",.03);bub("💵","Ka-ching! Receipt printed.");return ["💵","Count your change.","change"]}},
 {n:"claw_machine",area:"arcade",x:-7.6,z:1.6,ry:Math.PI/2,h:2.4,anim:"wobble",label:"Press E to play the claw machine 🧸",act:p=>{tune([600,500,400,300],.14,"square",.025);const win=Math.random()<.35;setTimeout(()=>{tune(win?[784,988,1175]:[300,250],.12,"triangle",.03);bub("🧸",win?"You grabbed a plush! It drops into the prize chute.":"So close! The claw slipped.")},700);return ["🧸","How many claw games can you play?","claw"]}},
 {n:"hoop_arcade",area:"arcade",x:7.6,z:1.6,ry:-Math.PI/2,h:2.6,anim:"pulse",label:"Press E to shoot some hoops 🏀",act:p=>{for(let i=0;i<3;i++)setTimeout(()=>{ubeep(140,.12,"sine",.05);setTimeout(()=>ubeep(Math.random()<.6?880:200,.1,"square",.025),220)},i*450);bub("🏀","Swish! Swish! Clank…");return ["🏀","Add up the basketball points!","hoop"]}},
 {n:"photo_booth",area:"arcade",x:-7.2,z:-6.2,ry:Math.PI/2,h:2.6,anim:"pop",label:"Press E to snap a photo-booth picture 📸",act:p=>{cine({look:new T.Vector3(P.x,1.55,P.z),dir:{x:Math.sin(P.yaw||0),z:Math.cos(P.yaw||0)},dist:2.2,h:.1,who:"📸 Photo booth",say:"Say cheese!",dur:2000,tight:true});setTimeout(()=>{ubeep(1800,.05,"square",.03);try{const f=document.createElement("div");f.style.cssText="position:fixed;inset:0;background:#fff;opacity:.85;z-index:2147483003;pointer-events:none;transition:opacity .5s";document.body.appendChild(f);setTimeout(()=>f.style.opacity=0,60);setTimeout(()=>f.remove(),700)}catch(_){}},900);return null}},
 {n:"water_fountain",area:"hallway",x:4.15,z:-8,ry:-Math.PI/2,h:1.3,anim:"pop",label:"Press E to get a drink of water 💧",act:p=>{const v=p.m.getWorldPosition(new T.Vector3());upuff(S,v.x,v.y+1.05,v.z,10,0x6fc8ff,.5,1.2,.8,.035);ubeep(300,.4,"sine",.015,-100);bub("💧","Glug, glug. Ahh, cold water!");return null}},
 {n:"trophy_case",area:"lobby",x:7.9,z:-2,ry:-Math.PI/2,h:1.5,anim:"pop",label:"Press E to look at the school trophies 🏆",act:p=>{tune([523,659,784,1046],.12,"triangle",.03);bub("🏆","Math Bee champions, three years in a row!");return ["🏆","Count the trophies!","trophy"]}},
 {n:"floor_plant",area:"lobby",x:-7.8,z:-6.6,ry:0,h:1.8,anim:"wobble",label:"Press E to water the plant 🪴",act:p=>{ubeep(500,.2,"sine",.015,-200);bub("🪴","The plant perks up. Thanks!");return null}},
 {n:"folded_table",area:"clothing",x:0,z:1.8,ry:0,h:1.25,anim:"pop",label:"Press E to unfold a T-shirt 👕",act:p=>{ubeep(900,.06,"triangle",.02,-300);bub("👕","Ooh, a size Medium with a pizza on it. You fold it back neatly.");return ["👕","Count the folded shirts.","shirts"]}},
 {n:"fitting_room",area:"clothing",x:-7.6,z:-5.6,ry:Math.PI/2,h:2.6,anim:"wobble",label:"Press E to try on clothes in the fitting room 🚪",act:p=>{for(let i=0;i<6;i++)setTimeout(()=>ubeep(2200-i*150,.03,"square",.012),i*40);const v=p.m.getWorldPosition(new T.Vector3());v.y=1.5;cine({look:v,dir:{x:Math.sin(p.d.ry),z:Math.cos(p.d.ry)},dist:3.2,h:.1,who:"🚪 Fitting room",say:"Swish! Let's try something on…",dur:1800});
      setTimeout(()=>{try{W2.salShop=performance.now();parent.postMessage({lv3d:"door",id:"shop"},"*")}catch(_){}},1300);return null}},
 {n:"shoe_shelf",area:"clothing",x:8.4,z:2.2,ry:-Math.PI/2,h:2.2,anim:"wobble",label:"Press E to check out the sneakers 👟",act:p=>{ubeep(1300,.05,"square",.02);setTimeout(()=>ubeep(1500,.05,"square",.02),90);bub("👟","Squeak squeak! Fresh kicks.");return ["👟","How many single shoes on the wall?","shoes"]}},
 {n:"floor_plant",area:"clothing",x:7.8,z:-6.8,ry:0,h:1.6,anim:"wobble",label:"Press E to water the plant 🪴",act:p=>{ubeep(500,.2,"sine",.015,-200);bub("🪴","Fresh and green.");return null}},
 {n:"floor_plant",area:"apartment",x:-8,z:-6.8,ry:0,h:1.8,anim:"wobble",label:"Press E to water Theo's plant 🪴",act:p=>{ubeep(500,.2,"sine",.015,-200);bub("🪴","Theo's plant says thanks!");return null}},
 {n:"mirror",area:"clothing",x:8.3,z:-2.6,ry:-Math.PI/2,h:2.4,anim:"pop",label:"Press E to check your look in the mirror 🪞",act:p=>{const v=p.m.getWorldPosition(new T.Vector3());v.y=1.5;cine({look:new T.Vector3(P.x,1.4,P.z),dir:{x:v.x-P.x,z:v.z-P.z},dist:1.8,h:.2,who:"🪞 Fitting-room mirror",say:"Looking sharp!",dur:2200});ubeep(880,.15,"sine",.03,220);return null}}];
const TOT={};D.forEach(d=>TOT[d.n]=(TOT[d.n]||0)+1);
const TPL={};function tpl(n){return TPL[n]||(TPL[n]=new Promise(res=>GL.load(url(n),g=>{const m=g.scene;m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.userData.envProp=1;/* full 3D model, not a flat card: exempt from the flat-wall audit */o.userData.flatOK=true}});res(m)},undefined,e=>{PR.failed++;PR.err=String(e&&e.message||e);res(null)})))}
function place(d){PR.want++;return tpl(d.n).then(t=>{if(!t)return;const area=d.area,R=area==="street"?{cx:0,cz:0,g:S}:ROOMS[area];if(!R)return;const par=area==="street"?S:R.g;
  const m=t.clone(true),bb=new T.Box3().setFromObject(m),sz=bb.getSize(new T.Vector3()),sc=d.h/Math.max(sz.y,1e-3);
  const inner=new T.Group();inner.add(m);m.scale.setScalar(sc);m.position.set(-(bb.min.x+bb.max.x)/2*sc,-bb.min.y*sc,-(bb.min.z+bb.max.z)/2*sc);
  const hw=sz.x*sc/2,hd=sz.z*sc/2,rot=Math.abs(Math.sin(d.ry||0))>.7,fw=rot?hd:hw,fd=rot?hw:hd;
  let wx=R.cx+d.x,wz=R.cz+d.z,y=area==="street"?.12:0;
  if(d.replaceDesk){const desk=R.g.children.find(o=>{const p=o.isMesh&&o.geometry.parameters;return p&&Math.abs(p.width-3.4)<.01&&Math.abs(p.height-1)<.01&&Math.abs(p.depth-1.4)<.01});
    if(desk){const v=desk.getWorldPosition(new T.Vector3());wx=v.x;wz=v.z;desk.visible=false;PR.deskSwapped=true;
      /* the laptop/plant that sat on the old box desk */ const hide=[];R.g.traverse(o=>{if(o.isMesh&&o!==desk&&!o.userData.envProp){const w=o.getWorldPosition(new T.Vector3());if(Math.abs(w.y-1.0)<.5&&Math.abs(w.x-wx)<1.9&&Math.abs(w.z-wz)<.9&&!(o.geometry&&o.geometry.parameters&&o.geometry.parameters.width>3))hide.push(o)}});
      hide.forEach(o=>o.visible=false);PR.deskHidden=hide.length;
      /* classroom models stream in: sweep again a few times */ const sweep=()=>{let n=0;R.g.traverse(o=>{if(o.isMesh&&o!==desk&&!o.userData.envProp&&o.visible){let q=o,inProp=false;while(q){if(q.userData&&q.userData.envProp){inProp=true;break}q=q.parent}if(inProp)return;const w=o.getWorldPosition(new T.Vector3());if(Math.abs(w.y-1.0)<.4&&Math.abs(w.x-wx)<1.9&&Math.abs(w.z-wz)<.9){o.visible=false;n++}}});PR.deskHidden+=n};[1500,4000,9000].forEach(t=>setTimeout(sweep,t))}
    inner.scale.set(3.4/(sz.x*sc),1,1.4/(sz.z*sc)*.95)}
  else if(d.onTop){y=topY(par,wx,wz,1.0)}
  else{[wx,wz]=findSpot(area,wx,wz,fw+.05,fd+.05);}
  const g=new T.Group();g.add(inner);g.position.set(wx-(par===S?0:par.position.x),y-(par===S?0:par.position.y),wz-(par===S?0:par.position.z));g.rotation.y=d.ry||0;g.name="prop_"+d.n;g.userData.envProp=1;par.add(g);
  if(!d.onTop&&!d.replaceDesk&&d.h>.9)usolid(wx-fw,wx+fw,wz-fd,wz+fd,Math.min(d.h,2.4),y);
  const p={d,m:inner,g,ry:0,sc:1,t0:-1e9,anim:d.anim,area,x:wx,z:wz,y,h:d.h};p.sc=inner.scale.x;if(d.anim==="pop"||d.anim==="pulse")p.sc=1;
  /* tap point: in front of the prop */ const fx=Math.sin(d.ry||0),fz=Math.cos(d.ry||0),off=(d.onTop?.9:fd+.7);const tx=wx+fx*off,tz=wz+fz*off;
  p.tap=utap(area,tx-(R.cx||0),tz-(R.cz||0),d.label,()=>{play(p);let o=null;try{o=d.act(p)}catch(e){PR.err=String(e)}p.used=(p.used||0)+1;if(o){const [em,tx2,kind]=o;setTimeout(()=>uoffer(em,tx2,kind,"prop_"+d.n+"_"+PR.list.indexOf(p)),700)}},1.25);
  p.tx=tx;p.tz=tz;if(area==="street")g.visible=AREA==="street";PR.list.push(p);PR.loaded++;return p})}
const byArea={};D.forEach(d=>(byArea[d.area]=byArea[d.area]||[]).push(d));PR.byArea=byArea;PR.done={};
function loadArea(a){if(PR.done[a]||!byArea[a])return Promise.resolve();PR.done[a]=Promise.all(byArea[a].map(place));return PR.done[a]}
PR.loadArea=loadArea;PR.D=D;
setTimeout(()=>loadArea("street"),1500);
/* perf: street props are hidden while you are inside a room */
let lastA=null;U.anims.push(()=>{if(AREA===lastA)return;lastA=AREA;const on=AREA==="street";PR.list.forEach(p=>{if(p.area==="street")p.g.visible=on})});
U.anims.push(()=>{if(AREA&&byArea[AREA]&&!PR.done[AREA])loadArea(AREA)});
})();
