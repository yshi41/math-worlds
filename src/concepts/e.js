/* Word Problems (2nd to 9th grade), the written methods (column adding and taking away, the area model, standard
   multiplication, long division, find and fix the mistake), and the gap concepts an expert review found (fractions on
   a number line, mixed numbers, decimal division, rulers, surface area, grid moves, circle angles, picture graphs,
   quartiles, coordinates, midpoints, synthetic division).
   Paper concepts (paper: true) write their how lines as a model written solution, one line per line of written work,
   so a kid can compare their paper line by line. Their steps follow the same lines. */
(function (C) {
'use strict';
const { B, num, MINUS, frac, mixed, gcd, lcm, reduce, plural, sum, NAMES, fmtD, DEG, poly, par2,
  stackHTML, groupsSVG, numLineSVG, table } = C;

/* ---------- small helpers ---------- */
const tr = (v, c, why) => ({ v, c, why });
const st = (text, ans, o) => Object.assign({ text, ans }, o || {});
const F = (n, d) => ({ n, d });
const nm = num;
const mi = (a, b) => nm(a) + ' ' + MINUS + ' ' + nm(b);           /* "45 − 18" */
const pl = (a, b) => nm(a) + ' + ' + nm(b);
const people = R => R.shuffle(NAMES).slice(0, 3);
const P10 = k => Math.pow(10, k);
const digs = v => String(v).split('').reverse().map(Number);        /* ones digit first */
const PV = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions'];
const PV1 = ['one', 'ten', 'hundred', 'thousand', 'ten thousand', 'hundred thousand', 'million'];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const fm = (n, d) => { const [a, b] = reduce(n, d); return b === 1 ? nm(a) : a > b ? mixed(Math.floor(a / b), a % b, b) : frac(a, b); };
const fr = (n, d) => frac(n, d);
const fq = (t, b) => '<span class="fr"><span class="fr-n">' + t + '</span><span class="fr-d">' + b + '</span></span>'; /* a fraction with a ? in it */
const money = (c, o) => Object.assign({ type: 'money', fmt: 'd', ans: c }, o || {});
/* a times fact's own concept, for fact slips */
function factC(a, b) {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  if (lo <= 1) return 'm_turn';
  if (lo === hi && lo >= 6 && lo <= 8) return 'm_squares';
  if ([2, 5, 10].includes(lo) || [2, 5, 10].includes(hi)) return 'm_x2510';
  if (lo === 9 || hi === 9) return 'm_x9';
  if (hi > 10) return 'm_breakapart';
  if ([4, 8].includes(lo) || [4, 8].includes(hi)) return 'm_x4x8';
  if ([3, 6].includes(lo) || [3, 6].includes(hi)) return 'm_x3x6';
  return 'm_x7';
}
/* forgot to carry: each column keeps only its ones digit */
function noCarry(a, b) { if (a == null) return null; const x = digs(a), y = digs(b); let r = 0; for (let i = 0; i < Math.max(x.length, y.length); i++) r += ((x[i] || 0) + (y[i] || 0)) % 10 * P10(i); return r || null; }
/* took the smaller digit from the bigger one in every column */
function noBorrow(a, b) { const x = digs(a), y = digs(b); let r = 0; for (let i = 0; i < x.length; i++) r += Math.abs(x[i] - (y[i] || 0)) * P10(i); return r; }

/* column adding, column by column: {i, c (carry in), ds (digits), s (column sum)} */
function addCols(nums) {
  const L = Math.max(...nums.map(v => String(v).length)), cols = []; let c = 0;
  for (let i = 0; i < L; i++) { const ds = nums.map(v => digs(v)[i]).filter(x => x !== undefined), s = c + sum(ds); cols.push({ i, c, ds, s }); c = Math.floor(s / 10); }
  return cols;
}
function addLine(col, last) {
  const e = (col.c ? col.c + ' + ' : '') + col.ds.join(' + ') + ' = ' + col.s;
  return cap(PV[col.i]) + ': ' + e + '. ' + (last || col.s < 10 ? 'Write ' + col.s + '.' : 'Write ' + (col.s % 10) + ', carry ' + Math.floor(col.s / 10) + ' to the ' + PV[col.i + 1] + '.');
}
const carryRow = cols => cols.slice().reverse().map(c => c.c ? String(c.c) : ' ');
/* column taking away with borrowing (across zeros too): {i, orig, before, top, bd, d, j (borrowed from, or -1)} */
function subCols(a, b) {
  const t = digs(a), bb = digs(b), top = t.slice(), cols = [];
  for (let i = 0; i < t.length; i++) {
    const bd = bb[i] || 0, before = top[i]; let j = -1;
    if (top[i] < bd) { j = i + 1; while (top[j] === 0) j++; top[j]--; for (let k = i + 1; k < j; k++) top[k] = 9; top[i] += 10; }
    cols.push({ i, orig: t[i], before, top: top[i], bd, d: top[i] - bd, j, has: i < bb.length });
  }
  return cols;
}
function subLine(col, cols, a) {
  const t = digs(a), nameI = cap(PV[col.i]);
  if (col.j < 0) {
    const was = col.before !== col.orig ? 'the ' + col.orig + ' is now ' + col.before + '. ' : '';
    if (!col.has) return nameI + ': ' + was + (was ? 'Nothing' : 'nothing') + ' to take away, write ' + col.before + '.';
    return nameI + ': ' + was + mi(col.top, col.bd) + ' = ' + col.d + '.';
  }
  if (col.j === col.i + 1) return nameI + ': ' + col.before + ' is less than ' + col.bd + ', so trade 1 ' + PV1[col.j] + ' for 10 ' + PV[col.i] + ' (' + pvn(t[col.j], col.j) + (t[col.j] === 1 ? ' becomes ' : ' become ') + (t[col.j] - 1) + '). ' + mi(col.top, col.bd) + ' = ' + col.d + '.';
  return nameI + ': ' + col.before + ' is less than ' + col.bd + ' and the ' + PV[col.i + 1] + ' digit is 0, so trade 1 ' + PV1[col.j] + ': ' + t[col.j] + ' ' + PV[col.j] + ' become ' + (t[col.j] - 1) + ', each 0 between becomes 9, and the ' + PV[col.i] + ' become ' + col.top + '. ' + mi(col.top, col.bd) + ' = ' + col.d + '.';
}
const nBorrows = cols => cols.filter(c => c.j >= 0).length;

/* ---------- pictures ---------- */
/* columns written the way they go on paper: rows [{s, op, line}] right-aligned; line underlines the row */
function colsHTML(rows) {
  const w = Math.max(...rows.map(r => String(r.s).length)) + 1;
  return '<table class="stack" aria-hidden="true">' + rows.map(r => {
    const s = String(r.s), pad = w - s.length; let h = '';
    for (let i = 0; i < w; i++) { const ch = i < pad ? (i === 0 && r.op ? r.op : '') : s[i - pad]; h += '<td' + (i === 0 && r.op ? ' class="sk-op"' : '') + '>' + (ch === '?' ? '<span class="sk-q">?</span>' : ch) + '</td>'; }
    return '<tr' + (r.line ? ' class="sk-last"' : '') + '>' + h + '</tr>';
  }).join('') + '</table>';
}
/* long division worked digit by digit. dstr is the dividend as written (it may have a decimal point) */
function ldRun(dstr, dv) {
  const dig = [], colOf = [];
  dstr.split('').forEach((ch, c) => { if (ch !== '.') { dig.push(+ch); colOf.push(c); } });
  const pt = dstr.indexOf('.') < 0 ? dig.length : dstr.indexOf('.');
  let p0 = 0, cur = dig[0];
  while (cur < dv && p0 < dig.length - 1) { p0++; cur = cur * 10 + dig[p0]; }
  const cyc = [];
  for (let i = p0; i < dig.length; i++) {
    if (i > p0) cur = cyc[cyc.length - 1].rem * 10 + dig[i];
    const q = Math.floor(cur / dv), prod = q * dv, rem = cur - prod;
    cyc.push({ i, cur, q, prod, rem, next: i + 1 < dig.length ? dig[i + 1] : null });
  }
  const qd = dig.map((_, i) => i < p0 ? 0 : cyc[i - p0].q);
  let qi = 0; qd.forEach(q => { qi = qi * 10 + q; });
  return { dig, colOf, pt, p0, cyc, qd, quo: +(qi / P10(dig.length - pt)).toFixed(8), rem: cyc[cyc.length - 1].rem };
}
/* the long division layout: o.work shows every written line, o.q writes a given quotient on top (for find the mistake) */
function ldHTML(dstr, dv, o) {
  o = o || {}; const run = ldRun(dstr, dv), dvs = String(dv), L = dstr.length, off = dvs.length, W = off + L + 1;
  const blank = () => Array.from({ length: W }, () => ({ t: '', st: '' }));
  const rows = [], qrow = blank(), drow = blank();
  if (o.work) {
    run.qd.forEach((q, i) => { if (i >= run.p0 || i >= run.pt - 1) qrow[off + run.colOf[i]].t = String(q); });
    if (dstr.indexOf('.') >= 0) qrow[off + dstr.indexOf('.')].t = '.';
    if (run.rem && dstr.indexOf('.') < 0) qrow[W - 1].t = '<span style="white-space:nowrap;font-size:.8em">r ' + run.rem + '</span>';
  } else if (o.q) { const qs = String(o.q).split(' r '); const s = qs[0]; for (let k = 0; k < s.length; k++) qrow[off + L - s.length + k].t = s[k]; if (qs[1]) qrow[W - 1].t = '<span style="white-space:nowrap;font-size:.8em">r ' + qs[1] + '</span>'; }
  dvs.split('').forEach((ch, k) => { drow[k].t = ch; });
  dstr.split('').forEach((ch, k) => { drow[off + k].t = ch; drow[off + k].st = 'border-top:3px solid currentColor;' + (k === 0 ? 'border-left:3px solid currentColor;' : ''); });
  rows.push(qrow, drow);
  if (o.work) {
    const put = (row, v, endI, line) => { const s = String(v); for (let k = 0; k < s.length; k++) { const di = endI - (s.length - 1 - k); if (di < 0) continue; const cell = row[off + run.colOf[di]]; cell.t = s[k]; if (line) cell.st = 'border-bottom:2px solid currentColor;'; } };
    run.cyc.forEach((cy, k) => {
      const pr = blank(); put(pr, cy.prod, cy.i, true);
      const first = cy.i - String(cy.prod).length + 1; if (first >= 0) pr[off + run.colOf[first] - 1].t = '<span style="font-size:.7em">' + MINUS + '</span>';
      const rr = blank(); const last = k === run.cyc.length - 1;
      if (last) put(rr, cy.rem, cy.i); else put(rr, cy.rem * 10 + cy.next, cy.i + 1);
      rows.push(pr, rr);
    });
  }
  return '<table class="stack" aria-hidden="true" style="font-size:1.4rem">' + rows.map(r => '<tr>' + r.map(c => '<td' + (c.st ? ' style="' + c.st + '"' : '') + '>' + c.t + '</td>').join('') + '</tr>').join('') + '</table>';
}
/* one written line per long division cycle, for a one-digit or two-digit divisor */
function ldLines(run, dv, ansHTML) {
  const two = dv >= 10, rd = Math.round(dv / 10) * 10;
  return run.cyc.map((cy, k) => {
    let s = '';
    if (k === 0 && run.p0 > 0) { let lead = 0; for (let i = 0; i < run.p0; i++) lead = lead * 10 + run.dig[i]; s += dv + ' does not go into ' + lead + (run.p0 >= run.pt ? ', so write 0 and the point in the answer, then use ' : ', so start with ') + cy.cur + '. '; }
    if (cy.q === 0) s += dv + ' does not go into ' + cy.cur + ': write 0.';
    else if (!two || dv % 10 === 0) s += cy.cur + ' ÷ ' + dv + ' = ' + cy.q + '. ' + cy.q + ' × ' + dv + ' = ' + cy.prod + ', ' + mi(cy.cur, cy.prod) + ' = ' + cy.rem + '.';
    else {
      const est = Math.max(1, Math.min(9, Math.floor(cy.cur / rd)));
      s += 'Estimate: ' + dv + ' is about ' + rd + ', and ' + cy.cur + ' ÷ ' + rd + ' is about ' + est + '. ';
      if (est > cy.q) s += est + ' × ' + dv + ' = ' + est * dv + ' is too big, so use ' + cy.q + ': ';
      else if (est < cy.q) s += est + ' × ' + dv + ' = ' + est * dv + ' leaves ' + (cy.cur - est * dv) + ', which is ' + dv + ' or more, so use ' + cy.q + ': ';
      s += cy.q + ' × ' + dv + ' = ' + cy.prod + ', ' + mi(cy.cur, cy.prod) + ' = ' + cy.rem + '.';
    }
    if (cy.next != null) s += ' Bring down ' + cy.next + ' → ' + (cy.rem * 10 + cy.next) + '.';
    else s += ' ' + ansHTML;
    return s;
  });
}
function ldSteps(run, dv) {
  const out = run.cyc.map(cy => st('How many ' + dv + 's fit in ' + B(cy.cur) + '?', cy.q));
  if (out.length > 4) out.splice(0, out.length - 4);
  return out;
}
/* a bar model: rows [{lab, segs:[{v, t, q}]}]; q segments are the unknown (left pale). o.brace puts a total over row 0 */
function bmSVG(rows, o) {
  o = o || {}; const LW = 70, BW = 250, RH = 34, GAP = 14, top = o.brace ? 30 : 6;
  const max = o.max || Math.max(...rows.map(r => sum(r.segs.map(s => s.v))));
  const W = LW + BW + 14, H = top + rows.length * (RH + GAP);
  let s = '<svg class="fig" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + W + 'px" aria-hidden="true">';
  rows.forEach((r, j) => {
    let x = LW; const y = top + j * (RH + GAP);
    s += '<text x="' + (LW - 8) + '" y="' + (y + RH / 2 + 5) + '" class="fig-small" text-anchor="end">' + r.lab + '</text>';
    r.segs.forEach(sg => { const w = Math.max(24, sg.v / max * BW); s += '<rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + w.toFixed(1) + '" height="' + RH + '" class="' + (sg.q ? 'fig-cell' : 'fig-on') + '"/><text x="' + (x + w / 2).toFixed(1) + '" y="' + (y + RH / 2 + 6) + '" class="fig-lab">' + sg.t + '</text>'; x += w; });
    if (j === 0 && o.brace) s += '<path d="M' + LW + ' ' + (top - 4) + ' L' + LW + ' ' + (top - 12) + ' L' + x.toFixed(1) + ' ' + (top - 12) + ' L' + x.toFixed(1) + ' ' + (top - 4) + '" class="fig-thin"/><text x="' + ((LW + x) / 2).toFixed(1) + '" y="' + (top - 16) + '" class="fig-lab">' + o.brace + '</text>';
  });
  return s + '</svg>';
}
const eq = (k, t) => Array.from({ length: k }, () => ({ v: 1, t }));   /* k equal unit boxes */
/* the area model: column labels across the top, row labels down the side, cells[r][c] */
function areaSVG(cols, rws, cells) {
  const cw = Math.max(70, ...cols.map(c => String(c).length * 11 + 20)), ch = 46, x0 = 60, y0 = 30, W = x0 + cols.length * cw + 6, H = y0 + rws.length * ch + 6;
  let s = '<svg class="fig" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + Math.min(440, W * 1.2) + 'px" aria-hidden="true">';
  cols.forEach((c, i) => { s += '<text x="' + (x0 + i * cw + cw / 2) + '" y="' + (y0 - 10) + '" class="fig-lab">' + c + '</text>'; });
  rws.forEach((r, j) => { s += '<text x="' + (x0 - 8) + '" y="' + (y0 + j * ch + ch / 2 + 6) + '" class="fig-lab" text-anchor="end">' + r + '</text>';
    cols.forEach((c, i) => { const t = cells[j][i]; s += '<rect x="' + (x0 + i * cw) + '" y="' + (y0 + j * ch) + '" width="' + cw + '" height="' + ch + '" class="' + (t === '?' ? 'fig-cell' : 'fig-on') + '"/><text x="' + (x0 + i * cw + cw / 2) + '" y="' + (y0 + j * ch + ch / 2 + 6) + '" class="fig-lab">' + t + '</text>'; }); });
  return s + '</svg>';
}
/* tally marks: bundles of five */
function tallySVG(v) {
  const g = Math.floor(v / 5), r = v % 5, gw = 46, W = g * gw + r * 10 + 12; let s = '<svg viewBox="0 0 ' + W + ' 34" style="height:30px;width:' + W + 'px" aria-hidden="true">';
  for (let k = 0; k < g; k++) { const x0 = 8 + k * gw; for (let i = 0; i < 4; i++) s += '<line x1="' + (x0 + i * 9) + '" y1="4" x2="' + (x0 + i * 9) + '" y2="30" class="fig-shape"/>'; s += '<line x1="' + (x0 - 5) + '" y1="25" x2="' + (x0 + 32) + '" y2="9" class="fig-shape"/>'; }
  for (let i = 0; i < r; i++) s += '<line x1="' + (8 + g * gw + i * 10) + '" y1="4" x2="' + (8 + g * gw + i * 10) + '" y2="30" class="fig-shape"/>';
  return s + '</svg>';
}
/* a ruler from 0 to max with objects [{a, b, t}] lying above it */
function rulerSVG(max, unit, objs) {
  const x = v => 22 + v * (296 / max), top = 10 + objs.length * 32, H = top + 60;
  let s = '<svg class="fig" viewBox="0 0 340 ' + H + '" style="max-width:420px" aria-hidden="true">';
  objs.forEach((o, k) => { const y = 8 + k * 32; s += '<rect x="' + x(o.a) + '" y="' + y + '" width="' + (x(o.b) - x(o.a)) + '" height="20" rx="7" class="' + (k ? 'fig-bar alt' : 'fig-on') + '"/><text x="' + ((x(o.a) + x(o.b)) / 2) + '" y="' + (y + 15) + '" class="fig-small" style="fill:var(--ink)">' + o.t + '</text>';
    s += '<line x1="' + x(o.a) + '" y1="' + (y + 20) + '" x2="' + x(o.a) + '" y2="' + top + '" class="fig-grid"/><line x1="' + x(o.b) + '" y1="' + (y + 20) + '" x2="' + x(o.b) + '" y2="' + top + '" class="fig-grid"/>'; });
  s += '<rect x="10" y="' + top + '" width="320" height="54" rx="4" class="fig-cell"/>';
  for (let v = 0; v <= max; v++) s += '<line x1="' + x(v) + '" y1="' + top + '" x2="' + x(v) + '" y2="' + (top + 14) + '" class="fig-thin"/><text x="' + x(v) + '" y="' + (top + 32) + '" class="fig-small">' + v + '</text>';
  for (let v = 0; v < max; v++) s += '<line x1="' + (x(v) + x(v + 1)) / 2 + '" y1="' + top + '" x2="' + (x(v) + x(v + 1)) / 2 + '" y2="' + (top + 7) + '" class="fig-thin"/>';
  return s + '<text x="324" y="' + (top + 49) + '" class="fig-small" text-anchor="end">' + unit + '</text></svg>';
}
/* a coordinate grid from lo to hi on both axes, numbered; points [{x, y, t}], o.poly joins the points in order */
function gridSVG(points, lo, hi, o) {
  o = o || {}; const span = hi - lo, u = 216 / span, X = v => 32 + (v - lo) * u, Y = v => 232 - (v - lo) * u, every = span > 12 ? 2 : 1;
  let s = '<svg class="fig" viewBox="0 0 260 262" style="max-width:300px" aria-hidden="true">';
  for (let i = lo; i <= hi; i++) s += '<line x1="' + X(i) + '" x2="' + X(i) + '" y1="' + Y(hi) + '" y2="' + Y(lo) + '" class="fig-grid"/><line y1="' + Y(i) + '" y2="' + Y(i) + '" x1="' + X(lo) + '" x2="' + X(hi) + '" class="fig-grid"/>';
  const ax = lo < 0 ? 0 : lo;
  s += '<line x1="' + X(ax) + '" x2="' + X(ax) + '" y1="' + Y(hi) + '" y2="' + Y(lo) + '" class="fig-thin"/><line y1="' + Y(ax) + '" y2="' + Y(ax) + '" x1="' + X(lo) + '" x2="' + X(hi) + '" class="fig-thin"/>';
  for (let i = lo; i <= hi; i++) if ((i - lo) % every === 0) {
    if (i !== ax || lo >= 0) s += '<text x="' + X(i) + '" y="' + (Y(ax) + 15) + '" class="fig-small" style="font-size:10px">' + nm(i) + '</text>';
    if (i !== ax) s += '<text x="' + (X(ax) - 4) + '" y="' + (Y(i) + 4) + '" class="fig-small" style="font-size:10px" text-anchor="end">' + nm(i) + '</text>';
  }
  if (o.poly) s += '<path d="' + points.map((p, k) => (k ? 'L' : 'M') + X(p.x) + ' ' + Y(p.y)).join(' ') + (o.close ? ' Z' : '') + '" class="fig-thin" style="stroke-dasharray:4 3"/>';
  points.forEach(p => { s += '<circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="5" class="fig-dot"/>' + (p.t ? '<text x="' + (X(p.x) + 7) + '" y="' + (Y(p.y) - 7) + '" class="fig-lab" style="font-size:14px" text-anchor="start">' + p.t + '</text>' : ''); });
  return s + '</svg>';
}
/* a circle with points at angles (degrees, 0 = right), chords segs [[a, b]] by point name, labels [{ang, r, t}] */
function circSVG(pts, segs, labels, arc) {
  const cx = 130, cy = 120, r = 92, P = a => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
  const at = n => n === 'O' ? [cx, cy] : P(pts[n]);
  let s = '<svg class="fig" viewBox="0 0 260 245" style="max-width:300px" aria-hidden="true"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="fig-thin"/>';
  if (arc) { const [a0, a1] = arc, p0 = P(a0), p1 = P(a1), big = ((a1 - a0 + 360) % 360) > 180 ? 1 : 0; s += '<path d="M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 ' + big + ' 0 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + '" style="fill:none;stroke:var(--accent);stroke-width:6"/>'; }
  segs.forEach(([a, b]) => { const p = at(a), q = at(b); s += '<line x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '" class="fig-shape" style="stroke-width:2.5"/>'; });
  Object.keys(pts).forEach(n => { const p = P(pts[n]), lx = cx + (r + 14) * Math.cos(pts[n] * Math.PI / 180), ly = cy - (r + 14) * Math.sin(pts[n] * Math.PI / 180); s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" class="fig-dot"/><text x="' + lx.toFixed(1) + '" y="' + (ly + 5).toFixed(1) + '" class="fig-lab" style="font-size:14px">' + n + '</text>'; });
  if (segs.some(sg => sg.includes('O'))) s += '<circle cx="' + cx + '" cy="' + cy + '" r="3.5" class="fig-dot"/><text x="' + (cx + 4) + '" y="' + (cy + 18) + '" class="fig-small">O</text>';
  labels.forEach(l => { const x = cx + l.r * Math.cos(l.ang * Math.PI / 180), y = cy - l.r * Math.sin(l.ang * Math.PI / 180); s += '<text x="' + x.toFixed(1) + '" y="' + (y + 5).toFixed(1) + '" class="fig-lab" style="font-size:14px">' + l.t + '</text>'; });
  return s + '</svg>';
}

/* every concept's traps: drop empty ones and repeats (the first one wins) */
function defs(list) {
  list.forEach(c => { const g0 = c.gen; c.gen = (d, R) => { const p = g0(d, R); if (p && p.traps) { const seen = new Set(); p.traps = p.traps.filter(t => { if (!t || t.v == null || (typeof t.v === 'number' && (!isFinite(t.v) || t.v < 0 && p.type === 'money'))) return false; const k = JSON.stringify(t.v); if (seen.has(k)) return false; seen.add(k); return true; }); } return p; }; });
  C.defs(list);
}

/* story things for the younger grades: [plural, singular] */
const THINGS = [['stickers', 'sticker'], ['marbles', 'marble'], ['shells', 'shell'], ['cards', 'card'], ['beads', 'bead'], ['stamps', 'stamp'], ['crayons', 'crayon'], ['rocks', 'rock'], ['buttons', 'button'], ['blocks', 'block']];
const COLORS = [['red', 'blue'], ['green', 'yellow'], ['big', 'small'], ['striped', 'spotted'], ['pink', 'purple']];

/* small mental steps for 2-digit adding and taking away (tens first, then ones) */
const tensOf = v => Math.floor(v / 10) * 10;
function addSteps(a, b) { const t = tensOf(b), o = b % 10; if (!t || !o) return [st(B(pl(a, b)) + ' = ?', a + b)]; return [st('Tens first: ' + B(pl(a, t)) + ' = ?', a + t), st('Then the ones: ' + B(pl(a + t, o)) + ' = ?', a + b)]; }
function subSteps(a, b) { const t = tensOf(b), o = b % 10; if (!t || !o) return [st(B(mi(a, b)) + ' = ?', a - b)]; return [st('Take the tens first: ' + B(mi(a, t)) + ' = ?', a - t), st('Then the ones: ' + B(mi(a - t, o)) + ' = ?', a - b)]; }
const factorsOfSmall = p => [2, 3, 4, 5, 6, 7, 8, 9].filter(f => p % f === 0 && p / f >= 2 && p / f <= 12);
const pvn = (k, i) =>k + ' ' + (k === 1 ? PV1[i] : PV[i]);

defs([
/* =================== Word Problems =================== */
{ id: 's_join', s: 'story', g: 2, title: 'Parts and wholes', pre: ['a_split'], paper: true,
  tip: 'Draw a bar for the whole and split it into parts. Whole missing? Add the parts. A part missing? Take the part you know away from the whole.',
  gen(d, R) {
    const [A, Bn] = people(R), [ts] = R.pick(THINGS), [c1, c2] = R.pick(COLORS);
    const kind = R.pick(d === 0 ? ['join', 'ppw0', 'sep'] : d === 1 ? ['ppw', 'chj', 'chs'] : ['stj', 'sts', 'three']);
    const whole = (segs, t) => bmSVG([{ lab: '', segs }], { brace: t });
    if (kind === 'join' || kind === 'ppw0') {
      const a = R.i(5, 16), b = R.i(3, 14), s = a + b; if (s > 30) return null;
      const text = kind === 'join' ? A + ' has ' + B(a) + ' ' + ts + '. ' + A + ' gets ' + B(b) + ' more. How many ' + ts + ' does ' + A + ' have now?'
        : A + ' has ' + B(a) + ' ' + c1 + ' ' + ts + ' and ' + B(b) + ' ' + c2 + ' ' + ts + '. How many ' + ts + ' does ' + A + ' have in all?';
      return { text, ans: s, unit: ts, howVis: whole([{ v: a, t: a }, { v: b, t: b }], '?'),
        how: ['Bar: the parts are ' + a + ' and ' + b + '. The whole is ?.', pl(a, b) + ' = ' + s + '.', A + ' has ' + B(s) + ' ' + ts + (kind === 'join' ? ' now.' : ' in all.')],
        steps: addSteps(a, b),
        traps: [tr(Math.abs(a - b), 's_join', kind === 'join' ? 'Getting more makes the number bigger. Put the two parts together.' : 'In all means put the parts together.'), tr(noCarry(a, b), 'a_regroup', 'Ones plus ones made 10 or more. Trade 10 ones for a ten.'), tr(s - 1, 'a_make10', 'Count on carefully, or make a 10 first.')] };
    }
    if (kind === 'sep') {
      const a = R.i(12, 30), b = R.i(3, a - 4), r = a - b;
      return { text: A + ' had ' + B(a) + ' ' + ts + ' and gave ' + B(b) + ' to ' + Bn + '. How many ' + ts + ' does ' + A + ' have left?', ans: r, unit: ts,
        howVis: whole([{ v: b, t: b }, { v: r, t: '?', q: 1 }], a),
        how: ['Bar: the whole is ' + a + '. One part is ' + b + ' (given away). The part left is ?.', mi(a, b) + ' = ' + r + '.', A + ' has ' + B(r) + ' ' + ts + ' left.'],
        steps: subSteps(a, b),
        traps: [tr(a + b, 's_join', 'Giving some away leaves fewer. Take the part given away from the whole.'), tr(noBorrow(a, b), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones first.')] };
    }
    if (kind === 'ppw') {
      const w = R.i(30, 99), p = R.i(11, w - 11), r = w - p;
      return { text: A + ' has ' + B(w) + ' ' + ts + '. ' + B(p) + ' are ' + c1 + ' and the rest are ' + c2 + '. How many ' + ts + ' are ' + c2 + '?', ans: r, unit: ts,
        howVis: whole([{ v: p, t: p }, { v: r, t: '?', q: 1 }], w),
        how: ['Bar: the whole is ' + w + '. The ' + c1 + ' part is ' + p + '. The ' + c2 + ' part is ?.', p + ' + ? = ' + w + ', so take away: ' + mi(w, p) + '.', mi(w, p) + ' = ' + r + '.', B(r) + ' ' + ts + ' are ' + c2 + '.'],
        steps: [st('The whole is the ' + c1 + ' and ' + c2 + ' ' + ts + ' together. How many is that?', w)].concat(subSteps(w, p)),
        traps: [tr(w + p, 's_join', 'The whole is already given: ' + w + ' is all of them. Take the part you know away.'), tr(noBorrow(w, p), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones first.')] };
    }
    if (kind === 'chj') {
      const a = R.i(15, 60), ch = R.i(11, 39), c = a + ch; if (c > 99) return null;
      return { text: A + ' had ' + B(a) + ' ' + ts + '. ' + A + ' found some more. Now ' + A + ' has ' + B(c) + '. How many ' + ts + ' did ' + A + ' find?', ans: ch, unit: ts,
        howVis: whole([{ v: a, t: a }, { v: ch, t: '?', q: 1 }], c),
        how: ['Bar: the whole is ' + c + ' (now). One part is ' + a + ' (at the start). The part found is ?.', a + ' + ? = ' + c + ', so take away: ' + mi(c, a) + '.', mi(c, a) + ' = ' + ch + '.', A + ' found ' + B(ch) + ' ' + ts + '.'],
        steps: [st('Which number is the whole? How many ' + ts + ' does ' + A + ' have now?', c)].concat(subSteps(c, a)),
        traps: [tr(a + c, 's_join', 'The word more is in the story, but ' + c + ' is already the total. Find the missing part.'), tr(noBorrow(c, a), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones first.')] };
    }
    if (kind === 'chs') {
      const a = R.i(30, 99), c = R.i(10, a - 11), g = a - c;
      return { text: A + ' had ' + B(a) + ' ' + ts + '. ' + A + ' gave some to ' + Bn + ' and has ' + B(c) + ' left. How many ' + ts + ' did ' + A + ' give to ' + Bn + '?', ans: g, unit: ts,
        howVis: whole([{ v: c, t: c }, { v: g, t: '?', q: 1 }], a),
        how: ['Bar: the whole is ' + a + ' (at the start). One part is the ' + c + ' left. The part given away is ?.', c + ' + ? = ' + a + ', so take away: ' + mi(a, c) + '.', mi(a, c) + ' = ' + g + '.', A + ' gave ' + B(g) + ' ' + ts + ' to ' + Bn + '.'],
        steps: [st('The whole is what ' + A + ' had at the start. How many is that?', a)].concat(subSteps(a, c)),
        traps: [tr(a + c, 's_join', A + ' gave some away, so the part given is smaller than ' + a + '. Take the part left away from the whole.'), tr(noBorrow(a, c), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones first.')] };
    }
    if (kind === 'stj') {
      const s0 = R.i(15, 70), ch = R.i(11, 39), c = s0 + ch; if (c > 99) return null;
      return { text: A + ' had some ' + ts + '. Then ' + A + ' got ' + B(ch) + ' more. Now ' + A + ' has ' + B(c) + '. How many ' + ts + ' did ' + A + ' have at first?', ans: s0, unit: ts,
        howVis: whole([{ v: s0, t: '?', q: 1 }, { v: ch, t: ch }], c),
        how: ['Bar: the whole is ' + c + ' (now). One part is the ' + ch + ' ' + A + ' got. The start is ?.', '? + ' + ch + ' = ' + c + ', so take away: ' + mi(c, ch) + '.', mi(c, ch) + ' = ' + s0 + '.', A + ' had ' + B(s0) + ' ' + ts + ' at first.'],
        steps: [st('The whole is how many ' + ts + ' ' + A + ' has now. How many is that?', c)].concat(subSteps(c, ch)),
        traps: [tr(c + ch, 's_join', 'The word more tricks you. The start came before getting more, so it is smaller than ' + c + '.'), tr(noBorrow(c, ch), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones first.')] };
    }
    if (kind === 'sts') {
      const s0 = R.i(30, 99), g = R.i(11, s0 - 11), left = s0 - g;
      return { text: A + ' had some ' + ts + '. ' + A + ' gave ' + B(g) + ' to ' + Bn + ' and has ' + B(left) + ' left. How many ' + ts + ' did ' + A + ' have at first?', ans: s0, unit: ts,
        howVis: whole([{ v: g, t: g }, { v: left, t: left }], '?'),
        how: ['Bar: the parts are ' + g + ' (given away) and ' + left + ' (left). The whole, the start, is ?.', '? ' + MINUS + ' ' + g + ' = ' + left + ', so add the parts: ' + pl(g, left) + '.', pl(g, left) + ' = ' + s0 + '.', A + ' had ' + B(s0) + ' ' + ts + ' at first.'],
        steps: addSteps(left, g),
        traps: [tr(Math.abs(left - g), 's_join', 'Before giving some away, ' + A + ' had more than ' + left + '. Put both parts back together.'), tr(noCarry(g, left), 'a_regroup', 'Ones plus ones made 10 or more. Trade 10 ones for a ten.')] };
    }
    const days = ['Monday', 'Tuesday', 'Wednesday'], a = R.i(11, 39), b = R.i(11, 39), c = R.i(11, 39), S = a + b + c; if (S > 99) return null;
    return { text: A + ' found ' + B(a) + ' ' + ts + ' on ' + days[0] + ', ' + B(b) + ' on ' + days[1] + ' and ' + B(c) + ' on ' + days[2] + '. How many ' + ts + ' did ' + A + ' find in all?', ans: S, unit: ts,
      howVis: whole([{ v: a, t: a }, { v: b, t: b }, { v: c, t: c }], '?'),
      how: ['Bar: three parts, ' + a + ', ' + b + ' and ' + c + '. The whole is ?.', a + ' + ' + b + ' + ' + c + ' = ?', pl(a, b) + ' = ' + (a + b) + ', then ' + pl(a + b, c) + ' = ' + S + '.', A + ' found ' + B(S) + ' ' + ts + ' in all.'],
      steps: [st(B(pl(a, b)) + ' = ?', a + b), st(B(pl(a + b, c)) + ' = ?', S)],
      traps: [tr(a + b, 's_join', 'Three days, three parts: add all of them.'), tr(noCarry(noCarry(a, b), c), 'a_regroup', 'When the ones make 10 or more, trade 10 ones for a ten.')] };
  } },

{ id: 's_compare', s: 'story', g: 2, title: 'How many more? How many fewer?', pre: ['a_countup'], paper: true,
  tip: 'Draw two bars, the longer one for whoever has more. The difference is the extra piece. Careful: the word more does not always mean add.',
  gen(d, R) {
    const [A, Bn] = people(R), [ts] = R.pick(THINGS);
    const two = (la, a, lb, b, qa, qb) => bmSVG([{ lab: la, segs: [{ v: a, t: qa ? '?' : a, q: qa }] }, { lab: lb, segs: [{ v: b, t: qb ? '?' : b, q: qb }] }]);
    const kind = R.pick(d === 0 ? ['diff', 'diff'] : d === 1 ? ['diff', 'more', 'fewer'] : ['imore', 'ifewer']);
    if (kind === 'diff') {
      const a = d === 0 ? R.i(8, 20) : R.i(40, 99), b = d === 0 ? R.i(2, a - 2) : R.i(11, a - 5), df = a - b, fewer = R.chance(0.5);
      const text = A + ' has ' + B(a) + ' ' + ts + '. ' + Bn + ' has ' + B(b) + ' ' + ts + '. ' + (fewer ? 'How many fewer ' + ts + ' does ' + Bn + ' have than ' + A + '?' : 'How many more ' + ts + ' does ' + A + ' have than ' + Bn + '?');
      return { text, ans: df, unit: ts,
        howVis: bmSVG([{ lab: A, segs: [{ v: a, t: a }] }, { lab: Bn, segs: [{ v: b, t: b }, { v: df, t: '?', q: 1 }] }]),
        how: ['Bar: ' + A + '\'s bar is ' + a + '. ' + Bn + '\'s bar is ' + b + ', with a gap of ? to match.', b + ' + ? = ' + a + ', so take away: ' + mi(a, b) + ' = ' + df + '.', fewer ? Bn + ' has ' + B(df) + ' fewer ' + ts + ' than ' + A + '.' : A + ' has ' + B(df) + ' more ' + ts + ' than ' + Bn + '.'],
        steps: d === 0 ? [st(B(mi(a, b)) + ' = ?', df)] : [st('How many does the longer bar show?', a)].concat(subSteps(a, b)),
        traps: [tr(a + b, 's_compare', 'How many ' + (fewer ? 'fewer' : 'more') + ' asks for the difference, the gap between the bars, not the total.'), tr(noBorrow(a, b), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones first.')] };
    }
    if (kind === 'more') {
      const b = R.i(15, 60), k = R.i(11, 35), s = b + k; if (s > 99) return null;
      return { text: Bn + ' has ' + B(b) + ' ' + ts + '. ' + A + ' has ' + B(k) + ' more ' + ts + ' than ' + Bn + '. How many ' + ts + ' does ' + A + ' have?', ans: s, unit: ts,
        howVis: bmSVG([{ lab: A, segs: [{ v: b, t: b }, { v: k, t: k }] }, { lab: Bn, segs: [{ v: b, t: b }] }]),
        how: ['Bar: ' + Bn + '\'s bar is ' + b + '. ' + A + '\'s bar is the same, plus ' + k + ' more.', pl(b, k) + ' = ' + s + '.', A + ' has ' + B(s) + ' ' + ts + '.'],
        steps: addSteps(b, k),
        traps: [tr(Math.abs(b - k), 's_compare', A + ' has more than ' + Bn + ', so ' + A + '\'s number is bigger than ' + b + '.'), tr(noCarry(b, k), 'a_regroup', 'Ones plus ones made 10 or more. Trade 10 ones for a ten.')] };
    }
    if (kind === 'fewer') {
      const a = R.i(35, 99), k = R.i(11, a - 12), r = a - k;
      return { text: A + ' has ' + B(a) + ' ' + ts + '. ' + Bn + ' has ' + B(k) + ' fewer ' + ts + ' than ' + A + '. How many ' + ts + ' does ' + Bn + ' have?', ans: r, unit: ts,
        howVis: bmSVG([{ lab: A, segs: [{ v: r, t: '?', q: 1 }, { v: k, t: k }] }, { lab: Bn, segs: [{ v: r, t: '?', q: 1 }] }]),
        how: ['Bar: ' + A + '\'s bar is ' + a + '. ' + Bn + '\'s bar is shorter by ' + k + '.', mi(a, k) + ' = ' + r + '.', Bn + ' has ' + B(r) + ' ' + ts + '.'],
        steps: subSteps(a, k),
        traps: [tr(a + k, 's_compare', 'Fewer means ' + Bn + '\'s bar is shorter than ' + A + '\'s.'), tr(noBorrow(a, k), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones first.')] };
    }
    if (kind === 'imore') {
      const a = R.i(35, 99), k = R.i(11, a - 12), r = a - k;
      return { text: A + ' has ' + B(a) + ' ' + ts + '. That is ' + B(k) + ' more than ' + Bn + ' has. How many ' + ts + ' does ' + Bn + ' have?', ans: r, unit: ts,
        howVis: bmSVG([{ lab: A, segs: [{ v: r, t: '?', q: 1 }, { v: k, t: k }] }, { lab: Bn, segs: [{ v: r, t: '?', q: 1 }] }]),
        how: ['Who has more? ' + A + ' does. So ' + Bn + '\'s bar is shorter by ' + k + '.', Bn + '\'s number: ? + ' + k + ' = ' + a + ', so ? = ' + mi(a, k) + '.', mi(a, k) + ' = ' + r + '.', Bn + ' has ' + B(r) + ' ' + ts + '.'],
        steps: [st('Who has more ' + ts + '? Type how many ' + A + ' has.', a)].concat(subSteps(a, k)),
        traps: [tr(a + k, 's_compare', 'The word more tricks you here. ' + A + ' has more, so ' + Bn + ' has fewer than ' + a + '. Draw the two bars.'), tr(noBorrow(a, k), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones first.')] };
    }
    const a = R.i(15, 60), k = R.i(11, 35), s = a + k; if (s > 99) return null;
    return { text: A + ' has ' + B(a) + ' ' + ts + '. That is ' + B(k) + ' fewer than ' + Bn + ' has. How many ' + ts + ' does ' + Bn + ' have?', ans: s, unit: ts,
      howVis: bmSVG([{ lab: A, segs: [{ v: a, t: a }] }, { lab: Bn, segs: [{ v: a, t: a }, { v: k, t: k }] }]),
      how: ['Who has fewer? ' + A + ' does. So ' + Bn + '\'s bar is longer by ' + k + '.', Bn + '\'s number: ? = ' + pl(a, k) + '.', pl(a, k) + ' = ' + s + '.', Bn + ' has ' + B(s) + ' ' + ts + '.'],
      steps: [st('Who has fewer ' + ts + '? Type how many ' + A + ' has.', a)].concat(addSteps(a, k)),
      traps: [tr(a - k, 's_compare', 'The word fewer tricks you here. ' + A + ' has fewer, so ' + Bn + ' has more than ' + a + '.'), tr(noCarry(a, k), 'a_regroup', 'Ones plus ones made 10 or more. Trade 10 ones for a ten.')] };
  } },

{ id: 's_twostep', s: 'story', g: 3, title: 'Two-step stories', pre: ['a_subsplit'], paper: true,
  tip: 'Plan before you work: what do you need to find first? Write step 1, then use its answer in step 2. Check that you answered the real question.',
  gen(d, R) {
    const [A, Bn] = people(R), [ts] = R.pick(THINGS), big = d === 2;
    const kind = R.pick(d === 0 ? ['gotgave', 'bus', 'pages'] : d === 1 ? ['pages', 'moretog', 'fewertog', 'gotgave'] : ['pages', 'moretog', 'fewertog', 'bus']);
    const lines = (plan, s1, s2, fin) => [plan, 'Step 1: ' + s1 + '.', 'Step 2: ' + s2 + '.', fin];
    if (kind === 'gotgave') {
      const a = d === 0 ? R.i(12, 30) : R.i(40, 120), b = d === 0 ? R.i(5, 20) : R.i(15, 80), x = a + b, c = R.i(Math.ceil(x / 4), x - 5), y = x - c;
      return { text: A + ' had ' + B(a) + ' ' + ts + '. ' + A + ' got ' + B(b) + ' more, then gave ' + B(c) + ' to ' + Bn + '. How many ' + ts + ' does ' + A + ' have now?', ans: y, unit: ts,
        how: lines('Plan: first add the ' + b + ' ' + A + ' got, then take away the ' + c + ' given away.', pl(a, b) + ' = ' + x, mi(x, c) + ' = ' + y, A + ' has ' + B(y) + ' ' + ts + ' now.'),
        steps: [st('Step 1: ' + B(pl(a, b)) + ' = ?', x), st('Step 2: ' + B(mi(x, c)) + ' = ?', y)],
        traps: [tr(x, 's_twostep', 'That is the answer to step 1. ' + A + ' still gives ' + c + ' away.'), tr(a + b + c, 's_twostep', 'Giving some away makes it smaller: take the ' + c + ' away.'), tr(noBorrow(x, c), 'a_borrow', 'Check the taking away: trade a ten when the ones are too small.')] };
    }
    if (kind === 'bus') {
      const a = big ? R.i(120, 400) : R.i(20, 45), b = big ? R.i(30, a - 40) : R.i(5, a - 8), c = big ? R.i(25, 180) : R.i(4, 20), x = a - b, y = x + c;
      const what = big ? 'A train' : 'A bus', where = big ? 'the train' : 'the bus';
      return { text: what + ' has ' + B(a) + ' people on it. At the next stop, ' + B(b) + ' people get off and ' + B(c) + ' people get on. How many people are on ' + where + ' now?', ans: y, unit: 'people',
        how: lines('Plan: first take away the people who get off, then add the people who get on.', mi(a, b) + ' = ' + x, pl(x, c) + ' = ' + y, B(y) + ' people are on ' + where + ' now.'),
        steps: [st('Step 1: ' + B(mi(a, b)) + ' = ?', x), st('Step 2: ' + B(pl(x, c)) + ' = ?', y)],
        traps: [tr(x, 's_twostep', 'That is after step 1. ' + c + ' people still get on.'), tr(a + b + c, 's_twostep', 'People getting off make fewer: take them away.'), tr(x - c, 's_twostep', 'People getting on make more: add them.')] };
    }
    if (kind === 'pages') {
      const N = d === 0 ? R.pick([50, 60, 80, 90, 100]) : d === 1 ? R.pick([120, 150, 160, 180, 200]) : R.i(30, 90) * 10 + R.i(0, 9), a = Math.round(N * R.i(15, 35) / 100) + R.i(0, 3), b = Math.round(N * R.i(15, 35) / 100) + R.i(0, 3), x = a + b, y = N - x;
      if (y < 5) return null;
      return { text: 'A book has ' + B(nm(N)) + ' pages. ' + A + ' read ' + B(a) + ' pages on Monday and ' + B(b) + ' pages on Tuesday. How many pages are left to read?', ans: y, unit: 'pages',
        how: lines('Plan: first find how many pages ' + A + ' read, then take that from ' + nm(N) + '.', pl(a, b) + ' = ' + x, mi(N, x) + ' = ' + y, B(y) + ' pages are left.'),
        steps: [st('Step 1: ' + B(pl(a, b)) + ' = ?', x), st('Step 2: ' + B(mi(N, x)) + ' = ?', y)],
        traps: [tr(x, 's_twostep', 'That is how many pages ' + A + ' read. The question asks how many are left.'), tr(N - a, 's_twostep', 'Take away both days of reading.'), tr(noBorrow(N, x), 'a_borrow', 'Check the taking away: trade when the top digit is too small.')] };
    }
    if (kind === 'moretog') {
      const b = big ? R.i(120, 380) : R.i(25, 70), k = big ? R.i(25, 150) : R.i(8, 30), x = b + k, y = b + x;
      return { text: Bn + ' has ' + B(b) + ' ' + ts + '. ' + A + ' has ' + B(k) + ' more ' + ts + ' than ' + Bn + '. How many ' + ts + ' do they have together?', ans: y, unit: ts,
        howVis: bmSVG([{ lab: A, segs: [{ v: b, t: b }, { v: k, t: k }] }, { lab: Bn, segs: [{ v: b, t: b }] }]),
        how: lines('Plan: first find how many ' + A + ' has, then add both.', A + ': ' + pl(b, k) + ' = ' + x, 'together: ' + pl(b, x) + ' = ' + y, 'They have ' + B(y) + ' ' + ts + ' together.'),
        steps: [st('Step 1: How many does ' + A + ' have? ' + B(pl(b, k)) + ' = ?', x), st('Step 2: ' + B(pl(b, x)) + ' = ?', y)],
        traps: [tr(x, 's_twostep', 'That is how many ' + A + ' has. Now add ' + Bn + '\'s too.'), tr(b + k + k, 's_compare', A + ' has ' + k + ' more than ' + Bn + ', but ' + Bn + ' has ' + b + '.'), tr(noCarry(b, x), 'a_regroup', 'Check the carrying in step 2.')] };
    }
    const a = big ? R.i(150, 450) : R.i(30, 80), k = big ? R.i(25, 120) : R.i(8, 25), x = a - k, y = a + x;
    return { text: A + ' has ' + B(a) + ' ' + ts + '. ' + Bn + ' has ' + B(k) + ' fewer ' + ts + ' than ' + A + '. How many ' + ts + ' do they have together?', ans: y, unit: ts,
      howVis: bmSVG([{ lab: A, segs: [{ v: x, t: x }, { v: k, t: k }] }, { lab: Bn, segs: [{ v: x, t: x }] }]),
      how: lines('Plan: first find how many ' + Bn + ' has, then add both.', Bn + ': ' + mi(a, k) + ' = ' + x, 'together: ' + pl(a, x) + ' = ' + y, 'They have ' + B(y) + ' ' + ts + ' together.'),
      steps: [st('Step 1: How many does ' + Bn + ' have? ' + B(mi(a, k)) + ' = ?', x), st('Step 2: ' + B(pl(a, x)) + ' = ?', y)],
      traps: [tr(x, 's_twostep', 'That is how many ' + Bn + ' has. Now add ' + A + '\'s too.'), tr(a + a + k, 's_compare', 'Fewer means ' + Bn + ' has less than ' + A + '.'), tr(a + k, 's_twostep', 'Find ' + Bn + '\'s number first, then add the two.')] };
  } },

{ id: 's_groups', s: 'story', g: 3, title: 'Equal groups: times or divide?', pre: ['m_divfam'], paper: true,
  tip: 'Equal groups have three numbers: groups, how many in each, and the total. Total missing? Multiply. Groups or group size missing? Divide.',
  gen(d, R) {
    const [A] = people(R), [ts] = R.pick(THINGS);
    const kind = R.pick(d === 0 ? ['prod', 'share', 'meas'] : d === 1 ? ['prod', 'share', 'meas', 'array'] : ['prodsub', 'prodshare', 'meas']);
    const pickF = () => d === 0 ? [R.pick([2, 5, 10]), R.i(2, 9)] : [R.i(3, 9), R.i(3, 9)];
    let [g, e] = pickF(); if (R.chance(0.5)) [g, e] = [e, g];
    const p = g * e, slipT = (v, why) => tr(v, factC(g, e), why || 'Check the fact ' + g + ' × ' + e + '.');
    if (kind === 'prod' || kind === 'array') {
      const text = kind === 'prod' ? 'There are ' + B(g) + ' bags. Each bag has ' + B(e) + ' ' + ts + '. How many ' + ts + ' are there in all?' : 'A garden has ' + B(g) + ' rows of plants with ' + B(e) + ' plants in each row. How many plants are in the garden?';
      const u = kind === 'prod' ? ts : 'plants';
      return { text, ans: p, unit: u, vis: d === 0 ? groupsSVG(g, e) : '',
        how: ['Equal groups: ' + g + ' groups of ' + e + '. The total is ?.', 'Total missing, so multiply: ' + g + ' × ' + e + ' = ' + p + '.', 'There are ' + B(p) + ' ' + u + '.'],
        steps: [st('How many groups are there?', g), st(B(g + ' × ' + e) + ' = ?', p)],
        traps: [tr(g + e, 's_groups', 'Each group has the same number: that is equal groups, so multiply.'), slipT(p + Math.min(g, e)), slipT(p - Math.min(g, e))] };
    }
    if (kind === 'share') {
      return { text: A + ' shares ' + B(p) + ' ' + ts + ' equally among ' + B(g) + ' friends. How many ' + ts + ' does each friend get?', ans: e, unit: ts,
        how: ['Equal groups: ' + p + ' in all, ' + g + ' groups. The size of each group is ?.', 'Group size missing, so divide: ' + p + ' ÷ ' + g + ' = ?', 'Think times: ' + g + ' × ' + e + ' = ' + p + ', so ' + p + ' ÷ ' + g + ' = ' + e + '.', 'Each friend gets ' + B(e) + ' ' + ts + '.'],
        steps: [st('What is the total?', p), st(B(g + ' × ? = ' + p), e)],
        traps: [tr(p - g, 's_groups', 'Sharing equally is dividing, not taking away.'), tr(p * g, 's_groups', 'Sharing makes each share smaller than the total. Divide.'), tr(e + 1, 'm_divfam', 'Check: ' + g + ' × ' + (e + 1) + ' is not ' + p + '.')] };
    }
    if (kind === 'meas') {
      return { text: A + ' has ' + B(p) + ' ' + ts + ' and puts ' + B(e) + ' in each bag. How many bags does ' + A + ' fill?', ans: g, unit: 'bags',
        how: ['Equal groups: ' + p + ' in all, ' + e + ' in each. The number of groups is ?.', 'Number of groups missing, so divide: ' + p + ' ÷ ' + e + ' = ?', 'Think times: ? × ' + e + ' = ' + p + '. ' + g + ' × ' + e + ' = ' + p + '.', A + ' fills ' + B(g) + ' bags.'],
        steps: [st('How many go in each bag?', e), st(B('? × ' + e + ' = ' + p), g)],
        traps: [tr(p - e, 's_groups', 'Putting the same number in each bag is dividing, not taking away once.'), tr(p + e, 's_groups', 'Each bag holds ' + e + '. How many bags of ' + e + ' make ' + p + '?'), tr(g + 1, 'm_divfam', 'Check: ' + (g + 1) + ' × ' + e + ' is not ' + p + '.')] };
    }
    if (kind === 'prodsub') {
      const k = R.i(2, p - 3), left = p - k;
      return { text: 'There are ' + B(g) + ' boxes with ' + B(e) + ' ' + ts + ' in each box. ' + A + ' uses ' + B(k) + ' of them. How many ' + ts + ' are left?', ans: left, unit: ts,
        how: ['Plan: first find the total (equal groups, so multiply), then take away what was used.', 'Step 1: ' + g + ' × ' + e + ' = ' + p + '.', 'Step 2: ' + mi(p, k) + ' = ' + left + '.', B(left) + ' ' + ts + ' are left.'],
        steps: [st('Step 1: ' + B(g + ' × ' + e) + ' = ?', p), st('Step 2: ' + B(mi(p, k)) + ' = ?', left)],
        traps: [tr(p, 's_twostep', 'That is the total before ' + A + ' used ' + k + '.'), tr(g + e - k, 's_groups', 'Boxes with the same number in each: multiply to find the total.'), slipT(p + Math.min(g, e) - k)] };
    }
    const f = R.pick(factorsOfSmall(p)); if (!f) return null; const each = p / f;
    return { text: 'There are ' + B(g) + ' packs with ' + B(e) + ' ' + ts + ' in each pack. ' + A + ' shares all of them equally among ' + B(f) + ' friends. How many ' + ts + ' does each friend get?', ans: each, unit: ts,
      how: ['Plan: first find the total (multiply), then share it (divide).', 'Step 1: ' + g + ' × ' + e + ' = ' + p + '.', 'Step 2: ' + p + ' ÷ ' + f + ' = ' + each + ', because ' + f + ' × ' + each + ' = ' + p + '.', 'Each friend gets ' + B(each) + ' ' + ts + '.'],
      steps: [st('Step 1: ' + B(g + ' × ' + e) + ' = ?', p), st('Step 2: ' + B(p + ' ÷ ' + f) + ' = ?', each)],
      traps: [tr(p, 's_twostep', 'That is the total. Now share it among ' + f + ' friends.'), tr(p - f, 's_groups', 'Sharing equally is dividing.'), tr(e, 's_groups', 'Each friend gets a share of all ' + g + ' packs, not one pack.')] };
  } },
{ id: 's_times', s: 'story', g: 4, title: 'Times as many', pre: ['m_breakapart'], paper: true,
  tip: '3 times as many means 3 bars, each the same size as the small one. It is not 3 more. 3 times as many as 8 is 3 × 8 = 24.',
  gen(d, R) {
    const [A, Bn] = people(R), [ts] = R.pick(THINGS);
    const bars = (b, k, qb, qa) => bmSVG([{ lab: Bn, segs: [{ v: 1, t: qb ? '?' : b, q: qb }] }, { lab: A, segs: eq(k, qb ? '?' : b).map(s => Object.assign(s, { q: qb })) }], { max: Math.max(k, 4) });
    const kind = R.pick(d === 0 ? ['times'] : d === 1 ? ['times', 'part', 'tall'] : ['howmany', 'diff', 'tog']);
    if (kind === 'times' || kind === 'tall') {
      const b = d === 0 ? R.i(2, 10) : R.i(11, 25), k = d === 0 ? R.i(2, 5) : R.i(3, 9), p = b * k;
      const text = kind === 'times' ? Bn + ' has ' + B(b) + ' ' + ts + '. ' + A + ' has ' + B(k) + ' times as many ' + ts + ' as ' + Bn + '. How many ' + ts + ' does ' + A + ' have?'
        : 'A young tree is ' + B(b) + ' feet tall. An old tree is ' + B(k) + ' times as tall. How tall is the old tree?';
      const u = kind === 'times' ? ts : 'feet', bL = kind === 'times' ? Bn : 'young tree', aL = kind === 'times' ? A : 'old tree';
      const how = ['Bar: the ' + bL + ' is 1 bar of ' + b + '. The ' + aL + ' is ' + k + ' bars of ' + b + '.'];
      if (b > 10) how.push(k + ' × ' + b + ' = ' + k + ' × ' + tensOf(b) + ' + ' + k + ' × ' + (b % 10) + ' = ' + (k * tensOf(b)) + ' + ' + (k * (b % 10)) + ' = ' + p + '.');
      else how.push(k + ' × ' + b + ' = ' + p + '.');
      how.push((kind === 'times' ? A + ' has ' : 'The old tree is ') + B(p) + ' ' + u + (kind === 'times' ? '.' : ' tall.'));
      if (kind === 'times') how[0] = 'Bar: ' + Bn + ' has 1 bar of ' + b + '. ' + A + ' has ' + k + ' bars of ' + b + '.';
      return { text, ans: p, unit: u, howVis: bmSVG([{ lab: kind === 'times' ? Bn : 'young', segs: [{ v: 1, t: b }] }, { lab: kind === 'times' ? A : 'old', segs: eq(k, b) }], { max: Math.max(k, 4) }),
        how, steps: b > 10 ? [st(B(k + ' × ' + tensOf(b)) + ' = ?', k * tensOf(b)), st(B(k + ' × ' + (b % 10)) + ' = ?', k * (b % 10)), st(B(pl(k * tensOf(b), k * (b % 10))) + ' = ?', p)] : [st('How many bars of ' + b + '?', k), st(B(k + ' × ' + b) + ' = ?', p)],
        traps: [tr(b + k, 's_times', k + ' times as many means ' + k + ' bars the size of ' + b + ', not ' + k + ' more.'), b > 10 ? tr(k * tensOf(b) + b % 10, 'm_breakapart', 'Multiply the ones too: ' + k + ' × ' + (b % 10) + '.') : tr(p + b, factC(k, b), 'Check the fact ' + k + ' × ' + b + '.')] };
    }
    if (kind === 'part') {
      const b = R.i(4, 15), k = R.i(3, 9), T = b * k;
      return { text: A + ' has ' + B(T) + ' ' + ts + '. That is ' + B(k) + ' times as many as ' + Bn + ' has. How many ' + ts + ' does ' + Bn + ' have?', ans: b, unit: ts,
        howVis: bars(b, k, true),
        how: ['Bar: ' + A + ' has ' + k + ' equal bars that make ' + T + '. ' + Bn + ' has 1 of those bars.', k + ' × ? = ' + T + ', so ? = ' + T + ' ÷ ' + k + '.', T + ' ÷ ' + k + ' = ' + b + ', because ' + k + ' × ' + b + ' = ' + T + '.', Bn + ' has ' + B(b) + ' ' + ts + '.'],
        steps: [st('How many equal bars does ' + A + ' have?', k), st(B(T + ' ÷ ' + k) + ' = ?', b)],
        traps: [tr(T * k, 's_times', 'Who has more? ' + A + ' does, so ' + Bn + '\'s number is smaller than ' + T + '.'), tr(T - k, 's_times', 'Times as many is not ' + k + ' more. Split ' + T + ' into ' + k + ' equal bars.')] };
    }
    const b = R.i(6, 25), k = R.i(3, 9), T = b * k;
    if (kind === 'howmany') {
      return { text: Bn + ' has ' + B(b) + ' ' + ts + '. ' + A + ' has ' + B(T) + ' ' + ts + '. How many times as many ' + ts + ' does ' + A + ' have as ' + Bn + '?', ans: k, unit: 'times',
        howVis: bars(b, k, false),
        how: ['Bar: ' + Bn + '\'s bar is ' + b + '. How many bars of ' + b + ' make ' + T + '?', '? × ' + b + ' = ' + T + ', so ? = ' + T + ' ÷ ' + b + '.', T + ' ÷ ' + b + ' = ' + k + ', because ' + k + ' × ' + b + ' = ' + T + '.', A + ' has ' + B(k) + ' times as many.'],
        steps: [st(B('? × ' + b + ' = ' + T), k)],
        traps: [tr(T - b, 's_times', 'How many times asks how many bars of ' + b + ' fit in ' + T + ', not the difference.'), tr(T + b, 's_times', 'Divide: how many groups of ' + b + ' make ' + T + '?')] };
    }
    if (kind === 'diff') {
      const df = T - b;
      return { text: Bn + ' has ' + B(b) + ' ' + ts + '. ' + A + ' has ' + B(k) + ' times as many. How many more ' + ts + ' does ' + A + ' have than ' + Bn + '?', ans: df, unit: ts,
        howVis: bars(b, k, false),
        how: ['Plan: find how many ' + A + ' has, then the difference. (Or: ' + A + ' has ' + (k - 1) + ' more bars than ' + Bn + '.)', 'Step 1: ' + k + ' × ' + b + ' = ' + T + '.', 'Step 2: ' + mi(T, b) + ' = ' + df + '.', A + ' has ' + B(df) + ' more ' + ts + '.'],
        steps: [st('Step 1: ' + B(k + ' × ' + b) + ' = ?', T), st('Step 2: ' + B(mi(T, b)) + ' = ?', df)],
        traps: [tr(T, 's_twostep', 'That is how many ' + A + ' has. The question asks how many more.'), tr(k - 1, 's_times', 'How many more ' + ts + ', not how many more bars.'), tr(b * (k + 1), 's_times', 'More means the difference: take ' + Bn + '\'s away.')] };
    }
    const tot = T + b;
    return { text: Bn + ' has ' + B(b) + ' ' + ts + '. ' + A + ' has ' + B(k) + ' times as many. How many ' + ts + ' do they have together?', ans: tot, unit: ts,
      howVis: bars(b, k, false),
      how: ['Plan: find how many ' + A + ' has, then add both. (Or: ' + (k + 1) + ' bars of ' + b + ' in all.)', 'Step 1: ' + k + ' × ' + b + ' = ' + T + '.', 'Step 2: ' + pl(T, b) + ' = ' + tot + '.', 'They have ' + B(tot) + ' ' + ts + ' together.'],
      steps: [st('Step 1: ' + B(k + ' × ' + b) + ' = ?', T), st('Step 2: ' + B(pl(T, b)) + ' = ?', tot)],
      traps: [tr(T, 's_twostep', 'That is how many ' + A + ' has. Add ' + Bn + '\'s too.'), tr(b + k + b, 's_times', k + ' times as many is ' + k + ' bars of ' + b + ', not ' + k + ' more.')] };
  } },

{ id: 's_leftover', s: 'story', g: 4, title: 'What does the leftover mean?', pre: ['m_remain'], paper: true,
  tip: 'Divide, then read the story again. Leftover people still need a seat: round up. Not enough for one more: drop it. Asked what is left: the remainder is the answer.',
  gen(d, R) {
    const [A, Bn] = people(R);
    const kind = R.pick(d === 0 ? ['down', 'rem', 'up'] : d === 1 ? ['up', 'down', 'rem'] : ['up', 'down', 'rem', 'more']);
    const s = kind === 'more' ? R.i(4, 9) : d === 0 ? R.i(3, 6) : R.i(3, 9), q = d === 2 ? R.i(Math.max(12, Math.ceil(100 / s)), 60) : d === 0 ? R.i(2, 8) : R.i(5, Math.floor(98 / s)), r = R.i(2, kind === 'more' ? s - 2 : s - 1), N = q * s + r;
    if (d === 1 && q > 12) return null;
    let text, ans, unit, mean, fin, traps;
    if (kind === 'up') {
      const c = R.pick([['kids are going on a trip. Each van holds', 'kids', 'vans', 'van'], ['books need to be packed. Each box holds', 'books', 'boxes', 'box'], ['people are waiting for the boat. Each trip carries', 'people', 'trips', 'trip']]);
      text = B(N) + ' ' + c[0] + ' ' + B(s) + ' ' + c[1] + '. How many ' + c[2] + ' are needed?'; ans = q + 1; unit = c[2];
      mean = q + ' ' + c[2] + ' take ' + q * s + ' ' + c[1] + ', and ' + r + ' ' + plural(r, c[1].replace(/s$/, ''), c[1]).replace('peoples', 'people') + ' are still left.';
      fin = 'Those ' + r + ' still need a ' + c[3] + ', so round up: ' + B(q + 1) + ' ' + c[2] + '.';
      traps = [tr(q, 's_leftover', 'The ' + r + ' left over still need a ' + c[3] + ' too.'), tr(r, 's_leftover', 'The remainder tells you how many are left over, not how many ' + c[2] + '.')];
    } else if (kind === 'down') {
      const c = R.pick([['beads', 'Each bracelet needs', 'bracelets', 'bracelet', 'make'], ['eggs', 'Each cake needs', 'cakes', 'cake', 'bake'], ['tickets', 'Each ride costs', 'rides', 'ride', 'go on']]);
      text = A + ' has ' + B(N) + ' ' + c[0] + '. ' + c[1] + ' ' + B(s) + ' ' + c[0] + '. How many ' + c[2] + ' can ' + A + ' ' + c[4] + '?'; ans = q; unit = c[2];
      mean = q + ' ' + c[2] + ' use ' + q * s + ' ' + c[0] + ', and ' + r + ' ' + c[0] + ' are left.';
      fin = r + ' is not enough for another ' + c[3] + ', so drop the leftover: ' + B(q) + ' ' + c[2] + '.';
      traps = [tr(q + 1, 's_leftover', 'The ' + r + ' left over is not enough for a whole ' + c[3] + '.'), tr(r, 's_leftover', 'The remainder is what is left over, not how many ' + c[2] + '.')];
    } else if (kind === 'rem') {
      const c = R.pick([['cookies are packed into bags of', 'cookies', 'bags'], ['cards are shared equally among', 'cards', 'friends'], ['pencils are put into cups of', 'pencils', 'cups']]);
      const shareCards = c[2] === 'friends';
      text = B(N) + ' ' + c[0] + ' ' + B(s) + (shareCards ? ' friends. Each friend gets as many as possible' : '') + '. How many ' + c[1] + ' are left over?'; ans = r; unit = c[1];
      mean = shareCards ? 'Each friend gets ' + q + ', which uses ' + q * s + ' ' + c[1] + '.' : q + ' ' + c[2] + ' use ' + q * s + ' ' + c[1] + '.';
      fin = 'The question asks what is left, so the remainder is the answer: ' + B(r) + ' ' + c[1] + '.';
      traps = [tr(q, 's_leftover', 'That is how many ' + (shareCards ? 'each friend gets' : 'full ' + c[2]) + '. The question asks how many are left over.'), tr(s - r, 's_leftover', 'Left over means the remainder after making the equal groups.')];
    } else {
      text = B(N) + ' kids sign up for teams of ' + B(s) + '. The last team is not full. How many more kids are needed to fill it?'; ans = s - r; unit = 'kids';
      mean = q + ' full teams use ' + q * s + ' kids, so ' + r + ' kids are in the last team.';
      fin = 'The last team needs ' + mi(s, r) + ' = ' + B(s - r) + ' more kids.';
      traps = [tr(r, 's_leftover', 'That is how many kids are in the last team. How many more fill it to ' + s + '?'), tr(q + 1, 's_leftover', 'That is how many teams. The question asks how many more kids.')];
    }
    traps.push(tr(kind === 'up' ? q + 2 : q - 1, 'm_remain', 'Check the division: ' + q + ' × ' + s + ' = ' + q * s + '.'));
    return { text, ans, unit,
      how: ['Divide: ' + N + ' ÷ ' + s + ' = ' + q + ' r ' + r + '.', 'Check and read it: ' + mean, fin],
      steps: [st('Divide: ' + B(N + ' ÷ ' + s) + ' = ? (type it like 7r2)', { q, r }, { type: 'rem' }), st('Read the story again. ' + text.replace(/<[^>]+>/g, '').replace(/^.*?\. /, '').replace(/^.*?\. (?=How)/, ''), ans)],
      traps };
  } },

{ id: 's_multistep', s: 'story', g: 4, title: 'Multi-step stories', pre: ['x_missing'], paper: true,
  tip: 'Make a plan: list the steps in order before you work. Write each step on its own line, and use its answer in the next step.',
  gen(d, R) {
    const [A, Bn] = people(R), [ts] = R.pick(THINGS);
    const kind = R.pick(d === 0 ? ['chairs', 'bags', 'earn'] : d === 1 ? ['crayons', 'tickets', 'bags', 'earn'] : ['crayons', 'tickets', 'two']);
    if (kind === 'chairs') {
      const r = R.i(3, 9), c = R.i(4, 10), tot = r * c, k = R.i(Math.ceil(tot / 3), tot - 3), e = tot - k;
      return { text: 'A hall has ' + B(r) + ' rows of ' + B(c) + ' chairs. ' + B(k) + ' people sit down, one on each chair. How many chairs are empty?', ans: e, unit: 'chairs',
        how: ['Plan: find all the chairs (multiply), then take away the full ones.', 'Step 1: ' + r + ' × ' + c + ' = ' + tot + '.', 'Step 2: ' + mi(tot, k) + ' = ' + e + '.', B(e) + ' chairs are empty.'],
        steps: [st('Step 1: ' + B(r + ' × ' + c) + ' = ?', tot), st('Step 2: ' + B(mi(tot, k)) + ' = ?', e)],
        traps: [tr(tot, 's_multistep', 'That is all the chairs. Take away the ' + k + ' that are full.'), tr(r + c + k, 's_groups', 'Rows of chairs are equal groups: multiply.')] };
    }
    if (kind === 'bags') {
      const s = d === 0 ? R.i(2, 5) : R.i(3, 9), n = d === 0 ? R.i(3, 8) : R.i(6, 15), h = d === 0 ? R.i(2, 9) : R.i(10, 40), T = n * s + h;
      return { text: A + ' has ' + B(T) + ' ' + ts + '. ' + A + ' gives ' + B(h) + ' to ' + Bn + ', then puts the rest into bags of ' + B(s) + '. How many bags does ' + A + ' fill?', ans: n, unit: 'bags',
        how: ['Plan: take away the ones given to ' + Bn + ', then divide the rest into bags.', 'Step 1: ' + mi(T, h) + ' = ' + (T - h) + '.', 'Step 2: ' + (T - h) + ' ÷ ' + s + ' = ' + n + ', because ' + n + ' × ' + s + ' = ' + (T - h) + '.', A + ' fills ' + B(n) + ' bags.'],
        steps: [st('Step 1: ' + B(mi(T, h)) + ' = ?', T - h), st('Step 2: ' + B((T - h) + ' ÷ ' + s) + ' = ?', n)],
        traps: [tr(T - h, 's_multistep', 'That is how many are left. Now put them into bags of ' + s + '.'), tr(Number.isInteger(T / s) ? T / s : null, 's_multistep', 'Give ' + h + ' to ' + Bn + ' first, then make the bags.'), tr(T - h - s, 's_groups', 'Bags of ' + s + ' is dividing, not taking away once.')] };
    }
    if (kind === 'earn') {
      const w = d === 0 ? R.i(3, 9) : R.i(12, 25), n = d === 0 ? R.i(3, 6) : R.i(4, 9), tot = w * n, sp = R.i(Math.ceil(tot / 3), tot - 2), left = tot - sp;
      const item = R.pick(['a game', 'a kite', 'a book', 'a puzzle', 'a ball']);
      return { text: A + ' earns ' + B('$' + w) + ' each week for ' + B(n) + ' weeks, then spends ' + B('$' + sp) + ' on ' + item + '. How much money does ' + A + ' have left?', ans: left * 100, type: 'money', fmt: 'd',
        how: ['Plan: find the money earned (multiply), then take away what was spent.', 'Step 1: ' + n + ' × $' + w + ' = $' + tot + '.', 'Step 2: $' + tot + ' ' + MINUS + ' $' + sp + ' = $' + left + '.', A + ' has ' + B('$' + left) + ' left.'],
        steps: [st('Step 1: ' + B(n + ' × $' + w) + ' = ?', tot * 100, { type: 'money', fmt: 'd' }), st('Step 2: ' + B('$' + tot + ' ' + MINUS + ' $' + sp) + ' = ?', left * 100, { type: 'money', fmt: 'd' })],
        traps: [tr(tot * 100, 's_multistep', 'That is the money earned. Take away the $' + sp + ' spent.'), tr((tot + sp) * 100, 's_multistep', 'Spending money leaves less: take it away.')] };
    }
    if (kind === 'crayons') {
      const g = R.i(3, 8), each = d === 2 ? R.i(12, 30) : R.i(5, 12), total = g * each, k = R.pick(d === 2 ? [24, 36, 48, 50, 64] : [8, 10, 12, 16, 24]), n = Math.ceil((total + 3) / k) + R.i(0, 2), m = n * k - total;
      if (m < 2 || m > n * k / 2) return null;
      return { text: 'A class has ' + B(n) + ' boxes of ' + B(k) + ' crayons. ' + B(m) + ' crayons are broken and thrown away. The rest are shared equally among ' + B(g) + ' tables. How many crayons does each table get?', ans: each, unit: 'crayons',
        how: ['Plan: all the crayons (multiply), take away the broken ones, then share (divide).', 'Step 1: ' + n + ' × ' + k + ' = ' + n * k + '.', 'Step 2: ' + mi(n * k, m) + ' = ' + total + '.', 'Step 3: ' + total + ' ÷ ' + g + ' = ' + B(each) + ' crayons for each table.'],
        steps: [st('Step 1: ' + B(n + ' × ' + k) + ' = ?', n * k), st('Step 2: ' + B(mi(n * k, m)) + ' = ?', total), st('Step 3: ' + B(total + ' ÷ ' + g) + ' = ?', each)],
        traps: [tr(total, 's_multistep', 'That is the crayons left. Now share them among ' + g + ' tables.'), tr(n * k, 's_multistep', 'Take away the broken crayons, then share.'), tr(Number.isInteger(n * k / g) ? n * k / g - m : null, 'x_order', 'Take away the broken crayons before sharing.')] };
    }
    if (kind === 'tickets') {
      const a = R.i(4, d === 2 ? 15 : 9), b = a + R.i(2, 8), n = R.i(2, 6), m = R.i(1, 4), tot = n * a + m * b, P = Math.ceil((tot + 1) / (d === 2 ? 50 : 20)) * (d === 2 ? 50 : 20), ch = P - tot;
      return { text: 'Kids\' tickets cost ' + B('$' + a) + ' and adult tickets cost ' + B('$' + b) + '. ' + B(n) + ' kids and ' + B(m) + ' ' + plural(m, 'adult') + ' go to the show. They pay with ' + B('$' + P) + '. How much change do they get?', ans: ch * 100, type: 'money', fmt: 'd',
        how: ['Plan: cost of the kids\' tickets, plus the adult tickets, then take the total from $' + P + '.', 'Step 1: kids ' + n + ' × $' + a + ' = $' + n * a + ', adults ' + m + ' × $' + b + ' = $' + m * b + '.', 'Step 2: $' + n * a + ' + $' + m * b + ' = $' + tot + '.', 'Step 3: $' + P + ' ' + MINUS + ' $' + tot + ' = ' + B('$' + ch) + ' change.'],
        steps: [st('Kids\' tickets: ' + B(n + ' × $' + a) + ' = ?', n * a * 100, { type: 'money', fmt: 'd' }), st('Adult tickets: ' + B(m + ' × $' + b) + ' = ?', m * b * 100, { type: 'money', fmt: 'd' }), st('All the tickets: ' + B('$' + n * a + ' + $' + m * b) + ' = ?', tot * 100, { type: 'money', fmt: 'd' }), st('Change: ' + B('$' + P + ' ' + MINUS + ' $' + tot) + ' = ?', ch * 100, { type: 'money', fmt: 'd' })],
        traps: [tr(tot * 100, 's_multistep', 'That is the cost. The question asks for the change from $' + P + '.'), tr(P - (a + b) > 0 ? (P - a - b) * 100 : null, 's_multistep', 'Each kid and each adult needs a ticket: multiply first.'), tr(P - n * a > 0 ? (P - n * a) * 100 : null, 's_multistep', 'Pay for the adults too.')] };
    }
    const k1 = R.i(6, 12), n1 = R.i(3, 6), k2 = R.i(6, 12), n2 = R.i(2, 5), tot = n1 * k1 + n2 * k2, g = R.pick(factorsOfSmall(tot).filter(f => f >= 3)); if (!g) return null;
    const each = tot / g;
    return { text: A + ' buys ' + B(n1) + ' packs of ' + B(k1) + ' ' + ts + '. ' + Bn + ' buys ' + B(n2) + ' packs of ' + B(k2) + ' ' + ts + '. They put them together and share them equally among ' + B(g) + ' kids. How many ' + ts + ' does each kid get?', ans: each, unit: ts,
      how: ['Plan: ' + A + '\'s ' + ts + ', plus ' + Bn + '\'s, then share among ' + g + '.', 'Step 1: ' + n1 + ' × ' + k1 + ' = ' + n1 * k1 + ' and ' + n2 + ' × ' + k2 + ' = ' + n2 * k2 + '.', 'Step 2: ' + pl(n1 * k1, n2 * k2) + ' = ' + tot + '.', 'Step 3: ' + tot + ' ÷ ' + g + ' = ' + B(each) + ' ' + ts + ' each.'],
      steps: [st(B(n1 + ' × ' + k1) + ' = ?', n1 * k1), st(B(n2 + ' × ' + k2) + ' = ?', n2 * k2), st(B(pl(n1 * k1, n2 * k2)) + ' = ?', tot), st(B(tot + ' ÷ ' + g) + ' = ?', each)],
      traps: [tr(tot, 's_multistep', 'That is all the ' + ts + '. Now share them among ' + g + ' kids.'), tr(Number.isInteger(n1 * k1 / g) ? n1 * k1 / g : null, 's_multistep', 'Put both kids\' ' + ts + ' together before sharing.')] };
  } },
{ id: 's_fracstory', s: 'story', g: 5, title: 'Fraction stories with bars', pre: ['f_of'], paper: true,
  tip: 'Draw the whole as a bar cut into equal parts (the bottom number). Find one part, then as many parts as you need. 3/8 of 24: one part is 3, three parts are 9.',
  gen(d, R) {
    const [A] = people(R), [ts] = R.pick(THINGS), [c1] = R.pick(COLORS);
    const pickAB = lo => { const b = R.pick([3, 4, 5, 6, 8, 10]); let a; do a = R.i(lo || 1, b - 1); while (gcd(a, b) !== 1); return [a, b]; };
    const kind = R.pick(d === 0 ? ['of'] : d === 1 ? ['left', 'add', 'of'] : ['whole', 'rest']);
    if (kind === 'of' || kind === 'left') {
      const [a, b] = pickAB(2), u = d === 0 ? R.i(2, 8) : R.i(3, 15), T = b * u, part = a * u, rest = T - part, left = kind === 'left';
      const text = left ? 'A ribbon is ' + B(T) + ' cm long. ' + A + ' cuts off ' + fr(a, b) + ' of it. How many centimeters of ribbon are left?' : A + ' has ' + B(T) + ' ' + ts + '. ' + fr(a, b) + ' of them are ' + c1 + '. How many ' + ts + ' are ' + c1 + '?';
      const ans = left ? rest : part, unit = left ? 'cm' : ts;
      return { text, ans, unit, howVis: bmSVG([{ lab: '', segs: eq(b, u).map((s, i) => Object.assign(s, { q: i >= a })) }], { brace: T }),
        how: ['Bar: ' + T + ' split into ' + b + ' equal parts. ' + a + ' ' + plural(a, 'part is', 'parts are') + (left ? ' cut off, ' + (b - a) + ' ' + plural(b - a, 'is', 'are') + ' left.' : ' ' + c1 + '.'), 'One part: ' + T + ' ÷ ' + b + ' = ' + u + '.', left ? 'Left: ' + (b - a) + ' × ' + u + ' = ' + B(rest) + ' cm.' : a + ' parts: ' + a + ' × ' + u + ' = ' + B(part) + ' ' + c1 + ' ' + ts + '.'],
        steps: [st('One part: ' + B(T + ' ÷ ' + b) + ' = ?', u), st((left ? (b - a) : a) + ' parts: ' + B((left ? b - a : a) + ' × ' + u) + ' = ?', ans)],
        traps: [tr(u, 's_fracstory', 'That is one part. You need ' + (left ? b - a : a) + ' parts.'), tr(left ? part : rest, 's_fracstory', left ? 'That is the part cut off. How much is left?' : 'That is the part that is not ' + c1 + '.'), tr(Number.isInteger(T / a) ? T / a : null, 'f_of', 'Divide by the bottom number (the number of equal parts).')] };
    }
    if (kind === 'add') {
      const [a, b] = pickAB(); let c, e; do { [c, e] = pickAB(); } while (e === b); const L = lcm(b, e), n = a * L / b + c * L / e, sb = R.chance(0.5) && a / b !== c / e;
      if (sb) { const [hi, lo] = a / b > c / e ? [[a, b], [c, e]] : [[c, e], [a, b]], dn = hi[0] * L / hi[1] - lo[0] * L / lo[1];
        return { text: A + ' walks ' + fr(hi[0], hi[1]) + ' of a mile to school and ' + fr(lo[0], lo[1]) + ' of a mile to the park. How much farther is the walk to school?', ans: F(dn, L), type: 'frac', unit: 'mile',
          how: ['Take away: ' + fr(hi[0], hi[1]) + ' ' + MINUS + ' ' + fr(lo[0], lo[1]) + '.', 'Common bottom ' + L + ': ' + fr(hi[0] * L / hi[1], L) + ' ' + MINUS + ' ' + fr(lo[0] * L / lo[1], L) + '.', '= ' + fr(dn, L) + (gcd(dn, L) > 1 ? ' = ' + fm(dn, L) : '') + '. The walk to school is ' + B(fm(dn, L)) + ' of a mile farther.'],
          steps: [st('What is the smallest common bottom for ' + hi[1] + ' and ' + lo[1] + '?', L), st(fr(hi[0], hi[1]) + ' = ' + fq('?', L) + '. What is the top?', hi[0] * L / hi[1]), st(fr(lo[0], lo[1]) + ' = ' + fq('?', L) + '. What is the top?', lo[0] * L / lo[1])],
          traps: [tr(F(Math.abs(hi[0] - lo[0]), Math.abs(hi[1] - lo[1]) || 1), 'f_addunlike', 'Take away tops only after the bottoms match. The bottom does not get taken away.')] };
      }
      return { text: A + ' walks ' + fr(a, b) + ' of a mile to the park, then ' + fr(c, e) + ' of a mile to school. How far does ' + A + ' walk in all?', ans: F(n, L), type: 'frac', unit: 'miles',
        how: ['Add: ' + fr(a, b) + ' + ' + fr(c, e) + '.', 'Common bottom ' + L + ': ' + fr(a * L / b, L) + ' + ' + fr(c * L / e, L) + '.', '= ' + fr(n, L) + (n > L || gcd(n, L) > 1 ? ' = ' + fm(n, L) : '') + '. ' + A + ' walks ' + B(fm(n, L)) + ' miles.'],
        steps: [st('What is the smallest common bottom for ' + b + ' and ' + e + '?', L), st(fr(a, b) + ' = ' + fq('?', L) + '. What is the top?', a * L / b), st(fr(c, e) + ' = ' + fq('?', L) + '. What is the top?', c * L / e)],
        traps: [tr(F(a + c, b + e), 'f_addunlike', 'Do not add the bottoms. Make the bottoms the same first.'), tr(F(a + c, L), 'f_equiv', 'When the bottom changes, the top changes too.')] };
    }
    if (kind === 'whole') {
      const [a, b] = pickAB(2), u = R.i(3, 12), P = a * u, W = b * u;
      const ctx = R.pick([['of the kids in a club play chess', 'kids', 'the club'], ['of the books on a shelf are comics', 'books', 'the shelf'], ['of the trees in a park are oaks', 'trees', 'the park']]);
      return { text: fr(a, b) + ' ' + ctx[0] + '. That is ' + B(P) + ' ' + ctx[1] + '. How many ' + ctx[1] + ' are there in ' + ctx[2] + ' in all?', ans: W, unit: ctx[1],
        howVis: bmSVG([{ lab: '', segs: eq(b, '?').map((s, i) => Object.assign(s, { q: i >= a })) }], { brace: '?' }),
        how: ['Bar: the whole is ' + b + ' equal parts. ' + a + ' ' + plural(a, 'part is', 'parts are') + ' ' + P + ' ' + ctx[1] + '.', 'One part: ' + P + ' ÷ ' + a + ' = ' + u + '.', 'The whole: ' + b + ' × ' + u + ' = ' + B(W) + ' ' + ctx[1] + '.'],
        steps: [st('One part: ' + B(P + ' ÷ ' + a) + ' = ?', u), st('All ' + b + ' parts: ' + B(b + ' × ' + u) + ' = ?', W)],
        traps: [tr(Number.isInteger(P * a / b) ? P * a / b : null, 's_fracstory', P + ' is only part of the whole, so the whole is bigger than ' + P + '.'), tr(u, 's_fracstory', 'That is one part. The whole is ' + b + ' parts.'), tr(P * b, 's_fracstory', P + ' is ' + a + ' parts, not 1 part. Find one part first.')] };
    }
    let a, b, c, e; [a, b] = pickAB(); do { [c, e] = pickAB(); } while (e === b);
    const k = R.i(1, 4), T = b * e * k * R.pick([1, 2]), x = T * a / b, r1 = T - x, y = r1 * c / e, r2 = r1 - y;
    if (!Number.isInteger(y) || T > 400 || r2 <= 0) return null;
    return { text: A + ' had ' + B('$' + T) + '. ' + A + ' spent ' + fr(a, b) + ' of it on a book, then ' + fr(c, e) + ' of the money that was left on lunch. How much money does ' + A + ' have now?', ans: r2 * 100, type: 'money', fmt: 'd',
      how: ['Book: ' + fr(a, b) + ' of $' + T + ' = $' + T + ' ÷ ' + b + ' × ' + a + ' = $' + x + '.', 'Left: $' + T + ' ' + MINUS + ' $' + x + ' = $' + r1 + '.', 'Lunch: ' + fr(c, e) + ' of $' + r1 + ' = $' + r1 + ' ÷ ' + e + ' × ' + c + ' = $' + y + '.', 'Now: $' + r1 + ' ' + MINUS + ' $' + y + ' = ' + B('$' + r2) + '.'],
      steps: [st('Book: ' + fr(a, b) + ' of $' + T + ' = ?', x * 100, { type: 'money', fmt: 'd' }), st('Money left after the book: ' + B('$' + T + ' ' + MINUS + ' $' + x) + ' = ?', r1 * 100, { type: 'money', fmt: 'd' }), st('Lunch: ' + fr(c, e) + ' of $' + r1 + ' = ?', y * 100, { type: 'money', fmt: 'd' }), st(B('$' + r1 + ' ' + MINUS + ' $' + y) + ' = ?', r2 * 100, { type: 'money', fmt: 'd' })],
      traps: [tr(Number.isInteger(T * c / e) && T - x - T * c / e > 0 ? (T - x - T * c / e) * 100 : null, 's_fracstory', 'Lunch is ' + fr(c, e) + ' of the money left after the book, not of all $' + T + '.'), tr(r1 * 100, 's_fracstory', 'That is after the book. ' + A + ' still buys lunch.'), tr(y * 100, 's_fracstory', 'That is what lunch cost. How much is left?')] };
  } },

{ id: 's_ratio', s: 'story', g: 6, title: 'Ratio stories with bars', pre: ['f_ratio'], paper: true,
  tip: 'Draw a ratio as equal units: 3 : 5 is 3 units and 5 units. Find what 1 unit is worth from what you know, then multiply.',
  gen(d, R) {
    const ctx = R.pick([['red', 'blue', 'marbles', ' in a jar', 1], ['cats', 'dogs', 'pets', ' at the shelter'], ['boys', 'girls', 'kids', ' in the choir'], ['apples', 'pears', 'pieces of fruit', ' in a box'], ['comics', 'novels', 'books', ' on a shelf'], ['sunny', 'rainy', 'days', ' this spring', 1]]);
    const [x, y, whole, place, adj] = ctx, all = whole + place, Lb = z => adj ? z + ' ' + whole : z;
    let a, b; do { a = R.i(1, 7); b = R.i(2, 9); } while (a === b || gcd(a, b) !== 1 || a + b > (d === 0 ? 8 : 13));
    const u = d === 0 ? R.i(2, 9) : R.i(4, 25), X = a * u, Y = b * u, T = X + Y;
    const units = (qx, qy) => bmSVG([{ lab: x, segs: eq(a, qx ? '?' : u).map(s => Object.assign(s, { q: qx })) }, { lab: y, segs: eq(b, qy ? '?' : u).map(s => Object.assign(s, { q: qy })) }], { max: Math.max(a, b, 5) });
    const intro = 'The ratio of ' + x + ' to ' + Lb(y) + place + ' is ' + B(a + ' : ' + b) + '. ';
    const kind = R.pick(d === 0 ? ['total'] : d === 1 ? ['one', 'diff', 'total'] : ['difftot', 'three', 'onetot']);
    if (kind === 'total') {
      const askX = R.chance(0.5), ans = askX ? X : Y, k = askX ? a : b, nmx = askX ? x : y;
      return { text: intro + 'There are ' + B(T) + ' ' + whole + ' in all. How many are ' + nmx + '?', ans, unit: whole,
        howVis: units(false, false),
        how: ['Bar: ' + x + ' ' + a + ' ' + plural(a, 'unit') + ', ' + y + ' ' + b + ' units, ' + (a + b) + ' units in all.', (a + b) + ' units = ' + T + ', so 1 unit = ' + T + ' ÷ ' + (a + b) + ' = ' + u + '.', cap(nmx) + ': ' + k + ' × ' + u + ' = ' + B(ans) + '.'],
        steps: [st('How many units in all?', a + b), st('1 unit: ' + B(T + ' ÷ ' + (a + b)) + ' = ?', u), st(B(k + ' × ' + u) + ' = ?', ans)],
        traps: [tr(u, 's_ratio', 'That is 1 unit. ' + cap(nmx) + ' is ' + k + ' units.'), tr(askX ? Y : X, 's_ratio', 'That is the ' + (askX ? y : x) + '. Check which part the question asks for.'), tr(Number.isInteger(T / k) ? T / k : null, 's_ratio', 'Split the total into ' + (a + b) + ' units, not ' + k + '.')] };
    }
    if (kind === 'one') {
      return { text: intro + 'There are ' + B(X) + ' ' + Lb(x) + '. How many ' + Lb(y) + ' are there?', ans: Y, unit: whole,
        howVis: units(false, false),
        how: ['Bar: ' + x + ' ' + a + ' ' + plural(a, 'unit') + ', ' + y + ' ' + b + ' units.', a + ' ' + plural(a, 'unit') + ' = ' + X + ', so 1 unit = ' + X + ' ÷ ' + a + ' = ' + u + '.', cap(y) + ': ' + b + ' × ' + u + ' = ' + B(Y) + '.'],
        steps: [st('1 unit: ' + B(X + ' ÷ ' + a) + ' = ?', u), st(B(b + ' × ' + u) + ' = ?', Y)],
        traps: [tr(X + b - a, 'f_ratio', 'A ratio compares by multiplying, not by adding the same amount.'), tr(X * b, 's_ratio', X + ' is ' + a + ' units. Find 1 unit first.'), tr(T, 's_ratio', 'That is everything. The question asks for the ' + y + ' only.')] };
    }
    if (kind === 'diff' || kind === 'difftot') {
      const [lo, hi] = a < b ? [[x, a, X], [y, b, Y]] : [[y, b, Y], [x, a, X]], D = hi[2] - lo[2], du = hi[1] - lo[1];
      if (du < 2) return null;
      const askLo = R.chance(0.5), ans = kind === 'difftot' ? T : askLo ? lo[2] : hi[2];
      const q = kind === 'difftot' ? 'How many ' + whole + ' are there in all?' : 'How many ' + Lb(askLo ? lo[0] : hi[0]) + ' are there?';
      return { text: intro + 'There are ' + B(D) + ' more ' + Lb(hi[0]) + ' than ' + lo[0] + '. ' + q, ans, unit: whole,
        howVis: units(false, false),
        how: ['Bar: ' + x + ' ' + a + ' ' + plural(a, 'unit') + ', ' + y + ' ' + b + ' units. The difference is ' + du + ' ' + plural(du, 'unit') + '.', du + ' ' + plural(du, 'unit') + ' = ' + D + ', so 1 unit = ' + D + ' ÷ ' + du + ' = ' + u + '.', kind === 'difftot' ? 'In all: ' + (a + b) + ' × ' + u + ' = ' + B(T) + '.' : cap(askLo ? lo[0] : hi[0]) + ': ' + (askLo ? lo[1] : hi[1]) + ' × ' + u + ' = ' + B(ans) + '.'],
        steps: [st('How many units bigger is the ' + hi[0] + ' bar?', du), st('1 unit: ' + B(D + ' ÷ ' + du) + ' = ?', u), st(B((kind === 'difftot' ? a + b : askLo ? lo[1] : hi[1]) + ' × ' + u) + ' = ?', ans)],
        traps: [tr(D * (kind === 'difftot' ? a + b : askLo ? lo[1] : hi[1]), 's_ratio', 'The difference is ' + du + ' units, not 1 unit. Find 1 unit first.'), tr(u, 's_ratio', 'That is 1 unit.'), tr(kind === 'difftot' ? D * 2 + lo[2] : null, 's_ratio', 'Use units: find 1 unit, then count all ' + (a + b) + ' units.')] };
    }
    if (kind === 'onetot') {
      return { text: intro + 'There are ' + B(Y) + ' ' + Lb(y) + '. How many ' + whole + ' are there in all?', ans: T, unit: whole,
        howVis: units(false, false),
        how: ['Bar: ' + x + ' ' + a + ' ' + plural(a, 'unit') + ', ' + y + ' ' + b + ' units, ' + (a + b) + ' units in all.', b + ' units = ' + Y + ', so 1 unit = ' + Y + ' ÷ ' + b + ' = ' + u + '.', 'In all: ' + (a + b) + ' × ' + u + ' = ' + B(T) + '.'],
        steps: [st('1 unit: ' + B(Y + ' ÷ ' + b) + ' = ?', u), st(B((a + b) + ' × ' + u) + ' = ?', T)],
        traps: [tr(X, 's_ratio', 'That is the ' + x + '. Add the ' + y + ' too.'), tr(Y + a, 'f_ratio', 'A ratio compares by multiplying: find 1 unit first.')] };
    }
    let c; do c = R.i(1, 5); while (c === a || c === b || a + b + c > 15);
    const third = R.pick(['green', 'yellow', 'white']), u3 = R.i(3, 12), T3 = (a + b + c) * u3, askK = R.pick([0, 1, 2]), ks = [a, b, c], ns = ['red', 'blue', third], ans = ks[askK] * u3;
    return { text: 'A jar has red, blue and ' + third + ' marbles in the ratio ' + B(a + ' : ' + b + ' : ' + c) + '. There are ' + B(T3) + ' marbles in all. How many are ' + ns[askK] + '?', ans, unit: 'marbles',
      howVis: bmSVG(ns.map((nn, i) => ({ lab: nn, segs: eq(ks[i], u3) })), { max: Math.max(a, b, c, 5) }),
      how: ['Bar: ' + a + ' + ' + b + ' + ' + c + ' = ' + (a + b + c) + ' units in all.', (a + b + c) + ' units = ' + T3 + ', so 1 unit = ' + T3 + ' ÷ ' + (a + b + c) + ' = ' + u3 + '.', cap(ns[askK]) + ': ' + ks[askK] + ' × ' + u3 + ' = ' + B(ans) + '.'],
      steps: [st('How many units in all?', a + b + c), st('1 unit: ' + B(T3 + ' ÷ ' + (a + b + c)) + ' = ?', u3), st(B(ks[askK] + ' × ' + u3) + ' = ?', ans)],
      traps: [tr(u3, 's_ratio', 'That is 1 unit. ' + cap(ns[askK]) + ' is ' + ks[askK] + ' units.'), tr(Number.isInteger(T3 / (ks[askK] + ks[(askK + 1) % 3])) ? T3 / (ks[askK] + ks[(askK + 1) % 3]) * ks[askK] : null, 's_ratio', 'Count all three colours: ' + (a + b + c) + ' units.')] };
  } },

{ id: 's_percent', s: 'story', g: 7, title: 'Percent stories', pre: ['f_pctchange'], paper: true,
  tip: 'Percent means out of 100. 25% off means you pay 75%. A tax or tip adds a percent of the price. To go back to the start, ask: what percent of the start is this?',
  gen(d, R) {
    const [A] = people(R), item = R.pick(['jacket', 'game', 'bike', 'pair of shoes', 'backpack', 'lamp']);
    const kind = R.pick(d === 0 ? ['off', 'part'] : d === 1 ? ['tip', 'off2', 'what'] : ['orig', 'change', 'offtax']);
    const M = (c, o) => money(c, o), D$ = v => fmtD(Math.round(v * 100)).replace(/\.00$/, '');
    if (kind === 'off' || kind === 'off2') {
      const p = kind === 'off' ? R.pick([10, 20, 25, 50]) : R.pick([15, 30, 35, 40]), P = kind === 'off' ? R.i(2, 30) * 4 : R.i(2, 12) * 20, disc = P * p / 100, sale = P - disc;
      return Object.assign(M(Math.round(sale * 100)), { text: 'A ' + item + ' costs ' + B('$' + P) + '. It is on sale for ' + B(p + '%') + ' off. What is the sale price?',
        how: ['Discount: ' + p + '% of $' + P + ' = ' + (p === 50 ? 'half of $' + P : p === 25 ? fr(1, 4) + ' of $' + P : p === 10 ? '$' + P + ' ÷ 10' : p % 10 === 0 ? (p / 10) + ' × 10% = ' + (p / 10) + ' × ' + D$(P / 10) : ((p - 5) / 10) + ' × 10% + 5% = ' + ((p - 5) / 10) + ' × ' + D$(P / 10) + ' + ' + D$(P / 20)) + ' = ' + D$(disc) + '.', 'Sale price: $' + P + ' ' + MINUS + ' ' + D$(disc) + ' = ' + B(D$(sale)) + '.', 'Check: ' + p + '% off means you pay ' + (100 - p) + '%, and ' + (100 - p) + '% of $' + P + ' = ' + D$(sale) + '.'],
        steps: (p === 25 || p === 50 ? [] : [st('10% of $' + P + ' = ?', P * 10, { type: 'money', fmt: 'd' })]).concat([st('Discount: ' + p + '% of $' + P + ' = ?', Math.round(disc * 100), { type: 'money', fmt: 'd' }), st('Sale price: ' + B('$' + P + ' ' + MINUS + ' ' + D$(disc)) + ' = ?', Math.round(sale * 100), { type: 'money', fmt: 'd' })]),
        traps: [tr(Math.round(disc * 100), 'f_discount', 'That is the discount, the money you save. The sale price is what you pay.'), tr(P > p ? (P - p) * 100 : null, 's_percent', p + '% off is not $' + p + ' off. Find ' + p + '% of $' + P + '.'), tr(Math.round((P + disc) * 100), 'f_discount', 'A sale takes money off the price.')] });
    }
    if (kind === 'part') {
      const p = R.pick([10, 20, 25, 30, 40, 50, 60, 75]), [pn, pd] = reduce(p, 100), N = pd * R.i(4, 30), ans = N * pn / pd;
      return { text: B(p + '%') + ' of the ' + B(N) + ' students at a school walk to school. How many students walk?', ans, unit: 'students',
        how: [p + '% = ' + fr(p, 100) + ' = ' + fr(pn, pd) + '.', fr(pn, pd) + ' of ' + N + ': ' + N + ' ÷ ' + pd + ' = ' + N / pd + (pn > 1 ? ', then × ' + pn + ' = ' + ans : '') + '.', B(ans) + ' students walk.'],
        steps: [st(p + '% is ' + fq(pn, '?') + '. What is the bottom number?', pd), st(B(N + ' ÷ ' + pd) + ' = ?', N / pd)].concat(pn > 1 ? [st(B((N / pd) + ' × ' + pn) + ' = ?', ans)] : []),
        traps: [tr(N - ans, 's_percent', 'That is the students who do not walk.'), tr(p, 's_percent', p + '% is a rate out of 100, not the number of students.'), tr(N / pd, 'f_pctof', 'That is ' + fr(1, pd) + ' of them. You need ' + fr(pn, pd) + '.')] };
    }
    if (kind === 'tip') {
      const p = R.pick([15, 20, 18]), Mc = p === 18 ? R.i(1, 9) * 50 : R.i(12, 90), tip = Mc * p / 100, tot = Mc + tip;
      const tl = p === 15 ? '10% of $' + Mc + ' = ' + D$(Mc / 10) + ', and 5% is half of that, ' + D$(Mc / 20) + '. Tip: ' + D$(tip) + '.' : p === 20 ? '10% of $' + Mc + ' = ' + D$(Mc / 10) + ', so 20% = ' + D$(tip) + '.' : '1% of $' + Mc + ' = ' + D$(Mc / 100) + ', so 18% = 18 × ' + D$(Mc / 100) + ' = ' + D$(tip) + '.';
      return Object.assign(M(Math.round(tot * 100)), { text: 'A family\'s dinner costs ' + B('$' + Mc) + '. They add a ' + B(p + '%') + ' tip. What do they pay in all?',
        how: ['Tip: ' + tl, 'Total: $' + Mc + ' + ' + D$(tip) + ' = ' + B(D$(tot)) + '.', 'Check: they pay ' + (100 + p) + '% of $' + Mc + '.'],
        steps: [st('The tip: ' + p + '% of $' + Mc + ' = ?', Math.round(tip * 100), { type: 'money', fmt: 'd' }), st('Total: ' + B('$' + Mc + ' + ' + D$(tip)) + ' = ?', Math.round(tot * 100), { type: 'money', fmt: 'd' })],
        traps: [tr(Math.round(tip * 100), 's_percent', 'That is the tip. Add it to the price of the dinner.'), tr((Mc + p) * 100, 's_percent', 'A ' + p + '% tip is not $' + p + '. Find ' + p + '% of $' + Mc + '.'), tr(Math.round((Mc - tip) * 100), 'f_tip', 'A tip is added on, not taken off.')] });
    }
    if (kind === 'what') {
      const N = R.pick([20, 25, 50]), x = R.i(Math.ceil(N / 3), N - 1), k = 100 / N, pc = x * k;
      return { text: A + ' got ' + B(x) + ' out of ' + B(N) + ' questions right on a quiz. What percent is that?', ans: pc, unit: '%',
        how: [x + ' out of ' + N + ' = ' + fr(x, N) + '.', 'Make the bottom 100: × ' + k + ' on top and bottom gives ' + fr(pc, 100) + '.', fr(pc, 100) + ' = ' + B(pc + '%') + '.'],
        steps: [st('What number times ' + N + ' makes 100?', k), st(B(x + ' × ' + k) + ' = ?', pc)],
        traps: [tr(x, 's_percent', 'Percent means out of 100, and the quiz is out of ' + N + '. Scale it up.'), tr(100 - pc, 's_percent', 'That is the percent wrong.'), tr(N - x, 's_percent', 'That is how many were wrong.')] };
    }
    if (kind === 'orig') {
      const p = R.pick([10, 20, 25, 40, 50]), [fn, fd] = reduce(100 - p, 100), O = fd * R.i(2, 16) * (fd < 5 ? 5 : 1), S = O * fn / fd;
      return Object.assign(M(O * 100), { text: 'After ' + B(p + '%') + ' off, a ' + item + ' costs ' + B('$' + S) + '. What was the price before the sale?',
        how: [p + '% off means $' + S + ' is ' + (100 - p) + '% of the old price, and ' + (100 - p) + '% = ' + fr(fn, fd) + '.', fn + ' ' + plural(fn, 'part') + ' = $' + S + ', so 1 part = $' + S + ' ÷ ' + fn + ' = $' + S / fn + '.', 'Old price: ' + fd + ' × $' + S / fn + ' = ' + B('$' + O) + '.'],
        steps: [st('$' + S + ' is what percent of the old price?', 100 - p, { unit: '%' }), st('1 part: ' + B('$' + S + ' ÷ ' + fn) + ' = ?', S / fn * 100, { type: 'money', fmt: 'd' }), st(B(fd + ' × $' + S / fn) + ' = ?', O * 100, { type: 'money', fmt: 'd' })],
        traps: [tr(Math.round(S * (100 + p)), 'f_findwhole', 'The ' + p + '% came off the old price, not the sale price. $' + S + ' is ' + (100 - p) + '% of the old price.'), tr((S + p) * 100, 's_percent', p + '% is not $' + p + '.'), tr(Math.round(S * 100 * 100 / p), 'f_findwhole', '$' + S + ' is what was paid, the ' + (100 - p) + '%, not the ' + p + '%.')] });
    }
    if (kind === 'change') {
      const a = R.pick([20, 25, 40, 50, 80]), pcs = [5, 10, 20, 25, 40, 50, 60, 75].filter(q => a * q % 100 === 0), pc = R.pick(pcs), up = R.chance(0.6), c = a * pc / 100, b = up ? a + c : a - c;
      const ctx = R.pick([['A plant grew from', 'cm to', 'cm'], ['A class grew from', 'kids to', 'kids'], ['The price of a ticket went from $', 'to $', 'dollars']]);
      const txt = ctx[0].endsWith('$') ? ctx[0] + B(a) + ' ' + ctx[1] + B(b) : ctx[0] + ' ' + B(a) + ' ' + ctx[1] + ' ' + B(b) + ' ' + ctx[2];
      const lab = up ? 'increase' : 'decrease';
      if (!up && ctx[0].startsWith('A plant')) return null;
      return { text: txt.replace(' grew ', up ? ' grew ' : ' went ') + '. What is the percent ' + lab + '?', ans: pc, unit: '%',
        how: ['Change: ' + (up ? mi(b, a) : mi(a, b)) + ' = ' + c + '.', 'Compare with the start: ' + fr(c, a) + ' = ' + fm(c, a) + '.', fr(c, a) + ' = ' + fr(pc, 100) + ' = ' + B(pc + '%') + ' ' + lab + '.'],
        steps: [st('How much did it change by?', c), st('Change ÷ start: ' + B(c + ' ÷ ' + a) + ' = ? (as a decimal)', c / a)],
        traps: [tr(+(c / b * 100).toFixed(2), 'f_pctchange', 'Compare the change with the start, ' + a + ', not the end.'), tr(c, 's_percent', 'That is the change. Write it as a percent of the start.')] };
    }
    const P = R.i(2, 10) * 20, p = R.pick([20, 25, 50]), t = R.pick([5, 8, 10]), S = P * (100 - p) / 100, tax = S * t / 100, tot = S + tax;
    return Object.assign(M(Math.round(tot * 100)), { text: 'A ' + item + ' costs ' + B('$' + P) + '. It is ' + B(p + '%') + ' off, and then ' + B(t + '%') + ' sales tax is added to the sale price. What is the final price?',
      how: ['Sale: ' + (100 - p) + '% of $' + P + ' = ' + D$(S) + '.', 'Tax: ' + t + '% of ' + D$(S) + ' = ' + D$(tax) + '.', 'Final: ' + D$(S) + ' + ' + D$(tax) + ' = ' + B(D$(tot)) + '.'],
      steps: [st('Sale price: ' + (100 - p) + '% of $' + P + ' = ?', Math.round(S * 100), { type: 'money', fmt: 'd' }), st('Tax: ' + t + '% of ' + D$(S) + ' = ?', Math.round(tax * 100), { type: 'money', fmt: 'd' }), st(B(D$(S) + ' + ' + D$(tax)) + ' = ?', Math.round(tot * 100), { type: 'money', fmt: 'd' })],
      traps: [tr(Math.round(P * (100 - p + t)), 's_percent', 'The tax is a percent of the sale price, not of the old price.'), tr(Math.round(S * 100), 's_percent', 'That is the sale price. Add the tax.')
] });
  } },
{ id: 's_equation', s: 'story', g: 7, title: 'Write an equation, then solve', pre: ['x_twostep'], paper: true,
  tip: 'Let a letter stand for what you want. Write the story as an equation, like 4x + 6 = 38. Undo the adding first, then the multiplying.',
  gen(d, R) {
    const [A, Bn] = people(R), [ts] = R.pick(THINGS);
    const kind = R.pick(d === 0 ? ['packs', 'save'] : d === 1 ? ['gym', 'snack', 'spend'] : ['perim', 'consec', 'ages']);
    const solve = (p, q, r, xname, unit, money$) => {   /* px + q = r */
      const x = (r - q) / p, dl = money$ ? '$' : '', ul = unit ? ' ' + unit : '';
      return { x, lines: [(q >= 0 ? 'Take away ' + q : 'Add ' + (-q)) + ' from both sides: ' + (p === 1 ? 'x' : p + 'x') + ' = ' + nm(r - q) + '.', 'Divide both sides by ' + p + ': x = ' + B(dl + nm(x)) + ul + '.'],
        steps: [st('Undo the ' + (q >= 0 ? '+ ' + q : MINUS + ' ' + (-q)) + ': ' + p + 'x = ?', r - q), st('x = ?', x)] };
    };
    let text, let1, eqn, p, q, r, unit = '', isMoney = false, extra = [], trapsX = [];
    if (kind === 'packs') {
      p = R.i(2, 6); const x = R.i(4, 12); q = R.i(2, 9); r = p * x + q;
      text = A + ' has ' + B(p) + ' packs of ' + ts + ' and ' + B(q) + ' loose ' + ts + '. That is ' + B(r) + ' ' + ts + ' in all. Every pack has the same number. How many ' + ts + ' are in each pack?';
      let1 = 'Let x = the number of ' + ts + ' in one pack.'; eqn = p + 'x + ' + q + ' = ' + r; unit = ts;
    } else if (kind === 'save') {
      p = R.i(3, 9); const x = R.i(3, 12); q = R.i(5, 40); r = p * x + q; isMoney = true;
      text = A + ' has ' + B('$' + q) + ' and saves ' + B('$' + p) + ' every week. After how many weeks will ' + A + ' have ' + B('$' + r) + '?';
      let1 = 'Let x = the number of weeks.'; eqn = p + 'x + ' + q + ' = ' + r; unit = 'weeks'; isMoney = false;
    } else if (kind === 'gym') {
      p = R.i(6, 15); const x = R.i(4, 12); q = R.i(10, 40); r = p * x + q;
      text = 'A gym charges a ' + B('$' + q) + ' sign-up fee plus ' + B('$' + p) + ' for each class. ' + A + ' paid ' + B('$' + r) + ' in all. How many classes did ' + A + ' take?';
      let1 = 'Let x = the number of classes.'; eqn = p + 'x + ' + q + ' = ' + r; unit = 'classes';
    } else if (kind === 'spend') {
      p = R.i(2, 6); const x = R.i(4, 15), L = R.i(2, 20); r = L; q = p * x + L;
      text = A + ' had ' + B('$' + q) + '. ' + A + ' bought ' + B(p) + ' books that all cost the same and has ' + B('$' + L) + ' left. How much did each book cost?';
      const xx = (q - L) / p;
      return Object.assign(money(xx * 100), { text,
        how: ['Let x = the cost of one book, in dollars.', 'Equation: ' + q + ' ' + MINUS + ' ' + p + 'x = ' + L + '.', 'Add ' + p + 'x and take away ' + L + ' on both sides: ' + p + 'x = ' + (q - L) + '.', 'Divide both sides by ' + p + ': x = ' + B('$' + xx) + '.'],
        steps: [st('Money spent on books: ' + B('$' + q + ' ' + MINUS + ' $' + L) + ' = ?', (q - L) * 100, { type: 'money', fmt: 'd' }), st(B(p + 'x = ' + (q - L)) + '. x = ?', xx * 100, { type: 'money', fmt: 'd' })],
        traps: [tr((q - L) * 100, 'x_twostep', 'That is the cost of all ' + p + ' books. Divide to find one.'), tr(Number.isInteger((q + L) / p) ? (q + L) / p * 100 : null, 'x_twostep', 'The $' + L + ' was left over, so take it away from $' + q + '.'), tr(Number.isInteger(q / p) ? (q / p - L) * 100 : null, 'x_twostep', 'Undo the adding and taking away first, then divide.')] });
    } else if (kind === 'snack') {
      p = R.i(2, 6); const s = R.i(2, 6), x = R.i(5, 14), tot = p * (x + s);
      text = B(p) + ' friends each buy a movie ticket and a ' + B('$' + s) + ' snack. Together they spend ' + B('$' + tot) + '. How much is one ticket?';
      return Object.assign(money(x * 100), { text,
        how: ['Let x = the price of one ticket, in dollars.', 'Equation: ' + p + '(x + ' + s + ') = ' + tot + '.', 'Divide both sides by ' + p + ': x + ' + s + ' = ' + tot / p + '.', 'Take away ' + s + ': x = ' + B('$' + x) + '.'],
        steps: [st('What does one friend spend? ' + B(tot + ' ÷ ' + p) + ' = ?', tot / p * 100, { type: 'money', fmt: 'd' }), st(B('x + ' + s + ' = ' + tot / p) + '. x = ?', x * 100, { type: 'money', fmt: 'd' })],
        traps: [tr(tot / p * 100, 'x_twostep', 'That is a ticket plus a snack. Take the snack away.'), tr(Number.isInteger((tot - s) / p) ? (tot - s) / p * 100 : null, 'x_distribute', 'Every friend buys a snack: that is ' + p + ' snacks, ' + p + ' × $' + s + '.'), tr((tot - s) * 100, 'x_twostep', 'Share the total among ' + p + ' friends.')] });
    } else if (kind === 'perim') {
      const w = R.i(3, 15), k = R.i(1, 9), P = 6 * w + 2 * k;
      return { text: 'A rectangle\'s length is ' + B(k) + ' cm more than twice its width. Its perimeter is ' + B(P) + ' cm. What is the width?', ans: w, unit: 'cm',
        how: ['Let w = the width. Then the length is 2w + ' + k + '.', 'Perimeter: 2(w + 2w + ' + k + ') = ' + P + ', so 6w + ' + 2 * k + ' = ' + P + '.', 'Take away ' + 2 * k + ': 6w = ' + (P - 2 * k) + '.', 'Divide by 6: w = ' + B(w) + ' cm.'],
        steps: [st('Combine: 2(w + 2w + ' + k + ') = ?w + ' + 2 * k + '. What number goes before w?', 6), st(B('6w = ' + (P - 2 * k)) + '. w = ?', w)],
        traps: [tr(Number.isInteger((P - k) / 3) ? (P - k) / 3 : null, 'g_perim', 'Perimeter goes all the way round: two widths and two lengths.'), tr((P - 2 * k) / 3, 'x_combine', 'w + 2w is 3w, and there are two of each side: 6w.'), tr(2 * w + k, 's_equation', 'That is the length. The question asks for the width.')] };
    } else if (kind === 'consec') {
      const n0 = R.i(8, 80), S = 3 * n0 + 3, even = R.chance(0.4), m0 = 2 * R.i(5, 40), S2 = 3 * m0 + 6;
      if (even) return { text: 'Three even numbers in a row add up to ' + B(S2) + '. What is the smallest of them?', ans: m0,
        how: ['Let n = the smallest. The next even numbers are n + 2 and n + 4.', 'n + (n + 2) + (n + 4) = ' + S2 + ', so 3n + 6 = ' + S2 + '.', 'Take away 6: 3n = ' + (S2 - 6) + '.', 'Divide by 3: n = ' + B(m0) + '. (Check: ' + m0 + ' + ' + (m0 + 2) + ' + ' + (m0 + 4) + ' = ' + S2 + '.)'],
        steps: [st(B('3n + 6 = ' + S2) + '. 3n = ?', S2 - 6), st('n = ?', m0)],
        traps: [tr(S2 / 3, 's_equation', 'That is the middle number. The question asks for the smallest.'), tr((S2 - 3) / 3, 's_equation', 'Even numbers in a row go up by 2: n, n + 2, n + 4.')] };
      return { text: 'Three whole numbers in a row add up to ' + B(S) + '. What is the smallest of them?', ans: n0,
        how: ['Let n = the smallest. The next two are n + 1 and n + 2.', 'n + (n + 1) + (n + 2) = ' + S + ', so 3n + 3 = ' + S + '.', 'Take away 3: 3n = ' + (S - 3) + '.', 'Divide by 3: n = ' + B(n0) + '. (Check: ' + n0 + ' + ' + (n0 + 1) + ' + ' + (n0 + 2) + ' = ' + S + '.)'],
        steps: [st(B('3n + 3 = ' + S) + '. 3n = ?', S - 3), st('n = ?', n0)],
        traps: [tr(S / 3, 's_equation', 'That is the middle number. The question asks for the smallest.'), tr(n0 + 2, 's_equation', 'That is the biggest.')] };
    } else {
      const x = R.i(5, 40), k = R.i(2, 15), S = 2 * x + k;
      return { text: A + ' is ' + B(k) + ' years older than ' + Bn + '. Their ages add up to ' + B(S) + '. How old is ' + Bn + '?', ans: x, unit: 'years old',
        how: ['Let x = ' + Bn + '\'s age. Then ' + A + ' is x + ' + k + '.', 'x + (x + ' + k + ') = ' + S + ', so 2x + ' + k + ' = ' + S + '.', 'Take away ' + k + ': 2x = ' + (S - k) + '.', 'Divide by 2: x = ' + B(x) + '. (' + A + ' is ' + (x + k) + '.)'],
        steps: [st(B('2x + ' + k + ' = ' + S) + '. 2x = ?', S - k), st('x = ?', x)],
        traps: [tr(x + k, 's_equation', 'That is ' + A + '\'s age. The question asks for ' + Bn + '.'), tr(S - k, 'x_twostep', 'That is 2x. Divide by 2.'), tr(S / 2, 's_equation', 'They are not the same age. Write x and x + ' + k + '.')] };
    }
    const sv = solve(p, q, r);
    trapsX = [tr(r - q, 'x_twostep', 'That is ' + p + 'x. Divide by ' + p + ' to find x.'), tr(r / p - q > 0 ? +(r / p - q).toFixed(2) : null, 'x_twostep', 'Undo the + ' + q + ' first, then divide.'), tr(Number.isInteger((r + q) / p) ? (r + q) / p : null, 'n_intadd', 'Undo + ' + q + ' by taking ' + q + ' away.')];
    return { text, ans: sv.x, unit, how: [let1, 'Equation: ' + eqn + '.'].concat(sv.lines), steps: sv.steps, traps: trapsX };
  } },

{ id: 's_rate', s: 'story', g: 8, title: 'Rate stories', pre: ['x_rate'], paper: true,
  tip: 'Distance = speed × time. Toward each other, the speeds add. Catching up, the gap closes at the difference of the speeds. Working together, add the parts of the job done each hour.',
  gen(d, R) {
    const [A, Bn] = people(R);
    const kind = R.pick(d === 0 ? ['dist', 'time', 'speed'] : d === 1 ? ['toward', 'catch'] : ['work', 'catch2', 'toward']);
    if (kind === 'dist' || kind === 'time' || kind === 'speed') {
      const v = R.pick([['A train', 'km/h', 'km', [60, 70, 80, 90, 120]], ['A cyclist', 'km/h', 'km', [12, 14, 16, 18, 20]], ['A car', 'miles per hour', 'miles', [40, 50, 55, 60, 65]]]);
      const sp = R.pick(v[3]), t = R.pick([2, 3, 4, 5, 1.5, 2.5, 0.5]), D = sp * t;
      if (!Number.isInteger(D)) return null;
      if (kind === 'dist') return { text: v[0] + ' goes ' + B(sp + ' ' + v[1]) + ' for ' + B(nm(t) + ' hours') + '. How far is that?', ans: D, unit: v[2],
        how: ['distance = speed × time', 'd = ' + sp + ' × ' + nm(t), 'd = ' + B(nm(D)) + ' ' + v[2]],
        steps: [st(B(sp + ' × ' + nm(t)) + ' = ?', D)],
        traps: [tr(sp + t, 'x_rate', 'Each hour adds another ' + sp + ' ' + v[2] + ': multiply.'), tr(Number.isInteger(sp / t) ? sp / t : null, 'x_rate', 'Distance is speed times time.')] };
      if (kind === 'time') return { text: v[0] + ' goes ' + B(nm(D) + ' ' + v[2]) + ' at ' + B(sp + ' ' + v[1]) + '. How many hours does it take?', ans: t, unit: 'hours',
        how: ['distance = speed × time, so time = distance ÷ speed', 't = ' + nm(D) + ' ÷ ' + sp, 't = ' + B(nm(t)) + ' hours'],
        steps: [st(B(nm(D) + ' ÷ ' + sp) + ' = ?', t)],
        traps: [tr(D * sp, 'x_rate', 'Time is distance divided by speed.'), tr(D - sp, 'x_rate', 'How many hours of ' + sp + ' ' + v[2] + ' make ' + D + '? Divide.')] };
      return { text: v[0] + ' goes ' + B(nm(D) + ' ' + v[2]) + ' in ' + B(nm(t) + ' hours') + '. What is the speed?', ans: sp, unit: v[1],
        how: ['distance = speed × time, so speed = distance ÷ time', 's = ' + nm(D) + ' ÷ ' + nm(t), 's = ' + B(sp) + ' ' + v[1]],
        steps: [st(B(nm(D) + ' ÷ ' + nm(t)) + ' = ?', sp)],
        traps: [tr(D * t, 'x_rate', 'Speed is distance divided by time.'), tr(D - t, 'x_rate', 'How fast? Share the distance out over the hours: divide.')] };
    }
    if (kind === 'toward') {
      const r1 = R.i(4, 14) * 5, r2 = R.i(4, 14) * 5, t = R.pick(d === 2 ? [1.5, 2.5, 3.5, 0.75, 1.25] : [1, 2, 3, 4, 1.5, 2.5]), D = (r1 + r2) * t;
      if (!Number.isInteger(D) || r1 === r2) return null;
      return { text: 'Two towns are ' + B(D + ' km') + ' apart. ' + A + ' and ' + Bn + ' start at the same time and drive toward each other. ' + A + ' drives at ' + B(r1 + ' km/h') + '. ' + Bn + ' drives at ' + B(r2 + ' km/h') + '. How many hours until they meet?', ans: t, unit: 'hours',
        how: ['Toward each other, the gap closes at ' + r1 + ' + ' + r2 + ' = ' + (r1 + r2) + ' km each hour.', 'time = distance ÷ closing speed = ' + D + ' ÷ ' + (r1 + r2), 'time = ' + B(nm(t)) + ' hours'],
        steps: [st('How many km does the gap close each hour?', r1 + r2), st(B(D + ' ÷ ' + (r1 + r2)) + ' = ?', t)],
        traps: [tr(+(D / Math.abs(r1 - r2)).toFixed(4), 's_rate', 'Driving toward each other, both close the gap: add the speeds.'), tr(+(D / r1).toFixed(4), 's_rate', 'Both cars are moving. Use both speeds.'), tr(+(D / (r1 + r2) * 2).toFixed(4), 's_rate', 'Each hour the gap shrinks by both speeds together.')] };
    }
    if (kind === 'catch' || kind === 'catch2') {
      const r1 = R.i(3, 8), g = R.i(1, 4), r2 = r1 + g, h = kind === 'catch' ? R.i(1, 3) : R.pick([0.5, 1.5, 2]), hs = r1 * h, t = hs / g;
      if (!Number.isInteger(hs) || !Number.isInteger(t * 4) || t > 6) return null;
      const walk = r2 <= 5, v = walk ? 'walks' : 'bikes', u = 'miles per hour';
      return { text: A + ' ' + v + ' along a trail at ' + B(r1 + ' ' + u) + '. ' + B(nm(h) + ' ' + plural(h, 'hour')) + ' later, ' + Bn + ' starts from the same place at ' + B(r2 + ' ' + u) + '. How many hours does it take ' + Bn + ' to catch up?', ans: t, unit: 'hours',
        how: ['Head start: ' + A + ' goes ' + r1 + ' × ' + nm(h) + ' = ' + nm(hs) + ' miles before ' + Bn + ' starts.', Bn + ' closes the gap by ' + mi(r2, r1) + ' = ' + g + ' ' + plural(g, 'mile') + ' each hour.', 'time = ' + nm(hs) + ' ÷ ' + g + ' = ' + B(nm(t)) + ' hours'],
        steps: [st('Head start: ' + B(r1 + ' × ' + nm(h)) + ' = ?', hs), st('Gap closed each hour: ' + B(mi(r2, r1)) + ' = ?', g), st(B(nm(hs) + ' ÷ ' + g) + ' = ?', t)],
        traps: [tr(+(hs / (r1 + r2)).toFixed(4), 's_rate', 'They go the same way, so ' + Bn + ' only gains the difference of the speeds.'), tr(t + h, 's_rate', 'Count the hours after ' + Bn + ' starts.'), tr(+(hs / r2).toFixed(4), 's_rate', A + ' keeps moving too. Use the difference of the speeds.')] };
    }
    const pair = R.pick([[2, 3], [3, 6], [4, 12], [6, 12], [2, 6], [3, 4], [4, 6], [10, 15], [12, 24], [5, 20], [6, 9], [8, 24], [20, 30], [6, 3], [4, 4]]), [a, b] = R.chance(0.5) ? pair : [pair[1], pair[0]];
    const L = lcm(a, b), n = L / a + L / b, [tn, td] = reduce(L, n);
    return { text: A + ' can paint a fence in ' + B(a + ' hours') + '. ' + Bn + ' can paint the same fence in ' + B(b + ' hours') + '. How long will it take if they paint it together?', ans: F(tn, td), type: 'frac', unit: 'hours',
      how: ['In 1 hour ' + A + ' paints ' + fr(1, a) + ' of the fence and ' + Bn + ' paints ' + fr(1, b) + '.', 'Together: ' + fr(1, a) + ' + ' + fr(1, b) + ' = ' + fr(L / a, L) + ' + ' + fr(L / b, L) + ' = ' + fm(n, L) + ' of the fence each hour.', 'Time for 1 whole fence: 1 ÷ ' + fm(n, L) + ' = ' + B(fm(tn, td)) + ' hours' + (td > 1 && Number.isInteger(tn / td * 100) ? ' (' + nm(tn / td) + ' hours)' : '') + '.'],
      steps: [st('Together, what part of the fence do they paint in 1 hour?', F(n, L), { type: 'frac' }), st('How many hours for the whole fence? 1 ÷ ' + fm(n, L) + ' = ?', F(tn, td), { type: 'frac' })],
      traps: [tr(F(a + b, 2), 's_rate', 'Together they are faster than either one alone, so the time is less than ' + Math.min(a, b) + ' hours.'), tr(F(a + b, 1), 's_rate', 'Working together takes less time, not more.'), tr(F(n, L), 's_rate', 'That is the part painted in 1 hour. Flip it to get the time.')] };
  } },

{ id: 's_system', s: 'story', g: 9, title: 'Two-unknown stories', pre: ['x_system'], paper: true,
  tip: 'Two unknowns need two equations. Name both, write one equation for each fact, then add or subtract the equations to cancel one letter.',
  gen(d, R) {
    const [A, Bn] = people(R), [ts] = R.pick(THINGS);
    const kind = R.pick(d === 0 ? ['sumdiff'] : d === 1 ? ['tickets', 'sumdiff2'] : ['coins', 'boat', 'tickets']);
    if (kind === 'sumdiff' || kind === 'sumdiff2') {
      const b = kind === 'sumdiff' ? R.i(8, 40) : R.i(40, 300), D = kind === 'sumdiff' ? R.i(2, 20) : R.i(15, 120), a = b + D, S = a + b, askA = R.chance(0.5), ans = askA ? a : b;
      return { text: A + ' and ' + Bn + ' have ' + B(S) + ' ' + ts + ' together. ' + A + ' has ' + B(D) + ' more than ' + Bn + '. How many ' + ts + ' does ' + (askA ? A : Bn) + ' have?', ans, unit: ts,
        how: ['Let a = ' + A + '\'s ' + ts + ' and b = ' + Bn + '\'s.', 'a + b = ' + S, 'a ' + MINUS + ' b = ' + D, askA ? 'Add the equations: 2a = ' + (S + D) + ', so a = ' + B(a) + '.' : 'Take the second from the first: 2b = ' + (S - D) + ', so b = ' + B(b) + '.'],
        steps: [st(askA ? 'Add the equations: 2a = ?' : 'Take away the equations: 2b = ?', askA ? S + D : S - D), st((askA ? 'a' : 'b') + ' = ?', ans)],
        traps: [tr(S / 2, 's_system', 'They do not have the same number: ' + A + ' has ' + D + ' more.'), tr(askA ? S + D : S - D, 'x_system', 'That is 2' + (askA ? 'a' : 'b') + '. Divide by 2.'), tr(askA ? b : a, 's_system', 'That is ' + (askA ? Bn : A) + '\'s number. Check who the question asks about.')] };
    }
    if (kind === 'tickets') {
      const q = R.i(3, 8), p = q + R.i(2, 7), n = d === 2 ? R.i(40, 120) : R.i(12, 40), a = R.i(3, n - 3), c = n - a, T = p * a + q * c;
      return { text: 'Adult tickets cost ' + B('$' + p) + ' and child tickets cost ' + B('$' + q) + '. A show sold ' + B(n) + ' tickets for ' + B('$' + nm(T)) + '. How many adult tickets were sold?', ans: a, unit: 'adult tickets',
        how: ['Let a = adult tickets and c = child tickets.', 'a + c = ' + n, p + 'a + ' + q + 'c = ' + nm(T), 'Times the first by ' + q + ': ' + q + 'a + ' + q + 'c = ' + nm(q * n) + '. Take it away from the second: ' + (p - q) + 'a = ' + nm(T - q * n) + '.', 'a = ' + nm(T - q * n) + ' ÷ ' + (p - q) + ' = ' + B(a) + ' adult tickets.'],
        steps: [st('If all ' + n + ' were child tickets, what would they cost? ' + B(q + ' × ' + n) + ' = ?', q * n), st('The extra money: ' + B(mi(T, q * n)) + ' = ?', T - q * n), st('Each adult ticket adds $' + (p - q) + '. ' + B(nm(T - q * n) + ' ÷ ' + (p - q)) + ' = ?', a)],
        traps: [tr(c, 's_system', 'That is the child tickets. The question asks for adult tickets.'), tr(T - q * n, 'x_system', 'That is ' + (p - q) + 'a. Divide by ' + (p - q) + '.'), tr(Number.isInteger(T / (p + q)) ? T / (p + q) : null, 's_system', 'Write two equations: one for the number of tickets, one for the money.')] };
    }
    if (kind === 'coins') {
      const n = R.i(12, 40), qn = R.i(2, n - 2), dn = n - qn, V = 25 * qn + 10 * dn;
      return { text: A + ' has ' + B(n) + ' coins, all dimes and quarters. They are worth ' + B(fmtD(V)) + '. How many quarters does ' + A + ' have?', ans: qn, unit: 'quarters',
        how: ['Let d = dimes and q = quarters. Work in cents.', 'd + q = ' + n, '10d + 25q = ' + V, 'Times the first by 10: 10d + 10q = ' + 10 * n + '. Take it away from the second: 15q = ' + (V - 10 * n) + '.', 'q = ' + (V - 10 * n) + ' ÷ 15 = ' + B(qn) + ' quarters.'],
        steps: [st('If all ' + n + ' were dimes, how many cents would they be worth?', 10 * n), st('Extra cents: ' + B(mi(V, 10 * n)) + ' = ?', V - 10 * n), st('Each quarter adds 15 cents. ' + B((V - 10 * n) + ' ÷ 15') + ' = ?', qn)],
        traps: [tr(dn, 's_system', 'That is the dimes. The question asks for quarters.'), tr(V - 10 * n, 'x_system', 'That is 15q. Divide by 15.'), tr(Math.floor(V / 25), 's_system', 'Not all the coins are quarters. Use both equations.')] };
    }
    const bs = R.i(6, 20), c = R.i(1, 5), t1 = R.pick([1, 2, 3]), dd = (bs + c) * t1, t2 = dd / (bs - c), askC = R.chance(0.5);
    if (!Number.isInteger(t2 * 2) || bs - c < 2) return null;
    return { text: 'A boat goes ' + B(dd + ' km') + ' down a river in ' + B(t1 + ' ' + plural(t1, 'hour')) + '. Coming back up the river against the current, the same trip takes ' + B(nm(t2) + ' hours') + '. What is the speed of the ' + (askC ? 'current' : 'boat in still water') + '?', ans: askC ? c : bs, unit: 'km/h',
      how: ['Let b = the boat\'s speed in still water and c = the current, in km/h.', 'Down: b + c = ' + dd + ' ÷ ' + t1 + ' = ' + (bs + c), 'Up: b ' + MINUS + ' c = ' + dd + ' ÷ ' + nm(t2) + ' = ' + (bs - c), askC ? 'Take away the equations: 2c = ' + 2 * c + ', so c = ' + B(c) + ' km/h.' : 'Add the equations: 2b = ' + 2 * bs + ', so b = ' + B(bs) + ' km/h.'],
      steps: [st('Speed going down: ' + B(dd + ' ÷ ' + t1) + ' = ?', bs + c), st('Speed going up: ' + B(dd + ' ÷ ' + nm(t2)) + ' = ?', bs - c), st((askC ? 'c = (' + (bs + c) + ' ' + MINUS + ' ' + (bs - c) + ') ÷ 2' : 'b = (' + (bs + c) + ' + ' + (bs - c) + ') ÷ 2') + ' = ?', askC ? c : bs)],
      traps: [tr(askC ? 2 * c : 2 * bs, 'x_system', 'That is 2' + (askC ? 'c' : 'b') + '. Divide by 2.'), tr(askC ? bs : c, 's_system', 'That is the ' + (askC ? 'boat' : 'current') + '. Check which speed is asked for.'), tr(bs + c, 's_system', 'That is the speed going down, boat and current together.')] };
  } },
/* =================== Written methods: adding and taking away =================== */
{ id: 'a_coladd', s: 'add', g: 2, title: 'Column adding', pre: ['a_regroup'], paper: true,
  tip: 'Line up the places. Add the ones first. If the ones make 10 or more, write the ones digit and carry the ten to the top of the tens column.',
  gen(d, R) {
    const nums = genAdd(R, d); if (!nums) return null;
    const cols = addCols(nums), ans = sum(nums), L = cols.length;
    const how = cols.map((c, i) => addLine(c, i === L - 1)); how[L - 1] += ' The answer is ' + B(nm(ans)) + '.';
    return { text: 'Add in columns: ' + B(nums.join(' + ')) + '.', ans, vis: stackHTML(nums, '+'), howVis: stackHTML(nums, '+', { carry: carryRow(cols), ans }),
      how, steps: cols.map(c => st(cap(PV[c.i]) + ': ' + B((c.c ? c.c + ' + ' : '') + c.ds.join(' + ')) + ' = ?', c.s)),
      traps: [tr(wrongNoCarry(nums), 'a_regroup', 'A column made 10 or more. Write the ones digit and carry the ten to the next column.'), tr(wroteSum(nums), 'a_regroup', 'Only one digit fits in each place. Write the ones digit and carry the rest.'), nums.length === 2 && String(nums[1]).length < String(nums[0]).length ? tr(nums[0] + nums[1] * 10, 'n_place', 'Line up the ones under the ones before you add.') : null] };
  } },
{ id: 'a_colsub', s: 'add', g: 3, title: 'Column taking away', pre: ['a_borrow'], paper: true,
  tip: 'Line up the places and start with the ones. Top digit too small? Trade 1 from the next place: 52 − 17, the 2 ones become 12 and the 5 tens become 4.',
  gen(d, R) {
    const ab = genSub(R, d); if (!ab) return null; const [a, b] = ab, cols = subCols(a, b), ans = a - b;
    const how = cols.filter(c => c.has || c.d || c.i < String(ans).length).map(c => subLine(c, cols, a)); how[how.length - 1] += ' The answer is ' + B(nm(ans)) + '.';
    return { text: 'Take away in columns: ' + B(mi(a, b)) + '.', ans, vis: stackHTML([a, b], MINUS), howVis: stackHTML([a, b], MINUS, { ans }),
      how, steps: cols.filter(c => c.has).map(c => st(cap(PV[c.i]) + ': ' + B(mi(c.top, c.bd)) + ' = ?', c.d)).slice(0, 4),
      traps: [tr(noBorrow(a, b), 'a_borrow', 'You took the smaller digit from the bigger one. When the top digit is smaller, trade from the next place first.'), tr(ans + sum(cols.filter(c => c.j >= 0).map(c => P10(c.i + 1))), 'a_borrow', 'After trading, the digit you traded from goes down by 1.'), tr(a + b, 'a_colsub', 'This is taking away: the answer is smaller than ' + nm(a) + '.')] };
  } },
{ id: 'a_zeros', s: 'add', g: 3, title: 'Taking away across zeros', pre: [], paper: true,
  tip: 'No ones and no tens to trade? Rename the top in one go: 400 is 3 hundreds, 9 tens and 10 ones. Then take away column by column.',
  gen(d, R) {
    const ab = genZero(R, d); if (!ab) return null; const [a, b] = ab, cols = subCols(a, b), ans = a - b, j = cols[0].j, t = digs(a);
    const ren = []; for (let k = j; k >= 0; k--) { const v = k === j ? t[j] - 1 : k === 0 ? t[0] + 10 : 9; if (v || k < j) ren.push(pvn(v, k)); }
    const colTxt = c => cap(PV[c.i]) + ': ' + (c.has ? mi(c.top, c.bd) + ' = ' + c.d : 'nothing to take away, write ' + c.top) + '.';
    const shown = cols.filter(c => c.has || c.d);
    const how = ['Rename the top: ' + nm(a) + ' = ' + ren.join(' + ') + '.'];
    if (shown.length <= 3) shown.forEach(c => how.push(colTxt(c)));
    else { how.push(colTxt(shown[0])); how.push(colTxt(shown[1]) + ' ' + colTxt(shown[2])); shown.slice(3).forEach(c => how.push(colTxt(c))); }
    how[how.length - 1] += ' The answer is ' + B(nm(ans)) + '.';
    const zeroCols = []; for (let k = 1; k < j; k++) zeroCols.push(k);
    return { text: 'Take away in columns: ' + B(mi(a, b)) + '.', ans, vis: stackHTML([a, b], MINUS), howVis: stackHTML([a, b], MINUS, { ans }),
      how, steps: [st('Rename: ' + nm(a) + ' has how many ' + PV[0] + ' after trading?', t[0] + 10)].concat(shown.filter(c => c.has).map(c => st(cap(PV[c.i]) + ': ' + B(mi(c.top, c.bd)) + ' = ?', c.d))).slice(0, 4),
      traps: [tr(noBorrow(a, b), 'a_borrow', 'You took the smaller digit from the bigger one. Rename the top first.'), tr(ans + sum(zeroCols.map(k => P10(k))), 'a_zeros', 'A 0 that passes a ten along keeps 9, not 10: ' + nm(a) + ' = ' + ren.join(' + ') + '.'), tr(ans + P10(j), 'a_borrow', 'The ' + PV1[j] + ' you traded is gone: that digit goes down by 1.')] };
  } },
{ id: 'a_fixit', s: 'add', g: 3, title: 'Find and fix the mistake', pre: [], paper: true,
  tip: 'Check a worked answer with the opposite operation. If it does not check, go column by column from the ones and find the first slip.',
  gen(d, R) {
    const kind = d === 0 ? 'nocarry' : d === 1 ? R.pick(['nocarry', 'wrotesum', 'smallbig', 'nodec']) : R.pick(['zero10', 'smallbig', 'nocarry4']);
    const [A] = people(R);
    let a, b, op, wrong, ans, err, conceptC, redo;
    if (kind === 'nocarry' || kind === 'wrotesum' || kind === 'nocarry4') {
      const ab = genAdd(R, kind === 'nocarry4' ? 3 : d === 0 ? 0 : kind === 'wrotesum' ? 1 : 2, true); if (!ab) return null; [a, b] = ab; op = '+'; ans = a + b;
      const cols = addCols([a, b]), ci = cols.findIndex((c, i) => c.s >= 10 && i < cols.length - 1); if (ci < 0) return null; const c = cols[ci];
      wrong = kind === 'wrotesum' ? wroteSum([a, b]) : wrongNoCarry([a, b]); conceptC = 'a_regroup';
      const later = cols.findIndex((cc, i) => i > ci && i < cols.length - 1 && sum(cc.ds) >= 10);
      err = kind === 'wrotesum' ? cap(PV[ci]) + ': ' + c.ds.join(' + ') + (c.c ? ' + ' + c.c : '') + ' = ' + c.s + ', and the whole ' + c.s + ' was written in the answer. Only the ' + (c.s % 10) + ' goes there; carry the 1 to the ' + PV[ci + 1] + '.'
        : cap(PV[ci]) + ': ' + c.ds.join(' + ') + ' = ' + c.s + ', but the carried 1 was never added in the ' + PV[ci + 1] + '.' + (later > 0 ? ' The same slip happens again in the ' + PV[later + 1] + '.' : '');
      redo = cols.map((cc, i) => PV[i] + ' ' + (cc.c ? cc.c + ' + ' : '') + cc.ds.join(' + ') + ' = ' + cc.s + (i < cols.length - 1 && cc.s >= 10 ? ' (write ' + cc.s % 10 + ', carry 1)' : '')).join('; ');
    } else {
      const ab = kind === 'zero10' ? genZero(R, R.pick([1, 2])) : genSub(R, d === 1 ? 1 : 2); if (!ab) return null; [a, b] = ab; op = MINUS; ans = a - b;
      const cols = subCols(a, b), ci = cols.findIndex(c => c.j >= 0), c = cols[ci], t = digs(a);
      if (kind === 'smallbig') { wrong = noBorrow(a, b); conceptC = 'a_borrow'; err = cap(PV[ci]) + ': ' + c.before + ' is less than ' + c.bd + ', but it was done as ' + c.bd + ' ' + MINUS + ' ' + c.before + '. Trade first: ' + c.top + ' ' + MINUS + ' ' + c.bd + ' = ' + c.d + '.'; }
      else if (kind === 'nodec') { if (c.j !== ci + 1) return null; wrong = ans + sum(cols.filter(cc => cc.j >= 0).map(cc => P10(cc.i + 1))); conceptC = 'a_borrow'; err = cap(PV[ci]) + ': a ' + PV1[ci + 1] + ' was traded for 10 ' + PV[ci] + ', but the ' + t[ci + 1] + ' in the ' + PV[ci + 1] + ' was not made 1 smaller.'; }
      else { const zc = []; for (let k = 1; k < c.j; k++) zc.push(k); wrong = ans + sum(zc.map(k => P10(k))); conceptC = 'a_zeros'; err = 'The zeros that passed the trade along were made 10. They should be 9: ' + nm(a) + ' = ' + pvn(t[c.j] - 1, c.j) + ' + ' + zc.slice().reverse().map(k => pvn(9, k)).join(' + ') + ' + ' + pvn(t[0] + 10, 0) + '.'; }
      redo = cols.filter(cc => cc.has).map(cc => PV[cc.i] + ' ' + mi(cc.top, cc.bd) + ' = ' + cc.d).join('; ');
    }
    if (wrong == null || wrong === ans || wrong < 0) return null;
    const check = op === '+' ? mi(wrong, b) + ' = ' + nm(wrong - b) + ', not ' + nm(a) : pl(wrong, b) + ' = ' + nm(wrong + b) + ', not ' + nm(a);
    const wd = digs(wrong), ad = digs(ans); let fi = 0; while (fi < Math.max(wd.length, ad.length) && wd[fi] === ad[fi]) fi++;
    return { text: A + ' worked out ' + B(op === '+' ? pl(a, b) : mi(a, b)) + ' and got ' + B(nm(wrong)) + '. Find the mistake. What is the correct answer?', ans,
      vis: stackHTML([a, b], op, { ans: wrong }), howVis: stackHTML([a, b], op, { ans }),
      how: ['Check with the opposite: ' + check + '. So there is a mistake.', 'The mistake: ' + err, 'Redo: ' + redo + '.', 'The correct answer is ' + B(nm(ans)) + '.'],
      steps: [st('Which place has the first wrong digit? Type 1 for ones, 10 for tens, 100 for hundreds, 1000 for thousands.', P10(fi)), st('What is the correct answer to ' + B(op === '+' ? pl(a, b) : mi(a, b)) + '?', ans)],
      traps: [tr(wrong, conceptC, 'That is the answer on the paper. Check each column from the ones.'), tr(op === '+' ? wroteSum([a, b]) : noBorrow(a, b), op === '+' ? 'a_regroup' : 'a_borrow', op === '+' ? 'Only one digit fits in each place; carry the ten.' : 'When the top digit is smaller, trade before you take away.'), tr(op === '+' ? wrongNoCarry([a, b]) : ans + P10(fi + 1), op === '+' ? 'a_regroup' : 'a_borrow', op === '+' ? 'Remember to add the carried 1.' : 'After a trade, the digit you traded from goes down by 1.')] };
  } },
{ id: 'a_bigcol', s: 'add', g: 4, title: 'Big numbers in columns', pre: ['n_roundbig'], paper: true,
  tip: 'Estimate first by rounding (45,280 + 27,915 is about 45,000 + 28,000 = 73,000). Then add or take away in columns, and check the answer is close.',
  gen(d, R) {
    const add = R.chance(0.5), nd = d + 4, a = R.i(P10(nd - 1) + 1, P10(nd) - 1), bl = d === 0 ? 4 : R.pick([nd - 1, nd]);
    const b = R.i(P10(bl - 1), P10(bl) - 1); if (!add && (b >= a || a - b < 1000)) return null;
    const ans = add ? a + b : a - b, rp = d === 2 ? 10000 : 1000, ra = Math.round(a / rp) * rp, rb = Math.round(b / rp) * rp, est = add ? ra + rb : ra - rb;
    const opS = add ? ' + ' : ' ' + MINUS + ' ';
    let phr; if (add) { const cols = addCols([a, b]); phr = cols.map((c, i) => PV[i] + ' ' + (c.c ? c.c + ' + ' : '') + c.ds.join(' + ') + ' = ' + c.s + (i < cols.length - 1 && c.s >= 10 ? ', carry 1' : '')); }
    else { const cols = subCols(a, b); phr = cols.filter(c => c.has || c.d || c.i < String(ans).length).map(c => PV[c.i] + ' ' + (c.j >= 0 ? '(trade' + (c.j > c.i + 1 ? ' across the 0s' : '') + ') ' : '') + (c.has ? mi(c.top, c.bd) + ' = ' + c.d : c.top + ' (nothing to take away)')); }
    if (Math.abs(ans - est) > rp * 1.5 || est <= 0) return null;
    const cl = add ? addCols([a, b]) : null;
    return { text: 'Estimate first, then work it out in columns: ' + B(nm(a) + opS + nm(b)) + '.', ans,
      vis: stackHTML([a, b], add ? '+' : MINUS), howVis: stackHTML([a, b], add ? '+' : MINUS, add ? { ans, carry: carryRow(cl) } : { ans }),
      how: ['Estimate: ' + nm(ra) + opS + nm(rb) + ' = ' + nm(est) + '.', 'Ones to hundreds: ' + phr.slice(0, 3).join('; ') + '.', 'Thousands and up: ' + phr.slice(3).join('; ') + '.', 'The answer is ' + B(nm(ans)) + ', close to the estimate ' + nm(est) + '.'],
      steps: [st('Estimate: ' + B(nm(ra) + opS + nm(rb)) + ' = ?', est), st('Work the ones, tens and hundreds. What number do the last three digits of the answer make?', ans % 1000), st('What is the whole answer?', ans)],
      traps: add ? [tr(wrongNoCarry([a, b]), 'a_regroup', 'A column made 10 or more: carry the ten to the next place.'), String(b).length < String(a).length ? tr(a + b * 10, 'n_place', 'Line up the ones under the ones.') : null, tr(est, 'n_roundbig', 'That is the estimate. Now find the exact answer.')]
        : [tr(noBorrow(a, b), 'a_borrow', 'When the top digit is smaller, trade from the next place first.'), tr(est, 'n_roundbig', 'That is the estimate. Now find the exact answer.'), tr(ans + 10000 <= a + b ? ans + 10000 : null, 'a_borrow', 'Check the trades: the digit you trade from goes down by 1. Is your answer close to ' + nm(est) + '?')] };
  } },
/* =================== Written methods: times and dividing =================== */
{ id: 'm_area', s: 'mul', g: 4, title: 'Area model', pre: ['m_breakapart'], paper: true,
  tip: 'Split each number by place value and draw a box for each pair: 23 × 45 is 20 and 3 across, 40 and 5 down. Multiply in each box, then add the boxes.',
  gen(d, R) {
    let a, b;
    if (d === 0) { a = R.i(12, 98); b = R.i(3, 9); if (a % 10 === 0) return null; }
    else if (d === 1) { a = R.i(12, 49); b = R.i(12, 49); if (a % 10 === 0 || b % 10 === 0) return null; }
    else if (R.chance(0.5)) { a = R.i(1112, 4989); b = R.i(3, 9); if (String(a).includes('0')) return null; }
    else { a = R.i(5, 9) * 10 + R.i(6, 9); b = R.i(3, 9) * 10 + R.i(6, 9); }
    const split = v => String(v).split('').map((ch, i, arr) => +ch * P10(arr.length - 1 - i)).filter(x => x);
    const ca = split(a), rb = b < 10 ? [b] : split(b), cells = rb.map(r => ca.map(c => c * r)), ans = a * b, flat = [].concat(...cells);
    const how = ['Split: ' + nm(a) + ' = ' + ca.map(nm).join(' + ') + (b >= 10 ? ' and ' + b + ' = ' + rb.join(' + ') : '') + '.'];
    rb.forEach((r, j) => how.push((rb.length > 1 ? 'Row × ' + nm(r) + ': ' : 'Boxes: ') + ca.map((c, i) => nm(c) + ' × ' + nm(r) + ' = ' + nm(cells[j][i])).join(', ') + '.'));
    how.push('Add the boxes: ' + flat.map(nm).join(' + ') + ' = ' + B(nm(ans)) + '.');
    const steps = flat.slice(0, 4).map((v, k) => st('Box: ' + B(nm(ca[k % ca.length]) + ' × ' + nm(rb[Math.floor(k / ca.length)])) + ' = ?', v));
    if (flat.length < 4) steps.push(st('Add the boxes: ' + B(flat.map(nm).join(' + ')) + ' = ?', ans));
    const big = cells[0][0];
    return { text: 'Use an area model: ' + B(nm(a) + ' × ' + b) + '.', ans, vis: areaSVG(ca.map(nm), rb.map(nm), rb.map(() => ca.map(() => '?'))), howVis: areaSVG(ca.map(nm), rb.map(nm), cells.map(r => r.map(nm))),
      how, steps,
      traps: [rb.length > 1 ? tr(cells[0][0] + cells[1][1], 'm_area', 'You need all four boxes: each part of one number times each part of the other.') : tr(ans - flat[flat.length - 1], 'm_area', 'Add every box, including the ones box.'),
        tr(ans - big + big / 10, rb.length > 1 ? 'm_tensxtens' : 'm_xtens', 'Count the zeros in the biggest box: ' + nm(ca[0]) + ' × ' + nm(rb[0]) + ' = ' + nm(big) + '.'), tr(flat.length > 2 ? ans - flat[1] : null, 'm_area', 'Add every box.')] };
  } },
{ id: 'm_longdiv', s: 'mul', g: 4, title: 'Long division', pre: ['m_remain'], paper: true,
  tip: 'Divide, multiply, take away, bring down, and repeat. 72 ÷ 3: 7 ÷ 3 = 2, 2 × 3 = 6, 7 − 6 = 1, bring down the 2 to make 12, 12 ÷ 3 = 4. Answer 24.',
  gen(d, R) {
    const dv = d === 0 ? R.i(2, 6) : R.i(3, 9); let q, r = 0;
    if (d === 0) { q = R.i(12, 49); if (q * dv > 99 || Math.floor(q * dv / 10) < dv) return null; }
    else if (d === 1) { q = R.i(Math.ceil(100 / dv), Math.floor(999 / dv)); r = R.chance(0.5) ? R.i(1, dv - 1) : 0; }
    else { q = R.i(Math.ceil(1000 / dv), Math.floor(9999 / dv)); if (R.chance(0.5)) { const s = String(q).split(''); s[R.i(1, s.length - 2)] = '0'; q = +s.join(''); } r = R.chance(0.6) ? R.i(1, dv - 1) : 0; }
    const N = q * dv + r; if ((d === 1 && (N < 100 || N > 999)) || (d === 2 && (N < 1000 || N > 9999))) return null;
    const run = ldRun(String(N), dv), ansT = r ? q + ' r ' + r : String(q), steps = ldSteps(run, dv);
    if (r && steps.length < 4) steps.push(st('What is left over at the end?', r));
    const noZero = +String(q).replace(/0(?=\d)/g, '');
    return asNum0(d, { text: 'Use long division: ' + B(nm(N) + ' ÷ ' + dv) + '.' + (d ? ' Write any remainder like 7r2.' : ''), ans: { q, r }, type: 'rem',
      vis: ldHTML(String(N), dv), howVis: ldHTML(String(N), dv, { work: true }), how: ldLines(run, dv, 'The answer is ' + B(ansT) + '.'), steps,
      traps: [noZero !== q ? tr({ q: noZero, r }, 'm_longdiv', 'When ' + dv + ' does not fit after you bring down a digit, write 0 in the answer before you go on.') : null, r ? tr({ q, r: 0 }, 'm_remain', 'Something is left over at the end. Write it as the remainder.') : null, q > 1 ? tr({ q: q - 1, r: r + dv }, 'm_longdiv', 'A remainder must be less than ' + dv + '. With ' + (r + dv) + ' left over, another ' + dv + ' fits.') : null, tr({ q: q + 1, r: 0 }, 'm_divfam', 'Check the last digit: multiply it back by ' + dv + '.')] });
  } },
{ id: 'm_std', s: 'mul', g: 5, title: 'Multiply the standard way', pre: [], paper: true,
  tip: 'Multiply by the ones digit first, carrying as you go. Then multiply by the tens digit, writing a 0 first because it is tens. Add the two lines.',
  gen(d, R) {
    let a, b;
    if (d === 0) { a = R.chance(0.5) ? R.i(23, 98) : R.i(123, 989); b = R.i(3, 9); }
    else { a = d === 1 ? R.i(23, 98) : R.i(123, 989); b = R.i(13, 98); if (b % 10 < 2) return null; }
    const ans = a * b;
    if (b < 10) {
      const rw = mulRow(a, b); if (!rw.carried) return null; const how = rw.lines.slice(); how[how.length - 1] += ' The answer is ' + B(nm(ans)) + '.';
      return { text: 'Multiply the standard way: ' + B(a + ' × ' + b) + '.', ans, vis: stackHTML([a, b], '×'), howVis: stackHTML([a, b], '×', { ans, carry: rw.carry }),
        how, steps: rw.steps.slice(0, 4),
        traps: [tr(droppedCarries(a, b), 'm_std', 'After you multiply the next digit, add the number you carried.'), tr(rw.noShift, 'm_std', 'Write one digit in each place and carry the rest.'), tr(ans + b, factC(b, a % 10), 'Check each times fact.')] };
    }
    const b0 = b % 10, b1 = Math.floor(b / 10), p1 = a * b0, p2 = a * b1 * 10, r1 = mulRow(a, b0), r2 = mulRow(a, b1);
    return { text: 'Multiply the standard way: ' + B(a + ' × ' + b) + '.', ans, vis: stackHTML([a, b], '×'),
      howVis: colsHTML([{ s: a }, { s: b, op: '×', line: true }, { s: p1 }, { s: p2, op: '+', line: true }, { s: ans }]),
      how: ['Line 1, times the ' + b0 + ' ones: ' + r1.short + ' → ' + nm(p1) + '.', 'Line 2, times the ' + b1 + ' tens: write a 0 first, then ' + r2.short + ' → ' + nm(p2) + '.', 'Add the lines: ' + nm(p1) + ' + ' + nm(p2) + ' = ' + B(nm(ans)) + '.'],
      steps: [st('Line 1: ' + B(a + ' × ' + b0) + ' = ?', p1), st('Line 2: ' + B(a + ' × ' + b1 * 10) + ' = ?', p2), st(B(nm(p1) + ' + ' + nm(p2)) + ' = ?', ans)],
      traps: [tr(p1 + p2 / 10, 'm_std', 'Line 2 is times ' + b1 * 10 + ', so it ends in a 0.'), a < 100 ? tr(Math.floor(a / 10) * b1 * 100 + (a % 10) * b0, 'm_area', 'Multiply every digit by every digit, not just tens by tens and ones by ones.') : null, tr(droppedCarries(a, b0) + p2, 'm_std', 'In line 1, add each carry after you multiply the next digit.')] };
  } },
{ id: 'm_longdiv2', s: 'mul', g: 5, title: 'Long division by 2 digits', pre: [], paper: true,
  tip: 'Round the divisor to guess each digit: 23 is about 20, so for 98 ÷ 23 think 98 ÷ 20, about 4. Product too big? Try one less. Too much left? Try one more.',
  gen(d, R) {
    let dv, q, r = 0;
    if (d === 0) { dv = R.pick([11, 12, 21, 22, 31, 32, 41, 42, 20, 30, 40]); q = R.i(11, 49); }
    else if (d === 1) { dv = R.i(13, 49); q = R.i(11, 99); r = R.chance(0.6) ? R.i(1, dv - 1) : 0; }
    else { dv = R.i(23, 89); const hi = Math.floor(9999 / dv); q = hi >= 101 && R.chance(0.5) ? R.i(101, hi) : R.i(21, 99); if (q > 100 && R.chance(0.6)) q = Math.floor(q / 100) * 100 + R.i(1, 9); r = R.chance(0.6) ? R.i(1, dv - 1) : 0; }
    const N = q * dv + r; if (N < 100 || N > 9999 || (d === 0 && N > 999)) return null;
    const run = ldRun(String(N), dv), ansT = r ? q + ' r ' + r : String(q), steps = ldSteps(run, dv);
    if (r && steps.length < 4) steps.push(st('What is left over at the end?', r));
    const noZero = +String(q).replace(/0(?=\d)/g, '');
    return asNum0(d, { text: 'Use long division: ' + B(nm(N) + ' ÷ ' + dv) + '.' + (d ? ' Write any remainder like 7r2.' : ''), ans: { q, r }, type: 'rem',
      vis: ldHTML(String(N), dv), howVis: ldHTML(String(N), dv, { work: true }), how: ldLines(run, dv, 'The answer is ' + B(ansT) + '.'), steps,
      traps: [noZero !== q ? tr({ q: noZero, r }, 'm_longdiv', 'When ' + dv + ' does not fit after you bring down a digit, write 0 in the answer.') : null, q > 1 ? tr({ q: q - 1, r: r + dv }, 'm_longdiv2', 'A remainder must be less than ' + dv + '. With ' + (r + dv) + ' left over, one more ' + dv + ' fits: that estimate was too small.') : null, r ? tr({ q, r: 0 }, 'm_remain', 'Something is left over at the end. Write it as the remainder.') : null] });
  } },
{ id: 'm_fixit', s: 'mul', g: 5, title: 'Find and fix: times and divide', pre: [], paper: true,
  tip: 'Check with an estimate or the opposite operation. Classic slips: no 0 on the tens line, a carry not added, a missing 0 in a quotient, a remainder bigger than the divisor.',
  gen(d, R) {
    const [A] = people(R), kind = R.pick(d === 0 ? ['carry', 'bigrem'] : d === 1 ? ['zero', 'qzero'] : ['zero', 'qzero', 'bigrem']);
    if (kind === 'carry') {
      const a = R.i(23, 98), m = R.i(3, 9), ans = a * m, wrong = droppedCarries(a, m), rw = mulRow(a, m); if (wrong === ans) return null;
      const ra = Math.round(a / 10) * 10, c0 = Math.floor((a % 10) * m / 10);
      return { text: A + ' worked out ' + B(a + ' × ' + m) + ' and got ' + B(nm(wrong)) + '. Find the mistake. What is the correct answer?', ans,
        vis: stackHTML([a, m], '×', { ans: wrong }), howVis: stackHTML([a, m], '×', { ans, carry: rw.carry }),
        how: ['Check with an estimate: ' + a + ' is about ' + ra + ', and ' + ra + ' × ' + m + ' = ' + nm(ra * m) + '. ' + nm(wrong) + ' is too far off.', 'The mistake: ones ' + m + ' × ' + (a % 10) + ' = ' + (a % 10) * m + ', write ' + ((a % 10) * m) % 10 + ' and carry ' + c0 + '. The carried ' + c0 + ' was never added to the tens.', 'Redo: ' + rw.short + '.', 'The correct answer is ' + B(nm(ans)) + '.'],
        steps: rw.steps.concat([st('What is the correct answer?', ans)]),
        traps: [tr(wrong, 'm_std', 'That is the answer on the paper. Add the carry after you multiply the tens.'), tr(rw.noShift, 'm_std', 'Write one digit in each place and carry the rest.')] };
    }
    if (kind === 'zero') {
      const a = d === 1 ? R.i(23, 98) : R.i(123, 989), b = R.i(13, 98); if (b % 10 < 2) return null;
      const b0 = b % 10, b1 = Math.floor(b / 10), p1 = a * b0, p2 = a * b1 * 10, ans = a * b, wrong = p1 + p2 / 10;
      const ra = a < 100 ? Math.round(a / 10) * 10 : Math.round(a / 100) * 100, rb = Math.round(b / 10) * 10;
      return { text: A + ' worked out ' + B(a + ' × ' + b) + ' and got ' + B(nm(wrong)) + '. Find the mistake. What is the correct answer?', ans,
        vis: colsHTML([{ s: a }, { s: b, op: '×', line: true }, { s: p1 }, { s: p2 / 10, op: '+', line: true }, { s: wrong }]),
        howVis: colsHTML([{ s: a }, { s: b, op: '×', line: true }, { s: p1 }, { s: p2, op: '+', line: true }, { s: ans }]),
        how: ['Check with an estimate: ' + nm(ra) + ' × ' + rb + ' = ' + nm(ra * rb) + '. ' + nm(wrong) + ' is much too small.', 'The mistake is line 2. It is ' + a + ' × ' + b1 * 10 + ' (tens), so it needs a 0 at the end: ' + nm(p2) + ', not ' + nm(p2 / 10) + '.', 'Add again: ' + nm(p1) + ' + ' + nm(p2) + ' = ' + B(nm(ans)) + '.'],
        steps: [st('Line 2 should be ' + B(a + ' × ' + b1 * 10) + ' = ?', p2), st(B(nm(p1) + ' + ' + nm(p2)) + ' = ?', ans)],
        traps: [tr(wrong, 'm_std', 'That is the answer on the paper. Line 2 is times tens, so it ends in 0.'), tr(p1 + p2 * 10, 'n_times10', 'Times ' + b1 * 10 + ' needs one 0 on the end, not two.')] };
    }
    const dv = R.i(3, 9);
    if (kind === 'qzero') {
      let q, r, N;
      for (let k = 0; k < 30; k++) {
        q = d === 1 ? R.pick([1, 2, 3]) * 100 + R.i(1, 9) : R.i(1, 9) * (R.chance(0.5) ? 1000 : 100) + R.i(0, 9) * 10 + R.i(1, 9); r = R.i(0, dv - 1); N = q * dv + r;
        const s = String(q); if (!s.slice(1, -1).includes('0')) continue;
        if ((d === 1 && N >= 100 && N <= 999) || (d === 2 && N >= 1000 && N <= 9999)) break; N = null;
      }
      if (!N) return null;
      const wq = +String(q).replace(/0(?=\d)/g, ''), run = ldRun(String(N), dv), zc = run.cyc.find((cy, k) => k > 0 && cy.q === 0), ansT = r ? q + ' r ' + r : String(q);
      if (!zc) return null;
      return { text: A + ' worked out ' + B(nm(N) + ' ÷ ' + dv) + ' and got ' + B(wq + (r ? ' r ' + r : '')) + '. Find the mistake. What is the correct answer? Write any remainder like 7r2.', ans: { q, r }, type: 'rem',
        vis: ldHTML(String(N), dv, { q: wq + (r ? ' r ' + r : '') }), howVis: ldHTML(String(N), dv, { work: true }),
        how: ['Check: ' + wq + ' × ' + dv + (r ? ' + ' + r : '') + ' = ' + nm(wq * dv + r) + ', not ' + nm(N) + '.', 'The mistake: after bringing down to make ' + zc.cur + ', ' + dv + ' does not go into ' + zc.cur + ', so a 0 must be written in the answer.', 'Redo: ' + run.cyc.map(cy => cy.cur + ' ÷ ' + dv + ' = ' + cy.q + (cy.rem ? ' r ' + cy.rem : '')).join(', ') + '.', 'The answer is ' + B(ansT) + '.'],
        steps: ldSteps(run, dv),
        traps: [tr({ q: wq, r }, 'm_longdiv', 'That is the answer on the paper. Every digit you bring down needs a digit in the answer, even a 0.'), r ? tr({ q, r: 0 }, 'm_remain', 'Keep the remainder.') : null] };
    }
    const q = d === 0 ? R.i(11, Math.floor(90 / dv)) : R.i(112, Math.floor(999 / dv)), r = R.i(0, dv - 1), N = q * dv + r; if (q < 11) return null;
    const run = ldRun(String(N), dv), last = run.cyc[run.cyc.length - 1], ansT = r ? q + ' r ' + r : String(q);
    if (last.q < 1) return null;
    return { text: A + ' worked out ' + B(nm(N) + ' ÷ ' + dv) + ' and got ' + B((q - 1) + ' r ' + (r + dv)) + '. Find the mistake. What is the correct answer? Write any remainder like 7r2.', ans: { q, r }, type: 'rem',
      vis: ldHTML(String(N), dv, { q: (q - 1) + ' r ' + (r + dv) }), howVis: ldHTML(String(N), dv, { work: true }),
      how: ['Check the remainder: ' + (r + dv) + ' is bigger than ' + dv + ', so another ' + dv + ' fits.', 'The last digit should be one more: ' + last.cur + ' ÷ ' + dv + ' = ' + last.q + ' r ' + r + ', not ' + (last.q - 1) + ' r ' + (r + dv) + '.', 'Check: ' + q + ' × ' + dv + (r ? ' + ' + r : '') + ' = ' + nm(N) + '. The answer is ' + B(ansT) + '.'],
      steps: [st('How many ' + dv + 's fit in ' + B(last.cur) + '?', last.q), st('What is left over?', r)],
      traps: [tr({ q: q - 1, r: r + dv }, 'm_longdiv', 'That is the answer on the paper. A remainder must be smaller than the divisor.'), r ? tr({ q, r: 0 }, 'm_remain', 'Keep the remainder.') : null, tr({ q: q + 1, r: Math.max(0, r - dv) }, 'm_divfam', 'Only add one more ' + dv + '. Multiply back to check.')] };
  } },
/* =================== Gaps: fractions and decimals =================== */
{ id: 'f_numline', s: 'frac', g: 3, title: 'Fractions on a number line', pre: ['n_numline'],
  tip: 'Count the equal jumps from 0 to 1: that is the bottom number. Count the jumps from 0 to the dot: that is the top. 3 jumps out of 4 is 3/4.',
  gen(d, R) {
    const dn = R.pick(d === 0 ? [2, 3, 4, 6, 8] : [3, 4, 5, 6]), hi = d === 0 ? 1 : R.pick([2, 3]), max = hi * dn;
    let n; do n = R.i(1, max - 1); while (n % dn === 0 || (d === 1 && n < dn && R.chance(0.7)));
    if (d < 2) {
      return { text: 'The number line is cut into equal parts. What fraction is at the dot?' + (n > dn ? ' (An improper fraction or a mixed number is fine.)' : ''), ans: F(n, dn), type: 'frac',
        vis: numLineSVG(0, hi, 1 / dn, [{ v: n / dn, t: '?' }], 1),
        how: ['From 0 to 1 there are ' + dn + ' equal jumps, so each jump is ' + fr(1, dn) + '.', 'The dot is ' + plural(n, '1 jump', n + ' jumps') + ' from 0, so it is at ' + B(fr(n, dn)) + (n > dn ? ' (that is ' + mixed(Math.floor(n / dn), n % dn, dn) + ')' : '') + '.'],
        steps: [st('How many equal jumps from 0 to 1?', dn), st('How many jumps from 0 to the dot?', n)],
        traps: [tr(F(n, dn + 1), 'f_numline', 'Count the jumps (the spaces), not the tick marks.'), tr(F(n + 1, dn), 'f_numline', 'The first jump ends at the first mark after 0. Count jumps, starting at 0.'), d ? tr(F(n, max), 'f_numline', 'The bottom number is the jumps from 0 to 1, not to ' + hi + '.') : tr(F(dn, n), 'f_unit', 'The bottom number is how many equal parts make 1 whole.')] };
    }
    let k; do k = R.i(1, max - 1); while (Math.abs(k - n) < 2 || k === dn);
    return { text: 'Only one mark on this number line has a label. What fraction is at the dot?', ans: F(n, dn), type: 'frac',
      vis: numLineSVG(0, hi, 1 / dn, [{ v: k / dn, t: k + '/' + dn }, { v: n / dn, t: '?' }], 100),
      how: ['The mark ' + fr(k, dn) + ' is ' + plural(k, '1 jump', k + ' jumps') + ' from 0, so each jump is ' + fr(1, dn) + '.', 'The dot is ' + plural(n, '1 jump', n + ' jumps') + ' from 0, so it is at ' + B(fr(n, dn)) + (n > dn ? ' (that is ' + mixed(Math.floor(n / dn), n % dn, dn) + ')' : '') + '.'],
      steps: [st('How many jumps from 0 to the labeled mark?', k), st('Each jump is 1 over what number?', dn), st('How many jumps from 0 to the dot?', n)],
      traps: [tr(F(n, k), 'f_numline', 'The label ' + k + '/' + dn + ' tells you each jump is ' + '1/' + dn + '.'), tr(F(n + 1, dn), 'f_numline', 'Count jumps from 0, not tick marks.'), tr(F(n, dn + 1), 'f_numline', 'Each jump is 1/' + dn + ': the bottom stays ' + dn + '.')] };
  } },
{ id: 'f_mixedops', s: 'frac', g: 5, title: 'Add and take away mixed numbers', pre: ['a_borrow'], paper: true,
  tip: 'Give the fractions a common bottom. Add or take away the wholes and the fractions. Top fraction too small to take away from? Trade 1 whole: 4 1/6 = 3 7/6.',
  gen(d, R) {
    const add = d === 1 ? true : d === 2 ? false : R.chance(0.5);
    let b, e; if (d === 0) { b = e = R.pick([3, 4, 5, 6, 8, 10]); } else { do { b = R.pick([2, 3, 4, 5, 6, 8]); e = R.pick([2, 3, 4, 6, 8, 10, 12]); } while (b === e || lcm(b, e) > 24); }
    const a = R.i(1, b - 1), c = R.i(1, e - 1), L = lcm(b, e), A = a * L / b, Cc = c * L / e;
    if (gcd(a, b) > 1 || gcd(c, e) > 1) return null;
    const w1 = add ? R.i(1, 6) : R.i(3, 9), w2 = add ? R.i(1, 5) : R.i(1, w1 - 1);
    if (add && A + Cc < L && (d === 0 || R.chance(0.6))) return null;
    if (!add && A >= Cc) return null;
    const mx = (w, n2, d2) => n2 === 0 ? nm(w) : w === 0 ? fr(n2, d2) : mixed(w, n2, d2);
    const opS = add ? ' + ' : ' ' + MINUS + ' ', how = [];
    if (L !== b || L !== e) how.push('Common bottom ' + L + ': ' + mx(w1, A, L) + opS + mx(w2, Cc, L) + '.');
    let W, Fn;
    if (add) { const F0 = A + Cc; W = w1 + w2; Fn = F0;
      how.push('Wholes: ' + w1 + ' + ' + w2 + ' = ' + W + '. Fractions: ' + fr(A, L) + ' + ' + fr(Cc, L) + ' = ' + fr(F0, L) + '.');
      if (F0 >= L) { W += 1; Fn = F0 - L; how.push(fr(F0, L) + ' = 1' + (Fn ? ' and ' + fr(Fn, L) : '') + ', so the wholes become ' + (W - 1) + ' + 1 = ' + W + '.'); }
    } else {
      W = w1 - 1 - w2; Fn = A + L - Cc;
      how.push(fr(A, L) + ' is less than ' + fr(Cc, L) + ', so trade 1 whole: ' + mx(w1, A, L) + ' = ' + mx(w1 - 1, A + L, L) + '.');
      how.push('Wholes: ' + (w1 - 1) + ' ' + MINUS + ' ' + w2 + ' = ' + W + '. Fractions: ' + fr(A + L, L) + ' ' + MINUS + ' ' + fr(Cc, L) + ' = ' + fr(Fn, L) + '.');
    }
    const g = gcd(Fn, L), ansN = W * L + Fn;
    how.push('The answer is ' + B(mx(W, Fn / g, L / g)) + (g > 1 && Fn ? ' (' + fr(Fn, L) + ' = ' + fr(Fn / g, L / g) + ')' : '') + '.');

    const steps = [];
    if (L !== b || L !== e) { steps.push(st('What is the smallest common bottom for ' + b + ' and ' + e + '?', L)); steps.push(st(fr(add ? a : a, b) + ' = ' + fq('?', L) + '. What is the top?', A)); }
    steps.push(add ? st('Add the fractions: ' + fr(A, L) + ' + ' + fr(Cc, L) + ' = ?', F(A + Cc, L), { type: 'frac' }) : st('After trading 1 whole, ' + mx(w1, A, L) + ' = ' + (w1 - 1) + ' and ' + fq('?', L) + '. What is the top?', A + L));
    steps.push(st('What is the answer?', F(ansN, L), { type: 'frac' }));
    return { text: 'Work it out on paper: ' + B(mx(w1, a, b) + opS + mx(w2, c, e)) + '. Write the answer as a mixed number.', ans: F(ansN, L), type: 'frac',
      how: how.slice(0, 5), steps: steps.slice(-4),
      traps: [add ? tr(F((w1 + w2) * (b + e) + a + c, b + e), 'f_addunlike', 'Do not add the bottoms. Make them the same, then add the tops.') : tr(F((w1 - w2) * L + Cc - A, L), 'f_mixedops', 'You took the small fraction from the big one. Trade 1 whole for ' + L + '/' + L + ' first.'),
        !add && L !== 10 && A + 10 - Cc >= 0 ? tr(F((w1 - 1 - w2) * L + A + 10 - Cc, L), 'f_mixed', 'One whole is ' + L + '/' + L + ', not 10/' + L + '.') : null,
        add ? tr(F((w1 + w2) * L + A + Cc - (A + Cc >= L ? L : 0), L), 'f_mixed', 'The fractions made more than 1 whole: add that 1 to the wholes.') : tr(F((w1 - w2) * L + A + L - Cc, L), 'f_mixed', 'After trading, the wholes go down by 1.')] };
  } },
{ id: 'f_decdiv', s: 'frac', g: 6, title: 'Divide decimals on paper', pre: ['m_longdiv'], paper: true,
  tip: 'Divide as if the point were not there, but put the point in the answer straight above the point in the number. Dividing by a decimal? Move both points until the divisor is whole.',
  gen(d, R) {
    const fmtW = (w, dec) => { const s = String(w).padStart(dec + 1, '0'); return dec ? s.slice(0, s.length - dec) + '.' + s.slice(s.length - dec) : s; };
    let dv, work, shown, shownDv, first, Q;
    if (d === 0) {
      dv = R.i(2, 9); const qi = R.i(101, 999); if (qi % 10 === 0) return null; const W = qi * dv; if (W > 9999) return null;
      work = shown = fmtW(W, 2); shownDv = dv; Q = qi / 100; first = 'Put the point in the answer straight above the point in ' + shown + '.';
    } else if (d === 1) {
      dv = R.pick([2, 4, 5, 8]); const xd = R.pick([0, 1]), xi = xd ? R.i(11, 99) : R.i(3, 60); if (xi % dv === 0) return null;
      let k = 1; while ((xi * P10(k)) % dv && k < 3) k++; if ((xi * P10(k)) % dv) return null;
      shown = fmtW(xi, xd); work = fmtW(xi * P10(k), xd + k); shownDv = dv; Q = xi * P10(k) / dv / P10(xd + k);
      first = 'Write ' + shown + ' as ' + work + ' so you can keep dividing, and put the point in the answer above the point.';
    } else {
      const D = R.pick([[2, 1], [4, 1], [5, 1], [6, 1], [8, 1], [3, 1], [12, 1], [15, 1], [25, 2], [5, 2], [25, 1]]), qd = R.pick([0, 1]), qi = R.i(12, qd ? 499 : 99);
      if (qi % 10 === 0) return null; dv = D[0]; const k = D[1], W = qi * dv; if (String(W).length > 4) return null;
      work = fmtW(W, qd); shown = fmtW(W, qd + k).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); shownDv = fmtW(dv, k); Q = qi / P10(qd);
      first = 'Make the divisor whole: move both points ' + plural(k, '1 place', k + ' places') + '. ' + shown + ' ÷ ' + shownDv + ' = ' + work + ' ÷ ' + dv + '.';
    }
    const run = ldRun(work, dv); if (Math.abs(run.quo - Q) > 1e-9 || run.cyc.length > 4) return null;
    const how = [first].concat(ldLines(run, dv, 'The answer is ' + B(nm(Q)) + '.'));
    return { text: 'Divide on paper: ' + B(shown + ' ÷ ' + shownDv) + '.', ans: Q, vis: d < 2 ? ldHTML(shown, dv) : '', howVis: ldHTML(work, dv, { work: true }),
      how, steps: (d === 2 ? [st('Move both points: ' + shown + ' ÷ ' + shownDv + ' = ? ÷ ' + dv + '. What number goes in the box?', +work)] : []).concat(ldSteps(run, dv)).slice(0, 4),
      traps: [tr(+(Q * 10).toFixed(6), 'n_times10', 'Put the point in the answer straight above the point in the number you divide.'), tr(+(Q / 10).toFixed(6), 'n_times10', 'Check the point: estimate first. ' + shown + ' ÷ ' + shownDv + ' is about ' + nm(Math.round(Q)) + '.'), d === 2 ? tr(+(Q / P10(String(shownDv).split('.')[1].length)).toFixed(8), 'f_divdec', 'Move the point in both numbers by the same number of places.') : tr(Math.floor(Q), 'f_decdiv', 'Keep going past the point: write 0s on the end and bring them down.')] };
  } },
/* =================== Gaps: measuring and shapes =================== */
{ id: 'g_length', s: 'meas', g: 2, title: 'Measure with a ruler', pre: [],
  tip: 'Line up one end with 0 and read the number at the other end. Not at 0? Count the jumps from one end to the other (end number take away start number).',
  gen(d, R) {
    const inch = R.chance(0.5), max = inch ? 10 : 15, unit = inch ? 'inches' : 'cm', uw = inch ? 'inches' : 'centimeters';
    const things = R.shuffle(['pencil', 'crayon', 'ribbon', 'leaf', 'key', 'straw', 'feather', 'spoon', 'paper clip', 'twig']);
    if (d < 2 || R.chance(0.5)) {
      const a = d === 0 ? 0 : d === 1 ? R.i(1, 4) : R.i(4, 8), b = R.i(a + 2, max), len = b - a, t = things[0];
      if (d === 2 && len < 3) return null;
      return { text: 'How long is the ' + t + '? Give the length in ' + uw + '.', ans: len, unit, vis: rulerSVG(max, unit, [{ a, b, t }]),
        how: a === 0 ? ['The left end of the ' + t + ' is at 0.', 'The right end is at ' + b + ', so the ' + t + ' is ' + B(len) + ' ' + uw + ' long.'] : ['The left end is at ' + a + ', not 0. The right end is at ' + b + '.', 'Count the jumps from ' + a + ' to ' + b + ': ' + mi(b, a) + ' = ' + B(len) + ' ' + uw + '.'],
        steps: a === 0 ? [st('Where is the right end of the ' + t + '?', b)] : [st('Where is the left end?', a), st('Where is the right end?', b), st(B(mi(b, a)) + ' = ?', len)],
        traps: [a ? tr(b, 'g_length', 'The ' + t + ' does not start at 0. Count from its left end.') : null, tr(len + 1, 'g_length', 'Count the jumps between the numbers, not the tick marks.'), a ? tr(a + b, 'g_length', 'Find the distance from ' + a + ' to ' + b + ': take away.') : tr(len - 1, 'g_length', 'Read the number right under the end of the ' + t + '.')] };
    }
    const a1 = R.i(0, 3), b1 = R.i(a1 + 6, max), a2 = R.i(1, 5), b2 = R.i(a2 + 2, Math.min(max, a2 + (b1 - a1) - 2)), L1 = b1 - a1, L2 = b2 - a2;
    if (L2 >= L1 || L2 < 2) return null;
    return { text: 'How much longer is the ' + things[0] + ' than the ' + things[1] + '? Give the answer in ' + uw + '.', ans: L1 - L2, unit, vis: rulerSVG(max, unit, [{ a: a1, b: b1, t: things[0] }, { a: a2, b: b2, t: things[1] }]),
      how: [cap(things[0]) + ': from ' + a1 + ' to ' + b1 + ' is ' + mi(b1, a1) + ' = ' + L1 + ' ' + uw + '.', cap(things[1]) + ': from ' + a2 + ' to ' + b2 + ' is ' + mi(b2, a2) + ' = ' + L2 + ' ' + uw + '.', 'Difference: ' + mi(L1, L2) + ' = ' + B(L1 - L2) + ' ' + uw + ' longer.'],
      steps: [st('How long is the ' + things[0] + '?', L1), st('How long is the ' + things[1] + '?', L2), st(B(mi(L1, L2)) + ' = ?', L1 - L2)],
      traps: [tr(b1 - b2 > 0 ? b1 - b2 : null, 'g_length', 'The ' + things[1] + ' does not start at 0. Find each length first.'), tr(L1 + L2, 's_compare', 'How much longer asks for the difference, not the total.'), tr(L1, 's_compare', 'That is the ' + things[0] + '\'s length. Now compare it with the ' + things[1] + '.')] };
  } },
{ id: 'g_surface', s: 'meas', g: 6, title: 'Surface area from nets', pre: [], paper: true,
  tip: 'Unfold the shape into a net and find the area of every face, then add. A box has 3 pairs of matching rectangles. A triangle face is half of a rectangle.',
  gen(d, R) {
    const kind = d === 0 ? R.pick(['cube', 'box']) : d === 1 ? 'box' : R.pick(['tri', 'pyr']), U = ' cm²';
    if (kind === 'cube') {
      const s = R.i(2, 9), f = s * s, sa = 6 * f;
      return { text: 'Here is the net of a cube with edges ' + B(s + ' cm') + '. What is its surface area?', ans: sa, unit: 'cm²', vis: netBoxSVG(s, s, s),
        how: ['A cube has 6 faces, all squares the same size.', 'One face: ' + s + ' × ' + s + ' = ' + f + U + '.', 'All 6 faces: 6 × ' + f + ' = ' + B(sa) + U + '.'],
        steps: [st('Area of one face: ' + B(s + ' × ' + s) + ' = ?', f), st(B('6 × ' + f) + ' = ?', sa)],
        traps: [tr(s * s * s, 'g_volume', 'That is the volume (the space inside). Surface area covers the outside: add the faces.'), tr(4 * f, 'g_surface', 'Count the faces in the net: a cube has 6.'), tr(f, 'g_surface', 'That is one face. Add all 6.')] };
    }
    if (kind === 'box') {
      let l, w, h; do { l = R.i(3, d ? 12 : 6); w = R.i(2, d ? 10 : 5); h = R.i(2, d ? 9 : 5); } while (l === w || w === h || l === h || w > l);
      const lw = l * w, lh = l * h, wh = w * h, sa = 2 * (lw + lh + wh);
      return { text: 'Here is the net of a box ' + B(l + ' cm') + ' long, ' + B(w + ' cm') + ' wide and ' + B(h + ' cm') + ' tall. What is its surface area?', ans: sa, unit: 'cm²', vis: netBoxSVG(l, w, h),
        how: ['Faces come in pairs: top and bottom ' + l + ' × ' + w + ', front and back ' + l + ' × ' + h + ', two ends ' + w + ' × ' + h + '.', 'One of each: ' + lw + ', ' + lh + ' and ' + wh + U + '.', 'Two of each: 2 × ' + lw + ' + 2 × ' + lh + ' + 2 × ' + wh + ' = ' + 2 * lw + ' + ' + 2 * lh + ' + ' + 2 * wh + ' = ' + B(sa) + U + '.'],
        steps: [st('Top: ' + B(l + ' × ' + w) + ' = ?', lw), st('Front: ' + B(l + ' × ' + h) + ' = ?', lh), st('End: ' + B(w + ' × ' + h) + ' = ?', wh), st('Two of each: ' + B('2 × (' + lw + ' + ' + lh + ' + ' + wh + ')') + ' = ?', sa)],
        traps: [tr(l * w * h, 'g_volume', 'That is the volume (the space inside). Surface area adds the areas of the faces.'), tr(lw + lh + wh, 'g_surface', 'Each face has a matching face on the other side: double each one.'), tr(2 * (l + w + h), 'g_perim', 'Find the area of each face (length × width), not the edges.')] };
    }
    if (kind === 'tri') {
      const t = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15]]), [a, b, c] = t, L = R.i(4, 15), T = a * b / 2, rs = (a + b + c) * L, sa = 2 * T + rs;
      return { text: 'Here is the net of a triangular prism. The triangles have sides ' + B(a + ', ' + b + ' and ' + c + ' cm') + ' (a right triangle), and the prism is ' + B(L + ' cm') + ' long. What is its surface area?', ans: sa, unit: 'cm²', vis: netTriSVG(a, b, c, L),
        how: ['Two triangles: each is ½ × ' + a + ' × ' + b + ' = ' + T + U + ', so ' + 2 * T + U + ' for both.', 'Three rectangles, all ' + L + ' cm long: ' + a + ' × ' + L + ' = ' + a * L + ', ' + b + ' × ' + L + ' = ' + b * L + ', ' + c + ' × ' + L + ' = ' + c * L + '.', 'Add: ' + 2 * T + ' + ' + a * L + ' + ' + b * L + ' + ' + c * L + ' = ' + B(sa) + U + '.'],
        steps: [st('One triangle: ' + B('½ × ' + a + ' × ' + b) + ' = ?', T), st('The three rectangles: ' + B('(' + a + ' + ' + b + ' + ' + c + ') × ' + L) + ' = ?', rs), st(B('2 × ' + T + ' + ' + rs) + ' = ?', sa)],
        traps: [tr(2 * a * b + rs, 'g_tri', 'A triangle is half of a rectangle: ½ × ' + a + ' × ' + b + '.'), tr(T + rs, 'g_surface', 'There are two triangles, one at each end.'), tr(T * L, 'g_volume', 'That is the volume. Surface area adds the faces.')] };
    }
    const bs = R.i(2, 6) * 2, h = R.i(bs / 2 + 2, 15), base = bs * bs, tf = bs * h / 2, sa = base + 4 * tf;
    return { text: 'Here is the net of a pyramid with a square base. The base edges are ' + B(bs + ' cm') + ' and each triangle is ' + B(h + ' cm') + ' tall (the slant height). What is its surface area?', ans: sa, unit: 'cm²', vis: netPyrSVG(bs, h),
      how: ['Square base: ' + bs + ' × ' + bs + ' = ' + base + U + '.', 'Four triangles: each ½ × ' + bs + ' × ' + h + ' = ' + tf + U + ', so 4 × ' + tf + ' = ' + 4 * tf + U + '.', 'Add: ' + base + ' + ' + 4 * tf + ' = ' + B(sa) + U + '.'],
      steps: [st('Base: ' + B(bs + ' × ' + bs) + ' = ?', base), st('One triangle: ' + B('½ × ' + bs + ' × ' + h) + ' = ?', tf), st(B(base + ' + 4 × ' + tf) + ' = ?', sa)],
      traps: [tr(base + 4 * bs * h, 'g_tri', 'Each triangle is half of a rectangle: ½ × base × height.'), tr(4 * tf, 'g_surface', 'Count the base too: the net has 5 faces.'), tr(base + tf, 'g_surface', 'There are 4 triangles around the base.')] };
  } },
{ id: 'g_transform', s: 'meas', g: 8, title: 'Slides, flips and turns on a grid', pre: ['x_coord4'],
  tip: 'Slide: add to x and y. Flip over the x-axis: (x, y) → (x, −y). Over the y-axis: (−x, y). Turn 180°: (−x, −y). Turn 90° counterclockwise: (−y, x).',
  gen(d, R) {
    const nz = () => R.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), x = nz(), y = nz(), P = (a, b) => '(' + nm(a) + ', ' + nm(b) + ')', m1 = d === 1 ? R.pick(['xaxis', 'yaxis', 'r180']) : '';
    const askX = m1 === 'xaxis' ? R.chance(0.3) : m1 === 'yaxis' ? R.chance(0.7) : R.chance(0.5), cn = askX ? 'x' : 'y';
    const vis = gridSVG([{ x, y, t: 'A' }], -6, 6);
    const done = (x2, y2, how1, extraSteps, traps) => { const v = askX ? x2 : y2; return { text: null, ans: v, vis, how: how1.concat(['A' + P(x, y) + ' → A′' + P(x2, y2) + ', so the ' + cn + '-coordinate of A′ is ' + B(nm(v)) + '.']), steps: [st('What is the ' + cn + '-coordinate of A?', askX ? x : y)].concat(extraSteps, [st('A′ = (?, ?). What is its ' + cn + '-coordinate?', v)]), traps: traps.map(t => tr(askX ? t[0] : t[1], t[2], t[3])) }; };
    const lr = h => h > 0 ? h + ' right' : (-h) + ' left', ud = k => k > 0 ? k + ' up' : (-k) + ' down';
    let p, text;
    if (d === 0) {
      const h = nz(), k = nz(), x2 = x + h, y2 = y + k;
      text = 'Point A slides ' + B(lr(h)) + ' and ' + B(ud(k)) + ' to A′. What is the ' + B(cn + '-coordinate') + ' of A′?';
      p = done(x2, y2, ['A slide adds to the coordinates: x ' + (h > 0 ? '+ ' + h : MINUS + ' ' + (-h)) + ', y ' + (k > 0 ? '+ ' + k : MINUS + ' ' + (-k)) + '.'], [], [[x - h, y - k, 'g_transform', 'Right and up add; left and down take away.'], [x + k, y + h, 'g_transform', 'Left and right change x; up and down change y.'], [-(x2), -(y2), 'n_intadd', 'Check the sign as you count past 0.']]);
    } else if (d === 1) {
      const m = m1, rules = { xaxis: [x, -y, 'Flip over the x-axis: x stays, y changes sign. (x, y) → (x, ' + MINUS + 'y).', 'the x-axis'], yaxis: [-x, y, 'Flip over the y-axis: y stays, x changes sign. (x, y) → (' + MINUS + 'x, y).', 'the y-axis'], r180: [-x, -y, 'Turn 180° about the origin: both signs change. (x, y) → (' + MINUS + 'x, ' + MINUS + 'y).', ''] };
      const [x2, y2, rule] = rules[m];
      text = 'Point A is ' + (m === 'r180' ? 'turned ' + B('180°') + ' about the origin' : 'flipped over ' + B(rules[m][3])) + ' to A′. What is the ' + B(cn + '-coordinate') + ' of A′?';
      p = done(x2, y2, ['Rule: ' + rule], [], [m === 'xaxis' ? [-x, y, 'g_transform', 'Flipping over the x-axis keeps x the same and changes the sign of y.'] : [x, -y, 'g_transform', m === 'yaxis' ? 'Flipping over the y-axis keeps y the same and changes the sign of x.' : 'A 180° turn changes both signs.'], [y2, x2, 'x_coord', 'Keep the order: x first, then y.'], [x, y, 'g_transform', 'A′ is the new point after the move, not A.']]);
    } else if (R.chance(0.6)) {
      const ccw = R.chance(0.5), x2 = ccw ? -y : y, y2 = ccw ? x : -x;
      text = 'Point A is turned ' + B('90° ' + (ccw ? 'counterclockwise' : 'clockwise')) + ' about the origin to A′. What is the ' + B(cn + '-coordinate') + ' of A′?';
      p = done(x2, y2, ['Rule: a 90° ' + (ccw ? 'counterclockwise' : 'clockwise') + ' turn swaps the coordinates and changes one sign: (x, y) → ' + (ccw ? '(' + MINUS + 'y, x)' : '(y, ' + MINUS + 'x)') + '.'], [], [[ccw ? y : -y, ccw ? -x : x, 'g_transform', 'Check the direction: counterclockwise is (' + MINUS + 'y, x); clockwise is (y, ' + MINUS + 'x).'], [y, x, 'g_transform', 'A 90° turn swaps the numbers and changes one sign.'], [-x, -y, 'g_transform', 'That is a 180° turn. A 90° turn swaps x and y.']]);
    } else {
      const ax = R.chance(0.5), h = nz(), k = nz(), fx = ax ? x : -x, fy = ax ? -y : y, x2 = fx + h, y2 = fy + k;
      text = 'Point A is flipped over the ' + B(ax ? 'x-axis' : 'y-axis') + ', then slid ' + B(lr(h)) + ' and ' + B(ud(k)) + ' to A′. What is the ' + B(cn + '-coordinate') + ' of A′?';
      p = done(x2, y2, ['Flip first: ' + (ax ? '(x, y) → (x, ' + MINUS + 'y)' : '(x, y) → (' + MINUS + 'x, y)') + ', so A' + P(x, y) + ' → ' + P(fx, fy) + '.', 'Then slide: x ' + (h > 0 ? '+ ' + h : MINUS + ' ' + (-h)) + ', y ' + (k > 0 ? '+ ' + k : MINUS + ' ' + (-k)) + '.'], [st('After the flip, what is the ' + cn + '-coordinate?', askX ? fx : fy)], [[x + h, y + k, 'g_transform', 'Do the flip first, then the slide.'], [(ax ? x : -x) - h, (ax ? -y : y) - k, 'g_transform', 'Right and up add; left and down take away.'], [ax ? -x + h : x + h, ax ? y + k : -y + k, 'g_transform', 'Check which axis: over the x-axis the y changes sign; over the y-axis the x does.']]);
    }
    p.text = text;
    return p;
  } },
{ id: 'g_inscribed', s: 'meas', g: 10, title: 'Inscribed angles', pre: [],
  tip: 'An angle with its corner on the circle is half the arc it cuts off (and half the center angle on that arc). An angle in a semicircle is 90°. Opposite angles of a circle quadrilateral add to 180°.',
  gen(d, R) {
    const kind = R.pick(d === 0 ? ['arc', 'cen'] : d === 1 ? ['ins', 'semi', 'same'] : ['cyclic', 'third']), D = v => v + DEG, U = '°';
    if (kind === 'arc' || kind === 'cen' || kind === 'ins') {
      const arc = R.i(20, 85) * 2, x = arc / 2;
      const vis = circSVG({ A: 215, B: 325, C: 90 }, [['C', 'A'], ['C', 'B']].concat(kind === 'cen' ? [['O', 'A'], ['O', 'B']] : []), kind === 'cen' ? [{ ang: 270, r: 26, t: D(arc) }, { ang: 90, r: 62, t: '?' }] : [{ ang: 270, r: 112, t: kind === 'ins' ? '?' : D(arc) }, { ang: 90, r: 62, t: kind === 'ins' ? D(x) : '?' }], [215, 325]);
      if (kind === 'ins') return { text: 'Angle ACB has its corner on the circle and is ' + B(D(x)) + '. What is the measure of arc AB (the arc it cuts off)?', ans: arc, unit: U, vis,
        how: ['An inscribed angle is half its arc, so the arc is double the angle.', 'Arc AB = 2 × ' + x + ' = ' + B(D(arc)) + '.'], steps: [st(B('2 × ' + x) + ' = ?', arc)],
        traps: [tr(x / 2, 'g_inscribed', 'The arc is bigger: the angle is half the arc, so double it.'), tr(x, 'g_inscribed', 'The angle on the circle is half the arc, not equal to it.'), tr(180 - x, 'g_pairs', 'This is not a straight line. Use: arc = 2 × inscribed angle.')] };
      return { text: kind === 'arc' ? 'Arc AB measures ' + B(D(arc)) + '. Angle ACB has its corner C on the circle. What is angle ACB?' : 'O is the center. Angle AOB is ' + B(D(arc)) + '. What is angle ACB, with C on the circle?', ans: x, unit: U, vis,
        how: [kind === 'arc' ? 'An inscribed angle is half the arc it cuts off.' : 'The center angle AOB equals arc AB, and the inscribed angle ACB is half of that.', 'Angle ACB = ' + arc + ' ÷ 2 = ' + B(D(x)) + '.'], steps: [st(B(arc + ' ÷ 2') + ' = ?', x)],
        traps: [tr(arc, 'g_inscribed', 'An angle on the circle is half its arc, not equal to it.'), tr(arc * 2, 'g_inscribed', 'Halve the arc, do not double it.'), tr(180 - arc >= 20 ? 180 - arc : null, 'g_pairs', 'Use the inscribed angle rule: half the arc.')] };
    }
    if (kind === 'semi') {
      const a = R.i(20, 70), b = 90 - a;
      return { text: 'AB is a diameter and C is on the circle. Angle CAB is ' + B(D(a)) + '. What is angle CBA?', ans: b, unit: U,
        vis: circSVG({ A: 180, B: 0, C: 2 * a }, [['A', 'B'], ['A', 'C'], ['C', 'B']], [{ ang: 186, r: 66, t: D(a) }, { ang: 354, r: 66, t: '?' }]),
        how: ['C sits on a semicircle, so angle ACB = 90° (half of the 180° arc).', 'Angles in a triangle add to 180°: 180 ' + MINUS + ' 90 ' + MINUS + ' ' + a + ' = ' + B(D(b)) + '.'],
        steps: [st('Angle ACB, in a semicircle, is how many degrees?', 90), st(B('180 ' + MINUS + ' 90 ' + MINUS + ' ' + a) + ' = ?', b)],
        traps: [tr(180 - a, 'g_triangle', 'The angles of the triangle add to 180°, and angle C is 90°.'), tr(a, 'g_inscribed', 'The two angles at A and B add to 90° here; they are not equal.'), tr(2 * a, 'g_inscribed', 'Use the 90° angle at C, then the triangle sum.')] };
    }
    if (kind === 'same') {
      const x = R.i(15, 80);
      return { text: 'C and D are on the circle on the same side of chord AB. Angle ACB is ' + B(D(x)) + '. What is angle ADB?', ans: x, unit: U,
        vis: circSVG({ A: 215, B: 325, C: 60, D: 135 }, [['C', 'A'], ['C', 'B'], ['D', 'A'], ['D', 'B']], [{ ang: 62, r: 60, t: D(x) }, { ang: 128, r: 60, t: '?' }], [215, 325]),
        how: ['Both angles cut off the same arc AB.', 'Each is half of arc AB, so they are equal: angle ADB = ' + B(D(x)) + '.'],
        steps: [st('Arc AB = 2 × ' + x + ' = ?', 2 * x), st('Angle ADB is half of the arc: ?', x)],
        traps: [tr(2 * x, 'g_inscribed', 'That is the arc. Each inscribed angle on it is half: the same as angle ACB.'), tr(180 - x, 'g_pairs', 'These angles cut off the same arc, so they are equal, not supplementary.')] };
    }
    if (kind === 'cyclic') {
      const a = R.i(55, 125), c = 180 - a;
      return { text: 'Quadrilateral ABCD has all four corners on a circle. Angle A is ' + B(D(a)) + '. What is angle C, the opposite angle?', ans: c, unit: U,
        vis: circSVG({ A: 160, B: 250, C: 345, D: 60 }, [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']], [{ ang: 160, r: 66, t: D(a) }, { ang: 345, r: 66, t: '?' }]),
        how: ['Angle A is half of arc BCD and angle C is half of arc DAB. The two arcs make the whole 360° circle.', 'So A + C = 180°: angle C = 180 ' + MINUS + ' ' + a + ' = ' + B(D(c)) + '.'],
        steps: [st('Opposite angles of a circle quadrilateral add to what?', 180), st(B('180 ' + MINUS + ' ' + a) + ' = ?', c)],
        traps: [tr(a, 'g_inscribed', 'Opposite angles are supplementary (add to 180°), not equal.'), tr(360 - a, 'g_polygon', 'Opposite angles add to 180°, not 360°.')] };
    }
    let p, q; do { p = R.i(25, 85) * 2; q = R.i(25, 85) * 2; } while (360 - p - q < 40 || 360 - p - q > 220);
    const arcAC = 360 - p - q, x = arcAC / 2;
    return { text: 'A, B and C are on a circle. Arc AB (not through C) is ' + B(D(p)) + ' and arc BC (not through A) is ' + B(D(q)) + '. What is angle ABC?', ans: x, unit: U,
      vis: circSVG({ A: 210, B: 90, C: 330 }, [['B', 'A'], ['B', 'C']], [{ ang: 150, r: 110, t: D(p) }, { ang: 30, r: 110, t: D(q) }, { ang: 90, r: 62, t: '?' }], [210, 330]),
      how: ['Angle ABC cuts off arc AC, the arc not through B.', 'The arcs make 360°: arc AC = 360 ' + MINUS + ' ' + p + ' ' + MINUS + ' ' + q + ' = ' + arcAC + '°.', 'Angle ABC = ' + arcAC + ' ÷ 2 = ' + B(D(x)) + '.'],
      steps: [st('Arc AC = ' + B('360 ' + MINUS + ' ' + p + ' ' + MINUS + ' ' + q) + ' = ?', arcAC), st(B(arcAC + ' ÷ 2') + ' = ?', x)],
      traps: [tr(arcAC, 'g_inscribed', 'The angle on the circle is half its arc.'), tr((p + q) / 2, 'g_inscribed', 'Angle ABC cuts off arc AC, the arc away from B, not arcs AB and BC.'), tr(180 - (p + q) / 2, 'g_inscribed', 'Find arc AC first (all arcs make 360°), then halve it.')] };
  } },
/* =================== Gaps: data =================== */
{ id: 'd_picture', s: 'data', g: 2, title: 'Picture graphs and tally charts', pre: ['p_skip'],
  tip: 'In a tally chart, each bundle (4 lines and 1 across) is 5: count by 5s, then count on. In a picture graph, check the key: one picture may stand for 2.',
  gen(d, R) {
    const set = R.pick(PSETS), n = d === 0 ? 3 : R.pick([3, 4]), cats = R.shuffle(set.rows).slice(0, n), key = d === 2 ? 2 : 1, tally = d < 2 && R.chance(0.5);
    const vals = cats.map(() => key === 2 ? 2 * R.i(2, 9) : R.i(d === 0 ? 2 : 3, d === 0 ? 12 : 16));
    if (new Set(vals).size < n) return null;
    const vis = table(cats.map((c, i) => [c[0] + ' ' + c[1], tally ? tallySVG(vals[i]) : '<span style="letter-spacing:3px;white-space:nowrap">' + c[0].repeat(vals[i] / key) + '</span>']));
    const keyTxt = key === 2 ? ' Each picture stands for ' + B(2) + ' ' + set.u + '.' : '';
    const cnt = i => { const v = vals[i], nmC = cats[i][1];
      if (tally) { const g = Math.floor(v / 5), r = v % 5; return cap(nmC) + ': ' + (g ? plural(g, '1 bundle', g + ' bundles') + ' of 5 is ' + 5 * g : '') + (r ? (g ? ', and ' : '') + r + (g ? ' more' : ' marks') : '') + (g && r ? ' → ' + v : '') + '.'; }
      return key === 2 ? cap(nmC) + ': ' + v / 2 + ' pictures, each worth 2: ' + v / 2 + ' × 2 = ' + v + '.' : cap(nmC) + ': count the pictures, ' + v + '.'; };
    const kind = d === 0 ? 'one' : R.pick(['more', 'all', d === 2 ? 'one' : 'more']);
    const unitW = set.u, base = { vis, unit: unitW };
    const slip = i => tally ? tr(vals[i] - Math.floor(vals[i] / 5), 'd_picture', 'The line across is the 5th mark in each bundle.') : key === 2 ? tr(vals[i] / 2, 'd_picture', 'Each picture stands for 2. Count by 2s.') : tr(vals[i] + 1, 'd_picture', 'Touch each picture once as you count.');
    if (kind === 'one') { const i = R.i(0, n - 1);
      return Object.assign(base, { text: set.title + '.' + keyTxt + ' ' + set.q(cats[i][1]), ans: vals[i], how: [cnt(i), 'So the answer is ' + B(vals[i]) + '.'], steps: tally ? [st('How many full bundles of 5 are there?', Math.floor(vals[i] / 5)), st('Count by 5s for the bundles, then count on the single marks. How many in all?', vals[i])] : key === 2 ? [st('How many pictures are there?', vals[i] / 2), st('Each is worth 2: ' + B(vals[i] / 2 + ' × 2') + ' = ?', vals[i])] : [st('Count the pictures for ' + cats[i][1] + '.', vals[i])], traps: [slip(i)] }); }
    if (kind === 'more') { let i = R.i(0, n - 1), j; do j = R.i(0, n - 1); while (j === i); if (vals[i] < vals[j]) [i, j] = [j, i]; if (vals[i] - vals[j] < 2) return null;
      return Object.assign(base, { text: set.title + '.' + keyTxt + ' ' + set.more(cats[i][1], cats[j][1]), ans: vals[i] - vals[j], how: [cnt(i), cnt(j), mi(vals[i], vals[j]) + ' = ' + B(vals[i] - vals[j]) + ' more.'], steps: [st('How many for ' + cats[i][1] + '?', vals[i]), st('How many for ' + cats[j][1] + '?', vals[j]), st(B(mi(vals[i], vals[j])) + ' = ?', vals[i] - vals[j])], traps: [tr(vals[i] + vals[j], 's_compare', 'How many more asks for the difference, not the total.'), key === 2 ? tr((vals[i] - vals[j]) / 2, 'd_picture', 'Each picture stands for 2.') : slip(i)] }); }
    const T = sum(vals);
    return Object.assign(base, { text: set.title + '.' + keyTxt + ' ' + set.all, ans: T, how: cats.map((c, i) => cnt(i)).slice(0, 3).concat([(n > 3 ? cnt(3) + ' ' : '') + 'In all: ' + vals.join(' + ') + ' = ' + B(T) + '.']), steps: vals.map((v, i) => st('How many for ' + cats[i][1] + '?', v)).slice(0, 3).concat([st('Add them all: ' + B(vals.join(' + ')) + ' = ?', T)]), traps: [tr(T - vals[n - 1], 'd_picture', 'Add every row.'), key === 2 ? tr(T / 2, 'd_picture', 'Each picture stands for 2.') : tally ? tr(T - sum(vals.map(v => Math.floor(v / 5))), 'd_picture', 'The line across is the 5th mark in each bundle.') : null] });
  } },
{ id: 'd_quartile', s: 'data', g: 7, title: 'Quartiles and the IQR', pre: [], paper: true,
  tip: 'Order the data and find the median. Q1 is the median of the lower half, Q3 of the upper half (leave the middle number out if there is one). IQR = Q3 − Q1.',
  gen(d, R) {
    const n = d === 0 ? 7 : d === 1 ? R.pick([8, 9, 11]) : R.pick([10, 12]), vals = Array.from({ length: n }, () => R.i(d ? 5 : 2, d ? 60 : 30)), sorted = vals.slice().sort((a, b) => a - b);
    const med = arr => { const m = arr.length; return m % 2 ? arr[(m - 1) / 2] : (arr[m / 2 - 1] + arr[m / 2]) / 2; };
    const half = Math.floor(n / 2), lo = sorted.slice(0, half), hi = sorted.slice(n - half), Q1 = med(lo), Q3 = med(hi), M = med(sorted), iqr = Q3 - Q1;
    if (iqr <= 0) return null;
    const qt = arr => arr.length % 2 ? 'the middle of ' + arr.join(', ') + ', which is ' + nm(med(arr)) : '(' + arr[arr.length / 2 - 1] + ' + ' + arr[arr.length / 2] + ') ÷ 2 = ' + nm(med(arr));
    const ctx = R.pick(['quiz scores', 'reading times in minutes', 'game scores', 'jump-rope counts', 'plant heights in cm']);
    const askQ = d === 0 ? R.pick(['Q1', 'Q3']) : 'IQR', ans = askQ === 'Q1' ? Q1 : askQ === 'Q3' ? Q3 : iqr;
    const how = [(d === 0 ? 'The numbers are already in order: ' : 'Order: ') + sorted.join(', ') + '.', 'Median: ' + (n % 2 ? 'the middle number, ' + M + '. Leave it out. ' : '(' + sorted[n / 2 - 1] + ' + ' + sorted[n / 2] + ') ÷ 2 = ' + nm(M) + '. ') + 'Lower half: ' + lo.join(', ') + '. Upper half: ' + hi.join(', ') + '.'];
    if (askQ === 'Q1') how.push('Q1 is the middle of the lower half: ' + B(nm(Q1)) + '.'); else if (askQ === 'Q3') how.push('Q3 is the middle of the upper half: ' + B(nm(Q3)) + '.');
    else { how.push('Q1 = ' + qt(lo) + '. Q3 = ' + qt(hi) + '.'); how.push('IQR = ' + mi(Q3, Q1) + ' = ' + B(nm(iqr)) + '.'); }
    const incl = n % 2 ? (() => { const l2 = sorted.slice(0, half + 1), h2 = sorted.slice(half); return { q1: med(l2), q3: med(h2) }; })() : null;
    const uq1 = med(vals.slice(0, half)), uq3 = med(vals.slice(n - half));
    const pick = (q1, q3) => askQ === 'Q1' ? q1 : askQ === 'Q3' ? q3 : q3 - q1;
    return { text: 'Here are ' + n + ' ' + ctx + ': ' + B((d === 0 ? sorted : vals).join(', ')) + '. What is ' + (askQ === 'IQR' ? 'the interquartile range (IQR)' : askQ === 'Q1' ? 'the lower quartile, Q1' : 'the upper quartile, Q3') + '?', ans,
      how, steps: [st('What is the median?', M), st('What is Q1, the median of the lower half?', Q1), st('What is Q3, the median of the upper half?', Q3)].concat(askQ === 'IQR' ? [st('IQR = Q3 ' + MINUS + ' Q1 = ?', iqr)] : []),
      traps: [askQ === 'IQR' ? tr(sorted[n - 1] - sorted[0], 'd_median', 'That is the range (biggest take away smallest). The IQR uses Q3 and Q1.') : tr(M, 'd_median', 'That is the median. ' + askQ + ' is the middle of the ' + (askQ === 'Q1' ? 'lower' : 'upper') + ' half.'), incl ? tr(pick(incl.q1, incl.q3), 'd_quartile', 'Leave the median out of both halves.') : null, d ? tr(pick(uq1, uq3) > 0 ? pick(uq1, uq3) : null, 'd_median', 'Put the numbers in order first.') : tr(askQ === 'Q1' ? Q3 : Q1, 'd_quartile', askQ === 'Q1' ? 'Q1 is in the lower half.' : 'Q3 is in the upper half.')] };
  } },
/* =================== Gaps: coordinates and algebra =================== */
{ id: 'x_coord', s: 'alg', g: 5, title: 'Points on a grid', pre: ['n_numline'],
  tip: '(x, y) means start at (0, 0), go across x, then up y. (3, 5) is 3 across and 5 up. Across always comes first.',
  gen(d, R) {
    const askX = R.chance(0.5), cn = askX ? 'x' : 'y', P = (a, b) => '(' + a + ', ' + b + ')';
    if (d === 0) {
      const pts = []; while (pts.length < 3) { const p = { x: R.i(1, 9), y: R.i(1, 9) }; if (!pts.some(q => q.x === p.x && q.y === p.y) && p.x !== p.y) pts.push(p); }
      pts.forEach((p, i) => { p.t = 'ABC'[i]; }); const { x, y } = pts[0], v = askX ? x : y;
      return { text: (askX ? 'The x-coordinate tells how far across. ' : 'The y-coordinate tells how far up. ') + 'What is the ' + B(cn + '-coordinate') + ' of point A?', ans: v, vis: gridSVG(pts, 0, 10),
        how: ['Start at (0, 0). Go across to the line through A: x = ' + x + '.', 'Then go up to A: y = ' + y + '. A is at ' + P(x, y) + ', so ' + cn + ' = ' + B(v) + '.'],
        steps: [st('How far across from 0 is A?', x), st('How far up is A?', y)],
        traps: [tr(askX ? y : x, 'x_coord', 'x comes first and goes across; y comes second and goes up.'), tr(v + 1, 'x_coord', 'Count the jumps from 0 along the axis, not the lines.')] };
    }
    if (d === 1) {
      if (R.chance(0.5)) {
        const x = R.i(1, 9), y = R.i(1, 9), h = R.i(-x + 1, 9 - x), k = R.i(-y + 1, 9 - y); if (!h || !k) return null;
        const x2 = x + h, y2 = y + k, v = askX ? x2 : y2;
        return { text: 'Point A is at ' + B(P(x, y)) + '. Move it ' + B(Math.abs(h) + (h > 0 ? ' right' : ' left')) + ' and ' + B(Math.abs(k) + (k > 0 ? ' up' : ' down')) + '. What is the ' + B(cn + '-coordinate') + ' of the new point?', ans: v, vis: gridSVG([{ x, y, t: 'A' }], 0, 10),
          how: ['Across changes x: ' + x + (h > 0 ? ' + ' + h : ' ' + MINUS + ' ' + (-h)) + ' = ' + x2 + '.', 'Up and down change y: ' + y + (k > 0 ? ' + ' + k : ' ' + MINUS + ' ' + (-k)) + ' = ' + y2 + '. The new point is ' + P(x2, y2) + ', so ' + cn + ' = ' + B(v) + '.'],
          steps: [st('New x: ' + B(x + (h > 0 ? ' + ' + h : ' ' + MINUS + ' ' + (-h))) + ' = ?', x2), st('New y: ' + B(y + (k > 0 ? ' + ' + k : ' ' + MINUS + ' ' + (-k))) + ' = ?', y2)],
          traps: [tr(askX ? x + k : y + h, 'x_coord', 'Right and left change x; up and down change y.'), tr(askX ? x - h : y - k, 'x_coord', 'Right and up add; left and down take away.')] };
      }
      const same = R.chance(0.5), c = R.i(1, 9), a = R.i(0, 9); let b; do b = R.i(0, 9); while (Math.abs(b - a) < 2);
      const A = same ? { x: c, y: a, t: 'A' } : { x: a, y: c, t: 'A' }, Bp = same ? { x: c, y: b, t: 'B' } : { x: b, y: c, t: 'B' }, dd = Math.abs(b - a);
      return { text: 'A is at ' + B(P(A.x, A.y)) + ' and B is at ' + B(P(Bp.x, Bp.y)) + '. How many units apart are they?', ans: dd, unit: 'units', vis: gridSVG([A, Bp], 0, 10, { poly: true }),
        how: [(same ? 'Same x, so the points are on an up-and-down line. Use the y\'s: ' + a + ' and ' + b + '.' : 'Same y, so the points are on an across line. Use the x\'s: ' + a + ' and ' + b + '.'), 'Distance = ' + mi(Math.max(a, b), Math.min(a, b)) + ' = ' + B(dd) + ' units.'],
        steps: [st('Which coordinates are different? Take the smaller from the bigger: ' + B(mi(Math.max(a, b), Math.min(a, b))) + ' = ?', dd)],
        traps: [tr(a + b, 'x_coord', 'Distance is how far apart: take the smaller from the bigger.'), tr(dd + 1, 'x_coord', 'Count the jumps between the points, not the grid lines.')] };
    }
    const x1 = R.i(1, 5), x2 = R.i(x1 + 2, 9), y1 = R.i(1, 5), y2 = R.i(y1 + 2, 9), w = x2 - x1, h = y2 - y1, kind = R.pick(['corner', 'area', 'perim']);
    const pts = [{ x: x1, y: y1, t: 'A' }, { x: x2, y: y1, t: 'B' }, { x: x2, y: y2, t: 'C' }];
    if (kind === 'corner') { const v = askX ? x1 : y2;
      return { text: 'A ' + B(P(x1, y1)) + ', B ' + B(P(x2, y1)) + ' and C ' + B(P(x2, y2)) + ' are three corners of a rectangle ABCD. What is the ' + B(cn + '-coordinate') + ' of D?', ans: v, vis: gridSVG(pts, 0, 10, { poly: true }),
        how: ['D is straight above A and straight across from C.', 'So D has the x of A (' + x1 + ') and the y of C (' + y2 + '): D = ' + P(x1, y2) + ', and ' + cn + ' = ' + B(v) + '.'],
        steps: [st('D is above A. What is its x?', x1), st('D is across from C. What is its y?', y2)],
        traps: [tr(askX ? x2 : y1, 'x_coord', 'D is above A and across from C. Which point shares its x? Which shares its y?'), tr(askX ? y2 : x1, 'x_coord', 'x first (across), then y (up).')] };
    }
    const ans = kind === 'area' ? w * h : 2 * (w + h);
    return { text: 'A ' + B(P(x1, y1)) + ', B ' + B(P(x2, y1)) + ' and C ' + B(P(x2, y2)) + ' are three corners of a rectangle ABCD. What is its ' + (kind === 'area' ? 'area in square units' : 'perimeter in units') + '?', ans, vis: gridSVG(pts, 0, 10, { poly: true }),
      how: ['Width: from x = ' + x1 + ' to ' + x2 + ' is ' + mi(x2, x1) + ' = ' + w + '.', 'Height: from y = ' + y1 + ' to ' + y2 + ' is ' + mi(y2, y1) + ' = ' + h + '.', kind === 'area' ? 'Area = ' + w + ' × ' + h + ' = ' + B(ans) + ' square units.' : 'Perimeter = 2 × (' + w + ' + ' + h + ') = ' + B(ans) + ' units.'],
      steps: [st('Width: ' + B(mi(x2, x1)) + ' = ?', w), st('Height: ' + B(mi(y2, y1)) + ' = ?', h), st(kind === 'area' ? B(w + ' × ' + h) + ' = ?' : B('2 × (' + w + ' + ' + h + ')') + ' = ?', ans)],
      traps: [tr(kind === 'area' ? 2 * (w + h) : w * h, kind === 'area' ? 'g_area' : 'g_perim', kind === 'area' ? 'Area counts squares inside: width × height.' : 'Perimeter goes around the edge: add all four sides.'), tr(kind === 'area' ? x2 * y2 : 2 * (x2 + y2), 'x_coord', 'Use the side lengths (the differences), not the coordinates.')] };
  } },
{ id: 'x_coord4', s: 'alg', g: 6, title: 'All four quadrants', pre: ['n_neg'],
  tip: 'Left of 0, x is negative; below 0, y is negative. On a line where x (or y) is the same, the distance is the difference of the other coordinate: from −3 to 5 is 3 + 5 = 8.',
  gen(d, R) {
    const askX = R.chance(0.5), cn = askX ? 'x' : 'y', P = (a, b) => '(' + nm(a) + ', ' + nm(b) + ')', nz = () => R.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
    if (d === 0) {
      const x = nz(), y = nz(); if (x > 0 && y > 0) return null; const v = askX ? x : y;
      return { text: 'What is the ' + B(cn + '-coordinate') + ' of point A?', ans: v, vis: gridSVG([{ x, y, t: 'A' }], -6, 6),
        how: ['Across from 0: A is ' + Math.abs(x) + ' to the ' + (x < 0 ? 'left, so x = ' + nm(x) : 'right, so x = ' + x) + '.', 'Up or down: A is ' + Math.abs(y) + (y < 0 ? ' down, so y = ' + nm(y) : ' up, so y = ' + y) + '. A = ' + P(x, y) + ', so ' + cn + ' = ' + B(nm(v)) + '.'],
        steps: [st('How many units from the ' + (askX ? 'y-axis (left or right)' : 'x-axis (up or down)') + ' is A?', Math.abs(v)), st('Is it ' + (askX ? 'left' : 'down') + ' (negative) or not? Type the ' + cn + '-coordinate.', v)],
        traps: [tr(-v, 'n_neg', (askX ? 'Left of 0 is negative; right is positive.' : 'Below 0 is negative; above is positive.')), tr(askX ? y : x, 'x_coord', 'x comes first (across), y second (up or down).')] };
    }
    if (d === 1) {
      const sameY = R.chance(0.5), c = nz(); let a, b; do { a = nz(); b = nz(); } while (Math.abs(a - b) < 2 || (R.chance(0.6) && a * b > 0));
      const A = sameY ? { x: a, y: c, t: 'A' } : { x: c, y: a, t: 'A' }, Bp = sameY ? { x: b, y: c, t: 'B' } : { x: c, y: b, t: 'B' }, dd = Math.abs(a - b), across = a * b < 0;
      return { text: 'A is at ' + B(P(A.x, A.y)) + ' and B is at ' + B(P(Bp.x, Bp.y)) + '. How far apart are they?', ans: dd, unit: 'units', vis: gridSVG([A, Bp], -6, 6, { poly: true }),
        how: ['Same ' + (sameY ? 'y' : 'x') + ', so use the ' + (sameY ? 'x' : 'y') + '\'s: ' + nm(a) + ' and ' + nm(b) + '.', across ? 'They are on opposite sides of 0: ' + Math.abs(a) + ' + ' + Math.abs(b) + ' = ' + B(dd) + ' units.' : 'They are on the same side of 0: ' + mi(Math.max(Math.abs(a), Math.abs(b)), Math.min(Math.abs(a), Math.abs(b))) + ' = ' + B(dd) + ' units.'],
        steps: [st('How far is ' + nm(a) + ' from 0?', Math.abs(a)), st('How far is ' + nm(b) + ' from 0?', Math.abs(b)), st('So how far apart are A and B?', dd)],
        traps: [tr(across ? Math.abs(Math.abs(a) - Math.abs(b)) || null : Math.abs(a) + Math.abs(b), 'n_abs', across ? 'The points are on opposite sides of 0: add the two distances from 0.' : 'Both points are on the same side of 0: take the distances away.'), tr(dd + 1, 'x_coord', 'Count jumps between the points, not grid lines.')] };
    }
    if (R.chance(0.4)) {
      const x = nz(), y = nz(), overX = R.chance(0.5), dd = overX ? 2 * Math.abs(y) : 2 * Math.abs(x);
      return { text: 'A is at ' + B(P(x, y)) + '. It is flipped over the ' + B(overX ? 'x-axis' : 'y-axis') + ' to A′. How far is A from A′?', ans: dd, unit: 'units', vis: gridSVG([{ x, y, t: 'A' }], -6, 6),
        how: ['Flipping over the ' + (overX ? 'x-axis changes the sign of y' : 'y-axis changes the sign of x') + ': A′ = ' + (overX ? P(x, -y) : P(-x, y)) + '.', 'A and A′ are ' + (overX ? Math.abs(y) : Math.abs(x)) + ' from the axis on opposite sides: ' + (overX ? Math.abs(y) : Math.abs(x)) + ' + ' + (overX ? Math.abs(y) : Math.abs(x)) + ' = ' + B(dd) + ' units.'],
        steps: [st('How far is A from the ' + (overX ? 'x-axis' : 'y-axis') + '?', dd / 2), st('A′ is the same distance on the other side. How far apart are they?', dd)],
        traps: [tr(dd / 2, 'x_coord4', 'That is the distance to the axis. A′ is that far again on the other side.'), tr(overX ? 2 * Math.abs(x) : 2 * Math.abs(y), 'g_transform', 'Check which coordinate changes: over the x-axis, y changes sign.')] };
    }
    const x1 = R.i(-6, -1), x2 = R.i(1, 6), y1 = R.i(1, 6), y2 = R.i(-6, -1), w = x2 - x1, h = y1 - y2, area = R.chance(0.5), ans = area ? w * h : 2 * (w + h);
    const pts = [{ x: x1, y: y1, t: 'A' }, { x: x2, y: y1, t: 'B' }, { x: x2, y: y2, t: 'C' }, { x: x1, y: y2, t: 'D' }];
    return { text: 'Rectangle ABCD has corners A ' + B(P(x1, y1)) + ', B ' + B(P(x2, y1)) + ', C ' + B(P(x2, y2)) + ' and D ' + B(P(x1, y2)) + '. What is its ' + (area ? 'area in square units' : 'perimeter in units') + '?', ans, vis: gridSVG(pts, -6, 6, { poly: true, close: true }),
      how: ['Width (A to B): from ' + nm(x1) + ' to ' + x2 + ' crosses 0, so ' + Math.abs(x1) + ' + ' + x2 + ' = ' + w + '.', 'Height (B to C): from ' + y1 + ' to ' + nm(y2) + ' crosses 0, so ' + y1 + ' + ' + Math.abs(y2) + ' = ' + h + '.', area ? 'Area = ' + w + ' × ' + h + ' = ' + B(ans) + ' square units.' : 'Perimeter = 2 × (' + w + ' + ' + h + ') = ' + B(ans) + ' units.'],
      steps: [st('Width: how far from ' + nm(x1) + ' to ' + x2 + '?', w), st('Height: how far from ' + y1 + ' to ' + nm(y2) + '?', h), st(area ? B(w + ' × ' + h) + ' = ?' : B('2 × (' + w + ' + ' + h + ')') + ' = ?', ans)],
      traps: [tr(area ? Math.abs(x2 + x1) * Math.abs(y1 + y2) : 2 * (Math.abs(x2 + x1) + Math.abs(y1 + y2)), 'n_abs', 'The sides cross 0: add the distances on each side of 0.'), tr(area ? 2 * (w + h) : w * h, area ? 'g_area' : 'g_perim', area ? 'Area is width × height.' : 'Perimeter adds all four sides.')] };
  } },
{ id: 'x_midpoint', s: 'alg', g: 8, title: 'The midpoint', pre: ['d_mean'],
  tip: 'The midpoint is the average of the ends: add the x\'s and halve, add the y\'s and halve. The midpoint of (2, 5) and (8, −1) is (5, 2).',
  gen(d, R) {
    const askX = R.chance(0.5), cn = askX ? 'x' : 'y', P = (a, b) => '(' + nm(a) + ', ' + nm(b) + ')';
    const rv = () => d === 0 ? R.i(0, 14) : R.i(-12, 12);
    if (d < 2) {
      const x1 = rv(), y1 = rv(), x2 = rv(), y2 = rv(); if (x1 === x2 || y1 === y2 || (d === 0 && ((x1 + x2) % 2 || (y1 + y2) % 2))) return null;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, v = askX ? mx : my, [p, q] = askX ? [x1, x2] : [y1, y2];
      return { text: 'What is the ' + B(cn + '-coordinate') + ' of the midpoint of ' + B('A' + P(x1, y1)) + ' and ' + B('B' + P(x2, y2)) + '?', ans: v,
        how: ['Average the x\'s: (' + nm(x1) + ' + ' + par2(x2) + ') ÷ 2 = ' + nm(x1 + x2) + ' ÷ 2 = ' + nm(mx) + '.', 'Average the y\'s: (' + nm(y1) + ' + ' + par2(y2) + ') ÷ 2 = ' + nm(y1 + y2) + ' ÷ 2 = ' + nm(my) + '.', 'Midpoint ' + P(mx, my) + ', so the ' + cn + '-coordinate is ' + B(nm(v)) + '.'],
        steps: [st('Add the ' + cn + '\'s: ' + B(nm(p) + ' + ' + par2(q)) + ' = ?', p + q), st('Halve it: ' + B(nm(p + q) + ' ÷ 2') + ' = ?', v)],
        traps: [tr(p + q, 'd_mean', 'You added them. Now halve to find the middle.'), tr((q - p) / 2, 'x_midpoint', 'Add the two coordinates, then halve. (Half the difference is the distance to the middle, not the middle.)'), tr(Math.abs(p) + Math.abs(q) !== Math.abs(p + q) ? (Math.abs(p) + Math.abs(q)) / 2 : null, 'n_intadd', 'Keep the signs when you add.')] };
    }
    const x1 = R.i(-10, 10), y1 = R.i(-10, 10), mx = R.i(-8, 8), my = R.i(-8, 8); if (x1 === mx || y1 === my) return null;
    const bx = 2 * mx - x1, by = 2 * my - y1, v = askX ? bx : by, [a, m] = askX ? [x1, mx] : [y1, my], dl = m - a;
    return { text: 'M' + B(P(mx, my)) + ' is the midpoint of A' + B(P(x1, y1)) + ' and B. What is the ' + B(cn + '-coordinate') + ' of B?', ans: v,
      how: ['From A to M, x changes by ' + nm(mx - x1) + ' and y changes by ' + nm(my - y1) + '.', 'B is the same step again past M: B = (' + nm(mx) + ' + ' + par2(mx - x1) + ', ' + nm(my) + ' + ' + par2(my - y1) + ') = ' + P(bx, by) + '.', 'So the ' + cn + '-coordinate of B is ' + B(nm(v)) + '. (Check: the average of ' + nm(a) + ' and ' + nm(v) + ' is ' + nm(m) + '.)'],
      steps: [st('Change from A to M in ' + cn + ': ' + B(nm(m) + ' ' + MINUS + ' ' + par2(a)) + ' = ?', dl), st('Add it to M: ' + B(nm(m) + ' + ' + par2(dl)) + ' = ?', v)],
      traps: [tr((a + m) / 2, 'x_midpoint', 'M is already the middle. B is on the other side of M from A.'), tr(m - a, 'x_midpoint', 'That is the change. Add it to M to get B.'), tr(2 * m + a, 'n_intsub', 'B = 2 × M ' + MINUS + ' A: take A away.')] };
  } },
{ id: 'x_synth', s: 'alg', g: 11, title: 'Synthetic division', pre: ['n_intmul'], paper: true,
  tip: 'To divide by (x − a), write a and the coefficients (0 for a missing term). Bring down the first, then multiply by a and add, column by column. The last number is the remainder.',
  gen(d, R) {
    const deg = d === 2 ? 4 : 3, lead = d === 2 ? R.i(1, 3) : 1, a = R.pick(d === 0 ? [1, 2, 3, -1, -2] : [1, 2, 3, 4, -1, -2, -3]);
    const c = [lead]; for (let i = 1; i <= deg; i++) c.push(R.i(-9, 9));
    let zi = -1; if (d === 2) { zi = R.i(1, deg - 1); c[zi] = 0; }
    if (c[deg] === 0 || (d < 2 && c.slice(1).includes(0))) return null;
    const b = [c[0]]; for (let i = 1; i <= deg; i++) b.push(c[i] + a * b[i - 1]);
    if (b.some(v => Math.abs(v) > 150)) return null;
    const r = b[deg], dvT = a > 0 ? '(x ' + MINUS + ' ' + a + ')' : '(x + ' + (-a) + ')';
    const letters = deg === 3 ? ['', 'p', 'q'] : ['', 'p', 'q', 's'], qT = deg === 3 ? 'x² + px + q' : (lead === 1 ? '' : lead) + 'x³ + px² + qx + s';
    const askR = d === 0 || R.chance(0.4), ai = askR ? deg : R.i(1, deg - 1), v = b[ai], nameV = askR ? 'the remainder' : letters[ai];
    const termName = k => { const e = deg - k; return e === 1 ? 'x' : 'x<sup>' + e + '</sup>'; };
    const how = ['Write ' + nm(a) + ' (it makes ' + dvT + ' zero) and the coefficients ' + c.map(nm).join(', ') + (zi > 0 ? ' (0 for the missing ' + termName(zi) + ' term)' : '') + '. Bring down the ' + nm(c[0]) + '.'];
    for (let i = 1; i <= deg; i++) how.push(nm(b[i - 1]) + ' × ' + par2(a) + ' = ' + nm(a * b[i - 1]) + ', then ' + nm(c[i]) + ' + ' + par2(a * b[i - 1]) + ' = ' + nm(b[i]) + '.');
    how[how.length - 1] += askR ? ' The remainder is ' + B(nm(r)) + '.' : ' The quotient is ' + poly(b.slice(0, deg)) + ' with remainder ' + nm(r) + ', so ' + nameV + ' = ' + B(nm(v)) + '.';
    const altA = (() => { const bb = [c[0]]; for (let i = 1; i <= deg; i++) bb.push(c[i] - a * bb[i - 1]); return bb[ai]; })();
    const noZero = zi > 0 ? (() => { const cc = c.filter((x, i) => i !== zi), bb = [cc[0]]; for (let i = 1; i < cc.length; i++) bb.push(cc[i] + a * bb[i - 1]); return askR ? bb[bb.length - 1] : bb[ai] != null ? bb[ai] : null; })() : null;
    return { text: 'Use synthetic division to divide ' + B(poly(c)) + ' by ' + B(dvT) + '. ' + (askR ? 'What is the remainder?' : 'The quotient is ' + qT + '. What is ' + B(nameV) + '?'), ans: v,
      vis: synthHTML(a, c), howVis: synthHTML(a, c, b),
      how, steps: b.slice(1).map((bv, k) => st('Next number in the bottom row: ' + B(nm(c[k + 1]) + ' + ' + par2(b[k]) + ' × ' + par2(a)) + ' = ?', bv)).slice(0, 4),
      traps: [tr(altA, 'x_synth', 'For ' + dvT + ', put ' + nm(a) + ' in the box: the number that makes the divisor zero.'), zi > 0 ? tr(noZero, 'x_synth', 'Write 0 for the missing term so every column lines up.') : null, askR ? tr(b[deg - 1], 'x_synth', 'The remainder is the last number in the bottom row.') : tr(r, 'x_synth', 'That is the remainder. The quotient\'s numbers come before it.'), tr(-v, 'n_intadd', 'Check the signs when you multiply and add.')] };
  } },
]);

/* picture graph and tally chart data sets */
const PSETS = [
  { title: 'Kids voted for their favorite fruit', u: 'kids', rows: [['🍎', 'apple'], ['🍌', 'banana'], ['🍇', 'grapes'], ['🍓', 'strawberry']], q: n => 'How many kids chose ' + n + '?', more: (a, b) => 'How many more kids chose ' + a + ' than ' + b + '?', all: 'How many kids voted in all?' },
  { title: 'Kids voted for their favorite pet', u: 'kids', rows: [['🐶', 'dog'], ['🐱', 'cat'], ['🐟', 'fish'], ['🐰', 'rabbit']], q: n => 'How many kids chose ' + n + '?', more: (a, b) => 'How many more kids chose ' + a + ' than ' + b + '?', all: 'How many kids voted in all?' },
  { title: 'The weather each day this month', u: 'days', rows: [['☀️', 'sunny'], ['🌧️', 'rainy'], ['☁️', 'cloudy'], ['❄️', 'snowy']], q: n => 'How many days were ' + n + '?', more: (a, b) => 'How many more days were ' + a + ' than ' + b + '?', all: 'How many days are shown in all?' },
  { title: 'Kids picked their favorite sport', u: 'kids', rows: [['⚽', 'soccer'], ['🏀', 'basketball'], ['🎾', 'tennis'], ['🏊', 'swimming']], q: n => 'How many kids chose ' + n + '?', more: (a, b) => 'How many more kids chose ' + a + ' than ' + b + '?', all: 'How many kids voted in all?' }
];
/* synthetic division set out on paper: a | coefficients, the products row, and the bottom row (b) when given */
function synthHTML(a, c, b) {
  const cell = (t, st2) => '<td style="width:auto;min-width:1.6em;padding:0 .3em;' + (st2 || '') + '">' + t + '</td>';
  let h = '<table class="stack" aria-hidden="true" style="font-size:1.25rem">';
  h += '<tr>' + cell(nm(a), 'border-right:3px solid currentColor;border-bottom:3px solid currentColor') + c.map(v => cell(nm(v))).join('') + '</tr>';
  h += '<tr>' + cell('', 'border-right:3px solid currentColor') + c.map((v, i) => cell(b && i ? nm(a * b[i - 1]) : '')).join('') + '</tr>';
  h += '<tr>' + cell('') + c.map((v, i) => cell(b ? nm(b[i]) : '<span class="sk-q">?</span>', 'border-top:3px solid currentColor;' + (i === c.length - 1 ? 'border-left:2px dashed currentColor' : ''))).join('') + '</tr>';
  return h + '</table>';
}

/* nets for surface area (labels in cm) */
function netWrap(W, H, body) { const k = Math.min(300 / W, 230 / H), w = W * k + 60, h = H * k + 50; return { k, open: '<svg class="fig" viewBox="0 0 ' + w.toFixed(0) + ' ' + h.toFixed(0) + '" style="max-width:' + Math.min(360, w).toFixed(0) + 'px" aria-hidden="true">', x0: 34, y0: 22 }; }
const rct = (x, y, w, h) => '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" class="fig-shape" style="stroke-width:2"/>';
const lab = (x, y, t, anchor) => '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" class="fig-small"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + t + '</text>';
const poly2 = pts => '<path d="' + pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + ' Z" class="fig-shape" style="stroke-width:2"/>';
function netBoxSVG(l, w, h) {
  const n = netWrap(2 * w + 2 * l, h + 2 * w), k = n.k, X = n.x0, Y = n.y0; let s = n.open;
  s += rct(X + w * k, Y, l * k, w * k) + rct(X, Y + w * k, w * k, h * k) + rct(X + w * k, Y + w * k, l * k, h * k) + rct(X + (w + l) * k, Y + w * k, w * k, h * k) + rct(X + (2 * w + l) * k, Y + w * k, l * k, h * k) + rct(X + w * k, Y + (w + h) * k, l * k, w * k);
  s += lab(X + (w + l / 2) * k, Y - 6, l + ' cm') + lab(X + w * k - 5, Y + w * k / 2 + 4, w + ' cm', 'end') + lab(X - 5, Y + (w + h / 2) * k + 4, h + ' cm', 'end');
  return s + '</svg>';
}
function netPyrSVG(b, h) {
  const n = netWrap(b + 2 * h, b + 2 * h), k = n.k, X = n.x0 + h * k, Y = n.y0 + h * k, B2 = b * k, H = h * k; let s = n.open;
  s += rct(X, Y, B2, B2) + poly2([[X, Y], [X + B2, Y], [X + B2 / 2, Y - H]]) + poly2([[X, Y + B2], [X + B2, Y + B2], [X + B2 / 2, Y + B2 + H]]) + poly2([[X, Y], [X, Y + B2], [X - H, Y + B2 / 2]]) + poly2([[X + B2, Y], [X + B2, Y + B2], [X + B2 + H, Y + B2 / 2]]);
  s += '<line x1="' + (X + B2 / 2).toFixed(1) + '" y1="' + Y.toFixed(1) + '" x2="' + (X + B2 / 2).toFixed(1) + '" y2="' + (Y - H).toFixed(1) + '" class="fig-thin" style="stroke-dasharray:4 3"/>';
  s += lab(X + B2 / 2 + 6, Y - H / 2 + 4, h + ' cm', 'start') + lab(X + B2 / 2, Y + B2 / 2 + 5, b + ' cm');
  return s + '</svg>';
}
function netTriSVG(a, b, c, L) {
  const n = netWrap(a + b + c, L + 2 * b), k = n.k, X = n.x0, Y = n.y0 + b * k, Lk = L * k; let s = n.open;
  s += rct(X, Y, a * k, Lk) + rct(X + a * k, Y, b * k, Lk) + rct(X + (a + b) * k, Y, c * k, Lk);
  s += poly2([[X, Y], [X + a * k, Y], [X, Y - b * k]]) + poly2([[X, Y + Lk], [X + a * k, Y + Lk], [X, Y + Lk + b * k]]);
  s += lab(X + a * k / 2, Y + Lk / 2 + 4, a) + lab(X + (a + b / 2) * k, Y + Lk / 2 + 4, b) + lab(X + (a + b + c / 2) * k, Y + Lk / 2 + 4, c) + lab(X - 5, Y - b * k / 2 + 4, b, 'end') + lab(X + (a + b + c) * k + 5, Y + Lk / 2 + 4, L + ' cm', 'start');
  return s + '</svg>';
}

/* an exact long division at the easiest level is typed as a plain number (no remainder key) */
function asNum0(d, p) {
  if (d !== 0 || p.ans.r) return p;
  const q = p.ans.q; p.type = 'num'; p.ans = q;
  p.traps = p.traps.filter(t => t && t.v && t.v.r === 0).map(t => ({ v: t.v.q, c: t.c, why: t.why })).concat([{ v: q - 1, c: 'm_divfam', why: 'Check each digit: multiply it back by the divisor.' }]);
  return p;
}
/* one written row of multiplying by a single digit m: lines (one per digit), a short form, steps and the carry row */
function mulRow(a, m) {
  const ds = digs(a), lines = [], parts = [], steps = [], carries = []; let c = 0, carried = false, noShift = '';
  ds.forEach((dg, i) => {
    const p = dg * m, t = p + c, last = i === ds.length - 1;
    const e = m + ' × ' + dg + ' = ' + p + (c ? ', plus ' + c + ' = ' + t : '');
    lines.push(cap(PV[i]) + ': ' + e + '. ' + (last ? 'Write ' + t + '.' : 'Write ' + t % 10 + (t >= 10 ? ', carry ' + Math.floor(t / 10) + '.' : '.')));
    parts.push(m + ' × ' + dg + (c ? ' + ' + c : '') + ' = ' + t + (last || t < 10 ? '' : ' (write ' + t % 10 + ', carry ' + Math.floor(t / 10) + ')'));
    steps.push(st(B(m + ' × ' + dg + (c ? ' + ' + c : '')) + ' = ?', t));
    carries.push(c ? String(c) : ' ');
    noShift = String(p) + noShift;
    if (!last && t >= 10) carried = true;
    c = last ? 0 : Math.floor(t / 10);
  });
  return { lines, short: parts.join('; '), steps, carried, carry: carries.reverse(), noShift: +noShift };
}
/* forgot to add the carries: each digit writes only the ones of its own product (the last writes all of it) */
function droppedCarries(a, m) { const ds = digs(a); let r = 0; ds.forEach((dg, i) => { r += (i === ds.length - 1 ? dg * m : (dg * m) % 10) * P10(i); }); return r; }

/* ---------- number pickers for the written methods ---------- */
function wrongNoCarry(nums) { const cols = addCols(nums); let r = 0; cols.forEach((c, i) => { const s = sum(c.ds); r += (i === cols.length - 1 ? s : s % 10) * P10(i); }); return r; }
function wroteSum(nums) { const cols = addCols(nums); if (cols.filter(c => sum(c.ds) >= 10).length !== 1 || sum(cols[0].ds) < 10) return null; return +cols.slice().reverse().map(c => String(sum(c.ds))).join(''); }
/* adding: d0 2-digit with one carry; d1 3-digit plus 2 or 3 digits; d2 two carries or a list of 2-digit numbers; d3 4-digit (for find the mistake) */
function genAdd(R, d, twoOnly) {
  const carries = nums => addCols(nums).filter((c, i, all) => i < all.length - 1 && c.s >= 10).length;
  for (let k = 0; k < 30; k++) {
    let nums;
    if (d === 0) { const a = R.i(13, 78); nums = [a, R.i(11, 99 - a)]; if (carries(nums) !== 1 || sum(nums) > 99) continue; }
    else if (d === 1) { const a = R.i(105, 789); nums = [a, R.chance(0.4) ? R.i(15, 98) : R.i(105, 999 - a)]; if (nums[1] < 11 || !carries(nums) || sum(nums) > 999) continue; }
    else if (d === 2 && (twoOnly || R.chance(0.5))) { nums = [R.i(205, 899), R.i(105, 899)]; if (carries(nums) < 2) continue; }
    else if (d === 2) { nums = Array.from({ length: R.pick([3, 3, 4]) }, () => R.i(11, 49)); if (sum(nums.map(v => v % 10)) < 10 || sum(nums) > 99 + 60) continue; }
    else { nums = [R.i(1205, 6899), R.i(1105, 2999)]; if (carries(nums) < 2) continue; }
    return nums;
  }
  return null;
}
/* taking away: d0 2-digit one trade; d1 3-digit one trade; d2 two trades, 3 or 4 digits; no zeros in the top number */
function genSub(R, d) {
  for (let k = 0; k < 40; k++) {
    const len = d === 0 ? 2 : d === 1 ? 3 : R.pick([3, 4]), a = R.i(P10(len - 1) + 1, P10(len) - 1); if (String(a).includes('0')) continue;
    const b = d === 1 && R.chance(0.35) ? R.i(11, 98) : R.i(P10(len - 1), a - 1); if (b < 11 || b >= a) continue;
    const n = nBorrows(subCols(a, b)); if (d < 2 ? n !== 1 : n < 2) continue;
    return [a, b];
  }
  return null;
}
/* across zeros: the top has 0s between its first digit and its ones digit, and the ones need a trade */
function genZero(R, d) {
  for (let k = 0; k < 40; k++) {
    const len = d === 2 ? 4 : 3, lead = R.i(d === 2 ? 1 : 2, 9), o = R.i(0, d === 0 ? 0 : 5), a = lead * P10(len - 1) + o;
    const b = d === 0 && R.chance(0.4) ? R.i(12, 98) : R.i(P10(len - 2) + 1, a - 1); if (b % 10 <= o || b >= a) continue;
    if (d === 2 && R.chance(0.3) && b < 1000 && b % 10 > 0) return [1000, b];
    return [a, b];
  }
  return null;
}
})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
