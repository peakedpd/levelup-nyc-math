// Screenshot set for the environment 3D pass (not in CI): street views + every interior. VIEWS=street,arcade,... to limit.
module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` });
  const want = (process.env.VIEWS || '').split(',').filter(Boolean); const on = k => !want.length || want.includes(k);
  await f.evaluate(() => { window.__cineTest = true; if (QG) { S.remove(QG.g); QG = null; hideCard() } if (AREA !== 'street') leaveRoom() });
  const cam = (x, y, z, lx, ly, lz) => f.evaluate(a => { CHARS3D.camOv = { x: a[0], y: a[1], z: a[2], lx: a[3], ly: a[4], lz: a[5] } }, [x, y, z, lx, ly, lz]);
  res.rooms = await f.evaluate(() => Object.keys(ROOMS));
  if (on('street')) {
    await f.evaluate(() => { P.x = -48; P.z = 0 }); await sleep(1500);
    const V = { s_wide: [-22, 2.4, 3.5, 6, 6, -9], s_north: [-30, 3.2, 2, -30, 6.2, -9], s_south: [10, 3.2, -2, 10, 6.2, 9], s_up: [-24, 1.4, -6.8, -25.5, 8, -9.6], s_apt: [-25, 2.5, 2, -25, 6, -9], s_arcade: [5, 3, -2, 5, 6.5, 9] };
    for (const k in V) { await cam(...V[k]); await sleep(1300); await shot(k) }
  }
  for (const r of ['arcade', 'clothing', 'school', 'hallway', 'lobby', 'gym', 'cafeteria', 'apartment']) {
    if (!on(r) || !res.rooms.includes(r)) continue;
    await f.evaluate(a => { if (AREA !== 'street') leaveRoom(); goRoom(a, 'door') }, r); await sleep(2500);
    const R = await f.evaluate(a => { const R = ROOMS[a]; return { cx: R.cx, cz: R.cz, w: R.w || 18, d: R.d || 16 } }, r);
    await cam(R.cx, 2.6, R.cz + R.d / 2 - 1.2, R.cx, 1.5, R.cz - 2); await sleep(1500); await shot(r + '_a');
    await cam(R.cx + R.w / 2 - 1.2, 2.4, R.cz, R.cx - 2, 1.4, R.cz - R.d / 4); await sleep(1200); await shot(r + '_b');
  }
  await f.evaluate(() => { CHARS3D.camOv = null; if (AREA !== 'street') leaveRoom() });
  res.env = await f.evaluate(() => window.ENV3D ? { street: (({ parts, taps, buildings, meshes }) => ({ parts, taps, buildings, meshes }))(ENV3D.street || {}) } : null);
};
