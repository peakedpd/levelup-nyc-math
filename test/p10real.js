// Real-life games in the 3D street: (1) Theo on the street starts a real-life game for a skill the page picks, and the
// result lands in the learning log; (2) "Play it for real" in Your Turn sends that exact question to the street and the
// answer comes back to the same lesson; (3) every one of the 9 skills draws real objects (no plain number pad only).
module.exports = async ({ pg, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  const f = pg.frame({ url: /street3d\.html/ });
  const waitQG = async (want, ms = 15000) => { for (let t = 0; t < ms; t += 250) { const ph = await f.evaluate(() => QG ? QG.phase : null); if (want === null ? ph === null : ph === want) return true; await sleep(250) } return false };
  const finish = async () => { await waitQG('ask'); await f.evaluate(() => { const a = QG.ans.find(a => a.v === QG.q.ans); answer(a) }); return waitQG(null) };
  await f.evaluate(() => { if (AREA !== 'street') leaveRoom() }); await sleep(800);
  await pg.evaluate(() => { closeModal(); LUI.openPath(); closeModal(); save() });
  // 1. Theo's street game
  await f.evaluate(() => { P.x = TH.x - 1.2; P.z = TH.z; IDLE = 3 }); await sleep(600);
  res.theoLabel = await f.evaluate(() => (interactions().find(x => x.type === 'skill') || {}).label);
  ok(/real-life math game/.test(res.theoLabel || ''), 'Theo offers a real-life game: ' + res.theoLabel);
  const log0 = await pg.evaluate(() => S.learn.log.length);
  await f.evaluate(() => { nearDoor = interactions().find(x => x.type === 'skill'); tryDoor() });
  ok(await waitQG('ask'), 'Theo game reaches the answer step');
  res.theoGame = await f.evaluate(() => ({ badge: QG.q.badge, sk: QG.q.skill.sk, objects: QG.items.length, pads: QG.ans.length }));
  console.log('P10 theo', JSON.stringify(res.theoGame)); ok(res.theoGame.objects > 0, 'Theo game shows objects'); ok(res.theoGame.pads >= 2, 'Theo game has answer pads');
  await shot('p10_theo'); await finish(); await sleep(500);
  res.logged = await pg.evaluate(n => S.learn.log.slice(n).map(e => e.sk + ':' + e.src), log0);
  ok(res.logged.length === 1 && /:street$/.test(res.logged[0]), 'street game result recorded: ' + res.logged);
  // 2. Your Turn -> Play it for real -> back to the lesson
  await pg.evaluate(() => LUI._.WHO && LUI.startLesson('rounding')); await sleep(600);
  await pg.evaluate(() => { const b = document.querySelector('#modal [data-x=try]'); if (b) b.click(); else { const n = document.querySelector('#modal [data-x=next]'); n && n.click() } });
  for (let i = 0; i < 6; i++) { const t = await pg.$('#modal [data-x=try]'); if (t) { await t.click(); break } const n = await pg.$('#modal [data-x=next]'); if (n) await n.click(); await sleep(300) }
  await sleep(400); const rb = await pg.$('#modal [data-x=real]'); ok(!!rb, 'Your Turn shows "Play it for real"');
  if (rb) {
    const q = await pg.evaluate(() => document.querySelector('#modal .lu-q').textContent.replace('🔊', '').trim());
    await rb.click(); ok(await waitQG('ask'), 'Your Turn question opens in the street');
    res.turn = await f.evaluate(() => ({ text: QG.q.text, src: QG.q.skill.src, objects: QG.items.length }));
    ok(res.turn.text === q, 'same question in the street'); ok(res.turn.objects > 0, 'subway scene has objects');
    await shot('p10_turn'); await finish(); await sleep(800);
    res.after = await pg.evaluate(() => ({ open: document.getElementById('modal').classList.contains('open'), head: (document.querySelector('#modal h2') || {}).textContent }));
    ok(res.after.open, 'lesson continues after the street game: ' + JSON.stringify(res.after));
  }
  // 3. every skill draws objects
  res.skills = {};
  for (const sk of ['groups', 'placevalue', 'rounding', 'addsub', 'mult', 'divide', 'factors', 'multistep', 'fractions']) {
    await pg.evaluate(() => closeModal());
    const it = await pg.evaluate(sk => { const it = LEARN.item(sk, 3); return { sk: it.sk, lv: it.lv, q: it.q, a: it.a, ch: it.ch, why: it.why, hint: it.hint, steps: it.steps, v: it.v } }, sk);
    const started = await f.evaluate(it => skillGameStart({ it, src: 'test' }), it);
    await waitQG('ask'); res.skills[sk] = started ? await f.evaluate(() => QG.items.length) : 0; ok(res.skills[sk] > 0, sk + ' draws objects');
    await shot('p10_' + sk); await finish();
  }
  console.log('P10 skills', JSON.stringify(res.skills), 'turn', JSON.stringify(res.turn), JSON.stringify(res.after), 'logged', JSON.stringify(res.logged));
};
