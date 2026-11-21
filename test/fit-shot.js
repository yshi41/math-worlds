/* Screenshot problems at phone and laptop size, full page, to see what makes them scroll.
   node fit-shot.js ../index.html <outdir> id/d [id/d ...] */
const puppeteer = require('puppeteer-core');
const path = require('path');
const { create } = require('./mockcloud.js');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const file = path.resolve(process.argv[2]), F = 'file:///' + file.split(String.fromCharCode(92)).join('/'), out = process.argv[3], items = process.argv.slice(4);
const VIEWS = [['phone', { width: 390, height: 664, isMobile: true, hasTouch: true }], ['laptop', { width: 1366, height: 657 }], ['tablet', { width: 820, height: 1050 }]];
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio', '--disable-speech-api', '--disable-gpu'] });
  for (const [name, vp] of VIEWS) {
    const mock = create(), p = await browser.newPage(); await p.setViewport(vp); await mock.attach(p); await p.goto(F);
    for (let i = 0; i < 100; i++) { if (await p.evaluate(() => { const c = document.querySelector('.profile-card'); return c && !c.disabled; })) break; await wait(100); }
    await p.evaluate(() => document.querySelectorAll('.profile-card')[1].click()); await wait(300);
    for (const it of items) { const [id, d] = it.split('/');
      await p.evaluate(id => window.__mw.startLearn(id), id); await wait(300);
      const info = await p.evaluate((id, d) => { const R = window.__mw.RD, MW = window.__mw.MW; R.ready = 1; const q = MW.gen(id, +d, MW.makeR(7919)); q.ref = { id, d: +d, seed: 7919 };
        R.queue.unshift({ p: q, kind: 'main' }); document.querySelector('#nextQBtn').click();
        const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return Math.round(b.top) + '..' + Math.round(b.bottom); };
        return { H: innerHeight, page: document.documentElement.scrollHeight, top: r('.play-top'), mode: r('#qMode'), tags: r('.q-tags'), text: r('#qText'), vis: r('#qVis'), ans: r('#answerArea'), act: r('.action-row'), card: r('.qcard') }; }, id, d);
      await wait(100); console.log(name, it, JSON.stringify(info));
      await p.screenshot({ path: path.join(out, `${name}-${id}-${d}.png`), fullPage: true }); }
    await p.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
