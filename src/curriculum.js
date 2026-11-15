/* Math Worlds curriculum: strands, lessons and the problem makers.
   Every lesson teaches one shortcut. gen(d,R) makes a problem at difficulty d (0 easy, 1 medium, 2 hard) and
   returns the prompt, the answer, a picture when one helps, and the shortcut worked out for that exact problem
   (how), which the game shows after a miss. Pure functions with no page access, so node can test every lesson. */
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

/* ---------- the lessons ---------- */
const S = {};
function L(id, title, tip, gen, o) { S[id] = Object.assign({ id, title, tip, gen }, o || {}); }

/* Patterns */
L('skip1', 'Count by 2s, 5s and 10s', 'Skip counting adds the same jump every time. 10s always end in 0. 5s end in 5, 0, 5, 0. 2s end in 0, 2, 4, 6, 8.', (d, R) => skipGen([2, 5, 10], d, R));
L('oddeven', 'Odd and even', 'Only the ones digit matters. Ends in 0, 2, 4, 6 or 8: even. Ends in 1, 3, 5, 7 or 9: odd. Odd + odd and even + even are even. Odd + even is odd.', (d, R) => {
  if (d < 2) { const v = d === 0 ? R.i(1, 40) : R.i(41, 9999), o = v % 10;
    return { type: 'choice', opts: ['Odd', 'Even'], ans: v % 2 ? 'Odd' : 'Even', text: 'Is ' + B(n(v)) + ' odd or even?', key: 'oe' + v,
      how: ['Look only at the ones digit: ' + B(o) + '.', o + ' is ' + (v % 2 ? 'odd (1, 3, 5, 7, 9)' : 'even (0, 2, 4, 6, 8)') + ', so ' + n(v) + ' is ' + B(par(v)) + '.'] }; }
  const a = R.i(11, 99), b = R.i(11, 99), op = R.chance(.7) ? '+' : '×', res = op === '+' ? a + b : a * b;
  const how = op === '+' ? [a + ' is ' + par(a) + ' and ' + b + ' is ' + par(b) + '.', par(a) === par(b) ? 'Two ' + par(a) + ' numbers add up to an even number.' : 'Odd + even is always odd.', 'So it is ' + B(par(res)) + '. (Check: ' + a + ' + ' + b + ' = ' + n(res) + '.)']
    : [a + ' is ' + par(a) + ' and ' + b + ' is ' + par(b) + '.', (a % 2 && b % 2) ? 'Odd × odd is the only way to get an odd answer.' : 'If either number is even, the answer is even.', 'So it is ' + B(par(res)) + '. (Check: ' + a + ' × ' + b + ' = ' + n(res) + '.)'];
  return { type: 'choice', opts: ['Odd', 'Even'], ans: res % 2 ? 'Odd' : 'Even', text: 'Without working it out, is ' + B(a + ' ' + op + ' ' + b) + ' odd or even?', key: 'oe' + a + op + b, how };
}, { only: true });
L('addrule', 'What comes next? (same jump)', 'Find the jump between two numbers next to each other. Check it on the next pair. Then use the same jump to fill the gap. Jumps can go down too.', (d, R) => {
  let k, start, back = false, len = 5;
  if (d === 0) { k = R.i(2, 6); start = R.i(1, 20); }
  else if (d === 1) { k = R.i(3, 9); back = R.chance(.5); start = back ? R.i(5 * k, 60 + 5 * k) : R.i(1, 60); }
  else { k = R.pick([7, 8, 9, 11, 12, 15, 20, 25]); back = R.chance(.4); len = 6; start = back ? R.i(6 * k, 200 + 6 * k) : R.i(10, 150); }
  const seq = []; for (let i = 0; i < len; i++) seq.push(back ? start - i * k : start + i * k);
  const miss = d === 0 ? len - 1 : R.i(1, len - 1), p = seqProblem(seq, miss, constSeq(seq, miss));
  p.wrong = [p.ans + k, p.ans - k, p.ans + 1, p.ans - 1, p.ans + 10]; return p;
});
L('skip2', 'Count by 3s, 4s and 25s', '3s: 3, 6, 9, 12, 15. 4s: 4, 8, 12, 16, 20. 25s go 25, 50, 75, 100, just like quarters. Find the jump, then keep jumping.', (d, R) => skipGen(d === 0 ? [3, 4] : d === 1 ? [3, 4, 25] : [3, 4, 6, 25, 50], d, R));
L('hundred', 'Hundred chart jumps', 'On a hundred chart, one row down is +10 and one row up is ' + MINUS + '10. Right is +1, left is ' + MINUS + '1. Diagonal down-right is +11, down-left is +9.', (d, R) => {
  let s, t, how, text;
  if (d === 0) { const dir = R.pick(['below', 'above', 'right', 'left']); s = R.i(12, 89); if (s % 10 === 0) s--; if (s % 10 === 1) s++;
    t = dir === 'below' ? s + 10 : dir === 'above' ? s - 10 : dir === 'right' ? s + 1 : s - 1; text = 'On the hundred chart, what number is just ' + (dir === 'right' ? 'to the right of' : dir === 'left' ? 'to the left of' : dir) + ' ' + B(s) + '?';
    how = [dir === 'below' ? 'One row down is +10. The tens digit goes up by 1.' : dir === 'above' ? 'One row up is ' + MINUS + '10. The tens digit goes down by 1.' : dir === 'right' ? 'One step right is +1.' : 'One step left is ' + MINUS + '1.', s + ' ' + (t > s ? '+ ' : MINUS + ' ') + Math.abs(t - s) + ' = ' + B(t) + '.']; }
  else if (d === 1) { const mv = R.pick([[11, 'down and to the right'], [9, 'down and to the left'], [-9, 'up and to the right'], [-11, 'up and to the left']]); s = R.i(22, 79); if (s % 10 === 0) s--; if (s % 10 === 1) s++;
    t = s + mv[0]; text = 'On the hundred chart, start at ' + B(s) + ' and move one square ' + mv[1] + '. Where are you?';
    how = [mv[1].replace('up', 'Up').replace('down', 'Down') + ' is ' + (mv[0] > 0 ? '+10' : MINUS + '10') + ' for the row and ' + (Math.abs(mv[0]) === 11 === (mv[0] > 0) ? '+1' : MINUS + '1') + ' for the side.', 'That is ' + (mv[0] > 0 ? '+' : MINUS) + Math.abs(mv[0]) + ' in all: ' + s + ' ' + (mv[0] > 0 ? '+ ' : MINUS + ' ') + Math.abs(mv[0]) + ' = ' + B(t) + '.']; }
  else { const down = R.pick([-3, -2, 2, 3]), side = R.pick([-3, -2, 2, 3, 4]); do { s = R.i(11, 90); } while (s + down * 10 < 1 || s + down * 10 > 100 || (s - 1) % 10 + side < 0 || (s - 1) % 10 + side > 9);
    t = s + down * 10 + side; text = 'Start at ' + B(s) + '. Go ' + Math.abs(down) + ' rows ' + (down > 0 ? 'down' : 'up') + ' and ' + Math.abs(side) + ' squares ' + (side > 0 ? 'right' : 'left') + '. Where are you?';
    how = [Math.abs(down) + ' rows ' + (down > 0 ? 'down is +' : 'up is ' + MINUS) + Math.abs(down * 10) + ': ' + s + ' → ' + (s + down * 10) + '.', Math.abs(side) + ' squares ' + (side > 0 ? 'right is +' : 'left is ' + MINUS) + Math.abs(side) + ': ' + (s + down * 10) + ' → ' + B(t) + '.']; }
  return { type: 'num', text, ans: t, vis: chartSVG(s, t), how, key: 'hc' + s + '-' + t, wrong: [t + 10, t - 10, t + 1, t - 1, t + 2] };
});
L('growpat', 'Growing patterns', 'Not every pattern adds the same jump. Write the jumps between the numbers. Do they grow? Double? Take turns? The jumps tell you the rule.', (d, R) => {
  const kinds = d === 0 ? ['double', 'grow'] : d === 1 ? ['alt', 'half', 'grow'] : ['triple', 'square', 'alt', 'grow2'];
  const kind = R.pick(kinds); let seq = [], desc, stepAt;
  if (kind === 'double') { let v = R.i(1, 6); for (let i = 0; i < 5; i++) { seq.push(v); v *= 2; } desc = 'Each number is double the one before.'; stepAt = i => seq[i - 1] + ' × 2 = '; }
  else if (kind === 'half') { let v = R.pick([64, 96, 128, 80, 160, 200, 48, 320, 112]); while (seq.length < 5 && v % 1 === 0) { seq.push(v); v /= 2; } desc = 'Each number is half the one before.'; stepAt = i => 'Half of ' + seq[i - 1] + ' is '; }
  else if (kind === 'triple') { let v = R.i(1, 3); for (let i = 0; i < 5; i++) { seq.push(v); v *= 3; } desc = 'Each number is 3 times the one before.'; stepAt = i => seq[i - 1] + ' × 3 = '; }
  else if (kind === 'square') { const s0 = R.i(1, 4); for (let i = 0; i < 5; i++) seq.push((s0 + i) * (s0 + i)); desc = 'These are square numbers: ' + [0, 1, 2].map(i => (s0 + i) + ' × ' + (s0 + i)).join(', ') + ' and so on. The jumps are odd numbers that grow by 2.'; stepAt = i => (s0 + i) + ' × ' + (s0 + i) + ' = '; }
  else if (kind === 'alt') { const a = R.i(3, 8), b = R.i(1, a - 1); let v = R.i(1, 20); for (let i = 0; i < 6; i++) { seq.push(v); v += i % 2 ? -b : a; } desc = 'The jumps take turns: +' + a + ', ' + MINUS + b + ', +' + a + ', ' + MINUS + b + '.'; stepAt = i => seq[i - 1] + ((i - 1) % 2 ? ' ' + MINUS + ' ' + b : ' + ' + a) + ' = '; }
  else { const g = kind === 'grow2' ? 2 : 1, j0 = R.i(1, 3); let v = R.i(1, 12), j = j0; for (let i = 0; i < 5; i++) { seq.push(v); v += j; j += g; } desc = 'The jumps grow by ' + g + ': ' + [0, 1, 2].map(i => '+' + (j0 + g * i)).join(', ') + ', and so on.'; stepAt = i => seq[i - 1] + ' + ' + (j0 + g * (i - 1)) + ' = '; }
  const miss = d === 0 ? seq.length - 1 : d === 1 ? R.pick([seq.length - 1, seq.length - 2]) : R.i(2, seq.length - 1);
  const p = seqProblem(seq, miss, [desc, stepAt(miss) + B(n(seq[miss])) + '.']);
  p.wrong = [p.ans + 1, p.ans - 1, p.ans + 2, seq[miss - 1] + (seq[miss - 1] - (seq[miss - 2] == null ? 0 : seq[miss - 2])), p.ans * 2]; return p;
});
L('rulemachine', 'Find the rule', 'A number goes in, the machine changes it, a new number comes out. Try a rule on the first pair, then check it works for every pair before you use it.', (d, R) => {
  let rule, txt;
  if (d === 0) { const k = R.i(2, 10), add = R.chance(.6); rule = x => add ? x + k : x - k; txt = add ? 'add ' + k : 'take away ' + k; }
  else if (d === 1) { const k = R.i(2, 10); if (R.chance(.65)) { rule = x => x * k; txt = 'times ' + k; } else { const j = R.i(11, 30); rule = x => x + j; txt = 'add ' + j; } }
  else { const k = R.i(2, 5), c = R.pick([1, 2, 3, -1, 5, 10]); rule = x => x * k + c; txt = 'times ' + k + ', then ' + (c > 0 ? 'add ' + c : 'take away ' + (-c)); }
  const minIn = d === 0 ? 12 : 1; const pool = R.shuffle(Array.from({ length: 11 }, (_, i) => i + minIn - (d === 0 ? 0 : 0))).filter(x => rule(x) >= 0);
  const ins = pool.slice(0, 3).sort((a, b) => a - b), x = pool[3], rows = ins.map(v => [v, rule(v)]), reverse = d === 2 && R.chance(.4);
  const ans = reverse ? x : rule(x);
  return { type: 'num', text: reverse ? 'What number went in?' : 'What number comes out?', vis: ioTable(rows, [x, rule(x)], reverse), ans, key: 'rm' + txt + x,
    say: (reverse ? 'What number went in? ' : 'What number comes out? ') + rows.map(r => r[0] + ' becomes ' + r[1]).join(', '),
    how: ['First pair: ' + rows[0][0] + ' → ' + rows[0][1] + '. Second pair: ' + rows[1][0] + ' → ' + rows[1][1] + '.', 'The rule that works for every pair: ' + B(txt) + '.', reverse ? 'Work backwards: which number gives ' + rule(x) + '? ' + B(x) + ' → ' + rule(x) + '.' : x + ' → ' + B(rule(x)) + '.'],
    wrong: [ans + 1, ans - 1, ans + 2, ans + 10, x + (rows[0][1] - rows[0][0])] };
});

/* Number sense */
L('placeval', 'Place value', 'Each place is worth 10 times the place to its right: ones, tens, hundreds, thousands. 3 hundreds is 300. 27 tens is 270.', (d, R) => {
  if (d === 0) { const t = R.i(1, 9), o = R.i(0, 9), v = 10 * t + o;
    if (R.chance(.7)) return { type: 'num', text: B(t + ' tens') + ' and ' + B(o + ' ones') + ' make what number?', vis: blocksSVG(0, t, o), ans: v, key: 'pv' + v, how: [t + ' tens is ' + (10 * t) + '.', (10 * t) + ' and ' + o + ' ones is ' + B(v) + '.'], wrong: [10 * o + t, v + 10, v - 10, t + o] };
    return { type: 'num', text: 'How many tens are in ' + B(v) + '?', ans: t, key: 'pt' + v, vis: blocksSVG(0, t, o), how: ['In ' + v + ' the tens digit is ' + t + '.', v + ' is ' + B(t + ' tens') + ' and ' + o + ' ones.'], wrong: [o, t + 1, v, 10] }; }
  if (d === 1) { if (R.chance(.5)) { const h = R.i(1, 9), t = R.chance(.25) ? 0 : R.i(0, 9), o = R.i(0, 9), v = 100 * h + 10 * t + o;
      return { type: 'num', text: B(h + ' hundreds') + ', ' + B(t + ' tens') + ' and ' + B(o + ' ones') + ' make what number?', ans: v, key: 'ph' + v, how: [h + ' hundreds = ' + (100 * h) + ', ' + t + ' tens = ' + (10 * t) + ', ' + o + ' ones = ' + o + '.', (100 * h) + ' + ' + (10 * t) + ' + ' + o + ' = ' + B(v) + '.'], wrong: [100 * h + 10 * o + t, 100 * h + t + o, v + 100, v + 10] }; }
    let v, pos; do { v = R.i(102, 987); pos = R.i(0, 2); } while (new Set(String(v)).size < 3 || String(v)[2 - pos] === '0');
    const dg = +String(v)[2 - pos], val = dg * [1, 10, 100][pos];
    return { type: 'num', text: 'What is the ' + B(dg) + ' in ' + B(v) + ' worth?', ans: val, key: 'pw' + v + pos, how: ['The ' + dg + ' is in the ' + ['ones', 'tens', 'hundreds'][pos] + ' place.', dg + ' ' + ['ones', 'tens', 'hundreds'][pos] + ' = ' + B(val) + '.'], wrong: [dg, dg * 10, dg * 100, dg * 1000].filter(x => x !== val) }; }
  const k = R.i(0, 2);
  if (k === 0) { const t = R.i(11, 89); return { type: 'num', text: B(t + ' tens') + ' make what number?', ans: t * 10, key: 'pk' + t, how: ['Each ten is 10, so ' + t + ' tens is ' + t + ' × 10.', 'Times 10 puts a zero on the end: ' + B(n(t * 10)) + '.'], wrong: [t, t * 100, t * 10 + 10, t + 10] }; }
  if (k === 1) { const v = R.i(11, 99) * 10 + (R.chance(.5) ? 0 : R.i(1, 9)); return { type: 'num', text: 'How many tens are in ' + B(n(v)) + ' altogether?', ans: Math.floor(v / 10), key: 'pa' + v, how: ['Cover the ones digit. What is left is the number of tens.', n(v) + ' has ' + B(Math.floor(v / 10)) + ' tens' + (v % 10 ? ' and ' + (v % 10) + ' ones' : '') + '.'], wrong: [Math.floor(v / 100), Math.floor(v / 10) % 10, v, Math.floor(v / 10) + 1] }; }
  const th = R.i(1, 9), h = R.i(0, 9), t = R.i(0, 9), v = 1000 * th + 100 * h + 10 * t;
  return { type: 'num', text: B(th + ' thousand') + ', ' + B(h + ' hundreds') + ', ' + B(t + ' tens') + ' and ' + B('0 ones') + ' make what number?', ans: v, key: 'pq' + v, how: [n(1000 * th) + ' + ' + (100 * h) + ' + ' + (10 * t) + ' + 0.', 'That is ' + B(n(v)) + '.'], wrong: [1000 * th + 100 * h + t, 100 * th + 10 * h + t, v + 100, v + 10] };
});
L('tenmore', '10 more, 10 less, 100 more', 'Adding 10 changes only the tens digit. Adding 100 changes only the hundreds digit. Watch out for 9s: 9 tens and 1 more ten make a new hundred.', (d, R) => {
  let v, k, more;
  if (d === 0) { v = R.i(11, 89); k = 10; more = R.chance(.5); }
  else if (d === 1) { k = 100; more = R.chance(.5); v = more ? R.i(100, 899) : R.i(200, 999); }
  else { const c = R.i(0, 3); if (c === 0) { k = 10; more = true; v = R.i(1, 9) * 100 + 90 + R.i(0, 9); } else if (c === 1) { k = 10; more = false; v = R.i(1, 9) * 100 + R.i(0, 9); } else if (c === 2) { k = 100; more = true; v = 900 + R.i(0, 99); } else { k = 100; more = false; v = 1000 + R.i(0, 99); } }
  const ans = more ? v + k : v - k, place = k === 10 ? 'tens' : 'hundreds', cross = Math.floor(v / (k * 10)) !== Math.floor(ans / (k * 10));
  return { type: 'num', text: 'What is ' + B(k + ' ' + (more ? 'more' : 'less')) + ' than ' + B(n(v)) + '?', ans, key: 'tm' + v + k + more,
    how: cross ? [(more ? 'Adding ' : 'Taking away ') + k + ' changes the ' + place + ', and here it ' + (more ? 'fills up the next ' + (k === 10 ? 'hundred' : 'thousand') : 'goes back past a ' + (k === 10 ? 'hundred' : 'thousand')) + '.', n(v) + ' ' + (more ? '+ ' : MINUS + ' ') + k + ' = ' + B(n(ans)) + '.'] : ['Only the ' + place + ' digit changes. The other digits stay the same.', n(v) + ' ' + (more ? '+ ' : MINUS + ' ') + k + ' = ' + B(n(ans)) + '.'],
    wrong: [more ? v + 1 : v - 1, more ? v + k * 10 : v - k * 10, more ? ans - k : ans + k, more ? v + k / 10 * 100 + k : ans + 1].filter(x => x >= 0) };
});
L('round', 'Rounding', 'Find the two tens (or hundreds) your number sits between. Look at the digit just to the right. 5 or more rounds up. 4 or less rounds down.', (d, R) => {
  let v, to;
  if (d === 0) { do { v = R.i(11, 99); } while (v % 10 === 0); to = 10; }
  else if (d === 1) { to = R.pick([10, 100]); do { v = R.i(101, 989); } while (v % to === 0); }
  else { const c = R.i(0, 2); if (c === 0) { to = 10; v = R.i(1, 99) * 10 + 5; } else if (c === 1) { to = 100; v = R.i(1, 9) * 100 + R.pick([50, 49, 51, 48]); } else { to = R.pick([10, 100]); v = to === 10 ? R.pick([995, 996, 997, 998]) : R.i(1001, 9899); if (v % to === 0) v++; } }
  const lo = Math.floor(v / to) * to, hi = lo + to, dig = Math.floor((v % to) / (to / 10)), ans = dig >= 5 ? hi : lo;
  return { type: 'num', text: 'Round ' + B(n(v)) + ' to the nearest ' + B(to === 10 ? 'ten' : 'hundred') + '.', ans, key: 'rd' + v + to, vis: d < 2 && v < 1000 ? roundLine(lo, hi, v, to / 10) : '',
    how: [n(v) + ' is between ' + n(lo) + ' and ' + n(hi) + '.', 'Look at the ' + (to === 10 ? 'ones' : 'tens') + ' digit: ' + B(dig) + '. ' + (dig >= 5 ? '5 or more, so round up to ' : '4 or less, so round down to ') + B(n(ans)) + '.'],
    wrong: [dig >= 5 ? lo : hi, v, lo - to, hi + to] };
});
L('estimate', 'Estimate first', 'An estimate is a close answer you can work out fast. Round each number first, then add or subtract the easy numbers.', (d, R) => {
  const to = d === 2 ? 100 : 10, r = x => Math.round(x / to) * to;
  let a, b, op; const ok = x => (x % to) !== to / 2;
  do { if (d === 2) { a = R.i(110, 890); b = R.i(110, 890); op = R.chance(.6) ? '+' : MINUS; } else { a = R.i(12, 89); b = R.i(12, 89); op = d === 1 && R.chance(.6) ? MINUS : '+'; } if (op === MINUS && a < b) [a, b] = [b, a]; } while (!ok(a) || !ok(b) || r(a) === r(b));
  const ra = r(a), rb = r(b), ans = op === '+' ? ra + rb : ra - rb, exact = op === '+' ? a + b : a - b;
  return { type: 'num', text: 'About how much is ' + B(n(a) + ' ' + op + ' ' + n(b)) + '? Round each number to the nearest ' + (to === 10 ? 'ten' : 'hundred') + ' first.', ans, key: 'es' + a + op + b,
    how: [n(a) + ' rounds to ' + n(ra) + '. ' + n(b) + ' rounds to ' + n(rb) + '.', n(ra) + ' ' + op + ' ' + n(rb) + ' = ' + B(n(ans)) + '. (The exact answer is ' + n(exact) + ', close!)'],
    wrong: [ans + to, ans - to, ans + 2 * to, op === '+' ? ra + rb + to * 2 : ans + 3 * to].filter(x => x > 0 && x !== exact) };
});

