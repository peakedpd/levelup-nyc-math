// P4 e2e: reasoning prompt in Tower Climb, Multi-Step Quest, Strategy Showdown, Explain It (rubric), misconception-triggered
// intervention mission, teacher scoring of open responses.
module.exports = async ({ pg, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  await pg.evaluate(() => { closeModal(); S.learn = null; LUI.openPath(); closeModal(); const l = S.learn; l.diag = { d: '2026-11-01', t: Date.now(), sess: 0, scale: 470, place: {}, gaps: [], flagged: [] }; l.history = [l.diag]; for (const k in l.m) Object.assign(l.m[k], { lv: 3, taught: 6 }); save() });
  // 1) Tower Climb: Q2 right -> "Why does it work?" -> pick a wrong reason
  await pg.evaluate(() => LUI.practice('mult')); await sleep(500);
  for (let i = 0; i < 2; i++) { await pg.evaluate(() => { const p = window.__luPrac, box = document.querySelector('#luItem'); if (box.querySelector('.dg-pad')) window.__luType(p.a.replace(/,/g, '')); else [...box.querySelectorAll('[data-v]')].find(b => b.dataset.v === p.a).click() }); await sleep(1500) }
  res.whyShown = await pg.evaluate(() => !!document.querySelector('#dpWhy')); await shot('p4_why'); ok(res.whyShown, 'reasoning prompt after Q2');
  await pg.evaluate(() => { const bs = document.querySelectorAll('#dpWhy [data-i]'); [...bs].find((b, i) => i !== window.__dpWhy).click() }); await sleep(2900);
  res.reason = await pg.evaluate(() => S.learn.reasons && S.learn.reasons[0]); ok(res.reason && res.reason.ok === false && res.reason.code, 'reason stored with misconception code');
  res.backToTower = await pg.evaluate(() => !!document.querySelector('#luMode')); ok(res.backToTower, 'tower continues after reasoning');
  // 2) Multi-Step Quest from My Path (first step: wrong then right)
  await pg.evaluate(() => { closeModal(); LUI.openPath() }); await sleep(400); await shot('p4_path');
  ok(await pg.evaluate(() => !!document.querySelector('#dpChallenges')), 'Think Deeper on My Path');
  await pg.evaluate(() => document.querySelector('[data-dp=multi]').click()); await sleep(500); await shot('p4_multi');
  for (let s = 0; s < 3; s++) { if (s === 0) { await pg.evaluate(() => [...document.querySelectorAll('#modal [data-v]')].find(b => +b.dataset.v !== window.__dpAns).click()); await sleep(400) }
    await pg.evaluate(() => [...document.querySelectorAll('#modal [data-v]')].find(b => +b.dataset.v === window.__dpAns).click()); await sleep(1300) }
  res.multi = await pg.evaluate(() => window.__dpDone); ok(res.multi && res.multi.kind === 'multistep' && res.multi.first === 2 && res.multi.of === 3, 'multi-step quest 2/3 first-try');
  // 3) Strategy Showdown — answer correctly
  await pg.evaluate(() => DEPTHUI.showdown('mult')); await sleep(500); await shot('p4_showdown');
  for (let q = 0; q < 3; q++) { const more = await pg.evaluate(() => { if (window.__dpDone && window.__dpDone.kind === 'strategy') return false; const i = window.__dpOpts.indexOf(true); document.querySelectorAll('#modal [data-i]')[i].click(); return true }); if (!more) break; await sleep(1900) }
  res.show = await pg.evaluate(() => window.__dpDone); ok(res.show && res.show.kind === 'strategy' && res.show.score === res.show.of && res.show.of >= 2, 'strategy showdown all correct');
  // 4) Explain It — rubric
  await pg.evaluate(() => DEPTHUI.explain(0)); await sleep(500);
  await pg.evaluate(() => { const q = document.querySelector('#modal .lu-q').textContent; const [a, b] = q.match(/(\d+) × (\d+)/).slice(1).map(Number); document.querySelector('#dpTxt').value = `There are ${a} boxes with ${b} crayons in each box. How many crayons in all? ${a} groups of ${b} means ${a} times ${b} = ${a * b} crayons.` });
  await shot('p4_explain'); await pg.evaluate(() => document.querySelector('[data-x=sub]').click()); await sleep(600);
  res.open = await pg.evaluate(() => S.learn.responses.slice(-1)[0]); ok(res.open && res.open.auto === 3 && res.open.teacher === null, 'open response auto-scored 3 and awaiting teacher');
  // 5) repeated misconception -> intervention mission assigned -> complete it
  await pg.evaluate(() => { DEPTHUI.logMis('addsub', 'regroup', 'path'); DEPTHUI.logMis('addsub', 'regroup', 'path') }); await sleep(300);
  res.assigned = await pg.evaluate(() => (S.learn.interventions || []).filter(x => x.code === 'regroup').map(x => x.status)); ok(res.assigned.includes('assigned'), 'regroup mission assigned after 2 repeats');
  await pg.evaluate(() => { closeModal(); LUI.openPath() }); await sleep(400); await shot('p4_missions');
  await pg.evaluate(() => document.querySelector('#dpMissions [data-int=regroup]').click()); await sleep(500); await shot('p4_lesson');
  for (let j = 0; j < 2; j++) { await pg.evaluate(() => document.querySelector('[data-x=go]').click()); await sleep(400) }
  for (let j = 0; j < 4; j++) { await pg.evaluate(() => [...document.querySelectorAll('#luItem [data-v]')].find(b => b.dataset.v === window.__luLastAns).click()); await sleep(1500) }
  res.mission = await pg.evaluate(() => ({ done: window.__dpDone, st: S.learn.interventions.find(x => x.code === 'regroup').status })); await shot('p4_mission_done'); ok(res.mission.st === 'completed', 'mission completed');
  // 6) teacher scores the open response
  await pg.evaluate(() => { closeModal(); openTeacher() }); await sleep(600);
  await pg.evaluate(() => document.querySelector('#dpDash [data-ts="2"]').click()); await sleep(200); await shot('p4_dashboard');
  res.teacher = await pg.evaluate(() => S.learn.responses.find(r => r.kind === 'open').teacher); ok(res.teacher === 2, 'teacher score saved');
};
