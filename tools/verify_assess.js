// Verifies the adaptive diagnostic engine (src_learn/assess.js) against simulated students with known abilities.
const A = require('../src_learn/assess.js'), L = require('../src_learn/core.js');
const fails = []; const F = m => { if (fails.length < 50) fails.push(m) };
function rnd(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296 } }
function sim(ab, slip, guess, seed) { const r = rnd(seed); const st = A.newState(); let n, guard = 0;
  while ((n = A.next(st)) && guard++ < 200) { const knows = ab[n.sk] >= n.lv; const ok = knows ? r() > slip : r() < guess; A.answer(st, n.sk, n.lv, ok, { fmt: A.pickFormat(L.item(n.sk, n.lv, rnd(seed + guard)), n.k) }) }
  if (guard >= 200) F('diagnostic did not terminate'); return A.results(st) }
// 1) noiseless students: exact recovery for every ability 0..6 in every skill, 2-5 items per skill
for (let a = 0; a <= 6; a++) for (let seed = 1; seed <= 40; seed++) { const r = rnd(seed * 31 + a); const ab = Object.fromEntries(A.ORDER.map(k => [k, Math.floor(r() * 7)])); const R = sim(ab, 0, 0, seed);
  for (const k of A.ORDER) { const s = R.skills[k]; if (s.est !== ab[k]) F(`noiseless ${k}: ability ${ab[k]} estimated ${s.est}`); if (s.items < 2 || s.items > A.MAX_ITEMS) F(`${k}: ${s.items} items`); if (s.start !== Math.max(1, Math.min(6, ab[k] >= 6 ? 6 : ab[k] + 1))) F(`${k} start point`) } }
// 2) noisy students (5% slip, 20% guess): estimate within 1 level for >= 85% of skill placements
let within = 0, tot = 0, items = 0, students = 0;
for (let seed = 1; seed <= 3000; seed++) { const r = rnd(seed); const ab = Object.fromEntries(A.ORDER.map(k => [k, Math.floor(r() * 7)])); const R = sim(ab, .05, .2, seed + 7); students++; items += R.n;
  for (const k of A.ORDER) { tot++; if (Math.abs(R.skills[k].est - ab[k]) <= 1) within++ } }
const acc = within / tot; if (acc < .85) F('noisy accuracy ' + acc.toFixed(3));
const avgItems = items / students; if (avgItems < 20 || avgItems > 45) F('average items ' + avgItems);
// 3) every skill gets >= 2 question formats over a full diagnostic (formats available for its items)
{ const st = A.newState(); let n, i = 0; while ((n = A.next(st))) { const it = L.item(n.sk, n.lv, rnd(++i)); A.answer(st, n.sk, n.lv, i % 3 !== 0, { fmt: A.pickFormat(it, n.k) }) }
  const R = A.results(st); const fmtsAll = new Set(); for (const k of A.ORDER) { R.skills[k].formats.forEach(f => fmtsAll.add(f)); if (R.skills[k].formats.length < 2 && R.skills[k].items >= 2) F(`${k}: only formats ${R.skills[k].formats}`) }
  ['mc', 'num'].forEach(f => { if (!fmtsAll.has(f)) F('format never used: ' + f) }) }
// 3b) the real item chooser covers all five formats across simulated quests, and word-format items are story problems with numeric answers
{ const used = {}; for (let seed = 1; seed <= 300; seed++) { const r = rnd(seed); const ab = Object.fromEntries(A.ORDER.map(k => [k, Math.floor(r() * 7)])); const st = A.newState(); let n, g = 0;
    while ((n = A.next(st)) && g++ < 200) { const { it, fmt } = A.chooseItem(L, n.sk, n.lv, n.k, seed * 1000 + g); used[fmt] = (used[fmt] || 0) + 1;
      if (fmt === 'word' && (!A.isWord(it.q) || !/^[\d,]+$/.test(String(it.a)))) F('bad word item ' + it.q); if (fmt === 'array' && !(it.v && it.v.op === 'mul')) F('bad array item ' + it.q);
      if (!A.formatsFor(it).includes(fmt === 'word' ? 'num' : fmt)) F(`format ${fmt} not valid for ${it.q}`); A.answer(st, n.sk, n.lv, ab[n.sk] >= n.lv, { fmt }) } }
  ['mc', 'num', 'frac', 'array', 'word'].forEach(f => { if (!used[f]) F('format never chosen: ' + f) }); var formatUse = used }
