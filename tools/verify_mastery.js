// Verifies the P2 mastery model (src_learn/mastery.js) and every transfer (unfamiliar-context) item.
const M = require('../src_learn/mastery.js'), L = require('../src_learn/core.js');
const fails = []; const F = m => { if (fails.length < 60) fails.push(m) }; const DAY = 864e5;
const fresh = lv => ({ lv: lv || 1, recent: [], n: 0, ok: 0, taught: 0 });
const feed = (m, list, t0) => { let t = t0 || 1e12, ev = []; for (const e of list) { t += 60000; ev.push(M.apply(m, Object.assign({ lv: m.lv }, e), t)) } return { ev, t } };
const good = [{ first: 1, rep: 'visual' }, { first: 1, rep: 'visual' }, { first: 1, rep: 'typed', ind: 1 }, { first: 1, rep: 'transfer', ind: 1, transfer: 1 }, { first: 1, rep: 'symbolic', ind: 1 }];
// 1) full evidence -> level up
{ const m = fresh(2); const r = feed(m, good); if (m.lv !== 3 || !r.ev.includes('up')) F('full evidence should level up'); if (!m.checks.some(c => c.lv === 2)) F('passing a level should schedule a Memory Check') }
// 2) correct only after retries (not first attempt) -> no level up
{ const m = fresh(2); feed(m, good.map(e => Object.assign({}, e, { first: 0 }))); feed(m, good.map(e => Object.assign({}, e, { first: 0 }))); if (m.lv > 2) F('second-try answers must not level up') }
// 3) one representation only -> no level up
{ const m = fresh(2); feed(m, Array(8).fill({ first: 1, rep: 'visual', ind: 1 })); if (m.lv !== 2) F('single representation must not level up') }
// 4) never independent (always hints/tools) -> no level up
{ const m = fresh(2); feed(m, Array(8).fill(0).map((_, i) => ({ first: 1, rep: i % 2 ? 'visual' : 'typed', ind: 0 }))); if (m.lv !== 2) F('no independent evidence must not level up') }
// 5) 80% first-try boundary: 3/5 is not enough, 4/5 is
{ const m = fresh(3); feed(m, [{ first: 1, rep: 'visual' }, { first: 0, rep: 'visual' }, { first: 1, rep: 'typed', ind: 1 }, { first: 0, rep: 'typed' }, { first: 1, rep: 'symbolic', ind: 1 }]); if (m.lv !== 3) F('3/5 first-try must not pass');
  const m2 = fresh(3); feed(m2, [{ first: 1, rep: 'visual' }, { first: 0, rep: 'visual' }, { first: 1, rep: 'typed', ind: 1 }, { first: 1, rep: 'typed' }, { first: 1, rep: 'symbolic', ind: 1 }]); if (m2.lv !== 4) F('4/5 first-try with 2 reps + independent should pass') }
// 6) struggling -> level down
{ const m = fresh(4); feed(m, [{ first: 0 }, { first: 0 }, { first: 0 }, { first: 0 }]); if (m.lv !== 3) F('struggling should step down a level') }
// 7) mastery needs L6 + delayed retention + transfer
{ const m = fresh(6); const r = feed(m, good); if (m.done) F('L6 pass alone must not be mastery'); if (!m.secure) F('L6 pass should mark secure'); if (!m.transfer) F('transfer evidence should be recorded');
  const due0 = M.dueChecks(m, r.t + 1 * DAY); if (due0.length) F('Memory Check must not be due after 1 day');
  const due = M.dueChecks(m, r.t + 3 * DAY + 1); if (!due.some(c => c.lv === 6)) F('Memory Check should be due at +3 days');
  const out = M.checkResult(m, 6, [{ first: 1, ind: 1 }, { first: 1, ind: 1 }], r.t + 3 * DAY + 2); if (out !== 'mastered' || !m.done) F('passing delayed check after secure+transfer should master, got ' + out);
  const nx = m.checks.find(c => c.lv === 6); if (!nx || Math.round((nx.at - (r.t + 3 * DAY + 2)) / DAY) !== 7) F('next spacing should be +7 days') }
// 8) mastery without transfer stays "needs transfer"
{ const m = fresh(6); const r = feed(m, good.map(e => Object.assign({}, e, { transfer: 0, rep: e.rep === 'transfer' ? 'story' : e.rep }))); M.checkResult(m, 6, [{ first: 1, ind: 1 }, { first: 1, ind: 1 }], r.t + 4 * DAY); if (m.done) F('no transfer -> not mastered');
  M.apply(m, { lv: 6, first: 1, ind: 1, rep: 'transfer', transfer: 1 }, r.t + 5 * DAY); if (!m.done) F('transfer later should complete mastery') }
