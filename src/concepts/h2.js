/* h2.js: the Common Core high school (+) standards that no concept practised yet: complex numbers (conjugates,
   division, polar form, distance), sums of squares with i, rational expressions, vectors (components, adding,
   subtracting, scaling, lengths, velocity), matrices (scaling, adding, multiplying, matrix times vector, determinant as
   area, inverses), inverse functions from tables and restricted domains, the angle addition formulas, the laws of sines
   and cosines, ellipses and hyperbolas from their foci, two draws without putting back, and expected value from data
   and for choosing a plan. Every concept lists its standard codes in cc. Most are pencil and paper: the how lines are a
   model written solution, one line per written line, and the steps follow the same lines with the same numbers. */
(function (C) {
'use strict';
const { B, num, MINUS, frac, pw, rt, DEG, reduce, gcd, signed, par2, poly, term, table, plotSVG, sum } = C;
const M = ' ' + MINUS + ' ';
const tr = (v, c, why) => ({ v, c, why });
const st = (text, ans, o) => Object.assign({ text, ans }, o || {});
const Q = (a, b) => { const [x, y] = reduce(a, b); return { n: x, d: y }; };          /* an exact fraction answer */
const fr = (a, b) => { const [x, y] = reduce(a, b); return frac(x, y); };             /* a fraction shown in lowest terms */
const fq = q => fr(q.n, q.d);
const fs = (t, b) => '<span class="fr"><span class="fr-n">' + t + '</span><span class="fr-d">' + b + '</span></span>';
const W = (work, note) => work + (note ? ' &nbsp; (' + note + ')' : '');            /* a written line and its reason */
const FT = { type: 'frac' };
const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
const nz = (R, lo, hi) => { let v; do { v = R.i(lo, hi); } while (v === 0); return v; };
const pm = R => (R.chance(.5) ? 1 : -1);
const I2 = pw('i', 2), GE = '≥', LE = '≤', GT = '&gt;';
const sq = v => pw(par2(v), 2);                                                       /* 5², (−3)² */
const sqS = s => pw('(' + s + ')', 2);                                                /* (2√3)² */
/* a sum of terms: terms([[3,'x'],[-2,''],[1,'i']]) is "3x − 2 + i"; zero terms drop out */
function terms(list) {
  const t = list.filter(x => x[0] !== 0);
  if (!t.length) return '0';
  return t.map((x, i) => { const c = x[0], tag = x[1] || '', body = (tag && Math.abs(c) === 1 ? '' : num(Math.abs(c))) + tag;
    return i === 0 ? (c < 0 ? MINUS : '') + body : (c < 0 ? M : ' + ') + body; }).join('');
}
const cx = (a, b) => terms([[a, ''], [b, 'i']]);                                       /* a + bi */
const cxp = (a, b) => '(' + cx(a, b) + ')';
const iS = q => (q === 1 ? '' : num(q)) + 'i';                                         /* 3i, i (q > 0) */
const rad = (k, r) => (k === 0 ? '0' : r === 1 ? num(k) : (k === 1 ? '' : k === -1 ? MINUS : num(k)) + rt(r));   /* k√r */
const vec = (...v) => '⟨' + v.map(num).join(', ') + '⟩';
const pt = (x, y) => '(' + num(x) + ', ' + num(y) + ')';
const rowS = r => '(' + r.map(num).join(', ') + ')';
const rowsT = A => A.length === 2 ? rowS(A[0]) + ' and ' + rowS(A[1]) : A.slice(0, -1).map(rowS).join(', ') + ' and ' + rowS(A[A.length - 1]);
const mat = A => '<table class="io">' + A.map(r => '<tr>' + r.map(v => '<td>' + (typeof v === 'number' ? num(v) : v) + '</td>').join('') + '</tr>').join('') + '</table>';
const TRI = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25], [20, 21, 29]];
function triple(R, k) { const t = R.pick(TRI.slice(0, k || TRI.length)), sw = R.chance(.5); return [sw ? t[1] : t[0], sw ? t[0] : t[1], t[2]]; }
/* traps: drop empty or broken values, numbers nobody would type, and repeats */
function TR(list) {
  const seen = new Set();
  return list.filter(t => {
    if (!t || t.v == null) return false; const v = t.v;
    if (typeof v === 'number' && (!isFinite(v) || !isInt(v * 100))) return false;
    if (typeof v === 'object' && !(Number.isInteger(v.n) && Number.isInteger(v.d) && v.d !== 0)) return false;
    const k = typeof v === 'object' ? (v.n / v.d).toFixed(9) : (+v).toFixed(9);
    if (seen.has(k)) return false; seen.add(k); return true;
  });
}
/* exact sin and cos of the special angles: {k, r, d} is k√r/d (k is 0, 1 or −1) */
function tv(fn, t) {
  t = ((t % 360) + 360) % 360;
  const ref = t <= 90 ? t : t <= 180 ? 180 - t : t <= 270 ? t - 180 : 360 - t;
  const base = { 0: [[1, 1, 1], [0, 1, 1]], 30: [[1, 3, 2], [1, 1, 2]], 45: [[1, 2, 2], [1, 2, 2]], 60: [[1, 1, 2], [1, 3, 2]], 90: [[0, 1, 1], [1, 1, 1]] }[ref];
  const v = fn === 'cos' ? base[0] : base[1], s = fn === 'cos' ? (t > 90 && t < 270 ? -1 : 1) : (t > 180 ? -1 : 1);
  return { k: s * v[0], r: v[1], d: v[2] };
}
const tvS = v => (v.k === 0 ? '0' : (v.k < 0 ? MINUS : '') + (v.d === 1 ? rad(1, v.r) : fs(rad(1, v.r), v.d)));
const tvP = v => (v.k < 0 ? '(' + tvS(v) + ')' : tvS(v));
const quarterOf = (sa, sb) => (sa > 0 ? (sb > 0 ? 1 : 4) : (sb > 0 ? 2 : 3));
const angleIn = (q, ref) => [0, ref, 180 - ref, 180 + ref, 360 - ref][q];
const angleHow = (q, ref) => [0, ref + DEG, '180° ' + MINUS + ' ' + ref + DEG, '180° + ' + ref + DEG, '360° ' + MINUS + ' ' + ref + DEG][q];
/* a complex quotient re/D + (im/D)i, shown with fractions */
function cxq(re, im, D) {
  const r = Q(re, D), m = Q(Math.abs(im), D), mS = (m.n === 1 && m.d === 1 ? '' : fq(m)) + 'i';
  if (im === 0) return fq(r);
  if (re === 0) return (im < 0 ? MINUS : '') + mS;
  return fq(r) + (im < 0 ? M : ' + ') + mS;
}

