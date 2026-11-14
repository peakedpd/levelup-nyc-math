// Verifies every LevelUp Learn generator: all 9 skills × 6 levels × 3000 seeds.
const L = require('../src_learn/core.js');
const num = s => +String(s).replace(/,/g, '');
const txtNums = q => (q.match(/\d[\d,]*/g) || []).map(num);
const fails = []; let n = 0; const F = (t, m) => { if (fails.length < 80) fails.push(t + ': ' + m) };
const cnt = {};
for (const s of L.SKILLS) for (let lv = 1; lv <= 6; lv++) for (let seed = 1; seed <= 3000; seed++) {
  const it = L.item(s.id, lv, L.rng(seed * 97 + lv * 13 + s.id.length * 7)); n++; const tag = `${s.id} L${lv} seed${seed} "${it.q}"`; const v = it.v, T = txtNums(it.q);
  const has = (...xs) => xs.every(x => T.includes(x));
  let exp;
  switch (v.op) {
    case 'mul': exp = v.x[0] * v.x[1]; if (!has(...v.x)) F(tag, 'operands not in text'); break;
    case 'div': exp = v.x[0] / v.x[1]; if (!Number.isInteger(exp)) F(tag, 'non-integer quotient'); if (!has(...v.x) && !(s.id === 'placevalue')) F(tag, 'operands not in text'); if (s.id === 'placevalue' && !has(v.x[0])) F(tag, 'operand not in text'); break;
    case 'mulsub': exp = v.x[0] * v.x[1] - v.x[2]; if (!has(...v.x)) F(tag, 'operands not in text'); break;
    case 'muladd': exp = v.x[0] * v.x[1] + v.x[2]; if (!has(...v.x)) F(tag, 'operands not in text'); break;
    case 'add': exp = v.x[0] + v.x[1]; if (!has(...v.x)) F(tag, 'operands not in text'); break;
    case 'sub': exp = v.x[0] - v.x[1]; if (!has(...v.x)) F(tag, 'operands not in text'); if (exp <= 0) F(tag, 'non-positive difference'); break;
    case 'sum': exp = v.x.reduce((a, b) => a + b, 0); if (it.q.startsWith('What number is') && !has(...v.x.filter(x => x > 0))) F(tag, 'parts not in text'); break;
    case 'digitval': { const s2 = String(v.N); const d = +s2[s2.length - 1 - v.pos]; exp = d * 10 ** v.pos; if (!has(v.N, d)) F(tag, 'N/digit not in text'); if ((s2.match(new RegExp(d, 'g')) || []).length !== 1) F(tag, 'digit not unique'); break }
    case 'cmp': exp = v.x[0] > v.x[1] ? '>' : v.x[0] < v.x[1] ? '<' : '='; if (!has(...v.x)) F(tag, 'operands not in text'); break;
    case 'round': exp = Math.round(v.N / v.p) * v.p; if (v.N % v.p * 2 === v.p) exp = (Math.floor(v.N / v.p) + 1) * v.p; if (!has(v.N)) F(tag, 'N not in text'); break;
    case 'divrem': exp = `${Math.floor(v.x[0] / v.x[1])} R ${v.x[0] % v.x[1]}`; if (v.x[0] % v.x[1] === 0) F(tag, 'no remainder'); if (!has(...v.x)) F(tag, 'operands not in text'); break;
    case 'factor': exp = it.a; if (v.N % it.a) F(tag, 'not a factor'); it.ch.filter(c => c !== it.a).forEach(c => { if (v.N % c === 0) F(tag, 'distractor ' + c + ' is also a factor') }); break;
    case 'multiple': exp = it.a; if (it.a % v.k) F(tag, 'not a multiple'); it.ch.filter(c => c !== it.a).forEach(c => { if (c % v.k === 0) F(tag, 'distractor ' + c + ' is also a multiple') }); break;
    case 'nfactors': exp = L.factorsOf(v.N).length; break;
    case 'prime': exp = it.a; if (!L.isPrime(it.a)) F(tag, 'answer not prime'); it.ch.filter(c => c !== it.a).forEach(c => { if (L.isPrime(c)) F(tag, 'distractor prime ' + c) }); break;
    case 'notfactor': exp = it.a; if (v.N % it.a === 0) F(tag, 'answer IS a factor'); it.ch.filter(c => c !== it.a).forEach(c => { if (v.N % c) F(tag, 'distractor ' + c + ' is also not a factor') }); break;
    case 'ceildiv': exp = Math.ceil(v.x[0] / v.x[1]); if (!has(...v.x)) F(tag, 'operands not in text'); break;
    case 'floordiv': exp = Math.floor(v.x[0] / v.x[1]); if (!has(...v.x)) F(tag, 'operands not in text'); break;
    case 'frac': exp = `${v.n}/${v.d}`; break;
    case 'equiv': exp = v.n * v.k; if (!it.q.includes(`${v.n}/${v.d}`) || !it.q.includes('/' + v.d * v.k)) F(tag, 'fractions not in text'); break;
    case 'fcmp': { const [a, b, c, d] = v.x; const k = a * d - c * b; exp = k > 0 ? '>' : k < 0 ? '<' : '='; if (!it.q.includes(`${a}/${b}`) || !it.q.includes(`${c}/${d}`)) F(tag, 'fractions not in text'); break }
    case 'equivpick': { exp = it.a; const [p, q] = it.a.split('/').map(Number); if (p * v.d !== q * v.n) F(tag, 'answer not equivalent'); it.ch.filter(c => c !== it.a).forEach(c => { const [x, y] = c.split('/').map(Number); if (x * v.d === y * v.n) F(tag, 'distractor ' + c + ' also equivalent') }); break }
    default: F(tag, 'unknown op ' + v.op);
  }
  const A = typeof it.a === 'string' && /^[\d,]+$/.test(it.a) ? num(it.a) : it.a;
  if (String(A) !== String(exp)) F(tag, `answer ${it.a} expected ${exp}`);
  if (!it.ch.some(c => String(c) === String(it.a))) F(tag, 'answer not in choices');
  if (new Set(it.ch.map(String)).size !== it.ch.length) F(tag, 'duplicate choices');
  const minCh = (it.ch.includes('<') || it.ch.includes('>')) ? 3 : 4; if (it.ch.length < minCh) F(tag, 'only ' + it.ch.length + ' choices ' + JSON.stringify(it.ch));
  for (const k in it.why) if (k === String(it.a)) F(tag, 'misconception text attached to the right answer');
  if (it.ch.some(c => typeof c === 'number' && (c < 0 || !Number.isInteger(c)))) F(tag, 'bad numeric choice');
  // distinct answers that are numerically equal to the key (e.g. "1,000" vs 1000) would be unfair
  if (it.ch.filter(c => String(c) !== String(it.a) && String(num(c)) === String(num(it.a)) && !isNaN(num(c))).length) F(tag, 'equal-valued distractor');
  cnt[s.id] = (cnt[s.id] || 0) + 1;
}
// placement logic sanity: every right/wrong path lands on a level 1-6, and all-right → 6, all-wrong → 1
const pl = [[1, 1], [1, 0], [0, 1], [0, 0]].map(([a, b]) => L.diagPlace({ asked: [{ ok: !!a }, { ok: !!b }] }));
if (pl.join() !== '6,4,2,1') fails.push('diagPlace ' + pl);
// mastery model: 5 right at L1 → L2; 4 wrong → stays/drops
{ const m = { lv: 1 }; for (let i = 0; i < 5; i++) L.applyResult(m, true); if (m.lv !== 2) fails.push('mastery up broken'); const m2 = { lv: 3 }; for (let i = 0; i < 4; i++) L.applyResult(m2, false); if (m2.lv !== 2) fails.push('mastery down broken') }
console.log(JSON.stringify({ itemsChecked: n, perSkill: cnt, placement: pl, fails }, null, 1)); process.exit(fails.length ? 1 : 0);
