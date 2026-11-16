/* h1.js: high school Common Core gaps (docs/gaps_hs.md), the regular standards and the "partly covered" ones.
   Each concept practises the standard codes in its cc list. Most are pencil-and-paper (paper: true): the how lines
   are a model written solution, one line per line of work, and the steps follow the same lines with the same numbers.
   Traps name the concept each likely slip really comes from. The (+) standards live in h2.js. */
(function (C) {
'use strict';
const { B, num, MINUS, signed, par2, gcd, reduce, frac, mixed, pw, rt, term, poly, NAMES, table, plotSVG, DEG } = C;

/* ---------- small helpers for this file ---------- */
const M = ' ' + MINUS + ' ';
const tr = (v, c, why) => ({ v, c, why });
const st = (text, ans, o) => Object.assign({ text, ans }, o || {});
const F = (a, b) => { const r = reduce(a, b); return { n: r[0], d: r[1] }; };          /* a fraction answer in lowest terms */
const fr = (a, b) => { const r = reduce(a, b); return frac(r[0], r[1]); };             /* show a fraction in lowest terms */
const W = (work, note) => work + (note ? ' &nbsp; (' + note + ')' : '');              /* a written line with a short note */
const nz = (R, lo, hi) => { let v; do { v = R.i(lo, hi); } while (v === 0); return v; };
const pt = (x, y) => '(' + num(x) + ', ' + num(y) + ')';
const sq = v => pw(par2(v), 2);
const fl = (t, b) => '<span class="fr"><span class="fr-n">' + t + '</span><span class="fr-d">' + b + '</span></span>';
const fac = r => r === 0 ? 'x' : '(x ' + signed(-r) + ')';                              /* the factor whose zero is r */
const fac2 = (a, b) => b === 0 ? 'x' + fac(a) : fac(a) + fac(b);                        /* two factors, a lone x first */
const lin = (a, b) => '(' + poly([a, b]) + ')';                                           /* (2x + 5) */
const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
const r10 = v => +(+v).toFixed(10);
const money = v => '$' + num(v);
const pct = v => num(r10(v)) + '%';
/* a coefficient times a letter, as a fraction: cf(-3, 4, 'x') is "−3/4 x"; cf(1,1,'x') is "x" */
function cf(n, d, v) {
  const [a, b] = reduce(n, d); if (a === 0) return '';
  return (a < 0 ? MINUS : '') + (Math.abs(a) === 1 && b === 1 ? '' : frac(Math.abs(a), b)) + v;
}
/* "m v + k" with fractions: lf(-3, 4, 5, 2, 'x') is "−3/4 x + 5/2" */
function lf(mn, md, kn, kd, v) {
  const t = cf(mn, md, v), [a, b] = reduce(kn, kd);
  if (!t) return fr(kn, kd);
  return a === 0 ? t : t + (a < 0 ? M : ' + ') + frac(Math.abs(a), b);
}
/* a fraction answer shown as a number when it is whole */
const fq = f => f.d === 1 ? num(f.n) : frac(f.n, f.d);
/* traps: drop empty ones and repeats */
function TR(list) {
  const seen = new Set();
  return list.filter(t => {
    if (!t || t.v == null) return false; const v = t.v;
    if (typeof v === 'number' && !isFinite(v)) return false;
    const k = typeof v === 'object' ? (v.n / v.d).toFixed(9) : (+v).toFixed(9);
    if (seen.has(k)) return false; seen.add(k); return true;
  });
}
/* sum of terms with letters: ex([[3,'x'],[-2,''],[1,'y']]) is "3x − 2 + y" */
function ex(list) {
  return list.filter(t => t[0] !== 0).map((t, i) => {
    const c = t[0], body = t[1] ? (Math.abs(c) === 1 ? '' : num(Math.abs(c))) + t[1] : num(Math.abs(c));
    return i === 0 ? (c < 0 ? MINUS : '') + body : (c < 0 ? M : ' + ') + body;
  }).join('') || '0';
}
const an = (w, cap) => (/^[aeiou]/.test(w) ? (cap ? 'An ' : 'an ') : (cap ? 'A ' : 'a ')) + w;
const xp = e => e === 0 ? '' : e === 1 ? 'x' : pw('x', e);

C.defs([

/* ---------- N-Q.A.1: units guide a multi-step conversion ---------- */
{ id: 'g_unitrate', s: 'meas', g: 9, title: 'Convert rates with unit chains', paper: true, cc: ['N-Q.A.1'], pre: ['f_rate', 'f_mult'],
  tip: 'Multiply by fractions worth 1 so the units you don\'t want cancel. 30 mi/h × (5,280 ft ÷ 1 mi) × (1 h ÷ 3,600 s) = 44 ft/s.',
  gen(d, R) {
    let T, fwd = R.chance(.5), t;
    if (d === 0) {
      const U = R.pick([['L', 'liters'], ['km', 'km'], ['pages', 'pages'], ['beats', 'beats'], ['mL', 'mL'], ['words', 'words']]);
      const P = R.pick([['min', 'h', 60, 'minutes', 'hour'], ['s', 'min', 60, 'seconds', 'minute'], ['h', 'day', 24, 'hours', 'day']]);
      T = { a: [U[0], P[0]], b: [U[0], P[1]], fs: [[P[2] + ' ' + P[0], P[2], '1 ' + P[1], 1]], p: P[2], q: 1, small: P[3], big: P[4] };
      t = R.i(2, 15);
    } else {
      const L1 = [
        { a: ['m', 's'], b: ['km', 'h'], fs: [['3,600 s', 3600, '1 h', 1], ['1 km', 1, '1,000 m', 1000]], p: 18, q: 5 },
        { a: ['km', 'h'], b: ['m', 'min'], fs: [['1,000 m', 1000, '1 km', 1], ['1 h', 1, '60 min', 60]], p: 50, q: 3 }];
      const L2 = [
        { a: ['mi', 'h'], b: ['ft', 's'], fs: [['5,280 ft', 5280, '1 mi', 1], ['1 h', 1, '3,600 s', 3600]], p: 22, q: 15 },
        { a: ['L', 'min'], b: ['mL', 's'], fs: [['1,000 mL', 1000, '1 L', 1], ['1 min', 1, '60 s', 60]], p: 50, q: 3 },
        { a: ['dollars', 'h'], b: ['cents', 'min'], fs: [['100 cents', 100, '1 dollar', 1], ['1 h', 1, '60 min', 60]], p: 5, q: 3 }];
      T = R.pick(d === 1 ? L1 : L2); t = R.i(1, d === 1 ? 8 : 6);
    }
    let a = T.a, b = T.b, fs = T.fs, p = T.p, q = T.q;
    if (!fwd) { [a, b] = [b, a]; fs = fs.map(f => [f[2], f[3], f[0], f[1]]).reverse(); [p, q] = [q, p]; }
    const v = q * t, ans = p * t, lab = u => u[0] === 'dollars' ? 'dollars per hour' : u[0] === 'cents' ? 'cents per minute' : u[0] + '/' + u[1];
    const top = fs.reduce((s, f) => s * f[1], 1), bot = fs.reduce((s, f) => s * f[3], 1);
    const chain = fl(num(v) + ' ' + a[0], '1 ' + a[1]) + ' × ' + fs.map(f => fl(f[0], f[2])).join(' × ');
    const how = [W(chain, 'each fraction is worth 1; the old units cancel')];
    let steps;
    if (top !== 1 && bot !== 1) {
      how.push('= ' + num(v) + ' × ' + num(top) + ' ÷ ' + num(bot) + ' ' + lab(b), '= ' + num(v * top) + ' ÷ ' + num(bot) + ' = ' + B(num(ans)) + ' ' + lab(b));
      steps = [st(B(num(v) + ' × ' + num(top)) + ' = ?', v * top), st(B(num(v * top) + ' ÷ ' + num(bot)) + ' = ?', ans)];
    } else {
      how.push('= ' + num(v) + (top !== 1 ? ' × ' + num(top) : ' ÷ ' + num(bot)) + ' = ' + B(num(ans)) + ' ' + lab(b));
      steps = [st('How many ' + T.small + ' are in 1 ' + T.big + '?', T.p), st(B(num(v) + (top !== 1 ? ' × ' : ' ÷ ') + T.p) + ' = ?', ans)];
    }
    const flip = v * bot / top, part = v * fs[0][1] / fs[0][3];
    return { text: 'Change ' + B(num(v) + ' ' + lab(a)) + ' to ' + lab(b) + '.', ans, unit: lab(b), how, steps,
      traps: TR([tr(flip, 'g_unitrate', 'A fraction is upside down: the unit you want to get rid of goes on the bottom so it cancels.'),
        fs.length > 1 ? tr(part, 'g_unitrate', 'Both units change here, so you need a second fraction.') : tr(top !== 1 ? v * 100 : v / 100, 't_convert', 'Check how many ' + T.small + ' make 1 ' + T.big + '.'),
        fs.length > 1 && T.p === 18 ? tr(fwd ? v * 3600 : v * 1000, 'g_metric', 'Change both units: one fraction for the time, one for the length.') : null]) };
  } },

/* ---------- N-CN.C.7: quadratics with complex solutions ---------- */
{ id: 'x_complexroots', s: 'alg', g: 11, title: 'Quadratics with complex roots', paper: true, cc: ['N-CN.C.7'], pre: ['w_radical'],
  tip: 'A negative under the square root gives i: √(−16) = 4i. x² − 6x + 13 = 0 → (x − 3)² = −4 → x − 3 = ±2i → x = 3 ± 2i.',
  gen(d, R) {
    const I = v => (v === 1 ? '' : num(v)) + 'i', X2 = pw('x', 2);
    if (d === 0) {
      const q = R.i(1, 9);
      if (R.chance(.5)) {
        const a = R.pick([1, 1, 2, 3, 4]), c = a * q * q, ax = (a === 1 ? '' : a) + X2;
        const how = [W(ax + ' = ' + num(-c), 'take ' + c + ' from both sides')];
        if (a !== 1) how.push(W(X2 + ' = ' + num(-q * q), 'divide both sides by ' + a));
        how.push(W('x = ±' + rt(num(-q * q)) + ' = ±' + I(q), rt(MINUS + '1') + ' = i'), 'q = ' + B(q));
        return { text: 'The solutions of ' + B(ax + ' + ' + c + ' = 0') + ' are x = ±qi. What is q? (q is positive.)', ans: q, how,
          steps: [st(B(X2) + ' = ?', -q * q), st('x = ± what i?', q)],
          traps: TR([tr(q * q, 'w_roots', 'Take the square root of ' + (q * q) + ' to find q.'), a !== 1 ? tr(Math.sqrt(c) % 1 ? null : Math.sqrt(c), 'x_complexroots', 'Divide by ' + a + ' before taking the square root.') : null, tr(c, 'x_complexroots', 'Get x² alone, then take the square root.')]) };
      }
      const p = nz(R, -8, 8), askP = R.chance(.5), e = pw(fac(p), 2) + ' + ' + q * q + ' = 0';
      return { text: 'Solve ' + B(e) + '. The solutions are x = p ± qi with q positive. What is ' + B(askP ? 'p' : 'q') + '?', ans: askP ? p : q,
        how: [W(pw(fac(p), 2) + ' = ' + num(-q * q), 'take ' + q * q + ' from both sides'), W('x ' + signed(-p) + ' = ±' + I(q), 'square root: ' + rt(num(-q * q)) + ' = ' + I(q)), W('x = ' + num(p) + ' ± ' + I(q), p > 0 ? 'add ' + p : 'take ' + (-p) + ' away'), (askP ? 'p' : 'q') + ' = ' + B(num(askP ? p : q))],
        steps: [st(B('x ' + signed(-p)) + ' = ± what i?', q), st(askP ? 'p = ?' : 'q = ?', askP ? p : q)],
        traps: askP ? TR([tr(-p, 'x_complete', 'x ' + signed(-p) + ' = 0 at x = ' + num(p) + ': the sign flips when you move it across.'), tr(q, 'x_complexroots', 'q goes with i; p is the real part.')])
          : TR([tr(q * q, 'w_roots', 'Take the square root of ' + q * q + '.'), tr(p, 'x_complexroots', 'p is the real part; q goes with i.')]) };
    }
    if (d === 1) {
      const p = nz(R, -7, 7), q = R.i(1, 8), b = -2 * p, c = p * p + q * q, askP = R.chance(.5), ans = askP ? p : q;
      return { text: 'Solve ' + B(poly([1, b, c]) + ' = 0') + ' by completing the square. The solutions are x = p ± qi with q positive. What is ' + B(askP ? 'p' : 'q') + '?', ans,
        how: [W(poly([1, b, 0]) + ' = ' + num(-c), 'take ' + c + ' from both sides'), W(pw(fac(p), 2) + ' = ' + num(-q * q), 'add ' + p * p + ' (half of ' + num(b) + ', squared) to both sides'),
          W('x ' + signed(-p) + ' = ±' + I(q), 'square root: ' + rt(num(-q * q)) + ' = ' + I(q)), W('x = ' + num(p) + ' ± ' + I(q), ''), (askP ? 'p' : 'q') + ' = ' + B(num(ans))],
        steps: [st('Half of ' + num(b) + ', squared?', p * p), st(B(pw(fac(p), 2)) + ' = ?', -q * q), st(askP ? 'p = ?' : 'q = ?', ans)],
        traps: askP ? TR([tr(-p, 'x_complete', '(x ' + signed(-p) + ')² is zero at x = ' + num(p) + ': mind the sign.'), tr(b, 'x_complete', 'p is half of ' + num(b) + ', with the sign changed.')])
          : TR([tr(q * q, 'w_roots', 'Take the square root of ' + q * q + '.'), tr(c, 'x_complexroots', 'Complete the square first: only part of ' + c + ' is left over.'), tr(Math.sqrt(c) % 1 ? null : Math.sqrt(c), 'x_complexroots', 'Complete the square first, then take the square root of what is left.')]) };
    }
    const k = R.chance(.5) ? 2 : 1, s = k === 2 ? 1 : R.pick([2, 3]), m = nz(R, -7, 7), n = R.i(1, 7);
    if (k === 2 && m % 2 === 0 && n % 2 === 0) return null;
    const a = s * k * k, b = -2 * s * k * m, c = s * (m * m + n * n), D = b * b - 4 * a * c, root = 2 * s * k * n, askP = R.chance(.5);
    const P = F(m, k), Q = F(n, k), ans = askP ? P : Q, Qs = Q.d === 1 ? I(Q.n) : frac(Q.n, Q.d) + 'i';
    return { text: 'Use the quadratic formula. The solutions of ' + B(poly([a, b, c]) + ' = 0') + ' are x = p ± qi with q positive. What is ' + B(askP ? 'p' : 'q') + '? (A fraction is fine.)', ans, type: 'frac',
      how: [W('D = ' + sq(b) + ' ' + MINUS + ' 4 × ' + a + ' × ' + c + ' = ' + num(D), 'D = b² ' + MINUS + ' 4ac'), W(rt(num(D)) + ' = ' + I(root), rt(num(-D)) + ' = ' + root + ', and ' + rt(MINUS + '1') + ' = i'),
        W('x = ' + fl(num(-b) + ' ± ' + I(root), 2 * a), 'x = (' + MINUS + 'b ± √D) ÷ 2a'), W('x = ' + fq(P) + ' ± ' + Qs, 'divide both parts by ' + 2 * a), (askP ? 'p' : 'q') + ' = ' + B(fq(ans))],
      steps: askP ? [st('D = b² ' + MINUS + ' 4ac = ?', D), st('p = ' + B(num(-b) + ' ÷ ' + 2 * a) + ' = ?', P, { type: 'frac' })]
        : [st('D = b² ' + MINUS + ' 4ac = ?', D), st(B(rt(num(-D)) ) + ' = ?', root), st('q = ' + B(root + ' ÷ ' + 2 * a) + ' = ?', Q, { type: 'frac' })],
      traps: askP ? TR([tr(F(-m, k), 'x_quadform', 'The formula starts with ' + MINUS + 'b: change the sign of b.'), tr(F(-b, a), 'x_quadform', 'Divide by 2a, not a.')])
        : TR([tr(F(-D, 2 * a), 'w_radical', 'Take the square root of ' + num(-D) + ' first.'), tr(F(root, a), 'x_quadform', 'Divide by 2a, not a.'), tr(root, 'x_quadform', 'Divide by 2a = ' + 2 * a + '.')]) };
  } },

/* ---------- A-SSE.A.1a: terms, factors, coefficients ---------- */
{ id: 'x_parts', s: 'alg', g: 9, title: 'Terms, factors and coefficients', cc: ['A-SSE.A.1a'], pre: ['w_exp'],
  tip: 'Terms are the pieces joined by + and −. A coefficient is the number in front of a letter, sign included. In 5x³ − 2x² + 7 the x² coefficient is −2 and 7 is the constant.',
  gen(d, R) {
    if (d === 0) {
      const cs = [nz(R, -9, 9), nz(R, -9, 9), R.chance(.4) ? 0 : nz(R, -9, 9), nz(R, -12, 12)];
      if (Math.abs(cs[0]) === 1 || Math.abs(cs[1]) === 1) return null;
      const terms = cs.map((c, i) => [c, xp(3 - i)]).filter(t => t[0] !== 0), list = terms.map(t => ex([t])).join(', ');
      const q = R.i(0, 2), e = poly(cs);
      if (q === 0) return { text: 'In ' + B(e) + ', what is the coefficient of ' + B(pw('x', 2)) + '?', ans: cs[1],
        how: ['The terms are ' + list + '.', 'The coefficient of ' + pw('x', 2) + ' is the number in front of it, sign included: ' + B(num(cs[1])) + '.'],
        traps: TR([tr(Math.abs(cs[1]), 'x_parts', 'The sign in front of a term belongs to its coefficient.'), tr(2, 'w_exp', 'The small 2 is the power. The coefficient is the number in front.'), tr(cs[0], 'x_parts', 'That one goes with ' + pw('x', 3) + '.')]) };
      if (q === 1) return { text: 'In ' + B(e) + ', what is the constant term?', ans: cs[3],
        how: ['The terms are ' + list + '.', 'The constant term is the one with no x: ' + B(num(cs[3])) + '.'],
        traps: TR([tr(-cs[3], 'x_parts', 'The sign in front belongs to the term.'), tr(cs[2] || null, 'x_parts', 'That term has an x in it.'), tr(cs[0], 'x_parts', 'The constant has no x at all.')]) };
      return { text: 'How many terms does ' + B(e) + ' have?', ans: terms.length,
        how: ['Terms are the pieces joined by + and ' + MINUS + ': ' + list + '.', 'That is ' + B(terms.length) + ' terms.'],
        traps: TR([tr(3, 'x_parts', 'Count the pieces, not the highest power.'), tr(terms.length - 1, 'x_parts', 'Count the pieces, not the signs between them.'), tr(4, 'x_parts', 'A power with no term (coefficient 0) is not written, so it is not a term.')]) };
    }
    if (d === 1) {
      const deg = R.pick([3, 4]), cs = []; for (let e = deg; e >= 0; e--) cs.push(e === deg ? nz(R, -9, 9) : R.pick([1, -1, nz(R, -9, 9)]));
      const miss = R.i(1, deg - 1); cs[miss] = 0;
      const terms = R.shuffle(cs.map((c, i) => [c, deg - i]).filter(t => t[0] !== 0)); if (terms[0][1] === deg) return null;
      const e = ex(terms.map(t => [t[0], xp(t[1])])), q = R.i(0, 3), coefX = cs[deg - 1];
      if (q === 0) return { text: 'What is the leading coefficient of ' + B(e) + '?', ans: cs[0],
        how: ['The highest power is ' + pw('x', deg) + ', even though it is not written first.', 'Its coefficient, the leading coefficient, is ' + B(num(cs[0])) + '.'],
        traps: TR([tr(terms[0][0], 'x_parts', 'Leading means the term with the highest power, not the first one written.'), tr(deg, 'x_parts', 'That is the degree (the highest power). Its coefficient is the number in front.'), tr(-cs[0], 'x_parts', 'Keep the sign.')]) };
      if (q === 1) return { text: 'In ' + B(e) + ', what is the coefficient of ' + B('x') + '?', ans: coefX,
        how: ['Find the x term (power 1): ' + (coefX ? ex([[coefX, 'x']]) : 'there is none') + '.', coefX === 1 ? 'x on its own means 1x, so the coefficient is ' + B(1) + '.' : coefX === -1 ? MINUS + 'x means ' + MINUS + '1x, so the coefficient is ' + B(num(-1)) + '.' : coefX === 0 ? 'No x term means the coefficient is ' + B(0) + '.' : 'Its coefficient is ' + B(num(coefX)) + '.'],
        traps: TR([Math.abs(coefX) === 1 ? tr(0, 'x_parts', 'x on its own means 1 times x.') : tr(1, 'x_parts', 'Read the number in front of x.'), tr(-coefX || null, 'x_parts', 'Keep the sign.'), tr(cs[deg] !== coefX ? cs[deg] : null, 'x_parts', 'That term has no x: it is the constant.')]) };
      if (q === 2) return { text: 'In ' + B(e) + ', what is the coefficient of ' + B(pw('x', deg - miss)) + '? (Put 0 if there is none.)', ans: 0,
        how: ['Look for an ' + pw('x', deg - miss) + ' term: there isn\'t one.', 'A missing power has coefficient ' + B(0) + '.'],
        traps: TR([tr(1, 'x_parts', 'No ' + pw('x', deg - miss) + ' term at all means 0 of them, not 1.'), tr(deg - miss, 'w_exp', 'That is the power, not the coefficient.')]) };
      return { text: 'What is the degree of ' + B(e) + '?', ans: deg,
        how: ['The degree is the highest power of x in any term.', 'The highest is ' + pw('x', deg) + ', so the degree is ' + B(deg) + '.'],
        traps: TR([tr(terms[0][1], 'x_parts', 'Look at every term, not just the first one.'), tr(terms.length, 'x_parts', 'That counts the terms. The degree is the highest power.'), tr(cs[0], 'x_parts', 'That is the coefficient of the highest power.')]) };
    }
    const a = R.pick([2, 3, 4, 5, -2, -3]), p = nz(R, -7, 7), q = nz(R, -7, 7), e = num(a) + lin(1, p) + lin(1, q), askC = R.chance(.5);
    if (askC) return { text: 'If you multiply out ' + B(e) + ', what is the constant term?', ans: a * p * q,
      how: ['The constant term comes from multiplying the numbers only: ' + num(a) + ' × ' + par2(p) + ' × ' + par2(q) + '.', num(a) + ' × ' + par2(p * q) + ' = ' + B(num(a * p * q)) + '.'],
      steps: [st(B(num(p) + ' × ' + par2(q)) + ' = ?', p * q), st('Times ' + num(a) + ':', a * p * q)],
      traps: TR([tr(p * q, 'x_distribute', 'The ' + num(a) + ' multiplies everything, the constant too.'), tr(a * (p + q), 'x_foil', 'That is the x term. The constant multiplies the numbers.'), tr(-a * p * q, 'n_intmul', 'Check the signs.')]) };
    return { text: 'If you multiply out ' + B(e) + ', what is the coefficient of ' + B('x') + '?', ans: a * (p + q),
      how: ['The x terms come from x × ' + par2(q) + ' and ' + par2(p) + ' × x, so they add to ' + ex([[p + q, 'x']]) + '.', 'Times ' + num(a) + ': ' + num(a) + ' × ' + par2(p + q) + ' = ' + B(num(a * (p + q))) + '.'],
      steps: [st(B(num(p) + ' + ' + par2(q)) + ' = ?', p + q), st('Times ' + num(a) + ':', a * (p + q))],
      traps: TR([tr(p + q, 'x_distribute', 'The ' + num(a) + ' multiplies everything.'), tr(a * p * q, 'x_foil', 'That is the constant term. The x terms come from the outer and inner products.'), tr(a, 'x_parts', 'That is the coefficient of ' + pw('x', 2) + '.')]) };
  } },

/* ---------- A-SSE.A.1b: see a bracket as one number ---------- */
{ id: 'x_chunk', s: 'alg', g: 9, title: 'See a bracket as one number', cc: ['A-SSE.A.1b'], pre: ['w_exp'],
  tip: 'Treat a bracket as one block. If 3(x − 2)² + 4 = 52, then 3 × block = 48, so the block (x − 2)² is 16. No need to find x first.',
  gen(d, R) {
    if (d === 0) {
      const h = nz(R, -9, 9), v = R.i(1, 12), a = R.i(2, 6), b = nz(R, -20, 20), c = a * v + b;
      const ch = R.pick([pw(fac(h), 2), rt('x ' + signed(h)), '|x ' + signed(-h) + '|', lin(2, h)]);
      return { text: 'If ' + B(a + ch + ' ' + signed(b) + ' = ' + num(c)) + ', what is ' + B(ch) + '?', ans: v,
        how: [W(a + ch + ' = ' + num(c - b), (b > 0 ? 'take ' + b + ' from' : 'add ' + (-b) + ' to') + ' both sides; ' + ch + ' stays as one block'), W(ch + ' = ' + B(v), 'divide both sides by ' + a)],
        steps: [st(B(a + ch) + ' = ?', c - b), st(B(ch) + ' = ?', v)],
        traps: TR([tr(c - b, 'x_twostep', 'One more step: divide by ' + a + '.'), tr((c + b) / a, 'n_intsub', 'To undo ' + signed(b) + ', do the opposite.'), tr(c / a - b, 'x_twostep', 'Undo the ' + signed(b) + ' first, then the × ' + a + '.')]) };
    }
    if (d === 1) {
      const h = nz(R, -8, 8), s = R.i(1, 7), a = R.i(2, 5), b = nz(R, -15, 15);
      if (R.chance(.5)) {
        const ch = pw('(x ' + signed(h) + ')', 2), c = a * s * s + b, big = R.chance(.5), ans = big ? -h + s : -h - s;
        return { text: 'Solve ' + B(a + ch + ' ' + signed(b) + ' = ' + num(c)) + '. What is the ' + (big ? 'larger' : 'smaller') + ' solution?', ans,
          how: [W(a + ch + ' = ' + num(c - b), 'keep the bracket as one block'), W(ch + ' = ' + s * s, 'divide by ' + a), W('x ' + signed(h) + ' = ±' + s, 'square root: a block squared to ' + s * s + ' is ' + s + ' or ' + MINUS + s), 'x = ' + num(-h + s) + ' or x = ' + num(-h - s) + ', so the ' + (big ? 'larger' : 'smaller') + ' is ' + B(num(ans)) + '.'],
          steps: [st(B(ch) + ' = ?', s * s), st('x ' + signed(h) + ' = ± what?', s), st('The ' + (big ? 'larger' : 'smaller') + ' solution?', ans)],
          traps: TR([tr(big ? -h - s : -h + s, 'x_chunk', 'That is the ' + (big ? 'smaller' : 'larger') + ' one.'), tr(big ? h + s : h - s, 'n_intsub', 'To undo ' + signed(h) + ', do the opposite.'), tr(s * s - h, 'w_roots', 'Take the square root of the block\'s value.')]) };
      }
      const ch = rt('x ' + signed(h)), c = a * s + b, ans = s * s - h;
      return { text: 'Solve ' + B(a + ch + ' ' + signed(b) + ' = ' + num(c)) + '. What is x?', ans,
        how: [W(a + ch + ' = ' + num(c - b), 'keep the root as one block'), W(ch + ' = ' + s, 'divide by ' + a), W('x ' + signed(h) + ' = ' + s * s, 'square both sides'), W('x = ' + B(num(ans)), h > 0 ? 'take ' + h + ' away' : 'add ' + (-h))],
        steps: [st(B(ch) + ' = ?', s), st(B('x ' + signed(h)) + ' = ?', s * s), st('x = ?', ans)],
        traps: TR([tr(s - h, 'w_roots', 'Square both sides to undo the square root.'), tr(s * s + h, 'n_intsub', 'To undo ' + signed(h) + ', do the opposite.'), tr(c - b, 'x_twostep', 'Divide by ' + a + ' to get the root alone.')]) };
    }
    const kind = R.i(0, 2);
    if (kind === 0) {
      const p = nz(R, -6, 6), v = nz(R, -12, 15), k = R.i(2, 5), m = nz(R, -15, 15), blk = poly([1, p, 0]), ans = k * v + m;
      return { text: 'If ' + B(blk + ' = ' + num(v)) + ', what is ' + B(poly([k, k * p, m])) + '?', ans,
        how: [W(poly([k, k * p, m]) + ' = ' + k + '(' + blk + ') ' + signed(m), 'take out ' + k + ' to find the block'), W('= ' + k + ' × ' + par2(v) + ' ' + signed(m), 'the block is ' + num(v)), '= ' + B(num(ans))],
        steps: [st('The expression is ' + k + ' × (block) ' + signed(m) + '. ' + B(k + ' × ' + par2(v)) + ' = ?', k * v), st('Then ' + B(signed(m)) + ':', ans)],
        traps: TR([tr(k * v, 'x_chunk', 'Don\'t forget the ' + signed(m) + '.'), tr(v + m, 'x_chunk', 'The block appears ' + k + ' times: ' + k + '(' + blk + ').'), tr(k * (v + m), 'x_order', 'Only the block is multiplied by ' + k + '.')]) };
    }
    if (kind === 1) {
      const p = R.i(1, 5), q = R.i(1, 5), v = nz(R, -9, 12), k = R.i(2, 4), m = nz(R, -12, 12), ans = k * v + m;
      return { text: 'If ' + B(ex([[p, 'a'], [q, 'b']]) + ' = ' + num(v)) + ', what is ' + B(ex([[k * p, 'a'], [k * q, 'b'], [m, '']])) + '?', ans,
        how: [W(ex([[k * p, 'a'], [k * q, 'b'], [m, '']]) + ' = ' + k + '(' + ex([[p, 'a'], [q, 'b']]) + ') ' + signed(m), 'take out ' + k), W('= ' + k + ' × ' + par2(v) + ' ' + signed(m), ''), '= ' + B(num(ans))],
        steps: [st(B(k + ' × ' + par2(v)) + ' = ?', k * v), st('Then ' + B(signed(m)) + ':', ans)],
        traps: TR([tr(k * v, 'x_chunk', 'Don\'t forget the ' + signed(m) + '.'), tr(v + m, 'x_chunk', 'Every term was multiplied by ' + k + ', so the block is ' + k + ' times bigger.')]) };
    }
    const r = R.pick(['1.02', '1.03', '1.04', '1.05', '1.06', '1.08']), w = R.pick([1.2, 1.4, 1.5, 1.6, 1.8, 2, 2.5, 3]), A = 50 * R.i(2, 40), gain = R.chance(.4);
    const blk = pw('(' + r + ')', 'n'), ans = r10(gain ? A * w - A : A * w);
    return { text: 'If ' + B(blk + ' = ' + num(w)) + ', what is ' + B(num(A) + blk + (gain ? M + num(A) : '')) + '?', ans,
      how: [W(num(A) + blk + (gain ? M + num(A) : '') + ' = ' + num(A) + ' × ' + num(w) + (gain ? M + num(A) : ''), 'swap the whole block ' + blk + ' for ' + num(w)), '= ' + (gain ? num(A * w) + M + num(A) + ' = ' : '') + B(num(ans))],
      steps: gain ? [st(B(num(A) + ' × ' + num(w)) + ' = ?', r10(A * w)), st(B(num(r10(A * w)) + M + num(A)) + ' = ?', ans)] : [st('The block is ' + num(w) + '. ' + B(num(A) + ' × ' + num(w)) + ' = ?', ans)],
      traps: TR([tr(r10(A * +r), 'x_chunk', 'The whole block ' + blk + ' is ' + num(w) + ', not just ' + r + '.'), tr(r10(A + w), 'x_chunk', 'The block multiplies ' + num(A) + '.'), gain ? tr(r10(A * w), 'x_chunk', 'Take away the ' + num(A) + ' at the end.') : null]) };
  } },

/* ---------- A-APR.B.3: zeros from the factors ---------- */
{ id: 'x_zeros', s: 'alg', g: 11, title: 'Zeros from the factors', cc: ['A-APR.B.3'], pre: ['f_addunlike'],
  tip: 'A product is 0 when one factor is 0. (x − 3)(2x + 5) = 0 at x = 3 and x = −5/2. A squared factor gives the same zero twice: the graph touches there.',
  gen(d, R) {
    if (d === 0) {
      const zs = R.shuffle([...new Set([R.i(-9, 9), R.i(-9, 9), R.i(-9, 9)])]); if (zs.length < 3) return null;
      const big = R.chance(.5), ans = big ? Math.max(...zs) : Math.min(...zs), e = 'p(x) = ' + zs.map(fac).join('');
      return { text: 'What is the ' + (big ? 'largest' : 'smallest') + ' zero of ' + B(e) + '?', ans,
        how: [W('p(x) = 0 when one factor is 0', 'a product is 0 only if a factor is 0'), zs.map(z => z === 0 ? 'x = 0 (the factor x)' : fac(z) + ' = 0 at x = ' + num(z)).join('; '), 'The ' + (big ? 'largest' : 'smallest') + ' zero is ' + B(num(ans)) + '.'],
        traps: TR([tr(big ? Math.max(...zs.map(z => -z)) : Math.min(...zs.map(z => -z)), 'x_zeros', 'x ' + MINUS + ' 3 = 0 means x = 3: the zero has the opposite sign to the number in the bracket.'), tr(big ? Math.min(...zs) : Math.max(...zs), 'x_zeros', 'That is the ' + (big ? 'smallest' : 'largest') + ' zero.')]) };
    }
    if (d === 1) {
      const k = R.i(2, 5), m = nz(R, -9, 9); if (gcd(k, m) !== 1) return null;
      const r1 = R.i(-7, 7), r2 = R.i(-7, 7); if (r1 === r2) return null;
      const z = F(-m, k), zs = [r1, r2], all = [z.n / z.d, r1, r2], q = R.i(0, 2), e = 'p(x) = ' + fac(r1) + lin(k, m) + fac(r2);
      const zl = [fac(r1) + ' = 0 at x = ' + num(r1), lin(k, m) + ' = 0 at x = ' + fr(-m, k), fac(r2) + ' = 0 at x = ' + num(r2)].join('; ');
      if (q === 0) {
        const ans = F(-m + k * (r1 + r2), k);
        return { text: 'What is the sum of the zeros of ' + B(e) + '? (A fraction is fine.)', ans, type: 'frac',
          how: [W(zl, 'set each factor to 0'), W(num(r1) + ' + ' + par2(r2) + ' + ' + (z.n < 0 ? '(' + fr(-m, k) + ')' : fr(-m, k)), 'add them'), '= ' + B(fq(ans))],
          steps: [st('The zero of ' + B(lin(k, m)) + '?', z, { type: 'frac' }), st('The sum of all three?', ans, { type: 'frac' })],
          traps: TR([tr(F(-m + r1 + r2, 1), 'x_zeros', lin(k, m) + ' = 0 means ' + term(k, 'x') + ' = ' + num(-m) + ': divide by ' + k + '.'), tr(F(m - k * (r1 + r2), k), 'x_zeros', 'Each zero has the opposite sign to the number in its bracket.'), tr(F(m + k * (r1 + r2), k), 'x_zeros', lin(k, m) + ' = 0 at x = ' + fr(-m, k) + ': mind that sign.')]) };
      }
      const big = q === 1, v = big ? Math.max(...all) : Math.min(...all), ans = v === z.n / z.d ? z : F(v, 1), o = big ? Math.min(...all) : Math.max(...all), ov = o === z.n / z.d ? z : F(o, 1);
      return { text: 'What is the ' + (big ? 'largest' : 'smallest') + ' zero of ' + B(e) + '? (A fraction is fine.)', ans, type: 'frac',
        how: [W(zl, 'set each factor to 0'), 'The ' + (big ? 'largest' : 'smallest') + ' is ' + B(fq(ans)) + '.'],
        steps: [st('The zero of ' + B(lin(k, m)) + '?', z, { type: 'frac' }), st('The ' + (big ? 'largest' : 'smallest') + ' zero?', ans, { type: 'frac' })],
        traps: TR([tr(F(-m, 1), 'x_zeros', 'Divide by ' + k + ': ' + term(k, 'x') + ' = ' + num(-m) + '.'), tr(F(m, k), 'x_zeros', 'The zero has the opposite sign to the number in the bracket.'), tr(ov, 'x_zeros', 'That is the ' + (big ? 'smallest' : 'largest') + '.')]) };
    }
    const a = R.i(-6, 6), b = R.i(-6, 6), k = R.i(2, 3), m = nz(R, -7, 7), withX = R.chance(.4), c0 = R.pick([1, 1, 2, -1, 3]);
    if (gcd(k, m) !== 1 || a === b || (withX && (a === 0 || b === 0))) return null;
    const lead = c0 === 1 ? '' : c0 === -1 ? MINUS : String(c0), e = 'p(x) = ' + lead + (withX ? 'x' : '') + pw(fac(a), 2) + fac(b) + lin(k, m);
    const distinct = withX ? 4 : 3, deg = withX ? 5 : 4, q = R.i(0, 2);
    const zl = [withX ? 'x = 0' : '', fac(a) + ' squared: x = ' + num(a) + ' (twice)', fac(b) + ': x = ' + num(b), lin(k, m) + ': x = ' + fr(-m, k)].filter(Boolean).join('; ');
    if (q === 0) return { text: 'How many different zeros does ' + B(e) + ' have?', ans: distinct,
      how: [W(zl, 'set each factor to 0'), 'The squared factor gives the same zero twice; count it once: ' + B(distinct) + ' different zeros.'],
      traps: TR([tr(deg, 'x_zeros', 'A squared factor gives the same zero twice. Count different zeros.'), c0 !== 1 && c0 !== -1 ? tr(distinct + 1, 'x_zeros', 'The number in front is never 0, so it gives no zero.') : null, tr(distinct - 1, 'x_zeros', withX ? 'The x on its own is a factor too: x = 0.' : 'Count every factor that can be 0.')]) };
    if (q === 1) return { text: 'The graph of ' + B(e) + ' touches the x-axis and turns back at one zero (it doesn\'t cross there). Which zero?', ans: a,
      how: [W(zl, 'set each factor to 0'), 'A squared factor means the sign doesn\'t change there, so the graph touches and turns back at x = ' + B(num(a)) + '.'],
      traps: TR([tr(-a || null, 'x_zeros', fac(a) + ' = 0 at x = ' + num(a) + ': mind the sign.'), tr(b, 'x_zeros', 'A factor to the power 1 crosses. Look for the squared one.')]) };
    const ans = F(k * (a + b) - m, k);
    return { text: 'What is the sum of the different zeros of ' + B(e) + '? (A fraction is fine.)', ans, type: 'frac',
      how: [W(zl, 'set each factor to 0'), W(num(a) + ' + ' + par2(b) + ' + ' + (m > 0 ? '(' + fr(-m, k) + ')' : fr(-m, k)) + (withX ? ' + 0' : ''), 'each different zero once'), '= ' + B(fq(ans))],
      steps: [st('The zero of ' + B(lin(k, m)) + '?', F(-m, k), { type: 'frac' }), st('The sum of the different zeros?', ans, { type: 'frac' })],
      traps: TR([tr(F(k * (2 * a + b) - m, k), 'x_zeros', 'Count a repeated zero once in a sum of different zeros.'), tr(F(a + b - m, 1), 'x_zeros', lin(k, m) + ' = 0 means x = ' + fr(-m, k) + '.'), tr(F(-k * (a + b) + m, k), 'x_zeros', 'Each zero has the opposite sign to the number in its bracket.')]) };
  } },

/* ---------- A-CED.A.3: constraints, which solutions make sense ---------- */
{ id: 's_constraint', s: 'story', g: 9, title: 'Constraints: what is possible?', paper: true, cc: ['A-CED.A.3'], pre: ['c_budget', 'x_ineq'],
  tip: 'Write the limit as an inequality, solve it, then ask what makes sense: you can\'t buy 5.4 tickets. "At most" rounds down; "at least" rounds up.',
  gen(d, R) {
    const SH = [['adult ticket', 'adult tickets', 'child ticket', 'child tickets'], ['hat', 'hats', 'scarf', 'scarves'], ['large pizza', 'large pizzas', 'small pizza', 'small pizzas'],
      ['notebook', 'notebooks', 'pen', 'pens'], ['plant', 'plants', 'seed packet', 'seed packets'], ['book', 'books', 'magazine', 'magazines']];
    const it = R.pick(SH), nm = R.pick(NAMES), A = R.i(6, 15), Bp = R.i(2, A - 2);
    const dv = (x, y) => x % y === 0 ? num(x / y) : mixed(Math.floor(x / y), reduce(x % y, y)[0], reduce(x % y, y)[1]);
    if (d === 0 || (d === 1 && R.chance(.5))) {
      const k = R.i(1, 6), ans = R.i(2, 8), rem = R.i(0, A - 1), Mn = k * Bp + ans * A + rem, Bk = k * Bp, least = d === 1;
      const kb = k + ' ' + (k === 1 ? it[2] : it[3]), text = nm + ' has ' + money(Mn) + '. ' + an(it[0], true) + ' costs ' + money(A) + ' and ' + an(it[2]) + ' costs ' + money(Bp) + '. ' + (least ? nm + ' must buy at least ' + kb + '.' : nm + ' buys ' + kb + '.') + ' What is the greatest number of ' + it[1] + ' ' + nm + ' can ' + (least ? '' : 'also ') + 'buy?';
      return { text, ans,
        how: [W(A + 'n + ' + Bp + ' × ' + k + ' ≤ ' + Mn, (least ? 'the fewest ' + it[3] + ' leave the most money: ' + k + '; ' : '') + 'n = number of ' + it[1]), W(A + 'n + ' + Bk + ' ≤ ' + Mn, ''), W(A + 'n ≤ ' + (Mn - Bk), 'take ' + Bk + ' from both sides'), W('n ≤ ' + dv(Mn - Bk, A), 'divide by ' + A), 'n must be a whole number, so the most is ' + B(ans) + '.'],
        steps: [st('Money left after the ' + it[3] + ': ' + B(Mn + M + Bk) + ' = ?', Mn - Bk), st('How many whole ' + money(A) + ' ' + it[1] + ' fit in ' + money(Mn - Bk) + '?', ans)],
        traps: TR([rem ? tr(ans + 1, 's_constraint', 'Rounding up costs more money than ' + nm + ' has. Round down.') : null, tr(Math.floor(Mn / A), 's_constraint', 'Pay for the ' + it[3] + ' first.'), tr(ans + k, 's_constraint', 'That counts the ' + it[3] + ' too.')]) };
    }
    if (d === 1) {
      const p = R.i(2, 9), s = R.i(5, 40), ans = R.i(6, 30), T = s + p * (ans - 1) + R.i(1, p), need = T - s;
      const thing = R.pick([['cup of lemonade', 'cups'], ['bracelet', 'bracelets'], ['cookie box', 'cookie boxes'], ['car wash', 'car washes']]);
      return { text: nm + ' earns ' + money(p) + ' for each ' + thing[0] + ' and already has ' + money(s) + '. ' + nm + ' needs at least ' + money(T) + '. What is the least number of ' + thing[1] + ' needed?', ans,
        how: [W(s + ' + ' + p + 'n ≥ ' + T, 'n = number of ' + thing[1]), W(p + 'n ≥ ' + need, 'take ' + s + ' from both sides'), W('n ≥ ' + dv(need, p), 'divide by ' + p), 'n must be a whole number' + (need % p ? ' and at least that much, so round up: ' : ': ') + B(ans) + '.'],
        steps: [st('Still needed: ' + B(T + M + s) + ' = ?', need), st('Least whole n with ' + B(p + 'n ≥ ' + need) + '?', ans)],
        traps: TR([need % p ? tr(ans - 1, 's_constraint', 'Rounding down leaves ' + nm + ' short. "At least" rounds up.') : null, tr(Math.ceil(T / p), 's_constraint', nm + ' already has ' + money(s) + '.'), tr(Math.ceil((T + s) / p), 'n_intsub', 'Take what ' + nm + ' has away from the goal.')]) };
    }
    const mA = R.i(1, 3), mB = R.i(1, 4), Mn = R.i(4, 9) * A; const left = Mn - mA * A, kids = Math.floor(left / Bp);
    if (kids < mB + 1) return null;
    const ans = mA + kids, maxA = mB + Math.floor((Mn - mB * Bp) / A);
    return { text: nm + ' has ' + money(Mn) + ' for ' + it[1] + ' at ' + money(A) + ' and ' + it[3] + ' at ' + money(Bp) + ', and must buy at least ' + mA + ' ' + (mA === 1 ? it[0] : it[1]) + ' and at least ' + mB + ' ' + (mB === 1 ? it[2] : it[3]) + '. What is the greatest number of things in all?', ans,
      how: [W(A + 'a + ' + Bp + 'b ≤ ' + Mn + ', a ≥ ' + mA + ', b ≥ ' + mB, 'write every constraint'), W('a = ' + mA, it[3] + ' are cheaper, so buy only the ' + it[1] + ' you must'), W(Bp + 'b ≤ ' + Mn + M + A * mA + ' = ' + left, ''), W('b ≤ ' + dv(left, Bp) + ', so b = ' + kids, 'round down'), 'In all: ' + mA + ' + ' + kids + ' = ' + B(ans)],
      steps: [st('Money left after the ' + mA + ' required ' + (mA === 1 ? it[0] : it[1]) + '?', left), st('Most ' + it[3] + ' with that money?', kids), st('Things in all?', ans)],
      traps: TR([tr(maxA, 's_constraint', 'Buying more of the cheaper item gives more things.'), tr(mA + mB, 's_constraint', 'Those are only the smallest amounts. Spend the rest too.'), tr(Math.floor(Mn / Bp), 's_constraint', 'At least ' + mA + ' of the ' + it[1] + ' must be bought.')]) };
  } },

/* ---------- A-CED.A.4: rearrange a formula ---------- */
{ id: 'x_literal', s: 'alg', g: 9, title: 'Rearrange a formula', paper: true, cc: ['A-CED.A.4'], pre: ['f_simplify'],
  tip: 'Solve for a letter the same way you solve for x: undo each step on both sides. 3x + 4y = 12 → 4y = −3x + 12 → y = −3/4 x + 3.',
  gen(d, R) {
    if (d === 0) {
      const a = nz(R, -6, 6), b = R.i(2, 6) * (R.chance(.3) ? -1 : 1), c = nz(R, -24, 24), askM = R.chance(.5), ans = askM ? F(-a, b) : F(c, b);
      const eq = ex([[a, 'x'], [b, 'y']]) + ' = ' + num(c);
      return { text: 'Rewrite ' + B(eq) + ' as ' + B('y = mx + k') + '. What is ' + B(askM ? 'm' : 'k') + '? (A fraction is fine.)', ans, type: 'frac',
        how: [W(term(b, 'y') + ' = ' + poly([-a, c]), (a > 0 ? 'take ' + term(a, 'x') + ' from' : 'add ' + term(-a, 'x') + ' to') + ' both sides'), W('y = ' + lf(-a, b, c, b, 'x'), 'divide every term by ' + num(b)), (askM ? 'm' : 'k') + ' = ' + B(fq(ans))],
        steps: [st('Move the x-term to the right side. What number is in front of x there now?', -a), st((askM ? 'm' : 'k') + ' = ?', ans, { type: 'frac' })],
        traps: askM ? TR([tr(F(a, b), 'x_literal', 'Moving ' + term(a, 'x') + ' to the other side changes its sign.'), tr(F(-a, 1), 'x_literal', 'Divide the x-term by ' + num(b) + ' too.'), tr(F(-b, a), 'x_literal', 'Divide by the number in front of y.')])
          : TR([tr(F(c, 1), 'x_literal', 'Divide ' + num(c) + ' by ' + num(b) + ' too.'), tr(F(-c, b), 'x_literal', num(c) + ' stays on its side, so its sign doesn\'t change.')]) };
    }
    if (d === 1) {
      if (R.chance(.4)) {
        const N = R.i(0, 4), askA = R.chance(.5);
        const S = [
          { f: 'P = 2l + 2w', to: 'w = aP + bl', a: F(1, 2), b: F(-1, 1), s1: ['Take 2l from both sides: ' + B('2w = P ' + MINUS + ' ?l'), 2], how: [W('2w = P ' + MINUS + ' 2l', 'take 2l from both sides'), W('w = ' + fl(1, 2) + 'P ' + MINUS + ' l', 'divide every term by 2')] },
          { f: 'P = 2l + 2w', to: 'l = aP + bw', a: F(1, 2), b: F(-1, 1), s1: ['Take 2w from both sides: ' + B('2l = P ' + MINUS + ' ?w'), 2], how: [W('2l = P ' + MINUS + ' 2w', 'take 2w from both sides'), W('l = ' + fl(1, 2) + 'P ' + MINUS + ' w', 'divide every term by 2')] },
          { f: 'C = ' + fl('5(F ' + MINUS + ' 32)', 9), to: 'F = aC + b', a: F(9, 5), b: F(32, 1), s1: ['Multiply both sides by 9 and multiply out: ' + B('9C = 5F ' + MINUS + ' ?'), 160], how: [W('9C = 5(F ' + MINUS + ' 32)', 'multiply both sides by 9'), W('9C = 5F ' + MINUS + ' 160', 'multiply out'), W('5F = 9C + 160', 'add 160, swap sides'), W('F = ' + fl(9, 5) + 'C + 32', 'divide every term by 5')] },
          { f: 'F = ' + fl(9, 5) + 'C + 32', to: 'C = aF + b', a: F(5, 9), b: F(-160, 9), s1: ['Take 32 away, then multiply both sides by 5: ' + B('5F ' + MINUS + ' ? = 9C'), 160], how: [W('F ' + MINUS + ' 32 = ' + fl(9, 5) + 'C', 'take 32 from both sides'), W('5F ' + MINUS + ' 160 = 9C', 'multiply both sides by 5'), W('C = ' + fl(5, 9) + 'F ' + MINUS + ' ' + fl(160, 9), 'divide every term by 9')] },
          { f: 'S = 180(n ' + MINUS + ' 2)', to: 'n = aS + b', a: F(1, 180), b: F(2, 1), s1: ['Multiply out: ' + B('S = 180n ' + MINUS + ' ?'), 360], how: [W('S = 180n ' + MINUS + ' 360', 'multiply out'), W('180n = S + 360', 'add 360, swap sides'), W('n = ' + fl(1, 180) + 'S + 2', 'divide every term by 180')] }][N];
        const ans = askA ? S.a : S.b, wrong = askA ? S.b : S.a;
        return { text: 'Rewrite ' + B(S.f) + ' as ' + B(S.to) + '. What is ' + B(askA ? 'a' : 'b') + '? (A fraction is fine.)', ans, type: 'frac',
          how: S.how.concat([(askA ? 'a' : 'b') + ' = ' + B(fq(ans))]),
          steps: [st(S.s1[0], S.s1[1]), st((askA ? 'a' : 'b') + ' = ?', ans, { type: 'frac' })],
          traps: TR([tr(wrong, 'x_literal', 'That is ' + (askA ? 'b' : 'a') + '.'), tr(F(-ans.n, ans.d), 'x_literal', 'Moving a term across changes its sign.'), tr(F(ans.d, ans.n), 'x_literal', 'Upside down: divide by the number in front of the letter you want.')]) };
      }
      const p = R.i(2, 6), q = nz(R, -12, 12), r = R.i(2, 9); if (r === p) return null;
      const askA = R.chance(.5), ans = askA ? F(r, p) : F(-q, p);
      return { text: 'Rewrite ' + B('y = ' + fl(poly([p, q]), r)) + ' as ' + B('x = ay + b') + '. What is ' + B(askA ? 'a' : 'b') + '? (A fraction is fine.)', ans, type: 'frac',
        how: [W(term(r, 'y') + ' = ' + poly([p, q]), 'multiply both sides by ' + r), W(poly([r, -q], 'y') + ' = ' + term(p, 'x'), (q > 0 ? 'take ' + q + ' from' : 'add ' + (-q) + ' to') + ' both sides'), W('x = ' + lf(r, p, -q, p, 'y'), 'divide every term by ' + p), (askA ? 'a' : 'b') + ' = ' + B(fq(ans))],
        steps: [st('Multiply both sides by ' + r + ', then move the ' + num(q) + '. The y-term is ' + B('?y') + ':', r), st((askA ? 'a' : 'b') + ' = ?', ans, { type: 'frac' })],
        traps: askA ? TR([tr(F(p, r), 'x_literal', 'Upside down: multiply by ' + r + ' first, then divide by ' + p + '.'), tr(F(1, p), 'x_literal', 'Multiply both sides by ' + r + ' first.')])
          : TR([tr(F(q, p), 'x_literal', 'Moving ' + signed(q) + ' across changes its sign.'), tr(F(-q, 1), 'x_literal', 'Divide ' + num(-q) + ' by ' + p + ' too.'), tr(F(-q * r, p), 'x_literal', 'Only y gets multiplied by ' + r + '.')]) };
    }
    if (R.chance(.5)) {
      const a = R.i(2, 9), c = R.i(1, 9), b = nz(R, -12, 12), dd = nz(R, -9, 9); if (a === c) return null;
      const k = a - c, askY = R.chance(.5), ans = askY ? F(dd, k) : F(-b, k);
      return { text: 'Solve ' + B(poly([a, b]) + ' = ' + ex([[c, 'x'], [dd, 'y']])) + ' for x, written as ' + B('x = my + k') + '. What is ' + B(askY ? 'm' : 'k') + '? (A fraction is fine.)', ans, type: 'frac',
        how: [W(ex([[a, 'x'], [-c, 'x']]) + ' = ' + poly([dd, -b], 'y'), 'x-terms on the left, the rest on the right'), W(term(k, 'x') + ' = ' + poly([dd, -b], 'y'), 'combine the x-terms'), W('x = ' + lf(dd, k, -b, k, 'y'), 'divide every term by ' + num(k)), (askY ? 'm' : 'k') + ' = ' + B(fq(ans))],
        steps: [st('Collect the x-terms: ' + B(term(a, 'x') + M + term(c, 'x')) + ' = ?x', k), st((askY ? 'm' : 'k') + ' = ?', ans, { type: 'frac' })],
        traps: TR([askY ? tr(F(dd, a + c), 'x_combine', 'Moving ' + term(c, 'x') + ' to the left makes it ' + MINUS + term(c, 'x') + '.') : tr(F(-b, a + c), 'x_combine', 'Moving ' + term(c, 'x') + ' to the left makes it ' + MINUS + term(c, 'x') + '.'), askY ? tr(F(dd, 1), 'x_literal', 'Divide by ' + k + ' too.') : tr(F(b, k), 'x_literal', 'Moving ' + signed(b) + ' across changes its sign.')]) };
    }
    const P = 100 * R.i(5, 50), r = R.pick([0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1]), t = R.i(1, 10), f = r10(1 + r * t), A = r10(P * f);
    return { text: 'Solve ' + B('A = P + Prt') + ' for P. Then find P when ' + B('A = ' + num(A) + ', r = ' + num(r) + ', t = ' + t) + '.', ans: P,
      how: [W('A = P(1 + rt)', 'P is in both terms: take it out'), W('P = ' + fl('A', '1 + rt'), 'divide both sides by (1 + rt)'), W('P = ' + fl(num(A), '1 + ' + num(r) + ' × ' + t) + ' = ' + fl(num(A), num(f)), 'put the numbers in'), 'P = ' + B(num(P))],
      steps: [st(B('1 + ' + num(r) + ' × ' + t) + ' = ?', f), st(B(num(A) + ' ÷ ' + num(f)) + ' = ?', P)],
      traps: TR([tr(r10(A - A * r * t), 'x_literal', 'P is in both terms. Take it out as a factor, then divide.'), tr(r10(A / (r * t)), 'x_literal', 'Divide by (1 + rt): P = P × 1 is the other part.'), tr(r10(A - r * t), 'x_literal', 'Take P out as a factor: A = P(1 + rt).')]) };
  } },

/* ---------- A-REI.A.2: radical equations and fake (extraneous) roots ---------- */
{ id: 'x_radeq', s: 'alg', g: 11, title: 'Radical equations: check for fakes', paper: true, cc: ['A-REI.A.2'], pre: ['w_roots'],
  tip: 'Get the root alone, square both sides, solve, then check every answer in the first equation. √(x + 7) = x − 5 gives x = 9 or 2, but x = 2 makes the right side −3: a fake.',
  gen(d, R) {
    if (d === 0) {
      const x0 = R.i(-5, 15), k = R.i(2, 9), p = R.pick([1, 1, 2, 3]), q = k * k - p * x0, c = R.chance(.4) ? nz(R, -9, 9) : 0, inner = poly([p, q]);
      const how = []; if (c) how.push(W(rt(inner) + ' = ' + k, (c > 0 ? 'take ' + c + ' from' : 'add ' + (-c) + ' to') + ' both sides: the root alone'));
      how.push(W(inner + ' = ' + k * k, 'square both sides'));
      if (p === 1) how.push(W('x = ' + num(x0), q > 0 ? 'take ' + q + ' away' : 'add ' + (-q)));
      else how.push(W(term(p, 'x') + ' = ' + num(k * k - q), q > 0 ? 'take ' + q + ' away' : 'add ' + (-q)), W('x = ' + num(x0), 'divide by ' + p));
      how.push('Check: ' + rt(num(p * x0 + q)) + ' = ' + k + ' ✓, so x = ' + B(num(x0)));
      return { text: 'Solve ' + B(rt(inner) + (c ? ' ' + signed(c) : '') + ' = ' + (k + c)) + '. What is x?', ans: x0, how,
        steps: [st('The root alone: ' + B(rt(inner)) + ' = ?', k), st('Square both sides: ' + B(inner) + ' = ?', k * k), st('x = ?', x0)],
        traps: TR([tr((k - q) / p, 'x_radeq', 'Square both sides to undo the square root.'), tr((k * k + q) / p, 'n_intsub', 'To undo ' + signed(q) + ', do the opposite.'), c ? tr(((k + c) * (k + c) - q) / p, 'x_radeq', 'Get the square root alone before you square.') : null]) };
    }
    let p = 1, sg = 1, b, t, f, iso = false;
    if (d === 1) { b = nz(R, -3, 6); t = b + R.i(2, 7); f = 2 * b + 1 - t; }
    else {
      const kind = R.i(0, 2);
      if (kind === 0) { p = R.i(2, 4); b = nz(R, -3, 5); t = b + p + R.i(1, 5); f = 2 * b + p - t; }
      else if (kind === 1) { sg = -1; b = nz(R, -2, 8); t = b - R.i(1, 6); f = 2 * b + 1 - t; }
      else { iso = true; b = nz(R, -6, 6); t = b + R.i(2, 7); f = 2 * b + 1 - t; }
    }
    const q = b * b - t * f, inner = poly([p, q]), S = 2 * b + p, lo = Math.min(t, f), hi = Math.max(t, f);
    const rhs = sg > 0 ? 'x ' + signed(-b) : num(b) + M + 'x', rv = x => sg * (x - b);
    const eq = iso ? rt(inner) + ' ' + signed(b) + ' = x' : rt(inner) + ' = ' + rhs;
    const how = []; if (iso) how.push(W(rt(inner) + ' = ' + rhs, (b > 0 ? 'take ' + b + ' from' : 'add ' + (-b) + ' to') + ' both sides: the root alone'));
    how.push(W(inner + ' = ' + pw('(' + rhs + ')', 2), 'square both sides'), W(inner + ' = ' + poly([1, -2 * b, b * b]), 'multiply out'), W(poly([1, -S, t * f]) + ' = 0', 'everything on one side'),
      W(fac2(lo, hi) + ' = 0, so x = ' + num(lo) + ' or x = ' + num(hi), 'factor'),
      W('x = ' + num(f) + ' makes ' + rhs + ' = ' + num(rv(f)) + ', but a square root is never negative', 'a fake root'), 'x = ' + num(t) + ' checks: ' + rt(num(p * t + q)) + ' = ' + num(rv(t)) + ' ✓. So x = ' + B(num(t)));
    return { text: 'Solve ' + B(eq) + '. Square, solve, and check. What is the solution that works?', ans: t, how,
      steps: [st('Square, multiply out and move everything to one side: ' + B(poly([1, -S, 0]) + ' + c = 0') + '. What is c?', t * f), st('The two answers are ' + num(lo) + ' and ' + num(hi) + '. Which one checks?', t)],
      traps: TR([tr(f, 'x_radeq', 'Check both answers in the first equation: x = ' + num(f) + ' makes the right side negative, and a square root can\'t be.'), tr(-t, 'n_intsub', 'Check the signs when you factor.'), tr(t + f, 'x_radeq', 'Solve the quadratic: find the two numbers, then check each one.')]) };
  } },

/* ---------- A-REI.A.2: rational equations ---------- */
{ id: 'x_rateq', s: 'alg', g: 11, title: 'Rational equations', paper: true, cc: ['A-REI.A.2'], pre: ['f_proportion', 'f_addunlike'],
  tip: 'Multiply both sides by the bottoms to clear them, solve, then check: an answer that makes a bottom 0 is not allowed. 3/(x − 2) = 6/x → 3x = 6(x − 2) → x = 4.',
  gen(d, R) {
    if (d === 0) {
      const x0 = R.i(1, 12), p = R.i(-6, x0 - 1); if (p === 0) return null;
      const g = gcd(x0 - p, x0), a = (x0 - p) / g, b = x0 / g; if (a === b || a > 20 || b > 20) return null;
      const den = 'x ' + signed(-p), k = a - b, how = [W(term(a, 'x') + ' = ' + (b === 1 ? den : b + '(' + den + ')'), 'cross multiply'), W(term(a, 'x') + ' = ' + poly([b, -b * p]), 'multiply out')];
      if (k === 1) how.push(W('x = ' + num(-b * p), 'take ' + term(b, 'x') + ' from both sides'));
      else how.push(W(term(k, 'x') + ' = ' + num(-b * p), 'take ' + term(b, 'x') + ' from both sides'), W('x = ' + num(x0), 'divide by ' + num(k)));
      how.push('No bottom is 0 at x = ' + num(x0) + ', so x = ' + B(num(x0)) + '.');
      return { text: 'Solve ' + B(fl(a, den) + ' = ' + fl(b, 'x')) + '. What is x?', ans: x0, how,
        steps: [st('Cross multiply and multiply out: ' + B(term(a, 'x') + ' = ' + term(b, 'x') + ' + ?'), -b * p), st('x = ?', x0)],
        traps: TR([tr(-x0, 'n_intsub', 'Check the signs when you move terms across.'), tr(r10(-p / k), 'x_distribute', 'Multiply the ' + num(b) + ' by both parts of (' + den + ').'), tr(p, 'x_rateq', 'x = ' + num(p) + ' makes a bottom 0, so it can\'t be a solution.')]) };
    }
    if (d === 1) {
      const x0 = nz(R, -9, 12), p = nz(R, -6, 6), k = R.i(2, 5); if (x0 === p) return null;
      const a = k * (x0 - p) - x0; if (a === 0) return null;
      const den = 'x ' + signed(-p), how = [W('x ' + signed(a) + ' = ' + k + '(' + den + ')', 'multiply both sides by (' + den + ')'), W('x ' + signed(a) + ' = ' + poly([k, -k * p]), 'multiply out')];
      if (k === 2) how.push(W(num(a + k * p) + ' = x', 'get the x-terms together'));
      else how.push(W(num(a + k * p) + ' = ' + term(k - 1, 'x'), 'get the x-terms together'), W('x = ' + num(x0), 'divide by ' + (k - 1)));
      how.push('x = ' + num(x0) + ' doesn\'t make the bottom 0, so x = ' + B(num(x0)) + '.');
      return { text: 'Solve ' + B(fl('x ' + signed(a), den) + ' = ' + k) + '. What is x?', ans: x0, how,
        steps: [st('Multiply both sides by (' + den + '): ' + B('x ' + signed(a) + ' = ' + k + 'x + ?'), -k * p), st('x = ?', x0)],
        traps: TR([tr(r10((a + p) / (k - 1)), 'x_distribute', 'Multiply ' + k + ' by both parts of (' + den + ').'), tr(-x0, 'n_intsub', 'Check the signs.'), tr(r10((a + k * p) / k), 'x_combine', 'Collect the x-terms: ' + term(k, 'x') + M + 'x = ' + term(k - 1, 'x') + '.')]) };
    }
    const p = nz(R, -6, 6), r = nz(R, -9, 9); if (r === p) return null;
    const s = p + r, t = p * r, den = 'x ' + signed(-p), lo = Math.min(p, r), hi = Math.max(p, r);
    return { text: 'Solve ' + B(fl(pw('x', 2), den) + ' = ' + fl(poly([s, -t]), den)) + '. Clear the bottoms and check. What is the solution that works?', ans: r,
      how: [W(pw('x', 2) + ' = ' + poly([s, -t]), 'multiply both sides by (' + den + ')'), W(poly([1, -s, t]) + ' = 0', 'everything on one side'), W(fac2(lo, hi) + ' = 0, so x = ' + num(lo) + ' or x = ' + num(hi), 'factor'), W('x = ' + num(p) + ' makes the bottom ' + den + ' = 0', 'not allowed'), 'So x = ' + B(num(r)) + '.'],
      steps: [st('Multiply both sides by (' + den + ') and move everything to one side: ' + B(pw('x', 2) + ' + bx ' + signed(t) + ' = 0') + '. What is b?', -s), st('The answers are ' + num(lo) + ' and ' + num(hi) + '. Which one works?', r)],
      traps: TR([tr(p, 'x_rateq', 'x = ' + num(p) + ' makes the bottom 0. Throw it out.'), tr(-r, 'n_intsub', 'Check the signs when you factor.'), tr(-p, 'x_factor', 'Check the factors: they must multiply to ' + num(t) + ' and add to ' + num(-s) + '.')]) };
  } },

/* ---------- A-REI.C.7: a line and a parabola ---------- */
{ id: 'x_linquad', s: 'alg', g: 9, title: 'Where a line meets a parabola', paper: true, cc: ['A-REI.C.7'], pre: ['s_system'],
  tip: 'Both equations give y, so set them equal. x² − 3 = 2x → x² − 2x − 3 = 0 → (x − 3)(x + 1) = 0: they meet at x = 3 and x = −1.',
  gen(d, R) {
    const r1 = R.i(-6, 6), r2 = R.i(-6, 6); if (r1 === r2) return null;
    const a = d < 2 ? 1 : R.pick([1, -1, 2]); let m, k, b, c;
    if (d === 0) { b = 0; c = 0; m = r1 + r2; k = -r1 * r2; if (m === 0) return null; }
    else { m = nz(R, -5, 5); k = nz(R, -9, 9); b = m - a * (r1 + r2); c = k + a * r1 * r2; }
    const lo = Math.min(r1, r2), hi = Math.max(r1, r2), big = R.chance(.5), x = big ? hi : lo, ox = big ? lo : hi, askY = d === 2 && R.chance(.6), y = m * x + k;
    const how = [W(poly([a, b, c]) + ' = ' + poly([m, k]), 'both equal y, so set them equal'), W(poly([a, b - m, c - k]) + ' = 0', 'everything on one side')];
    if (a !== 1) how.push(W(poly([1, -(r1 + r2), r1 * r2]) + ' = 0', 'divide every term by ' + num(a)));
    how.push(W(fac2(lo, hi) + ' = 0, so x = ' + num(lo) + ' or x = ' + num(hi), 'factor'));
    how.push(askY ? W('y = ' + num(m) + ' × ' + par2(x) + ' ' + signed(k) + ' = ' + B(num(y)), 'put x = ' + num(x) + ' into the line') : 'The ' + (big ? 'larger' : 'smaller') + ' x is ' + B(num(x)) + '.');
    const steps = [st('Set them equal, move everything to one side' + (a !== 1 ? ' and divide by ' + num(a) : '') + ': ' + B(pw('x', 2) + ' + bx + c = 0') + '. What is c?', r1 * r2), st('The ' + (big ? 'larger' : 'smaller') + ' x?', x)];
    if (askY) steps.push(st('Put it into the line: y = ?', y));
    return { text: 'Where do ' + B('y = ' + poly([a, b, c])) + ' and ' + B('y = ' + poly([m, k])) + ' meet? What is ' + (askY ? 'the y-coordinate of the point with the ' + (big ? 'larger' : 'smaller') + ' x' : 'the ' + (big ? 'larger' : 'smaller') + ' x') + '?', ans: askY ? y : x, how, steps,
      traps: askY ? TR([tr(x, 'x_linquad', 'That is the x-coordinate. Put it into the line to get y.'), tr(m * ox + k, 'x_linquad', 'That is the y at the other meeting point.'), tr(m * -x + k, 'n_intsub', 'Check the sign of x from the factors.')])
        : TR([tr(ox, 'x_linquad', 'That is the ' + (big ? 'smaller' : 'larger') + ' x.'), tr(-x, 'n_intsub', 'x ' + MINUS + ' 3 = 0 means x = 3: check the signs from the factors.'), tr(-ox, 'x_factor', 'Check the factors: the zeros have the opposite signs to the numbers in the brackets.')]) };
  } },

/* ---------- F-IF.A.2: function notation ---------- */
{ id: 'x_fnotation', s: 'alg', g: 9, title: 'Function notation: f(3)', cc: ['F-IF.A.2'], pre: ['n_intmul', 'w_exp'],
  tip: 'f(3) means put 3 in for every x. f(x) = 2x² − 3x + 1: f(−2) = 2 × 4 − 3 × (−2) + 1 = 15. f(a) = 21 asks the other way: which input gives 21?',
  gen(d, R) {
    if (d === 0) {
      const m = nz(R, -9, 9), b = nz(R, -12, 12), v = nz(R, -6, 9); if (Math.abs(m) === 1) return null; const ans = m * v + b;
      return { text: B('f(x) = ' + poly([m, b])) + '. What is ' + B('f(' + num(v) + ')') + '?', ans,
        how: [W('f(' + num(v) + ') = ' + num(m) + ' × ' + par2(v) + ' ' + signed(b), 'put ' + num(v) + ' in for x'), '= ' + num(m * v) + ' ' + signed(b) + ' = ' + B(num(ans))],
        steps: [st(B(num(m) + ' × ' + par2(v)) + ' = ?', m * v), st(B(num(m * v) + ' ' + signed(b)) + ' = ?', ans)],
        traps: TR([tr(m * v, 'x_eval', 'Don\'t forget the ' + signed(b) + '.'), tr(-m * v + b, 'n_intmul', 'Check the sign of ' + num(m) + ' × ' + par2(v) + '.'), tr(m + v + b, 'x_fnotation', 'f(' + num(v) + ') means x is ' + num(v) + ', so ' + num(m) + 'x is ' + num(m) + ' times ' + num(v) + '.')]) };
    }
    if (d === 1) {
      const a = nz(R, -4, 4), b = nz(R, -6, 6), c = nz(R, -9, 9), v = R.pick([-4, -3, -2, -1, 2, 3]), ans = a * v * v + b * v + c;
      return { text: B('f(x) = ' + poly([a, b, c])) + '. What is ' + B('f(' + num(v) + ')') + '?', ans,
        how: [W('f(' + num(v) + ') = ' + (a === 1 ? '' : num(a) + ' × ') + sq(v) + ' ' + signed(b) + ' × ' + par2(v) + ' ' + signed(c), 'put ' + num(v) + ' in for every x'), W('= ' + (a === 1 ? '' : num(a) + ' × ') + v * v + ' ' + signed(b * v) + ' ' + signed(c), 'square first: ' + sq(v) + ' = ' + v * v), '= ' + num(a * v * v) + ' ' + signed(b * v) + ' ' + signed(c) + ' = ' + B(num(ans))],
        steps: [st(B(sq(v)) + ' = ?', v * v), st(B(num(a) + ' × ' + v * v) + ' = ?', a * v * v), st(B(num(b) + ' × ' + par2(v)) + ' = ?', b * v), st('f(' + num(v) + ') = ?', ans)],
        traps: TR([v < 0 ? tr(-a * v * v + b * v + c, 'n_intmul', 'A negative number squared is positive.') : null, Math.abs(a) !== 1 ? tr(a * a * v * v + b * v + c, 'x_order', 'Square ' + num(v) + ' first, then times ' + num(a) + '.') : null, tr(a * 2 * v + b * v + c, 'w_exp', sq(v) + ' means ' + num(v) + ' × ' + num(v) + ', not 2 × ' + num(v) + '.'), tr(a * v * v - b * v + c, 'n_intmul', 'Check the sign of ' + num(b) + ' × ' + par2(v) + '.')]) };
    }
    const kind = R.i(0, 2);
    if (kind === 0) {
      const m = nz(R, -9, 9), b = nz(R, -12, 12), a0 = nz(R, -9, 9); if (Math.abs(m) === 1) return null; const k = m * a0 + b;
      return { text: B('f(x) = ' + poly([m, b])) + ' and ' + B('f(a) = ' + num(k)) + '. What is a?', ans: a0,
        how: [W(poly([m, b], 'a') + ' = ' + num(k), 'f(a) = ' + num(k) + ': the output is ' + num(k) + ', the input is a'), W(term(m, 'a') + ' = ' + num(k - b), (b > 0 ? 'take ' + b + ' from' : 'add ' + (-b) + ' to') + ' both sides'), W('a = ' + B(num(a0)), 'divide by ' + num(m))],
        steps: [st(B(term(m, 'a')) + ' = ?', k - b), st('a = ?', a0)],
        traps: TR([tr(m * k + b, 'x_fnotation', 'f(a) = ' + num(k) + ' gives the output. Find the input a that makes ' + num(k) + '.'), tr((k + b) / m, 'n_intsub', 'To undo ' + signed(b) + ', do the opposite.'), tr(k - b, 'x_onestep', 'One more step: divide by ' + num(m) + '.')]) };
    }
    if (kind === 1) {
      const a = nz(R, -3, 3), b = nz(R, -6, 6), c = nz(R, -9, 9), p = R.i(1, 4), q = nz(R, -3, 3); if (p === q) return null;
      const f = x => a * x * x + b * x + c, ans = f(p) - f(q);
      return { text: B('f(x) = ' + poly([a, b, c])) + '. What is ' + B('f(' + p + ')' + M + 'f(' + num(q) + ')') + '?', ans,
        how: [W('f(' + p + ') = ' + num(a) + ' × ' + sq(p) + ' ' + signed(b) + ' × ' + p + ' ' + signed(c) + ' = ' + num(f(p)), ''), W('f(' + num(q) + ') = ' + num(a) + ' × ' + sq(q) + ' ' + signed(b) + ' × ' + par2(q) + ' ' + signed(c) + ' = ' + num(f(q)), ''), num(f(p)) + M + par2(f(q)) + ' = ' + B(num(ans))],
        steps: [st('f(' + p + ') = ?', f(p)), st('f(' + num(q) + ') = ?', f(q)), st(B(num(f(p)) + M + par2(f(q))) + ' = ?', ans)],
        traps: TR([tr(f(p - q), 'x_fnotation', 'f(' + p + ') ' + MINUS + ' f(' + num(q) + ') is two outputs taken apart, not f of ' + p + ' ' + MINUS + ' ' + par2(q) + '.'), tr(f(p) + f(q), 'n_intsub', 'Taking away a negative adds.'), q < 0 ? tr(f(p) - (-a * q * q + b * q + c), 'n_intmul', 'A negative number squared is positive.') : null]) };
    }
    const a = R.i(1, 3), c = nz(R, -12, 12), t = R.i(1, 7), k = a * t * t + c;
    return { text: B('f(x) = ' + poly([a, 0, c])) + ' and ' + B('f(t) = ' + num(k)) + ' with t positive. What is t?', ans: t,
      how: [W(poly([a, 0, c], 't') + ' = ' + num(k), 'the output is ' + num(k)), W((a === 1 ? '' : a) + pw('t', 2) + ' = ' + num(k - c), (c > 0 ? 'take ' + c + ' from' : 'add ' + (-c) + ' to') + ' both sides')].concat(a !== 1 ? [W(pw('t', 2) + ' = ' + t * t, 'divide by ' + a)] : []).concat([W('t = ' + B(t), 'positive square root')]),
      steps: [st(B(pw('t', 2)) + ' = ?', t * t), st('t = ?', t)],
      traps: TR([tr(t * t, 'w_roots', 'Take the square root of ' + t * t + '.'), tr(a * k * k + c, 'x_fnotation', 'f(t) = ' + num(k) + ' gives the output. Find the input.'), tr(Math.sqrt(Math.abs(k + c)) % 1 ? null : Math.sqrt(Math.abs(k + c)), 'n_intsub', 'To undo ' + signed(c) + ', do the opposite.')]) };
  } },

/* ---------- F-IF.B.4: key features of a graph or table ---------- */
{ id: 'x_features', s: 'alg', g: 9, title: 'Read a graph: highs, lows, zeros', cc: ['F-IF.B.4'], pre: ['p_diffs'],
  tip: 'A thrown ball\'s heights rise, peak and fall the same way on both sides of the top. If it is highest at t = 3 and starts on the ground, it lands at t = 6.',
  gen(d, R) {
    const thing = R.pick(['ball', 'rocket', 'water balloon', 'beanbag']);
    if (d < 2) {
      const T = R.i(2, d === 0 ? 4 : 5), h = t => -5 * t * t + 10 * T * t, last = d === 0 ? 2 * T : T + 1, ts = []; for (let t = 0; t <= last; t++) ts.push(t);
      const vis = table([['t (s)'].concat(ts), ['h (m)'].concat(ts.map(h))]), H = 5 * T * T;
      if (d === 0) {
        const askH = R.chance(.5);
        return { text: 'The table shows a ' + thing + '\'s height h (meters) t seconds after it is thrown. What is ' + (askH ? 'the greatest height (meters)' : 'the time (seconds) when it is highest') + '?', vis, ans: askH ? H : T,
          how: ['The heights go up to ' + H + ' at t = ' + T + ', then come back down the same way.', askH ? 'The greatest height is ' + B(H) + ' m.' : 'It is highest at t = ' + B(T) + ' s.'],
          traps: TR(askH ? [tr(T, 'x_features', 'That is when it is highest. The question asks how high.'), tr(h(T + 1), 'x_features', 'Look for the biggest height in the table.'), tr(2 * T, 'x_features', 'That is when it lands.')] : [tr(H, 'x_features', 'That is how high. The question asks when.'), tr(2 * T, 'x_features', 'That is when it is back on the ground.'), tr(T + 1, 'x_features', 'After the top the heights start going down.')]) };
      }
      const again = T >= 3 && R.chance(.4), ans = again ? 2 * T - 1 : 2 * T;
      return { text: 'The table shows a ' + thing + '\'s height h (meters) t seconds after it is thrown from the ground. ' + (again ? 'At what other time is it at ' + h(1) + ' m?' : 'When does it land?'), vis, ans, unit: 's',
        how: [W('h(' + (T - 1) + ') = h(' + (T + 1) + ') = ' + h(T - 1), 'heights match on both sides of the top'), 'So the top is at t = ' + T + '.', again ? 'It is at ' + h(1) + ' m at t = 1, which is ' + (T - 1) + ' s before the top, so it is there again ' + (T - 1) + ' s after the top: ' + T + ' + ' + (T - 1) + ' = ' + B(ans) + '.' : 'It leaves the ground ' + T + ' s before the top, so it lands ' + T + ' s after: ' + T + ' + ' + T + ' = ' + B(ans) + '.'],
        steps: [st('When is it highest?', T), st(again ? 'How many seconds before the top is it at ' + h(1) + ' m?' : 'How many seconds from the start to the top?', again ? T - 1 : T), st(again ? 'So when is it there again?' : 'So when does it land?', ans)],
        traps: TR([tr(T, 'x_features', 'That is when it is highest.'), tr(last, 'x_features', 'The table stops before it lands. Use the matching heights on both sides of the top.'), tr(ans + 1, 'x_features', 'Count the same number of seconds after the top as before it.')]) };
    }
    const T = R.i(1, 4), c = T + R.i(0, 3), H = 5 * c * c, h0 = H - 5 * T * T, askL = R.chance(.6);
    const e = 'h(t) = ' + MINUS + '5' + pw('(t ' + signed(-T) + ')', 2) + ' + ' + num(H);
    if (askL) return { text: 'A ' + thing + '\'s height in meters is ' + B(e) + ', t in seconds. When does it hit the ground?', ans: T + c, unit: 's',
      how: [W(MINUS + '5' + pw('(t ' + signed(-T) + ')', 2) + ' + ' + num(H) + ' = 0', 'it lands when h = 0'), W(pw('(t ' + signed(-T) + ')', 2) + ' = ' + c * c, 'add, then divide by 5'), W('t ' + signed(-T) + ' = ' + c, 'positive root: landing comes after the top at t = ' + T), 't = ' + B(T + c)],
      steps: [st(B(pw('(t ' + signed(-T) + ')', 2)) + ' = ?', c * c), st('t ' + signed(-T) + ' = ?', c), st('t = ?', T + c)],
      traps: TR([tr(c, 'x_features', 'That is the time after the top. The top is at t = ' + T + '.'), tr(T - c > 0 ? T - c : null, 'x_features', 'That root is before it was thrown. Take the one after the top.'), tr(2 * T, 'x_features', 'It starts ' + h0 + ' m up, not on the ground, so it doesn\'t land at 2 × ' + T + '.'), tr(c * c + T, 'w_roots', 'Take the square root of ' + c * c + '.')]) };
    if (h0 === 0) return null;
    return { text: 'A ' + thing + '\'s height in meters is ' + B(e) + ', t in seconds. From what height (meters) was it thrown?', ans: h0,
      how: [W('h(0) = ' + MINUS + '5' + pw('(0 ' + signed(-T) + ')', 2) + ' + ' + num(H), 'thrown means t = 0'), W('= ' + MINUS + '5 × ' + T * T + ' + ' + num(H), ''), '= ' + B(num(h0))],
      steps: [st(B(pw('(0 ' + signed(-T) + ')', 2)) + ' = ?', T * T), st('h(0) = ?', h0)],
      traps: TR([tr(H, 'x_features', 'That is the greatest height, at t = ' + T + '. Thrown means t = 0.'), tr(H + 5 * T * T, 'n_intmul', MINUS + '5 × ' + T * T + ' is negative.'), tr(H - 25 * T * T, 'x_order', 'Square first, then times 5.')]) };
  } },

/* ---------- F-IF.B.5: domain in context ---------- */
{ id: 'x_domain', s: 'alg', g: 9, title: 'Domain: inputs that make sense', cc: ['F-IF.B.5'], pre: ['w_roots', 'c_budget'],
  tip: 'The domain is every input that works. Under a square root the number can\'t be negative: √(2x − 6) needs 2x − 6 ≥ 0, so x ≥ 3. In a story, inputs must make sense.',
  gen(d, R) {
    if (d === 0) {
      const a = nz(R, -9, 9), k = R.pick([1, 1, 2, 3, 4]), m = k * a, inner = poly([k, -m]);
      const how = [W(inner + ' ≥ 0', 'the number under a square root can\'t be negative')];
      if (k !== 1) how.push(W(term(k, 'x') + ' ≥ ' + num(m), (m > 0 ? 'add ' + m : 'take ' + (-m) + ' away')), W('x ≥ ' + num(a), 'divide by ' + k));
      else how.push(W('x ≥ ' + num(a), m > 0 ? 'add ' + m + ' to both sides' : 'take ' + (-m) + ' from both sides'));
      how.push('The smallest x allowed is ' + B(num(a)) + '.');
      return { text: 'What is the smallest x in the domain of ' + B('f(x) = ' + rt(inner)) + '?', ans: a, how,
        steps: [st('Solve ' + B(inner + ' ≥ 0') + '. x ≥ ?', a)],
        traps: TR([tr(-a, 'n_intsub', 'Solve ' + inner + ' ≥ 0: move the number with the opposite sign.'), k !== 1 ? tr(m, 'x_onestep', 'Divide by ' + k + ' too.') : null, tr(0, 'x_domain', 'x can be negative; it is the number under the root that can\'t be.')]) };
    }
    if (d === 1) {
      const kind = R.i(0, 2), k = R.i(2, 5), m = nz(R, -15, 15);
      if (kind === 0) {
        const mm = Math.abs(m), ans = F(mm, k), inner = num(mm) + M + term(k, 'x');
        return { text: 'What is the largest x in the domain of ' + B('f(x) = ' + rt(inner)) + '? (A fraction is fine.)', ans, type: 'frac',
          how: [W(inner + ' ≥ 0', 'the number under a square root can\'t be negative'), W(num(mm) + ' ≥ ' + term(k, 'x'), 'add ' + term(k, 'x') + ' to both sides'), W('x ≤ ' + fq(ans), 'divide by ' + k), 'The largest x is ' + B(fq(ans)) + '.'],
          steps: [st('Solve ' + B(inner + ' ≥ 0') + '. x ≤ ?', ans, { type: 'frac' })],
          traps: TR([tr(F(-mm, k), 'x_domain', 'Moving ' + MINUS + term(k, 'x') + ' across makes it positive: ' + num(mm) + ' ≥ ' + term(k, 'x') + '.'), tr(F(mm, 1), 'x_onestep', 'Divide by ' + k + '.'), tr(F(k, mm), 'x_onestep', 'Upside down: divide ' + num(mm) + ' by ' + k + '.')]) };
      }
      if (kind === 1) {
        const a = nz(R, -9, 9), c = R.i(1, 9);
        return { text: 'Which x is not in the domain of ' + B('f(x) = ' + fl(c, 'x ' + signed(-a)) + ' ' + signed(m)) + '?', ans: a,
          how: [W('x ' + signed(-a) + ' = 0', 'you can\'t divide by 0'), W('x = ' + B(num(a)), 'that x is left out')],
          steps: [st('Which x makes ' + B('x ' + signed(-a)) + ' equal 0?', a)],
          traps: TR([tr(-a, 'x_domain', 'x ' + signed(-a) + ' = 0 at x = ' + num(a) + ': the sign flips.'), tr(0, 'x_domain', 'x = 0 is fine here; it is the bottom that can\'t be 0.'), tr(c, 'x_domain', 'The top can be anything. Look at the bottom.')]) };
      }
      const ans = F(-m, k), inner = poly([k, m]);
      return { text: 'What is the smallest x in the domain of ' + B('f(x) = ' + rt(inner)) + '? (A fraction is fine.)', ans, type: 'frac',
        how: [W(inner + ' ≥ 0', 'the number under a square root can\'t be negative'), W(term(k, 'x') + ' ≥ ' + num(-m), (m > 0 ? 'take ' + m + ' away' : 'add ' + (-m))), W('x ≥ ' + fq(ans), 'divide by ' + k), 'The smallest x is ' + B(fq(ans)) + '.'],
        steps: [st('Solve ' + B(inner + ' ≥ 0') + '. x ≥ ?', ans, { type: 'frac' })],
        traps: TR([tr(F(m, k), 'n_intsub', 'Move ' + signed(m) + ' with the opposite sign.'), tr(F(-m, 1), 'x_onestep', 'Divide by ' + k + '.')]) };
    }
    const kind = R.i(0, 2), nm = R.pick(NAMES);
    if (kind === 1) {
      const r = R.pick([20, 25, 40, 50, 60, 75, 80, 120]), T = R.i(8, 60), V0 = r * T;
      return { text: 'A tank holds ' + num(V0) + ' liters and drains ' + r + ' liters a minute, so ' + B('V(t) = ' + num(V0) + M + r + 't') + '. The domain runs from t = 0 until it is empty. What is the largest t in the domain?', ans: T, unit: 'minutes',
        how: [W(num(V0) + M + r + 't = 0', 'empty means V(t) = 0'), W(r + 't = ' + num(V0), ''), W('t = ' + B(T), 'divide by ' + r + '; after that V(t) would be negative')],
        steps: [st('Solve ' + B(num(V0) + M + r + 't = 0') + '. t = ?', T)],
        traps: TR([tr(V0 - r, 'x_domain', 'The domain ends when V(t) = 0.'), tr(V0, 'x_domain', 'That is the starting amount (the top of the range of V). The domain is the times.'), tr(T + 1, 'x_domain', 'After t = ' + T + ' the tank would hold less than nothing.')]) };
    }
    const p = R.pick([3, 4, 6, 7, 8, 9, 12, 15]), Mn = p * R.i(4, 15) + R.i(1, p - 1), q = Math.floor(Mn / p);
    if (kind === 0) return { text: 'Tickets cost ' + money(p) + ' each, so n tickets cost ' + B('C(n) = ' + p + 'n') + '. ' + nm + ' has ' + money(Mn) + '. What is the largest n in the domain that makes sense here?', ans: q,
      how: [W(p + 'n ≤ ' + Mn, 'the cost can\'t be more than ' + money(Mn)), W('n ≤ ' + num(r10(Math.floor(Mn / p * 100) / 100)) + '…', 'divide by ' + p), 'n is a whole number of tickets, so the largest is ' + B(q) + '.'],
      steps: [st('How many whole ' + money(p) + ' tickets fit in ' + money(Mn) + '?', q)],
      traps: TR([tr(q + 1, 'x_domain', 'Rounding up costs more than ' + nm + ' has.'), tr(Mn, 'x_domain', 'That is money. The input n counts tickets.')]) };
    return { text: 'Tickets cost ' + money(p) + ' each and ' + nm + ' has ' + money(Mn) + '. The cost function ' + B('C(n) = ' + p + 'n') + ' has n = 0, 1, 2, … up to what ' + nm + ' can afford. How many numbers are in the domain?', ans: q + 1,
      how: [W(p + 'n ≤ ' + Mn + ', so n ≤ ' + num(r10(Math.floor(Mn / p * 100) / 100)) + '…', 'divide by ' + p), W('n = 0, 1, 2, …, ' + q, 'whole numbers only'), 'That is ' + q + ' + 1 = ' + B(q + 1) + ' numbers (count the 0).'],
      steps: [st('The largest n?', q), st('How many whole numbers from 0 to ' + q + '?', q + 1)],
      traps: TR([tr(q, 'x_domain', 'Count n = 0 too: buying no tickets is allowed.'), tr(q + 2, 'x_domain', 'The largest n is ' + q + '. Count 0 to ' + q + '.')]) };
  } },

/* ---------- F-IF.C.9: compare two functions given different ways ---------- */
{ id: 'x_compare2', s: 'alg', g: 9, title: 'Compare two functions', cc: ['F-IF.C.9'], pre: ['k_rate'],
  tip: 'Get the same fact from each form, then compare. From a formula, read or work it out; from a table, look for the pattern (the steps, or the matching values around the top).',
  gen(d, R) {
    if (d === 0) {
      const m1 = nz(R, -6, 6), b1 = nz(R, -9, 9), m2 = nz(R, -6, 6), b2 = nz(R, -9, 9); if (m1 === m2 || b1 === b2) return null;
      const xs = [1, 2, 3, 4], vis = table([['x'].concat(xs), ['g(x)'].concat(xs.map(x => m2 * x + b2))]), askB = R.chance(.5);
      const ans = askB ? Math.max(b1, b2) : Math.max(m1, m2);
      return { text: B('f(x) = ' + poly([m1, b1])) + ', and g is the line in the table. Which is greater: ' + (askB ? 'f\'s y-intercept or g\'s' : 'f\'s slope or g\'s') + '? Type the greater value.', vis, ans,
        how: askB ? ['f: the y-intercept is the number on its own: ' + num(b1) + '.', W('g: g(0) = g(1) ' + MINUS + ' ' + par2(m2) + ' = ' + num(m2 + b2) + M + par2(m2) + ' = ' + num(b2), 'each step of 1 in x adds ' + num(m2)), 'The greater is ' + B(num(ans)) + '.']
          : ['f: the slope is the number in front of x: ' + num(m1) + '.', W('g: ' + num(m2 * 2 + b2) + M + par2(m2 + b2) + ' = ' + num(m2), 'how much y changes for each 1 in x'), 'The greater is ' + B(num(ans)) + '.'],
        steps: askB ? [st('g(0) = ?', b2), st('The greater y-intercept?', ans)] : [st('g\'s slope?', m2), st('The greater slope?', ans)],
        traps: askB ? TR([tr(Math.min(b1, b2), 'x_compare2', 'That is the smaller one.'), tr(m2 + b2, 'x_compare2', 'The table starts at x = 1. The y-intercept is at x = 0.')]) : TR([tr(Math.min(m1, m2), 'x_compare2', 'That is the smaller one.'), tr(m2 + b2, 'x_slope', 'The slope is how much y changes for each 1 in x, not a y-value.')]) };
    }
    if (d === 1) {
      const h = nz(R, -4, 4), k = R.i(-6, 15), h2 = R.i(-3, 4), k2 = R.i(-6, 15), a2 = R.pick([1, 2]); if (k === k2) return null;
      const xs = [h2 - 2, h2 - 1, h2, h2 + 1, h2 + 2], vis = table([['x'].concat(xs), ['g(x)'].concat(xs.map(x => k2 - a2 * (x - h2) * (x - h2)))]), ans = Math.max(k, k2);
      const f = 'f(x) = ' + poly([-1, 2 * h, k - h * h]);
      return { text: B(f) + ', and g is given by the table. Each has a maximum value. Type the greater of the two maximums.', vis, ans,
        how: [W('f: x = ' + MINUS + 'b ÷ 2a = ' + MINUS + par2(2 * h) + ' ÷ (' + MINUS + '2) = ' + num(h), 'the top of the parabola'), W('f(' + num(h) + ') = ' + MINUS + pw('(' + num(h) + ')', 2) + ' ' + signed(2 * h * h) + ' ' + signed(k - h * h) + ' = ' + num(k), 'f\'s maximum'), 'g: the values match on both sides of x = ' + num(h2) + ', so its maximum is ' + num(k2) + '.', 'The greater maximum is ' + B(num(ans)) + '.'],
        steps: [st('Where is f highest? x = ?', h), st('f\'s maximum?', k), st('g\'s maximum?', k2), st('The greater?', ans)],
        traps: TR([tr(Math.min(k, k2), 'x_compare2', 'That is the smaller maximum.'), tr(k - h * h, 'x_vertex', 'That is where f crosses the y-axis, not its top.'), tr(h, 'x_vertex', 'That is where f is highest, not how high.')]) };
    }
    const iv = R.pick([[1, 3], [2, 4], [0, 2]]), p = iv[0], q = iv[1], A = iv[0] === 0 ? 2 * R.i(1, 3) : R.i(1, 5), b = nz(R, -6, 6);
    const fx = x => x * x + b * x, gx = x => A * Math.pow(2, x), rf = (fx(q) - fx(p)) / (q - p), rg = (gx(q) - gx(p)) / (q - p); if (rf === rg) return null;
    const xs = [0, 1, 2, 3, 4], vis = table([['x'].concat(xs), ['g(x)'].concat(xs.map(gx))]), ans = Math.max(rf, rg);
    return { text: B('f(x) = ' + poly([1, b, 0])) + ', and g is given by the table. Which has the greater average rate of change from x = ' + p + ' to x = ' + q + '? Type that rate.', vis, ans,
      how: [W('f: ' + fl('f(' + q + ')' + M + 'f(' + p + ')', q + M + p) + ' = ' + fl(num(fx(q)) + M + par2(fx(p)), q - p) + ' = ' + num(rf), 'change in y over change in x'), W('g: ' + fl(num(gx(q)) + M + num(gx(p)), q - p) + ' = ' + num(rg), 'read g(' + p + ') and g(' + q + ') from the table'), 'The greater rate is ' + B(num(ans)) + '.'],
      steps: [st('f(' + q + ')' + M + 'f(' + p + ') = ?', fx(q) - fx(p)), st('f\'s rate?', rf), st('g\'s rate?', rg), st('The greater?', ans)],
      traps: TR([tr(Math.min(rf, rg), 'x_compare2', 'That is the smaller rate.'), tr(Math.max(fx(q) - fx(p), gx(q) - gx(p)), 'k_rate', 'Divide the change in y by the change in x (' + (q - p) + ').'), tr(Math.max(fx(q), gx(q)), 'k_rate', 'The rate is a change over a change, not a value.')]) };
  } },

/* ---------- F-BF.A.1a: write the function for a story ---------- */
{ id: 'x_storyfn', s: 'alg', g: 9, title: 'Write the function for a story', paper: true, cc: ['F-BF.A.1a'], pre: ['s_equation', 'g_area'],
  tip: 'Name the input, then build the output from it in words first. A pen against a wall with 40 m of fence: width x, length 40 − 2x, so A(x) = x(40 − 2x).',
  gen(d, R) {
    if (d === 0) {
      const kind = R.i(0, 2);
      if (kind === 0) {
        const J = 5 * R.i(4, 12), m = R.i(10, 35), k = R.i(3, 12), ans = J + m * k;
        return { text: 'A gym charges ' + money(J) + ' to join and ' + money(m) + ' each month. Write C(n), the cost for n months. What is C(' + k + ')?', ans,
          how: [W('C(n) = ' + J + ' + ' + m + 'n', 'start fee + monthly fee × months'), W('C(' + k + ') = ' + J + ' + ' + m + ' × ' + k, ''), '= ' + J + ' + ' + m * k + ' = ' + B(num(ans))],
          steps: [st('C(n) = ' + J + ' + ?n', m), st('C(' + k + ') = ?', ans)],
          traps: TR([tr(m * k, 'x_storyfn', 'Add the ' + money(J) + ' joining fee once.'), tr(J * k + m, 'x_storyfn', 'The joining fee is paid once; the ' + money(m) + ' is paid every month.'), tr((J + m) * k, 'x_storyfn', 'Only the monthly fee is multiplied by the months.')]) };
      }
      if (kind === 1) {
        const b = R.i(1, 4), k = R.i(2, 8), H = b * k + R.i(5, 25), ans = H - b * k;
        return { text: 'A candle is ' + H + ' cm tall and burns down ' + b + ' cm each hour. Write h(t), its height after t hours. What is h(' + k + ')?', ans, unit: 'cm',
          how: [W('h(t) = ' + H + M + term(b, 't'), 'start height ' + MINUS + ' cm burned'), W('h(' + k + ') = ' + H + M + b + ' × ' + k, ''), '= ' + B(ans)],
          steps: [st('h(t) = ' + H + ' ' + MINUS + ' ?t', b), st('h(' + k + ') = ?', ans)],
          traps: TR([tr(H + b * k, 'x_storyfn', 'The candle gets shorter, so take away.'), tr(b * k, 'x_storyfn', 'That is how much burned. Take it from ' + H + '.')]) };
      }
      const L = R.i(10, 80), r = R.i(2, 12), k = R.i(3, 15), ans = L + r * k;
      return { text: 'A tank has ' + L + ' liters of water and fills at ' + r + ' liters a minute. Write V(t), the liters after t minutes. What is V(' + k + ')?', ans, unit: 'liters',
        how: [W('V(t) = ' + L + ' + ' + r + 't', 'start + rate × time'), W('V(' + k + ') = ' + L + ' + ' + r + ' × ' + k, ''), '= ' + B(ans)],
        steps: [st('V(t) = ' + L + ' + ?t', r), st('V(' + k + ') = ?', ans)],
        traps: TR([tr(r * k, 'x_storyfn', 'Add the ' + L + ' liters it started with.'), tr(L * k + r, 'x_storyfn', 'The ' + L + ' is there once; the ' + r + ' is added each minute.')]) };
    }
    if (d === 1) {
      const n = R.pick([2, 2, 3]), L = n === 2 ? 2 * R.i(10, 40) : 3 * R.i(5, 25), k = R.i(2, Math.floor((L - 1) / n)), side = L - n * k;
      if (side <= 0) return null;
      const q = R.i(0, 2), set = n === 2 ? 'A farmer has ' + L + ' m of fence to make a rectangular pen against a wall (no fence on the wall side).' : 'A farmer has ' + L + ' m of fence to make a rectangular pen against a wall, split in two by one more fence across it (no fence on the wall side).';
      const L1 = W('long side = ' + L + M + n + 'x', n + ' sides of length x use ' + n + 'x of the fence'), L2 = W('A(x) = x(' + L + M + n + 'x)', 'area = width × length');
      if (q === 0) return { text: set + ' Let x be the width of the sides that touch the wall. Write A(x). What is A(' + k + ')?', ans: k * side, unit: 'm²',
        how: [L1, L2, W('A(' + k + ') = ' + k + ' × (' + L + M + n * k + ') = ' + k + ' × ' + side, ''), '= ' + B(num(k * side))],
        steps: [st('The long side when x = ' + k + '?', side), st('A(' + k + ') = ?', k * side)],
        traps: TR([tr(k * (L - k), 'x_storyfn', 'There are ' + n + ' sides of length x, so ' + n + 'x of fence goes to them.'), tr(k * (L - 2 * k) === k * side ? k * (L - 3 * k) : k * (L - 2 * k), 'x_storyfn', 'Count the fence pieces of length x: there are ' + n + '.'), tr(2 * k + 2 * side, 'g_perim', 'That is the perimeter. The area is width × length.')]) };
      if (q === 1) return { text: set + ' Let x be the width of the sides that touch the wall. Write A(x) = ax² + bx. What is ' + B('a') + '?', ans: -n,
        how: [L1, L2, W('A(x) = ' + poly([-n, L, 0]), 'multiply out'), 'a = ' + B(num(-n))],
        steps: [st('The long side is ' + L + ' ' + MINUS + ' ?x', n), st('a = ?', -n)],
        traps: TR([tr(n, 'x_distribute', 'x times ' + MINUS + n + 'x is ' + MINUS + n + pw('x', 2) + ': keep the sign.'), tr(n === 2 ? -1 : -2, 'x_storyfn', 'Count the sides of length x: there are ' + n + '.'), tr(L, 'x_storyfn', 'That is b, with x.')]) };
      const ans = F(L, 2 * n);
      return { text: set + ' Let x be the width of the sides that touch the wall. Write A(x), then find the x that gives the biggest area. (A fraction is fine.)', ans, type: 'frac', unit: 'm',
        how: [L1, L2, W('A(x) = ' + poly([-n, L, 0]), 'multiply out'), W('x = ' + MINUS + 'b ÷ 2a = ' + MINUS + L + ' ÷ (' + MINUS + 2 * n + ')', 'the top of the parabola'), 'x = ' + B(fq(ans))],
        steps: [st('A(x) = ax² + bx. What is a?', -n), st('x = ' + MINUS + 'b ÷ 2a = ?', ans, { type: 'frac' })],
        traps: TR([tr(F(L, n), 'x_vertex', 'Divide by 2a: 2 × ' + n + ' = ' + 2 * n + '.'), tr(F(L, 4), n === 3 ? 'x_storyfn' : null, 'Count the sides of length x: there are ' + n + '.'), tr(F(L, 2), 'x_storyfn', 'Only the long side is ' + L + ' ' + MINUS + ' ' + n + 'x.')]) };
    }
    const P0 = R.i(5, 20), N0 = 20 * R.i(5, 20), dd = R.pick([5, 8, 10, 12, 15, 20]), k = R.i(1, 6); if (N0 - dd * k <= 0) return null;
    const askV = R.chance(.5), ans = askV ? (P0 + k) * (N0 - dd * k) : N0 - dd * P0;
    return { text: 'A show sells ' + N0 + ' tickets at ' + money(P0) + '. Each $1 price rise loses ' + dd + ' buyers. Write R(n), the money taken after n rises of $1. ' + (askV ? 'What is R(' + k + ')?' : 'Write R(n) = an² + bn + c. What is b?'), ans,
      how: [W('price = ' + P0 + ' + n, tickets = ' + N0 + M + dd + 'n', 'n = number of $1 rises'), W('R(n) = (' + P0 + ' + n)(' + N0 + M + dd + 'n)', 'money = price × tickets')].concat(askV ? [W('R(' + k + ') = ' + (P0 + k) + ' × ' + (N0 - dd * k), ''), '= ' + B(num(ans))] : [W('R(n) = ' + poly([-dd, N0 - dd * P0, P0 * N0], 'n'), 'multiply out: ' + N0 + 'n ' + MINUS + ' ' + dd * P0 + 'n'), 'b = ' + B(num(ans))]),
      steps: askV ? [st('Price after ' + k + ' rises?', P0 + k), st('Tickets sold then?', N0 - dd * k), st('R(' + k + ') = ?', ans)] : [st('The n-terms come from ' + B(P0 + ' × (' + MINUS + dd + 'n)') + ' and ' + B('n × ' + N0) + '. ' + B(N0 + ' + ' + par2(-dd * P0)) + ' = ?', ans)],
      traps: askV ? TR([tr(P0 * (N0 - dd * k), 'x_storyfn', 'The price went up too: ' + P0 + ' + ' + k + '.'), tr((P0 + k) * N0, 'x_storyfn', 'Fewer tickets sell: ' + N0 + ' ' + MINUS + ' ' + dd + ' × ' + k + '.'), tr(P0 * N0 + k, 'x_storyfn', 'Money = price × tickets, both after the rises.')])
        : TR([tr(N0 + dd * P0, 'n_intmul', P0 + ' × (' + MINUS + dd + 'n) is negative.'), tr(N0, 'x_foil', 'Two products make n-terms: ' + P0 + ' × (' + MINUS + dd + 'n) and n × ' + N0 + '.'), tr(-dd, 'x_storyfn', 'That is a, with ' + pw('n', 2) + '.')]) };
  } },

/* ---------- F-BF.A.1b: add, subtract and multiply functions ---------- */
{ id: 'x_fnarith', s: 'alg', g: 11, title: 'Add, subtract, multiply functions', cc: ['F-BF.A.1b'], pre: ['s_equation'],
  tip: '(f − g)(x) means f(x) − g(x): find each output, then do the operation. Profit = revenue − cost: P(x) = R(x) − C(x). Put brackets round C(x) so the minus reaches every term.',
  gen(d, R) {
    if (d === 0) {
      const p = R.i(5, 20), m = R.i(1, p - 2), Fc = 10 * R.i(5, 40), v = R.i(15, 80), ans = (p - m) * v - Fc;
      return { text: 'Revenue is ' + B('R(x) = ' + p + 'x') + ' and cost is ' + B('C(x) = ' + poly([m, Fc])) + ' dollars for x items. What is the profit ' + B('(R ' + MINUS + ' C)(' + v + ')') + '?', ans,
        how: [W('P(x) = ' + p + 'x ' + MINUS + ' (' + poly([m, Fc]) + ')', 'profit = revenue ' + MINUS + ' cost'), W('P(x) = ' + poly([p - m, -Fc]), 'the minus reaches both terms'), W('P(' + v + ') = ' + (p - m) + ' × ' + v + M + Fc, ''), '= ' + B(num(ans))],
        steps: [st('R(' + v + ') = ?', p * v), st('C(' + v + ') = ?', m * v + Fc), st('Profit = ?', ans)],
        traps: TR([tr((p - m) * v + Fc, 'x_distribute', 'The minus sign reaches every term of C(x), the ' + Fc + ' too.'), tr(p * v, 'x_fnarith', 'That is the revenue. Take away the cost.'), tr(p * v + m * v + Fc, 'x_fnarith', 'R ' + MINUS + ' C means take the cost away.')]) };
    }
    if (d === 1) {
      const a = nz(R, -6, 6), b = nz(R, -6, 6), v = nz(R, -4, 5), op = R.pick(['·', '+', MINUS, 'g−f']);
      const f = v + a, g = v * v + b, ans = op === '·' ? f * g : op === '+' ? f + g : op === MINUS ? f - g : g - f;
      const name = op === 'g−f' ? '(g ' + MINUS + ' f)' : '(f ' + op + ' g)', sym = op === '·' ? ' × ' : op === '+' ? ' + ' : M;
      const comb = op === 'g−f' ? num(g) + M + par2(f) : num(f) + sym + par2(g);
      return { text: B('f(x) = ' + poly([1, a])) + ' and ' + B('g(x) = ' + poly([1, 0, b])) + '. What is ' + B(name + '(' + num(v) + ')') + '?', ans,
        how: [W('f(' + num(v) + ') = ' + num(v) + ' ' + signed(a) + ' = ' + num(f), ''), W('g(' + num(v) + ') = ' + sq(v) + ' ' + signed(b) + ' = ' + num(g), ''), W(name + '(' + num(v) + ') = ' + comb + ' = ' + B(num(ans)), 'do the operation on the two outputs')],
        steps: [st('f(' + num(v) + ') = ?', f), st('g(' + num(v) + ') = ?', g), st(B(comb) + ' = ?', ans)],
        traps: TR([tr((f) * (f) + b, 'x_compose', 'That is g(f(' + num(v) + ')): feeding one into the other. Here you combine the two outputs.'), op === '·' ? tr(f + g, 'x_fnarith', 'f · g means multiply the outputs.') : tr(f * g, 'x_fnarith', 'Combine the outputs with ' + (op === '+' ? 'adding' : 'taking away') + ', not multiplying.'), op === MINUS || op === 'g−f' ? tr(-ans, 'x_fnarith', 'Check the order: ' + name + ' starts with ' + (op === 'g−f' ? 'g' : 'f') + '.') : v < 0 ? tr(op === '+' ? f - v * v + b : f * (b - v * v), 'n_intmul', 'A negative number squared is positive.') : null]) };
    }
    if (R.chance(.5)) {
      const p = R.i(6, 25), m = R.i(1, p - 2), x0 = R.i(10, 80), Fc = (p - m) * x0;
      return { text: 'Revenue is ' + B('R(x) = ' + p + 'x') + ' and cost is ' + B('C(x) = ' + poly([m, Fc])) + '. For what x is the profit ' + B('(R ' + MINUS + ' C)(x)') + ' zero (break even)?', ans: x0,
        how: [W(p + 'x ' + MINUS + ' (' + poly([m, Fc]) + ') = 0', 'profit = 0'), W(poly([p - m, -Fc]) + ' = 0', 'the minus reaches both terms'), W(term(p - m, 'x') + ' = ' + num(Fc), ''), W('x = ' + B(x0), 'divide by ' + (p - m))],
        steps: [st('(R ' + MINUS + ' C)(x) = ?x ' + MINUS + ' ' + num(Fc), p - m), st('x = ?', x0)],
        traps: TR([tr(r10(Fc / p), 'x_fnarith', 'Profit is R ' + MINUS + ' C, so the x-terms combine first: ' + p + 'x ' + MINUS + ' ' + term(m, 'x') + '.'), tr(r10(Fc / (p + m)), 'x_distribute', 'The minus sign reaches ' + term(m, 'x') + ' too.')]) };
    }
    const a = nz(R, -6, 6), c = R.i(2, 5), e = nz(R, -9, 9), askX = R.chance(.6), ans = askX ? e + a * c : a * e;
    return { text: B('f(x) = ' + poly([1, a])) + ' and ' + B('g(x) = ' + poly([c, e])) + '. Write ' + B('(f · g)(x)') + ' as ax² + bx + c. What is ' + B(askX ? 'b' : 'c') + '?', ans,
      how: [W('(f · g)(x) = (' + poly([1, a]) + ')(' + poly([c, e]) + ')', 'multiply the two functions'), W('= ' + ex([[c, pw('x', 2)], [e, 'x'], [a * c, 'x'], [a * e, '']]), 'first, outer, inner, last'), W('= ' + poly([c, e + a * c, a * e]), 'combine'), (askX ? 'b' : 'c') + ' = ' + B(num(ans))],
      steps: askX ? [st(B(num(a) + ' × ' + c + 'x') + ' = ?x', a * c), st('b = ' + B(num(e) + ' + ' + par2(a * c)) + ' = ?', ans)] : [st('c = ' + B(num(a) + ' × ' + par2(e)) + ' = ?', ans)],
      traps: askX ? TR([tr(e + a, 'x_foil', 'The inner product is ' + num(a) + ' × ' + c + 'x.'), tr(a * e, 'x_foil', 'That is the constant term c.'), tr(e - a * c, 'n_intmul', 'Check the sign of ' + num(a) + ' × ' + c + '.')]) : TR([tr(a + e, 'x_fnarith', '(f · g) multiplies: the constant is ' + num(a) + ' × ' + par2(e) + '.'), tr(-a * e, 'n_intmul', 'Check the sign.')]) };
  } },

/* ---------- F-BF.B.3: shifts, stretches, even and odd ---------- */
{ id: 'x_shift', s: 'alg', g: 9, title: 'Shifts and stretches of graphs', cc: ['F-BF.B.3'], pre: ['g_transform'],
  tip: 'A number inside the bracket moves the graph sideways the opposite way: f(x − 4) is 4 right. A number outside moves it up or down: f(x) + 3 is 3 up. 2f(x) stretches it taller.',
  gen(d, R) {
    if (d === 0) {
      const h = nz(R, -9, 9), k = nz(R, -9, 9), askH = R.chance(.5), e = 'y = ' + pw(fac(h), 2) + ' ' + signed(k);
      return { text: 'The graph of ' + B(e) + ' is the graph of y = x² moved. ' + (askH ? 'How far right? (Left is negative.)' : 'How far up? (Down is negative.)'), ans: askH ? h : k,
        how: askH ? ['Inside the bracket the move is the opposite way to the sign: ' + fac(h) + ' is zero at x = ' + num(h) + '.', 'So the vertex moves from x = 0 to x = ' + num(h) + ': right ' + B(num(h)) + (h < 0 ? ' (that is left ' + (-h) + ')' : '') + '.']
          : ['The number outside the bracket moves it up or down by that much, same sign.', signed(k) + ' means up ' + B(num(k)) + (k < 0 ? ' (that is down ' + (-k) + ')' : '') + '.'],
        traps: askH ? TR([tr(-h, 'x_shift', 'Inside the bracket the move goes the opposite way to the sign: x ' + MINUS + ' 4 moves right 4.'), tr(k, 'x_shift', 'The number outside moves it up or down.')]) : TR([tr(-k, 'x_shift', 'Outside the bracket the move has the same sign.'), tr(h, 'x_shift', 'The number inside the bracket moves it sideways.')]) };
    }
    if (d === 1) {
      const p = R.i(-6, 6), q = R.i(-6, 6), h = nz(R, -6, 6), k = nz(R, -8, 8), askX = R.chance(.5), ans = askX ? p + h : q + k;
      const g = 'g(x) = f(x ' + signed(-h) + ') ' + signed(k);
      return { text: 'The graph of f has its vertex at ' + B(pt(p, q)) + '. ' + B(g) + '. What is the ' + (askX ? 'x' : 'y') + '-coordinate of g\'s vertex?', ans,
        how: [W('f(x ' + signed(-h) + ') moves the graph ' + (h > 0 ? 'right ' : 'left ') + Math.abs(h), 'inside: the opposite way to the sign'), W(signed(k) + ' outside moves it ' + (k > 0 ? 'up ' : 'down ') + Math.abs(k), 'outside: same sign'), 'The vertex ' + pt(p, q) + ' goes to ' + pt(p + h, q + k) + ', so the ' + (askX ? 'x' : 'y') + '-coordinate is ' + B(num(ans)) + '.'],
        steps: [st('How far right does it move? (Left is negative.)', h), st('How far up? (Down is negative.)', k), st('The ' + (askX ? 'x' : 'y') + '-coordinate?', ans)],
        traps: askX ? TR([tr(p - h, 'x_shift', 'Inside the bracket the move is the opposite way to the sign.'), tr(p + k, 'x_shift', 'The number outside moves it up or down, not sideways.'), tr(p, 'x_shift', 'The inside number moves it sideways.')]) : TR([tr(q - k, 'x_shift', 'Outside the bracket the move has the same sign.'), tr(q + h, 'x_shift', 'The number inside moves it sideways, not up.'), tr(q, 'x_shift', 'The outside number moves it up or down.')]) };
    }
    const kind = R.i(0, 3), a = nz(R, -6, 6), b = nz(R, -9, 9);
    if (kind === 0) {
      const c = R.pick([2, 3, 4, -1, -2, -3]), ans = c * b;
      return { text: 'The point ' + B(pt(a, b)) + ' is on the graph of f. ' + B('g(x) = ' + (c === -1 ? MINUS : num(c)) + 'f(x)') + '. The point with x = ' + num(a) + ' on g has what y?', ans,
        how: [W('g(' + num(a) + ') = ' + num(c) + ' × f(' + num(a) + ')', 'a number outside multiplies every y'), '= ' + num(c) + ' × ' + par2(b) + ' = ' + B(num(ans))],
        traps: TR([tr(b + c, 'x_shift', 'A number multiplying f(x) stretches: multiply the y, don\'t add.'), tr(-ans, 'n_intmul', 'Check the sign.'), tr(b, 'x_shift', 'Outside the f, the number changes every y.')]) };
    }
    if (kind === 1) {
      const c = R.pick([2, 3, 4]), half = R.chance(.4), A2 = half ? F(a * c, 1) : F(a, c);
      return { text: 'The point ' + B(pt(a, b)) + ' is on the graph of f. ' + B('g(x) = f(' + (half ? fl(1, c) + 'x' : c + 'x') + ')') + '. The point on g with y = ' + num(b) + ' has what x? (A fraction is fine.)', ans: A2, type: 'frac',
        how: [W('g(x) = f(' + num(a) + ') when ' + (half ? fl(1, c) + 'x' : c + 'x') + ' = ' + num(a), 'the inside must equal ' + num(a)), W('x = ' + B(fq(A2)), half ? 'multiply by ' + c : 'divide by ' + c)],
        steps: [st('Solve ' + B((half ? fl(1, c) + 'x' : c + 'x') + ' = ' + num(a)) + '. x = ?', A2, { type: 'frac' })],
        traps: TR([tr(half ? F(a, c) : F(a * c, 1), 'x_shift', 'Inside the f the change works backwards: f(' + c + 'x) squeezes the graph, so x gets ' + c + ' times smaller.'), tr(F(a, 1), 'x_shift', 'The number inside f changes every x.')]) };
    }
    if (kind === 2) {
      const even = R.chance(.5), x = R.i(1, 9), y = nz(R, -12, 12), ans = even ? y : -y;
      return { text: 'f is an ' + (even ? 'even' : 'odd') + ' function and ' + B('f(' + x + ') = ' + num(y)) + '. What is ' + B('f(' + MINUS + x + ')') + '?', ans,
        how: [even ? 'Even means f(' + MINUS + 'x) = f(x): the graph is a mirror image in the y-axis.' : 'Odd means f(' + MINUS + 'x) = ' + MINUS + 'f(x): turning the graph half a turn about the origin keeps it the same.', 'f(' + MINUS + x + ') = ' + B(num(ans))],
        traps: TR([tr(-ans, 'x_shift', even ? 'Even: mirror in the y-axis, so the y stays the same.' : 'Odd: the y changes sign too.'), tr(-x, 'x_shift', 'The question asks for the output f(' + MINUS + x + ').')]) };
    }
    const h = nz(R, -5, 5), k = nz(R, -9, 9), c = R.pick([2, 3, -1, -2]), ans = c * b + k, g = 'g(x) = ' + (c === -1 ? MINUS : num(c)) + 'f(x ' + signed(-h) + ') ' + signed(k);
    return { text: 'The point ' + B(pt(a, b)) + ' is on the graph of f. ' + B(g) + '. The matching point on g has what y?', ans,
      how: [W('x ' + signed(-h) + ' = ' + num(a) + ' at x = ' + num(a + h), 'the point moves ' + (h > 0 ? 'right ' : 'left ') + Math.abs(h)), W('y = ' + num(c) + ' × ' + par2(b) + ' ' + signed(k), 'stretch first, then move ' + (k > 0 ? 'up' : 'down')), '= ' + num(c * b) + ' ' + signed(k) + ' = ' + B(num(ans))],
      steps: [st(B(num(c) + ' × ' + par2(b)) + ' = ?', c * b), st('Then ' + B(signed(k)) + ':', ans)],
      traps: TR([tr(c * (b + k), 'x_order', 'Multiply first, then add the ' + signed(k) + '.'), tr(b + k, 'x_shift', 'The ' + num(c) + ' stretches every y.'), tr(c * b - k, 'x_shift', 'Outside the bracket the move has the same sign.')]) };
  } },

/* ---------- F-LE.A.3: exponential growth wins in the end ---------- */
{ id: 'w_overtake', s: 'pow', g: 9, title: 'Exponential wins in the end', paper: true, cc: ['F-LE.A.3'], pre: ['x_linear'],
  tip: 'A power like 2ⁿ multiplies each step, so it always catches a line or a power of n. Make a table: 2⁸ = 256 is below 50 × 8 = 400, but 2⁹ = 512 beats 50 × 9 = 450.',
  gen(d, R) {
    let b, g, gS, gName;
    if (d < 2) {
      b = R.chance(.7) ? 2 : 3; const k = d === 0 ? (b === 2 ? R.i(3, 12) : R.i(4, 30)) : (b === 2 ? R.i(13, 120) : R.i(31, 300));
      g = n => k * n; gS = n => k + ' × ' + n; gName = k + 'n';
    } else {
      b = R.pick([2, 2, 3]); const e = R.pick([2, 3, 4]), k = R.chance(.4) ? R.i(2, 10) : 1;
      if (b === 2 && e === 4 && k > 1) return null;
      g = n => k * Math.pow(n, e); gS = n => (k > 1 ? k + ' × ' : '') + pw(n, e); gName = (k > 1 ? k : '') + pw('n', e);
    }
    const f = n => Math.pow(b, n); let last = 0, first = 0;
    for (let n = 1; n <= 60; n++) { if (f(n) <= g(n)) last = n; else if (!first) first = n; }
    const N = last + 1; if (N < 3 || f(N) > 5e6) return null;
    if (d < 2 && first !== N) return null;
    const early = first && first < N ? first : 0, fN = pw(b, 'n');
    const how = [];
    if (early) how.push(W('n = ' + early + ': ' + pw(b, early) + ' = ' + num(f(early)) + ', ' + gS(early) + ' = ' + num(g(early)), 'ahead early, but it falls behind again'));
    how.push(W('n = ' + (N - 1) + ': ' + pw(b, N - 1) + ' = ' + num(f(N - 1)) + ', ' + gS(N - 1) + ' = ' + num(g(N - 1)), fN + ' is not bigger'));
    how.push(W('n = ' + N + ': ' + pw(b, N) + ' = ' + num(f(N)) + ', ' + gS(N) + ' = ' + num(g(N)), 'now ' + fN + ' is bigger'));
    how.push('From here ' + fN + ' multiplies by ' + b + ' each step, faster than ' + gName + ' grows, so it stays ahead: n = ' + B(N) + '.');
    return { text: d < 2 ? 'What is the first whole number n (n ≥ 1) where ' + B(fN) + ' is bigger than ' + B(gName) + '? Make a table.' : 'From which whole number n on is ' + B(fN) + ' always bigger than ' + B(gName) + '? Make a table.', ans: N, how,
      steps: [st('n = ' + (N - 1) + ': ' + B(pw(b, N - 1)) + ' = ?', f(N - 1)), st('n = ' + (N - 1) + ': ' + B(gS(N - 1)) + ' = ?', g(N - 1)), st('n = ' + N + ': ' + B(pw(b, N)) + ' = ?', f(N)), st('So the answer is n = ?', N)],
      traps: TR([tr(N - 1, 'w_overtake', 'At n = ' + (N - 1) + ', ' + fN + ' is ' + num(f(N - 1)) + ' and ' + gName + ' is ' + num(g(N - 1)) + ': not bigger yet.'), tr(N + 1, 'w_overtake', 'Check n = ' + N + ': ' + fN + ' is already bigger there.'), early ? tr(early, 'w_overtake', 'It is ahead at n = ' + early + ' but falls behind again. Find where it stays ahead.') : null]) };
  } },

/* ---------- F-LE.B.5: what the numbers in a model mean ---------- */
{ id: 'w_params', s: 'pow', g: 9, title: 'What the numbers in a model mean', cc: ['F-LE.B.5'], pre: ['f_pctchange', 'x_linear'],
  tip: 'In C = 25 + 0.4m, 25 is the start (m = 0) and 0.4 is added for each m. In V = 18,000(0.85)ᵗ, 18,000 is the start and 0.85 keeps 85% each year: it loses 15%.',
  gen(d, R) {
    if (d === 0) {
      const kind = R.i(0, 2), k = R.i(2, 10), more = R.chance(.7);
      const C = [
        () => { const s = R.pick([2.5, 3, 3.5, 4]), r = R.pick([1.5, 2, 2.25, 2.5, 3]); return { t: 'A taxi ride of m miles costs ' + B('C = ' + num(s) + ' + ' + num(r) + 'm') + ' dollars.', q: more ? 'How many more dollars does a ride cost if it is ' + k + ' miles longer?' : 'How many dollars do you pay before any miles (m = 0)?', ans: more ? r10(r * k) : s, s, r, u: 'mile', lose: false }; },
        () => { const s = R.i(20, 40), r = R.pick([0.5, 1, 1.5, 2, 2.5]); return { t: 'A candle\'s height after t hours is ' + B('h = ' + s + M + num(r) + 't') + ' cm.', q: more ? 'How many cm shorter is it after ' + k + ' more hours?' : 'How tall (cm) was it when it was lit (t = 0)?', ans: more ? r10(r * k) : s, s, r, u: 'hour', lose: true }; },
        () => { const s = R.pick([15, 20, 25, 30]), r = R.pick([0.05, 0.1, 0.2, 0.25]); return { t: 'A phone plan costs ' + B('C = ' + s + ' + ' + num(r) + 'x') + ' dollars for x texts.', q: more ? 'How many more dollars do ' + k * 10 + ' extra texts cost?' : 'What is the cost (dollars) with no texts?', ans: more ? r10(r * k * 10) : s, s, r, u: 'text', lose: false, k10: true }; }][kind]();
      const kk = C.k10 ? k * 10 : k;
      return { text: C.t + ' ' + C.q, ans: C.ans,
        how: [num(C.r) + ' is the change for each ' + C.u + ' (the slope); ' + num(C.s) + ' is the value at the start (the intercept).', more ? kk + ' more: ' + num(C.r) + ' × ' + kk + ' = ' + B(num(C.ans)) + '.' : 'At the start: ' + B(num(C.s)) + '.'],
        traps: more ? TR([tr(r10(C.s + C.r * kk), 'w_params', 'The ' + num(C.s) + ' is the start. Extra ' + C.u + 's only add the ' + num(C.r) + ' part.'), tr(C.r, 'w_params', num(C.r) + ' is for one ' + C.u + '. Times it by ' + kk + '.'), tr(r10(C.s * kk), 'w_params', 'The start value is counted once; ' + num(C.r) + ' is the rate.')]) : TR([tr(C.r, 'w_params', num(C.r) + ' is the rate for each ' + C.u + '. The start is the number on its own.'), tr(r10(C.s + C.r), 'w_params', 'At the start nothing has been added yet.')]) };
    }
    if (d === 1) {
      const ctx = R.pick([['A car\'s value in dollars', 'V', [0.75, 0.8, 0.85, 0.9, 0.95], [12000, 18000, 25000, 30000], 'year'], ['A town\'s population', 'P', [1.02, 1.03, 1.04, 1.05, 1.08], [2400, 5000, 12000, 40000], 'year'],
        ['A savings account in dollars', 'A', [1.02, 1.03, 1.04, 1.05, 1.06], [500, 800, 1500, 2000], 'year'], ['The medicine in the blood (mg)', 'M', [0.5, 0.6, 0.7, 0.8, 0.9], [200, 400, 500, 800], 'hour']]);
      const b = R.pick(ctx[2]), A = R.pick(ctx[3]), grow = b > 1, q = R.chance(.6) ? 0 : R.chance(.5) ? 1 : 2, p = r10(Math.abs(b - 1) * 100);
      const e = ctx[1] + ' = ' + num(A) + pw('(' + num(b) + ')', 't'), base = ctx[0] + ' after t ' + ctx[4] + 's is ' + B(e) + '. ', yr = ctx[4];
      if (q === 0) return { text: base + 'By what percent does it ' + (grow ? 'grow' : 'drop') + ' each ' + yr + '?', ans: p, unit: '%',
        how: ['The number raised to the power t is the factor for each ' + yr + ': ' + num(b) + '.', grow ? num(b) + ' = 1 + ' + num(r10(b - 1)) + ': it keeps everything and adds ' + B(pct(p)) + '.' : num(b) + ' = 1 ' + MINUS + ' ' + num(r10(1 - b)) + ': it keeps ' + pct(100 * b) + ', so it loses ' + B(pct(p)) + '.'],
        traps: TR([tr(r10(100 * b), 'w_params', 'The factor ' + num(b) + ' is the part that is ' + (grow ? 'there after a year, 100% plus the growth' : 'kept, not the part lost') + '.'), tr(r10(Math.abs(b - 1)), 'f_pctchange', 'Write it as a percent: ' + num(r10(Math.abs(b - 1))) + ' = ' + pct(p) + '.'), tr(A, 'w_params', 'That is the starting amount.')]) };
      if (q === 1) return { text: base + 'What was it at the start (t = 0)?', ans: A,
        how: ['At t = 0, ' + pw('(' + num(b) + ')', 0) + ' = 1.', 'So ' + ctx[1] + ' = ' + num(A) + ' × 1 = ' + B(num(A)) + ': the number in front is the start.'],
        traps: TR([tr(r10(A * b), 'w_params', 'That is after 1 ' + yr + '. At t = 0 the power is 1.'), tr(0, 'w_negexp', 'Anything to the power 0 is 1, not 0.')]) };
      const ans = r10(A * b);
      return { text: base + 'What is it after 1 ' + yr + '?', ans,
        how: [W(ctx[1] + ' = ' + num(A) + ' × ' + num(b), 't = 1'), '= ' + B(num(ans))],
        traps: TR([tr(A, 'w_params', 'That is the start. One ' + yr + ' multiplies by ' + num(b) + ' once.'), tr(r10(A * Math.abs(b - 1)), 'w_params', 'That is only the change. Times by ' + num(b) + ' to get the new value.')]) };
    }
    const kind = R.i(0, 2);
    if (kind === 0) {
      const k = R.i(2, 12), m = R.pick([2, 3, 4]), times = Math.pow(2, m), A = R.pick([100, 250, 500, 1000, 3000]);
      return { text: 'A culture grows as ' + B('N = ' + num(A) + ' × ' + pw('2', 't/' + k)) + ', t in hours. After how many hours is it ' + times + ' times as big as at the start?', ans: m * k, unit: 'hours',
        how: [W('2 to the power t/' + k + ' doubles every time t goes up by ' + k, 'the doubling time is ' + k + ' hours'), W(times + ' = ' + pw(2, m) + ': ' + m + ' doublings', ''), m + ' × ' + k + ' = ' + B(m * k)],
        steps: [st('How many hours to double once?', k), st(times + ' times is how many doublings?', m), st('Hours?', m * k)],
        traps: TR([tr(k, 'w_params', 'That is one doubling. ' + times + ' times needs ' + m + '.'), tr(times * k, 'w_growth', times + ' times is ' + m + ' doublings (2 × 2' + (m > 2 ? ' × 2' : '') + (m > 3 ? ' × 2' : '') + '), not ' + times + '.'), tr(times / 2 * k, 'w_growth', 'Count the doublings: ' + times + ' = ' + pw(2, m) + '.')]) };
    }
    if (kind === 1) {
      const k = R.i(2, 12), m = R.pick([2, 3, 4]), part = Math.pow(2, m), A = R.pick([80, 160, 400, 640]);
      return { text: 'A medicine leaves the body as ' + B('M = ' + A + pw('(' + fl(1, 2) + ')', 't/' + k)) + ' mg, t in hours. After how many hours is only ' + fl(1, part) + ' of it left?', ans: m * k, unit: 'hours',
        how: [W('(½) to the power t/' + k + ' halves every ' + k + ' hours', 'the half-life is ' + k + ' hours'), W(fl(1, part) + ' = ' + pw('(' + fl(1, 2) + ')', m) + ': ' + m + ' halvings', ''), m + ' × ' + k + ' = ' + B(m * k)],
        steps: [st('How many hours to halve once?', k), st('Halvings to reach ' + fl(1, part) + '?', m), st('Hours?', m * k)],
        traps: TR([tr(k, 'w_params', 'That is one halving.'), tr(part * k, 'w_growth', fl(1, part) + ' is ' + m + ' halvings, not ' + part + '.')]) };
    }
    const r = R.pick([1.1, 1.2, 1.3, 0.9, 0.8, 0.7]), q = r10(r * r), A = R.pick([1000, 2000, 5000, 8000]), grow = r > 1, p = r10(Math.abs(r - 1) * 100);
    return { text: 'A model says ' + B('V = ' + num(A) + pw('(' + num(q) + ')', 't/2')) + ', t in years. By what percent does V ' + (grow ? 'grow' : 'drop') + ' each year?', ans: p, unit: '%',
      how: [W(pw('(' + num(q) + ')', 't/2') + ' = ' + pw('(' + rt(num(q)) + ')', 't'), 'power rule: t/2 means square root, then power t'), W(rt(num(q)) + ' = ' + num(r), num(r) + ' × ' + num(r) + ' = ' + num(q)), grow ? 'Factor ' + num(r) + ': it grows ' + B(pct(p)) + ' each year.' : 'Factor ' + num(r) + ': it keeps ' + pct(100 * r) + ', so it drops ' + B(pct(p)) + ' each year.'],
      steps: [st('Yearly factor: ' + B(rt(num(q))) + ' = ?', r), st('Percent ' + (grow ? 'growth' : 'drop') + ' each year?', p)],
      traps: TR([tr(r10(Math.abs(q - 1) * 100), 'w_params', 'That is the change every 2 years. Take the square root for 1 year.'), tr(r10(Math.abs(q - 1) * 50), 'w_rule72', 'Growth compounds: half of the 2-year change is not the yearly change.'), tr(r10(100 * r), 'w_params', 'The factor ' + num(r) + ' is what is ' + (grow ? 'there' : 'kept') + ', not the change.')]) };
  } },

/* ---------- G-CO.A.3: turns and flips that carry a shape onto itself ---------- */
{ id: 'g_symmetry', s: 'meas', g: 10, title: 'Turns and flips that fit a shape', cc: ['G-CO.A.3'], pre: ['m_divfam'],
  tip: 'A regular shape with n sides has n lines of symmetry, and turns of 360° ÷ n carry it onto itself. A regular 9-gon: 9 lines, smallest turn 40°.',
  gen(d, R) {
    const NM = { 3: 'equilateral triangle', 4: 'square', 5: 'regular pentagon', 6: 'regular hexagon', 8: 'regular octagon', 10: 'regular decagon' };
    if (d === 0) {
      const S = R.pick([['an equilateral triangle', 3, 'one through each corner'], ['a square', 4, 'two through opposite corners and two through the middles of opposite sides'], ['a regular pentagon', 5, 'one through each corner'], ['a regular hexagon', 6, 'three through opposite corners and three through opposite sides'], ['a regular octagon', 8, 'four through corners and four through sides'],
        ['a rectangle (not a square)', 2, 'one across the middle each way; the diagonals don\'t fold it onto itself'], ['a rhombus (not a square)', 2, 'along the two diagonals'], ['an isosceles triangle (not equilateral)', 1, 'down the middle from the top'], ['a parallelogram (not a rectangle or rhombus)', 0, 'no fold makes the halves match'], ['an isosceles trapezoid', 1, 'down the middle through the two parallel sides'], ['a kite (not a rhombus)', 1, 'along the long diagonal'], ['a regular decagon', 10, 'five through corners and five through sides']]);
      return { text: 'How many lines of symmetry does ' + S[0] + ' have?', ans: S[1],
        how: ['A line of symmetry folds the shape so the halves match exactly.', 'For ' + S[0] + ': ' + S[2] + '. That is ' + B(S[1]) + '.'],
        traps: TR([S[1] >= 4 && S[1] % 2 === 0 ? tr(S[1] / 2, 'g_symmetry', 'Count the lines through the middles of the sides as well as through the corners.') : null, S[0].indexOf('rectangle') >= 0 || S[0].indexOf('parallelogram') >= 0 ? tr(S[1] + 2, 'g_symmetry', 'Fold along a diagonal in your head: the halves don\'t match.') : null, tr(S[1] + 1, 'g_symmetry', 'Check each fold: do the two halves land exactly on each other?')]) };
    }
    if (d === 1) {
      if (R.chance(.25)) {
        const S = R.pick([['a rectangle (not a square)', 180, 2], ['a square', 90, 4], ['a parallelogram', 180, 2], ['an equilateral triangle', 120, 3], ['a rhombus (not a square)', 180, 2]]);
        return { text: 'What is the smallest turn (more than 0°) about its center that carries ' + S[0] + ' onto itself?', ans: S[1], unit: DEG,
          how: ['It looks the same ' + S[2] + ' times in a full turn.', '360° ÷ ' + S[2] + ' = ' + B(S[1] + DEG) + '.'],
          traps: TR([tr(S[1] === 180 ? 90 : S[1] / 2, 'g_symmetry', 'Try that turn in your head: the corners don\'t land on corners of the same kind.'), tr(360, 'g_symmetry', 'A full turn always works. Find the smallest turn more than 0°.')]) };
      }
      const n = R.pick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]), ans = 360 / n, name = NM[n] ? an(NM[n]) : 'a regular polygon with ' + n + ' sides';
      return { text: 'What is the smallest turn (more than 0°) about its center that carries ' + name + ' onto itself?', ans, unit: DEG,
        how: ['A turn works when every corner lands on the next corner. ' + n + ' equal steps make a full turn.', '360° ÷ ' + n + ' = ' + B(ans + DEG) + '.'],
        traps: TR([tr((n - 2) * 180 / n, 'g_polygon', 'That is the angle inside each corner. The turn is 360° ÷ ' + n + '.'), tr(180 / n, 'g_symmetry', 'A full turn is 360°, not 180°.'), tr(360, 'g_symmetry', 'A full turn always works. Find the smallest one.')]) };
    }
    const kind = R.i(0, 2), n = R.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), a = 360 / n, name = NM[n] ? an(NM[n]) : 'a regular polygon with ' + n + ' sides';
    if (kind === 0) return { text: 'How many turns between 0° and 360° (not counting 0° or 360°) carry ' + name + ' onto itself?', ans: n - 1,
      how: ['The turns that work are the multiples of 360° ÷ ' + n + ' = ' + a + DEG + ': ' + a + DEG + ', ' + 2 * a + DEG + ', …, ' + (360 - a) + DEG + '.', 'That is ' + n + ' multiples up to 360°, minus the 360° itself: ' + B(n - 1) + '.'],
      steps: [st('The smallest turn that works?', a, { unit: DEG }), st('How many turns between 0° and 360°?', n - 1)],
      traps: TR([tr(n, 'g_symmetry', 'Don\'t count the full 360° turn.'), tr(n - 2, 'g_symmetry', 'Count ' + a + DEG + ' itself too.')]) };
    if (kind === 1) return { text: 'The smallest turn that carries a regular polygon onto itself is ' + B(a + DEG) + '. How many sides does it have?', ans: n,
      how: ['The smallest turn is 360° ÷ (number of sides).', 'Sides = 360 ÷ ' + a + ' = ' + B(n) + '.'],
      traps: TR([tr(180 / a, 'g_symmetry', 'A full turn is 360°, not 180°.'), tr(r10(360 / (180 - a)), 'g_polygon', 'That treats ' + a + DEG + ' as the angle inside each corner. The smallest turn is 360° ÷ sides.')]) };
    const T = R.i(1, 359); if (T % a === 0) return null; const ans = Math.ceil(T / a) * a;
    return { text: 'A turn of ' + B(T + DEG) + ' does not carry ' + name + ' onto itself. What is the smallest turn bigger than ' + T + DEG + ' that does?', ans, unit: DEG,
      how: ['The turns that work are the multiples of 360° ÷ ' + n + ' = ' + a + DEG + '.', T + ' ÷ ' + a + ' = ' + Math.floor(T / a) + ' r ' + (T % a) + ', so the next multiple is ' + Math.ceil(T / a) + ' × ' + a + ' = ' + B(ans + DEG) + '.'],
      steps: [st('The smallest turn that works?', a, { unit: DEG }), st('The next multiple of ' + a + ' after ' + T + '?', ans)],
      traps: TR([tr(Math.floor(T / a) * a || null, 'g_symmetry', 'That one is smaller than ' + T + DEG + '. Go to the next multiple.'), tr(T + a, 'g_symmetry', 'The turns that work are multiples of ' + a + DEG + ', counted from 0°.')]) };
  } },

/* ---------- G-SRT.C.7: sine of one angle is the cosine of the other ---------- */
{ id: 'r_cofunction', s: 'trig', g: 10, title: 'sin of one angle, cos of the other', cc: ['G-SRT.C.7'], pre: ['g_pairs'],
  tip: 'The two small angles of a right triangle add to 90°, and the side opposite one is next to the other. So sin A = cos B: sin 38° = cos 52°.',
  gen(d, R) {
    if (d === 0) {
      const a = R.i(5, 85), sinFirst = R.chance(.5);
      return { text: B((sinFirst ? 'sin ' : 'cos ') + a + DEG + ' = ' + (sinFirst ? 'cos ' : 'sin ') + 'x' + DEG) + ', with x between 0 and 90. What is x?', ans: 90 - a, unit: DEG,
        how: ['In a right triangle the two small angles add to 90°, and the sine of one is the cosine of the other.', 'x = 90 ' + MINUS + ' ' + a + ' = ' + B(90 - a) + '.'],
        traps: TR([tr(180 - a, 'g_pairs', 'Sine and cosine swap for complementary angles: they add to 90°, not 180°.'), tr(a, 'r_cofunction', 'sin x and cos x are usually different; the angles add to 90°.')]) };
    }
    if (d === 1) {
      if (R.chance(.35)) {
        const a = R.i(10, 80), val = Math.round(Math.sin(a * Math.PI / 180) * 1000) / 1000, useSin = R.chance(.5), v = useSin ? val : Math.round(Math.cos((90 - a) * Math.PI / 180) * 1000) / 1000;
        return { text: (useSin ? 'sin ' + a + DEG : 'cos ' + (90 - a) + DEG) + ' ≈ ' + B(num(v)) + '. What is ' + B(useSin ? 'cos ' + (90 - a) + DEG : 'sin ' + a + DEG) + ' (to 3 decimal places)?', ans: v,
          how: [a + DEG + ' and ' + (90 - a) + DEG + ' add to 90°, so they are the two small angles of one right triangle.', 'The sine of one is the cosine of the other: ' + B(num(v)) + '.'],
          traps: TR([tr(r10(1 - v), 'r_identity', 'They are equal, not adding to 1.'), tr(Math.round(Math.cos(a * Math.PI / 180) * 1000) / 1000, 'r_cofunction', 'Switch both the function and the angle: sin ' + a + DEG + ' = cos ' + (90 - a) + DEG + '.')]) };
      }
      const T = R.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]), k = R.pick([1, 1, 2]), sw = R.chance(.5), BC = (sw ? T[1] : T[0]) * k, AC = (sw ? T[0] : T[1]) * k, AB = T[2] * k;
      const kind = R.i(0, 2), Q = [['sin A', 'cos B', BC, 'BC (opposite A)', 'BC (next to B)'], ['cos A', 'sin B', AC, 'AC (next to A)', 'AC (opposite B)'], ['sin B', 'cos A', AC, 'AC (opposite B)', 'AC (next to A)']][kind], ans = F(Q[2], AB);
      const other = Q[2] === BC ? AC : BC;
      return { text: 'In right triangle ABC the right angle is at C, and ' + B(Q[0] + ' = ' + fr(Q[2], AB)) + '. What is ' + B(Q[1]) + '?', ans, type: 'frac',
        how: [Q[0] + ' = ' + Q[3] + ' ÷ AB (the hypotenuse).', Q[1] + ' = ' + Q[4] + ' ÷ AB: the same two sides.', 'So ' + Q[1] + ' = ' + B(fr(Q[2], AB)) + '.'],
        traps: TR([tr(F(other, AB), 'r_ratio', 'Check which side is opposite and which is next to each angle: the side opposite A is next to B.'), tr(F(AB, Q[2]), 'r_ratio', 'Upside down: the hypotenuse goes on the bottom.'), tr(F(Q[2], other), 'r_ratio', 'Sine and cosine use the hypotenuse.')]) };
    }
    const x0 = R.i(3, 15), p = R.i(1, 5), r = R.i(1, 5), a1 = R.i(10, 80), q = a1 - p * x0, a2 = 90 - a1, s = a2 - r * x0;
    if (Math.abs(q) > 40 || Math.abs(s) > 40) return null;
    const L = 'sin(' + poly([p, q]) + ')' + DEG, Rr = 'cos(' + poly([r, s]) + ')' + DEG;
    return { text: B(L + ' = ' + Rr) + ', and both angles are between 0° and 90°. What is x?', ans: x0,
      how: [W('(' + poly([p, q]) + ') + (' + poly([r, s]) + ') = 90', 'sin of one angle = cos of the other when they add to 90°'), W(poly([p + r, q + s]) + ' = 90', 'combine'), W(term(p + r, 'x') + ' = ' + (90 - q - s), (q + s > 0 ? 'take ' + (q + s) + ' from' : 'add ' + (-(q + s)) + ' to') + ' both sides')].concat(p + r === 1 ? [] : [W('x = ' + B(x0), 'divide by ' + (p + r))]),
      steps: [st('The angles add to what?', 90), st('Combine: ' + B(poly([p + r, q + s]) + ' = 90') + '. x = ?', x0)],
      traps: TR([tr(r10((180 - q - s) / (p + r)), 'g_pairs', 'The angles are complementary: they add to 90°, not 180°.'), p !== r ? tr(r10((s - q) / (p - r)), 'r_cofunction', 'sin and cos match when the angles add to 90°, not when the angles are equal.') : null, tr(90 - q - s, 'x_onestep', 'Divide by ' + (p + r) + '.')]) };
  } },