const DEFS = [
/* ======================= Complex numbers ======================= */
{ id: 'x_cfactor', s: 'alg', g: 11, title: 'Factor sums of squares with i', paper: true, cc: ['N-CN.C.8'],
  tip: 'A sum of squares factors with i: x² + 49 = (x + 7i)(x − 7i), since (7i)² = −49. For x² + 2x + 10, complete the square: (x + 1)² + 9 = (x + 1 + 3i)(x + 1 − 3i).',
  gen(d, R) {
    if (d === 0) {
      const k = R.i(2, 12), c = k * k;
      return { text: B(poly([1, 0, c]) + ' = (x + ki)(x' + M + 'ki)') + ' with k ' + GT + ' 0. What is k?', ans: k,
        how: [W(poly([1, 0, c]) + ' = ' + pw('x', 2) + M + sqS(iS(k)), sqS(iS(k)) + ' = ' + c + I2 + ' = ' + num(-c) + ', so taking it away adds ' + c),
          W('= (x + ' + iS(k) + ')(x' + M + iS(k) + ')', 'difference of squares: p² − q² = (p + q)(p − q)'), 'k = ' + B(k)],
        steps: [st('What is ' + B(sqS(iS(k))) + '? (' + I2 + ' = ' + MINUS + '1)', -c), st(B(c) + ' is the square of which positive number?', k)],
        traps: TR([tr(c, 'w_roots', 'k is the number whose square is ' + c + ': take the square root.'), tr(c / 2, 'x_cfactor', '(ki)² must give ' + MINUS + c + ', so k² = ' + c + '.'), tr(-k, 'x_cfactor', 'The question asks for the positive k.')]) };
    }
    if (d === 1) {
      const askK = R.chance(.6), m = R.i(2, 5), q = R.i(askK ? 2 : 1, 9), c2 = m * m, k2 = q * q, mx = m + 'x';
      if (gcd(m, q) > 1 && R.chance(.7)) return null;
      return { text: B(poly([c2, 0, k2]) + ' = (' + (askK ? mx : 'mx') + ' + ' + (askK ? 'ki' : iS(q)) + ')(' + (askK ? mx : 'mx') + M + (askK ? 'ki' : iS(q)) + ')') + ' with ' + (askK ? 'k' : 'm') + ' ' + GT + ' 0. What is ' + B(askK ? 'k' : 'm') + '?', ans: askK ? q : m,
        how: [W(poly([c2, 0, k2]) + ' = ' + sqS(mx) + M + sqS(iS(q)), sqS(mx) + ' = ' + c2 + pw('x', 2) + ' and ' + sqS(iS(q)) + ' = ' + num(-k2)),
          W('= (' + mx + ' + ' + iS(q) + ')(' + mx + M + iS(q) + ')', 'difference of squares'), (askK ? 'k = ' : 'm = ') + B(askK ? q : m)],
        steps: [st(B(c2 + pw('x', 2)) + ' is the square of (?x). What number goes in front of x?', m), st(B(k2) + ' is the square of which positive number?', q)],
        traps: TR(askK ? [tr(k2, 'w_roots', 'k is the square root of ' + k2 + '.'), tr(m, 'x_cfactor', 'k goes with i: it comes from the ' + k2 + ', not from the ' + c2 + pw('x', 2) + '.')]
          : [tr(c2, 'w_roots', 'm is the square root of ' + c2 + '.'), tr(q, 'x_cfactor', 'm goes with x: it comes from the ' + c2 + pw('x', 2) + '.')]) };
    }
    const h = nz(R, -6, 6), q = R.i(1, 7), c0 = h * h + q * q, askQ = R.chance(.6), xb = 'x ' + signed(-h);
    return { text: B(poly([1, -2 * h, c0]) + ' = (x' + M + 'p' + M + 'qi)(x' + M + 'p + qi)') + ' with q ' + GT + ' 0. What is ' + B(askQ ? 'q' : 'p') + '?', ans: askQ ? q : h,
      how: [W(poly([1, -2 * h, c0]) + ' = ' + sqS(xb) + ' + ' + q * q, 'complete the square: half of ' + num(-2 * h) + ' is ' + num(-h) + ', ' + sq(-h) + ' = ' + h * h + ', and ' + c0 + M + h * h + ' = ' + q * q),
        W('= ' + sqS(xb) + M + sqS(iS(q)), sqS(iS(q)) + ' = ' + num(-q * q)),
        W('= (' + xb + M + iS(q) + ')(' + xb + ' + ' + iS(q) + ')', 'difference of squares'),
        askQ ? 'q = ' + B(q) : W('p = ' + B(num(h)), 'x − p is ' + xb)],
      steps: [st('Complete the square: ' + B(poly([1, -2 * h, c0]) + ' = ' + sqS(xb) + ' + ?'), q * q), askQ ? st(B(q * q) + ' = ' + pw('q', 2) + '. What is q?', q) : st('x − p = ' + B(xb) + '. What is p?', h)],
      traps: TR(askQ ? [tr(q * q, 'w_roots', 'That is ' + pw('q', 2) + '. Take the square root.'), tr(Math.abs(h), 'x_complete', 'q comes from what is left after completing the square.'), tr(c0, 'x_complete', 'Complete the square first: take ' + h * h + ' off ' + c0 + '.')]
        : [tr(-h, 'x_complete', 'x − p = ' + xb + ', so p has the opposite sign of the number in the bracket.'), tr(-2 * h, 'x_complete', 'p is half of the x-coefficient, with its sign flipped.'), tr(2 * h, 'x_complete', 'Halve the x-coefficient.')]) };
  } },

{ id: 'x_ratops', s: 'alg', g: 11, title: 'Add and multiply rational expressions', pre: ['f_addunlike'], paper: true, cc: ['A-APR.D.7'],
  tip: 'Work like fractions. To add, use a common bottom and rewrite each top: 1/(x − 1) + 2/(x + 1) has top (x + 1) + 2(x − 1) = 3x − 1. To multiply, factor and cancel; to divide, flip the second.',
  gen(d, R) {
    const xb = v => 'x ' + signed(v);
    if (d < 2) {
      const a = nz(R, -6, 6), b = nz(R, -6, 6); if (a === b) return null;
      const p = R.i(1, d === 0 ? 4 : 6), q = R.i(1, d === 0 ? 4 : 6), sub = d === 1 && R.chance(.6);
      if (sub && p === q) return null;
      const sg = sub ? -1 : 1, m = p + sg * q, k = p * b + sg * q * a; if (k === 0) return null;
      const askK = R.chance(.65), ans = askK ? k : m, bot = '(' + xb(a) + ')(' + xb(b) + ')', op = sub ? M : ' + ';
      return { text: B(fs(p, xb(a)) + op + fs(q, xb(b)) + ' = ' + fs('mx + k', bot)) + '. What is ' + B(askK ? 'k' : 'm') + '?', ans,
        how: [W('common bottom: ' + bot, 'each bottom is missing the other bracket'),
          W('top = ' + p + '(' + xb(b) + ')' + op + q + '(' + xb(a) + ')', 'times each top by the bracket its bottom is missing'),
          W('= ' + terms([[p, 'x'], [p * b, ''], [sg * q, 'x'], [sg * q * a, '']]), sub ? 'the minus goes to both terms of the second top' : 'multiply out'),
          W('= ' + terms([[m, 'x'], [k, '']]) + ', so ' + (askK ? 'k' : 'm') + ' = ' + B(num(ans)), 'collect the x terms and the numbers')],
        steps: [st('Multiply out ' + B(p + '(' + xb(b) + ')') + '. What is the number term?', p * b), st('Multiply out ' + B((sub ? MINUS : '') + q + '(' + xb(a) + ')') + '. What is the number term?', sg * q * a), st((askK ? 'k' : 'm') + ' = ?', ans)],
        traps: TR(askK ? [sub ? tr(p * b + q * a, 'x_distribute', 'The minus sign goes to every term of the second top.') : null, tr(p * a + sg * q * b, 'x_ratops', 'Each top is multiplied by the OTHER fraction\'s bracket.'), tr(a + b, 'x_ratops', 'Multiply out the tops: ' + p + '(' + xb(b) + ') and ' + q + '(' + xb(a) + ').')]
          : [sub ? tr(p + q, 'x_distribute', 'The minus sign goes to the x term of the second top too.') : null, tr(p * q, 'x_ratops', 'The x terms add: ' + term(p, 'x') + ' and ' + term(q, 'x') + '.')]) };
    }
    const [p, q, r, s] = R.shuffle([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]).slice(0, 4), X = R.i(1, 10);
    if ([p, q, r, s].some(v => X + v === 0)) return null;
    const div = R.chance(.5), top1 = poly([1, p + q, p * q]), bot1 = poly([1, r + s, r * s]), ans = Q(X + q, X + s);
    const expr = fs(top1, bot1) + (div ? ' ÷ ' + fs(xb(p), xb(r)) : ' × ' + fs(xb(r), xb(p)));
    const last = gcd(X + q, X + s) === 1 && X + s > 0 ? [W('= ' + B(fq(ans)), 'put in x = ' + X)] : [W('= ' + fs(num(X + q), num(X + s)), 'put in x = ' + X), '= ' + B(fq(ans))];
    return { text: 'Simplify ' + B(expr) + ', then find its value at ' + B('x = ' + X) + '. (A fraction is fine.)', ans, type: 'frac',
      how: [W('= ' + fs('(' + xb(p) + ')(' + xb(q) + ')', '(' + xb(r) + ')(' + xb(s) + ')') + ' × ' + fs(xb(r), xb(p)), div ? 'factor, then flip the second fraction and multiply' : 'factor the top and the bottom'),
        W('= ' + fs(xb(q), xb(s)), 'cancel (' + xb(p) + ') and (' + xb(r) + ')')].concat(last),
      steps: [st('Factor the top: ' + B(top1 + ' = (' + xb(p) + ')(x + ?)'), q), st('Factor the bottom: ' + B(bot1 + ' = (' + xb(r) + ')(x + ?)'), s), st('After cancelling you have (' + xb(q) + ') over (' + xb(s) + '). Its value at x = ' + X + '?', ans, FT)],
      traps: TR([tr(Q(X + s, X + q), 'x_rational', 'The top stays on top: (' + xb(q) + ') over (' + xb(s) + ').'),
        div ? tr(Q((X + p) * (X + p) * (X + q), (X + r) * (X + r) * (X + s)), 'f_divfrac', 'To divide, flip the second fraction first, then multiply.') : tr(Q((X + p) * (X + q), (X + r) * (X + s)), 'x_ratops', 'Multiply by the second fraction too, then cancel.')]) };
  } },

{ id: 'x_conjugate', s: 'alg', g: 12, title: 'Divide complex numbers: the conjugate', pre: ['r_pyth'], paper: true, cc: ['N-CN.A.3'],
  tip: 'The conjugate of a + bi is a − bi, and (a + bi)(a − bi) = a² + b². To divide, times top and bottom by the bottom\'s conjugate. The modulus |a + bi| is √(a² + b²).',
  gen(d, R) {
    if (d === 0) {
      if (R.chance(.5)) {
        const [p, q, r] = triple(R, 5), a = p * pm(R), b = q * pm(R);
        return { text: 'What is the modulus ' + B('|' + cx(a, b) + '|') + '?', ans: r,
          how: [W('|' + cx(a, b) + '| = ' + rt(sq(a) + ' + ' + sq(b)), 'the modulus is the distance from 0: √(a² + b²)'), '= ' + rt(a * a + ' + ' + b * b) + ' = ' + rt(r * r), '= ' + B(r)],
          steps: [st(B(sq(a) + ' + ' + sq(b)) + ' = ?', r * r), st('What is ' + B(rt(r * r)) + '?', r)],
          traps: TR([tr(Math.abs(a) + Math.abs(b), 'r_pyth', 'Square both parts, add, then take the square root.'), tr(r * r, 'w_roots', 'That is the modulus squared. Take the square root.'), tr(Math.abs(a * a - b * b), 'x_conjugate', 'Add the squares: a² + b².')]) };
      }
      const a = nz(R, -9, 9), b = nz(R, -9, 9), ans = a * a + b * b;
      return { text: 'Multiply ' + B(cx(a, b)) + ' by its conjugate. What plain number do you get?', ans,
        how: [W('the conjugate of ' + cx(a, b) + ' is ' + cx(a, -b), 'change the sign of the i part only'),
          W(cxp(a, b) + cxp(a, -b) + ' = ' + sq(a) + M + sqS(cx(0, b)), '(p + q)(p − q) = p² − q²'),
          W('= ' + a * a + M + '(' + num(-b * b) + ')', sqS(cx(0, b)) + ' = ' + b * b + I2 + ' = ' + num(-b * b)), '= ' + a * a + ' + ' + b * b + ' = ' + B(ans)],
        steps: [st(B(sq(a)) + ' = ?', a * a), st(B(sqS(cx(0, b))) + ' = ? (' + I2 + ' = ' + MINUS + '1)', -b * b), st(B(a * a + M + '(' + num(-b * b) + ')') + ' = ?', ans)],
        traps: TR([tr(a * a - b * b, 'x_complex', I2 + ' = ' + MINUS + '1, so ' + sqS(cx(0, b)) + ' is negative, and taking it away adds.'), tr(2 * a, 'x_conjugate', 'Multiply the two numbers; adding them gives ' + num(2 * a) + '.')]) };
    }
    const c = nz(R, -3, d === 1 ? 3 : 4), e = nz(R, -3, d === 1 ? 3 : 4), D = c * c + e * e;
    let a, b;
    if (d === 1) { const u = nz(R, -5, 5), v = nz(R, -5, 5); a = u * c - v * e; b = u * e + v * c; if (!a || !b) return null; }
    else if (R.chance(.3)) { a = R.i(1, 9); b = 0; } else { a = nz(R, -9, 9); b = nz(R, -9, 9); }
    const re = a * c + b * e, im = b * c - a * e; if (d === 2 && isInt(re / D) && isInt(im / D)) return null;
    const askRe = R.chance(.5), ans = Q(askRe ? re : im, D), val = q => (d === 2 ? q : q.n / q.d), L = askRe ? 'p' : 'q';
    const top = (b ? cxp(a, b) : num(a)) + cxp(c, -e), topX = terms([[a * c, ''], [-a * e, 'i'], [b * c, 'i'], [-b * e, I2]]);
    const p = { text: 'Divide: ' + B(fs(cx(a, b), cx(c, e)) + ' = p + qi') + '. What is ' + B(L) + '?' + (d === 2 ? ' (A fraction is fine.)' : ''), ans: val(ans),
      how: [W(fs(cx(a, b), cx(c, e)) + ' × ' + fs(cx(c, -e), cx(c, -e)), 'times top and bottom by the conjugate of the bottom'),
        W('bottom: ' + cxp(c, e) + cxp(c, -e) + ' = ' + sq(c) + ' + ' + sq(e) + ' = ' + D, '(a + bi)(a − bi) = a² + b²'),
        W('top: ' + top + ' = ' + topX + (b ? ' = ' + cx(re, im) : ''), b ? 'multiply out; ' + I2 + ' = ' + MINUS + '1' : 'multiply out'),
        W(fs(cx(re, im), D) + ' = ' + cxq(re, im, D) + ', so ' + L + ' = ' + B(fq(ans)), 'divide both parts by ' + D)],
      steps: [st('Bottom: ' + B(cxp(c, e) + cxp(c, -e)) + ' = ?', D), st('Top: ' + B(top) + ' = r + si. What is ' + (askRe ? 'r' : 's') + '?', askRe ? re : im), st(L + ' = ?', val(ans), d === 2 ? FT : {})],
      traps: TR([tr(val(Q(askRe ? re : im, 1)), 'x_conjugate', 'Divide the top by the bottom, ' + D + '.'),
        c * c !== e * e ? tr(val(Q(askRe ? re : im, c * c - e * e)), 'x_complex', sqS(cx(0, e)) + ' is negative, so the bottom is ' + sq(c) + ' + ' + sq(e) + ' = ' + D + '.') : null,
        askRe ? tr(val(Q(a * c - b * e, D)), 'x_complex', 'The ' + I2 + ' term changes sign, since ' + I2 + ' = ' + MINUS + '1.') : tr(val(Q(-im, D)), 'x_conjugate', 'Use the conjugate ' + cx(c, -e) + ': only the sign of the i part changes.'),
        askRe ? tr(val(Q(a, c)), 'x_conjugate', 'You cannot divide part by part. Times by the conjugate first.') : (b ? tr(val(Q(b, e)), 'x_conjugate', 'You cannot divide part by part. Times by the conjugate first.') : null)]) };
    if (d === 2) p.type = 'frac';
    return p;
  } },

{ id: 'x_cdist', s: 'alg', g: 12, title: 'Distance between complex numbers', pre: ['r_dist'], cc: ['N-CN.B.6'],
  tip: 'The distance between two complex numbers is the modulus of their difference: |(5 + 2i) − (1 − i)| = |4 + 3i| = 5. The midpoint is their average: add them, then halve.',
  gen(d, R) {
    const distP = (k, lim) => {
      const [dx, dy, c] = triple(R, k), x2 = R.i(-lim, lim), y2 = R.i(-lim, lim), x1 = x2 + pm(R) * dx, y1 = y2 + pm(R) * dy;
      if (Math.abs(x1) > 15 || Math.abs(y1) > 15) return null;
      const ddx = x1 - x2, ddy = y1 - y2, slip = (x1 + x2) * (x1 + x2) + (y1 + y2) * (y1 + y2), sr = Math.round(Math.sqrt(slip));
      return { text: 'How far apart are ' + B(cx(x1, y1)) + ' and ' + B(cx(x2, y2)) + ' in the complex plane?', ans: c,
        how: [W(cxp(x1, y1) + M + cxp(x2, y2) + ' = ' + cx(ddx, ddy), 'subtract real parts and i parts'), W('|' + cx(ddx, ddy) + '| = ' + rt(sq(ddx) + ' + ' + sq(ddy)) + ' = ' + rt(c * c), 'distance = modulus of the difference'), '= ' + B(c)],
        steps: [st('Real part of ' + B(cxp(x1, y1) + M + cxp(x2, y2)) + '?', ddx), st('The number in front of i in that difference?', ddy), st('Distance = ' + B(rt(sq(ddx) + ' + ' + sq(ddy))) + ' = ?', c)],
        traps: TR([tr(Math.abs(ddx) + Math.abs(ddy), 'r_pyth', 'Square the two parts, add, then take the square root.'), tr(c * c, 'w_roots', 'That is the distance squared. Take the square root.'), (x2 < 0 || y2 < 0) && sr * sr === slip ? tr(sr, 'n_intsub', 'Taking away a negative part adds.') : null]) };
    };
    const mid = () => {
      const x1 = R.i(-9, 9), y1 = R.i(-9, 9), x2 = x1 + 2 * R.i(-6, 6), y2 = y1 + 2 * nz(R, -6, 6), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, askRe = R.chance(.5), ans = askRe ? mx : my;
      const part = askRe ? 'real part' : 'number in front of i';
      return { text: 'What is the ' + part + ' of the midpoint of ' + B(cx(x1, y1)) + ' and ' + B(cx(x2, y2)) + '?', ans,
        how: [W('midpoint = ' + fs(cxp(x1, y1) + ' + ' + cxp(x2, y2), 2), 'the average of the two numbers'), '= ' + fs(cx(x1 + x2, y1 + y2), 2) + ' = ' + cx(mx, my), W(part + ' = ' + B(num(ans)))],
        steps: [st('Add them. The ' + part + ' of the sum?', askRe ? x1 + x2 : y1 + y2), st('Halve it:', ans)],
        traps: TR([tr(askRe ? x1 + x2 : y1 + y2, 'x_midpoint', 'Halve the sum to get the midpoint.'), tr(askRe ? (x2 - x1) / 2 : (y2 - y1) / 2, 'x_midpoint', 'Add the two numbers, then halve.'), tr(askRe ? my : mx, 'x_cdist', 'The real part is the plain number; the i part is the number in front of i.')]) };
    };
    const endP = () => {
      const x1 = R.i(-9, 9), y1 = R.i(-9, 9), mx = R.i(-6, 6), my = R.i(-6, 6), x2 = 2 * mx - x1, y2 = 2 * my - y1; if (x1 === x2 && y1 === y2) return null;
      const askRe = R.chance(.5), ans = askRe ? x2 : y2, part = askRe ? 'real part' : 'number in front of i';
      return { text: 'The midpoint of ' + B(cx(x1, y1)) + ' and w is ' + B(cx(mx, my)) + '. What is the ' + part + ' of w?', ans,
        how: [W('w = 2 × (' + cx(mx, my) + ')' + M + cxp(x1, y1), 'midpoint = (z + w) ÷ 2, so w = 2 × midpoint − z'), '= ' + cxp(2 * mx, 2 * my) + M + cxp(x1, y1) + ' = ' + cx(x2, y2), part + ' = ' + B(num(ans))],
        steps: [st('Double the midpoint. The ' + part + '?', askRe ? 2 * mx : 2 * my), st('Take away ' + B(cx(x1, y1)) + '. The ' + part + '?', ans)],
        traps: TR([tr(askRe ? mx - x1 : my - y1, 'x_midpoint', 'The midpoint is halfway, so double it before taking away.'), tr(askRe ? (mx + x1) / 2 : (my + y1) / 2, 'x_midpoint', 'w is past the midpoint, as far again: w = 2 × midpoint − z.'), tr(askRe ? 2 * mx + x1 : 2 * my + y1, 'n_intsub', 'Take away ' + cx(x1, y1) + ' from twice the midpoint.')]) };
    };
    if (d === 0) return distP(3, 6);
    if (d === 1) return R.chance(.5) ? mid() : distP(5, 8);
    return R.chance(.5) ? endP() : distP(8, 9);
  } },

{ id: 'x_polar', s: 'alg', g: 12, title: 'Polar form of a complex number', pre: ['r_unit'], paper: true, cc: ['N-CN.B.4'],
  tip: 'a + bi = r(cos θ + i sin θ): r = √(a² + b²) is the length and θ the angle from the positive real axis. Going back: a = r cos θ and b = r sin θ.',
  gen(d, R) {
    const sqX = s => (/√|−/.test(s) ? sqS(s) : pw(s, 2));
    const p2r = (t, r) => {
      const cv = tv('cos', t), sv = tv('sin', t), a = r * cv.k / cv.d, b = r * sv.k / sv.d, ra = cv.r, rb = sv.r;
      const form = (ra === 1 ? 'a' : 'a' + rt(ra)) + ' + ' + (rb === 1 ? 'b' : 'b' + rt(rb)) + 'i';
      const opts = []; if (a) opts.push('a'); if (b) opts.push('b');
      const ask = R.pick(opts), ans = ask === 'a' ? a : b, v = ask === 'a' ? cv : sv, fn = ask === 'a' ? 'cos' : 'sin', other = ask === 'a' ? b : a;
      const zS = terms([[a, ra === 1 ? '' : rt(ra)], [b, (rb === 1 ? '' : rt(rb)) + 'i']]), ref = t % 90 === 0 ? 0 : t < 90 ? t : t < 180 ? 180 - t : t < 270 ? t - 180 : 360 - t;
      return { text: 'Write ' + B(r + '(cos ' + t + DEG + ' + i sin ' + t + DEG + ')') + ' in the form ' + B(form) + '. What is ' + B(ask) + '?', ans,
        how: [W('real part: ' + r + ' × cos ' + t + DEG + ' = ' + r + ' × ' + tvP(cv) + ' = ' + rad(a, ra), 'r cos θ'),
          W('i part: ' + r + ' × sin ' + t + DEG + ' = ' + r + ' × ' + tvP(sv) + ' = ' + rad(b, rb), 'r sin θ'),
          'z = ' + zS + ', so ' + ask + ' = ' + B(num(ans))],
        steps: [ref ? st('What is the reference angle of ' + B(t + DEG) + ' (its angle to the x-axis)?', ref) : st('What is ' + B(fn + ' ' + t + DEG) + '?', v.k), st(B(r + ' × ' + fn + ' ' + t + DEG) + (v.r === 1 ? ' = ?' : ' = ' + ask + rt(v.r) + '. What is ' + ask + '?'), ans)],
        traps: TR([other ? tr(other, 'r_unit', 'The real part uses cos and the i part uses sin.') : null, tr(-ans, 'r_unit', 'Check the sign of ' + fn + ' ' + t + '° from its quarter.'), tr(r, 'x_polar', 'Multiply r by ' + fn + ' ' + t + '°.')]) };
    };
    const r2p = (fam, askR) => {
      if (fam === 'axis') {
        const t = R.pick([0, 90, 180, 270]), k = R.i(2, 9), a = k * tv('cos', t).k, b = k * tv('sin', t).k;
        const where = { 0: 'on the positive real axis', 90: 'straight up, on the positive imaginary axis', 180: 'on the negative real axis', 270: 'straight down, on the negative imaginary axis' }[t];
        return { text: 'Write ' + B(cx(a, b)) + ' as ' + B('r(cos θ + i sin θ)') + ' with r ' + GT + ' 0 and θ from 0° to 360°. What is θ?', ans: t, unit: DEG,
          how: [W('r = ' + k, 'the distance from 0'), W(cx(a, b) + ' is ' + where, 'plot it'), 'θ = ' + B(t) + DEG],
          steps: [st('What is r?', k), st('θ = ?', t)],
          traps: TR([tr(t === 270 ? -90 : null, 'x_polar', 'Give θ from 0° to 360°: go the long way round.'), tr(t === 90 ? 270 : t === 270 ? 90 : t === 0 ? 180 : 0, 'r_unit', 'Angles start on the positive real axis and turn anticlockwise.')]) };
      }
      const k = R.i(1, d === 1 ? 5 : 6), sa = pm(R), sb = pm(R), ref = +fam;
      const aS = fam === '30' ? rad(sa * k, 3) : num(sa * k), bS = fam === '60' ? rad(sb * k, 3) : num(sb * k);
      const absA = fam === '30' ? rad(k, 3) : num(k), absB = fam === '60' ? rad(k, 3) : num(k);
      const a2 = fam === '30' ? 3 * k * k : k * k, b2 = fam === '60' ? 3 * k * k : k * k, r2 = a2 + b2;
      const zS = aS + (sb < 0 ? M : ' + ') + (absB === '1' ? '' : absB) + 'i', q = quarterOf(sa, sb), t = angleIn(q, ref);
      const tanS = fam === '45' ? '1' : fam === '60' ? rt(3) : fs(1, rt(3));
      if (askR) {
        const r = Math.round(Math.sqrt(r2)), sqr = r * r === r2;
        return { text: 'Write ' + B(zS) + ' as ' + B('r(cos θ + i sin θ)') + ' with r ' + GT + ' 0. What is ' + B(sqr ? 'r' : pw('r', 2)) + '?', ans: sqr ? r : r2,
          how: [W(pw('r', 2) + ' = ' + sqX(aS) + ' + ' + sqX(bS) + ' = ' + a2 + ' + ' + b2 + ' = ' + r2, pw('r', 2) + ' = ' + pw('a', 2) + ' + ' + pw('b', 2)), sqr ? 'r = ' + rt(r2) + ' = ' + B(r) : pw('r', 2) + ' = ' + B(r2)],
          steps: [st('What is ' + B(sqX(aS)) + '?', a2), st('What is ' + B(sqX(bS)) + '?', b2), st(sqr ? 'r = ?' : pw('r', 2) + ' = ?', sqr ? r : r2)],
          traps: TR([tr(sqr ? r2 : Math.round(Math.sqrt(r2) * 100) / 100, sqr ? 'w_roots' : 'x_polar', sqr ? 'That is ' + pw('r', 2) + '. Take the square root.' : 'The question asks for ' + pw('r', 2) + ', no square root needed.'), tr(2 * k, 'r_pyth', 'Square each part, then add.')]) };
      }
      const rS = fam === '45' ? rt(r2) + (k > 1 ? ' = ' + rad(k, 2) : '') : rt(r2) + ' = ' + 2 * k;
      const why = ['', 'both parts positive', 'real part negative, i part positive', 'both parts negative', 'real part positive, i part negative'][q];
      return { text: 'Write ' + B(zS) + ' as ' + B('r(cos θ + i sin θ)') + ' with r ' + GT + ' 0 and θ from 0° to 360°. What is θ?', ans: t, unit: DEG,
        how: [W('r = ' + rt(sqX(aS) + ' + ' + sqX(bS)) + ' = ' + rt(a2 + ' + ' + b2) + ' = ' + rS, 'r = √(a² + b²)'),
          W('tan(reference angle) = ' + fs(absB, absA) + ' = ' + tanS + ', so the reference angle is ' + ref + DEG, fam === '45' ? 'the 45–45–90 triangle' : 'the 30–60–90 triangle'),
          W('(' + aS + ', ' + bS + ') is in quarter ' + q + ', so θ = ' + (q === 1 ? '' : angleHow(q, ref) + ' = ') + B(t) + DEG, why)],
        steps: [st('What is the reference angle?', ref), st('Which quarter is the point (' + aS + ', ' + bS + ') in? Type 1, 2, 3 or 4.', q), st('θ = ?', t)],
        traps: TR([tr(ref, 'x_polar', 'That is the reference angle. The point is in quarter ' + q + '.'), tr(angleIn(q === 2 ? 4 : q === 4 ? 2 : q === 1 ? 3 : 1, ref), 'r_unit', 'Check the signs: the real part says left or right, the i part says up or down.'), ref !== 45 ? tr(angleIn(q, 90 - ref), 'r_ratio', 'tan of the angle is the i part over the real part: |b| over |a|.') : null]) };
    };
    if (d === 0) return p2r(R.pick([0, 90, 180, 270, 60, 120, 240, 300]), 2 * R.i(1, 6));
    if (d === 1) return R.chance(.75) ? r2p(R.pick(['45', '60', 'axis']), R.chance(.25)) : p2r(R.pick([45, 135, 225, 315]), 2 * R.i(1, 6));
    return R.chance(.65) ? r2p(R.pick(['30', '60', '45']), R.chance(.2)) : p2r(R.pick([30, 150, 210, 330, 120, 240]), 2 * R.i(1, 7));
  } },

{ id: 'x_polarmul', s: 'alg', g: 12, title: 'Multiply in polar: lengths ×, angles +', pre: ['w_exp'], paper: true, cc: ['N-CN.B.5'],
  tip: 'cis θ means cos θ + i sin θ. Multiply: lengths multiply, angles add, so (2 cis 40°)(3 cis 50°) = 6 cis 90°. Divide: lengths divide, angles subtract. Powers: (r cis θ)ⁿ = rⁿ cis nθ.',
  gen(d, R) {
    const cis = (r, t) => r + ' cis ' + t + DEG, note = ' (cis θ means cos θ + i sin θ.)';
    if (d === 0 || (d === 1 && R.chance(.4))) {
      const div = d === 1, r2 = R.i(2, div ? 6 : 9), qq = R.i(2, div ? 6 : 9), r1 = div ? r2 * qq : qq, t2 = 5 * R.i(2, 30), t1 = div ? t2 + 5 * R.i(2, 36) : 5 * R.i(2, 40);
      if (t1 >= 360 || (!div && t1 + t2 >= 360)) return null;
      const askR = R.chance(.5), rr = div ? qq : r1 * r2, tt = div ? t1 - t2 : t1 + t2, ans = askR ? rr : tt;
      const expr = div ? fs(cis(r1, t1), cis(r2, t2)) : '(' + cis(r1, t1) + ')(' + cis(r2, t2) + ')';
      const p = { text: B(expr + ' = r cis θ') + '. What is ' + B(askR ? 'r' : 'θ') + '?' + note, ans,
        how: [W('r = ' + r1 + (div ? ' ÷ ' : ' × ') + r2 + ' = ' + rr, div ? 'lengths divide' : 'lengths multiply'), W('θ = ' + t1 + DEG + (div ? M : ' + ') + t2 + DEG + ' = ' + tt + DEG, div ? 'angles subtract' : 'angles add'), askR ? 'r = ' + B(rr) : 'θ = ' + B(tt) + DEG],
        steps: [askR ? st(B(r1 + (div ? ' ÷ ' : ' × ') + r2) + ' = ?', rr) : st(B(t1 + DEG + (div ? M : ' + ') + t2 + DEG) + ' = ?', tt)],
        traps: TR(askR ? [tr(div ? r1 * r2 : r1 + r2, 'x_polarmul', div ? 'Dividing: the lengths divide.' : 'Lengths multiply; it is the angles that add.'), div ? tr(r1 - r2, 'x_polarmul', 'Dividing: the lengths divide, not subtract.') : null]
          : [tr(div ? t1 + t2 : Math.abs(t1 - t2), 'x_polarmul', div ? 'Dividing: the angles subtract.' : 'Multiplying: the angles add.'), div && t1 % t2 === 0 ? tr(t1 / t2, 'x_polarmul', 'Angles subtract; it is the lengths that divide.') : null]) };
      if (!askR) p.unit = DEG;
      return p;
    }
    if (d === 1) {
      const askR = R.chance(.5), r = askR ? R.pick([2, 2, 3]) : R.pick([1, 2, 3]), n = R.i(2, r === 3 ? 5 : r === 2 ? 6 : 8), t = 15 * R.i(1, 23), nt = n * t, m = nt % 360;
      if (m === 0) return null;
      const rn = Math.pow(r, n), ans = askR ? rn : m, red = nt >= 360 ? ', and ' + nt + DEG + M + (nt - m) + DEG + ' = ' + m + DEG : '';
      const p = { text: B(pw('(' + cis(r, t) + ')', n) + ' = r cis θ') + ' with θ from 0° to 360°. What is ' + B(askR ? 'r' : 'θ') + '?' + note, ans,
        how: [W('r = ' + pw(r, n) + ' = ' + rn, 'the length is multiplied by itself ' + n + ' times'), W('θ = ' + n + ' × ' + t + DEG + ' = ' + nt + DEG + red, 'the angle is added ' + n + ' times'), askR ? 'r = ' + B(rn) : 'θ = ' + B(m) + DEG],
        steps: askR ? [st(B(pw(r, n)) + ' = ?', rn)] : [st(B(n + ' × ' + t + DEG) + ' = ?', nt), st('Between 0° and 360°, that is?', m)],
        traps: TR(askR ? [tr(r * n, 'w_exp', pw(r, n) + ' means ' + r + ' multiplied by itself ' + n + ' times.'), tr(r, 'x_polarmul', 'The length is raised to the power ' + n + ' too.')]
          : [nt >= 360 ? tr(nt, 'r_unit', 'Take away 360° to land between 0° and 360°.') : null, tr(t, 'x_polarmul', 'The angle is multiplied by ' + n + '.'), tr(t + n, 'x_polarmul', 'Multiply the angle by ' + n + '; do not add ' + n + '.')]) };
      if (!askR) p.unit = DEG;
      return p;
    }
    const fam = R.pick(['45', '45', '60', '30']), sa = pm(R), sb = pm(R), k = fam === '45' ? R.pick([1, 1, 2]) : 1;
    const n = fam === '45' ? (k === 1 ? R.pick([2, 4, 6, 8]) : R.pick([2, 4])) : R.pick([3, 6]), ref = +fam, q = quarterOf(sa, sb), t = angleIn(q, ref), nt = n * t, m = nt % 360;
    const zS = fam === '45' ? cx(sa * k, sb * k) : fam === '60' ? num(sa) + (sb < 0 ? M : ' + ') + rt(3) + 'i' : rad(sa, 3) + (sb < 0 ? M : ' + ') + 'i';
    const rS = fam === '45' ? rad(k, 2) : '2', rn = fam === '45' ? Math.pow(k, n) * Math.pow(2, n / 2) : Math.pow(2, n);
    const cm = [1, 0, -1, 0][m / 90], sm = [0, 1, 0, -1][m / 90], re = rn * cm, im = rn * sm, isReal = m % 180 === 0, ans = isReal ? re : im;
    return { text: 'Work out ' + B(pw('(' + zS + ')', n)) + ' with polar form. ' + (isReal ? 'It is a real number. What is it?' : 'It equals k·i. What is k?'), ans,
      how: [W(zS + ': r = ' + rS + ', θ = ' + t + DEG, 'polar form first: r = √(a² + b²), then the angle'),
        W('length: ' + pw(/√/.test(rS) ? '(' + rS + ')' : rS, n) + ' = ' + rn, 'lengths multiply'),
        W('angle: ' + n + ' × ' + t + DEG + ' = ' + nt + DEG + (nt >= 360 ? ', the same place as ' + m + DEG : ''), 'angles add'),
        W(rn + '(cos ' + m + DEG + ' + i sin ' + m + DEG + ') = ' + cx(re, im) + ', so ' + (isReal ? 'it is ' : 'k = ') + B(num(ans)), 'cos ' + m + '° = ' + cm + ', sin ' + m + '° = ' + num(sm))],
      steps: [st('What is the angle θ of ' + B(zS) + ', from 0° to 360°?', t), st('What is the length of the answer, ' + pw('r', n) + '?', rn), st(B(n + ' × ' + t + DEG) + ' is the same place as which angle from 0° up to 360°?', m), st(isReal ? 'So what real number is it?' : 'So k = ?', ans)],
      traps: TR([tr(-ans, 'r_unit', 'Check where ' + m + '° points: cos ' + m + '° = ' + cm + ' and sin ' + m + '° = ' + num(sm) + '.'), fam === '45' ? tr((isReal ? cm : sm) * Math.pow(2 * k, n), 'x_polar', 'The length of ' + zS + ' is ' + rS + ', not ' + 2 * k + '.') : tr((isReal ? cm : sm) * 2 * n, 'w_exp', pw(2, n) + ' means 2 multiplied by itself ' + n + ' times.')]) };
  } },

/* ======================= Triangles & Trig ======================= */
{ id: 'r_lawsin', s: 'trig', g: 10, title: 'The law of sines', pre: ['f_proportion'], paper: true, cc: ['G-SRT.D.10', 'G-SRT.D.11'],
  tip: 'In any triangle a/sin A = b/sin B = c/sin C: each side over the sine of the angle across from it. a = 10, A = 30°, B = 90°: b = 10 × sin 90° ÷ sin 30° = 10 × 1 ÷ ½ = 20.',
  gen(d, R) {
    const SIN = { 30: [1, 2], 45: [2, 2], 60: [3, 2], 90: [1, 1], 120: [3, 2], 135: [2, 2], 150: [1, 2] };   /* sin = √r ÷ d */
    const sinS = t => { const [r, dd] = SIN[t]; return dd === 1 ? rad(1, r) : fs(rad(1, r), dd); };
    const KEYS = [30, 45, 60, 90, 120, 135, 150];
    /* side x across from angle X, from side a across from angle A: x = a × sin X ÷ sin A = k√r */
    const solve = (A, X, L, pre) => {
      const [rA, dA] = SIN[A], [rX, dX] = SIN[X], s = rA * rX, s0 = Math.round(Math.sqrt(s)), perfect = s0 * s0 === s, coef = perfect ? s0 : 1, rr = perfect ? 1 : s;
      const bot = dX * rA, base = bot / gcd(bot, dA * coef), mMax = Math.floor(24 / base); if (mMax < 1) return null;
      const a = base * R.i(1, Math.min(mMax, 8)), k = a * dA * coef / bot, n0 = a * dA / dX;
      const botS = (dX === 1 ? '' : num(dX)) + (rA === 1 ? '' : rt(rA)), inv = isInt(n0) ? solveInv(a, X, A) : null;
      const lines = (pre || []).concat([W(fs(L, 'sin ' + X + DEG) + ' = ' + fs(a, 'sin ' + A + DEG), 'law of sines: each side over the sine of the angle across from it'),
        W(L + ' = ' + a + ' × ' + sinS(X) + ' ÷ ' + sinS(A), 'times both sides by sin ' + X + DEG),
        W('= ' + (botS ? fs(rad(a * dA, rX), botS) : rad(a * dA, rX)) + (rA > 1 || botS ? ' = ' + rad(k, rr) : ''), rA > 1 ? 'dividing by ' + sinS(A) + ' is timesing by its flip; then times top and bottom by ' + rt(rA) : 'dividing by ' + sinS(A) + ' is timesing by its flip'),
        rr === 1 ? L + ' = ' + B(k) : 'k = ' + B(k)]);
      return { a, k, rr, lines, n0, inv };
    };
    function solveInv(a, X, A) { const [rA, dA] = SIN[A], [rX, dX] = SIN[X], s = rA * rX, s0 = Math.round(Math.sqrt(s)); const v = a * dX * (s0 * s0 === s ? s0 : 1) / (dA * rX); return isInt(v) ? v : null; }
    const pairs = []; KEYS.forEach(A => KEYS.forEach(X => { if (A !== X && A + X < 180) pairs.push([A, X]); }));
    if (d === 0) {
      const q = R.pick([3, 4, 5, 7, 8, 9, 10]), p1 = R.i(1, q - 1), p2 = R.i(1, q - 1); if (p1 === p2 || gcd(p1, q) > 1 || gcd(p2, q) > 1) return null;
      const m = R.i(1, 6), a = p1 * m, b = p2 * m; if (a < 3) return null;
      return { text: 'In triangle ABC, side ' + B('a = ' + a) + ' is across from angle A and side b is across from angle B. ' + B('sin A = ' + fs(p1, q)) + ' and ' + B('sin B = ' + fs(p2, q)) + '. What is b?', ans: b,
        how: [W(fs('b', 'sin B') + ' = ' + fs('a', 'sin A'), 'law of sines'), W('b = ' + a + ' × ' + fs(p2, q) + ' ÷ ' + fs(p1, q), 'times both sides by sin B'), W('= ' + a + ' × ' + fs(p2, p1) + ' = ' + B(b), 'the ' + q + 'ths cancel when you divide')],
        steps: [st('What is ' + B(a + ' ÷ ' + fs(p1, q)) + '?', q * m), st('Times sin B = ' + fs(p2, q) + '. What is b?', b)],
        traps: TR([tr(a * p1 / p2, 'r_lawsin', 'b goes with sin B: b = a × sin B ÷ sin A, not the other way up.'), tr(a * p2 / q, 'r_lawsin', 'Divide by sin A too.'), tr(a, 'r_lawsin', 'The sides are equal only when the angles are.')]) };
    }
    if (d === 1) {
      const [A, X] = R.pick(pairs), sv = solve(A, X, 'b'); if (!sv) return null;
      return { text: 'In triangle ABC, ' + B('a = ' + sv.a) + ', ' + B('A = ' + A + DEG) + ' and ' + B('B = ' + X + DEG) + '. ' + (sv.rr === 1 ? 'What is side b?' : 'Side b = k' + rt(sv.rr) + '. What is k?'), ans: sv.k,
        how: sv.lines,
        steps: [st('What is ' + B('sin ' + X + DEG) + '?' + (SIN[X][0] === 1 ? '' : ' It is ' + rt(SIN[X][0]) + ' over a number: type that number.'), SIN[X][0] === 1 ? Q(1, SIN[X][1]) : SIN[X][1], SIN[X][0] === 1 ? FT : {}), st(sv.rr === 1 ? 'b = ?' : 'b = k' + rt(sv.rr) + '. What is k?', sv.k)],
        traps: TR([sv.inv != null ? tr(sv.inv, 'r_lawsin', 'b goes with sin B: b = a × sin B ÷ sin A, not the other way up.') : null, tr(sv.a, 'r_lawsin', 'The sides are equal only when the angles are.'), tr(SIN[X][0] === sv.rr ? sv.a / SIN[X][1] : null, 'r_lawsin', 'Divide by sin A too.')]) };
    }
    if (R.chance(.5)) {
      const [A, Bn] = R.pick(pairs.filter(p => KEYS.includes(180 - p[0] - p[1]))), Cn = 180 - A - Bn, sv = solve(A, Cn, 'c', [W('C = 180° ' + MINUS + ' ' + A + '° ' + MINUS + ' ' + Bn + '° = ' + Cn + DEG, 'the angles of a triangle add to 180°')]); if (!sv) return null;
      return { text: 'In triangle ABC, ' + B('a = ' + sv.a) + ', ' + B('A = ' + A + DEG) + ' and ' + B('B = ' + Bn + DEG) + '. ' + (sv.rr === 1 ? 'What is side c?' : 'Side c = k' + rt(sv.rr) + '. What is k?'), ans: sv.k,
        how: sv.lines,
        steps: [st('What is angle C, in degrees?', Cn), st(sv.rr === 1 ? 'c = ?' : 'c = k' + rt(sv.rr) + '. What is k?', sv.k)],
        traps: TR([tr(sv.a, 'r_lawsin', 'Find angle C first, then use c ÷ sin C = a ÷ sin A.'), tr(sv.inv, 'r_lawsin', 'c goes with sin C: c = a × sin C ÷ sin A, not the other way up.')]) };
    }
    const A = R.pick([30, 90, 150, 0]), q = A ? SIN[A][1] : R.pick([3, 4, 5, 7]), p = A ? 1 : R.i(1, q - 1); if (!A && gcd(p, q) > 1) return null;
    const a = R.i(3, 15), b = R.i(2, 15); if (b * p >= a * q || b === a || (A === 150 && b >= a)) return null;
    const ans = Q(b * p, a * q), sA = A ? 'sin ' + A + DEG : 'sin A', sAv = A ? sinS(A) : fs(p, q);
    return { text: 'In triangle ABC, ' + B('a = ' + a) + ', ' + B('b = ' + b) + ' and ' + B(A ? 'A = ' + A + DEG : 'sin A = ' + fs(p, q)) + '. What is ' + B('sin B') + '? (A fraction is fine.)', ans, type: 'frac',
      how: [W(fs('sin B', b) + ' = ' + fs(sA, a), 'law of sines, written with the sines on top'), W('sin B = ' + b + ' × ' + sAv + ' ÷ ' + a, 'times both sides by ' + b), gcd(b * p, a * q) > 1 ? '= ' + fs(b * p, a * q) + ' = ' + B(fq(ans)) : '= ' + B(fq(ans))],
      steps: [st('What is ' + B(b + ' × ' + sAv) + '?', Q(b * p, q), FT), st('Divide by a = ' + a + '. What is sin B?', ans, FT)],
      traps: TR([tr(Q(a * p, b * q), 'r_lawsin', 'sin B = b × sin A ÷ a: side b goes on top.'), tr(Q(b, a), 'r_lawsin', 'Times by sin A too.'), A ? null : tr(Q(b * q, a * p), 'r_lawsin', 'Times by sin A; do not divide by it.')]) };
  } },

{ id: 'r_lawcos', s: 'trig', g: 10, title: 'The law of cosines', pre: ['w_roots'], paper: true, cc: ['G-SRT.D.11', 'G-SRT.D.10'],
  tip: 'c² = a² + b² − 2ab·cos C, where C is the angle between sides a and b. Sides 5 and 8 with 60° between: c² = 25 + 64 − 2 × 5 × 8 × ½ = 49, so c = 7.',
  gen(d, R) {
    const T60 = [[3, 8, 7], [5, 8, 7], [7, 15, 13], [8, 15, 13], [5, 21, 19], [16, 21, 19]], T120 = [[3, 5, 7], [7, 8, 13], [5, 16, 19], [11, 24, 31]];
    const cosS = C => (C === 60 ? fs(1, 2) : C === 120 ? '(' + MINUS + fs(1, 2) + ')' : '0');
    const third = (a, b, C) => {
      const ab = a * b, two = 2 * ab, c2 = a * a + b * b - (C === 60 ? ab : C === 120 ? -ab : 0), s2 = a * a + b * b;
      const lines = [W(pw('c', 2) + ' = ' + sq(a) + ' + ' + sq(b) + M + '2 × ' + a + ' × ' + b + ' × cos ' + C + DEG, 'the law of cosines'),
        W('= ' + a * a + ' + ' + b * b + M + two + ' × ' + cosS(C), 'cos ' + C + '° = ' + cosS(C).replace(/[()]/g, '')),
        W('= ' + s2 + (C === 60 ? M + ab : C === 120 ? ' + ' + ab : M + '0') + ' = ' + c2, C === 120 ? 'taking away a negative adds' : C === 90 ? 'with 90° it is just Pythagoras' : '')];
      const traps = [tr(s2, 'r_lawcos', 'Include the ' + MINUS + ' 2ab·cos C part.'), tr(s2 - two, 'r_lawcos', 'Multiply 2ab by cos C before taking it away.'), C !== 90 ? tr(C === 60 ? s2 + ab : s2 - ab, 'r_unit', C === 60 ? 'cos 60° = ½ is positive, so you take away.' : 'cos 120° = ' + MINUS + '½ is negative, so the last part adds.') : null];
      return { c2, lines, traps, steps: [st(B(sq(a) + ' + ' + sq(b)) + ' = ?', s2), st(B('2 × ' + a + ' × ' + b + ' × cos ' + C + DEG) + ' = ?', C === 60 ? ab : C === 120 ? -ab : 0)] };
    };
    const setup = (a, b, C) => 'A triangle has sides ' + B('a = ' + a) + ' and ' + B('b = ' + b) + ' with angle ' + B('C = ' + C + DEG) + ' between them.';
    if (d === 0) {
      const a = R.i(2, 12), b = R.i(2, 12), C = R.pick([60, 60, 120, 120, 90]), t = third(a, b, C);
      return { text: setup(a, b, C) + ' What is ' + B(pw('c', 2)) + '?', ans: t.c2,
        how: t.lines.slice(0, 2).concat([t.lines[2].replace(' = ' + t.c2, ' = ' + B(t.c2))]),
        steps: t.steps.concat([st(pw('c', 2) + ' = ?', t.c2)]), traps: TR(t.traps) };
    }
    if (d === 1) {
      const C = R.pick([60, 120]), tri = R.pick(C === 60 ? T60 : T120), k = tri[2] <= 13 ? R.i(1, 2) : 1, sw = R.chance(.5), a = k * tri[sw ? 1 : 0], b = k * tri[sw ? 0 : 1], c = k * tri[2], t = third(a, b, C);
      return { text: setup(a, b, C) + ' What is side c?', ans: c,
        how: t.lines.concat(['c = ' + rt(t.c2) + ' = ' + B(c)]),
        steps: t.steps.concat([st(pw('c', 2) + ' = ?', t.c2), st('c = ?', c)]),
        traps: TR([tr(t.c2, 'w_roots', 'That is ' + pw('c', 2) + '. Take the square root.'), tr(a + b, 'r_lawcos', 'Sides do not add like that: use the law of cosines.')].concat(t.traps.map(x => (x && Number.isInteger(Math.sqrt(x.v)) ? tr(Math.sqrt(x.v), x.c, x.why) : null)))) };
    }
    if (R.chance(.5)) {
      const C = R.pick([60, 120, 90]), tri = C === 90 ? triple(R, 5) : R.pick(C === 60 ? T60 : T120), k = tri[2] <= 13 ? R.i(1, 2) : 1, a = k * tri[0], b = k * tri[1], c = k * tri[2];
      const N = a * a + b * b - c * c, Dn = 2 * a * b, cv = Q(N, Dn), sides = R.shuffle([a, b, c]);
      return { text: 'A triangle has sides ' + B(sides.join(', ')) + '. What is the angle across from the side ' + B(c) + ', in degrees?', ans: C, unit: DEG,
        how: [W('cos C = ' + fs(pw('a', 2) + ' + ' + pw('b', 2) + M + pw('c', 2), '2ab'), 'the law of cosines, solved for cos C; c is the side across from C'),
          '= ' + fs(a * a + ' + ' + b * b + M + c * c, '2 × ' + a + ' × ' + b) + ' = ' + fs(num(N), Dn) + ' = ' + fq(cv), W('C = ' + B(C) + DEG, 'cos ' + C + '° = ' + fq(cv))],
        steps: [st(B(a * a + ' + ' + b * b + M + c * c) + ' = ?', N), st('Divide by ' + B('2 × ' + a + ' × ' + b) + '. What is cos C?', cv, FT), st('Which angle has that cosine?', C)],
        traps: TR([C !== 90 ? tr(180 - C, 'r_unit', 'cos C is ' + (N < 0 ? 'negative, so C is more than 90°.' : 'positive, so C is less than 90°.')) : null, C === 90 ? tr(0, 'r_unit', 'cos 90° = 0; it is cos 0° that is 1.') : tr(C === 60 ? 30 : 150, 'r_unit', C === 60 ? 'cos 30° is √3/2; cos 60° is ½.' : 'cos 150° is ' + MINUS + '√3/2; cos 120° is ' + MINUS + '½.')]) };
    }
    const sides = [R.i(2, 12), R.i(2, 12), R.i(2, 12)].sort((x, y) => x - y); if (sides[0] + sides[1] <= sides[2]) return null;
    const ci = R.i(0, 2), c = sides[ci], [a, b] = sides.filter((v, i) => i !== ci), N = a * a + b * b - c * c, Dn = 2 * a * b, ans = Q(N, Dn); if (N === 0) return null;
    return { text: 'A triangle has sides ' + B(sides.join(', ')) + '. What is the cosine of the angle across from the side ' + B(c) + '? (A fraction is fine.)', ans, type: 'frac',
      how: [W('cos C = ' + fs(pw('a', 2) + ' + ' + pw('b', 2) + M + pw('c', 2), '2ab'), 'c is the side across from the angle'), W('= ' + fs(a * a + ' + ' + b * b + M + c * c, '2 × ' + a + ' × ' + b), 'a = ' + a + ', b = ' + b + ', c = ' + c), gcd(Math.abs(N), Dn) > 1 ? '= ' + fs(num(N), Dn) + ' = ' + B(fq(ans)) : '= ' + B(fq(ans))],
      steps: [st(B(a * a + ' + ' + b * b + M + c * c) + ' = ?', N), st(B('2 × ' + a + ' × ' + b) + ' = ?', Dn), st('cos C = ?', ans, FT)],
      traps: TR([tr(Q(-N, Dn), 'r_lawcos', 'It is a² + b² ' + MINUS + ' c², where c is the side across from the angle.'), tr(Q(N, a * b), 'r_lawcos', 'The bottom is 2ab.'), ci !== 2 ? tr(Q(sides[0] ** 2 + sides[1] ** 2 - sides[2] ** 2, 2 * sides[0] * sides[1]), 'r_lawcos', 'Use the angle across from ' + c + ', not the largest angle.') : null]) };
  } },

{ id: 'r_addform', s: 'trig', g: 12, title: 'Angle addition formulas', pre: ['f_mult'], paper: true, cc: ['F-TF.C.9'],
  tip: 'sin(A + B) = sin A cos B + cos A sin B and cos(A + B) = cos A cos B − sin A sin B; for A − B flip the middle sign. So cos 15° = cos(45° − 30°) = (√6 + √2)/4.',
  gen(d, R) {
    const FAM = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
    const ang = () => { const f = R.pick(FAM), sw = R.chance(.5); return { s: sw ? f[1] : f[0], c: sw ? f[0] : f[1], h: f[2] }; };
    const sf = (n, h) => (n < 0 ? MINUS : '') + fs(Math.abs(n), h), sp = (n, h) => (n < 0 ? '(' + sf(n, h) + ')' : sf(n, h));
    if (d === 2 && R.chance(.3)) {
      const [ang0, A, Bn, fn] = R.pick([[15, 45, -30, 'sin'], [15, 45, -30, 'cos'], [75, 45, 30, 'sin'], [75, 45, 30, 'cos'], [105, 60, 45, 'sin'], [105, 60, 45, 'cos']]);
      const plus = Bn > 0, Bb = Math.abs(Bn), sA = tv('sin', A), cA = tv('cos', A), sB = tv('sin', Bb), cB = tv('cos', Bb);
      /* the two terms as k√r/4 */
      const t1 = fn === 'sin' ? [sA, cB] : [cA, cB], t2 = fn === 'sin' ? [cA, sB] : [sA, sB], sg2 = fn === 'sin' ? (plus ? 1 : -1) : (plus ? -1 : 1);
      const r1 = t1[0].r * t1[1].r, r2 = t2[0].r * t2[1].r, hide = R.i(0, 1), ans = hide ? r2 : r1;
      const shown = (hide ? rt(r1) : rt('a')) + (sg2 < 0 ? M : ' + ') + (hide ? rt('a') : rt(r2)), opn = plus ? ' + ' : M;
      const form = fn === 'sin' ? 'sin ' + A + '° cos ' + Bb + '°' + opn + 'cos ' + A + '° sin ' + Bb + DEG : 'cos ' + A + '° cos ' + Bb + DEG + (plus ? M : ' + ') + 'sin ' + A + '° sin ' + Bb + DEG;
      return { text: 'Use ' + B(ang0 + '° = ' + A + '°' + opn + Bb + DEG) + ': ' + B(fn + ' ' + ang0 + '° = ' + fs(shown, 4)) + '. What is a?', ans,
        how: [W(fn + ' ' + ang0 + '° = ' + form, fn + '(A ' + (plus ? '+' : MINUS) + ' B)'), '= ' + tvS(t1[0]) + ' × ' + tvS(t1[1]) + (sg2 < 0 ? M : ' + ') + tvS(t2[0]) + ' × ' + tvS(t2[1]),
          W('= ' + fs(rt(r1), 4) + (sg2 < 0 ? M : ' + ') + fs(rt(r2), 4), 'multiply the tops under one root; the bottoms make 2 × 2 = 4'), 'a = ' + B(ans)],
        steps: [st('Multiply ' + B(tvS(t1[0]) + ' × ' + tvS(t1[1])) + ' = ' + fs(rt('?'), 4) + '. What goes under the root?', r1), st('Multiply ' + B(tvS(t2[0]) + ' × ' + tvS(t2[1])) + ' = ' + fs(rt('?'), 4) + '. What goes under the root?', r2), st('a = ?', ans)],
        traps: TR([tr(hide ? r1 : r2, 'r_addform', 'Work out both products; a is the one that is missing.'), tr(ans === 6 ? 3 : 1, 'w_radical', rt(2) + ' × ' + rt(3) + ' = ' + rt(6) + ': multiply under the root.')]) };
    }
    if (d === 2 && R.chance(.45)) {
      const a1 = R.i(1, 5), b1 = R.i(1, 6), a2 = R.i(1, 5), b2 = R.i(1, 6); if (gcd(a1, b1) > 1 || gcd(a2, b2) > 1 || (a1 === a2 && b1 === b2)) return null;
      const plus = R.chance(.5), N = plus ? a1 * b2 + a2 * b1 : a1 * b2 - a2 * b1, Dd = plus ? b1 * b2 - a1 * a2 : b1 * b2 + a1 * a2; if (!N || !Dd) return null;
      const ans = Q(N, Dd), op = plus ? ' + ' : M, op2 = plus ? M : ' + ', bb = b1 * b2;
      return { text: B('tan A = ' + fs(a1, b1)) + ' and ' + B('tan B = ' + fs(a2, b2)) + '. What is ' + B('tan(A' + op + 'B)') + '? (A fraction is fine.)', ans, type: 'frac',
        how: [W('tan(A' + op + 'B) = ' + fs('tan A' + op + 'tan B', '1' + op2 + 'tan A tan B'), 'the addition formula for tan'), '= ' + fs(fs(a1, b1) + op + fs(a2, b2), '1' + op2 + fs(a1, b1) + ' × ' + fs(a2, b2)),
          W('= ' + fs(num(N), bb) + ' ÷ ' + fs(num(Dd), bb), 'over ' + bb + ' on the top and on the bottom'), '= ' + B(fq(ans))],
        steps: [st('Top: ' + B(fs(a1, b1) + op + fs(a2, b2)) + ' = ?', Q(N, bb), FT), st('Bottom: ' + B('1' + op2 + fs(a1, b1) + ' × ' + fs(a2, b2)) + ' = ?', Q(Dd, bb), FT), st('Top ÷ bottom = ?', ans, FT)],
        traps: TR([tr(Q(N, bb), 'r_addform', 'tan(A ' + (plus ? '+' : MINUS) + ' B) is not tan A ' + (plus ? '+' : MINUS) + ' tan B: divide by 1 ' + (plus ? MINUS : '+') + ' tan A tan B.'), tr(Q(N, plus ? bb + a1 * a2 : bb - a1 * a2), 'r_addform', 'The sign on the bottom is the opposite of the sign on top.'), tr(Q(Dd, N), 'r_addform', 'The sum of the tans goes on top.')]) };
    }
    const A = ang(), Bv = ang(); if (A.s === Bv.s && A.h === Bv.h) return null;
    const obt = d === 2, cA = obt ? -A.c : A.c, kind = R.pick(['sin+', 'sin-', 'cos+', 'cos-']), fn = kind.slice(0, 3), plus = kind[3] === '+', D = A.h * Bv.h;
    const p1 = fn === 'sin' ? A.s * Bv.c : cA * Bv.c, p2 = fn === 'sin' ? cA * Bv.s : A.s * Bv.s, sg = fn === 'sin' ? (plus ? 1 : -1) : (plus ? -1 : 1), N = p1 + sg * p2, ans = Q(N, D);
    const name = fn + '(A ' + (plus ? '+' : MINUS) + ' B)', op = sg > 0 ? ' + ' : M;
    const formula = fn === 'sin' ? 'sin A cos B' + op + 'cos A sin B' : 'cos A cos B' + op + 'sin A sin B';
    const v1 = fn === 'sin' ? [sp(A.s, A.h), sp(Bv.c, Bv.h)] : [sp(cA, A.h), sp(Bv.c, Bv.h)], v2 = fn === 'sin' ? [sp(cA, A.h), sp(Bv.s, Bv.h)] : [sp(A.s, A.h), sp(Bv.s, Bv.h)];
    const pre = [];
    let given;
    if (d === 0) given = B('sin A = ' + fs(A.s, A.h)) + ', ' + B('cos A = ' + fs(A.c, A.h)) + ', ' + B('sin B = ' + fs(Bv.s, Bv.h)) + ' and ' + B('cos B = ' + fs(Bv.c, Bv.h));
    else {
      const gA = R.chance(.5) || obt ? 's' : 'c', gB = R.chance(.5) ? 's' : 'c';
      given = B((gA === 's' ? 'sin A = ' + fs(A.s, A.h) : 'cos A = ' + fs(A.c, A.h))) + ' and ' + B((gB === 's' ? 'sin B = ' + fs(Bv.s, Bv.h) : 'cos B = ' + fs(Bv.c, Bv.h)));
      const miss = (g, o, nm) => (g === 's' ? W('cos ' + nm + ' = ' + sf(nm === 'A' ? cA : o.c, o.h), 'cos² ' + nm + ' = 1 ' + MINUS + ' ' + fs(o.s * o.s, o.h * o.h) + ' = ' + fs(o.c * o.c, o.h * o.h) + (nm === 'A' && obt ? '; A is between 90° and 180°, so cos A is negative' : '; ' + nm + ' is acute')) : W('sin ' + nm + ' = ' + fs(o.s, o.h), 'sin² ' + nm + ' = 1 ' + MINUS + ' ' + fs(o.c * o.c, o.h * o.h) + ' = ' + fs(o.s * o.s, o.h * o.h) + '; ' + nm + ' is acute'));
      pre.push(miss(gA, A, 'A'), miss(gB, Bv, 'B'));
    }
    const final = gcd(Math.abs(N), D) > 1 ? ['= ' + sf(N, D) + ' = ' + B(fq(ans))] : [];
    const traps = [tr(Q(p1 - sg * p2, D), 'r_addform', fn === 'sin' ? 'sin(A ± B) keeps the same sign in the middle.' : 'cos(A ± B) has the opposite sign in the middle: cos(A + B) takes away.'),
      tr(fn === 'sin' ? Q(A.s * Bv.h + Bv.s * A.h * (plus ? 1 : -1), D) : Q(cA * Bv.h + Bv.c * A.h * (plus ? 1 : -1), D), 'r_addform', name + ' is not ' + fn + ' A ' + (plus ? '+' : MINUS) + ' ' + fn + ' B. Use the formula.'),
      tr(fn === 'sin' ? Q(A.s * Bv.s + sg * cA * Bv.c, D) : Q(cA * Bv.s + sg * A.s * Bv.c, D), 'r_addform', fn === 'sin' ? 'sin(A ± B) pairs each sin with a cos.' : 'cos(A ± B) pairs cos with cos and sin with sin.')];
    if (obt) traps.push(tr(Q(fn === 'sin' ? A.s * Bv.c + sg * A.c * Bv.s : A.c * Bv.c + sg * A.s * Bv.s, D), 'r_identity', 'Between 90° and 180° cos A is negative.'));
    return { text: 'Angle ' + (obt ? 'A is between 90° and 180°, angle B is acute' : 'A and angle B are acute') + ', with ' + given + '. What is ' + B(name) + '? (A fraction is fine.)', ans, type: 'frac',
      how: pre.concat([W(name + ' = ' + formula, 'the addition formula'), '= ' + v1.join(' × ') + op + v2.join(' × '), '= ' + sf(p1, D) + op + sf(p2, D) + ' = ' + (final.length ? sf(N, D) : B(sf(N, D)))]).concat(final),
      steps: (d ? [st(pre[0].indexOf('cos A') === 0 ? 'What is cos A?' : 'What is sin A?', pre[0].indexOf('cos A') === 0 ? Q(cA, A.h) : Q(A.s, A.h), FT)] : [])
        .concat([st(B(v1.join(' × ')) + ' = ?', Q(p1, D), FT), st(B(v2.join(' × ')) + ' = ?', Q(p2, D), FT), st(name + ' = ?', ans, FT)]),
      traps: TR(traps) };
  } },

{ id: 'r_veccomp', s: 'trig', g: 12, title: 'Vector components: end minus start', pre: ['x_coord4'], cc: ['N-VM.A.2'],
  tip: 'The vector from P to Q is end minus start, Q − P, one coordinate at a time. From P(2, −1) to Q(7, 3): ⟨7 − 2, 3 − (−1)⟩ = ⟨5, 4⟩.',
  gen(d, R) {
    const lo = d === 0 ? 0 : -9, x1 = R.i(lo, 9), y1 = R.i(lo, 9), x2 = R.i(lo, 9), y2 = R.i(lo, 9); if (x1 === x2 || y1 === y2) return null;
    if (d === 1 && x1 >= 0 && y1 >= 0) return null;
    const a = x2 - x1, b = y2 - y1, askX = R.chance(.5);
    if (d < 2) {
      const L = askX ? 'a' : 'b', ans = askX ? a : b, s1 = askX ? x1 : y1, e1 = askX ? x2 : y2;
      const lineA = 'a = ' + num(x2) + M + par2(x1) + ' = ' + (askX ? B(num(a)) : num(a)), lineB = 'b = ' + num(y2) + M + par2(y1) + ' = ' + (askX ? num(b) : B(num(b)));
      return { text: 'The vector from ' + B('P' + pt(x1, y1)) + ' to ' + B('Q' + pt(x2, y2)) + ' is ' + B('⟨a, b⟩') + '. What is ' + B(L) + '?', ans,
        vis: plotSVG([{ x: x1, y: y1, t: 'P' }, { x: x2, y: y2, t: 'Q' }], { r: Math.max(6, Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2)), line: [{ x: x1, y: y1 }, { x: x2, y: y2 }] }),
        how: [W('⟨a, b⟩ = Q ' + MINUS + ' P', 'end minus start, one coordinate at a time')].concat(askX ? [lineB, lineA] : [lineA, lineB]),
        steps: [st('The start is P. What is its ' + (askX ? 'x' : 'y') + '-coordinate?', s1), st(B(num(e1) + M + par2(s1)) + ' = ?', ans)],
        traps: TR([tr(-ans, 'r_veccomp', 'End minus start: Q ' + MINUS + ' P, not P ' + MINUS + ' Q.'), tr(e1 + s1, s1 < 0 ? 'n_intsub' : 'r_veccomp', s1 < 0 ? 'Taking away a negative adds: ' + num(e1) + M + par2(s1) + ' = ' + num(e1) + ' + ' + num(-s1) + '.' : 'Take the start away from the end; do not add.'), tr(askX ? b : a, 'r_veccomp', 'a is the x-part, b is the y-part.')]) };
    }
    const fromP = R.chance(.5), c1 = askX ? x1 : y1, c2 = askX ? x2 : y2, comp = askX ? a : b, ans = fromP ? c2 : c1, xy = askX ? 'x' : 'y';
    return { text: 'The vector ' + B(vec(a, b)) + (fromP ? ' starts at ' + B('P' + pt(x1, y1)) + ' and ends at Q.' : ' ends at ' + B('Q' + pt(x2, y2)) + ' and starts at P.') + ' What is the ' + B(xy) + '-coordinate of ' + (fromP ? 'Q' : 'P') + '?', ans,
      how: [W('Q ' + MINUS + ' P = ' + vec(a, b), 'end minus start'), W(fromP ? 'Q = P + ' + vec(a, b) : 'P = Q ' + MINUS + ' ' + vec(a, b), fromP ? 'add the vector to the start' : 'take the vector away from the end'),
        xy + ' = ' + (fromP ? num(c1) + ' + ' + par2(comp) : num(c2) + M + par2(comp)) + ' = ' + B(num(ans))],
      steps: [st('The ' + xy + '-part of the vector?', comp), st((fromP ? 'Add it to ' + num(c1) : 'Take it away from ' + num(c2)) + ':', ans)],
      traps: TR([tr(fromP ? c1 - comp : c2 + comp, 'r_veccomp', fromP ? 'The vector goes from P to Q, so add it to P.' : 'Q is P plus the vector, so P is Q minus the vector.'), tr(comp, 'r_veccomp', 'The vector is the move, not the point: start from ' + (fromP ? 'P' : 'Q') + '.')]) };
  } },

