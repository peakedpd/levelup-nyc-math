/* LevelUp Depth (P4): reasoning prompts, multi-step tasks, strategy comparisons, open-ended responses with a rubric,
   real-world contexts and misconception-triggered intervention missions. Pure JS (node + browser), all math verifiable. */
(function(root){
const fm=n=>Number(n).toLocaleString("en-US");
const R=(r,a,b)=>a+Math.floor(r()*(b-a+1));const pick=(r,a)=>a[Math.floor(r()*a.length)];
function shuffle(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
/* ---------- 1. selected reasoning: "Why does that work?" (one sound strategy + two misconception-based) ---------- */
const WHY={
 mul:[["I multiplied: (number of groups) × (number in each group).","ok"],["I added the two numbers together.","addmult"],["I counted one group and stopped.","count"]],
 div:[["I found the missing factor: groups × ? = total.","ok"],["I subtracted the smaller number from the bigger one.","wrongop"],["I multiplied the two numbers.","wrongop"]],
 add:[["I lined up the place values and regrouped 10 ones as 1 ten when needed.","ok"],["I added the digits without lining up the places.","placeval"],["I wrote down every column sum, even when it was 10 or more.","regroup"]],
 sub:[["I lined up the place values and regrouped from the next place when the top digit was smaller.","ok"],["In each column I took the smaller digit away from the bigger digit.","regroup"],["I added instead of subtracting.","wrongop"]],
 round:[["I looked at the digit just to the right of the rounding place: 5 or more rounds up.","ok"],["I always rounded down.","rounding"],["I looked at the very first digit of the number.","rounding"]],
 digitval:[["The digit's value depends on its place: I multiplied it by its place value.","ok"],["The value of a digit is just the digit.","placeval"],["I counted digits from the left.","placeval"]],
 sum:[["Each part fills one place (thousands, hundreds, tens, ones), so I wrote the digits in order.","ok"],["I wrote the parts side by side.","placeval"],["I added only the biggest parts.","placeval"]],
 cmp:[["I compared the digits from the greatest place to the least.","ok"],["I compared only the last digits.","placeval"],["The number with more 9s is bigger.","placeval"]],
 divrem:[["I found the biggest multiple that fits, then the leftover is the remainder (smaller than the divisor).","ok"],["The remainder can be bigger than the number I divide by.","remainder"],["I ignored what was left over.","remainder"]],
 ceildiv:[["The leftover people still need a seat, so I rounded the quotient UP.","ok"],["I used the quotient and dropped the remainder.","remainder"],["I added the remainder to the quotient.","remainder"]],
 floordiv:[["Only FULL groups count, so I used the quotient and left the remainder out.","ok"],["I rounded up because there was a remainder.","remainder"],["I added the remainder.","remainder"]],
 muladd:[["Step 1: multiply to find the equal groups. Step 2: add the extra.","ok"],["I added all three numbers.","addmult"],["I stopped after multiplying.","onestep"]],
 mulsub:[["Step 1: multiply to find the total. Step 2: subtract the part that is gone.","ok"],["I stopped after multiplying.","onestep"],["I added the last number instead of subtracting.","wrongop"]],
 factor:[["A factor divides the number evenly, with no remainder.","ok"],["A factor is any number you reach by skip-counting.","factmult"],["Any smaller number is a factor.","factmult"]],
 multiple:[["A multiple is in the number's skip-count list (k × 1, k × 2, …).","ok"],["A multiple divides into the number.","factmult"],["Any bigger number is a multiple.","factmult"]],
 notfactor:[["It leaves a remainder when I divide, so it is not a factor.","ok"],["It is odd, so it can't be a factor.","factmult"],["It is the biggest choice.","factmult"]],
 nfactors:[["I listed factor pairs (1 × N, 2 × …) until they repeated.","ok"],["I counted only the numbers smaller than 10.","factmult"],["I counted the multiples.","factmult"]],
 prime:[["A prime has exactly two factors: 1 and itself.","ok"],["All odd numbers are prime.","factmult"],["A prime ends in 1, 3, 7 or 9.","factmult"]],
 frac:[["The bottom number counts the equal parts; the top counts the shaded parts.","ok"],["I put the unshaded parts on the bottom.","fraction"],["I wrote shaded over unshaded.","fraction"]],
 equiv:[["I multiplied the top and bottom by the same number.","ok"],["I added the same number to the top and bottom.","fraction"],["I only changed the bottom number.","fraction"]],
 fcmp:[["I made a common denominator (or compared same-size parts) before comparing.","ok"],["The bigger denominator always means the bigger fraction.","fraction"],["I compared only the top numbers.","fraction"]],
 equivpick:[["Equivalent fractions are the same amount: top and bottom multiplied by the same number.","ok"],["I added the same number to the top and bottom.","fraction"],["I picked the fraction with the biggest numbers.","fraction"]]};
function reasoning(it,r){r=r||Math.random;const w=WHY[it&&it.v&&it.v.op];if(!w)return null;return{prompt:"Why does your answer work? Pick the reason that matches what you did.",options:shuffle(r,w.map(([t,c])=>({t,ok:c==="ok",code:c==="ok"?null:c})))}}
/* ---------- 2. multi-step real-world tasks (3 steps) ---------- */
const CTX=["budget","recipe","sports","garden","fieldtrip"];
function multiStep(lv,r,kind){const t=multiStep0(lv,r,kind);t.steps.forEach(st=>{st.mis=(st.mis||[]).filter(([v])=>v>0&&v!==st.ans)});return t}
function multiStep0(lv,r,kind){r=r||Math.random;lv=Math.max(1,Math.min(6,lv|0));const big=lv>=4;const k=kind||pick(r,CTX);
  if(k==="budget"){const n=R(r,3,big?9:6),p=R(r,big?12:3,big?48:9),tot=n*p,bill=(Math.ceil(tot/10)+R(r,1,big?6:3))*10,ch0=bill-tot,bill2=ch0===tot?bill+10:bill,ch=bill2-tot,f=R(r,2,4),save=ch*f;
    return{k,title:"School Store Budget",text:`Ava buys ${n} notebooks for $${p} each. She pays with $${bill2}. She puts the change in her piggy bank and saves that same amount every week for ${f} weeks.`,
      steps:[{ask:`How much do the ${n} notebooks cost?`,eq:`${n} × $${p} = ?`,ans:tot,mis:[[n+p,"That's adding. Each notebook costs the same, so multiply!"],[tot+p,"That's one notebook too many."]]},
             {ask:`How much change does Ava get from $${bill2}?`,eq:`$${bill2} − $${tot} = ?`,ans:ch,mis:[[bill2+tot,"Paying gives change back, so subtract."],[tot,"That's the cost, not the change."]]},
             {ask:`She saves $${ch} each week for ${f} weeks. How much is that?`,eq:`${f} × $${ch} = ?`,ans:save,mis:[[ch+f,"Saving the same amount each week means multiply."],[ch,"That's only one week."]]}]}}
  if(k==="recipe"){const per=R(r,2,big?9:5),b=R(r,2,big?8:4),tot=per*b,boxes=pick(r,[2,3,4].filter(d=>tot%d===0))||1,each=tot/boxes,extra=R(r,2,big?15:6);
    return{k,title:"Bakery Recipe",text:`One batch of muffins uses ${per} cups of flour. The bakery makes ${b} batches, stores the flour it needs equally in ${boxes} bins, and then buys ${extra} more cups for tomorrow.`,
      steps:[{ask:`How many cups of flour for ${b} batches?`,eq:`${b} × ${per} = ?`,ans:tot,mis:[[b+per,"Each batch needs the same amount: multiply."],[tot-per,"That's one batch short."]]},
             {ask:`Share ${tot} cups equally in ${boxes} bins. How many cups in each bin?`,eq:`${tot} ÷ ${boxes} = ?`,ans:each,mis:[[tot-boxes,"Sharing equally is division."],[tot*boxes,"Sharing makes each part smaller: divide."]]},
             {ask:`They had ${tot} cups and buy ${extra} more. How many cups is that?`,eq:`${tot} + ${extra} = ?`,ans:tot+extra,mis:[[tot-extra,"Buying more means add."],[extra,"Add what they already had."]]}]}}
  if(k==="sports"){const g=R(r,3,big?12:6),pts=R(r,big?11:4,big?39:9),tot=g*pts,bonus=R(r,5,big?60:20),goal=tot+bonus+R(r,big?10:3,big?150:25);
    return{k,title:"Basketball Season",text:`Jordan scores ${pts} points in each of ${g} games, then ${bonus} bonus points at the tournament. Her goal for the season is ${goal} points.`,
      steps:[{ask:`How many points in the ${g} games?`,eq:`${g} × ${pts} = ?`,ans:tot,mis:[[g+pts,"Same points each game: multiply."],[tot+pts,"That's one game too many."]]},
             {ask:`Add the ${bonus} bonus points.`,eq:`${tot} + ${bonus} = ?`,ans:tot+bonus,mis:[[tot-bonus,"Bonus points are extra: add."],[bonus,"Don't forget the game points."]]},
             {ask:`How many more points does she need to reach ${goal}?`,eq:`${goal} − ${tot+bonus} = ?`,ans:goal-tot-bonus,mis:[[goal+tot+bonus,'"How many more" means subtract.'],[tot+bonus,"That's what she has, not what she needs."]]}]}}
  if(k==="garden"){const rows=R(r,3,big?12:6),per=R(r,big?11:3,big?25:8),tot=rows*per,dead=R(r,1,Math.min(9,tot-2)),left=tot-dead,bed=pick(r,[2,3,4,5].filter(d=>left%d===0))||1;
    return{k,title:"Community Garden",text:`A garden has ${rows} rows with ${per} pepper plants in each row. ${dead} plants wilt. The healthy plants are moved equally into ${bed} new beds.`,
      steps:[{ask:"How many plants at the start?",eq:`${rows} × ${per} = ?`,ans:tot,mis:[[rows+per,"Rows of equal plants: multiply."],[tot-per,"One row short."]]},
             {ask:`${dead} wilt. How many are healthy?`,eq:`${tot} − ${dead} = ?`,ans:left,mis:[[tot+dead,"Wilted plants are taken away: subtract."],[dead,"That's the wilted ones."]]},
             {ask:`Share ${left} plants equally in ${bed} beds. How many per bed?`,eq:`${left} ÷ ${bed} = ?`,ans:left/bed,mis:[[left-bed,"Sharing equally is division."],[left,"Divide them among the beds."]]}]}}
  const st=R(r,big?40:13,big?140:40),van=pick(r,[6,7,8,9,10,12]),vans=Math.ceil(st/van),cost=R(r,big?25:5,big?95:20);
  return{k:"fieldtrip",title:"Field Trip",text:`${st} students go to the science museum. Each van holds ${van} students. Each van costs $${cost} to rent.`,
    steps:[{ask:`${st} ÷ ${van}: how many FULL vans, and what's left over? Type the number of full vans.`,eq:`${st} ÷ ${van} = ?${st%van?` R ${st%van}`:""}`,ans:Math.floor(st/van),mis:[[Math.floor(st/van)+1,"That counts a van that isn't full yet."],[st-van,"Sharing into vans is division."]]},
           {ask:`How many vans are needed so EVERY student rides?`,eq:`${Math.floor(st/van)} + ${st%van?1:0} = ?`,ans:vans,mis:st%van?[[Math.floor(st/van),"The leftover students need a van too!"],[vans+1,"That's one van too many."]]:[[vans+1,"No one is left over."],[vans-1,"Too few vans."]]},
           {ask:`Each van costs $${cost}. What is the total cost?`,eq:`${vans} × $${cost} = ?`,ans:vans*cost,mis:[[vans+cost,"Same cost for each van: multiply."],[cost,"That's one van."]]}]}}
function stepChoices(st,r){r=r||Math.random;const c=new Set([st.ans]);const why={};for(const [v,t] of st.mis||[])if(v>0&&v!==st.ans&&!c.has(v)){c.add(v);why[v]=t}
  let d=1;while(c.size<4){const v=st.ans+(d%2?d:-d)*Math.max(1,Math.round(st.ans*.1));if(v>0&&!c.has(v))c.add(v);d++}return{ch:shuffle(r,[...c]),why}}
/* ---------- 3. strategy comparisons ---------- */
function strategies(lv,r,kind){r=r||Math.random;lv=Math.max(1,Math.min(6,lv|0));const k=kind||pick(r,["mult","add","frac"]);
  if(k==="mult"){let a=lv>=4?R(r,12,39):R(r,3,9),b=R(r,lv>=4?12:13,lv>=4?49:39);if(a%10===0)a++;if(b%10===0)b++;const at=a>=10?[Math.floor(a/10)*10,a%10]:[a],bt=[Math.floor(b/10)*10,b%10];
    const parts=[];for(const x of at)for(const y of bt)parts.push([x,y,x*y]);const err=r()<.5;let bad=-1;if(err){bad=R(r,0,parts.length-1);parts[bad]=[parts[bad][0],parts[bad][1],parts[bad][2]+(parts[bad][2]>=100?100:10)]}
    const area=`Split ${a} × ${b} into ${parts.map(p=>`${p[0]} × ${p[1]}`).join(", ")}; boxes: ${parts.map(p=>fm(p[2])).join(" + ")} = ${fm(parts.reduce((s,p)=>s+p[2],0))}`;
    const pp=`${a} × ${bt[0]} = ${fm(a*bt[0])}, ${a} × ${bt[1]} = ${fm(a*bt[1])}; ${fm(a*bt[0])} + ${fm(a*bt[1])} = ${fm(a*b)}`;
    return{k,title:"Strategy Showdown: Area Model vs Partial Products",prob:`${a} × ${b}`,ans:a*b,A:{name:"Area model",work:area,total:parts.reduce((s,p)=>s+p[2],0),steps:parts.map(p=>`${p[0]} × ${p[1]} = ${fm(p[2])}`)},B:{name:"Partial products",work:pp,total:a*b},err:err?"A":null,badStep:bad,
      alike:{q:"How are the two strategies alike?",options:[{t:`Both break ${b} into tens and ones and multiply each part.`,ok:true},{t:"Both add the two numbers first.",ok:false,code:"addmult"},{t:"They use different numbers, so they can't match.",ok:false,code:"partial"}]}}}
  if(k==="add"){const x=lv>=4?R(r,1200,8900):R(r,120,890),y=lv>=4?R(r,1,19)*100+R(r,70,99):R(r,61,99);const ry=Math.ceil(y/100)*100,adj=ry-y;const err=r()<.5;const shown=err?x+ry+adj:x+ry-adj;
    return{k,title:"Strategy Showdown: Standard Algorithm vs Compensation",prob:`${fm(x)} + ${fm(y)}`,ans:x+y,A:{name:"Compensation",work:`Add ${fm(ry)} instead of ${fm(y)}: ${fm(x)} + ${fm(ry)} = ${fm(x+ry)}. Then ${err?"add":"take away"} the extra ${adj}: ${fm(x+ry)} ${err?"+":"−"} ${adj} = ${fm(shown)}`,total:shown,steps:[`${fm(x)} + ${fm(ry)} = ${fm(x+ry)}`,`${fm(x+ry)} ${err?"+":"−"} ${adj} = ${fm(shown)}`]},
      B:{name:"Standard algorithm",work:`Line up places, add ones, tens, hundreds, regroup: ${fm(x)} + ${fm(y)} = ${fm(x+y)}`,total:x+y},err:err?"A":null,badStep:err?1:-1,
      alike:{q:"Why does compensation work?",options:[{t:`Adding ${fm(ry)} adds ${adj} too many, so you take ${adj} back away.`,ok:true},{t:`You can add any round number and keep the answer.`,ok:false,code:"regroup"},{t:"Rounding changes the answer, so it never works exactly.",ok:false,code:"rounding"}]}}}
  const d1=pick(r,[3,4,5,6,8]),n1=R(r,1,d1-1),d2=pick(r,[3,4,5,6,8,10,12].filter(d=>d!==d1)),n2=R(r,1,d2-1);if(n1*d2===n2*d1)return strategies(lv,r,"frac");const cd=d1*d2;const err=r()<.5;
  const gt=n1*d2>n2*d1?">":"<";const half=(n,d)=>2*n>d?"more than 1/2":2*n<d?"less than 1/2":"exactly 1/2";const wrong=gt===">"?"<":">";
  return{k:"frac",title:"Strategy Showdown: Common Denominator vs Benchmark ½",prob:`${n1}/${d1} ☐ ${n2}/${d2}`,ans:gt,A:{name:"Common denominator",work:`${n1}/${d1} = ${n1*d2}/${cd} and ${n2}/${d2} = ${n2*d1}/${cd}, so ${n1}/${d1} ${err?wrong:gt} ${n2}/${d2}`,total:err?wrong:gt,steps:[`${n1}/${d1} = ${n1*d2}/${cd}`,`${n2}/${d2} = ${n2*d1}/${cd}`,`compare ${n1*d2} and ${n2*d1}`]},
    B:{name:"Benchmark ½",work:`${n1}/${d1} is ${half(n1,d1)}; ${n2}/${d2} is ${half(n2,d2)}${half(n1,d1)===half(n2,d2)?" — same side, so use another strategy to finish":""}. Answer: ${n1}/${d1} ${gt} ${n2}/${d2}`,total:gt},err:err?"A":null,badStep:err?2:-1,
    alike:{q:"Why do both strategies need same-size parts or a benchmark?",options:[{t:"You can only compare amounts when the parts are the same size (or compare each to the same benchmark).",ok:true},{t:"The bigger denominator is always bigger.",ok:false,code:"fraction"},{t:"Compare only the numerators.",ok:false,code:"fraction"}]}}}
/* ---------- 4. open-ended responses + rubric (0–3) ---------- */
const OPEN=[
 {id:"story-mul",sk:"groups",make:r=>{const a=R(r,3,9),b=R(r,3,9);return{a,b,prompt:`Write a story problem that ${a} × ${b} would solve. Then solve it.`,key:[a,b,a*b],vocab:/each|every|groups?|rows?|times|in all|altogether|per/i,answer:a*b}}},
 {id:"explain-frac",sk:"fractions",make:r=>{const d1=pick(r,[3,4,5,6]),d2=pick(r,[8,10,12]);return{prompt:`Which is bigger, 1/${d1} or 1/${d2}? Explain how you know.`,key:[d1,d2],vocab:/bigger|smaller|pieces|parts|equal|same size|whole|denominator|split|cut/i,answer:`1/${d1}`}}},
 {id:"explain-rem",sk:"divide",make:r=>{const v=pick(r,[6,8]),st=v*R(r,3,6)+R(r,1,v-1);return{prompt:`${st} students need vans that hold ${v} each. How many vans? Explain what the remainder means.`,key:[st,v,Math.ceil(st/v)],vocab:/left ?over|remainder|extra|still|need|another|one more|full/i,answer:Math.ceil(st/v)}}},
 {id:"explain-round",sk:"rounding",make:r=>{const n=R(r,1001,9899);return{prompt:`Round ${fm(n)} to the nearest hundred and explain which digit helped you decide.`,key:[Math.round(n/100)*100],vocab:/digit|tens|right|5|five|up|down|hundred|place/i,answer:Math.round(n/100)*100}}},
 {id:"error-analysis",sk:"addsub",make:r=>{const a=R(r,301,899),b=R(r,111,a-100);return{prompt:`Kai says ${a} − ${b} = ${a-b+(a%10<b%10?10:100)}. Find his mistake and explain the correct answer.`,key:[a-b],vocab:/regroup|borrow|trade|ten|hundred|smaller|place|column/i,answer:a-b}}}];
function openTask(i,r){r=r||Math.random;const T=typeof i==="number"?OPEN[i%OPEN.length]:pick(r,OPEN);const o=T.make(r);return Object.assign({id:T.id,sk:T.sk},o,{rubric:RUBRIC})}
const RUBRIC=[["0","No response or unrelated."],["1","Shows some math (uses the numbers) but the reasoning or answer is missing or wrong."],["2","Correct answer OR clear reasoning with math vocabulary, but not both."],["3","Correct answer AND clear reasoning that uses math vocabulary and the problem's numbers."]];
function scoreOpen(task,text){const t=String(text||"").trim();if(t.split(/\s+/).filter(Boolean).length<3)return{score:0,why:["too short"]};const nums=(t.match(/\d[\d,]*(\/\d+)?/g)||[]).map(x=>x.replace(/,/g,""));
  const usesNums=(task.key||[]).some(k=>nums.includes(String(k).replace(/,/g,"")));const ans=String(task.answer).replace(/,/g,"");const hasAns=nums.includes(ans)||(typeof task.answer==="string"&&t.replace(/\s/g,"").includes(ans));
  const vocab=task.vocab.test(t);const words=t.split(/\s+/).length>=8;let s=0;const why=[];if(usesNums||vocab){s=1;why.push(usesNums?"uses the numbers":"uses math words")}if((hasAns&&vocab)||(hasAns&&words)||(vocab&&words&&usesNums)){s=2;why.push(hasAns?"correct answer":"clear reasoning")}if(hasAns&&vocab&&words){s=3;why.push("answer + reasoning + vocabulary")}
  return{score:s,why,needsTeacher:true}}
/* ---------- 5. intervention missions triggered by misconceptions ---------- */
const INT={
 regroup:{sk:"addsub",name:"Regrouping Rescue",lesson:["When a column adds to 10 or more, trade 10 ones for 1 ten (or 10 tens for 1 hundred).","When the top digit is smaller, regroup: borrow 1 from the next place. Never flip the digits!"]},
 remainder:{sk:"divide",name:"Remainder Detective",lesson:["The remainder is what's left after making equal groups — it's always smaller than the divisor.","Ask: do leftovers need a spot (round up) or only full groups count (drop it)?"]},
 fraction:{sk:"fractions",name:"Fraction Pizza Lab",lesson:["The denominator tells how many equal parts; more parts means SMALLER pieces.","Equivalent fractions: multiply top and bottom by the SAME number — never add."]},
 partial:{sk:"mult",name:"Area-Model Builder",lesson:["Break the bigger number into tens and ones: 4 × 23 = 4 × 20 + 4 × 3.","Every partial product counts — add them all at the end."]},
 rounding:{sk:"rounding",name:"Rounding Hills",lesson:["Find the rounding place, then look at the digit just to its RIGHT.","5 or more: roll up the hill. 4 or less: roll back down."]},
 factmult:{sk:"factors",name:"Factor Hunt",lesson:["Factors divide a number evenly (they're smaller or equal). Multiples are in the skip-count list (bigger or equal).","Test a factor: divide — no remainder means yes!"]},
 placeval:{sk:"placevalue",name:"Place-Value Garage",lesson:["Each place is 10 times the place to its right.","A digit's VALUE = digit × its place: the 6 in 640 is worth 600."]},
 addmult:{sk:"groups",name:"Array Builder: × vs +",lesson:["Equal groups or 'times as many' means MULTIPLY, not add.","3 bags of 4 is 4 + 4 + 4 = 3 × 4 — not 3 + 4."]},
 onestep:{sk:"multistep",name:"Two-Step Story Mission",lesson:["Big stories hide two questions. Answer the first, then USE that answer.","Ask: does my answer answer the LAST question in the story?"]},
 wrongop:{sk:"multistep",name:"Operation Detective",lesson:["Look for clue words: each/every → multiply, share/equally → divide, left/fewer → subtract, more/total → add.","Check by asking: does my answer make sense in the story?"]},
 count:{sk:"groups",name:"Equal-Groups Check",lesson:["Count the groups first, then how many are in each group.","Check: groups × size = total."]},
 array:{sk:"groups",name:"Array Builder",lesson:["An array is rows × columns: 3 rows of 5 = 15.","Rows and columns multiply — they don't add."]}};
function interventionFor(code){return INT[code]?Object.assign({code},INT[code]):null}
/* repeated misconception in recent practice -> assign (not if one is already open for that code) */
function triggers(log,open,now){now=now||Date.now();const recent=(log||[]).filter(e=>e.mis&&e.src!=="diag"&&now-e.t<14*864e5).slice(-20);const c={};recent.forEach(e=>{const k=e.code||e.mis;c[k]=(c[k]||0)+1});
  const openCodes=new Set((open||[]).filter(x=>x.status!=="completed").map(x=>x.code||x.id));return Object.entries(c).filter(([k,n])=>n>=2&&INT[k]&&!openCodes.has(k)).map(([k])=>k)}
/* pick items whose distractors include the target misconception */
function targetItems(code,LN,A,lv,r,n){r=r||Math.random;n=n||4;const I=INT[code];if(!I)return[];const out=[];const L0=Math.max(1,Math.min(6,lv||2));const lvs=[L0,L0-1,L0+1,L0-2,L0+2,1,2,3,4,5,6].filter((x,i,a)=>x>=1&&x<=6&&a.indexOf(x)===i);for(const L1 of lvs){for(let i=0;i<120&&out.length<n;i++){const it=LN.item(I.sk,L1,LN.rng(Math.floor(r()*1e9)));if(Object.values(it.why||{}).some(w=>A.misCode(w)===code))out.push(it)}if(out.length>=n)break}
  while(out.length<n)out.push(LN.item(I.sk,lv||2,LN.rng(Math.floor(r()*1e9))));return out}
const API={reasoning,WHY,multiStep,stepChoices,CTX,strategies,openTask,OPEN,scoreOpen,RUBRIC,INT,interventionFor,triggers,targetItems};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.DEPTH=API})(typeof window!=="undefined"?window:globalThis);