/* ---------- G-GPE.A.1: the equation of a circle ---------- */
{ id: 'g_circleeq', s: 'meas', g: 10, title: 'The equation of a circle', paper: true, cc: ['G-GPE.A.1'], pre: ['x_complete', 'r_dist'],
  tip: 'A circle with center (h, k) and radius r is (x − h)² + (y − k)² = r². To read one like x² + y² − 6x + 8y = 11, complete the square in x and in y.',
  gen(d, R) {
    const xf = h => h === 0 ? pw('x', 2) : pw('(x ' + signed(-h) + ')', 2), yf = k => k === 0 ? pw('y', 2) : pw('(y ' + signed(-k) + ')', 2);
    if (d === 0) {
      const h = R.i(-8, 8), k = R.i(-8, 8), r = R.i(2, 12), q = R.i(0, 2), e = xf(h) + ' + ' + yf(k) + ' = ' + r * r;
      if (q === 0) return { text: 'What is the radius of the circle ' + B(e) + '?', ans: r,
        how: [W('r² = ' + r * r, 'the number on the right is r², not r'), 'r = ' + rt(r * r) + ' = ' + B(r)],
        traps: TR([tr(r * r, 'w_roots', 'The right side is r². Take the square root.'), tr(r * r / 2, 'g_circleeq', 'Take the square root of ' + r * r + ', not half of it.')]) };
      if (h === 0 || k === 0) return null;
      const askX = q === 1, ans = askX ? h : k, f = askX ? '(x ' + signed(-h) + ')' : '(y ' + signed(-k) + ')';
      return { text: 'The circle ' + B(e) + ' has center (h, k). What is ' + B(askX ? 'h' : 'k') + '?', ans,
        how: [W(f + ' is 0 when ' + (askX ? 'x' : 'y') + ' = ' + num(ans), 'the center makes each bracket 0'), (askX ? 'h' : 'k') + ' = ' + B(num(ans))],
        traps: TR([tr(-ans, 'g_circleeq', f + ' is 0 at ' + num(ans) + ': the center has the opposite sign to the number in the bracket.'), tr(askX ? k : h, 'g_circleeq', 'That is the other coordinate.')]) };
    }
    if (d === 1) {
      const h = R.i(-6, 6), k = R.i(-6, 6), dx = nz(R, -8, 8), dy = nz(R, -8, 8), p = h + dx, q = k + dy, ans = dx * dx + dy * dy;
      return { text: 'A circle has center ' + B(pt(h, k)) + ' and passes through ' + B(pt(p, q)) + '. Its equation is (x ' + MINUS + ' h)² + (y ' + MINUS + ' k)² = c. What is c (that is, r²)?', ans, vis: plotSVG([{ x: h, y: k, t: 'center' }, { x: p, y: q }], { r: Math.max(6, Math.abs(p), Math.abs(q), Math.abs(h), Math.abs(k)) + 1 }),
        how: [W('r² = (' + num(p) + M + par2(h) + ')² + (' + num(q) + M + par2(k) + ')²', 'r is the distance from the center to the point'), W('r² = ' + sq(dx) + ' + ' + sq(dy), ''), 'r² = ' + dx * dx + ' + ' + dy * dy + ' = ' + B(ans)],
        steps: [st('Across: ' + B(num(p) + M + par2(h)) + ' = ?', dx), st('Up: ' + B(num(q) + M + par2(k)) + ' = ?', dy), st('r² = ?', ans)],
        traps: TR([tr((Math.abs(dx) + Math.abs(dy)) * (Math.abs(dx) + Math.abs(dy)), 'r_dist', 'Square each difference first, then add.'), tr(Math.abs(dx) + Math.abs(dy), 'r_dist', 'Use the Pythagorean theorem: square, add, and keep r² here.'), tr((p + h) * (p + h) + (q + k) * (q + k), 'n_intsub', 'Subtract the center from the point.')]) };
    }
    const h = nz(R, -6, 6), k = nz(R, -6, 6), r = R.i(1, 10), G = r * r - h * h - k * k, q = R.i(0, 2);
    const e = pw('x', 2) + ' + ' + pw('y', 2) + ' ' + signed(-2 * h) + 'x ' + signed(-2 * k) + 'y = ' + num(G), ans = q === 0 ? r : q === 1 ? h : k;
    return { text: 'The circle ' + B(e) + ' has center (h, k) and radius r. Complete the square. What is ' + B(['r', 'h', 'k'][q]) + '?', ans,
      how: [W('(' + poly([1, -2 * h, 0]) + ') + (' + poly([1, -2 * k, 0], 'y') + ') = ' + num(G), 'group the x\'s and the y\'s'), W('(' + poly([1, -2 * h, h * h]) + ') + (' + poly([1, -2 * k, k * k], 'y') + ') = ' + num(G) + ' + ' + h * h + ' + ' + k * k, 'add half of each middle number, squared, to both sides'), W(xf(h) + ' + ' + yf(k) + ' = ' + r * r, ''), ['r = ' + rt(r * r) + ' = ', 'h = ', 'k = '][q] + B(num(ans))],
      steps: [st('Half of ' + num(-2 * h) + ', squared?', h * h), st('Half of ' + num(-2 * k) + ', squared?', k * k), st('r² = ' + B(num(G) + ' + ' + h * h + ' + ' + k * k) + ' = ?', r * r), st(['r', 'h', 'k'][q] + ' = ?', ans)],
      traps: q === 0 ? TR([tr(r * r, 'w_roots', 'That is r². Take the square root.'), tr(G > 0 && Math.sqrt(G) % 1 === 0 ? Math.sqrt(G) : G, 'g_circleeq', 'Complete the square first: the right side grows by ' + (h * h + k * k) + '.')]) : TR([tr(-ans, 'g_circleeq', '(x ' + MINUS + ' h)²: the center has the opposite sign to the number in the bracket.'), tr(q === 1 ? -2 * h : -2 * k, 'x_complete', 'Take half of the middle number.'), tr(q === 1 ? k : h, 'g_circleeq', 'That is the other coordinate.')]) };
  } },

