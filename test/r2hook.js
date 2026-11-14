module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` });
  const ev = (fn, a) => f.evaluate(fn, a);
  await ev(() => { if (AREA !== 'street') leaveRoom(); __dbg.P.x = -52.3; __dbg.P.z = -5.0; camYaw = 2.6; camPitch = .2; camDist = 5; }); await sleep(1500);
  await ev(() => doTalk()); await sleep(900); await shot('t1_street_okafor_talk');
  res.talkPrompt = await ev(() => document.getElementById('prompt').textContent);
  await ev(() => { __dbg.P.x = -55; __dbg.P.z = -8.5; enterRoom('school'); }); await sleep(1500); res.areaAfterSchoolDoor = await ev(() => AREA); await shot('t2_lobby');
  await ev(() => goRoom('hallway', 'front')); await sleep(1500); await shot('t3_hallway');
  await ev(() => goRoom('rooftop', 'stairs')); await sleep(1500); await sleep(1200); await shot('t4_rooftop');
  await ev(() => goRoom('school', 'door')); await sleep(1200); res.classExit = await ev(() => interactions().map(d => d.type + ':' + (d.to || '')).join(','));
  await ev(() => { leaveRoom(); enterRoom('arcade'); }); for (let i = 0; i < 60; i++) { if (await ev(() => !!ACT.worker)) break; await sleep(500); }
  res.workerLoaded = await ev(() => !!ACT.worker);
  await ev(() => { __dbg.P.x = ROOMS.arcade.cx; __dbg.P.z = ROOMS.arcade.cz - 2.6; __dbg.P.x += 1.8; __dbg.P.yaw = Math.PI; camYaw = -0.35; camPitch = .2; camDist = 5; }); await sleep(1500); await shot('t5_worker_counter');
  await ev(() => { startBlaster(); }); await sleep(1500); await shot('t6_blaster');
  for (let k = 0; k < 2; k++) { await ev(() => { const B = W2.blaster; const t = B.targets.find(t => t.v === B.q.ans); bHit(B, t); }); await sleep(400); }
  await ev(() => { const B = W2.blaster; const t = B.targets.find(t => t.v !== B.q.ans && t.alive); bHit(B, t); }); await sleep(500); await shot('t7_blaster_wrong');
  res.blaster = await ev(() => ({ tix: W2.blaster.tix, hearts: W2.blaster.hearts, correct: W2.blaster.correct }));
  await ev(() => { W2.blaster.over = true; }); await sleep(600); await ev(() => endBlaster()); await sleep(300);
  await ev(() => { TIX.n = TIX.n + 200; openPrizes(); }); await sleep(800); await shot('t8_prize_menu');
  await ev(() => { document.querySelector('[data-pz=spinner]').click(); }); await sleep(300);
  await ev(() => { const b = document.querySelector('[data-q="2"]'); if (b) b.click(); }); await sleep(300); await shot('t8b_prize_multiply');
  await ev(() => { const b = [...document.querySelectorAll('[data-t]')].find(b => +b.dataset.t === 160); b && b.click(); }); await sleep(1800); await shot('t9_prize_handoff');
  await sleep(2500); res.tixAfter = await ev(() => TIX.n);
  res.parentPrizes = await pg.evaluate(() => JSON.stringify(S.prizes || []));
  await ev(() => { leaveRoom(); enterRoom('clothing'); __dbg.P.x = ROOMS.clothing.cx; __dbg.P.z = ROOMS.clothing.cz - 2.8; __dbg.P.x += 1.8; __dbg.P.yaw = Math.PI; camYaw = -0.35; camPitch = .18; camDist = 5; }); await sleep(2200); await shot('t10_mr_sal');
  res.salPrompt = await ev(() => document.getElementById('prompt').textContent);
  await ev(() => salShop()); await sleep(2000); await shot('t11_sal_shop'); res.shopOpen = await pg.evaluate(() => { const h = document.querySelector('#modal.open h2'); return h && h.textContent; });
  await pg.evaluate(() => closeModal()); await sleep(300);
  await ev(() => showTouch()); await sleep(500); await shot('t12_touch');
};