{ id: 'r_vecadd', s: 'trig', g: 12, title: 'Add vectors by components', pre: ['n_intadd'], cc: ['N-VM.B.4a'],
  tip: 'Add vectors by components: x with x, y with y. ⟨3, −2⟩ + ⟨−5, 6⟩ = ⟨3 + (−5), −2 + 6⟩ = ⟨−2, 4⟩. Drawing them tip to tail gives the same arrow.',
  gen(d, R) {
    if (d < 2) {
      const n = d === 0 ? 2 : 3, V = []; for (let i = 0; i < n; i++) V.push([R.i(d === 0 ? -5 : -9, 9), R.i(d === 0 ? -5 : -9, 9)]);
      const sx = sum(V.map(v => v[0])), sy = sum(V.map(v => v[1])), askX = R.chance(.5), ans = askX ? sx : sy, k = askX ? 0 : 1;
      if (V.every(v => v[k] >= 0)) return null;
      return { text: B(V.map(v => vec(v[0], v[1])).join(' + ') + ' = ⟨a, b⟩') + '. What is ' + B(askX ? 'a' : 'b') + '?', ans,
        how: [W('⟨' + V.map(v => par2(v[0])).join(' + ') + ', ' + V.map(v => par2(v[1])).join(' + ') + '⟩', 'add x with x and y with y'), '= ' + vec(sx, sy), (askX ? 'a' : 'b') + ' = ' + B(num(ans))],
        steps: [st('What is the ' + (askX ? 'x' : 'y') + '-part of the first vector?', V[0][k]), st(B(V.map(v => par2(v[k])).join(' + ')) + ' = ?', ans)],
        traps: TR([tr(askX ? sy : sx, 'r_vecadd', 'a is the sum of the x-parts; b is the sum of the y-parts.'), tr(V[0][k] - sum(V.slice(1).map(v => v[k])), 'n_intadd', 'Add every vector; adding a negative takes away.'), tr(sum(V.map(v => Math.abs(v[k]))), 'n_intadd', 'Keep the minus signs: adding a negative takes away.')]) };
    }
    const [p, q, c] = triple(R, 6), sx = p * pm(R), sy = q * pm(R), ux = R.i(-9, 9), uy = R.i(-9, 9), vx = sx - ux, vy = sy - uy;
    if (Math.abs(vx) > 14 || Math.abs(vy) > 14) return null;
    return { text: 'u = ' + B(vec(ux, uy)) + ' and v = ' + B(vec(vx, vy)) + '. What is the length ' + B('‖u + v‖') + '?', ans: c,
      how: [W('u + v = ⟨' + par2(ux) + ' + ' + par2(vx) + ', ' + par2(uy) + ' + ' + par2(vy) + '⟩ = ' + vec(sx, sy), 'add by components first'), W('‖u + v‖ = ' + rt(sq(sx) + ' + ' + sq(sy)) + ' = ' + rt(c * c), 'length = √(x² + y²)'), '= ' + B(c)],
      steps: [st('The x-part of u + v?', sx), st('The y-part of u + v?', sy), st('Its length?', c)],
      traps: TR([tr(Math.abs(sx) + Math.abs(sy), 'r_pyth', 'Length is √(x² + y²), not x + y.'), tr(c * c, 'w_roots', 'That is the length squared. Take the square root.')]) };
  } },

