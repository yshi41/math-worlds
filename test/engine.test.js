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
  for (let k = 0; k < 600 && asked < 400; k++) { const nx = E.pretestNext(pre); if (!nx) { if (!E.pretestAdvance(pre)) break; continue; } E.pretestRecord(pre, knowsFn ? knowsFn(nx) : S[nx.skill].g <= K, 40000); asked++; }
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

/* 3b. blocks of about 20 minutes; a slow kid gets the same thorough check in more blocks; a later assessment starts where she is */
for (const g of [3, 4]) { const pre = E.pretestStart(g); ok(pre.blocks.length >= 2 && pre.blocks.flat().length === pre.order.length, 'grade ' + g + ': the check comes in ' + pre.blocks.length + ' blocks covering every part');
  ok(E.pretestProgress(pre).estMin <= 24, 'grade ' + g + ': the first block is planned at about 20 minutes (' + E.pretestProgress(pre).estMin + ' min)'); }
function run(grade, secs, K) { const pre = E.pretestStart(grade); let asked = 0, blocks = 0;
  for (let k = 0; k < 800; k++) { const nx = E.pretestNext(pre); if (!nx) { blocks++; if (!E.pretestAdvance(pre)) break; continue; } E.pretestRecord(pre, S[nx.skill].g <= K, secs * 1000); asked++; }
  return { pre, asked, blocks }; }
const avg = run(3, 40, 2), slow = run(3, 150, 2);
ok(!avg.pre.short && !slow.pre.short && slow.pre.pace > 1.5, 'a slow kid is never given a thinner check (pace ' + slow.pre.pace.toFixed(2) + ')');
eq(slow.asked, avg.asked, 'she gets every question an average kid gets (' + slow.asked + ')');
ok(slow.blocks > avg.blocks, 'spread over more blocks (' + slow.blocks + ' vs ' + avg.blocks + '), which can be on different days');
const laterBlocks = slow.pre.bms.slice(1, -1); ok(laterBlocks.every(ms => ms <= E.BLOCK_MS * 1.6), 'once her pace is known, blocks are planned near 20 minutes (' + slow.pre.bms.map(x => Math.round(x / 60000)).join(', ') + ' min)');
const sp = E.pretestStart(3, { pace: 2 }); ok(!sp.short && sp.blocks.length > E.pretestStart(3).blocks.length, 'her slow pace carries into the next assessment as more blocks');
const pa = blank(); C.LIST.filter(c => !E.isExtra(c.id) && c.g <= 3).forEach(c => E.master(pa, c.id, 1));
const re = E.pretestStart(3, { p: pa, by: 'parent' });
ok(re.cap >= 4 && re.order.every(sid => { const s = E.STR.find(x => x.id === sid); return !E.isMastered(pa, s.core[re.st[sid].at]); }), 'a parent assessment starts at the first concept not yet mastered in each part');
const old = { v: 2, grade: 3, st: JSON.parse(JSON.stringify(E.pretestStart(3).st)), order: E.pretestStart(3).order, done: false, t: 5 }; E.pretestFix(old);
ok(Array.isArray(old.blocks) && old.blocks.flat().length === old.order.length && E.pretestNext(old), 'an older check without blocks is planned into blocks');

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

