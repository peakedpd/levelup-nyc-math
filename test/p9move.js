// Avatar movement e2e with REAL keyboard/mouse input (not K flags): after load, after popups close (Today, daily challenge
// greeting, a challenge quit), next to Theo and Brock at the school steps, WASD + arrows; and no 2D map anywhere.
module.exports = async ({ pg, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  const f = pg.frame({ url: /street3d\.html/ }); res.mv = {};
  const pos = () => f.evaluate(() => ({ x: P.x, z: P.z }));
  const walk = async (label, key = 'w', ms = 900) => { const a = await pos(); await pg.keyboard.down(key); await sleep(ms); await pg.keyboard.up(key); await sleep(250); const b = await pos(); const d = Math.hypot(b.x - a.x, b.z - a.z);
    res.mv[label] = { d: +d.toFixed(2), a, b, focus: await pg.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName)), held: await f.evaluate(() => Object.keys(K).filter(k => K[k])) }; ok(d > .3, `avatar moves (${label}): ` + JSON.stringify(res.mv[label])); return d };
  const spawn = () => f.evaluate(() => { if (AREA !== 'street') leaveRoom(); P.x = SPAWN.x; P.z = SPAWN.z; P.vy = 0; P.yaw = 0; camYaw = Math.PI; camPitch = .3; camDist = 6; camSnap = true });
  await spawn(); await sleep(600);
  // 1) fresh: focus in the parent page (as after the title screen / a HUD click) — keys must still reach the 3D street
  await pg.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); document.body.focus() });
  await walk('parent focus W'); await spawn(); await walk('parent focus ArrowUp', 'ArrowUp');
  // 2) Today popup via HUD click, closed with its button
  await spawn(); await pg.click('#hud [data-act=today]').catch(() => pg.evaluate(() => document.querySelector('#hud [data-act=today]').click())); await sleep(500); await shot('p9_today');
  await pg.evaluate(() => { const b = document.querySelector('#modal.open [data-act=closem]'); b ? b.click() : closeModal() }); await sleep(400); await walk('after Today popup');
  // 3) daily challenge greeting (student with a placement) closed with "Not now"
  await pg.evaluate(() => { const l = S.learn || (LUI.openPath(), closeModal(), S.learn); l.diag = l.diag || { d: '2026-11-01', t: Date.now(), sess: 0, scale: 455, place: {}, gaps: [], flagged: [] }; l.history = l.history && l.history.length ? l.history : [l.diag]; l.base = l.base || {};
    for (const k in l.m) { if (!l.base[k]) { const lv = k === 'groups' ? 1 : 4; Object.assign(l.m[k], { lv, taught: 6 }); l.base[k] = lv } } delete l.ch; save(); window.__chGreetTest = true; S.chGreet = null; hud() }); await sleep(2600);
  res.greet = await pg.evaluate(() => !!document.querySelector('#modal.open #chToday')); await pg.evaluate(() => { const b = [...document.querySelectorAll('#modal.open [data-act=closem]')].pop(); b ? b.click() : closeModal(); window.__chGreetTest = false }); await sleep(400);
  await spawn(); await walk('after challenge greeting', 'd');
  // 4) at the school steps next to Theo (his review prompt showing): every direction works, arrows too
  await spawn(); await f.evaluate(() => { TH.x = P.x + 1.1; TH.z = P.z + .4; IDLE = 3 }); await sleep(500); await shot('p9_theo_steps');
  for (const k of ['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown']) { await spawn(); await f.evaluate(() => { TH.x = P.x + 1.1; TH.z = P.z + .4 }); await walk('next to Theo ' + k, k, 700) }
  // arrows left/right turn the camera (they don't walk)
  await spawn(); { const y0 = await f.evaluate(() => camYaw); await pg.keyboard.down('ArrowLeft'); await sleep(600); await pg.keyboard.up('ArrowLeft'); const y1 = await f.evaluate(() => camYaw); ok(Math.abs(y1 - y0) > .1, 'ArrowLeft turns the camera') }
  // 5) next to Brock: walk-up starts the battle once; quit it; the avatar must walk away (not re-trapped)
  await f.evaluate(() => { P.x = BRK.x + 3; P.z = BRK.z; P.yaw = -Math.PI / 2; camYaw = P.yaw + Math.PI; camSnap = true }); await sleep(400);
  await pg.keyboard.down('w'); for (let i = 0; i < 25 && !(await pg.evaluate(() => !!CHALLENGEUI.battle)); i++) await sleep(200); await pg.keyboard.up('w');
  res.brockStart = await pg.evaluate(() => !!(CHALLENGEUI.battle && document.querySelector('#modal.open'))); ok(res.brockStart, 'walk-up to Brock starts the battle');
  await pg.evaluate(() => { const q = document.querySelector('#modal.open [data-x=quit]'); q ? q.click() : 0 }); await sleep(500); await pg.evaluate(() => closeModal()); await sleep(400);
  await walk('after quitting Brock (walk away)', 's', 1200); await sleep(1500); res.reTrig = await pg.evaluate(() => !!document.querySelector('#modal.open')); ok(!res.reTrig, 'walk-up does not re-trigger while leaving');
  // 6) mouse: click the street (pointer lock request) then walk
  await spawn(); await pg.mouse.click(550, 400); await sleep(300); await walk('after clicking the street');
  await pg.keyboard.press('Escape'); await sleep(200);
  // 7) the old trap: standing exactly where the avatar used to spawn (inside Ms. Okafor's collider) must not freeze it
  await f.evaluate(() => { P.x = -52; P.z = -6.5; P.yaw = 0; camYaw = Math.PI; camSnap = true }); await sleep(300); await walk('from the old spawn spot (Ms. Okafor)', 'd');
  // 8) Go to… and Take me there jump the avatar on the 3D street, and it can walk from there
  for (const id of ['arcade', 'shop', 'apt', 'school', 'square']) { await pg.evaluate(id => ACT.goto2({ id }), id); await sleep(500);
    const g = await f.evaluate(id => { const kind = { school: 'school', arcade: 'arcade', shop: 'clothing', apt: 'apartment' }[id]; const t = id === 'square' ? MA : DOORS.filter(d => d.kind === kind).reduce((a, b) => Math.hypot(a.x - P.x, a.z - P.z) < Math.hypot(b.x - P.x, b.z - P.z) ? a : b); return { area: AREA, d: +Math.hypot(t.x - P.x, t.z - P.z).toFixed(2) } }, id);
    res['goto_' + id] = g; ok(g.area === 'street' && g.d < 3.5, 'Go to ' + id + ' lands next to it in 3D: ' + JSON.stringify(g)); }
  await walk('after Go to', 's'); await shot('p9_goto_square');
  // 9) no 2D map anywhere

  res.no2d = await pg.evaluate(() => ({ toggle: !!document.querySelector('#mapToggle'), canvas: !!document.querySelector('#map'), txt: /2D map/.test(document.body.innerText), flat: document.getElementById('mapwrap').classList.contains('flat'), map2dHidden: getComputedStyle(document.querySelector('#map')).display === 'none', drawer: [...document.querySelectorAll('button')].some(b => /2D/.test(b.textContent)) }));
  ok(!res.no2d.toggle && !res.no2d.txt && !res.no2d.flat && res.no2d.map2dHidden, 'no 2D map option: ' + JSON.stringify(res.no2d)); await spawn(); await sleep(500); await shot('p9_street');
  ok(!res.no2d.drawer, 'no 2D button in any menu');
  // 10) no WebGL: a friendly message, never a 2D map
  const pg2 = await pg.context().newPage(); const base = pg.url().replace(/[^/]*$/, '');
  await pg2.goto(base + 'street3d.html?nogl=1'); await sleep(1500); res.nogl3d = await pg2.evaluate(() => document.body.innerText); ok(/needs WebGL/.test(res.nogl3d), 'street shows the no-WebGL message'); await pg2.close(); await pg.bringToFront(); await sleep(500);
  await pg.evaluate(() => postMessage({ lv3d: 'nogl' }, '*')); await sleep(400); res.noglParent = await pg.evaluate(() => { const n = document.getElementById('nogl'); return !n.hidden && n.innerText }); ok(/hardware acceleration/.test(res.noglParent || ''), 'game page shows a friendly no-WebGL card: ' + res.noglParent);
  await shot('p9_nogl');
  await pg.evaluate(() => { const n = document.getElementById('nogl'); n.hidden = true; document.getElementById('street3d').style.display = '' });
};
