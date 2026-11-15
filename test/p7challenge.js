// Weakness Challenge e2e: "Your Challenge today" leads home + My Path -> reteach -> guided x2 -> boss battle vs Brock
// (hits drain confidence, a wrong answer gives a reteach, not a penalty) -> victory + badge -> Memory Check rematch 3 days later
// -> teacher-assigned challenge from the Reteach Plan -> gap-closing table in Teacher Hub.
module.exports = async ({ pg, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  const pickRight = () => pg.evaluate(() => { const b = [...document.querySelectorAll('#luItem [data-v]')].find(b => b.dataset.v === window.__luLastAns); if (b) b.click(); return !!b });
  const pickWrong = () => pg.evaluate(() => { const b = [...document.querySelectorAll('#luItem [data-v]')].find(b => b.dataset.v !== window.__luLastAns); b.click(); setTimeout(() => [...document.querySelectorAll('#luItem [data-v]')].find(b => b.dataset.v === window.__luLastAns).click(), 600) });
  await pg.evaluate(() => { closeModal(); S.learn = null; LUI.openPath(); closeModal(); const l = S.learn; l.diag = { d: '2026-11-01', t: Date.now(), sess: 0, scale: 455, place: {}, gaps: [], flagged: [] }; l.history = [l.diag]; l.base = {};
    for (const k in l.m) { const lv = k === 'groups' ? 1 : k === 'mult' ? 1 : 4; Object.assign(l.m[k], { lv, taught: 6 }); l.base[k] = lv } delete l.ch; save(); hud() });
  await sleep(500);
  // home screen leads with the challenge
  res.home = await pg.evaluate(() => { const a = document.getElementById('acts'); const c = a && a.querySelector('#chToday'); return c ? { first: a.firstElementChild === c || a.firstElementChild.tagName === 'STYLE' && a.children[1] === c, text: c.innerText, after: !!a.querySelector('.ch-after') } : null });
  ok(res.home && res.home.first && /Your Challenge today/.test(res.home.text) && /Group-Grabber/.test(res.home.text) && res.home.after, 'home leads with challenge: ' + JSON.stringify(res.home));
  // the 3D street HUD: Challenge button, and once a day the challenge greets the student before free play
  await pg.evaluate(() => { window.__chGreetTest = true; S.chGreet = null; hud() }); await sleep(2600);
  res.greet = await pg.evaluate(() => ({ btn: !!document.querySelector('#hud #chHud.ch-pulse'), modal: document.querySelector('#modal.open #chToday') && document.querySelector('#modal').innerText.slice(0, 900) }));
  ok(res.greet.btn && /Your Challenge today/.test(res.greet.modal || '') && /Not now/.test(res.greet.modal || ''), 'home greets with the challenge: ' + JSON.stringify(res.greet)); await shot('p7_home');
  await pg.evaluate(() => { window.__chGreetTest = false; closeModal() });
  // My Path leads with it too (opened the way students open it: the HUD button)
  await pg.evaluate(() => document.querySelector('#hud [data-act=mypath]').click()); await sleep(500);
  res.path = await pg.evaluate(() => { const p = document.querySelector('#modal .panel'); const c = p.querySelector('#chToday'); const kids = [...p.children].filter(x => x.tagName !== 'STYLE'); return { has: !!c, firstAfterHead: kids[1] === c, others: !!p.querySelector('#dpChallenges') } });
  ok(res.path.has && res.path.firstAfterHead && res.path.others, 'My Path leads with challenge, other games still there: ' + JSON.stringify(res.path)); await shot('p7_path');
  // battle
  await pg.evaluate(() => document.querySelector('#chToday [data-ch=go]').click()); await sleep(500);
  res.reteach = await pg.evaluate(() => ({ trick: (document.querySelector('#chTrick') || {}).innerText, lesson: (document.querySelector('#chLesson') || {}).innerText }));
  ok(/3 times as many|times/.test(res.reteach.trick || '') && /Tape diagram|tape diagram/.test(res.reteach.lesson || ''), 'reteach stage with matching trick + lesson: ' + JSON.stringify(res.reteach)); await shot('p7_reteach');
  await pg.evaluate(() => document.querySelector('[data-x=next]').click()); await sleep(500);
  ok(await pg.evaluate(() => /Guided try 1\/2/.test(document.querySelector('#modal').innerText) && !!document.querySelector('#luItem [data-x=hint]')), 'guided try with hints');
  for (let g = 0; g < 2; g++) { await pickRight(); await sleep(1600) }
  res.boss0 = await pg.evaluate(() => ({ stage: CHALLENGEUI.battle && CHALLENGEUI.battle.stage, conf: document.querySelector('#chConf') && document.querySelector('#chConf').style.width, hint: !!document.querySelector('#luItem [data-x=hint]') }));
  ok(res.boss0.stage === 'boss' && res.boss0.conf === '100%' && !res.boss0.hint, 'boss battle, full confidence, no hints: ' + JSON.stringify(res.boss0)); await shot('p7_boss');
  await pickRight(); await pg.waitForFunction(() => document.querySelector('#chConf') && document.querySelector('#chConf').style.width === '80%', null, { timeout: 5000 }).catch(() => {}); await sleep(150); res.hit = await pg.evaluate(() => ({ txt: document.querySelector('#chHit').innerText, img: document.querySelector('#chBrock').src, conf: document.querySelector('#chConf').style.width, hits: (document.querySelector('#chHits') || {}).textContent })); await shot('p7_hit'); await sleep(2200);
  ok(/brock_hit/.test(res.hit.img) && res.hit.conf === '80%' && res.hit.hits === '1/5 hits' && res.hit.txt.length > 3, 'hit drains confidence: ' + JSON.stringify(res.hit));
  await pickWrong(); await sleep(2800); res.re = await pg.evaluate(() => document.querySelector('#chReteach') && document.querySelector('#chReteach').innerText); ok(/no penalty|trick Brock wanted/i.test(await pg.evaluate(() => document.querySelector('#modal').innerText)) && res.re, 'wrong answer -> coach reteach'); await shot('p7_reteach_wrong');
  await pg.evaluate(() => document.querySelector('[data-x=go]').click()); await sleep(500);
  for (let i = 0; i < 8 && !(await pg.evaluate(() => !!window.__chDone)); i++) { await pickRight(); await sleep(2600) }
  res.done = await pg.evaluate(() => ({ out: window.__chDone && { result: window.__chDone.result, coins: window.__chDone.coins, badges: window.__chDone.badges.map(b => b.id), memAt: window.__chDone.rec.memAt - Date.now(), maxLv: window.__chDone.rec.maxLv, startLv: window.__chDone.rec.startLv }, brock: (document.querySelector('#chEndBrock') || {}).innerText, ev: S.learn.m.groups.ev.filter(e => e.src === 'challenge').length }));
  ok(res.done.out && res.done.out.result === 'defeated' && res.done.out.coins > 0 && res.done.out.badges.includes('first'), 'victory + reward + badge: ' + JSON.stringify(res.done));
  ok(res.done.out.memAt > 2.9 * 864e5 && res.done.out.memAt < 3.1 * 864e5, 'Memory Check in 3 days'); ok(/friend|show me|teach me|cool/i.test(res.done.brock || ''), 'Brock redeemed'); ok(res.done.ev >= 7, 'battle answers count as mastery evidence: ' + res.done.ev);
  await shot('p7_victory');
  await pg.evaluate(() => { closeModal(); hud() }); await sleep(300); res.after = await pg.evaluate(() => document.querySelector('#acts #chToday').dataset.done); ok(res.after === '1', 'home shows challenge done, free play open');
  // 3 days later: Memory Check rematch leads
  await pg.evaluate(() => { const ch = S.learn.ch; ch.history.forEach(h => { h.t -= 3.1 * 864e5; if (h.memAt) h.memAt -= 3.1 * 864e5 }); ch.day = null; window.__chDone = null; save(); LUI.openPath() }); await sleep(400);
  res.mem = await pg.evaluate(() => document.querySelector('#modal #chToday').dataset.stage); ok(res.mem === 'memory', 'memory rematch is today\'s challenge');
  await pg.evaluate(() => document.querySelector('#chToday [data-ch=go]').click()); await sleep(500);
  for (let i = 0; i < 4 && !(await pg.evaluate(() => !!window.__chDone)); i++) { await pickRight(); await sleep(2600) }
  res.mdone = await pg.evaluate(() => window.__chDone && window.__chDone.badges.map(b => b.id)); ok(res.mdone && res.mdone.includes('block_groups'), 'gap-closed badge after Memory Check: ' + JSON.stringify(res.mdone)); await shot('p7_memory_win');
  // teacher: Reteach Plan one-tap assign creates the challenge; gap-closing table in Hub
  await pg.evaluate(() => { closeModal(); localStorage.removeItem('lu_assignments'); localStorage.setItem('lu_class_students', '{}'); setRoster([{ k: KEY, n: S.name || 'Ava' }]); const l = S.learn; for (let i = 0; i < 3; i++) l.log.push({ t: Date.now() - i * 1000, d: '2026-11-14', sk: 'divide', lv: 2, ok: 0, code: 'remainder', src: 'path', q: '29 ÷ 6 — vans?', given: '4', ans: '5' }); l.m.groups.lv = 3; save();
    localStorage.setItem('lu_class', JSON.stringify({ id: 'c1', name: '4B Math', teacher: 'Ms. Okafor', code: CLASSROOM.encode('class', { id: 'c1', name: '4B Math', teacher: 'Ms. Okafor' }) })); CLASSUI.openReteach() }); await sleep(600);
  await pg.evaluate(() => document.querySelector('#rtPlan0 [data-c=rtassign]').click()); await sleep(500);
  res.q = await pg.evaluate(() => (S.learn.ch.queue || []).map(q => q.code || q.sk)); ok(res.q.includes('remainder'), 'reteach assign queued a challenge: ' + res.q);
  res.gap = await pg.evaluate(() => { const t = document.querySelector('#clGap'); return t && [...t.querySelectorAll('tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ')) }); ok(res.gap && res.gap.some(r => /Equal Groups.* 1 0 ▼ 1/.test(r)), 'gap-closing table: ' + JSON.stringify(res.gap));
  await pg.evaluate(() => document.querySelector('#clGap').scrollIntoView()); await shot('p7_gap');
  await pg.evaluate(() => { closeModal(); LUI.openPath() }); await sleep(400); res.next = await pg.evaluate(() => document.querySelector('#modal #chToday').innerText); ok(/Leftover Lord/.test(res.next) && /Assigned by Ms\. Okafor/.test(res.next), 'assigned challenge leads My Path: ' + res.next);
  await pg.evaluate(() => closeModal());
};
