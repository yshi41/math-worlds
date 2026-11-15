/* Screenshots for a look: node probe.js ../index.html  (uses the stand-in save service) */
const puppeteer = require('puppeteer-core'), path = require('path');
const { create } = require('./mockcloud.js');
const F = 'file:///' + path.resolve(process.argv[2] || '../index.html').split(String.fromCharCode(92)).join('/');
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--mute-audio', '--disable-speech-api'] });
  const mock = create(); const errs = [];
  for (const vp of [{ width: 1100, height: 900, n: 'd' }, { width: 390, height: 844, n: 'm', isMobile: true, hasTouch: true }]) {
    const p = await browser.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.setViewport(vp); await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]); await mock.attach(p); await p.goto(F); await wait(1500);
    await p.screenshot({ path: `shot-${vp.n}-menu.png` });
    await p.evaluate(() => document.querySelectorAll('.profile-card')[1].click()); await wait(500);
    await p.screenshot({ path: `shot-${vp.n}-hub.png`, fullPage: true });
    await p.evaluate(() => document.querySelector('#preBtn').click()); await wait(500);
    await p.screenshot({ path: `shot-${vp.n}-pre.png` });
    for (let i = 0; i < 4; i++) { await p.evaluate(() => window.__mw.answerRight()); await wait(1300); }
    await p.screenshot({ path: `shot-${vp.n}-pre2.png` });
    await p.evaluate(() => window.__mw.startLesson('make10', 'solve')); await wait(400);
    await p.screenshot({ path: `shot-${vp.n}-play.png` });
    await p.evaluate(() => window.__mw.answerWrong()); await wait(300);
    await p.screenshot({ path: `shot-${vp.n}-try.png` });
    await p.evaluate(() => window.__mw.answerWrong()); await wait(300);
    await p.screenshot({ path: `shot-${vp.n}-reveal.png`, fullPage: true });
    await p.evaluate(() => document.querySelector('#nextQBtn').click()); await wait(300);
    await p.screenshot({ path: `shot-${vp.n}-step.png` });
    for (const sk of ['quarter', 'makeamt', 'countcoins', 'elapsed']) { await p.evaluate(s => window.__mw.startLesson(s, 'solve'), sk); await wait(400); await p.screenshot({ path: `shot-${vp.n}-${sk}.png`, fullPage: true }); }
    await p.evaluate(() => window.__mw.openLesson('countup')); await wait(300); await p.evaluate(() => { for (let i = 0; i < 6; i++) document.querySelector('#lsStepBtn').click(); }); await wait(300);
    await p.screenshot({ path: `shot-${vp.n}-lesson.png`, fullPage: true });
    await p.close();
  }
  console.log('errors:', errs.length ? errs : 'none'); await browser.close();
})();
