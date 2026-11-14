module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` });
  const P = (fn, a) => pg.evaluate(fn, a);
  await P(() => { closeModal(); LUI.openPath(); }); await sleep(600); await shot('l0_path_intro');
  await P(() => document.querySelector('#modal [data-x=go]').click()); await sleep(500); await shot('l1_diag_q1');
  // answer: right on first item per skill, mixed on second
  let k = 0;
  for (let i = 0; i < 18; i++) {
    const ok = await P((i) => { const b = [...document.querySelectorAll('#modal .lu-ch button')]; if (!b.length) return null; const q = document.querySelector('#modal .lu-q').textContent; return q; }, i);
    if (ok === null) break;
    await P((i) => { const bs = [...document.querySelectorAll('#modal .lu-ch button')]; // pick right answer by asking the core: we can't see the key, so peek at the last generated item via a recompute is impossible → use a test hook
      const right = bs.find(b => b.dataset.v === window.__luLastAns); const wrong = bs.find(b => b.dataset.v !== window.__luLastAns); (i % 3 === 2 ? wrong : right || bs[0]).click(); }, i);
    await sleep(800); k++; if (i === 5) await shot('l2_diag_mid');
  }
  res.diagAnswered = k; await sleep(500); await shot('l3_diag_results');
  res.place = await P(() => S.learn && S.learn.diag && S.learn.diag.place);
  await P(() => document.querySelector('#modal [data-x=path]').click()); await sleep(600); await shot('l4_my_path');
  await P(() => document.querySelector('#modal .lu-node.cur').click()); await sleep(600); await shot('l5_teach_intro');
  for (let i = 0; i < 4; i++) { const has = await P(() => !!document.querySelector('#modal [data-x=next]')); if (!has) break; await P(() => document.querySelector('#modal [data-x=next]').click()); await sleep(500); }
  await shot('l6_teach_steps');
  await P(() => document.querySelector('#modal [data-x=try]').click()); await sleep(500);
  await P(() => { const bs = [...document.querySelectorAll('#modal .lu-ch button')]; const w = bs.find(b => b.dataset.v !== window.__luLastAns); w.click(); }); await sleep(500); await shot('l7_your_turn_wrong');
  await P(() => { const bs = [...document.querySelectorAll('#modal .lu-ch button')]; bs.find(b => b.dataset.v === window.__luLastAns).click(); }); await sleep(1500);
  for (let i = 0; i < 5; i++) { await P(() => { const bs = [...document.querySelectorAll('#modal .lu-ch button')]; const r = bs.find(b => b.dataset.v === window.__luLastAns); (r || bs[0]).click(); }); await sleep(1400); if (i === 2) await shot('l8_tower'); }
  await sleep(400); await shot('l9_results'); res.mastery = await P(() => JSON.stringify(S.learn.m)); res.done = await P(() => S.learn.done);
  // 3D teach me
  await P(() => { closeModal(); }); await sleep(300);
  await P(() => { const l = S.learn; l.m.groups.taught = 0; l.m.groups.lv = 1; LUI.teachMe('groups', 1); }); await sleep(500);
  const has3d = await P(() => !!document.querySelector('#modal [data-x="t3d"]')); res.has3d = has3d;
  if (has3d) { await P(() => document.querySelector('#modal [data-x="t3d"]').click()); await sleep(2500); await shot('l10_3d_teach_intro');
    for (let i = 0; i < 3; i++) { await f.evaluate(() => { const b = document.querySelector('#tcNext'); b && b.click(); }); await sleep(2200); }
    await shot('l11_3d_teach_steps'); await f.evaluate(() => { const b = document.querySelector('#tcGo'); b && b.click(); }); await sleep(800); await shot('l12_after_3d_yourturn'); res.yourTurnOpen = await P(() => document.querySelector('#modal h2') && document.querySelector('#modal h2').textContent); }
  await P(() => closeModal()); await P(() => openTeacher()); await sleep(600); await shot('l13_dashboard');
  res.csvHead = await P(() => LUI.dashCSV().split('\n').slice(0, 7).join(' | '));
  res.dash = await P(() => { const d = LUI.dashData(); return { acc: d.acc, items: d.items, mins: d.mins, mis: d.mis }; });
};
