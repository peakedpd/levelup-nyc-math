// P2 e2e: Tower Climb mixes representations (picture, typed, new-situation transfer, solo), level-up needs that evidence,
// Memory Checks come due days later, mastery needs L6 + retention + transfer, dashboard shows the evidence.
module.exports = async ({ pg, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` });
  const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  const answer = async right => pg.evaluate(right => { const p = window.__luPrac; const box = document.querySelector('#luItem'); if (!p || !box) return null;
    if (box.querySelector('.dg-pad')) { const a = p.a; window.__luType(right ? a.replace(/,/g, '') : (a.includes('/') ? '9/9' : String(+a.replace(/,/g, '') + 1))); return 'typed' }
    const bs = [...box.querySelectorAll('[data-v]')]; const b = bs.find(b => right ? b.dataset.v === p.a : b.dataset.v !== p.a); b.click(); if (!right) { const c = bs.find(b => b.dataset.v === p.a); setTimeout(() => c.click(), 300) } return 'mc' }, right);
  const tower = async (sk, pattern, tag) => { await pg.evaluate(sk => { closeModal(); LUI.practice(sk) }, sk); await sleep(500); const modes = [];
    for (let i = 0; i < 5; i++) { const md = await pg.evaluate(() => (document.querySelector('#luMode') || {}).textContent); modes.push(md + '|' + (await answer(pattern[i]))); if (tag && i === 2) await shot(tag + '_typed'); if (tag && i === 3) await shot(tag + '_transfer'); await sleep(pattern[i] ? 1500 : 3200); if (await pg.evaluate(() => !!document.querySelector('#dpWhy'))) { await pg.evaluate(() => document.querySelectorAll('#dpWhy [data-i]')[window.__dpWhy].click()); await sleep(1600) } } return modes };
  // seed a placed student (as if the Placement Quest had run)
  await pg.evaluate(() => { closeModal(); S.learn = null; LUI.openPath(); closeModal(); const l = S.learn; l.diag = { d: '2026-11-01', t: Date.now(), sess: 0, scale: 470, place: {}, gaps: [], flagged: [] }; l.history = [l.diag];
    for (const k in l.m) Object.assign(l.m[k], { lv: 3, taught: 6 }); l.m.mult.lv = 2; save() });
  // 1) Tower with a wrong-first answer on Q1 (needs retry) -> 4/5 first-try still passes; show modes
  res.modes = await tower('mult', [0, 1, 1, 1, 1], 'p2');
  res.after1 = await pg.evaluate(() => ({ lv: S.learn.m.mult.lv, checks: S.learn.m.mult.checks, ev: S.learn.m.mult.ev.map(e => [e.first, e.rep, e.ind].join(':')) }));
  ok(res.modes.some(m => /Type it/.test(m) && /typed/.test(m)), 'typed question in tower'); ok(res.modes.some(m => /New situation/.test(m)), 'transfer question in tower'); ok(res.modes.some(m => /Solo/.test(m)), 'solo question in tower');
  ok(res.after1.lv === 3, 'level up after 4/5 first-try with 2+ representations and independent work (lv ' + res.after1.lv + ')');
  ok(res.after1.checks.some(c => c.lv === 2), 'Memory Check scheduled for passed level');
  // 2) a tower answered right only on the second try never levels up
  await pg.evaluate(() => { const m = S.learn.m.divide; m.lv = 3; save() });
  await tower('divide', [0, 0, 0, 0, 0]); res.divAfter = await pg.evaluate(() => S.learn.m.divide.lv); ok(res.divAfter <= 3, 'second-try answers must not level up');
  // 3) Memory Check comes due 3 days later
  await pg.evaluate(() => { S.learn.m.mult.checks.forEach(c => c.at = Date.now() - 1); save(); closeModal(); LUI.openPath() }); await sleep(500); await shot('p2_memcheck_due');
  res.memDue = await pg.evaluate(() => !!document.querySelector('#luMem [data-mc]')); ok(res.memDue, 'Memory Check shown on My Path');
  await pg.evaluate(() => document.querySelector('#luMem [data-mc]').click()); await sleep(500);
  for (let i = 0; i < 2; i++) { await answer(true); await sleep(1500) }
  await shot('p2_memcheck_done'); res.memOut = await pg.evaluate(() => (document.querySelector('#luMemOut') || {}).dataset.out); ok(res.memOut === 'kept', 'Memory Check pass -> kept, got ' + res.memOut);
  // 4) mastery: L6 tower -> secure, not mastered; then delayed check -> mastered
  await pg.evaluate(() => { const m = S.learn.m.rounding; m.lv = 6; m.since = Date.now(); save() });
  await tower('rounding', [1, 1, 1, 1, 1]);
  res.l6 = await pg.evaluate(() => { const m = S.learn.m.rounding; return { secure: !!m.secure, done: !!m.done, transfer: !!m.transfer, status: MASTERY.status(m) } });
  ok(res.l6.secure && !res.l6.done, 'L6 pass is secure, not yet mastered');
  await pg.evaluate(() => { const m = S.learn.m.rounding; m.checks.forEach(c => c.at = Date.now() - 1); m.secure -= 4 * 864e5; save(); closeModal(); LUI.openPath() }); await sleep(400);
  await pg.evaluate(() => [...document.querySelectorAll('#luMem [data-mc]')].find(b => b.dataset.mc === 'rounding:6').click()); await sleep(500);
  for (let i = 0; i < 2; i++) { await answer(true); await sleep(1500) }
  res.mastered = await pg.evaluate(() => ({ out: (document.querySelector('#luMemOut') || {}).dataset.out, done: !!S.learn.m.rounding.done }));
  await shot('p2_mastered'); ok(res.mastered.out === 'mastered' && res.mastered.done, 'retention + transfer -> mastered');
  // 5) dashboard shows first-try / solo / memory / transfer
  await pg.evaluate(() => { closeModal(); openTeacher() }); await sleep(600); await shot('p2_dashboard');
  res.dash = await pg.evaluate(() => [...document.querySelectorAll('#luDash th')].map(t => t.textContent).join(','));
  ok(/First-try/.test(res.dash) && /Transfer/.test(res.dash) && /Memory/.test(res.dash), 'dashboard columns');
  res.csvHead = await pg.evaluate(() => LUI.dashCSV().split('\n').find(l => /first-try %/.test(l)) ? 1 : 0); ok(res.csvHead, 'CSV has mastery evidence columns');
};
