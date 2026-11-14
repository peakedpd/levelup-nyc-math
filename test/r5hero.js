module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` });
  await pg.evaluate(() => { try { closeModal() } catch (_) {} });
  res.heroes = {};
  for (const h of (process.env.HEROES||'3,7,11').split(',').map(Number)) {
    await pg.evaluate(h => { S.avatar.hero = h; save(); document.getElementById('street3d').contentWindow.postMessage({ lv3d: 'hero', hero: h }, '*') }, h);
    await sleep(2500);
    await f.evaluate(() => { if (AREA !== "street") leaveRoom(); }); await sleep(800); await f.evaluate(() => { __dbg.P.x = 5; __dbg.P.z = 1; TH.x = -50; TH.z = -6; camSnap = true; __dbg.P.yaw = 0; __dbg.ACT.hero.yaw = 0; camPitch = .18; camDist = 4.5 });
    for (const [nm, y] of [['front', 0], ['q', Math.PI * .25], ['side', Math.PI * .5], ['back', Math.PI]]) {
      await f.evaluate(y => { camYaw = y; __dbg.P.yaw = 0; __dbg.ACT.hero.yaw = 0; TH.x = __dbg.P.x + 2.1; TH.z = __dbg.P.z - 1.5 }, y); await sleep(1400); res['cam'+h+nm] = await f.evaluate(() => [cam.position.distanceTo(new THREE.Vector3(__dbg.P.x, 1.8, __dbg.P.z)).toFixed(2), camDist, __dbg.P.x.toFixed(1), __dbg.P.z.toFixed(1), TH.x.toFixed(1)]); await shot(`h${h}_idle_${nm}`);
    }
    await f.evaluate(() => { camYaw = Math.PI; __dbg.K.w = true }); await sleep(900); await shot(`h${h}_walk_a`); await sleep(350); await shot(`h${h}_walk_b`);
    await f.evaluate(() => { __dbg.K.w = false; __dbg.K.d = true }); await sleep(900); await shot(`h${h}_walk_side`); await f.evaluate(() => { __dbg.K.d = false });
    await f.evaluate(() => { camYaw = 0; __dbg.P.z = -2; __dbg.K.s = true }); await sleep(700); await shot(`h${h}_walk_toward_a`); await sleep(110); await shot(`h${h}_walk_toward_b`);
    await f.evaluate(() => { __dbg.K.d = true }); await sleep(700); await shot(`h${h}_walk_diag`); await f.evaluate(() => { __dbg.K.s = false; __dbg.K.d = false });
    res.heroes[h] = await f.evaluate(() => ({ idx: HS.idx, vis: HS.mesh && HS.mesh.visible, glb: __dbg.ACT.hero.g.visible, keys: Object.keys(HS.tex).length }));
  }
};
