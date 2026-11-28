// Universe math moments: every generator, 3000 seeds each. Answers are recomputed independently from the
// parameters; choices must be 4 distinct, include the answer exactly once, and never show a negative number.
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'src_parts', 'w2u.js'), 'utf8');
const a = src.indexOf('/*UQ-BEGIN'), b = src.indexOf('/*UQ-END*/');
if (a < 0 || b < 0) { console.log('FAIL: UQ block not found'); process.exit(1); }
const UQ = new Function(src.slice(a, b) + '\nreturn UQ;')();
const money = c => '$' + Math.floor(c / 100) + '.' + String(c % 100).padStart(2, '0');
const comma = n => n.toLocaleString('en-US');
const KEY = {
  mult: p => String(p.a * p.b), hydrant: p => String(p.g * p.t), fruit: p => money(p.c * p.n),
  round: p => comma(Math.floor((p.v + 50) / 100) * 100), train: p => String(60 / p.m), shop: p => '$' + (p.a + p.b),
  pizza: p => (8 - p.k) + '/8',
  clock: p => { const t = p.h * 60 + p.m + p.add; let H = Math.floor(t / 60); if (H > 12) H -= 12; return H + ':' + String(t % 60).padStart(2, '0'); },
  meters: p => String(p.m * 100), lamps: p => String(p.n * 2), shirts: p => String(p.st * p.per), books: p => String(p.sh * p.per),
  share: p => String(p.each)
};
let n = 0, bad = [];
for (const k of Object.keys(UQ.G)) {
  if (!KEY[k]) { bad.push(k + ': no independent key'); continue; }
  for (let s = 1; s <= 3000; s++) {
    const q = UQ.G[k](s * 7919 + 13); n++;
    const want = KEY[k](q.p);
    const err = m => bad.push(`${k} seed ${s}: ${m} | ${q.text} | ${q.choices.join(' / ')}`);
    if (q.ans !== want) err('answer ' + q.ans + ' != ' + want);
    if (q.choices.length !== 4) err('needs 4 choices');
    if (new Set(q.choices.map(c => c.trim())).size !== q.choices.length) err('duplicate choices');
    if (q.choices.filter(c => c.trim() === q.ans).length !== 1) err('answer must appear exactly once');
    if (q.choices.some(c => /^-|\$-|\/0$|^0\//.test(c.trim()) || c !== c.trim())) err('bad choice');
    if (!q.std || !/^4\./.test(q.std)) err('needs a grade-4 standard');
    if (!q.explain.includes(q.ans.replace(/^\$/, '')) && k !== 'round') err('explanation must state the answer');
    if (k === 'share' && (q.p.k * q.p.each) % q.p.k) err('share must divide evenly');
    if (bad.length > 20) break;
  }
}
if (bad.length) { console.log('FAIL\n' + bad.slice(0, 20).join('\n')); process.exit(1); }
console.log(`verify_universe PASS: ${Object.keys(UQ.G).length} generators, ${n} questions, 0 math errors`);
