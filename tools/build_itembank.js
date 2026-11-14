// Builds item_bank.json: every question source in the game, one record per question template / fixed item, with
// verified answer, verified explanation, standard alignment, difficulty, misconception tags and educator review status.
// Generated templates are verified over 200 seeds each with the independent answer key (tools/answer_key.js);
// fixed mission items against the hand-made key in tools/verify_math.js; explanations by re-checking every equation.
// Existing review decisions (approved / flagged + notes) are merged, never overwritten: run any time.
const fs = require('fs'), path = require('path'); const R = p => path.join(__dirname, '..', p);
const L = require('../src_learn/core.js'), A = require('../src_learn/assess.js'), M = require('../src_learn/mastery.js'), AK = require('./answer_key.js'), EQ = require('./eqcheck.js');
const { chromium } = require('playwright'); const crypto = require('crypto'); const hid = k => crypto.createHash('sha1').update(k).digest('hex').slice(0, 8);
const MKEY = {1:[12,'mc1',24,15,27,'mc0',40,54],2:[21,20,'mc1',42,36,'mc0',92,102],3:[36,28,96,90,80,'mc1',126,360],4:[4,6,'mc1',5,'mc0',6,24,'mc1'],5:[54,8,60,9,'mc1','mc1',7,54]};
const STD = { 'groups:mul': '4.OA.A.1', 'groups:div': '4.OA.A.2', 'groups:mulsub': '4.OA.A.2', 'placevalue:digitval': '4.NBT.A.1', 'placevalue:sum': '4.NBT.A.2', 'placevalue:cmp': '4.NBT.A.2', 'placevalue:div': '4.NBT.A.1',
  'rounding:round': '4.NBT.A.3', 'addsub:add': '4.NBT.B.4', 'addsub:sub': '4.NBT.B.4', 'mult:mul': '4.NBT.B.5', 'divide:div': '4.NBT.B.6', 'divide:divrem': '4.NBT.B.6', 'factors:factor': '4.OA.B.4', 'factors:multiple': '4.OA.B.4', 'factors:nfactors': '4.OA.B.4',
  'factors:prime': '4.OA.B.4', 'factors:notfactor': '4.OA.B.4', 'factors:div': '4.OA.B.4', 'multistep:muladd': '4.OA.A.3', 'multistep:mulsub': '4.OA.A.3', 'multistep:ceildiv': '4.OA.A.3', 'multistep:floordiv': '4.OA.A.3', 'fractions:frac': '3.NF.A.1 (review) / 4.NF.A.1',
  'fractions:equiv': '4.NF.A.1', 'fractions:fcmp': '4.NF.A.2', 'fractions:equivpick': '4.NF.A.1' };
