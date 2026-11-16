/* Common Core coverage: node test/standards.test.js [--strict] [--write]
   Every concept's codes must be real standards. Reports, by grade, how many of the standards a typed-answer game can
   practise have at least one concept. --strict fails if any (grades 2-12, including (+) high school standards) has none.
   --write regenerates docs/STANDARDS.md: every standard with the concepts that practise it, then the extras. */
const fs = require('fs'), path = require('path');
const C = require('../src/core.js');
const dir = path.join(__dirname, '..', 'src', 'concepts');
for (const f of fs.readdirSync(dir).filter(f => /\.js$/.test(f)).sort()) require(path.join(dir, f));
const STRICT = process.argv.includes('--strict'), WRITE = process.argv.includes('--write');
const STD = C.STD, by = {};
let fails = 0; const fail = m => { fails++; console.log('FAIL', m); };
for (const c of C.LIST) for (const code of c.cc || []) { if (!STD[code]) fail(c.id + ' names ' + code + ', which is not a standard'); else (by[code] = by[code] || []).push(c.id); }
const gradeName = g => g <= 8 ? 'Grade ' + g : ({ 9: 'Algebra 1 (grade 9)', 10: 'Geometry (grade 10)', 11: 'Algebra 2 (grade 11)', 12: 'Precalculus (grade 12)' })[g];
const rows = [], missing = [];
for (let g = 1; g <= 12; g++) {
  const list = Object.values(STD).filter(s => s.g === g); if (!list.length) continue;
  const game = list.filter(s => s.game), cov = game.filter(s => by[s.code]);
  const miss = game.filter(s => !by[s.code] && !s.review);
  rows.push(gradeName(g) + ': ' + cov.length + ' of ' + game.length + ' practisable standards covered' + (list.length - game.length ? ' (' + (list.length - game.length) + ' not suited to a typed-answer game)' : '') + (g === 1 ? ' [review]' : ''));
  miss.forEach(s => missing.push(s));
}
const extras = C.LIST.filter(c => !(c.cc && c.cc.length));
console.log(rows.join('\n'));
console.log(C.LIST.length + ' concepts: ' + (C.LIST.length - extras.length) + ' aligned to Common Core, ' + extras.length + ' extras beyond it');
if (missing.length) { console.log(missing.length + ' practisable standards with no concept:'); missing.forEach(s => console.log('  ' + s.code + (s.plus ? ' (+)' : '') + ': ' + s.text)); if (STRICT) fail('uncovered standards'); }
if (WRITE) {
  const esc = s => String(s).replace(/\|/g, '/');
  let md = '# Math Worlds and the Common Core\n\nEvery Common Core math standard from grade 1 (review) to high school, with the Math Worlds concepts that practise it.\n'
    + 'High school is placed by course: Algebra 1 = grade 9, Geometry = 10, Algebra 2 = 11, Precalculus = 12. (+) marks the advanced high school standards.\n'
    + 'Standards a typed-answer game cannot practise (drawing, constructing, proofs, explaining, collecting data) are listed with the reason; those are for pencil, paper and conversation.\n\n'
    + rows.map(r => '- ' + r).join('\n') + '\n- ' + (C.LIST.length - extras.length) + ' concepts are aligned; ' + extras.length + ' are extras beyond the Common Core.\n';
  for (let g = 1; g <= 12; g++) {
    const list = Object.values(STD).filter(s => s.g === g).sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true })); if (!list.length) continue;
    md += '\n## ' + gradeName(g) + '\n\n| Standard | What it asks | Concepts |\n|---|---|---|\n';
    list.forEach(s => { md += '| ' + s.code + (s.plus ? ' (+)' : '') + ' | ' + esc(s.text) + ' | ' + (s.game ? (by[s.code] || []).map(id => C.S[id].title + ' (' + id + ')').join(', ') || '—' : '_not in the game: ' + esc(s.why || '') + '_') + ' |\n'; });
  }
  md += '\n## Extras beyond the Common Core\n\nMental shortcuts and patterns the standards do not ask for.\n\n| Concept | Grade | Strand |\n|---|---|---|\n';
  extras.sort((a, b) => a.g - b.g).forEach(c => { md += '| ' + c.title + ' (' + c.id + ') | ' + c.g + ' | ' + C.STRANDS.find(s => s.id === c.s).name + ' |\n'; });
  fs.writeFileSync(path.join(__dirname, '..', 'docs', 'STANDARDS.md'), md);
  console.log('wrote docs/STANDARDS.md');
}
process.exit(fails ? 1 : 0);