/* Adding in your head */
L('bond10', 'Friends of 10', 'Pairs that make 10: 1 + 9, 2 + 8, 3 + 7, 4 + 6, 5 + 5. Knowing them by heart makes every other shortcut faster.', (d, R) => {
  if (d === 0) { const a = R.i(1, 9); return { type: 'num', text: B(a + ' + ? = 10'), ans: 10 - a, vis: tenFrame(a), key: 'b' + a, how: ['Count the empty boxes in the ten frame.', a + ' + ' + (10 - a) + ' = 10, so the answer is ' + B(10 - a) + '.'], wrong: [9 - a, 11 - a, a, 10 + a].filter(x => x >= 0) }; }
  if (d === 1) { const a = R.i(1, 9), f = R.i(0, 2), b = 10 - a; const text = f === 0 ? '? + ' + a + ' = 10' : f === 1 ? '10 = ' + a + ' + ?' : '10 ' + MINUS + ' ' + a + ' = ?';
    return { type: 'num', text: B(text), ans: b, key: 'b1' + f + a, how: [a + ' and ' + b + ' are friends of 10.', f === 2 ? 'If ' + a + ' + ' + b + ' = 10, then 10 ' + MINUS + ' ' + a + ' = ' + B(b) + '.' : a + ' + ' + B(b) + ' = 10.'], wrong: [b + 1, b - 1, a, 10 + a].filter(x => x >= 0 && x !== b) }; }
  if (R.chance(.5)) { const a = R.i(11, 19), b = 20 - a; return { type: 'num', text: B(a + ' + ? = 20'), ans: b, key: 'b2' + a, how: [a + ' is 10 and ' + (a - 10) + '. You need ' + (a - 10) + '\'s friend of 10.', (a - 10) + ' + ' + b + ' = 10, so ' + a + ' + ' + B(b) + ' = 20.'], wrong: [b + 10, b + 1, b - 1, a - 10].filter(x => x > 0 && x !== b) }; }
  const t = R.i(1, 9) * 10, b = 100 - t; return { type: 'num', text: B(t + ' + ? = 100'), ans: b, key: 'b3' + t, how: [t + ' is ' + (t / 10) + ' tens. 100 is 10 tens.', (t / 10) + ' + ' + (b / 10) + ' = 10, so ' + t + ' + ' + B(b) + ' = 100.'], wrong: [b + 10, b - 10, 10 - t / 10, t] };
});
L('make10', 'Make a 10', 'Fill the bigger number up to the next 10 first, then add what is left. 8 + 5: 8 needs 2 to make 10, and 5 is 2 + 3, so 10 + 3 = 13.', (d, R) => {
  let a, b;
  if (d === 0) { a = 9; b = R.i(2, 9); }
  else if (d === 1) { a = R.i(6, 9); b = R.i(11 - a, 9); }
  else { a = R.i(1, 8) * 10 + R.i(5, 9); b = R.i(11 - a % 10, 9); }
  const flip = d < 2 && R.chance(.4), x = flip ? b : a, y = flip ? a : b, need = 10 - a % 10, top = a + need, ans = a + b;
  const steps = [(flip ? 'Start with the bigger number, ' + a + '. ' : '') + a + ' needs ' + need + ' to make ' + top + '.', 'Split ' + b + ' into ' + need + ' and ' + (b - need) + '.', a + ' + ' + need + ' = ' + top + ', then ' + top + ' + ' + (b - need) + ' = ' + B(ans) + '.'];
  return { type: 'num', text: B(x + ' + ' + y + ' = ?'), ans, key: 'm' + x + '+' + y, how: steps, howVis: hopsSVG(a, [need, b - need]), vis: d === 0 ? tenFrame(9 > 10 ? 0 : Math.min(a, 10)) : '', wrong: [ans - 1, ans + 1, ans - 10, ans + 10] };
});
L('doubles', 'Doubles and near doubles', 'Doubles are easy to remember: 6 + 6 = 12, 7 + 7 = 14. When two numbers are next-door neighbours, double the smaller one and add 1: 7 + 8 = 7 + 7 + 1 = 15.', (d, R) => {
  if (d === 0) { const v = R.i(2, 10); return { type: 'num', text: B(v + ' + ' + v + ' = ?'), ans: 2 * v, key: 'd' + v, how: ['This is a double: two ' + v + 's.', 'Count by 2s ' + v + ' times, or remember it: ' + v + ' + ' + v + ' = ' + B(2 * v) + '.'], wrong: [2 * v + 1, 2 * v - 1, 2 * v + 2, v + 10] }; }
  if (d === 1) { const v = R.i(3, 9), big = R.chance(.5), a = big ? v + 1 : v, b = big ? v : v + 1; return { type: 'num', text: B(a + ' + ' + b + ' = ?'), ans: 2 * v + 1, key: 'nd' + a + b, how: [a + ' + ' + b + ' is close to the double ' + v + ' + ' + v + '.', v + ' + ' + v + ' = ' + (2 * v) + ', and one more makes ' + B(2 * v + 1) + '.'], wrong: [2 * v, 2 * v + 2, 2 * v - 1, 2 * v + 3] }; }
  const c = R.i(0, 2);
  if (c === 0) { const v = R.pick([15, 25, 35, 45, 12, 13, 14, 21, 23, 24, 32, 34, 41, 43]), t = Math.floor(v / 10) * 10, o = v % 10; return { type: 'num', text: B(v + ' + ' + v + ' = ?'), ans: 2 * v, key: 'dd' + v, how: ['Double the tens: ' + t + ' + ' + t + ' = ' + (2 * t) + '. Double the ones: ' + o + ' + ' + o + ' = ' + (2 * o) + '.', (2 * t) + ' + ' + (2 * o) + ' = ' + B(2 * v) + '.'], wrong: [2 * v + 10, 2 * v - 10, 2 * t + o, 2 * v + 1] }; }
  const v = R.pick([15, 25, 35, 45, 20, 30, 40, 50, 12, 24]), a = v, b = v + 1; return { type: 'num', text: B(a + ' + ' + b + ' = ?'), ans: 2 * v + 1, key: 'dn' + v, how: ['Double the smaller number: ' + v + ' + ' + v + ' = ' + (2 * v) + '.', 'One more: ' + (2 * v) + ' + 1 = ' + B(2 * v + 1) + '.'], wrong: [2 * v, 2 * v + 2, 2 * v + 11, 2 * v - 9] };
});
L('add9', 'Add 9 the easy way', 'Adding 9? Add 10, then take 1 back. Adding 19? Add 20 and take 1 back. Adding 11? Add 10, then 1 more.', (d, R) => {
  const b = d === 0 ? 9 : d === 1 ? R.pick([19, 29, 39, 8, 11, 18]) : R.pick([99, 98, 49, 59, 101, 199]);
  const a = d === 0 ? R.i(12, 80) : d === 1 ? R.i(15, 70) : R.i(120, 600), h = compHow(a, b, '+'), ans = a + b;
  return { type: 'num', text: B(n(a) + ' + ' + b + ' = ?'), ans, key: 'a9' + a + '+' + b, how: h.steps, howVis: h.vis, wrong: [ans + 1, ans - 1, ans + 2, ans + 10, ans - 10] };
});
L('addtens', 'Add tens', 'Adding tens changes the tens and leaves the ones alone. Count the tens: 47 + 30 is 4 tens + 3 tens = 7 tens, so 77.', (d, R) => {
  if (d === 0) { const t = R.i(1, 6), o = R.i(1, 9), b = R.i(1, 8 - t) * 10, a = 10 * t + o, ans = a + b;
    return { type: 'num', text: B(a + ' + ' + b + ' = ?'), ans, key: 'at' + a + '+' + b, how: ['Only the tens change. ' + a + ' has ' + plural(t, t + ' ten', t + ' tens') + ', and ' + b + ' is ' + plural(b / 10, '1 ten', (b / 10) + ' tens') + '.', plural(t, t + ' ten', t + ' tens') + ' + ' + plural(b / 10, '1 ten', (b / 10) + ' tens') + ' = ' + (t + b / 10) + ' tens. Keep the ' + o + ' ones: ' + B(ans) + '.'], howVis: hopsSVG(a, [b]), wrong: [ans + 10, ans - 10, a + b / 10, ans + 1] }; }
  if (d === 1) { if (R.chance(.4)) { const a = R.i(3, 9) * 10, b = R.i(10 - a / 10, 9) * 10, ans = a + b; return { type: 'num', text: B(a + ' + ' + b + ' = ?'), ans, key: 'at2' + a + b, how: ['Think in tens: ' + (a / 10) + ' tens + ' + (b / 10) + ' tens = ' + (ans / 10) + ' tens.', (ans / 10) + ' tens is ' + B(ans) + '.'], wrong: [ans - 10, ans + 10, ans / 10, a / 10 + b] }; }
    const t = R.i(3, 9), o = R.i(1, 9), a = 10 * t + o, b = R.i(10 - t, 9) * 10, ans = a + b;
    return { type: 'num', text: B(a + ' + ' + b + ' = ?'), ans, key: 'at3' + a + b, how: [t + ' tens + ' + (b / 10) + ' tens = ' + (t + b / 10) + ' tens, which is ' + ((t + b / 10) * 10) + '.', 'Keep the ' + o + ' ones: ' + ((t + b / 10) * 10) + ' + ' + o + ' = ' + B(ans) + '.'], wrong: [ans - 10, ans + 10, ans - 100, ans + 1] }; }
  const h = R.i(1, 8), t = R.i(3, 9), o = R.i(0, 9), a = 100 * h + 10 * t + o, b = R.i(10 - t, 9) * 10, ans = a + b, tens = t + b / 10;
  return { type: 'num', text: B(a + ' + ' + b + ' = ?'), ans, key: 'at4' + a + b, how: ['Look at the tens: ' + t + ' tens + ' + (b / 10) + ' tens = ' + tens + ' tens = ' + (tens * 10) + '.', 'Put it back together: ' + (100 * h) + ' + ' + (tens * 10) + (o ? ' + ' + o : '') + ' = ' + B(ans) + '.'], wrong: [ans - 100, ans + 10, ans - 10, a + b / 10] };
});
L('bond100', 'Make 100', 'To make 100, the tens add up to 9 and the ones add up to 10. 63 + 37: 6 + 3 = 9 tens, 3 + 7 = 10 ones.', (d, R) => {
  if (d === 0) { const t = R.i(1, 9) * 10; return { type: 'num', text: B(t + ' + ? = 100'), ans: 100 - t, key: 'h' + t, how: [t + ' is ' + (t / 10) + ' tens, and 100 is 10 tens.', (t / 10) + ' tens + ' + (10 - t / 10) + ' tens = 10 tens, so the answer is ' + B(100 - t) + '.'], wrong: [110 - t, 90 - t, 10 - t / 10, t] }; }
  if (d === 1) { let v; do { v = R.i(11, 89); } while (v % 10 === 0); const t = Math.floor(v / 10), o = v % 10, ans = 100 - v;
    return { type: 'num', text: R.chance(.7) ? B(v + ' + ? = 100') : B('100 = ' + v + ' + ?'), ans, key: 'h1' + v, how: ['The tens add up to 9 and the ones add up to 10.', t + ' tens needs ' + (9 - t) + ' more tens. ' + o + ' ones needs ' + (10 - o) + ' more ones.', (9 - t) * 10 + ' + ' + (10 - o) + ' = ' + B(ans) + '. Check: ' + v + ' + ' + ans + ' = 100.'], howVis: hopsSVG(v, [10 - o, (9 - t) * 10]), wrong: [ans + 10, ans - 10, 110 - v, (10 - t) * 10 + (10 - o)].filter(x => x > 0 && x !== ans) }; }
  let v; do { v = R.i(11, 99) * 10; } while (v % 100 === 0); const hh = Math.floor(v / 100), tt = (v % 100) / 10, ans = 1000 - v;
  return { type: 'num', text: B(n(v) + ' + ? = ' + n(1000)), ans, key: 'h2' + v, how: ['Same trick with bigger numbers: the hundreds add up to 9 and the tens add up to 10.', hh + ' hundreds needs ' + (9 - hh) + ' more. ' + tt + ' tens needs ' + (10 - tt) + ' more.', (9 - hh) * 100 + ' + ' + (10 - tt) * 10 + ' = ' + B(ans) + '.'], wrong: [ans + 100, ans - 100, 1100 - v, ans + 10] };
});
L('split', 'Add big numbers by splitting', 'Keep the first number whole. Add the tens of the second number, then the ones. 47 + 36: 47 + 30 = 77, then 77 + 6 = 83.', (d, R) => {
  let a, b;
  if (d === 0) { do { a = R.i(21, 75); b = R.i(11, 99 - a); } while (a % 10 + b % 10 >= 10 || b % 10 === 0 || b < 11); }
  else if (d === 1) { do { a = R.i(25, 78); b = R.i(13, 79); } while (a % 10 + b % 10 < 11 || a + b > 150 || b % 10 === 0); }
  else { do { a = R.i(120, 780); b = R.i(13, 89); } while (a % 10 + b % 10 < 11 || b % 10 === 0); }
  const bt = Math.floor(b / 10) * 10, bo = b % 10, mid = a + bt, ans = a + b, steps = ['Keep ' + n(a) + ' whole. Split ' + b + ' into ' + bt + ' and ' + bo + '.', n(a) + ' + ' + bt + ' = ' + n(mid) + '.'];
  if (mid % 10 + bo >= 10) { const need = 10 - mid % 10; steps.push(n(mid) + ' + ' + bo + ': make a ten first. ' + n(mid) + ' + ' + need + ' = ' + n(mid + need) + ', then + ' + (bo - need) + ' = ' + B(n(ans)) + '.'); }
  else steps.push(n(mid) + ' + ' + bo + ' = ' + B(n(ans)) + '.');
  return { type: 'num', text: B(n(a) + ' + ' + b + ' = ?'), ans, key: 'sp' + a + '+' + b, how: steps, howVis: hopsSVG(a, [bt, bo]), wrong: [ans - 10, ans + 10, ans - 1, ans + 1, mid + bo - 10] };
});
L('friendly', 'Find friendly pairs', 'You can add in any order. Look for two numbers that make a 10 or a 100 and add those first. 7 + 6 + 3: 7 + 3 = 10, then 10 + 6 = 16.', (d, R) => {
  let nums, pair, ptot;
  if (d === 0) { const a = R.i(1, 9), c = 10 - a, b = R.i(2, 9); nums = [a, b, c]; pair = [a, c]; }
  else if (d === 1) { let x; do { x = R.i(11, 59); } while (x % 10 === 0); const z = R.chance(.5) ? 10 - x % 10 : R.i(1, 4) * 10 + (10 - x % 10); const y = R.i(12, 39); nums = R.shuffle([x, y, z]); if (nums[1] === y) nums = [x, y, z]; pair = [x, z]; }
  else if (R.chance(.5)) { const x = R.pick([25, 35, 45, 15, 65, 55, 38, 64, 72]), z = 100 - x, y = R.i(12, 89); nums = [x, y, z]; pair = [x, z]; }
  else { const a = R.i(11, 19), b = R.i(2, 9), c = 20 - a, e = R.i(2, 8), f = 10 - e; nums = [a, b, c, e + 10 * R.i(0, 2)]; nums[3] = e; nums.push(f); pair = [a, c]; }
  ptot = pair[0] + pair[1]; const rest = nums.slice(); pair.forEach(v => rest.splice(rest.indexOf(v), 1)); const ans = sum(nums);
  const steps = ['Look for friends: ' + pair[0] + ' + ' + pair[1] + ' = ' + ptot + '.'];
  if (rest.length === 1) steps.push(ptot + ' + ' + rest[0] + ' = ' + B(ans) + '.');
  else { const r2 = rest[0] + rest[1]; steps.push('Another friendly pair: ' + rest[0] + ' + ' + rest[1] + ' = ' + r2 + '.'); if (rest.length > 2) steps.push(ptot + ' + ' + r2 + ' + ' + rest.slice(2).join(' + ') + ' = ' + B(ans) + '.'); else steps.push(ptot + ' + ' + r2 + ' = ' + B(ans) + '.'); }
  return { type: 'num', text: B(nums.join(' + ') + ' = ?'), ans, key: 'fr' + nums.join('+'), how: steps, wrong: [ans + 10, ans - 10, ans + 1, ans - 1] };
});
L('nearhund', 'Add numbers close to 100', '298 is 2 less than 300. Add 300 instead, then take 2 back. Round the tricky number to a friendly one, then fix it.', (d, R) => {
  let a, b;
  if (d === 0) { a = R.i(105, 850); b = R.pick([99, 98, 101]); }
  else if (d === 1) { a = R.i(120, 700); b = R.pick([199, 198, 299, 298, 201, 399]); }
  else { b = R.i(120, 480); a = R.pick([199, 198, 299, 298, 397, 398, 399, 497, 498, 499]); }
  const ans = a + b, swap = d === 2, big = swap ? a : b, other = swap ? b : a, F = Math.round(big / 100) * 100, k = F - big;
  const steps = k > 0 ? [n(big) + ' is ' + k + ' less than ' + n(F) + '. Add ' + n(F) + ' instead: ' + n(other) + ' + ' + n(F) + ' = ' + n(other + F) + '.', 'Take the ' + k + ' back: ' + n(other + F) + ' ' + MINUS + ' ' + k + ' = ' + B(n(ans)) + '.']
    : [n(big) + ' is ' + (-k) + ' more than ' + n(F) + '. Add ' + n(F) + ' first: ' + n(other) + ' + ' + n(F) + ' = ' + n(other + F) + '.', 'Then ' + (-k) + ' more: ' + B(n(ans)) + '.'];
  return { type: 'num', text: B(n(a) + ' + ' + n(b) + ' = ?'), ans, key: 'nh' + a + '+' + b, how: steps, howVis: hopsSVG(other, [F, -k].filter(x => x)), wrong: [ans + 1, ans - 1, ans + 2, ans - 2, ans + 100, ans - 10] };
});