/* ---------- G-GPE.A.2: parabola from focus and directrix ---------- */
{ id: 'g_parabola', s: 'meas', g: 10, title: 'Parabola from focus and directrix', paper: true, cc: ['G-GPE.A.2'], pre: ['x_vertex', 'r_dist'],
  tip: 'Every point on a parabola is as far from the focus as from the directrix. Focus (0, p), directrix y = −p: x² = 4py, so y = x² ÷ 4p. Focus (0, 3): y = x²/12.',
  gen(d, R) {
    if (d === 0) {
      const p = nz(R, -6, 6), ans = F(1, 4 * p);
      return { text: 'A parabola has focus ' + B(pt(0, p)) + ' and directrix ' + B('y = ' + num(-p)) + '. Its equation is y = ax². What is a? (A fraction is fine.)', ans, type: 'frac',
        how: [W(pw('x', 2) + ' + ' + pw('(y ' + signed(-p) + ')', 2) + ' = ' + pw('(y ' + signed(p) + ')', 2), 'a point (x, y): distance to the focus = distance to the line; square both'), W(pw('x', 2) + ' ' + signed(-2 * p) + 'y = ' + term(2 * p, 'y'), 'multiply out; y² and ' + p * p + ' cancel'), W(pw('x', 2) + ' = ' + term(4 * p, 'y'), ''), W('y = ' + fr(1, 4 * p) + pw('x', 2), 'divide by ' + num(4 * p)), 'a = ' + B(fq(ans))],
        steps: [st('After multiplying out: ' + B(pw('x', 2) + ' = ?y'), 4 * p), st('a = ?', ans, { type: 'frac' })],
        traps: TR([tr(F(1, 2 * p), 'g_parabola', 'The focus and directrix are each p from the vertex: x² = 4py.'), tr(F(4 * p, 1), 'g_parabola', 'Upside down: y = x² ÷ ' + num(4 * p) + '.'), tr(F(-1, 4 * p), 'g_parabola', 'The parabola opens toward the focus.')]) };
    }
    if (d === 1) {
      const h = R.i(-6, 6), k = R.i(-6, 6), p = nz(R, -5, 5), f = k + p, e = k - p, kind = R.i(0, 2);
      if (kind === 0) return { text: 'A parabola has focus ' + B(pt(h, f)) + ' and directrix ' + B('y = ' + num(e)) + '. What is the y-coordinate of its vertex?', ans: k,
        how: [W('The vertex is halfway between the focus and the directrix', 'it is the point on the parabola nearest both'), 'y = (' + num(f) + ' + ' + par2(e) + ') ÷ 2 = ' + B(num(k))],
        steps: [st(B(num(f) + ' + ' + par2(e)) + ' = ?', f + e), st('Half of it?', k)],
        traps: TR([tr(f - e, 'g_parabola', 'Halfway means the average: add and halve.'), tr(f, 'g_parabola', 'That is the focus. The vertex is halfway to the directrix.'), tr(e, 'g_parabola', 'That is the directrix.')]) };
      if (kind === 1) return { text: 'A parabola has vertex ' + B(pt(h, k)) + ' and directrix ' + B('y = ' + num(e)) + '. What is the y-coordinate of its focus?', ans: f,
        how: [W('From the directrix to the vertex: ' + num(k) + M + par2(e) + ' = ' + num(p), 'the vertex is halfway'), 'The focus is the same distance past the vertex: ' + num(k) + ' ' + signed(p) + ' = ' + B(num(f))],
        steps: [st('Directrix to vertex: ' + B(num(k) + M + par2(e)) + ' = ?', p), st('Focus y?', f)],
        traps: TR([tr(e, 'g_parabola', 'That is the directrix. The focus is on the other side of the vertex.'), tr(k - p, 'g_parabola', 'Go the same distance past the vertex, away from the directrix.')]) };
      return { text: 'A parabola has focus ' + B(pt(h, f)) + ' and directrix ' + B('y = ' + num(e)) + '. How far is the vertex from the focus?', ans: Math.abs(p),
        how: [W('focus to directrix = |' + num(f) + M + par2(e) + '| = ' + Math.abs(2 * p), ''), 'The vertex is halfway: ' + Math.abs(2 * p) + ' ÷ 2 = ' + B(Math.abs(p))],
        steps: [st('Distance from the focus to the directrix?', Math.abs(2 * p)), st('Half of it?', Math.abs(p))],
        traps: TR([tr(Math.abs(2 * p), 'g_parabola', 'That is the focus to the directrix. The vertex is halfway.'), tr(Math.abs(f + e) / 2, 'g_parabola', 'Take the difference of ' + num(f) + ' and ' + num(e) + ', then halve it.')]) };
    }
    if (R.chance(.5)) {
      const h = nz(R, -5, 5), k = R.i(-6, 6), p = nz(R, -4, 4), f = k + p, e = k - p, ans = F(1, 4 * p);
      return { text: 'A parabola has focus ' + B(pt(h, f)) + ' and directrix ' + B('y = ' + num(e)) + '. Its equation is ' + B('y = a(x ' + signed(-h) + ')² ' + signed(k)) + '. What is a? (A fraction is fine.)', ans, type: 'frac',
        how: [W('vertex = ' + pt(h, k), 'halfway between ' + num(f) + ' and ' + num(e)), W('p = ' + num(f) + M + par2(k) + ' = ' + num(p), 'vertex to focus'), W('a = ' + fl(1, '4p') + ' = ' + fl(1, num(4 * p)), 'y = x² ÷ 4p, moved to the vertex'), 'a = ' + B(fq(ans))],
        steps: [st('The vertex\'s y?', k), st('p (from the vertex up to the focus)?', p), st('a = 1 ÷ 4p = ?', ans, { type: 'frac' })],
        traps: TR([tr(F(1, 2 * p), 'g_parabola', 'The focus is p from the vertex: a = 1 ÷ 4p.'), tr(F(1, 4 * (f - e)), 'g_parabola', 'p is from the vertex to the focus, half of the focus-to-directrix distance.'), tr(F(-1, 4 * p), 'g_parabola', 'The parabola opens toward the focus.')]) };
    }
    const p = nz(R, -4, 4), c = R.i(-6, 6), ans = c + p;
    return { text: 'The parabola ' + B('y = ' + fr(1, 4 * p) + pw('x', 2) + (c ? ' ' + signed(c) : '')) + ' has its focus straight ' + (p > 0 ? 'above' : 'below') + ' the vertex. What is the y-coordinate of the focus?', ans,
      how: [W('vertex = ' + pt(0, c), 'the number added on the end'), W(fl(1, '4p') + ' = ' + fr(1, 4 * p) + ', so 4p = ' + num(4 * p) + ' and p = ' + num(p), 'a = 1 ÷ 4p'), 'focus y = ' + num(c) + ' ' + signed(p) + ' = ' + B(num(ans))],
      steps: [st('4p = ?', 4 * p), st('p = ?', p), st('Focus y = ?', ans)],
      traps: TR([tr(c + 4 * p, 'g_parabola', 'a = 1 ÷ 4p, so p is a quarter of ' + num(4 * p) + '.'), tr(c - p, 'g_parabola', 'The focus is inside the curve, on the side it opens to.'), tr(p, 'g_parabola', 'Start from the vertex at y = ' + num(c) + '.')]) };
  } },

