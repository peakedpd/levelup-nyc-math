// P1 e2e: adaptive Placement Quest (all formats), save/resume, results, Check-Up retake + growth, dashboard.
// Simulated student with a known ability per skill answers perfectly at/below ability, wrongly (with a tagged distractor) above it.
module.exports = async ({ pg, OUT, res, sleep }) => {
  const shot = n => pg.screenshot({ path: `${OUT}/${n}.png` });
  const AB = { placevalue: 5, groups: 1, addsub: 4, rounding: 3, mult: 2, factors: 1, divide: 1, fractions: 0, multistep: 1 };
  const answerOne = async ab => pg.evaluate(async AB => {
    const d = window.__luDiag; if (!d) return null; const knows = AB[d.sk] >= d.lv; const box = document.querySelector('#luItem'); if (!box) return null;
    if (d.fmt === 'mc') { const bs = [...box.querySelectorAll('[data-v]')]; const b = knows ? bs.find(b => b.dataset.v === d.a) : bs.find(b => b.dataset.v !== d.a); b.click() }
    else if (d.fmt === 'array') { const [k, n] = d.x; window.__luSetArray(k, knows ? n : n + 1); box.querySelector('[data-x=ok]').click() }
    else if (d.fmt === 'frac') { const [p, q] = d.a.split('/').map(Number); window.__luType(knows ? d.a : `${p + 1}/${q}`) }
    else { const a = +d.a.replace(/,/g, ''); window.__luType(String(knows ? a : a + 10)) }
    return d.fmt }, ab);
  await pg.evaluate(() => { try { closeModal() } catch (_) {}; S.learn = null; LUI.openPath() }); await sleep(600); await shot('p1_00_intro');
  await pg.evaluate(() => document.querySelector('#modal [data-x=go]').click()); await sleep(700);
  const seen = {}; const shots = new Set(); let n = 0;
  for (; n < 12; n++) { const f = await pg.evaluate(() => window.__luDiag && window.__luDiag.fmt); if (!shots.has(f)) { shots.add(f); await shot('p1_fmt_' + f) } seen[await answerOne(AB)] = 1; await sleep(750) }
  // pause + resume
  await pg.evaluate(() => document.querySelector('#modal [data-x=pause]').click()); await sleep(400);
  res.pausedN = await pg.evaluate(() => S.learn.diagState && S.learn.diagState.n);
  await pg.evaluate(() => LUI.openPath()); await sleep(500); await shot('p1_resume');
  res.resumeBtn = await pg.evaluate(() => document.querySelector('#modal [data-x=go]').textContent.trim());
  await pg.evaluate(() => document.querySelector('#modal [data-x=go]').click()); await sleep(700);
  for (let i = 0; i < 80; i++) { const d = await pg.evaluate(() => !!document.querySelector('#luItem')); if (!d) break; const f = await pg.evaluate(() => window.__luDiag.fmt); if (!shots.has(f)) { shots.add(f); await shot('p1_fmt_' + f) } seen[await answerOne(AB)] = 1; n++; await sleep(700) }
  await sleep(500); await shot('p1_results');
  res.diag = await pg.evaluate(() => { const d = S.learn.diag; return { formats: Object.fromEntries(Object.keys(d.est).map(k => [k, S.learn.history[0] && 0])), items: d.items, scale: d.scale, est: d.est, place: d.place, gaps: d.gaps.map(g => g.prereq + '>' + g.skill), flagged: d.flagged.map(f => f.id + ':' + f.count), resultsUI: !!document.querySelector('#dgTbl'), gapsUI: !!document.querySelector('#dgGaps'), misUI: !!document.querySelector('#dgMis') } });
  res.formatsSeen = Object.keys(seen); res.estMatches = Object.keys(AB).filter(k => res.diag.est[k] === AB[k]).length + '/9';
  // My Path follows the prerequisite-aware order
  await pg.evaluate(() => document.querySelector('#modal [data-x=path]').click()); await sleep(600); await shot('p1_path');
  // simulate 15 days passing -> Check-Up prompt
  await pg.evaluate(() => { S.learn.diag.t -= 15 * 864e5; S.learn.history[0].t -= 15 * 864e5; save(); LUI.openPath() }); await sleep(500); await shot('p1_checkup_prompt');
  res.checkPrompt = await pg.evaluate(() => !!document.querySelector('#luCheck'));
  await pg.evaluate(() => document.querySelector('#luCheck [data-x=chk]').click()); await sleep(700);
  const AB2 = Object.assign({}, AB, { mult: 4, divide: 3, multistep: 2 }); // student grew
  for (let i = 0; i < 80; i++) { const d = await pg.evaluate(() => !!document.querySelector('#luItem')); if (!d) break; await answerOne(AB2); await sleep(650) }
  await sleep(500); await shot('p1_checkup_results');
  res.checkup = await pg.evaluate(() => { const l = S.learn, g = ASSESS.growth(l.history); return { kind: l.diag.kind, items: l.diag.items, hist: l.history.length, growth: g.delta, multGrowth: g.per.mult, base: l.base.mult, scaleText: (document.querySelector('#dgScale') || {}).textContent } });
  await pg.evaluate(() => { closeModal(); openTeacher() }); await sleep(700); await shot('p1_dashboard');
  res.dashGrowth = await pg.evaluate(() => (document.querySelector('#luGrowth') || {}).textContent || null);
  const A = res.assert = res.assert || []; const ok = (c, m) => { if (!c) A.push(m) };
  ok(res.estMatches === '9/9', 'placement should recover all 9 simulated abilities, got ' + res.estMatches);
  ['mc', 'num', 'frac', 'array', 'word'].forEach(f => ok(res.formatsSeen.includes(f), 'format not exercised: ' + f));
  ok(res.pausedN === 9 && /Resume/.test(res.resumeBtn), 'save/resume');
  ok(res.diag.resultsUI && res.diag.gapsUI && res.diag.gaps.includes('groups>mult'), 'results + prerequisite gaps');
  ok(res.checkPrompt && res.checkup.kind === 'checkup' && res.checkup.hist === 2 && res.checkup.growth > 0 && res.checkup.base === res.diag.place.mult, 'check-up growth + history kept');
  ok(/Scale score/.test(res.dashGrowth || ''), 'dashboard growth line');
};
