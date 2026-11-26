/* Play whole blocks the way a kid does, and stop the moment she could not go on.
     node soak.js ../index.html [--saves saves.json] [--kid riley] [--view laptop|tablet|phone] [--n 80] [--seed 1] [--shots dir]
   Every answer is typed with real taps on the keys on screen (and real key presses on the laptop view) and every
   button is pressed where it is on screen, so a key that is covered, off the screen or dead is found. Right and wrong
   answers, hints, "I have no clue", help lessons, leaving a lesson part way and going over mistakes are all mixed in.
   It fails when:
   - what was typed does not show in the answer box on screen;
   - a button she needs is covered by something else or is off the screen while a problem is asked;
   - nothing can be pressed and nothing happens for 8 seconds (stuck);
   - the page throws an error.
   With --saves it starts from a copy of real saves (a file of GET /saves) and plays that kid's next blocks from the
   map; without it, it plays practice rounds on a spread of concepts. It talks only to the in-memory stand-in in
   mockcloud.js, never to the real save service, and Math.random is seeded so a run can be repeated. */
const puppeteer = require('puppeteer-core');
const path = require('path'), fs = require('fs');
const { create } = require('./mockcloud.js');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const file = path.resolve(args[0] && !args[0].startsWith('--') ? args[0] : '../index.html');
const F = 'file:///' + file.split(String.fromCharCode(92)).join('/');
const KID = opt('kid', 'riley'), VIEW = opt('view', 'laptop'), N = +opt('n', 80), SEED = +opt('seed', 1), SAVES = opt('saves', null), SHOTS = opt('shots', null);
const VIEWS = { laptop: { width: 1366, height: 657 }, tablet: { width: 820, height: 1050, hasTouch: true, isMobile: true }, phone: { width: 390, height: 664, hasTouch: true, isMobile: true } };
const TOUCH = VIEW !== 'laptop';
const wait = ms => new Promise(r => setTimeout(r, ms));
let seed = SEED >>> 0; const rnd = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const fails = [], tally = { answered: 0, right: 0, wrong: 0, hints: 0, clues: 0, lessons: 0, lessonSteps: 0, left: 0, mistakes: 0, blocks: 0, typed: 0, presses: 0 };

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio', '--disable-speech-api', '--disable-gpu'] });
  const mock = create(), p = await browser.newPage(), errs = [];
  if (SAVES) { const s = JSON.parse(fs.readFileSync(path.resolve(SAVES), 'utf8')).players; for (const k in s) mock.store[k] = JSON.parse(JSON.stringify(s[k])); }
  p.on('pageerror', e => errs.push(e.message));
  await p.setViewport(VIEWS[VIEW]);
  await mock.attach(p);
  await p.evaluateOnNewDocument(s => { let a = s >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    window.__mwRushMs = 0; window.__mwNoStretch = true; window.__mwFast = true; window.__mwClueMs = 1e9; }, SEED * 7919 + 13);
  await p.goto(F);

  const snap = () => p.evaluate(() => {
    const q = s => document.querySelector(s), shown = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
    const scr = [...document.querySelectorAll('.screen')].find(s => !s.hidden), M = window.__mw, R = M.RD, H = M.HL, it = R && R.cur, pq = it && it.p ? (R.part === 1 && it.p.first ? it.p.first : it.p) : null;
    const B = {}; ['#qReadyBtn', '#checkBtn', '#nextQBtn', '#hintBtn', '#clueBtn', '#skipBtn', '#backBtn', '#hvDone', '#hlCheck', '#hlNext', '#hdBtn', '#hlBack', '#startBtn', '#testOutBtn', '#nextBtn', '#nextLessonBtn', '#againBtn', '#hubBtn'].forEach(s => { const e = q(s); B[s] = shown(e) && !e.disabled; });
    return { screen: scr ? scr.id : null, ready: !!M.player || !q('.profile-card') || !q('.profile-card').disabled,
      rd: R ? { kind: R.kind, phase: R.phase, part: R.part | 0, tries: R.tries | 0, item: it ? it.kind : null, ref: it && it.p ? (it.p.ref || { id: it.p.skill }) : null, done: R.mainDone, total: R.mainTotal } : null,
      raw: pq && pq.type ? M.MW.rawFor(pq) : null,
      hl: H ? { id: H.id, stage: H.stage, ti: H.ti, ask: !!H.ask, playing: !!H.playing, raw: H.ask && H.task && H.task.p ? M.MW.rawFor(H.task.p) : null } : null,
      btn: B, feel: [...document.querySelectorAll('#hfBtns button')].filter(shown).length, pad: [...document.querySelectorAll('.kp')].filter(shown).length, pads: document.querySelectorAll('.kp').length,
      blockDone: !!scr && scr.id === 'results' && shown(q('#resBlock')) && /block is done/.test(q('#resBlock').textContent),
      res: scr && scr.id === 'results' ? q('#resTitle').textContent + ' / ' + q('#nextLessonBtn').textContent : '' };
  });
  const where = s => `${s.screen}${s.rd ? ` ${s.rd.kind}/${s.rd.item} ${s.rd.phase}${s.rd.part ? ' part ' + s.rd.part : ''} ${JSON.stringify(s.rd.ref)}` : ''}${s.hl ? ` lesson ${s.hl.id} ${s.hl.stage} step ${s.hl.ti}` : ''}`;
  let shots = 0;
  const fail = async (what, s) => { fails.push(what + ' @ ' + where(s)); console.log('  FAIL ' + what + ' @ ' + where(s));
    if (SHOTS && shots < 12) { fs.mkdirSync(SHOTS, { recursive: true }); await p.screenshot({ path: path.join(SHOTS, `soak-${KID}-${VIEW}-${SEED}-${++shots}.png`) }); } };
  /* where an element is on screen, and whether a finger put there really lands on it */
  const locate = (sel, key) => p.evaluate((sel, key) => {
    const shown = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
    const all = key != null ? [...document.querySelectorAll('.kp .key')].filter(b => b.dataset.k === key) : [...document.querySelectorAll(sel)], el = all.find(shown);
    if (!el) return null;
    let r = el.getBoundingClientRect(), off = r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth;
    if (off) { el.scrollIntoView({ block: 'center' }); r = el.getBoundingClientRect(); }
    const x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y);
    return { x, y, off, hit: !!top && (top === el || el.contains(top)), under: top ? (top.id ? '#' + top.id : top.className || top.tagName) : 'nothing' };
  }, sel, key);
  /* press something where it is on screen; in the middle of a problem it must be in view and not covered */
  const press = async (sel, s, key) => {
    const at = await locate(sel, key), name = key != null ? `key "${key}"` : sel;
    if (!at) { await fail(`${name} is not on screen`, s); return false; }
    const strict = s.screen === 'play' || (s.screen === 'help' && key != null);
    if (at.off && strict) await fail(`${name} was off the screen and needed scrolling`, s);
    if (!at.hit) { await fail(`${name} is covered by ${at.under}`, s); return false; }
    if (TOUCH) await p.touchscreen.tap(at.x, at.y); else await p.mouse.click(at.x, at.y);
    tally.presses++; return true;
  };
  const boxText = () => p.evaluate(() => { const shown = e => !!e && e.getClientRects().length > 0, kp = [...document.querySelectorAll('.kp')].find(shown), d = kp && kp.querySelector('.kp-display'); if (!d) return null;
    const c = d.cloneNode(true); c.querySelectorAll('.ph,.unit,.kp-ok').forEach(e => e.remove()); return c.textContent; });
  /* type an answer on the keys (and, on the laptop, partly on the keyboard), then read it back from the box on screen */
  const type = async (raw, s) => {
    const keyboard = !TOUCH && rnd() < 0.4;
    /* anything left in the box (an answer the game would not take, such as 2/0) is rubbed out first, as a kid would */
    const typedIn = async () => ((await boxText()) || '').replace(/[^0-9\/.r−-]/g, '');
    for (let i = 0; i < 16 && (await typedIn()); i++) { if (keyboard) await p.keyboard.press('Backspace'); else if (!(await press(null, s, '⌫'))) return false; await wait(25); }
    const left = await typedIn(); if (left) { await fail(`the answer box still shows ${JSON.stringify(left)} after rubbing it out`, s); return false; }
    for (const ch of raw) {
      if (keyboard) await p.keyboard.press(ch === ' ' ? 'Space' : ch);
      else if (!(await press(null, s, ch === '-' ? '\u2212' : ch))) return false;
      await wait(25);
    }
    await wait(40); tally.typed++;
    const got = await boxText(), want = raw.replace(/\D/g, ''), have = got == null ? null : got.replace(/\D/g, '');
    if (have !== want) { await fail(`typed ${JSON.stringify(raw)} ${keyboard ? 'on the keyboard' : 'on the keys'} but the answer box on screen shows ${JSON.stringify(got)}`, s); return false; }
    return true;
  };
  /* a wrong answer: the last digit changed (never to a lone 0 under a fraction bar, which is not an answer at all) */
  const wrongOf = raw => raw.replace(/\d(?=\D*$)/, d => { const x = String((+d + 1 + Math.floor(rnd() * 8)) % 10); return x === '0' && /\/\d$/.test(raw) ? String(+d % 9 + 1) : x; });

  /* pick the player, or without saves start a round directly */
  for (let i = 0; i < 100 && !(await snap()).ready; i++) await wait(100);
  const start = await snap();
  if (!(await press(`.profile-card:nth-child(${{ charlie: 1, riley: 2, yan: 3 }[KID]})`, start))) { console.log('could not pick the player'); process.exit(1); }
  await wait(250);
  const SPREAD = ['a_coladd', 't_hour', 'c_coins', 'f_half', 'm_groups', 'n_place', 'd_picture', 'a_make10', 'f_addlike', 'd_lineplot', 'p_twostep', 'a_fixit', 'a_bigcol', 'm_fixit'];
  let spreadAt = 0;
  const nextRound = async () => { const id = SPREAD[spreadAt++ % SPREAD.length]; await p.evaluate(id => { if (window.__mw.MW.S[id]) window.__mw.startLearn(id); }, id); await wait(200); };
  if (!SAVES) await nextRound();

  let idle = 0, lastSig = '', lessonSeen = null, t0 = Date.now();
  for (let step = 0; step < 6000 && tally.answered < N && fails.length < 8; step++) {
    if (errs.length) { await fail('page error: ' + errs.splice(0).join(' | '), await snap()); }
    const s = await snap(); let did = true;
    if (s.screen === 'menu') did = await press(`.profile-card:nth-child(${{ charlie: 1, riley: 2, yan: 3 }[KID]})`, s);
    else if (s.screen === 'hub') { if (SAVES) did = await press('#nextBtn', s); else await nextRound(); }
    else if (s.screen === 'lesson') did = await press(s.btn['#startBtn'] ? '#startBtn' : '#testOutBtn', s);
    else if (s.screen === 'results') {
      if (/Go over my mistakes/.test(s.res)) tally.mistakes++;
      if (s.blockDone) tally.blocks++;
      if (s.btn['#nextLessonBtn']) did = await press('#nextLessonBtn', s); else if (s.btn['#hubBtn']) did = await press('#hubBtn', s); else did = false;
    }
    else if (s.screen === 'help') {
      if (lessonSeen !== s.hl.id + ':' + s.hl.stage) { if (s.hl.stage === 'video') tally.lessons++; lessonSeen = s.hl.id + ':' + s.hl.stage; }
      if (s.btn['#hdBtn']) did = await press('#hdBtn', s);
      else if (s.feel) did = await press(`#hfBtns button:nth-child(${1 + Math.floor(rnd() * 3)})`, s);
      else if (s.btn['#hlCheck'] && s.hl.ask && s.hl.raw != null) {
        if (rnd() < 0.08) { tally.left++; did = await press('#hlBack', s); }
        else { tally.lessonSteps++; if (!s.pad) await fail('a lesson step is asked but there are no keys on screen', s);
          if (await type(rnd() < 0.75 ? s.hl.raw : wrongOf(s.hl.raw), s)) did = await press('#hlCheck', s); else did = false; }
      }
      else if (s.btn['#hlNext']) did = await press('#hlNext', s);
      else if (s.btn['#hvDone']) did = await press('#hvDone', s);
      else did = s.hl.playing ? 'wait' : false;
    }
    else if (s.screen === 'play' && s.rd) {
      if (s.btn['#qReadyBtn']) did = await press('#qReadyBtn', s);
      else if (s.rd.phase === 'ask' && s.rd.item !== 'tut' && s.raw != null) {
        if (!s.pad) { await fail('a problem is asked but there are no keys on screen', s); did = false; }
        else if (s.pads !== 1) { await fail(`${s.pads} keypads are in the page at once`, s); did = false; }
        else {
          const quiet = s.rd.item === 'pre' || s.rd.item === 'aud', roll = rnd();
          if (!quiet && roll < 0.05 && s.rd.kind !== 'tut') { /* "I have no clue" */
            await p.evaluate(() => { window.__mwClueMs = 0; }); for (let i = 0; i < 30 && !(await snap()).btn['#clueBtn']; i++) await wait(100);
            const c = await snap(); await p.evaluate(() => { window.__mwClueMs = 1e9; });
            if (!c.btn['#clueBtn']) { await fail('"I have no clue" never appeared', c); did = false; }
            else { tally.clues++; await press('#clueBtn', c); await wait(80); did = await press('#clueBtn', c); }
          } else {
            if (!quiet && roll < 0.15 && s.btn['#hintBtn']) { tally.hints++; await press('#hintBtn', s); await wait(60); }
            const right = rnd() < (s.rd.item === 'step' ? 0.85 : 0.68);
            if (await type(right ? s.raw : wrongOf(s.raw), s)) {
              const s2 = await snap();
              if (!s2.btn['#checkBtn']) { await fail('an answer is typed but Check is not on screen', s2); did = false; }
              else { await press('#checkBtn', s2); await wait(70); did = await press('#checkBtn', s2); tally.answered++; if (right) tally.right++; else tally.wrong++; }
            } else did = false;
          }
        }
      }
      else if (s.btn['#nextQBtn']) did = await press('#nextQBtn', s);
      else did = 'wait';
    }
    else did = 'wait';
    await wait(did === true ? 110 : 100);
    const sig = JSON.stringify([s.screen, s.rd, s.hl && [s.hl.stage, s.hl.ti, s.hl.ask], s.btn, s.res]);
    if (did === true && sig !== lastSig) idle = 0; else if (!(s.hl && s.hl.playing)) idle++;
    lastSig = sig;
    if (idle > 80) { await fail('stuck: nothing to press and nothing happening for 8 seconds (buttons on screen: ' + Object.keys(s.btn).filter(k => s.btn[k]).join(' ') + ')', s); break; }
  }
  if (errs.length) await fail('page error: ' + errs.join(' | '), await snap());
  const end = await snap();
  console.log(`${KID} on a ${VIEW}, seed ${SEED}: ${tally.answered} problems answered (${tally.right} typed right, ${tally.wrong} typed wrong), ${tally.hints} hints, ${tally.clues} "I have no clue", ${tally.lessons} help lessons (${tally.lessonSteps} steps typed, left part way ${tally.left} times), mistakes gone over ${tally.mistakes} times, ${tally.blocks} blocks finished, ${tally.typed} answers typed and read back, ${tally.presses} presses, ${Math.round((Date.now() - t0) / 1000)} s. Ended on: ${where(end)}`);
  console.log(fails.length ? fails.length + ' FAILED' : 'never stuck, everything typed showed on screen');
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