/* ---------- G-GPE.B.7: perimeter and area from coordinates ---------- */
{ id: 'g_coordarea', s: 'meas', g: 10, title: 'Perimeter and area from coordinates', paper: true, cc: ['G-GPE.B.7'], pre: ['r_dist', 'x_coord4'],
  tip: 'Same y: length is the difference of the x\'s. Slanted sides: use the Pythagorean theorem. For a tilted triangle, draw the box around it and take away the corner triangles.',
  gen(d, R) {
    const rr = (...ps) => Math.max(6, ...ps.map(p => Math.max(Math.abs(p.x), Math.abs(p.y)))) + 1;
    if (d === 0) {
      const x1 = R.i(-6, 2), y1 = R.i(-6, 2), w = R.i(2, 8), h = R.i(2, 8), x2 = x1 + w, y2 = y1 + h, askA = R.chance(.5), ans = askA ? w * h : 2 * (w + h);
      if (x2 > 8 || y2 > 8) return null;
      const P = [{ x: x1, y: y1, t: 'A' }, { x: x2, y: y1, t: 'B' }, { x: x2, y: y2, t: 'C' }, { x: x1, y: y2, t: 'D' }];
      return { text: 'Rectangle ABCD has corners ' + P.map(p => p.t + pt(p.x, p.y)).join(', ') + '. What is its ' + (askA ? 'area' : 'perimeter') + '?', ans, vis: plotSVG(P, { r: rr(...P) }),
        how: [W('AB = ' + num(x2) + M + par2(x1) + ' = ' + w, 'same y: subtract the x\'s'), W('BC = ' + num(y2) + M + par2(y1) + ' = ' + h, 'same x: subtract the y\'s'), askA ? 'area = ' + w + ' × ' + h + ' = ' + B(ans) : 'perimeter = 2 × (' + w + ' + ' + h + ') = ' + B(ans)],
        steps: [st('Length AB?', w), st('Length BC?', h), st(askA ? 'Area?' : 'Perimeter?', ans)],
        traps: TR([tr(askA ? 2 * (w + h) : w * h, askA ? 'g_area' : 'g_perim', askA ? 'That is the perimeter. Area is length × width.' : 'That is the area. Perimeter goes all the way round.'), askA ? null : tr(w + h, 'g_perim', 'Perimeter goes all the way round: 2 × (length + width).'), tr(askA ? Math.abs(x2 + x1) * h : 2 * (Math.abs(x2 + x1) + h), 'n_intsub', 'A length is the difference of the coordinates: subtract.')]) };
    }
    if (d === 1) {
      const vert = R.chance(.4), a = R.i(-6, 0), b = a + R.i(3, 10), c0 = R.i(-5, 5), top = c0 + nz(R, -8, 8), m = R.i(-6, 6);
      if (b > 7 || Math.abs(top) > 8) return null;
      const base = b - a, hgt = Math.abs(top - c0), ans = base * hgt / 2;
      const P = vert ? [{ x: c0, y: a, t: 'A' }, { x: c0, y: b, t: 'B' }, { x: top, y: m, t: 'C' }] : [{ x: a, y: c0, t: 'A' }, { x: b, y: c0, t: 'B' }, { x: m, y: top, t: 'C' }];
      return { text: 'Triangle ABC has corners ' + P.map(p => p.t + pt(p.x, p.y)).join(', ') + '. What is its area?', ans, vis: plotSVG(P, { r: rr(...P) }),
        how: [W('base AB = ' + num(b) + M + par2(a) + ' = ' + base, 'A and B have the same ' + (vert ? 'x' : 'y')), W('height = ' + num(Math.max(top, c0)) + M + par2(Math.min(top, c0)) + ' = ' + hgt, 'from C straight across to the line ' + (vert ? 'x' : 'y') + ' = ' + num(c0)), 'area = ½ × ' + base + ' × ' + hgt + ' = ' + B(num(ans))],
        steps: [st('Base AB?', base), st('Height from C?', hgt), st('Area?', ans)],
        traps: TR([tr(base * hgt, 'g_tri', 'A triangle is half of the rectangle: ½ × base × height.'), tr(c0 !== 0 ? base * Math.abs(top) / 2 : null, 'g_coordarea', 'The height is measured from the base line ' + (vert ? 'x' : 'y') + ' = ' + num(c0) + ', not from the axis.')]) };
    }
    if (R.chance(.5)) {
      const T = R.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10]]), u = T[0], v = T[1], w = T[2], rh = R.chance(.4) && u <= 4;
      if (rh) {
        const cx = R.i(-2, 2), cy = R.i(-2, 2), P = [{ x: cx - u, y: cy, t: 'A' }, { x: cx, y: cy - v, t: 'B' }, { x: cx + u, y: cy, t: 'C' }, { x: cx, y: cy + v, t: 'D' }];
        return { text: 'ABCD has corners ' + P.map(p => p.t + pt(p.x, p.y)).join(', ') + '. What is its perimeter?', ans: 4 * w, vis: plotSVG(P, { r: rr(...P) }),
          how: [W('AB: across ' + u + ', down ' + v, 'from A to B'), W('AB = ' + rt(sq(u) + ' + ' + sq(v)) + ' = ' + rt(u * u + v * v) + ' = ' + w, 'Pythagorean theorem'), W('All four sides are the same', 'it is a rhombus'), 'perimeter = 4 × ' + w + ' = ' + B(4 * w)],
          steps: [st('Length AB?', w), st('Perimeter?', 4 * w)],
          traps: TR([tr(4 * (u + v), 'r_dist', 'A slanted side is not across + up. Use the Pythagorean theorem.'), tr(2 * (2 * u + 2 * v), 'r_dist', 'Measure the sides, not the diagonals.'), tr(w, 'g_perim', 'Add all four sides.')]) };
      }
      const x0 = R.i(-6, 6 - 2 * u), y0 = R.i(-6, 6 - v), up = R.chance(.5) ? 1 : -1, yy = up > 0 ? y0 : y0 + v;
      if (x0 + 2 * u > 10) return null;
      const P = [{ x: x0, y: yy, t: 'A' }, { x: x0 + 2 * u, y: yy, t: 'B' }, { x: x0 + u, y: yy + up * v, t: 'C' }];
      return { text: 'Triangle ABC has corners ' + P.map(p => p.t + pt(p.x, p.y)).join(', ') + '. What is its perimeter?', ans: 2 * u + 2 * w, vis: plotSVG(P, { r: rr(...P) }),
        how: [W('AB = ' + num(x0 + 2 * u) + M + par2(x0) + ' = ' + 2 * u, 'same y'), W('AC: across ' + u + ', ' + (up > 0 ? 'up ' : 'down ') + v + ', so AC = ' + rt(sq(u) + ' + ' + sq(v)) + ' = ' + w, 'Pythagorean theorem'), W('BC = ' + w, 'the same moves the other way'), 'perimeter = ' + 2 * u + ' + ' + w + ' + ' + w + ' = ' + B(2 * u + 2 * w)],
        steps: [st('Length AB?', 2 * u), st('Length AC?', w), st('Perimeter?', 2 * u + 2 * w)],
        traps: TR([tr(2 * u + 2 * (u + v), 'r_dist', 'A slanted side is not across + up. Use the Pythagorean theorem.'), tr(2 * u + w, 'g_perim', 'AC and BC are both slanted. Add all three sides.'), tr(u * v, 'g_tri', 'That is the area.')]) };
    }
    const Wd = R.i(3, 8), H = R.i(3, 8), a = R.i(1, H - 1), b = R.i(1, Wd - 1), x0 = R.i(-6, 6 - Wd), y0 = R.i(-6, 6 - H), sx = R.chance(.5) ? 1 : -1, sy = R.chance(.5) ? 1 : -1;
    const tf = (dx, dy) => ({ x: sx > 0 ? x0 + dx : x0 + Wd - dx, y: sy > 0 ? y0 + dy : y0 + H - dy });
    const P = [Object.assign(tf(0, 0), { t: 'A' }), Object.assign(tf(Wd, a), { t: 'B' }), Object.assign(tf(b, H), { t: 'C' })];
    const t1 = Wd * a / 2, t2 = (Wd - b) * (H - a) / 2, t3 = b * H / 2, cut = t1 + t2 + t3, ans = Wd * H - cut;
    return { text: 'Triangle ABC has corners ' + P.map(p => p.t + pt(p.x, p.y)).join(', ') + '. What is its area?', ans, vis: plotSVG(P, { r: rr(...P) }),
      how: [W('box: ' + Wd + ' wide, ' + H + ' tall, area ' + Wd * H, 'the smallest rectangle around the triangle'), W('corners: ½ × ' + Wd + ' × ' + a + ' + ½ × ' + (Wd - b) + ' × ' + (H - a) + ' + ½ × ' + b + ' × ' + H + ' = ' + num(t1) + ' + ' + num(t2) + ' + ' + num(t3), 'the three right triangles outside ABC'), W('= ' + num(cut), ''), 'area = ' + Wd * H + M + num(cut) + ' = ' + B(num(ans))],
      steps: [st('Area of the box?', Wd * H), st('Total of the three corner triangles?', cut), st('Area of ABC?', ans)],
      traps: TR([tr(Wd * H, 'g_coordarea', 'Take away the three right triangles outside ABC.'), tr(Wd * H / 2, 'g_tri', 'The triangle is not half the box here: take away the corner triangles.'), tr(Wd * H - 2 * cut, 'g_tri', 'Each corner triangle is half of its rectangle.')]) };
  } },

