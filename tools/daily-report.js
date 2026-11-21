/* The parent report email, made after every block.
   node tools/daily-report.js [--out <folder>] [--day YYYY-MM-DD] [--file saves.json] [--after-block --state <file> [--force]]
   Reads every save from the save service (or a saved copy with --file), and writes report.html (the email),
   report.txt (plain-text version) and subject.txt into the out folder (default: ./out-report). Dates are Central time.
   The numbers come from the same engine as the game's parent view, worked out from every block done so far.
   --after-block: the report is made only when a block (practice or assessment) has finished since the last report.
   The blocks already reported are kept in the --state file. With no new block it writes no files, prints NO NEW BLOCK
   and exits 0; --force makes the report anyway. The first run with no state file records the blocks done so far and
   makes no report (unless --force). */
process.env.TZ = 'America/Chicago';
const fs = require('fs'), path = require('path'), https = require('https');
const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i < 0 ? null : args[i + 1]; }, flag = k => args.includes(k);
const OUT = opt('--out') || 'out-report', SAVES = 'https://math-worlds-saves.yshi41.workers.dev/saves';
const C = require('../src/core.js');
const dir = path.join(__dirname, '..', 'src', 'concepts');
for (const f of fs.readdirSync(dir).filter(f => /\.js$/.test(f)).sort()) require(path.join(dir, f));
const E = require('../src/engine.js'); E.init();
const S = C.S;
/* the children in the report (Yan is the test account), with their grade in the 2026-27 school year */
const KIDS = [{ id: 'riley', name: 'Riley', grade: 3, gy: 2026 }, { id: 'charlie', name: 'Charlie', grade: 4, gy: 2026 }];
const gradeOf = (k, t) => Math.max(2, Math.min(12, k.grade + E.schoolTime(t || Date.now()).year - k.gy));
const get = url => new Promise((res, rej) => https.get(url, { headers: { 'Cache-Control': 'no-store' } }, r => { let s = ''; r.on('data', d => s += d); r.on('end', () => r.statusCode === 200 ? res(s) : rej(new Error('HTTP ' + r.statusCode))); }).on('error', rej));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ord = g => g + (g === 1 ? 'st' : g === 2 ? 'nd' : g === 3 ? 'rd' : 'th');
const pctWord = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th');
const mins = ms => { const m = Math.round(ms / 60000); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; };
const acc = (r, n) => n ? Math.round(100 * r / n) + '%' : '—';
const fmtGE = ge => ge >= 13 ? '12.9+' : ge.toFixed(1);
function gradeWords(ge) { if (ge >= 13) return 'beyond 12th grade'; const g = Math.floor(ge), f = ge - g; return (f < 1 / 3 ? 'early ' : f < 2 / 3 ? 'mid-' : 'late ') + ord(g) + ' grade'; }
function diffWords(d) { const a = Math.abs(d); if (a < 0.25) return 'on grade level'; return a.toFixed(1) + ' grade' + (a >= 1.05 ? 's' : '') + (d > 0 ? ' ahead' : ' behind'); }
const FW = { yes: 'got it', some: 'a little', no: 'not yet' };
const title = id => S[id] ? S[id].title : id;

