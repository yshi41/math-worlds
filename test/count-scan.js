/* Finds problems whose picture has many objects to count (dots, blocks, coins, grid squares, fraction-bar parts, ticks).
   node test/count-scan.js [--min 11] [--show id]
   Prints, per concept (grades 2-8), the most objects seen in one picture at each level, and one sample text. */
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i < 0 ? null : args[i + 1]; };
const MIN = +(opt('--min') || 11), SHOW = opt('--show');
const C = require('../src/core.js');
const dir = path.join(__dirname, '..', 'src', 'concepts');
for (const f of fs.readdirSync(dir).filter(f => /\.js$/.test(f)).sort()) require(path.join(dir, f));
const strip = s => String(s).replace(/<svg[\s\S]*?<\/svg>/g, ' [pic] ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const KINDS = { dot: /class="dt[ "]/g, tf: /class="tf-[ab]"/g, one: /class="bk-o"/g, ten: /class="bk-t"/g, hund: /class="bk-h"/g, cell: /class="fig-(cell|on)"/g, coin: /class="coin[ "]/g, tick: /class="fig-thin"/g, fdot: /class="fig-dot"/g };
function counts(html) { const o = {}; let tot = 0; for (const k in KINDS) { const m = (html.match(KINDS[k]) || []).length; if (m) { o[k] = m; tot += m; } } o.tot = tot; return o; }
const rows = [];
for (const c of C.LIST) {
  if (c.g > 8) continue;
  for (let d = 0; d < 3; d++) {
    let best = null;
    for (let i = 0; i < 60; i++) {
      const R = C.makeR(1000 + i * 7 + d);
      let p; try { p = C.gen(c.id, d, R); } catch (e) { continue; }
      const html = (p.vis || '') + p.text + (p.parts ? JSON.stringify(p.parts) : '');
      const k = counts(html);
      if (!best || k.tot > best.k.tot) best = { k, p };
      if (SHOW === c.id && i < 4) console.log(d, JSON.stringify(k), '|', strip(p.text).slice(0, 220), '| ans', JSON.stringify(p.ans));
    }
    if (best && best.k.tot >= MIN) rows.push([c.id, c.g, d, best.k, strip(best.p.text).slice(0, 200)]);
  }
}
rows.forEach(r => console.log(r[0], 'g' + r[1], 'L' + r[2], JSON.stringify(r[3]), '|', r[4]));
console.log(rows.length, 'concept-levels with', MIN, '+ objects');
