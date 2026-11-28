// Arcade cabinet math — independent answer key. Re-reads each question's TEXT (not the generator's fields), recomputes
// the right answer, and checks: exactly one choice is right, 4 different choices, the key is that choice, a reteach hint,
// grade-4 ranges, the standard is named. Also checks the XP wager rules (5/10/25, capped at 1/4 of XP, never below 0).
// Ends with a planted-error self-test so a broken checker can't pass.
const C = require('../src_learn/cabinets.js'); let fails = 0, n = 0;
const F = (m, it) => { if (fails++ < 25) console.log('FAIL', m, it ? JSON.stringify(it) : '') };
const num = s => { const t = String(s).replace(/,/g, ''); return /^\d+$/.test(t) ? +t : NaN };
const cents = s => { const m = /^\$(\d+)\.(\d\d)$/.exec(s); return m ? +m[1] * 100 + +m[2] : NaN };
const fr = s => { const m = /^(\d+)\/(\d+)$/.exec(s); return m ? [+m[1], +m[2]] : null };
const UNITS = { 'inches|feet': 12, 'feet|yards': 3, 'centimeters|meters': 100, 'meters|kilometers': 1000, 'grams|kilograms': 1000, 'milliliters|liters': 1000, 'minutes|hours': 60, 'seconds|minutes': 60, 'ounces|pounds': 16, 'hours|days': 24 };
const PLACE = { ten: 10, hundred: 100, thousand: 1000, 'ten thousand': 1e4, 'hundred thousand': 1e5 };
// returns true/false: is choice c right for the question text q
function isRight(q, c) { let m;
  if ((m = /^([\d,]+) × ([\d,]+) = \?$/.exec(q))) return num(c) === num(m[1]) * num(m[2]);
  if ((m = /^([\d,]+) ÷ (\d) = \?$/.exec(q))) { const k = /^(\d+) R (\d+)$/.exec(c); if (!k) return false; const N = num(m[1]), d = +m[2]; return +k[1] * d + +k[2] === N && +k[2] < d }
  if ((m = /^([\d,]+) \+ ([\d,]+) = \?$/.exec(q))) return num(c) === num(m[1]) + num(m[2]);
  if ((m = /^([\d,]+) − ([\d,]+) = \?$/.exec(q))) return num(c) === num(m[1]) - num(m[2]);
  if ((m = /^In ([\d,]+), what is the value of the (\d) in the ([a-z ]+) place\?$/.exec(q))) { const N = String(num(m[1])), P = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'].indexOf(m[3]); if (P < 0 || N[N.length - 1 - P] !== m[2]) return 'BADQ'; return num(c) === +m[2] * 10 ** P }
  if ((m = /^Round ([\d,]+) to the nearest ([a-z ]+)\.$/.exec(q))) { const p = PLACE[m[2]]; if (!p) return 'BADQ'; const N = num(m[1]); return num(c) === Math.floor((N + p / 2) / p) * p }
  if ((m = /^([\d,]+(?: \+ [\d,]+)+) = \?$/.exec(q))) return num(c) === m[1].split(' + ').reduce((s, x) => s + num(x), 0);
  if ((m = /^How many ([a-z]+) are in (\d+) ([a-z]+)\?$/.exec(q))) { const f = UNITS[m[1] + '|' + m[3]]; if (!f) return 'BADQ'; return num(c) === +m[2] * f }
  if ((m = /^(\d+) [a-z ]+ cost (\$\d+\.\d\d) each\. What is the total\?$/.exec(q))) return cents(c) === +m[1] * cents(m[2]);
  if ((m = /^You buy (\d+) [a-z ]+ at (\$\d+\.\d\d) each and pay with a (\$\d+\.\d\d) bill\. How much change do you get\?$/.exec(q))) { const tot = +m[1] * cents(m[2]), b = cents(m[3]); if (b <= tot) return 'BADQ'; return cents(c) === b - tot }
  if ((m = /^(\d+)\/(\d+) \+ (\d+)\/(\d+) = \?$/.exec(q))) { const f = fr(c); if (!f || m[2] !== m[4]) return false; return f[0] * +m[2] === (+m[1] + +m[3]) * f[1] }
  if (q === 'Which fraction is the GREATEST?') return 'CMP';
  if ((m = /^Team \w+ scored (\d+) goals\. Team \w+ scored (\d+) times as many\. How many goals did Team \w+ score\?$/.exec(q))) return num(c) === +m[1] * +m[2];
  if ((m = /^Team \w+ scored (\d+) goals\. That is (\d+) times as many as Team \w+\. How many goals did Team \w+ score\?$/.exec(q))) return num(c) * +m[2] === +m[1];
  if ((m = /^Which number is a factor of (\d+)\?$/.exec(q))) return num(c) > 1 && +m[1] % num(c) === 0 && num(c) < +m[1];
  if ((m = /^Which number is a multiple of (\d+)\?$/.exec(q))) return num(c) > 0 && num(c) % +m[1] === 0;
  if (q === 'Which number is PRIME?') { const v = num(c); if (v < 2) return false; for (let d = 2; d * d <= v; d++) if (v % d === 0) return false; return true }
  return 'BADQ' }
function check(it) { n++; const q = it.text;
  if (!C.KINDS[it.kind] || !/^4\./.test(it.std)) return F('standard not named', it);
  if (!Array.isArray(it.choices) || it.choices.length !== 4 || new Set(it.choices).size !== 4) return F('need 4 different choices', it);
  if (!it.choices.includes(it.ans)) return F('key is not one of the choices', it);
  if (!it.hint || it.hint.length < 25) return F('missing reteach hint', it);
  let right;
  if (q === 'Which fraction is the GREATEST?') { const fs = it.choices.map(fr); if (fs.some(f => !f || f[0] >= f[1] || ![2, 3, 4, 5, 6, 8, 10, 12].includes(f[1]))) return F('fraction out of grade 4 range', it);
    const val = f => f[0] / f[1]; const mx = Math.max(...fs.map(val)); right = it.choices.filter((c, i) => fs[i][0] * 1e6 === Math.round(mx * fs[i][1] * 1e6) || Math.abs(val(fs[i]) - mx) < 1e-12);
    // exact cross-multiply check for ties
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (fs[i][0] * fs[j][1] === fs[j][0] * fs[i][1]) return F('two equal fractions', it);
  } else { const r = it.choices.map(c => isRight(q, c)); if (r.includes('BADQ')) return F('question text not understood or inconsistent', it); right = it.choices.filter((c, i) => r[i] === true) }
  if (right.length !== 1) return F('exactly one right choice needed, found ' + right.length, it);
  if (right[0] !== it.ans) return F('key does not match the recomputed answer ' + right[0], it);
  for (const c of it.choices) { const v = num(c); if (!isNaN(v) && v > 1e6) return F('number above grade 4 range', it) }
  if (it.kind === 'div') { const d = +/÷ (\d)/.exec(q)[1]; if (d < 2 || d > 9) return F('divisor must be 1 digit', it) }
  return true }
const r = C.rng(20261128);
for (const k of Object.keys(C.KINDS)) for (let lv = 1; lv <= 3; lv++) for (let i = 0; i < 3000; i++) check(C.make(k, lv, r));
// wager rules
const W = (cond, m) => { n++; if (!cond) F('wager: ' + m) };
W(C.maxStake(100) === 25 && C.maxStake(39) === 9 && C.maxStake(0) === 0 && C.maxStake(-5) === 0, 'cap is 1/4 of XP');
W(!C.stakeOK(30, 10) && C.stakeOK(40, 10) && !C.stakeOK(1000, 50) && C.stakeOK(0, 0), 'only 5/10/25 within the cap, practice always OK');
for (let xp = 0; xp <= 400; xp++) for (const s of [0, 5, 10, 25, 50]) for (const ok of [true, false]) { const o = C.settle(xp, s, ok); W(o.after >= 0, 'never below 0'); W(o.after === xp + o.delta, 'after = xp + delta'); W(ok ? o.delta >= 0 : o.delta <= 0, 'right never loses, wrong never wins'); if (!C.stakeOK(xp, s)) W(o.stake === 0, 'over-cap stake becomes practice ' + xp + '/' + s); else if (s && ok) W(o.delta === 2 * s, 'win pays 2x stake'); else if (s && !ok) W(o.delta === -s, 'loss is the stake') }
// planted errors: the checker must catch them
const planted = [{ kind: 'mult', std: '4.NBT.B.5', text: '12 × 3 = ?', ans: '35', choices: ['35', '36', '26', '46'], hint: 'Break 12 apart by place value and add the parts.' },
  { kind: 'div', std: '4.NBT.B.6', text: '41 ÷ 4 = ?', ans: '9 R 5', choices: ['9 R 5', '10 R 2', '11 R 1', '10 R 0'], hint: 'Think 4 × ? ≤ 41, the remainder is less than 4.' },
  { kind: 'money', std: '4.MD.A.2', text: '2 slime tubs cost $1.15 each. What is the total?', ans: '$2.20', choices: ['$2.20', '$2.40', '$2.10', '$2.50'], hint: 'Multiply in cents: 2 × 115¢ and convert back to dollars.' }];
const before = fails; let caught = 0; const quiet = fails; for (const p of planted) { const f0 = fails; fails = 999; check(p); if (fails > 999) caught++; fails = f0 }
if (caught !== planted.length) { fails++; console.log('FAIL self-test: checker missed a planted error', caught) }
console.log(JSON.stringify({ check: 'cabinets', items: n, kinds: Object.keys(C.KINDS).length, fails }, null, 1)); process.exit(fails ? 1 : 0);
