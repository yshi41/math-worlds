/* Merge rules: node logic.test.js */
const assert = require('assert');
(async () => {
  const { mergeState, lowersProgress } = await import('../worker/src/logic.mjs');
  let n = 0; const ok = (c, m) => { n++; assert.ok(c, m); }, eq = (a, b, m) => { n++; assert.deepStrictEqual(a, b, m); };
  const base = { cur: 10, games: 1, cs: { a_ten: { lv: 1, st: 1, ml: 0, r: 7, w: 3, t: 100, m: 0, due: 0, iv: 0 } }, mist: { a_make10: { n: 1, ok: 0, t: 100 } }, owned: [], char: {}, pre: { v: 2, done: false, t: 50, st: {} } };
  const mine = { cur: 40, games: 2, cs: { a_ten: { lv: 2, st: 0, ml: 0, r: 16, w: 4, t: 300, m: 300, due: 9e9, iv: 1 }, a_fives: { lv: 0, st: 2, ml: 0, r: 2, w: 0, t: 300, m: 0, due: 0, iv: 0 } }, mist: { a_make10: { n: 2, ok: 1, t: 300 }, a_regroup: { n: 1, ok: 0, t: 300 } }, owned: ['lagoon:frog'], char: { lagoon: 'frog' }, look: 'candy', now: 'a_fives', pre: { v: 2, done: true, t: 280, st: {} } };
  const theirs = { cur: 25, games: 3, stars: { old: 3 }, cs: { a_ten: { lv: 1, st: 2, ml: 1, r: 9, w: 5, t: 200, m: 0, due: 0, iv: 0 }, c_coins: { lv: 2, st: 0, r: 9, w: 0, t: 200, m: 200, due: 5, iv: 1 } }, mist: { a_make10: { n: 3, ok: 0, t: 200 }, c_coins: { n: 1, ok: 0, t: 200 } }, owned: ['lagoon:seal'], char: { lagoon: 'seal' }, look: 'lagoon', pre: { v: 2, done: false, t: 60, st: {} } };
  const out = mergeState(mine, theirs, base);
  eq(out.cur, 55, 'treats move by this page\'s difference'); eq(out.games, 4);
  eq([out.cs.a_ten.r, out.cs.a_ten.w], [18, 6], 'right/wrong counts add up from both devices');
  ok(out.cs.a_ten.m === 300 && out.cs.a_ten.lv === 2, 'the newer copy\'s mastery and level win');
  ok(out.cs.c_coins.m === 200, 'a concept mastered only on the other device stays mastered');
  ok(out.cs.a_fives && out.cs.a_fives.st === 2, 'a concept only this page has is kept');
  ok(!('stars' in out), 'old lesson stars are dropped');
  eq(out.mist.a_make10.ok, 1, 'the newer tricky-spot record wins'); eq(out.mist.a_make10.n, 3, 'miss count keeps the higher number');
  ok(out.mist.a_regroup && out.mist.c_coins, 'tricky spots from both devices are kept');
  eq(out.pre.done, true, 'the newer placement check wins');
  eq(out.owned.sort(), ['lagoon:frog', 'lagoon:seal']); eq(out.char.lagoon, 'frog'); eq(out.look, 'candy'); eq(out.now, 'a_fives');
  /* mastered on one device, an older unmastered record on the other: still mastered */
  const m2 = mergeState({ cs: { x: { lv: 0, r: 1, w: 0, t: 900, m: 0 } } }, { cs: { x: { lv: 2, r: 9, w: 0, t: 500, m: 400, due: 7 } } }, {});
  ok(m2.cs.x.m === 400 && m2.cs.x.lv === 2, 'mastery is never lost in a merge');
  const redo = mergeState({ pre: { v: 2, done: false, t: 900, st: {} } }, { pre: { v: 2, done: true, t: 500, st: {} } }, {});
  eq(redo.pre.done, false, 'a redone placement check (newer) replaces a finished older one');
  /* the round in progress: newer wins, and a finished marker clears an older round */
  const rr = mergeState({ round: { done: true, t: 900 } }, { round: { v: 1, kind: 'learn', t: 500 } }, {});
  eq(rr.round.done, true, 'finishing a round on one device clears it everywhere');
  const r2 = mergeState({ round: { v: 1, kind: 'learn', t: 400 } }, { round: { v: 1, kind: 'review', t: 800 } }, {});
  eq(r2.round.kind, 'review', 'the newer round in progress wins');
  eq(mergeState({ set: { snd: false, voice: true } }, { set: { snd: true } }, {}).set, { snd: false, voice: true }, 'settings follow this page');
  /* the activity log: each device's new answers add up per day */
  const lg = mergeState({ log: { d1: { n: 15, ok: 12, ms: 9000 }, d2: { n: 4, ok: 4, ms: 100 } } }, { log: { d1: { n: 13, ok: 10, ms: 7000 }, d0: { n: 2, ok: 1, ms: 50 } } }, { log: { d1: { n: 10, ok: 8, ms: 5000 } } });
  eq(lg.log.d1, { n: 18, ok: 14, ms: 11000 }, 'each day adds both devices new answers');
  ok(lg.log.d0 && lg.log.d2 && lg.log.d2.n === 4, 'days from both devices are kept');
  const hm = mergeState({ help: [{ id: 'a', t: 1 }, { id: 'b', t: 3 }] }, { help: [{ id: 'a', t: 1 }, { id: 'c', t: 2 }] }, {});
  eq(hm.help.map(h => h.id), ['a', 'c', 'b'], 'help lessons from both devices are kept once each, in time order');
  eq(mergeState({ apace: 1.4 }, { apace: 1 }, {}).apace, 1.4, 'the kid’s pace follows this page');
  /* a concept that slipped in a memory check: the newer copy's lapse and level stand, the first mastery date stays */
  const lp = mergeState({ cs: { x: { lv: 1, r: 12, w: 3, t: 900, m: 400, lx: 900, due: 0 } } }, { cs: { x: { lv: 2, r: 10, w: 2, t: 500, m: 400, due: 7 } } }, { cs: { x: { r: 10, w: 2 } } });
  ok(lp.cs.x.lx === 900 && lp.cs.x.lv === 1 && lp.cs.x.m === 400, 'a lapse from a memory check is kept in a merge');
  const rl = mergeState({ cs: { x: { lv: 2, r: 20, w: 3, t: 1200, m: 400, lx: 0, rm: 1200, due: 9 } } }, { cs: { x: { lv: 1, r: 12, w: 3, t: 900, m: 400, lx: 900 } } }, {});
  ok(!rl.cs.x.lx && rl.cs.x.lv === 2, 'mastering it again clears the lapse everywhere');
  eq(mergeState({ blk: { day: 'd', ms: 600000, t: 900 } }, { blk: { day: 'd', ms: 300000, t: 500 } }, {}).blk.ms, 600000, 'the newer practice block wins');
  eq(mergeState({}, { blk: { day: 'd', ms: 1, t: 5 } }, {}).blk.ms, 1, 'a block from the other device is kept');
  eq(lowersProgress({ cs: { a: { m: 5, lx: 9 } } }, { cs: { a: { m: 5 } } }), false, 'a lapse is not lost progress: the mastery date stays');
  const bm = mergeState({ ppace: 1.4, bhist: [{ t0: 1, n: 20 }, { t0: 3, n: 12 }] }, { ppace: 1, bhist: [{ t0: 1, n: 20 }, { t0: 2, n: 25 }] }, {});
  eq(bm.ppace, 1.4, 'the practice pace follows this page'); eq(bm.bhist.map(b => b.t0), [1, 2, 3], 'finished blocks from both devices are kept once each');
  /* progress never drops */
  eq(lowersProgress({ cs: {} }, { cs: { a_ten: { m: 5 } } }), true, 'losing a mastered concept is refused');
  eq(lowersProgress({ cs: { a_ten: { m: 5 } }, owned: [] }, { cs: { a_ten: { m: 5 } }, owned: ['lagoon:frog'] }), true, 'losing a character is refused');
  eq(lowersProgress({ cs: { a_ten: { m: 5 } }, cur: 0 }, { cs: { a_ten: { m: 5 } }, cur: 500 }), false, 'spending is allowed');
  eq(lowersProgress({ cs: {} }, { stars: { split: 3 } }), false, 'a first-version save with stars can move to concepts');
  eq(lowersProgress(out, theirs), false);
  /* a parent's reset to the latest assessment */
  { const before = { cur: 50, owned: ['lagoon:seal'], cs: { a_ten: { m: 5 }, c_coins: { m: 6 } }, asm: [{ t0: 1, t: 2 }] };
    const reset = { cur: 50, owned: ['lagoon:seal'], cs: { a_ten: { m: 9, pl: 1 } }, reset: { t: 1000 }, asm: [{ t0: 1, t: 3 }] };
    eq(lowersProgress(reset, before), false, 'a newer reset may drop mastered concepts');
    eq(lowersProgress({ ...reset, owned: [] }, before), true, 'a reset never drops characters');
    eq(lowersProgress(before, reset), true, 'a save from before the reset cannot undo it');
    const other = { cur: 70, owned: ['lagoon:seal', 'candy:pig'], cs: { a_ten: { m: 5 }, c_coins: { m: 6 }, m_x9: { m: 7 } }, look: 'lagoon' };
    const m1 = mergeState({ ...reset, look: 'candy' }, other, before);
    ok(m1.reset.t === 1000 && !m1.cs.c_coins && !m1.cs.m_x9 && m1.cur === 70 && m1.owned.includes('candy:pig') && m1.look === 'candy', 'this page reset: the reset stands; the other device\'s treats and characters are kept');
    const stale = { cur: 60, owned: ['lagoon:seal'], cs: { a_ten: { m: 5 }, c_coins: { m: 6 }, m_x9: { m: 8 } }, look: 'candy' };
    const m2 = mergeState(stale, reset, before);
    ok(m2.reset.t === 1000 && !m2.cs.c_coins && !m2.cs.m_x9 && m2.cur === 60 && m2.look === 'candy' && lowersProgress(m2, reset) === false, 'another device reset: this page\'s older progress is dropped, its treats kept');
    const a = mergeState({ ...reset, asm: [{ t0: 1, t: 4 }, { t0: 9, t: 9 }] }, reset, reset);
    eq(a.asm.map(x => x.t0 + ':' + x.t), ['1:4', '9:9'], 'assessment history merges by start time, newer copy wins'); }
  console.log('logic: ' + n + ' checks ok');
})().catch(e => { console.error(e); process.exit(1); });
