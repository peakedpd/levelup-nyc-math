// Arcade cabinet math (every machine except Ticket Blaster VR): walk up to each cabinet, press E (desktop) / tap E (phone) ->
// overlay names the CCSS standard -> one 3-question round: a wrong answer shows the reteach hint and allows a retry, then right
// answers with real clicks/taps -> summary pays tickets. Prize Claw: XP wager win (+2x stake), loss (-stake), stakes capped at
// 1/4 of XP (practice only when XP is low), XP never drops below 0.
module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  const touch = await pg.evaluate(() => matchMedia('(pointer:coarse)').matches);
  await f.evaluate(() => { if (QG) try { endGame() } catch (_) {} if (AREA !== 'arcade') { if (AREA !== 'street') leaveRoom(); enterRoom('arcade') } }); await sleep(800);
  for (let i = 0; i < 40 && !(await f.evaluate(() => !!window.CABQ && !!window.CABG)); i++) await sleep(250);
  const STAND = { space: [-6.6, -4.2], racer: [-6.6, -2.35], jump: [-6.6, -.5], rush: [-6.6, 1.4], hoop: [6.6, -3.4], claw: [6.6, -1.35], pins: [5.45, 2.7], foos: [-5.6, 2.3], hockey: [1.2, -2.35] };
  const pressE = async () => { if (touch) await f.tap('#tE').catch(() => f.evaluate(() => document.getElementById('tE').click())); else { await pg.$('#street3d').then(e => e.focus()); await pg.keyboard.press('e') } };
  const click = async sel => { const el = await f.$(sel); if (touch) await el.tap(); else await el.click() };
  const goTo = async id => { await f.evaluate(([id, p]) => { if (QG) try { endGame() } catch (_) {} const c = CABG.SPOT[id]; P.x = AR.cx + p[0]; P.z = AR.cz + p[1]; P.yaw = Math.atan2(AR.cx + c[0] - P.x, AR.cz + c[1] - P.z); camYaw = P.yaw + Math.PI; camPitch = .18; camDist = 3.6; camSnap = true; for (const k in K) K[k] = false }, [id, STAND[id]]); await sleep(300); ok(await until(id => PR.style.display !== 'none' && PR.textContent.includes(CABG.CABS[id].name), id, 6000), id + ': its own E prompt shows (got "' + (await f.evaluate(() => PR.textContent)) + '")') };
  const idxOf = (wrong) => f.evaluate(w => { const it = CABG.st.it; const btns = [...document.querySelectorAll('#cabui [data-i]')]; const i = it.choices.findIndex(v => w ? v !== it.ans : v === it.ans); return btns[i] && !btns[i].disabled ? i : it.choices.findIndex((v, k) => (w ? v !== it.ans : v === it.ans) && !btns[k].disabled) }, wrong);
  const until = async (fn, arg, ms = 10000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await f.evaluate(fn, arg)) return true; await sleep(150) } return false };
  const closeCab = async () => { await click('#cabui [data-x]'); await sleep(250); if (await f.evaluate(() => CABG.st.open)) { await pg.keyboard.press('Escape'); await sleep(250) } };
  res.cab = {};
  for (const id of (process.env.CABS || 'space,racer,jump,rush,hoop,pins,foos,hockey').split(',')) {
    await goTo(id); const lab = await f.evaluate(() => { const e = document.getElementById('hint') || document.getElementById('prompt'); return e ? e.textContent : '' });
    await pressE(); await until(() => CABG.st.open, null, 4000);
    const o = await f.evaluate(() => ({ qg: QG && QG.phase, nd: nearDoor && nearDoor.type, open: CABG.st.open, id: CABG.st.id, std: (document.querySelector('#cabui .chip') || {}).textContent, ui: W2.ui }));
    if (!o.open) console.log('P13 why', id, JSON.stringify(await f.evaluate(id => { let r; try { r = CABG.open(id) } catch (e) { r = 'ERR ' + e.message } return { r, open: CABG.st.open, bl: !!W2.blaster, ui: W2.ui, qg: !!QG } }, id)));
    ok(o.open && o.id === id, `${id}: E opens its math game (got ${JSON.stringify(o)} prompt "${lab}")`); if (!o.open) continue;
    ok(/CCSS 4\./.test(o.std || ''), `${id}: overlay names a grade-4 standard: ${o.std}`);
    if (id === 'space') await shot('p13_cab_open');
    // Q1: wrong first -> hint + retry
    await click(`#cabui [data-i="${await idxOf(true)}"]`); await sleep(250);
    const h = await f.evaluate(() => ({ hint: (document.querySelector('#cabui .hint') || {}).textContent || '', phase: CABG.st.phase }));
    ok(h.hint.length > 25 && h.phase === 'ask', `${id}: wrong answer shows reteach hint and allows retry: ${JSON.stringify(h)}`);
    if (id === 'space') await shot('p13_cab_hint');
    await click(`#cabui [data-i="${await idxOf(false)}"]`);
    for (let q = 1; q < 3; q++) { await until(n => CABG.st.i >= n && CABG.st.phase === 'ask', q); await click(`#cabui [data-i="${await idxOf(false)}"]`) }
    await until(() => CABG.st.phase === 'done' && !!document.querySelector('#cabui [data-again]'));
    const r = await f.evaluate(() => ({ phase: CABG.st.phase, first: CABG.st.first, tix: CABG.st.tix, xp: CABG.st.xp, log: CABG.st.log }));
    ok(r.phase === 'done' && r.first === 2 && r.tix === 7, `${id}: round finished, 2 first-try + 1 retry -> 7 tickets: ${JSON.stringify(r)}`);
    res.cab[id] = { std: o.std, ...r };
    if (id === 'space') await shot('p13_cab_summary');
    await closeCab();
    ok(await f.evaluate(() => !CABG.st.open && !W2.ui), `${id}: closes and gives control back`);
  }
  // Prize Claw wager
  const setXP = v => pg.evaluate(v => { S.xp = v; save() }, v); const getXP = () => pg.evaluate(() => S.xp);
  const claw = async (stake, right) => {
    await goTo('claw'); await pressE(); await until(() => CABG.st.phase === 'stake');
    if (!(await f.evaluate(() => CABG.st.phase === 'stake'))) console.log('P13 claw-dbg', JSON.stringify(A), JSON.stringify(await f.evaluate(() => ({ st: CABG.st.phase, open: CABG.st.open, id: CABG.st.id, ui: W2.ui, pr: PR.textContent, P: [P.x - AR.cx, P.z - AR.cz], foc: document.hasFocus(), nd: nearDoor && nearDoor.type, ae: document.activeElement && document.activeElement.tagName }))), await pg.evaluate(() => document.activeElement && document.activeElement.id));
    const dis = await f.evaluate(() => [...document.querySelectorAll('#cabui [data-stake]')].map(b => b.dataset.stake + ':' + (b.disabled ? 0 : 1)).join(' '));
    if (stake !== null) { await click(`#cabui [data-stake="${stake}"]`); await sleep(200); await click(`#cabui [data-i="${await idxOf(!right)}"]`); await until(() => CABG.st.phase === 'done' && !!document.querySelector('#cabui [data-again]')); await sleep(200) }
    return dis };
  await setXP(100); let d = await claw(25, true); await shot('p13_claw_win'); let x = await getXP();
  const z3 = await f.evaluate(() => ({ prizes: CABG.PZ.length, kinds: [...new Set(CABG.PZ.map(m => m.userData.name))].length, hidden: CABG.PZ.filter(m => !m.visible).length, mini: document.getElementById('cabui').classList.contains('mini') })); ok(z3.prizes >= 5 && z3.kinds === 5 && z3.hidden === 1 && z3.mini, 'claw: real 3D prizes (5 kinds), one went down the chute, small panel: ' + JSON.stringify(z3));
  ok(/5:1 10:1 25:1 0:1/.test(d), 'claw: at 100 XP all stakes open: ' + d); ok(x === 150, 'claw win at stake 25: 100 -> 150 XP, got ' + x);
  await closeCab();
  d = await claw(25, false); x = await getXP(); const hint = await f.evaluate(() => (document.querySelector('#cabui .hint') || {}).textContent || ''); await shot('p13_claw_loss');
  ok(x === 125, 'claw loss at stake 25: 150 -> 125 XP, got ' + x); ok(hint.length > 25, 'claw loss shows a reteach hint');
  await closeCab();
  await setXP(12); d = await claw(null); await shot('p13_claw_lowxp');
  ok(/5:0 10:0 25:0 0:1/.test(d), 'claw: at 12 XP only practice allowed: ' + d);
  // forcing a stake past the cap is treated as practice; a practice miss costs nothing and XP stays >= 0
  await click('#cabui [data-stake="0"]'); await sleep(200); await click(`#cabui [data-i="${await idxOf(true)}"]`); await until(() => CABG.st.phase === 'done' && !!document.querySelector('#cabui [data-again]')); await sleep(200);
  x = await getXP(); ok(x === 12, 'practice miss costs no XP: ' + x);
  const s = await f.evaluate(() => [CABQ.settle(3, 25, false).after, CABQ.settle(0, 5, false).after]); ok(s[0] >= 0 && s[1] >= 0, 'settle never below 0: ' + s);
  await closeCab();
  res.claw = { xpEnd: x }; console.log('P13', JSON.stringify(res.cab), JSON.stringify(res.claw));
  ok(await f.evaluate(() => !W2.ui), 'controls restored after claw');
};
