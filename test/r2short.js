module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const ev = (fn, a) => f.evaluate(fn, a);
  await ev(() => { __dbg.P.x = -55; __dbg.P.z = -8.5; enterRoom('school'); }); await sleep(800);
  await ev(() => goRoom('rooftop', 'stairs')); await sleep(2500); await shot('t4_rooftop');
  await ev(() => { goRoom('school','door'); leaveRoom(); enterRoom('arcade'); }); for (let i = 0; i < 60; i++) { if (await ev(() => !!ACT.worker)) break; await sleep(500); }
  await ev(() => { __dbg.P.x = ROOMS.arcade.cx+1.2; __dbg.P.z = ROOMS.arcade.cz - 3.0; __dbg.P.yaw = Math.PI; camYaw = -0.3; camPitch = .25; camDist = 5.2; }); await sleep(2500); await shot('t5_worker_counter');
};
