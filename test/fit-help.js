/* Does every step of the step-by-step lesson (help lessons and "I have no clue") stay on one screen?
   node fit-help.js ../index.html [--views phone,laptop] [--limit n]
   For every grade 2-8 concept with break-down steps, at each level, it walks the lesson: each task as asked, after a
   wrong answer and after a second wrong answer (the answer shown), and reports every state taller than the screen. */
const puppeteer = require('puppeteer-core'), path = require('path');
const { create } = require('./mockcloud.js');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const args = process.argv.slice(2), file = path.resolve(args[0] || '../index.html'), F = 'file:///' + file.split(String.fromCharCode(92)).join('/');
const opt = k => { const i = args.indexOf(k); return i < 0 ? null : args[i + 1]; };
const ALLV = [['phoneS', { width: 360, height: 600, isMobile: true, hasTouch: true }], ['phone', { width: 390, height: 664, isMobile: true, hasTouch: true }],
  ['tabletP', { width: 820, height: 1050, hasTouch: true }], ['tabletL', { width: 1180, height: 740, hasTouch: true }], ['laptopS', { width: 1280, height: 600 }]];
const only = opt('--views'), VIEWS = only ? ALLV.filter(v => only.split(',').includes(v[0])) : ALLV;
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 0, args: ['--mute-audio', '--disable-speech-api', '--disable-gpu'] });
  let bad = 0;
  for (const [name, vp] of VIEWS) {
    const mock = create(), p = await browser.newPage(); await p.setViewport(vp); await mock.attach(p); await p.goto(F);
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    for (let i = 0; i < 100; i++) { if (await p.evaluate(() => { const c = document.querySelector('.profile-card'); return c && !c.disabled; })) break; await wait(100); }
    await p.evaluate(() => document.querySelectorAll('.profile-card')[1].click()); await wait(300);
    const ids = await p.evaluate(() => window.MWC.LIST.filter(c => c.g <= 8).map(c => c.id)); const lim = +(opt('--limit') || 0); if (lim) ids.splice(lim);
    const over = await p.evaluate(async ids => {
      const out = [], M = window.__mw, seen = { n: 0, lesson: 0, zoomed: 0, min: 1, minAt: null }, sleep = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))), de = document.documentElement, o = () => de.scrollHeight - innerHeight;
      for (const id of ids) for (let d = 0; d < 3; d++) {
        try { M.openHelp(id, true, null, { clue: true, d, back: 'map' }); document.querySelector('#hvDone').click(); } catch (e) { out.push([id, d, 'open', -1]); continue; }
        for (let n = 0; n < 12 && M.HL && M.HL.task; n++) { await sleep(); let v = o(); const k = M.HL.task.kind; seen.n++; if (!document.querySelector('#hlLesson').hidden) seen.lesson++; { const z = parseFloat(document.querySelector('#help .hl-card').style.zoom) || 1; if (z < 1) seen.zoomed++; if (z < seen.min) { seen.min = z; seen.minAt = id + '/' + d + '/' + k; } }
          if (v > 1) out.push([id, d, k + ':ask', v]);
          if (M.HL.ask) { for (let w = 0; w < 2; w++) { M.type('9999'); document.querySelector('#hlCheck').click(); await sleep(); v = o(); if (v > 1) out.push([id, d, k + (w ? ':shown' : ':wrong'), v]); if (!M.HL.ask) break; } }
          const nx = document.querySelector('#hlNext'); if (nx.hidden) break; const ti = M.HL.ti; nx.click(); if (!M.HL || M.HL.ti === ti) break; }
      }
      out.seen = seen; return [out, seen];
    }, ids).then(r => { console.log('  states ' + JSON.stringify(r[1])); return r[0]; });
    bad += over.length; const by = {}; over.forEach(x => { const s = x[2].split(':')[1] || x[2]; by[s] = (by[s] || 0) + 1; });
    console.log(`${name} ${vp.width}x${vp.height}: ${over.length} lesson states scroll ${JSON.stringify(by)}. Worst: ${over.sort((a, b) => b[3] - a[3]).slice(0, 8).map(x => x.slice(0, 3).join('/') + ' +' + x[3]).join(', ')}${errs.length ? ' ERRORS ' + errs.slice(0, 3).join(' | ') : ''}`);
    await p.close();
  }
  await browser.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
