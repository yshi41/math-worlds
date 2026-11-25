/* Math Worlds concepts, file a2: Times & Dividing (grades 2 to 4), Time, Money.
   Ported from the old lessons in src/curriculum.js and the old coach in src/coach.js: every mistake the old coach could
   spot (hands swapped, hour one ahead, an hour counted as 100 minutes, nickel and dime mixed up, a group off in a times
   fact, a leftover that is too big...) is now a trap on the problem, and its break-down sessions are now the steps.
   Clock setting, coin tapping and choice questions are now typed questions. */
(function (C) {
'use strict';
const { B, n, MINUS, plural, fmtT, fmtM, fmtD, pad2, T, sum, ITEMS, COIN, COIN_ORDER, greedy, coinNames, countOn,
  dotsSVG, groupsSVG, rowDots, hopsSVG, minHops, clockSVG, coinSVG, coinsRow, tagsHTML } = C;

/* ---------- shared helpers ---------- */
const X = (a, b) => n(a) + ' × ' + n(b);
const less = (a, b) => n(a) + ' ' + MINUS + ' ' + n(b);
/* count by k, times times, starting after from: list(4, 3) is "4, 8, 12" */
const list = (k, times, from) => Array.from({ length: times }, (_, i) => n((from || 0) + k * (i + 1))).join(', ');
const list5 = k => k <= 6 ? list(5, k) : list(5, 6) + ', … ' + 5 * k;
const order = (R, k, o) => R.chance(.5) ? [k, o] : [o, k];
const rev = v => +String(v).split('').reverse().join('');
const RANK = [0, 1, 10, 2, 5, 11, 4, 9, 3, 8, 6, 12, 7];
const FAM = { 0: 'm_turn', 1: 'm_turn', 2: 'm_x2510', 5: 'm_x2510', 10: 'm_x2510', 4: 'm_x4x8', 8: 'm_x4x8', 9: 'm_x9', 3: 'm_x3x6', 6: 'm_x3x6', 7: 'm_x7', 11: 'm_x11', 12: 'm_x11' };
/* the concept that owns the times fact a × b: the trick a kid would use for it */
function famOf(a, b) {
  if (a === b && a >= 6 && a <= 8) return 'm_squares';
  const r = v => { const i = RANK.indexOf(v); return i < 0 ? 99 : i; };
  return FAM[r(a) <= r(b) ? a : b] || 'm_breakapart';
}
/* traps for one group too many or too few in a × b (a groups of b) */
function groupOff(a, b, c) {
  const p = a * b; c = c || famOf(a, b);
  return [{ v: p + b, c, why: 'One group of ' + b + ' too many. ' + X(a, b) + ' is ' + a + ' groups of ' + b + '.' },
          { v: p - b, c, why: 'One group of ' + b + ' short. ' + X(a, b) + ' is ' + a + ' groups of ' + b + '.' }];
}
const added = (a, b) => ({ v: a + b, c: 'm_groups', why: 'You added ' + a + ' and ' + b + '. Times means ' + a + ' ' + plural(a, 'group') + ' of ' + b + '.' });
/* half of a number said in parts: half of 370 is half of 300 and half of 70 */
function halfSay(v, bold) {
  const fin = bold ? B(n(v / 2)) : n(v / 2);
  const pv = v >= 1000 ? 1000 : 100, big = Math.floor(v / pv) * pv, rest = v - big;
  if (v < 100 || !rest || (v <= 200 && v % 20 === 0)) return 'Half of ' + n(v) + ' is ' + fin + '.';
  return 'Half of ' + n(big) + ' is ' + n(big / 2) + ' and half of ' + n(rest) + ' is ' + n(rest / 2) + ', so half of ' + n(v) + ' is ' + fin + '.';
}
/* the trick for k × o broken into small questions */
function trickSteps(k, o) {
  const s = (text, ans) => ({ text: B(text), ans }), w = (what, ans) => ({ text: 'What is ' + B(what) + '?', ans });
  switch (k) {
    case 2: { const t = o - o % 10, u = o % 10; return o > 10 && u && t ? [w('double ' + t, 2 * t), w('double ' + u, 2 * u), s((2 * t) + ' + ' + (2 * u) + ' = ?', 2 * o)] : [s(o + ' + ' + o + ' = ?', 2 * o)]; }
    case 3: return [s(o + ' + ' + o + ' = ?', 2 * o), s((2 * o) + ' + ' + o + ' = ?', 3 * o)];
    case 4: return [w('double ' + o, 2 * o), w('double ' + (2 * o), 4 * o)];
    case 8: return [w('double ' + o, 2 * o), w('double ' + (2 * o), 4 * o), w('double ' + (4 * o), 8 * o)];
    case 5: return [s('10 × ' + o + ' = ?', 10 * o), w('half of ' + n(10 * o), 5 * o)];
    case 9: return [s('10 × ' + o + ' = ?', 10 * o), s(less(10 * o, o) + ' = ?', 9 * o)];
    case 6: return [s('5 × ' + o + ' = ?', 5 * o), s((5 * o) + ' + ' + o + ' = ?', 6 * o)];
    case 7: return [s('5 × ' + o + ' = ?', 5 * o), s('2 × ' + o + ' = ?', 2 * o), s((5 * o) + ' + ' + (2 * o) + ' = ?', 7 * o)];
    case 11: return [s('10 × ' + o + ' = ?', 10 * o), s(n(10 * o) + ' + ' + o + ' = ?', 11 * o)];
    case 12: return [s('10 × ' + o + ' = ?', 10 * o), s('2 × ' + o + ' = ?', 2 * o), s(n(10 * o) + ' + ' + (2 * o) + ' = ?', 12 * o)];
  }
  return [];
}
/* the trick for k × o said in words (for checks inside other concepts) */
function trickSay(k, o) {
  const p = k * o;
  switch (k) {
    case 2: return 'double ' + o + ' is ' + p;
    case 3: return 'double ' + o + ' is ' + (2 * o) + ', plus one more ' + o + ' is ' + p;
    case 4: return o + ' doubled twice: ' + (2 * o) + ', ' + p;
    case 8: return o + ' doubled three times: ' + (2 * o) + ', ' + (4 * o) + ', ' + p;
    case 5: return 'half of ' + (10 * o) + ' is ' + p;
    case 9: return less(10 * o, o) + ' = ' + p;
    case 6: return (5 * o) + ' + ' + o + ' = ' + p;
    case 7: return (5 * o) + ' + ' + (2 * o) + ' = ' + p;
    case 10: return o + ' with a zero on the end is ' + p;
  }
  return X(k, o) + ' = ' + p;
}
/* the easiest trick factor of a × b, and the other number */
function trickPair(a, b) { const r = v => { const i = RANK.indexOf(v); return i < 0 ? 99 : i; }; return r(a) <= r(b) ? [a, b] : [b, a]; }

/* ---------- time helpers ---------- */
const NX = h => h % 12 + 1, PV = h => h === 1 ? 12 : h - 1, ord = C.ord;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const H24 = (h, m) => pad2(h) + ':' + pad2(m);
const tm = (h, m) => ({ h, m });
const dur = k => ({ h: Math.floor(k / 60), m: k % 60 });
/* how the long hand gives the minutes */
function minSay(m) {
  if (m === 0) return 'The long hand points to the 12, so it is o’clock: 0 minutes.';
  const k = Math.floor(m / 5), e = m % 5;
  if (!e) return 'The long hand points to the ' + k + '. Count by 5s from the 12: ' + list5(k) + '. That is ' + m + ' minutes.';
  if (!k) return 'The long hand is ' + e + ' little ' + plural(e, 'mark') + ' past the 12. That is ' + m + ' ' + plural(m, 'minute') + '.';
  return 'The long hand is ' + e + ' little ' + plural(e, 'mark') + ' past the ' + k + '. Count by 5s to the ' + k + ' (' + (5 * k) + '), then on by 1s: ' + list(1, e, 5 * k) + '. That is ' + m + ' minutes.';
}
/* how the short hand gives the hour */
function hourSay(h, m) {
  const nx = NX(h);
  if (m === 0) return 'The short hand points right at the ' + h + ', so the hour is ' + h + '.';
  if (m === 30) return 'The short hand is halfway between the ' + h + ' and the ' + nx + '. It has passed the ' + h + ', so the hour is ' + h + '.';
  if (m > 30) return 'The short hand is close to the ' + nx + ' but has not reached it yet, so the hour is still ' + h + '.';
  return 'The short hand has just passed the ' + h + ', so the hour is ' + h + '.';
}
/* read a clock: minutes from the long hand, the hour from the short hand, then the time */
function readSteps(h, m, fives) {
  const vis = clockSVG(h, m, { fives });
  return [{ text: 'Look at the long hand. How many minutes past the hour is it?', ans: m, vis, unit: 'minutes' },
          { text: 'Look at the short hand. What hour is it?', ans: h, vis },
          { type: 'time', text: 'So what time does the clock show?', ans: tm(h, m), vis }];
}
/* the old coach's clock-reading mistakes */
function clockTraps(h, m) {
  const nx = NX(h), out = [], swap = 'The hands got swapped. The short hand shows the hour; the long hand shows the minutes.';
  if (m % 5 === 0 && m) out.push({ v: tm(m / 5, (h % 12) * 5), c: 't_hour', why: swap });
  if (m === 0 && h !== 12) out.push({ v: tm(12, h * 5), c: 't_hour', why: swap });
  if (m === 0) out.push({ v: tm(h, 12), c: 't_hour', why: 'The long hand on the 12 means o’clock: 0 minutes, not 12 minutes.' });
  if (m === 30) out.push({ v: tm(nx, 30), c: 't_hour', why: 'Halfway between two numbers, the hour is the one the short hand has passed.' });
  if (m > 30) out.push({ v: tm(nx, m), c: 't_quarter', why: 'The short hand is close to the ' + nx + ' but has not reached it, so the hour is still the number it passed.' });
  const numWhy = m === 30 ? 'The long hand on the 6 means half past: 30 minutes, not 6.' : m === 15 ? 'The long hand on the 3 means quarter past: 15 minutes, not 3.' : m === 45 ? 'The long hand on the 9 means 45 minutes, not 9.' : 'You typed the number the long hand points to. Each number is 5 minutes: count by 5s.';
  if (m % 5 === 0 && m >= 10) out.push({ v: tm(h, m / 5), c: m === 30 ? 't_hour' : m === 15 || m === 45 ? 't_quarter' : 't_five', why: numWhy });
  return out;
}
/* hop to the next o'clock, then on: the lines and hops for t later than h:m by k minutes */
function forward(h, m, k) {
  const r = T.add(h, m, k), top = 60 - m, lines = [], hops = [];
  const H = Math.floor(k / 60), M = k % 60;
  let ch = h, cm = m;
  if (H) { const s = T.add(h, m, 60 * H); lines.push('First the ' + H + ' ' + plural(H, 'hour') + ': ' + fmtT(h, m) + ' → ' + fmtT(s.h, s.m) + '.'); hops.push(60 * H); ch = s.h; cm = s.m; }
  if (M) {
    const tp = 60 - cm;
    if (cm && M > tp) { lines.push('Hop to the next o’clock: ' + fmtT(ch, cm) + ' → ' + NX(ch) + ':00 is ' + tp + ' minutes.' + (ch === 12 ? ' (After 12 comes 1.)' : ''), (M - tp) + ' minutes are left: ' + NX(ch) + ':00 → ' + B(fmtT(r.h, r.m)) + '.'); hops.push(tp, M - tp); }
    else { lines.push(fmtT(ch, cm) + ' plus ' + M + ' minutes is ' + B(fmtT(r.h, r.m)) + '.'); hops.push(M); }
  } else lines[lines.length - 1] = lines[lines.length - 1].replace(/ → ([0-9:]+)\.$/, ' → ' + B(fmtT(r.h, r.m)) + '.');
  return { r, lines, hops, top, H, M };
}

/* every problem's traps: drop impossible values (negative, a minute past 59) and repeats */
const okInt = v => Number.isInteger(v) && v >= 0;
const okV = v => typeof v === 'number' ? okInt(v) : v && (v.h != null ? okInt(v.h) && okInt(v.m) && v.m < 60 : okInt(v.q) && okInt(v.r));
function clean(c) {
  const g = c.gen;
  c.gen = (d, R) => {
    const p = g(d, R); if (!p) return p;
    const seen = new Set();
    /* clocks and coin rows differ only near the end of their SVG, so key the problem on the whole picture */
    if (!p.key && p.vis) { let hsh = 0; for (let i = 0; i < p.vis.length; i++) hsh = (hsh * 31 + p.vis.charCodeAt(i)) | 0; p.key = p.text + '|' + hsh; }
    p.traps = (p.traps || []).filter(t => { const k = JSON.stringify(t.v); if (!okV(t.v) || seen.has(k)) return false; seen.add(k); return true; });
    return p;
  };
  return c;
}

/* ---------- money helpers ---------- */
const FMT = v => v >= 100 ? 'd' : 'c';
const money = (text, ans, o) => Object.assign({ type: 'money', fmt: FMT(ans), text, ans }, o || {});
const SHOP = ITEMS.filter(it => !/box|ice cream/.test(it[1]));
const coinsOf = list => sum(list.map(id => COIN[id].v));
function randomCoins(R, d) {
  if (d === 0) { const id = R.pick(['d', 'n', 'd', 'q', 'p', 'n']), k = id === 'q' ? R.i(2, 4) : R.i(3, 8); return Array(k).fill(id); }
  if (d === 1) { const pr = R.pick([['d', 'p'], ['d', 'n'], ['q', 'd'], ['q', 'p'], ['n', 'p'], ['q', 'n']]); let l; do { l = Array(R.i(1, 3)).fill(pr[0]).concat(Array(R.i(1, 4)).fill(pr[1])); } while (coinsOf(l) >= 100); return R.shuffle(l); }
  let l; do { l = Array(R.i(1, 4)).fill('q').concat(Array(R.i(1, 3)).fill('d'), Array(R.i(0, 2)).fill('n'), Array(R.i(1, 4)).fill('p')); } while (coinsOf(l) > 160 || l.length > 8); return R.shuffle(l); /* never more than 8 coins to count */
}
/* the value if the nickels and dimes were mixed up (the old coach's favourite money mistake) */
const swapND = list => sum(list.map(id => id === 'n' ? 10 : id === 'd' ? 5 : COIN[id].v));
/* count up from price to paid in friendly hops (to a 5, a 10, a quarter, a dollar...) */
function countUpHops(price, paid) {
  let at = price; const hops = [], lines = [];
  const up = to => { if (to > at && to <= paid) { hops.push(to - at); lines.push(fmtM(at) + ' → ' + fmtM(to) + ' is ' + fmtM(to - at) + '.'); at = to; } };
  if (at % 5) up(Math.ceil(at / 5) * 5);
  if (at % 10) up(at + 5);
  if (at % 100 && paid >= Math.ceil(at / 100) * 100 && Math.ceil(at / 100) * 100 < paid) up(Math.ceil(at / 100) * 100);
  up(paid);
  return { hops, lines };
}

C.defs([
/* ======================= Times & Dividing, grades 2 to 4 ======================= */
{ id: 'm_groups', s: 'mul', g: 2, title: 'Equal groups and arrays', pre: ['p_skip'],
  tip: '3 × 4 means 3 groups of 4. Count by 4s three times: 4, 8, 12. Rows of dots work the same way: 3 rows of 4 dots is 12 dots.',
  gen(d, R) {
    if (d === 0) {
      const r = R.i(2, 5), c = R.i(2, 5), p = r * c;
      return { text: 'There are ' + B(r + ' rows') + '. Each row has ' + B(c + ' dots') + '. How many dots are there in all?', vis: dotsSVG(r, c), ans: p,
        how: ['Each row has ' + c + ' dots, and there are ' + r + ' rows. That is ' + r + ' groups of ' + c + ': ' + X(r, c) + '.',
              'Count by ' + c + 's, once for each row: ' + list(c, r) + '. That is ' + B(p) + ' dots.'],
        steps: [{ text: 'How many dots are in one row?', ans: c, vis: dotsSVG(r, c) },
                { text: 'Count by ' + c + 's, once for each of the ' + r + ' rows: ' + B(list(c, r - 1) + ', ?'), ans: p }],
        traps: [added(r, c), { v: p - c, c: 'p_skip', why: 'One row short. Count by ' + c + 's once for every row.' },
                { v: p + c, c: 'p_skip', why: 'One row too many. Count by ' + c + 's just once for each row.' }] };
    }
    if (d === 1) {
      const g = R.i(2, 6), e = R.i(3, 6), p = g * e;
      return { text: B(X(g, e) + ' = ?'), vis: groupsSVG(g, e), ans: p,
        how: [X(g, e) + ' means ' + g + ' groups of ' + e + '.', 'Count by ' + e + 's, once for each group: ' + list(e, g) + '. So ' + X(g, e) + ' = ' + B(p) + '.'],
        steps: [{ text: 'How many are in each group?', ans: e, vis: groupsSVG(g, e) },
                { text: 'Add ' + g + ' groups of ' + e + ': ' + B(Array(g).fill(e).join(' + ') + ' = ?'), ans: p }],
        traps: [added(g, e), { v: p - e, c: 'p_skip', why: 'One group short. Count by ' + e + 's once for each of the ' + g + ' groups.' },
                { v: p + e, c: 'p_skip', why: 'One group too many. There are ' + g + ' groups.' }] };
    }
    if (R.chance(.55)) {
      const g = R.i(3, 6), e = R.i(3, 9), p = g * e, w = R.pick([['bags', 'apples'], ['boxes', 'crayons'], ['plates', 'cookies'], ['vases', 'flowers'], ['teams', 'players'], ['nests', 'eggs'], ['packs', 'stickers']]), one = w[0] === 'boxes' ? 'box' : w[0].slice(0, -1);
      return { text: 'There are ' + B(g + ' ' + w[0]) + '. Each ' + one + ' has ' + B(e + ' ' + w[1]) + '. How many ' + w[1] + ' are there in all?', ans: p,
        how: [g + ' ' + w[0] + ' of ' + e + ' is ' + g + ' groups of ' + e + ': ' + X(g, e) + '.', 'Count by ' + e + 's: ' + list(e, g) + '. That is ' + B(p) + ' ' + w[1] + '.'],
        steps: [{ text: 'Each ' + one + ' has ' + B(e + ' ' + w[1]) + '. How many ' + w[1] + ' do ' + B('2 ' + w[0]) + ' have?', ans: 2 * e },
                { text: B('2 ' + w[0]) + ' have ' + B((2 * e) + ' ' + w[1]) + '. Count on by ' + e + 's until you get to ' + B(g + ' ' + w[0]) + '. How many ' + w[1] + ' is that?', ans: p }],
        traps: [{ v: g + e, c: 'm_groups', why: 'You added ' + g + ' and ' + e + '. There are ' + g + ' groups of ' + e + '.' },
                { v: p - e, c: 'p_skip', why: 'One ' + one + ' short. Count by ' + e + 's once for each of the ' + g + ' ' + w[0] + '.' },
                { v: p + e, c: 'p_skip', why: 'One group too many. There are ' + g + ' ' + w[0] + '.' }] };
    }
    const k = R.i(3, 6), e = R.i(3, 9), adds = Array(k).fill(e).join(' + ');
    return { text: B(adds) + ' is the same as ' + B('? × ' + e) + '. What is the missing number?', ans: k,
      how: ['Count how many ' + e + 's are added: there are ' + k + ' of them.', k + ' groups of ' + e + ' is ' + X(k, e) + ' = ' + (k * e) + '. The missing number is ' + B(k) + '.'],
      steps: [{ text: 'What is ' + B(adds) + '?', ans: k * e }, { text: B('? × ' + e + ' = ' + (k * e)), ans: k }],
      traps: [{ v: k * e, c: 'm_groups', why: 'That is the total. The missing number is how many groups of ' + e + ' there are.' },
              { v: k + 1, c: 'm_groups', why: 'Count the ' + e + 's again, one for each group.' }, { v: k - 1, c: 'm_groups', why: 'Count the ' + e + 's again, one for each group.' }] };
  } },

{ id: 'm_x2510', s: 'mul', g: 3, title: '×2, ×5 and ×10',
  tip: '×2 is a double. ×10 puts a zero on the end. ×5 is half of ×10: 5 × 8 → 10 × 8 = 80, half of 80 is 40.',
  gen(d, R) {
    const k = d === 0 ? R.pick([2, 10]) : d === 1 ? 5 : R.pick([2, 5, 10]), o = d === 0 ? R.i(2, 10) : d === 1 ? R.i(2, 10) : R.i(11, 19);
    const [a, b] = order(R, k, o), p = k * o, text = B(X(a, b) + ' = ?');
    if (k === 10) return { text, ans: p,
      how: ['Times 10: every digit moves up one place, so put a zero on the end of ' + o + '.', X(a, b) + ' = ' + B(n(p)) + '.'],
      traps: [added(a, b), { v: o * 100, c: 'm_x2510', why: 'Times 10 puts just one zero on the end.' }] };
    if (k === 5) return { text, ans: p,
      how: ['Times 5 is half of times 10. 10 × ' + o + ' = ' + n(10 * o) + '.', halfSay(10 * o, true)],
      steps: trickSteps(5, o),
      traps: [{ v: 10 * o, c: 'm_x2510', why: 'That is 10 × ' + o + '. Times 5 is half of that.' }, added(a, b),
              { v: p + 5, c: 'm_x2510', why: 'One 5 too many. Take 10 × ' + o + ', then half of it.' }, { v: p - 5, c: 'm_x2510', why: 'One 5 short. Take 10 × ' + o + ', then half of it.' }] };
    const t = o - o % 10, u = o % 10;
    const how = o <= 10 ? ['Times 2 is a double: ' + o + ' + ' + o + '.', o + ' + ' + o + ' = ' + B(p) + '.']
      : ['Times 2 is a double. Double the tens, then double the ones.', 'Double ' + t + ' is ' + (2 * t) + '. Double ' + u + ' is ' + (2 * u) + '.', (2 * t) + ' + ' + (2 * u) + ' = ' + B(p) + '.'];
    const traps = [added(a, b), { v: p + 2, c: 'm_x2510', why: 'Close. A double is the number plus itself: ' + o + ' + ' + o + '.' }];
    if (o > 10) traps.push({ v: 2 * t + u, c: 'a_doubles', why: 'Double both parts: the tens and the ones.' });
    return { text, ans: p, how, steps: trickSteps(2, o), traps };
  } },

{ id: 'm_turn', s: 'mul', g: 3, title: 'Turnaround facts, ×0 and ×1',
  tip: '7 × 3 = 3 × 7, so use the fact that is easier. Times 1 keeps the number the same. Times 0 is always 0.',
  gen(d, R) {
    const zeroOne = big => {
      const z = R.chance(.5) ? 0 : 1, o = big ? R.i(13, 99) : R.i(2, 12), [a, b] = order(R, z, o);
      if (z === 1) return { text: B(X(a, b) + ' = ?'), ans: o,
        how: ['Times 1 keeps the number the same: one group of ' + o + ' is just ' + o + '.', X(a, b) + ' = ' + B(o) + '.'],
        traps: [{ v: o + 1, c: 'm_turn', why: 'You added 1. Times 1 means one group, so the number stays the same.' }, { v: 0, c: 'm_turn', why: 'That is times 0. Times 1 keeps the number the same.' }] };
      return { text: B(X(a, b) + ' = ?'), ans: 0,
        how: ['Times 0 is always 0.', (a === 0 ? 'Zero groups of ' + o + ' is nothing at all.' : o + ' groups of nothing is still nothing.') + ' ' + X(a, b) + ' = ' + B(0) + '.'],
        traps: [{ v: o, c: 'm_turn', why: 'That is times 1. Times 0 means no groups at all, so there is nothing.' }, { v: 1, c: 'm_turn', why: 'Times 0 is always 0. (Times 1 is the one that keeps a number.)' }] };
    };
    if (d === 0) return zeroOne(false);
    if (d === 1) {
      if (R.chance(.4)) return zeroOne(true);
      const big = R.pick([6, 7, 8, 9, 11, 12]), small = R.pick([2, 5, 10]), p = big * small;
      const easy = small === 2 ? X(2, big) + ' is double ' + big + ': ' + big + ' + ' + big + ' = ' + B(p) + '.'
        : small === 5 ? X(5, big) + ' is half of 10 × ' + big + '. Half of ' + (10 * big) + ' is ' + B(p) + '.'
        : X(10, big) + ': put a zero on the end of ' + big + ', ' + B(p) + '.';
      return { text: B(X(big, small) + ' = ?'), ans: p,
        how: ['Turn it around: ' + X(big, small) + ' is the same as ' + X(small, big) + ', and that one is easier.', easy],
        steps: [{ text: B(X(big, small) + ' = ' + small + ' × ?'), ans: big }].concat(trickSteps(small, big)).concat(small === 10 ? [{ text: B(X(small, big) + ' = ?'), ans: p }] : []),
        traps: [added(big, small), { v: p - small, c: 'm_turn', why: 'Counting by ' + small + 's ' + big + ' times is easy to slip. Turn it around: ' + X(small, big) + '.' },
                { v: p + small, c: 'm_turn', why: 'Counting by ' + small + 's ' + big + ' times is easy to slip. Turn it around: ' + X(small, big) + '.' }] };
    }
    const kind = R.i(0, 3), a = R.i(3, 9);
    if (kind <= 1) {
      const nums = R.shuffle([a, 2, 5]);
      return { text: B(nums.join(' × ') + ' = ?'), ans: 10 * a,
        how: ['You can multiply in any order. Find the pair that makes 10: 2 × 5 = 10.', '10 × ' + a + ' = ' + B(10 * a) + '.'],
        steps: [{ text: B('2 × 5 = ?'), ans: 10 }, { text: B('10 × ' + a + ' = ?'), ans: 10 * a }],
        traps: [{ v: a + 7, c: 'm_groups', why: 'You added the numbers. Times means groups, so multiply.' }, { v: 2 * a, c: 'm_turn', why: 'Use all three numbers: ' + nums.join(' × ') + '.' }, { v: 5 * a, c: 'm_turn', why: 'Use all three numbers: ' + nums.join(' × ') + '.' }] };
    }
    if (kind === 2) {
      const k = R.pick([2, 5, 10]), nums = R.shuffle([a, 1, k]), p = a * k;
      return { text: B(nums.join(' × ') + ' = ?'), ans: p,
        how: ['Times 1 changes nothing, so leave out the 1.', X(k, a) + ' = ' + B(p) + '. (' + trickSay(k, a) + '.)'],
        steps: [{ text: B(X(k, a) + ' = ?'), ans: p }],
        traps: [{ v: p + 1, c: 'm_turn', why: 'Times 1 does not add 1. It keeps the number the same.' }, { v: 0, c: 'm_turn', why: 'Times 1 is not times 0. Times 1 keeps the number the same.' }, { v: a + 1 + k, c: 'm_groups', why: 'You added the numbers. Multiply them.' }] };
    }
    const b = R.i(2, 9), nums = R.shuffle([a, 0, b]);
    return { text: B(nums.join(' × ') + ' = ?'), ans: 0,
      how: ['One of the numbers is 0, and anything times 0 is 0.', 'So the whole answer is ' + B(0) + ', whatever the other numbers are.'],
      traps: [{ v: a * b, c: 'm_turn', why: 'There is a 0 in there. Times 0 makes everything 0.' }, { v: a + b, c: 'm_turn', why: 'There is a 0 in there. Times 0 makes everything 0.' }] };
  } },

{ id: 'm_x4x8', s: 'mul', g: 3, title: '×4 and ×8: keep doubling',
  tip: '×4 is double, then double again: 4 × 6 → 12 → 24. ×8 is one more double: 8 × 6 → 12 → 24 → 48.',
  gen(d, R) {
    const k = d === 0 ? 4 : d === 1 ? 8 : R.pick([4, 8]), o = d < 2 ? R.i(2, 10) : k === 4 ? R.i(11, 25) : R.i(11, 15);
    const [a, b] = order(R, k, o), p = k * o;
    const how = k === 4 ? ['Times 4 is double, then double again.', 'Double ' + o + ' is ' + (2 * o) + '. Double ' + (2 * o) + ' is ' + B(p) + '.']
      : ['Times 8 is double three times.', o + ' → ' + (2 * o) + ' → ' + (4 * o) + ' → ' + B(p) + '.'];
    const traps = k === 4 ? [{ v: 2 * o, c: 'm_x4x8', why: 'That is one double (×2). Double once more for ×4.' }, { v: 8 * o, c: 'm_x4x8', why: 'That is three doubles (×8). Times 4 is just two doubles.' }]
      : [{ v: 4 * o, c: 'm_x4x8', why: 'That is two doubles (×4). Times 8 needs a third double.' }, { v: 16 * o, c: 'm_x4x8', why: 'That is four doubles. Times 8 is three doubles.' }];
    return { text: B(X(a, b) + ' = ?'), ans: p, how, steps: trickSteps(k, o), traps: traps.concat(groupOff(k, o, 'm_x4x8')) };
  } },

{ id: 'm_x9', s: 'mul', g: 3, title: '×9: ×10, then take one away',
  tip: '9 is one less than 10. 9 × 7 → 10 × 7 = 70, take away one 7 → 63. Check: the digits of 9s answers add to 9 (6 + 3).',
  gen(d, R) {
    const o = d === 0 ? R.i(1, 6) : d === 1 ? R.i(6, 10) : R.i(11, 19), [a, b] = order(R, 9, o), p = 9 * o, t = 10 * o;
    const how = ['9 is one less than 10. Do 10 × ' + o + ' first: ' + n(t) + '.'];
    if (o > 10) how.push('Take away one ' + o + ' in two hops: ' + less(t, 10) + ' = ' + (t - 10) + ', then ' + less(t - 10, o - 10) + ' = ' + B(p) + '.');
    else how.push('Take away one ' + o + ': ' + less(t, o) + ' = ' + B(p) + '.');
    if (o >= 2 && o <= 10) how.push('Check: ' + String(p)[0] + ' + ' + String(p)[1] + ' = 9, and ' + String(p)[0] + ' is one less than ' + o + '.');
    const traps = [{ v: t, c: 'm_x9', why: 'That is 10 groups of ' + o + '. Take one ' + o + ' away to get 9 groups.' },
                   { v: t - 9, c: 'm_x9', why: 'Take away one ' + o + ', not 9: you want 9 groups of ' + o + '.' }];
    if (p >= 18 && p <= 90 && rev(p) !== p && rev(p) >= 10) traps.push({ v: rev(p), c: 'm_x9', why: 'The digits are swapped. In the 9s, the tens digit is one less than the number you times by 9.' });
    traps.push({ v: p - 9, c: 'm_x9', why: 'One 9 short. Start from 10 × ' + o + ' and take one ' + o + ' away.' });
    return { text: B(X(a, b) + ' = ?'), ans: p, how, steps: trickSteps(9, o), traps };
  } },

{ id: 'm_x3x6', s: 'mul', g: 3, title: '×3 and ×6',
  tip: '×3 is a double plus one more group: 3 × 7 → 14 + 7 = 21. ×6 is ×5 plus one more group: 6 × 7 → 35 + 7 = 42.',
  gen(d, R) {
    const k = d === 0 ? 3 : d === 1 ? 6 : R.pick([3, 6]), o = d < 2 ? R.i(2, 10) : R.i(6, 12), [a, b] = order(R, k, o), p = k * o;
    const how = k === 3 ? ['Times 3 is a double plus one more group.', 'Double ' + o + ' is ' + (2 * o) + '. ' + (2 * o) + ' + ' + o + ' = ' + B(p) + '.']
      : ['Times 6 is times 5 plus one more group.', '5 × ' + o + ' = ' + (5 * o) + ' (half of ' + (10 * o) + '). ' + (5 * o) + ' + ' + o + ' = ' + B(p) + '.'];
    const traps = k === 3 ? [{ v: 2 * o, c: 'm_x3x6', why: 'That is just the double (×2). Add one more ' + o + ' for ×3.' }]
      : [{ v: 5 * o, c: 'm_x3x6', why: 'That is ×5. Add one more ' + o + ' for ×6.' }];
    traps.push({ v: p + o, c: 'm_x3x6', why: 'One ' + o + ' too many. ' + X(k, o) + ' is ' + k + ' groups of ' + o + '.' }, added(a, b));
    return { text: B(X(a, b) + ' = ?'), ans: p, how, steps: trickSteps(k, o), traps };
  } },

{ id: 'm_x7', s: 'mul', g: 3, title: '×7 is ×5 plus ×2',
  tip: 'Split 7 into 5 and 2. 7 × 6: 5 × 6 = 30 and 2 × 6 = 12, so 30 + 12 = 42. And 5, 6, 7, 8: 56 = 7 × 8.',
  gen(d, R) {
    const o = d === 0 ? R.i(2, 6) : d === 1 ? R.i(6, 10) : R.i(6, 12), p = 7 * o, story = d === 2 && R.chance(.5), [a, b] = order(R, 7, o);
    const how = ['Split 7 into 5 and 2.', '5 × ' + o + ' = ' + (5 * o) + ' and 2 × ' + o + ' = ' + (2 * o) + '.', (5 * o) + ' + ' + (2 * o) + ' = ' + B(p) + '.'];
    if (story) how[0] = o + ' weeks is ' + o + ' groups of 7 days: ' + X(o, 7) + '. Split 7 into 5 and 2.';
    if (o === 8) how.push('Remember 5, 6, 7, 8: 56 = 7 × 8.');
    return { text: story ? 'A week has 7 days. How many days are in ' + B(o + ' weeks') + '?' : B(X(a, b) + ' = ?'), ans: p, unit: story ? 'days' : undefined, how,
      steps: trickSteps(7, o),
      traps: [{ v: 5 * o, c: 'm_x7', why: 'That is only 5 groups. Add 2 more groups of ' + o + '.' },
              { v: p - o, c: 'm_x7', why: 'One ' + o + ' short. Use 5 groups plus 2 groups of ' + o + '.' },
              { v: p + o, c: 'm_x7', why: 'One ' + o + ' too many. Use 5 groups plus 2 groups of ' + o + '.' }, added(a, b)] };
  } },

{ id: 'm_squares', s: 'mul', g: 3, title: 'Square facts: 6 × 6, 7 × 7, 8 × 8',
  tip: 'A number times itself makes a square of dots. Learn them: 6 × 6 = 36, 7 × 7 = 49, 8 × 8 = 64, 9 × 9 = 81.',
  gen(d, R) {
    if (d === 0) {
      const q = R.i(2, 6), p = q * q, story = R.chance(.5);
      return { text: story ? 'A square of dots has ' + B(q + ' dots') + ' on each side. How many dots are there in all?' : B(X(q, q) + ' = ?'), vis: dotsSVG(q, q), ans: p,
        how: [X(q, q) + ' is a square: ' + q + ' rows of ' + q + '.', 'Count by ' + q + 's, ' + q + ' times: ' + list(q, q) + '. That is ' + B(p) + '.'],
        steps: [{ text: 'How many dots are in one row?', ans: q, vis: dotsSVG(q, q) }, { text: 'Count by ' + q + 's, ' + q + ' times: ' + B(list(q, q - 1) + ', ?'), ans: p }],
        traps: [{ v: 2 * q, c: 'm_groups', why: 'You added ' + q + ' and ' + q + '. ' + X(q, q) + ' is ' + q + ' rows of ' + q + '.' },
                { v: p - q, c: 'm_squares', why: 'One row short. Count by ' + q + 's once for each of the ' + q + ' rows.' }, { v: p + q, c: 'm_squares', why: 'One row too many. There are ' + q + ' rows.' }] };
    }
    if (d === 1) {
      const q = R.i(6, 12), p = q * q;
      const way = { 6: '6 × 6 is 5 sixes plus one more: 30 + 6 = ' + B(36) + '.', 7: '7 × 7 is 5 sevens plus 2 sevens: 35 + 14 = ' + B(49) + '.', 8: '8 × 8 is 8 doubled three times: 16, 32, ' + B(64) + '.',
        9: '9 × 9 is 10 nines take away one nine: 90 ' + MINUS + ' 9 = ' + B(81) + '.', 10: '10 × 10: put a zero on 10, ' + B(100) + '.', 11: '11 × 11 is 10 elevens plus one more: 110 + 11 = ' + B(121) + '.', 12: '12 × 12 is 10 twelves plus 2 twelves: 120 + 24 = ' + B(144) + '.' }[q];
      const tiles = R.chance(.4);
      return { text: tiles ? 'A square floor has ' + B(q + ' rows') + ' of tiles. Each row has ' + B(q + ' tiles') + '. How many tiles are there in all?' : B(X(q, q) + ' = ?'), ans: p, how: [X(q, q) + ' is a square fact. Know it by heart, or build it from a fact you know.', way],
        steps: trickSteps(q, q),
        traps: [{ v: 2 * q, c: 'm_groups', why: 'You added ' + q + ' and ' + q + '. Times means ' + q + ' groups of ' + q + '.' },
                { v: p - q, c: 'm_squares', why: 'One ' + q + ' short. ' + X(q, q) + ' is ' + q + ' groups of ' + q + '.' }, { v: p + q, c: 'm_squares', why: 'One ' + q + ' too many. ' + X(q, q) + ' is ' + q + ' groups of ' + q + '.' },
                { v: (q - 1) * (q - 1), c: 'm_squares', why: 'That is ' + X(q - 1, q - 1) + '. Check your square facts.' }] };
    }
    if (R.chance(.5)) {
      const q = R.i(4, 12), p = q * q;
      return { text: 'What number times itself makes ' + B(p) + '?', ans: q,
        how: ['Think of the square facts: which number, times itself, makes ' + p + '?', X(q, q) + ' = ' + p + ', so the number is ' + B(q) + '.'],
        steps: [{ text: B(X(q - 1, q - 1) + ' = ?'), ans: (q - 1) * (q - 1) }, { text: B(X(q, q) + ' = ?'), ans: p }],
        traps: [{ v: p / 2, c: 'm_squares', why: 'That is half of ' + p + '. Find a number that, times itself, makes ' + p + '.' },
                { v: q - 1, c: 'm_squares', why: X(q - 1, q - 1) + ' is ' + ((q - 1) * (q - 1)) + ', too small.' }, { v: q + 1, c: 'm_squares', why: X(q + 1, q + 1) + ' is ' + ((q + 1) * (q + 1)) + ', too big.' }] };
    }
    const q = R.i(3, 9), sq = q * q, p = q * (q + 1), [a, b] = order(R, q, q + 1);
    return { text: 'You know that ' + B(X(q, q) + ' = ' + sq) + '. So what is ' + B(X(a, b)) + '?', ans: p,
      how: [X(q, q + 1) + ' is ' + q + ' rows of ' + (q + 1) + ': the square ' + X(q, q) + ' plus one more column of ' + q + '.', sq + ' + ' + q + ' = ' + B(p) + '.'],
      steps: [{ text: 'How much more is ' + B((q + 1) + ' groups of ' + q) + ' than ' + B(q + ' groups of ' + q) + '?', ans: q }, { text: B(sq + ' + ' + q + ' = ?'), ans: p }],
      traps: [{ v: sq + 1, c: 'm_squares', why: 'One more group of ' + q + ', not one more dot.' }, { v: (q + 1) * (q + 1), c: 'm_squares', why: 'That is ' + X(q + 1, q + 1) + '. Start from ' + X(q, q) + ' and add one ' + q + '.' },
              { v: sq + q + 1, c: 'm_squares', why: 'Add one group of ' + q + ' to ' + sq + ', no more.' }] };
  } },

{ id: 'm_share', s: 'mul', g: 3, title: 'Dividing is sharing equally',
  tip: 'Dividing shares things into equal groups. 12 shared by 3 is 4 each, because 3 × 4 = 12. Every division has a times fact hiding in it.',
  gen(d, R) {
    if (d === 0) {
      const g = R.i(2, 5), e = R.i(2, 5), tot = g * e, w = R.pick(['cookies', 'stickers', 'marbles', 'grapes', 'cards']);
      return { text: B(g + ' friends') + ' share ' + B(tot + ' ' + w) + ' equally. How many ' + w + ' does each friend get?', vis: rowDots(tot), ans: e,
        how: ['Deal them out like cards: every round, each of the ' + g + ' friends gets one, so a round uses ' + g + '.', 'Count by ' + g + 's to ' + tot + ': ' + list(g, e) + '. That is ' + e + ' rounds, so each friend gets ' + B(e) + '.'],
        howVis: groupsSVG(g, e),
        steps: [{ text: 'Give each of the ' + B(g + ' friends') + ' one ' + w.slice(0, -1) + '. How many ' + w + ' is that?', ans: g },
                { text: 'Count by ' + g + 's up to ' + tot + '. How many ' + g + 's did you count?', ans: e }],
        traps: [{ v: tot - g, c: 'm_share', why: 'You took ' + g + ' away. Sharing means splitting ' + tot + ' into ' + g + ' equal groups.' },
                { v: e + 1, c: 'm_share', why: 'Check: ' + g + ' friends with ' + (e + 1) + ' each would need ' + (g * (e + 1)) + '.' }, { v: e - 1, c: 'm_share', why: 'There are some left. Keep dealing until all ' + tot + ' are shared.' }] };
    }
    if (d === 1) {
      const g = R.i(2, 6), e = R.i(2, 6), tot = g * e;
      return { text: B(tot + ' ÷ ' + g + ' = ?'), ans: e,
        how: [tot + ' ÷ ' + g + ' means share ' + tot + ' into ' + g + ' equal groups.', 'Think: ' + g + ' × what = ' + tot + '? ' + X(g, e) + ' = ' + tot + ', so each group gets ' + B(e) + '.'],
        howVis: groupsSVG(g, e),
        steps: [{ text: 'Count by ' + g + 's up to ' + tot + '. How many ' + g + 's did you count?', ans: e }, { text: B(g + ' × ? = ' + tot), ans: e }],
        traps: [{ v: tot - g, c: 'm_share', why: 'You took ' + g + ' away. Dividing shares ' + tot + ' into ' + g + ' equal groups.' },
                { v: e + 1, c: famOf(g, e), why: X(g, e + 1) + ' is ' + (g * (e + 1)) + ', not ' + tot + '.' }, { v: e - 1, c: famOf(g, e), why: X(g, e - 1) + ' is ' + (g * (e - 1)) + ', not ' + tot + '.' }] };
    }
    const e = R.i(3, 9), g = R.i(3, 9), tot = g * e, w = R.pick([['kids', 'teams of', 'teams'], ['eggs', 'boxes of', 'boxes'], ['chairs', 'rows of', 'rows'], ['flowers', 'bunches of', 'bunches'], ['crayons', 'packs of', 'packs']]);
    return { text: B(tot + ' ' + w[0]) + ' are put into ' + B(w[1] + ' ' + e) + '. How many ' + w[2] + ' are there?', ans: g,
      how: ['How many groups of ' + e + ' make ' + tot + '? That is ' + tot + ' ÷ ' + e + '.', 'Think: ' + e + ' × what = ' + tot + '? ' + X(e, g) + ' = ' + tot + ', so there are ' + B(g) + ' ' + w[2] + '.'],
      steps: [{ text: 'Count by ' + e + 's up to ' + tot + '. How many ' + e + 's did you count?', ans: g }, { text: B(e + ' × ? = ' + tot), ans: g }],
      traps: [{ v: tot - e, c: 'm_share', why: 'You took ' + e + ' away once. Find how many groups of ' + e + ' fit in ' + tot + '.' },
              { v: g + 1, c: famOf(e, g), why: X(e, g + 1) + ' is ' + (e * (g + 1)) + ', not ' + tot + '.' }, { v: g - 1, c: famOf(e, g), why: X(e, g - 1) + ' is ' + (e * (g - 1)) + ', not ' + tot + '.' }] };
  } },

{ id: 'm_divfam', s: 'mul', g: 3, title: 'Divide by thinking times',
  tip: 'To divide, find the times fact. 56 ÷ 7: 7 × what = 56? 7 × 8 = 56, so 56 ÷ 7 = 8. Three numbers, four facts.',
  gen(d, R) {
    const dv = d === 0 ? R.pick([2, 5, 10]) : d === 1 ? R.pick([3, 4, 6, 7, 8, 9]) : R.i(3, 12), q = d === 2 ? R.i(3, 12) : R.i(2, 10), tot = dv * q;
    const near = q > 6 ? 'Start from a fact you know: ' + X(dv, 5) + ' = ' + (5 * dv) + '. Count on by ' + dv + 's: ' + list(dv, q - 5, 5 * dv) + '. That is ' + q + ' groups.' : null;
    const slip = [{ v: q + 1, c: famOf(dv, q), why: X(dv, q + 1) + ' is ' + (dv * (q + 1)) + ', not ' + tot + '. Check the ' + dv + 's fact.' },
                  { v: q - 1, c: famOf(dv, q), why: X(dv, q - 1) + ' is ' + (dv * (q - 1)) + ', not ' + tot + '. Check the ' + dv + 's fact.' }];
    if (d < 2 || R.chance(.4)) {
      const how = ['Think times: ' + dv + ' × what = ' + tot + '?'];
      if (dv === 10) how.push(X(10, q) + ' = ' + tot + ' (take the zero off), so ' + tot + ' ÷ 10 = ' + B(q) + '.');
      else if (near) how.push(near, X(dv, q) + ' = ' + tot + ', so ' + tot + ' ÷ ' + dv + ' = ' + B(q) + '.');
      else how.push('Count by ' + dv + 's: ' + list(dv, q) + '. ' + X(dv, q) + ' = ' + tot + ', so ' + tot + ' ÷ ' + dv + ' = ' + B(q) + '.');
      const steps = (near && dv !== 10 ? [{ text: B(X(dv, 5) + ' = ?'), ans: 5 * dv }] : []).concat([{ text: B(dv + ' × ? = ' + tot), ans: q }]);
      return { text: B(tot + ' ÷ ' + dv + ' = ?'), ans: q, how, steps,
        traps: slip.concat([{ v: tot - dv, c: 'm_share', why: 'You took ' + dv + ' away. Dividing asks how many ' + dv + 's make ' + tot + '.' }]) };
    }
    const f = R.i(0, 2), text = f === 0 ? '? × ' + dv + ' = ' + tot : f === 1 ? dv + ' × ? = ' + tot : tot + ' ÷ ? = ' + q, ans = f === 2 ? dv : q;
    const how = [f === 2 ? 'Think: ' + q + ' times what = ' + tot + '?' : 'Think: ' + tot + ' ÷ ' + dv + ' = ?', 'The fact family is ' + dv + ', ' + q + ' and ' + tot + ': ' + X(dv, q) + ' = ' + tot + '. The missing number is ' + B(ans) + '.'];
    const steps = f === 2 ? [{ text: B(q + ' × ? = ' + tot), ans: dv }] : [{ text: B(tot + ' ÷ ' + dv + ' = ?'), ans: q }];
    const traps = f === 2 ? [{ v: dv + 1, c: famOf(q, dv), why: X(q, dv + 1) + ' is ' + (q * (dv + 1)) + ', not ' + tot + '.' }, { v: dv - 1, c: famOf(q, dv), why: X(q, dv - 1) + ' is ' + (q * (dv - 1)) + ', not ' + tot + '.' },
                            { v: tot - q, c: 'm_divfam', why: 'The box is what you divide ' + tot + ' by to get ' + q + '. Think ' + q + ' × ? = ' + tot + '.' }]
      : slip.concat([{ v: tot - dv, c: 'm_divfam', why: 'Think of the times fact, not a take away: ' + dv + ' × ? = ' + tot + '.' }]);
    return { text: B(text), ans, how, steps, traps };
  } },

{ id: 'm_xtens', s: 'mul', g: 3, title: 'Times tens and hundreds',
  tip: 'Do the small fact, then put the zeros back. 4 × 30: 4 × 3 = 12, one zero → 120. 6 × 700: 6 × 7 = 42, two zeros → 4,200.',
  gen(d, R) {
    let a = R.i(2, 9), b = R.i(2, 9);
    if (d === 2 && R.chance(.3)) {
      if ((a * b) % 10 === 0) return null;
      const z = R.pick([1, 2]), Bv = b * 10 ** z, p = a * Bv, f = a * b;
      return { text: B('? × ' + n(Bv) + ' = ' + n(p)), ans: a,
        how: ['Take the zeros off both big numbers and think of the small fact: ? × ' + b + ' = ' + f + '.', X(a, b) + ' = ' + f + ', and ' + X(a, Bv) + ' = ' + n(p) + '. The missing number is ' + B(a) + '.'],
        steps: [{ text: B('? × ' + b + ' = ' + f), ans: a }, { text: B(X(a, Bv) + ' = ?'), ans: p }],
        traps: [{ v: a * 10, c: 'm_xtens', why: (a * 10) + ' × ' + n(Bv) + ' would have one more zero. Count the zeros.' },
                { v: a + 1, c: famOf(b, a), why: 'Check the small fact: ? × ' + b + ' = ' + f + '.' }, { v: a - 1, c: famOf(b, a), why: 'Check the small fact: ? × ' + b + ' = ' + f + '.' }] };
    }
    const forceZero = (d === 1 && R.chance(.3)) || (d === 2 && R.chance(.4));
    if (forceZero) { a = 5; b = R.pick([2, 4, 6, 8]); if (R.chance(.5)) [a, b] = [b, a]; }
    const f = a * b; if (d === 0 && f % 10 === 0) return null;
    const z = d === 0 ? 1 : d === 1 ? (forceZero ? 1 : 2) : R.pick([1, 2]), Bv = b * 10 ** z, p = a * Bv, [x, y] = order(R, a, Bv), zz = z + ' ' + plural(z, 'zero');
    const how = ['Do the small fact first: ' + X(a, b) + ' = ' + f + '.'];
    if (f % 10 === 0) how.push('Careful: ' + f + ' already ends in 0. That zero belongs to the fact, so keep it.');
    how.push(n(Bv) + ' has ' + zz + ', so put ' + zz + ' on the end of ' + f + ': ' + B(n(p)) + '.');
    return { text: B(X(x, y) + ' = ?'), ans: p, how,
      steps: [{ text: B(X(a, b) + ' = ?'), ans: f }, { text: 'How many zeros are on the end of ' + B(n(Bv)) + '?', ans: z }, { text: B(X(x, y) + ' = ?'), ans: p }],
      traps: [{ v: p / 10, c: 'm_xtens', why: 'One zero is missing. Put ' + zz + ' on the end of ' + f + '.' }, { v: p * 10, c: 'm_xtens', why: 'One zero too many. ' + n(Bv) + ' has ' + zz + '.' },
              { v: (f - a) * 10 ** z, c: famOf(a, b), why: 'The zeros are right. Check the small fact ' + X(a, b) + '.' }] };
  } },

{ id: 'm_remain', s: 'mul', g: 4, title: 'Remainders: the leftovers',
  tip: 'Find the biggest times fact that fits, then see what is left. 17 ÷ 5: 5 × 3 = 15 fits, 17 ' + MINUS + ' 15 = 2 left, so 3 r 2. The leftover is always less than what you divide by.',
  gen(d, R) {
    if (d < 2 || R.chance(.35)) {
      const dv = d === 0 ? R.i(2, 5) : R.i(3, 9), q = d === 0 ? R.i(2, 5) : d === 1 ? R.i(2, 9) : R.i(6, 12), r = R.i(1, dv - 1), v = dv * q + r, base = dv * q;
      const story = d === 0 && R.chance(.5), w = R.pick(['stickers', 'marbles', 'grapes', 'cards', 'beads']);
      const text = story ? B(dv + ' friends') + ' share ' + B(v + ' ' + w) + ' equally. How many ' + w + ' does each friend get, and how many are left over? Use r for the leftovers.'
        : B(v + ' ÷ ' + dv + ' = ?') + ' Use r for the leftovers.';
      return { type: 'rem', text, vis: d === 0 ? rowDots(v) : undefined, ans: { q, r }, howVis: q <= 6 ? (story ? groupsSVG(dv, q, r) : groupsSVG(q, dv, r)) : undefined,
        how: ['Find the biggest ' + dv + 's fact that fits in ' + v + ': ' + X(dv, q) + ' = ' + base + '. (' + X(dv, q + 1) + ' = ' + (base + dv) + ' is too big.)',
              less(v, base) + ' = ' + r + ' left over. ' + r + ' is less than ' + dv + ', so no more groups fit.', 'So ' + v + ' ÷ ' + dv + ' = ' + B(q + ' r ' + r) + '.'],
        steps: [{ text: 'Count by ' + dv + 's. Stop before you go past ' + B(v) + '. What number do you stop at?', ans: base }, { text: B(less(v, base) + ' = ?'), ans: r },
                { type: 'rem', text: B(v + ' ÷ ' + dv + ' = ?') + ' Use r for the leftovers.', ans: { q, r } }],
        traps: [{ v: { q: q - 1, r: r + dv }, c: 'm_remain', why: 'A leftover of ' + (r + dv) + ' is enough for another group of ' + dv + '. Make one more group.' },
                { v: { q, r: 0 }, c: 'm_remain', why: 'Don’t forget the leftovers: type r and then how many are left.' },
                { v: { q: q + 1, r }, c: famOf(dv, q), why: X(dv, q + 1) + ' is ' + (base + dv) + ', more than ' + v + '. Check your ' + dv + 's facts.' }] };
    }
    const dv = R.i(3, 8), q = R.i(3, 9), r = R.i(1, dv - 1), v = dv * q + r, base = dv * q, ask = R.i(0, 2);
    const w = R.pick([['stickers', 'page', 'pages'], ['eggs', 'box', 'boxes'], ['kids', 'car', 'cars'], ['muffins', 'tray', 'trays'], ['cards', 'pack', 'packs']]);
    const ans = ask === 0 ? q : ask === 1 ? r : q + 1;
    const end = ask === 0 ? B(q) + ' ' + w[2] + ' are full. The ' + r + ' left over ' + (r === 1 ? 'does' : 'do') + ' not fill another ' + w[1] + '.'
      : ask === 1 ? 'The leftover is ' + B(r) + ' ' + w[0] + '.'
      : q + ' ' + w[2] + ' are full, and the ' + r + ' left over still need a ' + w[1] + ': ' + q + ' + 1 = ' + B(q + 1) + '.';
    const traps = ask === 0 ? [{ v: q + 1, c: 'm_remain', why: 'The last ' + w[1] + ' would have only ' + r + ', so it is not full.' }, { v: r, c: 'm_remain', why: 'That is the leftover. The question asks how many ' + w[2] + ' are full.' }]
      : ask === 1 ? [{ v: q, c: 'm_remain', why: 'That is how many ' + w[2] + ' are full. The question asks how many ' + w[0] + ' are left over.' }, { v: dv - r, c: 'm_remain', why: 'Take the biggest ' + dv + 's fact that fits away from ' + v + '.' }]
      : [{ v: q, c: 'm_remain', why: 'The ' + r + ' left over need a ' + w[1] + ' too.' }, { v: r, c: 'm_remain', why: 'That is the leftover. Count the ' + w[2] + ' you need.' }];
    return { text: 'There are ' + B(v + ' ' + w[0]) + '. Each ' + w[1] + ' holds ' + B(dv + ' ' + w[0]) + '. ' + (ask === 0 ? 'How many ' + w[2] + ' will be full?' : ask === 1 ? 'How many ' + w[0] + ' are left over?' : 'How many ' + w[2] + ' do you need for all the ' + w[0] + '?'), ans,
      how: [v + ' ÷ ' + dv + ': ' + X(dv, q) + ' = ' + base + ', with ' + r + ' left over. So ' + q + ' r ' + r + '.', end],
      steps: [{ text: 'Count by ' + dv + 's. Stop before you go past ' + B(v) + '. What number do you stop at?', ans: base }, { text: B(less(v, base) + ' = ?'), ans: r }],
      traps };
  } },

{ id: 'm_breakapart', s: 'mul', g: 4, title: 'Break apart: 14 × 6 = 10 × 6 + 4 × 6', paper: true,
  tip: 'Break the big number into tens and ones, times each part, then add. 14 × 6: 10 × 6 = 60 and 4 × 6 = 24, so 84.',
  gen(d, R) {
    let a, b;
    if (d === 0) { a = R.i(11, 19); b = R.i(2, 5); } else if (d === 1) { a = R.i(21, 49); b = R.i(3, 9); }
    else if (R.chance(.6)) { a = R.i(51, 99); b = R.i(3, 9); } else { a = R.i(101, 329); b = R.i(2, 4); }
    if (a % 10 === 0) return null;
    const parts = []; let rest = a; for (const pv of [100, 10, 1]) { const dg = Math.floor(rest / pv); if (dg) parts.push(dg * pv); rest -= dg * pv; }
    const prods = parts.map(x => x * b), p = a * b, U = a % 10, td = Math.floor(a / 10) % 10, [x, y] = order(R, a, b);
    const traps = [{ v: p - U * b + U, c: 'm_breakapart', why: 'You multiplied the ' + (a - U) + ' but not the ' + U + '. Every part gets × ' + b + '.' },
                   { v: p - b, c: famOf(U, b), why: 'Check the ones part: ' + X(U, b) + '.' }];
    if (td > 1) traps.push({ v: p - 10 * b, c: famOf(td, b), why: 'Check the tens part: ' + X(td * 10, b) + ' is ' + X(td, b) + ' with a zero on the end.' });
    const head = sum(prods.slice(0, -1)); if ((head % 100) + U * b >= 100) traps.push({ v: p - 100, c: 'a_regroup', why: 'Check the adding: ' + n(head) + ' + ' + (U * b) + ' goes past a hundred.' });
    const lines = parts.length > 2 ? [parts.map((v, i) => X(v, b) + ' = ' + n(prods[i])).join(', ')] : parts.map((v, i) => X(v, b) + ' = ' + n(prods[i]));
    return { text: 'Break it apart on paper: ' + B(X(x, y) + ' = ?'), ans: p,
      how: [X(a, b) + ' = ' + parts.map(v => X(v, b)).join(' + ')].concat(lines, [prods.map(n).join(' + ') + ' = ' + B(n(p))]),
      steps: parts.map((v, i) => ({ text: B(X(v, b) + ' = ?'), ans: prods[i] })).concat([{ text: B(prods.map(n).join(' + ') + ' = ?'), ans: p }]),
      traps };
  } },

{ id: 'm_x11', s: 'mul', g: 4, title: '×11 and ×12',
  tip: '43 × 11: split the digits, 4 _ 3, and put 4 + 3 = 7 in the middle: 473. ×12 is ×10 plus ×2: 12 × 7 = 70 + 14 = 84.',
  gen(d, R) {
    const twelve = (o) => {
      const p = 12 * o, [a, b] = order(R, 12, o);
      return { text: B(X(a, b) + ' = ?'), ans: p,
        how: ['12 is 10 + 2. ' + X(10, o) + ' = ' + n(10 * o) + ' and ' + X(2, o) + ' = ' + (2 * o) + '.', n(10 * o) + ' + ' + (2 * o) + ' = ' + B(n(p)) + '.'],
        steps: trickSteps(12, o),
        traps: [{ v: 10 * o, c: 'm_x11', why: 'That is only ×10. Add 2 × ' + o + ' too.' }, { v: 11 * o, c: 'm_x11', why: 'You added one ' + o + '. 12 is 10 + 2, so add two ' + o + 's.' }, added(a, b)] };
    };
    if (d === 0) {
      const o = R.i(2, 9), p = 11 * o, [a, b] = order(R, 11, o);
      return { text: B(X(a, b) + ' = ?'), ans: p,
        how: ['11 is 10 + 1: ' + X(10, o) + ' = ' + (10 * o) + ', plus one more ' + o + '.', (10 * o) + ' + ' + o + ' = ' + B(p) + '. (11 times a one-digit number writes the digit twice.)'],
        steps: trickSteps(11, o),
        traps: [{ v: 10 * o, c: 'm_x11', why: 'That is ×10. Add one more ' + o + ' for ×11.' }, added(a, b), { v: p + 11, c: 'm_x11', why: 'One 11 too many. ' + X(11, o) + ' is ' + o + ' groups of 11.' }] };
    }
    if (d === 1) return twelve(R.i(3, 12));
    if (R.chance(.4)) return twelve(R.i(13, 19));
    const t = R.i(1, 8), u = R.i(1, 9 - t), o = 10 * t + u, s = t + u, p = 11 * o, [a, b] = order(R, 11, o);
    return { text: B(X(a, b) + ' = ?'), ans: p,
      how: ['To times a two-digit number by 11, split its digits: ' + t + ' _ ' + u + '.', 'Put ' + t + ' + ' + u + ' = ' + s + ' in the middle: ' + B(p) + '.', 'Check: ' + (10 * o) + ' + ' + o + ' = ' + p + '.'],
      steps: [{ text: B(t + ' + ' + u + ' = ?'), ans: s }, { text: B((10 * o) + ' + ' + o + ' = ?'), ans: p }],
      traps: [{ v: 10 * o, c: 'm_x11', why: 'That is ×10. Add one more ' + o + ' for ×11.' }, { v: 100 * t + 10 * u + s, c: 'm_x11', why: 'The sum of the digits goes in the middle, between ' + t + ' and ' + u + '.' },
              { v: 100 * s + 10 * t + u, c: 'm_x11', why: 'The sum of the digits goes in the middle, not in front.' }] };
  } },

{ id: 'm_x5half', s: 'mul', g: 4, title: '×5 is ×10, then half',
  tip: '×5 is half of ×10. 48 × 5: 48 × 10 = 480, half of 480 is 240. Or half first: half of 48 is 24, then × 10 is 240.',
  gen(d, R) {
    let x;
    if (d === 0) { do { x = R.i(6, 24) * 2; } while (x % 10 === 0); }
    else if (d === 1) { if (R.chance(.5)) { do { x = R.i(26, 49) * 2; } while (x % 10 === 0); } else { do { x = R.i(13, 49); } while (x % 2 === 0 || x % 5 === 0); } }
    else if (R.chance(.5)) { do { x = R.i(51, 99); } while (x % 2 === 0 || x % 5 === 0); } else { do { x = R.i(51, 249) * 2; } while (x % 10 === 0); }
    const t = 10 * x, p = 5 * x, [a, b] = order(R, 5, x);
    const how = ['Times 5 is times 10, then half. ' + X(x, 10) + ' = ' + n(t) + '.', halfSay(t, true)];
    if (x % 2 === 0) how.splice(1, 0, 'Or halve first: half of ' + x + ' is ' + (x / 2) + ', and ' + X(x / 2, 10) + ' = ' + n(p) + '.');
    const traps = [{ v: t, c: 'm_x5half', why: 'That is ×10. Now take half of it.' }];
    if (x % 2 === 0) traps.push({ v: x / 2, c: 'm_x5half', why: 'You took half but forgot the ×10.' });
    traps.push({ v: p + (t >= 200 ? 50 : 5), c: 'f_half', why: 'Check the half: halve each part of ' + n(t) + ' and add.' }, { v: p - (t >= 200 ? 50 : 5), c: 'f_half', why: 'Check the half: halve each part of ' + n(t) + ' and add.' });
    return { text: B(X(a, b) + ' = ?'), ans: p, how,
      steps: [{ text: B(X(x, 10) + ' = ?'), ans: t }, { text: 'What is ' + B('half of ' + n(t)) + '?', ans: p }], traps };
  } },

{ id: 'm_dblhalf', s: 'mul', g: 4, title: 'Double and half',
  tip: 'Halve one number and double the other: the answer stays the same. 16 × 5 → 8 × 10 = 80. 25 × 12 → 50 × 6 → 100 × 3 = 300.',
  gen(d, R) {
    let a, b;
    if (d === 0) { a = R.i(6, 14) * 2; b = 5; if (a % 10 === 0) return null; }
    else if (d === 1) { if (R.chance(.6)) { a = 25; b = R.pick([4, 8, 12, 16, 6, 14, 18]); } else { a = 50; b = R.pick([4, 6, 8, 12, 14, 18]); } }
    else { const pr = R.pick([[15, [4, 6, 8, 12, 14, 16]], [35, [4, 6, 8, 12]], [45, [4, 6, 8]], [25, [16, 24, 28, 32, 36]], [5, [36, 48, 64, 86, 72]]]); a = pr[0]; b = R.pick(pr[1]); }
    const p = a * b; let x = b === 5 || b % 10 === 5 || b % 25 === 0 ? b : a, y = x === a ? b : a; const x0 = x, y0 = y;
    if (b === 5) { x = 5; y = a; }
    const chain = [], steps = [];
    for (let i = 0; i < 4 && (x % 10 !== 0 || (x === 50 && y > 2)) && y % 2 === 0; i++) { chain.push(X(x, y) + ' → ' + X(2 * x, y / 2)); steps.push({ text: B(X(x, y) + ' = ' + n(2 * x) + ' × ?'), ans: y / 2 }); x *= 2; y /= 2; }
    if (!chain.length) return null;
    steps.splice(2); steps.push({ text: B(X(x, y) + ' = ?'), ans: p });
    const [s1, s2] = R.chance(.5) ? [a, b] : [b, a];
    return { text: B(X(s1, s2) + ' = ?'), ans: p,
      how: ['Double the ' + (b === 5 ? 5 : x0) + ' and halve the ' + (b === 5 ? a : y0) + ' until the problem is easy.', chain.join(', ') + '.', X(x, y) + ' = ' + B(n(p)) + '.'],
      steps,
      traps: [{ v: p / 4, c: 'm_dblhalf', why: 'You halved both numbers. When you halve one, double the other.' }, { v: p * 4, c: 'm_dblhalf', why: 'You doubled both numbers. When you double one, halve the other.' },
              { v: p - x, c: x === 10 ? 'm_x2510' : 'm_xtens', why: 'The double and half were right. Check the last step: ' + X(x, y) + '.' }] };
  } },

{ id: 'm_tensxtens', s: 'mul', g: 4, title: 'Tens times tens',
  tip: 'Multiply the front digits, then add all the zeros. 30 × 40: 3 × 4 = 12, two zeros → 1,200. 200 × 30: 2 × 3 = 6, three zeros → 6,000.',
  gen(d, R) {
    let a = R.i(2, 9), b = R.i(2, 9), za = 1, zb = 1;
    if (d === 0 && (a * b) % 10 === 0) return null;
    if (d === 1) { if (R.chance(.5)) za = 2; else { a = 5; b = R.pick([2, 4, 6, 8]); } }
    if (d === 2) {
      if (R.chance(.25)) {
        if ((a * b) % 10 === 0) return null;
        za = R.pick([1, 2]); const ans = a * 10 ** za, Bv = b * 10, p = ans * Bv, f = a * b;
        return { text: B('? × ' + Bv + ' = ' + n(p)), ans,
          how: ['Think of the small fact: ' + a + ' × ' + b + ' = ' + f + '.', n(p) + ' has ' + (za + 1) + ' zeros after the ' + f + '. ' + Bv + ' gives one of them, so the missing number has ' + za + ': ' + B(n(ans)) + '.'],
          steps: [{ text: B('? × ' + b + ' = ' + f), ans: a }, { text: 'How many zeros does ' + B(n(p)) + ' have after the ' + f + '?', ans: za + 1 }, { text: B('? × ' + Bv + ' = ' + n(p)), ans }],
          traps: [{ v: ans * 10, c: 'm_tensxtens', why: 'One zero too many. Count the zeros in ' + n(p) + ' and take away the one from ' + Bv + '.' }, { v: ans / 10, c: 'm_tensxtens', why: 'One zero short. ' + Bv + ' only gives one zero.' },
                  { v: (a + 1) * 10 ** za, c: famOf(a, b), why: 'Check the small fact: ? × ' + b + ' = ' + f + '.' }] };
      }
      za = R.i(1, 3); zb = za === 3 ? 1 : R.i(1, 2);
    }
    const f = a * b, z = za + zb, A = a * 10 ** za, Bv = b * 10 ** zb, p = A * Bv, [x, y] = R.chance(.5) ? [A, Bv] : [Bv, A];
    const how = ['Multiply the front digits: ' + X(a, b) + ' = ' + f + '.'];
    if (f % 10 === 0) how.push('Careful: ' + f + ' already ends in 0. That zero is part of the fact; keep it.');
    how.push('Count the zeros: ' + n(A) + ' has ' + za + ' and ' + n(Bv) + ' has ' + zb + ', so ' + z + ' zeros. Put them on the end of ' + f + ': ' + B(n(p)) + '.');
    return { text: B(X(x, y) + ' = ?'), ans: p, how,
      steps: [{ text: B(X(a, b) + ' = ?'), ans: f }, { text: 'How many zeros do ' + B(n(A)) + ' and ' + B(n(Bv)) + ' have in all?', ans: z }, { text: B(X(x, y) + ' = ?'), ans: p }],
      traps: [{ v: p / 10, c: 'm_tensxtens', why: 'One zero short. Count the zeros in both numbers: ' + z + ' in all.' }, { v: p * 10, c: 'm_tensxtens', why: 'One zero too many. Count the zeros in both numbers: ' + z + ' in all.' },
              { v: (f - a) * 10 ** z, c: famOf(a, b), why: 'The zeros are right. Check the small fact ' + X(a, b) + '.' }] };
  } },

{ id: 'm_divbig', s: 'mul', g: 4, title: 'Divide big numbers by splitting', paper: true,
  tip: 'Split the big number into parts that divide easily, then add the answers. 84 ÷ 4: 80 ÷ 4 = 20 and 4 ÷ 4 = 1, so 21.',
  gen(d, R) {
    let dv, q;
    if (d === 0) { dv = R.i(2, 4); do { q = R.i(11, 33); } while (Math.floor(q / 10) * 10 * dv >= 100 || (q % 10) * dv >= 10 || q % 10 === 0); }
    else if (d === 1) { dv = R.i(3, 6); do { q = R.i(12, 29); } while (dv * q >= 100 || (q % 10) * dv < 10); }
    else { dv = R.i(3, 8); q = R.i(21, Math.floor(999 / dv)); if (q % 10 === 0) q++; }
    /* split q by place value; each part of v is dv times a part of q, so it divides neatly */
    const v = dv * q, qs = [Math.floor(q / 100) * 100, Math.floor(q / 10) % 10 * 10, q % 10].filter(x => x), vs = qs.map(x => x * dv);
    const last = vs[vs.length - 1], qb = qs[qs.length - 1], A = v - last, qa = q - qb;
    const one = (x, i) => n(x) + ' ÷ ' + dv + ' = ' + qs[i] + (qs.length < 3 ? '   (' + X(dv, qs[i]) + ' = ' + n(x) + ')' : '');
    return { text: 'Split it on paper: ' + B(v + ' ÷ ' + dv + ' = ?'), ans: q,
      hint: 'Split ' + v + ' into ' + vs.map(n).join(' + ') + '. Each part is easy to divide by ' + dv + '.',
      how: [v + ' ÷ ' + dv + ' = ' + vs.map(x => n(x) + ' ÷ ' + dv).join(' + ')].concat(qs.length < 3 ? vs.map(one) : [vs.map(one).join(', ')], [qs.join(' + ') + ' = ' + B(q)]),
      steps: vs.map((x, i) => ({ text: B(n(x) + ' ÷ ' + dv + ' = ?'), ans: qs[i] })).concat([{ text: B(qs.join(' + ') + ' = ?'), ans: q }]),
      traps: [{ v: qa + last, c: 'm_divbig', why: 'You split ' + v + ', but the ' + last + ' needs dividing by ' + dv + ' too.' },
              { v: q + 1, c: famOf(dv, qb), why: 'Check ' + last + ' ÷ ' + dv + ': ' + dv + ' × ? = ' + last + '.' }, { v: q - 1, c: famOf(dv, qb), why: 'Check ' + last + ' ÷ ' + dv + ': ' + dv + ' × ? = ' + last + '.' },
              { v: q + 10, c: 'm_divfam', why: 'Check ' + n(A) + ' ÷ ' + dv + ': ' + dv + ' × ? = ' + n(A) + '.' }] };
  } },

{ id: 'm_x25', s: 'mul', g: 4, title: '×25: ×100, then ÷4',
  tip: '25 is a quarter of 100. ×25 is ×100, then ÷4 (half, then half again). 16 × 25: 1,600 → 800 → 400. Like 16 quarters = $4.',
  gen(d, R) {
    let x;
    if (d === 0) x = R.pick([2, 3, 4, 5, 6, 8, 12, 16, 20]);
    else if (d === 1) x = R.chance(.5) ? R.i(3, 12) * 4 : R.pick([14, 18, 22, 26, 30, 34, 38, 42, 46]);
    else if (R.chance(.6)) { do { x = R.i(13, 99); } while (x % 4 === 0 || x % 10 === 0); } else x = R.i(26, 99) * 4;
    const p = 25 * x, h = 100 * x, [a, b] = order(R, 25, x);
    const traps = [{ v: h, c: 'm_x25', why: 'That is ×100. Now divide by 4: half, then half again.' }, { v: h / 2, c: 'm_x25', why: 'You halved once (that is ×50). Halve once more.' }];
    if (x % 4 === 0) traps.push({ v: x / 4, c: 'm_x25', why: 'You did ÷4 but forgot the ×100.' });
    if (x % 4 === 0) return { text: B(X(a, b) + ' = ?'), ans: p,
      how: ['×25 is ×100, then ÷4. You can do the ÷4 first.', x + ' ÷ 4 = ' + (x / 4) + ' (' + x + ' quarters make ' + (x / 4) + ' ' + plural(x / 4, 'dollar') + ').', X(x / 4, 100) + ' = ' + B(n(p)) + '.'],
      steps: [{ text: B(x + ' ÷ 4 = ?'), ans: x / 4 }, { text: B(X(x / 4, 100) + ' = ?'), ans: p }], traps };
    return { text: B(X(a, b) + ' = ?'), ans: p,
      how: ['×25 is ×100, then ÷4 (4 quarters make a dollar).', X(x, 100) + ' = ' + n(h) + '.', '÷4 is half, then half again: ' + n(h) + ' → ' + n(h / 2) + ' → ' + B(n(p)) + '.'],
      steps: [{ text: B(X(x, 100) + ' = ?'), ans: h }, { text: 'What is ' + B('half of ' + n(h)) + '?', ans: h / 2 }, { text: 'What is ' + B('half of ' + n(h / 2)) + '?', ans: p }], traps };
  } },
/* ======================= Time ======================= */
{ id: 't_hour', s: 'time', g: 2, title: 'O’clock and half past',
  tip: 'The short hand shows the hour. The long hand shows the minutes. Long hand on the 12: o’clock. Long hand on the 6: half past, 30 minutes.',
  gen(d, R) {
    const h = R.i(1, 12), nx = NX(h);
    if (d < 2 || R.chance(.4)) {
      const m = d === 0 ? 0 : d === 1 ? 30 : R.pick([0, 30]);
      return { type: 'time', text: 'What time does the clock show?', vis: clockSVG(h, m), ans: tm(h, m),
        how: [hourSay(h, m), m ? 'The long hand points to the 6. It has gone halfway around: half past, 30 minutes.' : 'The long hand points to the 12, so it is o’clock.', 'It is ' + B(fmtT(h, m)) + '.'],
        steps: readSteps(h, m), traps: clockTraps(h, m) };
    }
    const m = R.pick([0, 30]), form = m ? R.i(0, 2) : R.i(0, 1);
    if (form === 1) return { type: 'time', ans: tm(h, m),
      text: m ? 'The long hand points to the ' + B(6) + '. The short hand is ' + B('halfway between the ' + h + ' and the ' + nx) + '. What time is it?'
              : 'The long hand points to the ' + B(12) + '. The short hand points to the ' + B(h) + '. What time is it?',
      how: [hourSay(h, m), m ? 'The long hand on the 6 means half past: 30 minutes.' : 'The long hand on the 12 means o’clock.', 'It is ' + B(fmtT(h, m)) + '.'],
      steps: [{ text: m ? 'The long hand is on the 6. How many minutes past the hour is that?' : 'The long hand is on the 12. How many minutes past the hour is that?', ans: m, unit: 'minutes' },
              { type: 'time', text: 'The long hand shows ' + m + ' minutes. ' + (m ? 'The short hand is halfway between the ' + h + ' and the ' + nx : 'The short hand points to the ' + h) + '. What time is it?', ans: tm(h, m) }],
      traps: m ? [{ v: tm(nx, 30), c: 't_hour', why: 'Halfway between the ' + h + ' and the ' + nx + ', the hour is the one the short hand has passed: ' + h + '.' }, { v: tm(h, 6), c: 't_hour', why: 'The long hand on the 6 means 30 minutes, not 6.' }, { v: tm(6, (h % 12) * 5), c: 't_hour', why: 'The short hand shows the hour; the long hand shows the minutes.' }]
               : [{ v: tm(h, 12), c: 't_hour', why: 'The long hand on the 12 means 0 minutes: o’clock.' }, { v: tm(12, (h % 12) * 5), c: 't_hour', why: 'The short hand shows the hour; the long hand shows the minutes.' }] };
    if (form === 2) return { type: 'time', ans: tm(h, 30),
      text: 'What time is it ' + B('half an hour before ' + nx + ' o’clock') + '?',
      how: ['Half an hour is 30 minutes. 30 minutes before ' + nx + ':00 is halfway through the hour before.', 'That is half past ' + h + ': ' + B(fmtT(h, 30)) + '.'],
      steps: [{ text: 'How many minutes are in half an hour?', ans: 30, unit: 'minutes' }, { type: 'time', text: 'What time is 30 minutes before ' + B(nx + ':00') + '?', ans: tm(h, 30) }],
      traps: [{ v: tm(nx, 30), c: 't_hour', why: 'Before ' + nx + ' o’clock, the hour is still ' + h + '.' }, { v: tm(nx, 0), c: 't_hour', why: 'Go back half an hour from ' + nx + ':00.' }] };
    return { type: 'time', ans: tm(h, m), text: 'Type the time for ' + B(m ? 'half past ' + h : h + ' o’clock') + '.',
      how: m ? ['Half past ' + h + ' means half an hour, 30 minutes, after ' + h + ':00.', 'So it is ' + B(fmtT(h, 30)) + '.'] : [h + ' o’clock means ' + h + ' hours and 0 minutes.', 'We write it ' + B(fmtT(h, 0)) + '.'],
      steps: m ? [{ text: 'How many minutes past the hour is half past?', ans: 30, unit: 'minutes' }, { type: 'time', text: 'So what time is half past ' + h + '?', ans: tm(h, 30) }] : [],
      traps: m ? [{ v: tm(nx, 30), c: 't_hour', why: 'Half past ' + h + ' comes after ' + h + ' o’clock, so the hour is ' + h + '.' }, { v: tm(h, 50), c: 't_hour', why: 'Half past means 30 minutes, half of the 60 in an hour.' }]
               : [{ v: tm(h, 12), c: 't_hour', why: 'O’clock means 0 minutes: type the hour, then 00.' }] };
  } },

{ id: 't_quarter', s: 'time', g: 2, title: 'Quarter past and quarter to',
  tip: 'Long hand on the 3: quarter past, 15 minutes. Long hand on the 9: quarter to the next hour, 45 minutes. At quarter to, the hour has not changed yet.',
  gen(d, R) {
    const h = R.i(1, 12), nx = NX(h), pv = PV(h);
    if (d < 2 || R.chance(.4)) {
      const m = d === 0 ? 15 : d === 1 ? 45 : R.pick([15, 45]);
      const traps = clockTraps(h, m).concat(m === 45 ? [{ v: tm(h, 15), c: 't_quarter', why: 'The long hand on the 9 is 45 minutes. On the 3 it would be 15.' }] : [{ v: tm(h, 45), c: 't_quarter', why: 'The long hand on the 3 is 15 minutes. On the 9 it would be 45.' }]);
      return { type: 'time', text: 'What time does the clock show?', vis: clockSVG(h, m), ans: tm(h, m),
        how: [m === 15 ? 'The long hand points to the 3. Count by 5s: 5, 10, 15. That is 15 minutes, a quarter of the way around: quarter past.'
                       : 'The long hand points to the 9. Count by 5s: 45 minutes. 15 more minutes would make ' + nx + ' o’clock, so it is quarter to ' + nx + '.',
              hourSay(h, m), 'It is ' + B(fmtT(h, m)) + '.'],
        steps: readSteps(h, m), traps };
    }
    const m = R.pick([15, 45]), words = R.chance(.6);
    if (m === 15) return { type: 'time', ans: tm(h, 15),
      text: words ? 'Type the time for ' + B('quarter past ' + h) + '.' : 'What time is it ' + B('15 minutes after ' + h + ' o’clock') + '?',
      how: ['Quarter past ' + h + ' is a quarter of an hour, 15 minutes, after ' + h + ':00.', 'So it is ' + B(fmtT(h, 15)) + '.'],
      steps: [{ text: 'How many minutes are in a quarter of an hour?', ans: 15, unit: 'minutes' }, { type: 'time', text: 'What time is 15 minutes after ' + B(h + ':00') + '?', ans: tm(h, 15) }],
      traps: [{ v: tm(h, 45), c: 't_quarter', why: 'Quarter past is 15 minutes after the hour, not 45.' }, { v: tm(pv, 45), c: 't_quarter', why: 'That is quarter to ' + h + ', before ' + h + ' o’clock. Quarter past is after.' }, { v: tm(h, 25), c: 't_quarter', why: 'A quarter of an hour is 15 minutes: 60 ÷ 4.' }] };
    return { type: 'time', ans: tm(h, 45),
      text: words ? 'Type the time for ' + B('quarter to ' + nx) + '.' : 'What time is it ' + B('15 minutes before ' + nx + ' o’clock') + '?',
      how: ['Quarter to ' + nx + ' means 15 minutes before ' + nx + ':00, so the hour is still ' + h + '.', 'An hour is 60 minutes, and 60 ' + MINUS + ' 15 = 45. So it is 45 minutes past ' + h + ': ' + B(fmtT(h, 45)) + '.'],
      steps: [{ text: 'An hour has 60 minutes. ' + B('60 ' + MINUS + ' 15 = ?'), ans: 45 }, { type: 'time', text: 'What time is 45 minutes after ' + B(h + ':00') + '?', ans: tm(h, 45) }],
      traps: [{ v: tm(nx, 45), c: 't_quarter', why: 'Quarter to ' + nx + ' comes before ' + nx + ' o’clock, so the hour is still ' + h + '.' }, { v: tm(nx, 15), c: 't_quarter', why: 'Quarter to means 15 minutes before ' + nx + ', not after.' },
              { v: tm(h, 15), c: 't_quarter', why: 'That is quarter past ' + h + '. Quarter to is 15 minutes before the next hour.' }] };
  } },

{ id: 't_five', s: 'time', g: 2, title: 'Time to 5 minutes', pre: ['p_skip'],
  tip: 'Each number on the clock is 5 more minutes for the long hand: the 1 is 5, the 2 is 10, the 7 is 35, the 11 is 55. Count by 5s from the 12.',
  gen(d, R) {
    const h = R.i(1, 12), nx = NX(h); let m;
    do { m = R.i(1, 11) * 5; } while ([15, 30, 45].includes(m) && R.chance(.75));
    if (d === 2 && R.chance(.5)) {
      if (m < 30) return { type: 'time', ans: tm(h, m), text: 'Type the time for ' + B(m + ' minutes past ' + h) + '.',
        how: [m + ' minutes past ' + h + ' means ' + m + ' minutes after ' + h + ':00.', 'So it is ' + B(fmtT(h, m)) + '.'],
        traps: [{ v: tm(nx, m), c: 't_five', why: 'Past ' + h + ' means after ' + h + ' o’clock, so the hour is ' + h + '.' }, { v: tm(h, 60 - m), c: 't_five', why: m + ' minutes past is ' + m + ' minutes after the hour.' }] };
      const to = 60 - m;
      return { type: 'time', ans: tm(h, m), text: 'Type the time for ' + B(to + ' minutes to ' + nx) + '.',
        how: [to + ' minutes to ' + nx + ' means ' + to + ' minutes before ' + nx + ':00, so the hour is still ' + h + '.', '60 ' + MINUS + ' ' + to + ' = ' + m + ', so it is ' + m + ' minutes past ' + h + ': ' + B(fmtT(h, m)) + '.'],
        steps: [{ text: 'An hour has 60 minutes. ' + B('60 ' + MINUS + ' ' + to + ' = ?'), ans: m }, { type: 'time', text: 'What time is ' + m + ' minutes after ' + B(h + ':00') + '?', ans: tm(h, m) }],
        traps: [{ v: tm(nx, to), c: 't_five', why: '“To” means before ' + nx + ' o’clock. Count back ' + to + ' minutes from ' + nx + ':00.' }, { v: tm(nx, m), c: 't_quarter', why: 'Before ' + nx + ' o’clock, the hour is still ' + h + '.' },
                { v: tm(h, to), c: 't_five', why: 'That is ' + to + ' minutes past ' + h + '. “To” means before the next hour.' }] };
    }
    if (d === 2) m = R.pick([35, 40, 50, 55]);
    return { type: 'time', text: 'What time does the clock show?', vis: clockSVG(h, m, { fives: d === 0 }), ans: tm(h, m),
      how: [minSay(m), hourSay(h, m), 'It is ' + B(fmtT(h, m)) + '.'], steps: readSteps(h, m, d === 0), traps: clockTraps(h, m) };
  } },

{ id: 't_minute', s: 'time', g: 3, title: 'Time to the minute',
  tip: 'Count by 5s to the last number the long hand passed, then count on by 1s for each little mark. The hour is the number the short hand passed.',
  gen(d, R) {
    const h = R.i(1, 12), nx = NX(h); let m;
    if (d === 0) m = R.i(1, 5) * 5 + R.i(1, 4); else if (d === 1) { do { m = R.i(6, 58); } while (m % 5 === 0); } else { do { m = R.i(41, 59); } while (m % 5 === 0); }
    const k = Math.floor(m / 5), e = m % 5, to = 60 - m;
    if (d === 2 && R.chance(.4)) return { type: 'time', ans: tm(h, m), text: 'Type the time for ' + B(to + ' minutes to ' + nx) + '.',
      how: [to + ' minutes to ' + nx + ' means ' + to + ' minutes before ' + nx + ':00, so the hour is still ' + h + '.', '60 ' + MINUS + ' ' + to + ' = ' + m + ', so it is ' + B(fmtT(h, m)) + '.'],
      steps: [{ text: B('60 ' + MINUS + ' ' + to + ' = ?'), ans: m }, { type: 'time', text: 'What time is ' + m + ' minutes after ' + B(h + ':00') + '?', ans: tm(h, m) }],
      traps: [{ v: tm(nx, m), c: 't_quarter', why: 'Before ' + nx + ' o’clock, the hour is still ' + h + '.' }, { v: tm(h, to), c: 't_minute', why: '“To” means before the next hour: 60 ' + MINUS + ' ' + to + '.' }, { v: tm(nx, to), c: 't_minute', why: 'Count back ' + to + ' minutes from ' + nx + ':00.' }] };
    const traps = [{ v: tm(h, m + 1), c: 't_minute', why: 'Close! Count the little marks one at a time after the ' + k + '.' }, { v: tm(h, m - 1), c: 't_minute', why: 'Close! Count the little marks one at a time after the ' + k + '.' },
                   { v: tm(h, 5 * (k + 1) + e > 59 ? m - 5 : m + 5), c: 't_five', why: 'Count by 5s to the last number the long hand has passed, then the little marks.' }];
    if (m > 30) traps.push({ v: tm(nx, m), c: 't_quarter', why: 'The short hand is close to the ' + nx + ' but has not reached it, so the hour is still ' + h + '.' });
    return { type: 'time', text: 'What time does the clock show?', vis: clockSVG(h, m), ans: tm(h, m),
      how: [minSay(m), hourSay(h, m), 'It is ' + B(fmtT(h, m)) + '.'],
      steps: [{ text: 'The long hand has passed the ' + k + '. Count by 5s to the ' + k + '. How many minutes is that?', ans: 5 * k, vis: clockSVG(h, m) },
              { text: 'The ' + k + ' is ' + (5 * k) + ' minutes. Count 1 more minute for each little mark from the ' + k + ' to the long hand. How many minutes is that?', ans: m, vis: clockSVG(h, m) },
              { text: 'What hour does the short hand show?', ans: h, vis: clockSVG(h, m) }, { type: 'time', text: 'So what time is it?', ans: tm(h, m), vis: clockSVG(h, m) }],
      traps };
  } },

{ id: 't_facts', s: 'time', g: 3, title: 'Minutes and hours',
  tip: '1 hour = 60 minutes, so half an hour = 30 and a quarter hour = 15. 90 minutes = 60 + 30 = 1 hour 30 minutes. 1 minute = 60 seconds. 1 day = 24 hours.',
  gen(d, R) {
    const hund = 'An hour is 60 minutes, not 100.';
    const Q = (text, ans, how, traps, steps) => ({ text, ans, how, traps, steps, unit: /How many seconds/.test(text) ? 'seconds' : /hours are/.test(text) ? 'hours' : 'minutes' });
    const toHM = (t) => { const a = dur(t), traps = [{ v: tm(0, t - 60 * a.h), c: 't_facts', why: 'You took out ' + a.h + ' ' + plural(a.h, 'hour') + '. Count ' + plural(a.h, 'it', 'them') + ' in the hours.' }];
      if (t >= 100 && t % 100 < 60) traps.push({ v: tm(Math.floor(t / 100), t % 100), c: 't_facts', why: hund + ' Take away 60s, not 100s.' });
      if (a.m + 60 < 100 && a.h >= 2) traps.push({ v: tm(a.h - 1, a.m + 60 < 60 ? a.m + 60 : a.m), c: 't_facts', why: 'There are still 60 minutes in what is left. Make another hour.' });
      return { type: 'time', dur: true, text: 'Write ' + B(t + ' minutes') + ' as hours and minutes. Type hours, then minutes.', ans: a,
        how: ['Take out 60 minutes for each hour: ' + (a.h > 1 ? a.h + ' × 60 = ' + 60 * a.h : '60') + ' minutes is ' + a.h + ' ' + plural(a.h, 'hour') + '.', less(t, 60 * a.h) + ' = ' + a.m + ' minutes left. So ' + t + ' minutes = ' + B(a.h + ' h ' + a.m + ' min') + '.'],
        steps: [{ text: 'An hour is 60 minutes. How many whole hours fit in ' + B(t + ' minutes') + '?', ans: a.h, unit: plural(a.h, 'hour') }, { text: B(less(t, 60 * a.h) + ' = ?'), ans: a.m, unit: 'minutes' }], traps }; };
    if (d === 0) return R.pick([
      () => Q('How many minutes are in ' + B('1 hour') + '?', 60, ['The long hand goes all the way around once in an hour, past 60 little marks.', '1 hour = ' + B(60) + ' minutes.'], [{ v: 100, c: 't_facts', why: hund }, { v: 12, c: 't_facts', why: 'There are 12 numbers on the clock, but each one is 5 minutes.' }]),
      () => Q('How many minutes are in ' + B('half an hour') + '?', 30, ['An hour is 60 minutes. Half of 60 is ' + B(30) + '.'], [{ v: 50, c: 't_facts', why: 'Half of 100 is 50, but an hour is 60 minutes.' }, { v: 15, c: 't_facts', why: 'That is a quarter of an hour. Half is 2 quarters.' }]),
      () => Q('How many minutes are in ' + B('a quarter of an hour') + '?', 15, ['A quarter is one of 4 equal parts. 60 ÷ 4 = ' + B(15) + '.', 'On the clock, the long hand goes from the 12 to the 3.'], [{ v: 25, c: 't_facts', why: 'A quarter of a dollar is 25¢, but an hour is 60 minutes: 60 ÷ 4.' }, { v: 30, c: 't_facts', why: 'That is half an hour. A quarter is half of that.' }]),
      () => Q('How many minutes are in ' + B('three quarters of an hour') + '?', 45, ['A quarter of an hour is 15 minutes.', '3 quarters: 15 + 15 + 15 = ' + B(45) + '.'], [{ v: 75, c: 't_facts', why: 'Three quarters of a dollar is 75¢, but a quarter hour is 15 minutes.' }, { v: 30, c: 't_facts', why: 'That is 2 quarters. Add one more 15.' }]),
      () => Q('How many seconds are in ' + B('1 minute') + '?', 60, ['1 minute = ' + B(60) + ' seconds. That is the same as the number of minutes in an hour.'], [{ v: 100, c: 't_facts', why: 'A minute has 60 seconds, not 100.' }]),
      () => Q('How many hours are in ' + B('1 day') + '?', 24, ['A day has 12 hours of AM and 12 hours of PM.', '12 + 12 = ' + B(24) + '.'], [{ v: 12, c: 't_facts', why: 'The clock goes around twice in a day: 12 + 12.' }]),
      () => { const k = R.i(2, 3); return Q('How many minutes are in ' + B(k + ' hours') + '?', 60 * k, ['Each hour is 60 minutes.', list(60, k) + '. That is ' + B(60 * k) + ' minutes.'], [{ v: 100 * k, c: 't_facts', why: hund }, { v: 60 * k - 60, c: 't_facts', why: 'Add 60 once for each of the ' + k + ' hours.' }]); },
      () => { const h = R.i(1, 11); return Q('How many minutes is it from ' + B(h + ':00') + ' to ' + B((h + 1) + ':00') + '?', 60, ['From one o’clock time to the next is 1 hour.', '1 hour = ' + B(60) + ' minutes.'], [{ v: 100, c: 't_facts', why: hund }, { v: 1, c: 't_facts', why: 'That is 1 hour. How many minutes is that?' }]); }])();
    if (d === 1) return R.pick([
      () => { const k = R.i(2, 5); return Q('How many minutes are in ' + B(k + ' hours') + '?', 60 * k, ['Each hour is 60 minutes, so do ' + X(k, 60) + '.', X(k, 6) + ' = ' + (6 * k) + ', then put the zero back: ' + B(60 * k) + '.'], [{ v: 100 * k, c: 't_facts', why: hund }, { v: 6 * k, c: 'm_xtens', why: 'Put the zero back: 60 is 6 tens.' }], [{ text: B(X(k, 6) + ' = ?'), ans: 6 * k }, { text: B(X(k, 60) + ' = ?'), ans: 60 * k }]); },
      () => { const m = R.i(1, 11) * 5; return Q('How many minutes are in ' + B('1 hour ' + m + ' minutes') + '?', 60 + m, ['1 hour is 60 minutes.', '60 + ' + m + ' = ' + B(60 + m) + '.'], [{ v: 100 + m, c: 't_facts', why: hund }, { v: 1 + m, c: 't_facts', why: 'Change the 1 hour into 60 minutes first.' }]); },
      () => toHM(R.i(13, 23) * 5)])();
    return R.pick([
      () => { const h = R.i(2, 4), m = R.i(1, 11) * 5; return Q('How many minutes are in ' + B(h + ' hours ' + m + ' minutes') + '?', 60 * h + m, [h + ' hours = ' + X(h, 60) + ' = ' + (60 * h) + ' minutes.', (60 * h) + ' + ' + m + ' = ' + B(60 * h + m) + '.'], [{ v: 100 * h + m, c: 't_facts', why: hund }, { v: 60 * h, c: 't_facts', why: 'Add the ' + m + ' minutes too.' }], [{ text: B(X(h, 60) + ' = ?'), ans: 60 * h }, { text: B((60 * h) + ' + ' + m + ' = ?'), ans: 60 * h + m }]); },
      () => toHM(R.i(25, 47) * 5),
      () => { const k = R.i(2, 3); return Q('How many hours are in ' + B(k + ' days') + '?', 24 * k, ['Each day is 24 hours.', X(k, 24) + ': ' + X(k, 20) + ' = ' + (20 * k) + ' and ' + X(k, 4) + ' = ' + (4 * k) + ', so ' + B(24 * k) + '.'], [{ v: 12 * k, c: 't_facts', why: 'A day is 24 hours: the clock goes around twice.' }, { v: 60 * k, c: 't_facts', why: 'A day has 24 hours. (An hour has 60 minutes.)' }]); },
      () => { const mm = R.i(2, 4), s = R.pick([10, 15, 20, 30, 45]); return Q('How many seconds are in ' + B(mm + ' minutes ' + s + ' seconds') + '?', 60 * mm + s, ['Each minute is 60 seconds: ' + X(mm, 60) + ' = ' + (60 * mm) + '.', (60 * mm) + ' + ' + s + ' = ' + B(60 * mm + s) + '.'], [{ v: 100 * mm + s, c: 't_facts', why: 'A minute has 60 seconds, not 100.' }, { v: 60 * mm, c: 't_facts', why: 'Add the ' + s + ' seconds too.' }]); }])();
  } },

{ id: 't_elapsed', s: 'time', g: 3, title: 'How long? Count up', pre: ['a_countup'],
  tip: 'To find how long, hop forward: first to the next o’clock, then whole hours, then the minutes left. Add the hops. 3:40 to 5:15 → 20 min + 1 h + 15 min = 1 h 35 min.',
  gen(d, R) {
    const h1 = R.i(1, 9), pair = (a, b, c, e) => '<div class="clock-pair"><div>' + clockSVG(a, b, { cls: 'sm' }) + '<span>Start</span></div><div>' + clockSVG(c, e, { cls: 'sm' }) + '<span>End</span></div></div>';
    if (d === 0) {
      const c = R.chance(.5); let m1, h2, m2;
      if (c) { m1 = R.i(1, 11) * 5; h2 = h1 + 1; m2 = 0; } else { m1 = 0; h2 = h1; m2 = R.i(1, 11) * 5; }
      const ans = (h2 - h1) * 60 + m2 - m1;
      return { text: 'How many minutes is it from ' + B(fmtT(h1, m1)) + ' to ' + B(fmtT(h2, m2)) + '?', unit: 'minutes', vis: pair(h1, m1, h2, m2), ans,
        how: c ? ['From :' + pad2(m1) + ' up to the next o’clock, the long hand goes from the ' + (m1 / 5) + ' around to the 12.', 'An hour is 60 minutes, so that is ' + less(60, m1) + ' = ' + B(ans) + ' minutes.']
               : ['From ' + h1 + ':00 the long hand moves from the 12 to the ' + (m2 / 5) + '.', 'Count by 5s: ' + list5(m2 / 5) + '. That is ' + B(ans) + ' minutes.'],
        howVis: minHops(T.min(h1, m1), [ans]),
        steps: c ? [{ text: 'How many minutes are in a whole hour?', ans: 60 }, { text: B(less(60, m1) + ' = ?'), ans }] : [],
        traps: c ? [{ v: m1, c: 't_elapsed', why: 'That is how far past the hour it started. Count the minutes still to go up to the o’clock.' }, { v: 100 - m1, c: 't_facts', why: 'An hour is 60 minutes, not 100.' }, { v: ans + 5, c: 't_five', why: 'Count by 5s carefully.' }]
                 : [{ v: m2 / 5, c: 't_five', why: 'That is the number the long hand points to. Each number is 5 minutes.' }, { v: ans + 5, c: 't_five', why: 'Count by 5s carefully from the 12.' }] };
    }
    if (d === 1) {
      const m1 = R.i(7, 11) * 5, m2 = R.i(1, 8) * 5, h2 = h1 + 1, a = 60 - m1, ans = a + m2;
      return { text: 'How many minutes is it from ' + B(fmtT(h1, m1)) + ' to ' + B(fmtT(h2, m2)) + '?', unit: 'minutes', vis: pair(h1, m1, h2, m2), ans,
        how: ['Hop to the next o’clock: ' + fmtT(h1, m1) + ' → ' + h2 + ':00 is ' + a + ' minutes.', 'Then ' + h2 + ':00 → ' + fmtT(h2, m2) + ' is ' + m2 + ' minutes.', a + ' + ' + m2 + ' = ' + B(ans) + ' minutes.'],
        howVis: minHops(T.min(h1, m1), [a, m2]),
        steps: [{ text: 'How many minutes is it from ' + B(fmtT(h1, m1)) + ' to ' + B(h2 + ':00') + '?', ans: a }, { text: 'How many minutes is it from ' + B(h2 + ':00') + ' to ' + B(fmtT(h2, m2)) + '?', ans: m2 }, { text: B(a + ' + ' + m2 + ' = ?'), ans }],
        traps: [{ v: Math.abs(m1 - m2), c: 'a_countup', why: 'You took one number of minutes from the other. Hop to the o’clock first, then on.' }, { v: ans + 40, c: 't_facts', why: 'It looks like you counted an hour as 100 minutes. An hour is 60 minutes.' },
                { v: ans + 60, c: 't_elapsed', why: 'Less than an hour passed. Hop to ' + h2 + ':00, then on to ' + fmtT(h2, m2) + '.' }, { v: ans + 5, c: 't_five', why: 'Count by 5s carefully in each hop.' }] };
    }
    const m1 = R.i(1, 11) * 5, dh = R.i(1, 2), m2 = R.i(0, 11) * 5, h2 = h1 + dh + (m2 < m1 ? 1 : 0), tot = (h2 - h1) * 60 + m2 - m1, ans = dur(tot);
    let how, hops, steps;
    if (m2 >= m1) { how = [fmtT(h1, m1) + ' → ' + fmtT(h2, m1) + ' is ' + (h2 - h1) + ' ' + plural(h2 - h1, 'hour') + '.', fmtT(h2, m1) + ' → ' + fmtT(h2, m2) + ' is ' + (m2 - m1) + ' minutes.']; hops = [(h2 - h1) * 60, m2 - m1].filter(x => x);
      steps = [{ text: 'How many whole hours is it from ' + B(fmtT(h1, m1)) + ' to ' + B(fmtT(h2, m1)) + '?', ans: h2 - h1, unit: plural(h2 - h1, 'hour') }, { text: 'How many minutes is it from ' + B(fmtT(h2, m1)) + ' to ' + B(fmtT(h2, m2)) + '?', ans: m2 - m1, unit: 'minutes' }]; }
    else { const mid = h2 - h1 - 1, a = 60 - m1; how = [fmtT(h1, m1) + ' → ' + (h1 + 1) + ':00 is ' + a + ' minutes.'].concat(mid ? [(h1 + 1) + ':00 → ' + h2 + ':00 is ' + mid + ' ' + plural(mid, 'hour') + '.'] : [], m2 ? [h2 + ':00 → ' + fmtT(h2, m2) + ' is ' + m2 + ' minutes.'] : []);
      how.push('Altogether: ' + (mid ? mid + ' h + ' : '') + a + ' min + ' + m2 + ' min = ' + B(ans.h + ' h ' + ans.m + ' min') + '.');
      hops = [a, mid * 60, m2].filter(x => x);
      steps = [{ text: 'How many minutes is it from ' + B(fmtT(h1, m1)) + ' to ' + B((h1 + 1) + ':00') + '?', ans: a, unit: 'minutes' }, { text: 'How many whole hours is it from ' + B((h1 + 1) + ':00') + ' to ' + B(h2 + ':00') + '?', ans: mid, unit: plural(mid, 'hour') }, { text: 'How many minutes is it from ' + B(h2 + ':00') + ' to ' + B(fmtT(h2, m2)) + '?', ans: m2, unit: 'minutes' }].filter(s => s.ans); }
    if (m2 >= m1) how.push('Altogether: ' + B(ans.h + ' ' + plural(ans.h, 'hour') + ' ' + ans.m + ' minutes') + '.');
    const traps = [{ v: tm(ans.h + 1, ans.m), c: 't_elapsed', why: 'One hour too many. Count the whole hours between the hops again.' }];
    if (m2 < m1) traps.push({ v: tm(h2 - h1, m1 - m2), c: 't_elapsed', why: 'You took the minutes away backwards. Hop to the next o’clock first, then on.' });
    const raw = (h2 * 100 + m2) - (h1 * 100 + m1); if (raw % 100 < 60 && Math.floor(raw / 100) !== ans.h || (raw % 100 < 60 && raw % 100 !== ans.m)) traps.push({ v: tm(Math.floor(raw / 100), raw % 100), c: 't_facts', why: 'An hour is 60 minutes, not 100. Hop to the o’clock instead of taking away.' });
    return { type: 'time', dur: true, text: 'How long is it from ' + B(fmtT(h1, m1)) + ' to ' + B(fmtT(h2, m2)) + '? Type hours, then minutes.', ans, how, howVis: minHops(T.min(h1, m1), hops), steps, traps };
  } },

{ id: 't_later', s: 'time', g: 3, title: 'What time will it be?',
  tip: 'Hop forward to the next o’clock first, then add the minutes left. 3:40 and 35 minutes: 3:40 → 4:00 is 20 minutes, 15 more makes 4:15. After 12 comes 1.',
  gen(d, R) {
    let h = R.i(1, 12), m, k;
    if (d === 0) { m = R.pick([0, 30]); k = R.pick([15, 30, 60, 120, 180]); if (m === 30 && k === 15) k = 30; }
    else if (d === 1) { m = R.i(4, 11) * 5; k = R.i(Math.max(2, 13 - m / 5), 11) * 5; }
    else { m = R.i(6, 11) * 5; k = R.i(1, 2) * 60 + R.i(2, 9) * 5; if (R.chance(.4)) h = R.pick([10, 11, 12]); }
    const f = forward(h, m, k), r = f.r, kTxt = T.words(k), crossed = T.min(h, m) % 60 + k % 60 >= 60 && m;
    const traps = [];
    if (crossed) traps.push({ v: tm(PV(r.h), r.m), c: 't_later', why: 'You went past an o’clock, so the hour goes up one more.' });
    traps.push({ v: tm(NX(r.h), r.m), c: 't_later', why: 'One hour too many. Count the o’clocks you pass.' });
    if (T.min(h, m) + k >= 720 && r.h !== 12) traps.push({ v: tm(r.h + 12, r.m), c: 't_later', why: 'Clocks go up to 12. After 12 comes 1.' });
    if (k % 60 && (m + k % 60) % 60 !== r.m) traps.push({ v: tm(r.h, (m + k) % 60), c: 't_later', why: 'Check the minutes: hop to the o’clock, then count on.' });
    const steps = [];
    if (f.H) { const s = T.add(h, m, 60 * f.H); steps.push({ type: 'time', text: 'What time is ' + B(f.H + ' ' + plural(f.H, 'hour')) + ' after ' + B(fmtT(h, m)) + '?', ans: s }); }
    if (f.hops.length - (f.H ? 1 : 0) === 2) { const s = T.add(h, m, 60 * f.H), tp = 60 - s.m; steps.push({ text: 'How many minutes is it from ' + B(fmtT(s.h, s.m)) + ' to ' + B(NX(s.h) + ':00') + '?', ans: tp, unit: 'minutes' }, { text: 'You have ' + B(f.M + ' minutes') + ' to add. It takes ' + B(tp + ' minutes') + ' to get to ' + B(NX(s.h) + ':00') + '. How many minutes are left?', ans: f.M - tp }); }
    const lh = f.hops[f.hops.length - 1]; /* the last hop, so the last step can say where it starts */
    steps.push({ type: 'time', text: f.M ? 'What time is ' + B(lh + ' minutes') + ' after ' + B(T.fmtMin(T.min(r.h, r.m) + 720 - lh)) + '?' : 'It is ' + B(fmtT(h, m)) + '. What time will it be in ' + B(kTxt) + '?', ans: r });
    return { type: 'time', text: 'It is ' + B(fmtT(h, m)) + '. What time will it be in ' + B(kTxt) + '?', vis: clockSVG(h, m, { cls: 'sm' }), ans: r,
      how: f.lines.length ? f.lines : [fmtT(h, m) + ' plus ' + kTxt + ' is ' + B(fmtT(r.h, r.m)) + '.'], howVis: minHops(T.min(h, m), f.hops), steps: steps.length > 1 ? steps : [], traps };
  } },

{ id: 't_earlier', s: 'time', g: 3, title: 'What time was it?',
  tip: 'To go back in time, hop back to the o’clock first, then keep going back. It is 4:10. 25 minutes ago? 4:10 → 4:00 is 10 minutes, 15 more back is 3:45. Before 1 comes 12.',
  gen(d, R) {
    let h = R.i(1, 12), m, k;
    if (d === 0) { if (R.chance(.5)) { m = R.i(0, 11) * 5; k = R.i(1, 3) * 60; } else { m = R.pick([30, 45]); k = R.pick([15, 30].filter(x => x <= m)); } }
    else if (d === 1) { m = R.i(1, 5) * 5; k = R.i(m / 5 + 1, 11) * 5; }
    else { m = R.i(1, 5) * 5; k = R.i(1, 2) * 60 + R.i(m / 5 + 1, 9) * 5; if (R.chance(.4)) h = R.pick([12, 1, 2]); }
    const r = T.add(h, m, -k), kTxt = T.words(k), H = Math.floor(k / 60), M = k % 60, lines = [], hops = [], steps = [];
    let ch = h, cm = m;
    if (H) { const s = T.add(h, m, -60 * H); lines.push('First go back the ' + H + ' ' + plural(H, 'hour') + ': ' + fmtT(h, m) + ' → ' + fmtT(s.h, s.m) + '.' + (h - H < 1 ? ' (Before 1 comes 12.)' : '')); hops.push(-60 * H); ch = s.h; cm = s.m;
      steps.push({ type: 'time', text: 'What time is ' + B(H + ' ' + plural(H, 'hour')) + ' before ' + B(fmtT(h, m)) + '?', ans: s }); }
    if (M) {
      if (M > cm) { lines.push('Hop back to the o’clock: ' + fmtT(ch, cm) + ' → ' + ch + ':00 is ' + cm + ' minutes.', 'Go back ' + (M - cm) + ' more minutes: ' + ch + ':00 → ' + B(fmtT(r.h, r.m)) + '.' + (ch === 1 ? ' (Before 1 comes 12.)' : '')); hops.push(-cm, -(M - cm));
        steps.push({ text: 'You have ' + B(M + ' minutes') + ' to go back. It takes ' + B(cm + ' minutes') + ' to get back to ' + B(ch + ':00') + '. How many minutes are left?', ans: M - cm }); }
      else { lines.push(fmtT(ch, cm) + ' take away ' + M + ' minutes is ' + B(fmtT(r.h, r.m)) + '.'); hops.push(-M); }
    } else lines[lines.length - 1] = lines[lines.length - 1].replace(/ → ([0-9:]+)\./, ' → ' + B(fmtT(r.h, r.m)) + '.');
    steps.push({ type: 'time', text: M ? 'What time is ' + B((M > cm ? M - cm : M) + ' minutes') + ' before ' + B(M > cm ? ch + ':00' : fmtT(ch, cm)) + '?' : 'It is ' + B(fmtT(h, m)) + '. What time was it ' + B(kTxt + ' ago') + '?', ans: r });
    const traps = [{ v: T.add(h, m, k), c: 't_earlier', why: '“Ago” means go back in time, not forward.' }];
    if (M > cm) traps.push({ v: tm(NX(r.h), r.m), c: 't_earlier', why: 'Going back past an o’clock, the hour goes down one.' });
    if (r.h === 12) traps.push({ v: tm(0, r.m), c: 't_earlier', why: 'There is no 0 on the clock. Before 1 comes 12.' });
    if (M) traps.push({ v: tm(r.h, (r.m + 10) % 60), c: 't_earlier', why: 'Check the minutes: hop back to the o’clock, then keep going.' });
    return { type: 'time', text: 'It is ' + B(fmtT(h, m)) + '. What time was it ' + B(kTxt + ' ago') + '?', vis: clockSVG(h, m, { cls: 'sm' }), ans: r,
      how: lines, howVis: minHops(T.min(h, m) + 720, hops), steps: steps.length > 1 ? steps : [], traps };
  } },
{ id: 't_ampm', s: 'time', g: 4, title: 'Across noon and midnight: AM and PM', paper: true,
  tip: 'AM runs from midnight to noon; PM from noon to midnight. To count across 12, go up to 12 first, then on. 9 AM to 2 PM: 3 hours to noon + 2 more = 5 hours.',
  gen(d, R) {
    const night = R.chance(.4), p1 = night ? 'PM' : 'AM', p2 = night ? 'AM' : 'PM', mid = night ? 'midnight' : 'noon';
    if (d === 0) {
      const h1 = R.i(6, 11), h2 = R.i(1, 7), a = 12 - h1, ans = a + h2;
      return { text: 'How many hours is it from ' + B(h1 + ' ' + p1) + ' to ' + B(h2 + ' ' + p2) + '?', unit: 'hours', ans,
        how: [h1 + ' ' + p1 + ' → 12 ' + mid + ' is ' + a + ' ' + plural(a, 'hour') + '.', '12 ' + mid + ' → ' + h2 + ' ' + p2 + ' is ' + h2 + ' ' + plural(h2, 'hour') + '.', a + ' + ' + h2 + ' = ' + B(ans) + ' hours.'],
        steps: [{ text: 'How many hours is it from ' + B(h1 + ' ' + p1) + ' to ' + B('12 ' + mid) + '?', ans: a, unit: plural(a, 'hour') }, { text: 'How many hours is it from ' + B('12 ' + mid) + ' to ' + B(h2 + ' ' + p2) + '?', ans: h2, unit: plural(h2, 'hour') }, { text: B(a + ' + ' + h2 + ' = ?'), ans }],
        traps: [{ v: Math.abs(h1 - h2), c: 't_ampm', why: 'Across ' + mid + ' the clock starts again at 1. Count up to 12 first, then on.' }, { v: ans + 1, c: 't_elapsed', why: 'Count the hops from hour to hour, not the numbers you pass.' }, { v: 24 - ans, c: 't_ampm', why: 'That goes the long way around. Start at ' + h1 + ' ' + p1 + ' and go forward to 12 ' + mid + ', then on.' }] };
    }
    const across = (h1, m1, h2, m2, q1, q2, md, text) => {
      const a = (12 - h1) * 60 - m1, b = (h2 % 12) * 60 + m2, tot = a + b, ans = dur(tot);
      const how = [fmtT(h1, m1) + ' ' + q1 + ' → 12:00 ' + md + ' is ' + T.words(a) + '.', '12:00 ' + md + ' → ' + fmtT(h2, m2) + ' ' + q2 + ' is ' + T.words(b) + '.'];
      if ((a % 60) + (b % 60) >= 60) how.push((a % 60) + ' + ' + (b % 60) + ' = ' + ((a % 60) + (b % 60)) + ' minutes = 1 hour ' + ((a % 60) + (b % 60) - 60) + ' minutes.');
      how.push('Altogether: ' + B(ans.h + ' h ' + ans.m + ' min') + '.');
      const naive = Math.abs(T.min(h1, m1) - T.min(h2, m2));
      return { type: 'time', dur: true, text: text + ' Type hours, then minutes.', ans, how,
        steps: [{ type: 'time', dur: true, text: 'How long is it from ' + B(fmtT(h1, m1) + ' ' + q1) + ' to ' + B('12:00 ' + md) + '?', ans: dur(a) }, { type: 'time', dur: true, text: 'How long is it from ' + B('12:00 ' + md) + ' to ' + B(fmtT(h2, m2) + ' ' + q2) + '?', ans: dur(b) }, { type: 'time', dur: true, text: 'Add ' + B(T.words(a)) + ' and ' + B(T.words(b)) + '. How long is that altogether?', ans }],
        traps: [{ v: dur(naive), c: 't_ampm', why: 'You took one time from the other. Across ' + md + ', count up to 12:00 first, then on.' }, { v: tm(ans.h + 1, ans.m), c: 't_elapsed', why: 'One hour too many. Count the whole hours in each hop again.' },
                { v: tm(Math.max(0, ans.h - 1), ans.m), c: 't_elapsed', why: 'One hour short. When the minutes add up past 60, that makes another hour.' }] };
    };
    if (d === 1) { const h1 = R.i(8, 11), m1 = R.i(1, 11) * 5, h2 = R.i(1, 4), m2 = R.i(0, 11) * 5;
      return across(h1, m1, h2, m2, 'AM', 'PM', 'noon', 'A trip starts at ' + B(fmtT(h1, m1) + ' AM') + ' and ends at ' + B(fmtT(h2, m2) + ' PM') + '. How long is the trip?'); }
    if (R.chance(.5)) { const h1 = R.i(7, 10), m1 = R.i(1, 11) * 5, h2 = R.i(5, 7), m2 = R.i(0, 11) * 5;
      return across(h1, m1, h2, m2, 'PM', 'AM', 'midnight', 'Sam goes to sleep at ' + B(fmtT(h1, m1) + ' PM') + ' and wakes up at ' + B(fmtT(h2, m2) + ' AM') + '. How long does Sam sleep?'); }
    const h = R.i(9, 11), m = R.i(1, 11) * 5, k = R.i(2, 4) * 60 + R.i(1, 11) * 5, f = forward(h, m, k), r = f.r;
    if (T.min(h, m) + k < 720) return null;
    return { type: 'time', text: 'It is ' + B(fmtT(h, m) + ' PM') + '. What time will it be ' + B(T.words(k)) + ' later? (Type just the time.)', ans: r,
      how: f.lines.concat(['Going past 12 midnight, PM changes to AM: it is ' + fmtT(r.h, r.m) + ' AM.']).slice(-4).map((l, i, a) => i === a.length - 1 ? l.replace(fmtT(r.h, r.m) + ' AM', B(fmtT(r.h, r.m)) + ' AM') : l.replace(/<\/?b>/g, '')),
      steps: [{ type: 'time', text: 'What time is ' + B(f.H + ' ' + plural(f.H, 'hour')) + ' after ' + B(fmtT(h, m)) + '?', ans: T.add(h, m, 60 * f.H) }, { type: 'time', text: 'What time is ' + B(f.M + ' minutes') + ' after ' + B(T.fmtMin(T.min(h, m) + 60 * f.H)) + '?', ans: r }],
      traps: [{ v: r.h === 12 ? tm(0, r.m) : tm(r.h + 12, r.m), c: 't_ampm', why: r.h === 12 ? 'There is no 0 on a 12-hour clock. The hour after midnight is 12.' : 'Clocks go up to 12. After 12 midnight comes 1 AM.' }, { v: tm(NX(r.h), r.m), c: 't_later', why: 'One hour too many. Count the o’clocks you pass.' }, { v: tm(PV(r.h), r.m), c: 't_later', why: 'You went past an o’clock, so the hour goes up one more.' }] };
  } },

{ id: 't_convert', s: 'time', g: 4, title: 'Seconds, minutes, hours, days, weeks', pre: ['m_x2510'],
  tip: '60 seconds = 1 minute, 60 minutes = 1 hour, 24 hours = 1 day, 7 days = 1 week. ×60 is ×6 then a zero: 4 minutes = 4 × 6 = 24, so 240 seconds.',
  gen(d, R) {
    const Q = (text, ans, unit, how, traps, steps) => ({ text, ans, unit, how, traps, steps });
    const x60 = (k, big, small) => Q('How many ' + small + ' are in ' + B(k + ' ' + big) + '?', 60 * k, small,
      ['Each ' + big.replace(/s$/, '') + ' is 60 ' + small + ', so do ' + X(k, 60) + '.', X(k, 6) + ' = ' + (6 * k) + '. Put the zero back: ' + B(60 * k) + ' ' + small + '.'],
      [{ v: 100 * k, c: 't_facts', why: 'A' + (big === 'hours' ? 'n hour is 60 minutes' : ' minute is 60 seconds') + ', not 100.' }, { v: 6 * k, c: 'm_xtens', why: 'Put the zero back: 60 is 6 tens.' }, { v: 24 * k, c: 't_convert', why: '24 is hours in a day. Use 60 here.' }],
      [{ text: B(X(k, 6) + ' = ?'), ans: 6 * k }, { text: B(X(k, 60) + ' = ?'), ans: 60 * k }]);
    if (d === 0) return R.pick([
      () => { const k = R.i(2, 6); return Q('How many days are in ' + B(k + ' weeks') + '?', 7 * k, 'days', ['Each week is 7 days: ' + X(k, 7) + '.', '5 × ' + k + ' = ' + (5 * k) + ' and 2 × ' + k + ' = ' + (2 * k) + ', so ' + B(7 * k) + ' days.'], [{ v: k + 7, c: 'm_groups', why: 'You added. ' + k + ' weeks is ' + k + ' groups of 7 days.' }, { v: 7 * k - 7, c: 'm_x7', why: 'One week short. Check ' + X(k, 7) + '.' }, { v: 5 * k, c: 'm_x7', why: 'A week is 7 days, not 5.' }], trickSteps(7, k)); },
      () => x60(R.i(2, 9), 'minutes', 'seconds'),
      () => x60(R.i(2, 9), 'hours', 'minutes'),
      () => { const k = R.i(2, 4); return Q('How many hours are in ' + B(k + ' days') + '?', 24 * k, 'hours', ['Each day is 24 hours: ' + X(k, 24) + '. Split 24 into 20 and 4.', X(k, 20) + ' = ' + (20 * k) + ' and ' + X(k, 4) + ' = ' + (4 * k) + ', so ' + B(24 * k) + ' hours.'], [{ v: 12 * k, c: 't_facts', why: 'A day is 24 hours: the clock goes around twice.' }, { v: 60 * k, c: 't_convert', why: 'A day has 24 hours. 60 is minutes in an hour.' }], [{ text: B(X(k, 20) + ' = ?'), ans: 20 * k }, { text: B(X(k, 4) + ' = ?'), ans: 4 * k }, { text: B((20 * k) + ' + ' + (4 * k) + ' = ?'), ans: 24 * k }]); }])();
    if (d === 1) return R.pick([
      () => { const k = R.i(2, 5), s = R.i(1, 11) * 5; return Q('How many seconds are in ' + B(k + ' minutes ' + s + ' seconds') + '?', 60 * k + s, 'seconds', [k + ' minutes = ' + X(k, 60) + ' = ' + (60 * k) + ' seconds.', (60 * k) + ' + ' + s + ' = ' + B(60 * k + s) + ' seconds.'], [{ v: 100 * k + s, c: 't_facts', why: 'A minute is 60 seconds, not 100.' }, { v: 60 * k, c: 't_convert', why: 'Add the ' + s + ' seconds too.' }], [{ text: B(X(k, 60) + ' = ?'), ans: 60 * k }, { text: B((60 * k) + ' + ' + s + ' = ?'), ans: 60 * k + s }]); },
      () => { const k = R.i(2, 4), e = R.i(1, 6); return Q('How many days are in ' + B(k + ' weeks ' + e + ' ' + plural(e, 'day')) + '?', 7 * k + e, 'days', [k + ' weeks = ' + X(k, 7) + ' = ' + (7 * k) + ' days.', (7 * k) + ' + ' + e + ' = ' + B(7 * k + e) + ' days.'], [{ v: 10 * k + e, c: 't_convert', why: 'A week is 7 days, not 10.' }, { v: 7 * k, c: 't_convert', why: 'Add the ' + e + ' extra ' + plural(e, 'day') + ' too.' }], [{ text: B(X(k, 7) + ' = ?'), ans: 7 * k }, { text: B((7 * k) + ' + ' + e + ' = ?'), ans: 7 * k + e }]); },
      () => { const k = R.i(2, 9), unit = R.pick([['seconds', 'minutes'], ['minutes', 'hours']]); return Q('How many ' + unit[1] + ' are in ' + B((60 * k) + ' ' + unit[0]) + '?', k, unit[1], ['60 ' + unit[0] + ' make 1 ' + unit[1].replace(/s$/, '') + '. How many 60s are in ' + (60 * k) + '?', 'Drop a zero from both: 6 × ? = ' + (6 * k) + '. 6 × ' + k + ' = ' + (6 * k) + ', so ' + B(k) + ' ' + unit[1] + '.'], [{ v: 6 * k, c: 't_convert', why: 'Divide by 60, not by 10.' }, { v: k + 1, c: 'm_x3x6', why: 'Check: 6 × ' + (k + 1) + ' = ' + (6 * k + 6) + '.' }], [{ text: B('6 × ? = ' + (6 * k)), ans: k }]); },
      () => { const k = R.i(2, 5); return Q('How many days are in ' + B((24 * k) + ' hours') + '?', k, 'days', ['24 hours make a day. Count by 24s: ' + list(24, k) + '.', 'That is ' + B(k) + ' days.'], [{ v: 2 * k, c: 't_convert', why: 'A day is 24 hours, not 12.' }, { v: k + 1, c: 't_convert', why: 'Count by 24s again: ' + list(24, k) + '.' }], [{ text: B(X(k, 24) + ' = ?'), ans: 24 * k }]); },
      () => { const k = R.i(3, 9); return Q('How many weeks are in ' + B((7 * k) + ' days') + '?', k, 'weeks', ['7 days make a week. Think: 7 × ? = ' + (7 * k) + '.', X(7, k) + ' = ' + (7 * k) + ', so ' + B(k) + ' weeks.'], [{ v: k + 1, c: 'm_x7', why: 'Check: ' + X(7, k + 1) + ' = ' + (7 * k + 7) + '.' }, { v: k - 1, c: 'm_x7', why: 'Check: ' + X(7, k - 1) + ' = ' + (7 * k - 7) + '.' }], [{ text: B('7 × ? = ' + (7 * k)), ans: k }]); }])();
    return R.pick([
      () => { const k = R.i(1, 3), p = 168 * k; return Q('How many hours are in ' + B(k + ' ' + plural(k, 'week')) + '?', p, 'hours', ['A week is 7 days and each day is 24 hours.', 'One week: ' + X(7, 24) + ' = 140 + 28 = 168 hours.'].concat(k > 1 ? [X(k, 168) + ' = ' + B(n(p)) + ' hours.'] : ['So ' + B(168) + ' hours.']), [{ v: 84 * k, c: 't_facts', why: 'A day is 24 hours, not 12.' }, { v: 7 * k + 24, c: 'm_groups', why: 'Multiply: 7 days of 24 hours is 7 × 24.' }, { v: 420 * k, c: 't_convert', why: 'A day is 24 hours. 60 is minutes in an hour.' }], [{ text: B(X(7, 20) + ' = ?'), ans: 140 }, { text: B(X(7, 4) + ' = ?'), ans: 28 }, { text: B('140 + 28 = ?'), ans: 168 }].concat(k > 1 ? [{ text: B(X(k, 168) + ' = ?'), ans: p }] : [])); },
      () => { const k = R.i(1, 3), p = 1440 * k; return Q('How many minutes are in ' + B(k + ' ' + plural(k, 'day')) + '?', p, 'minutes', ['A day is 24 hours and each hour is 60 minutes.', X(24, 60) + ': ' + X(24, 6) + ' = 144, then put the zero back: 1,440.'].concat(k > 1 ? [X(k, 1440) + ' = ' + B(n(p)) + ' minutes.'] : ['So ' + B('1,440') + ' minutes.']), [{ v: 2400 * k, c: 't_facts', why: 'An hour is 60 minutes, not 100.' }, { v: 720 * k, c: 't_facts', why: 'A day is 24 hours, not 12.' }, { v: 144 * k, c: 'm_xtens', why: 'Put the zero back: 24 × 60 is 24 × 6 tens.' }], [{ text: B(X(24, 6) + ' = ?'), ans: 144 }, { text: B(X(24, 60) + ' = ?'), ans: 1440 }].concat(k > 1 ? [{ text: B(X(k, 1440) + ' = ?'), ans: p }] : [])); },
      () => { const k = R.i(1, 3), p = 3600 * k; return Q('How many seconds are in ' + B(k + ' ' + plural(k, 'hour')) + '?', p, 'seconds', ['An hour is 60 minutes and each minute is 60 seconds.', X(60, 60) + ': 6 × 6 = 36, then two zeros: 3,600.'].concat(k > 1 ? [X(k, 3600) + ' = ' + B(n(p)) + ' seconds.'] : ['So ' + B('3,600') + ' seconds.']), [{ v: 10000 * k, c: 't_facts', why: 'Minutes and seconds go in 60s, not 100s.' }, { v: 360 * k, c: 'm_tensxtens', why: '60 × 60 has two zeros: 6 × 6 = 36, then 00.' }, { v: 120 * k, c: 'm_groups', why: 'You added 60 + 60. Multiply: 60 minutes of 60 seconds.' }], [{ text: B('6 × 6 = ?'), ans: 36 }, { text: B(X(60, 60) + ' = ?'), ans: 3600 }].concat(k > 1 ? [{ text: B(X(k, 3600) + ' = ?'), ans: p }] : [])); }])();
  } },

{ id: 't_24h', s: 'time', g: 5, title: '24-hour time: 15:40 is 3:40 PM',
  tip: '24-hour time keeps counting after 12 noon: 13:00 is 1 PM, 15:40 is 3:40 PM. Take away 12 to get the PM time; add 12 to go back. 00:15 is 12:15 AM.',
  gen(d, R) {
    if (d < 2) {
      let hh = R.i(13, 23), m = d === 0 ? R.pick([0, 30]) : R.i(0, 11) * 5;
      if (d === 1 && R.chance(.25)) hh = R.pick([12, 0]);
      const h = hh === 0 ? 12 : hh > 12 ? hh - 12 : 12;
      const text = 'A clock shows ' + B(H24(hh, m)) + ' in 24-hour time. What time is that on a 12-hour clock?';
      if (hh === 12) return { type: 'time', text, ans: tm(12, m), how: ['12:00 to 12:59 is the hour just after noon. Its number stays 12; only take away 12 from 13 on.', H24(hh, m) + ' is ' + B(fmtT(12, m)) + ' PM.'],
        traps: [{ v: tm(0, m), c: 't_24h', why: 'From 12:00 to 12:59 it is still the 12 o’clock hour. Take away 12 only from 13 on.' }] };
      if (hh === 0) return { type: 'time', text, ans: tm(12, m), how: ['00 is the hour just after midnight. On a 12-hour clock that hour is called 12.', H24(hh, m) + ' is ' + B(fmtT(12, m)) + ' AM.'],
        traps: [{ v: tm(0, m), c: 't_24h', why: 'There is no 0 on a 12-hour clock. The hour after midnight is 12 AM.' }] };
      return { type: 'time', text, ans: tm(h, m),
        how: ['After 12 noon, 24-hour time keeps counting: 13 is 1 PM, 14 is 2 PM, and so on.', 'Take away 12: ' + less(hh, 12) + ' = ' + h + '. So ' + H24(hh, m) + ' is ' + B(fmtT(h, m)) + ' PM.'],
        steps: [{ text: B(less(hh, 12) + ' = ?'), ans: h }, { type: 'time', text: 'So what is ' + B(H24(hh, m)) + ' on a 12-hour clock?', ans: tm(h, m) }],
        traps: [{ v: tm(hh - 10, m), c: 't_24h', why: 'Take away 12, not 10.' }, { v: tm(hh - 11, m), c: 't_24h', why: 'One hour off. Count: 13 is 1, 14 is 2, 15 is 3.' }] };
    }
    if (R.chance(.5)) {
      const h = R.i(1, 11), m = R.i(0, 11) * 5;
      return { text: B(fmtT(h, m) + ' PM') + ' is ' + B('?:' + C.pad2(m)) + ' in 24-hour time. What is the missing hour?', ans: h + 12,
        how: ['PM hours come after noon, so 24-hour time adds 12.', h + ' + 12 = ' + (h + 12) + ', so it is ' + H24(h + 12, m) + '. The hour is ' + B(h + 12) + '.'],
        steps: [{ text: B(h + ' + 12 = ?'), ans: h + 12 }],
        traps: [{ v: h + 10, c: 't_24h', why: 'Add 12, not 10.' }, { v: h, c: 't_24h', why: 'In 24-hour time, PM hours add 12: 1 PM is 13.' }, { v: h + 11, c: 't_24h', why: 'One off. 1 PM is 13, 2 PM is 14.' }] };
    }
    const h1 = R.i(6, 11), m1 = R.i(1, 11) * 5, h2 = R.i(13, 18), m2 = R.i(0, 11) * 5, a = 60 - m1, mid = h2 - h1 - 1, tot = (h2 - h1) * 60 + m2 - m1, ans = dur(tot);
    const how = [H24(h1, m1) + ' → ' + H24(h1 + 1, 0) + ' is ' + a + ' minutes.', H24(h1 + 1, 0) + ' → ' + H24(h2, 0) + ' is ' + mid + ' ' + plural(mid, 'hour') + '.'];
    if (m2) how.push(H24(h2, 0) + ' → ' + H24(h2, m2) + ' is ' + m2 + ' minutes.');
    how.push('Altogether: ' + mid + ' h + ' + (a + m2) + ' min = ' + B(ans.h + ' h ' + ans.m + ' min') + '.');
    const traps = [{ v: tm(ans.h + 1, ans.m), c: 't_elapsed', why: 'One hour too many. Count the whole hours again.' }];
    if (m2 < m1) traps.push({ v: tm(h2 - h1, m1 - m2), c: 't_elapsed', why: 'You took the minutes away backwards. Hop to the next o’clock first, then on.' });
    traps.push({ v: dur(Math.abs(T.min(h1, m1) - T.min(h2 - 12, m2))), c: 't_24h', why: 'Keep both times in 24-hour form and count on. Switching one to a 12-hour time mixes things up.' });
    return { type: 'time', dur: true, text: 'A train leaves at ' + B(H24(h1, m1)) + ' and arrives at ' + B(H24(h2, m2)) + '. How long is the trip? Type hours, then minutes.', ans, how,
      steps: [{ text: 'How many minutes is it from ' + B(H24(h1, m1)) + ' to ' + B(H24(h1 + 1, 0)) + '?', ans: a, unit: 'minutes' }, { text: 'How many whole hours is it from ' + B(H24(h1 + 1, 0)) + ' to ' + B(H24(h2, 0)) + '?', ans: mid, unit: plural(mid, 'hour') }, { type: 'time', dur: true, text: 'Add ' + B(mid + ' h + ' + (a + m2) + ' min') + '. How long is that?', ans }],
      traps };
  } },

{ id: 't_weekday', s: 'time', g: 5, title: 'Calendar patterns: every 7 days', pre: ['m_remain'],
  tip: 'The same weekday comes back every 7 days. If the 3rd is a Monday, so are the 10th, 17th, 24th and 31st. In 30 days: 30 = 4 weeks and 2 days, so 2 days after Monday.',
  gen(d, R) {
    const w = R.i(0, 6), day = DAYS[w];
    if (d === 0) {
      if (R.chance(.6)) { const D = R.i(1, 9), k = R.i(1, 3), ans = D + 7 * k;
        return { text: 'Today is ' + day + ' the ' + ord(D) + '. What is the date ' + (k === 1 ? B('next ' + day) : B(k + ' weeks from today')) + '?', ans,
          how: ['Every 7 days it is ' + day + ' again.', (k > 1 ? k + ' weeks is ' + X(k, 7) + ' = ' + (7 * k) + ' days: ' : 'Add 7: ') + D + ' + ' + (7 * k) + ' = ' + B(ans) + '.'],
          steps: k > 1 ? [{ text: 'How many days are in ' + B(k + ' weeks') + '?', ans: 7 * k }, { text: B(D + ' + ' + (7 * k) + ' = ?'), ans }] : [],
          traps: [{ v: D + k, c: 't_weekday', why: 'A week is 7 days. Add 7 for each week.' }, { v: ans + 1, c: 't_weekday', why: 'Add exactly 7 for each week. Don’t count today as one of the days.' }, { v: ans - 1, c: 't_weekday', why: 'Add exactly 7 for each week.' }] }; }
      const D = R.i(10, 28), ans = D - 7;
      return { text: 'Today is ' + day + ' the ' + ord(D) + '. What was the date ' + B('last ' + day) + '?', ans,
        how: ['The ' + day + ' before is 7 days earlier.', less(D, 7) + ' = ' + B(ans) + '.'],
        traps: [{ v: D + 7, c: 't_weekday', why: '“Last” means the one before, so go back 7 days.' }, { v: ans + 1, c: 't_weekday', why: 'Go back exactly 7 days.' }, { v: ans - 1, c: 't_weekday', why: 'Go back exactly 7 days.' }] };
    }
    if (d === 1) {
      const kind = R.i(0, 2);
      if (kind === 0) { const D = R.i(8, 31), ans = (D - 1) % 7 + 1, chain = []; for (let x = D; x >= 1; x -= 7) chain.push(x); const q = Math.floor((D - ans) / 7);
        return { text: 'The ' + ord(D) + ' is a ' + day + '. What is the date of the ' + B('first ' + day) + ' of that month?', ans,
          how: ['Go back 7 days at a time: ' + chain.join(' → ') + '.', 'You can’t go back 7 more, so the first ' + day + ' is the ' + B(ord(ans)) + '. (Shortcut: take away ' + q + ' sevens, ' + (7 * q) + ', from ' + D + '.)'],
          steps: [{ text: B(less(D, 7) + ' = ?'), ans: D - 7 }, { text: 'Start at ' + B(D) + '. Keep taking away 7 while you can. What number do you stop at?', ans }],
          traps: [{ v: D - 7, c: 't_weekday', why: 'Keep going back 7 days at a time until you can’t go back any more.' }, { v: ans + 1, c: 't_weekday', why: 'Take away exactly 7 each time.' }, { v: 7 * q, c: 'm_remain', why: 'That is how much you took away. The date is what is left.' }] }; }
      const F = R.i(1, 7), L = R.pick([28, 30, 31]), dates = []; for (let x = F; x <= L; x += 7) dates.push(x); const last = dates[dates.length - 1];
      if (kind === 1) return { text: 'The ' + ord(F) + ' is a ' + day + '. This month has ' + L + ' days. ' + B('How many ' + day + 's') + ' are in the month?', ans: dates.length,
        how: ['List them, adding 7 each time: ' + dates.join(', ') + '.', 'The next one would be ' + (last + 7) + ', past the ' + ord(L) + '. That is ' + B(dates.length) + ' ' + day + 's.'],
        steps: [{ text: 'The ' + ord(F) + ' is a ' + day + '. This month has ' + L + ' days. What is the date of the last ' + day + '?', ans: last }, { text: 'Count these dates: ' + B(dates.join(', ')) + '. How many dates are there?', ans: dates.length }],
        traps: [{ v: dates.length + 1, c: 't_weekday', why: 'Check the last one: is it past the ' + ord(L) + '?' }, { v: dates.length - 1, c: 't_weekday', why: 'Count every date in the list, the first one too.' }] };
      return { text: 'The ' + ord(F) + ' is a ' + day + '. This month has ' + L + ' days. What is the date of the ' + B('last ' + day) + ' of the month?', ans: last,
        how: ['Add 7 each time: ' + dates.join(', ') + '.', 'The next one would be ' + (last + 7) + ', past the ' + ord(L) + '. So the last ' + day + ' is the ' + B(ord(last)) + '.'],
        steps: [{ text: B(F + ' + 7 + 7 + 7 = ?'), ans: F + 21 }, { text: 'This month has ' + B(L + ' days') + '. Start at ' + B(F + 21) + '. Add 7 only if you stay in the month. What date do you end on?', ans: last }],
        traps: [{ v: last + 7, c: 't_weekday', why: 'This month has only ' + L + ' days.' }, { v: last - 7, c: 't_weekday', why: 'You can add 7 once more and still be in the month.' }] };
    }
    if (R.chance(.55)) {
      let k; do { k = R.i(15, 66); } while (k % 7 === 0); const q = Math.floor(k / 7), r = k % 7, nd = DAYS[(w + r) % 7];
      return { type: 'rem', text: 'Today is ' + day + '. How many whole weeks and extra days are in the next ' + B(k + ' days') + '? Type the weeks, then r, then the extra days.', ans: { q, r },
        how: [k + ' ÷ 7: ' + X(7, q) + ' = ' + (7 * q) + ', and ' + less(k, 7 * q) + ' = ' + r + ' extra ' + plural(r, 'day') + '.', 'After ' + q + ' weeks it is ' + day + ' again; ' + r + ' more ' + plural(r, 'day') + ' makes it ' + nd + '.', 'So ' + k + ' days = ' + B(q + ' r ' + r) + '.'],
        steps: [{ text: 'Count by 7s. Stop before you go past ' + B(k) + '. What number do you stop at?', ans: 7 * q }, { text: B(less(k, 7 * q) + ' = ?'), ans: r }, { type: 'rem', text: B(k + ' ÷ 7 = ?') + ' Use r for the extra days.', ans: { q, r } }],
        traps: [{ v: { q: q - 1, r: r + 7 }, c: 'm_remain', why: (r + 7) + ' extra days is more than a week. Make one more week.' }, { v: { q, r: 0 }, c: 'm_remain', why: 'Don’t forget the extra days: type r and how many.' }, { v: { q: q + 1, r }, c: 'm_x7', why: X(7, q + 1) + ' is ' + (7 * q + 7) + ', more than ' + k + '.' }] };
    }
    const L = R.pick([30, 31]), D = R.i(L - 6, L), ans = D + 7 - L;
    return { text: 'This month has ' + L + ' days. The ' + ord(D) + ' is a ' + day + '. What is the date of the ' + B('first ' + day) + ' of next month?', ans,
      how: [D + ' + 7 = ' + (D + 7) + ', but this month stops at the ' + ord(L) + '.', less(D + 7, L) + ' = ' + ans + ', so it is ' + ans + ' ' + plural(ans, 'day') + ' into next month.', 'The next ' + day + ' is the ' + B(ord(ans)) + '.'],
      steps: [{ text: 'This month has ' + B(L + ' days') + '. How many days are left after the ' + B(ord(D)) + '?', ans: L - D }, { text: 'The next ' + day + ' is ' + B('7 days') + ' away. ' + B(L - D) + ' of those days ' + plural(L - D, 'is', 'are') + ' in this month. How many are in next month?', ans }],
      traps: [{ v: D + 7, c: 't_weekday', why: 'This month has only ' + L + ' days. Count on into next month.' }, { v: ans + 1, c: 't_weekday', why: 'After the ' + ord(L) + ' comes the 1st of next month.' }, { v: ans - 1, c: 't_weekday', why: 'Count the days carefully: after the ' + ord(L) + ' comes the 1st.' }] };
  } },
/* ======================= Money ======================= */
{ id: 'c_coins', s: 'money', g: 2, title: 'Coin values',
  tip: 'Penny 1¢, nickel 5¢, dime 10¢, quarter 25¢. The dime is the smallest coin but is worth more than a nickel. 5 nickels make a quarter.',
  gen(d, R) {
    const cnt = (small, big, k) => {
      const s = COIN[small], b = big === '$' ? { v: 100, name: 'dollar' } : COIN[big], tot = b.v * k, ans = tot / s.v;
      const bigName = k === 1 ? 'one ' + b.name : k + ' ' + (big === '$' ? 'dollars' : b.many);
      const sv = small === 'n' ? 10 : small === 'd' ? 5 : s.v, bv = big === 'n' ? 10 : big === 'd' ? 5 : b.v, sw = bv * k / sv;
      const traps = [{ v: tot, c: 'c_coins', why: 'That is how many cents. The question asks how many ' + s.many + '.' }];
      if (sw % 1 === 0 && sw !== ans) traps.push({ v: sw, c: 'c_coins', why: 'A nickel is 5¢ and a dime is 10¢. The small dime is worth more.' });
      traps.push({ v: ans + 1, c: 'p_skip', why: 'Count by ' + s.v + 's again and stop at ' + tot + '.' });
      return { text: 'How many ' + B(s.many) + ' make ' + B(bigName) + '?', ans,
        how: [(k > 1 ? bigName.replace(/^./, c => c.toUpperCase()) + ' is ' + X(k, b.v) + ' = ' + tot + '¢' : 'A ' + b.name + ' is ' + b.v + '¢') + ', and a ' + s.name + ' is ' + s.v + '¢.',
              'Count by ' + s.v + 's to ' + tot + ': ' + (ans <= 6 ? list(s.v, ans) : list(s.v, 4) + ', … ' + tot) + '. That is ' + B(ans) + ' ' + s.many + '.'],
        steps: ans > 2 ? [money('How many cents is ' + B(bigName) + '?', tot, { fmt: 'c' }), { text: 'Count by ' + s.v + 's up to ' + tot + '. How many ' + s.v + 's is that?', ans }] : [],
        traps };
    };
    if (d === 0) {
      if (R.chance(.5)) { const pr = R.pick([['p', 'n'], ['p', 'd'], ['n', 'd']]); return cnt(pr[0], pr[1], 1); }
      const id = R.pick(['p', 'n', 'd', 'q']), c = COIN[id];
      const traps = { p: [{ v: 5, c: 'c_coins', why: 'A penny is the copper coin, worth 1¢.' }], n: [{ v: 10, c: 'c_coins', why: 'The nickel is bigger than the dime, but worth less: 5¢.' }], d: [{ v: 5, c: 'c_coins', why: 'The dime is small, but it is worth 10¢, more than a nickel.' }, { v: 1, c: 'c_coins', why: 'ONE DIME means one dime, which is 10¢.' }],
        q: [{ v: 50, c: 'c_coins', why: 'A quarter is a quarter of a dollar: 4 quarters make 100¢.' }, { v: 20, c: 'c_coins', why: 'A quarter is 25¢: 4 of them make a dollar.' }] }[id];
      return money(R.chance(.5) ? 'How much is this coin worth?' : 'How many cents is this coin?', c.v, { fmt: 'c', vis: '<div class="coins one">' + coinSVG(id, true) + '</div>',
        say: 'How much is this coin worth? It is a ' + c.name,
        how: ['This is a ' + B(c.name) + '. Look for the words on it: “' + c.t.join(' ') + '”.', 'A ' + c.name + ' is worth ' + B(c.v + '¢') + '.' + (id === 'd' ? ' It is small, but worth more than the bigger nickel.' : '')], traps });
    }
    if (d === 1) { if (R.chance(.3)) return cnt('n', 'd', R.i(2, 5)); const pr = R.pick([['n', 'q'], ['p', 'q'], ['d', '$'], ['q', '$'], ['n', '$']]); return cnt(pr[0], pr[1], 1); }
    return R.pick([() => cnt('n', 'q', R.i(2, 4)), () => cnt('q', '$', R.i(2, 5)), () => cnt('d', '$', R.i(2, 5)), () => cnt('d', 'q', R.pick([2, 4, 6]))])();
  } },

{ id: 'c_count', s: 'money', g: 2, title: 'Count coins, biggest first', pre: ['p_skip'],
  tip: 'Sort the coins, biggest first. Count quarters by 25s, then count on dimes by 10s, nickels by 5s and pennies by 1s. 2 quarters, 1 dime, 3 pennies: 25, 50, 60, 61, 62, 63.',
  gen(d, R) {
    const lst = randomCoins(R, d), v = coinsOf(lst), cnt = {}; lst.forEach(id => cnt[id] = (cnt[id] || 0) + 1);
    const steps = []; let tot = 0;
    COIN_ORDER.filter(id => cnt[id]).forEach(id => { const c = COIN[id], k = cnt[id], before = tot; tot += k * c.v;
      steps.push(money(before ? 'You have ' + fmtM(before) + '. Count on ' + k + ' ' + plural(k, c.name, c.many) + '. How much do you have now?' : 'Count the ' + plural(k, c.name, c.many) + ' first. How much is that?', tot, { vis: coinsRow(Array(k).fill(id)) })); });
    const traps = [];
    const sw = swapND(lst); if (sw !== v) traps.push({ v: sw, c: 'c_coins', why: 'It looks like the nickels and dimes got mixed up. A dime is 10¢, a nickel is 5¢.' });
    if (lst.length !== v) traps.push({ v: lst.length, c: 'c_count', why: 'That is how many coins there are. Count what each coin is worth.' });
    COIN_ORDER.filter(id => cnt[id]).slice(0, 2).forEach(id => traps.push({ v: v - COIN[id].v, c: 'c_count', why: 'You missed one ' + COIN[id].name + '. Touch each coin as you count.' }));
    return money('How much money is this?', v, { vis: coinsRow(lst), say: 'How much money is this? ' + coinNames(lst),
      how: ['Sort them, biggest first: ' + coinNames(lst) + '.', 'Count on: ' + countOn(lst) + '.', 'Total: ' + B(fmtM(v)) + '.'], steps: steps.length > 1 ? steps : [], traps });
  } },

{ id: 'c_fewest', s: 'money', g: 3, title: 'Fewest coins: biggest first',
  tip: 'For the fewest coins, take the biggest coin you can, as many times as it fits, then the next biggest. 40¢ = quarter + dime + nickel: 3 coins.',
  gen(d, R) {
    if (d === 2 && R.chance(.4)) {
      const t = R.i(30, 99), g = greedy(t, ['q', 'd', 'n', 'p']), cnt = {}; g.forEach(id => cnt[id] = (cnt[id] || 0) + 1);
      const ids = ['d', 'n', 'q'].filter(id => cnt[id]); if (!ids.length) return null; const id = R.pick(ids), c = COIN[id];
      const traps = [{ v: cnt[id] + 1, c: 'c_fewest', why: id === 'q' ? (cnt.q + 1) + ' quarters is ' + (25 * cnt.q + 25) + '¢, more than ' + t + '¢.' : 'Use the biggest coins first; that leaves less for the ' + c.many + '.' }];
      if (Math.floor(t / c.v) !== cnt[id]) traps.push({ v: Math.floor(t / c.v), c: 'c_fewest', why: 'Start with the biggest coin, the quarter, before the ' + c.many + '.' });
      return { text: 'Make ' + B(fmtM(t)) + ' with quarters, dimes, nickels and pennies. Use as few coins as you can. How many ' + B(c.many) + ' do you use?', ans: cnt[id],
        how: ['Biggest coin first, as many as fit: ' + coinNames(g) + '.', 'Count on to check: ' + countOn(g) + '. That uses ' + B(cnt[id]) + ' ' + plural(cnt[id], c.name, c.many) + '.'],
        steps: [{ text: 'How many quarters fit in ' + B(fmtM(t)) + '?', ans: cnt.q || 0 }, money('Take ' + B((cnt.q || 0) + ' ' + plural(cnt.q || 0, 'quarter')) + ' away from ' + B(fmtM(t)) + '. How much is left?', t - 25 * (cnt.q || 0))], traps };
    }
    const allowed = d === 0 ? ['d', 'n', 'p'] : d === 1 ? ['q', 'd', 'n', 'p'] : ['b1', 'q', 'd', 'n', 'p'];
    let t; do { t = d === 0 ? R.i(11, 29) : d === 1 ? R.i(30, 99) : R.i(101, 199); } while (greedy(t, allowed).length < 3);
    const g = greedy(t, allowed), cnt = {}; g.forEach(id => cnt[id] = (cnt[id] || 0) + 1);
    const kinds = COIN_ORDER.filter(id => cnt[id]), word = d === 2 ? 'bills and coins' : 'coins';
    let left = t; const parts = kinds.map(id => { const k = cnt[id], v = k * COIN[id].v; left -= v; return k + ' ' + plural(k, COIN[id].name, COIN[id].many) + ' (' + fmtM(v) + ')' + (left ? ', ' + fmtM(left) + ' left' : ''); });
    const use = d === 0 ? 'dimes, nickels and pennies' : d === 1 ? 'quarters, dimes, nickels and pennies' : 'dollar bills, quarters, dimes, nickels and pennies';
    const first = kinds[0], k0 = cnt[first], left0 = t - k0 * COIN[first].v, restN = g.length - k0;
    const steps = [{ text: 'How many ' + COIN[first].many + ' fit in ' + B(fmtM(t)) + '?', ans: k0 }];
    if (left0) steps.push(money('Take ' + B(k0 + ' ' + plural(k0, COIN[first].name, COIN[first].many)) + ' away from ' + B(fmtM(t)) + '. How much is left?', left0), { text: 'Make ' + B(fmtM(left0)) + ' with as few coins as you can. How many coins is that?', ans: restN }, { text: B(k0 + ' + ' + restN + ' = ?'), ans: g.length });
    const traps = [];
    if (cnt.b1) traps.push({ v: g.length + 3, c: 'c_fewest', why: 'One dollar bill is fewer than 4 quarters.' });
    if (cnt.q) traps.push({ v: g.length + 2, c: 'c_fewest', why: 'That amount works, but a quarter can take the place of dimes and a nickel.' });
    if (cnt.d) traps.push({ v: g.length + 1, c: 'c_fewest', why: 'That amount works, but one dime is fewer than 2 nickels.' });
    if (cnt.n) traps.push({ v: g.length + 4, c: 'c_fewest', why: 'That amount works, but one nickel is fewer than 5 pennies.' });
    return { text: 'Make ' + B(fmtM(t)) + ' with ' + use + '. Use as few ' + word + ' as you can. How many ' + word + ' do you use?', ans: g.length,
      how: ['Biggest first, as many as fit: ' + parts.join('; ') + '.', 'Count them: ' + kinds.map(id => cnt[id]).join(' + ') + ' = ' + B(g.length) + ' ' + word + '.'],
      steps: steps.length > 1 ? steps : [], traps: traps.slice(0, 3) };
  } },

{ id: 'c_dollars', s: 'money', g: 3, title: 'Dollars and cents',
  tip: '100¢ is one dollar. The dot separates dollars from cents: $2.35 is 2 dollars and 35 cents. 135¢ = $1.35, and $3.05 is 305¢ (the 0 means no dimes).',
  gen(d, R) {
    const toC = c => { const dl = Math.floor(c / 100), ct = c % 100, traps = [{ v: ct, c: 'c_dollars', why: 'Count the dollars too: each dollar is 100¢.' }, { v: dl + ct, c: 'c_dollars', why: 'Each dollar is 100¢, not 1¢.' }];
      if (ct < 10) traps.unshift({ v: dl * 100 + ct * 10, c: 'c_dollars', why: 'Watch the 0 after the dot: it means no dimes, so ' + fmtD(c) + ' has just ' + ct + ' ' + plural(ct, 'cent') + '.' });
      return money('How many cents is ' + B(fmtD(c)) + '?', c, { fmt: 'c', how: ['Each dollar is 100¢: ' + dl + ' ' + plural(dl, 'dollar') + ' = ' + (dl * 100) + '¢.' + (ct < 10 ? ' The 0 after the dot means no dimes.' : ''), (dl * 100) + '¢ + ' + ct + '¢ = ' + B(c + '¢') + '.'],
        steps: [money('How many cents is ' + B(dl + ' ' + plural(dl, 'dollar')) + '?', dl * 100, { fmt: 'c' }), money(B((dl * 100) + '¢ + ' + ct + '¢ = ?'), c, { fmt: 'c' })], traps }); };
    if (d === 0) {
      const c = R.i(1, 4) * 100 + R.i(1, 99), dl = Math.floor(c / 100), ct = c % 100;
      if (R.chance(.5)) return toC(c);
      const traps = [{ v: c * 10, c: 'c_dollars', why: 'Two digits after the dot are the cents: ' + ct + '¢ goes right after the dot.' }];
      if (ct < 10) traps.push({ v: dl * 100 + ct * 10, c: 'c_dollars', why: ct + '¢ is less than a dime, so write 0' + ct + ' after the dot.' });
      return money('Write ' + B(c + '¢') + ' in dollars, with a dot.', c, { fmt: 'd',
        how: ['100¢ is one dollar. ' + c + '¢ = ' + (dl * 100) + '¢ + ' + ct + '¢ = ' + dl + ' ' + plural(dl, 'dollar') + ' and ' + ct + ' ' + plural(ct, 'cent') + '.', 'Dollars, then the dot, then two digits of cents: ' + B(fmtD(c)) + '.'],
        steps: [{ text: 'How many whole dollars are in ' + B(c + '¢') + '?', ans: dl }, { text: 'Take ' + B(dl + ' ' + plural(dl, 'dollar')) + ' out of ' + B(c + '¢') + '. How many cents are left over?', ans: ct }], traps });
    }
    if (d === 1) {
      const bills = R.i(1, 3), coins = randomCoins(R, 1), lst = Array(bills).fill('b1').concat(coins), v = coinsOf(lst), cv = coinsOf(coins);
      return money('How much money is this?', v, { vis: coinsRow(lst), say: 'How much money is this? ' + coinNames(lst),
        how: ['Count the dollars first: ' + bills + ' ' + plural(bills, 'dollar') + ' = ' + fmtD(bills * 100) + '.', 'Then the coins: ' + countOn(coins) + '.', 'Together: ' + B(fmtD(v)) + '.'],
        steps: [money('How much money is ' + B(bills + ' ' + plural(bills, 'dollar bill')) + '?', bills * 100), money('How much money is ' + B(coinNames(coins).replace(', ', ' and ')) + '?', cv, { fmt: 'c' })],
        traps: [{ v: cv + bills, c: 'c_dollars', why: 'Each dollar bill is 100¢, so it counts as $1.00.' }, { v: v + 100, c: 'c_count', why: 'Count the dollar bills again.' }, { v: swapND(lst), c: 'c_coins', why: 'A dime is 10¢ and a nickel is 5¢.' }] });
    }
    return R.pick([
      () => toC(R.i(2, 9) * 100 + R.i(1, 9)),
      () => { const dl = R.i(2, 9), dm = R.i(1, 9), pn = R.i(1, 9), c = dl * 100 + dm * 10 + pn;
        return money('How much money is ' + B(dl + ' dollars, ' + dm + ' ' + plural(dm, 'dime') + ' and ' + pn + ' ' + plural(pn, 'penny', 'pennies')) + '?', c, { fmt: 'd',
          how: [dl + ' dollars = ' + fmtD(dl * 100) + '. ' + dm + ' ' + plural(dm, 'dime') + ' = ' + (dm * 10) + '¢. ' + pn + ' ' + plural(pn, 'penny', 'pennies') + ' = ' + pn + '¢.', 'Dimes go in the tens place of the cents: ' + B(fmtD(c)) + '.'],
          steps: [money('How many cents are ' + B(dm + ' ' + plural(dm, 'dime') + ' and ' + pn + ' ' + plural(pn, 'penny', 'pennies')) + '?', dm * 10 + pn, { fmt: 'c' })],
          traps: [{ v: dl * 100 + pn * 10 + dm, c: 'c_dollars', why: 'Dimes are tens of cents and pennies are ones: the dimes digit comes first.' }, { v: dl * 100 + dm + pn, c: 'c_coins', why: 'A dime is 10¢, not 1¢.' }] }); },
      () => { const dl = R.i(1, 6), q = R.i(1, 3), c = dl * 100 + 25 * q;
        return money('How much money is ' + B(dl + ' ' + plural(dl, 'dollar') + ' and ' + q + ' ' + plural(q, 'quarter')) + '?', c, { fmt: 'd',
          how: [q + ' ' + plural(q, 'quarter') + ': ' + list(25, q) + '¢.', fmtD(dl * 100) + ' + ' + (25 * q) + '¢ = ' + B(fmtD(c)) + '.'],
          traps: [{ v: dl * 100 + q, c: 'c_coins', why: 'A quarter is 25¢.' }, { v: (dl + q) * 100, c: 'c_coins', why: 'A quarter is 25¢, not a dollar.' }] }); }])();
  } },

{ id: 'c_add', s: 'money', g: 3, title: 'Add prices: round to a dollar, then fix', pre: ['a_compensate'],
  tip: 'Prices like $2.99 are almost $3. Add $3, then take the 1¢ back. $2.99 + $1.40 → $3.00 + $1.40 = $4.40, take 1¢ back → $4.39.',
  gen(d, R) {
    const it = R.shuffle(SHOP);
    if (d === 2 && R.chance(.35)) {
      const a = R.i(1, 3) * 100 + 25, c = R.i(0, 2) * 100 + 75, b = R.i(1, 2) * 100 + R.i(1, 9) * 10, ans = a + b + c;
      return money('How much do all three cost together?', ans, { vis: tagsHTML([[...it[0], a], [...it[1], b], [...it[2], c]]),
        how: ['Find friends first: 25¢ + 75¢ make a dollar. ' + fmtD(a) + ' + ' + fmtM(c) + ' = ' + fmtD(a + c) + '.', fmtD(a + c) + ' + ' + fmtD(b) + ' = ' + B(fmtD(ans)) + '.'],
        steps: [money(B(fmtD(a) + ' + ' + fmtM(c) + ' = ?'), a + c), money(B(fmtD(a + c) + ' + ' + fmtD(b) + ' = ?'), ans)],
        traps: [{ v: ans - 100, c: 'a_regroup', why: '25¢ + 75¢ is a whole dollar. Carry it into the dollars.' }, { v: ans + 100, c: 'c_dollars', why: 'Check the dollars.' }] });
    }
    let a, b;
    if (d === 0) { a = R.pick([99, 98, 95]); b = R.i(3, 18) * 5; }
    else if (d === 1) { a = R.i(1, 4) * 100 + R.pick([99, 98, 95]); b = R.i(1, 4) * 100 + R.i(1, 9) * 10; }
    else { a = R.i(1, 5) * 100 + R.pick([99, 98, 95]); b = R.i(1, 4) * 100 + R.pick([99, 98]); }
    const F = Math.ceil(a / 100) * 100, k = F - a, ans = a + b, both = d === 2;
    const G = both ? Math.ceil(b / 100) * 100 : b, k2 = G - b, kk = k + k2;
    const how = both ? [fmtM(a) + ' is almost ' + fmtD(F) + ' (' + k + '¢ less). ' + fmtD(b) + ' is almost ' + fmtD(G) + ' (' + k2 + '¢ less).', fmtD(F) + ' + ' + fmtD(G) + ' = ' + fmtD(F + G) + '.', 'Take back ' + k + '¢ + ' + k2 + '¢ = ' + kk + '¢: ' + B(fmtD(ans)) + '.']
      : [fmtM(a) + ' is ' + k + '¢ less than ' + fmtD(F) + '. Add ' + fmtD(F) + ' instead.', fmtD(F) + ' + ' + fmtM(b) + ' = ' + fmtD(F + b) + '.', 'Take back the ' + k + '¢: ' + fmtD(F + b) + ' ' + MINUS + ' ' + k + '¢ = ' + B(fmtD(ans)) + '.'];
    const steps = both ? [money(B(fmtD(F) + ' + ' + fmtD(G) + ' = ?'), F + G), money('You rounded up by ' + B(k + '¢') + ' and by ' + B(k2 + '¢') + '. How many extra cents is that?', kk, { fmt: 'c' }), money(B(fmtD(F + G) + ' ' + MINUS + ' ' + kk + '¢ = ?'), ans)]
      : [money('Round ' + B(fmtM(a)) + ' up to the next dollar. What do you get?', F), money(B(fmtD(F) + ' + ' + fmtM(b) + ' = ?'), F + b), money(B(fmtD(F + b) + ' ' + MINUS + ' ' + k + '¢ = ?'), ans)];
    return money('How much do the ' + it[0][1] + ' and the ' + it[1][1] + ' cost together?', ans, { vis: tagsHTML([[...it[0], a], [...it[1], b]]), how, steps,
      traps: [{ v: ans + kk, c: 'a_compensate', why: 'You added the round ' + (both ? 'prices' : 'price') + '. Now take back the ' + kk + '¢ extra.' }, { v: ans + 2 * kk, c: 'a_compensate', why: 'You rounded up, so take the ' + kk + '¢ away, not add it.' },
              { v: ans + 100, c: 'c_dollars', why: 'Check the dollars.' }, { v: ans - 10, c: 'a_regroup', why: 'Check the cents: when they make 10 or more, carry.' }] });
  } },

{ id: 'c_change', s: 'money', g: 3, title: 'Make change from $1: count up', pre: ['a_countup'],
  tip: 'Count up from the price to the money you paid, the way a cashier does. Paid $1 for 65¢: 65¢ → 70¢ is 5¢, 70¢ → $1.00 is 30¢. Change: 35¢.',
  gen(d, R) {
    let price, paid;
    if (d === 0) { paid = 100; price = R.i(10, 19) * 5; }
    else if (d === 1) { paid = 100; do { price = R.i(11, 94); } while (price % 5 === 0); }
    else if (R.chance(.5)) { paid = 50; do { price = R.i(11, 44); } while (price % 5 === 0); } else { paid = 200; price = R.i(22, 39) * 5; }
    const { hops, lines } = countUpHops(price, paid), ans = paid - price, it = R.pick(SHOP);
    const head = 'Count up from ' + fmtM(price) + ' to ' + fmtM(paid) + ', like a cashier.';
    const how = (lines.length >= 3 ? [] : [head]).concat(lines, [hops.length > 1 ? 'Change: ' + hops.map(fmtM).join(' + ') + ' = ' + B(fmtM(ans)) + '.' : 'Change: ' + B(fmtM(ans)) + '.']);
    let at = price; const steps = hops.map(hp => { const s = money('Count up from ' + B(fmtM(at)) + ' to ' + B(fmtM(at + hp)) + '. How much is that?', hp, { fmt: 'c' }); at += hp; return s; });
    if (hops.length > 1) steps.push(money(B(hops.map(fmtM).join(' + ') + ' = ?'), ans, { fmt: 'c' }));
    const traps = [{ v: ans + 10, c: paid === 100 && price % 10 ? 'a_from100' : 'c_change', why: paid === 100 && price % 10 ? 'For $1.00, the tens add up to 9, not 10, because the ones make another ten.' : price % 10 ? 'Count up in hops: to the next ten, then to ' + fmtM(paid) + '.' : 'Count up by 10s from ' + fmtM(price) + ' to ' + fmtM(paid) + '.' },
                   { v: ans - 10, c: 'c_change', why: price % 10 ? 'Count up in hops: to the next ten, then to ' + fmtM(paid) + '.' : 'Count up by 10s from ' + fmtM(price) + ' to ' + fmtM(paid) + '.' }];
    if (price % 5) traps.push({ v: ans + 5, c: 'c_change', why: 'Check the first hop, up to the next 5 or 10.' });
    return money('You buy the ' + it[1] + ' and pay ' + B(fmtM(paid)) + '. How much change do you get?', ans, { fmt: 'c', vis: tagsHTML([[...it, price]]), how,
      say: C.sayOf('The ' + it[1] + ' costs ' + fmtM(price) + '. You pay ' + fmtM(paid) + '. How much change do you get?'),
      howVis: hopsSVG(price, hops, { fmt: fmtM, lab: fmtM }), steps, traps });
  } },

{ id: 'c_change5', s: 'money', g: 4, title: 'Change from $5, $10 and $20', paper: true,
  tip: 'Count up to the next whole dollar first, then count the dollars. Paid $5 for $3.40: $3.40 → $4.00 is 60¢, $4.00 → $5.00 is $1. Change: $1.60.',
  gen(d, R) {
    let price, paid;
    if (d === 0) { paid = R.pick([500, 1000]); price = R.i(1, paid / 100 - 1) * 100; }
    else if (d === 1) { paid = R.pick([500, 1000]); price = R.i(1, paid / 100 - 1) * 100 + R.i(1, 19) * 5; }
    else { paid = R.pick([1000, 2000]); price = R.i(paid / 200, paid / 100 - 1) * 100 + R.pick([99, 95, 65, 45, 15, 29, 79, 38, 52]); }
    const ans = paid - price, nd = Math.ceil(price / 100) * 100, a = nd - price, b = paid - nd, it = R.pick(SHOP);
    if (d > 0 && !b) return null;
    const text = 'You buy the ' + it[1] + ' and pay with ' + B(fmtD(paid)) + '. How much change do you get?', say = C.sayOf('The ' + it[1] + ' costs ' + fmtD(price) + '. You pay with ' + fmtD(paid) + '. How much change do you get?');
    if (!a) return money(text, ans, { fmt: 'd', say, vis: tagsHTML([[...it, price]]),
      how: ['Count up the dollars from ' + fmtD(price) + ' to ' + fmtD(paid) + ': ' + Array.from({ length: b / 100 }, (_, i) => '$' + (price / 100 + i + 1)).join(', ') + '.', 'That is ' + (b / 100) + ' ' + plural(b / 100, 'dollar') + ': ' + B(fmtD(ans)) + '.'],
      traps: [{ v: ans + 100, c: 'c_change5', why: 'Count the jumps from dollar to dollar, not the numbers you say.' }, ans > 100 ? { v: ans - 100, c: 'c_change5', why: 'Count every dollar up to ' + fmtD(paid) + '.' } : null].filter(Boolean) });
    const traps = [{ v: ans + 100, c: 'c_change5', why: 'One dollar too many. After the hop to ' + fmtD(nd) + ', count just the whole dollars to ' + fmtD(paid) + '.' },
                   { v: b, c: 'c_change5', why: 'You counted the dollars but forgot the ' + fmtM(a) + ' up to ' + fmtD(nd) + '.' },
                   { v: ans + 10, c: a % 10 ? 'a_from100' : 'c_change5', why: a % 10 ? 'Check the cents hop: the tens add up to 9, not 10, because the ones make another ten.' : 'Check the cents hop up to ' + fmtD(nd) + '.' }];
    return money(text, ans, { fmt: 'd', say, vis: tagsHTML([[...it, price]]),
      hint: 'First count up from ' + fmtD(price) + ' to ' + fmtD(nd) + ', the next whole dollar.',
      how: [fmtD(price) + ' → ' + fmtD(nd) + ' is ' + fmtM(a) + '.', fmtD(nd) + ' → ' + fmtD(paid) + ' is ' + fmtD(b) + '.', fmtM(a) + ' + ' + fmtD(b) + ' = ' + B(fmtD(ans))],
      howVis: hopsSVG(price, [a, b], { fmt: fmtD, lab: fmtM }),
      steps: [money('Count up from ' + B(fmtD(price)) + ' to ' + B(fmtD(nd)) + '. How much is that?', a, { fmt: 'c' }), money('Count up from ' + B(fmtD(nd)) + ' to ' + B(fmtD(paid)) + '. How much is that?', b), money(B(fmtM(a) + ' + ' + fmtD(b) + ' = ?'), ans)],
      traps });
  } },

{ id: 'c_budget', s: 'money', g: 4, title: 'How many can you buy? What is left?', paper: true, pre: ['m_remain'],
  tip: 'Times finds the cost of several. To see how many you can buy, find the biggest times fact that fits your money; the remainder is what is left. 60¢ each with $5: 60 × 8 = 480, so 8, with 20¢ left.',
  gen(d, R) {
    const it = R.pick(SHOP), nm = it[1], nms = nm + 's';
    if (d === 0) {
      const k = R.i(2, 5), p = R.i(1, 9) * 5, ans = k * p;
      return money('One ' + nm + ' costs ' + B(p + '¢') + '. How much do ' + B(k + ' ' + nms) + ' cost?', ans, {
        how: [k + ' at ' + p + '¢ each is ' + X(k, p) + '.', 'Count by ' + p + 's: ' + list(p, k) + '. That is ' + B(fmtM(ans)) + '.'],
        steps: k > 2 ? [money('One ' + nm + ' costs ' + B(p + '¢') + '. How much do ' + B('2 ' + nms) + ' cost?', 2 * p), money(B('2 ' + nms) + ' cost ' + B(fmtM(2 * p)) + '. Count on by ' + p + 's until you get to ' + B(k + ' ' + nms) + '. How much is that?', ans)] : [],
        traps: [{ v: k + p, c: 'm_groups', why: 'You added. ' + k + ' ' + nms + ' at ' + p + '¢ each is ' + k + ' groups of ' + p + '.' }, { v: ans - p, c: 'c_budget', why: 'One ' + nm + ' short. Count by ' + p + 's once for each ' + nm + '.' }, { v: ans + p, c: 'c_budget', why: 'One ' + nm + ' too many. There are ' + k + '.' }] });
    }
    const howMany = (p, have, askLeft) => {
      const k = Math.floor(have / p), left = have - k * p, haveTxt = fmtD(have) + ' = ' + n(have) + '¢.';
      const lines = [haveTxt, k <= 6 ? 'Count up by ' + p + ': ' + list(p, k) + '.' : X(p, k) + ' = ' + (k * p) + '.', 'One more would be ' + ((k + 1) * p) + '¢, more than you have.'];
      if (askLeft) return money('One ' + nm + ' costs ' + B(p + '¢') + '. You have ' + B(fmtD(have)) + '. You buy as many ' + nms + ' as you can. How much money is left?', left, { fmt: 'c',
        how: lines.concat([less(have, k * p) + ' = ' + B(left + '¢') + ' left.']),
        steps: [{ text: 'One ' + nm + ' costs ' + B(p + '¢') + '. How many ' + nms + ' can you buy with ' + B(fmtD(have)) + '?', ans: k }, money('One ' + nm + ' costs ' + B(p + '¢') + '. You buy ' + B(k + ' ' + plural(k, nm)) + '. How much do you spend?', k * p), money(B(n(have) + '¢ ' + MINUS + ' ' + (k * p) + '¢ = ?'), left, { fmt: 'c' })],
        traps: [{ v: k, c: 'c_budget', why: 'That is how many you can buy. The question asks how much money is left.' }, { v: left + p, c: 'm_remain', why: 'With that much left you could buy one more. Buy as many as you can first.' }, { v: p - left, c: 'm_remain', why: 'That is how much more you would need for another one. Find what is left.' }] });
      return { text: 'One ' + nm + ' costs ' + B(p + '¢') + '. You have ' + B(fmtD(have)) + '. How many ' + nms + ' can you buy?', ans: k,
        how: lines.concat([(left ? 'With ' + left + '¢ left over, you can buy ' : 'With nothing left over, you can buy ') + B(k) + '.']),
        steps: [{ text: 'One ' + nm + ' costs ' + B(p + '¢') + '. You buy ' + B(k + ' ' + plural(k, nm)) + '. How many cents do you spend?', ans: k * p }, { text: 'You have ' + B(n(have) + '¢') + '. ' + B(k + ' ' + plural(k, nm)) + ' ' + plural(k, 'costs', 'cost') + ' ' + B(n(k * p) + '¢') + '. ' + B((k + 1) + ' ' + nms) + ' cost ' + B(n((k + 1) * p) + '¢') + '. How many ' + nms + ' can you buy?', ans: k }],
        traps: [{ v: k + 1, c: 'm_remain', why: 'You can’t buy part of one: ' + ((k + 1) * p) + '¢ is more than you have.' }, { v: k - 1, c: 'c_budget', why: 'Check: one more still fits in ' + fmtD(have) + '.' }].concat(left ? [{ v: left, c: 'm_remain', why: 'That is the money left over. The question asks how many you can buy.' }] : []) };
    };
    if (d === 1) {
      const kind = R.i(0, 2);
      if (kind === 0) return howMany(R.pick([15, 20, 25, 30, 35, 40, 45, 60]), R.pick([100, 200]), false);
      if (kind === 1) { const p = R.pick([15, 30, 35, 40, 45, 60, 70]), have = R.pick([100, 200]); if (have % p === 0) return null; return howMany(p, have, true); }
      const cost = R.i(11, 19) * 10 + R.pick([0, 5]), have = R.i(5, 9) * 10 + R.pick([0, 5]), ans = cost - have, a = 100 - have, b = cost - 100;
      return money('The ' + nm + ' costs ' + B(fmtD(cost)) + '. You have ' + B(have + '¢') + '. How much more money do you need?', ans, { fmt: 'c',
        how: [have + '¢ → $1.00 is ' + a + '¢.', '$1.00 → ' + fmtD(cost) + ' is ' + b + '¢.', a + '¢ + ' + b + '¢ = ' + B(ans + '¢')],
        howVis: hopsSVG(have, [a, b], { fmt: fmtM, lab: fmtM }),
        steps: [money('Count up from ' + B(have + '¢') + ' to ' + B('$1.00') + '. How much is that?', a, { fmt: 'c' }), money('Count up from ' + B('$1.00') + ' to ' + B(fmtD(cost)) + '. How much is that?', b, { fmt: 'c' }), money(B(a + '¢ + ' + b + '¢ = ?'), ans, { fmt: 'c' })],
        traps: [{ v: ans + 10, c: 'a_from100', why: 'Check the hop to $1.00: the tens add to 9, not 10, when there are ones.' }, { v: b, c: 'c_budget', why: 'Count up from ' + have + '¢ to $1.00 too.' }, { v: ans + 100, c: 'c_dollars', why: 'You need less than a dollar more. Check the hops.' }] });
    }
    const kind = R.i(0, 2);
    if (kind === 0) {
      const k = R.i(3, 6), p = R.pick([125, 150, 175, 225, 250, 199, 135]), dl = Math.floor(p / 100), ct = p % 100, ans = k * p;
      return money('One ' + nm + ' costs ' + B(fmtD(p)) + '. How much do ' + B(k + ' ' + nms) + ' cost?', ans, { fmt: 'd',
        how: [fmtD(p) + ' = $' + dl + ' + ' + ct + '¢', k + ' × $' + dl + ' = ' + fmtD(k * dl * 100), k + ' × ' + ct + '¢ = ' + fmtM(k * ct), fmtD(k * dl * 100) + ' + ' + fmtM(k * ct) + ' = ' + B(fmtD(ans))],
        steps: [money(B(k + ' × $' + dl + ' = ?'), k * dl * 100), money(B(k + ' × ' + ct + '¢ = ?'), k * ct), money(B(fmtD(k * dl * 100) + ' + ' + fmtM(k * ct) + ' = ?'), ans)],
        traps: [{ v: k * dl * 100 + ct, c: 'm_breakapart', why: 'The cents need × ' + k + ' too.' }, { v: ans - p, c: 'c_budget', why: 'One ' + nm + ' short. Times the price by ' + k + '.' }, { v: ans - 100, c: 'a_regroup', why: 'The cents made more than a dollar. Carry it.' }] });
    }
    const p = R.pick([60, 45, 70, 35, 80, 65, 55]), have = R.pick([500, 1000]);
    if (have % p === 0) return null;
    return howMany(p, have, kind === 2);
  } },

{ id: 'c_unit', s: 'money', g: 5, title: 'Better buy: the price for one', paper: true, pre: ['m_divfam'],
  tip: 'To compare packs, find the price for one: divide the price by how many. 3 for $1.20 is 40¢ each; 5 for $1.50 is 30¢ each, so the 5-pack is the better buy.',
  gen(d, R) {
    const it = R.pick(SHOP), nms = it[1] + 's';
    const each = (tot, k) => (tot >= 100 ? fmtD(tot) + ' = ' + n(tot) + '¢. ' : '') + n(tot) + '¢ ÷ ' + k + ' = ' + (tot / k) + '¢ each';
    if (d === 0) {
      const k = R.i(2, 6), per = R.i(2, 18) * 5, tot = k * per;
      return money(B(k + ' ' + nms) + ' cost ' + B(fmtM(tot)) + ' together. How much does one ' + it[1] + ' cost?', per, { fmt: 'c',
        how: ['Price for one = ' + fmtM(tot) + ' ÷ ' + k + '.'].concat(tot >= 100 ? [fmtD(tot) + ' = ' + tot + '¢.'] : [], ['Think: ' + k + ' × ? = ' + tot + '. ' + X(k, per) + ' = ' + tot + ', so one costs ' + B(per + '¢') + '.']),
        steps: (tot >= 100 ? [{ text: 'How many cents is ' + B(fmtM(tot)) + '?', ans: tot }] : []).concat([money(B(k + ' × ? = ' + tot), per, { fmt: 'c' })]),
        traps: [{ v: tot - k, c: 'm_share', why: 'Divide by ' + k + ', don’t take ' + k + ' away.' }, { v: per + 5, c: 'm_divfam', why: 'Check: ' + X(k, per + 5) + ' = ' + (k * (per + 5)) + ', not ' + tot + '.' }, { v: per - 5, c: 'm_divfam', why: 'Check: ' + X(k, per - 5) + ' = ' + (k * (per - 5)) + ', not ' + tot + '.' }] });
    }
    const big = d === 2, ks = R.shuffle(big ? [4, 5, 6, 8, 10, 12] : [2, 3, 4, 5, 6]), k1 = ks[0], k2 = ks[1];
    const p1 = (big ? R.i(5, 30) : R.i(2, 18)) * 5; let p2; do { p2 = (big ? R.i(5, 30) : R.i(2, 18)) * 5; } while (p2 === p1 || Math.abs(p2 - p1) > 40);
    const t1 = k1 * p1, t2 = k2 * p2, lo = Math.min(p1, p2), hi = Math.max(p1, p2), loT = p1 < p2 ? t1 : t2;
    const vis = tagsHTML([[it[0], 'Pack A: ' + k1 + ' ' + nms, t1], [it[0], 'Pack B: ' + k2 + ' ' + nms, t2]]);
    const how = ['Pack A: ' + each(t1, k1) + '.', 'Pack B: ' + each(t2, k2) + '.'];
    const steps = [money('Pack A has ' + B(k1 + ' ' + nms) + ' for ' + B(fmtM(t1)) + '. What is the price for one ' + it[1] + '?', p1, { fmt: 'c' }), money('Pack B has ' + B(k2 + ' ' + nms) + ' for ' + B(fmtM(t2)) + '. What is the price for one ' + it[1] + '?', p2, { fmt: 'c' })];
    if (big && R.chance(.5)) {
      return money('The better buy is the pack where one ' + it[1] + ' costs less. How much less does one ' + it[1] + ' cost in that pack?', hi - lo, { fmt: 'c', vis,
        how: how.concat([less(hi, lo) + ' = ' + B((hi - lo) + '¢') + ' saved on each one.']),
        steps: steps.concat([money(B(hi + '¢ ' + MINUS + ' ' + lo + '¢ = ?'), hi - lo, { fmt: 'c' })]),
        traps: [{ v: Math.abs(t1 - t2), c: 'c_unit', why: 'That compares whole packs. Compare the price for one.' }, { v: lo, c: 'c_unit', why: 'That is the price for one in the better pack. Now find the difference.' }, { v: hi, c: 'c_unit', why: 'That is a price for one. The question asks how much you save on each.' }] });
    }
    return money('The better buy is the pack where one ' + it[1] + ' costs less. How much does one ' + it[1] + ' cost in that pack?', lo, { fmt: 'c', vis,
      how: how.concat(['The better buy costs less for one: ' + B(lo + '¢') + '.']), steps,
      traps: [{ v: hi, c: 'c_unit', why: 'That pack costs more for each one. The better buy is the cheaper price for one.' }, { v: loT, c: 'c_unit', why: 'That is the price of the whole pack. Divide to find the price for one.' }, { v: lo + 5, c: 'm_divfam', why: 'Check the division: times your answer by the number in the pack.' }] });
  } },
].map(clean));
})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
