/* LevelUp real-life scenes: turn any learn item into real objects a kid can see in the 3D street
   (bags of pretzels, cash bundles, a subway line, theater seats, pizzas...).
   Pure JS (no DOM). The plan is built from the item's raw operands `v`, never by reading the question text,
   so every picture matches the math. Loaded by street3d.html (world2.js draws it) and by
   tools/verify_scenes.js (node), which checks that each plan's objects add up to the item's answer. */
(function(root){
const fmt=n=>Number(n).toLocaleString("en-US");
const num=s=>typeof s==="number"?s:+String(s).replace(/,/g,"");
const digits=N=>String(Math.abs(Math.round(N))).split("").reverse().map(Number);/* ones first */
const PLACE=["ones","tens","hundreds","thousands","ten thousands","hundred thousands"];
const MAXPILE=60,MAXBAGS=10,MAXEACH=12,MAXSEATS=260,MAXCHAIRS=100;
/* the street has these 3D objects: marbles coins tickets tokens books apples hotdogs pretzels bars pencils */
const NOUN={sticker:"tickets",marble:"marbles",pretzel:"pretzels",card:"tickets",apple:"apples",ticket:"tickets",muffin:"apples",
  cookie:"coins",coin:"coins",book:"books",pencil:"pencils",bar:"bars","hot dog":"hotdogs",token:"tokens"};
function kindOf(q,dflt){const L=String(q||"").toLowerCase();for(const k in NOUN)if(L.indexOf(k)>=0)return NOUN[k];return dflt||"marbles"}
const blocks=(N,o)=>Object.assign({k:"blocks",N,d:digits(N)},o||{});
/* a pile of loose things, or base-ten bundles when there are too many to lay out one by one */
const many=(N,kind,o)=>N<=MAXPILE?Object.assign({k:"pile",count:N,kind},o||{}):blocks(N,Object.assign({unit:"stock"},o||{}));
const splitPV=n=>{const d=digits(n),out=[];d.forEach((x,i)=>{if(x)out.push(x*10**i)});return out.reverse()};
const STORY={
 groups:"Every bag holds the same number. Count one bag, then count the bags!",
 placevalue:"This is the corner store stockroom. Crates, boxes, rolls and singles: each place is worth 10 times the one to its right.",
 rounding:"Here's the subway line. Is the train closer to this station or that one?",
 addsub:"Here's the cash drawer: bundles, stacks of bills and coins, one place at a time.",
 mult:"This is the community garden. Each bed is one part of the multiplication.",
 divide:"Share everything equally into the bins. What's left over stays out.",
 factors:"We're setting up chairs for the school show. Can they make equal rows?",
 multistep:"Two steps! Look at everything here before you answer.",
 fractions:"Pizza time! Every slice of a pizza is the same size."};
const TITLE={groups:"Pretzel stand",placevalue:"Stockroom",rounding:"Subway line",addsub:"Cash drawer",mult:"Community garden",divide:"Sharing bins",factors:"School show chairs",multistep:"Two-step job",fractions:"Pizza shop"};
function plan(it){if(!it||!it.v)return null;const v=it.v,sk=it.sk,q=it.q,a=it.a,kind=kindOf(q,sk==="divide"?"apples":sk==="multistep"?"tickets":"pretzels");
  const P={sk,op:v.op,title:TITLE[sk]||"Real-life game",intro:STORY[sk]||"",parts:[]},add=p=>P.parts.push(p);
  const x=v.x||[];
  switch(v.op){
  case"mul":{const[A,B]=x;
    if(sk==="mult"&&A>=10&&B>=10||A*B>999){add({k:"area",x:A,y:B,xs:splitPV(A),ys:splitPV(B)});P.title="Community garden";P.intro="This garden is "+A+" by "+B+". Each bed is one partial product. Find each bed, then add them up.";break}
    if(A<=MAXBAGS&&B<=MAXEACH&&A*B<=MAXPILE){add({k:"bags",n:A,each:B,kind});P.intro=A+" bags with "+B+" in each bag. Count one bag, then count the bags!";break}
    const s=Math.min(A,B),b=Math.max(A,B);if(s<=MAXBAGS){add({k:"bags",n:s,each:b,kind,asBlocks:true});P.title="Delivery bags";P.intro=s+" bags. Each bag has "+b+": tens rolls and singles.";break}
    add({k:"area",x:A,y:B,xs:splitPV(A),ys:splitPV(B)});break}
  case"div":{const[N,d]=x;
    if(sk==="placevalue"){add(blocks(N,{unit:"stock",tag:fmt(N)}));add({k:"sign",text:"10 times smaller = ?"});P.intro="Take this pile and make it 10 times smaller: every crate becomes a box, every box becomes a roll.";break}
    add(many(N,kind,{tag:fmt(N)+" in all"}));add({k:"bins",n:d,label:"Share into "+d});P.intro="Share all "+fmt(N)+" into "+d+" bins, the same in each bin.";break}
  case"divrem":{const[N,d]=x;add(many(N,kind,{tag:fmt(N)+" in all"}));add({k:"bins",n:d,label:"Share into "+d});add({k:"tray",label:"Leftovers"});P.intro="Share "+fmt(N)+" into "+d+" bins. Anything that can't be shared equally goes on the leftover tray.";break}
  case"floordiv":{const[N,d]=x;add(many(N,"pretzels",{tag:fmt(N)+" pretzels"}));add({k:"bags",n:1,each:d,kind:"pretzels",label:"1 full bag = "+d});P.title="Pretzel bags";P.intro="A full bag holds "+d+" pretzels. How many FULL bags can we fill from this pile?";break}
  case"ceildiv":{const[N,d]=x;add(N<=MAXPILE?{k:"kids",n:N,tag:N+" students"}:blocks(N,{unit:"kids",tag:fmt(N)+" students"}));add({k:"van",seats:d,label:"Each van: "+d+" seats"});P.title="Field trip vans";P.intro="Every student needs a seat. Each van has "+d+" seats. How many vans so nobody stays behind?";break}
  case"mulsub":{const[A,B,C]=x;
    if(sk==="multistep"){if(A*B<=MAXSEATS)add({k:"seats",rows:A,cols:B,taken:C});else{add(blocks(A*B,{unit:"stock",tag:A+" rows of "+B}));add({k:"sign",text:fmt(C)+" seats taken"})}P.title="Theater seats";P.intro=A+" rows of "+B+" seats. The red seats are taken. How many are still empty?";break}
    add({k:"pile",count:B,kind:"tickets",tag:"Ana"});if(A*B<=MAXPILE*2)add({k:"bags",n:A,each:B,kind:"tickets",label:"Ben: "+A+" times as many"});else add(blocks(A*B,{unit:"stock",tag:"Ben"}));P.title="Sticker swap";P.intro="Ana has one pile. Ben has "+A+" times as many. How many MORE does Ben have?";break}
  case"muladd":{const[A,B,C]=x;add({k:"bags",n:A,each:B,kind:"tickets",label:A+" packs of "+B});add({k:"pile",count:C,kind:"tickets",tag:C+" more"});P.title="Card collection";P.intro=A+" packs of "+B+" cards, plus "+C+" more loose cards.";break}
  case"digitval":add(blocks(v.N,{unit:"stock",hi:v.pos,tag:fmt(v.N)}));P.intro="This is "+fmt(v.N)+" in the stockroom. The glowing column is the digit we're asking about. What is it worth?";break;
  case"sum":{const N=x.reduce((s,y)=>s+y,0);add(blocks(N,{unit:"stock"}));P.intro="Put the crates, boxes, rolls and singles together. What number do they make?";break}
  case"cmp":{const[A,B]=x;add(blocks(A,{unit:"stock",tag:fmt(A),row:0}));add(blocks(B,{unit:"stock",tag:fmt(B),row:1}));add({k:"sign",text:"Which is bigger? Start from the left."});P.intro="Two stockrooms. Compare the biggest places first.";break}
  case"round":{const p=v.p,lo=Math.floor(v.N/p)*p;add({k:"line",lo,hi:lo+p,at:v.N,p});P.intro="The train is at "+fmt(v.N)+". The stations are "+fmt(lo)+" and "+fmt(lo+p)+". Which station is closer?";break}
  case"add":{const[A,B]=x;add(blocks(A,{unit:"cash",tag:fmt(A),row:0}));add(blocks(B,{unit:"cash",tag:"+ "+fmt(B),row:1}));P.intro="Put both piles of cash together. Ten of anything trades up for one of the next place!";break}
  case"sub":{const[A,B]=x;add(blocks(A,{unit:"cash",tag:fmt(A),row:0}));add({k:"sign",text:"Take away "+fmt(B)});P.intro="Start with "+fmt(A)+" and take away "+fmt(B)+". Break a bundle when you need more of a smaller place.";break}
  case"factor":case"notfactor":case"nfactors":add(v.N<=MAXCHAIRS?{k:"chairs",n:v.N}:blocks(v.N,{unit:"stock"}));P.intro=v.op==="nfactors"?"How many different ways can "+v.N+" chairs make equal rows? Count every factor.":v.N+" chairs. Which number of rows leaves no chair out?";break;
  case"multiple":add({k:"benches",n:2,seats:v.k,label:"Each bench seats "+v.k});P.title="Park benches";P.intro="Each bench seats "+v.k+". Which crowd fills the benches exactly, with no empty seats?";break;
  case"prime":add({k:"piles",vals:(it.ch||[]).map(num)});P.intro="Each pile of chairs has a number on it. Only one pile can't make equal rows (except one long row). That one is prime!";break;
  case"frac":add({k:"pizza",d:v.d,n:v.n});P.intro="This pizza is cut into "+v.d+" equal slices. The slices with pepperoni are the part we're asking about.";break;
  case"equiv":add({k:"pizza",d:v.d,n:v.n});add({k:"pizza",d:v.d*v.k,n:0,unknown:true});P.intro="Same size pizzas. The second one is cut into "+(v.d*v.k)+" slices. How many of its slices cover the same amount?";break;
  case"fcmp":{const[n1,d1,n2,d2]=x;add({k:"pizza",d:d1,n:n1});add({k:"pizza",d:d2,n:n2});add({k:"sign",text:"Which has more pizza?"});P.intro="Two pizzas, the same size. Which one has more pepperoni slices covered?";break}
  case"equivpick":add({k:"pizza",d:v.d,n:v.n});P.intro="Which fraction covers the same amount of pizza as this one?";break;
  default:return null}
  return P}
/* recompute the answer from the plan's own objects (used by tools/verify_scenes.js, and never shown) */
function answerFrom(P,it){if(!P)return null;const p=P.parts,v=it.v;const val=b=>b.d.reduce((s,x,i)=>s+x*10**i,0);
  const amt=b=>b.k==="pile"?b.count:b.k==="kids"?b.n:b.k==="blocks"?val(b):b.k==="bags"?b.n*b.each:b.k==="chairs"?b.n:null;
  switch(P.op){
  case"mul":return p[0].k==="area"?p[0].xs.reduce((s,a)=>s+a,0)*p[0].ys.reduce((s,b)=>s+b,0):p[0].n*p[0].each;
  case"div":return P.sk==="placevalue"?val(p[0])/10:amt(p[0])/p[1].n;
  case"divrem":{const N=amt(p[0]),d=p[1].n;return Math.floor(N/d)+" R "+N%d}
  case"floordiv":return Math.floor(amt(p[0])/p[1].each);
  case"ceildiv":return Math.ceil(amt(p[0])/p[1].seats);
  case"mulsub":return p[0].k==="seats"?p[0].rows*p[0].cols-p[0].taken:P.sk==="multistep"?val(p[0])-v.x[2]:amt(p[1])-amt(p[0]);
  case"muladd":return amt(p[0])+amt(p[1]);
  case"digitval":return p[0].d[p[0].hi]*10**p[0].hi;
  case"sum":return val(p[0]);
  case"cmp":{const A=val(p[0]),B=val(p[1]);return A>B?">":A<B?"<":"="}
  case"round":{const L=p[0];return L.at-L.lo>=L.p/2?L.hi:L.lo}
  case"add":return val(p[0])+val(p[1]);
  case"sub":return val(p[0])-v.x[1];
  case"factor":case"notfactor":case"nfactors":case"multiple":case"prime":return null;/* choice questions: checked by verify_math */
  case"frac":return p[0].n+"/"+p[0].d;
  case"equiv":return p[0].n*p[1].d/p[0].d;
  case"fcmp":{const c=p[0].n*p[1].d-p[1].n*p[0].d;return c>0?">":c<0?"<":"="}
  case"equivpick":return null}
  return null}
/* how many separate 3D things the plan draws (kept small so phones and Chromebooks stay smooth) */
function meshCount(P){return P.parts.reduce((s,b)=>s+(b.k==="pile"?b.count:b.k==="kids"?b.n:b.k==="blocks"?b.d.reduce((t,x)=>t+x,0):b.k==="bags"?b.n*(b.asBlocks?digits(b.each).reduce((t,x)=>t+x,0):b.each)+b.n:b.k==="seats"?b.rows*b.cols:b.k==="chairs"?b.n:b.k==="piles"?b.vals.reduce((t,x)=>t+digits(x).reduce((u,y)=>u+y,0),0):b.k==="pizza"?b.d+1:b.k==="area"?b.xs.length*b.ys.length:b.k==="bins"?b.n:b.k==="line"?14:b.k==="benches"?b.n*(b.seats+1):3),0)}
const api={plan,answerFrom,meshCount,PLACE,digits,fmt,num};
if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.SCENE=api})(typeof window!=="undefined"?window:this);
