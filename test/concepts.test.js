/* Checks every concept's problem maker.
   node test/concepts.test.js                    all concept files, 200 problems per concept and difficulty
   node test/concepts.test.js --file a1.js       only the concepts defined in src/concepts/a1.js (other files still load if present)
   node test/concepts.test.js --n 50             fewer problems
   node test/concepts.test.js --show a_plus9     print sample problems (text, answer, how, steps, traps) for one concept
   node test/concepts.test.js --strict           also fail on links to concept ids that do not exist (run once all files exist) */
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i < 0 ? null : (args[i + 1] || true); };
const N = +(opt('--n') || 200), ONLY = opt('--file'), SHOW = opt('--show'), STRICT = args.includes('--strict');
const C = require('../src/core.js');
const dir = path.join(__dirname, '..', 'src', 'concepts');
const files = fs.readdirSync(dir).filter(f => /\.js$/.test(f)).sort();
const owner = {};
for (const f of files) { const before = C.LIST.length; require(path.join(dir, f)); C.LIST.slice(before).forEach(c => owner[c.id] = f); }
const strandIds = C.STRANDS.map(s => s.id);
const strip = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
let fails = 0, warns = 0, checks = 0;
const fail = (id, msg, p) => { fails++; if (fails <= 60) console.log('FAIL', id, msg, p ? '\n   ' + strip(p.text).slice(0, 160) + ' | ans ' + JSON.stringify(p.ans) : ''); };
const warn = (id, msg) => { warns++; if (warns <= 60) console.log('warn', id, msg); };
const BAD = /undefined|NaN|Infinity|\[object|null\b|function\s*\(/;
function validAns(type, v, dur) {
  switch (type) {
    case 'num': return typeof v === 'number' && isFinite(v);
    case 'frac': return v && Number.isInteger(v.n) && Number.isInteger(v.d) && v.d !== 0;
    case 'money': return Number.isInteger(v) && v >= 0;
    case 'time': return v && Number.isInteger(v.h) && Number.isInteger(v.m) && v.m >= 0 && v.m < 60 && (dur ? v.h >= 0 : v.h >= 1 && v.h <= 12);
    case 'rem': return v && Number.isInteger(v.q) && Number.isInteger(v.r) && v.q >= 0 && v.r >= 0;
  }
  return false;
}
function checkProblem(id, p, where) {
  checks++;
  if (!p.text || typeof p.text !== 'string') return fail(id, where + ': no text', p);
  if (!C.TYPES.includes(p.type)) return fail(id, where + ': bad type ' + p.type, p);
  if (!validAns(p.type, p.ans, p.dur)) return fail(id, where + ': bad answer ' + JSON.stringify(p.ans), p);
  if (p.type === 'frac' && p.low) { const [a, b] = C.reduce(p.ans.n, p.ans.d); if (a !== p.ans.n || b !== p.ans.d) warn(id, where + ': low answer not stored in lowest terms ' + JSON.stringify(p.ans)); }
  if (p.type === 'num' && Math.abs(p.ans) >= 1e9) warn(id, where + ': very large answer ' + p.ans);
  if (p.type === 'num' && String(p.ans).replace(/^-/, '').replace('.', '').length > 10) warn(id, where + ': long answer ' + p.ans);
  const raw = C.rawFor(p), back = C.parse(p, raw);
  if (!C.eqAns(p, back)) fail(id, where + ': typing the answer (' + raw + ') is not accepted', p);
  const all = [p.text, p.vis || '', p.howVis || '', ...(p.how || []), p.hint || ''].join(' ');
  if (BAD.test(strip(all))) fail(id, where + ': text has ' + strip(all).match(BAD)[0], p);
  if (/(^|[\s=(\[,:+×÷])-\s?\d/.test(strip(p.text + ' ' + (p.how || []).join(' ') + ' ' + (p.traps || []).map(t => t.why || '').join(' ')))) warn(id, where + ': hyphen used as a minus sign (use C.MINUS or C.num): ' + strip(p.text).slice(0, 80));
  return true;
}
const ids = C.LIST.filter(c => !ONLY || owner[c.id] === ONLY).map(c => c.id);
if (SHOW) {
  const c = C.S[SHOW]; if (!c) { console.log('no concept', SHOW); process.exit(1); }
  console.log(c.id, '| g' + c.g, c.s, '|', c.title, '\n tip:', c.tip, '\n pre:', c.pre.join(', ') || '-');
  const R = C.makeR(7);
  for (let d = 0; d < 3; d++) for (let k = 0; k < 3; k++) {
    const p = C.gen(SHOW, d, R);
    console.log('\n[d' + d + '] ' + strip(p.text) + (p.vis ? '  [picture]' : '') + '\n   answer: ' + strip(C.ansText(p)) + '  (type ' + p.type + (p.low ? ', lowest terms' : '') + ', keys ' + C.keysFor(p).join(' ') + ')');
    (p.how || []).forEach(h => console.log('   how: ' + strip(h)));
    (p.steps || []).forEach(s => console.log('   step: ' + strip(s.text) + ' -> ' + strip(C.ansText(s))));
    (p.traps || []).forEach(t => console.log('   trap: ' + strip(C.ansText(p, t.v)) + ' -> ' + (t.c || '(same)') + ': ' + strip(t.why || '')));
  }
  process.exit(0);
}
for (const id of ids) {
  const c = C.S[id];
  if (!strandIds.includes(c.s)) fail(id, 'unknown strand ' + c.s);
  if (!Number.isInteger(c.g) || c.g < 2 || c.g > 12) fail(id, 'grade must be 2..12, got ' + c.g);
  if (!c.title || !c.tip) fail(id, 'needs a title and a tip');
  if (c.tip && c.tip.length > 260) warn(id, 'tip is long (' + c.tip.length + ' chars)');
  if (typeof c.gen !== 'function') { fail(id, 'no gen'); continue; }
  for (const r of c.pre) if (!C.S[r]) (STRICT ? fail : warn)(id, 'pre "' + r + '" is not a concept (yet)');
  for (let d = 0; d < 3; d++) {
    const keys = new Set(), R = C.makeR(1000 + d * 7919 + id.length), t0 = Date.now(); let steps = 0, traps = 0;
    for (let k = 0; k < N; k++) {
      let p; try { p = C.gen(id, d, R); } catch (e) { fail(id, 'd' + d + ' gen threw: ' + e.message); break; }
      if (!checkProblem(id, p, 'd' + d)) continue;
      keys.add(p.key);
      if (!p.how.length) fail(id, 'd' + d + ': no how lines', p);
      p.steps.forEach((s, i) => { steps++; checkProblem(id, s, 'd' + d + ' step ' + (i + 1)); });
      p.traps.forEach(t => {
        traps++;
        if (!validAns(p.type, t.v, true) && !(p.type === 'frac' && typeof t.v === 'number')) fail(id, 'd' + d + ': trap value has the wrong form ' + JSON.stringify(t.v), p);
        if (t.c && !C.S[t.c]) (STRICT ? fail : warn)(id, 'trap points at "' + t.c + '", not a concept (yet)');
        if (!t.why) warn(id, 'd' + d + ': trap without a why');
      });
      if (Date.now() - t0 > 4000) { fail(id, 'd' + d + ' is too slow'); break; }
    }
    if (keys.size < Math.min(8, N / 4)) warn(id, 'd' + d + ': only ' + keys.size + ' different problems in ' + N);
    if (d === 2 && !steps) warn(id, 'no break-down steps at d2');
    if (!traps) warn(id, 'd' + d + ': no traps');
  }
}
/* the strands as the game will order them */
const byStrand = {}; for (const id of ids) (byStrand[C.S[id].s] = byStrand[C.S[id].s] || []).push(id);
console.log('\n' + ids.length + ' concepts, ' + checks + ' problems checked, ' + fails + ' failures, ' + warns + ' warnings');
console.log(Object.entries(byStrand).map(([s, l]) => s + ':' + l.length).join('  '));
process.exit(fails ? 1 : 0);