const tm = t => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const dayTm = t => new Date(t).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ', ' + tm(t);
/* a finished block in plain words */
function blockWords(b) {
  if (b.kind === 'asm') return `${b.by === 'parent' ? 'Assessment' : 'Placement check'} block ${b.i + 1} of ${b.of}${b.stopped ? ', stopped part way' : ''} (${dayTm(b.t)}${b.est ? ', time estimated' : ''}): ${b.ok} of ${b.n} right${b.sk ? `, ${b.sk} skipped as not learned yet` : ''}, ${mins(b.ms || 0)}. Parts: ${(b.parts || []).map(sid => { const st = E.STR.find(x => x.id === sid); return st ? st.name : sid; }).join(', ') || '—'}.`;
  const L = [`Practice block${b.stopped ? `, stopped part way${b.goal ? ` (${b.n} of ${b.goal} problems)` : ''}` : ''} (${dayTm(b.t)}): ${b.n} problems, ${acc(b.ok, b.n)} right on the first try, ${mins(b.ms || 0)}.`];
  if (b.mastered.length) L.push(`Mastered: ${b.mastered.map(title).join('; ')}.`);
  if (b.refreshed.length) L.push(`Mastered again: ${b.refreshed.map(title).join('; ')}.`);
  if (b.seen) L.push(`Memory check: ${b.held} of ${b.seen} still strong${b.lapsed.length ? `; to master again: ${b.lapsed.map(title).join('; ')}` : ''}.`);
  if (b.q) { const miss = {}; b.q.filter(q => q[4] !== 's' && !q[5] && S[q[0]]).forEach(q => { miss[q[0]] = (miss[q[0]] || 0) + 1; });
    const M = Object.entries(miss).sort((a, c) => c[1] - a[1]).slice(0, 4); if (M.length) L.push(`Missed on the first try: ${M.map(([id, n]) => title(id) + (n > 1 ? ` (${n})` : '')).join('; ')}.`); }
  return L.join(' ');
}
function kidSection(k, p, day, now, fresh) {
  fresh = fresh || [];
  const grade = gradeOf(k, now), R = E.report(p, grade, now), O = R.overall, BT = R.blocks;
  const start = new Date(day + 'T00:00:00').getTime(), end = start + 864e5;
  const e = (p.log || {})[day] || {};
  const masteredToday = Object.keys(p.cs || {}).filter(id => S[id] && p.cs[id].m >= start && p.cs[id].m < end && !p.cs[id].pl).map(id => ({ id, test: !!p.cs[id].to }));
  const helpToday = (p.help || []).filter(h => h.t >= start && h.t < end && S[h.id]);
  const spotsToday = Object.entries(p.mist || {}).filter(([id, m]) => S[id] && m && m.t >= start && m.t < end && m.ok < 3).map(([id, m]) => ({ id, n: m.n, why: m.why || '' }));
  const weekAgo = R.trend.length ? (R.trend.filter(t => t.t <= now - 7 * 864e5).pop() || R.trend[0]).ge : O.ge;
  const pre = p.pre, preTxt = pre && !pre.done ? (() => { const pg = E.pretestProgress(pre); return `${pre.by === 'parent' ? 'Assessment' : 'Placement check'} in progress: ${pg.done} of ${pg.total} parts done, block ${pg.block} of ${pg.blocks} next.${p.reset && p.reset.t >= (pre.started || 0) ? ' Progress was reset to this assessment on ' + new Date(p.reset.t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '.' : ''}${E.report(p, gradeOf(k)).partial ? ' The numbers below come from the parts done so far and are worked out again when she finishes.' : ''}${pre.order.some(s => pre.st[s].redo && !pre.st[s].done) ? ' Parts she went through too fast are asked again.' : ''}`; })() : '';
  const preToday = (e.pre | 0);
  const played = (e.n | 0) + preToday + (e.hq | 0) > 0;
  /* plain words */
  const lines = [], justDone = fresh.map(blockWords);
  if (!played) lines.push(`No practice today.`);
  else {
    if (e.n) lines.push(`${e.n} problems, ${acc(e.ok, e.n)} right on the first try, ${mins(e.ms || 0)}.`);
    else if (e.ms) lines.push(`${mins(e.ms)} of play.`);
    if (preToday) lines.push(`${preToday} ${pre && pre.by === 'parent' ? 'assessment' : 'placement'} questions (${e.pok | 0} right).`);
    if (masteredToday.length) lines.push(`Mastered today: ${masteredToday.map(x => title(x.id) + (x.test ? ' (tested out)' : '')).join('; ')}.`);
    if (helpToday.length) lines.push(`Help lessons: ${helpToday.map(h => `${title(h.id)} (after the video: ${FW[h.video] || '—'}; at the end: ${FW[h.lesson] || (h.quit ? 'stopped early' : '—')})`).join('; ')}.`);
    if (e.ac) lines.push(`Memory checks: ${e.ac} earlier concept${e.ac === 1 ? '' : 's'} checked, ${e.ap | 0} held${e.al ? `, ${e.al} slipped and went back on her path to master again` : ''}.`);
    if (e.ar) lines.push(`${e.ar} memory check${e.ar === 1 ? ' was' : 's were'} answered too fast to count (under 7 seconds a problem), so nothing changed.`);
    { const EA = R.retention.early; if (EA.left) lines.push(`Earlier-grade spot checks: ${EA.checked + EA.vouched} of ${EA.checked + EA.vouched + EA.left} covered so far; one or two more in each practice block.`); }
    const blocksToday = E.blockList(p).filter(b => b.done && b.t >= start && b.t < end);
    if (blocksToday.length) lines.push(`Blocks finished today: ${blocksToday.length} (${blocksToday.filter(b => b.kind === 'practice').length} practice, ${blocksToday.filter(b => b.kind === 'asm').length} assessment). Next practice block: about ${E.blockGoal(p)} problems.`);
    if (spotsToday.length) lines.push(`New tricky spots: ${spotsToday.map(s => title(s.id)).join('; ')}.`);
  }
  if (preTxt) lines.push(preTxt);
  const pl = (n, w) => n + ' ' + w + (n === 1 ? '' : 's'), bits = [];
  if (BT.asm) bits.push(`${pl(BT.asm, 'assessment block')} (${BT.asmOk} of ${BT.asmQ} right)`);
  if (BT.prac) bits.push(`${pl(BT.prac, 'practice block')} (${pl(BT.pracN, 'problem')}, ${acc(BT.pracOk, BT.pracN)} right first try)`);
  const basis = BT.count ? `These numbers are worked out from ${BT.count === 1 ? 'the one block' : 'all ' + BT.count + ' blocks'} so far${BT.asm && BT.prac ? ', not from the assessment alone' : ''}: ${bits.join(' and ')}, ${mins(BT.ms)} in all.${BT.prac ? '' : ' Practice blocks will add to this as they are done.'}` : 'No blocks done yet.';
  const flags = [];
  helpToday.filter(h => h.lesson === 'no').forEach(h => flags.push(`${k.name} said she still doesn't get "${title(h.id)}" after a help lesson. Sitting with her on it would help.`));
  if (e.n >= 8 && e.ok / e.n < 0.5) flags.push(`Under half right on the first try today.`);
  if (R.placement && R.placement.done && R.placement.parts.reduce((a, x) => a + x.asked, 0) >= 8 && R.placement.parts.reduce((a, x) => a + x.right, 0) / R.placement.parts.reduce((a, x) => a + x.asked, 0) < 0.5 && !(pre && !pre.done)) flags.push(`Her last placement check was under half right, so her grade level may read low. A new assessment can be started from the Parent view.`);
  const cur = R.current, known = R.placed || R.mastered > 0;
  const html = `
<tr><td style="padding:18px 20px;border-top:1px solid #d5dbe0">
<h2 style="margin:0 0 4px;font:700 20px Verdana,sans-serif;color:#162b31">${esc(k.name)} <span style="font-weight:400;font-size:14px;color:#44585e">${ord(grade)} grade</span></h2>
${justDone.length ? `<p style="margin:8px 0;padding:8px 10px;background:#e6f2ea;border-radius:8px;font:15px/1.5 Verdana,sans-serif;color:#162b31"><b>Just finished:</b><br>${justDone.map(esc).join('<br>')}</p>` : ''}
<p style="margin:8px 0;font:15px/1.5 Verdana,sans-serif;color:#162b31"><b>Today:</b> ${lines.map(esc).join('<br>')}</p>
${flags.length ? `<p style="margin:8px 0;padding:8px 10px;background:#fbe5e2;border-radius:8px;font:14px/1.45 Verdana,sans-serif;color:#5a1d17">${flags.map(esc).join('<br>')}</p>` : ''}
${known ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:10px 0;font:14px Verdana,sans-serif;color:#162b31;border-collapse:collapse">
<tr><td style="padding:6px 8px;background:#eef4f5;border-radius:6px 0 0 6px"><b style="font-size:18px">${fmtGE(O.ge)}${O.ceil ? '+' : ''}</b><br><span style="color:#44585e;font-size:12px">grade level (${esc(gradeWords(O.ge))}, ${esc(diffWords(O.diff))})</span></td>
<td style="padding:6px 8px;background:#eef4f5"><b style="font-size:18px">${R.placed ? '~' + pctWord(R.pct.pct) : '—'}</b><br><span style="color:#44585e;font-size:12px">national percentile (estimate)</span></td>
<td style="padding:6px 8px;background:#eef4f5;border-radius:0 6px 6px 0"><b style="font-size:18px">${R.mastered}</b><br><span style="color:#44585e;font-size:12px">concepts mastered${R.learnedWeek ? ', ' + R.learnedWeek + ' this week' : ''}</span></td></tr></table>
<p style="margin:6px 0;font:13px/1.5 Verdana,sans-serif;color:#44585e">${esc(basis)}</p>
<p style="margin:6px 0;font:13px/1.5 Verdana,sans-serif;color:#44585e">Last 7 days: ${R.week7.n} problems, ${acc(R.week7.ok, R.week7.n)} right first try, ${mins(R.week7.ms)}, ${R.week7.days} of 7 days. Grade level ${Math.abs(O.ge - weekAgo) >= 0.05 ? `moved from ${weekAgo.toFixed(1)} to ${O.ge.toFixed(1)} this week` : `steady at ${O.ge.toFixed(1)} this week`}.${cur ? ` Up next: ${esc(title(cur))}.` : ''}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:8px 0 0;font:13px Verdana,sans-serif;color:#162b31;border-collapse:collapse">
<tr><th align="left" style="padding:4px 6px;border-bottom:2px solid #ccdcdf;font-size:11px;color:#44585e;text-transform:uppercase">Area</th><th align="left" style="padding:4px 6px;border-bottom:2px solid #ccdcdf;font-size:11px;color:#44585e;text-transform:uppercase">Grade level</th><th align="left" style="padding:4px 6px;border-bottom:2px solid #ccdcdf;font-size:11px;color:#44585e;text-transform:uppercase">Compared with average</th></tr>
${R.domains.map(d => `<tr><td style="padding:5px 6px;border-bottom:1px solid #e3eaec">${esc(d.name)}</td><td style="padding:5px 6px;border-bottom:1px solid #e3eaec"><b>${fmtGE(d.ge)}${d.ceil ? '+' : ''}</b></td><td style="padding:5px 6px;border-bottom:1px solid #e3eaec">${esc(diffWords(d.diff))}</td></tr>`).join('')}
</table>` : `<p style="margin:8px 0;font:14px/1.5 Verdana,sans-serif;color:#44585e">Grade levels and the percentile show once the placement check is done.</p>`}
${R.spots.length ? `<p style="margin:10px 0 0;font:13px/1.5 Verdana,sans-serif;color:#162b31"><b>Tricky spots:</b> ${R.spots.slice(0, 5).map(s => esc(title(s.id))).join('; ')}</p>` : ''}
</td></tr>`;
  const text = `${k.name} (${ord(grade)} grade)\n${justDone.length ? 'Just finished:\n' + justDone.map(x => '  ' + x).join('\n') + '\nToday:\n' : ''}${lines.join('\n')}\n${basis}\n${flags.map(f => '! ' + f).join('\n')}${flags.length ? '\n' : ''}${known ? '' : 'Grade levels show once the placement check is done.\n'}Grade level ${fmtGE(O.ge)}${O.ceil ? '+' : ''} (${gradeWords(O.ge)}, ${diffWords(O.diff)})${R.placed ? ', about the ' + pctWord(R.pct.pct) + ' percentile (estimate)' : ''}. ${R.mastered} concepts mastered.\nLast 7 days: ${R.week7.n} problems, ${acc(R.week7.ok, R.week7.n)} right first try, ${mins(R.week7.ms)}.\n` + R.domains.map(d => `  ${d.name}: ${fmtGE(d.ge)} (${diffWords(d.diff)})`).join('\n') + '\n';
  return { html, text: known ? text : text.replace(/Grade level \d[\s\S]*$/, ''), short: fresh.length ? `${k.name} finished ${fresh.length === 1 ? (fresh[0].kind === 'asm' ? 'an assessment block' : 'a practice block') : fresh.length + ' blocks'}` : `${k.name} ${played ? (e.n | 0) + preToday + ' problems today' : 'no practice today'}`, played };
}

(async () => {
  const now = Date.now(), day = opt('--day') || E.dayKey(now);
  const data = JSON.parse(opt('--file') ? fs.readFileSync(opt('--file'), 'utf8') : await get(SAVES)), ps = data.players || {};
  const saveOf = k => (ps[k.id] && ps[k.id].state) || { cs: {}, mist: {}, log: {} };
  /* after-block mode: which finished blocks have not been reported yet */
  const AFTER = flag('--after-block'), STATE = opt('--state'), FORCE = flag('--force');
  ['report.html', 'report.txt', 'subject.txt'].forEach(f => { try { fs.unlinkSync(path.join(OUT, f)); } catch (e) {} });
  /* a block counts once it is finished, or once it has sat untouched for 45 minutes (she stopped part way); a stopped
     block is reported again if she later goes on with it */
  const IDLE = 45 * 60000;
  const doneBlocks = k => E.blockList(saveOf(k)).filter(b => b.t && (b.done || now - b.t >= IDLE) && (b.n || (b.q && b.q.length))).map(b => b.done ? b : Object.assign({}, b, { stopped: 1, key: b.key + '@' + (b.n | 0) }));
  let fresh = {}, state = null;
  if (AFTER) {
    if (!STATE) throw new Error('--after-block needs --state <file>');
    try { state = JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch (e) { state = null; }
    const first = !state; state = state || { seen: {} };
    KIDS.forEach(k => { const seen = new Set(state.seen[k.id] || []); fresh[k.id] = first ? [] : doneBlocks(k).filter(b => !seen.has(b.key)).sort((a, b) => a.t - b.t); });
    const any = KIDS.some(k => fresh[k.id].length);
    const record = () => { KIDS.forEach(k => { state.seen[k.id] = doneBlocks(k).map(b => b.key); }); state.t = now; fs.mkdirSync(path.dirname(STATE), { recursive: true }); fs.writeFileSync(STATE, JSON.stringify(state)); };
    if (!any && !FORCE) { if (first) record(); console.log(first ? 'NO NEW BLOCK (first run: the blocks done so far are recorded)' : 'NO NEW BLOCK'); return; }
    record();
  }
  const parts = KIDS.map(k => kidSection(k, saveOf(k), day, now, fresh[k.id]));
  const dateTxt = new Date(day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const anyFresh = KIDS.some(k => (fresh[k.id] || []).length), when = AFTER ? dayTm(now) : new Date(day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const subject = `Math Worlds ${AFTER ? 'report' : 'daily report'}, ${when}: ${parts.map(x => x.short).join(', ')}`;
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f1f6f7">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f1f6f7"><tr><td align="center" style="padding:16px 8px">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;border:1px solid #ccdcdf;border-radius:12px">
<tr><td style="padding:18px 20px 6px"><div style="font:700 22px Verdana,sans-serif;color:#0e6670">Math Worlds</div><div style="font:14px Verdana,sans-serif;color:#44585e">${AFTER ? `Report ${anyFresh ? 'after the latest block' : 'as of'} · ${esc(dayTm(now))}` : 'Daily report for ' + esc(dateTxt)}</div></td></tr>
${parts.map(x => x.html).join('')}
<tr><td style="padding:14px 20px 18px;border-top:1px solid #d5dbe0;font:12px/1.5 Verdana,sans-serif;color:#44585e">Grade level is 2.0 plus the share of each grade's Common Core concepts mastered; the percentile is an estimate from the NWEA MAP Growth 2025 national math norms, not a test score. Full reports, charts and the assessment button are in the game's Parent view: <a href="https://yshi41.github.io/math-worlds/" style="color:#0e6670">yshi41.github.io/math-worlds</a>.</td></tr>
</table></td></tr></table></body></html>`;
  const text = `Math Worlds ${AFTER ? 'report, ' + dayTm(now) : 'daily report for ' + dateTxt}\n\n${parts.map(x => x.text).join('\n')}\nFull reports: https://yshi41.github.io/math-worlds/ (Parent view)\n`;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'report.html'), html); fs.writeFileSync(path.join(OUT, 'report.txt'), text); fs.writeFileSync(path.join(OUT, 'subject.txt'), subject);
  console.log(subject); console.log('wrote ' + path.resolve(OUT));
})().catch(e => { console.error('daily report failed: ' + e.message); process.exit(1); });
