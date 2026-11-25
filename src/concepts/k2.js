/* Math Worlds concepts, file k2: Common Core gaps in grades 6 to 8 (docs/gaps_k8.md). Unit rates for converting,
   opposites and debts, parts of expressions, two quantities that change together, fraction-edged boxes, dot plots,
   factoring sums, mean absolute deviation, rates with fractions, proportional relationships, signed fractions,
   interest and percent error, prisms, samples and long-run frequencies, solution counts, crossing lines, comparing
   functions, trend lines, two-way tables, scientific-notation comparisons, dilations, angles at parallel lines,
   exterior angles, 3D Pythagoras and sphere volume.
   Paper concepts (paper: true) write their how lines as a model written solution, one line per line of work. */
(function (C) {
'use strict';
const { B, num, MINUS, signed, gcd, reduce, frac, mixed, pw, rt, poly, sum, plural, NAMES, DEG, PI, fmtD, plotSVG, table, numLineSVG } = C;

/* ---------- small helpers ---------- */
const tr = (v, c, why) => ({ v, c, why });
const st = (text, ans, o) => Object.assign({ text, ans }, o || {});
const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
const nz = (R, lo, hi) => { let v; do { v = R.i(lo, hi); } while (v === 0); return v; };
const dec = v => +(+v).toFixed(10);
const W = (work, note) => work + (note ? ' &nbsp; (' + note + ')' : '');
const mi = (a, b) => num(a) + ' ' + MINUS + ' ' + num(b);
const pn = v => (v < 0 ? '(' + num(v) + ')' : num(v));                                 /* (−3) in products */
const D$ = v => (v < 0 ? MINUS : '') + '$' + (isInt(v) ? num(Math.abs(v)) : Math.abs(v).toFixed(2));
const money = (dollars, o) => Object.assign({ type: 'money', fmt: 'd', ans: Math.round(dollars * 100) }, o || {});
/* exact fractions as {n, d} in lowest terms, with the sign on top */
const Q = (n, d) => { const r = reduce(n, d === undefined ? 1 : d); return { n: r[0], d: r[1] }; };
const qadd = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
const qsub = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
const qmul = (a, b) => Q(a.n * b.n, a.d * b.d);
const qdiv = (a, b) => Q(a.n * b.d, a.d * b.n);
const qv = a => a.n / a.d;
const qs = a => frac(a.n, a.d);                                                         /* −3/4 as a stacked fraction */
const qm = a => { if (a.d === 1) return num(a.n); const A = Math.abs(a.n); if (A < a.d) return frac(a.n, a.d); return (a.n < 0 ? MINUS : '') + mixed(Math.floor(A / a.d), A % a.d, a.d); };
const qt = a => (a.d === 1 ? num(a.n) : (Math.abs(a.n) > a.d ? Math.floor(a.n / a.d) + ' ' + (a.n % a.d) : a.n) + '/' + a.d);   /* plain text, for inside pictures */
const qp = a => (a.n < 0 ? '(' + qm(a) + ')' : qm(a));
const term10 = q => { let v = q.d; while (v % 2 === 0) v /= 2; while (v % 5 === 0) v /= 5; return v === 1; };
const kS = q => (q.d === 1 ? num(q.n) : term10(q) ? num(qv(q)) : qs(q));               /* a rate as a whole number, a decimal or a fraction */
const fl = (t, b) => '<span class="fr"><span class="fr-n">' + t + '</span><span class="fr-d">' + b + '</span></span>';
const ex = list => list.map((t, i) => { const c = t[0], body = t[1] ? (Math.abs(c) === 1 ? '' : num(Math.abs(c))) + t[1] : num(Math.abs(c)); return i === 0 ? (c < 0 ? MINUS : '') + body : (c < 0 ? ' ' + MINUS + ' ' : ' + ') + body; }).join('');
const niceTop = max => { for (const s of [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]) if (max / s <= 8) return { step: s, top: Math.ceil(max / s) * s }; return { step: 2000, top: Math.ceil(max / 2000) * 2000 }; };
const ofS = (N, dd, nn) => N + ' ÷ ' + dd + (nn === 1 ? '' : ' × ' + nn);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const listAnd = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
/* the times-fact concept a slip on a × b points to */
function fx(a, b) {
  a = Math.abs(a); b = Math.abs(b); const h = k => a === k || b === k;
  if (a === b && a > 2 && a < 13) return 'm_squares';
  if (a > 12 || b > 12) return 'm_breakapart';
  return h(7) ? 'm_x7' : h(8) || h(4) ? 'm_x4x8' : h(6) || h(3) ? 'm_x3x6' : h(9) ? 'm_x9' : h(11) || h(12) ? 'm_x11' : 'm_x2510';
}

/* ---------- pictures ---------- */
/* a dot plot: values lo..hi with counts[i] dots stacked over lo + i */
function dotPlotSVG(lo, hi, counts, xl) {
  const n = hi - lo + 1, gap = Math.min(44, 300 / n), W0 = 30 + n * gap, top = Math.max(1, ...counts), base = 24 + top * 18, H = base + 44;
  let s = '<svg class="fig" viewBox="0 0 ' + W0 + ' ' + H + '" style="max-width:' + Math.min(420, Math.round(W0 * 1.3)) + 'px" aria-hidden="true"><line x1="6" x2="' + (W0 - 6) + '" y1="' + base + '" y2="' + base + '" class="fig-thin"/>';
  for (let i = 0; i < n; i++) {
    const x = 15 + gap / 2 + i * gap;
    s += '<line x1="' + x + '" x2="' + x + '" y1="' + (base - 5) + '" y2="' + (base + 5) + '" class="fig-thin"/><text x="' + x + '" y="' + (base + 22) + '" class="fig-small">' + num(lo + i) + '</text>';
    for (let k = 0; k < counts[i]; k++) s += '<circle cx="' + x + '" cy="' + (base - 13 - k * 18) + '" r="7" class="fig-dot"/>';
  }
  if (xl) s += '<text x="' + (W0 / 2) + '" y="' + (H - 4) + '" class="fig-small">' + xl + '</text>';
  return s + '</svg>';
}
/* a graph on a grid: o = {x0, x1, y0, y1, xs, ys (grid steps), xl, yl (axis names), lines: [{m, b} or {x}], pts: [{x, y, t}]} */
function graphSVG(o) {
  const Wd = 300, Ht = 260, L = 42, Rm = 16, T = 14, Bm = 40, PW = Wd - L - Rm, PH = Ht - T - Bm;
  const X = v => +(L + (v - o.x0) / (o.x1 - o.x0) * PW).toFixed(1), Y = v => +(T + (o.y1 - v) / (o.y1 - o.y0) * PH).toFixed(1);
  let s = '<svg class="fig" viewBox="0 0 ' + Wd + ' ' + Ht + '" style="max-width:320px" aria-hidden="true">';
  const xl = o.xlab || o.xs, yl = o.ylab || o.ys;
  for (let v = o.x0, i = 0; v <= o.x1 + 1e-9 && i < 60; v = dec(v + o.xs), i++) { s += '<line x1="' + X(v) + '" x2="' + X(v) + '" y1="' + T + '" y2="' + (T + PH) + '" class="fig-grid"/>'; if (isInt(v / xl)) s += '<text x="' + X(v) + '" y="' + (T + PH + 17) + '" class="fig-small">' + num(v) + '</text>'; }
  for (let v = o.y0, i = 0; v <= o.y1 + 1e-9 && i < 60; v = dec(v + o.ys), i++) { s += '<line y1="' + Y(v) + '" y2="' + Y(v) + '" x1="' + L + '" x2="' + (L + PW) + '" class="fig-grid"/>'; if (isInt(v / yl)) s += '<text x="' + (L - 6) + '" y="' + (Y(v) + 4) + '" class="fig-small" text-anchor="end">' + num(v) + '</text>'; }
  if (o.x0 <= 0 && o.x1 >= 0) s += '<line x1="' + X(0) + '" x2="' + X(0) + '" y1="' + T + '" y2="' + (T + PH) + '" class="fig-thin"/>';
  if (o.y0 <= 0 && o.y1 >= 0) s += '<line y1="' + Y(0) + '" y2="' + Y(0) + '" x1="' + L + '" x2="' + (L + PW) + '" class="fig-thin"/>';
  (o.lines || []).forEach(l => {
    let p;
    if (l.x != null) p = [[l.x, o.y0], [l.x, o.y1]];
    else {
      const c = [[o.x0, l.m * o.x0 + l.b], [o.x1, l.m * o.x1 + l.b]];
      if (l.m) c.push([(o.y0 - l.b) / l.m, o.y0], [(o.y1 - l.b) / l.m, o.y1]);
      p = c.filter(q => q[0] >= o.x0 - 1e-9 && q[0] <= o.x1 + 1e-9 && q[1] >= o.y0 - 1e-9 && q[1] <= o.y1 + 1e-9).sort((a, b) => a[0] - b[0]);
      if (p.length < 2) return; p = [p[0], p[p.length - 1]];
    }
    s += '<line x1="' + X(p[0][0]) + '" y1="' + Y(p[0][1]) + '" x2="' + X(p[1][0]) + '" y2="' + Y(p[1][1]) + '" class="fig-shape"/>';
    if (l.lab) { const e = Y(p[0][1]) < Y(p[1][1]) ? p[0] : p[1], ex0 = X(e[0]), left = ex0 < L + PW / 2, lx = left ? Math.max(ex0 + 6, L + 4) : Math.min(ex0 - 6, L + PW - 4), ly = Math.min(Math.max(Y(e[1]) + 14, T + 12), T + PH - 6) + (l.dy || 0); s += '<text x="' + lx + '" y="' + ly + '" class="fig-small" text-anchor="' + (left ? 'start' : 'end') + '">' + l.lab + '</text>'; }
  });
  (o.pts || []).forEach(q => { s += '<circle cx="' + X(q.x) + '" cy="' + Y(q.y) + '" r="' + (q.r || 5) + '" class="fig-dot"/>' + (q.t ? '<text x="' + (X(q.x) + 8) + '" y="' + (Y(q.y) - 8) + '" class="fig-small" text-anchor="start">' + q.t + '</text>' : ''); });
  if (o.xl) s += '<text x="' + (L + PW / 2) + '" y="' + (Ht - 4) + '" class="fig-small">' + o.xl + '</text>';
  if (o.yl) s += '<text x="' + (L + 4) + '" y="' + (T + 12) + '" class="fig-small" text-anchor="start">' + o.yl + '</text>';
  return s + '</svg>';
}
/* a box drawn in 3D with edge labels; o.diag draws the floor diagonal and the long diagonal */
function boxSVG(l, w, h, o) {
  o = o || {}; const x0 = 92, y0 = 170, FW = 130, FH = 90, dx = 60, dy = -42;
  const P = (x, y) => x + ' ' + y;
  let s = '<svg class="fig" viewBox="0 0 330 200" style="max-width:340px" aria-hidden="true">';
  s += '<path d="M' + P(x0 + dx, y0 + dy) + ' L' + P(x0 + dx, y0 + dy - FH) + ' M' + P(x0 + dx, y0 + dy) + ' L' + P(x0 + dx + FW, y0 + dy) + ' M' + P(x0 + dx, y0 + dy) + ' L' + P(x0, y0) + '" class="fig-thin" style="stroke-dasharray:5 5"/>';
  s += '<path d="M' + P(x0, y0) + ' L' + P(x0 + FW, y0) + ' L' + P(x0 + FW, y0 - FH) + ' L' + P(x0, y0 - FH) + ' Z" class="fig-shape"/>';
  s += '<path d="M' + P(x0, y0 - FH) + ' L' + P(x0 + dx, y0 - FH + dy) + ' L' + P(x0 + FW + dx, y0 - FH + dy) + ' L' + P(x0 + FW, y0 - FH) + ' M' + P(x0 + FW + dx, y0 - FH + dy) + ' L' + P(x0 + FW + dx, y0 + dy) + ' L' + P(x0 + FW, y0) + '" class="fig-shape" style="fill:none"/>';
  if (o.diag) s += '<path d="M' + P(x0, y0) + ' L' + P(x0 + FW + dx, y0 + dy) + '" class="fig-thin" style="stroke-dasharray:3 4"/><path d="M' + P(x0, y0) + ' L' + P(x0 + FW + dx, y0 - FH + dy) + '" class="fig-shape" style="fill:none;stroke-dasharray:8 5"/>';
  s += '<text x="' + (x0 + FW / 2) + '" y="' + (y0 + 22) + '" class="fig-lab">' + l + '</text>';
  s += '<text x="' + (x0 + FW + dx / 2 + 8) + '" y="' + (y0 + dy / 2 + 14) + '" class="fig-lab" text-anchor="start">' + w + '</text>';
  s += '<text x="' + (x0 - 8) + '" y="' + (y0 - FH / 2 + 6) + '" class="fig-lab" text-anchor="end">' + h + '</text>';
  return s + '</svg>';
}
/* a prism: kind 'rt' (right triangle base), 'tri' (triangle with a marked height) or 'trap' (trapezoid); labs = label texts */
function prismSVG(kind, labs) {
  const F = { rt: [[30, 170], [30, 80], [140, 170]], tri: [[30, 170], [150, 170], [72, 82]], trap: [[30, 170], [160, 170], [126, 98], [62, 98]] }[kind], dx = 110, dy = -46;
  const path = (pts, close) => 'M' + pts.map(p => p[0] + ' ' + p[1]).join(' L') + (close ? ' Z' : '');
  const back = F.map(p => [p[0] + dx, p[1] + dy]);
  let s = '<svg class="fig" viewBox="0 0 300 200" style="max-width:320px" aria-hidden="true"><path d="' + path(back, true) + '" class="fig-thin"/>';
  F.forEach((p, i) => { s += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + back[i][0] + '" y2="' + back[i][1] + '" class="fig-thin"/>'; });
  s += '<path d="' + path(F, true) + '" class="fig-shape"/>';
  if (kind === 'rt') s += '<path d="M30 156 L44 156 L44 170" class="fig-thin"/><text x="36" y="136" class="fig-small" text-anchor="start">' + labs.a + '</text><text x="85" y="192" class="fig-lab">' + labs.b + '</text>';
  if (kind === 'tri') s += '<line x1="72" y1="82" x2="72" y2="170" class="fig-thin" style="stroke-dasharray:4 4"/><text x="78" y="140" class="fig-small" text-anchor="start">' + labs.h + '</text><text x="90" y="192" class="fig-lab">' + labs.b + '</text>';
  if (kind === 'trap') s += '<line x1="62" y1="98" x2="62" y2="170" class="fig-thin" style="stroke-dasharray:4 4"/><text x="68" y="140" class="fig-small" text-anchor="start">' + labs.h + '</text><text x="95" y="192" class="fig-lab">' + labs.b + '</text><text x="94" y="90" class="fig-lab">' + labs.a + '</text>';
  const e = kind === 'rt' ? 2 : 1, p = F[e], q = back[e];
  s += '<text x="' + ((p[0] + q[0]) / 2 + 10) + '" y="' + ((p[1] + q[1]) / 2 + 16) + '" class="fig-lab" text-anchor="start">' + labs.L + '</text>';
  return s + '</svg>';
}

/* two parallel lines cut by a transversal at th degrees; marks = {'P_tr': '65°', 'Q_bl': '?'}: P is the top crossing,
   Q the bottom one; tr, tl, bl, br are the four angles around a crossing (top-right is th, top-left is 180 − th) */
function transversalSVG(th, marks) {
  const y1 = 70, y2 = 150, px = 165, t = th * Math.PI / 180, qx = px - (y2 - y1) / Math.tan(t), ext = 52, dx = ext / Math.tan(t);
  let s = '<svg class="fig" viewBox="0 0 330 220" style="max-width:340px" aria-hidden="true">';
  [y1, y2].forEach(y => { s += '<line x1="10" y1="' + y + '" x2="320" y2="' + y + '" class="fig-shape"/><path d="M292 ' + (y - 6) + ' L302 ' + y + ' L292 ' + (y + 6) + '" class="fig-thin"/>'; });
  s += '<line x1="' + (px + dx).toFixed(1) + '" y1="' + (y1 - ext) + '" x2="' + (qx - dx).toFixed(1) + '" y2="' + (y2 + ext) + '" class="fig-shape"/>';
  const bis = { tr: th / 2, tl: 90 + th / 2, bl: 180 + th / 2, br: 270 + th / 2 };
  for (const k in marks) {
    const [P, pos] = k.split('_'), cx = P === 'P' ? px : qx, cy = P === 'P' ? y1 : y2, a = bis[pos] * Math.PI / 180, r = 24 + 3.2 * String(marks[k]).length;
    s += '<text x="' + (cx + r * Math.cos(a)).toFixed(1) + '" y="' + (cy - r * Math.sin(a) + 5).toFixed(1) + '" class="fig-small">' + marks[k] + '</text>';
  }
  return s + '</svg>';
}
/* a triangle with its base stretched out to the right: angles A (left) and Bv (right, inside) in degrees; labs = {a, c, ext} */
function triExtSVG(A, Bv, labs) {
  const r = Math.PI / 180, sn = Math.sin((A + Bv) * r), ax = Math.sin(Bv * r) * Math.cos(A * r) / sn, ay = Math.sin(A * r) * Math.sin(Bv * r) / sn;
  const sc = Math.min(160, 125 / ay), L = [50, 175], Rt = [50 + sc, 175], T = [50 + sc * ax, 175 - sc * ay];
  const f = v => v.toFixed(1), at = (p, ang, d) => [p[0] + d * Math.cos(ang * r), p[1] - d * Math.sin(ang * r)];
  let s = '<svg class="fig" viewBox="0 0 320 200" style="max-width:340px" aria-hidden="true"><path d="M' + f(L[0]) + ' ' + f(L[1]) + ' L' + f(Rt[0]) + ' ' + f(Rt[1]) + ' L' + f(T[0]) + ' ' + f(T[1]) + ' Z" class="fig-shape"/>';
  s += '<line x1="' + f(Rt[0]) + '" y1="175" x2="' + f(Math.min(312, Rt[0] + 110)) + '" y2="175" class="fig-shape"/>';
  const la = at(L, A / 2, 28 + 3 * labs.a.length), le = at(Rt, (180 - Bv) / 2, 26 + 2.5 * labs.ext.length), u = [(L[0] + Rt[0]) / 2 - T[0], 175 - T[1]], un = Math.hypot(u[0], u[1]), cr = 24 + 2.2 * labs.c.length, lc = [T[0] + cr * u[0] / un, T[1] + cr * u[1] / un];
  s += '<text x="' + f(la[0]) + '" y="' + f(la[1] + 5) + '" class="fig-small">' + labs.a + '</text><text x="' + f(lc[0]) + '" y="' + f(lc[1] + 5) + '" class="fig-small">' + labs.c + '</text><text x="' + f(le[0] + 6) + '" y="' + f(le[1] + 5) + '" class="fig-small">' + labs.ext + '</text>';
  return s + '</svg>';
}
/* boxes whose long diagonal is a whole number */
const BOX3 = [];
for (let l = 1; l <= 24; l++) for (let w = l; w <= 24; w++) for (let h = 1; h <= 60; h++) { const D = Math.round(Math.sqrt(l * l + w * w + h * h)); if (D * D === l * l + w * w + h * h && D <= 70) { const f = Math.sqrt(l * l + w * w); BOX3.push({ l, w, h, D, f2: l * l + w * w, f: isInt(f) ? Math.round(f) : null }); } }

const DEFS = [
/* ======================= Grade 6 ======================= */
{ id: 'g_convrate', s: 'meas', g: 6, title: 'Convert units with a rate', pre: ['f_rate'], paper: true, cc: ['6.RP.A.3d'],
  tip: 'Write the two units as a rate, then scale it. 1 foot = 12 inches, so 7 feet = 7 × 12 = 84 inches. 5 miles is about 8 km, so 30 miles is 6 × 8 = 48 km.',
  gen(d, R) {
    if (d === 0) {
      const [one, many, r, s1, sm] = R.pick([['foot', 'feet', 12, 'inch', 'inches'], ['yard', 'yards', 3, 'foot', 'feet'], ['gallon', 'gallons', 4, 'quart', 'quarts'], ['hour', 'hours', 60, 'minute', 'minutes'],
        ['kilometer', 'kilometers', 1000, 'meter', 'meters'], ['pound', 'pounds', 16, 'ounce', 'ounces'], ['meter', 'meters', 100, 'centimeter', 'centimeters'], ['yard', 'yards', 36, 'inch', 'inches'], ['week', 'weeks', 7, 'day', 'days']]);
      const k = R.i(2, r >= 100 ? 9 : 12), S = k * r, rate = '1 ' + one + ' = ' + num(r) + ' ' + sm;
      if (R.chance(.6)) return { text: B(rate) + '. How many ' + sm + ' are in ' + B(k + ' ' + many) + '?', ans: S, unit: sm,
        how: [W(rate, 'the rate'), W(k + ' ' + many + ' = ' + k + ' × ' + num(r) + ' ' + sm, k + ' times as many ' + many + ' means ' + k + ' times as many ' + sm), '= ' + B(num(S)) + ' ' + sm],
        steps: [st('How many ' + sm + ' are in 1 ' + one + '?', r), st(B(k + ' × ' + num(r)) + ' = ?', S)],
        traps: [tr(k + r, 'g_convrate', 'Every ' + one + ' is ' + num(r) + ' ' + sm + ', so multiply by ' + num(r) + '.'), tr(S + r, fx(k, r), 'Check ' + k + ' × ' + num(r) + '.'), tr(S - r, fx(k, r), 'Check ' + k + ' × ' + num(r) + '.')] };
      return { text: B(rate) + '. How many ' + many + ' are in ' + B(num(S) + ' ' + sm) + '?', ans: k, unit: many,
        how: [W(rate, 'the rate'), W(num(S) + ' ' + sm + ' = ' + num(S) + ' ÷ ' + num(r) + ' ' + many, 'how many groups of ' + num(r) + ' ' + sm + '?'), '= ' + B(k) + ' ' + many],
        steps: [st('How many groups of ' + num(r) + ' are in ' + num(S) + '?', k)],
        traps: [tr(S * r, 'g_convrate', 'One ' + one + ' is bigger than one ' + s1 + ', so there are fewer ' + many + ': divide.'), tr(S - r, 'g_convrate', 'Find how many groups of ' + num(r) + ' fit in ' + num(S) + ': divide.')] };
    }
    if (d === 1) {
      const P = R.pick([[5, 'miles', 8, 'kilometers', 1], [11, 'pounds', 5, 'kilograms', 1], [6, 'feet', 72, 'inches'], [3, 'yards', 9, 'feet'], [8, 'pints', 4, 'quarts'], [2, 'hours', 120, 'minutes'], [4, 'cups', 2, 'pints'], [10, 'centimeters', 100, 'millimeters']]);
      const [a, A, b, Bn, ab] = P, k = R.i(3, 12), fwd = R.chance(.5), eqs = ab ? ' is about ' : ' = ';
      const [p, Pu, q, Qu] = fwd ? [a, A, b, Bn] : [b, Bn, a, A], X = p * k, ans = q * k;
      const eq2 = ab ? ' ≈ ' : ' = ', rate = (fwd ? a + ' ' + A + eq2 + b + ' ' + Bn : b + ' ' + Bn + eq2 + a + ' ' + A);
      return { text: B(a + ' ' + A + eqs + b + ' ' + Bn) + '. ' + (ab ? 'About how' : 'How') + ' many ' + Qu + ' is ' + B(num(X) + ' ' + Pu) + '?', ans, unit: Qu,
        vis: table([[Pu, p, 2 * p, num(X)], [Qu, q, 2 * q, '?']]),
        how: [W(rate, 'the rate'), W(num(X) + ' ÷ ' + p + ' = ' + k, num(X) + ' ' + Pu + ' is ' + k + ' groups of ' + p), W(k + ' × ' + q + ' = ' + B(num(ans)) + ' ' + Qu, 'so it is ' + k + ' groups of ' + q + ' ' + Qu)],
        steps: [st('How many groups of ' + p + ' ' + Pu + ' make ' + num(X) + ' ' + Pu + '?', k), st(B(k + ' × ' + q) + ' = ?', ans)],
        traps: [tr(X + q - p > 0 ? X + q - p : null, 'f_ratio', 'Equal ratios scale by multiplying, not by adding the same amount to both.'), tr(X * q, 'g_convrate', 'First find how many groups of ' + p + ' are in ' + num(X) + '.'), tr(isInt(X * p / q) ? X * p / q : null, 'g_convrate', 'Check the direction: ' + p + ' ' + Pu + ' match ' + q + ' ' + Qu + ', not the other way round.')] };
    }
    if (R.chance(.5)) {
      const [one, A, r, Bn, ab, dig, pl] = R.pick([['inch', 'inches', 2.54, 'centimeters', 0, 254, 2], ['mile', 'miles', 1.6, 'kilometers', 1, 16, 1], ['kilogram', 'kilograms', 2.2, 'pounds', 1, 22, 1], ['foot', 'feet', 0.3, 'meters', 1, 3, 1], ['gallon', 'gallons', 3.8, 'liters', 1, 38, 1]]);
      const N = R.i(3, 25), ans = dec(N * r);
      return { text: B('1 ' + one + (ab ? ' is about ' : ' = ') + r + ' ' + Bn) + '. ' + (ab ? 'About how' : 'How') + ' many ' + Bn + ' is ' + B(N + ' ' + A) + '?', ans, unit: Bn,
        how: [W('1 ' + one + (ab ? ' ≈ ' : ' = ') + r + ' ' + Bn, 'the unit rate'), W(N + ' ' + A + ' = ' + N + ' × ' + r + ' ' + Bn, N + ' times as many'), W('= ' + B(num(ans)) + ' ' + Bn, N + ' × ' + dig + ' = ' + num(N * dig) + ', then ' + pl + ' decimal ' + plural(pl, 'place'))],
        steps: [st(B(N + ' × ' + dig) + ' = ?', N * dig), st('Put the decimal point back: ' + B(N + ' × ' + r) + ' = ?', ans)],
        traps: [tr(dec(N + r), 'g_convrate', 'Each ' + one + ' is ' + r + ' ' + Bn + ', so multiply.'), tr(dec(ans * 10), 'f_decmul', 'Count the decimal places in ' + r + ' and put the point back.'), tr(dec(ans / 10), 'f_decmul', 'Count the decimal places in ' + r + ': there ' + (pl === 1 ? 'is 1' : 'are ' + pl) + '.')] };
    }
    const [a, A, b, Bs, Bn, ab] = R.pick([[8, 'kilometers', 5, 'miles', 'miles', 1], [4, 'quarts', 1, 'gallon', 'gallons'], [16, 'ounces', 1, 'pound', 'pounds'], [2, 'cups', 1, 'pint', 'pints'], [5, 'kilograms', 11, 'pounds', 'pounds', 1], [4, 'cups', 1, 'quart', 'quarts']]);
    const X = R.i(a + 1, a * 8); if (X % a === 0) return null;
    const k = X / a, ans = dec(k * b); if (!isInt(ans * 1000)) return null;
    return { text: B(a + ' ' + A + (ab ? ' is about ' : ' = ') + b + ' ' + Bs) + '. ' + (ab ? 'About how' : 'How') + ' many ' + Bn + ' is ' + B(num(X) + ' ' + A) + '?', ans, unit: Bn,
      how: [W(a + ' ' + A + (ab ? ' ≈ ' : ' = ') + b + ' ' + Bs, 'the rate'), W(num(X) + ' ÷ ' + a + ' = ' + num(k), 'the scale factor'), W(num(k) + ' × ' + b + ' = ' + B(num(ans)) + ' ' + Bn, 'scale the other side the same way')],
      steps: [st('Scale factor: ' + B(num(X) + ' ÷ ' + a) + ' = ?', k), st(B(num(k) + ' × ' + b) + ' = ?', ans)],
      traps: [tr(X * b, 'g_convrate', 'First find how many groups of ' + a + ' are in ' + num(X) + ': divide.'), tr(Math.floor(k) * b, 'f_decdiv', num(X) + ' ÷ ' + a + ' is not a whole number. Keep the decimal part.'), tr(b === 1 ? null : dec(X / b * a), 'g_convrate', 'Check the direction: ' + a + ' ' + A + ' match ' + b + ' ' + Bn + '.')] };
  } },

{ id: 'n_opposite', s: 'count', g: 6, title: 'Opposites', pre: [], cc: ['6.NS.C.6a'],
  tip: 'The opposite of a number is the same distance from 0 on the other side: the opposite of −9 is 9. Each minus sign flips to the other side, so −(−4) = 4.',
  gen(d, R) {
    const side = v => (v < 0 ? 'left' : 'right');
    const nest = (a, k) => { let s = num(a); for (let i = 0; i < k; i++) s = MINUS + (i === 0 ? s : '(' + s + ')'); return s; };
    const nestP = (a, k) => {
      const val = a * (k % 2 ? -1 : 1), chain = [a]; for (let i = 0; i < k; i++) chain.push(-chain[i]);
      return { text: 'What is ' + B(nest(a, k)) + '?', ans: val,
        how: ['Count the minus signs: ' + k + '.', 'Each one flips to the other side of 0: ' + chain.map(num).join(' → ') + '.', (k % 2 ? 'An odd number of flips ends on the negative side: ' : 'An even number of flips ends on the positive side: ') + B(num(val)) + '.'],
        steps: [st('How many minus signs are in ' + B(nest(a, k)) + '?', k)].concat(k > 2 ? [st(B(nest(a, 2)) + ' = ?', a)] : []).concat([st('Each minus sign flips the number to the other side of 0. Flip ' + k + ' times: ' + B(nest(a, k)) + ' = ?', val)]),
        traps: [tr(-val, 'n_opposite', 'Count the minus signs again: each one flips to the other side of 0.'), tr(0, 'n_opposite', 'Opposites do not cancel to 0 here; each minus sign flips the number to the other side.')] };
    };
    if (d === 0) {
      const N = nz(R, -15, 15), A = Math.abs(N);
      if (R.chance(.7)) return { text: 'What is the opposite of ' + B(num(N)) + '?', ans: -N, vis: A <= 10 ? numLineSVG(-10, 10, 1, [{ v: N, t: num(N) }], 5) : '',
        how: ['The opposite is the same distance from 0, on the other side.', num(N) + ' is ' + A + ' to the ' + side(N) + ' of 0, so its opposite is ' + A + ' to the ' + side(-N) + ': ' + B(num(-N)) + '.'],
        steps: [st('How far is ' + B(num(N)) + ' from 0?', A), st('Start at 0. Go ' + A + ' to the ' + side(-N) + '. Where do you land?', -N)],
        traps: [tr(N, 'n_opposite', 'The opposite is on the other side of 0, so the sign changes.'), tr(0, 'n_neg', 'Only 0 is its own opposite. Go the same distance from 0 on the other side.')] };
      return { text: 'How far apart are ' + B(num(N)) + ' and its opposite on the number line?', ans: 2 * A, vis: A <= 10 ? numLineSVG(-10, 10, 1, [{ v: N, t: num(N) }], 5) : '',
        how: ['The opposite of ' + num(N) + ' is ' + num(-N) + '.', 'Each is ' + A + ' from 0, on opposite sides, so they are ' + A + ' + ' + A + ' = ' + B(2 * A) + ' apart.'],
        steps: [st('What is the opposite of ' + B(num(N)) + '?', -N), st(B(A + ' + ' + A) + ' = ?', 2 * A)],
        traps: [tr(A, 'n_abs', 'That is how far each one is from 0. They are on opposite sides, so add both distances.'), tr(0, 'n_opposite', 'A number and its opposite add to 0, but they are not in the same place.')] };
    }
    if (d === 1) {
      if (R.chance(.3)) {
        const N = nz(R, -30, 30);
        return { text: 'What is the opposite of the opposite of ' + B(num(N)) + '?', ans: N,
          how: ['The opposite of ' + num(N) + ' is ' + num(-N) + '.', 'The opposite of ' + num(-N) + ' is ' + B(num(N)) + '. Two flips bring you back.'],
          steps: [st('What is the opposite of ' + B(num(N)) + '?', -N), st('What is the opposite of ' + B(num(-N)) + '?', N)],
          traps: [tr(-N, 'n_opposite', 'That is one flip. The opposite of the opposite flips twice.')] };
      }
      return nestP(R.i(2, 30), R.i(2, 4));
    }
    const kind = R.pick(['solve', 'inside', 'apart', 'deep']);
    if (kind === 'solve') {
      const N = nz(R, -25, 25);
      return { text: 'If ' + B(MINUS + 'x = ' + num(N)) + ', what is x?', ans: -N,
        how: [MINUS + 'x means the opposite of x.', 'The opposite of x is ' + num(N) + ', so x is the opposite of ' + num(N) + ': x = ' + B(num(-N)) + '.'],
        steps: [st('In ' + B(MINUS + 'x = ' + num(N)) + ', x is the opposite of what number?', N), st('What is the opposite of ' + B(num(N)) + '?', -N)],
        traps: [tr(N, 'n_opposite', MINUS + 'x is the opposite of x, so x and ' + num(N) + ' are on opposite sides of 0.')] };
    }
    if (kind === 'inside') {
      const a = R.i(1, 15), b = a + R.i(2, 15), e = MINUS + '(' + a + ' ' + MINUS + ' ' + b + ')';
      return { text: 'What is ' + B(e) + '?', ans: b - a,
        how: ['Work inside the brackets first: ' + mi(a, b) + ' = ' + num(a - b) + '.', 'The minus sign in front means the opposite: the opposite of ' + num(a - b) + ' is ' + B(num(b - a)) + '.'],
        steps: [st(B(mi(a, b)) + ' = ?', a - b), st('What is the opposite of ' + B(num(a - b)) + '?', b - a)],
        traps: [tr(a - b, 'n_opposite', 'That is the inside. The minus sign in front flips it.'), tr(-(a + b), 'n_intsub', 'Inside first: ' + mi(a, b) + '.'), tr(a + b, 'n_intsub', 'Inside first: ' + mi(a, b) + ', then flip.')] };
    }
    if (kind === 'apart') {
      const D = 2 * R.i(3, 40);
      return { text: 'The number x is negative. On the number line, x and its opposite are ' + B(D) + ' apart. What is x?', ans: -D / 2,
        how: ['x and its opposite are the same distance from 0, one on each side.', 'So each is half of ' + D + ' from 0: ' + D + ' ÷ 2 = ' + D / 2 + '.', 'x is negative, so x = ' + B(num(-D / 2)) + '.'],
        steps: [st('The number x and its opposite are ' + D + ' apart. How far is x from 0?', D / 2), st('The number x is ' + D / 2 + ' from 0 and is negative. What is x?', -D / 2)],
        traps: [tr(D / 2, 'n_opposite', 'x is negative, so it is to the left of 0.'), tr(-D, 'n_abs', 'The ' + D + ' is from x to its opposite. x is only half that far from 0.')] };
    }
    return nestP(R.i(2, 40), R.i(5, 7));
  } },

{ id: 'n_absorder', s: 'count', g: 6, title: 'Debts and absolute value', pre: [], cc: ['6.NS.C.7d', '6.NS.C.7c'],
  tip: 'Absolute value is the size, order is the place on the number line. A balance of −$50 is a bigger debt than −$30, but it is the lower balance.',
  gen(d, R) {
    const bal = v => (v < 0 ? MINUS + '$' + Math.abs(v) : '$' + v);
    if (d === 0) {
      const kind = R.pick(['debt', 'lower', 'cold']), m = kind === 'cold' ? 1 : 5, a = R.i(kind === 'cold' ? 1 : 2, kind === 'cold' ? 25 : 18) * m;
      let b; do { b = R.i(kind === 'cold' ? 1 : 2, kind === 'cold' ? 25 : 18) * m; } while (b === a);
      const hi = Math.max(a, b), lo = Math.min(a, b);
      if (kind === 'debt') return { text: 'Two bank balances are ' + B(bal(-a)) + ' and ' + B(bal(-b)) + '. Which is the bigger debt? Type the debt in dollars.', ans: hi, unit: 'dollars',
        how: ['A balance of ' + bal(-a) + ' is a debt of $' + a + ', and ' + bal(-b) + ' is a debt of $' + b + '.', 'The bigger debt is the balance farther below 0: ' + B('$' + hi) + '. Its balance, ' + bal(-hi) + ', is the lower one.'],
        steps: [st('A balance of ' + B(bal(-a)) + ' is a debt of how many dollars?', a), st('Which is bigger, $' + a + ' or $' + b + '?', hi)],
        traps: [tr(lo, 'n_absorder', 'The bigger debt is the balance farther below 0.'), tr(-hi, 'n_abs', 'A debt is the size of the balance: type it without the minus sign.')] };
      if (kind === 'lower') return { text: 'Which balance is lower, ' + B(bal(-a)) + ' or ' + B(bal(-b)) + '? Type the balance.', ans: -hi, unit: 'dollars',
        how: ['Lower means farther left on the number line.', bal(-hi) + ' is farther below 0 than ' + bal(-lo) + ', so the lower balance is ' + B(num(-hi)) + ' dollars (the bigger debt).'],
        steps: [st('How far below 0 is ' + B(bal(-a)) + '?', a), st('How far below 0 is ' + B(bal(-b)) + '?', b), st('Which balance is lower, ' + B(bal(-a)) + ' or ' + B(bal(-b)) + '?', -hi)],
        traps: [tr(-lo, 'n_neg', 'Lower means farther left on the number line. The bigger debt is the lower balance.'), tr(hi, 'n_abs', 'A balance below 0 is negative: keep the minus sign.')] };
      return { text: 'Which is colder, ' + B(num(-a) + DEG + 'C') + ' or ' + B(num(-b) + DEG + 'C') + '? Type the colder temperature.', ans: -hi, unit: DEG + 'C',
        how: ['Colder means farther below 0.', num(-hi) + DEG + ' is ' + hi + DEG + ' below 0 and ' + num(-lo) + DEG + ' is ' + lo + DEG + ' below 0, so ' + B(num(-hi)) + DEG + 'C is colder.'],
        steps: [st('How many degrees below 0 is ' + B(num(-a) + DEG + 'C') + '?', a), st('Which is colder, ' + B(num(-a) + DEG + 'C') + ' or ' + B(num(-b) + DEG + 'C') + '?', -hi)],
        traps: [tr(-lo, 'n_neg', 'Colder means farther below 0, the bigger distance.'), tr(hi, 'n_abs', 'Both temperatures are below 0: keep the minus sign.')] };
    }
    if (d === 1) {
      if (R.chance(.5)) {
        const k = R.i(3, 8), vals = [];
        while (vals.length < 6) { const v = nz(R, -12, 12); if (!vals.includes(v) && !vals.includes(-v)) vals.push(v); }
        if (R.chance(.4)) { const i = R.i(0, 5); if (!vals.some(v => Math.abs(v) === k)) vals[i] = R.pick([k, -k]); }
        const big = vals.filter(v => Math.abs(v) > k), ans = big.length, pos = vals.filter(v => v > k).length, neg = ans - pos, ge = vals.filter(v => Math.abs(v) >= k).length;
        if (ans === 0 || ans === 6 || neg === 0) return null;
        return { text: 'How many of these numbers have an absolute value greater than ' + B(k) + '? ' + B(vals.map(num).join(', ')), ans,
          how: ['Absolute value is the distance from 0: ' + vals.map(v => '|' + num(v) + '| = ' + Math.abs(v)).join(', ') + '.', 'Greater than ' + k + ': ' + big.map(num).join(', ') + '.', 'That is ' + B(ans) + ' ' + plural(ans, 'number') + '.'],
          steps: [st('How many of the negative numbers are more than ' + k + ' from 0? ' + B(vals.map(num).join(', ')), neg), st('How many of the positive numbers are more than ' + k + '? ' + B(vals.map(num).join(', ')), pos), st('Add the two counts: ' + B(neg + ' + ' + pos) + ' = ?', ans)],
          traps: [tr(pos, 'n_abs', 'Negative numbers can be far from 0 too: |' + num(big.find(v => v < 0)) + '| = ' + Math.abs(big.find(v => v < 0)) + '.'), tr(ge !== ans ? ge : null, 'n_absorder', 'Greater than ' + k + ' does not include ' + k + ' itself.')] };
      }
      const k = R.i(4, 10) * 5, vals = [];
      while (vals.length < 6) { const v = nz(R, -18, 18) * 5; if (!vals.includes(v) && Math.abs(v) !== k) vals.push(v); }
      const ans = vals.filter(v => v < -k).length, absC = vals.filter(v => Math.abs(v) > k).length, negC = vals.filter(v => v < 0).length;
      if (ans === 0 || absC === ans || negC === ans) return null;
      return { text: 'Here are six bank balances: ' + B(vals.map(bal).join(', ')) + '. How many of them show a debt of more than ' + B('$' + k) + '?', ans,
        how: ['A debt of more than $' + k + ' means a balance below ' + bal(-k) + '.', 'Balances below ' + bal(-k) + ': ' + vals.filter(v => v < -k).map(bal).join(', ') + '.', 'That is ' + B(ans) + '. (Positive balances are money in the bank, not debts.)'],
        steps: [st('A debt of more than $' + k + ' means a balance below what number?', -k), st('How many of these balances are below ' + bal(-k) + '? ' + B(vals.map(bal).join(', ')), ans)],
        traps: [tr(absC, 'n_absorder', 'A positive balance is money in the bank, not a debt.'), tr(negC, 'n_neg', 'A debt of more than $' + k + ' means a balance below ' + bal(-k) + ', not just below 0.')] };
    }
    const kind = R.pick(['order', 'owes', 'absmax']);
    if (kind === 'order') {
      const vals = []; while (vals.length < 5) { const v = nz(R, -20, 15); if (!vals.includes(v) && !vals.includes(-v)) vals.push(v); }
      const sorted = vals.slice().sort((a, b) => a - b), byAbs = vals.slice().sort((a, b) => Math.abs(a) - Math.abs(b)), ans = sorted[1];
      if (sorted[1] >= 0 || byAbs[1] === ans) return null;
      return { text: 'Here are five temperatures in ' + DEG + 'C: ' + B(vals.map(num).join(', ')) + '. Which temperature is the second coldest?', ans, unit: DEG + 'C',
        how: ['Coldest means farthest left on the number line (the most negative).', 'In order from coldest: ' + sorted.map(num).join(', ') + '.', 'Second coldest: ' + B(num(ans)) + DEG + 'C.'],
        steps: [st('Which temperature is the coldest? ' + B(vals.map(num).join(', ')), sorted[0]), st('Which temperature is the next coldest after ' + num(sorted[0]) + '? ' + B(vals.map(num).join(', ')), ans)],
        traps: [tr(byAbs[1], 'n_absorder', 'Order by place on the number line, not by distance from 0.'), tr(sorted[3], 'n_neg', 'Coldest is the most negative: start from the far left.'), tr(sorted[0], 'n_absorder', 'That is the coldest. You need the next one.')] };
    }
    if (kind === 'owes') {
      const [A, Bn] = R.shuffle(NAMES).slice(0, 2), a = R.i(3, 30) * 5, c = R.i(2, 16) * 5;
      return { text: A + '\'s balance is ' + B(bal(-a)) + '. ' + Bn + ' owes ' + B('$' + c) + ' more than ' + A + '. What is ' + Bn + '\'s balance in dollars?', ans: -(a + c), unit: 'dollars',
        how: [A + ' owes $' + a + '.', Bn + ' owes $' + a + ' + $' + c + ' = $' + (a + c) + '.', 'Owing $' + (a + c) + ' is a balance of ' + B(num(-(a + c))) + ' dollars.'],
        steps: [st(A + ' owes $' + a + '. ' + Bn + ' owes $' + c + ' more. How many dollars does ' + Bn + ' owe?', a + c), st(Bn + ' owes $' + (a + c) + '. What is ' + Bn + '\'s balance in dollars?', -(a + c))],
        traps: [tr(c - a, 'n_intadd', 'Owing more means the balance goes farther below 0.'), tr(a + c, 'n_abs', Bn + ' owes money, so the balance is below 0.')] };
    }
    const vals = []; while (vals.length < 5) { const v = nz(R, -30, 30); if (!vals.some(w => Math.abs(w) === Math.abs(v))) vals.push(v); }
    const ans = vals.slice().sort((a, b) => Math.abs(b) - Math.abs(a))[0], mx = Math.max(...vals);
    if (ans > 0 && R.chance(.7)) return null;
    return { text: 'Which of these numbers has the greatest absolute value? ' + B(vals.map(num).join(', ')), ans,
      how: ['Absolute value is the distance from 0: ' + vals.map(v => '|' + num(v) + '| = ' + Math.abs(v)).join(', ') + '.', 'The biggest distance is ' + Math.abs(ans) + ', from ' + B(num(ans)) + '.'],
      steps: [st('What is the biggest distance from 0 in this list? ' + B(vals.map(num).join(', ')), Math.abs(ans)), st('Which of these numbers is ' + Math.abs(ans) + ' from 0? ' + B(vals.map(num).join(', ')), ans)],
      traps: [tr(mx, 'n_abs', 'Absolute value is distance from 0, so a negative number can have the biggest.'), tr(Math.abs(ans), 'n_absorder', 'Type the number itself, sign and all.')] };
  } },

{ id: 'x_exprparts', s: 'alg', g: 6, title: 'Parts of an expression', pre: [], cc: ['6.EE.A.2b'],
  tip: 'Terms are the parts joined by + or −. A coefficient is the number multiplying a letter, sign included. In 5x + 3y − 7: 3 terms, the coefficient of y is 3, the constant is −7.',
  gen(d, R) {
    const V = R.pick([['x', 'y'], ['a', 'b'], ['m', 'n'], ['p', 'q']]);
    const tstr = t => ex([t]);
    const kindD2 = d === 2 ? R.pick(['plain', 'prod', 'frac', 'xy']) : 'plain';
    if (kindD2 === 'plain') {
      let terms;
      if (d === 0) { terms = [[R.i(2, 12), V[0]], [R.i(2, 12), V[1]], [R.i(1, 20), '']]; if (R.chance(.3)) terms.splice(1, 1); }
      else {
        terms = [[nz(R, -12, 12), V[0]], [nz(R, -12, 12), V[1]], [nz(R, -20, 20), '']];
        if (R.chance(.35)) terms[R.i(0, 1)][0] = R.pick([1, -1]);
        if (d === 2 || R.chance(.3)) terms.push([nz(R, -9, 9), V[0] + '²']);
        terms = R.shuffle(terms); if (terms[0][0] < 0 && R.chance(.5)) terms.reverse();
      }
      const e = ex(terms), list = terms.map(tstr).join(', ');
      const asks = terms.filter(t => t[1]).map(t => ['coef', t]).concat([['const', terms.find(t => !t[1])], ['terms', null]]);
      const [ask, t] = R.pick(asks);
      if (ask === 'coef') {
        const c = t[0], other = terms.find(u => u[1] && u !== t), sq = /²/.test(t[1]);
        return { text: 'In ' + B(e) + ', what is the coefficient of ' + B(t[1]) + '?', ans: c,
          how: ['The terms are ' + list + '.', 'The coefficient of ' + t[1] + ' is the number multiplying it, sign included' + (Math.abs(c) === 1 ? ': ' + tstr(t) + ' means ' + num(c) + ' × ' + t[1] : '') + '. It is ' + B(num(c)) + '.'],
          steps: [st('In ' + B(e) + ', what number multiplies ' + t[1] + '? Type the minus sign too, if there is one.', c)],
          traps: [tr(c < 0 ? -c : null, 'x_exprparts', 'The minus sign in front of a term belongs to it.'), tr(other ? other[0] : null, 'x_exprparts', 'That is the coefficient of ' + (other ? other[1] : '') + '.'), tr(Math.abs(c) === 1 ? 0 : null, 'x_exprparts', 'A letter on its own has coefficient 1, or ' + MINUS + '1 with a minus sign.'), tr(sq ? 2 : null, 'w_exp', 'The small 2 is a power. The coefficient is the number in front.')] };
      }
      if (ask === 'const') {
        const c = t[0];
        return { text: 'In ' + B(e) + ', what is the constant term?', ans: c,
          how: ['The terms are ' + list + '.', 'The constant is the term with no letter: ' + B(num(c)) + (c < 0 ? '. The minus sign in front belongs to it.' : '.')],
          steps: [st('In ' + B(e) + ', which term has no letter? Type the minus sign too, if there is one.', c)],
          traps: [tr(c < 0 ? -c : null, 'x_exprparts', 'The minus sign in front of the number belongs to it.'), tr(terms[0][1] ? terms[0][0] : null, 'x_exprparts', 'That number multiplies a letter, so it is a coefficient, not the constant.')] };
      }
      const n = terms.length, letters = terms.filter(u => u[1]).length;
      return { text: 'How many terms does ' + B(e) + ' have?', ans: n,
        how: ['Terms are the parts joined by + or ' + MINUS + ': ' + list + '.', 'That is ' + B(n) + ' terms.'],
        steps: [st('The terms of ' + B(e) + ' are the parts joined by + or ' + MINUS + '. How many parts are there?', n)],
        traps: [tr(n - 1, 'x_exprparts', 'Count the terms, not the signs between them.'), tr(letters !== n ? letters : null, 'x_exprparts', 'A number on its own (the constant) is a term too.')] };
    }
    if (kindD2 === 'prod') {
      const p = R.i(2, 9), q = nz(R, -9, 9), r = R.i(2, 12) * R.pick([1, -1]), plusC = R.chance(.5), c = nz(R, -15, 15);
      const e = p + '(' + V[0] + ' ' + signed(q) + ') ' + signed(r).replace(/(\d+)$/, '$1' + V[1]) + (plusC ? ' ' + signed(c) : ''), n = plusC ? 3 : 2;
      const terms = [p + '(' + V[0] + ' ' + signed(q) + ')', num(r) + V[1]].concat(plusC ? [num(c)] : []);
      return { text: 'How many terms does ' + B(e) + ' have?', ans: n,
        how: ['A product counts as one term: ' + p + '(' + V[0] + ' ' + signed(q) + ') is ' + p + ' times a bracket, one term.', 'The terms are ' + terms.join(', ') + '. That is ' + B(n) + '.'],
        steps: [st('In ' + B(e) + ', ' + p + '(' + V[0] + ' ' + signed(q) + ') is one term. How many other terms are there?', n - 1), st('Now count ' + p + '(' + V[0] + ' ' + signed(q) + ') too. How many terms does ' + B(e) + ' have?', n)],
        traps: [tr(n + 1, 'x_exprparts', 'Everything in ' + p + '(…) is multiplied together, so it is one term.'), tr(n + 2, 'x_exprparts', 'The bracket and the number in front make one term.')] };
    }
    if (kindD2 === 'frac') {
      const k = R.i(2, 9), m = R.chance(.5) ? 1 : R.i(2, 7), c = R.i(1, 20); if (gcd(m, k) !== 1) return null;
      const top = (m === 1 ? '' : m) + V[0];
      return { text: 'In ' + B(fl(top, k) + ' + ' + c) + ', what is the coefficient of ' + B(V[0]) + '?', ans: Q(m, k), type: 'frac',
        how: [fl(top, k) + ' means ' + top + ' ÷ ' + k + ', which is ' + frac(m, k) + ' × ' + V[0] + '.', 'So the coefficient is ' + B(frac(m, k)) + '.'],
        steps: [st(fl(top, k) + ' = ' + fl('?', k) + ' × ' + V[0] + '. What number is missing on top?', m), st('What is the coefficient of ' + V[0] + ' in ' + fl(top, k) + '?', Q(m, k), { type: 'frac' })],
        traps: [tr(k, 'x_exprparts', 'Dividing by ' + k + ' is the same as multiplying by ' + frac(1, k) + '.'), tr(m > 1 ? m : null, 'x_exprparts', 'The ' + m + V[0] + ' is also divided by ' + k + '.'), tr(c, 'x_exprparts', 'The ' + c + ' is the constant term.')] };
    }
    const c1 = nz(R, -12, 12), c2 = nz(R, -12, 12), c3 = nz(R, -15, 15); if (Math.abs(c1) === 1 || c1 === c2) return null;
    const e = ex([[c1, V[0] + V[1]], [c2, V[0]], [c3, '']]);
    return { text: 'In ' + B(e) + ', what is the coefficient of ' + B(V[0] + V[1]) + '?', ans: c1,
      how: ['The terms are ' + ex([[c1, V[0] + V[1]]]) + ', ' + ex([[c2, V[0]]]) + ' and ' + num(c3) + '.', V[0] + V[1] + ' is one letter part, ' + V[0] + ' times ' + V[1] + '. The number multiplying it is ' + B(num(c1)) + '.'],
      steps: [st('In ' + B(e) + ', what number multiplies ' + V[0] + V[1] + '? Type the minus sign too, if there is one.', c1)],
      traps: [tr(c2, 'x_exprparts', 'That is the coefficient of ' + V[0] + ' on its own. ' + V[0] + V[1] + ' is a different letter part.'), tr(c1 < 0 ? -c1 : null, 'x_exprparts', 'The minus sign in front of a term belongs to it.')] };
  } },

{ id: 'x_twovars', s: 'alg', g: 6, title: 'Two quantities that change together', pre: ['f_rate'], cc: ['6.EE.C.9'],
  tip: 'When y depends on x, find the rule: times (y = kx) or plus (y = x + c). Check it on two rows. Hours and pay: 2 → 24, 5 → 60, so pay = 12 × hours.',
  gen(d, R) {
    if (d === 0) {
      const C0 = R.pick([['d', 't', 'miles', 'hours', 'A car drives at a steady speed. In t hours the car goes d miles. The rule is', 35, 75], ['c', 'n', 'dollars', 'tickets', 'Every ticket costs the same. The cost of n tickets is c dollars. The rule is', 3, 15],
        ['p', 'h', 'dollars', 'hours', 'A job pays by the hour. The pay for h hours is p dollars. The rule is', 8, 20], ['w', 'm', 'liters', 'minutes', 'A tap fills a tub. After m minutes the tub holds w liters. The rule is', 4, 12],
        ['a', 's', 'years', 'years', 'Ava is older than Sam. Ava\'s age is a. Sam\'s age is s. The rule is', 2, 9, 1], ['t', 'b', 'points', 'baskets', 'Each basket is worth the same number of points. A team gets t points for b baskets. The rule is', 2, 3]]);
      const [y, x, yu, xu, story, lo, hi, add] = C0, k = R.i(lo, hi), X = R.i(add ? 5 : 2, add ? 40 : 12), ans = add ? X + k : k * X, eq = y + ' = ' + (add ? x + ' + ' + k : k + x);
      return { text: story + ' ' + B(eq) + '. What is ' + y + ' when ' + B(x + ' = ' + X) + '?', ans, unit: yu,
        how: ['Put ' + x + ' = ' + X + ' into ' + eq + '.', y + ' = ' + (add ? X + ' + ' + k : k + ' × ' + X) + ' = ' + B(num(ans)) + ' ' + yu + '.'],
        steps: [st(B(add ? X + ' + ' + k : k + ' × ' + X) + ' = ?', ans)],
        traps: [tr(add ? k * X : k + X, 'x_eval', add ? x + ' + ' + k + ' means add ' + k + '.' : k + x + ' means ' + k + ' × ' + x + '.'), tr(add ? null : ans + k, fx(k, X), 'Check ' + k + ' × ' + X + '.')] };
    }
    const mult = R.chance(.6), k = mult ? R.i(2, d === 2 ? 25 : 15) : R.i(2, 40);
    const C1 = mult ? R.pick([['hours worked (x)', 'dollars earned (y)'], ['tickets (x)', 'cost in dollars (y)'], ['minutes (x)', 'pages read (y)'], ['boxes (x)', 'pencils (y)'], ['weeks (x)', 'dollars saved (y)']])
      : R.pick([['Sam\'s age (x)', 'Ava\'s age (y)'], ['points scored (x)', 'points with the bonus (y)'], ['price in dollars (x)', 'price with shipping (y)'], ['Leo\'s place in line (x)', 'Mia\'s place in line (y)']]);
    const xs = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 3).sort((a, b) => a - b);
    if (xs[1] - xs[0] === xs[2] - xs[1] && R.chance(.6)) return null;
    const f = v => (mult ? k * v : v + k), ys = xs.map(f), rule = 'y = ' + (mult ? k + 'x' : 'x + ' + k);
    const chk = [0, 1].map(i => mult ? ys[i] + ' = ' + k + ' × ' + xs[i] : ys[i] + ' = ' + xs[i] + ' + ' + k).join(', ');
    const found = (mult ? 'Every y is ' + k + ' times its x: ' : 'Every y is ' + k + ' more than its x: ') + chk + '.';
    const rev = d === 2 && R.chance(.4);
    let X; do { X = d === 2 ? R.i(12, 60) : R.i(4, 14); } while (xs.includes(X));
    const Y = f(X), wrongAdd = X + ys[0] - xs[0], wrongMul = isInt(ys[0] / xs[0]) ? X * ys[0] / xs[0] : null;
    if (!rev) return { text: 'These two amounts change together. What is the missing number?', ans: Y, vis: table([[C1[0], ...xs, X], [C1[1], ...ys, '?']]),
      how: [found, 'Rule: ' + rule + '.', 'x = ' + X + ': y = ' + (mult ? k + ' × ' + X : X + ' + ' + k) + ' = ' + B(num(Y)) + '.'],
      steps: [st('When x is ' + xs[0] + ', y is ' + ys[0] + '. When x is ' + xs[1] + ', y is ' + ys[1] + '. ' + (mult ? 'What do you multiply x by to get y?' : 'What do you add to x to get y?'), k), st('The rule is ' + B(rule) + '. What is y when x = ' + X + '?', Y)],
      traps: [tr(mult ? wrongAdd : wrongMul, 'x_twovars', 'Check your rule on another row: it has to work for every row.'), tr(ys[2] + ys[2] - ys[1], 'p_rule', 'The x values do not go up by the same steps, so use the rule, not the jumps.'), tr(mult ? Y + k : null, fx(k, X), 'Check ' + k + ' × ' + X + '.')] };
    return { text: 'These two amounts change together. What is the missing number?', ans: X, vis: table([[C1[0], ...xs, '?'], [C1[1], ...ys, num(Y)]]),
      how: [found, 'Rule: ' + rule + '.', 'Undo it for y = ' + num(Y) + ': x = ' + (mult ? num(Y) + ' ÷ ' + k : num(Y) + ' ' + MINUS + ' ' + k) + ' = ' + B(X) + '.'],
      steps: [st('When x is ' + xs[0] + ', y is ' + ys[0] + '. When x is ' + xs[1] + ', y is ' + ys[1] + '. ' + (mult ? 'What do you multiply x by to get y?' : 'What do you add to x to get y?'), k), st('The rule is ' + B(rule) + '. What is x when y = ' + num(Y) + '?', X)],
      traps: [tr(mult ? Y * k : Y + k, 'x_onestep', 'Undo the rule: do the opposite to y.'), tr(mult ? Y - ys[0] + xs[0] : (isInt(Y * xs[0] / ys[0]) ? Y * xs[0] / ys[0] : null), 'x_twovars', 'Check your rule on another row: it has to work for every row.')] };
  } },

{ id: 'g_fracbox', s: 'meas', g: 6, title: 'Volume with fraction edges', pre: ['f_mult'], paper: true, cc: ['6.G.A.2'],
  tip: 'V = length × width × height works for fraction edges too. Write mixed numbers as fractions first: 1½ × 2 × ¾ = 3/2 × 2 × 3/4 = 18/8 = 2¼ cm³.',
  gen(d, R) {
    const U = R.pick(['cm', 'm', 'in', 'ft']), U3 = U + '³';
    if (d < 2) {
      let e;
      if (d === 0) { const f = R.pick([[1, 2], [1, 3], [1, 4], [3, 4], [2, 3], [1, 5], [2, 5]]); e = R.shuffle([Q(R.i(2, 8)), Q(R.i(2, 8)), Q(f[0], f[1])]); }
      else {
        const dn = R.pick([2, 3, 4, 5]), w = R.i(1, 3), nn = R.i(1, dn - 1); if (gcd(nn, dn) !== 1) return null;
        const f = R.pick([[1, 2], [1, 3], [1, 4], [3, 4], [2, 3], [3, 5], [5, 6]]); e = R.shuffle([Q(w * dn + nn, dn), Q(f[0], f[1]), Q(R.i(2, 6))]);
      }
      const V = e.reduce(qmul, Q(1)), tops = e.map(q => q.n), bots = e.map(q => q.d), top = tops.reduce((a, b) => a * b, 1), bot = bots.reduce((a, b) => a * b, 1);
      const mixedOne = e.find(q => q.n > q.d && q.d > 1), done = V.n === top && V.d === bot && V.n < V.d;
      const how = ['V = length × width × height', mixedOne ? W('V = ' + e.map(qs).join(' × '), qm(mixedOne) + ' = ' + qs(mixedOne)) : 'V = ' + e.map(qm).join(' × '),
        '= ' + fl(tops.join(' × '), bots.join(' × ')), '= ' + (done ? B(frac(top, bot)) : frac(top, bot) + ' = ' + B(qm(V))) + ' ' + U3];
      const wholeOnly = mixedOne ? e.map(q => (q === mixedOne ? Q(Math.floor(q.n / q.d)) : q)).reduce(qmul, Q(1)) : null;
      return { text: 'A box is ' + B(e.map(qm).join(' ' + U + ' by ') + ' ' + U) + '. What is its volume?', ans: V, type: 'frac', unit: U3, vis: boxSVG(qt(e[0]) + ' ' + U, qt(e[1]) + ' ' + U, qt(e[2]) + ' ' + U),
        how, steps: [st('Multiply the tops: ' + B(tops.join(' × ')) + ' = ?', top), st('Multiply the bottoms: ' + B(bots.join(' × ')) + ' = ?', bot), st('The tops make ' + top + ' and the bottoms make ' + bot + '. What is the volume?', V, { type: 'frac', unit: U3 })],
        traps: [tr(e.reduce(qadd, Q(0)), 'g_volume', 'Volume multiplies the three edges; it does not add them.'), tr(Q(top, 1), 'f_mult', 'Multiply the bottoms too, then divide.'), tr(wholeOnly, 'f_mixed', 'Change ' + (mixedOne ? qm(mixedOne) : '') + ' to a fraction first; do not drop its fraction part.')] };
    }
    const k = R.pick([2, 2, 3, 4]), m = [R.i(2, 3 * k), R.i(2, 3 * k), R.i(2, 2 * k)];
    if (m.every(v => v % k === 0)) return null;
    const edges = m.map(v => Q(v, k)), cnt = m[0] * m[1] * m[2], k3 = k * k * k, V = Q(cnt, k3), cube = frac(1, k);
    if (R.chance(.55)) return { text: 'A box is ' + B(edges.map(qm).join(' ' + U + ' by ') + ' ' + U) + '. How many cubes with ' + B(cube + ' ' + U) + ' edges fill it exactly?', ans: cnt,
      vis: boxSVG(qt(edges[0]) + ' ' + U, qt(edges[1]) + ' ' + U, qt(edges[2]) + ' ' + U),
      how: [W('cubes along each edge: ' + edges.map((q, i) => qm(q) + ' ÷ ' + cube + ' = ' + m[i]).join(', '), k + ' cubes fit in every ' + U),
        'cubes in all: ' + m.join(' × ') + ' = ' + B(num(cnt)),
        W('check: ' + num(cnt) + ' × ' + frac(1, k3) + ' ' + U3 + ' = ' + qm(V) + ' ' + U3, 'each cube is ' + cube + ' × ' + cube + ' × ' + cube + ' = ' + frac(1, k3) + ' ' + U3)],
      steps: [st('How many ' + cube + ' ' + U + ' cubes fit along the ' + qm(edges[0]) + ' ' + U + ' edge?', m[0]), st('How many ' + cube + ' ' + U + ' cubes fit along the ' + qm(edges[1]) + ' ' + U + ' edge?', m[1]), st('How many ' + cube + ' ' + U + ' cubes fit along the ' + qm(edges[2]) + ' ' + U + ' edge?', m[2]), st('Cubes in all: ' + B(m.join(' × ')) + ' = ?', cnt)],
      traps: [isInt(qv(V)) ? tr(qv(V), 'g_fracbox', 'That is the volume in ' + U3 + '. Each small cube is only ' + frac(1, k3) + ' ' + U3 + '.') : null, tr(cnt / k, 'g_fracbox', 'Every edge holds ' + k + ' cubes per ' + U + ', so count along all three edges.'), tr(sum(m), 'g_volume', 'Multiply the cubes along the edges, do not add them.')] };
    return { text: 'Small cubes with ' + B(cube + ' ' + U) + ' edges fill a box exactly. The box is ' + B(m[0] + ' cubes') + ' long, ' + B(m[1] + ' cubes') + ' wide and ' + B(m[2] + ' cubes') + ' tall. What is the volume of the box?', ans: V, type: 'frac', unit: U3,
      how: ['cubes: ' + m.join(' × ') + ' = ' + num(cnt), 'one cube: ' + cube + ' × ' + cube + ' × ' + cube + ' = ' + frac(1, k3) + ' ' + U3, 'volume: ' + num(cnt) + ' × ' + frac(1, k3) + ' = ' + frac(cnt, k3) + (V.d === k3 && V.n < V.d ? '' : ' = ' + B(qm(V))) + ' ' + U3],
      steps: [st('How many cubes? ' + B(m.join(' × ')) + ' = ?', cnt), st('Volume of one cube: ' + B(cube + ' × ' + cube + ' × ' + cube) + ' = ?', Q(1, k3), { type: 'frac' }), st('Volume: ' + B(num(cnt) + ' × ' + frac(1, k3)) + ' = ?', V, { type: 'frac' })],
      traps: [tr(Q(cnt, 1), 'g_fracbox', 'Each cube is ' + frac(1, k3) + ' ' + U3 + ', not 1 ' + U3 + '.'), tr(Q(cnt, k), 'w_exp', 'A cube with ' + cube + ' ' + U + ' edges has volume ' + cube + ' × ' + cube + ' × ' + cube + '.'), tr(Q(cnt, k * k), 'w_exp', 'Cube the edge: ' + cube + ' three times.')] };
  } },

{ id: 'd_dotplot', s: 'data', g: 6, title: 'Read a dot plot', pre: ['n_numline'], cc: ['6.SP.B.5a'],
  tip: 'Each dot is one observation. Count all the dots to find how many there are. The tallest column is the most common value: read the number under it, not its height.',
  gen(d, R) {
    const C0 = R.pick([['the goals scored in each game', 'goals', 0, 'goals in all the games', 'number of goals', 'games had', 'goal', 'goals'], ['how many pets each student owns', 'pets', 0, 'pets owned by all the students', 'number of pets', 'students own', 'pet', 'pets'], ['how many minutes each student takes to walk to school', 'minutes', 3, 'minutes walked by all the students', 'number of minutes', 'students take', 'minute', 'minutes'],
      ['how many books each student read this month', 'books', 0, 'books read by all the students', 'number of books', 'students read', 'book', 'books'], ['how many siblings each student has', 'siblings', 0, null, 'number of siblings', 'students have', 'sibling', 'siblings'], ['the shoe size of each student in a class', 'shoe size', 3, null, 'shoe size', 'students have a shoe size of', '', '']]);
    const lo = C0[2] + R.i(0, 2), n = R.i(5, d === 0 ? 6 : 8), hi = lo + n - 1;
    /* no long counts: a column has at most 4 dots (seen at a glance) and the whole plot at most 12 */
    const counts = Array.from({ length: n }, () => R.i(0, d === 0 ? 3 : 4)), total = sum(counts);
    if (total < 6 || total > (d === 0 ? 10 : 12)) return null;
    const vis = dotPlotSVG(lo, hi, counts, C0[1]), at = v => counts[v - lo], intro = 'The dot plot shows ' + C0[0] + '. ', dots = (cs => 'The plot has ' + cs[0][1] + (cs[0][1] === 1 ? ' dot' : ' dots') + ' over the number ' + num(cs[0][0]) + (cs.length > 1 ? ', then ' + cs.slice(1).map(q => q[1] + ' over ' + num(q[0])).join(', ') : '') + '. ')(counts.map((c, i) => [lo + i, c]).filter(q => q[1]));
    const kind = R.pick(d === 0 ? ['count', 'mode'] : d === 1 ? ['more', 'least', 'mode'] : ['total', 'fracmore']);
    const mx = Math.max(...counts), cols = counts.filter(c => c).length;
    if (kind === 'count') return { text: intro + 'Each dot is one observation. How many observations are there?', ans: total, vis,
      how: ['Each dot is one observation.', 'Add the dots in each column: ' + counts.filter(c => c).join(' + ') + ' = ' + B(total) + '.'],
      steps: [st(dots + 'How many dots are over ' + num(lo + counts.indexOf(mx)) + '?', mx), st(dots + 'How many dots are there in all?', total)],
      traps: [tr(cols, 'd_dotplot', 'Count every dot, not every column.'), tr(mx, 'd_dotplot', 'That is the tallest column. Count all the dots.'), tr(n, 'd_dotplot', 'That is how many values are on the line. Count the dots.')] };
    if (kind === 'mode') {
      if (counts.filter(c => c === mx).length > 1) return null;
      const v = lo + counts.indexOf(mx);
      return { text: intro + 'What is the most common ' + C0[4] + '?', ans: v, vis,
        how: ['The most common value has the tallest column.', 'The tallest column has ' + mx + ' dots, over ' + B(num(v)) + '.'],
        steps: [st(dots + 'How many dots are in the tallest column?', mx), st(dots + 'Which number has the most dots over it?', v)],
        traps: [tr(mx, 'd_dotplot', 'That is how many dots are in the tallest column. Type the value under it.'), tr(total, 'd_dotplot', 'That is how many observations there are. Find the tallest column.')] };
    }
    if (kind === 'more' || kind === 'least' || kind === 'fracmore') {
      const v = R.i(lo + 1, hi - 1), inc = kind === 'least', pass = w => (inc ? w >= v : w > v), sel = counts.map((c, i) => [lo + i, c]).filter(q => pass(q[0]) && q[1]);
      const ans = sel.reduce((a, q) => a + q[1], 0), withV = ans + (inc ? -at(v) : at(v)), below = total - ans - (inc ? 0 : at(v));
      if (!ans || !at(v) || ans === total) return null;
      const phrase = inc ? 'at least ' + num(v) : 'more than ' + num(v), noun = v === 1 ? C0[6] : C0[7], asked = C0[5] + ' ' + phrase + (noun ? ' ' + noun : ''), over = inc ? 'How many dots are over ' + num(v) + ' or a bigger number?' : 'How many dots are over numbers bigger than ' + num(v) + '?';
      const how0 = cap(phrase) + ' means the columns ' + (inc ? 'from ' + num(v) + ' to the right' : 'to the right of ' + num(v)) + ': ' + sel.map(q => q[1] + ' over ' + num(q[0])).join(', ') + '.';
      if (kind === 'fracmore') {
        const F = Q(ans, total);
        return { text: intro + 'What fraction of the ' + asked + '?', ans: F, type: 'frac', vis,
          how: [how0, 'That is ' + sel.map(q => q[1]).join(' + ') + ' = ' + ans + ' of the ' + total + ' observations.', 'Fraction: ' + frac(ans, total) + (F.d !== total ? ' = ' + B(qs(F)) : '') + '.'],
          steps: [st(dots + over, ans), st(dots + 'How many dots are there in all?', total), st('Write ' + ans + ' out of ' + total + ' as a fraction.', F, { type: 'frac' })],
          traps: [tr(Q(ans, total - ans), 'd_prob', 'Compare with all the observations, not with the rest.'), tr(Q(withV, total), 'd_dotplot', 'More than ' + num(v) + ' does not include the ' + num(v) + ' column.'), tr(ans, 'd_dotplot', 'That is how many. Write it as a fraction of all ' + total + '.')] };
      }
      return { text: intro + 'How many ' + asked + '?', ans, vis,
        how: [how0, 'Add them: ' + sel.map(q => q[1]).join(' + ') + ' = ' + B(ans) + '.'],
        steps: [st(dots + 'How many dots are over ' + num(v) + '?', at(v)), st(dots + over, ans)],
        traps: [tr(withV, 'd_dotplot', inc ? 'At least ' + num(v) + ' includes the ' + num(v) + ' column.' : 'More than ' + num(v) + ' does not include the ' + num(v) + ' column.'), tr(below, 'd_dotplot', 'Those are the smaller values. ' + cap(phrase) + ' means to the right.'), tr(sel.length, 'd_dotplot', 'Count the dots, not the columns.')] };
    }
    if (!C0[3]) return null;
    const prods = counts.map((c, i) => [lo + i, c]).filter(q => q[1]), tot = prods.reduce((a, q) => a + q[0] * q[1], 0);
    return { text: intro + 'What is the total number of ' + C0[3] + '?', ans: tot, vis,
      how: ['Each dot adds the value under it, so multiply each value by its number of dots.', prods.map(q => num(q[0]) + ' × ' + q[1]).join(', ') + ': ' + prods.map(q => num(q[0] * q[1])).join(' + ') + ' = ' + B(num(tot)) + '.'],
      steps: [st(dots + 'How many dots are there in all?', total), st(dots + 'Each dot counts as the number under it. What do all the dots add up to?', tot)],
      traps: [tr(total, 'd_dotplot', 'That is how many observations. Each dot is worth the value under it.'), tr(prods.reduce((a, q) => a + q[0], 0), 'd_dotplot', 'A column with 3 dots counts its value 3 times.')] };
  } },

{ id: 'fa_factorsum', s: 'fact', g: 6, title: 'Pull out the common factor', pre: ['x_distribute'], cc: ['6.NS.B.4'],
  tip: 'Two multiples of the same number: write that number outside brackets. 36 + 8 = 4 × 9 + 4 × 2 = 4(9 + 2). With the greatest common factor, the numbers left inside share no factor.',
  gen(d, R) {
    const commons = (a, b) => { const out = []; for (let i = 1; i <= Math.min(a, b); i++) if (a % i === 0 && b % i === 0) out.push(i); return out; };
    if (d === 0) {
      const G = R.i(2, 9), a = R.i(2, 12), b = R.i(1, 12); if (a === b) return null;
      const m = G * a, n = G * b; if (m > 100 || n > 100) return null;
      const second = R.chance(.6), ans = second ? b : a, giv = second ? m : n;
      const e = m + ' + ' + n + ' = ' + G + '(' + (second ? a + ' + ?' : '? + ' + b) + ')';
      return { text: 'What is the missing number? ' + B(e), ans,
        how: [m + ' = ' + G + ' × ' + a + ' and ' + n + ' = ' + G + ' × ' + b + '.', m + ' + ' + n + ' = ' + G + ' × ' + a + ' + ' + G + ' × ' + b + ' = ' + G + '(' + (second ? a + ' + ' + B(b) : B(a) + ' + ' + b) + ').'],
        steps: [st(B((second ? n : m) + ' ÷ ' + G) + ' = ?', ans), st('Check: ' + B(G + ' × ' + (a + b)) + ' = ?', m + n)],
        traps: [tr((second ? n : m) - G, 'fa_factorsum', 'Take the ' + G + ' out by dividing: ' + (second ? n : m) + ' ÷ ' + G + '.'), tr(second ? n : m, 'x_distribute', 'The ' + G + ' outside multiplies the missing number too.'), tr(giv / G === ans ? null : (m + n) / G, 'fa_factorsum', 'The missing number is only one of the two numbers inside the brackets.')] };
    }
    let a, b; do { a = R.i(1, 11); b = R.i(2, 12); } while (a === b || gcd(a, b) !== 1);
    const G = R.i(2, Math.floor(100 / Math.max(a, b))), m = G * a, n = G * b; if (G > 18) return null;
    const cf = commons(m, n), lower = cf.filter(c => c < G && c > 1), g2 = lower.length ? lower[lower.length - 1] : null, L = m * n / G;
    const why2 = g2 ? 'That is a common factor, but not the greatest.' : '';
    if (d === 1) {
      if (R.chance(.4)) return { text: 'What is the missing number? ' + B(m + ' + ' + n + ' = ?(' + a + ' + ' + b + ')'), ans: G,
        how: ['The number outside times ' + a + ' must give ' + m + ': ' + m + ' ÷ ' + a + ' = ' + G + '.', 'Check: ' + G + ' × ' + b + ' = ' + n + '. So ' + m + ' + ' + n + ' = ' + B(G) + '(' + a + ' + ' + b + ').'],
        steps: [st(B(m + ' ÷ ' + a) + ' = ?', G), st('Check: ' + B(G + ' × ' + b) + ' = ?', n)],
        traps: [tr(m - a, 'fa_factorsum', 'The number outside multiplies ' + a + ' to make ' + m + ': divide.'), tr(m + n - a - b, 'fa_factorsum', 'The number outside multiplies, so divide to find it.')] };
      if (!g2 && R.chance(.7)) return null;
      return { text: B(m + ' + ' + n + ' = G(a + b)') + '. G is the greatest common factor of ' + m + ' and ' + n + '. What is G?', ans: G,
        how: ['Common factors of ' + m + ' and ' + n + ': ' + cf.join(', ') + '.', 'The greatest is ' + B(G) + ': ' + m + ' + ' + n + ' = ' + G + '(' + a + ' + ' + b + ').'],
        steps: [st(B(m + ' ÷ ' + G) + ' = ?', a), st(B(n + ' ÷ ' + G) + ' = ?', b), st(G + ' goes into both ' + m + ' and ' + n + ', and no bigger number does. What is the greatest common factor of ' + m + ' and ' + n + '?', G)],
        traps: [tr(g2, 'fa_gcf', why2), tr(L <= 400 ? L : null, 'fa_lcm', 'That is a common multiple. You need a number that goes into both.'), tr(a + b, 'fa_factorsum', 'That is what is left inside the brackets. The question asks for the number outside.')] };
    }
    if (R.chance(.5)) {
      const v = R.pick(['x', 'y', 'n']), ea = m + v + ' + ' + n;
      if (!g2 && R.chance(.6)) return null;
      return { text: 'What is the missing number? ' + B(ea + ' = ?(' + (a === 1 ? '' : a) + v + ' + ' + b + ')'), ans: G,
        how: ['The greatest common factor of ' + m + ' and ' + n + ' is ' + G + '.', m + v + ' = ' + G + ' × ' + (a === 1 ? '' : a) + v + ' and ' + n + ' = ' + G + ' × ' + b + ', so ' + ea + ' = ' + B(G) + '(' + (a === 1 ? '' : a) + v + ' + ' + b + ').'],
        steps: [st('What times ' + b + ' is ' + n + '?', G), st('Check: ' + B(G + ' × ' + a) + ' = ?', m)],
        traps: [tr(g2, 'fa_gcf', why2), tr(n - b, 'fa_factorsum', 'The number outside multiplies: ' + n + ' ÷ ' + b + '.')] };
    }
    if (!g2 && R.chance(.6)) return null;
    return { text: B(m + ' + ' + n + ' = G(a + b)') + '. G is the greatest common factor of ' + m + ' and ' + n + '. What is a + b?', ans: a + b,
      how: ['The greatest common factor of ' + m + ' and ' + n + ' is G = ' + G + '.', m + ' ÷ ' + G + ' = ' + a + ' and ' + n + ' ÷ ' + G + ' = ' + b + '.', m + ' + ' + n + ' = ' + G + '(' + a + ' + ' + b + '), so a + b = ' + B(a + b) + '.'],
      steps: [st('What is the greatest common factor of ' + m + ' and ' + n + '?', G), st(B(m + ' ÷ ' + G) + ' = ?', a), st(B(n + ' ÷ ' + G) + ' = ?', b)],
      traps: [tr(g2 ? (m + n) / g2 : null, 'fa_gcf', 'Use the greatest common factor, so nothing more can come out of the brackets.'), tr(G, 'fa_factorsum', 'That is G, the number outside. Add the two numbers inside.'), tr(m + n, 'fa_factorsum', 'Divide both numbers by the greatest common factor first.')] };
  } },

{ id: 'd_mad', s: 'data', g: 6, title: 'Mean absolute deviation', pre: ['n_abs'], paper: true, cc: ['6.SP.B.5c'],
  tip: 'MAD is the average distance from the mean. Find the mean, write how far each number is from it (never negative), then find the mean of those distances. 2, 4, 6, 8: mean 5, distances 3, 1, 1, 3, MAD 2.',
  gen(d, R) {
    const n = d === 0 ? 4 : d === 1 ? 5 : R.pick([5, 6]), m = d === 2 ? R.i(20, 90) : R.i(8, 30), dev = [];
    for (let i = 0; i < n - 1; i++) dev.push(R.i(-7, 7));
    const last = -sum(dev); if (Math.abs(last) > 9) return null; dev.push(last);
    const vals = dev.map(v => m + v), dist = dev.map(Math.abs), T = sum(dist), mad = T / n, S = sum(vals);
    if (Math.min(...vals) < 1 || T === 0 || !isInt(mad * 100) || (d === 0 && !isInt(mad * 2))) return null;
    const ctx = R.pick(['quiz scores', 'reading times in minutes', 'game scores', 'jump-rope counts', 'plant heights in cm']);
    return { text: 'Here are ' + n + ' ' + ctx + ': ' + B(vals.join(', ')) + '.' + (d === 0 ? ' Their mean is ' + B(m) + '.' : '') + ' What is the mean absolute deviation (MAD)?', ans: mad,
      how: [d === 0 ? W('mean = ' + m, 'given') : 'mean = (' + vals.join(' + ') + ') ÷ ' + n + ' = ' + S + ' ÷ ' + n + ' = ' + m,
        W('distances from ' + m + ': ' + dist.join(', '), 'how far each number is from the mean, never negative'),
        'total distance = ' + dist.join(' + ') + ' = ' + T,
        'MAD = ' + T + ' ÷ ' + n + ' = ' + B(num(mad))],
      steps: (d === 0 ? [] : [st('What is the mean of ' + B(vals.join(', ')) + '?', m)]).concat([st('How far is ' + vals[0] + ' from ' + m + '?', dist[0]), st('The numbers are ' + B(vals.join(', ')) + '. Find how far each one is from ' + m + '. What do the distances add up to?', T), st(B(T + ' ÷ ' + n) + ' = ?', mad)]),
      traps: [tr(0, 'n_abs', 'Distances are never negative. Use how far each number is from the mean.'), tr(T, 'd_mad', 'That is the total distance. Divide it by how many numbers there are.'), tr(dec(T / (n - 1)), 'd_mad', 'Divide by how many numbers there are: ' + n + '.'), tr(Math.max(...vals) - Math.min(...vals), 'd_median', 'That is the range. MAD is the average distance from the mean.')] };
  } },

/* ======================= Grade 7 ======================= */
{ id: 'f_fracrate', s: 'frac', g: 7, title: 'Unit rates with fractions', pre: ['x_rate'], paper: true, cc: ['7.RP.A.1'],
  tip: 'A unit rate is the amount for 1. Divide the amount by the time (or the part of a batch), even when both are fractions. 1/2 mile in 1/4 hour: 1/2 ÷ 1/4 = 1/2 × 4 = 2 miles per hour.',
  gen(d, R) {
    let A, T;
    if (d === 0) { const a = R.i(2, 4), b = R.i(2, 8); if (a === b) return null; A = Q(1, a); T = Q(1, b); }
    else if (d === 1) { const q = R.i(2, 8), s = R.i(2, 8); A = Q(R.i(1, q - 1), q); T = Q(R.i(1, s - 1), s); if (A.d !== q || T.d !== s || qv(T) === qv(A)) return null; }
    else { const q = R.pick([2, 3, 4, 5]), s = R.pick([2, 3, 4, 6]); A = Q(R.i(1, 3) * q + R.i(1, q - 1), q); T = R.chance(.75) ? Q(R.i(1, s - 1), s) : Q(3, 2); if (gcd(A.n, A.d) !== 1 || qv(T) >= qv(A) * 2) return null; }
    const rate = qdiv(A, T), who = R.pick(NAMES), many = q => qv(q) > 1;
    const ctx = R.pick([
      [who + ' walks ' + B(qm(A)) + ' ' + (many(A) ? 'miles' : 'mile') + ' in ' + B(qm(T)) + ' ' + (many(T) ? 'hours' : 'hour') + '. How many miles per hour is that?', 'miles per hour', 'hour'],
      ['A recipe uses ' + B(qm(A)) + ' ' + (many(A) ? 'cups' : 'cup') + ' of sugar for ' + B(qm(T)) + (many(T) ? ' batches' : ' of a batch') + '. How many cups of sugar does a whole batch need?', 'cups', 'batch'],
      [who + ' paints ' + B(qm(A)) + (many(A) ? ' walls' : ' of a wall') + ' in ' + B(qm(T)) + ' ' + (many(T) ? 'hours' : 'hour') + '. How many walls per hour is that?', 'walls per hour', 'hour'],
      ['A tap fills ' + B(qm(A)) + (many(A) ? ' buckets' : ' of a bucket') + ' in ' + B(qm(T)) + ' ' + (many(T) ? 'minutes' : 'minute') + '. How many buckets per minute is that?', 'buckets per minute', 'minute'],
      [who + ' bikes ' + B(qm(A)) + ' km in ' + B(qm(T)) + ' ' + (many(T) ? 'hours' : 'hour') + '. How many km per hour is that?', 'km per hour', 'hour']]);
    const mixedIn = A.n > A.d || T.n > T.d, flip = Q(T.d, T.n), top = A.n * T.d, bot = A.d * T.n;
    const how = [W('rate = ' + qm(A) + ' ÷ ' + qm(T), 'amount ÷ ' + ctx[2] + (ctx[2] === 'batch' ? 'es' : 's') + ', to get the amount for 1 ' + ctx[2])];
    if (mixedIn) how.push(W('= ' + qs(A) + ' ÷ ' + qs(T), 'mixed numbers as fractions'));
    how.push(W('= ' + qs(A) + ' × ' + frac(T.d, T.n), 'dividing by a fraction is multiplying by its flip'));
    how.push('= ' + frac(top, bot) + (rate.n === top && rate.n < rate.d ? '' : ' = ' + B(qm(rate))) + ' ' + ctx[1]);
    if (rate.n === top && rate.n < rate.d) how[how.length - 1] = '= ' + B(frac(top, bot)) + ' ' + ctx[1];
    return { text: ctx[0], ans: rate, type: 'frac', unit: ctx[1], how,
      steps: [st('Dividing by ' + qs(T) + ' is the same as multiplying by what?', flip, { type: 'frac' }), st(B(qs(A) + ' × ' + frac(T.d, T.n)) + ' = ?', rate, { type: 'frac', unit: ctx[1] })],
      traps: [tr(qdiv(T, A), 'f_fracrate', 'The rate is amount per ' + ctx[2] + ': divide the amount by the ' + ctx[2] + (ctx[2] === 'batch' ? 'es' : 's') + '.'), tr(qmul(A, T), 'f_divfrac', 'Dividing by a fraction means multiplying by its flip.'), tr(A, 'f_fracrate', 'That is for ' + qm(T) + ' ' + (many(T) ? ctx[2] + (ctx[2] === 'batch' ? 'es' : 's') : ctx[2]) + '. Find the amount for 1 whole ' + ctx[2] + '.')] };
  } },

{ id: 'f_isprop', s: 'frac', g: 7, title: 'Proportional or not?', pre: ['x_twovars'], cc: ['7.RP.A.2a'],
  tip: 'In a proportional table, y ÷ x is the same in every row. Divide each y by its x; a row that gives a different answer breaks the pattern. To fix it, use y = k × x.',
  gen(d, R) {
    const k = d === 0 ? Q(R.i(2, 9)) : d === 1 ? (R.chance(.7) ? Q(R.i(2, 12)) : Q(R.pick([1, 3, 5, 7]), 2)) : R.pick([Q(3, 2), Q(5, 2), Q(3, 4), Q(4, 3), Q(5, 4), Q(2, 3), Q(7, 2), Q(5, 3)]);
    const nr = d === 0 ? 4 : 5, xs = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice(0, nr).map(v => v * k.d);
    if (d < 2) xs.sort((a, b) => a - b);
    const ys = xs.map(x => x * k.n / k.d), bad = R.i(1, nr - 1), yb = ys[bad] + nz(R, -3, 3);
    if (yb <= 0) return null;
    const shown = ys.slice(); shown[bad] = yb;
    const ks = kS(k), ask = d === 0 ? 'x' : d === 2 ? 'fix' : R.pick(['x', 'fix']);
    const rat = (y, x) => { const q = Q(y, x); return kS(q); };
    const how = ['Divide each y by its x: ' + xs.map((x, i) => num(shown[i]) + ' ÷ ' + x + ' = ' + rat(shown[i], x)).join(', ') + '.', 'Every row gives ' + ks + ' except the row with x = ' + xs[bad] + '.'];
    how.push(ask === 'x' ? 'So the row that breaks it has x = ' + B(xs[bad]) + '.' : 'To fix it: y = ' + ks + ' × ' + xs[bad] + ' = ' + B(num(ys[bad])) + '.');
    const ok0 = bad === 0 ? 1 : 0, ks0 = k.d === 1 ? {} : { type: 'frac' };
    return { text: ask === 'x' ? 'In this table, y ÷ x is the same for every row except one. What is x in the row that breaks the pattern?' : 'One y in this table is wrong. What should it be so that y is proportional to x?',
      ans: ask === 'x' ? xs[bad] : ys[bad], vis: table([['x', ...xs], ['y', ...shown]]), how,
      steps: [st(B(num(shown[ok0]) + ' ÷ ' + xs[ok0]) + ' = ?', k.d === 1 ? k.n : k, ks0), ask === 'x' ? st('Here is y ÷ x for each row: ' + xs.map((x, i) => num(shown[i]) + ' ÷ ' + x).join(', ') + '. Which x gives a different answer from the others?', xs[bad]) : st(B(ks + ' × ' + xs[bad]) + ' = ?', ys[bad])],
      traps: ask === 'x' ? [tr(yb, 'f_isprop', 'That is the y of the row. Type its x.'), tr(bad + 1, 'f_isprop', 'Type the x value of the row, not which row it is.'), tr(xs[(bad + 1) % nr], 'f_isprop', 'Divide that row\'s y by its x again: it gives ' + ks + '.')]
        : [tr(yb, 'f_isprop', 'That is the wrong y. Find k × x for that row.'), tr(bad > 0 && ys[bad - 1] + (shown[1] - shown[0]) !== ys[bad] ? ys[bad - 1] + (ys[1] - ys[0]) : null, 'f_ratio', 'The x values do not jump by the same amount, so use y = k × x.'), tr(xs[bad] + (ys[ok0] - xs[ok0]), 'x_twovars', 'Proportional means y is k times x, not x plus a number.')] };
  } },

{ id: 'f_constk', s: 'frac', g: 7, title: 'The constant of proportionality', pre: ['x_twovars'], cc: ['7.RP.A.2b'],
  tip: 'In y = kx, k is y ÷ x: the y for one x. From a table divide any y by its x; from a graph read the y at x = 1; from a story find the amount for one.',
  gen(d, R) {
    const tbl = (k) => { const xs = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 3).map(v => v * k.d).sort((a, b) => a - b); return { xs, ys: xs.map(x => x * k.n / k.d) }; };
    if (d === 0) {
      const k = R.i(2, 12), { xs, ys } = tbl(Q(k)), jump = xs[1] - xs[0];
      return { text: 'In the table, y is proportional to x. What is the constant of proportionality k in ' + B('y = kx') + '?', ans: k, vis: table([['x', ...xs], ['y', ...ys]]),
        how: ['k = y ÷ x for any row: ' + ys[0] + ' ÷ ' + xs[0] + ' = ' + k + '.', 'Check another row: ' + ys[1] + ' ÷ ' + xs[1] + ' = ' + k + '. So k = ' + B(k) + '.'],
        steps: [st(B(ys[0] + ' ÷ ' + xs[0]) + ' = ?', k), st(B(ys[2] + ' ÷ ' + xs[2]) + ' = ?', k)],
        traps: [tr(jump > 1 ? ys[1] - ys[0] : null, 'f_isprop', 'That is how much y jumps, but x jumps by ' + jump + ', not 1.'), tr(1 / k, 'f_constk', 'k is y ÷ x, the y for each 1 of x.'), tr(ys[0] - xs[0], 'x_twovars', 'Proportional means y is k times x. Divide, do not take away.')] };
    }
    const graphK = () => R.pick([Q(1, 2), Q(3, 2), Q(2), Q(3), Q(5, 2), Q(4), Q(2, 3), Q(3, 4), Q(5, 4), Q(4, 3)]);
    const graph = (k, a) => graphSVG({ x0: 0, x1: 8, y0: 0, y1: Math.max(4, Math.ceil(8 * qv(k) / 2) * 2), xs: 1, ys: qv(k) * 8 > 16 ? 2 : 1, xlab: 2, ylab: qv(k) * 8 > 16 ? 4 : 2, xl: 'x', yl: 'y', lines: [{ m: qv(k), b: 0 }], pts: [{ x: a, y: a * qv(k), t: '(' + a + ', ' + num(a * qv(k)) + ')' }] });
    if (d === 1) {
      if (R.chance(.5)) {
        const k = graphK(), a = k.d * R.i(1, Math.floor(6 / k.d)), b = a * qv(k);
        if (a === 1 || b > 16) return null;
        return { text: 'The graph shows a proportional relationship. What is the constant of proportionality k in ' + B('y = kx') + '?', ans: k, type: 'frac', vis: graph(k, a),
          how: ['The line goes through (0, 0), so y = kx.', 'At the point (' + a + ', ' + num(b) + '): k = ' + num(b) + ' ÷ ' + a + ' = ' + B(kS(k)) + '.', 'So the point (1, ' + kS(k) + ') is on the line too: k is the y for x = 1.'],
          steps: [st('The marked point on the line is (' + a + ', ' + num(b) + '). What is y at that point?', b), st(B(num(b) + ' ÷ ' + a) + ' = ?', k, { type: 'frac' })],
          traps: [tr(Q(a, b), 'f_constk', 'k is y ÷ x, not x ÷ y.'), tr(b, 'f_constk', 'That is the y at x = ' + a + '. Divide by ' + a + ' to get the y for 1.')] };
      }
      const [item, items] = R.pick([['notebook', 'notebooks'], ['pen', 'pens'], ['bottle of water', 'bottles of water'], ['bus ticket', 'bus tickets'], ['apple', 'apples']]), n = R.i(2, 8), kc = R.i(3, 60) * 5, c = n * kc / 100;
      return { text: B(n + ' ' + items) + ' cost ' + B(D$(c)) + '. The cost c is proportional to the number of ' + items + ' n. The rule is ' + B('c = kn') + '. What is k, in dollars?', ans: kc / 100, unit: 'dollars per ' + item,
        how: ['k is the cost of one ' + item + '.', 'k = ' + D$(c) + ' ÷ ' + n + ' = ' + B(D$(kc / 100)) + ', so c = ' + num(kc / 100) + 'n.'],
        steps: [st(B(D$(c) + ' ÷ ' + n) + ' = ? dollars', kc / 100)],
        traps: [tr(c, 'f_constk', 'That is the cost of ' + n + '. Divide by ' + n + ' for the cost of one.'), tr(dec(c * n), 'f_rate', 'For one ' + item + ', divide the cost by ' + n + '.'), tr(dec(c - n), 'f_constk', 'k multiplies n, so divide to find it.')] };
    }
    const kind = R.pick(['table', 'graph', 'rev']);
    if (kind === 'graph') {
      const k = graphK(), a = k.d * R.i(1, Math.floor(6 / k.d)), b = a * qv(k), X = R.i(9, 30), Y = dec(X * qv(k));
      if (a === 1 || b > 16 || !isInt(Y * 100)) return null;
      return { text: 'The graph shows a proportional relationship. What is y when ' + B('x = ' + X) + '?', ans: Y, vis: graph(k, a),
        how: ['k = ' + num(b) + ' ÷ ' + a + ' = ' + kS(k) + ', from the marked point.', 'y = ' + kS(k) + ' × ' + X + ' = ' + B(num(Y)) + '.'],
        steps: [st('The line goes through (0, 0) and (' + a + ', ' + num(b) + '). What is k in ' + B('y = kx') + '?', k, { type: 'frac' }), st(B(kS(k) + ' × ' + X) + ' = ?', Y)],
        traps: [tr(dec(b + X - a), 'f_isprop', 'Proportional means multiply by k, not add the same amount.'), tr(isInt(X / qv(k) * 100) ? dec(X / qv(k)) : null, 'f_constk', 'y = k × x: multiply by k.')] };
    }
    const k = R.pick([Q(3, 2), Q(5, 2), Q(3, 4), Q(5, 4), Q(7, 4), Q(2, 5), Q(6, 5), Q(1, 4)]), { xs, ys } = tbl(k);
    if (kind === 'table') {
      let X; do { X = R.i(11, 40); } while (xs.includes(X)); const Y = dec(X * qv(k));
      return { text: 'In the table, y is proportional to x. What is y when ' + B('x = ' + X) + '?', ans: Y, vis: table([['x', ...xs, X], ['y', ...ys, '?']]),
        how: ['k = ' + ys[0] + ' ÷ ' + xs[0] + ' = ' + kS(k) + '. (Check: ' + ys[1] + ' ÷ ' + xs[1] + ' = ' + kS(k) + '.)', 'y = ' + kS(k) + ' × ' + X + ' = ' + B(num(Y)) + '.'],
        steps: [st('k = ' + B(ys[0] + ' ÷ ' + xs[0]) + ' = ?', k, { type: 'frac' }), st(B(kS(k) + ' × ' + X) + ' = ?', Y)],
        traps: [tr(dec(ys[2] + X - xs[2]), 'f_isprop', 'Proportional means multiply by k, not add the same amount.'), tr(isInt(X / qv(k) * 100) ? dec(X / qv(k)) : null, 'f_constk', 'y = k × x: multiply by k, do not divide.')] };
    }
    let Y; do { Y = R.i(3, 20) * k.n; } while (ys.includes(Y)); const X = dec(Y / qv(k));
    return { text: 'In the table, y is proportional to x. What is x when ' + B('y = ' + num(Y)) + '?', ans: X, vis: table([['x', ...xs, '?'], ['y', ...ys, num(Y)]]),
      how: ['k = ' + ys[0] + ' ÷ ' + xs[0] + ' = ' + kS(k) + '.', 'y = ' + kS(k) + 'x, so x = y ÷ ' + kS(k) + ' = ' + num(Y) + ' ÷ ' + kS(k) + ' = ' + B(num(X)) + '.'],
      steps: [st('k = ' + B(ys[0] + ' ÷ ' + xs[0]) + ' = ?', k, { type: 'frac' }), st(B(num(Y) + ' ÷ ' + kS(k)) + ' = ?', X)],
      traps: [tr(dec(Y * qv(k)), 'f_constk', 'To find x, undo the × k: divide y by k.'), tr(Y - ys[0] + xs[0] > 0 ? Y - ys[0] + xs[0] : null, 'f_isprop', 'Proportional means multiply by k, not add the same amount.')] };
  } },

{ id: 'n_ratmul', s: 'count', g: 7, title: 'Times and divide signed fractions', pre: ['f_divfrac'], paper: true, cc: ['7.NS.A.2c', '7.NS.A.2a', '7.NS.A.2b'],
  tip: 'Sign first, size second. An odd number of negatives makes the answer negative; an even number makes it positive. Then multiply (or flip and multiply): (−3/4) × 2/5 = −6/20 = −3/10.',
  gen(d, R) {
    const signW = negs => W('sign: ' + ['no', 'one', 'two', 'three'][negs] + ' negative' + (negs === 1 ? '' : 's') + ', so the answer is ' + (negs % 2 ? 'negative' : 'positive'), negs === 2 ? 'two negatives make a positive' : '');
    if (d === 0) {
      const sa = R.pick([1, -1]), sb = sa > 0 ? -1 : R.pick([1, -1]), negs = (sa < 0) + (sb < 0);
      if (R.chance(.5)) {
        const bt = R.i(2, 9), q = R.i(2, 9), A = sa * bt * q / 10, Bv = sb * bt / 10, ans = sa * sb * q;
        return { text: 'What is ' + B(pn(A) + ' ÷ ' + pn(Bv)) + '?', ans,
          how: [signW(negs), W('size: ' + num(Math.abs(A)) + ' ÷ ' + num(Math.abs(Bv)) + ' = ' + bt * q + ' ÷ ' + bt + ' = ' + q, 'times both by 10'), 'answer: ' + B(num(ans))],
          steps: [st('Size: ' + B(num(Math.abs(A)) + ' ÷ ' + num(Math.abs(Bv))) + ' = ?', q), st('With the sign: ' + B(pn(A) + ' ÷ ' + pn(Bv)) + ' = ?', ans)],
          traps: [tr(-ans, 'n_intmul', negs === 1 ? 'One negative makes the answer negative.' : 'Two negatives make a positive.'), tr(dec(ans / 100), 'f_divdec', 'Times both numbers by 10 first: ' + bt * q + ' ÷ ' + bt + '.'), tr(dec(A * Bv), 'f_divdec', 'This is dividing, not multiplying.')] };
      }
      const a = sa * R.i(2, 9), b = sb * R.pick([0.5, 0.25, 0.2, 0.75, 1.5, 0.1, 2.5]), ans = dec(a * b);
      return { text: 'What is ' + B(pn(a) + ' × ' + pn(b)) + '?', ans,
        how: [signW(negs), 'size: ' + Math.abs(a) + ' × ' + num(Math.abs(b)) + ' = ' + num(Math.abs(ans)), 'answer: ' + B(num(ans))],
        steps: [st('Size: ' + B(Math.abs(a) + ' × ' + num(Math.abs(b))) + ' = ?', Math.abs(ans)), st('With the sign: ' + B(pn(a) + ' × ' + pn(b)) + ' = ?', ans)],
        traps: [tr(-ans, 'n_intmul', negs === 1 ? 'One negative makes the answer negative.' : 'Two negatives make a positive.'), tr(dec(ans * 10), 'f_decmul', 'Count the decimal places in ' + num(Math.abs(b)) + '.'), tr(dec(a + b), 'n_intadd', 'This is multiplying, not adding.')] };
    }
    const fr1 = () => { const q = R.i(2, 9), p = R.i(1, q - 1); return gcd(p, q) === 1 ? Q(p, q) : null; };
    let A, Bq, Cq = null, op = R.pick(['×', '÷']), op2 = null;
    if (d === 1) { A = fr1(); Bq = fr1(); }
    else if (R.chance(.5)) { const q = R.pick([2, 3, 4, 5]); A = Q(R.i(1, 3) * q + R.i(1, q - 1), q); Bq = fr1(); }
    else { A = fr1(); Bq = fr1(); Cq = fr1(); op = '×'; op2 = '÷'; }
    if (!A || !Bq || (op2 && !Cq)) return null;
    const sg = () => R.pick([1, -1]); let s = [sg(), sg(), sg()]; if (!s.slice(0, op2 ? 3 : 2).includes(-1)) s[R.i(0, op2 ? 2 : 1)] = -1;
    A = Q(s[0] * A.n, A.d); Bq = Q(s[1] * Bq.n, Bq.d); if (Cq) Cq = Q(s[2] * Cq.n, Cq.d);
    const items = [A, Bq].concat(Cq ? [Cq] : []), negs = items.filter(q => q.n < 0).length;
    const absQ = q => Q(Math.abs(q.n), q.d), ab = items.map(absQ);
    const asMul = [ab[0], op === '÷' ? Q(ab[1].d, ab[1].n) : ab[1]].concat(Cq ? [Q(ab[2].d, ab[2].n)] : []);
    const ans = items.slice(1).reduce((acc, q, i) => ([op, op2][i] === '÷' ? qdiv(acc, q) : qmul(acc, q)), A), absAns = absQ(ans);
    const tops = asMul.map(q => q.n), bots = asMul.map(q => q.d), T = tops.reduce((a, b) => a * b, 1), Bt = bots.reduce((a, b) => a * b, 1);
    const expr = qp(A) + ' ' + op + ' ' + qp(Bq) + (Cq ? ' ' + op2 + ' ' + qp(Cq) : '');
    const how = [signW(negs)], mixedIn = ab.some(q => q.n > q.d);
    if (mixedIn) how.push(W('size: ' + ab.map(qs).join(' ' + op + ' '), 'mixed numbers as fractions'));
    if (op === '÷' || op2) how.push(W((mixedIn ? '= ' : 'size: ') + asMul.map(qs).join(' × '), 'dividing is multiplying by the flip'));
    how.push((how.length > 1 ? '= ' : 'size: ' + asMul.map(qs).join(' × ') + ' = ') + fl(tops.join(' × '), bots.join(' × ')) + ' = ' + frac(T, Bt) + (absAns.n !== T || absAns.n > absAns.d ? ' = ' + qm(absAns) : ''));
    how.push('answer: ' + B(qm(ans)));
    const noFlip = qmul(qmul(A, Bq), Cq || Q(1));
    return { text: 'What is ' + B(expr) + '?', ans, type: 'frac', how,
      steps: [st('How many negative numbers are in ' + B(expr) + '?', negs), st('Size: ' + B(Cq ? qm(ab[0]) + ' ' + op + ' ' + qm(ab[1]) + ' ' + op2 + ' ' + qm(ab[2]) : ab.map(qm).join(' ' + op + ' ')) + ' = ?', absAns, { type: 'frac' }), st('With the sign: ' + B(expr) + ' = ?', ans, { type: 'frac' })],
      traps: [tr(Q(-ans.n, ans.d), 'n_intmul', negs % 2 ? 'An odd number of negatives makes the answer negative.' : 'An even number of negatives makes the answer positive.'), tr(op === '÷' || op2 ? noFlip : null, 'f_divfrac', 'To divide by a fraction, multiply by its flip.'), tr(op === '×' && !op2 ? Q(A.n * Bq.d + Bq.n * A.d, A.d * Bq.d) : null, 'n_ratadd', 'This is multiplying: multiply the tops and the bottoms.')] };
  } },

{ id: 'n_ratadd', s: 'count', g: 7, title: 'Add and take away signed fractions', pre: ['f_addunlike'], paper: true, cc: ['7.NS.A.1d'],
  tip: 'Taking away a number is adding its opposite. Then use a common bottom. Same signs: add the sizes. Different signs: take the smaller size from the bigger and keep the bigger one\'s sign. −1/3 − 1/2 = −2/6 + (−3/6) = −5/6.',
  gen(d, R) {
    const op = R.pick(['+', MINUS]);
    if (d === 0) {
      const den = R.pick([2, 4, 10]), a = nz(R, -40, 40) / den, b = nz(R, -40, 40) / den; if (Math.abs(a) < 1 && Math.abs(b) < 1) return null;
      if (a > 0 && b > 0) return null;
      const bb = op === '+' ? b : -b, ans = dec(a + bb); if (ans === 0 || isInt(a) && isInt(b)) return null;
      const how = [];
      if (op === MINUS) how.push(W(pn(a) + ' ' + MINUS + ' ' + pn(b) + ' = ' + pn(a) + ' + ' + pn(bb), 'take away = add the opposite'));
      const A = Math.abs(a), Bb = Math.abs(bb), big = A >= Bb ? a : bb;
      if ((a < 0) === (bb < 0)) how.push(W('same signs: ' + num(A) + ' + ' + num(Bb) + ' = ' + num(A + Bb), 'add the sizes, keep the sign'));
      else how.push(W('different signs: ' + num(Math.max(A, Bb)) + ' ' + MINUS + ' ' + num(Math.min(A, Bb)) + ' = ' + num(dec(Math.abs(A - Bb))), 'keep the sign of ' + num(big)));
      how.push('answer: ' + B(num(ans)));
      return { text: 'What is ' + B(num(a) + ' ' + op + ' ' + pn(b)) + '?', ans, how,
        steps: (op === MINUS ? [st('Rewrite as adding: ' + B(num(a) + ' ' + MINUS + ' ' + pn(b) + ' = ' + pn(a) + ' + ?'), bb)] : []).concat([st('In ' + B(pn(a) + ' + ' + pn(bb)) + ' the signs are ' + ((a < 0) === (bb < 0) ? 'the same. Add the sizes: ' + B(num(A) + ' + ' + num(Bb)) : 'different. Take the smaller size from the bigger: ' + B(num(Math.max(A, Bb)) + ' ' + MINUS + ' ' + num(Math.min(A, Bb)))) + ' = ?', Math.abs(ans)), st(B(num(a) + ' ' + op + ' ' + pn(b)) + ' = ?', ans)]),
        traps: [tr(-ans, 'n_intadd', 'Check the sign: it is the sign of the number with the bigger size.'), tr((a < 0) !== (bb < 0) ? dec((ans < 0 ? -1 : 1) * (A + Bb)) : null, 'n_intadd', 'Different signs: take the smaller size from the bigger.'), tr(op === MINUS ? dec(a - bb) : null, 'n_intsub', 'Taking away a number is adding its opposite.')] };
    }
    const mk = () => { const q = R.i(2, 8), p = R.i(1, d === 2 ? 3 * q : q - 1); if (gcd(p, q) !== 1) return null; return Q(R.pick([1, -1]) * p, q); };
    const a = mk(), b = mk(); if (!a || !b || a.d === b.d && d === 1 && R.chance(.7)) return null;
    if (d === 2 && Math.abs(a.n) < a.d && Math.abs(b.n) < b.d) return null;
    if (a.n > 0 && b.n > 0 && op === '+') return null;
    const L = a.d * b.d / gcd(a.d, b.d); if (L > 24) return null;
    const bb = op === '+' ? b : Q(-b.n, b.d), ans = qadd(a, bb); if (ans.n === 0) return null;
    const na = a.n * L / a.d, nb = bb.n * L / bb.d, top = na + nb, how = [];
    const mixedIn = Math.abs(a.n) > a.d || Math.abs(b.n) > b.d;
    if (mixedIn) how.push(W(qm(a) + ' ' + op + ' ' + qp(b) + ' = ' + qs(a) + ' ' + op + ' ' + (b.n < 0 ? '(' + qs(b) + ')' : qs(b)), 'mixed numbers as fractions'));
    if (op === MINUS) how.push(W((mixedIn ? '= ' + qs(a) : qm(a)) + ' + ' + (bb.n < 0 ? '(' + qs(bb) + ')' : qs(bb)), 'take away = add the opposite'));
    if (!(a.d === L && bb.d === L && how.length)) how.push(W((how.length ? '= ' : '') + frac(na, L) + ' + ' + (nb < 0 ? '(' + frac(nb, L) + ')' : frac(nb, L)), 'common bottom ' + L));
    how.push('= ' + frac(top, L) + (ans.d !== L || Math.abs(ans.n) > ans.d ? ' = ' + B(qm(ans)) : ''));
    if (!(ans.d !== L || Math.abs(ans.n) > ans.d)) how[how.length - 1] = '= ' + B(frac(top, L));
    const expr = qm(a) + ' ' + op + ' ' + qp(b);
    return { text: 'What is ' + B(expr) + '?', ans, type: 'frac', how,
      steps: [st(a.d === b.d ? 'Both bottoms are ' + a.d + '. What is the common bottom?' : 'For a common bottom, what is the smallest number that both ' + a.d + ' and ' + b.d + ' go into?', L)].concat(op === MINUS ? [st('Taking away ' + qp(b) + ' is adding what?', bb, { type: 'frac' })] : []).concat([st('Add the tops over ' + L + ': ' + B(num(na) + ' + ' + pn(nb)) + ' = ?', top), st(B(expr) + ' = ?', ans, { type: 'frac' })]),
      traps: [tr(a.d !== bb.d ? Q(a.n + bb.n, a.d + bb.d) : null, 'f_addunlike', 'Do not add the bottoms. Find a common bottom first.'), tr(Q(-ans.n, ans.d), 'n_intadd', 'Check the sign: it is the sign of the number with the bigger size.'), tr(op === MINUS ? qadd(a, b) : null, 'n_intsub', 'Taking away a number is adding its opposite.')] };
  } },

{ id: 's_signed', s: 'story', g: 7, title: 'Stories with negative numbers', pre: ['n_intadd'], paper: true, cc: ['7.NS.A.3', '7.EE.B.3'],
  tip: 'Below zero, a debt, or going down is negative. Write the story as a number sentence, like −8 + 15, then work it out: warmer or more is adding, colder or less is taking away.',
  gen(d, R) {
    const who = R.pick(NAMES);
    if (d === 0) {
      const kind = R.pick(['temp', 'bank', 'dive']), a = R.i(2, 20);
      if (kind === 'temp') { const b = R.i(3, 30), ans = b - a; if (ans === 0) return null;
        return { text: 'At 6 AM it is ' + B(num(-a) + DEG + 'C') + '. By noon it is ' + B(b + DEG) + ' warmer. What is the temperature at noon?', ans, unit: DEG + 'C',
          how: [W(num(-a) + ' + ' + b, 'warmer means add'), '= ' + B(num(ans)) + DEG + 'C'],
          steps: [st('What number shows a temperature ' + a + DEG + ' below zero?', -a), st(B(num(-a) + ' + ' + b) + ' = ?', ans)],
          traps: [tr(-a - b, 'n_intadd', 'Warmer means add, so move right on the number line.'), tr(a + b, 'n_intadd', 'The start is below 0, so it is ' + num(-a) + ', not ' + a + '.'), tr(-ans, 'n_intadd', 'Check the sign: is the answer above or below 0?')] }; }
      if (kind === 'bank') { const b = R.i(2, 30) * 5, A = a * 5, ans = b - A; if (ans === 0) return null;
        return { text: who + '\'s bank balance is ' + B(MINUS + '$' + A) + '. ' + who + ' puts in ' + B('$' + b) + '. What is the new balance, in dollars?', ans, unit: 'dollars',
          how: [W(num(-A) + ' + ' + b, 'putting money in means add'), '= ' + B(num(ans)) + ' dollars'],
          steps: [st(who + ' owes the bank $' + A + '. What number shows the bank balance?', -A), st(B(num(-A) + ' + ' + b) + ' = ?', ans)],
          traps: [tr(-A - b, 'n_intadd', 'Putting money in means add.'), tr(A + b, 'n_intadd', 'A balance of ' + MINUS + '$' + A + ' is ' + num(-A) + ', not ' + A + '.'), tr(-ans, 'n_intadd', 'Check the sign: is the balance above or below 0?')] }; }
      const b = R.i(2, 25), up = R.chance(.5), ans = up ? -a + b : -a - b; if (ans === 0 || (up && b >= a)) return null;
      return { text: 'A diver is at ' + B(num(-a) + ' m') + '. That means ' + a + ' m below the surface. The diver swims ' + (up ? 'up ' : 'down ') + B(b + ' m') + '. Where is the diver now?', ans, unit: 'm',
        how: [W(num(-a) + (up ? ' + ' : ' ' + MINUS + ' ') + b, up ? 'up means add' : 'down means take away'), '= ' + B(num(ans)) + ' m'],
        steps: [st('What number shows ' + a + ' m below the surface?', -a), st(B(num(-a) + (up ? ' + ' : ' ' + MINUS + ' ') + b) + ' = ?', ans)],
        traps: [tr(up ? -a - b : -a + b, 'n_intadd', up ? 'Up means add: move toward 0.' : 'Down means take away: move farther below 0.'), tr(up ? a + b : a - b, 'n_intadd', 'Below the surface is negative: start at ' + num(-a) + '.'), tr(-ans, 'n_intadd', 'Check the sign.')] };
    }
    if (d === 1) {
      const kind = R.pick(['drop', 'sub', 'shop']);
      if (kind === 'drop') { const s = R.i(2, 12), r = R.i(2, 6), h = R.i(3, 8), ch = -r * h, ans = s + ch; if (ans >= 0) return null;
        return { text: 'At sunset it is ' + B(s + DEG + 'C') + '. The temperature drops ' + B(r + DEG) + ' every hour for ' + B(h + ' hours') + '. What is the temperature after the ' + h + ' hours?', ans, unit: DEG + 'C',
          how: [W('change = ' + h + ' × (' + MINUS + r + ') = ' + num(ch), 'down ' + r + DEG + ' each hour'), W(s + ' + (' + num(ch) + ') = ' + B(num(ans)), 'start + change')],
          steps: [st('The change: ' + B(h + ' × (' + MINUS + r + ')') + ' = ?', ch), st(B(s + ' + (' + num(ch) + ')') + ' = ?', ans)],
          traps: [tr(s - r, 's_signed', 'That is after 1 hour. It keeps dropping for ' + h + ' hours.'), tr(s + r * h, 'n_intadd', 'Dropping means the change is negative.'), tr(-ans, 'n_intadd', 'Check the sign: it ends up below 0.')] }; }
      if (kind === 'sub') { const a = R.i(5, 40), b = R.i(3, 15), k = R.i(2, 5), ch = -b * k, ans = -a + ch;
        return { text: 'A submarine is at ' + B(num(-a) + ' m') + '. The submarine makes ' + B(k + ' dives') + '. Each dive takes the submarine ' + B(b + ' m') + ' deeper. Where is the submarine now?', ans, unit: 'm',
          how: [W('change = ' + k + ' × (' + MINUS + b + ') = ' + num(ch), 'each dive goes down ' + b + ' m'), W(num(-a) + ' + (' + num(ch) + ') = ' + B(num(ans)), 'start + change')],
          steps: [st('The change: ' + B(k + ' × (' + MINUS + b + ')') + ' = ?', ch), st(B(num(-a) + ' + (' + num(ch) + ')') + ' = ?', ans)],
          traps: [tr(-a + b * k, 'n_intadd', 'Deeper means farther below 0: add a negative change.'), tr(-a - b, 's_signed', 'That is one dive. It dives ' + k + ' times.'), tr(a + b * k, 'n_intadd', 'Below the surface is negative.')] }; }
      const a = R.i(5, 40), c = R.i(6, 25), k = R.i(2, 5), ans = a - k * c; if (ans >= 0) return null;
      return { text: who + ' has ' + B('$' + a) + ' in a bank account. ' + who + ' uses the account to buy ' + B(k) + ' games for ' + B('$' + c) + ' each. What is the balance now, in dollars?', ans, unit: 'dollars',
        how: [W('spent = ' + k + ' × ' + c + ' = ' + k * c), W(a + ' ' + MINUS + ' ' + k * c + ' = ' + B(num(ans)), 'the account goes below 0')],
        steps: [st('How much is spent? ' + B(k + ' × ' + c) + ' = ?', k * c), st(B(a + ' ' + MINUS + ' ' + k * c) + ' = ?', ans)],
        traps: [tr(k * c - a, 'n_intsub', 'Spending more than you have leaves a negative balance.'), tr(a - c, 's_signed', 'That is after one game. There are ' + k + '.')] };
    }
    const kind = R.pick(['mean', 'rate', 'apart']);
    if (kind === 'mean') {
      const n = R.pick([4, 5]), m = -R.i(1, 8), dev = []; for (let i = 0; i < n - 1; i++) dev.push(R.i(-7, 7)); dev.push(-sum(dev));
      const t = dev.map(v => m + v); if (!t.some(v => v > 0) || Math.abs(dev[n - 1]) > 9) return null; const S = sum(t);
      return { text: 'The low temperatures for ' + n + ' days were ' + B(t.map(num).join(', ') + ' ' + DEG + 'C') + '. What was the mean low temperature?', ans: m, unit: DEG + 'C',
        how: [W('total = ' + t.map((v, i) => i ? pn(v) : num(v)).join(' + ') + ' = ' + num(S), 'add the negatives and the positives'), W('mean = ' + num(S) + ' ÷ ' + n + ' = ' + B(num(m)))],
        steps: [st('Add the temperatures: ' + B(t.map((v, i) => i ? pn(v) : num(v)).join(' + ')) + ' = ?', S), st(B(num(S) + ' ÷ ' + n) + ' = ?', m)],
        traps: [tr(-m, 'n_intmul', 'A negative total divided by ' + n + ' is negative.'), tr(isInt(sum(t.map(Math.abs)) / n) ? sum(t.map(Math.abs)) / n : null, 'n_intadd', 'Keep the signs when you add: negatives pull the total down.'), tr(S, 'd_mean', 'That is the total. Divide by ' + n + '.')] };
    }
    if (kind === 'rate') {
      const h = R.i(3, 8), per = R.i(2, 6), s = R.i(1, h * per - 1), e = h * per - s, ans = -per;
      return { text: 'In ' + B(h + ' hours') + ' the temperature went from ' + B(s + DEG + 'C') + ' to ' + B(num(-e) + DEG + 'C') + '. It changed by the same amount each hour. What was the change each hour?', ans, unit: DEG + 'C',
        how: [W('change = ' + num(-e) + ' ' + MINUS + ' ' + s + ' = ' + num(-e - s), 'end ' + MINUS + ' start'), W('per hour = ' + num(-e - s) + ' ÷ ' + h + ' = ' + B(num(ans)))],
        steps: [st('Total change: ' + B(num(-e) + ' ' + MINUS + ' ' + s) + ' = ?', -e - s), st(B(num(-e - s) + ' ÷ ' + h) + ' = ?', ans)],
        traps: [tr(per, 'n_intmul', 'It got colder, so the change is negative.'), tr(isInt((s - e) / h) && s !== e ? (e - s) / h : null, 'n_intsub', 'From ' + s + ' down to ' + num(-e) + ' passes 0: ' + num(-e) + ' ' + MINUS + ' ' + s + '.'), tr(-e - s, 's_signed', 'That is the change over all ' + h + ' hours. Divide by ' + h + '.')] };
    }
    const a = R.i(12, 95) * 10, b = R.i(5, 60) * 10, ans = a + b;
    return { text: 'A hilltop is ' + B(num(a) + ' m') + ' above sea level. The bottom of a lake nearby is ' + B(num(b) + ' m') + ' below sea level. How far is the hilltop above the lake bottom?', ans, unit: 'm',
      how: [W('heights: ' + num(a) + ' and ' + num(-b), 'below sea level is negative'), W(num(a) + ' ' + MINUS + ' (' + num(-b) + ') = ' + num(a) + ' + ' + num(b) + ' = ' + B(num(ans)), 'top ' + MINUS + ' bottom')],
      steps: [st('What number shows ' + num(b) + ' m below sea level?', -b), st(B(num(a) + ' ' + MINUS + ' (' + num(-b) + ')') + ' = ?', ans)],
      traps: [tr(a - b, 'n_intsub', 'Taking away a negative is adding: ' + num(a) + ' ' + MINUS + ' (' + num(-b) + ') = ' + num(a) + ' + ' + num(b) + '.'), tr(-ans, 'n_intsub', 'A distance is never negative.')] };
  } },

{ id: 'f_interest', s: 'frac', g: 7, title: 'Simple interest', pre: [], paper: true, cc: ['7.RP.A.3'],
  tip: 'Simple interest is the same amount every year: find one year\'s interest (the rate % of the amount), then times the years. $400 at 5% for 3 years: $20 a year, so $60. The total is $460.',
  gen(d, R) {
    const who = R.pick(NAMES), P = R.i(2, d === 0 ? 10 : 30) * 100, r = d === 0 ? R.pick([5, 10, 2, 4]) : R.pick([2, 3, 4, 5, 6, 8]), t = d === 0 ? R.i(2, 3) : R.i(2, 8), y1 = P * r / 100, I = y1 * t;
    const intro = who + ' puts ' + B('$' + num(P)) + ' in a savings account that pays ' + B(r + '%') + ' simple interest a year.';
    const one = W('one year: ' + r + '% of $' + num(P) + ' = $' + num(y1), r === 10 ? '10% is a tenth' : '1% is $' + num(P / 100) + ', so ' + r + '% is ' + r + ' × $' + num(P / 100));
    const m$ = v => ({ type: 'money', fmt: 'd' });
    if (d < 2) {
      const tot = d === 1 && R.chance(.5);
      const how = [one, W(t + ' ' + plural(t, 'year') + ': ' + t + ' × $' + num(y1) + ' = ' + (tot ? '$' + num(I) : B('$' + num(I))))];
      if (tot) how.push(W('total: $' + num(P) + ' + $' + num(I) + ' = ' + B('$' + num(P + I)), 'the money put in plus the interest'));
      return money(tot ? P + I : I, { text: intro + ' ' + (tot ? 'How much is in the account after ' : 'How much interest does the account earn in ') + B(t + ' ' + plural(t, 'year')) + '?', how,
        steps: [st('Interest for one year: ' + r + '% of $' + num(P) + ' = ?', y1 * 100, m$()), st(B(t + ' × $' + num(y1)) + ' = ?', I * 100, m$())].concat(tot ? [st(B('$' + num(P) + ' + $' + num(I)) + ' = ?', (P + I) * 100, m$())] : []),
        traps: [tr(Math.round((tot ? I : P + I) * 100), 'f_interest', tot ? 'That is only the interest. Add the money put in.' : 'That is the total in the account. The interest is only the extra.'), tr(t > 1 ? Math.round((tot ? P + y1 : y1) * 100) : null, 'f_interest', 'That is one year of interest. Simple interest is earned every year: times ' + t + '.'), tr(P * r * t * 100, 'f_pct10', r + '% means ' + r + ' out of every 100, so divide by 100.')] });
    }
    const kind = R.pick(['rate', 'time', 'months']);
    if (kind === 'rate') return { text: B('$' + num(P)) + ' earns ' + B('$' + num(I)) + ' of simple interest in ' + B(t + ' years') + '. What is the yearly interest rate?', ans: r, unit: '%',
      how: [W('one year: $' + num(I) + ' ÷ ' + t + ' = $' + num(y1), 'the same interest every year'), W('$' + num(y1) + ' ÷ $' + num(P) + ' = ' + num(r / 100), 'one year\'s interest out of the amount'), '= ' + B(r + '%')],
      steps: [st('Interest for one year: ' + B('$' + num(I) + ' ÷ ' + t) + ' = ?', y1 * 100, m$()), st('$' + num(y1) + ' out of $' + num(P) + ' is what percent?', r, { unit: '%' })],
      traps: [tr(isInt(I / P * 1000) ? dec(I / P * 100) : null, 'f_interest', 'That interest is for ' + t + ' years. Find one year first.'), tr(y1, 'f_interest', 'That is the interest per year in dollars. Write it as a percent of $' + num(P) + '.')] };
    if (kind === 'time') return { text: B('$' + num(P)) + ' is saved at ' + B(r + '%') + ' simple interest a year. How many years does it take to earn ' + B('$' + num(I)) + ' in interest?', ans: t, unit: 'years',
      how: [one, W('years: $' + num(I) + ' ÷ $' + num(y1) + ' = ' + B(t), 'how many years of $' + num(y1))],
      steps: [st('Interest for one year: ' + r + '% of $' + num(P) + ' = ?', y1 * 100, m$()), st(B('$' + num(I) + ' ÷ $' + num(y1)) + ' = ?', t)],
      traps: [tr(isInt(I / r) ? I / r : null, 'f_interest', 'Find one year\'s interest in dollars first: ' + r + '% of $' + num(P) + '.'), tr(y1, 'f_interest', 'That is the interest for one year. How many years make $' + num(I) + '?')] };
    const mo = R.pick([6, 18, 30, 3, 9]), Im = y1 * mo / 12; if (!isInt(Im * 100)) return null;
    return money(Im, { text: intro + ' How much interest does the account earn in ' + B(mo + ' months') + '?',
      how: [W(mo + ' months = ' + fl(mo, 12) + ' of a year = ' + num(mo / 12) + ' ' + plural(mo / 12, 'year'), 'the rate is per year'), one, W(num(mo / 12) + ' × $' + num(y1) + ' = ' + B(D$(Im)))],
      steps: [st(mo + ' months is how many years?', mo / 12), st('Interest for one year: ' + r + '% of $' + num(P) + ' = ?', y1 * 100, m$()), st(B(num(mo / 12) + ' × $' + num(y1)) + ' = ?', Math.round(Im * 100), m$())],
      traps: [tr(Math.round(y1 * mo * 100), 't_convert', 'The rate is per year: change ' + mo + ' months into years first.'), tr(Math.round(y1 * 100), 'f_interest', 'That is a full year of interest. This is ' + mo + ' months.')] });
  } },

{ id: 'f_pcterror', s: 'frac', g: 7, title: 'Percent error', pre: [], paper: true, cc: ['7.RP.A.3'],
  tip: 'Percent error = how far off ÷ the real value, as a percent. Guessed 45, really 50: off by 5, and 5 ÷ 50 = 0.1 = 10%. Always divide by the real value, not the guess.',
  gen(d, R) {
    let a, pct;
    if (d === 0) { a = R.pick([10, 20, 25, 50, 100]); pct = R.pick([10, 20, 4, 5, 2, 40]); }
    else if (d === 1) { a = R.i(2, 40) * R.pick([4, 5, 10, 20, 25]); pct = R.pick([2, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30]); }
    else { a = R.pick([2.5, 1.6, 12.5, 4, 0.8, 7.5, 3.2, 40, 80, 120]); pct = R.pick([12.5, 2.5, 7.5, 4, 8, 5, 15, 25, 37.5]); }
    const diff = dec(a * pct / 100); if (diff <= 0 || !isInt(diff * 100) || (d < 2 && !isInt(diff))) return null;
    const hi = R.chance(.5), e = dec(hi ? a + diff : a - diff); if (e <= 0) return null;
    if (a >= 40 && !isInt(diff)) return null;
    const who = R.pick(NAMES), ctx = d === 2 && a < 40 ? R.pick([[who + ' measured a board as ' + B(num(e) + ' m') + '. It is really ' + B(num(a) + ' m') + ' long.'], [who + ' estimated a bag of rice weighs ' + B(num(e) + ' kg') + '. It really weighs ' + B(num(a) + ' kg') + '.']])[0]
      : R.pick([who + ' guessed there were ' + B(num(e)) + ' beans in a jar. There were really ' + B(num(a)) + '.', who + ' estimated that ' + B(num(e)) + ' people were at a game. The real count was ' + B(num(a)) + '.', who + ' guessed a walk was ' + B(num(e) + ' steps') + '. It was really ' + B(num(a) + ' steps') + '.']);
    const rt0 = dec(diff / a);
    return { text: ctx + ' What is the percent error?', ans: pct, unit: '%',
      how: [W('error = ' + num(Math.max(a, e)) + ' ' + MINUS + ' ' + num(Math.min(a, e)) + ' = ' + num(diff), 'how far off, never negative'), W('error ÷ real value = ' + num(diff) + ' ÷ ' + num(a) + ' = ' + num(rt0), 'compare with the real value'), num(rt0) + ' = ' + B(num(pct) + '%')],
      steps: [st('The guess was ' + num(e) + ' and the real value was ' + num(a) + '. How far off was the guess?', diff), st('Divide by the real value, as a decimal: ' + B(num(diff) + ' ÷ ' + num(a)) + ' = ?', rt0), st('Write ' + num(rt0) + ' as a percent.', pct, { unit: '%' })],
      traps: [tr(isInt(diff / e * 10000) ? dec(diff / e * 100) : null, 'f_pcterror', 'Percent error compares the error with the real value, not the estimate.'), tr(diff, 'f_pcterror', 'That is how far off it was. Write it as a percent of the real value.'), tr(dec(100 - pct), 'f_pctchange', 'That is the estimate as a percent of the real value. The error is the difference.'), tr(isInt(e / a * 10000) ? dec(e / a * 100) : null, 'f_pcterror', 'Find how far off it was first: the difference.')] };
  } },

{ id: 'x_ratexpr', s: 'alg', g: 7, title: 'Expand and factor with fractions', pre: ['f_mult'], cc: ['7.EE.A.1'],
  tip: 'The number in front multiplies every term inside: ½(4x − 6) = 2x − 3. To factor, divide every term by the number you pull out: 0.4x + 1.2 = 0.4(x + 3).',
  gen(d, R) {
    const v = R.pick(['x', 'y', 'n', 'a']), tm = (c, w) => (c === 1 ? '' : c === -1 ? MINUS : num(c)) + w, sg = s => (s > 0 ? ' + ' : ' ' + MINUS + ' ');
    const expand = (kS0, kv, a, b, s, askC) => {
      const A = dec(kv * a), Bc = dec(kv * b), lhs = kS0 + '(' + tm(a, v) + sg(s) + b + ')';
      const rhs = askC ? tm(A, v) + sg(s) + '?' : '?' + v + sg(s) + num(Bc), ans = askC ? Bc : A;
      return { text: 'What is the missing number? ' + B(lhs + ' = ' + rhs), ans,
        how: ['Multiply every term inside by ' + kS0 + ': ' + kS0 + ' × ' + tm(a, v) + ' = ' + tm(A, v) + ', and ' + kS0 + ' × ' + b + ' = ' + num(Bc) + '.', 'So ' + lhs + ' = ' + (askC ? tm(A, v) + sg(s) + B(num(Bc)) : B(tm(A, v)) + sg(s) + num(Bc)) + '.'],
        steps: [st(B(kS0 + ' × ' + (askC ? b : a)) + ' = ?', ans)],
        traps: [tr(askC ? b : a, 'x_distribute', 'The ' + kS0 + ' multiplies every term inside, the ' + (askC ? b : tm(a, v)) + ' too.'), tr(isInt(kv) ? null : dec((askC ? b : a) / kv), 'x_ratexpr', 'Multiply by ' + kS0 + '; do not divide by it.'), tr(askC ? null : dec(kv * a + kv * b * s), 'x_combine', 'Keep the ' + v + '-term and the number apart: they are not like terms.')] };
    };
    if (d === 0) { const m = R.pick([2, 3, 4, 5]); return expand(frac(1, m), 1 / m, m * R.i(1, 4), m * R.i(1, 6), R.pick([1, -1]), R.chance(.6)); }
    if (d === 1) {
      const kind = R.pick(['factor', 'efrac', 'edec']);
      if (kind === 'efrac') { const [p, m] = R.pick([[2, 3], [3, 4], [3, 2], [2, 5], [5, 2], [3, 5]]); return expand(frac(p, m), p / m, m * R.i(1, 4), m * R.i(1, 6), R.pick([1, -1]), R.chance(.5)); }
      if (kind === 'edec') { const c = R.pick([0.5, 0.2, 1.5, 0.25, 0.4]), a = R.i(2, 12), b = R.i(2, 20); if (!isInt(c * a * 10) || !isInt(c * b * 10)) return null; return expand(num(c), c, a, b, R.pick([1, -1]), R.chance(.5)); }
      const c = R.pick([0.2, 0.4, 0.5, 0.25, 0.3, 0.6, 1.5]), q = R.i(1, 12), s = R.pick([1, -1]), cq = dec(c * q), e = num(c) + v + sg(s) + num(cq);
      return { text: 'What is the missing number? ' + B(e + ' = ' + num(c) + '(' + v + sg(s) + '?)'), ans: q,
        how: ['Pull out ' + num(c) + ' by dividing every term by it: ' + num(c) + v + ' ÷ ' + num(c) + ' = ' + v + ', and ' + num(cq) + ' ÷ ' + num(c) + ' = ' + q + '.', 'So ' + e + ' = ' + num(c) + '(' + v + sg(s) + B(q) + '). Check: ' + num(c) + ' × ' + q + ' = ' + num(cq) + '.'],
        steps: [st(B(num(cq) + ' ÷ ' + num(c)) + ' = ?', q), st('Check: ' + B(num(c) + ' × ' + q) + ' = ?', cq)],
        traps: [tr(cq, 'x_ratexpr', 'Pull the ' + num(c) + ' out: divide ' + num(cq) + ' by ' + num(c) + '.'), tr(dec(c * cq), 'x_ratexpr', 'Factoring divides by ' + num(c) + '; it does not multiply.'), tr(dec(cq - c) > 0 ? dec(cq - c) : null, 'x_ratexpr', 'The ' + num(c) + ' outside multiplies the missing number.')] };
    }
    const kind = R.pick(['combine', 'ffrac', 'neg']);
    if (kind === 'combine') {
      const m = R.pick([2, 3, 4]), a = m * R.i(2, 4), b = m * R.i(1, 5), s = R.pick([1, -1]), e = R.i(1, 3), t = R.pick([1, -1]), c = R.i(1, 9);
      const A = a / m, Bc = s * b / m, P = A - e, Qc = Bc - t * c; if (P === 0 || Qc === 0) return null;
      const expr = frac(1, m) + '(' + tm(a, v) + sg(s) + b + ') ' + MINUS + ' (' + tm(e, v) + sg(t) + c + ')', askQ = R.chance(.6);
      return { text: 'Simplify ' + B(expr) + ' to the form ' + B('p' + v + ' + q') + '. What is ' + (askQ ? 'q' : 'p') + '?', ans: askQ ? Qc : P,
        how: [W(tm(A, v) + sg(s) + Math.abs(Bc) + ' ' + MINUS + ' ' + tm(e, v) + sg(-t) + c, 'multiply out; the minus sign changes both signs in the second bracket'), W(v + '-terms: ' + num(A) + ' ' + MINUS + ' ' + e + ' = ' + num(P) + '; numbers: ' + num(Bc) + ' ' + signed(-t * c) + ' = ' + num(Qc)), '= ' + tm(P, v) + ' ' + signed(Qc) + ', so ' + (askQ ? 'q = ' + B(num(Qc)) : 'p = ' + B(num(P)))],
        steps: [st('Multiply out ' + B(frac(1, m) + '(' + tm(a, v) + sg(s) + b + ')') + '. What is the number part?', Bc), st('Multiply out ' + B(MINUS + '(' + tm(e, v) + sg(t) + c + ')') + '. What is the number part?', -t * c), st('Add the number parts: ' + B(num(Bc) + ' + ' + pn(-t * c)) + ' = ?', Qc)].concat(askQ ? [] : [st('Collect the ' + v + '-terms: ' + B(tm(A, v) + ' ' + MINUS + ' ' + tm(e, v) + ' = ?' + v) + '. What number goes in front of ' + v + '?', P)]),
        traps: askQ ? [tr(Bc + t * c, 'x_distribute', 'The minus in front of the brackets changes the sign of the ' + c + ' too.'), tr(s * b - t * c, 'x_distribute', 'The ' + frac(1, m) + ' multiplies the ' + b + ' too.')] : [tr(A + e, 'x_distribute', 'The minus in front of the brackets changes the sign of ' + tm(e, v) + ' too.'), tr(a - e, 'x_distribute', 'The ' + frac(1, m) + ' multiplies the ' + tm(a, v) + ' too.')] };
    }
    if (kind === 'ffrac') {
      const [p, m] = R.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [3, 2], [5, 4]]), t = R.i(1, 6), s = R.pick([1, -1]), ans = m * t, k0 = p * t;
      const e = frac(p, m) + v + sg(s) + k0;
      return { text: 'What is the missing number? ' + B(e + ' = ' + frac(p, m) + '(' + v + sg(s) + '?)'), ans,
        how: ['Divide every term by ' + frac(p, m) + ': ' + k0 + ' ÷ ' + frac(p, m) + ' = ' + k0 + ' × ' + frac(m, p) + ' = ' + ans + '.', 'So ' + e + ' = ' + frac(p, m) + '(' + v + sg(s) + B(ans) + '). Check: ' + frac(p, m) + ' × ' + ans + ' = ' + k0 + '.'],
        steps: [st('Dividing by ' + frac(p, m) + ' is multiplying by what?', Q(m, p), { type: 'frac' }), st(B(k0 + ' × ' + frac(m, p)) + ' = ?', ans)],
        traps: [tr(k0, 'x_ratexpr', 'Pull out the ' + frac(p, m) + ': divide ' + k0 + ' by it.'), tr(isInt(k0 * p / m * 100) ? dec(k0 * p / m) : null, 'f_divfrac', 'Dividing by ' + frac(p, m) + ' is multiplying by its flip, ' + frac(m, p) + '.')] };
    }
    const m = R.pick([2, 3, 4]), a = m * R.i(1, 4), b = m * R.i(1, 5), A = -a / m, Bc = b / m, askC = R.chance(.6), lhs = '(' + MINUS + frac(1, m) + ')(' + tm(a, v) + ' ' + MINUS + ' ' + b + ')';
    return { text: 'What is the missing number? ' + B(lhs + ' = ' + (askC ? tm(A, v) + ' + ?' : '?' + v + ' + ' + Bc)), ans: askC ? Bc : A,
      how: ['Multiply every term by ' + MINUS + frac(1, m) + ': ' + MINUS + frac(1, m) + ' × ' + tm(a, v) + ' = ' + tm(A, v) + ', and ' + MINUS + frac(1, m) + ' × (' + MINUS + b + ') = ' + Bc + '.', 'So ' + lhs + ' = ' + (askC ? tm(A, v) + ' + ' + B(Bc) : B(tm(A, v)) + ' + ' + Bc) + '. Negative times negative is positive.'],
      steps: [st(B(MINUS + frac(1, m) + ' × ' + (askC ? '(' + MINUS + b + ')' : a)) + ' = ?', askC ? Bc : A)],
      traps: askC ? [tr(-Bc, 'n_intmul', 'Negative times negative is positive.'), tr(b, 'x_distribute', 'The ' + MINUS + frac(1, m) + ' multiplies the ' + b + ' too.')] : [tr(-A, 'n_intmul', 'Negative times positive is negative.'), tr(-a, 'x_distribute', 'Multiply by ' + frac(1, m) + ', that is, divide by ' + m + '.')] };
  } },