/* 5. the parent report: grade level, norms, percentile, school calendar, activity */
const core = C.LIST.filter(c => !E.isExtra(c.id));
const upTo = (G, frac) => { const p = blank(); p.log = {}; core.forEach(c => { if (c.g < G) E.master(p, c.id, 1000); }); const next = core.filter(c => c.g === G); next.slice(0, Math.round(next.length * (frac || 0))).forEach(c => E.master(p, c.id, 1000)); return p; };
ok(Math.abs(E.gradeLevel(blank(), null).ge - 2) < 1e-9, 'nothing mastered: grade level 2.0');
ok(Math.abs(E.gradeLevel(upTo(3), null).ge - 3) < 1e-9, 'all of 2nd grade: 3.0');
ok(Math.abs(E.gradeLevel(upTo(5, 0.5), null).ge - 5.5) < 0.02, 'through 4th grade and half of 5th: about 5.5');
ok(Math.abs(E.gradeLevel(upTo(13), null).ge - 13) < 1e-9, 'everything: 13.0');
for (const d of E.DOMAINS) { const g = E.gradeLevel(upTo(5), d.strands); ok(g && Math.abs(g.ge - 5) < 1e-9, d.id + ': through 4th grade is 5.0 in every area (' + (g && g.ge) + ')'); }
ok(E.DOMAINS.flatMap(d => d.strands).sort().join() === C.STRANDS.map(s => s.id).sort().join(), 'every strand is in exactly one area');
const n4 = E.normAt(4 + 4 / 36), n4w = E.normAt(4 + 20 / 36);
ok(Math.abs(n4.m - 197.03) < 1e-6 && Math.abs(n4.sd - 15.91) < 1e-6 && Math.abs(n4w.m - 204.48) < 1e-6, 'norms match NWEA Table A.1 at the norm weeks');
eq(E.percentileFor(4 + 20 / 36, 4, 20).pct, 50, 'at the average for the grade and week: 50th percentile');
ok(E.percentileFor(5.5, 4, 20).pct > 60 && E.percentileFor(3, 4, 20).pct < 30, 'a grade ahead is above the middle, a grade and a half behind well below');
ok(Math.abs(E.phi(1.96) - 0.975) < 1e-4 && Math.abs(E.phi(-1) - 0.1587) < 1e-4, 'normal curve');
const stN = E.schoolTime(new Date(2026, 10, 15, 12)), stJ = E.schoolTime(new Date(2027, 6, 1)), stA = E.schoolTime(new Date(2026, 7, 12, 12));
ok(stN.year === 2026 && stN.week > 13 && stN.week < 14.5, 'mid-November is about week 13-14 (' + stN.week.toFixed(1) + ')');
ok(stJ.year === 2026 && stJ.week === 36 && stA.year === 2026 && stA.week < 0.2, 'summer is the end of the year just finished; August 12 starts the new one');
ok(E.schoolTime(new Date(2027, 8, 1)).year === 2027, 'September starts the next school year');
const pr = upTo(4); pr.pre = { v: 2, grade: 3, done: true, t: 5e6, order: [], st: {} };
const today = E.dayKey(Date.now()); pr.log = { [today]: { n: 12, ok: 9, ms: 600000 } };
const rp = E.report(pr, 3);
ok(Math.abs(rp.overall.ge - 4) < 1e-9 && rp.overall.diff > 0, 'report: grade level 4.0 for a 3rd grader is ahead');
ok(rp.placed && rp.pct.pct > 50 && rp.ceilPct >= rp.pct.pct, 'report: above-average percentile, under the placement ceiling');
eq([rp.week7.n, rp.week7.ok, rp.streak, rp.days.length], [12, 9, 1, 14], 'report: activity from the daily log');
eq(rp.byPlacement, 0, 'concepts mastered outside the placement check are not counted as placed');
ok(rp.domains.length === 6 && rp.domains.every(d => isFinite(d.ge)), 'report: six areas');
const rb = E.report(blank(), 4); ok(rb.confidence === 'none' && rb.trend.length === 0 && Math.abs(rb.overall.ge - 2) < 1e-9, 'report: an empty save');