/* ---------- G-MG.A.2: density ---------- */
{ id: 'g_density', s: 'meas', g: 10, title: 'Density: how much per unit', cc: ['G-MG.A.2'], pre: ['f_rate'],
  tip: 'Density = amount ÷ area (or volume). A 6 km by 4 km town with 4,800 people: 4,800 ÷ 24 = 200 people per km². A 2 cm cube of 72 g: 72 ÷ 8 = 9 g per cm³.',
  gen(d, R) {
    if (d === 0) {
      const l = R.i(2, 12), w = R.i(2, 9), D = 10 * R.i(5, 90), P = l * w * D, ctx = R.pick([['A town', 'people'], ['A forest', 'trees'], ['A field', 'sunflowers']]);
      return { text: ctx[0] + ' is a rectangle ' + l + ' km by ' + w + ' km with ' + num(P) + ' ' + ctx[1] + '. How many ' + ctx[1] + ' per square kilometer?', ans: D,
        how: [W('area = ' + l + ' × ' + w + ' = ' + l * w + ' km²', ''), W('density = ' + num(P) + ' ÷ ' + l * w + ' = ' + B(num(D)), ctx[1] + ' per km²')],
        steps: [st('Area in km²?', l * w), st('Per km²?', D)],
        traps: TR([tr(r10(P / (l + w)), 'g_area', 'Area is length × width, not length + width.'), tr(r10(P / (2 * (l + w))), 'g_perim', 'Divide by the area, not the perimeter.'), tr(P * l * w, 'g_density', 'Density is amount ÷ area.')]) };
    }
    if (d === 1) {
      const D = R.pick([2, 3, 7, 8, 9, 11, 19]), cube = R.chance(.5);
      const [a, b, c] = cube ? (s => [s, s, s])(R.i(2, 6)) : [R.i(2, 8), R.i(2, 6), R.i(2, 5)], V = a * b * c, m = V * D;
      return { text: 'A metal ' + (cube ? 'cube with ' + a + ' cm sides' : 'block ' + a + ' cm by ' + b + ' cm by ' + c + ' cm') + ' has a mass of ' + num(m) + ' g. What is its density in grams per cm³?', ans: D,
        how: [W('volume = ' + a + ' × ' + b + ' × ' + c + ' = ' + V + ' cm³', ''), W('density = ' + num(m) + ' ÷ ' + V + ' = ' + B(D), 'g per cm³')],
        steps: [st('Volume in cm³?', V), st('Grams per cm³?', D)],
        traps: TR([cube ? tr(r10(m / (a * a)), 'g_volume', 'Volume is side × side × side.') : tr(r10(m / (a * b)), 'g_volume', 'Volume is length × width × height.'), cube ? tr(r10(m / (3 * a)), 'w_exp', a + '³ means ' + a + ' × ' + a + ' × ' + a + ', not 3 × ' + a + '.') : tr(r10(m / (a + b + c)), 'g_volume', 'Multiply the three lengths.'), tr(m * V, 'g_density', 'Density is mass ÷ volume.')]) };
    }
    if (R.chance(.5)) {
      const D = R.pick([2, 3, 5, 7, 8, 9, 11]), s = R.i(2, 6), m = D * s * s * s;
      return { text: 'A cube of metal with density ' + D + ' g per cm³ has a mass of ' + num(m) + ' g. How long is each side?', ans: s, unit: 'cm',
        how: [W('volume = ' + num(m) + ' ÷ ' + D + ' = ' + s * s * s + ' cm³', 'mass ÷ density'), W('side = ' + rt(s * s * s, 3) + ' = ' + B(s), s + ' × ' + s + ' × ' + s + ' = ' + s * s * s)],
        steps: [st('Volume in cm³?', s * s * s), st('Side length?', s)],
        traps: TR([tr(s * s * s, 'w_roots', 'That is the volume. Take the cube root for the side.'), tr(r10(m * D), 'g_density', 'Mass ÷ density gives the volume.'), tr(r10(s * s * s / 3), 'w_roots', 'A cube root is not dividing by 3.')]) };
    }
    const l = R.pick([1.5, 2, 2.5, 3, 4, 5]), w = R.pick([2, 3, 4, 6]), D = 10 * R.i(4, 60), ans = r10(l * w * D), ctx = R.pick([['A park', 'trees'], ['A farm', 'apple trees'], ['A lake', 'ducks']]);
    return { text: ctx[0] + ' is ' + num(l) + ' km by ' + w + ' km and has about ' + D + ' ' + ctx[1] + ' per square kilometer. About how many ' + ctx[1] + ' is that?', ans,
      how: [W('area = ' + num(l) + ' × ' + w + ' = ' + num(l * w) + ' km²', ''), W(num(l * w) + ' × ' + D + ' = ' + B(num(ans)), 'density × area')],
      steps: [st('Area in km²?', r10(l * w)), st('Total?', ans)],
      traps: TR([tr(r10(D * (l + w)), 'g_area', 'Area is length × width.'), tr(r10(D / (l * w)), 'g_density', 'Density × area gives the total.'), tr(D, 'g_density', 'That is for one km². Times by the area.')]) };
  } },

