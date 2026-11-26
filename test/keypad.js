/* Typing must always show: node keypad.js ../index.html
   Every answer here is typed with real taps on the keys that are on screen (and real key presses), and read back from
   the answer box that is on screen, the way a kid uses the game. The other browser checks call the game's own
   functions, so they pass even when the box on screen stays empty.
   Checked after each way through a help lesson, because a help lesson has its own keypad:
   1. "I have no clue" tutorial, then back to the problem;
   2. a help lesson that starts inside a round (two answers shown), then back to practice;
   3. a help lesson left part way with Back;
   4. a help lesson opened from a concept's page, then practice;
   5. a round picked up again from the map after a help lesson.
   Talks only to the in-memory stand-in in mockcloud.js. */
const puppeteer = require('puppeteer-core');
const path = require('path');
const { create } = require('./mockcloud.js');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const file = path.resolve(process.argv[2] || '../index.html');
const F = 'file:///' + file.split(String.fromCharCode(92)).join('/');
const wait = ms => new Promise(r => setTimeout(r, ms));
let n = 0, failed = 0;
const check = (ok, what) => { n++; console.log((ok ? '  ok   ' : '  FAIL ') + what); if (!ok) failed++; };
const until = async (fn, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await fn()) return true; await wait(60); } return false; };

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio', '--disable-speech-api', '--disable-gpu'] });
  const errs = [];
  const open = async viewport => {
    const mock = create(), p = await browser.newPage();
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    await p.setViewport(viewport || { width: 1100, height: 860 });
    await mock.attach(p);
    await p.evaluateOnNewDocument(() => { window.__mwNoTut = true; window.__mwRushMs = 0; window.__mwNoStretch = true; window.__mwFast = true; });
    await p.goto(F);
    await until(() => p.evaluate(() => !document.querySelector('.profile-card').disabled));
    await p.evaluate(() => document.querySelectorAll('.profile-card')[1].click()); await wait(200);
    return p;
  };
  /* the keypad a kid can see: its answer box, where a key is, and what is really under that spot */
  const pad = (p, k) => p.evaluate(k => {
    const shown = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
    const kps = [...document.querySelectorAll('.kp')], vis = kps.filter(shown), kp = vis[0] || null;
    const disp = kp && kp.querySelector('.kp-display'), key = kp && [...kp.querySelectorAll('.key')].find(b => b.dataset.k === k);
    const r = key && shown(key) ? key.getBoundingClientRect() : null, x = r ? r.left + r.width / 2 : 0, y = r ? r.top + r.height / 2 : 0, top = r ? document.elementFromPoint(x, y) : null;
    return { pads: kps.length, shown: vis.length, boxes: document.querySelectorAll('#kpDisp').length, text: disp ? disp.textContent.trim() : null, x, y, key: !!r, hit: !!top && (top === key || key.contains(top)), under: top ? (top.id || top.className || top.tagName) : null };
  }, k);
  const ready = p => p.evaluate(() => { const r = document.querySelector('#qReady'); if (r && !r.hidden) document.querySelector('#qReadyBtn').click(); });
  /* tap 4 then 7 on the keys, then press 2 on the keyboard: the box on screen has to read 472 */
  const typing = async (p, what) => {
    await ready(p); await wait(120);
    const a = await pad(p, '4');
    if (!a.key) { check(false, what + ': no key 4 on screen (' + JSON.stringify(a) + ')'); return; }
    await p.mouse.click(a.x, a.y); await wait(60);
    const b = await pad(p, '7'); await p.mouse.click(b.x, b.y); await wait(60);
    await p.keyboard.press('2'); await wait(80);
    const c = await pad(p, '4');
    check(a.hit && b.hit && c.text === '472' && c.shown === 1, what + ': tapping 4, 7 and pressing 2 shows 472 in the answer box (shows "' + c.text + '", ' + c.boxes + ' answer box' + (c.boxes === 1 ? '' : 'es') + ' in the page, key under the finger: ' + a.under + ')');
    for (let i = 0; i < 3; i++) await p.keyboard.press('Backspace');
    await wait(60);
  };
  const lessonOn = p => p.evaluate(() => !document.querySelector('#help').hidden);
  /* go through a help lesson: watch the video, then answer every step on its keys */
  const throughLesson = async (p, stopAtTask) => {
    await until(() => p.evaluate(() => !document.querySelector('#hvAfter').hidden || document.querySelector('#hlVideo').hidden), 20000);
    if (await p.evaluate(() => !document.querySelector('#hlVideo').hidden)) { await p.evaluate(() => document.querySelector('#hvDone').click()); await wait(80); }
    for (let i = 0; i < 40; i++) {
      const s = await p.evaluate(() => { const q = s => document.querySelector(s), on = s => !q(s).hidden; return { les: on('#hlLesson'), check: on('#hlCheck'), next: on('#hlNext'), feel: on('#hlFeel'), done: on('#hlDone') }; });
      if (s.done) return 'done';
      if (s.feel) { await p.evaluate(() => document.querySelector('#hfBtns [data-f="yes"]').click()); await wait(80); continue; }
      if (s.les && s.check) { if (stopAtTask) return 'task'; await p.evaluate(() => { const H = window.__mw.HL; window.__mw.type(window.__mw.MW.rawFor(H.task.p)); document.querySelector('#hlCheck').click(); }); }
      else if (s.les && s.next) await p.evaluate(() => document.querySelector('#hlNext').click());
      await wait(70);
    }
    return 'stuck';
  };
  const asking = p => p.evaluate(() => { const R = window.__mw.RD; return !document.querySelector('#play').hidden && !!R && R.phase === 'ask'; });

  /* 0. before any help lesson */
  let p = await open();
  await p.evaluate(() => window.__mw.startLearn('a_coladd')); await wait(200);
  await typing(p, 'a fresh round');

  /* 1. "I have no clue", through the tutorial, back to the problem */
  await p.evaluate(() => { window.__mwClueMs = 0; }); await until(() => p.evaluate(() => !document.querySelector('#clueBtn').hidden), 4000);
  await p.evaluate(() => document.querySelector('#clueBtn').click()); await wait(60); await p.evaluate(() => document.querySelector('#clueBtn').click()); await wait(200);
  check(await lessonOn(p), 'the tutorial opens');
  await typingInLesson(p, 'in the tutorial');
  check(await throughLesson(p) === 'done', 'the tutorial runs to its end');
  await p.evaluate(() => { window.__mwClueMs = 1e9; document.querySelector('#hdBtn').click(); }); await wait(300);
  check(await asking(p), 'back on the problem, and it is being asked');
  await typing(p, 'after "I have no clue"');
  /* and on the problems after it */
  await p.evaluate(() => window.__mw.answerRight()); await wait(80); await p.evaluate(() => document.querySelector('#nextQBtn').click()); await wait(150);
  await typing(p, 'on the next problem after the tutorial');
  await p.close();

  /* 2. a help lesson that starts inside a round: two problems missed twice */
  p = await open();
  await p.evaluate(() => window.__mw.startLearn('a_coladd')); await wait(200); await ready(p);
  for (let i = 0; i < 12 && !(await lessonOn(p)); i++) {
    const st = await p.evaluate(() => { const R = window.__mw.RD; return { ask: !!R && R.phase === 'ask', next: !document.querySelector('#nextQBtn').hidden }; });
    if (st.ask) { await p.evaluate(() => window.__mw.answerWrong()); await wait(60); await p.evaluate(() => { const R = window.__mw.RD; if (R && R.phase === 'ask') window.__mw.answerWrong(); }); await wait(60); }
    await p.evaluate(() => { const b = document.querySelector('#nextQBtn'); if (!b.hidden) b.click(); }); await wait(120);
  }
  check(await lessonOn(p), 'two answers shown bring a help lesson');
  check(await throughLesson(p) === 'done', 'the help lesson runs to its end');
  await p.evaluate(() => document.querySelector('#hdBtn').click()); await wait(300);
  check(await asking(p), 'back in practice, and a problem is being asked');
  await typing(p, 'after a help lesson inside a round');
  await p.close();

  /* 3. a help lesson left part way, on a step with keys, with Back */
  p = await open();
  await p.evaluate(() => window.__mw.startLearn('a_coladd')); await wait(200); await ready(p);
  await p.evaluate(() => { window.__mwClueMs = 0; }); await until(() => p.evaluate(() => !document.querySelector('#clueBtn').hidden), 4000);
  await p.evaluate(() => document.querySelector('#clueBtn').click()); await wait(60); await p.evaluate(() => document.querySelector('#clueBtn').click()); await wait(200);
  check(await throughLesson(p, true) === 'task', 'the tutorial reaches a step with keys');
  await p.evaluate(() => { window.__mwClueMs = 1e9; document.querySelector('#hlBack').click(); }); await wait(300);
  check(await asking(p), 'Back returns to the problem');
  await typing(p, 'after leaving a help lesson part way');
  await p.close();

  /* 4. a help lesson opened from a concept's page, then practice on a phone-size screen */
  p = await open({ width: 390, height: 664, isMobile: true, hasTouch: true });
  await p.evaluate(() => window.__mw.openHelp('a_coladd', false)); await wait(200);
  check(await throughLesson(p) === 'done', 'the lesson from the concept page runs to its end');
  await p.evaluate(() => document.querySelector('#hdBtn').click()); await wait(200);
  await p.evaluate(() => window.__mw.startLearn('a_coladd')); await wait(250);
  await typing(p, 'practice after a lesson opened from the concept page (phone)');
  /* 5. stop, and pick the round up again from the map */
  await p.evaluate(() => { window.__mw.net.schedule('riley'); }); await wait(700);
  await p.evaluate(() => window.__mw.resumeRound()); await wait(250);
  await typing(p, 'a round picked up again from the map (phone)');
  await p.close();

  check(errs.length === 0, 'no page errors: ' + errs.slice(0, 5).join(' | '));
  await browser.close();
  console.log(`${n - failed} of ${n} checks passed${failed ? ', ' + failed + ' FAILED' : ''}`);
  process.exit(failed ? 1 : 0);

  /* the lesson's own keypad: on a step with keys, tapping shows in the lesson's answer box */
  async function typingInLesson(p, what) {
    const at = await throughLesson(p, true);
    if (at !== 'task') { check(false, what + ': never reached a step with keys'); return; }
    const a = await pad(p, '5'); await p.mouse.click(a.x, a.y); await wait(60);
    await p.keyboard.press('8'); await wait(80);
    const c = await pad(p, '5');
    check(a.hit && c.text === '58' && c.shown === 1, what + ': tapping 5 and pressing 8 shows 58 (shows "' + c.text + '", ' + c.boxes + ' answer box' + (c.boxes === 1 ? '' : 'es') + ' in the page)');
    for (let i = 0; i < 2; i++) await p.keyboard.press('Backspace');
    await wait(60);
  }
})().catch(e => { console.error(e); process.exit(1); });