// 4) prerequisite graph: acyclic, every prerequisite is a real skill
const seen = {}; const visit = (k, path) => { if (path.includes(k)) F('cycle ' + path.concat(k)); (A.PREREQ[k] || []).forEach(p => { if (!L.SK[p]) F('unknown prereq ' + p); visit(p, path.concat(k)) }) }; A.ORDER.forEach(k => visit(k, []));
// 5) prerequisite gaps detected when prerequisite is weak
{ const ab = Object.fromEntries(A.ORDER.map(k => [k, 5])); ab.groups = 0; ab.mult = 1; const R = sim(ab, 0, 0, 3); if (!R.gaps.some(g => g.skill === 'mult' && g.prereq === 'groups')) F('gap mult<-groups not detected ' + JSON.stringify(R.gaps)) }
// 6) misconception tagging: every distractor explanation in the bank maps to a specific (non-"other") misconception
let tagged = 0, other = 0; const otherEx = [];
for (const s of L.SKILLS) for (let lv = 1; lv <= 6; lv++) for (let seed = 1; seed <= 200; seed++) { const it = L.item(s.id, lv, L.rng(seed * 11 + lv)); for (const w of Object.values(it.why)) { const c = A.misCode(w); if (c === 'other') { other++; if (otherEx.length < 12 && !otherEx.includes(w.replace(/\d+/g,'#'))) otherEx.push(w.replace(/\d+/g,'#')) } else tagged++ } }
if (other / (tagged + other) > .02) F(`untagged distractors ${other}/${tagged + other} e.g. ${otherEx.join(' | ')}`);
// 7) entry checking (numeric / fraction / array)
{ const it = { a: '1,200', why: { '120': 'Place-value slip' } }; if (!A.checkEntry(it, 'num', '1200').ok || !A.checkEntry(it, 'num', ' 1,200 ').ok || A.checkEntry(it, 'num', '120').ok || A.checkEntry(it, 'num', '120').why !== 'Place-value slip' || !A.checkEntry(it, 'num', 'abc').invalid) F('numeric entry check');
  const fr = { a: '3/4', why: {} }; if (!A.checkEntry(fr, 'frac', '3 / 4').ok || A.checkEntry(fr, 'frac', '6/8').ok) F('fraction entry check');
  const sh = { a: '2/8', why: {}, v: { op: 'frac' } }; if (!A.checkEntry(sh, 'frac', '1/4').ok || A.checkEntry(sh, 'frac', '1/8').ok) F('shaded-fraction equivalent check');
  const tp = { a: '1,200', why: {}, v: { op: 'add', x: [600, 600] } }; if (A.checkEntry(tp, 'num', '120').code !== 'placeval' || A.checkEntry(tp, 'num', '1100').code !== 'regroup') F('typed-slip inference');
  const ar = { a: 12, v: { op: 'mul', x: [3, 4] } }; if (!A.checkEntry(ar, 'array', { rows: 3, cols: 4 }).ok || !A.checkEntry(ar, 'array', { rows: 4, cols: 3 }).ok || A.checkEntry(ar, 'array', { rows: 3, cols: 5 }).ok) F('array check') }
// 8) reassessment + growth
{ const now = Date.now(); if (A.reassessDue({ diag: { t: now - 15 * 864e5, sess: 0 }, sessions: 1 }, now).due !== true) F('14-day reassess'); if (A.reassessDue({ diag: { t: now, sess: 2 }, sessions: 12 }, now).due !== true) F('10-session reassess'); if (A.reassessDue({ diag: { t: now, sess: 2 }, sessions: 3 }, now).due) F('not due yet');
  const g = A.growth([{ scale: 440, place: { mult: 2 } }, { scale: 500, place: { mult: 4 } }]); if (g.delta !== 60 || g.per.mult !== 2) F('growth') }
console.log(JSON.stringify({ formatUse, noisyAccuracyWithin1: +acc.toFixed(3), avgItemsPerDiagnostic: +avgItems.toFixed(1), studentsSimulated: students, distractorsTagged: tagged, distractorsUntagged: other, fails }, null, 1)); process.exit(fails.length ? 1 : 0);
