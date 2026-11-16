/* Math Worlds core: shared helpers, pictures, the concept registry and answer checking.
   Concept files (src/concepts/*.js) call MWC.defs([...]). Each concept is one idea or shortcut, from 2nd to 12th grade.
   gen(d,R) makes a problem at difficulty d (0 easy, 1 medium, 2 hard). Every answer is typed.
   Pure functions with no page access, so node can test every concept. */
(function (root) {
'use strict';
function makeR(seed) {
  let s = (seed == null ? 0 : seed) >>> 0;
  const f = seed == null ? Math.random : () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  return { f, i: (a, b) => a + Math.floor(f() * (b - a + 1)), pick: a => a[Math.floor(f() * a.length)], chance: p => f() < p,
    shuffle: a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; } };
}
const n = v => Number(v).toLocaleString('en-US');
const B = v => '<b>' + v + '</b>';
const pad2 = v => String(v).padStart(2, '0');
const fmtT = (h, m) => h + ':' + pad2(m);
const fmtM = c => c < 100 ? c + '¢' : '$' + (c / 100).toFixed(2);
const fmtD = c => '$' + (c / 100).toFixed(2);
const plural = (k, one, many) => k === 1 ? one : (many || one + 's');
const sum = a => a.reduce((x, y) => x + y, 0);
const MINUS = '−';

/* ---------- pictures (SVG strings; colours come from the world's CSS variables) ---------- */
function seqHTML(arr) { return '<div class="seq">' + arr.map(v => v == null ? '<span class="sq q">?</span>' : '<span class="sq">' + n(v) + '</span>').join('') + '</div>'; }
function hopsSVG(start, hops, o) {
  o = o || {}; const f = o.fmt || n, lab = o.lab || (v => n(v));
  const vals = [start]; hops.forEach(h => vals.push(vals[vals.length - 1] + h));
  const uniq = [...new Set(vals)].sort((a, b) => a - b), xs = {};
  let x = 36; uniq.forEach((v, i) => { if (i) x += Math.max(o.minGap || 60, Math.min(150, 34 + 24 * Math.sqrt(Math.abs(v - uniq[i - 1])))); xs[v] = x; });
  const W = x + 36, base = 80, end = vals[vals.length - 1];
  let s = '<svg class="hops" viewBox="0 0 ' + W + ' 108" style="max-width:' + W + 'px" aria-hidden="true"><line x1="8" y1="' + base + '" x2="' + (W - 8) + '" y2="' + base + '" class="hp-line"/>';
  uniq.forEach(v => { s += '<line x1="' + xs[v] + '" y1="' + (base - 7) + '" x2="' + xs[v] + '" y2="' + (base + 7) + '" class="hp-tick"/><text x="' + xs[v] + '" y="' + (base + 24) + '" class="hp-num' + (v === end ? ' end' : v === start ? ' start' : '') + '">' + f(v) + '</text>'; });
  hops.forEach((h, i) => {
    const a = xs[vals[i]], b = xs[vals[i + 1]], hg = 20 + 11 * (i % 3), mx = (a + b) / 2, y0 = base - 5, cy = y0 - 2 * hg;
    const ang = Math.atan2(y0 - cy, b - mx), ax = b - 9 * Math.cos(ang - .45), ay = y0 - 9 * Math.sin(ang - .45), bx = b - 9 * Math.cos(ang + .45), by = y0 - 9 * Math.sin(ang + .45);
    s += '<path d="M' + a + ' ' + y0 + ' Q' + mx + ' ' + cy + ' ' + b + ' ' + y0 + '" class="hp-arc ' + (h < 0 ? 'neg' : 'pos') + '"/><path d="M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + ' L' + b + ' ' + y0 + ' L' + bx.toFixed(1) + ' ' + by.toFixed(1) + '" class="hp-head ' + (h < 0 ? 'neg' : 'pos') + '"/>';
    s += '<text x="' + mx + '" y="' + (y0 - hg - 7) + '" class="hp-lab ' + (h < 0 ? 'neg' : 'pos') + '">' + (h < 0 ? MINUS : '+') + lab(Math.abs(h)) + '</text>';
  });
  return s + '</svg>';
}
function tenFrame(a, b) {
  b = b || 0; let s = '<svg class="tenframe" viewBox="0 0 182 76" aria-hidden="true">';
  for (let i = 0; i < 10; i++) { const x = 4 + (i % 5) * 35, y = 4 + Math.floor(i / 5) * 35; s += '<rect x="' + x + '" y="' + y + '" width="34" height="34" rx="4" class="tf-cell"/>'; if (i < a + b) s += '<circle cx="' + (x + 17) + '" cy="' + (y + 17) + '" r="12" class="' + (i < a ? 'tf-a' : 'tf-b') + '"/>'; }
  return s + '</svg>';
}
function dotsSVG(r, c) {
  const g = 26, W = c * g + 8, H = r * g + 8; let s = '<svg class="dots" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + Math.min(W * 1.4, 320) + 'px" aria-hidden="true">';
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) s += '<circle cx="' + (4 + g / 2 + j * g) + '" cy="' + (4 + g / 2 + i * g) + '" r="9" class="dt"/>';
  return s + '</svg>';
}
function rowDots(k) { const per = Math.min(k, 10), rows = Math.ceil(k / per); let s = '<svg class="dots" viewBox="0 0 ' + (per * 26 + 8) + ' ' + (rows * 26 + 8) + '" style="max-width:' + Math.min((per * 26 + 8) * 1.3, 360) + 'px" aria-hidden="true">'; for (let i = 0; i < k; i++) s += '<circle cx="' + (17 + (i % per) * 26) + '" cy="' + (17 + Math.floor(i / per) * 26) + '" r="9" class="dt"/>'; return s + '</svg>'; }
function groupsSVG(g, e, left) {
  left = left || 0; const cols = Math.ceil(Math.sqrt(e)), rws = Math.ceil(e / cols), R = Math.max(cols, rws) * 9 + 10, gap = 2 * R + 10;
  const W = g * gap + (left ? left * 22 + 14 : 0) + 6, H = 2 * R + 8; let s = '<svg class="groups" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + Math.min(W * 1.2, 420) + 'px" aria-hidden="true">';
  for (let i = 0; i < g; i++) {
    const cx = 4 + R + i * gap, cy = 4 + R; s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" class="gp-ring"/>';
    for (let k = 0; k < e; k++) { const x = cx - (cols - 1) * 9 + (k % cols) * 18, y = cy - (rws - 1) * 9 + Math.floor(k / cols) * 18; s += '<circle cx="' + x + '" cy="' + y + '" r="6.5" class="dt"/>'; }
  }
  for (let k = 0; k < left; k++) s += '<circle cx="' + (g * gap + 14 + k * 22) + '" cy="' + (4 + R) + '" r="7.5" class="dt left"/>';
  return s + '</svg>';
}
function blocksSVG(h, t, o) {
  let s = '', x = 4; const H = 112;
  for (let i = 0; i < h; i++) { s += '<rect x="' + x + '" y="6" width="100" height="100" class="bk-h"/>'; for (let j = 1; j < 10; j++) s += '<line x1="' + (x + j * 10) + '" y1="6" x2="' + (x + j * 10) + '" y2="106" class="bk-l"/><line x1="' + x + '" y1="' + (6 + j * 10) + '" x2="' + (x + 100) + '" y2="' + (6 + j * 10) + '" class="bk-l"/>'; x += 108; }
  for (let i = 0; i < t; i++) { s += '<rect x="' + x + '" y="6" width="10" height="100" class="bk-t"/>'; for (let j = 1; j < 10; j++) s += '<line x1="' + x + '" y1="' + (6 + j * 10) + '" x2="' + (x + 10) + '" y2="' + (6 + j * 10) + '" class="bk-l"/>'; x += 14; }
  if (t) x += 6;
  for (let i = 0; i < o; i++) { s += '<rect x="' + (x + (i % 3) * 14) + '" y="' + (96 - Math.floor(i / 3) * 14) + '" width="10" height="10" class="bk-o"/>'; }
  const W = x + (o ? 46 : 4);
  return '<svg class="blocks" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + Math.min(W * 1.5, 440) + 'px" aria-hidden="true">' + s + '</svg>';
}
function chartSVG(start, target) {
  const r0 = Math.min(Math.floor((start - 1) / 10), Math.floor((target - 1) / 10)), r1 = Math.max(Math.floor((start - 1) / 10), Math.floor((target - 1) / 10));
  const rows = r1 - r0 + 1, c = 30; let s = '<svg class="chart" viewBox="0 0 ' + (10 * c + 4) + ' ' + (rows * c + 4) + '" aria-hidden="true">';
  for (let r = 0; r < rows; r++) for (let k = 0; k < 10; k++) {
    const v = (r0 + r) * 10 + k + 1, x = 2 + k * c, y = 2 + r * c, cls = v === start ? 'ch-start' : v === target ? 'ch-q' : 'ch-cell';
    s += '<rect x="' + x + '" y="' + y + '" width="' + c + '" height="' + c + '" class="' + cls + '"/>';
    if (v === start || v === target) s += '<text x="' + (x + c / 2) + '" y="' + (y + c / 2 + 5) + '" class="ch-t">' + (v === start ? v : '?') + '</text>';
  }
  return s + '</svg>';
}
function roundLine(lo, hi, v, step) {
  const W = 320, x = t => 20 + (t - lo) / (hi - lo) * (W - 40); let s = '<svg class="rline" viewBox="0 0 ' + W + ' 74" aria-hidden="true"><line x1="14" y1="40" x2="' + (W - 14) + '" y2="40" class="hp-line"/>';
  for (let t = lo; t <= hi; t += step) { const big = t === lo || t === hi, mid = t === (lo + hi) / 2; s += '<line x1="' + x(t) + '" y1="' + (big ? 30 : mid ? 32 : 35) + '" x2="' + x(t) + '" y2="' + (big ? 50 : mid ? 48 : 45) + '" class="hp-tick"/>'; if (big || mid) s += '<text x="' + x(t) + '" y="66" class="hp-num' + (mid ? ' mid' : '') + '">' + n(t) + '</text>'; }
  s += '<circle cx="' + x(v) + '" cy="40" r="7" class="rl-pt"/><text x="' + x(v) + '" y="22" class="hp-lab pos">' + n(v) + '</text>';
  return s + '</svg>';
}
function ioTable(rows, ask, reverse) {
  return '<table class="io"><tr><th>In</th>' + rows.map(r => '<td>' + n(r[0]) + '</td>').join('') + '<td class="q">' + (reverse ? '?' : n(ask[0])) + '</td></tr><tr><th>Out</th>' + rows.map(r => '<td>' + n(r[1]) + '</td>').join('') + '<td class="q">' + (reverse ? n(ask[1]) : '?') + '</td></tr></table>';
}
/* the clock: numbers, minute marks, a short hour hand and a long minute hand */
function clockSVG(h, m, o) {
  o = o || {}; const PI = Math.PI, pad = o.fives ? 18 : 0; let s = '<svg class="clock' + (o.cls ? ' ' + o.cls : '') + '" viewBox="' + (-pad) + ' ' + (-pad) + ' ' + (200 + 2 * pad) + ' ' + (200 + 2 * pad) + '" aria-hidden="true">';
  s += '<circle cx="100" cy="100" r="97" class="ck-rim"/><circle cx="100" cy="100" r="89" class="ck-face"/>';
  for (let i = 0; i < 60; i++) { const a = i * PI / 30, big = i % 5 === 0, r1 = big ? 76 : 81; s += '<line x1="' + (100 + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (100 - r1 * Math.cos(a)).toFixed(1) + '" x2="' + (100 + 86 * Math.sin(a)).toFixed(1) + '" y2="' + (100 - 86 * Math.cos(a)).toFixed(1) + '" class="' + (big ? 'ck-t5' : 'ck-t') + '"/>'; }
  for (let k = 1; k <= 12; k++) { const a = k * PI / 6; s += '<text x="' + (100 + 63 * Math.sin(a)).toFixed(1) + '" y="' + (100 - 63 * Math.cos(a) + 7).toFixed(1) + '" class="ck-num">' + k + '</text>'; }
  if (o.fives) for (let k = 0; k < 12; k++) { const a = k * PI / 6; s += '<text x="' + (100 + 105 * Math.sin(a)).toFixed(1) + '" y="' + (100 - 105 * Math.cos(a) + 4).toFixed(1) + '" class="ck-five">' + pad2(k * 5) + '</text>'; }
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  s += '<g class="ck-hand ck-h" data-hand="h" transform="rotate(' + ha.toFixed(2) + ' 100 100)"><line x1="100" y1="112" x2="100" y2="54" class="ck-hl"/>' + (o.drag ? '<line x1="100" y1="100" x2="100" y2="50" class="ck-hit"/>' : '') + '</g>';
  s += '<g class="ck-hand ck-m" data-hand="m" transform="rotate(' + ma.toFixed(2) + ' 100 100)"><line x1="100" y1="114" x2="100" y2="24" class="ck-ml"/>' + (o.drag ? '<line x1="100" y1="100" x2="100" y2="18" class="ck-hit"/>' : '') + '</g>';
  return s + '<circle cx="100" cy="100" r="6" class="ck-dot"/></svg>';
}
const COIN = {
  p: { v: 1, name: 'penny', many: 'pennies', r: 19, cls: 'cn-p', t: ['ONE', 'CENT'] },
  n: { v: 5, name: 'nickel', many: 'nickels', r: 21.2, cls: 'cn-s', t: ['FIVE', 'CENTS'] },
  d: { v: 10, name: 'dime', many: 'dimes', r: 17.9, cls: 'cn-s', t: ['ONE', 'DIME'] },
  q: { v: 25, name: 'quarter', many: 'quarters', r: 24.3, cls: 'cn-s', t: ['QUARTER', 'DOLLAR'] },
  b1: { v: 100, name: 'dollar bill', many: 'dollar bills', bill: '1', t: ['ONE', 'DOLLAR'] },
  b5: { v: 500, name: 'five-dollar bill', many: 'five-dollar bills', bill: '5', t: ['FIVE', 'DOLLARS'] }
};
const COIN_ORDER = ['b5', 'b1', 'q', 'd', 'n', 'p'];
function coinSVG(id, big) {
  const c = COIN[id], k = big ? 2.6 : 1.7;
  if (c.bill) { const w = big ? 190 : 116, h = w * .46; return '<svg class="coin bill" viewBox="0 0 120 55" width="' + w + '" height="' + h.toFixed(0) + '" aria-label="' + c.name + '"><rect x="1" y="1" width="118" height="53" rx="4" class="bl-bg"/><rect x="6" y="6" width="108" height="43" rx="3" class="bl-in"/><ellipse cx="60" cy="27.5" rx="15" ry="17" class="bl-ov"/><text x="14" y="19" class="bl-n">' + c.bill + '</text><text x="106" y="47" class="bl-n">' + c.bill + '</text><text x="60" y="25" class="bl-t">' + c.t[0] + '</text><text x="60" y="34" class="bl-t">' + c.t[1] + '</text></svg>'; }
  const r = c.r, d = (2 * r + 2) * k, fs = c.t[0].length > 5 ? 4.6 : 6;
  return '<svg class="coin" viewBox="' + (-r - 1) + ' ' + (-r - 1) + ' ' + (2 * r + 2) + ' ' + (2 * r + 2) + '" width="' + d.toFixed(0) + '" height="' + d.toFixed(0) + '" aria-label="' + c.name + '"><circle r="' + r + '" class="' + c.cls + '"/><circle r="' + (r - 2.4) + '" class="cn-ring"/><text y="-1" class="cn-t" style="font-size:' + fs + 'px">' + c.t[0] + '</text><text y="' + (fs + 1) + '" class="cn-t" style="font-size:' + Math.min(fs, 5.4) + 'px">' + c.t[1] + '</text></svg>';
}
function coinsRow(list) { return '<div class="coins">' + list.map(id => coinSVG(id)).join('') + '</div>'; }
function greedy(c, allowed) { const out = []; for (const id of COIN_ORDER) { if (allowed && !allowed.includes(id)) continue; while (c >= COIN[id].v) { out.push(id); c -= COIN[id].v; } } return out; }
function coinNames(list) { const cnt = {}; list.forEach(id => cnt[id] = (cnt[id] || 0) + 1); return COIN_ORDER.filter(id => cnt[id]).map(id => cnt[id] + ' ' + plural(cnt[id], COIN[id].name, COIN[id].many)).join(', '); }
function countOn(list) { const sorted = list.slice().sort((a, b) => COIN[b].v - COIN[a].v); let t = 0; return sorted.map(id => fmtM(t += COIN[id].v)).join(', '); }
const ITEMS = [['✏️', 'pencil'], ['🍎', 'apple'], ['🧃', 'juice box'], ['📒', 'notebook'], ['🚗', 'toy car'], ['⭐', 'sticker'], ['🎈', 'balloon'], ['🍪', 'cookie'], ['📚', 'book'], ['🧸', 'teddy bear'], ['🖍️', 'box of crayons'], ['🍦', 'ice cream'], ['🪀', 'yo-yo'], ['🧩', 'puzzle']];
function tagsHTML(items) { return '<div class="tags">' + items.map(it => '<div class="tag"><span class="tag-ic">' + it[0] + '</span><span class="tag-n">' + it[1] + '</span><b>' + fmtM(it[2]) + '</b></div>').join('') + '</div>'; }
/* ---------- helpers for the shortcut write-ups ---------- */
const par = v => v % 2 ? 'odd' : 'even';
const T = { min: (h, m) => (h % 12) * 60 + m,
  add(h, m, k) { let t = ((h % 12) * 60 + m + k) % 720; if (t < 0) t += 720; return { h: Math.floor(t / 60) || 12, m: t % 60 }; },
  fmtMin(t) { const h = Math.floor(t / 60) % 12 || 12, m = ((t % 60) + 60) % 60; return fmtT(h, m); },
  words(k) { const h = Math.floor(k / 60), m = k % 60; return (h ? h + ' ' + plural(h, 'hour') : '') + (h && m ? ' ' : '') + (m ? m + ' ' + plural(m, 'minute') : ''); },
  dur(k) { return k >= 60 ? (k % 60 ? Math.floor(k / 60) + ' h ' + (k % 60) + ' min' : (k / 60) + ' h') : k + ' min'; } };
const minHops = (s, hops) => hopsSVG(s, hops, { fmt: T.fmtMin, lab: T.dur, minGap: 66 });
/* compensation: add or take away a number close to a friendly one */
function compHow(a, b, op) {
  const T0 = b < 30 ? Math.round(b / 10) * 10 : Math.round(b / 100) * 100 || Math.round(b / 10) * 10;
  const F = Math.abs(b - T0) <= 2 ? T0 : Math.round(b / 10) * 10, k = F - b, add = op === '+';
  const r1 = add ? a + F : a - F, res = add ? a + b : a - b;
  if (k > 0) return { steps: [(add ? 'Adding ' : 'Taking away ') + b + '? ' + (add ? 'Add ' : 'Take away ') + F + ' instead: ' + n(a) + ' ' + (add ? '+' : MINUS) + ' ' + F + ' = ' + n(r1) + '.', (add ? 'You added ' + k + ' too many, so take ' + k + ' back: ' : 'You took away ' + k + ' too many, so give ' + k + ' back: ') + n(r1) + ' ' + (add ? MINUS : '+') + ' ' + k + ' = ' + B(n(res)) + '.'], vis: hopsSVG(a, add ? [F, -k] : [-F, k]) };
  return { steps: [(add ? 'Add ' : 'Take away ') + F + ' first: ' + n(a) + ' ' + (add ? '+' : MINUS) + ' ' + F + ' = ' + n(r1) + '.', 'Then ' + (add ? 'add ' : 'take away ') + (-k) + ' more: ' + n(r1) + ' ' + (add ? '+' : MINUS) + ' ' + (-k) + ' = ' + B(n(res)) + '.'], vis: hopsSVG(a, add ? [F, -k] : [-F, k]) };
}
function mulHow(a, b, force) {
  if (!force && ((a === 7 && b === 8) || (a === 8 && b === 7))) return ['Remember 5, 6, 7, 8: ' + B(56) + ' = 7 × 8.', 'Check with doubles: 7 → 14 → 28 → 56.'];
  const ord = [0, 1, 10, 2, 5, 11, 4, 9, 3, 8, 6, 12, 7], rank = v => { const i = ord.indexOf(v); return i < 0 ? 99 : i; };
  const t = force && (a === force || b === force) ? force : rank(a) <= rank(b) ? a : b, o = t === a ? b : a, p = a * b;
  switch (t) {
    case 0: return ['Anything times 0 is 0. Zero groups means nothing at all.', a + ' × ' + b + ' = ' + B(0) + '.'];
    case 1: return ['Times 1 keeps the number the same. One group of ' + o + ' is ' + o + '.', a + ' × ' + b + ' = ' + B(p) + '.'];
    case 10: return ['Times 10: put a zero on the end of ' + o + '.', a + ' × ' + b + ' = ' + B(n(p)) + '.'];
    case 2: return ['Times 2 is a double: ' + o + ' + ' + o + '.', o + ' + ' + o + ' = ' + B(p) + '.'];
    case 5: return ['Times 5 is half of times 10. 10 × ' + o + ' = ' + (10 * o) + '.', 'Half of ' + (10 * o) + ' is ' + B(p) + '.'];
    case 11: return o <= 9 ? ['11 times a single digit: write the digit twice.', '11 × ' + o + ' = ' + B(p) + '.'] : ['11 × ' + o + ' is 10 × ' + o + ' plus one more ' + o + '.', (10 * o) + ' + ' + o + ' = ' + B(p) + '.'];
    case 4: return ['Times 4 is double, then double again.', 'Double ' + o + ' is ' + (2 * o) + '. Double ' + (2 * o) + ' is ' + B(p) + '.'];
    case 9: return ['9 is one less than 10. 10 × ' + o + ' = ' + (10 * o) + '.', 'Take away one ' + o + ': ' + (10 * o) + ' ' + MINUS + ' ' + o + ' = ' + B(p) + '.'];
    case 3: return ['Times 3 is a double plus one more group.', 'Double ' + o + ' is ' + (2 * o) + '. ' + (2 * o) + ' + ' + o + ' = ' + B(p) + '.'];
    case 8: return ['Times 8 is double, double, double.', o + ' → ' + (2 * o) + ' → ' + (4 * o) + ' → ' + B(p) + '.'];
    case 6: return ['Times 6 is times 5 plus one more group.', '5 × ' + o + ' = ' + (5 * o) + '. ' + (5 * o) + ' + ' + o + ' = ' + B(p) + '.'];
    case 12: return ['Times 12 is times 10 plus times 2.', (10 * o) + ' + ' + (2 * o) + ' = ' + B(p) + '.'];
    case 7: return ['Split 7 into 5 and 2.', '5 × ' + o + ' = ' + (5 * o) + ' and 2 × ' + o + ' = ' + (2 * o) + '.', (5 * o) + ' + ' + (2 * o) + ' = ' + B(p) + '.'];
  }
  return breakHow(Math.max(a, b), Math.min(a, b));
}
function breakHow(a, b) {
  const parts = []; let r = a; for (const pv of [1000, 100, 10, 1]) { const d = Math.floor(r / pv); if (d) { parts.push(d * pv); r -= d * pv; } }
  if (parts.length > 3) { const ones = parts.pop(); parts[parts.length - 1] += ones; }
  return ['Break ' + n(a) + ' into ' + parts.map(n).join(' + ') + '.', parts.map(x => n(x) + ' × ' + b + ' = ' + n(x * b)).join(', ') + '.', 'Add them: ' + parts.map(x => n(x * b)).join(' + ') + ' = ' + B(n(a * b)) + '.'];
}
function seqProblem(seq, miss, rule, say) {
  const sh = seq.map((v, i) => i === miss ? null : v), ans = seq[miss];
  return { type: 'num', text: 'What number goes in the box?', vis: seqHTML(sh), ans, say: 'What number goes in the box? ' + sh.map(v => v == null ? 'blank' : v).join(', '), key: 'sq' + seq.join(',') + miss, how: rule };
}
function constSeq(seq, miss) {
  let k = 0; while (k === miss || k + 1 === miss) k++;
  const j = seq[k + 1] - seq[k], prev = seq[miss - 1];
  return ['Find the jump: ' + n(seq[k]) + ' → ' + n(seq[k + 1]) + ' is ' + (j < 0 ? MINUS + (-j) : '+' + j) + '. Every jump is the same.', n(prev) + ' ' + (j < 0 ? MINUS + ' ' + (-j) : '+ ' + j) + ' = ' + B(n(seq[miss])) + '.'];
}
function skipGen(steps, d, R, len) {
  const step = R.pick(steps); let start, back = false;
  if (d === 0) start = step * R.i(0, 6);
  else if (d === 1) start = step * R.i(2, 16);
  else { back = R.chance(.5); const off = step >= 10 ? R.i(1, step - 1) : step > 1 ? R.i(1, step - 1) : 0; start = back ? step * R.i(8, 30) + off : step * R.i(4, 24) + off; }
  const seq = []; for (let i = 0; i < (len || 5); i++) seq.push(back ? start - i * step : start + i * step);
  const miss = d === 0 ? seq.length - 1 : R.i(1, seq.length - 1);
  const p = seqProblem(seq, miss, constSeq(seq, miss));
  p.wrong = [p.ans + step, p.ans - step, p.ans + 1, p.ans - 1, p.ans + 10]; return p;
}


/* ---------- more number helpers ---------- */
/* num: a number for display, with commas, a real minus sign and no float noise (0.1+0.2 shows 0.3) */
function num(v) {
  if (typeof v !== 'number' || !isFinite(v)) return String(v);
  const r = +v.toFixed(10), s = Math.abs(r).toLocaleString('en-US', { maximumFractionDigits: 10 });
  return (r < 0 ? MINUS : '') + s;
}
const signed = v => (v < 0 ? MINUS + ' ' + num(-v) : '+ ' + num(v)); /* "+ 5" or "− 5", for writing x + 5 / x − 5 */
const par2 = v => (v < 0 ? '(' + num(v) + ')' : num(v)); /* wraps negatives in brackets: 3 × (−2) */
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
function lcm(a, b) { return a / gcd(a, b) * b; }
/* lowest terms with the sign on top: reduce(6,-8) -> [-3,4] */
function reduce(nm, dn) { if (dn < 0) { nm = -nm; dn = -dn; } const g = gcd(nm, dn) || 1; return [nm / g, dn / g]; }
function isPrime(v) { if (v < 2 || v % 1) return false; for (let i = 2; i * i <= v; i++) if (v % i === 0) return false; return true; }
/* prime factors as {prime: power}: 360 -> {2:3, 3:2, 5:1} */
function factorize(v) { const out = {}; let x = v; for (let p = 2; p * p <= x; p++) while (x % p === 0) { out[p] = (out[p] || 0) + 1; x /= p; } if (x > 1) out[x] = (out[x] || 0) + 1; return out; }
function factorsOf(v) { const out = []; for (let i = 1; i <= v; i++) if (v % i === 0) out.push(i); return out; }
/* a stacked fraction for questions and answers: frac(3,4). Negative numerators get the sign in front. */
function frac(nm, dn) { if (dn === 1) return num(nm); const neg = nm * dn < 0; return (neg ? MINUS : '') + '<span class="fr"><span class="fr-n">' + num(Math.abs(nm)) + '</span><span class="fr-d">' + num(Math.abs(dn)) + '</span></span>'; }
/* a mixed number: mixed(2,1,3) is 2 1/3 */
function mixed(w, nm, dn) { return num(w) + '<span class="fr"><span class="fr-n">' + nm + '</span><span class="fr-d">' + dn + '</span></span>'; }
const pw = (b, e) => b + '<sup>' + e + '</sup>'; /* powers: pw(2,5) is 2 to the 5th; pw('x',2) */
const rt = (x, k) => (k ? '<sup class="rt-k">' + k + '</sup>' : '') + '√<span class="rt">' + x + '</span>'; /* roots: rt(72), rt(8,3) */
const PI = 'π';
const DEG = '°';
const ord = k => k + (k % 100 >= 11 && k % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][k % 10] || 'th'); /* 1st 2nd 3rd 4th */
/* x-terms: term(3,'x') "3x", term(1,'x') "x", term(-1,'x') "−x", term(0,'x') "" ; poly([1,-5,6]) "x² − 5x + 6" */
function term(c, v) { if (c === 0) return ''; if (!v) return num(c); return (c === -1 ? MINUS : c === 1 ? '' : num(c)) + v; }
function poly(cs, v) {
  v = v || 'x'; const deg = cs.length - 1; let s = '';
  cs.forEach((c, i) => { if (!c) return; const e = deg - i, vv = e === 0 ? '' : e === 1 ? v : v + '<sup>' + e + '</sup>', a = Math.abs(c), body = (a === 1 && e > 0 ? '' : num(a)) + vv;
    s += s ? (c < 0 ? ' ' + MINUS + ' ' : ' + ') + body : (c < 0 ? MINUS : '') + body; });
  return s || '0';
}
/* a story item with a price, for money questions */
const NAMES = ['Mia', 'Leo', 'Ava', 'Sam', 'Zoe', 'Max', 'Ivy', 'Ben', 'Lily', 'Omar', 'Ruby', 'Theo', 'Nora', 'Kai', 'Elle', 'Jack'];