// 9) failed Memory Check -> back to that level, mastery removed
{ const m = fresh(3); const r = feed(m, good); if (m.lv !== 4) F('setup'); const out = M.checkResult(m, 3, [{ first: 0, ind: 1 }, { first: 0, ind: 1 }], r.t + 3 * DAY + 5); if (out !== 'slipped' || m.lv !== 3) F('forgotten level should send student back, got ' + out + ' lv ' + m.lv) }
// 10) diagnostic retakes never erase evidence or mastery
{ const m = fresh(6); const r = feed(m, good); M.checkResult(m, 6, [{ first: 1, ind: 1 }, { first: 1, ind: 1 }], r.t + 3 * DAY + 5); const evN = m.ev.length;
  const o = M.retake(m, 2, 3, r.t + 4 * DAY); if (!m.done || m.lv !== 6 || m.ev.length !== evN) F('retake must keep mastery + evidence'); if (o !== 'kept-mastery' || !M.dueChecks(m, r.t + 4 * DAY + 1).some(c => c.lv === 6)) F('low retake on a mastered skill should schedule an immediate Memory Check');
  const m2 = fresh(2); feed(m2, good.slice(0, 3)); const n2 = m2.ev.length; M.retake(m2, 4, 5); if (m2.lv !== 5 || m2.ev.length !== n2 || m2.diagEv.length !== 1) F('higher retake moves up and keeps evidence');
  const m3 = fresh(5); M.retake(m3, 1, 2); if (m3.lv !== 5 || !m3.checks.length) F('much lower retake keeps level and schedules a check instead') }
// 11) pct is monotone-ish and 100 only when mastered
{ const m = fresh(1); let last = -1, bad = 0; for (let i = 0; i < 40; i++) { M.apply(m, Object.assign({ lv: m.lv }, good[i % 5]), 1e12 + i * 6e4); const p = M.pct(m); if (p < last - 20) bad++; last = p } if (bad) F('pct jumps backwards'); if (M.pct(m) >= 100 && !m.done) F('100% before mastered') }
// 12) transfer items: same answer + choices as the source item, every number in the context appears, answer recomputed from v
const num = s => +String(s).replace(/,/g, '');
const calc = (v) => ({ mul: () => v.x[0] * v.x[1], div: () => v.x[0] / v.x[1], add: () => v.x[0] + v.x[1], sub: () => v.x[0] - v.x[1], muladd: () => v.x[0] * v.x[1] + v.x[2], mulsub: () => v.x[0] * v.x[1] - v.x[2], ceildiv: () => Math.ceil(v.x[0] / v.x[1]), floordiv: () => Math.floor(v.x[0] / v.x[1]),
  round: () => Math.round(v.N / v.p) * v.p, divrem: () => `${Math.floor(v.x[0] / v.x[1])} R ${v.x[0] % v.x[1]}`, frac: () => `${v.n}/${v.d}`, equiv: () => v.n * v.k, digitval: () => v.a })[v.op];
let tn = 0, cover = {}; for (const s of L.SKILLS) for (let lv = 1; lv <= 6; lv++) for (let seed = 1; seed <= 400; seed++) { const it = L.item(s.id, lv, L.rng(seed * 13 + lv)); const t = M.transfer(it, L.rng(seed)); if (!t) continue; tn++; cover[s.id] = (cover[s.id] || 0) + 1;
  if (String(t.a) !== String(it.a) || JSON.stringify(t.ch) !== JSON.stringify(it.ch)) F('transfer changed answer/choices ' + t.q); if (t.q === it.q) F('transfer reused the same text'); if (!t.transfer || t.vis) F('transfer flags');
  const c = calc(it.v); if (c) { const exp = c(); if (String(exp) !== String(it.a).replace(/,/g, '') && num(exp) !== num(it.a)) F(`recomputed ${exp} != ${it.a} for ${t.q}`) }
  const qn = (t.q.match(/\d[\d,]*/g) || []).map(num); const need = (it.v.x || []).concat(it.v.N != null ? [it.v.N] : []); for (const n of need) if (!qn.includes(n)) { F(`number ${n} missing from transfer text: ${t.q}`); break } }
for (const s of L.SKILLS) if (!cover[s.id]) F('no transfer items for ' + s.id);
console.log(JSON.stringify({ transferItemsChecked: tn, transferCoverage: cover, fails }, null, 1)); process.exit(fails.length ? 1 : 0);
