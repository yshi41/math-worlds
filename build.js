/* Builds the game from src/ plus the Spelling Worlds palettes, scenes and characters.
   The Spelling Worlds code is read from that repo's last commit (git show HEAD:index.html) by named anchors,
   never by line number, because that working copy may be mid-edit. Output: index.html for GitHub Pages. */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const D = __dirname, SW = path.join(D, '..', 'spelling-worlds');
const WORKER = 'https://math-worlds-saves.yshi41.workers.dev';
const BUILD = new Date().toISOString().slice(0, 16).replace('T', ' ');
const src = cp.execSync('git show HEAD:index.html', { cwd: SW, maxBuffer: 1 << 26 }).toString();
const L = src.split(/\r?\n/);
const at = (re, from = 0) => { for (let i = from; i < L.length; i++) if (re.test(L[i])) return i; throw new Error('anchor not found: ' + re); };
const span = (a, b, inclEnd) => { const i = at(a), j = at(b, i + 1); return L.slice(i, inclEnd ? j + 1 : j).join('\n'); };
const css = '/* from Spelling Worlds: world palettes, ambient bubbles, scenes, character moods */\n' + span(/^:root\{/, /^\.axo-name\{/, true);
/* worlds and level lists; each world's scene drawing; the character helpers and DRAW table; every world's characters */
const parts = [[/^var RAINBOW=/, /^SLOTS\.feet=/, true], [/^function lagoonTop\(/, /^function buildScene\(/], [/^var axoCount=0/, /^function axoSVG\(/], [/^DRAW\.axolotl=/, /^function lagoonPieces\(/], [/^function bwBow\(/, /^function bowsPieces\(/], [/^function bbPearls\(/, /^function bobaPieces\(/], [/^function birdSVG\(/, /^function birdsPieces\(/], [/^DRAW\.pompom=/, /^function cheerPieces\(/]];
const js = '/* from Spelling Worlds: worlds, scenes and characters */\nvar CUR_WORLD=\'lagoon\';function world(){return CUR_WORLD;}\n' + parts.map(p => { const s = span(p[0], p[1], p[2]); new Function(s); return s; }).join('\n');
const read = f => fs.readFileSync(path.join(D, 'src', f), 'utf8');
/* the curriculum: core helpers, then every concept file in name order, then the engine */
const conceptFiles = fs.readdirSync(path.join(D, 'src', 'concepts')).filter(f => /\.js$/.test(f)).sort();
const curriculum = [read('core.js')].concat(conceptFiles.map(f => read(path.join('concepts', f)))).join(String.fromCharCode(10));
let body = read('template.html');
body = body.replace('/*@@SW_CSS@@*/', () => css).replace('/*@@SW_JS@@*/', () => js).replace('/*@@CURRICULUM_JS@@*/', () => curriculum).replace('/*@@COACH_JS@@*/', () => read('engine.js')).replace('/*@@GAME_JS@@*/', () => read('game.js'));
for (const m of body.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Function(m[1]);
if (/localStorage|sessionStorage|indexedDB/.test(body)) throw new Error('browser storage must never be used: progress lives only on the save service');
const title = (body.match(/<title>.*?<\/title>/) || [''])[0];
const pagesBody = body.replace(title + '\n', '');
const icon = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#9BDCE0"/><text x="32" y="45" font-family="Arial Rounded MT Bold,Arial,sans-serif" font-weight="700" font-size="34" text-anchor="middle" fill="#E8809B">+−</text></svg>');
const pages = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + title + '\n<meta name="theme-color" content="#9BDCE0">\n<link rel="icon" href="' + icon + '">\n'
  + '<script>window.MW_CLOUD=window.MW_CLOUD||\'' + WORKER + '\';window.MW_BUILD=\'' + BUILD + '\';</script>\n'
  + '<style>:root{box-sizing:border-box}body{margin:0;font:14px system-ui,sans-serif;background:#CFF0F1;color:#173A42}img{max-width:100%}[hidden]{display:none!important}</style>\n</head>\n<body>\n' + pagesBody + '\n</body>\n</html>\n';
fs.writeFileSync(path.join(D, 'index.html'), pages);
console.log('index.html', pages.length, 'bytes, build', BUILD);