/* 9. memory checks: pass waits longer, one miss is wobbly, a lapse goes back on the path ahead of anything new */
{
  const p = blank(), T = 1e12; let a, b, c, d; const ids = [];
  for (let id; (id = E.current(p)) && ids.length < 12; ) { E.master(p, id, T); ids.push(id); }
  [a, b, c, d] = ids; const next0 = E.current(p);
  eq(E.auditResult(p, a, [true, true], T + E.DAY), 'pass', 'both right: the concept holds'); eq(p.cs[a].iv, 3, 'and the next check waits 3 days');
  eq(E.auditResult(p, b, [true, false], T + E.DAY), 'shaky', 'one right: wobbly'); ok(E.isMastered(p, b) && p.cs[b].due === T + 2 * E.DAY, 'a wobbly concept stays mastered and is checked tomorrow');
  eq(E.auditResult(p, b, [false, true], T + 2 * E.DAY), 'lapse', 'wobbly twice: it slipped');
  ok(!E.isMastered(p, b) && E.isLapsed(p, b) && p.cs[b].m === T && p.cs[b].lv === 1, 'a slipped concept stops counting, keeps its first mastery date and restarts at the medium level');
  eq(E.auditResult(p, c, [false, false], T + E.DAY), 'lapse', 'none right: it slipped'); eq(p.cs[c].lv, 0, 'from the easy level');
  eq(E.current(p), ids.indexOf(b) < ids.indexOf(c) ? b : c, 'the path goes back to what slipped before anything new (not ' + next0 + ')');
  ok(!E.due(p, T + 99 * E.DAY).includes(b), 'a slipped concept is not up for a memory check');
  const before = E.masteredCount(p);
  let ev; for (let i = 0; i < 6; i++) ev = E.record(p, b, true, true, false, T + 3 * E.DAY);
  ok(ev.mastered && ev.refreshed && E.isMastered(p, b) && !p.cs[b].lx && p.cs[b].rm === T + 3 * E.DAY && p.cs[b].m === T, 'six in a row from the medium level masters it again');
  eq(E.masteredCount(p), before + 1, 'and it counts again');
  const r = E.report(p, 3, T + 3 * E.DAY); ok(r.retention.lapsed.length === 1 && r.retention.lapsed[0].id === c && r.retention.lapses === 2 && r.retention.pass === 1 && r.retention.shaky === 1, 'report: memory checks');
  /* picking what to check: wobbly first, then placed-and-never-checked, then the most overdue */
  const q = blank(); const qs = []; for (let id; (id = E.current(q)) && qs.length < 8; ) { E.master(q, id, T, 0); qs.push(id); }
  q.cs[qs[0]].due = T - 5; q.cs[qs[1]].due = T - 9; q.cs[qs[2]].pl = 1; q.cs[qs[3]].sh = 1;
  const pick = E.auditPick(q, T + 1, 3); eq(pick[0], qs[3], 'a wobbly one first'); eq(pick[1], qs[2], 'then a placed one never checked'); eq(pick.length, 3, 'up to the limit');
  /* foundations: struggling with a concept checks what it is built on, even before it is due */
  const f = blank(); let tgt = null; for (let id; (id = E.current(f)); ) { if (E.prereqs(id).length && E.prereqs(id).every(x => E.isMastered(f, x))) { tgt = id; break; } E.master(f, id, T, 50 * E.DAY); }
  ok(tgt, 'a concept with foundations (' + tgt + ')');
  f.now = tgt; for (let i = 0; i < 9; i++) E.record(f, tgt, i % 3 === 0, true, false, T); ok(E.struggling(f, tgt), 'under 60% after 8 tries is struggling');
  const nb = E.blockNext(f, { ms: 0, rounds: 2, seen: [], fc: [] }, T + E.DAY);
  ok(nb.kind === 'audit' && nb.focus === tgt && nb.ids.every(x => E.prereqs(tgt).includes(x)), 'the block checks its foundations (' + JSON.stringify(nb) + ')');
  ok(E.blockNext(f, { ms: 0, rounds: 2, seen: [], fc: [tgt] }, T + E.DAY).kind === 'learn', 'only once a block');
  /* the block: a memory check to start when concepts are due, learning after, done at 20 minutes */
  const g = blank(); for (let k = 0, id; (id = E.current(g)) && k < 10; k++) E.master(g, id, T, k < 7 ? 0 : 9 * E.DAY);
  const s0 = E.blockNext(g, { goal: 30, n: 0, rounds: 0, seen: [] }, T + 1); ok(s0.kind === 'audit' && s0.ids.length === 4, 'the block opens with a memory check (' + s0.ids.length + ' concepts, 7 due)');
  ok(E.blockNext(g, { goal: 30, n: 8, rounds: 1, seen: s0.ids }, T + 1).kind === 'learn', 'then learning');
  ok(E.blockNext(g, { goal: 30, n: 18, rounds: 2, seen: s0.ids, justMastered: true }, T + 1).kind === 'audit', 'another short check after a concept is mastered, while some are due');
  ok(E.blockNext(g, { goal: 30, n: 26, rounds: 2, seen: s0.ids, justMastered: true }, T + 1).kind === 'learn', 'no new check with only a few problems left');
  ok(E.blockNext(g, { goal: 30, n: 22, ms: 60 * 60000, rounds: 3, seen: s0.ids }, T + 1).kind === 'learn', 'the clock never ends a block');
  ok(E.blockNext(g, { goal: 30, n: 30, rounds: 3, seen: [] }, T + 1).kind === 'done', 'it is done when its problems are done');
  ok(E.blockNext(g, { goal: 30, n: 0, rounds: 0, seen: s0.ids.concat(['x', 'y']) }, T + 1).kind === 'learn', 'at most 6 concepts checked in a block');
  /* sizing: about 20 minutes at her pace on the concept she is on */
  const h = blank(), head = C.LIST.find(c => !c.paper && c.s !== 'story' && !c.pre.length && !S[c.id].prev).id; h.now = head;
  const g0 = E.blockGoal(h); ok(g0 >= 20 && g0 <= 32, 'a first block on a mental-math concept is about ' + g0 + ' problems');
  const paperId = ORDER.find(id => S[id].paper && S[id].s !== 'story'); const hp = blank(); C.LIST.forEach(c => { if (ORDER.indexOf(c.id) < ORDER.indexOf(paperId)) E.master(hp, c.id, 1); }); hp.now = paperId;
  ok(E.current(hp) === paperId && E.blockGoal(hp) < g0 / 1.8, 'a pencil-and-paper concept gets fewer problems (' + E.blockGoal(hp) + ')');
  const slowB = { goal: g0, n: g0, ms: 2 * g0 * E.pracSec(head) * 1000, exp: g0 * E.pracSec(head) * 1000 };
  E.blockPace(h, slowB); ok(h.ppace === 2 && E.blockGoal(h) < g0 * 0.6, 'a block that took twice as long makes the next one smaller (' + E.blockGoal(h) + ')');
  E.blockPace(h, { ms: 1, exp: 4 }); ok(h.ppace < 1.5 && E.blockGoal(h) > g0 * 0.6, 'a fast block makes the next one bigger again (' + E.blockGoal(h) + ')');
}
/* 10. an assessment block is never cut off by the clock: it ends when its parts are done */
{
  const pre = E.pretestStart(3), first = pre.blocks[0].slice(); let k = 0;
  while (E.pretestNext(pre) && k < 500) { E.pretestRecord(pre, k % 2 === 0, 200000); k++; }
  ok(first.every(s => pre.st[s].done) && (pre.bt || 0) > E.BLOCK_MS, 'a slow first block runs past 20 minutes and finishes its parts (' + k + ' questions)');
  ok(E.pretestAdvance(pre) && E.pretestNext(pre) && !pre.short, 'the next block follows, with the same thorough search');
}
/* a kid set to start at 4th grade: the first check never goes below 4th grade and counts 2nd and 3rd as known */
{ const pre = E.pretestStart(4, { floor: 4 }); let k = 0;
  ok(pre.floor === 4 && pre.order.every(sid => { const s = E.STR.find(x => x.id === sid), st = pre.st[sid]; return C.S[s.core[st.at]].g >= 4 && (st.lo < 0 || C.S[s.core[st.lo]].g < 4); }), 'floor 4: every part starts at a 4th-grade concept');
  while (E.pretestNext(pre) && k < 400) { E.pretestRecord(pre, false, 30000); k++; if (!E.pretestNext(pre) && !E.pretestAdvance(pre)) break; }
  const p = { cs: {}, mist: {} }; E.pretestApply(p, pre, 1e12);
  const core = C.LIST.filter(c => !E.isExtra(c.id));
  ok(core.filter(c => c.g < 4 && E.STR.some(s => s.core.includes(c.id))).every(c => E.isMastered(p, c.id)), 'floor 4: missing everything still leaves 2nd and 3rd grade mastered');
  ok(!core.some(c => c.g >= 4 && E.isMastered(p, c.id)), 'floor 4: nothing from 4th grade up is mastered by missing it');
  ok(E.pretestStart(4).floor === 0 && E.pretestStart(4, { floor: 4, p: p }).floor === 0, 'no floor without one, or on a later assessment'); }
