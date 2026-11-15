// Verifies Weakness Challenges: target selection (gaps, building blocks first, repeated misconceptions, Memory Check rematches,
// teacher assignments, cool-down, stretch), adaptive difficulty, battle progression, rewards/streaks/badges, gap report,
// item targeting for every misconception, and that Brock stays playful (no insults).
global.window = global; const L = require('../src_learn/core.js'), A = require('../src_learn/assess.js'), D = require('../src_learn/depth.js'), C = require('../src_learn/challenge.js'), CL = require('../src_learn/classroom.js'), R = require('../src_learn/reteach.js');
const fails = []; const F = m => { if (fails.length < 60) fails.push(m) }; const DAY = 864e5, NOW = Date.UTC(2026, 10, 14, 15);
const SK = Object.keys(C.PRE); let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const mk = lv => ({ m: Object.fromEntries(SK.map(k => [k, { lv: lv[k] || 4 }])), log: [], diag: { scale: 470 } });
// ---- content: every skill/misconception has a Brock variant, a trick and reteach content; Brock is never cruel
const BAD = /\b(stupid|dumb|idiot|loser|ugly|fat|hate|shut up|baby|weird|freak|crybaby|moron)\b/i;
for (const k of SK) { if (!C.SPOT[k] || !C.TITLE[k] || !C.TRICK[C.SKILLTRICK[k]]) F('variant missing ' + k); if (!R.SKP[k]) F('reteach content missing ' + k) }
for (const c of Object.keys(A.MISNAME)) { if (!C.TRICK[c]) F('trick missing ' + c); if (c !== 'other' && !C.MISSKILL[c]) F('skill map ' + c); if (!R.MIS[c]) F('reteach content ' + c) }
for (const t of [].concat(Object.values(C.TRICK), Object.values(C.TITLE), C.HITTXT, C.REDEEM)) if (BAD.test(t)) F('not kid-appropriate: ' + t);
if (C.REDEEM.length < 2 || !C.REDEEM.every(r => /friend|show me|teach me|cool/i.test(r))) F('Brock must be redeemed/friendly after defeat');
// tricks for misconceptions must actually be wrong math that the matching items target
for (const c of Object.keys(C.MISSKILL).filter(c => c !== 'array' /* only detectable in the array-builder format; challenge falls back to equal-groups items */)) { const its = D.targetItems(c, L, A, 3, rnd, 4); const hit = its.filter(it => Object.values(it.why || {}).some(w => A.misCode(w) === c)).length; if (hit < 3) F(`only ${hit}/4 challenge items target ${c}`); its.forEach(it => { if (!it.ch.map(String).includes(String(it.a))) F('item answer not in choices ' + c) }) }
// ---- selection
{ const t = C.pick(mk({ groups: 1, mult: 1 }), NOW); if (t.sk !== 'groups') F('building block (groups) should come before mult: got ' + t.sk) }
{ const t = C.pick(mk({ placevalue: 2, rounding: 1, addsub: 2 }), NOW); if (t.sk !== 'placevalue') F('prerequisite placevalue first, got ' + t.sk) }
{ const t = C.pick(mk({ fractions: 1, rounding: 3 }), NOW); if (t.sk !== 'fractions' || !/gap/i.test(t.why)) F('biggest gap first: ' + t.sk + ' ' + t.why) }
{ const l = mk({ rounding: 3 }); for (let i = 0; i < 4; i++) l.log.push({ t: NOW - i * 3600e3, sk: 'divide', lv: 4, ok: 0, code: 'remainder' }); const t = C.pick(l, NOW); if (t.kind !== 'mis' || t.code !== 'remainder') F('repeated misconception should become the challenge: ' + t.key) }
{ const t = C.pick(mk({}), NOW); if (!t.stretch || t.startLv !== 5) F('stretch challenge at grade level: ' + JSON.stringify(t)) }
{ const l = mk({ groups: 1 }); CL.applyAssignment({ learn: l }, CL.assignment('Ms. Okafor', [{ type: 'challenge', code: 'fraction' }], 'all', NOW)); const t = C.pick(l, NOW); if (t.code !== 'fraction' || !t.assigned || !/Ms\. Okafor/.test(t.why)) F('teacher-assigned challenge first: ' + t.key) }
// ---- adaptive difficulty
if (C.nextLevel(3, [{ first: true }, { first: true }]) !== 4 || C.nextLevel(3, [{ first: false }]) !== 2 || C.nextLevel(1, [{ first: false }]) !== 1 || C.nextLevel(6, [{ first: 1 }, { first: 1 }]) !== 6 || C.nextLevel(3, [{ first: true }]) !== 3) F('nextLevel');
// ---- full progression on simulated students: reteach -> guided x2 -> boss -> memory in 3 days
let sims = 0, wins = 0, climbs = 0;
for (let s = 0; s < 400; s++) { const ab = s % 4 === 0 ? 0.2 : 0.55 + rnd() * 0.4; const lv = {}; SK.forEach(k => lv[k] = 1 + Math.floor(rnd() * 4)); const l = mk(lv); let now = NOW;
  for (let day = 0; day < 8; day++) { now = NOW + day * DAY; const t = C.pick(l, now); const b = C.battle(t, now); sims++;
    if (t.stage !== 'memory') { if (b.stage !== 'reteach') F('starts with reteach'); C.advance(b); if (b.stage !== 'guided') F('then guided'); for (let g = 0; g < 2; g++) { C.answer(b, rnd() < ab, true); C.advance(b) } if (b.stage !== 'boss' || b.lv !== t.startLv) F('boss at start level ' + b.stage) }
    let n = 0; while (b.stage !== 'done' && n < 20) { const ok = rnd() < ab; C.answer(b, ok, ok); n++ } if (b.stage !== 'done') F('battle never ends');
    if (t.stage !== 'memory' && n > C.MAX_BOSS_ITEMS) F('boss too long ' + n); if (b.result === 'defeated' && b.hits !== b.need) F('defeated without enough hits');
    if (b.items.some(x => x.lv < 1 || x.lv > 6)) F('level out of range'); const before = C.state(l).history.length; const out = C.finish(l, b, now);
    if (C.state(l).history.length !== before + 1) F('history'); if (out.rec.defeated) { wins++; if (out.rec.stage === 'boss' && !(out.rec.memAt === now + 3 * DAY)) F('memory check scheduled in 3 days'); if (out.coins <= 0) F('reward') } if (out.rec.maxLv > out.rec.startLv) climbs++;
    if (!C.doneToday(l, now)) F('done today') } }