{ id: 'x_bracket', s: 'alg', g: 7, title: 'Solve p(x + q) = r', pre: [], paper: true, cc: ['7.EE.B.4a'],
  tip: 'Divide both sides by the number in front first: 3(x + 4) = 27 → x + 4 = 9 → x = 5. If it does not divide evenly, multiply out the brackets first: 4(x + 3) = 18 → 4x + 12 = 18.',
  gen(d, R) {
    const undo = b => (b < 0 ? 'add ' + num(-b) + ' to both sides' : 'take ' + num(b) + ' from both sides');
    const divFirst = (p, q, x, story) => {
      const s = x + q, r = p * s, e = num(p) + '(x ' + signed(q) + ') = ' + num(r);
      return { text: (story ? story + ' ' : 'Solve for x: ') + B(e) + (story ? '. What is x?' : ''), ans: x,
        how: [e, W('x ' + signed(q) + ' = ' + num(s), 'divide both sides by ' + num(p)), W('x = ' + B(num(x)), undo(q))],
        steps: [st(B(e) + '. Divide both sides by ' + num(p) + ': ' + B('x ' + signed(q) + ' = ?'), s), st(B('x ' + signed(q) + ' = ' + num(s)) + '. x = ?', x)],
        traps: [tr(isInt((r - q) / p) ? (r - q) / p : null, 'x_distribute', 'The ' + num(p) + ' multiplies the ' + num(q) + ' too, so divide by ' + num(p) + ' first.'), tr(s + q, q < 0 ? 'n_intsub' : 'x_twostep', 'To undo ' + signed(q) + ', do the opposite to both sides.'), tr(s, 'x_bracket', 'That is x ' + signed(q) + '. One more step.'), tr(p < 0 ? -s - q : null, 'n_intmul', 'Dividing by a negative number changes the sign.')] };
    };
    if (d === 0) return divFirst(R.i(2, 9), R.i(1, 9), R.i(1, 12));
    if (d === 1) {
      if (R.chance(.4)) {
        const p = R.i(3, 8), q = R.i(2, 6), x = R.i(5, 20), who = R.pick(NAMES);
        const story = R.pick([p + ' friends each buy a ticket and a $' + q + ' snack. A ticket costs $x. Together the friends spend $' + p * (x + q) + '. So',
          'A rectangle is ' + p + ' m wide and (x + ' + q + ') m long. Its area is ' + p * (x + q) + ' m². So',
          who + ' packs ' + p + ' boxes. Each box has x books and ' + q + ' magazines. There are ' + p * (x + q) + ' things in all. So']);
        return divFirst(p, q, x, story);
      }
      return divFirst(R.i(2, 9), nz(R, -9, 9), nz(R, -9, 12));
    }
    const kind = R.pick(['dist', 'neg', 'frac']);
    if (kind === 'neg') return divFirst(-R.i(2, 9), nz(R, -9, 9), nz(R, -9, 12));
    if (kind === 'dist') {
      const p = R.pick([2, 4, 5, 8]), q = nz(R, -9, 9), kx = nz(R, -30, 40); if (kx % p === 0) return null;
      const x = kx / p, pq = p * q, r = kx + pq; if (r === 0) return null;
      const e = p + '(x ' + signed(q) + ') = ' + num(r);
      return { text: 'Solve for x: ' + B(e), ans: x,
        how: [e, W(p + 'x ' + signed(pq) + ' = ' + num(r), 'multiply out: ' + num(r) + ' does not divide by ' + p + ' evenly'), W(p + 'x = ' + num(r - pq), undo(pq)), W('x = ' + B(num(x)), 'divide both sides by ' + p)],
        steps: [st('Multiply out: ' + B(p + '(x ' + signed(q) + ') = ' + p + 'x ' + (pq < 0 ? MINUS : '+') + ' ?'), Math.abs(pq)), st(B(p + 'x ' + signed(pq) + ' = ' + num(r)) + '. So ' + B(p + 'x = ?'), r - pq), st(B(p + 'x = ' + num(r - pq)) + '. x = ?', x)],
        traps: [tr(dec((r - q) / p), 'x_distribute', 'The ' + p + ' multiplies the ' + num(q) + ' too: ' + p + ' × ' + num(q) + ' = ' + num(pq) + '.'), tr(dec((r + pq) / p), 'n_intsub', 'To undo ' + signed(pq) + ', do the opposite to both sides.'), tr(r - pq, 'x_onestep', 'That is ' + p + 'x. One more step: divide by ' + p + '.')] };
    }
    const [a, b] = R.pick([[1, 2], [1, 3], [2, 3], [3, 4], [3, 2], [2, 5], [1, 4]]), t = R.i(1, 8) * (R.chance(.2) ? -1 : 1), s = b * t, r = a * t, q = nz(R, -9, 9), x = s - q;
    const e = frac(a, b) + '(x ' + signed(q) + ') = ' + num(r);
    return { text: 'Solve for x: ' + B(e), ans: x,
      how: [e, W('x ' + signed(q) + ' = ' + num(r) + ' × ' + frac(b, a) + ' = ' + num(s), 'multiply both sides by ' + frac(b, a) + ', the flip of ' + frac(a, b)), W('x = ' + B(num(x)), undo(q))],
      steps: [st(B(e) + '. Multiply both sides by ' + frac(b, a) + ': ' + B('x ' + signed(q) + ' = ?'), s), st(B('x ' + signed(q) + ' = ' + num(s)) + '. x = ?', x)],
      traps: [tr(dec(r * a / b - q), 'f_divfrac', 'To undo × ' + frac(a, b) + ', multiply by its flip, ' + frac(b, a) + '.'), tr(r - q, 'x_bracket', 'Undo the × ' + frac(a, b) + ' first.'), tr(s + q, q < 0 ? 'n_intsub' : 'x_twostep', 'To undo ' + signed(q) + ', do the opposite to both sides.')] };
  } },