{ id: 'r_vecsub', s: 'trig', g: 12, title: 'Subtract vectors: add the opposite', pre: ['n_intsub'], cc: ['N-VM.B.4c'],
  tip: 'v − w = v + (−w): flip w by changing both its signs, then add. ⟨4, 1⟩ − ⟨−2, 5⟩ = ⟨4 + 2, 1 + (−5)⟩ = ⟨6, −4⟩. −w is as long as w but points the other way.',
  gen(d, R) {
    if (d < 2) {
      const v = [R.i(d ? -9 : 0, 9), R.i(d ? -9 : 0, 9)], w = [R.i(-9, 9), R.i(-9, 9)], askX = R.chance(.5), k = askX ? 0 : 1, L = askX ? 'a' : 'b', xy = askX ? 'x' : 'y';
      if (w[k] === 0 || (w[k] > 0 && R.chance(.5))) return null;
      const r = [v[0] - w[0], v[1] - w[1]], ans = r[k];
      return { text: 'v = ' + B(vec(v[0], v[1])) + ' and w = ' + B(vec(w[0], w[1])) + '. ' + B('v ' + MINUS + ' w = ⟨a, b⟩') + '. What is ' + B(L) + '?', ans,
        how: [W('v ' + MINUS + ' w = v + (' + MINUS + 'w), and ' + MINUS + 'w = ' + vec(-w[0], -w[1]), 'flip w: change both its signs'), W('⟨' + num(v[0]) + ' + ' + par2(-w[0]) + ', ' + num(v[1]) + ' + ' + par2(-w[1]) + '⟩ = ' + vec(r[0], r[1]), 'then add x with x and y with y'), L + ' = ' + B(num(ans))],
        steps: [st('What is the ' + xy + '-part of ' + MINUS + 'w?', -w[k]), st(B(num(v[k]) + ' + ' + par2(-w[k])) + ' = ?', ans)],
        traps: TR([tr(v[k] + w[k], 'r_vecsub', 'Taking away w: change both its signs first, then add.'), tr(w[k] - v[k], 'r_vecsub', 'Order matters: v ' + MINUS + ' w, not w ' + MINUS + ' v.'), tr(askX ? r[1] : r[0], 'r_vecsub', 'a is the x-part, b is the y-part.')]) };
    }
    const [p, q, c] = triple(R, 6), r = [p * pm(R), q * pm(R)], w = [R.i(-9, 9), R.i(-9, 9)], v = [w[0] + r[0], w[1] + r[1]];
    if (Math.abs(v[0]) > 14 || Math.abs(v[1]) > 14) return null;
    const s2 = (v[0] + w[0]) ** 2 + (v[1] + w[1]) ** 2, s = Math.round(Math.sqrt(s2));
    return { text: 'v = ' + B(vec(v[0], v[1])) + ' and w = ' + B(vec(w[0], w[1])) + '. What is the length ' + B('‖v ' + MINUS + ' w‖') + '?', ans: c,
      how: [W('v ' + MINUS + ' w = ⟨' + num(v[0]) + M + par2(w[0]) + ', ' + num(v[1]) + M + par2(w[1]) + '⟩ = ' + vec(r[0], r[1]), 'subtract by components first'), W('‖v ' + MINUS + ' w‖ = ' + rt(sq(r[0]) + ' + ' + sq(r[1])) + ' = ' + rt(c * c), 'length = √(x² + y²)'), '= ' + B(c)],
      steps: [st('The x-part of v ' + MINUS + ' w?', r[0]), st('The y-part of v ' + MINUS + ' w?', r[1]), st('Its length?', c)],
      traps: TR([tr(Math.abs(r[0]) + Math.abs(r[1]), 'r_pyth', 'Length is √(x² + y²), not x + y.'), tr(c * c, 'w_roots', 'That is the length squared. Take the square root.'), s * s === s2 ? tr(s, 'r_vecsub', 'That is ‖v + w‖. Subtract: change the signs of w first.') : null]) };
  } },