/* Subtracting in your head */
L('thinkadd', 'Think addition', 'Every take-away has an adding fact inside it. For 13 ' + MINUS + ' 8, think: 8 + what = 13? Count up: 8 to 10 is 2, 10 to 13 is 3, so 5.', (d, R) => {
  if (d === 0) { const a = R.i(5, 10), b = R.i(1, a - 1), ans = a - b; return { type: 'num', text: B(a + ' ' + MINUS + ' ' + b + ' = ?'), ans, key: 't' + a + '-' + b, how: ['Think: ' + b + ' + what = ' + a + '?', b + ' + ' + ans + ' = ' + a + ', so ' + a + ' ' + MINUS + ' ' + b + ' = ' + B(ans) + '.'], wrong: [ans + 1, ans - 1, a + b, ans + 2].filter(x => x >= 0) }; }
  if (d === 1) { const b = R.i(4, 9), a = R.i(11, b + 9), ans = a - b; return { type: 'num', text: B(a + ' ' + MINUS + ' ' + b + ' = ?'), ans, key: 't1' + a + '-' + b, how: ['Think: ' + b + ' + what = ' + a + '?', 'Count up: ' + b + ' → 10 is ' + (10 - b) + ', and 10 → ' + a + ' is ' + (a - 10) + '.', (10 - b) + ' + ' + (a - 10) + ' = ' + B(ans) + '.'], howVis: hopsSVG(b, [10 - b, a - 10].filter(x => x)), wrong: [ans + 1, ans - 1, ans + 2, a - 10] }; }
  if (R.chance(.5)) { const b = R.i(3, 9), ans = R.i(2, 9), a = b + ans; return { type: 'num', text: B(a + ' ' + MINUS + ' ? = ' + b), ans, key: 't2' + a + b, how: ['Think: ' + b + ' + what = ' + a + '?', b + ' + ' + ans + ' = ' + a + ', so ' + a + ' ' + MINUS + ' ' + B(ans) + ' = ' + b + '.'], wrong: [ans + 1, ans - 1, a + b, b] }; }
  const b = R.i(2, 8) * 10 + R.i(6, 9), ans = R.i(2, 6), a = b + ans; return { type: 'num', text: B(a + ' ' + MINUS + ' ' + b + ' = ?'), ans, key: 't3' + a + b, how: ['The numbers are close together, so count up from ' + b + '.', b + ' → ' + a + ' is ' + B(ans) + ' steps.'], howVis: hopsSVG(b, [ans]), wrong: [ans + 10, ans + 1, ans - 1, ans + 2] };
});
L('sub9', 'Take away 9 the easy way', 'Taking away 9? Take away 10, then give 1 back. Taking away 19? Take away 20, then give 1 back.', (d, R) => {
  const b = d === 0 ? 9 : d === 1 ? R.pick([19, 29, 8, 11, 18, 39]) : R.pick([99, 98, 49, 59, 101, 199]);
  const a = d === 0 ? R.i(15, 90) : d === 1 ? R.i(b + 12, 95) : R.i(b + 50, 900), h = compHow(a, b, MINUS), ans = a - b;
  return { type: 'num', text: B(n(a) + ' ' + MINUS + ' ' + b + ' = ?'), ans, key: 's9' + a + '-' + b, how: h.steps, howVis: h.vis, wrong: [ans + 1, ans - 1, ans + 2, ans - 2, ans + 10] };
});
L('subtens', 'Take away tens', 'Taking away tens changes only the tens. 85 ' + MINUS + ' 30: 8 tens ' + MINUS + ' 3 tens = 5 tens, so 55. For bigger numbers, count all the tens: 123 has 12 tens.', (d, R) => {
  if (d === 0) { const t = R.i(3, 9), o = R.i(0, 9), a = 10 * t + o, b = R.i(1, t - 1) * 10, ans = a - b; return { type: 'num', text: B(a + ' ' + MINUS + ' ' + b + ' = ?'), ans, key: 'st' + a + b, how: ['Only the tens change: ' + t + ' tens ' + MINUS + ' ' + (b / 10) + ' tens = ' + (t - b / 10) + ' tens.', 'Keep the ' + o + ' ones: ' + B(ans) + '.'], howVis: hopsSVG(a, [-b]), wrong: [ans + 10, ans - 10, a - b / 10, ans + 1] }; }
  if (d === 1) { const tt = R.i(10, 19), o = R.i(0, 9), a = 10 * tt + o, b = R.i(tt - 9, 9) * 10, ans = a - b; return { type: 'num', text: B(a + ' ' + MINUS + ' ' + b + ' = ?'), ans, key: 'st1' + a + b, how: [a + ' has ' + tt + ' tens. ' + tt + ' tens ' + MINUS + ' ' + (b / 10) + ' tens = ' + (tt - b / 10) + ' tens.', 'Keep the ' + o + ' ones: ' + B(ans) + '.'], wrong: [ans + 10, ans - 10, ans + 100, a - b / 10] }; }
  const c = R.i(0, 2);
  if (c === 0) { const a = R.i(2, 9) * 100, b = R.i(1, 9) * 10, ans = a - b; return { type: 'num', text: B(a + ' ' + MINUS + ' ' + b + ' = ?'), ans, key: 'st2' + a + b, how: [a + ' is ' + (a / 10) + ' tens. ' + (a / 10) + ' tens ' + MINUS + ' ' + (b / 10) + ' tens = ' + (ans / 10) + ' tens.', (ans / 10) + ' tens is ' + B(ans) + '.'], wrong: [ans + 10, ans - 10, ans + 100, a - b / 10] }; }
  if (c === 1) { const b = R.i(1, 9) * 100, ans = 1000 - b; return { type: 'num', text: B(n(1000) + ' ' + MINUS + ' ' + b + ' = ?'), ans, key: 'st3' + b, how: ['1,000 is 10 hundreds. 10 hundreds ' + MINUS + ' ' + (b / 100) + ' hundreds = ' + (ans / 100) + ' hundreds.', 'So the answer is ' + B(ans) + '.'], wrong: [ans + 100, ans - 100, 1000 - b / 10, ans + 10] }; }
  const tt = R.i(31, 99), a = tt * 10, b = R.i(2, 9) * 10, ans = a - b; return { type: 'num', text: B(a + ' ' + MINUS + ' ' + b + ' = ?'), ans, key: 'st4' + a + b, how: [a + ' is ' + tt + ' tens. ' + tt + ' tens ' + MINUS + ' ' + (b / 10) + ' tens = ' + (ans / 10) + ' tens.', (ans / 10) + ' tens is ' + B(ans) + '.'], wrong: [ans + 10, ans - 10, ans + 100, ans - 100] };
});
L('from100', 'Take away from 100 and 1,000', 'From 100: the tens add up to 9 and the ones add up to 10. 100 ' + MINUS + ' 37 = 63, because 3 + 6 = 9 and 7 + 3 = 10. From 1,000: all from 9, the last from 10.', (d, R) => {
  if (d === 0) { const b = R.i(1, 9) * 10, ans = 100 - b; return { type: 'num', text: B('100 ' + MINUS + ' ' + b + ' = ?'), ans, key: 'f' + b, how: ['100 is 10 tens. ' + b + ' is ' + (b / 10) + ' tens.', '10 tens ' + MINUS + ' ' + (b / 10) + ' tens = ' + (ans / 10) + ' tens = ' + B(ans) + '.'], wrong: [ans + 10, ans - 10, 10 - b / 10, b] }; }
  if (d === 1) { let b; do { b = R.i(11, 89); } while (b % 10 === 0); const t = Math.floor(b / 10), o = b % 10, ans = 100 - b;
    return { type: 'num', text: B('100 ' + MINUS + ' ' + b + ' = ?'), ans, key: 'f1' + b, how: ['The tens add up to 9 and the ones add up to 10.', t + ' tens → ' + (9 - t) + ' tens. ' + o + ' ones → ' + (10 - o) + ' ones.', 'So 100 ' + MINUS + ' ' + b + ' = ' + B(ans) + '. Check: ' + b + ' + ' + ans + ' = 100.'], howVis: hopsSVG(b, [10 - o, (9 - t) * 10]), wrong: [ans + 10, ans - 10, (10 - t) * 10 + (10 - o), (9 - t) * 10 + (9 - o)].filter(x => x > 0 && x !== ans) }; }
  let b; do { b = R.i(111, 989); } while (b % 100 === 0); const ds = String(b).split('').map(Number), ans = 1000 - b, zero = b % 10 === 0;
  const steps = zero ? ['It ends in 0, so work with the hundreds and tens: hundreds add up to 9, tens add up to 10.', ds[0] + ' → ' + (9 - ds[0]) + ', ' + ds[1] + ' → ' + (10 - ds[1]) + ', and the 0 stays 0.', 'So ' + n(1000) + ' ' + MINUS + ' ' + b + ' = ' + B(ans) + '.'] : ['All from 9, the last from 10.', ds[0] + ' → ' + (9 - ds[0]) + ', ' + ds[1] + ' → ' + (9 - ds[1]) + ', ' + ds[2] + ' → ' + (10 - ds[2]) + '.', 'So ' + n(1000) + ' ' + MINUS + ' ' + b + ' = ' + B(ans) + '. Check: ' + b + ' + ' + ans + ' = 1,000.'];
  return { type: 'num', text: B(n(1000) + ' ' + MINUS + ' ' + b + ' = ?'), ans, key: 'f2' + b, how: steps, wrong: [ans + 10, ans - 10, ans + 100, ans + 1].filter(x => x > 0) };
});
L('countup', 'Count up to find the difference', 'To find how far apart two numbers are, start at the smaller one and hop up to the bigger one: first to the next ten, then by tens, then the rest. Add up the hops.', (d, R) => {
  let a, b;
  if (d === 0) { do { b = R.i(15, 88); a = b + R.i(3, 12); } while (Math.floor(a / 10) === Math.floor(b / 10) || b % 10 === 0); }
  else if (d === 1) { do { a = R.i(41, 98); b = R.i(14, a - 11); } while (b % 10 <= a % 10 || b % 10 === 0); }
  else { const c = R.i(0, 2); if (c === 0) { a = R.i(3, 9) * 100 + R.i(1, 9); b = a - 100 + R.i(1, 9) * 10 + R.i(1, 8); if (b % 10 === 0) b++; } else if (c === 1) { a = R.i(3, 9) * 100 + R.i(1, 20); b = a - R.i(150, 260); if (b % 10 === 0) b--; } else { a = 1000 + R.i(1, 9); b = R.i(985, 996); } }
  const ans = a - b, hops = [], steps = []; let at = b;
  const t1 = Math.ceil((at + 1) / 10) * 10; if (at % 10) { hops.push(t1 - at); steps.push(n(at) + ' → ' + n(t1) + ' is ' + (t1 - at) + '.'); at = t1; }
  const hb = Math.floor(a / 100) * 100; if (hb > at && a >= 100 && hb - at <= 100 && a - hb < a - at) { hops.push(hb - at); steps.push(n(at) + ' → ' + n(hb) + ' is ' + (hb - at) + '.'); at = hb; }
  const tb = Math.floor(a / 10) * 10; if (tb > at) { hops.push(tb - at); steps.push(n(at) + ' → ' + n(tb) + ' is ' + (tb - at) + '.'); at = tb; }
  if (a > at) { hops.push(a - at); steps.push(n(at) + ' → ' + n(a) + ' is ' + (a - at) + '.'); }
  return { type: 'num', text: B(n(a) + ' ' + MINUS + ' ' + n(b) + ' = ?'), ans, key: 'cu' + a + '-' + b, how: ['Count up from ' + n(b) + ' to ' + n(a) + '.'].concat(steps, ['Add the hops: ' + hops.join(' + ') + ' = ' + B(ans) + '.']), howVis: hopsSVG(b, hops), wrong: [ans + 10, ans - 10, ans + 1, ans - 1, ans + 2].filter(x => x > 0) };
});
L('subsplit', 'Take away by splitting', 'Take away the tens first, then the ones. 85 ' + MINUS + ' 32: 85 ' + MINUS + ' 30 = 55, then 55 ' + MINUS + ' 2 = 53.', (d, R) => {
  let a, b;
  if (d === 0) { do { a = R.i(35, 99); b = R.i(12, a - 11); } while (b % 10 > a % 10 || b % 10 === 0); }
  else if (d === 1) { do { a = R.i(42, 99); b = R.i(13, a - 12); } while (b % 10 <= a % 10 || b % 10 === 0); }
  else { do { a = R.i(150, 900); b = R.i(13, 89); } while (b % 10 <= a % 10 || b % 10 === 0); }
  const bt = Math.floor(b / 10) * 10, bo = b % 10, mid = a - bt, ans = a - b, steps = ['Split ' + b + ' into ' + bt + ' and ' + bo + '.', n(a) + ' ' + MINUS + ' ' + bt + ' = ' + n(mid) + '.'];
  if (mid % 10 < bo) { const k = mid % 10; steps.push(n(mid) + ' ' + MINUS + ' ' + bo + ': go back to the ten first. ' + n(mid) + ' ' + MINUS + ' ' + k + ' = ' + n(mid - k) + ', then ' + MINUS + ' ' + (bo - k) + ' more = ' + B(n(ans)) + '.'); }
  else steps.push(n(mid) + ' ' + MINUS + ' ' + bo + ' = ' + B(n(ans)) + '.');
  return { type: 'num', text: B(n(a) + ' ' + MINUS + ' ' + b + ' = ?'), ans, key: 'ss' + a + '-' + b, how: steps, howVis: hopsSVG(a, [-bt, -bo]), wrong: [ans + 10, ans - 10, ans + 1, ans - 1, mid - bo + 10] };
});
L('samediff', 'Same-difference trick', 'Move both numbers up by the same amount and the difference stays the same. 73 ' + MINUS + ' 28: add 2 to both, so 75 ' + MINUS + ' 30 = 45.', (d, R) => {
  let a, b;
  if (d === 0) { b = R.i(1, 6) * 10 + 9; a = b + R.i(12, 50); if (a % 10 === 9) a++; }
  else if (d === 1) { b = R.i(1, 6) * 10 + R.pick([7, 8, 9]); a = b + R.i(12, 50); }
  else { b = R.i(1, 6) * 100 + R.pick([97, 98, 99, 95]); a = b + R.i(102, 350); }
  const F = d === 2 ? Math.ceil(b / 100) * 100 : Math.ceil(b / 10) * 10, k = F - b, ans = a - b;
  return { type: 'num', text: B(n(a) + ' ' + MINUS + ' ' + n(b) + ' = ?'), ans, key: 'sd' + a + '-' + b, how: ['Make ' + n(b) + ' friendly: add ' + k + ' to get ' + n(F) + '.', 'Add ' + k + ' to ' + n(a) + ' too: ' + n(a + k) + '.', n(a + k) + ' ' + MINUS + ' ' + n(F) + ' = ' + B(n(ans)) + '. Same difference!'], wrong: [ans + k, ans - k, ans + 10, ans - 10, ans + 2 * k].filter(x => x > 0 && x !== ans) };
});