{ id: 'g_prism', s: 'meas', g: 7, title: 'Volume of any prism', pre: [], paper: true, cc: ['7.G.B.6'],
  tip: 'Any prism: volume = area of the base × length (the distance between the two matching ends). A triangle base is ½ × base × height; a trapezoid is ½ × (top + bottom) × height.',
  gen(d, R) {
    const U = R.pick(['cm', 'm', 'in']), U2 = U + '²', U3 = U + '³', L = R.i(3, 15);
    if (d === 0) {
      const a = R.i(2, 12), b = R.i(2, 12); if (a * b % 2) return null;
      const A = a * b / 2, V = A * L;
      return { text: 'The base of this prism is a right triangle. Its two shorter sides are ' + B(a + ' ' + U) + ' and ' + B(b + ' ' + U) + '. The prism is ' + B(L + ' ' + U) + ' long. What is its volume?', ans: V, unit: U3,
        vis: prismSVG('rt', { a: a + ' ' + U, b: b + ' ' + U, L: L + ' ' + U }),
        how: ['V = base area × length', W('base = ½ × ' + a + ' × ' + b + ' = ' + A + ' ' + U2, 'a right triangle is half a rectangle'), 'V = ' + A + ' × ' + L + ' = ' + B(num(V)) + ' ' + U3],
        steps: [st('Base area: ' + B('½ × ' + a + ' × ' + b) + ' = ?', A), st(B(A + ' × ' + L) + ' = ?', V)],
        traps: [tr(a * b * L, 'g_tri', 'The base is a triangle: half of ' + a + ' × ' + b + '.'), tr(A + L, 'g_volume', 'Multiply the base area by the length.'), tr(A, 'g_prism', 'That is the base. Multiply by the length, ' + L + ' ' + U + '.')] };
    }
    const trap = R.chance(.5);
    let A, how1, vis, desc, bad, labs, areaQ;
    if (trap) {
      const a = R.i(2, 9), b = a + R.i(2, 8), h = R.i(2, 10); if ((a + b) * h % 2) return null;
      A = (a + b) * h / 2; how1 = W('base = ½ × (' + a + ' + ' + b + ') × ' + h + ' = ' + A + ' ' + U2, 'trapezoid: half the sum of the parallel sides × height');
      labs = { a: a + ' ' + U, b: b + ' ' + U, h: h + ' ' + U, L: L + ' ' + U }; vis = prismSVG('trap', labs); desc = 'The base of this prism is a trapezoid. Its parallel sides are ' + B(a + ' ' + U) + ' and ' + B(b + ' ' + U) + ', and its height is ' + B(h + ' ' + U) + '.'; areaQ = 'A trapezoid has parallel sides of ' + a + ' ' + U + ' and ' + b + ' ' + U + '. Its height is ' + h + ' ' + U + '. What is its area?';
      bad = [[(a + b) * h, 'g_para', 'A trapezoid is half of (top + bottom) × height.'], [a * b * h / 2 === A ? null : a * b, 'g_para', 'Add the parallel sides, then multiply by the height and halve.']];
    } else {
      const b = R.i(3, 14), h = R.i(2, 12); if (b * h % 2) return null;
      A = b * h / 2; how1 = W('base = ½ × ' + b + ' × ' + h + ' = ' + A + ' ' + U2, 'triangle: half of base × height');
      labs = { b: b + ' ' + U, h: h + ' ' + U, L: L + ' ' + U }; vis = prismSVG('tri', labs); desc = 'The base of this prism is a triangle. The triangle has a base of ' + B(b + ' ' + U) + ' and a height of ' + B(h + ' ' + U) + '.'; areaQ = 'A triangle has a base of ' + b + ' ' + U + ' and a height of ' + h + ' ' + U + '. What is its area?';
      bad = [[b * h, 'g_tri', 'A triangle is half of base × height.']];
    }
    const V = A * L;
    if (d === 1) return { text: desc + ' The prism is ' + B(L + ' ' + U) + ' long. What is its volume?', ans: V, unit: U3, vis,
      how: ['V = base area × length', how1, 'V = ' + A + ' × ' + L + ' = ' + B(num(V)) + ' ' + U3],
      steps: [st(areaQ, A), st(B(A + ' × ' + L) + ' = ?', V)],
      traps: bad.map(t => tr(t[0] == null ? null : t[0] * L, t[1], t[2])).concat([tr(A + L, 'g_volume', 'Multiply the base area by the length.')]) };
    return { text: desc + ' The volume of the prism is ' + B(num(V) + ' ' + U3) + '. How long is the prism?', ans: L, unit: U, vis: prismSVG(trap ? 'trap' : 'tri', Object.assign({}, labs, { L: '? ' + U })),
      how: ['V = base area × length', how1, W('length = ' + num(V) + ' ÷ ' + A + ' = ' + B(L) + ' ' + U, 'undo the × base area')],
      steps: [st(areaQ, A), st(B(num(V) + ' ÷ ' + A) + ' = ?', L)],
      traps: bad.map(t => tr(t[0] && isInt(V / t[0]) ? V / t[0] : null, t[1], t[2])).concat([tr(V - A, 'g_volume', 'Volume is base area × length, so divide.')]) };
  } },

