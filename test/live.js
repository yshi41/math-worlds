/* Live smoke check: loads the published site against the stand-in save service (never the real saves). */
const puppeteer = require('puppeteer-core'); const { create } = require('./mockcloud.js');
(async () => { const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--mute-audio', '--disable-speech-api'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); const m = create(); await m.attach(p);
  await p.goto('https://yshi41.github.io/math-worlds/', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500));
  await p.evaluate(() => document.querySelectorAll('.profile-card')[0].click()); await new Promise(r => setTimeout(r, 300));
  await p.evaluate(() => window.__mw.startPre()); await new Promise(r => setTimeout(r, 300));
  const ok = await p.evaluate(() => !!window.__mw.RD && window.__mw.RD.kind === 'pre');
  console.log('live loads:', ok, 'errors:', errs.length ? errs : 'none', 'real hits:', m.stats.realHits); await b.close(); })();
