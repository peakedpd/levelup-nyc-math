// Brock in the 3D street: he stands at the NYC spot of the student's current Weakness Challenge, taunts when you come near,
// walking up to him starts that challenge, and once beaten he turns friendly and steps aside (no more auto-start).
module.exports = async ({ pg, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  const f = pg.frame({ url: /street3d\.html/ });
  // the harness ends inside the arcade: step back out onto the street
  await f.evaluate(() => { if (AREA !== 'street') leaveRoom() }); await sleep(800);
  // before placement: no Brock
  res.pre = await f.evaluate(() => BRK.on); ok(res.pre === false, 'no Brock before the Placement Quest');
  await pg.evaluate(() => { closeModal(); S.learn = null; LUI.openPath(); closeModal(); const l = S.learn; l.diag = { d: '2026-11-01', t: Date.now(), sess: 0, scale: 455, place: {}, gaps: [], flagged: [] }; l.history = [l.diag]; l.base = {};
    for (const k in l.m) { const lv = k === 'groups' ? 1 : k === 'mult' ? 1 : 4; Object.assign(l.m[k], { lv, taught: 6 }); l.base[k] = lv } delete l.ch; save(); hud() });
  await sleep(600);
  res.placed = await f.evaluate(() => ({ spotX: BRK_X.groups, on: BRK.on, sk: BRK.info && BRK.info.sk, title: BRK.info && BRK.info.title, x: BRK.x, z: BRK.z, vis: BRK.mesh.visible, prop: !!BRK.prop }));
  console.log('P8 placed', JSON.stringify(res.placed)); ok(res.placed.on && res.placed.sk === 'groups' && res.placed.x === res.placed.spotX && /Group-Grabber/.test(res.placed.title) && res.placed.prop, 'Brock stands at the Fruit Stand for the groups challenge: ' + JSON.stringify(res.placed));
  // look at him from a few steps away (camera-facing billboard, taunting pose + speech bubble)
  await f.evaluate(() => { P.x = BRK.x + 2.8; P.z = BRK.z - .9; P.yaw = Math.atan2(BRK.x - P.x, BRK.z - P.z); camYaw = P.yaw + Math.PI + .5; camPitch = .15; camDist = 3.6; camSnap = true; TH.x = P.x + 9; TH.z = 6 }); await sleep(1500);
  res.near = await f.evaluate(() => ({ vis: BRK.mesh.visible, tex: BRK.mat.map.image && BRK.mat.map.image.src, bub: BUB.style.display === 'block' ? BUB.innerText : '', face: Math.abs(Math.atan2(Math.sin(BRK.mesh.rotation.y - Math.atan2(cam.position.x - BRK.x, cam.position.z - BRK.z)), Math.cos(BRK.mesh.rotation.y - Math.atan2(cam.position.x - BRK.x, cam.position.z - BRK.z)))) < .01 }));
  console.log('P8 near', JSON.stringify(res.near)); ok(res.near.vis && /brock_taunt/.test(res.near.tex || '') && /Group-Grabber/.test(res.near.bub) && res.near.face, 'visible, taunting, faces the camera: ' + JSON.stringify(res.near)); await shot('p8_street_brock');
  // walk right up to him -> today's challenge starts
  await f.evaluate(() => { P.yaw = Math.atan2(BRK.x - P.x, BRK.z - P.z); camYaw = P.yaw + Math.PI; camSnap = true; K.w = true }); for (let i = 0; i < 30 && !(await pg.evaluate(() => !!CHALLENGEUI.battle)); i++) await sleep(200); await f.evaluate(() => { K.w = false });
  res.start = await pg.evaluate(() => ({ b: CHALLENGEUI.battle && CHALLENGEUI.battle.stage, sk: CHALLENGEUI.battle && CHALLENGEUI.battle.sk, modal: document.querySelector('#modal.open') && document.querySelector('#modal').innerText.slice(0, 160) }));
  ok(res.start.b === 'reteach' && res.start.sk === 'groups' && /Group-Grabber/.test(res.start.modal || ''), 'walking up to Brock starts that challenge: ' + JSON.stringify(res.start)); await shot('p8_walkup_battle');
  console.log('P8 start', JSON.stringify(res.start)); if (!res.start.b) return;
  // beat him (fast-forward the battle result) -> friendly, steps aside, no auto-start
  await pg.evaluate(() => { const b = CHALLENGEUI.battle; b.result = 'defeated'; b.hits = b.need; CHALLENGE.finish(S.learn, b); b.stage = 'done'; save(); closeModal(); hud() }); await sleep(800);
  res.friend = await f.evaluate(() => ({ done: BRK.info.done, x: BRK.x, tex: BRK.mat.map.image && BRK.mat.map.image.src, bub: BUB.style.display === 'block' ? BUB.innerText : '' }));
  ok(res.friend.done && res.friend.x !== res.placed.spotX && /brock_friend/.test(res.friend.tex || '') && /friend|cool|teach|show/i.test(res.friend.bub), 'beaten Brock is friendly and steps aside: ' + JSON.stringify(res.friend));
  await f.evaluate(() => { P.x = BRK.x + 2.8; P.z = BRK.z - .4; P.yaw = Math.atan2(BRK.x - P.x, BRK.z - P.z); camYaw = P.yaw + Math.PI + .5; camPitch = .15; camDist = 3.6; camSnap = true; TH.x = P.x + 9; TH.z = 6 }); await sleep(1500); await shot('p8_street_friendly');
  await f.evaluate(() => { P.x = BRK.x + .9; P.z = BRK.z }); await sleep(1500);
  res.noAuto = await pg.evaluate(() => !document.querySelector('#modal.open')); ok(res.noAuto, 'friendly Brock does not auto-start a battle');
  res.label = await f.evaluate(() => (interactions()[0] || {}).label); ok(/bonus round/.test(res.label || ''), 'E offers a bonus round: ' + res.label);
  await f.evaluate(() => { P.x = SPAWN.x; P.z = SPAWN.z });
};