{ id: 'd_sample', s: 'data', g: 7, title: 'Predict from a sample', pre: ['f_proportion'], cc: ['7.SP.A.2'],
  tip: 'A random sample shows about what part of everyone does something. 12 of 50 sampled walk to school (24%), so about 24% of all 900 students walk: 216.',
  gen(d, R) {
    const [who, act, aux] = R.pick([['students', 'walk to school', 'do'], ['students', 'have a pet dog', 'do'], ['voters', 'want a new park', 'do'], ['shoppers', 'brought their own bag', 'did'], ['fans', 'want the game on Saturday', 'do']]);
    if (d < 2) {
      const n = d === 0 ? R.pick([10, 20, 25, 50]) : R.pick([20, 25, 40, 50, 80]), p = R.i(2, n - 2);
      let N, f, pct;
      if (d === 0) { f = R.i(4, 40); N = n * f; }
      else { pct = p / n * 100; N = R.i(3, 30) * 100; if (N % n === 0 && R.chance(.7)) return null; if (!isInt(N * p / n)) return null; }
      const ans = N * p / n;
      const how = d === 0 ? [W(p + ' out of ' + n + ' in the sample ' + act, 'the sample stands for everyone'), W(num(N) + ' ÷ ' + n + ' = ' + f, 'everyone is ' + f + ' times the sample'), W(f + ' × ' + p + ' = ' + B(num(ans)))]
        : [W(p + ' out of ' + n + ' = ' + fl(p, n) + ' = ' + num(pct) + '%', 'the sample stands for everyone'), W(num(pct) + '% of ' + num(N) + ' = ' + B(num(ans)))];
      return { text: 'In a random sample of ' + B(n + ' ' + who) + ', ' + B(p) + ' ' + act + '. About how many of all ' + B(num(N) + ' ' + who) + ' ' + act + '?', ans,
        how, steps: d === 0 ? [st(B(num(N) + ' ÷ ' + n) + ' = ?', f), st(B(f + ' × ' + p) + ' = ?', ans)] : [st(p + ' out of ' + n + ' is what percent?', pct, { unit: '%' }), st(B(num(pct) + '% of ' + num(N)) + ' = ?', ans)],
        traps: [tr(p, 'd_sample', 'That is only the sample. Scale it up to all ' + num(N) + '.'), tr(N - ans, 'd_complement', 'That is about how many do not.'), tr(N - (n - p) === ans ? null : N - n + p, 'f_ratio', 'Scale up by multiplying, not by adding the same amount.')] };
    }
    const n = R.pick([20, 25, 40, 50]), p1 = R.i(3, n - 3), p2 = R.i(3, n - 3); if ((p1 + p2) % 2 || p1 === p2) return null;
    const pa = (p1 + p2) / 2, f = R.i(5, 40), N = n * f, ans = f * pa;
    return { text: 'Two random samples of ' + B(n + ' ' + who) + ' each were taken. In the first sample, ' + B(p1) + ' ' + who + ' ' + act + '. In the second sample, ' + B(p2) + ' ' + who + ' ' + aux + '. Average the two samples. About how many of all ' + B(num(N) + ' ' + who) + ' ' + act + '?', ans,
      how: [W('average: (' + p1 + ' + ' + p2 + ') ÷ 2 = ' + pa + ' out of ' + n, 'samples vary, so average them'), W(num(N) + ' ÷ ' + n + ' = ' + f), W(f + ' × ' + pa + ' = ' + B(num(ans)))],
      steps: [st('What is the average of ' + p1 + ' and ' + p2 + '?', pa), st(B(num(N) + ' ÷ ' + n) + ' = ?', f), st(B(f + ' × ' + pa) + ' = ?', ans)],
      traps: [tr(f * p1, 'd_sample', 'Use both samples: average them first.'), tr(f * p2, 'd_sample', 'Use both samples: average them first.'), tr(f * (p1 + p2), 'd_mean', 'Average the two samples: add, then divide by 2.')] };
  } },

