// Reteach Plan e2e: empty state (no invented data) -> demo preview (clearly labeled, not saved, not assignable) ->
// real results (a wrong answer given in Tower Climb + imported progress codes) -> rankings, samples, plan, mission assign, CSV.
module.exports = async ({ pg, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  await pg.evaluate(() => { closeModal(); localStorage.removeItem('lu_class_students'); localStorage.removeItem('lu_assignments'); S.name = S.name || 'Ava'; S.learn = null; LUI.openPath(); closeModal(); save(); setRoster([{ k: KEY, n: S.name }]);
    localStorage.setItem('lu_class', JSON.stringify({ id: 'c1', name: '4B Math', teacher: 'Ms. Okafor', code: CLASSROOM.encode('class', { id: 'c1', name: '4B Math', teacher: 'Ms. Okafor' }), at: Date.now() })) });
  // 1) empty state
  await pg.evaluate(() => CLASSUI.openHub()); await sleep(400);
  await pg.evaluate(() => document.querySelector('[data-c=reteach]').click()); await sleep(400);
  res.empty = await pg.evaluate(() => document.querySelector('#rtEmpty') && document.querySelector('#rtEmpty').innerText); await shot('p6_empty');
  ok(/No class results yet/.test(res.empty || '') && /Placement Quest/.test(res.empty) && /progress codes|Share my progress/.test(res.empty), 'empty state explains how to get data');
  ok(await pg.evaluate(() => !document.querySelector('#rtMisRank')), 'no rankings without data');
  // 2) demo preview
  await pg.evaluate(() => document.querySelector('[data-c=rtdemo]').click()); await sleep(800);
  res.demo = await pg.evaluate(() => ({ label: (document.querySelector('#rtDemo') || {}).innerText, mis: document.querySelectorAll('#rtMisRank tbody tr').length, std: document.querySelectorAll('#rtStdRank tbody tr').length, plans: document.querySelectorAll('.rt-plan').length,
    ticket: document.querySelectorAll('#rtPlan0 .rt-ticket li').length, key: (document.querySelector('#rtKey0') || {}).innerText, assign: document.querySelectorAll('[data-c=rtassign]').length, stored: localStorage.getItem('lu_class_students') }));
  ok(/DEMO DATA/.test(res.demo.label || '') && /not your students/.test(res.demo.label), 'demo clearly labeled'); ok(res.demo.mis === 3 && res.demo.std === 3 && res.demo.plans === 2, 'top 3 + two plans: ' + JSON.stringify(res.demo));
  ok(res.demo.ticket >= 3 && res.demo.ticket <= 5 && /Answer key/.test(res.demo.key), 'exit ticket + key'); ok(res.demo.assign === 0 && !res.demo.stored, 'demo not assignable / not saved');
  await shot('p6_reteach_demo'); await pg.evaluate(() => document.querySelector('#rtPlan0').scrollIntoView()); await shot('p6_reteach_demo_plan'); await pg.evaluate(() => document.querySelector('#rtPlan1').scrollIntoView()); await shot('p6_reteach_demo_std');
  // 3) real results: this student misses a Tower Climb item; two classmates' progress codes are imported
  await pg.evaluate(() => { closeModal(); const l = S.learn; l.diag = { d: '2026-11-01', t: Date.now(), sess: 0, scale: 470, place: {}, gaps: [], flagged: [] }; l.history = [l.diag]; for (const k in l.m) Object.assign(l.m[k], { lv: 3, taught: 6 }); save(); LUI.practice('addsub') }); await sleep(600);
  res.wrong = await pg.evaluate(() => { const box = document.querySelector('#luItem'), p = window.__luPrac; if (box.querySelector('.dg-pad')) { window.__luType(String(+String(p.a).replace(/,/g, '') + 10)); return 'typed' } const b = [...box.querySelectorAll('[data-v]')].find(b => b.dataset.v !== p.a); b.click(); setTimeout(() => [...box.querySelectorAll('[data-v]')].find(b => b.dataset.v === p.a).click(), 700); return 'mc:' + b.dataset.v }); await sleep(3600);
  res.logged = await pg.evaluate(() => S.learn.log.filter(e => !e.ok).slice(-1)[0]); ok(res.logged && res.logged.given != null && res.logged.q && res.logged.ans, 'wrong answer saved with question and given answer: ' + JSON.stringify(res.logged));
  await pg.evaluate(() => { closeModal(); const now = Date.now(); const mk = (id, nm, codes, lv) => ({ id, name: nm, at: now, learn: { m: Object.fromEntries(CLASSROOM.SK.map(k => [k, { lv: k === 'divide' ? lv : 4, ev: [] }])), log: codes.map((c, i) => ({ t: now - i * 6e4, sk: 'divide', lv, ok: 0, code: c, q: '29 ÷ 6 vans: how many vans?', given: '4', ans: '5', src: 'diag' })), history: [{ t: now, scale: 450 }] } });
    CLASSUI.addImported([mk('sB', 'Ben', ['remainder', 'remainder', 'remainder'], 1), mk('sC', 'Cleo', ['remainder'], 2)]) });
  await pg.evaluate(() => CLASSUI.openReteach()); await sleep(600);
  res.real = await pg.evaluate(() => ({ demo: !!document.querySelector('#rtDemo'), top: document.querySelector('#rtMisRank tbody tr').innerText, std: document.querySelector('#rtStdRank tbody tr').innerText, groups: [...document.querySelectorAll('#rtPlan0 .cl-rec')].map(x => x.innerText) }));
  ok(!res.real.demo, 'real plan not labeled demo'); ok(/Interpreting remainders/.test(res.real.top) && /\b2\b/.test(res.real.top) && /67%/.test(res.real.top) && /29 ÷ 6/.test(res.real.top), 'top misconception with count, % and sample: ' + res.real.top);
  ok(/4\.NBT\.B\.6/.test(res.real.std), 'top standard is division: ' + res.real.std); ok(res.real.groups.some(g => /Reteach now/.test(g) && /Ben/.test(g)) && res.real.groups.some(g => /Quick review/.test(g) && /Cleo/.test(g)), 'small groups: ' + res.real.groups.join(' | '));
  await shot('p6_reteach_real');
  // switch to another misconception plan (the student's own Tower Climb miss)
  res.pick = await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-c=rtpick][data-kind=mis]')]; if (b.length < 2) return null; b[1].click(); return document.querySelector('#rtPlan0').dataset.key }); await sleep(300);
  if (res.pick) ok(res.pick !== 'remainder', 'plan switched');
  await pg.evaluate(() => CLASSUI.openReteach()); await sleep(500);
  await pg.evaluate(() => document.querySelector('#rtPlan0 [data-c=rtassign]').click()); await sleep(400);
  res.assigned = await pg.evaluate(() => { const a = JSON.parse(localStorage.getItem('lu_assignments') || '[]').slice(-1)[0]; return a && { code: a.items[0].code, for: a.for, msg: (document.querySelector('#clMsg') || {}).innerText } });
  ok(res.assigned && res.assigned.code === 'remainder' && res.assigned.for.includes('sB') && res.assigned.for.includes('sC'), 'mission assigned to reteach groups: ' + JSON.stringify(res.assigned));
  res.csv = await pg.evaluate(() => { const an = RETEACHPLAN.analyze(CLASSUI.students()); return RETEACHPLAN.csv(an, [RETEACHPLAN.planFor('mis', an.mis[0].code, an)]).split('\n').length }); ok(res.csv > 15, 'csv');
  await pg.evaluate(() => closeModal());
};
