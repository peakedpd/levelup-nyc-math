module.exports = async ({ pg, f, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const P = (fn, a) => pg.evaluate(fn, a);
  await sleep(500); await shot('m0_hud');
  await P(() => { closeModal(); const l = S.learn || (S.learn = { m: {}, log: [], time: {}, sessions: 0 }); l.diag = { d: today(), place: {}, mins: 9 }; l.base = { groups: 1, mult: 2, divide: 1 }; save(); LUI.teachMe('groups', 1); }); await sleep(600);
  res.has3d = await P(() => !!document.querySelector('#modal [data-x=t3d]'));
  await P(() => document.querySelector('#modal [data-x=t3d]').click()); await sleep(3000); await shot('m1_3d_teach_intro');
  for (let i = 0; i < 2; i++) { await f.evaluate(() => { const b = document.querySelector('#tcNext'); b && b.click(); }); await sleep(2600); }
  await shot('m2_3d_teach_steps'); await f.evaluate(() => { const b = document.querySelector('#tcNext'); b && b.click(); }); await sleep(1200); await shot('m3_3d_teach_answer');
  await f.evaluate(() => { const b = document.querySelector('#tcGo'); b && b.click(); }); await sleep(900); await shot('m4_after_3d_yourturn');
  res.yourTurn = await P(() => document.querySelector('#modal h2') && document.querySelector('#modal h2').textContent);
  await P(() => { closeModal(); LUI.teachMe('mult', 3); }); await sleep(400); await P(() => document.querySelector('#modal [data-x=t3d]').click()); await sleep(2500);
  await f.evaluate(() => document.querySelector('#tcNext').click()); await sleep(2500); await f.evaluate(() => document.querySelector('#tcNext').click()); await sleep(2500); await shot('m5_3d_area_model');
  await f.evaluate(() => teachEnd()); await sleep(500);
  await P(() => { closeModal(); for (let i = 0; i < 12; i++) learnRecord(['groups', 'mult', 'divide'][i % 3], 2, i % 4 !== 0, 20000, i % 4 === 0 ? "That's 4 + 6. Equal groups means multiply" : null, 'path'); openTeacher(); }); await sleep(700); await shot('m6_dashboard');
  res.dash = await P(() => { const d = LUI.dashData(); return { acc: d.acc, items: d.items, mins: d.mins, mis: d.mis }; });
  res.csv = await P(() => LUI.dashCSV().split('\n').slice(4, 8));
  res.anim = await f.evaluate(() => ({ hero: ACT.hero && [ACT.hero.nat, ACT.hero.stride, (ACT.hero.blinks || []).length], theo: ACT.theo && [ACT.theo.nat, ACT.theo.stride, (ACT.theo.blinks || []).length], marcia: ACT.marcia && [ACT.marcia.nat, ACT.marcia.stride] }));
};
