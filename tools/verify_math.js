// Math verification: every MISSIONS item + generated/scaled items at L1-L6 (many seeds) + Ticket Blaster + Prize multiply.
const { chromium } = require('playwright');
const URL = process.env.URL || 'http://localhost:8765/';
// Independent answer key (computed by hand from the question text, not from the game's own a/o fields)
const KEY = {1:[12,'mc1',24,15,27,'mc0',40,54],2:[21,20,'mc1',42,36,'mc0',92,102],3:[36,28,96,90,80,'mc1',126,360],4:[4,6,'mc1',5,'mc0',6,24,'mc1'],5:[54,8,60,9,'mc1','mc1',7,54]};
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
  const pg = await b.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto(URL + 'index.html'); await pg.waitForFunction(() => typeof MISSIONS !== 'undefined');
  const list = await pg.evaluate(() => MISSIONS.map(m => ({ id: m.id, title: m.title, loc: m.loc, items: m.items.map(it => ({ t: it.t, q: it.q, a: it.a, o: it.o, h: it.h, e: it.e })) })));
  const p2 = await b.newPage(); p2.on('pageerror', e => errs.push('street:' + e));
  await p2.goto(URL + 'street3d.html?embed=1'); await p2.waitForFunction(() => typeof makeQ === 'function' && typeof PRIZES !== 'undefined', null, { timeout: 120000 });
  const out = await p2.evaluate(({ list, KEY }) => {
    MS = list; PROG = {}; const fails = []; let checked = 0, scaledChecked = 0, l6div = 0;
    const F = (m, s) => { if (fails.length < 60) fails.push(m + ': ' + s) };
    // 1. original items vs independent key
    list.forEach(m => m.items.forEach((it, i) => { checked++; const k = (KEY[m.id] || [])[i]; const tag = 'M' + m.id + '#' + (i + 1);
      if (k === undefined) return F(tag, 'no key');
      if (typeof k === 'string') { if (it.t !== 'mc' || it.a !== +k.slice(2)) F(tag, 'mc index ' + it.a + ' vs key ' + k) }
      else { if (it.t !== 'num' || it.a !== k) F(tag, 'answer ' + it.a + ' vs key ' + k); if (it.e && !new RegExp('\\b' + k + '\\b').test(it.e)) F(tag, 'explanation lacks answer') } }));
    // 2. generated questions at every level, many seeds
    const nums = s => (s.match(/\d+/g) || []).map(Number);
    list.forEach(m => m.items.forEach((it, idx) => { for (let level = 1; level <= 6; level++) for (let s = 0; s < 40; s++) {
      const q = makeQ('Theo', ['tickets', 'tokens'], 'review', { pk: { m, idx, it, review: true }, level }); const tag = `M${m.id}#${idx + 1} L${level}`;
      if (!q) { F(tag, 'null question'); continue }
      if (!q.ch.includes(q.ans)) F(tag, 'answer not in choices');
      if (new Set(q.ch.map(String)).size !== q.ch.length || q.ch.length < 3) F(tag, 'choices not distinct/too few ' + q.ch);
      if (it.t === 'num') { if (q.ch.length !== 4) F(tag, 'need 4 choices'); if (q.ch.some(v => !(Number.isInteger(v) && v > 0))) F(tag, 'non-positive choice ' + q.ch) }
      for (const v in q.why) if (+v === q.ans) F(tag, 'misconception equals answer');
      if (q.text !== it.q && it.t === 'num') { scaledChecked++; const n = nums(q.text), L = q.text.toLowerCase();
        // the answer must follow from numbers in the new text
        let ok = false; for (let a = 0; a < n.length; a++) for (let c = 0; c < n.length; c++) if (a !== c && (n[a] * n[c] === q.ans || n[a] === q.ans * n[c])) ok = true;
        if (/in each group\. how many/.test(L)) ok = n.length >= 2 && n[0] * n[1] === q.ans;
        if (!ok) F(tag, 'answer ' + q.ans + ' does not follow from: ' + q.text);
        if (/square with/.test(L) && !(n.length >= 2 && n[0] === n[1])) F(tag, 'stale square wording');
        if (q.expl && !new RegExp('\\b' + q.ans + '\\b').test(q.expl)) F(tag, 'explanation lacks answer');
        if (level === 6 && /÷/.test(q.expl)) { l6div++; const tot = +q.expl.match(/(\d+)\s*÷/)[1]; if (tot < 100 || tot > 999) F(tag, 'L6 dividend ' + tot) }
        if (level >= 5 && /÷/.test(q.expl)) { const mm = q.expl.match(/(\d+)\s*÷\s*(\d+)\s*=\s*(\d+)/); if (+mm[1] !== +mm[2] * +mm[3]) F(tag, 'bad division expl') }
        if (level >= 5 && /groups of|×/.test(q.expl)) { const mm = q.expl.match(/(\d+)\s*(?:groups of|×)\s*(\d+)\s*=\s*(\d+)/); if (mm && +mm[1] * +mm[2] !== +mm[3]) F(tag, 'bad product expl') }
      } } }));
    // 3. Ticket Blaster uses makeQ(review, level 3..6) -> sample
    let bl = 0; for (let level = 3; level <= 6; level++) for (let s = 0; s < 300; s++) { const q = makeQ('Theo', ['tickets', 'tokens'], 'review', { level }); bl++; if (!q || !q.ch.includes(q.ans) || new Set(q.ch.map(String)).size !== q.ch.length) F('blaster L' + level, 'bad q ' + (q && q.text)) }
    // 4. Prize multiply options (same formula as askQty)
    let pz = 0; PRIZES.forEach(p => [2, 3, 4].forEach(k => { pz++; const tot = k * p.c; const opts = [tot, tot + p.c, k + p.c, tot - p.c].filter((v, i, a) => v > 0 && a.indexOf(v) === i).slice(0, 3); if (!opts.includes(tot) || opts.length < 3) F('prize ' + p.id + ' x' + k, 'opts ' + opts) }));
    // 5. Rooftop boss 2-step problems (4.OA.A.3), all tiers
    let bs = 0; for (let tier = 0; tier <= 2; tier++) for (let s = 0; s < 2000; s++) { const p = bossProblem(tier); bs++; const tag = 'boss ' + p.id + ' t' + tier; const tn = nums(p.text);
      p.steps.forEach((st, i) => { const e = st.eq.replace(/\$/g, '').match(/(\d+)\s*([×÷−+])\s*(\d+)\s*=\s*\?/); if (!e) return F(tag, 'bad eq ' + st.eq);
        const a = +e[1], o = e[2], c = +e[3], v = o === '×' ? a * c : o === '÷' ? a / c : o === '−' ? a - c : a + c;
        if (v !== st.ans) F(tag, `step ${i + 1} ${st.eq} -> ${st.ans} (should be ${v})`); if (!(Number.isInteger(st.ans) && st.ans > 0)) F(tag, 'non-positive/non-integer answer ' + st.ans);
        if (i === 0 && !(tn.includes(a) && tn.includes(c))) F(tag, 'step1 numbers not in story');
        if (i === 1 && !(a === p.steps[0].ans || c === p.steps[0].ans)) F(tag, 'step2 does not use step1 result');
        const cc = stepChoices(st); if (!cc.ch.includes(st.ans) || cc.ch.length !== 4 || new Set(cc.ch).size !== 4 || cc.ch.some(x => !(x > 0))) F(tag, 'choices ' + cc.ch); for (const k in cc.why) if (+k === st.ans) F(tag, 'why==ans') });
      if (tier === 2 && p.id !== 'cupcakes' && !p.steps.some(st => st.ans >= 100)) F(tag, 'tier2 too easy') }
    return { bossProblems: bs, originalItems: checked, generatedPerItem: 6 * 40, scaledChecked, l6div, blasterSamples: bl, prizeCases: pz, fails };
  }, { list, KEY });
  out.pageErrors = errs; console.log(JSON.stringify(out, null, 1)); await b.close(); process.exit(out.fails.length || errs.length ? 1 : 0);
})();