{ id: 'r_vecscale', s: 'trig', g: 12, title: 'A number times a vector', pre: ['n_intmul'], cc: ['N-VM.B.5a'],
  tip: 'A number times a vector multiplies each component: −3⟨2, −5⟩ = ⟨−6, 15⟩. For 2v − w, scale first, then subtract by components.',
  gen(d, R) {
    const kS = k => (k === 0.5 ? fs(1, 2) : k === -0.5 ? MINUS + fs(1, 2) : num(k)), kP = k => (k < 0 ? '(' + kS(k) + ')' : kS(k));
    if (d < 2) {
      const half = d === 1 && R.chance(.3), k = d === 0 ? R.i(2, 6) : half ? R.pick([0.5, -0.5]) : -R.i(2, 6);
      const v = half ? [2 * R.i(-8, 8), 2 * R.i(-8, 8)] : [R.i(-9, 9), R.i(-9, 9)], askX = R.chance(.5), c = askX ? 0 : 1, L = askX ? 'a' : 'b';
      if (v[c] === 0) return null;
      const kv = [k * v[0], k * v[1]], ans = kv[c];
      return { text: B(kS(k) + vec(v[0], v[1]) + ' = ⟨a, b⟩') + '. What is ' + B(L) + '?', ans,
        how: [W('⟨' + kP(k) + ' × ' + par2(v[0]) + ', ' + kP(k) + ' × ' + par2(v[1]) + '⟩', 'multiply each part by ' + kS(k)), '= ' + vec(kv[0], kv[1]), L + ' = ' + B(num(ans))],
        steps: [st('What is the ' + (askX ? 'x' : 'y') + '-part of the vector?', v[c]), st(B(kP(k) + ' × ' + par2(v[c])) + ' = ?', ans)],
        traps: TR([tr(k + v[c], 'r_vecscale', 'Multiply each part by ' + kS(k) + '; do not add.'), tr(-ans, 'n_intmul', 'Check the sign: ' + (k < 0 ? 'a negative number flips every sign.' : 'times a positive keeps the sign.')), tr(kv[1 - c], 'r_vecscale', 'a is the x-part, b is the y-part.')]) };
    }
    if (R.chance(.4)) {
      const k = nz(R, -7, 7), a = nz(R, -9, 9), b = nz(R, -9, 9); if (k === 1) return null;
      return { text: B('k' + vec(a, b) + ' = ' + vec(k * a, k * b)) + '. What is k?', ans: k,
        how: [W('k × ' + par2(a) + ' = ' + num(k * a), 'match the x-parts'), W('k = ' + num(k * a) + ' ÷ ' + par2(a) + ' = ' + B(num(k)), 'divide to undo the times'), W('check: ' + par2(k) + ' × ' + par2(b) + ' = ' + num(k * b), 'the y-parts match too')],
        steps: [st('What times ' + B(par2(a)) + ' gives ' + B(num(k * a)) + '?', k)],
        traps: TR([tr(-k, 'n_intmul', 'Check the sign: a negative times a negative is positive.'), tr(k * a - a, 'r_vecscale', 'k multiplies the vector, so divide to find it.')]) };
    }
    const m = nz(R, -4, 4), n = nz(R, -3, 3); if (Math.abs(m) === 1) return null;
    const v = [R.i(-8, 8), R.i(-8, 8)], w = [R.i(-8, 8), R.i(-8, 8)], askX = R.chance(.5), c = askX ? 0 : 1, L = askX ? 'a' : 'b';
    const mv = [m * v[0], m * v[1]], nw = [n * w[0], n * w[1]], r = [mv[0] + nw[0], mv[1] + nw[1]], ans = r[c], expr = term(m, 'v') + ' ' + (n < 0 ? MINUS : '+') + ' ' + term(Math.abs(n), 'w');
    return { text: 'v = ' + B(vec(v[0], v[1])) + ' and w = ' + B(vec(w[0], w[1])) + '. ' + B(expr + ' = ⟨a, b⟩') + '. What is ' + B(L) + '?', ans,
      how: [W(term(m, 'v') + ' = ' + vec(mv[0], mv[1]), 'multiply each part of v by ' + num(m)), W(term(n, 'w') + ' = ' + vec(nw[0], nw[1]), n === 1 ? 'w as it is' : n === -1 ? 'change both signs of w' : 'multiply each part of w by ' + num(n)),
        W(L + ' = ' + num(mv[c]) + ' + ' + par2(nw[c]) + ' = ' + B(num(ans)), 'add the ' + (askX ? 'x' : 'y') + '-parts')],
      steps: [st('The ' + (askX ? 'x' : 'y') + '-part of ' + B(term(m, 'v')) + '?', mv[c]), st('The ' + (askX ? 'x' : 'y') + '-part of ' + B(term(n, 'w')) + '?', nw[c]), st(L + ' = ?', ans)],
      traps: TR([tr(mv[c] - nw[c], 'n_intsub', 'Keep the sign of ' + term(n, 'w') + ' when you combine.'), tr(m * v[c] + w[c] * (n < 0 ? -1 : 1), 'r_vecscale', 'Multiply w by ' + Math.abs(n) + ' too.'), tr(v[c] + n * w[c], 'r_vecscale', 'Multiply v by ' + num(m) + ' too.')]) };
  } },

{ id: 'r_vecmag', s: 'trig', g: 12, title: 'Length of a scaled vector', pre: ['n_abs'], cc: ['N-VM.B.5b'],
  tip: '‖cv‖ = |c| × ‖v‖. If ‖v‖ = 7, then ‖−3v‖ = 3 × 7 = 21: the minus sign only turns the arrow around. To get length 1, divide v by its length.',
  gen(d, R) {
    const cS = c => (c === 0.5 ? fs(1, 2) : c === -0.5 ? MINUS + fs(1, 2) : num(c));
    if (d === 0) {
      const L = R.i(2, 12), c = L % 2 === 0 && R.chance(.25) ? R.pick([0.5, -0.5]) : nz(R, -6, 6); if (Math.abs(c) === 1) return null;
      const ans = Math.abs(c) * L;
      return { text: B('‖v‖ = ' + L) + '. What is ' + B('‖' + cS(c) + 'v‖') + '?', ans,
        how: [W('‖' + cS(c) + 'v‖ = |' + cS(c) + '| × ‖v‖', 'the length scales by |c|; a minus sign only turns the arrow around'), '= ' + cS(Math.abs(c)) + ' × ' + L + ' = ' + B(num(ans))],
        steps: [st('What is ' + B('|' + cS(c) + '|') + '?', Math.abs(c)), st('Times ' + L + ':', ans)],
        traps: TR([c < 0 ? tr(c * L, 'n_abs', 'A length is never negative: use |' + cS(c) + '|.') : null, tr(L, 'r_vecmag', 'Multiplying by ' + cS(c) + ' changes the length too.'), tr(L + Math.abs(c), 'r_vecmag', 'Multiply the length by |c|; do not add.')]) };
    }
    const [p, q, h] = triple(R, d === 1 ? 6 : 7), a = p * pm(R), b = q * pm(R);
    if (d === 1) {
      const even = a % 2 === 0 && b % 2 === 0, c = even && R.chance(.35) ? R.pick([0.5, -0.5]) : R.pick([-3, -2, 2, 3]), ans = Math.abs(c) * h;
      return { text: 'v = ' + B(vec(a, b)) + '. What is ' + B('‖' + cS(c) + 'v‖') + '?', ans,
        how: [W('‖v‖ = ' + rt(sq(a) + ' + ' + sq(b)) + ' = ' + rt(h * h) + ' = ' + h, 'length = √(x² + y²)'), W('‖' + cS(c) + 'v‖ = ' + cS(Math.abs(c)) + ' × ' + h + ' = ' + B(num(ans)), 'the length scales by |' + cS(c) + '|')],
        steps: [st('What is ' + B('‖v‖') + '?', h), st('Times |' + cS(c) + '|:', ans)],
        traps: TR([c < 0 ? tr(c * h, 'n_abs', 'A length is never negative: use |' + cS(c) + '|.') : null, tr(Math.abs(c) * (Math.abs(a) + Math.abs(b)), 'r_pyth', 'Length is √(x² + y²), not x + y.'), tr(h, 'r_vecmag', 'Multiplying by ' + cS(c) + ' changes the length too.')]) };
    }
    const askX = R.chance(.5), comp = askX ? a : b, xy = askX ? 'x' : 'y';
    if (R.chance(.5)) {
      const ans = Q(comp, h);
      return { text: 'v = ' + B(vec(a, b)) + '. The unit vector u points the same way as v and has length 1. What is the ' + B(xy) + '-part of u? (A fraction is fine.)', ans, type: 'frac',
        how: [W('‖v‖ = ' + rt(sq(a) + ' + ' + sq(b)) + ' = ' + h, 'length = √(x² + y²)'), W('u = ' + fs('v', h) + ' = ⟨' + fs(num(a), h) + ', ' + fs(num(b), h) + '⟩', 'divide each part by the length'), xy + '-part = ' + B(fq(ans))],
        steps: [st('What is ' + B('‖v‖') + '?', h), st('Divide the ' + xy + '-part, ' + num(comp) + ', by it:', ans, FT)],
        traps: TR([tr(Q(h, comp), 'r_vecmag', 'Divide the part by the length, not the length by the part.'), tr(Q(comp, h * h), 'w_roots', 'Divide by the length ' + h + ', not by its square.'), tr(Q(comp, Math.abs(a) + Math.abs(b)), 'r_pyth', 'The length is √(x² + y²) = ' + h + '.')]) };
    }
    const L = R.pick([2, 3, 4, 5, 6, 10, 12, 15, 20, 26, 30]); if (L === h) return null;
    const ans = Q(L * comp, h);
    return { text: 'v = ' + B(vec(a, b)) + '. Vector w points the same way as v and has length ' + B(L) + '. What is the ' + B(xy) + '-part of w? (A fraction is fine.)', ans, type: 'frac',
      how: [W('‖v‖ = ' + rt(sq(a) + ' + ' + sq(b)) + ' = ' + h, 'length = √(x² + y²)'), W('w = ' + fs(L, h) + 'v', 'scale v by ' + fs(L, h) + ' so its length becomes ' + L), W(xy + '-part = ' + fs(L, h) + ' × ' + par2(comp) + ' = ' + B(fq(ans)), '')],
      steps: [st('What is ' + B('‖v‖') + '?', h), st('w = kv. What is k?', Q(L, h), FT), st('The ' + xy + '-part of w?', ans, FT)],
      traps: TR([tr(Q(L * comp, 1), 'r_vecmag', 'Divide by ‖v‖ = ' + h + ' first, so the length becomes ' + L + '.'), tr(Q(comp, h), 'r_vecmag', 'That is the unit vector; times by ' + L + ' too.'), tr(Q(h * comp, L), 'r_vecmag', 'Scale by ' + L + ' over ' + h + ', not ' + h + ' over ' + L + '.')]) };
  } },

{ id: 'r_vecsum', s: 'trig', g: 12, title: 'Length of a sum from two directions', pre: ['r_lawcos'], paper: true, cc: ['N-VM.B.4b'],
  tip: 'Two arrows at an angle φ apart: |u + v|² = |u|² + |v|² + 2|u||v| cos φ. 6 N east plus 8 N north (φ = 90°): √(36 + 64) = 10 N. Two equal arrows: the sum points halfway between them.',
  gen(d, R) {
    if (d === 0) {
      const [p, q, c] = triple(R, 6), k = R.i(1, 3);
      return { text: 'A force of ' + B(k * p + ' N') + ' pulls east and a force of ' + B(k * q + ' N') + ' pulls north on a box. What is the size of the total force, in N?', ans: k * c,
        how: [W('total = ' + vec(k * p, k * q), 'east is the x-part, north is the y-part'), W('size = ' + rt(sq(k * p) + ' + ' + sq(k * q)) + ' = ' + rt(k * k * c * c), 'the length of the sum'), '= ' + B(k * c) + ' N'],
        steps: [st(B(sq(k * p) + ' + ' + sq(k * q)) + ' = ?', k * k * c * c), st('Take the square root:', k * c)],
        traps: TR([tr(k * (p + q), 'r_vecsum', 'Forces at right angles do not just add their sizes.'), tr(k * Math.abs(p - q), 'r_vecsum', 'Combine the forces as arrows with Pythagoras.'), tr(k * k * c * c, 'w_roots', 'Take the square root.')]) };
    }
    if (d === 1) {
      if (R.chance(.4)) {
        const F = R.i(2, 12), t1 = 5 * R.i(0, 30), gap = R.pick([40, 60, 80, 90, 100, 120, 140]), t2 = t1 + gap; if (t2 >= 360) return null;
        const mid = (t1 + t2) / 2;
        return { text: 'Two forces of ' + B(F + ' N') + ' each act at ' + B(t1 + DEG) + ' and ' + B(t2 + DEG) + ' (angles measured from east). In which direction does the total force point, in degrees?', ans: mid, unit: DEG,
          how: [W('the two arrows are the same length, so they make a rhombus', 'the parallelogram rule'), W('the sum is the rhombus\'s diagonal, halfway between them', 'a rhombus diagonal cuts the angle in half'), '(' + t1 + '° + ' + t2 + '°) ÷ 2 = ' + B(mid) + DEG],
          steps: [st('Add the two angles:', t1 + t2), st('Halve it:', mid)],
          traps: TR([tr(t1 + t2, 'r_vecsum', 'Halfway between means the average: halve the sum of the angles.'), tr(gap / 2, 'r_vecsum', 'Halve the gap and add it to ' + t1 + '°, or average the two angles.'), tr(gap, 'r_vecsum', 'The direction is halfway between the two forces.')]) };
      }
      const F = R.i(2, 12), phi = R.pick([60, 90, 120]), rr = phi === 60 ? 3 : phi === 90 ? 2 : 1, c2 = phi === 60 ? 3 * F * F : phi === 90 ? 2 * F * F : F * F;
      const cosS = phi === 60 ? fs(1, 2) : phi === 90 ? '0' : '(' + MINUS + fs(1, 2) + ')', two = 2 * F * F, last = phi === 60 ? F * F : phi === 90 ? 0 : -F * F;
      return { text: 'Two forces of ' + B(F + ' N') + ' each act on a box, ' + B(phi + DEG) + ' apart. ' + (rr === 1 ? 'What is the size of the total force, in N?' : 'The total force is k' + rt(rr) + ' N. What is k?'), ans: F,
        how: [W('|u + v|² = ' + sq(F) + ' + ' + sq(F) + ' + 2 × ' + F + ' × ' + F + ' × cos ' + phi + DEG, 'φ = ' + phi + '° is the angle between the arrows'), '= ' + F * F + ' + ' + F * F + ' + ' + two + ' × ' + cosS + ' = ' + (2 * F * F) + (last < 0 ? M + (-last) : ' + ' + last) + ' = ' + c2,
          rr === 1 ? '|u + v| = ' + rt(c2) + ' = ' + B(F) + ' N' : W('|u + v| = ' + rt(c2) + ' = ' + rad(F, rr) + ', so k = ' + B(F), c2 + ' = ' + F * F + ' × ' + rr)],
        steps: [st(B('2 × ' + F + ' × ' + F + ' × cos ' + phi + DEG) + ' = ?', last), st('|u + v|² = ?', c2), st(rr === 1 ? '|u + v| = ?' : 'k = ?', F)],
        traps: TR([tr(2 * F, 'r_vecsum', 'Forces at an angle do not just add their sizes.'), tr(c2, 'w_roots', 'That is the size squared.'), phi !== 90 ? tr(phi === 60 ? F * F : 3 * F * F, 'r_unit', 'cos ' + phi + '° is ' + (phi === 60 ? 'positive, ½' : 'negative, ' + MINUS + '½') + '.') : null]) };
    }
    const L60 = [[3, 5, 7], [7, 8, 13], [5, 16, 19], [6, 10, 14]], L120 = [[3, 8, 7], [5, 8, 7], [7, 15, 13], [8, 15, 13], [5, 21, 19], [16, 21, 19]];
    const phi = R.pick([60, 120]), [r1, r2, c] = R.pick(phi === 60 ? L60 : L120).slice(), t1 = 10 * R.i(0, 20), t2 = t1 + phi, sw = R.chance(.5), m1 = sw ? r2 : r1, m2 = sw ? r1 : r2;
    const cr = phi === 60 ? m1 * m2 : -m1 * m2, s2 = m1 * m1 + m2 * m2, alt = s2 - cr, altR = Math.round(Math.sqrt(alt));
    return { text: 'Force u is ' + B(m1 + ' N at ' + t1 + DEG) + ' and force v is ' + B(m2 + ' N at ' + t2 + DEG) + ' (angles measured from east). What is the size of u + v, in N?', ans: c,
      how: [W('angle between them: ' + t2 + '° ' + MINUS + ' ' + t1 + '° = ' + phi + DEG, 'subtract the directions'), W('|u + v|² = ' + sq(m1) + ' + ' + sq(m2) + ' + 2 × ' + m1 + ' × ' + m2 + ' × cos ' + phi + DEG, '|u|² + |v|² + 2|u||v| cos φ'),
        '= ' + m1 * m1 + ' + ' + m2 * m2 + (cr < 0 ? M + (-cr) : ' + ' + cr) + ' = ' + c * c, '|u + v| = ' + rt(c * c) + ' = ' + B(c) + ' N'],
      steps: [st('What is the angle between the two forces?', phi), st('|u + v|² = ?', c * c), st('|u + v| = ?', c)],
      traps: TR([tr(m1 + m2, 'r_vecsum', 'Forces at an angle do not just add their sizes.'), tr(c * c, 'w_roots', 'Take the square root.'), altR * altR === alt ? tr(altR, 'r_lawcos', 'For a sum use + 2|u||v| cos φ with φ the angle between the arrows; the triangle\'s inside angle is 180° ' + MINUS + ' φ.') : null]) };
  } },

{ id: 'r_vecvel', s: 'trig', g: 12, title: 'Velocity vectors', pre: ['x_rate'], paper: true, cc: ['N-VM.A.3'],
  tip: 'Velocities add as vectors. A boat going 12 km/h north in a 5 km/h current flowing east moves ⟨5, 12⟩, so its ground speed is √(5² + 12²) = 13 km/h.',
  gen(d, R) {
    if (d === 0) {
      const [p, q, c] = triple(R, 6), k = R.i(1, 3), vb = k * q, vc = k * p;
      return { text: 'A boat heads due north at ' + B(vb + ' km/h') + ' through water flowing east at ' + B(vc + ' km/h') + '. What is its speed over the ground, in km/h?', ans: k * c,
        how: [W('velocity = ' + vec(vc, vb), 'add the two velocities: east is x, north is y'), W('speed = ' + rt(sq(vc) + ' + ' + sq(vb)) + ' = ' + rt(k * k * c * c), 'the length of the velocity'), '= ' + B(k * c) + ' km/h'],
        steps: [st(B(sq(vc) + ' + ' + sq(vb)) + ' = ?', k * k * c * c), st('Speed = ?', k * c)],
        traps: TR([tr(vb + vc, 'r_vecvel', 'The two velocities are at right angles: add them as arrows.'), tr(Math.abs(vb - vc), 'r_vecvel', 'Combine the velocities with Pythagoras.'), tr(vb, 'r_vecvel', 'The current pushes the boat sideways too.')]) };
    }
    if (d === 1) {
      if (R.chance(.5)) {
        const [p, q, c] = triple(R, 5), k = R.i(1, 2), s = k * c, cur = k * p, across = k * q;
        return { text: 'A boat goes ' + B(s + ' km/h') + ' in still water. A river flows at ' + B(cur + ' km/h') + '. The boat aims upstream at an angle so that it goes straight across. What is its speed straight across, in km/h?', ans: across,
          how: [W('boat velocity in the water + current = straight across', 'its upstream part cancels the current'), W('across² + ' + sq(cur) + ' = ' + sq(s), 'Pythagoras: the boat\'s speed is the long side'), 'across = ' + rt(sq(s) + M + sq(cur)) + ' = ' + rt(across * across) + ' = ' + B(across) + ' km/h'],
          steps: [st(B(sq(s) + M + sq(cur)) + ' = ?', across * across), st('Speed across = ?', across)],
          traps: TR([tr(s - cur, 'r_vecvel', 'The speeds are at right angles: use Pythagoras, not taking away.'), tr(Math.round(Math.sqrt(s * s + cur * cur)) ** 2 === s * s + cur * cur ? Math.round(Math.sqrt(s * s + cur * cur)) : null, 'r_leg', 'The boat\'s own speed is the long side, so take away the squares.'), tr(s, 'r_vecvel', 'Part of the boat\'s speed is used to fight the current.')]) };
      }
      const [p, q, c] = triple(R, 6), sx = 10 * p, sy = 10 * q, wx = 10 * nz(R, -5, 5), wy = 10 * R.i(-5, 5), px = sx - wx, py = sy - wy;
      if (px <= 0 || py <= 0) return null;
      return { text: 'A plane\'s velocity in still air is ' + B(vec(px, py)) + ' km/h (east, north). The wind adds ' + B(vec(wx, wy)) + ' km/h. What is the plane\'s ground speed, in km/h?', ans: 10 * c,
        how: [W('ground velocity = ⟨' + px + ' + ' + par2(wx) + ', ' + py + ' + ' + par2(wy) + '⟩ = ' + vec(sx, sy), 'add the plane and the wind'), W('speed = ' + rt(sq(sx) + ' + ' + sq(sy)) + ' = ' + rt(100 * c * c), 'the length of the velocity'), '= ' + B(10 * c) + ' km/h'],
        steps: [st('The east part of the ground velocity?', sx), st('The north part?', sy), st('Ground speed?', 10 * c)],
        traps: TR([tr(sx + sy, 'r_pyth', 'Speed is √(x² + y²), not x + y.'), Number.isInteger(Math.sqrt(px * px + py * py)) ? tr(Math.sqrt(px * px + py * py), 'r_vecvel', 'Add the wind first, then find the length.') : null]) };
    }
    if (R.chance(.5)) {
      const v = R.i(2, 6), cur = R.i(1, 4), t = 5 * R.i(2, 12), w = v * t, drift = cur * t;
      return { text: 'A river is ' + B(w + ' m') + ' wide and flows at ' + B(cur + ' m/s') + '. A boat points straight across at ' + B(v + ' m/s') + '. How far downstream does it land, in meters?', ans: drift,
        how: [W('time to cross = ' + w + ' ÷ ' + v + ' = ' + t + ' s', 'only the across part of the velocity gets it across'), W('drift = ' + cur + ' × ' + t + ' = ' + B(drift) + ' m', 'the current carries it downstream the whole time')],
        steps: [st('How many seconds does it take to cross?', t), st('How far does the current carry it in that time?', drift)],
        traps: TR([tr(w, 'r_vecvel', 'The current moves it downstream while it crosses; find the time first.'), tr(w * cur, 'r_vecvel', 'Find the crossing time first: width ÷ speed across.'), tr(t, 'x_rate', 'That is the time. Multiply by the current to get the distance.')]) };
    }
    const [p, q, c] = triple(R, 5), s = c, cur = p, across = q, t = 5 * R.i(2, 12), w = across * t;
    return { text: 'A boat goes ' + B(s + ' m/s') + ' in still water. It aims upstream so that it goes straight across a river ' + B(w + ' m') + ' wide that flows at ' + B(cur + ' m/s') + '. How many seconds does it take to cross?', ans: t,
      how: [W('speed across = ' + rt(sq(s) + M + sq(cur)) + ' = ' + rt(across * across) + ' = ' + across + ' m/s', 'part of its velocity cancels the current'), W('time = ' + w + ' ÷ ' + across + ' = ' + B(t) + ' s', 'time = distance ÷ speed')],
      steps: [st('What is its speed straight across, in m/s?', across), st('Time to cross = ?', t)],
      traps: TR([tr(w / s, 'r_vecvel', 'Only the across part of its velocity gets it across.'), tr(w / (s - cur), 'r_vecvel', 'Velocities at right angles combine with Pythagoras, not by taking away.'), tr(w / (s + cur), 'r_vecvel', 'Find the speed straight across with Pythagoras.')]) };
  } },

