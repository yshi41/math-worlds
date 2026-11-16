/* Math Worlds engine: the path through the concepts, mastery, review, the placement check and the coach.
   Pure functions over a player's save, so node can test them. Load after core.js and every concept file. */
(function (root) {
'use strict';
const C = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.MWC;
const { S, LIST, STRANDS } = C;
const DAY = 864e5;

/* ---------- the path ----------
   Strand order: grade, then the order the concepts are defined. Each concept needs the one before it in its strand,
   plus any listed prerequisites from other strands. The overall order goes grade by grade and takes the strands in turn,
   so a kid moves between kinds of ideas instead of doing one strand for weeks. */
let STR = [], ORDER = [];
const isExtra = id => !!(S[id].extra || !(S[id].cc && S[id].cc.length));
function init() {
  STR = STRANDS.map(s => Object.assign({}, s, { list: LIST.filter(c => c.s === s.id).sort((a, b) => a.g - b.g || a.def - b.def).map(c => c.id) })).filter(s => s.list.length);
  /* extras (shortcuts beyond the Common Core) sit on the path and need what comes before them, but a Common Core
     concept only needs the Common Core concept before it, so an extra never holds back grade-level work */
  const rank = {}; STR.forEach((s, i) => { rank[s.id] = i; s.list.forEach((id, k) => { S[id].idx = k; let j = k - 1; if (!isExtra(id)) while (j >= 0 && isExtra(s.list[j])) j--; S[id].prev = j >= 0 ? s.list[j] : null; }); });
  STR.forEach(s => { s.core = s.list.filter(id => !isExtra(id)); });
  const pos = {}; STR.forEach(s => { const seen = {}; s.list.forEach(id => { const g = S[id].g; seen[g] = (seen[g] || 0); pos[id] = seen[g]++; }); });
  ORDER = LIST.map(c => c.id).sort((a, b) => S[a].g - S[b].g || pos[a] - pos[b] || rank[S[a].s] - rank[S[b].s]);
  API.STR = STR; API.ORDER = ORDER;
}
const strandOf = id => STR.find(s => s.id === S[id].s);
function prereqs(id) { const c = S[id]; return [c.prev].concat(c.pre).filter(x => x && S[x]); }

/* ---------- mastery ----------
   Each concept has three levels (easy, medium, hard). Three first-try answers in a row without a hint move up a level;
   three in a row at the hard level masters the concept. Two misses at a level move back down one. A mastered concept
   comes back for a memory check after 1 day, then 3, 9, 27 … days.
   A concept that fails a memory check is "lapsed": it keeps the date it was first mastered (m, which the save service
   never lets go of) and gets lx, the time it lapsed. A lapsed concept counts as not mastered until it is mastered again. */
const cs = (p, id) => (p.cs[id] || (p.cs[id] = { lv: 0, st: 0, ml: 0, r: 0, w: 0, t: 0, m: 0, due: 0, iv: 0 }));
const live = s => !!(s && s.m && !s.lx);
const isMastered = (p, id) => live(p.cs[id]);
const isLapsed = (p, id) => !!(p.cs[id] && p.cs[id].m && p.cs[id].lx);
const isOpen = (p, id) => isMastered(p, id) || prereqs(id).every(r => isMastered(p, r));
const started = (p, id) => !!(p.cs[id] && (p.cs[id].r + p.cs[id].w) > 0);
const levelsDone = (p, id) => isMastered(p, id) ? 3 : (p.cs[id] ? p.cs[id].lv : 0);
function whyLocked(p, id) { const r = prereqs(id).find(x => !isMastered(p, x)); return r ? 'Master “' + S[r].title + '” first.' : ''; }
/* the concept to work on now: a lapsed concept first (nothing new until what was forgotten is mastered again), then
   the one in progress, else the first open one on the path */
function current(p) {
  for (const id of ORDER) if (isLapsed(p, id) && isOpen(p, id)) return id;
  if (p.now && S[p.now] && !isMastered(p, p.now) && isOpen(p, p.now)) return p.now;
  for (const id of ORDER) if (!isMastered(p, id) && isOpen(p, id)) return id;
  return null;
}
function record(p, id, ok, first, hinted, now) {
  now = now || Date.now(); const s = cs(p, id), ev = {};
  if (ok) s.r++; else s.w++; s.t = now;
  if (live(s)) return ev; /* practising a mastered concept does not change its level */
  if (ok && first && !hinted) {
    s.st++;
    if (s.st >= 3) { if (s.lv < 2) { s.lv++; s.st = 0; s.ml = 0; ev.levelUp = s.lv; } else { if (s.lx) { s.lx = 0; s.rm = now; ev.refreshed = true; } else s.m = now; s.iv = 1; s.due = now + DAY; s.st = 0; ev.mastered = true; } }
  } else if (!ok) {
    s.st = 0; s.ml++;
    if (s.ml >= 2 && s.lv > 0) { s.lv--; s.ml = 0; s.dn = (s.dn | 0) + 1; ev.levelDown = s.lv; }
  } else if (!first) s.st = 0;
  return ev;
}
function master(p, id, now, dueIn) { const s = cs(p, id); now = now || Date.now(); if (!s.m) s.m = now; s.lx = 0; s.lv = 2; s.st = 0; s.ml = 0; s.iv = s.iv || 1; s.due = now + (dueIn != null ? dueIn : DAY); }
function due(p, now) { now = now || Date.now(); return Object.keys(p.cs).filter(id => S[id] && live(p.cs[id]) && p.cs[id].due <= now).sort((a, b) => p.cs[a].due - p.cs[b].due); }
function reviewResult(p, id, ok, now) {
  now = now || Date.now(); const s = cs(p, id); if (!live(s)) return;
  if (ok) { s.iv = Math.min(81, (s.iv || 1) * 3); s.due = now + s.iv * DAY; } else { s.iv = 1; s.due = now + DAY / 2; }
}
function masteredCount(p) { let k = 0; for (const id in p.cs) if (S[id] && live(p.cs[id])) k++; return k; }

/* ---------- memory checks ----------
   Mastered concepts are audited for retention when they come due (1, 3, 9, 27, 81 days after mastery). A check is two
   problems, medium then hard, mixed in with other concepts' and answered with no feedback until the check is over.
   Both right: the concept holds, and the next check waits three times as long. One right: "shaky", checked again
   tomorrow; shaky twice in a row counts as a lapse. None right: lapsed. A lapsed concept goes back on the path ahead of
   anything new and has to be mastered again (from the medium level if one was right, else from the easy level).
   When a kid is struggling with the concept she is learning, its foundations (the concepts it is built on) are
   checked too, even before they are due: a forgotten foundation is often the real problem. */
const struggling = (p, id) => { const s = p.cs[id]; if (!s || live(s)) return false; const n = (s.r | 0) + (s.w | 0); return (n >= 8 && s.r / n < 0.6) || (s.dn | 0) >= 1; };
function auditPick(p, now, max, focus, skip) {
  now = now || Date.now(); max = max == null ? 3 : max; skip = skip || []; const out = [];
  if (focus) for (const id of prereqs(focus)) { const s = p.cs[id]; if (live(s) && now - (s.at || 0) > 3 * DAY && !skip.includes(id) && !out.includes(id)) out.push(id); }
  /* due ones: shaky first, then ones placed by the placement check and never checked, then the most overdue */
  const rank = id => { const s = p.cs[id]; return (s.sh ? 0 : s.pl && !s.at ? 1 : 2) * 1e15 + s.due; };
  for (const id of due(p, now).sort((a, b) => rank(a) - rank(b))) if (!skip.includes(id) && !out.includes(id)) out.push(id);
  return out.slice(0, max);
}
function auditResult(p, id, oks, now) {
  now = now || Date.now(); const s = cs(p, id); if (!live(s) || !oks || !oks.length) return null;
  const right = oks.filter(Boolean).length; s.at = now;
  if (right === oks.length) { s.ap = (s.ap | 0) + 1; s.sh = 0; s.iv = Math.min(81, Math.max(1, s.iv || 1) * 3); s.due = now + s.iv * DAY; return 'pass'; }
  if (right > 0 && !s.sh) { s.sh = 1; s.as = (s.as | 0) + 1; s.iv = 1; s.due = now + DAY; return 'shaky'; }
  s.lx = now; s.al = (s.al | 0) + 1; s.sh = 0; s.lv = right > 0 ? 1 : 0; s.st = 0; s.ml = 0; s.pl = 0; s.iv = 0; s.due = 0;
  if (p.now === id) p.now = null; return 'lapse';
}

/* ---------- practice blocks ----------
   Practice comes in blocks of about 20 minutes (time spent on problems and help lessons, at most a few minutes per
   problem). A block opens with a memory check when concepts are due, then works along the path; after each concept is
   mastered, another short memory check runs if more are due; when the kid is struggling with a concept, its
   foundations are checked. A block ends at the first break after 20 minutes. blockNext says what comes next. */
const SESSION_MS = 20 * 60000, AUDIT_CAP = 6;
function blockNext(p, blk, now) {
  now = now || Date.now(); blk = blk || {};
  if ((blk.ms || 0) >= SESSION_MS) return { kind: 'done' };
  const cur = current(p), seen = blk.seen || [], fc = blk.fc || [], left = SESSION_MS - (blk.ms || 0), room = AUDIT_CAP - seen.length;
  if (room > 0 && left >= 4 * 60000) {
    const focus = cur && struggling(p, cur) && !fc.includes(cur) ? cur : null, start = !(blk.rounds | 0), after = !!blk.justMastered;
    if (focus) { const ids = auditPick(p, now, Math.min(3, room), focus, seen).filter(id => prereqs(focus).includes(id)); if (ids.length) return { kind: 'audit', ids, focus }; }
    if (start || after) { const ids = auditPick(p, now, Math.min(start ? (due(p, now).length >= 6 ? 4 : 3) : 2, room), null, seen); if (ids.length) return { kind: 'audit', ids, focus: null }; }
  }
  if (cur) return { kind: 'learn', id: cur };
  if (masteredCount(p)) return { kind: 'review' };
  return { kind: 'done' };
}

/* ---------- the coach ----------
   diagnose(problem, wrong answer) names the concept the mistake points to and a hint aimed at it. The problem's own
   traps come first (each problem knows its likely mistakes); then general checks; else the concept itself. */
const near = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
function generic(p, v) {
  if (p.type !== 'num' || typeof v !== 'number' || !isFinite(v)) return null;
  const a = p.ans, g = S[p.skill] ? S[p.skill].g : 2, st = S[p.skill] ? S[p.skill].s : '';
  const has = id => S[id] && S[id].g <= g ? id : null;
  if (a !== 0 && near(v, -a)) return { id: g >= 7 ? has('n_intadd') : null, why: 'Check the sign. Should the answer be positive or negative?' };
  for (const k of [10, 100, 1000]) if (a !== 0 && (near(v, a * k) || near(v, a / k))) return { id: has('n_times10') || has('n_place'), why: 'Check the place value. Your answer is ' + k + ' times too ' + (Math.abs(v) > Math.abs(a) ? 'big' : 'small') + '.' };
  if (Number.isInteger(a) && Number.isInteger(v) && Math.abs(a) >= 10) { const r = String(Math.abs(a)).split('').reverse().join(''); if (r !== String(Math.abs(a)) && +r === Math.abs(v)) return { id: has('n_place'), why: 'Check the order of the digits.' }; }
  if ((st === 'add' || st === 'money') && Number.isInteger(a) && (near(Math.abs(v - a), 10) || near(Math.abs(v - a), 100)))
    return v < a ? { id: has('a_regroup'), why: 'Off by ' + Math.abs(v - a) + '. Did a group of ten get carried?' } : { id: has('a_borrow'), why: 'Off by ' + Math.abs(v - a) + '. Check the borrowing: trade a ten for 10 ones.' };
  if (Number.isInteger(a) && near(Math.abs(v - a), 1)) return { id: null, why: 'So close! Check the last step again.' };
  return null;
}
/* does the typed value v match the trap value tv? (any equal form counts, e.g. 12/16 matches a 6/8 trap) */
function sameAs(p, v, tv) { const q = { type: p.type, ans: tv, dur: p.dur, fmt: p.fmt }; if (p.type === 'frac' && typeof tv === 'number') { q.type = 'num'; if (v && typeof v === 'object') v = v.n / v.d; } return C.eqAns(q, v); }
function diagnose(p, v) {
  for (const t of p.traps || []) if (sameAs(p, v, t.v)) return { id: t.c && S[t.c] ? t.c : p.skill, why: t.why || null };
  const gnr = generic(p, v); if (gnr) return { id: gnr.id || p.skill, why: gnr.why };
  return { id: p.skill, why: null };
}
/* the tricky spot to record for a mistake: only a concept the kid can reach, and not the one being learned right now */
function spotFor(pl, diag, learning) { if (!diag || !S[diag.id] || diag.id === learning) return null; return isOpen(pl, diag.id) ? diag.id : null; }
/* practice for a tricky spot: easy to hard */
function fixSet(id, R, k) { const ds = k === 2 ? [0, 1] : [0, 0, 1, 1, 2, 2]; return ds.map(d => C.gen(id, d, R)); }
const deeper = id => prereqs(id)[0] || null;

/* ---------- placement check and assessments ----------
   For each strand with ideas up to one grade above the kid's (or higher, for a later assessment of a kid who is ahead),
   a binary search finds where to start. Each concept tested asks a medium and a hard problem; both right moves up, a
   miss moves down. The first check starts at the kid's grade; a later assessment starts at the first concept not yet
   mastered in each strand. It searches the Common Core concepts only; extras stay on the path to be learned.
   The check comes in blocks planned to take about 20 minutes for an average kid. The time each block really takes is
   recorded; if a kid routinely takes longer, the rest of the check is planned for her pace and made shorter (one hard
   problem per concept, and a coarser search), and her pace carries over to the next assessment. */
const BLOCK_MS = 20 * 60000;
function capLen(st, grade, cap) { const top = cap != null ? cap : grade + 1; let k = 0; while (k < st.core.length && S[st.core[k]].g <= top) k++; return k; }
/* how long an average kid takes on one placement problem: about 35 s in her head, 75 s on paper, 90 s for a word problem */
const avgSec = id => S[id].s === 'story' ? 90 : S[id].paper ? 75 : 35;
/* a block ends at the first question after 20 minutes of answering, wherever it is in the check */
const pretestTimeUp = pre => (pre.bt || 0) >= BLOCK_MS;
function strandEstimate(pre, sid) {
  const st = pre.st[sid], s = STR.find(x => x.id === sid); if (!st || !s || st.done) return 0;
  const span = Math.max(1, st.hi - st.lo - 1), probes = Math.max(1, Math.ceil(Math.log2(span + 1)) - (pre.short ? 1 : 0)), perConcept = pre.short ? 1 : 1.4;
  return probes * perConcept * avgSec(s.core[Math.min(st.at, s.core.length - 1)]) * 1000;
}
/* the strands still to do, in blocks of about 20 minutes at this kid's pace */
function planBlocks(pre, sids) {
  const out = []; let cur = [], t = 0; const pace = Math.max(0.6, pre.pace || 1);
  for (const sid of sids) { const e = strandEstimate(pre, sid) * pace; if (cur.length && t + e > BLOCK_MS * 1.1) { out.push(cur); cur = []; t = 0; } cur.push(sid); t += e; }
  if (cur.length) out.push(cur);
  /* no tiny last block: fold it into the one before when that stays near 20 minutes */
  const est = b => b.reduce((x, sid) => x + strandEstimate(pre, sid) * pace, 0);
  if (out.length > 1 && est(out[out.length - 1]) < BLOCK_MS * 0.35 && est(out[out.length - 2]) + est(out[out.length - 1]) <= BLOCK_MS * 1.3) out.splice(-2, 2, out[out.length - 2].concat(out[out.length - 1]));
  return out;
}
/* opts: { p: the save (a later assessment starts at what is already mastered), by: 'parent', pace, short } */
function pretestStart(grade, opts) {
  opts = opts || {}; const p = opts.p, st = {}, order = [];
  let cap = grade + 1;
  if (p && p.cs) { const ge = gradeLevel(p, null); if (ge) cap = Math.min(12, Math.max(grade + 1, Math.floor(ge.ge) + 1)); }
  STR.forEach(s => { const L = capLen(s, grade, cap); if (!L) return; let e;
    if (p && p.cs) { e = s.core.findIndex(id => !isMastered(p, id)); if (e < 0 || e >= L) return; }
    else { e = s.core.findIndex(id => S[id].g >= grade); if (e < 0 || e >= L) e = L - 1; e = Math.max(0, e - (e > 2 ? 1 : 0)); }
    order.push(s.id); st[s.id] = { lo: -1, hi: L, at: e, step: 0, done: false, log: [], ms: 0 }; });
  const pre = { v: 2, grade, cap, st, order, done: false, t: 0, by: opts.by || null, pace: opts.pace || 1, short: !!opts.short, bi: 0, bt: 0, bms: [], started: 0 };
  pre.blocks = planBlocks(pre, order); return pre;
}
/* older saves: a check without blocks becomes one planned in blocks from where it is */
function pretestFix(pre) {
  if (!pre || pre.blocks) return pre;
  pre.bi = 0; pre.bt = 0; pre.bms = []; pre.pace = pre.pace || 1; pre.short = !!pre.short; pre.cap = pre.cap || pre.grade + 1;
  const left = pre.order.filter(s => pre.st[s] && !pre.st[s].done), done = pre.order.filter(s => pre.st[s] && pre.st[s].done);
  pre.blocks = pre.done ? [pre.order] : (done.length ? [done] : []).concat(planBlocks(pre, left)); if (!pre.done && done.length) pre.bi = 1;
  if (!pre.blocks.length) pre.blocks = [pre.order];
  return pre;
}
const blockOf = pre => (pre.blocks && pre.blocks[pre.bi || 0]) || pre.order;
/* the next question in the current block, or null when the block (or the whole check) is done */
function pretestNext(pre) {
  if (pretestTimeUp(pre)) return null;
  for (const sid of blockOf(pre)) { const st = pre.st[sid], s = STR.find(x => x.id === sid); if (!st || st.done || !s) continue;
    return { strand: sid, skill: s.core[st.at], d: pre.short || st.step > 0 ? 2 : 1 }; }
  return null;
}
function settle(st, short) { st.step = 0; if (st.hi - st.lo <= (short ? 2 : 1)) { st.done = true; st.start = st.lo + 1; return; } st.at = Math.floor((st.lo + st.hi + 1) / 2); if (st.at <= st.lo) st.at = st.lo + 1; if (st.at >= st.hi) st.at = st.hi - 1; }
function pretestRecord(pre, ok, ms) {
  const nx = pretestNext(pre); if (!nx) return; const st = pre.st[nx.strand]; ms = Math.max(0, Math.min(300000, ms || 0));
  st.log.push([nx.skill, nx.d, ok ? 1 : 0]); st.ms = (st.ms || 0) + ms; pre.bt = (pre.bt || 0) + ms; pre.be = (pre.be || 0) + avgSec(nx.skill) * 1000; if (!pre.started) pre.started = Date.now();
  if (!pre.short && st.step === 0 && ok) { st.step = 1; return; }
  if (ok) st.lo = Math.max(st.lo, st.at); else { st.hi = Math.min(st.hi, st.at); if (st.step === 1) st.half = st.at; }
  settle(st, pre.short);
}
function pretestSkip(pre, ms) { const nx = pretestNext(pre); if (!nx) return; const st = pre.st[nx.strand]; ms = Math.max(0, Math.min(300000, ms || 0));
  st.log.push([nx.skill, nx.d, 0, 1]); st.ms = (st.ms || 0) + ms; pre.bt = (pre.bt || 0) + ms; pre.be = (pre.be || 0) + avgSec(nx.skill) * 1000; if (!pre.started) pre.started = Date.now(); st.hi = Math.min(st.hi, st.at); settle(st, pre.short); }
/* a block is finished: record its time, adapt to the kid's pace, move on. Returns true when another block is left. */
function pretestAdvance(pre) {
  pretestFix(pre); const blk = blockOf(pre);
  /* her pace: the time she took over the time an average kid takes on the same questions */
  const est = pre.be || blk.reduce((a, sid) => a + (pre.st[sid].log.length * avgSec(pre.st[sid].log[0] ? pre.st[sid].log[0][0] : STR.find(x => x.id === sid).core[0]) * 1000), 0);
  const ms = pre.bt || 0; pre.bms.push(Math.round(ms)); pre.bt = 0; pre.be = 0;
  if (est > 0 && ms > 0) { const r = ms / est, n = pre.bms.length; pre.pace = ((pre.pace || 1) * (n - 1) + r) / n; }
  /* a kid who takes much longer than average gets a shorter check from here on, so it doesn't run to many blocks */
  if (!pre.short && pre.pace >= 1.6) { pre.short = true; pre.adapted = Date.now(); }
  pre.bi = (pre.bi || 0) + 1;
  const left = pre.order.filter(s => pre.st[s] && !pre.st[s].done);
  if (!left.length) { pre.blocks = pre.blocks.slice(0, pre.bi); return false; }
  pre.blocks = pre.blocks.slice(0, pre.bi).concat(planBlocks(pre, left));
  return true;
}
function pretestProgress(pre) { pretestFix(pre); let done = 0; pre.order.forEach(s => { if (pre.st[s].done) done++; });
  return { done, total: pre.order.length, block: Math.min((pre.bi || 0) + 1, pre.blocks.length), blocks: pre.blocks.length, estMin: Math.round(blockOf(pre).reduce((a, s) => a + strandEstimate(pre, s), 0) * Math.max(0.6, pre.pace || 1) / 60000) }; }
/* what the placement means: every concept below the start in each strand is mastered (reviews spread over the next
   days); a start concept whose medium problem was right begins at the medium level */
function pretestApply(p, pre, now) {
  now = now || Date.now(); const out = { mastered: 0, starts: {} };
  pre.order.forEach(sid => { const st = pre.st[sid], s = STR.find(x => x.id === sid); if (!st || !s) return;
    const upto = st.done ? st.start : st.lo + 1;
    for (let i = 0; i < upto; i++) { const id = s.core[i]; if (!isMastered(p, id)) { master(p, id, now, DAY * (1 + (i % 7))); cs(p, id).pl = 1; out.mastered++; } }
    const sid2 = s.core[upto]; out.starts[sid] = sid2 || null;
    if (sid2 && st.half === upto) { const c = cs(p, sid2); if (!c.m && c.lv < 1) c.lv = 1; } });
  p.now = null; return out;
}

/* ---------- the parent report ----------
   Grade level: the start of 2nd grade, plus the share of each grade's Common Core concepts mastered. Mastering every
   2nd-grade concept and half of the 3rd-grade ones gives 3.5 (3rd grade, halfway through the year). Extras don't count.
   A domain with no concepts in some grade (trig before 8th grade) uses the smaller share of the grades on either side.
   Percentile: the grade level is turned into the national average MAP Growth score for that point in school, and
   that score is placed in the national spread for the kid's own grade at today's week of school. It is an estimate
   from the game, not a test score. */
const DOMAINS = [
  { id: 'num', name: 'Number Sense', strands: ['count', 'fact', 'pow'], about: 'Place value, comparing and rounding, factors and primes, powers and roots' },
  { id: 'ops', name: 'Operations & Word Problems', strands: ['add', 'mul', 'story'], about: 'Adding, subtracting, multiplying and dividing, mental math, written methods, word problems' },
  { id: 'frac', name: 'Fractions, Decimals & Percents', strands: ['frac'], about: 'Fractions, decimals, percents, ratios and rates' },
  { id: 'alg', name: 'Patterns & Algebra', strands: ['pat', 'alg', 'calc'], about: 'Patterns and sequences, expressions, equations, functions' },
  { id: 'geo', name: 'Measurement, Time, Money & Geometry', strands: ['meas', 'time', 'money', 'trig'], about: 'Measuring, clocks and elapsed time, money, shapes, area and volume, triangles and trig' },
  { id: 'data', name: 'Data & Probability', strands: ['data'], about: 'Graphs, averages and spread, chance' }];
function gradeLevel(p, strands, asOf) {
  const tot = {}, got = {};
  for (const c of LIST) { if (isExtra(c.id) || (strands && !strands.includes(c.s))) continue; tot[c.g] = (tot[c.g] || 0) + 1; const s = p.cs[c.id]; if (live(s) && (!asOf || s.m <= asOf)) got[c.g] = (got[c.g] || 0) + 1; }
  const gs = Object.keys(tot).map(Number).sort((a, b) => a - b); if (!gs.length) return null;
  const f = {}; gs.forEach(g => { f[g] = (got[g] || 0) / tot[g]; });
  let ge = 2;
  for (let g = 2; g <= 12; g++) { if (tot[g]) { ge += f[g]; continue; } const lo = gs.filter(x => x < g).pop(), hi = gs.find(x => x > g); ge += Math.min(lo == null ? 1 : f[lo], hi == null ? 0 : f[hi]); }
  return { ge, f, tot, got, first: gs[0], last: gs[gs.length - 1] };
}
/* NWEA MAP Growth 2025 norms, student achievement, mathematics (Technical Manual, Table A.1): mean and SD of the RIT
   score in fall, winter and spring (instructional weeks 4, 20 and 32), kindergarten to 12th grade */
const NORMS = [[141.17, 12.29, 150.65, 12.57, 157.77, 13.04], [159.29, 13.40, 168.26, 13.83, 174.99, 14.32], [172.87, 15.44, 181.20, 15.70, 187.46, 16.07],
  [184.05, 15.54, 192.65, 16.34, 199.10, 17.03], [197.03, 15.91, 204.48, 17.02, 210.07, 18.04], [206.23, 16.23, 211.82, 17.42, 216.01, 18.44],
  [210.23, 15.99, 216.00, 17.35, 220.33, 18.47], [217.21, 17.22, 221.00, 18.36, 223.85, 19.29], [222.05, 18.33, 225.95, 19.31, 228.87, 20.16],
  [224.90, 17.67, 227.14, 19.17, 228.82, 21.08], [226.80, 18.58, 229.40, 20.19, 231.36, 22.23], [229.19, 20.48, 231.36, 21.85, 233.00, 23.16],
  [228.14, 20.95, 229.85, 21.81, 231.13, 23.28]];
const NPTS = []; NORMS.forEach((r, g) => [4, 20, 32].forEach((w, i) => NPTS.push([g + w / 36, r[2 * i], r[2 * i + 1]])));
/* the norm at a point in school: t = grade + week/36 (kindergarten is 0); straight lines between the norm weeks */
function normAt(t) {
  if (t <= NPTS[0][0]) return { m: NPTS[0][1], sd: NPTS[0][2] };
  for (let i = 1; i < NPTS.length; i++) { const a = NPTS[i - 1], b = NPTS[i]; if (t <= b[0]) { const k = (t - a[0]) / (b[0] - a[0]); return { m: a[1] + k * (b[1] - a[1]), sd: a[2] + k * (b[2] - a[2]) }; } }
  const z = NPTS[NPTS.length - 1]; return { m: z[1], sd: z[2] };
}
function phi(z) { const x = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * x), y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return z >= 0 ? (1 + y) / 2 : (1 - y) / 2; }
function percentileFor(ge, grade, week) {
  const now = normAt(grade + week / 36), est = normAt(ge), z = (est.m - now.m) / now.sd;
  return { pct: Math.max(1, Math.min(99, Math.round(phi(z) * 100))), rit: est.m, mean: now.m, sd: now.sd, z };
}
/* where a date falls in the school year: it starts August 12, with Thanksgiving week, two weeks at the winter holidays
   and spring break off; 36 weeks of school. Summer counts as the end of the year just finished. */
function schoolTime(date) {
  const d = new Date(date); let y = d.getFullYear(); if (d < new Date(y, 7, 12)) y--;
  const s = new Date(y, 7, 12), breaks = [[new Date(y, 10, 23), new Date(y, 10, 30)], [new Date(y, 11, 20), new Date(y + 1, 0, 4)], [new Date(y + 1, 2, 14), new Date(y + 1, 2, 23)]];
  let days = (d - s) / DAY; for (const [a, b] of breaks) days -= Math.max(0, Math.min(d, b) - a) / DAY;
  return { year: y, week: Math.max(0, Math.min(36, days / 7)) };
}
const dayKey = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function report(p, grade, now) {
  now = now || Date.now(); const st = schoolTime(now), expect = grade + st.week / 36;
  const pre = p.pre, placed = !!(pre && pre.done), capG = pre && pre.cap ? pre.cap : (pre && pre.grade ? pre.grade : grade) + 1;
  const core = LIST.filter(c => !isExtra(c.id));
  const how = id => { const s = p.cs[id]; if (!live(s)) return null; if (s.pl || (pre && pre.t && !(s.r + s.w) && Math.abs(s.m - pre.t) < 6e4)) return 'placement'; return s.to ? 'test' : 'practice'; };
  const ceilFor = strands => placed && core.filter(c => (!strands || strands.includes(c.s)) && c.g <= capG).every(c => isMastered(p, c.id));
  const tally = ids => { let r = 0, w = 0, m = 0; ids.forEach(id => { const s = p.cs[id]; if (s) { r += s.r | 0; w += s.w | 0; if (live(s)) m++; } }); return { r, w, m }; };
  const ov = gradeLevel(p, null), all = tally(LIST.map(c => c.id));
  const overall = { ge: ov.ge, diff: ov.ge - expect, ceil: ceilFor(null), r: all.r, w: all.w, mastered: all.m, total: LIST.length,
    atGrade: core.filter(c => c.g <= grade && isMastered(p, c.id)).length, atGradeTotal: core.filter(c => c.g <= grade).length };
  const domains = DOMAINS.map(d => { const gl = gradeLevel(p, d.strands), ids = LIST.filter(c => d.strands.includes(c.s)).map(c => c.id), t = tally(ids), up = core.filter(c => d.strands.includes(c.s) && c.g <= grade);
    return Object.assign({}, d, { ge: gl.ge, diff: gl.ge - expect, first: gl.first, last: gl.last, ceil: ceilFor(d.strands), r: t.r, w: t.w, mastered: t.m, total: ids.length, atGrade: up.filter(c => isMastered(p, c.id)).length, atGradeTotal: up.length }); });
  const pct = percentileFor(ov.ge, grade, st.week), ceilPct = placed ? percentileFor(capG + 1, grade, st.week).pct : null;
  /* activity, from the daily log */
  const log = p.log || {}, today = new Date(now), dayAt = i => dayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - i, 12));
  const days = []; for (let i = 13; i >= 0; i--) { const k = dayAt(i), e = log[k] || {}; days.push({ k, n: e.n | 0, ok: e.ok | 0, ms: e.ms | 0 }); }
  const sum = n => { const o = { n: 0, ok: 0, ms: 0, days: 0 }; for (let i = 0; i < n; i++) { const e = log[dayAt(i)]; if (e && e.n) { o.n += e.n | 0; o.ok += e.ok | 0; o.ms += e.ms | 0; o.days++; } } return o; };
  const ever = { n: 0, ok: 0, ms: 0, days: 0 }; for (const k in log) { const e = log[k]; if (e && e.n) { ever.n += e.n | 0; ever.ok += e.ok | 0; ever.ms += e.ms | 0; ever.days++; } }
  let streak = 0; for (let i = (log[dayAt(0)] && log[dayAt(0)].n) ? 0 : 1; i < 400; i++) { const e = log[dayAt(i)]; if (e && e.n) streak++; else break; }
  /* concepts */
  const mastered = Object.keys(p.cs).filter(id => S[id] && live(p.cs[id])).map(id => ({ id, at: p.cs[id].rm || p.cs[id].m, how: how(id) }));
  const learned = mastered.filter(x => x.how !== 'placement').sort((a, b) => b.at - a.at);
  const working = Object.keys(p.cs).filter(id => S[id] && !live(p.cs[id]) && (p.cs[id].r + p.cs[id].w > 0 || p.cs[id].lv > 0)).map(id => ({ id, lv: p.cs[id].lv, r: p.cs[id].r, w: p.cs[id].w, t: p.cs[id].t })).sort((a, b) => b.t - a.t);
  const hard = Object.keys(p.cs).filter(id => S[id] && (p.cs[id].r + p.cs[id].w) >= 4 && p.cs[id].w >= 2).map(id => ({ id, r: p.cs[id].r, w: p.cs[id].w, acc: p.cs[id].r / (p.cs[id].r + p.cs[id].w) })).filter(x => x.acc < 0.75).sort((a, b) => a.acc - b.acc);
  const spots = Object.entries(p.mist || {}).filter(([id, m]) => S[id] && m && m.ok < 3).map(([id, m]) => ({ id, n: m.n | 0, ok: m.ok | 0, why: m.why || '' })).sort((a, b) => b.n - a.n);
  /* grade level over time, from the dates concepts were mastered */
  const starts = mastered.map(x => x.at).concat(Object.keys(log).map(k => new Date(k + 'T12:00').getTime()).filter(isFinite));
  const trend = [];
  if (starts.length) { const t0 = new Date(Math.min(...starts)), first = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate()), nDays = Math.round((today - first) / DAY) + 1, step = Math.max(1, Math.ceil(nDays / 90));
    for (let i = 0; i < nDays; i += step) { const end = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i, 23, 59, 59).getTime(); trend.push({ t: Math.min(end, now), ge: gradeLevel(p, null, Math.min(end, now)).ge }); }
    if (!trend.length || trend[trend.length - 1].t < now - 60000) trend.push({ t: now, ge: ov.ge }); }
  /* the placement check */
  const placement = pre ? { done: placed, t: pre.t, grade: pre.grade, cap: capG, by: pre.by || null, bms: pre.bms || [], nBlocks: pre.blocks ? pre.blocks.length : 1, bi: pre.bi || 0, short: !!pre.short, adapted: pre.adapted || 0, pace: pre.pace || 1, parts: pre.order.map(sid => { const x = pre.st[sid], s = STR.find(q => q.id === sid); const lg = x.log || [];
    return { id: sid, name: s ? s.name : sid, done: !!x.done, start: x.done && s ? s.core[x.start] || null : null, asked: lg.length, right: lg.filter(e => e[2]).length, skipped: lg.filter(e => e[3]).length }; }) } : null;
  /* memory checks */
  const csv = Object.keys(p.cs).filter(id => S[id]).map(id => [id, p.cs[id]]);
  const retention = { due: due(p, now).length, checked: csv.filter(([, s]) => s.at).length, pass: csv.reduce((a, [, s]) => a + (s.ap | 0), 0), shaky: csv.reduce((a, [, s]) => a + (s.as | 0), 0), lapses: csv.reduce((a, [, s]) => a + (s.al | 0), 0),
    lapsed: csv.filter(([id]) => isLapsed(p, id)).map(([id, s]) => ({ id, at: s.lx, lv: s.lv })).sort((a, b) => b.at - a.at),
    recent: csv.filter(([, s]) => s.at).map(([id, s]) => ({ id, at: s.at, res: s.lx && s.lx === s.at ? 'lapse' : s.sh ? 'shaky' : 'pass' })).sort((a, b) => b.at - a.at).slice(0, 12) };
  const answered = Math.max(all.r + all.w, ever.n);
  const confidence = !placed ? 'none' : answered < 150 ? 'low' : answered < 600 ? 'medium' : 'high';
  return { now, grade, week: st.week, expect, placed, capG, overall, domains, pct, ceilPct, confidence, answered,
    days, week7: sum(7), month: sum(30), ever, streak, learned, mastered: mastered.length, byPlacement: mastered.length - learned.length,
    learnedWeek: learned.filter(x => x.at >= now - 7 * DAY).length, working, hard, spots, due: due(p, now).length, current: current(p), trend, placement, retention, help: (p.help || []).filter(h => h && S[h.id]).slice(-12).reverse() };
}

const API = { init, isExtra, strandOf, prereqs, cs, live, isMastered, isLapsed, struggling, auditPick, auditResult, blockNext, SESSION_MS, AUDIT_CAP, pretestTimeUp, isOpen, started, levelsDone, whyLocked, current, record, master, due, reviewResult,
  masteredCount, diagnose, generic, spotFor, fixSet, deeper, pretestStart, pretestNext, pretestRecord, pretestSkip, pretestProgress, pretestApply, pretestAdvance, pretestFix, planBlocks, BLOCK_MS,
  capLen, DAY, STR, ORDER, DOMAINS, NORMS, gradeLevel, normAt, phi, percentileFor, schoolTime, dayKey, report };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.COACH = API;
})(typeof window !== 'undefined' ? window : this);
