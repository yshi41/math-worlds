/* Math Worlds concepts, file c: Algebra & Functions (grades 3 to 11) and Data & Chance (grades 3 to 12).
   Each concept is one narrow idea. The how lines teach the shortcut with the problem's own numbers, the steps break
   it into small questions, and the traps point each likely mistake at the concept it shows a gap in. */
(function (C) {
'use strict';
const { B, num, MINUS, signed, par2, gcd, reduce, frac, pw, rt, term, poly, sum, plural, ord, NAMES, barSVG, plotSVG, table, seqHTML } = C;

/* ---------- small helpers for this file ---------- */
const tr = (v, c, why) => ({ v, c, why });
const F = (a, b) => { const r = reduce(a, b); return { n: r[0], d: r[1] }; };          /* a fraction answer in lowest terms */
const fr = (a, b) => { const r = reduce(a, b); return frac(r[0], r[1]); };             /* show a fraction in lowest terms */
const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
const nz = (R, lo, hi) => { let v; do { v = R.i(lo, hi); } while (v === 0); return v; };
const pt = (x, y) => '(' + num(x) + ', ' + num(y) + ')';
const bin = (p, a, v) => '(' + term(p, v || 'x') + ' ' + signed(a) + ')';             /* (x + 3), (2x − 5) */
const LT = '&lt;', GT = '&gt;', LE = '≤', GE = '≥';
const sq = v => pw(par2(v), 2);
/* a stacked fraction with letters in it: fl('x', 4), fl('x + 3', 2) */
const fl = (t, b) => '<span class="fr"><span class="fr-n">' + t + '</span><span class="fr-d">' + b + '</span></span>';                                                         /* 5², (−3)² */
/* the times-fact concept a slip on a × b points to */
function fx(a, b) {
  a = Math.abs(a); b = Math.abs(b); const h = k => a === k || b === k;
  if (a === b && a > 2 && a < 13) return 'm_squares';
  return h(7) ? 'm_x7' : h(8) || h(4) ? 'm_x4x8' : h(6) || h(3) ? 'm_x3x6' : h(9) ? 'm_x9' : h(11) || h(12) ? 'm_x11' : 'm_x2510';
}
/* a sum of terms: ex([[3,'x'],[-2,''],[1,'y']]) is "3x − 2 + y" */
function ex(list) {
  return list.map((t, i) => {
    const c = t[0], body = t[1] ? (Math.abs(c) === 1 ? '' : num(Math.abs(c))) + t[1] : num(Math.abs(c));
    return i === 0 ? (c < 0 ? MINUS : '') + body : (c < 0 ? ' ' + MINUS + ' ' : ' + ') + body;
  }).join('');
}
/* one line of written work with a short note after it, for paper concepts */
const W = (work, note) => work + (note ? ' &nbsp; (' + note + ')' : '');
/* the last written lines of solving k·v = rhs: one line if k is 1, else "kv = rhs" then "v = …" */
const isol = (k, v, rhs, note, bold) => { const val = rhs / k, vs = bold ? B(num(val)) : num(val); return k === 1 ? [W(v + ' = ' + vs, note)] : [W(term(k, v) + ' = ' + num(rhs), note), W(v + ' = ' + vs, 'divide both sides by ' + num(k))]; };
const lin2 = (a, b, c) => ex([[a, 'x'], [b, 'y']]) + ' = ' + num(c);                    /* 2x + 3y = 12 */

/* gap patterns (sorted, adding to 0, each gap at most 6) whose squares average to a perfect square: data sets with a
   whole-number standard deviation. SDP[n] lists the patterns for n numbers. */
const SDP = {};
(function () {
  for (const n of [4, 5, 6]) {
    const out = SDP[n] = [], cur = [];
    (function rec(lo, k) {
      if (k === n - 1) { const last = -sum(cur); if (last < lo || last > 6) return; const p = cur.concat([last]), ms = sum(p.map(v => v * v)) / n, s = Math.round(Math.sqrt(ms)); if (ms > 0 && s * s === ms) out.push(p); return; }
      for (let v = lo; v <= 6; v++) { cur.push(v); rec(v, k + 1); cur.pop(); }
    })(-6, 0);
  }
})();

const DEFS = [
/* ======================= Algebra & Functions ======================= */
{ id: 'x_missing', s: 'alg', g: 3, title: 'Missing numbers: undo it', pre: ['a_thinkadd', 'm_divfam'],
  tip: 'Undo what was done. 7 + ? = 15: undo the + 7 by taking 7 away, so 15 − 7 = 8. ? × 6 = 42: undo × 6 with ÷ 6, so 42 ÷ 6 = 7.',
  gen(d, R) {
    const kind = d === 0 ? R.pick(['add', 'add', 'sub2']) : d === 1 ? R.pick(['sub1', 'sub2', 'mul', 'mul']) : R.pick(['add', 'sub1', 'mul', 'div', 'div']);
    const ask = s => 'What number goes in the box? ' + B(s);
    if (kind === 'add') {
      const a = d === 0 ? R.i(2, 9) : R.i(13, 68), x = d === 0 ? R.i(2, 11) : R.i(12, 79), c = a + x, left = R.chance(.5);
      const traps = [tr(c + a, 'x_missing', 'You added ' + a + '. To undo + ' + a + ', take ' + a + ' away.'),
        tr(x + 1, d ? 'a_subsplit' : 'a_thinkadd', 'Count up from ' + a + ' to ' + c + ' again carefully.')];
      if (d && c % 10 < a % 10) traps.push(tr(x + 10, 'a_borrow', 'When you take ' + a + ' from ' + c + ', you need to trade a ten. Check the tens.'));
      return { text: ask(left ? '? + ' + a + ' = ' + c : a + ' + ? = ' + c), ans: x,
        how: ['The box plus ' + a + ' makes ' + c + '. Undo the + ' + a + ' by taking ' + a + ' away.',
              c + ' ' + MINUS + ' ' + a + ' = ' + B(x) + '. Check: ' + x + ' + ' + a + ' = ' + c + '.'],
        steps: [{ text: B(c + ' ' + MINUS + ' ' + a) + ' = ?', ans: x }, { text: 'Check: ' + B(x + ' + ' + a) + ' = ?', ans: c }], traps };
    }
    if (kind === 'sub1') {
      const c = d === 1 ? R.i(21, 70) : R.i(110, 320), x = d === 1 ? R.i(6, c - 8) : R.i(25, c - 30), b = c - x;
      return { text: ask(c + ' ' + MINUS + ' ? = ' + b), ans: x,
        how: [c + ' take away the box leaves ' + b + '. So the box is the part between ' + b + ' and ' + c + '.',
              c + ' ' + MINUS + ' ' + b + ' = ' + B(x) + '. Check: ' + c + ' ' + MINUS + ' ' + x + ' = ' + b + '.'],
        steps: [{ text: B(c + ' ' + MINUS + ' ' + b) + ' = ?', ans: x }, { text: 'Check: ' + B(c + ' ' + MINUS + ' ' + x) + ' = ?', ans: b }],
        traps: [tr(c + b, 'x_missing', 'The box is taken away from ' + c + ', so it must be smaller than ' + c + '.'),
          c % 10 < b % 10 ? tr(x + 10, 'a_borrow', 'Check the tens when you take ' + b + ' from ' + c + ': you need to trade a ten.') : null, tr(x - 1, 'a_countup', 'Count up from ' + b + ' to ' + c + ' again.')] };
    }
    if (kind === 'sub2') {
      const a = d === 0 ? R.i(2, 9) : R.i(12, 48), b = d === 0 ? R.i(3, 11) : R.i(15, 60), x = a + b;
      return { text: ask('? ' + MINUS + ' ' + a + ' = ' + b), ans: x,
        how: ['Something take away ' + a + ' leaves ' + b + '. Undo the ' + MINUS + ' ' + a + ' by adding ' + a + ' back.',
              b + ' + ' + a + ' = ' + B(x) + '. Check: ' + x + ' ' + MINUS + ' ' + a + ' = ' + b + '.'],
        steps: [{ text: B(b + ' + ' + a) + ' = ?', ans: x }, { text: 'Check: ' + B(x + ' ' + MINUS + ' ' + a) + ' = ?', ans: b }],
        traps: [tr(Math.abs(b - a), 'x_missing', 'Adding undoes taking away. To undo ' + MINUS + ' ' + a + ', add ' + a + ' back.'),
          a % 10 + b % 10 >= 10 ? tr(x - 10, 'a_regroup', 'Check the tens: did you carry when you added?') : null, tr(x + 1, 'a_split', 'Add ' + b + ' + ' + a + ' again carefully.')] };
    }
    if (kind === 'mul') {
      const a = d === 1 ? R.i(2, 9) : R.i(3, 12), x = d === 1 ? R.i(2, 9) : R.i(3, 12), c = a * x, left = R.chance(.5);
      return { text: ask(left ? '? × ' + a + ' = ' + c : a + ' × ? = ' + c), ans: x,
        how: ['Undo × ' + a + ' with ÷ ' + a + '. Think: ' + a + ' × what = ' + c + '?',
              c + ' ÷ ' + a + ' = ' + B(x) + ', because ' + a + ' × ' + x + ' = ' + c + '.'],
        steps: [{ text: B(c + ' ÷ ' + a) + ' = ?', ans: x }, { text: 'Check: ' + B(a + ' × ' + x) + ' = ?', ans: c }],
        traps: [tr(c - a, 'x_missing', 'This is times, so undo it with ÷, not take away.'),
          tr(x + 1, fx(a, x), 'Check: ' + a + ' times your number should make ' + c + '.'), tr(x - 1, fx(a, x), 'Check: ' + a + ' times your number should make ' + c + '.')] };
    }
    const a = R.i(2, 9), b = R.i(3, 12), x = a * b;
    return { text: ask('? ÷ ' + a + ' = ' + b), ans: x,
      how: ['Something shared into ' + a + ' equal groups gives ' + b + ' in each. Undo ÷ ' + a + ' with × ' + a + '.',
            b + ' × ' + a + ' = ' + B(x) + '. Check: ' + x + ' ÷ ' + a + ' = ' + b + '.'],
      steps: [{ text: B(b + ' × ' + a) + ' = ?', ans: x }, { text: 'Check: ' + B(x + ' ÷ ' + a) + ' = ?', ans: b }],
      traps: [tr(b % a === 0 ? b / a : a + b, 'x_missing', 'Times undoes dividing. To undo ÷ ' + a + ', multiply by ' + a + '.'),
        tr(x + a, fx(a, b), 'Check your times fact for ' + b + ' × ' + a + '.'), tr(x - a, fx(a, b), 'Check your times fact for ' + b + ' × ' + a + '.')] };
  } },

{ id: 'x_order', s: 'alg', g: 5, title: 'Order of operations', pre: ['m_breakapart'], paper: true,
  tip: 'Brackets first, then powers, then × and ÷ from left to right, then + and − from left to right. 3 + 4 × 5: do 4 × 5 = 20 first, so 23.',
  gen(d, R) {
    const k = d === 0 ? R.i(0, 2) : R.i(0, 3), M = ' ' + MINUS + ' ', Q = e => 'Work it out: ' + B(e) + ' = ?';
    if (d === 0) {
      if (k === 0) { const a = R.i(2, 20), b = R.i(2, 9), c = R.i(2, 9), p = b * c, ans = a + p, e = a + ' + ' + b + ' × ' + c;
        return { text: Q(e), ans, how: [e, W('= ' + a + ' + ' + p, '× comes before +'), '= ' + B(ans)],
          steps: [{ text: 'Do the × first: ' + B(b + ' × ' + c) + ' = ?', ans: p }, { text: B(a + ' + ' + p) + ' = ?', ans }],
          traps: [tr((a + b) * c, 'x_order', 'You added first. × comes before +.'), tr(ans + b, fx(b, c), 'Check your times fact for ' + b + ' × ' + c + '.')] }; }
      if (k === 1) { const b = R.i(2, 5), c = R.i(2, 5), p = b * c, a = R.i(p + 6, 60), ans = a - p, e = a + M + b + ' × ' + c;
        return { text: Q(e), ans, how: [e, W('= ' + a + M + p, '× comes before ' + MINUS), '= ' + B(ans)],
          steps: [{ text: 'Do the × first: ' + B(b + ' × ' + c) + ' = ?', ans: p }, { text: B(a + M + p) + ' = ?', ans }],
          traps: [tr((a - b) * c, 'x_order', 'You took away first. × comes before ' + MINUS + '.'), a % 10 < p % 10 ? tr(ans + 10, 'a_borrow', 'Check the take away: ' + a + M + p + '.') : null] }; }
      const c = R.i(2, 9), q = R.i(2, 9), b = c * q, a = c * R.i(1, 6), ans = a + q, e = a + ' + ' + b + ' ÷ ' + c;
      return { text: Q(e), ans, how: [e, W('= ' + a + ' + ' + q, '÷ comes before +'), '= ' + B(ans)],
        steps: [{ text: 'Do the ÷ first: ' + B(b + ' ÷ ' + c) + ' = ?', ans: q }, { text: B(a + ' + ' + q) + ' = ?', ans }],
        traps: [tr((a + b) / c, 'x_order', 'You added first. ÷ comes before +.'), tr(a + b, 'x_order', 'Do the ÷ part before you add.')] };
    }
    if (d === 1) {
      if (k === 0) { const a = R.i(2, 12), b = R.i(2, 9), c = R.i(2, 9), s = a + b, ans = s * c, e = '(' + a + ' + ' + b + ') × ' + c;
        return { text: Q(e), ans, how: [e, W('= ' + s + ' × ' + c, 'brackets first'), '= ' + B(ans)],
          steps: [{ text: 'The bracket first: ' + B(a + ' + ' + b) + ' = ?', ans: s }, { text: B(s + ' × ' + c) + ' = ?', ans }],
          traps: [tr(a + b * c, 'x_order', 'The brackets say: add first, then multiply.'), tr(ans + c, 'm_breakapart', 'Check ' + s + ' × ' + c + ' again.')] }; }
      if (k === 1) { const a = R.i(2, 9), c = R.i(2, 9), b = c + R.i(2, 9), s = b - c, ans = a * s, e = a + ' × (' + b + M + c + ')';
        return { text: Q(e), ans, how: [e, W('= ' + a + ' × ' + s, 'brackets first'), '= ' + B(ans)],
          steps: [{ text: 'The bracket first: ' + B(b + M + c) + ' = ?', ans: s }, { text: B(a + ' × ' + s) + ' = ?', ans }],
          traps: [tr(a * b - c, 'x_order', 'Work out the bracket before you multiply.'), tr(ans + a, fx(a, s), 'Check your times fact for ' + a + ' × ' + s + '.')] }; }
      if (k === 2) { const a = R.i(20, 50), b = R.i(5, 15), c = R.i(2, 9), m = a - b, ans = m + c, e = a + M + b + ' + ' + c;
        return { text: Q(e), ans, how: [e, W('= ' + m + ' + ' + c, 'only + and ' + MINUS + ', so go left to right'), '= ' + B(ans)],
          steps: [{ text: 'Left first: ' + B(a + M + b) + ' = ?', ans: m }, { text: B(m + ' + ' + c) + ' = ?', ans }],
          traps: [tr(a - (b + c), 'x_order', '+ and ' + MINUS + ' go from left to right, so take away ' + b + ' first.'), a % 10 < b % 10 ? tr(ans + 10, 'a_borrow', 'Check ' + a + M + b + ' again.') : null] }; }
      const b = R.i(2, 6), c = R.i(2, 5), q = R.i(2, 6) * c, a = b * q, ans = q * c, e = a + ' ÷ ' + b + ' × ' + c;
      return { text: Q(e), ans, how: [e, W('= ' + q + ' × ' + c, 'only ÷ and ×, so go left to right'), '= ' + B(ans)],
        steps: [{ text: 'Left first: ' + B(a + ' ÷ ' + b) + ' = ?', ans: q }, { text: B(q + ' × ' + c) + ' = ?', ans }],
        traps: [tr(a / (b * c), 'x_order', '× and ÷ go from left to right, so divide first.'), tr(ans + c, 'm_divfam', 'Check ' + a + ' ÷ ' + b + ' again.')] };
    }
    if (k === 0) { const a = R.i(2, 15), b = R.i(2, 5), c = R.i(2, 4), s = b * b, p = s * c, ans = a + p, e = a + ' + ' + pw(b, 2) + ' × ' + c;
      return { text: Q(e), ans, how: [e, W('= ' + a + ' + ' + s + ' × ' + c, 'powers first: ' + pw(b, 2) + ' = ' + b + ' × ' + b), W('= ' + a + ' + ' + p, 'then ×'), '= ' + B(ans)],
        steps: [{ text: B(pw(b, 2)) + ' = ?', ans: s }, { text: B(s + ' × ' + c) + ' = ?', ans: p }, { text: B(a + ' + ' + p) + ' = ?', ans }],
        traps: [tr((a + s) * c, 'x_order', '× comes before +, so multiply before you add.'), tr(a + b * 2 * c, 'w_exp', pw(b, 2) + ' means ' + b + ' × ' + b + ', not ' + b + ' × 2.'),
          tr(a + (b * c) * (b * c), 'x_order', 'The power belongs to ' + b + ' only. Square ' + b + ' first.')] }; }
    if (k === 1) { const a = R.i(2, 5), b = R.i(2, 6), s = b * b, ans = a * s, e = a + ' × ' + pw(b, 2);
      return { text: Q(e), ans, how: [e, W('= ' + a + ' × ' + s, 'the power is on ' + b + ' only, and powers come first'), '= ' + B(ans)],
        steps: [{ text: B(pw(b, 2)) + ' = ?', ans: s }, { text: B(a + ' × ' + s) + ' = ?', ans }],
        traps: [tr((a * b) * (a * b), 'x_order', 'Only ' + b + ' is squared. Square it first, then times ' + a + '.'), tr(a * b * 2, 'w_exp', pw(b, 2) + ' means ' + b + ' × ' + b + '.')] }; }
    if (k === 2) { const b = R.i(2, 9), a = b + R.i(2, 7), c = R.i(1, 20), s = a - b, ans = s * s + c, e = pw('(' + a + M + b + ')', 2) + ' + ' + c;
      return { text: Q(e), ans, how: [e, W('= ' + pw(s, 2) + ' + ' + c, 'brackets first'), W('= ' + (s * s) + ' + ' + c, 'then the power'), '= ' + B(ans)],
        steps: [{ text: B(a + M + b) + ' = ?', ans: s }, { text: B(pw(s, 2)) + ' = ?', ans: s * s }, { text: B((s * s) + ' + ' + c) + ' = ?', ans }],
        traps: [tr(a * a - b * b + c, 'x_order', 'Work out the bracket before you square it.'), tr(2 * s + c, 'w_exp', pw(s, 2) + ' means ' + s + ' × ' + s + '.')] }; }
    const a = R.i(3, 9), b = R.i(3, 9), e0 = R.i(2, 6), q = R.i(2, 5), c = e0 * q, p = a * b, ans = p - q, e = a + ' × ' + b + M + c + ' ÷ ' + e0;
    return { text: Q(e), ans, how: [e, W('= ' + p + M + q, '× and ÷ come before ' + MINUS + ': do both'), '= ' + B(ans)],
      steps: [{ text: B(a + ' × ' + b) + ' = ?', ans: p }, { text: B(c + ' ÷ ' + e0) + ' = ?', ans: q }, { text: B(p + M + q) + ' = ?', ans }],
      traps: [tr((p - c) / e0, 'x_order', 'Do the ÷ before the ' + MINUS + '.'), tr(p - c, 'x_order', 'Don\'t forget to divide ' + c + ' by ' + e0 + ' first.'), tr(ans + a, fx(a, b), 'Check ' + a + ' × ' + b + '.')] };
  } },

{ id: 'x_eval', s: 'alg', g: 6, title: 'Evaluate an expression', pre: ['w_exp'], paper: true,
  tip: 'Swap the letter for its number, then follow the order of operations. 3x + 2 when x = 5: 3 × 5 + 2 = 15 + 2 = 17. (3x means 3 × x.)',
  gen(d, R) {
    const M = ' ' + MINUS + ' ', Q = (e, v) => 'What is ' + B(e) + ' when ' + B('x = ' + v) + '?';
    if (d === 0) {
      const a = R.i(2, 9), v = R.i(2, 9), p = a * v, sub = R.chance(.35) && p > 6, b = sub ? R.i(1, p - 1) : R.i(1, 20), ans = sub ? p - b : p + b, op = sub ? M : ' + ';
      return { text: Q(poly([a, sub ? -b : b]), v), ans,
        how: [W(a + ' × ' + v + op + b, a + 'x means ' + a + ' × x, and x is ' + v), '= ' + p + op + b, '= ' + B(ans)],
        steps: [{ text: B(a + ' × ' + v) + ' = ?', ans: p }, { text: B(p + op + b) + ' = ?', ans }],
        traps: [tr(+(String(a) + v) + (sub ? -b : b), 'x_eval', a + 'x means ' + a + ' × x, not the digits side by side.'),
          tr(a + v + (sub ? -b : b), 'x_eval', a + 'x means ' + a + ' times x, not ' + a + ' plus x.'), tr(ans + a, fx(a, v), 'Check ' + a + ' × ' + v + '.')] };
    }
    if (d === 1) {
      const k = R.i(0, 2);
      if (k === 0) { const v = R.i(3, 12), b = R.i(1, 30), s = v * v, ans = s + b;
        return { text: Q(poly([1, 0, b]), v), ans, how: [W(v + ' × ' + v + ' + ' + b, pw('x', 2) + ' means x × x'), '= ' + s + ' + ' + b, '= ' + B(ans)],
          steps: [{ text: B(pw(v, 2)) + ' = ?', ans: s }, { text: B(s + ' + ' + b) + ' = ?', ans }],
          traps: [tr(2 * v + b, 'w_exp', pw('x', 2) + ' means x × x, not x × 2.'), tr(v + b, 'x_eval', 'Square the number before adding.')] }; }
      if (k === 1) { const a = R.i(2, 5), v = R.i(2, 6), s = v * v, ans = a * s;
        return { text: Q(a + pw('x', 2), v), ans, how: [W(a + ' × ' + pw(v, 2), 'the power is on x only'), W('= ' + a + ' × ' + s, 'square first'), '= ' + B(ans)],
          steps: [{ text: B(pw(v, 2)) + ' = ?', ans: s }, { text: B(a + ' × ' + s) + ' = ?', ans }],
          traps: [tr(a * v * a * v, 'x_order', 'Only x is squared. Square ' + v + ' first, then times ' + a + '.'), tr(a * v * 2, 'w_exp', pw('x', 2) + ' means x × x.')] }; }
      const a = R.i(2, 9), b = R.i(2, 9), v = R.i(2, 9), w = R.i(2, 9), p = a * v, q = b * w, ans = p + q;
      return { text: 'What is ' + B(a + 'x + ' + b + 'y') + ' when ' + B('x = ' + v) + ' and ' + B('y = ' + w) + '?', ans,
        how: [W(a + ' × ' + v + ' + ' + b + ' × ' + w, 'x is ' + v + ', y is ' + w), '= ' + p + ' + ' + q, '= ' + B(ans)],
        steps: [{ text: B(a + ' × ' + v) + ' = ?', ans: p }, { text: B(b + ' × ' + w) + ' = ?', ans: q }, { text: B(p + ' + ' + q) + ' = ?', ans }],
        traps: [tr(a * w + b * v, 'x_eval', 'Match each letter to its own number: x is ' + v + ', y is ' + w + '.'), tr(a + v + b + w, 'x_eval', a + 'x means ' + a + ' × x.')] };
    }
    const k = R.i(0, 2);
    if (k === 0) { const a = R.i(2, 9), b = R.i(1, 9), v = b + R.i(1, 9), c = R.i(1, 20), s = v - b, p = a * s, ans = p + c;
      return { text: Q(a + bin(1, -b) + ' + ' + c, v), ans, how: [a + '(' + v + M + b + ') + ' + c, W('= ' + a + ' × ' + s + ' + ' + c, 'brackets first'), '= ' + p + ' + ' + c, '= ' + B(ans)],
        steps: [{ text: B(v + M + b) + ' = ?', ans: s }, { text: B(a + ' × ' + s) + ' = ?', ans: p }, { text: B(p + ' + ' + c) + ' = ?', ans }],
        traps: [tr(a * v - b + c, 'x_distribute', 'The ' + a + ' multiplies the whole bracket, not just x.'), tr(a * (s + c), 'x_order', 'Multiply before you add the ' + c + '.')] }; }
    if (k === 1) { const a = R.i(2, 3), b = R.i(2, 9), c = R.i(1, 15), v = R.i(2, 5), s = v * v, p1 = a * s, p2 = b * v, ans = p1 + p2 - c;
      return { text: Q(poly([a, b, -c]), v), ans, how: [a + ' × ' + pw(v, 2) + ' + ' + b + ' × ' + v + M + c, W('= ' + a + ' × ' + s + ' + ' + p2 + M + c, 'square first'), '= ' + p1 + ' + ' + p2 + M + c, '= ' + B(ans)],
        steps: [{ text: B(a + ' × ' + pw(v, 2)) + ' = ?', ans: p1 }, { text: B(b + ' × ' + v) + ' = ?', ans: p2 }, { text: B(p1 + ' + ' + p2 + M + c) + ' = ?', ans }],
        traps: [tr(a * a * s + p2 - c, 'x_order', 'Only x is squared: square ' + v + ', then times ' + a + '.'), tr(a * v * 2 + p2 - c, 'w_exp', pw('x', 2) + ' means x × x.')] }; }
    const a = R.i(2, 6), v = a + R.i(2, 9), s = v * v, p = a * v, ans = s - p;
    return { text: Q(poly([1, -a, 0]), v), ans, how: [pw(v, 2) + M + a + ' × ' + v, '= ' + s + M + p, W('= ' + B(ans), 'shortcut: x(x ' + MINUS + ' ' + a + ') = ' + v + ' × ' + (v - a))],
      steps: [{ text: B(pw(v, 2)) + ' = ?', ans: s }, { text: B(a + ' × ' + v) + ' = ?', ans: p }, { text: B(s + M + p) + ' = ?', ans }],
      traps: [tr(s - a, 'x_eval', a + 'x means ' + a + ' × x.'), tr(s + p, 'x_eval', 'The ' + MINUS + ' means take ' + a + 'x away.'), tr(2 * v - p, 'w_exp', pw('x', 2) + ' means x × x, not x × 2.')] };
  } },

{ id: 'x_onestep', s: 'alg', g: 6, title: 'One-step equations: undo it', paper: true,
  tip: 'Do the opposite to both sides. x + 8 = 20: take 8 from both sides, x = 12. 4x = 36: divide both sides by 4, x = 9.',
  gen(d, R) {
    const M = ' ' + MINUS + ' ', Q = e => 'Solve for x: ' + B(e);
    const k = d === 0 ? R.i(0, 1) : d === 1 ? R.i(2, 3) : R.i(0, 4);
    if (k === 0) {
      const dec = d === 2 && R.chance(.5), a = dec ? R.i(11, 49) / 10 : d === 2 ? R.i(120, 480) : R.i(3, 25), x = dec ? R.i(105, 899) / 100 : d === 2 ? R.i(105, 600) : R.i(2, 30);
      const b = +(a + x).toFixed(2), flip = d === 2 && R.chance(.5), e = flip ? num(b) + ' = x + ' + num(a) : 'x + ' + num(a) + ' = ' + num(b);
      return { text: Q(e), ans: x, how: [e, W('x = ' + num(b) + M + num(a), 'take ' + num(a) + ' from both sides'), 'x = ' + B(num(x))],
        steps: [{ text: B(num(b) + M + num(a)) + ' = ?', ans: x }],
        traps: [tr(+(a + b).toFixed(2), 'x_onestep', 'Adding ' + num(a) + ' again makes it worse. Undo + ' + num(a) + ' by taking ' + num(a) + ' away.'),
          dec ? tr(+(b - a / 10).toFixed(3), 'f_decadd', 'Line up the decimal points: ' + num(a) + ' is the same as ' + a.toFixed(2) + '.')
            : b % 10 < a % 10 ? tr(x + 10, 'a_borrow', 'Check the take away: ' + num(b) + M + num(a) + '. You need to trade a ten.') : tr(x + 1, 'a_sub3', 'Check the take away: ' + num(b) + M + num(a) + '.')] };
    }
    if (k === 1) {
      const a = d === 2 ? R.i(25, 180) : R.i(2, 25), b = d === 2 ? R.i(30, 400) : R.i(2, 40), x = a + b, flip = d === 2 && R.chance(.5);
      const e = flip ? num(b) + ' = x' + M + num(a) : 'x' + M + num(a) + ' = ' + num(b);
      return { text: Q(e), ans: x, how: [e, W('x = ' + num(b) + ' + ' + num(a), 'add ' + num(a) + ' to both sides'), 'x = ' + B(num(x))],
        steps: [{ text: B(num(b) + ' + ' + num(a)) + ' = ?', ans: x }],
        traps: [tr(Math.abs(b - a), 'x_onestep', 'Taking away again makes it worse. Undo ' + MINUS + ' ' + num(a) + ' by adding ' + num(a) + '.'),
          a % 10 + b % 10 >= 10 ? tr(x - 10, 'a_regroup', 'Check the adding: did you carry?') : tr(x + 1, 'a_3digit', 'Check the adding: ' + num(b) + ' + ' + num(a) + '.')] };
    }
    if (k === 2 || k === 4 && R.chance(.5)) {
      const a = d === 2 ? R.i(11, 25) : R.i(2, 12), x = d === 2 ? R.i(3, 15) : R.i(2, 12), b = a * x, flip = d === 2 && R.chance(.5);
      const e = flip ? num(b) + ' = ' + a + 'x' : a + 'x = ' + num(b);
      return { text: Q(e), ans: x, how: [e, W('x = ' + num(b) + ' ÷ ' + a, a + 'x means ' + a + ' × x, so divide both sides by ' + a), 'x = ' + B(x)],
        steps: [{ text: B(num(b) + ' ÷ ' + a) + ' = ?', ans: x }],
        traps: [tr(b - a, 'x_onestep', a + 'x is ' + a + ' times x, so undo it by dividing, not taking away.'), tr(b * a, 'x_onestep', 'Undo × ' + a + ' with ÷ ' + a + '.'),
          tr(x + 1, d === 2 ? 'm_divbig' : fx(a, x), 'Check: ' + a + ' × your answer should be ' + num(b) + '.')] };
    }
    const a = d === 2 ? R.i(6, 15) : R.i(2, 9), b = d === 2 ? R.i(11, 40) : R.i(2, 12), x = a * b, e = fl('x', a) + ' = ' + b;
    return { text: Q(e), ans: x, how: [e, W('x = ' + b + ' × ' + a, 'multiply both sides by ' + a), 'x = ' + B(num(x))],
      steps: [{ text: B(b + ' × ' + a) + ' = ?', ans: x }],
      traps: [b % a === 0 ? tr(b / a, 'x_onestep', 'Undo ÷ ' + a + ' with × ' + a + ', not ÷.') : null, tr(b + a, 'x_onestep', 'Undo ÷ ' + a + ' by multiplying, not adding.'),
        tr(x + a, d === 2 ? 'm_breakapart' : fx(a, b), 'Check ' + b + ' × ' + a + '.')] };
  } },

{ id: 'x_distribute', s: 'alg', g: 6, title: 'The distributive property',
  tip: 'Times a sum means times each part. 6 × 47 = 6 × 40 + 6 × 7 = 240 + 42 = 282. Same with letters: 3(x + 4) = 3x + 12.',
  gen(d, R) {
    const M = ' ' + MINUS + ' ';
    if (d === 0 && R.chance(.65) || d === 2 && R.chance(.25)) {
      const a = R.i(3, 9), t = d === 2 ? R.i(11, 49) * 10 : R.i(2, 9) * 10, o = R.i(2, 9), n = t + o, p1 = a * t, p2 = a * o, ans = p1 + p2;
      return { text: 'What is ' + B(a + ' × ' + num(n)) + '? Split ' + num(n) + ' into ' + num(t) + ' + ' + o + '.', ans,
        how: [a + ' × ' + num(n) + ' = ' + a + ' × ' + num(t) + ' + ' + a + ' × ' + o + '.', a + ' × ' + num(t) + ' = ' + num(p1) + ' and ' + a + ' × ' + o + ' = ' + p2 + '.', num(p1) + ' + ' + p2 + ' = ' + B(num(ans)) + '.'],
        steps: [{ text: B(a + ' × ' + num(t)) + ' = ?', ans: p1 }, { text: B(a + ' × ' + o) + ' = ?', ans: p2 }, { text: B(num(p1) + ' + ' + p2) + ' = ?', ans }],
        traps: [tr(p1 + o, 'x_distribute', 'The ' + a + ' multiplies both parts: the ' + num(t) + ' and the ' + o + '.'), tr(ans + a, fx(a, o), 'Check your fact for ' + a + ' × ' + o + '.'),
          tr(p1 / 10 + p2, 'm_xtens', a + ' × ' + num(t) + ' is ' + a + ' × ' + (t / 10) + ' tens, so it ends in 0.')] };
    }
    if (d === 0) {
      const a = R.i(2, 9), b = R.i(1, 9), ans = a * b;
      return { text: B(a + bin(1, b)) + ' = ' + B(a + 'x + ?') + '. What is the missing number?', ans,
        how: ['The ' + a + ' multiplies everything in the bracket: ' + a + ' × x and ' + a + ' × ' + b + '.', a + ' × ' + b + ' = ' + B(ans) + ', so ' + a + bin(1, b) + ' = ' + a + 'x + ' + ans + '.'],
        steps: [{ text: B(a + ' × ' + b) + ' = ?', ans }],
        traps: [tr(b, 'x_distribute', 'Multiply both terms in the bracket by ' + a + ', not just the x.'), tr(a + b, 'x_distribute', a + '(…) means ' + a + ' times each term, not plus.'), tr(ans + a, fx(a, b), 'Check ' + a + ' × ' + b + '.')] };
    }
    if (d === 1 && R.chance(.5) || d === 2 && R.chance(.35)) {
      const a = R.i(3, 9), H = d === 2 ? R.pick([100, 200, 300, 500, 1000]) : R.pick([100, 100, 200]), k = R.i(1, d === 2 ? 4 : 3), up = R.chance(.3), n = up ? H + k : H - k;
      const pH = a * H, pk = a * k, ans = up ? pH + pk : pH - pk;
      return { text: 'What is ' + B(a + ' × ' + num(n)) + '? Think of ' + num(n) + ' as ' + num(H) + (up ? ' + ' : M) + k + '.', ans,
        how: [a + ' × ' + num(n) + ' = ' + a + ' × ' + num(H) + (up ? ' + ' : M) + a + ' × ' + k + '.', num(pH) + (up ? ' + ' : M) + pk + ' = ' + B(num(ans)) + '.'],
        steps: [{ text: B(a + ' × ' + num(H)) + ' = ?', ans: pH }, { text: B(a + ' × ' + k) + ' = ?', ans: pk }, { text: B(num(pH) + (up ? ' + ' : M) + pk) + ' = ?', ans }],
        traps: [tr(up ? pH + k : pH - k, 'x_distribute', (up ? 'Add ' : 'Take away ') + a + ' × ' + k + ', not just ' + k + '. The ' + a + ' multiplies both parts.'),
          tr(up ? pH - pk : pH + pk, 'x_distribute', num(n) + ' is ' + (up ? 'more' : 'less') + ' than ' + num(H) + ', so the answer is ' + (up ? 'more' : 'less') + ' than ' + num(pH) + '.')] };
    }
    if (d === 1) {
      const a = R.i(2, 9), b = R.i(2, 9), c = R.i(1, 9), askX = R.chance(.5), A = a * b, Cc = a * c;
      return { text: B(a + bin(b, c)) + ' = ' + B(askX ? '?x + ' + Cc : A + 'x + ?') + '. What is the missing number?', ans: askX ? A : Cc,
        how: ['The ' + a + ' multiplies each term: ' + a + ' × ' + b + 'x and ' + a + ' × ' + c + '.', a + ' × ' + b + 'x = ' + A + 'x and ' + a + ' × ' + c + ' = ' + Cc + ', so it is ' + A + 'x + ' + Cc + '. The missing number is ' + B(askX ? A : Cc) + '.'],
        steps: [{ text: B(a + ' × ' + b) + ' = ?', ans: A }, { text: B(a + ' × ' + c) + ' = ?', ans: Cc }],
        traps: askX ? [tr(b, 'x_distribute', 'Multiply the ' + b + 'x by ' + a + ' too.'), tr(a + b, 'x_distribute', 'It is ' + a + ' times ' + b + 'x, not plus.'), tr(A + a, fx(a, b), 'Check ' + a + ' × ' + b + '.')]
          : [tr(c, 'x_distribute', 'Multiply the ' + c + ' by ' + a + ' too, not just the x-term.'), tr(a + c, 'x_distribute', 'It is ' + a + ' times ' + c + ', not plus.'), tr(Cc + a, fx(a, c), 'Check ' + a + ' × ' + c + '.')] };
    }
    if (R.chance(.5)) {
      const k = R.i(2, 9), m = R.i(2, 9), km = k * m;
      return { text: 'Factor out the ' + k + ': ' + B(k + 'x + ' + km + ' = ' + k + '(x + ?)') + '. What is the missing number?', ans: m,
        how: ['This is the distributive property backwards. ' + k + ' times the missing number must make ' + km + '.', km + ' ÷ ' + k + ' = ' + B(m) + '. Check: ' + k + bin(1, m) + ' = ' + k + 'x + ' + km + '.'],
        steps: [{ text: B(km + ' ÷ ' + k) + ' = ?', ans: m }, { text: 'Check: ' + B(k + ' × ' + m) + ' = ?', ans: km }],
        traps: [tr(km, 'x_distribute', 'Multiply back to check: ' + k + ' times your number has to give ' + km + '.'), tr(km - k, 'x_distribute', 'Factoring out ' + k + ' means dividing each term by ' + k + ', not taking ' + k + ' away.')] };
    }
    const a = R.i(2, 9), b = R.i(2, 9), c = R.i(2, 9), A = a * b, Cc = a * c;
    return { text: B(a + bin(b, -c)) + ' = ' + B(A + 'x' + M + '?') + '. What is the missing number?', ans: Cc,
      how: ['The ' + a + ' multiplies both terms, and the ' + MINUS + ' stays: ' + a + ' × ' + b + 'x' + M + a + ' × ' + c + '.', a + ' × ' + c + ' = ' + Cc + ', so it is ' + A + 'x' + M + B(Cc) + '.'],
      steps: [{ text: B(a + ' × ' + c) + ' = ?', ans: Cc }],
      traps: [tr(c, 'x_distribute', 'Multiply the ' + c + ' by ' + a + ' too.'), tr(a + c, 'x_distribute', 'It is ' + a + ' times ' + c + ', not plus.'), tr(Cc + a, fx(a, c), 'Check ' + a + ' × ' + c + '.')] };
  } },

{ id: 'x_combine', s: 'alg', g: 6, title: 'Combine like terms', paper: true,
  tip: 'Like terms have the same letter part. Add their numbers like counting apples: 3x + 5x = 8x. Numbers join numbers: 4x + 7 + 2x + 3 = 6x + 10.',
  gen(d, R) {
    if (d === 0) {
      const sub = R.chance(.35), a = R.i(sub ? 3 : 1, 12), b = sub ? R.i(1, a - 1) : R.i(2, 12), ans = sub ? a - b : a + b, op = sub ? ' ' + MINUS + ' ' : ' + ';
      const e = ex([[a, 'x'], [sub ? -b : b, 'x']]);
      return { text: 'Simplify: ' + B(e + ' = ?x') + '. What number goes in front of the x?', ans,
        how: [e, W('= (' + a + op + b + ')x', (a === 1 ? 'x on its own is 1x; ' : '') + 'count the x\'s'), '= ' + B(ans) + 'x'],
        steps: [{ text: B(a + op + b) + ' = ?', ans }],
        traps: [a > 1 ? tr(a * b, 'x_combine', 'Like terms add like objects: ' + a + ' apples' + op + b + ' apples.') : tr(b, 'x_combine', 'x on its own counts as 1x.'),
          sub ? tr(a + b, 'x_combine', 'The ' + MINUS + ' means take ' + b + ' x\'s away.') : null] };
    }
    let terms;
    if (d === 1) {
      const a = R.i(2, 9), b = R.i(1, 9), c = R.i(1, 15), e = R.i(1, 15);
      terms = R.chance(.5) ? [[a, 'x'], [c, ''], [b, 'x'], [e, '']] : [[c, ''], [a, 'x'], [e, ''], [b, 'x']];
    } else {
      const a = R.i(4, 12), b = -R.i(1, a - 1), c = nz(R, -15, 15), e = nz(R, -15, 15), third = R.pick([1, -1, R.i(2, 6)]);
      terms = R.shuffle([[a, 'x'], [b, 'x'], [c, ''], [e, '']]); if (R.chance(.4)) terms.push([third, 'x']);
      if (terms[0][0] < 0) { const i = terms.findIndex(t => t[0] > 0); [terms[0], terms[i]] = [terms[i], terms[0]]; }
    }
    const xs = terms.filter(t => t[1]), cs = terms.filter(t => !t[1]), A = sum(xs.map(t => t[0])), E = sum(cs.map(t => t[0]));
    if (A === 0 || E === 0) return null;
    const askX = R.chance(.5), ans = askX ? A : E, form = askX ? '?x ' + signed(E) : term(A, 'x') + ' + ?';
    const traps = [tr(A + E, 'x_combine', 'Numbers and x-terms are not like terms. Keep them apart.')];
    if (d === 2) {
      if (askX) traps.push(tr(sum(xs.map(t => Math.abs(t[0]))), 'x_combine', 'The sign in front of a term belongs to it: ' + MINUS + ' ' + term(Math.abs(xs.find(t => t[0] < 0)[0]), 'x') + ' means take those away.'));
      else traps.push(tr(-E, 'n_intadd', 'Check the signs when you add the numbers ' + cs.map(t => num(t[0])).join(' and ') + '.'), tr(sum(cs.map(t => Math.abs(t[0]))), 'n_intadd', 'A ' + MINUS + ' in front of a number means take it away.'));
    } else traps.push(tr(askX ? xs[0][0] : cs[0][0], 'x_combine', 'Collect every ' + (askX ? 'x-term' : 'plain number') + ', not just the first one.'));
    return { text: 'Simplify ' + B(ex(terms)) + '. It becomes ' + B(form) + '. What is the missing number?', ans,
      how: [ex(terms)].concat(ex(xs.concat(cs)) === ex(terms) ? [] : [W('= ' + ex(xs.concat(cs)), 'put like terms together, each with its own sign')], [W('= ' + poly([A, E]), 'add the x-terms, then the plain numbers'), 'The missing number is ' + B(num(ans)) + '.']),
      steps: [{ text: 'Add the x-terms: ' + B(ex(xs)) + ' = ?x', ans: A }, { text: 'Add the numbers: ' + B(ex(cs)) + ' = ?', ans: E }], traps };
  } },

{ id: 'x_twostep', s: 'alg', g: 7, title: 'Two-step equations', pre: ['n_intadd'], paper: true,
  tip: 'Undo in reverse order: the last thing done comes off first. 3x + 5 = 26: take 5 from both sides (3x = 21), then divide by 3 (x = 7).',
  gen(d, R) {
    const Q = e => 'Solve for x: ' + B(e);
    const x = d === 0 ? R.i(2, 12) : d === 1 ? nz(R, -9, 12) : nz(R, -12, 12);
    const k = d === 0 ? R.i(0, 1) : d === 1 ? R.i(0, 2) : R.i(1, 3);
    const undo = b => b < 0 ? 'add ' + num(-b) + ' to both sides' : 'take ' + num(b) + ' from both sides';
    if (k <= 1) {
      const neg = d === 2 && R.chance(.6), a = (neg ? -1 : 1) * R.i(2, d === 0 ? 9 : 12), b = d === 0 ? (k ? -R.i(1, Math.min(20, a * x - 1)) : R.i(1, 25)) : nz(R, -25, 25), c = a * x + b;
      if (d === 0 && c <= 0) return null;
      const r = c - b, e = poly([a, b]) + ' = ' + num(c);
      const traps = [tr(r, 'x_twostep', 'You found ' + term(a, 'x') + ' = ' + num(r) + '. One more step: divide by ' + num(a) + '.')];
      if ((c + b) % a === 0) traps.push(tr((c + b) / a, b < 0 ? 'n_intsub' : 'x_twostep', 'To undo ' + signed(b) + ', do the opposite: ' + undo(b) + '.'));
      if (c % a === 0 && c / a - b !== x) traps.push(tr(c / a - b, 'x_twostep', 'Undo in reverse order: deal with the ' + signed(b) + ' before the × ' + num(a) + '.'));
      if (a < 0) traps.push(tr(-x, 'n_intmul', 'Check the sign when you divide by ' + num(a) + '.'));
      else traps.push(tr(x + 1, fx(a, x), 'Check ' + num(r) + ' ÷ ' + a + '.'));
      return { text: Q(e), ans: x, how: [e, W(term(a, 'x') + ' = ' + num(r), undo(b)), W('x = ' + B(num(x)), 'divide both sides by ' + num(a))],
        steps: [{ text: 'Undo the ' + signed(b) + ': ' + B(term(a, 'x') + ' = ?'), ans: r }, { text: B(term(a, 'x') + ' = ' + num(r)) + '. x = ?', ans: x }], traps };
    }
    if (k === 2) {
      const a = R.i(2, 6), q = d === 1 ? R.i(1, 9) * (R.chance(.3) ? -1 : 1) : nz(R, -9, 9), X = a * q, b = nz(R, -15, 15), c = q + b, e = fl('x', a) + ' ' + signed(b) + ' = ' + num(c);
      return { text: Q(e), ans: X, how: [e, W(fl('x', a) + ' = ' + num(q), undo(b)), W('x = ' + B(num(X)), 'multiply both sides by ' + a)],
        steps: [{ text: 'Undo the ' + signed(b) + ': ' + B(fl('x', a) + ' = ?'), ans: q }, { text: B(fl('x', a) + ' = ' + num(q)) + '. x = ?', ans: X }],
        traps: [tr(q, 'x_twostep', 'That is x ÷ ' + a + '. One more step: multiply by ' + a + '.'), tr((c + b) * a, b < 0 ? 'n_intsub' : 'n_intadd', 'To undo ' + signed(b) + ', do the opposite.'), tr(c * a - b, 'x_twostep', 'Undo in reverse order: the ' + signed(b) + ' comes off first.')] };
    }
    const a = R.i(2, 7), b = nz(R, -9, 9), c = a * (x + b), s = x + b, e = a + bin(1, b) + ' = ' + num(c);
    return { text: Q(e), ans: x, how: [e, W('x ' + signed(b) + ' = ' + num(s), 'the × ' + a + ' was done last, so divide both sides by ' + a + ' first'), W('x = ' + B(num(x)), undo(b))],
      steps: [{ text: 'Divide both sides by ' + a + ': ' + B('x ' + signed(b) + ' = ?'), ans: s }, { text: B('x ' + signed(b) + ' = ' + num(s)) + '. x = ?', ans: x }],
      traps: [tr(s + b, 'n_intsub', 'To undo ' + signed(b) + ', do the opposite.'), tr(s, 'x_twostep', 'That is x ' + signed(b) + '. One more step.'), (c - b) % a === 0 ? tr((c - b) / a, 'x_distribute', 'The ' + a + ' multiplies the ' + num(b) + ' too, so divide by ' + a + ' first.') : null] };
  } },

{ id: 'x_ineq', s: 'alg', g: 7, title: 'Inequalities: the biggest that works', paper: true,
  tip: 'Solve it like an equation, then check the edge. 3x is less than 20 means x is less than 6⅔, so the biggest whole number is 6. Dividing by a negative number flips the sign.',
  gen(d, R) {
    const neg = d === 2, a = neg ? -R.i(2, 6) : d === 0 ? 1 : R.i(2, 9), c = d === 0 ? R.i(2, 30) * (R.chance(.3) ? -1 : 1) : d === 1 ? R.pick([0, 0, R.i(1, 20)]) : nz(R, -15, 15);
    const rel = R.pick(['<', '<=', '>', '>=']), b = d === 0 ? R.i(c > 0 ? c + 3 : 5, c > 0 ? c + 40 : 40) : neg ? R.i(-40, 40) : c + R.i(5, 60);
    if (!neg && b - c <= 1) return null;
    if (d === 1 && (b - c) % a === 0 && R.chance(.6)) return null;
    const show = { '<': LT, '<=': LE, '>': GT, '>=': GE }, flip = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' };
    const r = b - c, [qn, qd] = reduce(r, a), q = qn / qd, rel2 = a < 0 ? flip[rel] : rel, big = rel2[0] === '<';
    const lo = Math.floor(q), whole = isInt(q);
    const ans = rel2 === '<' ? (whole ? q - 1 : lo) : rel2 === '<=' ? lo : rel2 === '>' ? (whole ? q + 1 : lo + 1) : (whole ? q : lo + 1);
    if (!neg && ans < 0) return null;
    const word = neg ? 'integer' : 'whole number', qs = whole ? num(q) : frac(qn, qd);
    const lhs = c ? poly([a, c]) : term(a, 'x'), e = lhs + ' ' + show[rel] + ' ' + num(b), how = [e];
    if (c) how.push(W(term(a, 'x') + ' ' + show[rel] + ' ' + num(r), c > 0 ? 'take ' + num(c) + ' from both sides' : 'add ' + num(-c) + ' to both sides'));
    if (a !== 1) how.push(W('x ' + show[rel2] + ' ' + qs, 'divide both sides by ' + num(a) + (a < 0 ? '; dividing by a negative number flips the sign' : '') + (whole ? '' : '; that is between ' + num(lo) + ' and ' + num(lo + 1))));
    how.push('x = ' + B(num(ans)) + ' is the ' + (big ? 'biggest' : 'smallest') + ' ' + word + ' that works.');
    const steps = [];
    if (c) steps.push({ text: B(e) + ' becomes ' + B(term(a, 'x') + ' ' + show[rel] + ' ?'), ans: r });
    if (a !== 1) steps.push({ text: B(term(a, 'x') + ' ' + show[rel] + ' ' + num(r)) + ' becomes ' + B('x ' + show[rel2] + ' ?') + (a < 0 ? ' (the sign flips)' : ''), ans: { n: qn, d: qd }, type: 'frac' });
    steps.push({ text: 'The ' + (big ? 'biggest' : 'smallest') + ' ' + word + ' that works?', ans });
    const traps = [];
    if (rel2.length === 1 && whole) traps.push(tr(q, 'x_ineq', 'The sign is ' + show[rel2] + ', so x cannot equal ' + num(q) + '.'));
    if (!whole) traps.push(tr(big ? lo + 1 : lo, 'x_ineq', 'Check it: put your number back into ' + e + '.'));
    if (a < 0) traps.push(tr(rel === '<' || rel === '>' ? (big ? (whole ? q + 1 : lo + 1) : (whole ? q - 1 : lo)) : (big ? (whole ? q : lo + 1) : (whole ? q : lo)), 'x_ineq', 'Dividing both sides by a negative number flips the inequality sign.'));
    if (c) traps.push(tr(rel2[0] === '<' ? Math.floor((b + c) / a) : Math.ceil((b + c) / a), c > 0 ? 'x_onestep' : 'n_intsub', 'To undo ' + signed(c) + ', do the opposite to both sides.'));
    return { text: 'What is the ' + (big ? 'biggest' : 'smallest') + ' ' + word + ' x with ' + B(e) + '?', ans, how, steps, traps };
  } },

{ id: 'x_rate', s: 'alg', g: 7, title: 'Distance = speed × time', pre: ['f_rate'], paper: true,
  tip: 'Distance = speed × time. 50 km per hour for 3 hours is 150 km. Turn it around: time = distance ÷ speed, speed = distance ÷ time. Minutes? 30 minutes is half an hour.',
  gen(d, R) {
    const u = R.pick([['miles', 'mph', 'miles per hour'], ['km', 'km/h', 'km per hour']]), who = R.pick(NAMES), how2 = R.pick(['drives', 'travels']);
    if (d === 0) {
      const s = R.i(4, 14) * 5, t = R.i(2, 6), D = s * t;
      return { text: who + ' ' + how2 + ' at ' + B(s + ' ' + u[2]) + ' for ' + B(t + ' hours') + '. How far is that?', ans: D, unit: u[0],
        how: ['distance = speed × time', 'distance = ' + s + ' × ' + t, '= ' + B(D) + ' ' + u[0]],
        steps: [{ text: 'How far in 1 hour?', ans: s, unit: u[0] }, { text: B(s + ' × ' + t) + ' = ?', ans: D, unit: u[0] }],
        traps: [tr(s + t, 'x_rate', 'Each hour adds another ' + s + ' ' + u[0] + ', so multiply.'), tr(s / t, 'x_rate', 'More time means farther, so multiply, don\'t divide.'), tr(D + s, 'm_breakapart', 'Check ' + s + ' × ' + t + '.')] };
    }
    if (d === 1) {
      const s = R.i(4, 16) * 5, t = R.i(2, 8), D = s * t;
      if (R.chance(.5)) return { text: 'A trip is ' + B(D + ' ' + u[0]) + ' long. At ' + B(s + ' ' + u[2]) + ', how many hours does it take?', ans: t, unit: 'hours',
        how: ['time = distance ÷ speed', 'time = ' + D + ' ÷ ' + s, W('= ' + B(t) + ' hours', 'check: ' + s + ' × ' + t + ' = ' + D)],
        steps: [{ text: B(D + ' ÷ ' + s) + ' = ?', ans: t }],
        traps: [tr(D - s, 'x_rate', 'Time = distance ÷ speed, not distance take away speed.'), tr(D * s, 'x_rate', 'Divide the distance by the speed.'), tr(t + 1, 'm_divbig', 'Check: ' + s + ' × your answer should be ' + D + '.')] };
      return { text: who + ' ' + how2 + ' ' + B(D + ' ' + u[0]) + ' in ' + B(t + ' hours') + ' at a steady speed. How fast is that, in ' + u[2] + '?', ans: s, unit: u[1],
        how: ['speed = distance ÷ time', 'speed = ' + D + ' ÷ ' + t, '= ' + B(s) + ' ' + u[2]],
        steps: [{ text: B(D + ' ÷ ' + t) + ' = ?', ans: s }],
        traps: [tr(D * t, 'x_rate', 'Speed = distance ÷ time.'), tr(D - t, 'x_rate', 'Share the distance equally over the hours: divide.'), tr(s + 5, 'm_divbig', 'Check: your speed × ' + t + ' should be ' + D + '.')] };
    }
    const k = R.i(0, 2);
    if (k === 0) {
      const m = R.pick([10, 15, 20, 30, 40, 45, 90]), g = gcd(60, m), s = R.i(2, 16) * (60 / g), D = s * m / 60;
      if (s > 90 || D < 2) return null;
      return { text: who + ' ' + how2 + ' at ' + B(s + ' ' + u[2]) + ' for ' + B(m + ' minutes') + '. How far is that?', ans: D, unit: u[0],
        how: [W('time = ' + fl(m, 60) + ' hour = ' + fr(m, 60) + ' hour', 'the speed is per hour, so change minutes to hours'), 'distance = ' + s + ' × ' + fr(m, 60), W('= ' + B(D) + ' ' + u[0], s + ' ÷ ' + (60 / g) + ' × ' + (m / g))],
        steps: [{ text: m + ' minutes is what fraction of an hour?', ans: F(m, 60), type: 'frac' }, { text: B(s + ' × ' + fr(m, 60)) + ' = ?', ans: D }],
        traps: [tr(s * m, 't_facts', 'The speed is per hour, but the time is in minutes. Change ' + m + ' minutes into hours first.'), tr(s * m / 100, 't_facts', 'An hour has 60 minutes, not 100.')] };
    }
    if (k === 1) {
      const m = R.pick([10, 12, 15, 20, 30]), s = R.i(2, 12) * (60 / m), D = s * m / 60;
      if (s > 90) return null;
      return { text: 'A train covers ' + B(D + ' ' + u[0]) + ' in ' + B(m + ' minutes') + '. What is its speed in ' + u[2] + '?', ans: s, unit: u[1],
        how: [W('1 hour = ' + (60 / m) + ' × ' + m + ' minutes', '60 ÷ ' + m + ' = ' + (60 / m)), 'speed = ' + D + ' × ' + (60 / m), '= ' + B(s) + ' ' + u[2]],
        steps: [{ text: 'How many lots of ' + m + ' minutes make an hour?', ans: 60 / m }, { text: B(D + ' × ' + (60 / m)) + ' = ?', ans: s }],
        traps: [tr(D / m, 't_facts', 'That is ' + u[0] + ' per minute. The question asks per hour.'), tr(D * m, 'x_rate', 'Find how many ' + m + '-minute parts are in an hour, then scale up.')] };
    }
    const s1 = R.i(4, 14) * 5, s2 = R.i(4, 14) * 5, t = R.i(2, 5), D = (s1 + s2) * t;
    return { text: 'Two cars start ' + B(D + ' ' + u[0]) + ' apart and drive toward each other at ' + B(s1) + ' and ' + B(s2 + ' ' + u[2]) + '. How many hours until they meet?', ans: t, unit: 'hours',
      how: [W('closing speed = ' + s1 + ' + ' + s2 + ' = ' + (s1 + s2) + ' ' + u[1], 'together they close the gap this much each hour'), 'time = ' + D + ' ÷ ' + (s1 + s2), '= ' + B(t) + ' hours'],
      steps: [{ text: 'How much does the gap shrink each hour?', ans: s1 + s2, unit: u[0] }, { text: B(D + ' ÷ ' + (s1 + s2)) + ' = ?', ans: t }],
      traps: [tr(D / s1, 'x_rate', 'Both cars move, so add their speeds.'), s1 !== s2 ? tr(D / Math.abs(s1 - s2), 'x_rate', 'They drive toward each other, so the gap closes at the sum of the speeds.') : null] };
  } },

{ id: 'x_bothsides', s: 'alg', g: 8, title: 'Variables on both sides', paper: true,
  tip: 'Move the smaller x-term so the x\'s stay positive. 5x + 3 = 2x + 15: take 2x from both sides (3x + 3 = 15), then 3x = 12, x = 4.',
  gen(d, R) {
    const x = d === 0 ? R.i(1, 10) : nz(R, -9, 9), br = d === 2;
    let a = R.i(2, 9), c = R.i(1, 9); if (a === c) return null;
    if (d === 0 && a < c) [a, c] = [c, a];
    const p = br ? nz(R, -9, 9) : 0, A = a, Bk = br ? a * p : d === 0 ? R.i(1, 20) : nz(R, -20, 20), E = A * x + Bk - c * x;
    if (E === 0 || E === Bk || d === 0 && E < 0) return null;
    const lhs = br ? a + bin(1, p) : poly([A, Bk]), e = lhs + ' = ' + poly([c, E]), how = [e], steps = [];
    const undo = b => b < 0 ? 'add ' + num(-b) + ' to both sides' : 'take ' + num(b) + ' from both sides';
    if (br) how.push(W(poly([A, Bk]) + ' = ' + poly([c, E]), 'multiply out the bracket'));
    const k = Math.abs(A - c);
    if (A > c) {
      how.push(W(poly([k, Bk]) + ' = ' + num(E), 'take ' + term(c, 'x') + ' from both sides'));
      how.push(W(k > 1 ? term(k, 'x') + ' = ' + num(E - Bk) : 'x = ' + B(num(x)), undo(Bk)));
      steps.push({ text: 'Take ' + term(c, 'x') + ' from both sides: ' + B('?x ' + signed(Bk) + ' = ' + num(E)), ans: k }, { text: B(term(k, 'x') + ' = ?'), ans: E - Bk });
    } else {
      how.push(W(num(Bk) + ' = ' + poly([k, E]), 'take ' + term(A, 'x') + ' from both sides'));
      how.push(W(k > 1 ? num(Bk - E) + ' = ' + term(k, 'x') : 'x = ' + B(num(x)), undo(E)));
      steps.push({ text: 'Take ' + term(A, 'x') + ' from both sides: ' + B(num(Bk) + ' = ?x ' + signed(E)), ans: k }, { text: B('? = ' + term(k, 'x')), ans: Bk - E });
    }
    if (k > 1) { how.push(W('x = ' + B(num(x)), 'divide both sides by ' + k)); steps.push({ text: 'x = ?', ans: x }); }
    const traps = [tr(k > 1 ? (A > c ? E - Bk : Bk - E) : null, 'x_onestep', 'One more step: divide both sides by ' + k + '.'), tr(-x, A > c ? 'n_intsub' : 'n_intsub', 'Check the signs when you move numbers across the =.')];
    if ((E - Bk) % (A + c) === 0) traps.push(tr((E - Bk) / (A + c), 'x_bothsides', 'To move ' + term(c, 'x') + ' to the other side, take it away from both sides.'));
    if (br && A !== c && (E - p) % (A - c) === 0) traps.push(tr((E - p) / (A - c), 'x_distribute', 'The ' + a + ' multiplies the ' + num(p) + ' in the bracket too.'));
    return { text: 'Solve for x: ' + B(e), ans: x, how, steps, traps };
  } },

{ id: 'x_slope', s: 'alg', g: 8, title: 'Slope: rise over run', pre: ['n_intsub'], paper: true,
  tip: 'Slope = rise ÷ run = (change in y) ÷ (change in x). From (1, 2) to (4, 8): rise 6, run 3, slope 2. Going down to the right means a negative slope.',
  gen(d, R) {
    let x1, y1, x2, y2, mn, md;
    if (d === 0) { mn = R.i(1, 3); md = 1; const dx = R.i(1, 3); x1 = R.i(0, 6 - dx); y1 = R.i(0, Math.max(0, 6 - mn * dx)); x2 = x1 + dx; y2 = y1 + mn * dx; if (y2 > 6) return null; }
    else if (d === 1) { mn = nz(R, -4, 4); if (mn > 0 && R.chance(.4)) mn = -mn; md = 1; const dx = R.i(1, 3); x1 = R.i(-6, 6 - dx); y1 = R.i(-6, 6); x2 = x1 + dx; y2 = y1 + mn * dx; if (Math.abs(y2) > 6) return null; }
    else { md = R.i(2, 5); mn = nz(R, -6, 6); if (gcd(mn, md) !== 1) return null; const kk = R.i(1, 2); x1 = R.i(-9, 9); y1 = R.i(-9, 9); x2 = x1 + md * kk; y2 = y1 + mn * kk; }
    if (R.chance(.4)) [x1, y1, x2, y2] = [x2, y2, x1, y1];
    const dy = y2 - y1, dx = x2 - x1, M = ' ' + MINUS + ' ', fracAns = d === 2, ans = fracAns ? F(dy, dx) : dy / dx, show = fracAns ? fr(dy, dx) : num(dy / dx);
    const how = ['slope = (change in y) ÷ (change in x)', '= (' + num(y2) + M + par2(y1) + ') ÷ (' + num(x2) + M + par2(x1) + ')', '= ' + num(dy) + ' ÷ ' + par2(dx), gcd(dy, dx) > 1 && !isInt(dy / dx) ? W('= ' + B(show), 'lowest terms: divide top and bottom by ' + gcd(dy, dx)) : '= ' + B(show)];
    const negIn = [x1, y1, x2, y2].some(v => v < 0), V = (a, b) => fracAns ? F(a, b) : a / b;
    const traps = [dy ? tr(V(dx, dy), 'x_slope', 'Slope is rise over run: the change in y goes on top.') : null, tr(V(-dy, dx), negIn ? 'n_intsub' : 'x_slope', 'Subtract in the same order on top and bottom, and check the signs.'),
      Math.abs(dx) > 1 ? tr(fracAns ? { n: dy, d: 1 } : dy, 'x_slope', 'That is the rise. Divide it by the run.') : null];
    return { text: 'What is the slope of the line through ' + B(pt(x1, y1)) + ' and ' + B(pt(x2, y2)) + '?' + (fracAns ? ' Give it as a fraction in lowest terms.' : ''), ans, type: fracAns ? 'frac' : 'num', low: fracAns || undefined,
      vis: d < 2 ? plotSVG([{ x: x1, y: y1 }, { x: x2, y: y2 }], { r: 6, line: [{ x: x1, y: y1 }, { x: x2, y: y2 }] }) : '', how,
      steps: [{ text: 'Change in y: ' + B(num(y2) + M + par2(y1)) + ' = ?', ans: dy }, { text: 'Change in x: ' + B(num(x2) + M + par2(x1)) + ' = ?', ans: dx },
        { text: B(num(dy) + ' ÷ ' + par2(dx)) + ' = ?', ans, type: fracAns ? 'frac' : 'num' }], traps };
  } },

{ id: 'x_intercept', s: 'alg', g: 8, title: 'Intercepts: where a line crosses', paper: true,
  tip: 'On the x-axis y = 0; on the y-axis x = 0. For 2x + 3y = 12, cover up the y-term: 2x = 12, so it crosses the x-axis at x = 6. Cover the x-term: 3y = 12, y = 4.',
  gen(d, R) {
    const undo = b => b < 0 ? 'add ' + num(-b) + ' to both sides' : 'take ' + num(b) + ' from both sides';
    const std = d === 0 || d === 2 && R.chance(.6);
    if (std) {
      let a = R.i(2, 6), b = R.i(2, 6); if (a === b) return null;
      if (d === 2) { if (R.chance(.5)) a = -a; else b = -b; }
      const L = Math.abs(a * b) / gcd(a, b), c = L * R.i(1, 4) * (d === 2 && R.chance(.4) ? -1 : 1), askX = R.chance(.5), e = lin2(a, b, c);
      const co = askX ? a : b, ot = askX ? b : a, v = askX ? 'x' : 'y', o = askX ? 'y' : 'x', ans = c / co;
      return { text: 'Where does ' + B(e) + ' cross the ' + B(v + '-axis') + '? Type the ' + v + '-value.', ans,
        how: [e, W(askX ? term(a, 'x') + ' ' + signed(b) + '(0) = ' + num(c) : num(a) + '(0) ' + signed(b) + 'y = ' + num(c), 'on the ' + v + '-axis, ' + o + ' = 0'), term(co, v) + ' = ' + num(c), v + ' = ' + B(num(ans))],
        steps: [{ text: 'Put ' + o + ' = 0. ' + B('?' + v + ' = ' + num(c)), ans: co }, { text: B(term(co, v) + ' = ' + num(c)) + '. ' + v + ' = ?', ans }],
        traps: [tr(c / ot, 'x_intercept', 'On the ' + v + '-axis it is ' + o + ' that is 0, so cover up the ' + o + '-term.'), tr(c, 'x_onestep', 'One more step: divide by ' + num(co) + '.'), tr(-ans, 'n_intmul', 'Check the sign when you divide.')] };
    }
    const fracM = d === 2;
    const q = fracM ? R.i(2, 4) : 1, p = fracM ? nz(R, -5, 5) : nz(R, -5, 5); if (fracM && gcd(p, q) !== 1) return null;
    const xi = nz(R, -6, 6) * q, b = -p * xi / q; if (b === 0) return null;
    const mS = fracM ? fr(p, q) + 'x' : term(p, 'x'), e = 'y = ' + mS + ' ' + signed(b), how = [e, W('0 = ' + mS + ' ' + signed(b), 'on the x-axis, y = 0'), W(mS === 'x' ? 'x = ' + B(num(xi)) : mS + ' = ' + num(-b), undo(b))];
    if (fracM) how.push(W('x = ' + num(-b) + ' × ' + fr(q, p), 'multiply both sides by the flip of ' + fr(p, q)));
    if (mS !== 'x') how.push('x = ' + B(num(xi)));
    return { text: 'Where does ' + B(e) + ' cross the ' + B('x-axis') + '? Type the x-value.', ans: xi, how,
      steps: [{ text: 'Put y = 0 and move the number over: ' + B(mS + ' = ?'), ans: -b }, { text: 'x = ?', ans: xi }],
      traps: [tr(-xi, 'x_onestep', 'Moving ' + num(b) + ' to the other side changes its sign.'), tr(b, 'x_intercept', 'That is where it crosses the y-axis. For the x-axis, set y = 0.'), fracM ? tr(-b * p / q, 'f_divfrac', 'To undo × ' + fr(p, q) + ', multiply by its flip, ' + fr(q, p) + '.') : null] };
  } },

{ id: 'x_linear', s: 'alg', g: 8, title: 'Use y = mx + b', paper: true,
  tip: 'In y = mx + b, m is the slope and b is where it starts (y when x = 0). Each step of 1 to the right changes y by m. y = 3x + 4 at x = 5: 15 + 4 = 19.',
  gen(d, R) {
    const m = nz(R, -6, 6), b = nz(R, -15, 15), M = ' ' + MINUS + ' ', eq = 'y = ' + poly([m, b]);
    if (d === 0) {
      const v = nz(R, -6, 8), p = m * v, ans = p + b;
      return { text: 'For ' + B(eq) + ', what is y when ' + B('x = ' + num(v)) + '?', ans,
        how: [W('y = ' + num(m) + ' × ' + par2(v) + ' ' + signed(b), 'put in x = ' + num(v)), 'y = ' + num(p) + ' ' + signed(b), 'y = ' + B(num(ans))],
        steps: [{ text: B(num(m) + ' × ' + par2(v)) + ' = ?', ans: p }, { text: B(num(p) + ' ' + signed(b)) + ' = ?', ans }],
        traps: [tr(p, 'x_linear', 'Don\'t forget the ' + signed(b) + ' at the end.'), tr(-p + b, 'n_intmul', 'Check the sign of ' + num(m) + ' × ' + par2(v) + '.'), tr(p - b, 'n_intadd', 'Check the sign when you add ' + num(b) + '.')] };
    }
    if (d === 1) {
      const x = nz(R, -9, 9), Y = m * x + b, undo = b < 0 ? 'add ' + num(-b) + ' to both sides' : 'take ' + num(b) + ' from both sides';
      return { text: 'For ' + B(eq) + ', what is x when ' + B('y = ' + num(Y)) + '?', ans: x,
        how: [W(num(Y) + ' = ' + poly([m, b]), 'put in y = ' + num(Y)), W(num(Y - b) + ' = ' + term(m, 'x'), undo), W('x = ' + B(num(x)), 'divide both sides by ' + num(m))],
        steps: [{ text: undo[0].toUpperCase() + undo.slice(1) + ': ' + B('? = ' + term(m, 'x')), ans: Y - b }, { text: 'x = ?', ans: x }],
        traps: [(Y + b) % m === 0 ? tr((Y + b) / m, 'n_intsub', 'To undo ' + signed(b) + ', do the opposite.') : null, tr(Y - b, 'x_twostep', 'One more step: divide by ' + num(m) + '.'), tr(m * Y + b, 'x_linear', 'You are given y, not x. Solve for x.')] };
    }
    const x1 = nz(R, -6, 6), y1 = m * x1 + b;
    if (R.chance(.5)) {
      let x2; do { x2 = R.i(-8, 10); } while (x2 === x1 || x2 === 0); const dx = x2 - x1, rise = m * dx, y2 = y1 + rise;
      return { text: 'A line has slope ' + B(num(m)) + ' and goes through ' + B(pt(x1, y1)) + '. What is y when ' + B('x = ' + num(x2)) + '?', ans: y2,
        how: [W('run = ' + num(x2) + M + par2(x1) + ' = ' + num(dx), 'how far x moves'), W('rise = ' + num(m) + ' × ' + par2(dx) + ' = ' + num(rise), 'y changes by the slope for each step'), 'y = ' + num(y1) + ' + ' + par2(rise) + ' = ' + B(num(y2))],
        steps: [{ text: 'Run: ' + B(num(x2) + M + par2(x1)) + ' = ?', ans: dx }, { text: 'Rise: ' + B(num(m) + ' × ' + par2(dx)) + ' = ?', ans: rise }, { text: B(num(y1) + ' + ' + par2(rise)) + ' = ?', ans: y2 }],
        traps: [tr(y1 + m * x2, 'x_linear', 'Measure the run from x = ' + num(x1) + ', not from 0.'), tr(y1 - rise, 'n_intmul', 'Check the sign of the rise.'), tr(m * x2, 'x_linear', 'Start from the point you know, y = ' + num(y1) + '.')] };
    }
    const p = m * x1;
    return { text: 'A line has slope ' + B(num(m)) + ' and goes through ' + B(pt(x1, y1)) + '. Write it as y = ' + num(m) + 'x + b. What is b?', ans: b,
      how: [W(num(y1) + ' = ' + num(m) + ' × ' + par2(x1) + ' + b', 'put in the point'), num(y1) + ' = ' + num(p) + ' + b', W('b = ' + num(y1) + M + par2(p) + ' = ' + B(num(b)), 'take ' + num(p) + ' from both sides')],
      steps: [{ text: B(num(m) + ' × ' + par2(x1)) + ' = ?', ans: p }, { text: B(num(y1) + M + par2(p)) + ' = ?', ans: b }],
      traps: [tr(y1 + p, 'n_intsub', 'To get b alone, take ' + num(p) + ' away from both sides.'), tr(y1, 'x_linear', 'b is y when x = 0, and this point has x = ' + num(x1) + '.')] };
  } },

{ id: 'x_system', s: 'alg', g: 8, title: 'Systems: add or subtract to cancel', paper: true,
  tip: 'Add or subtract the equations so one letter cancels. x + y = 10 and x − y = 4: add them, 2x = 14, so x = 7. Then 7 + y = 10, so y = 3.',
  gen(d, R) {
    const askX = R.chance(.5), v = askX ? 'x' : 'y', o = askX ? 'y' : 'x';
    let x, y, e1, e2, how, steps;
    if (d === 0) {
      y = R.i(1, 12); x = y + R.i(1, 12); const s = x + y, t = x - y;
      e1 = 'x + y = ' + s; e2 = 'x ' + MINUS + ' y = ' + t;
      how = askX ? [W('2x = ' + (s + t), 'add the equations: + y and ' + MINUS + ' y cancel'), 'x = ' + B(x)] : [W('2y = ' + (s - t), 'take the second equation from the first: the x\'s cancel'), 'y = ' + B(y)];
      steps = [{ text: (askX ? 'Add the equations: ' + B('2x = ?') : 'Take the second from the first: ' + B('2y = ?')), ans: askX ? s + t : s - t }, { text: v + ' = ?', ans: askX ? x : y }];
    } else if (d === 1) {
      x = nz(R, -6, 9); y = nz(R, -6, 9); const a = R.i(1, 6), dd = R.i(1, 6), b = nz(R, -6, 6), opp = R.chance(.5), b2 = opp ? -b : b;
      const K = opp ? a + dd : Math.abs(a - dd); if (K === 0) return null;
      const c = a * x + b * y, e = dd * x + b2 * y, rhs = opp ? c + e : a > dd ? c - e : e - c;
      e1 = lin2(a, b, c); e2 = lin2(dd, b2, e);
      how = isol(K, 'x', rhs, opp ? 'add the equations: the y-terms cancel' : a > dd ? 'take the second equation from the first: the y-terms cancel' : 'take the first equation from the second: the y-terms cancel', askX);
      steps = [{ text: (opp ? 'Add' : 'Subtract') + ' the equations: ' + B('?x = ' + num(rhs)), ans: K }, { text: 'x = ?', ans: x }];
      if (!askX) { how = how.concat([W(ex([[a * x, ''], [b, 'y']]) + ' = ' + num(c), 'put x = ' + num(x) + ' into the first equation')], isol(b, 'y', c - a * x, a * x > 0 ? 'take ' + num(a * x) + ' from both sides' : 'add ' + num(-a * x) + ' to both sides', true)); steps.push({ text: 'Put x = ' + num(x) + ' into the first equation. y = ?', ans: y }); }
    } else {
      x = nz(R, -6, 8); y = nz(R, -6, 8); const a = R.i(2, 5), b = nz(R, -6, 6), e = nz(R, -5, 5), K0 = b - a * e, K = Math.abs(K0); if (K === 0) return null;
      const c = a * x + b * y, f = x + e * y, rhs = K0 > 0 ? c - a * f : a * f - c;
      e1 = lin2(a, b, c); e2 = lin2(1, e, f);
      how = [W(lin2(a, a * e, a * f), 'multiply the second equation by ' + a)].concat(isol(K, 'y', rhs, K0 > 0 ? 'take it from the first equation: the x-terms cancel' : 'take the first equation from it: the x-terms cancel', !askX));
      steps = [{ text: 'Multiply the second by ' + a + ' and subtract to cancel x: ' + B('?y = ' + num(rhs)), ans: K }, { text: 'y = ?', ans: y }];
      if (askX) { how = how.concat([W(ex([[1, 'x'], [e * y, '']]) + ' = ' + num(f), 'put y = ' + num(y) + ' into the second equation'), 'x = ' + B(num(x))]); steps.push({ text: 'Put y = ' + num(y) + ' into the second equation. x = ?', ans: x }); }
    }
    const ans = askX ? x : y, oth = askX ? y : x;
    return { text: 'Solve the system:<br>' + B(e1) + '<br>' + B(e2) + '<br>What is ' + v + '?', ans, how, steps,
      traps: [tr(oth, 'x_system', 'That is ' + o + '. The question asks for ' + v + '.'), tr(-ans, 'n_intsub', 'Check the signs when you add or take away the equations.'), d === 0 ? tr(2 * ans, 'x_system', 'That is 2' + v + '. Divide by 2.') : null] };
  } },

{ id: 'x_functab', s: 'alg', g: 8, title: 'Function tables: find y = mx + b', paper: true,
  tip: 'm is how much y changes when x goes up by 1 (change in y ÷ change in x). b is y when x = 0: step back from the table. x 1, 2, 3 and y 5, 8, 11: m = 3, b = 5 − 3 = 2.',
  gen(d, R) {
    const st = d === 0 ? 1 : R.pick([2, 3]), m = d === 0 ? R.i(2, 6) : d === 1 ? nz(R, -5, 6) : (R.chance(.8) ? -1 : 1) * R.i(2, 6), b = d === 0 ? R.i(1, 9) : nz(R, -9, 9);
    const x0 = d === 0 ? R.i(1, 2) : d === 1 ? R.i(1, 3) : R.i(-4, 1), xs = [0, 1, 2, 3].map(i => x0 + i * st), ys = xs.map(v => m * v + b);
    if (xs.includes(0)) return null;
    const ask = d === 0 ? R.pick(['m', 'b']) : d === 1 ? R.pick(['m', 'b', 'y']) : R.pick(['b', 'y', 'x']), dy = ys[1] - ys[0], M = ' ' + MINUS + ' ';
    const mL = bold => st === 1 ? [W('m = ' + num(ys[1]) + M + par2(ys[0]) + ' = ' + (bold ? B(num(m)) : num(m)), 'y changes this much each time x goes up 1')]
      : [W('m = (' + num(ys[1]) + M + par2(ys[0]) + ') ÷ (' + num(xs[1]) + M + par2(xs[0]) + ')', 'change in y ÷ change in x'), 'm = ' + num(dy) + ' ÷ ' + st + ' = ' + (bold ? B(num(m)) : num(m))];
    const bL = bold => [W(num(ys[0]) + ' = ' + num(m) + ' × ' + par2(xs[0]) + ' + b', 'put in the first pair'), 'b = ' + num(ys[0]) + M + par2(m * xs[0]) + ' = ' + (bold ? B(num(b)) : num(b))];
    const vis = table([['x'].concat(xs), ['y'].concat(ys)]), rule = 'The table follows a rule y = mx + b. ';
    const mSteps = [{ text: 'Change in y from one column to the next?', ans: dy }, { text: 'm = ?', ans: m }], bStep = { text: 'b = ?', ans: b };
    if (ask === 'm') return { text: rule + 'What is ' + B('m') + '?', vis, ans: m, how: mL(true), steps: mSteps,
      traps: [st > 1 ? tr(dy, 'x_slope', 'x goes up by ' + st + ' each time, so divide the change in y by ' + st + '.') : null, tr(-m, 'n_intsub', 'Check the sign: does y go up or down?'), tr(ys[0], 'x_functab', 'm is how much y changes, not the first y.')] };
    if (ask === 'b') return { text: rule + 'What is ' + B('b') + '?', vis, ans: b, how: mL(false).concat(bL(true)), steps: mSteps.concat([bStep]),
      traps: [tr(ys[0], 'x_functab', 'b is y when x = 0. Step back from x = ' + num(xs[0]) + ' to x = 0.'), tr(ys[0] + m * xs[0], 'n_intsub', 'Stepping back to x = 0 means taking ' + num(xs[0]) + ' lots of m away.'), tr(m, 'x_functab', 'That is m. b is where the line starts.')] };
    if (ask === 'y') { const X = R.pick([10, 12, 15, 20, 25]), Y = m * X + b;
      return { text: rule + 'What is y when ' + B('x = ' + X) + '?', vis, ans: Y, how: mL(false).concat(bL(false), ['y = ' + num(m) + ' × ' + X + ' ' + signed(b) + ' = ' + B(num(Y))]), steps: mSteps.concat([bStep, { text: 'y when x = ' + X + '?', ans: Y }]),
        traps: [tr(m * X, 'x_linear', 'Don\'t forget to add b.'), tr(ys[3] + m * (X - xs[3]) + m, 'x_functab', 'Count the steps from the last column carefully.'), st > 1 ? tr(dy * X + b, 'x_slope', 'm is the change in y for x going up by 1, not by ' + st + '.') : null] }; }
    const X = R.i(8, 16), Y = m * X + b, und = b < 0 ? 'add ' + num(-b) + ' to both sides' : 'take ' + num(b) + ' from both sides';
    return { text: rule + 'What is x when ' + B('y = ' + num(Y)) + '?', vis, ans: X, how: mL(false).concat(bL(false), [num(Y) + ' = ' + poly([m, b])], isol(m, 'x', Y - b, und, true)),
      steps: mSteps.concat([bStep, { text: 'x = ?', ans: X }]),
      traps: [tr(m * Y + b, 'x_functab', 'You are given y. Solve for x.'), (Y + b) % m === 0 ? tr((Y + b) / m, 'n_intsub', 'To undo ' + signed(b) + ', do the opposite.') : null] };
  } },

{ id: 'x_perp', s: 'alg', g: 9, title: 'Parallel and perpendicular slopes',
  tip: 'Parallel lines have the same slope. Perpendicular slopes flip and change sign: slope 2/3 goes with −3/2, and slope 4 goes with −1/4.',
  gen(d, R) {
    const perp = d === 0 ? R.chance(.6) : d === 1 ? R.chance(.7) : true;
    let mn, md, src, how0;
    if (d === 0) { mn = nz(R, -6, 6); md = 1; const b = nz(R, -9, 9); src = 'y = ' + poly([mn, b]); how0 = 'The slope of ' + src + ' is ' + num(mn) + '.'; }
    else if (d === 1 && R.chance(.6) || d === 2 && R.chance(.3)) { md = R.i(2, 5); mn = nz(R, -6, 6); if (gcd(mn, md) !== 1) return null; const b = nz(R, -9, 9); src = 'y = ' + fr(mn, md) + 'x ' + signed(b); how0 = 'The slope of ' + src + ' is ' + fr(mn, md) + '.'; }
    else if (d === 1 || R.chance(.6)) { const a = nz(R, -6, 6), b = nz(R, -6, 6), c = nz(R, -12, 12); if (Math.abs(a) === Math.abs(b)) return null; [mn, md] = reduce(-a, b); src = lin2(a, b, c); how0 = [W(term(b, 'y') + ' = ' + poly([-a, c]), 'solve for y: move the x-term'), W('slope = ' + num(-a) + ' ÷ ' + par2(b) + ' = ' + fr(mn, md), 'divide by ' + num(b))]; }
    else { const x1 = R.i(-6, 6), y1 = R.i(-6, 6), dx = nz(R, -5, 5), dy = nz(R, -5, 5); if (Math.abs(dx) === Math.abs(dy)) return null; [mn, md] = reduce(dy, dx); src = 'the line through ' + pt(x1, y1) + ' and ' + pt(x1 + dx, y1 + dy); how0 = W('Slope of that line: ' + num(dy) + ' ÷ ' + par2(dx) + ' = ' + fr(mn, md), 'change in y ÷ change in x'); }
    const ans = perp ? F(-md, mn) : F(mn, md), as = perp ? fr(-md, mn) : fr(mn, md);
    return { text: 'What is the slope of a line ' + (perp ? 'perpendicular' : 'parallel') + ' to ' + B(src) + '?', ans, type: 'frac',
      how: [].concat(how0, [perp ? W('Perpendicular slope: ' + B(as), 'flip it and change the sign') : W('Parallel slope: ' + B(as), 'parallel lines have the same slope')]),
      steps: perp ? [{ text: 'Slope of the given line?', ans: F(mn, md), type: 'frac' }, { text: 'Flip it and change the sign: ?', ans, type: 'frac' }] : [{ text: 'Slope of the given line?', ans: F(mn, md), type: 'frac' }],
      traps: perp ? [tr(F(mn, md), 'x_perp', 'That is the parallel slope. Perpendicular: flip it and change the sign.'), tr(F(md, mn), 'x_perp', 'Flip it AND change the sign.'), tr(F(-mn, md), 'x_perp', 'Change the sign AND flip it upside down.')]
        : [tr(F(-md, mn), 'x_perp', 'Parallel lines have the same slope; flipping is for perpendicular lines.'), tr(F(-mn, md), 'x_perp', 'Parallel lines have exactly the same slope, same sign too.')] };
  } },

{ id: 'x_foil', s: 'alg', g: 9, title: 'Multiply binomials: (x + a)(x + b)', paper: true,
  tip: '(x + a)(x + b) = x² + (a + b)x + ab: the middle number is the sum, the last is the product. (x + 3)(x + 5) = x² + 8x + 15.',
  gen(d, R) {
    const X2 = 'x<sup>2</sup>';
    let p = 1, q = 1, a, b;
    if (d === 0) { a = R.i(1, 9); b = R.i(1, 9); }
    else if (d === 1) { a = nz(R, -9, 9); b = nz(R, -9, 9); if (a > 0 && b > 0) a = -a; }
    else if (R.chance(.3)) { a = nz(R, -9, 9); b = a; }
    else { p = R.i(1, 5); q = R.i(1, 5); if (p === 1 && q === 1) return null; a = nz(R, -7, 7); b = nz(R, -7, 7); }
    const A = p * q, Bm = p * b + q * a, Cc = a * b; if (Bm === 0) return null;
    const sqr = p === 1 && q === 1 && a === b, askMid = d === 2 ? R.chance(.75) : R.chance(.5), ans = askMid ? Bm : Cc;
    const lead = A === 1 ? X2 : A + X2, prod = sqr ? pw(bin(1, a), 2) : bin(p, a) + bin(q, b);
    const formS = askMid ? lead + ' + ?x ' + signed(Cc) : lead + (Bm < 0 ? ' ' + MINUS + ' ' : ' + ') + (Math.abs(Bm) === 1 ? '' : num(Math.abs(Bm))) + 'x + ?';
    const expand = ex([[A, X2], [p * b, 'x'], [q * a, 'x'], [Cc, '']]);
    const how = [W(prod + ' = ' + expand, 'first, outer, inner, last'), W('= ' + poly([A, Bm, Cc]), 'combine the middle terms: ' + num(p * b) + ' + ' + par2(q * a) + ' = ' + num(Bm)), 'The missing number is ' + B(num(ans)) + '.'];
    const traps = askMid ? [tr(Cc, 'x_foil', 'The middle number comes from adding the outer and inner terms, not multiplying.'), tr(-Bm, 'n_intadd', 'Check the signs when you add ' + num(p * b) + ' and ' + num(q * a) + '.')]
      : [tr(Bm, 'x_foil', 'The last number comes from multiplying the last terms.'), tr(-Cc, 'n_intmul', 'Check the sign of ' + num(a) + ' × ' + par2(b) + '.')];
    if (askMid && sqr) traps.push(tr(a, 'x_foil', 'There are two middle terms, ' + term(a, 'x') + ' and ' + term(a, 'x') + '. Add them.'));
    if (askMid && (p > 1 || q > 1)) traps.push(tr(a + b, 'x_foil', 'Multiply ' + num(a) + ' by ' + term(q, 'x') + ' and ' + num(b) + ' by ' + term(p, 'x') + ' first.'));
    return { text: 'Multiply out: ' + B(prod + ' = ' + formS) + '. What is the missing number?', ans, how,
      steps: [{ text: 'Outer term: ' + B(term(p, 'x') + ' × ' + par2(b) + ' = ?x'), ans: p * b }, { text: 'Inner term: ' + B(num(a) + ' × ' + term(q, 'x') + ' = ?x'), ans: q * a },
        askMid ? { text: 'Add them: ' + B(num(p * b) + ' + ' + par2(q * a)) + ' = ?', ans: Bm } : { text: 'Last term: ' + B(num(a) + ' × ' + par2(b)) + ' = ?', ans: Cc }], traps };
  } },

{ id: 'x_factor', s: 'alg', g: 9, title: 'Factor x² + bx + c', paper: true,
  tip: 'Find two numbers that multiply to c and add to b. x² + 7x + 12: 3 × 4 = 12 and 3 + 4 = 7, so (x + 3)(x + 4).',
  gen(d, R) {
    let p, q;
    if (d === 0) { p = R.i(1, 9); q = R.i(1, 9); if (p === q && R.chance(.7)) return null; }
    else { p = nz(R, -12, 12); q = nz(R, -12, 12); if (p === q || p + q === 0 || Math.abs(p * q) > 72 || p > 0 && q > 0 && R.chance(.6)) return null; }
    const b = p + q, c = p * q, e = poly([1, b, c]), ac = Math.abs(c), pairs = [];
    for (let i = 1; i * i <= ac; i++) if (ac % i === 0) pairs.push(i + ' × ' + (ac / i));
    const signL = c > 0 && b < 0 ? 'Product +, sum ' + MINUS + ': both numbers are negative.' : c < 0 ? 'Product ' + MINUS + ': one number is negative, and the bigger-sized one gets the sign of ' + num(b) + '.' : null;
    const how = [W('Need: multiply to ' + num(c) + ', add to ' + num(b), 'from ' + e)].concat(signL ? [signL] : [], [W(pairs.join(', '), 'factor pairs of ' + ac), W(num(p) + ' and ' + num(q), num(p) + ' × ' + par2(q) + ' = ' + num(c) + ' and ' + num(p) + ' + ' + par2(q) + ' = ' + num(b))]);
    const fact = e + ' = ' + bin(1, p) + bin(1, q);
    let wrong = null; for (let i = 1; i * i <= ac; i++) if (ac % i === 0) { const u = c > 0 ? (b > 0 ? i : -i) : (Math.abs(p) > Math.abs(q) ? (p > 0 ? ac / i : -ac / i) : (q > 0 ? ac / i : -ac / i)); const w = c / u; if (u + w !== b) { wrong = [u, w]; break; } }
    if (d === 0) {
      return { text: 'Factor: ' + B(e + ' = (x + ?)' + bin(1, q)) + '. What is the missing number?', ans: p, how: how.concat([fact + ', so the missing number is ' + B(p) + '.']),
        steps: [{ text: 'The missing number times ' + q + ' must make ' + c + '. What is it?', ans: p }, { text: 'Check the sum: ' + B(p + ' + ' + q) + ' = ?', ans: b }],
        traps: [c - q > 0 ? tr(c - q, 'x_factor', 'The two numbers multiply to ' + c + ', so divide ' + c + ' by ' + q + '.') : null, tr(b, 'x_factor', 'Find two numbers that multiply to ' + c + ' and add to ' + b + '.'), tr(b + q, 'x_factor', 'The two numbers add to ' + b + '.')] };
    }
    const big = R.chance(.5), lo = Math.min(p, q), hi = Math.max(p, q);
    if (d === 1) {
      const ans = big ? hi : lo;
      return { text: 'Factor ' + B(e) + ' as ' + B('(x + p)(x + q)') + '. What is the ' + (big ? 'larger' : 'smaller') + ' of p and q?', ans, how: how.concat([fact + ', so the ' + (big ? 'larger' : 'smaller') + ' is ' + B(num(ans)) + '.']),
        steps: [{ text: 'Two numbers multiply to ' + num(c) + ' and add to ' + num(b) + '. The ' + (big ? 'larger' : 'smaller') + ' one?', ans }],
        traps: [tr(-ans, 'x_factor', 'Check the signs: the two numbers must add to ' + num(b) + '.'), tr(big ? lo : hi, 'x_factor', 'That is the ' + (big ? 'smaller' : 'larger') + ' one.'), wrong ? tr(big ? Math.max(...wrong) : Math.min(...wrong), 'x_factor', 'Those multiply to ' + num(c) + ' but do not add to ' + num(b) + '.') : null] };
    }
    const r1 = -p, r2 = -q, ans = big ? Math.max(r1, r2) : Math.min(r1, r2);
    return { text: 'Solve ' + B(e + ' = 0') + ' by factoring. What is the ' + (big ? 'larger' : 'smaller') + ' solution?', ans,
      how: how.concat([bin(1, p) + bin(1, q) + ' = 0', W('x = ' + num(r1) + ' or x = ' + num(r2), 'one bracket must be 0'), 'The ' + (big ? 'larger' : 'smaller') + ' solution is ' + B(num(ans)) + '.']),
      steps: [{ text: 'Factor: ' + B(bin(1, p) + '(x + ?)') + ' = 0. What is the missing number?', ans: q }, { text: 'The ' + (big ? 'larger' : 'smaller') + ' solution?', ans }],
      traps: [tr(-ans, 'x_factor', bin(1, p) + ' = 0 means x = ' + num(-p) + ': the sign changes.'), tr(big ? Math.min(r1, r2) : Math.max(r1, r2), 'x_factor', 'That is the ' + (big ? 'smaller' : 'larger') + ' solution.')] };
  } },

{ id: 'x_diffsq', s: 'alg', g: 9, title: 'Difference of squares', pre: ['m_diffsq'],
  tip: 'a² − b² = (a − b)(a + b). In your head: 41² − 39² = 2 × 80 = 160. And 47 × 53 = (50 − 3)(50 + 3) = 2,500 − 9 = 2,491.',
  gen(d, R) {
    const M = ' ' + MINUS + ' ';
    if (d === 0) {
      const s = R.i(4, 20) * 10, t = R.pick([2, 4, 6, 8, 10]), a = (s + t) / 2, b = (s - t) / 2, ans = s * t;
      return { text: 'Work it out in your head: ' + B(pw(a, 2) + M + pw(b, 2)), ans,
        how: [pw('a', 2) + M + pw('b', 2) + ' = (a ' + MINUS + ' b)(a + b).', '(' + a + M + b + ')(' + a + ' + ' + b + ') = ' + t + ' × ' + s + ' = ' + B(num(ans)) + '.'],
        steps: [{ text: B(a + M + b) + ' = ?', ans: t }, { text: B(a + ' + ' + b) + ' = ?', ans: s }, { text: B(t + ' × ' + s) + ' = ?', ans }],
        traps: [tr(t * t, 'x_diffsq', pw('a', 2) + M + pw('b', 2) + ' is not (a ' + MINUS + ' b)². Multiply the difference by the sum.'), tr(s, 'x_diffsq', 'Multiply (a ' + MINUS + ' b) by (a + b).'), tr(s * t / 2, 'x_diffsq', 'Check a + b and a ' + MINUS + ' b again.')] };
    }
    if (d === 1 && R.chance(.5)) {
      const m = R.pick([20, 30, 40, 50, 60, 70, 80, 90, 100]), k = R.i(1, 6), a = m - k, b = m + k, ans = m * m - k * k;
      return { text: 'Work it out in your head: ' + B(a + ' × ' + b), ans,
        how: [a + ' and ' + b + ' are both ' + k + ' away from ' + m + ', so ' + a + ' × ' + b + ' = (' + m + M + k + ')(' + m + ' + ' + k + ') = ' + pw(m, 2) + M + pw(k, 2) + '.', num(m * m) + M + (k * k) + ' = ' + B(num(ans)) + '.'],
        steps: [{ text: 'What number is halfway between ' + a + ' and ' + b + '?', ans: m }, { text: B(pw(m, 2)) + ' = ?', ans: m * m }, { text: B(num(m * m) + M + pw(k, 2)) + ' = ?', ans }],
        traps: [tr(m * m - k, 'x_diffsq', 'Take away ' + k + '², not ' + k + '.'), tr(m * m + k * k, 'x_diffsq', '(m ' + MINUS + ' k)(m + k) is m² minus k².'), tr(m * m, 'x_diffsq', 'Don\'t forget to take away ' + k + '².')] };
    }
    if (d === 1) {
      const n = R.i(1, 5), k = R.i(2, 12), nx = term(n, 'x');
      return { text: B(poly([n * n, 0, -k * k]) + ' = (' + nx + M + '?)(' + nx + ' + ?)') + '. What number goes in both boxes?', ans: k,
        how: [poly([n * n, 0, -k * k]) + ' = ' + pw('(' + nx + ')', 2) + M + pw(k, 2) + '.', 'So it is (' + nx + M + k + ')(' + nx + ' + ' + k + '), and the number is ' + B(k) + '.'],
        steps: [{ text: B(k * k) + ' is what number squared?', ans: k }],
        traps: [tr(k * k, 'x_diffsq', 'The boxes hold the number that was squared to make ' + (k * k) + '.'), tr(k * k / 2, 'w_roots', 'Half is not the square root. What times itself makes ' + (k * k) + '?')] };
    }
    const kind = R.i(0, 2);
    if (kind === 0) {
      const H = R.pick([100, 200, 500, 1000]), k = R.i(1, 6), a = H + k, b = H - k, ans = 4 * H * k;
      return { text: 'Work it out in your head: ' + B(pw(num(a), 2) + M + pw(num(b), 2)), ans,
        how: ['(a ' + MINUS + ' b)(a + b): ' + num(a) + M + num(b) + ' = ' + (2 * k) + ' and ' + num(a) + ' + ' + num(b) + ' = ' + num(2 * H) + '.', (2 * k) + ' × ' + num(2 * H) + ' = ' + B(num(ans)) + '.'],
        steps: [{ text: B(num(a) + M + num(b)) + ' = ?', ans: 2 * k }, { text: B(num(a) + ' + ' + num(b)) + ' = ?', ans: 2 * H }, { text: B((2 * k) + ' × ' + num(2 * H)) + ' = ?', ans }],
        traps: [tr(4 * k * k, 'x_diffsq', 'That is (a ' + MINUS + ' b)². Multiply the difference by the sum instead.'), tr(2 * H, 'x_diffsq', 'Multiply the sum by the difference.')] };
    }
    const t = R.i(2, 9), s = R.i(t + 2, 30), P = s * t;
    if (kind === 1) return { text: 'If ' + B(pw('a', 2) + M + pw('b', 2) + ' = ' + P) + ' and ' + B('a ' + MINUS + ' b = ' + t) + ', what is ' + B('a + b') + '?', ans: s,
      how: [pw('a', 2) + M + pw('b', 2) + ' = (a ' + MINUS + ' b)(a + b), so ' + P + ' = ' + t + ' × (a + b).', 'a + b = ' + P + ' ÷ ' + t + ' = ' + B(s) + '.'],
      steps: [{ text: B(P + ' ÷ ' + t) + ' = ?', ans: s }],
      traps: [tr(P - t, 'x_diffsq', pw('a', 2) + M + pw('b', 2) + ' is (a ' + MINUS + ' b) times (a + b), so divide.'), tr(P * t, 'x_diffsq', 'Divide by (a ' + MINUS + ' b), don\'t multiply.')] };
    return { text: 'If ' + B('a + b = ' + s) + ' and ' + B('a ' + MINUS + ' b = ' + t) + ', what is ' + B(pw('a', 2) + M + pw('b', 2)) + '?', ans: P,
      how: [pw('a', 2) + M + pw('b', 2) + ' = (a ' + MINUS + ' b)(a + b). No need to find a and b.', t + ' × ' + s + ' = ' + B(P) + '.'],
      steps: [{ text: B(t + ' × ' + s) + ' = ?', ans: P }],
      traps: [tr(s * s - t * t, 'x_diffsq', 'You squared the sum and the difference. Just multiply them.'), tr(s + t, 'x_diffsq', 'Multiply (a ' + MINUS + ' b) by (a + b).')] };
  } },

{ id: 'x_absval', s: 'alg', g: 9, title: 'Absolute value equations', pre: ['n_abs'], paper: true,
  tip: '|x − 3| = 5 means x is 5 away from 3, so x − 3 = 5 or x − 3 = −5: x = 8 or x = −2. Get the |…| alone first.',
  gen(d, R) {
    const big = R.chance(.5), word = big ? 'larger' : 'smaller', abs = s => '|' + s + '|';
    let e, how, r1, r2, steps = [], traps = [];
    if (d < 2) {
      const a = d === 0 ? R.i(1, 10) : -R.i(1, 10), b = R.i(1, 10), inside = 'x ' + signed(-a);
      e = abs(inside) + ' = ' + b; r1 = a + b; r2 = a - b;
      how = [e, W(inside + ' = ' + b + ' &nbsp;or&nbsp; ' + inside + ' = ' + MINUS + b, 'the inside is ' + b + ' or ' + MINUS + b), 'x = ' + num(r1) + ' &nbsp;or&nbsp; x = ' + num(r2)];
      steps = [{ text: 'If ' + B(inside + ' = ' + b) + ', x = ?', ans: r1 }, { text: 'If ' + B(inside + ' = ' + MINUS + b) + ', x = ?', ans: r2 }];
      if (d === 1) traps.push(tr(big ? -a + b : -a - b, 'x_absval', inside + ' = 0 at x = ' + num(a) + ', so the solutions are ' + b + ' either side of ' + num(a) + '.'));
    } else if (R.chance(.5)) {
      const c = R.i(2, 5), a = nz(R, -9, 9), b = R.i(1, 9), k = nz(R, -10, 10), f = c * b + k, inside = 'x ' + signed(-a);
      e = c + abs(inside) + ' ' + signed(k) + ' = ' + num(f); r1 = a + b; r2 = a - b;
      how = [e, W(c + abs(inside) + ' = ' + num(c * b), k > 0 ? 'take ' + k + ' from both sides' : 'add ' + num(-k) + ' to both sides'), W(abs(inside) + ' = ' + b, 'divide both sides by ' + c), inside + ' = ' + b + ' &nbsp;or&nbsp; ' + inside + ' = ' + MINUS + b, 'x = ' + num(r1) + ' &nbsp;or&nbsp; x = ' + num(r2)];
      steps = [{ text: 'Get the absolute value alone: ' + B(abs(inside) + ' = ?'), ans: b }, { text: 'The ' + word + ' solution?', ans: big ? Math.max(r1, r2) : Math.min(r1, r2) }];
      traps.push(tr(big ? a + f : a - f, 'x_twostep', 'Get the |…| alone first: undo the ' + signed(k) + ' and the × ' + c + '.'));
    } else {
      const kx = R.pick([2, 3]), r = nz(R, -8, 8), s0 = nz(R, -8, 8); if (r === s0) return null;
      const a = kx * (r + s0) / 2, b = kx * Math.abs(r - s0) / 2; if (!isInt(a) || !isInt(b) || a === 0) return null;
      const inside = term(kx, 'x') + ' ' + signed(-a); e = abs(inside) + ' = ' + b; r1 = (a + b) / kx; r2 = (a - b) / kx;
      how = [e, inside + ' = ' + b + ' &nbsp;or&nbsp; ' + inside + ' = ' + MINUS + b, W(term(kx, 'x') + ' = ' + num(a + b) + ' &nbsp;or&nbsp; ' + term(kx, 'x') + ' = ' + num(a - b), a > 0 ? 'add ' + a + ' to both sides' : 'take ' + num(-a) + ' from both sides'), W('x = ' + num(r1) + ' &nbsp;or&nbsp; x = ' + num(r2), 'divide by ' + kx)];
      steps = [{ text: 'If ' + B(inside + ' = ' + b) + ', x = ?', ans: r1 }, { text: 'If ' + B(inside + ' = ' + MINUS + b) + ', x = ?', ans: r2 }];
      traps.push(tr(big ? a + b : a - b, 'x_onestep', 'One more step: divide by ' + kx + '.'));
    }
    const ans = big ? Math.max(r1, r2) : Math.min(r1, r2), other = big ? Math.min(r1, r2) : Math.max(r1, r2);
    how.push('The ' + word + ' solution is ' + B(num(ans)) + '.');
    traps.unshift(tr(other, 'x_absval', 'There are two solutions. That one is the ' + (big ? 'smaller' : 'larger') + '.'), tr(-ans, 'n_intsub', 'Check the signs when you move the number across the =.'));
    return { text: 'Solve ' + B(e) + '. What is the ' + word + ' solution?', ans, how, steps, traps };
  } },

{ id: 'x_vertex', s: 'alg', g: 9, title: 'The vertex of a parabola', paper: true,
  tip: 'The vertex is at x = −b ÷ 2a. For y = x² − 6x + 1: x = 6 ÷ 2 = 3. Put x back in for the y-value: 9 − 18 + 1 = −8.',
  gen(d, R) {
    const a = d === 0 ? 1 : d === 1 ? R.pick([1, 1, 2, 3, -1, -2, 4]) : R.pick([2, 3, -1, -2, -3, 4, 5]), h = nz(R, -6, 6), b = -2 * a * h, c = nz(R, -15, 15), e = 'y = ' + poly([a, b, c]);
    const askY = d === 2 || d === 1 && a === 1 && R.chance(.5), k = a * h * h + b * h + c;
    const xL = [W('x = ' + num(-b) + ' ÷ ' + par2(2 * a), 'x = ' + MINUS + 'b ÷ 2a with a = ' + num(a) + ', b = ' + num(b)), 'x = ' + (askY ? num(h) : B(num(h)))];
    if (!askY) return { text: 'What is the x-coordinate of the vertex of ' + B(e) + '?', ans: h, how: xL,
      steps: [{ text: B(MINUS + 'b') + ' = ?', ans: -b }, { text: B(num(-b) + ' ÷ ' + par2(2 * a)) + ' = ?', ans: h }],
      traps: [tr(-h, 'x_vertex', 'Use ' + MINUS + 'b: change the sign of ' + num(b) + ' first.'), tr(-b / a, 'x_vertex', 'Divide by 2a, not a.'), tr(-b, 'x_vertex', 'Divide ' + MINUS + 'b by 2a.')] };
    const t1 = a * h * h, t2 = b * h;
    return { text: 'What is the ' + (a > 0 ? 'lowest' : 'highest') + ' value of ' + B(e) + '? (the y-value at the vertex)', ans: k,
      how: xL.concat([W('y = ' + num(a) + ' × ' + sq(h) + ' ' + signed(b) + ' × ' + par2(h) + ' ' + signed(c), 'put x = ' + num(h) + ' back in'), 'y = ' + num(t1) + ' ' + signed(t2) + ' ' + signed(c), 'y = ' + B(num(k))]),
      steps: [{ text: 'x-coordinate of the vertex?', ans: h }, { text: B(num(a) + ' × ' + sq(h)) + ' = ?', ans: t1 }, { text: B(num(b) + ' × ' + par2(h)) + ' = ?', ans: t2 }, { text: 'y = ?', ans: k }],
      traps: [tr(h, 'x_vertex', 'That is the x-coordinate. Put it back in to get y.'), tr(c, 'x_vertex', num(c) + ' is where it crosses the y-axis, not the vertex.'), a !== 1 ? tr(a * a * h * h + t2 + c, 'x_order', 'Square ' + num(h) + ' first, then times ' + num(a) + '.') : null, tr(a * (-h) * (-h) + b * (-h) + c, 'x_vertex', 'The vertex is at x = ' + MINUS + 'b ÷ 2a. Check the sign of x.')] };
  } },

{ id: 'x_quadform', s: 'alg', g: 10, title: 'The quadratic formula', paper: true,
  tip: 'For ax² + bx + c = 0, x = (−b ± √D) ÷ 2a with D = b² − 4ac. D above 0: two solutions; D = 0: one; D below 0: no real solutions.',
  gen(d, R) {
    const Dl = (a, b, c) => { const D = b * b - 4 * a * c; return [W('D = ' + sq(b) + ' ' + MINUS + ' 4 × ' + par2(a) + ' × ' + par2(c), 'D = b² ' + MINUS + ' 4ac'), 'D = ' + num(b * b) + ' ' + signed(-4 * a * c), 'D = ' + num(D)]; };
    if (d === 0 || d === 1 && R.chance(.5)) {
      const a = d === 0 ? 1 : nz(R, -5, 5) * (R.chance(.8) ? 1 : 1), b = nz(R, -9, 9), c = nz(R, -12, 12); if (d === 1 && Math.abs(a) === 1) return null;
      const D = b * b - 4 * a * c, L = Dl(a, b, c); L[2] = 'D = ' + B(num(D));
      return { text: 'What is the discriminant ' + B('b² ' + MINUS + ' 4ac') + ' of ' + B(poly([a, b, c]) + ' = 0') + '?', ans: D, how: L,
        steps: [{ text: B(sq(b)) + ' = ?', ans: b * b }, { text: B('4 × ' + par2(a) + ' × ' + par2(c)) + ' = ?', ans: 4 * a * c }, { text: 'D = ?', ans: D }],
        traps: [tr(b * b + 4 * a * c, 'n_intmul', 'Check the sign of 4ac: it is taken away.'), b < 0 ? tr(-b * b - 4 * a * c, 'n_intmul', 'A negative number squared is positive.') : null, tr(b * b - a * c, 'x_quadform', 'Don\'t forget the 4 in 4ac.'), tr(2 * b - 4 * a * c, 'w_exp', 'b² means b × b.')] };
    }
    if (d === 1) {
      const kind = R.i(0, 2); let a = nz(R, -4, 4), b, c;
      if (kind === 1) { const h = nz(R, -5, 5); b = 2 * a * h; c = a * h * h; } else { b = nz(R, -9, 9); c = nz(R, -9, 9); }
      const D = b * b - 4 * a * c; if (kind !== 1 && D === 0 || kind === 0 && D <= 0 || kind === 2 && D >= 0) return null;
      const ans = D > 0 ? 2 : D === 0 ? 1 : 0, L = Dl(a, b, c);
      L.push(W(B(ans) + ' real ' + plural(ans, 'solution'), D > 0 ? 'D is above 0: ± gives two answers' : D === 0 ? 'D = 0: ± 0 gives the same answer twice' : 'D is below 0: no real square root'));
      return { text: 'How many real solutions does ' + B(poly([a, b, c]) + ' = 0') + ' have?', ans, how: L,
        steps: [{ text: 'D = b² ' + MINUS + ' 4ac = ?', ans: D }, { text: 'So how many real solutions?', ans }],
        traps: [ans !== 2 ? tr(2, 'x_quadform', D === 0 ? 'D = 0 means ± 0: the same solution twice, so just one.' : 'A negative D has no real square root.') : tr(1, 'x_quadform', 'D is above 0, so ± √D gives two different answers.'), ans === 0 ? tr(1, 'x_quadform', 'D is below 0: no real square root at all.') : tr(0, 'x_quadform', 'Check the sign of D again.')] };
    }
    const d1 = R.pick([1, 2, 3]), d2 = R.pick([1, 2, 3, 5]), n1 = nz(R, -6, 6), n2 = nz(R, -6, 6);
    if (d1 * d2 === 1 || gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1 || n1 * d2 === n2 * d1) return null;
    let a = d1 * d2, b = -(n1 * d2 + n2 * d1), c = n1 * n2; const g = gcd(gcd(a, b), c); a /= g; b /= g; c /= g;
    const D = b * b - 4 * a * c, s = Math.round(Math.sqrt(D)), big = R.chance(.5), x1 = F(-b + s, 2 * a), x2 = F(-b - s, 2 * a), ans = big ? x1 : x2, oth = big ? x2 : x1;
    const L = Dl(a, b, c).concat([W('x = (' + num(-b) + ' ± ' + s + ') ÷ ' + (2 * a), '√' + D + ' = ' + s + ', and x = (' + MINUS + 'b ± √D) ÷ 2a'), 'x = ' + fr(-b + s, 2 * a) + ' &nbsp;or&nbsp; x = ' + fr(-b - s, 2 * a), 'The ' + (big ? 'larger' : 'smaller') + ' solution is ' + B(fr(ans.n, ans.d)) + '.']);
    return { text: 'Use the quadratic formula on ' + B(poly([a, b, c]) + ' = 0') + '. What is the ' + (big ? 'larger' : 'smaller') + ' solution? (A fraction is fine.)', ans, type: 'frac', how: L,
      steps: [{ text: 'D = b² ' + MINUS + ' 4ac = ?', ans: D }, { text: B('√' + D) + ' = ?', ans: s }, { text: 'The ' + (big ? 'larger' : 'smaller') + ' solution?', ans, type: 'frac' }],
      traps: [tr(oth, 'x_quadform', 'That is the ' + (big ? 'smaller' : 'larger') + ' solution.'), tr(F(-ans.n, ans.d), 'x_quadform', 'The formula starts with ' + MINUS + 'b: change the sign of b.'), tr(F(big ? -b + s : -b - s, a), 'x_quadform', 'Divide by 2a, not a.')] };
  } },

{ id: 'x_vieta', s: 'alg', g: 10, title: 'Sum and product of the roots',
  tip: 'For ax² + bx + c = 0 the two solutions add to −b/a and multiply to c/a, no solving needed. x² − 7x + 10 = 0: sum 7, product 10.',
  gen(d, R) {
    if (d === 0) {
      const r = nz(R, -9, 9), s = nz(R, -9, 9), b = -(r + s), c = r * s; if (b === 0) return null;
      const sumQ = R.chance(.5), e = poly([1, b, c]) + ' = 0';
      return { text: 'What is the ' + (sumQ ? 'sum' : 'product') + ' of the two solutions of ' + B(e) + '?', ans: sumQ ? -b : c,
        how: ['For x² + bx + c = 0, the solutions add to ' + MINUS + 'b and multiply to c.', sumQ ? 'Sum = ' + MINUS + 'b = ' + B(num(-b)) + '.' : 'Product = c = ' + B(num(c)) + '.'],
        steps: [{ text: 'What is b?', ans: b }, { text: 'The ' + (sumQ ? 'sum' : 'product') + '?', ans: sumQ ? -b : c }],
        traps: sumQ ? [tr(b, 'x_vieta', 'The sum is ' + MINUS + 'b: change the sign of b.'), tr(c, 'x_vieta', 'c is the product. The sum comes from b.')] : [tr(-c, 'x_vieta', 'The product is c itself, sign and all.'), tr(-b, 'x_vieta', 'That is the sum. The product is c.')] };
    }
    if (d === 1) {
      const a = R.i(2, 6), b = nz(R, -12, 12), c = nz(R, -12, 12), sumQ = R.chance(.5), e = poly([a, b, c]) + ' = 0', ans = sumQ ? F(-b, a) : F(c, a);
      return { text: 'What is the ' + (sumQ ? 'sum' : 'product') + ' of the two solutions of ' + B(e) + '? (A fraction is fine.)', ans, type: 'frac',
        how: ['The solutions add to ' + MINUS + 'b/a and multiply to c/a.', sumQ ? 'Sum = ' + MINUS + par2(b) + ' ÷ ' + a + ' = ' + B(fr(-b, a)) + '.' : 'Product = ' + num(c) + ' ÷ ' + a + ' = ' + B(fr(c, a)) + '.'],
        steps: [{ text: sumQ ? B(MINUS + 'b') + ' = ?' : 'What is c?', ans: sumQ ? -b : c }, { text: 'Divide by a = ' + a + ':', ans, type: 'frac' }],
        traps: sumQ ? [tr(F(-b, 1), 'x_vieta', 'Divide by a = ' + a + ' too.'), tr(F(b, a), 'x_vieta', 'The sum is ' + MINUS + 'b/a: change the sign.')] : [tr(F(c, 1), 'x_vieta', 'Divide by a = ' + a + ' too.'), tr(F(-c, a), 'x_vieta', 'The product is c/a, no sign change.')] };
    }
    const kind = R.i(0, 2), r = nz(R, -8, 8), s = nz(R, -8, 8), S = r + s, P = r * s;
    if (kind === 0) { if (S === 0) return null; const e = poly([1, -S, 0]) + ' + k = 0';
      return { text: B(e) + ' has one solution ' + B('x = ' + num(r)) + '. What is the other solution?', ans: s,
        how: ['The two solutions add to ' + MINUS + 'b = ' + num(S) + '.', 'Other = ' + num(S) + ' ' + MINUS + ' ' + par2(r) + ' = ' + B(num(s)) + '.'],
        steps: [{ text: 'The sum of the solutions?', ans: S }, { text: B(num(S) + ' ' + MINUS + ' ' + par2(r)) + ' = ?', ans: s }],
        traps: [tr(-s, 'x_vieta', 'The sum is ' + MINUS + 'b, so check the sign of b.'), tr(S + r, 'n_intsub', 'Take the known solution away from the sum.')] }; }
    if (kind === 1) { if (S === 0) return null; const e = poly([1, -S, 0]) + ' + k = 0';
      return { text: B(e) + ' has one solution ' + B('x = ' + num(r)) + '. What is k?', ans: P,
        how: ['The solutions add to ' + num(S) + ', so the other is ' + num(S) + ' ' + MINUS + ' ' + par2(r) + ' = ' + num(s) + '.', 'k is the product: ' + num(r) + ' × ' + par2(s) + ' = ' + B(num(P)) + '.'],
        steps: [{ text: 'The other solution?', ans: s }, { text: 'k = product = ?', ans: P }],
        traps: [tr(-P, 'n_intmul', 'Check the sign of the product.'), tr(r * r, 'x_vieta', 'k is the product of both solutions, not ' + num(r) + ' squared.')] }; }
    const b = nz(R, -9, 9), c = nz(R, -12, 12), ans = b * b - 2 * c, e = poly([1, b, c]) + ' = 0';
    return { text: 'The solutions of ' + B(e) + ' are r and s. What is ' + B(pw('r', 2) + ' + ' + pw('s', 2)) + '?', ans,
      how: ['r + s = ' + num(-b) + ' and rs = ' + num(c) + '.', pw('r', 2) + ' + ' + pw('s', 2) + ' = (r + s)² ' + MINUS + ' 2rs = ' + sq(-b) + ' ' + MINUS + ' 2 × ' + par2(c) + '.', num(b * b) + ' ' + signed(-2 * c) + ' = ' + B(num(ans)) + '.'],
      steps: [{ text: 'r + s = ?', ans: -b }, { text: 'rs = ?', ans: c }, { text: B(sq(-b) + ' ' + MINUS + ' 2 × ' + par2(c)) + ' = ?', ans }],
      traps: [tr(b * b, 'x_vieta', '(r + s)² is ' + pw('r', 2) + ' + 2rs + ' + pw('s', 2) + ', so take away 2rs.'), tr(b * b + 2 * c, 'n_intmul', 'Check the sign of 2rs.'), tr(b * b - c, 'x_vieta', 'Take away 2rs, not just rs.')] };
  } },

{ id: 'x_compose', s: 'alg', g: 10, title: 'Composing functions: f(g(x))', paper: true,
  tip: 'Work from the inside out. f(g(2)): find g(2) first, then put that answer into f. Order matters: f(g(x)) and g(f(x)) are usually different.',
  gen(d, R) {
    const M = ' ' + MINUS + ' ';
    if (d < 2) {
      let f, g, fs, gs, F1, G1;
      if (d === 0) { const m = R.i(2, 5), k = nz(R, -9, 9), p = R.i(2, 4), q = nz(R, -9, 9); f = v => m * v + k; g = v => p * v + q; fs = v => num(m) + ' × ' + par2(v) + ' ' + signed(k); gs = v => num(p) + ' × ' + par2(v) + ' ' + signed(q);
        F1 = 'f(x) = ' + poly([m, k]); G1 = 'g(x) = ' + poly([p, q]); }
      else { const a = nz(R, -9, 9), b = nz(R, -4, 4), c = nz(R, -6, 6); f = v => v * v + a; g = v => b * v + c; fs = v => sq(v) + ' ' + signed(a); gs = v => num(b) + ' × ' + par2(v) + ' ' + signed(c);
        F1 = 'f(x) = ' + poly([1, 0, a]); G1 = 'g(x) = ' + poly([b, c]); }
      const v = d === 0 ? R.i(1, 6) : nz(R, -4, 4), fg = d === 0 || R.chance(.5);
      const inner = fg ? g(v) : f(v), ans = fg ? f(inner) : g(inner), on = fg ? 'g' : 'f', ou = fg ? 'f' : 'g';
      const iS = fg ? gs(v) : fs(v), oS = fg ? fs(inner) : gs(inner), wrongOrder = fg ? g(f(v)) : f(g(v));
      return { text: B(F1) + ' and ' + B(G1) + '. What is ' + B(ou + '(' + on + '(' + num(v) + '))') + '?', ans,
        how: [W(on + '(' + num(v) + ') = ' + iS + ' = ' + num(inner), 'inside first'), W(ou + '(' + num(inner) + ') = ' + oS, 'put ' + num(inner) + ' into ' + ou), '= ' + B(num(ans))],
        steps: [{ text: B(on + '(' + num(v) + ')') + ' = ?', ans: inner }, { text: B(ou + '(' + num(inner) + ')') + ' = ?', ans }],
        traps: [tr(wrongOrder, 'x_compose', 'Inside first: in ' + ou + '(' + on + '(x)), ' + on + ' goes first.'), tr(f(v) + g(v), 'x_compose', ou + '(' + on + '(x)) means put ' + on + '\'s answer into ' + ou + ', not add them.'), tr(f(v) * g(v), 'x_compose', 'Composing is not multiplying: feed one answer into the other.'), d === 1 && (fg ? inner < 0 : v < 0) ? tr(fg ? -inner * inner + f(0) : g(-v * v + f(0)), 'n_intmul', 'A negative number squared is positive.') : null] };
    }
    const m = nz(R, -5, 5), k = nz(R, -9, 9), p = nz(R, -5, 5), q = nz(R, -9, 9); if (Math.abs(m) === 1 || Math.abs(p) === 1 && R.chance(.5)) return null;
    const C0 = m * q + k; if (C0 === 0) return null;
    const askC = R.chance(.7), ans = askC ? C0 : m * p;
    return { text: B('f(x) = ' + poly([m, k])) + ' and ' + B('g(x) = ' + poly([p, q])) + '. Write ' + B('f(g(x))') + ' as ' + B('Ax + C') + '. What is ' + B(askC ? 'C' : 'A') + '?', ans,
      how: [W('f(g(x)) = ' + num(m) + '(' + poly([p, q]) + ') ' + signed(k), 'put g(x) in place of x'), W('= ' + poly([m * p, m * q]) + ' ' + signed(k), 'multiply out'), '= ' + poly([m * p, C0]), (askC ? 'C' : 'A') + ' = ' + B(num(ans))],
      steps: [{ text: B(num(m) + ' × ' + par2(q)) + ' = ?', ans: m * q }, { text: askC ? 'C = ' + B(num(m * q) + ' ' + signed(k)) + ' = ?' : 'A = ' + B(num(m) + ' × ' + par2(p)) + ' = ?', ans }],
      traps: askC ? [tr(q + k, 'x_distribute', 'The ' + num(m) + ' multiplies the ' + num(q) + ' in g(x) too.'), tr(p * k + q, 'x_compose', 'That is g(f(x)). In f(g(x)), g goes inside.'), tr(m * q - k, 'n_intadd', 'Check the sign of ' + num(k) + '.')]
        : [tr(m + p, 'x_compose', 'f multiplies g(x) by ' + num(m) + '.'), tr(-m * p, 'n_intmul', 'Check the sign of ' + num(m) + ' × ' + par2(p) + '.')] };
  } },

{ id: 'x_inverse', s: 'alg', g: 10, title: 'Inverse functions: undo it', paper: true,
  tip: 'f⁻¹ undoes f. To find f⁻¹(17) for f(x) = 3x + 2, ask which x gives 17: 3x + 2 = 17, so 3x = 15 and x = 5. Undo the steps in reverse order.',
  gen(d, R) {
    const FI = 'f<sup>' + MINUS + '1</sup>', undo = b => b < 0 ? 'add ' + num(-b) + ' to both sides' : 'take ' + num(b) + ' from both sides';
    if (d === 0 || d === 2 && R.chance(.3)) {
      const a = R.i(2, d === 2 ? 9 : 6), b = nz(R, -12, 12), x0 = R.i(-5, 9), k = a * x0 + b, fd = 'f(x) = ' + poly([a, b]);
      return { text: B(fd) + '. What is ' + B(FI + '(' + num(k) + ')') + '?', ans: x0,
        how: [W(poly([a, b]) + ' = ' + num(k), FI + '(' + num(k) + ') is the x that f turns into ' + num(k))].concat(isol(a, 'x', k - b, undo(b), true)),
        steps: [{ text: 'Solve ' + B(poly([a, b]) + ' = ' + num(k)) + '. First: ' + B(term(a, 'x') + ' = ?'), ans: k - b }, { text: 'x = ?', ans: x0 }],
        traps: [tr(a * k + b, 'x_inverse', FI + '(' + num(k) + ') asks which input gives ' + num(k) + ', not f of ' + num(k) + '.'), k % a === 0 ? tr(k / a - b, 'x_twostep', 'Undo in reverse order: undo the ' + signed(b) + ' first, then the × ' + a + '.') : null, tr(-x0, 'n_intsub', 'Check the signs.')] };
    }
    if (d === 1) {
      const a = R.i(2, 6), b = nz(R, -12, 12);
      if (R.chance(.5)) {
        const k = nz(R, -8, 8), x0 = a * k - b, fd = 'f(x) = ' + fl('x ' + signed(b), a);
        return { text: B(fd) + '. What is ' + B(FI + '(' + num(k) + ')') + '?', ans: x0,
          how: [W(fl('x ' + signed(b), a) + ' = ' + num(k), 'which x gives ' + num(k) + '?'), W('x ' + signed(b) + ' = ' + num(a * k), 'multiply both sides by ' + a), W('x = ' + B(num(x0)), undo(b))],
          steps: [{ text: 'Multiply both sides by ' + a + ': ' + B('x ' + signed(b) + ' = ?'), ans: a * k }, { text: 'x = ?', ans: x0 }],
          traps: [tr((k + b) / a, 'x_inverse', 'That is f(' + num(k) + '). ' + FI + ' goes backwards: which x gives ' + num(k) + '?'), tr(a * k + b, 'n_intsub', 'To undo ' + signed(b) + ', do the opposite.'), tr((k - b) * a, 'x_twostep', 'Undo in reverse order: the ÷ ' + a + ' was done last, so undo it first.')] };
      }
      const fd = 'f(x) = ' + poly([a, b]), ans = F(-b, a);
      return { text: B(fd) + '. Write ' + B(FI + '(x) = mx + c') + '. What is ' + B('c') + '? (A fraction is fine.)', ans, type: 'frac',
        how: [W('x = ' + a + 'y ' + signed(b), 'write y = f(x), then swap x and y'), W(term(a, 'y') + ' = x ' + signed(-b), undo(b)), W('y = ' + fr(1, a) + 'x ' + (b > 0 ? MINUS + ' ' + fr(b, a) : '+ ' + fr(-b, a)), 'divide both sides by ' + a), 'c = ' + B(fr(-b, a))],
        steps: [{ text: 'Swap x and y and solve: ' + B(term(a, 'y') + ' = x + ?'), ans: -b }, { text: 'Divide by ' + a + ': c = ?', ans, type: 'frac' }],
        traps: [tr(F(-b, 1), 'x_inverse', 'Divide the ' + num(-b) + ' by ' + a + ' too.'), tr(F(b, a), 'x_inverse', 'Undoing ' + signed(b) + ' changes its sign.'), tr(F(b, 1), 'x_inverse', 'Solve for y after swapping: undo the ' + signed(b) + ', then divide by ' + a + '.')] };
    }
    if (R.chance(.5)) {
      const b = nz(R, -20, 20), x0 = nz(R, -4, 5), k = x0 * x0 * x0 + b;
      return { text: B('f(x) = ' + poly([1, 0, 0, b])) + '. What is ' + B(FI + '(' + num(k) + ')') + '?', ans: x0,
        how: [W(pw('x', 3) + ' ' + signed(b) + ' = ' + num(k), 'which x gives ' + num(k) + '?'), W(pw('x', 3) + ' = ' + num(k - b), undo(b)), W('x = ' + B(num(x0)), 'cube root: ' + par2(x0) + ' × ' + par2(x0) + ' × ' + par2(x0) + ' = ' + num(k - b))],
        steps: [{ text: B(pw('x', 3) + ' = ?'), ans: k - b }, { text: 'x = ?', ans: x0 }],
        traps: [tr(-x0, 'w_roots', 'The cube root keeps the sign: a negative cubed is negative.'), tr(k * k * k + b, 'x_inverse', 'That is f(' + num(k) + '). Go backwards instead.'), tr(Math.round(Math.cbrt(k + b)) === Math.cbrt(k + b) ? Math.cbrt(k + b) : null, 'n_intsub', 'To undo ' + signed(b) + ', do the opposite.')] };
    }
    const a = R.i(2, 5), b = nz(R, -9, 9), c = R.i(2, 6), x0 = nz(R, -8, 8), top = a * x0 + b; if (top % c) return null; const k = top / c;
    return { text: B('f(x) = ' + fl(poly([a, b]), c)) + '. What is ' + B(FI + '(' + num(k) + ')') + '?', ans: x0,
      how: [W(fl(poly([a, b]), c) + ' = ' + num(k), 'which x gives ' + num(k) + '?'), W(poly([a, b]) + ' = ' + num(c * k), 'multiply both sides by ' + c)].concat(isol(a, 'x', c * k - b, undo(b), true)),
      steps: [{ text: 'Multiply both sides by ' + c + ': ' + B(poly([a, b]) + ' = ?'), ans: c * k }, { text: B(term(a, 'x') + ' = ?'), ans: c * k - b }, { text: 'x = ?', ans: x0 }],
      traps: [tr((a * k + b) / c, 'x_inverse', 'That is f(' + num(k) + '). Go backwards instead.'), tr((c * k + b) / a, 'n_intsub', 'To undo ' + signed(b) + ', do the opposite.'), tr((k - b) * c / a, 'x_twostep', 'Undo in reverse order: the ÷ ' + c + ' was done last.')] };
  } },

{ id: 'x_complete', s: 'alg', g: 10, title: 'Completing the square', paper: true,
  tip: 'Half of b, squared, makes a perfect square: x² + 6x + 9 = (x + 3)², because half of 6 is 3 and 3² = 9. So x² + 6x + 5 = (x + 3)² − 4.',
  gen(d, R) {
    const h = nz(R, -8, 8), b = 2 * h, h2 = h * h, sqx = pw(bin(1, h), 2);
    if (d === 0) return { text: B(poly([1, b, 0]) + ' + ?') + ' is a perfect square. What is the missing number?', ans: h2,
      how: [W(num(b) + ' ÷ 2 = ' + num(h), 'take half of b'), W(sq(h) + ' = ' + h2, 'square it'), poly([1, b, h2]) + ' = ' + sqx + ', so the missing number is ' + B(h2) + '.'],
      steps: [{ text: 'Half of ' + num(b) + '?', ans: h }, { text: B(sq(h)) + ' = ?', ans: h2 }],
      traps: [tr(h, 'x_complete', 'Square the half: ' + sq(h) + '.'), tr(b * b, 'x_complete', 'Halve ' + num(b) + ' first, then square.'), tr(-h2, 'n_intmul', 'A number squared is never negative.'), tr(2 * Math.abs(b), 'x_complete', 'Half of b, then square it.')] };
    if (d === 1) {
      const c = nz(R, -15, 20), k = c - h2, askK = R.chance(.7), e = poly([1, b, c]);
      return { text: 'Write ' + B(e) + ' as ' + B('(x + h)² + k') + '. What is ' + B(askK ? 'k' : 'h') + '?', ans: askK ? k : h,
        how: [W(sqx + ' = ' + poly([1, b, h2]), 'half of ' + num(b) + ' is ' + num(h)), W(e + ' = ' + sqx + ' ' + signed(k), 'you need ' + num(c) + ', not ' + h2 + ': ' + num(c) + ' ' + MINUS + ' ' + h2 + ' = ' + num(k)), (askK ? 'k' : 'h') + ' = ' + B(num(askK ? k : h))],
        steps: [{ text: 'h = half of ' + num(b) + ' = ?', ans: h }, { text: B(sq(h)) + ' = ?', ans: h2 }, { text: 'k = ' + B(num(c) + ' ' + MINUS + ' ' + h2) + ' = ?', ans: k }],
        traps: askK ? [tr(c + h2, 'x_complete', 'You add ' + h2 + ' to make the square, so take ' + h2 + ' away to keep the value the same.'), tr(h2 - c, 'n_intsub', 'k = ' + num(c) + ' ' + MINUS + ' ' + h2 + ', in that order.'), tr(c, 'x_complete', 'Part of ' + num(c) + ' went into the square.')]
          : [tr(-h, 'x_complete', '(x + h)²: h has the same sign as ' + num(b) + '.'), tr(b, 'x_complete', 'h is half of ' + num(b) + '.')] };
    }
    if (R.chance(.5)) {
      const s = R.i(1, 9), c = h2 - s * s; if (c === 0) return null;
      const r1 = -h + s, r2 = -h - s, big = R.chance(.5), ans = big ? r1 : r2;
      return { text: 'Solve ' + B(poly([1, b, c]) + ' = 0') + ' by completing the square. What is the ' + (big ? 'larger' : 'smaller') + ' solution?', ans,
        how: [W(poly([1, b, 0]) + ' = ' + num(-c), c > 0 ? 'take ' + c + ' from both sides' : 'add ' + num(-c) + ' to both sides'), W(sqx + ' = ' + num(s * s), 'add ' + h2 + ' (half of ' + num(b) + ', squared) to both sides'), W('x ' + signed(h) + ' = ±' + s, 'square root of both sides'), 'x = ' + num(r1) + ' &nbsp;or&nbsp; x = ' + num(r2), 'The ' + (big ? 'larger' : 'smaller') + ' solution is ' + B(num(ans)) + '.'],
        steps: [{ text: B(sqx + ' = ?'), ans: s * s }, { text: 'x ' + signed(h) + ' = ± what?', ans: s }, { text: 'The ' + (big ? 'larger' : 'smaller') + ' solution?', ans }],
        traps: [tr(big ? r2 : r1, 'x_complete', 'That is the ' + (big ? 'smaller' : 'larger') + ' solution.'), tr(-ans, 'n_intsub', 'x ' + signed(h) + ' = ' + s + ' means x = ' + s + ' ' + signed(-h) + '.'), tr(big ? h + s : h - s, 'x_complete', 'Undo the ' + signed(h) + ' by doing the opposite.')] };
    }
    const a = R.pick([2, 3, -2, 4, 5]), c = nz(R, -15, 15), A = a, Bc = a * b, k = c - a * h2;
    return { text: 'Write ' + B(poly([A, Bc, c])) + ' as ' + B(a + '(x + h)² + k') + '. What is ' + B('k') + '?', ans: k,
      how: [W(num(a) + '(' + poly([1, b, 0]) + ') ' + signed(c), 'take ' + num(a) + ' out of the x-terms'), W(num(a) + sqx + ' ' + signed(-a * h2) + ' ' + signed(c), 'the square adds ' + num(a) + ' × ' + h2 + ' = ' + num(a * h2) + ', so take it away'), '= ' + num(a) + sqx + ' ' + signed(k), 'k = ' + B(num(k))],
      steps: [{ text: 'Half of ' + num(b) + ' = ?', ans: h }, { text: B(num(a) + ' × ' + sq(h)) + ' = ?', ans: a * h2 }, { text: 'k = ' + B(num(c) + ' ' + MINUS + ' ' + par2(a * h2)) + ' = ?', ans: k }],
      traps: [tr(c - h2, 'x_complete', 'The square is multiplied by ' + num(a) + ', so it adds ' + num(a) + ' × ' + h2 + '.'), tr(c + a * h2, 'x_complete', 'Take away what the square added, so the value stays the same.')] };
  } },

{ id: 'x_polyrem', s: 'alg', g: 11, title: 'The remainder theorem', paper: true,
  tip: 'The remainder of p(x) ÷ (x − a) is p(a): just plug in a. For (x + 2), plug in −2. If p(a) = 0, then (x − a) is a factor.',
  gen(d, R) {
    const ev = (cs, v) => cs.reduce((s, c) => s * v + c, 0);
    if (d < 2) {
      const cs = d === 0 ? [1, nz(R, -9, 9), nz(R, -12, 12)] : [1, nz(R, -6, 6), nz(R, -9, 9), nz(R, -12, 12)], a = d === 0 ? R.i(1, 4) : -R.i(1, 3), rem = ev(cs, a), deg = cs.length - 1;
      const parts = cs.map((c, i) => [c * Math.pow(a, deg - i), deg - i]), sub = cs.map((c, i) => { const e = deg - i; return (i ? (c < 0 ? ' ' + MINUS + ' ' : ' + ') : (c < 0 ? MINUS : '')) + (e === 0 ? num(Math.abs(c)) : (Math.abs(c) === 1 ? '' : num(Math.abs(c)) + ' × ') + (e === 1 ? par2(a) : pw(par2(a), e))); }).join('');
      return { text: 'What is the remainder when ' + B(poly(cs)) + ' is divided by ' + B(bin(1, -a)) + '?', ans: rem,
        how: [W('remainder = p(' + num(a) + ')', 'dividing by ' + bin(1, -a) + ' means plug in ' + num(a)), 'p(' + num(a) + ') = ' + sub, '= ' + parts.map((t, i) => i ? signed(t[0]) : num(t[0])).join(' '), '= ' + B(num(rem))],
        steps: [{ text: 'Which number do you plug in?', ans: a }, { text: 'p(' + num(a) + ') = ?', ans: rem }],
        traps: [tr(ev(cs, -a), 'x_polyrem', 'Dividing by ' + bin(1, -a) + ' means plug in ' + num(a) + ', the number that makes ' + bin(1, -a) + ' zero.'), tr(cs[deg], 'x_polyrem', 'Plug ' + num(a) + ' into every term, not just the last.'), d === 1 ? tr(rem - 2 * cs[0] * a * a * a, 'n_intmul', 'A negative number cubed is negative.') : null] };
    }
    if (R.chance(.5)) {
      const a = nz(R, -3, 3), k = nz(R, -9, 9), e = -a * a * a - k * a; if (e === 0) return null;
      return { text: 'For which k is ' + B(bin(1, -a)) + ' a factor of ' + B(pw('x', 3) + ' + kx ' + signed(e)) + '?', ans: k,
        how: [W('p(' + num(a) + ') = 0', bin(1, -a) + ' is a factor, so the remainder is 0'), pw(par2(a), 3) + ' + k × ' + par2(a) + ' ' + signed(e) + ' = 0', W(term(a, 'k') + ' ' + signed(a * a * a + e) + ' = 0', pw(par2(a), 3) + ' = ' + num(a * a * a))].concat(isol(a, 'k', -(a * a * a + e), (a * a * a + e) > 0 ? 'take ' + num(a * a * a + e) + ' from both sides' : 'add ' + num(-(a * a * a + e)) + ' to both sides', true)),
        steps: [{ text: B(pw(par2(a), 3)) + ' = ?', ans: a * a * a }, { text: B(term(a, 'k') + ' ' + signed(a * a * a + e) + ' = 0') + '. k = ?', ans: k }],
        traps: [tr((e - a * a * a) / a, 'x_polyrem', 'Plug in ' + num(a) + ' (the number that makes ' + bin(1, -a) + ' zero), then set it equal to 0.'), tr(-k, 'n_intsub', 'Check the signs when you move the number across.')] };
    }
    const n = R.i(5, 40), j = R.i(2, n - 1), m = nz(R, -9, 9), c = nz(R, -9, 9), sn = n % 2 ? -1 : 1, sj = j % 2 ? -1 : 1, rem = sn + m * sj + c;
    return { text: 'What is the remainder when ' + B(pw('x', n) + ' ' + signed(m) + pw('x', j) + ' ' + signed(c)) + ' is divided by ' + B('(x + 1)') + '?', ans: rem,
      how: [W('remainder = p(' + MINUS + '1)', 'x + 1 = 0 at x = ' + MINUS + '1'), W('p(' + MINUS + '1) = ' + pw('(' + MINUS + '1)', n) + ' ' + signed(m) + ' × ' + pw('(' + MINUS + '1)', j) + ' ' + signed(c), MINUS + '1 to an even power is 1, to an odd power is ' + MINUS + '1'), '= ' + num(sn) + ' ' + signed(m * sj) + ' ' + signed(c), '= ' + B(num(rem))],
      steps: [{ text: B(pw('(' + MINUS + '1)', n)) + ' = ?', ans: sn }, { text: B(pw('(' + MINUS + '1)', j)) + ' = ?', ans: sj }, { text: 'Remainder = ?', ans: rem }],
      traps: [tr(1 + m + c, 'x_polyrem', 'For (x + 1), plug in ' + MINUS + '1, not 1.'), tr(-sn + m * sj + c, 'n_intmul', MINUS + '1 to the power ' + n + ': is ' + n + ' even or odd?'), tr(sn - m * sj + c, 'n_intmul', MINUS + '1 to the power ' + j + ': is ' + j + ' even or odd?')] };
  } },

{ id: 'x_complex', s: 'alg', g: 11, title: 'Complex numbers: i and its powers', paper: true,
  tip: 'i² = −1, and powers of i repeat every 4: i, −1, −i, 1. For i³⁰, 30 ÷ 4 leaves 2, so i³⁰ = i² = −1. Multiply (a + bi)(c + di) like brackets, then use i² = −1.',
  gen(d, R) {
    const ti = (v, t) => (v < 0 ? MINUS + ' ' : '+ ') + (Math.abs(v) === 1 ? '' : num(Math.abs(v))) + (t || 'i');
    const cx = (a, b) => '(' + num(a) + ' ' + (b < 0 ? MINUS : '+') + ' ' + (Math.abs(b) === 1 ? '' : num(Math.abs(b))) + 'i)', I2 = pw('i', 2);
    if (d === 0) {
      const n = R.i(5, 99), r = n % 4, q = (n - r) / 4, val = [1, 0, -1, 0][r], odd = r % 2 === 1, k = r === 1 ? 1 : -1;
      const cyc = ['1', 'i', MINUS + '1', MINUS + 'i'][r];
      return { text: odd ? B(pw('i', n)) + ' is either i or ' + MINUS + 'i. Write it as k·i. What is k?' : 'What is ' + B(pw('i', n)) + '?', ans: odd ? k : val,
        how: [W(n + ' ÷ 4 = ' + q + ' r ' + r, 'powers of i repeat every 4'), W(pw('i', n) + ' = ' + pw('i', r) + ' = ' + cyc, 'only the remainder matters: ' + pw('i', 0) + ' = 1, ' + pw('i', 1) + ' = i, ' + I2 + ' = ' + MINUS + '1, ' + pw('i', 3) + ' = ' + MINUS + 'i'), odd ? 'k = ' + B(num(k)) : 'So it is ' + B(num(val)) + '.'],
        steps: [{ text: 'Remainder of ' + B(n + ' ÷ 4') + '?', ans: r }, odd ? { text: B(pw('i', r)) + ' = k·i. k = ?', ans: k } : { text: B(pw('i', r)) + ' = ?', ans: val }],
        traps: [tr(odd ? -k : -val, 'x_complex', 'Check the remainder of ' + n + ' ÷ 4, then use the cycle i, ' + MINUS + '1, ' + MINUS + 'i, 1.'), tr(odd ? null : n % 2 ? null : (n / 2) % 2 ? 1 : -1, 'x_complex', 'Use the remainder after dividing by 4, not by 2.')] };
    }
    if (d === 1) {
      const a = nz(R, -6, 6), b = nz(R, -6, 6), c = nz(R, -6, 6), e = nz(R, -6, 6), re = a * c - b * e, im = a * e + b * c, askRe = R.chance(.5);
      return { text: 'Multiply ' + B(cx(a, b) + cx(c, e)) + ' = p + qi. What is ' + B(askRe ? 'p' : 'q') + '?', ans: askRe ? re : im,
        how: [W(num(a * c) + ' ' + ti(a * e) + ' ' + ti(b * c) + ' ' + ti(b * e, I2), 'multiply out: first, outer, inner, last'), W('= ' + num(a * c) + ' ' + ti(a * e + b * c) + ' ' + signed(-b * e), I2 + ' = ' + MINUS + '1, so ' + signed(b * e).replace('+ ', '') + I2 + ' becomes ' + num(-b * e)), '= ' + num(re) + ' ' + ti(im), (askRe ? 'p' : 'q') + ' = ' + B(num(askRe ? re : im))],
        steps: [{ text: B(num(b) + 'i × ' + par2(e) + 'i') + ' = ? (a plain number, using ' + I2 + ' = ' + MINUS + '1)', ans: -b * e }, askRe ? { text: 'p = ' + B(num(a * c) + ' ' + signed(-b * e)) + ' = ?', ans: re } : { text: 'q = ' + B(num(a * e) + ' + ' + par2(b * c)) + ' = ?', ans: im }],
        traps: askRe ? [tr(a * c + b * e, 'x_complex', I2 + ' = ' + MINUS + '1, so the ' + I2 + ' term changes sign.'), tr(a * c, 'x_complex', 'The two i terms multiply to a plain number too.')] : [tr(a * e - b * c, 'n_intadd', 'Add the two i terms: ' + num(a * e) + 'i and ' + num(b * c) + 'i.'), tr(b * e, 'x_complex', 'q comes from the outer and inner terms.')] };
    }
    const a = nz(R, -9, 9), b = nz(R, -9, 9);
    if (R.chance(.5)) {
      const ans = a * a + b * b;
      return { text: 'Multiply ' + B(cx(a, b) + cx(a, -b)) + '. The answer is a plain number. What is it?', ans,
        how: [W(pw(par2(a), 2) + ' ' + MINUS + ' ' + pw('(' + num(b) + 'i)', 2), '(p + q)(p ' + MINUS + ' q) = ' + pw('p', 2) + ' ' + MINUS + ' ' + pw('q', 2)), W('= ' + num(a * a) + ' ' + MINUS + ' (' + num(-b * b) + ')', pw('(' + num(b) + 'i)', 2) + ' = ' + (b * b) + I2 + ' = ' + num(-b * b)), '= ' + num(a * a) + ' + ' + (b * b) + ' = ' + B(num(ans))],
        steps: [{ text: B(pw(par2(a), 2)) + ' = ?', ans: a * a }, { text: B(pw('(' + num(b) + 'i)', 2)) + ' = ?', ans: -b * b }, { text: B(num(a * a) + ' ' + MINUS + ' (' + num(-b * b) + ')') + ' = ?', ans }],
        traps: [tr(a * a - b * b, 'x_complex', pw('(' + num(b) + 'i)', 2) + ' = ' + num(-b * b) + ', and taking away a negative adds.'), tr(-ans, 'n_intmul', 'Check the signs: ' + pw(par2(a), 2) + ' is positive.')] };
    }
    const re = a * a - b * b, im = 2 * a * b, askRe = R.chance(.5);
    return { text: 'Square it: ' + B(pw(cx(a, b), 2) + ' = p + qi') + '. What is ' + B(askRe ? 'p' : 'q') + '?', ans: askRe ? re : im,
      how: [W(num(a * a) + ' ' + ti(2 * a * b) + ' ' + ti(b * b, I2), '(p + q)² = ' + pw('p', 2) + ' + 2pq + ' + pw('q', 2)), W('= ' + num(re) + ' ' + ti(im), I2 + ' = ' + MINUS + '1, so ' + (b * b) + I2 + ' = ' + num(-b * b)), (askRe ? 'p' : 'q') + ' = ' + B(num(askRe ? re : im))],
      steps: [askRe ? { text: B(pw(par2(a), 2) + ' ' + MINUS + ' ' + pw(par2(b), 2)) + ' = ?', ans: re } : { text: B('2 × ' + par2(a) + ' × ' + par2(b)) + ' = ?', ans: im }],
      traps: askRe ? [tr(a * a + b * b, 'x_complex', I2 + ' = ' + MINUS + '1, so the ' + (b * b) + I2 + ' term is negative.'), tr(a * a, 'x_complex', 'Don\'t drop the ' + pw('(' + num(b) + 'i)', 2) + ' term.')] : [tr(a * b, 'x_foil', 'The middle term is doubled: 2pq.'), tr(-im, 'n_intmul', 'Check the sign of 2 × ' + par2(a) + ' × ' + par2(b) + '.')] };
  } },

{ id: 'x_matrix', s: 'alg', g: 11, title: '2 × 2 matrices: the determinant', paper: true,
  tip: 'For a 2 × 2 matrix with rows (a, b) and (c, d), the determinant is ad − bc: multiply down the main diagonal, then take away the other diagonal.',
  gen(d, R) {
    const mat = (a, b, c, e) => '<table class="io"><tr><td>' + a + '</td><td>' + b + '</td></tr><tr><td>' + c + '</td><td>' + e + '</td></tr></table>', M = ' ' + MINUS + ' ';
    if (d < 2) {
      let a, b, c, e;
      if (d === 0) { a = R.i(1, 9); b = R.i(1, 9); c = R.i(1, 9); e = R.i(1, 9); if (a * e <= b * c) return null; }
      else { a = nz(R, -9, 9); b = nz(R, -9, 9); c = nz(R, -9, 9); e = nz(R, -9, 9); if (a > 0 && b > 0 && c > 0 && e > 0) return null; }
      const p = a * e, q = b * c, ans = p - q;
      return { text: 'What is the determinant of the matrix with rows ' + B('(' + num(a) + ', ' + num(b) + ')') + ' and ' + B('(' + num(c) + ', ' + num(e) + ')') + '?', vis: mat(num(a), num(b), num(c), num(e)), ans,
        how: [W('det = ' + num(a) + ' × ' + par2(e) + M + par2(b) + ' × ' + par2(c), 'ad ' + MINUS + ' bc'), '= ' + num(p) + M + par2(q), '= ' + B(num(ans))],
        steps: [{ text: 'Main diagonal: ' + B(num(a) + ' × ' + par2(e)) + ' = ?', ans: p }, { text: 'Other diagonal: ' + B(num(b) + ' × ' + par2(c)) + ' = ?', ans: q }, { text: B(num(p) + M + par2(q)) + ' = ?', ans }],
        traps: [tr(p + q, 'x_matrix', 'It is ad minus bc, not plus.'), tr(q - p, 'x_matrix', 'Start with the main diagonal (top left times bottom right).'), tr(a * c - b * e, 'x_matrix', 'Multiply along the diagonals, not down the columns.')] };
    }
    const x = nz(R, -9, 9), b = nz(R, -9, 9), c = nz(R, -9, 9), e = nz(R, -6, 6), zero = R.chance(.35), k = zero ? 0 : x * e - b * c;
    if (zero && (b * c) % e) return null;
    const X = zero ? b * c / e : x, bc = b * c, undo = bc > 0 ? 'add ' + num(bc) + ' to both sides' : 'take ' + num(-bc) + ' from both sides';
    if (zero && X === 0) return null;
    return { text: (zero ? 'The matrix with rows ' + B('(x, ' + num(b) + ')') + ' and ' + B('(' + num(c) + ', ' + num(e) + ')') + ' has no inverse (determinant 0).' : 'The matrix with rows ' + B('(x, ' + num(b) + ')') + ' and ' + B('(' + num(c) + ', ' + num(e) + ')') + ' has determinant ' + B(num(k)) + '.') + ' What is x?', vis: mat('x', num(b), num(c), num(e)), ans: X,
      how: [W('x × ' + par2(e) + M + par2(b) + ' × ' + par2(c) + ' = ' + num(k), 'ad ' + MINUS + ' bc'), term(e, 'x') + ' ' + signed(-bc) + ' = ' + num(k)].concat(isol(e, 'x', k + bc, undo, true)),
      steps: [{ text: B(num(b) + ' × ' + par2(c)) + ' = ?', ans: bc }, { text: B(term(e, 'x') + ' = ?'), ans: k + bc }, { text: 'x = ?', ans: X }],
      traps: [(k - bc) % e === 0 ? tr((k - bc) / e, 'x_matrix', 'The determinant is ad ' + MINUS + ' bc, so move the bc term with the opposite sign.') : null, tr(-X, 'n_intsub', 'Check the signs.'), tr(k + bc, 'x_onestep', 'One more step: divide by ' + num(e) + '.')] };
  } },

{ id: 'x_rational', s: 'alg', g: 11, title: 'Rational expressions: factor, then cancel', paper: true,
  tip: 'Factor the top and bottom first, then cancel whole brackets, never single terms. (x² − 9) ÷ (x − 3) = (x − 3)(x + 3) ÷ (x − 3) = x + 3.',
  gen(d, R) {
    const p = nz(R, -9, 9), q = nz(R, -9, 9); if (p + q === 0 && d === 2) return null;
    const top = poly([1, p + q, p * q]), fac = bin(1, p) + bin(1, q), bot = bin(1, p).slice(1, -1);
    if (d < 2) {
      const e = fl(top, bot), cancel = W(fl(fac, bin(1, p)) + ' = x ' + signed(q), 'cancel the ' + bin(1, p) + ' on top and bottom');
      if (d === 0) return { text: B(e + ' = x + ?') + '. What is the missing number?', ans: q,
        how: [W(top + ' = ' + fac, 'factor the top: multiply to ' + num(p * q) + ', add to ' + num(p + q)), cancel, 'The missing number is ' + B(num(q)) + '.'],
        steps: [{ text: 'Factor: ' + B(top + ' = ' + bin(1, p) + '(x + ?)'), ans: q }],
        traps: [tr(-q, 'x_factor', 'Check the signs: the two numbers multiply to ' + num(p * q) + ' and add to ' + num(p + q) + '.'), tr(p + q, 'x_rational', 'Cancel whole brackets only, never single terms.'), tr(p * q, 'x_rational', 'Factor the top first, then cancel the matching bracket.')] };
      const X = R.pick([98, 99, 101, 102, 103, 997, 1001, 50, 75]), ans = X + q;
      return { text: 'What is ' + B(e) + ' when ' + B('x = ' + num(X)) + '? Simplify first.', ans,
        how: [W(top + ' = ' + fac, 'factor the top'), cancel, W('= ' + num(X) + ' ' + signed(q) + ' = ' + B(num(ans)), 'put in x = ' + num(X))],
        steps: [{ text: 'Factor: ' + B(top + ' = ' + bin(1, p) + '(x + ?)'), ans: q }, { text: 'x ' + signed(q) + ' at x = ' + num(X) + '?', ans }],
        traps: [tr(X - q, 'x_factor', 'Check the signs in your factors.'), tr(X + p, 'x_rational', 'Cancel the bracket that is on the bottom; the other one stays.')] };
    }
    const r = nz(R, -9, 9); if (r === q || r === p || r + p === 0) return null;
    const X = R.i(1, 9); if (X + r === 0 || X + p === 0 || X + q === 0) return null;
    const bt = poly([1, p + r, p * r]), ans = F(X + q, X + r);
    return { text: 'What is ' + B(fl(top, bt)) + ' when ' + B('x = ' + X) + '? Simplify first, and give a fraction in lowest terms.', ans, type: 'frac', low: true,
      how: [W(fl(fac, bin(1, p) + bin(1, r)), 'factor the top and the bottom'), W('= ' + fl('x ' + signed(q), 'x ' + signed(r)), 'cancel ' + bin(1, p))].concat(gcd(X + q, X + r) === 1 && X + r > 0 ? [W('= ' + B(fr(X + q, X + r)), 'put in x = ' + X)] : [W('= ' + fl(num(X + q), num(X + r)), 'put in x = ' + X), W('= ' + B(fr(X + q, X + r)), 'lowest terms')]),
      steps: [{ text: 'Factor the bottom: ' + B(bt + ' = ' + bin(1, p) + '(x + ?)'), ans: r }, { text: 'The answer in lowest terms?', ans, type: 'frac', low: true }],
      traps: [tr(F(X + r, X + q), 'x_rational', 'The top stays on top: (x ' + signed(q) + ') over (x ' + signed(r) + ').'), q !== 0 && r !== 0 ? tr(F(q, r), 'x_rational', 'You can only cancel whole brackets, not the x\'s.') : null, X !== r ? tr(F(X - q, X - r), 'x_factor', 'Check the signs in your factors.') : null] };
  } },

/* ======================= Data & Chance ======================= */
{ id: 'd_bar', s: 'data', g: 3, title: 'Read bar graphs and picture graphs',
  tip: 'Read the top of each bar against the numbers on the side. "How many more" means take away: 9 dogs and 4 cats is 9 − 4 = 5 more dogs.',
  gen(d, R) {
    const sets = [[['dogs', 'cats', 'fish', 'birds'], l => l, 'pets in our class'], [['apples', 'pears', 'plums', 'lemons'], l => l, 'fruits picked'],
      [['red', 'blue', 'green', 'pink'], l => 'votes for ' + l, 'votes for a favorite color'], [['soccer', 'tennis', 'swim', 'dance'], l => 'kids in ' + l, 'kids in each club'],
      [['Mon', 'Tue', 'Wed', 'Thu'], l => 'books on ' + l, 'books read each day']];
    const [L, ph, what] = R.pick(sets), M = ' ' + MINUS + ' ';
    if (d < 2) {
      const step = d === 0 ? 1 : R.pick([2, 5]), max = d === 0 ? 10 : step * 10, vals = L.map(() => step * R.i(1, max / step));
      const i = R.i(0, 3), j = R.i(0, 3); if (i === j || vals[i] === vals[j]) return null;
      const big = vals[i] > vals[j] ? i : j, sm = big === i ? j : i, vis = barSVG(L, vals, { step });
      const kind = d === 0 ? R.pick(['more', 'fewer']) : R.pick(['more', 'fewer', 'all']);
      if (kind === 'all') { const ans = vals[i] + vals[j];
        return { text: 'The graph shows ' + what + '. How many ' + B(ph(L[i])) + ' and ' + B(ph(L[j])) + ' are there altogether?', vis, ans,
          how: [ph(L[i]) + ': ' + vals[i] + '. ' + ph(L[j]) + ': ' + vals[j] + '. (Read the top of each bar against the numbers on the side.)', vals[i] + ' + ' + vals[j] + ' = ' + B(ans) + '.'],
          steps: [{ text: 'How many ' + ph(L[i]) + '?', ans: vals[i] }, { text: 'How many ' + ph(L[j]) + '?', ans: vals[j] }, { text: B(vals[i] + ' + ' + vals[j]) + ' = ?', ans }],
          traps: [tr(Math.abs(vals[i] - vals[j]), 'd_bar', 'Altogether means add them.'), tr(ans + step, 'd_bar', 'Read each bar carefully: the lines go up by ' + step + '.'), tr(ans - step, 'd_bar', 'Read each bar carefully: the lines go up by ' + step + '.')] }; }
      const ans = vals[big] - vals[sm], q = kind === 'more' ? 'How many more ' + B(ph(L[big])) + ' than ' + B(ph(L[sm])) + '?' : 'How many fewer ' + B(ph(L[sm])) + ' than ' + B(ph(L[big])) + '?';
      return { text: 'The graph shows ' + what + '. ' + q, vis, ans,
        how: [ph(L[big]) + ': ' + vals[big] + '. ' + ph(L[sm]) + ': ' + vals[sm] + '.', 'How many ' + kind + ' means find the difference: ' + vals[big] + M + vals[sm] + ' = ' + B(ans) + '.'],
        steps: [{ text: 'How many ' + ph(L[big]) + '?', ans: vals[big] }, { text: 'How many ' + ph(L[sm]) + '?', ans: vals[sm] }, { text: B(vals[big] + M + vals[sm]) + ' = ?', ans }],
        traps: [tr(vals[big] + vals[sm], 'd_bar', 'How many ' + kind + ' means take away, not add.'), tr(vals[big], 'd_bar', 'Compare the two bars: take the smaller one away.'), tr(ans + step, 'd_bar', 'Check where each bar ends: the lines go up by ' + step + '.')] };
    }
    const each = R.pick([2, 5, 10]), sym = R.pick(['⭐', '🍎', '⚽', '📚']), cnt = L.map(() => R.i(1, 7)), vals = cnt.map(c => c * each);
    const vis = table(L.map((l, k) => [l, sym.repeat(cnt[k])]).concat([['key', sym + ' = ' + each]]));
    const [i, j, k] = R.shuffle([0, 1, 2, 3]); const ans = vals[i] + vals[j] - vals[k]; if (ans <= 0) return null;
    return { text: 'The graph shows ' + what + '. Each ' + sym + ' stands for ' + B(each) + '. Add ' + B(ph(L[i])) + ' and ' + B(ph(L[j])) + '. How many more is that than ' + B(ph(L[k])) + '?', vis, ans,
      how: [L[i] + ': ' + cnt[i] + ' × ' + each + ' = ' + vals[i] + '. ' + L[j] + ': ' + cnt[j] + ' × ' + each + ' = ' + vals[j] + '. ' + L[k] + ': ' + cnt[k] + ' × ' + each + ' = ' + vals[k] + '.',
            'Together: ' + vals[i] + ' + ' + vals[j] + ' = ' + (vals[i] + vals[j]) + '.', (vals[i] + vals[j]) + M + vals[k] + ' = ' + B(ans) + '.'],
      steps: [{ text: 'How many ' + ph(L[i]) + ' and ' + ph(L[j]) + ' together?', ans: vals[i] + vals[j] }, { text: 'How many ' + ph(L[k]) + '?', ans: vals[k] }, { text: B((vals[i] + vals[j]) + M + vals[k]) + ' = ?', ans }],
      traps: [tr(cnt[i] + cnt[j] - cnt[k], 'd_bar', 'Each ' + sym + ' is worth ' + each + ', not 1.'), tr(vals[i] + vals[j] + vals[k], 'd_bar', 'How many more means take away.'), tr(vals[i] + vals[j], 'd_bar', 'Now take away the ' + ph(L[k]) + '.')] };
  } },

{ id: 'd_mean', s: 'data', g: 6, title: 'Mean: balance around a guess',
  tip: 'Guess a middle number, find how far each number is above or below it, and share out the total. 82, 87, 90, 85: guess 85; the gaps −3, +2, +5, 0 add to 4, and 4 ÷ 4 = 1, so the mean is 86.',
  gen(d, R) {
    const n = d === 0 ? R.i(3, 5) : d === 1 ? R.i(4, 5) : R.i(5, 7), m = d === 0 ? R.i(5, 20) : d === 1 ? R.i(40, 95) : R.pick([R.i(60, 99), R.i(150, 320)]), sp = d === 0 ? 4 : d === 1 ? 9 : 15;
    const dev = []; for (let k = 0; k < n - 1; k++) dev.push(R.i(-sp, sp)); const last = -sum(dev); if (Math.abs(last) > sp + 3) return null; dev.push(last);
    const vals = R.shuffle(dev.map(v => m + v)); if (vals.some(v => v <= 0) || new Set(vals).size < n - 1) return null;
    const G = d === 0 ? m + R.pick([0, 1, -1, 2]) : Math.round(m / 10) * 10 === m ? m + R.pick([5, -5]) : Math.round(m / 10) * 10, diffs = vals.map(v => v - G), tot = sum(diffs), share = tot / n, S = sum(vals);
    const ds = diffs.map(v => v > 0 ? '+' + v : v < 0 ? MINUS + (-v) : '0').join(', ');
    const sorted = vals.slice().sort((a, b) => a - b), med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    return { text: 'What is the mean of ' + B(vals.join(', ')) + '?', ans: m,
      how: ['Guess ' + G + '. How far is each number from ' + G + '? ' + ds + '.', 'The gaps add to ' + num(tot) + '. Share that out: ' + num(tot) + ' ÷ ' + n + ' = ' + num(share) + '.', 'Mean = ' + G + ' ' + signed(share) + ' = ' + B(m) + '.'],
      steps: [{ text: 'Add up the gaps from ' + G + ' (' + ds + '):', ans: tot }, { text: B(num(tot) + ' ÷ ' + n) + ' = ?', ans: share }, { text: B(G + ' ' + signed(share)) + ' = ?', ans: m }],
      traps: [tr(S, 'd_mean', 'That is the total. Share it out over the ' + n + ' numbers.'), tr(G + tot, 'd_mean', 'Share the gaps out over all ' + n + ' numbers before adding.'), tr(S % (n - 1) === 0 ? S / (n - 1) : null, 'd_mean', 'Divide by how many numbers there are: ' + n + '.'), tr(med, 'd_median', 'That is the middle number (median). The mean evens all the numbers out.')] };
  } },

{ id: 'd_median', s: 'data', g: 6, title: 'Median, mode and range', paper: true,
  tip: 'Put the numbers in order first. Median: the middle one (or halfway between the two middle ones). Mode: the most common. Range: biggest − smallest.',
  gen(d, R) {
    const n = d === 0 ? R.pick([5, 7]) : d === 1 ? R.pick([6, 6, 7]) : R.pick([8, 9]), hi = d === 2 ? 99 : 30, lo = d === 2 ? 10 : 1;
    const kind = d === 0 ? R.pick(['med', 'med', 'range']) : R.pick(['med', 'mode', 'range']);
    let vals = []; for (let k = 0; k < n; k++) vals.push(R.i(lo, hi));
    if (kind === 'mode') { const v = vals[0]; vals[1] = v; vals[2] = R.chance(.5) ? v : vals[2]; }
    const sorted = vals.slice().sort((a, b) => a - b), cnt = {}; sorted.forEach(v => cnt[v] = (cnt[v] || 0) + 1);
    const top = Math.max(...Object.values(cnt)), modes = Object.keys(cnt).filter(k => cnt[k] === top).map(Number);
    if (kind === 'mode' && (modes.length !== 1 || top < 2)) return null;
    if (kind !== 'mode' && top > 2) return null;
    vals = R.shuffle(vals); if (vals.join() === sorted.join()) return null;
    const list = B(vals.join(', ')), srt = W(sorted.join(', '), 'put them in order');
    if (kind === 'range') { const ans = sorted[n - 1] - sorted[0];
      return { text: 'What is the range of ' + list + '?', ans, how: [srt, W('range = ' + sorted[n - 1] + ' ' + MINUS + ' ' + sorted[0], 'biggest ' + MINUS + ' smallest'), 'range = ' + B(ans)],
        steps: [{ text: 'The biggest number?', ans: sorted[n - 1] }, { text: 'The smallest number?', ans: sorted[0] }, { text: 'Range = ?', ans }],
        traps: [tr(sorted[n - 1], 'd_median', 'The range is the biggest take away the smallest.'), tr(Math.abs(vals[n - 1] - vals[0]), 'd_median', 'Use the biggest and smallest numbers, not the last and first in the list.'), tr(sorted[n - 1] + sorted[0], 'd_median', 'Range means take away, not add.')] }; }
    if (kind === 'mode') { const ans = modes[0];
      return { text: 'What is the mode of ' + list + '?', ans, how: [srt, W('mode = ' + B(ans), ans + ' appears ' + top + ' times, more than any other')],
        steps: [{ text: 'Which number appears most often?', ans }],
        traps: [tr(n % 2 ? sorted[(n - 1) / 2] : null, 'd_median', 'That is the median. The mode is the most common number.'), tr(top, 'd_median', 'That is how many times it appears. The mode is the number itself.')] }; }
    const odd = n % 2 === 1, ans = odd ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2, mid = odd ? [sorted[(n - 1) / 2]] : [sorted[n / 2 - 1], sorted[n / 2]];
    const mean = sum(vals) / n;
    return { text: 'What is the median of ' + list + '?', ans,
      how: [srt].concat(odd ? [W('median = ' + B(num(ans)), n + ' numbers, so the middle one is the ' + ord((n + 1) / 2))] : [W('middle two: ' + mid[0] + ' and ' + mid[1], n + ' numbers, so the ' + ord(n / 2) + ' and ' + ord(n / 2 + 1)), W('median = (' + mid[0] + ' + ' + mid[1] + ') ÷ 2 = ' + B(num(ans)), 'halfway between them')]),
      steps: odd ? [{ text: 'Put them in order. What is the smallest?', ans: sorted[0] }, { text: 'The middle number?', ans }] : [{ text: 'In order, the ' + ord(n / 2) + ' number?', ans: mid[0] }, { text: 'The ' + ord(n / 2 + 1) + ' number?', ans: mid[1] }, { text: 'Halfway between them?', ans }],
      traps: [tr(odd ? vals[(n - 1) / 2] : (vals[n / 2 - 1] + vals[n / 2]) / 2, 'd_median', 'Put the numbers in order first.'), tr(isInt(mean * 100) ? mean : null, 'd_mean', 'That is the mean. The median is the middle number.'), odd ? null : tr(mid[0], 'd_median', 'With an even count there are two middle numbers: go halfway between them.')] };
  } },

{ id: 'd_meanmiss', s: 'data', g: 7, title: 'Find the missing number for a mean', paper: true,
  tip: 'Total needed = mean × how many. Missing number = total needed − total so far. Mean 8 for 4 numbers needs 32; if three add to 22, the last is 10.',
  gen(d, R) {
    const M = ' ' + MINUS + ' ';
    if (d < 2) {
      const n = d === 0 ? 4 : R.i(4, 5), m = d === 0 ? R.i(5, 15) : R.i(72, 92), lo = d === 0 ? 1 : 60, hi = d === 0 ? 25 : 100;
      const given = []; for (let k = 0; k < n - 1; k++) given.push(R.i(Math.max(lo, m - (d ? 15 : 6)), Math.min(hi, m + (d ? 12 : 6))));
      const T = n * m, S = sum(given), ans = T - S; if (ans < lo || ans > hi || ans === m || given.includes(ans) && R.chance(.5)) return null;
      const text = d === 0 ? 'The mean of ' + n + ' numbers is ' + B(m) + '. Three of them are ' + B(given.join(', ')) + '. What is the fourth?'
        : R.pick(NAMES) + '\'s test scores are ' + B(given.join(', ')) + '. What score on the next test makes the mean of all ' + n + ' tests exactly ' + B(m) + '?';
      return { text, ans,
        how: [W('total needed = ' + n + ' × ' + m + ' = ' + T, 'mean × how many'), 'total so far = ' + given.join(' + ') + ' = ' + S, 'missing = ' + T + M + S + ' = ' + B(ans)],
        steps: [{ text: 'Total needed: ' + B(n + ' × ' + m) + ' = ?', ans: T }, { text: 'Total so far?', ans: S }, { text: B(T + M + S) + ' = ?', ans }],
        traps: [tr(m, 'd_meanmiss', 'The last number has to make up for the others, so it is not just the mean.'), tr(T, 'd_meanmiss', 'That is the total needed. Take away what you already have.'), tr(isInt(S / (n - 1)) ? S / (n - 1) : null, 'd_mean', 'That is the mean of the numbers you have. Use the total needed instead.')] };
    }
    const n = R.i(4, 7), m = R.i(8, 30), add = R.chance(.5);
    if (add) { const m2 = m + nz(R, -4, 4), T1 = n * m, T2 = (n + 1) * m2, ans = T2 - T1; if (ans <= 0) return null;
      return { text: 'The mean of ' + n + ' numbers is ' + B(m) + '. One more number is added and the mean becomes ' + B(m2) + '. What number was added?', ans,
        how: [W('old total = ' + n + ' × ' + m + ' = ' + T1, 'mean × how many'), W('new total = ' + (n + 1) + ' × ' + m2 + ' = ' + T2, 'now there are ' + (n + 1)), 'added = ' + T2 + M + T1 + ' = ' + B(ans)],
        steps: [{ text: 'Old total?', ans: T1 }, { text: 'New total?', ans: T2 }, { text: 'The number added?', ans }],
        traps: [tr(m2, 'd_meanmiss', 'Compare the totals, not the means.'), tr(n * m2 - T1, 'd_meanmiss', 'The new total is for ' + (n + 1) + ' numbers.'), tr(Math.abs(m2 - m), 'd_meanmiss', 'Compare the totals, not the means.')] }; }
    const m2 = m + nz(R, -4, 4), T1 = n * m, T2 = (n - 1) * m2, ans = T1 - T2; if (ans <= 0) return null;
    return { text: 'The mean of ' + n + ' numbers is ' + B(m) + '. One number is taken away and the mean of the other ' + (n - 1) + ' is ' + B(m2) + '. What number was taken away?', ans,
      how: [W('total of ' + n + ' = ' + n + ' × ' + m + ' = ' + T1, 'mean × how many'), 'total of ' + (n - 1) + ' = ' + (n - 1) + ' × ' + m2 + ' = ' + T2, 'taken away = ' + T1 + M + T2 + ' = ' + B(ans)],
      steps: [{ text: 'Total of all ' + n + '?', ans: T1 }, { text: 'Total of the other ' + (n - 1) + '?', ans: T2 }, { text: 'The number taken away?', ans }],
      traps: [tr(Math.abs(m - m2), 'd_meanmiss', 'Compare the totals, not the means.'), tr(T1 - n * m2, 'd_meanmiss', 'Only ' + (n - 1) + ' numbers are left.'), tr(m, 'd_meanmiss', 'Work with totals: mean × how many.')] };
  } },

{ id: 'd_prob', s: 'data', g: 7, title: 'Probability as a fraction', pre: ['f_simplify'], paper: true,
  tip: 'Probability = ways it can happen ÷ all the ways (when every way is equally likely). 3 red and 5 blue marbles: P(red) = 3/8.',
  gen(d, R) {
    const low = (a, b) => gcd(a, b) > 1 ? [W('= ' + B(fr(a, b)), 'lowest terms: divide top and bottom by ' + gcd(a, b))] : [];
    const fin = (a, b, lines) => { const L = lines.concat(low(a, b)); if (gcd(a, b) === 1) L[L.length - 1] = L[L.length - 1].replace(fl(num(a), num(b)), B(frac(a, b))); return L; };
    if (d === 0 || d === 2 && R.chance(.3)) {
      const cols = ['red', 'blue', 'green', 'yellow'], k = d === 0 ? 3 : 4, cnt = cols.slice(0, k).map(() => R.i(1, 9)), T = sum(cnt), i = R.i(0, k - 1);
      const two = d === 2, j = two ? (i + 1) % k : -1, fav = two ? cnt[i] + cnt[j] : cnt[i], name = two ? cols[i] + ' or ' + cols[j] : cols[i];
      const desc = cols.slice(0, k).map((c, t) => cnt[t] + ' ' + c).join(', ');
      return { text: 'A bag has ' + B(desc) + ' marbles. You pick one without looking. What is the probability it is ' + B(name) + '? Give a fraction in lowest terms.', ans: F(fav, T), type: 'frac', low: true,
        how: fin(fav, T, [W('all the ways: ' + cnt.join(' + ') + ' = ' + T, 'every marble is one way'), W('P(' + name + ') = ' + fl(num(fav), num(T)), (two ? cnt[i] + ' + ' + cnt[j] + ' ' : fav + ' ') + name + ' ' + plural(fav, 'marble'))]),
        steps: [{ text: 'How many marbles in all?', ans: T }, { text: 'How many are ' + name + '?', ans: fav }, { text: 'The probability in lowest terms?', ans: F(fav, T), type: 'frac', low: true }],
        traps: [T - fav ? tr(F(fav, T - fav), 'd_prob', 'The bottom is all the marbles, including the ' + name + ' ones.') : null, tr(F(T - fav, T), 'd_complement', 'That is the chance of NOT ' + name + '.')] };
    }
    if (d === 1) {
      const N = R.pick([6, 10, 12, 15, 20, 24, 30]), ev = R.pick(['even', 'mult', 'prime', 'more']), k = R.pick([3, 4, 5]), t = R.i(2, N - 2);
      const test = { even: v => v % 2 === 0, mult: v => v % k === 0, prime: v => C.isPrime(v), more: v => v > t }[ev], fav = Array.from({ length: N }, (_, q) => q + 1).filter(test);
      const name = { even: 'an even number', mult: 'a multiple of ' + k, prime: 'a prime number', more: 'more than ' + t }[ev], obj = N === 6 ? 'You roll a fair six-sided die.' : 'Cards numbered 1 to ' + N + ' are shuffled and you pick one.';
      const f = fav.length, list = f <= 12 ? fav.join(', ') : fav.slice(0, 3).join(', ') + ', …, ' + fav[f - 1];
      return { text: obj + ' What is the probability of ' + B(name) + '? Give a fraction in lowest terms.', ans: F(f, N), type: 'frac', low: true,
        how: fin(f, N, [W(list, 'the ways it can happen: ' + f + ' of them'), W('P = ' + fl(num(f), num(N)), N + ' equally likely ' + (N === 6 ? 'sides' : 'cards'))]),
        steps: [{ text: 'How many of 1 to ' + N + ' are ' + name + '?', ans: f }, { text: 'The probability in lowest terms?', ans: F(f, N), type: 'frac', low: true }],
        traps: [N - f ? tr(F(f, N - f), 'd_prob', 'The bottom is all ' + N + ' possible results.') : null, tr(F(N - f, N), 'd_complement', 'That is the chance it is NOT ' + name + '.'), ev === 'more' ? tr(F(f + 1, N), 'd_prob', '"More than ' + t + '" does not include ' + t + ' itself.') : null] };
    }
    const s = R.i(2, 12), w = 6 - Math.abs(s - 7), pairs = []; for (let a = 1; a <= 6; a++) { const b = s - a; if (b >= 1 && b <= 6) pairs.push(a + '+' + b); }
    return { text: 'You roll two fair dice and add them. What is the probability the total is ' + B(s) + '? Give a fraction in lowest terms.', ans: F(w, 36), type: 'frac', low: true,
      how: fin(w, 36, [W(pairs.join(', '), w + ' ways to make ' + s + '; 4+3 and 3+4 are different rolls'), W('P = ' + fl(num(w), '36'), '6 × 6 = 36 equally likely rolls')]),
      steps: [{ text: 'How many ways make a total of ' + s + '?', ans: w }, { text: 'How many rolls are possible in all?', ans: 36 }, { text: 'The probability in lowest terms?', ans: F(w, 36), type: 'frac', low: true }],
      traps: [tr(F(1, 11), 'd_prob', 'The 11 totals are not equally likely. Count the 36 rolls instead.'), tr(F(Math.ceil(w / 2), 36), 'd_prob', 'Count both orders: 4+3 and 3+4 are different rolls.'), tr(F(w, 12), 'd_countways', 'Two dice give 6 × 6 rolls, not 6 + 6.')] };
  } },

{ id: 'd_complement', s: 'data', g: 7, title: 'Not happening: 1 − P', paper: true,
  tip: 'The chance something does NOT happen is 1 − the chance it does. P(rain) = 3/10, so P(no rain) = 7/10. "At least one" = 1 − P(none).',
  gen(d, R) {
    if (d === 0) {
      const b = R.pick([5, 7, 8, 9, 10, 12, 20, 100]), a = R.i(1, b - 1), ev = R.pick(['it rains tomorrow', 'the bus is late', 'a spinner lands on red', 'Mia wins the game', 'the phone rings in the next hour']), ans = F(b - a, b); if (gcd(a, b) > 1) return null;
      return { text: 'The probability that ' + ev + ' is ' + B(fr(a, b)) + '. What is the probability that it does not happen? (A fraction is fine.)', ans, type: 'frac',
        how: ['P(not) = 1 ' + MINUS + ' P', W('= ' + fl(num(b), num(b)) + ' ' + MINUS + ' ' + fl(num(a), num(b)), '1 is ' + b + ' out of ' + b), '= ' + B(fr(b - a, b))],
        steps: [{ text: 'Write 1 as a fraction over ' + b + ': ?/' + b, ans: b }, { text: B(b + ' ' + MINUS + ' ' + a) + ' = ?', ans: b - a }],
        traps: [tr(F(a, b), 'd_complement', 'That is the chance it happens. Take it away from 1.'), tr(F(b - a, 1), 'd_complement', 'Keep the same bottom: it is out of ' + b + '.')] };
    }
    if (d === 1) {
      if (R.chance(.5)) { const cols = ['red', 'blue', 'green'], cnt = cols.map(() => R.i(2, 9)), T = sum(cnt), i = R.i(0, 2), ans = F(T - cnt[i], T);
        return { text: 'A bag has ' + B(cols.map((c, t) => cnt[t] + ' ' + c).join(', ')) + ' marbles. What is the probability of picking a marble that is ' + B('not ' + cols[i]) + '? Give a fraction in lowest terms.', ans, type: 'frac', low: true,
          how: [W('P(' + cols[i] + ') = ' + fl(cnt[i], T), cnt[i] + ' of ' + T + ' marbles'), W('P(not ' + cols[i] + ') = 1 ' + MINUS + ' ' + fl(cnt[i], T) + ' = ' + fl(T - cnt[i], T), 'the rest of the bag'), '= ' + B(fr(T - cnt[i], T))],
          steps: [{ text: 'How many marbles are not ' + cols[i] + '?', ans: T - cnt[i] }, { text: 'The probability in lowest terms?', ans, type: 'frac', low: true }],
          traps: [tr(F(cnt[i], T), 'd_complement', 'That is the chance of ' + cols[i] + '. You want everything else.'), tr(F(T - cnt[i], cnt[i]), 'd_prob', 'The bottom is all ' + T + ' marbles.')] }; }
      const ev = R.pick([['a 6', 1], ['a 1 or a 2', 2], ['an even number', 3], ['a multiple of 3', 2], ['a number above 4', 2]]), ans = F(6 - ev[1], 6);
      return { text: 'You roll a fair die. What is the probability of ' + B('not') + ' rolling ' + B(ev[0]) + '? Give a fraction in lowest terms.', ans, type: 'frac', low: true,
        how: [W('P(' + ev[0] + ') = ' + fl(ev[1], 6), ev[1] + ' of the 6 sides'), 'P(not) = 1 ' + MINUS + ' ' + fl(ev[1], 6) + ' = ' + fl(6 - ev[1], 6), '= ' + B(fr(6 - ev[1], 6))],
        steps: [{ text: 'How many sides are ' + ev[0] + '?', ans: ev[1] }, { text: 'The probability of not, in lowest terms?', ans, type: 'frac', low: true }],
        traps: [tr(F(ev[1], 6), 'd_complement', 'That is the chance it happens. Take it away from 1.'), tr(F(5, 6) === ans ? null : F(5, 6), 'd_complement', 'Count how many sides are ' + ev[0] + ' first.')] };
    }
    const kind = R.i(0, 2);
    if (kind === 0) { const n = R.i(2, 5), den = Math.pow(2, n), ans = F(den - 1, den);
      return { text: 'You flip a fair coin ' + B(n + ' times') + '. What is the probability of getting ' + B('at least one head') + '? (A fraction is fine.)', ans, type: 'frac',
        how: ['P(at least one head) = 1 ' + MINUS + ' P(no heads)', W('P(no heads) = ' + pw('(' + fl(1, 2) + ')', n) + ' = ' + fl(1, den), 'tails every time'), '1 ' + MINUS + ' ' + fl(1, den) + ' = ' + B(frac(den - 1, den))],
        steps: [{ text: 'P(all tails) = 1/?', ans: den }, { text: 'P(at least one head)?', ans, type: 'frac' }],
        traps: [tr(F(1, den), 'd_complement', 'That is the chance of no heads at all. Take it away from 1.'), tr(F(n, 2), 'd_indep', 'Adding the chances counts some outcomes twice. Use 1 ' + MINUS + ' P(none).'), tr(F(1, 2), 'd_complement', 'Each flip is a new chance; find P(no heads) first.')] }; }
    if (kind === 1) { const ans = F(11, 36);
      if (R.chance(.5)) return { text: 'You roll a fair die ' + B('twice') + '. What is the probability of at least one ' + B('6') + '? (A fraction is fine.)', ans, type: 'frac',
        how: ['P(at least one 6) = 1 ' + MINUS + ' P(no 6)', W('P(no 6) = ' + fl(5, 6) + ' × ' + fl(5, 6) + ' = ' + fl(25, 36), 'no 6 on either roll'), '1 ' + MINUS + ' ' + fl(25, 36) + ' = ' + B(frac(11, 36))],
        steps: [{ text: 'P(no 6 on both rolls) = ?/36', ans: 25 }, { text: 'P(at least one 6)?', ans, type: 'frac' }],
        traps: [tr(F(1, 3), 'd_indep', 'Adding 1/6 + 1/6 counts double sixes twice. Use 1 ' + MINUS + ' P(none).'), tr(F(25, 36), 'd_complement', 'That is the chance of no 6. Take it away from 1.'), tr(F(1, 36), 'd_indep', 'That is the chance of two 6s. At least one includes just one 6.')] }; }
    const r = R.i(1, 5), o = R.i(2, 7), T = r + o, ans = F(T * T - o * o, T * T);
    return { text: 'A bag has ' + B(r + ' red and ' + o + ' blue') + ' marbles. You pick one, put it back, and pick again. What is the probability of ' + B('at least one red') + '? (A fraction is fine.)', ans, type: 'frac',
      how: ['P(at least one red) = 1 ' + MINUS + ' P(no red)', W('P(no red) = ' + fl(o, T) + ' × ' + fl(o, T) + ' = ' + fl(o * o, T * T), 'blue both times'), '1 ' + MINUS + ' ' + fl(o * o, T * T) + ' = ' + B(fr(T * T - o * o, T * T))],
      steps: [{ text: 'P(blue both times) = ?/' + (T * T), ans: o * o }, { text: 'P(at least one red)?', ans, type: 'frac' }],
      traps: [tr(F(2 * r, T), 'd_indep', 'Adding the chances counts red-red twice. Use 1 ' + MINUS + ' P(none).'), tr(F(o * o, T * T), 'd_complement', 'That is the chance of no red. Take it away from 1.'), tr(F(r * r, T * T), 'd_indep', 'That is red both times. At least one includes one red.')] };
  } },

{ id: 'd_countways', s: 'data', g: 7, title: 'Counting choices: multiply',
  tip: 'If you make one choice and then another, multiply the number of options. 3 shirts and 4 pants make 3 × 4 = 12 outfits. A 3-digit code has 10 × 10 × 10 = 1,000.',
  gen(d, R) {
    if (d === 0) {
      const a = R.i(2, 8), b = R.i(2, 8), w = R.pick([['shirts', 'pairs of pants', 'outfits', 'shirt'], ['kinds of bread', 'fillings', 'sandwiches', 'kind of bread'], ['ice cream flavors', 'toppings', 'sundaes with one of each', 'flavor'], ['colors of card', 'stickers', 'cards with one of each', 'color']]), ans = a * b;
      return { text: 'You have ' + B(a + ' ' + w[0]) + ' and ' + B(b + ' ' + w[1]) + '. How many different ' + w[2] + ' can you make?', ans,
        how: ['Each of the ' + a + ' ' + w[0] + ' goes with each of the ' + b + ' ' + w[1] + '.', a + ' × ' + b + ' = ' + B(ans) + '.'],
        steps: [{ text: 'With just one ' + w[3] + ', how many choices?', ans: b }, { text: B(a + ' × ' + b) + ' = ?', ans }],
        traps: [tr(a + b, 'd_countways', 'Each ' + w[3] + ' pairs with every one of the ' + w[1] + ', so multiply.'), tr(ans + a, fx(a, b), 'Check ' + a + ' × ' + b + '.')] };
    }
    if (d === 1) {
      if (R.chance(.5)) { const a = R.i(2, 5), b = R.i(2, 6), c = R.i(2, 5), ans = a * b * c;
        return { text: 'A lunch menu has ' + B(a + ' drinks') + ', ' + B(b + ' mains') + ' and ' + B(c + ' desserts') + '. How many different meals of one of each are there?', ans,
          how: ['Multiply the choices at each step.', a + ' × ' + b + ' × ' + c + ' = ' + (a * b) + ' × ' + c + ' = ' + B(ans) + '.'],
          steps: [{ text: 'Drinks and mains: ' + B(a + ' × ' + b) + ' = ?', ans: a * b }, { text: B((a * b) + ' × ' + c) + ' = ?', ans }],
          traps: [tr(a + b + c, 'd_countways', 'Each choice multiplies the number of meals.'), tr(a * b + c, 'd_countways', 'Multiply by the desserts too.')] }; }
      const k = R.pick([['digits', 10, 2], ['digits', 10, 3], ['digits', 10, 4], ['letters', 26, 2], ['vowels', 5, 3], ['vowels', 5, 2], ['colors', 4, 3], ['colors', 3, 4]]), ans = Math.pow(k[1], k[2]);
      return { text: 'A code has ' + B(k[2] + ' spots') + '. Each spot can be any of ' + B(k[1] + ' ' + k[0]) + '. Repeats are allowed. How many codes are there?', ans,
        how: ['Each of the ' + k[2] + ' spots has ' + k[1] + ' choices.', Array(k[2]).fill(k[1]).join(' × ') + ' = ' + B(num(ans)) + '.'],
        steps: [{ text: 'Choices for each spot?', ans: k[1] }, { text: 'How many codes?', ans }],
        traps: [tr(k[1] * k[2], 'd_countways', 'Multiply ' + k[1] + ' by itself ' + k[2] + ' times, not by ' + k[2] + '.'), tr(k[1] + k[2], 'd_countways', 'Each spot multiplies the choices.'), tr(Math.pow(k[1] - 1, k[2]), 'd_countways', 'Repeats are allowed, so every spot has all ' + k[1] + ' choices.')] };
    }
    const n = R.i(2, 4), kind = R.i(0, 3), lo = Math.pow(10, n - 1), hi = Math.pow(10, n) - 1, rng = '(' + num(lo) + ' to ' + num(hi) + ')';
    const P = [[n + '-digit numbers that use only odd digits', Array(n).fill(5), 'each digit is 1, 3, 5, 7 or 9', Array(n).fill(10), 'Only odd digits count: 5 choices each.'],
      ['even ' + n + '-digit numbers ' + rng, [9].concat(Array(n - 2).fill(10), [5]), 'first digit 1 to 9, last digit 0, 2, 4, 6 or 8' + (n > 2 ? ', the rest 0 to 9' : ''), [10].concat(Array(n - 2).fill(10), [5]), 'The first digit cannot be 0.'],
      [n + '-digit numbers with no zero in them', Array(n).fill(9), '1 to 9 in every spot', [9].concat(Array(n - 1).fill(10)), 'No zeros anywhere, so every spot has 9 choices.'],
      [n + '-digit numbers ' + rng + ' with all different digits', [9, 9, 8, 7].slice(0, n), 'first digit 1 to 9, then 9 left (0 is allowed now), then one fewer each time', [9].concat([10, 10, 10].slice(0, n - 1)), 'A digit used once can\'t be used again.']][kind];
    const ans = P[1].reduce((a, b) => a * b, 1), wrong = P[3].reduce((a, b) => a * b, 1);
    return { text: 'How many ' + B(P[0]) + ' are there?', ans,
      how: ['Count the choices for each spot: ' + P[2] + '.', P[1].join(' × ') + ' = ' + B(num(ans)) + '.'],
      steps: [{ text: 'Choices for the first digit?', ans: P[1][0] }, { text: 'Choices for the last digit?', ans: P[1][P[1].length - 1] }, { text: 'How many in all?', ans }],
      traps: [tr(wrong, 'd_countways', P[4]), tr(sum(P[1]), 'd_countways', 'Multiply the choices, don\'t add them.')] };
  } },

{ id: 'd_indep', s: 'data', g: 7, title: 'Two things in a row: multiply', pre: ['f_mult'], paper: true,
  tip: 'For two separate events, P(A and B) = P(A) × P(B). A coin lands heads (1/2) and a die shows 6 (1/6): 1/2 × 1/6 = 1/12.',
  gen(d, R) {
    const mul = (fs, names, note) => { const n = fs.reduce((a, f) => a * f[0], 1), dd = fs.reduce((a, f) => a * f[1], 1);
      return { n, dd, how: [W(names.map((nm, i) => 'P(' + nm + ') = ' + frac(fs[i][0], fs[i][1])).join(', '), note), W(fs.map(f => frac(f[0], f[1])).join(' × ') + ' = ' + fl(num(n), num(dd)), 'separate events: multiply tops, multiply bottoms')].concat(gcd(n, dd) > 1 ? [W('= ' + B(fr(n, dd)), 'lowest terms')] : ['So the answer is ' + B(fr(n, dd)) + '.']) }; };
    const coin = [['heads', [1, 2]], ['tails', [1, 2]]], die = [['a 6', [1, 6]], ['an even number', [1, 2]], ['a 1 or 2', [1, 3]], ['a number above 2', [2, 3]], ['a 5', [1, 6]]];
    let fs, names, text, note;
    if (d === 0) {
      const A = R.pick(coin.concat(die)), Bv = R.pick(die), isCoin = coin.includes(A);
      fs = [A[1], Bv[1]]; names = [A[0], Bv[0]]; note = isCoin ? 'the coin and the die do not affect each other' : 'the two rolls do not affect each other';
      text = (isCoin ? 'You flip a coin and roll a die. What is the probability of ' + B(A[0]) + ' and ' + B(Bv[0]) + '?' : 'You roll a die twice. What is the probability of ' + B(A[0]) + ' first and then ' + B(Bv[0]) + '?');
    } else if (d === 1) {
      const r = R.i(1, 6), b = R.i(1, 6), g = R.i(0, 4), T = r + b + g, rr = R.chance(.5);
      fs = rr ? [[r, T], [r, T]] : [[r, T], [b, T]]; names = rr ? ['red', 'red'] : ['red', 'blue']; note = 'it goes back, so the second pick has the same chances';
      text = 'A bag has ' + B(r + ' red, ' + b + ' blue' + (g ? ' and ' + g + ' green' : '')) + ' marbles. You pick one, put it back, then pick again. What is the probability of ' + B(names[0] + ' then ' + names[1]) + '?';
    } else if (R.chance(.5)) {
      const p = R.pick([[1, 2], [1, 3], [2, 3], [3, 4], [1, 4], [2, 5], [3, 5], [4, 5]]), who = R.pick(NAMES), pat = R.pick([['hit', 'hit', 'hit'], ['miss', 'miss', 'hit'], ['hit', 'miss', 'hit'], ['hit', 'hit', 'miss']]);
      fs = pat.map(s => s === 'hit' ? p : [p[1] - p[0], p[1]]); names = pat.map((s, i) => ord(i + 1) + ' ' + s); note = 'a miss has chance 1 ' + MINUS + ' ' + fr(p[0], p[1]) + ' = ' + fr(p[1] - p[0], p[1]);
      text = who + ' makes a free throw with probability ' + B(fr(p[0], p[1])) + ', and each shot is separate. What is the probability of ' + B(pat.join(', ')) + ', in that order?';
    } else {
      const k = R.pick([3, 4]); fs = Array(k).fill([1, 2]); names = Array(k).fill('heads'); note = 'each flip is separate';
      text = 'You flip a coin ' + B(k + ' times') + '. What is the probability of ' + B('heads every time') + '?';
    }
    const m = mul(fs, names, note), ans = F(m.n, m.dd), sumN = fs.reduce((a, f) => [a[0] * f[1] + f[0] * a[1], a[1] * f[1]], [0, 1]);
    return { text: text + ' Give a fraction in lowest terms.', ans, type: 'frac', low: true, how: m.how,
      steps: fs.map((f, i) => ({ text: 'P(' + names[i] + ') = ?', ans: F(f[0], f[1]), type: 'frac' })).concat([{ text: 'Multiply them, lowest terms:', ans, type: 'frac', low: true }]),
      traps: [tr(F(sumN[0], sumN[1]), 'd_indep', '"And" for separate events means multiply, not add.'), tr(F(fs.reduce((a, f) => a * f[0], 1), fs.reduce((a, f) => a + f[1], 0)), 'f_mult', 'Multiply the bottoms too, not add them.'), d === 1 ? tr(F(fs[0][0] * (fs[1][0] - (names[0] === names[1] ? 1 : 0)), fs[0][1] * (fs[0][1] - 1)), 'd_indep', 'The marble goes back, so the second pick has the same chances as the first.') : null] };
  } },

{ id: 'd_weighted', s: 'data', g: 8, title: 'Weighted averages: combine two groups', paper: true,
  tip: 'To combine groups, add their totals, then divide by everyone. 3 kids averaging 70 and 1 kid scoring 90: (210 + 90) ÷ 4 = 75, closer to the bigger group.',
  gen(d, R) {
    const M = ' ' + MINUS + ' ';
    if (d < 2) {
      const n1 = d === 0 ? R.i(2, 12) : R.i(2, 8), n2 = d === 0 ? n1 : R.i(2, 8), k = nz(R, -4, 4), mid = R.i(70, 85); if (d === 1 && n1 === n2) return null;
      const A = d === 0 ? mid - k : mid - n2 * k, Bm = d === 0 ? mid + k : mid + n1 * k, t1 = n1 * A, t2 = n2 * Bm, N = n1 + n2, ans = (t1 + t2) / N; if (A > 100 || Bm > 100 || A < 40 || Bm < 40) return null;
      const g = R.pick([['students in class A', 'students in class B', 'test score', 'students'], ['players on the red team', 'players on the blue team', 'score', 'players'], ['girls', 'boys', 'long jump (in cm)', 'kids']]);
      return { text: 'The mean ' + g[2] + ' of ' + B(n1) + ' ' + g[0] + ' is ' + B(A) + '. The mean for ' + B(n2) + ' ' + g[1] + ' is ' + B(Bm) + '. What is the mean for all ' + N + ' ' + g[3] + '?', ans,
        how: [W('total 1 = ' + n1 + ' × ' + A + ' = ' + t1, 'mean × how many'), 'total 2 = ' + n2 + ' × ' + Bm + ' = ' + t2, W('mean = (' + t1 + ' + ' + t2 + ') ÷ ' + N, 'all the points shared over everyone'), '= ' + B(ans)],
        steps: [{ text: 'Total for ' + g[0] + '?', ans: t1 }, { text: 'Total for ' + g[1] + '?', ans: t2 }, { text: 'Mean for all ' + N + '?', ans }],
        traps: [n1 !== n2 ? tr((A + Bm) / 2, 'd_weighted', 'The groups are different sizes, so the bigger group pulls the mean toward its own.') : null, tr(t1 + t2, 'd_mean', 'That is the total. Share it over all ' + N + ' students.'), tr((t1 + t2) / 2, 'd_weighted', 'Divide by the number of students, ' + N + ', not by 2.')] };
    }
    if (R.chance(.5)) {
      const N = R.pick([10, 12, 20, 24, 25, 30]), n1 = R.i(2, N - 2), Mn = R.i(65, 90), A = R.i(60, 95), rest = (N * Mn - n1 * A) / (N - n1); if (!isInt(rest) || rest < 40 || rest > 100 || A === Mn) return null;
      return { text: 'A class of ' + B(N) + ' has a mean score of ' + B(Mn) + '. The ' + B(n1) + ' students in the front row have a mean of ' + B(A) + '. What is the mean of the other ' + (N - n1) + '?', ans: rest,
        how: [W('class total = ' + N + ' × ' + Mn + ' = ' + num(N * Mn), 'mean × how many'), 'front row total = ' + n1 + ' × ' + A + ' = ' + num(n1 * A), 'rest total = ' + num(N * Mn) + M + num(n1 * A) + ' = ' + num(N * Mn - n1 * A), 'mean of the rest = ' + num(N * Mn - n1 * A) + ' ÷ ' + (N - n1) + ' = ' + B(rest)],
        steps: [{ text: 'Class total?', ans: N * Mn }, { text: 'Front row total?', ans: n1 * A }, { text: 'Mean of the other ' + (N - n1) + '?', ans: rest }],
        traps: [tr(2 * Mn - A, 'd_weighted', 'The groups are different sizes, so work with totals.'), tr(N * Mn - n1 * A, 'd_mean', 'That is their total. Divide by ' + (N - n1) + '.'), tr((N * Mn - n1 * A) / N, 'd_weighted', 'Share the rest total over the ' + (N - n1) + ' other students only.')] };
    }
    const w = R.pick([[60, 40], [70, 30], [80, 20], [75, 25], [50, 50]]), a = R.i(12, 19) * 5, b = R.i(12, 20) * 5, ans = (w[0] * a + w[1] * b) / 100; if (a === b || !isInt(ans)) return null;
    return { text: 'Tests count ' + B(w[0] + '%') + ' of the grade and homework counts ' + B(w[1] + '%') + '. ' + R.pick(NAMES) + ' averages ' + B(a) + ' on tests and ' + B(b) + ' on homework. What is the final grade?', ans,
      how: [W('tests: ' + (w[0] / 100) + ' × ' + a + ' = ' + num(w[0] * a / 100), w[0] + '% of ' + a), 'homework: ' + (w[1] / 100) + ' × ' + b + ' = ' + num(w[1] * b / 100), num(w[0] * a / 100) + ' + ' + num(w[1] * b / 100) + ' = ' + B(num(ans))],
      steps: [{ text: B(w[0] + '% of ' + a) + ' = ?', ans: w[0] * a / 100 }, { text: B(w[1] + '% of ' + b) + ' = ?', ans: w[1] * b / 100 }, { text: 'Final grade?', ans }],
      traps: [w[0] !== w[1] ? tr((a + b) / 2, 'd_weighted', 'Tests count more, so the grade sits closer to the test average.') : null, tr((w[1] * a + w[0] * b) / 100, 'd_weighted', 'Match each weight to its own average: ' + w[0] + '% goes with tests.')] };
  } },

{ id: 'd_factorial', s: 'data', g: 10, title: 'Factorials: cancel before multiplying', paper: true,
  tip: 'n! = n × (n − 1) × … × 1. To divide factorials, write the bigger one down until it reaches the smaller one, then cancel: 10! ÷ 8! = 10 × 9 = 90.',
  gen(d, R) {
    const fct = v => { let p = 1; for (let i = 2; i <= v; i++) p *= i; return p; }, f = v => v + '!';
    if (d === 0 && R.chance(.4)) {
      const n = R.i(3, 7), ans = fct(n), list = Array.from({ length: n }, (_, i) => n - i);
      return { text: 'What is ' + B(f(n)) + '?', ans, how: [W(f(n) + ' = ' + list.join(' × '), 'multiply down to 1'), '= ' + B(num(ans))],
        steps: [{ text: B(list.slice(0, 2).join(' × ')) + ' = ?', ans: n * (n - 1) }, { text: f(n) + ' = ?', ans }],
        traps: [tr(n * (n + 1) / 2, 'd_factorial', 'n! multiplies the numbers, it does not add them.'), tr(ans / n, 'd_factorial', 'Start the product at ' + n + '.')] };
    }
    if (d < 2 && R.chance(.6) || d === 2 && R.chance(.4)) {
      const k = d === 0 ? 2 : R.pick([2, 3]), n = d === 2 ? R.pick([20, 25, 30, 50, 100]) : R.i(k + 3, 12), m = n - (d === 2 ? 2 : k), kk = n - m;
      const fs = Array.from({ length: kk }, (_, i) => n - i), ans = fs.reduce((a, b) => a * b, 1);
      return { text: 'What is ' + B(fl(f(n), f(m))) + '?', ans,
        how: [W(fl(fs.join(' × ') + ' × ' + f(m), f(m)), 'write ' + f(n) + ' down until it reaches ' + f(m)), W('= ' + fs.join(' × '), 'cancel ' + f(m)), '= ' + B(num(ans))],
        steps: [{ text: 'After cancelling, how many numbers are left to multiply?', ans: kk }, { text: B(fs.join(' × ')) + ' = ?', ans }],
        traps: [tr(fct(kk), 'd_factorial', 'You cannot subtract inside factorials. Write them out and cancel.'), tr(kk > 1 ? n : null, 'd_factorial', kk + ' numbers are left after cancelling, not just ' + n + '.'), tr(ans * (m), 'd_factorial', f(m) + ' cancels all of ' + m + ', ' + (m - 1) + ', … 1. Stop at ' + (m + 1) + '.')] };
    }
    const n = d === 2 ? R.i(10, 20) : R.i(5, 10), ans = n * (n - 1) / 2;
    return { text: 'What is ' + B(fl(f(n), f(n - 2) + ' × 2!')) + '?', ans,
      how: [W(fl(n + ' × ' + (n - 1) + ' × ' + f(n - 2), f(n - 2) + ' × 2'), 'write ' + f(n) + ' down to ' + f(n - 2) + '; 2! = 2'), W('= ' + fl(n + ' × ' + (n - 1), 2), 'cancel ' + f(n - 2)), '= ' + (n * (n - 1)) + ' ÷ 2 = ' + B(ans)],
      steps: [{ text: B(n + ' × ' + (n - 1)) + ' = ?', ans: n * (n - 1) }, { text: 'Divide by 2!:', ans }],
      traps: [tr(n * (n - 1), 'd_factorial', 'Don\'t forget to divide by 2! = 2.'), tr(ans * (n - 2), 'd_factorial', f(n - 2) + ' cancels everything from ' + (n - 2) + ' down.'), tr(n, 'd_factorial', 'Two numbers are left on top after cancelling.')] };
  } },

{ id: 'd_perm', s: 'data', g: 10, title: 'Arrangements in order', paper: true,
  tip: 'When order matters, multiply the choices, one fewer each time. 1st, 2nd and 3rd place from 8 runners: 8 × 7 × 6 = 336. All 5 books on a shelf: 5! = 120.',
  gen(d, R) {
    const fct = v => { let p = 1; for (let i = 2; i <= v; i++) p *= i; return p; };
    if (d < 2) {
      const all = d === 0 && R.chance(.5), n = all ? R.i(3, 6) : R.i(d === 0 ? 4 : 5, d === 0 ? 9 : 12), r = all ? n : d === 0 ? 2 : 3;
      const fs = Array.from({ length: r }, (_, i) => n - i), ans = fs.reduce((a, b) => a * b, 1);
      const s = all ? R.pick([['books', 'be put in a row on a shelf'], ['friends', 'line up for a photo'], ['songs', 'be played, one after another']]) : R.pick([['runners', r === 2 ? '1st and 2nd place be given out' : 'gold, silver and bronze be given out'], ['club members', r === 2 ? 'a president and a vice president be picked' : 'a president, a vice president and a treasurer be picked'], ['students', r === 2 ? 'the first and second talks be given' : 'the first, second and third talks be given']]);
      return { text: all ? 'In how many different orders can ' + B(n + ' ' + s[0]) + ' ' + s[1] + '?' : 'There are ' + B(n + ' ' + s[0]) + '. In how many ways can ' + s[1] + '?', ans,
        how: [W(fs.map((v, i) => ord(i + 1) + ': ' + v).join(', '), 'order matters, and each choice leaves one fewer'), W(fs.join(' × ') + ' = ' + B(num(ans)), all ? 'that is ' + n + '!' : '')],
        steps: [{ text: 'Choices for the first spot?', ans: n }, { text: 'Choices for the second spot?', ans: n - 1 }, { text: 'How many ways in all?', ans }],
        traps: [tr(all ? null : ans / fct(r), 'd_comb', 'Here the order matters (1st is different from 2nd), so don\'t divide.'), tr(Math.pow(n, r), 'd_countways', 'Nobody can be picked twice, so the choices drop by 1 each time.'), tr(sum(fs), 'd_countways', 'Multiply the choices, don\'t add them.')] };
    }
    if (R.chance(.6)) {
      const w = R.pick(['BOOK', 'NOON', 'SEES', 'LEVEL', 'TOOTH', 'APPLE', 'DADDY', 'BANANA', 'PEPPER', 'COOKIE', 'LETTER', 'GEESE']), cnt = {}; w.split('').forEach(c => cnt[c] = (cnt[c] || 0) + 1);
      const reps = Object.keys(cnt).filter(c => cnt[c] > 1), div = reps.reduce((a, c) => a * fct(cnt[c]), 1), L = w.length, ans = fct(L) / div;
      const ds = reps.map(c => cnt[c] + '!').join(' × ');
      return { text: 'How many different arrangements are there of the letters in ' + B(w) + '?', ans,
        how: [W(L + '! = ' + num(fct(L)), 'if every letter were different'), W(num(fct(L)) + ' ÷ (' + ds + ')', reps.map(c => c + ' appears ' + cnt[c] + ' times').join(', ') + '; swapping the same letters makes nothing new'), '= ' + num(fct(L)) + ' ÷ ' + div + ' = ' + B(num(ans))],
        steps: [{ text: B(L + '!') + ' = ?', ans: fct(L) }, { text: 'Divide by ' + B(ds) + ' = ?', ans }],
        traps: [tr(fct(L), 'd_perm', 'Repeated letters: swapping the two ' + reps[0] + '\'s makes the same word, so divide.'), tr(fct(L) / reps.length / 2 === ans ? null : fct(L) / (2 * reps.length), 'd_perm', 'Divide by the factorial of each repeat count: ' + ds + '.')] };
    }
    const n = R.i(4, 8), ans = 2 * fct(n - 1);
    return { text: B(n + ' friends') + ' line up for a photo, and two of them insist on standing next to each other. How many lineups are there?', ans,
      how: [W('glue the pair into one block: ' + (n - 1) + ' things to line up', 'the pair moves together'), W((n - 1) + '! = ' + num(fct(n - 1)), 'arrange the blocks'), W(num(fct(n - 1)) + ' × 2 = ' + B(num(ans)), 'the pair can stand two ways round')],
      steps: [{ text: 'How many blocks to arrange?', ans: n - 1 }, { text: B((n - 1) + '!') + ' = ?', ans: fct(n - 1) }, { text: 'Times 2 for the pair:', ans }],
      traps: [tr(fct(n - 1), 'd_perm', 'The pair can stand two ways round: AB or BA.'), tr(fct(n), 'd_perm', 'Treat the pair as one block first.'), tr(2 * fct(n - 2), 'd_perm', 'Gluing ' + n + ' people into one pair leaves ' + (n - 1) + ' blocks.')] };
  } },

{ id: 'd_comb', s: 'data', g: 10, title: 'Choosing groups: combinations',
  tip: 'When order does not matter, count in order and divide by the ways to arrange the group. C(10, 2) = 10 × 9 ÷ 2 = 45. Choosing 8 to keep is choosing 2 to leave: C(10, 8) = C(10, 2).',
  gen(d, R) {
    const Cn = (n, r) => { let p = 1; for (let i = 0; i < r; i++) p = p * (n - i) / (i + 1); return Math.round(p); }, fct = v => { let p = 1; for (let i = 2; i <= v; i++) p *= i; return p; };
    const show = (n, r) => 'C(' + n + ', ' + r + ')';
    if (d === 0) {
      const n = R.i(4, 14), ans = Cn(n, 2), s = R.pick([['people', 'shake hands once with everyone else', 'handshakes'], ['teams', 'play each other once', 'games'], ['dots on a circle', 'are joined by straight lines, every pair', 'lines']]);
      return { text: B(n + ' ' + s[0]) + ' ' + s[1] + '. How many ' + s[2] + ' are there?', ans,
        how: ['Pick a pair in order: ' + n + ' × ' + (n - 1) + ' = ' + (n * (n - 1)) + '.', 'Each pair was counted twice (A then B, B then A), so halve it: ' + (n * (n - 1)) + ' ÷ 2 = ' + B(ans) + '.'],
        steps: [{ text: 'Pairs in order: ' + B(n + ' × ' + (n - 1)) + ' = ?', ans: n * (n - 1) }, { text: 'Halve it:', ans }],
        traps: [tr(n * (n - 1), 'd_perm', 'A with B is the same as B with A, so halve it.'), tr(n * n, 'd_countways', 'Nobody pairs with themselves, and each pair counts once.'), tr(n * (n - 1) / 2 + n, 'd_comb', 'Count only pairs of two different ' + s[0] + '.')] };
    }
    if (d === 1) {
      const n = R.i(6, 12), small = R.pick([2, 3]), big = n - small, ans = Cn(n, small), askBig = R.chance(.7), r = askBig ? big : small, fs = Array.from({ length: small }, (_, i) => n - i);
      return { text: 'How many ways can you choose ' + B(r + ' of ' + n) + ' players for a team? That is ' + B(show(n, r)) + '.', ans,
        how: askBig ? ['Choosing ' + big + ' to play is the same as choosing ' + small + ' to sit out: ' + show(n, big) + ' = ' + show(n, small) + '.', show(n, small) + ' = ' + fs.join(' × ') + ' ÷ ' + small + '! = ' + num(fs.reduce((a, b) => a * b, 1)) + ' ÷ ' + fct(small) + ' = ' + B(ans) + '.']
          : [show(n, small) + ' = (' + fs.join(' × ') + ') ÷ ' + small + '!', '= ' + num(fs.reduce((a, b) => a * b, 1)) + ' ÷ ' + fct(small) + ' = ' + B(ans) + '.'],
        steps: [{ text: 'Choosing ' + r + ' to play is like choosing how many to leave out?', ans: n - r }, { text: B(show(n, small)) + ' = ?', ans }],
        traps: [tr(fs.reduce((a, b) => a * b, 1), 'd_perm', 'In a team the order does not matter, so divide by ' + small + '! = ' + fct(small) + '.'), tr(n * small, 'd_comb', 'Multiply ' + fs.join(' × ') + ', then divide by ' + small + '!.'), tr(askBig ? n * big : null, 'd_comb', 'Use the smaller side: ' + show(n, big) + ' = ' + show(n, small) + '.')] };
    }
    if (R.chance(.5)) {
      const n = R.pick([15, 20, 25, 30, 50, 100]), r = n - 2, ans = n * (n - 1) / 2;
      return { text: 'Work it out the quick way: ' + B(show(n, r)) + ' = ?', ans,
        how: ['Choosing ' + r + ' is the same as leaving out 2: ' + show(n, r) + ' = ' + show(n, 2) + '.', show(n, 2) + ' = ' + n + ' × ' + (n - 1) + ' ÷ 2 = ' + B(num(ans)) + '.'],
        steps: [{ text: B(show(n, r)) + ' = C(' + n + ', ?)', ans: 2 }, { text: B(n + ' × ' + (n - 1) + ' ÷ 2') + ' = ?', ans }],
        traps: [tr(n * (n - 1), 'd_perm', 'Divide by 2! because order does not matter.'), tr(n * r, 'd_comb', 'Use the symmetry: ' + show(n, r) + ' = ' + show(n, 2) + '.')] };
    }
    const a = R.i(4, 8), b = R.i(4, 8), ra = R.pick([1, 2]), rb = 2, ca = Cn(a, ra), cb = Cn(b, rb), ans = ca * cb;
    return { text: 'A committee needs ' + B(ra + ' of the ' + a + ' teachers') + ' and ' + B(rb + ' of the ' + b + ' parents') + '. How many different committees are possible?', ans,
      how: ['Teachers: ' + show(a, ra) + ' = ' + ca + '. Parents: ' + show(b, rb) + ' = ' + b + ' × ' + (b - 1) + ' ÷ 2 = ' + cb + '.', 'Choose both: ' + ca + ' × ' + cb + ' = ' + B(ans) + '.'],
      steps: [{ text: B(show(a, ra)) + ' = ?', ans: ca }, { text: B(show(b, rb)) + ' = ?', ans: cb }, { text: 'Committees:', ans }],
      traps: [tr(ca + cb, 'd_countways', 'You choose teachers AND parents, so multiply.'), tr(Cn(a + b, ra + rb), 'd_comb', 'The committee needs exactly ' + ra + ' teacher' + (ra > 1 ? 's' : '') + ' and ' + rb + ' parents, so choose each group separately.'), tr(ca * b * (b - 1), 'd_perm', 'Order does not matter among the parents: divide by 2.')] };
  } },

{ id: 'd_pascal', s: 'data', g: 10, title: 'Pascal\'s triangle', pre: ['w_exp'],
  tip: 'Each number is the sum of the two above it. Row n (the one starting 1, n, …) adds up to 2ⁿ, and its numbers are C(n, 0), C(n, 1), … C(n, n).',
  gen(d, R) {
    const row = n => { let r = [1]; for (let i = 0; i < n; i++) { const t = [1]; for (let j = 1; j < r.length; j++) t.push(r[j - 1] + r[j]); t.push(1); r = t; } return r; };
    if (d === 0) {
      const n = R.i(3, 10), ans = Math.pow(2, n), r = row(n);
      return { text: 'What do the numbers in row ' + B(n) + ' of Pascal\'s triangle add up to? (Row ' + n + ' starts 1, ' + n + ', …)', ans,
        how: ['Each row adds to double the row above: 1, 2, 4, 8, 16, …', 'So row ' + n + ' adds to ' + pw(2, n) + ' = ' + B(num(ans)) + '. (Check: ' + r.join(' + ') + '.)'],
        steps: [{ text: 'Row ' + (n - 1) + ' adds to ' + Math.pow(2, n - 1) + '. Double it:', ans }],
        traps: [tr(2 * n, 'w_exp', 'Doubling every row gives ' + pw(2, n) + ', not 2 × ' + n + '.'), tr(n * n, 'w_exp', 'It is 2 to the power ' + n + ', not ' + n + ' squared.'), tr(Math.pow(2, n - 1), 'd_pascal', 'Row 0 is the single 1, so row ' + n + ' adds to ' + pw(2, n) + '.')] };
    }
    if (d === 1) {
      const n = R.i(4, 8), r = row(n), k = R.i(1, n), nx = row(n + 1), ans = nx[k];
      return { text: 'Here is a row of Pascal\'s triangle. What is the ' + B(ord(k + 1)) + ' number of the next row?', vis: seqHTML(r), ans,
        how: ['Each number is the sum of the two just above it.', 'The two above are ' + r[k - 1] + ' and ' + r[k] + ': ' + r[k - 1] + ' + ' + r[k] + ' = ' + B(ans) + '.'],
        steps: [{ text: 'The ' + ord(k) + ' number of this row?', ans: r[k - 1] }, { text: 'The ' + ord(k + 1) + ' number of this row?', ans: r[k] }, { text: 'Add them:', ans }],
        traps: [tr(r[k], 'd_pascal', 'Add the two numbers above it.'), tr(2 * r[k], 'd_pascal', 'Add the two neighbours above it, not one number twice.'), tr(r[k - 1] * r[k], 'd_pascal', 'Add the two above, don\'t multiply.')] };
    }
    const kind = R.i(0, 2), n = R.i(4, 8), k = R.i(1, n - 1), r = row(n), ans = r[k];
    if (kind === 2) { const ans2 = Math.pow(2, n);
      return { text: 'How many different groups (including the empty group and all of them) can you make from ' + B(n + ' different stickers') + '?', ans: ans2,
        how: ['Each sticker is either in or out: 2 choices, ' + n + ' times.', pw(2, n) + ' = ' + B(num(ans2)) + ' (the sum of row ' + n + ' of Pascal\'s triangle).'],
        steps: [{ text: 'Choices for each sticker (in or out)?', ans: 2 }, { text: B(pw(2, n)) + ' = ?', ans: ans2 }],
        traps: [tr(2 * n, 'w_exp', '2 choices for each of ' + n + ' stickers multiply: ' + pw(2, n) + '.'), tr(ans2 - 1, 'd_pascal', 'Count the empty group too.')] }; }
    const text = kind === 0 ? 'In ' + B(pw('(x + 1)', n)) + ', what number goes in front of ' + B(pw('x', k)) + '?' : 'You flip a coin ' + B(n + ' times') + '. How many different sequences have exactly ' + B(k + ' heads') + '?';
    return { text, ans,
      how: ['Use row ' + n + ' of Pascal\'s triangle: ' + r.join(', ') + '.', (kind === 0 ? 'The number for ' + pw('x', k) : 'Exactly ' + k + ' heads') + ' is C(' + n + ', ' + k + '), the ' + ord(k + 1) + ' number: ' + B(ans) + '.'],
      steps: [{ text: 'Row ' + n + ': what is the 2nd number?', ans: n }, { text: 'The ' + ord(k + 1) + ' number of row ' + n + '?', ans }],
      traps: [tr(n * k, 'd_pascal', 'Read it from row ' + n + ' of the triangle: C(' + n + ', ' + k + ').'), tr(r[k + 1] === ans ? null : r[k + 1], 'd_pascal', 'Count from 0: the first 1 is C(' + n + ', 0).'), tr(Math.pow(2, n), 'd_pascal', 'That is all the sequences together. You need only those with ' + k + '.')] };
  } },

{ id: 'd_expected', s: 'data', g: 11, title: 'Expected value', paper: true,
  tip: 'Expected value = add up (value × probability) for every outcome. Win $10 with chance 1/5, else nothing: 10 × 1/5 = $2 a game on average.',
  gen(d, R) {
    if (d === 0) {
      if (R.chance(.5)) { const vals = R.shuffle([0, R.i(1, 5), R.i(2, 8), R.i(5, 15)]); const S = sum(vals); if (S % 4) return null; const ans = S / 4;
        return { text: 'A spinner has 4 equal parts worth ' + B(vals.join(', ')) + ' points. What is the expected number of points per spin?', ans,
          how: [W('E = ' + vals.map(v => v + ' × ' + fl(1, 4)).join(' + '), 'each part has chance 1/4'), W('= ' + S + ' × ' + fl(1, 4), 'equal chances: it is just the mean'), '= ' + B(ans)],
          steps: [{ text: 'Total of the four parts?', ans: S }, { text: 'Times 1/4:', ans }],
          traps: [tr(S, 'd_expected', 'Each part only comes up 1/4 of the time.'), tr(Math.max(...vals), 'd_expected', 'Expected value is the long-run average, not the best result.')] }; }
      const q = R.pick([2, 4, 5, 6, 10]), W0 = q * R.i(1, 6), ans = W0 / q;
      return { text: 'A game pays ' + B('$' + W0) + ' with probability ' + B(fr(1, q)) + ' and nothing otherwise. What is the expected payout per game, in dollars?', ans,
        how: [W('E = ' + W0 + ' × ' + fl(1, q) + ' + 0 × ' + fl(q - 1, q), 'value × probability, for each outcome'), '= ' + B(ans)],
        steps: [{ text: B(W0 + ' × ' + fl(1, q)) + ' = ?', ans }],
        traps: [tr(W0, 'd_expected', 'You only win ' + fr(1, q) + ' of the time.'), tr(W0 / 2, 'd_expected', 'The two outcomes are not equally likely; use the probabilities.')] };
    }
    if (d === 1) {
      const q = R.pick([3, 4, 5, 6, 10]), a = R.i(1, 8), b = R.i(1, 3), Wn = q * a, Ls = q * b, pw0 = q - 1, ans = a - b * pw0; if (ans === 0) return null;
      return { text: 'A game costs nothing to play. You win ' + B('$' + Wn) + ' with probability ' + B(fr(1, q)) + ', and otherwise you lose ' + B('$' + Ls) + '. What is the expected value per game, in dollars? (Negative means a loss.)', ans,
        how: [W('E = ' + Wn + ' × ' + fl(1, q) + ' + (' + MINUS + Ls + ') × ' + fl(pw0, q), 'value × probability; a loss counts as negative'), '= ' + a + ' ' + MINUS + ' ' + (b * pw0), '= ' + B(num(ans))],
        steps: [{ text: B(Wn + ' × ' + fl(1, q)) + ' = ?', ans: a }, { text: B(Ls + ' × ' + fl(pw0, q)) + ' = ?', ans: b * pw0 }, { text: 'E = ?', ans }],
        traps: [tr(a + b * pw0, 'n_intadd', 'A loss counts as a negative amount.'), tr((Wn - Ls) / 2, 'd_expected', 'Weight each amount by its probability; they are not 50/50.'), tr(a, 'd_expected', 'Include the losing outcome too.')] };
    }
    if (R.chance(.5)) { const q = R.pick([4, 5, 6, 8, 10]), c = R.i(1, 5), ans = c * q;
      return { text: 'It costs ' + B('$' + c) + ' to play. You win a prize of ' + B('$x') + ' with probability ' + B(fr(1, q)) + ' (and keep nothing otherwise). What prize x makes the game fair (expected winnings = the cost)?', ans,
        how: [W('x × ' + fl(1, q) + ' = ' + c, 'fair: expected prize equals the cost'), W('x = ' + c + ' × ' + q, 'multiply both sides by ' + q), 'x = ' + B(ans)],
        steps: [{ text: 'Expected prize must equal what?', ans: c }, { text: 'x = ?', ans }],
        traps: [tr(c + q, 'd_expected', 'x × ' + fr(1, q) + ' = ' + c + ', so multiply ' + c + ' by ' + q + '.'), tr(c * (q - 1), 'd_expected', 'Set the expected prize equal to the cost: x × ' + fr(1, q) + ' = ' + c + '.')] }; }
    const ps = R.pick([[5, 3, 2], [6, 3, 1], [4, 4, 2], [7, 2, 1], [5, 4, 1]]), vs = [R.i(0, 3), R.i(4, 10), R.i(10, 30)], top = ps[0] * vs[0] + ps[1] * vs[1] + ps[2] * vs[2], ans = top / 10;
    return { text: 'A prize wheel gives ' + B('$' + vs[0]) + ' with probability ' + B(ps[0] / 10) + ', ' + B('$' + vs[1]) + ' with probability ' + B(ps[1] / 10) + ' and ' + B('$' + vs[2]) + ' with probability ' + B(ps[2] / 10) + '. What is the expected prize, in dollars?', ans,
      how: [W('E = ' + vs.map((v, i) => v + ' × ' + (ps[i] / 10)).join(' + '), 'value × probability, then add'), '= ' + vs.map((v, i) => num(v * ps[i] / 10)).join(' + '), '= ' + B(num(ans))],
      steps: vs.map((v, i) => ({ text: B(v + ' × ' + (ps[i] / 10)) + ' = ?', ans: v * ps[i] / 10 })).concat([{ text: 'Add them:', ans }]),
      traps: [tr(sum(vs) / 3, 'd_expected', 'The prizes are not equally likely; weight each one.'), tr(vs[2], 'd_expected', 'Expected value is the long-run average, not the top prize.')] };
  } },

{ id: 'd_stdev', s: 'data', g: 11, title: 'Standard deviation of small sets', pre: ['w_roots'], paper: true,
  tip: 'Find the mean, the gap of each number from it, square the gaps, average the squares (that is the variance), then take the square root. {2, 8}: mean 5, gaps ±3, SD 3.',
  gen(d, R) {
    const n = d === 0 ? R.pick([2, 4]) : d === 1 ? R.pick([4, 5]) : 6, pats = SDP[n] || [];
    let dev;
    if (d === 0) { const k = R.i(1, 6); dev = n === 2 ? [-k, k] : [-k, -k, k, k]; }
    else { const P = pats.filter(p => new Set(p.map(Math.abs)).size > 1); if (!P.length) return null; const sc = d === 2 && R.chance(.4) ? 2 : 1; dev = R.pick(P).map(v => v * sc); }
    const m = d === 2 ? R.i(20, 90) : R.i(8, 30), vals = R.shuffle(dev.map(v => m + v)); if (vals.some(v => v < 0)) return null;
    const gaps = vals.map(v => v - m), sqs = gaps.map(v => v * v), SS = sum(sqs), V = SS / n, ans = Math.round(Math.sqrt(V)), mad = sum(gaps.map(Math.abs)) / n, S1 = Math.sqrt(SS / (n - 1));
    return { text: 'What is the standard deviation of ' + B(vals.join(', ')) + '? (Divide by how many numbers there are.)', ans,
      how: [W('mean = ' + sum(vals) + ' ÷ ' + n + ' = ' + m, 'add them, divide by ' + n), W('gaps: ' + gaps.map(v => num(v)).join(', '), 'each number ' + MINUS + ' ' + m), W('squares: ' + sqs.join(' + ') + ' = ' + SS, 'square each gap'), W('variance = ' + SS + ' ÷ ' + n + ' = ' + num(V), 'average of the squares'), 'SD = ' + rt(num(V)) + ' = ' + B(ans)],
      steps: [{ text: 'The mean?', ans: m }, { text: 'Sum of the squared gaps?', ans: SS }, { text: 'Variance (that sum ÷ ' + n + ')?', ans: V }, { text: 'SD = square root:', ans }],
      traps: [tr(V, 'd_stdev', 'That is the variance. Take its square root.'), tr(mad, 'd_stdev', 'Square the gaps before you average them, then take the root.'), tr(isInt(S1) ? S1 : null, 'd_stdev', 'Divide by how many numbers there are (' + n + '), not one fewer.'), tr(SS, 'd_stdev', 'Average the squares (÷ ' + n + '), then take the root.')] };
  } },

{ id: 'd_zscore', s: 'data', g: 12, title: 'z-scores: how many SDs away', paper: true,
  tip: 'z = (value − mean) ÷ SD: how many standard deviations above (+) or below (−) the mean. Mean 70, SD 8: a score of 86 has z = 16 ÷ 8 = 2.',
  gen(d, R) {
    const mu = R.i(40, 90), sd = d === 0 ? R.i(2, 12) : 2 * R.i(2, 8), z = d === 0 ? R.i(1, 3) : R.pick([-2.5, -2, -1.5, -1, -0.5, 0.5, 1.5, 2.5, -3]), x = mu + z * sd, gap = x - mu;
    const ctx = R.pick(['Test scores', 'Heights (cm) in a class', 'Weights (g) of apples', 'Race times (s)']);
    if (d < 2) return { text: ctx + ' have mean ' + B(mu) + ' and standard deviation ' + B(sd) + '. What is the z-score of ' + B(num(x)) + '?', ans: z,
      how: ['z = (value ' + MINUS + ' mean) ÷ SD', '= (' + num(x) + ' ' + MINUS + ' ' + mu + ') ÷ ' + sd, '= ' + num(gap) + ' ÷ ' + sd, '= ' + B(num(z))],
      steps: [{ text: 'Gap from the mean: ' + B(num(x) + ' ' + MINUS + ' ' + mu) + ' = ?', ans: gap }, { text: B(num(gap) + ' ÷ ' + sd) + ' = ?', ans: z }],
      traps: [tr(gap, 'd_zscore', 'Divide the gap by the standard deviation.'), tr(-z, 'n_intsub', 'Below the mean gives a negative z; above gives positive.'), tr(sd / gap, 'd_zscore', 'Gap on top, SD on the bottom.')] };
    if (R.chance(.6)) return { text: ctx + ' have mean ' + B(mu) + ' and standard deviation ' + B(sd) + '. What value has a z-score of ' + B(num(z)) + '?', ans: x,
      how: [W('value = mean + z × SD', 'z ' + (z < 0 ? 'below' : 'above') + ' means ' + Math.abs(z) + ' SDs ' + (z < 0 ? 'down' : 'up')), '= ' + mu + ' + ' + par2(z) + ' × ' + sd, '= ' + mu + ' ' + signed(gap), '= ' + B(num(x))],
      steps: [{ text: B(par2(z) + ' × ' + sd) + ' = ?', ans: gap }, { text: B(mu + ' ' + signed(gap)) + ' = ?', ans: x }],
      traps: [tr(mu + z, 'd_zscore', 'z counts standard deviations: multiply it by ' + sd + ' first.'), tr(mu - gap, 'n_intmul', 'Check the sign: z = ' + num(z) + ' is ' + (z < 0 ? 'below' : 'above') + ' the mean.'), tr(z * sd, 'd_zscore', 'Add that to the mean.')] };
    const z2 = z + R.pick([1, 1.5, 2, 3]), x2 = mu + z2 * sd, dz = z2 - z;
    return { text: ctx + ' have mean ' + B(mu) + ' and standard deviation ' + B(sd) + '. How many standard deviations apart are ' + B(num(x)) + ' and ' + B(num(x2)) + '?', ans: dz,
      how: [W(num(x2) + ' ' + MINUS + ' ' + num(x) + ' = ' + num(x2 - x), 'the gap between them'), W(num(x2 - x) + ' ÷ ' + sd + ' = ' + B(num(dz)), 'divide by the SD; the mean does not matter here')],
      steps: [{ text: 'Gap between the values?', ans: x2 - x }, { text: 'Divide by ' + sd + ':', ans: dz }],
      traps: [tr(x2 - x, 'd_zscore', 'Divide the gap by the standard deviation.'), tr(Math.abs(z) + Math.abs(z2) === dz ? null : Math.abs(z) + Math.abs(z2), 'd_zscore', 'Find the gap between the values first, then divide by the SD.')] };
  } },

{ id: 'd_binom', s: 'data', g: 12, title: 'Binomial probability', paper: true,
  tip: 'P(exactly k successes in n tries) = C(n, k) × pᵏ × qⁿ⁻ᵏ, with q = 1 − p. Exactly 2 heads in 4 flips: 6 × (1/2)⁴ = 6/16 = 3/8.',
  gen(d, R) {
    const Cn = (n, r) => { let p = 1; for (let i = 0; i < r; i++) p = p * (n - i) / (i + 1); return Math.round(p); };
    const [pn, pd, what, one, act] = d === 0 ? [1, 2, 'heads', 'head', n => 'You flip a fair coin ' + B(n + ' times') + '.'] : d === 1 ? R.pick([[1, 6, 'sixes', 'six', n => 'You roll a fair die ' + B(n + ' times') + '.'], [1, 3, 'reds', 'red', n => 'A spinner is 1/3 red. You spin it ' + B(n + ' times') + '.']])
      : R.pick([[1, 4, 'hits', 'hit', n => 'You take ' + B(n + ' shots') + ', and each goes in with probability 1/4.'], [3, 4, 'hits', 'hit', n => 'You take ' + B(n + ' shots') + ', and each goes in with probability 3/4.'], [2, 5, 'wins', 'win', n => 'You play a game ' + B(n + ' times') + ' and win each time with probability 2/5.'], [2, 3, 'wins', 'win', n => 'You play a game ' + B(n + ' times') + ' and win each time with probability 2/3.'], [3, 5, 'wins', 'win', n => 'You play a game ' + B(n + ' times') + ' and win each time with probability 3/5.']]);
    const n = d === 0 ? R.i(3, 6) : d === 1 ? R.i(2, 4) : R.i(3, 5), k = R.i(1, n - 1), qn = pd - pn, c = Cn(n, k);
    const top1 = Math.pow(pn, k) * Math.pow(qn, n - k), den = Math.pow(pd, n), ans = F(c * top1, den);
    const powS = (a, b, e) => pw('(' + frac(a, b) + ')', e);
    return { text: act(n) + ' What is the probability of exactly ' + B(k + ' ' + (k === 1 ? one : what)) + '? Give a fraction in lowest terms.', ans, type: 'frac', low: true,
      how: [W('C(' + n + ', ' + k + ') = ' + c, 'the number of ways to choose which ' + k + ' tries succeed'), W(powS(pn, pd, k) + ' × ' + powS(qn, pd, n - k) + ' = ' + fl(num(top1), num(den)), 'the chance of one such order'), W(c + ' × ' + fl(num(top1), num(den)) + ' = ' + fl(num(c * top1), num(den)), 'times the number of orders')].concat(gcd(c * top1, den) > 1 ? [W('= ' + B(fr(c * top1, den)), 'lowest terms')] : ['So the answer is ' + B(fr(c * top1, den)) + '.']),
      steps: [{ text: 'C(' + n + ', ' + k + ') = ?', ans: c }, { text: 'Chance of one order (a fraction):', ans: F(top1, den), type: 'frac' }, { text: 'Multiply, lowest terms:', ans, type: 'frac', low: true }],
      traps: [tr(F(top1, den), 'd_comb', 'There are C(' + n + ', ' + k + ') = ' + c + ' different orders. Multiply by it.'), tr(F(Math.pow(pn, k), Math.pow(pd, k)), 'd_binom', 'Include the chance that the other ' + (n - k) + ' ' + plural(n - k, 'try', 'tries') + ' fail.'), tr(F(k, n), 'd_binom', 'Use C(n, k) × pᵏ × qⁿ⁻ᵏ, not k out of n.')] };
  } },

{ id: 'd_condprob', s: 'data', g: 12, title: 'Conditional probability from a table', paper: true,
  tip: '"Given B" means only look at the B group. P(A given B) = (number in both A and B) ÷ (number in B). Read the right row or column total for the bottom.',
  gen(d, R) {
    const lowL = (a, b) => gcd(a, b) > 1 ? [W('= ' + B(fr(a, b)), 'lowest terms')] : [];
    if (d < 2 || R.chance(.5)) {
      const S = R.pick([[['grade 5 kids', 'grade 6 kids'], ['soccer', 'swimming'], 'kids', 'like'], [['boys', 'girls'], ['cats', 'dogs'], 'pet owners', 'prefer'], [['juniors', 'seniors'], ['bus', 'car'], 'students', 'get to school by']]);
      const a = R.i(2, 20), b = R.i(2, 20), c = R.i(2, 20), e = R.i(2, 20), T = a + b + c + e, cells = [[a, b], [c, e]];
      const vis = table([['', S[1][0], S[1][1], 'total'], [S[0][0], a, b, a + b], [S[0][1], c, e, c + e], ['total', a + c, b + e, T]]);
      const byRow = d === 0 ? true : d === 1 ? R.chance(.4) : R.chance(.5), i = R.i(0, 1), j = R.i(0, 1), top = cells[i][j], bot = byRow ? cells[i][0] + cells[i][1] : cells[0][j] + cells[1][j];
      const ev = byRow ? S[3] + ' ' + S[1][j] : 'are ' + S[0][i], ans = F(top, bot);
      const q = byRow ? 'Pick one of the ' + B(S[0][i]) + ' at random. What is the probability they ' + S[3] + ' ' + B(S[1][j]) + '?' : 'Pick one of the ' + S[2] + ' who ' + S[3] + ' ' + B(S[1][j]) + ' at random. What is the probability they are ' + B(S[0][i]) + '?';
      const notQ = d === 2 && R.chance(.5);
      if (notQ) { const oth = byRow ? cells[i][1 - j] : cells[1 - i][j];
        return { text: (byRow ? 'Pick one of the ' + B(S[0][i]) + ' at random. What is the probability they do ' + B('not') + ' ' + S[3] + ' ' + S[1][j] + '?' : 'Pick one of the ' + S[2] + ' who ' + S[3] + ' ' + B(S[1][j]) + '. What is the probability they are ' + B('not') + ' ' + S[0][i] + '?') + ' Give a fraction in lowest terms.', vis, ans: F(oth, bot), type: 'frac', low: true,
          how: [W('only the ' + (byRow ? S[0][i] : S[2] + ' who ' + S[3] + ' ' + S[1][j]) + ': ' + bot, '"given" means just this ' + (byRow ? 'row' : 'column')), W('of those, how many do not: ' + oth, 'the other cell in that ' + (byRow ? 'row' : 'column')), gcd(oth, bot) > 1 ? 'P = ' + fl(oth, bot) : 'P = ' + B(fr(oth, bot))].concat(lowL(oth, bot)),
          steps: [{ text: 'How many are in the "given" group?', ans: bot }, { text: 'How many of them do not?', ans: oth }, { text: 'The probability, lowest terms:', ans: F(oth, bot), type: 'frac', low: true }],
          traps: [tr(F(top, bot), 'd_complement', 'That is the chance they do. You want the rest of the group.'), tr(F(oth, T), 'd_condprob', '"Given" means only that group goes on the bottom, not everyone.')] }; }
      return { text: q + ' Give a fraction in lowest terms.', vis, ans, type: 'frac', low: true,
        how: [W('the group: ' + bot, '"given" means only look at this ' + (byRow ? 'row' : 'column') + ' total'), W('of those, how many ' + ev + ': ' + top, 'the cell where they meet'), gcd(top, bot) > 1 ? 'P = ' + fl(top, bot) : 'P = ' + B(fr(top, bot))].concat(lowL(top, bot)),
        steps: [{ text: 'How many are in the "given" group?', ans: bot }, { text: 'How many of them ' + ev + '?', ans: top }, { text: 'The probability, lowest terms:', ans, type: 'frac', low: true }],
        traps: [tr(F(top, T), 'd_condprob', '"Given" means only that group goes on the bottom, not everyone.'), tr(F(top, byRow ? cells[0][j] + cells[1][j] : cells[i][0] + cells[i][1]), 'd_condprob', 'You used the wrong total: the bottom is the group you are told about.'), tr(F(byRow ? cells[0][j] + cells[1][j] : cells[i][0] + cells[i][1], T), 'd_prob', 'That ignores the "given" part.')] };
    }
    const s = R.i(4, 10), conds = [['both dice are even', (a, b) => a % 2 === 0 && b % 2 === 0], ['a 6 is showing', (a, b) => a === 6 || b === 6], ['the two dice match', (a, b) => a === b], ['at least one die is odd', (a, b) => a % 2 === 1 || b % 2 === 1]];
    const [cn, cf] = R.pick(conds), all = []; for (let a = 1; a <= 6; a++) { const b = s - a; if (b >= 1 && b <= 6) all.push([a, b]); }
    const fav = all.filter(p => cf(p[0], p[1])); if (!fav.length || fav.length === all.length) return null; const ans = F(fav.length, all.length);
    return { text: 'You roll two dice. ' + B('Given') + ' that the total is ' + B(s) + ', what is the probability that ' + B(cn) + '? Give a fraction in lowest terms.', ans, type: 'frac', low: true,
      how: [W(all.map(p => p.join('+')).join(', '), 'only rolls with total ' + s + ': ' + all.length), W(fav.map(p => p.join('+')).join(', '), 'of those, ' + cn + ': ' + fav.length), gcd(fav.length, all.length) > 1 ? 'P = ' + fl(fav.length, all.length) : 'P = ' + B(fr(fav.length, all.length))].concat(lowL(fav.length, all.length)),
      steps: [{ text: 'How many rolls make a total of ' + s + '?', ans: all.length }, { text: 'How many of those have this: ' + cn + '?', ans: fav.length }, { text: 'The probability, lowest terms:', ans, type: 'frac', low: true }],
      traps: [tr(F(fav.length, 36), 'd_condprob', 'Given the total is ' + s + ', only those ' + all.length + ' rolls count, not all 36.'), tr(F(fav.length, all.length - fav.length), 'd_prob', 'The bottom is all ' + all.length + ' rolls with total ' + s + '.')] };
  } },

/*@@MORE@@*/
];
/* drop empty traps, repeated trap values and values nobody would type (long decimals) before the game sees them */
DEFS.forEach(c => { const g = c.gen; c.gen = (d, R) => { const p = g(d, R); if (p && p.traps) { const seen = new Set(); p.traps = p.traps.filter(t => { if (!t || t.v == null) return false; if (typeof t.v === 'number' && (!isFinite(t.v) || !isInt(t.v * 100))) return false; const k = JSON.stringify(t.v); if (seen.has(k)) return false; seen.add(k); return true; }); } return p; }; });
C.defs(DEFS);
})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