/* Times tricks */
L('groups', 'Times means groups', '3 × 4 means 3 groups of 4. Count by 4s three times: 4, 8, 12. Rows of dots make it easy to see. Times 0 is always 0, and times 1 keeps the number the same.', (d, R) => {
  if (d === 0) { const r = R.i(2, 5), c = R.i(2, 5), ans = r * c; return { type: 'num', text: 'How many dots? ' + B(r + ' rows of ' + c), vis: dotsSVG(r, c), ans, key: 'g' + r + 'x' + c, how: ['There are ' + r + ' rows with ' + c + ' dots in each row. That is ' + r + ' × ' + c + '.', 'Count by ' + c + 's: ' + Array.from({ length: r }, (_, i) => c * (i + 1)).join(', ') + '. So ' + r + ' × ' + c + ' = ' + B(ans) + '.'], wrong: [ans + c, ans - c, r + c, ans + 1] }; }
  if (d === 1) { if (R.chance(.45)) { const z = R.chance(.5) ? 0 : 1, o = R.i(2, 12), f = R.chance(.5), a = f ? z : o, b = f ? o : z, ans = a * b; return { type: 'num', text: B(a + ' × ' + b + ' = ?'), ans, key: 'g01' + a + 'x' + b, how: mulHow(a, b), wrong: [o, o + 1, 0, 1, z ? 0 : 1].filter(x => x !== ans) }; }
    const r = R.i(2, 6), c = R.i(3, 6), ans = r * c; return { type: 'num', text: B(r + ' × ' + c + ' = ?'), vis: dotsSVG(r, c), ans, key: 'g1' + r + 'x' + c, how: [r + ' × ' + c + ' means ' + r + ' groups of ' + c + '.', 'Count by ' + c + 's: ' + Array.from({ length: r }, (_, i) => c * (i + 1)).join(', ') + '. The answer is ' + B(ans) + '.'], wrong: [ans + c, ans - c, r + c, ans + r] }; }
  const g = R.i(3, 6), e = R.i(3, 7), w = R.pick([['bags', 'apples'], ['boxes', 'crayons'], ['plates', 'cookies'], ['vases', 'flowers'], ['teams', 'players'], ['nests', 'eggs']]), ans = g * e;
  return { type: 'num', text: 'There are ' + B(g + ' ' + w[0]) + ' with ' + B(e + ' ' + w[1]) + ' in each. How many ' + w[1] + ' in all?', ans, key: 'gw' + g + 'x' + e, how: [g + ' groups of ' + e + ' is ' + g + ' × ' + e + '.'].concat(mulHow(g, e)), wrong: [ans + e, ans - e, g + e, ans + g] };
});
L('x2510', 'Times 2, 5 and 10', 'Times 2 is a double. Times 10 puts a zero on the end. Times 5 is half of times 10: 5 × 8 → 10 × 8 = 80, half of 80 is 40.', (d, R) => {
  const k = d === 0 ? R.pick([2, 10]) : d === 1 ? 5 : R.pick([2, 5, 10]), o = d < 2 ? R.i(1, 10) : R.i(11, 20), f = R.chance(.5), a = f ? k : o, b = f ? o : k, ans = a * b;
  return { type: 'num', text: B(a + ' × ' + b + ' = ?'), ans, key: 'x' + a + 'x' + b, how: mulHow(a, b, k), wrong: [ans + k, ans - k, ans + 1, o + k, o * (k === 5 ? 10 : 5)].filter(x => x > 0 && x !== ans) };
}, { req: [] });
L('x48', 'Times 4 and 8: double, double, double', 'Times 4 is double, then double again: 4 × 6 → 12 → 24. Times 8 is one more double: 8 × 6 → 12 → 24 → 48.', (d, R) => {
  const k = d === 0 ? 4 : d === 1 ? 8 : R.pick([4, 8]), o = d < 2 ? R.i(2, 10) : (k === 4 ? R.i(11, 25) : R.i(11, 15)), f = R.chance(.5), a = f ? k : o, b = f ? o : k, ans = a * b;
  return { type: 'num', text: B(a + ' × ' + b + ' = ?'), ans, key: 'x' + a + 'x' + b, how: mulHow(a, b, k), wrong: [ans + o, ans - o, ans / 2, ans + 4, ans - 2].filter(x => x > 0 && x !== ans && x % 1 === 0) };
});
L('x9', 'The times 9 trick', '9 is one less than 10. 9 × 7 → 10 × 7 = 70, take away one 7 → 63. Check it: the digits of 9s answers add up to 9 (6 + 3 = 9).', (d, R) => {
  if (d === 2 && R.chance(.4)) { const o = R.i(2, 9), ans = 99 * o; return { type: 'num', text: B('99 × ' + o + ' = ?'), ans, key: 'x99' + o, how: ['99 is one less than 100. 100 × ' + o + ' = ' + (100 * o) + '.', 'Take away one ' + o + ': ' + (100 * o) + ' ' + MINUS + ' ' + o + ' = ' + B(ans) + '.'], wrong: [ans + o, ans - o, 100 * o, ans - 9] }; }
  const o = d === 0 ? R.i(1, 5) : d === 1 ? R.i(6, 10) : R.i(2, 12), f = R.chance(.5), a = f ? 9 : o, b = f ? o : 9, ans = 9 * o, how = mulHow(a, b, 9);
  if (ans >= 18 && ans <= 90) how.push('Check: ' + String(ans)[0] + ' + ' + String(ans)[1] + ' = 9.');
  return { type: 'num', text: B(a + ' × ' + b + ' = ?'), ans, key: 'x' + a + 'x' + b, how, wrong: [ans + 9, ans - 9, 10 * o, +String(ans).split('').reverse().join('')].filter(x => x > 0 && x !== ans) };
});
L('x36', 'Times 3 and 6', 'Times 3 is a double plus one more group: 3 × 7 → 14 + 7 = 21. Times 6 is times 5 plus one more group: 6 × 7 → 35 + 7 = 42.', (d, R) => {
  if (d === 2 && R.chance(.5)) { const o = R.i(3, 9), f = R.chance(.5), a = f ? 7 : o, b = f ? o : 7, ans = 7 * o; return { type: 'num', text: B(a + ' × ' + b + ' = ?'), ans, key: 'x7' + a + b, how: ['Split 7 into 5 and 2.', '5 × ' + o + ' = ' + (5 * o) + ' and 2 × ' + o + ' = ' + (2 * o) + '.', (5 * o) + ' + ' + (2 * o) + ' = ' + B(ans) + '.'], wrong: [ans + 7, ans - 7, ans + o, 6 * o] }; }
  const k = d === 0 ? 3 : 6, o = d < 2 ? R.i(2, 10) : R.i(6, 12), f = R.chance(.5), a = f ? k : o, b = f ? o : k, ans = a * b;
  const how = k === 3 ? ['Times 3 is a double plus one more group.', 'Double ' + o + ' is ' + (2 * o) + '. ' + (2 * o) + ' + ' + o + ' = ' + B(ans) + '.'] : ['Times 6 is times 5 plus one more group.', '5 × ' + o + ' = ' + (5 * o) + '. ' + (5 * o) + ' + ' + o + ' = ' + B(ans) + '.'];
  return { type: 'num', text: B(a + ' × ' + b + ' = ?'), ans, key: 'x' + a + 'x' + b, how, wrong: [ans + k, ans - k, ans + o, ans - o].filter(x => x > 0) };
});
L('x7sq', 'Times 7, squares and turn-arounds', 'Turn-around facts: 7 × 3 is the same as 3 × 7, so use the one you know. Squares: 6 × 6 = 36, 7 × 7 = 49, 8 × 8 = 64. And 5, 6, 7, 8: 56 = 7 × 8.', (d, R) => {
  let a, b;
  if (d === 0) { a = b = R.i(2, 10); }
  else if (d === 1) { const o = R.i(2, 10), f = R.chance(.5); a = f ? 7 : o; b = f ? o : 7; }
  else { a = R.i(6, 9); b = R.i(6, 9); }
  const ans = a * b, how = a === b && a >= 6 ? [a + ' × ' + a + ' is a square number: ' + a + ' rows of ' + a + '.'].concat(mulHow(a, b).slice(-2)) : mulHow(a, b);
  return { type: 'num', text: B(a + ' × ' + b + ' = ?'), ans, key: 'x' + Math.min(a, b) + 'x' + Math.max(a, b), how, vis: d === 0 && a <= 6 ? dotsSVG(a, b) : '', wrong: [ans + a, ans - a, ans + b, ans - b, ans + 1].filter(x => x > 0 && x !== ans) };
});
L('xtens', 'Times tens and hundreds', 'Do the small fact, then add the zeros. 4 × 30: 4 × 3 = 12, add one zero → 120. 40 × 30: 4 × 3 = 12, add two zeros → 1,200.', (d, R) => {
  const a = R.i(2, 9), b = R.i(2, 9), z1 = d === 0 ? 0 : d === 1 ? 0 : 1, z2 = d === 0 ? 1 : 2 - z1 + (d === 2 ? 0 : 0), A = a * 10 ** z1, Bv = b * 10 ** (d === 1 ? 2 : 1), ans = A * Bv, zeros = z1 + (d === 1 ? 2 : 1), fact = a * b;
  return { type: 'num', text: B(n(A) + ' × ' + n(Bv) + ' = ?'), ans, key: 'xt' + A + 'x' + Bv, how: ['Do the small fact: ' + a + ' × ' + b + ' = ' + fact + '.', 'Count the zeros in ' + n(A) + ' × ' + n(Bv) + ': ' + zeros + '. Put ' + zeros + ' ' + plural(zeros, 'zero') + ' on the end of ' + fact + ': ' + B(n(ans)) + '.'].concat(fact % 10 === 0 ? ['(' + fact + ' already ends in 0. Keep that zero too.)'] : []), wrong: [ans * 10, ans / 10, ans + A, fact * 10 ** Math.max(1, zeros - 1) === ans ? ans * 100 : fact * 10 ** Math.max(1, zeros - 1)].filter(x => x !== ans && x % 1 === 0) };
}, { req: [] });
L('x1112', 'Times 11 and 12', '11 × a single digit: write the digit twice (11 × 7 = 77). 12 is 10 + 2: 12 × 7 → 70 + 14 = 84. 11 × 13 → 130 + 13 = 143.', (d, R) => {
  const k = d === 0 ? 11 : d === 1 ? 12 : R.pick([11, 12]), o = d === 0 ? R.i(2, 9) : d === 1 ? R.i(2, 10) : (k === 11 ? R.i(10, 18) : R.i(11, 12)), f = R.chance(.5), a = f ? k : o, b = f ? o : k, ans = a * b;
  const how = k === 11 ? (o <= 9 ? ['11 times a single digit: write the digit twice.', '11 × ' + o + ' = ' + B(ans) + '.'] : ['11 × ' + o + ' is 10 × ' + o + ' plus one more ' + o + '.', (10 * o) + ' + ' + o + ' = ' + B(ans) + '.']) : ['12 is 10 + 2. 10 × ' + o + ' = ' + (10 * o) + ' and 2 × ' + o + ' = ' + (2 * o) + '.', (10 * o) + ' + ' + (2 * o) + ' = ' + B(ans) + '.'];
  return { type: 'num', text: B(a + ' × ' + b + ' = ?'), ans, key: 'x' + a + 'x' + b, how, wrong: [ans + o, ans - o, ans + 10, 10 * o + o * 10].filter(x => x !== ans && x > 0) };
});
L('breakapart', 'Break apart big times', 'Break the big number into tens and ones, multiply each part, then add. 14 × 6: 10 × 6 = 60 and 4 × 6 = 24, so 84.', (d, R) => {
  let a, b;
  if (d === 0) { a = R.i(11, 19); b = R.i(2, 5); }
  else if (d === 1) { a = R.i(21, 49); b = R.i(2, 9); }
  else if (R.chance(.5)) { a = R.i(51, 99); b = R.i(3, 9); }
  else { a = R.pick([125, 213, 112, 231, 150, 104, 205, 321]); b = R.i(2, 4); }
  if (a % 10 === 0) a++;
  const ans = a * b; return { type: 'num', text: B(a + ' × ' + b + ' = ?'), ans, key: 'ba' + a + 'x' + b, how: breakHow(a, b), wrong: [ans + b, ans - b, ans + 10, Math.floor(a / 10) * 10 * b + a % 10].filter(x => x !== ans) };
});
L('dblhalf', 'Double and half', 'Half one number and double the other: the answer stays the same. 16 × 5 → 8 × 10 = 80. 25 × 12 → 50 × 6 → 100 × 3 = 300.', (d, R) => {
  let a, b;
  if (d === 0) { a = R.i(6, 14) * 2; b = 5; }
  else if (d === 1) { if (R.chance(.6)) { a = 25; b = R.pick([4, 8, 12, 16, 6, 14]); } else { a = 50; b = R.pick([4, 6, 8, 12, 14]); } }
  else { const pr = R.pick([[15, [4, 6, 8, 12, 14]], [35, [4, 6, 8]], [45, [4, 6, 8]], [25, [16, 24, 28, 32]], [5, [36, 48, 64, 86]]]); a = pr[0]; b = R.pick(pr[1]); }
  const ans = a * b, chain = []; let x = a % 10 === 5 ? a : b % 10 === 5 ? b : a % 25 === 0 ? a : b, y = x === a ? b : a; const x0 = x, y0 = y;
  for (let i = 0; i < 5 && (x % 10 !== 0 || x === 50) && y % 2 === 0; i++) { chain.push(n(x) + ' × ' + n(y) + ' → ' + n(x * 2) + ' × ' + n(y / 2)); x *= 2; y /= 2; }
  const steps = ['Double the ' + x0 + ' and half the ' + y0 + ', until the problem is easy.'].concat(chain.length ? [chain.join(', ') + '.'] : [], [ n(x) + ' × ' + n(y) + ' = ' + B(n(ans)) + '.']);
  const f = R.chance(.5); return { type: 'num', text: B(f ? a + ' × ' + b : b + ' × ' + a) + ' = ?', ans, key: 'dh' + a + 'x' + b, how: steps, wrong: [ans + a, ans - a, ans * 2, ans / 2, ans + 10].filter(x2 => x2 !== ans && x2 % 1 === 0) };
});

