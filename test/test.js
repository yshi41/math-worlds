/* Headless Chrome checks: node test.js ../index.html
   Every run talks to the in-memory stand-in in mockcloud.js, never to the real save service. */
const puppeteer = require('puppeteer-core');
const path = require('path'), fs = require('fs');
const { create } = require('./mockcloud.js');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const file = path.resolve(process.argv[2] || '../index.html');
const F = 'file:///' + file.split(String.fromCharCode(92)).join('/');
const wait = ms => new Promise(r => setTimeout(r, ms));
let n = 0, failed = 0;
const check = (ok, what) => { n++; if (!ok) { failed++; console.log('  FAIL', what); } };
const until = async (fn, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await fn()) return true; await wait(80); } return false; };

(async () => {
  const html = fs.readFileSync(file, 'utf8');
  check(!/localStorage|sessionStorage|indexedDB/.test(html), 'the page never mentions browser storage');
  check(/MW_CLOUD/.test(html), 'the page names the save service');
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio', '--disable-speech-api', '--disable-gpu'] });
  const errs = [];
  const newPage = async (mock, viewport) => {
    const p = await browser.newPage();
    p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) errs.push('console: ' + m.text()); });
    await p.setViewport(viewport || { width: 1100, height: 860 });
    await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await mock.attach(p);
    await p.evaluateOnNewDocument(() => { window.__storageWrites = 0; for (const k of ['localStorage', 'sessionStorage']) { try { const s = window[k], set = s.setItem.bind(s); s.setItem = (...a) => { window.__storageWrites++; return set(...a); }; } catch (e) {} } });
    await p.goto(F); return p;
  };
  const ev = (p, f, ...a) => p.evaluate(f, ...a);
  const state = (p, id) => ev(p, id => JSON.parse(JSON.stringify(window.__mw.saves[id] || null)), id);
  const answer = async (p, right) => { await ev(p, r => r ? window.__mw.answerRight() : window.__mw.answerWrong(), right); await wait(60); };
  const next = async p => { await ev(p, () => { const b = document.querySelector('#nextQBtn'); if (!b.hidden) b.click(); }); await wait(60); };
  const cur = p => ev(p, () => { const R = window.__mw.RD; if (!R || !R.cur) return null; return { kind: R.cur.kind, skill: R.cur.p.skill, type: R.cur.p.type, phase: R.phase, tries: R.tries, mode: R.cur.mode, qlen: R.queue.length, endQ: R.endQ.length, roundKind: R.kind, nx: R.cur.nx || null }; });

  /* 1. loading */
  const mock = create();
  let p = await newPage(mock);
  await until(() => ev(p, () => !document.querySelector('.profile-card').disabled));
  check(mock.stats.gets === 1, 'one GET loads every save'); check(mock.stats.realHits === 0, 'the real service is never called');
  check(await ev(p, () => document.querySelectorAll('.profile-card').length === 3), 'three players: Charlie, Riley, Yan');

  /* 2. Riley's placement check: she knows the first half of every part */
  await ev(p, () => document.querySelectorAll('.profile-card')[1].click()); await wait(200);
  check(await ev(p, () => !document.querySelector('#preCard').hidden && /3rd grader/.test(document.querySelector('#preText').textContent)), 'Riley sees the placement check for a 3rd grader');
  check(await ev(p, () => document.querySelector('#nextTitle').textContent === 'Placement check'), 'Up next is the placement check');
  await ev(p, () => document.querySelector('#preBtn').click()); await wait(200);
  const first = await cur(p);
  check(first && first.kind === 'pre' && first.nx.strand === 'add' && first.nx.skill === 'doubles', 'a 3rd grader starts Adding at lesson 3 (' + JSON.stringify(first && first.nx) + ')');
  const LEN = await ev(p, () => Object.fromEntries(window.__mw.MW.STRANDS.map(s => [s.id, s.skills])));
  let asked = 0, stoppedOnce = false;
  for (let i = 0; i < 200; i++) {
    const c = await cur(p); if (!c) break; if (c.roundKind !== 'pre') break;
    if (c.phase !== 'ask') { await wait(80); continue; }
    const sk = LEN[c.nx.strand]; const knows = sk.indexOf(c.nx.skill) < sk.length / 2;
    asked++; if (process.env.DBG && asked < 40) console.log(asked, JSON.stringify(c.nx), knows, c.type, c.mode); await answer(p, knows);
    if (asked === 7 && !stoppedOnce) { /* stop part way, come back: the check picks up where it left off */
      stoppedOnce = true; await until(() => cur(p).then(x => x && x.phase === 'ask'), 3000); await ev(p, () => document.querySelector('#quitBtn').click()); await wait(200);
      check(await ev(p, () => !document.querySelector('#hub').hidden && /Continue/.test(document.querySelector('#preBtn').textContent)), 'stopping keeps the placement check to continue');
      await ev(p, () => document.querySelector('#preBtn').click()); await wait(200);
    }
    await until(() => ev(p, () => { const R = window.__mw.RD; return !R || R.phase === 'ask' || !document.querySelector('#results').hidden; }), 4000);
    if (await ev(p, () => !document.querySelector('#results').hidden)) break;
  }
  await until(() => ev(p, () => !document.querySelector('#results').hidden), 5000);
  check(asked >= 30 && asked <= 70, 'the placement check is thorough but not endless (' + asked + ' questions)');
  check(await ev(p, () => document.querySelectorAll('#resPlaces .place').length === 8), 'the results list where all 8 parts start');
  await until(() => ev(p, () => window.__mw.net.idle()));
  let r = mock.store.riley.state;
  check(r.pre && r.pre.done, 'the placement is saved online as done');
  const startAdd = r.pre.st.add.start;
  check(startAdd === Math.ceil(LEN.add.length / 2), 'Adding starts in the middle (' + startAdd + ')');
  check(LEN.add.slice(0, startAdd).every(id => r.stars[id] === 2) && !r.stars[LEN.add[startAdd]], 'lessons before the start count as done (2 stars)');
  check(Object.keys(r.mist).length >= 3, 'the misses became tricky spots (' + Object.keys(r.mist).join(', ') + ')');

  /* 3. the hub after placement */
  await ev(p, () => document.querySelector('#hubBtn').click()); await wait(200);
  check(await ev(p, () => document.querySelector('#preCard').hidden), 'the placement card is gone');
  check(await ev(p, () => document.querySelectorAll('#spots .spot').length >= 1), 'tricky spots show on the hub');
  const nextTitle = await ev(p, () => document.querySelector('#nextTitle').textContent);
  check(nextTitle && nextTitle !== 'Placement check', 'Up next is a lesson (' + nextTitle + ')');

  /* 4. a Solve It lesson: one miss twice → worked shortcut, step-by-step break-down, practice at the end */
  mock.store.riley = { rev: mock.store.riley.rev + 1, state: Object.assign({}, mock.store.riley.state, { stars: Object.assign({}, mock.store.riley.state.stars, { coins: 3 }), cur: (mock.store.riley.state.cur | 0) + 100 }) };
  await ev(p, () => window.__mw.startLesson('split', 'solve')); await wait(150);
  await answer(p, false);
  check(await ev(p, () => !document.querySelector('#feedback').hidden && /Try again/.test(document.querySelector('#feedback').textContent)), 'first miss: try again with a hint');
  await answer(p, false);
  const fbText = await ev(p, () => document.querySelector('#feedback').textContent);
  check(/The answer is/.test(fbText) && /Tricky spot/.test(fbText), 'second miss: the answer, the shortcut and the tricky spot');
  const afterMiss = await cur(p);
  check(afterMiss.qlen >= 2, 'the break-down steps are queued (' + afterMiss.qlen + ')');
  check(afterMiss.endQ >= 1, 'practice for the tricky spot comes at the end');
  check(await ev(p, () => /break it down/i.test(document.querySelector('#nextQBtn').textContent)), 'the button says Let\'s break it down');
  await next(p);
  check((await cur(p)).kind === 'step', 'the next question is a step');
  let mains = 1, steps = 0, fixes = 0;
  for (let i = 0; i < 80; i++) { const c = await cur(p); if (!c || c.roundKind !== 'lesson') break; if (c.phase !== 'ask') { await next(p); continue; } if (c.kind === 'main') mains++; if (c.kind === 'step') steps++; if (c.kind === 'fix') fixes++; await answer(p, true); await next(p); if (await ev(p, () => !document.querySelector('#results').hidden)) break; }
  await until(() => ev(p, () => !document.querySelector('#results').hidden));
  check(mains === 10 && steps >= 2 && fixes >= 1, `10 lesson problems, ${steps} steps, ${fixes} practice problems`);
  check(await ev(p, () => document.querySelectorAll('#resStars .st.on').length === 2), '9 of 10 in Solve It earns 2 stars');
  await until(() => ev(p, () => window.__mw.net.idle()));
  r = mock.store.riley.state;
  check(r.stars.split === 2 && r.stars.coins === 3, 'stars from both devices are kept (' + r.stars.split + ', ' + r.stars.coins + ')');
  check(mock.stats.merges >= 1, 'the service merged the two copies');
  check(r.sk.split && r.sk.split.w >= 1 && r.sk.split.r >= 9, 'progress per lesson is tracked');

  /* 5. fixing a tricky spot from the hub */
  await ev(p, () => document.querySelector('#hubBtn').click()); await wait(150);
  const spot = await ev(p, () => { const s = window.__mw.saves.riley.mist; return Object.keys(s).find(k => s[k].ok < 3); });
  await ev(p, id => window.__mw.startFix(id), spot); await wait(150);
  for (let i = 0; i < 40; i++) { const c = await cur(p); if (!c || c.roundKind !== 'fix') break; if (c.phase !== 'ask') { await next(p); continue; } await answer(p, true); await wait(30); await next(p); if (await ev(p, () => !document.querySelector('#results').hidden)) break; }
  await until(() => ev(p, () => !document.querySelector('#results').hidden));
  const m = (await state(p, 'riley')).mist[spot];
  check(m && m.ok >= 3, 'a practice session with every answer right fixes the tricky spot (' + spot + ')');
  await ev(p, () => document.querySelector('#hubBtn').click()); await wait(150);
  check(await ev(p, id => ![...document.querySelectorAll('#spots .spot-name')].some(e => e.textContent === window.__mw.CO.concept(id).label), spot), 'a fixed spot leaves the hub list');

  /* 6. a fix session where the kid keeps missing adds the idea one step back */
  const deepId = 'regroupAdd';
  await ev(p, () => window.__mw.startFix('regroupAdd')); await wait(150);
  let wrongs = 0;
  for (let i = 0; i < 60; i++) { const c = await cur(p); if (!c || c.roundKind !== 'fix') break; if (c.phase !== 'ask') { await next(p); continue; } if (c.kind === 'prac' && wrongs < 4) { wrongs++; await answer(p, false); await answer(p, false); } else await answer(p, true); await next(p); if (await ev(p, () => !document.querySelector('#results').hidden)) break; }
  await until(() => ev(p, () => !document.querySelector('#results').hidden));
  const st6 = await state(p, 'riley');
  check(st6.mist.bridge10 && st6.mist.bridge10.ok < 3, 'missing carrying practice adds "Making a 10" as the step back');
  check(/one step back/.test(await ev(p, () => document.querySelector('#resNote').textContent)), 'the results say to go one step back');

  /* 7. Pick It: all right earns 1 star only */
  await ev(p, () => window.__mw.startLesson('coins', 'pick')); await wait(150);
  for (let i = 0; i < 40; i++) { const c = await cur(p); if (!c) break; if (c.phase !== 'ask') { await next(p); continue; } await answer(p, true); await next(p); if (await ev(p, () => !document.querySelector('#results').hidden)) break; }
  await until(() => ev(p, () => !document.querySelector('#results').hidden));
  check(await ev(p, () => document.querySelectorAll('#resStars .st.on').length === 1), 'Pick It earns 1 star');

  /* 8. the answer pads: typing a time, typing money, setting a clock, tapping coins */
  const pad = async (skill, d, fn) => { await ev(p, s => window.__mw.startLesson(s, 'solve'), skill); await wait(120); return ev(p, fn); };
  check(await pad('later', 1, () => { const R = window.__mw.RD; let tries = 0; while (R.cur.p.type !== 'time' && tries++ < 20) { R.cur = { p: window.__mw.MW.gen('later', 1), kind: 'main' }; } return true; }), 'time problem ready');
  check(await ev(p, () => { const MWx = window.__mw.MW, p = MWx.gen('elapsed', 2); return MWx.eqAns(p, MWx.parse(p, MWx.rawFor(p))); }), 'durations parse');
  check(await ev(p, () => { const MWx = window.__mw.MW, p = { type: 'time', ans: { h: 3, m: 15 } }; return MWx.eqAns(p, MWx.parse(p, '315')) && !MWx.eqAns(p, MWx.parse(p, '31')); }), 'typing 3 1 5 means 3:15');
  check(await ev(p, () => { const MWx = window.__mw.MW, p = { type: 'money', fmt: 'd', ans: 160 }; return MWx.eqAns(p, MWx.parse(p, '1.60')) && MWx.eqAns(p, MWx.parse(p, '1.6')); }), 'typing 1.60 means $1.60');
  await ev(p, () => window.__mw.startLesson('quarter', 'solve')); await wait(120);
  let clockOk = false;
  for (let i = 0; i < 12 && !clockOk; i++) {
    const c = await cur(p); if (c.type !== 'clockset') { await answer(p, true); await next(p); await wait(60); continue; }
    const target = await ev(p, () => window.__mw.RD.cur.p.ans);
    await ev(p, t => { const btn = d => document.querySelector(`.cs-btns [data-d="${d}"]`); for (let k = 0; k < (t.h % 12); k++) btn('60').click(); for (let k = 0; k < t.m / 5; k++) btn('5').click(); }, target);
    await ev(p, () => document.querySelector('#checkBtn').click()); await wait(80);
    clockOk = await ev(p, () => window.__mw.RD.phase === 'done' && window.__mw.RD.tries === 0);
  }
  check(clockOk, 'setting the clock with the buttons is marked right');
  await ev(p, () => window.__mw.startLesson('makeamt', 'solve')); await wait(120);
  const tgt = await ev(p, () => window.__mw.RD.cur.p.ans);
  await ev(p, t => { let left = t; for (const [id, v] of [['b1', 100], ['q', 25], ['d', 10], ['n', 5], ['p', 1]]) { const b = document.querySelector(`[data-c="${id}"]`); while (b && left >= v) { b.click(); left -= v; } } }, tgt);
  check(await ev(p, () => /You have/.test(document.querySelector('#trayTotal').textContent)), 'the tray shows the running total');
  await ev(p, () => document.querySelector('#checkBtn').click()); await wait(80);
  check(await ev(p, () => window.__mw.RD.phase === 'done' && window.__mw.RD.tries === 0), 'tapping coins to make the amount is marked right');
  await ev(p, () => window.__mw.startLesson('split', 'solve')); await wait(120);
  const ans9 = await ev(p, () => window.__mw.RD.cur.p.ans);
  await ev(p, a => window.__mw.type(String(a)), ans9); await p.keyboard.press('Enter'); await wait(80);
  check(await ev(p, () => window.__mw.RD.phase === 'done' && window.__mw.RD.tries === 0), 'typing the answer and pressing Enter is marked right');
  await ev(p, () => document.querySelector('#quitBtn').click()); await wait(150);
  check(await ev(p, () => window.__storageWrites) === 0, 'nothing was written to browser storage');
  await p.close();

  /* 9. Charlie (4th grade) starts further along; the saves come back on a fresh page */
  p = await newPage(mock);
  await until(() => ev(p, () => !document.querySelector('.profile-card').disabled));
  check(await ev(p, () => document.querySelectorAll('.profile-card')[1].textContent.includes('Riley')), 'Riley is on the fresh page');
  await ev(p, () => document.querySelectorAll('.profile-card')[0].click()); await wait(200);
  check(await ev(p, () => /4th grader/.test(document.querySelector('#preText').textContent)), 'Charlie gets the 4th grade check');
  await ev(p, () => document.querySelector('#preBtn').click()); await wait(150);
  const cf = await cur(p);
  check(cf.nx.skill === LEN.add[Math.round((LEN.add.length - 1) * .55)], 'a 4th grader starts Adding further in (' + cf.nx.skill + ')');
  await ev(p, () => document.querySelector('#skipBtn').click()); await wait(1300);
  check((await state(p, 'charlie')).pre.st.add.log.length === 1, 'skipping counts as not known yet');
  await p.close();

  /* 10. service down: the player screen waits, Try again loads */
  const down = create(); down.ctl.down = true;
  p = await newPage(down); await wait(1500);
  check(await ev(p, () => document.querySelector('.profile-card').disabled && !document.querySelector('#saveRetry').hidden), 'with the service down the player screen waits and offers Try again');
  down.ctl.down = false; await p.click('#saveRetry');
  check(await until(() => ev(p, () => !document.querySelector('.profile-card').disabled), 8000), 'Try again loads the saves');
  await p.close();

  /* 11. phone width: no sideways scroll on the hub, a lesson, or a problem */
  p = await newPage(mock, { width: 360, height: 760, isMobile: true, hasTouch: true });
  await until(() => ev(p, () => !document.querySelector('.profile-card').disabled));
  await ev(p, () => document.querySelectorAll('.profile-card')[1].click()); await wait(200);
  const wide = () => ev(p, () => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(!(await wide()), 'hub fits 360px');
  await ev(p, () => window.__mw.openLesson('countup')); await wait(150); check(!(await wide()), 'lesson fits 360px');
  for (const sk of ['make10', 'quarter', 'makeamt', 'countcoins', 'rulemachine', 'hundred', 'addprice', 'elapsed', 'remain']) { await ev(p, s => window.__mw.startLesson(s, 'solve'), sk); await wait(120); check(!(await wide()), sk + ' fits 360px'); await answer(p, false); await answer(p, false); check(!(await wide()), sk + ' explanation fits 360px'); }
  await p.close();

  check(errs.length === 0, 'no page errors: ' + errs.join(' | '));
  await browser.close();
  console.log(`${n - failed} of ${n} checks passed${failed ? ', ' + failed + ' FAILED' : ''}`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