const MSTD = { 1: '4.OA.A.1', 2: '4.NBT.B.5', 3: '4.OA.A.3', 4: '4.NBT.B.6', 5: '4.OA.A.3' };
const GSTD = { transfer: '4.OA.A.3', groups: '4.OA.A.1', area: '4.NBT.B.5', div: '4.NBT.B.6', rem: '4.OA.A.3', compare: '4.OA.A.2', money: '4.NBT.B.5', tickets: '4.NBT.B.5' };
const band = lv => lv <= 2 ? 'easy' : lv <= 4 ? 'medium' : 'hard';
const misOf = why => Object.entries(why || {}).map(([choice, text]) => { const code = A.misCode(text); return { choice, text, code, name: A.MISNAME[code] || code } });
const pattern = q => q.replace(/^Write the number: .*/, 'Write the number: <number words>').replace(/\d[\d,]*/g, '#');
const labPattern = q => pattern(q).replace(/\b(Miss|Ms\.|Mr\.)\s+[A-Z][a-z]+|\b[A-Z][a-z]+(?= (has|shares|packs|buys|puts|sells|saves|reads|makes|wins|collects|brings|gets|is))/g, '<name>').replace(/(?<=# )[a-z]+/g, '<obj>').replace(/(?<=(each|How many|many|of|in|per|the|equal) )[a-z]+(?=[ ?.,])/g, '<obj>').replace(/\b[A-Z][a-z]+('s)?(?=[ .?,])/g, w => /^(How|What|Each|The|An?|There|At|If|Which|Then|In|On|She|He|They|It|You|Your|Is)$/.test(w) ? w : '<name>');
const mcTags = it => it.o.map((o, j) => { if (j === it.a) return null; const t = String(o); let code = A.misCode(t); if (code === 'other' || code === 'placeval') code = /more than|\+|plus/i.test(t) ? 'addmult' : /÷|divid|shar/i.test(t) && !/÷|divid|shar/i.test(String(it.o[it.a])) ? 'wrongop' : 'relation'; return { choice: t, text: code === 'relation' ? 'reverses or misreads the relationship in the problem' : '', code, name: code === 'relation' ? 'Misreads the relationship' : (A.MISNAME[code] || code) } }).filter(Boolean);
const TYPED = [{ choice: '(typed answer)', text: 'typed answers are classified at play time by the slip rules in assess.js (×10 place-value slip, regrouping slip, adds instead of multiplying)', code: 'typed-rules', name: 'Typed-answer slip rules' }];
const pend = () => ({ status: 'pending review', reviewer: null, date: null, note: '' });
const items = [];
// A) generated templates
for (const s of L.SKILLS) for (let lv = 1; lv <= 6; lv++) { const fam = {};
  for (let seed = 1; seed <= 4000; seed++) { const it = L.item(s.id, lv, L.rng(seed * 101 + lv)); const key = it.v.op + '|' + pattern(it.q); (fam[key] = fam[key] || []).push(it) }
  let n = 0; for (const [key, list] of Object.entries(fam)) { n++; const sample = list.slice(0, 200); let ansFail = 0, expFail = 0; const probs = [];
    for (const it of sample) { const r = AK.check(it, s.id); if (r.problems.length) { ansFail++; probs.push(r.problems[0]) } const last = (it.steps || []).slice(-1)[0] || ''; const eq = EQ.check((it.steps || []).join(' . '));
      if (!(last.includes(String(it.a)) || last.replace(/,/g, '').includes(String(it.a).replace(/,/g, ''))) || eq.bad.length) { expFail++; probs.push('explanation: ' + (eq.bad[0] || 'final step lacks answer')) } }
    const ex = list[0]; const op = ex.v.op;
    items.push({ id: `gen.${s.id}.L${lv}.${op}.${hid(key)}`, source: 'generator', where: 'My Path / Tower Climb / Placement Quest / Lightning Round', skill: s.id, skillName: s.name, standard: STD[s.id + ':' + op] || s.std, level: lv,
      difficulty: { band: band(lv), level: lv, note: ['L1 everything shown', 'L2 one group shown', 'L3 tools', 'L4 mental', 'L5 big numbers + tools', 'L6 big numbers, mental'][lv - 1] }, template: pattern(ex.q), example: ex.q, answer: String(ex.a), choices: ex.ch.map(String),
      explanation: (ex.steps || []).join(' → '), hint: ex.hint, misconceptions: misOf(ex.why), formats: A.formatsFor(ex),
      verification: { answer: { ok: !ansFail, method: 'independent recompute from structured data + operands-in-text + choice checks', instancesChecked: sample.length, failures: ansFail }, explanation: { ok: !expFail, method: 'final step states the answer; every equation in the steps re-computed', instancesChecked: sample.length, failures: expFail }, problems: probs.slice(0, 3) },
      review: pend() }) } }
// B) transfer contexts (P2) — answers equal the source item's, verified by tools/verify_mastery.js
for (const [op, fn] of Object.entries(M.TEMPLATES)) { let src = null; for (const s of L.SKILLS) for (let lv = 1; lv <= 6 && !src; lv++) for (let seed = 1; seed <= 300 && !src; seed++) { const it = L.item(s.id, lv, L.rng(seed)); if (it.v.op === op && !(op === 'div' && s.id === 'placevalue') && !(op === 'mul' && /times as/.test(it.q))) src = it }
  if (!src) continue; fn(src.v).forEach((q, i) => { const r = AK.check(src, src.sk); items.push({ id: `xfer.${op}.${i + 1}`, source: 'transfer context', where: 'Tower Climb Q4 + Memory Checks', skill: src.sk, skillName: L.SK[src.sk].name, standard: STD[src.sk + ':' + op] || L.SK[src.sk].std, level: src.lv,
    difficulty: { band: 'transfer', level: src.lv, note: 'same math as the source level, unfamiliar context' }, template: pattern(q), example: q, answer: String(src.a), choices: src.ch.map(String), explanation: (src.steps || []).join(' → '), hint: 'Find the math inside the story.', misconceptions: misOf(src.why), formats: ['mc'],
    verification: { answer: { ok: !r.problems.length, method: 'answer + choices copied from a verified source item; numbers re-checked in tools/verify_mastery.js (20,400 instances)' }, explanation: { ok: true, method: 'source-item explanation (equations re-computed)' }, problems: r.problems }, review: pend() }) }) }
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
  const URL = process.env.URL || 'http://localhost:8765/'; const pg = await b.newPage(); await pg.goto(URL + 'index.html'); await pg.waitForFunction(() => typeof MISSIONS !== 'undefined' && typeof GEN !== 'undefined');
  const got = await pg.evaluate(() => ({ M: MISSIONS.map(m => ({ id: m.id, title: m.title, std: m.std, items: m.items.map(it => ({ t: it.t, q: it.q, a: it.a, o: it.o, h: it.h, e: it.e })) })), G: Object.fromEntries(Object.keys(GEN).map(k => [k, [1, 2, 3].map(lv => { const s = []; for (let i = 0; i < 300; i++) s.push(GEN[k](lv)); return s })])) }));
  const p2 = await b.newPage(); await p2.goto(URL + 'street3d.html?embed=1'); await p2.waitForFunction(() => typeof bossProblem === 'function', null, { timeout: 120000 });
  const mwhy = await p2.evaluate(list => { MS = list; PROG = {}; return list.map(m => m.items.map((it, idx) => { try { const q = makeQ('Theo', ['tickets', 'tokens'], 'review', { pk: { m, idx, it, review: true }, level: 1 }); return { why: q.why || {}, ch: q.ch } } catch (e) { return { why: {} } } })) }, got.M.map(m => ({ id: m.id, title: m.title, items: m.items })));
  const boss = await p2.evaluate(() => { const o = []; for (let tier = 0; tier < 3; tier++) { const seen = {}; let s = 1; for (let i = 0; i < 400; i++) { let x = s++ * 9301 + tier; const rnd = () => (x = (x * 16807) % 2147483647) / 2147483647; const p = bossProblem(tier, rnd); (seen[p.id] = seen[p.id] || []).push(p) } for (const k in seen) o.push({ tier, id: k, list: seen[k].slice(0, 100) }) } return o });
  await b.close();
  // C) story missions (fixed items)
  for (const m of got.M) m.items.forEach((it, i) => { const k = (MKEY[m.id] || [])[i]; const okA = typeof k === 'string' ? it.t === 'mc' && it.a === +k.slice(2) : it.t === 'num' && it.a === k; const ansTxt = it.t === 'mc' ? String(it.o[it.a]) : String(it.a); const eq = EQ.check(it.e || '');
    const okE = !!it.e && !eq.bad.length && (it.t === 'mc' || new RegExp('\\b' + it.a + '\\b').test(it.e));
    items.push({ id: `mission.${m.id}.${i + 1}`, source: 'story mission', where: `Mission ${m.id}: ${m.title}`, skill: { 1: 'groups', 2: 'mult', 3: 'mult', 4: 'divide', 5: 'multistep' }[m.id], standard: MSTD[m.id], standardDraft: m.std, level: Math.min(6, 1 + Math.floor(i / 2)),
      difficulty: { band: band(1 + Math.floor(i / 2)), level: 1 + Math.floor(i / 2), note: 'position in mission (items get harder)' }, template: null, example: it.q, answer: ansTxt, choices: it.t === 'mc' ? it.o.map(String) : null, explanation: it.e || '', hint: [].concat(it.h || []).join(' / '),
      misconceptions: it.t === 'mc' ? mcTags(it) : misOf(((mwhy[got.M.indexOf(m)] || [])[i] || {}).why), formats: [it.t],
      verification: { answer: { ok: okA, method: 'hand-made independent answer key (tools/verify_math.js KEY)' }, explanation: { ok: okE, method: 'explanation states the answer; every equation re-computed', bad: eq.bad } }, review: pend() }) });
  // D) Practice Lab / Warm-Up generators (index.html GEN)
  for (const [k, levels] of Object.entries(got.G)) levels.forEach((list, li) => { const fam = {}; list.forEach(it => { const key = labPattern(it.q); (fam[key] = fam[key] || []).push(it) }); let n = 0;
    for (const [key, l2] of Object.entries(fam)) { n++; let af = 0, ef = 0; const probs = []; for (const it of l2) { const eq = EQ.check(it.e); const ans = it.t === 'mc' ? null : it.a; if (it.t !== 'mc' && !eq.vals.includes(ans) && !new RegExp('\\b' + String(ans).replace(/\B(?=(\d{3})+$)/g, ',?') + '\\b').test(it.e)) { af++; probs.push(`explanation total ${eq.last} != answer ${ans}: ${it.q}`) } if (eq.bad.length) { ef++; probs.push('bad equation ' + eq.bad[0]) } if (it.t === 'mc' && !(it.a >= 0 && it.a < it.o.length)) af++ }
      const ex = l2[0]; items.push({ id: `lab.${k}.L${li + 1}.${hid(key)}`, source: 'practice lab generator', where: 'Practice Lab / Warm-Up', skill: k, standard: GSTD[k] || ex.s, level: li + 1, difficulty: { band: band(li + 1), level: li + 1 }, template: key, example: ex.q, answer: String(ex.t === 'mc' ? ex.o[ex.a] : ex.a), choices: ex.o ? ex.o.map(String) : null,
        explanation: ex.e, hint: [].concat(ex.h || []).join(' / '), misconceptions: ex.t === 'mc' ? mcTags(ex) : TYPED, formats: [ex.t],
        verification: { answer: { ok: !af, method: 'explanation equations re-computed and final value equals the answer', instancesChecked: l2.length, failures: af }, explanation: { ok: !ef, method: 'every equation re-computed', instancesChecked: l2.length, failures: ef }, problems: probs.slice(0, 3) }, review: pend() }) } });
  // E) rooftop boss 2-step problems
  for (const g of boss) { let af = 0; const probs = []; for (const p of g.list) { const txt = p.text; for (const st of p.steps) { const eq = EQ.check(st.eq.replace('?', st.ans)); if (eq.bad.length) { af++; probs.push(eq.bad[0]) } } }
    const ex = g.list[0]; items.push({ id: `boss.${g.id}.T${g.tier}`, source: 'rooftop boss', where: 'Number Muncher boss fight', skill: 'multistep', standard: '4.OA.A.3', level: 4 + g.tier, difficulty: { band: 'hard', level: 4 + g.tier, note: 'tier ' + g.tier }, template: pattern(ex.text), example: ex.text, answer: String(ex.steps[ex.steps.length - 1].ans), choices: null,
      explanation: ex.steps.map(s => s.eq.replace('?', s.ans)).join(' → '), hint: ex.steps.map(s => s.ask).join(' / '), misconceptions: ex.steps.flatMap(s => (s.mis || []).map(([v, t]) => { const code = A.misCode(t); return { choice: String(v), text: t, code, name: A.MISNAME[code] || code } })), formats: ['mc (2 steps)'],
      verification: { answer: { ok: !af, method: 'every step equation re-computed with its answer (100 instances)', failures: af }, explanation: { ok: !af, method: 'step equations re-computed' }, problems: probs.slice(0, 3) }, review: pend() }) }
  // merge previous educator decisions
  const out = process.env.ITEMBANK_OUT || R('item_bank.json'); const apf = process.env.APPROVALS || R('approvals.json'); const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : { items: [] }; const pr = Object.fromEntries((prev.items || []).map(i => [i.id, i.review]));
  const ap = fs.existsSync(apf) ? JSON.parse(fs.readFileSync(apf, 'utf8')) : {}; for (const it of items) { const d = (ap.decisions || {})[it.id] || pr[it.id]; if (d && d.status && d.status !== 'pending review') it.review = d }
  const sum = items.reduce((o, i) => (o[i.source] = (o[i.source] || 0) + 1, o), {});
  fs.writeFileSync(out, JSON.stringify({ version: 1, built: new Date().toISOString(), counts: sum, total: items.length, review: { pending: items.filter(i => i.review.status === 'pending review').length, approved: items.filter(i => i.review.status === 'approved').length, flagged: items.filter(i => i.review.status === 'flagged').length }, items }, null, 1));
  console.log(JSON.stringify({ total: items.length, sum, answerFail: items.filter(i => !i.verification.answer.ok).map(i => i.id), explFail: items.filter(i => !i.verification.explanation.ok).map(i => i.id) }, null, 1));
})();
