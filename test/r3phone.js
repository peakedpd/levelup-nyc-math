module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const ev = (fn, a) => f.evaluate(fn, a);
  await ev(() => { if (AREA !== 'street') leaveRoom(); __dbg.P.x = -40; __dbg.P.z = -6.5; camYaw = Math.PI * .6; camPitch = .3; camDist = 8; }); await sleep(1500); await shot('ph1_street_touch');
  res.touchVisible = await ev(() => getComputedStyle(document.getElementById('touch')).display);
  // joystick drag moves the player
  const box = await pg.evaluate(() => { const fr = document.getElementById('street3d').getBoundingClientRect(); return { x: fr.x, y: fr.y }; });
  const j = await ev(() => { const r = document.getElementById('joy').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  const p0 = await ev(() => ({ x: __dbg.P.x, z: __dbg.P.z }));
  await pg.mouse.move(box.x + j.x, box.y + j.y); await pg.mouse.down(); await pg.mouse.move(box.x + j.x, box.y + j.y - 50, { steps: 4 }); await sleep(2500); await pg.mouse.up();
  const p1 = await ev(() => ({ x: __dbg.P.x, z: __dbg.P.z })); res.joyMoved = Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(2);
  await ev(() => { leaveRoom(); enterRoom('arcade'); startBlaster(); }); await sleep(1800); await shot('ph2_blaster');
  await ev(() => { W2.blaster.over = true; endBlaster(); goRoom('lobby', 'front'); goRoom('hallway', 'front'); goRoom('rooftop', 'stairs'); }); await sleep(800);
  await ev(() => bossStart()); await sleep(3500); await shot('ph3_boss');
  res.bossCardFits = await ev(() => { const r = document.getElementById('bosscard').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: innerHeight, w: r.width, vw: innerWidth }; });
  await ev(() => bossEnd(false, true)); await sleep(300);
  await ev(() => { goRoom('school', 'door'); startGame('Ms. Okafor', true, ['marbles'], 'review'); });
  for (let i = 0; i < 80; i++) { if (await ev(() => QG && QG.phase === 'ask')) break; await sleep(250); } await sleep(400); await shot('ph4_class_q');
  res.qcard = await ev(() => { const r = document.getElementById('qcard').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: innerHeight }; });
};
