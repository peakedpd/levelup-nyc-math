// P5 e2e: Teacher Hub (create class, roster from this device + imported progress codes, class analytics, recommendations,
// teacher-assigned missions delivered on-device + by code, growth report) and student My Class (join, share/merge progress, assignment code).
module.exports = async ({ pg, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` }); const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  await pg.evaluate(() => {
    closeModal(); S.name = S.name || 'Ava'; S.learn = null; LUI.openPath(); closeModal(); const l = S.learn, now = Date.now();
    l.diag = { d: '2026-10-20', t: now - 25 * 864e5, sess: 0, scale: 455, place: {}, gaps: [{ prereq: 'groups', skill: 'mult' }], flagged: [] }; l.history = [l.diag, { d: '2026-11-12', t: now - 2 * 864e5, scale: 478, kind: 'checkup' }]; l.base = {};
    for (const k in l.m) { Object.assign(l.m[k], { lv: k === 'groups' ? 2 : 3, taught: 6 }); l.base[k] = 2 }
    for (let i = 0; i < 12; i++) l.log.push({ t: now - i * 36e5, d: '2026-11-13', sk: i % 2 ? 'addsub' : 'mult', lv: 3, ok: i % 3 ? 1 : 0, ms: 9000, code: i % 3 ? null : 'regroup', src: 'path' });
    save();
    const ben = JSON.parse(JSON.stringify(S)); ben.name = 'Ben'; ben.studentId = 'sBen'; ben.learn.log = ben.learn.log.slice(0, 4); for (const k in ben.learn.m) ben.learn.m[k].lv = 4;
    localStorage.setItem('lu_p_ben', JSON.stringify(ben)); setRoster([{ k: KEY, n: S.name }, { k: 'lu_p_ben', n: 'Ben' }]);
    const cleo = CLASSROOM.snapshot(Object.assign(JSON.parse(JSON.stringify(ben)), { name: 'Cleo', studentId: 'sCleo' })); for (const k in cleo.learn.m) cleo.learn.m[k].lv = 1; cleo.learn.log = cleo.learn.log.map(e => Object.assign({}, e, { ok: 0, code: 'remainder' }));
    window.__cleo = CLASSROOM.encode('progress', cleo);
  });
  // ---- Teacher view -> Teacher Hub
  await pg.evaluate(() => openTeacher()); await sleep(400);
  ok(await pg.evaluate(() => !!document.querySelector('#clHubBtn')), 'Teacher Hub button in Teacher view');
  await pg.evaluate(() => document.querySelector('#clHubBtn [data-act=hub]').click()); await sleep(400);
  await pg.evaluate(() => { document.querySelector('#clName').value = '4B Math'; document.querySelector('#clTeacher').value = 'Ms. Okafor'; document.querySelector('[data-c=mkclass]').click() }); await sleep(400);
  res.classCode = await pg.evaluate(() => document.querySelector('#clCode') && document.querySelector('#clCode').value); ok(/^LUC-/.test(res.classCode || ''), 'class code created');
  res.rowsLocal = await pg.evaluate(() => document.querySelectorAll('#clHeat tbody tr[data-sid]').length); ok(res.rowsLocal === 2, 'two on-device students in class: ' + res.rowsLocal);
  await pg.evaluate(() => { document.querySelector('#clCodes').value = window.__cleo + '\nLUP-bad-code'; document.querySelector('[data-c=import]').click() }); await sleep(400);
  res.importMsg = await pg.evaluate(() => document.querySelector('#clMsg').textContent); ok(/1 student/.test(res.importMsg) && /could not be read/.test(res.importMsg), 'import reports added + bad code: ' + res.importMsg);
  res.rows = await pg.evaluate(() => [...document.querySelectorAll('#clHeat tbody tr[data-sid]')].map(r => r.cells[0].textContent)); ok(res.rows.length === 3 && res.rows.some(t => /Cleo/.test(t)), 'imported student in heatmap');
  res.overview = await pg.evaluate(() => document.querySelector('#clOverview').innerText.slice(0, 400)); ok(/Needs attention:.*Cleo/.test(res.overview), 'struggling student flagged');
  ok(await pg.evaluate(() => !!document.querySelector('[data-c=assignmis][data-code=regroup]') || !!document.querySelector('[data-c=assignmis][data-code=remainder]')), 'misconception -> assign mission button');
  await pg.evaluate(() => document.querySelector('#clOverview').scrollIntoView()); await shot('p5_hub');
  // ---- assign a mission to whole class via the form (delivered to on-device students now)
  await pg.evaluate(() => { document.querySelector('#clType').value = 'mission'; document.querySelector('#clWhat').value = 'm:regroup'; document.querySelector('#clDue').value = '2026-11-21'; document.querySelector('#clNote').value = 'Before Friday!'; document.querySelector('[data-c=assign]').click() }); await sleep(400);
  res.asgMsg = await pg.evaluate(() => document.querySelector('#clMsg').textContent); ok(/delivered to 2 students/.test(res.asgMsg), 'assignment delivered on-device: ' + res.asgMsg);
  res.asgCode = await pg.evaluate(() => document.querySelector('#clNewCode').value); ok(/^LUA-/.test(res.asgCode), 'assignment code');
  res.benGot = await pg.evaluate(() => { const b = JSON.parse(localStorage.getItem('lu_p_ben')); return (b.learn.assignments || []).length === 1 && b.learn.interventions.some(x => x.code === 'regroup' && x.from === 'teacher') });
  ok(res.benGot, 'other on-device profile received mission'); ok(await pg.evaluate(() => S.learn.interventions.some(x => x.code === 'regroup' && x.from === 'teacher')), 'current student received mission');
  ok(await pg.evaluate(() => /0\/3|0\/2/.test(document.querySelector('#clAsgTbl').innerText)), 'assignment completion tracked');
  // ---- individual plan + growth report
  await pg.evaluate(() => [...document.querySelectorAll('[data-c=student]')].find(b => /Cleo/.test(b.closest('tr').cells[0].textContent)).click()); await sleep(400); await shot('p5_plan');
  res.recs = await pg.evaluate(() => [...document.querySelectorAll('#clRecs .cl-rec')].map(x => x.innerText)); ok(res.recs.length >= 2 && res.recs.some(t => /Remainder/.test(t)), 'recommendations for Cleo: ' + res.recs.join(' | '));
  await pg.evaluate(() => document.querySelector('[data-c=assignrecs]').click()); await sleep(400);
  ok(await pg.evaluate(() => JSON.parse(localStorage.getItem('lu_assignments')).length === 2), 'recommendations assigned');
  await pg.evaluate(() => CLASSUI.report(CLASSUI.students().find(s => s.name === S.name))); await sleep(400); await shot('p5_report');
  res.report = await pg.evaluate(() => ({ rows: document.querySelectorAll('#grSkills tbody tr').length, svg: !!document.querySelector('#grScale svg'), txt: document.querySelector('#grScale').innerText }));
  ok(res.report.rows === 9 && res.report.svg && /\+23/.test(res.report.txt), 'growth report: ' + JSON.stringify(res.report));
  res.csv = await pg.evaluate(() => CLASSROOM.classCSV(CLASSUI.students()).split('\n').length); ok(res.csv === 4, 'class CSV rows');
  // ---- student: My Class
  await pg.evaluate(() => { closeModal(); LUI.openPath() }); await sleep(400);
  res.card = await pg.evaluate(() => document.querySelector('#mcCard') && document.querySelector('#mcCard').innerText); ok(/1 from your teacher/.test(res.card || ''), 'My Path shows teacher assignment: ' + res.card);
  await pg.evaluate(() => document.querySelector('[data-c=myclass]').click()); await sleep(400);
  await pg.evaluate(c => { document.querySelector('#mcCode').value = c; document.querySelector('[data-c=join]').click() }, res.classCode); await sleep(400);
  res.joined = await pg.evaluate(() => ({ cc: S.classCode, cn: S.className, msg: document.querySelector('#mcMsg').textContent })); ok(res.joined.cn === '4B Math' && /Welcome/.test(res.joined.msg), 'student joined class');
  await pg.evaluate(() => document.querySelector('[data-c=share]').click()); await sleep(200);
  res.myCode = await pg.evaluate(() => document.querySelector('#mcOut').value); ok(/^LUP-/.test(res.myCode), 'progress code made');
  await shot('p5_myclass');
  // other device: simulate losing half the log + a new answer only here, then combine with the code
  res.merge = await pg.evaluate(code => { const n = S.learn.log.length; S.learn.log = S.learn.log.slice(0, 5); S.learn.log.push({ t: Date.now() + 5, d: '2026-11-14', sk: 'rounding', lv: 3, ok: 1, src: 'path' }); save();
    document.querySelector('#mcIn').value = code; document.querySelector('[data-c=merge]').click(); return { before: n, after: S.learn.log.length } }, res.myCode); await sleep(300);
  ok(res.merge.after === res.merge.before + 1, 'cross-device merge keeps both devices: ' + JSON.stringify(res.merge));
  // assignment code from teacher (another device) + duplicate
  await pg.evaluate(c => { document.querySelector('#mcAsgCode').value = c; document.querySelector('[data-c=addasg]').click() }, res.asgCode); await sleep(300);
  res.dup = await pg.evaluate(() => document.querySelector('#mcMsg').textContent); ok(/already/.test(res.dup), 'duplicate assignment code recognised');
  res.checkupCode = await pg.evaluate(() => CLASSROOM.encode('assign', CLASSROOM.assignment('Ms. Okafor', [{ type: 'checkup', note: 'New unit' }], 'all')));
  await pg.evaluate(c => { document.querySelector('#mcAsgCode').value = c; document.querySelector('[data-c=addasg]').click() }, res.checkupCode); await sleep(300);
  res.asgList = await pg.evaluate(() => document.querySelectorAll('#mcAsg [data-c=doit]').length); ok(res.asgList >= 2, 'student sees assignments: ' + res.asgList);
  await pg.evaluate(() => document.querySelector('#mcAsg [data-c=doit][data-t=mission]').click()); await sleep(500);
  res.mission = await pg.evaluate(() => document.querySelector('#modal').innerText.slice(0, 120)); ok(/Regrouping Rescue/.test(res.mission), 'assigned mission opens: ' + res.mission);
  await shot('p5_mission'); await pg.evaluate(() => closeModal());
};
