// Verifies the Reteach Plan: content for every misconception (13) and standard (9), every number in lessons and exit tickets
// (eqcheck on written equations + an independent answer key per ticket item), and the plan logic on simulated classes.
global.window = global; const L = require('../src_learn/core.js'), A = require('../src_learn/assess.js'), D = require('../src_learn/depth.js'), R = require('../src_learn/reteach.js'), EQ = require('./eqcheck.js');
const fails = []; const F = m => { if (fails.length < 60) fails.push(m) }; let eqs = 0, keys = 0;
const gcd = (a, b) => b ? gcd(b, a % b) : a; const num = s => +String(s).replace(/,/g, '');
function key(k) { // independent recomputation
  if (k.e != null) { const v = EQ.evalSide(k.e.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−').replace(/−/g, '-')); return Number.isInteger(v) ? v : NaN }
  if (k.div) { const [a, b] = k.div; return `${Math.floor(a / b)} R${a % b}` } if (k.ceil) return Math.ceil(k.ceil[0] / k.ceil[1]); if (k.floor) return Math.floor(k.floor[0] / k.floor[1]); if (k.rem) return k.rem[0] % k.rem[1];
  if (k.round) { const [n, p] = k.round; return Math.floor(n / p + 0.5) * p } if (k.cmp) { const [x, y] = k.cmp; return x > y ? '>' : x < y ? '<' : '=' }
  if (k.feq) { const [n, d, D2] = k.feq; const v = n * D2 / d; return Number.isInteger(v) ? v : NaN } if (k.fcmp) { const [a, b, c, d] = k.fcmp; return a * d > c * b ? '>' : a * d < c * b ? '<' : '=' }
  if (k.fbig) { const [a, b, c, d] = k.fbig; return a * d > c * b ? `${a}/${b}` : `${c}/${d}` } if (k.fac) { const n = k.fac, f = []; for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i); return f.join(', ') }
  if (k.mults) { const [n, c] = k.mults; return Array.from({ length: c }, (_, i) => n * (i + 1)).join(', ') } if (k.isMult) return k.isMult[0] % k.isMult[1] === 0 ? 'yes' : 'no';
  if (k.prime) { const n = k.prime; let p = n > 1; for (let i = 2; i * i <= n; i++) if (n % i === 0) p = false; return p ? 'prime' : 'composite' }
  if (k.val) { const [n, dg] = k.val; const s = String(n); const i = s.indexOf(String(dg)); if (i < 0 || s.indexOf(String(dg), i + 1) >= 0) return NaN; return dg * 10 ** (s.length - 1 - i) } return NaN }
function checkPlan(tag, P, needEq) {
  for (const f of ['goal', 'why', 'model', 'guided', 'independent']) if (!(typeof P[f] === 'string' && P[f].length > 20)) F(`${tag} ${f} missing`);
  for (const f of ['why', 'model', 'guided', 'independent']) { const r = EQ.check(P[f]); eqs += r.n; if (r.bad.length) F(`${tag} ${f}: wrong equation ${r.bad.join(' | ')}`) }
  if (needEq && EQ.check(P.model).n + EQ.check(P.guided).n < 2) F(`${tag} lesson should show worked equations`);
  if (!(P.ticket.length >= 3 && P.ticket.length <= 5)) F(`${tag} exit ticket has ${P.ticket.length} questions`);
  P.ticket.forEach((t, i) => { keys++; const exp = key(t.k); if (String(exp) !== String(t.a)) F(`${tag} ticket ${i + 1} "${t.q}" answer ${t.a} but key says ${exp}`); const r = EQ.check(t.q); if (t.errq ? r.bad.length !== 1 : r.bad.length) F(`${tag} ticket ${i + 1} ${t.errq ? 'error-analysis item must show exactly one wrong equation' : 'wrong equation in question'}`);
    // numbers in the question must be the ones the key uses (no hidden numbers)
    const qn = (t.q.replace(/\d+\/\d+/g, m => ' ' + m.replace('/', ' ') + ' ').match(/\d[\d,]*/g) || []).map(num); const kn = JSON.stringify(t.k).match(/\d+/g).map(Number);
    if (!t.k.words && !kn.every(n => qn.includes(n) || [10, 100, 1000, 10000].includes(n))) F(`${tag} ticket ${i + 1} key numbers ${kn} not all in question`) }) }
// ---- content coverage
const codes = Object.keys(A.MISNAME); if (codes.length !== 13) F('expected 13 misconceptions, got ' + codes.length);
for (const c of codes) { const P = R.MIS[c]; if (!P) { F('no reteach content for misconception ' + c); continue } checkPlan('mis:' + c, P, c !== 'other'); if (c !== 'other' && !D.INT[P.mission]) F(`mis:${c} mission ${P.mission} not an in-game intervention`); if (c !== 'other' && !L.SK[P.skill]) F(`mis:${c} skill`) }
for (const s of L.SKILLS) { const P = R.SKP[s.id], S = R.STD[s.id]; if (!P || !S) { F('no reteach content for skill ' + s.id); continue } checkPlan('std:' + s.id, P, true); if (!/^4\.(OA|NBT|NF)\.[AB]\.\d/.test(S.code)) F(`std:${s.id} code ${S.code}`); if (S.code.split('.').slice(0, 3).join('.') !== s.std.split('.').slice(0, 3).join('.')) F(`std:${s.id} code ${S.code} vs skill ${s.std}`); if (!D.INT[S.mission]) F(`std:${s.id} mission ${S.mission}`) }
// ---- plan logic on simulated classes vs brute force
const DAY = 864e5, NOW = Date.UTC(2026, 10, 14); let classes = 0;
for (let seed = 1; seed <= 150; seed++) { const n = 3 + seed % 28; const cls = R.simulateClass(L, A, n, seed * 7 + 1, NOW); classes++;
  if (seed % 5 === 0) cls.push({ id: 'x', name: 'NoData', learn: { m: {}, log: [] } });
  const an = R.analyze(cls, NOW); const tag = 'class' + seed; const with_ = cls.filter(s => s.learn.log.length); if (an.withData !== with_.length) F(tag + ' withData');
  const since = NOW - R.WINDOW * DAY; const bf = {}; for (const s of with_) for (const e of s.learn.log) if (!e.ok && e.code && e.code !== 'other' && e.t >= since) { bf[e.code] = bf[e.code] || { st: new Set(), n: 0 }; bf[e.code].st.add(s.id); bf[e.code].n++ }
  const best = Object.entries(bf).sort((a, b) => b[1].st.size - a[1].st.size || b[1].n - a[1].n || a[0].localeCompare(b[0]))[0];
  if (best) { const m = an.mis[0]; if (m.code !== best[0] || m.students !== best[1].st.size || m.errors !== best[1].n) F(`${tag} top misconception ${m.code}/${m.students} vs ${best[0]}/${best[1].st.size}`); if (m.pct !== Math.round(best[1].st.size / with_.length * 100)) F(tag + ' pct');
    for (const x of an.mis) for (const sm of x.samples) { const ok = with_.some(s => s.name === sm.student && s.learn.log.some(e => !e.ok && e.code === x.code && e.q === sm.q && String(e.given) === sm.given)); if (!ok) F(`${tag} sample not from real results`); if (sm.given === sm.answer) F(`${tag} sample wrong answer equals answer`) }
    const p = R.planFor('mis', m.code, an); const names = p.groups.flatMap(g => g.students); if (names.length !== m.students || new Set(names).size !== names.length) F(`${tag} mis groups ${names.length} vs ${m.students}`); if (p.groups.some(g => g.students.length > 6)) F(tag + ' group > 6') }
  if (an.mis.length > 3) F(tag + ' more than top 3');
  // standards brute force
  const sb = L.SKILLS.map(s => { const rows = with_.filter(st => st.learn.log.some(e => e.sk === s.id && e.t >= since) || (st.learn.diag && st.learn.diag.place && st.learn.diag.place[s.id])).map(st => st.learn.m[s.id].lv); return { sk: s.id, below: rows.filter(l => l <= 2).length, n: rows.length, mean: rows.reduce((a, b) => a + b, 0) / (rows.length || 1) } }).filter(x => x.n);
  sb.sort((a, b) => b.below - a.below || b.below / b.n - a.below / a.n || a.mean - b.mean); const s0 = an.std[0];
  if (s0.below !== sb[0].below) F(`${tag} top standard below ${s0.sk}/${s0.below} vs ${sb[0].sk}/${sb[0].below}`);
  for (const s of an.std) { if (s.below + s.approaching + s.on !== s.assessed) F(tag + ' bands'); const p = R.planFor('std', s.sk, an); const all = p.groups.flatMap(g => g.students); if (all.length !== s.assessed || new Set(all).size !== all.length) F(`${tag} std groups ${all.length}/${s.assessed}`); if (!p.groups.filter(g => !g.extension).every(g => g.students.length <= 6)) F(tag + ' std group > 6') }
  for (let i = 1; i < an.std.length; i++) if (an.std[i].below > an.std[i - 1].below) F(tag + ' std order');
  const csv = R.csv(an, [R.planFor('mis', an.mis[0].code, an), R.planFor('std', s0.sk, an)]); if (!/MISCONCEPTIONS/.test(csv) || !/Exit ticket/.test(csv) || !/Answer|answer/.test(csv)) F(tag + ' csv');
  for (const s of cls) for (const e of s.learn.log) if (!e.ok && e.given != null) { const it = null; if (String(e.given) === e.ans) F(tag + ' simulated wrong answer equals answer') } }
// ---- empty / never invent / ties / "no evidence on a skill" not counted
{ const e1 = R.analyze([], NOW), e2 = R.analyze([{ id: 'a', name: 'A', learn: { m: { mult: { lv: 1 } }, log: [] } }], NOW); if (!e1.empty || !e2.empty || e2.n !== 1) F('empty state'); }
{ const mk = (id, codes) => ({ id, name: id, learn: { m: { addsub: { lv: 3 }, divide: { lv: 3 } }, log: codes.map((c, i) => ({ t: NOW - i * 1000, sk: c === 'regroup' ? 'addsub' : 'divide', lv: 3, ok: 0, code: c })) } });
  const an = R.analyze([mk('A', ['regroup', 'remainder']), mk('B', ['regroup', 'remainder']), Object.assign(mk('C', []), { learn: { m: { addsub: { lv: 4 } }, log: [{ t: NOW, sk: 'addsub', lv: 4, ok: 1 }] } })], NOW);
  if (!an.misTie || !(an.misTiedWith.includes('regroup') && an.misTiedWith.includes('remainder'))) F('tie not detected'); if (an.mis[0].pct !== 67) F('pct with a student who has no errors');
  if (an.std.some(s => !['addsub', 'divide'].includes(s.sk))) F('standards without evidence were counted (invented data)'); if (an.mis[0].samples.length) F('samples invented without saved answers') }
{ const an = R.analyze([{ id: 'a', name: 'A', learn: { m: { mult: { lv: 5 } }, log: [{ t: NOW, sk: 'mult', lv: 5, ok: 1 }] } }], NOW); if (an.mis.length || !an.noStruggle || an.std[0].below !== 0) F('all-correct class') }
{ const old = R.analyze([{ id: 'a', name: 'A', learn: { m: { mult: { lv: 2 } }, log: [{ t: NOW - 90 * DAY, sk: 'mult', lv: 2, ok: 0, code: 'partial' }] } }], NOW); if (old.mis.length) F('results older than the window counted') }
// ---- self-test: the checker must catch a planted mistake in a lesson and in a ticket key
{ if (!EQ.check(R.MIS.partial.model.replace('= 322', '= 323')).bad.length) F('self-test: planted lesson error not caught'); if (String(key({ e: '34×26' })) === '885') F('self-test key'); if (key({ round: [3650, 100] }) !== 3700 || key({ div: [38, 5] }) !== '7 R3' || key({ fac: 18 }) !== '1, 2, 3, 6, 9, 18') F('self-test key functions') }
console.log(JSON.stringify({ check: 'reteach', misconceptions: codes.length, standards: L.SKILLS.length, equationsChecked: eqs, ticketKeys: keys, simulatedClasses: classes, fails }, null, 1)); process.exit(fails.length ? 1 : 0);
