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
    await p.evaluateOnNewDocument(() => { window.__mwRushMs = 0; /* test answers are instant: memory checks still count */ window.__storageWrites = 0; for (const k of ['localStorage', 'sessionStorage']) { try { const s = window[k], set = s.setItem.bind(s); s.setItem = (...a) => { window.__storageWrites++; return set(...a); }; } catch (e) {} } });
    await p.goto(F); return p;
  };
  const ev = (p, f, ...a) => p.evaluate(f, ...a);
  const state = (p, id) => ev(p, id => JSON.parse(JSON.stringify(window.__mw.saves[id] || null)), id);
  const answer = async (p, right) => { await ev(p, r => r ? window.__mw.answerRight() : window.__mw.answerWrong(), right); await wait(50); };
  const next = async p => { await ev(p, () => { const b = document.querySelector('#nextQBtn'); if (!b.hidden) b.click(); }); await wait(50); };
  const resultsShown = p => ev(p, () => !document.querySelector('#results').hidden);
  const cur = p => ev(p, () => { const R = window.__mw.RD; if (!R || !R.cur) return null; return { kind: R.cur.kind, skill: R.cur.p.skill, d: R.cur.p.d, type: R.cur.p.type, steps: (R.cur.p.steps || []).length, phase: R.phase, tries: R.tries, qlen: R.queue.length, endQ: R.endQ.length, roundKind: R.kind, nx: R.cur.nx || null }; });
  const G = await (async () => { const p = await browser.newPage(); await p.goto(F); const g = await p.evaluate(() => { const S = window.MWC.S, CO = window.COACH; return { grade: Object.fromEntries(Object.keys(S).map(k => [k, S[k].g])), order: CO.ORDER, strands: Object.fromEntries(CO.STR.map(s => [s.id, s.list])) }; }); await p.close(); return g; })();

  /* 1. loading */
  const mock = create();
  let p = await newPage(mock);
  await until(() => ev(p, () => !document.querySelector('.profile-card').disabled));
  check(mock.stats.gets === 1, 'one GET loads every save'); check(mock.stats.realHits === 0, 'the real service is never called');
  check(await ev(p, () => document.querySelectorAll('.profile-card').length === 3), 'three players: Charlie, Riley, Yan');
  check(G.order.length >= 200, 'the path runs through ' + G.order.length + ' concepts');
  check(G.grade[G.order[0]] === 2 && G.grade[G.order[G.order.length - 1]] === 12, 'from 2nd to 12th grade');

  /* 2. Riley's placement check: she knows the 2nd grade concepts, not the 3rd grade ones */
  await ev(p, () => document.querySelectorAll('.profile-card')[1].click()); await wait(200);
  check(await ev(p, () => !document.querySelector('#preCard').hidden && /up to 4th grade/.test(document.querySelector('#preText').textContent)), 'Riley sees the placement check, up to 4th grade');
  check(await ev(p, () => document.querySelector('#nextTitle').textContent === 'Placement check'), 'Up next is the placement check');
  await ev(p, () => document.querySelector('#preBtn').click()); await wait(200);
  const first = await cur(p);
  check(first && first.kind === 'pre' && first.d === 1, 'the check starts with a medium problem (' + JSON.stringify(first && first.nx) + ')');
  let asked = 0, stoppedOnce = false, blocksSeen = 0, sitRight = 0;
  for (let i = 0; i < 300; i++) {
    const c = await cur(p); if (!c || c.roundKind !== 'pre') break;
    if (c.phase !== 'ask') { await wait(60); continue; }
    asked++; if (G.grade[c.nx.skill] <= 2) sitRight++; await answer(p, G.grade[c.nx.skill] <= 2);
    if (asked === 7 && !stoppedOnce) { /* stop part way, come back: the check picks up where it left off */
      stoppedOnce = true; sitRight = 0; await until(() => cur(p).then(x => x && x.phase === 'ask'), 3000); await ev(p, () => document.querySelector('#quitBtn').click()); await wait(200);
      check(await ev(p, () => !document.querySelector('#hub').hidden && /Start block/.test(document.querySelector('#preBtn').textContent)), 'stopping keeps the placement check to continue');
      await ev(p, () => document.querySelector('#preBtn').click()); await wait(200);
    }
    await until(() => ev(p, () => { const R = window.__mw.RD; return !R || R.phase === 'ask' || !document.querySelector('#results').hidden; }), 4000);
    if (await resultsShown(p)) { if (await ev(p, () => window.__mw.saves.riley.pre.done)) break; blocksSeen++;
      check(await ev(p, n => Number(document.querySelector('#rRight').textContent) === n && document.querySelector('#rCur').textContent === '+' + 2 * n, sitRight), 'the end of a block shows how many were right (' + sitRight + ')'); sitRight = 0;
      check(blocksSeen > 1 || await ev(p, () => /^Block 1 of [0-9]+ done/.test(document.querySelector('#resTitle').textContent) && document.querySelector('#againBtn').textContent === 'Next block'), 'a block ends with a break and Next block');
      check(await ev(p, () => { const pl = window.__mw.saves.riley, pre = pl.pre, CO = window.COACH; return pre.order.every(sid => { const st = pre.st[sid], s = CO.STR.find(x => x.id === sid); return !st.done || s.core.slice(0, st.start).every(id => CO.isMastered(pl, id)); }); }), 'after each block, the parts it finished already count in the report');
      await ev(p, () => document.querySelector('#againBtn').click()); await wait(200); }
  }
  await until(() => resultsShown(p), 5000);
  check(blocksSeen >= 1, 'the check came in blocks (' + (blocksSeen + 1) + ')');
  check(asked >= 25 && asked <= 110, 'the placement check is thorough but not endless (' + asked + ' questions)');
  const parts = await ev(p, () => document.querySelectorAll('#resPlaces .place').length);
  check(parts >= 8, 'the results list where each part starts (' + parts + ' parts)');
  await until(() => ev(p, () => window.__mw.net.idle()));
  let r = mock.store.riley.state;
  check(r.pre && r.pre.done, 'the placement is saved online as done');
  const mastered = Object.keys(r.cs).filter(id => r.cs[id].m);
  check(mastered.length >= 20 && mastered.every(id => G.grade[id] === 2), 'the 2nd grade concepts she knows are mastered, nothing above (' + mastered.length + ')');

  /* 3. the hub after placement */
  await ev(p, () => document.querySelector('#hubBtn').click()); await wait(200);
  check(await ev(p, () => document.querySelector('#preCard').hidden), 'the placement card is gone');
  const nextId = await ev(p, () => window.__mw.CO.current(window.__mw.saves.riley));
  check(nextId && G.grade[nextId] <= 3, 'Up next is a concept at her level (' + nextId + ')');
  check(await ev(p, id => document.querySelector('#nextTitle').textContent === 'Today’s practice' && document.querySelector('#nextSub').textContent.includes(window.MWC.S[id].title) && /20 minutes/.test(document.querySelector('#nextSub').textContent), nextId), 'Up next is a 20-minute block that names the concept');
  check(await ev(p, () => document.querySelectorAll('#map details.grade').length === 11), 'the map has a card for each grade, 2nd to 12th');
  check(await ev(p, () => { const o = document.querySelector('#map details.grade[open]'); return o && /3rd grade/.test(o.textContent) && o.querySelector('.chip.now'); }), 'her grade is open on the map with the current concept marked');

  /* 4. learning a concept: a miss twice → the worked shortcut and the break-down; then 9 right in a row masters it */
  mock.store.riley = { rev: mock.store.riley.rev + 1, state: Object.assign({}, mock.store.riley.state, { cur: (mock.store.riley.state.cur | 0) + 100, cs: Object.assign({}, mock.store.riley.state.cs, { c_coins: { lv: 2, st: 0, ml: 0, r: 9, w: 0, t: 5, m: 5, due: 9e15, iv: 1 } }) }) };
  await ev(p, () => document.querySelector('#nextBtn').click()); await wait(200);
  check(await ev(p, () => !document.querySelector('#lesson').hidden && document.querySelector('#lsTip').textContent.length > 20), 'a new concept opens with its trick');
  await ev(p, () => { const b = document.querySelector('#lsStepBtn'); for (let i = 0; i < 6; i++) if (!b.hidden) b.click(); });
  check(await ev(p, () => document.querySelectorAll('#lsExSteps li:not(.hide)').length >= 2), 'the worked example steps through');
  await ev(p, () => document.querySelector('#startBtn').click()); await wait(200);
  const c0 = await cur(p);
  check(c0 && c0.roundKind === 'learn' && c0.skill === nextId && c0.d === 0, 'the first problem is easy, on that concept');
  await answer(p, false);
  check(await ev(p, () => !document.querySelector('#feedback').hidden && /Try again/.test(document.querySelector('#feedback').textContent)), 'first miss: try again with a hint');
  await answer(p, false);
  const fbText = await ev(p, () => document.querySelector('#feedback').textContent);
  check(/The answer is/.test(fbText) && /shortcut/.test(fbText), 'second miss: the answer and the shortcut');
  const afterMiss = await cur(p);
  check(afterMiss.qlen === c0.steps, 'the break-down steps are queued (' + afterMiss.qlen + ' of ' + c0.steps + ')');
  if (c0.steps) check(await ev(p, () => /break it down/i.test(document.querySelector('#nextQBtn').textContent)), 'the button says Let\'s break it down');
  await next(p);
  if (c0.steps) check((await cur(p)).kind === 'step', 'the next question is a step');
  let mains = 1, stepsSeen = 0, levelSeen = new Set();
  for (let i = 0; i < 80; i++) { const c = await cur(p); if (!c || c.roundKind !== 'learn') break; if (c.phase !== 'ask') { await next(p); continue; } if (c.kind === 'main') { mains++; levelSeen.add(c.d); } if (c.kind === 'step') stepsSeen++; await answer(p, true); await next(p); if (await resultsShown(p)) break; }
  await until(() => resultsShown(p));
  check(stepsSeen === c0.steps, 'every step was asked (' + stepsSeen + ')');
  check(levelSeen.has(1) && levelSeen.has(2), 'the problems got harder: levels ' + [...levelSeen].join(','));
  check(await ev(p, () => /Concept mastered/.test(document.querySelector('#resTitle').textContent)), 'nine right in a row masters the concept (' + mains + ' problems)');
  check(await ev(p, () => !document.querySelector('#nextLessonBtn').hidden && /Keep going/.test(document.querySelector('#nextLessonBtn').textContent)), 'the results offer to keep going');
  await until(() => ev(p, () => window.__mw.net.idle()));
  r = mock.store.riley.state;
  check(r.cs[nextId] && r.cs[nextId].m > 0, 'the mastery is saved online');
  check(r.cs.c_coins && r.cs.c_coins.m === 5, 'progress from the other device is kept');
  check(mock.stats.merges >= 1, 'the service merged the two copies');
  const after = await ev(p, () => window.__mw.CO.current(window.__mw.saves.riley));
  check(after && after !== nextId, 'the path moved on (' + after + ')');

  /* 5. a mistake that points at an earlier concept becomes a tricky spot with practice at the end */
  const spotCase = await ev(p, () => { const MW = window.MWC, CO = window.COACH, pl = window.__mw.saves.riley, R = MW.makeR(3);
    for (const id of CO.ORDER) { if (!CO.isOpen(pl, id) || CO.isMastered(pl, id)) continue; for (let k = 0; k < 30; k++) { const q = MW.gen(id, 0, R); const t = q.traps.find(t => t.c && t.c !== id && CO.isOpen(pl, t.c)); if (t) return { id, c: t.c }; } } return null; });
  check(!!spotCase, 'a concept with a trap pointing back exists (' + JSON.stringify(spotCase) + ')');
  if (spotCase) {
    await ev(p, id => window.__mw.startLearn(id), spotCase.id); await wait(120);
    let found = false;
    for (let i = 0; i < 30 && !found; i++) {
      const hit = await ev(p, c => { const R = window.__mw.RD, q = R.cur.p, t = q.traps.find(t => t.c === c); if (!t) return false; window.__mw.submit(t.v); return true; }, spotCase.c);
      if (!hit) { await answer(p, true); await next(p); continue; }
      await answer(p, false); found = true;
    }
    check(found && await ev(p, () => /Tricky spot/.test(document.querySelector('#feedback').textContent)), 'the explanation names the tricky spot');
    check((await cur(p)).endQ === 2, 'two practice problems for it are queued for the end');
    check(await ev(p, c => !!window.__mw.saves.riley.mist[c], spotCase.c), 'the tricky spot is saved');
    await ev(p, () => document.querySelector('#quitBtn').click()); await wait(150);
    await ev(p, () => document.querySelector('#hubBtn').click()); await wait(150);
    check(await ev(p, () => document.querySelectorAll('#spots .spot').length >= 1), 'tricky spots show on the hub');
    /* fixing it: every answer right */
    await ev(p, c => window.__mw.startFix(c), spotCase.c); await wait(150);
    for (let i = 0; i < 40; i++) { const c = await cur(p); if (!c || c.roundKind !== 'fix') break; if (c.phase !== 'ask') { await next(p); continue; } await answer(p, true); await wait(20); await next(p); if (await resultsShown(p)) break; }
    await until(() => resultsShown(p));
    const m = (await state(p, 'riley')).mist[spotCase.c];
    check(m && m.ok >= 3, 'a practice session with every answer right fixes the tricky spot');
  }

  /* 6. a fix session where the kid keeps missing adds the idea one step back */
  const deepCase = await ev(p, () => { const CO = window.COACH; const id = CO.ORDER.find(x => window.MWC.S[x].g === 2 && CO.deeper(x)); return { id, back: CO.deeper(id) }; });
  await ev(p, id => window.__mw.startFix(id), deepCase.id); await wait(150);
  let wrongs = 0;
  for (let i = 0; i < 60; i++) { const c = await cur(p); if (!c || c.roundKind !== 'fix') break; if (c.phase !== 'ask') { await next(p); continue; } if (c.kind === 'prac' && wrongs < 3) { wrongs++; await answer(p, false); await answer(p, false); } else await answer(p, true); await next(p); if (await resultsShown(p)) break; }
  await until(() => resultsShown(p));
  check((await state(p, 'riley')).mist[deepCase.back], 'missing practice adds the concept one step back (' + deepCase.back + ')');
  check(/one step back/.test(await ev(p, () => document.querySelector('#resNote').textContent)), 'the results say to go one step back');

  /* 7. review: a due mastered concept comes back in a review mix */
  await ev(p, () => { const pl = window.__mw.saves.riley; const id = Object.keys(pl.cs).find(k => pl.cs[k].m); pl.cs[id].due = 0; window.__dueId = id; });
  const revTotal = await ev(p, () => { window.__mw.startReview(); return window.__mw.RD.mainTotal; }); await wait(150);
  let revs = 0; for (let i = 0; i < 12; i++) { const c = await cur(p); if (!c || c.roundKind !== 'review') break; if (c.phase !== 'ask') { await next(p); continue; } if (c.kind === 'rev') revs++; await answer(p, true); await next(p); if (await resultsShown(p)) break; }
  check(revTotal >= 4 && revs >= Math.min(5, revTotal - 2), 'a review mix is made of mastered concepts (' + revs + ' of ' + revTotal + ', sized to the block)');
  check(await ev(p, () => window.__mw.saves.riley.cs[window.__dueId].due <= Date.now()), 'a review mix is extra practice: the concept still gets its memory check');

  /* 8. typing: keys depend on the grade, and every answer form can be typed */
  const keysOf = async id => { await ev(p, s => window.__mw.startLearn(s), id); await wait(100); return ev(p, () => [...document.querySelectorAll('.kp .key:not(.blank)')].map(b => b.dataset.k).join(' ')); };
  const g2 = G.order.find(id => G.grade[id] === 2 && /^a_/.test(id)), g7 = G.order.find(id => G.grade[id] === 7 && /^n_int/.test(id));
  const k2 = await keysOf(g2); check(!/[.\/−]/.test(k2), '2nd grade pads have just the digits (' + k2 + ')');
  if (g7) { const k7 = await keysOf(g7); check(/−/.test(k7) && /\./.test(k7) && /\//.test(k7), '7th grade pads have − . / (' + k7 + ')'); }
  const typeRight = async id => { await ev(p, s => window.__mw.startLearn(s), id); await wait(100); const raw = await ev(p, () => window.MWC.rawFor(window.__mw.RD.cur.p)); await ev(p, s => window.__mw.type(s), raw); await p.keyboard.press('Enter'); await wait(40); const one = await ev(p, () => window.__mw.RD.phase === 'ask' && /Tap again/.test(document.querySelector('#checkBtn').textContent)); await p.keyboard.press('Enter'); await wait(60); return one && await ev(p, () => window.__mw.RD.phase === 'done' && window.__mw.RD.tries === 0); };
  for (const id of ['t_later', 't_elapsed', 'c_change', 'm_remain', 'f_addunlike', 'n_intadd', 'x_slope', 'f_decadd']) if (G.grade[id]) check(await typeRight(id), 'typing the answer and pressing Enter works: ' + id);
  check(await ev(p, () => { const MW = window.MWC, q = { type: 'frac', ans: { n: 3, d: 4 }, low: true, skill: 'f_simplify' }; return MW.eqAns(q, MW.parse(q, '3/4')) && !MW.eqAns(q, MW.parse(q, '6/8')); }), 'lowest terms means 6/8 is not accepted where 3/4 is asked');
  check(await ev(p, () => { const MW = window.MWC, q = { type: 'time', ans: { h: 3, m: 15 } }; return MW.eqAns(q, MW.parse(q, '315')) && !MW.eqAns(q, MW.parse(q, '31')); }), 'typing 3 1 5 means 3:15');
  check(await ev(p, () => { const MW = window.MWC, q = { type: 'money', fmt: 'd', ans: 160 }; return MW.eqAns(q, MW.parse(q, '1.60')) && MW.eqAns(q, MW.parse(q, '1.6')); }), 'typing 1.60 means $1.60');
  /* pencil and paper: every problem says how to work it; paper problems show the whole written solution when right */
  const modeOf = async id => { await ev(p, s => window.__mw.startLearn(s), id); await wait(80); return ev(p, () => document.querySelector('#qMode').textContent); };
  check(/Pencil and paper/.test(await modeOf('m_longdiv')) && /In your head/.test(await modeOf('a_plus9')), 'problems say pencil and paper, or in your head');
  await ev(p, s => window.__mw.startLearn(s), 'x_twostep'); await wait(80); await answer(p, true);
  check(await ev(p, () => /Check your work/.test(document.querySelector('#feedback').textContent) && document.querySelectorAll('#feedback .steps li').length >= 2 && !document.querySelector('#nextQBtn').hidden), 'a right paper answer shows the written solution to check against');
  await wait(1800); check(await ev(p, () => window.__mw.RD.phase === 'done'), 'the game waits for Next while kids write');
  await ev(p, () => document.querySelector('#quitBtn').click()); await wait(150);
  await ev(p, () => window.__mw.openLesson('m_longdiv')); await wait(100);
  const pagesBefore = (await browser.pages()).length;
  await ev(p, () => document.querySelector('#printBtn').click()); await wait(800);
  const pages = await browser.pages(), sheet = pages.length > pagesBefore ? pages[pages.length - 1] : null;
  const sheetText = sheet ? await sheet.evaluate(() => document.body.innerText) : '';
  check(/Answer key/.test(sheetText) && /12\./.test(sheetText) && /Show your work/.test(sheetText), 'the practice sheet has 12 problems, room to work, and an answer key');
  if (sheet) await sheet.close();

  /* 9. test out of a locked concept: 5 hard ones right */
  const locked = await ev(p, () => { const CO = window.COACH, pl = window.__mw.saves.riley; return CO.ORDER.find(id => !CO.isOpen(pl, id) && window.MWC.S[id].g === 4); });
  await ev(p, id => window.__mw.openLesson(id), locked); await wait(120);
  check(await ev(p, () => !document.querySelector('#testOutBtn').hidden && document.querySelector('#startBtn').hidden), 'a locked concept offers Test out (' + locked + ')');
  await ev(p, () => document.querySelector('#testOutBtn').click()); await wait(120);
  for (let i = 0; i < 12; i++) { const c = await cur(p); if (!c || c.roundKind !== 'test') break; if (c.phase !== 'ask') { await next(p); continue; } await answer(p, true); await next(p); if (await resultsShown(p)) break; }
  await until(() => resultsShown(p));
  check(await ev(p, id => window.COACH.isMastered(window.__mw.saves.riley, id), locked), 'testing out masters it');
  check(await ev(p, () => window.__storageWrites) === 0, 'nothing was written to browser storage');

  /* 9b. parent view: Riley's report, from her online save */
  await until(() => ev(p, () => window.__mw.net.idle()));
  await ev(p, () => window.__mw.openParent('riley')); await wait(250);
  check(await ev(p, () => !document.querySelector('#parent').hidden && document.querySelectorAll('#pvBody .pv-card').length >= 7), 'the parent view shows a report for Riley');
  const rv = await ev(p, () => { const d = Object.values(window.__mw.saves.riley.log || {}); return { n: d.reduce((a, e) => a + (e.n || 0), 0), ok: d.reduce((a, e) => a + (e.ok || 0), 0), pre: d.reduce((a, e) => a + (e.pre || 0), 0), ms: d.reduce((a, e) => a + (e.ms || 0), 0), txt: document.querySelector('#pvBody').textContent }; });
  check(rv.n > 10 && rv.ok > 5 && rv.pre > 10 && rv.ms > 0, 'answers, placement questions and time are logged by day (' + rv.n + ' answers, ' + rv.ok + ' right, ' + rv.pre + ' placement)');
  check(/Grade level/.test(rv.txt) && /percentile/.test(rv.txt) && /Number Sense/.test(rv.txt) && /Data & Probability/.test(rv.txt) && /Placement check/.test(rv.txt), 'the report has grade levels, the percentile, every area and the placement check');
  check(!/NaN|undefined|Infinity|\[object/.test(rv.txt), 'no broken numbers in the report');
  check(await ev(p, () => document.querySelectorAll('#pvBody svg.pv-chart').length >= 1 && document.querySelectorAll('#pvBody [data-tip]').length >= 14), 'practice chart and area bars have hover tips');
  await ev(p, () => document.querySelector('#pvTabs [data-kid="charlie"]').click()); await wait(150);
  check(await ev(p, () => window.__mw.PV === 'charlie' && document.querySelector('#pvBody').textContent.includes('Charlie')), 'switching to Charlie');
  check(await ev(p, () => window.__storageWrites) === 0, 'the parent view writes nothing to the device');
  /* a parent starts an assessment: two taps, saved online, and the child sees it first */
  await ev(p, () => document.querySelector('#pvAssess').click()); await wait(50);
  check(await ev(p, () => /Tap again/.test(document.querySelector('#pvAssess').textContent)), 'starting an assessment asks for a second tap');
  await ev(p, () => document.querySelector('#pvAssess').click()); await wait(150);
  await until(() => ev(p, () => window.__mw.net.idle()));
  check(mock.store.charlie && mock.store.charlie.state.pre && mock.store.charlie.state.pre.by === 'parent' && !mock.store.charlie.state.pre.done, 'the assessment is saved online for Charlie');
  check(await ev(p, () => /Assessment in progress/.test(document.querySelector('#pvBody').textContent)), 'the parent view shows it in progress');
  /* history charts with time spans, and the reset to the latest assessment */
  await ev(p, () => document.querySelector('#pvTabs [data-kid="riley"]').click()); await wait(150);
  check(await ev(p, () => /History/.test(document.querySelector('#pvBody').textContent) && document.querySelectorAll('#pvBody [data-range]').length === 5 && document.querySelectorAll('#pvBody svg.pv-chart').length >= 4), 'History card with 5 time spans and charts');
  for (const r of ['7d', '3m', '1y', 'all']) { await ev(p, r => document.querySelector('#pvBody [data-range="' + r + '"]').click(), r); await wait(80);
    check(await ev(p, r => document.querySelector('#pvBody [data-range="' + r + '"]').getAttribute('aria-pressed') === 'true' && !/NaN|undefined|Infinity/.test(document.querySelector('#pvBody').textContent) && !/NaN/.test(document.querySelector('#pvBody').innerHTML), r), 'history span ' + r + ' draws with no broken numbers'); }
  check(await ev(p, () => !!document.querySelector('#pvReset')), 'the reset button is there for Riley');
  await ev(p, () => document.querySelector('#pvReset').click()); await wait(50);
  check(await ev(p, () => /Tap again/.test(document.querySelector('#pvReset').textContent)), 'the reset asks for a second tap');
  await ev(p, () => document.querySelector('#pvReset').click()); await wait(150);
  await until(() => ev(p, () => window.__mw.net.idle()));
  { const st = mock.store.riley.state, ms = Object.values(st.cs).filter(s => s.m);
    check(st.reset && st.reset.t && ms.length > 0 && ms.every(s => s.pl) && Array.isArray(st.asm) && st.asm.length >= 1, 'the reset is saved online: only placed concepts are mastered (' + ms.length + ')'); }
  check(await ev(p, () => window.__storageWrites) === 0, 'the reset writes nothing to the device');
  /* the questions of each assessment, for parents */
  { const qs = await ev(p, () => { const d = document.querySelector('#pvBody details.pv-qs'); if (!d) return null; d.open = true; d.dispatchEvent(new Event('toggle')); const b = d.querySelector('.pv-qbody');
      return { n: b.querySelectorAll('.pv-q').length, exact: !/not saved/.test(b.textContent), bad: /NaN|undefined|\[object/.test(b.textContent) }; });
    check(qs && qs.n >= 10 && qs.exact && !qs.bad, 'parents can open the questions of an assessment, the exact ones (' + (qs && qs.n) + ')'); }
  await p.close();

  /* 9c. help lessons: missing a concept twice in a round brings a narrated video, a check, a step-by-step lesson and feedback */
  p = await newPage(mock); await ev(p, () => { window.__mwFast = true; });
  await until(() => ev(p, () => !document.querySelector('.profile-card').disabled));
  await ev(p, () => document.querySelectorAll('.profile-card')[1].click()); await wait(150);
  const hid = await ev(p, () => { const CO = window.COACH, pl = window.__mw.saves.riley; return CO.ORDER.find(id => CO.isOpen(pl, id) && !CO.isMastered(pl, id) && !CO.started(pl, id)); });
  await ev(p, id => window.__mw.startLearn(id), hid); await wait(120);
  for (let i = 0; i < 2; i++) { await answer(p, false); await answer(p, false); if (i === 0) { for (let k = 0; k < 8; k++) { const c = await cur(p); if (c && c.kind === 'main' && c.phase === 'ask') break; await next(p); const c2 = await cur(p); if (c2 && c2.kind === 'step' && c2.phase === 'ask') await answer(p, true); } } }
  check(await ev(p, () => document.querySelector('#nextQBtn').textContent === 'Watch a short lesson'), 'two shown answers in a round offer a help lesson (' + hid + ')');
  await next(p); await wait(100);
  check(await ev(p, () => !document.querySelector('#help').hidden && document.querySelectorAll('#hvBar i').length >= 4), 'the help lesson opens with a video of the trick and a worked example');
  await until(() => ev(p, () => !document.querySelector('#hvAfter').hidden), 8000);
  check(await ev(p, () => document.querySelectorAll('#hvStage .hv-f').length === document.querySelectorAll('#hvBar i').length && document.querySelector('#hvCap').textContent.length > 5), 'the video plays every frame with captions');
  await ev(p, () => document.querySelector('#hvDone').click()); await wait(50);
  check(await ev(p, () => !document.querySelector('#hlFeel').hidden && document.querySelectorAll('#hfBtns button').length === 3), 'after the video: did it make sense? (3 answers)');
  await ev(p, () => document.querySelector('#hfBtns [data-f="some"]').click()); await wait(50);
  let tasks = 0, xd = 0;
  const stepOn = async d => { const s = await ev(d, () => ({ check: !document.querySelector('#hlCheck').hidden, next: !document.querySelector('#hlNext').hidden }));
    if (s.check) await ev(d, () => { const H = window.__mw.HL; window.__mw.type(window.__mw.MW.rawFor(H.task.p)); document.querySelector('#hlCheck').click(); });
    else if (s.next) await ev(d, () => document.querySelector('#hlNext').click()); await wait(60); };
  for (let i = 0; i < 20; i++) {
    if (tasks === 2 && !xd) { xd = 1; await until(() => ev(p, () => window.__mw.net.idle()));
      /* help lessons carry on on another device, mid-lesson */
      const dB = await newPage(mock); await ev(dB, () => { window.__mwFast = true; }); await until(() => ev(dB, () => !document.querySelector('.profile-card').disabled));
      await ev(dB, () => document.querySelectorAll('.profile-card')[1].click()); await wait(150);
      const hubTxt = await ev(dB, () => document.querySelector('#nextTitle').textContent + ' | ' + document.querySelector('#nextSub').textContent);
      check(/Continue where you left off/.test(hubTxt) && /Help lesson/.test(hubTxt), 'another device offers to continue the help lesson (' + hubTxt + ')');
      const tiA = await ev(p, () => window.__mw.HL.ti);
      await ev(dB, () => document.querySelector('#nextBtn').click()); await wait(200);
      const tiB0 = await ev(dB, () => window.__mw.HL && window.__mw.HL.ti);
      check(await ev(dB, () => !document.querySelector('#help').hidden && !document.querySelector('#hlLesson').hidden) && (tiB0 === tiA || tiB0 === tiA + 1), 'it opens the help lesson at the same step (' + tiA + ' -> ' + tiB0 + ')');
      await stepOn(dB); await stepOn(dB); await until(() => ev(dB, () => window.__mw.net.idle()));
      const tiB = await ev(dB, () => window.__mw.HL.ti);
      await ev(p, () => window.__mw.net.refresh()); await wait(300);
      const tiA2 = await ev(p, () => window.__mw.HL && window.__mw.HL.ti);
      check(tiA2 >= tiB && tiA2 > tiA, 'the first device catches up with the steps done on the other (' + tiA + ' -> ' + tiA2 + ', other ' + tiB + ')');
      await dB.close(); }
    const st = await ev(p, () => ({ lesson: !document.querySelector('#hlLesson').hidden, feel: !document.querySelector('#hlFeel').hidden, check: !document.querySelector('#hlCheck').hidden, next: !document.querySelector('#hlNext').hidden }));
    if (st.feel) break; if (!st.lesson) break;
    if (st.check) { tasks++; await ev(p, () => { const H = window.__mw.HL; window.__mw.type(window.__mw.MW.rawFor(H.task.p)); document.querySelector('#hlCheck').click(); }); await wait(30); }
    else if (st.next) { await ev(p, () => document.querySelector('#hlNext').click()); await wait(30); }
  }
  check(tasks >= 3, 'the lesson has a quick check, the simpler parts and the steps, each typed (' + tasks + ' typed)');
  check(await ev(p, () => !document.querySelector('#hlFeel').hidden && /feel about it now/.test(document.querySelector('#hfQ').textContent)), 'at the end: how do you feel about it now?');
  await ev(p, () => document.querySelector('#hfBtns [data-f="yes"]').click()); await wait(50);
  const hr = await ev(p, () => window.__mw.saves.riley.help.slice(-1)[0]);
  check(hr && hr.video === 'some' && hr.lesson === 'yes' && hr.check === true && hr.total >= 2, 'the lesson and both answers are saved (' + JSON.stringify(hr) + ')');
  await ev(p, () => document.querySelector('#hdBtn').click()); await wait(100);
  check(await ev(p, () => !document.querySelector('#play').hidden && window.__mw.RD && window.__mw.RD.kind === 'learn'), 'back to practice afterwards');
  await until(() => ev(p, () => window.__mw.net.idle()));
  check((mock.store.riley.state.help || []).length >= 1, 'help lessons are saved online');
  await ev(p, id => window.__mw.openLesson(id), hid); await wait(80);
  check(await ev(p, () => !document.querySelector('#videoBtn').hidden), 'every concept page offers the video lesson');
  await ev(p, () => window.__mw.openParent('riley')); await wait(200);
  check(await ev(p, () => /Help lessons/.test(document.querySelector('#pvBody').textContent)), 'the parent view lists help lessons');
  await p.close();

  /* 10. Charlie (4th grade) starts further along; the saves come back on a fresh page */
  p = await newPage(mock);
  await until(() => ev(p, () => !document.querySelector('.profile-card').disabled));
  check(await ev(p, () => document.querySelectorAll('.profile-card')[1].textContent.includes('Riley')), 'Riley is on the fresh page');
  await ev(p, () => document.querySelectorAll('.profile-card')[0].click()); await wait(200);
  check(await ev(p, () => /up to 5th grade/.test(document.querySelector('#preText').textContent)), 'Charlie gets the check up to 5th grade');
  await ev(p, () => document.querySelector('#preBtn').click()); await wait(150);
  const cf = await cur(p);
  check(cf && G.grade[cf.nx.skill] >= 3, 'a 4th grader starts further in (' + cf.nx.skill + ')');
  await ev(p, () => (document.querySelector('#skipBtn').click(), document.querySelector('#skipBtn').click())); await wait(1300);
  check((await state(p, 'charlie')).pre.st[cf.nx.strand].log.length === 1, 'skipping counts as not known yet');
  await p.close();

  /* 10b. any device: a round started on one device continues on another, and settings follow the player */
  const devA = await newPage(mock), devB = await newPage(mock);
  for (const d of [devA, devB]) await until(() => ev(d, () => !document.querySelector('.profile-card').disabled));
  await ev(devA, () => document.querySelectorAll('.profile-card')[1].click()); await wait(150);
  await ev(devA, () => window.__mw.startLearn(window.__mw.CO.current(window.__mw.saves.riley))); await wait(100);
  for (let i = 0; i < 3; i++) { await answer(devA, true); await next(devA); }
  const qA = await ev(devA, () => document.querySelector('#qText').innerHTML);
  await until(() => ev(devA, () => window.__mw.net.idle()));
  await ev(devB, () => window.__mw.net.refresh()); await wait(400);
  await ev(devB, () => document.querySelectorAll('.profile-card')[1].click()); await wait(150);
  check(await ev(devB, () => document.querySelector('#nextTitle').textContent === 'Continue where you left off'), 'another device offers to continue the round');
  await ev(devB, () => document.querySelector('#nextBtn').click()); await wait(150);
  check(await ev(devB, () => window.__mw.RD.mainDone === 3 && window.__mw.RD.results.length === 3), 'it picks up after the 3 answers already given');
  check(await ev(devB, () => document.querySelector('#qText').innerHTML) === qA, 'with the same question on screen');
  /* the first device is still open on the old question: it catches up with the answers given on the second */
  for (let i = 0; i < 2; i++) { await answer(devB, true); await next(devB); }
  await until(() => ev(devB, () => window.__mw.net.idle()));
  const qB = await ev(devB, () => document.querySelector('#qText').innerHTML);
  await ev(devA, () => window.__mw.net.refresh()); await wait(400);
  check(await ev(devA, () => window.__mw.RD && window.__mw.RD.mainDone === 5) && await ev(devA, () => document.querySelector('#qText').innerHTML) === qB, 'the first device picks up after the answers given on the second, mid-round');
  await ev(devB, () => { document.querySelector('#quitBtn').click(); }); await wait(150);
  await ev(devB, () => document.querySelector('#hubBtn').click()); await wait(150);
  await ev(devB, () => document.querySelector('#tSound').click()); await until(() => ev(devB, () => window.__mw.net.idle()));
  const devC = await newPage(mock); await until(() => ev(devC, () => !document.querySelector('.profile-card').disabled));
  await ev(devC, () => document.querySelectorAll('.profile-card')[1].click()); await wait(150);
  check(await ev(devC, () => document.querySelector('#tSound').getAttribute('aria-pressed') === 'false'), 'turning sounds off follows Riley to another device');
  check(await ev(devC, () => document.querySelector('#nextTitle').textContent !== 'Continue where you left off'), 'a finished round is cleared on every device');
  check(await ev(devC, () => window.__storageWrites) === 0, 'still nothing written to the device');
  /* 10c. a parent view left open on another device redraws when new progress arrives, keeping open question sets */
  await ev(devA, () => document.querySelector('#quitBtn').click()); await wait(150); await ev(devA, () => document.querySelector('#hubBtn').click()); await wait(150);
  await until(() => ev(devA, () => window.__mw.net.idle()));
  await ev(devA, () => window.__mw.openParent('riley')); await wait(300);
  const qsOpen = await ev(devA, () => { const d = document.querySelector('details.pv-qs'); if (d) d.open = true; return !!d; });
  const tile = d => ev(d, () => Number(document.querySelectorAll('.pv-tile b')[2].textContent));
  const pm0 = await tile(devA);
  await ev(devC, () => { const pl = window.__mw.saves.riley, CO = window.COACH; CO.master(pl, CO.current(pl)); window.__mw.net.schedule('riley'); });
  await until(() => ev(devC, () => window.__mw.net.idle()));
  await ev(devA, () => window.__mw.net.refresh()); await wait(400);
  const m1 = await tile(devA);
  check(m1 === pm0 + 1, 'an open parent view updates on its own with progress from another device (' + pm0 + ' to ' + m1 + ')');
  check(!qsOpen || await ev(devA, () => !!document.querySelector('details.pv-qs[open] .pv-q')), 'an open question set stays open when it redraws');
  check(await ev(devA, () => /progress saved at/.test(document.querySelector('.pv-sub').textContent)), 'the parent view says when progress was last saved');
  for (const d of [devA, devB, devC]) await d.close();

  /* 11. service down: the player screen waits, Try again loads */
  const down = create(); down.ctl.down = true;
  p = await newPage(down); await wait(1500);
  check(await ev(p, () => document.querySelector('.profile-card').disabled && !document.querySelector('#saveRetry').hidden), 'with the service down the player screen waits and offers Try again');
  down.ctl.down = false; await p.click('#saveRetry');
  check(await until(() => ev(p, () => !document.querySelector('.profile-card').disabled), 8000), 'Try again loads the saves');
  await p.close();

  /* 12. phone width: no sideways scroll on the hub, a lesson, or problems with pictures from every strand */
  p = await newPage(mock, { width: 360, height: 760, isMobile: true, hasTouch: true });
  await until(() => ev(p, () => !document.querySelector('.profile-card').disabled));
  await ev(p, () => document.querySelectorAll('.profile-card')[1].click()); await wait(200);
  /* too wide: the page scrolls sideways, or anything on the visible screen runs past the edge (the page hides overflow,
     so clipped content would not make it scroll). Pictures inside their own scroll boxes are allowed. */
  const wide = () => ev(p, () => { if (document.documentElement.scrollWidth > window.innerWidth + 1) return true;
    const scr = [...document.querySelectorAll('.screen')].find(x => !x.hidden); if (!scr) return false;
    for (const el of scr.querySelectorAll('*')) { if (el.closest('.q-vis,.vis-wrap,details:not([open]) .chips')) continue; const r = el.getBoundingClientRect(); if (r.width && r.right > window.innerWidth + 1) { window.__wideEl = el.className || el.tagName; return true; } } return false; });
  check(!(await wide()), 'hub fits 360px (' + (await ev(p, () => window.__wideEl || '')) + ')');
  await ev(p, () => document.querySelectorAll('#map details').forEach(d => d.open = true)); await wait(100); check(!(await wide()), 'the full map fits 360px');
  await ev(p, () => window.__mw.openParent('riley')); await wait(250); check(!(await wide()), 'parent view fits 360px (' + (await ev(p, () => window.__wideEl || '')) + ')');
  const sample = await ev(p, () => { const out = []; for (const s of window.COACH.STR) { out.push(s.list[0], s.list[Math.floor(s.list.length / 2)], s.list[s.list.length - 1]); } return out; });
  await ev(p, id => window.__mw.openLesson(id), sample[0]); await wait(120); check(!(await wide()), 'lesson fits 360px');
  const tooWide = [];
  for (const id of sample) { await ev(p, s => { window.__mw.startTest(s); }, id); await wait(80); if (await wide()) tooWide.push(id); await answer(p, false); await answer(p, false); if (await wide()) tooWide.push(id + ' (explanation)'); }
  check(!tooWide.length, 'problems and explanations fit 360px (' + sample.length + ' concepts; too wide: ' + tooWide.join(', ') + ')');
  await p.close();

  /* 12b. how a problem reads on the page, and the mode strip: in your head or pencil and paper */
  p = await newPage(mock); await until(() => ev(p, () => !document.querySelector('.profile-card').disabled));
  await ev(p, () => document.querySelectorAll('.profile-card')[1].click()); await wait(150);
  const showQ = async (id, d, seed) => { await ev(p, (id, d, seed) => { window.__mw.startLearn(id); const R = window.__mw.RD, q = window.MWC.gen(id, d, window.MWC.makeR(seed)); q.ref = { id, d, seed }; R.queue.unshift({ p: q, kind: 'main' }); R.ready = 0; window.__mw.answerRight(); document.querySelector('#nextQBtn').click(); }, id, d, seed); await wait(120); };
  await showQ('s_twostep', 1, 11);
  check(await ev(p, () => !document.querySelector('#qReady').hidden && /pencil and paper/i.test(document.querySelector('#qReady').textContent)), 'a pencil-and-paper round starts by asking for pencil and paper');
  await ev(p, () => document.querySelector('#qReadyBtn').click()); await wait(60);
  check(await ev(p, () => document.querySelector('#qReady').hidden && document.querySelector('#qMode').classList.contains('paper') && /Pencil and paper/.test(document.querySelector('#qMode').textContent) && document.querySelector('#play .qcard').classList.contains('paper')), 'a word problem shows the pencil-and-paper strip');
  check(await ev(p, () => document.querySelectorAll('#qText .ql-say').length >= 2 && document.querySelectorAll('#qText .ql-ask').length === 1 && document.querySelector('#qText .ql:last-child').classList.contains('ql-ask')), 'a story is one sentence to a line with the question last');
  await showQ('a_plus9', 1, 5);
  check(await ev(p, () => document.querySelector('#qReady').hidden && document.querySelector('#qMode').classList.contains('head') && /In your head/.test(document.querySelector('#qMode').textContent) && !document.querySelector('#play .qcard').classList.contains('paper')), 'a shortcut shows the in-your-head strip, with no pencil prompt');
  check(await ev(p, () => /= \?$/.test(document.querySelector('#qText').textContent.trim()) && !document.querySelector('#qText .ql')), 'a bare sum reads as a sum');
  await showQ('g_length', 0, 7);
  check(await ev(p, () => !!document.querySelector('#qText .ql-note') && /centimeters|inches/.test(document.querySelector('#qText .ql-note').textContent)), 'how to type the answer is a small note under the question');
  await showQ('t_ampm', 0, 3); const m0 = await ev(p, () => document.querySelector('#qMode').className);
  await showQ('t_ampm', 2, 3); await ev(p, () => { const r = document.querySelector('#qReady'); if (!r.hidden) document.querySelector('#qReadyBtn').click(); });
  check(/head/.test(m0) && await ev(p, () => document.querySelector('#qMode').classList.contains('paper')), 'a concept can be in your head when easy and pencil and paper when hard');
  check(await ev(p, () => window.__storageWrites) === 0, 'nothing written to the device');
  await p.close();
  /* 12c. Charlie is set to start at 4th grade: opening her map marks everything below it as known, saved online */
  p = await newPage(mock); await until(() => ev(p, () => !document.querySelector('.profile-card').disabled));
  await ev(p, () => document.querySelectorAll('.profile-card')[0].click()); await wait(200); await until(() => ev(p, () => window.__mw.net.idle()));
  { const st = mock.store.charlie && mock.store.charlie.state, ms = st ? Object.values(st.cs || {}).filter(s => s.m).length : 0;
    check(st && st.sg === 4 && ms >= 80 && (!st.pre || st.pre.done || st.pre.floor === 4), 'Charlie starts at 4th grade: ' + ms + ' concepts below it are known, and her check does not go lower');
    check(await ev(p, () => Math.abs(window.COACH.report(window.__mw.saves.charlie, 4).overall.ge - 4) < 0.2), 'her report starts at about grade level 4.0'); }
  await p.close();

  /* 13. a right answer is seen and heard in practice; an assessment gives no sign of right or wrong as it goes */
  const m13 = create();
  p = await newPage(m13); await until(() => ev(p, () => !document.querySelector('.profile-card').disabled));
  await ev(p, () => document.querySelectorAll('.profile-card')[1].click()); await wait(200);
  await ev(p, () => { const S = window.__mw.snd, log = window.__snd = []; for (const k of ['right', 'again', 'wrong', 'tick', 'win', 'click', 'coin', 'star']) { const f = S[k].bind(S); S[k] = (...a) => { log.push(k); return f(...a); }; } });
  const sounds = () => ev(p, () => window.__snd.splice(0));
  const look = () => ev(p, () => { const q = s => document.querySelector(s), d = q('#kpDisp'), fb = q('#feedback'), hero = q('#playHero svg'), c = q('#playCur'), keys = q('.kp-keys'), h = fb.querySelector('.fb-h');
    return { fbClass: fb.hidden ? 'hidden' : fb.className, head: h ? h.textContent.trim() : '', ok: !!d && d.classList.contains('ok'), bad: !!d && d.classList.contains('bad'), tick: !!q('#kpDisp .kp-ok'), keysShown: !!keys && getComputedStyle(keys).display !== 'none',
      mood: hero && hero.getAttribute('data-mood'), jump: q('#playHero').classList.contains('jump'), curShown: getComputedStyle(c).display !== 'none', fx: window.__mw.fx, treats: window.__mw.saves.riley.cur,
      chips: [...document.querySelectorAll('#feedback .fb-streak,#feedback .fb-gain')].map(x => x.textContent.trim()), dotPop: !!q('#dots i.ok.pop'), streak: q('#streak').textContent }; });
  const typeAndCheck = async () => { await ev(p, () => { window.__mw.type(String(window.__mw.RD.cur.p.ans)); document.querySelector('#checkBtn').click(); document.querySelector('#checkBtn').click(); }); await wait(60); };
  await ev(p, () => document.querySelector('#preBtn').click()); await wait(200);
  const a0 = await look(); await sounds();
  check((await cur(p)).kind === 'pre' && !a0.curShown, 'an assessment keeps the treat counter out of sight');
  let t0 = Date.now(); await answer(p, true); const aR = await look(), sR = await sounds();
  await until(() => cur(p).then(x => x && x.phase === 'ask'), 4000); const waitR = Date.now() - t0;
  t0 = Date.now(); await answer(p, false); const aW = await look(), sW = await sounds();
  await until(() => cur(p).then(x => x && x.phase === 'ask'), 4000); const waitW = Date.now() - t0;
  check(aR.head === aW.head && /saved/i.test(aR.head) && aR.fbClass === aW.fbClass && !/good|bad|try/.test(aR.fbClass), 'assessment: the same plain note after a right and a wrong answer (' + aR.head + ' / ' + aW.head + ')');
  check(sR.join() === 'tick' && sW.join() === 'tick', 'assessment: the same tick for right and wrong (' + sR + ' / ' + sW + ')');
  check(aR.mood === 'neutral' && aW.mood === 'neutral' && !aR.ok && !aR.tick && !aW.bad && !aR.jump && aR.fx === 0 && aW.fx === 0 && !aR.chips.length, 'assessment: no green box, stars, jump or sad face');
  check(Math.abs(waitR - waitW) < 300 && waitR < 1500, 'assessment: the same short pause either way (' + waitR + ' / ' + waitW + ' ms)');
  check(aR.treats === a0.treats + 2 && aW.treats === aR.treats, 'assessment: treats are still earned, quietly');
  await ev(p, () => document.querySelector('#quitBtn').click()); await wait(200);
  check(await ev(p, () => !document.querySelector('#hub').hidden && /won't say right or wrong/.test(document.querySelector('#preText').textContent)), 'the assessment card says the results come at the end of each block');
  /* practice */
  await ev(p, () => { const pl = window.__mw.saves.riley; pl.pre = window.COACH.pretestStart(3); pl.pre.done = true; window.__mw.startLearn('a_plus9'); }); await wait(200);
  await sounds(); const b0 = await look();
  check(b0.curShown && b0.keysShown, 'practice shows the treat counter and the keys');
  await typeAndCheck(); const b1 = await look(), s1 = await sounds();
  check(s1.includes('right') && !s1.includes('tick'), 'practice: a right answer rings (' + s1 + ')');
  check(b1.ok && b1.tick && !b1.keysShown, 'practice: the answer box turns green with a check and the keys fold away');
  check(/good/.test(b1.fbClass) && b1.fx >= 20 && b1.mood === 'happy' && b1.jump && b1.dotPop, 'practice: praise, stars, a happy jump and the new dot pops (' + JSON.stringify([b1.fbClass, b1.fx, b1.mood, b1.jump, b1.dotPop]) + ')');
  check(b1.treats === b0.treats + 10 && b1.chips.join() === '+10', 'practice: the treats earned show next to the praise (' + b1.chips + ')');
  await next(p); const b1n = await look(); check(b1n.keysShown && !b1n.ok && b1n.fbClass === 'hidden', 'the next problem starts with a fresh answer box and keys');
  await typeAndCheck(); const b2 = await look();
  check(b2.chips.some(c => /^2 in a row/.test(c)) && /2 in a row/.test(b2.streak), 'practice: the streak shows (' + b2.chips + ')');
  await next(p); await sounds();
  await answer(p, false); const b3 = await look(), s3 = await sounds();
  check(s3.includes('wrong') && b3.bad && !b3.ok && b3.keysShown && /try/.test(b3.fbClass) && b3.mood === 'oops' && b3.streak === '', 'practice: a miss buzzes, the box shakes red and the keys stay (' + s3 + ')');
  await answer(p, true); const b4 = await look(), s4 = await sounds();
  check(s4.includes('again') && !s4.includes('right') && b4.ok && !b4.chips.length, 'practice: right on the second try rings a gentler bell, no streak or treats (' + s4 + ')');
  await p.close();

  /* 14. practice blocks: a quiet memory check opens the block, what slipped goes back on the path first, and the block
     ends when its problems are done, never by the clock; assessment blocks are never cut off either */
  const m14 = create();
  p = await newPage(m14); await until(() => ev(p, () => !document.querySelector('.profile-card').disabled));
  await ev(p, () => document.querySelectorAll('.profile-card')[1].click()); await wait(200);
  const ids14 = await ev(p, () => { const pl = window.__mw.saves.riley, CO = window.COACH; pl.pre = CO.pretestStart(3); pl.pre.done = true; const out = [];
    for (let id; (id = CO.current(pl)) && out.length < 8; ) { CO.master(pl, id, Date.now() - 3 * 864e5, -1000); out.push(id); } window.__mw.openLesson(out[0]); document.querySelector('#lessonBack').click(); return out; });
  await wait(150);
  check(await ev(p, () => /memory check/i.test(document.querySelector('#nextSub').textContent) && /20 minutes/.test(document.querySelector('#nextSub').textContent)), 'with concepts due, today’s practice opens with a memory check');
  await ev(p, () => document.querySelector('#nextBtn').click()); await wait(200);
  const a14 = await ev(p, () => { const R = window.__mw.RD; return { kind: R && R.kind, ids: R && R.ids, n: R && R.mainTotal, cur: getComputedStyle(document.querySelector('#playCur')).display, badge: document.querySelector('#qBadge').textContent, skip: document.querySelector('#skipBtn').textContent, hint: document.querySelector('#hintBtn').hidden }; });
  check(a14.kind === 'audit' && a14.ids.length === 4 && a14.n === 8, 'the memory check is two problems each on 4 due concepts (' + JSON.stringify(a14) + ')');
  check(a14.cur === 'none' && a14.badge === 'Memory check' && /remember/.test(a14.skip) && a14.hint, 'it is quiet like an assessment: no treat counter, no hints, an “I don’t remember” button');
  const plan = {}; plan[a14.ids[0]] = [1, 1]; plan[a14.ids[1]] = [1, 0]; plan[a14.ids[2]] = [0, 0]; plan[a14.ids[3]] = ['s', 's'];
  const used = {}; let notes = new Set();
  for (let i = 0; i < 20; i++) {
    if (await resultsShown(p)) break;
    const c = await ev(p, () => { const R = window.__mw.RD; return R && R.cur ? { aid: R.cur.aid, phase: R.phase } : null; });
    if (!c || c.phase !== 'ask') { await wait(80); continue; }
    const k = used[c.aid] = (used[c.aid] | 0) + 1, act = plan[c.aid][k - 1];
    if (act === 's') await ev(p, () => (document.querySelector('#skipBtn').click(), document.querySelector('#skipBtn').click())); else await answer(p, !!act);
    notes.add(await ev(p, () => document.querySelector('#feedback .fb-h').textContent.trim()));
    await until(() => ev(p, () => !document.querySelector('#results').hidden || (window.__mw.RD && window.__mw.RD.phase === 'ask')), 3000);
  }
  check([...notes].every(t => /saved|Skipped/.test(t)), 'no right or wrong during the check (' + [...notes].join(' / ') + ')');
  const r14 = await ev(p, () => ({ title: document.querySelector('#resTitle').textContent, pass: document.querySelectorAll('.place.aud-pass').length, shaky: document.querySelectorAll('.place.aud-shaky').length, lapse: document.querySelectorAll('.place.aud-lapse').length, keep: !document.querySelector('#nextLessonBtn').hidden && document.querySelector('#nextLessonBtn').textContent }));
  check(r14.pass === 1 && r14.shaky === 1 && r14.lapse === 2, 'the results show what held, what was wobbly and what slipped (' + JSON.stringify(r14) + ')');
  const st14 = await ev(p, ids => { const pl = window.__mw.saves.riley, CO = window.COACH; return { held: CO.isMastered(pl, ids[0]), wob: CO.isMastered(pl, ids[1]) && pl.cs[ids[1]].sh === 1, slip: !CO.isMastered(pl, ids[2]) && CO.isLapsed(pl, ids[2]) && CO.isLapsed(pl, ids[3]), cur: CO.current(pl) }; }, ids14);
  check(st14.held && st14.wob && st14.slip && (st14.cur === ids14[2] || st14.cur === ids14[3]), 'a slipped concept is no longer mastered and comes first on the path (' + JSON.stringify(st14) + ')');
  check(r14.keep === 'Keep going', 'the results say Keep going');
  await ev(p, () => document.querySelector('#nextLessonBtn').click()); await wait(200);
  check(await ev(p, id => !document.querySelector('#lesson').hidden && document.querySelector('#lsTitle').textContent === window.MWC.S[id].title && /slipped/.test(document.querySelector('#lsStatus').textContent), st14.cur), 'Keep going opens the slipped concept’s lesson again');
  /* the clock never ends a block; the last round is sized to the problems left, and the block ends with it */
  const g14 = await ev(p, () => { const b = window.__mw.blk; b.ms = 3 * window.COACH.SESSION_MS; b.goal = b.n + 4; document.querySelector('#startBtn').click(); return window.__mw.RD.mainTotal; }); await wait(150);
  check(g14 === 4, 'the round fits the 4 problems left in the block (' + g14 + ')');
  for (let i = 0; i < 3; i++) { await answer(p, true); await next(p); }
  check(await ev(p, () => document.querySelector('#results').hidden && window.__mw.RD && window.__mw.RD.phase === 'ask'), 'an hour on the clock does not stop the block');
  await answer(p, true); await next(p); await wait(150);
  const e14 = await ev(p, () => ({ res: !document.querySelector('#results').hidden, block: document.querySelector('#resBlock').textContent, keep: document.querySelector('#nextLessonBtn').hidden, map: document.querySelector('#hubBtn').textContent }));
  check(e14.res && /block is done/i.test(e14.block) && /Next block: about \d+ problems/.test(e14.block) && e14.keep && /map/i.test(e14.map), 'when its problems are done the block ends and says how big the next one is (' + JSON.stringify(e14) + ')');
  check(await ev(p, () => { const pl = window.__mw.saves.riley; return pl.ppace > 1 && pl.bhist.length === 1 && window.COACH.blockGoal(pl) < pl.bhist[0].goal + 99; }), 'a block that ran long raises her pace and is kept in the block history');
  await until(() => ev(p, () => window.__mw.net.idle()));
  check(m14.store.riley.state.blk && m14.store.riley.state.blk.done === true && m14.store.riley.state.blk.n >= 9, 'the block is saved online');
  check(await ev(p, () => { const b = window.__mw.saves.riley.bhist[0]; return Array.isArray(b.q) && b.q.length >= b.n && b.q.every(q => q[0] && q[4]); }), 'every problem of the block is kept for the parent view');
  { await ev(p, () => window.__mw.openParent('riley')); await wait(250);
    const bv = await ev(p, () => { const ds = [...document.querySelectorAll('#pvBody details.pv-blk')], d = ds.find(x => /Practice block/.test(x.textContent)); if (!d) return { n: ds.length };
      d.open = true; d.dispatchEvent(new Event('toggle')); const b = d.querySelector('.pv-qbody');
      return { n: ds.length, asm: ds.some(x => /block \d+ of \d+/.test(x.textContent)), q: b.querySelectorAll('.pv-q').length, bad: /NaN|undefined|\[object/.test(b.textContent), conf: /every block/.test(document.querySelector('#pvBody').textContent) }; });
    check(bv.n >= 1 && bv.q >= 9 && !bv.bad && bv.conf, 'the parent view lists every block and opens one to review its problems (' + JSON.stringify(bv) + ')'); }
  check(m14.store.riley.state.cs[ids14[2]].lx > 0, 'the slipped concept is saved online');
  await ev(p, () => document.querySelector('#hubBtn').click()); await wait(150);
  check(await ev(p, () => /done/.test(document.querySelector('#nextTitle').textContent) && document.querySelectorAll('#map .chip.lapsed').length >= 1), 'the map says today is done and marks what slipped');
  /* an assessment block keeps going past 20 minutes until its parts are done */
  await ev(p, () => { const pl = window.__mw.saves.riley; pl.pre = window.COACH.pretestStart(3); pl.pre.t = Date.now(); pl.pre.bt = 2 * window.COACH.BLOCK_MS; window.__mw.startPre(); }); await wait(200);
  await answer(p, true);
  check(await until(() => ev(p, () => window.__mw.RD && window.__mw.RD.phase === 'ask'), 4000) && await ev(p, () => document.querySelector('#results').hidden), 'an assessment block is not cut off at 20 minutes');
  /* "I haven't learned this yet" takes two presses, and Back undoes the last answer */
  { const before = await ev(p, () => JSON.stringify(window.__mw.saves.riley.pre.st));
    await ev(p, () => document.querySelector('#skipBtn').click()); await wait(40);
    const once = await ev(p, () => window.__mw.RD.phase === 'ask' && /Tap again/.test(document.querySelector('#skipBtn').textContent) && JSON.stringify(window.__mw.saves.riley.pre.st));
    await ev(p, () => document.querySelector('#skipBtn').click());
    await until(() => ev(p, () => window.__mw.RD && window.__mw.RD.phase === 'ask'), 3000);
    const moved = await ev(p, () => JSON.stringify(window.__mw.saves.riley.pre.st)), backShown = await ev(p, () => !document.querySelector('#backBtn').hidden);
    await ev(p, () => document.querySelector('#backBtn').click()); await wait(120);
    const after = await ev(p, () => JSON.stringify(window.__mw.saves.riley.pre.st));
    check(once === before && moved !== before && backShown && after === before && await ev(p, () => window.__mw.RD.phase === 'ask'), 'skipping takes two presses, and Back undoes the answer and asks again'); }
  await p.close();

  /* 15. earlier-grade spot checks: a kid who starts at 4th grade gets two assumed concepts checked as a block opens;
     a check that is tapped through does not count; a check answered properly does */
  const m15 = create();
  p = await newPage(m15); await until(() => ev(p, () => !document.querySelector('.profile-card').disabled));
  await ev(p, () => document.querySelectorAll('.profile-card')[0].click()); await wait(200);
  const as15 = await ev(p, () => { const pl = window.__mw.saves.charlie, CO = window.COACH; pl.pre = CO.pretestStart(4, { floor: 4, p: pl }); pl.pre.done = true; CO.pretestApply(pl, pl.pre); Object.values(pl.cs).forEach(s => { if (s.m) s.m -= 2 * 864e5; }); /* placed two days ago */
    window.__mw.openLesson('a_plus9'); document.querySelector('#lessonBack').click(); return CO.assumedList(pl).length; });
  await wait(150);
  check(as15 >= 80 && await ev(p, () => /memory check/i.test(document.querySelector('#nextSub').textContent)), 'Charlie has ' + as15 + ' assumed concepts, and her block opens with a memory check');
  await ev(p, () => { window.__mwRushMs = null; document.querySelector('#nextBtn').click(); }); await wait(200);
  const e15 = await ev(p, () => { const R = window.__mw.RD, pl = window.__mw.saves.charlie; return { kind: R && R.kind, ids: R && R.ids, ok: R && R.ids.every(id => pl.cs[id].pl && !pl.cs[id].at && window.MWC.S[id].g < 4), early: window.__mw.blk.early }; });
  check(e15.kind === 'audit' && e15.ids.length === 2 && e15.ok && e15.early === 2, 'it checks two earlier-grade concepts she has never been checked on (' + JSON.stringify(e15) + ')');
  for (let i = 0; i < 80 && !(await resultsShown(p)); i++) { if (await ev(p, () => window.__mw.RD && window.__mw.RD.phase === 'ask')) await ev(p, () => (document.querySelector('#skipBtn').click(), document.querySelector('#skipBtn').click())); await wait(120); }
  await until(() => resultsShown(p), 5000);
  const f15 = await ev(p, ids => { const pl = window.__mw.saves.charlie, CO = window.COACH, lg = Object.values(pl.log || {}); return { title: document.querySelector('#resTitle').textContent, lapsed: ids.filter(id => CO.isLapsed(pl, id)).length, assumed: CO.assumedList(pl).length, ar: lg.reduce((a, e) => a + (e.ar || 0), 0), w: ids.reduce((a, id) => a + (pl.cs[id].w | 0), 0) }; }, e15.ids);
  check(/too fast/i.test(f15.title) && f15.lapsed === 0 && f15.assumed === as15 && f15.ar === 1 && f15.w === 0, 'a check tapped through does not count: nothing slips (' + JSON.stringify(f15) + ')');
  await ev(p, () => { window.__mwRushMs = 0; document.querySelector('#hubBtn').click(); }); await wait(150);
  const ids15 = await ev(p, () => { const pl = window.__mw.saves.charlie, ids = window.COACH.earlyPick(pl, 2, window.__mw.blk.seen); window.__mw.startAudit(ids); return ids; }); await wait(150);
  for (let i = 0; i < 80 && !(await resultsShown(p)); i++) { if (await ev(p, () => window.__mw.RD && window.__mw.RD.phase === 'ask')) await answer(p, true); await wait(120); }
  await until(() => resultsShown(p), 5000);
  const g15 = await ev(p, ids => { const pl = window.__mw.saves.charlie, CO = window.COACH; return { title: document.querySelector('#resTitle').textContent, pa: ids.map(id => pl.cs[id].pa), iv: ids.map(id => pl.cs[id].iv), left: CO.assumedList(pl).length, rep: CO.report(pl, 4).retention.early }; }, ids15);
  check(g15.pa.every(x => x === 1) && g15.iv.every(x => x === 27) && g15.left < as15 - 2 && g15.rep.checked === 2 && g15.rep.vouched >= 1, 'a check answered properly counts: both held, next check in 27 days, and each vouches for the one before it (' + JSON.stringify(g15) + ')');
  await until(() => ev(p, () => window.__mw.net.idle()));
  await ev(p, () => window.__mw.openParent('charlie')); await wait(250);
  check(await ev(p, () => /Earlier-grade spot checks/.test(document.querySelector('#pvBody').textContent) && /too fast to count/.test(document.querySelector('#pvBody').textContent) && !/NaN|undefined/.test(document.querySelector('#pvBody').textContent)), 'the parent view reports the spot checks and the check that was too fast');
  await p.close();

  check(errs.length === 0, 'no page errors: ' + errs.slice(0, 5).join(' | '));
  await browser.close();
  console.log(`${n - failed} of ${n} checks passed${failed ? ', ' + failed + ' FAILED' : ''}`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
