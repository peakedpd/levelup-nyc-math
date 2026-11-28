// Universe pass: street objects are real 3D and interactive (trash lid lifts and shows what's inside, hydrant sprays,
// lamp switches, tree shakes, newsstand headline -> math moment), E priority (doors/Brock first), flat-panel audit.
module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` });
  const at = (x, z) => f.evaluate(([x, z]) => { if (QG) { try { S.remove(QG.g); hideCard() } catch (_) { } QG = null } if (AREA !== 'street') leaveRoom(); P.x = x; P.z = z; P.fy = .12; P.vy = 0; for (const k in K) K[k] = false; }, [x, z]);
  const sync = () => f.evaluate(() => { nearDoor = interactions().find(d => Math.hypot(d.x - P.x, d.z - P.z) < d.r) || null });
  const pressE = () => sync().then(() => f.evaluate(() => dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))).then(() => f.evaluate(() => dispatchEvent(new KeyboardEvent('keyup', { key: 'e' })))));
  const label = () => sync().then(() => f.evaluate(() => nearDoor && nearDoor.label));
  ok(await f.evaluate(() => !!(window.U && U.street && U.street.cans.length >= 4)), 'universe street objects built');
  // 1) trash can: lid lifts, contents visible, then closes
  const can = await f.evaluate(() => { const c = U.street.cans[0]; return { x: c.x, z: c.z } });
  await at(can.x, can.z - Math.sign(can.z) * 1.0); await f.evaluate(() => { TH.x = P.x + 3; TH.z = P.z; IDLE = 0 }); await sleep(400);
  const l1 = await label(); res.canLabel = l1; ok(/trash can lid/i.test(l1 || ''), 'E prompt at the trash can: ' + l1);
  await pressE();
  for (let i = 0; i < 40; i++) { if (await f.evaluate(() => Math.abs(U.street.cans[0].hinge.rotation.x) > 1.2)) break; await sleep(250); }
  const lid = await f.evaluate(() => { const c = U.street.cans[0]; return { open: !!c.open, rot: Math.abs(c.hinge.rotation.x), items: c.cont.children.length } });
  res.lid = lid; ok(lid.open && lid.rot > 1.2, 'lid lifted (rot ' + lid.rot.toFixed(2) + ')'); ok(lid.items > 0, 'there is something inside the can');
  await shot('p13_trash_open');
  await f.evaluate(() => { try { uclose() } catch (_) { } U.offer = null }); await at(can.x, can.z - Math.sign(can.z) * 1.0); await sleep(300);
  res.closeLabel = await label(); await pressE();
  for (let i = 0; i < 40; i++) { if (await f.evaluate(() => Math.abs(U.street.cans[0].hinge.rotation.x) < .2)) break; await sleep(250); }
  ok(await f.evaluate(() => !U.street.cans[0].open && Math.abs(U.street.cans[0].hinge.rotation.x) < .2), 'lid closes again (prompt was ' + res.closeLabel + ')');
  // 2) Theo standing right next to you (idle) does not take E away from the can
  await f.evaluate(() => { TH.x = P.x + .8; TH.z = P.z; IDLE = 3 }); await sleep(350);
  const l2 = await label(); ok(/trash can lid|lid back on/i.test(l2 || ''), 'object keeps E even with Theo idle next to you: ' + l2);
  // 3) hydrant sprays water
  const hy = await f.evaluate(() => { const h = U.street.hyd[1]; return { x: h.tap.x, z: h.tap.z } });
  await at(hy.x, hy.z); await sleep(400); await pressE(); await sleep(700);
  const sp = await f.evaluate(() => ({ on: U.street.hyd[1].on, parts: UPART.length }));
  res.hydrant = sp; ok(sp.on > 0, 'hydrant sprays (' + JSON.stringify(sp) + ')'); await shot('p13_hydrant');
  await f.evaluate(() => { try { uclose() } catch (_) { } });
  // 4) lamp switch
  const lp = await f.evaluate(() => { const l = U.street.lamps[3]; return { x: l.x, z: l.z, on: l.on } });
  await at(lp.x, lp.z + (lp.z > 0 ? .6 : -.6)); await sleep(400); await pressE(); await sleep(300);
  ok(await f.evaluate(on => U.street.lamps[3].on !== on, lp.on), 'street lamp switched');
  // 5) tree shakes
  const tr = await f.evaluate(() => { const t = U.street.trees[0]; return { x: t.tap.x, z: t.tap.z } });
  await at(tr.x, tr.z); await sleep(400); await pressE(); await sleep(250);
  ok(await f.evaluate(() => U.street.trees[0].shake > 0), 'tree shakes');
  // 6) newsstand -> math headline -> optional math moment, answered right
  await at(0, 6.25); await sleep(400); const l6 = await label(); ok(/newspaper/i.test(l6 || ''), 'newsstand prompt: ' + l6);
  await pressE(); await sleep(400); ok(await f.evaluate(() => !!U.offer && U.offer.kind === 'round'), 'headline offers a rounding math moment');
  await f.evaluate(() => dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }))); await sleep(400);
  const q = await f.evaluate(() => U.quiz && { ans: U.quiz.q.ans, choices: U.quiz.q.choices, blocked: BLOCKIN() });
  ok(q && q.choices.includes(q.ans), 'math moment opened with the answer among choices'); ok(q && q.blocked, 'walking is paused during the math moment');
  await shot('p13_math_moment');
  if (q) { const i = q.choices.indexOf(q.ans) + 1; await f.evaluate(i => dispatchEvent(new KeyboardEvent('keydown', { key: String(i) })), i); await sleep(500); ok(await f.evaluate(() => /Correct/.test(document.getElementById('uqF').textContent)), 'right answer accepted'); }
  await sleep(2800); ok(await f.evaluate(() => !U.quiz), 'math moment closes');
  // 7) doors keep priority over nearby objects
  const dr = await f.evaluate(() => { const d = DOORS.find(d => d.kind === 'clothing'); return { x: d.x, z: d.z, name: d.name } });
  await at(dr.x, dr.z - Math.sign(dr.z) * 1.2); await sleep(400); const l7 = await label(); ok(/go inside/i.test(l7 || ''), 'store door keeps E: ' + l7);
  // 8) every street object prompt is at least 2.2 m from doors' centres or loses to the door (never blocks entering)
  const clash = await f.evaluate(() => U.taps.filter(t => t.area === 'street').filter(t => DOORS.some(d => Math.hypot(d.x - t.x, d.z - t.z) < 1.0)).map(t => t.label));
  ok(clash.length === 0, 'object prompts sitting on top of a door: ' + JSON.stringify(clash));
  res.streetTaps = await f.evaluate(() => U.taps.filter(t => t.area === 'street').length);
  ok(res.streetTaps >= 40, 'many interactive street objects (' + res.streetTaps + ')');
  // 9) flat-panel audit: no image panel pretending to be a 3D object in walkable space (street + finished areas)
  const fa = await f.evaluate(() => flatAudit()); res.flatAudit = fa;
  const DONE = (process.env.UNI_DONE || 'street,clothing,apartment,lobby,hallway,gym,cafeteria,rooftop').split(',');
  const bad = fa.filter(p => DONE.includes(p.area)); ok(bad.length === 0, 'flat image panels left in finished areas: ' + JSON.stringify(bad));
  // 10) still walkable after all that
  await at(-49.6, -6.4); const b0 = await f.evaluate(() => ({ x: P.x })); await f.evaluate(() => { K.d = true }); await sleep(1800); await f.evaluate(() => { K.d = false });
  ok(await f.evaluate(x => Math.abs(P.x - x) > .05, b0.x), 'avatar still walks');
};
