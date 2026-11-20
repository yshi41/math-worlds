/* a1.js: Number Sense (grades 2 to 4), Adding & Taking Away (grades 2 to 4), Patterns (grades 2 to 5).
   Ported from the old curriculum.js lessons and the coach.js mistake checks: every problem carries its own worked
   shortcut (how), break-down steps that use the same numbers, and the likely wrong answers (traps), each pointing
   at the concept that mistake shows a gap in. */
(function (C) {
'use strict';
const { B, num, MINUS, sum, plural, ord, seqHTML, hopsSVG, tenFrame, blocksSVG, chartSVG, roundLine, ioTable, numLineSVG, stackHTML } = C;
const N = num;
const qq = s => B(s + ' = ?');
const add = (a, b) => N(a) + ' + ' + N(b);
const sub = (a, b) => N(a) + ' ' + MINUS + ' ' + N(b);
const S = (text, ans) => ({ text, ans });
const tp = (v, c, why) => ({ v, c, why });
/* keep traps that are whole, not negative and not repeated */
function traps(list) { const seen = new Set(); return list.filter(t => t && t.v != null && isFinite(t.v) && t.v >= 0 && t.v % 1 === 0 && !seen.has(t.v) && seen.add(t.v)); }
/* the "smaller digit from the bigger digit in each place" mistake */
function colSub(a, b) { const A = String(a).split('').reverse(), Bs = String(b).split('').reverse(); let out = ''; for (let i = 0; i < A.length; i++) out = Math.abs(+A[i] - +(Bs[i] || 0)) + out; return +out; }
const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
const ONE = ['one', 'ten', 'hundred', 'thousand', 'ten thousand', 'hundred thousand'];
const digitsOf = v => String(v).split('').map(Number);
const distinct = v => new Set(String(v)).size === String(v).length;
/* count up from b to a: to the next ten, the next hundred, whole hundreds, whole tens, then the rest */
function countUp(b, a) {
  const hops = []; let at = b;
  const go = t => { if (t > at && t <= a) { hops.push([at, t]); at = t; } };
  if (at % 10) go(Math.ceil(at / 10) * 10);
  if (a >= 100) { if (Math.floor(a / 100) > Math.floor(at / 100) && at % 100) go(Math.ceil(at / 100) * 100); go(Math.floor(a / 100) * 100); }
  else go(Math.floor(a / 10) * 10);
  go(a);
  return hops;
}
function countUpProblem(a, b, d) {
  const ans = a - b, hops = countUp(b, a), sizes = hops.map(h => h[1] - h[0]);
  const how = ['Count up from ' + N(b) + ' to ' + N(a) + ' in friendly hops.', hops.map(h => N(h[0]) + ' → ' + N(h[1]) + ' is ' + N(h[1] - h[0])).join(', ') + '.',
    'Add the hops: ' + sizes.map(N).join(' + ') + ' = ' + B(N(ans)) + '.'];
  const steps = hops.slice(0, 3).map(h => S('From ' + B(N(h[0])) + ' up to ' + B(N(h[1])) + ' is how much?', h[1] - h[0]));
  if (sizes.length > 1) steps.push(S(qq(sizes.map(N).join(' + ')), ans));
  const t = [String(a).length === String(b).length ? tp(colSub(a, b), 'a_borrow', 'Taking the smaller digit from the bigger one in each place does not work here. Count up from ' + N(b) + ' instead.') : null,
    tp(ans + 10, 'a_countup', 'Check the hops of ten: add up each hop carefully.'), tp(ans - 10, 'a_countup', 'Check the hops of ten: did you miss one?')];
  if (b % 10) t.push(tp(ans - 1, 'a_bonds10', 'Check the first hop: from ' + N(b) + ' up to the next ten.'), tp(ans + 1, 'a_bonds10', 'Check the first hop: from ' + N(b) + ' up to the next ten.'));
  if (d === 2) t.push(tp(ans + 100, 'a_countup', 'Check the hops of a hundred.'), tp(ans - 100, 'a_countup', 'Check the hops of a hundred.'));
  return { text: qq(sub(a, b)), ans, how, steps, traps: traps(t), howVis: hopsSVG(b, sizes) };
}
/* round and adjust: a + b or a − b, using the friendly number F close to b */
function compProblem(a, b, op, F, cid) {
  const plus = op === '+', k = F - b, r1 = plus ? a + F : a - F, ans = plus ? a + b : a - b, o = plus ? add : sub;
  let how, fix;
  if (plus && k > 0) { how = ['Adding ' + N(b) + '? Add ' + N(F) + ' instead: ' + add(a, F) + ' = ' + N(r1) + '.', 'You added ' + k + ' too many, so take ' + k + ' back: ' + sub(r1, k) + ' = ' + B(N(ans)) + '.']; fix = sub(r1, k); }
  else if (plus) { how = ['Add the friendly ' + N(F) + ' first: ' + add(a, F) + ' = ' + N(r1) + '.', N(b) + ' is ' + (-k) + ' more than ' + N(F) + ', so add ' + (-k) + ' more: ' + add(r1, -k) + ' = ' + B(N(ans)) + '.']; fix = add(r1, -k); }
  else if (k > 0) { how = ['Taking away ' + N(b) + '? Take away ' + N(F) + ' instead: ' + sub(a, F) + ' = ' + N(r1) + '.', 'You took away ' + k + ' too many, so give ' + k + ' back: ' + add(r1, k) + ' = ' + B(N(ans)) + '.']; fix = add(r1, k); }
  else { how = ['Take away the friendly ' + N(F) + ' first: ' + sub(a, F) + ' = ' + N(r1) + '.', N(b) + ' is ' + (-k) + ' more than ' + N(F) + ', so take away ' + (-k) + ' more: ' + sub(r1, -k) + ' = ' + B(N(ans)) + '.']; fix = sub(r1, -k); }
  const wrongFix = plus ? r1 + k : r1 - k;
  return { text: qq(o(a, b)), ans, how, howVis: hopsSVG(a, plus ? [F, -k] : [-F, k]),
    steps: [S(qq(o(a, F)), r1), S(qq(fix), ans)],
    traps: traps([tp(r1, cid, 'That is the answer with ' + N(F) + '. Now fix it, because ' + N(b) + ' is not ' + N(F) + '.'),
      tp(wrongFix, cid, plus ? (k > 0 ? 'You added too much, so take the extra away, do not add more.' : 'You still need to add the extra, not take it away.') : (k > 0 ? 'You took away too much, so give the extra back, do not take more.' : 'You still need to take away the extra, not give it back.')),
      tp(ans + 10, 'a_tens', 'Check the tens digit.'), tp(ans - 10, 'a_tens', 'Check the tens digit.')]) };
}
/* a same-jump sequence with one box missing */
function jumpProblem(seq, miss, cid) {
  let k = 0; while (k === miss || k + 1 === miss) k++;
  const j = seq[k + 1] - seq[k], aj = Math.abs(j), up = j > 0, ans = seq[miss], dir = up ? 'up' : 'down';
  const sh = seq.map((v, i) => i === miss ? null : v);
  const how = ['Find the jump: ' + N(seq[k]) + ' → ' + N(seq[k + 1]) + ' goes ' + dir + ' by ' + aj + '. Every jump is the same.'];
  let last;
  if (miss > 0) { const prev = seq[miss - 1]; how.push(N(prev) + ' ' + (up ? '+' : MINUS) + ' ' + aj + ' = ' + B(N(ans)) + '.'); last = S(qq(N(prev) + ' ' + (up ? '+' : MINUS) + ' ' + aj), ans); }
  else { const nx = seq[1]; how.push('The box is first, so go back one jump from ' + N(nx) + ': ' + N(nx) + ' ' + (up ? MINUS : '+') + ' ' + aj + ' = ' + B(N(ans)) + '.'); last = S(qq(N(nx) + ' ' + (up ? MINUS : '+') + ' ' + aj), ans); }
  const back = miss > 0 ? seq[miss - 1] : seq[1];
  const t = [tp(ans + aj, cid, 'One jump for each box. Check how many jumps you made.'), tp(ans - aj, cid, 'One jump for each box. Check how many jumps you made.'),
    tp(miss > 0 ? back - j : back + j, cid, 'The numbers go ' + dir + ', so keep going ' + dir + '.'),
    tp(miss > 0 ? back + (up ? 1 : -1) : back - (up ? 1 : -1), cid, 'The jump is ' + aj + ', not 1.')];
  return { text: 'What number goes in the box?', vis: seqHTML(sh), ans, how,
    steps: [S('How much does each jump go ' + dir + '? Look at ' + B(N(seq[k])) + ' and ' + B(N(seq[k + 1])) + '.', aj), last], traps: traps(t),
    key: 'jp' + seq.join(',') + '|' + miss };
}
/* skip counting by `step`: d0 from a multiple, last box; d1 a middle box; d2 off the multiples or backwards */
function skipProblem(step, d, R, cid) {
  let start, back = false, miss;
  const off = step === 100 ? R.i(1, 9) * 10 + R.i(0, 9) : R.i(1, step - 1);
  if (d === 0) { start = step * R.i(0, step === 100 ? 4 : 6); miss = 4; }
  else if (d === 1) { start = step * R.i(1, step === 100 ? 5 : 14); miss = R.i(1, 4); }
  else { back = R.chance(.5); start = back ? step * R.i(6, step === 100 ? 9 : 26) + off : step * R.i(0, step === 100 ? 5 : 20) + off; miss = R.i(0, 4); }
  const seq = []; for (let i = 0; i < 5; i++) seq.push(back ? start - i * step : start + i * step);
  if (seq.some(v => v < 0)) return null;
  return jumpProblem(seq, miss, cid);
}
/* growing dot shapes: step n has b fixed dots (a column on the left) and a rows of n dots */
function shapeSVG(a, b, steps) {
  const g = 16, H = Math.max(a, b) * g + 30; let x = 8, s = '';
  steps.forEach(n => {
    const x0 = x, w = (b ? g + 4 : 0) + n * g;
    for (let i = 0; i < b; i++) s += '<circle cx="' + (x + g / 2) + '" cy="' + (8 + i * g + g / 2) + '" r="5.5" class="dt left"/>';
    const xs = x + (b ? g + 4 : 0);
    for (let r = 0; r < a; r++) for (let c = 0; c < n; c++) s += '<circle cx="' + (xs + c * g + g / 2) + '" cy="' + (8 + r * g + g / 2) + '" r="5.5" class="dt"/>';
    s += '<text x="' + (x0 + w / 2) + '" y="' + (H - 6) + '" class="fig-small">Step ' + n + '</text>';
    x += w + 30;
  });
  return '<svg class="fig" viewBox="0 0 ' + x + ' ' + H + '" style="max-width:' + Math.min(400, x * 1.3) + 'px" aria-hidden="true">' + s + '</svg>';
}
/* rounding: v to the nearest `to` (10, 100, 1,000, 10,000) */
const UNIT = { 10: ['ten', 'ones'], 100: ['hundred', 'tens'], 1000: ['thousand', 'hundreds'], 10000: ['ten thousand', 'thousands'] };
function roundProblem(v, to, cid, vis) {
  const lo = Math.floor(v / to) * to, hi = lo + to, dg = Math.floor((v % to) / (to / 10)), up = dg >= 5, ans = up ? hi : lo, [uw, look] = UNIT[to];
  const t = [tp(up ? lo : hi, cid, up ? 'The ' + look + ' digit is ' + dg + ', which is 5 or more, so round up.' : 'The ' + look + ' digit is ' + dg + ', which is 4 or less, so round down.'),
    tp(v, cid, 'A number rounded to the nearest ' + uw + (to === 10 ? ' ends in 0.' : ' ends in ' + (String(to).length - 1) + ' zeros.'))];
  if (to >= 100) { const near = Math.round(v / (to / 10)) * (to / 10); if (near !== ans) t.push(tp(near, to === 100 ? 'n_round10' : to === 1000 ? 'n_round100' : 'n_roundbig', 'That rounds to a smaller place. For the nearest ' + uw + ', look at the ' + look + ' digit.')); }
  if (to >= 100 && dg === 4 && Math.floor((v % (to / 10)) / (to / 100)) >= 5) t.push(tp(hi, cid, 'Look only at the ' + look + ' digit. Do not round the smaller places first.'));
  if (to >= 1000) t.push(tp(lo + v % to + (up ? to : 0), 'n_roundbig', 'After rounding, every digit to the right of the ' + uw + 's place becomes 0.'));
  return { text: 'Round ' + B(N(v)) + ' to the nearest ' + B(uw) + '.', ans, vis: vis ? roundLine(lo, hi, v, to / 10) : '',
    how: [N(v) + ' is between ' + N(lo) + ' and ' + N(hi) + '.', 'Look at the ' + look + ' digit: ' + dg + '. ' + (up ? '5 or more, so round up to ' : '4 or less, so round down to ') + B(N(ans)) + '.'],
    steps: [S('Which ' + uw + ' is just below ' + B(N(v)) + '?', lo), S('What is the ' + look + ' digit of ' + B(N(v)) + '?', dg), S('Round ' + B(N(v)) + ' to the nearest ' + uw + '.', ans)],
    traps: traps(t) };
}
/* the smallest or biggest whole number that rounds to T */
function roundReverse(T, to, big, cid) {
  const half = to / 2, ans = big ? T + half - 1 : T - half, [uw] = UNIT[to];
  return { text: 'Round to the nearest ' + uw + '. What is the ' + B(big ? 'biggest' : 'smallest') + ' whole number that rounds to ' + B(N(T)) + '?', ans,
    how: ['Numbers from ' + N(T - half) + ' up to ' + N(T + half - 1) + ' round to ' + N(T) + '.',
      big ? N(T + half) + ' would round up to ' + N(T + to) + ', so the biggest is ' + B(N(ans)) + '.' : 'Halfway rounds up, so ' + N(T - half) + ' rounds up to ' + N(T) + '. The smallest is ' + B(N(ans)) + '.'],
    steps: [S('What number is halfway between ' + B(N(T - to)) + ' and ' + B(N(T)) + '?', T - half), S('What number is halfway between ' + B(N(T)) + ' and ' + B(N(T + to)) + '?', T + half), S((big ? 'Biggest' : 'Smallest') + ' number that rounds to ' + B(N(T)) + '?', ans)],
    traps: traps(big ? [tp(T + half, cid, 'Halfway rounds up, so ' + N(T + half) + ' rounds to ' + N(T + to) + '.'), tp(T + to - 1, cid, 'That is too far: past halfway it rounds up.'), tp(T, cid, 'Bigger numbers also round to ' + N(T) + '.')]
      : [tp(T - half + 1, cid, 'Halfway rounds up too, so the halfway number counts.'), tp(T - half - 1, cid, 'That is below halfway, so it rounds down.'), tp(T, cid, 'Smaller numbers also round to ' + N(T) + '.')]) };
}

/* "1 tens" → "1 ten" and so on, in every piece of text a problem shows */
const one1 = s => typeof s !== 'string' ? s : s.replace(/(^|[^\d,.])1 (ten thousand|hundred thousand|ten|one|hundred|thousand)s\b/g, (m, a, w) => a + '1 ' + w);
function polish(list) {
  return list.map(c => { const g = c.gen; c.gen = (d, R) => {
    const p = g(d, R); if (!p) return p;
    p.text = one1(p.text); if (p.hint) p.hint = one1(p.hint); p.how = (p.how || []).map(one1);
    (p.steps || []).forEach(s => { s.text = one1(s.text); }); (p.traps || []).forEach(t => { t.why = one1(t.why); });
    return p; }; return c; });
}

C.defs(polish([
/* ======================= Number Sense ======================= */
{ id: 'n_place', s: 'count', g: 2, title: 'What each digit is worth',
  tip: 'A digit is worth more the further left it is: ones, tens, hundreds. In 362 the 6 is in the tens place, so it is worth 60.',
  gen(d, R) {
    const kind = d === 0 ? R.pick(['make2', 'make2', 'worth2']) : d === 1 ? R.pick(['make3', 'worth3']) : R.pick(['manytens', 'tensall', 'mixed']);
    if (kind === 'make2') {
      const t = R.i(1, 9), o = R.i(0, 9), v = 10 * t + o, swap = R.chance(.35);
      return { text: (swap ? B(o + ' ones') + ' and ' + B(t + ' tens') : B(t + ' tens') + ' and ' + B(o + ' ones')) + ' make what number?', ans: v, vis: blocksSVG(0, t, o),
        how: ['Each ten is worth 10, so ' + t + ' tens is ' + (10 * t) + '.', (10 * t) + ' and ' + o + ' ones make ' + B(v) + '.'],
        steps: [S(B(t + ' tens') + ' = ?', 10 * t), S(qq(add(10 * t, o)), v)],
        traps: traps([tp(10 * o + t, 'n_place', 'The tens digit goes on the left and the ones digit on the right.'), tp(t + o, 'n_place', 'A ten is worth 10, so ' + t + ' tens is much more than ' + t + '.'),
          tp(v + 10, 'n_place', 'Count the tens again.'), tp(v - 10, 'n_place', 'Count the tens again.')]) };
    }
    if (kind === 'worth2') {
      let v; do { v = R.i(21, 98); } while (v % 10 === 0 || !distinct(v)); const t = Math.floor(v / 10);
      return { text: 'What is the ' + B(t) + ' in ' + B(v) + ' worth?', ans: 10 * t, vis: blocksSVG(0, t, v % 10),
        how: ['The ' + t + ' is in the tens place.', t + ' tens = ' + B(10 * t) + '.'],
        traps: traps([tp(t, 'n_place', 'That is just the digit. It sits in the tens place, so it is worth more.'), tp(100 * t, 'n_place', 'Count the places from the right: ones, then tens.'), tp(v, 'n_place', 'Just the ' + t + ', not the whole number.')]) };
    }
    if (kind === 'make3') {
      const h = R.i(1, 9), t = R.chance(.3) ? 0 : R.i(0, 9), o = R.i(1, 9), v = 100 * h + 10 * t + o;
      const parts = R.shuffle([[h, 'hundreds'], [t, 'tens'], [o, 'ones']]), listed = +parts.map(p => p[0]).join('');
      return { text: parts.map(p => B(p[0] + ' ' + p[1])).join(', ').replace(/, ([^,]*)$/, ' and $1') + ' make what number?', ans: v,
        how: [h + ' hundreds = ' + (100 * h) + ', ' + t + ' tens = ' + (10 * t) + ', ' + o + ' ones = ' + o + '.', 'Put each digit in its own place: ' + B(v) + '.'],
        steps: [S(B(h + ' hundreds') + ' = ?', 100 * h), S(qq(add(100 * h, 10 * t)), 100 * h + 10 * t), S(qq(add(100 * h + 10 * t, o)), v)],
        traps: traps([tp(listed, 'n_place', 'Put each digit in its own place, no matter what order the parts are listed in.'), t === 0 ? tp(10 * h + o, 'n_place', 'There are 0 tens, so a 0 holds the tens place.') : null,
          tp(v + 100, 'n_place', 'Check the hundreds.'), tp(100 * h + 10 * o + t, 'n_place', 'The tens digit and the ones digit got swapped.')]) };
    }
    if (kind === 'worth3') {
      let v; do { v = R.i(102, 987); } while (!distinct(v) || /0/.test(String(v))); const pos = R.i(1, 2), dg = digitsOf(v)[2 - pos], val = dg * [1, 10, 100][pos];
      return { text: 'What is the ' + B(dg) + ' in ' + B(v) + ' worth?', ans: val,
        how: ['Count the places from the right: ones, tens, hundreds. The ' + dg + ' is in the ' + PLACES[pos] + ' place.', dg + ' ' + PLACES[pos] + ' = ' + B(val) + '.'],
        steps: [S('The ' + dg + ' in ' + B(v) + ' is in the ' + PLACES[pos] + ' place. How much is ' + B('1 ' + ONE[pos]) + ' worth?', [1, 10, 100][pos]), S(B(dg + ' ' + PLACES[pos]) + ' = ?', val)],
        traps: traps([tp(dg, 'n_place', 'That is just the digit. Which place is it in?'), tp(pos === 1 ? dg * 100 : dg * 10, 'n_place', 'Count the places from the right again: ones, tens, hundreds.'), tp(dg * 1000, 'n_place', 'A 3-digit number has no thousands.')]) };
    }
    if (kind === 'manytens') {
      let t; do { t = R.i(11, 89); } while (t % 10 === 0); const a = Math.floor(t / 10) * 10, b = t % 10;
      return { text: B(t + ' tens') + ' make what number?', ans: 10 * t,
        how: ['10 tens make 100. Split ' + t + ' tens into ' + a + ' tens and ' + b + ' tens.', a + ' tens = ' + (10 * a) + ' and ' + b + ' tens = ' + (10 * b) + '. ' + add(10 * a, 10 * b) + ' = ' + B(N(10 * t)) + '.'],
        steps: [S(B(a + ' tens') + ' = ?', 10 * a), S(B(b + ' tens') + ' = ?', 10 * b), S(qq(add(10 * a, 10 * b)), 10 * t)],
        traps: traps([tp(t, 'n_place', 'Each ten is worth 10, so ' + t + ' tens is ' + t + ' tens of 10.'), tp(100 * t, 'n_times10', 'A ten is 10, not 100. Put just one 0 on the end.'), tp(10 * t + 10, 'n_place', 'Count the tens again.')]) };
    }
    if (kind === 'tensall') {
      const tt = R.i(11, 98), o = R.chance(.5) ? 0 : R.i(1, 9), v = tt * 10 + o, h = Math.floor(tt / 10), t = tt % 10;
      return { text: 'How many tens are in ' + B(v) + ' altogether?', ans: tt,
        how: ['Each hundred is 10 tens, so the hundreds hold tens too. ' + h + ' ' + plural(h, 'hundred', 'hundreds') + ' = ' + (10 * h) + ' tens.', (10 * h) + ' tens + ' + t + ' ' + plural(t, 'ten', 'tens') + ' = ' + B(tt) + ' tens' + (o ? ' (and ' + o + ' ones left over).' : '.')],
        steps: [S('How many tens are in ' + B(100 * h) + '?', 10 * h), S(qq(add(10 * h, t)), tt)],
        traps: traps([tp(t, 'n_place', 'That is just the tens digit. Each hundred is 10 more tens.'), tp(h, 'n_place', 'That counts hundreds. Count the tens: 1 hundred = 10 tens.'), tp(v, 'n_place', 'That is the whole number. How many tens fit in it?'), tp(tt + 1, 'n_place', 'Count the tens again.')]) };
    }
    const h = R.i(1, 8), tt = R.i(11, 19), v = 100 * h + 10 * tt;
    return { text: B(h + ' hundreds') + ' and ' + B(tt + ' tens') + ' make what number?', ans: v,
      how: [tt + ' tens is ' + (10 * tt) + ': 10 tens make another hundred.', add(100 * h, 10 * tt) + ' = ' + B(v) + '.'],
      steps: [S(B(tt + ' tens') + ' = ?', 10 * tt), S(qq(add(100 * h, 10 * tt)), v)],
      traps: traps([tp(100 * h + tt, 'a_regroup', tt + ' tens do not fit in the tens place. 10 tens make another hundred.'), tp(100 * h + 10 * (tt - 10), 'a_regroup', 'You kept ' + (tt - 10) + ' tens but lost the hundred that 10 tens make.'), tp(v + 100, 'n_place', 'Check the hundreds.')]) };
  } },
{ id: 'n_expand', s: 'count', g: 2, title: 'Expanded form',
  tip: 'Expanded form shows what every digit is worth: 347 = 300 + 40 + 7. A 0 in a place means none: 506 = 500 + 6.',
  gen(d, R) {
    const kind = d === 0 ? R.pick(['build', 'miss2']) : d === 1 ? R.pick(['miss3', 'zero']) : R.pick(['shuffle', 'four', 'miss4']);
    if (kind === 'build' || kind === 'shuffle') {
      const h = R.i(1, 9), t = R.i(1, 9), o = R.i(1, 9), v = 100 * h + 10 * t + o, parts = kind === 'build' ? [100 * h, 10 * t, o] : R.shuffle([100 * h, 10 * t, o]);
      if (kind === 'shuffle' && parts[0] === 100 * h && parts[1] === 10 * t) return null;
      const listed = +parts.map(p => String(p)[0]).join('');
      return { text: qq(parts.join(' + ')), ans: v,
        how: [(kind === 'shuffle' ? 'Sort the parts by size first. ' : '') + (100 * h) + ' is ' + h + ' hundreds, ' + (10 * t) + ' is ' + t + ' tens, ' + o + ' is ' + o + ' ' + plural(o, 'one', 'ones') + '.', 'Put each digit in its place: ' + B(v) + '.'],
        steps: [S(qq(add(100 * h, 10 * t)), 100 * h + 10 * t), S(qq(add(100 * h + 10 * t, o)), v)],
        traps: traps([kind === 'shuffle' ? tp(listed, 'n_place', 'Line the parts up by size, not by the order they are written.') : null, tp(h + t + o, 'n_place', 'Each part is worth its whole value, not just its first digit.'),
          tp(100 * h + 10 * o + t, 'n_place', 'The tens and ones got swapped.'), tp(v + 10, 'n_expand', 'Check the tens.')]) };
    }
    if (kind === 'miss2') {
      let v; do { v = R.i(21, 98); } while (v % 10 === 0 || !distinct(v)); const t = Math.floor(v / 10), o = v % 10;
      return { text: B(v + ' = ? + ' + o), ans: 10 * t,
        how: ['The missing part is the tens. The tens digit of ' + v + ' is ' + t + '.', t + ' tens = ' + B(10 * t) + ', so ' + v + ' = ' + (10 * t) + ' + ' + o + '.'],
        traps: traps([tp(t, 'n_place', 'The ' + t + ' is in the tens place, so it is worth ' + t + ' tens.'), tp(v - 1, 'n_expand', 'Take away just the ones.'), tp(100 * t, 'n_place', 'Count the places: ones, then tens.')]) };
    }
    if (kind === 'miss3') {
      const h = R.i(1, 9), t = R.i(1, 9), o = R.i(1, 9), v = 100 * h + 10 * t + o, pos = R.pick([1, 2]), parts = [100 * h, 10 * t, o], val = parts[2 - pos];
      const shown = parts.map(p => p === val ? '?' : p).join(' + ');
      return { text: B(v + ' = ' + shown), ans: val,
        how: ['The missing part is the ' + PLACES[pos] + '. The ' + PLACES[pos] + ' digit of ' + v + ' is ' + digitsOf(v)[2 - pos] + '.', digitsOf(v)[2 - pos] + ' ' + PLACES[pos] + ' = ' + B(val) + '.'],
        steps: [S('What digit is in the ' + PLACES[pos] + ' place of ' + B(v) + '?', digitsOf(v)[2 - pos]), S(B(digitsOf(v)[2 - pos] + ' ' + PLACES[pos]) + ' = ?', val)],
        traps: traps([tp(digitsOf(v)[2 - pos], 'n_place', 'The missing part is worth ' + digitsOf(v)[2 - pos] + ' ' + PLACES[pos] + ', not ' + digitsOf(v)[2 - pos] + '.'), tp(pos === 1 ? val * 10 : val / 10, 'n_place', 'Count the places from the right: ones, tens, hundreds.')]) };
    }
    if (kind === 'zero') {
      const h = R.i(1, 9), zt = R.chance(.6), x = R.i(1, 9), v = zt ? 100 * h + x : 100 * h + 10 * x;
      return { text: qq(zt ? add(100 * h, x) : add(100 * h, 10 * x)), ans: v,
        how: [zt ? 'There are no tens, so a 0 holds the tens place.' : 'There are no ones, so a 0 holds the ones place.', 'The number is ' + B(v) + '.'],
        steps: [S('How many hundreds?', h), S(zt ? 'How many tens?' : 'How many ones?', 0)],
        traps: traps([zt ? tp(10 * h + x, 'n_expand', 'There are no tens. A 0 in the tens place keeps the ' + h + ' in the hundreds place.') : tp(10 * h + x, 'n_expand', 'There are no ones. A 0 in the ones place keeps the ' + x + ' in the tens place.'),
          tp(+(String(100 * h) + String(zt ? x : 10 * x)), 'n_place', 'Do not write the parts side by side. The ' + x + ' goes inside ' + (100 * h) + '.'), zt ? tp(100 * h + 10 * x, 'n_place', 'The ' + x + ' is ' + x + ' ones, not ' + x + ' tens.') : tp(100 * h + x, 'n_place', 'The ' + (10 * x) + ' is ' + x + ' tens, not ' + x + ' ones.')]) };
    }
    if (kind === 'four') {
      const th = R.i(1, 9), h = R.chance(.5) ? 0 : R.i(1, 9), t = h ? 0 : R.i(1, 9), o = R.i(1, 9), v = 1000 * th + 100 * h + 10 * t + o;
      const parts = [1000 * th, 100 * h, 10 * t, o].filter(Boolean);
      return { text: qq(parts.map(N).join(' + ')), ans: v,
        how: ['Every place needs a digit: thousands, hundreds, tens, ones. ' + (h ? 'There are no tens, so put a 0 there.' : 'There are no hundreds, so put a 0 there.'), 'The number is ' + B(N(v)) + '.'],
        steps: [S('How many thousands?', th), S(h ? 'How many tens?' : 'How many hundreds?', 0), S(qq(parts.map(N).join(' + ')), v)],
        traps: traps([tp(+parts.map(p => String(p)[0]).join(''), 'n_expand', 'Every place needs a digit. Put a 0 where a place is empty.'), tp(v + 100, 'n_place', 'Check the hundreds.'), tp(1000 * th + 100 * t + 10 * o + (h ? 0 : 0), 'n_place', 'Check which place each part goes in.')]) };
    }
    const th = R.i(1, 9), h = R.i(1, 9), o = R.i(1, 9), v = 1000 * th + 100 * h + o;
    return { text: B(N(v) + ' = ' + N(1000 * th) + ' + ? + ' + o), ans: 100 * h,
      how: ['The tens digit of ' + N(v) + ' is 0, so the missing part must be the hundreds.', h + ' hundreds = ' + B(100 * h) + '.'],
      steps: [S('What digit is in the hundreds place of ' + B(N(v)) + '?', h), S(B(h + ' hundreds') + ' = ?', 100 * h)],
      traps: traps([tp(h, 'n_place', 'The ' + h + ' is in the hundreds place, so it is worth ' + h + ' hundreds.'), tp(10 * h, 'n_place', 'Count the places from the right: ones, tens, hundreds.'), tp(100 * h + o, 'n_expand', 'The ' + o + ' ones are already written in the sum.')]) };
  } },
{ id: 'n_tenmore', s: 'count', g: 2, title: '10 more, 10 less, 100 more',
  tip: '10 more or less changes only the tens digit: 47 → 57. 100 more changes only the hundreds: 352 → 452. Watch 9s: 395 + 10 = 405.',
  gen(d, R) {
    let v, k, more, cross = false;
    if (d === 2 && R.chance(.25)) {
      k = R.pick([10, 100]); more = R.chance(.5); const x = k === 10 ? R.i(21, 89) : R.i(150, 899), start = more ? x - k : x + k;
      return { text: B(k + ' ' + (more ? 'more' : 'less')) + ' than a number is ' + B(N(x)) + '. What is the number?', ans: start,
        how: [k + ' ' + (more ? 'more' : 'less') + ' than the number is ' + x + ', so the number is ' + k + ' ' + (more ? 'less' : 'more') + ' than ' + x + '.', (more ? sub(x, k) : add(x, k)) + ' = ' + B(start) + '.'],
        steps: [S(qq(more ? sub(x, k) : add(x, k)), start)],
        traps: traps([tp(more ? x + k : x - k, 'n_tenmore', 'Go the other way: the number is ' + (more ? 'smaller' : 'bigger') + ' than ' + x + ', because it is ' + k + ' ' + (more ? 'more' : 'less') + ' that makes ' + x + '.'), tp(more ? x - 1 : x + 1, 'n_place', k + ' changes the ' + (k === 10 ? 'tens' : 'hundreds') + ' digit, not the ones.')]) };
    }
    if (d === 0) { k = 10; more = R.chance(.5); v = more ? R.i(11, 89) : R.i(20, 98); }
    else if (d === 1) { k = R.pick([10, 100, 100]); more = R.chance(.5); do { v = R.i(100, 989); } while (k === 10 ? (more ? Math.floor(v / 10) % 10 === 9 : Math.floor(v / 10) % 10 === 0) : (more ? v >= 900 : v < 200)); }
    else { const c = R.i(0, 3); cross = true; if (c === 0) { k = 10; more = true; v = R.i(1, 9) * 100 + 90 + R.i(0, 9); } else if (c === 1) { k = 10; more = false; v = R.i(1, 9) * 100 + R.i(0, 9); } else if (c === 2) { k = 100; more = true; v = 900 + R.i(1, 99); } else { k = 100; more = false; v = 1000 + R.i(1, 99); } }
    const ans = more ? v + k : v - k, place = k === 10 ? 'tens' : 'hundreds', expr = more ? add(v, k) : sub(v, k);
    const text = 'What is ' + B(k + ' ' + (more ? 'more' : 'less')) + ' than ' + B(N(v)) + '?';
    if (!cross) {
      const pi = k === 10 ? 1 : 2, dg = digitsOf(v)[String(v).length - 1 - pi];
      return { text, ans, how: ['Only the ' + place + ' digit changes. The other digits stay the same.', 'The ' + place + ' digit goes from ' + dg + ' to ' + (more ? dg + 1 : dg - 1) + ': ' + expr + ' = ' + B(N(ans)) + '.'],
        steps: [S('What is the ' + place + ' digit of ' + B(N(v)) + '?', dg), S(qq(more ? add(dg, 1) : sub(dg, 1)), more ? dg + 1 : dg - 1)],
        traps: traps([tp(more ? v + k / 10 : v - k / 10, 'n_place', k + ' ' + (more ? 'more' : 'less') + ' changes the ' + place + ' digit, not the ' + (k === 10 ? 'ones' : 'tens') + '.'), tp(more ? v + 10 * k : v - 10 * k, 'n_place', 'That changed the wrong place. ' + k + ' is 1 ' + (k === 10 ? 'ten' : 'hundred') + '.'),
          tp(more ? v + 2 * k : v - 2 * k, 'n_tenmore', 'Change the ' + place + ' digit by just 1.')]) };
    }
    const units = Math.floor(v / k), rem = v % k, nu = more ? units + 1 : units - 1, remTxt = k === 10 ? rem + ' ones' : rem;
    return { text, ans, how: [N(v) + ' is ' + units + ' ' + place + ' and ' + remTxt + '. ' + k + ' ' + (more ? 'more' : 'less') + ' makes ' + nu + ' ' + place + '.', nu + ' ' + place + ' and ' + remTxt + ' make ' + B(N(ans)) + '.'],
      steps: [S('How many ' + place + ' are in ' + B(N(v)) + ' altogether?', units), S(qq(more ? add(units, 1) : sub(units, 1)), nu), S(B(nu + ' ' + place + ' and ' + remTxt) + ' make what number?', ans)],
      traps: traps([more ? tp(ans - 10 * k, 'a_regroup', '9 ' + place + ' and 1 more make 10 ' + place + ', which is a new ' + (k === 10 ? 'hundred' : 'thousand') + '.') : tp(ans + 10 * k, 'a_borrow', 'There are no ' + place + ' to take. Trade a ' + (k === 10 ? 'hundred for 10 tens' : 'thousand for 10 hundreds') + ' first.'),
        tp(more ? v + k / 10 : v - k / 10, 'n_place', k + ' ' + (more ? 'more' : 'less') + ' changes the ' + place + ', not the ' + (k === 10 ? 'ones' : 'tens') + '.'), tp(more ? ans + k : ans - k, 'n_tenmore', 'Change it by just one ' + (k === 10 ? 'ten' : 'hundred') + '.')]) };
  } },
{ id: 'n_compare', s: 'count', g: 2, title: 'Biggest and smallest numbers',
  tip: 'Compare numbers by their biggest place first. For the biggest number from some digits, put the biggest digit first: 4, 7, 2 makes 742.',
  gen(d, R) {
    if (d === 2 && R.chance(.4)) {
      const h = R.i(1, 9), less = R.chance(.5); let t2, o2, o, ans;
      if (less) { t2 = R.i(1, 9); o2 = R.i(0, 9); o = R.i(0, 9); ans = o < o2 ? t2 : t2 - 1; }
      else { t2 = R.i(0, 8); o2 = R.i(0, 9); o = R.i(0, 9); ans = o > o2 ? t2 : t2 + 1; }
      const target = 100 * h + 10 * t2 + o2, word = less ? 'less than' : 'more than', works = ans === t2;
      return { text: B(h + '□' + o) + ' is ' + word + ' ' + B(target) + '. What is the ' + B(less ? 'biggest' : 'smallest') + ' digit that can go in the box?', ans,
        how: ['Both numbers have ' + h + ' hundreds, so compare the tens next. The tens digit of ' + target + ' is ' + t2 + '.',
          works ? 'If the box is ' + t2 + ', the tens tie, so the ones decide: ' + o + ' is ' + word + ' ' + o2 + ', so ' + t2 + ' works. The answer is ' + B(ans) + '.'
            : 'If the box is ' + t2 + ', the tens tie and the ones ' + o + ' is not ' + word + ' ' + o2 + '. So the box must be ' + (less ? 'smaller' : 'bigger') + ': ' + B(ans) + '.'],
        steps: [S('What is the tens digit of ' + B(target) + '?', t2), S('Box = ' + t2 + ' makes the tens tie. Then the ones decide. What is the ones digit of ' + B(h + '□' + o) + '?', o)],
        traps: traps([works ? tp(less ? t2 - 1 : t2 + 1, 'n_compare', 'Try ' + t2 + ' too: when the tens tie, the ones decide.') : tp(t2, 'n_compare', 'With ' + t2 + ' the tens tie, and then the ones do not work.'), tp(less ? 9 : 0, 'n_compare', 'Compare the hundreds first, then the tens.'), tp(o2, 'n_compare', 'The box is in the tens place. Compare it with the tens digit.')]) };
    }
    const len = d === 2 ? 4 : 3, zero = d >= 1 && R.chance(.5), big = R.chance(d === 0 ? .7 : .5);
    let ds; do { ds = R.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, len); } while (zero ? !ds.includes(0) : ds.includes(0));
    const desc = ds.slice().sort((a, b) => b - a), asc = ds.slice().sort((a, b) => a - b);
    let order = big ? desc : asc.slice();
    if (!big && order[0] === 0) { const i = order.findIndex(x => x > 0); order = [order[i]].concat(order.filter((x, j) => j !== i)); }
    const ans = +order.join(''), place = len === 4 ? 'thousands' : 'hundreds';
    const how = big ? ['For the biggest number, put the biggest digit in the biggest place, then the next biggest, and so on.', 'Digits from biggest to smallest: ' + desc.join(', ') + ' → ' + B(N(ans)) + '.']
      : (ds.includes(0) ? ['A number cannot start with 0, so start with the smallest digit that is not 0: ' + order[0] + '.', 'Then the rest from smallest to biggest: ' + B(N(ans)) + '.'] : ['For the smallest number, put the smallest digit in the biggest place.', 'Digits from smallest to biggest: ' + asc.join(', ') + ' → ' + B(N(ans)) + '.']);
    let small = asc.slice(); if (small[0] === 0) { const i = small.findIndex(x => x > 0); small = [small[i]].concat(small.filter((x, j) => j !== i)); }
    const t = [tp(big ? +small.join('') : +desc.join(''), 'n_compare', big ? 'That is the smallest. For the biggest, the biggest digit goes first.' : 'That is the biggest. For the smallest, the smallest digit goes first.'), tp(+ds.join(''), 'n_compare', 'Sort the digits first.')];
    if (!big && ds.includes(0)) t.push(tp(+asc.join(''), 'n_place', 'Starting with 0 does not make a ' + len + '-digit number. Start with the smallest digit that is not 0.'));
    return { text: 'Use each digit once: ' + B(ds.join(', ')) + '. What is the ' + B(big ? 'biggest' : 'smallest') + ' ' + len + '-digit number you can make?', ans, how,
      steps: [S('Which digit goes in the ' + place + ' place?', order[0]), S('Which digit goes next?', order[1]), S('Put the digits in order. What is the number?', ans)], traps: traps(t) };
  } },
{ id: 'n_numline', s: 'count', g: 3, title: 'Read a number line',
  tip: 'Find what each jump is worth before you count. From 0 to 100 in 4 equal jumps, each jump is 25.',
  gen(d, R) {
    let lo, step, lab, hi, told;
    if (d === 0) { told = true; if (R.chance(.5)) { step = 2; lab = 10; lo = R.i(0, 9) * 10; hi = lo + 20; } else { step = 10; lab = 50; lo = R.i(0, 4) * 100; hi = lo + 100; } }
    else if (d === 1) { told = false; const c = R.i(0, 2); if (c === 0) { step = 5; lab = 25; lo = R.i(0, 6) * 50; hi = lo + 50; } else if (c === 1) { step = 25; lab = 100; lo = R.i(0, 4) * 100; hi = lo + 200; } else { step = 2; lab = 10; lo = R.i(1, 9) * 10; hi = lo + 20; } }
    else { told = false; const c = R.pick([[2, 20], [5, 50], [10, 100], [25, 100], [25, 200], [5, 25]]); step = c[0]; hi = c[1]; lo = R.i(0, 8) * (c[1] >= 100 ? 100 : 10); hi += lo; lab = hi - lo; }
    const gaps = (hi - lo) / step; let k; do { k = R.i(1, gaps - 1); } while ((k * step) % lab === 0);
    const v = lo + k * step, L = lo + Math.floor((v - lo) / lab) * lab, Rr = L + lab, fwd = v - L <= Rr - v, from = fwd ? L : Rr, j = Math.abs(v - from) / step;
    const list = []; for (let i = 1; i <= j; i++) list.push(N(from + (fwd ? i : -i) * step));
    const howStep = d === 2 ? 'From ' + N(lo) + ' to ' + N(hi) + ' is ' + (hi - lo) + ', split into ' + gaps + ' equal jumps, so each jump is ' + step + '.' : told ? 'Each jump is ' + step + '.' : 'From ' + N(L) + ' to ' + N(Rr) + ' is ' + lab + ' in ' + (lab / step) + ' jumps, so each jump is ' + step + '.';
    return { text: (told ? 'Each jump is ' + B(step) + '. ' : d === 2 ? 'Only the ends are labeled. ' : '') + 'What number goes where the ' + B('?') + ' is?', ans: v, vis: numLineSVG(lo, hi, step, [{ v, t: '?' }], lab),
      how: [howStep, 'Count ' + (fwd ? 'on' : 'back') + ' from ' + N(from) + ' by ' + step + 's: ' + list.join(', ') + '. The ? is ' + B(N(v)) + '.'],
      steps: (told ? [] : [S('How much is each jump?', step)]).concat([S('How many jumps is the ? from ' + B(N(from)) + '?', j), S('Count ' + (fwd ? 'on' : 'back') + ' ' + j + ' ' + plural(j, 'jump') + ' of ' + step + ' from ' + B(N(from)) + '. Where do you land?', v)]),
      traps: traps([tp(fwd ? from + j : from - j, 'n_numline', 'Each jump is worth ' + step + ', not 1.'), tp(v + step, 'n_numline', 'Count the jumps again, one for each space between marks.'), tp(v - step, 'n_numline', 'Count the jumps again, one for each space between marks.'),
        d === 2 ? tp(fwd ? from + j * (hi - lo) / (gaps + 1) : null, 'n_numline', 'Count the spaces between the marks, not the marks.') : null]) };
  } },
{ id: 'n_round10', s: 'count', g: 3, title: 'Round to the nearest 10',
  tip: 'Find the two tens the number is between, then look at the ones digit: 5 or more rounds up, 4 or less rounds down. 47 → 50, 43 → 40.',
  gen(d, R) {
    if (d === 0) { let v; do { v = R.i(11, 99); } while (v % 10 === 0 || v % 10 === 5); return roundProblem(v, 10, 'n_round10', true); }
    if (d === 1) { let v; do { v = R.i(101, 989); } while (v % 10 === 0); return roundProblem(v, 10, 'n_round10', true); }
    const c = R.i(0, 2);
    if (c === 0) { const v = R.chance(.3) ? R.i(95, 99) : R.i(1, 9) * 100 + R.i(95, 99); const p = roundProblem(v, 10, 'n_round10', false); if (v > 100) p.traps.push(tp(p.ans - 100, 'a_regroup', 'One more ten after ' + N(p.ans - 10) + ' makes a new hundred.')); return p; }
    if (c === 1) { let v; do { v = R.i(1001, 9989); } while (v % 10 === 0); return roundProblem(v, 10, 'n_round10', false); }
    return roundReverse(R.i(2, 49) * 10, 10, R.chance(.5), 'n_round10');
  } },
{ id: 'n_round100', s: 'count', g: 3, title: 'Round to the nearest 100',
  tip: 'Find the two hundreds the number is between, then look only at the tens digit: 5 or more rounds up. 450 → 500, 449 → 400.',
  gen(d, R) {
    if (d === 0) { let v; do { v = R.i(101, 989); } while (v % 100 === 0 || Math.floor(v / 10) % 10 === 5); return roundProblem(v, 100, 'n_round100', true); }
    if (d === 1) { let v; do { v = R.chance(.3) ? R.i(1, 9) * 100 + R.pick([45, 46, 47, 48, 49, 50, 51, 52]) : R.i(101, 989); } while (v % 100 === 0); return roundProblem(v, 100, 'n_round100', true); }
    const c = R.i(0, 2);
    if (c === 0) { let v; do { v = R.i(1001, 9899); } while (v % 100 === 0); return roundProblem(v, 100, 'n_round100', false); }
    if (c === 1) { const v = R.i(1, 9) * 1000 + R.i(950, 999); return roundProblem(v, 100, 'n_round100', false); }
    return roundReverse(R.i(2, 49) * 100, 100, R.chance(.5), 'n_round100');
  } },
{ id: 'n_estimate', s: 'count', g: 3, title: 'Estimate by rounding first', pre: ['a_split'],
  tip: 'An estimate is a close answer you can find fast. Round each number first, then add or take away. 48 + 31 is about 50 + 30 = 80.',
  gen(d, R) {
    const to = d === 2 ? 100 : 10, r = x => Math.round(x / to) * to, ok = x => x % to !== to / 2 && x % to !== 0;
    let a, b, op;
    do { if (d === 2) { a = R.i(110, 890); b = R.i(110, 890); op = R.chance(.6) ? '+' : '−'; } else { a = R.i(12, 89); b = R.i(12, 89); op = d === 1 && R.chance(.6) ? '−' : '+'; } if (op === '−' && a < b) [a, b] = [b, a]; } while (!ok(a) || !ok(b) || r(a) === r(b));
    const ra = r(a), rb = r(b), plus = op === '+', ans = plus ? ra + rb : ra - rb, exact = plus ? a + b : a - b, o = plus ? add : sub, uw = to === 10 ? 'ten' : 'hundred';
    if (exact === ans) return null;
    const oa = ra === Math.floor(a / to) * to ? ra + to : ra - to, ob = rb === Math.floor(b / to) * to ? rb + to : rb - to;
    return { text: 'Round each number to the nearest ' + uw + '. About how much is ' + B(o(a, b)) + '?', ans,
      how: [N(a) + ' rounds to ' + N(ra) + '. ' + N(b) + ' rounds to ' + N(rb) + '.', o(ra, rb) + ' = ' + B(N(ans)) + '.', 'The exact answer is ' + N(exact) + ', so the estimate is close.'],
      steps: [S('Round ' + B(N(a)) + ' to the nearest ' + uw + '.', ra), S('Round ' + B(N(b)) + ' to the nearest ' + uw + '.', rb), S(qq(o(ra, rb)), ans)],
      traps: traps([tp(exact, 'n_estimate', 'That is the exact answer. Round each number first, then ' + (plus ? 'add' : 'take away') + '.'),
        tp(plus ? oa + rb : oa - rb, to === 10 ? 'n_round10' : 'n_round100', 'Check how ' + N(a) + ' rounds: look at the ' + (to === 10 ? 'ones' : 'tens') + ' digit.'),
        tp(plus ? ra + ob : ra - ob, to === 10 ? 'n_round10' : 'n_round100', 'Check how ' + N(b) + ' rounds: look at the ' + (to === 10 ? 'ones' : 'tens') + ' digit.')]) };
  } },
{ id: 'n_big', s: 'count', g: 4, title: 'Place value up to a million',
  tip: 'Every three places get a new name: ones, thousands. In 347,215 the 7 is in the thousands place, so it is worth 7,000.',
  gen(d, R) {
    const kind = d === 0 ? 'worth5' : d === 1 ? R.pick(['worth6', 'build']) : R.pick(['thin', 'kth', 'cross']);
    if (kind === 'worth5' || kind === 'worth6') {
      const len = kind === 'worth5' ? 5 : 6; let v; do { v = R.i(10 ** (len - 1), 10 ** len - 1); } while (!distinct(v) || /0/.test(String(v)));
      const pos = R.i(2, len - 1), dg = digitsOf(v)[len - 1 - pos], pv = 10 ** pos, val = dg * pv;
      return { text: 'What is the ' + B(dg) + ' in ' + B(N(v)) + ' worth?', ans: val,
        how: ['Count the places from the right: ones, tens, hundreds, thousands, ten thousands, hundred thousands.', 'The ' + dg + ' is in the ' + PLACES[pos] + ' place, so it is worth ' + B(N(val)) + '.'],
        steps: [S('The ' + dg + ' is in the ' + PLACES[pos] + ' place. How much is ' + B('1 ' + ONE[pos]) + '?', pv), S(B(dg + ' ' + (dg === 1 ? ONE[pos] : PLACES[pos])) + ' = ?', val)],
        traps: traps([tp(dg, 'n_big', 'That is just the digit. What is it worth in its place?'), tp(val * 10, 'n_big', 'Count the places from the right again.'), tp(val / 10, 'n_big', 'Count the places from the right again.')]) };
    }
    if (kind === 'build') {
      let ds; do { ds = [R.i(1, 9)].concat([0, 0, 0, 0, 0].map(() => R.chance(.3) ? 0 : R.i(1, 9))); } while (!ds.slice(1).includes(0) || ds.filter(Boolean).length < 3);
      const v = +ds.join(''), parts = ds.map((x, i) => x * 10 ** (5 - i)).filter(Boolean);
      const run = []; let acc = 0; parts.forEach(p => { acc += p; run.push(acc); });
      return { text: qq(parts.map(N).join(' + ')), ans: v,
        how: ['Write each part in its own place. Where a place has nothing, write a 0.', 'Hundred thousands to ones: ' + ds.join(', ') + ' → ' + B(N(v)) + '.'],
        steps: [S(qq(add(parts[0], parts[1])), run[1]), S(qq(add(run[1], parts[2])), run[2])].concat(parts.length > 3 ? [S(qq(parts.slice(3).reduce((s, p) => s + ' + ' + N(p), N(run[2]))), v)] : []),
        traps: traps([tp(+ds.filter(Boolean).join(''), 'n_expand', 'Every place needs a digit. Put a 0 where a place is empty.'), tp(v + 10000, 'n_big', 'Check the ten thousands.'), tp(v * 10, 'n_big', 'Count the places: the biggest part is hundred thousands.')]) };
    }
    if (kind === 'thin') {
      const k = R.i(101, 999), v = k * 1000, hk = Math.floor(k / 100) * 100, rk = k % 100;
      return { text: 'How many thousands are in ' + B(N(v)) + '?', ans: k,
        how: ['The last three places are hundreds, tens and ones. Cover them up.', 'What is left counts the thousands: ' + N(v) + ' is ' + B(k) + ' thousands.'],
        steps: rk ? [S('How many thousands are in ' + B(N(hk * 1000)) + '?', hk), S('How many thousands are in ' + B(N(rk * 1000)) + '?', rk), S(qq(add(hk, rk)), k)] : [S('Cover the last three digits of ' + B(N(v)) + '. What number is left?', k)],
        traps: traps([tp(k % 10, 'n_big', 'That is just the thousands digit. Ten thousands and hundred thousands are made of thousands too.'), tp(Math.floor(k / 10), 'n_big', 'Cover only the last three digits.'), tp(v, 'n_big', 'That is the whole number. How many thousands fit in it?')]) };
    }
    if (kind === 'kth') {
      let k; do { k = R.i(101, 999); } while (k % 100 === 0); const hk = Math.floor(k / 100) * 100, rk = k % 100;
      return { text: B(k + ' thousands') + ' make what number?', ans: k * 1000,
        how: ['A thousand has three zeros: 1,000.', k + ' thousands is ' + k + ' with three zeros: ' + B(N(k * 1000)) + '.'],
        steps: [S(B(hk + ' thousands') + ' = ?', hk * 1000), S(B(rk + ' thousands') + ' = ?', rk * 1000), S(qq(add(hk * 1000, rk * 1000)), k * 1000)],
        traps: traps([tp(k * 100, 'n_times10', 'A thousand has three zeros, not two.'), tp(k * 10000, 'n_times10', 'A thousand has three zeros, not four.'), tp(k, 'n_big', 'Each thousand is worth 1,000.')]) };
    }
    const more = R.chance(.5), k = R.pick([1000, 10000]); let v;
    if (more) v = k === 1000 ? R.i(1, 9) * 100000 + R.i(0, 9) * 10000 + 9000 + R.i(1, 9) * 100 : R.i(1, 8) * 100000 + 90000 + R.i(1, 9) * 1000 + R.i(1, 9) * 100;
    else v = k === 1000 ? R.i(1, 9) * 100000 + R.i(1, 9) * 10000 + R.i(1, 9) * 100 : R.i(1, 9) * 100000 + R.i(1, 9) * 1000 + R.i(1, 9) * 100;
    const ans = more ? v + k : v - k, units = Math.floor(v / k), rest = v % k, nu = more ? units + 1 : units - 1, pl = PLACES[String(k).length - 1];
    return { text: 'What is ' + B(N(k) + ' ' + (more ? 'more' : 'less')) + ' than ' + B(N(v)) + '?', ans,
      how: [N(v) + ' is ' + N(units) + ' ' + pl + ' and ' + N(rest) + '.', (more ? 'One more' : 'One less') + ' makes ' + N(nu) + ' ' + pl + ': ' + N(nu * k) + ' + ' + N(rest) + ' = ' + B(N(ans)) + '.'],
      steps: [S('How many ' + pl + ' are in ' + B(N(v)) + ' altogether?', units), S(qq(more ? add(units, 1) : sub(units, 1)), nu), S(qq(add(nu * k, rest)), ans)],
      traps: traps([more ? tp(ans - 10 * k, 'a_regroup', '9 ' + pl + ' and 1 more make 10 ' + pl + ', which is one of the next place.') : tp(ans + 10 * k, 'a_borrow', 'There are no ' + pl + ' to take. Trade one from the next place first.'), tp(more ? v + k / 10 : v - k / 10, 'n_big', 'Change the ' + pl + ' place, not the place next to it.'), tp(more ? v + k * 10 : v - k * 10, 'n_big', 'Change the ' + pl + ' place, not the place next to it.')]) };
  } },
{ id: 'n_roundbig', s: 'count', g: 4, title: 'Round to 1,000 and 10,000',
  tip: 'Same rule, bigger place: look at the digit just to the right. To the nearest 1,000, 4,628 → 5,000 because the hundreds digit is 6.',
  gen(d, R) {
    if (d === 0) { let v; do { v = R.i(1001, 9899); } while (v % 1000 === 0); return roundProblem(v, 1000, 'n_roundbig', true); }
    if (d === 1) { const to = R.pick([1000, 10000]); let v; do { v = R.i(10001, 98999); } while (v % to === 0); return roundProblem(v, to, 'n_roundbig', false); }
    const c = R.i(0, 2);
    if (c === 0) { const to = R.pick([1000, 10000]), v = to === 1000 ? R.i(1, 9) * 10000 + 9000 + R.i(500, 999) : R.i(1, 9) * 100000 + 90000 + R.i(5000, 9999); return roundProblem(v, to, 'n_roundbig', false); }
    if (c === 1) { let v; do { v = R.i(100001, 989999); } while (v % 10000 === 0); return roundProblem(v, 10000, 'n_roundbig', false); }
    return roundReverse(R.i(2, 49) * 1000, 1000, R.chance(.5), 'n_roundbig');
  } },
{ id: 'n_times10', s: 'count', g: 4, title: '×10 and ÷10 move the digits', pre: ['m_xtens'],
  tip: 'Times 10 moves every digit one place to the left, and a 0 fills the ones place: 34 × 10 = 340. Divide by 10 moves them back: 560 ÷ 10 = 56.',
  gen(d, R) {
    const kind = d === 0 ? R.pick(['x10', 'd10']) : d === 1 ? R.pick(['x100', 'd100', 'zero']) : R.pick(['mx', 'md', 'x1000', 'd1000']);
    if (kind === 'x10' || kind === 'x100' || kind === 'zero' || kind === 'x1000') {
      const k = kind === 'x10' || kind === 'zero' ? 10 : kind === 'x100' ? 100 : 1000, z = String(k).length - 1;
      let a = kind === 'zero' ? R.i(1, 9) * 100 + R.i(1, 9) : kind === 'x1000' ? R.i(12, 99) : R.i(12, 99); if (a % 10 === 0) a++;
      const ans = a * k, ds = digitsOf(a), parts = ds.map((x, i) => x * 10 ** (ds.length - 1 - i)).filter(Boolean);
      return { text: qq(N(a) + ' × ' + N(k)), ans,
        how: ['Times ' + N(k) + ' moves every digit ' + (z === 1 ? 'one place' : z === 2 ? 'two places' : 'three places') + ' to the left. ' + (z === 1 ? 'A 0 fills' : z + ' zeros fill') + ' the empty places.', N(a) + ' × ' + N(k) + ' = ' + B(N(ans)) + '.'],
        steps: parts.map(p => S(qq(N(p) + ' × ' + N(k)), p * k)).concat([S(qq(parts.map(p => N(p * k)).join(' + ')), ans)]),
        traps: traps([tp(a + k, 'n_times10', 'Times ' + N(k) + ' is not + ' + N(k) + '. Every digit moves to the left.'), tp(ans * 10, 'n_times10', 'Count the zeros in ' + N(k) + ': ' + z + '.'), tp(ans / 10, 'n_times10', 'Count the zeros in ' + N(k) + ': ' + z + '.'),
          kind === 'zero' ? tp(+(String(a).replace('0', '') + '00'), 'n_place', 'Keep the 0 inside the number: every digit moves, the 0 too.') : null]) };
    }
    if (kind === 'd10' || kind === 'd100' || kind === 'd1000') {
      const k = kind === 'd10' ? 10 : kind === 'd100' ? 100 : 1000, z = String(k).length - 1; let q = kind === 'd10' ? R.i(12, 99) : R.i(12, 99); if (q % 10 === 0) q++;
      const a = q * k, ds = digitsOf(q), parts = ds.map((x, i) => x * 10 ** (ds.length - 1 - i));
      return { text: qq(N(a) + ' ÷ ' + N(k)), ans: q,
        how: ['Dividing by ' + N(k) + ' moves every digit ' + (z === 1 ? 'one place' : z === 2 ? 'two places' : 'three places') + ' to the right. The ' + (z === 1 ? '0 in the ones place drops' : z + ' zeros at the end drop') + ' off.', N(a) + ' ÷ ' + N(k) + ' = ' + B(N(q)) + '.'],
        steps: parts.map(p => S(qq(N(p * k) + ' ÷ ' + N(k)), p)).concat([S(qq(parts.map(N).join(' + ')), q)]),
        traps: traps([tp(a - k, 'n_times10', 'Divide by ' + N(k) + ' is not ' + MINUS + ' ' + N(k) + '. Every digit moves to the right.'), tp(q * 10, 'n_times10', 'Take off ' + z + ' ' + plural(z, 'zero') + ', one for each 0 in ' + N(k) + '.'), tp(q / 10, 'n_times10', 'Take off ' + z + ' ' + plural(z, 'zero') + ', one for each 0 in ' + N(k) + '.')]) };
    }
    const k = R.pick([10, 100]), z = String(k).length - 1;
    if (kind === 'mx') {
      const a = k === 10 ? R.i(12, 99) * 10 + R.pick([0, R.i(1, 9)]) : R.i(12, 99), out = a * k;
      return { text: B('? × ' + N(k) + ' = ' + N(out)), ans: a,
        how: ['Undo × ' + N(k) + ' with ÷ ' + N(k) + ': take ' + z + ' ' + plural(z, 'zero') + ' off the end.', N(out) + ' ÷ ' + N(k) + ' = ' + B(N(a)) + '.'],
        steps: [S('How many zeros does × ' + N(k) + ' add to the end?', z), S(qq(N(out) + ' ÷ ' + N(k)), a)],
        traps: traps([tp(out * k, 'n_times10', 'Work backwards: undo × ' + N(k) + ' by dividing by ' + N(k) + '.'), tp(a * 10, 'n_times10', 'Take off exactly ' + z + ' ' + plural(z, 'zero') + '.'), tp(a / 10, 'n_times10', 'Take off exactly ' + z + ' ' + plural(z, 'zero') + '.')]) };
    }
    const a = R.i(12, 99), out = a * k;
    return { text: B('? ÷ ' + N(k) + ' = ' + a), ans: out,
      how: ['Undo ÷ ' + N(k) + ' with × ' + N(k) + ': put ' + z + ' ' + plural(z, 'zero') + ' on the end.', a + ' × ' + N(k) + ' = ' + B(N(out)) + '.'],
      steps: [S('How many zeros does ÷ ' + N(k) + ' take off the end?', z), S(qq(a + ' × ' + N(k)), out)],
      traps: traps([tp(a, 'n_times10', 'The start must be bigger, because dividing made it smaller.'), tp(out * 10, 'n_times10', 'Put on exactly ' + z + ' ' + plural(z, 'zero') + '.'), tp(out / 10, 'n_times10', 'Put on exactly ' + z + ' ' + plural(z, 'zero') + '.')]) };
  } },
/* ======================= Adding & Taking Away ======================= */
{ id: 'a_bonds10', s: 'add', g: 2, title: 'Friends of 10',
  tip: 'Pairs that make 10: 1 + 9, 2 + 8, 3 + 7, 4 + 6, 5 + 5. Know them by heart and every other shortcut gets faster.',
  gen(d, R) {
    if (d === 0) { const a = R.i(1, 9), b = 10 - a;
      return { text: B(a + ' + ? = 10'), ans: b, vis: tenFrame(a),
        how: ['Count the empty boxes in the ten frame. They show what ' + a + ' needs to make 10.', a + ' + ' + b + ' = 10, so the answer is ' + B(b) + '.'],
        traps: traps([tp(b - 1, 'a_bonds10', 'Count the empty boxes again.'), tp(b + 1, 'a_bonds10', 'Count the empty boxes again.'), tp(a, 'a_bonds10', 'That is the number you started with. How many more make 10?'), tp(10 + a, 'a_bonds10', 'The total is 10, so the missing number is less than 10.')]) }; }
    if (d === 1) { const a = R.i(1, 9), b = 10 - a, f = R.i(0, 2), text = f === 0 ? '? + ' + a + ' = 10' : f === 1 ? '10 = ' + a + ' + ?' : '10 ' + MINUS + ' ' + a + ' = ?';
      return { text: B(text), ans: b,
        how: [a + ' and ' + b + ' are friends of 10.', f === 2 ? 'Since ' + a + ' + ' + b + ' = 10, ' + sub(10, a) + ' = ' + B(b) + '.' : a + ' + ' + B(b) + ' = 10.'],
        traps: traps([tp(b - 1, 'a_bonds10', 'Check: ' + a + ' + your answer should make exactly 10.'), tp(b + 1, 'a_bonds10', 'Check: ' + a + ' + your answer should make exactly 10.'), tp(a, 'a_bonds10', 'That is the number you were given. Find its friend.'), tp(10 + a, f === 2 ? 'a_thinkadd' : 'a_bonds10', f === 2 ? 'This is take away, so the answer is less than 10.' : 'The total is 10, so the missing number is less than 10.')]) }; }
    const c = R.i(0, 2);
    if (c === 0 || c === 1) {
      const t = c === 0 ? 1 : R.i(2, 8), o = R.i(1, 9), a = 10 * t + o, top = 10 * t + 10, b = 10 - o;
      return { text: B(a + ' + ? = ' + top), ans: b,
        how: [a + ' is ' + (10 * t) + ' and ' + o + '. The ' + (10 * t) + ' is done; only the ' + o + ' needs filling up to a ten.', o + ' + ' + b + ' = 10, so ' + a + ' + ' + B(b) + ' = ' + top + '.'],
        steps: [S('What is the ones digit of ' + B(a) + '?', o), S(B(o + ' + ? = 10'), b)],
        traps: traps([tp(b + 10, 'n_place', 'The ' + (10 * t) + ' is already there. Only the ones need filling.'), tp(b - 1, 'a_bonds10', 'Check the friend of ' + o + ': together they make 10.'), tp(b + 1, 'a_bonds10', 'Check the friend of ' + o + ': together they make 10.')]) };
    }
    const t = R.i(1, 9), a = 10 * t, b = 100 - a;
    return { text: B(a + ' + ? = 100'), ans: b,
      how: [a + ' is ' + t + ' tens, and 100 is 10 tens.', t + ' + ' + (10 - t) + ' = 10, so ' + t + ' tens + ' + (10 - t) + ' tens = 10 tens. The answer is ' + B(b) + '.'],
      steps: [S(B(t + ' + ? = 10'), 10 - t), S(B((10 - t) + ' tens') + ' = ?', b)],
      traps: traps([tp(10 - t, 'n_place', 'You need ' + (10 - t) + ' tens, not ' + (10 - t) + ' ones.'), tp(b + 10, 'a_bonds10', 'Check the friend of ' + t + ' in tens.'), tp(b - 10, 'a_bonds10', 'Check the friend of ' + t + ' in tens.')]) };
  } },
{ id: 'a_make10', s: 'add', g: 2, title: 'Make a 10',
  tip: 'Fill the bigger number up to 10 first, then add the rest. 8 + 5: 8 needs 2 to make 10, and 5 is 2 + 3, so 10 + 3 = 13.',
  gen(d, R) {
    let a, b;
    if (d === 0) { a = 9; b = R.i(2, 9); } else if (d === 1) { a = R.i(6, 9); b = R.i(11 - a, 9); } else { a = R.i(1, 8) * 10 + R.i(5, 9); b = R.i(11 - a % 10, 9); }
    const flip = d < 2 && R.chance(.4), x = flip ? b : a, y = flip ? a : b, need = 10 - a % 10, top = a + need, rest = b - need, ans = a + b;
    return { text: qq(x + ' + ' + y), ans, vis: d < 2 ? tenFrame(a % 10 || 10) : '', howVis: hopsSVG(a, [need, rest]),
      how: [(flip ? 'Start with the bigger number, ' + a + '. ' : '') + a + ' needs ' + need + ' more to make ' + top + '.', 'Split ' + b + ' into ' + need + ' and ' + rest + '.', add(a, need) + ' = ' + top + ', then ' + add(top, rest) + ' = ' + B(ans) + '.'],
      steps: [S(B(a + ' + ? = ' + top), need), S(B(b + ' = ' + need + ' + ?'), rest), S(qq(add(top, rest)), ans)],
      traps: traps([tp(ans - 10, d === 2 ? 'a_regroup' : 'a_make10', d === 2 ? 'Filling up made a new ten. Count it.' : a + ' + ' + need + ' already makes 10, so the answer is more than 10.'),
        tp(ans - 1, 'a_bonds10', 'Check the friends of 10: ' + (a % 10) + ' + ' + need + ' = 10.'), tp(ans + 1, 'a_bonds10', 'Check the friends of 10: ' + (a % 10) + ' + ' + need + ' = 10.'), tp(ans + 10, 'a_make10', 'Only one new ten is made.')]) };
  } },
{ id: 'a_doubles', s: 'add', g: 2, title: 'Doubles and near doubles',
  tip: 'Doubles are easy to remember: 6 + 6 = 12. For neighbours, double the smaller one and add 1: 6 + 7 = 6 + 6 + 1 = 13.',
  gen(d, R) {
    if (d === 0) { const v = R.i(2, 10), w = v - 5;
      return { text: qq(v + ' + ' + v), ans: 2 * v,
        how: v >= 6 && v < 10 ? ['A double is the same number twice. Use 5 + 5 = 10 to help.', v + ' is 5 and ' + w + ', so ' + v + ' + ' + v + ' is 10 + ' + w + ' + ' + w + ' = ' + B(2 * v) + '.'] : ['A double is the same number twice. Count up by ' + v + ' from ' + v + '.', v + ' + ' + v + ' = ' + B(2 * v) + '.'],
        steps: v >= 6 && v < 10 ? [S(qq(w + ' + ' + w), 2 * w), S(qq(add(10, 2 * w)), 2 * v)] : [],
        traps: traps([tp(2 * v + 1, 'a_doubles', 'A double is always even. Check it again.'), tp(2 * v - 1, 'a_doubles', 'A double is always even. Check it again.'), tp(2 * v + 2, 'a_doubles', 'Check your double.'), tp(2 * v - 2, 'a_doubles', 'Check your double.')]) }; }
    if (d === 1) { const v = R.i(3, 9), big = R.chance(.5), a = big ? v + 1 : v, b = big ? v : v + 1;
      return { text: qq(a + ' + ' + b), ans: 2 * v + 1,
        how: [a + ' + ' + b + ' is next to the double ' + v + ' + ' + v + '.', v + ' + ' + v + ' = ' + (2 * v) + ', and one more makes ' + B(2 * v + 1) + '.'],
        steps: [S(qq(v + ' + ' + v), 2 * v), S(qq(add(2 * v, 1)), 2 * v + 1)],
        traps: traps([tp(2 * v, 'a_doubles', 'That is the double. ' + (v + 1) + ' is one more than ' + v + ', so add 1.'), tp(2 * v + 2, 'a_doubles', 'You doubled ' + (v + 1) + '. That is 1 too many, so take 1 away.'), tp(2 * v - 1, 'a_doubles', 'Double the smaller number, then add 1, not take 1.')]) }; }
    if (R.chance(.5)) { const v = R.pick([12, 13, 14, 15, 16, 17, 18, 21, 23, 24, 25, 26, 28, 32, 34, 35, 36, 38, 41, 43, 45, 47]), t = v - v % 10, o = v % 10;
      return { text: qq(v + ' + ' + v), ans: 2 * v,
        how: ['Double the tens and the ones on their own.', t + ' + ' + t + ' = ' + (2 * t) + '. ' + o + ' + ' + o + ' = ' + (2 * o) + '.', add(2 * t, 2 * o) + ' = ' + B(2 * v) + '.'],
        steps: [S(qq(t + ' + ' + t), 2 * t), S(qq(o + ' + ' + o), 2 * o), S(qq(add(2 * t, 2 * o)), 2 * v)],
        traps: traps([2 * o >= 10 ? tp(2 * t + 2 * o - 10, 'a_regroup', 'The doubled ones made ' + (2 * o) + ', which has a ten in it. Count it.') : null, tp(2 * t + o, 'a_doubles', 'Double the ones too.'), tp(2 * v + 10, 'a_doubles', 'Check the doubled tens.'), tp(2 * v - 10, 'a_doubles', 'Check the doubled tens.')]) }; }
    const v = R.pick([12, 13, 14, 15, 20, 24, 25, 30, 35, 40, 45, 50, 60, 75]), big = R.chance(.4), a = big ? v + 1 : v, b = big ? v : v + 1;
    return { text: qq(a + ' + ' + b), ans: 2 * v + 1,
      how: [a + ' and ' + b + ' are neighbours. Double the smaller one, then add 1.', 'Double ' + v + ' is ' + (2 * v) + '. ' + add(2 * v, 1) + ' = ' + B(2 * v + 1) + '.'],
      steps: [S(qq(v + ' + ' + v), 2 * v), S(qq(add(2 * v, 1)), 2 * v + 1)],
      traps: traps([tp(2 * v, 'a_doubles', 'That is the double. Add the 1 extra.'), tp(2 * v + 2, 'a_doubles', 'You doubled ' + (v + 1) + '. Take 1 away instead of adding it.'), tp(2 * v + 11, 'a_doubles', 'Check the doubled tens.')]) };
  } },
{ id: 'a_ten', s: 'add', g: 2, title: 'Add or take away 10', pre: ['n_place'],
  tip: 'Adding 10 changes only the tens digit: 47 + 10 = 57. Taking away 10 makes the tens digit 1 smaller: 63 ' + MINUS + ' 10 = 53.',
  gen(d, R) {
    const plusMinus = (v, more) => {
      const t = Math.floor(v / 10) % 10, ans = more ? v + 10 : v - 10, expr = more ? add(v, 10) : sub(v, 10);
      return { text: qq(expr), ans, howVis: hopsSVG(v, [more ? 10 : -10]),
        how: [(more ? 'Adding' : 'Taking away') + ' 10 changes only the tens digit. The ones stay ' + (v % 10) + '.', 'The tens digit goes from ' + t + ' to ' + (more ? t + 1 : t - 1) + ', so ' + expr + ' = ' + B(N(ans)) + '.'],
        steps: [S('What is the tens digit of ' + B(N(v)) + '?', t), S(qq(more ? add(t, 1) : sub(t, 1)), more ? t + 1 : t - 1)],
        traps: traps([tp(more ? v + 1 : v - 1, 'a_ten', (more ? 'Adding' : 'Taking away') + ' 10 changes the tens digit, not the ones digit.'), tp(more ? v + 100 : v - 100, 'n_place', '10 is 1 ten, not 1 hundred.'), tp(more ? v + 20 : v - 20, 'a_ten', 'Change the tens digit by just 1.')]) };
    };
    if (d === 0) { const more = R.chance(.5); return plusMinus(more ? R.i(11, 89) : R.i(20, 99), more); }
    if (d === 1) {
      const c = R.i(0, 2);
      if (c === 0) { let v, more = R.chance(.5); do { v = R.i(100, 989); } while (more ? Math.floor(v / 10) % 10 === 9 : Math.floor(v / 10) % 10 === 0); return plusMinus(v, more); }
      if (c === 1) { const more = R.chance(.5), x = R.i(21, 89), start = more ? x - 10 : x + 10;
        return { text: B('? ' + (more ? '+' : MINUS) + ' 10 = ' + x), ans: start,
          how: ['The ? is the start. ' + (more ? 'Adding' : 'Taking away') + ' 10 gave ' + x + ', so go back the other way.', (more ? sub(x, 10) : add(x, 10)) + ' = ' + B(start) + '.'],
          steps: [S(qq(more ? sub(x, 10) : add(x, 10)), start)],
          traps: traps([tp(more ? x + 10 : x - 10, 'a_ten', 'The ? is the start. Undo the ' + (more ? '+ 10 by taking 10 away' : MINUS + ' 10 by adding 10') + '.'), tp(more ? x - 1 : x + 1, 'a_ten', 'Change the tens digit, not the ones.')]) }; }
      const k = R.i(2, 4), v = R.i(1, 9 - k) * 10 + R.i(1, 9), t = Math.floor(v / 10), ans = v + 10 * k;
      return { text: qq(N(v) + ' + 10'.repeat(k)), ans, howVis: hopsSVG(v, Array(k).fill(10)),
        how: ['Each + 10 makes the tens digit go up by 1. There are ' + k + ' of them.', 'The tens digit goes from ' + t + ' to ' + (t + k) + ', so the answer is ' + B(ans) + '.'],
        steps: [S('How many tens are being added?', k), S(qq(add(t, k)), t + k)],
        traps: traps([tp(v + k, 'a_ten', 'Each 10 changes the tens digit, not the ones.'), tp(v + 10, 'a_ten', 'There are ' + k + ' tens to add, not one.'), tp(ans + 10, 'a_ten', 'Count the tens you add: ' + k + '.'), tp(ans - 10, 'a_ten', 'Count the tens you add: ' + k + '.')]) };
    }
    const more = R.chance(.5), h = R.i(1, 9), o = R.i(0, 9), v = more ? 100 * h + 90 + o : 100 * h + o, ans = more ? v + 10 : v - 10, units = Math.floor(v / 10), nu = more ? units + 1 : units - 1;
    return { text: qq(more ? add(v, 10) : sub(v, 10)), ans, howVis: hopsSVG(v, [more ? 10 : -10]),
      how: [N(v) + ' is ' + units + ' tens and ' + o + ' ones.', (more ? 'One more ten' : 'One less ten') + ' makes ' + nu + ' tens. ' + nu + ' tens and ' + o + ' ones make ' + B(N(ans)) + '.'],
      steps: [S('How many tens are in ' + B(N(v)) + ' altogether?', units), S(qq(more ? add(units, 1) : sub(units, 1)), nu), S(B(nu + ' tens and ' + o + ' ones') + ' make what number?', ans)],
      traps: traps([more ? tp(ans - 100, 'a_regroup', '9 tens and 1 more ten make 10 tens: one more hundred.') : tp(ans + 100, 'a_borrow', 'There are no tens to take. Trade a hundred for 10 tens first.'), tp(more ? v + 1 : v - 1, 'a_ten', 'Change the tens, not the ones.'), tp(more ? ans + 10 : ans - 10, 'a_ten', 'Change it by just one ten.')]) };
  } },
{ id: 'a_fives', s: 'add', g: 2, title: 'Adding and taking away 5s', pre: ['p_skip'],
  tip: 'Two 5s make a 10. 35 + 5 = 40, and 45 + 15 is 40 + 10 plus one more 10 from 5 + 5: 60. To take 15, take 10, then 5.',
  gen(d, R) {
    let a, b, plus;
    if (d === 0) { const c = R.i(0, 2); if (c === 0) { plus = true; a = R.i(1, 9) * 10 + 5; b = 5; } else if (c === 1) { plus = false; a = R.i(2, 10) * 10; b = 5; } else { plus = true; a = R.i(1, 8) * 10 + 5; b = 15; } }
    else if (d === 1) { const c = R.i(0, 2); if (c === 0) { plus = true; do { a = R.i(1, 7) * 10 + 5; b = R.i(1, 4) * 10 + 5; } while (a + b > 100); } else if (c === 1) { plus = false; a = R.i(4, 10) * 10; b = R.i(1, 3) * 10 + 5; } else { plus = false; a = R.i(5, 9) * 10 + 5; b = R.i(1, 4) * 10 + 5; } }
    else { plus = R.chance(.5); if (plus) { a = R.i(10, 39) * 5; b = R.i(1, 9) * 10 + 5; if (a % 10 === 0) a += 5; } else { a = R.i(20, 60) * 5; b = R.i(1, 9) * 10 + 5; } }
    const ans = plus ? a + b : a - b; if (ans <= 0) return null;
    const at = a - a % 10, bt = b - b % 10, ao = a % 10, bo = b % 10;
    let how, steps, t;
    if (plus) {
      if (bt === 0) { how = ['Two 5s make a 10. ' + N(a) + ' is ' + N(at) + ' and 5.', '5 + 5 = 10, and ' + add(at, 10) + ' = ' + B(N(ans)) + '.']; steps = [S(qq('5 + 5'), 10), S(qq(add(at, 10)), ans)]; }
      else { how = ['Two 5s make a 10.', 'Tens: ' + add(at, bt) + ' = ' + N(at + bt) + '. Ones: 5 + 5 = 10.', add(at + bt, 10) + ' = ' + B(N(ans)) + '.']; steps = [S(qq(add(at, bt)), at + bt), S(qq('5 + 5'), 10), S(qq(add(at + bt, 10)), ans)]; }
      t = [ao && bo ? tp(ans - 10, 'a_regroup', '5 + 5 makes a new ten. Count it.') : null, tp(ans - 5, 'a_fives', 'Both numbers have 5 ones. Add both 5s.'), tp(ans + 5, 'p_skip', 'Count on by 5s carefully.'), bt ? tp(ans + 10, 'a_tens', 'Check the tens.') : null];
    } else {
      const mid = a - bt;
      if (bt === 0) { how = ['Taking 5 from a ten leaves 5.', N(a) + ' is ' + N(a - 10) + ' and 10. 10 ' + MINUS + ' 5 = 5, so ' + sub(a, 5) + ' = ' + B(N(ans)) + '.']; steps = [S(qq(sub(10, 5)), 5), S(qq(add(a - 10, 5)), ans)]; }
      else { how = ['Take away the tens, then the 5.', sub(a, bt) + ' = ' + N(mid) + '.', sub(mid, 5) + ' = ' + B(N(ans)) + '.']; steps = [S(qq(sub(a, bt)), mid), S(qq(sub(mid, 5)), ans)]; }
      t = [tp(ans + 10, bt ? 'a_fives' : 'a_fives', 'Take the 5 away, do not add it.'), tp(ans - 5, 'a_fives', 'Take away just one 5.'), tp(ans + 5, 'a_fives', 'Take away the 5 too.'), bt ? tp(ans - 10, 'a_tens', 'Check the tens: take away just ' + bt + '.') : null, tp(colSub(a, b), 'a_borrow', 'You cannot take 5 ones from 0 ones. Take from a ten.')];
      if (bt && mid % 10 === 0) t[0] = tp(mid + 5, 'a_fives', 'You took away ' + bt + '. Now take away the 5 too, do not add it.');
    }
    return { text: qq(plus ? add(a, b) : sub(a, b)), ans, how, steps, traps: traps(t), howVis: hopsSVG(a, plus ? [bt, 5].filter(Boolean) : [-bt, -5].filter(Boolean)) };
  } },
{ id: 'a_plus9', s: 'add', g: 2, title: 'Add 9: add 10, take 1',
  tip: 'Adding 9? Add 10, then take 1 away. 46 + 9: 46 + 10 = 56, take 1 → 55. Adding 19? Add 20 and take 1.',
  gen(d, R) {
    const a = d === 0 ? R.i(11, 40) : d === 1 ? R.i(41, 89) : R.i(101, 480), b = d === 2 ? R.pick([9, 19, 29, 39]) : d === 1 ? R.pick([9, 9, 19]) : 9;
    const ten = b + 1, mid = a + ten, ans = a + b;
    return { text: qq(add(a, b)), ans, howVis: hopsSVG(a, [ten, -1]),
      how: ['Adding ' + b + ' is close to adding ' + ten + '. ' + add(a, ten) + ' = ' + N(mid) + '.', 'You added 1 too many, so take 1 away: ' + sub(mid, 1) + ' = ' + B(N(ans)) + '.'],
      steps: [S(qq(add(a, ten)), mid), S(qq(sub(mid, 1)), ans)],
      traps: traps([tp(mid, 'a_plus9', 'You added ' + ten + '. Now take the extra 1 away.'), tp(mid + 1, 'a_plus9', b + ' is 1 less than ' + ten + ', so take 1 away after adding ' + ten + ', do not add it.'), tp(ans - 10, 'a_ten', 'Check the tens: adding ' + b + ' makes the number bigger by almost ' + ten + '.'), tp(ans + 10, 'a_ten', 'Check the tens.')]) };
  } },
{ id: 'a_thinkadd', s: 'add', g: 2, title: 'Take away by thinking addition',
  tip: 'Every take-away has an adding fact inside. 13 ' + MINUS + ' 8: think 8 + what = 13? 8 up to 10 is 2, 10 up to 13 is 3, so 5.',
  gen(d, R) {
    if (d === 0) { const a = R.i(5, 10), b = R.i(1, a - 1), ans = a - b;
      return { text: qq(sub(a, b)), ans, how: ['Think: ' + b + ' + what = ' + a + '?', b + ' + ' + ans + ' = ' + a + ', so ' + sub(a, b) + ' = ' + B(ans) + '.'],
        traps: traps([tp(ans + 1, 'a_thinkadd', 'Check: ' + b + ' + your answer should make ' + a + '.'), tp(ans - 1, 'a_thinkadd', 'Check: ' + b + ' + your answer should make ' + a + '.'), tp(a + b, 'a_thinkadd', 'This is take away, so the answer is smaller than ' + a + '.')]) }; }
    const bridge = (a, b, text) => { const ans = a - b;
      return { text, ans, howVis: hopsSVG(b, [10 - b, a - 10].filter(Boolean)),
        how: ['Think: ' + b + ' + what = ' + a + '? Count up through 10.', b + ' up to 10 is ' + (10 - b) + ', and 10 up to ' + a + ' is ' + (a - 10) + '.', add(10 - b, a - 10) + ' = ' + B(ans) + '.'],
        steps: [S(B(b + ' + ? = 10'), 10 - b), S(B('10 + ? = ' + a), a - 10), S(qq(add(10 - b, a - 10)), ans)],
        traps: traps([tp(a - 10, 'a_bonds10', 'You forgot the hop from ' + b + ' up to 10.'), tp(10 - b, 'a_thinkadd', 'You forgot the hop from 10 up to ' + a + '.'), tp(ans + 1, 'a_thinkadd', 'Check: ' + b + ' + your answer should make ' + a + '.'), tp(ans - 1, 'a_thinkadd', 'Check: ' + b + ' + your answer should make ' + a + '.'), tp(a + b, 'a_thinkadd', 'This is take away, so the answer is smaller than ' + a + '.')]) }; };
    if (d === 1) { const b = R.i(4, 9), a = R.i(11, b + 9); return bridge(a, b, qq(sub(a, b))); }
    const c = R.i(0, 2);
    if (c === 0) { const b = R.i(4, 9), a = R.i(11, b + 9), p = bridge(a, b, B(a + ' ' + MINUS + ' ? = ' + b)); p.how[0] = 'Think: ' + b + ' + what = ' + a + '? Count up through 10.'; p.traps.push(tp(b, 'a_thinkadd', 'That is what is left. What was taken away?')); return p; }
    if (c === 1) { let b, a; do { b = R.i(2, 8) * 10 + R.i(5, 9); a = b + R.i(3, 9); } while (Math.floor(a / 10) === Math.floor(b / 10)); const top = Math.ceil(b / 10) * 10, ans = a - b;
      return { text: qq(sub(a, b)), ans, howVis: hopsSVG(b, [top - b, a - top]),
        how: ['The numbers are close, so count up from ' + b + ' to ' + a + '.', b + ' → ' + top + ' is ' + (top - b) + ', and ' + top + ' → ' + a + ' is ' + (a - top) + '.', add(top - b, a - top) + ' = ' + B(ans) + '.'],
        steps: [S('From ' + B(b) + ' up to ' + B(top) + ' is how much?', top - b), S('From ' + B(top) + ' up to ' + B(a) + ' is how much?', a - top), S(qq(add(top - b, a - top)), ans)],
        traps: traps([tp(colSub(a, b), 'a_borrow', 'Taking the smaller ones digit from the bigger one gives this. Count up from ' + b + ' instead.'), tp(ans + 10, 'a_thinkadd', 'The numbers are close, so the answer is small.'), tp(ans - 1, 'a_bonds10', 'Check the hop up to ' + top + '.'), tp(ans + 1, 'a_bonds10', 'Check the hop up to ' + top + '.')]) }; }
    const b = R.i(3, 9), c2 = R.i(3, 9), ans = b + c2;
    return { text: B('? ' + MINUS + ' ' + b + ' = ' + c2), ans,
      how: ['Start with ?, take away ' + b + ', and ' + c2 + ' are left. So the start is ' + c2 + ' and ' + b + ' put back together.', add(c2, b) + ' = ' + B(ans) + '.'],
      steps: [S(qq(add(c2, b)), ans)],
      traps: traps([tp(Math.abs(c2 - b), 'a_thinkadd', 'The start must be bigger than ' + c2 + ', because something was taken away.'), tp(ans + 1, 'a_doubles', 'Check your adding fact.'), tp(ans - 1, 'a_doubles', 'Check your adding fact.')]) };
  } },
{ id: 'a_minus9', s: 'add', g: 2, title: 'Take away 9: take 10, add 1',
  tip: 'Taking away 9? Take away 10, then give 1 back. 53 ' + MINUS + ' 9: 53 ' + MINUS + ' 10 = 43, add 1 → 44. Taking away 19? Take 20, give 1 back.',
  gen(d, R) {
    const b = d === 0 ? 9 : d === 1 ? R.pick([9, 19, 19]) : R.pick([9, 19, 29, 39]);
    const a = d === 0 ? R.i(15, 50) : d === 1 ? R.i(Math.max(51, b + 12), 99) : (R.chance(.3) ? R.i(1, 8) * 100 + R.i(0, 8) : R.i(120, 900));
    const ten = b + 1, mid = a - ten, ans = a - b; if (mid < 0) return null;
    return { text: qq(sub(a, b)), ans, howVis: hopsSVG(a, [-ten, 1]),
      how: ['Taking away ' + b + ' is close to taking away ' + ten + '. ' + sub(a, ten) + ' = ' + N(mid) + '.', 'You took away 1 too many, so add 1 back: ' + add(mid, 1) + ' = ' + B(N(ans)) + '.'],
      steps: [S(qq(sub(a, ten)), mid), S(qq(add(mid, 1)), ans)],
      traps: traps([tp(mid, 'a_minus9', 'You took away ' + ten + '. Now give the extra 1 back.'), tp(mid - 1, 'a_minus9', 'After taking away ' + ten + ', add 1 back, do not take another 1.'), tp(ans + 10, 'a_ten', 'Check the tens.'), tp(ans - 10, 'a_ten', 'Check the tens.'),
        Math.floor(a / 100) !== Math.floor(ans / 100) ? tp(ans + 100, 'a_borrow', 'You went back past a hundred, so the hundreds digit goes down by 1.') : null]) };
  } },
{ id: 'a_tens', s: 'add', g: 2, title: 'Add and take away tens',
  tip: 'Adding tens changes the tens and leaves the ones alone. 47 + 30: 4 tens + 3 tens = 7 tens, so 77. For 87 + 30, 11 tens is 110, so 117.',
  gen(d, R) {
    let a, b, plus, rev = false;
    if (d === 0) { plus = R.chance(.6); if (plus) { const t = R.i(1, 7); a = 10 * t + R.i(1, 9); b = R.i(1, 8 - t) * 10; } else { const t = R.i(3, 9); a = 10 * t + R.i(1, 9); b = R.i(1, t - 1) * 10; } }
    else if (d === 1) { plus = R.chance(.5); if (plus) { const t = R.i(4, 9); a = 10 * t + R.i(1, 9); b = R.i(10 - t, 9) * 10; } else { const tt = R.i(10, 18); a = 10 * tt + R.i(1, 9); b = R.i(tt - 9, 9) * 10; } }
    else { plus = R.chance(.5); rev = R.chance(.3); const h = R.i(1, 8), t = plus ? R.i(3, 9) : R.i(0, 5); a = 100 * h + 10 * t + R.i(1, 9); b = plus ? R.i(10 - t, 9) * 10 : R.i(t + 1, 9) * 10; }
    const ans = plus ? a + b : a - b, units = Math.floor(a / 10), o = a % 10, k = b / 10, nu = plus ? units + k : units - k, op = plus ? add : sub;
    if (rev) { const out = ans;
      return { text: B('? ' + (plus ? '+' : MINUS) + ' ' + b + ' = ' + N(out)), ans: a,
        how: ['The ? is the start. Undo it: ' + (plus ? 'take ' + b + ' away from ' : 'add ' + b + ' to ') + N(out) + '.', N(out) + ' is ' + Math.floor(out / 10) + ' tens and ' + o + ' ones. ' + Math.floor(out / 10) + ' tens ' + (plus ? MINUS : '+') + ' ' + k + ' tens = ' + units + ' tens, so the start is ' + B(N(a)) + '.'],
        steps: [S('How many tens are in ' + B(N(out)) + ' altogether?', Math.floor(out / 10)), S(qq((plus ? sub : add)(Math.floor(out / 10), k)), units), S(B(units + ' tens and ' + o + ' ones') + ' make what number?', a)],
        traps: traps([tp(plus ? out + b : out - b, 'a_tens', 'The ? is the start, so undo the ' + (plus ? 'adding' : 'taking away') + '.'), tp(plus ? out - k : out + k, 'n_place', b + ' is ' + k + ' tens, not ' + k + ' ones.'), tp(a + 100, 'a_borrow', 'Check the hundreds digit.'), tp(a - 100, 'a_regroup', 'Check the hundreds digit.')]) }; }
    const how = units < 10 && nu < 10 ? ['Only the tens change: ' + units + ' tens ' + (plus ? '+' : MINUS) + ' ' + k + ' tens = ' + nu + ' tens.', 'The ' + o + ' ones stay, so the answer is ' + B(N(ans)) + '.']
      : [N(a) + ' is ' + units + ' tens and ' + o + ' ones. ' + b + ' is ' + k + ' tens.', units + ' tens ' + (plus ? '+' : MINUS) + ' ' + k + ' tens = ' + nu + ' tens, which is ' + N(nu * 10) + '.', 'Keep the ' + o + ' ones: ' + add(nu * 10, o) + ' = ' + B(N(ans)) + '.'];
    return { text: qq(op(a, b)), ans, how, howVis: hopsSVG(a, [plus ? b : -b]),
      steps: [S('How many tens are in ' + B(N(a)) + ' altogether?', units), S(qq((plus ? add : sub)(units, k)), nu), S(B(nu + ' tens and ' + o + ' ones') + ' make what number?', ans)],
      traps: traps([tp(plus ? a + k : a - k, 'n_place', b + ' is ' + k + ' tens, not ' + k + ' ones.'), tp(ans + 10, 'a_tens', 'Count the tens again.'), tp(ans - 10, 'a_tens', 'Count the tens again.'), tp(plus ? ans + 1 : ans - 1, 'a_tens', 'The ones do not change.'),
        Math.floor(a / 100) !== Math.floor(ans / 100) ? (plus ? tp(ans - 100, 'a_regroup', '10 tens make a hundred. Count it.') : tp(ans + 100, 'a_borrow', 'You went back past a hundred, so the hundreds digit goes down by 1.')) : null]) };
  } },
{ id: 'a_bond100', s: 'add', g: 2, title: 'Friends of 100',
  tip: 'To make 100, the tens add up to 9 and the ones add up to 10. 63 + 37: 6 + 3 = 9 tens, and 3 + 7 = 10 ones.',
  gen(d, R) {
    const gen2 = (v, text) => { const t = Math.floor(v / 10), o = v % 10, ans = 100 - v;
      return { text, ans, howVis: hopsSVG(v, [10 - o, (9 - t) * 10].filter(Boolean)),
        how: ['The tens add up to 9 and the ones add up to 10 (the ones make the tenth ten).', t + ' + ' + (9 - t) + ' = 9 tens. ' + o + ' + ' + (10 - o) + ' = 10 ones.', 'So the answer is ' + add((9 - t) * 10, 10 - o) + ' = ' + B(ans) + '. Check: ' + add(v, ans) + ' = 100.'],
        steps: [S(B(t + ' + ? = 9'), 9 - t), S(B(o + ' + ? = 10'), 10 - o), S(qq(add((9 - t) * 10, 10 - o)), ans)],
        traps: traps([tp(ans + 10, 'a_bond100', 'The tens add up to 9, not 10, because the ones make one more ten.'), tp(ans - 1, 'a_bonds10', 'The ones add up to 10, not 9.'), tp(ans - 10, 'a_bond100', 'Check the tens: they add up to 9.'), tp(100 + v, 'a_bond100', 'The total is 100, so the missing number is less than 100.')]) }; };
    if (d === 0) {
      if (R.chance(.5)) { const t = R.i(1, 9), a = 10 * t, b = 100 - a;
        return { text: B(a + ' + ? = 100'), ans: b, how: [a + ' is ' + t + ' tens, and 100 is 10 tens.', t + ' tens + ' + (10 - t) + ' tens = 10 tens, so the answer is ' + B(b) + '.'],
          steps: [S(B(t + ' + ? = 10'), 10 - t), S(B((10 - t) + ' tens') + ' = ?', b)],
          traps: traps([tp(10 - t, 'n_place', 'You need ' + (10 - t) + ' tens, not ' + (10 - t) + ' ones.'), tp(b + 10, 'a_bonds10', 'Check the friend of ' + t + '.'), tp(b - 10, 'a_bonds10', 'Check the friend of ' + t + '.')]) }; }
      const v = R.i(1, 8) * 10 + 5; return gen2(v, B(v + ' + ? = 100'));
    }
    if (d === 1) { let v; do { v = R.i(11, 89); } while (v % 10 === 0); const f = R.i(0, 2); return gen2(v, B(f === 0 ? v + ' + ? = 100' : f === 1 ? '? + ' + v + ' = 100' : '100 = ' + v + ' + ?')); }
    const c = R.i(0, 2);
    if (c === 0) { let v; do { v = R.i(11, 99) * 10; } while (v % 100 === 0); const h = Math.floor(v / 100), tt = (v % 100) / 10, ans = 1000 - v;
      return { text: B(N(v) + ' + ? = ' + N(1000)), ans,
        how: ['Same trick, one place bigger: the hundreds add up to 9 and the tens add up to 10.', h + ' + ' + (9 - h) + ' = 9 hundreds. ' + tt + ' + ' + (10 - tt) + ' = 10 tens.', add((9 - h) * 100, (10 - tt) * 10) + ' = ' + B(ans) + '.'],
        steps: [S(B(h + ' + ? = 9'), 9 - h), S(B(tt + ' + ? = 10'), 10 - tt), S(qq(add((9 - h) * 100, (10 - tt) * 10)), ans)],
        traps: traps([tp(ans + 100, 'a_bond100', 'The hundreds add up to 9, not 10, because the tens make one more hundred.'), tp(ans - 10, 'a_bonds10', 'The tens add up to 10, not 9.'), tp(1000 - v / 10, 'n_place', 'Line up the places: ' + N(v) + ' has ' + h + ' hundreds.')]) }; }
    if (c === 1) { const v = R.i(1, 9), ans = 100 - v;
      return { text: B(v + ' + ? = 100'), ans,
        how: [v + ' has 0 tens. The tens add up to 9 and the ones add up to 10.', '0 + 9 = 9 tens and ' + v + ' + ' + (10 - v) + ' = 10 ones: ' + add(90, 10 - v) + ' = ' + B(ans) + '.'],
        steps: [S(B('0 + ? = 9'), 9), S(B(v + ' + ? = 10'), 10 - v), S(qq(add(90, 10 - v)), ans)],
        traps: traps([tp(10 - v, 'a_bond100', 'That makes 10, not 100. You also need 9 more tens.'), tp(ans + 10, 'a_bond100', 'The tens add up to 9, not 10.'), tp(ans - 1, 'a_bonds10', 'The ones add up to 10.')]) }; }
    let v; do { v = R.i(11, 89); } while (v % 10 === 0); return gen2(v, B('100 = ? + ' + v));
  } },
{ id: 'a_regroup', s: 'add', g: 2, title: 'Trade 10 ones for a ten', pre: ['n_place'],
  tip: '10 ones make 1 ten. 4 tens and 17 ones: trade 10 ones for a ten, so 5 tens and 7 ones = 57. This is what carrying means.',
  gen(d, R) {
    if (d === 0 || (d === 1 && R.chance(.5))) {
      const t = d === 0 ? R.i(1, 8) : R.i(1, 6), o = d === 0 ? R.i(11, 19) : R.i(20, 39), k = Math.floor(o / 10), r = o % 10, ans = 10 * t + o;
      return { text: B(t + ' tens') + ' and ' + B(o + ' ones') + ' make what number?', ans, vis: d === 0 ? blocksSVG(0, t, o) : '',
        how: [o + ' ones is ' + k + ' ' + plural(k, 'ten', 'tens') + ' and ' + r + ' ones. Trade them.', t + ' tens + ' + k + ' ' + plural(k, 'ten', 'tens') + ' = ' + (t + k) + ' tens.', (t + k) + ' tens and ' + r + ' ones make ' + B(ans) + '.'],
        steps: [S(B(o + ' ones') + ' = ' + k + ' ' + plural(k, 'ten', 'tens') + ' and how many ones?', r), S(B(t + ' tens + ' + k + ' ' + plural(k, 'ten', 'tens')) + ' = how many tens?', t + k), S(B((t + k) + ' tens and ' + r + ' ones') + ' make what number?', ans)],
        traps: traps([tp(+(String(t) + String(o)), 'a_regroup', o + ' ones do not fit in the ones place. Trade 10 ones for a ten.'), tp(ans - 10 * k, 'a_regroup', 'You dropped the ' + plural(k, 'ten', 'tens') + ' made from the ones.'), tp(t + o, 'n_place', 'Each ten is worth 10, so ' + t + ' tens is ' + (10 * t) + '.')]) };
    }
    if (d === 1) {
      const h = R.i(1, 8), tt = R.i(10, 19), o = R.i(0, 9), ans = 100 * h + 10 * tt + o;
      return { text: B(h + ' hundreds') + ', ' + B(tt + ' tens') + ' and ' + B(o + ' ones') + ' make what number?', ans,
        how: [tt + ' tens is 1 hundred and ' + (tt - 10) + ' tens. Trade 10 tens for a hundred.', h + ' hundreds + 1 hundred = ' + (h + 1) + ' hundreds.', (h + 1) + ' hundreds, ' + (tt - 10) + ' tens and ' + o + ' ones make ' + B(ans) + '.'],
        steps: [S(B(tt + ' tens') + ' = 1 hundred and how many tens?', tt - 10), S(B(h + ' hundreds + 1 hundred') + ' = how many hundreds?', h + 1), S(B((h + 1) + ' hundreds, ' + (tt - 10) + ' tens and ' + o + ' ones') + ' make what number?', ans)],
        traps: traps([tp(+(String(h) + String(tt) + String(o)), 'a_regroup', tt + ' tens do not fit in the tens place. Trade 10 tens for a hundred.'), tp(ans - 100, 'a_regroup', 'You dropped the hundred made from 10 tens.'), tp(100 * h + tt + o, 'n_place', tt + ' tens is ' + (10 * tt) + ', not ' + tt + '.')]) };
    }
    const h = R.i(1, 7), tt = R.i(10, 18), oo = R.i(10, 19), t2 = tt + 1, ans = 100 * h + 10 * tt + oo;
    return { text: B(h + ' hundreds') + ', ' + B(tt + ' tens') + ' and ' + B(oo + ' ones') + ' make what number?', ans,
      how: [oo + ' ones = 1 ten and ' + (oo - 10) + ' ones. Now there are ' + t2 + ' tens.', t2 + ' tens = 1 hundred and ' + (t2 - 10) + ' tens. Now there are ' + (h + 1) + ' hundreds.', (h + 1) + ' hundreds, ' + (t2 - 10) + ' tens and ' + (oo - 10) + ' ones make ' + B(ans) + '.'],
      steps: [S(B(tt + ' tens + 1 ten') + ' = how many tens?', t2), S(B(t2 + ' tens') + ' = 1 hundred and how many tens?', t2 - 10), S(B((h + 1) + ' hundreds, ' + (t2 - 10) + ' tens and ' + (oo - 10) + ' ones') + ' make what number?', ans)],
      traps: traps([tp(ans - 10, 'a_regroup', 'The ' + oo + ' ones make one more ten. Count it.'), tp(ans - 100, 'a_regroup', 'The tens make one more hundred. Count it.'), tp(ans - 110, 'a_regroup', 'Both the ones and the tens need a trade.')]) };
  } },
{ id: 'a_split', s: 'add', g: 2, title: 'Add 2-digit numbers: tens, then ones',
  tip: 'Keep the first number whole. Add the tens of the second number, then the ones. 47 + 36: 47 + 30 = 77, then 77 + 6 = 83.',
  gen(d, R) {
    let a, b;
    if (d === 0) { do { a = R.i(21, 75); b = R.i(11, 99 - a); } while (a % 10 + b % 10 >= 10 || b % 10 === 0 || b < 11); }
    else if (d === 1) { do { a = R.i(25, 78); b = R.i(13, 79); } while (a % 10 + b % 10 < 11 || a + b > 150 || b % 10 === 0); }
    else { if (R.chance(.5)) { do { a = R.i(120, 780); b = R.i(13, 89); } while (a % 10 + b % 10 < 11 || b % 10 === 0); } else { do { a = R.i(55, 89); b = R.i(45, 89); } while (a % 10 + b % 10 < 11 || b % 10 === 0 || a + b < 110); } }
    const bt = b - b % 10, bo = b % 10, mid = a + bt, ans = a + b, cross = mid % 10 + bo >= 10, need = 10 - mid % 10;
    const how = ['Keep ' + N(a) + ' whole. Split ' + b + ' into ' + bt + ' and ' + bo + '.', add(a, bt) + ' = ' + N(mid) + '.',
      cross ? add(mid, bo) + ': make a ten first. ' + add(mid, need) + ' = ' + N(mid + need) + ', then + ' + (bo - need) + ' = ' + B(N(ans)) + '.' : add(mid, bo) + ' = ' + B(N(ans)) + '.'];
    const steps = [S(qq(add(a, bt)), mid)].concat(cross ? [S(B(N(mid) + ' + ? = ' + N(mid + need)), need), S(qq(add(mid + need, bo - need)), ans)] : [S(qq(add(mid, bo)), ans)]);
    const t = [cross ? tp(ans - 10, 'a_regroup', 'The ones made a new ten. Count it.') : null, tp(ans + 10, 'a_tens', 'Check the tens: add just ' + bt + '.'), cross ? null : tp(ans - 10, 'a_tens', 'Check the tens: add all ' + bt + '.'),
      cross && a < 100 ? tp(+(String(Math.floor(a / 10) + bt / 10) + String(a % 10 + bo)), 'a_regroup', (a % 10 + bo) + ' ones is 1 ten and ' + (a % 10 + bo - 10) + ' ones. Trade the ten.') : null,
      cross ? tp(ans - 1, 'a_make10', 'Check the step past the ten.') : null, cross ? tp(ans + 1, 'a_make10', 'Check the step past the ten.') : null];
    return { text: qq(add(a, b)), ans, how, steps, traps: traps(t), howVis: hopsSVG(a, [bt, bo]) };
  } },
{ id: 'a_borrow', s: 'add', g: 2, title: 'Trade a ten for 10 ones', pre: ['n_place'],
  tip: 'When there are not enough ones, trade 1 ten for 10 ones. 53 is 5 tens and 3 ones, or 4 tens and 13 ones. This is what borrowing means.',
  gen(d, R) {
    if (d === 0) { const t = R.i(2, 9), o = R.i(0, 9), v = 10 * t + o, c = R.chance(.6);
      return { text: c ? B(v + ' = ' + (t - 1) + ' tens and ? ones') : B(v + ' = ? tens and ' + (o + 10) + ' ones'), ans: c ? o + 10 : t - 1, vis: blocksSVG(0, t, o),
        how: ['Trade 1 of the ' + t + ' tens for 10 ones.', t + ' tens become ' + (t - 1) + ' tens, and ' + o + ' ones become ' + o + ' + 10 = ' + (o + 10) + ' ones. ' + (c ? 'The answer is ' + B(o + 10) + '.' : 'The answer is ' + B(t - 1) + '.')],
        steps: c ? [S(qq(add(o, 10)), o + 10)] : [S(qq(sub(t, 1)), t - 1)],
        traps: traps(c ? [tp(o, 'a_borrow', 'After the trade there are 10 more ones.'), tp(10, 'a_borrow', 'Add the 10 traded ones to the ' + o + ' ones already there.'), tp(o + 1, 'a_borrow', 'One ten is 10 ones, not 1.')]
          : [tp(t, 'a_borrow', 'One ten was traded, so there is one ten less.'), tp(t + 1, 'a_borrow', 'Trading takes a ten away.'), tp(o + 10, 'n_place', 'The question asks for the tens.')]) }; }
    if (d === 1) { let a, b; do { a = R.i(21, 98); b = R.i(2, 9); } while (b <= a % 10); const t = Math.floor(a / 10), o = a % 10, x = o + 10 - b, ans = a - b;
      return { text: qq(sub(a, b)), ans,
        how: ['There are only ' + o + ' ones, not enough to take ' + b + '. Trade a ten: ' + a + ' = ' + (t - 1) + ' tens and ' + (o + 10) + ' ones.', sub(o + 10, b) + ' = ' + x + ' ones.', (t - 1) + ' tens and ' + x + ' ones make ' + B(ans) + '.'],
        steps: [S(B(a + ' = ' + (t - 1) + ' tens and ? ones'), o + 10), S(qq(sub(o + 10, b)), x), S(B((t - 1) + ' tens and ' + x + ' ones') + ' make what number?', ans)],
        traps: traps([tp(colSub(a, b), 'a_borrow', 'You took ' + o + ' from ' + b + '. Trade a ten first so there are enough ones.'), tp(ans + 10, 'a_borrow', 'After the trade there is one ten less.'), tp(ans - 1, 'a_thinkadd', 'Check ' + sub(o + 10, b) + '.'), tp(ans + 1, 'a_thinkadd', 'Check ' + sub(o + 10, b) + '.')]) }; }
    const c = R.i(0, 2);
    if (c === 0) { let a, b; do { a = R.i(31, 98); b = R.i(12, a - 10); } while (b % 10 <= a % 10); const t = Math.floor(a / 10), o = a % 10, bt = Math.floor(b / 10), bo = b % 10, x = o + 10 - bo, y = t - 1 - bt, ans = a - b;
      return { text: qq(sub(a, b)), ans,
        how: ['Not enough ones to take ' + bo + ', so trade a ten: ' + a + ' = ' + (t - 1) + ' tens and ' + (o + 10) + ' ones.', 'Ones: ' + sub(o + 10, bo) + ' = ' + x + '. Tens: ' + sub(t - 1, bt) + ' = ' + y + '.', y + ' tens and ' + x + ' ones make ' + B(ans) + '.'],
        steps: [S(B(a + ' = ' + (t - 1) + ' tens and ? ones'), o + 10), S(qq(sub(o + 10, bo)), x), S(qq(sub(t - 1, bt)), y), S(B(y + ' tens and ' + x + ' ones') + ' make what number?', ans)],
        traps: traps([tp(colSub(a, b), 'a_borrow', 'You took the smaller ones digit from the bigger one. Trade a ten first.'), tp(ans + 10, 'a_borrow', 'After the trade there is one ten less.'), tp(ans - 10, 'a_tens', 'Check the tens.')]) }; }
    const h = R.i(2, 9), o = R.i(0, 9);
    if (c === 1) { const t = R.i(0, 5), v = 100 * h + 10 * t + o;
      return { text: B(v + ' = ' + (h - 1) + ' hundreds, ? tens and ' + o + ' ones'), ans: t + 10,
        how: ['One hundred was traded for 10 tens.', 'So the ' + t + ' tens become ' + t + ' + 10 = ' + B(t + 10) + ' tens.'],
        steps: [S('How many tens is 1 hundred?', 10), S(qq(add(t, 10)), t + 10)],
        traps: traps([tp(t, 'a_borrow', 'A hundred was traded, so there are 10 more tens.'), tp(10, 'a_borrow', 'Add the 10 new tens to the ' + t + ' tens already there.'), tp(t + 1, 'a_borrow', 'One hundred is 10 tens, not 1 ten.')]) }; }
    const v = 100 * h + o;
    return { text: B(v + ' = ' + (h - 1) + ' hundreds, 9 tens and ? ones'), ans: o + 10,
      how: ['There are no tens, so trade twice: 1 hundred for 10 tens, then 1 of those tens for 10 ones.', h + ' hundreds → ' + (h - 1) + ' hundreds and 10 tens → ' + (h - 1) + ' hundreds, 9 tens and ' + o + ' + 10 = ' + B(o + 10) + ' ones.'],
      steps: [S('After trading a hundred, how many tens are there?', 10), S('Trade one of those tens. How many tens are left?', 9), S(qq(add(o, 10)), o + 10)],
      traps: traps([tp(o, 'a_borrow', 'One ten was traded too, so there are 10 more ones.'), tp(o + 1, 'a_borrow', 'One ten is 10 ones, not 1.'), tp(o + 100, 'a_borrow', 'Only one ten became ones.')]) };
  } },
{ id: 'a_countup', s: 'add', g: 2, title: 'Take away by counting up',
  tip: 'To find how far apart two numbers are, start at the smaller one and hop up: to the next ten, then by tens, then the rest. 62 ' + MINUS + ' 38: 2 + 20 + 2 = 24.',
  gen(d, R) {
    let a, b;
    if (d === 0) { do { b = R.i(15, 88); a = b + R.i(3, 12); } while (Math.floor(a / 10) === Math.floor(b / 10) || b % 10 === 0 || a > 99); }
    else if (d === 1) { do { a = R.i(41, 98); b = R.i(14, a - 11); } while (b % 10 <= a % 10 || b % 10 === 0); }
    else if (R.chance(.7)) { do { a = R.i(3, 9) * 100 + R.i(1, 30); b = a - R.i(110, 260); } while (b % 10 === 0 || a % 10 === 0); }
    else { a = 1000 + R.i(1, 9); do { b = R.i(981, 996); } while (b % 10 === 0); }
    return countUpProblem(a, b, d);
  } },
{ id: 'a_subsplit', s: 'add', g: 3, title: 'Take away tens, then ones',
  tip: 'Take away the tens first, then the ones. 85 ' + MINUS + ' 32: 85 ' + MINUS + ' 30 = 55, then 55 ' + MINUS + ' 2 = 53. If the ones run out, go back to the ten first.',
  gen(d, R) {
    let a, b;
    if (d === 0) { do { a = R.i(35, 99); b = R.i(12, a - 11); } while (b % 10 > a % 10 || b % 10 === 0); }
    else if (d === 1) { do { a = R.i(42, 99); b = R.i(13, a - 12); } while (b % 10 <= a % 10 || b % 10 === 0); }
    else { do { a = R.i(150, 900); b = R.i(13, 89); } while (b % 10 <= a % 10 || b % 10 === 0); }
    const bt = b - b % 10, bo = b % 10, mid = a - bt, ans = a - b, k = mid % 10, cross = k > 0 && k < bo, borrow = k < bo;
    const how = ['Split ' + b + ' into ' + bt + ' and ' + bo + '.', sub(a, bt) + ' = ' + N(mid) + '.',
      cross ? sub(mid, bo) + ': go back to the ten first. ' + sub(mid, k) + ' = ' + N(mid - k) + ', then ' + sub(mid - k, bo - k) + ' = ' + B(N(ans)) + '.' : sub(mid, bo) + ' = ' + B(N(ans)) + '.'];
    const steps = [S(qq(sub(a, bt)), mid)].concat(cross ? [S(qq(sub(mid, k)), mid - k), S(qq(sub(mid - k, bo - k)), ans)] : [S(qq(sub(mid, bo)), ans)]);
    return { text: qq(sub(a, b)), ans, how, steps, howVis: hopsSVG(a, [-bt, -bo]),
      traps: traps([borrow ? tp(colSub(a, b), 'a_borrow', 'You took the smaller ones digit from the bigger one. Go back to the ten first.') : null, tp(mid + bo, 'a_subsplit', 'Take away the ' + bo + ' too, do not add it.'), tp(ans - 10, 'a_tens', 'Take away just ' + bt + '. Check the tens.'), borrow ? tp(ans + 10, 'a_borrow', 'Going back past a ten makes the tens digit one smaller.') : tp(ans + 10, 'a_tens', 'Take away all ' + bt + '. Check the tens.')]) };
  } },
{ id: 'a_compensate', s: 'add', g: 3, title: 'Round and adjust',
  tip: 'Use a friendly number, then fix it. 47 + 29 = 47 + 30 ' + MINUS + ' 1 = 76. 63 ' + MINUS + ' 28 = 63 ' + MINUS + ' 30 + 2 = 35.',
  gen(d, R) {
    let a, b, op;
    if (d === 0) { op = '+'; b = R.pick([19, 29, 39, 49, 18, 28, 38]); a = R.i(21, 79); }
    else if (d === 1) { op = R.chance(.5) ? '+' : '−'; do { b = R.i(11, 79); } while (![1, 2, 8, 9].includes(b % 10)); a = R.chance(.6) ? R.i(op === '+' ? 21 : b + 10, 99) : R.i(120, 600); }
    else { op = R.chance(.5) ? '+' : '−'; do { b = R.i(13, 89); } while (![1, 2, 3, 7, 8, 9].includes(b % 10)); a = R.i(150, 900); }
    if (op === '−' && a - b < 5) return null;
    return compProblem(a, b, op, Math.round(b / 10) * 10, 'a_compensate');
  } },
{ id: 'a_friendly', s: 'add', g: 3, title: 'Add in a smart order',
  tip: 'You can add in any order. Find two numbers that make a 10 or a 100 and add those first. 7 + 6 + 3: 7 + 3 = 10, then 10 + 6 = 16.',
  gen(d, R) {
    let pairs, rest;
    if (d === 0) { const a = R.i(1, 9); pairs = [[a, 10 - a]]; rest = [R.i(2, 9)]; }
    else if (d === 1) { let x; do { x = R.i(11, 59); } while (x % 10 === 0); pairs = [[x, R.i(0, 3) * 10 + 10 - x % 10]]; rest = [R.i(12, 39)]; }
    else if (R.chance(.5)) { const x = R.pick([25, 35, 45, 15, 65, 55, 38, 64, 72, 86, 47]); pairs = [[x, 100 - x]]; rest = [R.i(12, 89)]; }
    else { const a = R.i(11, 19), e = R.i(2, 8); pairs = [[a, 20 - a], [e, 10 - e]]; rest = []; }
    const p = pairs[0], nums = pairs.length > 1 ? [p[0], pairs[1][0], p[1], pairs[1][1]] : (R.chance(.5) ? [p[0], rest[0], p[1]] : [p[1], rest[0], p[0]]);
    if (new Set(nums).size < nums.length) return null;
    const ps = p[0] + p[1], ans = sum(nums), how = ['Look for friends: ' + add(p[0], p[1]) + ' = ' + ps + '.'], steps = [S(qq(add(p[0], p[1])), ps)];
    if (pairs.length > 1) { const q = pairs[1], qs = q[0] + q[1]; how.push('Another friendly pair: ' + add(q[0], q[1]) + ' = ' + qs + '.', add(ps, qs) + ' = ' + B(ans) + '.'); steps.push(S(qq(add(q[0], q[1])), qs), S(qq(add(ps, qs)), ans)); }
    else { how.push(add(ps, rest[0]) + ' = ' + B(ans) + '.'); steps.push(S(qq(add(ps, rest[0])), ans)); }
    return { text: qq(nums.join(' + ')), ans, how, steps,
      traps: traps([tp(ans - 10, 'a_regroup', 'A ten got lost. Check where the ones made a new ten.'), tp(ans + 10, 'a_regroup', 'You counted a ten twice.'), tp(ans - 1, 'a_bonds10', 'Check the friendly pair.'), tp(ans + 1, 'a_bonds10', 'Check the friendly pair.'), d === 2 ? tp(ans - 100, 'a_bond100', 'The friendly pair makes 100. Count it.') : null]) };
  } },
{ id: 'a_samediff', s: 'add', g: 3, title: 'Same-difference trick',
  tip: 'Move both numbers by the same amount and the gap stays the same. 72 ' + MINUS + ' 38: add 2 to both, so 74 ' + MINUS + ' 40 = 34.',
  gen(d, R) {
    let a, b, F;
    if (d === 0) { b = R.i(1, 6) * 10 + 9; a = b + R.i(12, 50); F = b + 1; }
    else if (d === 1) { const e = R.pick([7, 8, 9, 1, 2]); b = R.i(1, 6) * 10 + e; a = b + R.i(12, 50); F = Math.round(b / 10) * 10; }
    else { const e = R.pick([97, 98, 99, 95, 1, 2]); b = R.i(1, 6) * 100 + e; a = b + R.i(102, 350); F = Math.round(b / 100) * 100; }
    const k = F - b, up = k > 0, ak = a + k, ans = a - b, kk = Math.abs(k);
    return { text: qq(sub(a, b)), ans,
      how: ['Make ' + N(b) + ' friendly: ' + (up ? 'add ' : 'take away ') + kk + ' to get ' + N(F) + '.', (up ? 'Add ' : 'Take ') + kk + (up ? ' to ' : ' from ') + N(a) + ' too: ' + N(ak) + '. Both moved by ' + kk + ', so the gap stays the same.', sub(ak, F) + ' = ' + B(N(ans)) + '.'],
      steps: [S(B(N(b) + ' ' + (up ? '+' : MINUS) + ' ? = ' + N(F)), kk), S(qq(up ? add(a, kk) : sub(a, kk)), ak), S(qq(sub(ak, F)), ans)],
      traps: traps([tp(a - F, 'a_samediff', 'You moved ' + N(b) + ' to ' + N(F) + '. Move ' + N(a) + ' by the same ' + kk + '.'), tp(ans + k, 'a_samediff', (up ? 'Add the same amount to' : 'Take the same amount from') + ' both numbers, not just one.'), tp(ans + 10, 'a_tens', 'Check the tens.'), tp(ans - 10, 'a_tens', 'Check the tens.')]) };
  } },
{ id: 'a_from100', s: 'add', g: 3, title: 'Take away from 100 and 1,000',
  tip: 'From 100: the tens go to 9 and the ones go to 10. 100 ' + MINUS + ' 37 = 63 (3 + 6 = 9, 7 + 3 = 10). From 1,000: all to 9, the last to 10.',
  gen(d, R) {
    if (d === 0) { const t = R.i(1, 9), b = 10 * t, ans = 100 - b;
      return { text: qq(sub(100, b)), ans, how: ['100 is 10 tens. ' + b + ' is ' + t + ' tens.', '10 tens ' + MINUS + ' ' + t + ' tens = ' + (10 - t) + ' tens = ' + B(ans) + '.'],
        steps: [S(qq(sub(10, t)), 10 - t), S(B((10 - t) + ' tens') + ' = ?', ans)],
        traps: traps([tp(10 - t, 'n_place', 'You need ' + (10 - t) + ' tens, not ' + (10 - t) + ' ones.'), tp(ans + 10, 'a_bonds10', 'Check the friend of ' + t + '.'), tp(ans - 10, 'a_bonds10', 'Check the friend of ' + t + '.')]) }; }
    if (d === 1) { let b; do { b = R.i(11, 89); } while (b % 10 === 0); const t = Math.floor(b / 10), o = b % 10, ans = 100 - b;
      return { text: qq(sub(100, b)), ans, howVis: hopsSVG(b, [10 - o, (9 - t) * 10].filter(Boolean)),
        how: ['From 100: the tens go to 9 and the ones go to 10.', t + ' + ' + (9 - t) + ' = 9 and ' + o + ' + ' + (10 - o) + ' = 10.', 'So ' + sub(100, b) + ' = ' + B(ans) + '. Check: ' + add(b, ans) + ' = 100.'],
        steps: [S(B(t + ' + ? = 9'), 9 - t), S(B(o + ' + ? = 10'), 10 - o), S(qq(add((9 - t) * 10, 10 - o)), ans)],
        traps: traps([tp(ans + 10, 'a_from100', 'The tens go to 9, not 10: the ones use up one ten.'), tp(ans - 1, 'a_from100', 'The ones go to 10, not 9.'), tp(colSub(100, b), 'a_borrow', 'There are no ones or tens in 100 to take from. Use the 9s and the 10.'), tp(ans - 10, 'a_from100', 'Check the tens: they go to 9.')]) }; }
    let b; do { b = R.i(111, 989); } while (b % 100 === 0); const [h, t, o] = digitsOf(b), ans = 1000 - b, zero = o === 0;
    if (zero) return { text: qq(sub(1000, b)), ans,
      how: ['It ends in 0, so the 0 stays. The hundreds go to 9 and the tens go to 10.', h + ' + ' + (9 - h) + ' = 9 and ' + t + ' + ' + (10 - t) + ' = 10.', 'So ' + sub(1000, b) + ' = ' + B(ans) + '. Check: ' + add(b, ans) + ' = 1,000.'],
      steps: [S(B(h + ' + ? = 9'), 9 - h), S(B(t + ' + ? = 10'), 10 - t), S(qq(add((9 - h) * 100, (10 - t) * 10)), ans)],
      traps: traps([tp(ans + 100, 'a_from100', 'The hundreds go to 9, not 10.'), tp(ans - 10, 'a_from100', 'The last digit that is not 0 goes to 10.'), tp(ans - 9, 'a_from100', 'The 0 stays 0 here.')]) };
    return { text: qq(sub(1000, b)), ans,
      how: ['From 1,000: every digit goes to 9, and the last one goes to 10.', h + ' → ' + (9 - h) + ', ' + t + ' → ' + (9 - t) + ', ' + o + ' → ' + (10 - o) + '.', 'So ' + sub(1000, b) + ' = ' + B(ans) + '. Check: ' + add(b, ans) + ' = 1,000.'],
      steps: [S(B(h + ' + ? = 9'), 9 - h), S(B(t + ' + ? = 9'), 9 - t), S(B(o + ' + ? = 10'), 10 - o), S('Put the digits ' + (9 - h) + ', ' + (9 - t) + ', ' + (10 - o) + ' together. What number is it?', ans)],
      traps: traps([tp(ans + 100, 'a_from100', 'The hundreds go to 9, not 10.'), tp(ans + 10, 'a_from100', 'The tens go to 9, not 10.'), tp(ans - 1, 'a_from100', 'The last digit goes to 10, not 9.'), tp(colSub(1000, b), 'a_borrow', 'Use the 9s and the 10, not the smaller digit from the bigger one.')]) };
  } },
{ id: 'a_plus99', s: 'add', g: 3, title: 'Add and take away 99, 199, 999',
  tip: '99 is 1 less than 100. 347 + 99: add 100 to get 447, then take 1 back: 446. 347 ' + MINUS + ' 99: take 100, give 1 back: 248.',
  gen(d, R) {
    let a, b, op = R.chance(d === 0 ? .65 : .5) ? '+' : '−';
    if (d === 0) { b = R.pick([99, 99, 98, 101]); a = R.i(120, 850); }
    else if (d === 1) { b = R.pick([199, 198, 299, 298, 201, 399, 301, 102]); a = R.i(150, 700); }
    else { b = R.pick([999, 998, 1001, 499, 501, 1999]); a = R.i(1200, 8500); }
    if (op === '−' && a - b < 20) op = '+';
    const p = compProblem(a, b, op, Math.round(b / 100) * 100, 'a_plus99');
    p.traps = traps(p.traps.filter(t => t.c !== 'a_tens').concat([tp(p.ans + 100, 'n_place', 'Check the hundreds digit.'), tp(p.ans - 100, 'n_place', 'Check the hundreds digit.')]));
    return p;
  } },
{ id: 'a_3digit', s: 'add', g: 3, title: 'Add 3-digit numbers place by place', paper: true,
  tip: 'Add the hundreds, the tens and the ones on their own, then put the three answers together. 478 + 365: 700 + 130 + 13 = 843.',
  gen(d, R) {
    let a, b, ds;
    for (let k = 0; k < 50; k++) {
      a = R.i(111, 899); b = R.i(111, 899); const A = digitsOf(a), Bd = digitsOf(b);
      if (A.concat(Bd).includes(0)) continue;
      const c1 = A[2] + Bd[2] >= 10, c2 = A[1] + Bd[1] + (c1 ? 1 : 0) >= 10, carries = (c1 ? 1 : 0) + (c2 ? 1 : 0);
      if (d === 0 && (carries || a + b > 999)) continue; if (d === 1 && (carries !== 1 || a + b > 999)) continue; if (d === 2 && (!c1 || A[1] + Bd[1] < 10)) continue;
      ds = [A, Bd]; break;
    }
    if (!ds) return null;
    const [A, Bd] = ds, H = (A[0] + Bd[0]) * 100, Tt = (A[1] + Bd[1]) * 10, O = A[2] + Bd[2], ans = a + b;
    return { text: 'Add place by place: ' + qq(add(a, b)), vis: stackHTML([a, b], '+'), ans,
      hint: 'Add the hundreds, then the tens, then the ones. Then add the three answers.',
      how: [add(A[0] * 100, Bd[0] * 100) + ' = ' + N(H), add(A[1] * 10, Bd[1] * 10) + ' = ' + N(Tt), add(A[2], Bd[2]) + ' = ' + O, N(H) + ' + ' + N(Tt) + ' + ' + O + ' = ' + B(N(ans))],
      steps: [S(qq(add(A[0] * 100, Bd[0] * 100)), H), S(qq(add(A[1] * 10, Bd[1] * 10)), Tt), S(qq(add(A[2], Bd[2])), O), S(qq(N(H) + ' + ' + N(Tt) + ' + ' + O), ans)],
      traps: traps([O >= 10 ? tp(ans - 10, 'a_regroup', 'The ones made ' + O + ', which is 1 ten and ' + (O - 10) + ' ones. Count that ten.') : null, Tt >= 100 ? tp(ans - 100, 'a_regroup', 'The tens made ' + Tt + ', which has a hundred in it. Count that hundred.') : null,
        O >= 10 && Tt >= 100 ? tp(ans - 110, 'a_regroup', 'Both the ones and the tens made extra. Count them.') : null, tp(ans + 100, 'n_place', 'Check the hundreds.'), tp(ans + 10, 'a_split', 'Check the tens.')]) };
  } },
{ id: 'a_sub3', s: 'add', g: 3, title: 'Take away 3-digit numbers', paper: true,
  tip: 'If every top digit is bigger, take away place by place. If not, count up from the smaller number: to the next ten, the next hundred, then the rest.',
  gen(d, R) {
    let a, b;
    if (d === 0) {
      do { a = R.i(300, 999); b = R.i(111, a - 100); } while (digitsOf(b).some((x, i) => x > digitsOf(a)[i]) || digitsOf(b).includes(0));
      const A = digitsOf(a), Bd = digitsOf(b), H = (A[0] - Bd[0]) * 100, Tt = (A[1] - Bd[1]) * 10, O = A[2] - Bd[2], ans = a - b;
      return { text: 'Take away place by place: ' + qq(sub(a, b)), vis: stackHTML([a, b], MINUS), ans,
        hint: 'Every top digit is bigger, so take away the hundreds, the tens and the ones on their own.',
        how: [sub(A[0] * 100, Bd[0] * 100) + ' = ' + N(H), sub(A[1] * 10, Bd[1] * 10) + ' = ' + N(Tt), sub(A[2], Bd[2]) + ' = ' + O, N(H) + ' + ' + N(Tt) + ' + ' + O + ' = ' + B(N(ans))],
        steps: [S(qq(sub(A[0] * 100, Bd[0] * 100)), H), S(qq(sub(A[1] * 10, Bd[1] * 10)), Tt), S(qq(sub(A[2], Bd[2])), O), S(qq(N(H) + ' + ' + N(Tt) + ' + ' + O), ans)],
        traps: traps([tp(a + b, 'a_sub3', 'This is take away, so the answer is smaller than ' + a + '.'), tp(ans + 100, 'n_place', 'Check the hundreds.'), tp(ans - 100, 'n_place', 'Check the hundreds.'), tp(ans + 10, 'a_tens', 'Check the tens.')]) };
    }
    if (d === 1) { do { a = R.i(300, 999); b = R.i(111, a - 60); } while (!((b % 10 > a % 10) !== (Math.floor(b / 10) % 10 > Math.floor(a / 10) % 10)) || b % 10 === 0 || Math.floor(a / 100) === Math.floor(b / 100)); }
    else { const h = R.i(3, 9), c = R.i(0, 2); a = c === 0 ? h * 100 : c === 1 ? h * 100 + R.i(1, 9) : h * 100 + R.i(1, 9) * 10; do { b = R.i(111, a - 50); } while (b % 10 === 0 || Math.floor(a / 100) === Math.floor(b / 100)); }
    const hops = []; let at = b; const go = t => { if (t > at && t <= a) { hops.push([at, t]); at = t; } };
    if (at % 10) go(Math.ceil(at / 10) * 10); if (at % 100) go(Math.ceil(at / 100) * 100); go(a);
    const sizes = hops.map(h => h[1] - h[0]), ans = a - b;
    return { text: 'Count up: ' + qq(sub(a, b)), vis: stackHTML([a, b], MINUS), ans, howVis: hopsSVG(b, sizes),
      hint: 'Count up from ' + N(b) + ': first to the next ten, then to the next hundred, then to ' + N(a) + '.',
      how: hops.map(h => N(h[0]) + ' → ' + N(h[1]) + ' is ' + N(h[1] - h[0])).concat([sizes.map(N).join(' + ') + ' = ' + B(N(ans))]),
      steps: hops.map(h => S('From ' + B(N(h[0])) + ' up to ' + B(N(h[1])) + ' is how much?', h[1] - h[0])).concat([S(qq(sizes.map(N).join(' + ')), ans)]),
      traps: traps([tp(colSub(a, b), 'a_borrow', 'Taking the smaller digit from the bigger one in each place does not work here. Count up instead.')].concat(sizes.map(s => tp(ans - s, 'a_countup', 'Did you leave out a hop? Add every hop.')), [tp(ans + 10, 'a_countup', 'Check the hops.'), tp(ans + 100, 'a_countup', 'Check the hops.')])) };
  } },
{ id: 'a_thousands', s: 'add', g: 4, title: 'Add and take away thousands',
  tip: 'Think in hundreds. 4,500 + 2,800 is 45 hundreds + 28 hundreds = 73 hundreds, which is 7,300.',
  gen(d, R) {
    let A, Bh, plus = R.chance(.5);
    for (let k = 0; k < 60; k++) {
      if (d < 2) { A = R.i(11, 89); Bh = R.i(11, 89); } else { A = R.i(100, 299); Bh = R.i(21, 99); }
      if (A % 10 === 0 || Bh % 10 === 0) continue;
      if (!plus && A <= Bh + 5) continue;
      const carry = plus ? A % 10 + Bh % 10 >= 10 : A % 10 < Bh % 10;
      if (d === 0 && (carry || (plus && A + Bh > 99))) continue; if (d >= 1 && !carry) continue; if (d === 1 && plus && A + Bh > 99) continue;
      break;
    }
    const a = A * 100, b = Bh * 100, Rh = plus ? A + Bh : A - Bh, ans = Rh * 100, o = plus ? add : sub, carry = plus ? A % 10 + Bh % 10 >= 10 : A % 10 < Bh % 10;
    return { text: qq(o(a, b)), ans,
      how: ['Think in hundreds: ' + N(a) + ' is ' + A + ' hundreds and ' + N(b) + ' is ' + Bh + ' hundreds.', o(A, Bh) + ' = ' + Rh + ' hundreds.', Rh + ' hundreds is ' + B(N(ans)) + '.'],
      steps: [S('How many hundreds are in ' + B(N(a)) + '?', A), S(qq(o(A, Bh)), Rh), S(B(Rh + ' hundreds') + ' = ?', ans)],
      traps: traps([!carry ? null : plus ? tp(ans - 1000, 'a_regroup', '10 hundreds make a thousand. Count it.') : tp(ans + 1000, 'a_borrow', 'Not enough hundreds: trade a thousand for 10 hundreds first.'), plus || !carry ? null : tp(colSub(a, b), 'a_borrow', 'You took the smaller digit from the bigger one. Trade a thousand first.'),
        tp(ans * 10, 'n_place', 'Count the zeros: hundreds end in two zeros.'), tp(ans / 10, 'n_place', 'Count the zeros: hundreds end in two zeros.'), tp(ans + 100, 'a_split', 'Check the hundreds.'), tp(ans - 100, 'a_split', 'Check the hundreds.')]) };
  } },
{ id: 'a_list', s: 'add', g: 4, title: 'Add a list fast',
  tip: 'Before adding a long list, pair up numbers that make 10s or 100s. 23 + 45 + 17 + 15 = (23 + 17) + (45 + 15) = 40 + 60 = 100.',
  gen(d, R) {
    let p, q, e = 0;
    if (d === 0) { const x = R.i(1, 9), y = R.i(1, 9); p = [x, 10 - x]; q = [y, 10 - y]; if (R.chance(.5)) e = R.i(2, 9); }
    else if (d === 1) { const mk = () => { let x; do { x = R.i(11, 59); } while (x % 10 === 0); return [x, R.i(1, 4) * 10 + 10 - x % 10]; }; p = mk(); q = mk(); if (R.chance(.3)) e = R.i(11, 39); }
    else if (R.chance(.5)) { const r = R.pick([25, 75, 50, 40, 60, 35, 65, 15, 85, 45]); p = [R.i(1, 4) * 100 + r, R.i(1, 3) * 100 + 100 - r]; const s = R.i(1, 9) * 10; q = [R.i(1, 5) * 100 + s, 100 - s]; if (R.chance(.3)) e = R.i(2, 9) * 10 + R.i(1, 9); }
    else { const x = R.pick([35, 48, 26, 17, 64, 73, 52, 39]), y = R.pick([45, 28, 61, 19, 82, 54]); p = [x, 100 - x]; q = [y, 100 - y]; e = R.i(12, 89); }
    const nums = e ? [p[0], q[0], e, p[1], q[1]] : [p[0], q[0], p[1], q[1]];
    if (new Set(nums).size < nums.length) return null;
    const s1 = p[0] + p[1], s2 = q[0] + q[1], ans = sum(nums);
    return { text: qq(nums.map(N).join(' + ')), ans,
      how: ['Find friends first: ' + add(p[0], p[1]) + ' = ' + N(s1) + ' and ' + add(q[0], q[1]) + ' = ' + N(s2) + '.', e ? add(s1, s2) + ' = ' + N(s1 + s2) + ', then ' + add(s1 + s2, e) + ' = ' + B(N(ans)) + '.' : add(s1, s2) + ' = ' + B(N(ans)) + '.'],
      steps: [S(qq(add(p[0], p[1])), s1), S(qq(add(q[0], q[1])), s2), S(qq(e ? N(s1) + ' + ' + N(s2) + ' + ' + N(e) : add(s1, s2)), ans)],
      traps: traps([tp(ans - 10, 'a_regroup', 'A ten got lost. Check each friendly pair.'), tp(ans + 10, 'a_regroup', 'You counted a ten twice.'), e ? tp(ans - e, 'a_list', 'Use every number once. One was left out.') : tp(ans - nums[1], 'a_list', 'Use every number once. One was left out.'), d === 2 ? tp(ans - 100, 'a_regroup', 'A hundred got lost. Check each friendly pair.') : null]) };
  } },
/* ======================= Patterns ======================= */
{ id: 'p_skip', s: 'pat', g: 2, title: 'Skip count by 2s, 5s and 10s',
  tip: 'Skip counting adds the same jump every time. Counting by 10s, the ones digit never changes. By 5s it goes 5, 0, 5, 0. By 2s from 0: 0, 2, 4, 6, 8.',
  gen(d, R) { return skipProblem(R.pick([2, 5, 10]), d, R, 'p_skip'); } },
{ id: 'p_oddeven', s: 'pat', g: 2, title: 'Odd and even: look at the last digit',
  tip: 'Only the ones digit matters. Ends in 0, 2, 4, 6 or 8: even. Ends in 1, 3, 5, 7 or 9: odd. So 347 is odd and 348 is even.',
  gen(d, R) {
    const par = v => v % 2 ? 'odd' : 'even';
    if (d < 2) {
      const v = d === 0 ? R.i(3, 50) : R.i(51, 9999), want = R.pick(['even', 'odd']), after = d === 0 || R.chance(.6), o = v % 10;
      const ans = after ? (par(v + 1) === want ? v + 1 : v + 2) : (par(v - 1) === want ? v - 1 : v - 2), skip = Math.abs(ans - v) === 2, near = after ? v + 1 : v - 1;
      return { text: 'What is the ' + B(want) + ' number just ' + (after ? 'after' : 'before') + ' ' + B(N(v)) + '?', ans,
        how: ['Only the ones digit matters. ' + N(v) + ' ends in ' + o + ', so it is ' + par(v) + '.',
          skip ? N(near) + ' ends in ' + (near % 10) + ', which is ' + par(near) + ', so skip it. ' + N(ans) + ' ends in ' + (ans % 10) + ': ' + B(N(ans)) + '.' : N(ans) + ' ends in ' + (ans % 10) + ', which is ' + want + ': ' + B(N(ans)) + '.'],
        steps: [S('What is the ones digit of ' + B(N(v)) + '?', o), S('What number comes right ' + (after ? 'after' : 'before') + ' ' + B(N(v)) + '?', near)].concat(skip ? [S('And the number right ' + (after ? 'after' : 'before') + ' ' + B(N(near)) + '?', ans)] : []),
        traps: traps([skip ? tp(near, 'p_oddeven', N(near) + ' ends in ' + (near % 10) + ', so it is ' + par(near) + ', not ' + want + '.') : tp(after ? v + 3 : v - 3, 'p_oddeven', N(near) + ' is already ' + want + '. It is the very next one.'),
          tp(v, 'p_oddeven', (after ? 'After' : 'Before') + ' means a different number from ' + N(v) + '.'), tp(after ? ans - 2 * (ans - v) : ans + 2 * (v - ans), 'p_oddeven', (after ? 'After means bigger' : 'Before means smaller') + ' than ' + N(v) + '.'), skip ? null : tp(after ? v + 2 : v - 2, 'p_oddeven', 'That one is ' + par(v) + '. Look at its ones digit.')]) };
    }
    const c = R.i(0, 2);
    if (c === 0) { const v = R.i(31, 980), k = R.i(2, 4), e1 = v % 2 ? v + 1 : v + 2, ans = e1 + 2 * (k - 1), list = []; for (let i = 0; i < k; i++) list.push(N(e1 + 2 * i));
      return { text: 'What is the ' + B(ord(k)) + ' even number after ' + B(N(v)) + '?', ans,
        how: ['Even numbers are 2 apart. The first even number after ' + N(v) + ' is ' + N(e1) + '.', 'Count on by 2s: ' + list.join(', ') + '. The ' + ord(k) + ' one is ' + B(N(ans)) + '.'],
        steps: [S('What is the first even number after ' + B(N(v)) + '?', e1), S('Count on ' + (k - 1) + ' more ' + plural(k - 1, 'jump') + ' of 2 from ' + B(N(e1)) + '. Where do you land?', ans)],
        traps: traps([tp(ans + 2, 'p_oddeven', 'Start counting at the first even number after ' + N(v) + '. That one is the 1st.'), tp(ans - 2, 'p_oddeven', 'Count the even numbers again: 1st, 2nd, 3rd...'), tp(v + k, 'p_oddeven', 'Even numbers are 2 apart, not 1.')]) }; }
    if (c === 1) { let ds; do { ds = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3); } while (ds.every(x => x % 2) || ds.every(x => !(x % 2)));
      const od = Math.min(...ds.filter(x => x % 2)), rest = ds.filter(x => x !== od).sort((a, b) => b - a), ans = +(rest.join('') + od), desc = +ds.slice().sort((a, b) => b - a).join('');
      const bigOdd = Math.max(...ds.filter(x => x % 2)), alt = +(ds.filter(x => x !== bigOdd).sort((a, b) => b - a).join('') + bigOdd);
      return { text: 'Use each digit once: ' + B(ds.join(', ')) + '. What is the ' + B('biggest odd') + ' number you can make?', ans,
        how: [ds.filter(x => x % 2).length === 1 ? 'An odd number must end in an odd digit. The only odd digit is ' + od + ', so it goes at the end.' : 'An odd number must end in an odd digit. To keep the number big, put the smaller odd digit, ' + od + ', at the end.', 'Put the other digits biggest first: ' + rest.join(', ') + ', then ' + od + ' → ' + B(ans) + '.'],
        steps: [S('Which digit goes in the ones place?', od), S('Which digit goes in the hundreds place?', rest[0]), S('What is the number?', ans)],
        traps: traps([tp(desc, 'p_oddeven', 'That is the biggest number, but it ends in an even digit, so it is even.'), tp(alt, 'n_compare', 'That is odd, but a bigger odd digit at the end is wasted. Use the smallest odd digit at the end.'), tp(+ds.slice().sort((a, b) => a - b).join(''), 'n_compare', 'For the biggest number, put the big digits first.')]) }; }
    const a = R.i(10, 80), b = a + R.i(9, 16), e1 = a % 2 ? a + 1 : a + 2, e2 = b % 2 ? b - 1 : b - 2, cnt = (e2 - e1) / 2 + 1, list = []; for (let x = e1; x <= e2; x += 2) list.push(x);
    return { text: 'How many ' + B('even') + ' numbers are there between ' + B(a) + ' and ' + B(b) + '?', ans: cnt,
      how: ['The first even number after ' + a + ' is ' + e1 + ', and the last before ' + b + ' is ' + e2 + '. Count by 2s.', list.join(', ') + ': that is ' + B(cnt) + '.'],
      steps: [S('What is the first even number after ' + B(a) + '?', e1), S('What is the last even number before ' + B(b) + '?', e2), S('Count by 2s from ' + e1 + ' to ' + e2 + '. How many numbers?', cnt)],
      traps: traps([tp(cnt + 1, 'p_oddeven', '"Between" does not count ' + a + ' and ' + b + ' themselves.'), tp(cnt - 1, 'p_oddeven', 'Count both ' + e1 + ' and ' + e2 + '.'), tp(b - a - 1, 'p_oddeven', 'Count only the even numbers, every other one.'), tp(b - a, 'p_oddeven', 'Count only the even numbers, every other one.')]) };
  } },
{ id: 'p_hundred', s: 'pat', g: 2, title: 'Hundred chart moves', pre: ['n_tenmore'],
  tip: 'On a hundred chart, one row down is +10 and one row up is ' + MINUS + '10. Right is +1, left is ' + MINUS + '1. Down and right is +11; down and left is +9.',
  gen(d, R) {
    const okSide = (s, side) => { const col = (s - 1) % 10; return col + side >= 0 && col + side <= 9; };
    if (d === 0) { const dir = R.pick(['below', 'above', 'right', 'left']); let s; do { s = R.i(12, 89); } while (s % 10 === 0 || s % 10 === 1);
      const mv = { below: 10, above: -10, right: 1, left: -1 }[dir], t = s + mv;
      return { text: 'On the hundred chart, what number is just ' + (dir === 'right' ? 'to the right of' : dir === 'left' ? 'to the left of' : dir) + ' ' + B(s) + '?', ans: t, vis: chartSVG(s, t),
        how: [{ below: 'One row down is +10: the tens digit goes up by 1.', above: 'One row up is ' + MINUS + '10: the tens digit goes down by 1.', right: 'One square right is +1.', left: 'One square left is ' + MINUS + '1.' }[dir], (mv > 0 ? add(s, mv) : sub(s, -mv)) + ' = ' + B(t) + '.'],
        traps: traps([tp(Math.abs(mv) === 10 ? s + mv / 10 : s + mv * 10, 'p_hundred', Math.abs(mv) === 10 ? 'Up and down change the tens: a row is 10, not 1.' : 'Left and right change the ones: a square is 1, not 10.'), tp(s - mv, 'p_hundred', Math.abs(mv) === 10 ? 'Down is bigger, up is smaller.' : 'Right is bigger, left is smaller.')]) }; }
    if (d === 1) { const v = R.chance(.5) ? 1 : -1, h = R.chance(.5) ? 1 : -1; let s; do { s = R.i(22, 79); } while (s % 10 === 0 || s % 10 === 1);
      const t = s + 10 * v + h, words = (v > 0 ? 'down' : 'up') + ' and one square ' + (h > 0 ? 'right' : 'left');
      return { text: 'On the hundred chart, start at ' + B(s) + '. Move one square ' + words + '. Where are you?', ans: t, vis: chartSVG(s, t),
        how: ['One row ' + (v > 0 ? 'down is +10' : 'up is ' + MINUS + '10') + ', and one square ' + (h > 0 ? 'right is +1' : 'left is ' + MINUS + '1') + '.', 'That is ' + (10 * v + h > 0 ? '+' : MINUS) + Math.abs(10 * v + h) + ' in all: ' + (10 * v + h > 0 ? add(s, 10 * v + h) : sub(s, -(10 * v + h))) + ' = ' + B(t) + '.'],
        steps: [S('One row ' + (v > 0 ? 'down' : 'up') + ' from ' + B(s) + ' is?', s + 10 * v), S('Then one square ' + (h > 0 ? 'right' : 'left') + '. Where are you?', t)],
        traps: traps([tp(s + 10 * v, 'p_hundred', 'You moved the row. Now move one square to the side too.'), tp(s + h, 'p_hundred', 'You moved to the side. Now move one row too.'), tp(s + 10 * v - h, 'p_hundred', 'Right is +1 and left is ' + MINUS + '1.'), tp(s - 10 * v + h, 'p_hundred', 'Down is +10 and up is ' + MINUS + '10.')]) }; }
    const down = R.pick([-3, -2, 2, 3]), side = R.pick([-3, -2, 2, 3, 4]); let s; do { s = R.i(11, 90); } while (s + down * 10 < 1 || s + down * 10 > 100 || !okSide(s, side));
    const mid = s + down * 10, t = mid + side, rows = Math.abs(down) + ' rows ' + (down > 0 ? 'down' : 'up'), sq = Math.abs(side) + ' squares ' + (side > 0 ? 'right' : 'left');
    if (R.chance(.35)) return { text: 'On the hundred chart, you went ' + B(rows) + ' and ' + B(sq) + '. You landed on ' + B(t) + '. Where did you start?', ans: s, vis: chartSVG(t, s),
      how: ['Work backwards: undo each move.', 'Undo ' + sq + ': ' + (side > 0 ? sub(t, side) : add(t, -side)) + ' = ' + mid + '. Undo ' + rows + ': ' + (down > 0 ? sub(mid, 10 * down) : add(mid, -10 * down)) + ' = ' + B(s) + '.'],
      steps: [S('Undo ' + sq + '. Where are you?', mid), S('Undo ' + rows + '. Where are you?', s)],
      traps: traps([tp(t + down * 10 + side, 'p_hundred', 'This asks where you started, so undo the moves: go the other way.'), tp(t - side, 'p_hundred', 'Undo the rows too.'), tp(t - down * 10, 'p_hundred', 'Undo the squares too.')]) };
    return { text: 'On the hundred chart, start at ' + B(s) + '. Go ' + B(rows) + ' and ' + B(sq) + '. Where are you?', ans: t, vis: chartSVG(s, t),
      how: [rows + ' is ' + (down > 0 ? '+' : MINUS) + Math.abs(10 * down) + ': ' + s + ' → ' + mid + '.', sq + ' is ' + (side > 0 ? '+' : MINUS) + Math.abs(side) + ': ' + mid + ' → ' + B(t) + '.'],
      steps: [S('Go ' + rows + ' from ' + B(s) + '. Where are you?', mid), S('Now go ' + sq + '. Where are you?', t)],
      traps: traps([tp(s + down + side * 10, 'p_hundred', 'Rows change the tens (10 each); squares change the ones (1 each).'), tp(mid, 'p_hundred', 'Now move the squares too.'), tp(s + side, 'p_hundred', 'Move the rows too.'), tp(mid - side, 'p_hundred', 'Right is + and left is ' + MINUS + '.')]) };
  } },
{ id: 'p_skip2', s: 'pat', g: 3, title: 'Skip count by 3s, 4s, 25s, 100s',
  tip: '3s: 3, 6, 9, 12, 15. 4s: 4, 8, 12, 16, 20. 25s go 25, 50, 75, 100, like quarters. 100s change only the hundreds digit. You can count back too.',
  gen(d, R) { return skipProblem(R.pick(d === 0 ? [3, 4, 100] : [3, 4, 25, 100]), d, R, 'p_skip2'); } },
{ id: 'p_rule', s: 'pat', g: 3, title: 'Same-jump patterns',
  tip: 'Find the jump between two numbers side by side, check it on the next pair, then use it to fill the gap. Jumps can go down too.',
  gen(d, R) {
    if (d === 2 && R.chance(.35)) { const j = R.i(2, 9), s0 = R.i(5, 60), seq = [0, 1, 2, 3, 4].map(i => s0 + i * j), gap = 3 * j;
      return { text: 'Two numbers are missing. What goes in the ' + B('first') + ' box?', vis: seqHTML([seq[0], null, null, seq[3], seq[4]]), ans: seq[1],
        how: ['From ' + seq[0] + ' to ' + seq[3] + ' is 3 equal jumps: ' + sub(seq[3], seq[0]) + ' = ' + gap + '.', '3 × ' + j + ' = ' + gap + ', so each jump is ' + j + '. ' + add(seq[0], j) + ' = ' + B(seq[1]) + '.'],
        steps: [S(qq(sub(seq[3], seq[0])), gap), S(B('3 × ? = ' + gap), j), S(qq(add(seq[0], j)), seq[1])],
        traps: traps([tp(seq[2], 'p_rule', 'That goes in the second box. The first box is one jump after ' + seq[0] + '.'), tp(seq[0] + (seq[4] - seq[3]) + 1, 'p_rule', 'Check the jump.'), gap % 2 === 0 ? tp(seq[0] + gap / 2, 'p_rule', 'From ' + seq[0] + ' to ' + seq[3] + ' is 3 jumps, not 2.') : null, tp(seq[0] + gap, 'p_rule', 'That is 3 jumps. The first box is just 1 jump along.')]),
        key: 'pr2' + seq.join(',') }; }
    let k, start, back = false, len = 5, miss;
    if (d === 0) { k = R.i(2, 6); start = R.i(1, 20); miss = R.i(2, 4); }
    else if (d === 1) { k = R.i(3, 9); back = R.chance(.5); start = back ? R.i(5 * k, 60 + 5 * k) : R.i(1, 60); miss = R.i(1, 4); }
    else { k = R.pick([7, 8, 9, 11, 12, 15, 20, 25]); back = R.chance(.4); len = 6; start = back ? R.i(6 * k, 200 + 6 * k) : R.i(10, 150); miss = R.i(0, 5); }
    const seq = []; for (let i = 0; i < len; i++) seq.push(back ? start - i * k : start + i * k);
    return jumpProblem(seq, miss, 'p_rule');
  } },
{ id: 'p_grow', s: 'pat', g: 3, title: 'Growing patterns',
  tip: 'Not every pattern adds the same jump. Write the jumps: +1, +2, +3, +4. If they grow, keep them growing the same way.',
  gen(d, R) {
    const kind = d === 0 ? 'g1' : d === 1 ? R.pick(['g1', 'g2', 'dbl']) : R.pick(['g2', 'g3', 'far']);
    if (kind === 'dbl') { let v = R.i(1, 6); const seq = []; for (let i = 0; i < 5; i++) { seq.push(v); v *= 2; } const miss = R.pick([3, 4]), prev = seq[miss - 1], ans = seq[miss];
      return { text: 'What number goes in the box?', vis: seqHTML(seq.map((x, i) => i === miss ? null : x)), ans,
        how: ['The jumps are +' + (seq[1] - seq[0]) + ', +' + (seq[2] - seq[1]) + ', +' + (seq[3] - seq[2]) + '... Each jump doubles, because each number is double the one before.', 'Double ' + prev + ': ' + add(prev, prev) + ' = ' + B(ans) + '.'],
        steps: [S('What is the jump from ' + B(seq[1]) + ' to ' + B(seq[2]) + '?', seq[2] - seq[1]), S(qq(add(prev, prev)), ans)],
        traps: traps([tp(prev + (seq[miss - 1] - seq[miss - 2]), 'p_rule', 'The jumps are not all the same here: they double.'), tp(ans + 1, 'p_grow', 'Check the double.'), tp(ans - 1, 'p_grow', 'Check the double.')]), key: 'gd' + seq.join(',') + miss }; }
    const g = kind === 'g1' ? 1 : kind === 'g2' ? 2 : kind === 'g3' ? 3 : R.pick([1, 2]), j0 = R.i(1, 3); let v = R.i(1, 12);
    const seq = [], jumps = []; for (let i = 0; i < 7; i++) { seq.push(v); jumps.push(j0 + g * i); v += j0 + g * i; }
    const jl = jumps.slice(0, 2).map(x => '+' + x).join(', ');
    if (kind === 'far') { const ans = seq[6];
      return { text: 'The pattern keeps going the same way. What is the ' + B('7th') + ' number?', vis: seqHTML(seq.slice(0, 5)), ans,
        how: ['The jumps are ' + jl + '... Each jump is ' + g + ' more than the one before.', 'The next jumps are +' + jumps[4] + ' and +' + jumps[5] + '. ' + add(seq[4], jumps[4]) + ' = ' + seq[5] + ', then ' + add(seq[5], jumps[5]) + ' = ' + B(ans) + '.'],
        steps: [S('What is the jump from ' + B(seq[3]) + ' to ' + B(seq[4]) + '?', jumps[3]), S('What is the 6th number?', seq[5]), S('What is the 7th number?', ans)],
        traps: traps([tp(seq[5], 'p_grow', 'That is the 6th number. Go one more jump.'), tp(seq[4] + 2 * jumps[3], 'p_rule', 'The jumps keep growing; they do not stay the same.'), tp(ans + g, 'p_grow', 'Check how much each jump grows.'), tp(ans - g, 'p_grow', 'Check how much each jump grows.')]), key: 'gf' + seq.join(',') }; }
    const show = seq.slice(0, 5), miss = d === 0 ? 4 : d === 1 ? R.pick([3, 4]) : R.pick([3, 4]), prev = show[miss - 1], jm = jumps[miss - 1], ans = show[miss];
    return { text: 'What number goes in the box?', vis: seqHTML(show.map((x, i) => i === miss ? null : x)), ans,
      how: ['Write the jumps: ' + jl + '... Each jump is ' + g + ' more than the one before.', 'The jump into the box is +' + jm + ': ' + add(prev, jm) + ' = ' + B(ans) + '.'],
      steps: [S('What is the jump from ' + B(show[0]) + ' to ' + B(show[1]) + '?', jumps[0]), S('What is the jump from ' + B(show[1]) + ' to ' + B(show[2]) + '?', jumps[1]), S(qq(add(prev, jm)), ans)],
      traps: traps([tp(prev + jm - g, 'p_rule', 'The jumps are not all the same: each one grows by ' + g + '.'), tp(ans + g, 'p_grow', 'Check how much the jump grows each time.'), tp(ans - 1, 'p_grow', 'Check the jump into the box.'), tp(ans + 1, 'p_grow', 'Check the jump into the box.')]), key: 'gg' + show.join(',') + miss };
  } },
{ id: 'p_machine', s: 'pat', g: 3, title: 'Rule machines',
  tip: 'A number goes in, the machine changes it, a new number comes out. Guess a rule from the first pair, check it on every pair, then use it.',
  gen(d, R) {
    let kind, k;
    if (d === 0) { kind = R.chance(.6) ? 'add' : 'sub'; k = R.i(2, 10); }
    else if (d === 1) { kind = R.chance(.6) ? 'mul' : 'add'; k = kind === 'mul' ? R.i(2, 10) : R.i(11, 30); }
    else { kind = R.pick(['mul', 'mul', 'add', 'sub']); k = kind === 'mul' ? R.i(3, 9) : R.i(11, 40); }
    const f = x => kind === 'add' ? x + k : kind === 'sub' ? x - k : x * k, sign = kind === 'add' ? '+ ' + k : kind === 'sub' ? MINUS + ' ' + k : '× ' + k;
    const lo = kind === 'sub' ? k : 1, pool = R.shuffle(Array.from({ length: kind === 'mul' ? 11 : 20 }, (_, i) => i + lo + (d === 0 && kind !== 'sub' ? 1 : 0)));
    const ins = pool.slice(0, 3).sort((a, b) => a - b), x = pool[3], rows = ins.map(v => [v, f(v)]), rev = d === 2 && R.chance(.55), out = f(x), ans = rev ? x : out;
    const [i0, o0] = rows[0], [i1, o1] = rows[1];
    const find = kind === 'mul' ? ['First pair: ' + i0 + ' → ' + o0 + '. Adding ' + (o0 - i0) + ' fits it, but not the next pair. Try times: ' + i0 + ' × ' + k + ' = ' + o0 + ' and ' + i1 + ' × ' + k + ' = ' + o1 + '. The rule is × ' + k + '.']
      : ['First pair: ' + i0 + ' → ' + o0 + ', that is ' + sign + '. Check: ' + i1 + ' ' + sign + ' = ' + o1 + '. The rule is ' + sign + '.'];
    const stepRule = kind === 'mul' ? S(B(i0 + ' × ? = ' + o0), k) : S('First pair: ' + B(i0 + ' → ' + o0) + '. How much was ' + (kind === 'add' ? 'added' : 'taken away') + '?', k);
    if (rev) {
      const undo = kind === 'mul' ? 'Work backwards: what number times ' + k + ' makes ' + out + '? ' + k + ' × ' + x + ' = ' + out + ', so ' + B(x) + ' went in.' : 'Work backwards: undo ' + sign + '. ' + (kind === 'add' ? sub(out, k) : add(out, k)) + ' = ' + B(x) + '.';
      return { text: 'What number went in?', vis: ioTable(rows, [x, out], true), ans, how: find.concat([undo]),
        steps: [stepRule, kind === 'mul' ? S(B(k + ' × ? = ' + out), x) : S(qq(kind === 'add' ? sub(out, k) : add(out, k)), x)],
        traps: traps([tp(kind === 'mul' ? out * k : kind === 'add' ? out + k : out - k, 'p_machine', 'This asks what went in. Undo the rule instead of doing it again.'), kind === 'mul' ? tp(out - (o0 - i0), 'p_machine', 'Adding only fits the first pair. Check the rule on every pair.') : tp(x + 1, 'p_machine', 'Check your undoing.'), kind === 'mul' ? tp(x + 1, 'm_divfam', 'Check: ' + k + ' times your answer should make ' + out + '.') : null]), key: 'pm' + rows.join(';') + '|' + x };
    }
    return { text: 'What number comes out?', vis: ioTable(rows, [x, out], false), ans, how: find.concat([x + ' ' + sign + ' = ' + B(out) + '.']),
      steps: [stepRule, S(qq(x + ' ' + sign), out)],
      traps: traps([kind === 'mul' ? tp(x + (o0 - i0), 'p_machine', 'Adding ' + (o0 - i0) + ' fits the first pair only. Check the rule on every pair.') : tp(kind === 'add' ? x - k : x + k, 'p_machine', 'The outs are ' + (kind === 'add' ? 'bigger' : 'smaller') + ' than the ins, so the rule ' + (kind === 'add' ? 'adds' : 'takes away') + '.'),
        tp(kind === 'mul' ? out + k : out + 1, 'p_machine', kind === 'mul' ? 'Check your times fact: ' + x + ' × ' + k + '.' : 'Check the rule on the new number.'), tp(kind === 'mul' ? out - k : out - 1, 'p_machine', kind === 'mul' ? 'Check your times fact: ' + x + ' × ' + k + '.' : 'Check the rule on the new number.')]), key: 'pm' + rows.join(';') + '|' + x };
  } },
{ id: 'p_evenrules', s: 'pat', g: 4, title: 'Odd and even rules',
  tip: 'Odd + odd = even, even + even = even, odd + even = odd. A product is odd only when every number in it is odd: odd × odd = odd.',
  gen(d, R) {
    if (d === 2 && R.chance(.35)) {
      let list; do { list = [0, 0, 0, 0].map(() => R.i(11, 60)); } while (new Set(list).size < 4 || list.filter(x => x % 2).length !== 2);
      const od = Math.min(...list.filter(x => x % 2)), ev = Math.min(...list.filter(x => !(x % 2))), ans = od + ev, two = list.slice().sort((a, b) => a - b);
      return { text: 'Add two different numbers from ' + B(list.join(', ')) + '. What is the ' + B('smallest odd total') + ' you can make?', ans,
        how: ['An odd total needs one odd number and one even number (odd + even = odd).', 'Smallest odd number: ' + od + '. Smallest even number: ' + ev + '.', add(od, ev) + ' = ' + B(ans) + '.'],
        steps: [S('What is the smallest odd number in the list?', od), S('What is the smallest even number in the list?', ev), S(qq(add(od, ev)), ans)],
        traps: traps([tp(two[0] + two[1], 'p_evenrules', two[0] % 2 === two[1] % 2 ? 'Two odd numbers (or two even numbers) make an even total.' : 'Check that you used the smallest of each.'), tp(Math.max(...list.filter(x => x % 2)) + ev, 'p_evenrules', 'Use the smallest odd number to keep the total small.'), tp(od + Math.max(...list.filter(x => !(x % 2))), 'p_evenrules', 'Use the smallest even number to keep the total small.')]) };
    }
    const n = d === 0 ? 3 : d === 1 ? 4 : 5, ops = d === 0 ? ['+'] : d === 1 ? ['+', '×'] : ['+', '×', '−', '+3', '×3'], want = R.pick(['odd', 'even']);
    const items = [];
    for (let i = 0; i < n; i++) {
      const op = R.pick(ops), m = op === '+3' || op === '×3' ? 3 : 2, nums = [];
      for (let j = 0; j < m; j++) nums.push(op === '×3' ? R.i(3, 19) : R.i(11, 99));
      if (op === '−' && nums[0] < nums[1]) nums.reverse();
      const kind = op[0], val = kind === '+' ? sum(nums) : kind === '×' ? nums.reduce((a, b) => a * b, 1) : nums[0] - nums[1];
      const odds = nums.filter(x => x % 2).length;
      const wrongS = (kind === '+' || kind === '−') && odds >= 2 ? 1 - val % 2 : val % 2, wrongP = kind === '×' && odds === m ? 0 : val % 2;
      items.push({ txt: nums.join(' ' + (kind === '−' ? MINUS : kind) + ' '), val, kind, wrongS, wrongP });
    }
    if (new Set(items.map(x => x.txt)).size < n) return null;
    const isW = p => (want === 'odd') === (p === 1), ans = items.filter(x => isW(x.val % 2)).length, oddL = items.filter(x => x.val % 2), evL = items.filter(x => !(x.val % 2));
    const rule = ops.some(o => o[0] === '×') ? 'Only odd or even matters. Odd + odd = even, odd + even = odd, and a product is odd only when every number is odd.' : 'Only the ones digits matter. Odd + odd = even, even + even = even, odd + even = odd.';
    return { text: 'Without working them out, how many of these are ' + B(want) + '? ' + items.map(x => B(x.txt)).join(', &nbsp;'), ans,
      how: [rule, 'Odd: ' + (oddL.length ? oddL.map(x => x.txt).join('; ') : 'none') + '.', 'Even: ' + (evL.length ? evL.map(x => x.txt).join('; ') : 'none') + '.', 'So ' + B(ans) + ' of them ' + (ans === 1 ? 'is ' : 'are ') + want + '.'],
      steps: items.slice(0, 3).map(x => S('What is the ones digit of ' + B(x.txt) + '?', x.val % 10)).concat([S('So how many of the ' + n + ' are ' + want + '?', ans)]),
      traps: traps([tp(n - ans, 'p_evenrules', 'You counted the ' + (want === 'odd' ? 'even' : 'odd') + ' ones. The question asks for ' + want + '.'), tp(items.filter(x => isW(x.wrongS)).length, 'p_evenrules', 'Odd + odd makes an even number: two odd ones digits add up to an even number.'),
        tp(items.filter(x => isW(x.wrongP)).length, 'p_evenrules', 'Odd × odd is odd. Only an even number in a product makes it even.'), tp(ans + 1, 'p_oddeven', 'Check each answer\'s ones digit.')]), key: 'er' + want + items.map(x => x.txt).join('|') };
  } },
{ id: 'p_shapes', s: 'pat', g: 4, title: 'Growing shapes', pre: ['m_x2510'],
  tip: 'Find what is added each step and what never changes. If each step adds 3 dots and 1 dot stays, step 10 has 3 × 10 + 1 = 31 dots.',
  gen(d, R) {
    const a = d === 0 ? R.i(1, 3) : R.i(2, 4), b = d === 0 ? R.i(0, 2) : R.i(0, 4); if (a + b < 2) return null;
    const f = n => a * n + b, pic = shapeSVG(a, b, [1, 2, 3]);
    const grow = 'Each step adds ' + a + ' ' + plural(a, 'dot') + ' (' + (a === 1 ? 'the row' : 'each of the ' + a + ' rows') + ' grows by 1).', fixed = b ? 'The ' + b + ' ' + plural(b, 'dot') + ' on the left never ' + (b === 1 ? 'changes.' : 'change.') : 'There are no extra dots.';
    if (d === 2 && R.chance(.5)) { const n = R.i(11, 30), T = f(n);
      return { text: 'The shape keeps growing the same way. Which step has ' + B(T) + ' dots?', vis: pic, ans: n,
        how: [grow + ' ' + fixed, 'Step n has ' + a + ' × n' + (b ? ' + ' + b : '') + ' dots.' + (b ? ' Take away the fixed dots: ' + sub(T, b) + ' = ' + (T - b) + '.' : ''), a + ' × ? = ' + (T - b) + ', so it is step ' + B(n) + '.'],
        steps: [S('How many dots does each step add?', a), S('How many dots never change?', b), S(B(a + ' × ? = ' + (T - b)), n)],
        traps: traps([tp(Math.round(T / a) === T / a && b ? T / a : null, 'p_shapes', 'Take away the ' + b + ' fixed dots first.'), tp(n + 1, 'p_shapes', 'Check: step ' + (n + 1) + ' would have ' + f(n + 1) + ' dots.'), tp(n - 1, 'p_shapes', 'Check: step ' + (n - 1) + ' would have ' + f(n - 1) + ' dots.'), tp(T - b, 'p_shapes', 'That is the number of growing dots. How many steps make that many?')]) }; }
    const n = d === 0 ? 4 : d === 1 ? R.pick([10, 10, 6, 7, 8, 9]) : R.pick([25, 50, 100, 20, 15]), ans = f(n);
    return { text: 'The shape keeps growing the same way. How many dots will ' + B('step ' + n) + ' have?', vis: pic, ans,
      how: [grow + ' ' + fixed, 'Step ' + n + ' has ' + a + ' × ' + n + (b ? ' + ' + b : '') + ' dots.', (b ? a + ' × ' + n + ' = ' + (a * n) + ', and ' + add(a * n, b) + ' = ' + B(ans) : a + ' × ' + n + ' = ' + B(ans)) + '.'],
      steps: [S('How many dots does each step add?', a), S('How many dots never change?', b), S(qq(a + ' × ' + n + (b ? ' + ' + b : '')), ans)],
      traps: traps([b ? tp(n * (a + b), 'p_shapes', 'Only the rows grow. The ' + b + ' dots on the left stay the same.') : null, b ? tp(a * n, 'p_shapes', 'Add the ' + b + ' ' + plural(b, 'dot') + ' that never change.') : null, tp(ans + a, 'p_rule', 'Count the jumps from step 1 to step ' + n + ' again.'), tp(ans - a, 'p_rule', 'Count the jumps from step 1 to step ' + n + ' again.')]) };
  } },
{ id: 'p_twostep', s: 'pat', g: 5, title: 'Two-step rules',
  tip: 'Some rules have two steps, like × 2 then + 1. Do them in order. To go backwards, undo the last step first: ' + MINUS + ' 1, then ÷ 2.',
  gen(d, R) {
    const k = R.i(2, d === 0 ? 5 : 9), c = R.pick([1, 2, 3, 4, 5, 10, -1, -2]), sg = c > 0 ? '+ ' + c : MINUS + ' ' + (-c), f = x => k * x + c, rule = '× ' + k + ', then ' + sg;
    if (d === 0) { const x = R.i(2, 10), kx = k * x, ans = f(x); if (ans < 0) return null;
      return { text: 'The rule is ' + B(rule) + '. What comes out when ' + B(x) + ' goes in?', ans,
        how: ['Do the steps in order: first × ' + k + ', then ' + sg + '.', x + ' × ' + k + ' = ' + kx + '.', kx + ' ' + sg + ' = ' + B(ans) + '.'],
        steps: [S(qq(x + ' × ' + k), kx), S(qq(kx + ' ' + sg), ans)],
        traps: traps([tp((x + c) * k, 'p_twostep', 'Do the × step first, then the ' + (c > 0 ? '+' : MINUS) + ' step.'), tp(kx, 'p_twostep', 'Do the second step too.'), tp(x + c, 'p_twostep', 'Do the × step too.'), tp(kx - c, 'p_twostep', 'Check the sign: the rule says ' + sg + '.')]) }; }
    const i0 = R.i(1, 4), rows = [i0, i0 + 1, i0 + 2].map(v => [v, f(v)]); if (rows[0][1] < 0) return null;
    const [ri, ro] = rows[0], tableHow = ['When In goes up by 1, Out goes up by ' + k + ', so the rule starts with × ' + k + '.', ri + ' × ' + k + ' = ' + (k * ri) + ', and Out is ' + ro + ', so then ' + (c > 0 ? 'add ' + c : 'take away ' + (-c)) + '.'];
    const cStep = S(B((k * ri) + (c > 0 ? ' + ? = ' : ' ' + MINUS + ' ? = ') + ro), Math.abs(c));
    if (d === 1) { const x = R.i(6, 12), ans = f(x);
      return { text: 'The rule has two steps: first ×, then + or ' + MINUS + '. Find the rule. What number comes out?', vis: ioTable(rows, [x, ans], false), ans,
        how: tableHow.concat([x + ' × ' + k + ' ' + sg + ' = ' + (k * x) + ' ' + sg + ' = ' + B(ans) + '.']),
        steps: [S('How much does Out go up each time In goes up by 1?', k), cStep, S(qq(x + ' × ' + k + ' ' + sg), ans)],
        traps: traps([tp(k * x, 'p_twostep', 'Do the second step too: ' + sg + '.'), tp(x + (ro - ri), 'p_machine', 'Adding ' + (ro - ri) + ' fits only the first pair. Check every pair.'), tp(ans + k, 'p_twostep', 'Check the × step.'), tp(ans - k, 'p_twostep', 'Check the × step.')]), key: 'ts1' + rows.join(';') + x }; }
    const x = R.i(4, 15), out = f(x), table = R.chance(.5);
    return { text: table ? 'Find the two-step rule. What number went in?' : 'The rule is ' + B(rule) + '. What went in if ' + B(out) + ' came out?', vis: table ? ioTable(rows, [x, out], true) : '', ans: x,
      how: (table ? [tableHow[0] + ' ' + tableHow[1]] : []).concat(['Work backwards: undo the last step first. Undo ' + sg + ': ' + (c > 0 ? sub(out, c) : add(out, -c)) + ' = ' + (out - c) + '.', 'Undo × ' + k + ': ' + k + ' × ? = ' + (out - c) + ', so ' + B(x) + ' went in.']),
      steps: (table ? [S('How much does Out go up each time In goes up by 1?', k), cStep] : []).concat([S(qq(c > 0 ? sub(out, c) : add(out, -c)), out - c), S(B(k + ' × ? = ' + (out - c)), x)]),
      traps: traps([tp(out % k === 0 ? out / k - c : null, 'p_twostep', 'Undo in reverse order: undo the ' + (c > 0 ? '+' : MINUS) + ' step first, then the ×.'), tp(f(out), 'p_twostep', 'This asks what went in. Work backwards.'), tp(out - c, 'p_twostep', 'Undo the × step too.'), tp(x + 1, 'm_divfam', 'Check: ' + k + ' × your answer ' + sg + ' should make ' + out + '.')]), key: 'ts2' + rule + out + table };
  } },
{ id: 'p_squares', s: 'pat', g: 5, title: 'Square numbers and odd jumps', pre: ['m_squares'],
  tip: 'Square numbers are 1, 4, 9, 16, 25 (1 × 1, 2 × 2, 3 × 3...). The jumps are the odd numbers 3, 5, 7, 9. From 20 × 20 = 400, 21 × 21 = 400 + 20 + 21.',
  gen(d, R) {
    if (d < 2) { const s0 = d === 0 ? R.i(1, 5) : R.i(4, 9), seq = [0, 1, 2, 3, 4].map(i => (s0 + i) * (s0 + i)), miss = d === 0 ? R.pick([3, 4]) : R.i(2, 4), prev = seq[miss - 1], jm = seq[miss] - prev, ans = seq[miss];
      return { text: 'What number goes in the box?', vis: seqHTML(seq.map((x, i) => i === miss ? null : x)), ans,
        how: ['These are square numbers: ' + s0 + ' × ' + s0 + ', ' + (s0 + 1) + ' × ' + (s0 + 1) + ', and so on. The jumps between them are odd numbers that grow by 2.', 'From ' + seq[miss - 2] + ' to ' + prev + ' is +' + (jm - 2) + ', so the jump into the box is +' + jm + ': ' + add(prev, jm) + ' = ' + B(ans) + ' (' + (s0 + miss) + ' × ' + (s0 + miss) + ').'],
        steps: [S('What is the jump from ' + B(seq[miss - 2]) + ' to ' + B(prev) + '?', jm - 2), S('The next jump is 2 more. What is it?', jm), S(qq(add(prev, jm)), ans)],
        traps: traps([tp(prev + jm - 2, 'p_squares', 'The jumps grow by 2 each time.'), tp(prev + jm - 1, 'p_grow', 'The jumps grow by 2, not 1.'), tp((s0 + miss) * (s0 + miss + 1), 'm_squares', 'A square number is a number times itself.'), tp(ans + 1, 'p_squares', 'Square numbers jump by odd numbers.')]), key: 'sq' + seq.join(',') + miss }; }
    const n = R.pick([10, 20, 30, 40, 50, 15, 25, 11, 12, 60]), nn = n * n, up = R.chance(.6), m = up ? n + 1 : n - 1, jump = up ? n + m : n + m, ans = m * m;
    return { text: B(n + ' × ' + n + ' = ' + N(nn)) + '. Use it to find ' + B(m + ' × ' + m) + '.', ans,
      how: ['Next-door square numbers are apart by the two numbers added: ' + add(Math.min(n, m), Math.max(n, m)) + ' = ' + jump + '.', (up ? add(nn, jump) : sub(nn, jump)) + ' = ' + B(N(ans)) + '.'],
      steps: [S(qq(add(Math.min(n, m), Math.max(n, m))), jump), S(qq(up ? add(nn, jump) : sub(nn, jump)), ans)],
      traps: traps([tp(up ? nn + m : nn - n, 'p_squares', 'The jump is both numbers added: ' + Math.min(n, m) + ' + ' + Math.max(n, m) + '.'), tp(up ? nn + 2 * n : nn - 2 * n, 'p_squares', 'The jump is ' + Math.min(n, m) + ' + ' + Math.max(n, m) + ', which is 1 more than ' + (2 * Math.min(n, m)) + '.'), tp(up ? nn + 1 : nn - 1, 'p_squares', 'The gap between squares grows: it is not just 1.'), tp(n * m, 'm_squares', 'That is ' + n + ' × ' + m + '. A square is a number times itself.')]) };
  } },
{ id: 'p_triangle', s: 'pat', g: 5, title: 'Triangle numbers',
  tip: 'Triangle numbers are 1, 3, 6, 10, 15: the jumps are +2, +3, +4, +5. The 10th is 1 + 2 + ... + 10 = 10 × 11 ÷ 2 = 55.',
  gen(d, R) {
    const T = n => n * (n + 1) / 2;
    if (d === 0 || (d === 1 && R.chance(.5))) { const k0 = d === 0 ? R.i(1, 5) : R.i(3, 8), seq = [0, 1, 2, 3, 4].map(i => T(k0 + i)), miss = d === 0 ? R.pick([3, 4]) : R.i(2, 4), prev = seq[miss - 1], jm = seq[miss] - prev, ans = seq[miss];
      return { text: 'What number goes in the box?', vis: seqHTML(seq.map((x, i) => i === miss ? null : x)), ans,
        how: ['These are triangle numbers: each jump is 1 more than the one before.', 'From ' + seq[miss - 2] + ' to ' + prev + ' is +' + (jm - 1) + ', so the jump into the box is +' + jm + ': ' + add(prev, jm) + ' = ' + B(ans) + '.'],
        steps: [S('What is the jump from ' + B(seq[miss - 2]) + ' to ' + B(prev) + '?', jm - 1), S('The next jump is 1 more. What is it?', jm), S(qq(add(prev, jm)), ans)],
        traps: traps([tp(prev + jm - 1, 'p_grow', 'The jumps grow by 1 each time.'), tp(prev + jm + 1, 'p_grow', 'The jumps grow by 1, not 2.'), tp(ans + 1, 'p_triangle', 'Check the jump.')]), key: 'tr' + seq.join(',') + miss }; }
    if (d === 1) { const n = R.i(6, 14), t = T(n);
      return { text: 'The ' + B(ord(n)) + ' triangle number is ' + B(t) + '. What is the ' + B(ord(n + 1)) + '?', ans: t + n + 1,
        how: ['The ' + ord(n + 1) + ' triangle adds a new row of ' + (n + 1) + ' dots.', add(t, n + 1) + ' = ' + B(t + n + 1) + '.'],
        steps: [S('How many dots are in the new row?', n + 1), S(qq(add(t, n + 1)), t + n + 1)],
        traps: traps([tp(t + n, 'p_triangle', 'The new row has ' + (n + 1) + ' dots, one more than the last row.'), tp(t + n + 2, 'p_triangle', 'The new row has ' + (n + 1) + ' dots.'), tp(2 * t, 'p_triangle', 'Triangle numbers do not double. Add the new row.')]) }; }
    const n = R.i(11, 30), p = n * (n + 1), t = p / 2;
    return { text: 'Find the ' + ord(n) + ' triangle number. ' + B('1 + 2 + 3 + … + ' + n + ' = ?'), ans: t,
      how: ['Two copies of the triangle fit together into a rectangle ' + n + ' by ' + (n + 1) + '.', n + ' × ' + (n + 1) + ' = ' + N(p) + '. Half of that is ' + B(N(t)) + '.'],
      steps: [S(qq(n + ' × ' + (n + 1)), p), S('Half of ' + B(N(p)) + ' = ?', t)],
      traps: traps([tp(p, 'p_triangle', 'Two triangles make the rectangle, so take half.'), tp(n * n % 2 === 0 ? n * n / 2 : null, 'p_triangle', 'The rectangle is ' + n + ' by ' + (n + 1) + ', not ' + n + ' by ' + n + '.'), tp(t - n, 'p_triangle', 'Count all the way up to ' + n + '.'), tp(t + n + 1, 'p_triangle', 'Stop at ' + n + '.')]) };
  } },
]));
})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
