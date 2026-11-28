// Headless play-test: title -> hero -> 3D street -> walk -> rooms -> math games (right + wrong) -> screenshots + console errors
const { chromium } = require('playwright');
const fs = require('fs');
const URL = process.env.URL || 'http://localhost:8765/index.html';
const TAG = process.env.TAG || 'r0';
const OUT = process.env.OUT_DIR || require('path').join(__dirname, '..', 'shots', TAG); fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: +(process.env.W || 1100), height: +(process.env.H || 700) }, hasTouch: !!process.env.TOUCH, isMobile: !!process.env.TOUCH });
  const pg = await ctx.newPage();
  const errs = [], fails = [];
  pg.on('console', m => { if (m.type() === 'error') errs.push('[console] ' + m.text() + ' @' + (m.location()&&m.location().url)); });
  pg.on('pageerror', e => errs.push('[pageerror] ' + e.message));
  // a request cut off because the test itself reloaded the page (ERR_ABORTED) is not a broken asset; anything else is
  pg.on('requestfailed', r => { const ft = r.failure() && r.failure().errorText; if (ft === 'net::ERR_ABORTED') return; fails.push(r.url() + ' ' + (ft || '')); });
  pg.on('response', r => { if (r.status() >= 400) fails.push(r.status() + ' ' + r.url()); });
  const t0 = Date.now();
  await pg.goto(URL, { waitUntil: 'load', timeout: 120000 });
  await pg.evaluate(() => localStorage.clear());
  await pg.reload({ waitUntil: 'load' });
  await sleep(800); await pg.screenshot({ path: OUT + '/01_title.png' });
  const dlgs = async () => { for (let i = 0; i < 12; i++) { const b = await pg.$('#dlg.open [data-act=dnext]'); if (!b) break; await b.click().catch(() => {}); await sleep(250); } };
  await pg.click('#btnNew'); await sleep(600); await dlgs();
  await pg.fill('#nm', 'Nova7'); await pg.screenshot({ path: OUT + '/02_create.png' });
  await pg.click('[data-act=startcreate]'); await sleep(1500);
  // dismiss any modal/dialog
  await dlgs(); await sleep(1000); await pg.screenshot({ path: OUT + '/02b_after_create.png' });
  await pg.evaluate(() => { try { closeModal(); } catch (_) {} }); await dlgs(); await sleep(300);
  const fr = () => pg.frame({ url: /street3d\.html/ });
  let f = null; for (let i = 0; i < 120 && !f; i++) { f = fr(); await sleep(250); }
  if (!f) { console.log('NO 3D FRAME'); }
  // wait for models loaded
  for (let i = 0; i < 240; i++) { const ok = await f.evaluate(() => !document.getElementById('load') && window.__dbg && !!window.__dbg.ACT.hero).catch(() => false); if (ok) break; await sleep(500); }
  const loadMs = Date.now() - t0;
  await sleep(1500); await pg.screenshot({ path: OUT + '/03_street.png' });
  const fps = await f.evaluate(() => new Promise(r => { let n = 0; const s = performance.now(); (function k() { n++; if (performance.now() - s > 2000) r(n / 2); else requestAnimationFrame(k) })() }));
  // walk: hold W for a bit
  const fe = await pg.$('#street3d'); await fe.focus().catch(() => {});
  await f.evaluate(() => { window.__dbg.K.w = true; }); await sleep(2500); await f.evaluate(() => { window.__dbg.K.w = false; });
  const pos = await f.evaluate(() => ({ x: __dbg.P.x, z: __dbg.P.z }));
  await pg.screenshot({ path: OUT + '/04_walked.png' });
  await f.evaluate(() => { camPitch = -1.0; camDist = 6; }); await sleep(1500); await pg.screenshot({ path: OUT + '/05_sky.png' });
  await f.evaluate(() => { __dbg.P.x = -20; __dbg.P.z = 3; camYaw = Math.PI * .5 + .5; camPitch = .25; camDist = 14; }); await sleep(1800); await pg.screenshot({ path: OUT + '/06_buildings.png' });
  await f.evaluate(() => { __dbg.P.x = -45; __dbg.P.z = -7; camYaw = 0.6; camPitch = .15; camDist = 7; }); await sleep(1500); await pg.screenshot({ path: OUT + '/07_door.png' });
  await f.evaluate(() => { __dbg.P.x = SPAWN.x; __dbg.P.z = SPAWN.z; camYaw = Math.PI*.12; camPitch=.38; camDist=8.5; });
  const hook = process.env.HOOK ? require(process.env.HOOK) : null;
  const res = { loadMs, fps, pos };
  const play = async (label, setup) => {
    await f.evaluate(setup);
    for (let i = 0; i < 80; i++) { const ph = await f.evaluate(() => QG && QG.phase).catch(() => null); if (ph === 'ask') break; await sleep(250); }
    await pg.screenshot({ path: `${OUT}/${label}_ask.png` });
    const info = await f.evaluate(() => QG ? { q: QG.q.text, ans: QG.q.ans, ch: QG.q.ch, level: QG.q.level, mode: QG.q.mode, kind: QG.q.kind } : null);
    if (!info) { res[label] = 'NO GAME'; return; }
    // wrong first
    await f.evaluate(() => { const w = QG.ans.find(a => a.v !== QG.q.ans); if (w) answer(w); });
    await sleep(600); await pg.screenshot({ path: `${OUT}/${label}_wrong.png` });
    await f.evaluate(() => { const r = QG.ans.find(a => a.v === QG.q.ans); answer(r); });
    await sleep(1800); await pg.screenshot({ path: `${OUT}/${label}_win.png` });
    for (let i = 0; i < 80; i++) { const g = await f.evaluate(() => !!QG); if (!g) break; await sleep(250); }
    res[label] = info;
  };
  // street: Marcia
  await play('g1_marcia', () => { __dbg.P.x = MA.x; __dbg.P.z = MA.z + 1.2; startGame('Ms. Marcia', false, ['coins', 'marbles'], [3, 5]); });
  // rooms
  for (const r of ['school', 'arcade', 'clothing', 'apartment']) {
    await f.evaluate(k => { if (AREA !== 'street') leaveRoom(); enterRoom(k); }, r); await sleep(1500);
    await pg.screenshot({ path: `${OUT}/room_${r}.png` });
  }
  await f.evaluate(() => { leaveRoom(); enterRoom('school'); }); await sleep(500);
  await play('g2_okafor', () => { startGame('Ms. Okafor', true, ['books', 'apples', 'pencils', 'marbles'], [1, 2, 4]); });
  await f.evaluate(() => { leaveRoom(); enterRoom('arcade'); }); await sleep(500);
  await play('g3_arcade', () => { startGame('Theo', true, ['tickets', 'tokens'], 'review'); });
  if (hook) await hook({ pg, f, OUT, res, sleep });
  const parentS = await pg.evaluate(() => ({ xp: S.xp, coins: S.coins, m1: JSON.stringify(S.missions[1] || {}) })).catch(e => String(e));
  res.parent = parentS;
  res.errors = errs; res.failed = [...new Set(fails)];
  fs.writeFileSync(OUT + '/result.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
  const bad = errs.length + res.failed.length + ((res.assert || []).length);
  if (bad) { console.log('PLAYTEST FAIL', JSON.stringify({ errors: errs.length, failed: res.failed.length, assert: res.assert || [] })); process.exitCode = 1 } else console.log('PLAYTEST PASS');
  await b.close();
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
