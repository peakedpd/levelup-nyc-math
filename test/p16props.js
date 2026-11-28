// Meshy hero props: every prop loads as a real 3D model in its area, sits on the floor/counter, and is interactive (E/tap -> animation + optional math moment with a correct answer).
module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` });
  await f.evaluate(() => { window.__cineTest = true; if (QG) { S.remove(QG.g); QG = null; hideCard() } if (AREA !== 'street') leaveRoom() });
  // quiz generators: answer always among 4 unique choices
  res.gen = await f.evaluate(() => { const bad = []; for (const k in ENV3D.qgen) for (let s = 1; s < 400; s++) { const q = UQ.G[k](s * 7919); if (!q.choices.includes(q.ans) || new Set(q.choices).size !== 4 || q.choices.length !== 4 || !q.explain.includes(q.ans.replace(' minutes', ''))) { bad.push(k + ':' + JSON.stringify(q)); break } } return { n: Object.keys(ENV3D.qgen).length, bad } });
  ok(res.gen.bad.length === 0, 'prop quiz generators: ' + res.gen.bad.join(' | '));
  const areas = ['street', 'arcade', 'school', 'hallway', 'lobby', 'gym', 'cafeteria', 'clothing', 'apartment'];
  res.areas = {};
  for (const a of areas) {
    await f.evaluate(a => { if (AREA !== a) { if (AREA !== 'street') leaveRoom(); if (a !== 'street') goRoom(a, 'door') } ENV3D.props.loadArea(a) }, a);
    await f.waitForFunction(a => { const P = ENV3D.props; return P.list.filter(p => p.area === a).length >= P.byArea[a].length }, a, { timeout: 60000, polling: 300 }).catch(() => {});
    await sleep(800);
    const r = await f.evaluate(a => { const P = ENV3D.props, L = P.list.filter(p => p.area === a); const out = [];
      for (const p of L) { const b = new T.Box3().setFromObject(p.g); out.push({ n: p.d.n, minY: +(b.min.y - p.y).toFixed(3), h: +(b.max.y - b.min.y).toFixed(2), vis: p.g.visible && (a === 'street' || ROOMS[a].g.visible) }) } return { want: P.byArea[a].length, got: L.length, items: out } }, a);
    res.areas[a] = r; ok(r.got === r.want, `${a}: ${r.got}/${r.want} props loaded`);
    r.items.forEach(it => { ok(Math.abs(it.minY) < .06, `${a} ${it.n} sits on its surface (${it.minY})`); ok(it.h > .3, `${a} ${it.n} has size ${it.h}`); ok(it.vis, `${a} ${it.n} visible`) });
    // use every prop
    const n = r.got; let offers = 0;
    for (let i = 0; i < n; i++) {
      const u = await f.evaluate(([a, i]) => { const L = ENV3D.props.list.filter(p => p.area === a), p = L[i]; P.x = p.tx; P.z = p.tz; U.offer = null; p.tap.fn(); return { n: p.d.n, used: p.used } }, [a, i]);
      await sleep(900);
      const o = await f.evaluate(() => { const o = U.offer; if (!o) return null; uquiz(o.kind, o.id, o.emoji); const q = U.quiz && U.quiz.q; uclose(); U.offer = null; return q ? { kind: o.kind, ans: q.ans, ok: q.choices.includes(q.ans) } : { kind: o.kind, ans: null } });
      if (o) { offers++; ok(o.ok, `${a} ${u.n} quiz has its answer`) }
      ok(u.used === 1 || u.used > 0, `${a} ${u.n} tap ran`);
      if (i === 0) await shot(`use_${a}_${u.n}`);
    }
    r.offers = offers;
    const R = await f.evaluate(a => a === 'street' ? null : { cx: ROOMS[a].cx, cz: ROOMS[a].cz, d: ROOMS[a].d || RD }, a);
    if (R) { await f.evaluate(([x, y, z, lx, ly, lz]) => { CHARS3D.camOv = { x, y, z, lx, ly, lz } }, [R.cx, 2.8, R.cz + R.d / 2 - 1, R.cx, 1.2, R.cz - 2]); await sleep(1300); await shot('room_' + a); await f.evaluate(() => { CHARS3D.camOv = null }) }
    await f.evaluate(() => { try { CINE = null; document.body.classList.remove('cbOn') } catch (_) {} });
  }
  // procedural room decor: arcade NEON switch, hallway bulletin boards, apartment lamp
  res.decor = await f.evaluate(() => { const R = ENV3D.rooms, out = { boards: (R.boards || []).length, theme0: R.arcade && R.arcade.theme };
    const t = TAPS.find(t => /NEON switch/.test(t.label)); if (t) t.fn(); out.theme1 = R.arcade && R.arcade.theme; const l = TAPS.find(t => /floor lamp/.test(t.label)); if (l) l.fn(); out.lamp = R.lamp && R.lamp.on; if (l) l.fn(); return out });
  ok(res.decor.boards === 2, 'hallway bulletin boards: ' + res.decor.boards); ok(res.decor.theme1 === (res.decor.theme0 + 1) % 4, 'NEON switch cycles the theme'); ok(res.decor.lamp === true, 'apartment lamp switches on'); ok(await f.evaluate(() => !!(ENV3D.rooms.bleachers && ENV3D.rooms.cubbies)), 'gym bleachers + classroom cubbies built');
  res.desk = await f.evaluate(() => ({ swapped: !!ENV3D.props.deskSwapped, hidden: ENV3D.props.deskHidden })); ok(res.desk.swapped, 'classroom teacher desk replaced by the 3D desk');
  res.err = await f.evaluate(() => ENV3D.props.err); ok(!res.err && !(await f.evaluate(() => ENV3D.props.failed)), 'prop errors: ' + res.err);
  await f.evaluate(() => { if (AREA !== 'street') leaveRoom() });
  console.log('P16', JSON.stringify(res));
};
