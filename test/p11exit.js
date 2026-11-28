// Arcade (and other indoor) EXIT doors must return the player to an open sidewalk, not a roof or a collider.
module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const A = res.assert = res.assert || [];
  const ok = (c, m) => { if (!c) A.push(m) };
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` });

  await f.evaluate(() => { if (AREA !== 'street') leaveRoom(); });
  await sleep(400);

  // Enter the arcade the same way a student would, then use the EXIT door
  await f.evaluate(() => {
    const d = DOORS.filter(x => x.kind === 'arcade').sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z))[0];
    const t = d.z > 0 ? -1 : 1;
    P.x = d.x; P.z = d.z + t * 2.8; P.fy = .12; P.vy = 0; AREA = 'street';
    RET = { x: P.x, z: P.z };
  });
  await sleep(300);
  await f.evaluate(() => enterRoom('arcade'));
  await sleep(900);
  ok(await f.evaluate(() => AREA === 'arcade'), 'entered the arcade');

  const exits = await f.evaluate(() => interactions().filter(d => d.type === 'exit' || d.type === 'exit2').map(d => ({ type: d.type, to: d.to, label: d.label, x: d.x, z: d.z })));
  res.arcadeExits = exits;
  ok(exits.some(d => d.to === 'street' || d.type === 'exit'), 'arcade EXIT is wired to the street: ' + JSON.stringify(exits));

  await f.evaluate(() => {
    const d = interactions().find(x => x.type === 'exit2' && x.to === 'street') || interactions().find(x => x.type === 'exit' || x.type === 'exit2');
    if (d) { P.x = d.x; P.z = d.z - 0.3 * Math.sign(d.z - ROOMS.arcade.cz || 1); nearDoor = d; tryDoor(); }
  });
  await sleep(900);

  const land = await f.evaluate(() => {
    const gnd = supportAt(P.x, P.z, P.fy);
    return { AREA, x: +P.x.toFixed(2), z: +P.z.toFixed(2), fy: +P.fy.toFixed(2), gnd: +gnd.toFixed(2), blocked: blocked(P.x, P.z, P.fy) };
  });
  res.landed = land;
  ok(land.AREA === 'street', 'EXIT landed on the street, not ' + land.AREA);
  ok(land.fy < 2, 'feet are on the sidewalk, not a roof (fy=' + land.fy + ')');
  ok(land.gnd < 1, 'ground underfoot is sidewalk (gnd=' + land.gnd + ')');
  ok(!land.blocked, 'spawn is not inside a wall or building');
  await shot('p11_street_after_exit');

  const before = { x: land.x, z: land.z };
  await f.evaluate(() => { K.w = true; K.arrowup = true; });
  await sleep(900);
  await f.evaluate(() => { K.w = false; K.arrowup = false; });
  const after = await f.evaluate(() => ({ x: P.x, z: P.z, fy: P.fy, AREA }));
  const dist = Math.hypot(after.x - before.x, after.z - before.z);
  res.walked = { dist: +dist.toFixed(3), after };
  ok(after.AREA === 'street', 'still on the street after walking');
  ok(dist > 0.15, 'can walk after exiting (moved ' + dist.toFixed(2) + ')');
  ok(after.fy < 2, 'did not walk up onto a roof (fy=' + after.fy + ')');
  await shot('p11_street_walk');

  // Every indoor room must have a way out; only the hallway may lead to the rooftop, and the rooftop must lead back
  const audit = await f.evaluate(() => {
    const out = {};
    for (const k of Object.keys(ROOMS)) {
      const R = ROOMS[k];
      out[k] = { exits: (R.exits || []).map(e => e.to), hasExitObj: !!R.exit };
    }
    return out;
  });
  res.audit = audit;
  ok(audit.arcade && audit.arcade.exits.includes('street'), 'arcade exits to street');
  ok(audit.clothing && audit.clothing.exits.includes('street'), 'clothing store exits to street');
  ok(audit.apartment && audit.apartment.exits.includes('street'), "Theo's apartment exits to street");
  ok(audit.lobby && audit.lobby.exits.includes('street'), 'lobby exits to street');
  ok(audit.school && audit.school.exits.includes('hallway'), 'classroom exits to the hallway, not a dead end');
  if (audit.rooftop) {
    ok(audit.rooftop.exits.length > 0 && audit.rooftop.exits.every(t => t !== 'rooftop'), 'rooftop has a way down: ' + JSON.stringify(audit.rooftop.exits));
  }
  const toRoof = Object.entries(audit).filter(([k, v]) => k !== 'hallway' && (v.exits || []).includes('rooftop'));
  ok(toRoof.length === 0, 'only the hallway should lead to the rooftop, also found in ' + JSON.stringify(toRoof));
};
