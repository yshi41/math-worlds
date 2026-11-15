/* Math Worlds coach: works out WHY an answer was wrong, names the idea behind it (a "tricky spot"), breaks that idea
   into small steps using the same numbers, and makes practice problems that build it back up. Also runs the
   placement check (pretest) that decides where each kid starts. Pure functions on top of the curriculum (MW). */
(function (root) {
'use strict';
const MW = root.MW || (typeof require !== 'undefined' ? require('./curriculum.js') : null);
const { S, STRANDS, gen, makeR, clockSVG, coinsRow, fmtM, fmtD, fmtT, T, n, B, MINUS, seqHTML, mulHow, COIN, COIN_ORDER } = MW;
const strip = h => String(h || '').replace(/<[^>]+>/g, '');
function parseOp(p) { const t = strip(p.text).replace(/,/g, '').trim(); const m = t.match(/^(\d+) ([+−×÷]) (\d+) = \?/); return m ? { a: +m[1], op: m[2], b: +m[3] } : null; }
let QN = 0;
function Q(text, ans, how, o) { return Object.assign({ type: 'num', text: B(text), ans, how: how || [], key: 'c' + (++QN) + text, step: true }, o || {}); }
const G = (id, d, R) => gen(id, d, R);

/* ---------- the tricky spots ---------- */
const C = {};
function def(id, label, blurb, o) { C[id] = Object.assign({ id, label, blurb, deeper: null, steps: () => [], practice: () => [] }, o); }
const rand2 = (R, ...ids) => ids.map(x => Array.isArray(x) ? G(x[0], x[1], R) : x);

def('bond10', 'Friends of 10', 'Pairs that make 10: 1 + 9, 2 + 8, 3 + 7, 4 + 6, 5 + 5.', { practice: R => rand2(R, ['bond10', 0], ['bond10', 0], ['bond10', 1], ['bond10', 1]) });
def('bridge10', 'Making a 10', 'Fill up to the next 10 first, then add the rest.', { deeper: 'bond10',
  steps(R, p) { let o = p && parseOp(p); let a, b; if (o && o.op === '+') { a = Math.max(o.a, o.b); b = Math.min(o.a, o.b); }
    if (!a || b > 9 || (a % 10) + b < 10) { a = R.i(6, 9); b = R.i(11 - a, 9); } const need = 10 - a % 10, top = a + need;
    return [Q(a + ' + ? = ' + n(top), need, [a + ' needs ' + need + ' more to make ' + top + '.']), Q(b + ' = ' + need + ' + ?', b - need, ['Split ' + b + ' into ' + need + ' and ' + (b - need) + '.']), Q(n(top) + ' + ' + (b - need) + ' = ?', a + b, ['You made ' + top + '. Now add the ' + (b - need) + ' that was left.']), Q(a + ' + ' + b + ' = ?', a + b, [a + ' + ' + need + ' = ' + top + ', then ' + top + ' + ' + (b - need) + ' = ' + B(a + b) + '.'])]; },
  practice: R => rand2(R, ['make10', 0], ['make10', 1], ['make10', 1], ['make10', 2]) });
def('thinkAdd', 'Take-away facts', 'Turn a take-away into adding: 13 ' + MINUS + ' 8 → 8 + what = 13?', { deeper: 'bond10',
  steps(R, p) { let o = p && parseOp(p), a, b; if (o && o.op === '−' && o.a <= 20) { a = o.a; b = o.b; } else { b = R.i(4, 9); a = R.i(11, b + 9); }
    if (a <= 10 || b >= 10) return [Q(b + ' + ? = ' + a, a - b, ['Count up from ' + b + ' to ' + a + '.']), Q(a + ' ' + MINUS + ' ' + b + ' = ?', a - b, ['Same question: ' + B(a - b) + '.'])];
    return [Q(b + ' + ? = 10', 10 - b, ['Count up from ' + b + ' to 10.']), Q('10 + ? = ' + a, a - 10), Q((10 - b) + ' + ' + (a - 10) + ' = ?', a - b, ['Add the two hops.']), Q(a + ' ' + MINUS + ' ' + b + ' = ?', a - b, [b + ' + ' + (a - b) + ' = ' + a + ', so the answer is ' + B(a - b) + '.'])]; },
  practice: R => rand2(R, ['thinkadd', 0], ['thinkadd', 1], ['thinkadd', 1], ['thinkadd', 2]) });
def('regroupAdd', 'Carrying a ten', 'When the ones add up to 10 or more, they make a new ten. Count it!', { deeper: 'bridge10',
  steps(R, p) { let o = p && parseOp(p), a, b; if (o && o.op === '+' && o.b < 100) { a = o.a; b = o.b; } if (!a || (a % 10) + (b % 10) < 10) { do { a = R.i(25, 78); b = R.i(13, 69); } while ((a % 10) + (b % 10) < 10); }
    const ao = a % 10, bo = b % 10, aT = a - ao, bT = b - bo;
    return [Q(ao + ' + ' + bo + ' = ?', ao + bo, ['Add the ones first.', (ao + bo) + ' is 1 ten and ' + (ao + bo - 10) + ' ones. Remember that extra ten.']), Q(n(aT) + ' + ' + bT + ' = ?', aT + bT, ['Now the tens.']), Q(n(aT + bT) + ' + ' + (ao + bo) + ' = ?', a + b, ['Put them together. The ' + (ao + bo) + ' adds one more ten.']), Q(n(a) + ' + ' + b + ' = ?', a + b, [n(aT + bT) + ' + ' + (ao + bo) + ' = ' + B(n(a + b)) + '.'])]; },
  practice: R => rand2(R, ['split', 1], ['split', 0], ['split', 1], ['split', 2]) });
def('regroupSub', 'Taking from a ten', 'When there are not enough ones, go back to the ten first, then keep going.', { deeper: 'thinkAdd',
  steps(R, p) { let o = p && parseOp(p), a, b; if (o && o.op === '−' && o.b < 100 && o.a > 20) { a = o.a; b = o.b; } if (!a || (b % 10) <= (a % 10)) { do { a = R.i(42, 98); b = R.i(13, a - 12); } while ((b % 10) <= (a % 10)); }
    const bt = b - b % 10, bo = b % 10, mid = a - bt, k = mid % 10, out = [];
    if (bt) out.push(Q(n(a) + ' ' + MINUS + ' ' + bt + ' = ?', mid, ['Take away the tens first.']));
    if (bo > k && k > 0) out.push(Q(n(mid) + ' ' + MINUS + ' ' + k + ' = ?', mid - k, ['Go back to the ten: take away just ' + k + '.']), Q(n(mid - k) + ' ' + MINUS + ' ' + (bo - k) + ' = ?', a - b, [bo + ' is ' + k + ' + ' + (bo - k) + '. Take away the other ' + (bo - k) + '.']));
    else out.push(Q(n(mid) + ' ' + MINUS + ' ' + bo + ' = ?', a - b));
    out.push(Q(n(a) + ' ' + MINUS + ' ' + b + ' = ?', a - b, ['Same steps: ' + B(n(a - b)) + '.'])); return out; },
  practice: R => rand2(R, ['subsplit', 1], ['countup', 1], ['subsplit', 1], ['subsplit', 2]) });
def('compensate', 'Using a friendly number', 'Add or take away the friendly number, then fix it: give back what was extra.', { deeper: 'tensOnly',
  steps(R, p) { let o = p && parseOp(p); if (!o || (o.op !== '+' && o.op !== '−')) o = { a: R.i(23, 80), op: R.chance(.5) ? '+' : '−', b: 9 };
    const { a, b } = o, add = o.op === '+', F = b < 30 ? Math.round(b / 10) * 10 : (Math.abs(b - Math.round(b / 100) * 100) <= 2 ? Math.round(b / 100) * 100 : Math.round(b / 10) * 10), k = F - b, r1 = add ? a + F : a - F, res = add ? a + b : a - b;
    if (!k) return [];
    const fix = add ? (k > 0 ? n(r1) + ' ' + MINUS + ' ' + k : n(r1) + ' + ' + (-k)) : (k > 0 ? n(r1) + ' + ' + k : n(r1) + ' ' + MINUS + ' ' + (-k));
    return [Q(n(a) + ' ' + o.op + ' ' + F + ' = ?', r1, [b + ' is close to ' + F + '. Use ' + F + ' first.']), Q(fix + ' = ?', res, [add ? (k > 0 ? 'You added ' + k + ' too many, so take ' + k + ' back.' : 'You still need ' + (-k) + ' more.') : (k > 0 ? 'You took away ' + k + ' too many, so give ' + k + ' back.' : 'Take away ' + (-k) + ' more.')]), Q(n(a) + ' ' + o.op + ' ' + b + ' = ?', res, ['Same answer: ' + B(n(res)) + '.'])]; },
  practice: R => rand2(R, ['add9', 0], ['sub9', 0], ['add9', 1], ['sub9', 1]) });
def('tensOnly', 'Adding and taking away tens', 'Adding or taking away tens changes the tens digit. The ones stay the same.', { deeper: 'placeValue', practice: R => rand2(R, ['tenmore', 0], ['addtens', 0], ['subtens', 0], ['addtens', 1]) });
def('placeValue', 'Place value', 'Ones, tens, hundreds: each place is worth 10 times the one to its right.', { practice: R => rand2(R, ['placeval', 0], ['placeval', 0], ['placeval', 1], ['placeval', 1]) });
def('bond100', 'Making 100', 'To make 100, the tens add to 9 and the ones add to 10.', { deeper: 'bond10',
  steps(R, p) { const t0 = strip(p && p.text).replace(/,/g, ''); let m = t0.match(/^(\d{2}) \+ \? = 100|^100 = (\d{2})|^100 − (\d{2}) =/), v = m ? +(m[1] || m[2] || m[3]) : 0; if (!v || v % 10 === 0) { do { v = R.i(12, 88); } while (v % 10 === 0); }
    const t = Math.floor(v / 10), o = v % 10;
    return [Q(t + ' + ? = 9', 9 - t, ['The tens add up to 9, not 10, because the ones will make one more ten.']), Q(o + ' + ? = 10', 10 - o, ['The ones add up to 10.']), Q(((9 - t) * 10) + ' + ' + (10 - o) + ' = ?', 100 - v), Q(v + ' + ? = 100', 100 - v, [v + ' + ' + (100 - v) + ' = 100.'])]; },
  practice: R => rand2(R, ['bond100', 0], ['bond100', 1], ['from100', 1], ['bond100', 1]) });
def('doubles', 'Doubles', 'Doubles like 7 + 7 = 14 are worth knowing by heart.', { practice: R => rand2(R, ['doubles', 0], ['doubles', 0], ['doubles', 1], ['doubles', 1]) });
def('seqJump', 'Finding the jump', 'Look at two numbers side by side. How much did it go up or down? Use the same jump.', { practice: R => rand2(R, ['skip1', 0], ['addrule', 0], ['addrule', 0], ['addrule', 1]) });
def('oddEvenDigit', 'Odd and even', 'Look only at the ones digit.', { practice: R => rand2(R, ['oddeven', 0], ['oddeven', 0], ['oddeven', 1], ['oddeven', 1]) });
def('hundredChart', 'The hundred chart', 'Down a row is +10, up a row is ' + MINUS + '10.', { deeper: 'tensOnly', practice: R => rand2(R, ['hundred', 0], ['hundred', 0], ['hundred', 0], ['hundred', 1]) });
def('roundRule', 'Rounding', 'Look at the digit just to the right: 5 or more rounds up, 4 or less rounds down.', { deeper: 'placeValue', practice: R => rand2(R, ['round', 0], ['round', 0], ['round', 1], ['round', 1]) });
def('multMeaning', 'What times means', '3 × 4 means 3 groups of 4. It is not 3 + 4.', { practice: R => rand2(R, ['groups', 0], ['groups', 0], ['groups', 1], ['groups', 2]) });
def('zeros', 'Times with zeros', 'Do the small fact, then count the zeros and put them on the end.', { deeper: 'placeValue',
  steps(R, p) { const o = p && parseOp(p); if (!o || o.op !== '×') return []; const za = (String(o.a).match(/0+$/) || [''])[0].length, zb = (String(o.b).match(/0+$/) || [''])[0].length; if (!za && !zb) return []; const a = o.a / 10 ** za, b = o.b / 10 ** zb;
    return [Q(a + ' × ' + b + ' = ?', a * b, ['The small fact first.']), Q('How many zeros are on the end of ' + n(o.a) + ' and ' + n(o.b) + ' together?', za + zb, ['Count them: ' + za + ' + ' + zb + '.']), Q(n(o.a) + ' × ' + n(o.b) + ' = ?', o.a * o.b, ['Put ' + (za + zb) + ' zeros on the end of ' + (a * b) + ': ' + B(n(o.a * o.b)) + '.'])]; },
  practice: R => rand2(R, ['xtens', 0], ['xtens', 0], ['xtens', 1], ['xtens', 2]) });
def('halfDouble', 'Halving and doubling', 'Half of 16 is 8. Double 8 is 16. Halving and doubling undo each other.', { deeper: 'doubles', practice: R => rand2(R, ['div2510', 0], ['doubles', 0], ['dblhalf', 0], ['div2510', 1]) });
def('remainder', 'Leftovers', 'Find the biggest times fact that fits, then see what is left. The leftover is always smaller than the number you divide by.', {
  steps(R, p) { let mt = p && p.meta; if (!mt || !mt.dv) { const dv = R.i(3, 6), q = R.i(2, 7), r = R.i(1, dv - 1); mt = { dv, q, r, v: dv * q + r }; }
    const { v, dv, q, r } = mt, list = Array.from({ length: Math.min(q + 1, 6) }, (_, i) => dv * (i + 1)).join(', ');
    return [Q('What is the biggest number in the ' + dv + 's that is not more than ' + v + '?', dv * q, ['Count by ' + dv + 's: ' + list + '… ' + (dv * q) + ' fits, ' + (dv * (q + 1)) + ' is too big.']), Q(v + ' ' + MINUS + ' ' + (dv * q) + ' = ?', r, ['That is the leftover. It is smaller than ' + dv + ', so it is right.']), Object.assign(Q(v + ' ÷ ' + dv + ' = ?', null, [dv + ' × ' + q + ' = ' + (dv * q) + ', with ' + r + ' left: ' + B(q + ' r ' + r) + '.']), { type: 'rem', ans: { q, r }, text: B(v + ' ÷ ' + dv + ' = ?') + ' Use r for the leftovers.' })]; },
  practice: R => rand2(R, ['remain', 0], ['remain', 0], ['remain', 1], ['remain', 1]) });
def('handSwap', 'Which hand is which', 'The short hand shows the hour. The long hand shows the minutes.', { deeper: 'minutesBy5',
  steps(R, p) { let { h, m } = clockOf(p, R); return [{ type: 'choice', opts: ['The short hand', 'The long hand'], ans: 'The short hand', text: 'Which hand shows the ' + B('hour') + '?', vis: clockSVG(h, m), how: ['The short hand is the hour hand. The long hand is the minute hand.'], key: 'hs' + (++QN), step: true },
    Q('Look at the long hand. How many minutes is it?', m, ['The long hand points ' + (m % 5 ? 'past' : 'to') + ' the ' + (Math.floor(m / 5) || 12) + '. Count by 5s' + (m % 5 ? ', then the little marks' : '') + ': ' + m + ' minutes.'], { vis: clockSVG(h, m, { fives: true }) }),
    Q('Look at the short hand. What hour is it?', h, ['The short hand has passed the ' + h + ', so the hour is ' + h + '.'], { vis: clockSVG(h, m) }),
    { type: 'time', text: 'What time does the clock show?', vis: clockSVG(h, m), ans: { h, m }, how: ['Hour from the short hand, minutes from the long hand: ' + B(fmtT(h, m)) + '.'], key: 'hs' + (++QN), step: true }]; },
  practice: R => rand2(R, ['oclock', 1], ['fivemin', 0], ['quarter', 0], ['fivemin', 1]) });
def('hourHand', 'Reading the hour', 'The hour is the number the short hand has passed, even when it is almost at the next one.', { deeper: 'handSwap',
  steps(R, p) { let { h, m } = clockOf(p, R); if (m < 35) m = R.pick([40, 45, 50, 55]); const nx = h % 12 + 1;
    return [{ type: 'choice', opts: [String(h), String(nx)], ans: String(h), text: 'The short hand is between the ' + h + ' and the ' + nx + '. What hour is it?', vis: clockSVG(h, m), how: ['It has passed the ' + h + ' but not reached the ' + nx + ' yet, so the hour is still ' + B(h) + '.'], key: 'hh' + (++QN), step: true },
      { type: 'time', text: 'What time does the clock show?', vis: clockSVG(h, m), ans: { h, m }, how: ['Hour ' + h + ', ' + m + ' minutes: ' + B(fmtT(h, m)) + '.'], key: 'hh' + (++QN), step: true }]; },
  practice: R => rand2(R, ['quarter', 1], ['fivemin', 1], ['tominute', 2], ['quarter', 1]) });
def('minutesBy5', 'Counting minutes by 5s', 'Each number on the clock is 5 more minutes: the 1 is 5, the 2 is 10, the 7 is 35.', { deeper: 'skip:5',
  steps(R, p) { const out = []; for (const k of R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).slice(0, 2)) out.push(Q('The long hand points to the ' + k + '. How many minutes is that?', 5 * k, ['Count by 5s from the 12: ' + Array.from({ length: k }, (_, i) => 5 * (i + 1)).join(', ') + '.'], { vis: clockSVG(R.i(1, 12), 5 * k, { fives: out.length === 0 }) }));
    if (p && (p.type === 'time' || p.type === 'clockset') && !p.dur) { const { h, m } = clockOf(p, R); out.push({ type: 'time', text: 'What time does the clock show?', vis: clockSVG(h, m), ans: { h, m }, how: [B(fmtT(h, m))], key: 'mb' + (++QN), step: true }); }
    return out; },
  practice: R => rand2(R, ['fivemin', 0], ['fivemin', 1], ['tominute', 0], ['tominute', 1]) });
def('hourCross', 'Time across the hour', 'An hour has 60 minutes, not 100. Hop to the o\'clock first, then keep going.', { deeper: 'timeFacts',
  steps(R, p) { const mt = p && p.meta;
    if (mt && mt.h1 != null) { const { h1, m1, h2, m2 } = mt, first = 60 - m1, rest = (h2 - h1 - 1) * 60 + m2; if (!m1) return [];
      return [Q('How many minutes from ' + fmtT(h1, m1) + ' to ' + (h1 + 1) + ':00?', first, ['From :' + String(m1).padStart(2, '0') + ' to the o\'clock is 60 ' + MINUS + ' ' + m1 + ' = ' + first + '. (An hour is 60 minutes, not 100.)']), Q('How many minutes from ' + (h1 + 1) + ':00 to ' + fmtT(h2, m2) + '?', rest, [rest >= 60 ? 'Whole hours are 60 minutes each.' : 'Count the minutes after the o\'clock.']), Q(first + ' + ' + rest + ' = ?', first + rest, ['Add the hops: ' + (first + rest) + ' minutes.'])]; }
    if (mt && mt.k != null && mt.m) { const { h, m, k, dir } = mt, r = T.add(h, m, dir * k);
      if (dir > 0) { const top = 60 - m; if (k < top) return []; const nx = h % 12 + 1; return [Q('How many minutes from ' + fmtT(h, m) + ' to ' + nx + ':00?', top, ['60 ' + MINUS + ' ' + m + ' = ' + top + '.']), Q(k + ' ' + MINUS + ' ' + top + ' = ?', k - top, ['That many minutes are still to go after ' + nx + ':00.']), { type: 'time', text: 'What time is ' + B((k - top) + ' minutes after ' + nx + ':00') + '?', ans: r, how: [B(fmtT(r.h, r.m))], key: 'hc' + (++QN), step: true }]; }
      if (k < m) return []; return [Q('How many minutes from ' + h + ':00 back to ' + fmtT(h, m) + '?', m, ['The minutes past the o\'clock: ' + m + '.']), Q(k + ' ' + MINUS + ' ' + m + ' = ?', k - m, ['Still that many minutes to go back from ' + h + ':00.']), { type: 'time', text: 'What time is ' + B((k - m) + ' minutes before ' + h + ':00') + '?', ans: r, how: [B(fmtT(r.h, r.m))], key: 'hc' + (++QN), step: true }]; }
    return []; },
  practice: R => rand2(R, ['elapsed', 0], ['elapsed', 1], ['later', 1], ['earlier', 1]) });
def('timeFacts', 'Minutes and hours', '1 hour = 60 minutes. Half an hour = 30. A quarter hour = 15.', { practice: R => rand2(R, ['timefacts', 0], ['timefacts', 0], ['timefacts', 1], ['timefacts', 1]) });
def('coinValues', 'Coin values', 'Penny 1¢, nickel 5¢, dime 10¢, quarter 25¢. The small dime is worth more than the bigger nickel.', {
  steps(R) { return [{ type: 'choice', opts: ['Nickel', 'Dime'], ans: 'Dime', text: 'Which coin is worth more?', vis: coinsRow(['n', 'd']), how: ['The dime is smaller, but it is worth 10¢. The nickel is worth 5¢.'], key: 'cv' + (++QN), step: true }]; },
  practice: R => rand2(R, ['coins', 0], ['coins', 0], ['coins', 0], ['coins', 1]) });
def('countOnCoins', 'Counting coins', 'Sort the coins biggest first, then count on.', { deeper: 'coinValues',
  steps(R, p) { const list = p && p.meta && p.meta.coins && p.meta.coins.length > 1 ? p.meta.coins : null; if (!list) return [];
    const cnt = {}; list.forEach(id => cnt[id] = (cnt[id] || 0) + 1); const out = []; let tot = 0;
    COIN_ORDER.filter(id => cnt[id]).forEach(id => { const c = COIN[id], k = cnt[id], before = tot; tot += k * c.v;
      out.push(Object.assign(Q(before ? 'You have ' + fmtM(before) + '. Count on ' + k + ' ' + (k === 1 ? c.name : c.many) + '. How much now?' : 'Count the ' + (k === 1 ? c.name : c.many) + ' first. How much?', tot, [(before ? 'Start at ' + fmtM(before) + ' and count on by ' + c.v + 's: ' : 'Count by ' + c.v + 's: ') + Array.from({ length: k }, (_, i) => fmtM(before + (i + 1) * c.v)).join(', ') + '.'], { vis: coinsRow(Array(k).fill(id)) }), { type: 'money', fmt: tot >= 100 ? 'd' : 'c' })); });
    return out; },
  practice: R => rand2(R, ['countcoins', 0], ['countcoins', 0], ['countcoins', 1], ['countcoins', 1]) });
def('dollarNotation', 'Dollars and cents', '100¢ = $1.00. The dot goes between the dollars and the cents.', { deeper: 'placeValue', practice: R => rand2(R, ['dollars', 0], ['dollars', 0], ['dollars', 0], ['dollars', 1]) });
def('countUpChange', 'Counting up for change', 'Start at the price and count up to the money paid. The hops add up to the change.', { deeper: 'countOnCoins',
  steps(R, p) { const mt = p && p.meta; if (!mt || mt.price == null) return []; const { price, paid } = mt; let at = price; const out = [], hops = [];
    const nd = paid >= 500 ? Math.ceil(price / 100) * 100 : Math.ceil(price / 10) * 10;
    if (nd > at && nd < paid) { out.push(Object.assign(Q('Count up from ' + fmtM(at) + ' to ' + fmtM(nd) + '. How much is that?', nd - at, ['Hop to the next ' + (paid >= 500 ? 'dollar' : 'ten') + '.']), { type: 'money', fmt: 'c' })); hops.push(nd - at); at = nd; }
    out.push(Object.assign(Q('Count up from ' + fmtM(at) + ' to ' + fmtM(paid) + '. How much is that?', paid - at, ['Count on to the money paid.']), { type: 'money', fmt: paid - at >= 100 ? 'd' : 'c' })); hops.push(paid - at);
    if (hops.length > 1) out.push(Object.assign(Q(hops.map(fmtM).join(' + ') + ' = ?', paid - price, ['The hops add up to the change.']), { type: 'money', fmt: paid - price >= 100 ? 'd' : 'c' }));
    return out; },
  practice: R => rand2(R, ['change1', 0], ['change1', 0], ['change1', 1], ['change1', 1]) });
def('fewestRule', 'Fewest coins', 'Biggest coin first, as many as fit, then the next biggest.', { deeper: 'coinValues', practice: R => rand2(R, ['fewest', 0], ['fewest', 0], ['fewest', 1], ['fewest', 1]) });

/* families with a number: the 7s, counting by 4s, dividing by 6 */
function trickSteps(k, o) {
  const s = (t, a, h) => Q(t, a, h ? [h] : []);
  switch (k) {
    case 2: return [s(o + ' + ' + o + ' = ?', 2 * o, 'Times 2 is a double.')];
    case 3: return [s(o + ' + ' + o + ' = ?', 2 * o, 'Times 3 starts with a double…'), s((2 * o) + ' + ' + o + ' = ?', 3 * o, '…plus one more group.')];
    case 4: return [s(o + ' + ' + o + ' = ?', 2 * o, 'Double it.'), s((2 * o) + ' + ' + (2 * o) + ' = ?', 4 * o, 'Double again.')];
    case 8: return [s('Double ' + o + ' = ?', 2 * o), s('Double ' + (2 * o) + ' = ?', 4 * o), s('Double ' + (4 * o) + ' = ?', 8 * o, 'Three doubles make times 8.')];
    case 5: return [s('10 × ' + o + ' = ?', 10 * o, 'Put a zero on the end.'), s('Half of ' + (10 * o) + ' = ?', 5 * o, 'Times 5 is half of times 10.')];
    case 9: return [s('10 × ' + o + ' = ?', 10 * o), s((10 * o) + ' ' + MINUS + ' ' + o + ' = ?', 9 * o, '9 groups is one group less than 10 groups.')];
    case 6: return [s('5 × ' + o + ' = ?', 5 * o), s((5 * o) + ' + ' + o + ' = ?', 6 * o, '6 groups is 5 groups and one more.')];
    case 7: return [s('5 × ' + o + ' = ?', 5 * o), s('2 × ' + o + ' = ?', 2 * o), s((5 * o) + ' + ' + (2 * o) + ' = ?', 7 * o, '5 groups and 2 groups make 7 groups.')];
    case 11: return o > 9 ? [s('10 × ' + o + ' = ?', 10 * o), s((10 * o) + ' + ' + o + ' = ?', 11 * o)] : [];
    case 12: return [s('10 × ' + o + ' = ?', 10 * o), s('2 × ' + o + ' = ?', 2 * o), s((10 * o) + ' + ' + (2 * o) + ' = ?', 12 * o)];
  }
  return [];
}
function param(id) {
  const [kind, kk] = id.split(':'), k = +kk;
  if (kind === 'skip') return { id, label: 'Counting by ' + k + 's', blurb: 'Skip counting by ' + k + 's: ' + [1, 2, 3, 4, 5].map(i => i * k).join(', ') + '…', deeper: null,
    steps: () => [], practice(R) { const mk = (st, len, miss) => { const seq = Array.from({ length: len }, (_, i) => st + i * k), sh = seq.map((v, i) => i === miss ? null : v); return Q('What number goes in the box?', seq[miss], ['Each jump is +' + k + '. ' + seq[miss - 1] + ' + ' + k + ' = ' + B(seq[miss]) + '.'], { text: 'What number goes in the box?', vis: seqHTML(sh), step: false }); };
      const o = R.i(3, 6); return [mk(0, 5, 4), mk(k * R.i(2, 4), 5, 4), mk(k * R.i(1, 5), 5, R.i(1, 3)), Q(k + ' × ' + o + ' = ?', k * o, ['Count by ' + k + 's ' + o + ' times: ' + Array.from({ length: o }, (_, i) => k * (i + 1)).join(', ') + '.'], { step: false })]; } };
  if (kind === 'mult') return { id, label: 'The ' + k + 's', blurb: mulHow(k, 7)[0], deeper: k > 1 && k <= 10 ? 'skip:' + k : null,
    steps(R, p) { const o0 = p && parseOp(p); let o = o0 && o0.op === '×' ? (o0.a === k ? o0.b : o0.a) : R.i(3, 9); if (o > 12) o = R.i(3, 9); const st = trickSteps(k, o); return st.length ? st.concat([Q(k + ' × ' + o + ' = ?', k * o, mulHow(k, o))]) : []; },
    practice(R) { return R.shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 4).map(o => Q(R.chance(.5) ? k + ' × ' + o + ' = ?' : o + ' × ' + k + ' = ?', k * o, mulHow(k, o), { step: false })); } };
  if (kind === 'div') return { id, label: 'Dividing by ' + k, blurb: 'Division asks: ' + k + ' times what makes this number?', deeper: 'mult:' + k,
    steps(R, p) { const o = p && parseOp(p); if (!o || o.op !== '÷' || o.a % o.b) return []; return [Q(o.b + ' × ? = ' + o.a, o.a / o.b, ['How many groups of ' + o.b + ' make ' + o.a + '?']), Q(o.a + ' ÷ ' + o.b + ' = ?', o.a / o.b, ['Same question: ' + B(o.a / o.b) + '.'])]; },
    practice(R) { return R.shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4).map((q, i) => i < 2 ? Q(k + ' × ? = ' + (k * q), q, [k + ' × ' + q + ' = ' + (k * q) + '.'], { step: false }) : Q((k * q) + ' ÷ ' + k + ' = ?', q, ['Think: ' + k + ' × what = ' + (k * q) + '? ' + B(q) + '.'], { step: false })); } };
  if (kind === 'skill' && S[kk]) { const s = S[kk], st = STRANDS.find(x => x.id === s.strand), prev = s.idx > 0 ? st.skills[s.idx - 1] : null;
    return { id, label: s.title, blurb: s.tip, deeper: prev ? 'skill:' + prev : null, steps: () => [], practice: R => rand2(R, [kk, 0], [kk, 0], [kk, 1], [kk, 1]) }; }
  return null;
}
function concept(id) { return C[id] || param(id) || null; }
function clockOf(p, R) { if (p && p.meta && p.meta.h != null && p.meta.k == null) return { h: p.meta.h, m: p.meta.m }; if (p && p.ans && p.ans.h != null && !p.dur) return { h: p.ans.h || 12, m: p.ans.m }; return { h: R.i(1, 12), m: R.i(1, 11) * 5 }; }