/* ---------- S-ID.A.3: outliers move the mean, not the median ---------- */
{ id: 'd_outlier', s: 'data', g: 9, title: 'Outliers move the mean, not the median', paper: true, cc: ['S-ID.A.3'], pre: ['m_divbig'],
  tip: 'One far-off value drags the mean toward it but barely moves the median. 12, 14, 15, 15, 16, 70: mean 23.7, median 15. Without 70: mean 14.4, median 15.',
  gen(d, R) {
    const n = d === 2 ? R.i(4, 6) : 5, c = R.i(8, 40), base = []; let v = c;
    for (let i = 0; i < n; i++) { base.push(v); v += R.i(0, 3); }
    const S = base.reduce((a, b) => a + b, 0); if (S % n) return null;
    let O = base[n - 1] + R.i(30, 80); O += ((n + 1) - (S + O) % (n + 1)) % (n + 1);
    const all = base.concat([O]), m0 = S / n, m1 = (S + O) / (n + 1);
    const med = a => { const s = a.slice().sort((x, y) => x - y), k = s.length; return k % 2 ? s[(k - 1) / 2] : (s[k / 2 - 1] + s[k / 2]) / 2; };
    const show = d === 2 ? R.shuffle(all) : all, list = B(show.join(', '));
    const midRaw = a => a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
    if (d === 0) {
      const askAll = R.chance(.5), ans = askAll ? m1 : m0;
      return { text: 'Data: ' + list + '. ' + (askAll ? 'What is the mean of all ' + (n + 1) + ' values?' : O + ' is an outlier. What is the mean of the other ' + n + ' values?'), ans,
        how: askAll ? [W('sum = ' + num(S + O), 'add them all'), W(num(S + O) + ' ÷ ' + (n + 1) + ' = ' + B(num(m1)), 'mean = sum ÷ how many')] : [W('sum = ' + num(S), 'leave out ' + O), W(num(S) + ' ÷ ' + n + ' = ' + B(num(m0)), 'mean = sum ÷ how many')],
        steps: [st('The sum?', askAll ? S + O : S), st('The mean?', ans)],
        traps: TR([tr(askAll ? m0 : m1, 'd_outlier', askAll ? 'Include ' + O + ' too.' : 'Leave ' + O + ' out.'), tr(askAll ? r10((S + O) / n) : r10(S / (n + 1)), 'd_mean', 'Divide by how many values you added.'), tr(med(askAll ? all : base), 'd_median', 'That is the median. The mean is sum ÷ how many.')]) };
    }
    if (d === 1) {
      const ans = r10(m1 - m0);
      return { text: 'Data: ' + list + '. How much does the mean drop when the outlier ' + O + ' is taken out?', ans,
        how: [W('with ' + O + ': ' + num(S + O) + ' ÷ ' + (n + 1) + ' = ' + num(m1), 'mean of all ' + (n + 1)), W('without: ' + num(S) + ' ÷ ' + n + ' = ' + num(m0), 'mean of the other ' + n), num(m1) + M + num(m0) + ' = ' + B(num(ans))],
        steps: [st('Mean with ' + O + '?', m1), st('Mean without it?', m0), st('Drop?', ans)],
        traps: TR([tr(r10(O / (n + 1)), 'd_outlier', 'Work out both means, then take one from the other.'), tr(med(all) - med(base), 'd_outlier', 'That is the change in the median. The question asks about the mean.'), tr(r10(O - m0), 'd_outlier', 'Compare the two means, not the outlier itself.')]) };
    }
    const sorted = all.slice().sort((x, y) => x - y), md1 = med(all), md0 = med(base);
    if (R.chance(.5)) {
      const ans = r10(m1 - md1);
      return { text: 'Data: ' + list + '. How much bigger is the mean than the median?', ans,
        how: [W('sorted: ' + sorted.join(', '), 'order them for the median'), W('median = ' + num(md1), (n + 1) % 2 ? 'the middle value' : 'the average of the middle two'), W('mean = ' + num(S + O) + ' ÷ ' + (n + 1) + ' = ' + num(m1), ''), num(m1) + M + num(md1) + ' = ' + B(num(ans)) + ': the outlier pulls the mean up'],
        steps: [st('The median?', md1), st('The mean?', m1), st('Mean ' + MINUS + ' median?', ans)],
        traps: TR([tr(r10(m0 - md1), 'd_outlier', 'Include the outlier ' + O + ' in the mean.'), tr(r10(m1 - midRaw(show)), 'd_median', 'Sort the values before finding the middle.'), tr(r10(m1 - md0), 'd_median', 'The median of all ' + (n + 1) + ' values includes ' + O + ' in the count.')]) };
    }
    const ans = r10(md1 - md0);
    return { text: 'Data: ' + list + '. By how much does the median change when the outlier ' + O + ' is taken out? (Type 0 if it doesn\'t change.)', ans,
      how: [W('sorted: ' + sorted.join(', '), ''), W('median with ' + O + ' = ' + num(md1), (n + 1) % 2 ? 'the middle value' : 'the average of the middle two'), W('median without = ' + num(md0), n % 2 ? 'the middle value' : 'the average of the middle two'), 'change = ' + num(md1) + M + num(md0) + ' = ' + B(num(ans)) + ': the median hardly moves'],
      steps: [st('Median with ' + O + '?', md1), st('Median without?', md0), st('Change?', ans)],
      traps: TR([tr(r10(m1 - m0), 'd_outlier', 'That is the change in the mean. The median barely moves.'), tr(r10(midRaw(show) - md0), 'd_median', 'Sort the values first, then find the middle.')]) };
  } },

