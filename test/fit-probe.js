/* Does every problem fit on one screen, with no scrolling? node fit-probe.js ../index.html [--all]
   Renders every concept at every level on a phone, a tablet and a laptop and reports the ones taller than the screen. */
const puppeteer = require('puppeteer-core');
const path = require('path');
const { create } = require('./mockcloud.js');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const file = path.resolve(process.argv[2] || '../index.html'), F = 'file:///' + file.split(String.fromCharCode(92)).join('/');
const VIEWS = [['phone', { width: 390, height: 664, isMobile: true, hasTouch: true }], ['tablet', { width: 820, height: 1050 }], ['laptop', { width: 1366, height: 657 }]];
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio', '--disable-speech-api', '--disable-gpu'] });
  const all = {};
  for (const [name, vp] of VIEWS) {
    const mock = create(), p = await browser.newPage(); await p.setViewport(vp); await mock.attach(p); await p.goto(F);
    for (let i = 0; i < 100; i++) { if (await p.evaluate(() => { const c = document.querySelector('.profile-card'); return c && !c.disabled; })) break; await wait(100); }
    await p.evaluate(() => document.querySelectorAll('.profile-card')[1].click()); await wait(300);
    const ids = await p.evaluate(() => window.MWC.LIST.map(c => c.id));
    await p.evaluate(id => window.__mw.startLearn(id), ids[0]); await wait(300);
    const over = await p.evaluate(async ids => {
      const out = [], MW = window.__mw.MW, sleep = ms => new Promise(r => setTimeout(r, ms));
      for (const id of ids) for (let d = 0; d < 3; d++) for (let s = 1; s <= 3; s++) {
        const R = window.__mw.RD; if (!R) return out; R.stop = false; R.mainDone = 0; R.ready = 1;
        const q = MW.gen(id, d, MW.makeR(s * 7919 + d)); q.ref = { id, d, seed: s * 7919 + d };
        R.queue.unshift({ p: q, kind: 'main' }); document.querySelector('#nextQBtn').click();
        await sleep(0); const h = document.documentElement.scrollHeight, H = innerHeight;
        if (h > H + 1) out.push([id, d, h - H]);
      }
      return out;
    }, ids);
    all[name] = over;
    const worst = over.slice().sort((a, b) => b[2] - a[2]).slice(0, 12);
    const concepts = new Set(over.map(o => o[0]));
    console.log(`${name} ${vp.width}x${vp.height}: ${over.length} of ${ids.length * 9} problems scroll (${concepts.size} concepts). Worst: ${worst.map(o => o[0] + '/' + o[1] + ' +' + o[2]).join(', ')}`);
    await p.close();
  }
  if (process.argv.includes('--json')) require('fs').writeFileSync(path.join(__dirname, 'fit-probe.json'), JSON.stringify(all));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