/* ---------- more pictures ---------- */
/* a rectangle with side labels; o.grid draws unit squares (keep w,h <= 12 then); o.w/o.h are the label texts */
function rectSVG(w, h, o) {
  o = o || {}; const sc = Math.min(30, 260 / Math.max(w, h * 1.4)), W = w * sc, H = h * sc, x0 = 40, y0 = 14;
  let s = '<svg class="fig" viewBox="0 0 ' + (W + 80) + ' ' + (H + 48) + '" style="max-width:' + Math.min(380, W + 80) + 'px" aria-hidden="true">';
  if (o.grid) { for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) s += '<rect x="' + (x0 + i * sc) + '" y="' + (y0 + j * sc) + '" width="' + sc + '" height="' + sc + '" class="fig-cell"/>'; }
  s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + W + '" height="' + H + '" class="fig-shape"/>';
  s += '<text x="' + (x0 + W / 2) + '" y="' + (y0 + H + 26) + '" class="fig-lab">' + (o.w != null ? o.w : w) + '</text>';
  s += '<text x="' + (x0 - 8) + '" y="' + (y0 + H / 2 + 6) + '" class="fig-lab" text-anchor="end">' + (o.h != null ? o.h : h) + '</text>';
  return s + '</svg>';
}
/* a right triangle: legs a (up the left side) and b (along the bottom), hypotenuse c; labels are strings ('' hides one) */
function triSVG(a, b, c, o) {
  o = o || {}; const s0 = 'class="fig-lab"';
  let s = '<svg class="fig" viewBox="0 0 300 200" style="max-width:320px" aria-hidden="true"><path d="M60 170 L60 30 L260 170 Z" class="fig-shape"/><path d="M60 150 L80 150 L80 170" class="fig-thin"/>';
  if (a !== '') s += '<text x="48" y="106" ' + s0 + ' text-anchor="end">' + a + '</text>';
  if (b !== '') s += '<text x="160" y="196" ' + s0 + '>' + b + '</text>';
  if (c !== '') s += '<text x="172" y="90" ' + s0 + ' text-anchor="start">' + c + '</text>';
  if (o.angle) s += '<path d="M228 170 A32 32 0 0 1 234 152" class="fig-thin"/><text x="206" y="162" class="fig-small">' + o.angle + '</text>';
  return s + '</svg>';
}
/* a bar graph: labels and values; o.step is the axis step */
function barSVG(labels, values, o) {
  o = o || {}; const max = Math.max(...values), step = o.step || (max <= 10 ? 1 : max <= 20 ? 2 : max <= 50 ? 5 : 10), top = Math.ceil(max / step) * step;
  const bw = 46, gap = 18, H = 180, W = 50 + labels.length * (bw + gap);
  let s = '<svg class="fig" viewBox="0 0 ' + W + ' ' + (H + 50) + '" style="max-width:' + Math.min(420, W * 1.2) + 'px" aria-hidden="true">';
  for (let v = 0; v <= top; v += step) { const y = 10 + H - v / top * H; s += '<line x1="40" x2="' + W + '" y1="' + y + '" y2="' + y + '" class="fig-grid"/><text x="34" y="' + (y + 5) + '" class="fig-small" text-anchor="end">' + v + '</text>'; }
  labels.forEach((l, i) => { const x = 50 + i * (bw + gap), h = values[i] / top * H; s += '<rect x="' + x + '" y="' + (10 + H - h) + '" width="' + bw + '" height="' + h + '" class="fig-bar' + (i % 2 ? ' alt' : '') + '"/><text x="' + (x + bw / 2) + '" y="' + (H + 34) + '" class="fig-small">' + l + '</text>'; });
  return s + '</svg>';
}
/* a fraction bar: d equal parts with nm shaded (nm may be more than d: draws more bars) */
function fracBarSVG(nm, dn) {
  const bars = Math.max(1, Math.ceil(nm / dn)), w = 300, h = 34; let s = '<svg class="fig" viewBox="0 0 ' + (w + 4) + ' ' + (bars * (h + 8)) + '" style="max-width:340px" aria-hidden="true">';
  for (let b = 0; b < bars; b++) for (let i = 0; i < dn; i++) { const k = b * dn + i; s += '<rect x="' + (2 + i * w / dn) + '" y="' + (2 + b * (h + 8)) + '" width="' + (w / dn) + '" height="' + h + '" class="' + (k < nm ? 'fig-on' : 'fig-cell') + '"/>'; }
  return s + '</svg>';
}
/* a number line from lo to hi with a tick every step; labels every lab; marks: [{v, t}] puts text t (e.g. '?') above value v */
function numLineSVG(lo, hi, step, marks, lab) {
  lab = lab || step; const W = 340, x = v => 20 + (v - lo) / (hi - lo) * (W - 40); let s = '<svg class="fig" viewBox="0 0 ' + W + ' 80" style="max-width:420px" aria-hidden="true"><line x1="10" x2="' + (W - 10) + '" y1="50" y2="50" class="fig-shape"/>';
  for (let v = lo, i = 0; v <= hi + 1e-9 && i < 200; v = +(v + step).toFixed(10), i++) { const big = Math.abs(Math.round((v - lo) / lab) * lab - (v - lo)) < 1e-9; s += '<line x1="' + x(v) + '" x2="' + x(v) + '" y1="' + (big ? 40 : 44) + '" y2="' + (big ? 60 : 56) + '" class="fig-thin"/>' + (big ? '<text x="' + x(v) + '" y="76" class="fig-small">' + num(v) + '</text>' : ''); }
  (marks || []).forEach(m => { s += '<circle cx="' + x(m.v) + '" cy="50" r="6" class="fig-dot"/><text x="' + x(m.v) + '" y="30" class="fig-lab">' + m.t + '</text>'; });
  return s + '</svg>';
}
/* a coordinate grid from -r..r with points [{x,y,t}] and optional segment/line through two points (o.line=[p,q]) */
function plotSVG(points, o) {
  o = o || {}; const r = o.r || 6, W = 240, u = (W - 20) / (2 * r), X = v => 10 + (v + r) * u, Y = v => 10 + (r - v) * u;
  let s = '<svg class="fig" viewBox="0 0 ' + W + ' ' + W + '" style="max-width:280px" aria-hidden="true">';
  for (let i = -r; i <= r; i++) s += '<line x1="' + X(i) + '" x2="' + X(i) + '" y1="10" y2="' + (W - 10) + '" class="fig-grid"/><line y1="' + Y(i) + '" y2="' + Y(i) + '" x1="10" x2="' + (W - 10) + '" class="fig-grid"/>';
  s += '<line x1="' + X(0) + '" x2="' + X(0) + '" y1="10" y2="' + (W - 10) + '" class="fig-thin"/><line y1="' + Y(0) + '" y2="' + Y(0) + '" x1="10" x2="' + (W - 10) + '" class="fig-thin"/>';
  if (o.line) { const [p, q] = o.line; s += '<line x1="' + X(p.x) + '" y1="' + Y(p.y) + '" x2="' + X(q.x) + '" y2="' + Y(q.y) + '" class="fig-shape"/>'; }
  points.forEach(p => { s += '<circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="5" class="fig-dot"/>' + (p.t ? '<text x="' + (X(p.x) + 8) + '" y="' + (Y(p.y) - 8) + '" class="fig-small" text-anchor="start">' + p.t + '</text>' : ''); });
  return s + '</svg>';
}
/* an angle of deg degrees opening from a horizontal ray, with a label inside */
function angleSVG(deg, label) {
  const a = deg * Math.PI / 180, cx = 150, cy = 130, L = 120, ex = cx + L * Math.cos(a), ey = cy - L * Math.sin(a), r = 34, ax = cx + r * Math.cos(a), ay = cy - r * Math.sin(a);
  return '<svg class="fig" viewBox="0 0 300 150" style="max-width:300px" aria-hidden="true"><line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + L) + '" y2="' + cy + '" class="fig-shape"/><line x1="' + cx + '" y1="' + cy + '" x2="' + ex.toFixed(1) + '" y2="' + ey.toFixed(1) + '" class="fig-shape"/><path d="M' + (cx + r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 ' + (deg > 180 ? 1 : 0) + ' 0 ' + ax.toFixed(1) + ' ' + ay.toFixed(1) + '" class="fig-thin"/><text x="' + (cx + 52 * Math.cos(a / 2)).toFixed(1) + '" y="' + (cy - 52 * Math.sin(a / 2) + 6).toFixed(1) + '" class="fig-small">' + (label || '') + '</text></svg>';
}
/* a table: head is the first column labels, rows are arrays; '?' cells are highlighted. table([['x',1,2,3],['y',5,7,'?']]) */
function table(rows) { return '<table class="io">' + rows.map(r => '<tr><th>' + r[0] + '</th>' + r.slice(1).map(c => '<td' + (c === '?' ? ' class="q"' : '') + '>' + (typeof c === 'number' ? num(c) : c) + '</td>').join('') + '</tr>').join('') + '</table>'; }