/* Dividing */
L('share', 'Sharing equally', 'Dividing means sharing into equal groups. 12 shared by 3 is 4 each, because 3 × 4 = 12. Every division has a times fact hiding in it.', (d, R) => {
  if (d === 0) { const g = R.i(2, 5), e = R.i(2, 5), tot = g * e, w = R.pick(['cookies', 'stickers', 'marbles', 'grapes', 'cards']); return { type: 'num', text: B(tot + ' ' + w) + ' shared equally by ' + B(g + ' friends') + '. How many does each friend get?', vis: rowDots(tot), ans: e, key: 'sh' + tot + '/' + g, how: ['Deal them out one at a time to ' + g + ' friends, like dealing cards.', 'Each friend gets ' + B(e) + '. Check: ' + g + ' × ' + e + ' = ' + tot + '.'], howVis: groupsSVG(g, e), wrong: [e + 1, e - 1, tot - g, g].filter(x => x > 0 && x !== e) }; }
  if (d === 1) { const g = R.i(2, 6), e = R.i(2, 6), tot = g * e; return { type: 'num', text: B(tot + ' ÷ ' + g + ' = ?'), ans: e, key: 'sh1' + tot + '/' + g, how: ['Think times: ' + g + ' × what = ' + tot + '?', g + ' × ' + e + ' = ' + tot + ', so ' + tot + ' ÷ ' + g + ' = ' + B(e) + '.'], howVis: groupsSVG(g, e), wrong: [e + 1, e - 1, tot - g, g === e ? e + 2 : g].filter(x => x > 0 && x !== e) }; }
  const e = R.i(3, 9), g = R.i(3, 9), tot = g * e, w = R.pick([['kids', 'teams of'], ['eggs', 'cartons of'], ['chairs', 'rows of'], ['flowers', 'bunches of']]);
  return { type: 'num', text: B(tot + ' ' + w[0]) + ' go into ' + B(w[1] + ' ' + e) + '. How many ' + w[1].split(' ')[0] + '?', ans: g, key: 'sh2' + tot + '/' + e, how: ['How many groups of ' + e + ' make ' + tot + '? That is ' + tot + ' ÷ ' + e + '.', 'Think: ' + e + ' × what = ' + tot + '? ' + e + ' × ' + g + ' = ' + tot + ', so ' + B(g) + '.'], wrong: [g + 1, g - 1, e, tot - e].filter(x => x > 0 && x !== g) };
}, { req: [] });
L('div2510', 'Divide by 2, 5 and 10', 'Dividing by 2 is halving. Dividing by 10 takes the zero off the end. Dividing by 5: double it, then divide by 10. 45 ÷ 5 → 90 ÷ 10 = 9.', (d, R) => {
  if (d === 0) { if (R.chance(.5)) { const v = R.i(2, 10) * 2; return { type: 'num', text: B(v + ' ÷ 2 = ?'), ans: v / 2, key: 'v2' + v, how: ['Dividing by 2 means halving.', 'Half of ' + v + ' is ' + B(v / 2) + ', because ' + (v / 2) + ' + ' + (v / 2) + ' = ' + v + '.'], wrong: [v / 2 + 1, v / 2 - 1, v - 2, v * 2] }; }
    const v = R.i(1, 10) * 10; return { type: 'num', text: B(v + ' ÷ 10 = ?'), ans: v / 10, key: 'v10' + v, how: ['Dividing by 10 takes the zero off the end.', v + ' ÷ 10 = ' + B(v / 10) + '.'], wrong: [v / 10 + 1, v, v - 10, v / 10 + 10] }; }
  if (d === 1) { if (R.chance(.5)) { const q = R.i(2, 10), v = 5 * q; return { type: 'num', text: B(v + ' ÷ 5 = ?'), ans: q, key: 'v5' + v, how: ['Double it: ' + v + ' × 2 = ' + (2 * v) + '.', 'Then divide by 10: ' + (2 * v) + ' ÷ 10 = ' + B(q) + '.'], wrong: [q + 1, q - 1, v / 5 * 2, v - 5].filter(x => x !== q) }; }
    let v; do { v = R.i(21, 98); } while (v % 2 || Math.floor(v / 10) % 2 === 0 || v % 10 === 0); const t = Math.floor(v / 10) * 10, o = v % 10;
    return { type: 'num', text: 'What is ' + B('half of ' + v) + '?', ans: v / 2, key: 'vh' + v, how: ['Split ' + v + ' into ' + t + ' and ' + o + '.', 'Half of ' + t + ' is ' + (t / 2) + '. Half of ' + o + ' is ' + (o / 2) + '.', (t / 2) + ' + ' + (o / 2) + ' = ' + B(v / 2) + '.'], wrong: [v / 2 + 5, v / 2 - 5, v / 2 + 1, t / 2] }; }
  const c = R.i(0, 2);
  if (c === 0) { const v = R.i(11, 99) * 10; return { type: 'num', text: B(n(v) + ' ÷ 10 = ?'), ans: v / 10, key: 'v10' + v, how: ['Dividing by 10 takes the zero off the end.', n(v) + ' ÷ 10 = ' + B(v / 10) + '.'], wrong: [v / 100, v / 10 + 10, v / 10 - 1, v] }; }
  if (c === 1) { const q = R.i(11, 30), v = 5 * q; return { type: 'num', text: B(v + ' ÷ 5 = ?'), ans: q, key: 'v5' + v, how: ['Double it: ' + v + ' × 2 = ' + (2 * v) + '.', 'Then divide by 10: ' + (2 * v) + ' ÷ 10 = ' + B(q) + '.'], wrong: [q + 1, q - 1, q * 2, q + 10] }; }
  let v; do { v = R.i(11, 89) * 10; } while (v % 20 === 0 && R.chance(.5)); const hh = Math.floor(v / 100) * 100, rest = v - hh;
  const how = hh % 200 === 0 ? ['Half of ' + n(v) + ' is the same as half of ' + (v / 10) + ' tens.', 'Half of ' + (v / 10) + ' is ' + (v / 20) + ', so half of ' + n(v) + ' is ' + B(v / 2) + '.'] : ['Split ' + n(v) + ' into ' + n(hh) + ' and ' + rest + '.', 'Half of ' + n(hh) + ' is ' + (hh / 2) + '. Half of ' + rest + ' is ' + (rest / 2) + '.', (hh / 2) + ' + ' + (rest / 2) + ' = ' + B(v / 2) + '.'];
  if (hh === 0) how.splice(0, how.length, 'Half of ' + v + ' is ' + B(v / 2) + '.');
  return { type: 'num', text: 'What is ' + B('half of ' + n(v)) + '?', ans: v / 2, key: 'vh' + v, how, wrong: [v / 2 + 50, v / 2 - 50, v / 2 + 10, v / 2 - 5].filter(x => x > 0) };
}, { req: [] });
L('factfam', 'Fact families', 'Three numbers make four facts. If 6 × 7 = 42, then 7 × 6 = 42, 42 ÷ 7 = 6 and 42 ÷ 6 = 7. Know the times fact and you know the division.', (d, R) => {
  const a = R.i(2, 9), b = R.i(2, 9), p = a * b;
  if (d === 0) { if (R.chance(.5)) return { type: 'num', text: 'If ' + B(a + ' × ' + b + ' = ' + p) + ', then ' + B(p + ' ÷ ' + b + ' = ?'), ans: a, key: 'ff' + a + b, how: ['These numbers are a fact family: ' + a + ', ' + b + ' and ' + p + '.', p + ' ÷ ' + b + ' undoes × ' + b + ', so the answer is ' + B(a) + '.'], wrong: [b, p - b, a + 1, a - 1].filter(x => x > 0 && x !== a) };
    return { type: 'num', text: 'If ' + B(a + ' × ' + b + ' = ' + p) + ', then ' + B(b + ' × ' + a + ' = ?'), ans: p, key: 'ft' + a + b, how: ['Turn-around facts give the same answer.', b + ' × ' + a + ' = ' + B(p) + '.'], wrong: [p + a, p - b, a + b, p + 1] }; }
  if (d === 1) return { type: 'num', text: B(p + ' ÷ ' + a + ' = ?'), ans: b, key: 'fd' + p + '/' + a, how: ['Think: ' + a + ' × what = ' + p + '?', a + ' × ' + b + ' = ' + p + ', so ' + p + ' ÷ ' + a + ' = ' + B(b) + '.'], wrong: [b + 1, b - 1, a === b ? b + 2 : a, p - a].filter(x => x > 0 && x !== b) };
  const f = R.i(0, 2), text = f === 0 ? '? × ' + b + ' = ' + p : f === 1 ? a + ' × ? = ' + p : p + ' ÷ ? = ' + b, ans = f === 1 ? b : a;
  return { type: 'num', text: B(text), ans, key: 'fm' + f + a + b, how: [f === 2 ? 'Think: what times ' + b + ' = ' + p + '?' : 'Think: ' + p + ' ÷ ' + (f === 0 ? b : a) + ' = ?', a + ' × ' + b + ' = ' + p + ', so the missing number is ' + B(ans) + '.'], wrong: [ans + 1, ans - 1, p - (f === 1 ? a : b), ans + 2].filter(x => x > 0 && x !== ans) };
});
L('remain', 'Leftovers (remainders)', 'Find the biggest times fact that fits, then see what is left over. 17 ÷ 5: 5 × 3 = 15 fits, 17 ' + MINUS + ' 15 = 2 left over, so 3 r 2.', (d, R) => {
  if (d < 2) { const dv = d === 0 ? R.i(2, 5) : R.i(3, 9), q = d === 0 ? R.i(2, 5) : R.i(2, 9), r = R.i(1, dv - 1), v = dv * q + r;
    return { type: 'rem', meta: { v, dv, q, r }, text: B(v + ' ÷ ' + dv + ' = ?') + ' Use r for the leftovers.', vis: d === 0 ? groupsSVG(q, dv, r).replace('class="groups"', 'class="groups"') : '', ans: { q, r }, key: 'r' + v + '/' + dv,
      say: v + ' divided by ' + dv + '. Say how many, and how many are left over.', how: ['Find the biggest ' + dv + 's fact that fits under ' + v + ': ' + dv + ' × ' + q + ' = ' + (dv * q) + '.', v + ' ' + MINUS + ' ' + (dv * q) + ' = ' + r + ' left over.', 'So ' + v + ' ÷ ' + dv + ' = ' + B(q + ' r ' + r) + '.'],
      wrong: [{ q: q + 1, r }, { q, r: r + 1 < dv ? r + 1 : r - 1 }, { q: q - 1, r: r + dv }, { q: r, r: q }].filter(x => x.q > 0 && x.r >= 0 && !(x.q === q && x.r === r)) }; }
  const dv = R.i(3, 8), q = R.i(3, 9), r = R.i(1, dv - 1), v = dv * q + r, w = R.pick([['stickers', 'page', 'pages'], ['eggs', 'box', 'boxes'], ['kids', 'car', 'cars'], ['muffins', 'tray', 'trays']]), ask = R.i(0, 2);
  const text = B(v + ' ' + w[0]) + ', ' + B(dv) + ' fit in each ' + w[1] + '. ' + (ask === 0 ? 'How many ' + w[2] + ' are full?' : ask === 1 ? 'How many ' + w[0] + ' are left over?' : 'How many ' + w[2] + ' do you need for all of them?');
  const ans = ask === 0 ? q : ask === 1 ? r : q + 1;
  return { type: 'num', meta: { v, dv, q, r }, text, ans, key: 'rw' + v + dv + ask, how: [v + ' ÷ ' + dv + ': ' + dv + ' × ' + q + ' = ' + (dv * q) + ', with ' + r + ' left over. So ' + q + ' r ' + r + '.', ask === 0 ? B(q) + ' ' + w[2] + ' are full.' : ask === 1 ? B(r) + ' ' + w[0] + ' are left over.' : 'The ' + r + ' left over need one more ' + w[1] + ', so ' + q + ' + 1 = ' + B(q + 1) + '.'], wrong: [q, r, q + 1, q - 1, dv].filter(x => x !== ans && x >= 0) };
}, { req: [] });
L('divbig', 'Break apart big division', 'Split the big number into parts you can divide easily, then add the answers. 84 ÷ 4: 80 ÷ 4 = 20 and 4 ÷ 4 = 1, so 21.', (d, R) => {
  let dv, q;
  if (d === 0) { dv = R.i(2, 4); do { q = R.i(11, 33); } while (Math.floor(q / 10) * 10 * dv >= 100 || (q % 10) * dv >= 10 || q % 10 === 0); }
  else if (d === 1) { dv = R.i(3, 6); do { q = R.i(12, 29); } while (dv * q >= 100 || (q % 10) * dv < 10); }
  else { dv = R.i(3, 8); q = R.i(21, Math.floor(999 / dv)); if (q % 10 === 0) q++; }
  const v = dv * q, A = dv * Math.floor(q / 10) * 10, Bp = v - A, ans = q;
  return { type: 'num', text: B(v + ' ÷ ' + dv + ' = ?'), ans, key: 'db' + v + '/' + dv, how: ['Split ' + v + ' into ' + A + ' and ' + Bp + '. Both share nicely by ' + dv + '.', A + ' ÷ ' + dv + ' = ' + (A / dv) + '. ' + Bp + ' ÷ ' + dv + ' = ' + (Bp / dv) + '.', (A / dv) + ' + ' + (Bp / dv) + ' = ' + B(ans) + '. Check: ' + dv + ' × ' + ans + ' = ' + v + '.'], wrong: [ans + 1, ans - 1, ans + 10, ans - 10, A / dv + Bp].filter(x => x > 0 && x !== ans) };
});

