/* Fractions, Decimals & Percents (grades 2 to 8), Factors & Primes (4 to 8), Measuring & Shapes (3 to 10).
   Each concept is one narrow idea or shortcut. The how lines teach the shortcut with the problem's own numbers,
   the steps break it into smaller questions with the same numbers, and the traps name the idea behind a mistake. */
(function (C) {
'use strict';
const { B, num, MINUS, frac, mixed, gcd, lcm, reduce, isPrime, factorize, factorsOf, pw, PI, DEG, plural, NAMES,
  fracBarSVG, rectSVG, triSVG, groupsSVG, angleSVG, numLineSVG, table } = C;

/* ---------- small local helpers ---------- */
const F = (n, d) => ({ n, d });                                   /* a fraction answer */
const FL = (n, d) => ({ n, d, form: 'frac' });                    /* a trap that is equal but not in lowest terms */
const tr = (v, c, why) => ({ v, c, why });
const st = (text, ans, o) => Object.assign({ text, ans }, o || {});
const sf = (text, n, d, o) => Object.assign({ text, ans: F(n, d), type: 'frac' }, o || {});
const fq = (t, b) => '<span class="fr"><span class="fr-n">' + t + '</span><span class="fr-d">' + b + '</span></span>'; /* a fraction with a ? in it */
const P10 = [1, 10, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8];
const dv = (k, p) => k / P10[p];                                  /* k hundredths etc: dv(275, 2) = 2.75 */
const pct = v => num(v) + '%';
const deg = v => num(v) + DEG;
const nm = n => num(n);
const name = R => R.pick(NAMES);
/* which times-table concept a single fact belongs to */
function factC(a, b) {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  if (lo <= 1) return 'm_turn';
  if (lo === hi && lo >= 6 && lo <= 8) return 'm_squares';
  if ([2, 5, 10].includes(lo) || [2, 5, 10].includes(hi)) return 'm_x2510';
  if (lo === 9 || hi === 9) return 'm_x9';
  if (hi > 12) return 'm_breakapart';
  if (hi >= 11) return 'm_x11';
  if ([4, 8].includes(lo) || [4, 8].includes(hi)) return 'm_x4x8';
  if ([3, 6].includes(lo) || [3, 6].includes(hi)) return 'm_x3x6';
  return 'm_x7';
}
/* a times-fact slip trap: one group too many or too few */
const slip = (a, b, scale, why) => tr((a * b + (b <= a ? b : a)) * (scale || 1), factC(a, b), why || 'Check the times fact ' + a + ' × ' + b + '.');
const simplest = (n, d) => { const [a, b] = reduce(n, d); return b === 1 ? nm(a) : frac(a, b); };
/* a prime factorization written with powers: 360 -> 2³ × 3² × 5 */
const pfStr = N => { const f = factorize(N); return Object.keys(f).map(Number).sort((x, y) => x - y).map(p => f[p] > 1 ? pw(p, f[p]) : String(p)).join(' × '); };
/* a/b × c/d written out: cancel across first, then times the tops and the bottoms */
function cancelMul(a, b, c, d) {
  const g1 = gcd(a, d), g2 = gcd(c, b), a1 = a / g1, d1 = d / g1, c1 = c / g2, b1 = b / g2, [N, D] = reduce(a1 * c1, b1 * d1);
  const parts = [], steps = [];
  if (g1 > 1) { parts.push(a + ' and ' + d + ' share ' + g1 + ': ' + a + ' → ' + a1 + ', ' + d + ' → ' + d1); steps.push(st('What is the biggest number that goes into both ' + B(a) + ' and ' + B(d) + '?', g1)); }
  if (g2 > 1) { parts.push(c + ' and ' + b + ' share ' + g2 + ': ' + c + ' → ' + c1 + ', ' + b + ' → ' + b1); steps.push(st('What is the biggest number that goes into both ' + B(c) + ' and ' + B(b) + '?', g2)); }
  steps.push(st('Tops: ' + B(a1 + ' × ' + c1) + ' = ?', a1 * c1), st('Bottoms: ' + B(b1 + ' × ' + d1) + ' = ?', b1 * d1));
  const same = N === a1 * c1 && D === b1 * d1;
  return { N, D, steps, lines: [parts.length ? 'Cancel first: ' + parts.join('; ') + '.' : 'Nothing cancels: no top shares a factor with a bottom.',
    'Times the tops and the bottoms: ' + frac(a1, b1) + ' × ' + frac(c1, d1) + ' = ' + frac(a1 * c1, b1 * d1) + (same ? '.' : ' = ' + simplest(N, D) + '.'), 'Answer: ' + B(simplest(N, D)) + '.'] };
}
/* a flat shape from points (x right, y up, in units), with side labels {a:[x,y], t, dx, dy, anc} and dashed lines [[x1,y1,x2,y2]] */
function polySVG(pts, labels, dashes) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), W = Math.max(...xs) - Math.min(...xs), H = Math.max(...ys) - Math.min(...ys), mx = Math.min(...xs), my = Math.max(...ys);
  const sc = Math.min(26, 240 / W, 150 / H), X = x => (50 + (x - mx) * sc).toFixed(1), Y = y => (20 + (my - y) * sc).toFixed(1);
  let s = '<svg class="fig" viewBox="0 0 ' + (W * sc + 110).toFixed(0) + ' ' + (H * sc + 50).toFixed(0) + '" style="max-width:' + Math.min(380, W * sc + 110).toFixed(0) + 'px" aria-hidden="true">';
  s += '<path d="M' + pts.map(p => X(p[0]) + ' ' + Y(p[1])).join(' L') + ' Z" class="fig-shape"/>';
  (dashes || []).forEach(q => { s += '<line x1="' + X(q[0]) + '" y1="' + Y(q[1]) + '" x2="' + X(q[2]) + '" y2="' + Y(q[3]) + '" class="fig-thin" stroke-dasharray="5 4"/>'; });
  (labels || []).forEach(l => { s += '<text x="' + (+X(l.a[0]) + (l.dx || 0)).toFixed(1) + '" y="' + (+Y(l.a[1]) + (l.dy || 0) + 5).toFixed(1) + '" class="fig-lab"' + (l.anc ? ' text-anchor="' + l.anc + '"' : '') + '>' + l.t + '</text>'; });
  return s + '</svg>';
}
/* a split angle picture: rays at 0, a and tot degrees, labels la and lb */
function splitAngleSVG(tot, a, la, lb) {
  const cx = 150, cy = 130, L = 115, ray = t => { const r = t * Math.PI / 180; return [cx + L * Math.cos(r), cy - L * Math.sin(r)]; };
  const lab = (t0, t1, s, r) => { const m = (t0 + t1) / 2 * Math.PI / 180; return '<text x="' + (cx + r * Math.cos(m)).toFixed(1) + '" y="' + (cy - r * Math.sin(m) + 6).toFixed(1) + '" class="fig-small">' + s + '</text>'; };
  let s = '<svg class="fig" viewBox="0 0 300 ' + (tot > 180 ? 270 : 150) + '" style="max-width:300px" aria-hidden="true">';
  [0, a, tot].forEach(t => { const [x, y] = ray(t); s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" class="fig-shape"/>'; });
  if (tot === 180) { const [x, y] = ray(180); s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" class="fig-shape"/>'; }
  if (tot === 90) s += '<path d="M' + (cx + 16) + ' ' + cy + ' L' + (cx + 16) + ' ' + (cy - 16) + ' L' + cx + ' ' + (cy - 16) + '" class="fig-thin"/>';
  return s + lab(0, a, la, 62) + lab(a, tot, lb, 62) + '</svg>';
}

/* every concept's traps: drop empty ones and repeats of the same value (the first one wins) */
function defs(list) {
  list.forEach(c => { const g0 = c.gen; c.gen = (d, R) => { const p = g0(d, R); if (p && !p.type && p.ans && typeof p.ans === 'object' && 'n' in p.ans) p.type = 'frac'; if (p && p.traps) { const seen = new Set(); p.traps = p.traps.filter(t => { if (!t || t.v == null) return false; const k = typeof t.v === 'number' ? 'v' + (+t.v.toFixed(9)) : 'f' + reduce(t.v.n, t.v.d).join('/') + (t.v.form || ''); if (seen.has(k)) return false; seen.add(k); return true; }); } return p; }; });
  C.defs(list);
}

defs([
/* =================== Fractions, Decimals & Percents =================== */
{ id: 'f_half', s: 'frac', g: 2, title: 'Half of a number', pre: ['a_doubles'],
  tip: 'Half of a number is the number you double to make it. Big number? Split it: half of 36 is half of 20 (10) plus half of 16 (8) = 18.',
  gen(d, R) {
    if (d === 0) {
      const v = 2 * R.i(2, 10), h = v / 2;
      return { text: 'What is ' + B('half of ' + v) + '?', ans: h,
        how: ['Half of ' + v + ' is the number that doubles to make ' + v + '.', h + ' + ' + h + ' = ' + v + ', so half of ' + v + ' is ' + B(h) + '.'],
        steps: [st('What is ' + B(h + ' + ' + h) + '?', v), st('So half of ' + B(v) + ' is ?', h)],
        traps: [tr(2 * v, 'f_half', 'Half makes a number smaller. You doubled it instead.'), tr(h + 1, 'a_doubles', 'Check by doubling your answer. It should make ' + v + '.'), tr(h - 1, 'a_doubles', 'Check by doubling your answer. It should make ' + v + '.')] };
    }
    if (d === 2 && R.chance(0.3)) {
      const h = R.i(13, 49), v = 2 * h;
      return { text: B('Half') + ' of a number is ' + B(h) + '. What is the number?', ans: v,
        how: ['Half is one of two equal parts. The whole number is two halves.', 'Double ' + h + ': ' + h + ' + ' + h + ' = ' + B(v) + '.'],
        steps: [st('What is ' + B(h + ' + ' + h) + '?', v)],
        traps: [tr(h % 2 ? null : h / 2, 'f_half', 'Half of the number is ' + h + ', so the number is bigger than ' + h + '.'), tr(v - 10, 'a_regroup', 'Check the tens when you double. Did you carry?'), tr(h + 2, 'f_half', 'The whole is two of the halves put together.')] };
    }
    let v;
    if (d === 1) v = R.chance(0.4) ? R.pick([30, 50, 70, 90]) : 20 * R.i(2, 4) + 2 * R.i(1, 4);
    else v = R.chance(0.5) ? 20 * R.i(1, 4) + 10 + 2 * R.i(1, 4) : R.chance(0.5) ? 20 * R.i(5, 19) + 10 + 2 * R.i(0, 4) : R.pick([150, 250, 350, 450, 300, 500, 700]);
    let E = Math.floor(v / 20) * 20, r = v - E; const h = v / 2;
    if (r === 0) {
      const t = v / 10;
      return { text: 'What is ' + B('half of ' + nm(v)) + '?', ans: h,
        how: [nm(v) + ' is ' + t + ' tens. Half of ' + t + ' tens is ' + (t / 2) + ' tens.', (t / 2) + ' tens is ' + B(h) + '.'],
        steps: [st('How many tens are in ' + B(nm(v)) + '?', t), st('Half of ' + B(t) + ' is ?', t / 2), st(B((t / 2) + ' tens') + ' = ?', h)],
        traps: [tr(t / 2, 'n_place', 'That is the number of tens. Turn ' + (t / 2) + ' tens back into a number.'), tr(2 * v, 'f_half', 'Half makes a number smaller. You doubled it instead.')] };
    }
    const tens = Math.floor(v / 10), ones = v % 10, odd = tens % 2 === 1;
    return { text: 'What is ' + B('half of ' + nm(v)) + '?', ans: h,
      how: ['Split ' + nm(v) + ' into ' + nm(E) + ' and ' + r + (E ? ' (' + nm(E) + ' has an even number of tens, so it halves easily).' : '.'), 'Half of ' + nm(E) + ' is ' + nm(E / 2) + '. Half of ' + r + ' is ' + (r / 2) + '.', nm(E / 2) + ' + ' + (r / 2) + ' = ' + B(h) + '.'],
      steps: [st('Half of ' + B(nm(E)) + ' = ?', E / 2), st('Half of ' + B(r) + ' = ?', r / 2), st(B(nm(E / 2) + ' + ' + (r / 2)) + ' = ?', h)],
      traps: [tr(odd ? h - 5 : null, 'f_half', 'Half of an odd number of tens is not a whole number of tens. Split off ' + nm(E) + ' first.'),
        tr(ones ? Math.floor(tens / 2) * 10 + (odd ? 5 : 0) + ones : null, 'f_half', 'Halve the ones too, not just the tens.'),
        tr(2 * v, 'f_half', 'Half makes a number smaller. You doubled it instead.')] };
  } },

{ id: 'f_unit', s: 'frac', g: 3, title: 'One part of a number', pre: ['m_divfam'],
  tip: 'One fourth of 20 means share 20 into 4 equal parts: 20 ÷ 4 = 5. The bottom number tells you what to divide by.',
  gen(d, R) {
    if (d === 2 && R.chance(0.4)) {
      const b = R.i(2, 9), k = R.i(3, 12), tot = b * k;
      return { text: frac(1, b) + ' of a number is ' + B(k) + '. What is the number?', ans: tot,
        how: ['The number is cut into ' + b + ' equal parts, and one part is ' + k + '.', 'All ' + b + ' parts: ' + b + ' × ' + k + ' = ' + B(tot) + '.'],
        steps: [st('How many equal parts make the whole number?', b), st(B(b + ' × ' + k) + ' = ?', tot)],
        traps: [tr(k + b, 'f_unit', 'You need ' + b + ' parts of ' + k + ', so multiply.'), tr(k % b === 0 ? k / b : null, 'f_unit', 'One part is ' + k + '. The whole is bigger than one part.'), slip(b, k)] };
    }
    let b, k, tens = false;
    if (d === 0) { b = R.i(2, 4); k = R.i(2, 6); }
    else if (d === 1) { b = R.i(2, 10); k = R.i(2, 10); }
    else { b = R.i(3, 9); k = R.i(2, 9); tens = true; }
    const tot = b * k * (tens ? 10 : 1), ans = tot / b;
    const how = tens ? [nm(tot) + ' is ' + (b * k) + ' tens. Share the tens into ' + b + ' equal parts.', (b * k) + ' ÷ ' + b + ' = ' + k + ', so each part is ' + k + ' tens = ' + B(ans) + '.']
      : [frac(1, b) + ' of ' + tot + ' means share ' + tot + ' into ' + b + ' equal parts: ' + tot + ' ÷ ' + b + '.', 'Think times: ' + b + ' × ' + k + ' = ' + tot + ', so each part is ' + B(ans) + '.'];
    const steps = tens ? [st('How many tens are in ' + B(nm(tot)) + '?', b * k), st(B((b * k) + ' ÷ ' + b) + ' = ?', k), st(B(k + ' tens') + ' = ?', ans)]
      : [st('What do you divide ' + tot + ' by to find ' + frac(1, b) + ' of it?', b), st(B(b + ' × ? = ' + tot), k)];
    return { text: 'What is ' + frac(1, b) + ' of ' + B(nm(tot)) + '?', ans, howVis: !tens && b * k <= 30 ? groupsSVG(b, k) : '',
      how, steps,
      traps: [tr(tot - b, 'f_unit', 'One part of ' + b + ' equal parts means divide by ' + b + ', not take ' + b + ' away.'), tr(tens ? k : null, 'n_place', 'Each part is ' + k + ' tens. Write that as a number.'),
        slip(b, k, tens ? 10 : 1, 'Check: ' + b + ' × your answer should be ' + nm(tot) + '.')] };
  } },

{ id: 'f_of', s: 'frac', g: 3, title: 'A fraction of a number', pre: [],
  tip: 'To find 3/4 of 20, find one part first: 20 ÷ 4 = 5. Then take 3 parts: 3 × 5 = 15.',
  gen(d, R) {
    let b, a, k;
    if (d === 0) { b = R.i(3, 5); a = R.i(2, b - 1); k = R.i(2, 5); }
    else if (d === 1) { b = R.i(3, 10); a = R.i(2, b - 1); k = R.i(2, 10); }
    else { b = R.i(3, 10); a = R.i(2, b - 1); k = R.chance(0.5) ? R.i(11, 25) : 10 * R.i(2, 6); }
    if (gcd(a, b) > 1) return null;
    const rev = d === 2 && R.chance(0.4);
    if (rev) { b = R.i(3, 8); a = R.i(2, b - 1); k = R.chance(0.6) ? R.i(3, 10) : 10 * R.i(2, 5); if (gcd(a, b) > 1) return null; }
    const tot = b * k, ans = a * k;
    if (rev) {
      return { text: frac(a, b) + ' of a number is ' + B(ans) + '. What is the number?', ans: tot,
        how: [a + ' parts make ' + ans + ', so one part is ' + ans + ' ÷ ' + a + ' = ' + k + '.', 'The whole has ' + b + ' parts: ' + b + ' × ' + k + ' = ' + B(nm(tot)) + '.'],
        steps: [st('One part: ' + B(ans + ' ÷ ' + a) + ' = ?', k), st('All ' + b + ' parts: ' + B(b + ' × ' + k) + ' = ?', tot)],
        traps: [tr(ans * a % b === 0 ? ans * a / b : null, 'f_of', 'That is ' + frac(a, b) + ' of ' + ans + '. Here ' + ans + ' is the part, and you want the whole.'), tr(k, 'f_of', 'That is one part. The whole has ' + b + ' parts.'), tr(ans + k, 'f_of', 'The whole has ' + b + ' parts of ' + k + ', not ' + (a + 1) + '.')] };
    }
    return { text: 'What is ' + frac(a, b) + ' of ' + B(tot) + '?', ans, vis: d === 0 ? fracBarSVG(a, b) : '',
      how: ['Find one part first: ' + frac(1, b) + ' of ' + tot + ' is ' + tot + ' ÷ ' + b + ' = ' + k + '.', 'You want ' + a + ' parts: ' + a + ' × ' + k + ' = ' + B(ans) + '.'],
      steps: [st('What is ' + frac(1, b) + ' of ' + B(tot) + '?', k), st(B(a + ' × ' + k) + ' = ?', ans)],
      traps: [tr(k, 'f_of', 'That is one part. You need ' + a + ' parts.'), tr(tot - ans, 'f_of', 'That is the part that is left, the other ' + (b - a) + ' ' + plural(b - a, 'part') + '.'),
        tr(tot % a === 0 ? tot / a : null, 'f_unit', 'Divide by the bottom number, ' + b + '. It tells how many equal parts.'), slip(a, k)] };
  } },

{ id: 'f_compunit', s: 'frac', g: 3, title: 'Compare unit fractions', pre: [],
  tip: 'More pieces means smaller pieces. 1/3 is bigger than 1/8, because cutting a whole into 8 makes smaller pieces than cutting it into 3.',
  gen(d, R) {
    if (d === 0) {
      const a = R.i(2, 6), b = R.i(a + 1, 10), big = R.chance(0.65), ans = big ? a : b, sw = R.chance(0.5);
      const pair = sw ? frac(1, b) + ' or ' + frac(1, a) : frac(1, a) + ' or ' + frac(1, b);
      return { text: 'Which is ' + B(big ? 'bigger' : 'smaller') + ', ' + pair + '? Type its bottom number.', ans, vis: fracBarSVG(1, a) + fracBarSVG(1, b),
        how: ['The bottom number says how many equal pieces the whole is cut into.', 'Cut into ' + b + ' pieces, each piece is smaller than when it is cut into ' + a + '. So ' + frac(1, ans) + ' is ' + (big ? 'bigger' : 'smaller') + ': ' + B(ans) + '.'],
        steps: [st('A whole cut into ' + B(a) + ' or into ' + B(b) + ' pieces: which number gives the bigger pieces?', a), st('So which is ' + (big ? 'bigger' : 'smaller') + '? Type its bottom number.', ans)],
        traps: [tr(big ? b : a, 'f_compunit', 'More pieces means smaller pieces. A bigger bottom number makes a smaller fraction.')] };
    }
    if (d === 1) {
      const list = R.shuffle([2, 3, 4, 5, 6, 8, 10, 12]).slice(0, R.i(3, 4)), big = R.chance(0.5);
      const lo = Math.min(...list), hi = Math.max(...list), ans = big ? lo : hi;
      return { text: 'Which is the ' + B(big ? 'biggest' : 'smallest') + ': ' + list.map(x => frac(1, x)).join(', ') + '? Type its bottom number.', ans,
        how: ['All the tops are 1, so look at the bottoms. Fewer pieces means bigger pieces.', 'The ' + (big ? 'smallest' : 'biggest') + ' bottom is ' + ans + ', so ' + frac(1, ans) + ' is the ' + (big ? 'biggest' : 'smallest') + ': ' + B(ans) + '.'],
        steps: [st('What is the ' + (big ? 'smallest' : 'biggest') + ' bottom number in the list?', ans)],
        traps: [tr(big ? hi : lo, 'f_compunit', 'More pieces means smaller pieces. A bigger bottom number makes a smaller fraction.')] };
    }
    if (R.chance(0.5)) {
      const a = R.i(2, 6), m = R.i(2, 5), b = a * m;
      return { text: 'How many ' + frac(1, b) + ' pieces are the same size as one ' + frac(1, a) + ' piece?', ans: m, vis: fracBarSVG(1, a) + fracBarSVG(m, b),
        how: ['Cut each ' + frac(1, a) + ' piece into equal smaller pieces until there are ' + b + ' in the whole.', a + ' × ' + m + ' = ' + b + ', so each ' + frac(1, a) + ' is cut into ' + B(m) + ' pieces.'],
        steps: [st(B(a + ' × ? = ' + b), m)],
        traps: [tr(b - a, 'f_compunit', 'Compare by how many times more pieces, not by taking away.'), tr(b, 'f_compunit', 'That is how many ' + frac(1, b) + ' pieces fill the whole. You need just one ' + frac(1, a) + '.')] };
    }
    const k = R.i(4, 20), more = R.chance(0.5), ans = more ? k - 1 : k + 1;
    return { text: 'What is the ' + B(more ? 'biggest' : 'smallest') + ' whole number for the box so that ' + fq('1', '?') + ' is ' + B(more ? 'bigger' : 'smaller') + ' than ' + frac(1, k) + '?', ans,
      how: [more ? 'For a bigger piece, cut the whole into fewer pieces: the bottom must be less than ' + k + '.' : 'For a smaller piece, cut the whole into more pieces: the bottom must be more than ' + k + '.', 'The ' + (more ? 'biggest whole number less' : 'smallest whole number more') + ' than ' + k + ' is ' + B(ans) + '.'],
      steps: [st('To make ' + fq('1', '?') + ' ' + (more ? 'bigger' : 'smaller') + ', should the bottom be less than ' + k + ' or more? Type 1 for less, 2 for more.', more ? 1 : 2), st('So what is the ' + (more ? 'biggest' : 'smallest') + ' whole number that works?', ans)],
      traps: [tr(more ? k + 1 : k - 1, 'f_compunit', 'More pieces means smaller pieces. Which way should the bottom go?'), tr(k, 'f_compunit', frac(1, k) + ' is equal to itself, not ' + (more ? 'bigger' : 'smaller') + '.')] };
  } },

{ id: 'f_equiv', s: 'frac', g: 3, title: 'Equal fractions', pre: [],
  tip: 'Times the top and the bottom by the same number and the fraction stays the same size. 2/3 = 8/12, because both were times 4.',
  gen(d, R) {
    if (d === 2) {
      const b = R.i(2, 6), a = R.i(1, b - 1); if (gcd(a, b) > 1) return null;
      const k1 = R.i(2, 6); let k2 = R.i(1, 7); if (k2 === k1 || k2 % k1 === 0) return null;
      const t1 = a * k1, b1 = b * k1, b2 = b * k2, ans = a * k2;
      return { text: frac(t1, b1) + ' = ' + fq('?', b2), ans,
        how: [b1 + ' does not go into ' + b2 + ', so simplify first: divide the top and bottom of ' + frac(t1, b1) + ' by ' + k1 + ' to get ' + frac(a, b) + '.', k2 === 1 ? 'The bottom is already ' + b2 + ', so the top is ' + B(ans) + '.' : 'Now ' + b + ' × ' + k2 + ' = ' + b2 + ', so the top is ' + a + ' × ' + k2 + ' = ' + B(ans) + '.'],
        steps: [st(frac(t1, b1) + ' in lowest terms has bottom ' + b + '. What is its top?', a)].concat(k2 === 1 ? [] : [st(B(b + ' × ? = ' + b2), k2), st(B(a + ' × ' + k2) + ' = ?', ans)]),
        traps: [tr(t1 + b2 - b1, 'f_equiv', 'Equal fractions come from multiplying or dividing the top and bottom, not adding the same amount.'), tr(t1 * b2 % b1 ? null : t1 * b2 / b1 + 1, 'f_equiv', 'Check: divide the bottom by the top in both fractions; they should match.')] };
    }
    const b = d === 0 ? R.i(2, 5) : R.i(3, 9), a = d === 0 && R.chance(0.5) ? 1 : R.i(1, b - 1), k = d === 0 ? R.i(2, 5) : R.i(2, 8);
    if (gcd(a, b) > 1) return null;
    const T = a * k, Bt = b * k, askBot = d === 1 && R.chance(0.4), ans = askBot ? Bt : T;
    if (askBot) return { text: frac(a, b) + ' = ' + fq(T, '?'), ans,
      how: ['The top went from ' + a + ' to ' + T + ': that is × ' + k + '.', 'Do the same to the bottom: ' + b + ' × ' + k + ' = ' + B(Bt) + '.'],
      steps: [st(B(a + ' × ? = ' + T), k), st(B(b + ' × ' + k) + ' = ?', Bt)],
      traps: [tr(b + T - a, 'f_equiv', 'Equal fractions come from multiplying the top and bottom, not adding.'), tr(k, 'f_equiv', k + ' is the number you multiply by. Now multiply the bottom by it.'), slip(b, k)] };
    return { text: frac(a, b) + ' = ' + fq('?', Bt), ans, vis: d === 0 ? fracBarSVG(a, b) : '', howVis: d === 0 ? fracBarSVG(T, Bt) : '',
      how: ['The bottom went from ' + b + ' to ' + Bt + ': that is × ' + k + '.', 'Do the same to the top: ' + a + ' × ' + k + ' = ' + B(T) + '. Each piece was cut into ' + k + ' smaller pieces.'],
      steps: [st(B(b + ' × ? = ' + Bt), k), st(B(a + ' × ' + k) + ' = ?', T)],
      traps: [tr(a + Bt - b, 'f_equiv', 'Equal fractions come from multiplying the top and bottom, not adding.'), tr(k, 'f_equiv', k + ' is the number you multiply by. Now multiply the top by it.'), a > 1 ? slip(a, k) : null] };
  } },

{ id: 'f_whole', s: 'frac', g: 3, title: 'Fractions that make wholes', pre: [],
  tip: '4 fourths make 1 whole. So 12 fourths make 12 ÷ 4 = 3 wholes, and 5/5 = 1.',
  gen(d, R) {
    const b = d === 0 ? R.i(2, 6) : d === 1 ? R.i(2, 8) : R.i(3, 12), k = d === 0 ? R.i(1, 2) : d === 1 ? R.i(2, 6) : R.i(3, 12), top = b * k;
    const rev = d > 0 && R.chance(d === 1 ? 0.35 : 0.5), story = d === 2 && R.chance(0.4);
    if (story) {
      const t = R.pick([['pizza', 'pizzas', 'slices'], ['pie', 'pies', 'pieces'], ['cake', 'cakes', 'pieces']]);
      if (rev) return { text: 'Each ' + t[0] + ' is cut into ' + B(b) + ' equal ' + t[2] + '. How many ' + t[2] + ' are in ' + B(k + ' ' + t[1]) + '?', ans: top,
        how: ['One ' + t[0] + ' is ' + b + ' ' + t[2] + '.', k + ' ' + t[1] + ': ' + k + ' × ' + b + ' = ' + B(top) + ' ' + t[2] + '.'],
        steps: [st(B(k + ' × ' + b) + ' = ?', top)],
        traps: [tr(k + b, 'f_whole', 'Each ' + t[0] + ' has ' + b + ' ' + t[2] + '. Count ' + b + ' for every ' + t[0] + '.'), slip(k, b)] };
      return { text: 'Each ' + t[0] + ' is cut into ' + B(b) + ' equal ' + t[2] + '. ' + B(top + ' ' + t[2]) + ' make how many whole ' + t[1] + '?', ans: k,
        how: [b + ' ' + t[2] + ' make one whole ' + t[0] + '.', 'How many groups of ' + b + ' are in ' + top + '? ' + top + ' ÷ ' + b + ' = ' + B(k) + '.'],
        steps: [st(B(top + ' ÷ ' + b) + ' = ?', k)],
        traps: [tr(top - b, 'f_whole', 'Divide by ' + b + ' to count the wholes, do not take ' + b + ' away.'), slip(b, k, 1, 'Check: ' + b + ' × your answer should be ' + top + '.')] };
    }
    if (rev) return { text: B(k) + ' = ' + fq('?', b), ans: top,
      how: ['One whole is ' + frac(b, b) + '.', k + ' wholes are ' + k + ' × ' + b + ' = ' + B(top) + ' pieces, so ' + k + ' = ' + frac(top, b) + '.'],
      steps: [st('How many pieces of size ' + frac(1, b) + ' make one whole?', b), st(B(k + ' × ' + b) + ' = ?', top)],
      traps: [tr(k + b, 'f_whole', 'Each whole has ' + b + ' pieces. Multiply, do not add.'), tr(k, 'f_whole', 'The top counts pieces of size ' + frac(1, b) + ', and each whole has ' + b + ' of them.'), slip(k, b)] };
    return { text: frac(top, b) + ' = how many wholes?', ans: k, vis: top <= 24 ? fracBarSVG(top, b) : '',
      how: [b + ' pieces of size ' + frac(1, b) + ' make 1 whole.', top + ' pieces make ' + top + ' ÷ ' + b + ' = ' + B(k) + ' ' + plural(k, 'whole') + '.'],
      steps: [st('How many pieces make one whole?', b), st(B(top + ' ÷ ' + b) + ' = ?', k)],
      traps: [tr(top, 'f_whole', 'The top counts pieces. ' + b + ' pieces make one whole.'), tr(top - b, 'f_whole', 'Divide by ' + b + ', do not take ' + b + ' away.'), k > 1 ? slip(b, k, 1, 'Check: ' + b + ' × your answer should be ' + top + '.') : null] };
  } },

{ id: 'f_compare', s: 'frac', g: 4, title: 'Compare fractions', pre: [],
  tip: 'Same bottom: more pieces is bigger. Same top: fewer cuts make bigger pieces. Neither? Compare each one to 1/2: 3/7 is less than half, 5/9 is more.',
  gen(d, R) {
    const kinds = d === 0 ? ['top', 'bot'] : d === 1 ? ['top', 'bot', 'half', 'half'] : ['half', 'miss', 'least'];
    const kind = R.pick(kinds);
    if (kind === 'top') {
      const b = R.i(3, 12), a1 = R.i(1, b - 1), a2 = R.i(1, b - 1); if (a1 === a2) return null;
      const big = R.chance(0.6), ans = big ? Math.max(a1, a2) : Math.min(a1, a2);
      return { text: 'Which is ' + B(big ? 'bigger' : 'smaller') + ', ' + frac(a1, b) + ' or ' + frac(a2, b) + '? Type its top number.', ans,
        how: ['The bottoms are the same, so the pieces are the same size.', 'More pieces is more: ' + B(ans) + ' pieces of ' + frac(1, b) + ' is ' + (big ? 'more' : 'less') + '.'],
        steps: [st('Both bottoms are ' + b + '. Which top is ' + (big ? 'bigger' : 'smaller') + ', ' + a1 + ' or ' + a2 + '?', ans)],
        traps: [tr(a1 + a2 - ans, 'f_compare', 'Same size pieces, so the fraction with ' + (big ? 'more' : 'fewer') + ' pieces is ' + (big ? 'bigger' : 'smaller') + '.')] };
    }
    if (kind === 'bot') {
      const a = R.i(2, 5), b1 = R.i(a + 1, 12), b2 = R.i(a + 1, 12); if (b1 === b2) return null;
      const big = R.chance(0.6), ans = big ? Math.min(b1, b2) : Math.max(b1, b2);
      return { text: 'Which is ' + B(big ? 'bigger' : 'smaller') + ', ' + frac(a, b1) + ' or ' + frac(a, b2) + '? Type its bottom number.', ans,
        how: ['The tops are the same: ' + a + ' pieces each. Now look at the size of the pieces.', 'Cutting into fewer pieces makes bigger pieces, so ' + frac(a, Math.min(b1, b2)) + ' is bigger. The ' + (big ? 'bigger' : 'smaller') + ' one has bottom ' + B(ans) + '.'],
        steps: [st('Which bottom makes bigger pieces, ' + b1 + ' or ' + b2 + '?', Math.min(b1, b2)), st('So which bottom does the ' + (big ? 'bigger' : 'smaller') + ' fraction have?', ans)],
        traps: [tr(b1 + b2 - ans, 'f_compunit', 'A bigger bottom number means more cuts and smaller pieces.')] };
    }
    if (kind === 'half') {
      const b1 = R.i(3, 12), a1 = R.i(Math.max(1, Math.ceil(b1 / 2) - 3), Math.ceil(b1 / 2) - 1), b2 = R.i(3, 12), a2 = R.i(Math.floor(b2 / 2) + 1, Math.min(b2 - 1, Math.floor(b2 / 2) + 3));
      if (b1 === b2 || a2 >= b2 || a1 < 1 || 2 * a1 >= b1) return null;
      const big = R.chance(0.6), ans = big ? b2 : b1, sw = R.chance(0.5), f1 = frac(a1, b1), f2 = frac(a2, b2);
      return { text: 'Which is ' + B(big ? 'bigger' : 'smaller') + ', ' + (sw ? f2 + ' or ' + f1 : f1 + ' or ' + f2) + '? Type its bottom number.', ans,
        how: ['Compare each one to ' + frac(1, 2) + ': double the top and look at the bottom.', f1 + ': ' + a1 + ' × 2 = ' + (2 * a1) + ', less than ' + b1 + ', so it is less than half. ' + f2 + ': ' + a2 + ' × 2 = ' + (2 * a2) + ', more than ' + b2 + ', so it is more than half.', 'The ' + (big ? 'bigger' : 'smaller') + ' one has bottom ' + B(ans) + '.'],
        steps: [st('Double the top of ' + f1 + ': ' + B(a1 + ' × 2') + ' = ?', 2 * a1), st('Double the top of ' + f2 + ': ' + B(a2 + ' × 2') + ' = ?', 2 * a2), st('Which one is more than half? Type its bottom number.', b2)],
        traps: [tr(big ? b1 : b2, 'f_compare', 'The bottoms are different, so a bigger top does not tell you. Compare each one to half.'), tr(big ? a2 : a1, 'f_compare', 'Type the bottom number of the fraction.')] };
    }
    if (kind === 'miss') {
      const b1 = R.i(3, 12), b2 = R.i(3, 12); if (b1 === b2) return null;
      const big = R.chance(0.6), ans = big ? Math.max(b1, b2) : Math.min(b1, b2), f1 = frac(b1 - 1, b1), f2 = frac(b2 - 1, b2);
      return { text: 'Which is ' + B(big ? 'bigger' : 'smaller') + ', ' + f1 + ' or ' + f2 + '? Type its bottom number.', ans,
        how: ['Each one is one piece short of a whole: ' + f1 + ' is missing ' + frac(1, b1) + ', ' + f2 + ' is missing ' + frac(1, b2) + '.', 'The smaller missing piece leaves more. ' + frac(1, Math.max(b1, b2)) + ' is the smaller piece, so ' + frac(Math.max(b1, b2) - 1, Math.max(b1, b2)) + ' is bigger. Answer: ' + B(ans) + '.'],
        steps: [st('How much is ' + f1 + ' short of a whole? ' + fq(1, '?'), b1), st('Which missing piece is smaller, ' + frac(1, b1) + ' or ' + frac(1, b2) + '? Type its bottom.', Math.max(b1, b2)), st('So the ' + (big ? 'bigger' : 'smaller') + ' fraction has which bottom?', ans)],
        traps: [tr(b1 + b2 - ans, 'f_compunit', 'Look at the missing piece. A bigger bottom means a smaller missing piece, so more is left.')] };
    }
    const b = R.i(5, 25), ans = Math.floor(b / 2) + 1;
    return { text: 'What is the ' + B('smallest') + ' top number that makes ' + fq('?', b) + ' bigger than ' + frac(1, 2) + '?', ans,
      how: ['Half of ' + b + ' pieces is ' + num(b / 2) + ' pieces' + (b % 2 ? '.' : ', and ' + frac(b / 2, b) + ' is exactly half, not bigger.'), 'The smallest whole number more than ' + num(b / 2) + ' is ' + B(ans) + '.'],
      steps: [st('What is half of ' + B(b) + '?', b / 2), st('What is the smallest whole number bigger than that?', ans)],
      traps: [tr(b % 2 ? null : b / 2, 'f_compare', frac(b / 2, b) + ' is exactly one half. You need more than half.'), tr(ans - 1, 'f_half', 'Double your top: it must be more than ' + b + '.'), tr(b - 1, 'f_compare', 'That works, but you want the smallest one.')] };
  } },

{ id: 'f_addlike', s: 'frac', g: 4, title: 'Add with the same bottom', pre: [],
  tip: 'Same bottom? Add or take away the tops and keep the bottom: 2/7 + 3/7 = 5/7. The bottom is the size of the pieces, and that does not change.',
  gen(d, R) {
    if (d === 2) {
      const b = R.i(3, 10);
      if (R.chance(0.4)) {
        const w = R.i(1, 6), a = R.i(1, b - 1), ans = F(w * b - a, b);
        return { text: B(w) + ' ' + MINUS + ' ' + frac(a, b) + ' = ?', ans,
          how: ['Break one whole into ' + b + ' pieces: ' + w + ' = ' + (w - 1 ? (w - 1) + ' and ' : '') + frac(b, b) + '.', 'Take ' + a + ' ' + plural(a, 'piece') + ' from the ' + b + ': ' + b + ' ' + MINUS + ' ' + a + ' = ' + (b - a) + '. The answer is ' + B(w - 1 ? mixed(w - 1, b - a, b) : frac(b - a, b)) + '.'],
          steps: [st('One whole = ' + fq('?', b), b), st(B(b + ' ' + MINUS + ' ' + a) + ' = ?', b - a), sf(B(w) + ' ' + MINUS + ' ' + frac(a, b) + ' = ?', w * b - a, b)],
          traps: [tr(F((w - 1) * b + a, b), 'f_addlike', 'Take the ' + a + ' ' + plural(a, 'piece') + ' away from ' + frac(b, b) + '. What is left?'), tr(w > a ? F((w - a) * b, b) : null, 'f_whole', 'You took away ' + a + ' ' + plural(a, 'whole') + '. ' + frac(a, b) + ' is only ' + a + ' small ' + plural(a, 'piece') + '.'), tr(F(w * b - a, 2 * b), 'f_addlike', 'Keep the bottom: the pieces are still ' + frac(1, b) + ' size.')] };
      }
      const w1 = R.i(1, 6), w2 = R.i(1, 5), a1 = R.i(1, b - 1), a2 = R.i(1, b - 1); if (a1 + a2 <= b) return null;
      const W = w1 + w2, s = a1 + a2, ans = F((W + 1) * b + s - b, b);
      return { text: mixed(w1, a1, b) + ' + ' + mixed(w2, a2, b) + ' = ?', ans,
        how: ['Add the wholes: ' + w1 + ' + ' + w2 + ' = ' + W + '. Add the pieces: ' + frac(a1, b) + ' + ' + frac(a2, b) + ' = ' + frac(s, b) + '.', frac(s, b) + ' is more than a whole: ' + frac(s, b) + ' = 1 and ' + frac(s - b, b) + '.', W + ' + 1 and ' + frac(s - b, b) + ' = ' + B(mixed(W + 1, s - b, b)) + '.'],
        steps: [st('Wholes: ' + B(w1 + ' + ' + w2) + ' = ?', W), st('Tops: ' + B(a1 + ' + ' + a2) + ' = ?', s), st(frac(s, b) + ' = 1 and ' + fq('?', b), s - b), sf('So the total is ?', ans.n, b)],
          traps: [tr(F(W * b + s - b, b), 'f_mixed', frac(s, b) + ' is more than one whole. Add that whole to the ' + W + '.'), tr(F(W * 2 * b + s, 2 * b), 'f_addlike', 'Keep the bottom: the pieces are still ' + frac(1, b) + ' size.')] };
    }
    const b = d === 0 ? R.i(3, 10) : R.i(4, 12), sub = d === 1 && R.chance(0.5);
    let a1 = R.i(1, b - 1), a2 = R.i(1, b - 1);
    if (sub) { if (a1 <= a2) return null; } else if (d === 0 ? a1 + a2 >= b : a1 + a2 < b - 1 && R.chance(0.5)) return null;
    const s = sub ? a1 - a2 : a1 + a2, op = sub ? ' ' + MINUS + ' ' : ' + ', ans = F(s, b);
    const over = s > b ? ' ' + frac(s, b) + ' is more than a whole: 1 and ' + frac(s - b, b) + '.' : s === b ? ' ' + frac(b, b) + ' is 1 whole.' : '';
    return { text: frac(a1, b) + op + frac(a2, b) + ' = ?', ans, vis: d === 0 ? fracBarSVG(a1, b) + fracBarSVG(a2, b) : '',
      how: ['The bottom says the size of the pieces. Both are ' + frac(1, b) + ' pieces, so the bottom stays ' + b + '.', (sub ? 'Take away the tops: ' : 'Add the tops: ') + a1 + op + a2 + ' = ' + s + ', so the answer is ' + B(frac(s, b)) + '.' + over],
      steps: [st((sub ? 'Take away the tops: ' : 'Add the tops: ') + B(a1 + op + a2) + ' = ?', s), sf('So ' + frac(a1, b) + op + frac(a2, b) + ' = ?', s, b)],
      traps: [tr(sub ? null : F(s, 2 * b), 'f_addlike', 'The pieces are still ' + frac(1, b) + ' size, so keep the bottom ' + b + '. Add only the tops.'), tr(sub ? F(s, 1) : null, 'f_addlike', 'Keep the bottom ' + b + '. Take away only the tops.'),
        tr(F(sub ? a1 + a2 : Math.abs(a1 - a2), b), 'f_addlike', sub ? 'This one is take away.' : 'This one is adding.')] };
  } },

{ id: 'f_mixed', s: 'frac', g: 4, title: 'Mixed numbers', pre: [],
  tip: '2 1/4 is 2 wholes and 1 fourth. Each whole is 4 fourths, so 2 1/4 = 8 + 1 = 9 fourths = 9/4. Going back: 9 ÷ 4 = 2 r 1, so 9/4 = 2 1/4.',
  gen(d, R) {
    const b = d === 0 ? R.i(2, 5) : d === 1 ? R.i(2, 9) : R.i(3, 12), w = d === 0 ? R.i(1, 3) : d === 1 ? R.i(1, 6) : R.i(3, 12), a = R.i(1, b - 1), T = w * b + a;
    const kind = R.pick(d === 0 ? ['imp', 'imp', 'part'] : ['imp', 'whole', 'part']);
    if (kind === 'imp') {
      const story = d === 2 && R.chance(0.4), nameB = ['', '', 'halves', 'thirds', 'fourths', 'fifths', 'sixths', 'sevenths', 'eighths', 'ninths', 'tenths', 'elevenths', 'twelfths'][b];
      return { text: story ? 'How many ' + B(nameB) + ' are in ' + mixed(w, a, b) + '?' : mixed(w, a, b) + ' = ' + fq('?', b), ans: T,
        how: ['Each whole is ' + frac(b, b) + ', so ' + w + ' ' + plural(w, 'whole') + ' = ' + w + ' × ' + b + ' = ' + (w * b) + ' ' + nameB + '.', 'Add the ' + a + ' more: ' + (w * b) + ' + ' + a + ' = ' + B(T) + '. So ' + mixed(w, a, b) + ' = ' + frac(T, b) + '.'],
        steps: [st(B(w + ' × ' + b) + ' = ?', w * b), st(B((w * b) + ' + ' + a) + ' = ?', T)],
        traps: [tr(w * b, 'f_mixed', 'That counts the wholes. Add the ' + a + ' extra ' + plural(a, 'piece') + '.'), tr(w + a, 'f_mixed', 'Each whole is ' + b + ' pieces. Multiply the whole number by the bottom.'), tr(w * a + b, 'f_mixed', 'Multiply the whole number by the bottom, then add the top.'), slip(w, b, 1, 'Check ' + w + ' × ' + b + '.')] };
    }
    if (kind === 'whole') return { text: frac(T, b) + ' is how many ' + B('whole') + ' ones, with some pieces left over?', ans: w,
      how: ['How many groups of ' + b + ' fit in ' + T + '? ' + b + ' × ' + w + ' = ' + (w * b) + ', and ' + b + ' × ' + (w + 1) + ' = ' + ((w + 1) * b) + ' is too many.', 'So ' + frac(T, b) + ' = ' + mixed(w, a, b) + ': ' + B(w) + ' wholes.'],
      steps: [st('Biggest ' + b + 's fact that fits: ' + B(b + ' × ? ≤ ' + T), w)],
      traps: [tr(w + 1, 'm_remain', b + ' × ' + (w + 1) + ' = ' + ((w + 1) * b) + ', which is more than ' + T + '.'), tr(T - b, 'f_mixed', 'Count how many groups of ' + b + ' fit in ' + T + '. Divide, do not take away.'), tr(a, 'f_mixed', 'That is how many pieces are left over. How many wholes?')] };
    return { text: frac(T, b) + ' = ' + w + fq('?', b), ans: a,
      how: [w + ' wholes are ' + w + ' × ' + b + ' = ' + (w * b) + ' pieces.', T + ' ' + MINUS + ' ' + (w * b) + ' = ' + B(a) + ' ' + plural(a, 'piece') + ' left, so ' + frac(T, b) + ' = ' + mixed(w, a, b) + '.'],
      steps: [st(B(w + ' × ' + b) + ' = ?', w * b), st(B(T + ' ' + MINUS + ' ' + (w * b)) + ' = ?', a)],
      traps: [tr(a + b, 'm_remain', 'The leftover must be less than ' + b + '. Another whole fits.'), tr(T - w, 'f_mixed', 'Each whole uses ' + b + ' pieces, not 1.'), tr(T - b, 'f_mixed', w + ' wholes use ' + w + ' × ' + b + ' pieces.')] };
  } },

{ id: 'f_xwhole', s: 'frac', g: 4, title: 'A fraction times a whole number', pre: [],
  tip: '3 × 2/5 is 3 groups of 2/5: 6/5. Times the top only; the bottom is the piece size. If the whole number divides by the bottom, divide first: 3/4 × 8 = 3 × 2 = 6.',
  gen(d, R) {
    if (d === 2 && R.chance(0.6)) {
      const b = R.i(2, 10), a = R.i(1, b - 1), k = R.i(2, 9), w = b * k, ans = a * k; if (gcd(a, b) > 1) return null;
      return { text: frac(a, b) + ' × ' + B(w) + ' = ?', ans,
        how: [frac(a, b) + ' × ' + w + ' is the same as ' + frac(a, b) + ' of ' + w + '. ' + w + ' divides by ' + b + ', so divide first: ' + w + ' ÷ ' + b + ' = ' + k + '.', 'Then times the top: ' + a + ' × ' + k + ' = ' + B(ans) + '.'],
        steps: [st(B(w + ' ÷ ' + b) + ' = ?', k), st(B(a + ' × ' + k) + ' = ?', ans)],
        traps: [tr(a * w, 'f_xwhole', 'That is ' + frac(a * w, b) + '. Now divide by the bottom, ' + b + '.'), tr(a > 1 ? k : null, 'f_of', 'That is ' + frac(1, b) + ' of ' + w + '. You need ' + a + ' of those parts.'), a > 1 ? slip(a, k) : null] };
    }
    const b = d === 0 ? R.i(3, 8) : R.i(3, 12), a = d === 0 ? R.i(1, 3) : R.i(1, b - 1), w = d === 0 ? R.i(2, 5) : R.i(2, 9); if (a >= b || gcd(a, b) > 1) return null;
    const top = w * a;
    if (d === 0) return { text: B(w) + ' × ' + frac(a, b) + ' = ' + fq('?', b), ans: top,
      how: [w + ' × ' + frac(a, b) + ' is ' + w + ' groups of ' + frac(a, b) + ': ' + Array(w).fill(frac(a, b)).join(' + ') + '.', 'The pieces stay ' + frac(1, b) + ' size. Times the top: ' + w + ' × ' + a + ' = ' + B(top) + '.'],
      steps: [st(B(w + ' × ' + a) + ' = ?', top)],
      traps: [tr(w + a, 'f_xwhole', w + ' groups of ' + a + ' pieces: multiply, do not add.'), tr(w * b, 'f_xwhole', 'Times the top only. The bottom is the size of the pieces.'), a > 1 ? slip(w, a) : null] };
    const ans = F(top, b), over = top > b ? ' That is ' + (top % b ? mixed(Math.floor(top / b), top % b, b) : num(top / b)) + '.' : '';
    return { text: B(w) + ' × ' + frac(a, b) + ' = ?', ans,
      how: [w + ' × ' + frac(a, b) + ' is ' + w + ' groups of ' + a + ' pieces of size ' + frac(1, b) + '.', 'Times the top only: ' + w + ' × ' + a + ' = ' + top + ', so ' + B(frac(top, b)) + '.' + over],
      steps: [st(B(w + ' × ' + a) + ' = ?', top), sf('So ' + w + ' × ' + frac(a, b) + ' = ?', top, b)],
      traps: [tr(F(top, w * b), 'f_xwhole', 'Times the top only. The pieces are still ' + frac(1, b) + ' size.'), tr(F(w + a, b), 'f_xwhole', w + ' groups of ' + a + ' pieces: multiply, do not add.'), a > 1 ? tr(F(slip(w, a).v, b), factC(w, a), 'Check ' + w + ' × ' + a + '.') : null] };
  } },

{ id: 'f_dec10', s: 'frac', g: 4, title: 'Tenths and hundredths', pre: [],
  tip: 'The first place after the point is tenths, the second is hundredths. 0.7 = 7/10, 0.25 = 25/100, and 0.6 = 6/10 = 60/100.',
  gen(d, R) {
    const kind = R.pick(d === 0 ? ['t2d', 'd2t'] : d === 1 ? ['h2d', 'd2h', 't2h', 'h2d'] : ['sum', 'whole', 'wt']);
    if (kind === 't2d') { const a = R.i(1, 9), ans = dv(a, 1);
      return { text: 'Write ' + frac(a, 10) + ' as a decimal.', ans, vis: fracBarSVG(a, 10),
        how: ['Tenths go in the first place after the point.', a + ' tenths = ' + B(num(ans)) + '.'],
        steps: [st('Which place after the point is tenths: the 1st or the 2nd?', 1), st(frac(a, 10) + ' as a decimal = ?', ans)],
        traps: [tr(dv(a, 2), 'f_dec10', 'Tenths go right after the point. Two places is hundredths.'), tr(a, 'f_dec10', 'Put a point in: ' + a + ' tenths is less than 1.')] }; }
    if (kind === 'd2t') { const a = R.i(1, 9);
      return { text: B('0.' + a) + ' = ' + fq('?', 10), ans: a,
        how: ['The first place after the point is tenths.', '0.' + a + ' is ' + B(a) + ' tenths, so 0.' + a + ' = ' + frac(a, 10) + '.'],
        steps: [st('How many tenths is ' + B('0.' + a) + '?', a)],
        traps: [tr(a * 10, 'f_dec10', 'That would be hundredths. The bottom here is 10.')] }; }
    if (kind === 'h2d') { const h = R.chance(0.3) ? R.i(1, 9) : R.i(11, 99); if (h % 10 === 0) return null; const ans = dv(h, 2);
      return { text: 'Write ' + frac(h, 100) + ' as a decimal.', ans,
        how: ['Hundredths fill two places after the point.', h < 10 ? h + ' hundredths is 0 tenths and ' + h + ' hundredths: ' + B(num(ans)) + '.' : h + ' hundredths = ' + B(num(ans)) + '.'],
        steps: [st('How many places after the point do hundredths need?', 2), st(frac(h, 100) + ' as a decimal = ?', ans)],
        traps: [tr(h < 10 ? dv(h, 1) : null, 'f_dec10', 'That is ' + h + ' tenths. Hundredths need two places: put a 0 first.'), tr(h >= 10 ? dv(h, 1) : null, 'f_dec10', 'Hundredths fill two places after the point.'), tr(h, 'f_dec10', 'Put a point in: ' + h + ' hundredths is less than 1.')] }; }
    if (kind === 'd2h') { const h = R.i(11, 99); if (h % 10 === 0) return null;
      return { text: B(num(dv(h, 2))) + ' = ' + fq('?', 100), ans: h,
        how: ['Two places after the point are hundredths.', num(dv(h, 2)) + ' is ' + B(h) + ' hundredths, so ' + num(dv(h, 2)) + ' = ' + frac(h, 100) + '.'],
        steps: [st('How many tenths in ' + B(num(dv(h, 2))) + '?', Math.floor(h / 10)), st('Each tenth is 10 hundredths. ' + B(Math.floor(h / 10) + ' tenths and ' + (h % 10) + ' hundredths') + ' = ? hundredths', h)],
        traps: [tr(Math.floor(h / 10), 'f_dec10', 'That is the tenths. Count all the hundredths.'), tr(h % 10, 'n_place', 'That is just the last digit. Count all the hundredths.')] }; }
    if (kind === 't2h') { const a = R.i(1, 9);
      return { text: B('0.' + a) + ' = ' + fq('?', 100), ans: 10 * a, vis: fracBarSVG(a, 10),
        how: ['0.' + a + ' is ' + a + ' tenths. Each tenth is 10 hundredths.', a + ' × 10 = ' + B(10 * a) + ', so 0.' + a + ' = ' + frac(a, 10) + ' = ' + frac(10 * a, 100) + '.'],
        steps: [st('How many tenths is ' + B('0.' + a) + '?', a), st('Each tenth is 10 hundredths. ' + B(a + ' × 10') + ' = ?', 10 * a)],
        traps: [tr(a, 'f_dec10', '0.' + a + ' is ' + a + ' tenths. The bottom here is 100, so change tenths to hundredths.'), tr(a * 100, 'f_dec10', 'Each tenth is 10 hundredths, not 100.')] }; }
    if (kind === 'sum') { const a = R.i(1, 8), h = R.i(1, 99 - 10 * a); if (h % 10 === 0) return null; const tot = 10 * a + h, ans = dv(tot, 2);
      return { text: 'Write ' + frac(a, 10) + ' + ' + frac(h, 100) + ' as a decimal.', ans,
        how: ['Make the bottoms match: ' + frac(a, 10) + ' = ' + frac(10 * a, 100) + '.', (10 * a) + ' + ' + h + ' = ' + tot + ' hundredths = ' + B(num(ans)) + '.'],
        steps: [st(frac(a, 10) + ' = ' + fq('?', 100), 10 * a), st(B((10 * a) + ' + ' + h) + ' = ?', tot), st(B(tot + ' hundredths') + ' as a decimal = ?', ans)],
        traps: [tr(dv(a + h, 2), 'f_equiv', frac(a, 10) + ' is ' + (10 * a) + ' hundredths. Change it before you add.'), tr(h >= 10 ? dv(100 * a + h, 3) : null, 'f_dec10', 'Do not just write the digits side by side. Change tenths to hundredths and add.')] }; }
    if (kind === 'whole') { const w = R.i(1, 12), h = R.i(1, 9), ans = w + dv(h, 2);
      return { text: 'Write ' + B(w) + ' and ' + frac(h, 100) + ' as a decimal.', ans,
        how: ['The whole number goes before the point. Hundredths need two places after it.', h + ' hundredths is 0 tenths and ' + h + ' hundredths: ' + B(num(ans)) + '.'],
        steps: [st('How many tenths are in ' + frac(h, 100) + '?', 0), st('So ' + w + ' and ' + frac(h, 100) + ' = ?', ans)],
        traps: [tr(w + dv(h, 1), 'f_dec10', 'That is ' + w + ' and ' + h + ' tenths. Hundredths need two places: put a 0 in the tenths.'), tr(w * 100 + h, 'f_dec10', 'Put the point after the whole number.')] }; }
    const w = R.i(1, 9), a = R.i(1, 9), T = 10 * w + a;
    return { text: B(num(w + dv(a, 1))) + ' = ' + fq('?', 10), ans: T,
      how: ['Each whole is 10 tenths, so ' + w + ' wholes = ' + (10 * w) + ' tenths.', (10 * w) + ' + ' + a + ' = ' + B(T) + ' tenths.'],
      steps: [st(B(w) + ' wholes = ? tenths', 10 * w), st(B((10 * w) + ' + ' + a) + ' = ?', T)],
      traps: [tr(a, 'f_dec10', 'Count the wholes as tenths too.'), tr(w + a, 'f_whole', 'Each whole is 10 tenths.')] };
  } },

{ id: 'f_simplify', s: 'frac', g: 5, title: 'Lowest terms', pre: ['fa_factors'],
  tip: 'Divide the top and bottom by the biggest number that goes into both. 12/18: 6 goes into both, so 12/18 = 2/3. Not sure? Divide by 2, 3 or 5 again and again.',
  gen(d, R) {
    const b = d === 0 ? R.i(2, 6) : R.i(2, 12), a = R.i(1, b - 1), k = d === 0 ? R.pick([2, 3, 4, 5]) : d === 1 ? R.i(2, 12) : R.pick([6, 8, 9, 10, 12, 14, 15, 16, 18]);
    if (gcd(a, b) > 1) return null;
    const T = a * k, Bt = b * k, f = factorize(k), primes = Object.keys(f).map(Number).sort((x, y) => x - y), p0 = primes[0];
    const chain = []; let t = T, bb = Bt; primes.forEach(p => { for (let i = 0; i < f[p]; i++) { t /= p; bb /= p; chain.push('÷ ' + p + ' → ' + frac(t, bb)); } });
    const how = ['The biggest number that goes into both ' + T + ' and ' + Bt + ' is ' + k + '.', T + ' ÷ ' + k + ' = ' + a + ' and ' + Bt + ' ÷ ' + k + ' = ' + b + ', so ' + frac(T, Bt) + ' = ' + B(frac(a, b)) + '.'];
    if (chain.length > 1) how.push('Or go in small steps: ' + frac(T, Bt) + ' ' + chain.join(' ') + '.');
    return { text: 'Write ' + frac(T, Bt) + ' in lowest terms.', ans: F(a, b), type: 'frac', low: true,
      how, steps: [st('What is the biggest number that goes into both ' + B(T) + ' and ' + B(Bt) + '?', k), st(B(T + ' ÷ ' + k) + ' = ?', a), st(B(Bt + ' ÷ ' + k) + ' = ?', b)],
      traps: [tr(k !== p0 ? FL(T / p0, Bt / p0) : null, 'f_simplify', 'Good start. ' + (T / p0) + ' and ' + (Bt / p0) + ' can still both be divided by ' + (k / p0) + '.'), tr(F(a, Bt), 'f_equiv', 'Divide the top and the bottom by the same number.'), tr(F(T - (Bt - b) > 0 ? T - (Bt - b) : 0, b), 'f_equiv', 'Divide to simplify. Taking the same amount away changes the size.')].filter(x => !x || !x.v || x.v.n > 0) };
  } },

{ id: 'f_addunlike', s: 'frac', g: 5, title: 'Add with different bottoms', pre: ['fa_multiples'], paper: true,
  tip: 'Different bottoms are different size pieces. Change both to a common bottom first: 1/3 + 1/4 = 4/12 + 3/12 = 7/12. Never add the bottoms.',
  gen(d, R) {
    let b1, b2;
    if (d === 0) { b1 = R.i(2, 5); b2 = b1 * R.i(2, 4); if (R.chance(0.5)) [b1, b2] = [b2, b1]; }
    else if (d === 1) { b1 = R.i(2, 7); b2 = R.i(2, 7); if (gcd(b1, b2) > 1) return null; }
    else { [b1, b2] = R.shuffle(R.pick([[4, 6], [6, 8], [6, 9], [8, 12], [4, 10], [9, 12], [6, 10], [10, 12], [6, 15], [12, 16]])); }
    const a1 = R.i(1, b1 - 1), a2 = R.i(1, b2 - 1); if (gcd(a1, b1) > 1 || gcd(a2, b2) > 1) return null;
    const L = lcm(b1, b2), x = a1 * L / b1, y = a2 * L / b2, sub = d > 0 && R.chance(0.45);
    if (sub && x <= y) return null;
    const s = sub ? x - y : x + y, op = sub ? ' ' + MINUS + ' ' : ' + ', [rn, rd] = reduce(s, L);
    const first = b1 === L ? b2 + ' goes into ' + b1 + ', so use ' + L + ' as the common bottom.' : b2 === L ? b1 + ' goes into ' + b2 + ', so use ' + L + ' as the common bottom.' : 'Count by ' + Math.max(b1, b2) + 's until ' + Math.min(b1, b2) + ' goes in too: the common bottom is ' + L + '.';
    const conv = [b1 === L ? '' : frac(a1, b1) + ' = ' + frac(x, L), b2 === L ? '' : frac(a2, b2) + ' = ' + frac(y, L)].filter(Boolean).join(' and ');
    const steps = [st('What is the smallest common bottom for ' + B(b1) + ' and ' + B(b2) + '?', L)];
    if (b1 !== L) steps.push(st(frac(a1, b1) + ' = ' + fq('?', L), x));
    if (b2 !== L) steps.push(st(frac(a2, b2) + ' = ' + fq('?', L), y));
    steps.push(sf(frac(x, L) + op + frac(y, L) + ' = ?', s, L));
    return { text: frac(a1, b1) + op + frac(a2, b2) + ' = ?', ans: F(rn, rd),
      how: ['The bottoms are different, so the pieces are different sizes. ' + first, conv + '.', (sub ? 'Take away the tops: ' : 'Add the tops: ') + x + op + y + ' = ' + s + ', so the answer is ' + B(frac(s, L)) + (rd !== L ? ' = ' + frac(rn, rd) : '') + '.'],
      steps,
      traps: [tr(sub ? (a1 > a2 && b1 !== b2 ? F(a1 - a2, Math.abs(b1 - b2)) : null) : F(a1 + a2, b1 + b2), 'f_addunlike', 'Never ' + (sub ? 'take away' : 'add') + ' the bottoms. Make them the same, then ' + (sub ? 'take away' : 'add') + ' only the tops.'),
        tr(sub ? (a1 > a2 ? F(a1 - a2, L) : null) : F(a1 + a2, L), 'f_equiv', 'When the bottom changes, the top must be multiplied by the same number.'),
        tr(F(sub ? x + y : Math.abs(x - y), L), 'f_addunlike', sub ? 'This one is take away.' : 'This one is adding.')] };
  } },

{ id: 'f_decadd', s: 'frac', g: 5, title: 'Add and take away decimals', pre: [], paper: true,
  tip: 'Line up the points, or count in the smallest place: 3.4 + 2.75 is 340 + 275 hundredths = 615 hundredths = 6.15.',
  gen(d, R) {
    let p1, p2, k1, k2, sub;
    if (d === 0) { p1 = p2 = 1; k1 = R.i(11, 89); k2 = R.i(5, 69); sub = R.chance(0.4); }
    else if (d === 1) { const pat = R.pick([[1, 2], [2, 1], [0, 2], [2, 2], [1, 2]]); [p1, p2] = pat; k1 = p1 === 0 ? R.i(3, 15) : p1 === 1 ? R.i(12, 95) : R.i(105, 950); k2 = p2 === 1 ? R.i(5, 90) : R.i(15, 480); sub = p1 === 0 ? true : R.chance(0.4); }
    else { const pat = R.pick([[1, 2], [0, 2], [2, 1], [2, 2]]); [p1, p2] = pat; k1 = p1 === 0 ? R.pick([10, 20, 5, 12, 15, 30]) : p1 === 1 ? R.i(105, 499) : R.i(1005, 4999); k2 = p2 === 1 ? R.i(12, 99) : R.i(105, 999); sub = p1 === 0 ? true : R.chance(0.6); }
    if (k1 % 10 === 0 && p1 > 0) return null; if (k2 % 10 === 0) return null;
    const u = Math.max(p1, p2), sc = P10[u], H1 = k1 * P10[u - p1], H2 = k2 * P10[u - p2];
    if (sub && H1 <= H2) return null;
    const H = sub ? H1 - H2 : H1 + H2, ans = dv(H, u), v1 = dv(k1, p1), v2 = dv(k2, p2), op = sub ? ' ' + MINUS + ' ' : ' + ', un = u === 1 ? 'tenths' : 'hundredths';
    const pad = v => v.toFixed(u);
    const lineUp = p1 !== p2 ? 'Write one under the other with the points lined up: ' + [p1 < u ? num(v1) + ' is ' + pad(v1) : '', p2 < u ? num(v2) + ' is ' + pad(v2) : ''].filter(Boolean).join(', ') + '.' : 'Write one under the other with the points lined up (both have ' + u + ' ' + plural(u, 'place') + ' after the point).';
    const lowDigit = v => v % 10, carry = !sub && lowDigit(H1) + lowDigit(H2) >= 10, borrow = sub && lowDigit(H1) < lowDigit(H2);
    return { text: B(num(v1) + op + num(v2)) + ' = ?', ans, vis: C.stackHTML([pad(v1), pad(v2)], sub ? MINUS : '+'),
      how: [lineUp + (p1 !== p2 ? ' Fill the empty places with 0.' : ''), (sub ? 'Take away' : 'Add') + ' column by column from the right, just like whole numbers: ' + nm(H1) + op + nm(H2) + ' = ' + nm(H) + ' (' + un + ').', 'Bring the point straight down: ' + B(num(ans)) + '.'],
      steps: [st(B(num(v1)) + ' = ? ' + un, H1), st(B(num(v2)) + ' = ? ' + un, H2), st(B(nm(H1) + op + nm(H2)) + ' = ?', H), st(B(nm(H) + ' ' + un) + ' = ?', ans)],
      traps: [tr(p1 !== p2 && p1 > 0 && p2 > 0 ? (sub ? (k1 > k2 ? dv(k1 - k2, u) : null) : dv(k1 + k2, u)) : null, 'f_decadd', 'Line up the points, not the last digits. Write ' + (p1 < u ? num(v1) + ' as ' + pad(v1) : num(v2) + ' as ' + pad(v2)) + '.'),
        tr(p1 === 0 ? dv(H1 - H2 + 2 * (H2 % sc), u) : null, 'f_decadd', num(v1) + ' is ' + pad(v1) + '. Take away the part after the point too.'),
        tr(carry ? dv(H - 10, u) : null, 'a_regroup', 'Ten of the smallest place make one of the next place. Did you carry?'),
        tr(borrow ? dv(H + 10, u) : null, 'a_borrow', 'Check where you traded: the digit you borrowed from gets one smaller.'),
        tr(H, 'f_decadd', 'That is ' + nm(H) + ' ' + un + '. Put the point back.')] };
  } },

{ id: 'f_mult', s: 'frac', g: 5, title: 'A fraction times a fraction', pre: [], paper: true,
  tip: 'Times the tops and times the bottoms, but cancel first: in 4/9 × 3/8, 4 and 8 share 4, and 3 and 9 share 3, so it becomes 1/3 × 1/2 = 1/6.',
  gen(d, R) {
    let a, b, c, dd, ok = false;
    for (let t = 0; t < 60 && !ok; t++) {
      const G1 = d >= 1 ? R.i(2, d === 1 ? 5 : 6) : 1, G2 = d === 2 ? R.i(2, 6) : 1, sw = R.chance(0.5);
      const a1 = R.i(1, 5), d1 = R.i(1, 7), c1 = R.i(1, 5), b1 = R.i(1, 7);
      a = a1 * G1; dd = d1 * G1; c = c1 * G2; b = b1 * G2;
      if (sw) [a, b, c, dd] = [c, dd, a, b];
      ok = a < b && c < dd && gcd(a, b) === 1 && gcd(c, dd) === 1 && b <= 30 && dd <= 30 && ((gcd(a, dd) > 1) + (gcd(c, b) > 1)) === d;
    }
    if (!ok) return null;
    const n1 = d;
    const m = cancelMul(a, b, c, dd);
    return { text: frac(a, b) + ' × ' + frac(c, dd) + ' = ?<br>Write the answer in lowest terms.', ans: F(m.N, m.D), low: true,
      how: m.lines, steps: m.steps,
      traps: [tr(n1 ? FL(a * c, b * dd) : null, 'f_simplify', 'Right size, but not in lowest terms. Cancel first next time, and the numbers stay small.'),
        tr(F(a * dd, b * c), 'f_mult', 'You turned the second fraction over. That is for dividing. To multiply, just times the tops and the bottoms.'),
        tr(F(a * c, b + dd), 'f_mult', 'Times the bottoms too, do not add them.'), tr(F(a + c, b + dd), 'f_addunlike', 'This is times, not plus. Multiply the tops and the bottoms.')] };
  } },

{ id: 'f_decx10', s: 'frac', g: 5, title: 'Decimals times and divided by 10', pre: ['n_times10'],
  tip: '× 10 makes every digit worth 10 times more, so the point hops 1 place right: 3.45 × 10 = 34.5. × 100 hops 2 places, ÷ 10 hops 1 place left.',
  gen(d, R) {
    const e = d === 0 ? 1 : d === 1 ? R.pick([1, 2, 2]) : R.pick([2, 3, 3]), times = R.chance(0.5);
    let p = d === 0 ? R.i(0, 1) : R.i(0, 2), k = R.i(d === 0 ? 2 : 3, d === 2 ? 9999 : 999);
    if (p > 0 && k % 10 === 0) return null; if (p === 0 && !times && k % 10 === 0) return null;
    if (times && d === 0 && p === 0) p = 1;
    const v = dv(k, p), ans = times ? (p >= e ? dv(k, p - e) : k * P10[e - p]) : dv(k, p + e), opS = (times ? ' × ' : ' ÷ ') + nm(P10[e]);
    const rev = d === 2 && R.chance(0.35);
    const dir = times ? 'right' : 'left', bigger = times ? 'bigger' : 'smaller';
    const fill = times && p < e ? ' Fill the empty ' + plural(e - p, 'place') + ' with ' + plural(e - p, 'a zero', 'zeros') + '.' : !times && p + e > String(k).length - 0 && String(k).length <= p + e ? ' Put a 0 in front of the point.' : '';
    const hopWhy = nm(P10[e]) + ' has ' + e + ' ' + plural(e, 'zero') + ', so the point hops ' + e + ' ' + plural(e, 'place') + '.';
    const hop = (x, ee, t) => t ? (p >= ee ? dv(k, p - ee) : k * P10[ee - p]) : dv(k, p + ee);
    if (rev) {
      /* ? × 100 = v  means  ? = v ÷ 100 */
      return { text: B('?' + opS + ' = ' + num(v)), ans: hop(v, e, !times),
        how: ['Undo it: the missing number is ' + num(v) + (times ? ' ÷ ' : ' × ') + nm(P10[e]) + '.', nm(P10[e]) + ' has ' + e + ' zeros, so the point hops ' + e + ' places ' + (times ? 'left' : 'right') + ': ' + B(num(hop(v, e, !times))) + '.'],
        steps: [st('Should the missing number be bigger or smaller than ' + num(v) + '? Type 1 for bigger, 2 for smaller.', times ? 2 : 1), st('How many places does the point hop?', e), st('So ? = ', hop(v, e, !times))],
        traps: [tr(hop(v, e, times), 'n_times10', 'Undo it: ' + (times ? 'times' : 'divided') + ' by ' + nm(P10[e]) + ' is undone by ' + (times ? 'dividing' : 'multiplying') + '.'), tr(hop(v, e - 1, !times), 'f_decx10', hopWhy), tr(hop(v, e + 1, !times), 'f_decx10', hopWhy)] };
    }
    return { text: B(num(v) + opS) + ' = ?', ans,
      how: [opS.trim() + ' makes every digit ' + nm(P10[e]) + ' times ' + bigger + ', so each digit moves ' + e + ' ' + plural(e, 'place') + (times ? ' left' : ' right') + '. That is the same as the point hopping ' + e + ' ' + plural(e, 'place') + ' ' + dir + '.', num(v) + ' → ' + B(num(ans)) + '.' + fill],
      steps: [st('How many zeros does ' + B(nm(P10[e])) + ' have?', e), st('Does the point hop right or left? Type 1 for right, 2 for left.', times ? 1 : 2), st(B(num(v) + opS) + ' = ?', ans)],
      traps: [tr(hop(v, e - 1, times), 'f_decx10', hopWhy), tr(hop(v, e + 1, times), 'f_decx10', hopWhy),
        tr(hop(v, e, !times), 'n_times10', times ? 'Times ' + nm(P10[e]) + ' makes the number bigger.' : 'Dividing by ' + nm(P10[e]) + ' makes the number smaller.'), tr(times && p > 0 ? v : null, 'n_times10', 'Writing a 0 on the end of a decimal does not change it. Hop the point instead.')] };
  } },

{ id: 'f_decmul', s: 'frac', g: 5, title: 'Multiply decimals', pre: [], paper: true,
  tip: 'Multiply as if there were no points, then count the decimal places in both numbers. 0.3 × 0.4: 3 × 4 = 12, two places, so 0.12.',
  gen(d, R) {
    let k1, p1, k2, p2;
    if (d === 0) { k1 = R.chance(0.6) ? R.i(2, 9) : R.i(11, 29); p1 = 1; k2 = R.i(2, 9); p2 = 0; }
    else if (d === 1) { const t = R.pick(['tt', 'hw', 'tw2']); if (t === 'tt') { k1 = R.i(2, 9); k2 = R.i(2, 9); p1 = p2 = 1; } else if (t === 'hw') { k1 = R.i(2, 9); p1 = 2; k2 = R.i(2, 9); p2 = 0; } else { k1 = R.i(11, 25); p1 = 1; k2 = R.i(2, 9); p2 = 1; } }
    else { const t = R.pick(['a', 'b', 'c']); if (t === 'a') { k1 = R.i(11, 35); p1 = 1; k2 = R.i(2, 9); p2 = 2; } else if (t === 'b') { k1 = R.i(11, 25); p1 = 1; k2 = R.i(11, 25); p2 = 1; } else { k1 = R.i(11, 25); p1 = 2; k2 = R.i(2, 9); p2 = 1; } }
    if (k1 % 10 === 0 || k2 % 10 === 0) return null;
    const K = k1 * k2, P = p1 + p2, ans = dv(K, P), x = dv(k1, p1), y = dv(k2, p2);
    const shown = String(K).padStart(P + 1, '0'), written = shown.slice(0, shown.length - P) + '.' + shown.slice(shown.length - P);
    const zeroEnd = K % 10 === 0;
    return { text: B(num(x) + ' × ' + num(y)) + ' = ?', ans,
      how: ['Multiply without the points: ' + k1 + ' × ' + k2 + ' = ' + K + '.', 'Count the decimal places: ' + num(x) + ' has ' + p1 + (p2 ? ' and ' + num(y) + ' has ' + p2 : '') + ', so the answer has ' + P + '.', 'Count ' + P + ' ' + plural(P, 'place') + ' in from the right' + (String(K).length <= P ? ' (fill in zeros so the point has a place to go)' : '') + ': ' + (zeroEnd ? written + ' = ' + B(num(ans)) : B(num(ans))) + '.'],
      steps: [st('Without the points: ' + B(k1 + ' × ' + k2) + ' = ?', K), st('How many decimal places are in the two numbers together?', P), st('So ' + B(num(x) + ' × ' + num(y)) + ' = ?', ans)],
      traps: [tr(dv(K, P - 1), 'f_decmul', 'Count the decimal places in both numbers and add them: ' + P + ' ' + plural(P, 'place') + '.'), tr(dv(K, P + 1), 'f_decmul', 'Count the decimal places in both numbers and add them: ' + P + ' ' + plural(P, 'place') + '.'),
        tr(K, 'f_decmul', 'Put the point back: the answer has ' + P + ' decimal places.'), k1 < 13 && k2 < 13 ? tr(dv(slip(k1, k2).v, P), factC(k1, k2), 'Check the times fact ' + k1 + ' × ' + k2 + '.') : null] };
  } },

{ id: 'f_divunit', s: 'frac', g: 5, title: 'Divide by a unit fraction', pre: [],
  tip: '3 ÷ 1/4 asks how many quarters fit in 3. Each whole holds 4 quarters, so 3 × 4 = 12. Dividing by a piece smaller than 1 gives a bigger answer.',
  gen(d, R) {
    const NM = ['', '', 'halves', 'thirds', 'quarters', 'fifths', 'sixths', 'sevenths', 'eighths', 'ninths', 'tenths', 'elevenths', 'twelfths'];
    if (d === 0) {
      const b = R.i(2, 4), w = R.i(1, 6), ans = w * b;
      return { text: 'How many ' + B(NM[b]) + ' are in ' + B(w) + '?', ans, vis: fracBarSVG(ans, b),
        how: ['Each whole holds ' + b + ' ' + NM[b] + '.', w + ' ' + plural(w, 'whole') + ' hold ' + w + ' × ' + b + ' = ' + B(ans) + ' ' + NM[b] + '.'],
        steps: [st('How many ' + NM[b] + ' are in 1 whole?', b), st(B(w + ' × ' + b) + ' = ?', ans)],
        traps: [tr(w + b, 'f_divunit', 'Every whole holds ' + b + ' ' + NM[b] + '. Count ' + b + ' for each whole.'), tr(w % b === 0 ? w / b : null, 'f_divunit', 'You divided ' + w + ' into ' + b + ' parts. The question is how many small pieces fit.')] };
    }
    if (d === 1 && R.chance(0.35)) {
      const b = R.i(2, 6), w = R.i(2, 6);
      return { text: frac(1, b) + ' ÷ ' + B(w) + ' = ?', ans: F(1, b * w),
        how: ['Share ' + frac(1, b) + ' into ' + w + ' equal parts. Each ' + frac(1, b) + ' piece is cut into ' + w + '.', 'The whole now has ' + b + ' × ' + w + ' = ' + (b * w) + ' pieces, so each part is ' + B(frac(1, b * w)) + '.'],
        steps: [st('Cut every ' + frac(1, b) + ' into ' + w + '. How many pieces in the whole? ' + B(b + ' × ' + w), b * w), sf('So ' + frac(1, b) + ' ÷ ' + w + ' = ?', 1, b * w)],
        traps: [tr(F(w, b), 'f_divunit', 'Sharing ' + frac(1, b) + ' into ' + w + ' parts makes each part smaller, not bigger.'), tr(F(1, b + w), 'f_divunit', 'Each piece is cut into ' + w + ', so the bottom is ' + b + ' × ' + w + '.')] };
    }
    if (d === 1) {
      const b = R.i(2, 10), w = R.i(2, 10), ans = w * b;
      return { text: B(w) + ' ÷ ' + frac(1, b) + ' = ?', ans,
        how: [w + ' ÷ ' + frac(1, b) + ' asks: how many ' + frac(1, b) + ' pieces fit in ' + w + '?', 'Each whole holds ' + b + ', so ' + w + ' × ' + b + ' = ' + B(ans) + '.'],
        steps: [st('How many ' + frac(1, b) + ' pieces fit in 1 whole?', b), st(B(w + ' × ' + b) + ' = ?', ans)],
        traps: [tr(dv(w * 100 / b % 1 === 0 ? w * 100 / b : 0, 2) || null, 'f_divunit', 'Dividing by a piece smaller than 1 gives more, not less.'), tr(w + b, 'f_divunit', 'Each whole holds ' + b + ' pieces. Multiply.'), slip(w, b)] };
    }
    if (R.chance(0.5)) {
      const b = R.i(2, 6), a = R.i(1, b - 1), m = R.i(2, 4), B2 = b * m, ans = a * m; if (gcd(a, b) > 1) return null;
      return { text: frac(a, b) + ' ÷ ' + frac(1, B2) + ' = ?', ans,
        how: ['How many ' + frac(1, B2) + ' pieces fit in ' + frac(a, b) + '? Make the bottoms match.', frac(a, b) + ' = ' + frac(ans, B2) + ', which is ' + B(ans) + ' pieces of size ' + frac(1, B2) + '.'],
        steps: [st(frac(a, b) + ' = ' + fq('?', B2), ans)],
        traps: [tr(F(a, b * B2).n / (b * B2), 'f_divunit', 'Dividing by a small piece gives a bigger answer. Count how many pieces fit.'), tr(a * B2, 'f_equiv', 'Change ' + frac(a, b) + ' to ' + B2 + 'ths first: times the top by ' + m + ', not ' + B2 + '.')] };
    }
    const b = R.i(2, 8), w = R.i(2, 9), a = R.chance(0.5) ? R.i(1, b - 1) : 0, t = R.pick([['ribbon', 'm', 'pieces'], ['bag of rice', 'kg', 'scoops'], ['jug of juice', 'L', 'cups']]);
    if (a && gcd(a, b) > 1) return null;
    const ans = w * b + a, amt = a ? mixed(w, a, b) : num(w);
    return { text: 'A ' + t[0] + ' holds ' + B(amt + ' ' + t[1]) + '. Each of the ' + t[2] + ' is ' + B(frac(1, b) + ' ' + t[1]) + '. How many ' + t[2] + '?', ans,
      how: ['How many ' + frac(1, b) + ' fit in ' + amt + '? That is ' + amt + ' ÷ ' + frac(1, b) + '.', 'Each whole holds ' + b + ': ' + w + ' × ' + b + ' = ' + (w * b) + (a ? ', plus the ' + frac(a, b) + ' holds ' + a + ' more: ' + (w * b) + ' + ' + a + ' = ' + B(ans) : ' = ' + B(ans)) + '.'],
      steps: [st(B(w + ' × ' + b) + ' = ?', w * b)].concat(a ? [st('How many ' + frac(1, b) + ' in ' + frac(a, b) + '?', a), st(B((w * b) + ' + ' + a) + ' = ?', ans)] : []),
      traps: [tr(a ? w * b : null, 'f_divunit', 'Count the pieces in the ' + frac(a, b) + ' too.'), tr(w + b, 'f_divunit', 'Each whole holds ' + b + ' pieces. Multiply.'), tr(a ? (w + 1) * b : null, 'f_mixed', frac(a, b) + ' is less than a whole: it holds ' + a + ' ' + plural(a, 'piece') + ', not ' + b + '.')] };
  } },

{ id: 'f_divfrac', s: 'frac', g: 6, title: 'Divide fractions', pre: [], paper: true,
  tip: 'Keep the first, flip the second, multiply: 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6. Same bottoms? Just divide the tops: 6/7 ÷ 2/7 = 6 ÷ 2 = 3.',
  gen(d, R) {
    if (d === 0) {
      const b = R.i(3, 12), c = R.i(1, 5), q = R.i(2, 6), a = c * q; if (a >= b * 2 || a === c) return null;
      return { text: frac(a, b) + ' ÷ ' + frac(c, b) + ' = ?', ans: F(q, 1), low: true,
        how: ['Same bottoms: both are counted in ' + frac(1, b) + ' pieces.', 'So it is ' + a + ' pieces ÷ ' + c + ' ' + plural(c, 'piece') + ': ' + a + ' ÷ ' + c + ' = ' + B(q) + '.', 'Check with flip and multiply: ' + frac(a, b) + ' × ' + frac(b, c) + ' = ' + frac(a * b, b * c) + ' = ' + q + '.'],
        steps: [st('Same bottoms, so divide the tops: ' + B(a + ' ÷ ' + c) + ' = ?', q)],
        traps: [tr(F(q, b), 'f_divfrac', 'Same size pieces: the answer is how many groups of ' + c + ' fit in ' + a + '. The bottoms cancel.'), tr(F(a * c, b * b), 'f_mult', 'You multiplied. To divide, flip the second fraction first.')] };
    }
    let a, b, wh = 0;
    if (d === 1) { b = R.i(2, 10); a = R.i(1, b - 1); if (gcd(a, b) > 1) return null; }
    else if (R.chance(0.3)) { wh = 1; b = 1; a = R.i(2, 9); }
    else { b = R.i(2, 6); const w = R.i(1, 4), r = R.i(1, b - 1); if (gcd(r, b) > 1) return null; a = w * b + r; wh = 2; }
    const dd = R.i(2, d === 1 ? 10 : 9), c = R.i(1, dd - 1); if (gcd(c, dd) > 1) return null;
    if (gcd(a, dd) === 1 && gcd(c, b) === 1 && d === 2 && R.chance(0.6)) return null;
    const m = cancelMul(a, b, dd, c), first = wh === 2 ? mixed(Math.floor(a / b), a % b, b) : wh === 1 ? num(a) : frac(a, b);
    const lines = [];
    if (wh === 2) lines.push('Change the mixed number to a fraction: ' + first + ' = ' + frac(a, b) + '.');
    lines.push('Keep, flip, multiply: ' + (wh === 1 ? frac(a, 1) : frac(a, b)) + ' × ' + frac(dd, c) + '.');
    const ml = m.lines.filter(l => !/^Nothing cancels/.test(l));
    return { text: first + ' ÷ ' + frac(c, dd) + ' = ?<br>Write the answer as a whole number or a fraction in lowest terms.', ans: F(m.N, m.D), low: true,
      how: lines.concat(ml),
      steps: (wh === 2 ? [st(first + ' = ' + fq('?', b), a)] : []).concat([sf('Flip the second fraction: ' + frac(c, dd) + ' becomes ?', dd, c)]).concat(m.steps.slice(-2)),
      traps: [tr(FL(a * dd, b * c), 'f_simplify', 'Right size, but not in lowest terms.'), tr(F(a * c, b * dd), 'f_divfrac', 'You multiplied without flipping. Keep the first, flip the second, then multiply.'),
        tr(F(b * c, a * dd), 'f_divfrac', 'Flip the second fraction, not the first.'), tr(wh === 2 ? F((a % b) * dd, b * c) : null, 'f_mixed', 'Change the mixed number to a fraction first, wholes and all.')] };
  } },

{ id: 'f_bench', s: 'frac', g: 6, title: 'Fraction, decimal, percent friends', pre: [],
  tip: 'Know the friends: 1/2 = 50%, 1/4 = 25%, 1/5 = 20%, 1/10 = 10%, 1/8 = 12.5%. Then build: 3/8 = 3 × 12.5% = 37.5%.',
  gen(d, R) {
    const dd = d === 0 ? R.pick([2, 4, 5, 10]) : d === 1 ? R.pick([4, 5, 8, 20, 25, 50]) : R.pick([8, 8, 20, 40, 4]);
    const n = d === 2 ? R.i(1, 2 * dd - 1) : R.i(1, dd - 1); if (gcd(n, dd) > 1 || n === dd) return null;
    const P = 100 * n / dd, U = 100 / dd, dec = n / dd;
    const unitLine = dd === 8 ? frac(1, 8) + ' is half of ' + frac(1, 4) + ': half of 25% is 12.5%.' : dd === 20 ? frac(1, 20) + ' is half of ' + frac(1, 10) + ': half of 10% is 5%.' : dd === 40 ? frac(1, 40) + ' is half of ' + frac(1, 20) + ': half of 5% is 2.5%.' : dd === 25 ? '25 × 4 = 100, so ' + frac(1, 25) + ' = ' + frac(4, 100) + ' = 4%.' : dd === 50 ? '50 × 2 = 100, so ' + frac(1, 50) + ' = 2%.' : frac(1, dd) + ' = ' + pct(U) + '.';
    const build = n === 1 ? 'So ' + frac(1, dd) + ' = ' : n === dd - 1 && dd >= 8 ? 'So ' + frac(n, dd) + ' = 100% ' + MINUS + ' ' + pct(U) + ' = ' : 'So ' + frac(n, dd) + ' = ' + n + ' × ' + pct(U) + ' = ';
    const kind = R.pick(d === 0 ? ['f2p', 'd2p', 'f2d'] : d === 1 ? ['f2p', 'p2f', 'f2d', 'f2p'] : ['f2p', 'p2f', 'd2f']);
    const glued = +('' + n + dd) <= 999 && +('' + n + dd) !== P ? +('' + n + dd) : null;
    if (kind === 'f2p') return { text: frac(n, dd) + ' = ?%', ans: P, unit: '%',
      how: [unitLine, build + B(pct(P)) + '.'],
      steps: [st(frac(1, dd) + ' = ?%', U, { unit: '%' }), st(n === 1 ? 'So ' + frac(1, dd) + ' = ?%' : B(n + ' × ' + num(U)) + ' = ?', P, { unit: '%' })],
      traps: [tr(glued, 'f_bench', 'A fraction is not its digits side by side. Start from ' + frac(1, dd) + ' = ' + pct(U) + '.'), tr(dec, 'f_decx10', 'That is the decimal. Percent means hundredths: move the point 2 places right.'), tr(P / 10, 'f_decx10', 'Percent means hundredths. Check how far the point moves.')] };
    if (kind === 'd2p') return { text: B(num(dec)) + ' = ?%', ans: P, unit: '%',
      how: ['Percent means hundredths, so × 100: the point hops 2 places right.', num(dec) + ' = ' + B(pct(P)) + '. (It is ' + frac(n, dd) + '.)'],
      steps: [st('How many places does the point hop to make a percent?', 2), st(B(num(dec)) + ' = ?%', P, { unit: '%' })],
      traps: [tr(P / 10, 'f_decx10', 'Percent means hundredths: the point hops 2 places, not 1.'), tr(dec, 'f_decx10', 'Move the point 2 places right to make a percent.')] };
    if (kind === 'f2d') return { text: 'Write ' + frac(n, dd) + ' as a decimal.', ans: dec,
      how: [unitLine.replace(/%/g, '%'), build + pct(P) + ' = ' + B(num(dec)) + '. Percent to decimal: the point hops 2 places left.'],
      steps: [st(frac(n, dd) + ' = ?%', P, { unit: '%' }), st(B(pct(P)) + ' as a decimal = ?', dec)],
      traps: [tr(glued ? glued / 100 : null, 'f_bench', 'A fraction is not its digits side by side. ' + frac(1, dd) + ' = ' + num(U / 100) + '.'), tr(P, 'f_decx10', 'That is the percent. Divide by 100 for the decimal.'), tr(dec * 10, 'f_decx10', 'Check where the point goes: ' + frac(n, dd) + (n < dd ? ' is less than 1.' : '.'))] };
    const [rn, rd] = reduce(n, dd);
    if (kind === 'p2f') return { text: 'Write ' + B(pct(P)) + ' as a fraction in lowest terms.', ans: F(rn, rd), low: true,
      how: [unitLine, n === 1 ? 'So ' + pct(P) + ' is ' + B(frac(rn, rd)) + '.' : pct(P) + ' is ' + n + ' × ' + pct(U) + ', so it is ' + B(frac(rn, rd)) + '.'],
      steps: [st(frac(1, dd) + ' = ?%', U, { unit: '%' }), st('How many ' + pct(U) + ' pieces make ' + pct(P) + '?', n), sf('So ' + pct(P) + ' = ?', n, dd, { low: true })],
      traps: [tr(P % 1 === 0 && gcd(P, 100) > 1 ? FL(P, 100) : null, 'f_simplify', 'Right size: ' + frac(P, 100) + '. Now write it in lowest terms.'), tr(P % 1 === 0 ? null : F(P * 10, 100), 'f_decx10', pct(P) + ' is ' + num(P) + ' hundredths, which is ' + (P * 10) + ' thousandths.')] };
    return { text: 'Write ' + B(num(dec)) + ' as a fraction in lowest terms.', ans: F(rn, rd), low: true,
      how: [num(dec) + ' = ' + pct(P) + '. ' + unitLine, pct(P) + ' is ' + n + ' × ' + pct(U) + ', so it is ' + B(frac(rn, rd)) + '.'],
      steps: [st(B(num(dec)) + ' = ?%', P, { unit: '%' }), st('How many ' + pct(U) + ' pieces make ' + pct(P) + '?', n)],
      traps: [tr(FL(Math.round(dec * 1000), 1000), 'f_simplify', 'Right size. Now write it in lowest terms.')] };
  } },

{ id: 'f_pct10', s: 'frac', g: 6, title: '10% and 1% first', pre: [],
  tip: '10% is 1/10: hop the point one place left. 10% of 70 = 7, so 30% of 70 = 3 × 7 = 21. 1% hops two places, and 5% is half of 10%.',
  gen(d, R) {
    if (d === 0) {
      const N = R.chance(0.7) ? 10 * R.i(2, 90) : R.i(12, 99), ans = N / 10;
      return { text: 'What is ' + B('10% of ' + nm(N)) + '?', ans,
        how: ['10% is ' + frac(1, 10) + ', so divide by 10: the point hops one place left.', '10% of ' + nm(N) + ' = ' + B(num(ans)) + '.'],
        steps: [st(B(nm(N) + ' ÷ 10') + ' = ?', ans)],
        traps: [tr(N / 100, 'f_decx10', '10% hops the point one place, not two.'), tr(N * 10, 'n_times10', '10% is a small part: the answer is smaller than ' + nm(N) + '.'), tr(N - 10, 'f_pct10', '10% means 10 out of every 100, not take away 10.')] };
    }
    if (d === 1) {
      const p = R.pick([20, 30, 40, 60, 70, 80, 90, 5, 5]), N = p === 5 ? 20 * R.i(2, 25) : 10 * R.i(2, 40), t = N / 10, k = p / 10, ans = p * N / 100;
      if (p === 5) return { text: 'What is ' + B('5% of ' + nm(N)) + '?', ans,
        how: ['10% of ' + nm(N) + ' is ' + t + '.', '5% is half of 10%: half of ' + t + ' is ' + B(ans) + '.'],
        steps: [st('10% of ' + B(nm(N)) + ' = ?', t), st('Half of ' + B(t) + ' = ?', ans)],
        traps: [tr(t, 'f_pct10', 'That is 10%. 5% is half of it.'), tr(N / 5, 'f_pct10', '5% is not ' + frac(1, 5) + '. Start from 10% and take half.')] };
      return { text: 'What is ' + B(p + '% of ' + nm(N)) + '?', ans,
        how: ['10% of ' + nm(N) + ' is ' + nm(t) + '.', p + '% is ' + k + ' lots of 10%: ' + k + ' × ' + nm(t) + ' = ' + B(nm(ans)) + '.'],
        steps: [st('10% of ' + B(nm(N)) + ' = ?', t), st(B(k + ' × ' + nm(t)) + ' = ?', ans)],
        traps: [tr(t, 'f_pct10', 'That is 10%. You need ' + k + ' lots of it.'), tr(ans * 10, 'n_times10', 'Check the zeros: 10% of ' + nm(N) + ' is ' + nm(t) + '.'), tr(N - ans, 'f_pct10', 'That is the ' + (100 - p) + '% that is left.'), t <= 12 ? slip(k, t) : null] };
    }
    if (R.chance(0.35)) {
      const p = R.pick([20, 30, 40, 60, 70, 80, 90]), N = R.i(12, 99); if (N % 10 === 0) return null;
      const t = dv(N, 1), k = p / 10, ans = dv(p * N, 2);
      return { text: 'What is ' + B(p + '% of ' + N) + '?', ans,
        how: ['10% of ' + N + ' is ' + num(t) + ' (the point hops one place left).', p + '% is ' + k + ' × ' + num(t) + ' = ' + B(num(ans)) + '.'],
        steps: [st('10% of ' + B(N) + ' = ?', t), st(B(k + ' × ' + num(t)) + ' = ?', ans)],
        traps: [tr(t, 'f_pct10', 'That is 10%. You need ' + k + ' lots of it.'), tr(ans * 10, 'n_times10', 'Check the point: 10% of ' + N + ' is ' + num(t) + '.'), tr(ans / 10, 'n_times10', 'Check the point: 10% of ' + N + ' is ' + num(t) + '.')] };
    }
    const tens = R.i(1, 4), ones = R.pick([1, 2, 3, 4, 5]), p = 10 * tens + ones, N = 100 * R.i(2, 9) * (ones === 5 && R.chance(0.5) ? 1 : 1);
    const t = N / 10, o = N / 100, ans = p * N / 100;
    const five = ones === 5;
    return { text: 'What is ' + B(p + '% of ' + nm(N)) + '?', ans,
      how: ['10% of ' + nm(N) + ' is ' + t + '. ' + (five ? '5% is half of that: ' + (t / 2) + '.' : '1% is ' + o + '.'), p + '% = ' + (tens > 1 ? tens + ' × 10%' : '10%') + ' + ' + (five ? '5%' : ones + ' × 1%') + ': ' + (tens * t) + ' + ' + (five ? t / 2 : ones * o) + ' = ' + B(ans) + '.'],
      steps: [st('10% of ' + B(nm(N)) + ' = ?', t), five ? st('5% of ' + B(nm(N)) + ' = ?', t / 2) : st('1% of ' + B(nm(N)) + ' = ?', o), st(B((tens * t) + ' + ' + (five ? t / 2 : ones * o)) + ' = ?', ans)],
      traps: [tr(tens * t, 'f_pct10', 'That is ' + (10 * tens) + '%. Add the ' + (five ? '5%' : ones + '%') + ' part too.'), tr(five ? null : tens * t + ones * t, 'f_pct10', '1% is a tenth of 10%: ' + o + ', not ' + t + '.'), tr(ans * 10, 'n_times10', 'Check the zeros: 10% of ' + nm(N) + ' is ' + t + '.')] };
  } },

{ id: 'f_pctof', s: 'frac', g: 6, title: 'Percents that are fractions', pre: [],
  tip: 'Some percents are easy fractions: 50% = 1/2, 25% = 1/4, 20% = 1/5, 75% = 3/4. So 25% of 36 = 36 ÷ 4 = 9.',
  gen(d, R) {
    const list = d === 0 ? [[50, 1, 2], [25, 1, 4], [50, 1, 2]] : d === 1 ? [[75, 3, 4], [20, 1, 5], [40, 2, 5], [60, 3, 5], [80, 4, 5], [25, 1, 4]] : [[12.5, 1, 8], [37.5, 3, 8], [62.5, 5, 8], ['33', 1, 3], ['66', 2, 3], [125, 5, 4], [150, 3, 2]];
    const [P, n, dd] = R.pick(list), u = d === 0 ? R.i(3, 25) : d === 1 ? R.i(3, 30) : R.i(3, 15) * (R.chance(0.3) ? 10 : 1), N = dd * u, ans = n * u;
    const pS = P === '33' ? mixed(33, 1, 3) + '%' : P === '66' ? mixed(66, 2, 3) + '%' : pct(P);
    return { text: 'What is ' + B(pS + ' of ' + nm(N)) + '?', ans,
      how: [pS + ' is ' + frac(n, dd) + '.', 'One part: ' + nm(N) + ' ÷ ' + dd + ' = ' + nm(u) + '.' + (n > 1 ? ' ' + n + ' parts: ' + n + ' × ' + nm(u) + ' = ' + B(nm(ans)) + '.' : ' So ' + pS + ' of ' + nm(N) + ' is ' + B(nm(ans)) + '.')],
      steps: [st(pS + ' = ' + fq(n, '?'), dd), st(B(nm(N) + ' ÷ ' + dd) + ' = ?', u)].concat(n > 1 ? [st(B(n + ' × ' + nm(u)) + ' = ?', ans)] : []),
      traps: [tr(n > 1 ? u : null, 'f_of', 'That is one part. ' + pS + ' is ' + n + ' parts.'), tr(N - ans > 0 ? N - ans : null, 'f_pctof', 'That is the part that is left over.'), tr(P === 20 ? N / 2 : null, 'f_bench', '20% is ' + frac(1, 5) + ', not ' + frac(1, 2) + '.'), tr(P === 50 ? 2 * N : null, 'f_half', '50% is half, so the answer is smaller than ' + nm(N) + '.'), tr(P === 25 ? N / 2 : null, 'f_bench', '25% is a quarter: half of a half.'), tr(P === 25 && N % 25 === 0 ? N / 25 : null, 'f_bench', '25% is ' + frac(1, 4) + ', not ' + frac(1, 25) + '.')] };
  } },

{ id: 'f_ratio', s: 'frac', g: 6, title: 'Ratios and equal ratios', pre: [],
  tip: 'Equal ratios multiply both parts by the same number. 3 : 5 = ? : 20: 5 × 4 = 20, so 3 × 4 = 12. Never add the same amount to both.',
  gen(d, R) {
    const a = R.i(1, d === 0 ? 5 : 9), b = R.i(2, d === 0 ? 6 : 9); if (a === b || gcd(a, b) > 1) return null;
    const k = R.i(2, d === 0 ? 5 : 9), A = a * k, Bt = b * k;
    if (d === 2 && R.chance(0.5)) {
      const t = R.pick([['boys', 'girls', 'kids'], ['red beads', 'blue beads', 'beads'], ['cats', 'dogs', 'pets'], ['juice', 'water', 'cups of drink']]), T = (a + b) * k, askB = R.chance(0.5), ans = askB ? Bt : A;
      return { text: 'The ratio of ' + t[0] + ' to ' + t[1] + ' is ' + B(a + ' : ' + b) + '. There are ' + B(T + ' ' + t[2]) + ' in all. How many ' + (askB ? t[1] : t[0]) + '?', ans,
        how: ['Each group of ' + a + ' + ' + b + ' = ' + (a + b) + ' has ' + a + ' ' + t[0] + ' and ' + b + ' ' + t[1] + '.', T + ' ÷ ' + (a + b) + ' = ' + k + ' groups, so ' + (askB ? t[1] : t[0]) + ': ' + (askB ? b : a) + ' × ' + k + ' = ' + B(ans) + '.'],
        steps: [st('How many in one group? ' + B(a + ' + ' + b) + ' = ?', a + b), st('How many groups? ' + B(T + ' ÷ ' + (a + b)) + ' = ?', k), st(B((askB ? b : a) + ' × ' + k) + ' = ?', ans)],
        traps: [tr(askB ? A : Bt, 'f_ratio', 'That is the number of ' + (askB ? t[0] : t[1]) + '.'), tr(T % (askB ? b : a) === 0 ? T / (askB ? b : a) : null, 'f_ratio', 'The total is made of groups of ' + (a + b) + ', not ' + (askB ? b : a) + '.'), tr(T - (askB ? a : b), 'f_ratio', 'Find how many groups of ' + (a + b) + ' make ' + T + ' first.')] };
    }
    if (d === 2) {
      const m = R.i(2, 5); if (m === k) return null;
      return { text: B((a * m) + ' : ' + (b * m) + ' = ? : ' + Bt), ans: A,
        how: [(b * m) + ' does not go into ' + Bt + ', so simplify first: ' + (a * m) + ' : ' + (b * m) + ' = ' + a + ' : ' + b + ' (÷ ' + m + ').', b + ' × ' + k + ' = ' + Bt + ', so ' + a + ' × ' + k + ' = ' + B(A) + '.'],
        steps: [st((a * m) + ' : ' + (b * m) + ' = ' + a + ' : ?', b), st(B(b + ' × ? = ' + Bt), k), st(B(a + ' × ' + k) + ' = ?', A)],
        traps: [tr(a * m + Bt - b * m, 'f_ratio', 'Equal ratios multiply both parts by the same number. Adding the same amount changes the ratio.'), tr(k, 'f_ratio', k + ' is what you multiply by. Use it on the first part.')] };
    }
    const where = d === 0 ? 0 : R.i(0, 2);
    if (where === 2) return { text: B(A + ' : ' + Bt + ' = ' + a + ' : ?'), ans: b,
      how: ['Going from ' + A + ' to ' + a + ' is ÷ ' + k + '.', 'Do the same to the other part: ' + Bt + ' ÷ ' + k + ' = ' + B(b) + '.'],
      steps: [st(B(A + ' ÷ ? = ' + a), k), st(B(Bt + ' ÷ ' + k) + ' = ?', b)],
      traps: [tr(Bt - (A - a), 'f_ratio', 'Divide both parts by the same number. Taking the same amount away changes the ratio.'), tr(k, 'f_ratio', k + ' is what you divide by. Use it on the other part.')] };
    const story = d === 0 && R.chance(0.5);
    if (where === 1) return { text: B(a + ' : ' + b + ' = ' + A + ' : ?'), ans: Bt,
      how: [a + ' × ' + k + ' = ' + A + ', so both parts are times ' + k + '.', b + ' × ' + k + ' = ' + B(Bt) + '.'],
      steps: [st(B(a + ' × ? = ' + A), k), st(B(b + ' × ' + k) + ' = ?', Bt)],
      traps: [tr(b + A - a, 'f_ratio', 'Equal ratios multiply both parts by the same number, not add.'), tr(k, 'f_ratio', k + ' is what you multiply by. Use it on the other part.'), slip(b, k)] };
    if (story) return { text: 'A recipe uses ' + B(a + ' cups of flour') + ' for every ' + B(b + ' eggs') + '. How many cups of flour for ' + B(Bt + ' eggs') + '?', ans: A,
      how: [b + ' eggs → ' + Bt + ' eggs is × ' + k + '.', 'Flour × ' + k + ' too: ' + a + ' × ' + k + ' = ' + B(A) + ' cups.'],
      steps: [st(B(b + ' × ? = ' + Bt), k), st(B(a + ' × ' + k) + ' = ?', A)],
      traps: [tr(a + Bt - b, 'f_ratio', 'Equal ratios multiply both parts by the same number, not add.'), tr(k, 'f_ratio', k + ' is what you multiply by. Use it on the flour.')] };
    return { text: B(a + ' : ' + b + ' = ? : ' + Bt), ans: A,
      how: [b + ' × ' + k + ' = ' + Bt + ', so both parts are times ' + k + '.', a + ' × ' + k + ' = ' + B(A) + '.'],
      steps: [st(B(b + ' × ? = ' + Bt), k), st(B(a + ' × ' + k) + ' = ?', A)],
      traps: [tr(a + Bt - b, 'f_ratio', 'Equal ratios multiply both parts by the same number, not add.'), tr(k, 'f_ratio', k + ' is what you multiply by. Use it on the first part.'), a > 1 ? slip(a, k) : null] };
  } },

{ id: 'f_rate', s: 'frac', g: 6, title: 'Unit rates: the amount for one', pre: [],
  tip: 'Find the amount for one first, then use it. 6 pages in 2 minutes is 3 pages a minute, so 7 minutes gives 7 × 3 = 21 pages.',
  gen(d, R) {
    const ctx = R.pick([['km', 'hours', 'hour', 'A train goes'], ['pages', 'minutes', 'minute', 'Mia reads'], ['liters', 'minutes', 'minute', 'A tap fills'], ['cookies', 'trays', 'tray', 'A baker makes'], ['words', 'minutes', 'minute', 'Leo types'], ['laps', 'hours', 'hour', 'A runner does']]);
    const r = d === 0 ? R.i(2, 12) : R.i(3, 15) * (ctx[0] === 'km' || ctx[0] === 'words' ? 5 : 1), n = R.i(2, d === 0 ? 6 : 9), T = r * n;
    if (d === 0) return { text: ctx[3] + ' ' + B(T + ' ' + ctx[0]) + ' in ' + B(n + ' ' + ctx[1]) + '. How many ' + ctx[0] + ' in ' + B('1 ' + ctx[2]) + '?', ans: r,
      how: ['For one ' + ctx[2] + ', share ' + T + ' into ' + n + ' equal parts.', T + ' ÷ ' + n + ' = ' + B(r) + ' ' + ctx[0] + ' per ' + ctx[2] + '. Check: ' + n + ' × ' + r + ' = ' + T + '.'],
      steps: [st(B(T + ' ÷ ' + n) + ' = ?', r)],
      traps: [tr(T * n, 'f_rate', 'One ' + ctx[2] + ' gives less than ' + n + ' ' + ctx[1] + '. Divide.'), tr(T - n, 'f_rate', 'Share ' + T + ' into ' + n + ' equal parts: divide.'), r <= 12 ? slip(n, r, 1, 'Check: ' + n + ' × your answer should be ' + T + '.') : null] };
    if (d === 1 || R.chance(0.4)) {
      const m = R.i(2, 12); if (m === n) return null; const ans = r * m;
      return { text: ctx[3] + ' ' + B(T + ' ' + ctx[0]) + ' in ' + B(n + ' ' + ctx[1]) + '. At that rate, how many ' + ctx[0] + ' in ' + B(m + ' ' + ctx[1]) + '?', ans,
        how: ['Find the amount for one: ' + T + ' ÷ ' + n + ' = ' + r + ' ' + ctx[0] + ' per ' + ctx[2] + '.', 'Then ' + m + ' ' + ctx[1] + ': ' + m + ' × ' + r + ' = ' + B(ans) + '.'],
        steps: [st('For one ' + ctx[2] + ': ' + B(T + ' ÷ ' + n) + ' = ?', r), st(B(m + ' × ' + r) + ' = ?', ans)],
        traps: [tr(r, 'f_rate', 'That is for one ' + ctx[2] + '. Now use it for ' + m + '.'), tr(T + m - n, 'f_ratio', 'Rates multiply. Find the amount for one ' + ctx[2] + ' first.'), tr(T * m, 'f_rate', 'Divide by ' + n + ' first to get the amount for one.')] };
    }
    if (R.chance(0.5)) {
      const m = R.i(2, 12), X = r * m;
      return { text: ctx[3] + ' ' + B(T + ' ' + ctx[0]) + ' in ' + B(n + ' ' + ctx[1]) + '. At that rate, how many ' + ctx[1] + ' for ' + B(X + ' ' + ctx[0]) + '?', ans: m,
        how: ['Find the amount for one: ' + T + ' ÷ ' + n + ' = ' + r + ' ' + ctx[0] + ' per ' + ctx[2] + '.', 'How many ' + r + 's make ' + X + '? ' + X + ' ÷ ' + r + ' = ' + B(m) + ' ' + ctx[1] + '.'],
        steps: [st('For one ' + ctx[2] + ': ' + B(T + ' ÷ ' + n) + ' = ?', r), st(B(X + ' ÷ ' + r) + ' = ?', m)],
        traps: [tr(X * r, 'f_rate', 'You want how many ' + ctx[1] + ': divide ' + X + ' by the rate.'), tr(X % n === 0 ? X / n : null, 'f_rate', 'Divide by the amount for one ' + ctx[2] + ', ' + r + '.'), tr(r, 'f_rate', 'That is the rate. Now use it to find the ' + ctx[1] + '.')] };
    }
    const part = R.pick([[15, 4, 'In 15 minutes'], [20, 3, 'In 20 minutes'], [30, 2, 'In half an hour'], [10, 6, 'In 10 minutes']]), q = R.i(2, 15), ans = q * part[1];
    const t2 = R.pick([['km', 'A cyclist rides'], ['pages', 'Ava reads'], ['liters', 'A pump moves']]);
    return { text: part[2] + ', ' + t2[1].replace(/^A /, 'a ') + ' ' + B(q + ' ' + t2[0]) + '. How many ' + t2[0] + ' is that per ' + B('hour') + '?', ans,
      how: ['An hour is 60 minutes, and 60 ÷ ' + part[0] + ' = ' + part[1] + ', so an hour is ' + part[1] + ' lots of ' + part[0] + ' minutes.', part[1] + ' × ' + q + ' = ' + B(ans) + ' ' + t2[0] + ' per hour.'],
      steps: [st(B('60 ÷ ' + part[0]) + ' = ?', part[1]), st(B(part[1] + ' × ' + q) + ' = ?', ans)],
      traps: [tr(q * 60, 'f_rate', 'That is ' + q + ' for every minute. ' + q + ' is for ' + part[0] + ' minutes.'), tr(q, 'f_rate', 'That is for ' + part[0] + ' minutes. An hour is longer.'), tr(q + 60 - part[0], 'f_rate', 'Rates multiply. How many ' + part[0] + '-minute blocks make an hour?')] };
  } },

{ id: 'f_divdec', s: 'frac', g: 6, title: 'Divide by a decimal', pre: [], paper: true,
  tip: 'Move both points the same number of places until you divide by a whole number: 4.2 ÷ 0.6 = 42 ÷ 6 = 7. The answer does not change.',
  gen(d, R) {
    const b = R.i(2, 9), e = d === 0 ? 1 : R.pick([1, 2]), f = d === 2 ? R.pick([0, 1]) : 0;
    let Q = d === 0 ? R.i(2, 9) : d === 1 ? (R.chance(0.5) ? R.i(2, 12) : 10 * R.i(1, 9)) : R.i(11, 60);
    if (f && Q % 10 === 0) return null;
    const ans = dv(Q, f), x = dv(Q * b, e + f), y = dv(b, e), x2 = dv(Q * b, f), byTen = P10[e];
    return { text: B(num(x) + ' ÷ ' + num(y)) + ' = ?', ans,
      how: ['Make the number you divide by a whole number: move both points ' + e + ' ' + plural(e, 'place') + ' right (× ' + nm(byTen) + ').', num(x) + ' ÷ ' + num(y) + ' becomes ' + num(x2) + ' ÷ ' + b + '.', num(x2) + ' ÷ ' + b + ' = ' + B(num(ans)) + '.'],
      steps: [st('Move both points ' + e + ' ' + plural(e, 'place') + '. ' + B(num(x)) + ' becomes ?', x2), st(B(num(x2) + ' ÷ ' + b) + ' = ?', ans)],
      traps: [tr(dv(Q, f + e), 'f_divdec', 'Move the point in both numbers, not just the one you divide by.'), tr(ans * 10, 'n_times10', 'Check how many places you moved: both points move ' + e + '.'), tr(dv(Q, f + 1), 'n_times10', 'Check the point: ' + num(x2) + ' ÷ ' + b + '.'),
        Q <= 12 && f === 0 ? tr(Q + 1, factC(b, Q), 'Check the fact: ' + b + ' × ' + Q + ' = ' + (b * Q) + '.') : null] };
  } },

{ id: 'f_pctswap', s: 'frac', g: 7, title: 'Swap the percent', pre: [],
  tip: 'a% of b = b% of a, because both are a × b ÷ 100. So 8% of 50 = 50% of 8 = 4, and 12% of 25 = 25% of 12 = 3.',
  gen(d, R) {
    const N = d === 0 ? R.pick([50, 25]) : d === 1 ? R.pick([50, 25, 20, 10]) : R.pick([200, 150, 75, 20, 25]);
    const p = R.i(2, 48); if (p % 10 === 0) return null;
    const ans = p * N / 100; if ((p * N) % 10 !== 0 && d < 2) return null; if ((p * N) % 50 !== 0 && d === 0) return null; if ((p * N) % 10 !== 0) return null;
    const easy = { 50: 'half of ' + p, 25: 'a quarter of ' + p + ' (half of half)', 20: p + ' ÷ 5', 10: p + ' ÷ 10', 200: 'double ' + p, 150: p + ' + half of ' + p, 75: 'three quarters of ' + p + ': ' + p + ' ÷ 4 × 3' }[N];
    return { text: 'What is ' + B(p + '% of ' + N) + '?', ans,
      how: [p + '% of ' + N + ' = ' + N + '% of ' + p + ', because both are ' + p + ' × ' + N + ' ÷ 100.', N + '% of ' + p + ' is easy: ' + easy + ' = ' + B(num(ans)) + '.'],
      steps: [st('Swap them: ' + p + '% of ' + N + ' = ?% of ' + p, N, { unit: '%' }), st(B(N + '% of ' + p) + ' = ?', ans)],
      traps: [tr(ans * 10, 'n_times10', 'Check the size: ' + p + '% of ' + N + ' is less than ' + N + '.'), tr(ans / 10, 'n_times10', 'Check the point.'), tr(p * N, 'f_pct10', 'Percent means out of 100: divide by 100.')] };
  } },

{ id: 'f_tip', s: 'frac', g: 7, title: 'Tips and tax', pre: [],
  tip: 'For a tip, find 10% first by hopping the point. 5% is half of 10%, 15% = 10% + 5%, 20% = double 10%. $48: 10% = $4.80, 5% = $2.40, so 15% = $7.20.',
  gen(d, R) {
    const M = (t, c) => st(t, c, { type: 'money', fmt: 'd' });
    const kinds = d === 0 ? ['10', '20'] : d === 1 ? ['15', '5', '20', '15'] : ['t15', 't20', 'tax8', 't15'];
    const k = R.pick(kinds), even = k === '15' || k === 't15' || k === '5';
    const bill = 100 * (even ? 2 * R.i(6, 45) : R.i(12, 90)), ten = bill / 10, tot = k.startsWith('t');
    let tip, how, steps, what;
    if (k === '10') { tip = ten; what = '10% tip'; how = ['10% is ' + frac(1, 10) + ': hop the point one place left.', '10% of ' + C.fmtD(bill) + ' = ' + B(C.fmtD(tip)) + '.']; steps = [M('10% of ' + C.fmtD(bill) + ' = ?', ten)]; }
    else if (k === '20' || k === 't20') { tip = 2 * ten; what = '20% tip'; how = ['10% of ' + C.fmtD(bill) + ' is ' + C.fmtD(ten) + '.', '20% is double: ' + C.fmtD(ten) + ' × 2 = ' + (tot ? C.fmtD(tip) : B(C.fmtD(tip))) + '.']; steps = [M('10% of ' + C.fmtD(bill) + ' = ?', ten), M('Double it: ?', tip)]; }
    else if (k === '5') { tip = ten / 2; what = '5% sales tax'; how = ['10% of ' + C.fmtD(bill) + ' is ' + C.fmtD(ten) + '.', '5% is half of that: ' + B(C.fmtD(tip)) + '.']; steps = [M('10% of ' + C.fmtD(bill) + ' = ?', ten), M('Half of it: ?', tip)]; }
    else if (k === 'tax8') { tip = ten - bill / 50; what = '8% sales tax'; how = ['10% of ' + C.fmtD(bill) + ' is ' + C.fmtD(ten) + ', and 1% is ' + C.fmtD(bill / 100) + ', so 2% is ' + C.fmtD(bill / 50) + '.', '8% = 10% ' + MINUS + ' 2% = ' + C.fmtD(ten) + ' ' + MINUS + ' ' + C.fmtD(bill / 50) + ' = ' + C.fmtD(tip) + '.']; steps = [M('10% of ' + C.fmtD(bill) + ' = ?', ten), M('2% of ' + C.fmtD(bill) + ' = ?', bill / 50), M('8% = 10% ' + MINUS + ' 2% = ?', tip)]; }
    else { tip = ten + ten / 2; what = '15% tip'; how = ['10% of ' + C.fmtD(bill) + ' is ' + C.fmtD(ten) + '.', '5% is half of that: ' + C.fmtD(ten / 2) + '.', '15% = ' + C.fmtD(ten) + ' + ' + C.fmtD(ten / 2) + ' = ' + (tot ? C.fmtD(tip) : B(C.fmtD(tip))) + '.']; steps = [M('10% of ' + C.fmtD(bill) + ' = ?', ten), M('5% of ' + C.fmtD(bill) + ' = ?', ten / 2), M('15% = ?', tip)]; }
    const ans = tot ? bill + tip : tip, isTax = /tax/.test(what);
    if (tot) { how.push('Add it to the bill: ' + C.fmtD(bill) + ' + ' + C.fmtD(tip) + ' = ' + B(C.fmtD(ans)) + '.'); steps.push(M(C.fmtD(bill) + ' + ' + C.fmtD(tip) + ' = ?', ans)); }
    return { text: (isTax ? 'A toy costs ' : 'A meal costs ') + B(C.fmtD(bill)) + '. ' + (tot ? 'With ' + (/^(8|11|18)/.test(what) ? 'an ' : 'a ') + B(what) + ', what is the ' + B('total') + '?' : 'What is the ' + B(what) + '?'), ans, type: 'money', fmt: 'd',
      how, steps,
      traps: [tr(k !== '10' ? (tot ? bill + ten : ten) : null, 'f_pct10', 'That uses 10%. Build the ' + what.split(' ')[0] + ' from the 10%.'), tr(tot ? tip : null, 'f_tip', 'That is the ' + (isTax ? 'tax' : 'tip') + ' alone. Add it to the bill for the total.'), tr(tot ? null : tip * 10, 'n_times10', 'Check the point: 10% of ' + C.fmtD(bill) + ' is ' + C.fmtD(ten) + '.'), tr(k === '5' ? ten * 5 : null, 'f_pct10', '5% is half of 10%, not 5 times it.')] };
  } },

{ id: 'f_pctchange', s: 'frac', g: 7, title: 'Percent increase and decrease', pre: [], paper: true,
  tip: 'Percent change = the change ÷ the starting amount. 40 → 50: the change is 10, and 10 ÷ 40 = 1/4 = 25% up. Always divide by where you started.',
  gen(d, R) {
    const P = [10, 20, 25, 40, 50, 75, 100, 150, 5, 30, 60];
    if (d === 0) {
      const p = R.pick([10, 20, 25, 50, 30, 40]), O = 20 * R.i(1, 20), up = R.chance(0.5), c = O * p / 100, ans = up ? O + c : O - c;
      return { text: 'Start with ' + B(O) + '. ' + (up ? 'Increase' : 'Decrease') + ' it by ' + B(p + '%') + '. What do you get?', ans,
        how: [p + '% of ' + O + ' = ' + c + '.', (up ? 'Increase: add it: ' + O + ' + ' + c : 'Decrease: take it away: ' + O + ' ' + MINUS + ' ' + c) + ' = ' + B(ans) + '.'],
        steps: [st(B(p + '% of ' + O) + ' = ?', c), st(B(up ? O + ' + ' + c : O + ' ' + MINUS + ' ' + c) + ' = ?', ans)],
        traps: [tr(c, 'f_pctchange', 'That is the change. ' + (up ? 'Add it to' : 'Take it away from') + ' ' + O + '.'), tr(up ? O - c : O + c, 'f_pctchange', (up ? 'Increase means it gets bigger.' : 'Decrease means it gets smaller.')), tr(up ? O + p : O - p, 'f_pct10', p + '% of ' + O + ' is not ' + p + '. Find ' + p + '% first.')] };
    }
    if (d === 2 && R.chance(0.4)) {
      const p1 = R.pick([10, 20, 25, 50]), p2 = R.pick([10, 20, 25, 50]), O = 40 * R.i(1, 10), mid = O * (100 + p1) / 100, ans = mid * (100 - p2) / 100;
      if (mid % 1 || ans % 1) return null;
      return { text: 'A price of ' + B('$' + O) + ' goes ' + B('up ' + p1 + '%') + '. Then the new price goes ' + B('down ' + p2 + '%') + '. What is the final price in dollars?', ans,
        how: ['Up ' + p1 + '%: ' + p1 + '% of ' + O + ' = ' + (O * p1 / 100) + ', so ' + O + ' + ' + (O * p1 / 100) + ' = ' + mid + '.', 'Down ' + p2 + '% of the new price: ' + p2 + '% of ' + mid + ' = ' + num(mid * p2 / 100) + ', so ' + mid + ' ' + MINUS + ' ' + num(mid * p2 / 100) + ' = ' + B(num(ans)) + '.'],
        steps: [st('After going up ' + p1 + '%: ?', mid), st(B(p2 + '% of ' + mid) + ' = ?', mid * p2 / 100), st('Final price: ?', ans)],
        traps: [tr(O * (100 + p1 - p2) / 100, 'f_pctchange', 'The ' + p2 + '% comes off the new price, ' + mid + ', not the start.'), tr(mid, 'f_pctchange', 'Now take ' + p2 + '% off ' + mid + '.')] };
    }
    const p = R.pick(d === 1 ? [10, 20, 25, 50, 100, 5] : P), O = 20 * R.i(1, 20), up = d === 1 ? R.chance(0.6) : R.chance(0.4);
    if (!up && p >= 100) return null;
    const c = O * p / 100, N = up ? O + c : O - c, ans = p, [fn, fd] = reduce(c, O);
    const byNew = c * 100 / N;
    return { text: 'A number goes from ' + B(O) + ' to ' + B(N) + '. By what percent did it go ' + (up ? 'up' : 'down') + '?', ans, unit: '%',
      how: ['Change: ' + (up ? N + ' ' + MINUS + ' ' + O : O + ' ' + MINUS + ' ' + N) + ' = ' + c + '.', 'Divide by the start: ' + frac(c, O) + ' = ' + simplest(fn, fd) + '.', 'As a percent: ' + B(p + '%') + ' ' + (up ? 'up' : 'down') + '.'],
      steps: [st('How much did it change?', c), st('Change ÷ start: ' + frac(c, O) + ' in lowest terms is ?', F(fn, fd), { type: 'frac' }), st('As a percent: ?', p, { unit: '%' })],
      traps: [tr(c, 'f_pctchange', 'That is the change. Divide it by the starting number to get a percent.'), tr(byNew % 1 === 0 && byNew !== p ? byNew : (Math.abs(byNew * 10 - Math.round(byNew * 10)) < 1e-9 ? byNew : null), 'f_pctchange', 'Divide by where you started, ' + O + ', not where you ended.'), tr(N * 100 / O, 'f_pctchange', 'That is the new number as a percent of the start. Find the change first.')] };
  } },

{ id: 'f_discount', s: 'frac', g: 7, title: 'Sale prices', pre: [],
  tip: '30% off means you pay 70%. $60 at 30% off: 10% is $6, so 70% is 7 × $6 = $42. No need to find the discount and take it away.',
  gen(d, R) {
    const M = (t, c) => st(t, c, { type: 'money', fmt: 'd' });
    const item = R.pick(['jacket', 'bike', 'game', 'lamp', 'backpack', 'pair of shoes', 'tent', 'scooter']);
    if (d === 2 && R.chance(0.5)) {
      if (R.chance(0.5)) {
        const p1 = R.pick([20, 50, 25, 10]), p2 = R.pick([10, 20, 50]), price = 40 * R.i(2, 10), mid = price * (100 - p1) / 100, ans = mid * (100 - p2) / 100;
        if (mid % 1 || ans % 1) return null;
        return { text: 'A ' + item + ' costs ' + B('$' + price) + '. It is ' + B(p1 + '% off') + ', and then you get ' + B(p2 + '% off') + ' the sale price. What do you pay?', ans: ans * 100, type: 'money', fmt: 'd',
          how: [p1 + '% off: pay ' + (100 - p1) + '% of $' + price + ' = $' + num(mid) + '.', p2 + '% off that: pay ' + (100 - p2) + '% of $' + num(mid) + ' = ' + B('$' + num(ans)) + '.', 'Not the same as ' + (p1 + p2) + '% off: the second discount is taken from a smaller price.'],
          steps: [M('After ' + p1 + '% off: ?', mid * 100), M('After another ' + p2 + '% off: ?', ans * 100)],
          traps: [tr(price * (100 - p1 - p2), 'f_discount', 'Two discounts do not add up. The ' + p2 + '% comes off the sale price.'), tr(mid * 100, 'f_discount', 'Now take ' + p2 + '% off the sale price too.')] };
      }
      const p = R.pick([20, 25, 40, 10, 30, 50]), orig = (p === 30 ? 10 : 20) * R.i(2, 15), S = orig * (100 - p) / 100;
      return { text: 'After ' + B(p + '% off') + ', a ' + item + ' costs ' + B('$' + S) + '. What was the price before the sale?', ans: orig * 100, type: 'money', fmt: 'd',
        how: [p + '% off means $' + S + ' is ' + (100 - p) + '% of the old price.', (100 - p) + '% is $' + S + ', so 1% is $' + S + ' ÷ ' + (100 - p) + ' and 100% is $' + S + ' ÷ ' + (100 - p) + ' × 100 = ' + B('$' + orig) + '.'],
        steps: [st('$' + S + ' is what percent of the old price?', 100 - p, { unit: '%' }), M('Old price: ?', orig * 100)],
        traps: [tr(Math.round(S * (100 + p)), 'f_discount', 'Adding ' + p + '% of the sale price does not undo it: the ' + p + '% was of the old price.'), tr(S * 100, 'f_discount', 'That is the sale price. The old price was more.')] };
    }
    const p = d === 0 ? R.pick([10, 20, 50, 25]) : R.pick([30, 40, 15, 35, 60, 70]), price = (p % 10 ? 20 : p === 25 ? 4 : 10) * R.i(d === 0 ? 2 : 3, d === 0 ? 15 : 20), pay = 100 - p, ans = price * pay / 100, ten = price / 10;
    let how;
    if (p === 50) how = ['50% off means you pay 50%: half the price.', 'Half of $' + price + ' = ' + B('$' + num(ans)) + '.'];
    else if (p === 25) how = ['25% off means you pay 75%: three quarters of the price.', '$' + price + ' ÷ 4 = $' + num(price / 4) + ', and 3 × $' + num(price / 4) + ' = ' + B('$' + num(ans)) + '.'];
    else if (pay % 10) how = [p + '% off means you pay ' + pay + '%.', '10% of $' + price + ' is $' + num(ten) + ', and 5% is $' + num(ten / 2) + '.', pay + '% = ' + Math.floor(pay / 10) + ' × $' + num(ten) + ' + $' + num(ten / 2) + ' = ' + B('$' + num(ans)) + '.'];
    else how = [p + '% off means you pay ' + pay + '%.', '10% of $' + price + ' is $' + num(ten) + ', so ' + pay + '% is ' + (pay / 10) + ' × $' + num(ten) + ' = ' + B('$' + num(ans)) + '.'];
    return { text: 'A ' + item + ' costs ' + B('$' + price) + '. It is ' + B(p + '% off') + '. What is the sale price?', ans: Math.round(ans * 100), type: 'money', fmt: 'd',
      how, steps: [st(p + '% off means you pay what percent?', pay, { unit: '%' }), M(B(pay + '% of $' + price) + ' = ?', Math.round(ans * 100))],
      traps: [tr(Math.round(price * p), 'f_discount', 'That is how much you save. The sale price is what you pay.'), tr(price > p ? (price - p) * 100 : null, 'f_discount', p + '% off is not $' + p + ' off. Find ' + pay + '% of the price.'), tr(Math.round(price * (100 + p)), 'f_discount', 'A sale makes the price smaller.')] };
  } },

{ id: 'f_findwhole', s: 'frac', g: 7, title: 'Find the whole', pre: [],
  tip: 'If 20% is 12, then 10% is 6, so 100% is 60. Or: 20% is 1/5, so the whole is 5 × 12 = 60. Get to 10% (or 1 part), then scale up.',
  gen(d, R) {
    const p = d === 0 ? R.pick([10, 50, 25]) : d === 1 ? R.pick([20, 30, 40, 60, 75, 5]) : R.pick([30, 40, 12.5, 150, 15, 60]);
    const unit = { 10: 10, 50: 50, 25: 25, 20: 10, 30: 10, 40: 10, 60: 10, 75: 25, 5: 5, 12.5: 12.5, 150: 50, 15: 5 }[p], k = p / unit, U = R.i(2, d === 0 ? 12 : 15) * (d === 2 && R.chance(0.3) ? 2 : 1), whole = U * 100 / unit, part = U * k;
    if (whole % 1) return null;
    const story = d === 2 && p < 100 && R.chance(0.6), ctx = R.pick([['kids', 'the class'], ['pages', 'the book'], ['seats', 'the bus'], ['songs', 'the playlist']]);
    const text = story ? B(part + ' ' + ctx[0]) + ' is ' + B(pct(p)) + ' of ' + ctx[1] + '. How many ' + ctx[0] + ' are in ' + ctx[1] + '?' : B(pct(p)) + ' of what number is ' + B(part) + '?';
    const how = k === 1 ? [pct(p) + ' is ' + part + '. ' + pct(p) + ' fits into 100% ' + (100 / unit) + ' times.', 'So 100% is ' + (100 / unit) + ' × ' + part + ' = ' + B(nm(whole)) + '.']
      : [pct(p) + ' is ' + part + ', and ' + pct(p) + ' is ' + k + ' × ' + pct(unit) + '. So ' + pct(unit) + ' is ' + part + ' ÷ ' + k + ' = ' + U + '.', pct(unit) + ' fits into 100% ' + (100 / unit) + ' times: ' + (100 / unit) + ' × ' + U + ' = ' + B(nm(whole)) + '.'];
    return { text, ans: whole, how,
      steps: (k === 1 ? [] : [st(pct(unit) + ' is ?', U)]).concat([st('How many ' + pct(unit) + ' pieces make 100%?', 100 / unit), st('So 100% is ?', whole)]),
      traps: [tr(part * p % 100 === 0 ? part * p / 100 : null, 'f_findwhole', 'That is ' + pct(p) + ' of ' + part + '. Here ' + part + ' is the part, and you want the whole.'), tr(p !== 10 ? part * 10 : null, 'f_findwhole', 'That would be right if ' + part + ' were 10%. It is ' + pct(p) + '.'), tr(k > 1 ? U : null, 'f_findwhole', 'That is ' + pct(unit) + '. Scale up to 100%.'), tr(part + 100 - p, 'f_findwhole', 'Scale up by multiplying, not adding.')] };
  } },

{ id: 'f_proportion', s: 'frac', g: 7, title: 'Proportions', pre: [], paper: true,
  tip: 'Two equal fractions: scale up if a number goes in nicely, or cross multiply. x/12 = 15/20: x × 20 = 12 × 15 = 180, so x = 9.',
  gen(d, R) {
    let A, Bv, Cv, D, pos;
    if (d === 0) { const a = R.i(1, 6), b = R.i(2, 9), k = R.i(2, 6); if (a >= b * 2 || gcd(a, b) > 1) return null; A = a; Bv = b; Cv = a * k; D = b * k; pos = 2; }
    else if (d === 1) { const a = R.i(1, 9), b = R.i(2, 9), m = R.i(2, 5), k = R.i(2, 6); if (m === k || gcd(a, b) > 1 || a === b) return null; A = a * m; Bv = b * m; Cv = a * k; D = b * k; pos = R.i(0, 3); }
    else { A = R.i(2, 15); Bv = R.i(2, 15); D = R.i(2, 20); Cv = A * D / Bv; if (A === Bv) return null; pos = R.i(0, 3); if (pos === 2 && (Cv * 10) % 1) return null; }
    const vals = [A, Bv, Cv, D], ans = vals[pos];
    if (ans <= 0 || (ans * 10) % 1) return null;
    if (d === 2 && vals.some((v, i) => i !== pos && v % 1)) return null;
    const show = vals.map((v, i) => i === pos ? 'x' : num(v)), text = 'Solve for x: ' + fq(show[0], show[1]) + ' = ' + fq(show[2], show[3]);
    /* cross products: A × D = B × C; x is in one of them */
    const xWithD = pos === 0 || pos === 3, other = pos === 0 ? D : pos === 3 ? A : pos === 1 ? Cv : Bv, prod = xWithD ? Bv * Cv : A * D, pair = xWithD ? num(Bv) + ' × ' + num(Cv) : num(A) + ' × ' + num(D);
    const scaleK = d === 0 ? D / Bv : null;
    const how = d === 0 ? ['The bottoms: ' + Bv + ' × ' + scaleK + ' = ' + D + ', so scale the top by ' + scaleK + ' too.', 'x = ' + A + ' × ' + scaleK + ' = ' + B(ans) + '.']
      : ['Cross multiply: x × ' + num(other) + ' = ' + pair + '.', 'x × ' + num(other) + ' = ' + num(prod) + '.', 'x = ' + num(prod) + ' ÷ ' + num(other) + ' = ' + B(num(ans)) + '.'];
    const steps = d === 0 ? [st(B(Bv + ' × ? = ' + D), scaleK), st(B(A + ' × ' + scaleK) + ' = ?', ans)] : [st('Cross multiply the two numbers across from each other: ' + B(pair) + ' = ?', prod), st(B(num(prod) + ' ÷ ' + num(other)) + ' = ?', ans)];
    return { text, ans, how, steps,
      traps: [tr(pos === 2 ? A + D - Bv : pos === 0 ? Cv - (D - Bv) : null, 'f_ratio', 'Equal fractions come from multiplying, not adding the same amount.'), tr((xWithD ? other * Cv / Bv : other * D / A), 'f_proportion', 'Cross multiply the numbers that are across from each other (top left with bottom right).'), tr(prod, 'f_proportion', 'That is ' + pair + '. Now divide by ' + num(other) + '.')].filter(t => !t.v || (t.v > 0 && (t.v * 10) % 1 === 0)) };
  } },

{ id: 'f_repeat', s: 'frac', g: 8, title: 'Repeating decimals', pre: [], paper: true,
  tip: 'One repeating digit goes over 9: 0.777… = 7/9. Two repeating digits go over 99: 0.272727… = 27/99 = 3/11. Why: 10x − x takes away the endless tail.',
  gen(d, R) {
    const kind = d === 0 ? 'one' : d === 1 ? 'two' : R.pick(['mix', 'whole', 'back', 'mix']);
    if (kind === 'one') {
      const a = R.i(1, 8), [n, dd] = reduce(a, 9), s = '0.' + String(a).repeat(3) + '…';
      return { text: 'Write ' + B(s) + ' as a fraction in lowest terms.', ans: F(n, dd), low: true,
        how: ['Let x = ' + s + ', so 10x = ' + a + '.' + String(a).repeat(3) + '…', 'Take away: 10x ' + MINUS + ' x = ' + a + ', so 9x = ' + a + '.', 'x = ' + (dd !== 9 ? frac(a, 9) + ' = ' : '') + B(frac(n, dd)) + '.'],
        steps: [st('If x = ' + s + ', then 9x = ?', a), sf('So x = ?', n, dd, { low: true })],
        traps: [tr(F(a, 10), 'f_dec10', a + '/10 is 0.' + a + ' exactly. A repeating digit goes over 9.'), tr(dd !== 9 ? FL(a, 9) : null, 'f_simplify', 'Right size. Now write it in lowest terms.')] };
    }
    if (kind === 'two') {
      const ab = R.i(1, 98); if (ab % 11 === 0) return null;
      const t = String(ab).padStart(2, '0'), [n, dd] = reduce(ab, 99), s = '0.' + t.repeat(3) + '…';
      return { text: 'Write ' + B(s) + ' as a fraction in lowest terms.', ans: F(n, dd), low: true,
        how: ['Let x = ' + s + '. Two digits repeat, so 100x = ' + ab + '.' + t.repeat(2) + '…', 'Take away: 100x ' + MINUS + ' x = ' + ab + ', so 99x = ' + ab + '.', 'x = ' + (dd !== 99 ? frac(ab, 99) + ' = ' : '') + B(frac(n, dd)) + '.'],
        steps: [st('If x = ' + s + ', then 99x = ?', ab), sf('So x = ?', n, dd, { low: true })],
        traps: [tr(F(ab, 100), 'f_dec10', ab + '/100 is 0.' + t + ' exactly. Two repeating digits go over 99.'), tr(dd !== 99 ? FL(ab, 99) : null, 'f_simplify', 'Right size. Now write it in lowest terms.'), tr(F(ab, 9), 'f_repeat', 'Two digits repeat, so use 100x and 99, not 9.')] };
    }
    if (kind === 'whole') {
      const w = R.i(1, 5), a = R.i(1, 8), [n, dd] = reduce(9 * w + a, 9), s = w + '.' + String(a).repeat(3) + '…';
      return { text: 'Write ' + B(s) + ' as a fraction in lowest terms.', ans: F(n, dd), low: true,
        how: ['The part after the point: 0.' + String(a).repeat(3) + '… = ' + frac(a, 9) + '.', 'So ' + s + ' = ' + w + ' + ' + frac(a, 9) + ' = ' + frac(9 * w, 9) + ' + ' + frac(a, 9) + ' = ' + frac(9 * w + a, 9) + '.', 'In lowest terms: ' + B(frac(n, dd)) + '.'],
        steps: [sf('0.' + String(a).repeat(3) + '… = ?', a, 9), st(B(w) + ' = ' + fq('?', 9), 9 * w), sf('So ' + s + ' = ?', n, dd, { low: true })],
        traps: [tr(F(w * 10 + a, 10), 'f_dec10', 'That ends. A repeating digit goes over 9.'), tr(F(w + a, 9), 'f_mixed', 'Each whole is 9 ninths: ' + w + ' = ' + frac(9 * w, 9) + '.'), tr(dd !== 9 ? FL(9 * w + a, 9) : null, 'f_simplify', 'Right size. Now write it in lowest terms.')] };
    }
    if (kind === 'back') {
      const n = R.i(2, 10), digits = String(9 * n).padStart(2, '0');
      return { text: frac(n, 11) + ' = 0.□□□□… with two digits repeating. Type the two repeating digits as one number.', ans: 9 * n,
        how: ['Elevenths repeat two digits over 99: ' + frac(n, 11) + ' = ' + frac(9 * n, 99) + ' (top and bottom × 9).', 'So ' + frac(n, 11) + ' = 0.' + digits.repeat(3) + '…: the digits are ' + B(digits) + '.'],
        steps: [st(frac(n, 11) + ' = ' + fq('?', 99), 9 * n)],
        traps: [tr(n * 11, 'f_repeat', 'Make the bottom 99: times the top and bottom by 9.'), tr(n * 10 + n, 'f_repeat', 'Make the bottom 99: ' + frac(n, 11) + ' = ' + fq('?', 99) + '.')] };
    }
    /* 0.a bbb… : one digit, then a repeating digit */
    const a = R.i(1, 9), b = R.i(0, 9); if (a === b) return null;
    const top = 10 * a + b - a, [n, dd] = reduce(top, 90), s = '0.' + a + String(b).repeat(3) + '…';
    return { text: 'Write ' + B(s) + ' as a fraction in lowest terms.', ans: F(n, dd), low: true,
      how: ['Let x = ' + s + ', so 10x = ' + a + '.' + String(b).repeat(3) + '… and 100x = ' + (10 * a + b) + '.' + String(b).repeat(3) + '…', 'Take away: 100x ' + MINUS + ' 10x = ' + (10 * a + b) + ' ' + MINUS + ' ' + a + ', so 90x = ' + top + '.', 'x = ' + frac(top, 90) + ' = ' + B(frac(n, dd)) + '.'],
      steps: [st('If x = ' + s + ', then 90x = ' + (10 * a + b) + ' ' + MINUS + ' ' + a + ' = ?', top), sf('So x = ?', n, dd, { low: true })],
      traps: [tr(F(10 * a + b, 90), 'f_repeat', 'The tail cancels only when you take 10x from 100x: ' + (10 * a + b) + ' ' + MINUS + ' ' + a + '.'), tr(F(10 * a + b, 99), 'f_repeat', 'Only one digit repeats here, after a digit that does not.'), tr(F(10 * a + b, 100), 'f_dec10', 'That ends. The ' + b + ' keeps going forever.')] };
  } },

/* =================== Factors & Primes =================== */
{ id: 'fa_factors', s: 'fact', g: 4, title: 'Factor pairs', pre: ['m_divfam'],
  tip: 'Find factors in pairs: check 1, 2, 3, … and stop when the pairs meet. 36: 1 × 36, 2 × 18, 3 × 12, 4 × 9, 6 × 6. That is 9 factors (6 counts once).',
  gen(d, R) {
    const kind = d === 0 ? R.pick(['partner', 'pairs']) : d === 1 ? R.pick(['count', 'count', 'partner']) : R.pick(['count', 'close']);
    if (kind === 'partner') {
      const a = R.i(2, d === 0 ? 6 : 9), b = R.i(a + 1, d === 0 ? 10 : 12), N = a * b, sw = R.chance(0.5);
      return { text: B(sw ? b : a) + ' and ' + B('?') + ' are a factor pair of ' + B(N) + '. What is the missing factor?', ans: sw ? a : b,
        how: ['A factor pair multiplies to make ' + N + '.', N + ' ÷ ' + (sw ? b : a) + ' = ' + B(sw ? a : b) + ', because ' + a + ' × ' + b + ' = ' + N + '.'],
        steps: [st(B((sw ? b : a) + ' × ? = ' + N), sw ? a : b)],
        traps: [tr(N - (sw ? b : a), 'fa_factors', 'A factor pair multiplies to ' + N + '. Divide, do not take away.'), slip(a, b, 1, 'Check: ' + a + ' × ' + b + ' should make ' + N + '.')] };
    }
    const pool = d === 0 ? [6, 8, 10, 12, 14, 15, 16, 18, 20, 21, 24, 28, 30] : d === 1 ? [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 44, 45, 48, 49, 50, 54, 56, 60, 63, 64] : [60, 64, 72, 80, 81, 84, 90, 96, 100, 108, 112, 120, 126, 132, 144, 150];
    const N = R.pick(pool), fs = factorsOf(N), pairs = fs.filter(x => x * x <= N).map(x => [x, N / x]), sq = Number.isInteger(Math.sqrt(N)), cnt = fs.length;
    const list = pairs.map(p => p[0] + ' × ' + p[1]).join(', ');
    if (kind === 'close') {
      const p = pairs[pairs.length - 1];
      if (p[0] === 1) return null;
      return { text: 'Of all the factor pairs of ' + B(N) + ', which pair is closest together? Type the ' + B('smaller') + ' number.', ans: p[0],
        how: ['Check 1, 2, 3, … and write the pairs: ' + list + '.', 'The pairs get closer as you go. The last pair, ' + p[0] + ' × ' + p[1] + ', is closest: ' + B(p[0]) + '.'],
        steps: [st('How many factor pairs does ' + B(N) + ' have?', pairs.length), st('The last pair has which smaller number?', p[0])],
        traps: [tr(p[1], 'fa_factors', 'Type the smaller number of the pair.'), tr(pairs.length > 1 ? pairs[pairs.length - 2][0] : null, 'fa_factors', 'Keep checking: there is a pair that is even closer.'), tr(1, 'fa_factors', '1 × ' + N + ' is the pair that is farthest apart.')] };
    }
    if (kind === 'pairs') return { text: 'How many ' + B('factor pairs') + ' does ' + B(N) + ' have?', ans: pairs.length,
      how: ['Check 1, 2, 3, … and write each pair: ' + list + '.', 'The next number would pass ' + pairs[pairs.length - 1][0] + ', so stop. That is ' + B(pairs.length) + ' pairs.'],
      steps: [st('Does 2 go into ' + B(N) + '? Type 1 for yes, 0 for no.', N % 2 ? 0 : 1), st('How many pairs did you find?', pairs.length)],
      traps: [tr(cnt, 'fa_factors', 'That counts the factors. Each pair has two of them.'), tr(pairs.length - 1, 'fa_factors', 'Do not forget 1 × ' + N + '.'), tr(pairs.length + 1, 'fa_factors', 'Stop when the pairs meet, or you count them twice.')] };
    return { text: 'How many ' + B('factors') + ' does ' + B(N) + ' have?', ans: cnt,
      how: ['Check 1, 2, 3, … and write the pairs: ' + list + '.', 'They meet at ' + pairs[pairs.length - 1][0] + ', so stop. Count every number: ' + B(cnt) + ' factors' + (sq ? ' (' + Math.sqrt(N) + ' × ' + Math.sqrt(N) + ' counts once).' : '.')],
      steps: [st('How many factor pairs does ' + B(N) + ' have?', pairs.length), st(sq ? 'Each pair gives 2 factors, but ' + Math.sqrt(N) + ' × ' + Math.sqrt(N) + ' gives only 1. How many factors?' : 'Each pair gives 2 factors. How many factors?', cnt)],
      traps: [tr(sq ? cnt + 1 : null, 'fa_factors', Math.sqrt(N) + ' × ' + Math.sqrt(N) + ' is one factor, not two.'), tr(pairs.length, 'fa_factors', 'That counts the pairs. Each pair has two factors.'), tr(cnt - 2, 'fa_factors', 'You missed a pair. Check every number until the pairs meet.')] };
  } },

{ id: 'fa_multiples', s: 'fact', g: 4, title: 'Multiples and common multiples', pre: [],
  tip: 'Multiples are the skip-counting numbers: 6, 12, 18, 24. For the first common multiple of 4 and 6, count by 6s until 4 goes in: 6, 12. It is 12.',
  gen(d, R) {
    if (d === 0) {
      const a = R.i(2, 10);
      if (R.chance(0.5)) { const k = R.i(3, 10), ans = a * k;
        return { text: 'What is the ' + B(C.ord(k)) + ' multiple of ' + B(a) + '?', ans,
          how: ['The multiples of ' + a + ' are ' + a + ', ' + (2 * a) + ', ' + (3 * a) + ', … The ' + C.ord(k) + ' one is ' + k + ' × ' + a + '.', k + ' × ' + a + ' = ' + B(ans) + '.'],
          steps: [st(B(k + ' × ' + a) + ' = ?', ans)],
          traps: [tr(a + k, 'fa_multiples', 'Multiples come from multiplying: ' + k + ' × ' + a + '.'), tr(a * (k - 1), 'fa_multiples', 'The 1st multiple is ' + a + ' itself, so the ' + C.ord(k) + ' is ' + k + ' × ' + a + '.'), slip(k, a)] }; }
      const X = R.i(15, 80); const ans = (Math.floor(X / a) + 1) * a;
      return { text: 'What is the first multiple of ' + B(a) + ' that is bigger than ' + B(X) + '?', ans,
        how: ['Find the closest times fact: ' + a + ' × ' + Math.floor(X / a) + ' = ' + (a * Math.floor(X / a)) + '.', 'The next multiple is ' + (a * Math.floor(X / a)) + ' + ' + a + ' = ' + B(ans) + '.'],
        steps: [st('Biggest multiple of ' + a + ' that is not more than ' + X + ': ?', a * Math.floor(X / a)), st('Add ' + a + ': ?', ans)],
        traps: [tr(X + a, 'fa_multiples', 'Count in ' + a + 's from 0, not from ' + X + '.'), tr(a * Math.floor(X / a) === X ? null : a * Math.floor(X / a), 'fa_multiples', 'That one is smaller than ' + X + '.'), tr(X + 1, 'fa_multiples', X + 1 + ' is not a multiple of ' + a + '.')] };
    }
    if (d === 2 && R.chance(0.5)) {
      const a = R.i(3, 12), N = R.pick([50, 60, 80, 100, 120, 150, 200]), q = Math.floor(N / a);
      return { text: 'How many multiples of ' + B(a) + ' are there from ' + B(1) + ' to ' + B(N) + '?', ans: q,
        how: ['The multiples are ' + a + ' × 1, ' + a + ' × 2, … up to the biggest one that is not more than ' + N + '.', N + ' ÷ ' + a + ' = ' + q + (N % a ? ' r ' + (N % a) : '') + ', so the last one is ' + a + ' × ' + q + ' = ' + (a * q) + '. That is ' + B(q) + ' multiples.'],
        steps: [st(B(N + ' ÷ ' + a) + ' = ? (ignore any leftover)', q)],
        traps: [tr(N % a ? q + 1 : null, 'm_remain', a + ' × ' + (q + 1) + ' = ' + (a * (q + 1)) + ', which is more than ' + N + '.'), tr(N - a, 'fa_multiples', 'Count how many ' + a + 's fit in ' + N + ': divide.'), tr(q - 1, 'fa_multiples', a + ' itself is the first multiple. Count it too.')] };
    }
    const a = R.i(2, d === 1 ? 10 : 15), b = R.i(2, d === 1 ? 10 : 15); if (a >= b || b % a === 0 && R.chance(0.7)) return null;
    const L = lcm(a, b), seq = []; for (let m = b; m <= L; m += b) seq.push(m);
    return { text: 'What is the ' + B('first common multiple') + ' of ' + B(a) + ' and ' + B(b) + '?', ans: L,
      how: ['Count by the bigger number, ' + b + ': ' + seq.join(', ') + '.', 'Stop at the first one ' + a + ' goes into: ' + B(L) + ' (' + a + ' × ' + (L / a) + ').'],
      steps: [st('Multiples of ' + b + ': ' + seq.slice(0, Math.min(seq.length, 4)).join(', ') + (seq.length > 4 ? ', …' : '') + '. Which is the first one ' + a + ' goes into?', L)],
      traps: [tr(L !== a * b ? a * b : null, 'fa_multiples', a * b + ' is a common multiple, but there is a smaller one.'), tr(b, 'fa_multiples', a + ' does not go into ' + b + '.'), tr(gcd(a, b) > 1 ? gcd(a, b) : null, 'fa_factors', 'That is a common factor. Multiples are bigger than the numbers.')] };
  } },

{ id: 'fa_prime', s: 'fact', g: 4, title: 'Prime or not', pre: [],
  tip: 'A prime has no factors but 1 and itself. Test 2, 3, 5, 7, … and stop once the prime times itself is more than the number. 91: 7 × 13, so 91 is not prime.',
  gen(d, R) {
    if (d === 2 && R.chance(0.3)) {
      const A = 10 * R.i(2, 9), list = []; for (let v = A; v < A + 20; v++) if (isPrime(v)) list.push(v);
      const tricky = [51, 57, 87, 91, 93, 111, 119, 133].filter(v => v >= A && v < A + 20);
      return { text: 'How many ' + B('prime numbers') + ' are there from ' + B(A) + ' to ' + B(A + 19) + '?', ans: list.length,
        how: ['Skip the even numbers and the ones ending in 5. Test the rest with 3 and 7.' + (tricky.length ? ' Watch out: ' + tricky.map(v => v + ' = ' + C.factorsOf(v)[1] + ' × ' + (v / C.factorsOf(v)[1])).join(', ') + '.' : ''), 'The primes are ' + list.join(', ') + ': ' + B(list.length) + '.'],
        steps: [st('Is ' + B(list[0]) + ' prime? Type 1 for yes, 0 for no.', 1), st('How many primes from ' + A + ' to ' + (A + 19) + '?', list.length)],
        traps: [tr(tricky.length ? list.length + tricky.length : list.length + 1, 'fa_prime', tricky.length ? tricky.join(' and ') + ' look prime but are not. Test with 3 and 7.' : 'Check each one with 3 and 7.'), tr(list.length - 1, 'fa_prime', 'Test every odd number that does not end in 5.')] };
    }
    let N = d === 0 ? R.i(4, 40) : d === 1 ? R.i(41, 100) : R.i(101, 250);
    if (d > 0 && N % 2 === 0 && R.chance(0.8)) N++;
    if (d > 0 && N % 5 === 0 && R.chance(0.7)) N += 2;
    const fs = factorsOf(N), sp = fs[1], prime = sp === N, root = Math.floor(Math.sqrt(N)), checks = [];
    const ps = [2, 3, 5, 7, 11, 13, 17, 19];
    for (const p of ps) {
      if (p > sp || p * p > N) break;
      if (p === sp) { checks.push(p === 2 ? N + ' is even, so 2 goes in: ' + N + ' = 2 × ' + (N / 2) + '.' : p === 3 ? 'The digits add to ' + C.sum(String(N).split('').map(Number)) + ', a multiple of 3, so 3 goes in: ' + N + ' = 3 × ' + (N / 3) + '.' : p === 5 ? 'It ends in ' + (N % 10) + ', so 5 goes in: ' + N + ' = 5 × ' + (N / 5) + '.' : p + ' goes in: ' + N + ' = ' + p + ' × ' + (N / p) + '.'); break; }
      checks.push(p === 2 ? 'Not even, so not 2.' : p === 3 ? 'Digits add to ' + C.sum(String(N).split('').map(Number)) + ', so not 3.' : p === 5 ? 'Does not end in 0 or 5, so not 5.' : 'Not ' + p + '.');
    }
    const nextP = ps.find(p => p * p > N);
    const how = prime ? [checks.join(' ') || 'Check 2 and 3.', nextP + ' × ' + nextP + ' = ' + (nextP * nextP) + ' is more than ' + N + ', so stop. ' + N + ' is prime: its smallest factor (not 1) is ' + B(N) + '.'] : [checks.slice(0, -1).join(' ') || 'Start with 2.', checks[checks.length - 1] + ' The smallest factor is ' + B(sp) + '.'];
    return { text: 'What is the smallest factor of ' + B(N) + ' that is not 1? (If ' + N + ' is prime, type ' + N + '.)', ans: sp, how: how.filter(Boolean),
      steps: prime ? [st('Which prime do you test up to? (its square must not be more than ' + N + ')', ps.filter(p => p * p <= N).pop()), st('None of them go in. So the answer is ?', N)] : [st('Does ' + B(sp) + ' go into ' + N + '? ' + B(N + ' ÷ ' + sp) + ' = ?', N / sp), st('So the smallest factor (not 1) is ?', sp)],
      traps: [tr(prime ? null : N, 'fa_prime', N + ' is not prime. Test 2, 3, 5, 7, … to find a factor.'), tr(1, 'fa_prime', 'Every number has 1 as a factor. Find the next smallest.'), tr(prime ? null : N / sp, 'fa_prime', 'That is a factor, but there is a smaller one: its partner.'), tr(!prime && sp > 3 && N % 3 !== 0 ? 3 : null, 'fa_div39', 'Add the digits: ' + N + ' is not a multiple of 3.')] };
  } },

{ id: 'fa_div2510', s: 'fact', g: 4, title: 'Divisible by 2, 5 and 10', pre: [],
  tip: 'Only the last digit matters. Even last digit: divides by 2. Last digit 0 or 5: divides by 5. Last digit 0: divides by 10. 4,385 divides by 5, not by 2 or 10.',
  gen(d, R) {
    const N = d === 0 ? R.i(101, 999) : d === 1 ? R.i(1001, 9999) : R.i(10001, 999999), L = N % 10;
    const kind = d === 0 ? R.pick(['r10', 'r2', 'r5']) : d === 1 ? R.pick(['add5', 'add10', 'add2', 'r5']) : R.pick(['r5', 'count', 'add5']);
    const why = 'Every ten divides evenly by 2, 5 and 10, so only the last digit matters. ' + nm(N) + ' ends in ' + L + '.';
    if (kind === 'count') { const c = (L % 2 === 0) + (L % 5 === 0) + (L === 0);
      return { text: 'How many of the numbers ' + B('2, 5 and 10') + ' divide ' + B(nm(N)) + ' evenly?', ans: c,
        how: [why, '2: ' + (L % 2 ? 'no' : 'yes') + ' (' + (L % 2 ? 'odd' : 'even') + '). 5: ' + (L % 5 ? 'no' : 'yes') + '. 10: ' + (L ? 'no' : 'yes') + '. That is ' + B(c) + '.'],
        steps: [st('Is the last digit even? Type 1 for yes, 0 for no.', L % 2 ? 0 : 1), st('Is it 0 or 5? Type 1 for yes, 0 for no.', L % 5 ? 0 : 1), st('Is it 0? Type 1 for yes, 0 for no.', L ? 0 : 1)],
        traps: [tr(c + 1, 'fa_div2510', 'Check each one with the last digit, ' + L + '.'), tr(c - 1, 'fa_div2510', 'Check each one with the last digit, ' + L + '.')] }; }
    if (kind.startsWith('r')) { const m = +kind.slice(1), r = N % m;
      return { text: 'What is the remainder when ' + B(nm(N)) + ' is divided by ' + B(m) + '?', ans: r,
        how: [why, m === 10 ? 'The tens all divide by 10, and ' + L + ' is left over: ' + B(r) + '.' : L + ' ÷ ' + m + ' leaves ' + B(r) + '.'],
        steps: [st('What is the last digit of ' + B(nm(N)) + '?', L), st(B(L + ' ÷ ' + m) + ' leaves what remainder?', r)],
        traps: [tr(L !== r ? L : null, 'fa_div2510', m + ' fits into ' + L + ' once. What is left after that?'), tr(m === 10 ? Math.floor(N / 10) % 10 : null, 'n_place', 'The leftover is the ones digit.'), tr(m - r, 'fa_div2510', 'That is how far to the next multiple. The remainder is what is left over.')] }; }
    const m = +kind.slice(3), up = (m - L % m) % m;
    if (up === 0) return null;
    return { text: 'What is the ' + B('smallest') + ' number you can add to ' + B(nm(N)) + ' to make it divisible by ' + B(m) + '?', ans: up,
      how: [why, m === 2 ? 'Add 1 to make it even: ' + B(1) + '.' : m === 5 ? 'Multiples of 5 end in 0 or 5. From ' + L + ', the next is ' + (L < 5 ? 5 : 10) + ': add ' + B(up) + '.' : 'Multiples of 10 end in 0. From ' + L + ' to 10: add ' + B(up) + '.', nm(N) + ' + ' + up + ' = ' + nm(N + up) + '.'],
      steps: [st('What is the last digit of ' + B(nm(N)) + '?', L), st('What is the next last digit that works?', (L + up) % 10), st('How much do you add?', up)],
      traps: [tr(m === 5 && L < 5 ? 10 - L : null, 'fa_div2510', 'Multiples of 5 can end in 5 too, which is closer.'), tr(L % m, 'fa_div2510', 'That is the remainder. How much more to reach the next multiple?'), tr(m === 5 ? 5 : null, 'fa_div2510', 'Add to the last digit to make it 0 or 5.')] };
  } },

{ id: 'fa_div39', s: 'fact', g: 5, title: 'Divisible by 3 and 9', pre: [],
  tip: 'Add the digits. If the digit sum divides by 3, so does the number; the same for 9. 4,572: 4 + 5 + 7 + 2 = 18, so it divides by 9 (and 3).',
  gen(d, R) {
    const m = R.pick([3, 9]), dsum = v => C.sum(String(v).split('').map(Number));
    if (d === 1) {
      const len = R.i(3, 4), digits = Array.from({ length: len }, (_, i) => i === 0 ? R.i(1, 9) : R.i(0, 9)), pos = R.i(1, len - 1); digits[pos] = 0;
      const s = C.sum(digits), need = (m - s % m) % m;
      if (m === 9 && (need === 0 || need === 9)) return null;
      const shown = digits.map((x, i) => i === pos ? '_' : x).join('');
      return { text: 'The number ' + B(shown) + ' is divisible by ' + B(m) + '. What is the ' + (m === 3 ? 'smallest digit' : 'missing digit') + ' that fits in the blank?', ans: need,
        how: ['Add the digits you have: ' + digits.filter((_, i) => i !== pos).join(' + ') + ' = ' + s + '.', 'The digit sum must be a multiple of ' + m + '. The next one up from ' + s + ' is ' + (s + need) + ', so the digit is ' + B(need) + '.'],
        steps: [st('Add the digits you have: ?', s), st('Next multiple of ' + m + ' (not less than ' + s + ')?', s + need), st('So the digit is ?', need)],
        traps: [tr(m === 3 ? need + 3 : null, 'fa_div39', 'That works too, but a smaller digit does.'), tr(need + m <= 9 && m === 9 ? need + 9 : null, 'fa_div39', 'Check the digit sum.'), tr((s + need) % 10 === need ? null : (s + need), 'fa_div39', 'That is the digit sum you need. What digit gets you there?'), tr(m === 9 ? (3 - s % 3) % 3 || 3 : null, 'fa_div39', 'For 9 the digit sum must be a multiple of 9, not just 3.')] };
    }
    const N = d === 0 ? R.i(101, 999) : R.i(10001, 999999), s = dsum(N), r = N % m;
    if (d === 2 && R.chance(0.35)) {
      const up = (m - r) % m; if (!up) return null;
      return { text: 'What is the ' + B('smallest') + ' number you can add to ' + B(nm(N)) + ' to make it divisible by ' + B(m) + '?', ans: up,
        how: ['Digit sum: ' + String(N).split('').join(' + ') + ' = ' + s + '.', s + ' ÷ ' + m + ' leaves ' + r + ', so ' + nm(N) + ' leaves ' + r + ' too. Add ' + m + ' ' + MINUS + ' ' + r + ' = ' + B(up) + '.'],
        steps: [st('Add the digits of ' + B(nm(N)) + ': ?', s), st('What is the remainder of ' + s + ' ÷ ' + m + '?', r), st('How much more to the next multiple of ' + m + '?', up)],
        traps: [tr(r, 'fa_div39', 'That is the remainder. How much more to the next multiple?'), tr(s, 'fa_div39', 'That is the digit sum.')] };
    }
    const s2 = dsum(s);
    return { text: 'What is the remainder when ' + B(nm(N)) + ' is divided by ' + B(m) + '?', ans: r,
      how: ['Add the digits: ' + String(N).split('').join(' + ') + ' = ' + s + (s >= 10 && m === 9 ? ', and again: ' + String(s).split('').join(' + ') + ' = ' + s2 : '') + '.', 'A number leaves the same remainder as its digit sum. ' + (m === 9 && s >= 10 ? s2 : s) + ' ÷ ' + m + ' leaves ' + B(r) + '.'],
      steps: [st('Add the digits of ' + B(nm(N)) + ': ?', s), st('Remainder of ' + B(s + ' ÷ ' + m) + ' = ?', r)],
      traps: [tr(s, 'fa_div39', 'That is the digit sum. Now find its remainder when divided by ' + m + '.'), tr(m === 9 ? r % 3 : r + 3 <= 8 ? null : null, 'fa_div39', 'That is the remainder for 3. Divide by 9.'), tr((N % 10) % m, 'fa_div2510', 'The last-digit test works for 2, 5 and 10. For ' + m + ', add all the digits.')] };
  } },

{ id: 'fa_div46', s: 'fact', g: 5, title: 'Divisible by 4 and 6', pre: [],
  tip: '4: 100 divides by 4, so only the last two digits matter (3,716: 16 divides by 4). 6: it must divide by 2 (even) and by 3 (digit sum).',
  gen(d, R) {
    const dsum = v => C.sum(String(v).split('').map(Number));
    if (d === 0 || (d === 2 && R.chance(0.3))) {
      const N = d === 0 ? R.i(101, 999) : R.i(10001, 99999), t = N % 100, r = N % 4;
      return { text: 'What is the remainder when ' + B(nm(N)) + ' is divided by ' + B(4) + '?', ans: r,
        how: ['100 = 4 × 25, so the hundreds and up divide by 4. Only the last two digits matter: ' + t + '.', t + ' ÷ 4 = ' + Math.floor(t / 4) + ' r ' + r + ', so the remainder is ' + B(r) + '.'],
        steps: [st('What number do the last two digits of ' + B(nm(N)) + ' make?', t), st(B(t + ' ÷ 4') + ' leaves what remainder?', r)],
        traps: [tr((N % 10) % 4, 'fa_div46', '10 does not divide by 4, so use the last two digits, not just one.'), tr(t % 2, 'fa_div2510', 'That is the test for 2. For 4, divide the last two digits by 4.')] };
    }
    if (d === 1) {
      const m = R.pick([4, 6]), front = R.i(11, 99), base = front * 10;
      let ans = -1; for (let x = 0; x <= 9; x++) if ((base + x) % m === 0) { ans = x; break; }
      if (ans < 0) return null;
      const s = dsum(front);
      return { text: 'What is the ' + B('smallest digit') + ' that makes ' + B(front + '_') + ' divisible by ' + B(m) + '?', ans,
        how: m === 4 ? ['For 4, check the last two digits: ' + (front % 10) + '_ must be a multiple of 4.', 'Multiples of 4 in the ' + (front % 10) + '0s: ' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => ((front % 10) * 10 + x) % 4 === 0).map(x => (front % 10) * 10 + x).join(', ') + '. The smallest digit is ' + B(ans) + '.']
          : ['For 6, it must be even (divides by 2) and its digit sum must divide by 3.', 'Digits so far add to ' + s + '. Try even digits: ' + ans + ' gives ' + (s + ans) + ', a multiple of 3. So ' + B(ans) + '.'],
        steps: m === 4 ? [st('Which even digit is the smallest that makes ' + (front % 10) + '_ a multiple of 4?', ans)] : [st('Add the digits ' + String(front).split('').join(' + ') + ': ?', s), st('Smallest even digit that makes the sum a multiple of 3?', ans)],
        traps: [tr(m === 6 ? (3 - s % 3) % 3 : null, 'fa_div2510', 'For 6, the number must also be even.'), tr(m === 6 ? [0, 2, 4, 6, 8].find(x => x !== ans) : null, 'fa_div39', 'Even is not enough: the digit sum must divide by 3.'), tr(m === 4 ? [0, 2, 4, 6, 8].find(x => x !== ans && ((front % 10) * 10 + x) % 4 !== 0) : null, 'fa_div46', 'Even is not enough: the last two digits must divide by 4.')] };
    }
    const N = R.i(1001, 9999), s = dsum(N), t = N % 100, by = [N % 2 === 0, s % 3 === 0, t % 4 === 0, N % 2 === 0 && s % 3 === 0], c = by.filter(Boolean).length;
    if (c === 0 && R.chance(0.7)) return null;
    const yn = b => b ? 'yes' : 'no';
    return { text: 'How many of the numbers ' + B('2, 3, 4 and 6') + ' divide ' + B(nm(N)) + ' evenly?', ans: c,
      how: ['2: last digit ' + (N % 10) + ', ' + yn(by[0]) + '. 3: digit sum ' + s + ', ' + yn(by[1]) + '. 4: last two digits ' + String(t).padStart(2, '0') + ', ' + yn(by[2]) + '.', '6 needs both 2 and 3: ' + yn(by[3]) + '. That is ' + B(c) + '.'],
      steps: [st('Digit sum of ' + B(nm(N)) + ': ?', s), st('Does 4 go into ' + B(t) + '? Type 1 for yes, 0 for no.', by[2] ? 1 : 0), st('How many of 2, 3, 4 and 6 divide it?', c)],
      traps: [tr(!by[3] && (by[0] || by[1]) ? c + 1 : null, 'fa_div46', '6 needs both: even and a digit sum that divides by 3.'), tr(!by[2] && (N % 10) % 4 === 0 ? c + 1 : null, 'fa_div46', 'For 4, use the last two digits, not just the last one.'), tr(c > 0 ? c - 1 : null, 'fa_div46', 'Check each of the four again.')] };
  } },

{ id: 'fa_gcf', s: 'fact', g: 6, title: 'Greatest common factor', pre: [], paper: true,
  tip: 'The biggest number that goes into both. List the factors, or use prime factors: shared primes, smallest powers. Quick check: the GCF also goes into the difference.',
  gen(d, R) {
    const g = d === 0 ? R.i(2, 6) : d === 1 ? R.i(2, 15) : R.pick([6, 8, 12, 14, 15, 18, 21, 24, 28, 36]), m = R.i(d === 2 ? 1 : 2, d === 0 ? 5 : 8), n = R.i(2, d === 0 ? 6 : 9);
    if (m >= n || gcd(m, n) > 1) return null;
    const a = g * m, b = g * n; if (b > (d === 0 ? 36 : d === 1 ? 100 : 400)) return null;
    const story = d === 2 && R.chance(0.35);
    const text = story ? 'You have ' + B(a + ' pencils') + ' and ' + B(b + ' erasers') + '. You make identical gift bags with nothing left over. What is the ' + B('most') + ' bags you can make?' : 'What is the ' + B('greatest common factor') + ' of ' + B(a) + ' and ' + B(b) + '?';
    let how;
    if (d < 2) how = ['Factors of ' + a + ': ' + factorsOf(a).join(', ') + '.', 'Factors of ' + b + ': ' + factorsOf(b).join(', ') + '.', 'The biggest one in both lists: ' + B(g) + '.'];
    else how = [a + ' = ' + pfStr(a) + '.', b + ' = ' + pfStr(b) + '.', 'Shared primes, smallest powers: ' + pfStr(g) + ' = ' + B(g) + '.', 'Check: ' + g + ' goes into the difference, ' + b + ' ' + MINUS + ' ' + a + ' = ' + (b - a) + '.'];
    const sp = factorsOf(g)[1];
    return { text, ans: g, how,
      steps: [st(B(a + ' ÷ ' + g) + ' = ?', m), st(B(b + ' ÷ ' + g) + ' = ?', n), st('Do ' + m + ' and ' + n + ' share a factor bigger than 1? Type 1 for yes, 0 for no.', 0)],
      traps: [tr(lcm(a, b), 'fa_lcm', 'That is a common multiple. A factor goes into both numbers, so it is not bigger than ' + a + '.'), tr(sp !== g ? g / sp : null, 'fa_gcf', 'That goes into both, but a bigger number does too.'), tr(a !== g ? a : null, 'fa_factors', a + ' does not go into ' + b + '.'), tr(m * n !== g ? m * n : null, 'fa_gcf', 'Divide both numbers by the common factor; the factor is the answer.')] };
  } },

{ id: 'fa_lcm', s: 'fact', g: 6, title: 'Least common multiple', pre: [], paper: true,
  tip: 'The smallest number both go into. Count by the bigger one, or use LCM = a × b ÷ GCF: for 12 and 18, GCF 6, so 12 × 18 ÷ 6 = 36.',
  gen(d, R) {
    const a = R.i(2, d === 0 ? 10 : d === 1 ? 20 : 40), b = R.i(3, d === 0 ? 12 : d === 1 ? 24 : 60); if (a >= b || b % a === 0) return null;
    const g = gcd(a, b), L = lcm(a, b); if (d > 0 && g === 1 && (d === 2 || R.chance(0.7))) return null; if (L > (d === 2 ? 400 : 150)) return null;
    const story = d === 2 && R.chance(0.4);
    const text = story ? 'One bus leaves every ' + B(a + ' minutes') + ', another every ' + B(b + ' minutes') + '. They both leave at 8:00. In how many minutes do they next leave together?' : 'What is the ' + B('least common multiple') + ' of ' + B(a) + ' and ' + B(b) + '?';
    let how, steps;
    if (d === 0) { const sa = [], sb = []; for (let v = a; v <= L; v += a) sa.push(v); for (let v = b; v <= L; v += b) sb.push(v);
      how = ['Multiples of ' + b + ': ' + sb.join(', ') + '.', 'Multiples of ' + a + ': ' + sa.join(', ') + '.', 'The first one in both: ' + B(L) + '.'];
      steps = [st('Count by ' + b + 's. What is the first one that ' + a + ' goes into?', L)]; }
    else { how = ['GCF of ' + a + ' and ' + b + ': ' + g + '.', 'LCM = ' + a + ' × ' + b + ' ÷ ' + g + ' = ' + a + ' ÷ ' + g + ' × ' + b + '.', '= ' + (a / g) + ' × ' + b + ' = ' + B(L) + '.'];
      steps = [st('What is the GCF of ' + B(a) + ' and ' + B(b) + '?', g), st(B(a + ' ÷ ' + g) + ' = ?', a / g), st(B((a / g) + ' × ' + b) + ' = ?', L)]; }
    return { text, ans: L, how, steps,
      traps: [tr(g > 1 ? a * b : null, 'fa_lcm', a * b + ' is a common multiple, but not the least. Divide by the GCF, ' + g + '.'), tr(g > 1 ? g : null, 'fa_gcf', 'That is the greatest common factor. The LCM is a multiple of both numbers.'), tr(b, 'fa_multiples', a + ' does not go into ' + b + '.')] };
  } },

{ id: 'fa_primefact', s: 'fact', g: 6, title: 'Prime factorization', pre: [], paper: true,
  tip: 'Split a number until every piece is prime. Divide by 2 while you can, then 3, then 5, … 360 = 2 × 2 × 2 × 3 × 3 × 5 = 2³ × 3² × 5.',
  gen(d, R) {
    const N = d === 0 ? R.i(12, 99) : d === 1 ? R.i(60, 400) : R.i(200, 1000), f = factorize(N), ps = Object.keys(f).map(Number).sort((x, y) => x - y), tot = C.sum(Object.values(f));
    if (tot < 3 || ps.length < 2 || ps[ps.length - 1] > 50) return null;
    const lad = []; let v = N;
    ps.forEach(p => { const chain = [v]; for (let i = 0; i < f[p]; i++) { v /= p; chain.push(v); } lad.push('Divide by ' + p + ' ' + (f[p] === 1 ? 'once' : f[p] === 2 ? 'twice' : f[p] + ' times') + ': ' + chain.join(' → ') + '.'); });
    const how = lad.slice(0, 2).concat(lad.length > 2 ? [lad.slice(2).join(' ')] : []);
    how.push(N + ' = ' + pfStr(N) + '.');
    const big = ps[ps.length - 1];
    const kind = d === 0 ? 'last' : d === 1 ? R.pick(['exp', 'big']) : R.pick(['count', 'exp']);
    if (kind === 'last') {
      const list = []; ps.forEach(p => { for (let i = 0; i < f[p]; i++) list.push(p); });
      how[how.length - 1] = N + ' = ' + list.join(' × ') + '.';
      return { text: B(N + ' = ' + list.slice(0, -1).join(' × ') + ' × ?') + ' (every factor is prime)', ans: big, how,
        steps: [st(B(N + ' ÷ ' + list.slice(0, -1).reduce((x, y) => x * y, 1)) + ' = ?', big)],
        traps: [tr(big * list[0] < N ? big * list[0] : null, 'fa_primefact', 'Keep splitting until every factor is prime.'), tr(list.length > 2 ? big * list[list.length - 2] : null, 'fa_primefact', 'The ? is just one prime. The others are already written.')] };
    }
    if (kind === 'big') return { text: 'What is the ' + B('largest prime factor') + ' of ' + B(N) + '?', ans: big, how,
      steps: [st('Divide out all the small primes. What is left at the end?', big)],
      traps: [tr(N / big > big && !isPrime(N / big) ? N / big : null, 'fa_prime', N / big + ' is not prime. Keep splitting.'), tr(ps.length > 1 ? ps[ps.length - 2] : null, 'fa_primefact', 'There is a bigger prime factor. Keep dividing to the end.'), tr(N / 2 % 1 === 0 ? N / 2 : null, 'fa_prime', N / 2 + ' is a factor, but not prime.')] };
    if (kind === 'exp') { const p = R.pick(ps.filter(q => f[q] > 1).concat(ps)), e = f[p];
      return { text: B(N) + ' = ' + ps.map(q => q === p ? pw(q, '?') : f[q] > 1 ? pw(q, f[q]) : q).join(' × ') + '. What is the missing power?', ans: e, how,
        steps: [st('How many times can you divide ' + B(N) + ' by ' + B(p) + '?', e)],
        traps: [tr(e + 1, 'fa_primefact', 'Count the divisions by ' + p + ' again.'), tr(e > 1 ? e - 1 : null, 'fa_primefact', 'Keep dividing by ' + p + ' while you can.'), tr(Math.pow(p, e), 'w_exp', 'The power counts how many ' + p + 's, not their product.')] }; }
    return { text: 'Write ' + B(N) + ' as a product of primes. How many prime factors are there, ' + B('counting repeats') + '?', ans: tot, how,
      steps: ps.slice(0, 3).map(p => st('How many times does ' + p + ' go in?', f[p])).concat([st('Add up the powers of all the primes: ?', tot)]),
      traps: [tr(ps.length, 'fa_primefact', 'Count repeats too: 2 × 2 is two prime factors.'), tr(factorsOf(N).length, 'fa_count', 'That counts all the factors. Count only the primes in the product.'), tr(tot - 1, 'fa_primefact', 'Check that every piece is prime.')] };
  } },

{ id: 'fa_units', s: 'fact', g: 6, title: 'Units digits', pre: [],
  tip: 'Only the ones digits decide the ones digit of a product. 347 × 286 ends in the same digit as 7 × 6 = 42: it ends in 2.',
  gen(d, R) {
    let nums;
    if (d === 0) nums = [R.i(12, 99), R.i(3, 9)];
    else if (d === 1) nums = [R.i(102, 999), R.i(12, 99)];
    else nums = R.chance(0.5) ? [R.i(12, 99), R.i(12, 99), R.i(12, 99)] : [R.i(101, 999), R.i(101, 999), R.i(2, 9)];
    if (nums.some(v => v % 10 < 2)) return null;
    const ones = nums.map(v => v % 10); let run = ones[0]; const chain = [];
    for (let i = 1; i < ones.length; i++) { const p = run * ones[i]; chain.push(run + ' × ' + ones[i] + ' = ' + p); run = p % 10; }
    const ans = run;
    const p0 = ones[0] * ones[1];
    return { text: 'What is the ' + B('last digit') + ' of ' + B(nums.map(nm).join(' × ')) + '?', ans,
      how: ['Only the ones digits matter: ' + ones.join(', ') + '.', chain.map((c, i) => c + (i < chain.length - 1 ? ', keep ' + (+c.split(' = ')[1] % 10) : '')).join('; ') + '.', 'The product ends in ' + B(ans) + '.'],
      steps: [st('Ones digits: ' + B(ones[0] + ' × ' + ones[1]) + ' = ?', p0)].concat(ones.length > 2 ? [st('Keep the last digit, ' + (p0 % 10) + ', and times by ' + ones[2] + ': ?', (p0 % 10) * ones[2])] : []).concat([st('So the last digit is ?', ans)]),
      traps: [tr(p0 >= 10 ? Math.floor(p0 / 10) : null, 'n_place', 'Use the ones digit of ' + p0 + ', not the tens.'), tr((ones[0] + ones[1]) % 10, 'fa_units', 'Multiply the ones digits, do not add them.'), tr(slip(ones[0], ones[1]).v % 10, factC(ones[0], ones[1]), 'Check the fact ' + ones[0] + ' × ' + ones[1] + '.')] };
  } },

{ id: 'fa_div11', s: 'fact', g: 7, title: 'Divisible by 11', pre: [],
  tip: 'Alternate the signs from the ones digit: + − + −. If the total is 0 or a multiple of 11, so is the number. 7,293: 3 − 9 + 2 − 7 = −11, so 11 goes in.',
  gen(d, R) {
    if (d === 2) {
      const N = R.i(1001, 99999), ds = String(N).split('').reverse().map(Number), s = ds.reduce((t, x, i) => t + (i % 2 ? -x : x), 0), r = ((s % 11) + 11) % 11;
      const terms = ds.map((x, i) => (i === 0 ? '' : i % 2 ? ' ' + MINUS + ' ' : ' + ') + x).join('');
      return { text: 'What is the remainder when ' + B(nm(N)) + ' is divided by ' + B(11) + '?', ans: r,
        how: ['From the ones digit, alternate + and ' + MINUS + ': ' + terms + ' = ' + num(s) + '.', s < 0 ? num(s) + ' + ' + (Math.ceil(-s / 11) * 11) + ' = ' + r + ', so the remainder is ' + B(r) + '.' : s + ' ÷ 11 leaves ' + B(r) + '.'],
        steps: [st('Alternating sum from the ones digit: ?', s), st('Remainder when that is divided by 11 (add 11 if it is below 0): ?', r)],
        traps: [tr(C.sum(ds) % 11, 'fa_div11', 'For 11 the signs alternate, + − + −, starting at the ones digit.'), tr(r ? 11 - r : null, 'fa_div11', 'Start with + at the ones digit, not at the first digit.'), tr(s >= 0 && s !== r ? s : null, 'fa_div11', 'Now find the remainder of ' + s + ' ÷ 11.')] };
    }
    const len = d === 0 ? 3 : 4, digits = Array.from({ length: len }, (_, i) => i === 0 ? R.i(1, 9) : R.i(0, 9)), pos = d === 0 ? 1 : R.i(0, len - 1);
    digits[pos] = 0; const sgn = i => ((len - 1 - i) % 2 ? -1 : 1), s0 = digits.reduce((t, x, i) => t + sgn(i) * x, 0);
    let need = -1; for (let x = (pos === 0 ? 1 : 0); x <= 9; x++) if ((s0 + sgn(pos) * x) % 11 === 0) need = x;
    if (need < 0) return null;
    digits[pos] = need; const N = +digits.join(''), shown = digits.map((x, i) => i === pos ? '_' : x).join('');
    const terms = digits.map((x, i) => i === pos ? '?' : x).reverse().map((x, i) => (i === 0 ? '' : i % 2 ? ' ' + MINUS + ' ' : ' + ') + x).join('');
    return { text: 'The number ' + B(shown) + ' is divisible by ' + B(11) + '. What digit is missing?', ans: need,
      how: ['From the ones digit, alternate + and ' + MINUS + ': ' + terms + ' must be 0 or a multiple of 11.', 'The digit that works is ' + B(need) + ': ' + nm(N) + ' = 11 × ' + nm(N / 11) + '.'],
      steps: [st('Alternating sum without the missing digit (from the ones digit): ?', s0), st('What digit makes the total 0 or a multiple of 11?', need)],
      traps: [tr(need !== Math.abs(s0) % 11 && Math.abs(s0) % 11 <= 9 ? Math.abs(s0) % 11 : null, 'fa_div11', 'Watch the sign of the missing digit\'s place.'), tr((9 - C.sum(digits) + need + 99) % 9 <= 9 && (11 - need) <= 9 ? 11 - need : null, 'fa_div11', 'Alternate the signs, starting with + at the ones digit.')] };
  } },

{ id: 'fa_count', s: 'fact', g: 8, title: 'Count factors from primes', pre: ['w_exp'], paper: true,
  tip: 'If n = 2³ × 3² × 5, a factor uses 0–3 twos, 0–2 threes and 0–1 fives: (3 + 1)(2 + 1)(1 + 1) = 24 factors. Add 1 to each power, then multiply.',
  gen(d, R) {
    let N;
    if (d === 0) N = R.pick([12, 18, 20, 28, 44, 45, 50, 52, 63, 75, 24, 40, 54, 56, 98, 99]);
    else if (d === 1) N = R.i(60, 500);
    else N = R.pick([360, 720, 840, 1000, 600, 900, 480, 1200, 1500, 1800, 2000, 504, 756]);
    const f = factorize(N), ps = Object.keys(f).map(Number).sort((x, y) => x - y), es = ps.map(p => f[p]);
    if (ps.length < 2 || (d === 1 && C.sum(es) < 3) || ps[ps.length - 1] > 40) return null;
    const cnt = es.reduce((t, e) => t * (e + 1), 1), given = d === 0;
    return { text: (given ? B(N) + ' = ' + pfStr(N) + '. ' : '') + 'How many factors does ' + B(N) + ' have?', ans: cnt,
      how: (given ? [] : [N + ' = ' + pfStr(N) + '.']).concat(['A factor chooses how many of each prime: ' + ps.map((p, i) => p + ': 0 to ' + es[i] + ' (' + (es[i] + 1) + ' choices)').join(', ') + '.', 'Multiply the choices: ' + es.map(e => '(' + e + ' + 1)').join(' × ') + ' = ' + es.map(e => e + 1).join(' × ') + ' = ' + B(cnt) + '.']),
      steps: (given ? [] : [st('How many 2s are in ' + B(N) + '? (Type 0 if none.)', f[2] || 0)]).concat([st('Choices for each prime, multiplied: ' + B(es.map(e => (e + 1)).join(' × ')) + ' = ?', cnt)]),
      traps: [tr(es.reduce((t, e) => t * e, 1), 'fa_count', 'Add 1 to each power: a factor can also use none of that prime.'), tr(es.reduce((t, e) => t + e + 1, 0), 'fa_count', 'Multiply the choices, do not add them.'), tr(C.sum(es) + 1, 'fa_count', 'Each prime gives its own choices. Multiply them.')] };
  } },

{ id: 'fa_mod', s: 'fact', g: 8, title: 'Remainder tricks', pre: ['m_remain'],
  tip: 'The remainder of a sum or product only depends on the remainders. 47 × 53 ÷ 5: 47 leaves 2, 53 leaves 3, 2 × 3 = 6 leaves 1. So the answer is 1.',
  gen(d, R) {
    const m = R.i(3, 9);
    if (d === 2 && R.chance(0.6)) {
      const r1 = R.i(2, m - 1), r2 = R.i(2, m - 1), op = R.pick(['×', '+', 'sq']), raw = op === '×' ? r1 * r2 : op === '+' ? r1 + r2 : r1 * r1, ans = raw % m;
      const qText = op === 'sq' ? 'What is the remainder when ' + B('a × a') + ' is divided by ' + m + '?' : 'What is the remainder when ' + B('a ' + op + ' b') + ' is divided by ' + m + '?';
      return { text: B('a') + ' leaves ' + B(r1) + ' when divided by ' + B(m) + (op === 'sq' ? '. ' : ', and ' + B('b') + ' leaves ' + B(r2) + '. ') + qText, ans,
        how: ['Only the remainders matter: use ' + (op === 'sq' ? r1 + ' × ' + r1 : r1 + ' ' + op + ' ' + r2) + ' = ' + raw + '.', raw + ' ÷ ' + m + ' leaves ' + B(ans) + '.'],
        steps: [st(B(op === 'sq' ? r1 + ' × ' + r1 : r1 + ' ' + op + ' ' + r2) + ' = ?', raw), st('Remainder of ' + B(raw + ' ÷ ' + m) + ' = ?', ans)],
        traps: [tr(raw >= m ? raw : null, 'fa_mod', raw + ' is more than ' + m + '. Take out ' + m + 's to get the remainder.'), tr(op === '×' ? (r1 + r2) % m : op === '+' ? (r1 * r2) % m : (2 * r1) % m, 'fa_mod', op === '+' ? 'This one is adding.' : 'Multiply the remainders.')] };
    }
    const a = R.i(12, d === 0 ? 60 : 99), b = R.i(12, d === 0 ? 60 : 99), mul = d >= 1, ra = a % m, rb = b % m, raw = mul ? ra * rb : ra + rb, ans = raw % m, op = mul ? ' × ' : ' + ';
    if (ra < 2 || rb < 2) return null;
    return { text: 'What is the remainder when ' + B(a + op + b) + ' is divided by ' + B(m) + '?', ans,
      how: [a + ' leaves ' + ra + ' and ' + b + ' leaves ' + rb + ' when divided by ' + m + '.', 'Use the remainders: ' + ra + op + rb + ' = ' + raw + (raw >= m ? ', which leaves ' + B(ans) + '.' : ', so the answer is ' + B(ans) + '.')],
      steps: [st('Remainder of ' + B(a + ' ÷ ' + m) + ' = ?', ra), st('Remainder of ' + B(b + ' ÷ ' + m) + ' = ?', rb), st(B(ra + op + rb) + ' = ' + raw + '. Its remainder ÷ ' + m + ' = ?', ans)],
      traps: [tr(raw >= m ? raw : null, 'fa_mod', raw + ' is ' + m + ' or more. Take out ' + m + 's to get the remainder.'), tr(mul ? (ra + rb) % m : (ra * rb) % m, 'fa_mod', mul ? 'Multiply the remainders.' : 'Add the remainders.'), tr(m - ans, 'm_remain', 'That is how far to the next multiple. The remainder is what is left over.')] };
  } },

/* =================== Measuring & Shapes =================== */
{ id: 'g_perim', s: 'meas', g: 3, title: 'Perimeter', pre: ['a_split'],
  tip: 'Perimeter is the distance all the way around: add the sides. A rectangle has two lengths and two widths, so add one of each and double it.',
  gen(d, R) {
    if (d === 2 && R.chance(0.5)) {
      const sq = R.chance(0.35), l = R.i(4, 20), w = sq ? l : R.i(2, l - 1), P = 2 * (l + w);
      if (sq) return { text: 'A square has a perimeter of ' + B(P + ' cm') + '. How long is each side?', ans: l, unit: 'cm',
        how: ['A square has 4 equal sides.', P + ' ÷ 4 = ' + B(l) + ' cm.'],
        steps: [st('How many equal sides does a square have?', 4), st(B(P + ' ÷ 4') + ' = ?', l, { unit: 'cm' })],
        traps: [tr(P / 2, 'g_perim', 'A square has 4 sides, not 2.'), tr(P - 4, 'g_perim', 'Share the perimeter equally among the 4 sides: divide.')] };
      return { text: 'A rectangle has a perimeter of ' + B(P + ' cm') + '. Its length is ' + B(l + ' cm') + '. How wide is it?', ans: w, unit: 'cm', vis: rectSVG(l, w, { w: l + ' cm', h: '?' }),
        how: ['Half the perimeter is one length plus one width: ' + P + ' ÷ 2 = ' + (l + w) + '.', 'Width = ' + (l + w) + ' ' + MINUS + ' ' + l + ' = ' + B(w) + ' cm.'],
        steps: [st('One length + one width = half the perimeter: ' + B(P + ' ÷ 2') + ' = ?', l + w), st(B((l + w) + ' ' + MINUS + ' ' + l) + ' = ?', w, { unit: 'cm' })],
        traps: [tr(P - l, 'g_perim', 'The perimeter has two lengths. Take half first.'), tr(P - 2 * l, 'g_perim', 'That is both widths together. You want one.'), tr(P % l === 0 ? P / l : null, 'g_area', 'That is how area works. Perimeter adds the sides.')] };
    }
    if (d === 1 && R.chance(0.5)) {
      if (R.chance(0.5)) { const s = R.i(3, 25), P = 4 * s;
        return { text: 'A square has sides of ' + B(s + ' cm') + '. What is its perimeter?', ans: P, unit: 'cm', vis: rectSVG(5, 5, { w: s + ' cm', h: s + ' cm' }),
          how: ['A square has 4 equal sides.', '4 × ' + s + ' = ' + B(P) + ' cm.'],
          steps: [st(B('4 × ' + s) + ' = ?', P, { unit: 'cm' })],
          traps: [tr(2 * s, 'g_perim', 'Go all the way around: 4 sides.'), tr(s * s, 'g_area', 'That is the area. Perimeter adds the sides.')] }; }
      const a = R.i(3, 15), b = R.i(3, 15), c = R.i(Math.abs(a - b) + 1, a + b - 1), P = a + b + c;
      return { text: 'A triangle has sides of ' + B(a + ' cm') + ', ' + B(b + ' cm') + ' and ' + B(c + ' cm') + '. What is its perimeter?', ans: P, unit: 'cm',
        how: ['Add all three sides.', a + ' + ' + b + ' + ' + c + ' = ' + B(P) + ' cm.'],
        steps: [st(B(a + ' + ' + b) + ' = ?', a + b), st(B((a + b) + ' + ' + c) + ' = ?', P, { unit: 'cm' })],
        traps: [tr(P - 10, 'a_regroup', 'Check the carrying when you add.'), tr(a + b, 'g_perim', 'Add all three sides.')] };
    }
    const l = d === 0 ? R.i(3, 9) : R.i(8, 30), w = d === 0 ? R.i(1, l - 1) : R.i(3, l - 1), P = 2 * (l + w);
    return { text: 'What is the perimeter of the rectangle?', ans: P, unit: 'cm', vis: rectSVG(l, w, { w: l + ' cm', h: w + ' cm', grid: d === 0 }),
      how: ['Go around: ' + l + ' + ' + w + ' + ' + l + ' + ' + w + '. One length and one width make half the way: ' + l + ' + ' + w + ' = ' + (l + w) + '.', 'Double it: 2 × ' + (l + w) + ' = ' + B(P) + ' cm.'],
      steps: [st(B(l + ' + ' + w) + ' = ?', l + w), st(B('2 × ' + (l + w)) + ' = ?', P, { unit: 'cm' })],
      traps: [tr(l + w, 'g_perim', 'That is only halfway around. There are two lengths and two widths.'), tr(l * w, 'g_area', 'That is the area, the squares inside. Perimeter goes around the edge.'), tr(2 * l + w, 'g_perim', 'Count all four sides.')] };
  } },

{ id: 'g_area', s: 'meas', g: 3, title: 'Area of a rectangle', pre: ['m_groups'],
  tip: 'Area counts the squares inside. A rectangle is rows of squares: 4 rows of 6 squares is 4 × 6 = 24 square units.',
  gen(d, R) {
    if (d === 2 && R.chance(0.6)) {
      if (R.chance(0.4)) { const s = R.i(2, 12), P = 4 * s, A = s * s;
        return { text: 'A square has a perimeter of ' + B(P + ' cm') + '. What is its area?', ans: A, unit: 'square cm',
          how: ['Each side is ' + P + ' ÷ 4 = ' + s + ' cm.', 'Area = ' + s + ' × ' + s + ' = ' + B(A) + ' square cm.'],
          steps: [st('Side: ' + B(P + ' ÷ 4') + ' = ?', s, { unit: 'cm' }), st(B(s + ' × ' + s) + ' = ?', A, { unit: 'square cm' })],
          traps: [tr(P, 'g_perim', 'That is the perimeter. Find the side, then multiply.'), tr(4 * P, 'g_area', 'Find one side first: ' + P + ' ÷ 4.'), tr(2 * s, 'g_area', 'Area is side × side.')] }; }
      const l = R.i(3, 12), w = R.i(2, 12), A = l * w;
      return { text: 'A rectangle has an area of ' + B(A + ' square cm') + '. One side is ' + B(l + ' cm') + '. How long is the other side?', ans: w, unit: 'cm', vis: rectSVG(l, w, { w: l + ' cm', h: '?' }),
        how: ['Area = side × side, so ' + l + ' × ? = ' + A + '.', A + ' ÷ ' + l + ' = ' + B(w) + ' cm.'],
        steps: [st(B(l + ' × ? = ' + A), w, { unit: 'cm' })],
        traps: [tr(A - l, 'g_area', 'Area comes from multiplying, so undo it by dividing.'), tr(A / 2 - l > 0 ? A / 2 - l : null, 'g_perim', 'That treats ' + A + ' like a perimeter. It is an area.'), slip(l, w, 1, 'Check: ' + l + ' × your answer should be ' + A + '.')] };
    }
    const l = d === 0 ? R.i(2, 6) : R.i(4, 12), w = d === 0 ? R.i(2, 5) : R.i(3, 10), A = l * w;
    return { text: d === 0 ? 'How many squares cover the rectangle?' : 'What is the area of the rectangle?', ans: A, unit: d === 0 ? 'squares' : 'square cm', vis: rectSVG(l, w, d === 0 ? { grid: true } : { w: l + ' cm', h: w + ' cm' }),
      how: ['There are ' + w + ' rows with ' + l + ' squares in each row.', w + ' × ' + l + ' = ' + B(A) + (d === 0 ? ' squares.' : ' square cm.')],
      steps: [st('How many squares in one row?', l), st('How many rows?', w), st(B(w + ' × ' + l) + ' = ?', A)],
      traps: [tr(2 * (l + w), 'g_perim', 'That is the perimeter, around the edge. Area counts the squares inside.'), tr(l + w, 'g_area', 'Multiply the rows by the squares in each row.'), slip(l, w)] };
  } },

{ id: 'g_custom', s: 'meas', g: 3, title: 'Inches, feet, cups, gallons', pre: ['m_x2510'],
  tip: '12 inches = 1 foot, 3 feet = 1 yard. 2 cups = 1 pint, 2 pints = 1 quart, 4 quarts = 1 gallon. Big unit to small: multiply. Small to big: divide.',
  gen(d, R) {
    const U = d === 0 ? [['foot', 'feet', 'inches', 12], ['yard', 'yards', 'feet', 3], ['pint', 'pints', 'cups', 2], ['quart', 'quarts', 'pints', 2], ['gallon', 'gallons', 'quarts', 4]]
      : d === 1 ? [['foot', 'feet', 'inches', 12], ['gallon', 'gallons', 'pints', 8], ['quart', 'quarts', 'cups', 4], ['yard', 'yards', 'feet', 3]] : [['yard', 'yards', 'inches', 36], ['gallon', 'gallons', 'cups', 16], ['gallon', 'gallons', 'pints', 8], ['foot', 'feet', 'inches', 12]];
    const [one, many, small, f] = R.pick(U), n = R.i(2, d === 0 ? 6 : 9), N = n * f;
    const chainF = { 8: '1 gallon = 4 quarts, and each quart = 2 pints: 4 × 2 = 8 pints', 16: '1 gallon = 4 quarts = 8 pints = 16 cups', 36: '1 yard = 3 feet = 3 × 12 = 36 inches', 4: '1 quart = 2 pints = 4 cups' }[f];
    const fact = (f === 4 && small === 'cups') || f === 8 || f === 16 || f === 36 ? chainF + '.' : '1 ' + one + ' = ' + f + ' ' + small + '.';
    const kind = d === 0 ? 'down' : d === 1 ? R.pick(['down', 'up', 'mix']) : R.pick(['down', 'up', 'up']);
    if (kind === 'up') return { text: B(N + ' ' + small) + ' = how many ' + B(many) + '?', ans: n,
      how: [fact, 'Small units to big units: divide. ' + N + ' ÷ ' + f + ' = ' + B(n) + ' ' + many + '.'],
      steps: [st('How many ' + small + ' in 1 ' + one + '?', f), st(B(N + ' ÷ ' + f) + ' = ?', n)],
      traps: [tr(N * f, 'g_custom', 'Going to a bigger unit gives a smaller number: divide.'), tr(f === 12 ? N / 10 : null, 'g_custom', 'There are 12 inches in a foot, not 10.'), tr(N - f, 'g_custom', 'Find how many groups of ' + f + ': divide.')] };
    if (kind === 'mix') { const extra = R.i(1, f - 1), T = N + extra;
      const sing = { inches: 'inch', feet: 'foot', cups: 'cup', pints: 'pint', quarts: 'quart' }, ex = extra + ' ' + (extra === 1 ? sing[small] : small);
      return { text: B(n + ' ' + many + ' ' + ex) + ' = how many ' + B(small) + '?', ans: T,
        how: [fact + ' So ' + n + ' ' + many + ' = ' + n + ' × ' + f + ' = ' + N + ' ' + small + '.', 'Add the ' + extra + ' more: ' + N + ' + ' + extra + ' = ' + B(T) + ' ' + small + '.'],
        steps: [st(B(n + ' × ' + f) + ' = ?', N), st(B(N + ' + ' + extra) + ' = ?', T)],
        traps: [tr(N, 'g_custom', 'Add the extra ' + ex + ' too.'), tr(n * 10 + extra, 'g_custom', 'These units are not tens: 1 ' + one + ' is ' + f + ' ' + small + '.'), tr(n + extra, 'g_custom', 'Change the ' + many + ' to ' + small + ' first: multiply by ' + f + '.')] }; }
    return { text: B(n + ' ' + many) + ' = how many ' + B(small) + '?', ans: N,
      how: [fact, 'Big units to small units: multiply. ' + n + ' × ' + f + ' = ' + B(N) + ' ' + small + '.'],
      steps: [st('How many ' + small + ' in 1 ' + one + '?', f), st(B(n + ' × ' + f) + ' = ?', N)],
      traps: [tr(n * 10, 'g_custom', 'These units are not tens: 1 ' + one + ' is ' + f + ' ' + small + '.'), tr(n + f, 'g_custom', 'Each ' + one + ' is ' + f + ' ' + small + ': multiply.'), f <= 12 ? slip(n, f) : null] };
  } },

{ id: 'g_metric', s: 'meas', g: 4, title: 'Metric units', pre: ['n_times10'],
  tip: 'Metric units go by 10s: 1 cm = 10 mm, 1 m = 100 cm, 1 km = 1,000 m, 1 kg = 1,000 g, 1 L = 1,000 mL. Big to small: multiply (the point hops right).',
  gen(d, R) {
    const [big, small, f] = R.pick([['m', 'cm', 100], ['km', 'm', 1000], ['cm', 'mm', 10], ['kg', 'g', 1000], ['L', 'mL', 1000], ['m', 'mm', 1000]]), z = String(f).length - 1;
    const kind = d === 0 ? 'down' : d === 1 ? R.pick(['up', 'mix', 'down']) : R.pick(['ddown', 'dup', 'dup']);
    if (kind === 'down') { const n = R.i(2, d === 0 ? 9 : 40), N = n * f;
      return { text: B(n + ' ' + big) + ' = how many ' + B(small) + '?', ans: N,
        how: ['1 ' + big + ' = ' + nm(f) + ' ' + small + '. Big unit to small unit: multiply.', n + ' × ' + nm(f) + ' = ' + B(nm(N)) + ' ' + small + ' (add ' + z + ' ' + plural(z, 'zero') + ').'],
        steps: [st('How many ' + small + ' in 1 ' + big + '?', f), st(B(n + ' × ' + nm(f)) + ' = ?', N)],
        traps: [tr(n * f / 10 !== n ? n * f / 10 : null, 'g_metric', '1 ' + big + ' = ' + nm(f) + ' ' + small + '. Count the zeros.'), tr(n * f * 10, 'g_metric', '1 ' + big + ' = ' + nm(f) + ' ' + small + '. Count the zeros.'), tr(dv(n, z), 'n_times10', 'A smaller unit means more of them: multiply.')] }; }
    if (kind === 'up') { const n = R.i(2, 30), N = n * f;
      return { text: B(nm(N) + ' ' + small) + ' = how many ' + B(big) + '?', ans: n,
        how: ['1 ' + big + ' = ' + nm(f) + ' ' + small + '. Small unit to big unit: divide.', nm(N) + ' ÷ ' + nm(f) + ' = ' + B(n) + ' ' + big + ' (take off ' + z + ' ' + plural(z, 'zero') + ').'],
        steps: [st('How many ' + small + ' in 1 ' + big + '?', f), st(B(nm(N) + ' ÷ ' + nm(f)) + ' = ?', n)],
        traps: [tr(N * f, 'n_times10', 'A bigger unit means fewer of them: divide.'), tr(n * 10, 'g_metric', '1 ' + big + ' = ' + nm(f) + ' ' + small + '. Take off ' + z + ' zeros.'), tr(f > 10 ? n / 10 : null, 'g_metric', '1 ' + big + ' = ' + nm(f) + ' ' + small + '. Take off ' + z + ' zeros.')] }; }
    if (kind === 'mix') { const n = R.i(1, 9), e = R.i(1, f - 1), T = n * f + e;
      return { text: B(n + ' ' + big + ' ' + e + ' ' + small) + ' = how many ' + B(small) + '?', ans: T,
        how: [n + ' ' + big + ' = ' + n + ' × ' + nm(f) + ' = ' + nm(n * f) + ' ' + small + '.', nm(n * f) + ' + ' + e + ' = ' + B(nm(T)) + ' ' + small + '.'],
        steps: [st(B(n + ' ' + big) + ' = ? ' + small, n * f), st(B(nm(n * f) + ' + ' + e) + ' = ?', T)],
        traps: [tr(n + e, 'g_metric', 'Change the ' + big + ' to ' + small + ' first.'), tr(+('' + n + e) !== T ? +('' + n + e) : null, 'g_metric', '1 ' + big + ' is ' + nm(f) + ' ' + small + '. Do not just write the numbers side by side.')] }; }
    const p = R.i(1, 2), k = R.i(11, 99) * (p === 2 ? 1 : 1); if (k % 10 === 0) return null;
    if (kind === 'ddown') { const v = dv(k, p), ans = k * f / P10[p];
      if (ans % 1 && z < p) return null;
      return { text: B(num(v) + ' ' + big) + ' = how many ' + B(small) + '?', ans,
        how: ['1 ' + big + ' = ' + nm(f) + ' ' + small + '. Big to small: × ' + nm(f) + ', so the point hops ' + z + ' ' + plural(z, 'place') + ' right.', num(v) + ' → ' + B(num(ans)) + ' ' + small + '.'],
        steps: [st('How many places does the point hop?', z), st(B(num(v) + ' × ' + nm(f)) + ' = ?', ans)],
        traps: [tr(ans / 10, 'g_metric', '1 ' + big + ' = ' + nm(f) + ' ' + small + ': hop ' + z + ' places.'), tr(ans * 10, 'g_metric', '1 ' + big + ' = ' + nm(f) + ' ' + small + ': hop ' + z + ' places.'), tr(dv(k, p + z), 'n_times10', 'A smaller unit means more of them: the number gets bigger.')] }; }
    const N = k * P10[R.i(0, 1)], ans = N / f;
    return { text: B(nm(N) + ' ' + small) + ' = how many ' + B(big) + '?', ans,
      how: ['1 ' + big + ' = ' + nm(f) + ' ' + small + '. Small to big: ÷ ' + nm(f) + ', so the point hops ' + z + ' ' + plural(z, 'place') + ' left.', nm(N) + ' → ' + B(num(ans)) + ' ' + big + '.'],
      steps: [st('How many places does the point hop left?', z), st(B(nm(N) + ' ÷ ' + nm(f)) + ' = ?', ans)],
      traps: [tr(ans * 10, 'g_metric', '1 ' + big + ' = ' + nm(f) + ' ' + small + ': hop ' + z + ' places.'), tr(ans / 10, 'g_metric', '1 ' + big + ' = ' + nm(f) + ' ' + small + ': hop ' + z + ' places.'), tr(N * f, 'n_times10', 'A bigger unit means fewer of them: divide.')] };
  } },

{ id: 'g_areaL', s: 'meas', g: 4, title: 'Area of L-shapes', pre: [], paper: true,
  tip: 'Cut the L into two rectangles and add their areas. Or take the big rectangle and subtract the missing corner. Both give the same answer.',
  gen(d, R) {
    const W = R.i(5, d === 0 ? 10 : 16), H = R.i(5, d === 0 ? 10 : 14), cw = R.i(2, W - 2), ch = R.i(2, H - 2), top = W - cw, right = H - ch;
    const A = W * H - cw * ch, A1 = top * H, A2 = cw * right;
    const pts = [[0, 0], [W, 0], [W, right], [top, right], [top, H], [0, H]];
    const labs = [{ a: [W / 2, 0], t: W, dy: 18 }, { a: [0, H / 2], t: H, dx: -8, anc: 'end' }, { a: [top / 2, H], t: top, dy: -10 }, { a: [W, right / 2], t: right, dx: 8, anc: 'start' }];
    if (d === 0) labs.push({ a: [top + cw / 2, right], t: cw, dy: -10 }, { a: [top, right + ch / 2], t: ch, dx: 6, anc: 'start' });
    const vis = polySVG(pts, labs);
    if (d === 2 && R.chance(0.4)) {
      const P = 2 * (W + H);
      return { text: 'Find the ' + B('perimeter') + ' of the shape. All lengths are in cm.', ans: P, unit: 'cm', vis,
        how: ['The two missing sides are ' + W + ' ' + MINUS + ' ' + top + ' = ' + cw + ' and ' + H + ' ' + MINUS + ' ' + right + ' = ' + ch + '.', 'Add all six sides: ' + [W, H, top, ch, cw, right].join(' + ') + ' = ' + B(P) + ' cm.', 'Shortcut: the inside corner sides slide out to make a ' + W + ' by ' + H + ' rectangle, so it is 2 × (' + W + ' + ' + H + ').'],
        steps: [st('Missing top-right side across: ' + B(W + ' ' + MINUS + ' ' + top) + ' = ?', cw), st('Missing side going down: ' + B(H + ' ' + MINUS + ' ' + right) + ' = ?', ch), st('Add all six sides: ?', P, { unit: 'cm' })],
        traps: [tr(W + H + top + right, 'g_areaL', 'There are six sides. Find the two that are not labelled.'), tr(A, 'g_areaL', 'That is the area. Perimeter goes around the edge.')] };
    }
    if (d === 2) return { text: 'Find the ' + B('area') + ' of the shape. All lengths are in cm.', ans: A, unit: 'square cm', vis,
      how: ['Big rectangle: ' + W + ' × ' + H + ' = ' + (W * H) + '.', 'Missing corner: (' + W + ' ' + MINUS + ' ' + top + ') × (' + H + ' ' + MINUS + ' ' + right + ') = ' + cw + ' × ' + ch + ' = ' + (cw * ch) + '.', 'Area = ' + (W * H) + ' ' + MINUS + ' ' + (cw * ch) + ' = ' + B(A) + ' square cm.'],
      steps: [st('Big rectangle: ' + B(W + ' × ' + H) + ' = ?', W * H), st('Missing corner: ' + B(cw + ' × ' + ch) + ' = ?', cw * ch), st(B((W * H) + ' ' + MINUS + ' ' + (cw * ch)) + ' = ?', A, { unit: 'square cm' })],
      traps: [tr(W * H, 'g_areaL', 'The top-right corner is cut out. Take it away.'), tr(top * H + cw * H, 'g_areaL', 'The right part is only ' + right + ' tall, not ' + H + '.'), tr(W + H + top + right + cw + ch, 'g_perim', 'That adds the sides: the perimeter. Area is the space inside.')] };
    return { text: 'Find the ' + B('area') + ' of the shape. All lengths are in cm.', ans: A, unit: 'square cm', vis,
      how: (d === 1 ? ['Missing side across the top right: ' + W + ' ' + MINUS + ' ' + top + ' = ' + cw + '.'] : []).concat(['Cut it into two rectangles: left ' + top + ' × ' + H + ' = ' + A1 + '.', 'Right ' + cw + ' × ' + right + ' = ' + A2 + '.', 'Area = ' + A1 + ' + ' + A2 + ' = ' + B(A) + ' square cm.']),
      steps: (d === 1 ? [st('Missing side: ' + B(W + ' ' + MINUS + ' ' + top) + ' = ?', cw)] : []).concat([st('Left rectangle: ' + B(top + ' × ' + H) + ' = ?', A1), st('Right rectangle: ' + B(cw + ' × ' + right) + ' = ?', A2), st(B(A1 + ' + ' + A2) + ' = ?', A, { unit: 'square cm' })]),
      traps: [tr(W * H, 'g_areaL', 'The top-right corner is cut out, so the area is less than ' + W + ' × ' + H + '.'), tr(top * H + cw * H, 'g_areaL', 'The right part is only ' + right + ' tall, not ' + H + '.'), tr(W + H + top + right + cw + ch, 'g_perim', 'That adds the sides: the perimeter. Area is the space inside.')] };
  } },

{ id: 'g_angles', s: 'meas', g: 4, title: 'Angles', pre: [],
  tip: 'A right angle is 90°, a straight line is 180°, a full turn is 360°. Missing angle? Take the angles you know away from the total.',
  gen(d, R) {
    const kind = d === 0 ? R.pick(['right', 'straight']) : d === 1 ? R.pick(['straight', 'full', 'turn', 'right']) : R.pick(['clock', 'full', 'straight3', 'turn']);
    if (kind === 'turn') { const t = d === 1 ? R.pick([[1, 4], [1, 2], [3, 4]]) : R.pick([[1, 3], [2, 3], [1, 6], [5, 6], [1, 8], [3, 8], [5, 12], [1, 12]]), ans = 360 * t[0] / t[1];
      return { text: 'How many degrees is ' + B(frac(t[0], t[1]) + ' of a full turn') + '?', ans, unit: DEG,
        how: ['A full turn is 360' + DEG + '. ' + frac(1, t[1]) + ' of a turn is 360 ÷ ' + t[1] + ' = ' + (360 / t[1]) + DEG + '.', t[0] > 1 ? t[0] + ' × ' + (360 / t[1]) + ' = ' + B(ans) + DEG + '.' : 'So it is ' + B(ans) + DEG + '.'],
        steps: [st(B('360 ÷ ' + t[1]) + ' = ?', 360 / t[1], { unit: DEG })].concat(t[0] > 1 ? [st(B(t[0] + ' × ' + (360 / t[1])) + ' = ?', ans, { unit: DEG })] : []),
        traps: [tr(180 * t[0] / t[1], 'g_angles', 'A full turn is 360' + DEG + ', not 180' + DEG + '.'), tr(t[0] > 1 ? 360 / t[1] : null, 'f_of', 'That is ' + frac(1, t[1]) + ' of a turn. You need ' + t[0] + ' of those.'), tr(100 * t[0] / t[1] % 1 === 0 ? 100 * t[0] / t[1] : null, 'g_angles', 'A full turn is 360' + DEG + '.')] }; }
    if (kind === 'clock') { const h = R.i(1, 11), k = Math.min(h, 12 - h), ans = 30 * k;
      return { text: 'At ' + B(h + ':00') + ', what is the smaller angle between the clock hands?', ans, unit: DEG, vis: C.clockSVG(h, 0, { cls: 'sm' }),
        how: ['12 numbers share 360' + DEG + ', so each step between numbers is 360 ÷ 12 = 30' + DEG + '.', 'The hands are ' + k + ' ' + plural(k, 'step') + ' apart: ' + k + ' × 30 = ' + B(ans) + DEG + '.'],
        steps: [st('Degrees between two numbers on a clock: ' + B('360 ÷ 12') + ' = ?', 30, { unit: DEG }), st('How many steps apart are the hands (the short way)?', k), st(B(k + ' × 30') + ' = ?', ans, { unit: DEG })],
        traps: [tr(k * 5 !== ans ? k * 5 : null, 'g_angles', 'Count degrees, not minutes: each step is 30' + DEG + '.'), tr(360 - ans !== ans ? 360 - ans : null, 'g_angles', 'That is the bigger angle. Go the short way.'), tr(k * 10, 'g_angles', 'Each step between numbers is 360 ÷ 12 = 30' + DEG + '.')] }; }
    if (kind === 'full') { const a = R.i(40, 170), b = R.i(40, 170), ans = 360 - a - b; if (ans < 30) return null;
      return { text: 'Three angles meet at a point and make a full turn. Two are ' + B(deg(a)) + ' and ' + B(deg(b)) + '. What is the third?', ans, unit: DEG,
        how: ['A full turn is 360' + DEG + '. The two you know: ' + a + ' + ' + b + ' = ' + (a + b) + DEG + '.', '360 ' + MINUS + ' ' + (a + b) + ' = ' + B(ans) + DEG + '.'],
        steps: [st(B(a + ' + ' + b) + ' = ?', a + b, { unit: DEG }), st(B('360 ' + MINUS + ' ' + (a + b)) + ' = ?', ans, { unit: DEG })],
        traps: [tr(180 - a - b > 0 ? 180 - a - b : null, 'g_angles', 'All the way around a point is 360' + DEG + ', not 180' + DEG + '.'), tr((a + b) % 10 ? ans + 10 : null, 'a_borrow', 'Check your taking away: trade a ten for ones.'), tr(a % 10 + b % 10 >= 10 ? ans + 10 : null, 'a_regroup', 'Check your adding. Did you carry?')] }; }
    if (kind === 'straight3') { const a = R.i(20, 80), b = R.i(20, 80), ans = 180 - a - b;
      return { text: 'Three angles sit on a straight line. Two are ' + B(deg(a)) + ' and ' + B(deg(b)) + '. What is the third?', ans, unit: DEG,
        how: ['A straight line is 180' + DEG + '. The two you know: ' + a + ' + ' + b + ' = ' + (a + b) + DEG + '.', '180 ' + MINUS + ' ' + (a + b) + ' = ' + B(ans) + DEG + '.'],
        steps: [st(B(a + ' + ' + b) + ' = ?', a + b, { unit: DEG }), st(B('180 ' + MINUS + ' ' + (a + b)) + ' = ?', ans, { unit: DEG })],
        traps: [tr(360 - a - b, 'g_angles', 'A straight line is 180' + DEG + ', not 360' + DEG + '.'), tr(90 - a - b > 0 ? 90 - a - b : null, 'g_angles', 'A straight line is 180' + DEG + '.')] }; }
    const tot = kind === 'right' ? 90 : 180, a = d === 0 ? 5 * R.i(2, tot / 5 - 2) : R.i(11, tot - 11), ans = tot - a;
    return { text: (kind === 'right' ? 'A right angle is split into two parts.' : 'A straight line is split into two angles.') + ' One is ' + B(deg(a)) + '. What is the other?', ans, unit: DEG, vis: splitAngleSVG(tot, ans, '?', deg(a)),
      how: [(kind === 'right' ? 'A right angle is 90' : 'A straight line is 180') + DEG + '.', tot + ' ' + MINUS + ' ' + a + ' = ' + B(ans) + DEG + '.'],
      steps: [st('How many degrees in ' + (kind === 'right' ? 'a right angle' : 'a straight line') + '?', tot, { unit: DEG }), st(B(tot + ' ' + MINUS + ' ' + a) + ' = ?', ans, { unit: DEG })],
      traps: [tr(kind === 'right' ? 180 - a : (a < 90 ? 90 - a : null), 'g_angles', kind === 'right' ? 'A right angle is 90' + DEG + ', not 180' + DEG + '.' : 'A straight line is 180' + DEG + ', not 90' + DEG + '.'), tr(360 - a, 'g_angles', 'That uses a full turn, 360' + DEG + '.'), tr(a % 10 ? ans + 10 : null, 'a_borrow', 'Check your taking away: trade a ten for ones.')] };
  } },

{ id: 'g_triangle', s: 'meas', g: 5, title: 'Angles in a triangle', pre: [],
  tip: 'The three angles of any triangle add to 180°. Missing angle = 180° minus the other two. In a right triangle the other two add to 90°.',
  gen(d, R) {
    const kind = d === 0 ? 'two' : d === 1 ? R.pick(['right', 'iso', 'two']) : R.pick(['isobase', 'ext', 'iso']);
    if (kind === 'right') { const a = R.i(15, 75), ans = 90 - a;
      return { text: 'A right triangle has one angle of ' + B(deg(a)) + '. What is the third angle?', ans, unit: DEG, vis: triSVG('', '', '', { angle: deg(a) }),
        how: ['The right angle is 90' + DEG + ', so the other two add to 180 ' + MINUS + ' 90 = 90' + DEG + '.', '90 ' + MINUS + ' ' + a + ' = ' + B(ans) + DEG + '.'],
        steps: [st('The other two angles add to ?', 90, { unit: DEG }), st(B('90 ' + MINUS + ' ' + a) + ' = ?', ans, { unit: DEG })],
        traps: [tr(180 - a, 'g_triangle', 'Do not forget the right angle: 90 + ' + a + ' + ? = 180.'), tr(360 - 90 - a, 'g_triangle', 'Triangle angles add to 180' + DEG + ', not 360' + DEG + '.')] }; }
    if (kind === 'iso') { const top = 2 * R.i(10, 70), ans = (180 - top) / 2;
      return { text: 'An isosceles triangle has two equal angles. The other angle is ' + B(deg(top)) + '. What is each equal angle?', ans, unit: DEG,
        how: ['The two equal angles share 180 ' + MINUS + ' ' + top + ' = ' + (180 - top) + DEG + '.', 'Each one is ' + (180 - top) + ' ÷ 2 = ' + B(ans) + DEG + '.'],
        steps: [st(B('180 ' + MINUS + ' ' + top) + ' = ?', 180 - top, { unit: DEG }), st(B((180 - top) + ' ÷ 2') + ' = ?', ans, { unit: DEG })],
        traps: [tr(180 - top, 'g_triangle', 'That is both equal angles together. Share it between the two.'), tr(top, 'g_triangle', 'The other two angles are equal to each other, not to ' + top + DEG + '.')] }; }
    if (kind === 'isobase') { const b = R.i(25, 85), ans = 180 - 2 * b;
      return { text: 'An isosceles triangle has two equal angles of ' + B(deg(b)) + '. What is the third angle?', ans, unit: DEG,
        how: ['The two equal angles: ' + b + ' + ' + b + ' = ' + (2 * b) + DEG + '.', '180 ' + MINUS + ' ' + (2 * b) + ' = ' + B(ans) + DEG + '.'],
        steps: [st(B(b + ' + ' + b) + ' = ?', 2 * b, { unit: DEG }), st(B('180 ' + MINUS + ' ' + (2 * b)) + ' = ?', ans, { unit: DEG })],
        traps: [tr(180 - b, 'g_triangle', 'There are two angles of ' + b + DEG + '. Take both away.'), tr(90 - b, 'g_triangle', 'Only a right triangle has two angles adding to 90' + DEG + '.')] }; }
    if (kind === 'ext') { const a = R.i(25, 75), b = R.i(25, 75), ans = a + b;
      return { text: 'A triangle has angles of ' + B(deg(a)) + ' and ' + B(deg(b)) + '. One side of the third corner is extended. What is the ' + B('outside angle') + ' at that corner?', ans, unit: DEG,
        how: ['The third angle is 180 ' + MINUS + ' ' + (a + b) + ' = ' + (180 - a - b) + DEG + '. The outside angle sits on a straight line with it.', '180 ' + MINUS + ' ' + (180 - a - b) + ' = ' + B(ans) + DEG + '. Shortcut: an outside angle equals the two far inside angles added: ' + a + ' + ' + b + '.'],
        steps: [st('The third inside angle: ' + B('180 ' + MINUS + ' ' + (a + b)) + ' = ?', 180 - a - b, { unit: DEG }), st('The outside angle: ' + B('180 ' + MINUS + ' ' + (180 - a - b)) + ' = ?', ans, { unit: DEG })],
        traps: [tr(180 - a - b, 'g_triangle', 'That is the inside angle. The outside angle is next to it on a straight line.'), tr(360 - a - b, 'g_angles', 'The outside angle and the inside angle make a straight line, 180' + DEG + '.')] }; }
    const a = d === 0 ? 5 * R.i(6, 16) : R.i(25, 95), b = d === 0 ? 5 * R.i(6, 16) : R.i(25, 95), ans = 180 - a - b; if (ans < 15) return null;
    return { text: 'A triangle has angles of ' + B(deg(a)) + ' and ' + B(deg(b)) + '. What is the third angle?', ans, unit: DEG,
      how: ['The three angles add to 180' + DEG + '. The two you know: ' + a + ' + ' + b + ' = ' + (a + b) + DEG + '.', '180 ' + MINUS + ' ' + (a + b) + ' = ' + B(ans) + DEG + '.'],
      steps: [st(B(a + ' + ' + b) + ' = ?', a + b, { unit: DEG }), st(B('180 ' + MINUS + ' ' + (a + b)) + ' = ?', ans, { unit: DEG })],
      traps: [tr(360 - a - b, 'g_triangle', 'Triangle angles add to 180' + DEG + ', not 360' + DEG + '.'), tr((a + b) % 10 ? ans + 10 : null, 'a_borrow', 'Check your taking away: trade a ten for ones.'), tr(a % 10 + b % 10 >= 10 ? ans + 10 : null, 'a_regroup', 'Check your adding: ' + a + ' + ' + b + '. Did you carry?')] };
  } },

{ id: 'g_volume', s: 'meas', g: 5, title: 'Volume of a box', pre: [], paper: true,
  tip: 'Volume counts the cubes that fill a box: length × width × height. Multiply in a friendly order: 25 × 7 × 4 = 25 × 4 × 7 = 700.',
  gen(d, R) {
    const U = 'cubic cm';
    if (d === 2 && R.chance(0.5)) {
      if (R.chance(0.5)) { const [p, q] = R.pick([[25, 4], [5, 20], [50, 2], [4, 25], [2, 50], [5, 8]]), k = R.i(3, 13), V = p * q * k, dims = R.shuffle([p, q, k]);
        return { text: 'A box is ' + B(dims[0] + ' cm') + ' by ' + B(dims[1] + ' cm') + ' by ' + B(dims[2] + ' cm') + '. What is its volume?', ans: V, unit: U,
          how: ['V = length × width × height = ' + dims.join(' × ') + '.', 'Multiply in a friendly order: ' + p + ' × ' + q + ' = ' + (p * q) + '.', (p * q) + ' × ' + k + ' = ' + B(nm(V)) + ' ' + U + '.'],
          steps: [st(B(p + ' × ' + q) + ' = ?', p * q), st(B((p * q) + ' × ' + k) + ' = ?', V, { unit: U })],
          traps: [tr(p + q + k, 'g_volume', 'Volume multiplies the three edges, it does not add them.'), tr(p * q, 'g_volume', 'That is one layer. Multiply by the third edge too.'), tr(V * 10, 'n_times10', 'Check the zeros.')] }; }
      const l = R.i(3, 12), w = R.i(2, 10), h = R.i(2, 12), V = l * w * h;
      return { text: 'A box has a volume of ' + B(nm(V) + ' ' + U) + '. Its base is ' + B(l + ' cm') + ' by ' + B(w + ' cm') + '. How tall is it?', ans: h, unit: 'cm',
        how: ['V = base × height. Base area: ' + l + ' × ' + w + ' = ' + (l * w) + '.', nm(V) + ' ÷ ' + (l * w) + ' = ' + B(h) + ' cm.'],
        steps: [st('Base area: ' + B(l + ' × ' + w) + ' = ?', l * w), st(B(nm(V) + ' ÷ ' + (l * w)) + ' = ?', h, { unit: 'cm' })],
        traps: [tr(V - l - w, 'g_volume', 'Volume comes from multiplying, so undo it by dividing by the base area.'), tr(V % l === 0 ? V / l : null, 'g_volume', 'Divide by the whole base area, ' + l + ' × ' + w + '.'), tr(V % w === 0 ? V / w : null, 'g_volume', 'Divide by the whole base area, ' + l + ' × ' + w + '.')] };
    }
    const l = R.i(2, d === 0 ? 5 : 12), w = R.i(2, d === 0 ? 5 : 10), h = R.i(2, d === 0 ? 5 : 10), V = l * w * h;
    return { text: 'A box is ' + B(l + ' cm') + ' long, ' + B(w + ' cm') + ' wide and ' + B(h + ' cm') + ' tall. What is its volume?', ans: V, unit: U,
      how: ['V = length × width × height.', 'Bottom layer: ' + l + ' × ' + w + ' = ' + (l * w) + ' cubes.', h + ' layers: ' + (l * w) + ' × ' + h + ' = ' + B(nm(V)) + ' ' + U + '.'],
      steps: [st('Cubes in the bottom layer: ' + B(l + ' × ' + w) + ' = ?', l * w), st(B((l * w) + ' × ' + h) + ' = ?', V, { unit: U })],
      traps: [tr(l + w + h, 'g_volume', 'Volume multiplies the three edges, it does not add them.'), tr(l * w, 'g_volume', 'That is one layer. There are ' + h + ' layers.'), tr(2 * (l * w + l * h + w * h), 'g_volume', 'That is the outside surface. Volume is the space inside.')] };
  } },

{ id: 'g_tri', s: 'meas', g: 6, title: 'Area of a triangle', pre: [], paper: true,
  tip: 'A triangle is half of a rectangle with the same base and height: area = ½ × base × height. Use the height that is square to the base, not a slanted side.',
  gen(d, R) {
    const b = R.i(3, d === 0 ? 12 : 20), h = R.i(2, d === 0 ? 12 : 16); if (d === 0 && (b * h) % 2) return null;
    const A = b * h / 2, ax = Math.round(b * R.pick([0.3, 0.4, 0.6])), sl = h + R.i(1, 4);
    if (d === 2 && R.chance(0.4)) {
      return { text: 'A triangle has an area of ' + B(num(A) + ' square cm') + ' and a base of ' + B(b + ' cm') + '. What is its height?', ans: h, unit: 'cm',
        how: ['Area = ½ × base × height, so base × height = 2 × ' + num(A) + ' = ' + (b * h) + '.', 'Height = ' + (b * h) + ' ÷ ' + b + ' = ' + B(h) + ' cm.'],
        steps: [st('Base × height = 2 × area: ' + B('2 × ' + num(A)) + ' = ?', b * h), st(B((b * h) + ' ÷ ' + b) + ' = ?', h, { unit: 'cm' })],
        traps: [tr(A / b, 'g_tri', 'Remember the half: base × height is double the area.'), tr(A - b, 'g_tri', 'Undo the multiplying: double the area, then divide by the base.')] };
    }
    const right = d === 0, vis = right ? triSVG(h + ' cm', b + ' cm', '') : polySVG([[0, 0], [b, 0], [ax, h]], [{ a: [b / 2, 0], t: b + ' cm', dy: 18 }, { a: [ax, h / 2], t: h + ' cm', dx: 6, anc: 'start' }].concat(d === 2 ? [{ a: [(b + ax) / 2, h / 2], t: sl + ' cm', dx: 12, anc: 'start' }] : []), [[ax, 0, ax, h]]);
    return { text: 'Find the area of the triangle.' + (d > 0 ? ' The dashed line is the height.' : ''), ans: A, unit: 'square cm', vis,
      how: ['Area = ½ × base × height.', '= ½ × ' + b + ' × ' + h + ' = ½ × ' + (b * h) + '.', '= ' + B(num(A)) + ' square cm.'],
      steps: [st('Base × height: ' + B(b + ' × ' + h) + ' = ?', b * h), st('Half of ' + B(b * h) + ' = ?', A, { unit: 'square cm' })],
      traps: [tr(b * h, 'g_tri', 'A triangle is half of the rectangle. Take half.'), tr(d === 2 ? b * sl / 2 : null, 'g_tri', 'Use the height, which meets the base square on, not the slanted side.'), tr(b + h, 'g_tri', 'Multiply the base by the height, then halve.')] };
  } },

{ id: 'g_para', s: 'meas', g: 6, title: 'Parallelograms and trapezoids', pre: [], paper: true,
  tip: 'Parallelogram: base × height (slide the slanted end over to make a rectangle). Trapezoid: average the two parallel sides, then × height: (a + b) ÷ 2 × h.',
  gen(d, R) {
    const trap = d === 1 || (d === 2 && R.chance(0.6));
    if (!trap) {
      const b = R.i(4, 15), h = R.i(2, 12), o = Math.max(1, Math.round(b * 0.3)), s = h + R.i(1, 3), A = b * h;
      const vis = polySVG([[0, 0], [b, 0], [b + o, h], [o, h]], [{ a: [b / 2, 0], t: b + ' cm', dy: 18 }, { a: [o, h / 2], t: h + ' cm', dx: 6, anc: 'start' }, { a: [o / 2, h / 2], t: s + ' cm', dx: -10, anc: 'end' }], [[o, 0, o, h]]);
      if (d === 2) return { text: 'A parallelogram has an area of ' + B(A + ' square cm') + ' and a base of ' + B(b + ' cm') + '. What is its height?', ans: h, unit: 'cm',
        how: ['Area = base × height, so ' + b + ' × height = ' + A + '.', 'Height = ' + A + ' ÷ ' + b + ' = ' + B(h) + ' cm.'],
        steps: [st(B(A + ' ÷ ' + b) + ' = ?', h, { unit: 'cm' })],
        traps: [tr(A % (b / 2) === 0 && b % 2 === 0 ? 2 * A / b : null, 'g_tri', 'A parallelogram is not halved like a triangle: area = base × height.'), tr(A - b, 'g_para', 'Undo the multiplying: divide.')] };
      return { text: 'Find the area of the parallelogram. The dashed line is the height.', ans: A, unit: 'square cm', vis,
        how: ['Cut off the slanted end and slide it to the other side: it makes a rectangle ' + b + ' by ' + h + '.', 'Area = base × height = ' + b + ' × ' + h + ' = ' + B(A) + ' square cm.'],
        steps: [st(B(b + ' × ' + h) + ' = ?', A, { unit: 'square cm' })],
        traps: [tr(b * s, 'g_para', 'Use the height, which meets the base square on, not the slanted side.'), tr(A / 2, 'g_tri', 'Only triangles get halved. A parallelogram is a full rectangle after you slide the end.'), tr(2 * (b + s), 'g_perim', 'That is the distance around. Area is the space inside.')] };
    }
    const a = R.i(2, 12), bb = a + 2 * R.i(1, 5), h = R.i(2, 12), A = (a + bb) * h / 2, o = (bb - a) / 2;
    const vis = polySVG([[0, 0], [bb, 0], [o + a, h], [o, h]], [{ a: [bb / 2, 0], t: bb + ' cm', dy: 18 }, { a: [o + a / 2, h], t: a + ' cm', dy: -10 }, { a: [o, h / 2], t: h + ' cm', dx: 6, anc: 'start' }], [[o, 0, o, h]]);
    if (d === 2) return { text: 'A trapezoid has parallel sides of ' + B(a + ' cm') + ' and ' + B(bb + ' cm') + ' and an area of ' + B(num(A) + ' square cm') + '. What is its height?', ans: h, unit: 'cm',
      how: ['Average of the parallel sides: (' + a + ' + ' + bb + ') ÷ 2 = ' + num((a + bb) / 2) + '.', 'Area = average × height, so height = ' + num(A) + ' ÷ ' + num((a + bb) / 2) + ' = ' + B(h) + ' cm.'],
      steps: [st('Average of the parallel sides: ' + B('(' + a + ' + ' + bb + ') ÷ 2') + ' = ?', (a + bb) / 2), st(B(num(A) + ' ÷ ' + num((a + bb) / 2)) + ' = ?', h, { unit: 'cm' })],
      traps: [tr(A / (a + bb), 'g_para', 'Use the average of the parallel sides: add them, then halve.'), tr(A % bb === 0 ? A / bb : null, 'g_para', 'Use both parallel sides, not just the long one.')] };
    return { text: 'Find the area of the trapezoid. The dashed line is the height.', ans: A, unit: 'square cm', vis,
      how: ['Area = (top + bottom) ÷ 2 × height.', '(' + a + ' + ' + bb + ') ÷ 2 = ' + (a + bb) + ' ÷ 2 = ' + num((a + bb) / 2) + '.', num((a + bb) / 2) + ' × ' + h + ' = ' + B(num(A)) + ' square cm.'],
      steps: [st(B(a + ' + ' + bb) + ' = ?', a + bb), st('Half of that: ?', (a + bb) / 2), st(B(num((a + bb) / 2) + ' × ' + h) + ' = ?', A, { unit: 'square cm' })],
      traps: [tr((a + bb) * h, 'g_para', 'Average the two parallel sides first: halve their sum.'), tr(bb * h, 'g_para', 'The top is shorter than the bottom. Use the average of the two.'), tr(a * bb * h, 'g_para', 'Add the parallel sides, do not multiply them.')] };
  } },

{ id: 'g_pairs', s: 'meas', g: 7, title: 'Angle pairs', pre: [],
  tip: 'Complementary angles add to 90°, supplementary angles add to 180°. When two lines cross, opposite (vertical) angles are equal and angles side by side add to 180°.',
  gen(d, R) {
    if (d === 0) {
      const sup = R.chance(0.5), x = sup ? R.i(20, 160) : R.i(10, 80), tot = sup ? 180 : 90, ans = tot - x;
      return { text: 'What is the ' + B(sup ? 'supplement' : 'complement') + ' of a ' + B(deg(x)) + ' angle?', ans, unit: DEG,
        how: [(sup ? 'Supplementary angles add to 180' : 'Complementary angles add to 90') + DEG + '.', tot + ' ' + MINUS + ' ' + x + ' = ' + B(ans) + DEG + '.'],
        steps: [st('They add to how many degrees?', tot, { unit: DEG }), st(B(tot + ' ' + MINUS + ' ' + x) + ' = ?', ans, { unit: DEG })],
        traps: [tr(sup ? (x < 90 ? 90 - x : null) : 180 - x, 'g_pairs', sup ? 'Supplementary means 180' + DEG + '. Complementary is 90' + DEG + '.' : 'Complementary means 90' + DEG + '. Supplementary is 180' + DEG + '.'), tr(360 - x, 'g_pairs', 'Angle pairs make 90' + DEG + ' or 180' + DEG + ', not 360' + DEG + '.')] };
    }
    if (d === 1) {
      const x = R.i(25, 155); if (x === 90) return null; const opp = R.chance(0.35), ans = opp ? 360 - x : 180 - x;
      return { text: 'Two straight lines cross and make four angles. One is ' + B(deg(x)) + '. What is ' + (opp ? B('the sum of the other three') : 'the angle ' + B('right next to') + ' it') + '?', ans, unit: DEG,
        how: opp ? ['The two angles next to it are 180 ' + MINUS + ' ' + x + ' = ' + (180 - x) + DEG + ' each. The opposite one equals it: ' + x + DEG + '.', (180 - x) + ' + ' + (180 - x) + ' + ' + x + ' = ' + B(ans) + DEG + ' (all four make a full turn, 360' + DEG + ').'] : ['Angles side by side on a straight line add to 180' + DEG + '.', '180 ' + MINUS + ' ' + x + ' = ' + B(ans) + DEG + '.'],
        steps: opp ? [st('Each angle next to it: ' + B('180 ' + MINUS + ' ' + x) + ' = ?', 180 - x, { unit: DEG }), st('The opposite angle (vertical angles are equal): ?', x, { unit: DEG }), st('Add the three: ?', ans, { unit: DEG })] : [st(B('180 ' + MINUS + ' ' + x) + ' = ?', ans, { unit: DEG })],
        traps: [tr(opp ? 2 * (180 - x) : x, 'g_pairs', opp ? 'Count the opposite angle too: it equals ' + x + DEG + '.' : 'Opposite angles are equal; the one next to it adds with it to 180' + DEG + '.'), tr(opp ? 180 - x : 360 - x, 'g_pairs', opp ? 'There are three other angles.' : 'Angles on a straight line add to 180' + DEG + '.'), tr(!opp && x < 90 ? 90 - x : null, 'g_pairs', 'A straight line is 180' + DEG + ', not 90' + DEG + '.')] };
    }
    if (R.chance(0.5)) {
      const k = R.pick([2, 3, 4, 5, 8, 9, 11]), small = 180 / (k + 1); if (small % 1) return null; const big = R.chance(0.5), ans = big ? k * small : small;
      return { text: 'Two angles are supplementary. One is ' + B(k + ' times') + ' the other. What is the ' + B(big ? 'bigger' : 'smaller') + ' angle?', ans, unit: DEG,
        how: ['Together they make 1 + ' + k + ' = ' + (k + 1) + ' equal parts of 180' + DEG + '.', 'One part: 180 ÷ ' + (k + 1) + ' = ' + small + DEG + '.' + (big ? ' The bigger is ' + k + ' × ' + small + ' = ' + B(ans) + DEG + '.' : ' The smaller is ' + B(ans) + DEG + '.')],
        steps: [st('How many equal parts in all?', k + 1), st(B('180 ÷ ' + (k + 1)) + ' = ?', small, { unit: DEG })].concat(big ? [st(B(k + ' × ' + small) + ' = ?', ans, { unit: DEG })] : []),
        traps: [tr(big ? small : k * small, 'g_pairs', big ? 'That is the smaller one.' : 'That is the bigger one.'), tr(180 / k % 1 === 0 ? 180 / k : null, 'g_pairs', 'The two angles together make ' + (k + 1) + ' parts, not ' + k + '.'), tr(90 / (k + 1) % 1 === 0 ? (big ? k : 1) * 90 / (k + 1) : null, 'g_pairs', 'Supplementary means they add to 180' + DEG + '.')] };
    }
    const diff = 2 * R.i(3, 30), small = (90 - diff) / 2, big = R.chance(0.5), ans = big ? small + diff : small; if (small <= 0) return null;
    return { text: 'Two angles are complementary. One is ' + B(diff + DEG + ' more') + ' than the other. What is the ' + B(big ? 'bigger' : 'smaller') + ' angle?', ans, unit: DEG,
      how: ['They add to 90' + DEG + '. Take away the extra ' + diff + DEG + ': 90 ' + MINUS + ' ' + diff + ' = ' + (90 - diff) + DEG + ' is two equal angles.', 'Smaller: ' + (90 - diff) + ' ÷ 2 = ' + small + DEG + '.' + (big ? ' Bigger: ' + small + ' + ' + diff + ' = ' + B(ans) + DEG + '.' : ' So ' + B(ans) + DEG + '.')],
      steps: [st(B('90 ' + MINUS + ' ' + diff) + ' = ?', 90 - diff, { unit: DEG }), st('Half of it: ?', small, { unit: DEG })].concat(big ? [st(B(small + ' + ' + diff) + ' = ?', ans, { unit: DEG })] : []),
      traps: [tr(big ? small : small + diff, 'g_pairs', big ? 'That is the smaller one.' : 'That is the bigger one.'), tr(90 - diff, 'g_pairs', 'That is both small parts together. Halve it.'), tr((180 - diff) / 2 + (big ? diff : 0), 'g_pairs', 'Complementary means they add to 90' + DEG + '.')] };
  } },

{ id: 'g_circle', s: 'meas', g: 7, title: 'Circles and π', pre: [], paper: true,
  tip: 'Circumference = π × diameter = 2πr. Area = π × r × r. Keep π as π: a circle of radius 5 has area 25π and circumference 10π.',
  gen(d, R) {
    const kind = d === 0 ? R.pick(['Cd', 'Cr']) : d === 1 ? R.pick(['Ar', 'Ad', 'Ar']) : R.pick(['AtoC', 'quarter', 'Ad']);
    const r = R.i(2, 12), dd = 2 * r;
    if (kind === 'Cd') return { text: 'A circle has a circumference of ' + B(dd + PI + ' cm') + '. What is its ' + B('radius') + '?', ans: r, unit: 'cm',
      how: ['Circumference = ' + PI + ' × diameter, so the diameter is ' + dd + ' cm.', 'The radius is half the diameter: ' + dd + ' ÷ 2 = ' + B(r) + ' cm.'],
      steps: [st('Circumference = ' + PI + ' × diameter. What is the diameter?', dd, { unit: 'cm' }), st('Half of it: ?', r, { unit: 'cm' })],
      traps: [tr(dd, 'g_circle', 'That is the diameter. The radius is half of it.'), tr(dd % 4 === 0 ? dd / 4 : null, 'g_circle', 'Circumference is ' + PI + ' × diameter, which is 2 × ' + PI + ' × radius. Halve only once.')] };
    if (kind === 'Cr') { const ans = dd, byD = false;
      return { text: 'A circle has a ' + B(byD ? 'diameter of ' + dd + ' cm' : 'radius of ' + r + ' cm') + '. Its circumference is ' + B('k' + PI + ' cm') + '. What is k?', ans,
        how: byD ? ['Circumference = ' + PI + ' × diameter.', '= ' + PI + ' × ' + dd + ' = ' + dd + PI + ', so k = ' + B(ans) + '.'] : ['Circumference = 2 × ' + PI + ' × radius (the diameter is 2 × radius).', '= 2 × ' + PI + ' × ' + r + ' = ' + dd + PI + ', so k = ' + B(ans) + '.'],
        steps: byD ? [st('Circumference = ' + PI + ' × diameter. What is the diameter?', dd)] : [st('Diameter = 2 × radius = ?', dd), st('So k = ?', dd)],
        traps: [tr(byD ? null : r, 'g_circle', 'Circumference uses the diameter, which is 2 × the radius.'), tr(byD ? 2 * dd : null, 'g_circle', 'With the diameter, it is just ' + PI + ' × diameter. The 2 is for the radius.'), tr(byD ? r * r : r * r, 'g_circle', 'That is the area rule. Circumference is ' + PI + ' × diameter.')] }; }
    if (kind === 'Ar' || kind === 'Ad') { const ans = r * r, byD = kind === 'Ad';
      return { text: 'A circle has a ' + B(byD ? 'diameter of ' + dd + ' cm' : 'radius of ' + r + ' cm') + '. Its area is ' + B('k' + PI + ' square cm') + '. What is k?', ans,
        how: (byD ? ['Area uses the radius: ' + dd + ' ÷ 2 = ' + r + '.'] : []).concat(['Area = ' + PI + ' × r × r.', '= ' + PI + ' × ' + r + ' × ' + r + ' = ' + ans + PI + ', so k = ' + B(ans) + '.']),
        steps: (byD ? [st('Radius = ' + B(dd + ' ÷ 2') + ' = ?', r)] : []).concat([st(B(r + ' × ' + r) + ' = ?', ans)]),
        traps: [tr(byD ? dd * dd : null, 'g_circle', 'Area uses the radius, half the diameter.'), tr(2 * r, 'g_circle', 'Area is r × r, not 2 × r.'), tr(byD ? null : 2 * r * r, 'g_circle', 'Area is ' + PI + ' × r × r. There is no 2.')] }; }
    if (kind === 'quarter') { const rr = 2 * R.i(1, 8), ans = rr * rr / 4;
      return { text: 'A quarter circle has a radius of ' + B(rr + ' cm') + '. Its area is ' + B('k' + PI + ' square cm') + '. What is k?', ans,
        how: ['A whole circle: ' + PI + ' × ' + rr + ' × ' + rr + ' = ' + (rr * rr) + PI + '.', 'A quarter of it: ' + (rr * rr) + ' ÷ 4 = ' + ans + ', so k = ' + B(ans) + '.'],
        steps: [st('Whole circle: ' + B(rr + ' × ' + rr) + ' = ?', rr * rr), st(B((rr * rr) + ' ÷ 4') + ' = ?', ans)],
        traps: [tr(rr * rr, 'g_circle', 'That is the whole circle. Take a quarter.'), tr(rr * rr / 2, 'g_circle', 'That is half a circle. You need a quarter.'), tr(rr / 2, 'g_circle', 'Area is r × r first, then take a quarter.')] }; }
    const A = r * r, ans = dd;
    return { text: 'A circle has an area of ' + B(A + PI + ' square cm') + '. Its circumference is ' + B('k' + PI + ' cm') + '. What is k?', ans,
      how: ['Area = ' + PI + ' × r × r = ' + A + PI + ', so r × r = ' + A + ' and r = ' + r + '.', 'Circumference = 2 × ' + PI + ' × ' + r + ' = ' + dd + PI + ', so k = ' + B(ans) + '.'],
      steps: [st('r × r = ' + A + '. What is r?', r), st('k = 2 × r = ?', dd)],
      traps: [tr(r, 'g_circle', 'That is the radius. Circumference is 2 × ' + PI + ' × r.'), tr(A / 2 % 1 === 0 ? A / 2 : null, 'g_circle', 'Find the radius first: what times itself makes ' + A + '?'), tr(2 * A, 'g_circle', 'Find the radius first: what times itself makes ' + A + '?')] };
  } },

{ id: 'g_scale', s: 'meas', g: 7, title: 'Scale drawings and maps', pre: ['f_ratio'], paper: true,
  tip: 'A scale is a ratio. If 1 cm on the map is 5 km, then 7 cm is 7 × 5 = 35 km. With 1 : 25,000, every cm is 25,000 cm = 250 m.',
  gen(d, R) {
    if (d === 0) { const k = R.pick([2, 5, 10, 20, 25, 50]), m = R.i(2, 12), ans = m * k;
      return { text: 'On a map, ' + B('1 cm stands for ' + k + ' km') + '. Two towns are ' + B(m + ' cm') + ' apart on the map. How far apart are they really?', ans, unit: 'km',
        how: ['Each cm on the map is ' + k + ' km.', m + ' cm: ' + m + ' × ' + k + ' = ' + B(ans) + ' km.'],
        steps: [st(B(m + ' × ' + k) + ' = ?', ans, { unit: 'km' })],
        traps: [tr(m + k, 'g_scale', 'Every cm stands for ' + k + ' km: multiply.'), tr(m % k === 0 ? m / k : null, 'g_scale', 'The real distance is bigger than the map distance: multiply.')] }; }
    if (d === 1) { const a = R.pick([2, 3, 4, 5]), b = R.pick([3, 5, 6, 10, 15, 25]), j = R.i(2, 9), rev = R.chance(0.45);
      if (gcd(a, b) > 1 && R.chance(0.5)) return null;
      if (rev) return { text: 'A drawing uses the scale ' + B(a + ' cm : ' + b + ' m') + '. A wall is ' + B((b * j) + ' m') + ' long. How long is it on the drawing?', ans: a * j, unit: 'cm',
        how: [(b * j) + ' m is ' + (b * j) + ' ÷ ' + b + ' = ' + j + ' lots of ' + b + ' m.', 'Each lot is ' + a + ' cm on the drawing: ' + j + ' × ' + a + ' = ' + B(a * j) + ' cm.'],
        steps: [st(B((b * j) + ' ÷ ' + b) + ' = ?', j), st(B(j + ' × ' + a) + ' = ?', a * j, { unit: 'cm' })],
        traps: [tr(b * j * a, 'g_scale', 'The drawing is smaller than the real wall. Find how many lots of ' + b + ' m first.'), tr(j, 'g_scale', 'Each lot of ' + b + ' m is ' + a + ' cm on the drawing.')] };
      return { text: 'A drawing uses the scale ' + B(a + ' cm : ' + b + ' m') + '. A wall is ' + B((a * j) + ' cm') + ' long on the drawing. How long is the real wall?', ans: b * j, unit: 'm',
        how: [(a * j) + ' cm is ' + (a * j) + ' ÷ ' + a + ' = ' + j + ' lots of ' + a + ' cm.', 'Each lot is ' + b + ' m: ' + j + ' × ' + b + ' = ' + B(b * j) + ' m.'],
        steps: [st(B((a * j) + ' ÷ ' + a) + ' = ?', j), st(B(j + ' × ' + b) + ' = ?', b * j, { unit: 'm' })],
        traps: [tr(a * j * b, 'g_scale', a + ' cm stands for ' + b + ' m, not 1 cm. Find how many lots of ' + a + ' cm first.'), tr(a * j + b - a, 'f_ratio', 'Scales multiply, they do not add.')] }; }
    const S = R.pick([10000, 20000, 25000, 50000, 100000]), m = R.i(2, 12), cm = m * S, ans = cm / 100;
    return { text: 'A map has the scale ' + B('1 : ' + nm(S)) + '. Two places are ' + B(m + ' cm') + ' apart on the map. How far apart are they really, in meters?', ans, unit: 'm',
      how: ['1 : ' + nm(S) + ' means 1 cm on the map is ' + nm(S) + ' cm in real life.', m + ' cm × ' + nm(S) + ' = ' + nm(cm) + ' cm.', 'Centimeters to meters: ÷ 100. ' + nm(cm) + ' ÷ 100 = ' + B(nm(ans)) + ' m.'],
      steps: [st(B(m + ' × ' + nm(S)) + ' = ? cm', cm), st(B(nm(cm) + ' ÷ 100') + ' = ? m', ans, { unit: 'm' })],
      traps: [tr(cm, 'g_metric', 'That is in centimeters. 100 cm make 1 m.'), tr(cm / 1000, 'g_metric', '100 cm make 1 m, not 1,000.'), tr(cm / 100000, 'g_metric', 'That is in km. The question asks for meters.')] };
  } },

{ id: 'g_polygon', s: 'meas', g: 8, title: 'Angles in polygons', pre: [], paper: true,
  tip: 'From one corner, a shape with n sides splits into n − 2 triangles, so its angles add to (n − 2) × 180°. The outside angles always add to 360°.',
  gen(d, R) {
    const NAME = { 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: '12-sided polygon', 15: '15-sided polygon', 18: '18-sided polygon', 20: '20-sided polygon' };
    if (d === 0) { const n = R.i(5, 16), ans = (n - 2) * 180;
      const nmN = NAME[n] || n + '-sided polygon';
      return { text: 'What do the inside angles of ' + (/^[aeiou]/.test(nmN) ? 'an ' : 'a ') + B(nmN) + (NAME[n] && n < 12 ? ' (' + n + ' sides)' : '') + ' add up to?', ans, unit: DEG,
        how: ['From one corner, draw lines to the other corners: that splits it into ' + n + ' ' + MINUS + ' 2 = ' + (n - 2) + ' triangles.', 'Each triangle has 180' + DEG + ': ' + (n - 2) + ' × 180 = ' + B(nm(ans)) + DEG + '.'],
        steps: [st('How many triangles? ' + B(n + ' ' + MINUS + ' 2') + ' = ?', n - 2), st(B((n - 2) + ' × 180') + ' = ?', ans, { unit: DEG })],
        traps: [tr(n * 180, 'g_polygon', 'From one corner you get ' + (n - 2) + ' triangles, not ' + n + '.'), tr((n - 1) * 180, 'g_polygon', 'From one corner you get ' + (n - 2) + ' triangles: n ' + MINUS + ' 2.'), tr(360, 'g_polygon', '360' + DEG + ' is the outside angles. The inside angles add to more.')] }; }
    if (d === 1) { const n = R.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), e = 360 / n, ans = 180 - e;
      return { text: 'What is each inside angle of a ' + B('regular ' + NAME[n]) + ' (' + n + ' equal sides)?', ans, unit: DEG,
        how: ['The outside angles add to 360' + DEG + ': each is 360 ÷ ' + n + ' = ' + e + DEG + '.', 'Inside and outside make a straight line: 180 ' + MINUS + ' ' + e + ' = ' + B(ans) + DEG + '.', 'Check: ' + n + ' × ' + ans + ' = ' + nm(n * ans) + ' = (' + n + ' ' + MINUS + ' 2) × 180.'],
        steps: [st('Each outside angle: ' + B('360 ÷ ' + n) + ' = ?', e, { unit: DEG }), st(B('180 ' + MINUS + ' ' + e) + ' = ?', ans, { unit: DEG })],
        traps: [tr(e, 'g_polygon', 'That is the outside angle. The inside angle makes 180' + DEG + ' with it.'), tr((n - 2) * 180, 'g_polygon', 'That is all the inside angles together. Share it among the ' + n + ' corners.'), tr(180 * n / (n - 2) % 1 ? null : 180 * n / (n - 2), 'g_polygon', 'Each angle is (' + n + ' ' + MINUS + ' 2) × 180 ÷ ' + n + '.')] }; }
    if (R.chance(0.6)) { const n = R.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]), e = 360 / n, inside = R.chance(0.5);
      return { text: 'Each ' + B(inside ? 'inside' : 'outside') + ' angle of a regular polygon is ' + B(deg(inside ? 180 - e : e)) + '. How many sides does it have?', ans: n,
        how: (inside ? ['The outside angle is 180 ' + MINUS + ' ' + (180 - e) + ' = ' + e + DEG + '.'] : []).concat(['The outside angles add to 360' + DEG + ', so 360 ÷ ' + e + ' = ' + B(n) + ' sides.']),
        steps: (inside ? [st('Outside angle: ' + B('180 ' + MINUS + ' ' + (180 - e)) + ' = ?', e, { unit: DEG })] : []).concat([st(B('360 ÷ ' + e) + ' = ?', n)]),
        traps: [tr(inside ? (360 % (180 - e) === 0 ? 360 / (180 - e) : null) : null, 'g_polygon', 'Divide 360 by the outside angle, not the inside one.'), tr(180 % e === 0 ? 180 / e : null, 'g_polygon', 'The outside angles add to 360' + DEG + ', not 180' + DEG + '.')] }; }
    const n = R.pick([5, 6]), S = (n - 2) * 180, known = []; for (let i = 0; i < n - 1; i++) known.push(R.i(n === 5 ? 90 : 100, n === 5 ? 125 : 140));
    const ans = S - C.sum(known); if (ans < 40 || ans > 175) return null;
    return { text: 'A ' + NAME[n] + ' has angles of ' + B(known.map(deg).join(', ')) + ' and one more. What is the missing angle?', ans, unit: DEG,
      how: ['A ' + NAME[n] + ' has ' + n + ' ' + MINUS + ' 2 = ' + (n - 2) + ' triangles: (' + (n - 2) + ') × 180 = ' + S + DEG + '.', 'Angles you know: ' + known.join(' + ') + ' = ' + C.sum(known) + DEG + '.', S + ' ' + MINUS + ' ' + C.sum(known) + ' = ' + B(ans) + DEG + '.'],
      steps: [st('Total: ' + B((n - 2) + ' × 180') + ' = ?', S, { unit: DEG }), st('Add the angles you know: ?', C.sum(known), { unit: DEG }), st(B(S + ' ' + MINUS + ' ' + C.sum(known)) + ' = ?', ans, { unit: DEG })],
      traps: [tr(S + 180 - C.sum(known), 'g_polygon', 'A ' + NAME[n] + ' splits into ' + (n - 2) + ' triangles, not ' + (n - 1) + '.'), tr(360 - C.sum(known) > 0 ? 360 - C.sum(known) : null, 'g_polygon', 'Only a 4-sided shape adds to 360' + DEG + '.')] };
  } },

{ id: 'g_cyl', s: 'meas', g: 8, title: 'Cylinders and cones', pre: [], paper: true,
  tip: 'Cylinder: volume = area of the circle × height = πr²h. A cone with the same base and height holds exactly one third of that: ⅓πr²h.',
  gen(d, R) {
    const r = R.i(2, d === 0 ? 6 : 9), h = R.i(2, 12), base = r * r;
    const kind = d === 0 ? 'cyl' : d === 1 ? R.pick(['cone', 'cylD', 'cone']) : R.pick(['rev', 'conecyl', 'coneD']);
    if (kind === 'cyl' || kind === 'cylD') { const byD = kind === 'cylD', ans = base * h;
      return { text: 'A cylinder has a ' + B(byD ? 'diameter of ' + (2 * r) + ' cm' : 'radius of ' + r + ' cm') + ' and a height of ' + B(h + ' cm') + '. Its volume is ' + B('k' + PI + ' cubic cm') + '. What is k?', ans,
        how: (byD ? ['Radius = ' + (2 * r) + ' ÷ 2 = ' + r + '.'] : []).concat(['V = ' + PI + ' × r × r × h.', 'Base circle: ' + PI + ' × ' + r + ' × ' + r + ' = ' + base + PI + '.', 'V = ' + base + PI + ' × ' + h + ' = ' + (base * h) + PI + ', so k = ' + B(ans) + '.']),
        steps: (byD ? [st('Radius = ?', r)] : []).concat([st('Base: ' + B(r + ' × ' + r) + ' = ?', base), st(B(base + ' × ' + h) + ' = ?', ans)]),
        traps: [tr(2 * r * h, 'g_cyl', 'The base is r × r, not 2 × r.'), tr(byD ? 4 * base * h : null, 'g_circle', 'Use the radius, half the diameter.'), tr(r * h, 'w_exp', 'Square the radius: r × r.'), tr(base * h / 3 % 1 === 0 ? base * h / 3 : null, 'g_cyl', 'That would be a cone. A cylinder is the full ' + PI + 'r²h.')] }; }
    if (kind === 'cone' || kind === 'coneD') { const hh = 3 * R.i(1, 6), byD = kind === 'coneD', ans = base * hh / 3;
      return { text: 'A cone has a ' + B(byD ? 'diameter of ' + (2 * r) + ' cm' : 'radius of ' + r + ' cm') + ' and a height of ' + B(hh + ' cm') + '. Its volume is ' + B('k' + PI + ' cubic cm') + '. What is k?', ans,
        how: (byD ? ['Radius = ' + (2 * r) + ' ÷ 2 = ' + r + '.'] : []).concat(['V = ⅓ × ' + PI + ' × r × r × h.', 'Base circle: ' + r + ' × ' + r + ' = ' + base + ', and ⅓ of the height ' + hh + ' is ' + (hh / 3) + '.', 'k = ' + base + ' × ' + (hh / 3) + ' = ' + B(ans) + '.']),
        steps: (byD ? [st('Radius = ?', r)] : []).concat([st('Base: ' + B(r + ' × ' + r) + ' = ?', base), st('⅓ of ' + B(hh) + ' = ?', hh / 3), st(B(base + ' × ' + (hh / 3)) + ' = ?', ans)]),
        traps: [tr(base * hh, 'g_cyl', 'That is the cylinder. A cone is one third of it.'), tr(byD ? 4 * base * hh / 3 : null, 'g_circle', 'Use the radius, half the diameter.'), tr(2 * r * hh / 3, 'g_cyl', 'The base is r × r, not 2 × r.')] }; }
    if (kind === 'conecyl') { const V = 3 * R.i(4, 60);
      return { text: 'A cylinder holds ' + B(V + PI + ' cubic cm') + '. A cone has the same base and the same height. Its volume is ' + B('k' + PI) + '. What is k?', ans: V / 3,
        how: ['A cone holds exactly one third of the cylinder with the same base and height.', V + ' ÷ 3 = ' + B(V / 3) + '.'],
        steps: [st(B(V + ' ÷ 3') + ' = ?', V / 3)],
        traps: [tr(V / 2, 'g_cyl', 'A cone is one third of the cylinder, not half.'), tr(V * 3, 'g_cyl', 'The cone is smaller: one third.')] }; }
    const V = base * h;
    return { text: 'A cylinder has a volume of ' + B(V + PI + ' cubic cm') + ' and a radius of ' + B(r + ' cm') + '. How tall is it?', ans: h, unit: 'cm',
      how: ['V = ' + PI + ' × r × r × h, so ' + V + PI + ' = ' + PI + ' × ' + base + ' × h.', 'h = ' + V + ' ÷ ' + base + ' = ' + B(h) + ' cm.'],
      steps: [st('Base: ' + B(r + ' × ' + r) + ' = ?', base), st(B(V + ' ÷ ' + base) + ' = ?', h, { unit: 'cm' })],
      traps: [tr(V % (2 * r) === 0 ? V / (2 * r) : null, 'g_cyl', 'The base is r × r, not 2 × r.'), tr(V % r === 0 ? V / r : null, 'w_exp', 'Divide by r × r, not just r.')] };
  } },

{ id: 'g_similar', s: 'meas', g: 8, title: 'Similar shapes', pre: [], paper: true,
  tip: 'Scale a shape by k: lengths × k, areas × k², volumes × k³. Double every length and the area is 4 times, the volume 8 times.',
  gen(d, R) {
    if (d === 0) {
      const k = R.pick([2, 3, 4, 5, 1.5, 2.5]), a1 = R.i(2, 10) * (k % 1 ? 2 : 1), a2 = R.i(2, 12) * (k % 1 ? 2 : 1), b1 = a1 * k, ans = a2 * k; if (a1 === a2) return null;
      return { text: 'Two triangles are similar. A side of ' + B(a1 + ' cm') + ' on the small one matches ' + B(num(b1) + ' cm') + ' on the big one. Another side on the small one is ' + B(a2 + ' cm') + '. How long is the matching side on the big one?', ans, unit: 'cm',
        how: ['Scale factor: ' + num(b1) + ' ÷ ' + a1 + ' = ' + num(k) + '. Every length is × ' + num(k) + '.', a2 + ' × ' + num(k) + ' = ' + B(num(ans)) + ' cm.'],
        steps: [st('Scale factor: ' + B(num(b1) + ' ÷ ' + a1) + ' = ?', k), st(B(a2 + ' × ' + num(k)) + ' = ?', ans, { unit: 'cm' })],
        traps: [tr(a2 + b1 - a1, 'f_ratio', 'Similar shapes multiply every length by the same number; they do not add the same amount.'), tr(a2 * k * k, 'g_similar', 'Lengths scale by k. Only areas scale by k².')] };
    }
    if (d === 1) {
      const k = R.i(2, 5), A = R.i(2, 15), ans = A * k * k, shape = R.pick(['rectangle', 'triangle', 'garden', 'photo']);
      return { text: 'A ' + shape + ' has an area of ' + B(A + ' square cm') + '. Every length is made ' + B(k + ' times') + ' as long. What is the new area?', ans, unit: 'square cm',
        how: ['Area has two lengths multiplied, so it grows by ' + k + ' × ' + k + ' = ' + (k * k) + '.', A + ' × ' + (k * k) + ' = ' + B(ans) + ' square cm.'],
        steps: [st('Area grows by ' + B(k + ' × ' + k) + ' = ?', k * k), st(B(A + ' × ' + (k * k)) + ' = ?', ans, { unit: 'square cm' })],
        traps: [tr(A * k, 'g_similar', 'Area uses two lengths, so it grows by ' + k + ' × ' + k + ', not ' + k + '.'), tr(A * 2 * k, 'w_exp', 'k² means ' + k + ' × ' + k + ', not 2 × ' + k + '.'), tr(A * k * k * k, 'g_similar', 'k³ is for volume. Area grows by k².')] };
    }
    if (R.chance(0.5)) {
      const k = R.i(2, 4), V = R.i(2, 12), ans = V * k * k * k;
      return { text: 'A small box holds ' + B(V + ' liters') + '. A similar box has every length ' + B(k + ' times') + ' as long. How much does it hold?', ans, unit: 'liters',
        how: ['Volume has three lengths multiplied, so it grows by ' + k + ' × ' + k + ' × ' + k + ' = ' + (k * k * k) + '.', V + ' × ' + (k * k * k) + ' = ' + B(ans) + ' liters.'],
        steps: [st('Volume grows by ' + B(k + ' × ' + k + ' × ' + k) + ' = ?', k * k * k), st(B(V + ' × ' + (k * k * k)) + ' = ?', ans, { unit: 'liters' })],
        traps: [tr(V * k, 'g_similar', 'Volume uses three lengths: × ' + k + ' three times.'), tr(V * k * k, 'g_similar', 'k² is for area. Volume grows by k³.'), tr(V * 3 * k, 'w_exp', 'k³ means ' + k + ' × ' + k + ' × ' + k + ', not 3 × ' + k + '.')] };
    }
    const k = R.i(2, 6), a = R.i(2, 9), A1 = R.i(2, 10), A2 = A1 * k * k, ans = a * k;
    return { text: 'Two similar shapes have areas of ' + B(A1 + ' square cm') + ' and ' + B(A2 + ' square cm') + '. A side of the small one is ' + B(a + ' cm') + '. How long is the matching side of the big one?', ans, unit: 'cm',
      how: ['The area grew by ' + A2 + ' ÷ ' + A1 + ' = ' + (k * k) + ' = k².', 'So lengths grew by k = ' + k + ' (because ' + k + ' × ' + k + ' = ' + (k * k) + ').', a + ' × ' + k + ' = ' + B(ans) + ' cm.'],
      steps: [st('Area factor: ' + B(A2 + ' ÷ ' + A1) + ' = ?', k * k), st('Length factor: what times itself is ' + (k * k) + '?', k), st(B(a + ' × ' + k) + ' = ?', ans, { unit: 'cm' })],
      traps: [tr(a * k * k, 'g_similar', 'Areas grow by k², but lengths grow by k. Take the square root first.'), tr(a * k * k / 2 % 1 === 0 ? a * k * k / 2 : null, 'w_roots', 'The length factor is the square root of ' + (k * k) + ', not half of it.')] };
  } },

{ id: 'g_sphere', s: 'meas', g: 10, title: 'Spheres, arcs and sectors', pre: [], paper: true,
  tip: 'Sphere: surface 4πr², volume 4/3 πr³. An arc or sector is a fraction of the circle: angle ÷ 360. A 90° sector of radius 6 is 1/4 of 36π = 9π.',
  gen(d, R) {
    const kind = d === 0 ? 'sa' : d === 1 ? R.pick(['vol', 'arc', 'arc']) : R.pick(['sector', 'volD', 'hemi', 'sector']);
    if (kind === 'sa') { const r = R.i(1, 10), ans = 4 * r * r;
      return { text: 'A sphere has a radius of ' + B(r + ' cm') + '. Its surface area is ' + B('k' + PI + ' square cm') + '. What is k?', ans,
        how: ['Surface area = 4 × ' + PI + ' × r × r.', '= 4 × ' + PI + ' × ' + r + ' × ' + r + ' = 4 × ' + (r * r) + PI + ' = ' + ans + PI + ', so k = ' + B(ans) + '.'],
        steps: [st(B(r + ' × ' + r) + ' = ?', r * r), st(B('4 × ' + (r * r)) + ' = ?', ans)],
        traps: [tr(r * r, 'g_sphere', 'That is one flat circle. A sphere\'s surface is 4 of them.'), tr(8 * r, 'w_exp', 'r² means r × r, not 2 × r.'), tr(4 * r * r * r / 3 % 1 === 0 ? 4 * r * r * r / 3 : null, 'g_sphere', 'That is the volume rule. Surface area is 4' + PI + 'r².')] }; }
    if (kind === 'vol' || kind === 'volD' || kind === 'hemi') { const r = 3 * R.i(1, 3), cube = r * r * r, full = 4 * cube / 3, hemi = kind === 'hemi', byD = kind === 'volD', ans = hemi ? full / 2 : full;
      return { text: 'A ' + (hemi ? 'half sphere (hemisphere)' : 'sphere') + ' has a ' + B(byD ? 'diameter of ' + (2 * r) + ' cm' : 'radius of ' + r + ' cm') + '. Its volume is ' + B('k' + PI + ' cubic cm') + '. What is k?', ans,
        how: (byD ? ['Radius = ' + (2 * r) + ' ÷ 2 = ' + r + '.'] : []).concat(['V = 4/3 × ' + PI + ' × r × r × r' + (hemi ? ', and a hemisphere is half of that.' : '.'), 'r × r × r = ' + cube + '. 4/3 × ' + cube + ' = ' + cube + ' ÷ 3 × 4 = ' + full + '.']).concat(hemi ? ['Half: ' + full + ' ÷ 2 = ' + B(ans) + '.'] : ['So k = ' + B(ans) + '.']),
        steps: (byD ? [st('Radius = ?', r)] : []).concat([st(B(r + ' × ' + r + ' × ' + r) + ' = ?', cube), st(B(cube + ' ÷ 3 × 4') + ' = ?', full)]).concat(hemi ? [st('Half of it: ?', ans)] : []),
        traps: [tr(hemi ? cube / 2 : cube, 'g_sphere', 'Do not forget the 4/3.'), tr(4 * r * r / 3 * (hemi ? 0.5 : 1), 'w_exp', 'Volume uses r × r × r: three r\'s.'), tr(byD ? 8 * ans : (hemi ? full : null), byD ? 'g_circle' : 'g_sphere', byD ? 'Use the radius, half the diameter.' : 'A hemisphere is half the sphere.')] }; }
    const ang = R.pick([90, 60, 120, 180, 45, 30, 270, 72, 40]), part = reduce(ang, 360);
    if (kind === 'arc') { const r = part[1] * R.i(1, 4) / gcd(part[1], 2), C2 = 2 * r, ans = C2 * part[0] / part[1]; if (r < 2 || ans % 1) return null;
      return { text: 'A circle has a radius of ' + B(r + ' cm') + '. An arc covers a ' + B(deg(ang)) + ' angle at the center. Its length is ' + B('k' + PI + ' cm') + '. What is k?', ans,
        how: ['The whole circumference is 2 × ' + PI + ' × ' + r + ' = ' + C2 + PI + '.', 'The arc is ' + ang + '/360 = ' + frac(part[0], part[1]) + ' of the circle.', frac(part[0], part[1]) + ' × ' + C2 + ' = ' + B(num(ans)) + ', so k = ' + num(ans) + '.'],
        steps: [st('Whole circumference: 2 × ' + r + ' = ? (times ' + PI + ')', C2), sf('What fraction of the circle is ' + ang + DEG + '?', part[0], part[1]), st(B(frac(part[0], part[1]) + ' × ' + C2) + ' = ?', ans)],
        traps: [tr(r * r * part[0] / part[1], 'g_sphere', 'That is the sector area rule. Arc length uses the circumference, 2' + PI + 'r.'), tr(C2, 'g_sphere', 'That is the whole circle. Take ' + frac(part[0], part[1]) + ' of it.'), tr(r * part[0] / part[1], 'g_circle', 'The circumference is 2' + PI + 'r: double the radius.')] }; }
    const r = R.i(2, 12), full = r * r, ans = full * part[0] / part[1]; if ((ans * 2) % 1) return null;
    return { text: 'A sector of a circle with radius ' + B(r + ' cm') + ' has a ' + B(deg(ang)) + ' angle. Its area is ' + B('k' + PI + ' square cm') + '. What is k?', ans,
      how: ['The whole circle\'s area is ' + PI + ' × ' + r + ' × ' + r + ' = ' + full + PI + '.', 'The sector is ' + ang + '/360 = ' + frac(part[0], part[1]) + ' of the circle.', frac(part[0], part[1]) + ' × ' + full + ' = ' + B(num(ans)) + ', so k = ' + num(ans) + '.'],
      steps: [st('Whole circle: ' + B(r + ' × ' + r) + ' = ?', full), sf('What fraction of the circle is ' + ang + DEG + '?', part[0], part[1]), st(B(frac(part[0], part[1]) + ' × ' + full) + ' = ?', ans)],
      traps: [tr(2 * r * part[0] / part[1], 'g_sphere', 'That is the arc length rule. Area uses r × r.'), tr(full, 'g_sphere', 'That is the whole circle. Take ' + frac(part[0], part[1]) + ' of it.'), tr(full * ang / 100, 'g_sphere', 'The fraction is the angle out of 360' + DEG + ', not 100.')] };
  } },
]);
})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
