/* Problem-maker checks: node math.test.js [count]. Every lesson, every difficulty, many problems: the answer checks
   out, the choices hold exactly one right answer, typed input round-trips, nothing prints undefined or NaN, and
   simple "a op b = ?" problems are recomputed independently. Also the coach (diagnosis, tricky-spot practice)
   and the placement check. */
const M = require('../src/curriculum.js'), CO = require('../src/coach.js');
let n = 0, bad = 0; const fail = (...a) => { bad++; if (bad < 40) console.log('  FAIL', ...a); };
const ok = (c, ...a) => { n++; if (!c) fail(...a); };
const N = +process.argv[2] || 250;
ok(M.ORDER.length === Object.keys(M.S).length && new Set(M.ORDER).size === M.ORDER.length, 'ORDER lists every lesson once');
const inStrands = M.STRANDS.flatMap(s => s.skills); ok(inStrands.length === M.ORDER.length && M.ORDER.every(id => inStrands.includes(id)), 'every lesson is in one strand');
for (const st of M.STRANDS) { const pos = st.skills.map(id => M.ORDER.indexOf(id)); ok(pos.every((p, i) => !i || p > pos[i - 1]), 'Up next follows strand order in ' + st.id); }
for (const id in M.REQ) for (const r of M.REQ[id]) ok(M.ORDER.indexOf(r) < M.ORDER.indexOf(id), 'requirement ' + r + ' comes before ' + id);
const calc = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b };
const strip = h => String(h).replace(/<[^>]+>/g, '');
const arith = (q, tag) => { const m = strip(q.text).replace(/,/g, '').match(/^(\d+) ([+−×÷]) (\d+) = \?$/); if (m) ok(calc[m[2]](+m[1], +m[3]) === q.ans, 'arithmetic is right', tag, strip(q.text), q.ans); };
for (const id of M.ORDER) for (let d = 0; d < 3; d++) for (let i = 0; i < N; i++) {
  const p = M.gen(id, d), tag = id + ' d' + d + ' ' + strip(p.text).slice(0, 70);
  const all = [p.text, p.textPick || '', p.vis || '', p.howVis || ''].concat(p.how).join(' ');
  ok(!/undefined|NaN|\[object/.test(all), 'no undefined/NaN', tag, all.slice(0, 160));
  ok(p.how.length > 0, 'has a worked shortcut', tag);
  ok(M.eqAns(p, p.type === 'coins' ? p.sets[0] : p.ans), 'its own answer checks', tag);
  if (['num', 'money', 'time', 'rem'].includes(p.type)) ok(M.eqAns(p, M.parse(p, M.rawFor(p))), 'typed answer round-trips', tag, M.rawFor(p));
  if (p.type === 'num' || p.type === 'money') ok(Number.isInteger(p.ans) && p.ans >= 0, 'answer is a whole number', tag, p.ans);
  if (p.type === 'time' || p.type === 'clockset') ok(p.ans.m >= 0 && p.ans.m < 60 && (p.dur ? p.ans.h >= 0 : p.ans.h >= 1 && p.ans.h <= 12), 'valid time', tag, JSON.stringify(p.ans));
  if (p.type === 'rem') ok(p.ans.r > 0 && p.ans.r < p.meta.dv, 'remainder smaller than divisor', tag);
  arith(p, tag);
  const ch = M.choices(p), right = ch.filter(c => c.ok);
  ok(right.length === 1, 'exactly one right choice', tag, ch.length);
  ok(new Set(ch.map(c => c.html)).size === ch.length, 'choices are all different', tag, ch.map(c => strip(c.html)).join('|'));
  ok(p.type === 'choice' ? ch.length === p.opts.length : ch.length >= (p.type === 'coins' ? 2 : 4), 'enough choices', tag, ch.length);
  for (const c of ch) if (!c.ok) ok(!M.eqAns(p, c.v), 'wrong choices are really wrong', tag);
  /* the coach: a wrong answer always gets a named tricky spot with practice behind it */
  if (i < 30) {
    const wrong = ch.find(c => !c.ok); if (wrong) { const dgn = CO.diagnose(p, wrong.v); ok(dgn && CO.concept(dgn.id), 'diagnosis names a tricky spot', tag, dgn && dgn.id);
      const ses = CO.session(dgn.id, M.makeR(), p); ok(ses.length >= 3, 'tricky spot has practice', dgn.id, ses.length);
      for (const q of ses) { const qa = strip(q.text) + ' ' + (q.how || []).join(' ') + (q.vis || ''); ok(!/undefined|NaN/.test(qa), 'coach text ok', dgn.id, qa.slice(0, 140)); ok(M.eqAns(q, q.type === 'coins' ? q.sets[0] : q.ans), 'coach answer checks', dgn.id, strip(q.text)); arith(q, 'coach ' + dgn.id); if (q.type !== 'choice') ok(M.choices(q).filter(c => c.ok).length === 1, 'coach choices ok', dgn.id); } }
  }
}
/* specific diagnoses */
const P = (skill, text, ans, extra) => Object.assign({ skill, text, ans, type: 'num', how: [] }, extra || {});
const dg = (p, v) => CO.diagnose(p, v).id;
ok(dg(P('split', '<b>47 + 36 = ?</b>', 83), 73) === 'regroupAdd', 'forgot to carry → carrying a ten');
ok(dg(P('subsplit', '<b>72 − 38 = ?</b>', 34), 46) === 'regroupSub', 'smaller-from-bigger → taking from a ten');
ok(dg(P('x36', '<b>6 × 7 = ?</b>', 42), 13) === 'multMeaning', 'added instead of times');
ok(dg(P('x7sq', '<b>7 × 8 = ?</b>', 56), 49) === 'mult:7', 'one group of 7 short → the 7s');
ok(dg(P('xtens', '<b>40 × 30 = ?</b>', 1200), 120) === 'zeros', 'missing zero → zeros');
ok(dg(P('add9', '<b>45 + 9 = ?</b>', 54), 55) === 'compensate', 'forgot to give back → friendly number');
ok(dg(P('bond100', '<b>63 + ? = 100</b>', 37), 47) === 'bond100', 'tens to 10 → making 100');
ok(dg(P('placeval', 'x', 47), 74) === 'placeValue', 'reversed digits → place value');
ok(dg(P('fivemin', 'What time', { h: 4, m: 35 }, { type: 'time' }), { h: 7, m: 20 }) === 'handSwap', 'swapped hands');
ok(dg(P('quarter', 'What time', { h: 4, m: 45 }, { type: 'time' }), { h: 5, m: 45 }) === 'hourHand', 'hour one ahead at :45');
ok(dg(P('fivemin', 'What time', { h: 4, m: 35 }, { type: 'time' }), { h: 4, m: 7 }) === 'minutesBy5', 'read the number as minutes');
ok(dg(P('elapsed', 'from 2:45 to 3:20', 35, { meta: { h1: 2, m1: 45, h2: 3, m2: 20 } }), 75) === 'hourCross', 'hour as 100 minutes');
ok(dg(P('countcoins', 'x', 50, { type: 'money', fmt: 'c', meta: { coins: ['q', 'd', 'n', 'd'] } }), 45) === 'coinValues', 'nickel/dime swap');
ok(dg(P('remain', '<b>17 ÷ 5 = ?</b>', { q: 3, r: 2 }, { type: 'rem', meta: { v: 17, dv: 5, q: 3, r: 2 } }), { q: 2, r: 7 }) === 'remainder', 'leftover too big');
for (const id of Object.keys(CO.C).concat(['mult:7', 'mult:4', 'skip:3', 'div:6', 'skill:make10', 'skill:budget'])) {
  const c = CO.concept(id); ok(c && c.label, 'concept ' + id); const s = CO.session(id, M.makeR()); ok(s.length >= 3, 'session for ' + id, s.length);
  for (const q of s) { ok(M.eqAns(q, q.type === 'coins' ? q.sets[0] : q.ans), 'session answer checks', id); arith(q, 'session ' + id); }
  let x = c, depth = 0; while (x && x.deeper && depth < 10) { x = CO.concept(x.deeper); depth++; ok(!!x, 'deeper concept exists', id); }
}
/* placement: knows everything → past the end of every strand; knows nothing → lesson 1; knows half → the middle */
for (const grade of [3, 4]) for (const know of [1, 0, .5]) {
  const pre = CO.pretestStart(grade); let q = 0, nx;
  while ((nx = CO.pretestNext(pre)) && q < 400) { q++; const sk = M.STRANDS.find(s => s.id === nx.strand).skills; CO.pretestRecord(pre, know === .5 ? sk.indexOf(nx.skill) < sk.length / 2 : !!know); }
  ok(!CO.pretestNext(pre) && q < 120, 'placement finishes (' + grade + ', ' + know + ', ' + q + ' questions)');
  for (const s of M.STRANDS) { const st = pre.st[s.id]; if (know === 1) ok(st.start === s.skills.length, 'knows all → past the end', s.id); if (know === 0) ok(st.start === 0, 'knows none → lesson 1', s.id); if (know === .5) ok(st.start === Math.ceil(s.skills.length / 2), 'knows half → middle', s.id, st.start); }
  if (know === 0) ok(Object.keys(CO.pretestStars(pre)).length === 0, 'no stars for knowing none');
  if (know === 1) ok(Object.keys(CO.pretestStars(pre)).length === M.ORDER.length, 'all lessons placed for knowing all');
}
console.log(`math: ${n - bad} of ${n} checks passed${bad ? ', ' + bad + ' FAILED' : ''}`);
process.exit(bad ? 1 : 0);
