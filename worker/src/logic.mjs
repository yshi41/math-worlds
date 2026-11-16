/* Merge rules for Math Worlds saves, shared by the Worker and the test stand-in.
   A save carries the copy it started from (base). mergeState lays this page's changes since base onto the copy
   another device stored: counters move by the difference, mastered concepts stay mastered, unlocked
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
  /* concepts: right/wrong counts move by this page's difference; level, streak and review timing follow the newer copy;
     a concept mastered on either device stays mastered */
  out.cs = clone(isObj(theirs.cs) ? theirs.cs : {});
  const mc = isObj(mine.cs) ? mine.cs : {}, bc = isObj(base.cs) ? base.cs : {};
  for (const key in mc) {
    const m = isObj(mc[key]) ? mc[key] : {}, b = isObj(bc[key]) ? bc[key] : {}, t = isObj(out.cs[key]) ? out.cs[key] : null;
    if (!t) { out.cs[key] = clone(m); continue; }
    const newer = num(m.t) >= num(t.t) ? m : t, r = Object.assign(clone(t), clone(newer));
    r.r = num(t.r) + Math.max(0, delta(m.r, b.r)); r.w = num(t.w) + Math.max(0, delta(m.w, b.w)); r.t = Math.max(num(t.t), num(m.t));
    const ms = [num(m.m), num(t.m)].filter(x => x > 0);
    if (ms.length) { r.m = Math.min(...ms); r.lv = 2; if (!num(r.due)) r.due = Math.max(num(m.due), num(t.due)); }
    out.cs[key] = r;
  }
  delete out.stars; delete out.best; delete out.sk;
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
  if ('now' in mine) out.now = mine.now;
  /* the round in progress: the newer one wins (a finished round is a {done, t} marker, so finishing on one device
     clears it everywhere); settings follow this page */
  if (isObj(mine.round) && (!isObj(theirs.round) || num(mine.round.t) >= num(theirs.round.t))) out.round = clone(mine.round);
  if ('set' in mine) out.set = clone(mine.set);
  out.updated = Date.now();
  return out;
}

/* true when a save would throw away earned progress (a mastered concept, an unlocked character) */
export function lowersProgress(next, cur) {
  if (!isObj(cur) || !isObj(next)) return false;
  const c = isObj(cur.cs) ? cur.cs : {}, n = isObj(next.cs) ? next.cs : {};
  for (const key in c) if (isObj(c[key]) && num(c[key].m) > 0 && !(isObj(n[key]) && num(n[key].m) > 0)) return true;
  const owned = Array.isArray(next.owned) ? next.owned : [];
  for (const id of (Array.isArray(cur.owned) ? cur.owned : [])) if (!owned.includes(id)) return true;
  return false;
}