/* ---------- diagnosis ---------- */
const BASE = { make10: 'bridge10', bond10: 'bond10', doubles: 'doubles', add9: 'compensate', addtens: 'tensOnly', bond100: 'bond100', split: 'regroupAdd', nearhund: 'compensate', thinkadd: 'thinkAdd', sub9: 'compensate', subtens: 'tensOnly', from100: 'bond100', countup: 'regroupSub', subsplit: 'regroupSub', skip1: 'seqJump', skip2: 'seqJump', oddeven: 'oddEvenDigit', addrule: 'seqJump', hundred: 'hundredChart', placeval: 'placeValue', tenmore: 'tensOnly', round: 'roundRule', estimate: 'roundRule', groups: 'multMeaning', xtens: 'zeros', dblhalf: 'halfDouble', div2510: 'halfDouble', remain: 'remainder', oclock: 'handSwap', quarter: 'hourHand', fivemin: 'minutesBy5', tominute: 'minutesBy5', timefacts: 'timeFacts', elapsed: 'hourCross', later: 'hourCross', earlier: 'hourCross', coins: 'coinValues', countcoins: 'countOnCoins', makeamt: 'countOnCoins', dollars: 'dollarNotation', change1: 'countUpChange', change5: 'countUpChange', fewest: 'fewestRule' };
const MULT_SKILLS = ['x2510', 'x48', 'x9', 'x36', 'x7sq', 'x1112'];
function trickFactor(a, b) { const ord = [0, 1, 10, 2, 5, 11, 4, 9, 3, 8, 6, 12, 7], r = v => { const i = ord.indexOf(v); return i < 0 ? 99 : i; }; return r(a) <= r(b) ? a : b; }
function base(p) {
  const s = p.skill, o = parseOp(p);
  if (o && o.op === '×' && o.a <= 12 && o.b <= 12 && (MULT_SKILLS.includes(s) || s === 'groups' && o.a > 1 && o.b > 1 || s === 'factfam')) { const t = trickFactor(o.a, o.b); return t > 1 && t !== 10 ? 'mult:' + t : 'multMeaning'; }
  if (o && o.op === '÷' && o.b <= 12 && ['share', 'factfam'].includes(s)) return 'div:' + o.b;
  return BASE[s] || 'skill:' + s;
}
const D = (id, why) => ({ id, why });
function colSub(a, b) { const A = String(a).split('').reverse(), Bs = String(b).split('').reverse(); let out = ''; for (let i = 0; i < A.length; i++) out = Math.abs(+A[i] - +(Bs[i] || 0)) + out; return +out; }
function diagnose(p, v) {
  const s = p.skill, o = parseOp(p), A = p.ans;
  if (p.type === 'num' || p.type === 'money') {
    if (typeof v !== 'number') return D(base(p), null);
    const d = v - A, ad = Math.abs(d);
    if (String(v).length > 1 && String(v).split('').reverse().join('') === String(A)) return D('placeValue', 'You had the right digits in the wrong places. Check which digit is the tens and which is the ones.');
    if (o && o.op === '×') {
      if (v === o.a + o.b) return D('multMeaning', 'You added ' + o.a + ' and ' + o.b + '. Times means groups: ' + o.a + ' groups of ' + o.b + '.');
      if (A && (v === A * 10 || v * 10 === A || v === A * 100 || v * 100 === A)) return D('zeros', 'Right digits, wrong number of zeros. Count the zeros in both numbers.');
      for (const k of [o.a, o.b]) if (k > 1 && k <= 12 && ad % k === 0 && ad / k <= 2 && ad) { const other = k === o.a ? o.b : o.a; if (other <= 12) return D('mult:' + k, 'You were ' + (ad / k) + ' ' + (ad / k === 1 ? 'group' : 'groups') + ' of ' + k + ' ' + (d < 0 ? 'short' : 'over') + '. ' + o.a + ' × ' + o.b + ' is ' + (k === o.a ? o.b : o.a) + ' groups of ' + k + '.'); }
    }
    if (o && o.op === '÷' && s !== 'remain' && o.b <= 12) return D('div:' + o.b, 'Think of the times fact: ' + o.b + ' × what = ' + o.a + '?');
    if (['add9', 'sub9', 'nearhund'].includes(s) && o) { const b = o.b; if (ad <= 4 || ad === 2 * Math.abs(Math.round(b / 10) * 10 - b)) return D('compensate', 'Close! When you use the friendly number, remember to fix it: give back or take away the extra.'); }
    if (['bond100', 'from100'].includes(s) && (d === 10 || d === -10)) return D('bond100', 'Ten off. For 100, the tens add up to 9 (not 10), because the ones make another ten.');
    if (s === 'timefacts' && (A % 60 === 0 || /hour/.test(strip(p.text))) && (v % 100 === 0 || ad % 40 === 0)) return D('timeFacts', 'An hour is 60 minutes, not 100.');
    if (s === 'elapsed' && ad % 40 === 0 && ad) return D('hourCross', 'It looks like you counted an hour as 100 minutes. An hour is 60 minutes.');
    if (p.meta && p.meta.coins && p.meta.coins.length) { const swap = p.meta.coins.reduce((t, id) => t + (id === 'n' ? 10 : id === 'd' ? 5 : COIN[id].v), 0); if (swap === v && swap !== A) return D('coinValues', 'It looks like the nickel and the dime got mixed up. A dime is 10¢, a nickel is 5¢.'); if (s === 'coins') return D('coinValues', null); return D('countOnCoins', 'Sort the coins biggest first and count on carefully.'); }
    if (s === 'dollars' && (v === A * 10 || v * 10 === A || v === A / 100 || v === A * 100)) return D('dollarNotation', 'The dot was in the wrong place. Two digits after the dot are cents.');
    if (s === 'round') return D('roundRule', 'Look at the digit right after the place you are rounding to.');
    if (o && o.op === '+' && Math.max(o.a, o.b) < 100 && Math.min(o.a, o.b) < 10 && A > 10 && (ad <= 2 || ad === 10)) return D('bridge10', ad === 10 ? 'Ten off. Fill up to the next 10 first, then add what is left.' : 'Close! Fill up to 10 first, then add what is left.');
    if (o && (o.op === '+' || o.op === '−') && (ad === 10 || ad === 100)) return D(o.op === '+' ? 'regroupAdd' : 'regroupSub', o.op === '+' ? 'You were ' + ad + ' off. When the ' + (ad === 10 ? 'ones' : 'tens') + ' make 10 or more, there is one more ' + (ad === 10 ? 'ten' : 'hundred') + ' to count.' : 'You were ' + ad + ' off. When there are not enough ' + (ad === 10 ? 'ones' : 'tens') + ', break a ' + (ad === 10 ? 'ten' : 'hundred') + ' first.');
    if (o && o.op === '−' && o.a >= 20 && v === colSub(o.a, o.b) && v !== A) return D('regroupSub', 'It looks like you took the smaller digit from the bigger one in each place. When the ones on top are smaller, take from a ten first.');
    if (o && o.op === '−' && o.a <= 20 && ad <= 2) return D('thinkAdd', 'Close! Think of the adding fact: ' + o.b + ' + what = ' + o.a + '?');
    if (['change1', 'change5', 'budget'].includes(s) && p.meta && p.meta.price != null) return D('countUpChange', ad % 10 === 0 || ad % 100 === 0 ? 'Off by ' + fmtM(ad) + '. Count up in hops: first to the next ten, then to the dollar.' : null);
    return D(base(p), null);
  }
  if (p.type === 'time' || p.type === 'clockset') {
    if (!v || v.h == null) return D(base(p), null);
    if (p.dur || ['elapsed', 'later', 'earlier'].includes(s)) return D('hourCross', v.m >= 60 ? 'There are only 60 minutes in an hour. Past 59 minutes, move on to the next hour.' : (v.m === A.m && v.h !== A.h) ? 'The minutes were right. Check whether you went past an o\'clock.' : null);
    if (A.m % 5 === 0 && A.m && (v.h % 12) === (A.m / 5) % 12 && v.m === (A.h % 12) * 5) return D('handSwap', 'The hands got swapped. The short hand shows the hour; the long hand shows the minutes.');
    if (v.m === A.m && v.h !== A.h) return D('hourHand', A.m >= 30 && (v.h % 12) === (A.h % 12) + 1 ? 'The short hand is close to ' + v.h + ' but has not reached it yet, so the hour is still ' + A.h + '.' : 'The minutes were right. Look again at the short hand for the hour.');
    if (v.h === A.h && v.m !== A.m) return D('minutesBy5', v.m === Math.floor(A.m / 5) || v.m === A.m / 5 ? 'You read the number the long hand points to. Count by 5s instead: each number is 5 minutes.' : 'The hour was right. Count the minutes by 5s from the 12.');
    return D(base(p), null);
  }
  if (p.type === 'rem') { const dv = p.meta && p.meta.dv; if (v && dv && v.r >= dv) return D('remainder', 'The leftover can\'t be ' + v.r + ', because that is enough for another group of ' + dv + '.'); return D('remainder', null); }
  if (p.type === 'coins') { const t = Array.isArray(v) ? v.reduce((x, id) => x + COIN[id].v, 0) : 0; if (p.fewest && t === A) return D('fewestRule', 'That makes the right amount, but you can do it with fewer coins. Use bigger coins first.'); const swap = Array.isArray(v) ? v.reduce((x, id) => x + (id === 'n' ? 10 : id === 'd' ? 5 : COIN[id].v), 0) : 0; if (swap === A) return D('coinValues', 'It looks like the nickel and the dime got mixed up.'); return D('countOnCoins', 'That makes ' + fmtM(t) + '. Count on as you add each coin.'); }
  return D(base(p), null);
}

