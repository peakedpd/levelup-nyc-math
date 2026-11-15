/* LevelUp Weakness Challenges (gap-closing): picks each student's "Challenge today" from their biggest gaps, prerequisite
   building blocks and repeated misconceptions, and runs it as a boss battle against Brock "The Block" — a smug neighborhood
   kid who blocks a street spot with math tricks that match the student's misconception. Pure logic (node + browser).
   Stages: reteach -> guided try -> independent boss battle -> Memory Check rematch a few days later. */
(function(root){
const DAY=864e5,GRADE=4,BELOW=2;
const PRE={placevalue:[],groups:[],rounding:["placevalue"],addsub:["placevalue"],mult:["groups","placevalue"],divide:["groups","mult"],factors:["groups"],multistep:["addsub","mult","divide"],fractions:["factors","groups"]};
const MISSKILL={regroup:"addsub",remainder:"divide",fraction:"fractions",partial:"mult",rounding:"rounding",factmult:"factors",placeval:"placevalue",addmult:"groups",onestep:"multistep",wrongop:"multistep",count:"groups",array:"groups"};
const MEMORY_DAYS=3,HITS=5,MAX_BOSS_ITEMS=9;
/* ---------- Brock's variants: one street spot + playful trick per skill / misconception ---------- */
const SPOT={placevalue:"the Bodega Corner",groups:"the Fruit Stand",rounding:"the Subway Stairs",addsub:"the Hot-Dog Cart",mult:"the Basketball Court",divide:"the Pizza Shop",factors:"the Bike Rack",multistep:"the Bus Stop",fractions:"the Pretzel Stand"};
const TITLE={placevalue:"Brock, Duke of Zeros",groups:"Brock the Group-Grabber",rounding:"Brock the Round-Down Rascal",addsub:"Brock the Borrow-Blocker",mult:"Brock the Part-Skipper",divide:"Brock the Leftover Lord",factors:"Brock the Factor Faker",multistep:"Brock the One-Step Wonder",fractions:"Brock the Big-Bottom Boss"};
const TRICK={
 regroup:"\"52 − 37? Just take the little digit from the big one: 25! Borrowing is for library books!\"",
 remainder:"\"29 kids, 6 per van — that's 4 vans. Leftover kids can walk!\"",
 fraction:"\"1/8 is bigger than 1/4 — everybody knows 8 beats 4!\"",
 partial:"\"23 × 14? 2 × 1 and 3 × 4 — boom, 212. Who needs all those boxes?\"",
 rounding:"\"3,650 to the nearest hundred? Always round down — 3,600. Five is a scaredy-cat!\"",
 factmult:"\"Factors of 12? Easy: 12, 24, 36, 48! I'm the Factor King!\"",
 placeval:"\"The 4 in 4,520 is worth... 4. Just 4. Zeros don't count!\"",
 addmult:"\"3 times as many as 8? That's 3 + 8 = 11. Times, plus, same thing!\"",
 onestep:"\"I did step one, so I'm DONE. Who reads the whole question anyway?\"",
 wrongop:"\"Sharing 72 stickers with 8 friends? Multiply! Bigger numbers are better!\"",
 count:"\"6 bags of 4? I counted... 7 bags. Or 5. Close enough!\"",
 array:"\"Rows, columns, whatever. Just count the edges!\"",
 other:"\"Bet you can't get past me. Nobody gets past The Block!\""};
const SKILLTRICK={placevalue:"placeval",groups:"addmult",rounding:"rounding",addsub:"regroup",mult:"partial",divide:"remainder",factors:"factmult",multistep:"onestep",fractions:"fraction"};
const HITTXT=["💥 Brock's cap spins around!","😵 His skateboard rolls away!","🍕 He drops his pizza slice!","🌀 His smirk wobbles!","🎯 Direct hit — his confidence cracks!","⚡ He trips over his own sneakers!"];
const REDEEM=["\"Whoa... you actually know this. Can you show me how you did it?\"","\"Okay, okay — that was really cool. Friends? I'll stop blocking the corner.\"","\"Nobody ever beat The Block before. Teach me that trick sometime?\""];
/* ---------- helpers ---------- */
const lvOf=(l,sk)=>{const m=(l.m||{})[sk];return m?(m.done?6:m.lv||1):1};
function state(l){l.ch=l.ch||{history:[],queue:[],streak:{last:null,n:0,best:0},badges:[],day:null};return l.ch}
function recentMis(l,now){const c={};(l.log||[]).filter(e=>!e.ok&&e.code&&e.code!=="other"&&now-e.t<14*DAY).forEach(e=>c[e.code]=(c[e.code]||0)+1);return c}
function keyOf(t){return t.kind+":"+(t.kind==="mis"?t.code:t.sk)}
/* ---------- choose today's challenge ---------- */
function candidates(l,now){now=now||Date.now();const ch=state(l),out=[];const SK=Object.keys(PRE);
  // 1) Memory Check rematches that are due (retention first — a gap isn't closed until it sticks)
  for(const h of ch.history)if(h.defeated&&!h.memory&&h.memAt<=now&&!ch.history.some(x=>x.key===h.key&&x.t>h.t&&x.stage==="memory"&&x.defeated))out.push({kind:h.kind,sk:h.sk,code:h.code,stage:"memory",score:100,why:"Memory Check rematch — show Brock it stuck!",of:h.t});
  // 2) teacher-assigned challenges
  for(const q of ch.queue)if(!q.done)out.push({kind:q.code?"mis":"skill",sk:q.sk||MISSKILL[q.code],code:q.code||SKILLTRICK[q.sk],stage:"new",score:90,why:"Assigned by "+(q.teacher||"your teacher"),assigned:q.id});
  // 3) skill gaps (bigger gap first), building blocks for other weak skills boosted
  const below=SK.filter(k=>lvOf(l,k)<=BELOW);const mis=recentMis(l,now);
  for(const k of SK){const lv=lvOf(l,k),gap=Math.max(0,GRADE-lv);if(!gap)continue;const blocks=SK.filter(o=>o!==k&&(PRE[o]||[]).includes(k)&&lvOf(l,o)<=BELOW);
    const preWeak=(PRE[k]||[]).filter(p=>lvOf(l,p)<=BELOW);const misN=Object.entries(mis).filter(([c])=>MISSKILL[c]===k).reduce((a,[,n])=>a+n,0);
    let score=gap*12+(blocks.length?15+blocks.length*3:0)+Math.min(misN,6)*2-(preWeak.length?20:0);
    out.push({kind:"skill",sk:k,code:SKILLTRICK[k],stage:"new",score,gap,why:blocks.length?`Building block for ${blocks.length} other skill${blocks.length>1?"s":""} you're working on`:`Biggest gap: you're at L${lv}, grade level is L${GRADE}`,blocks})}
  // 4) repeated misconceptions (2+ in two weeks)
  for(const [c,n] of Object.entries(mis))if(n>=2&&MISSKILL[c])out.push({kind:"mis",sk:MISSKILL[c],code:c,stage:"new",score:20+n*4+Math.max(0,GRADE-lvOf(l,MISSKILL[c]))*6,why:`Same mistake ${n} times lately — let's beat it`});
  // cool-down: a target defeated in the last 2 days waits (unless it's a due rematch / teacher assignment)
  const recent=new Set(ch.history.filter(h=>h.defeated&&now-h.t<2*DAY).map(h=>h.key));
  const seen=new Set();return out.filter(c=>{const k=keyOf(c);if(c.stage!=="memory"&&!c.assigned&&recent.has(k))return false;if(seen.has(k+c.stage))return false;seen.add(k+c.stage);return true}).sort((a,b)=>b.score-a.score||a.sk.localeCompare(b.sk))}
function pick(l,now){now=now||Date.now();const c=candidates(l,now);if(c.length)return decorate(c[0],l);
  // everyone at grade level: stretch boss on the lowest skill, one level up
  const ch=state(l),cool=new Set(ch.history.filter(h=>h.defeated&&now-h.t<2*DAY).map(h=>h.sk));const SK=Object.keys(PRE).sort((a,b)=>(cool.has(a)-cool.has(b))||lvOf(l,a)-lvOf(l,b)||a.localeCompare(b));return decorate({kind:"skill",sk:SK[0],code:SKILLTRICK[SK[0]],stage:"new",score:0,why:"Stretch challenge — you're at grade level, so Brock brought his A-game",stretch:true},l)}
function decorate(t,l){const lv=lvOf(l,t.sk);return Object.assign(t,{key:keyOf(t),title:TITLE[t.sk],spot:SPOT[t.sk],trick:TRICK[t.code]||TRICK.other,startLv:Math.min(6,t.stretch?lv+1:lv),guidedLv:Math.max(1,(t.stretch?lv+1:lv)-1)})}
/* ---------- adaptive difficulty inside a battle ---------- */
function nextLevel(cur,hist){/* hist: [{ok,first}] latest last. 2 first-try in a row -> up; a miss -> down one (never below 1) */const a=hist[hist.length-1],b=hist[hist.length-2];if(a&&!a.first)return Math.max(1,cur-1);if(a&&b&&a.first&&b.first)return Math.min(6,cur+1);return cur}
/* ---------- battle state machine ---------- */
function battle(t,now){return{t:now||Date.now(),key:t.key,kind:t.kind,sk:t.sk,code:t.code,stage:t.stage==="memory"?"memory":"reteach",lv:t.stage==="memory"?t.startLv:t.guidedLv,startLv:t.startLv,conf:100,hits:0,items:[],need:t.stage==="memory"?2:HITS,max:t.stage==="memory"?3:MAX_BOSS_ITEMS,assigned:t.assigned||null,stretch:!!t.stretch}}
function advance(b){if(b.stage==="reteach"){b.stage="guided";b.gi=0;return b}if(b.stage==="guided"){b.gi=(b.gi||0)+1;if(b.gi>=2){b.stage="boss";b.lv=b.startLv}return b}return b}
function answer(b,ok,first){/* during guided: just adapt; boss/memory: hits drain confidence */b.items.push({ok:!!ok,first:!!first,lv:b.lv,stage:b.stage});const h=b.items.filter(x=>x.stage===b.stage);
  if(b.stage==="boss"||b.stage==="memory"){if(ok&&first){b.hits++;b.conf=Math.max(0,Math.round(100-b.hits*100/b.need))}
    if(b.stage==="boss")b.lv=nextLevel(b.lv,h);
    if(b.hits>=b.need){b.result="defeated";b.stage="done"}else if(h.length>=b.max||(b.stage==="memory"&&h.length-h.filter(x=>x.ok&&x.first).length>b.max-b.need)){b.result=b.stage==="memory"?"slipped":"escaped";b.stage="done"}}
  else b.lv=nextLevel(b.lv,h);return b}
/* ---------- finish: rewards, streaks, badges, Memory Check scheduling ---------- */
const BADGES={first:{icon:"🤝",name:"Brock's New Friend",desc:"Beat Brock for the first time"},streak3:{icon:"🔥",name:"3-Day Streak",desc:"Challenge done 3 days in a row"},streak7:{icon:"🌟",name:"7-Day Streak",desc:"Challenge done 7 days in a row"},climber:{icon:"🧗",name:"Level Climber",desc:"Beat Brock at a level above where you started"}};
function badgeFor(sk){return{id:"block_"+sk,icon:"🏅",name:"Block Buster: "+sk,desc:"Closed the gap: beat Brock and passed the Memory Check"}}
function finish(l,b,now){now=now||Date.now();const ch=state(l);const day=new Date(now).toISOString().slice(0,10);const out={coins:0,badges:[],result:b.result};
  const firstTry=b.items.filter(x=>(x.stage==="boss"||x.stage==="memory")&&x.first).length;
  if(b.stage!=="done"&&!b.result)b.result="quit";
  const rec={t:now,key:b.key,kind:b.kind,sk:b.sk,code:b.code,stage:b.items.some(x=>x.stage==="memory")?"memory":"boss",defeated:b.result==="defeated",result:b.result,maxLv:Math.max(0,...b.items.map(x=>x.lv)),startLv:b.startLv,firstTry,items:b.items.length,assigned:b.assigned};
  if(rec.stage==="boss"&&rec.defeated){rec.memAt=now+MEMORY_DAYS*DAY;out.coins=15+(b.stretch?5:0);if(!ch.history.some(h=>h.defeated))out.badges.push(Object.assign({id:"first"},BADGES.first));if(rec.maxLv>b.startLv&&!ch.badges.some(x=>x.id==="climber"))out.badges.push(Object.assign({id:"climber"},BADGES.climber))}
  if(rec.stage==="memory"){const orig=ch.history.filter(h=>h.key===b.key&&h.defeated&&!h.memory).slice(-1)[0];if(rec.defeated){if(orig)orig.memory=now;out.coins=20;const bd=badgeFor(b.sk);if(!ch.badges.some(x=>x.id===bd.id))out.badges.push(bd)}else if(orig){orig.memAt=now+DAY}}
  if(b.assigned&&rec.defeated){const q=ch.queue.find(x=>x.id===b.assigned);if(q){q.done=now}}
  if(b.result!=="quit"){if(ch.streak.last!==day){const y=new Date(now-DAY).toISOString().slice(0,10);ch.streak.n=ch.streak.last===y?ch.streak.n+1:1;ch.streak.last=day;ch.streak.best=Math.max(ch.streak.best,ch.streak.n)}
    if(ch.streak.n>=3&&!ch.badges.some(x=>x.id==="streak3"))out.badges.push(Object.assign({id:"streak3"},BADGES.streak3));if(ch.streak.n>=7&&!ch.badges.some(x=>x.id==="streak7"))out.badges.push(Object.assign({id:"streak7"},BADGES.streak7));ch.day=day}
  out.badges.forEach(x=>ch.badges.push(Object.assign({t:now},x)));ch.history.push(rec);if(ch.history.length>200)ch.history.splice(0,ch.history.length-200);out.rec=rec;out.streak=ch.streak.n;return out}
function doneToday(l,now){const ch=state(l);return ch.day===new Date(now||Date.now()).toISOString().slice(0,10)}
/* ---------- teacher side ---------- */
function enqueue(l,item){const ch=state(l);if(ch.queue.some(q=>q.id===item.id))return false;ch.queue.push(Object.assign({t:Date.now()},item));return true}
function gapReport(students){/* per skill: below grade level (L1–L2) at placement vs now, and how many closed the gap (now L3+) */const SK=Object.keys(PRE);
  return SK.map(sk=>{let start=0,now=0,closed=0,n=0;const names=[];for(const s of students){const L=s.learn||{};const base=L.base&&L.base[sk];if(!base)continue;n++;const lv=lvOf(L,sk);if(base<=BELOW){start++;if(lv>BELOW){closed++;names.push(s.name)}}if(lv<=BELOW)now++}return{sk,n,start,now,closed,closedNames:names}})}
const API={PRE,MISSKILL,SPOT,TITLE,TRICK,SKILLTRICK,HITTXT,REDEEM,BADGES,badgeFor,GRADE,BELOW,HITS,MAX_BOSS_ITEMS,MEMORY_DAYS,state,candidates,pick,nextLevel,battle,advance,answer,finish,doneToday,enqueue,gapReport,lvOf};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.CHALLENGE=API})(typeof window!=="undefined"?window:globalThis);
