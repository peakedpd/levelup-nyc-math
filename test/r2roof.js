module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const ev = (fn, a) => f.evaluate(fn, a);
  await ev(() => { __dbg.P.x = -55; __dbg.P.z = -8.5; enterRoom('school'); }); await sleep(800);
  await ev(() => goRoom('rooftop', 'stairs')); await sleep(2500);
  res.roof = await ev(() => ({ P: [__dbg.P.x, __dbg.P.z, __dbg.P.yaw, P.y, P.fy], cam: cam.position.toArray(), camYaw, camPitch, camDist, area: AREA, R: [ROOMS.rooftop.cx, ROOMS.rooftop.cz, ROOMS.rooftop.w, ROOMS.rooftop.d, ROOMS.rooftop.h] }));
  await pg.screenshot({ path: `${OUT}/roof.png` });
};
