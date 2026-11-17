// Real-life 3D games: every learn item, every skill and level, gets a scene whose objects add up to the item's answer,
// never prints the answer as a label, and stays small enough to draw smoothly on phones and Chromebooks.
const LN = require('../src_learn/core.js'), SC = require('../src_learn/scenes.js');
let MA = null; try { MA = require('../src_learn/mastery.js') } catch (_) {}
const fails = [], seen = {}, MAXMESH = 280; let n = 0, checked = 0;
const same = (x, y) => String(x).replace(/,/g, '') === String(y).replace(/,/g, '');
for (const s of LN.SKILLS) for (let lv = 1; lv <= 6; lv++) for (let seed = 1; seed <= 250; seed++) {
  const items = [LN.item(s.id, lv, LN.rng(seed * 97 + lv))];
  if (MA && MA.transfer) { try { const t = MA.transfer(items[0]); if (t) items.push(t) } catch (_) {} }
  for (const it of items) {
    n++; const P = SC.plan(it), tag = s.id + ' L' + lv + ' seed ' + seed + ' (' + (it.v && it.v.op) + '): ';
    if (!P) { fails.push(tag + 'no scene'); continue }
    if (!P.parts.length) fails.push(tag + 'empty scene');
    seen[s.id + ':' + P.op] = (seen[s.id + ':' + P.op] || 0) + 1;
    const want = SC.answerFrom(P, it); if (want !== null) { checked++; if (!same(want, it.a)) fails.push(tag + 'objects make ' + want + ' but the answer is ' + it.a) }
    const m = SC.meshCount(P); if (m > MAXMESH) fails.push(tag + m + ' objects is too many');
    const labels = P.parts.flatMap(b => [b.tag, b.label, b.text].filter(Boolean));
    if (!/^[<>=]$/.test(String(it.a))) for (const L of labels) if (L.replace(/,/g, '').split(/[^\d/]+/).some(w => w && same(w, it.a) && !String(it.q).replace(/,/g, '').split(/[^\d/]+/).includes(String(it.a).replace(/,/g, '')))) fails.push(tag + 'label "' + L + '" gives away the answer');
  }
}
for (const s of LN.SKILLS) if (!Object.keys(seen).some(k => k.startsWith(s.id + ':'))) fails.push('skill without a scene: ' + s.id);
console.log(JSON.stringify({ check: 'scenes', items: n, answerChecked: checked, ops: seen, fails: fails.slice(0, 30), failCount: fails.length }, null, 1)); process.exit(fails.length ? 1 : 0);