/* a problem written in columns, the way it goes on paper: stackHTML([347, 285], '+') puts each digit in its own
   place column. o.ans: the answer row (a number, or '?' boxes when left out); o.carry: small digits written above
   the top number, right-aligned to its columns (e.g. ['1','1',''] ); o.mark: true draws the line only */
function stackHTML(nums, op, o) {
  o = o || {}; const rows = nums.map(v => String(v)), ans = o.ans == null ? null : String(o.ans);
  const w = Math.max(...rows.map(r => r.length), ans ? ans.length : 0, o.carry ? o.carry.length : 0) + 1;
  const cells = (str, cls) => { const pad = w - str.length; let h = ''; for (let i = 0; i < w; i++) { const ch = i < pad ? '' : str[i - pad]; h += '<td' + (cls ? ' class="' + cls + '"' : '') + '>' + (ch === '?' ? '<span class="sk-q">?</span>' : ch) + '</td>'; } return h; };
  let h = '<table class="stack" aria-hidden="true">';
  if (o.carry) h += '<tr class="sk-carry">' + cells(o.carry.join(''), '') + '</tr>';
  rows.forEach((r, i) => { const last = i === rows.length - 1; let c = cells(r, ''); if (last && op) c = '<td class="sk-op">' + op + '</td>' + c.slice(c.indexOf('</td>') + 5); h += '<tr' + (last ? ' class="sk-last"' : '') + '>' + c + '</tr>'; });
  h += '<tr class="sk-ans">' + cells(ans == null ? '?'.repeat(Math.max(1, w - 1)) : ans, '') + '</tr>';
  return h + '</table>';
}

