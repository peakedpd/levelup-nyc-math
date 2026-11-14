// Re-computes every written equation chain in an explanation ("5 × 17 = 50 + 35 = 85", "1/2 = 3/6", "29 ÷ 6 = 4 remainder 5").
const num = s => +String(s).replace(/[,$\s]/g, '');
function evalSide(s) { const t = s.replace(/\$/g, '').replace(/,/g, '').replace(/−/g, '-').replace(/(\d)\s*x\s*(\d)/g, '$1×$2').trim(); if (!/^\d+(\/\d+)?(\s*[×÷+\-]\s*\d+(\/\d+)?)*$/.test(t)) return NaN;
  const tok = t.match(/\d+\/\d+|\d+|[×÷+\-]/g).map(x => /\//.test(x) ? x.split('/').reduce((a, b) => a / b) : x); const st = [+tok[0]]; const ops = [];
  for (let i = 1; i < tok.length; i += 2) { const o = tok[i], v = +tok[i + 1]; if (o === '×') st.push(st.pop() * v); else if (o === '÷') st.push(st.pop() / v); else { ops.push(o); st.push(v) } }
  let r = st[0]; for (let i = 0; i < ops.length; i++) r = ops[i] === '+' ? r + st[i + 1] : r - st[i + 1]; return r }
const N = String.raw`\$?\d[\d,]*(?:\/\d+)?`, OP = String.raw`\s*[×÷+−\-]\s*`;
const RE = new RegExp(String.raw`(?<![×÷+−\-]\s{0,2}|\d|\/)${N}(?:${OP}${N})*(?:\s*=\s*${N}(?:${OP}${N})*)+(?!\s*[×÷+−\-]\s*\?)(?:\s*(?:R|remainder)\s*\d+)?`, 'g');
function check(text) { const bad = [], vals = []; const found = String(text).match(RE) || []; let last = null;
  for (let c of found) { const rm = c.match(/\s*(?:R|remainder)\s*(\d+)$/); if (rm) { c = c.slice(0, rm.index); const [l, q] = c.split('='); const m = l.replace(/,/g, '').match(/^\s*(\d+)\s*÷\s*(\d+)\s*$/); if (m) { const a = +m[1], b = +m[2]; if (Math.floor(a / b) !== num(q) || a % b !== +rm[1]) bad.push(c + ' R ' + rm[1]); vals.push(num(q)); last = num(q); continue } }
    const sides = c.split('=').map(evalSide); if (sides.some(isNaN)) continue; if (sides.some(v => Math.abs(v - sides[0]) > 1e-9)) bad.push(c); last = sides[sides.length - 1]; vals.push(...sides) }
  return { n: found.length, bad, last, vals } }
module.exports = { check, evalSide, num };