{ id: 'd_overlap', s: 'data', g: 7, title: 'How far apart are two groups?', pre: [], paper: true, cc: ['7.SP.B.3'],
  tip: 'Divide the difference of the means by the spread (the MAD). Means 12 cm apart with a MAD of 4 cm: 12 ÷ 4 = 3 MADs apart. More MADs apart means the groups overlap less.',
  gen(d, R) {
    const [A, Bn, what, u, lo, hi] = R.pick([['Team A', 'Team B', 'height', 'cm', 125, 160], ['Class 1', 'Class 2', 'quiz score', 'points', 50, 75], ['The sunny garden bed', 'the shady garden bed', 'plant height', 'cm', 10, 50],
      ['The red team', 'the blue team', 'jump distance', 'cm', 100, 180], ['Bag A', 'bag B', 'apple weight', 'g', 120, 180]]);
    if (d < 2) {
      const s = R.i(2, 8), k = d === 0 ? R.pick([1, 2, 3, 4]) : R.pick([1.5, 2.5, 3.5, 2, 3, 0.5]), D = dec(k * s), m1 = R.i(lo, hi);
      if (!isInt(D)) return null;
      const m2 = m1 + D;
      if (d === 1 && R.chance(.45)) return { text: A + ' has a mean ' + what + ' of ' + B(m1 + ' ' + u) + '. ' + cap(Bn) + ' has a higher mean. Both have a MAD of ' + B(s + ' ' + u) + '. The two means are ' + B(num(k) + ' MADs') + ' apart. What is the higher mean?', ans: m2, unit: u,
        how: [W('gap = ' + num(k) + ' × ' + s + ' = ' + D + ' ' + u, num(k) + ' MADs of ' + s + ' ' + u), W(m1 + ' + ' + D + ' = ' + B(m2) + ' ' + u)],
        steps: [st('The gap between the means: ' + B(num(k) + ' × ' + s) + ' = ?', D), st('Add the gap to the lower mean: ' + B(m1 + ' + ' + D) + ' = ?', m2)],
        traps: [tr(m1 + k, 'd_overlap', 'Each MAD is ' + s + ' ' + u + ', so the gap is ' + num(k) + ' × ' + s + '.'), tr(D, 'd_overlap', 'That is the gap between the means. Add it to ' + m1 + '.'), tr(m1 - D, 'd_overlap', 'The second mean is higher: add the gap.')] };
      return { text: A + ' has a mean ' + what + ' of ' + B(m1 + ' ' + u) + '. ' + cap(Bn) + ' has a mean of ' + B(m2 + ' ' + u) + '. Both have a mean absolute deviation (MAD) of ' + B(s + ' ' + u) + '. How many MADs apart are the means?', ans: k,
        how: [W('difference of means = ' + m2 + ' ' + MINUS + ' ' + m1 + ' = ' + D + ' ' + u), W(D + ' ÷ ' + s + ' = ' + B(num(k)), 'how many MADs fit in the gap')],
        steps: [st('The means are ' + m1 + ' ' + u + ' and ' + m2 + ' ' + u + '. How far apart are the means?', D), st(B(D + ' ÷ ' + s) + ' = ?', k)],
        traps: [tr(D, 'd_overlap', 'That is the gap in ' + u + '. Divide it by the MAD.'), tr(isInt(s / D * 1000) ? dec(s / D) : null, 'd_overlap', 'Divide the gap by the MAD, not the MAD by the gap.'), tr(dec(D * s), 'd_overlap', 'Divide the gap by the MAD to count how many MADs fit.')] };
    }
    const n = R.pick([4, 5]), dev = []; for (let i = 0; i < n - 1; i++) dev.push(R.i(-5, 5)); dev.push(-sum(dev));
    if (Math.abs(dev[n - 1]) > 6) return null;
    const T = sum(dev.map(Math.abs)), mad = T / n; if (!T || !isInt(mad * 2)) return null;
    const mA = R.i(10, 60), k = R.pick([1, 1.5, 2, 2.5, 3, 4]), D = dec(k * mad); if (!isInt(D)) return null;
    const mB = mA + D, setA = dev.map(v => mA + v), setB = R.shuffle(dev).map(v => mB + v);
    return { text: 'Set A: ' + B(setA.join(', ')) + '. Set B: ' + B(setB.join(', ')) + '. Both sets have a MAD of ' + B(num(mad)) + '. How many MADs apart are their means?', ans: k,
      how: [W('mean of A = ' + sum(setA) + ' ÷ ' + n + ' = ' + mA), W('mean of B = ' + sum(setB) + ' ÷ ' + n + ' = ' + mB), W('difference = ' + mB + ' ' + MINUS + ' ' + mA + ' = ' + D), W(D + ' ÷ ' + num(mad) + ' = ' + B(num(k)), 'how many MADs fit in the gap')],
      steps: [st('What is the mean of ' + B(setA.join(', ')) + '?', mA), st('What is the mean of ' + B(setB.join(', ')) + '?', mB), st('The means are ' + mA + ' and ' + mB + ', so they are ' + D + ' apart. ' + B(D + ' ÷ ' + num(mad)) + ' = ?', k)],
      traps: [tr(D, 'd_overlap', 'That is the gap between the means. Divide it by the MAD.'), tr(isInt(mad / D * 1000) ? dec(mad / D) : null, 'd_overlap', 'Divide the gap by the MAD, not the MAD by the gap.'), tr(sum(setB) - sum(setA), 'd_mean', 'Compare the means, not the totals.')] };
  } },