/* a part tapped through (under 7 s a question) is asked again once; the pace ignores that block */
{ const pre = E.pretestStart(3), b0 = pre.blocks[0].slice(); let k = 0;
  while (E.pretestNext(pre) && k < 200) { E.pretestSkip(pre, 1500); k++; }
  const pace0 = pre.pace; ok(E.pretestAdvance(pre) && pre.again.length === b0.length && b0.every(s => !pre.st[s].done && pre.st[s].redo === 1 && pre.st[s].prev.n > 0), 'a block tapped through is asked again (' + pre.again.length + ' parts)');
  ok(pre.pace === pace0, 'a tapped-through block does not change her pace');
  k = 0; while (E.pretestNext(pre) && k < 400) { E.pretestSkip(pre, 1500); k++; if (!E.pretestNext(pre) && !E.pretestAdvance(pre)) break; }
  ok(b0.every(s => pre.st[s].done && pre.st[s].redo === 1), 'only once: tapped through again, it stands'); }
/* the parent's reset: progress from the latest assessment alone */
{ const pre = E.pretestStart(3, { by: 'parent' }); pre.started = 1e12; let k = 0;
  for (const sid of pre.blocks[0]) while (!pre.st[sid].done && k < 300) { E.pretestRecord(pre, k % 3 !== 2, 60000); k++; }
  E.pretestAdvance(pre); for (const sid of pre.blocks[1] || []) while (!pre.st[sid].done && k < 600) { E.pretestSkip(pre, 900); k++; }
  pre.t = 1e12 + 3600e3;
  const p = { cur: 77, owned: ['lagoon:frog'], char: { lagoon: 'frog' }, look: 'candy', games: 3, pre, cs: { a_ten: { m: 5, r: 9, w: 0, lv: 2 }, x_order: { m: pre.t + 10, lx: pre.t + 99, at: pre.t + 99, r: 1, w: 3 } }, mist: { a_ten: { n: 2, ok: 0, t: 1 } },
    log: { [E.dayKey(pre.t)]: { n: 10, ok: 6, ms: 5000, pre: k, pok: 3, ac: 1, al: 1 }, [E.dayKey(pre.t + 3 * E.DAY)]: { n: 8, ok: 8, ms: 900 } }, blk: { t0: pre.t + 5, t: pre.t + 50, day: E.dayKey(pre.t), n: 4, ok: 1, ms: 2000 }, bhist: [], help: [{ id: 'a_ten', t: 3 }] };
  const r = E.resetToAssessment(p, pre.t + 5 * E.DAY), q = r.p;
  ok(r.mastered > 0 && Object.values(q.cs).every(s => !s.m || s.pl), 'reset: only what the assessment placed is mastered (' + r.mastered + ')');
  ok(!q.cs.x_order || !q.cs.x_order.m, 'reset: concepts mastered after the assessment are gone');
  ok(r.again.length === (pre.blocks[1] || []).length && !q.pre.done && E.pretestNext(q.pre), 'reset: the tapped-through parts are asked again, first thing (' + r.again.join(', ') + ')');
  ok(q.cur === 77 && q.owned[0] === 'lagoon:frog' && q.look === 'candy' && !Object.keys(q.mist).length && !q.help.length && !q.blk && q.reset.t === pre.t + 5 * E.DAY, 'reset: treats, characters and world stay; practice records are cleared');
  const L0 = q.log[E.dayKey(pre.t)], L3 = q.log[E.dayKey(pre.t + 3 * E.DAY)];
  ok(L0.n === 6 && L0.ok === 5 && L0.pre === k && L0.ac === 0 && L0.al === 0 && !L3.n, 'reset: practice after the assessment is taken out of the daily log');
  ok(q.asm.length === 1 && q.asm[0].t0 === 1e12 && !q.asm[0].done && q.asm[0].ge > 2, 'reset: the assessment goes into the history');
  const R = E.report(q, 3, pre.t + 5 * E.DAY); const dn = q.pre.order.filter(s => q.pre.st[s].done).length; ok(R.placed === (dn * 2 >= q.pre.order.length) && R.partial === R.placed, 'reset: the report works from the parts done so far once half are done (' + dn + ' of ' + q.pre.order.length + ')');
  /* finishing the assessment runs the analysis again */
  k = 0; while (E.pretestNext(q.pre) && k < 400) { E.pretestRecord(q.pre, true, 40000); k++; if (!E.pretestNext(q.pre) && !E.pretestAdvance(q.pre)) break; }
  q.pre.done = true; const m0 = E.masteredCount(q); E.pretestApply(q, q.pre); E.asmNote(q, q.pre);
  ok(E.masteredCount(q) > m0 && !E.report(q, 3).partial && q.asm.length === 1 && q.asm[0].done, 'finishing it adds what it placed and updates the history line'); }