/* ======================= Inverse functions ======================= */
{ id: 'x_invtable', s: 'alg', g: 12, title: 'Inverse values from a table', pre: ['p_machine'], cc: ['F-BF.B.4c'],
  tip: 'f⁻¹ undoes f: f⁻¹(12) asks which input gives 12. Find 12 in the f(x) row and read the x above it. If f(3) = 12, then f⁻¹(12) = 3.',
  gen(d, R) {
    const n = d === 0 ? 5 : 6, x0 = d === 0 ? 1 : R.i(-2, 1), xs = [], ys = []; let y = R.i(-4, 6);
    for (let i = 0; i < n; i++) { if (i) y += R.i(1, d === 0 ? 5 : 7); xs.push(x0 + i); ys.push(y); }
    const vis = table([['x'].concat(xs), ['f(x)'].concat(ys)]), F = 'f<sup>' + MINUS + '1</sup>', fOf = v => (xs.includes(v) ? ys[xs.indexOf(v)] : null);
    const look = (i, nt) => W(F + '(' + num(ys[i]) + ') = ' + num(xs[i]), nt || 'find ' + num(ys[i]) + ' in the f(x) row and read the x above it');
    if (d === 0) {
      const i = R.i(0, n - 1), yv = ys[i];
      return { text: 'The table shows f. What is ' + B(F + '(' + num(yv) + ')') + '?', ans: xs[i], vis,
        how: [W(F + '(' + num(yv) + ') is the x that f turns into ' + num(yv), 'the inverse runs the table backwards'), W('f(' + num(xs[i]) + ') = ' + num(yv), 'find ' + num(yv) + ' in the f(x) row'), F + '(' + num(yv) + ') = ' + B(num(xs[i]))],
        steps: [st('Find ' + B(num(yv)) + ' in the f(x) row. Which x is above it?', xs[i])],
        traps: TR([tr(fOf(yv), 'x_invtable', F + '(' + num(yv) + ') means find ' + num(yv) + ' in the f(x) row, not the x row.'), tr(yv, 'x_invtable', F + '(' + num(yv) + ') is an x-value: the x above ' + num(yv) + ' in the table.'), tr(yv ? 1 / yv : null, 'x_inverse', F + ' is the inverse function, not 1 over f.')]) };
    }
    if (d === 1) {
      const i = R.i(0, n - 1), j = R.i(0, n - 1), ans = xs[i] + ys[j], wrong = fOf(ys[i]);
      return { text: 'The table shows f. What is ' + B(F + '(' + num(ys[i]) + ') + f(' + num(xs[j]) + ')') + '?', ans, vis,
        how: [look(i), W('f(' + num(xs[j]) + ') = ' + num(ys[j]), 'find ' + num(xs[j]) + ' in the x row'), num(xs[i]) + ' + ' + par2(ys[j]) + ' = ' + B(num(ans))],
        steps: [st('What is ' + B(F + '(' + num(ys[i]) + ')') + '?', xs[i]), st('What is ' + B('f(' + num(xs[j]) + ')') + '?', ys[j]), st('Add them:', ans)],
        traps: TR([wrong != null ? tr(wrong + ys[j], 'x_invtable', F + '(' + num(ys[i]) + ') means find ' + num(ys[i]) + ' in the f(x) row.') : null, tr(xs[i] + xs[j], 'x_invtable', 'f(' + num(xs[j]) + ') is in the f(x) row, under ' + num(xs[j]) + '.'), tr(ys[i] + ys[j], 'x_invtable', F + '(' + num(ys[i]) + ') is an x-value: read the x above ' + num(ys[i]) + '.')]) };
    }
    if (R.chance(.5)) {
      const i = R.i(0, n - 2), j = R.i(i + 1, n - 1), k = ys[j] - ys[i];
      return { text: 'The table shows f. What is ' + B(F + '(f(' + num(xs[i]) + ') + ' + k + ')') + '?', ans: xs[j], vis,
        how: [W('f(' + num(xs[i]) + ') = ' + num(ys[i]), 'work from the inside out'), W(num(ys[i]) + ' + ' + k + ' = ' + num(ys[j])), W(F + '(' + num(ys[j]) + ') = ' + B(num(xs[j])), 'find ' + num(ys[j]) + ' in the f(x) row')],
        steps: [st('What is ' + B('f(' + num(xs[i]) + ')') + '?', ys[i]), st('Add ' + k + ':', ys[j]), st('Now ' + F + ' of that?', xs[j])],
        traps: TR([tr(xs[i] + k, 'x_invtable', 'f and ' + F + ' only cancel when nothing is in between them.'), tr(ys[j], 'x_invtable', 'One more step: find ' + num(ys[j]) + ' in the f(x) row and read its x.'), tr(fOf(ys[j]), 'x_invtable', F + ' means read the table backwards: f(x) row to x row.')]) };
    }
    const i = R.i(0, n - 2), yv = ys[i];
    return { text: 'The table shows f. What is ' + B('f(' + F + '(' + num(yv) + ') + 1)') + '?', ans: ys[i + 1], vis,
      how: [look(i), W(num(xs[i]) + ' + 1 = ' + num(xs[i + 1])), W('f(' + num(xs[i + 1]) + ') = ' + B(num(ys[i + 1])), 'find ' + num(xs[i + 1]) + ' in the x row')],
      steps: [st('What is ' + B(F + '(' + num(yv) + ')') + '?', xs[i]), st('Add 1:', xs[i + 1]), st('Now f of that?', ys[i + 1])],
      traps: TR([tr(yv + 1, 'x_invtable', 'f and ' + F + ' only cancel when nothing is in between them.'), tr(xs[i + 1], 'x_invtable', 'Finish with f: look up f(' + num(xs[i + 1]) + ').')]) };
  } },

{ id: 'x_restrict', s: 'alg', g: 12, title: 'Restrict the domain to invert', pre: ['w_roots'], cc: ['F-BF.B.4d'],
  tip: 'A parabola fails the horizontal line test, so keep one side of its vertex. f(x) = (x − 3)² + 1 is one-to-one for x ≥ 3. There f⁻¹(10): (x − 3)² = 9, x − 3 = 3, x = 6.',
  gen(d, R) {
    const F = 'f<sup>' + MINUS + '1</sup>', h = nz(R, -6, 6), k = nz(R, -9, 9), xb = 'x ' + signed(-h), ge = R.chance(.6), sideS = 'x ' + (ge ? GE : LE) + ' ' + num(h);
    if (d === 0) {
      const absF = R.chance(.3), expr = (absF ? '|' + xb + '|' : sqS(xb)) + ' ' + signed(k);
      return { text: B('f(x) = ' + expr) + ' is one-to-one (so it has an inverse) on ' + B('x ' + (ge ? GE : LE) + ' c') + '. What is the ' + (ge ? 'smallest' : 'largest') + ' c that works?', ans: h,
        how: [W('the vertex is at x = ' + num(h), (absF ? '|' + xb + '|' : sqS(xb)) + ' is smallest when ' + xb + ' = 0'), W('on each side of x = ' + num(h) + ' the graph only goes one way', 'so each side passes the horizontal line test'), (ge ? 'smallest' : 'largest') + ' c = ' + B(num(h))],
        steps: [st('Where is ' + B(xb) + ' equal to 0? x = ?', h)],
        traps: TR([tr(-h, 'x_vertex', 'Inside ' + xb + ' the vertex is at x = ' + num(h) + ': watch the sign.'), tr(k, 'x_restrict', 'c is an x-value: use the vertex\'s x, not its y.')]) };
    }
    const s = R.i(1, 6), a = d === 2 && R.chance(.5) ? R.pick([2, 3]) : 1, expand = d === 2 && a === 1, yv = k + a * s * s, ans = ge ? h + s : h - s, other = ge ? h - s : h + s;
    const shown = expand ? poly([1, -2 * h, h * h + k]) : (a === 1 ? '' : a) + sqS(xb) + ' ' + signed(k);
    const lines = [];
    if (expand) lines.push(W('f(x) = ' + sqS(xb) + ' ' + signed(k), 'complete the square: half of ' + num(-2 * h) + ' is ' + num(-h) + ', and ' + num(h * h + k) + M + h * h + ' = ' + num(k)));
    lines.push(W((a === 1 ? '' : a) + sqS(xb) + ' ' + signed(k) + ' = ' + num(yv), F + '(' + num(yv) + ') is the x where f(x) = ' + num(yv)));
    if (a > 1) lines.push(W(a + sqS(xb) + ' = ' + a * s * s, k > 0 ? 'take ' + k + ' from both sides' : 'add ' + (-k) + ' to both sides'), W(sqS(xb) + ' = ' + s * s, 'divide by ' + a));
    else lines.push(W(sqS(xb) + ' = ' + s * s, k > 0 ? 'take ' + k + ' from both sides' : 'add ' + (-k) + ' to both sides'));
    lines.push(W(xb + ' = ' + s + ' or ' + MINUS + s, 'square root both sides'), W('x = ' + num(h + s) + ' or ' + num(h - s) + '; on ' + sideS + ' it is ' + B(num(ans)), 'keep the root on the allowed side'));
    return { text: B('f(x) = ' + shown) + ' with ' + B(sideS) + '. What is ' + B(F + '(' + num(yv) + ')') + '?', ans, how: lines,
      steps: [st('Solve for ' + B(sqS(xb)) + ' when f(x) = ' + num(yv) + ':', s * s), st(B(xb) + ' = ? (the root that fits ' + sideS + ')', ge ? s : -s), st('x = ?', ans)],
      traps: TR([tr(other, 'x_restrict', 'Keep the root on the allowed side: ' + sideS + '.'), tr(ge ? h + s * s : h - s * s, 'w_roots', 'Take the square root of ' + s * s + '.'), tr(ge ? s : -s, 'x_restrict', 'Add ' + num(h) + ' back: x = ' + num(h) + (ge ? ' + ' : M) + s + '.'), a > 1 ? tr(ge ? h + Math.sqrt(a * s * s) : h - Math.sqrt(a * s * s), 'x_restrict', 'Divide by ' + a + ' before taking the square root.') : null]) };
  } },

/* ======================= Matrices ======================= */
{ id: 'x_matscale', s: 'alg', g: 12, title: 'Multiply a matrix by a number', pre: ['n_intmul'], cc: ['N-VM.C.7'],
  tip: 'A number times a matrix multiplies every entry. 3 times rows (2, −1) and (4, 0) gives rows (6, −3) and (12, 0). For 2A − B, scale each matrix first, then subtract entry by entry.',
  gen(d, R) {
    const rows = d === 0 ? 2 : R.pick([2, 3]), cols = d === 0 ? 2 : R.pick([2, 3]);
    const mk = (lo, hi) => { const A = []; for (let i = 0; i < rows; i++) { const r = []; for (let j = 0; j < cols; j++) r.push(R.i(lo, hi)); A.push(r); } return A; };
    const i = R.i(0, rows - 1), j = R.i(0, cols - 1), pos = 'row ' + (i + 1) + ', column ' + (j + 1), A = mk(d === 0 ? 0 : -9, 9);
    if (A[i][j] === 0) return null;
    const swapV = rows === cols && i !== j ? A[j][i] : null;
    if (d < 2) {
      const k = d === 0 ? R.i(2, 6) : nz(R, -6, 6); if (Math.abs(k) === 1) return null;
      const kA = A.map(r => r.map(v => k * v)), ans = kA[i][j];
      return { text: 'A has rows ' + B(rowsT(A)) + '. What is the ' + B(pos) + ' entry of ' + B(num(k) + 'A') + '?', ans, vis: mat(A),
        how: [W(num(k) + 'A has rows ' + rowsT(kA), 'multiply every entry by ' + num(k)), W(pos + ': ' + par2(k) + ' × ' + par2(A[i][j]) + ' = ' + B(num(ans)), 'row first, then column')],
        steps: [st('What is the ' + pos + ' entry of A?', A[i][j]), st('Times ' + num(k) + ':', ans)],
        traps: TR([tr(k + A[i][j], 'x_matscale', 'Multiply each entry by ' + num(k) + '; do not add.'), swapV != null ? tr(k * swapV, 'x_matscale', 'Row first, then column: row ' + (i + 1) + ', column ' + (j + 1) + '.') : null, tr(-ans, 'n_intmul', 'Check the sign of ' + par2(k) + ' × ' + par2(A[i][j]) + '.')]) };
    }
    const k = nz(R, -4, 4), m = nz(R, -4, 4), Bm = mk(-9, 9); if (Math.abs(k) === 1) return null;
    const a = A[i][j], b = Bm[i][j], ans = k * a + m * b, expr = term(k, 'A') + ' ' + (m < 0 ? MINUS : '+') + ' ' + term(Math.abs(m), 'B');
    return { text: 'A has rows ' + B(rowsT(A)) + ' and B has rows ' + B(rowsT(Bm)) + '. What is the ' + B(pos) + ' entry of ' + B(expr) + '?', ans,
      how: [W(term(k, 'A') + ': ' + par2(k) + ' × ' + par2(a) + ' = ' + num(k * a), pos + ' of A is ' + num(a)), W(term(m, 'B') + ': ' + par2(m) + ' × ' + par2(b) + ' = ' + num(m * b), pos + ' of B is ' + num(b)),
        W(num(k * a) + ' + ' + par2(m * b) + ' = ' + B(num(ans)), 'combine the matching entries')],
      steps: [st('The ' + pos + ' entry of ' + B(term(k, 'A')) + '?', k * a), st('The ' + pos + ' entry of ' + B(term(m, 'B')) + '?', m * b), st('Combine them:', ans)],
      traps: TR([tr(k * a - m * b, 'n_intsub', 'Keep the sign of ' + term(m, 'B') + ' when you combine.'), tr(k * a + (m < 0 ? -b : b), 'x_matscale', 'Multiply B by ' + Math.abs(m) + ' too.'), tr(k * (a + b), 'x_matscale', 'Scale A by ' + num(k) + ' and B by ' + num(m) + ' separately.')]) };
  } },

{ id: 'x_matmul', s: 'alg', g: 12, title: 'Add and multiply matrices', pre: ['n_intmul'], paper: true, cc: ['N-VM.C.8'],
  tip: 'Add matrices entry by entry. To multiply, the row 1, column 2 entry of AB is row 1 of A times column 2 of B: pair them up, multiply, add. (1, 2) with (0, 2): 1 × 0 + 2 × 2 = 4.',
  gen(d, R) {
    const mk = (r, c, lo, hi) => { const A = []; for (let i = 0; i < r; i++) { const row = []; for (let j = 0; j < c; j++) row.push(R.i(lo, hi)); A.push(row); } return A; };
    if (d === 0) {
      const cols = R.pick([2, 3]), A = mk(2, cols, -9, 9), Bm = mk(2, cols, -9, 9), i = R.i(0, 1), j = R.i(0, cols - 1), sub = R.chance(.5), a = A[i][j], b = Bm[i][j], ans = sub ? a - b : a + b, pos = 'row ' + (i + 1) + ', column ' + (j + 1);
      if (!b) return null;
      return { text: 'A has rows ' + B(rowsT(A)) + ' and B has rows ' + B(rowsT(Bm)) + '. What is the ' + B(pos) + ' entry of ' + B('A ' + (sub ? MINUS : '+') + ' B') + '?', ans,
        how: [W(pos + ': A has ' + num(a) + ', B has ' + num(b), (sub ? 'subtract' : 'add') + ' matching entries only'), num(a) + (sub ? M : ' + ') + par2(b) + ' = ' + B(num(ans))],
        steps: [st('The ' + pos + ' entry of A?', a), st('The ' + pos + ' entry of B?', b), st((sub ? 'Subtract' : 'Add') + ':', ans)],
        traps: TR([tr(a * b, 'x_matmul', (sub ? 'Subtracting' : 'Adding') + ' matrices goes entry by entry: ' + (sub ? 'subtract' : 'add') + ', do not multiply.'), tr(sub ? a + b : a - b, 'n_intsub', 'Check the sign: ' + num(a) + (sub ? M : ' + ') + par2(b) + '.'), sub ? tr(b - a, 'x_matmul', 'A ' + MINUS + ' B: the entry of A comes first.') : null]) };
    }
    const three = d === 2 && R.chance(.5), ba = d === 2 && !three;
    const n = three ? 3 : 2, A = mk(2, n, -5, 6), Bm = mk(n, 2, -5, 6), i = R.i(0, 1), j = R.i(0, 1), pos = 'row ' + (i + 1) + ', column ' + (j + 1);
    const L = ba ? Bm : A, Rt = ba ? A : Bm, row = L[i], col = Rt.map(r => r[j]), prods = row.map((v, t) => v * col[t]), ans = sum(prods);
    const wrongOrder = ba ? sum(A[i].map((v, t) => v * Bm[t][j])) : sum(Bm[i].map((v, t) => v * A[t][j]));
    return { text: 'A has rows ' + B(rowsT(A)) + ' and B has rows ' + B(rowsT(Bm)) + '. What is the ' + B(pos) + ' entry of ' + B(ba ? 'BA' : 'AB') + '?', ans,
      how: [W('row ' + (i + 1) + ' of ' + (ba ? 'B' : 'A') + ' is ' + rowS(row) + ', column ' + (j + 1) + ' of ' + (ba ? 'A' : 'B') + ' is ' + rowS(col), 'row of the first times column of the second'),
        W(row.map((v, t) => (t ? par2(v) : num(v)) + ' × ' + par2(col[t])).join(' + '), 'pair them up and multiply'), '= ' + prods.map((v, t) => (t ? par2(v) : num(v))).join(' + ') + ' = ' + B(num(ans))],
      steps: row.map((v, t) => st('Pair ' + (t + 1) + ': ' + B(num(v) + ' × ' + par2(col[t])) + ' = ?', prods[t])).concat([st('Add them:', ans)]),
      traps: TR([n === 2 ? tr(A[i][j] * Bm[i][j], 'x_matmul', 'Multiply a whole row by a whole column, then add; not entry by entry.') : null, n === 2 ? tr(wrongOrder, 'x_matmul', ba ? 'BA is not AB: use a row of B and a column of A.' : 'Use a row of the first matrix, A, and a column of the second, B.') : null,
        n === 2 ? tr(sum(row.map((v, t) => v * Rt[j][t])), 'x_matmul', 'Go down the column of the second matrix, not across its row.') : null, prods.length > 1 && prods[1] ? tr(ans - 2 * prods[1], 'n_intmul', 'Check the sign of ' + num(row[1]) + ' × ' + par2(col[1]) + '.') : null]) };
  } },

