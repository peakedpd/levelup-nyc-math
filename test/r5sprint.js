module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` });
  await pg.evaluate(() => { try { closeModal() } catch (_) {} ; LUI.sprint() }); await sleep(700); await shot('s1_sprint');
  let ok = 0;
  for (let i = 0; i < 9; i++) {
    const r = await pg.evaluate(() => { const a = window.__luLastAns; const b = [...document.querySelectorAll('#spBox [data-v]')].find(b => b.dataset.v === a); if (b) { b.click(); return 1 } return 0 }); ok += r; await sleep(700);
  }
  await shot('s2_combo'); res.sprintOk = ok;
  res.combo = await pg.evaluate(() => document.querySelector('#spC') && document.querySelector('#spC').textContent);
  await pg.evaluate(() => { const a = window.__luLastAns; const b = [...document.querySelectorAll('#spBox [data-v]')].find(b => b.dataset.v !== a); b && b.click() }); await sleep(600); await shot('s3_wrong');
  const c0 = await pg.evaluate(() => S.coins); await sleep(60000); await shot('s4_time');
  res.sprintEnd = await pg.evaluate(c0 => ({ h: document.querySelector('#modal h2') && document.querySelector('#modal h2').textContent, coins: S.coins - c0, best: S.sprintBest }), c0);
};