/* ---------- the concept registry ----------
   A concept: { id, s (strand id), g (grade 2..12), title, tip, pre: [ids from other strands], gen(d, R) }.
   Within a strand, concepts are ordered by grade, then by the order they are defined; each one needs the one before it. */
const STRANDS = [
  { id: 'count', name: 'Number Sense', short: 'Numbers', icon: '#' },
  { id: 'add', name: 'Adding & Taking Away', short: 'Add', icon: '+' },
  { id: 'mul', name: 'Times & Dividing', short: 'Times', icon: '×' },
  { id: 'pat', name: 'Patterns', short: 'Patterns', icon: '⋯' },
  { id: 'story', name: 'Word Problems', short: 'Stories', icon: '✎' },
  { id: 'frac', name: 'Fractions, Decimals & Percents', short: 'Fractions', icon: '½' },
  { id: 'time', name: 'Time', short: 'Time', icon: '◷' },
  { id: 'money', name: 'Money', short: 'Money', icon: '$' },
  { id: 'meas', name: 'Measuring & Shapes', short: 'Shapes', icon: '△' },
  { id: 'fact', name: 'Factors & Primes', short: 'Factors', icon: '∣' },
  { id: 'alg', name: 'Algebra & Functions', short: 'Algebra', icon: 'x' },
  { id: 'pow', name: 'Powers, Roots & Logs', short: 'Powers', icon: 'xⁿ' },
  { id: 'data', name: 'Data & Chance', short: 'Data', icon: '▥' },
  { id: 'trig', name: 'Triangles & Trig', short: 'Trig', icon: '∠' },
  { id: 'calc', name: 'Calculus', short: 'Calculus', icon: '∫' }
];
const S = {}, LIST = [];
/* Common Core alignment. STD holds the standards: { code: {code, g, text, game} } where game is false for standards a
   typed-answer game can't practise (drawing, constructing, explaining, collecting data); its reason is in game.why.
   A concept's cc lists the standards it practises; a concept with no cc is an extra that goes beyond Common Core.
   regrade moves a concept to the grade where Common Core puts it. */