/* ---------- S-ID.B.6a: predict with a fitted function ---------- */
{ id: 'd_predict', s: 'data', g: 9, title: 'Predict with a fitted function', cc: ['S-ID.B.6a'], pre: ['x_linear', 'w_exp'],
  tip: 'A fitted line or curve is a formula: put the x in to predict y. ŷ = 2.4x + 15 at x = 20: 2.4 × 20 + 15 = 63. To find the x for a given ŷ, solve.',
  gen(d, R) {
    const ctx = R.pick([['hours of practice', 'test score'], ['weeks', 'plant height (cm)'], ['ads run', 'sales'], ['minutes', 'temperature (°C)']]);
    if (d === 0) {
      const m = R.pick([1.5, 2.4, 0.8, 3.2, 1.25, 4.5, 2, 6, 0.5]), b = R.i(2, 40), x = R.i(4, 40), ans = r10(m * x + b);
      return { text: 'For x = ' + ctx[0] + ' and y = ' + ctx[1] + ', the best-fit line is ' + B('ŷ = ' + num(m) + 'x + ' + b) + '. What does it predict at ' + B('x = ' + x) + '?', ans,
        how: [W('ŷ = ' + num(m) + ' × ' + x + ' + ' + b, 'put x = ' + x + ' into the line'), '= ' + num(r10(m * x)) + ' + ' + b + ' = ' + B(num(ans))],
        steps: [st(B(num(m) + ' × ' + x) + ' = ?', r10(m * x)), st('ŷ = ?', ans)],
        traps: TR([tr(r10(m * x), 'x_eval', 'Add the ' + b + ' too.'), tr(r10(m * (x + b)), 'x_order', 'Multiply first, then add ' + b + '.'), tr(r10(m + x + b), 'x_eval', num(m) + 'x means ' + num(m) + ' times x.')]) };
    }
    if (d === 1) {
      const base = R.pick([2, 3, 1.5]), x = base === 1.5 ? R.i(2, 3) : R.i(2, base === 2 ? 6 : 4), a = base === 1.5 ? 8 * R.i(1, 4) : R.i(2, 10), pv = Math.pow(base, x), ans = r10(a * pv);
      return { text: 'An exponential model fitted to some data is ' + B('y = ' + a + ' × ' + pw(num(base), 'x')) + '. What does it predict at ' + B('x = ' + x) + '?', ans,
        how: [W('y = ' + a + ' × ' + pw(num(base), x), 'put x = ' + x + ' in'), W('= ' + a + ' × ' + num(pv), pw(num(base), x) + ' = ' + num(pv)), '= ' + B(num(ans))],
        steps: [st(B(pw(num(base), x)) + ' = ?', pv), st('y = ?', ans)],
        traps: TR([tr(r10(Math.pow(a * base, x)), 'x_order', 'The power is on ' + num(base) + ' only: work out ' + pw(num(base), x) + ' first.'), tr(r10(a * base * x), 'w_exp', pw(num(base), x) + ' means ' + num(base) + ' multiplied ' + x + ' times.'), tr(r10(a * Math.pow(base, x - 1)), 'w_exp', 'Count the factors: ' + x + ' of them.')]) };
    }
    const m = R.pick([1.5, 2.5, 0.5, 4, 3, 1.2, 0.8]), b = R.i(5, 40), x0 = R.i(3, 30) * (m === 1.2 || m === 0.8 ? 5 : 2), k = r10(m * x0 + b);
    return { text: 'For x = ' + ctx[0] + ' and y = ' + ctx[1] + ', the best-fit line is ' + B('ŷ = ' + num(m) + 'x + ' + b) + '. For what x does it predict ' + B('ŷ = ' + num(k)) + '?', ans: x0,
      how: [W(num(m) + 'x + ' + b + ' = ' + num(k), 'set the line equal to ' + num(k)), W(num(m) + 'x = ' + num(r10(k - b)), 'take ' + b + ' from both sides'), W('x = ' + num(r10(k - b)) + ' ÷ ' + num(m) + ' = ' + B(num(x0)), '')],
      steps: [st(B(num(k) + M + b) + ' = ?', r10(k - b)), st('x = ?', x0)],
      traps: TR([tr(r10(m * k + b), 'd_predict', 'That predicts y at x = ' + num(k) + '. Here y is known; solve for x.'), tr(r10((k + b) / m), 'n_intsub', 'Take the ' + b + ' away, don\'t add it.'), tr(r10(k / m - b), 'x_twostep', 'Undo the + ' + b + ' first, then divide.')]) };
  } },

/* ---------- S-ID.B.6b: residuals ---------- */
{ id: 'd_residual', s: 'data', g: 9, title: 'Residual: actual minus predicted', cc: ['S-ID.B.6b'], pre: ['x_linear', 'n_intsub'],
  tip: 'Residual = actual y − predicted y. Line ŷ = 3x + 8, point (4, 21): ŷ = 20, residual 21 − 20 = 1. Positive: the point is above the line; negative: below.',
  gen(d, R) {
    if (d < 2) {
      const m = d === 0 ? nz(R, -5, 6) : R.pick([0.5, 1.5, 2.5, 1.2, 0.8, -1.5, -0.5]), b = R.i(-10, 20), x = R.i(1, 12), rr = d === 0 ? nz(R, -6, 6) : r10(nz(R, -9, 9) / 2);
      const yh = r10(m * x + b), y = r10(yh + rr);
      return { text: 'A fitted line is ' + B('ŷ = ' + poly([m, b])) + '. What is the residual for the data point ' + B(pt(x, y)) + '?', ans: rr,
        how: [W('ŷ = ' + num(m) + ' × ' + x + ' ' + signed(b) + ' = ' + num(yh), 'the predicted y at x = ' + x), W('residual = ' + num(y) + M + par2(yh) + ' = ' + B(num(rr)), 'actual ' + MINUS + ' predicted'), rr > 0 ? 'Positive: the point is above the line.' : 'Negative: the point is below the line.'],
        steps: [st('Predicted ŷ at x = ' + x + '?', yh), st('Actual ' + MINUS + ' predicted?', rr)],
        traps: TR([tr(-rr, 'd_residual', 'Residual is actual ' + MINUS + ' predicted, in that order.'), tr(yh, 'd_predict', 'That is the predicted y. Take it from the actual y.'), tr(r10(y - m * x), 'x_eval', 'Work out the whole prediction, ' + signed(b) + ' too.')]) };
    }
    if (R.chance(.5)) {
      const m = R.pick([2, 3, 4, 1.5, 2.5]), b = R.i(-5, 15), x = R.i(2, 12), rr = r10(nz(R, -12, 12) / 2), yh = r10(m * x + b), y = r10(yh + rr);
      return { text: 'A fitted line is ' + B('ŷ = ' + poly([m, b])) + '. At x = ' + x + ' the residual is ' + B(num(rr)) + '. What was the actual y?', ans: y,
        how: [W('ŷ = ' + num(m) + ' × ' + x + ' ' + signed(b) + ' = ' + num(yh), 'predicted'), W('actual = predicted + residual = ' + num(yh) + ' ' + signed(rr) + ' = ' + B(num(y)), 'residual = actual ' + MINUS + ' predicted')],
        steps: [st('Predicted ŷ at x = ' + x + '?', yh), st('Actual y?', y)],
        traps: TR([tr(r10(yh - rr), 'd_residual', 'Residual = actual ' + MINUS + ' predicted, so actual = predicted + residual.'), tr(yh, 'd_residual', 'Add the residual to the prediction.'), tr(rr, 'd_residual', 'The residual is the gap, not the y-value.')]) };
    }
    const m = R.pick([2, 3, -2, 1.5]), b = R.i(0, 15), xs = R.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3).sort((p, q) => p - q), rs = xs.map(() => nz(R, -5, 5)), ys = xs.map((x, i) => r10(m * x + b + rs[i])), tot = rs.reduce((p, q) => p + q, 0);
    return { text: 'A fitted line is ' + B('ŷ = ' + poly([m, b])) + '. What is the sum of the residuals for the points ' + xs.map((x, i) => B(pt(x, ys[i]))).join(', ') + '?', ans: tot,
      how: [W('predicted: ' + xs.map(x => num(r10(m * x + b))).join(', '), 'put each x into the line'), W('residuals: ' + xs.map((x, i) => num(ys[i]) + M + par2(r10(m * x + b)) + ' = ' + num(rs[i])).join('; '), 'actual ' + MINUS + ' predicted'), 'sum = ' + rs.map((v, i) => i ? signed(v) : num(v)).join(' ') + ' = ' + B(num(tot))],
      steps: [st('Residual at x = ' + xs[0] + '?', rs[0]), st('Residual at x = ' + xs[1] + '?', rs[1]), st('Residual at x = ' + xs[2] + '?', rs[2]), st('Sum?', tot)],
      traps: TR([tr(-tot, 'd_residual', 'Residual is actual ' + MINUS + ' predicted, in that order.'), tr(rs.reduce((p, q) => p + Math.abs(q), 0), 'n_intadd', 'Keep the signs: points below the line have negative residuals.')]) };
  } },

/* ---------- S-ID.C.7: slope and intercept of a data model ---------- */
{ id: 'd_slopemean', s: 'data', g: 9, title: 'Slope and intercept of a data model', cc: ['S-ID.C.7'], pre: ['x_slope', 'x_intercept'],
  tip: 'In a model ŷ = mx + b, the slope m is the change in y for each 1 in x (with units), and b is the value when x = 0. ŷ = 1.5w + 4: grows 1.5 cm a week, 4 cm tall at the start.',
  gen(d, R) {
    const C = [['plant height (cm)', 'week', 'weeks', [0.5, 1.5, 2, 2.5, 3], [2, 4, 5, 8, 10]], ['savings ($)', 'week', 'weeks', [5, 12, 15, 20, 25], [20, 40, 50, 100]], ['temperature (°C)', 'hour', 'hours', [-2, -1.5, -3, 2, 1.5], [10, 18, 24, 30]], ['phone battery (%)', 'hour', 'hours', [-8, -5, -10, -12.5, -4], [80, 90, 100]]];
    const c = R.pick(C);
    if (d === 0) {
      const m = R.pick(c[3]), b = R.pick(c[4]), k = R.i(2, 8), over = R.chance(.65), ans = over ? r10(m * k) : b;
      return { text: 'A model for ' + c[0] + ' after x ' + c[2] + ' is ' + B('ŷ = ' + poly([m, b])) + '. ' + (over ? 'By how much does the model say it changes in ' + k + ' ' + c[2] + '? (A drop is negative.)' : 'What does the model give at the start (x = 0)?'), ans,
        how: [num(m) + ' is the change for each ' + c[1] + ' (the slope); ' + num(b) + ' is the value at x = 0 (the intercept).', over ? k + ' ' + c[2] + ': ' + num(m) + ' × ' + k + ' = ' + B(num(ans)) + '.' : 'At the start: ' + B(num(b)) + '.'],
        traps: over ? TR([tr(r10(m * k + b), 'd_slopemean', 'That is the value after ' + k + ' ' + c[2] + '. The change is slope × ' + k + '.'), tr(m, 'd_slopemean', num(m) + ' is the change for one ' + c[1] + '.'), tr(r10(-m * k), 'n_intmul', 'Keep the sign of the slope.')]) : TR([tr(m, 'd_slopemean', 'That is the change per ' + c[1] + '. The start is the intercept.'), tr(r10(m + b), 'd_slopemean', 'At x = 0 the slope part is 0.')]) };
    }
    if (d === 1) {
      const m = R.pick(c[3]), b = R.pick(c[4]), x1 = R.i(1, 4), x2 = x1 + R.i(2, 6), y1 = r10(m * x1 + b), y2 = r10(m * x2 + b), askM = R.chance(.55);
      if (c[0].indexOf('temperature') < 0 && (y1 < 0 || y2 < 0)) return null;
      return { text: 'A straight-line model for ' + c[0] + ' predicts ' + B(num(y1)) + ' at ' + x1 + ' ' + (x1 === 1 ? c[1] : c[2]) + ' and ' + B(num(y2)) + ' at ' + x2 + ' ' + c[2] + '. ' + (askM ? 'What is the slope (change per ' + c[1] + ')?' : 'What is the intercept (the value at x = 0)?'), ans: askM ? m : b,
        how: [W('slope = ' + fl(num(y2) + M + par2(y1), x2 + M + x1) + ' = ' + fl(num(r10(y2 - y1)), x2 - x1) + ' = ' + num(m), 'change in y over change in x')].concat(askM ? ['It changes ' + B(num(m)) + ' each ' + c[1] + '.'] : [W('b = ' + num(y1) + M + par2(m) + ' × ' + x1 + ' = ' + B(num(b)), 'go back ' + x1 + ' ' + (x1 === 1 ? c[1] : c[2]) + ' to x = 0')]),
        steps: askM ? [st('Change in y?', r10(y2 - y1)), st('Change in x?', x2 - x1), st('Slope?', m)] : [st('Slope?', m), st('Intercept?', b)],
        traps: askM ? TR([tr(r10(y2 - y1), 'x_slope', 'Divide by the change in x (' + (x2 - x1) + ').'), tr(r10((x2 - x1) / (y2 - y1)), 'x_slope', 'Upside down: change in y over change in x.'), tr(r10(y2 / x2), 'x_slope', 'The line does not go through 0; use the change between the two points.')]) : TR([tr(y1, 'd_slopemean', 'That is the value at x = ' + x1 + '. Go back to x = 0.'), tr(r10(y1 + m * x1), 'd_slopemean', 'Going back to x = 0 undoes the slope: take away ' + num(m) + ' × ' + x1 + '.'), tr(m, 'd_slopemean', 'That is the slope.')]) };
    }
    const D = R.pick([['phone battery (%)', 'hours', [100, 80, 90], [-8, -5, -10, -12.5, -4, -2.5]], ['water in a tank (L)', 'minutes', [60, 80, 120, 150], [-2.5, -4, -5, -6, -7.5]], ['candle height (cm)', 'hours', [20, 24, 30], [-1.5, -2, -2.5, -3]]]);
    const b = R.pick(D[2]), m = R.pick(D[3]), ans = r10(-b / m);
    if (!isInt(ans * 2)) return null;
    return { text: 'A model for ' + D[0] + ' after x ' + D[1] + ' is ' + B('ŷ = ' + num(b) + M + num(-m) + 'x') + '. When does the model say it reaches 0?', ans, unit: D[1],
      how: [W(num(b) + M + num(-m) + 'x = 0', 'reaching 0 is the x-intercept'), W(num(-m) + 'x = ' + num(b), ''), W('x = ' + num(b) + ' ÷ ' + num(-m) + ' = ' + B(num(ans)), 'start ÷ amount lost each ' + D[1].replace(/s$/, ''))],
      steps: [st('Solve ' + B(num(-m) + 'x = ' + num(b)) + '. x = ?', ans)],
      traps: TR([tr(b, 'd_slopemean', 'That is the start, the y-intercept. The question asks when y = 0.'), tr(r10(b * -m), 'x_onestep', 'Divide the start by the loss each ' + D[1].replace(/s$/, '') + '.'), tr(r10(b + m), 'd_slopemean', 'That is the value after 1 ' + D[1].replace(/s$/, '') + '.')]) };
  } },

/* ---------- S-CP.A.2: test for independence ---------- */
{ id: 'd_testindep', s: 'data', g: 10, title: 'Test for independence', cc: ['S-CP.A.2'], pre: ['f_decmul'],
  tip: 'A and B are independent exactly when P(A and B) = P(A) × P(B). P(A) = 0.3 and P(B) = 0.4: independent means P(A and B) = 0.12.',
  gen(d, R) {
    if (d === 0) {
      const a = R.i(1, 9), b = R.i(1, 9), pa = a / 10, pb = b / 10, ans = r10(pa * pb);
      return { text: 'A and B are independent, ' + B('P(A) = ' + num(pa)) + ' and ' + B('P(B) = ' + num(pb)) + '. What is P(A and B)?', ans,
        how: ['Independent means P(A and B) = P(A) × P(B).', num(pa) + ' × ' + num(pb) + ' = ' + B(num(ans))],
        traps: TR([tr(r10(pa + pb), 'd_or', 'Adding is for "or". "And" for independent events multiplies.'), tr(a * b / 10, 'f_decmul', 'Count the decimal places: tenths × tenths gives hundredths.'), tr(r10(pa + pb - pa * pb), 'd_or', 'That is P(A or B). The question asks for "and".')]) };
    }
    if (d === 1) {
      const a = R.i(2, 8), b = R.i(1, 9), pa = a / 10, pb = b / 10, pab = r10(pa * pb), askB = R.chance(.6);
      return { text: B((askB ? 'P(A) = ' : 'P(B) = ') + num(askB ? pa : pb)) + ' and ' + B('P(A and B) = ' + num(pab)) + '. What must ' + (askB ? 'P(B)' : 'P(A)') + ' be for A and B to be independent?', ans: askB ? pb : pa,
        how: [W('P(A) × P(B) = P(A and B)', 'the test for independence'), W(num(askB ? pa : pb) + ' × ? = ' + num(pab), ''), '? = ' + num(pab) + ' ÷ ' + num(askB ? pa : pb) + ' = ' + B(num(askB ? pb : pa))],
        steps: [st('Solve ' + B(num(askB ? pa : pb) + ' × ? = ' + num(pab)) + '.', askB ? pb : pa)],
        traps: TR([tr(r10(pab * (askB ? pa : pb)), 'd_testindep', 'Divide P(A and B) by the probability you know.'), tr(r10(pab - (askB ? pa : pb)), 'd_testindep', 'Independent means multiply, so undo it by dividing.'), tr(r10((askB ? pa : pb) / pab), 'd_testindep', 'Upside down: ' + num(pab) + ' ÷ ' + num(askB ? pa : pb) + '.')]) };
    }
    const N = R.pick([50, 100, 200, 400, 500]), pa = R.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8]), pb = R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6]), nA = r10(N * pa), nB = r10(N * pb), ans = r10(nA * nB / N);
    if (!isInt(nA) || !isInt(nB) || !isInt(ans)) return null;
    const ctx = R.pick([['students', 'play a sport', 'are in the band'], ['shoppers', 'bought bread', 'bought milk'], ['people', 'wear glasses', 'are left-handed']]);
    return { text: 'Of ' + N + ' ' + ctx[0] + ', ' + nA + ' ' + ctx[1] + ' and ' + nB + ' ' + ctx[2] + '. How many would have to do both for the two to be independent?', ans,
      how: [W('P(A) = ' + nA + ' ÷ ' + N + ' = ' + num(pa) + ', P(B) = ' + nB + ' ÷ ' + N + ' = ' + num(pb), ''), W('P(A and B) = ' + num(pa) + ' × ' + num(pb) + ' = ' + num(r10(pa * pb)), 'independent: multiply'), W(num(r10(pa * pb)) + ' × ' + N + ' = ' + B(ans), 'turn the probability back into a count')],
      steps: [st('P(A) = ?', pa), st('P(B) = ?', pb), st('P(A) × P(B) = ?', r10(pa * pb)), st('How many of ' + N + '?', ans)],
      traps: TR([tr(r10(pa * pb), 'd_testindep', 'That is a probability. Times by ' + N + ' to get how many.'), tr(nA + nB - N > 0 ? nA + nB - N : null, 'd_or', 'That is the smallest overlap possible, not the independent one.'), tr(nA * nB, 'd_testindep', 'Divide by ' + N + ': P(A) × P(B) × ' + N + ' = ' + nA + ' × ' + nB + ' ÷ ' + N + '.')]) };
  } },

/* ---------- S-CP.A.3: conditional probability from the formula ---------- */
{ id: 'd_condformula', s: 'data', g: 10, title: 'P(A given B) = P(A and B) ÷ P(B)', cc: ['S-CP.A.3'], pre: ['f_divdec'],
  tip: 'Given B, only the B part counts, so divide by P(B): P(A given B) = P(A and B) ÷ P(B). 0.12 ÷ 0.4 = 0.3. Turned round: P(A and B) = P(B) × P(A given B).',
  gen(d, R) {
    const P = [0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8], Q = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9];
    const pf = v => F(Math.round(v * 10000), 10000);
    if (d === 0) {
      const pb = R.pick(P), q = R.pick(Q), pab = r10(pb * q), pa = r10(Math.min(0.95, pab + R.pick([0.1, 0.2, 0.3]))), ans = pf(q), showA = R.chance(.4);
      return { text: B('P(A and B) = ' + num(pab)) + (showA ? ', ' + B('P(A) = ' + num(pa)) : '') + ' and ' + B('P(B) = ' + num(pb)) + '. What is P(A given B)? (A fraction or a decimal.)', ans, type: 'frac',
        how: [W('P(A given B) = ' + fl('P(A and B)', 'P(B)'), 'only the B part counts'), '= ' + num(pab) + ' ÷ ' + num(pb) + ' = ' + B(num(q))],
        steps: [st(B(num(pab) + ' ÷ ' + num(pb)) + ' = ?', ans, { type: 'frac' })],
        traps: TR([tr(pf(pab), 'd_condformula', 'Divide by P(B): given B means only the B part counts.'), showA ? tr(pf(r10(pab / pa)), 'd_condformula', 'Given B: divide by P(B), not P(A).') : null, tr(pf(r10(pab * pb)), 'd_condformula', 'Divide, don\'t multiply.'), tr(pf(r10(pb / pab)) && pb / pab <= 1 ? pf(r10(pb / pab)) : null, 'd_condformula', 'Upside down: P(A and B) goes on top.')]) };
    }
    if (d === 1) {
      const pb = R.pick(P), q = R.pick(Q), ans = pf(r10(pb * q)), ctx = R.chance(.5);
      return { text: ctx ? B('P(B) = ' + num(pb)) + ' and ' + B('P(A given B) = ' + num(q)) + '. What is P(A and B)? (A fraction or a decimal.)' : num(pb * 100) + '% of a class walk to school, and ' + num(q * 100) + '% of the walkers bring a water bottle. What is the probability that a student walks and brings a bottle? (A fraction or a decimal.)', ans, type: 'frac',
        how: [W('P(A and B) = P(B) × P(A given B)', 'turn the formula round'), '= ' + num(pb) + ' × ' + num(q) + ' = ' + B(num(r10(pb * q)))],
        steps: [st(B(num(pb) + ' × ' + num(q)) + ' = ?', ans, { type: 'frac' })],
        traps: TR([tr(pf(r10(q / pb)) && q / pb <= 1 ? pf(r10(q / pb)) : null, 'd_condformula', 'Here you want "and", so multiply back: P(B) × P(A given B).'), tr(pf(q), 'd_condformula', 'That is only for the B group. Times by P(B).'), tr(pf(r10(pb + q - pb * q)), 'd_or', 'That is "or". The question asks for "and".')]) };
    }
    const pb = R.pick(P), q = R.pick(Q), pab = r10(pb * q), pa = R.pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.8]); if (pa < pab || pa === pb) return null;
    const ans = F(Math.round(pab * 10000), Math.round(pa * 10000));
    return { text: B('P(A) = ' + num(pa)) + ', ' + B('P(B) = ' + num(pb)) + ' and ' + B('P(A given B) = ' + num(q)) + '. What is P(B given A)? (A fraction or a decimal.)', ans, type: 'frac',
      how: [W('P(A and B) = ' + num(pb) + ' × ' + num(q) + ' = ' + num(pab), 'P(B) × P(A given B)'), W('P(B given A) = ' + fl('P(A and B)', 'P(A)') + ' = ' + num(pab) + ' ÷ ' + num(pa), 'now only the A part counts'), '= ' + B(fq(ans) + (isInt(r10(pab / pa * 10000)) ? ' = ' + num(r10(pab / pa)) : ''))],
      steps: [st('P(A and B) = ?', pf(pab), { type: 'frac' }), st('P(B given A) = ?', ans, { type: 'frac' })],
      traps: TR([tr(pf(q), 'd_condformula', 'P(B given A) and P(A given B) are usually different: divide by P(A).'), tr(pf(pab), 'd_condformula', 'Divide P(A and B) by P(A).'), tr(F(Math.round(pab * 10000), Math.round(pb * 10000)), 'd_condformula', 'Given A: divide by P(A), not P(B).')]) };
  } },

