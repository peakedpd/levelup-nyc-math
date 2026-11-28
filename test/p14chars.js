// Meshy 3D characters: every one of the 16 Canva characters is a rigged 3D model in the game (no flat cards):
// the 12 heroes as the picked avatar, Theo, Ms. Marcia, Ms. Okafor (class + street) and the Arcade Worker.
// Checks: model loaded with walk/idle/talk/wave/cheer clips, feet on the ground, card art hidden, close-up frames the face.
module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const touch = !!process.env.TOUCH; const vp = pg.viewportSize();
  const wait = async (fn, arg, ms = 60000) => { await f.waitForFunction(fn, arg, { timeout: ms, polling: 250 }).catch(() => {}) };
  await f.evaluate(() => { window.__cineTest = true; if (QG) { S.remove(QG.g); QG = null; hideCard() } if (AREA !== 'street') leaveRoom() });
  const info = k => f.evaluate(k => { const a = ACT[k]; if (!a) return null; const b = new T.Box3().setFromObject(a.g, true); const c = a.clips ? Object.keys(a.clips) : [];
    return { clips: c, walk: a.act && a.act.getClip().name, minY: +b.min.y.toFixed(3), h: +(b.max.y - b.min.y).toFixed(2), x: a.g.position.x, y: a.g.position.y, z: a.g.position.z, vis: a.g.visible } }, k);
  const front = (x, z, yaw, d = 3.2, h = 1.4) => f.evaluate(([x, z, yaw, d, h]) => { CHARS3D.camOv = { x: x + Math.sin(yaw) * d, y: h, z: z + Math.cos(yaw) * d, lx: x, ly: h - .25, lz: z } }, [x, z, yaw, d, h]);
  const camOff = () => f.evaluate(() => { CHARS3D.camOv = null });
  // ---- 12 heroes ----
  res.heroes = [];
  for (let i = 0; i < 12; i++) {
    await f.evaluate(i => { const free = (x, z) => !SOL.some(b => b.top > .3 && x > b.x0 - 2.5 && x < b.x1 + 2.5 && z > b.z0 - 2.5 && z < b.z1 + 2.5); let x = -40, z = 3; for (const zz of [3, 2, 4, -3]) { let hit = false; for (let xx = -40; xx < 44; xx += .5) if (free(xx, zz) && free(xx, zz + 3.5)) { x = xx; z = zz; hit = true; break } if (hit) break } P.x = x; P.z = z; P.yaw = 0; TH.x = x + 6; TH.z = z - 4; heroSpriteSet(i) }, i);
    await wait(i => CHARS3D.idx === i && ACT.hero && ACT.hero.clips, i, 90000); await sleep(600);
    const s = await f.evaluate(() => { const a = ACT.hero, b = new T.Box3().setFromObject(a.g, true); return { idx: CHARS3D.idx, clips: a.clips ? Object.keys(a.clips) : [], footGap: +(b.min.y - a.g.position.y).toFixed(3), h: +(b.max.y - b.min.y).toFixed(2), sprite: !!HS.mesh, x: P.x, z: P.z, yaw: a.yaw } });
    res.heroes.push(s); ok(s.idx === i, `hero ${i} model swapped in (${s.idx})`); ok(s.clips.includes('idle') && s.clips.includes('talk'), `hero ${i} clips ${s.clips}`);
    ok(Math.abs(s.footGap) < .08, `hero ${i} feet on ground (gap ${s.footGap})`); ok(!s.sprite, `hero ${i} no flat sprite`);
    await front(s.x, s.z, s.yaw); await sleep(900); await shot(`hero${String(i).padStart(2, '0')}_world`); await camOff();
  }
  // walk with the last hero (walk clip plays, model moves)
  await f.evaluate(() => { __dbg.K.w = true }); await sleep(1600); await shot('hero_walk'); await f.evaluate(() => { __dbg.K.w = false }); await sleep(500);
  await f.evaluate(() => heroSpriteSet(0)); await wait(() => CHARS3D.idx === 0, null, 60000);
  // ---- NPCs in the world ----
  const npc = async (key, area, place, label) => {
    await f.evaluate(a => { if (AREA !== a) { if (AREA !== 'street') leaveRoom(); if (a !== 'street') goRoom(a, 'door') } }, area); await sleep(1500);
    if (key === 'worker') await wait(() => !!ACT.worker, null, 60000);
    await wait(k => !!ACT[k], key, 60000); await f.evaluate(place); await sleep(800);
    const s = await info(key); res[label] = s; ok(s && s.clips.includes('talk') && s.clips.includes('wave') && s.clips.includes('cheer') && s.clips.includes('idle'), `${label} has idle/talk/wave/cheer: ${s && s.clips}`);
    ok(s && Math.abs(s.minY - s.y) < .1, `${label} feet on the ground (${s && s.minY} vs ${s && s.y})`); ok(s && s.vis, `${label} visible`);
    const yaw = await f.evaluate(k => ACT[k].yaw, key); await front(s.x, s.z, yaw, 3.4, 1.5); await sleep(900); await shot(`${label}_world`); await camOff(); return s };
  await npc('theo', 'street', () => { P.x = TH.x + 4; P.z = TH.z + 3 }, 'theo');
  await npc('marcia', 'street', () => { P.x = MA.x + 4; P.z = MA.z + 4 }, 'marcia');
  await npc('okafor_st', 'street', () => { P.x = STREET_OK.x + 4; P.z = STREET_OK.z + 4 }, 'okafor_street');
  res.cardsHidden = await f.evaluate(() => ({ st: W2.okMat.visible === false, cls: TCH.mat.visible === false })); ok(res.cardsHidden.st, 'street Okafor card art hidden');
  await npc('okafor', 'school', () => { P.x = TCH.x + 5; P.z = TCH.z + 4 }, 'okafor');
  res.cardsHidden.cls = await f.evaluate(() => TCH.mat.visible === false); ok(res.cardsHidden.cls, 'classroom Okafor card art hidden');
  await npc('worker', 'arcade', () => { P.x = WK.x + 3; P.z = WK.z - 3 }, 'worker');
  // Mr. Sal (Clothing Store) and Brock (street challenger) are rigged 3D models too; their flat cards are hidden
  await npc('sal', 'clothing', () => { P.x = SAL.x + 3; P.z = SAL.z + 4 }, 'sal');
  await f.evaluate(() => { if (AREA !== 'street') leaveRoom(); brockSet({ on: true, sk: 'mult', title: 'Brock', say: 'Think you can beat me?', done: false }) });
  await npc('brock', 'street', () => { P.x = BRK.x + 4; P.z = BRK.z + 4 }, 'brock');
  res.cardsHidden.sal = await f.evaluate(() => W2.sal.mat.visible === false); ok(res.cardsHidden.sal, 'Mr. Sal card art hidden');
  res.cardsHidden.brock = await f.evaluate(() => BRK.mat.visible === false); ok(res.cardsHidden.brock, 'Brock card art hidden');
  await f.evaluate(() => brockSet({ on: false }));
  // ---- cinematic close-ups (talk clip plays while the line is spoken) ----
  const cine = async (label, area, start) => {
    await f.evaluate(a => { if (AREA !== a) { if (AREA !== 'street') leaveRoom(); if (a !== 'street') goRoom(a, 'door') } }, area); await sleep(1500);
    await f.evaluate(() => { CINEMA.hold = true }); await f.evaluate(start);
    await wait(() => { const c = CINEMA.cur; return c && c.frames >= 3 && cam.position.distanceTo((AREA === 'street' && c.npc === 'okafor' ? CINEMA.NPC.okafor_street : CINEMA.NPC[c.npc]).head()) < 4.5 }, null, 20000); await sleep(1200);
    const s = await f.evaluate(() => { const c = CINEMA.cur; if (!c) return { active: false }; const n = AREA === 'street' && c.npc === 'okafor' ? CINEMA.NPC.okafor_street : CINEMA.NPC[c.npc], a = n.act && n.act(), h = n.head(), v = h.clone().project(cam);
      return { active: true, npc: c.npc, sx: +v.x.toFixed(3), sy: +v.y.toFixed(3), pose: a && a.pose && a.pose.n, pw: a && +(a.pw || 0).toFixed(2), threeD: !!(a && a.clips), dist: +cam.position.distanceTo(h).toFixed(2) } });
    res['cine_' + label] = s; ok(s.active, label + ' scene active'); ok(s.threeD, label + ' close-up is the rigged 3D model'); ok(Math.abs(s.sx) < .5 && Math.abs(s.sy) < .65, `${label} face in frame ${s.sx},${s.sy}`);
    await shot('cine_' + label);
    for (let i = 0; i < 8 && await f.evaluate(() => CINEMA.active); i++) { if (touch) await pg.touchscreen.tap(vp.width / 2, vp.height / 2); else await pg.keyboard.press(i % 2 ? ' ' : 'e'); await sleep(450) }
    await f.evaluate(() => { CINEMA.hold = false; if (CINEMA.active) CINEMA.end && CINEMA.end(true) }); await sleep(400) };
  const fe = await pg.$('#street3d'); await fe.focus().catch(() => {});
  await cine('theo', 'street', () => { P.x = TH.x - .9; P.z = TH.z - .7; talkTo('Theo', TH.x, 2.4, TH.z) });
  await cine('marcia', 'street', () => { P.x = MA.x; P.z = MA.z + 1.6; talkTo('Ms. Marcia', MA.x, 2.75, MA.z) });
  await cine('okafor_street', 'street', () => { P.x = STREET_OK.x + .4; P.z = STREET_OK.z + 1.6; talkTo('Ms. Okafor', STREET_OK.x, 2.5, STREET_OK.z) });
  await cine('okafor', 'school', () => { P.x = TCH.x + .25; P.z = TCH.z + 1.2; P.yaw = Math.PI; talkTo('Ms. Okafor', TCH.x, 2.5, TCH.z) });
  await cine('worker', 'arcade', () => { P.x = WK.x + 1.2; P.z = WK.z - 1.6; W2._pzCine = 0; openPrizes() });
  await f.evaluate(() => { try { closePrizes() } catch (_) {} if (AREA !== 'street') leaveRoom() });
  res.fps3d = await f.evaluate(() => new Promise(r => { let n = 0; const s = performance.now(); (function k() { n++; if (performance.now() - s > 3000) r(+(n / 3).toFixed(1)); else requestAnimationFrame(k) })() }));
  res.charErr = await f.evaluate(() => CHARS3D.err || null); ok(!res.charErr, 'no character errors: ' + res.charErr);
  console.log('P14', JSON.stringify(res));
};