{ id: 'd_expect7', s: 'data', g: 7, title: 'Predict how many times', pre: ['f_of'], cc: ['7.SP.C.6'],
  tip: 'Expected count = probability × number of tries. A fair die lands on 3 about 1/6 of the time, so in 600 rolls expect about 600 ÷ 6 = 100 threes.',
  gen(d, R) {
    if (d === 0) {
      const kind = R.pick(['die', 'coin', 'spin']);
      const [q, N, thing, ev] = kind === 'die' ? [6, 6 * R.i(5, 50), 'A fair die is rolled', 'a ' + R.i(1, 6)] : kind === 'coin' ? [2, 2 * R.i(10, 150), 'A fair coin is flipped', 'heads'] : [4, 4 * R.i(5, 60), 'A spinner has 4 equal parts: red, blue, green and yellow. The spinner is spun', 'blue'];
      const ans = N / q;
      return { text: thing + ' ' + B(N + ' times') + '. About how many times should it land on ' + ev + '?', ans,
        how: [W('P(' + ev + ') = ' + frac(1, q), 'each of the ' + q + ' outcomes is equally likely'), W(frac(1, q) + ' of ' + N + ' = ' + N + ' ÷ ' + q + ' = ' + B(ans))],
        steps: [st((kind === 'die' ? 'A fair die has 6 faces. Out of every 6 rolls' : kind === 'coin' ? 'A fair coin has 2 sides. Out of every 2 flips' : 'A spinner has 4 equal parts, and 1 part is blue. Out of every 4 spins') + ', about how many should land on ' + ev + '?', 1), st(B(N + ' ÷ ' + q) + ' = ?', ans)],
        traps: [tr(N - ans, 'd_complement', 'That is about how many times it does not land on ' + ev + '.'), tr(q === 2 ? null : N / 2, 'd_prob', 'There are ' + q + ' equally likely outcomes, not 2.'), tr(N * q, 'f_unit', 'Find ' + frac(1, q) + ' of ' + N + ': divide.')] };
    }
    if (d === 1) {
      if (R.chance(.5)) {
        const [ev, k, list] = R.pick([['an even number', 3, '2, 4, 6'], ['a number greater than 4', 2, '5, 6'], ['a multiple of 3', 2, '3, 6'], ['a 1 or a 2', 2, '1, 2'], ['a number less than 5', 4, '1, 2, 3, 4'], ['an odd number', 3, '1, 3, 5']]);
        const F = Q(k, 6), N = 6 * R.i(5, 60), ans = N * k / 6;
        return { text: 'A fair die is rolled ' + B(N + ' times') + '. About how many times should it land on ' + ev + '?', ans,
          how: [W('P = ' + frac(k, 6) + (F.d !== 6 ? ' = ' + qs(F) : ''), k + ' of the 6 faces work: ' + list), W(qs(F) + ' of ' + N + ' = ' + ofS(N, F.d, F.n) + ' = ' + B(ans))],
          steps: [st('How many of the 6 faces of a die show ' + ev + '?', k), st(B(ofS(N, F.d, F.n)) + ' = ?', ans)],
          traps: [tr(N / 6, 'd_prob', 'Count all the faces that work: ' + list + '.'), tr(N - ans, 'd_complement', 'That is about how many times it does not happen.'), tr(F.n > 1 ? N / F.d : null, 'f_of', 'That is ' + frac(1, F.d) + ' of the rolls. You need ' + qs(F) + '.')] };
      }
      const F = R.pick([Q(2, 5), Q(3, 8), Q(1, 3), Q(3, 4), Q(2, 3), Q(3, 10), Q(5, 8), Q(1, 5)]), N = F.d * R.i(5, 40), ans = N * F.n / F.d, col = R.pick(['red', 'blue', 'green']);
      return { text: 'The chance that a spinner lands on ' + col + ' is ' + B(qs(F)) + '. The spinner is spun ' + B(N + ' times') + '. About how many times should it land on ' + col + '?', ans,
        how: [W('expected = ' + qs(F) + ' × ' + N, 'probability × tries'), W(ofS(N, F.d, F.n) + ' = ' + B(ans))],
        steps: [st(B(N + ' ÷ ' + F.d) + ' = ?', N / F.d), st(B((N / F.d) + ' × ' + F.n) + ' = ?', ans)],
        traps: [tr(F.n > 1 ? N / F.d : null, 'f_of', 'That is ' + frac(1, F.d) + ' of the spins. You need ' + qs(F) + '.'), tr(N - ans, 'd_complement', 'That is about how many times it lands on something else.'), tr(F.n, 'd_expect7', 'That is the top of the probability. Multiply it by the number of spins.')] };
    }
    const r = R.i(1, 6), b = R.i(1, 6), g = R.i(1, 6), T = r + b + g, N = T * R.i(4, 25), pick = R.pick([['red', r], ['blue', b], ['green', g], ['not green', r + b]]), ans = N * pick[1] / T;
    if (r === b && b === g) return null;
    return { text: 'A bag has ' + B(r + ' red') + ', ' + B(b + ' blue') + ' and ' + B(g + ' green') + ' marbles. You pick one, put it back, and do this ' + B(N + ' times') + '. About how many times should you pick ' + (pick[0] === 'not green' ? 'a marble that is not green' : 'a ' + pick[0] + ' marble') + '?', ans,
      how: [W('P(' + pick[0] + ') = ' + pick[1] + ' out of ' + T + ' = ' + frac(pick[1], T), pick[0] === 'not green' ? r + ' red + ' + b + ' blue' : T + ' marbles in all'), W(frac(pick[1], T) + ' of ' + N + ' = ' + ofS(N, T, pick[1]) + ' = ' + B(ans))],
      steps: [st('A bag has ' + r + ' red, ' + b + ' blue and ' + g + ' green marbles. How many marbles is that in all?', T), st(B(N + ' ÷ ' + T) + ' = ?', N / T), st(B((N / T) + ' × ' + pick[1]) + ' = ?', ans)],
      traps: [tr(isInt(N / 3) ? N / 3 : null, 'd_prob', 'The colors are not equally likely: count the marbles of each color.'), tr(isInt(N * pick[1] / (T - pick[1])) ? N * pick[1] / (T - pick[1]) : null, 'd_prob', 'Compare with all ' + T + ' marbles, not just the others.'), tr(N - ans, 'd_complement', 'That is about how many times the other marbles come up.')] };
  } },

{ id: 'd_experiment', s: 'data', g: 7, title: 'Probability from a tally', pre: ['f_simplify'], cc: ['7.SP.C.7b', '7.SP.C.6'],
  tip: 'Experimental probability = times it happened ÷ total tries. 12 heads in 40 flips: 12/40 = 3/10. Use it to predict: in 200 flips, expect about 3/10 × 200 = 60 heads.',
  gen(d, R) {
    if (d < 2) {
      const [thing, a, b] = R.pick([['A coin was flipped', 'heads', 'tails'], ['A paper cup was tossed', 'on its side', 'upright or upside down'], ['A thumbtack was dropped', 'point up', 'point down'], ['A bottle cap was flipped', 'top up', 'top down']]);
      const n = R.pick([20, 25, 40, 50]), k = R.i(3, n - 3), F = Q(k, n), vis = table([['Result', cap(a), cap(b)], ['Count', k, n - k]]);
      if (d === 0) return { text: thing + ' ' + B(n + ' times') + '. What is the experimental probability that it lands ' + a + '? Type a fraction.', ans: F, type: 'frac', vis,
        how: [W('P(' + a + ') = times it happened ÷ tries = ' + k + ' ÷ ' + n), '= ' + frac(k, n) + (F.d !== n ? ' = ' + B(qs(F)) : '')],
        steps: [st('It landed ' + a + ' ' + k + ' times and ' + b + ' ' + (n - k) + ' times. How many times did it land ' + a + '?', k), st('How many tries were there in all? ' + B(k + ' + ' + (n - k)) + ' = ?', n), st('It landed ' + a + ' ' + k + ' times in ' + n + ' tries. What fraction of the tries is that?', F, { type: 'frac' })],
        traps: [tr(Q(k, n - k), 'd_prob', 'Compare with all the tries, not with the other result.'), tr(a === 'heads' && k * 2 !== n ? Q(1, 2) : null, 'd_experiment', 'Use what happened in the experiment, not the equal-chance guess.'), tr(Q(n - k, n), 'd_complement', 'That is the chance it lands ' + b + '.')] };
      const M = F.d * R.i(4, 40), ans = M * F.n / F.d;
      if (M <= n) return null;
      return { text: thing + ' ' + B(n + ' times') + '. The table shows the results. About how many times would it land ' + a + ' in ' + B(M + ' tries') + '?', ans, vis,
        how: [W('P(' + a + ') = ' + frac(k, n) + (F.d !== n ? ' = ' + qs(F) : ''), 'from the experiment'), W(qs(F) + ' of ' + M + ' = ' + ofS(M, F.d, F.n) + ' = ' + B(ans))],
        steps: [st('It landed ' + a + ' ' + k + ' times in ' + n + ' tries. What fraction of the tries is that?', F, { type: 'frac' }), st(B(ofS(M, F.d, F.n)) + ' = ?', ans)],
        traps: [tr(a === 'heads' ? M / 2 : null, 'd_experiment', 'Use the tally, not the equal-chance guess.'), tr(isInt(M * k / (n - k)) ? M * k / (n - k) : null, 'd_prob', 'Compare with all the tries, not with the other result.'), tr(k + M - n, 'f_ratio', 'Scale up by multiplying, not by adding the same amount.')] };
    }
    const n = R.pick([40, 50, 60, 80, 100]), cols = ['Red', 'Blue', 'Green', 'Yellow'], c = [R.i(3, n / 2), R.i(3, n / 3), R.i(3, n / 3)]; c.push(n - sum(c)); if (c[3] < 3) return null;
    const i = R.i(0, 3), F = Q(c[i], n), vis = table([['Color', ...cols], ['Count', ...c]]), col = cols[i].toLowerCase();
    if (R.chance(.5)) return { text: 'A spinner with four colors was spun ' + B(n + ' times') + '. What is the experimental probability of ' + col + '? Type a fraction.', ans: F, type: 'frac', vis,
      how: [W('P(' + col + ') = ' + c[i] + ' ÷ ' + n, 'times it happened ÷ spins'), '= ' + frac(c[i], n) + (F.d !== n ? ' = ' + B(qs(F)) : '')],
      steps: [st('The counts are ' + listAnd(c) + '. How many spins is that in all?', n), st('The spinner landed on ' + col + ' ' + c[i] + ' times in ' + n + ' spins. What fraction of the spins is that?', F, { type: 'frac' })],
      traps: [tr(Q(1, 4), 'd_experiment', 'Use the tally, not the equal-chance guess of 1 in 4.'), tr(Q(c[i], n - c[i]), 'd_prob', 'Compare with all the spins, not with the other colors.'), tr(c[i], 'd_experiment', 'Write it as a fraction of all ' + n + ' spins.')] };
    const M = F.d * R.i(5, 30), ans = M * F.n / F.d; if (M <= n) return null;
    return { text: 'A spinner with four colors was spun ' + B(n + ' times') + '. The table shows the results. About how many times would it land on ' + col + ' in ' + B(M + ' spins') + '?', ans, vis,
      how: [W('P(' + col + ') = ' + frac(c[i], n) + (F.d !== n ? ' = ' + qs(F) : ''), 'from the tally'), W(qs(F) + ' of ' + M + ' = ' + ofS(M, F.d, F.n) + ' = ' + B(ans))],
      steps: [st('The spinner landed on ' + col + ' ' + c[i] + ' times in ' + n + ' spins. What fraction of the spins is that?', F, { type: 'frac' }), st(B(ofS(M, F.d, F.n)) + ' = ?', ans)],
      traps: [tr(isInt(M / 4) ? M / 4 : null, 'd_experiment', 'Use the tally, not the equal-chance guess of 1 in 4.'), tr(c[i] + M - n, 'f_ratio', 'Scale up by multiplying, not by adding the same amount.'), tr(M - ans, 'd_complement', 'That is about how many times it lands on another color.')] };
  } },

/* ======================= Grade 8 ======================= */
{ id: 'x_rates2', s: 'alg', g: 8, title: 'Compare two rates', pre: ['f_constk'], cc: ['8.EE.B.5'],
  tip: 'Find each unit rate however it is shown: from a table divide y by x, from y = kx read k, from a graph read y at x = 1. Then compare. 110 miles in 2 hours is 55 mph; d = 60t is 60 mph.',
  gen(d, R) {
    const [nA, nB, xu, yu, yv, xv, rateU, lo, hi, verb] = R.pick([['Car A', 'Car B', 'hours', 'miles', 'd', 't', 'miles per hour', 30, 70, 'drives'], ['Pump A', 'Pump B', 'minutes', 'liters', 'v', 'm', 'liters per minute', 2, 12, 'pumps'],
      ['Printer A', 'Printer B', 'minutes', 'pages', 'p', 'm', 'pages per minute', 4, 30, 'prints'], ['Runner A', 'Runner B', 'minutes', 'meters', 'd', 'm', 'meters per minute', 100, 250, 'runs']]);
    const xu1 = xu.replace(/s$/, '');
    let a, b; do { a = R.i(lo, hi); b = R.i(lo, hi); } while (Math.abs(a - b) < 2 || Math.abs(a - b) > (hi - lo) / 2);
    const xs = R.shuffle([2, 3, 4, 5, 6]).slice(0, 2).sort((p, q) => p - q), ys = xs.map(x => a * x);
    const aTab = { vis: table([[xu + ' (' + xv + ')', ...xs], [yu + ' (' + yv + ')', ...ys]]), how: nA + ' (table): ' + num(ys[0]) + ' ÷ ' + xs[0] + ' = ' + a + ' ' + rateU + '.', desc: nA + ' is shown in the table.', q: nA + ' ' + verb + ' ' + num(ys[0]) + ' ' + yu + ' in ' + xs[0] + ' ' + xu + '. What is ' + nA + '\'s rate in ' + rateU + '?' };
    const ax = R.i(2, 5), ay = a * ax, top = niceTop(a * 6);
    const aGraph = { vis: graphSVG({ x0: 0, x1: 6, y0: 0, y1: top.top, xs: 1, ys: top.step, xlab: 1, ylab: top.step * 2, xl: xu, yl: yu, lines: [{ m: a, b: 0 }], pts: [{ x: ax, y: ay, t: '(' + ax + ', ' + num(ay) + ')' }] }), how: nA + ' (graph): the point (' + ax + ', ' + num(ay) + ') gives ' + num(ay) + ' ÷ ' + ax + ' = ' + a + ' ' + rateU + '.', desc: nA + ' is shown in the graph.', q: nA + ' ' + verb + ' ' + num(ay) + ' ' + yu + ' in ' + ax + ' ' + xu + '. What is ' + nA + '\'s rate in ' + rateU + '?' };
    const A0 = d === 1 ? aGraph : aTab, fast = Math.max(a, b), slow = Math.min(a, b), diff = fast - slow;
    let bDesc = nB + ' follows the rule ' + B(yv + ' = ' + b + xv) + '.', bHow = nB + ': ' + yv + ' = ' + b + xv + ' means ' + b + ' ' + rateU + '.';
    if (d === 2 && R.chance(.5)) { const h2 = R.i(2, 5); bDesc = nB + ' ' + verb + ' ' + B(num(b * h2) + ' ' + yu) + ' in ' + B(h2 + ' ' + xu) + '.'; bHow = nB + ': ' + num(b * h2) + ' ÷ ' + h2 + ' = ' + b + ' ' + rateU + '.'; }
    if (d < 2) return { text: A0.desc + ' ' + bDesc + ' What is the difference between their rates, in ' + rateU + '?', ans: diff, vis: A0.vis, unit: rateU,
      how: [A0.how, bHow, 'Difference: ' + fast + ' ' + MINUS + ' ' + slow + ' = ' + B(diff) + ' ' + rateU + '.'],
      steps: [st(A0.q, a), st(bDesc + ' What is ' + nB + '\'s rate in ' + rateU + '?', b), st(B(fast + ' ' + MINUS + ' ' + slow) + ' = ?', diff)],
      traps: [tr(Math.abs((d === 1 ? ay : ys[0]) - b), 'x_rates2', 'Find ' + nA + '\'s rate for 1 ' + xu1 + ' first.'), tr(a + b, 'x_rates2', 'Compare the two rates: take the smaller from the bigger.'), tr(fast, 'x_rates2', 'That is the faster rate. How much more is it than the slower one?')] };
    const h = R.i(3, 9), ans = h * diff;
    return { text: A0.desc + ' ' + bDesc + ' After ' + B(h + ' ' + xu) + ', what is the difference between their totals, in ' + yu + '?', ans, vis: A0.vis, unit: yu,
      how: [A0.how, bHow, W('difference per ' + xu1 + ': ' + fast + ' ' + MINUS + ' ' + slow + ' = ' + diff), W(h + ' × ' + diff + ' = ' + B(num(ans)) + ' ' + yu)],
      steps: [st(A0.q, a), st(bDesc + ' What is ' + nB + '\'s rate in ' + rateU + '?', b), st('The rates are ' + diff + ' ' + rateU + ' apart. ' + B(h + ' × ' + diff) + ' = ?', ans)],
      traps: [tr(diff, 'x_rates2', 'That is the difference for 1 ' + xu1 + '. Multiply by ' + h + '.'), tr(h * fast, 'x_rates2', 'That is how far the faster one goes. Take away the slower one\'s distance.'), tr(h * (a + b), 'x_rates2', 'Find the difference, not the total.')] };
  } },

