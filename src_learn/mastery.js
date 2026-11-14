/* LevelUp Mastery: mastery = independent mathematical understanding (pure JS; node + browser).
   Evidence per attempt: first-attempt correctness, representation (visual / symbolic / typed / story / transfer),
   independence (no hint, no visual tool), source. A level is only passed with:
     - >= 80% first-attempt accuracy over the last 5 attempts at that level
     - correct answers in >= 2 different representations
     - >= 1 independent (no hint, no tool) correct answer
   A skill is only MASTERED after L6 is passed AND a delayed retention check (>= 3 days later) is passed
   AND an unfamiliar-context transfer word problem is solved independently.
   Passed levels get spaced Memory Checks at +3, +7, +21 days; failing one moves the student back.
   Diagnostic retakes never erase practice evidence; they add a placement record and can only schedule a check. */
(function(root){
const DAY=864e5,SPACING=[3,7,21],WIN=5;
function repOf(it,meta){meta=meta||{};if(meta.transfer)return"transfer";if(meta.fmt&&meta.fmt!=="mc")return meta.fmt==="word"?"story":"typed";if(meta.vis)return"visual";
  return /\b(has|have|buys|bags?|boxes|rows|students?|store|class|tickets?|bakery|muffins|cards|seats|van|pretzels|stickers)\b/i.test((it&&it.q)||"")?"story":"symbolic"}
function init(m){m.ev=m.ev||[];m.checks=m.checks||[];return m}
function atLevel(m){return(m.ev||[]).filter(e=>e.lv===m.lv&&e.t>=(m.since||0)&&e.src!=="diag"&&e.src!=="check")}
function criteria(m){const w=atLevel(m).slice(-WIN);const first=w.filter(e=>e.first).length;const reps=new Set(w.filter(e=>e.first).map(e=>e.rep));const ind=w.filter(e=>e.first&&e.ind).length;
  return{n:w.length,firstAcc:w.length?first/w.length:0,reps:reps.size,ind,ready:w.length>=WIN&&first>=4&&reps.size>=2&&ind>=1,struggling:w.length>=4&&w.slice(-4).filter(e=>e.first).length<=1}}
function schedule(m,lv,now,step){m.checks=(m.checks||[]).filter(c=>c.lv!==lv);m.checks.push({lv,at:now+SPACING[Math.min(step||0,SPACING.length-1)]*DAY,step:step||0})}
/* main update for practice / lesson / 3D-mission evidence. returns "up" | "down" | "secure" | "mastered" | null */
function apply(m,e,now){now=now||Date.now();init(m);const ev={t:now,lv:e.lv||m.lv,first:!!e.first,rep:e.rep||"symbolic",ind:!!e.ind,src:e.src||"path",tr:!!e.transfer};m.ev.push(ev);if(m.ev.length>200)m.ev.splice(0,m.ev.length-200);
  m.n=(m.n||0)+1;m.ok=(m.ok||0)+(ev.first?1:0);m.recent=(m.recent||[]).concat(ev.first?1:0).slice(-5);
  if(ev.tr&&ev.first&&ev.ind&&ev.lv>=4)m.transfer=now;
  if(ev.lv!==m.lv)return finishIfReady(m,now);
  const c=criteria(m);
  if(c.ready){if(m.lv<6){schedule(m,m.lv,now,0);m.lv++;m.since=now;m.recent=[];return"up"}if(!m.secure){m.secure=now;schedule(m,6,now,0)}return finishIfReady(m,now)||"secure"}
  if(c.struggling&&m.lv>1&&!m.done){m.lv--;m.since=now;m.recent=[];m.taught=Math.min(m.taught||0,m.lv-1);return"down"}return null}
function finishIfReady(m,now){if(m.done)return null;if(m.secure&&m.retained&&m.retained>m.secure&&m.transfer){m.done=now;return"mastered"}return null}
/* Memory Checks (delayed retention) */
function dueChecks(m,now){now=now||Date.now();return(m.checks||[]).filter(c=>c.at<=now).sort((a,b)=>a.at-b.at)}
function checkResult(m,lv,results,now){/* results: array of {first,ind} for 2 items */now=now||Date.now();init(m);const pass=results.filter(r=>r.first&&r.ind).length;
  results.forEach(r=>m.ev.push({t:now,lv,first:!!r.first,rep:r.rep||"typed",ind:!!r.ind,src:"check"}));const c=(m.checks||[]).find(x=>x.lv===lv)||{step:0};
  if(pass===results.length){if(c.step+1<SPACING.length)schedule(m,lv,now,c.step+1);else m.checks=m.checks.filter(x=>x.lv!==lv);if(lv===6&&m.secure)m.retained=now;return finishIfReady(m,now)||"kept"}
  if(pass===0){/* forgot: go back to that level, lose mastery until re-earned */m.checks=m.checks.filter(x=>x.lv<lv);if(m.lv>lv||m.done){m.lv=lv;m.since=now}m.done=false;if(lv===6){m.secure=null;m.retained=null}schedule(m,lv,now+DAY*0,0);m.checks.find(x=>x.lv===lv).at=now+DAY;return"slipped"}
  schedule(m,lv,now,c.step);m.checks.find(x=>x.lv===lv).at=now+DAY;return"retry"}
/* diagnostic retake: keep evidence, add placement history, never erase mastery; a much lower estimate schedules a check */
function retake(m,est,start,now){now=now||Date.now();init(m);m.diagEv=(m.diagEv||[]).concat([{t:now,est,start}]).slice(-10);
  if(m.done||m.secure){if(est<5){schedule(m,6,now,0);m.checks.find(x=>x.lv===6).at=now}return"kept-mastery"}
  if(start>m.lv){m.lv=start;m.since=now;return"moved-up"}if(start<m.lv-1){schedule(m,m.lv-1,now,0);m.checks.find(x=>x.lv===m.lv-1).at=now;return"check-scheduled"}return"kept"}
function pct(m){if(!m)return 0;if(m.done)return 100;const c=criteria(m);const lvl=(m.lv-1)/6;const within=Math.min(1,c.n/WIN)*.4+c.firstAcc*.3+(Math.min(c.reps,2)/2)*.15+(c.ind?1:0)*.15;return Math.round(Math.min(99,(lvl+within/6*(m.lv===6&&m.secure?1:.95))*100))}
function status(m){if(!m)return"not started";if(m.done)return"mastered";if(m.secure)return!m.retained?"secure — memory check pending":"needs transfer task";return"learning L"+m.lv}
function summary(m){const ev=(m&&m.ev||[]).filter(e=>e.src!=="diag");const f=ev.length?Math.round(ev.filter(e=>e.first).length/ev.length*100):null;const ind=ev.filter(e=>e.ind);
  return{firstTry:f,reps:[...new Set(ev.filter(e=>e.first).map(e=>e.rep))],indAcc:ind.length?Math.round(ind.filter(e=>e.first).length/ind.length*100):null,checksPassed:ev.filter(e=>e.src==="check"&&e.first&&e.ind).length,checksTotal:ev.filter(e=>e.src==="check").length,transfer:!!(m&&m.transfer),status:status(m),next:m&&m.checks&&m.checks.length?Math.min(...m.checks.map(c=>c.at)):null}}
/* ---------- transfer: same math, unfamiliar real-world context (answer and choices unchanged) ---------- */
const f=n=>Number(n).toLocaleString("en-US");
const pick=(a,r)=>a[Math.floor(r()*a.length)];
const T={
 mul:v=>{const [a,b]=v.x;return[`A greenhouse has ${f(a)} trays. Each tray holds ${f(b)} seedlings. How many seedlings are there in all?`,`A science club launches ${f(a)} model rockets. Each rocket uses ${f(b)} grams of fuel. How many grams of fuel is that?`,`A choir stands in ${f(a)} rows with ${f(b)} singers in each row. How many singers are there?`,`A bee visits ${f(b)} flowers every minute. How many flowers does it visit in ${f(a)} minutes?`]},
 div:v=>{const [n,d]=v.x;return[`${f(n)} seed packets are shared equally among ${f(d)} garden boxes. How many packets go in each box?`,`A blue whale is ${f(n)} feet long. That is ${f(d)} times as long as a dolphin. How long is the dolphin?`,`${f(n)} floor tiles are laid in ${f(d)} equal rows. How many tiles are in each row?`,`A rover drives ${f(n)} meters in ${f(d)} equal trips. How many meters is each trip?`]},
 divrem:v=>{const [n,d]=v.x;return[`${f(n)} seeds are planted, ${f(d)} in each pot. How many pots are filled, and how many seeds are left over?`,`A coach splits ${f(n)} players into teams of ${f(d)}. How many full teams are there, and how many players are left over?`]},
 add:v=>{const [a,b]=v.x;return[`A museum had ${f(a)} visitors on Saturday and ${f(b)} visitors on Sunday. How many visitors came in all?`,`A cyclist rides ${f(a)} meters to the park, then ${f(b)} more meters to the lake. How far does she ride?`,`A food bank collected ${f(a)} cans in March and ${f(b)} cans in April. How many cans is that altogether?`]},
 sub:v=>{const [a,b]=v.x;return[`A water tank holds ${f(a)} liters. ${f(b)} liters are used for the school garden. How many liters are left?`,`A video game level hides ${f(a)} gems. Maya has found ${f(b)}. How many gems are still hidden?`,`A stadium has ${f(a)} seats. ${f(b)} seats are filled. How many seats are empty?`]},
 round:v=>{const nm={10:"ten",100:"hundred",1000:"thousand",10000:"ten thousand",100000:"hundred thousand"}[v.p];return[`A stadium counted ${f(v.N)} fans. A news reporter rounds to the nearest ${nm}. What number does she report?`,`A mountain is ${f(v.N)} feet tall. Round its height to the nearest ${nm}.`]},
 muladd:v=>{const [a,b,c]=v.x;return[`A coach buys ${f(a)} boxes with ${f(b)} water bottles in each box. She finds ${f(c)} more bottles in the closet. How many bottles does she have?`,`A gardener plants ${f(a)} rows of ${f(b)} tomato plants, then plants ${f(c)} more by the fence. How many tomato plants is that?`]},
 mulsub:v=>{const [a,b,c]=v.x;return[`A garden has ${f(a)} rows with ${f(b)} tulips in each row. ${f(c)} tulips are picked. How many tulips are still growing?`,`A robotics team orders ${f(a)} kits with ${f(b)} motors in each kit. ${f(c)} motors do not work. How many motors work?`]},
 ceildiv:v=>{const [n,d]=v.x;return[`${f(n)} campers ride canoes. Each canoe holds ${f(d)} campers. How many canoes are needed so everyone gets a ride?`,`${f(n)} photos go into an album. Each page holds ${f(d)} photos. How many pages are needed for all the photos?`]},
 floordiv:v=>{const [n,d]=v.x;return[`A baker has ${f(n)} eggs. Each cake needs ${f(d)} eggs. How many whole cakes can she bake?`,`A ribbon is ${f(n)} inches long. Each bow needs ${f(d)} inches. How many complete bows can be made?`]},
 frac:v=>[`A garden bed is split into ${v.d} equal parts. ${v.n} ${v.n===1?"part is":"parts are"} planted with carrots. What fraction of the bed is carrots?`,`A flag has ${v.d} equal stripes. ${v.n} ${v.n===1?"stripe is":"stripes are"} gold. What fraction of the flag is gold?`],
 equiv:v=>[`A recipe needs ${v.n}/${v.d} cup of milk. Lena only has a 1/${v.d*v.k} cup scoop. ${v.n}/${v.d} = ☐/${v.d*v.k}. How many scoops does she need?`],
 fcmp:v=>{const [a,b,c,d]=v.x;return[`Mia ran ${a}/${b} of a mile. Leo ran ${c}/${d} of a mile. Which sign compares Mia's distance to Leo's?  ${a}/${b} ☐ ${c}/${d}`]},
 equivpick:v=>[`A smoothie recipe needs ${v.n}/${v.d} cup of yogurt. Which amount is the SAME as ${v.n}/${v.d} cup?`],
 factor:v=>[`A teacher arranges ${v.N} desks in equal rows with none left over. Which number of rows works?`],
 multiple:v=>[`A shuttle bus leaves the airport every ${v.k} minutes, starting at minute 0. At which minute will a bus leave?`],
 notfactor:v=>[`${v.N} cookies are packed into equal bags with none left over. Which number of bags does NOT work?`],
 nfactors:v=>[`${v.N} chairs are set up in equal rows (1 row is allowed, so is 1 chair per row). How many different numbers of rows are possible?`],
 prime:()=>[`A tile number is PRIME when the tiles can only make one rectangle: 1 row. Which number of tiles is prime?`],
 digitval:v=>{const d=String(v.N)[String(v.N).length-1-v.pos];return[`The odometer on Grandpa's truck reads ${f(v.N)} miles. What is the VALUE of the digit ${d}?`]},
 cmp:v=>{const [a,b]=v.x;return[`Elmtown has ${f(a)} people. Oakville has ${f(b)} people. Which sign compares them?  ${f(a)} ☐ ${f(b)}`]}};
function transfer(it,r){r=r||Math.random;const g=it&&it.v&&T[it.v.op];if(!g)return null;if(it.v.op==="div"&&it.sk==="placevalue")return null;const qs=it.v.op==="mul"&&/times as (many|much|long|tall)/i.test(it.q)?(([a,b])=>{const big=Math.max(a,b),sm=Math.min(a,b),k=/(\d+) times/.exec(it.q);const t=k?+k[1]:sm,base=t===a?b:a;return[`A puppy weighs ${f(base)} pounds. A grown dog weighs ${f(t)} times as much. How many pounds does the grown dog weigh?`,`A sapling is ${f(base)} inches tall. The old oak tree is ${f(t)} times as tall. How tall is the oak tree in inches?`]})(it.v.x):g(it.v);if(!qs||!qs.length)return null;
  return Object.assign({},it,{q:pick(qs,r),vis:null,transfer:true,hint:"Find the math inside the story: what is being grouped, shared, combined or compared?"})}
const API={TEMPLATES:T,apply,criteria,dueChecks,checkResult,retake,pct,status,summary,repOf,transfer,SPACING,WIN,TRANSFER_OPS:Object.keys(T)};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.MASTERY=API})(typeof window!=="undefined"?window:globalThis);