/* Telling time */
function readOrSet(R, h, m, o) {
  o = o || {}; const set = o.set != null ? o.set : R.chance(.4), words = o.words, wrong = clockWrong(h, m), say = words ? words : fmtT(h, m);
  if (set) return { meta: { h, m }, type: 'clockset', text: 'Set the clock to ' + B(words || fmtT(h, m)) + '.', textPick: 'Which clock shows ' + B(words || fmtT(h, m)) + '?', ans: { h, m }, snap: o.snap || 5, key: 'cs' + h + ':' + m, how: o.setHow, wrong, say: 'Set the clock to ' + say };
  if (words && R.chance(.5)) return { meta: { h, m }, type: 'time', text: 'What time is ' + B(words) + '?', ans: { h, m }, key: 'cw' + h + ':' + m, how: o.wordHow || o.readHow, wrong };
  return { meta: { h, m }, type: 'time', text: 'What time does the clock show?', vis: clockSVG(h, m, { fives: o.fives }), ans: { h, m }, key: 'cr' + h + ':' + m, how: o.readHow, wrong };
}
function clockWrong(h, m) {
  const out = [{ h: h % 12 + 1, m }, { h: h === 1 ? 12 : h - 1, m }, { h, m: (m + 30) % 60 }, { h, m: (60 - m) % 60 }];
  if (m % 5 === 0 && m) out.unshift({ h: m / 5, m: (h % 12) * 5 });
  if (m >= 30) out.unshift({ h: h % 12 + 1, m });
  return out.filter(x => x.h >= 1 && x.h <= 12 && x.m >= 0 && x.m < 60 && !(x.h === h && x.m === m));
}
const hourWord = h => ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][h];
L('oclock', 'O\'clock and half past', 'The short hand shows the hour. The long hand shows the minutes. Long hand on the 12: o\'clock. Long hand on the 6: half past, which is 30 minutes.', (d, R) => {
  const h = R.i(1, 12), m = d === 0 ? 0 : d === 1 ? 30 : R.pick([0, 30]), words = d === 2 ? (m ? 'half past ' + h : h + ' o\'clock') : null;
  return readOrSet(R, h, m, { words, readHow: ['The short hand is the hour hand. It points ' + (m ? 'halfway between the ' + h + ' and the ' + (h % 12 + 1) : 'right at the ' + h) + ', so the hour is ' + h + '.', 'The long hand points to the ' + (m ? '6, so it is half past (30 minutes).' : '12, so it is o\'clock.'), 'It is ' + B(fmtT(h, m)) + '.'], setHow: ['Put the long hand on the ' + (m ? '6' : '12') + '.', 'Put the short hand ' + (m ? 'halfway between the ' + h + ' and the ' + (h % 12 + 1) : 'on the ' + h) + '.', 'That shows ' + B(fmtT(h, m)) + '.'], wordHow: [(m ? 'Half past ' + h + ' means 30 minutes after ' + h + ' o\'clock.' : h + ' o\'clock means ' + h + ' hours and 0 minutes.'), 'So it is ' + B(fmtT(h, m)) + '.'] });
});
L('quarter', 'Quarter past and quarter to', 'Long hand on the 3: quarter past, :15. Long hand on the 9: quarter to the next hour, :45. At quarter to, the short hand is close to the next number, but the hour has not changed yet.', (d, R) => {
  const h = R.i(1, 12), m = d === 0 ? 15 : d === 1 ? 45 : R.pick([15, 45, 30, 0]), nx = h % 12 + 1;
  const words = d === 2 ? (m === 15 ? 'quarter past ' + h : m === 45 ? 'quarter to ' + nx : m === 30 ? 'half past ' + h : h + ' o\'clock') : null;
  const readHow = m === 45 ? ['The long hand is on the 9. That is 45 minutes, a quarter of an hour before ' + nx + ' o\'clock.', 'The short hand is almost at the ' + nx + ' but has not reached it, so the hour is still ' + h + '.', 'It is ' + B(fmtT(h, m)) + ' (quarter to ' + nx + ').'] : m === 15 ? ['The long hand is on the 3. That is 15 minutes, a quarter past the hour.', 'The short hand has just passed the ' + h + '.', 'It is ' + B(fmtT(h, m)) + ' (quarter past ' + h + ').'] : ['The long hand is on the ' + (m ? 6 : 12) + '.', 'It is ' + B(fmtT(h, m)) + '.'];
  const wordHow = m === 45 ? ['Quarter to ' + nx + ' means 15 minutes before ' + nx + ' o\'clock.', '15 minutes before ' + nx + ':00 is ' + B(fmtT(h, 45)) + '.'] : m === 15 ? ['Quarter past ' + h + ' means 15 minutes after ' + h + ' o\'clock.', 'That is ' + B(fmtT(h, 15)) + '.'] : readHow;
  return readOrSet(R, h, m, { words, readHow, wordHow, setHow: ['Put the long hand on the ' + { 0: 12, 15: 3, 30: 6, 45: 9 }[m] + '.', 'Put the short hand ' + (m === 0 ? 'on the ' + h : m === 45 ? 'almost at the ' + nx : 'just past the ' + h) + '.', 'That shows ' + B(fmtT(h, m)) + '.'] });
});
L('fivemin', 'Count by 5s around the clock', 'Each number on the clock is 5 more minutes for the long hand: 1 is 5, 2 is 10, 3 is 15, all the way to 11, which is 55. Count by 5s from the 12.', (d, R) => {
  const h = R.i(1, 12); let m; do { m = R.i(1, 11) * 5; } while ([15, 30, 45].includes(m) && R.chance(.7));
  const k = m / 5, cnt = Array.from({ length: Math.min(k, 6) }, (_, i) => (i + 1) * 5).join(', ') + (k > 6 ? ', … ' + m : '');
  const words = d === 2 ? (m < 30 ? m + ' minutes past ' + h : (60 - m) + ' minutes to ' + (h % 12 + 1)) : null;
  return readOrSet(R, h, m, { fives: d === 0, words, readHow: ['The long hand points to the ' + k + '. Count by 5s from the 12: ' + cnt + '.', 'The short hand has passed the ' + h + (m >= 40 ? ' and is getting close to the ' + (h % 12 + 1) : '') + ', so the hour is ' + h + '.', 'It is ' + B(fmtT(h, m)) + '.'], setHow: [m + ' minutes: count by 5s to ' + m + ' and put the long hand on the ' + k + '.', 'Put the short hand just past the ' + h + '.', 'That shows ' + B(fmtT(h, m)) + '.'], wordHow: m < 30 ? [m + ' minutes past ' + h + ' means ' + m + ' minutes after ' + h + ' o\'clock.', 'That is ' + B(fmtT(h, m)) + '.'] : [(60 - m) + ' minutes to ' + (h % 12 + 1) + ' means ' + (60 - m) + ' minutes before ' + (h % 12 + 1) + ' o\'clock.', '60 ' + MINUS + ' ' + (60 - m) + ' = ' + m + ', so it is ' + B(fmtT(h, m)) + '.'] });
}, { req: [] });
L('tominute', 'Time to the minute', 'Count by 5s to the last number the long hand passed, then count on by 1s for each little mark. Then look at the short hand: the hour is the number it most recently passed.', (d, R) => {
  const h = R.i(1, 12); let m;
  if (d === 0) m = R.i(1, 5) * 5 + R.i(1, 4); else if (d === 1) { do { m = R.i(1, 58); } while (m % 5 === 0); } else { do { m = R.i(46, 59); } while (m % 5 === 0); }
  const k = Math.floor(m / 5), extra = m % 5;
  return readOrSet(R, h, m, { snap: 1, set: d === 2 ? R.chance(.5) : R.chance(.3), readHow: ['Count by 5s to the ' + (k || 12) + ': ' + (5 * k) + ' minutes.', 'Count on the little marks: ' + Array.from({ length: extra }, (_, i) => 5 * k + i + 1).join(', ') + '. That is ' + m + ' minutes.', 'The short hand ' + (m >= 45 ? 'is close to the ' + (h % 12 + 1) + ' but has not reached it, so the hour is still ' + h : 'has passed the ' + h) + '. It is ' + B(fmtT(h, m)) + '.'], setHow: ['Count by 5s to ' + (5 * k) + ' (the ' + (k || 12) + '), then ' + extra + ' little ' + plural(extra, 'mark') + ' more for ' + m + '.', 'Put the short hand ' + (m >= 45 ? 'almost at the ' + (h % 12 + 1) : 'past the ' + h) + '.', 'That shows ' + B(fmtT(h, m)) + '.'] });
});
L('timefacts', 'Minutes and hours', '1 hour = 60 minutes. Half an hour = 30 minutes. A quarter of an hour = 15 minutes. 1 minute = 60 seconds. 1 day = 24 hours.', (d, R) => {
  const Q = (text, ans, how, wrong) => ({ type: 'num', text, ans, how, key: 'tf' + text.replace(/<[^>]+>/g, ''), wrong: wrong || [ans + 10, ans - 10, ans + 30, 100].filter(x => x > 0 && x !== ans) });
  if (d === 0) return R.pick([
    () => Q('How many minutes are in ' + B('1 hour') + '?', 60, ['The long hand goes all the way around once in an hour, past 60 little marks.', '1 hour = ' + B(60) + ' minutes.'], [100, 30, 12, 24]),
    () => Q('How many minutes are in ' + B('half an hour') + '?', 30, ['An hour is 60 minutes. Half of 60 is ' + B(30) + '.'], [50, 15, 60, 45]),
    () => Q('How many minutes are in ' + B('a quarter of an hour') + '?', 15, ['A quarter is one of 4 equal parts. 60 ÷ 4 = ' + B(15) + '.', 'On the clock, the long hand goes from the 12 to the 3.'], [25, 30, 45, 4]),
    () => Q('How many seconds are in ' + B('1 minute') + '?', 60, ['1 minute = ' + B(60) + ' seconds, the same number as minutes in an hour.'], [100, 30, 10, 24]),
    () => Q('How many hours are in ' + B('1 day') + '?', 24, ['A day has 12 hours of AM and 12 hours of PM.', '12 + 12 = ' + B(24) + '.'], [12, 60, 7, 100]),
    () => { const h = R.i(1, 11); return Q('How many minutes from ' + B(h + ':00') + ' to ' + B((h + 1) + ':00') + '?', 60, ['From one o\'clock to the next is 1 hour.', '1 hour = ' + B(60) + ' minutes.'], [100, 1, 30, 12]); }])();
  if (d === 1) return R.pick([
    () => { const h = R.i(2, 4); return Q(B(h + ' hours') + ' = how many minutes?', 60 * h, ['Each hour is 60 minutes.', h + ' × 60 = ' + B(60 * h) + '.'], [100 * h, 60 * h + 60, 60 * h - 60, 60 + h]); },
    () => { const m = R.pick([15, 20, 30, 45, 10]); return Q(B('1 hour ' + m + ' minutes') + ' = how many minutes?', 60 + m, ['1 hour is 60 minutes.', '60 + ' + m + ' = ' + B(60 + m) + '.'], [100 + m, 1 + m, 60 + m + 10, 60 - m]); },
    () => { const t = R.pick([75, 80, 90, 100, 105, 70, 95]); return Q(B(t + ' minutes') + ' = 1 hour and how many minutes?', t - 60, ['1 hour is 60 minutes.', t + ' ' + MINUS + ' 60 = ' + B(t - 60) + '.'], [t - 50, t - 100 > 0 ? t - 100 : t - 40, t - 70, 60]); },
    () => Q(B('Half an hour and a quarter of an hour') + ' = how many minutes?', 45, ['Half an hour is 30 minutes. A quarter of an hour is 15 minutes.', '30 + 15 = ' + B(45) + '.'], [35, 50, 60, 75])])();
  return R.pick([
    () => { const h = R.i(2, 4), m = R.i(1, 10) * 5; return Q(B(h + ' hours ' + m + ' minutes') + ' = how many minutes?', 60 * h + m, [h + ' hours = ' + h + ' × 60 = ' + (60 * h) + ' minutes.', (60 * h) + ' + ' + m + ' = ' + B(60 * h + m) + '.'], [100 * h + m, 60 * h + m + 60, 60 * h - m, 60 + m]); },
    () => { const h = R.i(2, 3), m = R.i(1, 11) * 5, t = 60 * h + m; return Q(B(t + ' minutes') + ' = ' + h + ' hours and how many minutes?', m, [h + ' hours = ' + (60 * h) + ' minutes.', t + ' ' + MINUS + ' ' + (60 * h) + ' = ' + B(m) + '.'], [t - 100 * h > 0 ? t - 100 * h : m + 20, m + 10, m + 60, 60 - m].filter(x => x !== m && x > 0)); },
    () => { const k = R.i(2, 3); return Q('How many hours are in ' + B(k + ' days') + '?', 24 * k, ['Each day is 24 hours.', k + ' × 24 = ' + B(24 * k) + '.'], [12 * k, 24 * k + 24, 60 * k, 24 + k]); },
    () => { const mm = R.i(2, 3), s = R.pick([15, 30, 45]); return Q(B(mm + ' minutes ' + s + ' seconds') + ' = how many seconds?', 60 * mm + s, ['Each minute is 60 seconds: ' + mm + ' × 60 = ' + (60 * mm) + '.', (60 * mm) + ' + ' + s + ' = ' + B(60 * mm + s) + '.'], [100 * mm + s, 60 * mm, 60 * mm + s + 60, mm * s]); }])();
});
L('elapsed', 'How much later?', 'To find how long, hop forward on the clock. Go to the next o\'clock first, then add whole hours, then the minutes that are left. Add the hops.', (d, R) => {
  const h1 = R.i(1, 9);
  if (d === 0) { const c = R.chance(.5); let m1, h2, m2;
    if (c) { m1 = R.i(1, 11) * 5; h2 = h1 + 1; m2 = 0; } else { m1 = 0; h2 = h1; m2 = R.i(1, 11) * 5; }
    const ans = (h2 - h1) * 60 + m2 - m1;
    return { type: 'num', unit: 'minutes', meta: { h1, m1, h2, m2 }, text: 'How many minutes from ' + B(fmtT(h1, m1)) + ' to ' + B(fmtT(h2, m2)) + '?', vis: '<div class="clock-pair"><div>' + clockSVG(h1, m1, { cls: 'sm' }) + '<span>Start</span></div><div>' + clockSVG(h2, m2, { cls: 'sm' }) + '<span>End</span></div></div>', ans, key: 'el' + h1 + m1 + h2 + m2,
      how: c ? ['From :' + pad2(m1) + ' to the next o\'clock, the long hand goes from the ' + (m1 / 5) + ' around to the 12.', 'Count by 5s: ' + (60 - m1) + ' minutes. 60 ' + MINUS + ' ' + m1 + ' = ' + B(60 - m1) + '.'] : ['From ' + h1 + ':00 the long hand moves to the ' + (m2 / 5) + '.', 'Count by 5s: ' + B(m2) + ' minutes.'], howVis: minHops(T.min(h1, m1), [ans]), wrong: [ans + 5, ans - 5, m1 || m2, 60 - ans].filter(x => x > 0 && x !== ans) }; }
  if (d === 1) { const m1 = R.i(7, 11) * 5, m2 = R.i(1, 8) * 5, h2 = h1 + 1, ans = 60 - m1 + m2;
    return { type: 'num', unit: 'minutes', meta: { h1, m1, h2, m2 }, text: 'How many minutes from ' + B(fmtT(h1, m1)) + ' to ' + B(fmtT(h2, m2)) + '?', vis: '<div class="clock-pair"><div>' + clockSVG(h1, m1, { cls: 'sm' }) + '<span>Start</span></div><div>' + clockSVG(h2, m2, { cls: 'sm' }) + '<span>End</span></div></div>', ans, key: 'el' + h1 + m1 + m2,
      how: ['Hop to the next o\'clock: ' + fmtT(h1, m1) + ' → ' + h2 + ':00 is ' + (60 - m1) + ' minutes.', 'Then ' + h2 + ':00 → ' + fmtT(h2, m2) + ' is ' + m2 + ' minutes.', (60 - m1) + ' + ' + m2 + ' = ' + B(ans) + ' minutes.'], howVis: minHops(T.min(h1, m1), [60 - m1, m2]), wrong: [ans + 10, ans - 10, m2 - m1 > 0 ? m2 - m1 : ans + 5, 60 + m2 - m1 + 10, ans + 60].filter(x => x > 0 && x !== ans) }; }
  const m1 = R.i(1, 11) * 5, dh = R.i(1, 2), m2 = R.i(0, 11) * 5, h2 = h1 + dh + (m2 < m1 ? 1 : 0), tot = (h2 - h1) * 60 + m2 - m1, ans = { h: Math.floor(tot / 60), m: tot % 60 };
  let steps, hops;
  if (m2 >= m1) { steps = [fmtT(h1, m1) + ' → ' + fmtT(h2, m1) + ' is ' + (h2 - h1) + ' ' + plural(h2 - h1, 'hour') + '.', fmtT(h2, m1) + ' → ' + fmtT(h2, m2) + ' is ' + (m2 - m1) + ' minutes.']; hops = [(h2 - h1) * 60, m2 - m1].filter(x => x); }
  else { const mid = h2 - h1 - 1; steps = [fmtT(h1, m1) + ' → ' + (h1 + 1) + ':00 is ' + (60 - m1) + ' minutes.'].concat(mid ? [(h1 + 1) + ':00 → ' + h2 + ':00 is ' + mid + ' ' + plural(mid, 'hour') + '.'] : [], [h2 + ':00 → ' + fmtT(h2, m2) + ' is ' + m2 + ' minutes.', (60 - m1) + ' + ' + m2 + ' = ' + (60 - m1 + m2) + ' minutes' + (60 - m1 + m2 >= 60 ? ' = 1 hour ' + (60 - m1 + m2 - 60) + ' minutes' : '') + '.']); hops = [60 - m1, mid * 60, m2].filter(x => x); }
  steps.push('Altogether: ' + B(ans.h + ' ' + plural(ans.h, 'hour') + ' ' + ans.m + ' minutes') + ' (' + fmtT(ans.h, ans.m) + ').');
  return { type: 'time', dur: true, meta: { h1, m1, h2, m2 }, text: 'How long is it from ' + B(fmtT(h1, m1)) + ' to ' + B(fmtT(h2, m2)) + '? Type hours then minutes.', ans, key: 'el2' + h1 + m1 + h2 + m2, how: steps, howVis: minHops(T.min(h1, m1), hops),
    wrong: [{ h: ans.h + 1, m: ans.m }, { h: ans.h, m: (ans.m + 30) % 60 }, { h: Math.max(0, ans.h - 1), m: ans.m }, { h: h2 - h1, m: Math.abs(m2 - m1) }].filter(x => !(x.h === ans.h && x.m === ans.m)) };
}, { req: [] });
L('later', 'What time will it be?', 'Hop forward to the next o\'clock first, then add the minutes that are left. It is 3:40. In 35 minutes? 3:40 → 4:00 is 20 minutes, 15 more makes 4:15. After 12 comes 1.', (d, R) => {
  let h = R.i(1, 12), m, k;
  if (d === 0) { m = R.pick([0, 30]); k = R.pick([30, 60, 120, 15]); }
  else if (d === 1) { m = R.i(4, 11) * 5; k = R.i(Math.max(2, 13 - m / 5), 11) * 5; }
  else { m = R.i(6, 11) * 5; k = R.i(1, 2) * 60 + R.i(2, 9) * 5; if (R.chance(.4)) h = R.pick([11, 12]); }
  const r = T.add(h, m, k), kTxt = T.words(k);
  let steps, hops; const toTop = 60 - m;
  if (m === 0 || k < toTop) { steps = [fmtT(h, m) + ' plus ' + kTxt + '.', 'The time is ' + B(fmtT(r.h, r.m)) + '.']; hops = [k]; }
  else { const rest = k - toTop; steps = ['Hop to the next o\'clock: ' + fmtT(h, m) + ' + ' + toTop + ' minutes → ' + (h % 12 + 1) + ':00.' + (h === 12 ? ' (After 12 comes 1.)' : ''), 'You still have ' + T.words(rest) + ' to go: ' + (h % 12 + 1) + ':00 → ' + B(fmtT(r.h, r.m)) + '.']; hops = [toTop, rest]; }
  const set = d < 2 && R.chance(.3);
  return { type: set ? 'clockset' : 'time', snap: 5, meta: { h, m, k, dir: 1 }, text: 'It is ' + B(fmtT(h, m)) + '. ' + (set ? 'Set the clock to the time ' + B(kTxt + ' later') + '.' : 'What time will it be in ' + B(kTxt) + '?'), textPick: 'It is ' + B(fmtT(h, m)) + '. ' + (set ? 'Which clock shows the time ' + B(kTxt + ' later') + '?' : 'What time will it be in ' + B(kTxt) + '?'), vis: set ? '' : clockSVG(h, m, { cls: 'sm' }), ans: r, key: 'lt' + h + m + k, how: steps, howVis: minHops(T.min(h, m), hops), wrong: [{ h: r.h % 12 + 1, m: r.m }, { h: r.h === 1 ? 12 : r.h - 1, m: r.m }, { h: r.h, m: (r.m + 10) % 60 }, { h, m: (m + k) % 60 }].filter(x => !(x.h === r.h && x.m === r.m)) };
});
L('earlier', 'What time was it? AM and PM', 'To go back in time, hop back to the o\'clock first, then keep going. AM is from midnight to noon (the morning). PM is from noon to midnight (afternoon and night).', (d, R) => {
  if (d === 0) { const ev = R.pick([['You eat breakfast at 7:00', 'AM'], ['You eat dinner at 6:00', 'PM'], ['School starts at 8:00', 'AM'], ['You go to bed at 8:30', 'PM'], ['The sun comes up at 6:45', 'AM'], ['You get home from school at 3:30', 'PM'], ['Soccer practice after school at 5:00', 'PM'], ['You wake up at 7:15', 'AM'], ['Lunch at 12:15, just after noon', 'PM'], ['The stars come out at 9:00', 'PM']]);
    return { type: 'choice', opts: ['AM', 'PM'], ans: ev[1], text: ev[0] + '. Is that ' + B('AM') + ' or ' + B('PM') + '?', key: 'ap' + ev[0], how: ['AM is from midnight to noon: night time and the morning. PM is from noon to midnight: afternoon and evening.', 'That happens in the ' + (ev[1] === 'AM' ? 'morning' : /noon/.test(ev[0]) ? 'afternoon' : 'afternoon or evening') + ', so it is ' + B(ev[1]) + '.'] }; }
  let h = R.i(1, 12), m, k;
  if (d === 1) { m = R.i(1, 5) * 5; k = R.i(m / 5 + 1, 11) * 5; }
  else { m = R.i(0, 5) * 5; k = R.i(1, 2) * 60 + R.i(1, 9) * 5; if (R.chance(.4)) h = R.pick([12, 1]); }
  const r = T.add(h, m, -k), kTxt = T.words(k);
  let steps, hops;
  if (m === 0) { steps = ['Go back ' + kTxt + ' from ' + fmtT(h, m) + '.', 'The time was ' + B(fmtT(r.h, r.m)) + '.']; hops = [-k]; }
  else { const rest = k - m; steps = ['Hop back to the o\'clock: ' + fmtT(h, m) + ' → ' + h + ':00 is ' + m + ' minutes.', 'Go back ' + T.words(rest) + ' more: ' + h + ':00 → ' + B(fmtT(r.h, r.m)) + '.' + (h === 1 || (h === 12 && rest >= 60) ? ' (Before 1 comes 12.)' : '')]; hops = [-m, -rest]; }
  return { type: 'time', meta: { h, m, k, dir: -1 }, text: 'It is ' + B(fmtT(h, m)) + '. What time was it ' + B(kTxt + ' ago') + '?', vis: clockSVG(h, m, { cls: 'sm' }), ans: r, key: 'ea' + h + m + k, how: steps, howVis: minHops(T.min(h, m), hops), wrong: [{ h: r.h % 12 + 1, m: r.m }, { h: r.h === 1 ? 12 : r.h - 1, m: r.m }, T.add(h, m, k), { h: r.h, m: (r.m + 10) % 60 }].filter(x => !(x.h === r.h && x.m === r.m)) };
});