/* ---------- S-CP.B.7: the addition rule ---------- */
{ id: 'd_or', s: 'data', g: 10, title: 'A or B: add, then take off the overlap', cc: ['S-CP.B.7'], pre: ['f_simplify'],
  tip: 'P(A or B) = P(A) + P(B) − P(A and B): the overlap was counted twice. 30 kids, 18 soccer, 12 piano, 5 both: (18 + 12 − 5) ÷ 30 = 25/30 = 5/6.',
  gen(d, R) {
    if (d === 0) {
      const N = R.pick([20, 24, 25, 30, 32, 36, 40]), c = R.i(2, 8), a = c + R.i(3, N / 2 - 2), b = c + R.i(2, N / 2 - 3); if (a + b - c >= N) return null;
      const ctx = R.pick([['kids', 'play soccer', 'take piano'], ['students', 'have a dog', 'have a cat'], ['campers', 'can swim', 'can ride a bike']]), u = a + b - c, ans = F(u, N);
      return { text: 'Of ' + N + ' ' + ctx[0] + ', ' + a + ' ' + ctx[1] + ', ' + b + ' ' + ctx[2] + ', and ' + c + ' do both. One is picked at random. What is the probability they ' + ctx[1].split(' ')[0] + ' ' + ctx[1].split(' ').slice(1).join(' ') + ' or ' + ctx[2] + '? (A fraction is fine.)', ans, type: 'frac',
        how: [W(a + ' + ' + b + M + c + ' = ' + u, 'the ' + c + ' who do both were counted twice'), W('P = ' + fl(u, N) + (reduce(u, N)[1] !== N ? ' = ' + fr(u, N) : ''), 'out of all ' + N), 'P = ' + B(fq(ans))],
        steps: [st('How many do at least one?', u), st('The probability?', ans, { type: 'frac' })],
        traps: TR([tr(F(a + b, N), 'd_or', 'The ' + c + ' who do both were counted twice. Take them off once.'), tr(F(c, N), 'd_or', 'That is "and". "Or" is everyone in either group.'), tr(F(a + b - 2 * c, N), 'd_or', 'Take the overlap off once, not twice: those ' + c + ' still count.')]) };
    }
    if (d === 1) {
      const kind = R.i(0, 2);
      if (kind === 0) {
        const S = R.pick([['a heart', 13, 'a face card (J, Q, K)', 12, 3, 'the 3 heart face cards'], ['a red card', 26, 'a king', 4, 2, 'the 2 red kings'], ['a spade', 13, 'an ace', 4, 1, 'the ace of spades'], ['a black card', 26, 'a queen', 4, 2, 'the 2 black queens'], ['a club', 13, 'a face card (J, Q, K)', 12, 3, 'the 3 club face cards']]);
        const u = S[1] + S[3] - S[4], ans = F(u, 52);
        return { text: 'One card is drawn from a standard 52-card deck. What is the probability it is ' + S[0] + ' or ' + S[2] + '? (A fraction is fine.)', ans, type: 'frac',
          how: [W(S[1] + ' + ' + S[3] + M + S[4] + ' = ' + u, S[5] + ' were counted twice'), W(fl(u, 52) + ' = ' + fr(u, 52), 'out of 52'), 'P = ' + B(fq(ans))],
          steps: [st('How many cards are ' + S[0] + ' or ' + S[2] + '?', u), st('The probability?', ans, { type: 'frac' })],
          traps: TR([tr(F(S[1] + S[3], 52), 'd_or', S[5] + ' were counted twice. Take them off once.'), tr(F(S[4], 52), 'd_or', 'That is "and".'), tr(F(S[1] * S[3], 52 * 52), 'd_indep', 'This is one card, "or": add, then take off the overlap.')]) };
      }
      if (kind === 1) {
        const S = R.pick([['even', [2, 4, 6], 'greater than 3', [4, 5, 6]], ['odd', [1, 3, 5], 'less than 3', [1, 2]], ['a multiple of 3', [3, 6], 'even', [2, 4, 6]], ['prime', [2, 3, 5], 'even', [2, 4, 6]], ['less than 3', [1, 2], 'greater than 4', [5, 6]]]);
        const both = S[1].filter(v => S[3].includes(v)).length, u = S[1].length + S[3].length - both, ans = F(u, 6);
        return { text: 'A fair six-sided die is rolled. What is the probability the number is ' + S[0] + ' or ' + S[2] + '? (A fraction is fine.)', ans, type: 'frac',
          how: [W(S[0] + ': ' + S[1].join(', ') + '; ' + S[2] + ': ' + S[3].join(', '), 'list them'), W(S[1].length + ' + ' + S[3].length + M + both + ' = ' + u, both ? 'take off the ' + both + ' counted twice' : 'no overlap'), 'P = ' + fl(u, 6) + ' = ' + B(fq(ans))],
          steps: [st('How many numbers are ' + S[0] + ' or ' + S[2] + '?', u), st('The probability?', ans, { type: 'frac' })],
          traps: TR([both ? tr(F(S[1].length + S[3].length, 6), 'd_or', 'Numbers in both lists were counted twice.') : null, tr(F(both, 6), 'd_or', 'That is "and".'), tr(F(S[1].length, 6), 'd_or', 'Count the numbers in either list.')]) };
      }
      const pa = R.i(2, 7) / 10, pb = R.i(1, 6) / 10, pab = R.i(1, Math.round(Math.min(pa, pb) * 10) - (Math.min(pa, pb) > 0.1 ? 1 : 0)) / 10; if (pab <= 0 || pa + pb - pab > 1) return null;
      const ans = r10(pa + pb - pab);
      return { text: B('P(A) = ' + num(pa)) + ', ' + B('P(B) = ' + num(pb)) + ' and ' + B('P(A and B) = ' + num(pab)) + '. What is P(A or B)?', ans,
        how: [W('P(A or B) = P(A) + P(B) ' + MINUS + ' P(A and B)', 'the overlap was counted twice'), '= ' + num(pa) + ' + ' + num(pb) + M + num(pab) + ' = ' + B(num(ans))],
        steps: [st(B(num(pa) + ' + ' + num(pb)) + ' = ?', r10(pa + pb)), st('Take off the overlap:', ans)],
        traps: TR([tr(r10(pa + pb), 'd_or', 'Take off P(A and B): it was counted in both.'), tr(r10(pa * pb), 'd_indep', '"Or" adds; it doesn\'t multiply.'), tr(r10(pa + pb + pab), 'd_or', 'Take the overlap away, don\'t add it.')]) };
    }
    if (R.chance(.5)) {
      const pa = R.i(3, 7) / 10, pb = R.i(2, 6) / 10, pab = R.i(1, 3) / 10; if (pab >= Math.min(pa, pb) || pa + pb - pab > 1) return null;
      const por = r10(pa + pb - pab);
      return { text: B('P(A) = ' + num(pa)) + ', ' + B('P(B) = ' + num(pb)) + ' and ' + B('P(A or B) = ' + num(por)) + '. What is P(A and B)?', ans: pab,
        how: [W(num(por) + ' = ' + num(pa) + ' + ' + num(pb) + M + 'P(A and B)', 'the addition rule'), W(num(por) + ' = ' + num(r10(pa + pb)) + M + 'P(A and B)', ''), 'P(A and B) = ' + num(r10(pa + pb)) + M + num(por) + ' = ' + B(num(pab))],
        steps: [st(B(num(pa) + ' + ' + num(pb)) + ' = ?', r10(pa + pb)), st('P(A and B) = ?', pab)],
        traps: TR([tr(r10(pa * pb), 'd_testindep', 'Only independent events multiply. Use the addition rule.'), tr(r10(por - pa - pb), 'n_intsub', 'P(A and B) = P(A) + P(B) ' + MINUS + ' P(A or B).'), tr(r10(pa + pb + por), 'd_or', 'Take P(A or B) away from P(A) + P(B).')]) };
    }
    const N = R.pick([25, 30, 40, 50]), c = R.i(2, 6), a = c + R.i(3, 10), b = c + R.i(3, 10), u = a + b - c; if (u >= N) return null;
    const ctx = R.pick([['students', 'take art', 'take music'], ['guests', 'ordered soup', 'ordered salad'], ['runners', 'wore a hat', 'wore gloves']]), ans = F(N - u, N);
    return { text: 'Of ' + N + ' ' + ctx[0] + ', ' + a + ' ' + ctx[1] + ', ' + b + ' ' + ctx[2] + ', and ' + c + ' do both. One is picked at random. What is the probability they do neither? (A fraction is fine.)', ans, type: 'frac',
      how: [W(a + ' + ' + b + M + c + ' = ' + u, 'either one: take off the overlap'), W(N + M + u + ' = ' + (N - u), 'neither = everyone else'), 'P = ' + (reduce(N - u, N)[1] !== N ? fl(N - u, N) + ' = ' : '') + B(fq(ans))],
      steps: [st('How many do at least one?', u), st('How many do neither?', N - u), st('The probability?', ans, { type: 'frac' })],
      traps: TR([tr(F(N - a - b, N), 'd_or', 'The ' + c + ' who do both were taken away twice. Add them back once.'), tr(F(u, N), 'd_complement', 'That is "either". Neither is 1 ' + MINUS + ' that.'), tr(F(N - u - c, N), 'd_or', 'Take off the overlap once only.')]) };
  } },

/* ---------- G-GPE.B.6: divide a segment in a ratio ---------- */
{ id: 'g_partition', s: 'meas', g: 10, title: 'Split a segment in a ratio', paper: true, cc: ['G-GPE.B.6'], pre: ['x_midpoint', 'f_of'],
  tip: 'P splits A to B in the ratio m : n, so it is m/(m + n) of the way from A. A(1, 2) to B(10, 8) in 2 : 1: P is 2/3 of the way: x = 1 + 2/3 × 9 = 7.',
  gen(d, R) {
    const RT = d === 0 ? [[1, 2], [2, 1]] : d === 1 ? [[1, 3], [3, 1], [2, 3], [3, 2], [1, 4], [4, 1]] : [[3, 2], [2, 3], [4, 1], [1, 4], [5, 1], [1, 5], [3, 4], [4, 3]];
    const [m, n] = R.pick(RT), s = m + n, x1 = R.i(-8, 8), y1 = R.i(-8, 8), kx = nz(R, -3, 3), ky = nz(R, -3, 3), dx = s * kx, dy = s * ky, x2 = x1 + dx, y2 = y1 + dy;
    if (d < 2 && (x2 < -12 || x2 > 12 || y2 < -12 || y2 > 12)) return null;
    const px = x1 + m * kx, py = y1 + m * ky, askX = R.chance(.5);
    if (d === 2 && R.chance(.4)) {
      const ans = askX ? x2 : y2;
      return { text: 'P' + pt(px, py) + ' splits the segment from A' + pt(x1, y1) + ' to B in the ratio ' + B(m + ' : ' + n) + '. What is B\'s ' + (askX ? 'x' : 'y') + '-coordinate?', ans,
        how: [W('P is ' + fl(m, s) + ' of the way from A to B', m + ' parts out of ' + s), W('A to P: ' + (askX ? num(px) + M + par2(x1) + ' = ' + num(m * kx) : num(py) + M + par2(y1) + ' = ' + num(m * ky)), 'that is ' + m + ' parts'), W('one part = ' + num(askX ? kx : ky) + ', the whole = ' + s + ' × ' + par2(askX ? kx : ky) + ' = ' + num(askX ? dx : dy), ''), (askX ? 'x' : 'y') + ' = ' + num(askX ? x1 : y1) + ' ' + signed(askX ? dx : dy) + ' = ' + B(num(ans))],
        steps: [st('Change from A to P in ' + (askX ? 'x' : 'y') + '?', askX ? m * kx : m * ky), st('Change for one part?', askX ? kx : ky), st('B\'s ' + (askX ? 'x' : 'y') + '?', ans)],
        traps: TR([tr(askX ? x1 + 2 * m * kx : y1 + 2 * m * ky, 'x_midpoint', 'P is not the midpoint unless the ratio is 1 : 1.'), tr(askX ? px + n * kx : py + n * ky, 'g_partition', 'From P to B is ' + n + ' parts of size ' + num(askX ? kx : ky) + '. Find one part first.')]) };
    }
    const a = askX ? x1 : y1, b = askX ? x2 : y2, dd = askX ? dx : dy, ans = askX ? px : py, v = askX ? 'x' : 'y';
    return { text: 'P splits the segment from A' + pt(x1, y1) + ' to B' + pt(x2, y2) + ' in the ratio ' + B(m + ' : ' + n) + ' (A to P : P to B). What is P\'s ' + v + '-coordinate?', ans,
      how: [W(v + ' goes from ' + num(a) + ' to ' + num(b) + ': a change of ' + num(dd), ''), W('P is ' + fl(m, s) + ' of the way from A', m + (m === 1 ? ' part' : ' parts') + ' out of ' + m + ' + ' + n + ' = ' + s), W(v + ' = ' + num(a) + ' + ' + fl(m, s) + ' × ' + par2(dd) + ' = ' + num(a) + ' ' + signed(m * dd / s), ''), v + ' = ' + B(num(ans))],
      steps: [st('Change in ' + v + ' from A to B?', dd), st(B(fl(m, s) + ' × ' + par2(dd)) + ' = ?', m * dd / s), st('P\'s ' + v + '?', ans)],
      traps: TR([tr(r10(a + m / n * dd), 'g_partition', m + ' : ' + n + ' means ' + m + (m === 1 ? ' part' : ' parts') + ' out of ' + s + ', so ' + fl(m, s) + ', not ' + fl(m, n) + '.'), tr(a + n * dd / s, 'g_partition', 'Start at A and go ' + m + (m === 1 ? ' part' : ' parts') + ' of ' + s + ' toward B.'), tr(r10((a + b) / 2), 'x_midpoint', 'The midpoint is only for 1 : 1.')]) };
  } },

/* ---------- S-ID.A.4: the 68–95–99.7 rule ---------- */
{ id: 'd_normal', s: 'data', g: 11, title: 'The 68–95–99.7 rule', cc: ['S-ID.A.4'], pre: ['f_pctof'],
  tip: 'In a normal distribution about 68% is within 1 standard deviation of the mean, 95% within 2, 99.7% within 3. Split in halves: 34%, 13.5%, 2.35%, 0.15% on each side.',
  gen(d, R) {
    const PC = [15, 235, 1350, 3400, 3400, 1350, 235, 15], ZS = [-Infinity, -3, -2, -1, 0, 1, 2, 3, Infinity];
    const share = (z1, z2) => { let t = 0; for (let i = 0; i < 8; i++) if (ZS[i] >= z1 && ZS[i + 1] <= z2) t += PC[i]; return t; };
    const ctx = R.pick([['test scores', 70, 5, 'points'], ['heights', 160, 6, 'cm'], ['battery lives', 400, 25, 'hours'], ['apple weights', 150, 10, 'grams'], ['commute times', 30, 4, 'minutes']]);
    const mu = ctx[1], sd = ctx[2], val = z => mu + z * sd, intro = 'The ' + ctx[0] + ' are normal with mean ' + mu + ' and standard deviation ' + sd + ' ' + ctx[3] + '. ';
    const pieces = (z1, z2) => { const out = []; for (let i = 0; i < 8; i++) if (ZS[i] >= z1 && ZS[i + 1] <= z2) out.push(PC[i]); return out; };
    const zs = (z1, z2) => [z1, z2].filter(z => isFinite(z)).map(z => num(val(z)) + ' is ' + (z === 0 ? 'the mean' : Math.abs(z) + ' SD ' + (z > 0 ? 'above' : 'below'))).join('; ');
    if (d === 0) {
      const k = R.pick([1, 2, 3]), ans = [0, 68, 95, 99.7][k];
      return { text: intro + 'About what percent are between ' + B(num(val(-k))) + ' and ' + B(num(val(k))) + '?', ans, unit: '%',
        how: [W(num(val(-k)) + ' and ' + num(val(k)) + ' are ' + k + ' SD below and above the mean', '(value ' + MINUS + ' mean) ÷ SD = ±' + k), 'Within ' + k + ' SD of the mean: about ' + B(pct(ans)) + '.'],
        traps: TR([tr(k === 1 ? 95 : 68, 'd_normal', '68% is within 1 SD, 95% within 2, 99.7% within 3.'), tr(r10(ans / 2), 'd_normal', 'That is one side. Both sides of the mean count.'), tr(k === 3 ? 95 : 99.7, 'd_normal', 'Count the SDs: ' + num(val(k)) + ' is ' + k + ' SD from ' + mu + '.')]) };
    }
    if (d === 1) {
      const opts = [[1, Infinity], [-Infinity, -1], [2, Infinity], [-Infinity, -2], [0, Infinity], [0, 1], [0, 2], [-2, 0], [-1, 0], [-Infinity, 1], [-1, Infinity]];
      const [z1, z2] = R.pick(opts), ans = share(z1, z2) / 100;
      const q = !isFinite(z1) ? 'below ' + B(num(val(z2))) : !isFinite(z2) ? 'above ' + B(num(val(z1))) : 'between ' + B(num(val(z1))) + ' and ' + B(num(val(z2)));
      return { text: intro + 'About what percent are ' + q + '?', ans, unit: '%',
        how: [W(zs(z1, z2), '(value ' + MINUS + ' mean) ÷ SD'), W('pieces: ' + pieces(z1, z2).map(v => pct(v / 100)).join(' + '), '34%, 13.5%, 2.35%, 0.15% on each side'), '= ' + B(pct(ans))],
        steps: [st('How many SDs from the mean is ' + num(val(isFinite(z2) && z2 !== 0 ? z2 : z1)) + '?', Math.abs(isFinite(z2) && z2 !== 0 ? z2 : z1)), st('The percent?', ans)],
        traps: TR([tr(r10(100 - ans), 'd_normal', 'That is the other side of ' + num(val(isFinite(z2) && z2 !== 0 ? z2 : z1)) + '.'), tr(Math.abs(z1) === 1 || Math.abs(z2) === 1 ? 68 : 95, 'd_normal', 'That is both sides of the mean. Here only part of it counts.'), tr(r10(ans === 16 ? 34 : ans === 2.5 ? 13.5 : ans / 2), 'd_normal', 'Add up the pieces for the region asked about.')]) };
    }
    if (R.chance(.5)) {
      let z1 = R.i(-3, 2), z2 = R.i(z1 + 1, 3); if (z1 === -z2) return null;
      const ans = share(z1, z2) / 100;
      return { text: intro + 'About what percent are between ' + B(num(val(z1))) + ' and ' + B(num(val(z2))) + '?', ans, unit: '%',
        how: [W(zs(z1, z2), '(value ' + MINUS + ' mean) ÷ SD'), W('pieces: ' + pieces(z1, z2).map(v => pct(v / 100)).join(' + '), 'the halves of 68, 95 and 99.7'), '= ' + B(pct(ans))],
        steps: [st('SDs from the mean for ' + num(val(z1)) + '? (Below is negative.)', z1), st('For ' + num(val(z2)) + '?', z2), st('The percent?', ans)],
        traps: TR([tr(r10(share(-Math.max(Math.abs(z1), Math.abs(z2)), Math.max(Math.abs(z1), Math.abs(z2))) / 100), 'd_normal', 'The two ends are different distances from the mean: add the pieces on each side.'), Math.min(Math.abs(z1), Math.abs(z2)) > 0 ? tr(r10(share(-Math.min(Math.abs(z1), Math.abs(z2)), Math.min(Math.abs(z1), Math.abs(z2))) / 100), 'd_normal', 'Count the SDs for each end separately.') : null, tr(r10(share(Math.min(z1, 0), Math.max(z2, 0)) / 100), 'd_normal', 'Both ends are on the same side of the mean: only the pieces between them count.')]) };
    }
    const opts = [[1, Infinity], [-Infinity, -1], [2, Infinity], [-Infinity, -2], [-1, 1], [-2, 2], [0, 1], [-1, 2], [-2, 1], [1, 2]];
    const [z1, z2] = R.pick(opts), sh = share(z1, z2), N = 200 * R.i(1, 10), ans = N * sh / 10000; if (!isInt(ans)) return null;
    const q = !isFinite(z1) ? 'below ' + B(num(val(z2))) : !isFinite(z2) ? 'above ' + B(num(val(z1))) : 'between ' + B(num(val(z1))) + ' and ' + B(num(val(z2)));
    return { text: intro + 'Out of ' + num(N) + ', about how many are ' + q + '?', ans,
      how: [W(zs(z1, z2), '(value ' + MINUS + ' mean) ÷ SD'), W('pieces: ' + pieces(z1, z2).map(v => pct(v / 100)).join(' + ') + ' = ' + pct(sh / 100), ''), W(pct(sh / 100) + ' of ' + num(N) + ' = ' + B(num(ans)), '')],
      steps: [st('What percent?', sh / 100), st('How many of ' + num(N) + '?', ans)],
      traps: TR([tr(sh / 100, 'd_normal', 'That is the percent. Find that percent of ' + num(N) + '.'), tr(r10(N - ans), 'd_normal', 'That is everyone else.'), tr(r10(N * (100 - sh / 100) / 100) === r10(N - ans) ? null : r10(N * sh / 100), 'f_pctof', 'Percent means out of 100.')]) };
  } },

/* ---------- G-GMD.A.3: volume of a pyramid ---------- */
{ id: 'g_pyramid', s: 'meas', g: 10, title: 'Volume of a pyramid', paper: true, cc: ['G-GMD.A.3'], pre: ['r_pyth'],
  tip: 'A pyramid holds one third of the prism with the same base and height: V = ⅓ × base area × height. Square base 6 cm, height 10 cm: ⅓ × 36 × 10 = 120 cm³.',
  gen(d, R) {
    const T = fl(1, 3);
    if (d === 0) {
      const s = R.i(2, 12), h = R.i(2, 15); if ((s * s * h) % 3) return null; const ans = s * s * h / 3;
      return { text: 'A pyramid has a square base with ' + s + ' cm sides and a height of ' + h + ' cm. What is its volume?', ans, unit: 'cm³',
        how: [W('base area = ' + s + ' × ' + s + ' = ' + s * s + ' cm²', ''), W('V = ' + T + ' × ' + s * s + ' × ' + h, 'a pyramid is one third of the prism'), '= ' + num(s * s * h) + ' ÷ 3 = ' + B(num(ans))],
        steps: [st('Base area?', s * s), st('Base area × height?', s * s * h), st('Volume?', ans)],
        traps: TR([tr(s * s * h, 'g_volume', 'That is the prism. A pyramid is one third of it.'), tr(s * s * h / 2, 'g_pyramid', 'A pyramid is a third of the prism, not a half.'), tr(r10(s * h / 3), 'g_area', 'The base is a square: its area is ' + s + ' × ' + s + '.')]) };
    }
    if (d === 1) {
      const kind = R.i(0, 2);
      if (kind === 0) {
        const l = R.i(2, 12), w = R.i(2, 10), h = R.i(2, 15); if ((l * w * h) % 3 || l === w) return null; const ans = l * w * h / 3;
        return { text: 'A pyramid has a rectangular base ' + l + ' cm by ' + w + ' cm and a height of ' + h + ' cm. What is its volume?', ans, unit: 'cm³',
          how: [W('base area = ' + l + ' × ' + w + ' = ' + l * w + ' cm²', ''), W('V = ' + T + ' × ' + l * w + ' × ' + h, ''), '= ' + num(l * w * h) + ' ÷ 3 = ' + B(num(ans))],
          steps: [st('Base area?', l * w), st('Volume?', ans)],
          traps: TR([tr(l * w * h, 'g_volume', 'That is the box. A pyramid is one third of it.'), tr(r10((l + w) * h / 3), 'g_area', 'Base area is length × width.')]) };
      }
      if (kind === 1) {
        const b = R.i(2, 12), hb = R.i(2, 10), h = R.i(2, 15), base = b * hb / 2; if (!isInt(base) || (base * h) % 3) return null; const ans = base * h / 3;
        return { text: 'A pyramid has a triangular base with base ' + b + ' cm and height ' + hb + ' cm. The pyramid is ' + h + ' cm tall. What is its volume?', ans, unit: 'cm³',
          how: [W('base area = ½ × ' + b + ' × ' + hb + ' = ' + base + ' cm²', 'the triangle'), W('V = ' + T + ' × ' + base + ' × ' + h, ''), '= ' + num(base * h) + ' ÷ 3 = ' + B(num(ans))],
          steps: [st('Area of the triangle base?', base), st('Volume?', ans)],
          traps: TR([tr(b * hb * h / 3, 'g_tri', 'A triangle\'s area is half of base × height.'), tr(base * h, 'g_volume', 'That is the prism. A pyramid is one third of it.')]) };
      }
      const s = R.i(2, 10), h = R.i(2, 15); if ((s * s * h) % 3) return null; const V = s * s * h / 3;
      return { text: 'A square pyramid has base sides of ' + s + ' cm and a volume of ' + num(V) + ' cm³. How tall is it?', ans: h, unit: 'cm',
        how: [W(num(V) + ' = ' + T + ' × ' + s * s + ' × h', 'V = ⅓ × base area × height'), W(num(3 * V) + ' = ' + s * s + 'h', 'multiply both sides by 3'), W('h = ' + B(h), 'divide by ' + s * s)],
        steps: [st('3 × volume?', 3 * V), st('h = ?', h)],
        traps: TR([tr(r10(V / (s * s)), 'g_pyramid', 'Multiply by 3 first: a pyramid is a third of the prism.'), tr(r10(3 * V / s), 'g_area', 'Divide by the base area, ' + s + ' × ' + s + '.')]) };
    }
    const P = R.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [6, 8, 10], [8, 6, 10], [12, 5, 13], [8, 15, 17]]), hs = P[0], h = P[1], l = P[2], s = 2 * hs, ans = s * s * h / 3;
    if (R.chance(.25)) {
      const V = ans;
      return { text: 'A square pyramid has base sides of ' + s + ' cm and volume ' + num(V) + ' cm³. Its slant height (from the top down the middle of a face to the base) is how long?', ans: l, unit: 'cm',
        how: [W('h = 3 × ' + num(V) + ' ÷ ' + s * s + ' = ' + h, 'from V = ⅓ × base area × h'), W('half the base = ' + hs, 'center to the middle of a side'), W('slant = ' + rt(sq(h) + ' + ' + sq(hs)) + ' = ' + rt(h * h + hs * hs) + ' = ' + B(l), 'Pythagorean theorem')],
        steps: [st('Height h?', h), st('Slant height?', l)],
        traps: TR([tr(h, 'g_pyramid', 'That is the straight-up height. The slant height is longer.'), tr(h + hs, 'r_pyth', 'Square both, add, then take the square root.'), tr(r10(Math.sqrt(h * h + s * s)) % 1 ? null : Math.sqrt(h * h + s * s), 'r_pyth', 'Use half the base, from the center to the middle of a side.')]) };
    }
    return { text: 'A square pyramid has base sides of ' + s + ' cm and a slant height of ' + l + ' cm (from the top, down the middle of a face, to the base). What is its volume?', ans, unit: 'cm³',
      how: [W('half the base = ' + hs + ' cm', 'from the center to the middle of a side'), W('h = ' + rt(sq(l) + M + sq(hs)) + ' = ' + rt(l * l - hs * hs) + ' = ' + h, 'Pythagorean theorem: the slant height is the long side'), W('V = ' + T + ' × ' + s * s + ' × ' + h, ''), '= ' + B(num(ans))],
      steps: [st('The straight-up height h?', h), st('Base area?', s * s), st('Volume?', ans)],
      traps: TR([tr(r10(s * s * l / 3), 'g_pyramid', 'The slant height is not the height. Find the straight-up height first.'), tr(s * s * h, 'g_volume', 'A pyramid is one third of the prism.'), tr(r10(s * s * Math.sqrt(l * l - s * s > 0 ? l * l - s * s : 0) / 3) || null, 'r_leg', 'Use half the base side, from the center to the middle of a side.')]) };
  } },

]);
})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