{ id: 'x_matvec', s: 'alg', g: 12, title: 'A matrix times a vector', pre: ['n_intmul'], cc: ['N-VM.C.11'],
  tip: 'A matrix times a vector: each row times the vector. Rows (2, 1) and (−1, 3) times ⟨4, 5⟩: 2 × 4 + 1 × 5 = 13 and −1 × 4 + 3 × 5 = 11, so ⟨13, 11⟩.',
  gen(d, R) {
    const mk = (n, lo, hi) => { const A = []; for (let i = 0; i < n; i++) { const r = []; for (let j = 0; j < n; j++) r.push(R.i(lo, hi)); A.push(r); } return A; };
    const dot = (r, v) => sum(r.map((x, t) => x * v[t])), rowLine = (r, v) => r.map((x, t) => (t ? par2(x) : num(x)) + ' × ' + par2(v[t])).join(' + ');
    const LET = ['a', 'b', 'c'];
    if (d < 2 || R.chance(.5)) {
      const n = d === 2 ? 3 : 2, A = mk(n, d === 0 ? 0 : -6, 6), v = []; for (let t = 0; t < n; t++) v.push(R.i(d === 0 ? 0 : -6, 9));
      if (d === 1 && A.every(r => r.every(x => x >= 0))) return null;
      const out = A.map(r => dot(r, v)), k = R.i(0, n - 1), ans = out[k], colV = sum(A.map((r, t) => r[k] * v[t]));
      const lines = [W('each entry is a row of the matrix times the vector')];
      A.forEach((r, t) => { if (t !== k) lines.push(LET[t] + ' = ' + rowLine(r, v) + ' = ' + num(out[t])); });
      lines.push(LET[k] + ' = ' + rowLine(A[k], v) + ' = ' + B(num(ans)));
      return { text: 'The matrix with rows ' + B(rowsT(A)) + ' times the vector ' + B(vec(...v)) + ' is ' + B('⟨' + LET.slice(0, n).join(', ') + '⟩') + '. What is ' + B(LET[k]) + '?', ans, vis: mat(A),
        how: lines,
        steps: [st('Which row gives ' + LET[k] + '? Type its number.', k + 1), st(B(rowLine(A[k], v)) + ' = ?', ans)],
        traps: TR([tr(colV, 'x_matvec', 'Go across a row of the matrix, not down a column.'), tr(out[(k + 1) % n], 'x_matvec', LET[k] + ' comes from row ' + (k + 1) + '.'), tr(sum(A[k]) * sum(v), 'x_matvec', 'Multiply matching pairs, then add.')]) };
    }
    const A = mk(2, -3, 3), v = [R.i(-5, 5), R.i(-5, 5)], w = A.map(r => dot(r, v)), out = A.map(r => dot(r, w)), k = R.i(0, 1), ans = out[k];
    if (A.every(r => r.every(x => x === 0)) || (v[0] === 0 && v[1] === 0)) return null;
    return { text: 'A has rows ' + B(rowsT(A)) + ' and v = ' + B(vec(...v)) + '. ' + B('A(Av) = ⟨a, b⟩') + '. What is ' + B(LET[k]) + '?', ans, vis: mat(A),
      how: [W('Av = ⟨' + rowLine(A[0], v) + ', ' + rowLine(A[1], v) + '⟩ = ' + vec(...w), 'each row times v'), W(LET[k] + ' = ' + rowLine(A[k], w) + ' = ' + B(num(ans)), 'now row ' + (k + 1) + ' times Av')],
      steps: [st('The first entry of Av?', w[0]), st('The second entry of Av?', w[1]), st(LET[k] + ' = ?', ans)],
      traps: TR([tr(w[k], 'x_matvec', 'That is Av. Multiply by A once more.'), tr(sum(A.map((r, t) => r[k] * w[t])), 'x_matvec', 'Go across a row of A, not down a column.')]) };
  } },

{ id: 'x_detarea', s: 'alg', g: 12, title: 'The determinant scales area', pre: ['g_para'], cc: ['N-VM.C.12'],
  tip: 'A 2 × 2 matrix stretches every area by |det| = |ad − bc|. Rows (3, 1) and (1, 2): det = 6 − 1 = 5, so the unit square becomes a parallelogram of area 5.',
  gen(d, R) {
    const lo = d === 0 ? 1 : -6, a = R.i(lo, 6), b = R.i(d === 0 ? 0 : -6, 6), c = R.i(d === 0 ? 0 : -6, 6), e = R.i(lo, 6), det = a * e - b * c, ad = Math.abs(det);
    if (!det || (d === 0 && det < 0) || (d === 1 && det > 0 && R.chance(.5))) return null;
    const detLine = W('det = ' + num(a) + ' × ' + par2(e) + M + par2(b) + ' × ' + par2(c) + ' = ' + num(det), 'ad ' + MINUS + ' bc'), Mt = 'the matrix with rows ' + B(rowsT([[a, b], [c, e]])), Mt0 = 'The' + Mt.slice(3);
    if (d === 0) return { text: Mt0 + ' maps the unit square to a parallelogram. What is its area?', ans: ad, vis: mat([[a, b], [c, e]]),
      how: [detLine, W('area = ' + num(det) + ' × 1 = ' + B(ad), 'areas are multiplied by the determinant; the unit square has area 1')],
      steps: [st('What is ' + B(num(a) + ' × ' + par2(e)) + '?', a * e), st('What is ' + B(num(b) + ' × ' + par2(c)) + '?', b * c), st('The area?', ad)],
      traps: TR([tr(a * e + b * c, 'x_matrix', 'The determinant is ad ' + MINUS + ' bc, not plus.'), tr(a + b + c + e, 'x_detarea', 'The area scale is the determinant, not the sum of the entries.'), tr(a * e, 'x_matrix', 'Take away bc too.')]) };
    if (d === 1) {
      const S = R.i(2, 9), ans = ad * S;
      return { text: 'A shape of area ' + B(S) + ' is transformed by ' + Mt + '. What is the area of the new shape?', ans, vis: mat([[a, b], [c, e]]),
        how: [detLine, W('area scale = |' + num(det) + '| = ' + ad, det < 0 ? 'a negative determinant only flips the shape over' : 'areas are multiplied by |det|'), 'new area = ' + ad + ' × ' + S + ' = ' + B(ans)],
        steps: [st('What is the determinant?', det), st('The new area?', ans)],
        traps: TR([det < 0 ? tr(det * S, 'n_abs', 'An area cannot be negative: use |det|.') : null, tr(ad, 'x_detarea', 'Multiply by the old area, ' + S + ', too.'), tr(Math.abs(a * e + b * c) * S, 'x_matrix', 'The determinant is ad ' + MINUS + ' bc.')]) };
    }
    if (R.chance(.5)) {
      const S = R.i(2, 9), big = ad * S;
      return { text: Mt0 + ' turns a shape into one of area ' + B(big) + '. What was the area of the original shape?', ans: S,
        how: [detLine, W('new area = |' + num(det) + '| × old area', 'areas are multiplied by |det|'), W('old area = ' + big + ' ÷ ' + ad + ' = ' + B(S), 'divide to undo')],
        steps: [st('What is |det|?', ad), st('Old area = ?', S)],
        traps: TR([tr(big * ad, 'x_detarea', 'The new shape is the bigger one: divide by |det| to go back.'), tr(det < 0 ? -S : null, 'n_abs', 'An area cannot be negative: use |det|.'), tr(Math.abs(a * e + b * c) ? big / Math.abs(a * e + b * c) : null, 'x_matrix', 'The determinant is ad ' + MINUS + ' bc.')]) };
    }
    const r = Math.max(6, Math.abs(a), Math.abs(c), Math.abs(b), Math.abs(e), Math.abs(a + b), Math.abs(c + e)); if (r > 10) return null;
    return { text: 'A parallelogram has corners ' + B('(0, 0)') + ', ' + B(pt(a, c)) + ', ' + B(pt(b, e)) + ' and ' + B(pt(a + b, c + e)) + '. What is its area?', ans: ad,
      vis: plotSVG([{ x: 0, y: 0 }, { x: a, y: c }, { x: b, y: e }, { x: a + b, y: c + e }], { r }),
      how: [W('its sides from (0, 0) are ⟨' + num(a) + ', ' + num(c) + '⟩ and ⟨' + num(b) + ', ' + num(e) + '⟩', 'they are the columns of the matrix with rows ' + rowsT([[a, b], [c, e]])), W(detLine), 'area = |' + num(det) + '| = ' + B(ad)],
      steps: [st('What is the determinant of rows ' + B(rowsT([[a, b], [c, e]])) + '?', det), st('The area?', ad)],
      traps: TR([det < 0 ? tr(det, 'n_abs', 'An area cannot be negative: take |det|.') : null, tr(Math.abs(a * e + b * c), 'x_matrix', 'The determinant is ad ' + MINUS + ' bc.'), tr(Math.abs(a * e), 'x_detarea', 'Take away the other diagonal, bc, too.')]) };
  } },

{ id: 'x_matinv', s: 'alg', g: 12, title: 'Inverse of a 2 × 2 matrix', pre: ['s_system'], paper: true, cc: ['A-REI.C.9'],
  tip: 'For rows (a, b) and (c, d) the inverse is 1/(ad − bc) times rows (d, −b) and (−c, a): swap a and d, change the signs of b and c, divide by the determinant. Then ⟨x, y⟩ = A⁻¹ times the right side.',
  gen(d, R) {
    const pick = (lo, hi, dets) => { for (let t = 0; t < 400; t++) { const a = R.i(lo, hi), b = R.i(lo, hi), c = R.i(lo, hi), e = R.i(lo, hi); if (a && b && c && e && dets.includes(a * e - b * c)) return [a, b, c, e]; } return null; };
    const INV = 'A<sup>' + MINUS + '1</sup>';
    const m = pick(d === 0 ? 1 : -9, 9, d === 1 ? [-1, 2, -2, 3, -3] : d === 0 ? [1] : [1, -1]); if (!m) return null;
    const [a, b, c, e] = m, det = a * e - b * c, adj = [[e, -b], [-c, a]], orig = [[a, b], [c, e]], Mt = rowsT(orig);
    const detLine = W('det = ' + num(a) + ' × ' + par2(e) + M + par2(b) + ' × ' + par2(c) + ' = ' + num(det), 'ad ' + MINUS + ' bc');
    const adjLine = W('swap a and d, change the signs of b and c: rows ' + rowsT(adj), 'the top right and bottom left only change sign');
    if (d < 2) {
      const i = R.i(0, 1), j = R.i(0, 1), pos = 'row ' + (i + 1) + ', column ' + (j + 1), ans = Q(adj[i][j], det), unswap = i === j ? orig[i][j] : -adj[i][j];
      const p = { text: 'A has rows ' + B(Mt) + '. What is the ' + B(pos) + ' entry of ' + B(INV) + '?' + (d === 1 ? ' (A fraction is fine.)' : ''), ans: d === 0 ? adj[i][j] : ans, vis: mat(orig),
        how: [detLine, adjLine].concat(det === 1 ? [W(INV + ' has rows ' + rowsT(adj), 'dividing by det = 1 changes nothing'), pos + ': ' + B(num(adj[i][j]))]
          : [W(INV + ' = ' + fr(1, det) + ' × rows ' + rowsT(adj), 'divide every entry by det = ' + num(det)), pos + ': ' + num(adj[i][j]) + ' ÷ ' + par2(det) + ' = ' + B(fq(ans))]),
        steps: [st('What is the determinant?', det), st('After swapping and changing signs, the ' + pos + ' entry?', adj[i][j]), st('Divide by the determinant:', d === 0 ? adj[i][j] : ans, d === 0 ? {} : FT)],
        traps: TR([tr(d === 0 ? unswap : Q(unswap, det), 'x_matinv', i === j ? 'Swap a and d: the main diagonal trades places.' : 'Change the signs of b and c.'), tr(d === 0 ? orig[i][j] : Q(orig[i][j], det), 'x_matinv', 'Swap a and d and change the signs of b and c before dividing.'), d === 1 ? tr(Q(adj[i][j], 1), 'x_matinv', 'Divide by the determinant, ' + num(det) + '.') : null, d === 1 ? tr(Q(adj[i][j], -det), 'x_matrix', 'The determinant is ad ' + MINUS + ' bc: check its sign.') : null]) };
      if (d === 1) p.type = 'frac';
      return p;
    }
    const x = R.i(-6, 6), y = R.i(-6, 6), p1 = a * x + b * y, p2 = c * x + e * y, askX = R.chance(.5), k = askX ? 0 : 1, L = askX ? 'x' : 'y', ans = askX ? x : y;
    const lin = (u, v, w) => term(u, 'x') + (v < 0 ? M : ' + ') + term(Math.abs(v), 'y') + ' = ' + num(w), raw = adj[k][0] * p1 + adj[k][1] * p2;
    return { text: 'Solve with the inverse matrix: ' + B(lin(a, b, p1)) + ' and ' + B(lin(c, e, p2)) + '. What is ' + B(L) + '?', ans,
      how: [W('A has rows ' + Mt + '; det A = ' + num(a) + ' × ' + par2(e) + M + par2(b) + ' × ' + par2(c) + ' = ' + num(det), 'the system is A⟨x, y⟩ = ' + vec(p1, p2)), W(INV + ' = ' + (det === 1 ? '' : MINUS + '1 × ') + 'rows ' + rowsT(adj), 'swap a and d, change the signs of b and c, divide by det'),
        W(L + ' = ' + (det === 1 ? '' : MINUS + '1 × (') + num(adj[k][0]) + ' × ' + par2(p1) + ' + ' + par2(adj[k][1]) + ' × ' + par2(p2) + (det === 1 ? '' : ')') + ' = ' + B(num(ans)), 'row ' + (k + 1) + ' of ' + INV + ' times ' + vec(p1, p2))],
      steps: [st('What is det A?', det), st('Row ' + (k + 1) + ' of the swapped-and-signed matrix times ' + B(vec(p1, p2)) + ' = ?', raw), st(L + ' = ?', ans)],
      traps: TR([tr(orig[k][0] * p1 + orig[k][1] * p2, 'x_matinv', 'Multiply by ' + INV + ', not by A.'), det === -1 ? tr(raw, 'x_matinv', 'Divide by det = ' + MINUS + '1: it flips the sign.') : null, tr(askX ? y : x, 'x_system', L + ' comes from row ' + (k + 1) + ' of ' + INV + '.')]) };
  } },

/* ======================= Measuring & Shapes ======================= */
{ id: 'g_ellipse', s: 'meas', g: 12, title: 'Ellipses and hyperbolas from foci', pre: ['x_complete', 'r_dist'], paper: true, cc: ['G-GPE.A.3'],
  tip: 'Ellipse: the distances to the two foci add to 2a, and b² = a² − c². Foci (±4, 0), sum 10: a = 5, b² = 25 − 16 = 9. Hyperbola: the distances differ by 2a, and b² = c² − a².',
  gen(d, R) {
    const X2 = (h) => pw(h ? '(x ' + signed(-h) + ')' : 'x', 2), Y2 = (k) => pw(k ? '(y ' + signed(-k) + ')' : 'y', 2);
    const genE = fs(pw('x', 2), pw('a', 2)) + ' + ' + fs(pw('y', 2), pw('b', 2)) + ' = 1', genH = fs(pw('x', 2), pw('a', 2)) + M + fs(pw('y', 2), pw('b', 2)) + ' = 1';
    const ellB2 = (a, c, ask) => {
      const lines = [W('2a = ' + 2 * a + ', so a = ' + a + ' and ' + pw('a', 2) + ' = ' + a * a, 'the distances to the foci add to 2a'), W('c = ' + c, 'c is the distance from the center to a focus')];
      if (ask === 'a2') return lines.slice(0, 1).concat([pw('a', 2) + ' = ' + B(a * a)]);
      return lines.concat([W(pw('b', 2) + ' = ' + pw('a', 2) + M + pw('c', 2) + ' = ' + a * a + M + c * c + ' = ' + B(a * a - c * c), 'for an ellipse, b² = a² − c²')]);
    };
    const ellTraps = (a, c) => [tr(a * a + c * c, 'g_ellipse', 'For an ellipse b² = a² ' + MINUS + ' c²; adding is for a hyperbola.'), tr(4 * a * a - c * c, 'g_ellipse', 'a is half of the sum: a = ' + a + '.'), tr(a - c, 'g_ellipse', 'Square a and c first.')];
    if (d === 0) {
      const a = R.i(3, 12), c = R.i(1, a - 1), askA = R.chance(.2), ans = askA ? a * a : a * a - c * c;
      return { text: 'An ellipse has foci ' + B('(' + c + ', 0)') + ' and ' + B('(' + MINUS + c + ', 0)') + '. For every point on it, the distances to the two foci add to ' + B(2 * a) + '. Its equation is ' + genE + '. What is ' + B(askA ? pw('a', 2) : pw('b', 2)) + '?', ans,
        how: ellB2(a, c, askA ? 'a2' : 'b2'),
        steps: askA ? [st('What is a?', a), st(pw('a', 2) + ' = ?', a * a)] : [st('What is a?', a), st('What is c?', c), st(pw('b', 2) + ' = ' + pw('a', 2) + M + pw('c', 2) + ' = ?', ans)],
        traps: TR(askA ? [tr(4 * a * a, 'g_ellipse', 'a is half of the sum: a = ' + a + '.'), tr(2 * a, 'w_exp', 'Square a.')] : ellTraps(a, c)) };
    }
    if (d === 1) {
      if (R.chance(.5)) {
        const c = R.i(3, 13), a = R.i(1, c - 1), ans = c * c - a * a;
        return { text: 'A hyperbola has foci ' + B('(' + c + ', 0)') + ' and ' + B('(' + MINUS + c + ', 0)') + '. For every point on it, the distances to the two foci differ by ' + B(2 * a) + '. Its equation is ' + genH + '. What is ' + B(pw('b', 2)) + '?', ans,
          how: [W('2a = ' + 2 * a + ', so a = ' + a, 'the distances to the foci differ by 2a'), W('c = ' + c, 'the foci are (±c, 0)'), W(pw('b', 2) + ' = ' + pw('c', 2) + M + pw('a', 2) + ' = ' + c * c + M + a * a + ' = ' + B(ans), 'for a hyperbola, b² = c² − a²')],
          steps: [st('What is a?', a), st('What is c?', c), st(pw('b', 2) + ' = ' + pw('c', 2) + M + pw('a', 2) + ' = ?', ans)],
          traps: TR([tr(c * c + a * a, 'g_ellipse', 'For a hyperbola b² = c² ' + MINUS + ' a².'), tr(c * c - 4 * a * a, 'g_ellipse', 'a is half of the difference: a = ' + a + '.'), tr(a * a - c * c, 'g_ellipse', 'For a hyperbola c is bigger than a: b² = c² ' + MINUS + ' a².')]) };
      }
      const [p, q, h] = triple(R, 5);
      return { text: 'The ellipse ' + B(fs(pw('x', 2), h * h) + ' + ' + fs(pw('y', 2), p * p) + ' = 1') + ' has foci at ' + B('(±c, 0)') + '. What is c?', ans: q,
        how: [W(pw('a', 2) + ' = ' + h * h + ', ' + pw('b', 2) + ' = ' + p * p, 'the bigger number is under x, so the foci are on the x-axis'), W(pw('c', 2) + ' = ' + pw('a', 2) + M + pw('b', 2) + ' = ' + h * h + M + p * p + ' = ' + q * q, 'for an ellipse, c² = a² − b²'), 'c = ' + rt(q * q) + ' = ' + B(q)],
        steps: [st(pw('c', 2) + ' = ' + B(h * h + M + p * p) + ' = ?', q * q), st('c = ?', q)],
        traps: TR([tr(q * q, 'w_roots', 'That is ' + pw('c', 2) + '. Take the square root.'), tr(h - p, 'g_ellipse', 'Take the square roots of ' + h * h + ' and ' + p * p + ' only after you subtract.'), tr(Math.round(Math.sqrt(h * h + p * p)) ** 2 === h * h + p * p ? Math.round(Math.sqrt(h * h + p * p)) : null, 'g_ellipse', 'For an ellipse c² = a² ' + MINUS + ' b².')]) };
    }
    const kind = R.i(0, 2);
    if (kind === 0) {
      const h = nz(R, -6, 6), k = nz(R, -6, 6), a = R.i(3, 10), c = R.i(1, a - 1), askH = R.chance(.35), ans = askH ? h : a * a - c * c;
      const eq = fs(X2(h), pw('a', 2)) + ' + ' + fs(Y2(k), pw('b', 2)) + ' = 1';
      return { text: 'An ellipse has foci ' + B(pt(h - c, k)) + ' and ' + B(pt(h + c, k)) + '. The distances to the foci add to ' + B(2 * a) + '. Its equation is ' + eq + '. What is ' + B(askH ? 'the x-coordinate of its center' : pw('b', 2)) + '?', ans,
        how: [W('center = (' + num(h) + ', ' + num(k) + ')', 'the midpoint of the foci')].concat(askH ? ['center x = ' + B(num(h))] : [W('c = ' + c + ', a = ' + a, 'c is the center to a focus; 2a = ' + 2 * a), W(pw('b', 2) + ' = ' + a * a + M + c * c + ' = ' + B(ans), 'b² = a² − c²')]),
        steps: askH ? [st('Average the x-coordinates of the foci:', h)] : [st('Distance from the center to a focus, c?', c), st('a = ?', a), st(pw('b', 2) + ' = ?', ans)],
        traps: TR(askH ? [tr(-h, 'x_complete', 'The center is (' + num(h) + ', ' + num(k) + '): read it from the foci, not from the sign in the bracket.'), tr(h + c, 'x_midpoint', 'The center is halfway between the foci.')] : [tr(a * a - 4 * c * c, 'g_ellipse', 'c is half the distance between the foci: c = ' + c + '.')].concat(ellTraps(a, c))) };
    }
    if (kind === 1) {
      const a = R.i(3, 12), c = R.i(1, a - 1), ans = a * a - c * c;
      return { text: 'An ellipse has foci ' + B('(0, ' + c + ')') + ' and ' + B('(0, ' + MINUS + c + ')') + ', and the distances to the foci add to ' + B(2 * a) + '. Its equation is ' + fs(pw('x', 2), 'm') + ' + ' + fs(pw('y', 2), 'n') + ' = 1. What is ' + B('m') + '?', ans,
        how: [W('a = ' + a + ', c = ' + c, '2a = ' + 2 * a + '; the foci are on the y-axis'), W('the long direction is up and down, so ' + pw('a', 2) + ' = ' + a * a + ' goes under ' + pw('y', 2), 'n = ' + a * a), W('m = ' + pw('b', 2) + ' = ' + a * a + M + c * c + ' = ' + B(ans), 'b² = a² − c²')],
        steps: [st('What is ' + pw('a', 2) + '?', a * a), st('What is ' + pw('c', 2) + '?', c * c), st('m = ?', ans)],
        traps: TR([tr(a * a, 'g_ellipse', 'The foci are on the y-axis, so ' + pw('a', 2) + ' goes under ' + pw('y', 2) + ', not under ' + pw('x', 2) + '.')].concat(ellTraps(a, c))) };
    }
    const [p, q, h] = triple(R, 5);
    return { text: 'The hyperbola ' + B(fs(pw('x', 2), p * p) + M + fs(pw('y', 2), q * q) + ' = 1') + ' has foci at ' + B('(±c, 0)') + '. What is c?', ans: h,
      how: [W(pw('a', 2) + ' = ' + p * p + ', ' + pw('b', 2) + ' = ' + q * q, 'read them from the equation'), W(pw('c', 2) + ' = ' + pw('a', 2) + ' + ' + pw('b', 2) + ' = ' + p * p + ' + ' + q * q + ' = ' + h * h, 'for a hyperbola, c² = a² + b²'), 'c = ' + rt(h * h) + ' = ' + B(h)],
      steps: [st(pw('c', 2) + ' = ' + B(p * p + ' + ' + q * q) + ' = ?', h * h), st('c = ?', h)],
      traps: TR([tr(h * h, 'w_roots', 'That is ' + pw('c', 2) + '. Take the square root.'), tr(p + q, 'r_pyth', 'Add the squares, then take the square root.'), tr(Math.abs(p * p - q * q) && Number.isInteger(Math.sqrt(Math.abs(p * p - q * q))) ? Math.sqrt(Math.abs(p * p - q * q)) : null, 'g_ellipse', 'For a hyperbola c² = a² + b²; taking away is for an ellipse.')]) };
  } },

