/* d.js: Times & Dividing (5–8), Number Sense (5–7), Patterns (6–11), Powers, Roots & Logs, Triangles & Trig, Calculus.
   One narrow idea per concept. The how lines work the shortcut for the exact numbers, the steps break it down with the
   same numbers, and each trap points a likely slip at the concept it really comes from. */
(function (C) {
'use strict';
const { B, num, MINUS, frac, pw, rt, PI, DEG, poly, reduce, seqHTML, numLineSVG, plotSVG, triSVG, table, dotsSVG } = C;
const M = ' ' + MINUS + ' ';
const tr = (v, c, why) => ({ v, c, why });
const st = (text, ans, o) => Object.assign({ text, ans }, o || {});
const Q = (a, b) => { const [x, y] = reduce(a, b); return { n: x, d: y }; };          /* an exact fraction answer */
const fr = (a, b) => { const [x, y] = reduce(a, b); return frac(x, y); };             /* a fraction shown in lowest terms */
const fq = q => fr(q.n, q.d);
const fs = (top, bot) => '<span class="fr"><span class="fr-n">' + top + '</span><span class="fr-d">' + bot + '</span></span>';
const sq = v => pw(v, 2);
const ng = v => (v < 0 ? '(' + num(v) + ')' : num(v));                                 /* (−3) in brackets */
const sub = (s, k) => s + '<sub>' + k + '</sub>';
const sgn = v => (v < 0 ? M + num(-v) : ' + ' + num(v));                              /* " + 5" or " − 5" */
/* traps: drop empty or broken values and repeats */
function TR(list) {
  const seen = new Set();
  return list.filter(t => {
    if (!t || t.v == null) return false; const v = t.v;
    if (typeof v === 'number' && !isFinite(v)) return false;
    if (typeof v === 'object' && v.n != null && !(Number.isInteger(v.n) && Number.isInteger(v.d) && v.d !== 0)) return false;
    const k = typeof v === 'object' ? (v.n != null ? (v.n / v.d).toFixed(9) : JSON.stringify(v)) : (+v).toFixed(9);
    if (seen.has(k)) return false; seen.add(k); return true;
  });
}
/* the times-fact concept a slip with a × b points to */
function factC(a, b) {
  a = Math.abs(a); b = Math.abs(b); if (a === b) return 'm_squares';
  for (const [k, c] of [[[2, 5, 10], 'm_x2510'], [[9], 'm_x9'], [[4, 8], 'm_x4x8'], [[3, 6], 'm_x3x6'], [[7], 'm_x7']]) if (k.includes(a) || k.includes(b)) return c;
  return 'm_breakapart';
}
const zw = z => (z === 1 ? 'one zero' : z === 2 ? 'two zeros' : z === 3 ? 'three zeros' : z + ' zeros');
const nonzero = (R, lo, hi) => { let v; do { v = R.i(lo, hi); } while (!v); return v; };

/* ======================= Times & Dividing (5–8) ======================= */
function x11cols(v) { const ds = String(v).split('').map(Number), cols = [ds[0]]; for (let i = 1; i < ds.length; i++) cols.push(ds[i - 1] + ds[i]); cols.push(ds[ds.length - 1]); return { ds, cols }; }
const r10 = v => Math.round(v / 10) * 10, r100 = v => Math.round(v / 100) * 100;

C.defs([
  { id: 'm_x99', s: 'mul', g: 5, title: 'Times 9, 99 and 999', pre: ['n_times10'],
    tip: '99 is 100 take away 1. So 34 × 99 is 34 × 100 take away one 34: 3,400 − 34 = 3,366. ×9 and ×999 work the same way.',
    gen(d, R) {
      const k = d === 0 ? 9 : d === 1 ? 99 : R.pick([999, 99]);
      const a = d === 0 ? R.i(12, 49) : d === 1 ? R.i(12, 89) : k === 999 ? R.i(12, 89) : R.i(102, 480);
      if (a % 10 === 0) return null;
      const big = k + 1, X = a * big, ans = X - a, z = String(big).length - 1, wrongBig = big === 10 ? 100 : big / 10;
      return { text: 'What is ' + B(num(a) + ' × ' + num(k)) + '?', ans,
        how: [num(k) + ' is ' + num(big) + ' take away 1, so ' + num(a) + ' × ' + num(k) + ' is ' + num(a) + ' × ' + num(big) + ' take away one ' + num(a) + '.',
          num(a) + ' × ' + num(big) + ' = ' + num(X) + ' (put ' + zw(z) + ' on the end).',
          num(X) + M + num(a) + ' = ' + B(num(ans)) + '.'],
        steps: [st('What is ' + B(num(a) + ' × ' + num(big)) + '?', X), st('Take away one ' + num(a) + ': ' + B(num(X) + M + num(a)) + ' = ?', ans)],
        traps: TR([tr(X, 'm_x99', 'That is ' + num(a) + ' × ' + num(big) + '. ' + num(k) + ' is one less, so take away one ' + num(a) + '.'),
          tr(X - 1, 'm_x99', 'You took away 1, but ' + num(k) + ' groups is one whole group of ' + num(a) + ' less than ' + num(big) + ' groups.'),
          tr(X + a, 'a_borrow', num(X) + ' ends in zeros, so taking away ' + num(a) + ' needs borrowing. The answer must be smaller than ' + num(X) + '.'),
          tr(a * wrongBig - a, 'n_times10', 'Check the zeros: × ' + num(big) + ' puts ' + zw(z) + ' on the end.')]) };
    } },

  { id: 'm_div5', s: 'mul', g: 5, title: 'Divide by 5 and by 25', pre: ['f_decx10'],
    tip: '÷5: double it, then ÷10 (5 is half of 10). 135 ÷ 5: 270, then 27. ÷25: times 4, then ÷100 (4 quarters in a dollar).',
    gen(d, R) {
      if (d < 2) {
        const a = d === 0 ? 5 * R.i(11, 49) : R.i(41, 499);
        if (d === 1 && a % 5 === 0) return null;
        const dbl = 2 * a, ans = dbl / 10;
        return { text: 'What is ' + B(num(a) + ' ÷ 5') + '?', ans,
          how: ['5 is half of 10, so dividing by 5 is the same as doubling, then dividing by 10.', 'Double ' + num(a) + ': ' + num(dbl) + '.',
            num(dbl) + ' ÷ 10 = ' + B(num(ans)) + (d === 1 ? ' (every digit moves one place to the right).' : '.')],
          steps: [st('Double it: ' + B('2 × ' + num(a)) + ' = ?', dbl), st(B(num(dbl) + ' ÷ 10') + ' = ?', ans)],
          traps: TR([tr(dbl, 'm_div5', 'You doubled ' + num(a) + '. Now divide by 10.'), tr(dbl / 100, 'n_times10', 'Dividing by 10 moves every digit just one place.'),
            tr(a / 10, 'm_div5', 'Double first, then divide by 10.')]) };
      }
      const a = R.chance(.6) ? 25 * R.i(5, 79) : 5 * R.i(7, 199);
      if (a % 100 === 0) return null;
      const x4 = 4 * a, ans = x4 / 100;
      return { text: 'What is ' + B(num(a) + ' ÷ 25') + '?', ans,
        how: ['25 is 100 ÷ 4 (4 quarters make a dollar), so dividing by 25 is the same as times 4, then ÷ 100.', '4 × ' + num(a) + ' = ' + num(x4) + '.',
          num(x4) + ' ÷ 100 = ' + B(num(ans)) + '.'],
        steps: [st(B('4 × ' + num(a)) + ' = ?', x4), st(B(num(x4) + ' ÷ 100') + ' = ?', ans)],
        traps: TR([tr(x4, 'm_div5', 'You did the times 4. Now divide by 100.'), tr(x4 / 10, 'n_times10', 'Dividing by 100 moves every digit two places, not one.'),
          tr(a / 4, 'm_div5', 'Times 4, don’t divide by 4: every 100 holds four 25s.')]) };
    } },

  { id: 'm_divzeros', s: 'mul', g: 5, title: 'Cross off zeros first', pre: ['n_times10'],
    tip: 'Cross off the same number of zeros from both numbers first. 2,400 ÷ 60 is the same as 240 ÷ 6, which is 40.',
    gen(d, R) {
      const b = d === 2 ? R.pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12]) : R.i(2, 9), q = d === 2 ? R.pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12]) : R.i(2, 9);
      const dz = d === 2 ? 2 : 1, az = d === 0 ? 1 : d === 1 ? R.i(2, 3) : R.i(3, 4);
      const A = b * q * Math.pow(10, az), D = b * Math.pow(10, dz), A2 = A / Math.pow(10, dz), ans = A / D, e = az - dz;
      const how = ['Both numbers end in zeros. Cross off ' + zw(dz) + ' from each: ' + num(A) + ' ÷ ' + num(D) + ' is the same as ' + num(A2) + ' ÷ ' + b + '.'];
      if (!e) how.push('Think ' + b + ' × ? = ' + num(A2) + ': ' + b + ' × ' + q + ' = ' + num(b * q) + ', so the answer is ' + B(num(ans)) + '.');
      else how.push('Think ' + num(b * q) + ' ÷ ' + b + ' = ' + q + '. ' + num(A2) + ' has ' + (e === 1 ? 'one more zero' : e + ' more zeros') + ', so ' + num(A2) + ' ÷ ' + b + ' = ' + B(num(ans)) + '.');
      return { text: 'What is ' + B(num(A) + ' ÷ ' + num(D)) + '?', ans, how,
        steps: [st('Cross off ' + zw(dz) + ' from each number. What does ' + B(num(A)) + ' become?', A2), st(B(num(A2) + ' ÷ ' + b) + ' = ?', ans)],
        traps: TR([tr(ans * 10, 'n_times10', 'Cross off the same number of zeros from both numbers, then count what is left.'),
          tr(ans / 10, 'n_times10', 'You crossed off one zero too many. Take the same number from each.'),
          tr((q + 1) * Math.pow(10, e), 'm_divfam', 'Check the fact: ' + b + ' × ? = ' + num(b * q) + '.'),
          tr((q - 1) * Math.pow(10, e), 'm_divfam', 'Check the fact: ' + b + ' × ? = ' + num(b * q) + '.')]) };
    } },

  { id: 'm_x15', s: 'mul', g: 5, title: 'Times 15: ×10 plus half', pre: ['f_half'],
    tip: '15 is 10 + 5, and 5 is half of 10. So 24 × 15: 24 × 10 = 240, half of 240 is 120, and 240 + 120 = 360.',
    gen(d, R) {
      const a = d === 0 ? 2 * R.i(6, 24) : d === 1 ? R.i(13, 99) : R.i(102, 480);
      if (a % 10 === 0) return null;
      const k = d === 2 && R.chance(.35) ? 150 : 15, unit = k === 15 ? 10 : 100, X = a * unit, H = X / 2, ans = X + H;
      return { text: 'What is ' + B(num(a) + ' × ' + k) + '?', ans,
        how: [k + ' is ' + unit + ' + ' + unit / 2 + ', and ' + unit / 2 + ' is half of ' + unit + '. So ' + num(a) + ' × ' + k + ' is ' + num(a) + ' × ' + unit + ' plus half of that.',
          num(a) + ' × ' + unit + ' = ' + num(X) + '. Half of ' + num(X) + ' is ' + num(H) + '.', num(X) + ' + ' + num(H) + ' = ' + B(num(ans)) + '.'],
        steps: [st(B(num(a) + ' × ' + unit) + ' = ?', X), st('What is half of ' + B(num(X)) + '?', H), st(B(num(X) + ' + ' + num(H)) + ' = ?', ans)],
        traps: TR([tr(X, 'm_x15', 'That is the × ' + unit + ' part. Add half of it too.'), tr(X + a, 'm_x15', 'You added one more ' + num(a) + '. The extra part is half of ' + num(X) + '.'),
          tr(H, 'm_x15', 'That is only the half part. Add the × ' + unit + ' part too.'), tr(ans + 10, 'a_regroup', 'Check your adding: ' + num(X) + ' + ' + num(H) + '.')]) };
    } },

  { id: 'm_x11big', s: 'mul', g: 5, title: 'Times 11 with carrying', pre: ['a_regroup'],
    tip: '75 × 11: write 7 and 5 on the outside, 7 + 5 = 12 in the middle. 12 is too big, so keep 2 and carry 1 onto the 7: 825.',
    gen(d, R) {
      let v;
      if (d < 2) { const t = R.i(d === 0 ? 2 : 3, 9), o = d === 0 ? R.i(10 - t, Math.min(9, 12 - t)) : R.i(Math.max(1, 10 - t), 9); v = 10 * t + o; if (t + o < 10) return null; }
      else { v = R.i(102, 989); if (v % 10 === 0) return null; if (!x11cols(v).cols.slice(1, 3).some(c => c >= 10)) return null; }
      const { ds, cols } = x11cols(v), ans = v * 11, res = cols.slice(), carry = [];
      for (let i = res.length - 1; i > 0; i--) if (res[i] >= 10) { carry.push(res[i] + ': keep ' + (res[i] % 10) + ', carry 1 onto ' + res[i - 1] + ' to make ' + (res[i - 1] + 1)); res[i - 1] += 1; res[i] %= 10; }
      const noCarry = Number(cols.map(c => c % 10).join('')), glued = Number(cols.join(''));
      const traps = TR([tr(noCarry, 'a_regroup', 'When a middle sum is 10 or more, keep the ones digit and carry the 1 to the left.'),
        ds.length === 2 ? tr(glued, 'a_regroup', 'Each place holds one digit. A sum like ' + cols.find(c => c >= 10) + ' carries its 1 to the next place.') : null,
        tr(v * 10, 'm_x11', 'Times 11 is times 10 plus one more ' + num(v) + '.')]);
      if (ds.length === 2) return { text: 'What is ' + B(v + ' × 11') + '?', ans, traps,
        how: ['Write the two digits on the outside: ' + ds[0] + ' _ ' + ds[1] + '. The middle is ' + ds[0] + ' + ' + ds[1] + ' = ' + cols[1] + '.',
          cols[1] + ' does not fit in one place: keep ' + cols[1] % 10 + ' in the middle and carry 1 onto the ' + ds[0] + ', making ' + (ds[0] + 1) + '.', 'So ' + v + ' × 11 = ' + B(num(ans)) + '.'],
        steps: [st('What is ' + B(ds[0] + ' + ' + ds[1]) + '?', cols[1]), st('Keep ' + cols[1] % 10 + ' in the middle and carry 1 onto the ' + ds[0] + '. What is ' + B(v + ' × 11') + '?', ans)] };
      return { text: 'What is ' + B(num(v) + ' × 11') + '?', ans, traps,
        how: ['Write the end digits: ' + ds[0] + ' _ _ ' + ds[2] + '. In between, add next-door digits: ' + ds[0] + ' + ' + ds[1] + ' = ' + cols[1] + ' and ' + ds[1] + ' + ' + ds[2] + ' = ' + cols[2] + '.',
          'Carry from the right. ' + carry.join('; ') + '.', 'So ' + num(v) + ' × 11 = ' + B(num(ans)) + '.'],
        steps: [st('What is ' + B(ds[0] + ' + ' + ds[1]) + '?', cols[1]), st('What is ' + B(ds[1] + ' + ' + ds[2]) + '?', cols[2]), st('The places hold ' + cols.slice(0, -1).join(', ') + ' and ' + cols[cols.length - 1] + '. Now carry from the right. What is ' + B(num(v) + ' × 11') + '?', ans)] };
    } },

  { id: 'm_est', s: 'mul', g: 5, title: 'Estimate: round, then multiply', pre: ['n_round100'],
    tip: 'Round to friendly numbers first, then use the easy fact. 48 × 31 is about 50 × 30 = 1,500.',
    gen(d, R) {
      const okT = v => v % 10 !== 0 && v % 10 !== 5;
      if (d === 0) {
        const a = R.i(12, 98), b = R.i(3, 9); if (!okT(a)) return null;
        const ra = r10(a), ans = ra * b, other = ra > a ? ra - 10 : ra + 10;
        return { text: 'Round ' + a + ' to the nearest ten. About how much is ' + B(a + ' × ' + b) + '?', ans,
          how: [a + ' rounds to ' + ra + ' (the ones digit ' + a % 10 + (a % 10 >= 5 ? ' is 5 or more, so round up).' : ' is less than 5, so round down).'),
            ra + ' × ' + b + ' is ' + ra / 10 + ' × ' + b + ' = ' + (ra / 10 * b) + ', with a zero on the end: ' + B(num(ans)) + '.'],
          steps: [st('Round ' + B(a) + ' to the nearest ten.', ra), st(B(ra + ' × ' + b) + ' = ?', ans)],
          traps: TR([tr(a * b, 'm_est', 'That is the exact answer. For an estimate, round ' + a + ' first.'), tr(other * b, 'n_round10', 'Check the rounding: is ' + a + ' closer to ' + Math.floor(a / 10) * 10 + ' or ' + (Math.floor(a / 10) + 1) * 10 + '?'),
            tr(ans * 10, 'm_xtens', 'Check the zeros: ' + ra + ' has one zero, so the answer has one zero.')]) };
      }
      if (d === 1 || R.chance(.5)) {
        const a = d === 1 ? R.i(12, 94) : R.i(110, 940), b = R.i(12, 94);
        if (!okT(b) || (d === 1 ? !okT(a) : (a % 10 === 0 || Math.floor(a / 10) % 10 === 5 || Math.floor(a / 10) % 10 === 0))) return null;
        const ra = d === 1 ? r10(a) : r100(a), rb = r10(b), za = d === 1 ? 1 : 2, fa = ra / Math.pow(10, za), fb = rb / 10, ans = ra * rb;
        const ob = rb > b ? rb - 10 : rb + 10;
        return { text: (za === 1 ? 'Round each number to the nearest ten.' : 'Round ' + num(a) + ' to the nearest hundred and ' + b + ' to the nearest ten.') + ' About how much is ' + B(num(a) + ' × ' + b) + '?', ans,
          how: [num(a) + ' rounds to ' + num(ra) + ' and ' + b + ' rounds to ' + rb + '.', 'Multiply the front digits: ' + fa + ' × ' + fb + ' = ' + fa * fb + '. Then put on all ' + zw(za + 1) + ': ' + B(num(ans)) + '.'],
          steps: [st('Round ' + B(num(a)) + ' to the nearest ' + (za === 1 ? 'ten.' : 'hundred.'), ra), st('Round ' + B(b) + ' to the nearest ten.', rb), st(B(num(ra) + ' × ' + rb) + ' = ?', ans)],
          traps: TR([tr(a * b, 'm_est', 'That is the exact answer. Round both numbers first; an estimate is quick.'), tr(ans * 10, 'm_tensxtens', 'Count the zeros: ' + num(ra) + ' and ' + rb + ' have ' + zw(za + 1) + ' between them.'),
            tr(ans / 10, 'm_tensxtens', 'Count the zeros: ' + num(ra) + ' and ' + rb + ' have ' + zw(za + 1) + ' between them.'), tr(ra * ob, 'n_round10', 'Check the rounding of ' + b + '.')]) };
      }
      const dd = R.i(2, 9), q = R.i(2, 9), Dp = dd * 10, Np = dd * q * 100, off = R.i(-40, 40), offD = R.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
      if (!off) return null;
      const N = Np + off, Dv = Dp + offD, ans = 10 * q;
      return { text: 'Round ' + num(N) + ' to the nearest hundred and ' + Dv + ' to the nearest ten. About how much is ' + B(num(N) + ' ÷ ' + Dv) + '?', ans,
        how: [num(N) + ' rounds to ' + num(Np) + ' and ' + Dv + ' rounds to ' + Dp + '.', 'Cross off a zero from each: ' + num(Np / 10) + ' ÷ ' + dd + '.',
          'Think ' + dd * q + ' ÷ ' + dd + ' = ' + q + ', so ' + num(Np / 10) + ' ÷ ' + dd + ' = ' + B(ans) + '.'],
        steps: [st('Round ' + B(num(N)) + ' to the nearest hundred.', Np), st('Round ' + B(Dv) + ' to the nearest ten.', Dp), st(B(num(Np) + ' ÷ ' + Dp) + ' = ?', ans)],
        traps: TR([tr(q, 'm_divzeros', 'Cross off one zero from each number, then divide. ' + num(Np / 10) + ' still has a zero.'), tr(100 * q, 'm_divzeros', 'Cross off the same number of zeros from both numbers.'),
          tr(10 * (q + 1), 'm_divfam', 'Check the fact: ' + dd + ' × ? = ' + dd * q + '.'), tr(10 * (q - 1), 'm_divfam', 'Check the fact: ' + dd + ' × ? = ' + dd * q + '.')]) };
    } },

  { id: 'm_teens', s: 'mul', g: 6, title: 'Teens times teens', pre: [],
    tip: '13 × 14: add 13 and the 4 (17), times 10 (170), then add 3 × 4 = 12. So 182. In the twenties, times 20 instead.',
    gen(d, R) {
      let T = 10, a, b;
      if (d === 0) { a = R.i(11, 15); b = R.i(11, 15); if ((a % 10) * (b % 10) >= 10) return null; }
      else if (d === 1) { a = R.i(11, 19); b = R.i(11, 19); if (a === b && R.chance(.6)) return null; }
      else if (R.chance(.5)) { T = 20; a = R.i(21, 29); b = R.i(21, 29); }
      else { a = R.i(16, 19); b = R.i(14, 19); }
      const oa = a % 10, ob = b % 10; if (!oa || !ob) return null;
      const s = a + ob, big = s * T, p = oa * ob, ans = a * b;
      return { text: 'What is ' + B(a + ' × ' + b) + '?', ans,
        how: ['Add ' + a + ' and the ones digit of ' + b + ': ' + a + ' + ' + ob + ' = ' + s + '. Times ' + T + ': ' + num(big) + '.',
          'Multiply the ones digits: ' + oa + ' × ' + ob + ' = ' + p + '.', num(big) + ' + ' + p + ' = ' + B(num(ans)) + '.'],
        steps: [st(B(a + ' + ' + ob) + ' = ?', s), st(B(s + ' × ' + T) + ' = ?', big), st(B(oa + ' × ' + ob) + ' = ?', p), st(B(num(big) + ' + ' + p) + ' = ?', ans)],
        traps: TR([tr(big, 'm_teens', 'Good start. Now add the ones digits multiplied: ' + oa + ' × ' + ob + '.'),
          tr(T * T + p, 'm_breakapart', 'Tens × tens and ones × ones is not all of it: the middle pieces are missing.'),
          T === 20 ? tr(s * 10 + p, 'm_teens', 'In the twenties the base is 20, so times 20, not 10.') : null]) };
    } },

  { id: 'm_sq5', s: 'mul', g: 6, title: 'Squares ending in 5', pre: ['w_exp'],
    tip: '35²: cover the 5, take the 3, times the next number up: 3 × 4 = 12. Then write 25 on the end: 1,225.',
    gen(d, R) {
      let n, dec = false;
      if (d === 0) n = R.i(1, 9); else if (d === 1) { if (R.chance(.6)) n = R.i(6, 12); else { n = R.i(1, 4); dec = true; } }
      else if (R.chance(.5)) n = R.i(13, 19); else { n = R.i(5, 9); dec = true; }
      const v = 10 * n + 5, p = n * (n + 1), whole = p * 100 + 25, ans = dec ? whole / 100 : whole, sc = dec ? 100 : 1;
      const shown = dec ? n + '.5' : num(v);
      return { text: 'What is ' + B(sq(shown)) + '?', ans,
        how: dec ? ['The digits are the same as ' + sq(v) + '. Cover the .5: you have ' + n + '.', 'Times the next number up: ' + n + ' × ' + (n + 1) + ' = ' + p + '.',
          'Then .25 on the end: ' + B(num(ans)) + ' (' + shown + ' × ' + shown + ' has two decimal places).']
          : ['Cover the 5 on the end: you have ' + n + '.', 'Multiply ' + n + ' by the next number up: ' + n + ' × ' + (n + 1) + ' = ' + p + '.', 'Write 25 on the end: ' + B(num(ans)) + '.'],
        steps: [st(B(n + ' × ' + (n + 1)) + ' = ?', p), st('Write ' + (dec ? '.25' : '25') + ' after ' + p + '. What is ' + B(sq(shown)) + '?', ans)],
        traps: TR([tr((n * n * 100 + 25) / sc, 'm_sq5', 'Multiply ' + n + ' by the next number up, ' + (n + 1) + ', not by itself.'),
          tr(2 * (dec ? n + 0.5 : v), 'w_exp', 'Squared means times itself, not times 2.'),
          tr(p * 100 / sc, 'm_sq5', 'Don’t forget the 25 on the end (5 × 5).'), dec ? tr(whole, 'n_times10', 'Where does the point go? ' + shown + ' × ' + shown + ' has two decimal places.') : null]) };
    } },

  { id: 'm_nearsq', s: 'mul', g: 7, title: 'Squares near a known square', pre: ['w_exp'],
    tip: '51² = 50² + 2 × 50 × 1 + 1² = 2,500 + 100 + 1 = 2,601. 49² = 2,500 − 100 + 1 = 2,401. The little square is always added.',
    gen(d, R) {
      if (d === 2 && R.chance(.5)) {
        const n = R.i(21, 79); if (n % 10 === 0) return null;
        const up = R.chance(.6), X = n * n, m = up ? n + 1 : n - 1, ans = m * m, s = n + m;
        return { text: B(sq(n) + ' = ' + num(X)) + '. What is ' + B(sq(m)) + '?', ans,
          how: [up ? 'Going from ' + sq(n) + ' up to ' + sq(m) + ' adds the two numbers: ' + n + ' + ' + m + ' = ' + s + '.' : 'Going from ' + sq(n) + ' down to ' + sq(m) + ' takes away the two numbers: ' + n + ' + ' + m + ' = ' + s + '.',
            num(X) + (up ? ' + ' : M) + s + ' = ' + B(num(ans)) + '.'],
          steps: [st(B(n + ' + ' + m) + ' = ?', s), st(B(num(X) + (up ? ' + ' : M) + s) + ' = ?', ans)],
          traps: TR([tr(up ? X + 1 : X - 1, 'm_nearsq', 'Next-door squares are further apart than 1. They differ by ' + n + ' + ' + m + '.'),
            tr(up ? X + 2 * n : X - 2 * n, 'm_nearsq', 'Close. The gap is ' + n + ' + ' + m + ', not 2 × ' + n + '.'), tr(up ? X + n : X - n, 'm_nearsq', 'The gap is both numbers added: ' + n + ' + ' + m + '.')]) };
      }
      let base, off;
      if (d === 0) { base = 10 * R.i(2, 9); off = R.pick([-1, 1]); }
      else if (d === 1) { if (R.chance(.3)) { base = 50; off = R.pick([-3, -2, -1, 1, 2, 3]); } else { base = 10 * R.i(2, 9); off = R.pick([-2, 2]); } }
      else { base = R.pick([100, 100, 200, 300]); off = base === 100 ? R.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]) : R.pick([-3, -2, -1, 1, 2, 3]); }
      const v = base + off, k = Math.abs(off), B2 = base * base, mid = 2 * base * k, k2 = k * k, ans = v * v, pl = off > 0;
      return { text: 'What is ' + B(sq(v)) + '?', ans,
        how: [v + ' is ' + base + (pl ? ' + ' : M) + k + ', and ' + sq(base) + ' = ' + num(B2) + '.',
          (pl ? 'Add' : 'Take away') + ' 2 × ' + base + ' × ' + k + ' = ' + num(mid) + ', then add ' + sq(k) + ' = ' + k2 + '.',
          num(B2) + (pl ? ' + ' : M) + num(mid) + ' + ' + k2 + ' = ' + B(num(ans)) + '.'],
        steps: [st(B(sq(base)) + ' = ?', B2), st(B('2 × ' + base + ' × ' + k) + ' = ?', mid), st(B(num(B2) + (pl ? ' + ' : M) + num(mid) + ' + ' + k2) + ' = ?', ans)],
        traps: TR([tr(B2 + k2, 'm_nearsq', 'You missed the two strips: 2 × ' + base + ' × ' + k + '.'),
          tr(B2 + (pl ? 1 : -1) * base * k + k2, 'm_nearsq', 'There are two strips of ' + base + ' × ' + k + ', not one.'),
          pl ? tr(B2 + mid, 'm_nearsq', 'Don’t forget the little square: ' + sq(k) + ' = ' + k2 + '.') : tr(B2 - mid - k2, 'n_intmul', '(' + MINUS + k + ') × (' + MINUS + k + ') is positive, so the little square is added.')]) };
    } },

  { id: 'm_near100', s: 'mul', g: 7, title: 'Numbers near 100', pre: ['n_intmul'],
    tip: '97 × 96: the gaps below 100 are 3 and 4. 97 − 4 = 93 (hundreds), and 3 × 4 = 12, so 9,312.',
    gen(d, R) {
      let a, b;
      if (d === 0) { const [p, q] = R.pick([[1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 2], [2, 3], [2, 4], [3, 3], [1, 9]]); const s = R.chance(.5); a = 100 - (s ? p : q); b = 100 - (s ? q : p); }
      else if (d === 1) { a = R.i(88, 98); b = R.i(88, 98); const p = (100 - a) * (100 - b); if (p >= 100 || p < 10) return null; }
      else if (R.chance(.5)) { a = R.i(101, 112); b = R.i(101, 112); if ((a - 100) * (b - 100) >= 100) return null; }
      else { a = R.i(101, 109); b = R.i(91, 99); }
      const ga = a - 100, gb = b - 100, left = a + gb, right = ga * gb, ans = a * b, H = left * 100;
      const desc = (v, g) => v + ' is ' + Math.abs(g) + (g < 0 ? ' below' : ' above') + ' 100';
      const leftE = a + (gb < 0 ? M + (-gb) : ' + ' + gb);
      return { text: 'What is ' + B(a + ' × ' + b) + '?', ans,
        how: [desc(a, ga) + ', and ' + desc(b, gb) + '.',
          (gb < 0 ? 'Take ' + b + '’s gap off ' + a : 'Add ' + b + '’s gap to ' + a) + ': ' + leftE + ' = ' + left + '. That is ' + left + ' hundreds: ' + num(H) + '.',
          right > 0 ? 'Multiply the gaps: ' + Math.abs(ga) + ' × ' + Math.abs(gb) + ' = ' + right + '. ' + num(H) + ' + ' + right + ' = ' + B(num(ans)) + '.'
            : 'Multiply the gaps: one is above and one below, so ' + ng(ga) + ' × ' + ng(gb) + ' = ' + num(right) + '. ' + num(H) + M + (-right) + ' = ' + B(num(ans)) + '.'],
        steps: [st('What is ' + B(leftE) + '?', left), st('Multiply the gaps: ' + B(ng(ga) + ' × ' + ng(gb)) + ' = ?', right), st(B(num(H) + (right < 0 ? M + (-right) : ' + ' + right)) + ' = ?', ans)],
        traps: TR([tr(H, 'm_near100', 'You have the hundreds. Now ' + (right > 0 ? 'add' : 'take away') + ' the gaps multiplied.'),
          tr(H - right, 'n_intmul', right > 0 ? 'Both gaps are on the same side of 100, so their product is added.' : 'Above times below is negative, so the gap product is taken away.'),
          right > 0 && right < 10 ? tr(left * 10 + right, 'n_place', 'The gap product fills the last two places: ' + left + ' then 0' + right + '.') : null]) };
    } },

  { id: 'm_diffsq', s: 'mul', g: 8, title: 'Around a middle: 47 × 53', pre: ['w_exp'],
    tip: '47 and 53 are both 3 away from 50. So 47 × 53 = 50² − 3² = 2,500 − 9 = 2,491.',
    gen(d, R) {
      let m, k;
      if (d === 0) { m = 10 * R.i(2, 9); k = R.i(1, 3); }
      else if (d === 1) { m = R.chance(.25) ? R.pick([25, 35, 45]) : 10 * R.i(2, 9); k = R.i(2, 6); }
      else { m = R.pick([100, 100, 200, 300, 110, 120, 150, 250]); k = R.i(2, 9); }
      const sw = R.chance(.5), x = sw ? m + k : m - k, y = sw ? m - k : m + k, M2 = m * m, K2 = k * k, ans = M2 - K2;
      const note = m % 10 === 5 ? ' (' + sq(m) + ' by the squares-ending-in-5 trick)' : '';
      return { text: 'What is ' + B(x + ' × ' + y) + '?', ans,
        how: [x + ' and ' + y + ' are both ' + k + ' away from ' + m + ', the middle.',
          'So ' + x + ' × ' + y + ' = ' + sq(m) + M + sq(k) + ' = ' + num(M2) + M + K2 + note + '.', num(M2) + M + K2 + ' = ' + B(num(ans)) + '.'],
        steps: [st('What number is exactly in the middle of ' + B(x) + ' and ' + B(y) + '?', m), st(B(sq(m)) + ' = ?', M2), st(B(num(M2) + M + sq(k)) + ' = ?', ans)],
        traps: TR([tr(M2, 'm_diffsq', 'That is ' + sq(m) + '. Now take away ' + sq(k) + '.'), tr(M2 + K2, 'm_diffsq', 'The product is a little less than ' + sq(m) + ', so take ' + sq(k) + ' away.'),
          tr(M2 - k, 'w_exp', 'Square the distance too: ' + sq(k) + ' = ' + k + ' × ' + k + '.'), tr(M2 - 2 * k, 'w_exp', 'Squared means ' + k + ' × ' + k + ', not ' + k + ' × 2.')]) };
    } },
]);

/* ======================= Number Sense (5–7) ======================= */
const PLACE = ['ones', 'tenths', 'hundredths', 'thousandths'], PLACE1 = ['whole number', 'tenth', 'hundredth', 'thousandth'];
const why = (s, w) => s + '   (' + w + ')';   /* a written line with its reason */

C.defs([
  { id: 'n_decplace', s: 'count', g: 5, title: 'Tenths, hundredths, thousandths', pre: ['f_dec10'],
    tip: 'After the point come tenths, then hundredths, then thousandths. In 3.472 the 7 is worth 7 hundredths = 0.07.',
    gen(d, R) {
      if (d === 0 || (d === 1 && R.chance(.5))) {
        const k = d === 0 ? 2 : 3, ds = [R.i(1, 9)]; for (let i = 0; i < k; i++) ds.push(R.i(1, 9));
        if (new Set(ds).size < ds.length) return null;
        const pos = d === 0 ? R.pick([1, 2]) : R.pick([2, 3]), dig = ds[pos], x = Number(ds.join('')) / Math.pow(10, k), ans = dig / Math.pow(10, pos);
        return { text: 'In ' + B(num(x)) + ', what is the ' + B(dig) + ' worth? Type it as a decimal.', ans,
          how: ['After the point the places go tenths, hundredths, thousandths.', 'The ' + dig + ' is ' + pos + (pos === 1 ? ' place' : ' places') + ' after the point: the ' + PLACE[pos] + ' place. So it is worth ' + dig + ' ' + (dig === 1 ? PLACE1[pos] : PLACE[pos]) + ' = ' + B(num(ans)) + '.'],
          steps: [st('In ' + num(x) + ', how many places after the point is the ' + B(dig) + '?', pos), st('Write ' + dig + ' ' + (dig === 1 ? PLACE1[pos] : PLACE[pos]) + ' as a decimal.', ans)],
          traps: TR([tr(dig, 'n_decplace', 'That is the digit. What is it worth in its place?'), tr(dig / Math.pow(10, pos === 1 ? 2 : pos - 1), 'n_decplace', 'Count the places after the point: tenths first, then hundredths, then thousandths.'),
            tr(dig / Math.pow(10, pos + 1), 'n_decplace', 'Count the places after the point again: the first place is tenths.'), tr(dig * Math.pow(10, pos), 'n_place', 'Digits after the point are worth less than 1.')]) };
      }
      if (d === 1) {
        const w = R.i(1, 9), a = R.chance(.25) ? 0 : R.i(1, 9), b = a && R.chance(.4) ? 0 : R.i(1, 9), c = R.i(1, 9);
        const X = w * 1000 + a * 100 + b * 10 + c, ans = X / 1000, parts = [num(w)];
        if (a) parts.push(num(a / 10)); if (b) parts.push(num(b / 100)); parts.push(num(c / 1000));
        const gap = !a ? 'tenths' : !b ? 'hundredths' : '';
        return { text: 'Write this as one decimal: ' + B(parts.join(' + ')), ans,
          how: ['Put each digit in its place: ' + w + ' ones, ' + a + ' tenths, ' + b + ' hundredths, ' + c + ' thousandths.', (gap ? 'There are no ' + gap + ', so a 0 holds that place. ' : '') + 'The number is ' + B(num(ans)) + '.'],
          steps: [st('Write ' + parts.join(' + ') + ' as one decimal. Which digit goes in the hundredths place?', b), st('Now write ' + parts.join(' + ') + ' as one decimal.', ans)],
          traps: TR([gap ? tr(Number(String(w) + '.' + [a, b, c].filter(v => v).join('')), 'n_place', 'An empty place still needs a 0 to hold it, or the other digits slide into the wrong places.') : null,
            tr(w + (a * 100 + b * 10 + c) / 100, 'n_decplace', 'Thousandths are the third place after the point.'), tr(a * 100 + b * 10 + c + w, 'n_decplace', 'These parts are tenths, hundredths and thousandths, not whole numbers.')]) };
      }
      if (R.chance(.55)) {
        const ds = [R.i(1, 9), R.i(0, 9), R.i(0, 9), R.i(0, 9)], pos = R.pick([1, 2, 3]), up = R.chance(.6);
        ds[pos] = up ? 9 : 0; if (!up && ds[pos - 1] === 0) ds[pos - 1] = R.i(1, 9); if (up && ds[pos - 1] === 9) ds[pos - 1] = R.i(0, 8);
        if (ds[3] === 0 && pos !== 3) ds[3] = R.i(1, 9);
        const X = Number(ds.join('')), s = Math.pow(10, 3 - pos), x = X / 1000, step = s / 1000, A = up ? X + s : X - s, ans = A / 1000;
        return { text: 'What number is ' + B(num(step) + (up ? ' more' : ' less')) + ' than ' + B(num(x)) + '?', ans,
          how: [num(step) + ' is 1 ' + PLACE1[pos] + ', so only the ' + PLACE[pos] + ' place changes. The ' + PLACE[pos] + ' digit of ' + num(x) + ' is ' + ds[pos] + '.',
            up ? '9 + 1 = 10 ' + PLACE[pos] + ': write 0 there and carry 1 to the ' + PLACE[pos - 1] + '.' : '0 − 1 needs a borrow: take 1 from the ' + PLACE[pos - 1] + ', so the ' + PLACE[pos] + ' digit becomes 9.',
            'So the answer is ' + B(num(ans)) + '.'],
          steps: [st('What is the ' + PLACE[pos] + ' digit of ' + B(num(x)) + '?', ds[pos]), st('Now ' + (up ? 'add ' + num(step) + ' to ' : 'take ' + num(step) + ' away from ') + num(x) + '. What is the new number?', ans)],
          traps: TR([tr((up ? X + 10 * s : X - 10 * s) / 1000, 'n_decplace', num(step) + ' is one ' + PLACE1[pos] + '. Change the ' + PLACE[pos] + ' place.'),
            s > 1 ? tr((up ? X + s / 10 : X - s / 10) / 1000, 'n_decplace', num(step) + ' is one ' + PLACE1[pos] + '. Change the ' + PLACE[pos] + ' place.') : null,
            up ? tr((X - 9 * s) / 1000, 'a_regroup', '9 + 1 makes 10, so carry the 1 to the next place.') : tr((X + 9 * s) / 1000, 'a_borrow', 'You can’t take 1 from 0. Borrow from the next place first.')]) };
      }
      const k = R.pick([1, 2, 3]), w = R.i(1, 9), rest = R.i(Math.pow(10, k - 1), Math.pow(10, k) - 1);
      if (rest % 10 === 0) return null;
      const X = w * Math.pow(10, k) + rest, x = X / Math.pow(10, k);
      return { text: 'How many ' + B(PLACE[k]) + ' are in ' + B(num(x)) + '?', ans: X,
        how: ['1 whole is ' + num(Math.pow(10, k)) + ' ' + PLACE[k] + ', so ' + w + ' wholes are ' + num(w * Math.pow(10, k)) + ' ' + PLACE[k] + '.',
          'Add the ' + num(rest) + ' ' + PLACE[k] + ' after the point: ' + num(w * Math.pow(10, k)) + ' + ' + num(rest) + ' = ' + B(num(X)) + '. (Move the point ' + k + ' place' + (k > 1 ? 's' : '') + ' right.)'],
        steps: [st('How many ' + PLACE[k] + ' are in ' + w + ' wholes?', w * Math.pow(10, k)), st('Now add the ' + num(rest) + ' ' + (rest === 1 ? PLACE1[k] : PLACE[k]) + ' after the point. How many ' + PLACE[k] + ' are in ' + num(x) + '?', X)],
        traps: TR([tr(rest, 'n_decplace', 'The wholes count too: each whole is ' + num(Math.pow(10, k)) + ' ' + PLACE[k] + '.'), k > 1 ? tr(X / 10, 'n_times10', 'Move the point ' + k + ' places, one for each place after it.') : null, tr(X * 10, 'n_times10', 'Move the point only ' + k + ' place' + (k > 1 ? 's' : '') + '.')]) };
    } },

  { id: 'n_decround', s: 'count', g: 5, title: 'Round decimals', pre: [],
    tip: 'Look one place past where you round. 5 or more rounds up, less than 5 rounds down. 3.47 to the nearest tenth: the 7 rounds up, so 3.5.',
    gen(d, R) {
      let k, X;
      if (d === 0) { k = 1; X = R.i(1, 40) * 10 + R.i(1, 9); }
      else if (d === 1) { k = 2; X = R.i(1, 20) * 100 + R.i(0, 9) * 10 + R.i(1, 9); }
      else if (R.chance(.5)) { k = 2; X = R.i(1, 20) * 100 + 90 + R.i(5, 9); }
      else { k = 3; X = R.i(0, 9) * 1000 + R.i(0, 9) * 100 + (R.chance(.4) ? 90 + R.i(5, 9) : R.i(0, 9) * 10 + R.i(1, 9)); if (X < 100) return null; }
      const t = k - 1, unit = Math.pow(10, t), x = X / Math.pow(10, k), lowI = Math.floor(X / 10), nx = X % 10, up = nx >= 5, ansI = up ? lowI + 1 : lowI, ans = ansI / unit;
      const f = v => (v / unit).toFixed(t), lo = f(lowI), hi = f(lowI + 1), shown = f(ansI);
      const vis = d < 2 ? numLineSVG(lowI / unit, (lowI + 1) / unit, 1 / (unit * 10), [{ v: x, t: num(x) }], 1 / unit) : '';
      const rolled = up && t >= 1 && lowI % 10 === 9;
      return { text: 'Round ' + B(num(x)) + ' to the nearest ' + B(PLACE1[t]) + '.', ans, vis,
        how: ['Look one place past the ' + PLACE1[t] + 's: the ' + PLACE[k] + ' digit is ' + nx + '.',
          num(x) + ' is between ' + lo + ' and ' + hi + '. ' + nx + (up ? ' is 5 or more, so round up' : ' is less than 5, so round down') + ': ' + B(shown) + (shown !== num(ans) ? ', which is ' + num(ans) + '.' : '.')],
        steps: [st(num(x) + ' is between which two ' + PLACE1[t] + 's? Type the smaller one.', lowI / unit), st('The ' + PLACE[k] + ' digit is ' + nx + '. Round ' + B(num(x)) + ' to the nearest ' + PLACE1[t] + '.', ans)],
        traps: TR([tr((up ? lowI : lowI + 1) / unit, 'n_decround', 'Look at the ' + PLACE[k] + ' digit: 5 or more rounds up, less than 5 rounds down.'),
          t >= 1 ? tr(Math.round(X / 100) / Math.pow(10, t - 1), 'n_decplace', 'Round to the ' + PLACE1[t] + 's place, ' + t + ' place' + (t > 1 ? 's' : '') + ' after the point.') : null,
          t >= 1 ? tr(lowI / unit, 'n_decround', 'Rounding is not just chopping off the last digit. Check whether it rounds up.') : null,
          rolled ? tr((lowI - 9) / unit + 10 / (unit * 10), 'a_regroup', 'When the 9 goes up by 1 it makes 10, which carries 1 to the place on its left.') : null]) };
    } },

  { id: 'n_neg', s: 'count', g: 6, title: 'Negative numbers on the line', pre: [],
    tip: 'Numbers below zero are negative. To find the distance from −4 to 3, count to zero, then on: 4 + 3 = 7.',
    gen(d, R) {
      const line = (pts) => numLineSVG(-10, 10, 1, pts.map(v => ({ v, t: num(v) })), 5);
      if (d === 0) {
        const a = -R.i(1, 9), b = R.i(1, 9), rev = R.chance(.4), from = rev ? b : a, to = rev ? a : b, ans = b - a;
        return { text: 'How many steps is it from ' + B(num(from)) + ' to ' + B(num(to)) + ' on the number line?', ans, vis: line([a, b]),
          how: ['Count to zero, then on. From ' + num(a) + ' to 0 is ' + (-a) + (a === -1 ? ' step.' : ' steps.'), 'From 0 to ' + b + ' is ' + b + (b === 1 ? ' step.' : ' steps.'), (-a) + ' + ' + b + ' = ' + B(ans) + '.'],
          steps: [st('How many steps is it from ' + B(num(a)) + ' to 0?', -a), st('How many steps is it from 0 to ' + B(b) + '?', b), st('Add them: ' + B((-a) + ' + ' + b) + ' = ?', ans)],
          traps: TR([tr(Math.abs(b + a), 'n_neg', 'The numbers are on opposite sides of zero, so the two parts add.'), tr(ans + 1, 'n_neg', 'Count the jumps, not the marks.')]) };
      }
      const kind = d === 1 ? R.i(0, 3) : R.i(4, 6);
      if (kind === 0 || kind === 4) {
        const lo = kind === 0 ? -R.i(3, 15) : -R.i(12, 90), hi = kind === 0 ? R.i(2, 20) : R.i(15, 300), ans = hi - lo;
        const text = kind === 0 ? 'At dawn it was ' + B(num(lo) + DEG) + '. By noon it was ' + B(hi + DEG) + '. How many degrees did it warm up?' : 'Sea level is 0 m. A diver is at ' + B(num(lo) + ' m') + '. A bird flies at ' + B(hi + ' m') + '. How many meters apart are the diver and the bird?';
        return { text, ans, unit: kind === 0 ? DEG : 'm', vis: kind === 0 ? numLineSVG(-20, 20, 1, [{ v: lo, t: num(lo) }, { v: hi, t: num(hi) }], 5) : '',
          how: ['Count up to zero first: ' + num(lo) + ' to 0 is ' + (-lo) + '.', 'Then 0 to ' + hi + ' is ' + hi + '. ' + (-lo) + ' + ' + hi + ' = ' + B(ans) + '.'],
          steps: [st('How far is it from ' + B(num(lo)) + ' to 0?', -lo), st('How far is it from 0 to ' + B(hi) + '?', hi), st('Add them: ' + B((-lo) + ' + ' + hi) + ' = ?', ans)],
          traps: TR([tr(Math.abs(hi + lo), 'n_neg', 'They are on opposite sides of zero, so the two parts add.'), tr(hi, 'n_neg', 'Count the part below zero too.')]) };
      }
      if (kind === 1) {
        const a = -R.i(10, 30), b = a + R.i(3, 9), ans = b - a;
        return { text: 'How far apart are ' + B(num(a)) + ' and ' + B(num(b)) + ' on the number line?', ans, vis: numLineSVG(-30, 0, 1, [{ v: a, t: num(a) }, { v: b, t: num(b) }], 5),
          how: ['Both are below zero: ' + num(a) + ' is ' + (-a) + ' below and ' + num(b) + ' is ' + (-b) + ' below.', 'On the same side, take away: ' + (-a) + M + (-b) + ' = ' + B(ans) + '.'],
          steps: [st('How far below zero is ' + B(num(a)) + '?', -a), st('How far below zero is ' + B(num(b)) + '?', -b), st('How far apart are ' + B(num(a)) + ' and ' + B(num(b)) + '?', ans)],
          traps: TR([tr(-a - b, 'n_neg', 'Both are on the same side of zero, so take away the distances.'), tr(-ans, 'n_neg', 'A distance is never negative.')]) };
      }
      if (kind === 2 || kind === 6) {
        const s = kind === 2 ? R.i(-5, 6) : -R.i(20, 90), k = kind === 2 ? R.i(4, 12) : R.i(5, 120), down = kind === 2, ans = down ? s - k : s + k;
        if (down && s >= k) return null; if (!down && ans === 0) return null;
        const how = down ? (s > 0 ? ['Go down ' + s + ' to reach 0.', 'Then ' + (k - s) + ' more below zero: ' + B(num(ans)) + '.'] : ['Going down from ' + num(s) + ' moves further below zero.', (-s) + ' + ' + k + ' = ' + (-ans) + ' below zero: ' + B(num(ans)) + '.'])
          : (k < -s ? ['Going up from ' + num(s) + ' moves toward zero.', 'You are still ' + (-s) + M + k + ' = ' + (-ans) + ' below zero: ' + B(num(ans)) + '.'] : ['Go up ' + (-s) + ' to reach 0.', 'Then ' + (k + s) + ' more: ' + B(num(ans)) + '.']);
        return { text: 'What number is ' + B(k + (down ? ' less' : ' more')) + ' than ' + B(num(s)) + '?', ans, how, vis: down ? line([s]) : '',
          steps: [st(down ? (s > 0 ? 'How far is it from ' + s + ' down to 0?' : 'How far below zero is ' + B(num(s)) + '?') : 'How far below zero is ' + B(num(s)) + '?', down && s > 0 ? s : -s), st('Start at ' + num(s) + ' and go ' + (down ? 'down ' : 'up ') + k + '. Where do you end up?', ans)],
          traps: TR([tr(down ? s + k : s - k, 'n_neg', down ? 'Less means move down the line, to the left.' : 'More means move up the line, to the right.'), tr(-ans, 'n_intadd', 'Check the sign: which side of zero do you end on?')]) };
      }
      if (kind === 3) {
        let vals; do { vals = [0, 1, 2, 3, 4].map(() => R.i(-12, 12)); } while (new Set(vals).size < 5 || vals.filter(v => v < 0).length < 2 || vals.filter(v => v > 0).length < 1);
        const sorted = vals.slice().sort((a, b) => a - b), ans = sorted[1], bySize = vals.slice().sort((a, b) => Math.abs(a) - Math.abs(b));
        return { text: 'Put these in order from least to greatest: ' + B(vals.map(num).join(',  ')) + '. Which number is ' + B('second') + '?', ans,
          how: ['The most negative number is the least. Negatives come first, the bigger the size the smaller the number.', 'In order: ' + sorted.map(num).join(', ') + '. The second is ' + B(num(ans)) + '.'],
          steps: [st('Which of these numbers is the least? ' + B(vals.map(num).join(',  ')), sorted[0]), st(num(sorted[0]) + ' is the least. Which of these numbers comes next? ' + B(vals.map(num).join(',  ')), ans)],
          traps: TR([tr(bySize[1], 'n_neg', 'For negatives, a bigger size means a smaller number: ' + MINUS + '9 is less than ' + MINUS + '2.'), tr(sorted[3], 'n_neg', 'Least to greatest starts with the most negative number.')]) };
      }
      let a, b; do { a = -R.i(2, 30); b = R.i(2, 30); } while ((a + b) % 2 !== 0 || a + b === 0);
      const D = b - a, ans = (a + b) / 2;
      return { text: 'What number is exactly halfway between ' + B(num(a)) + ' and ' + B(num(b)) + '?', ans,
        how: ['The distance from ' + num(a) + ' to ' + b + ' is ' + (-a) + ' + ' + b + ' = ' + D + '.', 'Half of that is ' + D / 2 + '. Go ' + D / 2 + ' up from ' + num(a) + ': ' + B(num(ans)) + '.'],
        steps: [st('How far is it from ' + B(num(a)) + ' to ' + B(b) + '?', D), st('What is half of ' + D + '?', D / 2), st('Start at ' + num(a) + ' and go up ' + D / 2 + '. Where do you end up?', ans)],
        traps: TR([tr(a + b, 'n_neg', 'Find the distance, then go half of it from one end.'), tr(D / 2, 'n_neg', 'That is half the distance. Now start at ' + num(a) + ' and go that far.'), tr(-ans, 'n_intadd', 'Check the sign: is the halfway point above or below zero?')]) };
    } },

  { id: 'n_abs', s: 'count', g: 6, title: 'Absolute value', pre: [],
    tip: 'The absolute value |−7| is the distance from 0, so it is never negative: |−7| = 7 and |7| = 7. Work inside the bars first.',
    gen(d, R) {
      const bar = v => '|' + v + '|';
      if (d === 0) {
        const a = -R.i(2, 20), b = R.i(1, 20), plus = R.chance(.6), A = -a, ans = plus ? A + b : A - b;
        if (!plus && A <= b) return null;
        const x = R.chance(.5) ? [a, b] : [b, a], expr = plus ? bar(num(x[0])) + ' + ' + bar(num(x[1])) : bar(num(a)) + M + bar(num(b));
        return { text: 'What is ' + B(expr) + '?', ans, vis: numLineSVG(-20, 20, 1, [{ v: a, t: num(a) }, { v: b, t: num(b) }], 5),
          how: [bar(num(a)) + ' = ' + A + ' (' + num(a) + ' is ' + A + ' steps from 0) and ' + bar(b) + ' = ' + b + '.', plus ? A + ' + ' + b + ' = ' + B(ans) + '.' : A + M + b + ' = ' + B(ans) + '.'],
          steps: [st('What is ' + B(bar(num(a))) + '?', A), st('Now ' + (plus ? 'add' : 'take away') + '. What is ' + B(expr) + '?', ans)],
          traps: TR([tr(plus ? a + b : a - b, 'n_abs', 'Absolute value is a distance, so ' + bar(num(a)) + ' is ' + A + ', not ' + num(a) + '.'), tr(plus ? A - b : A + b, 'n_abs', 'Check: ' + (plus ? 'add' : 'take away') + ' the two distances.')]) };
      }
      const kind = d === 1 ? R.i(0, 1) : R.i(2, 3);
      if (kind === 0 || kind === 2) {
        let a, b;
        if (kind === 0) { if (R.chance(.5)) { a = R.i(1, 9); b = a + R.i(3, 12); } else { a = -R.i(5, 20); b = -R.i(1, 20); if (a === -b) return null; } }
        else { a = -R.i(3, 30); b = R.i(3, 30); if (R.chance(.5)) [a, b] = [b, a]; }
        const op = kind === 0 && a < 0 ? '+' : '−', c = op === '+' ? a + b : a - b, ans = Math.abs(c);
        if (c === 0) return null;
        const inside = num(a) + (op === '+' ? ' + ' + ng(b) : M + ng(b));
        return { text: 'What is ' + B(bar(inside)) + '?', ans,
          how: ['Work inside the bars first: ' + inside + ' = ' + num(c) + '.', bar(num(c)) + ' is its distance from 0: ' + B(ans) + '.'],
          steps: [st('Inside the bars: ' + B(inside) + ' = ?', c), st('What is ' + B(bar(num(c))) + '?', ans)],
          traps: TR([tr(c, 'n_abs', 'Absolute value is a distance, so it is never negative.'), tr(Math.abs(Math.abs(a) - Math.abs(b)), op === '+' ? 'n_intadd' : 'n_intsub', 'Work inside the bars first, minding the signs: ' + inside + '.'),
            tr(Math.abs(a) + Math.abs(b), op === '+' ? 'n_intadd' : 'n_intsub', 'Work inside the bars first, minding the signs: ' + inside + '.')]) };
      }
      if (kind === 1) {
        const a = -R.i(2, 15), b = -R.i(2, 15), ans = Math.abs(a) * Math.abs(b) ;
        return { text: 'What is ' + B(bar(num(a)) + ' × ' + bar(num(b))) + '?', ans,
          how: [bar(num(a)) + ' = ' + (-a) + ' and ' + bar(num(b)) + ' = ' + (-b) + '.', (-a) + ' × ' + (-b) + ' = ' + B(ans) + '.'],
          steps: [st('What is ' + B(bar(num(a))) + '?', -a), st('What is ' + B(bar(num(b))) + '?', -b), st('Multiply them: ' + B((-a) + ' × ' + (-b)) + ' = ?', ans)],
          traps: TR([tr(-ans, 'n_abs', 'Each absolute value is a distance, so both are positive.'), tr(-a - b, 'n_abs', 'Multiply the two distances.')]) };
      }
      const k = R.i(3, 15), strict = R.chance(.5), ans = strict ? 2 * k - 1 : 2 * k + 1, top = strict ? k - 1 : k;
      return { text: 'Integers can be positive, negative or 0. How many integers x have ' + B('|x| ' + (strict ? '&lt; ' : '≤ ') + k) + '?', ans,
        how: ['They are the integers from ' + MINUS + top + ' to ' + top + '.', top + ' negatives, ' + top + ' positives and 0: ' + top + ' + ' + top + ' + 1 = ' + B(ans) + '.'],
        steps: [st('What is the biggest integer x with ' + B('|x| ' + (strict ? '&lt; ' : '≤ ') + k) + '?', top), st('Count the integers from ' + MINUS + top + ' to ' + top + '. How many are there?', ans)],
        traps: TR([tr(2 * top, 'n_abs', 'Don’t forget 0: |0| = 0 works too.'), tr(top + 1, 'n_abs', 'Negative numbers count too: |' + MINUS + '2| = 2.'), tr(strict ? 2 * k + 1 : 2 * k - 1, 'n_abs', strict ? '|x| &lt; ' + k + ' leaves out ' + k + ' and ' + MINUS + k + '.' : '|x| ≤ ' + k + ' includes ' + k + ' and ' + MINUS + k + '.')]) };
    } },

  { id: 'n_intadd', s: 'count', g: 7, title: 'Add positive and negative numbers', pre: [], paper: true,
    tip: 'Same signs: add the sizes and keep the sign (−3 + −5 = −8). Different signs: take away the sizes, and the bigger size wins (−9 + 4 = −5).',
    gen(d, R) {
      if (d < 2) {
        const lim = d === 0 ? 9 : 60, lo = d === 0 ? 1 : 5;
        const a = R.chance(.5) ? -R.i(lo, lim) : R.i(lo, lim), b = a > 0 || R.chance(.5) ? -R.i(lo, lim) : R.i(lo, lim);
        const expr = num(a) + ' + ' + ng(b), ans = a + b, A = Math.abs(a), Bb = Math.abs(b);
        if (a > 0 && b > 0) return null;
        if (a < 0 && b < 0) return { text: 'Work it out: ' + B(expr), ans,
          how: [why('Sizes: ' + A + ' + ' + Bb + ' = ' + (A + Bb), 'same signs, so add the sizes'), why(expr + ' = ' + B(num(ans)), 'both negative, so the answer is negative')],
          steps: [st('Add the sizes: ' + B(A + ' + ' + Bb) + ' = ?', A + Bb), st('Both are negative. What is ' + B(expr) + '?', ans)],
          traps: TR([tr(A + Bb, 'n_intadd', 'Both numbers are negative, so the answer is negative too.'), tr(-Math.abs(A - Bb), 'n_intadd', 'The signs are the same, so add the sizes.')]) };
        if (A === Bb) return null;
        const big = Math.max(A, Bb), small = Math.min(A, Bb), negWins = (a < 0 ? A : Bb) > (a < 0 ? Bb : A);
        return { text: 'Work it out: ' + B(expr), ans,
          how: [why('Sizes: ' + big + M + small + ' = ' + (big - small), 'different signs, so take away'), why(expr + ' = ' + B(num(ans)), 'the bigger size, ' + big + ', is ' + (negWins ? 'negative' : 'positive'))],
          steps: [st('Take away the sizes: ' + B(big + M + small) + ' = ?', big - small), st('The bigger size decides the sign. What is ' + B(expr) + '?', ans)],
          traps: TR([tr(-ans, 'n_intadd', 'The sign comes from the number with the bigger size, ' + big + '.'), tr(negWins ? -(A + Bb) : A + Bb, 'n_intadd', 'The signs are different, so take the sizes away instead of adding them.')]) };
      }
      if (R.chance(.5)) {
        let xs; do { xs = [0, 1, 2].map(() => (R.chance(.5) ? -1 : 1) * R.i(5, 60)); } while (xs.every(v => v > 0) || xs.every(v => v < 0));
        const negs = xs.filter(v => v < 0), poss = xs.filter(v => v > 0), N = negs.reduce((s, v) => s + v, 0), P = poss.reduce((s, v) => s + v, 0), ans = N + P;
        const expr = num(xs[0]) + ' + ' + ng(xs[1]) + ' + ' + ng(xs[2]);
        const how = [], steps = [];
        if (negs.length > 1) { how.push(why('Negatives: ' + negs.map((v, i) => (i ? ng(v) : num(v))).join(' + ') + ' = ' + num(N), 'add the sizes, keep the minus')); steps.push(st('Add the negatives: ' + B(negs.map(ng).join(' + ')) + ' = ?', N)); }
        if (poss.length > 1) { how.push('Positives: ' + poss.join(' + ') + ' = ' + P); steps.push(st('Add the positives: ' + B(poss.join(' + ')) + ' = ?', P)); }
        how.push(why(num(N) + ' + ' + P + ' = ' + B(num(ans)), 'different signs: ' + Math.max(-N, P) + M + Math.min(-N, P) + ', and the bigger size is ' + (-N > P ? 'negative' : 'positive')));
        steps.push(st(B(num(N) + ' + ' + P) + ' = ?', ans));
        return { text: 'Work it out: ' + B(expr), ans, how, steps,
          traps: TR([tr(-ans, 'n_intadd', 'Check the sign at the end: which is bigger, the negatives or the positives?'), tr(xs.reduce((s, v) => s + Math.abs(v), 0), 'n_intadd', 'Negative numbers pull the total down. Group them, then take away.'),
            tr(P - N, 'n_intadd', 'The negatives make ' + num(N) + ', so take ' + (-N) + ' away from ' + P + '.')]) };
      }
      const negA = R.chance(.5), a = negA ? -R.i(5, 40) : R.i(5, 40), c = negA ? R.i(3, 40) : -R.i(3, 40), ans = c - a;
      return { text: 'Solve: ' + B(num(a) + ' + ? = ' + num(c)), ans,
        how: [num(a) + ' + ? = ' + num(c), '? = ' + num(c) + M + ng(a), negA ? why('? = ' + num(c) + ' + ' + (-a), 'take away a negative: add its opposite') : why('? = ' + num(c) + ' + ' + ng(-a), 'take away ' + a + ': add ' + num(-a)), '? = ' + B(num(ans))],
        steps: [st('Undo the adding: ? = ' + num(c) + M + ng(a) + '. Taking away ' + num(a) + ' is the same as adding what number?', -a), st('What is ' + B(num(c) + ' + ' + ng(-a)) + '?', ans)],
        traps: TR([tr(c + a, 'n_intsub', 'To undo adding ' + ng(a) + ', take it away: ' + num(c) + M + ng(a) + '.'), tr(-ans, 'n_intadd', 'Check the sign: from ' + num(a) + ', which way do you go to reach ' + num(c) + '?'), tr(Math.abs(Math.abs(c) - Math.abs(a)), 'n_neg', 'The path crosses zero, so the two parts add: ' + Math.abs(a) + ' + ' + Math.abs(c) + '.')]) };
    } },

  { id: 'n_intsub', s: 'count', g: 7, title: 'Subtract: add the opposite', pre: [], paper: true,
    tip: 'Taking away a number is adding its opposite. 4 − (−6) = 4 + 6 = 10, and −2 − 5 = −2 + (−5) = −7.',
    gen(d, R) {
      if (d < 2 || R.chance(.6)) {
        const lim = d === 0 ? 9 : d === 1 ? 40 : 150, lo = d === 2 ? 20 : 1;
        const a = (R.chance(.5) ? -1 : 1) * R.i(lo, lim), b = (d === 2 || R.chance(.5) ? -1 : 1) * R.i(lo, lim);
        if ((b > 0 && a > b) || a === b) return null;
        const expr = num(a) + M + ng(b), opp = -b, ans = a - b, addE = num(a) + ' + ' + ng(opp);
        return { text: 'Work it out: ' + B(expr), ans,
          how: [expr, why('= ' + addE, 'take away ' + ng(b) + ': add its opposite, ' + num(opp)), '= ' + B(num(ans))],
          steps: [st('Change it to adding: ' + B(expr) + ' = ' + num(a) + ' + ?', opp), st('What is ' + B(addE) + '?', ans)],
          traps: TR([tr(a + b, 'n_intsub', 'Taking away ' + ng(b) + ' is adding ' + num(opp) + '. Flip the sign of the second number.'), tr(-ans, 'n_intadd', 'Check the sign of ' + addE + '.'),
            tr(b - a, 'n_intsub', 'Order matters: start at ' + num(a) + '.')]) };
      }
      const a = (R.chance(.5) ? -1 : 1) * R.i(5, 60), c = (R.chance(.5) ? -1 : 1) * R.i(5, 60), ans = a - c;
      if (!ans || a === c) return null;
      return { text: 'Solve: ' + B(num(a) + M + '? = ' + num(c)), ans,
        how: [num(a) + M + '? = ' + num(c), why('? = ' + num(a) + M + ng(c), 'swap the ? and ' + num(c)), why('? = ' + num(a) + ' + ' + ng(-c), 'add the opposite'), '? = ' + B(num(ans))],
        steps: [st('? = ' + num(a) + M + ng(c) + '. Taking away ' + num(c) + ' is the same as adding what number?', -c), st('What is ' + B(num(a) + ' + ' + ng(-c)) + '?', ans)],
        traps: TR([tr(a + c, 'n_intsub', 'The missing number is ' + num(a) + M + ng(c) + '. Taking away ' + ng(c) + ' is adding its opposite.'), tr(-ans, 'n_intadd', 'Check the sign: is ' + num(c) + ' below or above ' + num(a) + '?'), tr(c - a, 'n_intsub', 'Order matters: ' + num(a) + M + '? = ' + num(c) + ' means ? = ' + num(a) + M + ng(c) + '.')]) };
    } },

  { id: 'n_intmul', s: 'count', g: 7, title: 'Times and divide with negatives', pre: ['m_divfam'], paper: true,
    tip: 'Do the sizes, then the sign: one negative makes a negative, two negatives make a positive. (−3) × 4 = −12 and (−6) × (−2) = 12.',
    gen(d, R) {
      const sgnWord = k => k % 2 ? 'odd, so negative' : 'even, so positive';
      if (d === 0 || (d === 1 && R.chance(.5))) {
        const hi = d === 0 ? 9 : 12, x = R.i(2, hi), y = R.i(2, hi), sa = R.chance(.5), sb = !sa || R.chance(.5);
        const a = sa ? -x : x, b = sb ? -y : y, ans = a * b, P = x * y, negs = (sa ? 1 : 0) + (sb ? 1 : 0), expr = ng(a) + ' × ' + ng(b);
        return { text: 'Work it out: ' + B(expr), ans,
          how: ['Sizes: ' + x + ' × ' + y + ' = ' + P, why('Negatives: ' + negs, negs === 1 ? 'one negative makes a negative' : 'two negatives make a positive'), expr + ' = ' + B(num(ans))],
          steps: [st(B(x + ' × ' + y) + ' = ?', P), st('Now find the sign. What is ' + B(expr) + '?', ans)],
          traps: TR([tr(-ans, 'n_intmul', negs === 1 ? 'One negative sign makes the answer negative.' : 'Two negatives make a positive.'), tr(Math.sign(ans) * (P + x), factC(x, y), 'Check the fact ' + x + ' × ' + y + '.'), tr(Math.sign(ans) * (P - y), factC(x, y), 'Check the fact ' + x + ' × ' + y + '.')]) };
      }
      if (d === 1) {
        const q = R.i(2, 9), r = R.i(2, 9), sa = R.chance(.5), sb = !sa || R.chance(.5), A = (sa ? -1 : 1) * q * r, Bv = (sb ? -1 : 1) * q, ans = A / Bv, negs = (sa ? 1 : 0) + (sb ? 1 : 0), expr = num(A) + ' ÷ ' + ng(Bv);
        return { text: 'Work it out: ' + B(expr), ans,
          how: ['Sizes: ' + q * r + ' ÷ ' + q + ' = ' + r + '   (think ' + q + ' × ? = ' + q * r + ')', why('Negatives: ' + negs, negs === 1 ? 'different signs make a negative' : 'two negatives make a positive'), expr + ' = ' + B(num(ans))],
          steps: [st(B(q * r + ' ÷ ' + q) + ' = ?', r), st('Now find the sign. What is ' + B(expr) + '?', ans)],
          traps: TR([tr(-ans, 'n_intmul', 'Dividing follows the same sign rules as times.'), tr(Math.sign(ans) * (r + 1), 'm_divfam', 'Check the fact: ' + q + ' × ? = ' + q * r + '.')]) };
      }
      const kind = R.i(0, 2);
      if (kind === 0) {
        let xs; do { xs = [0, 1, 2].map(() => (R.chance(.55) ? -1 : 1) * R.i(2, 6)); } while (xs.every(v => v > 0));
        const P = xs.reduce((s, v) => s * Math.abs(v), 1), negs = xs.filter(v => v < 0).length, ans = xs[0] * xs[1] * xs[2], expr = xs.map(ng).join(' × ');
        return { text: 'Work it out: ' + B(expr), ans,
          how: ['Sizes: ' + xs.map(Math.abs).join(' × ') + ' = ' + P, why('Negatives: ' + negs, negs === 2 ? 'they pair up, so positive' : negs === 1 ? 'one negative, so negative' : 'a pair cancels and one is left, so negative'), expr + ' = ' + B(num(ans))],
          steps: [st(B(xs.map(Math.abs).join(' × ')) + ' = ?', P), st('How many negative signs are in ' + B(expr) + '?', negs), st('What is ' + B(expr) + '?', ans)],
          traps: TR([tr(-ans, 'n_intmul', 'Count the negative signs: an even number gives a positive, an odd number a negative.')]) };
      }
      if (kind === 1) {
        const [x, e] = R.pick([[2, 3], [2, 4], [2, 5], [3, 3], [3, 4], [4, 3], [5, 3], [2, 6], [10, 3], [10, 4]]), P = Math.pow(x, e), ans = e % 2 ? -P : P;
        return { text: 'Work it out: ' + B(pw('(' + MINUS + x + ')', e)), ans,
          how: [pw('(' + MINUS + x + ')', e) + ' = ' + Array(e).fill('(' + MINUS + x + ')').join(' × '), 'Sizes: ' + pw(x, e) + ' = ' + num(P), why('Negatives: ' + e, sgnWord(e)), pw('(' + MINUS + x + ')', e) + ' = ' + B(num(ans))],
          steps: [st(B(pw(x, e)) + ' = ?', P), st('There are ' + e + ' negative signs. What is ' + B(pw('(' + MINUS + x + ')', e)) + '?', ans)],
          traps: TR([tr(-ans, 'n_intmul', 'Count the negative signs: ' + e + ' is ' + (e % 2 ? 'odd' : 'even') + '.'), tr(-x * e, 'w_exp', 'A power means multiply ' + MINUS + x + ' by itself ' + e + ' times, not ' + MINUS + x + ' × ' + e + '.')]) };
      }
      const e = R.pick([2, 2, 4]), x = e === 2 ? R.i(3, 12) : R.i(2, 5), P = Math.pow(x, e), ans = -P;
      return { text: 'There are no brackets here. Work it out: ' + B(MINUS + pw(x, e)), ans,
        how: [why(MINUS + pw(x, e) + ' = ' + MINUS + '(' + pw(x, e) + ')', 'the power is only on the ' + x + ', not on the minus'), pw(x, e) + ' = ' + num(P), MINUS + pw(x, e) + ' = ' + B(num(ans))],
        steps: [st(B(pw(x, e)) + ' = ?', P), st('Now put the minus in front. What is ' + B(MINUS + pw(x, e)) + '?', ans)],
        traps: TR([tr(P, 'x_order', 'Powers come before the minus sign. Only (' + MINUS + x + ')' + '<sup>' + e + '</sup> would be positive.'), tr(-x * e, 'w_exp', 'A power means repeated multiplying: ' + Array(e).fill(x).join(' × ') + '.')]) };
    } },
]);

/* ======================= Patterns (6–11) ======================= */
const seqB = arr => '<div class="seq">' + arr.map(v => (v == null ? '<span class="sq q">?</span>' : '<span class="sq">' + (typeof v === 'number' ? num(v) : v) + '</span>')).join('') + '</div>';
const ordn = C.ord;
const jumps = (t) => t.slice(1).map((v, i) => v - t[i]);
const sj = v => (v < 0 ? num(v) : '+' + num(v));

C.defs([
  { id: 'p_gauss', s: 'pat', g: 6, title: 'Add a long list: pair the ends', pre: ['a_friendly'],
    tip: '1 + 2 + … + 100: pair the ends. 1 + 100, 2 + 99, 3 + 98 all make 101. There are 50 pairs, so 50 × 101 = 5,050.',
    gen(d, R) {
      let a, b, step = 1;
      if (d === 0) { a = 1; b = 2 * R.i(5, 20); }
      else if (d === 1) { a = 1; b = R.i(41, 100); }
      else if (R.chance(.5)) { a = R.i(11, 60); b = a + R.i(19, 80); }
      else { step = R.pick([2, 5, 10]); a = step; b = step * R.i(10, 40); }
      const N = (b - a) / step + 1, P = a + b, ans = N * P / 2, even = N % 2 === 0, pairs = even ? N / 2 : (N - 1) / 2, mid = P / 2;
      const list = num(a) + ' + ' + num(a + step) + ' + ' + num(a + 2 * step) + ' + … + ' + num(b);
      const countLine = a === 1 ? 'There are ' + N + ' numbers' : step > 1 ? 'There are ' + b + ' ÷ ' + step + ' = ' + N + ' numbers' : 'From ' + a + ' to ' + b + ' there are ' + b + M + a + ' + 1 = ' + N + ' numbers';
      return { text: 'What is ' + B(list) + '?', ans,
        how: ['Pair the ends: ' + a + ' + ' + b + ' = ' + P + ', ' + (a + step) + ' + ' + (b - step) + ' = ' + P + ', … Every pair makes ' + P + '.',
          countLine + (even ? ', so ' + pairs + ' pairs.' : ', an odd count: ' + pairs + ' pairs and the middle number ' + num(mid) + ' with no partner.'),
          even ? pairs + ' × ' + P + ' = ' + B(num(ans)) + '.' : pairs + ' × ' + P + ' + ' + num(mid) + ' = ' + num(pairs * P) + ' + ' + num(mid) + ' = ' + B(num(ans)) + '.'],
        steps: [st('Pair the first number with the last: ' + B(a + ' + ' + b) + ' = ?', P), st('How many numbers are added in ' + B(list) + '?', N),
          st(even ? N + ' numbers make how many pairs?' : 'The middle number has no partner. The other ' + (N - 1) + ' numbers make how many pairs?', pairs), st('Now find the total: ' + B(pairs + ' × ' + P + (even ? '' : ' + ' + num(mid))) + ' = ?', ans)],
        traps: TR([tr(N * P, 'p_gauss', 'Each pair makes ' + P + ', but there are only half as many pairs as numbers.'),
          a !== 1 ? tr((N - 1) * P / 2, 'p_gauss', 'Count the numbers again: add 1, because both ends count.') : null,
          a === 1 ? tr(N * b / 2, 'p_gauss', 'Each pair makes ' + b + ' + 1 = ' + P + ', not ' + b + '.') : null]) };
    } },

  { id: 'p_oddsum', s: 'pat', g: 6, title: 'Odd numbers add up to squares', pre: ['m_squares'],
    tip: 'Add the first few odd numbers and you get a square: 1 + 3 + 5 + 7 = 16 = 4 × 4. The first 10 odd numbers add to 10 × 10 = 100.',
    gen(d, R) {
      if (d === 2 && R.chance(.5)) {
        if (R.chance(.5)) {
          const n = R.i(8, 25), S = n * n;
          return { text: 'You add up the odd numbers 1 + 3 + 5 + … and the total is ' + B(num(S)) + '. How many odd numbers did you add?', ans: n,
            how: ['The first n odd numbers add to n × n.', 'Which number times itself is ' + num(S) + '? ' + n + ' × ' + n + ' = ' + num(S) + ', so ' + B(n) + ' odd numbers.'],
            steps: [st('Which number times itself makes ' + B(num(S)) + '?', n)],
            traps: TR([tr(S / 2, 'p_oddsum', 'The total is a square: n odd numbers add to n × n.'), tr(2 * n - 1, 'p_oddsum', 'That is the last odd number. The question asks how many.')]) };
        }
        const m = R.i(5, 15), n = m + R.i(5, 15), lo = 2 * m + 1, hi = 2 * n - 1, ans = n * n - m * m;
        return { text: 'What is ' + B(lo + ' + ' + (lo + 2) + ' + ' + (lo + 4) + ' + … + ' + hi) + '?', ans,
          how: ['1 + 3 + … + ' + hi + ' is the first ' + n + ' odd numbers: ' + sq(n) + ' = ' + num(n * n) + '.', 'Leave out 1 + 3 + … + ' + (lo - 2) + ', the first ' + m + ' odd numbers: ' + sq(m) + ' = ' + m * m + '.', num(n * n) + M + m * m + ' = ' + B(num(ans)) + '.'],
          steps: [st('How many odd numbers are in 1 + 3 + … + ' + hi + '?', n), st('How many odd numbers are in 1 + 3 + … + ' + (lo - 2) + '?', m), st(B(sq(n) + M + sq(m)) + ' = ?', ans)],
          traps: TR([tr(n * n, 'p_oddsum', 'That is 1 + 3 + … + ' + hi + '. Take away the odd numbers before ' + lo + '.'), tr((n - m) * (n - m), 'p_oddsum', 'This list does not start at 1, so it is not a square by itself.')]) };
      }
      const n = d === 0 ? R.i(3, 10) : R.i(11, 30), L = 2 * n - 1, ans = n * n;
      const list = d === 0 ? Array.from({ length: n }, (_, i) => 2 * i + 1).join(' + ') : '1 + 3 + 5 + … + ' + L;
      return { text: 'What is ' + B(list) + '?', ans, vis: d === 0 ? dotsSVG(n, n) : '',
        how: [d === 0 ? 'Count the odd numbers: there are ' + n + '.' : 'How many odd numbers? (' + L + ' + 1) ÷ 2 = ' + n + '.', 'The first ' + n + ' odd numbers always add to ' + n + ' × ' + n + ': ' + sq(n) + ' = ' + B(ans) + '.'],
        steps: [st('How many odd numbers are added in ' + B(list) + '?', n), st(B(sq(n)) + ' = ?', ans)],
        traps: TR([tr(L * L, 'p_oddsum', 'Square how many odd numbers there are, not the last one.'), tr((n - 1) * (n - 1), 'p_oddsum', 'Count the odd numbers again: (' + L + ' + 1) ÷ 2.'), tr(2 * n, 'w_exp', 'The first ' + n + ' odd numbers add to ' + n + ' × ' + n + ', not ' + n + ' × 2.')]) };
    } },

  { id: 'p_fib', s: 'pat', g: 6, title: 'Add the two before', pre: ['a_split'],
    tip: 'Each number is the sum of the two before it: 2, 3, 5, 8, 13. Going backwards, take away: the number before 8, 13 is 13 − 8 = 5.',
    gen(d, R) {
      const a = d === 0 ? R.i(1, 6) : R.i(1, 12), b = d === 0 ? R.i(1, 6) : R.i(1, 12), t = [a, b];
      while (t.length < 8) t.push(t[t.length - 1] + t[t.length - 2]);
      const lead = 'Each number is the sum of the two before it.';
      if (d === 0 || (d === 1 && R.chance(.4))) {
        const k = d === 0 ? 5 : 6, ans = t[k], p = t[k - 1], q = t[k - 2];
        return { text: lead + ' What comes next?', ans, vis: seqB(t.slice(0, k).concat([null])),
          how: ['Add the last two numbers.', q + ' + ' + p + ' = ' + B(ans) + '.'],
          steps: [st(B(q + ' + ' + p) + ' = ?', ans)],
          traps: TR([tr(p + (p - q), 'p_rule', 'The jumps are not the same each time. Add the two numbers before.'), tr(2 * p, 'p_fib', 'Add the two numbers before, ' + q + ' and ' + p + ', not ' + p + ' twice.')]) };
      }
      if (d === 1) {
        const k = R.i(2, 4), ans = t[k], show = t.slice(0, 6).map((v, i) => (i === k ? null : v));
        return { text: lead + ' What number is missing?', ans, vis: seqB(show),
          how: ['The missing number plus ' + t[k - 1] + ' makes ' + t[k + 1] + ', so take away: ' + t[k + 1] + M + t[k - 1] + ' = ' + ans + '.', 'Check: ' + t[k - 2] + ' + ' + t[k - 1] + ' = ' + B(ans) + '.'],
          steps: [st('Add the two before the gap: ' + B(t[k - 2] + ' + ' + t[k - 1]) + ' = ?', ans)],
          traps: TR([tr(t[k - 1] + (t[k - 1] - t[k - 2]), 'p_rule', 'The jumps are not all the same. Each number is the two before it added.'), tr(t[k + 1] + t[k - 1], 'p_fib', 'The missing number is smaller than ' + t[k + 1] + '. Take away.')]) };
      }
      if (R.chance(.5)) {
        const ans = t[0];
        return { text: lead + ' What is the first number?', ans, vis: seqB([null].concat(t.slice(1, 6))),
          how: ['Work backwards: the first number plus ' + t[1] + ' makes ' + t[2] + '.', t[2] + M + t[1] + ' = ' + B(ans) + '.'],
          steps: [st(B(t[2] + M + t[1]) + ' = ?', ans)],
          traps: TR([tr(t[2] + t[1], 'p_fib', 'Going backwards, take away instead of adding.'), tr(t[1] - (t[2] - t[1]), 'p_rule', 'The jumps are not all the same. Use ? + ' + t[1] + ' = ' + t[2] + '.')]) };
      }
      const ans = t[1], X = t[3] - t[0];
      return { text: lead + ' What is the second number?', ans, vis: seqB([t[0], null, null, t[3]]),
        how: ['Call the second number ?. The third is ' + t[0] + ' + ?, and the fourth is ? + (' + t[0] + ' + ?) = ' + t[0] + ' + 2 × ?.',
          t[0] + ' + 2 × ? = ' + t[3] + ', so 2 × ? = ' + t[3] + M + t[0] + ' = ' + X + '.', '? = ' + X + ' ÷ 2 = ' + B(ans) + '.  Check: ' + t[0] + ', ' + t[1] + ', ' + t[2] + ', ' + t[3] + '.'],
        steps: [st('The fourth number, ' + t[3] + ', is ' + t[0] + ' plus twice the second number. What is ' + B(t[3] + M + t[0]) + '?', X), st('What is half of ' + X + '?', ans)],
        traps: TR([tr(X, 'p_fib', 'That is 2 × ?. Now halve it.'), X % 3 === 0 ? tr(t[0] + X / 3, 'p_rule', 'This is not a same-jump pattern. Each number is the two before it added.') : null]) };
    } },

  { id: 'p_lastdigit', s: 'pat', g: 7, title: 'Last digits of powers repeat', pre: ['w_exp', 'fa_units'],
    tip: 'Last digits of powers repeat. 2, 4, 8, 16, 32: the last digits go 2, 4, 8, 6, 2, … every 4. So 2¹⁰ ends like 2²: in 4.',
    gen(d, R) {
      const CY = { 2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 7: [7, 9, 3, 1], 8: [8, 4, 2, 6], 4: [4, 6], 9: [9, 1] };
      const u = d === 0 ? R.pick([2, 3]) : R.pick([2, 3, 4, 7, 8, 9]), base = d === 2 ? 10 * R.i(1, 12) + u : u;
      const n = d === 0 ? R.i(5, 16) : d === 1 ? R.i(20, 99) : R.i(30, 999), cy = CY[u], L = cy.length, r = n % L, ans = cy[r === 0 ? L - 1 : r - 1];
      const firsts = cy.map((v, i) => pw(u, i + 1)).join(', ');
      return { text: 'What is the last digit of ' + B(pw(base, n)) + '?', ans,
        vis: d === 0 ? seqB([u, u * u, u * u * u, u * u * u * u, u * u * u * u * u, '…']) : '',
        how: [(base !== u ? base + ' ends in ' + u + ', and only the last digit matters. ' : '') + 'The last digits of ' + firsts + ' are ' + cy.join(', ') + ', then they repeat every ' + L + '.',
          n + ' ÷ ' + L + ' = ' + Math.floor(n / L) + ' r ' + r + (r === 0 ? ': no remainder means the end of a cycle.' : ': remainder ' + r + ' means the ' + ordn(r) + ' digit of the cycle.'),
          'So the last digit is ' + B(ans) + '.'],
        steps: [st((base !== u ? base + ' ends in ' + u + '. ' : '') + 'The last digits of the powers of ' + u + ' go ' + cy.join(', ') + ', then repeat. How many digits are in the cycle?', L), st('What is the remainder when ' + n + ' is divided by ' + L + '?', r), st('The cycle is ' + cy.join(', ') + ' and the remainder is ' + r + '. What is the last digit of ' + B(pw(base, n)) + '?', ans)],
        traps: TR([r === 0 ? tr(cy[0], 'p_lastdigit', 'No remainder means a whole number of cycles: you land on the last digit of the cycle.') : tr(cy[r % L], 'p_cycle', 'Remainder ' + r + ' points at the ' + ordn(r) + ' digit of the cycle, counting from the first.'),
          tr(u, 'fa_units', 'The last digit changes with each power. Find the cycle: ' + cy.join(', ') + '.')]) };
    } },

  { id: 'p_cycle', s: 'pat', g: 7, title: 'Repeating cycles: the 100th one', pre: ['m_remain'],
    tip: 'A pattern that repeats every 3: divide by 3 and look at the remainder. 100 ÷ 3 = 33 r 1, so the 100th item is the 1st of the pattern.',
    gen(d, R) {
      const pick = (L) => { let c; do { c = Array.from({ length: L }, () => R.i(1, 9)); } while (new Set(c).size < L); return c; };
      const kind = d === 0 ? 0 : d === 1 ? R.pick([0, 1]) : R.pick([2, 3]);
      if (kind === 0) {
        const L = d === 0 ? R.i(2, 4) : R.i(3, 6), cy = pick(L), k = d === 0 ? R.i(10, 40) : R.i(50, 150), r = k % L, ans = cy[r === 0 ? L - 1 : r - 1];
        return { text: 'This pattern keeps repeating. What is the ' + B(ordn(k)) + ' number?', ans, vis: seqB(cy.concat(cy, ['…'])),
          how: ['The pattern ' + cy.join(', ') + ' repeats every ' + L + '.', k + ' ÷ ' + L + ' = ' + Math.floor(k / L) + ' r ' + r + '.',
            r === 0 ? 'No remainder: the ' + ordn(k) + ' number ends a cycle, so it is the last one, ' + B(ans) + '.' : 'Remainder ' + r + ': the ' + ordn(r) + ' number in the pattern, ' + B(ans) + '.'],
          steps: [st('The pattern ' + cy.join(', ') + ' keeps repeating. How many numbers are in the repeating part?', L), st('What is the remainder when ' + k + ' is divided by ' + L + '?', r), st('The repeating part is ' + cy.join(', ') + ' and the remainder is ' + r + '. What is the ' + ordn(k) + ' number?', ans)],
          traps: TR([r === 0 ? tr(cy[0], 'p_cycle', 'No remainder means a full cycle has just ended, so it is the last number in the pattern.') : tr(cy[r % L], 'p_cycle', 'Remainder ' + r + ' means the ' + ordn(r) + ' number, counting from the first.'),
            tr(cy[(Math.floor(k / L) - 1) % L], 'm_remain', 'Use the remainder, not how many times it goes in.')]) };
      }
      if (kind === 1) {
        const h = R.i(1, 12), k = R.i(25, 200); if (k % 12 === 0) return null;
        const r = k % 12, q = Math.floor(k / 12), wrap = v => ((v - 1) % 12 + 12) % 12 + 1, ans = { h: wrap(h + r), m: 0 };
        return { text: 'It is ' + B(h + ':00') + '. What time will the clock show ' + B(k + ' hours') + ' from now?', ans, type: 'time',
          how: ['Every 12 hours the clock comes back to the same time.', k + ' ÷ 12 = ' + q + ' r ' + r + ', so it is the same as ' + C.plural(r, r + ' hour', r + ' hours') + ' later.', h + ':00 + ' + C.plural(r, r + ' hour', r + ' hours') + ' = ' + B(ans.h + ':00') + '.'],
          steps: [st('What is the remainder when ' + k + ' is divided by 12?', r), st('What time is ' + C.plural(r, r + ' hour', r + ' hours') + ' after ' + h + ':00?', ans, { type: 'time' })],
          traps: TR([tr({ h: r, m: 0 }, 'p_cycle', 'The remainder is how many hours to add. Add them to ' + h + ':00.'), tr({ h: wrap(h + q), m: 0 }, 'm_remain', 'Use the remainder, not how many times 12 goes in.')]) };
      }
      if (kind === 2) {
        const [den, cyS] = R.pick([[7, '142857'], [13, '076923'], [27, '037'], [11, '09'], [37, '027']]), cy = cyS.split('').map(Number), L = cy.length, k = R.i(20, 200), r = k % L, ans = cy[r === 0 ? L - 1 : r - 1];
        return { text: 'The decimal for ' + frac(1, den) + ' is ' + B('0.' + cyS + cyS + '…') + '. What is the ' + B(ordn(k)) + ' digit after the point?', ans,
          how: ['The digits ' + cyS + ' repeat, ' + L + ' at a time.', k + ' ÷ ' + L + ' = ' + Math.floor(k / L) + ' r ' + r + '.',
            r === 0 ? 'No remainder: the last digit of ' + cyS + ', which is ' + B(ans) + '.' : 'Remainder ' + r + ': the ' + ordn(r) + ' digit of ' + cyS + ', which is ' + B(ans) + '.'],
          steps: [st('In 0.' + cyS + cyS + '…, how many digits repeat?', L), st('What is the remainder when ' + k + ' is divided by ' + L + '?', r), st('The digits ' + cy.join(', ') + ' repeat and the remainder is ' + r + '. What is the ' + ordn(k) + ' digit after the point?', ans)],
          traps: TR([r === 0 ? tr(cy[0], 'p_cycle', 'No remainder means a full cycle has just ended: the last digit.') : tr(cy[r % L], 'p_cycle', 'Remainder ' + r + ' means the ' + ordn(r) + ' digit, counting from the first.')]) };
      }
      const L = R.i(3, 4), cy = pick(L).map(v => Math.min(v, 6)), N = R.i(15, 40); if (new Set(cy).size < L) return null;
      const S = cy.reduce((s, v) => s + v, 0), q = Math.floor(N / L), r = N % L, extra = cy.slice(0, r).reduce((s, v) => s + v, 0), ans = q * S + extra;
      return { text: 'This pattern keeps repeating. What do the first ' + B(N) + ' numbers add up to?', ans, vis: seqB(cy.concat(cy, ['…'])),
        how: ['One cycle, ' + cy.join(' + ') + ', adds to ' + S + '.', N + ' ÷ ' + L + ' = ' + q + ' r ' + r + ': ' + q + ' full cycles make ' + q + ' × ' + S + ' = ' + q * S + '.',
          r ? 'Plus the first ' + r + ' of the next cycle: ' + cy.slice(0, r).join(' + ') + ' = ' + extra + '. Total ' + q * S + ' + ' + extra + ' = ' + B(ans) + '.' : 'No numbers left over, so the total is ' + B(ans) + '.'],
        steps: [st('Add one cycle: ' + B(cy.join(' + ')) + ' = ?', S), st('One cycle is ' + L + ' numbers. How many full cycles are in ' + N + ' numbers?', q), st((r ? 'Add the full cycles and the leftover numbers: ' : 'No numbers are left over: ') + B(q + ' × ' + S + (r ? ' + ' + cy.slice(0, r).join(' + ') : '')) + ' = ?', ans)],
        traps: TR([tr(q * S, 'p_cycle', 'Add the leftover numbers from the start of the next cycle too.'), tr(N * S, 'p_cycle', 'Each cycle is ' + L + ' numbers, so there are only ' + q + ' full cycles.'), tr(q * S + cy.slice(L - r).reduce((s, v) => s + v, 0), 'p_cycle', 'The leftovers are the first ' + r + ' numbers of the pattern.')]) };
    } },

  { id: 'p_nth', s: 'pat', g: 8, title: 'The nth term: start + (n − 1) jumps', pre: ['x_eval'], paper: true,
    tip: '3, 7, 11, 15, …: the jump is 4. The 20th term is 19 jumps after the 1st: 3 + 19 × 4 = 79.',
    gen(d, R) {
      const s = d === 0 ? R.i(1, 12) : R.i(-20, 50), j = d === 0 ? R.i(2, 6) : (R.chance(.5) ? -1 : 1) * R.i(2, 9), T = k => s + (k - 1) * j;
      const show = [T(1), T(2), T(3), T(4)];
      if (d < 2) {
        const n = d === 0 ? R.i(10, 30) : R.i(15, 60), ans = T(n), prod = (n - 1) * j;
        return { text: 'Find the ' + B(ordn(n) + ' term') + ' of this pattern.', ans, vis: seqB(show.concat(['…'])),
          how: [why('jump = ' + num(show[1]) + M + ng(show[0]) + ' = ' + num(j), 'the same every time'), why('term ' + n + ' = ' + num(s) + ' + (' + n + M + '1) × ' + ng(j), 'start + (n − 1) jumps'),
            '= ' + num(s) + ' + ' + ng(prod), '= ' + B(num(ans))],
          steps: [st('The pattern starts ' + show.map(num).join(', ') + '. What is the jump from one term to the next?', j), st('How many jumps is it from the 1st term to the ' + ordn(n) + '?', n - 1), st(B((n - 1) + ' × ' + ng(j)) + ' = ?', prod), st(B(num(s) + ' + ' + ng(prod)) + ' = ?', ans)],
          traps: TR([tr(s + n * j, 'p_nth', 'From the 1st term to the ' + ordn(n) + ' is ' + (n - 1) + ' jumps, not ' + n + '.'), tr(n * j, 'p_nth', 'Start from the first term, ' + num(s) + ', then add the jumps.'),
            j < 0 ? tr(s - prod, 'n_intmul', 'Check the sign: ' + (n - 1) + ' × ' + ng(j) + ' is negative, because the pattern goes down by ' + Math.abs(j) + ' each time.') : null]) };
      }
      if (R.chance(.5)) {
        const n = R.i(20, 80), X = T(n);
        return { text: 'Which term of this pattern is ' + B(num(X)) + '?', ans: n, vis: seqB(show.concat(['…'])),
          how: [why('jump = ' + num(j), num(show[0]) + ' to ' + num(show[1])), num(X) + ' = ' + num(s) + ' + (n ' + MINUS + ' 1) × ' + ng(j),
            num(X - s) + ' = (n ' + MINUS + ' 1) × ' + ng(j) + ', so n ' + MINUS + ' 1 = ' + num(X - s) + ' ÷ ' + ng(j) + ' = ' + (n - 1), 'n = ' + B(n)],
          steps: [st('Take away the first term: ' + B(num(X) + M + ng(s)) + ' = ?', X - s), st('How many jumps of ' + num(j) + ' make ' + num(X - s) + '?', n - 1), st((n - 1) + ' jumps after the 1st term is which term?', n)],
          traps: TR([tr(n - 1, 'p_nth', 'That is the number of jumps. The 1st term has no jumps, so add 1.'), j !== 0 && X % j === 0 ? tr(X / j, 'p_nth', 'Take away the first term first, then count the jumps.') : null, tr(n + 1, 'p_nth', 'The number of jumps is one less than the term number.')]) };
      }
      const A = T(4), Bv = T(10), ans = s;
      return { text: 'A pattern has the same jump each time. The ' + B('4th term is ' + num(A)) + '. The ' + B('10th term is ' + num(Bv)) + '. What is the 1st term?', ans,
        how: [why('jump = (' + num(Bv) + M + ng(A) + ') ÷ 6 = ' + num(Bv - A) + ' ÷ 6 = ' + num(j), '6 jumps from the 4th to the 10th term'), why('term 1 = ' + num(A) + M + '3 × ' + ng(j), '3 jumps back from the 4th term'), '= ' + num(A) + M + ng(3 * j), '= ' + B(num(ans))],
        steps: [st('How many jumps is it from the 4th term to the 10th?', 6), st('6 jumps take you from ' + num(A) + ' to ' + num(Bv) + '. What is one jump?', j), st('The 4th term is ' + num(A) + ' and one jump is ' + num(j) + '. Go 3 jumps back. What is the 1st term?', ans)],
        traps: TR([tr(A - 4 * j, 'p_nth', 'From the 1st term to the 4th is 3 jumps, not 4.'), tr(Number.isInteger((Bv - A) / 7) ? A - (Bv - A) / 7 * 3 : null, 'p_nth', 'From the 4th to the 10th term is 6 jumps.'), tr(A + 3 * j, 'n_intadd', 'Go back to the 1st term: take the jumps away.')]) };
    } },

  { id: 'p_geo', s: 'pat', g: 8, title: 'Multiply patterns: ×r each time', pre: ['w_exp'],
    tip: '3, 6, 12, 24: each term is 2 times the one before. The 7th term is 6 doublings after 3: 3 × 2⁶ = 192.',
    gen(d, R) {
      if (d === 0) {
        if (R.chance(.3)) { const end = R.i(1, 9), t = [end * 16, end * 8, end * 4, end * 2], ans = end;
          return { text: 'What comes next?', ans, vis: seqB(t.concat([null])),
            how: ['Each term is half of the one before (÷ 2).', 'Half of ' + t[3] + ' is ' + B(ans) + '.'],
            steps: [st('What is half of ' + t[3] + '?', ans)],
            traps: TR([tr(t[3] - (t[2] - t[3]), 'p_rule', 'The jumps get smaller each time. Each term is half of the one before.'), tr(t[3] / 4, 'p_geo', 'Divide by 2 once for the next term.')]) }; }
        const a = R.i(1, 6), r = R.pick([2, 3, 10]), t = [a, a * r, a * r * r, a * r * r * r], ans = t[3] * r;
        return { text: 'What comes next?', ans, vis: seqB(t.concat([null])),
          how: ['Each term is ' + r + ' times the one before: ' + t[1] + ' ÷ ' + t[0] + ' = ' + r + '.', t[3] + ' × ' + r + ' = ' + B(num(ans)) + '.'],
          steps: [st('The pattern starts ' + t.slice(0, 3).join(', ') + '. What do you multiply by each time?', r), st(B(t[3] + ' × ' + r) + ' = ?', ans)],
          traps: TR([tr(t[3] + (t[3] - t[2]), 'p_rule', 'The jumps are not the same: each term is ' + r + ' times the one before.'), tr(t[3] + r, 'p_geo', 'Multiply by ' + r + ', don’t add it.')]) };
      }
      if (d === 1 && R.chance(.5)) {
        const a = R.i(1, 5) * (R.chance(.3) ? -1 : 1), r = R.pick([2, 3, -2, -3]), t = [0, 1, 2, 3, 4].map(k => a * Math.pow(r, k)), m = R.i(1, 3), ans = t[m];
        return { text: 'Each term is multiplied by the same number. What number is missing?', ans, vis: seqB(t.map((v, i) => (i === m ? null : v))),
          how: ['Find the multiplier: ' + num(t[m === 1 ? 3 : 1]) + ' ÷ ' + ng(t[m === 1 ? 2 : 0]) + ' = ' + num(r) + '.', ng(t[m - 1]) + ' × ' + ng(r) + ' = ' + B(num(ans)) + '.'],
          steps: [st('The pattern goes ' + t.map((v, i) => (i === m ? '?' : num(v))).join(', ') + '. What do you multiply by each time?', r), st(B(ng(t[m - 1]) + ' × ' + ng(r)) + ' = ?', ans)],
          traps: TR([tr(-ans, 'n_intmul', 'Check the sign: a negative multiplier flips the sign every time.'), tr((t[m - 1] + t[m + 1]) / 2, 'p_rule', 'This is a multiply pattern, not a same-jump pattern.')]) };
      }
      if (d === 2 && R.chance(.5)) {
        const A = R.i(2, 9), top = R.i(2, 6), Bv = A * top * top, ans = A * top;
        return { text: 'Each term is multiplied by the same number. Three terms in a row are ' + B(A + ', ?, ' + num(Bv)) + '. All terms are positive. What is the missing term?', ans,
          how: ['Call the multiplier r. The missing term is ' + A + ' × r, and ' + num(Bv) + ' is ' + A + ' × r × r.', 'So r × r = ' + num(Bv) + ' ÷ ' + A + ' = ' + top * top + ', and r = ' + top + '.', 'The missing term is ' + A + ' × ' + top + ' = ' + B(num(ans)) + '.'],
          steps: [st(B(num(Bv) + ' ÷ ' + A) + ' = ?', top * top), st('Which number times itself makes ' + top * top + '?', top), st(B(A + ' × ' + top) + ' = ?', ans)],
          traps: TR([tr((A + Bv) / 2, 'p_geo', 'Halfway is right for a same-jump pattern. Here each step multiplies by the same number.'), tr(top * top, 'w_roots', 'That is r × r. Find r, then multiply ' + A + ' by it.'), tr(A * top * top / 2, 'p_geo', 'Two equal multiplications get from ' + A + ' to ' + num(Bv) + '. Find one of them.')]) };
      }
      const a = R.i(1, 5), r = d === 1 ? R.pick([2, 3]) : R.pick([2, 2, 3]), n = d === 1 ? R.i(5, 6) : (r === 2 ? R.i(7, 11) : R.i(6, 8)), P = Math.pow(r, n - 1), ans = a * P;
      const t = [a, a * r, a * r * r];
      return { text: 'Find the ' + B(ordn(n) + ' term') + ' of this pattern.', ans, vis: seqB(t.concat(['…'])),
        how: ['Each term is ' + r + ' times the one before. From the 1st term to the ' + ordn(n) + ' is ' + (n - 1) + ' multiplications by ' + r + '.', a + ' × ' + pw(r, n - 1) + ' = ' + a + ' × ' + num(P) + ' = ' + B(num(ans)) + '.'],
        steps: [st('How many times do you multiply by ' + r + ' to get from the 1st term to the ' + ordn(n) + '?', n - 1), st(B(pw(r, n - 1)) + ' = ?', P), st(B(a + ' × ' + num(P)) + ' = ?', ans)],
        traps: TR([tr(a * P * r, 'p_geo', 'From the 1st to the ' + ordn(n) + ' term is ' + (n - 1) + ' multiplications, not ' + n + '.'), tr(a + (n - 1) * (t[1] - t[0]), 'p_rule', 'This is a multiply pattern, not a same-jump pattern.'), tr(a * r * (n - 1), 'w_exp', pw(r, n - 1) + ' means ' + (n - 1) + ' ' + r + 's multiplied, not ' + r + ' × ' + (n - 1) + '.')]) };
    } },

  { id: 'p_diffs', s: 'pat', g: 9, title: 'Second differences', pre: [], paper: true,
    tip: '2, 5, 10, 17, 26: the jumps are 3, 5, 7, 9 and they grow by 2. Next jump 11, so the next term is 37.',
    gen(d, R) {
      const s2 = d === 0 ? R.pick([1, 2]) : (R.chance(.25) ? -1 : 1) * R.i(2, 5), f = d === 0 ? R.i(1, 5) : R.i(-6, 8), t0 = d === 0 ? R.i(0, 10) : R.i(-10, 20);
      const t = [t0]; let jmp = f; for (let i = 0; i < 9; i++) { t.push(t[t.length - 1] + jmp); jmp += s2; }
      const J = jumps(t), lead = 'The jumps in this pattern change by the same amount each time.';
      if (d < 2 || R.chance(.4)) {
        const ans = t[5];
        return { text: lead + ' What comes next?', ans, vis: seqB(t.slice(0, 5).concat([null])),
          how: ['jumps: ' + J.slice(0, 4).map(sj).join(', '), why('the jumps change by ' + sj(s2), 'second difference'), 'next jump: ' + sj(J[3]) + ' ' + (s2 < 0 ? MINUS + ' ' + -s2 : '+ ' + s2) + ' = ' + sj(J[4]), 'next term: ' + num(t[4]) + sgn(J[4]) + ' = ' + B(num(ans))],
          steps: [st('What is the last jump, from ' + num(t[3]) + ' to ' + num(t[4]) + '?', J[3]), st('How much do the jumps change each time?', s2), st('What is the next jump?', J[4]), st('What is the next term?', ans)],
          traps: TR([tr(t[4] + J[3], 'p_rule', 'The jumps are not the same: they change by ' + sj(s2) + ' each time.'), tr(t[4] + s2, 'p_diffs', 'Add the next jump, not the change in the jumps.'), tr(t[4] + J[3] + 2 * s2, 'p_diffs', 'The next jump is only one step bigger: ' + sj(J[3]) + ' then ' + sj(J[4]) + '.')]) };
      }
      if (R.chance(.5)) {
        const ans = t[7];
        return { text: lead + ' Find the ' + B('8th term') + '.', ans, vis: seqB(t.slice(0, 5).concat(['…'])),
          how: ['jumps: ' + J.slice(0, 4).map(sj).join(', ') + '   (they change by ' + sj(s2) + ')', 'next jumps: ' + J.slice(4, 7).map(sj).join(', '), 'terms: ' + num(t[4]) + ' → ' + num(t[5]) + ' → ' + num(t[6]) + ' → ' + num(t[7]), '8th term = ' + B(num(ans))],
          steps: [st('What is the 6th term?', t[5]), st('What is the 7th term?', t[6]), st('What is the 8th term?', ans)],
          traps: TR([tr(t[4] + 3 * J[3], 'p_rule', 'The jumps keep changing by ' + sj(s2) + '.'), tr(t[6], 'p_diffs', 'That is the 7th term. One more jump.')]) };
      }
      const ans = t[0];
      return { text: lead + ' What number comes just before the first one shown?', ans, vis: seqB([null].concat(t.slice(1, 6))),
        how: ['jumps: ' + J.slice(1, 5).map(sj).join(', ') + '   (they change by ' + sj(s2) + ')', 'the jump before ' + sj(J[1]) + ' is ' + sj(J[1]) + ' ' + (s2 < 0 ? '+ ' + -s2 : MINUS + ' ' + s2) + ' = ' + sj(J[0]), why('term before = ' + num(t[1]) + (J[0] < 0 ? ' + ' + -J[0] : M + J[0]), 'undo that jump'), '= ' + B(num(ans))],
        steps: [st('What is the jump from ' + num(t[1]) + ' to ' + num(t[2]) + '?', J[1]), st('What was the jump just before it?', J[0]), st('What number comes before ' + num(t[1]) + '?', ans)],
        traps: TR([tr(t[1] - J[1], 'p_rule', 'The jump before is not the same: the jumps change by ' + sj(s2) + '.'), tr(t[1] + J[0], 'p_diffs', 'Going backwards, undo the jump: take it away.')]) };
    } },

  { id: 'p_recursive', s: 'pat', g: 10, title: 'Recursive rules', pre: ['x_eval'], paper: true,
    tip: 'A recursive rule makes each term from the one before. a₁ = 3 and aₙ = 2aₙ₋₁ + 1: 3, then 2 × 3 + 1 = 7, then 2 × 7 + 1 = 15.',
    gen(d, R) {
      const A = k => sub('a', k), An = sub('a', 'n'), An1 = sub('a', 'n' + MINUS + '1'), An2 = sub('a', 'n' + MINUS + '2');
      if (d === 2 && R.chance(.5)) {
        if (R.chance(.5)) {
          const a1 = R.i(-4, 6), a2 = R.i(-4, 6), p = R.pick([1, 2, -1]), q = R.pick([1, 2, -1]), t = [a1, a2]; for (let i = 2; i < 6; i++) t.push(p * t[i - 1] + q * t[i - 2]);
          if (Math.abs(t[5]) > 500 || t[5] === t[4]) return null;
          const rule = (p === 1 ? '' : p === -1 ? MINUS : p) + An1 + (q < 0 ? M : ' + ') + (Math.abs(q) === 1 ? '' : Math.abs(q)) + An2;
          const how = [2, 3, 4, 5].map(k => A(k + 1) + ' = ' + (p === 1 ? '' : p === -1 ? MINUS : p + ' × ') + ng(t[k - 1]) + (q < 0 ? M : ' + ') + (Math.abs(q) === 1 ? '' : Math.abs(q) + ' × ') + ng(t[k - 2]) + ' = ' + (k === 5 ? B(num(t[k])) : num(t[k])));
          return { text: B(A(1) + ' = ' + num(a1) + ',  ' + A(2) + ' = ' + num(a2)) + ' and ' + B(An + ' = ' + rule) + '. What is ' + B(A(6)) + '?', ans: t[5], how,
            steps: [2, 3, 4, 5].map(k => st('What is ' + B(A(k + 1)) + '?', t[k])),
            traps: TR([tr(t[4], 'p_recursive', 'That is ' + A(5) + '. Make one more term.'), tr(p * t[4] + q * t[4], 'p_recursive', 'The rule uses the two terms before, ' + A(5) + ' and ' + A(4) + '.')]) };
        }
        const a1 = R.i(-3, 8), m = R.pick([2, 3]), c = nonzero(R, -5, 5), a2 = m * a1 + c, a3 = m * a2 + c;
        return { text: 'The rule is ' + B(An + ' = ' + m + An1 + sgn(c)) + ', and ' + B(A(3) + ' = ' + num(a3)) + '. What is ' + B(A(1)) + '?', ans: a1,
          how: [num(a3) + ' = ' + m + A(2) + sgn(c), why(m + A(2) + ' = ' + num(a3 - c) + ',  ' + A(2) + ' = ' + num(a2), 'undo: ' + (c > 0 ? 'take away ' + c : 'add ' + -c) + ', then ÷ ' + m), num(a2) + ' = ' + m + A(1) + sgn(c) + ',  ' + m + A(1) + ' = ' + num(a2 - c), A(1) + ' = ' + B(num(a1))],
          steps: [st('What is ' + B(A(2)) + '?', a2), st('What is ' + B(A(1)) + '?', a1)],
          traps: TR([tr(m * a3 + c, 'p_recursive', 'That goes forward to ' + A(4) + '. Undo the rule to go back.'), tr((a3 / m - c) === Math.round(a3 / m - c) ? a3 / m - c : null, 'x_twostep', 'Undo in reverse order: first undo the ' + (c > 0 ? '+ ' + c : MINUS + ' ' + -c) + ', then the × ' + m + '.'), tr(a2, 'p_recursive', 'That is ' + A(2) + '. Go back one more step.')]) };
      }
      const sq_ = d === 1 && R.chance(.3);
      const a1 = sq_ ? R.i(-2, 3) : R.i(1, 5), m = d === 0 ? R.pick([2, 3]) : R.pick([2, 3, -2]), c = sq_ ? -R.i(1, 4) : nonzero(R, d === 0 ? 1 : -6, d === 0 ? 4 : 6), N = d === 0 ? 3 : 4;
      const f = x => (sq_ ? x * x + c : m * x + c), t = [a1]; for (let i = 1; i < N; i++) t.push(f(t[i - 1]));
      if (Math.abs(t[N - 1]) > 999) return null;
      const rule = sq_ ? sq(An1) + sgn(c) : (m < 0 ? MINUS + -m : m) + An1 + sgn(c);
      const how = t.slice(1).map((v, i) => A(i + 2) + ' = ' + (sq_ ? sq(ng(t[i])) : (m < 0 ? MINUS + -m : m) + ' × ' + ng(t[i])) + sgn(c) + ' = ' + (i === N - 2 ? B(num(v)) : num(v)));
      return { text: B(A(1) + ' = ' + num(a1)) + ' and ' + B(An + ' = ' + rule) + '. What is ' + B(A(N)) + '?', ans: t[N - 1], how,
        steps: t.slice(1).map((v, i) => st('What is ' + B(A(i + 2)) + '?', v)),
        traps: TR([tr(t[N - 2], 'p_recursive', 'That is ' + A(N - 1) + '. Keep going to ' + A(N) + '.'), tr(f(t[N - 1]), 'p_recursive', 'You went one term too far. ' + A(1) + ' is the first term.'),
          sq_ ? null : tr(m * (t[N - 2] + c), 'x_order', 'Multiply first, then ' + (c > 0 ? 'add' : 'take away') + ': ' + num(m) + ' × ' + ng(t[N - 2]) + sgn(c) + '.')]) };
    } },

  { id: 'p_series', s: 'pat', g: 11, title: 'Sum a same-jump series', pre: [], paper: true,
    tip: 'Sum = how many terms × the average of the first and last. 4 + 7 + … + 31: 10 terms, average (4 + 31) ÷ 2 = 17.5, sum 175.',
    gen(d, R) {
      let a, j, N, text, mult = null;
      if (d === 0) { a = R.i(1, 9); j = R.i(2, 5); N = R.i(8, 20); }
      else if (d === 1) { a = R.i(-10, 30); j = (R.chance(.25) ? -1 : 1) * R.i(2, 9); N = R.i(15, 40); }
      else if (R.chance(.5)) { const p = R.i(2, 6), q = R.i(-5, 9); N = R.i(20, 60); a = p + q; j = p; text = 'Add up ' + B(poly([p, q], 'k')) + ' for every whole number k from 1 to ' + N + '. What is the total?'; }
      else { const m = R.i(3, 9), A0 = R.i(20, 150), B0 = A0 + R.i(80, 300); a = Math.ceil(A0 / m) * m; const L0 = Math.floor(B0 / m) * m; j = m; N = (L0 - a) / m + 1; text = 'What is the sum of all the multiples of ' + B(m) + ' from ' + B(A0) + ' to ' + B(B0) + '?'; mult = { m, A0, B0, L0 }; }
      const L = a + (N - 1) * j, S2 = a + L, ans = N * S2 / 2, avg = S2 / 2;
      if (!text) text = d === 0 ? 'What is ' + B(num(a) + ' + ' + num(a + j) + ' + ' + num(a + 2 * j) + ' + … + ' + num(L)) + '?' : 'What is the sum of the first ' + B(N) + ' terms of ' + B(num(a) + ', ' + num(a + j) + ', ' + num(a + 2 * j) + ', …') + '?';
      const countLine = mult ? why('first = ' + a + ', last = ' + mult.L0 + ',  terms = (' + mult.L0 + M + a + ') ÷ ' + mult.m + ' + 1 = ' + N, 'the multiples of ' + mult.m + ' inside ' + mult.A0 + ' to ' + mult.B0) : d === 0 ? why('terms = (' + num(L) + M + ng(a) + ') ÷ ' + j + ' + 1 = ' + N, 'jumps, plus the first term') : why('last term = ' + num(a) + ' + ' + (N - 1) + ' × ' + ng(j) + ' = ' + num(L), N + ' terms');
      return { text, ans,
        how: [countLine, 'average of first and last = (' + num(a) + ' + ' + ng(L) + ') ÷ 2 = ' + num(avg), 'sum = ' + N + ' × ' + num(avg) + ' = ' + B(num(ans))],
        steps: (mult ? [st('What is the first multiple of ' + mult.m + ' that is ' + mult.A0 + ' or more?', a), st('What is the last multiple of ' + mult.m + ' up to ' + mult.B0 + '?', L), st('How many terms are there?', N)] : [d === 0 ? st('How many terms are there?', N) : st('What is the last term?', L), st('What is the average of the first and last terms?', avg)]).concat([st('Sum = number of terms × average. What is it?', ans)]),
        traps: TR([tr(N * S2, 'p_gauss', 'Use the average of the first and last, (' + num(a) + ' + ' + ng(L) + ') ÷ 2, not their sum.'),
          d === 0 ? tr((N - 1) * avg, 'p_nth', 'Count the terms again: jumps plus 1.') : tr(N * (a + a + N * j) / 2, 'p_nth', 'The ' + ordn(N) + ' term is ' + (N - 1) + ' jumps after the first.'),
          tr(N * L, 'p_series', 'Not every term equals the last one. Use the average of the first and last.')]) };
    } },

  { id: 'p_geoseries', s: 'pat', g: 11, title: 'Geometric series', pre: ['f_divfrac'], paper: true,
    tip: 'Finite: sum = (next term − first) ÷ (r − 1), so 1 + 2 + 4 + … + 128 = 255. Forever with |r| < 1: sum = first ÷ (1 − r), so 8 + 4 + 2 + … = 16.',
    gen(d, R) {
      if (d === 0 || (d === 2 && R.chance(.3))) {
        const a = d === 0 ? R.pick([1, 2, 3, 5]) : R.i(2, 6), r = d === 0 ? R.pick([2, 2, 3]) : R.pick([3, 4]), N = d === 0 ? R.i(4, 7) : R.i(5, 6);
        const terms = Array.from({ length: N }, (_, i) => a * Math.pow(r, i)), last = terms[N - 1], next = last * r, ans = (next - a) / (r - 1);
        const shown = N <= 5 ? terms.map(num).join(' + ') : terms.slice(0, 3).map(num).join(' + ') + ' + … + ' + num(last);
        return { text: 'What is ' + B(shown) + '?   (each term is ' + r + ' times the one before)', ans: ans,
          how: [why('next term after ' + num(last) + ' = ' + num(last) + ' × ' + r + ' = ' + num(next), 'one past the end'), 'sum = (' + num(next) + M + a + ') ÷ (' + r + M + '1)', '= ' + num(next - a) + ' ÷ ' + (r - 1) + ' = ' + B(num(ans))],
          steps: [st('What would the next term be?', next), st(B('(' + num(next) + M + a + ') ÷ ' + (r - 1)) + ' = ?', ans)],
          traps: TR([tr(next, 'p_geoseries', 'Take away the first term: (' + num(next) + M + a + ').'), r > 2 ? tr(next - a, 'p_geoseries', 'Now divide by r ' + MINUS + ' 1 = ' + (r - 1) + '.') : null, tr(N * (a + last) / 2, 'p_series', 'Average of the ends works when the jumps are the same. Here each term is multiplied.')]) };
      }
      let a, rn, rd, neg = false;
      if (d === 1) { [rn, rd] = R.pick([[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [1, 5]]); }
      else { [rn, rd] = R.pick([[1, 2], [1, 3], [1, 4], [2, 3]]); neg = true; }
      a = rd * rd * R.i(1, 4);
      const t1 = a * rn / rd, t2 = a * rn * rn / (rd * rd), sg = neg ? -1 : 1;
      const shown = num(a) + (neg ? M : ' + ') + num(t1) + ' + ' + num(t2) + (neg ? M : ' + ') + '…';
      const den = neg ? rd + rn : rd - rn, ans = Q(a * rd, den), rS = (neg ? MINUS : '') + fr(rn, rd), one = neg ? '1 + ' + fr(rn, rd) : '1' + M + fr(rn, rd);
      return { text: 'The terms go on forever. What is ' + B(shown) + '?', ans, type: 'frac',
        how: [why('r = ' + num(sg * t1) + ' ÷ ' + num(a) + ' = ' + rS, 'each term is r times the one before'), 'sum = ' + num(a) + ' ÷ (1' + M + (neg ? '(' + rS + ')' : rS) + ')' + (neg ? ' = ' + num(a) + ' ÷ (' + one + ')' : ''), '= ' + num(a) + ' ÷ ' + fr(den, rd) + ' = ' + num(a) + ' × ' + fr(rd, den) + ' = ' + B(fq(ans))],
        steps: [st('What is the ratio r? (one term divided by the one before)', Q(sg * rn, rd), { type: 'frac' }), st('What is 1 ' + MINUS + ' r?', Q(den, rd), { type: 'frac' }), st('Sum = first ÷ (1 ' + MINUS + ' r). What is it?', ans, { type: 'frac' })],
        traps: TR([tr(Q(a * rd, neg ? rd - rn : rd + rn), neg ? 'n_intsub' : 'p_geoseries', neg ? '1 ' + MINUS + ' (' + rS + ') is 1 + ' + fr(rn, rd) + ': taking away a negative adds.' : 'The sum is first ÷ (1 ' + MINUS + ' r), not 1 + r.'),
          tr(Q(a * (rd - rn), rd), 'p_geoseries', 'Divide by (1 ' + MINUS + ' r), don’t multiply.'), tr(Q(a * rd, rn), 'p_geoseries', 'Divide the first term by (1 ' + MINUS + ' r), not by r.')]) };
    } },
]);

/* ======================= Powers, Roots & Logs ======================= */
const P = Math.pow;
const chainP = (b, e) => Array.from({ length: e }, (_, i) => num(P(b, i + 1))).join(' → ');
const logS = (b, x) => 'log<sub>' + b + '</sub> ' + x;
const supP = (s, e) => '(' + s + ')<sup>' + e + '</sup>';
const fsl = (a, b) => a + '/' + b;   /* a fraction written inside a power */

C.defs([
  { id: 'w_pow10', s: 'pow', g: 5, title: 'Powers of 10: count the zeros', pre: ['n_times10'],
    tip: '10⁴ is four 10s multiplied: 1 followed by 4 zeros, 10,000. 3.6 × 10³: move the point 3 places right, 3,600.',
    gen(d, R) {
      if (d === 0) {
        const n = R.i(2, 8), V = P(10, n);
        if (R.chance(.5)) return { text: 'What is ' + B(pw(10, n)) + '?', ans: V,
          how: [pw(10, n) + ' is ' + n + ' tens multiplied' + (n <= 4 ? ': ' + Array(n).fill(10).join(' × ') : '') + '.', 'Each 10 adds one zero: 1 followed by ' + zw(n) + ' = ' + B(num(V)) + '.'],
          steps: [st('How many zeros does ' + B(pw(10, n)) + ' have when you write it out?', n), st('Write ' + B(pw(10, n)) + ' out.', V)],
          traps: TR([tr(10 * n, 'w_exp', 'A power means repeated multiplying: ' + n + ' tens multiplied, not 10 × ' + n + '.'), tr(V * 10, 'n_times10', 'One zero for each 10.'), tr(V / 10, 'n_times10', 'One zero for each 10.')]) };
        return { text: B(num(V)) + ' is 10 to what power?', ans: n,
          how: ['Count the zeros in ' + num(V) + ': there are ' + n + '.', 'So ' + num(V) + ' = ' + pw(10, B(n)) + '.'],
          steps: [st('How many zeros does ' + B(num(V)) + ' have?', n)],
          traps: TR([tr(n + 1, 'w_pow10', 'Count only the zeros, not the 1.'), tr(n - 1, 'w_pow10', 'Count every zero.')]) };
      }
      if (d === 1) {
        const p = R.pick([0, 1, 1, 2]), K = p === 0 ? R.i(2, 9) : p === 1 ? R.i(11, 99) : R.i(101, 999); if (K % 10 === 0) return null;
        const n = R.i(Math.max(2, p), 6), k = K / P(10, p), V = K * P(10, n - p);
        return { text: 'What is ' + B(num(k) + ' × ' + pw(10, n)) + '?', ans: V,
          how: ['× ' + pw(10, n) + ' is × ' + num(P(10, n)) + ': every digit moves ' + n + ' places to the left.', num(k) + ' becomes ' + B(num(V)) + '.'],
          steps: [st('Write ' + B(pw(10, n)) + ' out.', P(10, n)), st(B(num(k) + ' × ' + num(P(10, n))) + ' = ?', V)],
          traps: TR([tr(V * 10, 'n_times10', 'Move the digits exactly ' + n + ' places.'), tr(V / 10, 'n_times10', 'Move the digits exactly ' + n + ' places.'), tr(k * 10 * n, 'w_exp', pw(10, n) + ' means ' + n + ' tens multiplied, not 10 × ' + n + '.')]) };
      }
      if (R.chance(.5)) {
        const p = R.pick([0, 1, 2]), K = p === 0 ? R.i(2, 9) : p === 1 ? R.i(11, 99) : R.i(101, 999); if (K % 10 === 0) return null;
        const n = R.i(Math.max(3, p + 1), 7), k = K / P(10, p), V = K * P(10, n - p);
        return { text: B(num(V) + ' = ' + num(k) + ' × ' + pw(10, '?')) + '. What is the power?', ans: n,
          how: ['To turn ' + num(k) + ' into ' + num(V) + ', the digits move left. Count the places from the point in ' + num(k) + ' to the end of ' + num(V) + '.', 'They move ' + n + ' places, so the power is ' + B(n) + '.'],
          steps: [st('How many digits does ' + B(num(V)) + ' have?', String(V).length), st('To turn ' + num(k) + ' into ' + num(V) + ', how many places do the digits move left?', n)],
          traps: TR([tr(n + 1, 'w_pow10', 'Count the moves, not the digits: the first digit stays in front.'), tr(String(V).replace(/[^0]/g, '').length !== n ? String(V).replace(/[^0]/g, '').length : null, 'w_pow10', 'Counting zeros only works when the front number is a single digit. Count the places the digits move.')]) };
      }
      const a = R.i(1, 3), b = R.i(a + 2, 8), ans = P(10, b - a);
      return { text: 'How many times does ' + B(num(P(10, a))) + ' go into ' + B(pw(10, b)) + '?', ans,
        how: [pw(10, b) + ' has ' + b + ' zeros and ' + num(P(10, a)) + ' has ' + a + '.', 'Dividing takes ' + a + ' zeros off: ' + (b - a) + ' zeros are left, ' + B(num(ans)) + '.'],
        steps: [st(pw(10, b) + ' has ' + b + ' zeros. Dividing by ' + num(P(10, a)) + ' takes off ' + a + (a === 1 ? ' zero' : ' zeros') + '. How many zeros are left?', b - a), st('What number is 1 followed by ' + (b - a) + ' zeros?', ans)],
        traps: TR([tr(b - a, 'w_pow10', 'That is how many zeros. Write the number itself.'), tr(P(10, b + a), 'w_rules', 'Dividing takes zeros away.'), tr(b % a === 0 ? P(10, b / a) : null, 'w_rules', 'Dividing powers of 10 takes away the zeros; it does not divide the powers.')]) };
    } },

  { id: 'w_exp', s: 'pow', g: 6, title: 'Powers: repeated multiplying', pre: ['m_squares'],
    tip: '2⁵ means five 2s multiplied: 2 × 2 × 2 × 2 × 2. Build it up: 2 → 4 → 8 → 16 → 32. It is not 2 × 5.',
    gen(d, R) {
      const val = (b, e) => {
        const V = P(b, e);
        return { text: 'What is ' + B(pw(b, e)) + '?', ans: V,
          how: [pw(b, e) + ' means ' + e + ' ' + b + 's multiplied: ' + Array(e).fill(b).join(' × ') + '.', 'Build it up: ' + chainP(b, e) + '. So ' + B(num(V)) + '.'],
          steps: Array.from({ length: Math.min(e - 1, 4) }, (_, i) => { const k = e - Math.min(e - 1, 4) + i + 1; return st('Times ' + b + ' again: ' + B(num(P(b, k - 1)) + ' × ' + b) + ' = ?', P(b, k)); }),
          traps: TR([tr(b * e, 'w_exp', 'A power is repeated multiplying: ' + e + ' ' + b + 's multiplied, not ' + b + ' × ' + e + '.'), tr(P(b, e - 1), 'w_exp', 'Count the ' + b + 's: there should be ' + e + ' of them.'), tr(P(b, e + 1), 'w_exp', 'Count the ' + b + 's: there should be ' + e + ' of them.')]) };
      };
      if (d === 0) { const b = R.i(2, 5), e = R.i(2, b === 5 ? 3 : 4); if (b === 2 && e === 2) return null; return val(b, e); }
      if (d === 1) {
        const [b, e] = R.pick([[2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [3, 3], [3, 4], [3, 5], [4, 3], [4, 4], [5, 3], [5, 4], [6, 3], [7, 3], [8, 3], [9, 3], [10, 5]]);
        if (R.chance(.6)) return val(b, e);
        const V = P(b, e);
        return { text: B(pw(b, '?') + ' = ' + num(V)) + '. What is the power?', ans: e,
          how: ['Multiply ' + b + 's until you reach ' + num(V) + ': ' + chainP(b, e) + '.', 'That is ' + e + ' ' + b + 's, so the power is ' + B(e) + '.'],
          steps: [st('Count along ' + chainP(b, e) + '. How many ' + b + 's were multiplied?', e)],
          traps: TR([tr(V / b, 'w_exp', 'The power counts how many ' + b + 's are multiplied, not ' + num(V) + ' ÷ ' + b + '.'), tr(e + 1, 'w_exp', 'Count again: ' + chainP(b, e) + '.'), tr(e - 1, 'w_exp', 'Count again: ' + chainP(b, e) + '.')]) };
      }
      if (R.chance(.5)) {
        const k = R.i(2, 5), [b, e] = R.pick([[2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [4, 2], [5, 2], [10, 3], [10, 2], [6, 2]]), V = P(b, e), ans = k * V;
        return { text: 'What is ' + B(k + ' × ' + pw(b, e)) + '?', ans,
          how: ['The power goes first, on the ' + b + ' only: ' + pw(b, e) + ' = ' + num(V) + '.', 'Then ' + k + ' × ' + num(V) + ' = ' + B(num(ans)) + '.'],
          steps: [st(B(pw(b, e)) + ' = ?', V), st(B(k + ' × ' + num(V)) + ' = ?', ans)],
          traps: TR([tr(P(k * b, e), 'x_order', 'The power is only on the ' + b + '. Do the power first, then times ' + k + '.'), tr(k * b * e, 'w_exp', pw(b, e) + ' means ' + Array(e).fill(b).join(' × ') + '.')]) };
      }
      const [b, e] = R.pick([[2, 10], [2, 8], [3, 5], [2, 9], [5, 4], [3, 6], [4, 5], [2, 12]]), V = P(b, e), up = R.chance(.6), ans = up ? V * b : V / b, e2 = up ? e + 1 : e - 1;
      return { text: B(pw(b, e) + ' = ' + num(V)) + '. What is ' + B(pw(b, e2)) + '?', ans,
        how: [up ? 'One more power means one more × ' + b + '.' : 'One power less means one fewer × ' + b + ', so divide by ' + b + '.', num(V) + (up ? ' × ' : ' ÷ ') + b + ' = ' + B(num(ans)) + '.'],
        steps: [st(B(num(V) + (up ? ' × ' : ' ÷ ') + b) + ' = ?', ans)],
        traps: TR([tr(up ? V + b : V - b, 'w_exp', 'Each power multiplies by ' + b + '; it does not add ' + b + '.'), tr(up ? V + 1 : V - 1, 'w_exp', 'Each power multiplies by ' + b + '.')]) };
    } },

  { id: 'w_roots', s: 'pow', g: 6, title: 'Square roots and cube roots', pre: ['m_squares'],
    tip: '√144 asks: what times itself is 144? 12. ∛27 asks: what times itself three times is 27? 3. For √576: 576 ends in 6, so the root ends in 4 or 6: 24.',
    gen(d, R) {
      const ENDS = { 1: [1, 9], 4: [2, 8], 5: [5], 6: [4, 6], 9: [3, 7], 0: [0] };
      if (d === 0) { const k = R.i(2, 12), n = k * k;
        return { text: 'What is ' + B(rt(n)) + '?', ans: k,
          how: [rt(n) + ' asks: what number times itself makes ' + n + '?', k + ' × ' + k + ' = ' + n + ', so ' + rt(n) + ' = ' + B(k) + '.'],
          traps: TR([tr(n / 2, 'w_roots', 'A square root is not half. Which number times itself makes ' + n + '?'), tr(k + 1, 'm_squares', 'Check: ' + (k + 1) + ' × ' + (k + 1) + ' = ' + (k + 1) * (k + 1) + '.'), tr(k - 1, 'm_squares', 'Check: ' + (k - 1) + ' × ' + (k - 1) + ' = ' + (k - 1) * (k - 1) + '.')]) }; }
      if (d === 1 && R.chance(.55)) {
        if (R.chance(.35)) { const k = R.i(2, 9), n = k * k * 100;
          return { text: 'What is ' + B(rt(num(n))) + '?', ans: 10 * k,
            how: [num(n) + ' = ' + k * k + ' × 100, and ' + rt(100) + ' = 10.', rt(k * k) + ' = ' + k + ', so ' + rt(num(n)) + ' = ' + k + ' × 10 = ' + B(10 * k) + '.'],
            steps: [st('What is ' + B(rt(k * k)) + '?', k), st('What is ' + B(rt(num(n))) + '?', 10 * k)],
            traps: TR([tr(100 * k, 'w_roots', 'Two zeros under the root become one zero: ' + rt(100) + ' = 10.'), tr(k, 'w_roots', 'Don’t drop the zeros: ' + rt(100) + ' = 10.')]) }; }
        let k; do { k = R.i(13, 24); } while (k % 5 === 0);
        const n = k * k, lo = Math.floor(k / 5) * 5, hi = lo + 5, ends = ENDS[n % 10], other = ends.map(e => Math.floor(k / 10) * 10 + e).find(v => v !== k) || k + 1;
        return { text: 'What is ' + B(rt(n)) + '?', ans: k,
          how: [lo + '² = ' + lo * lo + ' and ' + hi + '² = ' + hi * hi + ', so ' + rt(n) + ' is between ' + lo + ' and ' + hi + '.',
            n + ' ends in ' + n % 10 + ', and only numbers ending in ' + ends.join(' or ') + ' make squares ending in ' + n % 10 + '. Between ' + lo + ' and ' + hi + ' that is ' + B(k) + '.'],
          steps: [st('What is ' + B(sq(lo)) + '?', lo * lo), st(n + ' is between ' + lo * lo + ' and ' + hi * hi + '. Which number between ' + lo + ' and ' + hi + ' ends in ' + ends.join(' or ') + '?', k)],
          traps: TR([tr(other, 'w_roots', 'Check the size: ' + rt(n) + ' is between ' + lo + ' and ' + hi + '.'), tr(n / 2, 'w_roots', 'A square root is not half. Which number times itself makes ' + n + '?')]) };
      }
      if (d === 1) { const k = R.pick([2, 3, 4, 5, 6, 7, 8, 9, 10]), n = k * k * k;
        return { text: 'What is ' + B(rt(num(n), 3)) + '?', ans: k,
          how: [rt(n, 3) + ' asks: what number times itself three times makes ' + num(n) + '?', k + ' × ' + k + ' × ' + k + ' = ' + num(n) + ', so the answer is ' + B(k) + '.'],
          steps: [st('What is ' + B(k + ' × ' + k) + '?', k * k), st('So what is ' + B(rt(num(n), 3)) + '?', k)],
          traps: TR([tr(n % 3 === 0 ? n / 3 : null, 'w_roots', 'A cube root is not a third. Which number times itself three times makes ' + num(n) + '?'), Number.isInteger(Math.sqrt(n)) ? tr(Math.sqrt(n), 'w_roots', 'That is a square root. A cube root uses three equal numbers.') : null, tr(k + 1, 'w_exp', 'Check: ' + (k + 1) + ' × ' + (k + 1) + ' × ' + (k + 1) + ' = ' + P(k + 1, 3) + '.')]) }; }
      const kind = R.i(0, 2);
      if (kind === 0) { const k = R.i(2, 9), n = k * k * k * 1000;
        return { text: 'What is ' + B(rt(num(n), 3)) + '?', ans: 10 * k,
          how: [num(n) + ' = ' + k * k * k + ' × 1,000, and ' + rt('1,000', 3) + ' = 10.', rt(k * k * k, 3) + ' = ' + k + ', so the answer is ' + k + ' × 10 = ' + B(10 * k) + '.'],
          steps: [st('What is ' + B(rt(k * k * k, 3)) + '?', k), st('What is ' + B(rt(num(n), 3)) + '?', 10 * k)],
          traps: TR([tr(100 * k, 'w_roots', 'Three zeros under a cube root become one zero.'), tr(k, 'w_roots', 'Don’t drop the zeros: ' + rt('1,000', 3) + ' = 10.')]) }; }
      if (kind === 1) { let k; do { k = R.i(2, 19); } while (k % 10 === 0);
        const n = k * k / 100, ans = k / 10;
        return { text: 'What is ' + B(rt(num(n))) + '?', ans,
          how: [num(n) + ' is ' + k * k + ' hundredths, and ' + rt(k * k) + ' = ' + k + ', ' + rt(100) + ' = 10.', 'So ' + rt(num(n)) + ' = ' + k + ' ÷ 10 = ' + B(num(ans)) + '.  Check: ' + num(ans) + ' × ' + num(ans) + ' = ' + num(n) + '.'],
          steps: [st('What is ' + B(rt(k * k)) + '?', k), st('Now divide by 10. What is ' + B(rt(num(n))) + '?', ans)],
          traps: TR([tr(k / 100, 'n_times10', 'Check: ' + num(k / 100) + ' × ' + num(k / 100) + ' is much smaller than ' + num(n) + '.'), tr(k, 'w_roots', 'Check: ' + k + ' × ' + k + ' = ' + k * k + ', not ' + num(n) + '.')]) }; }
      const a = R.i(2, 9), b = R.i(2, 9); if (a === b) return null;
      return { text: 'What is ' + B(rt(a * a + ' × ' + b * b)) + '?', ans: a * b,
        how: ['Take the root of each part: ' + rt(a * a) + ' = ' + a + ' and ' + rt(b * b) + ' = ' + b + '.', a + ' × ' + b + ' = ' + B(a * b) + '.'],
        steps: [st('What is ' + B(rt(a * a)) + '?', a), st('What is ' + B(rt(b * b)) + '?', b), st('Multiply them: ' + B(a + ' × ' + b) + ' = ?', a * b)],
        traps: TR([tr(a * a * b * b, 'w_roots', 'Take the square root at the end.'), tr(a + b, 'w_roots', 'The roots multiply: ' + a + ' × ' + b + '.')]) };
    } },

  { id: 'w_sqrtest', s: 'pow', g: 8, title: 'Estimate square roots', pre: [],
    tip: '√50 is between √49 = 7 and √64 = 8. 50 is much closer to 49, so √50 is about 7.',
    gen(d, R) {
      const near = n => { const k = Math.floor(Math.sqrt(n)); return n - k * k <= (k + 1) * (k + 1) - n ? k : k + 1; };
      if (d === 2 && R.chance(.5)) {
        let a, b; do { a = R.i(5, 60); b = a + R.i(25, 120); } while (Number.isInteger(Math.sqrt(a)) || Number.isInteger(Math.sqrt(b)));
        const fa = Math.floor(Math.sqrt(a)), fb = Math.floor(Math.sqrt(b)), ans = fb - fa;
        return { text: 'How many whole numbers are between ' + B(rt(a)) + ' and ' + B(rt(b)) + '?', ans,
          how: [rt(a) + ' is between ' + fa + ' and ' + (fa + 1) + ', and ' + rt(b) + ' is between ' + fb + ' and ' + (fb + 1) + '.', 'The whole numbers between them are ' + (fa + 1) + ' to ' + fb + ': ' + fb + M + fa + ' = ' + B(ans) + ' numbers.'],
          steps: [st('What is the smallest whole number bigger than ' + B(rt(a)) + '?', fa + 1), st('What is the biggest whole number smaller than ' + B(rt(b)) + '?', fb), st('How many whole numbers are there from ' + (fa + 1) + ' to ' + fb + '?', ans)],
          traps: TR([tr(ans + 1, 'w_sqrtest', 'Count only the whole numbers strictly between the two roots.'), tr(ans - 1, 'w_sqrtest', 'Count from ' + (fa + 1) + ' to ' + fb + ', including both.'), tr(b - a - 1, 'w_sqrtest', 'Count whole numbers between the roots, not between ' + a + ' and ' + b + '.')]) };
      }
      let n; do { n = d === 0 ? R.i(2, 150) : d === 1 ? R.i(10, 200) : R.i(200, 1000); } while (Number.isInteger(Math.sqrt(n)));
      const k = Math.floor(Math.sqrt(n)), lo = k * k, hi = (k + 1) * (k + 1);
      if (d === 0) return { text: B(rt(n)) + ' is between two whole numbers next to each other. What is the smaller one?', ans: k,
        how: ['Find the squares on each side of ' + n + ': ' + sq(k) + ' = ' + lo + ' and ' + sq(k + 1) + ' = ' + hi + '.', lo + ' &lt; ' + n + ' &lt; ' + hi + ', so ' + rt(n) + ' is between ' + k + ' and ' + (k + 1) + '. The smaller is ' + B(k) + '.'],
        steps: [st('What is the biggest square number that is less than ' + n + '?', lo), st('What number squared makes ' + lo + '?', k)],
        traps: TR([tr(k + 1, 'w_sqrtest', 'That is the bigger one. ' + rt(n) + ' is more than ' + k + ' but less than ' + (k + 1) + '.'), tr(Number.isInteger(n / 2) ? n / 2 : null, 'w_roots', 'A square root is not half: which number times itself is close to ' + n + '?'), tr(lo, 'w_roots', lo + ' is the square. Its root is the answer.')]) };
      const ans = near(n);
      return { text: 'What is ' + B(rt(n)) + ' to the nearest whole number?', ans,
        how: [n + ' is between ' + sq(k) + ' = ' + lo + ' and ' + sq(k + 1) + ' = ' + hi + '.',
          n + ' is ' + (n - lo) + ' above ' + lo + ' and ' + (hi - n) + ' below ' + hi + ', so it is closer to ' + (ans === k ? lo : hi) + '. ' + rt(n) + ' is about ' + B(ans) + '.'],
        steps: [st('What is the biggest square number less than ' + n + '?', lo), st('What is the smallest square number more than ' + n + '?', hi), st(num(n) + ' is between ' + num(lo) + ' and ' + num(hi) + '. Is ' + rt(n) + ' closer to ' + k + ' or ' + (k + 1) + '?', ans)],
        traps: TR([tr(ans === k ? k + 1 : k, 'w_sqrtest', n + ' is closer to ' + (ans === k ? lo : hi) + ', so the root is closer to ' + ans + '.'), tr(Math.round(n / 2), 'w_roots', 'A square root is not half: which number times itself is close to ' + n + '?')]) };
    } },

  { id: 'w_sci', s: 'pow', g: 8, title: 'Scientific notation', pre: ['f_decx10'], paper: true,
    tip: 'Scientific notation is a number from 1 to 10 times a power of 10. 3,200,000 = 3.2 × 10⁶ (the point moves 6 places). 0.00052 = 5.2 × 10⁻⁴.',
    gen(d, R) {
      const A = R.i(12, 99); if (A % 10 === 0) return null;
      const a = A / 10;
      if (d === 0) {
        const n = R.i(3, 7), V = A * P(10, n - 1);
        if (R.chance(.5)) return { text: 'Write ' + B(num(a) + ' × ' + pw(10, n)) + ' as an ordinary number.', ans: V,
          how: [num(a) + ' × ' + pw(10, n), why('= ' + num(a) + ' × ' + num(P(10, n)), pw(10, n) + ' is 1 with ' + zw(n)), why('= ' + B(num(V)), 'the point moves ' + n + ' places right')],
          steps: [st('Write ' + B(pw(10, n)) + ' out.', P(10, n)), st(B(num(a) + ' × ' + num(P(10, n))) + ' = ?', V)],
          traps: TR([tr(V * 10, 'n_times10', 'Move the point exactly ' + n + ' places.'), tr(V / 10, 'n_times10', 'Move the point exactly ' + n + ' places.'), tr(A * P(10, n), 'w_sci', num(a) + ' already has a digit after the point, so it takes one of the moves.')]) };
        return { text: 'Write ' + B(num(V)) + ' in scientific notation: ' + B(num(a) + ' × ' + pw(10, '?')) + '. What is the power?', ans: n,
          how: [num(V) + ' = ' + num(a) + ' × ' + pw(10, '?'), why('the point moves from the end of ' + num(V) + ' to just after the ' + String(A)[0], 'count the places: ' + n), num(V) + ' = ' + num(a) + ' × ' + pw(10, B(n))],
          steps: [st('How many digits does ' + B(num(V)) + ' have?', String(V).length), st('To turn ' + num(V) + ' into ' + num(a) + ', how many places does the point move?', n)],
          traps: TR([tr(n + 1, 'w_sci', 'Count the moves of the point, not the digits.'), tr(n - 1, 'w_sci', 'Count every place the point moves.')]) };
      }
      if (d === 1) {
        const k = R.i(1, 5), V = A / P(10, k + 1);
        if (R.chance(.5)) return { text: 'Write ' + B(num(V)) + ' in scientific notation: ' + B(num(a) + ' × ' + pw(10, '?')) + '. What is the power?', ans: -k,
          how: [num(V) + ' = ' + num(a) + ' × ' + pw(10, '?'), why('the point moves ' + k + ' place' + (k > 1 ? 's' : '') + ' right to make ' + num(a), 'a small number needs a negative power'), '? = ' + B(num(-k))],
          steps: [st('To turn ' + num(V) + ' into ' + num(a) + ', how many places right does the point move?', k), st('The point moves ' + k + (k > 1 ? ' places' : ' place') + '. ' + num(V) + ' is less than 1, so the power is negative. What is the power?', -k)],
          traps: TR([tr(k, 'w_negexp', num(V) + ' is less than 1, so the power of 10 is negative.'), tr(-(k + 1), 'w_sci', 'Count the moves of the point again.'), tr(-(k - 1) || null, 'w_sci', 'Count the moves of the point again.')]) };
        return { text: 'Write ' + B(num(a) + ' × ' + pw(10, MINUS + k)) + ' as an ordinary number.', ans: V,
          how: [num(a) + ' × ' + pw(10, MINUS + k), why('= ' + num(a) + ' ÷ ' + num(P(10, k)), 'a negative power divides'), why('= ' + B(num(V)), 'the point moves ' + k + ' place' + (k > 1 ? 's' : '') + ' left')],
          steps: [st('In ' + B(num(a) + ' × ' + pw(10, MINUS + k)) + ', how many places left does the point move?', k), st('Move the point in ' + num(a) + ' left ' + k + (k > 1 ? ' places' : ' place') + '. What number do you get?', V)],
          traps: TR([tr(A * P(10, k - 1), 'w_negexp', 'A negative power makes the number smaller: divide by ' + num(P(10, k)) + '.'), tr(V * 10, 'n_times10', 'Move the point exactly ' + k + ' places.'), tr(V / 10, 'n_times10', 'Move the point exactly ' + k + ' places.')]) };
      }
      const m = R.i(2, 9), n = R.i(2, 9);
      if (R.chance(.5)) {
        const Bb = R.i(12, 99), Pr = A * Bb; if (Bb % 10 === 0 || Pr < 1000) return null;
        const b = Bb / 10, ab = Pr / 100, c = Pr / 1000, e = m + n + 1;
        return { text: 'Work it out in scientific notation: ' + B('(' + num(a) + ' × ' + pw(10, m) + ') × (' + num(b) + ' × ' + pw(10, n) + ')') + '. What is the power of 10 in the answer?', ans: e,
          how: ['(' + num(a) + ' × ' + num(b) + ') × (' + pw(10, m) + ' × ' + pw(10, n) + ')', why('= ' + num(ab) + ' × ' + pw(10, m + n), 'multiply the numbers, add the powers'),
            why('= ' + num(c) + ' × ' + pw(10, e), num(ab) + ' is 10 or more: move the point one place left and add 1 to the power'), 'power = ' + B(e)],
          steps: [st(B(num(a) + ' × ' + num(b)) + ' = ?', ab), st(B(pw(10, m) + ' × ' + pw(10, n)) + ' = 10 to what power?', m + n), st(B(num(ab) + ' × ' + pw(10, m + n) + ' = ' + num(c) + ' × ' + pw(10, '?')) + '. What is the power?', e)],
          traps: TR([tr(m + n, 'w_sci', num(ab) + ' is more than 10, so it is not in scientific notation yet. Move the point and add 1.'), tr(m * n, 'w_rules', 'Multiplying powers of 10: add the powers.'), tr(m + n - 1, 'w_sci', 'Moving the point left makes the number smaller, so the power goes up by 1.')]) };
      }
      const b = R.i(2, 9), Cc = R.i(12, 99); if (Cc % 10 === 0 || b * Cc < 100 || (b * Cc) % 10 === 0) return null;
      const av = b * Cc / 100, q = Cc / 100, e = m - n - 1;
      return { text: 'Work it out in scientific notation: ' + B('(' + num(av) + ' × ' + pw(10, m) + ') ÷ (' + b + ' × ' + pw(10, n) + ')') + '. What is the power of 10 in the answer?', ans: e,
        how: ['(' + num(av) + ' ÷ ' + b + ') × (' + pw(10, m) + ' ÷ ' + pw(10, n) + ')', why('= ' + num(q) + ' × ' + pw(10, num(m - n)), 'divide the numbers, take away the powers'),
          why('= ' + num(Cc / 10) + ' × ' + pw(10, num(e)), num(q) + ' is less than 1: move the point one place right and take 1 off the power'), 'power = ' + B(num(e))],
        steps: [st(B(num(av) + ' ÷ ' + b) + ' = ?', q), st(B(pw(10, m) + ' ÷ ' + pw(10, n)) + ' = 10 to what power?', m - n), st(B(num(q) + ' × ' + pw(10, num(m - n)) + ' = ' + num(Cc / 10) + ' × ' + pw(10, '?')) + '. What is the power?', e)],
        traps: TR([tr(m - n, 'w_sci', num(q) + ' is less than 1, so move the point right and take 1 off the power.'), tr(m - n + 1, 'w_sci', 'Moving the point right makes the number bigger, so the power goes down by 1.'), tr(m + n - 1, 'w_rules', 'Dividing powers of 10: take away the powers.')]) };
    } },

  { id: 'w_rules', s: 'pow', g: 8, title: 'Exponent rules', pre: [], paper: true,
    tip: 'Same base: multiply → add the powers (x³ · x⁴ = x⁷), divide → take away (x⁹ ÷ x⁴ = x⁵), power of a power → multiply ((x³)⁴ = x¹²).',
    gen(d, R) {
      const X = R.pick(['x', 'a', 'y', 2, 3, 5, 10]);
      const ask = (lhs, ans, how, steps, traps, unk) => ({ text: 'Fill in the power: ' + B(lhs + ' = ' + pw(unk || X, '?')), ans, how, steps, traps: TR(traps) });
      if (d === 0) {
        const a = R.i(2, 9), b = R.i(2, 9), lhs = pw(X, a) + ' × ' + pw(X, b);
        return ask(lhs, a + b, [lhs, why('= ' + pw(X, a + ' + ' + b), a + ' ' + X + '’s times ' + b + ' more ' + X + '’s: multiplying adds the powers'), '= ' + pw(X, B(a + b))],
          [st('Multiplying adds the powers. What is ' + B(a + ' + ' + b) + '?', a + b)],
          [tr(a * b, 'w_rules', 'Multiplying powers of the same base adds the powers: count all the ' + X + '’s.')]);
      }
      if (d === 1) {
        if (R.chance(.5)) {
          const a = R.i(5, 12), b = R.i(2, a - 1), lhs = pw(X, a) + ' ÷ ' + pw(X, b);
          return ask(lhs, a - b, [lhs, why('= ' + pw(X, a + M + b), b + ' of the ' + X + '’s cancel: dividing takes away the powers'), '= ' + pw(X, B(a - b))],
            [st('Dividing takes away the powers. What is ' + B(a + M + b) + '?', a - b)],
            [a % b === 0 ? tr(a / b, 'w_rules', 'Dividing powers takes them away; it does not divide them.') : null, tr(a + b, 'w_rules', 'Dividing takes away the powers.')]);
        }
        const a = R.i(2, 6), b = R.i(2, 5), lhs = supP(pw(X, a), b);
        return ask(lhs, a * b, [lhs, why('= ' + pw(X, a + ' × ' + b), b + ' groups of ' + pw(X, a) + ': a power of a power multiplies'), '= ' + pw(X, B(a * b))],
          [st('For a power of a power, multiply the powers. What is ' + B(a + ' × ' + b) + '?', a * b)],
          [tr(a + b, 'w_rules', 'There are ' + b + ' copies of ' + pw(X, a) + ', so multiply the powers.'), tr(P(a, b), 'w_exp', 'Multiply the powers: ' + a + ' × ' + b + ', not ' + pw(a, b) + '.')]);
      }
      const kind = R.i(0, 2);
      if (kind === 0) {
        const a = R.i(2, 4), b = R.i(2, 4), c = R.i(1, 6), e = R.i(2, a * b + c - 1), r = a * b + c - e, Y = typeof X === 'number' ? 'x' : X;
        const lhs = supP(pw(Y, a), b) + ' × ' + pw(Y, c) + ' ÷ ' + pw(Y, e);
        return ask(lhs, r, [lhs, why('= ' + pw(Y, a * b) + ' × ' + pw(Y, c) + ' ÷ ' + pw(Y, e), 'power of a power: ' + a + ' × ' + b), why('= ' + pw(Y, a * b + ' + ' + c + M + e), 'times adds, divide takes away'), '= ' + pw(Y, B(r))],
          [st(B(supP(pw(Y, a), b)) + ' = ' + Y + ' to what power?', a * b), st('Now add and take away the powers: ' + B(a * b + ' + ' + c + M + e) + ' = ?', r)],
          [tr(a + b + c - e, 'w_rules', 'A power of a power multiplies: ' + supP(pw(Y, a), b) + ' = ' + pw(Y, a * b) + '.'), tr(a * b + c + e, 'w_rules', 'Dividing takes the power away.')], Y);
      }
      if (kind === 1) {
        const [g, s] = R.pick([[2, 2], [2, 3], [3, 2]]), big = P(g, s), a = R.i(2, 5), b = R.i(2, 6), r = s * a + b;
        const lhs = pw(big, a) + ' × ' + pw(g, b);
        return ask(lhs, r, [lhs, why('= ' + supP(pw(g, s), a) + ' × ' + pw(g, b), 'make the bases match: ' + big + ' = ' + pw(g, s)), '= ' + pw(g, s * a) + ' × ' + pw(g, b), '= ' + pw(g, B(r))],
          [st('Write ' + big + ' as a power of ' + g + '. ' + big + ' = ' + g + ' to what power?', s), st(B(supP(pw(g, s), a)) + ' = ' + g + ' to what power?', s * a), st('Now add the powers: ' + B(s * a + ' + ' + b) + ' = ?', r)],
          [tr(a + b, 'w_rules', 'The bases are different. First write ' + big + ' as ' + pw(g, s) + '.'), tr(a * b, 'w_rules', 'Make the bases match first, then add the powers.')], g);
      }
      const k = R.i(2, 5), a = R.i(2, 5), b = R.i(2, 3), K = P(k, b);
      return { text: 'Fill in the number: ' + B(supP(k + pw('x', a), b) + ' = ?' + pw('x', a * b)), ans: K,
        how: [supP(k + pw('x', a), b), why('= ' + pw(k, b) + ' × ' + pw('x', a + ' × ' + b), 'the power goes on every factor'), '= ' + B(K) + pw('x', a * b)],
        steps: [st('The power ' + b + ' goes on the ' + k + ' too. What is ' + B(pw(k, b)) + '?', K)],
        traps: TR([tr(k, 'w_rules', 'The power outside the brackets goes on the ' + k + ' as well as on ' + pw('x', a) + '.'), tr(k * b, 'w_exp', pw(k, b) + ' means ' + Array(b).fill(k).join(' × ') + '.')]) };
    } },

  { id: 'w_negexp', s: 'pow', g: 8, title: 'Zero and negative powers', pre: [],
    tip: 'Any number (not 0) to the power 0 is 1. A negative power means one over: 2⁻³ = 1/2³ = 1/8. It is never a negative number.',
    gen(d, R) {
      if (d === 0) {
        if (R.chance(.5)) { const v = R.i(2, 99), k = R.i(2, 20);
          return { text: 'What is ' + B(pw(v, 0) + ' + ' + k) + '?', ans: Q(k + 1, 1), type: 'frac',
            how: ['Any number (except 0) to the power 0 is 1. (' + pw(v, 3) + ' ÷ ' + pw(v, 3) + ' = ' + pw(v, 0) + ', and anything divided by itself is 1.)', '1 + ' + k + ' = ' + B(k + 1) + '.'],
            steps: [st('What is ' + B(pw(v, 0)) + '?', Q(1, 1), { type: 'frac' }), st(B('1 + ' + k) + ' = ?', Q(k + 1, 1), { type: 'frac' })],
            traps: TR([tr(Q(k, 1), 'w_negexp', pw(v, 0) + ' is 1, not 0.'), tr(Q(v + k, 1), 'w_negexp', pw(v, 0) + ' is 1, not ' + v + '.')]) }; }
        const b = R.i(2, 12);
        return { text: 'What is ' + B(pw(b, MINUS + '1')) + '? Type it as a fraction.', ans: Q(1, b), type: 'frac',
          how: ['A negative power means one over the positive power.', pw(b, MINUS + '1') + ' = 1 ÷ ' + b + ' = ' + B(frac(1, b)) + '.'],
          steps: [st('Write ' + B(pw(b, MINUS + '1')) + ' as one over a number. What is the bottom number?', b)],
          traps: TR([tr(Q(-b, 1), 'w_negexp', 'A negative power does not make a negative number. It means one over.'), tr(Q(-1, b), 'w_negexp', 'The answer is not negative: a negative power means one over.')]) };
      }
      if (d === 1) {
        const [b, n] = R.pick([[2, 2], [2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [4, 2], [4, 3], [5, 2], [5, 3], [6, 2], [10, 2], [10, 3], [7, 2], [8, 2], [9, 2]]), V = P(b, n);
        if (R.chance(.3)) return { text: 'What is ' + B(supP(frac(1, b), MINUS + n)) + '?', ans: Q(V, 1), type: 'frac',
          how: ['A negative power flips the fraction: ' + supP(frac(1, b), MINUS + n) + ' = ' + pw(b, n) + '.', pw(b, n) + ' = ' + B(num(V)) + '.'],
          steps: [st('A negative power flips the fraction. ' + B(supP(frac(1, b), MINUS + n)) + ' = ' + b + ' to what power?', n), st('What is ' + B(pw(b, n)) + '?', Q(V, 1), { type: 'frac' })],
          traps: TR([tr(Q(1, V), 'w_negexp', 'The negative power flips ' + frac(1, b) + ' over to ' + b + '.'), tr(Q(-V, 1), 'w_negexp', 'A negative power flips the number; it does not make it negative.')]) };
        return { text: 'What is ' + B(pw(b, MINUS + n)) + '? Type it as a fraction.', ans: Q(1, V), type: 'frac',
          how: ['A negative power means one over the positive power: ' + pw(b, MINUS + n) + ' = 1 ÷ ' + pw(b, n) + '.', pw(b, n) + ' = ' + num(V) + ', so the answer is ' + B(frac(1, V)) + '.'],
          steps: [st('What is ' + B(pw(b, n)) + '?', V), st('So what is ' + B(pw(b, MINUS + n)) + '?', Q(1, V), { type: 'frac' })],
          traps: TR([tr(Q(-V, 1), 'w_negexp', 'A negative power does not make a negative number. It means one over.'), tr(Q(-1, V), 'w_negexp', 'The answer is not negative: a negative power means one over.'), tr(Q(1, b * n), 'w_exp', pw(b, n) + ' means ' + Array(n).fill(b).join(' × ') + '.')]) };
      }
      const kind = R.i(0, 2);
      if (kind === 0) {
        const [p, q] = R.pick([[2, 3], [3, 2], [3, 4], [2, 5], [5, 2], [4, 3], [1, 2], [1, 3], [3, 5]]), n = R.i(1, 3), ans = Q(P(q, n), P(p, n));
        return { text: 'What is ' + B(supP(frac(p, q), MINUS + n)) + '?', ans, type: 'frac',
          how: ['A negative power flips the fraction: ' + supP(frac(p, q), MINUS + n) + ' = ' + (n === 1 ? fr(q, p) : supP(fr(q, p), n)) + '.', n === 1 ? 'So the answer is ' + B(fq(ans)) + '.' : 'Power on top and bottom: ' + pw(q, n) + ' over ' + pw(p, n) + ' = ' + B(fq(ans)) + '.'],
          steps: [st('Flip ' + frac(p, q) + ' over. What is the new top number?', q), st(n === 1 ? 'So what is ' + B(supP(frac(p, q), MINUS + n)) + '?' : 'What is ' + B(p === 1 ? pw(q, n) : supP(fr(q, p), n)) + '?', ans, { type: 'frac' })],
          traps: TR([tr(Q(P(p, n), P(q, n)), 'w_negexp', 'A negative power flips the fraction over.'), tr(Q(-P(q, n), P(p, n)), 'w_negexp', 'A negative power flips the number; it does not make it negative.')]) };
      }
      if (kind === 1) {
        const b = R.pick([2, 3, 10]), x = R.i(1, 3), y = R.i(1, 3), ans = Q(P(b, x) + P(b, y), P(b, x + y));
        if (x === y) return null;
        return { text: 'What is ' + B(pw(b, MINUS + x) + ' + ' + pw(b, MINUS + y)) + '?', ans, type: 'frac',
          how: [pw(b, MINUS + x) + ' = ' + frac(1, P(b, x)) + ' and ' + pw(b, MINUS + y) + ' = ' + frac(1, P(b, y)) + '.', frac(1, P(b, x)) + ' + ' + frac(1, P(b, y)) + ' = ' + B(fq(ans)) + '.'],
          steps: [st('What is ' + B(pw(b, MINUS + x)) + '?', Q(1, P(b, x)), { type: 'frac' }), st('What is ' + B(pw(b, MINUS + y)) + '?', Q(1, P(b, y)), { type: 'frac' }), st('Add them: ' + B(frac(1, P(b, x)) + ' + ' + frac(1, P(b, y))) + ' = ?', ans, { type: 'frac' })],
          traps: TR([tr(Q(1, P(b, x + y)), 'w_rules', 'You can only add the powers when multiplying. Here, add the two fractions.'), tr(Q(2, P(b, x) + P(b, y)), 'f_addunlike', 'Add fractions with a common bottom, not by adding the bottoms.')]) };
      }
      const b = R.pick([2, 3, 5, 10]), x = R.i(2, 5), y = R.i(1, 6), e = y - x, ans = e >= 0 ? Q(P(b, e), 1) : Q(1, P(b, -e));
      if (e === 0 || P(b, Math.abs(e)) > 1000) return null;
      return { text: 'What is ' + B(pw(b, MINUS + x) + ' × ' + pw(b, y)) + '?', ans, type: 'frac',
        how: ['Same base, so add the powers: ' + MINUS + x + ' + ' + y + ' = ' + num(e) + '.', pw(b, num(e)) + ' = ' + B(fq(ans)) + '.'],
        steps: [st('Add the powers: ' + B(MINUS + x + ' + ' + y) + ' = ?', e), st('What is ' + B(pw(b, num(e))) + '?', ans, { type: 'frac' })],
        traps: TR([tr(e >= 0 ? Q(1, P(b, e)) : Q(P(b, -e), 1), 'w_negexp', 'Check the sign of the power: ' + MINUS + x + ' + ' + y + ' = ' + num(e) + '.'), tr(Q(-P(b, Math.abs(e)), 1), 'w_negexp', 'A negative power means one over, not a negative number.')]) };
    } },

  { id: 'w_radical', s: 'pow', g: 9, title: 'Simplify square roots', pre: ['fa_primefact'], paper: true,
    tip: 'Pull out the biggest square: √72 = √(36 × 2) = √36 × √2 = 6√2.',
    gen(d, R) {
      const smaller = (k, m) => { for (let s = k - 1; s > 1; s--) if (k % s === 0) return s; return null; };
      if (d < 2) {
        const m = d === 0 ? R.pick([2, 3, 5]) : R.pick([2, 3, 5, 6, 7, 10, 11]), k = d === 0 ? R.i(2, 5) : R.i(2, 10), n = k * k * m;
        if (n > 1100) return null;
        const askB = d === 1 && R.chance(.4), s = smaller(k);
        const how = [why(rt(n) + ' = ' + rt(k * k + ' × ' + m), k * k + ' is the biggest square that divides ' + n), '= ' + rt(k * k) + ' × ' + rt(m), '= ' + (askB ? k + rt(B(m)) : B(k) + rt(m))];
        const steps = [st('What is the biggest square number that divides ' + B(n) + '?', k * k), st('What is ' + B(rt(k * k)) + '?', k)];
        if (askB) return { text: 'Write ' + B(rt(n)) + ' in simplest form, a' + rt('b') + '. What is b (the number left under the root)?', ans: m, how, steps: [steps[0], st('What is ' + B(n + ' ÷ ' + k * k) + '?', m)],
          traps: TR([s ? tr(n / (s * s), 'w_radical', 'There is a bigger square inside: ' + k * k + ' divides ' + n + '.') : null, tr(k, 'w_radical', 'That is the number in front. b is what stays under the root.')]) };
        return { text: 'Simplify: ' + B(rt(n) + ' = a' + rt(m)) + '. What is a?', ans: k, how, steps,
          traps: TR([tr(k * k, 'w_roots', 'Take the square root of ' + k * k + ': ' + rt(k * k) + ' = ' + k + '.'), s ? tr(s, 'w_radical', 'Use the biggest square that divides ' + n + ', which is ' + k * k + '.') : null, tr(k * k % 2 === 0 ? k * k / 2 : null, 'w_roots', 'A square root is not half: ' + rt(k * k) + ' = ' + k + '.')]) };
      }
      const kind = R.i(0, 2), m = R.pick([2, 3, 5, 6, 7]);
      if (kind === 0) {
        const s = R.i(1, 4), t = R.i(1, 4); if (s === t && R.chance(.5)) return null;
        const p = m * s * s, q = m * t * t, ans = m * s * t;
        return { text: 'What is ' + B(rt(p) + ' × ' + rt(q)) + '?', ans,
          how: [why(rt(p) + ' × ' + rt(q) + ' = ' + rt(p + ' × ' + q), 'roots multiply'), '= ' + rt(num(p * q)), why('= ' + B(ans), ans + ' × ' + ans + ' = ' + num(p * q))],
          steps: [st(B(p + ' × ' + q) + ' = ?', p * q), st('What is ' + B(rt(num(p * q))) + '?', ans)],
          traps: TR([tr(p * q, 'w_roots', 'Now take the square root of ' + num(p * q) + '.'), tr(Number.isInteger(Math.sqrt(p + q)) ? Math.sqrt(p + q) : null, 'w_radical', 'Roots multiply inside: ' + rt(p) + ' × ' + rt(q) + ' = ' + rt(p + ' × ' + q) + '.')]) };
      }
      if (kind === 1) {
        const c = R.i(2, 5), k = R.i(2, 6), n = k * k * m;
        return { text: 'Simplify: ' + B(c + rt(n) + ' = a' + rt(m)) + '. What is a?', ans: c * k,
          how: [c + rt(n) + ' = ' + c + ' × ' + rt(k * k + ' × ' + m), why('= ' + c + ' × ' + k + rt(m), rt(k * k) + ' = ' + k), '= ' + B(c * k) + rt(m)],
          steps: [st('Simplify ' + rt(n) + ' first: ' + rt(n) + ' = ?' + rt(m) + '. What is ?', k), st('Now times ' + c + '. What is a?', c * k)],
          traps: TR([tr(k, 'w_radical', 'Don’t forget the ' + c + ' in front: multiply it too.'), tr(c + k, 'w_radical', 'The ' + c + ' and the ' + k + ' multiply.')]) };
      }
      const s = R.i(1, 5), t = R.i(1, 5); if (s === t) return null;
      const p = m * s * s, q = m * t * t;
      return { text: 'Simplify: ' + B(rt(p) + ' + ' + rt(q) + ' = a' + rt(m)) + '. What is a?', ans: s + t,
        how: [rt(p) + ' + ' + rt(q), why('= ' + (s === 1 ? '' : s) + rt(m) + ' + ' + (t === 1 ? '' : t) + rt(m), 'simplify each root'), why('= ' + B(s + t) + rt(m), 'like terms: ' + s + ' + ' + t + ' of them')],
        steps: [st('Simplify ' + B(rt(p)) + ' = ?' + rt(m) + '. What is ?', s), st('Simplify ' + B(rt(q)) + ' = ?' + rt(m) + '. What is ?', t), st('Add the like terms. What is a?', s + t)],
        traps: TR([tr(s * t, 'w_radical', 'Adding like terms adds the numbers in front.'), tr(Number.isInteger(Math.sqrt(p + q)) ? Math.sqrt(p + q) : null, 'w_radical', 'Roots don’t add inside. Simplify each one, then add the like terms.')]) };
    } },

  { id: 'w_fracexp', s: 'pow', g: 10, title: 'Fraction powers: roots', pre: [], paper: true,
    tip: 'The bottom of the fraction is the root, the top is the power: 8^(2/3) = (∛8)² = 2² = 4. Root first keeps the numbers small.',
    gen(d, R) {
      const rootOf = (b, n) => (n === 2 ? rt(num(b)) : rt(num(b), n)), rName = n => (n === 2 ? 'square root' : n === 3 ? 'cube root' : n + 'th root');
      if (d === 0) {
        const [n, r] = R.pick([[2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [2, 11], [3, 2], [3, 3], [3, 4], [3, 5], [3, 10], [4, 2], [4, 3], [5, 2]]), b = P(r, n);
        return { text: 'What is ' + B(pw(num(b), fsl(1, n))) + '?', ans: Q(r, 1), type: 'frac',
          how: [why(pw(num(b), fsl(1, n)) + ' = ' + rootOf(b, n), 'the bottom ' + n + ' means the ' + rName(n)), why('= ' + B(r), Array(n).fill(r).join(' × ') + ' = ' + num(b))],
          steps: [st('Which number multiplied by itself ' + (n === 2 ? '' : n + ' times ') + 'makes ' + num(b) + '?', Q(r, 1), { type: 'frac' })],
          traps: TR([tr(Q(b, n), 'w_fracexp', 'A fraction power is a root, not dividing by ' + n + '.'), tr(Q(r + 1, 1), 'w_roots', 'Check: ' + Array(n).fill(r + 1).join(' × ') + ' = ' + num(P(r + 1, n)) + '.')]) };
      }
      const L = [[8, 2, 3], [27, 2, 3], [64, 2, 3], [125, 2, 3], [16, 3, 4], [81, 3, 4], [4, 3, 2], [9, 3, 2], [25, 3, 2], [16, 3, 2], [32, 2, 5], [32, 3, 5], [1000, 2, 3], [36, 3, 2], [49, 3, 2], [8, 4, 3], [16, 5, 4], [100, 3, 2]];
      if (d === 1 || R.chance(.35)) {
        const [b, m, n] = R.pick(L), r = Math.round(P(b, 1 / n)), V = P(r, m), neg = d === 2;
        const ex = (neg ? MINUS : '') + fsl(m, n), ans = neg ? Q(1, V) : Q(V, 1);
        const how = neg ? [pw(num(b), ex) + ' = 1 ÷ ' + pw(num(b), fsl(m, n)), why('= 1 ÷ ' + supP(rootOf(b, n), m), 'root first: the bottom ' + n), '= 1 ÷ ' + pw(r, m) + ' = 1 ÷ ' + num(V), '= ' + B(fq(ans))]
          : [why(pw(num(b), ex) + ' = ' + supP(rootOf(b, n), m), 'root first: the bottom ' + n + ' is the root, the top ' + m + ' is the power'), why('= ' + pw(r, m), rootOf(b, n) + ' = ' + r), '= ' + B(num(V))];
        return { text: 'What is ' + B(pw(num(b), ex)) + '?', ans, type: 'frac', how,
          steps: [st('What is ' + B(rootOf(b, n)) + '?', Q(r, 1), { type: 'frac' }), st('What is ' + B(pw(r, m)) + '?', Q(V, 1), { type: 'frac' })].concat(neg ? [st('Now one over that. What is the answer?', ans, { type: 'frac' })] : []),
          traps: TR([Number.isInteger(b * m / n) ? tr(Q(b * m, n), 'w_fracexp', 'A fraction power is a root and a power, not times ' + fsl(m, n) + '.') : null, tr(Q(r, 1), 'w_fracexp', 'You took the root. Now raise it to the power ' + m + '.'),
            neg ? tr(Q(V, 1), 'w_negexp', 'The negative power means one over.') : tr(Q(1, V), 'w_negexp', 'The power is positive, so no flipping.'), neg ? tr(Q(-V, 1), 'w_negexp', 'A negative power means one over, not a negative number.') : null]) };
      }
      if (R.chance(.5)) {
        const [p, q, m, n] = R.pick([[4, 9, 3, 2], [8, 27, 2, 3], [16, 81, 3, 4], [1, 8, 2, 3], [9, 25, 3, 2], [1, 27, 2, 3], [4, 25, 3, 2], [27, 64, 2, 3], [1, 16, 3, 4]]);
        const rp = Math.round(P(p, 1 / n)), rq = Math.round(P(q, 1 / n)), ans = Q(P(rp, m), P(rq, m));
        return { text: 'What is ' + B(supP(frac(p, q), fsl(m, n))) + '?', ans, type: 'frac',
          how: [why(supP(frac(p, q), fsl(m, n)) + ' = ' + supP(frac(rp, rq), m), 'the ' + rName(n) + ' of top and bottom'), '= ' + pw(rp, m) + ' over ' + pw(rq, m), '= ' + B(fq(ans))],
          steps: [st('What is the ' + rName(n) + ' of ' + frac(p, q) + '?', Q(rp, rq), { type: 'frac' }), st('Now to the power ' + m + '.', ans, { type: 'frac' })],
          traps: TR([tr(Q(rp, rq), 'w_fracexp', 'You took the root. Now raise it to the power ' + m + '.'), tr(Q(P(rq, m), P(rp, m)), 'w_negexp', 'The power is positive, so the fraction does not flip.')]) };
      }
      const [b, dec, m, n] = R.pick([[32, '0.4', 2, 5], [16, '0.75', 3, 4], [25, '1.5', 3, 2], [4, '2.5', 5, 2], [9, '1.5', 3, 2], [100, '1.5', 3, 2], [32, '0.6', 3, 5], [64, '1.5', 3, 2], [36, '1.5', 3, 2]]);
      const r = Math.round(P(b, 1 / n)), V = P(r, m);
      return { text: 'What is ' + B(pw(b, dec)) + '?', ans: Q(V, 1), type: 'frac',
        how: [why(pw(b, dec) + ' = ' + pw(b, fsl(m, n)), dec + ' = ' + fsl(m, n)), why('= ' + supP(rootOf(b, n), m) + ' = ' + pw(r, m), rootOf(b, n) + ' = ' + r), '= ' + B(num(V))],
        steps: [st('Write ' + dec + ' as a fraction. What is the bottom number?', n), st('What is ' + B(rootOf(b, n)) + '?', Q(r, 1), { type: 'frac' }), st('Now to the power ' + m + '.', Q(V, 1), { type: 'frac' })],
        traps: TR([tr(Q(Math.round(b * Number(dec) * 100), 100), 'w_fracexp', 'A decimal power is still a fraction power: a root and a power, not times ' + dec + '.'), tr(Q(r, 1), 'w_fracexp', 'You took the root. Now raise it to the power ' + m + '.')]) };
    } },

  { id: 'w_expeq', s: 'pow', g: 10, title: 'Make the bases match', pre: ['x_onestep'], paper: true,
    tip: 'Write both sides as powers of the same number, then set the powers equal. 4ˣ = 32: (2²)ˣ = 2⁵, so 2x = 5 and x = 5/2.',
    gen(d, R) {
      const F = { type: 'frac' };
      if (d === 0) {
        const b = R.pick([2, 3, 5, 10]), k = R.i(2, b === 2 ? 10 : b === 3 ? 6 : b === 5 ? 4 : 6), V = P(b, k);
        return { text: 'Solve: ' + B(pw(b, 'x') + ' = ' + num(V)), ans: Q(k, 1), type: 'frac',
          how: [pw(b, 'x') + ' = ' + num(V), why(pw(b, 'x') + ' = ' + pw(b, k), chainP(b, k)), 'x = ' + B(k)],
          steps: [st('Write ' + num(V) + ' as a power of ' + b + '. ' + b + ' to what power?', Q(k, 1), F)],
          traps: TR([tr(Q(V, b), 'w_expeq', 'x is the power: how many ' + b + 's multiply to make ' + num(V) + '?'), tr(Q(k + 1, 1), 'w_exp', 'Count again: ' + chainP(b, k) + '.'), tr(Q(k - 1, 1), 'w_exp', 'Count again: ' + chainP(b, k) + '.')]) };
      }
      const kind = d === 1 ? R.i(0, 2) : R.i(3, 5);
      if (kind === 0 || kind === 5) {
        const L = kind === 0 ? [[4, 32, 2], [8, 4, 2], [9, 27, 3], [27, 9, 3], [25, 125, 5], [16, 8, 2], [4, 8, 2], [8, 16, 2], [16, 32, 2], [32, 8, 2], [125, 25, 5], [16, 64, 2], [81, 27, 3]] : [[25, -125, 5], [4, -8, 2], [8, -4, 2], [9, -27, 3], [16, -8, 2], [27, -3, 3], [4, -2, 2], [32, -4, 2]];
        const [c, dd, g] = R.pick(L), dv = Math.abs(dd), s = Math.round(Math.log(c) / Math.log(g)), t0 = Math.round(Math.log(dv) / Math.log(g)), t = dd < 0 ? -t0 : t0, ans = Q(t, s);
        const rhs = dd < 0 ? frac(1, dv) : num(dv), rhsP = pw(g, num(t));
        return { text: 'Solve: ' + B(pw(c, 'x') + ' = ' + rhs), ans, type: 'frac',
          how: [pw(c, 'x') + ' = ' + rhs, why(supP(pw(g, s), 'x') + ' = ' + rhsP, c + ' = ' + pw(g, s) + (dd < 0 ? ' and ' + frac(1, dv) + ' = ' + pw(g, num(t)) : ' and ' + dv + ' = ' + pw(g, t))), why(s + 'x = ' + num(t), 'power of a power: ' + pw(g, s + 'x')), 'x = ' + B(fq(ans))],
          steps: [st('Write ' + c + ' as a power of ' + g + '. ' + g + ' to what power?', Q(s, 1), F), st('Write ' + rhs + ' as a power of ' + g + '. ' + g + ' to what power?', Q(t, 1), F), st('Solve ' + s + 'x = ' + num(t) + '.', ans, F)],
          traps: TR([dd > 0 ? tr(Q(dv, c), 'w_expeq', 'Don’t divide the numbers. Write both as powers of ' + g + ' and compare the powers.') : null, tr(Q(t, 1), 'w_rules', '(' + pw(g, s) + ')<sup>x</sup> is ' + pw(g, s + 'x') + ', so divide by ' + s + '.'), tr(Q(s, t), 'w_expeq', 'Solve ' + s + 'x = ' + num(t) + ': x = ' + num(t) + ' ÷ ' + s + '.'), dd < 0 ? tr(Q(-t, s), 'w_negexp', 'One over a power is a negative power.') : null]) };
      }
      if (kind === 1 || kind === 2) {
        const b = R.pick([2, 3, 5]), k = R.i(2, b === 2 ? 7 : 4), V = P(b, k), a = kind === 1 ? 1 : R.i(2, 3), p = nonzero(R, -4, 4), ans = Q(k - p, a);
        if (k === p) return null;
        const lhsE = (a === 1 ? 'x' : a + 'x') + ' ' + (p < 0 ? MINUS + ' ' + -p : '+ ' + p);
        return { text: 'Solve: ' + B(pw(b, lhsE) + ' = ' + num(V)), ans, type: 'frac',
          how: [pw(b, lhsE) + ' = ' + num(V), why(pw(b, lhsE) + ' = ' + pw(b, k), num(V) + ' = ' + pw(b, k)), why(lhsE + ' = ' + k, 'same base, so the powers are equal'), (a === 1 ? '' : a + 'x = ' + num(k - p) + ',  ') + 'x = ' + B(fq(ans))],
          steps: [st('Write ' + num(V) + ' as a power of ' + b + '. ' + b + ' to what power?', Q(k, 1), F), st('Solve ' + lhsE + ' = ' + k + '.', ans, F)],
          traps: TR([tr(Q(k + p, a), 'n_intsub', 'Undo the ' + (p < 0 ? MINUS + ' ' + -p : '+ ' + p) + ': ' + (p < 0 ? 'add ' + -p : 'take away ' + p) + '.'), tr(Q(k, a), 'w_expeq', 'Set the whole power equal: ' + lhsE + ' = ' + k + '.'), a > 1 ? tr(Q(k - p, 1), 'x_onestep', 'Then divide by ' + a + '.') : null]) };
      }
      if (kind === 3) {
        const [g, s, t] = R.pick([[2, 2, 3], [2, 3, 2], [2, 1, 2], [2, 2, 1], [3, 1, 2], [3, 2, 1], [2, 3, 4], [2, 1, 3], [3, 1, 3]]), p = R.i(1, 3), ans = Q(s * p, t - s), cS = P(g, s), cT = P(g, t);
        const sx = s === 1 ? 'x + ' + p : s + '(x + ' + p + ')';
        return { text: 'Solve: ' + B(pw(cS, 'x + ' + p) + ' = ' + pw(cT, 'x')), ans, type: 'frac',
          how: [pw(cS, 'x + ' + p) + ' = ' + pw(cT, 'x'), why(pw(g, sx) + ' = ' + pw(g, (t === 1 ? '' : t) + 'x'), 'write both as powers of ' + g), (s === 1 ? 'x + ' + p : s + 'x + ' + s * p) + ' = ' + (t === 1 ? '' : t) + 'x', why('x = ' + B(fq(ans)), (t - s > 0 ? s * p + ' = ' + (t - s === 1 ? '' : t - s) + 'x' : MINUS + (s - t === 1 ? '' : s - t) + 'x = ' + MINUS + s * p) )],
          steps: [st('Write ' + cS + ' as a power of ' + g + '. ' + g + ' to what power?', Q(s, 1), F), st('Write ' + cT + ' as a power of ' + g + '. ' + g + ' to what power?', Q(t, 1), F), st('Solve ' + (s === 1 ? 'x + ' + p : s + '(x + ' + p + ')') + ' = ' + (t === 1 ? '' : t) + 'x.', ans, F)],
          traps: TR([tr(Q(p, t - s), 'x_distribute', 'Multiply out ' + s + '(x + ' + p + '): the ' + s + ' goes on the ' + p + ' too.'), tr(Q(-s * p, t - s), 'n_intsub', 'Check the signs when you move the x terms to one side.'), tr(Q(s * p, t + s), 'x_bothsides', 'Take ' + s + 'x from both sides.')]) };
      }
      const b = R.pick([2, 3, 5, 10]), k = R.i(2, b === 2 ? 6 : 3), V = P(b, k), ans = Q(-k, 1);
      return { text: 'Solve: ' + B(supP(frac(1, b), 'x') + ' = ' + num(V)), ans, type: 'frac',
        how: [supP(frac(1, b), 'x') + ' = ' + num(V), why(pw(b, MINUS + 'x') + ' = ' + pw(b, k), frac(1, b) + ' = ' + pw(b, MINUS + '1')), MINUS + 'x = ' + k, 'x = ' + B(num(-k))],
        steps: [st('Write ' + frac(1, b) + ' as a power of ' + b + '. ' + b + ' to what power?', Q(-1, 1), F), st('Solve ' + MINUS + 'x = ' + k + '.', ans, F)],
        traps: TR([tr(Q(k, 1), 'w_negexp', frac(1, b) + ' is ' + pw(b, MINUS + '1') + ', so the power is ' + MINUS + 'x.'), tr(Q(-V, 1), 'w_expeq', 'x is a power: write ' + num(V) + ' as a power of ' + b + '.')]) };
    } },

  { id: 'w_growth', s: 'pow', g: 10, title: 'Doubling and half-life', pre: [], paper: true,
    tip: 'Count the doublings or halvings, then multiply or divide by 2 that many times. 640 g with a half-life of 3 days, after 12 days: 4 halvings, 40 g.',
    gen(d, R) {
      if (d === 0 || (d === 1 && R.chance(.5))) {
        const per = d === 0 ? 60 : R.pick([15, 20, 30]), hrs = d === 0 ? R.i(2, 5) : R.i(1, 2), n = hrs * 60 / per, s = d === 0 ? 5 * R.i(2, 20) : R.i(2, 12), ans = s * P(2, n);
        if (n > 8) return null;
        const perW = per === 60 ? 'every hour' : 'every ' + per + ' minutes';
        return { text: 'A colony of bacteria doubles ' + perW + '. It starts with ' + B(num(s)) + '. How many are there after ' + B(C.plural(hrs, hrs + ' hour', hrs + ' hours')) + '?', ans,
          how: [why('doublings = ' + (per === 60 ? n : hrs * 60 + ' ÷ ' + per + ' = ' + n), per === 60 ? 'one each hour' : C.plural(hrs, hrs + ' hour', hrs + ' hours') + ' is ' + hrs * 60 + ' minutes'), num(s) + ' × ' + pw(2, n) + ' = ' + num(s) + ' × ' + P(2, n), '= ' + B(num(ans)) + '   (check: ' + num(s) + ' → ' + Array.from({ length: n }, (_, i) => num(s * P(2, i + 1))).join(' → ') + ')'],
          steps: [st('How many times does it double?', n), st('What is ' + B(pw(2, n)) + '?', P(2, n)), st(B(num(s) + ' × ' + P(2, n)) + ' = ?', ans)],
          traps: TR([tr(s + s * n, 'w_growth', 'Doubling multiplies by 2 each time; it does not add ' + num(s) + ' each time.'), tr(s * 2 * n, 'w_growth', 'Doubling ' + n + ' times is × ' + pw(2, n) + ', not × 2 × ' + n + '.'), tr(s * P(2, n - 1), 'w_growth', 'Count the doublings: there are ' + n + '.')]) };
      }
      const T = R.i(2, 10), n = R.i(2, 6), k = R.i(1, 25), s = k * P(2, n);
      if (d === 1) return { text: 'A sample of ' + B(num(s) + ' g') + ' has a half-life of ' + B(T + ' days') + '. How much is left after ' + B(n * T + ' days') + '?', ans: k, unit: 'g',
        how: [why('half-lives = ' + n * T + ' ÷ ' + T + ' = ' + n, 'each half-life halves it'), num(s) + ' ÷ ' + pw(2, n) + ' = ' + num(s) + ' ÷ ' + P(2, n), '= ' + B(k) + ' g   (check: ' + num(s) + ' → ' + Array.from({ length: n }, (_, i) => num(s / P(2, i + 1))).join(' → ') + ')'],
        steps: [st('How many half-lives is ' + n * T + ' days?', n), st('What is ' + B(pw(2, n)) + '?', P(2, n)), st(B(num(s) + ' ÷ ' + P(2, n)) + ' = ?', k)],
        traps: TR([tr(s / (2 * n), 'w_growth', 'Halving ' + n + ' times divides by ' + pw(2, n) + ', not by 2 × ' + n + '.'), tr(s / P(2, n - 1), 'w_growth', 'Count the half-lives: ' + n * T + ' ÷ ' + T + ' = ' + n + '.'), tr(s - s / 2 * n > 0 ? s - s / 2 * n : null, 'w_growth', 'Each half-life halves what is left, not the starting amount.')]) };
      const up = R.chance(.5), E = up ? s : k, S0 = up ? k : s, unit = up ? 'minutes' : 'days', per = up ? R.pick([10, 15, 20, 30]) : T, ans = n * per;
      return { text: up ? 'Bacteria double every ' + B(per + ' minutes') + '. How long until ' + B(num(S0)) + ' become ' + B(num(E)) + '?' : 'A sample has a half-life of ' + B(per + ' days') + '. How long until ' + B(num(S0) + ' g') + ' is down to ' + B(num(E) + ' g') + '?', ans, unit,
        how: [why((up ? num(E) + ' ÷ ' + num(S0) : num(S0) + ' ÷ ' + num(E)) + ' = ' + P(2, n), up ? 'how many times bigger' : 'how many times smaller'), why(P(2, n) + ' = ' + pw(2, n), n + (up ? ' doublings' : ' half-lives')), 'time = ' + n + ' × ' + per + ' = ' + B(ans) + ' ' + unit],
        steps: [st('How many times ' + (up ? 'bigger' : 'smaller') + ' is it?', P(2, n)), st('How many ' + (up ? 'doublings' : 'half-lives') + ' is that?', n), st('How long is that?', ans)],
        traps: TR([tr(n, 'w_growth', 'That is the number of ' + (up ? 'doublings' : 'half-lives') + '. Multiply by ' + per + ' ' + unit + '.'), tr(P(2, n) * per, 'w_growth', P(2, n) + ' times ' + (up ? 'bigger' : 'smaller') + ' is ' + n + (up ? ' doublings' : ' half-lives') + ', because ' + pw(2, n) + ' = ' + P(2, n) + '.'), tr(P(2, n) / 2 * per, 'w_growth', 'Count the ' + (up ? 'doublings' : 'halvings') + ': 2 multiplied by itself ' + n + ' times makes ' + P(2, n) + '.')]) };
    } },

  { id: 'w_log', s: 'pow', g: 10, title: 'Logs: what power?', pre: [],
    tip: 'log₂ 32 asks: 2 to what power is 32? 2⁵ = 32, so log₂ 32 = 5. log₁₀ 0.01 = −2, because 10⁻² = 0.01.',
    gen(d, R) {
      const F = { type: 'frac' };
      if (d === 0) {
        const b = R.pick([2, 3, 4, 5, 10]), k = R.i(2, b === 2 ? 8 : b === 3 ? 5 : b === 10 ? 6 : 4), V = P(b, k);
        return { text: 'What is ' + B(logS(b, num(V))) + '?', ans: Q(k, 1), type: 'frac',
          how: [logS(b, num(V)) + ' asks: ' + b + ' to what power makes ' + num(V) + '?', chainP(b, k) + ': that is ' + pw(b, k) + ', so the answer is ' + B(k) + '.'],
          steps: [st(B(pw(b, '?') + ' = ' + num(V)) + '. What is the power?', Q(k, 1), F)],
          traps: TR([tr(Q(V, b), 'w_log', 'A log is a power, not a division: ' + b + ' to what power makes ' + num(V) + '?'), tr(Q(k + 1, 1), 'w_exp', 'Count again: ' + chainP(b, k) + '.'), tr(Q(k - 1, 1), 'w_exp', 'Count again: ' + chainP(b, k) + '.')]) };
      }
      if (d === 1) {
        const kind = R.i(0, 2);
        if (kind === 0) {
          const b = R.pick([2, 3, 5, 10]), k = R.i(1, b === 2 ? 5 : 3), V = P(b, k), xS = b === 10 ? num(1 / V) : frac(1, V);
          return { text: 'What is ' + B(logS(b, xS)) + '?', ans: Q(-k, 1), type: 'frac',
            how: [logS(b, xS) + ' asks: ' + b + ' to what power makes ' + xS + '?', xS + ' = ' + (b === 10 ? frac(1, V) + ' = ' : '') + '1 ÷ ' + pw(b, k) + ' = ' + pw(b, MINUS + k) + ', so the answer is ' + B(num(-k)) + '.'],
            steps: [st('What power of ' + b + ' is ' + num(V) + '?', Q(k, 1), F), st('One over it makes the power negative. What is the answer?', Q(-k, 1), F)],
            traps: TR([tr(Q(k, 1), 'w_negexp', 'One over a power of ' + b + ' is a negative power.'), tr(Q(1, V), 'w_log', 'The log is the power, not the number itself.')]) };
        }
        const [b, x] = R.pick([[4, 2], [9, 3], [8, 2], [25, 5], [27, 3], [16, 2], [100, 10], [16, 4], [64, 4], [64, 8], [49, 7], [36, 6], [1000, 10], [81, 9], [125, 5]]), s = Math.round(Math.log(b) / Math.log(x)), ans = Q(1, s);
        return { text: 'What is ' + B(logS(b, x)) + '?', ans, type: 'frac',
          how: [logS(b, x) + ' asks: ' + b + ' to what power makes ' + x + '?', x + ' is the ' + (s === 2 ? 'square' : s === 3 ? 'cube' : s + 'th') + ' root of ' + b + ', and a root is the power ' + fsl(1, s) + '. So the answer is ' + B(frac(1, s)) + '.'],
          steps: [st(B(pw(x, '?') + ' = ' + b) + '. What is the power?', Q(s, 1), F), st('So ' + b + ' to what power is ' + x + '?', ans, F)],
          traps: TR([tr(Q(s, 1), 'w_log', 'That is ' + logS(x, b) + '. Here ' + b + ' is the base: the power must make ' + b + ' smaller, into ' + x + '.'), tr(Q(x, b), 'w_log', 'A log is a power, not a division.')]) };
      }
      const kind = R.i(0, 2);
      if (kind === 0) {
        const [g, s, t] = R.pick([[2, 2, 3], [2, 3, 2], [3, 2, 3], [3, 3, 2], [2, 4, 3], [2, 3, 4], [5, 2, 3], [2, 2, 5], [2, 4, 5], [2, 5, 2], [3, 4, 2]]), b = P(g, s), x = P(g, t), ans = Q(t, s);
        return { text: 'What is ' + B(logS(b, x)) + '?', ans, type: 'frac',
          how: ['Write both as powers of ' + g + ': ' + b + ' = ' + pw(g, s) + ' and ' + x + ' = ' + pw(g, t) + '.', supP(pw(g, s), '?') + ' = ' + pw(g, t) + ' means ' + s + ' × ? = ' + t + ', so the answer is ' + B(fq(ans)) + '.'],
          steps: [st(b + ' = ' + g + ' to what power?', Q(s, 1), F), st(x + ' = ' + g + ' to what power?', Q(t, 1), F), st('Solve ' + s + ' × ? = ' + t + '.', ans, F)],
          traps: TR([tr(Q(s, t), 'w_log', 'Flip it: ' + s + ' × ? = ' + t + ', so ? = ' + fsl(t, s) + '.'), tr(Q(x, b), 'w_log', 'A log is a power, not a division.')]) };
      }
      const b = R.pick([2, 3, 4, 5, 10]), k = R.i(2, b === 2 ? 6 : 3), V = P(b, k);
      if (kind === 1) return { text: B(logS('b', num(V)) + ' = ' + k) + '. What is b?', ans: Q(b, 1), type: 'frac',
        how: [logS('b', num(V)) + ' = ' + k + ' means ' + pw('b', k) + ' = ' + num(V) + '.', 'Which number to the power ' + k + ' is ' + num(V) + '? ' + Array(k).fill(b).join(' × ') + ' = ' + num(V) + ', so b = ' + B(b) + '.'],
        steps: [st('Rewrite it: ' + pw('b', k) + ' = ' + num(V) + '. What is b?', Q(b, 1), F)],
        traps: TR([tr(Q(V, k), 'w_log', pw('b', k) + ' is b multiplied ' + k + ' times, not b × ' + k + '.'), tr(Q(b + 1, 1), 'w_exp', 'Check: ' + Array(k).fill(b + 1).join(' × ') + ' = ' + num(P(b + 1, k)) + '.')]) };
      return { text: B(logS(b, 'x') + ' = ' + k) + '. What is x?', ans: Q(V, 1), type: 'frac',
        how: [logS(b, 'x') + ' = ' + k + ' means ' + pw(b, k) + ' = x.', pw(b, k) + ' = ' + chainP(b, k).split(' → ').pop() + ', so x = ' + B(num(V)) + '.'],
        steps: [st('Rewrite it: x = ' + pw(b, k) + '. What is x?', Q(V, 1), F)],
        traps: TR([tr(Q(b * k, 1), 'w_exp', pw(b, k) + ' means ' + Array(k).fill(b).join(' × ') + '.'), tr(Q(P(k, b), 1), 'w_log', 'The small number is the base: x = ' + pw(b, k) + ', not ' + pw(k, b) + '.')]) };
    } },

  { id: 'w_logrules', s: 'pow', g: 11, title: 'Log rules', pre: [], paper: true,
    tip: 'Adding logs multiplies the insides, subtracting divides, and a power inside comes out front: log 4 + log 25 = log 100 = 2; log₂ 8⁵ = 5 log₂ 8 = 15.',
    gen(d, R) {
      const F = { type: 'frac' }, L10 = (x) => 'log ' + x;
      const LS = (b, x) => (b === 10 ? L10(x) : logS(b, x));
      if (d === 0) {
        if (R.chance(.5)) {
          const [b, p, q, k] = R.pick([[10, 4, 25, 2], [10, 2, 50, 2], [10, 5, 20, 2], [10, 20, 50, 3], [10, 8, 125, 3], [10, 40, 25, 3], [10, 4, 250, 3], [6, 4, 9, 2], [6, 2, 18, 2], [6, 3, 12, 2], [6, 8, 27, 3], [12, 16, 9, 2], [15, 9, 25, 2], [10, 200, 5, 3]]), pq = p * q;
          return { text: 'What is ' + B(LS(b, p) + ' + ' + LS(b, q)) + '?', ans: Q(k, 1), type: 'frac',
            how: [LS(b, p) + ' + ' + LS(b, q), why('= ' + LS(b, '(' + p + ' × ' + q + ')'), 'adding logs multiplies the insides'), '= ' + LS(b, num(pq)), why('= ' + B(k), pw(b, k) + ' = ' + num(pq))],
            steps: [st(B(p + ' × ' + q) + ' = ?', Q(pq, 1), F), st('What is ' + B(LS(b, num(pq))) + '?', Q(k, 1), F)],
            traps: TR([tr(Q(pq, 1), 'w_log', 'You found the inside. Now take the log: ' + b + ' to what power is ' + num(pq) + '?'), tr(Q(k + 1, 1), 'w_log', b + ' to what power is ' + num(pq) + '? Count again.')]) };
        }
        const b = R.pick([2, 3, 5]), k = R.i(1, b === 2 ? 4 : 2), q = R.pick([3, 5, 6, 7, 10, 12].filter(v => v !== b)), p = q * P(b, k);
        return { text: 'What is ' + B(logS(b, p) + M + logS(b, q)) + '?', ans: Q(k, 1), type: 'frac',
          how: [logS(b, p) + M + logS(b, q), why('= ' + logS(b, '(' + p + ' ÷ ' + q + ')'), 'subtracting logs divides the insides'), '= ' + logS(b, P(b, k)), why('= ' + B(k), pw(b, k) + ' = ' + P(b, k))],
          steps: [st(B(p + ' ÷ ' + q) + ' = ?', Q(P(b, k), 1), F), st('What is ' + B(logS(b, P(b, k))) + '?', Q(k, 1), F)],
          traps: TR([tr(Q(P(b, k), 1), 'w_log', 'You found the inside. Now take the log: ' + b + ' to what power is ' + P(b, k) + '?'), tr(Q(p - q, 1), 'w_logrules', 'Subtracting logs divides the insides; it does not subtract them.')]) };
      }
      if (d === 1) {
        if (R.chance(.5)) {
          const b = R.pick([2, 3, 10]), m = R.i(1, b === 10 ? 2 : 3), n = R.i(2, 6), base = P(b, m);
          return { text: 'What is ' + B(LS(b, pw(base, n))) + '?', ans: Q(m * n, 1), type: 'frac',
            how: [LS(b, pw(base, n)), why('= ' + n + ' × ' + LS(b, base), 'a power inside comes out in front'), why('= ' + n + ' × ' + m, LS(b, base) + ' = ' + m), '= ' + B(m * n)],
            steps: [st('What is ' + B(LS(b, base)) + '?', Q(m, 1), F), st('Now times ' + n + '.', Q(m * n, 1), F)],
            traps: TR([tr(Q(m + n, 1), 'w_logrules', 'The power comes out in front and multiplies: ' + n + ' × ' + LS(b, base) + '.'), tr(Q(P(base, n), 1), 'w_log', 'That is the number inside. The log is the power of ' + b + '.')]) };
        }
        const [b, x, c, y, k] = R.pick([[10, 5, 2, 4, 2], [10, 5, 3, 8, 3], [10, 2, 2, 25, 2], [10, 2, 3, 125, 3], [6, 3, 2, 4, 2], [6, 2, 2, 9, 2], [12, 2, 4, 9, 2], [12, 3, 2, 16, 2], [10, 4, 2, 625, 4], [10, 20, 2, 25, 4]]);
        const xc = P(x, c), tot = xc * y;
        return { text: 'What is ' + B(c + ' ' + LS(b, x) + ' + ' + LS(b, y)) + '?', ans: Q(k, 1), type: 'frac',
          how: [c + ' ' + LS(b, x) + ' + ' + LS(b, y), why('= ' + LS(b, pw(x, c)) + ' + ' + LS(b, y), 'the number in front becomes a power inside'), why('= ' + LS(b, '(' + xc + ' × ' + y + ')') + ' = ' + LS(b, num(tot)), 'adding logs multiplies'), why('= ' + B(k), pw(b, k) + ' = ' + num(tot))],
          steps: [st('What is ' + B(pw(x, c)) + '?', Q(xc, 1), F), st(B(xc + ' × ' + y) + ' = ?', Q(tot, 1), F), st('What is ' + B(LS(b, num(tot))) + '?', Q(k, 1), F)],
          traps: TR([tr(Q(tot, 1), 'w_log', 'You found the inside. Now take the log.'), tr(Number.isInteger(Math.log(c * x * y) / Math.log(b)) ? Q(Math.round(Math.log(c * x * y) / Math.log(b)), 1) : null, 'w_logrules', 'The ' + c + ' in front becomes a power: ' + pw(x, c) + ', not ' + c + ' × ' + x + '.')]) };
      }
      const kind = R.i(0, 2);
      if (kind === 0) {
        const items = [[8, '2³', [[3, '2']]], [4, '2²', [[2, '2']]], [16, '2⁴', [[4, '2']]], [5, '10 ÷ 2', [[1, '10'], [-1, '2']]], [20, '2 × 10', [[1, '2'], [1, '10']]], [6, '2 × 3', [[1, '2'], [1, '3']]],
          [12, '2² × 3', [[2, '2'], [1, '3']]], [18, '2 × 3²', [[1, '2'], [2, '3']]], [9, '3²', [[2, '3']]], [1.5, '3 ÷ 2', [[1, '3'], [-1, '2']]], [50, '100 ÷ 2', [[1, '100'], [-1, '2']]], [30, '3 × 10', [[1, '3'], [1, '10']]], [0.5, '1 ÷ 2', [[-1, '2']]]];
        const V = { 2: 301, 3: 477, 10: 1000, 100: 2000 }, [x, f, terms] = R.pick(items);
        const val = terms.reduce((s, [c, k]) => s + c * V[k], 0), ans = val / 1000;
        const tS = terms.map(([c, k], i) => (i ? (c < 0 ? M : ' + ') : (c < 0 ? MINUS : '')) + (Math.abs(c) === 1 ? '' : Math.abs(c) + ' ') + 'log ' + k).join('');
        const nS = terms.map(([c, k], i) => (i ? (c < 0 ? M : ' + ') : (c < 0 ? MINUS : '')) + (Math.abs(c) === 1 ? '' : Math.abs(c) + ' × ') + num(V[k] / 1000)).join('');
        const last = terms[terms.length - 1], flip = terms.length > 1 ? (val - 2 * last[0] * V[last[1]]) / 1000 : null;
        return { text: 'Use ' + B('log 2 = 0.301') + ' and ' + B('log 3 = 0.477') + ' (base 10). What is ' + B('log ' + num(x)) + '?', ans,
          how: [why('log ' + num(x) + ' = log (' + f + ')', 'break ' + num(x) + ' into 2s, 3s and 10s'), '= ' + tS, '= ' + nS, '= ' + B(num(ans))],
          steps: [st('Write it with log 2, log 3 and log 10. ' + B('log ' + num(x) + ' = ' + tS) + '. Now put in the numbers: what is it?', ans)],
          traps: TR([flip != null ? tr(flip, 'w_logrules', 'Times inside means add the logs; divide inside means take away.') : null, terms.length === 1 && terms[0][0] > 1 ? tr(x * V[terms[0][1]] / 1000, 'w_logrules', 'log ' + f + ' is ' + terms[0][0] + ' × log ' + terms[0][1] + ': the power comes out in front.') : null, tr((val + 1000) / 1000, 'w_logrules', 'Check each piece: log 10 = 1 only when there is a 10.')]) };
      }
      if (kind === 1) {
        const [g, k] = R.pick([[3, 3], [3, 4], [2, 5], [2, 4], [5, 3], [3, 2], [2, 6], [7, 2], [5, 2]]), X = P(g, k), b = R.pick([2, 10, 5].filter(v => v !== g));
        return { text: 'What is ' + B(LS(b, X) + ' ÷ ' + LS(b, g)) + '?', ans: Q(k, 1), type: 'frac',
          how: [LS(b, X) + ' ÷ ' + LS(b, g), why('= ' + LS(b, pw(g, k)) + ' ÷ ' + LS(b, g), X + ' = ' + pw(g, k)), why('= ' + k + ' × ' + LS(b, g) + ' ÷ ' + LS(b, g), 'the power comes out in front'), '= ' + B(k)],
          steps: [st('Write ' + X + ' as a power of ' + g + '. ' + g + ' to what power?', Q(k, 1), F), st(LS(b, pw(g, k)) + ' = ? × ' + LS(b, g) + '. So what is the answer?', Q(k, 1), F)],
          traps: TR([tr(Q(X, g), 'w_logrules', 'You can’t cancel the logs and divide the insides. Write ' + X + ' as ' + pw(g, k) + '.'), tr(Q(X - g, 1), 'w_logrules', 'Dividing two logs is not the log of a difference.')]) };
      }
      const b = R.pick([10, 2, 3]), k = R.i(b === 10 ? 2 : 3, b === 10 ? 3 : 5), r = R.pick(b === 10 ? [2, 3, 4, 5, 8] : b === 2 ? [3, 5, 7] : [2, 4, 5]), T = P(b, k) * r;
      const divs = []; for (let p = 2; p < T; p++) if (T % p === 0) { const q = T / p; const pow = v => P(b, Math.round(Math.log(v) / Math.log(b))) === v; if (!pow(p) && !pow(q) && p <= q) divs.push(p); }
      if (!divs.length) return null;
      const p = R.pick(divs), q = T / p;
      return { text: 'What is ' + B(LS(b, p) + ' + ' + LS(b, q) + M + LS(b, r)) + '?', ans: Q(k, 1), type: 'frac',
        how: [LS(b, p) + ' + ' + LS(b, q) + M + LS(b, r), why('= ' + LS(b, '(' + p + ' × ' + q + ' ÷ ' + r + ')'), 'add: multiply; take away: divide'), '= ' + LS(b, num(P(b, k))), why('= ' + B(k), pw(b, k) + ' = ' + num(P(b, k)))],
        steps: [st(B(p + ' × ' + q + ' ÷ ' + r) + ' = ?', Q(P(b, k), 1), F), st('What is ' + B(LS(b, num(P(b, k)))) + '?', Q(k, 1), F)],
        traps: TR([tr(Q(P(b, k), 1), 'w_log', 'You found the inside. Now take the log.'), Number.isInteger(Math.log(p * q * r) / Math.log(b)) ? tr(Q(Math.round(Math.log(p * q * r) / Math.log(b)), 1), 'w_logrules', 'Taking away a log divides by ' + r + '.') : null]) };
    } },

  { id: 'w_rule72', s: 'pow', g: 11, title: 'Growth factors and the rule of 72', pre: ['f_pctchange'],
    tip: 'Rule of 72: money growing r% a year doubles in about 72 ÷ r years (8% → 9 years). Growing 6% means × 1.06 each year; shrinking 15% means × 0.85.',
    gen(d, R) {
      if (d === 0) { const r = R.pick([2, 3, 4, 6, 8, 9, 12, 18]), ans = 72 / r;
        return { text: 'Money grows ' + B(r + '%') + ' a year. About how many years until it doubles? Use the rule of 72.', ans, unit: 'years',
          how: ['Rule of 72: years to double ≈ 72 ÷ the yearly percent.', '72 ÷ ' + r + ' = ' + B(ans) + ' years.'],
          traps: TR([tr(100 % r === 0 ? 100 / r : null, 'w_rule72', 'Use 72, not 100: it allows for growth on growth.'), tr(72 * r, 'w_rule72', 'Divide 72 by the percent.')]) }; }
      if (d === 1) {
        if (R.chance(.5)) { const y = R.pick([3, 4, 6, 8, 9, 12, 18, 24]), ans = 72 / y;
          return { text: 'An amount doubles in about ' + B(y + ' years') + '. About what yearly percent growth is that? Use the rule of 72.', ans, unit: '%',
            how: ['Rule of 72: percent × years to double ≈ 72.', '72 ÷ ' + y + ' = ' + B(ans) + '%.'],
            traps: TR([tr(72 * y, 'w_rule72', 'Divide 72 by the years.'), tr(100 % y === 0 ? 100 / y : null, 'w_rule72', 'Use 72, not 100.')]) }; }
        const up = R.chance(.55), r = up ? R.pick([2, 3, 4, 5, 6, 7, 8, 12, 15, 25]) : R.pick([5, 10, 15, 20, 25, 30, 40]), ans = (100 + (up ? r : -r)) / 100;
        return { text: (up ? 'A price grows ' : 'A value shrinks ') + B(r + '%') + ' each year. What do you multiply by each year?', ans,
          how: [up ? 'Each year you keep all of it (1) and add ' + r + '% (' + num(r / 100) + ').' : 'Each year you keep 100% ' + MINUS + ' ' + r + '% = ' + (100 - r) + '% of it.', 'Multiply by ' + (up ? '1 + ' + num(r / 100) : '1 ' + MINUS + ' ' + num(r / 100)) + ' = ' + B(num(ans)) + '.'],
          steps: [st('Write ' + r + '% as a decimal.', r / 100), st((up ? 'Add it to 1.' : 'Take it from 1.') + ' What do you multiply by?', ans)],
          traps: TR([tr(r / 100, 'f_pctchange', 'That is only the change. Keep the 1 for the amount you already have.'), tr(up ? 1 + r / 10 : 1 - r / 10, 'f_pctchange', r + '% is ' + num(r / 100) + ' as a decimal.'), tr(up ? 1 - r / 100 : 1 + r / 100, 'f_pctchange', up ? 'Growing makes it bigger: multiply by more than 1.' : 'Shrinking makes it smaller: multiply by less than 1.')]) };
      }
      if (R.chance(.5)) {
        const Pp = R.pick([500, 1000, 2000, 5000]), r = R.pick([6, 8, 9, 12]), T = 72 / r, k = R.i(2, 4), Y = k * T, ans = Pp * P(2, k);
        return { text: B('$' + num(Pp)) + ' grows ' + B(r + '%') + ' a year. About how much is it worth after ' + B(Y + ' years') + '? Use the rule of 72.', ans,
          how: ['72 ÷ ' + r + ' = ' + T + ': it doubles about every ' + T + ' years.', Y + ' years is ' + Y + ' ÷ ' + T + ' = ' + k + ' doublings: $' + num(Pp) + ' → ' + Array.from({ length: k }, (_, i) => '$' + num(Pp * P(2, i + 1))).join(' → ') + '.', 'About ' + B('$' + num(ans)) + '.'],
          steps: [st('How many years does it take to double?', T), st('How many doublings in ' + Y + ' years?', k), st('What is it worth then?', ans)],
          traps: TR([tr(Pp * (1 + k), 'w_growth', 'Each doubling doubles the new amount, not just the first $' + num(Pp) + '.'), tr(Pp * 2 * k, 'w_growth', k + ' doublings is × ' + pw(2, k) + ', not × 2 × ' + k + '.'), tr(Pp * P(2, k - 1), 'w_growth', 'Count the doublings: ' + Y + ' ÷ ' + T + ' = ' + k + '.')]) };
      }
      const r = R.pick([10, 20, 5, 30, 50]), g = 100 + r, ans = g * g / 10000;
      return { text: 'Something grows ' + B(r + '%') + ' a year for ' + B('2 years') + '. What is the total growth factor (what do you multiply by over the 2 years)?', ans,
        how: ['Each year multiplies by ' + num(g / 100) + '.', 'Two years: ' + num(g / 100) + ' × ' + num(g / 100) + ' = ' + B(num(ans)) + ' (a ' + num(ans * 100 - 100) + '% rise, more than ' + 2 * r + '%, because year 2 grows on year 1’s growth too).'],
        steps: [st('What do you multiply by each year?', g / 100), st(B(num(g / 100) + ' × ' + num(g / 100)) + ' = ?', ans)],
        traps: TR([tr(1 + 2 * r / 100, 'w_rule72', 'The second year grows on the first year’s growth too: multiply ' + num(g / 100) + ' × ' + num(g / 100) + '.'), tr(2 * g / 100, 'w_rule72', 'Two years means multiply twice, not × 2.')]) };
    } },

  { id: 'w_ln', s: 'pow', g: 12, title: 'e and natural logs', pre: [], paper: true,
    tip: 'ln is log base e, and ln undoes e: ln(eˣ) = x and e^(ln x) = x. The log rules still work: ln(e³ · e⁴) = 3 + 4 = 7.',
    gen(d, R) {
      const F = { type: 'frac' }, E = k => pw('e', k);
      const out = (text, ans, how, steps, traps) => ({ text, ans, type: 'frac', how, steps, traps: TR(traps) });
      if (d === 0) {
        const kind = R.i(0, 2), a = R.i(2, 9), b = R.i(2, 9);
        if (kind === 0) return out('What is ' + B('ln ' + E(a) + ' + ln ' + E(b)) + '?', Q(a + b, 1), ['ln ' + E(a) + ' + ln ' + E(b), why('= ' + a + ' + ' + b, 'ln undoes e: ln ' + E('k') + ' = k'), '= ' + B(a + b)],
          [st('What is ' + B('ln ' + E(a)) + '?', Q(a, 1), F), st('Add ' + B('ln ' + E(b)) + '.', Q(a + b, 1), F)], [tr(Q(a * b, 1), 'w_logrules', 'Each ln ' + E('k') + ' is just k. Add them.')]);
        if (kind === 1) return out('What is ' + B(b + ' × ' + E('ln ' + a)) + '?', Q(a * b, 1), [b + ' × ' + E('ln ' + a), why('= ' + b + ' × ' + a, 'e and ln undo each other: ' + E('ln ' + a) + ' = ' + a), '= ' + B(a * b)],
          [st('What is ' + B(E('ln ' + a)) + '?', Q(a, 1), F), st('Times ' + b + '.', Q(a * b, 1), F)], [tr(Q(a + b, 1), 'w_ln', 'Multiply by ' + b + '.'), tr(Q(b, 1), 'w_ln', E('ln ' + a) + ' is ' + a + ', not 1.')]);
        return out('What is ' + B(b + ' ln ' + E(a)) + '?', Q(a * b, 1), [b + ' ln ' + E(a), why('= ' + b + ' × ' + a, 'ln ' + E(a) + ' = ' + a), '= ' + B(a * b)],
          [st('What is ' + B('ln ' + E(a)) + '?', Q(a, 1), F), st('Times ' + b + '.', Q(a * b, 1), F)], [tr(Q(a + b, 1), 'w_ln', 'The ' + b + ' in front multiplies.'), tr(Q(b, 1), 'w_ln', 'ln ' + E(a) + ' is ' + a + ', not 1.')]);
      }
      if (d === 1) {
        const kind = R.i(0, 3), a = R.i(2, 9), b = R.i(2, 9);
        if (kind === 0) { const sub = R.chance(.5), ans = sub ? a - b : a + b; if (sub && a === b) return null;
          const inside = sub ? fs(E(a), E(b)) : E(a) + ' · ' + E(b);
          return out('What is ' + B('ln(' + inside + ')') + '?', Q(ans, 1), ['ln(' + inside + ')', why('= ln ' + E(a + (sub ? ' ' + MINUS + ' ' : ' + ') + b), sub ? 'dividing: take away the powers' : 'multiplying: add the powers'), '= ln ' + E(num(ans)), why('= ' + B(num(ans)), 'ln undoes e')],
            [st('Simplify the inside to e to one power. What is the power?', Q(ans, 1), F), st('Now take ln.', Q(ans, 1), F)], [tr(Q(sub ? a + b : a * b, 1), 'w_rules', sub ? 'Dividing takes away the powers.' : 'Multiplying adds the powers.'), sub ? tr(Q(b - a, 1), 'n_intsub', 'Top power minus bottom power: ' + a + M + b + '.') : null]); }
        if (kind === 1) { const n = R.pick([2, 3, 4]);
          return out('What is ' + B('ln ' + rt('e', n === 2 ? '' : n)) + '?', Q(1, n), ['ln ' + rt('e', n === 2 ? '' : n), why('= ln ' + E(fsl(1, n)), 'a ' + (n === 2 ? 'square' : n === 3 ? 'cube' : '4th') + ' root is the power ' + fsl(1, n)), '= ' + B(frac(1, n))],
            [st('Write ' + rt('e', n === 2 ? '' : n) + ' as a power of e. What is the power?', Q(1, n), F)], [tr(Q(n, 1), 'w_fracexp', 'A root is a fraction power: ' + fsl(1, n) + '.'), tr(Q(1, 1), 'w_ln', 'ln e = 1, but this is a root of e.')]); }
        if (kind === 2) { const x = R.i(2, 6), n = R.pick([2, 3]), ans = P(x, n);
          return out('What is ' + B(E(n + ' ln ' + x)) + '?', Q(ans, 1), [E(n + ' ln ' + x), why('= ' + E('ln ' + pw(x, n)), 'the ' + n + ' in front becomes a power inside'), why('= ' + pw(x, n), 'e and ln undo each other'), '= ' + B(ans)],
            [st('Move the ' + n + ' inside: ' + n + ' ln ' + x + ' = ln of what?', Q(ans, 1), F), st('So what is the answer?', Q(ans, 1), F)], [tr(Q(n * x, 1), 'w_logrules', 'The ' + n + ' becomes a power: ' + pw(x, n) + ', not ' + n + ' × ' + x + '.')]); }
        return out('What is ' + B(E('ln ' + a + ' + ln ' + b)) + '?', Q(a * b, 1), [E('ln ' + a + ' + ln ' + b), why('= ' + E('ln ' + a * b), 'adding logs multiplies the insides'), why('= ' + B(a * b), 'e and ln undo each other')],
          [st('ln ' + a + ' + ln ' + b + ' = ln of what?', Q(a * b, 1), F), st('So what is the answer?', Q(a * b, 1), F)], [tr(Q(a + b, 1), 'w_logrules', 'Adding logs multiplies the insides: ln ' + a + ' + ln ' + b + ' = ln ' + a * b + '.')]);
      }
      const kind = R.i(0, 3);
      if (kind === 0) { const a = R.i(2, 4), k = R.i(1, 12), ans = Q(k, a);
        return out('Solve: ' + B(E(a + 'x') + ' = ' + E(k)), ans, [E(a + 'x') + ' = ' + E(k), why(a + 'x = ' + k, 'same base e, so the powers are equal (take ln of both sides)'), 'x = ' + B(fq(ans))],
          [st('Set the powers equal and solve ' + a + 'x = ' + k + '.', ans, F)], [tr(Q(k * a, 1), 'x_onestep', 'Divide by ' + a + ' to undo times ' + a + '.'), tr(Q(k - a, 1), 'x_onestep', a + 'x means ' + a + ' times x: divide by ' + a + '.')]); }
      if (kind === 1) { const a = nonzero(R, -6, 6), b = R.i(1, 9), ans = Q(b - a, 1);
        const pe = 'x ' + (a < 0 ? MINUS + ' ' + -a : '+ ' + a);
        return out('Solve: ' + B(E(pe) + ' = ' + E(b)), ans, [E(pe) + ' = ' + E(b), why(pe + ' = ' + b, 'same base, so the powers are equal'), 'x = ' + B(num(b - a))],
          [st('Solve ' + pe + ' = ' + b + '.', ans, F)], [tr(Q(b + a, 1), 'n_intsub', 'Undo ' + (a < 0 ? MINUS + ' ' + -a : '+ ' + a) + ' by ' + (a < 0 ? 'adding ' + -a : 'taking away ' + a) + '.')]); }
      if (kind === 2) { const a = R.i(2, 9), n = R.pick([2, 3]), ans = Q(P(a, n), 1);
        return out('Solve: ' + B('ln x = ' + n + ' ln ' + a), ans, ['ln x = ' + n + ' ln ' + a, why('ln x = ln ' + pw(a, n), 'the ' + n + ' becomes a power inside'), 'x = ' + pw(a, n) + ' = ' + B(P(a, n))],
          [st('Write ' + n + ' ln ' + a + ' as ln of one number. What number?', ans, F)], [tr(Q(n * a, 1), 'w_logrules', 'The ' + n + ' in front becomes a power: ' + pw(a, n) + '.'), tr(Q(P(n, a), 1), 'w_logrules', 'The power goes on ' + a + ': ' + pw(a, n) + '.')]); }
      const a = R.i(2, 9), b = R.i(2, 9), ans = Q(a * b, 1);
      return out('Solve: ' + B('ln x = ln ' + a + ' + ln ' + b), ans, ['ln x = ln ' + a + ' + ln ' + b, why('ln x = ln ' + a * b, 'adding logs multiplies the insides'), 'x = ' + B(a * b)],
        [st('ln ' + a + ' + ln ' + b + ' = ln of what?', ans, F)], [tr(Q(a + b, 1), 'w_logrules', 'Adding logs multiplies the insides.')]);
    } },
]);

/* ======================= Triangles & Trig ======================= */
const FAM = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
const famS = f => f.join('–');
const radS = q => { const top = (Math.abs(q.n) === 1 ? '' : Math.abs(q.n)) + PI; return (q.n < 0 ? MINUS : '') + (q.d === 1 ? top : fs(top, q.d)); };
const inv = fn => fn + '<sup>' + MINUS + '1</sup>';
/* exact sin/cos/tan of a multiple of 30° or 45°: {s: sign, n, d, r} meaning s·n√r/d (r = 1 means rational); null if undefined */
const SIN1 = { 0: [0, 1, 1], 30: [1, 2, 1], 45: [1, 2, 2], 60: [1, 2, 3], 90: [1, 1, 1] };
function trigV(fn, deg) {
  const t = ((deg % 360) + 360) % 360, q = t < 90 ? 1 : t < 180 ? 2 : t < 270 ? 3 : 4, ref = q === 1 ? t : q === 2 ? 180 - t : q === 3 ? t - 180 : 360 - t;
  const sv = SIN1[ref], cv = SIN1[90 - ref];
  const ss = (t === 0 || t === 180) ? 1 : (t < 180 ? 1 : -1), cs = (t === 90 || t === 270) ? 1 : (t < 90 || t > 270 ? 1 : -1);
  if (fn === 'sin') return { s: sv[0] ? ss : 1, n: sv[0], d: sv[1], r: sv[2], q, ref, t };
  if (fn === 'cos') return { s: cv[0] ? cs : 1, n: cv[0], d: cv[1], r: cv[2], q, ref, t };
  if (!cv[0]) return null;
  const T = { 0: [0, 1, 1], 30: [1, 3, 3], 45: [1, 1, 1], 60: [1, 1, 3] }[ref];
  return { s: T[0] ? ss * cs : 1, n: T[0], d: T[1], r: T[2], q, ref, t };
}
const tvS = v => { const body = v.n === 0 ? '0' : v.r === 1 ? fr(v.n, v.d) : (v.d === 1 ? (v.n === 1 ? '' : v.n) + rt(v.r) : fs((v.n === 1 ? '' : v.n) + rt(v.r), v.d)); return (v.s < 0 && v.n ? MINUS : '') + body; };

C.defs([
  { id: 'r_pyth', s: 'trig', g: 8, title: 'Pythagoras: the long side', pre: ['w_roots'], paper: true,
    tip: 'In a right triangle, long side² = short² + short². 6 and 8: 36 + 64 = 100, so 10. Spot families: 6, 8, 10 is 2 × (3, 4, 5).',
    gen(d, R) {
      let f, k;
      if (d === 0) { f = FAM[0]; k = R.i(1, 5); }
      else if (d === 1) { const c = R.i(0, 2); if (c === 0) { f = FAM[1]; k = R.i(1, 3); } else if (c === 1) { f = FAM[2]; k = R.i(1, 2); } else { f = FAM[0]; k = R.i(6, 12); } }
      else { const c = R.i(0, 4); [f, k] = c === 0 ? [FAM[0], R.i(13, 30)] : c === 1 ? [FAM[1], R.i(4, 8)] : c === 2 ? [FAM[2], R.i(3, 5)] : c === 3 ? [FAM[3], R.i(1, 3)] : [R.pick([FAM[4], FAM[5]]), 1]; }
      const sw = R.chance(.5), a = (sw ? f[1] : f[0]) * k, b = (sw ? f[0] : f[1]) * k, c = f[2] * k, s2 = a * a + b * b;
      return { text: 'A right triangle has short sides ' + B(a) + ' and ' + B(b) + '. How long is the long side (the hypotenuse)?', ans: c, vis: triSVG(String(a), String(b), '?'),
        how: [why(sq('c') + ' = ' + sq(a) + ' + ' + sq(b), 'long side squared = the two short sides squared, added'), '= ' + num(a * a) + ' + ' + num(b * b) + ' = ' + num(s2),
          'c = ' + rt(num(s2)) + ' = ' + B(c) + (k > 1 ? '   (shortcut: ' + a + ', ' + b + ' is ' + k + ' × ' + famS(f.slice(0, 2)) + ', so c = ' + k + ' × ' + f[2] + ')' : '   (the ' + famS(f) + ' family)')],
        steps: [st(B(sq(a) + ' + ' + sq(b)) + ' = ?', s2), st('What is ' + B(rt(num(s2))) + '?', c)],
        traps: TR([tr(a + b, 'r_pyth', 'The long side is shorter than the two short sides added. Square, add, then take the root.'), tr(s2, 'w_roots', 'That is c squared. Take the square root.'),
          tr(s2 % 2 === 0 ? s2 / 2 : null, 'w_roots', 'A square root is not half.')]) };
    } },

  { id: 'r_leg', s: 'trig', g: 8, title: 'Pythagoras: a short side', pre: [], paper: true,
    tip: 'For a short side, take away: short² = long² − other short². Long 13, short 5: 169 − 25 = 144, so 12.',
    gen(d, R) {
      let f, k;
      if (d === 0) { f = FAM[0]; k = R.i(1, 5); } else if (d === 1) { f = R.pick([FAM[1], FAM[2]]); k = R.i(1, f === FAM[1] ? 3 : 2); } else { f = R.pick(FAM); k = f[2] > 20 ? 1 : R.i(2, 6); }
      const sw = R.chance(.5), a = (sw ? f[1] : f[0]) * k, b = (sw ? f[0] : f[1]) * k, c = f[2] * k, d2 = c * c - a * a;
      const story = d === 2 && R.chance(.5);
      const text = story ? 'A ' + B(c + ' ft') + ' ladder leans against a wall. The bottom of the ladder is ' + B(a + ' ft') + ' from the wall. How many feet up the wall does the ladder reach?' : 'The hypotenuse of a right triangle is ' + B(c) + '. One short side is ' + B(a) + '. How long is the other short side?';
      return { text, ans: b, unit: story ? 'ft' : '', vis: triSVG('?', String(a), String(c)),
        how: [why(sq('b') + ' = ' + sq(c) + M + sq(a), 'for a short side, take away'), '= ' + num(c * c) + M + num(a * a) + ' = ' + num(d2),
          'b = ' + rt(num(d2)) + ' = ' + B(b) + (k > 1 ? '   (shortcut: ' + k + ' × the ' + famS(f) + ' family)' : '   (the ' + famS(f) + ' family)')],
        steps: [st(B(sq(c) + M + sq(a)) + ' = ?', d2), st('What is ' + B(rt(num(d2))) + '?', b)],
        traps: TR([tr(c - a, 'r_leg', 'Take away the squares, not the sides: ' + sq(c) + M + sq(a) + '.'), tr(d2, 'w_roots', 'That is b squared. Take the square root.'), tr(c * c + a * a, 'r_pyth', 'For a short side, take the squares away instead of adding them.')]) };
    } },

  { id: 'r_dist', s: 'trig', g: 8, title: 'Distance between two points', pre: ['n_intsub'], paper: true,
    tip: 'Find how far across and how far up, then use Pythagoras. (1, 2) to (4, 6): across 3, up 4, distance 5.',
    gen(d, R) {
      const pt = (x, y) => '(' + num(x) + ', ' + num(y) + ')';
      if (d === 0) {
        const horiz = R.chance(.5), u1 = R.i(-6, 5), u2 = R.i(u1 + 2, 6), w = R.i(-5, 5); if (u1 >= 0 && u2 >= 0) return null;
        const A = horiz ? [u1, w] : [w, u1], Bp = horiz ? [u2, w] : [w, u2], D = u2 - u1, ax = horiz ? 'x' : 'y', alt = Math.abs(Math.abs(u2) - Math.abs(u1));
        return { text: 'How far apart are ' + B('A' + pt(A[0], A[1])) + ' and ' + B('B' + pt(Bp[0], Bp[1])) + '?', ans: D,
          vis: plotSVG([{ x: A[0], y: A[1], t: 'A' }, { x: Bp[0], y: Bp[1], t: 'B' }], { line: [{ x: A[0], y: A[1] }, { x: Bp[0], y: Bp[1] }] }),
          how: [why('distance = ' + num(u2) + M + ng(u1), 'same ' + (horiz ? 'y' : 'x') + ', so take away the ' + ax + '-values'), why('= ' + num(u2) + ' + ' + (-u1), 'taking away a negative adds'), '= ' + B(D)],
          steps: [st('What is ' + B(num(u2) + M + ng(u1)) + '?', D)],
          traps: TR([tr(alt, 'n_intsub', 'Taking away a negative adds: ' + num(u2) + M + ng(u1) + ' = ' + num(u2) + ' + ' + (-u1) + '.'), tr(D + 1, 'n_neg', 'Count the steps between the points, not the grid lines.')]) };
      }
      let dx, dy, x1, y1, rr = 6, askK = false;
      if (d === 1) { [dx, dy] = R.pick([[3, 4], [4, 3], [3, 4], [6, 8], [8, 6]]); rr = dx + dy > 7 ? 8 : 6; }
      else if (R.chance(.3)) { askK = true; dx = R.i(1, 9); dy = R.i(1, 9); if (Number.isInteger(Math.sqrt(dx * dx + dy * dy))) return null; }
      else { [dx, dy] = R.pick([[5, 12], [12, 5], [8, 15], [15, 8], [6, 8], [9, 12], [12, 16], [7, 24], [15, 20], [10, 24]]); }
      const sx = R.chance(.5) ? 1 : -1, sy = R.chance(.5) ? 1 : -1, lim = d === 1 ? rr : 20;
      x1 = R.i(-lim, lim); y1 = R.i(-lim, lim); const x2 = x1 + sx * dx, y2 = y1 + sy * dy;
      if (Math.abs(x2) > lim || Math.abs(y2) > lim) return null;
      if (d === 1 && x1 >= 0 && x2 >= 0 && y1 >= 0 && y2 >= 0) return null;
      const s2 = dx * dx + dy * dy, dist = Math.sqrt(s2), ans = askK ? s2 : dist;
      const lx = Math.max(x1, x2), sxm = Math.min(x1, x2), ly = Math.max(y1, y2), sym = Math.min(y1, y2);
      const ax = Math.abs(Math.abs(x2) - Math.abs(x1)), ay = Math.abs(Math.abs(y2) - Math.abs(y1)), alt = ax * ax + ay * ay;
      return { text: askK ? 'The distance between ' + B('A' + pt(x1, y1)) + ' and ' + B('B' + pt(x2, y2)) + ' is ' + rt('k') + '. What is k?' : 'How far apart are ' + B('A' + pt(x1, y1)) + ' and ' + B('B' + pt(x2, y2)) + '?', ans,
        vis: d === 1 ? plotSVG([{ x: x1, y: y1, t: 'A' }, { x: x2, y: y2, t: 'B' }], { r: rr, line: [{ x: x1, y: y1 }, { x: x2, y: y2 }] }) : '',
        how: ['across = ' + num(lx) + M + ng(sxm) + ' = ' + dx + ',   up = ' + num(ly) + M + ng(sym) + ' = ' + dy, why(sq('d') + ' = ' + sq(dx) + ' + ' + sq(dy) + ' = ' + (dx * dx) + ' + ' + (dy * dy) + ' = ' + s2, 'Pythagoras'), askK ? 'd = ' + rt(s2) + ', so k = ' + B(s2) : 'd = ' + rt(s2) + ' = ' + B(dist)],
        steps: [st('How far across? ' + B(num(lx) + M + ng(sxm)) + ' = ?', dx), st('How far up or down? ' + B(num(ly) + M + ng(sym)) + ' = ?', dy), st(B(sq(dx) + ' + ' + sq(dy)) + ' = ?', s2)].concat(askK ? [] : [st('What is ' + B(rt(s2)) + '?', dist)]),
        traps: TR([askK ? tr(dx + dy, 'r_dist', 'k is across squared plus up squared.') : tr(dx + dy, 'r_dist', 'The straight line is shorter than across plus up. Use Pythagoras.'), askK ? null : tr(s2, 'w_roots', 'That is d squared. Take the square root.'),
          alt !== s2 ? tr(askK ? alt : (Number.isInteger(Math.sqrt(alt)) ? Math.sqrt(alt) : null), 'n_intsub', 'Find across and up by taking away the coordinates; taking away a negative adds.') : null]) };
    } },

  { id: 'r_special', s: 'trig', g: 9, title: 'Special right triangles', pre: ['w_radical'], paper: true,
    tip: '45–45–90 sides are x, x, x√2. 30–60–90 sides are x, x√3, 2x (x is opposite the 30°). Hypotenuse 10 in a 30–60–90: x = 5.',
    gen(d, R) {
      const L30 = 'sides x, x' + rt(3) + ', 2x', L45 = 'sides x, x, x' + rt(2);
      const kind = d === 0 ? R.i(0, 2) : d === 1 ? R.i(3, 5) : R.i(6, 8), k = R.i(2, 12);
      if (kind === 0) return { text: 'In a 30–60–90 triangle the side opposite the 30° angle is ' + B(k) + '. How long is the hypotenuse?', ans: 2 * k, vis: triSVG(String(k), '', '?', { angle: '30°' }),
        how: [why('30–60–90: ' + L30, 'x is the side opposite 30°'), 'x = ' + k, 'hypotenuse = 2x = 2 × ' + k + ' = ' + B(2 * k)],
        steps: [st('The hypotenuse is how many times the short side?', 2), st('So how long is the hypotenuse?', 2 * k)],
        traps: TR([tr(k, 'r_special', 'The hypotenuse is the longest side: 2 times the side opposite 30°.'), tr(k * k, 'r_special', 'The hypotenuse is 2x, not x squared.')]) };
      if (kind === 1) return { text: 'In a 30–60–90 triangle the hypotenuse is ' + B(2 * k) + '. How long is the side opposite the 30° angle?', ans: k, vis: triSVG('?', '', String(2 * k), { angle: '30°' }),
        how: [why('30–60–90: ' + L30, 'x is the side opposite 30°'), '2x = ' + 2 * k, 'x = ' + B(k)],
        steps: [st('Solve 2x = ' + 2 * k + '.', k)],
        traps: TR([tr(4 * k, 'r_special', 'The side opposite 30° is half the hypotenuse, not double.'), tr(2 * k, 'r_special', 'The short side is shorter than the hypotenuse: half of it.')]) };
      if (kind === 2) return { text: 'A 45–45–90 triangle has short sides ' + B(k + rt(2)) + ' each. How long is the hypotenuse?', ans: 2 * k, vis: triSVG(k + rt(2), k + rt(2), '?', { angle: '45°' }),
        how: [why('45–45–90: ' + L45, 'the hypotenuse is a short side times ' + rt(2)), 'hypotenuse = ' + k + rt(2) + ' × ' + rt(2), why('= ' + k + ' × 2 = ' + B(2 * k), rt(2) + ' × ' + rt(2) + ' = 2')],
        steps: [st('What is ' + B(rt(2) + ' × ' + rt(2)) + '?', 2), st('So what is ' + B(k + rt(2) + ' × ' + rt(2)) + '?', 2 * k)],
        traps: TR([tr(k, 'w_radical', rt(2) + ' × ' + rt(2) + ' = 2, so the answer is ' + k + ' × 2.'), tr(2 * k * k, 'r_special', 'Multiply the short side by ' + rt(2) + ' once.')]) };
      if (kind === 3) return { text: 'In a 30–60–90 triangle the hypotenuse is ' + B(2 * k) + '. The longer short side is ' + B('a' + rt(3)) + '. What is a?', ans: k, vis: triSVG('', '?', String(2 * k), { angle: '30°' }),
        how: [why('30–60–90: ' + L30, 'the longer short side is x' + rt(3)), '2x = ' + 2 * k + ', so x = ' + k, 'longer side = x' + rt(3) + ' = ' + k + rt(3) + ', so a = ' + B(k)],
        steps: [st('Find x: 2x = ' + 2 * k + '.', k), st('The longer side is x' + rt(3) + '. What is a?', k)],
        traps: TR([tr(2 * k, 'r_special', 'Halve the hypotenuse first: x = ' + k + ', and the longer side is x' + rt(3) + '.'), tr(4 * k, 'r_special', 'The hypotenuse is 2x, so x is half of it.')]) };
      if (kind === 4) return { text: 'A 45–45–90 triangle has hypotenuse ' + B(2 * k) + '. Each short side is ' + B('a' + rt(2)) + '. What is a?', ans: k, vis: triSVG('?', '', String(2 * k), { angle: '45°' }),
        how: [why('45–45–90: ' + L45, 'hypotenuse = x' + rt(2)), 'x' + rt(2) + ' = ' + 2 * k + ', so x = ' + fs(2 * k, rt(2)), why('= ' + fs(2 * k + rt(2), 2) + ' = ' + k + rt(2), 'times top and bottom by ' + rt(2)), 'a = ' + B(k)],
        steps: [st('x = ' + fs(2 * k, rt(2)) + '. Times top and bottom by ' + rt(2) + ': what is the bottom now?', 2), st('So x = ?' + rt(2) + '. What is a?', k)],
        traps: TR([tr(2 * k, 'w_radical', 'Divide by ' + rt(2) + ': ' + fs(2 * k, rt(2)) + ' = ' + fs(2 * k + rt(2), 2) + '.'), tr(2 * k * 2, 'r_special', 'The short side is shorter than the hypotenuse: divide by ' + rt(2) + '.')]) };
      if (kind === 5) return { text: 'In a 30–60–90 triangle the longer short side is ' + B(k + rt(3)) + '. How long is the hypotenuse?', ans: 2 * k, vis: triSVG('', k + rt(3), '?', { angle: '30°' }),
        how: [why('30–60–90: ' + L30, 'the longer short side is x' + rt(3)), 'x' + rt(3) + ' = ' + k + rt(3) + ', so x = ' + k, 'hypotenuse = 2x = ' + B(2 * k)],
        steps: [st('Find x: x' + rt(3) + ' = ' + k + rt(3) + '.', k), st('The hypotenuse is 2x. How long?', 2 * k)],
        traps: TR([tr(k, 'r_special', 'That is x. The hypotenuse is 2x.'), tr(3 * k, 'r_special', 'The hypotenuse is 2x, where x' + rt(3) + ' is the longer short side.')]) };
      const F = { type: 'frac' };
      if (kind === 6) { const h = R.i(3, 15), ans = Q(h, 2);
        return { text: 'A 45–45–90 triangle has hypotenuse ' + B(h) + '. Each short side is ' + B('a' + rt(2)) + '. What is a?', ans, type: 'frac', vis: triSVG('?', '', String(h), { angle: '45°' }),
          how: [why('x' + rt(2) + ' = ' + h, 'hypotenuse = x' + rt(2)), 'x = ' + fs(h, rt(2)), why('= ' + fs(h + rt(2), 2), 'times top and bottom by ' + rt(2)), 'a = ' + B(fq(ans))],
          steps: [st('Times ' + fs(h, rt(2)) + ' top and bottom by ' + rt(2) + '. What is the new bottom?', Q(2, 1), F), st('So what is a?', ans, F)],
          traps: TR([tr(Q(h, 1), 'w_radical', 'Divide by ' + rt(2) + ': ' + fs(h, rt(2)) + ' = ' + fs(h + rt(2), 2) + '.'), tr(Q(2 * h, 1), 'r_special', 'The short side is shorter than the hypotenuse.')]) }; }
      const m = R.i(2, 15), toHyp = kind === 8, ans = toHyp ? Q(2 * m, 3) : Q(m, 3);
      return { text: 'In a 30–60–90 triangle the longer short side is ' + B(m) + '. The ' + (toHyp ? 'hypotenuse' : 'side opposite 30°') + ' is ' + B('a' + rt(3)) + '. What is a?', ans, type: 'frac',
        vis: triSVG(toHyp ? '' : '?', String(m), toHyp ? '?' : '', { angle: '30°' }),
        how: [why('x' + rt(3) + ' = ' + m, 'the longer short side is x' + rt(3)), why('x = ' + fs(m, rt(3)) + ' = ' + fs(m + rt(3), 3), 'times top and bottom by ' + rt(3)), toHyp ? 'hypotenuse = 2x = ' + fs(2 * m + rt(3), 3) + ', so a = ' + B(fq(ans)) : 'a = ' + B(fq(ans))],
        steps: [st('Times ' + fs(m, rt(3)) + ' top and bottom by ' + rt(3) + '. What is the new bottom?', Q(3, 1), F), st('So what is a?', ans, F)],
        traps: TR([tr(toHyp ? Q(2 * m, 1) : Q(m, 1), 'w_radical', 'Divide by ' + rt(3) + ', then make the bottom whole: ' + fs(m, rt(3)) + ' = ' + fs(m + rt(3), 3) + '.'), toHyp ? tr(Q(m, 3), 'r_special', 'That is x. The hypotenuse is 2x.') : tr(Q(2 * m, 3), 'r_special', 'That is the hypotenuse, 2x. The side opposite 30° is x.')]) };
    } },

  { id: 'r_ratio', s: 'trig', g: 10, title: 'Sine, cosine, tangent', pre: ['f_simplify'], paper: true,
    tip: 'SOH CAH TOA: sine = opposite ÷ hypotenuse, cosine = adjacent ÷ hypotenuse, tangent = opposite ÷ adjacent.',
    gen(d, R) {
      const F = { type: 'frac' }, NAME = { sin: 'opposite ÷ hypotenuse', cos: 'adjacent ÷ hypotenuse', tan: 'opposite ÷ adjacent' }, side = { o: 'opposite', a: 'adjacent', h: 'hypotenuse' };
      const parts = { sin: ['o', 'h'], cos: ['a', 'h'], tan: ['o', 'a'] };
      if (d < 2) {
        const f = d === 0 ? FAM[0] : R.pick([FAM[1], FAM[2], FAM[3]]), k = d === 0 ? R.i(1, 3) : R.i(1, 2), sw = R.chance(.5);
        const S = { o: (sw ? f[1] : f[0]) * k, a: (sw ? f[0] : f[1]) * k, h: f[2] * k }, fn = R.pick(['sin', 'cos', 'tan']), [p, q] = parts[fn], ans = Q(S[p], S[q]);
        const other = fn === 'sin' ? Q(S.a, S.h) : fn === 'cos' ? Q(S.o, S.h) : Q(S.a, S.o);
        return { text: 'What is ' + B(fn + ' θ') + '? Give a fraction.', ans, type: 'frac', vis: triSVG(String(S.o), String(S.a), String(S.h), { angle: 'θ' }),
          how: [why(fn + ' θ = ' + NAME[fn], 'SOH CAH TOA'), why('= ' + (reduce(S[p], S[q])[1] === S[q] ? B(fs(S[p], S[q])) : fs(S[p], S[q])), 'the ' + side[p] + ' is ' + S[p] + ', the ' + side[q] + ' is ' + S[q])].concat(reduce(S[p], S[q])[1] === S[q] ? [] : ['= ' + B(fq(ans))]),
          steps: [st('How long is the ' + side[p] + ' side (from θ)?', S[p]), st('How long is the ' + side[q] + ' side?', S[q]), st('So what is ' + fn + ' θ?', ans, F)],
          traps: TR([tr(other, 'r_ratio', fn + ' is ' + NAME[fn] + '. Check which side is opposite θ and which is next to it.'), tr(Q(S[q], S[p]), 'r_ratio', 'Upside down: ' + fn + ' is ' + NAME[fn] + '.')]) };
      }
      const f = R.pick([FAM[0], FAM[1], FAM[2], FAM[3]]), sw = R.chance(.5), S = { o: sw ? f[1] : f[0], a: sw ? f[0] : f[1], h: f[2] };
      const given = R.pick(['sin', 'cos', 'tan']), ask = R.pick(['sin', 'cos', 'tan'].filter(x => x !== given)), [gp, gq] = parts[given], miss = ['o', 'a', 'h'].find(x => x !== gp && x !== gq), [ap, aq] = parts[ask], ans = Q(S[ap], S[aq]);
      const missLine = miss === 'h' ? 'hypotenuse = ' + rt(sq(S.o) + ' + ' + sq(S.a)) + ' = ' + rt(S.o * S.o + S.a * S.a) + ' = ' + S.h : side[miss] + ' = ' + rt(sq(S.h) + M + sq(S[miss === 'o' ? 'a' : 'o'])) + ' = ' + rt(S[miss] * S[miss]) + ' = ' + S[miss];
      return { text: 'θ is an angle in a right triangle and ' + B(given + ' θ = ' + fr(S[gp], S[gq])) + '. What is ' + B(ask + ' θ') + '?', ans, type: 'frac',
        how: [why(side[gp] + ' = ' + S[gp] + ', ' + side[gq] + ' = ' + S[gq], 'draw it: ' + given + ' is ' + NAME[given]), why(missLine, 'Pythagoras; the ' + famS(f) + ' family'), why(ask + ' θ = ' + B(fs(S[ap], S[aq])), NAME[ask])],
        steps: [st('How long is the ' + side[miss] + ' side?', S[miss]), st('What is ' + ask + ' θ?', ans, F)],
        traps: TR([tr(Q(S[aq], S[ap]), 'r_ratio', 'Upside down: ' + ask + ' is ' + NAME[ask] + '.'), tr(ask !== 'tan' ? Q(S[ap === 'o' ? 'a' : 'o'], S.h) : Q(S.a, S.o), 'r_ratio', 'Check which side is opposite θ and which is next to it.')]) };
    } },

  { id: 'r_area', s: 'trig', g: 10, title: 'Triangle area: ½ab·sin C', pre: ['g_tri'], paper: true,
    tip: 'Two sides and the angle between them: area = ½ × a × b × sin C. Sides 8 and 6 with 30° between: ½ × 8 × 6 × ½ = 12.',
    gen(d, R) {
      const a = 2 * R.i(1, 8), b = 2 * R.i(1, 8), Cang = d === 0 ? 30 : d === 1 ? R.pick([30, 150, 90]) : R.pick([60, 120, 45, 135]), ab = a * b;
      const txt = 'A triangle has sides ' + B(a) + ' and ' + B(b) + ' with a ' + B(Cang + DEG) + ' angle between them.';
      if (d < 2) {
        const half = Cang !== 90, ans = half ? ab / 4 : ab / 2, sv = half ? '½' : '1';
        const why1 = Cang === 30 ? 'sin 30° = ½' : Cang === 150 ? 'sin 150° = sin 30° = ½ (150° and 30° add to 180°)' : 'sin 90° = 1';
        return { text: txt + ' What is its area?', ans,
          how: [why('area = ½ × ' + a + ' × ' + b + ' × sin ' + Cang + DEG, 'area = ½ab·sin C'), why('= ½ × ' + a + ' × ' + b + ' × ' + sv, why1), '= ' + num(ab / 2) + ' × ' + sv + ' = ' + B(num(ans))],
          steps: [st('What is ' + B('sin ' + Cang + DEG) + '? (a fraction or 1)', half ? Q(1, 2) : Q(1, 1), { type: 'frac' }), st('What is ' + B('½ × ' + a + ' × ' + b) + '?', ab / 2), st('Now times sin ' + Cang + DEG + '. What is the area?', ans)],
          traps: TR([tr(half ? ab / 2 : ab, 'r_area', half ? 'Multiply by sin ' + Cang + DEG + ' = ½ as well as by ½.' : 'Area is ½ × a × b × sin C: don’t forget the ½.'), tr(half ? ab / 8 : ab / 4, 'r_area', half ? 'Multiply by ½ and by sin ' + Cang + DEG + ' = ½: that is two halves, not three.' : 'sin 90° = 1, so the area is just ½ × ' + a + ' × ' + b + '.'), Cang === 150 ? tr(-ab / 4, 'r_unit', 'Sine is positive from 0° to 180°: sin 150° = ½.') : null]) };
      }
      if (ab % 4 !== 0) return null;
      const r = Cang === 60 || Cang === 120 ? 3 : 2, k = ab / 4, svS = fs(rt(r), 2);
      return { text: txt + ' Its area is ' + B('k' + rt(r)) + '. What is k?', ans: k,
        how: [why('area = ½ × ' + a + ' × ' + b + ' × sin ' + Cang + DEG, 'area = ½ab·sin C'), why('= ½ × ' + a + ' × ' + b + ' × ' + svS, 'sin ' + Cang + DEG + ' = ' + svS + (Cang > 90 ? ' (same as sin ' + (180 - Cang) + DEG + ')' : '')), '= ' + num(ab / 2) + ' × ' + svS + ' = ' + k + rt(r), 'k = ' + B(k)],
        steps: [st('What is ' + B('½ × ' + a + ' × ' + b) + '?', ab / 2), st('sin ' + Cang + DEG + ' = ' + svS + '. Multiply: ' + num(ab / 2) + ' × ' + svS + ' = ?' + rt(r) + '. What is k?', k)],
        traps: TR([tr(ab / 2, 'r_area', 'Multiply by sin ' + Cang + DEG + ' = ' + svS + ' too: that halves it again.'), tr(ab, 'r_area', 'Area = ½ × a × b × sin C: two halves to include.')]) };
    } },

  { id: 'r_radians', s: 'trig', g: 11, title: 'Degrees and radians', pre: ['g_circle'], paper: true,
    tip: '180° is π radians. 30° = π/6, 45° = π/4, 60° = π/3, 90° = π/2. So 135° = 3 × 45° = 3π/4.',
    gen(d, R) {
      const F = { type: 'frac' };
      const via = deg => (deg % 30 === 0 ? '; check: ' + deg / 30 + ' × 30°, and 30° = ' + radS(Q(1, 6)) : deg % 45 === 0 ? '; check: ' + deg / 45 + ' × 45°, and 45° = ' + radS(Q(1, 4)) : '');
      const toRad = deg => { const k = Q(deg, 180);
        return { text: 'Write ' + B(deg + DEG) + ' in radians as ' + B('k' + PI) + '. What is k?', ans: k, type: 'frac',
          how: [why(deg + DEG + ' = ' + fs(deg, 180) + ' × ' + PI, '180° is ' + PI + ' radians' + via(deg)), '= ' + radS(k), 'k = ' + B(fq(k))],
          steps: [st('Write ' + fs(deg, 180) + ' in lowest terms.', k, F)],
          traps: TR([tr(Q(180, deg), 'r_radians', 'Divide the degrees by 180, not 180 by the degrees.'), tr(Q(deg, 360), 'r_radians', PI + ' radians is half a turn, 180°, not 360°.')]) }; };
      const toDeg = k => { const deg = 180 * k.n / k.d;
        return { text: 'Change ' + B(radS(k)) + ' radians to degrees.', ans: deg, unit: DEG,
          how: [why(radS(k) + ' = ' + fq(k) + ' × 180°', PI + ' radians is 180°'), '= ' + (k.d === 1 ? k.n + ' × 180°' : k.n + ' × ' + 180 / k.d + DEG), '= ' + B(deg) + DEG],
          steps: [st('What is 180 ÷ ' + k.d + '?', 180 / k.d), st('Times ' + k.n + '. How many degrees?', deg)],
          traps: TR([tr(360 * k.n / k.d, 'r_radians', PI + ' radians is 180°, not 360°.'), tr(Math.round(180 * k.d / k.n * 100) / 100, 'r_radians', 'Multiply by 180 and divide by ' + k.d + '.')]) }; };
      if (d === 0) return toRad(R.pick([180, 90, 60, 45, 30, 360, 270, 120]));
      if (d === 1) { const deg = R.pick([120, 135, 150, 210, 225, 240, 270, 300, 315, 330]); return R.chance(.5) ? toRad(deg) : toDeg(Q(deg, 180)); }
      if (R.chance(.5)) return toRad(R.pick([15, 20, 36, 40, 72, 75, 105, 10, 18, 12, 165, 540, 450, 80]));
      const pr = R.pick([[5, 12], [7, 6], [11, 6], [5, 3], [7, 9], [2, 5], [3, 10], [7, 4], [4, 9], [11, 12], [3, 2], [5, 2]]); return toDeg(Q(pr[0], pr[1]));
    } },

  { id: 'r_unit', s: 'trig', g: 11, title: 'Unit circle values', pre: [], paper: true,
    tip: 'Find the reference angle (how far from the x-axis), use the 30°, 45°, 60° values, then the sign: sin 150° = sin 30° = 1/2, and cos 150° = −cos 30°.',
    gen(d, R) {
      let deg, shown, conv = '';
      if (d === 0) deg = R.pick([0, 30, 45, 60, 90, 30, 60]);
      else if (d === 1) deg = R.pick([120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]);
      else {
        const k = R.i(0, 2);
        if (k === 0) { const q = R.pick([[5, 6], [2, 3], [3, 4], [7, 6], [4, 3], [5, 4], [5, 3], [7, 4], [11, 6], [1, 6], [1, 3]]); deg = 180 * q[0] / q[1]; shown = radS(Q(q[0], q[1])); conv = shown + ' = ' + fq(Q(q[0], q[1])) + ' × 180° = ' + deg + DEG; }
        else if (k === 1) { const a = R.pick([30, 45, 60, 120, 135, 150]); deg = 360 - a; shown = MINUS + a + DEG; conv = MINUS + a + DEG + ' is the same place as 360° ' + MINUS + ' ' + a + '° = ' + deg + DEG; }
        else { const a = R.pick([30, 45, 60, 120, 135, 150, 210, 240]); deg = a; shown = (360 + a) + DEG; conv = (360 + a) + DEG + ' = 360° + ' + a + '°, the same place as ' + a + DEG; }
      }
      shown = shown || deg + DEG;
      const fns = ['sin', 'cos'].concat(trigV('tan', deg) ? ['tan'] : []), fn = R.pick(fns), v = trigV(fn, deg), rational = v.r === 1, squareIt = !rational;
      const ans = squareIt ? Q(v.n * v.n * v.r, v.d * v.d) : Q(v.s * v.n, v.d), F = { type: 'frac' };
      const t = v.t, q = v.q, ref = v.ref, axis = t % 90 === 0;
      const lines = [];
      if (conv) lines.push(why(conv, 'find the angle from 0° to 360°'));
      if (axis) { const cv = trigV('cos', t), sv = trigV('sin', t); lines.push(why('point at ' + t + DEG + ' = (' + tvS(cv) + ', ' + tvS(sv) + ')', 'on the unit circle the point is (cos, sin)')); lines.push(fn + ' ' + t + DEG + ' = ' + tvS(v)); }
      else {
        if (q !== 1) lines.push(why('reference angle = ' + ref + DEG, t + DEG + ' is in quarter ' + q + ', ' + ref + '° from the x-axis'));
        lines.push(why(fn + ' ' + ref + DEG + ' = ' + tvS({ s: 1, n: v.n, d: v.d, r: v.r }), ref === 45 ? 'the 45–45–90 triangle' : 'the 30–60–90 triangle'));
        if (q !== 1) lines.push(why(fn + ' ' + t + DEG + ' = ' + tvS(v), 'in quarter ' + q + ' ' + (q === 2 ? 'only sin' : q === 3 ? 'only tan' : 'only cos') + ' is positive'));
      }
      if (squareIt) lines.push(pw(fn, 2) + ' ' + shown + ' = ' + supP(tvS(v), 2) + ' = ' + B(fq(ans))); else lines[lines.length - 1] = lines[lines.length - 1].replace(/^(.*?) = ([^(]*?)(   \(.*)?$/, (m0, a1, a2, a3) => a1 + ' = ' + B(a2) + (a3 || ''));
      const other = trigV(fn === 'sin' ? 'cos' : 'sin', deg);
      return { text: 'What is ' + B((squareIt ? pw(fn, 2) : fn) + ' ' + shown) + '?' + (squareIt ? ' (' + pw(fn, 2) + ' means the value squared.)' : ''), ans, type: 'frac', how: lines,
        steps: [axis ? st('At ' + t + '°, what is the ' + (fn === 'cos' ? 'x' : 'y') + '-coordinate on the unit circle?' + (fn === 'tan' ? ' (tan = y ÷ x)' : ''), squareIt ? ans : Q(v.s * v.n, v.d), F) : st('What is the reference angle (in degrees)?', ref), st('What is ' + (squareIt ? pw(fn, 2) : fn) + ' ' + shown + '?', ans, F)],
        traps: TR([!squareIt && v.n ? tr(Q(-v.s * v.n, v.d), 'r_unit', 'Check the sign: in quarter ' + q + ', ' + (q === 1 ? 'everything' : q === 2 ? 'only sin' : q === 3 ? 'only tan' : 'only cos') + ' is positive.') : null,
          fn !== 'tan' && other && (squareIt || other.r === 1) ? tr(squareIt ? Q(other.n * other.n * other.r, other.d * other.d) : Q(other.s * other.n, other.d), 'r_unit', 'Sine is the y-coordinate and cosine is the x-coordinate.') : null,
          squareIt && v.r > 1 ? tr(Q(v.n * v.n * v.r, v.d), 'w_exp', 'Square the bottom too: ' + v.d + '² = ' + v.d * v.d + '.') : null]) };
    } },

  { id: 'r_identity', s: 'trig', g: 11, title: 'sin² + cos² = 1', pre: [], paper: true,
    tip: 'For every angle, sin²θ + cos²θ = 1. If sin θ = 3/5, then cos²θ = 1 − 9/25 = 16/25, so cos θ = 4/5 (or −4/5, depending on the quarter).',
    gen(d, R) {
      const F = { type: 'frac' };
      if (d === 0) {
        if (R.chance(.5)) { const th = R.i(10, 80), k = R.i(2, 9), m = R.i(1, 9), ex = k + ' ' + pw('sin', 2) + ' ' + th + DEG + ' + ' + k + ' ' + pw('cos', 2) + ' ' + th + DEG + ' + ' + m;
          return { text: 'What is ' + B(ex) + '?', ans: Q(k + m, 1), type: 'frac',
            how: [ex, why('= ' + k + '(' + pw('sin', 2) + ' ' + th + DEG + ' + ' + pw('cos', 2) + ' ' + th + DEG + ') + ' + m, 'take out the ' + k), why('= ' + k + ' × 1 + ' + m, 'sin² + cos² = 1 for every angle'), '= ' + B(k + m)],
            steps: [st('What is ' + B(pw('sin', 2) + ' ' + th + DEG + ' + ' + pw('cos', 2) + ' ' + th + DEG) + '?', Q(1, 1), F), st('So what is the whole thing?', Q(k + m, 1), F)],
            traps: TR([tr(Q(2 * k + m, 1), 'r_identity', pw('sin', 2) + ' + ' + pw('cos', 2) + ' is 1, so the two parts together are ' + k + ' × 1.'), tr(Q(m, 1), 'r_identity', 'sin² + cos² is 1, not 0.')]) }; }
        const [p, q] = R.pick([[1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [1, 2], [3, 5], [4, 5], [1, 5]]), fnG = R.pick(['sin', 'cos']), fnA = fnG === 'sin' ? 'cos' : 'sin', ans = Q(q * q - p * p, q * q);
        return { text: B(fnG + ' θ = ' + fr(p, q)) + '. What is ' + B(pw(fnA, 2) + ' θ') + '?', ans, type: 'frac',
          how: [pw(fnA, 2) + ' θ = 1 ' + MINUS + ' ' + pw(fnG, 2) + ' θ', '= 1 ' + MINUS + ' ' + supP(fr(p, q), 2) + ' = 1 ' + MINUS + ' ' + fr(p * p, q * q), '= ' + B(fq(ans))],
          steps: [st('What is ' + B(pw(fnG, 2) + ' θ') + '?', Q(p * p, q * q), F), st('Take it from 1.', ans, F)],
          traps: TR([tr(Q(q - p, q), 'r_identity', 'Square first: ' + pw(fnG, 2) + ' θ = ' + fr(p * p, q * q) + '.'), tr(Q(p * p, q * q), 'r_identity', 'That is ' + pw(fnG, 2) + ' θ. Take it away from 1.')]) };
      }
      const f = R.pick([FAM[0], FAM[1], FAM[2], FAM[3]]), sw = R.chance(.5), p = sw ? f[1] : f[0], qq = sw ? f[0] : f[1], r = f[2];
      if (d === 1) {
        if (R.chance(.3)) { const s2 = R.pick([36, 64, 16, 84, 25, 75, 9, 91, 49, 51]), ans = (100 - s2) / 100;
          return { text: B(pw('sin', 2) + ' θ = ' + num(s2 / 100)) + '. What is ' + B(pw('cos', 2) + ' θ') + '?', ans: Q(100 - s2, 100), type: 'frac',
            how: [pw('cos', 2) + ' θ = 1 ' + MINUS + ' ' + pw('sin', 2) + ' θ', '= 1 ' + MINUS + ' ' + num(s2 / 100), '= ' + B(num(ans))],
            steps: [st(B('1 ' + MINUS + ' ' + num(s2 / 100)) + ' = ?', Q(100 - s2, 100), F)],
            traps: TR([tr(Q(s2, 100), 'r_identity', 'That is ' + pw('sin', 2) + ' θ. Take it away from 1.'), tr(Number.isInteger(Math.sqrt(s2)) ? Q(10 - Math.sqrt(s2), 10) : null, 'r_identity', 'Don’t take square roots: ' + pw('cos', 2) + ' θ = 1 ' + MINUS + ' ' + pw('sin', 2) + ' θ.')]) }; }
        const fnG = R.pick(['sin', 'cos']), fnA = fnG === 'sin' ? 'cos' : 'sin', ans = Q(qq, r);
        return { text: 'θ is acute and ' + B(fnG + ' θ = ' + fr(p, r)) + '. What is ' + B(fnA + ' θ') + '?', ans, type: 'frac',
          how: [pw(fnA, 2) + ' θ = 1 ' + MINUS + ' ' + supP(fr(p, r), 2) + ' = 1 ' + MINUS + ' ' + fr(p * p, r * r), '= ' + fr(qq * qq, r * r), why(fnA + ' θ = ' + B(fr(qq, r)), 'square root; θ is acute, so positive')],
          steps: [st('What is ' + B(pw(fnA, 2) + ' θ') + '?', Q(qq * qq, r * r), F), st('Take the square root.', ans, F)],
          traps: TR([tr(Q(r - p, r), 'r_identity', 'Square first: ' + pw(fnG, 2) + ' θ = ' + fr(p * p, r * r) + '.'), tr(Q(qq * qq, r * r), 'w_roots', 'That is ' + pw(fnA, 2) + ' θ. Take the square root.')]) };
      }
      if (R.chance(.3)) { const a = R.i(10, 40), k = R.i(2, 9), ex = k + ' ' + pw('sin', 2) + ' ' + a + DEG + ' + ' + k + ' ' + pw('sin', 2) + ' ' + (90 - a) + DEG;
        return { text: 'What is ' + B(ex) + '?', ans: Q(k, 1), type: 'frac',
          how: [ex, why('= ' + k + ' ' + pw('sin', 2) + ' ' + a + DEG + ' + ' + k + ' ' + pw('cos', 2) + ' ' + a + DEG, 'sin ' + (90 - a) + '° = cos ' + a + '°, since the angles add to 90°'), why('= ' + k + ' × 1 = ' + B(k), 'sin² + cos² = 1')],
          steps: [st('sin ' + (90 - a) + DEG + ' equals cos of what angle (in degrees)?', a), st('So what is the whole thing?', Q(k, 1), F)],
          traps: TR([tr(Q(2 * k, 1), 'r_identity', 'sin ' + (90 - a) + '° is cos ' + a + '°, so the parts make ' + k + ' × (sin² + cos²) = ' + k + '.'), tr(Q(0, 1), 'r_identity', 'sin² + cos² is 1.')]) }; }
      const q2 = R.chance(.5), fnG = q2 ? 'sin' : 'cos', fnA = q2 ? 'cos' : 'sin', gv = q2 ? Q(p, r) : Q(-qq, r), ans = q2 ? Q(-qq, r) : Q(-p, r), quarter = q2 ? 'between 90° and 180°' : 'between 180° and 270°';
      return { text: 'θ is ' + B(quarter) + ' and ' + B(fnG + ' θ = ' + fq(gv)) + '. What is ' + B(fnA + ' θ') + '?', ans, type: 'frac',
        how: [pw(fnA, 2) + ' θ = 1 ' + MINUS + ' ' + supP(fq(gv), 2) + ' = 1 ' + MINUS + ' ' + fr(gv.n * gv.n, r * r) + ' = ' + fr(ans.n * ans.n, r * r), why(fnA + ' θ = ±' + fr(Math.abs(ans.n), r), 'square root'), why(fnA + ' θ = ' + B(fq(ans)), q2 ? 'cos is negative between 90° and 180°' : 'sin is negative between 180° and 270°')],
        steps: [st('What is ' + B(pw(fnA, 2) + ' θ') + '?', Q(ans.n * ans.n, r * r), F), st('Take the root and choose the sign for this quarter.', ans, F)],
        traps: TR([tr(Q(-ans.n, r), 'r_unit', q2 ? 'Between 90° and 180° the x-coordinate, cos, is negative.' : 'Between 180° and 270° the y-coordinate, sin, is negative.'), tr(Q(r - Math.abs(gv.n), r), 'r_identity', 'Square first, then take away from 1.')]) };
    } },

  { id: 'r_inverse', s: 'trig', g: 11, title: 'Inverse trig: which angle?', pre: [], paper: true,
    tip: 'sin⁻¹(1/2) asks: which angle has sine 1/2? 30°. sin⁻¹ and tan⁻¹ give angles from −90° to 90°; cos⁻¹ gives 0° to 180°.',
    gen(d, R) {
      const half = fr(1, 2), r2 = fs(rt(2), 2), r3 = fs(rt(3), 2), i3 = fs(1, rt(3));
      const RANGE = { sin: '−90° to 90°', cos: '0° to 180°', tan: '−90° to 90°' };
      if (d === 0 && R.chance(.5)) {
        const k = R.i(2, 12), kind = R.i(0, 2);
        const [o, a, h, ans, fn] = kind === 0 ? [k, '', 2 * k, 30, 'sin'] : kind === 1 ? ['', k, 2 * k, 60, 'cos'] : [k, k, '', 45, 'tan'];
        const desc = kind === 0 ? 'the side opposite θ is ' + B(k) + ' and the hypotenuse is ' + B(2 * k) : kind === 1 ? 'the side next to θ is ' + B(k) + ' and the hypotenuse is ' + B(2 * k) : 'the two short sides are both ' + B(k);
        const ratio = kind === 0 ? 'sin θ = ' + fs(k, 2 * k) + ' = ' + half : kind === 1 ? 'cos θ = ' + fs(k, 2 * k) + ' = ' + half : 'tan θ = ' + fs(k, k) + ' = 1';
        return { text: 'In a right triangle, ' + desc + '. What is the angle θ?', ans, unit: DEG, vis: triSVG(String(o), String(a), String(h), { angle: 'θ' }),
          how: [why(ratio, 'SOH CAH TOA'), why('θ = ' + inv(fn) + '(' + (kind === 2 ? '1' : half) + ')', 'which angle has that ' + fn + '?'), '= ' + B(ans) + DEG],
          steps: [st('What is ' + fn + ' θ as a fraction?', kind === 2 ? 1 : 0.5), st('Which angle has that ' + fn + '?', ans)],
          traps: TR([tr(90 - ans, 'r_unit', kind === 0 ? 'sin 30° = ½ but sin 60° is bigger: the side opposite 60° is the longer leg.' : kind === 1 ? 'cos 60° = ½; cos 30° is bigger.' : 'Equal short sides make two equal angles of 45°.')]) };
      }
      const L0 = [['sin', half, 30, 30], ['cos', half, 60, 60], ['tan', '1', 45, 45], ['sin', '1', 90, 90], ['cos', '0', 90, 90], ['cos', MINUS + '1', 180, 0]];
      const L1 = [['sin', r3, 60, 60], ['cos', r2, 45, 45], ['tan', rt(3), 60, 60], ['cos', r3, 30, 30], ['sin', r2, 45, 45], ['tan', i3, 30, 30], ['sin', MINUS + half, -30, 30], ['cos', MINUS + half, 120, 60], ['tan', MINUS + '1', -45, 45]];
      const L2 = [['cos', MINUS + r3, 150, 30], ['cos', MINUS + r2, 135, 45], ['sin', MINUS + r3, -60, 60], ['tan', MINUS + rt(3), -60, 60], ['sin', MINUS + r2, -45, 45], ['tan', MINUS + i3, -30, 30]];
      if (d === 2 && R.chance(.5)) {
        const [fn, vS, ref, s1, s2] = R.pick([['sin', half, 30, 30, 150], ['cos', half, 60, 60, 300], ['tan', '1', 45, 45, 225], ['sin', r2, 45, 45, 135], ['cos', MINUS + half, 60, 120, 240], ['sin', MINUS + half, 30, 210, 330], ['cos', r3, 30, 30, 330], ['tan', rt(3), 60, 60, 240]]);
        const reason = fn === 'sin' ? (s1 < 180 ? 'sin is positive in quarters 1 and 2' : 'sin is negative in quarters 3 and 4') : fn === 'cos' ? (s1 < 90 ? 'cos is positive in quarters 1 and 4' : 'cos is negative in quarters 2 and 3') : 'tan repeats every 180°';
        return { text: B(fn + ' x = ' + vS) + ' for two angles x from 0° to 360°. What is the larger one?', ans: s2, unit: DEG,
          how: [why('reference angle = ' + ref + DEG, fn + ' ' + ref + '° = ' + vS.replace(MINUS, '')), why('x = ' + s1 + '° or ' + s2 + DEG, reason), 'larger: ' + B(s2) + DEG],
          steps: [st('What is the reference angle?', ref), st('What is the larger angle?', s2)],
          traps: TR([tr(s1, 'r_inverse', 'There are two answers from 0° to 360°. Find the larger one.'), tr(360 - ref, 'r_unit', 'Check which quarters give ' + fn + ' this sign.'), tr(180 - ref, 'r_unit', 'Check which quarters give ' + fn + ' this sign.')]) };
      }
      const [fn, vS, ans, ref] = R.pick(d === 0 ? L0 : d === 1 ? L1 : L2), neg = vS.indexOf(MINUS) === 0;
      const how = [why(inv(fn) + '(' + vS + ') is the angle whose ' + fn + ' is ' + vS, inv(fn) + ' gives an angle from ' + RANGE[fn])];
      if (neg && ans !== 180) { how.push(why(fn + ' ' + ref + DEG + ' = ' + vS.slice(1), 'special triangle')); how.push(why('angle = ' + B(num(ans)) + DEG, fn === 'cos' ? 'negative cos: go back from 180°: 180° ' + MINUS + ' ' + ref + '°' : 'negative ' + fn + ': the negative angle ' + MINUS + ref + '°')); }
      else how.push(why(fn + ' ' + ans + DEG + ' = ' + vS + ', so the angle is ' + B(ans) + DEG, ans === 45 ? '45–45–90 triangle' : ans % 30 === 0 && ans % 90 !== 0 ? '30–60–90 triangle' : 'unit circle point'));
      return { text: 'What is ' + B(inv(fn) + '(' + vS + ')') + ' in degrees?', ans, unit: DEG, how,
        steps: neg && ans !== 180 ? [st('Ignore the minus. Which angle from 0° to 90° has ' + fn + ' ' + vS.slice(1) + '?', ref), st(inv(fn) + ' gives angles from ' + RANGE[fn] + '. What is the answer?', ans)] : [st('Which angle has ' + fn + ' equal to ' + vS + '?', ans)],
        traps: TR([ref % 90 !== 0 && ref !== 45 ? tr(neg ? (fn === 'cos' ? 180 - (90 - ref) : -(90 - ref)) : 90 - ans, 'r_unit', 'sin 30° = cos 60° = ½, and sin 60° = cos 30° = ' + r3 + '. Check which one you need.') : null,
          neg && ans !== 180 ? tr(fn === 'cos' ? -ref : 360 - ref, 'r_inverse', inv(fn) + ' gives an angle from ' + RANGE[fn] + '.') : null, neg && ans !== 180 ? tr(ref, 'r_inverse', 'The value is negative, so the angle is not ' + ref + '°.') : null]) };
    } },

  { id: 'r_period', s: 'trig', g: 11, title: 'Period and amplitude', pre: [], paper: true,
    tip: 'y = a sin(bx): the amplitude is |a| (how high it goes) and the period is 360° ÷ b (how often it repeats). y = 3 sin(2x) has amplitude 3, period 180°.',
    gen(d, R) {
      const F = { type: 'frac' }, inside = b => (b === 1 ? 'x' : b + 'x');
      if (d === 0) {
        const a = (R.chance(.6) ? -1 : 1) * R.i(2, 9), b = R.i(1, 4), fn = R.pick(['sin', 'cos']), y = 'y = ' + num(a) + ' ' + fn + '(' + inside(b) + ')';
        return { text: 'What is the amplitude of ' + B(y) + '?', ans: Math.abs(a),
          how: [why('amplitude = |' + num(a) + '|', 'the number in front stretches the wave up and down' + (b > 1 ? '; the ' + b + ' inside only changes how often it repeats' : '')), '= ' + B(Math.abs(a))],
          steps: [st('What number is in front of ' + fn + '?', a), st('The amplitude is its size, never negative. What is it?', Math.abs(a))],
          traps: TR([a < 0 ? tr(a, 'r_period', 'The amplitude is a height, so it is never negative: |' + num(a) + '|.') : null, b > 1 ? tr(b, 'r_period', 'The number inside changes the period. The amplitude is the number in front.') : null, tr(2 * Math.abs(a), 'r_period', 'The amplitude is from the middle to the top, not from bottom to top.')]) };
      }
      if (d === 1) {
        const b = R.pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 0.5]), fn = R.pick(['sin', 'cos']), a = R.i(1, 5), per = 360 / b, bS = b === 0.5 ? 'x/2' : inside(b), bT = b === 0.5 ? '½' : b;
        return { text: 'What is the period of ' + B('y = ' + (a === 1 ? '' : a + ' ') + fn + '(' + bS + ')') + ' in degrees?', ans: per, unit: DEG,
          how: [why('period = 360° ÷ ' + bT, 'a plain ' + fn + ' wave repeats every 360°; times ' + bT + ' inside makes it run ' + bT + ' times as fast'), '= ' + B(per) + DEG],
          steps: [st('What number multiplies x inside?', b), st('360 ÷ that = ?', per)],
          traps: TR([tr(360 * b, 'r_period', 'A bigger number inside squeezes the wave, so the period gets shorter: divide 360° by it.'), tr(180 / b, 'r_period', 'A full wave is 360°, not 180°.'), a > 1 ? tr(360 / a, 'r_period', 'The number in front is the amplitude. The period uses the number inside.') : null]) };
      }
      const kind = R.i(0, 2);
      if (kind === 0) { const b = R.pick([2, 3, 4, 5, 6, 8, 1]), fn = R.pick(['sin', 'cos']), k = Q(2, b);
        return { text: 'The period of ' + B('y = ' + fn + '(' + inside(b) + ')') + ' is ' + B('k' + PI) + ' radians. What is k?', ans: k, type: 'frac',
          how: [why('period = 2' + PI + ' ÷ ' + b, 'a full wave is 2' + PI + ' radians (360°)'), '= ' + radS(k), 'k = ' + B(fq(k))],
          steps: [st('A full ' + fn + ' wave is how many ' + PI + ' radians?', Q(2, 1), F), st('Divide by ' + b + '. What is k?', k, F)],
          traps: TR([tr(Q(2 * b, 1), 'r_period', 'A bigger number inside makes the period shorter: divide 2' + PI + ' by ' + b + '.'), tr(Q(1, b), 'r_period', 'A full wave is 2' + PI + ', not ' + PI + '.')]) }; }
      if (kind === 1) { const a = (R.chance(.4) ? -1 : 1) * R.i(2, 9), b = R.i(2, 5), c = R.i(-6, 9), A = Math.abs(a), wantMax = R.chance(.5), ans = wantMax ? c + A : c - A;
        const y = 'y = ' + num(a) + ' sin(' + b + 'x)' + (c ? sgn(c) : '');
        return { text: 'What is the ' + B(wantMax ? 'biggest' : 'smallest') + ' value of ' + B(y) + '?', ans,
          how: [why('midline y = ' + num(c) + ', amplitude = ' + A, 'the wave goes ' + A + ' above and ' + A + ' below its midline'), wantMax ? 'biggest = ' + num(c) + ' + ' + A + ' = ' + B(num(ans)) : 'smallest = ' + num(c) + M + A + ' = ' + B(num(ans))],
          steps: [st('What is the amplitude?', A), st('What is the ' + (wantMax ? 'biggest' : 'smallest') + ' value?', ans)],
          traps: TR([tr(wantMax ? c - A : c + A, 'r_period', 'The ' + (wantMax ? 'top' : 'bottom') + ' is the midline ' + (wantMax ? 'plus' : 'minus') + ' the amplitude.'), tr(wantMax ? A : -A, 'r_period', 'The ' + sgn(c).trim() + ' moves the whole wave up or down, so include it.'), a < 0 ? tr(wantMax ? c + a : c - a, 'r_period', 'The amplitude is |' + num(a) + '| = ' + A + '; a minus sign only flips the wave.') : null]) }; }
      const b = R.pick([2, 3, 4, 5, 6, 8, 9, 10, 12]), per = 360 / b, fn = R.pick(['sin', 'cos']);
      return { text: B('y = ' + fn + '(bx)') + ' repeats every ' + B(per + DEG) + '. What is b?', ans: b,
        how: [why('360° ÷ b = ' + per + DEG, 'period = 360° ÷ b'), 'b = 360 ÷ ' + per + ' = ' + B(b)],
        steps: [st(B('360 ÷ ' + per) + ' = ?', b)],
        traps: TR([tr(Q(per, 360).d === 1 ? per / 360 : null, 'r_period', 'b = 360 ÷ the period.'), tr(per, 'r_period', 'That is the period. b is how many waves fit in 360°.'), tr(180 / per, 'r_period', 'A full wave is 360°.')]) };
    } },
]);

/* ======================= Calculus ======================= */
const fp = k => 'f′(' + (typeof k === 'number' ? num(k) : k) + ')';
const fx = k => 'f(' + (typeof k === 'number' ? num(k) : k) + ')';
const xp = n => (n === 1 ? 'x' : pw('x', n));
const LIM = a => 'lim<sub>x→' + (typeof a === 'number' ? num(a) : a) + '</sub> ';
const INT = (a, b) => '∫<sub>' + num(a) + '</sub><sup>' + num(b) + '</sup> ';
const pv2 = (cs, x) => cs.reduce((s, c) => s * x + c, 0);              /* evaluate a polynomial (coefficients high to low) */
const dcoef = cs => cs.slice(0, -1).map((c, i) => c * (cs.length - 1 - i)); /* derivative coefficients */
function polyAsc(cs) {
  const deg = cs.length - 1; let s = '';
  for (let i = cs.length - 1; i >= 0; i--) { const c = cs[i]; if (!c) continue; const e = deg - i, body = (Math.abs(c) === 1 && e > 0 ? '' : num(Math.abs(c))) + (e === 0 ? '' : xp(e)); s += s ? (c < 0 ? M : ' + ') + body : (c < 0 ? MINUS : '') + body; }
  return s || '0';
}
const subIn = (cs, x) => { const deg = cs.length - 1; let s = ''; cs.forEach((c, i) => { if (!c) return; const e = deg - i, body = (Math.abs(c) === 1 && e > 0 ? '' : num(Math.abs(c)) + (e > 0 ? ' × ' : '')) + (e === 0 ? '' : e === 1 ? ng(x) : pw(ng(x), e)); s += s ? (c < 0 ? M : ' + ') + body : (c < 0 ? MINUS : '') + body; }); return s || '0'; };

C.defs([
  { id: 'k_rate', s: 'calc', g: 11, title: 'Average rate of change', pre: ['x_slope'], paper: true,
    tip: 'Average rate of change = (change in f) ÷ (change in x), the slope between two points. For f(x) = x² from 1 to 4: (16 − 1) ÷ 3 = 5.',
    gen(d, R) {
      const F = { type: 'frac' };
      const lines = (a, b, faS, fbS, dyS, dx, r, extra) => [why('rate = ' + fs(fx(b) + M + fx(a), num(b) + M + ng(a)), 'the slope between the two points'), '= ' + fs(fbS + M + (faS.indexOf(MINUS) === 0 ? '(' + faS + ')' : faS), num(b) + M + ng(a)) + ' = ' + fs(dyS, num(dx)), '= ' + B(fq(r)) + (extra || '')];
      let a, b, f, fS, extra = '';
      if (d === 0) {
        a = R.i(-2, 4); b = a + R.i(1, 4); const m = nonzero(R, -5, 8), y1 = R.i(-5, 10), y2 = y1 + m * (b - a), dy = y2 - y1, dx = b - a, r = Q(dy, dx);
        return { text: B(fx(a) + ' = ' + num(y1)) + ' and ' + B(fx(b) + ' = ' + num(y2)) + '. What is the average rate of change of f from x = ' + num(a) + ' to x = ' + num(b) + '?', ans: r, type: 'frac', vis: table([['x', a, b], ['f(x)', y1, y2]]),
          how: lines(a, b, num(y1), num(y2), num(dy), dx, r),
          steps: [st('How much does f change? ' + B(num(y2) + M + ng(y1)) + ' = ?', dy), st('How much does x change?', dx), st('Divide.', r, F)],
          traps: TR([tr(Q(dy, 1), 'k_rate', 'Divide the change in f by the change in x, ' + dx + '.'), tr(Q(dx, dy), 'x_slope', 'The change in f goes on top.'), tr(y1 < 0 ? Q(y2 + y1, dx) : null, 'n_intsub', 'Take away: ' + num(y2) + M + ng(y1) + '.')]) };
      }
      const kind = d === 1 ? 0 : R.i(1, 3);
      if (kind === 3) {
        a = R.i(1, 6); b = R.i(1, 6); if (a === b) return null; if (a > b) [a, b] = [b, a];
        const r = Q(-1, a * b);
        return { text: 'What is the average rate of change of ' + B('f(x) = ' + fs(1, 'x')) + ' from x = ' + a + ' to x = ' + b + '?', ans: r, type: 'frac',
          how: [why('rate = ' + fs(fx(b) + M + fx(a), b + M + a), 'the slope between the two points'), '= ' + fs(fr(1, b) + M + fr(1, a), b - a), why('= ' + fs(fr(a - b, a * b), b - a) + ' = ' + B(fq(r)), fr(1, b) + M + fr(1, a) + ' = ' + fr(a - b, a * b))],
          steps: [st('What is ' + B(fr(1, b) + M + fr(1, a)) + '?', Q(a - b, a * b), F), st('Divide by ' + (b - a) + '.', r, F)],
          traps: TR([tr(Q(a - b, a * b), 'k_rate', 'Now divide by the change in x, ' + (b - a) + '.'), tr(Q(1, a * b), 'n_intsub', 'f goes down as x goes up here, so the rate is negative.')]) };
      }
      a = R.i(-4, 3); b = a + R.i(1, 5);
      if (kind === 0) { f = x => x * x; fS = sq('x'); extra = '   (shortcut for x²: ' + num(a) + ' + ' + ng(b) + ' = ' + num(a + b) + ')'; }
      else if (kind === 1) { const p = nonzero(R, -3, 3), q = R.i(-5, 5); f = x => p * x * x + q * x; fS = poly([p, q, 0]); }
      else { f = x => x * x * x; fS = pw('x', 3); extra = '   (shortcut for x³: ' + sq(ng(a)) + ' + ' + ng(a) + ' × ' + ng(b) + ' + ' + sq(ng(b)) + ')'; }
      const fa = f(a), fb = f(b), dy = fb - fa, dx = b - a, r = Q(dy, dx);
      return { text: 'What is the average rate of change of ' + B('f(x) = ' + fS) + ' from x = ' + num(a) + ' to x = ' + num(b) + '?', ans: r, type: 'frac',
        how: lines(a, b, num(fa), num(fb), num(dy), dx, r, extra),
        steps: [st('What is ' + B(fx(a)) + '?', fa), st('What is ' + B(fx(b)) + '?', fb), st('Rate = (change in f) ÷ (change in x). What is it?', r, F)],
        traps: TR([tr(Q(dy, 1), 'k_rate', 'Divide the change in f by the change in x, ' + dx + '.'), tr(dy ? Q(dx, dy) : null, 'x_slope', 'The change in f goes on top.'), fa < 0 || a < 0 ? tr(Q(fb + fa, dx), 'n_intsub', 'Take away carefully: ' + num(fb) + M + ng(fa) + '.') : null]) };
    } },

  { id: 'k_limit', s: 'calc', g: 12, title: 'Limits: plug in or factor', pre: ['x_factor'], paper: true,
    tip: 'Plug in first. If you get 0/0, factor and cancel, then plug in. (x² − 9)/(x − 3) as x → 3: (x − 3)(x + 3)/(x − 3) = x + 3 → 6.',
    gen(d, R) {
      const F = { type: 'frac' }, lin = r => poly([1, -r]);
      if (d === 0) {
        const a = R.i(-3, 4), cs = [nonzero(R, -3, 3), R.i(-6, 6), R.i(-9, 9)], ans = pv2(cs, a);
        return { text: 'What is ' + B(LIM(a) + '(' + poly(cs) + ')') + '?', ans: Q(ans, 1), type: 'frac',
          how: [why('= ' + subIn(cs, a), 'nothing divides by 0, so just plug in x = ' + num(a)), '= ' + B(num(ans))],
          steps: [st('Plug in x = ' + num(a) + '. What do you get?', Q(ans, 1), F)],
          traps: TR([tr(Q(pv2(cs, -a), 1), 'n_intmul', 'Plug in x = ' + num(a) + ' carefully; mind the signs.'), tr(Q(cs[0] * 2 * a + cs[1] * a + cs[2], 1), 'w_exp', sq('x') + ' means x × x: ' + sq(ng(a)) + ' = ' + a * a + '.')]) };
      }
      if (d === 1) {
        const a = nonzero(R, -5, 6), s = R.i(-6, 6); if (s === a) return null;
        const top = poly([1, -(a + s), a * s]), ans = Q(a - s, 1);
        return { text: 'What is ' + B(LIM(a) + fs(top, lin(a))) + '?', ans, type: 'frac',
          how: [why('plugging in ' + num(a) + ' gives ' + fs(0, 0), 'so factor first'), why('= ' + LIM(a) + fs('(' + lin(a) + ')(' + lin(s) + ')', lin(a)), 'factor the top'), why('= ' + LIM(a) + '(' + lin(s) + ')', 'cancel (' + lin(a) + ')'), '= ' + num(a) + sgn(-s) + ' = ' + B(num(a - s))],
          steps: [st('The top factors as (' + lin(a) + ')(x + ?). What number goes in the box?', Q(-s, 1), F), st('Cancel, then plug in x = ' + num(a) + '.', ans, F)],
          traps: TR([tr(Q(0, 1), 'k_limit', fs(0, 0) + ' is not 0. It means factor and cancel first.'), tr(Q(a + s, 1), 'x_factor', 'Check the factors: (' + lin(a) + ')(' + lin(s) + ').'), tr(Q(s - a, 1), 'n_intsub', 'Plug ' + num(a) + ' into x ' + sgn(-s) + '.')]) };
      }
      const kind = R.i(0, 2);
      if (kind === 0) {
        const a = R.i(1, 4), a3 = a * a * a, ans = Q(3 * a * a, 1);
        return { text: 'What is ' + B(LIM(a) + fs(pw('x', 3) + M + a3, lin(a))) + '?', ans, type: 'frac',
          how: [why('plugging in gives ' + fs(0, 0), 'so factor'), why(pw('x', 3) + M + a3 + ' = (' + lin(a) + ')(' + poly([1, a, a * a]) + ')', 'difference of cubes'), why('= ' + LIM(a) + '(' + poly([1, a, a * a]) + ')', 'cancel (' + lin(a) + ')'), '= ' + a * a + ' + ' + a * a + ' + ' + a * a + ' = ' + B(3 * a * a)],
          steps: [st(pw('x', 3) + M + a3 + ' = (' + lin(a) + ')(' + sq('x') + ' + ' + a + 'x + ?). What goes in the box?', Q(a * a, 1), F), st('Cancel and plug in x = ' + a + '.', ans, F)],
          traps: TR([tr(Q(0, 1), 'k_limit', fs(0, 0) + ' means factor and cancel first.'), tr(Q(a * a, 1), 'k_limit', 'All three terms of ' + poly([1, a, a * a]) + ' count at x = ' + a + '.'), tr(Q(3 * a, 1), 'k_limit', 'Plug in x = ' + a + ': ' + sq(a) + ' + ' + a + ' × ' + a + ' + ' + sq(a) + '.')]) };
      }
      if (kind === 1) {
        const a = nonzero(R, -4, 4), s = R.i(-5, 5), t = R.i(-5, 5); if (s === a || t === a || s === t) return null;
        const ans = Q(a - s, a - t);
        return { text: 'What is ' + B(LIM(a) + fs(poly([1, -(a + s), a * s]), poly([1, -(a + t), a * t]))) + '?', ans, type: 'frac',
          how: [why('plugging in gives ' + fs(0, 0), 'so factor top and bottom'), '= ' + LIM(a) + fs('(' + lin(a) + ')(' + lin(s) + ')', '(' + lin(a) + ')(' + lin(t) + ')'), why('= ' + LIM(a) + fs(lin(s), lin(t)), 'cancel (' + lin(a) + ')'), '= ' + fs(num(a) + sgn(-s), num(a) + sgn(-t)) + ' = ' + B(fq(ans))],
          steps: [st('Both factor with (' + lin(a) + '). After cancelling, the top is x + ?. What number?', Q(-s, 1), F), st('And the bottom is x + ?. What number?', Q(-t, 1), F), st('Plug in x = ' + num(a) + '.', ans, F)],
          traps: TR([tr(Q(0, 1), 'k_limit', fs(0, 0) + ' means factor and cancel first.'), tr(Q(1, 1), 'k_limit', 'Only the (' + lin(a) + ') factors cancel; plug in what is left.'), tr(Q(s, t), 'k_limit', 'After cancelling, plug in x = ' + num(a) + '.')]) };
      }
      const a = R.i(2, 6), ans = Q(1, 2 * a);
      return { text: 'What is ' + B(LIM(a * a) + fs(rt('x') + M + a, 'x' + M + a * a)) + '?', ans, type: 'frac',
        how: [why('x' + M + a * a + ' = (' + rt('x') + M + a + ')(' + rt('x') + ' + ' + a + ')', 'difference of squares'), why('= ' + LIM(a * a) + fs(1, rt('x') + ' + ' + a), 'cancel (' + rt('x') + M + a + ')'), '= ' + fs(1, a + ' + ' + a) + ' = ' + B(frac(1, 2 * a))],
        steps: [st('After cancelling, the bottom is ' + rt('x') + ' + ' + a + '. What is it at x = ' + a * a + '?', Q(2 * a, 1), F), st('So what is the limit?', ans, F)],
        traps: TR([tr(Q(0, 1), 'k_limit', fs(0, 0) + ' means factor and cancel first.'), tr(Q(1, a), 'k_limit', 'At x = ' + a * a + ', ' + rt('x') + ' + ' + a + ' = ' + 2 * a + '.'), tr(Q(2 * a, 1), 'k_limit', 'The ' + 2 * a + ' ends up on the bottom.')]) };
    } },

  { id: 'k_infinity', s: 'calc', g: 12, title: 'Limits at infinity', pre: [], paper: true,
    tip: 'As x gets huge, only the biggest powers matter. (6x² + 5)/(2x² − x) → 6x²/2x² = 3. If the bottom has the bigger power, the limit is 0.',
    gen(d, R) {
      const F = { type: 'frac' }, lead = (c, n) => (Math.abs(c) === 1 ? (c < 0 ? MINUS : '') : num(c)) + xp(n);
      const mk = (n, c) => { const cs = [c]; for (let i = 0; i < n; i++) cs.push(R.i(-9, 9)); return cs; };
      if (d < 2 && !(d === 1 && R.chance(.3))) {
        const n = R.i(1, 3), q = nonzero(R, -5, 5), p = d === 0 ? q * nonzero(R, -5, 5) : nonzero(R, -9, 9), ans = Q(p, q);
        if (d === 1 && ans.d === 1) return null;
        const top = mk(n, p), bot = mk(n, q);
        return { text: 'What is ' + B(LIM('∞') + fs(poly(top), poly(bot))) + '?', ans, type: 'frac',
          how: [why('biggest powers: ' + lead(p, n) + ' on top, ' + lead(q, n) + ' on the bottom', 'for huge x the other terms hardly matter'), why('→ ' + fs(lead(p, n), lead(q, n)) + ' = ' + fs(num(p), num(q)), 'the ' + xp(n) + ' cancels'), '= ' + B(fq(ans))],
          steps: [st('What number is in front of the biggest power on top?', p), st('And on the bottom?', q), st('Divide them.', ans, F)],
          traps: TR([top[n] && bot[n] ? tr(Q(top[n], bot[n]), 'k_infinity', 'The constants matter least when x is huge. Use the biggest powers.') : null, tr(Q(q, p), 'k_infinity', 'Top over bottom: ' + fs(num(p), num(q)) + '.'), tr(Q(0, 1), 'k_infinity', 'The powers on top and bottom are the same, so they cancel and leave a number.')]) };
      }
      if (d === 1) {
        const nb = R.i(2, 3), nt = R.i(1, nb - 1), top = mk(nt, nonzero(R, -9, 9)), bot = mk(nb, nonzero(R, -5, 5));
        return { text: 'What is ' + B(LIM('∞') + fs(poly(top), poly(bot))) + '?', ans: Q(0, 1), type: 'frac',
          how: [why('biggest powers: ' + lead(top[0], nt) + ' on top, ' + lead(bot[0], nb) + ' on the bottom', 'for huge x only these matter'), why('→ ' + fs(num(top[0]), (Math.abs(bot[0]) === 1 ? (bot[0] < 0 ? MINUS : '') : num(bot[0])) + xp(nb - nt)), 'cancel ' + xp(nt)), why('limit = ' + B(0), 'x is still on the bottom, so the fraction shrinks to 0')],
          steps: [st('What is the biggest power of x on top?', nt), st('And on the bottom?', nb), st('The bottom grows faster. What is the limit?', Q(0, 1), F)],
          traps: TR([tr(Q(top[0], bot[0]), 'k_infinity', 'Leading numbers divide only when the powers match. Here the bottom power is bigger.'), tr(Q(top[nt], bot[nb]) , 'k_infinity', 'The constants matter least when x is huge.')]) };
      }
      if (R.chance(.5)) {
        const n = R.i(1, 3), q = nonzero(R, -6, 6), p = nonzero(R, -9, 9), top = mk(n, p), bot = mk(n, q), ans = Q(p, q);
        if (!top[n] || !bot[n]) return null;
        return { text: 'What is ' + B(LIM('∞') + fs(polyAsc(top), polyAsc(bot))) + '?', ans, type: 'frac',
          how: [why('biggest powers: ' + lead(p, n) + ' on top, ' + lead(q, n) + ' on the bottom', 'they are written last here; order does not matter'), '→ ' + fs(lead(p, n), lead(q, n)) + ' = ' + fs(num(p), num(q)), '= ' + B(fq(ans))],
          steps: [st('What number is in front of the biggest power on top?', p), st('And on the bottom?', q), st('Divide them.', ans, F)],
          traps: TR([tr(Q(top[n], bot[n]), 'k_infinity', 'The numbers written first are the constants. Use the biggest powers.'), tr(Q(q, p), 'k_infinity', 'Top over bottom.')]) };
      }
      const qq = R.i(1, 6), p = nonzero(R, -9, 9), c = R.i(-9, 9), e = R.i(1, 20), ans = Q(p, qq);
      return { text: 'What is ' + B(LIM('∞') + fs(poly([p, c]), rt(poly([qq * qq, 0, e])))) + '?', ans, type: 'frac',
        how: [why(rt(poly([qq * qq, 0, e])) + ' behaves like ' + rt(qq * qq + sq('x')) + ' = ' + (qq === 1 ? '' : qq) + 'x', 'for huge positive x'), '→ ' + fs(lead(p, 1), (qq === 1 ? '' : qq) + 'x') + ' = ' + fs(num(p), qq), '= ' + B(fq(ans))],
        steps: [st('For huge x, ' + rt(poly([qq * qq, 0, e])) + ' is about ?x. What number?', Q(qq, 1), F), st('So what is the limit?', ans, F)],
        traps: TR([tr(Q(p, qq * qq), 'w_roots', 'Take the square root: ' + rt(qq * qq + sq('x')) + ' = ' + (qq === 1 ? '' : qq) + 'x.'), tr(Q(0, 1), 'k_infinity', 'Under the root the power is 2, so the bottom grows like x, the same as the top.')]) };
    } },

  { id: 'k_power', s: 'calc', g: 12, title: 'The power rule', pre: ['w_negexp'], paper: true,
    tip: 'd/dx of xⁿ is n·xⁿ⁻¹: bring the power down, take 1 off. f(x) = x⁵ gives f′(x) = 5x⁴, so f′(2) = 5 × 16 = 80.',
    gen(d, R) {
      const F = { type: 'frac' };
      if (d === 0 || (d === 1 && R.chance(.5))) {
        const c = d === 0 ? 1 : R.i(2, 6), n = d === 0 ? R.i(2, 5) : R.i(2, 4), a = d === 0 ? R.pick([2, 3, -2, -1]) : nonzero(R, -3, 3), an1 = P(a, n - 1), ans = c * n * an1;
        const fS = (c === 1 ? '' : c) + xp(n), dS = num(c * n) + xp(n - 1);
        return { text: B('f(x) = ' + fS) + '. What is ' + B(fp(a)) + '?', ans: Q(ans, 1), type: 'frac',
          how: [why(fp('x') + ' = ' + (c === 1 ? '' : c + ' × ') + n + xp(n - 1) + (c === 1 ? '' : ' = ' + dS), 'bring the power down, take 1 off it'), fp(a) + ' = ' + num(c * n) + ' × ' + (n - 1 === 1 ? ng(a) : pw(ng(a), n - 1)), '= ' + num(c * n) + ' × ' + ng(an1) + ' = ' + B(num(ans))],
          steps: [st(fp('x') + ' = ?' + xp(n - 1) + '. What number goes in front?', Q(c * n, 1), F), st('Plug in x = ' + num(a) + '.', Q(ans, 1), F)],
          traps: TR([tr(Q(c * n * P(a, n), 1), 'k_power', 'Take 1 off the power: ' + xp(n) + ' becomes ' + xp(n - 1) + '.'), tr(Q(c * an1, 1), 'k_power', 'Bring the power ' + n + ' down in front as well.'), tr(Q(c * P(a, n), 1), 'k_power', 'That is ' + fx(a) + '. The question asks for the slope, ' + fp(a) + '.'), a < 0 ? tr(Q(-ans, 1), 'n_intmul', 'Check the sign of ' + pw(ng(a), n - 1) + '.') : null]) };
      }
      if (d === 1) {
        const c = R.i(1, 4), m = R.i(1, 2), a = R.i(1, 3), ans = Q(-c * m, P(a, m + 1));
        if (a === 1 && m === 1 && c === 1) return null;
        return { text: B('f(x) = ' + fs(c, xp(m))) + '. What is ' + B(fp(a)) + '?', ans, type: 'frac',
          how: [why('f(x) = ' + (c === 1 ? '' : c) + pw('x', MINUS + m), 'write it as a power of x'), why(fp('x') + ' = ' + num(-c * m) + pw('x', MINUS + (m + 1)), 'bring down ' + MINUS + m + ', take 1 off: ' + MINUS + m + M + '1 = ' + MINUS + (m + 1)), fp(a) + ' = ' + fs(num(-c * m), pw(a, m + 1)) + ' = ' + B(fq(ans))],
          steps: [st('Write f as c·x to a power. What is the power?', Q(-m, 1), F), st('After the power rule, what is the new power?', Q(-(m + 1), 1), F), st('What is ' + fp(a) + '?', ans, F)],
          traps: TR([tr(Q(c * m, P(a, m + 1)), 'w_negexp', 'Bringing down ' + MINUS + m + ' makes the answer negative.'), tr(Q(-c * m, P(a, m - 1)), 'k_power', MINUS + m + M + '1 = ' + MINUS + (m + 1) + ': taking 1 off a negative power makes it more negative.'), tr(Q(c, P(a, m)), 'k_power', 'That is ' + fx(a) + '. Find the slope ' + fp(a) + '.')]) };
      }
      const kind = R.i(0, 3);
      const T = [
        { f: rt('x'), ex: '1/2', dS: fs(1, 2) + pw('x', MINUS + '1/2') + ' = ' + fs(1, '2' + rt('x')), k: () => R.i(2, 9), at: k => k * k, ans: k => Q(1, 2 * k), ev: k => fs(1, '2' + rt(k * k)) + ' = ' + fs(1, '2 × ' + k) },
        { f: pw('x', '3/2'), ex: '3/2', dS: fs(3, 2) + pw('x', '1/2') + ' = ' + fs(3, 2) + rt('x'), k: () => R.i(2, 9), at: k => k * k, ans: k => Q(3 * k, 2), ev: k => fs(3, 2) + ' × ' + rt(k * k) + ' = ' + fs(3, 2) + ' × ' + k },
        { f: rt('x', 3), ex: '1/3', dS: fs(1, 3) + pw('x', MINUS + '2/3'), k: () => R.i(2, 4), at: k => k * k * k, ans: k => Q(1, 3 * k * k), ev: k => fs(1, 3) + ' × ' + fs(1, supP(rt(k * k * k, 3), 2)) + ' = ' + fs(1, '3 × ' + k * k) },
        { f: fs(1, rt('x')), ex: MINUS + '1/2', dS: MINUS + fs(1, 2) + pw('x', MINUS + '3/2'), k: () => R.i(2, 4), at: k => k * k, ans: k => Q(-1, 2 * k * k * k), ev: k => MINUS + fs(1, 2) + ' × ' + fs(1, supP(rt(k * k), 3)) + ' = ' + MINUS + fs(1, '2 × ' + k * k * k) }][kind];
      const k = T.k(), x0 = T.at(k), ans = T.ans(k);
      return { text: B('f(x) = ' + T.f) + '. What is ' + B(fp(x0)) + '?', ans, type: 'frac',
        how: [why('f(x) = ' + pw('x', T.ex), 'write the root as a power'), why(fp('x') + ' = ' + T.dS, 'power rule: bring down ' + T.ex + ', take 1 off'), fp(x0) + ' = ' + T.ev(k), '= ' + B(fq(ans))],
        steps: [st('Write f as a power of x. What is the power?', Q(...T.ex.replace(MINUS, '-').split('/').map(Number)), F), st('What is ' + fp(x0) + '?', ans, F)],
        traps: TR([tr(Q(ans.d, ans.n), 'k_power', 'Check which part ends up on the bottom.'), tr(Q(-ans.n, ans.d), 'w_negexp', 'Check the sign: the power you bring down is ' + T.ex + '.'), kind === 0 ? tr(Q(1, k), 'k_power', 'Bring down the ½ too: ' + fs(1, 2) + ' × ' + fs(1, k) + '.') : null]) };
    } },

  { id: 'k_poly', s: 'calc', g: 12, title: 'Derivatives of polynomials', pre: [], paper: true,
    tip: 'Take each term on its own with the power rule; a number on its own disappears. f(x) = 3x² + 5x + 7 gives f′(x) = 6x + 5.',
    gen(d, R) {
      const F = { type: 'frac' };
      const solve = (cs, k, pre) => { const dc = dcoef(cs), ans = pv2(dc, k), c0 = cs[cs.length - 1];
        return { ans, dc, how: (pre || []).concat([why(fp('x') + ' = ' + poly(dc), 'power rule on each term' + (c0 ? '; the ' + num(c0) + ' on its own disappears' : '')), fp(k) + ' = ' + subIn(dc, k), '= ' + B(num(ans))]),
          traps: [c0 ? tr(ans + c0, 'k_poly', 'A number on its own has slope 0, so it disappears.') : null, tr(pv2(cs, k), 'k_poly', 'That is ' + fx(k) + '. Use ' + fp('x') + '.'), tr(pv2(cs.slice(0, -1), k), 'k_power', 'Bring each power down in front: ' + poly(dc) + '.'), tr(pv2(dc, -k), 'n_intmul', 'Plug in x = ' + num(k) + ' carefully; mind the signs.')] }; };
      if (d < 2) {
        const cs = d === 0 ? [nonzero(R, -5, 5), nonzero(R, -9, 9), R.i(-9, 9)] : [nonzero(R, -3, 3), R.i(-6, 6), nonzero(R, -9, 9), R.i(-9, 9)], k = R.i(-3, 3);
        if (k === 0 && d === 1) return null;
        const s = solve(cs, k);
        return { text: B('f(x) = ' + poly(cs)) + '. What is ' + B(fp(k)) + '?', ans: s.ans, how: s.how,
          steps: [st('In ' + fp('x') + ', what number goes in front of ' + xp(cs.length - 2) + '?', s.dc[0]), st('What is ' + B(fp(k)) + '?', s.ans)],
          traps: TR(s.traps) };
      }
      if (R.chance(.5)) {
        const k = R.i(-3, 3);
        if (R.chance(.5)) { const p = nonzero(R, -6, 6), q = nonzero(R, -6, 6), cs = [1, p + q, p * q], s = solve(cs, k, [why('f(x) = ' + poly(cs), 'multiply out first')]);
          return { text: B('f(x) = (' + poly([1, p]) + ')(' + poly([1, q]) + ')') + '. What is ' + B(fp(k)) + '?', ans: s.ans, how: s.how,
            steps: [st('Multiply out: f(x) = ' + sq('x') + ' + ?x ' + sgn(p * q).trim() + '. What number?', p + q), st('What is ' + B(fp(k)) + '?', s.ans)],
            traps: TR(s.traps.concat([tr(1, 'k_product', 'The derivative of a product is not the product of the derivatives (1 × 1). Multiply out first.')])) };
        }
        const m = R.i(2, 4) * (R.chance(.3) ? -1 : 1), n = nonzero(R, -5, 5), cs = [m * m, 2 * m * n, n * n], s = solve(cs, k, [why('f(x) = ' + poly(cs), 'multiply out first: (' + poly([m, n]) + ')(' + poly([m, n]) + ')')]);
        return { text: B('f(x) = ' + supP(poly([m, n]), 2)) + '. What is ' + B(fp(k)) + '?', ans: s.ans, how: s.how,
          steps: [st('Multiply out: f(x) = ' + m * m + sq('x') + ' + ?x + ' + n * n + '. What number?', 2 * m * n), st('What is ' + B(fp(k)) + '?', s.ans)],
          traps: TR([tr(2 * m * m * k, 'x_foil', 'Multiplying out (' + poly([m, n]) + ')² gives a middle term too: 2 × (' + num(m) + 'x) × ' + ng(n) + '.')].concat(s.traps)) };
      }
      if (R.chance(.5)) { const k = R.i(1, 4), b = R.i(-6, 9), c = R.i(1, 9), v = 2 * k + b;
        return { text: B('f(x) = ' + sq('x') + ' + bx + ' + c) + ' and ' + B(fp(k) + ' = ' + num(v)) + '. What is b?', ans: b,
          how: [why(fp('x') + ' = 2x + b', 'power rule; the ' + c + ' disappears'), fp(k) + ' = ' + 2 * k + ' + b = ' + num(v), 'b = ' + num(v) + M + 2 * k + ' = ' + B(num(b))],
          steps: [st('What is ' + fp(k) + ' without the b? (2 × ' + k + ')', 2 * k), st('Solve ' + 2 * k + ' + b = ' + num(v) + '.', b)],
          traps: TR([tr(v - k * k, 'k_poly', 'Use the slope ' + fp('x') + ' = 2x + b, not f(x).'), tr(v - k, 'k_power', 'The derivative of ' + sq('x') + ' is 2x, so at x = ' + k + ' it is ' + 2 * k + '.'), tr(v + 2 * k, 'x_onestep', 'Take ' + 2 * k + ' away from both sides.')]) }; }
      const k = R.i(1, 3), a = nonzero(R, -4, 5), c = nonzero(R, -6, 6), v = 3 * a * k * k + c;
      return { text: B('f(x) = a' + pw('x', 3) + sgn(c) + 'x') + ' and ' + B(fp(k) + ' = ' + num(v)) + '. What is a?', ans: a,
        how: [why(fp('x') + ' = 3a' + sq('x') + sgn(c), 'power rule on each term'), fp(k) + ' = ' + 3 * k * k + 'a' + sgn(c) + ' = ' + num(v), 3 * k * k + 'a = ' + num(v - c) + ',  a = ' + B(num(a))],
        steps: [st('In ' + fp(k) + ' = ?a' + sgn(c) + ', what number goes with a? (3 × ' + sq(k) + ')', 3 * k * k), st('Solve for a.', a)],
        traps: TR([tr((v - c) / (k * k * k), 'k_power', 'The slope of a' + pw('x', 3) + ' is 3a' + sq('x') + '.'), tr((v + c) / (3 * k * k), 'n_intsub', 'Undo ' + sgn(c).trim() + ' first: ' + (c > 0 ? 'take away ' + c : 'add ' + -c) + '.')]) };
    } },

  { id: 'k_tangent', s: 'calc', g: 12, title: 'Tangent lines', pre: ['x_linear'], paper: true,
    tip: 'The tangent line at x = a has slope f′(a) and passes through (a, f(a)). Put both into y = mx + b to find b.',
    gen(d, R) {
      const F = { type: 'frac' };
      if (d === 0) {
        const a = nonzero(R, -4, 4), c = R.i(-6, 6), k = nonzero(R, -4, 4), cs = [a, 0, c], m = 2 * a * k;
        return { text: B('f(x) = ' + poly(cs)) + '. What is the slope of the tangent line at ' + B('x = ' + num(k)) + '?', ans: m,
          how: [why(fp('x') + ' = ' + poly([2 * a, 0]), 'power rule'), why('slope = ' + fp(k) + ' = ' + num(2 * a) + ' × ' + ng(k), 'the tangent slope is the derivative there'), '= ' + B(num(m))],
          steps: [st(fp('x') + ' = ?x. What number?', 2 * a), st('What is ' + fp(k) + '?', m)],
          traps: TR([tr(pv2(cs, k), 'k_tangent', 'That is the height ' + fx(k) + '. The slope is ' + fp(k) + '.'), tr(a * k, 'k_power', 'The slope of ' + sq('x') + ' is 2x: bring the 2 down.'), tr(-m, 'n_intmul', 'Check the sign of ' + num(2 * a) + ' × ' + ng(k) + '.')]) };
      }
      const xi = d === 2 && R.chance(.5), cubic = d === 2 && !xi;
      const k = nonzero(R, -3, 3), cs = cubic ? [1, 0, R.i(-6, 6), R.i(-6, 6)] : [1, R.i(-6, 6), R.i(-9, 9)], dc = dcoef(cs), m = pv2(dc, k), fk = pv2(cs, k), b = fk - m * k;
      if (xi && m === 0) return null;
      const base = [why('m = ' + fp(k) + ' = ' + subIn(dc, k) + ' = ' + num(m), fp('x') + ' = ' + poly(dc)), why('point: ' + fx(k) + ' = ' + subIn(cs, k) + ' = ' + num(fk), 'the line touches the curve at (' + num(k) + ', ' + num(fk) + ')')];
      if (!xi) return { text: B('f(x) = ' + poly(cs)) + '. The tangent line at ' + B('x = ' + num(k)) + ' is ' + B('y = mx + b') + '. What is b?', ans: b,
        how: base.concat([why(num(fk) + ' = ' + num(m) + ' × ' + ng(k) + ' + b', 'put the point into y = mx + b'), 'b = ' + num(fk) + M + ng(m * k) + ' = ' + B(num(b))]),
        steps: [st('What is the slope m = ' + fp(k) + '?', m), st('What is ' + fx(k) + '?', fk), st('Solve ' + num(fk) + ' = ' + num(m) + ' × ' + ng(k) + ' + b.', b)],
        traps: TR([tr(fk, 'k_tangent', fx(k) + ' is the height at x = ' + num(k) + '. b is where the line crosses the y-axis.'), tr(m, 'k_tangent', 'That is the slope m. Now find b.'), tr(fk + m * k, 'n_intsub', 'Take ' + num(m) + ' × ' + ng(k) + ' = ' + num(m * k) + ' away from ' + num(fk) + '.')]) };
      const ans = Q(k * m - fk, m);
      return { text: B('f(x) = ' + poly(cs)) + '. Where does the tangent line at ' + B('x = ' + num(k)) + ' cross the x-axis? (Give the x-value.)', ans, type: 'frac',
        how: base.concat([why('0 = ' + num(fk) + ' + ' + ng(m) + '(x' + M + ng(k) + ')', 'tangent: y = ' + fx(k) + ' + m(x ' + MINUS + ' ' + num(k) + '), and y = 0 on the x-axis'), 'x = ' + num(k) + M + fs(num(fk), num(m)) + ' = ' + B(fq(ans))]),
        steps: [st('What is the slope m?', Q(m, 1), F), st('What is ' + fx(k) + '?', Q(fk, 1), F), st('Solve 0 = ' + num(fk) + ' + ' + ng(m) + '(x ' + MINUS + ' ' + ng(k) + ').', ans, F)],
        traps: TR([tr(Q(k * m + fk, m), 'n_intsub', 'Move ' + num(fk) + ' to the other side carefully: x = ' + num(k) + M + fs(num(fk), num(m)) + '.'), tr(Q(-fk, m), 'k_tangent', 'The line goes through (' + num(k) + ', ' + num(fk) + '), so include x ' + MINUS + ' ' + num(k) + '.')]) };
    } },

  { id: 'k_chain', s: 'calc', g: 12, title: 'The chain rule', pre: ['x_compose'], paper: true,
    tip: 'Outside, then inside: d/dx (2x + 1)³ = 3(2x + 1)² × 2. Do the outside as if the inside were x, then multiply by the slope of the inside.',
    gen(d, R) {
      const F = { type: 'frac' }, pw1 = (b, e) => (e === 1 ? '(' + b + ')' : supP(b, e));
      if (d === 0 || (d === 1 && R.chance(.5))) {
        const sq2 = d === 1, p = sq2 ? 1 : R.i(2, 3), q = R.i(-3, 3), n = R.i(2, 4), k = sq2 ? nonzero(R, -2, 2) : R.i(0, 2);
        const inner = sq2 ? poly([1, 0, q]) : poly([p, q]), u = sq2 ? k * k + q : p * k + q, du = sq2 ? 2 * k : p, ans = n * P(u, n - 1) * du;
        if (Math.abs(u) > 5 || u === 0) return null;
        return { text: B('f(x) = ' + supP(inner, n)) + '. What is ' + B(fp(k)) + '?', ans: Q(ans, 1), type: 'frac',
          how: [why(fp('x') + ' = ' + n + pw1(inner, n - 1) + ' × ' + (sq2 ? '2x' : p), 'outside: bring down ' + n + ' and take 1 off; then times the inside’s slope'), why(fp(k) + ' = ' + n + ' × ' + pw1(num(u), n - 1) + ' × ' + ng(du), 'inside at x = ' + num(k) + ' is ' + num(u)), '= ' + B(num(ans))],
          steps: [st('What is the inside, ' + inner + ', at x = ' + num(k) + '?', Q(u, 1), F), st('What is the slope of the inside at x = ' + num(k) + '?', Q(du, 1), F), st('What is ' + fp(k) + '?', Q(ans, 1), F)],
          traps: TR([tr(Q(n * P(u, n - 1), 1), 'k_chain', 'Multiply by the slope of the inside, ' + num(du) + '.'), tr(Q(du, 1), 'k_chain', 'Do the outside too: ' + n + ' × (inside)<sup>' + (n - 1) + '</sup>.'), tr(Q(n * P(u, n) * du, 1), 'k_power', 'Take 1 off the outside power.')]) };
      }
      if (d === 1) {
        const [k, q, r] = R.pick([[3, 16, 5], [4, 9, 5], [5, 144, 13], [12, 25, 13], [8, 36, 10], [6, 64, 10], [15, 64, 17], [8, 225, 17], [1, 3, 2], [2, 5, 3]]), ans = Q(k, r);
        return { text: B('f(x) = ' + rt(poly([1, 0, q]))) + '. What is ' + B(fp(k)) + '?', ans, type: 'frac',
          how: [why(fp('x') + ' = ' + fs(1, '2' + rt(poly([1, 0, q]))) + ' × 2x = ' + fs('x', rt(poly([1, 0, q]))), 'outside: ' + rt('u') + ' has slope ' + fs(1, '2' + rt('u')) + '; inside slope 2x'), fp(k) + ' = ' + fs(k, rt(k * k + ' + ' + q)) + ' = ' + fs(k, rt(k * k + q)), '= ' + B(fq(ans))],
          steps: [st('What is ' + B(rt(k * k + ' + ' + q)) + '?', Q(r, 1), F), st('What is ' + fp(k) + '?', ans, F)],
          traps: TR([tr(Q(1, 2 * r), 'k_chain', 'Multiply by the slope of the inside, 2x = ' + 2 * k + '.'), tr(Q(2 * k, r), 'k_chain', 'The ½ from the square root cancels the 2 from 2x.')]) };
      }
      const kind = R.i(0, 2);
      if (kind === 0) { const k = nonzero(R, -4, 4), ans = Q(2 * k, 1);
        return { text: B('f(x) = ' + pw('e', poly([1, 0, -k * k]))) + '. What is ' + B(fp(k)) + '?', ans, type: 'frac',
          how: [why(fp('x') + ' = ' + pw('e', poly([1, 0, -k * k])) + ' × 2x', pw('e', 'u') + ' is its own slope; times the inside’s slope 2x'), fp(k) + ' = ' + pw('e', '0') + ' × ' + ng(2 * k), '= 1 × ' + ng(2 * k) + ' = ' + B(num(2 * k))],
          steps: [st('What is the power, ' + poly([1, 0, -k * k]) + ', at x = ' + num(k) + '?', Q(0, 1), F), st('What is ' + fp(k) + '?', ans, F)],
          traps: TR([tr(Q(1, 1), 'k_chain', 'Multiply by the slope of the inside, 2x.'), tr(Q(0, 1), 'w_negexp', pw('e', 0) + ' is 1, not 0.')]) }; }
      if (kind === 1) { const k = R.i(1, 4), q = R.i(1, 9), ans = Q(2 * k, k * k + q);
        return { text: B('f(x) = ln(' + poly([1, 0, q]) + ')') + '. What is ' + B(fp(k)) + '?', ans, type: 'frac',
          how: [why(fp('x') + ' = ' + fs(1, poly([1, 0, q])) + ' × 2x = ' + fs('2x', poly([1, 0, q])), 'ln u has slope ' + fs(1, 'u') + '; times the inside’s slope 2x'), fp(k) + ' = ' + fs(2 * k, k * k + ' + ' + q), '= ' + B(fq(ans))],
          steps: [st('What is ' + poly([1, 0, q]) + ' at x = ' + k + '?', Q(k * k + q, 1), F), st('What is ' + fp(k) + '?', ans, F)],
          traps: TR([tr(Q(1, k * k + q), 'k_chain', 'Multiply by the slope of the inside, 2x.'), tr(Q(2 * k, 1), 'k_chain', 'ln u has slope 1/u, so divide by the inside.')]) }; }
      const k = R.i(1, 2), q = R.i(k * k * k - 2, k * k * k + 2), n = R.i(2, 5), u = k * k * k - q, ans = n * P(u, n - 1) * 3 * k * k;
      if (u === 0) return null;
      return { text: B('f(x) = ' + supP(poly([1, 0, 0, -q]), n)) + '. What is ' + B(fp(k)) + '?', ans: Q(ans, 1), type: 'frac',
        how: [why(fp('x') + ' = ' + n + pw1(poly([1, 0, 0, -q]), n - 1) + ' × 3' + sq('x'), 'outside, then times the inside’s slope'), fp(k) + ' = ' + n + ' × ' + pw1(num(u), n - 1) + ' × ' + 3 * k * k, '= ' + B(num(ans))],
        steps: [st('What is the inside at x = ' + k + '?', Q(u, 1), F), st('What is the slope of the inside, 3' + sq('x') + ', at x = ' + k + '?', Q(3 * k * k, 1), F), st('What is ' + fp(k) + '?', Q(ans, 1), F)],
        traps: TR([tr(Q(n * P(u, n - 1), 1), 'k_chain', 'Multiply by the slope of the inside, 3' + sq('x') + '.'), tr(Q(3 * k * k, 1), 'k_chain', 'Do the outside too.')]) };
    } },

  { id: 'k_product', s: 'calc', g: 12, title: 'Product and quotient rules', pre: [], paper: true,
    tip: 'Product: (uv)′ = u′v + uv′. Quotient: (u/v)′ = (u′v − uv′) ÷ v². The derivative of a product is not the product of the derivatives.',
    gen(d, R) {
      const F = { type: 'frac' };
      const prodLines = (uS, vS, duS, dvS, k, U, V, dU, dV, ans) => [why('u = ' + uS + ', v = ' + vS, 'split into the two factors'), "u′ = " + duS + ", v′ = " + dvS, why(fp(k) + " = u′v + uv′ = " + num(dU) + ' × ' + ng(V) + ' + ' + ng(U) + ' × ' + ng(dV), 'at x = ' + num(k)), '= ' + B(fq(ans))];
      const quotLines = (uS, vS, duS, dvS, k, U, V, dU, dV, ans) => [why('u = ' + uS + ', v = ' + vS, 'top and bottom'), "u′ = " + duS + ", v′ = " + dvS, why(fp(k) + ' = ' + fs("u′v " + MINUS + " uv′", sq('v')) + ' = ' + fs(num(dU) + ' × ' + ng(V) + M + ng(U) + ' × ' + ng(dV), sq(ng(V))), 'at x = ' + num(k)), '= ' + B(fq(ans))];
      const trapsP = (U, V, dU, dV, ans) => TR([tr(Q(dU * dV, 1), 'k_product', 'The derivative of a product is not u′ × v′. Use u′v + uv′.'), tr(Q(dU * V, 1), 'k_product', 'There are two parts: u′v and uv′.')]);
      const trapsQ = (U, V, dU, dV) => TR([tr(Q(U * dV - dU * V, V * V), 'k_product', 'The order matters: u′v ' + MINUS + ' uv′ on top.'), tr(Q(dU * V - U * dV, V), 'k_product', 'Divide by v squared.'), dV ? tr(Q(dU, dV), 'k_product', 'The derivative of a fraction is not u′ ÷ v′.') : null]);
      if (d === 0) {
        const n = R.i(2, 3), c = nonzero(R, -5, 5), k = nonzero(R, -3, 3), U = P(k, n), V = k + c, dU = n * P(k, n - 1), dV = 1, ans = Q(dU * V + U * dV, 1);
        return { text: B('f(x) = ' + xp(n) + '(' + poly([1, c]) + ')') + '. Use the product rule: what is ' + B(fp(k)) + '?', ans, type: 'frac',
          how: prodLines(xp(n), poly([1, c]), n + xp(n - 1), '1', k, U, V, dU, dV, ans),
          steps: [st("What is u′(" + num(k) + ") = " + n + xp(n - 1) + ' at x = ' + num(k) + '?', Q(dU, 1), F), st('What is v(' + num(k) + ')?', Q(V, 1), F), st('What is ' + fp(k) + '?', ans, F)],
          traps: trapsP(U, V, dU, dV, ans) };
      }
      if (d === 1) {
        const a = nonzero(R, -4, 4), b = R.i(-6, 6), c = nonzero(R, -5, 5), k = R.i(-2, 3), V = k + c; if (!V || a * c === b) return null;
        const U = a * k + b, ans = Q(a * V - U, V * V);
        return { text: B('f(x) = ' + fs(poly([a, b]), poly([1, c]))) + '. What is ' + B(fp(k)) + '?', ans, type: 'frac',
          how: quotLines(poly([a, b]), poly([1, c]), num(a), '1', k, U, V, a, 1, ans),
          steps: [st('What is u(' + num(k) + ')?', Q(U, 1), F), st('What is v(' + num(k) + ')?', Q(V, 1), F), st('What is ' + fp(k) + '?', ans, F)],
          traps: trapsQ(U, V, a, 1) };
      }
      const U = R.i(-5, 6), V = nonzero(R, -4, 5), dU = R.i(-4, 5), dV = R.i(-4, 5), quot = R.chance(.5), ans = quot ? Q(dU * V - U * dV, V * V) : Q(dU * V + U * dV, 1);
      const vis = table([['', 'u(2)', 'u′(2)', 'v(2)', 'v′(2)'], ['value', U, dU, V, dV]]);
      return { text: 'Use the table. What is ' + B(quot ? '(u/v)′(2)' : '(uv)′(2)') + '?', ans, type: 'frac', vis,
        how: quot ? [why('(u/v)′ = ' + fs("u′v " + MINUS + " uv′", sq('v')), 'quotient rule'), '= ' + fs(num(dU) + ' × ' + ng(V) + M + ng(U) + ' × ' + ng(dV), sq(ng(V))), '= ' + fs(num(dU * V - U * dV), num(V * V)) + (V * V === 1 ? '' : ''), '= ' + B(fq(ans))].filter((l, i) => !(i === 2 && V * V === 1))
          : [why("(uv)′ = u′v + uv′", 'product rule'), '= ' + num(dU) + ' × ' + ng(V) + ' + ' + ng(U) + ' × ' + ng(dV), '= ' + num(dU * V) + ' + ' + ng(U * dV), '= ' + B(fq(ans))],
        steps: quot ? [st("What is u′v " + MINUS + " uv′ at 2?", Q(dU * V - U * dV, 1), F), st('Divide by v(2) squared.', ans, F)] : [st("What is u′v at 2?", Q(dU * V, 1), F), st('What is uv′ at 2?', Q(U * dV, 1), F), st('Add them.', ans, F)],
        traps: quot ? trapsQ(U, V, dU, dV) : trapsP(U, V, dU, dV, ans) };
    } },

  { id: 'k_crit', s: 'calc', g: 12, title: 'Critical points: slope 0', pre: ['x_vertex'], paper: true,
    tip: 'At a highest or lowest point the slope is 0. Find f′(x), set it to 0, solve. f(x) = x² − 6x + 1: f′(x) = 2x − 6 = 0, so x = 3.',
    gen(d, R) {
      const F = { type: 'frac' };
      if (d < 2) {
        const a = d === 0 ? 1 : nonzero(R, -4, 4), b = d === 0 ? 2 * nonzero(R, -6, 6) : nonzero(R, -12, 12), c = R.i(-9, 9), cs = [a, b, c], x0 = Q(-b, 2 * a);
        const askVal = d === 1 && R.chance(.5) && x0.d === 1;
        const lines = [why(fp('x') + ' = ' + poly([2 * a, b]), 'power rule'), why(poly([2 * a, b]) + ' = 0', 'the slope is 0 at a critical point'), 'x = ' + fs(num(a > 0 ? -b : b), num(Math.abs(2 * a))) + ' = ' + (askVal ? fq(x0) : B(fq(x0)))];
        if (askVal) { const v = pv2(cs, x0.n);
          return { text: B('f(x) = ' + poly(cs)) + '. What is the value of f at its critical point (its ' + (a > 0 ? 'lowest' : 'highest') + ' value)?', ans: Q(v, 1), type: 'frac',
            how: lines.concat([fx(x0.n) + ' = ' + subIn(cs, x0.n) + ' = ' + B(num(v))]),
            steps: [st('Where is the slope 0? x = ?', x0, F), st('What is f there?', Q(v, 1), F)],
            traps: TR([tr(x0, 'k_crit', 'That is where it happens. Now find f there.'), tr(Q(pv2(cs, -x0.n), 1), 'n_intmul', 'Check x: ' + fp('x') + ' = 0 at x = ' + num(x0.n) + '.')]) }; }
        return { text: B('f(x) = ' + poly(cs)) + '. At what x is the slope 0?', ans: x0, type: 'frac', how: lines,
          steps: [st(fp('x') + ' = ' + num(2 * a) + 'x + ?. What number?', Q(b, 1), F), st('Solve ' + poly([2 * a, b]) + ' = 0.', x0, F)],
          traps: TR([tr(Q(b, 2 * a), 'n_intmul', 'Check the sign: ' + poly([2 * a, b]) + ' = 0 means ' + poly([2 * a, 0]) + ' = ' + num(-b) + '.'), tr(Q(-b, a), 'k_crit', 'The slope of ' + (a === 1 ? '' : a === -1 ? MINUS : num(a)) + sq('x') + ' is ' + num(2 * a) + 'x: don’t forget the 2.')]) };
      }
      if (R.chance(.5)) {
        const p = R.i(1, 4), c = R.i(-9, 9), cs = [1, 0, -3 * p * p, c], askV = R.chance(.5), vmax = 2 * p * p * p + c;
        const lines = [why(fp('x') + ' = ' + poly([3, 0, -3 * p * p]), 'power rule'), why('3' + sq('x') + ' = ' + 3 * p * p + ',  ' + sq('x') + ' = ' + p * p, 'set the slope to 0'), 'x = ' + p + ' or x = ' + MINUS + p];
        if (!askV) return { text: B('f(x) = ' + poly(cs)) + ' has two critical points. What is the larger x?', ans: Q(p, 1), type: 'frac', how: lines.slice(0, 2).concat(['x = ' + B(p) + ' or x = ' + MINUS + p]),
          steps: [st('Set ' + poly([3, 0, -3 * p * p]) + ' = 0. What is ' + sq('x') + '?', Q(p * p, 1), F), st('What is the larger x?', Q(p, 1), F)],
          traps: TR([tr(Q(p * p, 1), 'w_roots', 'That is ' + sq('x') + '. Take the square root.'), tr(Q(-p, 1), 'k_crit', 'Both ' + p + ' and ' + MINUS + p + ' work; the larger is ' + p + '.'), tr(Q(3 * p * p, 1), 'k_crit', 'Divide by 3 first: ' + sq('x') + ' = ' + p * p + '.')]) };
        return { text: B('f(x) = ' + poly(cs)) + '. What is its local maximum value (at x = ' + MINUS + p + ')?', ans: Q(vmax, 1), type: 'frac',
          how: lines.concat([why(fx(-p) + ' = ' + subIn(cs, -p) + ' = ' + B(num(vmax)), 'the hill is at x = ' + MINUS + p)]),
          steps: [st('What is ' + fx(-p) + '?', Q(vmax, 1), F)],
          traps: TR([tr(Q(c - 2 * p * p * p, 1), 'k_crit', 'That is the valley, ' + fx(p) + '. The maximum is at x = ' + MINUS + p + '.'), tr(Q(-p, 1), 'k_crit', 'That is where the maximum is. Find f there.')]) };
      }
      const r = R.i(-3, 4), s = r + 2 * R.i(1, 3), cs = [1, -3 * (r + s) / 2, 3 * r * s, R.i(-5, 5)], big = R.chance(.5), ans = Q(big ? s : r, 1);
      return { text: B('f(x) = ' + poly(cs)) + '. What is the ' + (big ? 'larger' : 'smaller') + ' critical point (x-value)?', ans, type: 'frac',
        how: [why(fp('x') + ' = ' + poly([3, -3 * (r + s), 3 * r * s]), 'power rule'), why('= 3(' + poly([1, -(r + s), r * s]) + ') = 3(' + poly([1, -r]) + ')(' + poly([1, -s]) + ')', 'take out 3, then factor'), 'x = ' + num(r) + ' or x = ' + num(s) + ', so the ' + (big ? 'larger' : 'smaller') + ' is ' + B(num(big ? s : r))],
        steps: [st('Divide ' + fp('x') + ' by 3: ' + sq('x') + ' + ?x ' + sgn(r * s).trim() + '. What number?', Q(-(r + s), 1), F), st('Factor and solve. What is the ' + (big ? 'larger' : 'smaller') + ' x?', ans, F)],
        traps: TR([tr(Q(big ? -r : -s, 1), 'x_factor', 'Check the signs: (x ' + MINUS + ' a) = 0 gives x = a.'), tr(Q(big ? r : s, 1), 'k_crit', 'Both work; pick the ' + (big ? 'larger' : 'smaller') + ' one.')]) };
    } },

  { id: 'k_anti', s: 'calc', g: 12, title: 'Antiderivatives', pre: [], paper: true,
    tip: 'Power rule backwards: add 1 to the power, then divide by the new power. ∫ 6x² dx = 6x³/3 = 2x³ + C. Check by taking the derivative.',
    gen(d, R) {
      const F = { type: 'frac' };
      if (d === 0 || (d === 2 && R.chance(.35))) {
        const n = R.i(1, 4), a = d === 0 ? (n + 1) * nonzero(R, -5, 6) : nonzero(R, 1, 9), ans = Q(a, n + 1);
        if (d === 2 && ans.d === 1) return null;
        return { text: B('∫ ' + num(a) + xp(n) + ' dx = k' + xp(n + 1) + ' + C') + '. What is k?', ans, type: 'frac',
          how: [why('∫ ' + num(a) + xp(n) + ' dx = ' + fs(num(a) + xp(n + 1), n + 1) + ' + C', 'add 1 to the power, divide by the new power'), '= ' + fq(ans) + xp(n + 1) + ' + C', why('k = ' + B(fq(ans)), 'check: the derivative of ' + fq(ans) + xp(n + 1) + ' is ' + num(a) + xp(n))],
          steps: [st('What is the new power?', Q(n + 1, 1), F), st('Divide ' + num(a) + ' by it. What is k?', ans, F)],
          traps: TR([tr(Q(a * (n + 1), 1), 'k_anti', 'Divide by the new power, don’t multiply.'), tr(Q(a * n, 1), 'k_power', 'That is the derivative. Go backwards: add 1 to the power and divide.'), tr(Q(a, n), 'k_anti', 'Divide by the new power, ' + (n + 1) + '.')]) };
      }
      if (d === 1) {
        const a = 3 * nonzero(R, -3, 3), b = 2 * R.i(-4, 4), c = R.i(-6, 6), e = R.i(-9, 9), k = R.i(1, 3), Fc = [a / 3, b / 2, c, e], Fk = pv2(Fc, k);
        return { text: B("F′(x) = " + poly([a, b, c])) + ' and ' + B('F(0) = ' + num(e)) + '. What is ' + B('F(' + k + ')') + '?', ans: Q(Fk, 1), type: 'frac',
          how: [why('F(x) = ' + poly([a / 3, b / 2, c, 0]) + ' + C', 'power rule backwards on each term'), why('C = ' + num(e), 'F(0) = C'), 'F(' + k + ') = ' + subIn([a / 3, b / 2, c, 0], k) + sgn(e), '= ' + B(num(Fk))],
          steps: [st('F(x) = ?' + pw('x', 3) + ' + … What number goes in front of ' + pw('x', 3) + '?', Q(a / 3, 1), F), st('What is C?', Q(e, 1), F), st('What is F(' + k + ')?', Q(Fk, 1), F)],
          traps: TR([tr(Q(Fk - e, 1), 'k_anti', 'Don’t forget the + C: F(0) = ' + num(e) + ' tells you C.'), tr(Q(pv2([a, b, c], k), 1), 'k_anti', 'That is F′(' + k + '). Find F first.'), tr(Q(pv2([a, b / 2, c, e], k), 1), 'k_anti', 'Divide each term by its new power: ' + num(a) + sq('x') + ' becomes ' + (a / 3 === 1 ? '' : a / 3 === -1 ? MINUS : num(a / 3)) + pw('x', 3) + '.')]) };
      }
      if (R.chance(.5)) { const a = R.pick([1, 3, 6, 9, 2, 5]), ans = Q(2 * a, 3);
        return { text: B('∫ ' + (a === 1 ? '' : a) + rt('x') + ' dx = k' + pw('x', '3/2') + ' + C') + '. What is k?', ans, type: 'frac',
          how: [why((a === 1 ? '' : a) + rt('x') + ' = ' + (a === 1 ? '' : a) + pw('x', '1/2'), 'write the root as a power'), why('∫ = ' + (a === 1 ? '' : a + ' × ') + fs(pw('x', '3/2'), fs(3, 2)) + ' + C', 'add 1: ½ + 1 = 3/2, divide by 3/2'), why('= ' + fq(ans) + pw('x', '3/2') + ' + C, so k = ' + B(fq(ans)), 'dividing by 3/2 is times 2/3')],
          steps: [st('What is the new power?', Q(3, 2), F), st('Divide ' + a + ' by it. What is k?', ans, F)],
          traps: TR([tr(Q(3 * a, 2), 'f_divfrac', 'Dividing by 3/2 means times 2/3.'), tr(Q(a, 2), 'k_power', 'That is the derivative direction. Add 1 to the power, then divide.')]) }; }
      const a = R.i(1, 6), c = R.i(-5, 5), k = R.i(2, 4), C0 = c + a, ans = Q(-a + C0 * k, k);
      return { text: B("F′(x) = " + fs(a, sq('x'))) + ' and ' + B('F(1) = ' + num(c)) + '. What is ' + B('F(' + k + ')') + '?', ans, type: 'frac',
        how: [why('F(x) = ' + (a === 1 ? MINUS : MINUS + a) + pw('x', MINUS + '1') + ' + C = ' + MINUS + fs(a, 'x') + ' + C', fs(a, sq('x')) + ' = ' + a + pw('x', MINUS + '2') + '; add 1 to the power, divide by ' + MINUS + '1'), why(num(c) + ' = ' + MINUS + a + ' + C, so C = ' + num(C0), 'use F(1)'), 'F(' + k + ') = ' + MINUS + fs(a, k) + sgn(C0) + ' = ' + B(fq(ans))],
        steps: [st('What is C?', Q(C0, 1), F), st('What is F(' + k + ')?', ans, F)],
        traps: TR([tr(Q(-a + c * k, k), 'k_anti', 'Find C from F(1) = ' + num(c) + ': ' + MINUS + a + ' + C = ' + num(c) + '.'), tr(Q(a + C0 * k, k), 'w_negexp', 'Dividing by the new power ' + MINUS + '1 makes it negative.')]) };
    } },

  { id: 'k_integral', s: 'calc', g: 12, title: 'Definite integrals', pre: [], paper: true,
    tip: 'The area under f from a to b is F(b) − F(a), where F is an antiderivative. ∫₁³ 2x dx = 3² − 1² = 8.',
    gen(d, R) {
      const F = { type: 'frac' };
      const body = (Fs, Fa, Fb, a, b, ans, pre) => (pre || []).concat([why('F(x) = ' + Fs, 'antiderivative'), why('F(' + num(b) + ')' + M + 'F(' + num(a) + ') = ' + fq(Fb) + M + (Fa.n < 0 ? '(' + fq(Fa) + ')' : fq(Fa)), 'top limit minus bottom limit'), '= ' + B(fq(ans))]);
      const tps = (Fa, Fb, fa, fb) => TR([tr(Fb, 'k_integral', 'Take away F at the bottom limit too.'), tr(Q(Fa.n * Fb.d - Fb.n * Fa.d, Fa.d * Fb.d), 'k_integral', 'Top limit minus bottom limit: F(b) ' + MINUS + ' F(a).'), fa != null ? tr(Q(fb - fa, 1), 'k_anti', 'Use the antiderivative F, not f itself.') : null]);
      if (d === 0) {
        const kind = R.i(0, 2);
        if (kind === 0) { const c = R.i(2, 9), a = R.i(0, 3), b = a + R.i(1, 5), ans = Q(c * (b - a), 1);
          return { text: 'What is ' + B(INT(a, b) + c + ' dx') + '?', ans, type: 'frac', how: body(c + 'x', Q(c * a, 1), Q(c * b, 1), a, b, ans).concat([]), steps: [st('What is F(' + b + ')?', Q(c * b, 1), F), st('What is F(' + a + ')?', Q(c * a, 1), F), st('Take away.', ans, F)], traps: tps(Q(c * a, 1), Q(c * b, 1), c, c) }; }
        if (kind === 1) { const a = R.i(0, 4), b = a + R.i(1, 5), ans = Q(b * b - a * a, 1);
          return { text: 'What is ' + B(INT(a, b) + '2x dx') + '?', ans, type: 'frac', how: body(sq('x'), Q(a * a, 1), Q(b * b, 1), a, b, ans), steps: [st('What is F(' + b + ') = ' + sq(b) + '?', Q(b * b, 1), F), st('What is F(' + a + ') = ' + sq(a) + '?', Q(a * a, 1), F), st('Take away.', ans, F)], traps: tps(Q(a * a, 1), Q(b * b, 1), 2 * a, 2 * b) }; }
        const m = R.i(1, 6), b = 2 * R.i(1, 4), ans = Q(m * b * b, 2);
        return { text: 'What is ' + B(INT(0, b) + (m === 1 ? '' : m) + 'x dx') + '?', ans, type: 'frac', how: body(fs(m === 1 ? sq('x') : m + sq('x'), 2), Q(0, 1), ans, 0, b, ans).concat([]), steps: [st('What is F(' + b + ')?', ans, F), st('F(0) = 0. So what is the area?', ans, F)], traps: TR([tr(Q(m * b * b, 1), 'k_anti', 'Divide by the new power, 2.'), tr(Q(m * b, 1), 'k_anti', 'Use the antiderivative ' + fs(m === 1 ? sq('x') : m + sq('x'), 2) + '.')]) };
      }
      if (d === 1) {
        const p = R.pick([3, 6, -3]), q = 2 * R.i(-3, 3), r = R.i(-5, 5), a = R.i(0, 2), b = a + R.i(1, 2), Fc = [p / 3, q / 2, r, 0], Fa = Q(pv2(Fc, a), 1), Fb = Q(pv2(Fc, b), 1), ans = Q(Fb.n - Fa.n, 1);
        return { text: 'What is ' + B(INT(a, b) + '(' + poly([p, q, r]) + ') dx') + '?', ans, type: 'frac', how: body(poly(Fc), Fa, Fb, a, b, ans),
          steps: [st('What is F(' + b + ')?', Fb, F), st('What is F(' + a + ')?', Fa, F), st('F(' + b + ')' + M + 'F(' + a + ') = ?', ans, F)], traps: tps(Fa, Fb, pv2([p, q, r], a), pv2([p, q, r], b)) };
      }
      const kind = R.i(0, 3);
      if (kind === 0) { const n = R.i(1, 6), ans = Q(1, n + 1);
        return { text: 'What is ' + B(INT(0, 1) + xp(n) + ' dx') + '?', ans, type: 'frac', how: body(fs(xp(n + 1), n + 1), Q(0, 1), ans, 0, 1, ans), steps: [st('What is F(1)?', ans, F)], traps: TR([tr(Q(1, n), 'k_anti', 'Divide by the new power, ' + (n + 1) + '.'), tr(Q(n, 1), 'k_power', 'That is the derivative at 1. Use the antiderivative.')]) }; }
      if (kind === 1) { const a = R.i(0, 2), b = a + R.i(1, 3), Fa = Q(a * a * a, 3), Fb = Q(b * b * b, 3), ans = Q(b * b * b - a * a * a, 3);
        return { text: 'What is ' + B(INT(a, b) + sq('x') + ' dx') + '?', ans, type: 'frac', how: body(fs(pw('x', 3), 3), Fa, Fb, a, b, ans), steps: [st('What is F(' + b + ')?', Fb, F), st('What is F(' + a + ')?', Fa, F), st('Take away.', ans, F)], traps: tps(Fa, Fb, a * a, b * b) }; }
      if (kind === 2) { const k = R.i(2, 4), Fb = Q(2 * k * k * k, 3), Fa = Q(2, 3), ans = Q(2 * (k * k * k - 1), 3);
        return { text: 'What is ' + B(INT(1, k * k) + rt('x') + ' dx') + '?', ans, type: 'frac', how: body(fs(2, 3) + pw('x', '3/2'), Fa, Fb, 1, k * k, ans, [why(rt('x') + ' = ' + pw('x', '1/2'), 'write the root as a power')]),
          steps: [st('F(x) = ' + fs(2, 3) + pw('x', '3/2') + '. What is F(' + k * k + ')? (' + pw(k * k, '3/2') + ' = ' + k * k * k + ')', Fb, F), st('What is F(1)?', Fa, F), st('Take away.', ans, F)], traps: tps(Fa, Fb, 1, k) }; }
      const a = R.i(1, 4), c = nonzero(R, -5, 5), ans = Q(2 * a * c, 1), Fs = fs(pw('x', 4), 4) + sgn(c) + 'x', Fb = Q(a * a * a * a + 4 * c * a, 4), Fa = Q(a * a * a * a - 4 * c * a, 4);
      return { text: 'What is ' + B(INT(-a, a) + '(' + poly([1, 0, 0, c]) + ') dx') + '?', ans, type: 'frac', how: body(Fs, Fa, Fb, -a, a, ans).concat([]),
        steps: [st('What is F(' + a + ')?', Fb, F), st('What is F(' + num(-a) + ')?', Fa, F), st('Take away.', ans, F)],
        traps: TR([tr(Q(0, 1), 'k_integral', 'The ' + pw('x', 3) + ' part cancels from ' + MINUS + a + ' to ' + a + ', but the constant ' + num(c) + ' does not.'), tr(Q(a * c, 1), 'k_integral', 'The width from ' + MINUS + a + ' to ' + a + ' is ' + 2 * a + '.')].concat(tps(Fa, Fb, null, null))) };
    } },
]);

})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
