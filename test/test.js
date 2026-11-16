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
  let asked = 0, stoppedOnce = false;
  for (let i = 0; i < 300; i++) {
    const c = await cur(p); if (!c || c.roundKind !== 'pre') break;
    if (c.phase !== 'ask') { await wait(60); continue; }
    asked++; await answer(p, G.grade[c.nx.skill] <= 2);
    if (asked === 7 && !stoppedOnce) { /* stop part way, come back: the check picks up where it left off */
      stoppedOnce = true; await until(() => cur(p).then(x => x && x.phase === 'ask'), 3000); await ev(p, () => document.querySelector('#quitBtn').click()); await wait(200);
      check(await ev(p, () => !document.querySelector('#hub').hidden && /Continue/.test(document.querySelector('#preBtn').textContent)), 'stopping keeps the placement check to continue');
      await ev(p, () => document.querySelector('#preBtn').click()); await wait(200);
    }
    await until(() => ev(p, () => { const R = window.__mw.RD; return !R || R.phase === 'ask' || !document.querySelector('#results').hidden; }), 4000);
    if (await resultsShown(p)) break;
  }
  await until(() => resultsShown(p), 5000);
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
  check(await ev(p, id => document.querySelector('#nextTitle').textContent === window.MWC.S[id].title, nextId), 'the Up next button names it');
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
  check(await ev(p, () => !document.querySelector('#nextLessonBtn').hidden && /Next concept/.test(document.querySelector('#nextLessonBtn').textContent)), 'the results offer the next concept');
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
  await ev(p, () => window.__mw.startReview()); await wait(150);
  let revs = 0; for (let i = 0; i < 12; i++) { const c = await cur(p); if (!c || c.roundKind !== 'review') break; if (c.phase !== 'ask') { await next(p); continue; } if (c.kind === 'rev') revs++; await answer(p, true); await next(p); if (await resultsShown(p)) break; }
  check(revs >= 5, 'a review mix is made of mastered concepts (' + revs + ')');
  check(await ev(p, () => window.__mw.saves.riley.cs[window.__dueId].due > Date.now()), 'a reviewed concept is scheduled again');

  /* 8. typing: keys depend on the grade, and every answer form can be typed */
  const keysOf = async id => { await ev(p, s => window.__mw.startLearn(s), id); await wait(100); return ev(p, () => [...document.querySelectorAll('.kp .key:not(.blank)')].map(b => b.dataset.k).join(' ')); };
  const g2 = G.order.find(id => G.grade[id] === 2 && /^a_/.test(id)), g7 = G.order.find(id => G.grade[id] === 7 && /^n_int/.test(id));
  const k2 = await keysOf(g2); check(!/[.\/−]/.test(k2), '2nd grade pads have just the digits (' + k2 + ')');
  if (g7) { const k7 = await keysOf(g7); check(/−/.test(k7) && /\./.test(k7) && /\//.test(k7), '7th grade pads have − . / (' + k7 + ')'); }
  const typeRight = async id => { await ev(p, s => window.__mw.startLearn(s), id); await wait(100); const raw = await ev(p, () => window.MWC.rawFor(window.__mw.RD.cur.p)); await ev(p, s => window.__mw.type(s), raw); await p.keyboard.press('Enter'); await wait(60); return ev(p, () => window.__mw.RD.phase === 'done' && window.__mw.RD.tries === 0); };
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
  await ev(p, () => document.querySelector('#skipBtn').click()); await wait(1300);
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
  await ev(devB, () => { document.querySelector('#quitBtn').click(); }); await wait(150);
  await ev(devB, () => document.querySelector('#hubBtn').click()); await wait(150);
  await ev(devB, () => document.querySelector('#tSound').click()); await until(() => ev(devB, () => window.__mw.net.idle()));
  const devC = await newPage(mock); await until(() => ev(devC, () => !document.querySelector('.profile-card').disabled));
  await ev(devC, () => document.querySelectorAll('.profile-card')[1].click()); await wait(150);
  check(await ev(devC, () => document.querySelector('#tSound').getAttribute('aria-pressed') === 'false'), 'turning sounds off follows Riley to another device');
  check(await ev(devC, () => document.querySelector('#nextTitle').textContent !== 'Continue where you left off'), 'a finished round is cleared on every device');
  check(await ev(devC, () => window.__storageWrites) === 0, 'still nothing written to the device');
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

  check(errs.length === 0, 'no page errors: ' + errs.slice(0, 5).join(' | '));
  await browser.close();
  console.log(`${n - failed} of ${n} checks passed${failed ? ', ' + failed + ' FAILED' : ''}`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
