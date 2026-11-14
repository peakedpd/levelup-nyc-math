// Validates item_bank.json (P3 educator verification): every item carries a verified answer, verified explanation,
// standard alignment, difficulty, misconception classification and a review status; generated templates cover every
// question the generators can produce, and re-checks a fresh sample of each against the independent answer key.
const fs = require('fs'), path = require('path'); const R = p => path.join(__dirname, '..', p);
const L = require('../src_learn/core.js'), A = require('../src_learn/assess.js'), M = require('../src_learn/mastery.js'), AK = require('./answer_key.js');
const B = JSON.parse(fs.readFileSync(R('item_bank.json'), 'utf8')); const fails = []; const F = m => { if (fails.length < 60) fails.push(m) };
const STATUS = ['pending review', 'approved', 'flagged'], BANDS = ['easy', 'medium', 'hard', 'transfer'];
const CODES = new Set(A.MIS.map(m => m[0]).concat(['other', 'array', 'relation', 'typed-rules']));
const STD = /^(3|4)\.(OA|NBT|NF)\.[A-C]\.\d/;
const ids = new Set(); const by = {}; let other = 0, mtotal = 0;
for (const it of B.items) {
  const t = it.id || '(no id)'; if (ids.has(t)) F('duplicate id ' + t); ids.add(t); by[it.source] = (by[it.source] || 0) + 1;
  for (const k of ['id', 'source', 'skill', 'standard', 'level', 'difficulty', 'example', 'answer', 'explanation', 'misconceptions', 'verification', 'review']) if (it[k] === undefined || it[k] === null || it[k] === '') F(`${t}: missing ${k}`);
  if (!STD.test(it.standard || '')) F(`${t}: standard "${it.standard}" is not a CCSS code`);
  if (!(it.level >= 1 && it.level <= 6)) F(`${t}: level ${it.level}`); if (!it.difficulty || !BANDS.includes(it.difficulty.band)) F(`${t}: difficulty band`);
  if (!it.verification || !it.verification.answer || it.verification.answer.ok !== true) F(`${t}: answer not verified`);
  if (!it.verification || !it.verification.explanation || it.verification.explanation.ok !== true) F(`${t}: explanation not verified`);
  if (!Array.isArray(it.misconceptions) || !it.misconceptions.length) F(`${t}: no misconception classification`);
  for (const m of it.misconceptions || []) { mtotal++; if (!CODES.has(m.code)) F(`${t}: unknown misconception code ${m.code}`); if (m.code === 'other') other++; if (it.choices && m.choice === it.answer) F(`${t}: misconception attached to the right answer`) }
  if (it.choices && !it.choices.includes(it.answer)) F(`${t}: answer not among choices`);
  const r = it.review || {}; if (!STATUS.includes(r.status)) F(`${t}: review status "${r.status}"`);
  if (r.status !== 'pending review' && !(r.reviewer && r.date)) F(`${t}: ${r.status} without reviewer/date`); if (r.status === 'flagged' && !r.note) F(`${t}: flagged without a note`);
}
if (other / Math.max(1, mtotal) > .06) F(`too many unclassified misconceptions: ${other}/${mtotal}`);
// coverage + fresh re-verification of generator templates
const pattern = q => q.replace(/^Write the number: .*/, 'Write the number: <number words>').replace(/\d[\d,]*/g, '#');
const gen = new Set(B.items.filter(i => i.source === 'generator').map(i => `${i.skill}|${i.level}|${i.template}`)); let gn = 0;
for (const s of L.SKILLS) for (let lv = 1; lv <= 6; lv++) for (let seed = 1; seed <= 1500; seed++) { const it = L.item(s.id, lv, L.rng(seed * 7919 + lv * 3)); gn++;
  if (!gen.has(`${s.id}|${lv}|${pattern(it.q)}`)) { F(`generator template not in bank: ${s.id} L${lv} "${pattern(it.q)}"`); continue } const c = AK.check(it, s.id); if (c.problems.length) F(`${s.id} L${lv}: ${c.problems[0]}`) }
for (const op of M.TRANSFER_OPS) if (!B.items.some(i => i.source === 'transfer context' && i.id.startsWith(`xfer.${op}.`))) F('transfer op missing from bank: ' + op);
if ((by['story mission'] || 0) !== 40) F('expected 40 story-mission items, got ' + by['story mission']);
if (!(by['rooftop boss'] >= 12)) F('boss templates missing');
const counts = B.items.reduce((o, i) => (o[i.review.status] = (o[i.review.status] || 0) + 1, o), {});
console.log(JSON.stringify({ items: B.items.length, bySource: by, review: counts, misconceptionTags: mtotal, unclassified: other, generatorInstancesRechecked: gn, fails }, null, 1)); process.exit(fails.length ? 1 : 0);
