/* Arcade cabinet math: one grade-4 standard per machine. Every item is {kind,std,lv,text,ans,choices,hint,v}.
   tools/verify_cabinets.js re-reads the TEXT, recomputes the key on its own, and checks there is exactly one right
   choice, 4 different choices, grade-4 number ranges and a reteach hint, so a wrong key can't ship. */
(function(root){"use strict";
function rng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1)),pick=(r,a)=>a[Math.floor(r()*a.length)];
const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,",");
const usd=c=>"$"+Math.floor(c/100)+"."+String(c%100).padStart(2,"0");
function gcd(a,b){while(b){[a,b]=[b,a%b]}return a}
function shuffle(r,a){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
/* choices: the key + distinct wrong options that pass ok(); fills with nearby values if a misconception repeats */
function four(r,ans,wrongs,show,ok0,near){const ok=w=>ok0(w)&&(typeof w!=="number"||w<=1e6);const seen=new Set([show(ans)]),out=[show(ans)];
  for(const w of wrongs){if(out.length>=4)break;if(w==null||!ok(w))continue;const s=show(w);if(!seen.has(s)){seen.add(s);out.push(s)}}
  let k=0;while(out.length<4&&k<400){k++;const w=near(k);if(w==null||!ok(w))continue;const s=show(w);if(!seen.has(s)){seen.add(s);out.push(s)}}
  return shuffle(r,out)}
const KINDS={
  mult:{std:"4.NBT.B.5",name:"Multiply",sk:"mult"},
  div:{std:"4.NBT.B.6",name:"Divide with remainders",sk:"divide"},
  place:{std:"4.NBT.A.2–3",name:"Place value & rounding",sk:"placevalue"},
  meas:{std:"4.MD.A.1",name:"Measurement conversions",sk:null},
  money:{std:"4.MD.A.2",name:"Money word problems",sk:"multistep"},
  frac:{std:"4.NF.A.2 · 4.NF.B.3",name:"Fractions",sk:"fractions"},
  addsub:{std:"4.NBT.B.4",name:"Add & subtract big numbers",sk:"addsub"},
  cmp:{std:"4.OA.A.2",name:"Times as many",sk:"groups"},
  factor:{std:"4.OA.B.4",name:"Factors & multiples",sk:"factors"}};
/* add or subtract without regrouping (the most common slip) */
function noCarryAdd(a,b){let s=0,p=1;while(a||b){s+=((a%10+b%10)%10)*p;a=Math.floor(a/10);b=Math.floor(b/10);p*=10}return s}
function noBorrowSub(a,b){let s=0,p=1;while(a||b){s+=Math.abs(a%10-b%10)*p;a=Math.floor(a/10);b=Math.floor(b/10);p*=10}return s}
const G={
mult(r,lv){let a,b;if(lv===1){a=ri(r,12,99);b=ri(r,3,9)}else if(lv===2){a=ri(r,102,999);b=ri(r,3,9)}else if(r()<.5){a=ri(r,1012,9999);b=ri(r,2,9)}else{a=ri(r,12,99);b=ri(r,12,99)}
  const ans=a*b,t=Math.floor(a/10)*10,o=a%10;
  const hint=b<10?`Break ${fmt(a)} apart by place value: ${fmt(a-o)} × ${b} = ${fmt((a-o)*b)}, then ${o} × ${b} = ${o*b}. Add the parts.`
    :`Use an area model: ${a} × ${b} = ${a} × ${Math.floor(b/10)*10} + ${a} × ${b%10}. Add the two partial products.`;
  const wr=[ans+10,ans-10,ans+b,ans-b,(a-o)*b+o,ans+100,ans-100,a+b,b<10?(t*b+o*b-Math.floor(o*b/10)*10):a*(b%10)+a*Math.floor(b/10)];
  return {text:`${fmt(a)} × ${b} = ?`,ans:fmt(ans),choices:four(r,ans,wr,fmt,w=>w>0&&w!==ans,k=>ans+(k%2?1:-1)*10*Math.ceil(k/2)),hint,v:{a,b}}},
div(r,lv){const d=ri(r,lv===1?2:3,9),q=lv===1?ri(r,4,12):lv===2?ri(r,12,99):ri(r,100,999),rem=r()<.15?0:ri(r,1,d-1),n=q*d+rem;
  const show=x=>x[0]+" R "+x[1],ok=x=>x[0]>0&&x[1]>=0&&!(x[0]===q&&x[1]===rem);
  const wr=[[q-1,rem+d],[q,rem+1<d?rem+1:rem-1],[q+1,rem],[rem,q<d?q:rem+2],[q,0],[q-1,rem]];
  const hint=`Think ${d} × ? ≤ ${fmt(n)}. ${d} × ${fmt(q)} = ${fmt(q*d)}, and ${fmt(n)} − ${fmt(q*d)} = ${rem} left over. The remainder must be less than ${d}.`;
  return {text:`${fmt(n)} ÷ ${d} = ?`,ans:show([q,rem]),choices:four(r,[q,rem],wr,show,ok,k=>[q+(k%2?1:-1)*Math.ceil(k/2),rem]),hint,v:{n,d}}},
place(r,lv){const n=lv===1?ri(r,1000,9999):lv===2?ri(r,10000,99999):ri(r,100000,999999),s=String(n),mode=lv===1?pick(r,["value","value","expanded"]):pick(r,["value","round","expanded","round"]);
  const PL=["ones","tens","hundreds","thousands","ten thousands","hundred thousands"];
  if(mode==="value"){const nz=[...Array(s.length-1)].map((_,k)=>k+1).filter(k=>s[s.length-1-k]!=="0");const i=pick(r,nz);const dgt=+s[s.length-1-i],ans=dgt*10**i;
    const wr=[dgt,dgt*10**(i+1),dgt*10**Math.max(0,i-1),ans*100];
    return {text:`In ${fmt(n)}, what is the value of the ${dgt} in the ${PL[i]} place?`,ans:fmt(ans),choices:four(r,ans,wr,fmt,w=>w>0&&w!==ans,k=>dgt*10**((i+k)%6)),hint:`The ${dgt} is in the ${PL[i]} place, so it is worth ${dgt} × ${fmt(10**i)} = ${fmt(ans)}.`,v:{n,i}}}
  if(mode==="round"){const i=ri(r,2,Math.min(4,s.length-1)),p=10**i,ans=Math.round(n/p)*p,down=Math.floor(n/p)*p,up=down+p;
    const wr=[ans===down?up:down,Math.round(n/(p/10))*(p/10),Math.round(n/(p*10))*(p*10),ans+p*(ans===up?1:-1)];
    return {text:`Round ${fmt(n)} to the nearest ${PL[i].replace(/s$/,"")}.`,ans:fmt(ans),choices:four(r,ans,wr,fmt,w=>w>0&&w!==ans,k=>ans+p*(k%2?1:-1)*Math.ceil(k/2)),
      hint:`Look at the digit to the right of the ${PL[i]} place: ${Math.floor(n/(p/10))%10}. 5 or more rounds up, 4 or less stays. ${fmt(n)} is between ${fmt(down)} and ${fmt(up)}.`,v:{n,p}}}
  const parts=[...s].map((c,j)=>+c*10**(s.length-1-j)).filter(x=>x>0),ans=n;if(parts.length<3)return G.place(r,lv);
  const wr=[+[...s].reverse().join("")||n+1,n+9*10**(s.length-2),n-(+s[1]||1)*10**(s.length-2)+1*10**(s.length-1),Math.floor(n/10)];
  return {text:`${parts.map(fmt).join(" + ")} = ?`,ans:fmt(ans),choices:four(r,ans,wr,fmt,w=>w>0&&w!==ans,k=>n+(k%2?1:-1)*10**(k%4+1)),hint:`Put each part in its place: the biggest part sets the first digit, and any place with no part gets a 0.`,v:{parts}}},
meas(r,lv){const U=[["feet","inches",12],["yards","feet",3],["meters","centimeters",100],["kilometers","meters",1000],["kilograms","grams",1000],["liters","milliliters",1000],["hours","minutes",60],["minutes","seconds",60],["pounds","ounces",16],["days","hours",24]];
  const [big,small,f]=lv===1?pick(r,U.filter(u=>u[2]<=24)):pick(r,U),n=ri(r,2,lv===3?15:9),ans=n*f;
  const wr=[n*10,n*100,n+f,ans+f,ans-f,n*1000,f];
  return {text:`How many ${small} are in ${n} ${big}?`,ans:fmt(ans),choices:four(r,ans,wr,fmt,w=>w>0&&w!==ans,k=>ans+f*(k%2?1:-1)*Math.ceil(k/2)),hint:`1 ${big.replace(/s$/,"").replace(/^feet$/,"foot")} = ${f} ${small}. So ${n} ${big} = ${n} × ${f} = ${fmt(ans)} ${small}.`,v:{n,f}}},
money(r,lv){const item=pick(r,["slime tubs","candy bags","squishy toys","game tokens","fidget spinners"]),n=ri(r,2,lv===1?4:6),p=lv===1?ri(r,1,12)*25:ri(r,3,60)*5,tot=n*p;
  if(lv===1||r()<.4){const wr=[tot+p,tot-p,n+p,p*(n+1),tot+100,tot-25];return {text:`${n} ${item} cost ${usd(p)} each. What is the total?`,ans:usd(tot),choices:four(r,tot,wr,usd,w=>w>0&&w!==tot,k=>tot+(k%2?1:-1)*5*k),hint:`Multiply: ${n} × ${usd(p)}. Think in cents: ${n} × ${p}¢ = ${tot}¢ = ${usd(tot)}.`,v:{n,p}}}
  const bill=[500,1000,2000].find(b=>b>tot)||2000;if(bill<=tot)return G.money(r,1);const ans=bill-tot;
  const wr=[tot,ans+p,ans-p,bill-p,ans+100,ans-100];
  return {text:`You buy ${n} ${item} at ${usd(p)} each and pay with a ${usd(bill)} bill. How much change do you get?`,ans:usd(ans),choices:four(r,ans,wr,usd,w=>w>0&&w!==ans,k=>ans+(k%2?1:-1)*5*k),hint:`Two steps. Total: ${n} × ${usd(p)} = ${usd(tot)}. Change: ${usd(bill)} − ${usd(tot)} = ${usd(ans)}.`,v:{n,p,bill}}},
frac(r,lv){const D=[2,3,4,5,6,8,10,12];
  if(lv===1||(lv===2&&r()<.5)){const d=pick(r,D.filter(x=>x>=4)),a=ri(r,1,d-2),b=ri(r,1,d-1-a),ans=(a+b)+"/"+d;
    const wr=[(a+b)+"/"+(d+d),a+"/"+d,(a+b+1)+"/"+d,(a*b)+"/"+d,(a+b-1)+"/"+d,b+"/"+(d)];
    const ok=w=>{const m=/^(\d+)\/(\d+)$/.exec(w);if(!m||+m[1]<1)return false;return +m[1]*d!==(a+b)*+m[2]};
    return {text:`${a}/${d} + ${b}/${d} = ?`,ans,choices:four(r,ans,wr,x=>x,ok,k=>(a+b+k+1)+"/"+d),hint:`Same-size pieces: add the tops and keep the bottom. ${a} + ${b} = ${a+b} pieces of size 1/${d}, so ${a+b}/${d}.`,v:{a,b,d}}}
  /* which is the greatest? benchmark 1/2, same numerator, or common denominator */
  for(let tries=0;tries<200;tries++){const fs=[];const seen=new Set();while(fs.length<4){const d=pick(r,D),n=ri(r,1,d-1);const key=n/d;if(seen.has(key))continue;seen.add(key);fs.push([n,d])}
    const best=fs.reduce((m,f)=>f[0]*m[1]>m[0]*f[1]?f:m);const ans=best[0]+"/"+best[1];
    return {text:"Which fraction is the GREATEST?",ans,choices:shuffle(r,fs.map(f=>f[0]+"/"+f[1])),hint:`Compare each one to 1/2, or rename them with the same denominator. ${ans} is the closest to a whole.`,v:{fs}}}},
addsub(r,lv){const big=lv===1?[100,999]:lv===2?[1000,9999]:[10000,99999];let a=ri(r,...big),b=ri(r,...big);
  if(r()<.5){const ans=a+b,wr=[noCarryAdd(a,b),ans+10,ans-10,ans+100,ans-100,ans+1000];return {text:`${fmt(a)} + ${fmt(b)} = ?`,ans:fmt(ans),choices:four(r,ans,wr,fmt,w=>w>0&&w!==ans,k=>ans+(k%2?1:-1)*10**(k%3+1)),hint:`Line up the places. Add ones, tens, hundreds… When a column makes 10 or more, regroup 1 to the next place.`,v:{a,b,op:"+"}}}
  if(a<b)[a,b]=[b,a];if(a===b)a+=ri(r,10,90);const ans=a-b,wr=[noBorrowSub(a,b),ans+10,ans-10,ans+100,ans-100,a+b];
  return {text:`${fmt(a)} − ${fmt(b)} = ?`,ans:fmt(ans),choices:four(r,ans,wr,fmt,w=>w>=0&&w!==ans,k=>ans+(k%2?1:-1)*10**(k%3+1)),hint:`Line up the places and start with the ones. If the top digit is smaller, regroup: trade 1 from the next place for 10. Never just flip the digits.`,v:{a,b,op:"-"}}},
cmp(r,lv){const t=pick(r,["Team Blue","Team Red"]),o=t==="Team Blue"?"Team Red":"Team Blue",x=ri(r,2,lv===1?9:12),k=ri(r,2,lv===1?5:9),ans=x*k;
  if(lv===1||r()<.55){const wr=[x+k,ans+x,ans-x,ans+k,x*(k+1)];return {text:`${t} scored ${x} goals. ${o} scored ${k} times as many. How many goals did ${o} score?`,ans:fmt(ans),choices:four(r,ans,wr,fmt,w=>w>0&&w!==ans,kk=>ans+(kk%2?1:-1)*kk),hint:`"${k} times as many" means multiply: ${k} × ${x} = ${ans}. Adding ${k} would be "${k} more", not "${k} times as many".`,v:{x,k,dir:"times"}}}
  const wr=[ans-k,ans+k,ans*k,x+1,x-1,k];return {text:`${o} scored ${ans} goals. That is ${k} times as many as ${t}. How many goals did ${t} score?`,ans:fmt(x),choices:four(r,x,wr,fmt,w=>w>0&&w!==x,kk=>x+kk),hint:`${ans} is ${k} times as many as ${t}'s score, so ${k} × ? = ${ans}. Divide: ${ans} ÷ ${k} = ${x}.`,v:{x,k,dir:"div"}}},
factor(r,lv){const mode=lv===1?pick(r,["factor","multiple"]):pick(r,["factor","multiple","prime","factor"]);const all=[...Array(98)].map((_,i)=>i+2);
  const isP=n=>{if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true};
  if(mode==="prime"){const P=all.filter(isP),C=all.filter(n=>!isP(n)&&n<60);const ans=pick(r,P.filter(n=>n<60));const ws=shuffle(r,C.filter(n=>n%2===1||n%3===0)).slice(0,3);
    return {text:"Which number is PRIME?",ans:String(ans),choices:shuffle(r,[String(ans),...ws.map(String)]),hint:`A prime number has exactly two factors: 1 and itself. Try dividing by 2, 3, 5 and 7. ${ans} only splits as 1 × ${ans}.`,v:{mode}}}
  if(mode==="factor"){const n=pick(r,[12,16,18,20,24,28,30,32,36,40,42,45,48,54,56,60,63,64,72,80,84,90,96]);const F=all.filter(d=>d<n&&n%d===0&&d>1),NF=all.filter(d=>d<n&&n%d!==0&&d<=20);const ans=pick(r,F);
    return {text:`Which number is a factor of ${n}?`,ans:String(ans),choices:shuffle(r,[String(ans),...shuffle(r,NF).slice(0,3).map(String)]),hint:`A factor divides ${n} with nothing left over. ${ans} × ${n/ans} = ${n}, so ${ans} is a factor.`,v:{mode,n}}}
  const m=ri(r,3,9),ans=m*ri(r,3,11),ws=shuffle(r,all.filter(x=>x%m!==0&&Math.abs(x-ans)<20)).slice(0,3);
  return {text:`Which number is a multiple of ${m}?`,ans:String(ans),choices:shuffle(r,[String(ans),...ws.map(String)]),hint:`Multiples of ${m} are in its times table: ${m}, ${2*m}, ${3*m}… ${ans} = ${m} × ${ans/m}.`,v:{mode,m}}}};
function make(kind,lv,r){lv=Math.max(1,Math.min(3,lv|0||1));const it=G[kind](r||Math.random,lv);return Object.assign({kind,std:KINDS[kind].std,lv},it)}
/* XP wager for claw games: stake 5/10/25, never more than a quarter of current XP, never below 0 */
const STAKES=[5,10,25];
function maxStake(xp){return Math.floor(Math.max(0,xp|0)/4)}
function stakeOK(xp,s){return s===0||(STAKES.includes(s)&&s<=maxStake(xp))}
function settle(xp,s,correct){xp=Math.max(0,xp|0);if(!stakeOK(xp,s))s=0;const delta=s===0?(correct?2:0):(correct?2*s:-Math.min(s,xp));return {delta,after:Math.max(0,xp+delta),stake:s}}
const API={KINDS,make,rng,fmt,usd,STAKES,maxStake,stakeOK,settle,_:{noCarryAdd,noBorrowSub}};
if(typeof module!=="undefined")module.exports=API;else root.CABQ=API;
})(typeof window!=="undefined"?window:this);