const STD = {};
function standards(list) { list.forEach(x => { if (!x || !x.code) throw new Error('standard without a code'); STD[x.code] = Object.assign({ game: true }, x); }); }
function align(map) { for (const id in map) { if (!S[id]) throw new Error('align: no concept ' + id); S[id].cc = [...new Set((S[id].cc || []).concat(map[id]))]; } }
function regrade(map) { for (const id in map) { if (!S[id]) throw new Error('regrade: no concept ' + id); const g = map[id]; if (!Number.isInteger(g) || g < 2 || g > 12) throw new Error('regrade: bad grade for ' + id); S[id].was = S[id].g; S[id].g = g; } }
function defs(arr) {
  arr.forEach(c => {
    if (!c || !c.id) throw new Error('concept without an id');
    if (S[c.id]) throw new Error('duplicate concept id ' + c.id);
    c.pre = c.pre || []; c.def = LIST.length; S[c.id] = c; LIST.push(c);
  });
}

/* ---------- making, showing and checking problems ----------
   A problem: { text, ans, type, how[], steps[], traps[], vis, howVis, unit, low, hint, key, say }
   type 'num'   ans is a number (whole, negative or decimal). Typed fractions that equal it count too.
   type 'frac'  ans is {n, d}. Any equal fraction or decimal counts, unless low: true (then it must be in lowest terms).
   type 'money' ans is cents; fmt 'c' types cents (45), fmt 'd' types dollars (3.05).
   type 'time'  ans is {h, m} on a 12-hour clock; dur: true means a length of time (h can be 0).
   type 'rem'   ans is {q, r}: a quotient and a remainder, typed 7r2.
   steps: the idea broken into smaller questions using the same numbers (each its own little problem).
   traps: likely wrong answers {v, c, why}: v in the same form as ans, c the concept that mistake points to, why a
   one-sentence hint aimed at that mistake. */