/* ---------- practice sessions ---------- */
function session(id, R, p) {
  const c = concept(id); if (!c) return [];
  let steps = []; try { steps = c.steps(R, p) || []; } catch (e) { steps = []; }
  let prac = []; try { prac = c.practice(R) || []; } catch (e) { prac = []; }
  return steps.concat(prac).filter(Boolean).map(q => { q.concept = id; if (!q.how) q.how = []; return q; });
}

/* ---------- placement check (pretest) ----------
   Every strand gets a binary search over its lessons: each tested lesson asks one medium and one hard problem.
   Both right = passed; the search moves up. A miss = the search moves down. Where it settles is the starting lesson:
   everything before it counts as done (2 stars). The first lesson tested depends on the grade. */
const ENTRY = { 3: .3, 4: .55 };
function pretestStart(grade) { const st = {}; STRANDS.forEach(s => { st[s.id] = { lo: -1, hi: s.skills.length, at: -1, step: 0, got: 0, ok: 0, done: false, log: [] }; }); return { v: 1, grade, st, order: STRANDS.map(s => s.id), done: false, t: 0 }; }
function pretestNext(pre) {
  for (const sid of pre.order) { const st = pre.st[sid], sk = STRANDS.find(s => s.id === sid).skills; if (st.done) continue;
    if (st.at < 0) st.at = Math.min(sk.length - 1, Math.max(0, Math.round((sk.length - 1) * (ENTRY[pre.grade] || .3))));
    return { strand: sid, skill: sk[st.at], d: st.step === 0 ? 1 : 2, index: st.step }; }
  return null;
}
function pretestRecord(pre, ok) {
  const nx = pretestNext(pre); if (!nx) return; const st = pre.st[nx.strand], sk = STRANDS.find(s => s.id === nx.strand).skills;
  st.log.push([nx.skill, nx.d, ok ? 1 : 0]);
  if (st.step === 0 && ok) { st.step = 1; return; }
  const pass = ok && st.step === 1;
  if (pass) st.lo = Math.max(st.lo, st.at); else st.hi = Math.min(st.hi, st.at);
  st.step = 0;
  if (st.hi - st.lo <= 1) { st.done = true; st.start = st.hi; return; }
  st.at = Math.floor((st.lo + st.hi + 1) / 2); if (st.at <= st.lo) st.at = st.lo + 1; if (st.at >= st.hi) st.at = st.hi - 1;
}
function pretestSkip(pre) { const nx = pretestNext(pre); if (!nx) return; const st = pre.st[nx.strand]; st.log.push([nx.skill, nx.d, 0]); st.hi = Math.min(st.hi, st.at); st.step = 0; if (st.hi - st.lo <= 1) { st.done = true; st.start = st.hi; } else { st.at = Math.floor((st.lo + st.hi + 1) / 2); if (st.at <= st.lo) st.at = st.lo + 1; } }
function pretestProgress(pre) { let done = 0; pre.order.forEach(s => { if (pre.st[s].done) done++; }); return { done, total: pre.order.length }; }
/* stars granted by the placement: every lesson below the start gets 2 */
function pretestStars(pre) { const out = {}; STRANDS.forEach(s => { const st = pre.st[s.id]; if (!st) return; const upto = st.done ? st.start : st.lo + 1; for (let i = 0; i < upto; i++) out[s.skills[i]] = 2; }); return out; }

const API = { concept, diagnose, session, base, parseOp, C, pretestStart, pretestNext, pretestRecord, pretestSkip, pretestProgress, pretestStars };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.COACH = API;
})(typeof window !== 'undefined' ? window : this);
