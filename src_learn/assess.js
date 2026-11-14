/* LevelUp Assess: i-Ready-style adaptive diagnostic engine (pure JS, no DOM; node + browser).
   - adaptive per-skill bracketing (3-6 items/skill, Bayesian stopping rule) with prerequisite-informed starting levels
   - multiple formats: multiple choice, numeric entry, fraction entry, array build (drag), word problems
   - prerequisite-gap detection over a skill dependency graph
   - misconception identification from tagged distractors
   - instructional starting point per skill + overall scale score
   - periodic reassessment schedule and growth history */
(function(root){
const PREREQ={placevalue:[],groups:[],rounding:["placevalue"],addsub:["placevalue"],mult:["groups","placevalue"],divide:["groups","mult"],factors:["groups"],multistep:["addsub","mult","divide"],fractions:["factors","groups"]};
/* misconception codes: distractor explanations are classified into these; order = priority */
const MIS=[
 ["regroup","Regrouping errors",/regroup|carry|borrow|smaller digit/i],
 ["remainder","Interpreting remainders",/remainder|left over|leftover|van|full bag|isn't full/i],
 ["fraction","Fraction size / equivalence",/denominator|equal parts|same-size|Multiply the (top|denominator|numerator)|Adding the same number|bigger pieces|SMALLER parts|common denominator|1\/2/i],
 ["partial","Missing partial product",/partial|forgot|Don't forget|only did/i],
 ["rounding","Rounding rule",/digit to the right|rounds|friendly/i],
 ["factmult","Factors vs multiples",/factor|prime|composite|multiple|Skip-count|Count by/i],
 ["placeval","Place-value slips",/place|zero|the 0|TENS|digits|SMALLER|6 digits/i],
 ["addmult","Adds instead of multiplying",/\d+ \+ \d+\.|not add|means multiply|multiply first|Multiply the packs|Equal groups/i],
 ["onestep","Stops after one step",/step 1 only|only step|first step|one step|Add the \d+ extra|that's only/i],
 ["wrongop","Wrong operation in a step",/subtract|Taken|taken|more than|together|whole day|only the|undoes|Divide|divide|Share|sharing/i],
 ["count","Counting groups / checking",/too many|short|Count the|times as many|Check:|Check the size|one bag|bag/i]];
function misCode(why){if(!why)return null;for(const [id,,re] of MIS)if(re.test(why))return id;return"other"}
const MISNAME=Object.fromEntries(MIS.map(([id,n])=>[id,n]).concat([["other","Other / unclassified"],["array","Array dimensions"]]));
/* formats */
const isWhole=a=>typeof a==="number"||/^[\d,]+$/.test(String(a));
const isFrac=a=>/^\d+\/\d+$/.test(String(a));
const isWord=q=>q.length>45&&!/☐|^Which (sign|number|fraction)|factors does|^Round |^Write the number/i.test(q)&&/\b(has|have|buys|bought|sold|shares|puts|brings|needs|makes|reads|saves|earns|bags?|boxes|rows|tables|stickers|muffins|pretzels|passes|cupcakes|chairs|bakery|store|class|students?|festival|tickets?|library|theater|trip)\b/i.test(q);
function formatsFor(it){const f=["mc"];if(isWhole(it.a))f.push("num");if(isFrac(it.a))f.push("frac");
  if(it.v&&it.v.op==="mul"&&it.v.x[0]<=10&&it.v.x[1]<=10&&it.v.x[0]*it.v.x[1]<=80)f.push("array");if(isWord(it.q))f.push("word");return f}
/* choose a format for the k-th item of a skill so every skill sees >=2 formats */
function pickFormat(it,k){const f=formatsFor(it);const pref=[["mc"],["num","frac","array"],["array","num","frac"],["mc"],["num","frac"]][k%5];for(const p of pref)if(f.includes(p))return p;return"mc"}
/* item + format for the k-th question of a skill: deterministic by seed (resumable); 4th question is a story problem when one exists */
function chooseItem(LN,sk,lv,k,seed){let it=LN.item(sk,lv,LN.rng(seed)),fmt=pickFormat(it,k);const j=k%5;
  const find=(pred,n,salt)=>{for(let i=0;i<n;i++){const c=LN.item(sk,lv,LN.rng(seed+i*salt+1));if(pred(c))return c}return null};
  if(j===2){const c=formatsFor(it).includes("array")?it:find(c=>formatsFor(c).includes("array"),6,17);if(c)return{it:c,fmt:"array"}}
  if(j===2||j===3){const c=isWord(it.q)?it:find(c=>isWord(c.q),10,31);if(c)return{it:c,fmt:formatsFor(c).includes("num")?"word":"mc"}}
  return{it,fmt}}
function normNum(s){return String(s==null?"":s).replace(/[,\s]/g,"").replace(/^0+(?=\d)/,"")}
function checkEntry(it,fmt,resp){/* returns {ok, why} for typed / built responses */
  if(fmt==="num"){const r=normNum(resp),a=normNum(it.a);if(!/^\d+$/.test(r))return{ok:false,why:null,invalid:true};if(r===a)return{ok:true};const w=it.why&&Object.keys(it.why).find(k=>normNum(k)===r);if(w)return{ok:false,why:it.why[w]};
    /* typed answers: infer common slips */const R=+r,N=+a,op=it.v&&it.v.op;if(N&&(R===N*10||R*10===N||R===N*100||R*100===N))return{ok:false,why:"Place-value slip: the answer is off by a factor of 10.",code:"placeval"};
    if(/^(add|sub|mul)/.test(op||"")&&[10,100,1000,10000].includes(Math.abs(R-N)))return{ok:false,why:"Regrouping slip: one place is off by exactly 1.",code:"regroup"};
    if(op==="mul"&&it.v.x&&R===it.v.x[0]+it.v.x[1])return{ok:false,why:"Adds instead of multiplying.",code:"addmult"};return{ok:false,why:null}}
  if(fmt==="frac"){const m=String(resp).replace(/\s/g,"").match(/^(\d+)\/(\d+)$/);if(!m)return{ok:false,invalid:true};const r=`${+m[1]}/${+m[2]}`;if(r===String(it.a))return{ok:true};const am=String(it.a).match(/^(\d+)\/(\d+)$/);if(it.v&&it.v.op==="frac"&&am&&+m[2]>0&&+m[1]*+am[2]===+am[1]*+m[2])return{ok:true,note:"equivalent form"};const w=it.why&&it.why[r];return{ok:false,why:w||null}}
  if(fmt==="array"){const [k,n]=it.v.x,{rows,cols}=resp||{};if(rows*cols===k*n&&((rows===k&&cols===n)||(rows===n&&cols===k)))return{ok:true};
    if(rows*cols===k*n)return{ok:true,note:"other factor pair"};return{ok:false,why:rows+cols===k+n?"Adds instead of multiplying: an array is rows × columns.":null,code:rows+cols===k+n?"addmult":"array"}}
  const ok=String(resp)===String(it.a);return{ok,why:ok?null:(it.why&&it.why[String(resp)])||null}}
/* ---------- adaptive bracketing per skill ---------- */
const ORDER=["placevalue","groups","addsub","rounding","mult","factors","divide","fractions","multistep"];
const MIN_ITEMS=3,MAX_ITEMS=6;
function newState(opts){opts=opts||{};return{v:2,t0:Date.now(),order:(opts.order||ORDER).slice(),per:{},n:0,kind:opts.kind||"full",prior:opts.prior||null}}
/* Bayesian bracketing: posterior over ability 0..6 (0 = not yet at L1). P(correct | ability a, level L) = a>=L ? 1-SLIP : GUESS(format) */
const SLIP=.07,GUESS={mc:.25,word:.04,num:.04,frac:.04,array:.05};
function prior(st,sk){/* prerequisite- / history-informed prior */let w=[1,1,1,1,1,1,1];const pri=st.prior&&st.prior[sk];
  const centre=pri?pri:(()=>{let c=null;for(const p of PREREQ[sk]||[]){const q=st.per[p];if(q&&q.done){const e=estimate(q);c=c===null?e:Math.min(c,e)}}return c})();
  if(centre!==null&&centre!==undefined)w=w.map((x,a)=>x*(1+1.2*Math.exp(-((a-centre)**2)/4)));const t=w.reduce((x,y)=>x+y,0);return w.map(x=>x/t)}
function post(st,sk){const p=st.per[sk];let w=prior(st,sk).slice();for(const r of p.asked){const g=GUESS[r.fmt]??.25;w=w.map((x,a)=>x*(a>=r.lv?(r.ok?1-SLIP:SLIP):(r.ok?g:1-g)))}const t=w.reduce((x,y)=>x+y,0)||1;return w.map(x=>x/t)}
function startLevel(st,sk){const w=prior(st,sk);let best=3,bd=9;for(let L=1;L<=6;L++){const m=w.slice(L).reduce((x,y)=>x+y,0);const d=Math.abs(m-.5)+(L===3?-.001:0);if(d<bd){bd=d;best=L}}return best}
function skillNext(st,sk){const p=st.per[sk]||(st.per[sk]={asked:[],done:false});if(p.done)return null;
  if(!p.asked.length)return{sk,lv:startLevel(st,sk),k:0};const w=post(st,sk);let best=3,bd=9;
  for(let L=1;L<=6;L++){const m=w.slice(L).reduce((x,y)=>x+y,0);const rep=p.asked.filter(a=>a.lv===L).length;const d=Math.abs(m-.5)+rep*.04;if(d<bd){bd=d;best=L}}return{sk,lv:best,k:p.asked.length}}
function next(st){for(const sk of st.order){const n=skillNext(st,sk);if(n)return n}return null}
function answer(st,sk,lv,ok,meta){const p=st.per[sk];p.asked.push(Object.assign({lv,ok:!!ok},meta||{}));st.n++;
  const w=post(st,sk),mx=Math.max(...w),n=p.asked.length;p.conf=mx;
  const passes=p.asked.filter(a=>a.ok).map(a=>a.lv),fails=p.asked.filter(a=>!a.ok).map(a=>a.lv);if(passes.length&&fails.length&&Math.max(...passes)>Math.min(...fails))p.conflict=1;
  if(n>=MAX_ITEMS||(n>=MIN_ITEMS&&mx>=.8)||(n>=3&&mx>=.93))p.done=true;return p.done}
function estimate(p,st,sk){if(!p||!p.asked.length)return 0;const w=p._w||null;let ww=w;if(!ww){/* standalone: uniform prior */ww=[1,1,1,1,1,1,1];for(const r of p.asked){const g=GUESS[r.fmt]??.25;ww=ww.map((x,a)=>x*(a>=r.lv?(r.ok?1-SLIP:SLIP):(r.ok?g:1-g)))}}
  let best=0;for(let a=1;a<7;a++)if(ww[a]>ww[best]+1e-12)best=a;return best}
function startPoint(est){return Math.max(1,Math.min(6,est>=6?6:est+1))}
const SCALE=lvls=>Math.round(380+lvls.reduce((a,b)=>a+b,0)/Math.max(1,lvls.length)*30);/* 380 (nothing yet) … 560 (all L6) */
function results(st){const R={skills:{},gaps:[],mis:{},n:st.n,mins:Math.max(1,Math.round((Date.now()-st.t0)/60000))};
  for(const sk of st.order){const p=st.per[sk];if(p)p._w=post(st,sk);const est=estimate(p);const fmts=[...new Set((p&&p.asked||[]).flatMap(a=>a.word&&a.fmt!=="word"?[a.fmt||"mc","word"]:[a.fmt||"mc"]))];
    const misc={};(p&&p.asked||[]).forEach(a=>{if(!a.ok&&a.mis){misc[a.mis]=(misc[a.mis]||0)+1;R.mis[a.mis]=(R.mis[a.mis]||0)+1}});
    R.skills[sk]={est,start:startPoint(est),items:(p&&p.asked.length)||0,correct:(p&&p.asked.filter(a=>a.ok).length)||0,formats:fmts,mis:misc,conflict:(p&&p.conflict)||0,
      confidence:!p?"none":(p.conf||0)>=.8?"high":(p.conf||0)>=.6?"medium":"low",prob:+(p&&p.conf||0).toFixed(2)}}
  /* prerequisite gaps: a low skill whose prerequisite is also low → work on the prerequisite first */
  for(const sk of st.order){const s=R.skills[sk];for(const pq of PREREQ[sk]||[]){const q=R.skills[pq];if(q&&q.est<=2&&s.est<=3)R.gaps.push({skill:sk,prereq:pq,why:`${pq} is a building block for ${sk} and placed at L${q.est}`})}}
  R.unclassified=R.mis.other||0;R.flagged=Object.entries(R.mis).filter(([id,c])=>c>=2&&id!=="other").map(([id,c])=>({id,name:MISNAME[id]||id,count:c})).sort((a,b)=>b.count-a.count);
  R.scale=SCALE(st.order.map(sk=>R.skills[sk].est));return R}
/* path ordering that respects prerequisites: never put a skill ahead of a prerequisite that is far behind */
function pathOrder(m){const ids=ORDER.filter(id=>m[id]);const score=id=>{const x=m[id]||{lv:1};return(x.done?100:0)+x.lv};
  const blocked=id=>(PREREQ[id]||[]).some(p=>m[p]&&!m[p].done&&m[p].lv+1<(m[id]||{lv:1}).lv-0&&m[p].lv<=2);
  return ids.slice().sort((a,b)=>(blocked(a)-blocked(b))||(score(a)-score(b))||(ORDER.indexOf(a)-ORDER.indexOf(b)))}
/* reassessment: every 14 days or every 10 sessions; check-ups use 2 items per skill seeded at current level */
const RE_DAYS=14,RE_SESS=10;
function reassessDue(learn,now){if(!learn||!learn.diag)return{due:false,why:"no placement yet"};now=now||Date.now();const last=learn.diag.t||0,days=(now-last)/864e5,sess=(learn.sessions||0)-(learn.diag.sess||0);
  if(days>=RE_DAYS)return{due:true,why:`${Math.floor(days)} days since last check`};if(sess>=RE_SESS)return{due:true,why:`${sess} sessions since last check`};return{due:false,days:Math.ceil(RE_DAYS-days),sess:RE_SESS-sess}}
function growth(history){if(!history||!history.length)return null;const a=history[0],b=history[history.length-1];const per={};Object.keys(b.place||{}).forEach(sk=>per[sk]=(b.place[sk]||0)-((a.place||{})[sk]||0));
  return{from:a.scale||null,to:b.scale||null,delta:(b.scale||0)-(a.scale||0),per,checks:history.length}}
const API={PREREQ,MIS,MISNAME,misCode,formatsFor,isWord,chooseItem,pickFormat,checkEntry,normNum,ORDER,MIN_ITEMS,MAX_ITEMS,newState,startLevel,next,answer,estimate,post,SLIP,GUESS,startPoint,results,pathOrder,reassessDue,growth,RE_DAYS,RE_SESS,SCALE};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.ASSESS=API})(typeof window!=="undefined"?window:globalThis);