{ id: 'x_howmany', s: 'alg', g: 8, title: 'One, none or infinitely many', pre: [], paper: true, cc: ['8.EE.C.7a'],
  tip: 'Simplify both sides. Different x-coefficients: exactly one solution. Same x-coefficient and same number: true for every x (infinitely many). Same x-coefficient, different numbers: no solution.',
  gen(d, R) {
    const br = (p, q) => num(p) + '(x ' + signed(q) + ')';
    const ident = (comb) => {
      const p = R.i(2, 9), q = d === 0 ? R.i(1, 9) : nz(R, -9, 9), r = comb ? R.i(2, 5) * R.pick([1, -1]) : 0, pq = p * q;
      if (p + r === 0) return null;
      const lhs = br(p, q) + (r ? ' ' + signed(r).replace(/(\d+)$/, '$1x') : ''), rhs = poly([p + r, 0]) + ' + k';
      return { text: 'The equation ' + B(lhs + ' = ' + rhs) + ' is true for every value of x. What is k?', ans: pq,
        how: [W(poly([p + r, pq]) + ' = ' + rhs, 'multiply out' + (r ? ' and collect the x-terms' : '') + ' on the left'), W('k = ' + B(num(pq)), 'both sides must match exactly; then every x works')],
        steps: [st('Multiply out ' + B(br(p, q)) + '. What is the number part?', pq)],
        traps: [tr(q, 'x_distribute', 'The ' + p + ' multiplies the ' + num(q) + ' too.'), tr(p + q, 'x_distribute', 'Multiply the ' + num(q) + ' by ' + p + '.'), tr(0, 'x_howmany', 'With k = 0 the two sides are ' + num(pq) + ' apart for every x, so no x works.')] };
    };
    const none = (expand) => {
      const c = R.i(2, 9), b0 = nz(R, -15, 15);
      if (!expand) { let e; do { e = nz(R, -15, 15); } while (e === b0);
        return { text: 'The equation ' + B('ax ' + signed(b0) + ' = ' + c + 'x ' + signed(e)) + ' has no solution. What is a?', ans: c,
          how: [W('no solution: the x-terms match but the numbers do not', 'then the two sides are always ' + Math.abs(b0 - e) + ' apart'), W('so a = ' + B(c), 'check: ' + c + 'x ' + signed(b0) + ' = ' + c + 'x ' + signed(e) + ' would need ' + num(b0) + ' = ' + num(e) + ', which is false')],
          steps: [st('For ' + B('ax ' + signed(b0) + ' = ' + c + 'x ' + signed(e)) + ' to have no solution, the x-terms must match. What number must a be?', c)],
          traps: [tr(-c, 'x_howmany', 'The x-terms must be exactly the same, sign too.'), tr(e - b0, 'x_bothsides', 'You do not solve for a number here: make the x-terms match.'), tr(c + 1, 'x_howmany', 'If the x-coefficients are different, there is exactly one solution.')] }; }
      const p = R.i(2, 5), m = R.i(1, 4), e = nz(R, -8, 8), c2 = p * m, b1 = nz(R, -20, 20); if (b1 === p * e) return null;
      return { text: 'The equation ' + B('ax ' + signed(b1) + ' = ' + br(p, 0).replace('(x + 0)', '') + '(' + (m === 1 ? '' : m) + 'x ' + signed(e) + ')') + ' has no solution. What is a?', ans: c2,
        how: [W('ax ' + signed(b1) + ' = ' + poly([c2, p * e]), 'multiply out the right side'), W('a = ' + B(c2), 'same x-terms, different numbers (' + num(b1) + ' and ' + num(p * e) + '): no solution')],
        steps: [st('Multiply out ' + B(p + '(' + (m === 1 ? '' : m) + 'x ' + signed(e) + ')') + '. What number is in front of x?', c2)],
        traps: [tr(m, 'x_distribute', 'The ' + p + ' multiplies the ' + (m === 1 ? '' : m) + 'x too.'), tr(c2 === b1 ? null : -c2, 'x_howmany', 'The x-terms must be exactly the same, sign too.')] };
    };
    if (d === 0) return R.chance(.55) ? ident(false) : none(false);
    if (d === 1) {
      const kind = R.pick(['count', 'count', 'ident', 'none']);
      if (kind === 'ident') return ident(true);
      if (kind === 'none') return none(true);
      const types = [R.pick(['one', 'none', 'inf']), R.pick(['one', 'none', 'inf']), R.pick(['one', 'none', 'inf'])], ask = R.pick(['none', 'inf', 'one']);
      const rows = types.map(t => {
        const p = R.i(2, 6), q = nz(R, -6, 6), pq = p * q; let rc = p, rk = pq;
        if (t === 'none') { do { rk = nz(R, -30, 30); } while (rk === pq); }
        if (t === 'one') { do { rc = R.i(1, 9); } while (rc === p); rk = nz(R, -30, 30); }
        const L = br(p, q), Rt = poly([rc, rk]);
        return { t, eq: L + ' = ' + Rt, line: W(poly([p, pq]) + ' = ' + Rt, t === 'one' ? 'different x-terms: one solution' : t === 'inf' ? 'both sides the same: infinitely many' : 'same x-terms, different numbers: none') };
      });
      if (new Set(rows.map(r => r.eq)).size < rows.length) return null; /* never the same equation twice in the list */
      const ans = types.filter(t => t === ask).length, word = { none: 'no solution', inf: 'infinitely many solutions', one: 'exactly one solution' };
      return { text: 'How many of these equations have ' + B(word[ask]) + '?<br>' + rows.map(r => B(r.eq)).join('<br>'), ans,
        how: rows.map(r => r.line).concat(['So ' + B(ans) + ' of them ' + (ans === 1 ? 'has ' : 'have ') + word[ask] + '.']),
        steps: rows.map(r => st('Does ' + B(r.eq) + ' have ' + word[ask] + '? Type 1 for yes or 0 for no.', r.t === ask ? 1 : 0)).concat([st('The answers for the three equations were ' + listAnd(rows.map(r => (r.t === ask ? 'yes' : 'no'))) + '. How many of the equations have ' + word[ask] + '?', ans)]),
        traps: ['none', 'inf', 'one'].filter(k => k !== ask).map(k => tr(types.filter(t => t === k).length, 'x_howmany', 'That counts the ones with ' + word[k] + '. Multiply out, then compare the x-terms and the numbers.')) };
    }
    const kind = R.pick(['one', 'nonepar', 'identpar']);
    if (kind === 'one') {
      const p = R.i(2, 7), q = nz(R, -6, 6), r = R.i(1, 4), s = R.i(1, 8), k = p - r - s, x = nz(R, -9, 9); if (k === 0) return null;
      const pq = p * q, t = k * x + pq, e = br(p, q) + ' ' + MINUS + ' ' + (r === 1 ? '' : r) + 'x = ' + poly([s, t]);
      return { text: 'This equation has exactly one solution. Find it: ' + B(e), ans: x,
        how: [e, W(poly([p - r, pq]) + ' = ' + poly([s, t]), 'multiply out and collect the x-terms'), W(poly([k, 0]) + ' = ' + num(t - pq), 'x-terms to one side, numbers to the other'), W('x = ' + B(num(x)), 'different x-coefficients, so exactly one answer')],
        steps: [st('Multiply out and collect ' + B(br(p, q) + ' ' + MINUS + ' ' + (r === 1 ? '' : r) + 'x') + '. You get ?x ' + signed(pq) + '. What goes in front of x?', p - r), st(B(poly([p - r, pq]) + ' = ' + poly([s, t])) + '. Put the x-terms on the left and the numbers on the right: ' + B(poly([k, 0]) + ' = ?'), t - pq), st(B(k === 1 ? poly([p - r, pq]) + ' = ' + poly([s, t]) : poly([k, 0]) + ' = ' + num(t - pq)) + '. x = ?', x)],
        traps: [tr(isInt((t - q) / k) ? (t - q) / k : null, 'x_distribute', 'The ' + p + ' multiplies the ' + num(q) + ' too.'), tr(-x, 'n_intsub', 'Check the signs when you move terms across the =.'), tr(t - pq, 'x_onestep', 'One more step: divide by ' + num(k) + '.')] };
    }
    if (kind === 'nonepar') {
      const p = R.i(2, 5), m = R.i(1, 5), q = R.i(1, 9), c = p * m, e = nz(R, -20, 20); if (e === -p * q) return null;
      return { text: 'The equation ' + B(p + '(ax ' + MINUS + ' ' + q + ') = ' + c + 'x ' + signed(e)) + ' has no solution. What is a?', ans: m,
        how: [W(p + 'ax ' + MINUS + ' ' + p * q + ' = ' + c + 'x ' + signed(e), 'multiply out'), W(p + 'a = ' + c, 'no solution: the x-terms must match, and ' + num(-p * q) + ' and ' + num(e) + ' differ'), W('a = ' + B(m))],
        steps: [st('Multiply out: ' + B(p + '(ax ' + MINUS + ' ' + q + ')') + ' = ?ax ' + MINUS + ' ' + p * q + '. What goes in front of ax?', p), st(B(p + 'a = ' + c) + '. a = ?', m)],
        traps: [tr(c, 'x_distribute', 'The ' + p + ' multiplies the ax too: ' + p + 'a must be ' + c + '.'), tr(-m, 'x_howmany', 'The x-terms must match exactly, sign too.'), tr(isInt((e + p * q) / c) ? (e + p * q) / c : null, 'x_bothsides', 'You do not solve for x here: make the x-terms match.')] };
    }
    const m = R.i(2, 8), q = R.i(1, 9), r = nz(R, -15, 15), k = r - m * q, e = num(m) + '(x ' + MINUS + ' ' + q + ') ' + signed(r) + ' = ' + m + 'x + k';
    return { text: 'The equation ' + B(e) + ' is true for every value of x. What is k?', ans: k,
      how: [W(m + 'x ' + MINUS + ' ' + m * q + ' ' + signed(r) + ' = ' + m + 'x + k', 'multiply out'), W(poly([m, k]) + ' = ' + m + 'x + k', 'collect the numbers: ' + num(-m * q) + ' ' + signed(r) + ' = ' + num(k)), W('k = ' + B(num(k)), 'both sides match for every x')],
      steps: [st('Multiply out ' + B(m + '(x ' + MINUS + ' ' + q + ')') + '. What is the number part?', -m * q), st(B(num(-m * q) + ' ' + signed(r)) + ' = ?', k)],
      traps: [tr(r - q, 'x_distribute', 'The ' + m + ' multiplies the ' + q + ' too.'), tr(r + m * q, 'n_intsub', 'The bracket gives ' + MINUS + m * q + ', a negative number.'), tr(-k, 'n_intadd', 'Check the sign of ' + num(-m * q) + ' ' + signed(r) + '.')] };
  } },

{ id: 'x_cross', s: 'alg', g: 8, title: 'Where two lines cross', pre: [], cc: ['8.EE.C.8a'],
  tip: 'The solution of two equations is the point on both lines: where they cross. Read its x and y from the grid and check it in both equations. y = 2x − 1 and y = −x + 5 cross at (2, 3).',
  gen(d, R) {
    const sl = [Q(-3), Q(-2), Q(-1), Q(-1, 2), Q(1, 2), Q(1), Q(2), Q(3), Q(0)];
    const mS = (m, svg) => (m.d === 2 ? (m.n < 0 ? MINUS : '') + (svg ? '½' : frac(1, 2)) : m.n === 1 ? '' : m.n === -1 ? MINUS : m.n === 0 ? '' : num(m.n));
    const eqS = (m, b, svg) => 'y = ' + (m.n === 0 ? num(b) : mS(m, svg) + 'x' + (b ? ' ' + signed(b) : ''));
    let X, Y, m1, m2, b1, b2;
    if (d < 2) {
      X = R.i(-4, 4); Y = R.i(-4, 4); m1 = R.pick(sl); m2 = R.pick(sl);
      if (qv(m1) === qv(m2) || (m1.d === 2 || m2.d === 2) && X % 2) return null;
      b1 = Y - qv(m1) * X; b2 = Y - qv(m2) * X;
      if (Math.abs(b1) > 9 || Math.abs(b2) > 9 || (d === 0 && (X === 0 || Y === 0))) return null;
    } else {
      m1 = Q(R.i(-1, 3)); m2 = Q(m1.n - 2); b1 = R.i(-5, 5); const twoX = R.pick([-7, -5, -3, -1, 1, 3, 5, 7]); X = twoX / 2; b2 = b1 + twoX; Y = qv(m1) * X + b1;
      if (Math.abs(Y) > 5.5 || Math.abs(b2) > 9) return null;
    }
    const askX = R.chance(.5), ans = askX ? X : Y, lab = d > 0;
    const vis = graphSVG({ x0: -6, x1: 6, y0: -6, y1: 6, xs: 1, ys: 1, xlab: 2, ylab: 2, lines: [{ m: qv(m1), b: b1, lab: lab ? eqS(m1, b1, true) : '' }, { m: qv(m2), b: b2, lab: lab ? eqS(m2, b2, true) : '', dy: 14 }] });
    const pt = '(' + num(X) + ', ' + num(Y) + ')', word = askX ? 'x' : 'y';
    const traps = [tr(askX ? Y : X, 'x_coord', 'That is the ' + (askX ? 'y' : 'x') + ' of the crossing point. The point is ' + (d === 2 ? '(x, y)' : pt) + ': x first, then y.'), tr(b1, 'x_intercept', 'That is where a line crosses the y-axis, not where the two lines cross.'), tr(b2, 'x_intercept', 'That is where a line crosses the y-axis, not where the two lines cross.')];
    if (d === 0) return { text: 'Two lines are drawn on the grid. What is the ' + B(word) + '-coordinate of the point where they cross?', ans, vis,
      how: ['The crossing point is the one point on both lines.', 'Follow it down to the x-axis and across to the y-axis: ' + pt + '.', 'So ' + word + ' = ' + B(num(ans)) + '.'],
      steps: [st('The two lines cross at the point ' + pt + '. What is the x-coordinate of that point?', X), st('The two lines cross at the point ' + pt + '. What is the y-coordinate of that point?', Y)], traps };
    const e1 = eqS(m1, b1), e2 = eqS(m2, b2), y1s = (m, b) => (m.n === 0 ? num(b) : (m.d === 2 ? frac(m.n, 2) : num(m.n)) + ' × ' + pn(X) + (b ? ' ' + signed(b) : '') + ' = ' + num(Y));
    if (d === 1) return { text: 'The lines ' + B(e1) + ' and ' + B(e2) + ' are drawn on the grid. What is the value of ' + B(word) + ' in the solution of the two equations?', ans, vis,
      how: ['The solution is where the lines cross. Read it from the grid: ' + pt + '.', 'Check: ' + y1s(m1, b1) + ', and ' + y1s(m2, b2) + '. Both work.', 'So ' + word + ' = ' + B(num(ans)) + '.'],
      steps: [st('The two lines cross at the point ' + pt + '. What is the x-coordinate of that point?', X), st('The two lines cross at the point ' + pt + '. What is the y-coordinate of that point?', Y)], traps };
    const k = m1.n - m2.n, rhs1 = (m1.n === 0 ? num(b1) : mS(m1) + 'x' + (b1 ? ' ' + signed(b1) : '')), rhs2 = (m2.n === 0 ? num(b2) : mS(m2) + 'x' + (b2 ? ' ' + signed(b2) : ''));
    return { text: 'The lines ' + B(e1) + ' and ' + B(e2) + ' cross between grid points. What is the exact ' + B(word) + '-coordinate of the crossing point?', ans, vis,
      how: [W(rhs1 + ' = ' + rhs2, 'at the crossing both lines have the same y'), W(k + 'x = ' + num(b2 - b1) + ', so x = ' + num(X), 'x-terms to one side, numbers to the other'), W('y = ' + y1s(m1, b1), 'put x into the first equation'), 'So ' + word + ' = ' + B(num(ans)) + '.'],
      steps: [st('Set ' + B(rhs1) + ' equal to ' + B(rhs2) + ' and collect the x-terms: ' + B(k + 'x = ?'), b2 - b1), st(B(k + 'x = ' + num(b2 - b1)) + '. x = ?', X), st('Put x = ' + num(X) + ' into ' + B(m1.n === 0 ? e2 : e1) + '. y = ?', Y)], traps };
  } },

{ id: 'x_compfn', s: 'alg', g: 8, title: 'Compare two functions', pre: [], cc: ['8.F.A.2'],
  tip: 'Rate of change: how much y changes when x goes up 1. Start value: y when x = 0. From a table, find the change for each 1; from y = mx + b, read m and b. Then compare.',
  gen(d, R) {
    let mA, bA, mB, bB; do { mA = d === 2 ? nz(R, -6, 9) : R.i(1, 9); bA = R.i(-5, 20); mB = d === 2 ? nz(R, -6, 9) : R.i(1, 9); bB = R.i(-5, 20); } while (mA === mB || bA === bB || !bA || !bB);
    const step = d === 2 ? 2 : 1, x0 = d === 0 ? 0 : R.i(1, 3), xs = [0, 1, 2, 3].map(i => x0 + i * step), ys = xs.map(x => mA * x + bA);
    let bDesc = 'Function B is ' + B('y = ' + poly([mB, bB])) + '.', bHow = 'B: y = ' + poly([mB, bB]) + ' has rate ' + num(mB) + ' and starts at ' + num(bB) + '.';
    if (d === 2 && R.chance(.5) && mB > 0 && bB > 0) { bDesc = 'Function B gives the marbles in a jar after x days. The jar starts with ' + B(bB) + ' marbles and gets ' + B(mB) + ' more each day.'; bHow = 'B: starts at ' + bB + ' and goes up ' + mB + ' each day, so its rate is ' + mB + '.'; }
    const ask = R.pick(['rate', 'start']), vis = table([['x', ...xs], ['y', ...ys]]);
    const rateHow = 'A: when x goes up ' + step + ', y changes by ' + num(ys[1] - ys[0]) + (step > 1 ? ', so for each 1 it changes by ' + num(ys[1] - ys[0]) + ' ÷ ' + step + ' = ' + num(mA) : ', so its rate is ' + num(mA)) + '.';
    const startHow = x0 === 0 ? 'A: at x = 0, y = ' + num(bA) + '.' : 'A: its rate is ' + num(mA) + '; go back from x = ' + x0 + ' to 0: ' + num(ys[0]) + ' ' + MINUS + ' ' + x0 + ' × ' + pn(mA) + ' = ' + num(bA) + '.';
    if (ask === 'rate') {
      const [hiN, loN, hiV, loV] = mA > mB ? ['A', 'B', mA, mB] : ['B', 'A', mB, mA], ans = hiV - loV;
      return { text: 'Function A is shown in the table. ' + bDesc + ' How much greater is ' + hiN + '\'s rate of change than ' + loN + '\'s?', ans, vis,
        how: [rateHow, bHow, num(hiV) + ' ' + MINUS + ' ' + pn(loV) + ' = ' + B(num(ans)) + '.'],
        steps: [st('In the table for A, y goes from ' + num(ys[0]) + ' to ' + num(ys[1]) + ' when x goes from ' + xs[0] + ' to ' + xs[1] + '. What is A\'s rate of change?', mA), st(bDesc + ' What is B\'s rate of change?', mB), st(B(num(hiV) + ' ' + MINUS + ' ' + pn(loV)) + ' = ?', ans)],
        traps: [tr(Math.abs(bA - bB), 'x_compfn', 'That compares where they start. The rate of change is the change in y for each 1 in x.'), tr(step > 1 ? Math.abs(ys[1] - ys[0] - mB) : null, 'x_slope', 'x goes up by ' + step + ' in the table, so divide the change in y by ' + step + '.'), tr(x0 > 0 && isInt(ys[0] / x0) && ys[0] / x0 !== mA ? Math.abs(ys[0] / x0 - mB) : null, 'f_constk', 'y ÷ x gives the rate only when the line goes through (0, 0). Use how much y changes.')] };
    }
    const [hiN, loN, hiV, loV] = bA > bB ? ['A', 'B', bA, bB] : ['B', 'A', bB, bA], ans = hiV - loV;
    return { text: 'Function A is shown in the table. ' + bDesc + ' At x = 0, how much greater is ' + hiN + '\'s value than ' + loN + '\'s?', ans, vis,
      how: [startHow, bHow, num(hiV) + ' ' + MINUS + ' ' + pn(loV) + ' = ' + B(num(ans)) + '.'],
      steps: [st(x0 === 0 ? 'The table for A has y = ' + num(bA) + ' when x = 0. What is A\'s value at x = 0?' : 'Function A has y = ' + num(ys[0]) + ' when x = ' + x0 + '. Its rate of change is ' + num(mA) + '. What is A\'s value at x = 0?', bA), st(bDesc + ' What is B\'s value at x = 0?', bB), st(B(num(hiV) + ' ' + MINUS + ' ' + pn(loV)) + ' = ?', ans)],
      traps: [tr(x0 > 0 ? Math.abs(ys[0] - bB) : null, 'x_functab', 'The table does not start at x = 0. Work back to x = 0.'), tr(Math.abs(mA - mB), 'x_compfn', 'That compares the rates. The start is the value at x = 0.')] };
  } },

{ id: 'd_trend', s: 'data', g: 8, title: 'Use a trend line', pre: ['x_linear'], cc: ['8.SP.A.3'],
  tip: 'A trend line y = mx + b makes predictions: put in x. The slope m is the change for each 1 (growth per day); b is the value at the start (x = 0). For when it reaches a value, solve mx + b = value.',
  gen(d, R) {
    const C0 = R.pick([['A plant\'s height h (cm) after d days', 'h', 'd', 'height', 'day', 'days', 'cm', [0.5, 1.5, 2, 2.5], [2, 12]], ['The amount saved s (dollars) after w weeks', 's', 'w', 'savings', 'week', 'weeks', 'dollars', [5, 7.5, 10, 12], [10, 50]],
      ['A puppy\'s weight p (kg) after m months', 'p', 'm', 'weight', 'month', 'months', 'kg', [0.5, 1.5, 2, 2.5], [2, 6]], ['The number of members n after w weeks', 'n', 'w', 'number of members', 'week', 'weeks', 'members', [3, 4, 6, 8], [10, 40]]]);
    const [desc, yv, xv, what, x1, xm, yu, ms, bs] = C0, m = R.pick(ms), b = R.i(bs[0], bs[1]), eq = yv + ' = ' + num(m) + xv + ' + ' + b;
    const top = niceTop(m * 12 + b + 2), pts = [];
    for (let x = 1; x <= 11; x += 2) { const y = dec(m * x + b + R.i(-2, 2) * top.step / 4); if (y > 0 && y < top.top) pts.push({ x, y, r: 4 }); }
    const vis = graphSVG({ x0: 0, x1: 12, y0: 0, y1: top.top, xs: 1, ys: top.step, xlab: 2, ylab: top.step * 2, xl: xm, yl: what, lines: [{ m, b }], pts });
    const intro = desc + ' follows the trend line ' + B(eq) + '. ';
    if (d === 0 || (d === 1 && R.chance(.35))) {
      const X = R.i(5, d === 0 ? 15 : 30), mX = dec(m * X), ans = dec(mX + b);
      return { text: intro + 'What does the trend line predict for ' + B(xv + ' = ' + X) + '?', ans, vis, unit: yu,
        how: [W('put ' + xv + ' = ' + X + ' into ' + eq), W(yv + ' = ' + num(m) + ' × ' + X + ' + ' + b + ' = ' + num(mX) + ' + ' + b + ' = ' + B(num(ans)))],
        steps: [st(B(num(m) + ' × ' + X) + ' = ?', mX), st(B(num(mX) + ' + ' + b) + ' = ?', ans)],
        traps: [tr(mX, 'x_linear', 'Add the start value, ' + b + '.'), tr(dec(m + X + b), 'x_eval', num(m) + xv + ' means ' + num(m) + ' × ' + xv + '.'), tr(dec((m + b) * X), 'x_order', 'Multiply first, then add.')] };
    }
    if (d === 1) {
      const slope = R.chance(.6);
      return { text: intro + (slope ? 'Using the trend line, what is the change in ' + (/^number/.test(what) ? 'the ' : '') + what + ' each ' + x1 + '?' : 'What does the trend line give at the start, when ' + xv + ' = 0?'), ans: slope ? m : b, vis, unit: yu,
        how: slope ? ['In ' + eq + ', the number times ' + xv + ' is the change for each ' + x1 + '.', 'Each ' + x1 + ' adds ' + B(num(m)) + ' ' + yu + '.'] : ['At ' + xv + ' = 0: ' + yv + ' = ' + num(m) + ' × 0 + ' + b + '.', 'So it starts at ' + B(b) + ' ' + yu + '.'],
        steps: [st(slope ? 'In ' + B(eq) + ', what number multiplies ' + xv + '?' : B(num(m) + ' × 0 + ' + b) + ' = ?', slope ? m : b)],
        traps: [tr(slope ? b : m, 'd_trend', slope ? 'That is the start value, when ' + xv + ' = 0. The change for each ' + x1 + ' is the slope.' : 'That is the change for each ' + x1 + '. The start is the value when ' + xv + ' = 0.'), tr(dec(m + b), 'd_trend', slope ? 'The change for each ' + x1 + ' is the number times ' + xv + '.' : 'At ' + xv + ' = 0 the ' + num(m) + xv + ' part is 0.')] };
    }
    const X = R.i(6, 30), Y = dec(m * X + b);
    return { text: intro + 'After how many ' + xm + ' does the trend line reach ' + B(num(Y) + ' ' + yu) + '?', ans: X, vis, unit: xm,
      how: [W(num(m) + xv + ' + ' + b + ' = ' + num(Y)), W(num(m) + xv + ' = ' + num(dec(Y - b)), 'take ' + b + ' from both sides'), W(xv + ' = ' + num(dec(Y - b)) + ' ÷ ' + num(m) + ' = ' + B(X))],
      steps: [st(B(num(Y) + ' ' + MINUS + ' ' + b) + ' = ?', dec(Y - b)), st(B(num(dec(Y - b)) + ' ÷ ' + num(m)) + ' = ?', X)],
      traps: [tr(isInt(Y / m * 1000) ? dec(Y / m) : null, 'x_twostep', 'Take away the start value, ' + b + ', before you divide.'), tr(dec(m * Y + b), 'd_trend', 'That puts ' + num(Y) + ' in for ' + xv + '. Solve for ' + xv + ' instead.'), tr(dec(Y - b), 'x_onestep', 'One more step: divide by ' + num(m) + '.')] };
  } },

{ id: 'd_twoway', s: 'data', g: 8, title: 'Two-way tables', pre: ['f_simplify'], cc: ['8.SP.A.4'],
  tip: 'A two-way table sorts people two ways at once; rows and columns add to totals. For "what fraction of 7th graders …", divide by the 7th-grade total, not by everyone.',
  gen(d, R) {
    const [rows, cols, noun] = R.pick([[[['7th grade', '7th graders'], ['8th grade', '8th graders']], [['Brings lunch', 'bring lunch'], ['Buys lunch', 'buy lunch']], 'students'],
      [[['Has a pet', 'students with a pet'], ['No pet', 'students with no pet']], [['Plays a sport', 'play a sport'], ['No sport', 'do not play a sport']], 'students'],
      [[['Kids', 'kids'], ['Adults', 'adults']], [['Chose the movie', 'chose the movie'], ['Chose the park', 'chose the park']], 'people'],
      [[['Morning class', 'students in the morning class'], ['Afternoon class', 'students in the afternoon class']], [['Passed', 'passed'], ['Did not pass', 'did not pass']], 'students']]);
    const c = [[R.i(4, 40), R.i(4, 40)], [R.i(4, 40), R.i(4, 40)]], rt0 = c.map(r => r[0] + r[1]), ct = [c[0][0] + c[1][0], c[0][1] + c[1][1]], N = rt0[0] + rt0[1];
    const full = (hide) => table([['', cols[0][0], cols[1][0], 'Total'], [rows[0][0], hide === '00' ? '?' : c[0][0], hide === '01' ? '?' : c[0][1], rt0[0]], [rows[1][0], hide === '10' ? '?' : c[1][0], hide === '11' ? '?' : c[1][1], rt0[1]], ['Total', ct[0], ct[1], N]]);
    if (d === 0) {
      const vis = table([['', cols[0][0], cols[1][0]], [rows[0][0], c[0][0], c[0][1]], [rows[1][0], c[1][0], c[1][1]]]);
      if (R.chance(.5)) { const j = R.i(0, 1);
        return { text: 'How many ' + noun + ' in all ' + cols[j][1] + '?', ans: ct[j], vis,
          how: ['Add down the "' + cols[j][0] + '" column: ' + c[0][j] + ' + ' + c[1][j] + ' = ' + B(ct[j]) + '.'],
          steps: [st(B(c[0][j] + ' + ' + c[1][j]) + ' = ?', ct[j])],
          traps: [tr(rt0[j], 'd_twoway', 'That adds across a row. Add down the "' + cols[j][0] + '" column.'), tr(c[0][j], 'd_twoway', 'That is only the ' + rows[0][1] + '. Add the ' + rows[1][1] + ' too.'), tr(N, 'd_twoway', 'That is everyone. Add only the "' + cols[j][0] + '" column.')] }; }
      const i = R.i(0, 1);
      return { text: 'How many ' + rows[i][1] + ' are there in all?', ans: rt0[i], vis,
        how: ['Add across the "' + rows[i][0] + '" row: ' + c[i][0] + ' + ' + c[i][1] + ' = ' + B(rt0[i]) + '.'],
        steps: [st(B(c[i][0] + ' + ' + c[i][1]) + ' = ?', rt0[i])],
        traps: [tr(ct[i], 'd_twoway', 'That adds down a column. Add across the "' + rows[i][0] + '" row.'), tr(c[i][0], 'd_twoway', 'Add both cells in the row.'), tr(N, 'd_twoway', 'That is everyone.')] };
    }
    if (d === 1) {
      const i = R.i(0, 1), j = R.i(0, 1), useRow = R.chance(.5), ans = c[i][j];
      return { text: 'One number is missing from the table. How many ' + rows[i][1] + ' ' + cols[j][1] + '?', ans, vis: full('' + i + j),
        how: useRow ? ['Use the "' + rows[i][0] + '" row: its total is ' + rt0[i] + '.', rt0[i] + ' ' + MINUS + ' ' + c[i][1 - j] + ' = ' + B(ans) + '.'] : ['Use the "' + cols[j][0] + '" column: its total is ' + ct[j] + '.', ct[j] + ' ' + MINUS + ' ' + c[1 - i][j] + ' = ' + B(ans) + '.'],
        steps: [useRow ? st(B(rt0[i] + ' ' + MINUS + ' ' + c[i][1 - j]) + ' = ?', ans) : st(B(ct[j] + ' ' + MINUS + ' ' + c[1 - i][j]) + ' = ?', ans)],
        traps: [tr(rt0[i] + c[i][1 - j], 'd_twoway', 'The total is the sum of the row, so take away the other cell.'), tr(N - rt0[i], 'd_twoway', 'That is the other row\'s total.'), tr(Math.abs(rt0[i] - ct[j]), 'd_twoway', 'Take the other cell from the total of the same row or column.')] };
    }
    const i = R.i(0, 1), j = R.i(0, 1), byRow = R.chance(.6), cell = c[i][j], tot = byRow ? rt0[i] : ct[j], F = Q(cell, tot), other = byRow ? ct[j] : rt0[i];
    const q = byRow ? 'What fraction of the ' + rows[i][1] + ' ' + cols[j][1] + '?' : 'Of the ' + noun + ' who ' + cols[j][1] + ', what fraction are ' + rows[i][1] + '?';
    return { text: q, ans: F, type: 'frac', vis: full(''),
      how: [W(byRow ? 'Only the "' + rows[i][0] + '" row counts: ' + tot + ' ' + rows[i][1] : 'Only the "' + cols[j][0] + '" column counts: ' + tot + ' ' + noun, 'that total goes on the bottom'), W(cell + ' of them ' + (byRow ? cols[j][1] : 'are ' + rows[i][1]), 'the top'), 'Fraction: ' + frac(cell, tot) + (F.d !== tot ? ' = ' + B(qs(F)) : '') + '.'],
      steps: [st('The question is about the ' + (byRow ? rows[i][1] : noun + ' who ' + cols[j][1]) + '. There are ' + tot + ' of them. What number goes on the bottom of the fraction?', tot), st(cell + ' of them ' + (byRow ? cols[j][1] : 'are ' + rows[i][1]) + '. What number goes on top of the fraction?', cell), st('Write ' + cell + ' out of ' + tot + ' as a fraction.', F, { type: 'frac' })],
      traps: [tr(other !== tot ? Q(cell, other) : null, 'd_twoway', byRow ? 'The question is about ' + rows[i][1] + ': divide by their total, ' + tot + '.' : 'The question is about those who ' + cols[j][1] + ': divide by that column\'s total, ' + tot + '.'), tr(Q(cell, N), 'd_twoway', 'Divide by the group asked about, not by everyone.'), tr(cell, 'd_prob', 'That is how many. Write it as a fraction of the group.')] };
  } },

{ id: 'w_timesbig', s: 'pow', g: 8, title: 'How many times bigger?', pre: [], cc: ['8.EE.A.3'],
  tip: 'Divide the front numbers, then take away the powers of 10. 6 × 10⁹ is how many times 3 × 10⁷? 6 ÷ 3 = 2 and 10⁹ ÷ 10⁷ = 10², so 2 × 100 = 200 times.',
  gen(d, R) {
    const P = k => Math.pow(10, k);
    if (d === 0) {
      const n = R.i(1, 6), k = R.i(1, 6), m = n + k, ans = P(k);
      return { text: B(pw(10, m)) + ' is how many times as big as ' + B(pw(10, n)) + '?', ans,
        how: [W(pw(10, m) + ' ÷ ' + pw(10, n) + ' = ' + pw(10, m + ' ' + MINUS + ' ' + n) + ' = ' + pw(10, k), 'dividing powers of 10: take away the powers'), pw(10, k) + ' is 1 with ' + k + ' ' + plural(k, 'zero') + ': ' + B(num(ans)) + ' times.'],
        steps: [st(B(m + ' ' + MINUS + ' ' + n) + ' = ?', k), st(B(pw(10, k)) + ' = ?', ans)],
        traps: [tr(k, 'w_exp', 'That is the power. ' + pw(10, k) + ' means 1 followed by ' + k + ' zeros.'), tr(isInt(m / n) && m / n !== k ? P(m / n) : null, 'w_rules', 'Dividing powers of 10: take away the powers, do not divide them.'), tr(P(k - 1), 'w_pow10', pw(10, k) + ' has ' + k + ' zeros.')] };
    }
    let a, b, q, m, n, k;
    if (d === 1) { b = R.i(1, 4); q = R.i(2, 9); a = b * q; if (a > 9) return null; n = R.i(2, 8); k = R.i(1, 6); m = n + k; }
    else { [a, b] = R.pick([[1, 2], [3, 2], [1, 4], [3, 4], [9, 2], [5, 2], [7, 2], [1, 5], [3, 5], [9, 4], [2, 5], [6, 4], [4, 8]]); q = a / b; n = R.i(2, 6); k = R.i(2, 6); m = n + k; }
    const ans = dec(q * P(k)), ctx = d === 2 ? R.pick([['A city has about ', ' people. A village has about ', ' people. About how many times as many people live in the city?'], ['The books in a library have about ', ' words in all. Each book has about ', ' words. About how many books are there?'], ['A big number is ', '. A smaller number is ', '. The big number is how many times as big as the smaller number?']]) : ['', ' is how many times as big as ', '?'];
    const A = a + ' × ' + pw(10, m), Bs = b + ' × ' + pw(10, n);
    return { text: ctx[0] + B(A) + ctx[1] + B(Bs) + ctx[2], ans,
      how: [W(a + ' ÷ ' + b + ' = ' + num(q), 'divide the front numbers'), W(pw(10, m) + ' ÷ ' + pw(10, n) + ' = ' + pw(10, k), 'take away the powers'), W(num(q) + ' × ' + num(P(k)) + ' = ' + B(num(ans)))],
      steps: [st(B(a + ' ÷ ' + b) + ' = ?', q), st(B(pw(10, m) + ' ÷ ' + pw(10, n)) + ' = 10 to the power ?', k), st(B(num(q) + ' × ' + num(P(k))) + ' = ?', ans)],
      traps: [tr(P(k), 'w_timesbig', 'Divide the front numbers too: ' + a + ' ÷ ' + b + '.'), tr(a > b ? (a - b) * P(k) : null, 'w_timesbig', 'Divide the front numbers; do not take one from the other.'), tr(dec(q * P(k - 1)), 'f_decx10', 'Check the zeros: ' + num(q) + ' × ' + num(P(k)) + '.'), tr(dec(q * k), 'w_exp', pw(10, k) + ' is ' + num(P(k)) + ', not ' + k + '.')] };
  } },

