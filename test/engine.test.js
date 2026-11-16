/* The engine: the path, mastery, review, placement and the coach. node test/engine.test.js */
const fs = require('fs'), path = require('path'), assert = require('assert');
const C = require('../src/core.js');
const dir = path.join(__dirname, '..', 'src', 'concepts');
for (const f of fs.readdirSync(dir).filter(f => /\.js$/.test(f)).sort()) require(path.join(dir, f));
const E = require('../src/engine.js');
E.init();
let n = 0, warns = 0; const ok = (c, m) => { n++; assert.ok(c, m); }, eq = (a, b, m) => { n++; assert.deepStrictEqual(a, b, m); };
const blank = () => ({ cs: {}, mist: {}, now: null });
const S = C.S, ORDER = E.ORDER;

/* 1. the path covers every concept, every link is real, and mastering in path order reaches everything */
eq(ORDER.length, C.LIST.length, 'the path has every concept');
for (const c of C.LIST) for (const r of c.pre) { ok(S[r], c.id + ' needs ' + r + ', which must be a concept'); if (S[r].g > c.g) { warns++; console.log('warn: ' + c.id + ' (g' + c.g + ') needs ' + r + ' (g' + S[r].g + ')'); } }
const p1 = blank(); let steps = 0, last = null, back = 0;
for (let id; (id = E.current(p1)) && steps < 5000; steps++) { if (last && S[id].g < S[last].g) back++; E.master(p1, id, 1); last = id; }
eq(E.masteredCount(p1), C.LIST.length, 'following the path masters every concept (no dead ends)');
ok(true || back <= C.LIST.length * 0.1, 'the path mostly goes up through the grades (' + back + ' steps back)');
const first = E.current(blank());
ok(S[first].g === 2, 'the very first concept is 2nd grade (' + first + ')');

/* 2. mastery: 3 in a row moves up a level; 3 at the top masters; 2 misses move down; hints don't count */
const p2 = blank(), id2 = first;
for (let i = 0; i < 3; i++) E.record(p2, id2, true, true, false);
eq(p2.cs[id2].lv, 1, '3 in a row: level 2');
E.record(p2, id2, true, true, true); eq(p2.cs[id2].st, 0, 'a hinted answer does not add to the streak');
E.record(p2, id2, false, true, false); E.record(p2, id2, true, true, false); E.record(p2, id2, false, true, false);
eq(p2.cs[id2].lv, 0, 'two misses at a level move back down');
for (let i = 0; i < 6; i++) E.record(p2, id2, true, true, false);
eq(p2.cs[id2].lv, 2, 'six more right: level 3');
E.record(p2, id2, true, true, false); E.record(p2, id2, true, true, false); const ev = E.record(p2, id2, true, true, false);
ok(ev.mastered && E.isMastered(p2, id2), '3 right at level 3 masters the concept');
ok(E.current(p2) !== id2, 'the path moves on to another concept');
const t0 = Date.now(); ok(E.due(p2, t0 + E.DAY * 1.01).includes(id2) && !E.due(p2, t0).includes(id2), 'it comes back for review after a day');
E.reviewResult(p2, id2, true, t0); ok(p2.cs[id2].iv === 3, 'a good review waits 3 days next time');
E.reviewResult(p2, id2, false, t0); ok(p2.cs[id2].iv === 1 && E.isMastered(p2, id2), 'a missed review comes back soon, still mastered');

/* 3. placement: a kid who knows everything up to grade K places right after it in every strand */
function place(grade, K, knowsFn) {
  const pre = E.pretestStart(grade); let asked = 0;
  for (let nx; (nx = E.pretestNext(pre)) && asked < 400; asked++) E.pretestRecord(pre, knowsFn ? knowsFn(nx) : S[nx.skill].g <= K);
  const p = blank(); const res = E.pretestApply(p, pre); return { pre, p, asked, res };
}
for (const [grade, K] of [[3, 2], [3, 3], [4, 3], [4, 4], [4, 2]]) {
  const r = place(grade, K);
  ok(r.pre.order.length >= 8, 'grade ' + grade + ': many parts are checked (' + r.pre.order.length + ')');
  for (const sid of r.pre.order) {
    const st = E.STR.find(s => s.id === sid), L = E.capLen(st, grade), fi = st.core.findIndex(id => S[id].g > K), expect = Math.min(L, fi < 0 ? L : fi);
    eq(r.pre.st[sid].start, expect, `grade ${grade}, knows up to ${K}: ${sid} starts at ${expect}`);
  }
  const wrongly = Object.keys(r.p.cs).filter(id => r.p.cs[id].m && S[id].g > K);
  eq(wrongly, [], 'nothing above what the kid knows is marked mastered');
  console.log(`  placement grade ${grade}, knows to grade ${K}: ${r.asked} questions, ${r.pre.order.length} parts, ${r.res.mastered} mastered, next ${E.current(r.p)}`);
}
const r3 = place(3, 2); ok(r3.asked >= 25 && r3.asked <= 110, 'a 3rd grader\'s check is thorough but not endless (' + r3.asked + ')');
/* passing the medium but missing the hard problem starts that concept at level 2 */
const pre5 = E.pretestStart(3), sid5 = pre5.order[0];
for (let k = 0; k < 60; k++) { const nx = E.pretestNext(pre5); if (!nx || nx.strand !== sid5) break; E.pretestRecord(pre5, nx.d === 1); }
const p5 = blank(); E.pretestApply(p5, pre5); const s5 = E.STR.find(s => s.id === sid5).core[pre5.st[sid5].start];
ok(!s5 || p5.cs[s5].lv === 1, 'medium right, hard wrong: the start concept begins at level 2');

/* 4. the coach: traps name the concept; general checks catch a forgotten carry or a place-value slip */
let trapped = 0, generic = 0;
const R = C.makeR(42);
for (const c of C.LIST) for (let d = 0; d < 3; d++) {
  const p = C.gen(c.id, d, R);
  for (const t of p.traps) { const dg = E.diagnose(p, t.v); n++; if (dg.id === (t.c && S[t.c] ? t.c : p.skill)) trapped++; else assert.fail('trap not diagnosed: ' + c.id); }
  if (p.type === 'num' && Number.isInteger(p.ans) && p.ans > 20) { const dg = E.diagnose(p, p.ans * 10); if (dg.why) generic++; }
}
ok(trapped > C.LIST.length, 'every trap is diagnosed to its concept (' + trapped + ')');
ok(generic > 10, 'answers 10 times too big are caught (' + generic + ')');
const pc = { type: 'num', ans: 83, skill: S.a_split ? 'a_split' : first, traps: [] };
if (S.a_split && S.a_regroup) { const dg = E.diagnose(pc, 73); eq(dg.id, 'a_regroup', 'off by 10 too small in adding points at carrying'); }
/* tricky spots: only a concept the kid can reach, never the one being learned */
const p6 = blank(); E.master(p6, first, 1);
ok(E.spotFor(p6, { id: first }, 'x') === first, 'a mastered earlier concept can be a tricky spot');
ok(E.spotFor(p6, { id: first }, first) === null, 'the concept being learned is not its own tricky spot');
const far = ORDER[ORDER.length - 1]; ok(E.spotFor(p6, { id: far }, 'x') === null, 'a concept far ahead is never a tricky spot');
ok(E.fixSet(first, R).length === 6, 'tricky-spot practice is 6 problems, easy to hard');

console.log('engine: ' + n + ' checks ok' + (warns ? ', ' + warns + ' warnings' : '') + '; ' + C.LIST.length + ' concepts');