function sayOf(html) {
  return String(html).replace(/<span class="fr-n">([^<]*)<\/span><span class="fr-d">([^<]*)<\/span>/g, ' $1 over $2 ')
    .replace(/<sup>2<\/sup>/g, ' squared ').replace(/<sup>3<\/sup>/g, ' cubed ').replace(/<sup>([^<]*)<\/sup>/g, ' to the power $1 ')
    .replace(/<[^>]+>/g, ' ').replace(/&lt;/g, ' less than ').replace(/&gt;/g, ' greater than ').replace(/&amp;/g, ' and ')
    .replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(new RegExp(MINUS, 'g'), ' minus ').replace(/√/g, ' square root of ')
    .replace(/π/g, ' pi ').replace(/°/g, ' degrees ').replace(/\?/g, ' what ').replace(/=/g, ' equals ').replace(/¢/g, ' cents').replace(/\s+/g, ' ').trim();
}
function hashStr(t) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
const TYPES = ['num', 'frac', 'money', 'time', 'rem'];
/* a hyphen typed as a minus sign (= -4, (-2), divide by -1) becomes the real minus sign, so negatives read clearly */
const minusFix = t => typeof t === 'string' ? t.replace(/(^|[\s=(\[,+×÷>])-(\s?\d)/g, '$1' + MINUS + '$2') : t;
function finish(p, id, d) {
  p.skill = id; p.d = d; p.type = p.type || 'num'; p.how = (p.how || []).map(minusFix); p.text = minusFix(p.text); if (p.hint) p.hint = minusFix(p.hint);
  if (p.traps) p.traps.forEach(t => { if (t) t.why = minusFix(t.why); });
  if (p.type === 'num') p.ans = +(+p.ans).toFixed(10);
  if (p.type === 'frac' && p.ans && p.ans.d < 0) p.ans = { n: -p.ans.n, d: -p.ans.d };
  p.say = p.say || sayOf(p.text);
  p.key = p.key || (p.text + '|' + hashStr(p.vis || ''));
  return p;
}
function gen(id, d, R) {
  R = R || makeR(); const s = S[id]; if (!s) throw new Error('no concept ' + id);
  for (let k = 0; k < 40; k++) {
    const p = s.gen(d, R); if (!p) continue; finish(p, id, d);
    p.steps = (p.steps || []).map(q => { q = finish(q, id, d); q.step = true; return q; });
    p.traps = (p.traps || []).filter(t => t && t.v != null && !eqAns(p, t.v));
    return p;
  }
  throw new Error('no problem from ' + id + ' at difficulty ' + d);
}
function ratio(v) { /* an exact fraction for a typed decimal string */
  const m = String(v).match(/^(-?)(\d*)\.?(\d*)$/); if (!m) return null; const k = m[3].length, den = Math.pow(10, k), top = +(m[2] || '0') * den + +(m[3] || '0');
  const [a, b] = reduce((m[1] ? -1 : 1) * top, den); return { n: a, d: b };
}
/* the typed string, read as a value for this problem (null if it isn't a complete answer) */
function parse(p, raw) {
  raw = String(raw == null ? '' : raw).replace(new RegExp(MINUS, 'g'), '-').replace(/\s+/g, ' ').trim(); if (!raw) return null;
  if (p.type === 'num' || p.type === 'frac') {
    let m, f = null;
    if ((m = raw.match(/^(-?)(\d+) (\d+)\/(\d+)$/)) && +m[4] > 0) { const dd = +m[4], w = +m[2], nn = w * dd + +m[3]; f = { n: (m[1] ? -1 : 1) * nn, d: dd, form: 'mixed' }; }
    else if ((m = raw.match(/^(-?)(\d+)\/(\d+)$/)) && +m[3] > 0) f = { n: (m[1] ? -1 : 1) * +m[2], d: +m[3], form: 'frac' };
    else if (/^-?(\d+\.?\d*|\.\d+)$/.test(raw)) { const r = ratio(raw.replace(/\.$/, '')); if (r) f = { n: r.n, d: r.d, form: /\./.test(raw) ? 'dec' : 'int' }; }
    if (!f) return null;
    return p.type === 'num' ? f.n / f.d : f;
  }
  if (p.type === 'money') { if (p.fmt === 'c') return /^\d+$/.test(raw) ? +raw : null; if (!/^\d*(\.\d{0,2})?$/.test(raw) || raw === '.') return null; return Math.round(parseFloat(raw) * 100); }
  if (p.type === 'time') { if (!/^\d{1,4}$/.test(raw)) return null; if (raw.length <= 2) return p.dur ? { h: 0, m: +raw } : { h: +raw, m: 0 }; return { h: +raw.slice(0, -2), m: +raw.slice(-2) }; }
  if (p.type === 'rem') { const m = raw.match(/^(\d+)\s*r\s*(\d+)$/i); if (m) return { q: +m[1], r: +m[2] }; return /^\d+$/.test(raw) ? { q: +raw, r: 0 } : null; }
  return null;
}
function eqAns(p, v) {
  if (v == null) return false; const a = p.ans;
  switch (p.type) {
    case 'num': return typeof v === 'number' && isFinite(v) && Math.abs(v - a) <= 1e-9 * Math.max(1, Math.abs(a));
    case 'money': return typeof v === 'number' && v === a;
    case 'frac': {
      if (typeof v === 'number') return !p.low && Math.abs(v - a.n / a.d) < 1e-9;
      if (typeof v !== 'object' || v.d == null) return false;
      if (v.n * a.d !== a.n * v.d) return false;
      if (!p.low || v.form == null) return true;
      const [rn, rd] = reduce(a.n, a.d);
      if (rd === 1) return v.form === 'int' || (v.form === 'frac' && v.d === 1);
      return v.form === 'frac' && v.d === rd && v.n === rn;
    }
    case 'time': return typeof v === 'object' && (p.dur ? v.h * 60 + v.m === a.h * 60 + a.m && v.m < 60 : (v.h % 12) === (a.h % 12) && v.m === a.m && v.h >= 1 && v.h <= 12);
    case 'rem': return typeof v === 'object' && v.q === a.q && v.r === a.r;
  }
  return false;
}
/* the keys someone would type for value v (the answer when v is left out) */
function plainNum(v) { const r = +v.toFixed(10); let s = Math.abs(r).toFixed(10).replace(/\.?0+$/, ''); return (r < 0 ? '-' : '') + s; }
function rawFor(p, v) {
  v = v === undefined ? p.ans : v;
  switch (p.type) {
    case 'num': return plainNum(v);
    case 'frac': { if (typeof v === 'number') return plainNum(v); const [a, b] = p.low ? reduce(v.n, v.d) : [v.n, v.d]; return b === 1 ? String(a) : a + '/' + b; }
    case 'money': return p.fmt === 'c' ? String(v) : (v / 100).toFixed(2);
    case 'time': return v.h + pad2(v.m);
    case 'rem': return v.q + 'r' + v.r;
  }
  return String(v);
}
/* the answer as display HTML */
function ansText(p, v) {
  v = v === undefined ? p.ans : v;
  switch (p.type) {
    case 'num': return num(v) + (p.unit ? ' ' + p.unit : '');
    case 'frac': { if (typeof v === 'number') return num(v); const [a, b] = reduce(v.n, v.d); return (b === 1 ? num(a) : frac(a, b)) + (p.unit ? ' ' + p.unit : ''); }
    case 'money': return p.fmt === 'c' ? v + '¢' : fmtD(v);
    case 'time': return p.dur ? (v.h ? v.h + ' h ' : '') + v.m + ' min' : fmtT(v.h, v.m);
    case 'rem': return v.r ? v.q + ' r ' + v.r : String(v.q);
  }
  return String(v);
}
/* which extra keys the keypad shows for a problem: '.', '−', '/' depend on the grade and on the answer, so the keys
   never give the answer away for older kids and never clutter the pad for younger ones */
function keysFor(p) {
  const g = S[p.skill] ? S[p.skill].g : 2, out = [];
  if (p.type === 'num' || p.type === 'frac') {
    const val = p.type === 'num' ? p.ans : p.ans.n / p.ans.d, nonInt = Math.abs(val - Math.round(val)) > 1e-9;
    if (p.type === 'num' ? (nonInt || g >= 4) : (!p.low && g >= 5)) out.push('.');
    if (p.type === 'frac' || g >= 5 || (p.type === 'num' && nonInt && g >= 4)) out.push('/');
    if (val < 0 || g >= 6) out.push('−');
    if (p.type === 'frac' && !p.low && g >= 4) out.push(' '); /* the space key, for mixed numbers: 1 2/3 */
  }
  if (p.type === 'money' && p.fmt === 'd') out.push('.');
  if (p.type === 'rem') out.push('r');
  return out;
}

const API = { makeR, n, num, B, MINUS, pad2, fmtT, fmtM, fmtD, plural, sum, signed, par2, gcd, lcm, reduce, isPrime, factorize, factorsOf,
  frac, mixed, pw, rt, PI, DEG, ord, term, poly, NAMES, ITEMS, par, T, minHops, compHow, mulHow, breakHow, seqProblem, constSeq, skipGen,
  seqHTML, hopsSVG, tenFrame, dotsSVG, rowDots, groupsSVG, blocksSVG, chartSVG, roundLine, ioTable, clockSVG, COIN, COIN_ORDER, coinSVG, coinsRow,
  greedy, coinNames, countOn, tagsHTML, rectSVG, triSVG, barSVG, fracBarSVG, numLineSVG, plotSVG, angleSVG, table, stackHTML,
  STRANDS, S, LIST, defs, STD, standards, align, regrade, gen, parse, eqAns, rawFor, ansText, keysFor, sayOf, TYPES };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.MWC = API;
})(typeof window !== 'undefined' ? window : this);