{ id: 'g_dilate', s: 'meas', g: 8, title: 'Stretch from the origin', pre: ['x_coord4'], cc: ['8.G.A.3'],
  tip: 'A dilation from the origin by a scale factor k multiplies both coordinates by k. A(4, −6) by ½ goes to (2, −3); by 3 it goes to (12, −18). k more than 1 stretches; between 0 and 1 shrinks.',
  gen(d, R) {
    const pt = (x, y) => '(' + num(x) + ', ' + num(y) + ')', askX = R.chance(.5), w = askX ? 'x' : 'y';
    if (d < 2) {
      const k = d === 0 ? Q(R.i(2, 4)) : R.pick([Q(1, 2), Q(1, 3), Q(1, 4), Q(3, 2), Q(2, 3)]);
      const x = (d === 0 ? R.i(1, 5) : nz(R, -4, 4) * k.d), y = (d === 0 ? R.i(1, 5) : nz(R, -4, 4) * k.d), X = x * qv(k), Y = y * qv(k), ans = askX ? X : Y, o = askX ? x : y, ks = qs(k);
      if (d === 1 && x > 0 && y > 0) return null;
      return { text: 'Point ' + B('A' + pt(x, y)) + ' is dilated from the origin by a scale factor of ' + B(ks) + '. What is the ' + B(w) + '-coordinate of the new point A′?', ans,
        vis: Math.abs(x) <= 6 && Math.abs(y) <= 6 ? plotSVG([{ x, y, t: 'A' }], { r: 6 }) : '',
        how: [W('(x, y) → (' + ks + 'x, ' + ks + 'y)', 'multiply both coordinates by ' + ks), W('A' + pt(x, y) + ' → A′' + pt(X, Y)), 'The new ' + w + ' is ' + B(num(ans)) + '.'],
        steps: [st(B(ks + ' × ' + pn(o)) + ' = ?', ans)],
        traps: [tr(k.d === 1 ? o + k.n : null, 'g_transform', 'A dilation multiplies; adding slides the point.'), tr(k.d === 1 ? (isInt(o / k.n * 1000) ? o / k.n : null) : o * k.d / k.n, 'g_dilate', 'Multiply by the scale factor ' + ks + '; do not divide by it.'), tr(askX ? Y : X, 'x_coord', 'That is the ' + (askX ? 'y' : 'x') + '-coordinate. (x, y): x comes first.'), tr(-ans, 'n_intmul', 'A positive scale factor keeps the sign of each coordinate.')] };
    }
    const kind = R.pick(['back', 'factor', 'then']);
    if (kind === 'back') {
      const k = R.i(2, 5), x = nz(R, -6, 6), y = nz(R, -6, 6), X = k * x, Y = k * y, ans = askX ? x : y, o = askX ? X : Y;
      return { text: 'Point A is dilated from the origin by a scale factor of ' + B(k) + '. The new point is ' + B('A′' + pt(X, Y)) + '. What is the ' + B(w) + '-coordinate of A?', ans,
        how: [W('A′ = (' + k + 'x, ' + k + 'y)', 'the dilation multiplied by ' + k), W('so A = ' + pt(X, Y) + ' ÷ ' + k + ' = ' + pt(x, y), 'undo it: divide by ' + k), 'The ' + w + '-coordinate of A is ' + B(num(ans)) + '.'],
        steps: [st(B(num(o) + ' ÷ ' + k) + ' = ?', ans)],
        traps: [tr(o * k, 'g_dilate', 'A′ is the stretched point. To go back to A, divide by ' + k + '.'), tr(o - k, 'g_transform', 'A dilation multiplies, so undo it by dividing.')] };
    }
    if (kind === 'factor') {
      const k = R.pick([Q(2), Q(3), Q(1, 2), Q(1, 3), Q(3, 2), Q(5, 2), Q(2, 3)]), x = nz(R, -4, 4) * k.d * (R.chance(.5) ? 1 : 2), y = nz(R, -4, 4) * k.d, X = x * qv(k), Y = y * qv(k);
      return { text: 'Point ' + B('A' + pt(x, y)) + ' is dilated from the origin to ' + B('A′' + pt(X, Y)) + '. What is the scale factor?', ans: k, type: 'frac',
        how: [W('scale factor = new ÷ old for either coordinate'), W(num(X) + ' ÷ ' + pn(x) + ' = ' + qm(k) + ' (check: ' + num(Y) + ' ÷ ' + pn(y) + ' = ' + qm(k) + ')'), 'The scale factor is ' + B(qm(k)) + '.'],
        steps: [st(B(num(X) + ' ÷ ' + pn(x)) + ' = ?', k, { type: 'frac' })],
        traps: [tr(X - x, 'g_transform', 'A dilation multiplies, so compare by dividing, not taking away.'), tr(Q(x, X), 'g_dilate', 'Divide the new coordinate by the old one.')] };
    }
    const k = R.i(2, 4), x = nz(R, -5, 5), y = nz(R, -5, 5), hx = nz(R, -6, 6), hy = nz(R, -6, 6), X = k * x + hx, Y = k * y + hy, ans = askX ? X : Y, o = askX ? x : y, h = askX ? hx : hy;
    const slide = (hx > 0 ? hx + ' right' : -hx + ' left') + ' and ' + (hy > 0 ? hy + ' up' : -hy + ' down');
    return { text: 'Point ' + B('A' + pt(x, y)) + ' is dilated from the origin by a scale factor of ' + B(k) + '. Then the new point is slid ' + B(slide) + '. What is the ' + B(w) + '-coordinate of the final point?', ans,
      how: [W('dilate: ' + pt(x, y) + ' → ' + pt(k * x, k * y), 'multiply by ' + k), W('slide: ' + pt(k * x, k * y) + ' → ' + pt(X, Y), 'add ' + num(hx) + ' to x and ' + num(hy) + ' to y'), 'The ' + w + '-coordinate is ' + B(num(ans)) + '.'],
      steps: [st('Point A has ' + w + ' = ' + num(o) + '. The dilation multiplies it by ' + k + '. What is ' + w + ' now?', k * o), st('After the dilation, ' + w + ' = ' + num(k * o) + '. The slide ' + (h > 0 ? 'adds ' + h : 'takes away ' + -h) + '. What is ' + w + ' now?', ans)],
      traps: [tr(k * (o + h), 'g_transform', 'Do the moves in order: dilate first, then slide.'), tr(k * o, 'g_transform', 'Do not forget the slide.'), tr(o + h, 'g_dilate', 'Dilate first: multiply by ' + k + '.')] };
  } },

{ id: 'g_transversal', s: 'meas', g: 8, title: 'Parallel lines and a transversal', pre: [], cc: ['8.G.A.5'],
  tip: 'A line crossing two parallel lines makes only two sizes of angle, and they add to 180°. Corresponding, alternate interior and vertical angles are equal; same-side interior angles add to 180°.',
  gen(d, R) {
    const th = R.pick([40, 45, 50, 55, 60, 65, 70, 75, 80, 100, 105, 110, 115, 120, 125, 130, 135, 140]), val = pos => (pos === 'tr' || pos === 'bl' ? th : 180 - th);
    const PAIRS0 = [['corresponding', 'P_tr', 'Q_tr'], ['corresponding', 'P_tl', 'Q_tl'], ['corresponding', 'P_bl', 'Q_bl'], ['corresponding', 'P_br', 'Q_br'], ['vertical', 'P_tr', 'P_bl'], ['vertical', 'Q_tl', 'Q_br'], ['vertical', 'P_tl', 'P_br'], ['linear pair', 'P_tr', 'P_tl'], ['linear pair', 'Q_bl', 'Q_br']];
    const PAIRS1 = [['alternate interior', 'P_bl', 'Q_tr'], ['alternate interior', 'P_br', 'Q_tl'], ['alternate exterior', 'P_tl', 'Q_br'], ['alternate exterior', 'P_tr', 'Q_bl'], ['same-side interior', 'P_bl', 'Q_tl'], ['same-side interior', 'P_br', 'Q_tr'], ['corresponding', 'P_br', 'Q_br']];
    let [name, k1, k2] = R.pick(d === 0 ? PAIRS0 : PAIRS1); if (R.chance(.5)) [k1, k2] = [k2, k1];
    const v1 = val(k1.split('_')[1]), v2 = val(k2.split('_')[1]), eq = v1 === v2;
    const rule = eq ? ', so they are equal' : ', so they add to 180°', nm = name === 'linear pair' ? 'a linear pair (side by side on a straight line)' : name + ' angles';
    if (d < 2) {
      const marks = {}; marks[k1] = v1 + DEG; marks[k2] = '?';
      return { text: 'The two lines with arrows are parallel. What is the size of the angle with the question mark?', ans: v2, unit: DEG, vis: transversalSVG(th, marks),
        how: ['The marked angles are ' + nm + rule + '.', eq ? 'So ? = ' + B(v2) + DEG + '.' : '? = 180' + DEG + ' ' + MINUS + ' ' + v1 + DEG + ' = ' + B(v2) + DEG + '.'],
        steps: [st('The marked angles are ' + nm + '. Are they equal, or do they add to 180°? Type 1 for equal or 2 for 180°.', eq ? 1 : 2), st('One angle is ' + v1 + DEG + (eq ? '. The other angle is equal to it.' : '. The two angles add to 180°.') + ' What is the other angle?', v2, { unit: DEG })],
        traps: [tr(eq ? 180 - v1 : v1, eq ? 'g_pairs' : 'g_transversal', eq ? 'These are ' + nm + ', which are equal; they do not add to 180°.' : 'These are ' + nm + ', which add to 180°; they are not equal.'), tr(v1 < 90 ? 90 - v1 : null, 'g_pairs', 'Complementary angles (adding to 90°) do not come up here. Straight lines make 180°.')] };
    }
    const x = R.i(5, 30), a = R.i(2, 6), b = v1 - a * x; let c, e;
    if (eq) { c = R.i(1, 7); if (c === a) return null; e = v2 - c * x; } else { c = R.i(1, 6); e = v2 - c * x; }
    const ex1 = '(' + a + 'x ' + signed(b) + ')' + DEG, ex2 = '(' + (c === 1 ? '' : c) + 'x ' + signed(e) + ')' + DEG, marks = {}; marks[k1] = ex1; marks[k2] = ex2;
    if (Math.abs(b) > 99 || Math.abs(e) > 99 || b === 0 || e === 0) return null;
    const askX = R.chance(.5), lhs = eq ? poly([a - c, 0]) + ' = ' + num(e - b) : poly([a + c, b + e]) + ' = 180';
    const how = [W(eq ? a + 'x ' + signed(b) + ' = ' + (c === 1 ? '' : c) + 'x ' + signed(e) : a + 'x ' + signed(b) + ' + ' + (c === 1 ? '' : c) + 'x ' + signed(e) + ' = 180', 'they are ' + nm + rule.replace(', so they ', ', which ')),
      W(lhs, eq ? 'x-terms to one side, numbers to the other' : 'collect like terms'), W('x = ' + (askX ? B(x) : x))];
    if (!askX) how.push(W('angle = ' + a + ' × ' + x + ' ' + signed(b) + ' = ' + B(v1) + DEG, 'put x back in'));
    const wrongX = eq ? (180 - b - e) / (a + c) : (e - b) / (a - c);
    return { text: 'The two lines with arrows are parallel. ' + (askX ? 'What is ' + B('x') + '?' : 'What is the size of the angle marked ' + B(ex1) + '?'), ans: askX ? x : v1, unit: askX ? '' : DEG, vis: transversalSVG(th, marks),
      how, steps: [st('The marked angles are ' + nm + '. Are they equal, or do they add to 180°? Type 1 for equal or 2 for 180°.', eq ? 1 : 2), st('Solve ' + B(eq ? a + 'x ' + signed(b) + ' = ' + (c === 1 ? '' : c) + 'x ' + signed(e) : a + 'x ' + signed(b) + ' + ' + (c === 1 ? '' : c) + 'x ' + signed(e) + ' = 180') + '. x = ?', x)].concat(askX ? [] : [st('The angle: ' + B(a + ' × ' + x + ' ' + signed(b)) + ' = ?', v1, { unit: DEG })]),
      traps: [tr(isInt(wrongX) && wrongX > 0 ? (askX ? wrongX : a * wrongX + b) : null, 'g_transversal', eq ? 'These are ' + nm + ', which are equal; they do not add to 180°.' : 'These are ' + nm + ', which add to 180°; they are not equal.'), tr(askX ? null : x, 'g_transversal', 'That is x. Put it back in to find the angle.'), tr(askX ? null : v2, 'g_transversal', 'That is the other angle. The question asks for ' + ex1 + '.')] };
  } },

{ id: 'g_extangle', s: 'meas', g: 8, title: 'Outside angle of a triangle', pre: [], cc: ['8.G.A.5'],
  tip: 'Stretch one side of a triangle: the outside angle equals the two inside angles that are not next to it. Inside angles 50° and 60° make an outside angle of 110°.',
  gen(d, R) {
    const A = R.i(6, 16) * 5, Bv = R.i(7, 17) * 5, Cv = 180 - A - Bv, E = A + Cv;
    if (Cv < 25 || Bv > 85) return null;
    if (d === 0) return { text: 'One side of the triangle is stretched out. What is the size of the outside angle with the question mark?', ans: E, unit: DEG, vis: triExtSVG(A, Bv, { a: A + DEG, c: Cv + DEG, ext: '?' }),
      how: ['The outside angle equals the two inside angles that are not next to it.', A + DEG + ' + ' + Cv + DEG + ' = ' + B(E) + DEG + '.'],
      steps: [st(B(A + ' + ' + Cv) + ' = ?', E, { unit: DEG })],
      traps: [tr(Bv, 'g_triangle', 'That is the inside angle next to it. The outside angle is the sum of the two far inside angles.'), tr(180 - A, 'g_extangle', 'Use both far inside angles: ' + A + DEG + ' and ' + Cv + DEG + '.'), tr(360 - E, 'g_angles', 'The outside angle and the angle next to it make a straight line, 180°.')] };
    if (d === 1) {
      const askC = R.chance(.5), giv = askC ? A : Cv, ans = askC ? Cv : A;
      return { text: 'One side of the triangle is stretched out. The outside angle is ' + B(E + DEG) + '. What is the size of the inside angle with the question mark?', ans, unit: DEG, vis: triExtSVG(A, Bv, { a: askC ? A + DEG : '?', c: askC ? '?' : Cv + DEG, ext: E + DEG }),
        how: [W(giv + DEG + ' + ? = ' + E + DEG, 'outside angle = the two far inside angles'), W('? = ' + E + DEG + ' ' + MINUS + ' ' + giv + DEG + ' = ' + B(ans) + DEG)],
        steps: [st(B(E + ' ' + MINUS + ' ' + giv) + ' = ?', ans, { unit: DEG })],
        traps: [tr(180 - E, 'g_triangle', 'That is the inside angle next to the outside angle. The marked angle is a far one.'), tr(E + giv, 'g_extangle', 'The two far inside angles add up to the outside angle, so take away.'), tr(180 - giv, 'g_extangle', 'Use the outside angle: ' + E + DEG + ' ' + MINUS + ' ' + giv + DEG + '.')] };
    }
    const x = R.i(5, 25), a = R.i(1, 4), b = A - a * x, c = R.i(1, 4), e = Cv - c * x;
    if (Math.abs(b) > 60 || Math.abs(e) > 60 || b === 0 || e === 0) return null;
    const exA = '(' + (a === 1 ? '' : a) + 'x ' + signed(b) + ')' + DEG, exC = '(' + (c === 1 ? '' : c) + 'x ' + signed(e) + ')' + DEG, askX = R.chance(.5);
    const how = [W((a === 1 ? '' : a) + 'x ' + signed(b) + ' + ' + (c === 1 ? '' : c) + 'x ' + signed(e) + ' = ' + E, 'outside angle = the two far inside angles'), W(poly([a + c, b + e]) + ' = ' + E, 'collect like terms'), W((a + c) + 'x = ' + (E - b - e)), W('x = ' + (askX ? B(x) : x))];
    if (!askX) how.push(W('angle = ' + (a === 1 ? '' : a + ' × ') + x + ' ' + signed(b) + ' = ' + B(A) + DEG, 'put x back in'));
    const wrong = (180 - b - e) / (a + c);
    return { text: 'One side of the triangle is stretched out. The outside angle is ' + B(E + DEG) + '. ' + (askX ? 'What is ' + B('x') + '?' : 'What is the size of the angle marked ' + B(exA) + '?'), ans: askX ? x : A, unit: askX ? '' : DEG, vis: triExtSVG(A, Bv, { a: exA, c: exC, ext: E + DEG }),
      how: how.slice(0, 2).concat(how.slice(2)), steps: [st('Collect like terms in ' + B((a === 1 ? '' : a) + 'x ' + signed(b) + ' + ' + (c === 1 ? '' : c) + 'x ' + signed(e) + ' = ' + E) + '. You get ' + B('?x' + (b + e ? ' ' + signed(b + e) : '') + ' = ' + E) + '. What goes in front of x?', a + c), st(B(poly([a + c, b + e]) + ' = ' + E) + '. x = ?', x)].concat(askX ? [] : [st('Put x = ' + x + ' into ' + B(exA) + '. What is the angle?', A, { unit: DEG })]),
      traps: [tr(isInt(wrong) && wrong > 0 ? (askX ? wrong : a * wrong + b) : null, 'g_triangle', 'The two far inside angles add to the outside angle, ' + E + DEG + ', not to 180' + DEG + '.'), tr(askX ? null : x, 'g_extangle', 'That is x. Put it back in to find the angle.'), tr(askX ? null : Cv, 'g_extangle', 'That is the other far angle. The question asks for ' + exA + '.')] };
  } },

{ id: 'r_3d', s: 'trig', g: 8, title: 'Pythagoras in a box', pre: ['g_volume'], paper: true, cc: ['8.G.B.7'],
  tip: 'The long diagonal of a box is the long side of a right triangle whose short sides are the floor diagonal and the height. 3 by 4 by 12: floor diagonal 5 (3² + 4² = 25), then 5² + 12² = 169, so 13.',
  gen(d, R) {
    const U = R.pick(['cm', 'm', 'in']), sq = v => pw(v, 2);
    if (d === 0) {
      const bx = R.pick(BOX3.filter(b => b.f && b.D <= 30)), f = bx.f, h = bx.h, D = bx.D;
      return { text: 'The diagonal across the floor of a box is ' + B(f + ' ' + U) + '. The box is ' + B(h + ' ' + U) + ' tall. How long is the long diagonal, from a bottom corner to the opposite top corner?', ans: D, unit: U, vis: boxSVG('', '', h + ' ' + U, { diag: true }),
        how: [W('D² = ' + sq(f) + ' + ' + sq(h), 'the floor diagonal, the height and D make a right triangle'), W('D² = ' + f * f + ' + ' + h * h + ' = ' + D * D), W('D = ' + rt(D * D) + ' = ' + B(D) + ' ' + U)],
        steps: [st(B(sq(f) + ' + ' + sq(h)) + ' = ?', D * D), st(B(rt(D * D)) + ' = ?', D)],
        traps: [tr(f + h, 'r_pyth', 'Square the sides first, add, then take the square root.'), tr(D * D, 'w_roots', 'That is D². Take the square root.'), tr(isInt(Math.sqrt(Math.abs(h * h - f * f))) ? Math.sqrt(Math.abs(h * h - f * f)) : null, 'r_leg', 'D is the longest side, so add the squares.')] };
    }
    if (d === 1) {
      const bx = R.pick(BOX3.filter(b => b.f && b.D <= 50)), [l, w] = R.shuffle([bx.l, bx.w]), h = bx.h, f = bx.f, D = bx.D;
      return { text: 'A box has a floor ' + B(l + ' ' + U) + ' by ' + B(w + ' ' + U) + '. The box is ' + B(h + ' ' + U) + ' tall. How long is its long diagonal, from a bottom corner to the opposite top corner?', ans: D, unit: U, vis: boxSVG(l + ' ' + U, w + ' ' + U, h + ' ' + U, { diag: true }),
        how: [W('floor: ' + sq(l) + ' + ' + sq(w) + ' = ' + l * l + ' + ' + w * w + ' = ' + f * f + ', so the floor diagonal is ' + f, 'first right triangle, on the floor'), W('D² = ' + sq(f) + ' + ' + sq(h) + ' = ' + f * f + ' + ' + h * h + ' = ' + D * D, 'second right triangle, standing up'), W('D = ' + rt(D * D) + ' = ' + B(D) + ' ' + U)],
        steps: [st('Floor diagonal: ' + B(rt(sq(l) + ' + ' + sq(w))) + ' = ?', f), st(B(sq(f) + ' + ' + sq(h)) + ' = ?', D * D), st(B(rt(D * D)) + ' = ?', D)],
        traps: [tr(l + w + h, 'r_pyth', 'Square the sides, add, then take the square root.'), tr(f, 'r_3d', 'That is the floor diagonal. One more right triangle, with the height.'), tr(D * D, 'w_roots', 'That is D². Take the square root.')] };
    }
    const bx = R.pick(BOX3.filter(b => b.D <= 40)), [l, w] = R.shuffle([bx.l, bx.w]), h = bx.h, D = bx.D, f2 = bx.f2;
    if (R.chance(.5)) return { text: 'A box has a floor ' + B(l + ' ' + U) + ' by ' + B(w + ' ' + U) + '. The box is ' + B(h + ' ' + U) + ' tall. How long is its long diagonal?', ans: D, unit: U, vis: boxSVG(l + ' ' + U, w + ' ' + U, h + ' ' + U, { diag: true }),
      how: [W('floor diagonal² = ' + sq(l) + ' + ' + sq(w) + ' = ' + f2, bx.f ? 'the floor diagonal is ' + bx.f : 'keep it squared; no need to find its root'), W('D² = ' + f2 + ' + ' + sq(h) + ' = ' + f2 + ' + ' + h * h + ' = ' + D * D), W('D = ' + rt(D * D) + ' = ' + B(D) + ' ' + U, 'in one go: D² = ' + sq(l) + ' + ' + sq(w) + ' + ' + sq(h))],
      steps: [st('Floor diagonal squared: ' + B(sq(l) + ' + ' + sq(w)) + ' = ?', f2), st(B(f2 + ' + ' + sq(h)) + ' = ?', D * D), st(B(rt(D * D)) + ' = ?', D)],
      traps: [tr(l + w + h, 'r_pyth', 'Square the sides, add, then take the square root.'), tr(D * D, 'w_roots', 'That is D². Take the square root.'), tr(isInt(Math.sqrt(l * l + h * h)) ? Math.sqrt(l * l + h * h) : null, 'r_3d', 'Use all three edges: D² = ' + sq(l) + ' + ' + sq(w) + ' + ' + sq(h) + '.')] };
    return { text: 'A box has a floor ' + B(l + ' ' + U) + ' by ' + B(w + ' ' + U) + '. Its long diagonal is ' + B(D + ' ' + U) + '. How tall is the box?', ans: h, unit: U, vis: boxSVG(l + ' ' + U, w + ' ' + U, '?', { diag: true }),
      how: [W('floor diagonal² = ' + sq(l) + ' + ' + sq(w) + ' = ' + f2), W('h² = ' + sq(D) + ' ' + MINUS + ' ' + f2 + ' = ' + D * D + ' ' + MINUS + ' ' + f2 + ' = ' + h * h, 'D is the longest side, so take away'), W('h = ' + rt(h * h) + ' = ' + B(h) + ' ' + U)],
      steps: [st('Floor diagonal squared: ' + B(sq(l) + ' + ' + sq(w)) + ' = ?', f2), st(B(D * D + ' ' + MINUS + ' ' + f2) + ' = ?', h * h), st(B(rt(h * h)) + ' = ?', h)],
      traps: [tr(D - l - w > 0 ? D - l - w : null, 'r_leg', 'Work with the squares: h² = D² ' + MINUS + ' ' + sq(l) + ' ' + MINUS + ' ' + sq(w) + '.'), tr(h * h, 'w_roots', 'That is h². Take the square root.'), tr(isInt(Math.sqrt(D * D + f2)) ? Math.sqrt(D * D + f2) : null, 'r_leg', 'D is the longest side, so subtract the squares.')] };
  } },

{ id: 'g_ballvol', s: 'meas', g: 8, title: 'Volume of a sphere', pre: ['w_exp'], paper: true, cc: ['8.G.C.9'],
  tip: 'V = 4/3 × π × r³. Cube the radius first, then times 4/3. Radius 3: 3³ = 27, and 4/3 × 27 = 36, so V = 36π.',
  gen(d, R) {
    const U = R.pick(['cm', 'm', 'in']), U3 = U + '³', c3 = r => r * r * r;
    const fwd = (r, half, diam) => {
      const k = Q((half ? 2 : 4) * c3(r), 3), r3 = c3(r), kText = qm(k);
      const how = [];
      if (diam) how.push(W('r = ' + 2 * r + ' ÷ 2 = ' + r, 'the radius is half the diameter'));
      how.push(W('V = ' + (half ? '½ × ' : '') + frac(4, 3) + 'π' + pw('r', 3), half ? 'half of a whole ball' : ''), W(pw('r', 3) + ' = ' + r + ' × ' + r + ' × ' + r + ' = ' + r3), W('V = ' + (half ? frac(2, 3) : frac(4, 3)) + ' × ' + r3 + 'π = ' + kText + 'π, so k = ' + B(kText)));
      return { text: (half ? 'A solid half-ball (hemisphere)' : 'A ball') + ' has ' + (diam ? 'a diameter of ' + B(2 * r + ' ' + U) : 'a radius of ' + B(r + ' ' + U)) + '. Its volume is ' + B('kπ ' + U3) + '. What is k?', ans: k, type: 'frac',
        how, steps: (diam ? [st('The diameter is ' + 2 * r + ' ' + U + '. What is the radius?', r)] : []).concat([st(B(pw(r, 3)) + ' = ?', r3), st(B((half ? frac(2, 3) : frac(4, 3)) + ' × ' + r3) + ' = ?', k, { type: 'frac' })]),
        traps: [tr(Q((half ? 2 : 4) * r * r, 3), 'w_exp', pw('r', 3) + ' means r × r × r, not r × r.'), tr(Q(r3, 1), 'g_ballvol', 'Multiply ' + pw('r', 3) + ' by ' + frac(4, 3) + '.'), tr(Q(4 * r * r, 1), 'g_ballvol', '4' + pw('r', 2) + ' is the surface area. Volume uses ' + frac(4, 3) + pw('r', 3) + '.'), tr(diam ? Q((half ? 2 : 4) * c3(2 * r), 3) : null, 'g_circle', 'The radius is half the diameter.'), tr(half ? Q(4 * r3, 3) : null, 'g_ballvol', 'A hemisphere is half a ball: halve the volume.')] };
    };
    if (d === 0) return fwd(R.i(1, 6), false, false);
    if (d === 1) return fwd(R.i(1, 7), false, R.chance(.5));
    if (R.chance(.5)) return fwd(R.i(1, 6), true, false);
    const r = R.i(1, 6), k = Q(4 * c3(r), 3), kText = qm(k);
    return { text: 'A ball has a volume of ' + B(kText + 'π ' + U3) + '. What is its radius?', ans: r, unit: U,
      how: [W(frac(4, 3) + 'π' + pw('r', 3) + ' = ' + kText + 'π'), W(pw('r', 3) + ' = ' + kText + ' × ' + frac(3, 4) + ' = ' + c3(r), 'undo the × ' + frac(4, 3) + ': multiply by ' + frac(3, 4)), W('r = ' + rt(c3(r), 3) + ' = ' + B(r) + ' ' + U, r + ' × ' + r + ' × ' + r + ' = ' + c3(r))],
      steps: [st(B(kText + ' × ' + frac(3, 4)) + ' = ?', c3(r)), st('What number cubed is ' + c3(r) + '?', r)],
      traps: [tr(c3(r), 'w_roots', 'That is ' + pw('r', 3) + '. Find the number that cubes to it.'), tr(isInt(Math.sqrt(c3(r))) && r > 1 ? Math.sqrt(c3(r)) : null, 'w_roots', 'Cube root, not square root: r × r × r = ' + c3(r) + '.'), tr(isInt(qv(k) * 1000) ? dec(qv(k) / 3) : null, 'g_ballvol', 'Undo the ' + frac(4, 3) + ' by multiplying by ' + frac(3, 4) + ', then take the cube root.')] };
  } },

];
/* drop empty traps, repeated values (in any form) and values nobody would type, before the game sees them */
DEFS.forEach(c => {
  const g = c.gen;
  c.gen = (d, R) => {
    const p = g(d, R); if (!p || !p.traps) return p;
    const seen = new Set();
    p.traps = p.traps.filter(t => {
      if (!t || t.v == null) return false;
      const obj = typeof t.v === 'object', val = obj ? t.v.n / t.v.d : t.v;
      if (typeof val !== 'number' || !isFinite(val)) return false;
      if (obj && !(Number.isInteger(t.v.n) && Number.isInteger(t.v.d) && t.v.d > 0)) return false;
      if (!obj && !isInt(val * 1000)) return false;
      if (p.type === 'money' && (!Number.isInteger(val) || val < 0)) return false;
      if ((p.type === 'num' || p.type === 'money') && obj) return false;
      const k = val.toFixed(8); if (seen.has(k)) return false; seen.add(k); return true;
    });
    return p;
  };
});
C.defs(DEFS);
})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