/* Money */
L('coins', 'Know your coins', 'Penny 1¢, nickel 5¢, dime 10¢, quarter 25¢. The dime is the smallest coin but it is worth more than a nickel or a penny. 100¢ make a dollar.', (d, R) => {
  if (d === 0) { const id = R.pick(['p', 'n', 'd', 'q', 'd', 'n']), c = COIN[id];
    return { type: 'money', fmt: 'c', meta: { coins: [id] }, text: 'How much is this coin worth?', vis: '<div class="coins one">' + coinSVG(id, true) + '</div>', ans: c.v, key: 'cv' + id, say: 'How much is this coin worth? It is a ' + c.name, how: ['This is a ' + B(c.name) + '. Look for the words on it: "' + c.t.join(' ') + '".', 'A ' + c.name + ' is worth ' + B(c.v + '¢') + '.'].concat(id === 'd' ? ['The dime is small, but it is worth more than the bigger nickel.'] : []), wrong: [1, 5, 10, 25, 50].filter(v => v !== c.v) }; }
  if (d === 1) return R.pick([
    () => { const pr = R.pick([['p', 'n'], ['p', 'd'], ['p', 'q'], ['n', 'd'], ['n', 'q'], ['d', 'q']]), a = COIN[pr[0]], b = COIN[pr[1]], k = b.v / a.v; return k % 1 ? null : { type: 'num', text: 'How many ' + B(a.many) + ' make ' + B('one ' + b.name) + '?', ans: k, key: 'cm' + pr, how: ['A ' + b.name + ' is ' + b.v + '¢ and a ' + a.name + ' is ' + a.v + '¢.', 'Count by ' + a.v + 's to ' + b.v + ': ' + Array.from({ length: Math.min(k, 6) }, (_, i) => (i + 1) * a.v).join(', ') + (k > 6 ? ', … ' + b.v : '') + '. That is ' + B(k) + '.'], wrong: [k + 1, k - 1, b.v, a.v].filter(x => x > 0 && x !== k) }; },
    () => { const x = R.i(2, 4), y = R.i(3, 6), A = x * 10, Bv = y * 5; if (A === Bv) return null; return { type: 'choice', opts: [x + ' dimes', y + ' nickels'], ans: A > Bv ? x + ' dimes' : y + ' nickels', text: 'Which is worth more: ' + B(x + ' dimes') + ' or ' + B(y + ' nickels') + '?', key: 'cw' + x + y, how: [x + ' dimes: count by 10s → ' + A + '¢. ' + y + ' nickels: count by 5s → ' + Bv + '¢.', (A > Bv ? x + ' dimes' : y + ' nickels') + ' is worth more (' + Math.max(A, Bv) + '¢).'] }; }
  ])() || { type: 'num', text: 'How many ' + B('pennies') + ' make ' + B('one dime') + '?', ans: 10, key: 'cm-pd', how: ['A dime is 10¢ and a penny is 1¢.', 'So ' + B(10) + ' pennies make a dime.'], wrong: [5, 2, 25] };
  return R.pick([
    () => { const id = R.pick(['q', 'd', 'n']), c = COIN[id], k = 100 / c.v; return { type: 'num', text: 'How many ' + B(c.many) + ' make ' + B('one dollar') + '?', ans: k, key: 'cd' + id, how: ['One dollar is 100¢. A ' + c.name + ' is ' + c.v + '¢.', 'Count by ' + c.v + 's to 100: ' + Array.from({ length: Math.min(k, 5) }, (_, i) => (i + 1) * c.v).join(', ') + (k > 5 ? ', … 100' : '') + '. That is ' + B(k) + '.'], wrong: [k + 1, k - 1, k * 2, 100 / k > 4 ? 4 : 10].filter(x => x !== k) }; },
    () => { const set = R.shuffle(['q', 'q', 'd', 'n', 'd', 'p']).slice(0, R.i(2, 3)), v = sum(set.map(id => COIN[id].v)); return { type: 'money', fmt: 'c', meta: { coins: set.slice() }, text: B(coinNames(set)) + ': how much is that?', vis: coinsRow(set), ans: v, key: 'cs' + set.sort().join(''), how: ['Start with the biggest coin and count on.', countOn(set) + '. That is ' + B(v + '¢') + '.'], wrong: [v + 5, v - 5, v + 10, set.length].filter(x => x > 0 && x !== v) }; }])();
});
function randomCoins(R, d) {
  if (d === 0) { const id = R.pick(['d', 'n', 'd', 'q', 'p']), k = id === 'q' ? R.i(2, 4) : R.i(3, 8); return Array(k).fill(id); }
  if (d === 1) { const pr = R.pick([['d', 'p'], ['d', 'n'], ['q', 'd'], ['q', 'p'], ['n', 'p'], ['q', 'n']]); let list; do { list = Array(R.i(1, 3)).fill(pr[0]).concat(Array(R.i(1, 4)).fill(pr[1])); } while (sum(list.map(id => COIN[id].v)) >= 100); return R.shuffle(list); }
  let list; do { list = Array(R.i(1, 4)).fill('q').concat(Array(R.i(1, 3)).fill('d'), Array(R.i(0, 2)).fill('n'), Array(R.i(1, 4)).fill('p')); } while (sum(list.map(id => COIN[id].v)) > 160); return R.shuffle(list);
}
L('countcoins', 'Count coins', 'Sort the coins, biggest first. Count quarters by 25s, then count on dimes by 10s, nickels by 5s and pennies by 1s.', (d, R) => {
  const list = randomCoins(R, d), v = sum(list.map(id => COIN[id].v));
  return { type: 'money', fmt: v >= 100 ? 'd' : 'c', meta: { coins: list }, text: 'How much money is this?', vis: coinsRow(list), ans: v, key: 'cc' + list.slice().sort().join(''), say: 'How much money is this? ' + coinNames(list),
    how: ['Sort them, biggest first: ' + coinNames(list) + '.', 'Count on: ' + countOn(list) + '.', 'Total: ' + B(fmtM(v)) + '.'], wrong: [v + 5, v - 5, v + 10, v - 10, list.length, v + 1].filter(x => x > 0 && x !== v) };
}, { req: [] });
function wrongSets(R, target, allowed, k) {
  const out = [], seen = new Set([greedy(target, allowed).join()]); const deltas = R.shuffle([1, -1, 5, -5, 10, -10, 25, -25, 2, -2]);
  for (const dl of deltas) { if (out.length >= k) break; const t = target + dl; if (t <= 0) continue; const s = R.chance(.5) ? altSet(R, t, allowed) : greedy(t, allowed); const kk = s.join(); if (!seen.has(kk) && s.length) { seen.add(kk); out.push(s); } }
  return out;
}
function altSet(R, t, allowed) { const g = greedy(t, allowed), i = g.findIndex(id => id === 'q' || id === 'd' || id === 'b1'); if (i < 0) return g; const id = g[i], rep = id === 'b1' ? ['q', 'q', 'q', 'q'] : id === 'q' ? ['d', 'd', 'n'] : ['n', 'n']; const out = g.slice(0, i).concat(rep.filter(x => allowed.includes(x)), g.slice(i + 1)); return sum(out.map(x => COIN[x].v)) === t ? out.sort((a, b) => COIN[b].v - COIN[a].v) : g; }
L('makeamt', 'Make an amount', 'Start with the biggest coin that fits, then add smaller coins and count on until you reach the amount.', (d, R) => {
  const allowed = d === 0 ? ['d', 'n', 'p'] : d === 1 ? ['q', 'd', 'n', 'p'] : ['b1', 'q', 'd', 'n', 'p'];
  const target = d === 0 ? R.i(11, 30) : d === 1 ? R.i(31, 99) : R.i(10, 25) * 10 + R.pick([0, 5, 2, 7]), g = greedy(target, allowed), correct = R.chance(.5) ? altSet(R, target, allowed) : g;
  return { type: 'coins', coinSet: allowed, text: 'Make ' + B(fmtM(target)) + '. Tap the coins to add them.', textPick: 'Which coins make ' + B(fmtM(target)) + '?', ans: target, key: 'ma' + target, sets: [correct].concat(wrongSets(R, target, allowed, 3)),
    how: ['Start with the biggest coin that fits: ' + coinNames(g) + '.', 'Count on: ' + countOn(g) + '.'], showTotal: true };
}, { req: [] });
L('dollars', 'Dollars and cents', '100¢ is one dollar. The dot separates dollars from cents: $2.35 is 2 dollars and 35 cents. 135¢ is $1.35.', (d, R) => {
  if (d === 0) { const c = R.i(1, 4) * 100 + R.i(1, 99);
    if (R.chance(.5)) return { type: 'money', fmt: 'd', text: B(c + '¢') + ' is how many dollars and cents?', ans: c, key: 'dc' + c, how: ['100¢ is one dollar.', c + '¢ = ' + (Math.floor(c / 100) * 100) + '¢ + ' + (c % 100) + '¢ = ' + Math.floor(c / 100) + ' ' + plural(Math.floor(c / 100), 'dollar') + ' and ' + (c % 100) + ' cents.', 'Write it with a dot: ' + B(fmtD(c)) + '.'], wrong: [c * 10, Math.floor(c / 10), c + 100, c - 100].filter(x => x > 0) };
    return { type: 'money', fmt: 'c', text: B(fmtD(c)) + ' is how many cents?', ans: c, key: 'cd' + c, how: ['Each dollar is 100¢. ' + Math.floor(c / 100) + ' ' + plural(Math.floor(c / 100), 'dollar') + ' = ' + (Math.floor(c / 100) * 100) + '¢.', (Math.floor(c / 100) * 100) + '¢ + ' + (c % 100) + '¢ = ' + B(c + '¢') + '.'], wrong: [c + 100, c - 100, c % 100, Math.floor(c / 100) + c % 100].filter(x => x > 0 && x !== c) }; }
  if (d === 1) { const bills = R.i(1, 3), coins = randomCoins(R, 1), list = Array(bills).fill('b1').concat(coins), v = sum(list.map(id => COIN[id].v));
    return { type: 'money', fmt: 'd', meta: { coins: list }, text: 'How much money is this?', vis: coinsRow(list), ans: v, key: 'dm' + list.join(''), say: 'How much money is this? ' + coinNames(list), how: ['Count the dollars first: ' + bills + ' ' + plural(bills, 'dollar') + ' = ' + fmtD(bills * 100) + '.', 'Then the coins: ' + countOn(coins) + '.', 'Together: ' + B(fmtD(v)) + '.'], wrong: [v + 100, v - 100, v + 10, v - 5, v - bills * 100 + bills].filter(x => x > 0 && x !== v) }; }
  return R.pick([
    () => { const c = R.i(2, 9) * 100 + R.i(1, 9); return { type: 'money', fmt: 'c', text: B(fmtD(c)) + ' is how many cents?', ans: c, key: 'cz' + c, how: [fmtD(c) + ' is ' + Math.floor(c / 100) + ' dollars and ' + (c % 100) + ' cents. Watch the 0: it means no dimes.', (Math.floor(c / 100) * 100) + '¢ + ' + (c % 100) + '¢ = ' + B(c + '¢') + '.'], wrong: [Math.floor(c / 100) * 100 + (c % 100) * 10, c + 10, Math.floor(c / 100) + c % 100, c * 10] }; },
    () => { const a = R.i(1, 4) * 100 + R.i(1, 9) * 10, b = Math.floor(a / 100) * 100 + R.i(1, 9) + (R.chance(.5) ? 0 : 100); if (a === b) return null; return { type: 'choice', opts: [fmtD(a), b + '¢'], ans: a > b ? fmtD(a) : b + '¢', text: 'Which is more: ' + B(fmtD(a)) + ' or ' + B(b + '¢') + '?', key: 'dw' + a + b, how: ['Make them match. ' + b + '¢ = ' + fmtD(b) + '.', 'Compare ' + fmtD(a) + ' and ' + fmtD(b) + ': ' + B(a > b ? fmtD(a) : b + '¢') + ' is more.'] }; },
    () => { const dl = R.i(2, 9), dm = R.i(0, 9), pn = R.i(1, 9), c = dl * 100 + dm * 10 + pn; return { type: 'money', fmt: 'd', text: B(dl + ' dollars, ' + dm + ' dimes and ' + pn + ' pennies') + ': how much is that?', ans: c, key: 'dp' + c, how: [dl + ' dollars = ' + fmtD(dl * 100) + '. ' + dm + ' dimes = ' + (dm * 10) + '¢. ' + pn + ' pennies = ' + pn + '¢.', 'Together: ' + B(fmtD(c)) + '.'], wrong: [dl * 100 + pn * 10 + dm, c + 10, c - 1 > 0 ? c + 1 : c + 2, dl * 100 + dm + pn] }; }])() || { type: 'money', fmt: 'c', text: B('$3.05') + ' is how many cents?', ans: 305, key: 'cz305', how: ['$3.05 is 3 dollars and 5 cents.', '300¢ + 5¢ = ' + B('305¢') + '.'], wrong: [350, 35, 315] };
}, { req: [] });
L('addprice', 'Add prices', 'Add the dollars, then the cents. If the cents go past 100, that makes another dollar. Prices like $2.99 are almost $3: add $3, then take 1¢ back.', (d, R) => {
  const items = R.shuffle(ITEMS);
  if (d === 0) { const a = R.i(2, 6) * 5, b = R.i(2, 18 - a / 5) * 5, ans = a + b; return { type: 'money', fmt: 'c', text: 'How much for the ' + items[0][1] + ' and the ' + items[1][1] + '?', vis: tagsHTML([[...items[0], a], [...items[1], b]]), ans, key: 'ap' + a + b, how: ['Add the prices: ' + a + '¢ + ' + b + '¢.', 'Tens first: ' + a + ' + ' + (Math.floor(b / 10) * 10) + ' = ' + (a + Math.floor(b / 10) * 10) + ', then + ' + (b % 10) + ' = ' + B(ans + '¢') + '.'], wrong: [ans + 10, ans - 10, ans + 5, ans - 5] }; }
  if (d === 1) { const a = R.i(9, 18) * 5, b = R.i(Math.max(4, 21 - a / 5), 18) * 5, ans = a + b; return { type: 'money', fmt: 'd', text: 'How much for the ' + items[0][1] + ' and the ' + items[1][1] + '?', vis: tagsHTML([[...items[0], a], [...items[1], b]]), ans, key: 'ap1' + a + b, how: [a + '¢ needs ' + (100 - a) + '¢ to make $1.00. Split ' + b + '¢ into ' + (100 - a) + '¢ and ' + (b - 100 + a) + '¢.', '$1.00 + ' + (ans - 100) + '¢ = ' + B(fmtD(ans)) + '.'], wrong: [ans + 10, ans - 10, ans - 100, ans + 100] }; }
  if (R.chance(.5)) { const a = R.i(1, 4) * 100 + R.pick([99, 98, 95]), b = R.i(1, 3) * 100 + R.i(1, 9) * 10, F = Math.ceil(a / 100) * 100, k = F - a, ans = a + b; return { type: 'money', fmt: 'd', text: 'How much for the ' + items[0][1] + ' and the ' + items[1][1] + '?', vis: tagsHTML([[...items[0], a], [...items[1], b]]), ans, key: 'ap2' + a + b, how: [fmtD(a) + ' is ' + k + '¢ less than ' + fmtD(F) + '.', fmtD(F) + ' + ' + fmtD(b) + ' = ' + fmtD(F + b) + '.', 'Take back the ' + k + '¢: ' + B(fmtD(ans)) + '.'], wrong: [ans + k, ans - k, ans + 100, ans + 10] }; }
  const a = R.i(1, 3) * 100 + 25, c = R.i(0, 2) * 100 + 75, b = R.i(1, 2) * 100 + R.i(1, 9) * 10, ans = a + b + c;
  return { type: 'money', fmt: 'd', text: 'How much for all three?', vis: tagsHTML([[...items[0], a], [...items[1], b], [...items[2], c]]), ans, key: 'ap3' + a + b + c, how: ['Find friends: ' + fmtD(a) + ' + ' + fmtD(c) + ' = ' + fmtD(a + c) + ' (25¢ + 75¢ make a dollar).', fmtD(a + c) + ' + ' + fmtD(b) + ' = ' + B(fmtD(ans)) + '.'], wrong: [ans + 100, ans - 100, ans + 10, ans - 50] };
}, { req: [] });
L('change1', 'Making change: count up', 'Count up from the price to the money you paid, the way a cashier does. Paid $1 for 65¢: 65¢ → 75¢ is 10¢, 75¢ → $1.00 is 25¢. Change: 35¢.', (d, R) => {
  let price, paid;
  if (d === 0) { paid = 100; price = R.i(10, 19) * 5; }
  else if (d === 1) { paid = 100; do { price = R.i(11, 94); } while (price % 5 === 0); }
  else if (R.chance(.5)) { paid = 50; price = R.i(11, 44); } else { paid = 200; price = R.i(11, 19) * 10 + R.pick([0, 5]); }
  const ans = paid - price, hops = []; let at = price; const steps = [];
  const up = (to) => { if (to > at) { hops.push(to - at); steps.push(fmtM(at) + ' → ' + fmtM(to) + ' is ' + fmtM(to - at) + '.'); at = to; } };
  if (at % 5) up(Math.ceil(at / 5) * 5); if (at % 10) up(at + 5); if (at % 25 && paid - at > 25 && Math.ceil(at / 25) * 25 - at <= 20) up(Math.ceil(at / 25) * 25); if (paid > 100 && at < 100) up(100); up(paid);
  const it = R.pick(ITEMS);
  return { type: 'money', fmt: 'c', meta: { price, paid }, text: 'The ' + it[1] + ' costs ' + B(fmtM(price)) + '. You pay ' + B(fmtM(paid)) + '. How much change do you get?', vis: tagsHTML([[...it, price]]), ans, key: 'c1' + price + paid, how: ['Count up from ' + fmtM(price) + ' to ' + fmtM(paid) + '.'].concat(steps, ['Change: ' + (hops.length > 1 ? hops.map(fmtM).join(' + ') + ' = ' : '') + B(fmtM(ans)) + '.']), howVis: hopsSVG(price, hops, { fmt: fmtM, lab: fmtM }), wrong: [ans + 10, ans - 10, ans + 5, ans - 5, ans + 1].filter(x => x > 0 && x !== ans) };
}, { req: [] });
L('fewest', 'Fewest coins', 'To use the fewest coins, take the biggest coin you can, as many times as it fits, then the next biggest. 40¢ = quarter + dime + nickel: 3 coins.', (d, R) => {
  const allowed = d === 0 ? ['d', 'n', 'p'] : d === 1 ? ['q', 'd', 'n', 'p'] : ['b1', 'q', 'd', 'n', 'p'];
  let target; do { target = d === 0 ? R.i(11, 29) : d === 1 ? R.i(30, 99) : R.i(101, 199); } while (greedy(target, allowed).length < 3 || altSet(R, target, allowed).length === greedy(target, allowed).length && d > 0 && false);
  const g = greedy(target, allowed), others = [];
  const alts = [altSet(R, target, allowed)]; let x = g.slice(); for (let i = 0; i < 4; i++) { const j = x.findIndex(id => id !== 'p' && id !== 'n'); if (j < 0) break; const id = x[j]; x = x.slice(0, j).concat(id === 'b1' ? ['q', 'q', 'q', 'q'] : id === 'q' ? ['d', 'd', 'n'] : ['n', 'n'], x.slice(j + 1)); alts.push(x.slice()); }
  const pen = g.slice(); const ni = pen.lastIndexOf('n'); if (ni >= 0) { pen.splice(ni, 1, 'p', 'p', 'p', 'p', 'p'); alts.push(pen); }
  const seen = new Set([g.join()]); for (const a of alts) { const k = a.slice().sort((p, q) => COIN[q].v - COIN[p].v); if (!seen.has(k.join()) && sum(k.map(id => COIN[id].v)) === target) { seen.add(k.join()); others.push(k); } }
  return { type: 'coins', fewest: true, coinSet: allowed, text: 'Make ' + B(fmtM(target)) + ' with the ' + B('fewest coins') + ' you can.', textPick: 'Which shows ' + B(fmtM(target)) + ' with the ' + B('fewest coins') + '?', ans: target, best: g.length, key: 'fw' + target, sets: [g].concat(others.slice(0, 3)),
    how: ['Biggest coin first, as many as fit: ' + coinNames(g) + '.', 'Count on: ' + countOn(g) + '. That is ' + B(g.length + ' ' + (d === 2 ? 'bills and coins' : 'coins')) + '.'], showTotal: true };
}, { req: [] });
L('change5', 'Change from $5, $10 and $20', 'Count up to the next whole dollar first, then count the dollars. $5 for $3.40: $3.40 → $4.00 is 60¢, $4.00 → $5.00 is $1. Change: $1.60.', (d, R) => {
  let price, paid;
  if (d === 0) { paid = R.pick([500, 1000]); price = R.i(1, paid / 100 - 1) * 100; }
  else if (d === 1) { paid = R.pick([500, 1000]); price = R.i(1, paid / 100 - 1) * 100 + R.i(1, 19) * 5; }
  else { paid = R.pick([1000, 2000]); price = R.i(paid / 200, paid / 100 - 1) * 100 + R.pick([99, 95, 65, 45, 15, 29, 79]); }
  const ans = paid - price, nd = Math.ceil(price / 100) * 100, steps = [], hops = [];
  if (nd > price) { steps.push(fmtD(price) + ' → ' + fmtD(nd) + ' is ' + fmtM(nd - price) + '.'); hops.push(nd - price); }
  if (paid > nd) { steps.push(fmtD(nd) + ' → ' + fmtD(paid) + ' is ' + fmtD(paid - nd) + '.'); hops.push(paid - nd); }
  const it = R.pick(ITEMS);
  return { type: 'money', fmt: 'd', meta: { price, paid }, text: 'The ' + it[1] + ' costs ' + B(fmtD(price)) + '. You pay with ' + B(fmtD(paid)) + '. How much change?', vis: tagsHTML([[...it, price]]), ans, key: 'c5' + price + paid, how: ['Count up from ' + fmtD(price) + ' to ' + fmtD(paid) + '.'].concat(steps, ['Change: ' + B(fmtD(ans)) + '.']), howVis: hopsSVG(price, hops, { fmt: fmtD, lab: fmtM }), wrong: [ans + 100, ans - 100, ans + 10, ans - 10, paid - nd].filter(x => x > 0 && x !== ans) };
});
L('budget', 'Shopping math', 'Use times to find the cost of several things. To see how many you can buy, count up by the price until you run out of money.', (d, R) => {
  const it = R.pick(ITEMS);
  if (d === 0) { const k = R.i(2, 5), p = R.i(1, 5) * 5, ans = k * p; return { type: 'money', fmt: ans >= 100 ? 'd' : 'c', text: 'One ' + it[1] + ' costs ' + B(p + '¢') + '. How much for ' + B(k) + '?', ans, key: 'bu' + k + p, how: [k + ' at ' + p + '¢ each is ' + k + ' × ' + p + '.', 'Count by ' + p + 's: ' + Array.from({ length: k }, (_, i) => (i + 1) * p).join(', ') + '. That is ' + B(fmtM(ans)) + '.'], wrong: [ans + p, ans - p, k + p, ans + 10].filter(x => x > 0 && x !== ans) }; }
  if (d === 1) { if (R.chance(.6)) { const p = R.pick([20, 25, 35, 40, 30, 15]), have = R.pick([100, 200]), k = Math.floor(have / p), left = have - k * p; return { type: 'num', text: 'A ' + it[1] + ' costs ' + B(p + '¢') + '. You have ' + B(fmtD(have)) + '. How many can you buy?', ans: k, key: 'bk' + p + have, how: ['Count up by ' + p + '¢ until you would go past ' + fmtD(have) + ': ' + Array.from({ length: k }, (_, i) => fmtM((i + 1) * p)).join(', ') + '.', 'That is ' + B(k) + plural(k, ' ' + it[1], ' ' + it[1] + 's') + (left ? ', with ' + left + '¢ left over.' : ' and nothing left over.')], wrong: [k + 1, k - 1, have / 10, k + 2].filter(x => x > 0 && x !== k) }; }
    const cost = R.i(11, 19) * 10 + R.pick([0, 5]), have = R.i(5, 9) * 10 + R.pick([0, 5]), ans = cost - have; return { type: 'money', fmt: 'c', text: 'The ' + it[1] + ' costs ' + B(fmtD(cost)) + '. You have ' + B(have + '¢') + '. How much more do you need?', ans, key: 'bm' + cost + have, how: ['Count up from ' + have + '¢ to ' + fmtD(cost) + '.', have + '¢ → $1.00 is ' + (100 - have) + '¢. $1.00 → ' + fmtD(cost) + ' is ' + (cost - 100) + '¢.', (100 - have) + '¢ + ' + (cost - 100) + '¢ = ' + B(ans + '¢') + '.'], howVis: hopsSVG(have, [100 - have, cost - 100], { fmt: fmtM, lab: fmtM }), wrong: [ans + 10, ans - 10, ans + 100, cost - have - 5].filter(x => x > 0 && x !== ans) }; }
  return R.pick([
    () => { const k = R.i(3, 6), p = R.pick([125, 150, 175, 225, 250]), ans = k * p; return { type: 'money', fmt: 'd', text: 'One ' + it[1] + ' costs ' + B(fmtD(p)) + '. How much for ' + B(k) + '?', ans, key: 'bd' + k + p, how: ['Split the price: ' + fmtD(p) + ' = $' + Math.floor(p / 100) + ' and ' + (p % 100) + '¢.', k + ' × $' + Math.floor(p / 100) + ' = ' + fmtD(k * Math.floor(p / 100) * 100) + '. ' + k + ' × ' + (p % 100) + '¢ = ' + fmtM(k * (p % 100)) + '.', fmtD(k * Math.floor(p / 100) * 100) + ' + ' + fmtM(k * (p % 100)) + ' = ' + B(fmtD(ans)) + '.'], wrong: [ans + p, ans - p, ans + 100, k * Math.floor(p / 100) * 100 + p % 100] }; },
    () => { const p = R.pick([60, 45, 70, 35, 80]), have = 500, k = Math.floor(have / p), left = have - k * p; return { type: 'num', text: 'One ' + it[1] + ' costs ' + B(p + '¢') + '. How many can you buy with ' + B('$5.00') + '?', ans: k, key: 'bf' + p, how: ['$5.00 is 500¢. Count up by ' + p + ': ' + Array.from({ length: k }, (_, i) => (i + 1) * p).join(', ') + '.', 'One more would be ' + ((k + 1) * p) + '¢, too much. So ' + B(k) + (left ? ', with ' + left + '¢ left.' : '.')], wrong: [k + 1, k - 1, 5, k + 2].filter(x => x !== k) }; },
    () => { const have = R.i(3, 9) * 100 + R.pick([0, 50, 25]), cost = R.i(1, Math.floor(have / 100) - 1) * 100 + R.pick([75, 25, 50, 99]), ans = have - cost; if (ans <= 0) return null; return { type: 'money', fmt: 'd', text: 'You have ' + B(fmtD(have)) + '. You buy a ' + it[1] + ' for ' + B(fmtD(cost)) + '. How much is left?', ans, key: 'bl' + have + cost, how: ['Count up from ' + fmtD(cost) + ' to ' + fmtD(have) + '.', fmtD(cost) + ' → ' + fmtD(Math.ceil(cost / 100) * 100) + ' is ' + fmtM(Math.ceil(cost / 100) * 100 - cost) + ', then ' + fmtD(Math.ceil(cost / 100) * 100) + ' → ' + fmtD(have) + ' is ' + fmtD(have - Math.ceil(cost / 100) * 100) + '.', 'Left: ' + B(fmtD(ans)) + '.'], wrong: [ans + 100, ans - 100 > 0 ? ans - 100 : ans + 50, ans + 10, have + cost] }; }])() || { type: 'money', fmt: 'd', text: 'One book costs ' + B('$1.25') + '. How much for ' + B(4) + '?', ans: 500, key: 'bd4125', how: ['4 × $1 = $4.00 and 4 × 25¢ = $1.00.', '$4.00 + $1.00 = ' + B('$5.00') + '.'], wrong: [425, 400, 525] };
}, { req: [] });

