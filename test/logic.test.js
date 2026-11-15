/* Merge rules: node logic.test.js */
const assert = require('assert');
(async () => {
  const { mergeState, lowersProgress } = await import('../worker/src/logic.mjs');
  const base = { cur: 10, games: 1, stars: { make10: 1 }, best: { make10: 7 }, sk: { make10: { r: 7, w: 3, t: 100 } }, mist: { bridge10: { n: 1, ok: 0, t: 100 } }, owned: [], char: {}, pre: { done: false, t: 50, st: {} } };
  const mine = { cur: 40, games: 2, stars: { make10: 2 }, best: { make10: 9 }, sk: { make10: { r: 16, w: 4, t: 300 }, doubles: { r: 2, w: 0, t: 300 } }, mist: { bridge10: { n: 2, ok: 1, t: 300 }, regroupAdd: { n: 1, ok: 0, t: 300 } }, owned: ['lagoon:frog'], char: { lagoon: 'frog' }, look: 'candy', pre: { done: true, t: 280, st: {} } };
  const theirs = { cur: 25, games: 3, stars: { make10: 1, coins: 3 }, best: { make10: 8 }, sk: { make10: { r: 9, w: 5, t: 200 } }, mist: { bridge10: { n: 3, ok: 0, t: 200 }, coinValues: { n: 1, ok: 0, t: 200 } }, owned: ['lagoon:seal'], char: { lagoon: 'seal' }, look: 'lagoon', pre: { done: false, t: 60, st: {} } };
  const out = mergeState(mine, theirs, base);
  assert.strictEqual(out.cur, 55, 'treats move by this page\'s delta');
  assert.strictEqual(out.games, 4);
  assert.deepStrictEqual(out.stars, { make10: 2, coins: 3 });
  assert.deepStrictEqual(out.best, { make10: 9 });
  assert.deepStrictEqual(out.sk.make10, { r: 18, w: 6, t: 300 }, 'right/wrong counts add up from both devices');
  assert.deepStrictEqual(out.sk.doubles, { r: 2, w: 0, t: 300 });
  assert.strictEqual(out.mist.bridge10.ok, 1, 'the newer tricky-spot record wins');
  assert.strictEqual(out.mist.bridge10.n, 3, 'miss count keeps the higher number');
  assert.ok(out.mist.regroupAdd && out.mist.coinValues, 'tricky spots from both devices are kept');
  assert.strictEqual(out.pre.done, true, 'the newer placement check wins');
  assert.deepStrictEqual(out.owned.sort(), ['lagoon:frog', 'lagoon:seal']);
  assert.strictEqual(out.char.lagoon, 'frog'); assert.strictEqual(out.look, 'candy');
  /* a redone placement check (newer) replaces a finished older one */
  const redo = mergeState({ pre: { done: false, t: 900, st: {} } }, { pre: { done: true, t: 500, st: {} } }, {});
  assert.strictEqual(redo.pre.done, false);
  /* progress never drops */
  assert.strictEqual(lowersProgress({ stars: { make10: 1 } }, { stars: { make10: 2 } }), true);
  assert.strictEqual(lowersProgress({ stars: { make10: 2 }, owned: [] }, { stars: { make10: 2 }, owned: ['lagoon:frog'] }), true);
  assert.strictEqual(lowersProgress({ stars: { make10: 2 }, cur: 0 }, { stars: { make10: 2 }, cur: 500 }), false, 'spending is allowed');
  assert.strictEqual(lowersProgress(out, theirs), false);
  console.log('logic: 18 checks ok');
})().catch(e => { console.error(e); process.exit(1); });
