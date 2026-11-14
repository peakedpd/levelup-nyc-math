// Verifies every LevelUp Learn generator: all 9 skills × 6 levels × 3000 seeds.
const L = require('../src_learn/core.js'), AK = require('./answer_key.js');
const num = s => +String(s).replace(/,/g, '');
const txtNums = q => (q.match(/\d[\d,]*/g) || []).map(num);
const fails = []; let n = 0; const F = (t, m) => { if (fails.length < 80) fails.push(t + ': ' + m) };
const cnt = {};
for (const s of L.SKILLS) for (let lv = 1; lv <= 6; lv++) for (let seed = 1; seed <= 3000; seed++) {
  const it = L.item(s.id, lv, L.rng(seed * 97 + lv * 13 + s.id.length * 7)); n++; const tag = `${s.id} L${lv} seed${seed} "${it.q}"`;
  const r = AK.check(it, s.id); r.problems.forEach(m => F(tag, m));
  cnt[s.id] = (cnt[s.id] || 0) + 1;
}
// placement logic sanity: every right/wrong path lands on a level 1-6, and all-right → 6, all-wrong → 1
const pl = [[1, 1], [1, 0], [0, 1], [0, 0]].map(([a, b]) => L.diagPlace({ asked: [{ ok: !!a }, { ok: !!b }] }));
if (pl.join() !== '6,4,2,1') fails.push('diagPlace ' + pl);
// mastery model: 5 right at L1 → L2; 4 wrong → stays/drops
{ const m = { lv: 1 }; for (let i = 0; i < 5; i++) L.applyResult(m, true); if (m.lv !== 2) fails.push('mastery up broken'); const m2 = { lv: 3 }; for (let i = 0; i < 4; i++) L.applyResult(m2, false); if (m2.lv !== 2) fails.push('mastery down broken') }
console.log(JSON.stringify({ itemsChecked: n, perSkill: cnt, placement: pl, fails }, null, 1)); process.exit(fails.length ? 1 : 0);
