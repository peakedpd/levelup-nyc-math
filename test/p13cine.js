// Cinematic conversations: talking to / being challenged by every kind of person opens a letterbox scene whose camera
// frames the speaker's face (head projected near screen centre, in front of the camera, not inside a wall, not blocked by
// the student's own head), subtitles always, the character's own pre-recorded voice, tap/E advances, settings persist.
module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const touch = !!process.env.TOUCH; const vp = pg.viewportSize();
  const voiceRes = []; pg.on('response', r => { if (/\/voice\/.+\.mp3/.test(r.url())) voiceRes.push(r.status()) });
  await f.evaluate(() => { window.__cineTest = true; localStorage.removeItem('lu3d_cine'); Object.assign(CINEMA.settings, { voice: 1, motion: 1 }); CINEMA.paintST(); CINEMA.hold = true; if (QG) { S.remove(QG.g); QG = null; hideCard() } });
  const fe = await pg.$('#street3d'); await fe.focus().catch(() => {});
  const probe = () => f.evaluate(() => { const c = CINEMA.cur; if (!c) return { active: false }; const n = CINEMA.NPC[c.npc], h = n.head(), v = h.clone().project(cam), dir = new T.Vector3(); cam.getWorldDirection(dir);
    const hh = CINEMA.heroHead(), hp = hh.clone().project(cam), dH = cam.position.distanceTo(h), dP = cam.position.distanceTo(hh);
    const top = document.getElementById('cnT').getBoundingClientRect(), bot = document.getElementById('cnB').getBoundingClientRect(), p = cam.position;
    return { active: true, npc: c.npc, kind: c.kind, shot: c.shot, i: c.i, sx: +v.x.toFixed(3), sy: +v.y.toFixed(3), front: dir.dot(h.clone().sub(p)) > 0 && v.z < 1, dist: +dH.toFixed(2),
      heroBlocks: (() => { const d = h.clone().sub(p), t = Math.max(0, Math.min(1, hh.clone().sub(p).dot(d) / d.lengthSq())); return p.clone().addScaledVector(d, t).distanceTo(hh) < .35 })(), barTop: Math.round(top.bottom), barBot: Math.round(innerHeight - bot.top),
      who: document.getElementById('cnW').textContent, qg: QG && QG.phase, qcHidden: getComputedStyle(QC).visibility === 'hidden', sub: document.getElementById('cnS').textContent, voice: CINEMA.lastVoice,
      inSolid: SOL.some(b => b.top > .5 && p.x > b.x0 && p.x < b.x1 && p.z > b.z0 && p.z < b.z1 && p.y > (b.y0 || 0) && p.y < b.top) } });
  const advance = async () => { for (let i = 0; i < 8 && await f.evaluate(() => CINEMA.active); i++) { if (touch) await pg.touchscreen.tap(vp.width / 2, vp.height / 2); else await pg.keyboard.press(i % 2 ? ' ' : 'e'); await sleep(450) } return !(await f.evaluate(() => CINEMA.active)) };
  const scene = async (label, start, arg, extra) => {
    await f.evaluate(start, arg); await f.waitForFunction(() => CINEMA.active && document.getElementById('cnS').textContent.length > 4, null, { timeout: 8000 }).catch(() => {});
    // wait for the letterbox to finish sliding in and the camera to arrive (slow CI machines render only a few frames a second)
    await f.waitForFunction(() => { const c = CINEMA.cur; if (!c) return true; const tr = document.getElementById('cnT').style.transform; const h = CINEMA.NPC[c.npc].head(); return /translateY\((-?0(\.0+)?|-?0?\.\d+)%\)/.test(tr) && cam.position.distanceTo(h) < 4.5 && (c.frames >= 3 || !CINEMA.NPC[c.npc]) && document.getElementById('cnS').textContent.length > 4 }, null, { timeout: 15000 }).catch(() => {}); await sleep(300);
    const s = await probe(); await shot('cine_' + label); res['cine_' + label] = s; console.log('P13', label, JSON.stringify(s));
    ok(s.active, label + ': scene opened'); if (!s.active) return s;
    ok(s.barTop >= 40 && s.barBot >= 60, label + ': letterbox bars ' + s.barTop + '/' + s.barBot);
    ok(s.sub.length > 4 && s.who.length > 1, label + ': subtitle shown: ' + s.who + ' ' + s.sub);
    ok(s.front && Math.abs(s.sx) < .45 && Math.abs(s.sy) < .6, label + ': camera faces the speaker (head at ' + s.sx + ',' + s.sy + ')');
    ok(!s.inSolid, label + ': camera not inside geometry'); ok(!s.heroBlocks, label + ': student head does not block the face');
    ok(s.dist > .5 && s.dist < 4.5, label + ': close-up distance ' + s.dist);
    if (extra) await extra(s);
    ok(await advance(), label + ': tap/E/Space advances to the end'); await sleep(300); return s };
  // 1 Theo (street talk)
  await f.evaluate(() => { if (AREA !== 'street') leaveRoom() }); await sleep(700);
  await scene('theo', () => { const free = (x, z) => !SOL.some(b => b.top > .5 && x > b.x0 - 2.2 && x < b.x1 + 2.2 && z > b.z0 - 2.2 && z < b.z1 + 2.2); let x = -44, z = -3; for (const zz of [-3, -4, -2.5, -5]) { let hit = false; for (let xx = -44; xx < 44; xx += .5) if (free(xx, zz) && free(xx + 1, zz + .6)) { x = xx; z = zz; hit = true; break } if (hit) break }
    P.x = x; P.z = z; P.yaw = 0; TH.x = x + .9; TH.z = z + .7; talkTo('Theo', TH.x, 2.4, TH.z) });
  await f.evaluate(() => { CINEMA.hold = true });
  // 2 Ms. Marcia: math challenge start (question waits behind the scene), then the win hand-off scene
  const ms = await scene('marcia_start', () => { P.x = MA.x; P.z = MA.z + 1.3; startGame('Ms. Marcia', false, ['coins', 'marbles'], [3, 5]) }, null, async s => { ok(s.qg === 'intro' && s.qcHidden, 'question waits behind the scene: ' + s.qg + ' ' + s.qcHidden) });
  for (let i = 0; i < 60; i++) { if (await f.evaluate(() => QG && QG.phase === 'ask')) break; await sleep(250) }
  res.marciaAsk = await f.evaluate(() => QG && QG.phase === 'ask' && getComputedStyle(QC).visibility !== 'hidden' && QC.style.display === 'block'); ok(res.marciaAsk, 'Marcia question appears after the scene');
  await f.evaluate(() => { const r = QG.ans.find(a => a.v === QG.q.ans); answer(r) });
  for (let i = 0; i < 40; i++) { if (await f.evaluate(() => CINEMA.active && CINEMA.cur.kind === 'win')) break; await sleep(150) } await sleep(300);
  res.marciaWin = await f.evaluate(() => ({ on: CINEMA.active && CINEMA.cur.kind, sub: document.getElementById('cnS').textContent, bar: document.body.classList.contains('cnOn') }));
  await shot('cine_marcia_win'); ok(res.marciaWin.on === 'win' && /XP/.test(res.marciaWin.sub), 'win hand-off is a scene: ' + JSON.stringify(res.marciaWin));
  for (let i = 0; i < 40; i++) { if (await f.evaluate(() => !QG && !CINEMA.active)) break; await sleep(250) }
  // 3 Ms. Okafor in class, standing very close (used to put the camera on the back of the student's head)
  await f.evaluate(() => { goRoom('school', 'door') }); await sleep(1500);
  await scene('okafor_close', () => { P.x = TCH.x + .25; P.z = TCH.z + .75; P.yaw = Math.PI; talkTo('Ms. Okafor', TCH.x, 2.5, TCH.z) });
  // 4 Arcade Worker: Prize Corner opens after the scene
  await f.evaluate(() => { leaveRoom(); enterRoom('arcade') }); await sleep(1500);
  await scene('worker', () => { P.x = WK.x + 1.2; P.z = WK.z - 1.6; W2._pzCine = 0; openPrizes() });
  await sleep(400); res.prizesOpen = await f.evaluate(() => !!W2.ui); ok(res.prizesOpen, 'Prize Corner opens after the worker scene'); await f.evaluate(() => { try { closePrizes() } catch (_) {} });
  // 5 Mr. Sal (clothing): also flips the settings (voice off, reduced motion) and checks they persist
  await f.evaluate(() => { leaveRoom(); enterRoom('clothing') }); await sleep(1500);
  await scene('sal', () => { P.x = SAL.x + .4; P.z = SAL.z + 2.1; talkTo('Mr. Sal', SAL.x, 2.6, SAL.z) }, null, async () => {
    await f.evaluate(() => { document.getElementById('cnVoice').click(); document.getElementById('cnMotion').click() });
    res.settings = await f.evaluate(() => ({ st: JSON.parse(localStorage.getItem('lu3d_cine') || '{}'), lbl: document.getElementById('cnVoice').textContent, rm: document.body.classList.contains('cnRM') }));
    ok(res.settings.st.voice === 0 && res.settings.st.motion === 0 && /off/.test(res.settings.lbl) && res.settings.rm, 'voice/motion settings persist: ' + JSON.stringify(res.settings));
    await f.evaluate(() => { document.getElementById('cnVoice').click(); document.getElementById('cnMotion').click() }) });
  // 6 Brock: face-off before the challenge (confront angle), hero reaction beat first
  await f.evaluate(() => { leaveRoom() }); await sleep(900);
  await scene('brock', () => { brockSet({ on: true, done: false, sk: 'groups', title: 'Brock the Group-Grabber', say: '"3 times as many as 8? That\'s 3 + 8 = 11. Times, plus, same thing!"' }); P.x = BRK.x + 1.6; P.z = BRK.z + 1.4; TH.x = P.x + 6; brockGo() }, null, async s => { ok(s.kind === 'confront', 'Brock scene is a confrontation') });
  await f.evaluate(() => { brockSet({ on: false }); for (const k in __dbg.K) __dbg.K[k] = false });
  // voices: the pre-recorded files load and play
  res.voiceFiles = voiceRes; ok(voiceRes.length >= 3 && voiceRes.every(s => s === 200 || s === 206), 'character voice files load: ' + JSON.stringify(voiceRes));
  res.cineLog = await f.evaluate(() => CINEMA.log.map(l => l.npc + ':' + l.kind)); ok(new Set(res.cineLog.map(x => x.split(':')[0])).size >= 5, 'scenes for 5+ people: ' + res.cineLog);
  // the avatar still walks afterwards
  const p0 = await f.evaluate(() => ({ x: P.x, z: P.z })); await f.evaluate(() => { P.x = -30; P.z = 3; K.w = true }); await sleep(2500); await f.evaluate(() => { K.w = false });
  const p1 = await f.evaluate(() => ({ x: P.x, z: P.z })); ok(Math.hypot(p1.x + 30, p1.z - 3) > .15, 'avatar walks after scenes ' + JSON.stringify(p1));
  console.log('P13 asserts', JSON.stringify(A));
};
