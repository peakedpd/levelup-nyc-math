// Environment 3D pass: real 3D upper floors on every street building + the new street interactions.
module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` });
  await f.evaluate(() => { window.__cineTest = true; if (QG) { S.remove(QG.g); QG = null; hideCard() } if (AREA !== 'street') leaveRoom() });
  await f.waitForFunction(() => window.ENV3D && ENV3D.street && ENV3D.street.meshes > 0, null, { timeout: 30000 }).catch(() => {});
  const st = await f.evaluate(() => { const E = ENV3D.street; let painted = 0, fronts = 0;
    S.traverse(o => { if (o.isMesh && Array.isArray(o.material) && o.material[4] && Object.values(FAC).includes(o.material[4].map)) painted++; if (o.name === 'env_storefront') fronts++ });
    return { buildings: E.buildings, parts: E.parts, meshes: E.meshes, ladders: E.ladders.length, walls: E.bld.length, taps: E.taps, painted, fronts, flat: (typeof flatAudit === 'function') ? flatAudit().filter(a => a.area === 'street').length : null } });
  res.street = st;
  ok(st.buildings === 24, 'all 24 street buildings upgraded: ' + st.buildings); ok(st.painted === 0, 'no painted upper floors left: ' + st.painted); ok(st.fronts === 24, 'storefront art planes: ' + st.fronts);
  ok(st.parts > 3000, '3D facade parts: ' + st.parts); ok(st.meshes <= 30, 'instanced draw calls: ' + st.meshes); ok(st.ladders >= 18, 'fire-escape ladders: ' + st.ladders); ok(st.flat === null || st.flat === 0, 'street flat audit clean: ' + st.flat);
  // pull an apartment ladder down
  const lad = await f.evaluate(() => { const L = ENV3D.street.ladders.find(l => l.kind === 'apartment'); P.x = L.x; P.z = L.z; L.tap.fn(); return { maxDrop: L.maxDrop } });
  await sleep(2500); const cur = await f.evaluate(() => ENV3D.street.ladders.find(l => l.kind === 'apartment').cur); res.ladder = { ...lad, cur };
  ok(Math.abs(cur - lad.maxDrop) < .15, `ladder slid down (${cur} of ${lad.maxDrop})`); await shot('ladder_down');
  await f.evaluate(() => ENV3D.street.ladders.find(l => l.kind === 'apartment').tap.fn()); await sleep(1200);
  // look up at a wall: camera shot + windows math moment with the right answer
  const lw = await f.evaluate(() => { const w = ENV3D.street.bld[3]; P.x = w.x; P.z = w.z; w.tap.fn(); return { rows: w.rows, cols: w.cols } }); await sleep(700);
  res.lookUp = await f.evaluate(() => ({ cine: !!CINE, camY: +cam.position.y.toFixed(2) })); ok(res.lookUp.cine, 'look-up camera shot'); await shot('look_up');
  await sleep(900); const q = await f.evaluate(() => { const o = U.offer; if (!o) return null; uquiz(o.kind, o.id, o.emoji); return U.quiz && U.quiz.q });
  ok(q && q.ans === String(lw.rows * lw.cols) && q.choices.includes(q.ans), 'windows quiz answer = rows × cols: ' + JSON.stringify(q && { ans: q.ans, ch: q.choices }));
  await shot('windows_quiz'); await f.evaluate(() => { try { uclose() } catch (_) {} });
  // trash can peek camera
  await sleep(2600); const tc = await f.evaluate(() => { const C = ST3.cans[0]; P.x = C.x; P.z = C.z + (C.z > 0 ? -1 : 1); if (C.open) C.tap.fn(); C.tap.fn(); return C.open }); await sleep(900);
  res.can = await f.evaluate(() => ({ cine: !!CINE, open: ST3.cans[0].open, look: CINE && +CINE.look.y.toFixed(2) })); ok(tc && res.can.cine, 'trash can peek camera'); await shot('trash_peek');
  await f.evaluate(() => { const C = ST3.cans[0]; if (C.open) C.tap.fn(); try { uclose() } catch (_) {} });
  res.fps3d = await f.evaluate(() => new Promise(r => { let n = 0; const s = performance.now(); (function k() { n++; if (performance.now() - s > 3000) r(+(n / 3).toFixed(1)); else requestAnimationFrame(k) })() }));
  console.log('P15', JSON.stringify(res));
};
