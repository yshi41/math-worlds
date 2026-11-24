/* Does a problem stay on one screen in every state, not just when it is first asked?
   node fit-states.js ../index.html [--shots dir] [--views phone,tablet]
   For every grade 2-8 concept at each level, on small and large phones, tablets both ways and laptops, it measures the
   page while the problem is asked, after a hint, after a wrong answer (try again), after a second wrong answer (the answer
   shown) and after a right answer, and reports every state that is taller than the screen. */
const puppeteer = require('puppeteer-core'), path = require('path'), fs = require('fs');
const { create } = require('./mockcloud.js');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const args = process.argv.slice(2), file = path.resolve(args[0] || '../index.html'), F = 'file:///' + file.split(String.fromCharCode(92)).join('/');
const opt = k => { const i = args.indexOf(k); return i < 0 ? null : args[i + 1]; };
const ALLV = [['phoneS', { width: 360, height: 600, isMobile: true, hasTouch: true }], ['phone', { width: 390, height: 664, isMobile: true, hasTouch: true }],
  ['phoneL', { width: 430, height: 740, isMobile: true, hasTouch: true }], ['tabletP', { width: 820, height: 1050, hasTouch: true }], ['tabletL', { width: 1180, height: 740, hasTouch: true }],
  ['laptop', { width: 1366, height: 657 }], ['laptopS', { width: 1280, height: 600 }]];
const only = opt('--views'), VIEWS = only ? ALLV.filter(v => only.split(',').includes(v[0])) : ALLV, shots = opt('--shots');
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 0, args: ['--mute-audio', '--disable-speech-api', '--disable-gpu'] });
  let bad = 0; const report = {};
  for (const [name, vp] of VIEWS) {
    const mock = create(), p = await browser.newPage(); await p.setViewport(vp); await mock.attach(p); await p.goto(F);
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    for (let i = 0; i < 100; i++) { if (await p.evaluate(() => { const c = document.querySelector('.profile-card'); return c && !c.disabled; })) break; await wait(100); }
    await p.evaluate(() => document.querySelectorAll('.profile-card')[1].click()); await wait(300);
    const ids = await p.evaluate(() => window.MWC.LIST.filter(c => c.g <= 8).map(c => c.id)); const lim = +(opt('--limit') || 0); if (lim) ids.splice(lim);
    await p.evaluate(id => { window.__mwClueMs = 1e9; window.__mw.startLearn(id); }, ids[0]); await wait(300);
    const res = await p.evaluate(async ids => {
      const out = [], small = [], M = window.__mw, MW = M.MW, sleep = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))), de = document.documentElement;
      const o = () => de.scrollHeight - innerHeight;
      const put = (id, d, s) => { const R = M.RD; R.stop = false; R.mainDone = 0; R.ready = 1; R.results = []; R.streak = 0;
        const q = MW.gen(id, d, MW.makeR(s)); q.ref = { id, d, seed: s }; R.queue.unshift({ p: q, kind: 'main' }); document.querySelector('#nextQBtn').click(); };
      const vis = el => el && !el.hidden && el.offsetParent !== null;
      for (const id of ids) for (let d = 0; d < 3; d++) {
        const s = 7919 + d, rec = st => { const v = o(); if (v > 1) out.push([id, d, st, v]); const z = parseFloat(document.querySelector('#play .qcard').style.zoom) || 1; if (z < .75) small.push([id, d, st, +z.toFixed(2), !!document.querySelector('#feedback .fb-more')]); };
        put(id, d, s); await sleep(0); rec('ask');
        const hb = document.querySelector('#hintBtn'); if (vis(hb)) { hb.click(); await sleep(0); rec('hint'); }
        M.answerWrong(); await sleep(0); rec('wrong');
        if (M.RD.phase === 'ask') { M.answerWrong(); await sleep(0); rec('shown'); }
        put(id, d, s); await sleep(0); M.answerRight(); await sleep(0); rec('right');
      }
      return { out, small };
    }, ids);
    const over = res.out, small = res.small.sort((a, b) => a[3] - b[3]); console.log('  card scaled under 75%: ' + small.length + (small.length ? ' smallest ' + small.slice(0, 8).map(x => x.slice(0, 4).join('/') + (x[4] ? ' folded' : '')).join(', ') : '')); report[name] = { over, small }; bad += over.length;
    const by = {}; over.forEach(x => { by[x[2]] = (by[x[2]] || 0) + 1; });
    const worst = over.slice().sort((a, b) => b[3] - a[3]).slice(0, 10);
    console.log(`${name} ${vp.width}x${vp.height}: ${over.length} states scroll of ${ids.length * 3} problems ${JSON.stringify(by)}. Worst: ${worst.map(x => x.slice(0, 3).join('/') + ' +' + x[3]).join(', ')}${errs.length ? ' ERRORS ' + errs.slice(0, 3).join(' | ') : ''}`);
    if (shots && worst.length) { fs.mkdirSync(shots, { recursive: true });
      for (const [id, d, st] of worst.slice(0, 3)) { await p.evaluate((id, d, st) => { const M = window.__mw, R = M.RD; R.stop = false; R.mainDone = 0; R.ready = 1;
          const q = M.MW.gen(id, d, M.MW.makeR(7919 + d)); q.ref = { id, d, seed: 7919 + d }; R.queue.unshift({ p: q, kind: 'main' }); document.querySelector('#nextQBtn').click();
          if (st === 'hint') document.querySelector('#hintBtn').click(); if (st === 'wrong' || st === 'shown') M.answerWrong(); if (st === 'shown') M.answerWrong(); if (st === 'right') M.answerRight(); }, id, d, st);
        await wait(150); await p.screenshot({ path: path.join(shots, `${name}-${id}-${d}-${st}.png`) }); } }
    await p.close();
  }
  fs.writeFileSync(path.join(__dirname, 'fit-states.json'), JSON.stringify(report));
  await browser.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