/* ======================= Data & Chance ======================= */
{ id: 'd_noreplace', s: 'data', g: 10, title: 'Two draws without putting back', pre: ['f_mult'], paper: true, cc: ['S-CP.B.8'],
  tip: 'Without putting back, the second draw has one fewer of everything: P(A and B) = P(A) × P(B given A). 4 red and 6 blue, two red: 4/10 × 3/9 = 12/90 = 2/15.',
  gen(d, R) {
    const [c1, c2, things, box] = R.pick([['red', 'blue', 'marbles', 'bag'], ['green', 'white', 'cubes', 'box'], ['black', 'white', 'tiles', 'bag'], ['red', 'yellow', 'counters', 'cup']]);
    const lowest = (t, b, note) => (gcd(t, b) > 1 ? [W('= ' + fs(t, b) + ' = ' + B(fr(t, b)), note || '')] : [W('= ' + B(fs(t, b)), note || '')]);
    if (d < 2 || R.chance(.6)) {
      const r = R.i(2, 6), b = R.i(2, 8), n = r + b, start = 'A ' + box + ' has ' + B(r + ' ' + c1) + ' and ' + B(b + ' ' + c2) + ' ' + things + '. You take two, one after the other, without putting the first back.';
      if (d === 0 || d === 2) {
        const pickR = R.chance(.5), k = pickR ? r : b, col = pickR ? c1 : c2;
        if (d === 2) {
          if (k < 3) return null;
          const t = k * (k - 1) * (k - 2), bt = n * (n - 1) * (n - 2), ans = Q(t, bt), start3 = start.replace('take two', 'take three').replace('the first back', 'any back');
          return { text: start3 + ' What is the probability all three are ' + col + '? (A fraction is fine.)', ans, type: 'frac',
            how: [W(fs(k, n) + ' × ' + fs(k - 1, n - 1) + ' × ' + fs(k - 2, n - 2), 'each draw has one fewer ' + col + ' and one fewer in all')].concat(lowest(t, bt, 'multiply the tops and the bottoms')),
            steps: [st('P(first is ' + col + ')?', Q(k, n), FT), st('P(second is ' + col + ' too)?', Q(k - 1, n - 1), FT), st('P(third is ' + col + ' too)?', Q(k - 2, n - 2), FT), st('Multiply:', ans, FT)],
            traps: TR([tr(Q(k * k * k, n * n * n), 'd_indep', 'Without putting back, each draw has one fewer.'), tr(Q(t, n * n * n), 'd_noreplace', 'The total goes down by one each time too.'), tr(Q(k * (k - 1), n * (n - 1)), 'd_noreplace', 'There are three draws: multiply three fractions.')]) };
        }
        const t = k * (k - 1), bt = n * (n - 1), ans = Q(t, bt);
        return { text: start + ' What is the probability both are ' + col + '? (A fraction is fine.)', ans, type: 'frac',
          how: [W('first ' + col + ': ' + fs(k, n), k + ' of the ' + n + ' are ' + col), W('second ' + col + ': ' + fs(k - 1, n - 1), 'one ' + col + ' is gone, so ' + (k - 1) + ' of ' + (n - 1) + ' are left'), W('P = ' + fs(k, n) + ' × ' + fs(k - 1, n - 1))].concat(lowest(t, bt, 'multiply the tops and the bottoms')),
          steps: [st('P(first is ' + col + ')?', Q(k, n), FT), st('P(second is ' + col + ' too)?', Q(k - 1, n - 1), FT), st('Multiply:', ans, FT)],
          traps: TR([tr(Q(k * k, n * n), 'd_indep', 'Without putting back, the second draw has one fewer.'), tr(Q(t, n * n), 'd_noreplace', 'The total goes down by one too: ' + (n - 1) + ' are left.'), tr(Q(k * (n - 1) + (k - 1) * n, n * (n - 1)), 'f_mult', 'Both draws must happen: multiply, do not add.')]) };
      }
      const both = R.chance(.5), t = r * b, bt = n * (n - 1), ans = Q(both ? 2 * t : t, bt);
      return { text: start + ' What is the probability ' + (both ? 'you get one of each color' : 'the first is ' + c1 + ' and the second is ' + c2) + '? (A fraction is fine.)', ans, type: 'frac',
        how: (both ? [W(c1 + ' then ' + c2 + ': ' + fs(r, n) + ' × ' + fs(b, n - 1) + ' = ' + fs(t, bt), (b === 2 ? 'both ' : 'all ' + b + ' ') + c2 + ' are still there for the second draw'), W(c2 + ' then ' + c1 + ': ' + fs(b, n) + ' × ' + fs(r, n - 1) + ' = ' + fs(t, bt), 'the other order'), W('P = ' + fs(t, bt) + ' + ' + fs(t, bt))].concat(lowest(2 * t, bt, 'either order works, so add'))
          : [W('first ' + c1 + ': ' + fs(r, n)), W('then ' + c2 + ': ' + fs(b, n - 1), 'one ' + things.slice(0, -1) + ' is gone, but ' + (b === 2 ? 'both ' : 'all ' + b + ' ') + c2 + ' are still there'), W('P = ' + fs(r, n) + ' × ' + fs(b, n - 1))].concat(lowest(t, bt, 'multiply'))),
        steps: [st('P(first is ' + c1 + ')?', Q(r, n), FT), st('P(second is ' + c2 + ', after a ' + c1 + ')?', Q(b, n - 1), FT), st(both ? 'Both orders together:' : 'Multiply:', ans, FT)],
        traps: TR(both ? [tr(Q(t, bt), 'd_noreplace', 'One of each can happen two ways: ' + c1 + ' then ' + c2 + ', or ' + c2 + ' then ' + c1 + '.'), tr(Q(2 * t, n * n), 'd_indep', 'Without putting back, the second draw is out of ' + (n - 1) + '.')]
          : [tr(Q(t, n * n), 'd_indep', 'Without putting back, the second draw is out of ' + (n - 1) + '.'), tr(Q(r * (b - 1), bt), 'd_noreplace', 'A ' + c1 + ' was taken, so ' + (b === 2 ? 'both ' : 'all ' + b + ' ') + c2 + ' are still there.'), tr(Q(2 * t, bt), 'd_noreplace', 'The order is given: ' + c1 + ' first, then ' + c2 + '.')]) };
    }
    const pa = R.pick([20, 30, 40, 50, 60, 70, 80, 90]), pb = R.pick([10, 20, 25, 30, 40, 50, 75]), ans = Q(pa * pb, 10000), dec = num(pa * pb / 10000);
    const [A, Bv, Bs] = R.pick([['take the bus', 'are late', 'takes the bus and is late'], ['play a sport', 'also play an instrument', 'plays a sport and an instrument'], ['have a pet', 'have a dog', 'has a pet that is a dog'], ['walk to school', 'bring lunch', 'walks to school and brings lunch']]);
    return { text: B(pa + '%') + ' of students ' + A + '. Of those, ' + B(pb + '%') + ' ' + Bv + '. What is the probability a student picked at random ' + Bs + '? (A decimal or a fraction is fine.)', ans, type: 'frac',
      how: [W('P(A and B) = P(A) × P(B given A)', 'the multiplication rule'), W('= ' + num(pa / 100) + ' × ' + num(pb / 100), 'the ' + pb + '% is only out of those who ' + A), '= ' + B(dec)],
      steps: [st('P(A) as a decimal?', Q(pa, 100), FT), st('P(B given A) as a decimal?', Q(pb, 100), FT), st('Multiply:', ans, FT)],
      traps: TR([tr(Q(pb, 100), 'd_noreplace', 'The ' + pb + '% is only out of those who ' + A + ': times by ' + num(pa / 100) + '.'), tr(Q(pa + pb, 100), 'f_mult', 'Both must happen: multiply the probabilities.'), tr(Q(pa * (100 - pb), 10000), 'd_complement', 'You want the ones who ' + Bv + ', ' + pb + '% of them.')]) };
  } },

{ id: 'd_empexp', s: 'data', g: 12, title: 'Expected value from survey data', pre: ['f_decmul'], paper: true, cc: ['S-MD.A.4'],
  tip: 'Turn counts into probabilities (count ÷ total), then expected value = add up value × probability. 50 homes: 10 with 0 TVs, 25 with 1, 15 with 2: (0 × 10 + 1 × 25 + 2 × 15) ÷ 50 = 1.1.',
  gen(d, R) {
    const CTX = [['TVs', 'homes', 'home'], ['pets', 'families', 'family'], ['siblings', 'students', 'student'], ['goals', 'games', 'game'], ['cars', 'homes', 'home'], ['books read', 'students', 'student']];
    const [item, unit, per] = R.pick(CTX), money = d === 2 && R.chance(.5);
    const T = R.pick(d === 0 ? [10, 20, 25, 50] : [20, 25, 40, 50, 100]);
    const vals = money ? R.pick([[-10, 5, 20], [-20, 0, 15, 40], [-5, 10, 25], [-15, 5, 30, 50]]) : (d === 0 ? [0, 1, 2] : R.chance(.5) ? [0, 1, 2, 3] : [1, 2, 3, 4]);
    const m = vals.length, cuts = []; for (let i = 0; i < m - 1; i++) cuts.push(R.i(1, T - 1));
    const sorted = [0].concat(cuts.sort((x, y) => x - y), [T]), cnt = []; for (let i = 0; i < m; i++) cnt.push(sorted[i + 1] - sorted[i]);
    if (cnt.some(c => c === 0)) return null;
    const S = sum(vals.map((v, i) => v * cnt[i])), E = S / T; if (!isInt(E * 100)) return null;
    const head = money ? 'profit ($)' : item, vis = table([[head].concat(vals), [money ? 'days' : unit].concat(cnt)]);
    const work = [W(vals.map((v, i) => 'P(' + num(v) + ') = ' + fs(cnt[i], T)).join(', '), 'count ÷ total'), W('E = ' + vals.map((v, i) => par2(v) + ' × ' + fs(cnt[i], T)).join(' + '), 'value × probability, then add'), '= ' + fs(num(S), T) + ' = ' + num(E)];
    const traps = [tr(S, 'd_expected', 'Divide by the total, ' + T + '.'), tr(sum(vals) / m, 'd_expected', 'Weight each value by how often it happened.'), tr(T / m, 'd_mean', 'Average the values, weighted by the counts, not the counts themselves.')];
    if (money) {
      return { text: 'A market stall kept track of its daily profit for ' + B(T + ' days') + ' (the table; a negative profit is a loss). What is the expected profit per day, in dollars?', ans: E, vis,
        how: work.slice(0, 2).concat([work[2].replace(/= ([^=]*)$/, '= ' + B(num(E)))]),
        steps: [st('Add up profit × days:', S), st('Divide by ' + T + ':', E)],
        traps: TR(traps.concat([tr(sum(vals.map((v, i) => Math.abs(v) * cnt[i])) / T, 'n_intadd', 'A loss counts as a negative amount.')])) };
    }
    if (d === 2) {
      const N = T * R.pick([4, 10, 20, 40]), tot = E * N; if (!isInt(tot)) return null;
      return { text: 'A survey of ' + B(T + ' ' + unit) + ' counted ' + item + ' (the table). A town has ' + B(num(N) + ' ' + unit) + ' like these. About how many ' + item + ' would you expect in all?', ans: tot, vis,
        how: work.slice(1).concat([W('expected total = ' + num(E) + ' × ' + num(N) + ' = ' + B(num(tot)), 'expected value per ' + per + ' times the number of ' + unit)]),
        steps: [st('Expected ' + item + ' per ' + per + '?', E), st('Times ' + num(N) + ':', tot)],
        traps: TR([tr(S * N, 'd_expected', 'Divide by ' + T + ' first to get the expected value per ' + per + '.'), tr(E, 'd_empexp', 'That is per ' + per + '. Multiply by ' + num(N) + '.'), tr(sum(vals) / m * N, 'd_expected', 'Weight each value by how often it happened.')]) };
    }
    return { text: 'A survey of ' + B(T + ' ' + unit) + ' counted ' + item + ' (the table shows how many ' + unit + ' had each number). What is the expected number of ' + item + ' per ' + per + '?', ans: E, vis,
      how: work.slice(0, 2).concat([work[2].replace(/= ([^=]*)$/, '= ' + B(num(E)))]),
      steps: [st('Add up value × count:', S), st('Divide by ' + T + ':', E)],
      traps: TR(traps) };
  } },

{ id: 'd_strategy', s: 'data', g: 12, title: 'Pick the plan with the better average', pre: ['f_decmul'], paper: true, cc: ['S-MD.B.5b'],
  tip: 'Compare plans by their expected cost: add up cost × probability. Plan B: $25 + 0.2 × $100 = $45 a month on average, more than plan A at $40, so A is cheaper on average.',
  gen(d, R) {
    const p = R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]);
    if (d === 0) {
      const charge = 20 * R.i(2, 10), base = 5 * R.i(3, 10), FA = base + 5 * R.i(1, 8), E = base + p * charge; if (!isInt(E * 2)) return null;
      return { text: 'Phone plan A costs ' + B('$' + FA) + ' a month. Plan B costs ' + B('$' + base) + ' a month, plus a ' + B('$' + charge) + ' fee in any month you go over your data, which happens with probability ' + B(num(p)) + '. What is plan B\'s expected cost per month, in dollars?', ans: E,
        how: [W('E(B) = ' + base + ' + ' + num(p) + ' × ' + charge, 'the ' + base + ' is paid every month; the fee only with probability ' + num(p)), '= ' + base + ' + ' + num(p * charge) + ' = ' + B(num(E))],
        steps: [st(B(num(p) + ' × ' + charge) + ' = ?', p * charge), st('Add the ' + base + ':', E)],
        traps: TR([tr(base + charge, 'd_expected', 'The fee only comes with probability ' + num(p) + '.'), tr(p * charge, 'd_strategy', 'Add the ' + base + ' you pay every month.'), tr(FA, 'd_strategy', 'That is plan A. Work out plan B.')]) };
    }
    if (d === 1) {
      const a1 = 10 * R.i(20, 50), a2 = a1 + 10 * R.i(3, 20), D1 = 100 * R.i(6, 20), D2 = 100 * R.i(1, 5), EA = a1 + p * D1, EB = a2 + p * D2, diff = Math.abs(EA - EB);
      if (!diff || !isInt(diff)) return null;
      return { text: 'Two car insurance plans for a year. Plan A: ' + B('$' + a1) + ', plus ' + B('$' + num(D1)) + ' if you have a claim. Plan B: ' + B('$' + a2) + ', plus ' + B('$' + num(D2)) + ' if you have a claim. The chance of a claim is ' + B(num(p)) + '. How much does the cheaper plan save on average, in dollars?', ans: diff,
        how: [W('E(A) = ' + a1 + ' + ' + num(p) + ' × ' + num(D1) + ' = ' + a1 + ' + ' + num(p * D1) + ' = ' + num(EA), 'expected cost = price + probability × extra'), W('E(B) = ' + a2 + ' + ' + num(p) + ' × ' + num(D2) + ' = ' + a2 + ' + ' + num(p * D2) + ' = ' + num(EB)), W('saving = ' + num(Math.max(EA, EB)) + M + num(Math.min(EA, EB)) + ' = ' + B(num(diff)), 'plan ' + (EA < EB ? 'A' : 'B') + ' is cheaper on average')],
        steps: [st('Expected cost of plan A?', EA), st('Expected cost of plan B?', EB), st('The difference?', diff)],
        traps: TR([tr(Math.abs(a1 - a2), 'd_strategy', 'Include the expected claim costs, not just the prices.'), tr(Math.abs(a1 + D1 - a2 - D2), 'd_strategy', 'The claim cost only happens with probability ' + num(p) + '.'), tr(Math.min(EA, EB), 'd_strategy', 'That is the cheaper plan\'s cost. Find how much less it is than the other.')]) };
    }
    if (R.chance(.5)) {
      const charge = R.pick([50, 100, 200, 250, 400, 500]), mm = charge * R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6]), base = 5 * R.i(3, 10), FA = base + mm; if (!isInt(mm)) return null;
      const ans = Q(mm, charge);
      return { text: 'Plan A costs ' + B('$' + FA) + ' a month. Plan B costs ' + B('$' + base) + ' a month plus a ' + B('$' + charge) + ' fee with probability p. For which p do the two plans cost the same on average? (A decimal or a fraction is fine.)', ans, type: 'frac',
        how: [W(base + ' + p × ' + charge + ' = ' + FA, 'set the expected costs equal'), W('p × ' + charge + ' = ' + mm, 'take ' + base + ' from both sides'), W('p = ' + fs(mm, charge) + ' = ' + B(num(mm / charge)), 'divide by ' + charge)],
        steps: [st('What is ' + B(FA + M + base) + '?', mm), st('Divide by ' + charge + ':', ans, FT)],
        traps: TR([tr(Q(charge, mm), 'x_onestep', 'p × ' + charge + ' = ' + mm + ', so p = ' + mm + ' ÷ ' + charge + '.'), tr(Q(FA, charge), 'd_strategy', 'Take the ' + base + ' off first: only the fee is uncertain.'), tr(Q(mm, 100), 'd_strategy', 'Divide by the fee, ' + charge + '.')]) };
    }
    const q = R.pick([0.1, 0.2, 0.25, 0.4, 0.5]), base = 5 * R.i(3, 10), mm = 5 * R.i(2, 12), X = mm / q, FA = base + mm; if (!isInt(X)) return null;
    return { text: 'Plan A costs ' + B('$' + FA) + ' a month. Plan B costs ' + B('$' + base) + ' a month plus a fee of $X with probability ' + B(num(q)) + '. For which fee X do the two plans cost the same on average, in dollars?', ans: X,
      how: [W(base + ' + ' + num(q) + ' × X = ' + FA, 'set the expected costs equal'), W(num(q) + ' × X = ' + mm, 'take ' + base + ' from both sides'), W('X = ' + mm + ' ÷ ' + num(q) + ' = ' + B(num(X)), 'divide by ' + num(q))],
      steps: [st('What is ' + B(FA + M + base) + '?', mm), st('Divide by ' + num(q) + ':', X)],
      traps: TR([tr(mm * q, 'x_onestep', 'Divide by ' + num(q) + ' to undo times ' + num(q) + '.'), tr(FA / q, 'd_strategy', 'Take the ' + base + ' off first: only the fee is uncertain.'), tr(mm, 'd_strategy', 'The fee only comes with probability ' + num(q) + ': divide by it.')]) };
  } },

/*@@MORE@@*/
];
/* every concept: drop broken or repeated trap values before the game sees them */
DEFS.forEach(c => { const g = c.gen; c.gen = (d, R) => { const p = g(d, R); if (p && p.traps) p.traps = TR(p.traps); return p; }; });
C.defs(DEFS);
})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
