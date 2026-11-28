// Ticket Blaster VR (arcade pod, CCSS 4.NF.A.1): walk up, E -> sit -> goggles on -> start screen names the standard ->
// blast one wrong + three right targets with real mouse clicks / taps -> combo resets on a miss, reteach hint shows ->
// round ends -> tickets paid by accuracy into the arcade ticket counter -> take goggles off -> standing next to the pod, can walk.
module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  const touch = await pg.evaluate(() => matchMedia('(pointer:coarse)').matches);
  await f.evaluate(() => { if (QG) try { endGame() } catch (_) {} if (AREA !== 'arcade') { if (AREA !== 'street') leaveRoom(); enterRoom('arcade') } }); await sleep(800);
  // stand in front of the pod and look at it
  await f.evaluate(() => { const F = TBPOD.FRONT, C = TBPOD.PC; P.x = F.x + TBPOD.dir.x * .3; P.z = F.z + TBPOD.dir.z * .3; P.yaw = Math.atan2(C.x - P.x, C.z - P.z); camYaw = P.yaw + Math.PI + .35; camPitch = .22; camDist = 4.6; camSnap = true; TH.x = P.x - 3; TH.z = P.z - 2 });
  await sleep(1500); await shot('p12_pod_exterior');
  res.pod = await f.evaluate(() => ({ removed: TBPOD.removed, kids: TBPOD.g.children.length, label: (interactions().find(d => d.type === 'vrpod') || {}).label, near: nearDoor && nearDoor.type }));
  console.log('P12 pod', JSON.stringify(res.pod)); ok(res.pod.removed === 3 && res.pod.kids > 20 && /TICKET BLASTER VR/.test(res.pod.label || ''), 'old box replaced by the VR pod with an E prompt: ' + JSON.stringify(res.pod));
  // E (keyboard on desktop, the E button on phones)
  if (touch) await f.tap('#tE').catch(() => f.evaluate(() => tryDoor())); else { await pg.$('#street3d').then(e => e.focus()); await pg.keyboard.press('e') }
  await f.waitForFunction(() => !!document.getElementById('vrvisor') && parseFloat(document.getElementById('vrvisor').style.top) > -45, null, { timeout: 8000 }).catch(() => {}); await shot('p12_goggles_on');
  res.goggles = await f.evaluate(() => ({ phase: TBVRG.phase, hs: TBPOD.headset.scale.x }));
  await f.waitForFunction(() => !!document.querySelector('#vrstart'), null, { timeout: 8000 }).catch(() => {}); await sleep(600); await shot('p12_start_screen');
  res.start = await f.evaluate(() => ({ phase: TBVRG.phase, std: (document.querySelector('#vrstart [data-std]') || {}).textContent, vis: getComputedStyle(document.getElementById('vrcanvas')).display }));
  console.log('P12 start', JSON.stringify(res.start)); ok(res.start.phase === 'vr' && /4\.NF\.A\.1/.test(res.start.std || '') && res.start.vis === 'block', 'sit + goggles leads to the VR start screen naming 4.NF.A.1: ' + JSON.stringify(res.start));
  const tix0 = await f.evaluate(() => TIX.n);
  await f.click('[data-vr=go]', { force: true }); await f.waitForFunction(() => TBVRG.targets().length === 4, null, { timeout: 6000 }).catch(() => {}); await sleep(1200);
  const box = await (await pg.$('#street3d')).boundingBox();
  const blast = async want => { const ts = await f.evaluate(() => TBVRG.targets()); const t = ts.find(x => x.ok === want && x.front); if (!t) return false; const X = box.x + t.x, Y = box.y + t.y; if (touch) await pg.touchscreen.tap(X, Y); else await pg.mouse.click(X, Y); return true };
  await shot('p12_in_game');
  // one wrong target first
  await blast(false); await sleep(400);
  res.wrong = await f.evaluate(() => ({ combo: TBVRG.state.combo, att: TBVRG.state.attempts, msg: document.querySelector('#vrmsg').style.display === 'block' ? document.querySelector('#vrmsg').textContent : '' }));
  await shot('p12_wrong_hint'); console.log('P12 wrong', JSON.stringify(res.wrong)); ok(res.wrong.att === 1 && res.wrong.combo === 0 && /Not quite/.test(res.wrong.msg), 'wrong hit resets combo and shows a reteach hint: ' + JSON.stringify(res.wrong));
  for (let i = 0; i < 3; i++) { const qn = await f.evaluate(() => TBVRG.state.qn); for (let k = 0; k < 6 && !(await blast(true)); k++) await sleep(300); await f.waitForFunction(n => TBVRG.state.qn > n && TBVRG.targets().length >= 3, qn, { timeout: 5000 }).catch(() => {}); await sleep(500); if (i === 1) await shot('p12_in_game_combo') }
  res.play = await f.evaluate(() => { const s = TBVRG.state; return { correct: s.correct, combo: s.combo, score: s.score, att: s.attempts } });
  console.log('P12 play', JSON.stringify(res.play)); ok(res.play.correct >= 3 && res.play.combo >= 2, 'three right blasts land and build a combo: ' + JSON.stringify(res.play));
  await f.evaluate(() => TBVRG.timeLeft(.5)); await f.waitForFunction(() => !!document.querySelector('#vrres'), null, { timeout: 6000 }).catch(() => {}); await sleep(1800); await shot('p12_results');
  res.results = await f.evaluate(t0 => ({ tickets: TBVRG.state.tickets, tix: TIX.n, gained: TIX.n - t0, text: (document.querySelector('#vrres') || {}).innerText }), tix0);
  console.log('P12 results', JSON.stringify(Object.assign({}, res.results, { text: (res.results.text || '').slice(0, 120) }))); ok(res.results.tickets > 0 && res.results.gained === res.results.tickets && /ROUND COMPLETE/.test(res.results.text || ''), 'results pay tickets into the arcade counter: ' + JSON.stringify(res.results));
  await f.click('#vrres [data-vr=exit]', { force: true }); await f.waitForFunction(() => TBVRG.phase === null && !W2.blaster, null, { timeout: 6000 }).catch(() => {}); await sleep(800); await shot('p12_exit_standing');
  res.exit = await f.evaluate(() => ({ phase: TBVRG.phase, blaster: !!W2.blaster, d: Math.hypot(P.x - TBPOD.FRONT.x, P.z - TBPOD.FRONT.z), canvas: getComputedStyle(document.getElementById('vrcanvas')).display, x: P.x, z: P.z }));
  ok(!res.exit.blaster && res.exit.d < .5 && res.exit.canvas === 'none', 'goggles off: standing next to the pod: ' + JSON.stringify(res.exit));
  res.fpsAfter = await f.evaluate(() => new Promise(r => { let n = 0; const s = performance.now(); (function k() { n++; if (performance.now() - s > 1500) r(n / 1.5); else requestAnimationFrame(k) })() })); console.log('P12 fps after exit', res.fpsAfter, 'before', res.fps);
  // can move again (real keys on desktop, joystick flag on phones)
  if (touch) { await f.evaluate(() => { JOY.z = -1 }); await sleep(3000); await f.evaluate(() => { JOY.z = 0 }) } else { await pg.$('#street3d').then(e => e.focus()); await pg.keyboard.down('w'); await sleep(3000); await pg.keyboard.up('w') }
  res.moved = await f.evaluate(p => Math.hypot(P.x - p.x, P.z - p.z), res.exit); console.log('P12 exit', JSON.stringify(res.exit), 'moved', res.moved); ok(res.moved > .8, 'player can walk after leaving the pod: moved ' + res.moved);
  res.mastery = await pg.evaluate(() => S.learn && S.learn.m && S.learn.m.fractions ? S.learn.m.fractions.n || 0 : null); console.log('P12 mastery fractions answers', res.mastery);
  ok(res.mastery === null || res.mastery >= 3, 'round results recorded to the fractions skill: ' + res.mastery);
};
