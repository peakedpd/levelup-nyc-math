// Classroom pilot: enter Ms. Okafor's room, take angle shots, check interactions + collisions still work.
module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const A = res.assert = res.assert || [];
  const ok = (c, m) => { if (!c) A.push(m) };
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` });
  await f.evaluate(() => { if (AREA !== 'street') leaveRoom(); });
  await f.evaluate(() => goRoom('school','door')); await sleep(2500);
  ok(await f.evaluate(() => AREA === 'school'), 'entered the classroom');
  await sleep(2500);
  const st = await f.evaluate(() => { const g = ROOMS.school.g; let meshes = 0, glbs = 0, tex = 0; g.traverse(o => { if (o.isMesh && o.visible) { meshes++; if (o.material && o.material.map) tex++ } }); const mural = g.children.some(o => o.isMesh && o.visible && o.geometry.type === 'PlaneGeometry' && Math.abs(o.geometry.parameters.width - 9.9) < 1e-4); return { meshes, tex, mural, children: g.children.length } });
  res.classroomStats = st;
  ok(!st.mural, 'flat Canva mural is gone (objects are 3D)');
  ok(st.children > 90 && st.meshes > 100, 'classroom has real 3D furniture/props loaded (children=' + st.children + ')');
  await shot('c1_enter');
  const view = (x, z, yaw, pitch, dist) => f.evaluate(([x, z, yaw, pitch, dist]) => { P.x = ROOMS.school.cx + x; P.z = ROOMS.school.cz + z; camYaw = yaw; camPitch = pitch; camDist = dist; camSnap = true; }, [x, z, yaw, pitch, dist]);
  await view(0, 2, 0, .75, 9); await sleep(900); await shot('c2_overview');
  await view(5, 4, .6, .45, 6); await sleep(900); await shot('c3_front_right');
  await view(-6, 3, -.5, .4, 6); await sleep(900); await shot('c4_front_left');
  await view(0, -2.5, Math.PI, .5, 5); await sleep(900); await shot('c5_from_wall');
  await view(0, 1, 0, .18, 7); await sleep(900); await shot('c6_board');
  await view(-1, -1, -Math.PI/2, .3, 6); await sleep(900); await shot('c7_right_wall');
  await view(1, 0, Math.PI/2, .3, 6); await sleep(900); await shot('c8_left_windows');
  // interactions
  const ints = await f.evaluate(() => { P.x = TCH.x + 1; P.z = TCH.z + 1; return interactions().map(d => d.type + ':' + (d.id || d.to || '')) });
  res.ints = ints;
  ok(ints.some(s => s.startsWith('station:school')), 'Ms. Okafor station present: ' + ints.join(','));
  ok(await f.evaluate(() => OPEN.some(o => o.id === 'desk') && DESKI.length === 4), 'desk drawer + desk items still registered');
  // walk through the desk grid door -> teacher without being stuck
  const dr = await f.evaluate(() => { const o = (window.__dbg && __dbg.openables) || null; return typeof regOpen; });
  res.regOpen = dr;
  // collision: cannot walk through a student desk
  const blk = await f.evaluate(() => { const r = ROOMS.school; return { desk: blocked(r.cx - 5.4, r.cz - 1.5, 0), free: blocked(r.cx, r.cz + 6, 0), door: blocked(r.exit.x, r.exit.z - 1, 0) } });
  res.blk = blk;
  ok(blk.desk === true || blk.desk, 'student desks are solid');
  ok(!blk.free && !blk.door, 'walkway + entrance free');
  const fps = await f.evaluate(() => new Promise(r => { let n = 0; const s = performance.now(); (function k() { n++; if (performance.now() - s > 2000) r(n / 2); else requestAnimationFrame(k) })() }));
  res.classFps = fps;
  res.info = await f.evaluate(() => ({ calls: window.__dbg && __dbg.R ? 1 : 0 }));
};
