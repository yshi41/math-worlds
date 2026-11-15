/* Merge rules for Math Worlds saves, shared by the Worker and the test stand-in.
   A save carries the copy it started from (base). mergeState lays this page's changes since base onto the copy
   another device stored: counters move by the difference, stars and best scores keep the higher value, unlocked
   characters are kept from both, tricky spots and the placement check keep whichever copy is newer, and choices
   (character, world) follow this page. */
const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
const num = v => (typeof v === 'number' && isFinite(v)) ? v : 0;
const clone = o => JSON.parse(JSON.stringify(o));
const delta = (a, b) => num(a) - num(b);

export const KIDS = ['charlie', 'riley', 'yan'];

export function mergeState(mine, theirs, base) {
  mine = isObj(mine) ? mine : {}; theirs = isObj(theirs) ? theirs : {}; base = isObj(base) ? base : {};
  const out = clone(theirs);
  out.cur = Math.max(0, num(theirs.cur) + delta(mine.cur, base.cur));
  out.games = num(theirs.games) + Math.max(0, delta(mine.games, base.games));
  for (const k of ['stars', 'best']) {
    out[k] = Object.assign({}, isObj(theirs[k]) ? theirs[k] : {});
    const m = isObj(mine[k]) ? mine[k] : {};
    for (const key in m) out[k][key] = Math.max(num(out[k][key]), num(m[key]));
  }
  out.sk = clone(isObj(theirs.sk) ? theirs.sk : {});
  const ms = isObj(mine.sk) ? mine.sk : {}, bs = isObj(base.sk) ? base.sk : {};
  for (const key in ms) {
    const m = isObj(ms[key]) ? ms[key] : {}, b = isObj(bs[key]) ? bs[key] : {}, t = isObj(out.sk[key]) ? out.sk[key] : (out.sk[key] = { r: 0, w: 0, t: 0 });
    t.r = num(t.r) + Math.max(0, delta(m.r, b.r)); t.w = num(t.w) + Math.max(0, delta(m.w, b.w)); t.t = Math.max(num(t.t), num(m.t));
  }
  out.mist = clone(isObj(theirs.mist) ? theirs.mist : {});
  const mm = isObj(mine.mist) ? mine.mist : {};
  for (const key in mm) {
    const m = mm[key], t = out.mist[key];
    if (!isObj(m)) continue;
    if (!isObj(t) || num(m.t) >= num(t.t)) out.mist[key] = Object.assign(clone(m), { n: Math.max(num(m.n), isObj(t) ? num(t.n) : 0) });
    else t.n = Math.max(num(t.n), num(m.n));
  }
  if (isObj(mine.pre) && (!isObj(theirs.pre) || num(mine.pre.t) >= num(theirs.pre.t))) out.pre = clone(mine.pre);
  out.owned = [...new Set([...(Array.isArray(theirs.owned) ? theirs.owned : []), ...(Array.isArray(mine.owned) ? mine.owned : [])].filter(x => typeof x === 'string'))];
  out.char = Object.assign({}, isObj(theirs.char) ? theirs.char : {}, isObj(mine.char) ? mine.char : {});
  if ('look' in mine) out.look = mine.look;
  out.updated = Date.now();
  return out;
}

/* true when a save would throw away earned progress (stars, best scores, unlocked characters) */
export function lowersProgress(next, cur) {
  if (!isObj(cur) || !isObj(next)) return false;
  for (const k of ['stars', 'best']) {
    const c = isObj(cur[k]) ? cur[k] : {}, n = isObj(next[k]) ? next[k] : {};
    for (const key in c) if (num(n[key]) < num(c[key])) return true;
  }
  const owned = Array.isArray(next.owned) ? next.owned : [];
  for (const id of (Array.isArray(cur.owned) ? cur.owned : [])) if (!owned.includes(id)) return true;
  return false;
}
