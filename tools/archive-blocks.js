/* Sends every block in the current saves to the block archive (/blocks on the save service). The game does this on
   its own from every device; this is for a one-off backfill. node tools/archive-blocks.js */
const fs = require('fs'), path = require('path'), W = 'https://math-worlds-saves.yshi41.workers.dev';
require('../src/core.js'); const dir = path.join(__dirname, '..', 'src', 'concepts');
for (const f of fs.readdirSync(dir).filter(f => /\.js$/.test(f)).sort()) require(path.join(dir, f));
const E = require('../src/engine.js'); E.init();
(async () => { const { players } = await (await fetch(W + '/saves', { cache: 'no-store' })).json();
  for (const id in players) { const L = E.blockList(players[id].state || {}).filter(b => b.q && b.q.length && !b.open);
    if (!L.length) { console.log(id, 'no blocks'); continue; }
    const r = await fetch(W + '/blocks/' + id, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ blocks: L }) });
    const a = await (await fetch(W + '/blocks/' + id, { cache: 'no-store' })).json();
    console.log(id, 'sent', L.length, r.status, await r.text(), 'archive now', a.blocks.length, a.blocks.map(b => b.key + ':' + b.q.length).join(' ')); } })();