if (wins < sims * 0.4) F(`too few wins ${wins}/${sims}`); if (!climbs) F('difficulty never climbs');
// memory check becomes top priority when due; pass -> gap-closed badge; slip -> retried next day
{ const l = mk({ rounding: 1 }); const t = C.pick(l, NOW); const b = C.battle(t, NOW); C.advance(b); C.advance(b); C.advance(b); for (let i = 0; i < 5; i++) C.answer(b, true, true); const o = C.finish(l, b, NOW);
  if (!o.badges.some(x => x.id === 'first')) F('first-defeat badge'); if (!o.badges.some(x => x.id === 'climber')) F('climber badge after levelling up in battle');
  const t2 = C.pick(l, NOW + 1 * DAY); if (t2.sk === 'rounding') F('cool-down: same target the next day'); const t3 = C.pick(l, NOW + 3 * DAY + 1); if (t3.stage !== 'memory' || t3.sk !== 'rounding') F('memory rematch due after 3 days: ' + t3.key + ' ' + t3.stage);
  const m = C.battle(t3, NOW + 3 * DAY + 1); if (m.stage !== 'memory' || m.need !== 2 || m.max !== 3) F('memory battle shape'); C.answer(m, false, false); C.answer(m, false, false); if (m.stage !== 'done' || m.result !== 'slipped') F('memory slip ends early: ' + m.result);
  C.finish(l, m, NOW + 3 * DAY + 2); const t4 = C.pick(l, NOW + 4 * DAY + 3); if (t4.stage !== 'memory') F('slipped memory retried next day');
  const m2 = C.battle(t4, NOW + 4 * DAY + 3); C.answer(m2, true, true); C.answer(m2, true, true); const o2 = C.finish(l, m2, NOW + 4 * DAY + 4); if (!o2.badges.some(x => x.id === 'block_rounding')) F('gap-closed badge after memory pass');
  if (C.pick(l, NOW + 9 * DAY).stage === 'memory' && C.pick(l, NOW + 9 * DAY).sk === 'rounding') F('passed memory check should not repeat') }
// streaks
{ const l = mk({ groups: 1 }); for (let d = 0; d < 7; d++) { const t = C.pick(l, NOW + d * DAY); const b = C.battle(t); b.result = 'escaped'; b.stage = 'done'; C.finish(l, b, NOW + d * DAY) } const st = C.state(l); if (st.streak.n !== 7 || !st.badges.some(x => x.id === 'streak3') || !st.badges.some(x => x.id === 'streak7')) F('streak 7: ' + st.streak.n);
  const b = C.battle(C.pick(l, NOW + 9 * DAY)); b.result = 'escaped'; b.stage = 'done'; C.finish(l, b, NOW + 9 * DAY); if (C.state(l).streak.n !== 1) F('streak resets after a missed day') }
// quitting never counts as a streak day or a win
{ const l = mk({ groups: 1 }); const b = C.battle(C.pick(l, NOW)); const o = C.finish(l, b, NOW); if (o.rec.defeated || C.doneToday(l, NOW)) F('quit counted') }
// teacher assignment status
{ const s = { id: 's1', name: 'A', learn: mk({ divide: 1 }) }; const a = CL.assignment('T', [{ type: 'challenge', code: 'remainder' }], 'all', NOW - 1000); CL.applyAssignment(s, a); let st = CL.assignmentStatus(s, a); if (st.complete) F('challenge status open');
  const t = C.pick(s.learn, NOW); const b = C.battle(t, NOW); C.advance(b); C.advance(b); C.advance(b); for (let i = 0; i < 5; i++) C.answer(b, true, true); C.finish(s.learn, b, NOW); st = CL.assignmentStatus(s, a); if (!st.complete) F('challenge status complete after defeat');
  if (!C.state(s.learn).queue[0].done) F('queue item marked done'); if (C.pick(s.learn, NOW + 3600e3).assigned) F('done assignment repeats') }
// gap report: then vs now vs closed
{ const st = [['A', 1, 3], ['B', 2, 2], ['C', 1, 4], ['D', 3, 1], ['E', null, 1]].map(([n, b, lv]) => ({ name: n, learn: { base: b ? { mult: b } : {}, m: { mult: { lv } } } })); const g = C.gapReport(st).find(x => x.sk === 'mult');
  if (g.n !== 4 || g.start !== 3 || g.now !== 2 || g.closed !== 2 || g.closedNames.join() !== 'A,C') F('gap report ' + JSON.stringify(g)) }
console.log(JSON.stringify({ check: 'challenge', simulatedBattles: sims, wins, climbs, fails }, null, 1)); process.exit(fails.length ? 1 : 0);
