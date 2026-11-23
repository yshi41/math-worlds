/* f.js: extra mental-math shortcuts and number patterns that go beyond the Common Core. Every concept here is
   extra: true. Each one is a single narrow trick (Vedic and Trachtenberg-style multiplying, digit-sum checks,
   divisibility by 7 and 8, roots from the last digit, percent chains, quick estimates), placed at the grade where a kid
   has what it needs. The how lines work the trick for the exact numbers, short enough to jot beside the screen; the
   steps break it down with the same numbers; each trap points a likely slip at the concept it really comes from. */
(function (C) {
'use strict';
const { B, num, MINUS, pw, rt, fmtD, fmtM, ord, frac, gcd, NAMES } = C;
const M = ' ' + MINUS + ' ';
const tr = (v, c, why) => ({ v, c, why });
const st = (text, ans, o) => Object.assign({ text, ans }, o || {});
/* traps: drop empty or broken values and repeats */
function TR(list) {
  const seen = new Set();
  return list.filter(t => {
    if (!t || t.v == null) return false; const v = t.v;
    if (typeof v === 'number' && !isFinite(v)) return false;
    const k = typeof v === 'object' ? JSON.stringify(v) : (+v).toFixed(9);
    if (seen.has(k)) return false; seen.add(k); return true;
  });
}
const sq = v => pw(v, 2);
const digs = v => String(v).split('').map(Number);
const dsum = v => digs(v).reduce((a, b) => a + b, 0);
const droot = v => { while (v >= 10) v = dsum(v); return v; };
const glue = (...p) => Number(p.join(''));
const pad = (v, k) => String(v).padStart(k, '0');
/* every concept in this file is an extra */
const ex = list => list.map(c => Object.assign({ extra: true }, c));
/* digit-by-digit "smaller from bigger" (the classic borrowing slip) */
function digitGap(a, b) { const A = String(a), Bs = String(b).padStart(A.length, '0'); return Number(A.split('').map((x, i) => Math.abs(+x - +Bs[i])).join('')); }

/* ======================= Times & Dividing ======================= */
C.defs(ex([
  { id: 'm_gaps10', s: 'mul', g: 4, title: 'Facts 6 to 9: use the gaps to 10', pre: ['a_bonds10'],
    tip: '7 × 8: 7 is 3 below 10 and 8 is 2 below. Take one gap off the other number: 7 − 2 = 5 tens. Multiply the gaps: 3 × 2 = 6. So 56.',
    gen(d, R) {
      let T = 10, a, b;
      if (d === 0) { a = R.i(6, 9); b = R.i(6, 9); if ((10 - a) * (10 - b) >= 10) return null; }
      else if (d === 1) { a = R.i(6, 9); b = R.i(6, 9); if (a === b && R.chance(.5)) return null; }
      else if (R.chance(.65)) { T = 20; a = R.i(16, 19); b = R.i(16, 19); }
      else { a = R.i(6, 7); b = R.i(6, 7); }
      const ga = T - a, gb = T - b, left = a - gb, big = left * T, p = ga * gb, ans = a * b, unit = T === 10 ? 'tens' : 'twenties';
      return { text: 'What is ' + B(a + ' × ' + b) + '?', ans,
        how: [a + ' is ' + ga + ' below ' + T + ', and ' + b + ' is ' + gb + ' below ' + T + '.',
          'Take ' + b + '’s gap off ' + a + ': ' + a + M + gb + ' = ' + left + '. That is ' + left + ' ' + unit + ' = ' + big + '.',
          'Multiply the gaps: ' + ga + ' × ' + gb + ' = ' + p + '. ' + big + ' + ' + p + ' = ' + B(ans) + '.'],
        steps: [st('What is ' + B(a + M + gb) + '?', left), st(B(left + ' × ' + T) + ' = ?', big), st('Multiply the gaps: ' + B(ga + ' × ' + gb) + ' = ?', p), st(B(big + ' + ' + p) + ' = ?', ans)],
        traps: TR([tr(big, 'm_gaps10', 'Good start. Now add the gaps multiplied: ' + ga + ' × ' + gb + '.'),
          ga !== gb ? tr((a - ga) * T + p, 'm_gaps10', 'Take the other number’s gap off: ' + a + ' minus ' + b + '’s gap.') : null,
          p >= 10 ? tr(glue(left, p), 'n_place', 'The gaps make ' + p + ', more than 9, so add it to ' + big + ' instead of writing it on the end.') : null,
          T === 20 ? tr(left * 10 + p, 'm_gaps10', 'Around 20 the front number counts twenties, not tens.') : null]) };
    } },

  { id: 'm_halve8', s: 'mul', g: 4, title: 'Divide by 4 or 8: keep halving', pre: ['f_half'],
    tip: '÷4 is half, then half again. ÷8 is half three times, because 8 = 2 × 2 × 2. 368 ÷ 8: 184, 92, 46.',
    gen(d, R) {
      let k, q;
      if (d === 0) { k = 4; q = R.i(11, 60); }
      else if (d === 1) { k = 8; q = R.i(11, 60); }
      else if (R.chance(.6)) { k = 8; q = R.i(26, 125); }
      else { k = 16; q = R.i(11, 40); }
      const N = k * q; if (N % 10 === 0 && R.chance(.6)) return null;
      const halves = []; let v = N; while (v > q) { v /= 2; halves.push(v); }
      const t = halves.length, word = ['', 'once', 'twice', 'three times', 'four times'][t], from = i => (i ? halves[i - 1] : N);
      return { text: 'What is ' + B(num(N) + ' ÷ ' + k) + '?', ans: q,
        how: [k + ' = ' + Array(t).fill(2).join(' × ') + ', so ÷ ' + k + ' is halving ' + word + '.',
          halves.map((h, i) => 'half of ' + num(from(i)) + ' is ' + num(h)).join(', ').replace(/^h/, 'H') + '.',
          'So ' + num(N) + ' ÷ ' + k + ' = ' + B(num(q)) + '.'],
        steps: halves.map((h, i) => st('What is half of ' + B(num(from(i))) + '?', h)),
        traps: TR([tr(halves[t - 2], 'm_halve8', '÷ ' + k + ' is halving ' + word + '. You stopped one half early.'),
          tr(q / 2, 'm_halve8', 'You halved one time too many: ÷ ' + k + ' is halving ' + word + '.'),
          tr(q + 10, 'f_half', 'Check each half: split into tens and ones, then halve each part.')]) };
    } },

  { id: 'm_x101', s: 'mul', g: 5, title: 'Times 101: write it twice', pre: ['n_place'],
    tip: '101 is 100 + 1. So 47 × 101 = 4,700 + 47 = 4,747: the 47 shows up twice. And 365 × 1,001 = 365,000 + 365 = 365,365.',
    gen(d, R) {
      let a, big;
      if (d === 0) { a = R.i(11, 99); big = 101; }
      else if (d === 1) { if (R.chance(.5)) { a = R.i(11, 99); big = 101; } else { a = R.i(101, 999); big = 1001; } }
      else { const t = R.i(0, 2); if (t === 0) { a = R.i(101, 989); big = 101; } else if (t === 1) { a = R.i(11, 99); big = 10101; } else { a = R.i(101, 999); big = 1001; } }
      if (a % 10 === 0 && R.chance(.7)) return null;
      const parts = big === 101 ? [100, 1] : big === 1001 ? [1000, 1] : [10000, 100, 1], ans = a * big, overlap = big === 101 && a >= 100;
      const sumS = parts.map(p => num(a * p)).join(' + ');
      return { text: 'What is ' + B(num(a) + ' × ' + num(big)) + '?', ans,
        how: [num(big) + ' = ' + parts.map(num).join(' + ') + ', so take ' + num(a) + ' × ' + num(parts[0]) + (parts.length === 3 ? ', ' + num(a) + ' × 100' : '') + ' and one more ' + num(a) + '.',
          overlap ? 'A 3-digit number is too long to sit side by side here, so add: ' + sumS + ' = ' + B(num(ans)) + '.'
            : sumS + ' = ' + B(num(ans)) + ': the digits of ' + num(a) + ' just show up ' + (parts.length === 3 ? 'three times' : 'twice') + ' in a row.'],
        steps: [st(B(num(a) + ' × ' + num(parts[0])) + ' = ?', a * parts[0]), st(B(sumS) + ' = ?', ans)],
        traps: TR([tr(a * parts[0], 'm_x101', 'That is ' + num(a) + ' × ' + num(parts[0]) + '. Add ' + (parts.length === 3 ? 'the other copies' : 'one more ' + num(a)) + ' too.'),
          big === 101 ? tr(a * 11, 'm_x11', '101 is 100 + 1, not 10 + 1.') : null,
          overlap ? tr(glue(a, a), 'm_x101', 'With 3 digits the copies overlap: ' + num(a * 100) + ' + ' + num(a) + '. Add them.') : tr(a * (big - 1) * 10 + a, 'n_place', 'Check the zeros: × ' + num(parts[0]) + ' puts ' + (String(parts[0]).length - 1) + ' zeros on the end.')]) };
    } },

  { id: 'm_x37', s: 'mul', g: 5, title: '37 × 3 = 111', pre: ['fa_multiples'],
    tip: '37 × 3 = 111. So 37 × 6 = 222, 37 × 12 = 444 and 37 × 27 = 999: count the 3s in the other number, then take that many 111s.',
    gen(d, R) {
      let k, f = 37, rev = false;
      if (d === 0) k = R.i(2, 9);
      else if (d === 1) { if (R.chance(.5)) { k = R.i(2, 9); rev = true; } else k = R.i(10, 19); }
      else if (R.chance(.35)) { f = 74; k = R.i(1, 9); } else k = R.i(20, 33);
      const m = 3 * k, P = 111 * k;
      if (rev) {
        return { text: 'What is ' + B(num(P) + ' ÷ 37') + '?', ans: m,
          how: ['37 × 3 = 111, so every 111 holds three 37s.', num(P) + ' = ' + k + ' × 111, so it holds ' + k + ' × 3 = ' + B(m) + ' of them.'],
          steps: [st(B(num(P) + ' ÷ 111') + ' = ?', k), st(B(k + ' × 3') + ' = ?', m)],
          traps: TR([tr(k, 'm_x37', 'That is how many 111s. Each 111 is three 37s.'), tr(m + 3, 'm_divfam', 'Check: 37 × ' + (m + 3) + ' is more than ' + num(P) + '.'), tr(m - 3, 'm_divfam', 'Check: 37 × ' + (m - 3) + ' is less than ' + num(P) + '.')]) };
      }
      const ans = f * m, sw = R.chance(.5), q = sw ? m + ' × ' + f : f + ' × ' + m;
      const kx = k + ' × 111 = ' + (k >= 10 ? num(100 * k) + ' + ' + num(10 * k) + ' + ' + k + ' = ' : '');
      const how = [m + ' = 3 × ' + k + ', and 37 × 3 = 111.'];
      if (f === 37) how.push('So 37 × ' + m + ' is ' + k + ' lots of 111: ' + kx + B(num(ans)) + '.');
      else how.push('37 × ' + m + ' = ' + kx + num(P) + '. 74 is double 37, so double it: ' + B(num(ans)) + '.');
      const steps = [st(B(m + ' ÷ 3') + ' = ?', k), st(B(k + ' × 111') + ' = ?', P)];
      if (f === 74) steps.push(st('Double it: ' + B('2 × ' + num(P)) + ' = ?', ans));
      return { text: 'What is ' + B(q) + '?', ans, how, steps,
        traps: TR([tr(f / 37 * 111 * m, 'm_x37', 'There are only ' + k + ' threes in ' + m + ', so take ' + k + ' lots of 111.'),
          tr(f / 37 * 111 * (k + 1), 'm_divfam', 'Check how many 3s are in ' + m + '.'),
          k >= 10 ? tr(glue(k, k, k) * f / 37, 'm_x37', k + ' × 111 means ' + k + ' hundreds + ' + k + ' tens + ' + k + ' ones. Add them, don’t write ' + k + ' three times.') : tr(f / 37 * 111 * (k - 1) || null, 'm_divfam', 'Check how many 3s are in ' + m + '.'),
          f === 74 ? tr(P, 'm_x37', 'That is 37 × ' + m + '. 74 is double 37.') : null]) };
    } },

  { id: 'm_x50', s: 'mul', g: 5, title: 'Times 50 and 500: half, then zeros', pre: ['f_decx10'],
    tip: '50 is half of 100. 46 × 50: half of 46 is 23, then × 100 is 2,300. Odd? 37 × 50 = 18.5 × 100 = 1,850. For × 500: half, then × 1,000.',
    gen(d, R) {
      let a, big;
      if (d === 0) { a = 2 * R.i(6, 49); big = 100; }
      else if (d === 1) { if (R.chance(.5)) { a = 2 * R.i(6, 49) + 1; big = 100; } else { a = 2 * R.i(6, 49); big = 1000; } }
      else { big = R.pick([100, 1000, 1000, 10000]); a = big === 10000 ? R.i(13, 99) : R.i(101, 499); }
      if (a % 10 === 0) return null;
      const k = big / 2, h = a / 2, ans = a * k, z = String(big).length - 1, odd = a % 2 === 1;
      return { text: 'What is ' + B(num(a) + ' × ' + num(k)) + '?', ans,
        how: [num(k) + ' is half of ' + num(big) + ', so take half of ' + num(a) + ', then times ' + num(big) + '.',
          'Half of ' + num(a) + ' is ' + num(h) + '. ' + num(h) + ' × ' + num(big) + ' = ' + B(num(ans)) + (odd ? ' (the point hops ' + z + ' places right).' : '.')],
        steps: [st('What is half of ' + B(num(a)) + '?', h), st(B(num(h) + ' × ' + num(big)) + ' = ?', ans)],
        traps: TR([tr(a * big, 'm_x50', 'That is ' + num(a) + ' × ' + num(big) + '. ' + num(k) + ' is only half of that, so halve it.'),
          tr(ans * 10, 'n_times10', 'Count the zeros: × ' + num(big) + ' adds ' + z + ' places, no more.'), tr(ans / 10, 'n_times10', 'Count the zeros: × ' + num(big) + ' adds ' + z + ' places.'),
          odd ? tr(Math.floor(h) * big, 'f_decx10', 'Half of an odd number ends in .5. Keep it, and let the point hop.') : null]) };
    } },

  { id: 'm_div9', s: 'mul', g: 5, title: 'Divide by 9 with digit sums', pre: ['fa_div39'],
    tip: '23 ÷ 9: the answer is the tens digit, 2, and the leftover is the digit sum, 2 + 3 = 5. So 2 r 5. If the sum is 9 or more, take 9 off and add 1 to the answer.',
    gen(d, R) {
      const rem = (q, r) => ({ q, r });
      if (d < 2) {
        const a = R.i(1, 9), b = R.i(0, 9), s = a + b, N = 10 * a + b;
        if (d === 0 ? s >= 9 : s < 9 || s === 18) return null;
        const big = s >= 9, q = big ? a + 1 : a, r = big ? s - 9 : s;
        return { type: 'rem', text: 'What is ' + B(N + ' ÷ 9') + '? Use r for the leftover.', ans: rem(q, r),
          how: ['Each ten is one 9 with 1 left over. So the ' + a + ' ' + (a === 1 ? 'ten makes one 9' : 'tens make ' + a + ' nines') + ', with ' + a + ' left over.',
            'Leftover: ' + a + ' + ' + b + ' = ' + s + ' (the digit sum).' + (big ? ' ' + s + ' is 9 or more, so it holds one more 9: ' + s + M + '9 = ' + r + ', and the answer goes up to ' + q + '.' : ''),
            'So ' + N + ' ÷ 9 = ' + B(q + ' r ' + r) + '.'],
          steps: [st('Find the digit sum: ' + B(a + ' + ' + b) + ' = ?', s)].concat(big ? [st(B(s + M + '9') + ' = ?', r)] : []).concat([st('What is ' + B(N + ' ÷ 9') + '? Use r for the leftover.', rem(q, r), { type: 'rem' })]),
          traps: TR([big ? tr(rem(a, s), 'm_div9', s + ' is 9 or more, so another 9 fits: take 9 off the leftover and add 1 to the answer.') : tr(rem(a, b), 'm_div9', 'The leftover is the digit sum, not just the ones digit.'),
            big ? tr(rem(a, r), 'm_div9', 'Taking a 9 off the leftover means one more 9 in the answer.') : tr(rem(s, a), 'm_div9', 'The answer is the tens digit; the digit sum is the leftover.'),
            big ? tr(rem(q, s), 'm_remain', 'A leftover must be smaller than 9.') : null]) };
      }
      const a = R.i(1, 8), b = R.i(0, 9 - a), c = R.i(0, 9), N = 100 * a + 10 * b + c, r0 = a + b + c, q0 = 11 * a + b;
      if (r0 >= 18) return null;
      const big = r0 >= 9, q = big ? q0 + 1 : q0, r = big ? r0 - 9 : r0;
      return { type: 'rem', text: 'What is ' + B(N + ' ÷ 9') + '? Use r for the leftover.', ans: rem(q, r),
        how: ['Running digit sums give the answer: ' + a + ', then ' + a + ' + ' + b + ' = ' + (a + b) + '. That makes ' + q0 + '.',
          'The leftover is the whole digit sum: ' + a + ' + ' + b + ' + ' + c + ' = ' + r0 + '.' + (big ? ' That holds one more 9: ' + r0 + M + '9 = ' + r + ', and the answer goes up to ' + q + '.' : ''),
          'So ' + N + ' ÷ 9 = ' + B(q + ' r ' + r) + '.'],
        steps: [st('What is ' + B(a + ' + ' + b) + '?', a + b), st('Find the digit sum: ' + B(a + ' + ' + b + ' + ' + c) + ' = ?', r0), st('What is ' + B(N + ' ÷ 9') + '? Use r for the leftover.', rem(q, r), { type: 'rem' })],
        traps: TR([big ? tr(rem(q0, r0), 'm_div9', r0 + ' is 9 or more, so one more 9 fits: take 9 off and add 1 to the answer.') : null,
          tr(rem(10 * a + b, r), 'm_div9', 'The second answer digit is the running sum ' + a + ' + ' + b + ', not just ' + b + '.'),
          tr(rem(q, c), 'm_div9', 'The leftover is the whole digit sum, not the last digit.')]) };
    } },

  { id: 'm_x125', s: 'mul', g: 6, title: 'Times 125: ×1,000, then ÷8', pre: ['f_bench'],
    tip: '125 is 1,000 ÷ 8 (eight 125s make 1,000). So 24 × 125 = 24 ÷ 8 × 1,000 = 3,000. If 8 doesn’t go in: 36,000 → 18,000 → 9,000 → 4,500.',
    gen(d, R) {
      let a;
      if (d === 0) a = 8 * R.i(2, 12);
      else if (d === 1) { a = 2 * R.i(6, 49); if (a % 8 === 0) return null; }
      else { a = R.chance(.5) ? 2 * R.i(5, 49) + 1 : 4 * R.i(26, 100); if (a % 8 === 0) return null; }
      const ans = a * 125, T = a * 1000, h1 = T / 2, h2 = T / 4;
      if (d === 0) {
        const k = a / 8;
        return { text: 'What is ' + B(a + ' × 125') + '?', ans,
          how: ['125 is 1,000 ÷ 8, so × 125 is ÷ 8, then × 1,000.', a + ' ÷ 8 = ' + k + ', and ' + k + ' × 1,000 = ' + B(num(ans)) + '.'],
          steps: [st(B(a + ' ÷ 8') + ' = ?', k), st(B(k + ' × 1,000') + ' = ?', ans)],
          traps: TR([tr(k * 100, 'n_times10', '125 is 1,000 ÷ 8, so put three zeros on, not two.'), tr(T, 'm_x125', 'Divide by 8 as well.'), tr((k + 1) * 1000, 'm_divfam', 'Check ' + a + ' ÷ 8.')]) };
      }
      return { text: 'What is ' + B(num(a) + ' × 125') + '?', ans,
        how: ['125 is 1,000 ÷ 8, so × 125 is × 1,000, then ÷ 8.', num(a) + ' × 1,000 = ' + num(T) + '. ÷ 8 is halving three times:',
          num(T) + ' → ' + num(h1) + ' → ' + num(h2) + ' → ' + B(num(ans)) + '.'],
        steps: [st(B(num(a) + ' × 1,000') + ' = ?', T), st('What is half of ' + B(num(T)) + '?', h1), st('What is half of ' + B(num(h1)) + '?', h2), st('What is half of ' + B(num(h2)) + '?', ans)],
        traps: TR([tr(T, 'm_x125', 'Good, that is × 1,000. Now ÷ 8: halve it three times.'), tr(h2, 'm_halve8', '÷ 8 is three halvings. You did two.'), tr(ans / 10, 'n_times10', '125 is 1,000 ÷ 8, not 100 ÷ 8.')]) };
    } },

  { id: 'm_x75', s: 'mul', g: 6, title: 'Times 75: three quarters of ×100', pre: ['f_of'],
    tip: '75 is 3/4 of 100. 36 × 75: 36 × 100 = 3,600, a quarter is 900, three quarters is 2,700.',
    gen(d, R) {
      let a, k = 75;
      if (d === 0) a = 4 * R.i(3, 24);
      else if (d === 1) a = R.i(13, 99);
      else if (R.chance(.5)) a = R.i(101, 480); else { a = R.i(13, 99); k = 750; }
      if (a % 10 === 0) return null;
      const big = k === 75 ? 100 : 1000, H = a * big, q = H / 4, ans = 3 * q;
      return { text: 'What is ' + B(num(a) + ' × ' + k) + '?', ans,
        how: [k + ' is three quarters of ' + num(big) + '. ' + num(a) + ' × ' + num(big) + ' = ' + num(H) + '.',
          'A quarter of ' + num(H) + ' is ' + num(q) + ' (half is ' + num(H / 2) + ', half again is ' + num(q) + ').',
          'Three quarters: 3 × ' + num(q) + ' = ' + B(num(ans)) + '.'],
        steps: [st(B(num(a) + ' × ' + num(big)) + ' = ?', H), st('What is a quarter of ' + B(num(H)) + '?', q), st(B('3 × ' + num(q)) + ' = ?', ans)],
        traps: TR([tr(q, 'm_x75', 'That is one quarter. You need three quarters.'), tr(H, 'm_x75', 'That is × ' + num(big) + '. ' + k + ' is only three quarters of it.'),
          tr(2 * q, 'f_of', 'Three quarters is 3 parts, not 2.'), tr(H - k, 'm_x75', 'Take away a quarter of ' + num(H) + ', not ' + k + '.')]) };
    } },

  { id: 'm_end10', s: 'mul', g: 6, title: 'Same tens, ones make 10: 43 × 47', pre: ['a_bonds10'],
    tip: '43 × 47: same tens (4) and the ones make 10 (3 + 7). Tens × next number up: 4 × 5 = 20. Ones × ones: 3 × 7 = 21. Side by side: 2,021.',
    gen(d, R) {
      let f, o;
      if (d === 0) { f = R.i(1, 5); o = R.i(1, 9); if (o === 5) return null; }
      else if (d === 1) { f = R.i(1, 9); o = R.i(1, 9); if (o === 5 && R.chance(.7)) return null; }
      else if (R.chance(.5)) { f = R.i(10, 15); o = R.i(1, 9); } else { f = R.i(2, 9); o = R.pick([1, 9, 2, 8]); }
      const o2 = 10 - o, a = 10 * f + o, b = 10 * f + o2, left = f * (f + 1), right = o * o2, ans = a * b;
      const r2 = String(right).padStart(2, '0');
      return { text: 'What is ' + B(a + ' × ' + b) + '?', ans,
        how: [a + ' and ' + b + ' both start with ' + f + ', and the ones make 10: ' + o + ' + ' + o2 + ' = 10.',
          f + ' times the next number up: ' + f + ' × ' + (f + 1) + ' = ' + left + '.',
          'Ones × ones: ' + o + ' × ' + o2 + ' = ' + right + (right < 10 ? ', written as two digits: ' + r2 : '') + '. Side by side: ' + B(num(ans)) + '.'],
        steps: [st(B(f + ' × ' + (f + 1)) + ' = ?', left), st(B(o + ' × ' + o2) + ' = ?', right), st('Write ' + left + ', then ' + r2 + '. What is ' + B(a + ' × ' + b) + '?', ans)],
        traps: TR([tr(f * f * 100 + right, 'm_end10', 'Times the next number up, ' + (f + 1) + ', not ' + f + ' itself.'),
          right < 10 ? tr(glue(left, right), 'n_place', 'The ones product fills two places: write ' + r2 + '.') : null,
          tr(left * 100, 'm_end10', 'Now write ' + o + ' × ' + o2 + ' on the end.'), tr(f * f * 100 + o * o2 + 10, 'm_breakapart', 'Tens × tens and ones × ones miss the middle pieces. Use the trick.')]) };
    } },

  { id: 'm_end1', s: 'mul', g: 6, title: 'Two numbers ending in 1: 21 × 31', pre: ['a_regroup'],
    tip: '21 × 31: fronts multiplied, 2 × 3 = 6 (hundreds). Fronts added, 2 + 3 = 5 (tens). Then 1 × 1 = 1. So 651. If the middle is 10 or more, carry.',
    gen(d, R) {
      let x, y;
      if (d === 0) { x = R.i(1, 8); y = R.i(1, 8); if (x + y > 9) return null; }
      else if (d === 1) { x = R.i(2, 9); y = R.i(2, 9); if (x + y < 10 && R.chance(.6)) return null; }
      else { x = R.i(10, 19); y = R.i(2, 9); }
      const a = 10 * x + 1, b = 10 * y + 1, P = x * y, S = x + y, ans = a * b;
      const sw = R.chance(.5);
      return { text: 'What is ' + B((sw ? b + ' × ' + a : a + ' × ' + b)) + '?', ans,
        how: ['Take off the 1s: the fronts are ' + x + ' and ' + y + '. Fronts multiplied: ' + x + ' × ' + y + ' = ' + P + (P === 1 ? ' hundred.' : ' hundreds.'),
          'Fronts added: ' + x + ' + ' + y + ' = ' + S + ' tens. And 1 × 1 = 1.',
          num(P * 100) + ' + ' + num(S * 10) + ' + 1 = ' + B(num(ans)) + '.'],
        steps: [st(B(x + ' × ' + y) + ' = ?', P), st(B(x + ' + ' + y) + ' = ?', S), st(B(num(P * 100) + ' + ' + num(S * 10) + ' + 1') + ' = ?', ans)],
        traps: TR([S >= 10 ? tr(glue(P, S, 1), 'a_regroup', 'The middle is ' + S + ', so it carries 1 into the hundreds.') : null,
          tr(P * 100 + 1, 'm_end1', 'Don’t forget the middle: the fronts added make the tens.'), tr(P * 100 + S * 10, 'm_end1', '1 × 1 = 1 goes on the end.'),
          tr(P * 100 + P * 10 + 1, 'm_end1', 'The middle is the fronts added, not multiplied.')]) };
    } },

  { id: 'm_cross', s: 'mul', g: 6, title: 'Criss-cross multiplying', pre: ['a_regroup'],
    tip: '23 × 41. Right: 3 × 1 = 3. Middle: cross and add, 2 × 1 + 3 × 4 = 14, write 4 and carry 1. Left: 2 × 4 = 8, plus 1 is 9. So 943.',
    gen(d, R) {
      let p, q, r, s;
      if (d === 0) { p = R.i(1, 4); q = R.i(1, 4); r = R.i(1, 4); s = R.i(1, 4); }
      else if (d === 1) { p = R.i(1, 9); q = R.i(1, 9); r = R.i(1, 9); s = R.i(1, 9); }
      else { p = R.i(3, 9); q = R.i(4, 9); r = R.i(3, 9); s = R.i(4, 9); }
      const a = 10 * p + q, b = 10 * r + s, R0 = q * s, mid = p * s + q * r, left = p * r;
      const c1 = Math.floor(R0 / 10), M0 = mid + c1, c2 = Math.floor(M0 / 10), L0 = left + c2, ans = a * b;
      if (d === 0 && (R0 >= 10 || mid >= 10)) return null;
      if (d === 1 && R0 < 10 && mid < 10) return null;
      if (a === b && R.chance(.7)) return null;
      return { text: 'What is ' + B(a + ' × ' + b) + '?', ans,
        how: ['Right: ones × ones, ' + q + ' × ' + s + ' = ' + R0 + (c1 ? '. Write ' + R0 % 10 + ', carry ' + c1 : '') + '.',
          'Middle: cross and add, ' + p + ' × ' + s + ' + ' + q + ' × ' + r + ' = ' + mid + (c1 ? ', plus ' + c1 + ' is ' + M0 : '') + (c2 ? '. Write ' + M0 % 10 + ', carry ' + c2 : '') + '.',
          'Left: tens × tens, ' + p + ' × ' + r + ' = ' + left + (c2 ? ', plus ' + c2 + ' is ' + L0 : '') + '. So ' + a + ' × ' + b + ' = ' + B(num(ans)) + '.'],
        steps: [st(B(q + ' × ' + s) + ' = ?', R0), st('Cross and add: ' + B(p + ' × ' + s + ' + ' + q + ' × ' + r) + ' = ?', mid), st(B(p + ' × ' + r) + ' = ?', left),
          st((c1 || c2 ? 'The three parts are ' + left + ', ' + mid + ' and ' + R0 + '. Start from the right. Write the ones of each part and carry the tens. ' : 'Write ' + left + ', then ' + mid + ', then ' + R0 + '. ') + 'What is ' + B(a + ' × ' + b) + '?', ans)],
        traps: TR([(c1 || c2) ? tr(left * 100 + (mid % 10) * 10 + R0 % 10, 'a_regroup', 'Carry the tens of each part into the next place on the left.') : null,
          tr(left * 100 + R0, 'm_cross', 'You missed the middle: cross and add the outside and inside pairs.'),
          tr(left * 100 + p * s * 10 + R0, 'm_cross', 'Cross both ways: ' + p + ' × ' + s + ' and ' + q + ' × ' + r + '.')]) };
    } },

  { id: 'm_sq50', s: 'mul', g: 7, title: 'Squares from 41 to 59', pre: ['w_exp'],
    tip: '50² = 2,500 is 25 hundreds. 56 is 6 above 50: 25 + 6 = 31 hundreds, and 6² = 36 goes on the end: 3,136. 44² is 6 below: 25 − 6 = 19, then 36: 1,936.',
    gen(d, R) {
      const kind = d < 2 ? 'h' : R.pick(['th', 'dec']);
      const k = d === 0 ? R.pick([-4, -3, -2, -1, 1, 2, 3, 4]) : R.pick([-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const ak = Math.abs(k), up = k > 0, k2 = k * k, sgn = up ? ' + ' : M, word = up ? 'above' : 'below';
      if (kind === 'th') {
        const n = 500 + k, H = 250 + k, ans = n * n, t3 = pad(k2, 3);
        return { text: 'What is ' + B(sq(n)) + '?', ans,
          how: ['500² = 250,000 is 250 thousands, and each step away from 500 is 2 × 500 = 1 thousand. ' + n + ' is ' + ak + ' ' + word + ' 500.',
            '250' + sgn + ak + ' = ' + H + ': that is ' + H + ' thousands.', sq(ak) + ' = ' + k2 + ', written as three digits ' + t3 + ' on the end: ' + B(num(ans)) + '.'],
          steps: [st(B('250' + sgn + ak) + ' = ?', H), st(B(sq(ak)) + ' = ?', k2), st('Write ' + H + ', then ' + t3 + '. What is ' + B(sq(n)) + '?', ans)],
          traps: TR([tr(H * 1000, 'm_sq50', 'Now put ' + sq(ak) + ' = ' + k2 + ' on the end.'), tr(glue(H, k2), 'n_place', 'Near 500 the little square fills three places: ' + t3 + '.'),
            tr((250 - k) * 1000 + k2, 'm_sq50', n + ' is ' + word + ' 500, so ' + (up ? 'add' : 'take away') + ' ' + ak + '.'), up ? null : tr(H * 1000 - k2, 'n_intmul', 'The little square is always added, even below 500.')]) };
      }
      const n = 50 + k, H = 25 + k, N2 = n * n, t2 = pad(k2, 2);
      const how = ['Each step away from 50 is 2 × 50 = 100, one hundred. ' + n + ' is ' + ak + ' ' + word + ' 50, so start with 25' + sgn + ak + ' = ' + H + ' hundreds.',
        sq(ak) + ' = ' + k2 + ', written as two digits ' + t2 + ' on the end: ' + (kind === 'dec' ? num(N2) : B(num(N2))) + '.'];
      if (kind === 'h') return { text: 'What is ' + B(sq(n)) + '?', ans: N2, how,
        steps: [st(B('25' + sgn + ak) + ' = ?', H), st(B(sq(ak)) + ' = ?', k2), st('Write ' + H + ', then ' + t2 + '. What is ' + B(sq(n)) + '?', N2)],
        traps: TR([tr(H * 100, 'm_sq50', 'Now put ' + sq(ak) + ' = ' + k2 + ' on the end.'), k2 < 10 ? tr(glue(H, k2), 'n_place', 'The little square fills two places: ' + t2 + '.') : null,
          tr((25 - k) * 100 + k2, 'm_sq50', n + ' is ' + word + ' 50, so ' + (up ? 'add' : 'take away') + ' ' + ak + '.'), up ? null : tr(H * 100 - k2, 'n_intmul', 'The little square is always added, even below 50.')]) };
      const x = n / 10, ans = N2 / 100;
      how[0] = 'Square ' + n + ' first. ' + how[0];
      how.push(num(x) + ' × ' + num(x) + ' has two decimal places: ' + B(num(ans)) + '.');
      return { text: 'What is ' + B(sq(num(x))) + '?', ans, how,
        steps: [st(B(sq(n)) + ' = ?', N2), st(sq(n) + ' = ' + num(N2) + '. Put in the decimal point. What is ' + B(sq(num(x))) + '?', ans)],
        traps: TR([tr(N2 / 10, 'f_decmul', num(x) + ' × ' + num(x) + ' has two decimal places, one from each.'), tr(H, 'm_sq50', 'Put ' + sq(ak) + ' on the end before the point goes in.'), tr(2 * x, 'w_exp', 'Squared means times itself, not times 2.')]) };
    } },
]));

/* ======================= Adding, Number Sense, Money ======================= */
const total = a => a.reduce((x, y) => x + y, 0);
C.defs(ex([
  { id: 'a_cluster', s: 'add', g: 4, title: 'Add numbers that are close together', pre: ['m_xtens'],
    tip: '48 + 52 + 49 + 53 are all near 50: 4 × 50 = 200. Over 50: 2 + 3 = 5. Under 50: 2 + 1 = 3. So 200 + 5 − 3 = 202.',
    gen(d, R) {
      let T, k, w;
      if (d === 0) { T = 10 * R.i(2, 9); k = 3; w = 3; }
      else if (d === 1) { T = R.chance(.7) ? 10 * R.i(2, 9) : R.pick([100, 200, 300]); k = 4; w = 5; }
      else { T = R.pick([100, 200, 250, 300, 400, 500, 600, 700, 800, 900]); k = 5; w = 9; }
      const offs = []; for (let i = 0; i < k; i++) offs.push(R.i(-w, w));
      const over = offs.filter(o => o > 0), under = offs.filter(o => o < 0).map(o => -o);
      if (offs.filter(o => o === 0).length > 1) return null;
      if (d > 0 ? !over.length || !under.length : !over.length && !under.length) return null;
      const base = k * T, O = total(over), U = total(under), ans = base + O - U;
      const lst = (a, s) => (!a.length ? 'none' : a.length > 1 ? a.join(' + ') + ' = ' + s : String(s));
      const expr = num(base) + (O ? ' + ' + O : '') + (U ? M + U : '');
      const steps = [st(B(k + ' × ' + T) + ' = ?', base)];
      if (over.length > 1) steps.push(st('Add the amounts over ' + T + ': ' + B(over.join(' + ')) + ' = ?', O));
      if (under.length > 1) steps.push(st('Add the amounts under ' + T + ': ' + B(under.join(' + ')) + ' = ?', U));
      steps.push(st(B(expr) + ' = ?', ans));
      return { text: 'What is ' + B(offs.map(o => T + o).join(' + ')) + '?', ans,
        how: ['All ' + k + ' numbers are close to ' + T + '. ' + k + ' × ' + T + ' = ' + num(base) + '.',
          'Over ' + T + ': ' + lst(over, O) + '. Under ' + T + ': ' + lst(under, U) + '.', expr + ' = ' + B(num(ans)) + '.'],
        steps,
        traps: TR([tr(base, 'a_cluster', 'That is ' + k + ' × ' + T + '. Now fix it with the amounts over and under.'),
          U ? tr(base + O + U, 'a_cluster', 'Numbers under ' + T + ' are short, so take those amounts away.') : null,
          O && U ? tr(base - O + U, 'a_cluster', 'Over ' + T + ' adds, under ' + T + ' takes away.') : null,
          tr(ans - T, 'm_xtens', 'Count the numbers: there are ' + k + ' of them, so ' + k + ' × ' + T + '.')]) };
    } },

  { id: 'a_friend1000', s: 'add', g: 4, title: 'Take away by adding the friend', pre: [],
    tip: '83 − 47: the friend of 47 to 100 is 53. 83 + 53 = 136. That has an extra 100, so drop it: 36. For 3 digits use the friend to 1,000: all to 9, the last to 10.',
    gen(d, R) {
      const nd = d + 2, base = Math.pow(10, nd), lo = base / 10, a = R.i(lo * 2, base - 1), b = R.i(lo, a - 1);
      if (b % 10 === 0 || a - b < lo / 2) return null;
      const A = String(a), Bs = String(b);
      if (!A.split('').some((x, i) => +x < +Bs[i])) return null;
      const f = base - b, s = a + f, ans = a - b;
      const pairs = Bs.split('').map((x, i) => { const t = i < nd - 1 ? 9 : 10; return x + ' + ' + (t - x) + ' = ' + t; }).join(', ');
      return { text: 'What is ' + B(num(a) + M + num(b)) + '?', ans,
        how: ['The friend of ' + num(b) + ' to ' + num(base) + ' is ' + num(f) + ' (' + pairs + ').', num(a) + ' + ' + num(f) + ' = ' + num(s) + '.',
          'That has an extra ' + num(base) + ' in it, so drop it: ' + num(s) + M + num(base) + ' = ' + B(num(ans)) + '.'],
        steps: [st(num(b) + ' and its friend make ' + num(base) + '. What is the friend of ' + B(num(b)) + '?', f), st(B(num(a) + ' + ' + num(f)) + ' = ?', s), st(B(num(s) + M + num(base)) + ' = ?', ans)],
        traps: TR([tr(s, 'a_friend1000', 'Adding the friend put an extra ' + num(base) + ' in. Drop it.'),
          tr(ans - 1, 'a_from100', 'The last digit of the friend goes to 10, not 9: the friend of ' + num(b) + ' is ' + num(f) + '.'),
          tr(digitGap(a, b), 'a_borrow', 'In some places you took the smaller digit from the bigger one. The friend trick avoids that.')]) };
    } },

  { id: 'n_frontend', s: 'count', g: 4, title: 'Front-end estimate, then adjust', pre: ['a_3digit'],
    tip: 'Add the front digits first, then adjust with the next place. 347 + 285 + 432: 300 + 200 + 400 = 900; tens 40 + 80 + 30 = 150. About 1,050.',
    gen(d, R) {
      const k = d === 0 ? 2 : 3, big = d === 2, P = big ? 1000 : 100, u = P / 10, nums = [];
      for (let i = 0; i < k; i++) nums.push(R.i(P + u, 10 * P - 1));
      if (nums.some(v => Math.floor(v / u) % 10 === 0)) return null;
      const fr = nums.map(v => Math.floor(v / P) * P), ad = nums.map(v => (Math.floor(v / u) % 10) * u);
      const F = total(fr), A = total(ad), ans = F + A, exact = total(nums), rnd = total(nums.map(v => Math.round(v / u) * u));
      const fw = big ? 'thousands' : 'hundreds', aw = big ? 'hundreds' : 'tens', dw = big ? 'tens and ones' : 'ones';
      return { text: 'Add the ' + fw + ' first. Then add the ' + aw + '. Drop the ' + dw + '. About how much is ' + B(nums.map(num).join(' + ')) + '?', ans,
        how: ['Fronts: ' + fr.map(num).join(' + ') + ' = ' + num(F) + '.', 'Adjust with the ' + aw + ': ' + ad.map(num).join(' + ') + ' = ' + num(A) + '.',
          num(F) + ' + ' + num(A) + ' = ' + B(num(ans)) + '. (The exact total is ' + num(exact) + ', very close.)'],
        steps: [st('Add the ' + fw + ': ' + B(fr.map(num).join(' + ')) + ' = ?', F), st('Add the ' + aw + ': ' + B(ad.map(num).join(' + ')) + ' = ?', A), st(B(num(F) + ' + ' + num(A)) + ' = ?', ans)],
        traps: TR([tr(F, 'n_frontend', 'That is the front part. Now adjust with the ' + aw + '.'), tr(exact, 'n_frontend', 'That is the exact total. This estimate drops the ' + dw + '.'),
          tr(rnd, 'n_estimate', 'That rounds each number. Front-end drops the ' + dw + ' instead.'), tr(ans + 10 * u, 'a_regroup', 'Check your adding of the ' + aw + '.')]) };
    } },

  { id: 'c_x99', s: 'money', g: 4, title: 'Several things at $2.99 each', pre: ['a_compensate'],
    tip: '4 × $2.99: think 4 × $3 = $12, then take back 4 pennies (1¢ for each one): $11.96.',
    gen(d, R) {
      let W, g, qn;
      if (d === 0) { W = R.i(1, 5); g = 1; qn = R.i(2, 5); }
      else if (d === 1) { W = R.i(2, 9); g = R.pick([1, 1, 2, 5]); qn = R.i(3, 9); }
      else { W = R.chance(.5) ? R.i(10, 25) : R.i(3, 9); g = R.pick([1, 2, 5, 10]); qn = R.i(4, 9); }
      const price = 100 * W - g, round = 100 * W, R1 = qn * round, back = qn * g, ans = R1 - back;
      const item = R.pick(['notebook', 'toy car', 'book', 'puzzle', 'kite', 'ball', 'board game', 'water bottle']), m = { type: 'money', fmt: 'd' };
      return Object.assign({ text: 'One ' + item + ' costs ' + B(fmtD(price)) + '. How much do ' + B(qn) + ' ' + item + 's cost?', ans,
        how: [fmtD(price) + ' is ' + g + '¢ less than ' + fmtD(round) + '. So ' + qn + ' × ' + fmtD(round) + ' = ' + fmtD(R1) + '.',
          'That is ' + g + '¢ too much for each one: ' + qn + ' × ' + g + '¢ = ' + fmtM(back) + '.',
          fmtD(R1) + M + fmtD(back) + ' = ' + B(fmtD(ans)) + '.'],
        steps: [st(B(qn + ' × ' + fmtD(round)) + ' = ?', R1, m), st('Take back ' + g + '¢ for each ' + item + '. How many cents is ' + B(qn + ' × ' + g + '¢') + '?', back, { type: 'money', fmt: 'c' }),
          st(B(fmtD(R1) + M + fmtD(back)) + ' = ?', ans, m)],
        traps: TR([tr(R1 - g, 'c_x99', 'Take back ' + g + '¢ for each of the ' + qn + ', not just once.'), tr(R1, 'c_x99', 'Now take back the extra cents.'),
          tr(R1 + back, 'c_x99', 'You rounded up, so take the cents back; don’t add them.'), R1 - 10 * back > 0 ? tr(R1 - 10 * back, 'n_place', 'Check the cents: ' + qn + ' × ' + g + '¢ = ' + back + '¢.') : null]) }, m);
    } },
]));

/* ======================= Factors & Primes ======================= */
const rootLine = v => { const parts = []; let x = v; while (x >= 10) { const s = dsum(x); parts.push(digs(x).join(' + ') + ' = ' + s); x = s; } return parts.join(', then '); };
const step7 = v => Math.floor(v / 10) - 2 * (v % 10);
C.defs(ex([
  { id: 'fa_root', s: 'fact', g: 5, title: 'Check answers with digit roots', pre: ['a_3digit'],
    tip: 'Add the digits again and again until one digit is left: 4,817 → 20 → 2. The digit roots of two numbers add (or multiply) to the digit root of the answer. If not, there is a mistake.',
    gen(d, R) {
      if (d === 0) {
        const N = R.i(120, 98765), s1 = dsum(N), r = droot(N);
        if (s1 < 10 && R.chance(.7)) return null;
        return { text: 'Add the digits until one digit is left. What is the digit root of ' + B(num(N)) + '?', ans: r,
          how: ['Add the digits: ' + digs(N).join(' + ') + ' = ' + s1 + '.', s1 >= 10 ? 'Still two digits, so again: ' + rootLine(s1) + '. The digit root is ' + B(r) + '.' : s1 + ' is one digit, so the digit root is ' + B(r) + '.'],
          steps: [st('Add the digits of ' + B(num(N)) + '.', s1)].concat(s1 >= 10 ? [st('Now add the digits of ' + B(s1) + ' until one digit is left.', r)] : []),
          traps: TR([s1 >= 10 ? tr(s1, 'fa_root', 'Keep going: add the digits of ' + s1 + ' too.') : null, tr(droot(Math.floor(N / 10)), 'fa_root', 'Add every digit, including the last one.'),
            r === 9 ? tr(0, 'fa_div39', 'Here 9 stays 9: a digit root is 1 to 9.') : tr(droot(N + 1), 'a_split', 'Check your adding of the digits.')]) };
      }
      if (d === 1) {
        const a = R.i(123, 9876), b = R.i(123, 9876), ra = droot(a), rb = droot(b), s = ra + rb, r = droot(s);
        return { text: 'Use the digit root of each number. What is the digit root of ' + B(num(a) + ' + ' + num(b)) + '?', ans: r,
          how: ['Digit root of ' + num(a) + ': ' + rootLine(a) + '. Digit root of ' + num(b) + ': ' + rootLine(b) + '.',
            'Add the two roots: ' + ra + ' + ' + rb + ' = ' + s + (s >= 10 ? ', then ' + rootLine(s) : '') + '.',
            'So the sum must have digit root ' + B(r) + ' (check: ' + num(a + b) + ' → ' + r + ').'],
          steps: [st('What is the digit root of ' + B(num(a)) + '?', ra), st('What is the digit root of ' + B(num(b)) + '?', rb), st('What is the digit root of ' + B(ra + ' + ' + rb) + '?', r)],
          traps: TR([s >= 10 ? tr(s, 'fa_root', 'Keep adding digits until one digit is left.') : null, tr(droot(ra * rb), 'fa_root', 'For a sum, add the roots. Multiply them only for a product.'),
            tr(droot(r + 1), 'fa_root', 'Check the digit root of each number again.')]) };
      }
      const a = R.i(12, 98), b = R.chance(.5) ? R.i(12, 98) : R.i(102, 389), P = a * b, ra = droot(a), rb = droot(b), pr = ra * rb, r = droot(pr);
      const claim = P + R.pick([0, 0, 10, -10, 100, -100, 1]), rc = droot(claim), who = R.pick(NAMES);
      return { text: who + ' says ' + B(num(a) + ' × ' + num(b) + ' = ' + num(claim)) + '. Use the digit roots of ' + num(a) + ' and ' + num(b) + '. What digit root should the right answer have?', ans: r,
        how: ['Digit roots: ' + num(a) + ' → ' + ra + ' and ' + num(b) + ' → ' + rb + '.', 'Multiply the roots: ' + ra + ' × ' + rb + ' = ' + pr + (pr >= 10 ? ', then ' + rootLine(pr) : '') + '.',
          who + '’s ' + num(claim) + ' has digit root ' + rc + (rc === r ? ', which matches, so it passes the check.' : ', not ' + r + ', so it must be wrong.') + ' The answer’s digit root is ' + B(r) + '.'],
        steps: [st('What is the digit root of ' + B(num(a)) + '?', ra), st('What is the digit root of ' + B(num(b)) + '?', rb), st('What is the digit root of ' + B(ra + ' × ' + rb) + '?', r)],
        traps: TR([pr >= 10 ? tr(pr, 'fa_root', 'Keep adding digits until one digit is left.') : null, tr(droot(ra + rb), 'fa_root', 'For a product, multiply the roots. Add them only for a sum.'),
          rc !== r ? tr(rc, 'fa_root', 'That is the digit root of ' + who + '’s answer. Work out what it should be from ' + num(a) + ' and ' + num(b) + '.') : null]) };
    } },

  { id: 'fa_div8', s: 'fact', g: 6, title: 'Divisible by 8: the last three digits', pre: ['m_divbig'],
    tip: '1,000 = 8 × 125, so the thousands always divide by 8. Only the last three digits matter. 53,416: 416 = 8 × 52, so 53,416 divides by 8. Leftovers work the same way.',
    gen(d, R) {
      const front = d === 0 ? R.i(1, 9) : d === 1 ? R.i(10, 99) : R.i(100, 999), L = R.i(100, 999), N = front * 1000 + L, q = Math.floor(L / 8), r = L % 8;
      const addQ = d === 2 && R.chance(.5); if (addQ && r === 0) return null;
      const ans = addQ ? 8 - r : r, E = Math.floor(L / 200) * 200, rest = L - E, q2 = Math.floor(rest / 8);
      return { text: addQ ? 'What is the smallest number you can add to ' + B(num(N)) + ' to make it divide by 8?' : 'What is the leftover when ' + B(num(N)) + ' is divided by 8?', ans,
        how: ['1,000 = 8 × 125, so ' + num(front * 1000) + ' divides by 8. Only the last three digits, ' + L + ', matter.',
          (E ? L + ' = ' + E + ' + ' + rest + ', and ' + E + ' divides by 8 (200 = 8 × 25). ' : '') + rest + ' = ' + (r ? 8 * q2 + ' + ' + r + ' (' + 8 * q2 + ' = 8 × ' + q2 + ').' : '8 × ' + q2 + ', nothing left over.'),
          addQ ? 'The leftover is ' + r + ', so add 8' + M + r + ' = ' + B(ans) + ' to reach the next number in the 8s.' : 'So the leftover is ' + B(r) + (r ? '.' : ': ' + num(N) + ' divides by 8.')],
        steps: [st('The thousands always divide by 8. What are the last three digits of ' + B(num(N)) + '?', L), st('What is the leftover when ' + B(L) + ' is divided by 8?', r)].concat(addQ ? [st(B('8' + M + r) + ' = ?', 8 - r)] : []),
        traps: TR([tr((L % 100) % 8, 'fa_div46', 'Two digits is the test for 4. For 8, use the last three digits.'), tr((L % 10) % 8, 'fa_div2510', 'The last digit alone only works for 2, 5 and 10.'),
          addQ ? tr(r, 'fa_div8', 'That is the leftover. How much more makes the next number in the 8s?') : tr(8 - r, 'fa_div8', 'That is how much to add. The question asks for the leftover.')]) };
    } },

  { id: 'fa_div7', s: 'fact', g: 6, title: 'Divisible by 7: double and take away', pre: ['m_x7'],
    tip: 'Chop off the last digit, double it, and take it away from what is left. 371: 37 − 2 = 35, which is 5 × 7, so 371 divides by 7. If the end number is not in the 7s, neither is the start.',
    gen(d, R) {
      const pick = (mult, lo, hi) => { for (let t = 0; t < 60; t++) { const v = mult ? 7 * R.i(Math.ceil(lo / 7), Math.floor(hi / 7)) : R.i(lo, hi); if (!mult && v % 7 === 0) continue; if (step7(v) < 0 || v % 10 === 0) continue; return v; } return null; };
      const in7 = s => (s % 7 === 0 ? 'is in the 7s (' + s + ' = 7 × ' + s / 7 + ')' : 'is not in the 7s');
      const line = v => num(v) + ': ' + Math.floor(v / 10) + M + 2 * (v % 10) + ' = ' + step7(v);
      const one = v => st('Do one step of the 7 test on ' + B(num(v)) + '. The last digit is ' + v % 10 + ', and double ' + v % 10 + ' is ' + 2 * (v % 10) + '. What is ' + B(Math.floor(v / 10) + M + 2 * (v % 10)) + '?', step7(v));
      if (d === 0) {
        const v = pick(R.chance(.5), 105, 999); if (v == null) return null;
        const top = Math.floor(v / 10), o = v % 10, s = step7(v);
        return { text: 'Try the 7 test on ' + B(v) + '. Chop off the last digit. Double that digit. Take the double away from what is left. What number do you get?', ans: s,
          how: ['Chop off the ' + o + ': ' + top + ' is left. Double the ' + o + ': ' + 2 * o + '.',
            top + M + 2 * o + ' = ' + B(s) + ', which ' + in7(s) + ', so ' + v + (s % 7 === 0 ? ' divides by 7.' : ' does not divide by 7.')],
          steps: [st('Chop off the last digit of ' + B(v) + '. What is left?', top), st('Double the last digit: ' + B('2 × ' + o) + ' = ?', 2 * o), st(B(top + M + 2 * o) + ' = ?', s)],
          traps: TR([tr(top - o, 'fa_div7', 'Double the last digit before you take it away.'), tr(top + 2 * o, 'fa_div7', 'Take the doubled digit away; don’t add it.'), tr(v - 2 * o, 'fa_div7', 'Chop the last digit off first, then take away its double.')]) };
      }
      if (d === 1) {
        const v = pick(R.chance(.5), 1001, 9999); if (v == null) return null;
        const seq = [v]; let x = v; while (x >= 100) { x = step7(x); if (x < 0) return null; seq.push(x); }
        const fin = seq[seq.length - 1];
        return { text: 'Use the 7 test on ' + B(num(v)) + '. Chop off the last digit and double that digit. Take the double away from what is left. Keep going until the number is under 100. What number do you end with?', ans: fin,
          how: seq.slice(0, -1).map(line).map(s => s + '.').concat(['You end with ' + B(fin) + ', which ' + in7(fin) + ', so ' + num(v) + (fin % 7 === 0 ? ' divides by 7.' : ' does not divide by 7.')]),
          steps: seq.slice(0, -1).map(y => one(y)),
          traps: TR([seq.length > 2 ? tr(seq[1], 'fa_div7', 'Keep going until the number is under 100.') : null, tr(Math.floor(v / 10) - (v % 10), 'fa_div7', 'Double the last digit before you take it away.'),
            tr(fin + 7, 'fa_div7', 'Check each step: chop, double, take away.')]) };
      }
      const c = R.i(0, 3), list = [];
      for (let i = 0; i < 3; i++) { const v = pick(i < c, 105, 999); if (v == null || list.includes(v)) return null; list.push(v); }
      const nums = R.shuffle(list);
      return { text: 'Use the 7 test on each number: ' + B(nums.join(', ')) + '. How many of these numbers divide by 7?', ans: c,
        how: nums.map(v => line(v) + ', which ' + in7(step7(v)) + '.').concat(['So ' + B(c) + ' of them ' + (c === 1 ? 'divides' : 'divide') + ' by 7.']),
        steps: nums.map(v => one(v)).concat([st('The three end numbers are ' + step7(nums[0]) + ', ' + step7(nums[1]) + ' and ' + step7(nums[2]) + '. How many of them are in the 7s?', c)]),
        traps: TR([c < 3 ? tr(c + 1, 'fa_div7', 'Check each end number: is it 0, 7, 14, 21, 28, 35, 42, 49, …?') : null, c > 0 ? tr(c - 1, 'fa_div7', 'Check each end number: is it 0, 7, 14, 21, 28, 35, 42, 49, …?') : null]) };
    } },
]));

/* ======================= Fractions, Decimals & Percents ======================= */
const CYC = '142857';
const start7 = k => Math.floor(10 * k / 7);                                    /* first digit after the point of k/7 */
const block7 = k => { const i = CYC.indexOf(String(start7(k))); return CYC.slice(i) + CYC.slice(0, i); };
const ITEMS2 = ['jacket', 'bike', 'lamp', 'backpack', 'game', 'tent', 'scooter', 'skateboard'];
const usd = v => '$' + num(v);
C.defs(ex([
  { id: 'f_deccomp', s: 'frac', g: 5, title: 'Round and adjust with decimals', pre: ['a_compensate'],
    tip: '6.7 + 1.98: 1.98 is 0.02 less than 2. 6.7 + 2 = 8.7, then take the 0.02 back: 8.68. 9.4 − 2.95: take away 3, then give 0.05 back: 6.45.',
    gen(d, R) {
      let a, W, g, add;
      if (d === 0) { a = 10 * R.i(12, 199); W = R.i(2, 9); g = 10; add = true; }
      else if (d === 1) { W = R.i(2, 9); g = R.pick([1, 2, 5, 10]); add = R.chance(.5); a = R.chance(.5) ? 10 * R.i(12, 199) : R.i(120, 1999); if (!add && a <= 100 * W + 20) return null; }
      else { W = R.i(3, 15); g = R.pick([1, 2, 3, 4, 5, 10, 20]); add = false; a = R.i(100 * W + 30, 3000); }
      if (a % 100 === 0) return null;
      const b = 100 * W - g, r1 = add ? a + 100 * W : a - 100 * W, ans = add ? a + b : a - b, D = v => num(v / 100), op = add ? ' + ' : M, back = add ? M : ' + ';
      const slip = g < 10 ? 10 * g : g / 10;
      return { text: 'What is ' + B(D(a) + op + D(b)) + '?', ans: ans / 100,
        how: [D(b) + ' is ' + D(g) + ' less than ' + W + '. ' + (add ? 'Add ' : 'Take away ') + W + ' instead: ' + D(a) + op + W + ' = ' + D(r1) + '.',
          (add ? 'You added ' + D(g) + ' too much, so take it back: ' : 'You took away ' + D(g) + ' too much, so give it back: ') + D(r1) + back + D(g) + ' = ' + B(D(ans)) + '.'],
        steps: [st('How far is ' + B(D(b)) + ' from ' + W + '?', g / 100), st('What is ' + B(D(a) + op + W) + '?', r1 / 100), st(B(D(r1) + back + D(g)) + ' = ?', ans / 100)],
        traps: TR([tr(r1 / 100, 'f_deccomp', add ? 'Now take back the extra ' + D(g) + '.' : 'Now give back the extra ' + D(g) + '.'),
          tr((add ? r1 + g : r1 - g) / 100, 'f_deccomp', add ? 'You added too much, so take the extra away; don’t add more.' : 'You took away too much, so give the extra back; don’t take more.'),
          tr((add ? r1 - slip : r1 + slip) / 100, 'n_decplace', 'Is the gap ' + D(g) + ' or ' + D(slip) + '? Count the places after the point.')]) };
    } },

  { id: 'f_twopct', s: 'frac', g: 7, title: 'Two percent changes in a row', pre: [],
    tip: '10% off and then 10% off again is not 20% off: you pay 0.9 × 0.9 = 0.81 of the price, so it is 19% off. Up 25% then down 20%: 1.25 × 0.8 = 1, back to the start.',
    gen(d, R) {
      const dec = p => num(p / 100), L = [10, 20, 30, 40, 50, 25];
      if (d === 0) {
        const p = R.pick(L), q = R.pick(L), keep = (100 - p) * (100 - q);
        if (keep % 100) return null;
        const pay = keep / 100, ans = 100 - pay;
        return { text: 'A store takes ' + B(p + '% off') + ' a price. Then the store takes ' + B(q + '% off') + ' the sale price. In all, what percent of the starting price is taken off?', ans, unit: '%',
          how: [p + '% off means you pay ' + (100 - p) + '%: × ' + dec(100 - p) + '. Then ' + q + '% off is × ' + dec(100 - q) + '.',
            'Multiply: ' + dec(100 - p) + ' × ' + dec(100 - q) + ' = ' + dec(pay) + ', so you pay ' + pay + '% of the price.',
            '100%' + M + pay + '% = ' + B(ans + '%') + ' off, not ' + (p + q) + '%.'],
          steps: [st('After ' + p + '% off, what percent of the price do you pay?', 100 - p, { unit: '%' }), st(B(dec(100 - p) + ' × ' + dec(100 - q)) + ' = ?', pay / 100),
            st('You pay ' + pay + '% of the price. What percent off is that?', ans, { unit: '%' })],
          traps: TR([tr(p + q, 'f_twopct', 'The second ' + q + '% comes off the lower sale price, so it takes off less than ' + q + '% of the first price.'),
            tr(pay, 'f_discount', 'That is the percent you pay. How much is taken off?')]) };
      }
      if (d === 1) {
        const P = 4 * R.i(5, 50), p = R.pick(L), q = R.pick(L), keep = (100 - p) * (100 - q), ans = P * keep / 100, item = R.pick(ITEMS2), m = { type: 'money', fmt: 'd' }, kd = num(keep / 10000);
        if (keep % 100) return null;
        return Object.assign({ text: 'A ' + item + ' costs ' + B(usd(P)) + '. A store takes ' + B(p + '% off') + ' the price. Then the store takes ' + B(q + '% off') + ' the sale price. What is the final price?', ans,
          how: ['Each discount multiplies the price: × ' + dec(100 - p) + ', then × ' + dec(100 - q) + '.', dec(100 - p) + ' × ' + dec(100 - q) + ' = ' + kd + '.', kd + ' × ' + usd(P) + ' = ' + B(fmtD(ans)) + '.'],
          steps: [st(B(dec(100 - p) + ' × ' + dec(100 - q)) + ' = ?', keep / 10000), st(B(kd + ' × ' + usd(P)) + ' = ?', ans, m)],
          traps: TR([p + q < 100 ? tr(P * (100 - p - q), 'f_twopct', 'The second discount comes off the sale price, not off ' + usd(P) + '.') : null,
            tr(P * (100 - p), 'f_twopct', 'That is after the first discount only.'), tr(P * 100 - ans, 'f_discount', 'That is how much was taken off. What do you pay?')]) }, m);
      }
      const p = R.pick([10, 20, 25, 50, 100]), q = R.pick([10, 20, 25, 50]), upFirst = R.chance(.6), res = (100 + p) * (100 - q) / 100, u = num((100 + p) / 100), dn = dec(100 - q);
      return { text: 'A price goes ' + (upFirst ? 'up ' + B(p + '%') + '. Then the new price goes down ' + B(q + '%') : 'down ' + B(q + '%') + '. Then the new price goes up ' + B(p + '%')) + '. The final price is what percent of the starting price?', ans: res, unit: '%',
        how: ['Up ' + p + '% is × ' + u + '. Down ' + q + '% is × ' + dn + '.', 'Multiply (the order does not matter): ' + u + ' × ' + dn + ' = ' + num(res / 100) + '.',
          'So the final price is ' + B(num(res) + '%') + ' of the start' + (res === 100 ? ', back where it began.' : '.')],
        steps: [st('A price goes up ' + p + '%. What do you multiply the price by?', (100 + p) / 100), st('A price goes down ' + q + '%. What do you multiply the price by?', (100 - q) / 100), st(B(u + ' × ' + dn) + ' = ?', res / 100)],
        traps: TR([tr(100 + p - q, 'f_twopct', 'The second change is a percent of the new price, not of the start.'),
          res !== 100 ? tr(Math.abs(100 - res), 'f_pctchange', 'That is how much it changed. The question asks what percent of the start it is.') : null]) };
    } },

  { id: 'f_undopct', s: 'frac', g: 7, title: 'Undo a percent change', pre: ['x_onestep'],
    tip: 'After 20% off a shirt costs $48. So $48 is 80% of the old price, and 80% is 4 of 5 equal parts: $48 ÷ 4 = $12, and 5 × $12 = $60. Don’t take 20% of $48.',
    gen(d, R) {
      const P = 20 * R.i(2, 15);
      let p, up;
      if (d === 0) { p = R.pick([10, 20, 25, 50]); up = false; }
      else if (d === 1) { p = R.pick([10, 20, 25, 50]); up = true; }
      else { p = R.pick([5, 15, 30, 40, 60, 35]); up = R.chance(.5); }
      const pct = up ? 100 + p : 100 - p, g = gcd(pct, 100), k = pct / g, nn = 100 / g, A = P * pct / 100, part = P / nn, item = R.pick(ITEMS2), m = { type: 'money', fmt: 'd' };
      const how = [(up ? 'After going up ' + p + '%, the new price is ' + pct + '% of the old one' : 'After ' + p + '% off you pay ' + pct + '% of the old price') + ', so ' + usd(A) + ' is ' + pct + '% of it.'];
      if (k === 1) how.push(pct + '% is half of 100%, so the old price is 2 × ' + usd(A) + ' = ' + B(usd(P)) + '.');
      else how.push(pct + '% is ' + k + ' parts of ' + g + '%. One part: ' + usd(A) + ' ÷ ' + k + ' = ' + usd(part) + '.', 'The old price is 100%, which is ' + nn + ' parts: ' + nn + ' × ' + usd(part) + ' = ' + B(usd(P)) + '.');
      const steps = [st((up ? 'A price went up ' + p + '% to ' + usd(A) + '. ' : 'After ' + p + '% off, the price is ' + usd(A) + '. ') + 'What percent of the old price is ' + B(usd(A)) + '?', pct, { unit: '%' })];
      if (k > 1) steps.push(st(pct + '% is ' + k + ' parts of ' + g + '% each. Find one part: ' + B(usd(A) + ' ÷ ' + k) + ' = ?', part * 100, m));
      steps.push(st(B(nn + ' × ' + usd(part)) + ' = ?', P * 100, m));
      return Object.assign({ text: up ? 'The price of a ' + item + ' went up ' + B(p + '%') + '. Now the ' + item + ' costs ' + B(usd(A)) + '. What was the price before it went up?' :'After ' + B(p + '% off') + ', a ' + item + ' costs ' + B(usd(A)) + '. What was the price before the sale?',
        ans: P * 100, how, steps,
        traps: TR([tr(up ? A * (100 - p) : A * (100 + p), 'f_undopct', 'The ' + p + '% was of the old price, not of ' + usd(A) + '. Find what ' + usd(A) + ' is ' + pct + '% of.'),
          tr(up ? A * (100 + p) : A * (100 - p), 'f_undopct', up ? 'The price went up, so the old price was less than ' + usd(A) + '.' : 'The sale made it cheaper, so the old price was more than ' + usd(A) + '.'),
          tr((up ? A - p : A + p) * 100, 'f_pctchange', p + '% is not $' + p + ': it is a part of the old price.')]) }, m);
    } },

  { id: 'f_sevenths', s: 'frac', g: 8, title: 'Sevenths: one circle of digits', pre: ['p_cycle'],
    tip: '1/7 = 0.142857 142857… Every seventh uses the same six digits in the same order, starting somewhere else. 3/7: 30 ÷ 7 is 4 and a bit, so start at 4: 3/7 = 0.428571…',
    gen(d, R) {
      const hint = frac(1, 7) + ' = ' + B('0.142857 142857…') + '. ';
      const startLine = k => 'Find the start: ' + 10 * k + ' ÷ 7 = ' + start7(k) + ' r ' + (10 * k - 7 * start7(k)) + ', so ' + frac(k, 7) + ' = 0.' + start7(k) + '…';
      if (d === 0) {
        const k = R.i(2, 6), b = block7(k), two = R.chance(.5), ans = two ? Number(b.slice(0, 2)) : Number(b), nb = block7(k % 6 + 1);
        return { text: hint + (two ? 'Write ' + B(frac(k, 7)) + ' as a decimal. What are the first two digits after the point? Type the two digits as one number.' : 'What 6-digit block repeats in the decimal for ' + B(frac(k, 7)) + '?'), ans,
          how: ['Every seventh goes round the same circle: 1, 4, 2, 8, 5, 7.', startLine(k) + '.',
            'Go round the circle from ' + start7(k) + ': 0.' + b + '…, so ' + (two ? 'the first two digits are ' : 'the block is ') + B(two ? b.slice(0, 2) : b) + '.'],
          steps: [st('What is ' + B(10 * k + ' ÷ 7') + ', without the leftover?', start7(k)), st('Start the circle 1, 4, 2, 8, 5, 7 at ' + start7(k) + '. ' + (two ? 'What are the first two digits? Type the two digits as one number.' : 'What is the 6-digit block?'), ans)],
          traps: TR([tr(two ? 14 : 142857, 'f_sevenths', 'That is 1/7. For ' + k + '/7 start the circle at a different digit.'),
            tr(two ? Number(nb.slice(0, 2)) : Number(nb), 'f_sevenths', 'Check the start: ' + 10 * k + ' ÷ 7 is ' + start7(k) + ' and a bit.')]) };
      }
      const isD2 = d === 2, w = isD2 ? R.i(1, 8) : 0, k = R.i(2, 6), N = 7 * w + k, b = block7(k);
      if (isD2 && R.chance(.5)) {
        return { text: hint + 'What 6-digit block repeats in the decimal for ' + B(frac(N, 7)) + '?', ans: Number(b),
          how: [N + ' ÷ 7 = ' + w + ' r ' + k + ', so ' + frac(N, 7) + ' is ' + w + ' and ' + frac(k, 7) + '.',
            'For ' + frac(k, 7) + ': ' + 10 * k + ' ÷ 7 is ' + start7(k) + ' and a bit, so start the circle 1, 4, 2, 8, 5, 7 at ' + start7(k) + '.',
            'So ' + frac(N, 7) + ' = ' + w + '.' + b + '…, and the block is ' + B(b) + '.'],
          steps: [st('What is the leftover when ' + B(N) + ' is divided by 7?', k), st('What 6-digit block repeats in the decimal for ' + B(frac(k, 7)) + '?', Number(b))],
          traps: TR([tr(142857, 'f_sevenths', 'That is the block of 1/7. Start the circle where ' + k + '/7 starts.'),
            w <= 6 && w !== k ? tr(Number(block7(w)), 'f_sevenths', 'Use the leftover ' + k + ', not the whole number ' + w + '.') : null]) };
      }
      const n = R.i(7, 60), r = n % 6, dig = Number(b[(r + 5) % 6]), q = Math.floor(n / 6), F = isD2 ? frac(N, 7) : frac(k, 7), nth = r ? ord(r) : '6th';
      const how = [];
      if (isD2) how.push(N + ' ÷ 7 = ' + w + ' r ' + k + ', so after the point ' + F + ' has the same digits as ' + frac(k, 7) + '.');
      how.push(startLine(k) + ', and the block is ' + b + '.', 'The block has 6 digits: ' + n + ' ÷ 6 = ' + q + ' r ' + r + '.',
        r === 0 ? 'No leftover: the last digit of the block, ' + B(dig) + '.' : 'Leftover ' + r + ': the ' + ord(r) + ' digit of ' + b + ', which is ' + B(dig) + '.');
      return { text: hint + 'Write ' + B(F) + ' as a decimal. What is the ' + B(ord(n)) + ' digit after the point?', ans: dig, how,
        steps: [st('What 6-digit block repeats in the decimal for ' + B(frac(k, 7)) + '?', Number(b)), st('What is the leftover when ' + B(n) + ' is divided by 6?', r), st(F + ' = ' + B((isD2 ? w : 0) + '.' + b + ' ' + b + '…') + ' What is the ' + B(ord(n)) + ' digit after the point?', dig)],
        traps: TR([tr(Number(CYC[(r + 5) % 6]), 'f_sevenths', 'That digit comes from 1/7. ' + k + '/7 starts the circle at ' + start7(k) + '.'),
          tr(Number(b[r % 6]), 'p_cycle', 'Leftover ' + r + ' means the ' + nth + ' digit of the block. Count again.'), tr(Number(b[(r + 4) % 6]), 'p_cycle', 'Count from the first digit of the block: leftover ' + r + ' means the ' + nth + ' digit.')]) };
    } },
]));

/* ======================= Powers, Roots & Logs ======================= */
const cubeEnd = [0, 1, 8, 7, 4, 5, 6, 3, 2, 9];                                 /* last digit of a cube -> last digit of its root */
const sqEnd = { 1: [1, 9], 4: [2, 8], 9: [3, 7], 6: [4, 6] };                   /* last digit of a square -> the two possible root endings */
const oneDigit = x => { const e = String(x).length - 1, p = Math.pow(10, e), L = Math.round(x / p); return L === 10 ? { L: 1, z: e + 1 } : { L, z: e }; };
C.defs(ex([
  { id: 'w_pow2', s: 'pow', g: 6, title: 'Powers of 2 up to 1,024', pre: ['m_x4x8'],
    tip: '2, 4, 8, 16, 32, 64, 128, 256, 512, 1,024: each one doubles. 2¹⁰ = 1,024 is about 1,000, so 2²⁰ is about a million and 2²³ is about 8 million.',
    gen(d, R) {
      const P = e => Math.pow(2, e);
      if (d === 0) {
        const n = R.i(3, 10), v = P(n), chain = []; for (let i = 1; i <= n; i++) chain.push(num(P(i)));
        if (R.chance(.5)) return { text: B(pw(2, '?') + ' = ' + num(v)) + '. What is the power?', ans: n,
          how: ['Double from 2 and count: ' + chain.join(' → ') + '.', num(v) + ' is number ' + n + ' in the list, so ' + pw(2, n) + ' = ' + num(v) + ' and the power is ' + B(n) + '.'],
          steps: [st('Keep doubling: 2, 4, 8… How many numbers are in the list when you reach ' + B(num(v)) + '?', n)],
          traps: TR([tr(v / 2, 'w_exp', 'The power is how many 2s are multiplied, not half the number.'), tr(n - 1, 'w_pow2', 'Count again: 2 is ' + pw(2, 1) + ', 4 is ' + pw(2, 2) + ', 8 is ' + pw(2, 3) + '.'),
            tr(n + 1, 'w_pow2', 'Count again: 2 is ' + pw(2, 1) + ', 4 is ' + pw(2, 2) + ', 8 is ' + pw(2, 3) + '.')]) };
        return { text: 'What is ' + B(pw(2, n)) + '?', ans: v,
          how: [pw(2, n) + ' is ' + n + ' twos multiplied: start at 2 and double ' + (n - 1) + ' times.', chain.join(' → ') + ', so ' + pw(2, n) + ' = ' + B(num(v)) + '.'],
          steps: n > 5 ? [st(B(pw(2, 5)) + ' = ?', 32), st('Double 32 ' + (n - 5 === 1 ? 'once' : (n - 5) + ' times') + '. What is ' + B(pw(2, n)) + '?', v)] : [st(B(pw(2, n - 1)) + ' = ?', P(n - 1)), st('Double it: ' + B('2 × ' + P(n - 1)) + ' = ?', v)],
          traps: TR([tr(2 * n, 'w_exp', pw(2, n) + ' means ' + n + ' twos multiplied, not 2 × ' + n + '.'), tr(P(n - 1), 'w_pow2', 'Count the doublings: ' + pw(2, n) + ' has ' + n + ' twos.'), tr(P(n + 1), 'w_pow2', 'Count the doublings: ' + pw(2, n) + ' has ' + n + ' twos.')]) };
      }
      if (d === 1) {
        const n = R.i(11, 16), e = n - 10, v = P(n), m = P(e);
        if (R.chance(.5)) return { text: 'Start from ' + pw(2, 10) + ' = 1,024. What is ' + B(pw(2, n)) + '?', ans: v,
          how: [pw(2, n) + ' = ' + pw(2, 10) + ' × ' + pw(2, e) + ', because ' + n + ' = 10 + ' + e + '.', '1,024 × ' + m + ' = ' + B(num(v)) + '.'],
          steps: [st(B(pw(2, e)) + ' = ?', m), st(B('1,024 × ' + m) + ' = ?', v)],
          traps: TR([tr(1000 * m, 'w_pow2', '1,024 is about 1,000, but this asks for the exact value.'), tr(1024 * e, 'w_exp', pw(2, e) + ' is ' + m + ', not ' + e + '.'), tr(v / 2, 'w_pow2', 'Check the power: ' + n + ' = 10 + ' + e + '.')]) };
        return { text: 'Use ' + pw(2, 10) + ' = 1,024. ' + B(pw(2, '?') + ' = ' + num(v)) + '. What is the power?', ans: n,
          how: [num(v) + ' ÷ 1,024 = ' + m + ', and ' + m + ' = ' + pw(2, e) + '.', 'So ' + num(v) + ' = ' + pw(2, 10) + ' × ' + pw(2, e) + ' = ' + pw(2, n) + ': the power is ' + B(n) + '.'],
          steps: [st(B(num(v) + ' ÷ 1,024') + ' = ?', m), st(B(m) + ' is 2 to what power?', e), st(num(v) + ' = ' + pw(2, 10) + ' × ' + pw(2, e) + '. So 2 to what power is ' + B(num(v)) + '?', n)],
          traps: TR([tr(10 * e, 'w_rules', 'Multiplying powers adds the powers: 10 + ' + e + ', not 10 × ' + e + '.'), tr(e, 'w_pow2', 'That is the power for ' + m + '. Add the 10 from 1,024.'), tr(n + 1, 'w_pow2', 'Check: ' + num(v) + ' ÷ 1,024 = ' + m + '.')]) };
      }
      const n = R.i(13, 39); if (n % 10 === 0) return null;
      const q = Math.floor(n / 10), r = n % 10, unit = ['thousand', 'million', 'billion'][q - 1], ans = P(r), tens = Array(q).fill(pw(2, 10)).join(' × ');
      return { text: 'Use ' + pw(2, 10) + ' ≈ 1,000. About how many ' + unit + ' is ' + B(pw(2, n)) + '?', ans,
        how: [n + ' = ' + Array(q).fill(10).join(' + ') + ' + ' + r + ', so ' + pw(2, n) + ' = ' + tens + ' × ' + pw(2, r) + '.',
          'Each ' + pw(2, 10) + ' is about 1,000, so ' + tens + ' is about one ' + unit + '.', pw(2, r) + ' = ' + P(r) + ', so ' + pw(2, n) + ' is about ' + B(P(r)) + ' ' + unit + '.'],
        steps: [st('Each ' + pw(2, 10) + ' is about 1,000. How many 10s fit in ' + B(n) + '?', q), st(n + ' = ' + Array(q).fill(10).join(' + ') + ' + ' + r + '. What is ' + B(pw(2, r)) + '?', P(r))],
        traps: TR([tr(P(r) * 1000, 'w_pow2', 'Answer in ' + unit + 's: ' + tens + ' is already about one ' + unit + '.'), tr(2 * r, 'w_exp', pw(2, r) + ' is ' + r + ' twos multiplied, not 2 × ' + r + '.'),
          tr(P(r + 1), 'w_pow2', 'Check ' + pw(2, r) + ' by doubling from 2.')]) };
    } },

  { id: 'w_sqrt4', s: 'pow', g: 7, title: 'Square roots of 4-digit squares', pre: ['m_sq5'],
    tip: '√5,329: it ends in 9, so the root ends in 3 or 7. 53 is between 7² = 49 and 8² = 64, so the root is in the 70s. 75² = 5,625 is too big, so it is 73.',
    gen(d, R) {
      const n = d === 2 ? R.i(101, 199) : R.i(32, 99); if (n % 10 === 0 || n % 10 === 5) return null;
      const N = n * n, Ld = N % 10, [c1, c2] = sqEnd[Ld], front = Math.floor(N / 100), t = Math.floor(n / 10), mid = 10 * t + 5, M2 = mid * mid, other = n % 10 === c1 ? 10 * t + c2 : 10 * t + c1;
      return { text: (d === 0 ? num(N) + ' ends in ' + Ld + ', so its square root ends in ' + c1 + ' or ' + c2 + '. ' : '') + 'What is ' + B(rt(num(N))) + '?', ans: n,
        how: ['It ends in ' + Ld + ', so the root ends in ' + c1 + ' or ' + c2 + ' (' + sq(c1) + ' = ' + c1 * c1 + ' and ' + sq(c2) + ' = ' + c2 * c2 + ').',
          'Drop the last two digits: ' + front + '. ' + sq(t) + ' = ' + num(t * t) + ' and ' + sq(t + 1) + ' = ' + num((t + 1) * (t + 1)) + ', so the root is between ' + 10 * t + ' and ' + 10 * (t + 1) + '.',
          sq(mid) + ' = ' + num(M2) + ' is ' + (N < M2 ? 'more' : 'less') + ' than ' + num(N) + ', so take the ' + (N < M2 ? 'smaller' : 'bigger') + ' choice: ' + B(n) + '.'],
        steps: [st('Drop the last two digits of ' + B(num(N)) + '. Which whole number squared is closest to ' + front + ' without going over?', t), st(B(sq(mid)) + ' = ?', M2), st('The root is ' + (10 * t + c1) + ' or ' + (10 * t + c2) + '. ' + sq(mid) + ' = ' + num(M2) + ' is ' + (N < M2 ? 'more' : 'less') + ' than ' + num(N) + '. What is ' + B(rt(num(N))) + '?', n)],
        traps: TR([tr(other, 'w_sqrt4', 'Both ' + c1 + ' and ' + c2 + ' fit the last digit. Compare with ' + sq(mid) + ' = ' + num(M2) + ' to choose.'),
          tr(10 * (t + 1) + n % 10, 'w_sqrt4', 'Check the range: ' + sq(t + 1) + ' = ' + num((t + 1) * (t + 1)) + ' is more than ' + front + '.'), tr(N % 2 ? null : N / 2, 'w_roots', 'A square root is not half: which number times itself makes ' + num(N) + '?')]) };
    } },

  { id: 'w_cbrt', s: 'pow', g: 8, title: 'Cube roots of big cubes', pre: ['fa_units'],
    tip: 'Cube endings: 2 and 8 swap, 3 and 7 swap, the rest stay. ∛148,877 ends in 7, so the root ends in 3. Drop the last three digits: 148 is between 5³ = 125 and 6³ = 216, so it is 53.',
    gen(d, R) {
      const n = d === 0 ? R.i(11, 29) : d === 1 ? R.i(21, 59) : R.i(41, 99); if (n % 10 === 0) return null;
      const N = n * n * n, Ld = N % 10, o = cubeEnd[Ld], front = Math.floor(N / 1000), t = Math.floor(n / 10), c = v => v * v * v;
      return { text: 'What is ' + B(rt(num(N), 3)) + '?', ans: n,
        how: ['It ends in ' + Ld + ', so the root ends in ' + o + ' (' + pw(o, 3) + ' = ' + c(o) + ' ends in ' + Ld + ').',
          'Drop the last three digits: ' + num(front) + '. It is between ' + pw(t, 3) + ' = ' + num(c(t)) + ' and ' + pw(t + 1, 3) + ' = ' + num(c(t + 1)) + ', so the tens digit is ' + t + '.',
          'So ' + rt(num(N), 3) + ' = ' + B(n) + '.'],
        steps: [st('A cube ends in ' + Ld + '. What digit does its cube root end in?', o), st('Drop the last three digits of ' + num(N) + '. Which whole number cubed is closest to ' + B(num(front)) + ' without going over?', t), st('Write ' + t + ', then ' + o + '. What is ' + B(rt(num(N), 3)) + '?', n)],
        traps: TR([Ld !== o ? tr(10 * t + Ld, 'w_cbrt', 'Cubes swap 2 and 8, and 3 and 7: a cube ending in ' + Ld + ' has a root ending in ' + o + '.') : null,
          tr(10 * (t + 1) + o, 'w_cbrt', 'Check the tens: ' + pw(t + 1, 3) + ' = ' + num(c(t + 1)) + ' is more than ' + num(front) + '.'),
          t > 1 ? tr(10 * (t - 1) + o, 'w_cbrt', 'Check the tens: ' + pw(t, 3) + ' = ' + num(c(t)) + ' still fits under ' + num(front) + '.') : null]) };
    } },

  { id: 'w_fermi', s: 'pow', g: 8, title: 'Big estimates: about 10 to what?', pre: ['m_est'],
    tip: 'Round each number to one digit, multiply the front digits, and count the zeros. Seconds in a year: 60 × 60 × 24 × 365 ≈ 60 × 60 × 20 × 400 = 28,800,000 ≈ 3 × 10⁷. The power is 7.',
    gen(d, R) {
      let f, parts;
      if (d === 0) { f = [R.i(12, 95), R.i(110, 990)]; parts = R.chance(.5) ? ['A stadium has ', ' rows with ', ' seats in each row. Estimate the number of seats.'] : ['Estimate ', ' × ', '.']; }
      else if (d === 1) {
        const kind = R.i(0, 2);
        if (kind === 0) { f = [R.i(150, 1900), R.i(6, 45), R.i(80, 450)]; parts = ['A school has ', ' students. Each student reads ', ' books a year, and each book has ', ' pages. Estimate the number of pages the students read in a year.']; }
        else if (kind === 1) { f = [R.i(12000, 950000), R.i(90, 400), R.i(7, 60)]; parts = ['A city has ', ' people. Each person uses ', ' liters of water a day. Estimate the liters of water the city uses in ', ' days.']; }
        else { f = [R.i(12, 95), R.i(110, 990), R.i(12, 95)]; parts = ['Estimate ', ' × ', ' × ', '.']; }
      } else if (R.chance(.5)) { f = [R.i(62, 95), 60, 24, R.i(12, 365)]; parts = ['A heart beats about ', ' times a minute. There are ', ' minutes in an hour and ', ' hours in a day. Estimate how many times the heart beats in ', ' days.']; }
      else { f = [R.i(12, 95), R.i(110, 990), R.i(1100, 9800), R.i(12, 95)]; parts = ['Estimate ', ' × ', ' × ', ' × ', '.']; }
      const rs = f.map(oneDigit), Ls = rs.map(x => x.L), zs = rs.map(x => x.z), fp = Ls.reduce((a, b) => a * b, 1), Z = total(zs), len = String(fp).length, k = len - 1 + Z;
      const lead = num(fp / Math.pow(10, len - 1)), text = parts[0] + f.map((x, i) => B(num(x)) + parts[i + 1]).join('');
      return { text: text + ' Round each number to one digit, multiply, and write the answer in scientific notation. What is the power of 10?', ans: k,
        how: ['Round each number to one digit: ' + f.map((x, i) => num(x) + ' → ' + num(rs[i].L * Math.pow(10, rs[i].z))).join(', ') + '.',
          'Front digits: ' + Ls.join(' × ') + ' = ' + fp + '. Zeros: ' + zs.join(' + ') + ' = ' + Z + '.',
          fp + ' with ' + Z + ' zeros is ' + lead + ' × ' + pw(10, k) + ' (one digit before the point), so the power is ' + B(k) + '.'],
        steps: [st('Multiply the front digits: ' + B(Ls.join(' × ')) + ' = ?', fp), st('The rounded numbers are ' + rs.slice(0, -1).map(x => num(x.L * Math.pow(10, x.z))).join(', ') + ' and ' + num(rs[rs.length - 1].L * Math.pow(10, rs[rs.length - 1].z)) + '. How many zeros do they have in all?', Z), st(num(fp) + ' with ' + Z + ' zeros is ' + lead + ' × 10 to what power?', k)],
        traps: TR([tr(Z, 'w_fermi', fp + ' has ' + len + ' digits, so it adds ' + (len - 1) + ' more ' + (len === 2 ? 'place' : 'places') + ' to the zeros.'),
          tr(k + 1, 'w_sci', 'Count the places after the first digit, not all the digits.'), tr(k - 1, 'w_sci', 'Count every place after the first digit, the zeros too.')]) };
    } },
]));

/* ======================= Patterns ======================= */
C.defs(ex([
  { id: 'p_reverse', s: 'pat', g: 5, title: 'Reverse and take away: the 99s', pre: ['m_x99'],
    tip: 'A 3-digit number take away its reverse is always 99 × (first digit − last digit). 852 − 258: 8 − 2 = 6, so 99 × 6 = 594. With 2 digits it is 9 × the gap: 72 − 27 = 45.',
    gen(d, R) {
      if (d === 0) {
        const a = R.i(2, 9), b = R.i(1, a - 1), N = 10 * a + b, Rv = 10 * b + a, k = a - b, ans = 9 * k;
        return { text: 'What is ' + B(N + M + Rv) + '?', ans,
          how: ['The digits just swap places, so the answer is 9 × (' + a + M + b + ').', a + M + b + ' = ' + k + ', and 9 × ' + k + ' = ' + B(ans) + '.'],
          steps: [st(B(a + M + b) + ' = ?', k), st(B('9 × ' + k) + ' = ?', ans)],
          traps: TR([tr(digitGap(N, Rv), 'a_borrow', 'In the ones you took the smaller digit from the bigger one. Use the trick: 9 × ' + k + '.'), tr(10 * k, 'p_reverse', 'With 2 digits it is 9 × the gap, not 10 × the gap.'), tr(11 * k, 'p_reverse', 'With 2 digits it is 9 × the gap.')]) };
      }
      if (d === 2 && R.chance(.5)) {
        const k = R.i(2, 8), D = 99 * k;
        return { text: 'A 3-digit number minus the same number written backward is ' + B(D) + '. What is the number’s first digit minus its last digit?', ans: k,
          how: ['The difference is always 99 × (first − last).', D + ' = ' + 100 * k + M + k + ' = 99 × ' + k + ', so first − last = ' + B(k) + '.'],
          steps: [st('Round ' + B(D) + ' up to the next hundred.', 100 * k), st('How many hundreds are in ' + B(100 * k) + '?', k)],
          traps: TR([tr(11 * k, 'p_reverse', 'For 3 digits divide by 99, not by 9.'), tr(k + 1, 'm_x99', 'Check: 99 × ' + (k + 1) + ' = ' + 99 * (k + 1) + '.'), tr(k - 1, 'm_x99', 'Check: 99 × ' + (k - 1) + ' = ' + 99 * (k - 1) + '.')]) };
      }
      const a = R.i(2, 9), c = R.i(1, a - 1), b = R.i(0, 9), N = 100 * a + 10 * b + c, Rv = 100 * c + 10 * b + a, k = a - c, ans = 99 * k;
      if (d === 2 && k < 4) return null;
      return { text: 'What is ' + B(N + M + Rv) + '?', ans,
        how: ['The middle digit ' + b + ' cancels, so the answer is 99 × (' + a + M + c + ').', a + M + c + ' = ' + k + ', and 99 × ' + k + ' = ' + 100 * k + M + k + ' = ' + B(ans) + '.'],
        steps: [st(B(a + M + c) + ' = ?', k), st(B('99 × ' + k) + ' = ?', ans)],
        traps: TR([tr(digitGap(N, Rv), 'a_borrow', 'In some places you took the smaller digit from the bigger one. Use the trick: 99 × ' + k + '.'),
          tr(100 * k, 'm_x99', '99 is 1 less than 100, so take one ' + k + ' away.'), tr(9 * k, 'p_reverse', 'With 3 digits the multiplier is 99, not 9.')]) };
    } },

  { id: 'p_evensum', s: 'pat', g: 6, title: 'Even numbers add to n × (n + 1)', pre: ['m_breakapart'],
    tip: '2 + 4 + 6 + … + 2n = n × (n + 1). 2 + 4 + … + 20: there are 10 even numbers, so 10 × 11 = 110. It is double 1 + 2 + … + 10.',
    gen(d, R) {
      const S = n => n * (n + 1);
      if (d < 2) {
        const n = d === 0 ? R.i(4, 15) : R.i(16, 50), E = 2 * n, ans = S(n);
        return { text: 'What is ' + B('2 + 4 + 6 + … + ' + E) + '?', ans,
          how: ['From 2 to ' + E + ' there are ' + E + ' ÷ 2 = ' + n + ' even numbers.', 'They add to ' + n + ' × ' + (n + 1) + ' = ' + B(num(ans)) + ' (double 1 + 2 + … + ' + n + ').'],
          steps: [st('How many even numbers are there from 2 to ' + B(E) + '?', n), st(B(n + ' × ' + (n + 1)) + ' = ?', ans)],
          traps: TR([tr(n * n, 'p_oddsum', n + ' × ' + n + ' is the total of the first ' + n + ' odd numbers. Evens give one more ' + n + '.'),
            tr(S(n) / 2, 'p_gauss', 'That adds 1 to ' + n + '. Each even number is double, so double it.'), tr(E * (E + 1) / 2, 'p_gauss', 'That adds every number up to ' + E + ', odd ones too.')]) };
      }
      if (R.chance(.5)) {
        const a = R.i(4, 20), bn = R.i(a + 8, 60), s0 = 2 * a, E = 2 * bn, top = S(bn), low = S(a - 1), ans = top - low;
        return { text: 'What is ' + B(s0 + ' + ' + (s0 + 2) + ' + … + ' + E) + '?', ans,
          how: ['2 + 4 + … + ' + E + ' = ' + bn + ' × ' + (bn + 1) + ' = ' + num(top) + '.', 'Take away 2 + 4 + … + ' + (s0 - 2) + ' = ' + (a - 1) + ' × ' + a + ' = ' + num(low) + '.',
            num(top) + M + num(low) + ' = ' + B(num(ans)) + '.'],
          steps: [st(B(bn + ' × ' + (bn + 1)) + ' = ?', top), st(B((a - 1) + ' × ' + a) + ' = ?', low), st(B(num(top) + M + num(low)) + ' = ?', ans)],
          traps: TR([tr(top - S(a), 'p_evensum', 'Take away only the even numbers below ' + s0 + ': up to ' + (s0 - 2) + '.'), tr(top, 'p_evensum', 'Take away the even numbers before ' + s0 + '.')]) };
      }
      const n = R.i(8, 40), Sn = S(n);
      return { text: B('2 + 4 + 6 + … + ?') + ' adds up to ' + B(num(Sn)) + '. What is the last number?', ans: 2 * n,
        how: ['The total is n × (n + 1), where n is how many even numbers there are.', 'Two numbers in a row that multiply to ' + num(Sn) + ': ' + n + ' × ' + (n + 1) + '. So n = ' + n + ', and the last even number is 2 × ' + n + ' = ' + B(2 * n) + '.'],
        steps: [st('Which number n gives n × (n + 1) = ' + B(num(Sn)) + '?', n), st(B('2 × ' + n) + ' = ?', 2 * n)],
        traps: TR([tr(n, 'p_evensum', 'That is how many even numbers there are. The last one is double that.'), tr(2 * (n + 1), 'p_evensum', 'In n × (n + 1), n is the smaller of the two numbers.')]) };
    } },
]));

/* ======================= Measuring ======================= */
C.defs(ex([
  { id: 'g_temp', s: 'meas', g: 6, title: 'Celsius to Fahrenheit, fast and exact', pre: ['f_of'],
    tip: 'Quick rule: double the °C and add 30. 20 °C → 40 + 30 = 70 °F (exact is 68). Exact rule: × 9/5, then + 32. Going back, undo in reverse: take away, then halve (or × 5/9).',
    gen(d, R) {
      if (d === 0) {
        const c = R.i(1, 40), ans = 2 * c + 30;
        return { text: 'Quick rule: double the °C, then add 30. About how many °F is ' + B(c + ' °C') + '?', ans, unit: '°F',
          how: ['Double ' + c + ': ' + 2 * c + '.', 2 * c + ' + 30 = ' + B(ans) + ' °F (close to the exact ' + num(c * 9 / 5 + 32) + ' °F).'],
          steps: [st(B('2 × ' + c) + ' = ?', 2 * c), st(B(2 * c + ' + 30') + ' = ?', ans)],
          traps: TR([tr(2 * c, 'g_temp', 'Now add 30.'), tr(c + 30, 'g_temp', 'Double first, then add 30.'), tr(2 * (c + 30), 'x_order', 'Double the °C first, then add 30.')]) };
      }
      if (d === 1) {
        const c = 5 * R.i(1, 20), f9 = c / 5 * 9, ans = f9 + 32;
        return { text: 'Exact rule: multiply the °C by 9/5, then add 32. What is ' + B(c + ' °C') + ' in °F?', ans, unit: '°F',
          how: ['× 9/5 means ÷ 5, then × 9: ' + c + ' ÷ 5 = ' + c / 5 + ', and ' + c / 5 + ' × 9 = ' + f9 + '.', f9 + ' + 32 = ' + B(ans) + ' °F (the quick rule says ' + (2 * c + 30) + ').'],
          steps: [st(B(c + ' ÷ 5') + ' = ?', c / 5), st(B(c / 5 + ' × 9') + ' = ?', f9), st(B(f9 + ' + 32') + ' = ?', ans)],
          traps: TR([tr(2 * c + 30, 'g_temp', 'That is the quick estimate. This one asks for the exact answer.'), tr(f9, 'g_temp', 'Now add 32.'), tr((c + 32) * 9 / 5, 'x_order', 'Multiply by 9/5 first, then add 32.')]) };
      }
      if (R.chance(.5)) {
        const k = R.i(1, 12), F = 32 + 9 * k, ans = 5 * k;
        return { text: 'Exact rule backward: take 32 away from the °F, then multiply by 5/9. What is ' + B(F + ' °F') + ' in °C?', ans, unit: '°C',
          how: ['Undo the steps in reverse order. First take away 32: ' + F + M + '32 = ' + 9 * k + '.', '× 5/9 means ÷ 9, then × 5: ' + 9 * k + ' ÷ 9 = ' + k + ', and ' + k + ' × 5 = ' + B(ans) + ' °C.'],
          steps: [st(B(F + M + '32') + ' = ?', 9 * k), st(B(9 * k + ' ÷ 9') + ' = ?', k), st(B(k + ' × 5') + ' = ?', ans)],
          traps: TR([tr(9 * k, 'g_temp', 'Now × 5/9.'), tr((F - 30) / 2, 'g_temp', 'That is the quick estimate. This one asks for the exact answer.'), tr(9 * k * 9 / 5, 'g_temp', 'Going back, use 5/9, the flip of 9/5.')]) };
      }
      const F = 2 * R.i(20, 55), ans = (F - 30) / 2;
      return { text: 'Quick rule backward: take 30 away from the °F, then halve what is left. About how many °C is ' + B(F + ' °F') + '?', ans, unit: '°C',
        how: ['Undo the quick rule in reverse order. Take away 30: ' + F + M + '30 = ' + (F - 30) + '.', 'Then halve it: half of ' + (F - 30) + ' is ' + B(ans) + ' °C.'],
        steps: [st(B(F + M + '30') + ' = ?', F - 30), st('What is half of ' + B(F - 30) + '?', ans)],
        traps: TR([tr(F - 30, 'g_temp', 'Now halve it.'), F / 2 - 30 > 0 ? tr(F / 2 - 30, 'x_order', 'Undo in reverse order: take away 30 first, then halve.') : null, tr(F / 2, 'g_temp', 'Take away 30 before you halve.')]) };
    } },
]));
})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