/* history: buckets by day, week and month */
{ const now = new Date(2026, 10, 17, 18).getTime(), p = { cs: { a_ten: { m: now - 40 * E.DAY, lv: 2 }, a_fives: { m: now - 2 * E.DAY, lv: 2 } }, log: {} };
  for (let i = 0; i < 60; i += 3) p.log[E.dayKey(now - i * E.DAY)] = { n: 10, ok: 7, ms: 60000, pre: i === 3 ? 5 : 0, pok: 0 };
  const h7 = E.history(p, 3, '7d', now), h30 = E.history(p, 3, '30d', now), h3 = E.history(p, 3, '3m', now), hy = E.history(p, 3, '1y', now), ha = E.history(p, 3, 'all', now);
  ok(h7.unit === 'day' && h7.buckets.length === 7 && h7.tot.n === 30 && h7.tot.pre === 5, '7 days: one bar a day, totals add up');
  ok(h30.buckets.length === 30 && h3.unit === 'week' && hy.unit === 'month' && hy.buckets.length === 13 && ha.unit === 'week', 'longer spans group by week or month');
  ok(h3.tot.n === hy.tot.n && hy.tot.n === 200, 'every day is counted once (' + hy.tot.n + ')');
  ok(h30.buckets[0].m === 1 && h30.buckets[29].m === 2 && h30.buckets[29].ge > h30.buckets[0].ge && hy.buckets[0].ge === null, 'grade level and concepts climb as concepts are mastered, and start at the first one'); }
console.log('engine: ' + n + ' checks ok' + (warns ? ', ' + warns + ' warnings' : '') + '; ' + C.LIST.length + ' concepts');
