// Ticket Blaster VR: Fraction Frenzy (CCSS 4.NF.A.1) — independent answer key. Re-reads each question's TEXT,
// recomputes the key by cross-multiplying, and checks: exactly one correct target, 4 unique non-equivalent choices,
// every wrong choice has a kid-friendly reason, the standard is named, the reteach fraction bars are right,
// and the ticket payout rewards accuracy. Ends with a planted-error self-test.
const T = require('../src_learn/tbvr.js'); let fails = 0, n = 0; const F = (m, it) => { if (fails++ < 20) console.log('FAIL', m, it ? JSON.stringify(it) : '') };
const fr = s => { const m = /^(\d+)\/(\d+)$/.exec(String(s)); return m ? [+m[1], +m[2]] : null };
const same = (x, y) => { const p = fr(x), q = fr(y); return p && q && p[0] * q[1] === p[1] * q[0] };
// the key: what a careful 4th grader would do from the words alone
function isRight(it, c) { const q = it.q; let m;
  if ((m = /^(\d+)\/(\d+) = \?\/(\d+)\./.exec(q))) { const [, a, b, B] = m.map(Number); return typeof c === 'number' && c * b === a * B }
  if ((m = /^(\d+)\/(\d+) = (\d+)\/\?\./.exec(q))) { const [, a, b, A] = m.map(Number); return typeof c === 'number' && A * b === a * c }
  if ((m = /SIMPLER fraction equal to (\d+)\/(\d+)/.exec(q))) { const g = fr(c); return !!g && same(c, m[1] + '/' + m[2]) && g[1] < +m[2] }
  if ((m = /fraction equal to (\d+)\/(\d+)!/.exec(q))) return same(c, m[1] + '/' + m[2]) && String(c) !== m[1] + '/' + m[2];
  return null }
const rnd = T.rng(20261127);
for (let lv = 1; lv <= 6; lv++) for (let i = 0; i < 4000; i++) { const it = T.gen(lv, rnd); n++;
  const res = it.ch.map(c => isRight(it, c)); if (res.some(x => x === null)) { F('unparsed question', it); continue }
  if (res.filter(Boolean).length !== 1) F('exactly one correct target', it);
  if (!isRight(it, it.a)) F('generator answer is wrong: ' + it.a, it);
  if (it.ch.length !== 4) F('needs 4 choices', it);
  for (let x = 0; x < 4; x++) for (let y = x + 1; y < 4; y++) { if (String(it.ch[x]) === String(it.ch[y]) || (fr(it.ch[x]) && same(it.ch[x], it.ch[y]))) F('duplicate/equivalent choices', it) }
  it.ch.forEach(c => { if (typeof c === 'number' ? !(Number.isInteger(c) && c > 0) : !fr(c) || fr(c)[0] < 1) F('bad choice ' + c, it); if (String(c) !== String(it.a) && !it.why[String(c)]) F('wrong choice without a reason: ' + c, it) });
  const DEN = [2, 3, 4, 5, 6, 8, 10, 12, 100]; it.ch.forEach(c => { if (fr(c) && !DEN.includes(fr(c)[1])) F('denominator outside grade 4 set: ' + c, it) }); if (it.kind === 'missden' && !DEN.includes(it.a)) F('key denominator outside grade 4 set', it);
  if (it.std !== '4.NF.A.1' || it.sk !== 'fractions') F('standard tag', it);
  if (it.q.length > 70) F('question too long for a flying-target round', it);
  const rt = T.reteach(it), [r0, r1] = rt.rows; if (r0.shade * r1.parts !== r0.parts * r1.shade || r1.parts !== r0.parts * it.bar.k) F('reteach bars', it);
  if (!same(r0.label, r1.label)) F('reteach labels not equal', it);
  if (/simplify|eqfrac/.test(it.v.op) && it.kind !== 'simplify' && r1.label !== it.a) F('reteach shows a different fraction than the key', it) }
for (let c = 1; c <= 20; c++) for (let w = 0; w < 10; w++) { const a = T.payout(c, c + w, 0, c * 3).tickets, b = T.payout(c, c + w + 1, 0, c * 3).tickets; if (b > a) F(`payout rose with a miss c=${c} w=${w}`) }
if (T.payout(0, 5, 0, 0).tickets !== 0) F('zero right should pay 0');
if (T.rankOf(0).id !== 'bronze' || T.rankOf(520).id !== 'diamond' || T.rankOf(210).id !== 'gold') F('rank ladder');
{ const it = T.gen(1, T.rng(7)); const [a, b] = fr(it.a); if (isRight(it, (a + 1) + '/' + b)) F('self-test: planted error not caught') }
console.log(fails ? `verify_tbvr: ${fails} FAILURES over ${n} items` : `verify_tbvr PASS — ${n} items (6 levels, 4.NF.A.1), 0 math errors; reteach bars, payout, ranks checked`); process.exit(fails ? 1 : 0);
