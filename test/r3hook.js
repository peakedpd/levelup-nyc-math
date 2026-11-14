module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const ev = (fn, a) => f.evaluate(fn, a);
  // streak powers in a regular game
  await ev(() => { if (AREA !== 'street') leaveRoom(); __dbg.P.x = -55; __dbg.P.z = -8.5; enterRoom('school'); }); await sleep(600);
  await ev(() => goRoom('school', 'door')); await sleep(800);
  await ev(() => { STREAK = 2; PWR.fifty = 1; startGame('Ms. Okafor', true, ['marbles'], 'review'); });
  for (let i = 0; i < 80; i++) { if (await ev(() => QG && QG.phase === 'ask')) break; await sleep(250); }
  await sleep(500); await shot('p1_fifty_power');
  res.fifty = await ev(() => ({ disabled: QG.ans.filter(a => a.used).length, rightUsed: QG.ans.find(a => a.v === QG.q.ans).used, badge: document.getElementById('qcStreak').textContent }));
  await ev(() => answer(QG.ans.find(a => a.v === QG.q.ans))); for (let i = 0; i < 60; i++) { if (await ev(() => !QG)) break; await sleep(250); }
  await sleep(1000); await shot('p2_streak3_pop'); res.afterStreak = await ev(() => ({ STREAK, fifty: PWR.fifty }));
  // boss
  await ev(() => { goRoom('hallway', 'classDoor'); }); await sleep(300); await ev(() => goRoom('rooftop', 'stairs')); await sleep(800);
  await ev(() => { __dbg.P.x = 0; __dbg.P.z = 597.5; __dbg.P.yaw = 0; camYaw = Math.PI - .4; camPitch = .2; camDist = 6; }); await sleep(2000); await shot('b1_boss_idle');
  res.bossPrompt = await ev(() => document.getElementById('prompt').textContent);
  await ev(() => tryDoor()); await sleep(3500); await shot('b2_boss_fight');
  res.bossQ = await ev(() => W2.boss && { p: W2.boss.probs.map(p => p.text), step: W2.boss.cur && W2.boss.cur.st.eq });
  await ev(() => { const bt = [...document.querySelectorAll('#bosscard [data-v]')].find(b => +b.dataset.v !== W2.boss.cur.st.ans); bossAnswer(+bt.dataset.v, bt); }); await sleep(900); await shot('b3_boss_wrong');
  for (let k = 0; k < 6; k++) { await ev(() => { const b = W2.boss; if (!b || b.phase !== 'fight') return; const bt = [...document.querySelectorAll('#bosscard [data-v]')].find(x => +x.dataset.v === b.cur.st.ans); bossAnswer(+bt.dataset.v, bt); }); await sleep(k === 0 ? 300 : 1700); if (k === 0) { await shot('b4_boss_hit'); await sleep(1400); } }
  for (let i = 0; i < 40; i++) { if (await ev(() => W2.boss && W2.boss.phase === 'ceremony')) break; await sleep(250); }
  await sleep(3500); await shot('b5_ceremony'); res.ceremony = await ev(() => W2.boss && W2.boss.reward);
  await ev(() => document.querySelector('#ceOk') && document.querySelector('#ceOk').click()); await sleep(800);
  res.bossAfter = await ev(() => ({ boss: !!W2.boss, wins: localStorage.getItem('lu3d_bosswins'), tix: TIX.n }));
  res.parentBoss = await pg.evaluate(() => ({ wins: S.bossWins, xp: S.xp, coins: S.coins }));
};
