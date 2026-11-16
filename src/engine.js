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
   comes back for review after 1 day, then 3, 9, 27 … days. */
const cs = (p, id) => (p.cs[id] || (p.cs[id] = { lv: 0, st: 0, ml: 0, r: 0, w: 0, t: 0, m: 0, due: 0, iv: 0 }));
const isMastered = (p, id) => !!(p.cs[id] && p.cs[id].m);
const isOpen = (p, id) => isMastered(p, id) || prereqs(id).every(r => isMastered(p, r));
const started = (p, id) => !!(p.cs[id] && (p.cs[id].r + p.cs[id].w) > 0);
const levelsDone = (p, id) => isMastered(p, id) ? 3 : (p.cs[id] ? p.cs[id].lv : 0);
function whyLocked(p, id) { const r = prereqs(id).find(x => !isMastered(p, x)); return r ? 'Master “' + S[r].title + '” first.' : ''; }
/* the concept to work on now: the one in progress, else the first open one on the path */
function current(p) {
  if (p.now && S[p.now] && !isMastered(p, p.now) && isOpen(p, p.now)) return p.now;
  for (const id of ORDER) if (!isMastered(p, id) && isOpen(p, id)) return id;
  return null;
}
function record(p, id, ok, first, hinted, now) {
  now = now || Date.now(); const s = cs(p, id), ev = {};
  if (ok) s.r++; else s.w++; s.t = now;
  if (s.m) return ev; /* practising a mastered concept does not change its level */
  if (ok && first && !hinted) {
    s.st++;
    if (s.st >= 3) { if (s.lv < 2) { s.lv++; s.st = 0; s.ml = 0; ev.levelUp = s.lv; } else { s.m = now; s.iv = 1; s.due = now + DAY; s.st = 0; ev.mastered = true; } }
  } else if (!ok) {
    s.st = 0; s.ml++;
    if (s.ml >= 2 && s.lv > 0) { s.lv--; s.ml = 0; ev.levelDown = s.lv; }
  } else if (!first) s.st = 0;
  return ev;
}
function master(p, id, now, dueIn) { const s = cs(p, id); now = now || Date.now(); if (!s.m) s.m = now; s.lv = 2; s.st = 0; s.ml = 0; s.iv = s.iv || 1; s.due = now + (dueIn != null ? dueIn : DAY); }
function due(p, now) { now = now || Date.now(); return Object.keys(p.cs).filter(id => S[id] && p.cs[id].m && p.cs[id].due <= now).sort((a, b) => p.cs[a].due - p.cs[b].due); }
function reviewResult(p, id, ok, now) {
  now = now || Date.now(); const s = cs(p, id); if (!s.m) return;
  if (ok) { s.iv = Math.min(81, (s.iv || 1) * 3); s.due = now + s.iv * DAY; } else { s.iv = 1; s.due = now + DAY / 2; }
}
function masteredCount(p) { let k = 0; for (const id in p.cs) if (S[id] && p.cs[id].m) k++; return k; }

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

/* ---------- placement check ----------
   For each strand with ideas up to one grade above the kid's, a binary search finds where to start. Each concept
   tested asks a medium and a hard problem; both right moves up, a miss moves down. It starts at the kid's grade.
   It searches the Common Core concepts only; extras stay on the path to be learned. */
function capLen(st, grade) { let k = 0; while (k < st.core.length && S[st.core[k]].g <= grade + 1) k++; return k; }
function pretestStart(grade) {
  const st = {}, order = [];
  STR.forEach(s => { const L = capLen(s, grade); if (!L) return; order.push(s.id); let e = s.core.findIndex(id => S[id].g >= grade); if (e < 0 || e >= L) e = L - 1;
    st[s.id] = { lo: -1, hi: L, at: Math.max(0, e - (e > 2 ? 1 : 0)), step: 0, done: false, log: [] }; });
  return { v: 2, grade, st, order, done: false, t: 0 };
}
function pretestNext(pre) {
  for (const sid of pre.order) { const st = pre.st[sid], s = STR.find(x => x.id === sid); if (!st || st.done || !s) continue;
    return { strand: sid, skill: s.core[st.at], d: st.step === 0 ? 1 : 2 }; }
  return null;
}
function settle(st) { st.step = 0; if (st.hi - st.lo <= 1) { st.done = true; st.start = st.hi; return; } st.at = Math.floor((st.lo + st.hi + 1) / 2); if (st.at <= st.lo) st.at = st.lo + 1; if (st.at >= st.hi) st.at = st.hi - 1; }
function pretestRecord(pre, ok) {
  const nx = pretestNext(pre); if (!nx) return; const st = pre.st[nx.strand];
  st.log.push([nx.skill, nx.d, ok ? 1 : 0]);
  if (st.step === 0 && ok) { st.step = 1; return; }
  if (ok && st.step === 1) st.lo = Math.max(st.lo, st.at); else { st.hi = Math.min(st.hi, st.at); if (ok === false && st.step === 1) st.half = st.at; }
  settle(st);
}
function pretestSkip(pre) { const nx = pretestNext(pre); if (!nx) return; const st = pre.st[nx.strand]; st.log.push([nx.skill, nx.d, 0]); st.hi = Math.min(st.hi, st.at); settle(st); }
function pretestProgress(pre) { let done = 0; pre.order.forEach(s => { if (pre.st[s].done) done++; }); return { done, total: pre.order.length }; }
/* what the placement means: every concept below the start in each strand is mastered (reviews spread over the next
   days); a start concept whose medium problem was right begins at the medium level */
function pretestApply(p, pre, now) {
  now = now || Date.now(); const out = { mastered: 0, starts: {} };
  pre.order.forEach(sid => { const st = pre.st[sid], s = STR.find(x => x.id === sid); if (!st || !s) return;
    const upto = st.done ? st.start : st.lo + 1;
    for (let i = 0; i < upto; i++) { const id = s.core[i]; if (!isMastered(p, id)) { master(p, id, now, DAY * (1 + (i % 7))); out.mastered++; } }
    const sid2 = s.core[upto]; out.starts[sid] = sid2 || null;
    if (sid2 && st.half === upto) { const c = cs(p, sid2); if (!c.m && c.lv < 1) c.lv = 1; } });
  p.now = null; return out;
}

const API = { init, isExtra, strandOf, prereqs, cs, isMastered, isOpen, started, levelsDone, whyLocked, current, record, master, due, reviewResult,
  masteredCount, diagnose, generic, spotFor, fixSet, deeper, pretestStart, pretestNext, pretestRecord, pretestSkip, pretestProgress, pretestApply,
  capLen, DAY, STR, ORDER };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.COACH = API;
})(typeof window !== 'undefined' ? window : this);