/* ---------- strands and the path through them ---------- */
const STRANDS = [
  { id: 'add', name: 'Adding in Your Head', short: 'Adding', icon: '+', skills: ['bond10', 'make10', 'doubles', 'add9', 'addtens', 'bond100', 'split', 'friendly', 'nearhund'] },
  { id: 'sub', name: 'Taking Away in Your Head', short: 'Taking away', icon: MINUS, skills: ['thinkadd', 'sub9', 'subtens', 'from100', 'countup', 'subsplit', 'samediff'] },
  { id: 'pat', name: 'Patterns', short: 'Patterns', icon: '…', skills: ['skip1', 'oddeven', 'addrule', 'skip2', 'hundred', 'growpat', 'rulemachine'] },
  { id: 'num', name: 'Number Sense', short: 'Numbers', icon: '#', skills: ['placeval', 'tenmore', 'round', 'estimate'] },
  { id: 'mul', name: 'Times Tricks', short: 'Times', icon: '×', skills: ['groups', 'x2510', 'x48', 'x9', 'x36', 'x7sq', 'xtens', 'x1112', 'breakapart', 'dblhalf'] },
  { id: 'div', name: 'Dividing', short: 'Dividing', icon: '÷', skills: ['share', 'div2510', 'factfam', 'remain', 'divbig'] },
  { id: 'time', name: 'Telling Time', short: 'Time', icon: '◷', skills: ['oclock', 'quarter', 'fivemin', 'tominute', 'timefacts', 'elapsed', 'later', 'earlier'] },
  { id: 'money', name: 'Money', short: 'Money', icon: '$', skills: ['coins', 'countcoins', 'makeamt', 'dollars', 'addprice', 'change1', 'fewest', 'change5', 'budget'] }
];
/* the suggested order across strands ("Up next"): basics of every strand first, then each one a step further */
const ORDER = ['skip1', 'bond10', 'oddeven', 'placeval', 'coins', 'oclock', 'make10', 'doubles', 'tenmore', 'countcoins', 'quarter', 'addrule', 'thinkadd', 'groups', 'x2510', 'add9', 'sub9', 'addtens', 'subtens', 'fivemin', 'makeamt', 'skip2', 'round', 'bond100', 'from100', 'share', 'x48', 'dollars', 'tominute', 'split', 'countup', 'hundred', 'x9', 'x36', 'div2510', 'timefacts', 'addprice', 'change1', 'friendly', 'growpat', 'subsplit', 'samediff', 'x7sq', 'factfam', 'elapsed', 'fewest', 'estimate', 'rulemachine', 'xtens', 'nearhund', 'later', 'change5', 'x1112', 'remain', 'earlier', 'breakapart', 'dblhalf', 'budget', 'divbig'];
/* lessons that need one from another strand first (one star there) */
const REQ = { groups: ['skip1'], share: ['x2510'], countcoins: ['skip1'], fivemin: ['skip1'], change1: ['countup'], addprice: ['split'], budget: ['x2510'], divbig: ['breakapart'], elapsed: ['countup'], hundred: ['tenmore'] };
STRANDS.forEach(st => st.skills.forEach((id, i) => { S[id].strand = st.id; S[id].idx = i; S[id].req = REQ[id] || []; }));

/* ---------- making, showing and checking problems ---------- */
function sayOf(html) { return html.replace(/<[^>]+>/g, '').replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(new RegExp(MINUS, 'g'), ' minus ').replace(/\?/g, ' what ').replace(/=/g, ' equals ').replace(/¢/g, ' cents').replace(/\s+/g, ' ').trim(); }
function gen(id, d, R) {
  R = R || makeR(); const s = S[id];
  for (let k = 0; k < 30; k++) { const p = s.gen(d, R); if (!p) continue; p.skill = id; p.d = d; p.how = p.how || []; p.say = p.say || sayOf(p.textPick && p.type === 'coins' ? p.text : p.text); return p; }
  throw new Error('no problem from ' + id);
}
function eqAns(p, v) {
  if (v == null) return false;
  switch (p.type) {
    case 'num': case 'money': return typeof v === 'number' && Math.abs(v - p.ans) < 1e-9;
    case 'choice': return v === p.ans;
    case 'time': return v.h === p.ans.h && v.m === p.ans.m;
    case 'clockset': return (v.h % 12) === (p.ans.h % 12) && v.m === p.ans.m;
    case 'rem': return v.q === p.ans.q && v.r === p.ans.r;
    case 'coins': { if (!Array.isArray(v)) return false; const t = sum(v.map(id => COIN[id] ? COIN[id].v : 0)); return t === p.ans && (!p.fewest || v.length === p.best); }
  }
  return false;
}
/* typed answers: what the keypad's string means for this problem */
function parse(p, raw) {
  raw = String(raw || '').trim(); if (!raw) return null;
  if (p.type === 'num') return /^\d+$/.test(raw) ? +raw : null;
  if (p.type === 'money') { if (p.fmt === 'c') return /^\d+$/.test(raw) ? +raw : null; if (!/^\d*(\.\d{0,2})?$/.test(raw) || raw === '.') return null; return Math.round(parseFloat(raw) * 100); }
  if (p.type === 'time') { if (!/^\d{1,4}$/.test(raw)) return null; if (raw.length <= 2) return { h: +raw, m: 0 }; return { h: +raw.slice(0, -2), m: +raw.slice(-2) }; }
  if (p.type === 'rem') { const m = raw.match(/^(\d+)\s*r\s*(\d+)$/); if (m) return { q: +m[1], r: +m[2] }; return /^\d+$/.test(raw) ? { q: +raw, r: 0 } : null; }
  return null;
}
function rawFor(p, v) { v = v === undefined ? p.ans : v; if (p.type === 'num') return String(v); if (p.type === 'money') return p.fmt === 'c' ? String(v) : (v / 100).toFixed(2); if (p.type === 'time') return v.h + pad2(v.m); if (p.type === 'rem') return v.q + 'r' + v.r; return v; }
function ansText(p, v) {
  v = v === undefined ? p.ans : v;
  switch (p.type) {
    case 'num': return n(v) + (p.unit ? ' ' + p.unit : '');
    case 'money': return p.fmt === 'c' ? v + '¢' : fmtD(v);
    case 'time': case 'clockset': return p.dur ? v.h + ' h ' + v.m + ' min' : fmtT(v.h, v.m);
    case 'rem': return v.q + ' r ' + v.r;
    case 'choice': return v;
    case 'coins': return fmtM(p.ans);
  }
  return String(v);
}
/* four answers to pick from: the right one and three likely mistakes */
function choices(p, R) {
  R = R || makeR();
  if (p.type === 'choice') return p.opts.map(o => ({ html: o, ok: o === p.ans, v: o }));
  if (p.type === 'coins') { const sets = p.sets.slice(0, 4).map((s, i) => ({ html: coinsRow(s), ok: i === 0, v: s })); return R.shuffle(sets); }
  const key = v => JSON.stringify(v), seen = new Set([key(p.ans)]), out = [{ v: p.ans, ok: true }];
  const valid = v => { if (p.type === 'num' || p.type === 'money') return typeof v === 'number' && isFinite(v) && v >= 0 && v % 1 === 0; if (p.type === 'time' || p.type === 'clockset') return v && v.h >= (p.dur ? 0 : 1) && v.h <= 12 && v.m >= 0 && v.m < 60; if (p.type === 'rem') return v && v.q >= 0 && v.r >= 0; return true; };
  for (const w of (p.wrong || []).concat(fallback(p, R))) { if (out.length >= 4) break; if (!valid(w) || seen.has(key(w))) continue; seen.add(key(w)); out.push({ v: w, ok: false }); }
  return R.shuffle(out).map(c => ({ v: c.v, ok: c.ok, html: p.type === 'clockset' ? clockSVG(c.v.h, c.v.m, { cls: 'pick' }) : ansText(p, c.v) }));
}
function fallback(p, R) {
  const a = p.ans, out = [];
  if (p.type === 'num' || p.type === 'money') { for (const k of [1, 2, 10, 5, 3, 20, 4, 100]) out.push(a + k, a - k); }
  else if (p.type === 'time' || p.type === 'clockset') { for (const k of [5, 10, 60, 15, 30, 120]) out.push(T.add(a.h || 12, a.m, k), T.add(a.h || 12, a.m, -k)); if (p.dur) out.push({ h: a.h + 1, m: a.m }, { h: a.h, m: (a.m + 5) % 60 }, { h: a.h + 2, m: a.m }); }
  else if (p.type === 'rem') { for (const k of [1, 2, 3]) out.push({ q: a.q + k, r: a.r }, { q: a.q, r: a.r + k }, { q: Math.max(0, a.q - k), r: a.r }); }
  return out;
}

const API = { T, n, B, MINUS, pad2, seqHTML, tenFrame, dotsSVG, groupsSVG, compHow, coinNames, countOn, S, STRANDS, ORDER, REQ, gen, choices, eqAns, parse, rawFor, ansText, makeR, clockSVG, coinSVG, coinsRow, hopsSVG, COIN, COIN_ORDER, greedy, fmtM, fmtD, fmtT, sum, mulHow };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.MW = API;
})(typeof window !== 'undefined' ? window : this);
