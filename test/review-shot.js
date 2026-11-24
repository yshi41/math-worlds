/* Screenshots of the parent view's block review on a phone and a laptop, from a copy of saves (never the real service).
   node test/review-shot.js <saves.json> <out dir> [kid] */
const puppeteer = require('puppeteer-core'), path = require('path'), { create } = require('./mockcloud.js');
const [file, out, who = 'riley'] = process.argv.slice(2);
(async () => {
  const saves = require(path.resolve(file)).players, b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--mute-audio', '--disable-speech-api'] });
  for (const [name, vp] of [['phone', { width: 390, height: 844 }], ['laptop', { width: 1280, height: 860 }]]) {
    const p = await b.newPage(); await p.setViewport(vp); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const m = create(); for (const k in saves) m.store[k] = JSON.parse(JSON.stringify(saves[k])); await m.attach(p);
    await p.goto('file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/'), { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 1500));
    await p.evaluate(k => window.__mw.openParent(k), who); await new Promise(r => setTimeout(r, 1500));
    await p.evaluate(() => document.querySelector('#pvBlocks').scrollIntoView());
    await p.evaluate(() => { const d = document.querySelector('#pvBody details.pv-blk'); d.open = true; d.dispatchEvent(new Event('toggle')); });
    await new Promise(r => setTimeout(r, 300)); await p.evaluate(() => document.querySelector('#pvBlocks').scrollIntoView());
    await p.screenshot({ path: path.join(out, `rv-${name}-list.png`) });
    await p.evaluate(() => document.querySelector('#pvBody .pv-qbody [data-rv][data-f="all"]').click()); await new Promise(r => setTimeout(r, 300));
    await p.screenshot({ path: path.join(out, `rv-${name}-1.png`), fullPage: true });
    await p.evaluate(() => { const b = document.querySelector('#rvFilt [data-f="miss"]'); if (!b.hidden) b.click(); const h = document.querySelector('.rv-how'); if (h) h.open = true; }); await new Promise(r => setTimeout(r, 300));
    await p.screenshot({ path: path.join(out, `rv-${name}-miss.png`), fullPage: true });
    console.log(name, 'errors:', errs.length ? errs : 'none', 'blocks posted:', m.stats.bposts, 'archived:', Object.keys(m.blocks[who] || {}).length);
    await p.close();
  }
  await b.close();
})();
