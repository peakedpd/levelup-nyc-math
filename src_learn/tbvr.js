/* Ticket Blaster VR: Fraction Frenzy — question generator, reteach model, ranks and ticket payout.
   Standard: CCSS 4.NF.A.1 — explain why a/b is equivalent to (n×a)/(n×b) using visual fraction models;
   recognize and generate equivalent fractions. Every item carries structured data (v) and tools/verify_tbvr.js
   re-reads the question text and recomputes the key by cross-multiplying, so a wrong key can't ship. */
(function(root){"use strict";
const STD={code:"4.NF.A.1",skill:"fractions",name:"Equivalent fractions",
  kid:"Equal fractions: multiply the top AND the bottom by the same number."};
const LEVELS=[null,
 {kind:"unit",core:1,label:"Halves, thirds, fourths"},
 {kind:"missnum",core:2,label:"Find the missing top"},
 {kind:"missden",core:3,label:"Find the missing bottom"},
 {kind:"equal",core:4,label:"Any equal fraction"},
 {kind:"simplify",core:5,label:"Simplest form"},
 {kind:"tricky",core:6,label:"Tricky look-alikes"}];
/* grade 4 limits fractions to denominators 2, 3, 4, 5, 6, 8, 10, 12 and 100 (CCSS footnote) — keys AND wrong choices stay inside it */
const DEN=[2,3,4,5,6,8,10,12,100];
const BASES=[[1,2],[1,3],[1,4],[2,3],[3,4],[1,5],[2,5],[3,5],[4,5],[1,6],[5,6],[3,10],[7,10]];
const KS=b=>DEN.filter(d=>d>b&&d%b===0&&(d<100||b===10)).map(d=>d/b);
function gcd(a,b){while(b){[a,b]=[b,a%b]}return a}
function rng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
const F=(a,b)=>a+"/"+b;
function build(o,rnd){const ch=[o.a],why={};const okv=v=>{if(typeof v==="number")return Number.isInteger(v)&&v>0;const m=/^(\d+)\/(\d+)$/.exec(v);return !!m&&+m[1]>0&&DEN.includes(+m[2])};
  const eqv=(x,y)=>{if(typeof x==="number"||typeof y==="number")return String(x)===String(y);const[a,b]=x.split("/").map(Number),[c,d]=y.split("/").map(Number);return a*d===b*c};
  o.mis.forEach(([v,w])=>{if(ch.length<4&&okv(v)&&!ch.some(x=>eqv(x,v))){ch.push(v);why[String(v)]=w}});
  for(let i=ch.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[ch[i],ch[j]]=[ch[j],ch[i]]}
  return{std:STD.code,sk:STD.skill,lv:o.lv,core:LEVELS[o.lv].core,kind:o.kind,q:o.q,short:o.short,a:o.a,ch,why,hint:o.hint,v:o.v,bar:o.bar}}
function gen(lv,rnd){rnd=rnd||Math.random;lv=Math.max(1,Math.min(6,lv|0));const r=(a,b)=>a+Math.floor(rnd()*(b-a+1));const kind=LEVELS[lv].kind;
  const pool=kind==="unit"?BASES.slice(0,3):BASES.slice(3);let [a,b]=pool[r(0,pool.length-1)];const ks=KS(b),k=ks[r(0,ks.length-1)],A=a*k,B=b*k;
  const add=(x,y,m)=>[F(a+m,b+m),`You added ${m} to the top and bottom. Equal fractions MULTIPLY the top and bottom by the same number.`];
  const topOnly=[F(A,b),`Only the top got multiplied. Multiply the top AND the bottom by ${k}.`];
  const botOnly=[F(a,B),`Only the bottom got multiplied. Multiply the top AND the bottom by ${k}.`];
  const flip=[F(B,A),`That's flipped upside down. The top tells how many parts you have.`];
  const offOne=[F(A+1,B),`So close! ${a}/${b} \u00d7 ${k}/${k} = ${A}/${B}. Check the top.`];
  const offOneB=[F(A,B+1),`So close! ${a}/${b} \u00d7 ${k}/${k} = ${A}/${B}. Check the bottom.`];
  const bar={a,b,k};
  if(kind==="unit"||kind==="equal")return build({lv,kind,q:`Blast the fraction equal to ${F(a,b)}!`,short:F(a,b),a:F(A,B),
    mis:[add(a,b,k),add(a,b,k-1>0?k-1:k+1),topOnly,botOnly,flip,offOne,offOneB,add(a,b,1),add(a,b,2),[F(A+k,B),`Close! ${a} \u00d7 ${k} = ${A}, not ${A+k}.`],[F(A-1,B),`So close! ${a}/${b} \u00d7 ${k}/${k} = ${A}/${B}. Check the top.`],[F(a+1,b),`Equal fractions are the same size. ${a+1}/${b} is bigger than ${a}/${b}.`],[F(a,b+1),`The pieces changed size. Multiply top and bottom by the same number.`]],hint:`Multiply top and bottom by the same number: ${a}\u00d7${k} / ${b}\u00d7${k}.`,v:{op:"eqfrac",a,b,k},bar},rnd);
  if(kind==="missnum")return build({lv,kind,q:`${F(a,b)} = ?/${B}. Blast the missing top number!`,short:`${F(a,b)} = ?/${B}`,a:A,
    mis:[[a+(B-b),`You added ${B-b} to the top because the bottom went up by ${B-b}. Multiply instead: ${b} \u00d7 ${k} = ${B}, so ${a} \u00d7 ${k}.`],[a,`The bottom changed, so the top must change too: ${a} \u00d7 ${k}.`],[A+1,`Check: ${b} \u00d7 ${k} = ${B}, so ${a} \u00d7 ${k} = ${A}.`],[A>2?A-1:A+2,`Check: ${b} \u00d7 ${k} = ${B}, so ${a} \u00d7 ${k} = ${A}.`],[B,`That's the bottom number. The top is ${a} \u00d7 ${k}.`]],
    hint:`${b} times what makes ${B}? Do the same to ${a}.`,v:{op:"missnum",a,b,B},bar},rnd);
  if(kind==="missden")return build({lv,kind,q:`${F(a,b)} = ${A}/?. Blast the missing bottom number!`,short:`${F(a,b)} = ${A}/?`,a:B,
    mis:[[b+(A-a),`You added ${A-a} because the top went up by ${A-a}. Multiply instead: ${a} \u00d7 ${k} = ${A}, so ${b} \u00d7 ${k}.`],[b,`The top changed, so the bottom must change too: ${b} \u00d7 ${k}.`],[B+1,`Check: ${a} \u00d7 ${k} = ${A}, so ${b} \u00d7 ${k} = ${B}.`],[A,`That's the top number. The bottom is ${b} \u00d7 ${k}.`]],
    hint:`${a} times what makes ${A}? Do the same to ${b}.`,v:{op:"missden",a,b,A},bar},rnd);
  if(kind==="simplify")return build({lv,kind,q:`Blast the SIMPLER fraction equal to ${F(A,B)}!`,short:F(A,B),a:F(a,b),
    mis:[[F(A-k,B-k)===F(a,b)?F(a+1,b+1):F(A-1,B-1),`Subtracting the same number changes the size. Divide top and bottom by ${k}.`],[F(a,B),`Divide the top AND the bottom by ${k}.`],[F(A,b),`Divide the top AND the bottom by ${k}.`],[F(b,a),`That's flipped. The top stays the top.`],[F(a+1,b),`Check: ${A} \u00f7 ${k} = ${a}.`],[F(a>1?a-1:a+2,b),`Check: ${A} \u00f7 ${k} = ${a}.`],[F(a,b+1),`Divide the bottom by ${k}: ${B} \u00f7 ${k} = ${b}.`],[F(a,b>2?b-1:b+2),`Divide the bottom by ${k}: ${B} \u00f7 ${k} = ${b}.`]],
    hint:`Both ${A} and ${B} can be divided by ${k}.`,v:{op:"simplify",A,B},bar},rnd);
  /* tricky: all choices share the top or bottom so only multiplying works */
  return build({lv,kind,q:`Careful! Blast the fraction equal to ${F(a,b)}!`,short:F(a,b),a:F(A,B),
    mis:[offOne,offOneB,add(a,b,k),[F(A,B+k),`Close! ${b} \u00d7 ${k} = ${B}, not ${B+k}.`],topOnly,botOnly,[F(A-1,B),`So close! Check the top: ${a} \u00d7 ${k} = ${A}.`],[F(A+k,B),`Close! ${a} \u00d7 ${k} = ${A}, not ${A+k}.`],[F(a+1,b),`${a+1}/${b} is bigger than ${a}/${b}.`],add(a,b,1),add(a,b,2)],hint:`${a}/${b}: try \u00d7${k} on top and bottom.`,v:{op:"eqfrac",a,b,k},bar},rnd)}
/* reteach card: fraction bars — the same "concrete -> rule" order as the Reteach Plan */
function reteach(it){const {a,b,k}=it.bar;const A=a*k,B=b*k;return{rows:[{parts:b,shade:a,label:F(a,b)},{parts:B,shade:A,label:F(A,B)}],
  lines:[`Same bar, cut into ${k} times as many pieces: ${b} parts \u2192 ${B} parts.`,`Shaded pieces grow the same way: ${a} \u00d7 ${k} = ${A}. So ${F(a,b)} = ${F(A,B)}.`]}}
function equal(x,y){const p=s=>String(s).split("/").map(Number);const[a,b]=p(x),[c,d]=p(y);return a*d===b*c}
const RANKS=[{id:"bronze",name:"Bronze",icon:"\ud83e\udd49",at:0},{id:"silver",name:"Silver",icon:"\ud83e\udd48",at:80},{id:"gold",name:"Gold",icon:"\ud83e\udd47",at:200},{id:"platinum",name:"Platinum",icon:"\ud83d\udca0",at:350},{id:"diamond",name:"Diamond",icon:"\ud83d\udc8e",at:520}];
function rankOf(score){let r=RANKS[0];for(const x of RANKS)if(score>=x.at)r=x;return r}
function points(lv,combo,dbl){return (10+lv*2+Math.min(10,combo)*2)*(dbl?2:1)}
/* tickets tied to accuracy: answers right (+level), times an accuracy multiplier, plus a streak bonus */
function payout(correct,attempts,bestCombo,lvSum){if(!attempts||!correct)return{tickets:0,acc:attempts?0:0,mult:0};const acc=correct/attempts;
  const mult=acc>=.9?2:acc>=.75?1.5:acc>=.5?1:.5;const base=correct*4+(lvSum||0);return{tickets:Math.round(base*mult)+Math.min(20,Math.floor((bestCombo||0)/3)*5),acc,mult}}
const API={STD,LEVELS,gen,reteach,equal,gcd,RANKS,rankOf,points,payout,rng};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.TBVR=API})(typeof window!=="undefined"?window:globalThis);
