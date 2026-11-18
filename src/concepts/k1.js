/* Common Core gap concepts for grades 2 to 5 (docs/gaps_k8.md): length stories, sides and faces, number line hops,
   grams and liters, quarter-inch rulers, two-step stories with all four operations, split areas, fraction stories,
   measurement stories, comparing decimals, line plots, lines of symmetry, reading expressions, two patterns side by
   side, fractions as division, areas with fraction sides, counting cubes and solids made of two boxes.
   Paper concepts (paper: true) write their how lines as a model written solution, one line per line of written work,
   so a kid can compare their paper line by line. Their steps follow the same lines. */
(function (C) {
'use strict';
const { B, num, MINUS, frac, mixed, gcd, reduce, plural, sum, NAMES, table, hopsSVG, fracBarSVG } = C;

/* ---------- small helpers ---------- */
const tr = (v, c, why) => ({ v, c, why });
const st = (text, ans, o) => Object.assign({ text, ans }, o || {});
const F = (n, d) => ({ n, d });
const sf = (text, n, d, o) => Object.assign({ text, ans: F(n, d), type: 'frac' }, o || {});
const nm = num;
const mi = (a, b) => nm(a) + ' ' + MINUS + ' ' + nm(b);
const pl = (a, b) => nm(a) + ' + ' + nm(b);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const people = R => R.shuffle(NAMES).slice(0, 3);
const tensOf = v => Math.floor(v / 10) * 10;
/* n/d as a mixed number, not reduced: 11/4 -> 2 3/4, 8/4 -> 2 */
const mx = (n, d) => { const w = Math.floor(n / d), r = n % d; return r === 0 ? nm(w) : w === 0 ? frac(r, d) : mixed(w, r, d); };
/* n/d in lowest terms, as a mixed number when it is more than 1 */
const fm = (n, d) => { const [a, b] = reduce(n, d); return mx(a, b); };
const digs = v => String(v).split('').reverse().map(Number);
const P10 = k => Math.pow(10, k);
/* forgot to carry: each column keeps only its ones digit */
function noCarry(a, b) { const x = digs(a), y = digs(b); let r = 0; for (let i = 0; i < Math.max(x.length, y.length); i++) r += ((x[i] || 0) + (y[i] || 0)) % 10 * P10(i); return r || null; }
/* took the smaller digit from the bigger one in every column */
function noBorrow(a, b) { const x = digs(a), y = digs(b); let r = 0; for (let i = 0; i < x.length; i++) r += Math.abs(x[i] - (y[i] || 0)) * P10(i); return r; }
/* small mental steps for 2-digit adding and taking away (tens first, then ones) */
function addSteps(a, b) { const t = tensOf(b), o = b % 10; if (!t || !o || b > 99) return [st(B(pl(a, b)) + ' = ?', a + b)]; return [st('Tens first: ' + B(pl(a, t)) + ' = ?', a + t), st('Then the ones: ' + B(pl(a + t, o)) + ' = ?', a + b)]; }
function subSteps(a, b) { const t = tensOf(b), o = b % 10; if (!t || !o || b > 99) return [st(B(mi(a, b)) + ' = ?', a - b)]; return [st('Take the tens first: ' + B(mi(a, t)) + ' = ?', a - t), st('Then the ones: ' + B(mi(a - t, o)) + ' = ?', a - b)]; }
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
/* every concept's traps: drop empty, negative or broken ones and repeats of the same value (the first one wins) */
function defs(list) {
  list.forEach(c => { const g0 = c.gen; c.gen = (d, R) => {
    const p = g0(d, R); if (!p) return p;
    if (!p.type && p.ans && typeof p.ans === 'object' && 'n' in p.ans) p.type = 'frac';
    if (p.traps) { const seen = new Set(); p.traps = p.traps.filter(t => {
      if (!t || t.v == null) return false;
      if (typeof t.v === 'number' && (!isFinite(t.v) || t.v < 0)) return false;
      if (typeof t.v === 'object' && 'n' in t.v && (!Number.isInteger(t.v.n) || !Number.isInteger(t.v.d) || t.v.d <= 0 || t.v.n < 0)) return false;
      const k = typeof t.v === 'number' ? 'v' + (+t.v.toFixed(9)) : 'n' in t.v ? 'f' + reduce(t.v.n, t.v.d).join('/') : JSON.stringify(t.v);
      if (seen.has(k)) return false; seen.add(k); return true; }); }
    return p; }; });
  C.defs(list);
}

/* ---------- pictures ---------- */
const SVG = (W, H, max) => '<svg class="fig" viewBox="0 0 ' + W.toFixed(0) + ' ' + H.toFixed(0) + '" style="max-width:' + (max || Math.min(420, W)).toFixed(0) + 'px" aria-hidden="true">';
const ptsAttr = pts => pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
/* a bar model: rows [{lab, segs:[{v, t, q}]}]; q segments are the unknown (left pale). o.brace puts a total over row 0 */
function bmSVG(rows, o) {
  o = o || {}; const LW = 70, BW = 250, RH = 34, GAP = 14, top = o.brace ? 30 : 6;
  const max = o.max || Math.max(...rows.map(r => sum(r.segs.map(s => s.v))));
  const W = LW + BW + 14, H = top + rows.length * (RH + GAP);
  let s = SVG(W, H, W);
  rows.forEach((r, j) => {
    let x = LW; const y = top + j * (RH + GAP);
    s += '<text x="' + (LW - 8) + '" y="' + (y + RH / 2 + 5) + '" class="fig-small" text-anchor="end">' + r.lab + '</text>';
    r.segs.forEach(sg => { const w = Math.max(24, sg.v / max * BW); s += '<rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + w.toFixed(1) + '" height="' + RH + '" class="' + (sg.q ? 'fig-cell' : 'fig-on') + '"/><text x="' + (x + w / 2).toFixed(1) + '" y="' + (y + RH / 2 + 6) + '" class="fig-lab">' + sg.t + '</text>'; x += w; });
    if (j === 0 && o.brace) s += '<path d="M' + LW + ' ' + (top - 4) + ' L' + LW + ' ' + (top - 12) + ' L' + x.toFixed(1) + ' ' + (top - 12) + ' L' + x.toFixed(1) + ' ' + (top - 4) + '" class="fig-thin"/><text x="' + ((LW + x) / 2).toFixed(1) + '" y="' + (top - 16) + '" class="fig-lab">' + o.brace + '</text>';
  });
  return s + '</svg>';
}
/* a flat shape from points in any units, scaled into a box; o.axes: dashed lines [[x1,y1,x2,y2]] in the same units */
function shapeSVG(pts, o) {
  o = o || {}; const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0, h = Math.max(...ys) - y0;
  const sc = Math.min(170 / w, 150 / h), pad = 24, W = w * sc + 2 * pad, H = h * sc + 2 * pad, P = p => [pad + (p[0] - x0) * sc, pad + (p[1] - y0) * sc];
  let s = SVG(W, H, o.max || Math.min(260, W * 1.2)) + '<polygon points="' + ptsAttr(pts.map(P)) + '" class="fig-shape"/>';
  (o.axes || []).forEach(a => { const p = P([a[0], a[1]]), q = P([a[2], a[3]]); s += '<line x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '" class="fig-thin" style="stroke:var(--bad);stroke-dasharray:6 4"/>'; });
  return s + '</svg>';
}
/* corners of a polygon with n sides: regular, or a little uneven (jit) so kids do not only meet the textbook look */
function polyPts(n, R, jit) {
  const out = [], rot = -Math.PI / 2 + (jit ? R.f() * 2 * Math.PI / n : 0);
  for (let i = 0; i < n; i++) { const a = rot + i * 2 * Math.PI / n + (jit ? (R.f() - 0.5) * 0.5 * 2 * Math.PI / n : 0), r = 1 - (jit ? R.f() * 0.15 : 0); out.push([Math.cos(a) * r, Math.sin(a) * r]); }
  return out;
}
/* unit cubes drawn in 3D: cells [[i, j, k]] (i to the right, j to the left, k up), back ones first */
const FACE = { top: 'fill:var(--surface);stroke:var(--ink);stroke-width:1.4;stroke-linejoin:round', ri: 'fill:color-mix(in srgb,var(--accent) 75%,var(--surface));stroke:var(--ink);stroke-width:1.4;stroke-linejoin:round', le: 'fill:color-mix(in srgb,var(--sky) 60%,var(--surface));stroke:var(--ink);stroke-width:1.4;stroke-linejoin:round' };
const iso = (i, j, k, a) => [(i - j) * a * 0.866, (i + j) * a * 0.5 - k * a];
function solidSVG(blocks, a, labels) {
  /* blocks: [{i0, j0, k0, l, w, h}] drawn in order; labels [{x, y, t, anc}] in 3D units turned to screen with iso */
  const faces = [];
  blocks.forEach(b => {
    const P = (i, j, k) => iso(b.i0 + i, b.j0 + j, b.k0 + k, a);
    faces.push([[P(0, 0, b.h), P(b.l, 0, b.h), P(b.l, b.w, b.h), P(0, b.w, b.h)], FACE.top]);
    faces.push([[P(b.l, 0, 0), P(b.l, b.w, 0), P(b.l, b.w, b.h), P(b.l, 0, b.h)], FACE.ri]);
    faces.push([[P(0, b.w, 0), P(b.l, b.w, 0), P(b.l, b.w, b.h), P(0, b.w, b.h)], FACE.le]);
  });
  const labs = (labels || []).map(l => { const p = iso(l.p[0], l.p[1], l.p[2], a); return { x: p[0] + (l.dx || 0), y: p[1] + (l.dy || 0), t: l.t, anc: l.anc }; });
  const xs = [], ys = []; faces.forEach(f => f[0].forEach(p => { xs.push(p[0]); ys.push(p[1]); })); labs.forEach(l => { xs.push(l.x + (l.anc === 'end' ? -34 : l.anc === 'start' ? 34 : 0)); ys.push(l.y - 14, l.y + 6); });
  const x0 = Math.min(...xs) - 10, y0 = Math.min(...ys) - 10, W = Math.max(...xs) - x0 + 10, H = Math.max(...ys) - y0 + 10;
  let s = SVG(W, H, Math.min(380, W * 1.3));
  faces.forEach(f => { s += '<polygon points="' + ptsAttr(f[0].map(p => [p[0] - x0, p[1] - y0])) + '" style="' + f[1] + '"/>'; });
  labs.forEach(l => { s += '<text x="' + (l.x - x0).toFixed(1) + '" y="' + (l.y - y0).toFixed(1) + '" class="fig-lab"' + (l.anc ? ' text-anchor="' + l.anc + '"' : '') + '>' + l.t + '</text>'; });
  return s + '</svg>';
}
/* a stack of unit cubes: sort by depth (i + j + k) so nearer cubes are drawn over farther ones */
function cubesSVG(cells) {
  const a = cells.length === 1 ? 46 : cells.length > 40 ? 20 : 24, sorted = cells.slice().sort((p, q) => (p[0] + p[1] + p[2]) - (q[0] + q[1] + q[2]) || p[2] - q[2]);
  return solidSVG(sorted.map(c => ({ i0: c[0], j0: c[1], k0: c[2], l: 1, w: 1, h: 1 })), a);
}
/* a ruler in inches marked in halves and quarters, objects [{a, b, t}] in quarter inches lying above it */
function ruler4SVG(maxIn, objs, halves) {
  const q = maxIn * 4, x = v => 22 + v * (296 / q), top = 10 + objs.length * 32, H = top + 62;
  let s = SVG(340, H, 440);
  objs.forEach((o, k) => { const y = 8 + k * 32; s += '<rect x="' + x(o.a).toFixed(1) + '" y="' + y + '" width="' + (x(o.b) - x(o.a)).toFixed(1) + '" height="20" rx="7" class="' + (k ? 'fig-bar alt' : 'fig-on') + '"/><text x="' + ((x(o.a) + x(o.b)) / 2).toFixed(1) + '" y="' + (y + 15) + '" class="fig-small" style="fill:var(--ink)">' + o.t + '</text>';
    s += '<line x1="' + x(o.a).toFixed(1) + '" y1="' + (y + 20) + '" x2="' + x(o.a).toFixed(1) + '" y2="' + top + '" class="fig-grid"/><line x1="' + x(o.b).toFixed(1) + '" y1="' + (y + 20) + '" x2="' + x(o.b).toFixed(1) + '" y2="' + top + '" class="fig-grid"/>'; });
  s += '<rect x="10" y="' + top + '" width="320" height="56" rx="4" class="fig-cell"/>';
  for (let v = 0; v <= q; v++) { if (halves && v % 2) continue; const len = v % 4 === 0 ? 18 : v % 2 === 0 ? 12 : 7; s += '<line x1="' + x(v).toFixed(1) + '" y1="' + top + '" x2="' + x(v).toFixed(1) + '" y2="' + (top + len) + '" class="fig-thin"/>'; if (v % 4 === 0) s += '<text x="' + x(v).toFixed(1) + '" y="' + (top + 36) + '" class="fig-small">' + v / 4 + '</text>'; }
  return s + '<text x="324" y="' + (top + 51) + '" class="fig-small" text-anchor="end">inches</text></svg>';
}
/* a measuring jug: marks every step, numbers every lab, water up to level, unit label */
function jugSVG(cap, step, lab, level, unit) {
  const H = 200, top = 16, bot = 186, y = v => bot - v / cap * (bot - top);
  let s = SVG(200, H, 220) + '<rect x="60" y="' + y(level).toFixed(1) + '" width="80" height="' + (bot - y(level)).toFixed(1) + '" style="fill:color-mix(in srgb,var(--sky) 55%,transparent)"/>';
  s += '<path d="M60 ' + (top - 8) + ' L60 ' + bot + ' L140 ' + bot + ' L140 ' + (top - 8) + '" class="fig-thin" style="stroke:var(--ink);stroke-width:3"/>';
  for (let v = step; v <= cap + 1e-9; v += step) { const big = Math.abs(v / lab - Math.round(v / lab)) < 1e-9; s += '<line x1="140" y1="' + y(v).toFixed(1) + '" x2="' + (big ? 124 : 130) + '" y2="' + y(v).toFixed(1) + '" class="fig-thin"/>'; if (big) s += '<text x="148" y="' + (y(v) + 5).toFixed(1) + '" class="fig-small" text-anchor="start">' + nm(v) + ' ' + unit + '</text>'; }
  return s + '</svg>';
}
/* a rectangle split into two parts by a dashed line: height h, widths w1 and w2; o.grid draws unit squares,
   o.l1 / o.l2 / o.lh are the labels, o.in1 / o.in2 the words inside each part */
function splitRectSVG(h, w1, w2, o) {
  o = o || {}; const w = w1 + w2, sc = Math.min(o.big ? 60 : 24, 260 / w, 150 / h), x0 = 46, y0 = 30, W = w * sc, Hh = h * sc;
  let s = SVG(W + 70, Hh + 50, Math.min(400, W + 70));
  s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (w1 * sc).toFixed(1) + '" height="' + Hh.toFixed(1) + '" class="fig-shape"/><rect x="' + (x0 + w1 * sc).toFixed(1) + '" y="' + y0 + '" width="' + (w2 * sc).toFixed(1) + '" height="' + Hh.toFixed(1) + '" class="fig-shape" style="fill:color-mix(in srgb,var(--accent) 22%,transparent)"/>';
  if (o.grid) { for (let i = 1; i < w; i++) if (i !== w1) s += '<line x1="' + (x0 + i * sc).toFixed(1) + '" y1="' + y0 + '" x2="' + (x0 + i * sc).toFixed(1) + '" y2="' + (y0 + Hh).toFixed(1) + '" class="fig-grid"/>'; for (let j = 1; j < h; j++) s += '<line x1="' + x0 + '" y1="' + (y0 + j * sc).toFixed(1) + '" x2="' + (x0 + W).toFixed(1) + '" y2="' + (y0 + j * sc).toFixed(1) + '" class="fig-grid"/>'; }
  s += '<line x1="' + (x0 + w1 * sc).toFixed(1) + '" y1="' + (y0 - 6) + '" x2="' + (x0 + w1 * sc).toFixed(1) + '" y2="' + (y0 + Hh + 6).toFixed(1) + '" class="fig-thin" style="stroke:var(--bad);stroke-width:3;stroke-dasharray:6 4"/>';
  s += '<text x="' + (x0 + w1 * sc / 2).toFixed(1) + '" y="' + (y0 - 9) + '" class="fig-lab">' + (o.l1 != null ? o.l1 : w1) + '</text><text x="' + (x0 + w1 * sc + w2 * sc / 2).toFixed(1) + '" y="' + (y0 - 9) + '" class="fig-lab">' + (o.l2 != null ? o.l2 : w2) + '</text>';
  s += '<text x="' + (x0 - 8) + '" y="' + (y0 + Hh / 2 + 6).toFixed(1) + '" class="fig-lab" text-anchor="end">' + (o.lh != null ? o.lh : h) + '</text>';
  if (o.in1) s += '<text x="' + (x0 + w1 * sc / 2).toFixed(1) + '" y="' + (y0 + Hh / 2 + 6).toFixed(1) + '" class="fig-lab">' + o.in1 + '</text>';
  if (o.in2) s += '<text x="' + (x0 + w1 * sc + w2 * sc / 2).toFixed(1) + '" y="' + (y0 + Hh / 2 + 6).toFixed(1) + '" class="fig-lab">' + o.in2 + '</text>';
  return s + '</svg>';
}
/* eighths as short labels for pictures: 11 -> "1⅜" */
const VF = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'];
const lab8 = v => { const w = Math.floor(v / 8), r = v % 8; return w === 0 && r === 0 ? '0' : (w ? String(w) : '') + VF[r]; };
/* a line plot: values are counts of eighths from lo to hi in jumps of step eighths; xs maps value -> number of X marks */
function linePlotSVG(lo, hi, step, xs, unit) {
  const n = (hi - lo) / step, W = 340, x = v => 26 + (v - lo) / (hi - lo) * (W - 52), maxC = Math.max(...Object.values(xs)), base = 26 + maxC * 20;
  let s = SVG(W, base + 52, 440) + '<line x1="10" y1="' + base + '" x2="' + (W - 10) + '" y2="' + base + '" class="fig-shape"/>';
  for (let i = 0; i <= n; i++) { const v = lo + i * step; s += '<line x1="' + x(v).toFixed(1) + '" y1="' + (base - 6) + '" x2="' + x(v).toFixed(1) + '" y2="' + (base + 6) + '" class="fig-thin"/><text x="' + x(v).toFixed(1) + '" y="' + (base + 24) + '" class="fig-small" style="font-size:14px">' + lab8(v) + '</text>';
    for (let k = 0; k < (xs[v] || 0); k++) { const cx = x(v), cy = base - 14 - k * 20; s += '<path d="M' + (cx - 6).toFixed(1) + ' ' + (cy - 6) + ' L' + (cx + 6).toFixed(1) + ' ' + (cy + 6) + ' M' + (cx + 6).toFixed(1) + ' ' + (cy - 6) + ' L' + (cx - 6).toFixed(1) + ' ' + (cy + 6) + '" style="stroke:var(--accent);stroke-width:3;stroke-linecap:round"/>'; } }
  return s + '<text x="' + (W / 2) + '" y="' + (base + 46) + '" class="fig-small">' + unit + '</text></svg>';
}
/* a unit square cut into cols × rows tiles with a × c of them shaded: the tiling picture for fraction areas */
function tileSVG(a, cols, c, rows, unit) {
  const S = 180, x0 = 40, y0 = 30, cw = S / cols, rh = S / rows;
  let s = SVG(S + 70, S + 60, 280);
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) s += '<rect x="' + (x0 + i * cw).toFixed(1) + '" y="' + (y0 + S - (j + 1) * rh).toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + rh.toFixed(1) + '" class="' + (i < a && j < c ? 'fig-on' : 'fig-cell') + '"/>';
  s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + S + '" height="' + S + '" style="fill:none;stroke:var(--ink);stroke-width:3"/>';
  s += '<text x="' + (x0 + S / 2) + '" y="' + (y0 - 10) + '" class="fig-small">1 ' + unit + '</text><text x="' + (x0 + S + 8) + '" y="' + (y0 + S / 2 + 5) + '" class="fig-small" text-anchor="start">1 ' + unit + '</text>';
  s += '<text x="' + (x0 + a * cw / 2).toFixed(1) + '" y="' + (y0 + S + 22) + '" class="fig-small" style="fill:var(--ink)">' + a + '/' + cols + '</text><text x="' + (x0 - 6) + '" y="' + (y0 + S - c * rh / 2 + 5).toFixed(1) + '" class="fig-small" style="fill:var(--ink)" text-anchor="end">' + c + '/' + rows + '</text>';
  return s + '</svg>';
}

const PARTS = { 2: 'halves', 3: 'thirds', 4: 'fourths', 5: 'fifths', 6: 'sixths', 8: 'eighths', 10: 'tenths', 12: 'twelfths' };
/* ---------- written lines for mixed numbers with the same bottom (a and b are counts of 1/den) ---------- */
function mixAddLines(a, b, den) {
  const w1 = Math.floor(a / den), r1 = a % den, w2 = Math.floor(b / den), r2 = b % den, W = w1 + w2, P = r1 + r2, out = [];
  out.push((W ? 'Wholes: ' + w1 + ' + ' + w2 + ' = ' + W + '. ' : '') + 'Parts: ' + frac(r1, den) + ' + ' + frac(r2, den) + ' = ' + frac(P, den) + '.');
  if (P >= den) out.push(frac(P, den) + ' = ' + mx(P, den) + ', so ' + W + ' + ' + mx(P, den) + ' = ' + mx(a + b, den) + '.');
  return out;
}
function mixSubLines(a, b, den) {
  const w1 = Math.floor(a / den), r1 = a % den, w2 = Math.floor(b / den), r2 = b % den, out = [];
  if (r2 === 0) { out.push('Wholes: ' + mi(w1, w2) + ' = ' + (w1 - w2) + '. The ' + frac(r1, den) + ' stays.'); return out; }
  if (r1 >= r2) { out.push('Wholes: ' + mi(w1, w2) + ' = ' + (w1 - w2) + '. Parts: ' + frac(r1, den) + ' ' + MINUS + ' ' + frac(r2, den) + ' = ' + frac(r1 - r2, den) + '.'); return out; }
  out.push((r1 ? frac(r1, den) + ' is less than ' + frac(r2, den) : w1 + ' has no ' + (PARTS[den] || 'parts') + ' to take ' + frac(r2, den) + ' from') + ', so trade 1 whole for ' + frac(den, den) + ': ' + mx(a, den) + ' = ' + (w1 - 1 ? (w1 - 1) : '') + (w1 - 1 ? ' ' : '') + frac(r1 + den, den) + '.');
  out.push((w1 - 1 - w2 || w1 - 1 ? 'Wholes: ' + mi(w1 - 1, w2) + ' = ' + (w1 - 1 - w2) + '. ' : '') + 'Parts: ' + frac(r1 + den, den) + ' ' + MINUS + ' ' + frac(r2, den) + ' = ' + frac(r1 + den - r2, den) + '.');
  return out;
}
/* "5/4 = 1 1/4 (= 1 1/2)" style ending: the answer as a mixed number, and in lowest terms when that differs */
const endFrac = (n, d) => { const [a, b] = reduce(n, d); return mx(n, d) + (b !== d && n % d ? ' = ' + mx(a, b) : ''); };

/* ---------- comparing decimals (places 2 = hundredths, 3 = thousandths); values are whole numbers of that place ---------- */
const decS = (v, p) => nm(v / P10(p));
const decFull = (v, p) => { const w = Math.floor(v / P10(p)); return w + '.' + String(v % P10(p)).padStart(p, '0'); };
const placeName = p => p === 2 ? 'hundredths' : 'thousandths';
/* the wrong order kids get when they read the digits after the point as a whole number (0.45 > 0.5) */
const digitsAsWhole = (v, p) => { const s = decS(v, p).split('.'); return +s[0] * 1e4 + (s[1] ? +s[1] : 0); };
function orderProblem(vals, p, ask, cc) {
  const desc = vals.slice().sort((x, y) => y - x), asc = desc.slice().reverse();
  const [list, k, word] = ask === 'big' ? [desc, 0, 'biggest'] : ask === 'small' ? [asc, 0, 'smallest'] : ask === 'big2' ? [desc, 1, 'second biggest'] : [asc, 1, 'second smallest'];
  const ans = list[k], wrongList = vals.slice().sort((x, y) => (ask === 'big' || ask === 'big2' ? -1 : 1) * (digitsAsWhole(x, p) - digitsAsWhole(y, p)));
  const wrong = wrongList[k];
  const text = 'Which number is the ' + B(word) + '? ' + vals.map(v => B(decS(v, p))).join(', ');
  const how = ['Write each one with ' + p + ' places: ' + vals.map(v => decFull(v, p)).join(', ') + '.', 'Read them as ' + placeName(p) + ': ' + vals.map(v => nm(v)).join(', ') + '.', (ask === 'big' || ask === 'big2' ? 'From biggest: ' : 'From smallest: ') + list.map(v => decS(v, p)).join(', ') + '. The ' + word + ' is ' + B(decS(ans, p)) + '.'];
  const steps = vals.filter(v => String(decS(v, p)).split('.')[1] && String(decS(v, p)).split('.')[1].length < p).slice(0, 2).map(v => st(B(decS(v, p)) + ' = how many ' + placeName(p) + '? (' + decS(v, p) + ' = ' + decFull(v, p) + ')', v)).concat([st('Which number is the ' + word + '?', ans / P10(p))]);
  return { text, ans: ans / P10(p), how, steps,
    traps: [tr(wrong / P10(p), cc, 'More digits does not mean bigger. Give every number ' + p + ' places, then compare.'), tr(list[k === 0 ? 1 : 0] / P10(p), cc, 'Line the numbers up by place and check the order again.')] };
}
/* the smallest digit that makes the number with a box bigger (or the biggest digit that keeps it smaller) */
function digitProblem(R, p, bigger, cc) {
  const W = p === 3 && R.chance(0.5) ? R.i(1, 9) : 0, pos = p === 3 ? R.i(1, 2) : 1;
  /* the target t and a template with one box at decimal place pos (1 = tenths, 2 = hundredths) */
  const t = W * P10(p) + R.i(P10(p) / 10 + 1, P10(p) - P10(p - 1) - 1);
  const tDig = String(t % P10(p)).padStart(p, '0').split('').map(Number);
  const others = tDig.map((x, i) => i === pos - 1 ? null : (i < pos - 1 ? x : R.i(0, 9)));
  const valWith = dg => W * P10(p) + +others.map(x => x === null ? dg : x).join('');
  let ans = null;
  if (bigger) { for (let dg = 0; dg <= 9; dg++) if (valWith(dg) > t) { ans = dg; break; } }
  else { for (let dg = 9; dg >= 0; dg--) if (valWith(dg) < t) { ans = dg; break; } }
  if (ans === null || ans === 0 || ans === 9) return null;
  const boxStr = W + '.' + others.map(x => x === null ? '□' : x).join(''), tS = decS(t, p);
  const same = tDig[pos - 1], sameV = valWith(same), sameOK = bigger ? sameV > t : sameV < t;
  const pn = ['tenths', 'hundredths', 'thousandths'][pos - 1];
  const how = ['Compare ' + boxStr + ' with ' + tS + ' place by place, from the left.' + (pos > 1 ? ' The places before the box match.' : ''),
    'Try ' + same + ' in the box (the same ' + pn + ' digit): ' + decFull(sameV, p) + ' is ' + (sameV > t ? 'bigger' : sameV < t ? 'smaller' : 'the same') + ', so ' + same + (sameOK ? ' works.' : ' does not work.'),
    sameOK ? 'Try ' + (bigger ? same - 1 : same + 1) + ': ' + decFull(valWith(bigger ? same - 1 : same + 1), p) + ' is ' + (bigger ? 'smaller' : 'bigger') + '. So the answer is ' + B(ans) + '.' : 'So go one ' + (bigger ? 'up' : 'down') + ': ' + ans + ' gives ' + decFull(valWith(ans), p) + '. The answer is ' + B(ans) + '.'];
  return { text: 'What is the ' + B(bigger ? 'smallest' : 'biggest') + ' digit that can go in the box to make ' + B(boxStr) + (bigger ? ' bigger than ' : ' smaller than ') + B(tS) + '?', ans, how,
    steps: [st('Try ' + same + ' in the box. Type the number you get.', sameV / P10(p)), st('What is the ' + (bigger ? 'smallest' : 'biggest') + ' digit that works?', ans)],
    traps: [tr(sameOK ? (bigger ? ans + 1 : ans - 1) : same, cc, sameOK ? 'Check the next places: with the same ' + pn + ' digit the later digits decide.' : 'With the same ' + pn + ' digit, look at the next places: they decide.'), tr(bigger ? 9 : 0, cc, 'The question asks for the ' + (bigger ? 'smallest' : 'biggest') + ' digit that works.')] };
}

defs([
/* =================== Grade 2 =================== */
{ id: 's_length', s: 'story', g: 2, title: 'Length stories', pre: ['g_length'], paper: true, cc: ['2.MD.B.5'],
  tip: 'Draw a bar for each length. Laid end to end? Add them. Cut off, or how much longer? Take away. Keep the same unit all the way through.',
  gen(d, R) {
    const [A, Bn] = people(R);
    const [u, things] = R.pick([['cm', ['ribbon', 'string', 'paper strip', 'piece of yarn']], ['inches', ['ribbon', 'rope', 'board', 'stick']], ['feet', ['rope', 'board', 'hose', 'ribbon']], ['meters', ['rope', 'hose', 'ribbon', 'string']]]);
    const [t1, t2] = R.shuffle(things);
    const kind = R.pick(d === 0 ? ['join', 'cut'] : d === 1 ? ['join', 'cut', 'longer'] : ['start', 'more', 'three']);
    const one = (segs, brace) => bmSVG([{ lab: '', segs }], { brace });
    if (kind === 'join') {
      const a = d === 0 ? R.i(10, 30) : R.i(18, 59), b = d === 0 ? R.i(5, 20) : R.i(15, 45), s = a + b;
      if (s > (d === 0 ? 50 : 99) || (d === 1 && a % 10 + b % 10 < 10)) return null;
      return { text: 'Two ' + (t1 === 'piece of yarn' ? 'pieces of yarn' : t1 + 's') + ' are laid end to end. One is ' + B(a + ' ' + u) + ' long and the other is ' + B(b + ' ' + u) + ' long. How long are they together?', ans: s, unit: u, howVis: one([{ v: a, t: a }, { v: b, t: b }], '?'),
        how: ['Bar: the two parts are ' + a + ' and ' + b + '. The whole is ?.', pl(a, b) + ' = ' + s + '.', 'Together they are ' + B(s) + ' ' + u + ' long.'],
        steps: addSteps(a, b),
        traps: [tr(a - b, 's_join', 'End to end makes one longer length: put the two parts together.'), tr(noCarry(a, b), 'a_regroup', 'The ones made 10 or more. Trade 10 ones for a ten.'), tr(s - 10, 'a_split', 'Check the tens: ' + tensOf(a) + ' + ' + tensOf(b) + ' first, then the ones.')] };
    }
    if (kind === 'cut' || kind === 'longer') {
      const a = d === 0 ? R.i(20, 50) : R.i(40, 99), b = d === 0 ? R.i(5, a - 6) : R.i(11, a - 8), r = a - b;
      if (d === 1 && a % 10 >= b % 10 && R.chance(0.7)) return null;
      if (kind === 'cut') return { text: A + ' has a ' + t1 + ' that is ' + B(a + ' ' + u) + ' long. ' + A + ' cuts off ' + B(b + ' ' + u) + '. How long is the piece that is left?', ans: r, unit: u, howVis: one([{ v: b, t: b }, { v: r, t: '?', q: 1 }], a),
        how: ['Bar: the whole is ' + a + '. A part of ' + b + ' is cut off. The part left is ?.', mi(a, b) + ' = ' + r + '.', 'The piece left is ' + B(r) + ' ' + u + ' long.'],
        steps: subSteps(a, b),
        traps: [tr(a + b, 's_join', 'Cutting a piece off makes it shorter: take away.'), tr(noBorrow(a, b), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones first.'), tr(r + 10, 'a_subsplit', 'Check the tens when you take away.')] };
      return { text: A + '\'s ' + t1 + ' is ' + B(a + ' ' + u) + ' long. ' + Bn + '\'s ' + t2 + ' is ' + B(b + ' ' + u) + ' long. How much longer is ' + A + '\'s ' + t1 + '?', ans: r, unit: u,
        howVis: bmSVG([{ lab: A, segs: [{ v: a, t: a }] }, { lab: Bn, segs: [{ v: b, t: b }, { v: r, t: '?', q: 1 }] }]),
        how: ['Bar: ' + A + '\'s bar is ' + a + '. ' + Bn + '\'s bar is ' + b + ', with a gap of ? to match.', b + ' + ? = ' + a + ', so take away: ' + mi(a, b) + ' = ' + r + '.', A + '\'s ' + t1 + ' is ' + B(r) + ' ' + u + ' longer.'],
        steps: subSteps(a, b),
        traps: [tr(a + b, 's_compare', 'How much longer asks for the gap between the bars, not the total.'), tr(noBorrow(a, b), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones first.')] };
    }
    if (kind === 'start') {
      const b = R.i(12, 45), r = R.i(15, 50), a = b + r; if (a > 99) return null;
      return { text: A + ' cut ' + B(b + ' ' + u) + ' off a ' + t1 + '. Now the ' + t1 + ' is ' + B(r + ' ' + u) + ' long. How long was the ' + t1 + ' at first?', ans: a, unit: u, howVis: one([{ v: b, t: b }, { v: r, t: r }], '?'),
        how: ['Bar: the whole is ? (the ' + t1 + ' at first). Its parts are ' + b + ' (cut off) and ' + r + ' (left).', 'The whole is missing, so add: ' + pl(r, b) + ' = ' + a + '.', 'The ' + t1 + ' was ' + B(a) + ' ' + u + ' long at first.'],
        steps: [st('What are the two parts? Type the part that was cut off.', b)].concat(addSteps(r, b)),
        traps: [tr(Math.abs(r - b), 's_join', 'The ' + t1 + ' was longer before the cut. The cut piece and the piece left make the whole.'), tr(noCarry(r, b), 'a_regroup', 'The ones made 10 or more. Trade 10 ones for a ten.')] };
    }
    if (kind === 'more') {
      const b = R.i(15, 60), T = R.i(b + 12, 99), m = T - b;
      if (T % 10 === 0 && R.chance(0.5)) return null;
      const t1 = R.pick(['rope', 'ribbon', 'string', 'yarn']);
      return { text: A + ' has ' + B(b + ' ' + u) + ' of ' + t1 + '. ' + A + ' needs ' + B(T + ' ' + u) + ' for a project. How many more ' + u + ' of ' + t1 + ' does ' + A + ' need?', ans: m, unit: u, howVis: one([{ v: b, t: b }, { v: m, t: '?', q: 1 }], T),
        how: ['Bar: the whole is ' + T + '. ' + A + ' has a part of ' + b + '. The part still needed is ?.', b + ' + ? = ' + T + ', so take away: ' + mi(T, b) + ' = ' + m + '.', A + ' needs ' + B(m) + ' more ' + u + '.'],
        steps: subSteps(T, b),
        traps: [tr(T + b, 's_join', A + ' already has ' + b + '. Find the missing part, the gap up to ' + T + '.'), tr(noBorrow(T, b), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones first.'), tr(m + 10, 'a_countup', 'Count up from ' + b + ' to ' + T + ': to the next ten, then on.')] };
    }
    const a = R.i(11, 35), b = R.i(11, 35), c = R.i(6, 30), ab = a + b, s = ab + c; if (s > 99) return null;
    const frog = u === 'cm' || u === 'inches', who = frog ? 'A frog' : A, verb = frog ? 'hops' : 'walks', part = frog ? 'hop' : 'walk';
    return { text: who + ' ' + verb + ' ' + B(a + ' ' + u) + ', then ' + B(b + ' ' + u) + ', then ' + B(c + ' ' + u) + ', all in a straight line. How far does ' + (frog ? 'it ' + 'hop' : A + ' walk') + ' in all?', ans: s, unit: u, howVis: one([{ v: a, t: a }, { v: b, t: b }, { v: c, t: c }], '?'),
      how: ['Bar: three parts, ' + a + ', ' + b + ' and ' + c + '. The whole is ?.', 'First two: ' + pl(a, b) + ' = ' + ab + '.', 'Then: ' + pl(ab, c) + ' = ' + s + '.', (frog ? 'The frog' : A) + ' ' + verb + ' ' + B(s) + ' ' + u + ' in all.'],
      steps: [st('First two ' + part + 's: ' + B(pl(a, b)) + ' = ?', ab), st('Add the last ' + part + ': ' + B(pl(ab, c)) + ' = ?', s)],
      traps: [tr(ab, 's_join', 'There are three parts. Add the last one too.'), tr(noCarry(ab, c), 'a_regroup', 'The ones made 10 or more. Trade 10 ones for a ten.'), tr(a + c, 's_join', 'Add all three parts.')] };
  } },

{ id: 'g_shapecount', s: 'meas', g: 2, title: 'Sides, corners and faces', pre: [], cc: ['2.G.A.1'],
  tip: 'Touch each side once as you count. A flat shape has as many corners as sides: triangle 3, quadrilateral 4, pentagon 5, hexagon 6. A cube has 6 square faces.',
  gen(d, R) {
    const SH = { 3: ['triangle', 'triangles'], 4: ['quadrilateral', 'quadrilaterals'], 5: ['pentagon', 'pentagons'], 6: ['hexagon', 'hexagons'] };
    const mixT = { 3: [4, 'A triangle is a three-sided shape: tri means 3, like a tricycle.'], 4: [3, 'Quad means 4, like the 4 sides of a square.'], 5: [6, 'Hexagons and pentagons are easy to mix up. A hexagon has an x, like six.'], 6: [5, 'Hexagons and pentagons are easy to mix up. A hexagon has an x, like six.'] };
    if (d === 0) {
      const n = R.i(3, 6), corners = R.chance(0.5), what = corners ? 'corners' : 'sides';
      const cnt = Array.from({ length: n }, (_, i) => i + 1).join(', ');
      return { text: 'How many ' + B(what) + ' does this shape have?', ans: n, vis: shapeSVG(polyPts(n, R, R.chance(0.6))),
        how: [corners ? 'A corner is where two sides meet. Touch each corner once: ' + cnt + '.' : 'Touch each side once, going all the way around: ' + cnt + '.', 'It has ' + B(n) + ' ' + what + ', so it is a ' + SH[n][0] + '.'],
        steps: corners ? [st('Count the sides first. How many sides?', n)] : [st('Count the corners first. How many corners?', n)],
        traps: [tr(n + 1, 'g_shapecount', 'Mark the ' + (corners ? 'corner' : 'side') + ' you start on so you do not count it twice.'), tr(n - 1, 'g_shapecount', 'Keep going all the way around, back to where you started.')] };
    }
    if (d === 1) {
      const kind = R.pick(['side', 'corner', 'side', 'cube']);
      if (kind === 'cube') return { text: 'Some faces are hidden at the back. How many ' + B('faces') + ' does a cube have?', ans: 6, vis: cubesSVG([[0, 0, 0]]),
        how: ['A face is a flat side. You can see the top, the front left and the front right.', 'There are 3 more you cannot see: the bottom and two at the back. 3 + 3 = ' + B(6) + ' faces.'],
        steps: [st('How many faces can you see in the picture?', 3), st('The hidden ones match them: ' + B('3 + 3') + ' = ?', 6)],
        traps: [tr(3, 'g_shapecount', 'Count the faces you cannot see too: the bottom and the back.'), tr(4, 'g_shapecount', 'Think of a dice: top, bottom, front, back, left and right.'), tr(8, 'g_shapecount', 'Corners are the points. Faces are the flat squares.')] };
      const n = R.i(3, 6), what = kind === 'side' ? 'sides' : 'corners';
      return { text: 'How many ' + B(what) + ' does a ' + B(SH[n][0]) + ' have?', ans: n,
        how: [cap(SH[n][0]) + ': ' + ({ 3: 'tri means 3', 4: 'quad means 4', 5: 'penta means 5', 6: 'hexa means 6' })[n] + '.', 'It has ' + n + ' sides, and the same number of corners: ' + B(n) + ' ' + what + '.'],
        steps: [st('How many sides does a ' + SH[n][0] + ' have?', n)].concat(kind === 'corner' ? [st('Corners are where sides meet. How many corners?', n)] : []),
        traps: [tr(mixT[n][0], 'g_shapecount', mixT[n][1]), kind === 'corner' ? tr(n * 2, 'g_shapecount', 'A flat shape has as many corners as sides.') : tr(n + 1, 'g_shapecount', 'Picture the shape and count each side once.')] };
    }
    const kind = R.pick(['total', 'total', 'sticks', 'diff', 'cubes']);
    const [A] = people(R);
    if (kind === 'total') {
      const ns = R.shuffle([3, 4, 5, 6]).slice(0, R.pick([2, 2, 3])), ks = ns.map(() => R.i(1, 3)), parts = ns.map((n, i) => n * ks[i]), T = sum(parts);
      const nameOf = (n, k) => n === 4 && R.chance(0.5) ? (k === 1 ? 'square' : 'squares') : (k === 1 ? SH[n][0] : SH[n][1]);
      const names = ns.map((n, i) => nameOf(n, ks[i])), list = names.map((nmx, i) => (ks[i] === 1 ? (/^[aeiou]/.test(nmx) ? 'an ' : 'a ') : ks[i] + ' ') + nmx);
      const what = R.chance(0.5) ? 'sides' : 'corners', listTxt = list.length === 2 ? list.join(' and ') : list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
      const vis = '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">' + ns.map((n, i) => Array.from({ length: ks[i] }, () => shapeSVG(n === 4 && names[i].startsWith('square') ? [[0, 0], [1, 0], [1, 1], [0, 1]] : polyPts(n, R, false), { max: 80 })).join('')).join('') + '</div>';
      const lineOf = i => (ks[i] === 1 ? 'A ' + names[i] + ': ' + ns[i] + ' ' + what : ks[i] + ' ' + names[i] + ': ' + Array(ks[i]).fill(ns[i]).join(' + ') + ' = ' + parts[i] + ' ' + what) + '.';
      return { text: A + ' draws ' + listTxt + '. How many ' + B(what) + ' are there in all?', ans: T, vis,
        how: ns.map((_, i) => lineOf(i)).concat(['In all: ' + parts.join(' + ') + ' = ' + B(T) + ' ' + what + '.']),
        steps: ns.map((n, i) => st('How many ' + what + (ks[i] === 1 ? ' does the ' : ' do the ') + names[i] + ' have?', parts[i])).concat([st('Add them: ' + B(parts.join(' + ')) + ' = ?', T)]).slice(-4),
        traps: [tr(sum(ks), 'g_shapecount', 'That counts the shapes. Count the ' + what + ' on each shape.'), tr(sum(ns), 'g_shapecount', 'Some shapes come more than once. Count the ' + what + ' on every one.'), tr(T - parts[parts.length - 1], 'g_shapecount', 'Add every shape.')] };
    }
    if (kind === 'sticks') {
      const n = R.i(3, 6), k = R.i(2, 4), T = n * k;
      return { text: A + ' makes ' + B(k) + ' ' + SH[n][1] + ' out of sticks, with one stick for each side. How many sticks does ' + A + ' use?', ans: T, unit: 'sticks',
        how: ['A ' + SH[n][0] + ' has ' + n + ' sides, so each one needs ' + n + ' sticks.', k + ' ' + SH[n][1] + ': ' + Array(k).fill(n).join(' + ') + ' = ' + B(T) + ' sticks.'],
        steps: [st('How many sticks for one ' + SH[n][0] + '?', n), st(B(Array(k).fill(n).join(' + ')) + ' = ?', T)],
        traps: [tr(mixT[n][0] * k, 'g_shapecount', mixT[n][1]), tr(n + k, 'm_groups', 'Each ' + SH[n][0] + ' needs its own ' + n + ' sticks: add ' + n + ' for every shape.')] };
    }
    if (kind === 'diff') {
      const a = R.i(4, 6), b = R.i(3, a - 1), what = R.chance(0.5) ? 'sides' : 'corners';
      return { text: 'How many more ' + B(what) + ' does a ' + B(SH[a][0]) + ' have than a ' + B(SH[b][0]) + '?', ans: a - b,
        how: ['A ' + SH[a][0] + ' has ' + a + ' ' + what + '. A ' + SH[b][0] + ' has ' + b + '.', mi(a, b) + ' = ' + B(a - b) + ' more.'],
        steps: [st('How many ' + what + ' does a ' + SH[a][0] + ' have?', a), st('How many ' + what + ' does a ' + SH[b][0] + ' have?', b), st(B(mi(a, b)) + ' = ?', a - b)],
        traps: [tr(a + b, 's_compare', 'How many more asks for the difference.'), tr(Math.abs(mixT[a][0] - b) || null, 'g_shapecount', mixT[a][1])] };
    }
    const k = R.i(2, 4), T = 6 * k;
    return { text: A + ' paints every face of ' + B(k) + ' cubes, one face at a time. How many faces does ' + A + ' paint?', ans: T, unit: 'faces', vis: cubesSVG([[0, 0, 0]]),
      how: ['Each cube has 6 faces: 3 you can see and 3 hidden.', k + ' cubes: ' + Array(k).fill(6).join(' + ') + ' = ' + B(T) + ' faces.'],
      steps: [st('How many faces does one cube have?', 6), st(B(Array(k).fill(6).join(' + ')) + ' = ?', T)],
      traps: [tr(3 * k, 'g_shapecount', 'Each cube also has 3 faces you cannot see.'), tr(8 * k, 'g_shapecount', 'A cube has 8 corners but 6 faces.'), tr(6 + k, 'm_groups', 'Every cube has its own 6 faces: add 6 for each cube.')] };
  } },

{ id: 'a_hopline', s: 'add', g: 2, title: 'Hops on a number line', pre: ['n_tenmore'], cc: ['2.MD.B.6'],
  tip: 'Start at the first number. Big hops for the tens, small hops for the ones. 38 + 25: hop +20 to 58, then +5 to 63.',
  gen(d, R) {
    const lbl = (show, q) => v => q.includes(v) ? '?' : show.includes(v) ? nm(v) : '';
    if (d === 0) {
      const a = R.i(11, 59), tenHops = R.chance(0.35), T = R.i(1, tenHops ? 3 : 4) * 10, o = R.i(2, 9), end = a + T + o;
      if (end > 99) return null;
      const hops = tenHops ? Array(T / 10).fill(10).concat([o]) : [T, o];
      return { text: 'Start at ' + B(a) + '. Make the hops: ' + B(hops.map(h => '+' + h).join(', ')) + '. Where do you land?', ans: end,
        vis: hopsSVG(a, hops, { fmt: lbl([a], [end]) }),
        how: [(tenHops ? 'Each +10 hop changes only the tens: ' + hops.slice(0, -1).map((h, i) => nm(a + 10 * (i + 1))).join(', ') + '.' : 'The +' + T + ' hop changes only the tens: ' + a + ' + ' + T + ' = ' + (a + T) + '.'), 'Then hop +' + o + ': ' + pl(a + T, o) + ' = ' + (a + T + o) + '.', 'You land on ' + B(end) + '. So ' + pl(a, T + o) + ' = ' + end + '.'],
        steps: [st('After the tens: ' + B(pl(a, T)) + ' = ?', a + T), st('Then the ones: ' + B(pl(a + T, o)) + ' = ?', end)],
        traps: [tr(a + T, 'a_hopline', 'Make every hop, the small one too.'), tr(noCarry(a + T, o), 'a_regroup', 'The ones made 10 or more, so you hop past a ten.'), tr(a + T / 10 + o, 'a_tens', 'A hop of +' + T + ' is ' + T / 10 + ' tens, not ' + T / 10 + ' ones.')] };
    }
    if (d === 1 && R.chance(0.5)) {
      const a = R.i(52, 99), T = R.i(2, Math.floor((a - 10) / 10)) * 10, o = R.i(2, 9), end = a - T - o; if (end < 5 || a % 10 === 0) return null;
      return { text: 'Start at ' + B(a) + '. Hop back ' + B(T) + ', then hop back ' + B(o) + '. Where do you land?', ans: end,
        vis: hopsSVG(a, [-T, -o], { fmt: lbl([a], [end]) }),
        how: ['Hopping back ' + T + ' changes only the tens: ' + mi(a, T) + ' = ' + (a - T) + '.', 'Then hop back ' + o + ': ' + mi(a - T, o) + ' = ' + end + '.', 'You land on ' + B(end) + '. So ' + mi(a, T + o) + ' = ' + end + '.'],
        steps: [st('After the tens: ' + B(mi(a, T)) + ' = ?', a - T), st('Then the ones: ' + B(mi(a - T, o)) + ' = ?', end)],
        traps: [tr(a - T, 'a_hopline', 'Make both hops back.'), tr(noBorrow(a - T, o), 'a_borrow', 'Hopping back ' + o + ' goes past a ten: trade a ten for 10 ones.'), tr(a - T + o, 'a_hopline', 'Hopping back means taking away, every time.')] };
    }
    if (d === 1) {
      const a = R.i(12, 58), b = a + R.i(21, 45); if (a % 10 === 0 || b % 10 === 0 || b > 99) return null;
      const u = 10 - a % 10, T = tensOf(b) - (a + u), o = b % 10, D = b - a; if (T <= 0) return null;
      return { text: 'Add up the hops. How far is it from ' + B(a) + ' to ' + B(b) + '?', ans: D,
        vis: hopsSVG(a, [u, T, o], { fmt: lbl([a, a + u, tensOf(b), b], []) }),
        how: ['Hop to the next ten: ' + pl(a, u) + ' = ' + (a + u) + '. That hop is ' + u + '.', 'Hop the tens: ' + pl(a + u, T) + ' = ' + tensOf(b) + '. That hop is ' + T + '.', 'Hop the rest: ' + pl(tensOf(b), o) + ' = ' + b + '. That hop is ' + o + '.', 'Add the hops: ' + u + ' + ' + T + ' + ' + o + ' = ' + B(D) + '. So ' + mi(b, a) + ' = ' + D + '.'],
        steps: [st('First hop, up to ' + (a + u) + ': how big?', u), st('Tens hop, ' + (a + u) + ' to ' + tensOf(b) + ': how big?', T), st('Add the hops: ' + B(u + ' + ' + T + ' + ' + o) + ' = ?', D)],
        traps: [tr(noBorrow(b, a), 'a_borrow', 'Count the hops instead of taking digits away: to the next ten, the tens, then the rest.'), tr(u + T, 'a_countup', 'Add the last small hop too.'), tr(a + b, 'a_countup', 'How far from ' + a + ' to ' + b + ' is the distance between them: add up the hops.')] };
    }
    const kind = R.pick(['misshop', 'missback', 'start']);
    if (kind === 'misshop' || kind === 'missback') {
      const back = kind === 'missback', a = back ? R.i(55, 99) : R.i(12, 50), T = R.i(2, 4) * 10, o = R.i(2, 9), mid = back ? a - T : a + T, end = back ? mid - o : mid + o;
      if (end < 5 || end > 99 || a % 10 === 0 || T === o) return null;
      return { text: 'Start at ' + B(a) + '. Hop ' + (back ? 'back ' + B(T) : B('+' + T)) + ', then make one more hop ' + (back ? 'back ' : '') + 'to land on ' + B(end) + '. How big is the last hop?', ans: o,
        vis: hopsSVG(a, back ? [-T, -o] : [T, o], { fmt: lbl([a, end], []), lab: v => v === o ? '?' : nm(v) }),
        how: ['After the first hop: ' + (back ? mi(a, T) : pl(a, T)) + ' = ' + mid + '.', 'From ' + mid + ' to ' + end + ': ' + (back ? mid + ' ' + MINUS + ' ? = ' + end + ', so ? = ' + mi(mid, end) : mid + ' + ? = ' + end + ', so ? = ' + mi(end, mid)) + '.', 'The last hop is ' + B(o) + '.'],
        steps: [st('Where are you after the first hop? ' + B(back ? mi(a, T) : pl(a, T)) + ' = ?', mid), st('From ' + mid + ' to ' + end + ' is how far?', o)],
        traps: [tr(Math.abs(end - a), 'a_hopline', 'That is the whole trip. Take away the ' + T + ' you already hopped.'), tr(end, 'a_hopline', 'That is where you land. The question asks how big the last hop is.'), tr(Math.abs(end - a) + T, 'a_hopline', 'The first hop already went ' + T + '. What is left?')] };
    }
    const T = R.i(2, 5) * 10, o = R.i(2, 9), a = R.i(12, 99 - T - o), end = a + T + o; if (a % 10 === 0) return null;
    return { text: 'You start somewhere, hop ' + B('+' + T) + ', then hop ' + B('+' + o) + ', and land on ' + B(end) + '. Where did you start?', ans: a,
      vis: hopsSVG(a, [T, o], { fmt: lbl([end], [a]) }),
      how: ['Go backwards from the end: undo each hop.', 'Undo +' + o + ': ' + mi(end, o) + ' = ' + (end - o) + '.', 'Undo +' + T + ': ' + mi(end - o, T) + ' = ' + B(a) + '. You started at ' + a + '.'],
      steps: [st('Undo the last hop: ' + B(mi(end, o)) + ' = ?', end - o), st('Undo the tens hop: ' + B(mi(end - o, T)) + ' = ?', a)],
      traps: [tr(end + T + o, 'a_hopline', 'The hops went forward to ' + end + ', so the start is smaller than ' + end + '. Hop back.'), tr(end - T, 'a_hopline', 'Undo both hops.'), tr(noBorrow(end, T + o), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones first.')] };
  } },

/* =================== Grade 3 =================== */
{ id: 'g_massvol', s: 'meas', g: 3, title: 'Grams, kilograms and liters', pre: ['m_divfam'], cc: ['3.MD.A.2'],
  tip: 'Grams and kilograms measure how heavy something is; liters measure how much a jug holds. Keep the same unit, then add, take away, times or divide.',
  gen(d, R) {
    const [A] = people(R);
    const KG = ['a bag of potatoes', 'a box of books', 'a bag of rice', 'a watermelon', 'a pumpkin', 'a bag of sand'];
    const kind = R.pick(d === 0 ? ['jug', 'add', 'sub'] : d === 1 ? ['jug2', 'groups', 'share', 'gsub'] : ['compare', 'gadd', 'share2', 'groups2']);
    if (kind === 'jug' || kind === 'jug2') {
      const [cap, step, lab] = kind === 'jug' ? R.pick([[10, 1, 2], [10, 1, 5], [20, 1, 5]]) : R.pick([[20, 2, 10], [50, 5, 10], [40, 2, 10]]);
      let lv; do lv = step * R.i(1, cap / step - 1); while (lv % lab === 0);
      const below = Math.floor(lv / lab) * lab, k = (lv - below) / step;
      return { text: 'How many ' + B('liters') + ' of water are in the jug?', ans: lv, unit: 'liters', vis: jugSVG(cap, step, lab, lv, 'L'),
        how: ['From ' + below + ' to ' + (below + lab) + ' there are ' + lab / step + ' jumps, so each small mark is ' + lab + ' ÷ ' + (lab / step) + ' = ' + step + ' ' + plural(step, 'liter') + '.', 'The water is ' + plural(k, '1 mark', k + ' marks') + ' above ' + below + ': ' + below + (step === 1 ? ' + ' + k : ' + ' + k + ' × ' + step) + ' = ' + B(lv) + ' liters.'],
        steps: [st('How many liters is each small mark worth?', step), st('What is the last number below the water?', below), st('Count on the marks. How many liters?', lv)],
        traps: [tr(lv + step, 'n_numline', 'Count the jumps above ' + below + ', not the lines.'), step > 1 ? tr(below + k, 'n_numline', 'Each small mark is ' + step + ' liters, not 1.') : tr(lv - step, 'n_numline', 'Count every jump up to the top of the water.'), tr(cap - lv, 'g_massvol', 'Read where the top of the water is, from the bottom up.')] };
    }
    if (kind === 'add' || kind === 'sub') {
      const kg = R.chance(0.5);
      if (kind === 'add') {
        const [x, y] = R.shuffle(KG), a = R.i(2, 12), b = R.i(2, 9), s = a + b;
        if (!kg) return { text: 'A fish tank has ' + B(a + ' liters') + ' of water. ' + A + ' pours in ' + B(b + ' liters') + ' more. How many liters are in the tank now?', ans: s, unit: 'liters',
          how: ['Pouring in more makes it bigger: add.', pl(a, b) + ' = ' + B(s) + ' liters.'], steps: [st(B(pl(a, b)) + ' = ?', s)],
          traps: [tr(Math.abs(a - b), 'g_massvol', 'Pouring water in makes more: add.'), tr(s - 1, 'a_make10', 'Count on carefully, or make a 10 first.')] };
        return { text: cap(x) + ' has a mass of ' + B(a + ' kg') + '. ' + cap(y) + ' has a mass of ' + B(b + ' kg') + '. What is their mass together?', ans: s, unit: 'kg',
          how: ['Together means put the masses together: add.', pl(a, b) + ' = ' + B(s) + ' kg.'], steps: [st(B(pl(a, b)) + ' = ?', s)],
          traps: [tr(Math.abs(a - b), 'g_massvol', 'Together means add the two masses.'), tr(s - 1, 'a_make10', 'Count on carefully, or make a 10 first.')] };
      }
      const a = R.i(8, 20), b = R.i(2, a - 2), r = a - b;
      return { text: kg ? 'A bag holds ' + B(a + ' kg') + ' of sand. ' + A + ' uses ' + B(b + ' kg') + '. How many kilograms of sand are left?' : 'A bucket holds ' + B(a + ' liters') + ' of water. ' + B(b + ' liters') + ' spill out. How many liters are left?', ans: r, unit: kg ? 'kg' : 'liters',
        how: [(kg ? 'Using some' : 'Spilling some') + ' leaves less: take away.', mi(a, b) + ' = ' + B(r) + (kg ? ' kg.' : ' liters.')], steps: [st(B(mi(a, b)) + ' = ?', r)],
        traps: [tr(a + b, 'g_massvol', 'Some is gone, so there is less: take away.'), tr(r + 1, 'a_thinkadd', 'Check: ' + b + ' + your answer should make ' + a + '.')] };
    }
    if (kind === 'groups' || kind === 'groups2') {
      const big = kind === 'groups2', each = big ? R.i(3, 9) : R.pick([2, 3, 4, 5, 10]), n = big ? R.i(4, 9) : R.i(2, 6), T = each * n, kg = R.chance(0.5);
      const text = kg ? 'Each bag of rice has a mass of ' + B(each + ' kg') + '. What is the mass of ' + B(n) + ' bags?' : 'Each bottle holds ' + B(each + ' liters') + ' of water. How many liters do ' + B(n) + ' bottles hold?';
      return { text, ans: T, unit: kg ? 'kg' : 'liters',
        how: ['Equal groups: ' + n + ' groups of ' + each + '. The total is missing, so multiply.', n + ' × ' + each + ' = ' + B(T) + (kg ? ' kg.' : ' liters.')],
        steps: [st('How many equal groups?', n), st(B(n + ' × ' + each) + ' = ?', T)],
        traps: [tr(n + each, 's_groups', 'Each one is the same size: equal groups, so multiply.'), tr(T + Math.min(n, each), factC(n, each), 'Check the fact ' + n + ' × ' + each + '.'), tr(T - Math.min(n, each), factC(n, each), 'Check the fact ' + n + ' × ' + each + '.')] };
    }
    if (kind === 'share' || kind === 'share2') {
      const big = kind === 'share2', e = big ? R.i(4, 9) : R.pick([2, 3, 4, 5]), n = big ? R.i(4, 9) : R.i(3, 8), T = e * n;
      const ctx = R.pick(big ? ['jugs', 'bags'] : ['bucket', 'scoop']);
      let text, ans, how, what;
      if (ctx === 'bucket') { text = 'A tank holds ' + B(T + ' liters') + '. ' + A + ' fills it with a ' + B(e + '-liter') + ' bucket. How many buckets does it take?'; ans = n; what = 'buckets'; how = ['How many groups of ' + e + ' liters make ' + T + ' liters? Divide.', 'Think times: ? × ' + e + ' = ' + T + '. ' + n + ' × ' + e + ' = ' + T + ', so it takes ' + B(n) + ' buckets.']; }
      else if (ctx === 'scoop') { text = A + ' has ' + B(T + ' kg') + ' of dog food and puts ' + B(e + ' kg') + ' in each bin. How many bins does ' + A + ' fill?'; ans = n; what = 'bins'; how = ['How many groups of ' + e + ' kg make ' + T + ' kg? Divide.', 'Think times: ? × ' + e + ' = ' + T + '. ' + n + ' × ' + e + ' = ' + T + ', so ' + A + ' fills ' + B(n) + ' bins.']; }
      else if (ctx === 'jugs') { text = B(T + ' liters') + ' of juice is poured equally into ' + B(n) + ' jugs. How many liters are in each jug?'; ans = e; what = 'liters'; how = ['Sharing equally into ' + n + ' jugs: divide.', 'Think times: ' + n + ' × ? = ' + T + '. ' + n + ' × ' + e + ' = ' + T + ', so each jug has ' + B(e) + ' liters.']; }
      else { text = 'A box holds ' + B(n) + ' bags of flour, all the same. Together the bags have a mass of ' + B(T + ' kg') + '. What is the mass of one bag?'; ans = e; what = 'kg'; how = ['Equal bags share the ' + T + ' kg: divide.', 'Think times: ' + n + ' × ? = ' + T + '. ' + n + ' × ' + e + ' = ' + T + ', so one bag is ' + B(e) + ' kg.']; }
      const other = ans === n ? e : n;
      return { text, ans, unit: what, how,
        steps: [st(B(T + ' ÷ ' + other) + ' = ?', ans)],
        traps: [tr(T - other, 's_groups', 'Equal groups: divide, do not just take away once.'), tr(T * other > 200 ? null : T * other, 's_groups', 'Each share is smaller than the total: divide.'), tr(ans + 1, 'm_divfam', 'Check: ' + (ans + 1) + ' × ' + other + ' is not ' + T + '.')] };
    }
    if (kind === 'gsub' || kind === 'gadd') {
      const item = R.pick(['flour', 'nuts', 'cheese', 'clay', 'rice']);
      if (kind === 'gsub') {
        const a = R.i(5, 10) * 100, b = R.i(1, a / 100 - 1) * 100 + R.pick([50, 50, 25, 75]), r = a - b;
        return { text: 'A bag has ' + B(a + ' g') + ' of ' + item + '. ' + A + ' uses ' + B(b + ' g') + '. How many grams of ' + item + ' are left?', ans: r, unit: 'g',
          how: ['Using some leaves less: ' + mi(a, b) + '.', 'Count up from ' + b + ': ' + (b % 100 ? 'to ' + (Math.ceil(b / 100) * 100) + ' is ' + (Math.ceil(b / 100) * 100 - b) + ', then to ' + a + ' is ' + (a - Math.ceil(b / 100) * 100) + '.' : 'to ' + a + ' is ' + r + '.'), 'So ' + B(r) + ' g are left.'],
          steps: [st(B(mi(a, b)) + ' = ?', r)],
          traps: [tr(a + b, 'g_massvol', 'Some is used up, so there is less: take away.'), tr(noBorrow(a, b), 'a_borrow', 'Not enough tens? Trade a hundred for 10 tens first.')] };
      }
      const a = R.i(120, 600), b = R.i(110, 380), s = a + b; if (s > 1000 || (a % 10 + b % 10 < 10 && R.chance(0.6))) return null;
      return { text: 'One bowl has ' + B(a + ' g') + ' of ' + item + ' and another has ' + B(b + ' g') + '. How many grams of ' + item + ' are there in all?', ans: s, unit: 'g',
        how: ['In all means add: ' + pl(a, b) + '.', 'Hundreds, tens, ones: ' + pl(Math.floor(a / 100) * 100, Math.floor(b / 100) * 100) + ' = ' + (Math.floor(a / 100) + Math.floor(b / 100)) * 100 + ', and ' + pl(a % 100, b % 100) + ' = ' + (a % 100 + b % 100) + '.', pl((Math.floor(a / 100) + Math.floor(b / 100)) * 100, a % 100 + b % 100) + ' = ' + B(s) + ' g.'],
        steps: [st('Hundreds: ' + B(pl(Math.floor(a / 100) * 100, Math.floor(b / 100) * 100)) + ' = ?', (Math.floor(a / 100) + Math.floor(b / 100)) * 100), st('Tens and ones: ' + B(pl(a % 100, b % 100)) + ' = ?', a % 100 + b % 100), st('Add them: ' + B(pl((Math.floor(a / 100) + Math.floor(b / 100)) * 100, a % 100 + b % 100)) + ' = ?', s)],
        traps: [tr(noCarry(a, b), 'a_regroup', 'A column made 10 or more: carry it to the next place.'), tr(Math.abs(a - b), 'g_massvol', 'In all means add.')] };
    }
    const kgs = R.pick(['pony', 'goat', 'sheep']), oth = R.pick(['dog', 'puppy', 'lamb']), b = R.i(4, 20), k = R.i(5, 25), a = b + k, more = R.chance(0.5);
    if (more) return { text: 'A ' + kgs + ' has a mass of ' + B(a + ' kg') + '. That is ' + B(k + ' kg') + ' more than a ' + oth + '. What is the mass of the ' + oth + '?', ans: b, unit: 'kg',
      howVis: bmSVG([{ lab: kgs, segs: [{ v: b, t: '?', q: 1 }, { v: k, t: k }] }, { lab: oth, segs: [{ v: b, t: '?', q: 1 }] }]),
      how: ['Who is heavier? The ' + kgs + '. So the ' + oth + '\'s bar is shorter by ' + k + '.', mi(a, k) + ' = ' + B(b) + ' kg.'],
      steps: [st('Is the ' + oth + ' lighter? Type the ' + kgs + '\'s mass.', a), st(B(mi(a, k)) + ' = ?', b)],
      traps: [tr(a + k, 's_compare', 'The word more tricks you. The ' + kgs + ' is heavier, so the ' + oth + ' is lighter than ' + a + ' kg.'), tr(noBorrow(a, k), 'a_borrow', 'Not enough ones? Trade a ten for 10 ones.')] };
    return { text: 'A ' + oth + ' has a mass of ' + B(b + ' kg') + '. A ' + kgs + ' is ' + B(k + ' kg') + ' heavier. What is the mass of the ' + kgs + '?', ans: a, unit: 'kg',
      howVis: bmSVG([{ lab: kgs, segs: [{ v: b, t: b }, { v: k, t: k }] }, { lab: oth, segs: [{ v: b, t: b }] }]),
      how: ['Heavier means the ' + kgs + '\'s bar is longer by ' + k + '.', pl(b, k) + ' = ' + B(a) + ' kg.'],
      steps: addSteps(b, k),
      traps: [tr(Math.abs(b - k), 's_compare', 'Heavier means more: add the ' + k + ' kg.'), tr(noCarry(b, k), 'a_regroup', 'The ones made 10 or more. Trade 10 ones for a ten.')] };
  } },

{ id: 'g_ruler4', s: 'meas', g: 3, title: 'Measure to the quarter inch', pre: ['f_numline'], cc: ['3.MD.B.4'],
  tip: 'Count the equal parts in one inch: 2 parts are halves, 4 parts are quarters. Read the whole inches, then count the small jumps past them: 2 and 3 quarters is 2 3/4.',
  gen(d, R) {
    const obj = R.shuffle(['crayon', 'pencil', 'eraser', 'key', 'leaf', 'bug', 'paper clip', 'feather', 'shell', 'straw']);
    const half = d === 0, per = half ? 2 : 4, unitF = half ? 'half' : 'quarter', unitFs = half ? 'halves' : 'quarters';
    const say = (q4) => fm(q4, 4) + (q4 % 4 && q4 > 4 ? ' (or ' + frac(reduce(q4, 4)[0], reduce(q4, 4)[1]) + ')' : '');
    if (d < 2) {
      let q; do q = R.i(3, 22); while (q % 4 === 0 || (half && q % 2) || (d === 1 && q % 2 === 0 && R.chance(0.6)));
      const w = Math.floor(q / 4), r = q % 4, rr = half ? r / 2 : r, maxIn = Math.max(4, Math.ceil(q / 4) + 1);
      return { text: 'How long is the ' + obj[0] + '? Type a fraction or a mixed number of inches.', ans: F(q, 4), unit: 'inches', vis: ruler4SVG(maxIn, [{ a: 0, b: q, t: obj[0] }], half),
        how: ['Each inch is cut into ' + per + ' equal parts, so each small jump is ' + frac(1, per) + ' inch.' + (!half && r === 2 ? ' The middle mark is ' + frac(2, 4) + ' = ' + frac(1, 2) + '.' : ''), 'The end is ' + plural(w, '1 whole inch', w + ' whole inches') + ' and ' + rr + ' more ' + plural(rr, unitF, unitFs) + ': ' + B(say(q)) + ' inches.'],
        steps: [st('How many equal jumps are in one inch?', per), st('How many whole inches does the ' + obj[0] + ' pass?', w), st('How many small jumps past ' + w + '?', rr)],
        traps: [tr(w + rr / 10, 'g_ruler4', 'The small marks are ' + unitFs + ', not tenths. Count how many make 1 inch.'), tr(F(q + (half ? 2 : 1), 4), 'g_ruler4', 'Count the jumps past the whole inch, not the marks.'), half ? tr(F(w * 4 + 1, 4), 'g_ruler4', 'This ruler shows halves: 2 equal parts in each inch.') : tr(r === 2 ? null : F(w * 2 + r, 2), 'g_ruler4', 'Each inch has 4 small jumps, so each one is a quarter, not a half.')] };
    }
    const two = R.chance(0.4);
    if (two) {
      const qa = R.i(9, 22), qb = R.i(3, qa - 3); if (qa % 4 === 0 && qb % 4 === 0) return null;
      const df = qa - qb, maxIn = Math.max(4, Math.ceil(qa / 4) + 1);
      return { text: 'How much longer is the ' + obj[0] + ' than the ' + obj[1] + '? Type a fraction or a mixed number of inches.', ans: F(df, 4), unit: 'inches', vis: ruler4SVG(maxIn, [{ a: 0, b: qa, t: obj[0] }, { a: 0, b: qb, t: obj[1] }]),
        how: ['Each small jump is ' + frac(1, 4) + ' inch. ' + cap(obj[0]) + ': ' + say(qa) + ' inches. ' + cap(obj[1]) + ': ' + say(qb) + ' inches.', 'Count the quarter jumps from the end of the ' + obj[1] + ' to the end of the ' + obj[0] + ': ' + df + ' jumps of ' + frac(1, 4) + '.', df + ' quarters = ' + B(say(df)) + ' inches longer.'],
        steps: [st('How long is the ' + obj[0] + ' in quarters? (' + frac(11, 4) + ' means 11 quarters.) Type the top number.', qa), st('How long is the ' + obj[1] + ' in quarters? Type the top number.', qb), st('How many quarter jumps longer?', df)],
        traps: [tr(F(qa + qb, 4), 's_compare', 'How much longer asks for the difference, not the total.'), tr(F(df + 1, 4), 'g_ruler4', 'Count the jumps between the two ends, not the marks.'), tr(Math.floor(df / 4) + (df % 4) / 10, 'g_ruler4', 'The small marks are quarters, not tenths.')] };
    }
    const a = R.i(2, 9), L = R.i(5, 14), b = a + L; if (a % 4 === 0 || L % 4 === 0) return null;
    const maxIn = Math.max(4, Math.ceil(b / 4) + 1); if (maxIn > 6) return null;
    return { text: 'The ' + obj[0] + ' does not start at 0. How long is it? Type a fraction or a mixed number of inches.', ans: F(L, 4), unit: 'inches', vis: ruler4SVG(maxIn, [{ a, b, t: obj[0] }]),
      how: ['Each small jump is ' + frac(1, 4) + ' inch. The left end is at ' + say(a) + ', the right end at ' + say(b) + '.', 'Count the jumps from one end to the other: ' + L + ' jumps of ' + frac(1, 4) + ' inch.', L + ' quarters = ' + B(say(L)) + ' inches.'],
      steps: [st('Each small jump is 1 over what number?', 4), st('How many small jumps from the left end to the right end?', L)],
      traps: [tr(F(b, 4), 'g_length', 'The ' + obj[0] + ' does not start at 0. Count from its left end.'), tr(F(L + 1, 4), 'g_ruler4', 'Count the jumps, not the marks.'), tr(Math.floor(L / 4) + (L % 4) / 10, 'g_ruler4', 'The small marks are quarters, not tenths.')] };
  } },

{ id: 's_twostep4', s: 'story', g: 3, title: 'Two-step stories with times', pre: ['m_divfam'], paper: true, cc: ['3.OA.D.8'],
  tip: 'Plan: what must you find first? Equal groups mean times or divide; joining or taking away means add or subtract. Then check that the answer is about the right size.',
  gen(d, R) {
    const [A, Bn] = people(R), ts = R.pick(['cards', 'stickers', 'marbles', 'beads', 'shells', 'stamps']);
    const lines = (plan, s1, s2, fin) => ['Plan: ' + plan, 'Step 1: ' + s1 + '.', 'Step 2: ' + s2 + '.', fin];
    const kind = R.pick(d === 0 ? ['packs', 'boxes'] : d === 1 ? ['sharemore', 'eatbag', 'joinshare', 'stand'] : ['revbag', 'revgroups', 'comptimes']);
    if (kind === 'packs' || kind === 'boxes') {
      const k = R.i(2, 5), n = R.pick([2, 3, 4, 5, 10]), T = k * n;
      if (kind === 'packs') { const g = R.i(2, T - 2), r = T - g;
        return { text: A + ' has ' + B(k) + ' packs of ' + B(n) + ' ' + ts + '. ' + A + ' gives ' + B(g) + ' ' + ts + ' to ' + Bn + '. How many ' + ts + ' does ' + A + ' have left?', ans: r, unit: ts, vis: C.groupsSVG(k, n),
          how: lines('find all the ' + ts + ' (equal packs, so times), then take away the ones given.', k + ' × ' + n + ' = ' + T, mi(T, g) + ' = ' + r, A + ' has ' + B(r) + ' ' + ts + ' left.'),
          steps: [st('Step 1: ' + B(k + ' × ' + n) + ' = ?', T), st('Step 2: ' + B(mi(T, g)) + ' = ?', r)],
          traps: [tr(T, 's_twostep4', 'That is step 1. ' + A + ' still gives ' + g + ' away.'), tr(k + n - g > 0 ? k + n - g : null, 's_groups', 'Packs of the same size are equal groups: multiply.'), tr(T + g, 's_twostep4', 'Giving some away leaves fewer: take away.')] }; }
      const m = R.i(2, 9), s = T + m;
      return { text: 'There are ' + B(k) + ' boxes with ' + B(n) + ' muffins in each box. There are ' + B(m) + ' more muffins on a plate. How many muffins are there in all?', ans: s, unit: 'muffins', vis: C.groupsSVG(k, n, m),
        how: lines('find the muffins in the boxes (equal groups, so times), then add the ones on the plate.', k + ' × ' + n + ' = ' + T, pl(T, m) + ' = ' + s, 'There are ' + B(s) + ' muffins in all.'),
        steps: [st('Step 1: ' + B(k + ' × ' + n) + ' = ?', T), st('Step 2: ' + B(pl(T, m)) + ' = ?', s)],
        traps: [tr(T, 's_twostep4', 'That is the muffins in the boxes. Add the ' + m + ' on the plate.'), tr(k + n + m, 's_groups', 'Boxes with the same number in each: multiply.'), tr(k * (n + m), 'x_order', 'Only the boxes have ' + n + ' each. Multiply first, then add the plate.')] };
    }
    if (kind === 'sharemore') {
      const g = R.i(3, 6), e = R.i(2, 9), T = g * e, m = R.i(2, 9), r = e + m;
      return { text: B(T) + ' ' + ts + ' are shared equally by ' + B(g) + ' kids. Then each kid gets ' + B(m) + ' more. How many ' + ts + ' does each kid have now?', ans: r, unit: ts,
        how: lines('share first (divide), then add the extra to one share.', T + ' ÷ ' + g + ' = ' + e + ', because ' + g + ' × ' + e + ' = ' + T, pl(e, m) + ' = ' + r, 'Each kid has ' + B(r) + ' ' + ts + ' now.'),
        steps: [st('Step 1: ' + B(T + ' ÷ ' + g) + ' = ?', e), st('Step 2: ' + B(pl(e, m)) + ' = ?', r)],
        traps: [tr(e, 's_twostep4', 'That is each share. Each kid then gets ' + m + ' more.'), tr(T + m, 's_twostep4', 'The question asks about one kid: share the ' + T + ' first.'), tr(T + g * m, 's_twostep4', 'That is all the ' + ts + ' together. The question asks about one kid.')] };
    }
    if (kind === 'eatbag') {
      const s = R.i(3, 9), n = R.i(3, 9), N = s * n, a = R.i(2, 9), T = N + a;
      if (T > 99) return null;
      return { text: A + ' baked ' + B(T) + ' cookies and ate ' + B(a) + '. ' + A + ' puts the rest into bags of ' + B(s) + '. How many bags does ' + A + ' fill?', ans: n, unit: 'bags',
        how: lines('take away the cookies eaten, then make bags of ' + s + ' (divide).', mi(T, a) + ' = ' + N, N + ' ÷ ' + s + ' = ' + n + ', because ' + n + ' × ' + s + ' = ' + N, A + ' fills ' + B(n) + ' bags.'),
        steps: [st('Step 1: ' + B(mi(T, a)) + ' = ?', N), st('Step 2: ' + B(N + ' ÷ ' + s) + ' = ?', n)],
        traps: [tr(N, 's_twostep4', 'That is the cookies left. Now put them into bags of ' + s + '.'), tr(N - s, 's_groups', 'Bags of ' + s + ' is dividing, not taking away once.'), tr(n + 1, 'm_divfam', 'Check: ' + (n + 1) + ' × ' + s + ' is not ' + N + '.')] };
    }
    if (kind === 'joinshare') {
      const g = R.i(3, 9), e = R.i(3, 9), T = g * e, a = R.i(Math.ceil(T / 4), T - Math.ceil(T / 4)), b = T - a; if (a < 2 || b < 2) return null;
      return { text: A + ' has ' + B(a) + ' red beads and ' + B(b) + ' blue beads. ' + A + ' shares all of them equally among ' + B(g) + ' friends. How many beads does each friend get?', ans: e, unit: 'beads',
        how: lines('put the beads together (add), then share them (divide).', pl(a, b) + ' = ' + T, T + ' ÷ ' + g + ' = ' + e + ', because ' + g + ' × ' + e + ' = ' + T, 'Each friend gets ' + B(e) + ' beads.'),
        steps: [st('Step 1: ' + B(pl(a, b)) + ' = ?', T), st('Step 2: ' + B(T + ' ÷ ' + g) + ' = ?', e)],
        traps: [tr(T, 's_twostep4', 'That is all the beads. Now share them among ' + g + ' friends.'), tr(T - g, 's_groups', 'Sharing equally is dividing, not taking away.'), tr(Number.isInteger(a / g) ? a / g : null, 's_twostep4', 'Share all the beads, the blue ones too.')] };
    }
    if (kind === 'stand') {
      const r = R.i(3, 8), c = R.i(4, 9), seats = r * c, p = seats + R.i(2, 12);
      if (p > 99) return null;
      return { text: 'A room has ' + B(r) + ' rows of ' + B(c) + ' chairs. ' + B(p) + ' people come to the show. Each chair holds one person. How many people have to stand?', ans: p - seats, unit: 'people',
        how: lines('find all the chairs (rows are equal groups, so times), then take them from the people.', r + ' × ' + c + ' = ' + seats + ' chairs', mi(p, seats) + ' = ' + (p - seats), B(p - seats) + ' people have to stand.'),
        steps: [st('Step 1: ' + B(r + ' × ' + c) + ' = ?', seats), st('Step 2: ' + B(mi(p, seats)) + ' = ?', p - seats)],
        traps: [tr(seats, 's_twostep4', 'That is the number of chairs. How many people are left without one?'), tr(p - r - c > 0 ? p - r - c : null, 's_groups', 'Rows of chairs are equal groups: multiply to find the chairs.'), tr(p - seats + Math.min(r, c), factC(r, c), 'Check the fact ' + r + ' × ' + c + '.')] };
    }
    if (kind === 'revbag') {
      const g = R.i(3, 8), e = R.i(3, 9), a = R.i(3, 15), N = g * e + a; if (N > 99) return null;
      return { text: A + ' had some marbles. ' + A + ' gave ' + B(a) + ' to ' + Bn + '. ' + A + ' put the rest into ' + B(g) + ' bags, with ' + B(e) + ' marbles in each bag. How many marbles did ' + A + ' have at first?', ans: N, unit: 'marbles',
        how: lines('work backwards. Find the marbles in the bags (times), then add back the ones given away.', g + ' × ' + e + ' = ' + g * e, pl(g * e, a) + ' = ' + N, A + ' had ' + B(N) + ' marbles at first.'),
        steps: [st('Marbles in the bags: ' + B(g + ' × ' + e) + ' = ?', g * e), st('Add back the ones given away: ' + B(pl(g * e, a)) + ' = ?', N)],
        traps: [tr(g * e, 's_twostep4', 'That is what went into the bags. ' + A + ' also gave ' + a + ' away.'), tr(g * e - a, 's_twostep4', 'Work backwards: the ' + a + ' given away were part of the start, so add them back.'), tr(g + e + a, 's_groups', 'Bags with the same number in each: multiply.')] };
    }
    if (kind === 'revgroups') {
      const g = R.i(3, 9), e = R.i(3, 9), m = R.i(2, 9), T = g * e + m; if (T > 99) return null;
      return { text: B(g) + ' kids each have the same number of stickers. The teacher adds ' + B(m) + ' more. Now there are ' + B(T) + ' stickers in all. How many stickers did each kid have at first?', ans: e, unit: 'stickers',
        how: lines('take away the teacher\'s stickers to find the kids\' total, then share it (divide).', mi(T, m) + ' = ' + g * e, (g * e) + ' ÷ ' + g + ' = ' + e + ', because ' + g + ' × ' + e + ' = ' + g * e, 'Each kid had ' + B(e) + ' stickers.'),
        steps: [st('Step 1: ' + B(mi(T, m)) + ' = ?', g * e), st('Step 2: ' + B((g * e) + ' ÷ ' + g) + ' = ?', e)],
        traps: [tr(g * e, 's_twostep4', 'That is all the kids\' stickers. Share them among ' + g + ' kids.'), tr(Number.isInteger(T / g) ? T / g : null, 's_twostep4', 'Take away the teacher\'s ' + m + ' first, then share.'), tr(e + 1, 'm_divfam', 'Check: ' + g + ' × ' + (e + 1) + ' is not ' + g * e + '.')] };
    }
    const p = R.i(4, 9), dd = R.i(5, 9), T = p * dd, b = R.i(Math.ceil(T / 3), T - 4);
    return { text: A + ' reads ' + B(p) + ' pages every day for ' + B(dd) + ' days. ' + Bn + ' reads ' + B(b) + ' pages in all. How many more pages does ' + A + ' read than ' + Bn + '?', ans: T - b, unit: 'pages',
      how: lines('find ' + A + '\'s pages (equal groups, so times), then compare (take away).', dd + ' × ' + p + ' = ' + T, mi(T, b) + ' = ' + (T - b), A + ' reads ' + B(T - b) + ' more pages.'),
      steps: [st('Step 1: ' + B(dd + ' × ' + p) + ' = ?', T), st('Step 2: ' + B(mi(T, b)) + ' = ?', T - b)],
      traps: [tr(T, 's_twostep4', 'That is how many ' + A + ' reads. The question asks how many more.'), tr(T + b, 's_compare', 'How many more asks for the difference.'), tr(T - b + Math.min(p, dd), factC(p, dd), 'Check the fact ' + dd + ' × ' + p + '.')] };
  } },

{ id: 'g_areasplit', s: 'meas', g: 3, title: 'Split a rectangle\'s area', pre: ['m_x7'], cc: ['3.MD.C.7c'],
  tip: 'Cut a rectangle into two smaller ones and add their areas. 7 × 8 is 7 × 5 plus 7 × 3: 35 + 21 = 56. Easy facts can build a hard one.',
  gen(d, R) {
    if (d === 0) {
      const h = R.i(2, 5), w1 = R.i(2, 6), w2 = R.i(1, 4), A1 = h * w1, A2 = h * w2, A = A1 + A2, part = R.chance(0.3) ? R.pick([1, 2]) : 0;
      if (part) { const [ww, AA] = part === 1 ? [w1, A1] : [w2, A2];
        return { text: 'How many squares are in the ' + B(part === 1 ? 'left' : 'right') + ' part of the rectangle?', ans: AA, unit: 'squares', vis: splitRectSVG(h, w1, w2, { grid: true }),
          how: ['The ' + (part === 1 ? 'left' : 'right') + ' part has ' + h + ' rows of ' + ww + ' squares.', h + ' × ' + ww + ' = ' + B(AA) + ' squares.'],
          steps: [st('How many rows?', h), st(B(h + ' × ' + ww) + ' = ?', AA)],
          traps: [tr(A, 'g_areasplit', 'That is the whole rectangle. Count only the ' + (part === 1 ? 'left' : 'right') + ' part.'), tr(h + ww, 'g_area', 'Multiply the rows by the squares in each row.')] }; }
      return { text: 'The rectangle is split into two parts. How many squares are in the ' + B('whole') + ' rectangle?', ans: A, unit: 'squares', vis: splitRectSVG(h, w1, w2, { grid: true }),
        how: ['Left part: ' + h + ' × ' + w1 + ' = ' + A1 + '. Right part: ' + h + ' × ' + w2 + ' = ' + A2 + '.', 'Whole: ' + pl(A1, A2) + ' = ' + B(A) + ' squares. That is ' + h + ' × ' + (w1 + w2) + ' too.'],
        steps: [st('Left part: ' + B(h + ' × ' + w1) + ' = ?', A1), st('Right part: ' + B(h + ' × ' + w2) + ' = ?', A2), st(B(pl(A1, A2)) + ' = ?', A)],
        traps: [tr(A1, 'g_areasplit', 'That is only the left part. Add the right part too.'), tr(2 * (h + w1 + w2), 'g_perim', 'That is the distance around. Area counts the squares inside.'), tr(h + w1 + w2, 'g_area', 'Multiply rows by columns in each part.')] };
    }
    const h = R.i(3, 9), tens = d === 2 || R.chance(0.5), w1 = tens ? 10 : 5, w2 = tens ? R.i(2, 9) : R.i(2, 4), w = w1 + w2, A1 = h * w1, A2 = h * w2, A = A1 + A2;
    if (d === 1) return { text: 'All lengths are in cm. Split the rectangle at the dashed line to find ' + B(h + ' × ' + w) + '. What is the area of the whole rectangle?', ans: A, unit: 'square cm', vis: splitRectSVG(h, w1, w2),
      how: ['The ' + w + ' side is split into ' + w1 + ' + ' + w2 + ', so ' + h + ' × ' + w + ' = ' + h + ' × ' + w1 + ' + ' + h + ' × ' + w2 + '.', 'Left: ' + h + ' × ' + w1 + ' = ' + A1 + '. Right: ' + h + ' × ' + w2 + ' = ' + A2 + '.', 'Whole: ' + pl(A1, A2) + ' = ' + B(A) + ' square cm.'],
      steps: [st('Left part: ' + B(h + ' × ' + w1) + ' = ?', A1), st('Right part: ' + B(h + ' × ' + w2) + ' = ?', A2), st(B(pl(A1, A2)) + ' = ?', A)],
      traps: [tr(A1 + w2, 'g_areasplit', 'Multiply both parts by ' + h + ', the right part too.'), tr(2 * (h + w), 'g_perim', 'That is the perimeter. Area is the space inside.'), tr(A2 + Math.min(h, w2), factC(h, w2) === 'm_breakapart' ? 'm_x7' : factC(h, w2), 'Check the fact ' + h + ' × ' + w2 + '.')] };
    if (R.chance(0.5)) return { text: 'All lengths are in cm. A ' + B(h + ' by ' + w) + ' rectangle is split into two parts. The left part is ' + B(h + ' by ' + w1) + '. What is the area of the ' + B('right') + ' part?', ans: A2, unit: 'square cm', vis: splitRectSVG(h, w1, w2, { l2: '?', lh: h, l1: w1 }),
      how: ['The right part is ' + w + ' ' + MINUS + ' ' + w1 + ' = ' + w2 + ' cm wide.', 'Its area: ' + h + ' × ' + w2 + ' = ' + B(A2) + ' square cm.'],
      steps: [st('How wide is the right part? ' + B(mi(w, w1)) + ' = ?', w2), st(B(h + ' × ' + w2) + ' = ?', A2)],
      traps: [tr(A, 'g_areasplit', 'That is the whole rectangle. Find only the right part.'), tr(h * w1, 'g_areasplit', 'That is the left part.'), tr(h + w2, 'g_area', 'Area multiplies: ' + h + ' rows of ' + w2 + '.')] };
    return { text: 'A rectangle is ' + B(h + ' cm') + ' tall and has an area of ' + B(A + ' square cm') + '. It is split into two parts. The left part is ' + B(h + ' cm by ' + w1 + ' cm') + '. What is the area of the ' + B('right') + ' part?', ans: A2, unit: 'square cm', vis: splitRectSVG(h, w1, w2, { l2: '?', in2: '?' }),
      how: ['Left part: ' + h + ' × ' + w1 + ' = ' + A1 + ' square cm.', 'The two parts make ' + A + ': ' + mi(A, A1) + ' = ' + B(A2) + ' square cm.'],
      steps: [st('Left part: ' + B(h + ' × ' + w1) + ' = ?', A1), st(B(mi(A, A1)) + ' = ?', A2)],
      traps: [tr(A1, 'g_areasplit', 'That is the left part. The right part is what is left of ' + A + '.'), tr(A - w1 > 0 ? A - w1 : null, 'g_areasplit', 'Take away the left part\'s area, ' + h + ' × ' + w1 + ', not its width.'), tr(noBorrow(A, A1), 'a_borrow', 'Check the taking away.')] };
  } },

/* =================== Grade 4 =================== */
{ id: 's_fraclike', s: 'story', g: 4, title: 'Fraction stories: same bottom', pre: ['f_addlike'], paper: true, cc: ['4.NF.B.3d', '4.NF.B.3c'],
  tip: 'Same bottom? Add or take away the tops; the bottom stays. Mixed numbers: do the wholes, then the parts. Not enough parts to take away? Trade 1 whole: 5 = 4 8/8.',
  gen(d, R) {
    const [A, Bn] = people(R), den = R.pick([3, 4, 5, 6, 8, 10, 12]), fr = n => mx(n, den);
    const kind = R.pick(d === 0 ? ['ate', 'left', 'farther'] : d === 1 ? ['walk', 'cut', 'walk'] : ['wholes', 'borrow', 'three']);
    if (kind === 'ate' || kind === 'farther') {
      let a = R.i(1, den - 1), b = R.i(1, den - 1); if (kind === 'ate' && a + b > den) return null; if (kind === 'farther' && a <= b) [a, b] = [b, a]; if (a === b) return null;
      if (kind === 'ate') return { text: A + ' ate ' + frac(a, den) + ' of a pizza and ' + Bn + ' ate ' + frac(b, den) + ' of the same pizza. How much of the pizza did they eat in all?', ans: F(a + b, den), unit: 'of the pizza', howVis: fracBarSVG(a + b, den),
        how: ['Write it: ' + frac(a, den) + ' + ' + frac(b, den) + '.', 'Same bottom, so add the tops: ' + pl(a, b) + ' = ' + (a + b) + '. The bottom stays ' + den + '.', 'They ate ' + B(endFrac(a + b, den)) + ' of the pizza.'],
        steps: [st('Add the tops: ' + B(pl(a, b)) + ' = ?', a + b), sf(frac(a, den) + ' + ' + frac(b, den) + ' = ?', a + b, den)],
        traps: [tr(F(a + b, 2 * den), 'f_addunlike', 'Keep the bottom: the slices are still ' + frac(1, den) + ' each. Add only the tops.'), tr(F(Math.abs(a - b), den), 's_fraclike', 'In all means add.')] };
      return { text: A + ' ran ' + frac(a, den) + ' of a mile and walked ' + frac(b, den) + ' of a mile. How much farther did ' + A + ' run than walk?', ans: F(a - b, den), unit: 'of a mile',
        how: ['How much farther means take away: ' + frac(a, den) + ' ' + MINUS + ' ' + frac(b, den) + '.', 'Same bottom, so take away the tops: ' + mi(a, b) + ' = ' + (a - b) + '. The bottom stays ' + den + '.', A + ' ran ' + B(endFrac(a - b, den)) + ' of a mile farther.'],
        steps: [st('Take away the tops: ' + B(mi(a, b)) + ' = ?', a - b), sf(frac(a, den) + ' ' + MINUS + ' ' + frac(b, den) + ' = ?', a - b, den)],
        traps: [tr(F(a + b, den), 's_compare', 'How much farther asks for the difference: take away.'), tr(a - b, 'f_addlike', 'The answer counts pieces of ' + frac(1, den) + ' of a mile: keep the bottom.')] };
    }
    if (kind === 'left') {
      const a = R.i(1, den - 1), r = den - a;
      return { text: 'A pie is cut into ' + B(den) + ' equal slices. ' + A + '\'s family eats ' + frac(a, den) + ' of the pie. How much of the pie is left?', ans: F(r, den), unit: 'of the pie', howVis: fracBarSVG(a, den),
        how: ['Write it: 1 ' + MINUS + ' ' + frac(a, den) + '.', 'The whole pie is ' + frac(den, den) + '. ' + frac(den, den) + ' ' + MINUS + ' ' + frac(a, den) + ' = ' + frac(r, den) + '.', B(endFrac(r, den)) + ' of the pie is left.'],
        steps: [st('The whole pie is ?/' + den + '. What is the top?', den), sf(frac(den, den) + ' ' + MINUS + ' ' + frac(a, den) + ' = ?', r, den)],
        traps: [tr(F(a, den), 's_fraclike', 'That is the part eaten. How much is left?'), tr(F(den + a, den), 'f_whole', 'One whole pie is ' + frac(den, den) + '. Eating some leaves less than that: take away.')] };
    }
    if (kind === 'walk' || kind === 'three') {
      if (kind === 'three') {
        const a = R.i(1, den - 1), b = R.i(1, den - 1), c = R.i(1, den - 1), S = a + b + c; if (S <= den) return null;
        return { text: 'On a hike, ' + A + ' walks ' + frac(a, den) + ' of a mile to a bridge. Then ' + A + ' walks ' + frac(b, den) + ' of a mile to a pond. Then ' + A + ' walks ' + frac(c, den) + ' of a mile to the top. How far does ' + A + ' walk in all? Type a mixed number or a fraction.', ans: F(S, den), unit: 'miles',
          how: ['Write it: ' + frac(a, den) + ' + ' + frac(b, den) + ' + ' + frac(c, den) + '.', 'Same bottom, so add the tops: ' + a + ' + ' + b + ' + ' + c + ' = ' + S + '. That is ' + frac(S, den) + '.', frac(S, den) + ' = ' + mx(S, den) + ', because ' + frac(den, den) + ' makes 1 whole.', A + ' walks ' + B(endFrac(S, den)) + ' miles.'],
          steps: [st('Add the tops: ' + B(a + ' + ' + b + ' + ' + c) + ' = ?', S), sf('As a fraction: ?', S, den)],
          traps: [tr(F(S, 3 * den), 'f_addunlike', 'Keep the bottom: add only the tops.'), tr(F(a + b, den), 's_fraclike', 'There are three parts of the hike.'), tr(F(S - den, den), 'f_mixed', frac(S, den) + ' is more than 1 whole. Keep the whole when you write the mixed number.')] };
      }
      const w1 = R.i(1, 4), w2 = R.i(1, 3), r1 = R.i(1, den - 1), r2 = R.i(1, den - 1), a = w1 * den + r1, b = w2 * den + r2, carry = r1 + r2 >= den;
      if (!carry && R.chance(0.5)) return null;
      return { text: A + ' walks ' + fr(a) + ' miles on Monday and ' + fr(b) + ' miles on Tuesday. How far does ' + A + ' walk in all? Type a mixed number or a fraction.', ans: F(a + b, den), unit: 'miles',
        how: ['Write it: ' + fr(a) + ' + ' + fr(b) + '.'].concat(mixAddLines(a, b, den), [A + ' walks ' + B(endFrac(a + b, den)) + ' miles.']),
        steps: [st('Wholes: ' + B(pl(w1, w2)) + ' = ?', w1 + w2), sf('Parts: ' + frac(r1, den) + ' + ' + frac(r2, den) + ' = ?', r1 + r2, den), sf('All together: ?', a + b, den)],
        traps: [tr(F((w1 + w2) * 2 * den + r1 + r2, 2 * den), 'f_addunlike', 'Keep the bottom: add only the tops.'), carry ? tr(F(a + b - den, den), 'f_mixed', 'The parts made more than 1 whole: add that whole to the wholes.') : tr(F((w1 + w2) * den, den), 's_fraclike', 'Add the parts too.')] };
    }
    if (kind === 'cut' || kind === 'borrow') {
      const borrow = kind === 'borrow', w1 = R.i(2, 6), w2 = R.i(1, w1 - 1), r1 = R.i(borrow ? 1 : 2, den - 1), r2 = R.i(1, den - 1);
      if (borrow ? r1 >= r2 : r1 < r2) return null;
      const a = w1 * den + r1, b = w2 * den + r2, ctx = borrow ? ['A jug has ' + fr(a) + ' liters of juice. ' + A + ' pours out ' + fr(b) + ' liters. How much juice is left in the jug?', 'liters', 'liters of juice are left.'] : ['A ribbon is ' + fr(a) + ' yards long. ' + A + ' cuts off ' + fr(b) + ' yards. How long is the ribbon now?', 'yards', 'yards of ribbon are left.'];
      return { text: ctx[0] + ' Type a mixed number or a fraction.', ans: F(a - b, den), unit: ctx[1],
        how: ['Write it: ' + fr(a) + ' ' + MINUS + ' ' + fr(b) + '.'].concat(mixSubLines(a, b, den), [B(endFrac(a - b, den)) + ' ' + ctx[2]]),
        steps: borrow ? [st('Trade 1 whole: ' + fr(a) + ' = ' + (w1 - 1) + ' and ?/' + den + '. What is the top?', r1 + den), sf('Parts: ' + frac(r1 + den, den) + ' ' + MINUS + ' ' + frac(r2, den) + ' = ?', r1 + den - r2, den), sf('The answer: ?', a - b, den)] : [st('Wholes: ' + B(mi(w1, w2)) + ' = ?', w1 - w2), sf('Parts: ' + frac(r1, den) + ' ' + MINUS + ' ' + frac(r2, den) + ' = ?', r1 - r2, den)],
        traps: borrow ? [tr(F((w1 - w2) * den + r2 - r1, den), 'f_mixedops', 'You took the small part from the big one. Trade 1 whole for ' + frac(den, den) + ' first.'), tr(F((w1 - w2) * den + r1 + den - r2, den), 'f_mixed', 'After trading, the wholes go down by 1.'), tr(F(a + b, den), 's_fraclike', 'Pouring out leaves less: take away.')]
          : [tr(F(a + b, den), 's_fraclike', 'Cutting some off leaves less: take away.'), tr(F((w1 - w2) * den, den), 's_fraclike', 'Take away the parts too.')] };
    }
    const W = R.i(3, 6), w2 = R.i(1, W - 1), r2 = R.i(1, den - 1), b = w2 * den + r2, L = W * den - b;
    return { text: A + ' has ' + B(W) + ' pizzas, all the same size. The kids eat ' + fr(b) + ' pizzas. How much pizza is left? Type a mixed number or a fraction.', ans: F(L, den), unit: 'pizzas',
      how: ['Write it: ' + W + ' ' + MINUS + ' ' + fr(b) + '.'].concat(mixSubLines(W * den, b, den), [B(endFrac(L, den)) + ' pizzas are left.']),
      steps: [st('Trade 1 whole: ' + W + ' = ' + (W - 1) + ' and ?/' + den + '. What is the top?', den), sf('Parts: ' + frac(den, den) + ' ' + MINUS + ' ' + frac(r2, den) + ' = ?', den - r2, den), sf('The answer: ?', L, den)],
      traps: [tr(F((W - w2) * den + r2, den), 'f_mixedops', W + ' has no parts to take ' + frac(r2, den) + ' from. Trade 1 whole for ' + frac(den, den) + ' first.'), tr(F((W - w2) * den + den - r2, den), 'f_mixed', 'After trading, the wholes go down by 1.')] };
  } },

{ id: 'f_dec100', s: 'frac', g: 4, title: 'Compare decimals to hundredths', pre: ['n_compare'], cc: ['4.NF.C.7'],
  tip: 'Give every decimal two places: 0.5 = 0.50. Then compare the hundredths like whole numbers: 50 is more than 45, so 0.5 is bigger than 0.45. More digits does not mean bigger.',
  gen(d, R) {
    if (d === 2 && R.chance(0.6)) return digitProblem(R, 2, R.chance(0.5), 'f_dec100');
    const t = R.i(3, 9), n = d === 0 ? 3 : 4, whole = d > 0 && R.chance(0.35);
    const pair = [t * 10, (t - 1) * 10 + R.i(1, 9)];
    const rest = R.shuffle([R.i(1, 9), (t - 2) * 10 + R.i(1, 9), t * 10 + R.i(1, 9), (t - 1) * 10, R.i(1, 9) * 10 + R.i(1, 9)].concat(whole ? [100 + R.i(1, 9) * 10, 100 + R.i(1, 9)] : []));
    const vals = pair.slice(); for (const v of rest) { if (vals.length >= n) break; if (v > 0 && !vals.includes(v)) vals.push(v); }
    if (vals.length < n) return null;
    const ask = d === 0 ? R.pick(['big', 'small']) : R.pick(['big', 'small', 'big2', 'small2']);
    return orderProblem(R.shuffle(vals), 2, ask, 'f_dec100');
  } },

{ id: 'd_lineplot', s: 'data', g: 4, title: 'Line plots with fractions', pre: ['f_addlike', 'f_numline'], paper: true, cc: ['4.MD.B.4'],
  tip: 'Each X is one thing that was measured, sitting over its length. Longest minus shortest: the X farthest right take away the X farthest left. Same bottom? Work with the tops.',
  gen(d, R) {
    const q = d === 0, den = q ? 4 : 8, stp = q ? 2 : 1, w = R.i(0, 2), lo = q ? w * 8 : w * 8 + R.pick([0, 2, 4, 6]), hi = lo + (q ? 16 : 8);
    const ticks = []; for (let v = lo; v <= hi; v += stp) if (v > 0) ticks.push(v);
    const used = R.shuffle(ticks).slice(0, R.i(4, 5)).sort((x, y) => x - y), cnt = {}; used.forEach(v => { cnt[v] = R.i(1, 4); });
    const ctx = R.pick([['pencils', 'pencil'], ['worms', 'worm'], ['leaves', 'leaf'], ['ribbons', 'ribbon'], ['crayons', 'crayon'], ['feathers', 'feather']]);
    const vis = linePlotSVG(lo, hi, stp, cnt, 'inches'), intro = 'The line plot shows the lengths of some ' + ctx[0] + ', in inches. ';
    const D = v => v * den / 8, S = v => fm(v, 8), SE = v => S(v) + (reduce(v, 8)[1] !== den && v % 8 ? ' = ' + mx(D(v), den) : '');
    const colLine = (c, n0) => { const w0 = Math.floor(n0 / den), r0 = n0 % den; return (w0 ? c + ' × ' + w0 + ' = ' + c * w0 + (r0 ? ' and ' : '') : '') + (r0 ? c + ' × ' + frac(r0, den) + ' = ' + frac(c * r0, den) + (c * r0 >= den ? ' = ' + mx(c * r0, den) : '') : '') + (w0 && r0 ? ', so ' + mx(c * n0, den) : ''); };
    const kind = R.pick(d === 0 ? ['range', 'col'] : d === 1 ? ['range', 'col', 'two'] : ['range', 'two', 'two']);
    if (kind === 'range') {
      const mn = used[0], mxV = used[used.length - 1], df = D(mxV) - D(mn);
      if (df === den || (d === 2 && D(mn) % den <= D(mxV) % den && R.chance(0.7))) return null;
      return { text: intro + 'How much longer is the longest ' + ctx[1] + ' than the shortest? Type a mixed number or a fraction.', ans: F(df, den), unit: 'inches', vis,
        how: ['Longest: ' + SE(mxV) + ' (the X farthest right). Shortest: ' + SE(mn) + ' (farthest left). Work out ' + mx(D(mxV), den) + ' ' + MINUS + ' ' + mx(D(mn), den) + '.'].concat(mixSubLines(D(mxV), D(mn), den), ['The longest is ' + B(endFrac(df, den)) + ' inches longer.']),
        steps: [sf('How long is the longest ' + ctx[1] + '?', D(mxV), den), sf('How long is the shortest ' + ctx[1] + '?', D(mn), den), sf(mx(D(mxV), den) + ' ' + MINUS + ' ' + mx(D(mn), den) + ' = ?', df, den)],
        traps: [tr(F(D(mxV) + D(mn), den), 's_compare', 'How much longer asks for the difference: take away.'), tr(F(D(used[used.length - 2]) - D(mn), den), 'd_lineplot', 'The longest is the X farthest to the right on the line.'), D(mn) % den > D(mxV) % den ? tr(F(df + 2 * (D(mn) % den - D(mxV) % den), den), 'f_mixedops', 'You took the small part from the big one. Trade 1 whole first.') : tr(F(df + den, den), 'f_addlike', 'Check the wholes when you take away.')] };
    }
    if (kind === 'col') {
      const opts = used.filter(v => cnt[v] >= 2 && D(v) % den); if (!opts.length) return null;
      const v = R.pick(opts), c = cnt[v], n0 = D(v), wv = Math.floor(n0 / den), rv = n0 % den, T = c * n0;
      return { text: intro + 'All the ' + ctx[0] + ' that are ' + B(S(v)) + ' inches long are laid end to end. How long is that? Type a mixed number or a fraction.', ans: F(T, den), unit: 'inches', vis,
        how: ['There are ' + c + ' Xs over ' + SE(v) + ', so work out ' + c + ' × ' + mx(n0, den) + '.', (wv ? 'Wholes: ' + c + ' × ' + wv + ' = ' + c * wv + '. ' : '') + 'Parts: ' + c + ' × ' + frac(rv, den) + ' = ' + frac(c * rv, den) + '.', (c * rv >= den ? frac(c * rv, den) + ' = ' + mx(c * rv, den) + '. ' : '') + (wv ? c * wv + ' + ' + mx(c * rv, den) + ' = ' : 'So it is ') + B(endFrac(T, den)) + ' inches.'],
        steps: [st('How many Xs are over ' + S(v) + '?', c), sf((wv ? 'Parts: ' : '') + c + ' × ' + frac(rv, den) + ' = ?', c * rv, den), sf('All together: ?', T, den)],
        traps: [tr(F(n0, den), 'd_lineplot', 'Each X is one ' + ctx[1] + '. Count the Xs over ' + S(v) + '.'), wv ? tr(F(c * wv * den + rv, den), 'f_xwhole', 'Multiply the parts by ' + c + ' too.') : tr(F(c * rv, den * c), 'f_xwhole', 'Multiply only the top: the pieces are still ' + frac(1, den) + ' inch.')] };
    }
    const opts = R.shuffle(used.filter(v => cnt[v] >= 2)).slice(0, 2).sort((x, y) => x - y); if (opts.length < 2) return null;
    const [v1, v2] = opts, c1 = cnt[v1], c2 = cnt[v2], X1 = c1 * D(v1), X2 = c2 * D(v2), T = X1 + X2;
    return { text: intro + 'All the ' + ctx[0] + ' that are ' + B(S(v1)) + ' or ' + B(S(v2)) + ' inches long are laid end to end. How long is that? Type a mixed number or a fraction.', ans: F(T, den), unit: 'inches', vis,
      how: ['At ' + SE(v1) + ', ' + c1 + ' Xs: ' + colLine(c1, D(v1)) + '.', 'At ' + SE(v2) + ', ' + c2 + ' Xs: ' + colLine(c2, D(v2)) + '.', 'Add: ' + mx(X1, den) + ' + ' + mx(X2, den) + ' = ' + B(endFrac(T, den)) + ' inches.'],
      steps: [st('How many Xs over ' + S(v1) + '?', c1), sf(c1 + ' × ' + S(v1) + ' = ?', X1, den), sf(c2 + ' × ' + S(v2) + ' = ?', X2, den), sf('Add them: ?', T, den)],
      traps: [tr(F(D(v1) + D(v2), den), 'd_lineplot', 'Each X is one ' + ctx[1] + ': use every X in those two columns.'), tr(F(X1, den), 'd_lineplot', 'Add both columns.'), tr(F(T, 2 * den), 'f_addunlike', 'Keep the bottom when you add: add only the tops.')] };
  } },

{ id: 'g_symlines', s: 'meas', g: 4, title: 'Lines of symmetry', pre: [], cc: ['4.G.A.3'],
  tip: 'A line of symmetry is a fold line where the two halves match exactly. Try folding down, across and corner to corner. A square has 4; a rectangle has only 2.',
  gen(d, R) {
    const regAxes = n => Array.from({ length: n }, (_, i) => { const th = -Math.PI / 2 + i * Math.PI / n, c = Math.cos(th) * 1.12, s = Math.sin(th) * 1.12; return [c, s, -c, s * -1]; });
    const regHow = n => ['All sides and corners are equal, so each fold line matches. ' + (n % 2 ? 'Each one goes from a corner to the middle of the opposite side: ' + n + ' corners, ' + n + ' lines.' : n / 2 + ' go corner to corner and ' + n / 2 + ' go through the middles of opposite sides.'), 'A regular shape with ' + n + ' sides has ' + B(n) + ' lines of symmetry.'];
    const SH = {
      square: ['square', [[0, 0], [1, 0], [1, 1], [0, 1]], [[0.5, -0.12, 0.5, 1.12], [-0.12, 0.5, 1.12, 0.5], [-0.1, -0.1, 1.1, 1.1], [1.1, -0.1, -0.1, 1.1]], ['Fold top to bottom or side to side: both match. That is 2 lines.', 'On a square, corner to corner matches too, both ways: 2 more. 2 + 2 = ' + B(4) + '.'], [[2, 'Try folding a square corner to corner too.']]],
      rect: ['rectangle', [[0, 0], [2, 0], [2, 1], [0, 1]], [[1, -0.12, 1, 1.12], [-0.12, 0.5, 2.12, 0.5]], ['Fold top to bottom or side to side: both match. That is 2 lines.', 'Corner to corner does not match on a rectangle that is not a square: the corners do not land on each other. So ' + B(2) + '.'], [[4, 'Fold a paper rectangle corner to corner: the halves do not match.'], [1, 'Try folding it both ways: down the middle and across the middle.']]],
      iso: ['triangle with two equal sides', [[1, 0], [2, 2.2], [0, 2.2]], [[1, -0.12, 1, 2.32]], ['Fold from the top corner down to the middle of the bottom side: the two equal sides land on each other.', 'No other fold works, so it has ' + B(1) + ' line of symmetry.'], [[3, 'Only a triangle with all sides equal has 3. Here only two sides match.'], [0, 'Try folding from the top corner straight down.']]],
      scal: ['triangle with three different sides', [[0, 0], [0, 2], [3, 2]], [], ['All three sides have different lengths, so no fold makes one half land on the other.', 'It has ' + B(0) + ' lines of symmetry.'], [[1, 'Check the fold: the two halves must match exactly, side for side.']]],
      equi: ['triangle with all sides equal', polyPts(3, R, false), regAxes(3), regHow(3), [[1, 'All three sides are equal, so a fold from every corner works.']]],
      rhom: ['rhombus', [[1, 0], [2, 1.5], [1, 3], [0, 1.5]], [[1, -0.12, 1, 3.12], [-0.12, 1.5, 2.12, 1.5]], ['Fold along each line from corner to corner: the halves match. That is 2 lines.', 'Side to side through the middles of the sides does not match on a rhombus that is not a square. So ' + B(2) + '.'], [[4, 'Only the corner-to-corner folds work on this rhombus.']]],
      para: ['parallelogram', [[0.9, 0], [3, 0], [2.1, 1.6], [0, 1.6]], [], ['It leans. Folding down the middle, across the middle or corner to corner never makes the halves land on each other.', 'It has ' + B(0) + ' lines of symmetry. (Turning it halfway round looks the same, but a turn is not a fold.)'], [[2, 'Try it with paper: a leaning shape folded in half does not match.']]],
      kite: ['kite', [[1, 0], [1.9, 0.9], [1, 3], [0.1, 0.9]], [[1, -0.12, 1, 3.12]], ['Fold from the top corner to the bottom corner: the left and right halves match.', 'Folding across does not match (the top is shorter than the bottom). So ' + B(1) + '.'], [[2, 'Folding across a kite does not match: the top part is shorter.']]],
      trap: ['trapezoid with equal slanted sides', [[0.7, 0], [2.3, 0], [3, 1.6], [0, 1.6]], [[1.5, -0.12, 1.5, 1.72]], ['Fold down the middle, through the middles of the top and the bottom: the halves match.', 'Folding across does not (the top is shorter), so ' + B(1) + '.'], [[2, 'Folding across does not match: the top side is shorter than the bottom.']]],
      pent: ['regular pentagon', polyPts(5, R, false), regAxes(5), regHow(5), [[1, 'Every corner of a regular pentagon has its own fold line.']]],
      hex: ['regular hexagon', polyPts(6, R, false), regAxes(6), regHow(6), [[3, 'Count the folds through the middles of the sides too.']]],
      oct: ['regular octagon', polyPts(8, R, false), regAxes(8), regHow(8), [[4, 'Count the folds through the middles of the sides too.']]]
    };
    const LT = {
      H: ['M0 0 L0 140 M100 0 L100 140 M0 70 L100 70', 'b'], I: ['M20 0 L80 0 M50 0 L50 140 M20 140 L80 140', 'b'], X: ['M0 0 L100 140 M100 0 L0 140', 'b'], O: ['M50 0 A50 70 0 1 1 50 140 A50 70 0 1 1 50 0', 'b'],
      A: ['M0 140 L50 0 L100 140 M25 70 L75 70', 'v'], T: ['M0 0 L100 0 M50 0 L50 140', 'v'], M: ['M0 140 L0 0 L50 70 L100 0 L100 140', 'v'], V: ['M0 0 L50 140 L100 0', 'v'], U: ['M0 0 L0 90 Q0 140 50 140 Q100 140 100 90 L100 0', 'v'], W: ['M0 0 L25 140 L50 50 L75 140 L100 0', 'v'], Y: ['M0 0 L50 70 L100 0 M50 70 L50 140', 'v'],
      E: ['M100 0 L0 0 L0 140 L100 140 M0 70 L80 70', 'h'], D: ['M0 0 L0 140 L50 140 Q100 140 100 70 Q100 0 50 0 Z', 'h'], K: ['M0 0 L0 140 M100 0 L0 70 L100 140', 'h'], C: ['M100 15 Q85 0 55 0 Q0 0 0 70 Q0 140 55 140 Q85 140 100 125', 'h'],
      F: ['M100 0 L0 0 L0 140 M0 70 L70 70', 'n'], L: ['M0 0 L0 140 L100 140', 'n'], P: ['M0 140 L0 0 L60 0 Q100 0 100 35 Q100 70 60 70 L0 70', 'n'], R: ['M0 140 L0 0 L60 0 Q100 0 100 35 Q100 70 60 70 L0 70 M50 70 L100 140', 'n'], J: ['M100 0 L100 100 Q100 140 50 140 Q0 140 0 100', 'n'],
      N: ['M0 140 L0 0 L100 140 L100 0', 't'], Z: ['M0 0 L100 0 L0 140 L100 140', 't'], S: ['M100 15 Q85 0 50 0 Q0 0 0 35 Q0 70 50 70 Q100 70 100 105 Q100 140 50 140 Q15 140 0 125', 't']
    };
    const letterSVG = (path, axes) => { let s = '<svg class="fig" viewBox="-40 -30 180 200" style="max-width:150px" aria-hidden="true"><path d="' + path + '" style="fill:none;stroke:var(--ink);stroke-width:16;stroke-linecap:round;stroke-linejoin:round"/>'; axes.forEach(a => { s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + a[2] + '" y2="' + a[3] + '" class="fig-thin" style="stroke:var(--bad);stroke-dasharray:8 6"/>'; }); return s + '</svg>'; };
    const VAX = [50, -22, 50, 162], HAX = [-30, 70, 130, 70];
    const shapeQ = key => { const [name, pts, axes, how, wr] = SH[key], n = axes.length;
      return { text: 'How many ' + B('lines of symmetry') + ' does this ' + name + ' have?', ans: n, vis: shapeSVG(pts), howVis: shapeSVG(pts, { axes }), how,
        steps: [st('How many sides does it have?', pts.length), st('Try every fold: down, across and corner to corner. How many make the halves match?', n)],
        traps: wr.map(w => tr(w[0], 'g_symlines', w[1])) }; };
    const letterQ = L => { const [path, k] = LT[L], n = k === 'b' ? 2 : k === 'n' || k === 't' ? 0 : 1, axes = k === 'b' ? [VAX, HAX] : k === 'v' ? [VAX] : k === 'h' ? [HAX] : [];
      const how = k === 'b' ? ['Fold down the middle: the left half lands on the right half. Fold across the middle: the top lands on the bottom.', 'Both folds work, so the letter ' + L + ' has ' + B(2) + ' lines of symmetry.']
        : k === 'v' ? ['Fold down the middle: the left half lands on the right half.', 'Folding across the middle does not match, so the letter ' + L + ' has ' + B(1) + ' line of symmetry.']
        : k === 'h' ? ['Fold across the middle: the top half lands on the bottom half.', 'Folding down the middle does not match, so the letter ' + L + ' has ' + B(1) + ' line of symmetry.']
        : ['Fold down the middle, then across the middle: the halves never land on each other.', (k === 't' ? 'Turning ' + L + ' halfway round looks the same, but a turn is not a fold. ' : '') + 'So the letter ' + L + ' has ' + B(0) + ' lines of symmetry.'];
      return { text: 'How many ' + B('lines of symmetry') + ' does this letter have?', ans: n, vis: letterSVG(path, []), howVis: letterSVG(path, axes), how,
        steps: [st('Fold it down the middle. Do the halves match? Type 1 for yes, 0 for no.', k === 'b' || k === 'v' ? 1 : 0), st('Fold it across the middle. Do the halves match? Type 1 for yes, 0 for no.', k === 'b' || k === 'h' ? 1 : 0)],
        traps: [n === 1 ? tr(2, 'g_symlines', 'Check both folds: only one of them matches.') : tr(1, 'g_symlines', k === 't' ? 'Turning it looks the same, but folding does not match.' : 'Check each fold: the halves must match exactly.'), n === 2 ? tr(1, 'g_symlines', 'Try the fold across the middle too.') : null] }; };
    if (d === 0) return R.chance(0.5) ? shapeQ(R.pick(['square', 'rect', 'iso', 'scal', 'equi'])) : letterQ(R.pick(['A', 'T', 'H', 'L', 'F', 'V', 'E', 'U', 'Y']));
    if (d === 1) return R.chance(0.55) ? shapeQ(R.pick(['rhom', 'para', 'kite', 'trap', 'pent', 'hex', 'square', 'rect'])) : letterQ(R.pick(['X', 'I', 'O', 'M', 'N', 'Z', 'S', 'K', 'D', 'C', 'W', 'P', 'R', 'J']));
    const kind = R.pick(['reg', 'rev', 'sum', 'sum']);
    if (kind === 'reg' || kind === 'rev') {
      const n = R.pick([7, 8, 9, 10, 12]), nm2 = { 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' }[n];
      if (kind === 'reg') return { text: 'A ' + B('regular') + ' polygon has ' + B(n) + ' equal sides and equal corners. How many lines of symmetry does it have?', ans: n, vis: shapeSVG(polyPts(n, R, false)), howVis: shapeSVG(polyPts(n, R, false), { axes: regAxes(n) }), how: regHow(n),
        steps: [st('A regular hexagon has 6 sides. How many lines of symmetry does it have?', 6), st('So a regular shape with ' + n + ' sides has how many?', n)],
        traps: [tr(n % 2 ? null : n / 2, 'g_symlines', 'Count the folds through the middles of the sides too.'), tr(n * 2, 'g_symlines', 'Each fold line goes all the way across, so count each line once.')] };
      return { text: 'A ' + B('regular') + ' polygon has ' + B(n + ' lines of symmetry') + '. How many sides does it have?', ans: n, vis: '', howVis: shapeSVG(polyPts(n, R, false), { axes: regAxes(n) }),
        how: ['A regular polygon has as many lines of symmetry as sides: a square has 4, a regular hexagon 6.', 'So it has ' + B(n) + ' sides.'],
        steps: [st('How many lines of symmetry does a square have?', 4), st('So a regular polygon with ' + n + ' lines has how many sides?', n)],
        traps: [tr(n * 2, 'g_symlines', 'One line for each side, not two.'), tr(n % 2 ? null : n / 2, 'g_symlines', 'Each side has its own line of symmetry.')] };
    }
    const [k1, k2] = R.shuffle(['square', 'rect', 'iso', 'equi', 'rhom', 'kite', 'trap', 'pent', 'hex', 'para']).slice(0, 2), s1 = SH[k1], s2 = SH[k2], n1 = s1[2].length, n2 = s2[2].length;
    return { text: 'How many ' + B('lines of symmetry') + ' do these two shapes have ' + B('in all') + '?', ans: n1 + n2,
      vis: '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">' + shapeSVG(s1[1], { max: 150 }) + shapeSVG(s2[1], { max: 150 }) + '</div>', howVis: '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">' + shapeSVG(s1[1], { max: 150, axes: s1[2] }) + shapeSVG(s2[1], { max: 150, axes: s2[2] }) + '</div>',
      how: ['The ' + s1[0] + ' has ' + n1 + ' ' + plural(n1, 'line') + ' of symmetry.', 'The ' + s2[0] + ' has ' + n2 + ' ' + plural(n2, 'line') + '.', 'In all: ' + pl(n1, n2) + ' = ' + B(n1 + n2) + '.'],
      steps: [st('Lines of symmetry of the first shape (the ' + s1[0].replace(/ \(.*\)/, '') + ')?', n1), st('Lines of symmetry of the second shape (the ' + s2[0].replace(/ \(.*\)/, '') + ')?', n2), st(B(pl(n1, n2)) + ' = ?', n1 + n2)],
      traps: s1[4].map(w => tr(w[0] + n2, 'g_symlines', w[1])).concat(s2[4].map(w => tr(n1 + w[0], 'g_symlines', w[1]))).slice(0, 3) };
  } },

{ id: 's_fracwhole', s: 'story', g: 4, title: 'Fraction-times-whole stories', pre: ['f_xwhole'], paper: true, cc: ['4.NF.B.4c'],
  tip: '5 people each eat 3/8 of a pound: that is 5 groups of 3/8, so 5 × 3/8 = 15/8. Multiply only the top; the bottom names the size of the pieces. 15/8 = 1 7/8.',
  gen(d, R) {
    const den = R.pick(d === 0 ? [2, 3, 4, 5, 6, 8] : [3, 4, 5, 6, 8, 10, 12]);
    let a; do a = d === 0 ? R.pick([1, 1, 2, 3]) : R.i(2, den - 1); while (a >= den || gcd(a, den) !== 1);
    const n = d === 0 ? R.i(2, 5) : R.i(3, 9), P = n * a; if (P % den === 0) return null;
    const ctx = R.pick([['Each of ' + B(n) + ' kids drinks ' + frac(a, den) + ' of a liter of juice. How many liters do they drink in all?', 'liters', 'They drink '],
      ['A snail crawls ' + frac(a, den) + ' of a meter every hour. How far does it crawl in ' + B(n) + ' hours?', 'meters', 'It crawls '],
      ['Each muffin needs ' + frac(a, den) + ' of a cup of milk. How much milk do ' + B(n) + ' muffins need?', 'cups', 'They need '],
      ['Each of ' + B(n) + ' friends eats ' + frac(a, den) + ' of a pound of grapes. How many pounds of grapes do they eat in all?', 'pounds', 'They eat ']]);
    const core = ['Write it: ' + n + ' groups of ' + frac(a, den) + ' is ' + n + ' × ' + frac(a, den) + '.', 'Multiply the top: ' + n + ' × ' + a + ' = ' + P + ', so it is ' + frac(P, den) + '. The bottom stays ' + den + '.'];
    const mixL = P > den ? [frac(P, den) + ' = ' + mx(P, den) + ', because every ' + frac(den, den) + ' makes 1 whole.'] : [];
    const baseSteps = [st('Tops: ' + B(n + ' × ' + a) + ' = ?', P), sf(n + ' × ' + frac(a, den) + ' = ?', P, den)];
    const baseTraps = [tr(F(P, den * n), 'f_xwhole', 'Multiply only the top: the pieces are still ' + frac(1, den) + ' each.'), tr(F(n + a, den), 'f_xwhole', n + ' groups of ' + frac(a, den) + ' is times, not plus.')];
    const vis = P / den <= 4 ? fracBarSVG(P, den) : '';
    if (d < 2) return { text: ctx[0] + ' Type a mixed number or a fraction.', ans: F(P, den), unit: ctx[1], howVis: vis,
      how: core.concat(mixL, [ctx[2] + B(endFrac(P, den)) + ' ' + ctx[1] + '.']).slice(0, 4), steps: baseSteps, traps: baseTraps };
    if (R.chance(0.5)) {
      const k = Math.ceil(P / den);
      return { text: 'Each of ' + B(n) + ' people at a picnic will eat ' + frac(a, den) + ' of a pound of cheese. The cheese comes in 1-pound blocks. How many blocks must they buy so there is enough?', ans: k, unit: 'blocks', howVis: vis,
        how: core.concat([frac(P, den) + ' = ' + mx(P, den) + ' pounds, which is between ' + (k - 1) + ' and ' + k + '.', (k - 1) + ' ' + plural(k - 1, 'block is', 'blocks are') + ' not enough, so they must buy ' + B(k) + ' blocks.']),
        steps: baseSteps.concat([st('As a mixed number that is ' + mx(P, den) + '. How many whole blocks make enough?', k)]),
        traps: [tr(k - 1, 's_leftover', 'They need enough for everyone: the leftover part needs one more block.'), tr(P, 'f_xwhole', 'That counts pieces of ' + frac(1, den) + ' pound. Change ' + frac(P, den) + ' to pounds first.')] };
    }
    const H = Math.ceil(P / den) + R.i(0, 2), L = H * den - P;
    return { text: 'A baker has ' + B(H + ' cups') + ' of sugar. Each batch of cookies uses ' + frac(a, den) + ' of a cup. The baker makes ' + B(n) + ' batches. How much sugar is left? Type a mixed number or a fraction.', ans: F(L, den), unit: 'cups', howVis: vis,
      how: [core[0] + ' ' + core[1], 'Left: ' + H + ' ' + MINUS + ' ' + frac(P, den) + ' = ' + frac(H * den, den) + ' ' + MINUS + ' ' + frac(P, den) + ' = ' + frac(L, den) + '.', B(endFrac(L, den)) + ' cups of sugar are left.'],
      steps: baseSteps.concat([sf(H + ' ' + MINUS + ' ' + frac(P, den) + ' = ?', L, den)]),
      traps: [tr(F(P, den), 's_fracwhole', 'That is the sugar used. How much of the ' + H + ' cups is left?'), tr(F(H * den - a, den), 's_fracwhole', 'There are ' + n + ' batches, not 1.'), baseTraps[0]] };
  } },

{ id: 's_units', s: 'story', g: 4, title: 'Measurement stories with units', pre: ['g_metric'], paper: true, cc: ['4.MD.A.2', '4.MD.A.1'],
  tip: 'Change everything to the smaller unit first: 1 m = 100 cm, 1 km = 1,000 m, 1 kg = 1,000 g, 1 L = 1,000 mL, 1 ft = 12 in. Then add, take away, times or divide.',
  gen(d, R) {
    const [A] = people(R);
    const kind = R.pick(d === 0 ? ['cut', 'cut', 'pour'] : d === 1 ? ['cups', 'laps', 'bottles'] : ['mixsub', 'mixdiv', 'feet', 'part']);
    const conv = (n, big, f, small) => n + ' ' + big + ' = ' + n + ' × ' + nm(f) + ' = ' + nm(n * f) + ' ' + small;
    if (kind === 'cut' || kind === 'pour') {
      const U = kind === 'pour' ? ['L', 'mL', 1000, 'A bottle holds ', ' of water. ' + A + ' drinks ', 'How many milliliters of water are left?', 'milliliters'] : R.pick([['m', 'cm', 100, 'A ribbon is ', ' long. ' + A + ' cuts off ', 'How many centimeters of ribbon are left?', 'centimeters'], ['kg', 'g', 1000, 'A bag holds ', ' of flour. ' + A + ' uses ', 'How many grams of flour are left?', 'grams']]);
      const [big, small, f] = U, n = R.i(1, 4), c = f === 100 ? R.i(12, 95) : R.i(1, 19) * 50 + R.pick([0, 0, 25]), T = n * f, r = T - c;
      if (c >= T) return null;
      return { text: U[3] + B(n + ' ' + big) + U[4] + B(c + ' ' + small) + '. ' + U[5], ans: r, unit: small,
        how: ['Change to the smaller unit: ' + conv(n, big, f, small) + '.', 'Take away: ' + mi(T, c) + ' = ' + nm(r) + '.', B(nm(r)) + ' ' + U[6] + ' are left.'],
        steps: [st(B(n + ' ' + big) + ' = how many ' + small + '?', T), st(B(mi(T, c)) + ' = ?', r)],
        traps: [tr(f === 1000 ? n * 100 - c : n * 1000 - c, 'g_metric', '1 ' + big + ' = ' + nm(f) + ' ' + small + '. Count the zeros.'), tr(Math.abs(c - n), 's_units', 'Change ' + n + ' ' + big + ' to ' + small + ' before you take away.'), tr(noBorrow(T, c), 'a_zeros', 'Taking away across zeros: trade from the next place over.')] };
    }
    if (kind === 'cups') {
      const cup = R.pick([100, 200, 250, 500]), L = R.i(1, 4), T = L * 1000, n = T / cup;
      return { text: 'A ' + B(L + ' L') + ' jug of lemonade is poured into cups that hold ' + B(cup + ' mL') + ' each. How many cups can be filled?', ans: n, unit: 'cups',
        how: ['Change to the smaller unit: ' + conv(L, 'L', 1000, 'mL') + '.', 'How many ' + cup + 's in ' + nm(T) + '? ' + nm(T) + ' ÷ ' + cup + ' = ' + n + ' (' + n + ' × ' + cup + ' = ' + nm(T) + ').', B(n) + ' cups can be filled.'],
        steps: [st(B(L + ' L') + ' = how many mL?', T), st(B(nm(T) + ' ÷ ' + cup) + ' = ?', n)],
        traps: [tr(L * 100 / cup >= 1 && (L * 100) % cup === 0 ? L * 100 / cup : null, 'g_metric', '1 L = 1,000 mL, not 100 mL.'), tr(n * 10, 'g_metric', 'Check the zeros: 1 L = 1,000 mL.'), tr(T - cup, 's_groups', 'Filling cups of ' + cup + ' mL is dividing, not taking away once.')] };
    }
    if (kind === 'laps') {
      const [km, lap] = R.pick([[1, 200], [1, 250], [1, 500], [2, 250], [2, 400], [2, 500], [3, 250], [3, 500], [3, 750], [4, 500], [4, 400], [5, 500], [3, 600], [2, 200]]), T = km * 1000, n = T / lap;
      return { text: A + ' runs ' + B(km + ' km') + ' on a track. One lap is ' + B(lap + ' m') + '. How many laps does ' + A + ' run?', ans: n, unit: 'laps',
        how: ['Change to the smaller unit: ' + conv(km, 'km', 1000, 'm') + '.', nm(T) + ' ÷ ' + lap + ' = ' + n + ' (' + n + ' × ' + lap + ' = ' + nm(T) + ').', A + ' runs ' + B(n) + ' laps.'],
        steps: [st(B(km + ' km') + ' = how many m?', T), st(B(nm(T) + ' ÷ ' + lap) + ' = ?', n)],
        traps: [tr(n * 10, 'g_metric', 'Check the zeros: 1 km = 1,000 m.'), tr(n % 10 === 0 ? n / 10 : null, 'g_metric', '1 km = 1,000 m, not 100 m.'), tr(T - lap, 's_groups', 'Laps of ' + lap + ' m is dividing, not taking away once.')] };
    }
    if (kind === 'bottles') {
      const k = R.i(3, 8), each = R.i(3, 9) * 50, T = k * each;
      return { text: A + ' buys ' + B(k) + ' bottles of water. Each holds ' + B(each + ' mL') + '. How many milliliters is that in all?', ans: T, unit: 'mL',
        how: ['Equal bottles: multiply. ' + k + ' × ' + each + '.', k + ' × ' + Math.floor(each / 100) * 100 + ' = ' + nm(k * Math.floor(each / 100) * 100) + (each % 100 ? ' and ' + k + ' × ' + (each % 100) + ' = ' + k * (each % 100) : '') + '.', (each % 100 ? pl(k * Math.floor(each / 100) * 100, k * (each % 100)) + ' = ' : 'So it is ') + B(nm(T)) + ' mL' + (T >= 1000 ? ', which is more than 1 L.' : '.')],
        steps: [st(B(k + ' × ' + Math.floor(each / 100) * 100) + ' = ?', k * Math.floor(each / 100) * 100), st(B(k + ' × ' + each) + ' = ?', T)],
        traps: [tr(k + each, 's_groups', 'Equal bottles: multiply.'), tr(each % 100 ? k * Math.floor(each / 100) * 100 + each % 100 : null, 'm_breakapart', 'Multiply the ' + (each % 100) + ' by ' + k + ' too.')] };
    }
    if (kind === 'mixsub') {
      const U = R.pick([['kg', 'g', 1000, 'A box of apples has a mass of ', '. ' + A + ' takes out ', ' of apples. How many grams are left?', 'grams'], ['L', 'mL', 1000, 'A pot holds ', ' of soup. ' + A + ' serves ', ' of soup. How many milliliters are left?', 'milliliters'], ['m', 'cm', 100, 'A board is ', ' long. ' + A + ' saws off ', '. How many centimeters are left?', 'centimeters']]);
      const [big, small, f] = U, n = R.i(1, 3), e = f === 100 ? R.i(5, 60) : R.i(1, 8) * 100, c = f === 100 ? R.i(e + 10, 95) : R.i(e / 50 + 1, 19) * 50, T = n * f + e, r = T - c;
      if (r <= 0) return null;
      return { text: U[3] + B(n + ' ' + big + ' ' + e + ' ' + small) + U[4] + B(c + ' ' + small) + U[5], ans: r, unit: small,
        how: ['Change to the smaller unit: ' + n + ' ' + big + ' = ' + nm(n * f) + ' ' + small + ', and ' + pl(n * f, e) + ' = ' + nm(T) + ' ' + small + '.', 'Take away: ' + mi(T, c) + ' = ' + nm(r) + '.', B(nm(r)) + ' ' + U[6] + ' are left.'],
        steps: [st(B(n + ' ' + big + ' ' + e + ' ' + small) + ' = how many ' + small + '?', T), st(B(mi(T, c)) + ' = ?', r)],
        traps: [tr(c > e ? n * f + (c - e) : null, 's_units', 'There are not enough ' + small + ' to take from. Change the ' + big + ' to ' + small + ' first, then take away.'), tr(n * (f === 100 ? 1000 : 100) + e - c > 0 ? n * (f === 100 ? 1000 : 100) + e - c : null, 'g_metric', '1 ' + big + ' = ' + nm(f) + ' ' + small + '.'), tr(c - e, 's_units', 'Take the ' + c + ' ' + small + ' from all of it: ' + n + ' ' + big + ' and ' + e + ' ' + small + '.')] };
    }
    if (kind === 'mixdiv') {
      const k = R.i(2, 6), each = R.i(3, 9) * 10 + R.pick([0, 0, 5]), T = k * each, n = Math.floor(T / 100), e = T % 100;
      if (n < 1 || e === 0) return null;
      return { text: 'A ribbon ' + B(n + ' m ' + e + ' cm') + ' long is cut into ' + B(k) + ' equal pieces. How many centimeters long is each piece?', ans: each, unit: 'cm',
        how: ['Change to the smaller unit: ' + n + ' m = ' + n * 100 + ' cm, and ' + pl(n * 100, e) + ' = ' + T + ' cm.', 'Equal pieces: divide. ' + T + ' ÷ ' + k + ' = ' + each + ' (' + k + ' × ' + each + ' = ' + T + ').', 'Each piece is ' + B(each) + ' cm long.'],
        steps: [st(B(n + ' m ' + e + ' cm') + ' = how many cm?', T), st(B(T + ' ÷ ' + k) + ' = ?', each)],
        traps: [tr(Number.isInteger((n * 1000 + e) / k) ? (n * 1000 + e) / k : null, 'g_metric', '1 m = 100 cm, not 1,000.'), tr(Number.isInteger((n + e) / k) ? (n + e) / k : null, 's_units', 'Change the meters to centimeters first.'), tr(T - k, 's_groups', 'Equal pieces is dividing.')] };
    }
    if (kind === 'feet') {
      if (R.chance(0.5)) {
        const ft = R.i(2, 6), inch = R.i(1, 11), c = R.i(inch + 1, 20), T = ft * 12 + inch, r = T - c;
        return { text: 'A rope is ' + B(ft + ' feet ' + inch + ' inches') + ' long. ' + A + ' cuts off ' + B(c + ' inches') + '. How many inches of rope are left?', ans: r, unit: 'inches',
          how: ['Change to the smaller unit: ' + ft + ' feet = ' + ft + ' × 12 = ' + ft * 12 + ' inches, and ' + pl(ft * 12, inch) + ' = ' + T + ' inches.', 'Take away: ' + mi(T, c) + ' = ' + r + '.', B(r) + ' inches of rope are left.'],
          steps: [st(B(ft + ' feet ' + inch + ' inches') + ' = how many inches?', T), st(B(mi(T, c)) + ' = ?', r)],
          traps: [tr(ft * 10 + inch - c, 'g_custom', '1 foot is 12 inches, not 10.'), tr(T + c, 's_units', 'Cutting some off leaves less: take away.'), tr(ft * 12 - c, 's_units', 'Add the ' + inch + ' inches too.')] };
      }
      const ft = R.pick([2, 3, 4, 5, 6]), k = R.pick([3, 4, 6, 8, 9]), T = ft * 12; if (T % k) return null; const each = T / k;
      return { text: 'A board ' + B(ft + ' feet') + ' long is cut into ' + B(k) + ' equal pieces. How many inches long is each piece?', ans: each, unit: 'inches',
        how: ['Change to the smaller unit: ' + ft + ' feet = ' + ft + ' × 12 = ' + T + ' inches.', 'Equal pieces: divide. ' + T + ' ÷ ' + k + ' = ' + each + '.', 'Each piece is ' + B(each) + ' inches long.'],
        steps: [st(B(ft + ' feet') + ' = how many inches?', T), st(B(T + ' ÷ ' + k) + ' = ?', each)],
        traps: [tr(Number.isInteger(ft * 10 / k) ? ft * 10 / k : null, 'g_custom', '1 foot is 12 inches, not 10.'), tr(T - k, 's_groups', 'Equal pieces is dividing.')] };
    }
    const [nn, dd, w] = R.pick([[1, 2, 'half'], [1, 4, 'quarter'], [3, 4, 'three quarters'], [1, 10, 'tenth']]), U = R.pick([['kg', 'g', 1000, 'nuts', 'grams'], ['L', 'mL', 1000, 'milk', 'milliliters']]), k = R.i(2, 6);
    const one = U[2] * nn / dd, T = one * k;
    return { text: 'Each of ' + B(k) + ' kids gets ' + frac(nn, dd) + ' ' + U[0] + ' of ' + U[3] + '. How many ' + U[4] + ' of ' + U[3] + ' is that in all?', ans: T, unit: U[1],
      how: ['Change to the smaller unit: 1 ' + U[0] + ' = 1,000 ' + U[1] + ', so ' + frac(nn, dd) + ' ' + U[0] + ' = 1,000 ÷ ' + dd + (nn > 1 ? ' × ' + nn : '') + ' = ' + nm(one) + ' ' + U[1] + '.', k + ' kids: ' + k + ' × ' + nm(one) + ' = ' + nm(T) + '.', 'That is ' + B(nm(T)) + ' ' + U[4] + '.'],
      steps: [st(frac(nn, dd) + ' ' + U[0] + ' = how many ' + U[1] + '?', one), st(B(k + ' × ' + nm(one)) + ' = ?', T)],
      traps: [tr(T / 10, 'g_metric', '1 ' + U[0] + ' = 1,000 ' + U[1] + ', not 100.'), tr(one, 's_units', 'That is one kid\'s share. There are ' + k + ' kids.'), tr(k * nn, 's_fracwhole', 'Change to ' + U[1] + ' first: the question asks for ' + U[4] + '.')] };
  } },

/* =================== Grade 5 =================== */
{ id: 'x_readexpr', s: 'alg', g: 5, title: 'Read it, don\'t work it out', pre: ['m_groups'], cc: ['5.OA.A.2'],
  tip: 'Read the shape of an expression before you work it out. 3 × (18,932 + 921) is 3 groups of (18,932 + 921), so it is 3 times as big. No need to add.',
  gen(d, R) {
    const A = R.i(1200, 48000), Bv = R.i(120, 9800), S = nm(A) + ' + ' + nm(Bv), D = nm(A) + ' ' + MINUS + ' ' + nm(Bv), grp = R.chance(0.5) ? S : D, val = grp === S ? A + Bv : A - Bv;
    const kind = R.pick(d === 0 ? ['times', 'less'] : d === 1 ? ['ratio', 'div', 'more', 'words'] : ['onemore', 'groupsub', 'ratio']);
    if (kind === 'times') {
      const k = R.i(2, 9), front = R.chance(0.6), e = front ? k + ' × (' + grp + ')' : '(' + grp + ') × ' + k;
      return { text: 'Without working it out: ' + B(e) + ' is how many times as big as ' + B(grp) + '?', ans: k,
        how: [e + ' means ' + k + ' groups of (' + grp + ').', k + ' groups of a number is ' + k + ' times as big, so the answer is ' + B(k) + '. No need to work out ' + grp + '.'],
        steps: [st('How many groups of (' + grp + ') are there in ' + e + '?', k)],
        traps: [tr(k * val, 'x_readexpr', 'You worked it all out! The question only asks how many times as big: read the expression.'), tr(k + 1, 'x_readexpr', 'Count the groups of (' + grp + '): the number it is multiplied by.')] };
    }
    if (kind === 'less' || kind === 'more') {
      const c = R.i(3, 99), m = R.i(3, 9), base = kind === 'more' ? m + ' × (' + grp + ')' : '(' + grp + ')', e = kind === 'more' ? base + ' + ' + c : base + ' ' + MINUS + ' ' + c;
      return { text: 'Without working it out: ' + B(e) + ' is how much ' + (kind === 'more' ? 'more' : 'less') + ' than ' + B(base) + '?', ans: c,
        how: [e + ' starts with ' + base + ', then ' + (kind === 'more' ? 'adds ' : 'takes away ') + c + '.', 'So it is ' + B(c) + (kind === 'more' ? ' more.' : ' less.') + ' The big numbers inside do not matter.'],
        steps: [st('What number is ' + (kind === 'more' ? 'added on' : 'taken away') + ' at the end?', c)],
        traps: [tr(kind === 'more' ? m * val + c : val - c, 'x_readexpr', 'That is the value of the expression. The question asks only how much ' + (kind === 'more' ? 'more' : 'less') + '.'), kind === 'more' ? tr(m * c, 'x_order', 'Only the brackets are multiplied by ' + m + '. The ' + c + ' is added after.') : tr(2 * c, 'x_readexpr', 'Only ' + c + ' is taken away.')] };
    }
    if (kind === 'ratio') {
      const n = R.i(2, 4), k = R.i(2, d === 2 ? 6 : 5), m = n * k, e1 = R.chance(0.5) ? m + ' × (' + grp + ')' : '(' + grp + ') × ' + m, e2 = R.chance(0.5) ? n + ' × (' + grp + ')' : '(' + grp + ') × ' + n;
      return { text: 'Without working it out: ' + B(e1) + ' is how many times as big as ' + B(e2) + '?', ans: k,
        how: ['The first is ' + m + ' groups of (' + grp + '); the second is ' + n + ' groups of the same thing.', m + ' groups is ' + m + ' ÷ ' + n + ' = ' + B(k) + ' times as many as ' + n + ' groups.'],
        steps: [st('How many groups in the first?', m), st('How many groups in the second?', n), st(B(m + ' ÷ ' + n) + ' = ?', k)],
        traps: [tr(m - n, 'x_readexpr', 'How many times as big means divide: ' + m + ' ÷ ' + n + ', not take away.'), tr(m, 'x_readexpr', 'Compare with ' + n + ' groups, not with 1 group.')] };
    }
    if (kind === 'div') {
      const k = R.i(2, 9);
      return { text: 'Without working it out: ' + B(grp) + ' is how many times as big as ' + B('(' + grp + ') ÷ ' + k) + '?', ans: k,
        how: ['(' + grp + ') ÷ ' + k + ' is one of ' + k + ' equal parts of ' + grp + '.', k + ' of those parts make the whole, so ' + grp + ' is ' + B(k) + ' times as big.'],
        steps: [st('Into how many equal parts is (' + grp + ') split?', k)],
        traps: [tr(Number.isInteger(val / k) ? val / k : null, 'x_readexpr', 'That works out the value. The question asks how many times as big.'), tr(k - 1, 'x_readexpr', 'Count all ' + k + ' equal parts.')] };
    }
    if (kind === 'words') {
      const a = R.i(120, 980), b = R.i(15, 95), k = R.i(3, 9);
      return { text: 'Add ' + B(nm(a)) + ' and ' + B(b) + ', then multiply by ' + B(k) + '. Without working it out, the answer is how many times as big as ' + B(nm(a) + ' + ' + b) + '?', ans: k,
        how: ['Write it: ' + k + ' × (' + nm(a) + ' + ' + b + '). The brackets show what to do first.', 'That is ' + k + ' groups of (' + nm(a) + ' + ' + b + '), so it is ' + B(k) + ' times as big.'],
        steps: [st('Write it as ? × (' + nm(a) + ' + ' + b + '). What number goes in the box?', k)],
        traps: [tr(k * (a + b), 'x_readexpr', 'You worked it out! Just read how many groups there are.'), tr(a + b, 'x_readexpr', 'That is the sum. Multiplying by ' + k + ' makes it ' + k + ' times as big.')] };
    }
    if (kind === 'onemore') {
      const X = R.i(13, 99), n = R.i(3, 8), g = R.pick([1, 1, 2]), m = n + g;
      return { text: 'Without multiplying: ' + B(m + ' × ' + X) + ' is how much more than ' + B(n + ' × ' + X) + '?', ans: g * X,
        how: [m + ' × ' + X + ' is ' + m + ' groups of ' + X + '; ' + n + ' × ' + X + ' is ' + n + ' groups of ' + X + '.', 'The difference is ' + mi(m, n) + ' = ' + g + ' ' + plural(g, 'group') + ' of ' + X + ': ' + (g === 1 ? B(X) : g + ' × ' + X + ' = ' + B(g * X)) + '.'],
        steps: [st('How many more groups of ' + X + ' are there? ' + B(mi(m, n)) + ' = ?', g), st(B(g + ' × ' + X) + ' = ?', g * X)],
        traps: [tr(g, 'x_readexpr', 'That counts the extra groups. How much is ' + plural(g, 'one group', g + ' groups') + ' of ' + X + '?'), tr(m * X, 'x_readexpr', 'That is ' + m + ' × ' + X + '. The question asks how much more.'), tr(X + g, 'x_readexpr', 'Each extra group is worth ' + X + '.')] };
    }
    const k = R.i(3, 9), X = R.i(25, 99), Y = R.i(11, X - 5);
    return { text: 'Without multiplying, fill the box: ' + B(k + ' × ' + X + ' ' + MINUS + ' ' + k + ' × ' + Y + ' = ' + k + ' × □') + '. What number goes in the box?', ans: X - Y,
      how: [k + ' groups of ' + X + ' take away ' + k + ' groups of ' + Y + ' leaves ' + k + ' groups of (' + X + ' ' + MINUS + ' ' + Y + ').', 'So the box is ' + mi(X, Y) + ' = ' + B(X - Y) + '.'],
      steps: [st('Each group shrinks from ' + X + ' to what? ' + B(mi(X, Y)) + ' = ?', X - Y)],
      traps: [tr(k * (X - Y), 'x_readexpr', 'That is the whole value. The box is what gets multiplied by ' + k + '.'), tr(X + Y, 'x_distribute', 'Groups taken away: the inside is ' + X + ' ' + MINUS + ' ' + Y + '.'), tr(noBorrow(X, Y), 'a_borrow', 'Check the taking away.')] };
  } },

{ id: 'p_twopat', s: 'pat', g: 5, title: 'Two patterns side by side', pre: ['s_times'], cc: ['5.OA.B.3'],
  tip: 'Line the two patterns up step by step. If A adds 3 and B adds 6, both from 0, then every B is 2 times its A, because 6 is 2 times 3.',
  gen(d, R) {
    const a = R.i(2, 6), k = R.i(2, d === 0 ? 3 : 5), b = a * k, cols = [0, 1, 2, 3, 4];
    const tbl = (q) => table([['A: add ' + a].concat(cols.map(i => a * i)), ['B: add ' + b].concat(cols.map(i => q && i === 4 ? '?' : b * i))]);
    const rel = 'B goes up by ' + b + ' each step and A by ' + a + ', so each B is ' + b + ' ÷ ' + a + ' = ' + k + ' times its A.';
    if (d === 0) {
      return { text: 'Both patterns start at 0. Pattern A adds ' + B(a) + ' each time. Pattern B adds ' + B(b) + ' each time. When A is ' + B(4 * a) + ', what is B?', ans: 4 * b, vis: tbl(true),
        how: ['Keep adding: ' + 3 * b + ' + ' + b + ' = ' + 4 * b + '.', 'Check with the link: ' + rel + ' ' + k + ' × ' + 4 * a + ' = ' + B(4 * b) + '.'],
        steps: [st('B is 4 jumps of ' + b + ': ' + B('4 × ' + b) + ' = ?', 4 * b)],
        traps: [tr(4 * a + (b - a), 'p_twopat', 'B does not stay the same distance above A: it grows faster, ' + b + ' each step.'), tr(3 * b, 'p_twopat', 'That is B one step earlier. Line up the B under A = ' + 4 * a + '.'), tr(4 * a + b, 'p_twopat', 'B is a pattern of its own: add ' + b + ' to the B before it.')] };
    }
    const kind = R.pick(d === 1 ? ['far', 'times', 'far'] : ['rev', 'graph', 'diff']);
    if (kind === 'times') return { text: 'Both patterns start at 0. Pattern A adds ' + B(a) + ' each time. Pattern B adds ' + B(b) + ' each time. Each number in B is how many times the number above it in A?', ans: k, vis: tbl(false),
      how: ['Look at one pair: A = ' + 2 * a + ', B = ' + 2 * b + '. ' + 2 * b + ' ÷ ' + 2 * a + ' = ' + k + '.', 'It is the same for every pair, because B adds ' + b + ' while A adds ' + a + ', and ' + b + ' = ' + k + ' × ' + a + '. So B is ' + B(k) + ' times A.'],
      steps: [st('A pair: A = ' + 3 * a + ', B = ' + 3 * b + '. ' + B(3 * b + ' ÷ ' + 3 * a) + ' = ?', k)],
      traps: [tr(b - a, 'p_twopat', 'How many times means divide, not take away.'), tr(2 * b - 2 * a, 'p_twopat', 'The gap between A and B keeps growing. Compare by dividing.')] };
    const n = R.i(7, 15), An = n * a, Bn = n * b;
    if (kind === 'far') return { text: 'Both patterns start at 0. Pattern A adds ' + B(a) + ' each time. Pattern B adds ' + B(b) + ' each time. When A is ' + B(An) + ', what is B?', ans: Bn, vis: tbl(false),
      how: [rel, 'When A is ' + An + ', B is ' + k + ' × ' + An + ' = ' + B(Bn) + '. (Or: ' + An + ' is ' + n + ' jumps of ' + a + ', so B is ' + n + ' jumps of ' + b + '.)'],
      steps: [st('Each B is how many times its A?', k), st(B(k + ' × ' + An) + ' = ?', Bn)],
      traps: [tr(An + (b - a), 'p_twopat', 'B does not stay the same distance above A: B grows ' + k + ' times as fast.'), tr(An + b, 'p_twopat', 'B is not A plus ' + b + '. Find the link: each B is ' + k + ' times its A.'), tr(n * b + b, 'p_twopat', 'Count the jumps: ' + An + ' is ' + n + ' jumps of ' + a + '.')] };
    if (kind === 'rev') return { text: 'Both patterns start at 0. Pattern A adds ' + B(a) + ' each time. Pattern B adds ' + B(b) + ' each time. When B is ' + B(Bn) + ', what is A?', ans: An, vis: tbl(false),
      how: [rel, 'So A is B ÷ ' + k + ': ' + Bn + ' ÷ ' + k + ' = ' + B(An) + '.'],
      steps: [st('Each B is how many times its A?', k), st(B(Bn + ' ÷ ' + k) + ' = ?', An)],
      traps: [tr(Bn * k, 'p_twopat', 'A is the smaller pattern: divide by ' + k + '.'), tr(Bn - (b - a), 'p_twopat', 'A is not a fixed distance below B. Use the link: B is ' + k + ' times A.'), tr(n, 'p_twopat', 'That is how many steps. The question asks for A.')] };
    if (kind === 'graph') return { text: 'Both patterns start at 0. Pattern A adds ' + B(a) + ' each time. Pattern B adds ' + B(b) + ' each time. Each pair (A, B) is graphed as a point (x, y). What is the y-coordinate of the point with x = ' + B(An) + '?', ans: Bn, vis: tbl(false),
      how: ['A point (x, y) is (A, B), so x = ' + An + ' means A = ' + An + '.', rel + ' y = ' + k + ' × ' + An + ' = ' + B(Bn) + '.'],
      steps: [st('Each B is how many times its A?', k), st('y = ' + B(k + ' × ' + An) + ' = ?', Bn)],
      traps: [tr(An, 'x_coord', 'x is A and y is B: find the B that goes with this A.'), tr(An + (b - a), 'p_twopat', 'B grows ' + k + ' times as fast as A, so the gap is not fixed.')] };
    return { text: 'Both patterns start at 0. Pattern A adds ' + B(a) + ' each time. Pattern B adds ' + B(b) + ' each time. When A is ' + B(An) + ', how much bigger is B than A?', ans: Bn - An, vis: tbl(false),
      how: [rel + ' When A is ' + An + ', B is ' + k + ' × ' + An + ' = ' + Bn + '.', 'B ' + MINUS + ' A = ' + mi(Bn, An) + ' = ' + B(Bn - An) + '.'],
      steps: [st('B when A is ' + An + '?', Bn), st(B(mi(Bn, An)) + ' = ?', Bn - An)],
      traps: [tr(b - a, 'p_twopat', 'The gap grows by ' + (b - a) + ' each step. Find B first, then the gap.'), tr(Bn, 'p_twopat', 'That is B. How much bigger than A is it?')] };
  } },

{ id: 'n_deccomp', s: 'count', g: 5, title: 'Compare decimals to thousandths', pre: ['f_dec100'], cc: ['5.NBT.A.3b'],
  tip: 'Give every decimal three places: 0.4 = 0.400 and 0.47 = 0.470. Then compare the thousandths like whole numbers, starting with the biggest place.',
  gen(d, R) {
    if (d === 2 && R.chance(0.6)) return digitProblem(R, 3, R.chance(0.5), 'n_deccomp');
    const t = R.i(2, 8), k = R.i(1, 9), n = d === 0 ? 3 : 4, W = d > 0 && R.chance(0.35) ? R.i(1, 5) * 1000 : 0;
    const pair = [W + t * 100, W + t * 100 + k];
    const rest = R.shuffle([W + t * 100 + 10 * k, W + 10 * k + t, W + (t - 1) * 100 + R.i(10, 99), W + t * 100 + R.i(11, 99), W + (t + 1) * 100, W ? W - R.i(1, 99) : R.i(1, 9)]);
    const vals = pair.slice(); for (const v of rest) { if (vals.length >= n) break; if (v > 0 && !vals.includes(v)) vals.push(v); }
    if (vals.length < n) return null;
    return orderProblem(R.shuffle(vals), 3, d === 0 ? R.pick(['big', 'small']) : R.pick(['big', 'small', 'big2', 'small2']), 'n_deccomp');
  } },

{ id: 'f_fracdiv', s: 'frac', g: 5, title: 'A fraction is a division', pre: ['m_remain'], cc: ['5.NF.B.3'],
  tip: 'a ÷ b = a/b. 3 pizzas shared by 4 kids: cut each pizza into 4, and each kid gets one piece of each, 3/4 of a pizza. 7 ÷ 2 = 7/2 = 3 1/2.',
  gen(d, R) {
    const shareSVG = (a, b) => { const w = 300 / b, h = 26; let s = SVG(310, a * (h + 8) + 4, 340); for (let r = 0; r < a; r++) for (let i = 0; i < b; i++) s += '<rect x="' + (4 + i * w).toFixed(1) + '" y="' + (2 + r * (h + 8)) + '" width="' + w.toFixed(1) + '" height="' + h + '" class="' + (i === 0 ? 'fig-on' : 'fig-cell') + '"/>'; return s + '</svg>'; };
    if (d === 0) {
      const b = R.i(3, 8), a = R.i(2, b - 1);
      const ctx = R.pick([[a + ' ' + plural(a, 'pizza') + ' are shared equally by ' + b + ' kids. How much pizza does each kid get?', 'of a pizza', 'pizza'], [a + ' ' + plural(a, 'meter') + ' of ribbon is cut into ' + b + ' equal pieces. How long is each piece?', 'meter', 'meter of ribbon'], [a + ' ' + plural(a, 'cup') + ' of juice are poured equally into ' + b + ' glasses. How much juice is in each glass?', 'cup', 'cup']]);
      return { text: ctx[0].replace(String(a), B(a)).replace(' ' + b + ' ', ' ' + B(b) + ' '), ans: F(a, b), unit: ctx[1], howVis: a <= 6 ? shareSVG(a, b) : '',
        how: ['Cut each ' + ctx[2] + ' into ' + b + ' equal pieces. Each piece is ' + frac(1, b) + '.', 'Each share gets one piece from each of the ' + a + ': ' + a + ' pieces of ' + frac(1, b) + ' = ' + frac(a, b) + '.', 'So ' + a + ' ÷ ' + b + ' = ' + B(frac(a, b)) + '.'],
        steps: [st('Each piece is 1 over what number?', b), st('How many pieces does each share get?', a)],
        traps: [tr(F(b, a), 'f_fracdiv', 'The amount shared goes on top: ' + a + ' ÷ ' + b + ' = ' + a + ' over ' + b + '.'), tr(F(1, b), 'f_fracdiv', 'Each share gets a piece from every one of the ' + a + '.')] };
    }
    if (d === 1) {
      const b = R.i(2, 9), q = R.i(1, 9), r = R.i(1, b - 1), a = q * b + r;
      const ctx = R.pick([['A ' + B(a + ' m') + ' rope is cut into ' + B(b) + ' equal pieces. How long is each piece?', 'm'], [B(a + ' kg') + ' of clay is shared equally by ' + B(b) + ' kids. How much clay does each kid get?', 'kg'], [B(a + ' liters') + ' of water are poured equally into ' + B(b) + ' buckets. How much water is in each bucket?', 'liters']]);
      return { text: ctx[0] + ' Type a mixed number or a fraction.', ans: F(a, b), unit: ctx[1],
        how: ['Each share is ' + a + ' ÷ ' + b + ' = ' + frac(a, b) + '.', a + ' ÷ ' + b + ' = ' + q + ' r ' + r + ': ' + q + ' whole and ' + r + ' left over.', 'The ' + r + ' left over, shared by ' + b + ', is ' + frac(r, b) + '. So each share is ' + B(mixed(q, r, b)) + ' ' + ctx[1] + '.'],
        steps: [st('Divide: ' + B(a + ' ÷ ' + b) + ' = ? (type it like 7r2)', { q, r }, { type: 'rem' }), sf('The leftover ' + r + ' shared by ' + b + ' is what fraction?', r, b)],
        traps: [tr(q + r / 10, 'm_remain', 'A remainder of ' + r + ' is not ' + r + ' tenths. The ' + r + ' left is shared by ' + b + ': ' + r + ' ÷ ' + b + '.'), tr(F(b, a), 'f_fracdiv', 'The amount shared goes on top: ' + a + ' ÷ ' + b + ' = ' + a + ' over ' + b + '.'), tr(q, 'f_fracdiv', 'Share the leftover ' + r + ' too.')] };
    }
    const kind = R.pick(['rev', 'between', 'bags']);
    if (kind === 'rev') {
      let p, qd; do { qd = R.pick([2, 3, 4, 5, 6, 8]); p = R.i(1, qd - 1); } while (gcd(p, qd) !== 1);
      const m = R.i(2, 4), kids = qd * m, piz = p * m;
      return { text: B(kids) + ' kids share some pizzas equally. Each kid gets ' + frac(p, qd) + ' of a pizza. How many pizzas are there?', ans: piz, unit: 'pizzas',
        how: ['Pizzas ÷ ' + kids + ' = ' + frac(p, qd) + ', so pizzas = ' + kids + ' × ' + frac(p, qd) + '.', kids + ' × ' + frac(p, qd) + ' = ' + frac(kids * p, qd) + ' = ' + B(piz) + ' pizzas. Check: ' + piz + ' ÷ ' + kids + ' = ' + frac(piz, kids) + ' = ' + frac(p, qd) + '.'],
        steps: [st('Tops: ' + B(kids + ' × ' + p) + ' = ?', kids * p), st(B(kids * p + ' ÷ ' + qd) + ' = ?', piz)],
        traps: [tr(kids * p, 'f_xwhole', 'Divide by the bottom too: ' + frac(kids * p, qd) + ' is how many wholes?'), tr(p, 'f_fracdiv', p + ' over ' + qd + ' is a share for ' + qd + ' kids. There are ' + kids + '.')] };
    }
    if (kind === 'between') {
      const b = R.i(3, 9), q = R.i(4, 12), r = R.i(1, b - 1), a = q * b + r;
      return { text: B(frac(a, b)) + ' is the same as ' + B(a + ' ÷ ' + b) + '. Between which two whole numbers is it? Type the ' + B('smaller') + ' one.', ans: q,
        how: [frac(a, b) + ' = ' + a + ' ÷ ' + b + ' = ' + q + ' r ' + r + ', so ' + frac(a, b) + ' = ' + mixed(q, r, b) + '.', 'That is between ' + q + ' and ' + (q + 1) + '. The smaller one is ' + B(q) + '.'],
        steps: [st('Divide: ' + B(a + ' ÷ ' + b) + ' = ? (type it like 7r2)', { q, r }, { type: 'rem' }), st('So it is between ? and ' + (q + 1) + '.', q)],
        traps: [tr(q + 1, 'f_fracdiv', 'That is the bigger one.'), tr(r, 'm_remain', 'That is the remainder. The whole-number part comes from ' + a + ' ÷ ' + b + '.')] };
    }
    const fam = R.pick([4, 6, 8, 3]), tot = fam * R.i(3, 9) + R.i(1, fam - 1);
    return { text: 'A food bank has ' + B(tot + ' pounds') + ' of rice to share equally among ' + B(fam) + ' families. How many pounds does each family get? Type a mixed number or a fraction.', ans: F(tot, fam), unit: 'pounds',
      how: ['Each share is ' + tot + ' ÷ ' + fam + ' = ' + frac(tot, fam) + '.', tot + ' ÷ ' + fam + ' = ' + Math.floor(tot / fam) + ' r ' + tot % fam + ', so ' + frac(tot, fam) + ' = ' + mx(tot, fam) + '.', 'Each family gets ' + B(endFrac(tot, fam)) + ' pounds.'],
      steps: [st('Divide: ' + B(tot + ' ÷ ' + fam) + ' = ? (type it like 7r2)', { q: Math.floor(tot / fam), r: tot % fam }, { type: 'rem' }), sf('Each share as a fraction: ?', tot, fam)],
      traps: [tr(Math.floor(tot / fam) + (tot % fam) / 10, 'm_remain', 'A remainder is not tenths: the ' + tot % fam + ' left is shared by ' + fam + '.'), tr(F(fam, tot), 'f_fracdiv', 'The amount shared goes on top.'), tr(Math.floor(tot / fam), 'f_fracdiv', 'Share the leftover pounds too.')] };
  } },

{ id: 'g_fracarea', s: 'meas', g: 5, title: 'Area with fraction sides', pre: ['f_mult'], paper: true, cc: ['5.NF.B.4b'],
  tip: 'Area is still length × width. 3/4 m by 2/3 m: the square meter is cut into 4 × 3 = 12 tiles and the rectangle covers 3 × 2 = 6, so 6/12 = 1/2 square meter.',
  gen(d, R) {
    const U = R.pick([['m', 'square m', 'meter'], ['ft', 'square ft', 'foot'], ['yd', 'square yd', 'yard']]);
    if (d === 0) {
      let a, b, c, e; do { b = R.i(2, 6); e = R.i(2, 6); a = R.i(1, b - 1); c = R.i(1, e - 1); } while (gcd(a, b) > 1 || gcd(c, e) > 1 || (a === 1 && c === 1 && R.chance(0.6)));
      const P = a * c, Q = b * e;
      return { text: 'A rectangle is ' + frac(a, b) + ' ' + U[0] + ' long and ' + frac(c, e) + ' ' + U[0] + ' wide. What is its area?', ans: F(P, Q), unit: U[1], vis: tileSVG(a, b, c, e, U[0]),
        how: ['Area = length × width = ' + frac(a, b) + ' × ' + frac(c, e) + '.', 'The square ' + U[2] + ' is cut into ' + b + ' × ' + e + ' = ' + Q + ' equal tiles, each ' + frac(1, Q) + ' ' + U[1] + '. The rectangle covers ' + a + ' × ' + c + ' = ' + plural(P, '1 tile', P + ' tiles') + '.', 'Area = ' + (gcd(P, Q) > 1 ? frac(P, Q) + ' = ' : '') + B(fm(P, Q)) + ' ' + U[1] + '.'],
        steps: [st('How many tiles cover the whole square?', Q), st('How many tiles does the rectangle cover?', P), sf('Area = ?', P, Q)],
        traps: [tr(F(a * e + b * c, Q), 'g_area', 'Area multiplies length by width; it does not add them.'), tr(F(P, b + e), 'f_mult', 'Multiply the bottoms too: the square is cut into ' + b + ' × ' + e + ' tiles.'), tr(F(2 * (a * e + c * b), Q), 'g_perim', 'That is the perimeter. Area is the space inside.')] };
    }
    if (d === 1) {
      const b = R.pick([2, 3, 4, 5]), w = R.i(1, 5), r = R.i(1, b - 1), n = R.i(2, 9), P = n * (w * b + r);
      if (gcd(r, b) > 1) return null;
      return { text: 'A garden is ' + mixed(w, r, b) + ' ' + U[0] + ' long and ' + B(n + ' ' + U[0]) + ' wide. What is its area? Type a mixed number, a fraction or a whole number.', ans: F(P, b), unit: U[1],
        vis: splitRectSVG(n, w, Math.max(0.45, r / b), { l1: w, l2: r + '/' + b, lh: n, big: true }),
        how: ['Area = ' + mixed(w, r, b) + ' × ' + n + '. Split the long side into ' + w + ' and ' + frac(r, b) + ' (the dashed line).', 'Big part: ' + w + ' × ' + n + ' = ' + w * n + '. Small part: ' + frac(r, b) + ' × ' + n + ' = ' + frac(r * n, b) + (r * n >= b ? ' = ' + mx(r * n, b) : '') + '.', 'Area = ' + w * n + ' + ' + mx(r * n, b) + ' = ' + B(endFrac(P, b)) + ' ' + U[1] + '.'],
        steps: [st('Big part: ' + B(w + ' × ' + n) + ' = ?', w * n), sf('Small part: ' + frac(r, b) + ' × ' + n + ' = ?', r * n, b), sf('Area = ?', P, b)],
        traps: [tr(F(w * n * b + r, b), 'x_distribute', 'Multiply the ' + frac(r, b) + ' by ' + n + ' too.'), tr(F(2 * (w * b + r) + 2 * n * b, b), 'g_perim', 'That is the perimeter. Area is length × width.'), tr(F(w * n * b + r * b, b * b), 'f_xwhole', 'A whole number times a fraction: multiply the top only.')] };
    }
    const b = R.pick([2, 3, 4]), e = R.pick([2, 3, 4]), w1 = R.i(1, 4), w2 = R.i(1, 3), r1 = R.i(1, b - 1), r2 = R.i(1, e - 1);
    if (gcd(r1, b) > 1 || gcd(r2, e) > 1) return null;
    const n1 = w1 * b + r1, n2 = w2 * e + r2, P = n1 * n2, Q = b * e;
    return { text: 'A rug is ' + mixed(w1, r1, b) + ' ' + U[0] + ' long and ' + mixed(w2, r2, e) + ' ' + U[0] + ' wide. What is its area? Type a mixed number or a fraction.', ans: F(P, Q), unit: U[1],
      how: ['Area = ' + mixed(w1, r1, b) + ' × ' + mixed(w2, r2, e) + '. Change to fractions: ' + frac(n1, b) + ' × ' + frac(n2, e) + '.', 'Tops: ' + n1 + ' × ' + n2 + ' = ' + P + '. Bottoms: ' + b + ' × ' + e + ' = ' + Q + '.', 'Area = ' + frac(P, Q) + ' = ' + B(endFrac(P, Q)) + ' ' + U[1] + '.'],
      steps: [sf(mixed(w1, r1, b) + ' as a fraction: ?', n1, b), sf(mixed(w2, r2, e) + ' as a fraction: ?', n2, e), st('Tops: ' + B(n1 + ' × ' + n2) + ' = ?', P), sf('Area = ?', P, Q)],
      traps: [tr(F(w1 * w2 * Q + r1 * r2, Q), 'x_distribute', 'Multiplying only wholes × wholes and parts × parts misses two pieces. Change to fractions first.'), tr(F(n1 * e + n2 * b, Q), 'g_area', 'Area multiplies the sides; it does not add them.')] };
  } },

{ id: 'd_lineplot5', s: 'data', g: 5, title: 'Line plots: share it out', pre: ['f_addunlike', 'f_fracdiv'], paper: true, cc: ['5.MD.B.2'],
  tip: 'Change every amount to the same bottom (eighths), add up each column (count × amount), then add the columns. To share it out equally, divide the total by how many there are.',
  gen(d, R) {
    let used, cnt, S, N, tries = 0;
    do {
      used = R.shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, d === 0 ? 3 : 4).sort((x, y) => x - y); cnt = {}; used.forEach(v => { cnt[v] = R.i(1, d === 0 ? 3 : 4); });
      S = sum(used.map(v => v * cnt[v])); N = sum(used.map(v => cnt[v])); tries++;
    } while (d === 2 && S % N !== 0 && tries < 200);
    if (d === 2 && S % N !== 0) return null;
    const vis = linePlotSVG(0, 8, 1, cnt, 'liters in each beaker'), intro = 'The line plot shows how much liquid is in each of some beakers. ';
    const conv = used.filter(v => reduce(v, 8)[1] !== 8).map(v => fm(v, 8) + ' = ' + frac(v, 8)), convL = conv.length ? 'Change to eighths: ' + conv.join(', ') + '. ' : '';
    const colsL = 'Columns: ' + used.map(v => cnt[v] + ' × ' + frac(v, 8) + ' = ' + frac(cnt[v] * v, 8)).join(', ') + '.';
    const totL = 'Total: ' + used.map(v => frac(cnt[v] * v, 8)).join(' + ') + ' = ' + frac(S, 8) + (S >= 8 || gcd(S, 8) > 1 ? ' = ' + fm(S, 8) : '') + ' L.';
    if (d === 0 || (d === 1 && R.chance(0.5))) return { text: intro + 'How much liquid is there in all the beakers together? Type a mixed number or a fraction.', ans: F(S, 8), unit: 'liters', vis,
      how: [convL + colsL, totL, 'There are ' + B(fm(S, 8)) + ' liters in all.'],
      steps: used.slice(0, 2).map(v => sf('Column ' + fm(v, 8) + ': ' + cnt[v] + ' × ' + fm(v, 8) + ' = ?', cnt[v] * v, 8)).concat([sf('Total of all the columns: ?', S, 8)]),
      traps: [tr(F(sum(used), 8), 'd_lineplot', 'Each X is one beaker. Count every X, not just one per column.'), tr(F(S, 8 * used.length), 'f_addunlike', 'Keep the bottom when you add: add only the tops.'), tr(N, 'd_lineplot', 'That counts the beakers. The question asks how much liquid.')] };
    if (d === 1) {
      const hi = used[used.length - 1], lo = used[0], X1 = cnt[hi] * hi, X2 = cnt[lo] * lo; if (X1 === X2) return null;
      const [big, small, XB, XS] = X1 > X2 ? [hi, lo, X1, X2] : [lo, hi, X2, X1];
      return { text: intro + 'Add up all the ' + B(fm(big, 8) + ' L') + ' beakers. Add up all the ' + B(fm(small, 8) + ' L') + ' beakers. How much more liquid is in the ' + B(fm(big, 8) + ' L') + ' beakers? Type a fraction or a mixed number.', ans: F(XB - XS, 8), unit: 'liters', vis,
        how: ['The ' + fm(big, 8) + ' L beakers: ' + cnt[big] + ' × ' + frac(big, 8) + ' = ' + frac(XB, 8) + '.', 'The ' + fm(small, 8) + ' L beakers: ' + cnt[small] + ' × ' + frac(small, 8) + ' = ' + frac(XS, 8) + '.', frac(XB, 8) + ' ' + MINUS + ' ' + frac(XS, 8) + ' = ' + frac(XB - XS, 8) + (XB - XS >= 8 || gcd(XB - XS, 8) > 1 ? ' = ' + fm(XB - XS, 8) : '') + '. That is ' + B(fm(XB - XS, 8)) + ' L more.'],
        steps: [sf(cnt[big] + ' × ' + fm(big, 8) + ' = ?', XB, 8), sf(cnt[small] + ' × ' + fm(small, 8) + ' = ?', XS, 8), sf('Difference: ?', XB - XS, 8)],
        traps: [tr(F(Math.abs(big - small), 8), 'd_lineplot', 'Use all the beakers in each column: count × amount.'), tr(F(XB + XS, 8), 's_compare', 'How much more asks for the difference.')] };
    }
    const each = S / N;
    return { text: intro + 'All the liquid is poured together and then shared out ' + B('equally') + ' among the same beakers. How much liquid will each beaker hold? Type a fraction.', ans: F(each, 8), unit: 'liters', vis,
      how: [convL + colsL, totL, 'There are ' + N + ' beakers: ' + S + ' eighths shared by ' + N + ' is ' + S + ' ÷ ' + N + ' = ' + each + ' eighths each, so ' + frac(S, 8) + ' ÷ ' + N + ' = ' + frac(each, 8) + (gcd(each, 8) > 1 ? ' = ' + fm(each, 8) : '') + '. Each holds ' + B(fm(each, 8)) + ' L.'],
      steps: [sf('Total liquid: ?', S, 8), st('How many beakers are there?', N), sf(frac(S, 8) + ' ÷ ' + N + ' = ?', each, 8)],
      traps: [tr(F(S, 8), 'd_lineplot5', 'That is all the liquid. Share it among the ' + N + ' beakers.'), tr(F(S, 8 * used.length), 'd_lineplot5', 'Share among all ' + N + ' beakers (count the Xs), not the ' + used.length + ' columns.'), tr(F(8 * N, S), 'f_fracdiv', 'The amount shared goes on top: total ÷ ' + N + '.')] };
  } },

{ id: 'g_cubes', s: 'meas', g: 5, title: 'Count the cubes', pre: ['m_groups'], cc: ['5.MD.C.4', '5.MD.C.5a'],
  tip: 'Count one layer (rows × cubes in a row), then count the layers. Cubes hidden at the back still count: each layer is full. 4 × 3 in a layer, 2 layers: 24 cubes.',
  gen(d, R) {
    const box = (l, w, h) => { const c = []; for (let k = 0; k < h; k++) for (let j = 0; j < w; j++) for (let i = 0; i < l; i++) c.push([i, j, k]); return c; };
    if (d < 2) {
      const l = d === 0 ? R.i(2, 3) : R.i(3, 5), w = d === 0 ? R.i(2, 3) : R.i(2, 4), h = d === 0 ? R.i(2, 3) : R.i(2, 4), L = l * w, V = L * h, vis = V - (l - 1) * (w - 1) * (h - 1);
      return { text: 'The box is packed with unit cubes, with no gaps. Some cubes are hidden. How many cubes are there in all?', ans: V, unit: 'cubes', vis: cubesSVG(box(l, w, h)),
        how: ['Count the top layer: ' + l + ' cubes along the front left edge and ' + w + ' along the front right edge, so ' + l + ' × ' + w + ' = ' + L + ' cubes in each layer.', 'Count the layers going up: ' + h + '. Every layer is full, even the hidden parts.', h + ' layers × ' + L + ' = ' + B(V) + ' cubes. (That is ' + l + ' × ' + w + ' × ' + h + '.)'],
        steps: [st('How many cubes are in one layer? ' + B(l + ' × ' + w) + ' = ?', L), st('How many layers are there?', h), st(B(h + ' × ' + L) + ' = ?', V)],
        traps: [tr(vis, 'g_cubes', 'That counts only the cubes you can see. Hidden cubes fill the inside and the back.'), tr(L, 'g_cubes', 'That is one layer. Count the layers too.'), tr(l + w + h, 'g_volume', 'Multiply the edges: cubes in a layer times the layers.')] };
    }
    const l = R.i(3, 5), w = R.i(2, 4), h = R.i(2, 4), L = l * w, k = R.i(2, L - 2), full = L * (h - 1), V = full + k, more = R.chance(0.4);
    const cells = box(l, w, h - 1); let left = k; for (let j = 0; j < w && left; j++) for (let i = 0; i < l && left; i++) { cells.push([i, j, h - 1]); left--; }
    if (more) return { text: 'A box is ' + B(l + ' cubes') + ' long, ' + B(w + ' cubes') + ' wide and ' + B(h + ' cubes') + ' tall. Every layer is full except the top one, shown in the picture. How many more cubes are needed to fill the box?', ans: L - k, unit: 'cubes', vis: cubesSVG(cells),
      how: ['A full layer has ' + l + ' × ' + w + ' = ' + L + ' cubes.', 'The top layer has ' + k + ' cubes, so it needs ' + mi(L, k) + ' = ' + B(L - k) + ' more.'],
      steps: [st('Cubes in a full layer: ' + B(l + ' × ' + w) + ' = ?', L), st('Cubes already in the top layer?', k), st(B(mi(L, k)) + ' = ?', L - k)],
      traps: [tr(L * h - V + L, 'g_cubes', 'Only the top layer has gaps. The layers below are full.'), tr(V, 'g_cubes', 'That is how many cubes are in the box now. How many more fill it?'), tr(L * h, 'g_cubes', 'That is a full box. Take away the cubes already there.')] };
    return { text: 'Every layer under the top one is full, but the top layer is not finished. How many cubes are there in all?', ans: V, unit: 'cubes', vis: cubesSVG(cells),
      how: ['A full layer has ' + l + ' × ' + w + ' = ' + L + ' cubes.', 'There ' + (h - 1 === 1 ? 'is 1 full layer' : 'are ' + (h - 1) + ' full layers') + ' under the top: ' + (h - 1) + ' × ' + L + ' = ' + full + '.', 'Top layer: ' + k + ' cubes. In all: ' + pl(full, k) + ' = ' + B(V) + ' cubes.'],
      steps: [st('Cubes in a full layer: ' + B(l + ' × ' + w) + ' = ?', L), st('Full layers: ' + B((h - 1) + ' × ' + L) + ' = ?', full), st('Add the top layer: ' + B(pl(full, k)) + ' = ?', V)],
      traps: [tr(L * h, 'g_cubes', 'The top layer is not full. Count only its ' + k + ' cubes.'), tr(full, 'g_cubes', 'Add the cubes in the top layer too.'), tr(V - (l - 1) * (w - 1) * (h - 2 > 0 ? h - 2 : 0), 'g_cubes', 'Hidden cubes in the full layers count too.')] };
  } },

{ id: 'g_twoboxes', s: 'meas', g: 5, title: 'Two boxes stuck together', pre: [], paper: true, cc: ['5.MD.C.5c'],
  tip: 'Split the solid into two boxes. Find each volume (length × width × height), then add. Missing edge? Use the whole length or height: take away the part you know.',
  gen(d, R) {
    const W = R.i(2, d === 0 ? 4 : 6), L1 = R.i(2, d === 0 ? 5 : 8), L2 = R.i(2, d === 0 ? 5 : 8), H1 = R.i(4, d === 0 ? 7 : 10), H2 = R.i(2, H1 - 2), T = L1 + L2, Dp = H1 - H2;
    const V1 = L1 * W * H1, V2 = L2 * W * H2, V = V1 + V2, a = Math.min(24, 230 / (T + W));
    const labs = [{ p: [L1 / 2, W, 0], t: L1, dx: -8, dy: 22 }, { p: [T, W / 2, 0], t: W, dx: 12, dy: 18, anc: 'start' }, { p: [0, W, H1 / 2], t: H1, dx: -10, anc: 'end' }];
    if (d === 0) labs.push({ p: [L1 + L2 / 2, W, 0], t: L2, dx: -8, dy: 22 }, { p: [T, 0, H2 / 2], t: H2, dx: 10, anc: 'start' });
    else if (d === 1) labs.push({ p: [L1 + L2 / 2, W, 0], t: '?', dx: -8, dy: 22 }, { p: [T, 0, H2 / 2], t: H2, dx: 10, anc: 'start' });
    else labs.push({ p: [L1 + L2 / 2, W, 0], t: '?', dx: -8, dy: 22 }, { p: [L1, 0, (H1 + H2) / 2], t: Dp, dx: 10, anc: 'start' });
    const vis = solidSVG([{ i0: 0, j0: 0, k0: 0, l: L1, w: W, h: H1 }, { i0: L1, j0: 0, k0: 0, l: L2, w: W, h: H2 }], a, labs);
    const extra = d === 0 ? '' : d === 1 ? ' The whole solid is ' + B(T + ' cm') + ' long.' : ' The whole solid is ' + B(T + ' cm') + ' long. The short box is ' + B(Dp + ' cm') + ' lower than the tall box.';
    const how = [];
    if (d === 1) how.push('Right box length: ' + mi(T, L1) + ' = ' + L2 + ' cm.');
    if (d === 2) how.push('Right box: length ' + mi(T, L1) + ' = ' + L2 + ' cm, height ' + mi(H1, Dp) + ' = ' + H2 + ' cm.');
    how.push('Left box: ' + L1 + ' × ' + W + ' × ' + H1 + ' = ' + V1 + ' cubic cm.', 'Right box: ' + L2 + ' × ' + W + ' × ' + H2 + ' = ' + V2 + ' cubic cm.', 'Total: ' + pl(V1, V2) + ' = ' + B(nm(V)) + ' cubic cm.');
    const steps = (d === 1 ? [st('Right box length: ' + B(mi(T, L1)) + ' = ?', L2)] : d === 2 ? [st('Right box length: ' + B(mi(T, L1)) + ' = ?', L2), st('Right box height: ' + B(mi(H1, Dp)) + ' = ?', H2)] : []).concat([st('Left box: ' + B(L1 + ' × ' + W + ' × ' + H1) + ' = ?', V1), st('Right box: ' + B(L2 + ' × ' + W + ' × ' + H2) + ' = ?', V2), st(B(pl(V1, V2)) + ' = ?', V)]).slice(-4);
    return { text: 'The solid is made of two boxes. All lengths are in cm.' + extra + ' What is its volume?', ans: V, unit: 'cubic cm', vis, how,
      steps,
      traps: [tr(V1, 'g_twoboxes', 'That is only the tall box. Add the short box too.'), tr(T * W * H1, 'g_twoboxes', 'The solid is not one big box: the right part is shorter. Find each box, then add.'), d === 2 ? tr(L1 * W * H1 + L2 * W * Dp, 'g_twoboxes', 'The short box\'s height is ' + H1 + ' ' + MINUS + ' ' + Dp + ', not ' + Dp + '.') : tr(d === 1 ? L1 * W * H1 + T * W * H2 : L1 * W * H1 + L2 * W * H1, 'g_twoboxes', d === 1 ? 'The right box is only ' + T + ' ' + MINUS + ' ' + L1 + ' long.' : 'The right box has its own height: ' + H2 + '.'), tr(L1 + W + H1 + L2 + H2, 'g_volume', 'Volume multiplies the edges of each box.')] };
  } }

]);
})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
