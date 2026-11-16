(()=>{
'use strict';
const $=s=>document.querySelector(s);
const ri=n=>Math.floor(Math.random()*n);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pickOne=a=>a[ri(a.length)];
const rand=(a,b)=>a+Math.random()*(b-a);
const MW=window.MWC, CO=window.COACH, S=MW.S;
CO.init();

/* only two worlds now: the axolotl lagoon and the candy sweetshop */
const WK=['lagoon','candy'];
const WNAME={lagoon:'Lagoon',candy:'Sweetshop',canopy:'Rainforest',ocean:'Ocean',bows:'Bow Boutique',boba:'Boba Shop',birds:'Terror Birds',cheer:'Cheer Gym'};
const WGRAD={lagoon:'linear-gradient(135deg,#CFF0F1,#9BDCE0)',candy:'linear-gradient(135deg,#FFF3F8,#FFD3E6)',canopy:'linear-gradient(135deg,#E4F3D6,#AFDA95)',ocean:'linear-gradient(135deg,#E3E7FF,#B9C3F5)',bows:'linear-gradient(135deg,#FFF0F6,#F8C8DD)',boba:'linear-gradient(135deg,#FFF6EC,#F5D9BD)',birds:'linear-gradient(135deg,#F6E9CF,#E6CFA3)',cheer:'linear-gradient(135deg,#FCE8F3,#E6D6FB)'};
/* the players: Riley (3rd grade) and Charlie (4th grade) in the 2026-27 school year, plus Yan as the test account.
   The grade moves up each August (gy is the school year the grade is given for). It picks where the placement check
   begins and what the parent report compares with. */
const KIDS=[{id:'charlie',name:'Charlie',theme:'candy',grade:4,gy:2026},{id:'riley',name:'Riley',theme:'lagoon',grade:3,gy:2026},{id:'yan',name:'Yan',theme:'lagoon',grade:4,gy:2026}];
const gradeOf=(k,t)=>clamp(k.grade+CO.schoolTime(t||Date.now()).year-k.gy,2,12);
const CHAR_COST=[0,60,120,200,300,420];
const CUR_ICON={
  lagoon:'<svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#F4EEF8" stroke="#C9BCD9" stroke-width="1.4"/><circle cx="7.4" cy="7" r="2.4" fill="#fff"/></svg>',
  candy:'<svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="1" width="6" height="18" rx="3" fill="#FF5C8A" transform="rotate(30 10 10)"/></svg>',
  canopy:'<svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 17C3 7 9 2 18 2C18 11 13 17 3 17Z" fill="#5FAF5A"/><path d="M3 17L13 7" stroke="#2E7D3A" stroke-width="1.5"/></svg>',
  ocean:'<svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#E4D4FF" stroke="#9C7BFF" stroke-width="1.6"/><circle cx="7" cy="7" r="2.2" fill="#fff"/></svg>',
  bows:'<svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 10L2 4V16Z M10 10L18 4V16Z" fill="#FF7EB6"/><circle cx="10" cy="10" r="2.6" fill="#E0559A"/></svg>',
  boba:'<svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#3B2418"/><circle cx="7.2" cy="7" r="2.2" fill="#9A7A6A"/></svg>',
  birds:'<svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><path d="M16 3C9 3 4 9 3 17c6-1 11-6 13-14z" fill="#D9772B"/><path d="M3 17L14 5" stroke="#B5541A" stroke-width="1.4"/></svg>',
  cheer:'<svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="#E0338A"/><circle cx="7" cy="8" r="2.6" fill="#FF7EB6"/><circle cx="12.5" cy="12" r="2.4" fill="#B48CFF"/></svg>'};
const starSvg=on=>`<svg viewBox="0 0 24 24" class="st${on?' on':''}" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>`;
const stars3=n=>`<span class="stars3">${[0,1,2].map(i=>starSvg(i<n)).join('')}</span>`;
const curName=k=>WORLDS[k].cur;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- sound and voice ---------- */
const Snd={ctx:null,on:true,
  /* iPhones and iPads treat page sounds like a ringtone and drop them when the mute switch is on; asking for the
     "playback" kind keeps the game's sounds audible (the Sounds setting in the game still turns them off) */
  init(){try{if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
      this.ctx=new AC();this.out=this.ctx.createGain();this.out.gain.value=.85;this.out.connect(this.ctx.destination)}if(this.ctx.state!=='running')this.ctx.resume()}catch(e){}},
  f(m){return 440*Math.pow(2,(m-69)/12)},
  tone(freq,dur,o={}){const c=this.ctx;if(!c||!this.on)return;const when=c.currentTime+(o.delay||0),osc=c.createOscillator(),g=c.createGain();osc.type=o.type||'sine';osc.frequency.setValueAtTime(freq,when);if(o.slide)osc.frequency.exponentialRampToValueAtTime(Math.max(30,o.slide),when+dur);
    const v=o.vol!=null?o.vol:.2;g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(v,when+.01);g.gain.exponentialRampToValueAtTime(.0001,when+dur);osc.connect(g);g.connect(this.out);osc.start(when);osc.stop(when+dur+.05)},
  click(){this.tone(660,.06,{type:'triangle',vol:.08})},
  /* a bell: a sine with two quieter overtones that ring off faster */
  bell(m,dur,o={}){const f=this.f(m),v=o.vol!=null?o.vol:.22,d=o.delay||0;this.tone(f,dur,{vol:v,delay:d});this.tone(f*2,dur*.7,{vol:v*.35,delay:d});this.tone(f*3,dur*.45,{vol:v*.12,delay:d})},
  /* a right answer: two bright bell notes, "ding-ding!", that climb the scale as the streak grows; every third in a
     row adds a sparkle on top */
  right(k){k=Math.max(k|0,1);const sc=[0,2,4,5,7,9,11,12],r=72+sc[Math.min(k,8)-1];this.bell(r,.24,{vol:.2});this.bell(r+7,.6,{vol:.24,delay:.11});
    if(k%3===0)[12,16,19,24].forEach((d,i)=>this.tone(this.f(r+d),.12,{type:'triangle',vol:.07,delay:.3+i*.06}))},
  /* right on the second try: one gentler bell */
  again(){this.bell(76,.45,{vol:.17})},
  /* an answer taken in an assessment: the same plain tick whether it was right or wrong */
  tick(){this.tone(520,.07,{type:'triangle',vol:.1})},
  wrong(){this.tone(220,.25,{type:'triangle',vol:.12,slide:150})},
  coin(){this.tone(988,.08,{type:'square',vol:.05});this.tone(1319,.25,{type:'square',vol:.05,delay:.07})},
  key(){this.tone(880,.03,{type:'triangle',vol:.05})},
  star(i){this.tone(this.f(79+i*5),.35,{type:'triangle',vol:.18})},
  win(at){[[72,0,.14],[76,.12,.14],[79,.24,.14],[84,.36,.4]].forEach(([m,d,l])=>this.tone(this.f(m),l,{type:'triangle',vol:.17,delay:d+(at||0)}))}};
const Voice={on:false,v:null,
  pick(){const s=window.speechSynthesis;if(!s)return null;const L=s.getVoices().filter(v=>/^en/i.test(v.lang));const score=v=>(/female|aria|jenny|samantha|zira|ava|allison|google us english/i.test(v.name)?5:0)+(/en-US/i.test(v.lang)?2:0)+(/natural|online/i.test(v.name)?2:0);L.sort((a,b)=>score(b)-score(a));return L[0]||null},
  say(t){const s=window.speechSynthesis;if(!s||!t)return;try{s.cancel();const u=new SpeechSynthesisUtterance(t);this.v=this.v||this.pick();if(this.v)u.voice=this.v;u.rate=.92;u.pitch=1.1;s.speak(u)}catch(e){}}};

/* ---------- worlds ---------- */
function buildScene(){const k=world();let seed={lagoon:7,candy:11,canopy:5,ocean:13,bows:17,boba:19,birds:23,cheer:29}[k]||7;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
  const tops={lagoon:lagoonTop,candy:candyTop,canopy:canopyTop,ocean:oceanTop,bows:bowsTop,boba:bobaTop,birds:birdsTop,cheer:cheerTop},bots={lagoon:lagoonBottom,candy:candyBottom,canopy:canopyBottom,ocean:oceanBottom,bows:bowsBottom,boba:bobaBottom,birds:birdsBottom,cheer:cheerBottom};
  return '<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">'+tops[k](rnd)+bots[k](rnd)+'</svg>'}
function charSVG(id,mood){const d=DRAW[id](K_INK);return '<svg class="axo" viewBox="-15 -15 290 270" data-mood="'+(mood||'neutral')+'" aria-hidden="true">'+d.back+d.main+'</svg>'}
function charName(k,id){const L=charListFor(k);for(const c of L)if(c[0]===id)return c[1];return L[0][1]}
function setSceneLevel(root,lv){root.querySelectorAll('[data-lv]').forEach(e=>e.classList.toggle('on',+e.getAttribute('data-lv')<=lv))}
function ambient(){const b=$('#bubbles');b.innerHTML='';for(let i=0;i<12;i++){const s=document.createElement('span');const z=8+Math.random()*22;
  s.style.cssText=`left:${(Math.random()*100).toFixed(1)}%;width:${z.toFixed(0)}px;height:${z.toFixed(0)}px;animation-duration:${(10+Math.random()*12).toFixed(1)}s;animation-delay:-${(Math.random()*20).toFixed(1)}s;--c:${RAINBOW[i%6]}`;b.append(s)}}
let shownWorld=null;
function applyWorld(k,lv){CUR_WORLD=k;document.documentElement.setAttribute('data-world',k);
  /* no scenery or floating bubbles behind the page: it stays plain for reading */
  if(shownWorld!==k){shownWorld=k;$('#pageScene').innerHTML='';$('#bubbles').innerHTML=''}
  setSceneLevel($('#pageScene'),lv||1)}

/* ---------- saves (online only) ---------- */
let screen='menu',ready=false,saveMode='loading';
const saves={};let player=null;
function blank(){return {cur:0,cs:{},mist:{},owned:[],char:{},look:null,games:0,pre:null,now:null,round:null,set:null,log:{},apace:null,help:[],blk:null}}
/* a save from the first version (lessons and stars) keeps its treats and characters; the concept path and the
   placement check start fresh because the concepts are new */
function normalize(d){const o=JSON.parse(JSON.stringify(d||{}));const b=Object.assign(blank(),o);
  for(const k of ['cs','mist','char'])b[k]=(o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k]))?o[k]:{};
  for(const id in b.cs){const c=b.cs[id];if(!S[id]||!c||typeof c!=='object')delete b.cs[id];else b.cs[id]=Object.assign({lv:0,st:0,ml:0,r:0,w:0,t:0,m:0,due:0,iv:0},c)}
  for(const id in b.mist)if(!S[id])delete b.mist[id];
  b.cur=Math.max(0,o.cur|0);b.games=Math.max(0,o.games|0);b.owned=Array.isArray(o.owned)?o.owned.filter(x=>typeof x==='string'&&x.includes(':')):[];
  b.look=WORLDS[o.look]?o.look:null;b.pre=o.pre&&typeof o.pre==='object'&&o.pre.v===2&&o.pre.st?CO.pretestFix(o.pre):null;b.apace=typeof o.apace==='number'&&isFinite(o.apace)?o.apace:null;b.help=Array.isArray(o.help)?o.help.filter(h=>h&&typeof h==='object'&&S[h.id]&&h.t).slice(-60):[];b.now=S[o.now]?o.now:null;
  b.round=o.round&&typeof o.round==='object'?o.round:null;b.blk=o.blk&&typeof o.blk==='object'&&!Array.isArray(o.blk)?o.blk:null;b.set=o.set&&typeof o.set==='object'?{snd:o.set.snd!==false,voice:!!o.set.voice}:null;
  const lg={};if(o.log&&typeof o.log==='object')for(const d in o.log){const e=o.log[d];if(!/^\d{4}-\d\d-\d\d$/.test(d)||!e||typeof e!=='object')continue;const x={};for(const f in e)if(typeof e[f]==='number'&&isFinite(e[f]))x[f]=Math.max(0,e[f]);lg[d]=x}b.log=lg;
  delete b.stars;delete b.best;delete b.sk;return b}
function P(){return saves[player]||(saves[player]=blank())}
function kid(id){return KIDS.find(k=>k.id===id)||KIDS[0]}
function lookOf(id){const p=saves[id];return p&&p.look&&WK.includes(p.look)?p.look:kid(id).theme}
function owns(p,k,id){const L=charListFor(k);return L[0][0]===id||p.owned.includes(k+':'+id)}
function charOf(p,k){const L=charListFor(k);const id=p&&p.char&&p.char[k];return id&&L.some(c=>c[0]===id)&&owns(p,k,id)?id:L[0][0]}
/* the save service: the Math Worlds Worker. Progress lives only there, never in the browser. Each save names the revision
   and the copy it started from, so the service can merge saves from two devices. */
const CLOUD=(typeof window.MW_CLOUD==='string'&&window.MW_CLOUD)?window.MW_CLOUD:null;
const Net=(()=>{
  const REV={},BASE={},DIRTY={},SENDING={},TIMERS={};let LOADED=false,fails=0,retryT=null,warned=false;
  const snap=o=>JSON.parse(JSON.stringify(o));
  async function call(method,path,body){const o={method,cache:'no-store'};if(body){o.body=JSON.stringify(body);o.headers={'Content-Type':'text/plain'};o.keepalive=o.body.length<60000}
    const r=await fetch(CLOUD+path,o);if(r.status!==200)throw new Error('HTTP '+r.status);return r.json()}
  function adopt(id,rev,state){REV[id]=rev;if(state){saves[id]=normalize(state);BASE[id]=snap(saves[id])}else{delete saves[id];BASE[id]=null}
    if(screen==='menu')renderMenu();else if(screen==='hub'&&player===id)renderHub();else if(screen==='parent'&&PV===id)renderParent()}
  function failed(){fails++;clearTimeout(retryT);retryT=setTimeout(retry,Math.min(30000,3000*fails));
    if(!LOADED)setReady('error');else if(!warned){warned=true;toast('Can’t reach the save server. Progress is not saved until it reconnects.')}}
  function retry(){if(!LOADED)return refresh();let any=false;for(const id in DIRTY)if(DIRTY[id]){any=true;push(id)}if(!any)refresh()}
  async function refresh(){if(!CLOUD)return;try{const r=await call('GET','/saves');fails=0;warned=false;const ps=r.players||{};
      for(const k of KIDS){const id=k.id;if(SENDING[id]||DIRTY[id]||TIMERS[id])continue;if(RD&&player===id)continue;const x=ps[id];
        if(!x){if(REV[id]==null){REV[id]=0;BASE[id]=null}continue}if(REV[id]!==x.rev)adopt(id,x.rev,x.state)}
      if(!LOADED){LOADED=true;setReady('on')}else if(screen==='menu')renderMenu()}catch(e){failed()}}
  async function push(id){clearTimeout(TIMERS[id]);TIMERS[id]=null;if(SENDING[id]||!saves[id])return;
    const st=snap(saves[id]);st.updated=Date.now();const body={rev:REV[id]||0,state:st,base:BASE[id]||blank()};SENDING[id]=true;DIRTY[id]=false;
    try{const r=await call('POST','/saves/'+encodeURIComponent(id),body);SENDING[id]=false;fails=0;warned=false;
      if(r.conflict)adopt(id,r.rev,r.state);
      else{REV[id]=r.rev;if(r.state){const was=DIRTY[id];adopt(id,r.rev,r.state);DIRTY[id]=was}else BASE[id]=st}
      if(DIRTY[id])push(id)}
    catch(e){SENDING[id]=false;DIRTY[id]=true;failed()}}
  function schedule(id){if(!id||!saves[id])return;DIRTY[id]=true;clearTimeout(TIMERS[id]);TIMERS[id]=setTimeout(()=>push(id),400)}
  function flush(){for(const id in TIMERS)if(TIMERS[id])push(id)}
  document.addEventListener('visibilitychange',()=>{if(!CLOUD)return;if(document.hidden)flush();else if(LOADED)refresh()});
  window.addEventListener('pagehide',()=>{if(CLOUD)flush()});
  window.addEventListener('online',()=>{if(CLOUD)retry()});
  return {refresh,schedule,retry,idle:()=>{for(const id in SENDING)if(SENDING[id])return false;for(const id in TIMERS)if(TIMERS[id])return false;return true},rev:id=>REV[id]||0}
})();
function persist(){if(RD&&player&&RD.kind!=='pre')saveRound();if(CLOUD&&player)Net.schedule(player)}
/* the round in progress lives in the online save too, as recipes (seeds) rather than whole problems, so it can be
   picked up on another device exactly where it stopped */
const ROUND_KEYS=['ids','focus','aud','refresh','timeUp','reveals','helped','kind','skill','concept','mainTotal','mainDone','right','streak','bestStreak','earned','missed','inserted','results','fixMiss','fixRight','fixTotal','testRight','lvUps','deeperAdded','masteredNow','stop','rv3','rv7'];
const itemRef=it=>it&&it.p&&it.p.ref?{r:it.p.ref,kind:it.kind,concept:it.concept||it.p.concept||null,aid:it.aid||null}:null;
function saveRound(){const o={v:1,t:Date.now()};ROUND_KEYS.forEach(k=>{if(RD[k]!==undefined)o[k]=RD[k]});
  o.queue=RD.queue.map(itemRef).filter(Boolean);o.endQ=RD.endQ.map(itemRef).filter(Boolean);o.cur=RD.phase==='ask'?itemRef(RD.cur):null;P().round=o}
function endRound(){if(player)P().round={done:true,t:Date.now()}}
function liveRound(p){const r=p&&p.round;return r&&!r.done&&r.v===1&&Date.now()-r.t<14*864e5&&(r.kind==='review'||(r.kind==='audit'&&Array.isArray(r.ids))||S[r.skill]||S[r.concept])?r:null}
function itemFrom(x){const q=fromRef(x.r);if(!q)return null;if(x.concept)q.concept=x.concept;return {p:q,kind:x.kind,concept:x.concept||undefined,aid:x.aid||undefined}}
function resumeRound(){const r=liveRound(P());if(!r)return;Snd.init();Snd.click();newRound({});ROUND_KEYS.forEach(k=>{if(r[k]!==undefined)RD[k]=r[k]});
  RD.missed=RD.missed||{};RD.inserted=RD.inserted||{};RD.results=RD.results||[];
  try{RD.queue=(r.queue||[]).map(itemFrom).filter(Boolean);RD.endQ=(r.endQ||[]).map(itemFrom).filter(Boolean);const c=r.cur&&itemFrom(r.cur);if(c)RD.queue.unshift(c)}catch(e){RD.queue=[];RD.endQ=[]}
  if(RD.kind==='learn'&&RD.skill&&!CO.isMastered(P(),RD.skill))P().now=RD.skill;beginPlay()}
function renderSaveNote(){const n=$('#saveNote');
  n.textContent=saveMode==='loading'?'Loading saves…':saveMode==='on'?'Progress saves online for every player.':saveMode==='error'?'Can’t reach the save server. Check the connection and try again.':'Saving is off in this copy, so progress won’t be kept.';
  $('#saveRetry').hidden=saveMode!=='error'}
function setReady(mode){saveMode=mode;ready=mode==='on'||mode==='off';renderSaveNote();if(screen==='menu')renderMenu()}
$('#saveRetry').onclick=()=>{Snd.init();Snd.click();saveMode='loading';renderSaveNote();Net.retry()};
if(CLOUD)Net.refresh();else setReady('off');

/* ---------- progress ---------- */
const conceptName=id=>S[id]?S[id].title:id;
const strandName=id=>{const s=CO.strandOf(id);return s?s.name:''};
function sceneLevel(p){return clamp(1+Math.floor(CO.masteredCount(p)/5),1,10)}
function preDone(p){return !!(p&&p.pre&&p.pre.done)}
function mistList(p){return Object.entries(p.mist||{}).filter(([id,m])=>m&&m.ok<3&&S[id]).sort((a,b)=>(b[1].n-a[1].n)||(b[1].t-a[1].t))}
function recordMiss(id,why){const p=P();const m=p.mist[id]||(p.mist[id]={n:0,ok:0,t:0});m.n=(m.n|0)+1;m.ok=0;m.t=Date.now();if(why)m.why=why}
/* the daily activity log behind the parent report: problems answered, right first try, hints, time spent (capped at
   5 minutes a problem), break-down steps and placement questions */
function logAns(kind,first,right){if(!player||!RD)return;const p=P(),k=CO.dayKey(Date.now()),e=p.log[k]||(p.log[k]={n:0,ok:0,ms:0});
  e.ms=(e.ms|0)+clamp(Date.now()-(RD.t0||Date.now()),0,300000);
  if(kind!=='pre')blkAdd(Date.now()-(RD.t0||Date.now()),kind==='step'?0:1,kind!=='step'&&first&&right?1:0);
  if(kind==='pre'){e.pre=(e.pre|0)+1;if(right)e.pok=(e.pok|0)+1;return}if(kind==='step'){e.st=(e.st|0)+1;return}
  e.n=(e.n|0)+1;if(first&&right)e.ok=(e.ok|0)+1;if(RD.usedHint)e.h=(e.h|0)+1}
/* ---------- practice blocks ----------
   Practice comes in blocks of about 20 minutes a day. The clock counts time spent on problems (at most 4 minutes a
   problem, so walking away doesn't use it up) and on help lessons. A block opens with a memory check when mastered
   concepts are due, then works along the path; CO.blockNext decides each next step from how the kid is doing. At the
   first break after 20 minutes the block ends; the next one starts fresh. The block lives in the online save. */
const BLK_CAP=4*60000;
function blkLive(p){const b=p&&p.blk;return b&&!b.done&&b.day===CO.dayKey(Date.now())?b:null}
function ensureBlock(){const p=P();let b=blkLive(p);if(b)return b;const day=CO.dayKey(Date.now()),n=p.blk&&p.blk.day===day?(p.blk.num|0):0;
  return p.blk={num:n+1,day,t0:Date.now(),t:Date.now(),ms:0,n:0,ok:0,rounds:0,seen:[],fc:[],mastered:[],refreshed:[],held:0,lapsed:[],justMastered:false,done:false}}
function blkAdd(ms,n,ok,capMs){const b=blkLive(P());if(!b)return;b.ms+=clamp(ms,0,capMs||BLK_CAP);b.n+=n|0;b.ok+=ok|0;b.t=Date.now()}
const blkOver=()=>{const b=blkLive(P());return !!b&&b.ms>=CO.SESSION_MS};
const minLeft=b=>Math.max(1,Math.round((CO.SESSION_MS-b.ms)/60000));
const doneToday=p=>!!(p.blk&&p.blk.done&&p.blk.day===CO.dayKey(Date.now()));
function startBlock(){Snd.init();const p=P(),b=ensureBlock(),nx=CO.blockNext(p,b);b.justMastered=false;
  if(nx.kind==='audit'){if(nx.focus)b.fc.push(nx.focus);startAudit(nx.ids,nx.focus);return}
  if(nx.kind==='learn'){Snd.click();playConcept(nx.id);return}
  if(nx.kind==='review'){startReview();return}
  b.done=true;b.t=Date.now();persist();openHub();toast('That’s today’s 20 minutes. Great work!')}
function recordFix(id){const m=P().mist[id];if(!m||m.ok>=3)return;m.ok++;m.t=Date.now();if(m.ok>=3){toast(`Tricky spot fixed: ${conceptName(id)}!`);Snd.win()}}
/* every concept is either a pencil-and-paper concept (written methods, word problems, most algebra and up) or a
   shortcut done in your head; the game says which on every problem */
const isPaper=id=>!!(S[id]&&(S[id].paper||S[id].s==='story'));
const MODE_PAPER='✎ Pencil and paper: show your work',MODE_HEAD='In your head';
/* Common Core: the standards a concept practises, or an extra that goes beyond Common Core */
const isExtra=id=>!!(S[id]&&(S[id].extra||!(S[id].cc&&S[id].cc.length)));
function stdLine(id){const c=S[id],cc=(c.cc||[]).filter(x=>MW.STD[x]);if(!cc.length)return {short:'★ Extra: beyond Common Core',long:'A bonus shortcut or idea that goes beyond the Common Core standards.'};
  return {short:'Common Core '+cc.join(', '),long:cc.map(x=>x+': '+MW.STD[x].text).join(String.fromCharCode(10))}}
const pips=n=>`<span class="pips" aria-label="${n} of 3 levels">${[0,1,2].map(i=>`<i class="${i<n?'on':''}"></i>`).join('')}</span>`;

/* ---------- screens ---------- */
function show(id){document.querySelectorAll('.screen').forEach(s=>s.hidden=s.id!==id);screen=id;window.scrollTo(0,0);if(window.speechSynthesis)speechSynthesis.cancel()}
let toastT=null;
function toast(msg){document.querySelectorAll('.toast2').forEach(t=>t.remove());const t=document.createElement('div');t.className='toast2';t.textContent=msg;document.body.append(t);clearTimeout(toastT);toastT=setTimeout(()=>t.remove(),2600)}
function bubble(el,text){el.textContent=text;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}

function renderMenu(){applyWorld('lagoon',3);const box=$('#kids');box.innerHTML='';
  KIDS.forEach(k=>{const p=saves[k.id],w=lookOf(k.id);
    const b=document.createElement('button');b.type='button';b.className='profile-card';b.disabled=!ready;b.style.background=WGRAD[w];
    b.innerHTML=`${charSVG(charOf(p,w))}<span class="pc-name">${k.name}</span><span class="pc-world">${WNAME[w]}</span><span class="pc-meta"><span title="Concepts mastered">${starSvg(true)} ${p?CO.masteredCount(p):0}</span><span>${CUR_ICON[w]} ${p?p.cur:0}</span></span>`;
    b.onclick=()=>{Snd.init();Snd.click();player=k.id;openHub()};box.append(b)})}

function openHub(){RD=null;const p0=P();if(p0.set){if(typeof p0.set.snd==='boolean')Snd.on=p0.set.snd;if(typeof p0.set.voice==='boolean')Voice.on=p0.set.voice}show('hub');renderHub();const k=lookOf(player),p=P();
  const lines=preDone(p)?[`Hi ${kid(player).name}! Ready for a trick?`,'Mistakes show us what to practice!','Shortcuts make math fast!','Spot the pattern!']:[`Hi ${kid(player).name}! Let's find where to start.`];
  bubble($('#hubLine'),pickOne(lines))}
/* a new concept, or one that just failed a memory check, opens on its lesson (the trick and a worked example) first */
function playConcept(id){if(!id)return;const p=P(),s=p.cs[id];if((!CO.started(p,id)&&!CO.isMastered(p,id))||(CO.isLapsed(p,id)&&(s.t||0)<=s.lx))openLesson(id);else startLearn(id)}
function renderHub(){const p=P(),k=lookOf(player),mc=CO.masteredCount(p),lv=sceneLevel(p);applyWorld(k,lv);
  $('#hubBrand').textContent=WORLDS[k].brand.replace('Spelling','Math');
  $('#statCur').innerHTML=`${CUR_ICON[k]} ${p.cur}`;$('#statStars').innerHTML=`${starSvg(true)} ${mc}`;$('#statStars').title='Concepts mastered';
  const ch=charOf(p,k);$('#hubHero').innerHTML=charSVG(ch,'happy');$('#hubName').textContent=`${kid(player).name} & ${charName(k,ch)}`;
  $('#lvTitle').textContent=`${WNAME[k]} level ${lv}`;
  if(lv<10){$('#lvBar').style.width=clamp((mc-5*(lv-1))/5*100,0,100)+'%';$('#lvNext').textContent=`Next level at ${5*lv} concepts mastered`}else{$('#lvBar').style.width='100%';$('#lvNext').textContent='Your world is complete!'}
  /* placement check */
  const pc=$('#preCard'),done=preDone(p);pc.hidden=done;
  if(!done){const pre=p.pre,order=pre?pre.order:CO.pretestStart(gradeOf(kid(player))).order,started=pre&&pre.order.some(s=>pre.st[s].log.length);const prog=pre?CO.pretestProgress(pre):{done:0,total:order.length};
    const nm=checkName(pre),pg=pre?CO.pretestProgress(pre):null;$('#preTitle').textContent=started?'Keep going with the '+nm.toLowerCase():nm;
    $('#preText').textContent=`${pre&&pre.by==='parent'?'A check-up your parent started. ':''}A check of everything up to ${ord(pre&&pre.cap?pre.cap:gradeOf(kid(player))+1)} grade, in ${pg?pg.blocks:3} blocks of about 20 minutes each. It finds which concepts you already know and where to start. Have a pencil and paper ready. You can skip what you haven't learned, and take a break between blocks. The game won't say right or wrong as you go: you see how you did at the end of each block.`;
    const nx=pre&&CO.pretestNext(JSON.parse(JSON.stringify(pre)));
    $('#preParts').innerHTML=order.map(sid=>{const s=CO.STR.find(x=>x.id===sid);return `<span class="pre-part${pre&&pre.st[sid].done?' done':nx&&nx.strand===sid?' now':''}">${s.short}</span>`}).join('');
    $('#preBtn').textContent=pg&&(started||pg.block>1)?`Start block ${pg.block} of ${pg.blocks} (about ${clamp(pg.estMin,5,25)} minutes)`:'Start the '+nm.toLowerCase()}
  /* up next */
  const cur=CO.current(p);
  if(!done){const pg=p.pre?CO.pretestProgress(p.pre):null;$('#nextTitle').textContent=checkName(p.pre);$('#nextSub').textContent=pg?`Block ${pg.block} of ${pg.blocks}, about 20 minutes`:'Find out where to start';$('#nextBtn').onclick=startPre}
  else if(liveRound(p)){const r=liveRound(p),t=r.kind==='review'?'Review mix':r.kind==='fix'?'Tricky spot: '+conceptName(r.concept):r.kind==='test'?'Test out: '+conceptName(r.skill):conceptName(r.skill);
    $('#nextTitle').textContent='Continue where you left off';$('#nextSub').textContent=`${t} · ${r.kind==='fix'?(r.results||[]).length:r.mainDone} of ${r.mainTotal} done`;$('#nextBtn').onclick=resumeRound}
  else{const b=blkLive(p),fin=!b&&doneToday(p),nx=CO.blockNext(p,b||{}),c=cur&&S[cur];
    const what=(nx.kind==='audit'?'A memory check, then ':'')+(c?`<span class="nx-c">${esc(c.title)}</span> · grade ${c.g} · ${CO.isLapsed(p,cur)?'needs a refresh':pips(CO.levelsDone(p,cur))}`:'a review mix');
    $('#nextTitle').textContent=fin?'Today’s 20 minutes are done ✓':b?'Keep going':'Today’s practice';
    $('#nextSub').innerHTML=fin?'Great work! Start another 20-minute block any time.':b?`${minLeft(b)} minutes left · ${what}`:`About 20 minutes · ${what}`;$('#nextBtn').onclick=startBlock}
  const dueN=CO.due(p).length;$('#reviewBtn').disabled=!(mc>0||mistList(p).length);
  $('#reviewSub').textContent='10 problems from concepts you have mastered, with extra practice on tricky spots';
  $('#sumLine').textContent=`${mc} of ${CO.ORDER.length} concepts mastered, from 2nd to 12th grade`;
  /* tricky spots */
  const sp=$('#spots'),ml=mistList(p).slice(0,5);sp.innerHTML='';
  if(!ml.length)sp.innerHTML='<p class="empty-note">No tricky spots right now. When a mistake shows an idea that needs work, it lands here with practice to fix it.</p>';
  ml.forEach(([id,m])=>{const d=document.createElement('div');d.className='spot';
    d.innerHTML=`<span class="spot-name">${esc(conceptName(id))}</span><small>Missed ${m.n} ${m.n===1?'time':'times'} · fixed when 3 in a row are right <span class="okdots">${[0,1,2].map(i=>`<i class="${i<m.ok?'on':''}"></i>`).join('')}</span></small>`;
    const b=document.createElement('button');b.type='button';b.className='btn btn-sm';b.textContent='Practice';b.onclick=()=>startFix(id);d.append(b);sp.append(d)});
  /* the map: one card per grade */
  const map=$('#map');map.innerHTML='';const openG=cur?S[cur].g:gradeOf(kid(player));
  for(let g=2;g<=12;g++){const ids=CO.ORDER.filter(id=>S[id].g===g);if(!ids.length)continue;const m=ids.filter(id=>CO.isMastered(p,id)).length;
    const det=document.createElement('details');det.className='grade';det.open=g===openG;
    det.innerHTML=`<summary><span class="st-ic">${g}</span><span>${ord(g)} grade</span><span class="gbar"><i style="width:${(m/ids.length*100).toFixed(1)}%"></i></span><span class="st-count">${m} of ${ids.length}</span></summary>`;
    const box=document.createElement('div');box.className='chips';
    ids.forEach(id=>{const c=S[id],dn=CO.isMastered(p,id),op=CO.isOpen(p,id),pg=!dn&&CO.started(p,id),st=CO.strandOf(id);
      const b=document.createElement('button');b.type='button';const lp=CO.isLapsed(p,id);b.className='chip'+(dn?' done':lp?' prog lapsed':pg?' prog':op?' open':' locked')+(id===cur&&done?' now':'')+(isExtra(id)?' extra':'');
      b.innerHTML=`<span class="ci">${dn?'✓':lp?'↻':st.icon}</span><span class="chip-t">${esc(c.title)}</span>`;b.title=st.name+' · '+stdLine(id).short+(dn?' · mastered':lp?' · needs a refresh: master it again':pg?' · level '+(CO.levelsDone(p,id)+1)+' of 3':op?'':' · locked');
      b.onclick=()=>{Snd.init();Snd.click();openLesson(id)};box.append(b)});
    det.append(box);map.append(det)}
  /* characters and worlds */
  $('#charsTitle').textContent=`${WNAME[k]} characters`;const cb=$('#chars');cb.innerHTML='';
  charListFor(k).forEach((c,i)=>{const id=c[0],own=owns(p,k,id),on=id===ch,cost=CHAR_COST[i]||420;
    const d=document.createElement('div');d.className='ch'+(on?' on':'');d.innerHTML=`${charSVG(id,on?'happy':'neutral')}<span class="ch-name">${c[1]}</span>`;
    const btn=document.createElement('button');btn.type='button';btn.className='btn btn-sm '+(own?'btn-good':'');
    if(on){btn.textContent='Playing';btn.disabled=true}else if(own)btn.textContent='Play as';else{btn.innerHTML=`${CUR_ICON[k]} ${cost}`;if(p.cur<cost){btn.disabled=true;btn.title=`${cost-p.cur} more ${curName(k)} needed`}}
    btn.onclick=()=>pickChar(k,id,cost);d.append(btn);cb.append(d)});
  const wb=$('#worlds');wb.innerHTML='';
  WK.forEach(w=>{const b=document.createElement('button');b.type='button';b.className='wp'+(w===k?' on':'');b.style.background=WGRAD[w];
    b.innerHTML=`<span class="wp-name">${WNAME[w]}</span>${w===kid(player).theme?'<br>home':''}`;b.onclick=()=>{Snd.click();P().look=w;persist();renderHub()};wb.append(b)});
  $('#tSound').setAttribute('aria-pressed',String(Snd.on));$('#tVoice').setAttribute('aria-pressed',String(Voice.on));
}
const ord=g=>g+(g===1?'st':g===2?'nd':g===3?'rd':'th');
function pickChar(k,id,cost){const p=P();
  if(!owns(p,k,id)){if(p.cur<cost)return;p.cur-=cost;p.owned.push(k+':'+id);Snd.coin();toast(`${charName(k,id)} joined you!`);fxBurst(innerWidth/2,innerHeight*.4,60)}else Snd.click();
  p.char[k]=id;persist();renderHub()}
$('#switchBtn').onclick=()=>{Snd.click();show('menu');renderMenu()};
$('#preBtn').onclick=()=>startPre();
$('#reviewBtn').onclick=()=>startReview();
$('#tSound').onclick=()=>{Snd.init();Snd.on=!Snd.on;$('#tSound').setAttribute('aria-pressed',String(Snd.on));Snd.click();P().set=Object.assign({},P().set,{snd:Snd.on});persist()};
$('#tVoice').onclick=()=>{Voice.on=!Voice.on;P().set=Object.assign({},P().set,{voice:Voice.on});persist();$('#tVoice').setAttribute('aria-pressed',String(Voice.on));if(Voice.on)Voice.say('I will read the questions out loud.');else if(window.speechSynthesis)speechSynthesis.cancel()};
$('#redoPre').onclick=()=>{const p=P();p.pre=newCheck(p,player);persist();renderHub();toast('The placement check starts fresh. Concepts you already mastered stay mastered.')};

/* ---------- concept intro ---------- */
let LS=null,LS_EXVIS='';
function hashStr(s){let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h}
function openLesson(id){const p=P(),c=S[id],open=CO.isOpen(p,id),dn=CO.isMastered(p,id),k=lookOf(player);LS=id;show('lesson');applyWorld(k,sceneLevel(p));
  $('#lessonStrand').textContent=strandName(id);$('#lsKicker').textContent=`${ord(c.g)} grade · ${strandName(id)}`;$('#lsTitle').textContent=c.title;$('#lsStars').innerHTML=stars3(CO.levelsDone(p,id));
  $('#lsHero').innerHTML=charSVG(charOf(p,k),'happy');$('#lsTip').textContent=c.tip;
  const lm=$('#lsMode');lm.className='q-mode'+(isPaper(id)?' paper':'');lm.textContent=isPaper(id)?'✎ A pencil-and-paper concept: copy the example onto your paper as you go':'A shortcut you do in your head';
  $('#printBtn').onclick=()=>{Snd.click();printSheet(id)};$('#videoBtn').onclick=()=>{Snd.init();Snd.click();openHelp(id,false)};
  const ls=$('#lsStd'),sd=stdLine(id);ls.className='ls-std'+(isExtra(id)?' extra':'');ls.textContent=sd.short;ls.title=sd.long;
  const ex=MW.gen(id,0,MW.makeR(hashStr(id)));$('#lsExQ').innerHTML=ex.text;$('#lsExVis').innerHTML=ex.vis||'';
  const ol=$('#lsExSteps');ol.innerHTML=ex.how.map((h,i)=>`<li class="${i?'hide':''}">${h}</li>`).join('')+`<li class="hide">Answer: <b>${MW.ansText(ex)}</b></li>`;
  LS_EXVIS=ex.howVis||'';
  const sb=$('#lsStepBtn');sb.hidden=false;sb.textContent='Next step';
  sb.onclick=()=>{Snd.click();const h=ol.querySelector('li.hide');if(h)h.classList.remove('hide');if(!ol.querySelector('li.hide')&&!sb.hidden){sb.hidden=true;if(LS_EXVIS)$('#lsExVis').insertAdjacentHTML('beforeend',LS_EXVIS)}};
  const s=p.cs[id];
  $('#lsStatus').innerHTML=dn?'Mastered! Practice it any time.':CO.isLapsed(p,id)?`A memory check showed this one slipped. Master it again before anything new. Level ${s.lv+1} of 3 ${pips(s.lv)}`:open?(CO.started(p,id)?`Level ${s.lv+1} of 3 ${pips(s.lv)}`:'New concept'):'';
  $('#lsLocked').hidden=open;$('#lsLocked').textContent=open?'':CO.whyLocked(p,id)+' Or test out: get 5 hard ones right in a row.';
  $('#startBtn').hidden=!open;$('#startBtn').textContent=dn?'Practice':CO.started(p,id)?'Keep going':'Start';$('#startBtn').onclick=()=>startLearn(id);
  $('#testOutBtn').hidden=open;$('#testOutBtn').onclick=()=>startTest(id);$('#starRules').hidden=!open||dn}
/* a practice sheet to print: 12 problems, easy to hard, with room to work, and an answer key with the worked solutions
   on its own page. Nothing is saved; it is for working away from the screen. */
function printSheet(id){const c=S[id],R=MW.makeR(),pp=isPaper(id),probs=[0,0,0,0,1,1,1,1,2,2,2,2].map(d=>MW.gen(id,d,R));
  const css=[...document.querySelectorAll('style')].map(s=>s.textContent).join('\n');
  const w=window.open('','_blank');if(!w){toast('Allow pop-ups to print a practice sheet.');return}
  w.document.write(`<!doctype html><html lang="en" data-world="${CUR_WORLD}"><head><meta charset="utf-8"><title>${esc(c.title)}: practice</title><style>${css}
html,body{background:#fff!important;color:#1d2a30;margin:0}body{padding:24px 28px;font:16px Nunito,system-ui,sans-serif}
h1{font:700 1.6rem var(--display),sans-serif;margin:0 0 4px}.ws-tip{margin:0 0 4px;font-weight:700}.ws-name{margin:0 0 14px;color:#555}
.ws-q{break-inside:avoid;border-bottom:1px dashed #bbb;padding:10px 0 ${pp?120:56}px;font-size:1.15rem}.ws-q .fig,.ws-q svg{max-width:300px}
.ws-a{margin-top:8px;color:#555}.ws-key{break-before:page}.ws-key ol{margin:4px 0 12px}.noprint{margin:16px 0}
@media print{.noprint{display:none}body{padding:0}}</style></head><body>
<h1>${esc(c.title)}</h1><p class="ws-tip">${esc(c.tip)}</p><p class="ws-name">Name: ${esc(kid(player).name)} · ${ord(c.g)} grade · ${esc(stdLine(id).short)} · ${pp?'Show your work.':'Do it in your head, or jot notes.'}</p>
<button class="noprint btn" onclick="print()">Print</button>
${probs.map((q,i)=>`<div class="ws-q"><b>${i+1}.</b> ${q.text}${q.vis?`<div>${q.vis}</div>`:''}<div class="ws-a">Answer: ______________</div></div>`).join('')}
<div class="ws-key"><h1>Answer key</h1>${probs.map((q,i)=>`<div><b>${i+1}. ${MW.ansText(q)}</b><ol>${q.how.map(h=>`<li>${h}</li>`).join('')}</ol></div>`).join('')}</div></body></html>`);
  w.document.close()}
$('#lessonBack').onclick=()=>{Snd.click();openHub()};

/* ---------- rounds ----------
   A learning round is 10 problems on one concept at its current level; mastered concepts that are due come back
   in two of the slots. A first miss gets a retry with a hint aimed at the likely mistake; a second miss shows the
   worked shortcut and breaks the problem into steps with the same numbers. When the mistake points at an earlier
   concept, that concept becomes a tricky spot and gets practice at the end of the round. Mastering a concept ends
   the round with a celebration, and the path moves on. */
let RD=null;
function newRound(o){RD=Object.assign({queue:[],endQ:[],mainDone:0,mainTotal:10,right:0,streak:0,bestStreak:0,earned:0,missed:{},inserted:{},results:[],keys:new Set(),R:MW.makeR(),fixMiss:0,fixRight:0,fixTotal:0,testRight:0,lvUps:0,phase:'ask'},o)}
/* every problem is made from its own seed and remembers it (ref), so the round in progress can be saved online as a
   short recipe and rebuilt exactly on any device */
function mk(id,d,concept){const seed=Math.floor(Math.random()*2147483647),q=MW.gen(id,d,MW.makeR(seed));q.ref={id,d,seed};if(concept)q.concept=concept;return q}
function fromRef(r){let q=MW.gen(r.id,r.d,MW.makeR(r.seed));q.ref={id:r.id,d:r.d,seed:r.seed};if(r.step!=null){const st=q.steps[r.step];if(!st)return null;st.ref=Object.assign({},q.ref,{step:r.step});q=st}return q}
function fixItems(id,two){return (two?[0,1]:[0,0,1,1,2,2]).map(d=>mk(id,d,id))}
function uniqueGen(id,d){let p;for(let i=0;i<14;i++){p=mk(id,d);if(!RD.keys.has(p.key))break}RD.keys.add(p.key);return p}
function startLearn(id){Snd.init();Snd.click();const p=P();if(!CO.isMastered(p,id))p.now=id;newRound({kind:'learn',skill:id});beginPlay()}
function startTest(id){Snd.init();Snd.click();newRound({kind:'test',skill:id,mainTotal:5});beginPlay()}
function startReview(){Snd.init();Snd.click();newRound({kind:'review'});beginPlay()}
/* a memory check: two problems on each concept (medium, then hard), mixed together, with no feedback until the end */
function startAudit(ids,focus){Snd.init();Snd.click();newRound({kind:'audit',ids:ids.slice(),focus:focus||null,aud:{}});const b=ensureBlock();ids.forEach(id=>{if(!b.seen.includes(id))b.seen.push(id)});
  RD.queue=[1,2].flatMap(d=>ids.map(id=>({p:mk(id,d),kind:'aud',aid:id})));RD.mainTotal=RD.queue.length;beginPlay()}
function startFix(cid){Snd.init();Snd.click();newRound({kind:'fix',concept:cid});
  RD.queue=fixItems(cid).map(q=>({p:q,kind:'prac',concept:cid}));RD.fixTotal=RD.queue.length;RD.mainTotal=RD.fixTotal;beginPlay()}
function newCheck(p,id,by){const pace=p.apace||1;return Object.assign(CO.pretestStart(gradeOf(kid(id)),{p:CO.masteredCount(p)?p:null,by:by||null,pace,short:pace>=1.6}),{t:Date.now()})}
const checkName=pre=>pre&&pre.by==='parent'?'Assessment':'Placement check';
function startPre(){Snd.init();Snd.click();const p=P();if(!p.pre||p.pre.done)p.pre=newCheck(p,player);newRound({kind:'pre'});beginPlay()}
const quiet=()=>!!RD&&(RD.kind==='pre'||RD.kind==='audit');
function beginPlay(){const p=P(),k=lookOf(player);if(RD.kind!=='pre')ensureBlock();applyWorld(k,sceneLevel(p));show('play');$('#playHero').innerHTML=charSVG(charOf(p,k),'neutral');
  $('#playTitle').textContent=RD.kind==='learn'?conceptName(RD.skill):RD.kind==='test'?'Test out: '+conceptName(RD.skill):RD.kind==='review'?'Review mix':RD.kind==='fix'?'Tricky spot: '+conceptName(RD.concept):RD.kind==='audit'?'Memory check':checkName(p.pre);
  /* an assessment keeps the treat counter out of sight, because a counter that ticks up gives the answer away */
  $('#playCur').hidden=quiet();$('#playHero').classList.remove('jump','shake');
  bubble($('#playBubble'),RD.kind==='pre'?'Do your best! You will see how you did at the end.':RD.kind==='audit'?'Ideas you learned before. Do your best: you will see how you did at the end.':'You can do it!');nextQ()}
function pickWeighted(list,wf){const w=list.map(wf);let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<list.length;i++){r-=w[i];if(r<=0)return list[i]}return list[list.length-1]}
function reviewProblem(){const p=P(),ml=mistList(p),dl=CO.due(p);
  if(ml.length&&Math.random()<.35){const [cid]=pickOne(ml.slice(0,3));const q=mk(cid,ri(2),cid);RD.keys.add(q.key);return {p:q,kind:'main',concept:cid}}
  const mast=Object.keys(p.cs).filter(id=>S[id]&&CO.live(p.cs[id]));
  if(!mast.length){if(!ml.length)return null;const [cid]=ml[0];const q=mk(cid,1,cid);return {p:q,kind:'main',concept:cid}}
  const id=dl.length&&Math.random()<.7?pickOne(dl.slice(0,4)):pickWeighted(mast,x=>{const s=p.cs[x];return 1+4*s.w/(s.r+s.w+1)+Math.min(3,(Date.now()-(s.t||0))/864e5)});
  return {p:uniqueGen(id,Math.random()<.75?2:1),kind:'rev'}}
function makeMain(){const p=P();
  if(RD.kind==='learn'){if(RD.stop||RD.mainDone>=RD.mainTotal)return null;
    const d=CO.isMastered(p,RD.skill)?2:CO.cs(p,RD.skill).lv;return {p:uniqueGen(RD.skill,d),kind:'main'}}
  if(RD.kind==='test'){if(RD.stop||RD.mainDone>=RD.mainTotal)return null;return {p:uniqueGen(RD.skill,2),kind:'main'}}
  if(RD.kind==='review'){if(RD.mainDone>=10)return null;return reviewProblem()}
  if(RD.kind==='pre'){const nx=CO.pretestNext(p.pre);if(!nx)return null;return {p:uniqueGen(nx.skill,nx.d),kind:'pre',nx}}
  return null}
/* at the first break after the block's 20 minutes, a practice round ends (a break-down already started finishes first;
   a memory check is short and always finishes) */
function nextItem(){const up=RD.kind!=='pre'&&RD.kind!=='audit'&&blkOver();
  if(RD.queue.length&&(!up||RD.queue[0].kind==='step'))return RD.queue.shift();if(up){RD.timeUp=true;return null}if(RD.stop)return null;const m=makeMain();if(m)return m;if(RD.endQ.length)return RD.endQ.shift();return null}

let KP=null,ANS=null;
const counted=it=>it.kind==='main'||it.kind==='rev'||it.kind==='prac';
function nextQ(){const it=nextItem();if(!it){finishRound();return}
  if(it.kind==='help'){openHelp(it.p.skill,true);return}
  RD.cur=it;RD.tries=0;RD.usedHint=false;RD.phase='ask';RD.t0=Date.now();KP=null;
  const p=it.p,cid=it.concept||p.concept;
  const bd=$('#qBadge');bd.hidden=false;bd.className='q-badge'+(it.kind==='step'?' build':it.kind==='fix'||it.kind==='prac'||cid?' fix':'');
  bd.textContent=it.kind==='aud'?'Memory check':it.kind==='step'?'Step by step':cid?'Tricky spot: '+conceptName(cid):it.kind==='rev'?'Review: '+conceptName(p.skill):it.kind==='pre'?`${P().pre&&P().pre.by==='parent'?'Assessment':'Placement'} · ${CO.STR.find(s=>s.id===it.nx.strand).name}`:RD.kind==='test'?'Test out · hard':['Easy','Medium','Hard'][p.d]+` · level ${p.d+1} of 3`;
  const pp=isPaper(p.skill),qm=$('#qMode');qm.className='q-mode'+(pp||it.kind==='step'?' paper':'');qm.textContent=it.kind==='step'?(pp?'✎ Write this step on your paper':'One small step'):pp?MODE_PAPER:MODE_HEAD;
  $('#qText').innerHTML=p.text;$('#qVis').innerHTML=p.vis||'';
  const fb=$('#feedback');fb.hidden=true;fb.className='feedback';fb.innerHTML='';
  $('#nextQBtn').hidden=true;$('#skipBtn').hidden=it.kind!=='pre'&&it.kind!=='aud';$('#skipBtn').textContent=it.kind==='aud'?'I don’t remember':'I haven’t learned this yet';$('#hintBtn').hidden=it.kind==='pre'||it.kind==='aud'||RD.kind==='test'||!p.how||!p.how.length;$('#hintBtn').disabled=false;
  const area=$('#answerArea');area.innerHTML='';area.hidden=false;ANS=null;buildKeypad(area,p);$('#checkBtn').hidden=false;$('#checkBtn').disabled=false;
  renderDots();$('#playCur').innerHTML=`${CUR_ICON[lookOf(player)]} ${P().cur}`;
  $('#streak').textContent=RD.streak>=2?`${RD.streak} in a row!`:'';
  if(Voice.on)Voice.say(p.say);
  setMood('neutral');persist()}
function renderDots(pop){const d=$('#dots');if(RD.kind==='audit'){d.innerHTML=`<span class="streak">${Math.min(RD.mainDone+1,RD.mainTotal)} of ${RD.mainTotal}</span>`;return}if(RD.kind==='pre'){const pr=CO.pretestProgress(P().pre);d.innerHTML=`<span class="streak">Part ${Math.min(pr.done+1,pr.total)} of ${pr.total}</span>`;return}
  let h='';const total=RD.mainTotal;for(let i=0;i<total;i++){const r=RD.results[i];h+=`<i class="${r===true?'ok':r===false?'no':i===RD.results.length&&RD.cur&&counted(RD.cur)?'now':''}${pop&&i===RD.results.length-1?' pop':''}"></i>`}d.innerHTML=h}
function setMood(m){const s=$('#playHero svg');if(s)s.setAttribute('data-mood',m)}

/* the keypad: digits plus only the extra keys this problem's grade calls for (. / − r) */
function buildKeypad(area,p){const kind=p.type==='money'?(p.fmt==='d'?'dollars':'cents'):p.type;KP={p,kind,raw:''};ANS={kind:'keypad'};
  const extra=MW.keysFor(p),one=extra.length===1?extra[0]:'',top=extra.length>1?extra:[];
  const key=k=>`<button type="button" class="key${k?'':' blank'}${k===' '?' key-sm':''}" data-k="${k}" ${k?'':'tabindex="-1" aria-hidden="true"'}${k===' '?' aria-label="space, for mixed numbers"':''}>${k===' '?'space':k}</button>`;
  const hint=kind==='time'?(p.dur?'Type hours, then minutes: 1 4 5 for 1 hour 45 minutes':'Type the time: 3 1 5 for 3:15'):kind==='rem'?'Tap r between the answer and the leftovers: 3 r 2':kind==='frac'?'Fractions: 3/4'+(p.low?', in lowest terms':extra.includes(' ')?' · mixed numbers: 1 space 2/3':''):'';
  const wrap=document.createElement('div');wrap.className='kp';
  wrap.innerHTML=`<div class="kp-display" id="kpDisp" aria-live="polite"></div>${hint?`<div class="kp-hint">${hint}</div>`:''}${top.length?`<div class="kp-keys" style="grid-template-columns:repeat(${top.length},1fr)">${top.map(key).join('')}</div>`:''}<div class="kp-keys">${['1','2','3','4','5','6','7','8','9',one,'0','⌫'].map(key).join('')}</div>`;
  area.append(wrap);wrap.querySelectorAll('.key').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();Snd.init();kpPress(b.dataset.k)}));kpRender()}
function kpRender(){if(!KP)return;const r=KP.raw,el=$('#kpDisp');if(!el)return;let h;
  if(KP.kind==='time')h=!r?'<span class="ph">_:__</span>':r.length<=2&&!KP.p.dur?`${r}<span class="ph">:__</span>`:r.length<=2?`<span class="ph">0:</span>${r.padStart(2,'0')}`:`${r.slice(0,-2)}:${r.slice(-2)}`;
  else if(KP.kind==='dollars')h='$'+(r||'<span class="ph">0.00</span>');
  else if(KP.kind==='cents')h=(r||'<span class="ph">?</span>')+'<span class="unit">¢</span>';
  else if(KP.kind==='rem')h=r?esc(r.replace('r',' r ')):'<span class="ph">?</span>';
  else h=(r?esc(r):'<span class="ph">?</span>')+(KP.p.unit?`<span class="unit">${KP.p.unit}</span>`:'');
  el.innerHTML=h}
function kpPress(k){if(!KP||!k)return;if(screen==='help'){if(!HL||!HL.ask)return}else if(!RD||RD.phase!=='ask')return;let r=KP.raw;const numish=KP.kind==='num'||KP.kind==='frac';
  if(k==='⌫')r=r.slice(0,-1);
  else if(k==='.'){if(!(numish||KP.kind==='dollars'))return;const part=r.split(/[\/ ]/).pop();if(part.includes('.')||r.includes('/'))return;r+=(/\d$/.test(part)?'':'0')+'.'}
  else if(k==='/'){if(!numish||r.includes('/')||r.includes('.')||!/\d$/.test(r))return;r+='/'}
  else if(k==='−'||k==='-'){if(!numish)return;r=r.startsWith('−')?r.slice(1):'−'+r}
  else if(k===' '){if(!numish||!/\d$/.test(r)||/[ \/.]/.test(r))return;r+=' '}
  else if(k==='r'){if(KP.kind!=='rem'||r.includes('r')||!r)return;r+='r'}
  else if(/^\d$/.test(k)){const max=KP.kind==='time'?4:12;if(r.replace(/\D/g,'').length>=max)return;if(KP.kind==='dollars'&&r.includes('.')&&r.split('.')[1].length>=2)return;if(KP.kind==='time'&&!r&&k==='0'&&!KP.p.dur)return;r+=k}
  else return;
  KP.raw=r;Snd.key();kpRender();$('#kpDisp').classList.remove('bad')}
function currentValue(){if(!ANS||!KP)return null;return MW.parse(KP.p,KP.raw)}
$('#checkBtn').onclick=()=>{if(!RD||RD.phase!=='ask')return;Snd.init();const v=currentValue();
  if(v==null){const d=$('#kpDisp');if(d){d.classList.remove('bad');void d.offsetWidth;d.classList.add('bad')}toast(KP&&KP.raw?'That isn’t a whole answer yet.':'Type your answer first.');return}
  submit(v,null)};
$('#hintBtn').onclick=()=>{if(!RD||RD.phase!=='ask')return;Snd.click();RD.usedHint=true;const p=RD.cur.p;showFb('try',`<div class="fb-h">Hint</div><div>${p.hint||p.how[0]}</div>`);$('#hintBtn').disabled=true};
$('#skipBtn').onclick=()=>{if(!RD||RD.phase!=='ask')return;if(RD.cur.kind==='aud'){Snd.click();logAns('q',true,false);auditAns(false,true);return}if(RD.cur.kind!=='pre')return;Snd.click();RD.phase='done';logAns('pre',true,false);CO.pretestSkip(P().pre,Date.now()-RD.t0);P().pre.t=Date.now();persist();afterPre(true)};
$('#nextQBtn').onclick=()=>{Snd.click();nextQ()};
$('#readBtn').onclick=()=>{if(RD&&RD.cur)Voice.say(RD.cur.p.say)};
$('#quitBtn').onclick=()=>{Snd.click();persist();if(RD&&RD.kind!=='pre'&&RD.mainDone+RD.results.length>0){finishRound(true);return}RD=null;endRound();persist();openHub()};
function showFb(cls,html){const fb=$('#feedback');fb.hidden=false;fb.className='feedback '+cls;fb.innerHTML=html}

/* ---------- checking an answer ---------- */
function submit(v,el){if(!RD||RD.phase!=='ask')return;const it=RD.cur,p=it.p;if(MW.eqAns(p,v))onRight(el);else onWrong(v,el)}
function award(n){if(n<=0)return;const p=P();p.cur+=n;RD.earned+=n;$('#playCur').innerHTML=`${CUR_ICON[lookOf(player)]} ${p.cur}`}
/* a right answer, seen and heard: the answer box turns green with a check mark and the keys fold away so the praise
   sits right under it, with the streak and the treats earned; stars burst from the box; the counter bumps; the character
   jumps; two bell notes ring, higher as the streak grows. (An assessment shows and plays none of this.) */
const CHECK_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.8l4.4 4.4L19 7.6"/></svg>';
function markAnswer(ok,fold){const d=$('#kpDisp');if(!d)return;d.classList.remove('bad','ok');void d.offsetWidth;d.classList.add(ok?'ok':'bad');
  if(ok){d.insertAdjacentHTML('beforeend',`<span class="kp-ok">${CHECK_SVG}</span>`);if(fold&&d.parentNode)d.parentNode.classList.add('done')}}
function bumpCur(){const c=$('#playCur');c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump')}
function heroDo(cls){const h=$('#playHero');h.classList.remove('jump','shake');void h.offsetWidth;h.classList.add(cls)}
function cheer(first,gain,fold){markAnswer(true,fold);const from=$('#kpDisp')||$('#answerArea');fxStars(from,first?26:12);if(gain>0&&screen==='play')bumpCur();if(screen==='play')heroDo('jump')}
const fbTop=(word,streak,gain)=>`<div class="fb-top"><span class="fb-hero axo-box" aria-hidden="true">${charSVG(charOf(P(),lookOf(player)),'happy')}</span><div class="fb-h"><span class="fb-ck">${CHECK_SVG}</span><span>${word}</span></div>${streak>=2||gain>0?`<div class="fb-chips">${streak>=2?`<span class="fb-streak">${streak} in a row!</span>`:''}${gain>0?`<span class="fb-gain">+${gain} ${CUR_ICON[lookOf(player)]}</span>`:''}</div>`:''}</div>`;
function onRight(el){const it=RD.cur,p=it.p,first=RD.tries===0,k=lookOf(player),pl=P(),cur0=pl.cur;RD.phase='done';
  logAns(it.kind==='pre'?'pre':it.kind==='step'?'step':'q',first,true);
  /* an assessment says nothing about right or wrong as it goes; the treats for it show up with the results */
  if(it.kind==='pre'){CO.pretestRecord(pl.pre,true,Date.now()-RD.t0);pl.pre.t=Date.now();award(2);persist();afterPre(false);return}
  if(it.kind==='aud'){auditAns(true);return}
  let extra='',fanfare=false;
  if(it.kind!=='step'){
    if(first){RD.streak++;RD.bestStreak=Math.max(RD.bestStreak,RD.streak)}
    if(counted(it)){RD.results.push(first);if(it.kind!=='prac'){RD.mainDone++;if(first)RD.right++}else if(first)RD.fixRight++}
    const cid=it.concept||p.concept;
    if(first){award(it.kind==='prac'||it.kind==='fix'||cid?6:10);if(cid)recordFix(cid)}
    if(first&&it.kind==='rev'){CO.record(pl,p.skill,true,true,RD.usedHint)}
    if(first&&RD.kind==='learn'&&it.kind==='main'){const ev=CO.record(pl,p.skill,true,true,RD.usedHint);
      if(ev.levelUp!=null){RD.lvUps++;fanfare=true;award(15);extra=`<div><b>Level ${ev.levelUp+1} of 3!</b> The problems get a little harder now.</div>`;toast(`Level up! Level ${ev.levelUp+1} of 3`)}
      if(ev.mastered){RD.masteredNow=p.skill;RD.refresh=!!ev.refreshed;RD.stop=true;RD.queue=[];fanfare=true;award(40);extra=`<div><b>${ev.refreshed?'Mastered again':'Concept mastered'}: ${esc(conceptName(p.skill))}!</b></div>`}}
    if(first&&RD.kind==='test'&&it.kind==='main'&&!RD.usedHint)RD.testRight++;
    const m=WORLDS[k].milestones&&WORLDS[k].milestones[RD.streak];if(first&&m&&(RD.streak===5||RD.streak===10)){award(m.b);toast(`${m.t} +${m.b} ${curName(k)}`)}}
  else if(first)award(2);
  /* a quick step in your head moves on by itself, so its keys stay put; everything else waits for Next */
  const auto=first&&!extra&&it.kind==='step'&&!isPaper(p.skill),streak=it.kind==='step'?0:RD.streak;
  if(first)Snd.right(Math.max(1,streak));else Snd.again();if(fanfare)Snd.win(.5);
  setMood('happy');cheer(first,pl.cur-cur0,!auto);$('#streak').textContent=RD.streak>=2?`${RD.streak} in a row!`:'';
  if(RD.masteredNow&&it.kind==='main')setTimeout(()=>fxConfetti(120),200);
  const praise=pickOne(WORLDS[k].praise||['Nice!','Great!','Yes!']);
  /* no automatic next: kids are writing on paper, so they move on when ready. Paper problems show the whole written
     solution to check their work against, line by line. */
  if(first){const pp=isPaper(p.skill)&&it.kind!=='step'&&p.how.length>1;
    showFb('good',fbTop(praise,streak,pl.cur-cur0)+(it.kind==='step'?'':pp?`<div>Check your work against this:</div><ol class="steps">${p.how.map(h=>`<li>${h}</li>`).join('')}</ol>`:`<div>${p.how[p.how.length-1]}</div>`)+extra);renderDots(counted(it));
    $('#nextQBtn').hidden=false;$('#nextQBtn').textContent=RD.stop?'See how you did':'Next';$('#checkBtn').hidden=true;$('#hintBtn').hidden=true;clearTimeout(RD.autoT);
    if(auto)RD.autoT=setTimeout(()=>{if(RD&&RD.cur===it&&screen==='play')nextQ()},1100)}
  else{showFb('good',fbTop('You got it!',0,0)+`<div>Here is the shortcut again:</div><ol class="steps">${p.how.map(h=>`<li>${h}</li>`).join('')}</ol>`);renderDots();$('#nextQBtn').hidden=false;$('#nextQBtn').textContent='Next';$('#checkBtn').hidden=true;$('#hintBtn').hidden=true}
  bubble($('#playBubble'),RD.masteredNow&&it.kind==='main'?'You mastered it!':first?praise:'Way to keep trying!');persist()}
function onWrong(v,el){const it=RD.cur,p=it.p,pl=P();RD.tries++;
  /* an assessment takes the answer and moves on, exactly as it does for a right one */
  if(it.kind==='pre'){logAns('pre',true,false);RD.phase='done';CO.pretestRecord(pl.pre,false,Date.now()-RD.t0);pl.pre.t=Date.now();persist();afterPre(false);return}
  if(it.kind==='aud'){logAns('q',true,false);auditAns(false);return}
  Snd.wrong();setMood('oops');heroDo('shake');
  if(RD.tries===1){it.diag=CO.diagnose(p,v);RD.streak=0;$('#streak').textContent='';
    if(it.kind!=='step'){
      const learning=RD.kind==='learn'||RD.kind==='test'?RD.skill:RD.kind==='fix'?RD.concept:null,cid=it.concept||p.concept;
      if(RD.kind==='learn'&&it.kind==='main'){const ev=CO.record(pl,p.skill,false,true,RD.usedHint);if(ev.levelDown!=null)toast(`Back to level ${ev.levelDown+1} for a little more practice.`)}
      if(it.kind==='rev'){CO.reviewResult(pl,p.skill,false);CO.record(pl,p.skill,false,true,false)}
      const spot=it.kind==='rev'?(CO.spotFor(pl,it.diag,null)||p.skill):CO.spotFor(pl,it.diag,learning);
      if(spot){recordMiss(spot,it.diag.why);RD.missed[spot]=(RD.missed[spot]||0)+1;it.spot=spot}
      if(cid){const m=pl.mist[cid];if(m)m.ok=0}
      if(RD.kind==='fix'){RD.fixMiss++;const dp=CO.deeper(RD.concept);if(RD.fixMiss>=2&&dp&&!RD.deeperAdded){RD.deeperAdded=dp;if(!pl.mist[dp]||pl.mist[dp].ok>=3)pl.mist[dp]={n:1,ok:0,t:Date.now()}}}}}
  if(RD.tries===1){const why=it.diag&&it.diag.why;showFb('try',`<div class="fb-h">Not quite. Try again!</div><div>${why?why:'Hint: '+(p.hint||p.how[0])}</div>${isPaper(p.skill)?'<div>Look back over your paper, one line at a time.</div>':''}`);
    if(KP){KP.raw='';kpRender();markAnswer(false)}bubble($('#playBubble'),'Try once more!');persist();return}
  /* second miss: show the worked shortcut, then break it down */
  logAns(it.kind==='step'?'step':'q',false,false);
  RD.phase='done';if(counted(it)){RD.results.push(false);if(it.kind!=='prac')RD.mainDone++}
  $('#answerArea').hidden=true;
  const sp=it.spot&&it.spot!==p.skill?it.spot:null;
  showFb('bad',`<div class="fb-h">The answer is ${MW.ansText(p)}</div><div>${isPaper(p.skill)&&it.kind!=='step'?'Compare your paper with these lines. Find the first line where your work is different: that is the step to fix.':'Here is the shortcut:'}</div><ol class="steps">${p.how.map(h=>`<li>${h}</li>`).join('')}</ol>${p.howVis?`<div class="vis-wrap">${p.howVis}</div>`:''}${sp?`<div><span class="fb-spot">Tricky spot: ${esc(conceptName(sp))}</span> We'll practice that idea too.</div>`:''}`);
  let label='Next';
  /* not getting it: the second shown answer in a round (or under half right after six tries) brings a help lesson */
  if(RD.kind==='learn'&&it.kind==='main'){RD.reveals=(RD.reveals||0)+1;if(!RD.helped&&helpTrigger(pl,p.skill)){RD.helped=1;RD.queue.unshift({kind:'help',p:{skill:p.skill}});label='Watch a short lesson'}}
  if(label==='Next'&&it.kind!=='step'&&p.steps&&p.steps.length&&!RD.inserted[p.key]){RD.inserted[p.key]=1;RD.queue.unshift(...p.steps.map((q,i)=>{if(p.ref)q.ref=Object.assign({},p.ref,{step:i});return {p:q,kind:'step'}}));label="Let's break it down"}
  if(it.kind!=='step'&&sp&&RD.kind!=='fix'&&!RD.inserted[sp]){RD.inserted[sp]=1;RD.endQ.push(...fixItems(sp,true).map(q=>({p:q,kind:'fix',concept:sp})))}
  $('#nextQBtn').hidden=false;$('#nextQBtn').textContent=label;$('#checkBtn').hidden=true;$('#hintBtn').hidden=true;renderDots();
  bubble($('#playBubble'),label==='Next'?'Now you know the trick!':'Let’s take it one step at a time.');persist()}
/* after an assessment answer: no word on right or wrong. The same tick, the same short note and the same pause either
   way, then the next question; how she did comes with the results at the end of the block. */
/* a memory-check answer: kept for the end of the check, where each concept is judged on both of its problems */
function auditAns(ok,skipped){const it=RD.cur,pl=P();RD.phase='done';(RD.aud[it.aid]||(RD.aud[it.aid]=[])).push(!!ok);CO.record(pl,it.p.skill,!!ok,true,false);RD.mainDone++;if(ok){RD.right++;award(2)}persist();afterPre(skipped)}
function afterPre(skipped){const pre=RD.kind==='pre'?P().pre:null;
  const strandJustDone=pre&&pre.order.find(s=>pre.st[s].done&&!RD['done_'+s]);if(strandJustDone){RD['done_'+strandJustDone]=1}
  const sname=strandJustDone?CO.STR.find(s=>s.id===strandJustDone).name:'';
  if(!skipped)Snd.tick();
  showFb('note',`<div class="fb-h">${skipped?'Skipped. That’s OK!':'Answer saved.'}</div>${strandJustDone?`<div>That part is finished: <b>${sname}</b>.</div>`:''}`);
  renderDots();$('#checkBtn').hidden=true;$('#skipBtn').hidden=true;$('#hintBtn').hidden=true;
  clearTimeout(RD.autoT);RD.autoT=setTimeout(()=>{if(quiet()&&screen==='play')nextQ()},strandJustDone?1300:650)}

/* ---------- end of a round ---------- */
function finishRound(early){const p=P(),k=lookOf(player);if(!RD)return;clearTimeout(RD.autoT);const R0=RD;
  const ST=WORLDS[k].sumTitles||['Great work!','Nice work!','Good practice!'];
  let title=ST[0],sub='',starsShown=null,note='',nextId=null;
  if(R0.kind==='learn'){const id=R0.skill;sub=conceptName(id);starsShown=CO.levelsDone(p,id);p.games++;
    if(R0.masteredNow){title=R0.refresh?'Mastered again!':'Concept mastered!';nextId=CO.current(p);p.now=nextId;note=nextId?`Next up: “${conceptName(nextId)}”.`:'You have mastered every concept!'}
    else if(CO.isMastered(p,id)){note='A practice round on a concept you have mastered.';if(R0.right<7)title=ST[2]}
    else{const lv=CO.cs(p,id).lv;nextId=id;title=R0.lvUps?'Level up!':R0.right>=7?ST[1]:ST[2];
      note=(R0.lvUps?`You reached level ${lv+1} of 3. `:`You're on level ${lv+1} of 3. `)+'Get 3 right in a row, first try, to go up. Finish level 3 to master it.'+(R0.timeUp?' You’ll pick up right here next time.':'')}}
  else if(R0.kind==='test'){const id=R0.skill;sub='Test out: '+conceptName(id);
    if(!early&&R0.testRight>=5){CO.master(p,id);CO.cs(p,id).to=1;title='Tested out!';starsShown=3;note=`“${conceptName(id)}” is mastered.`}else{title=ST[2];note=early?'Stopped early. Try again any time.':'Not this time. All 5 need to be right on the first try, with no hints.'}}
  else if(R0.kind==='review'){sub='Review mix';p.games++}
  else if(R0.kind==='audit'){sub='Memory check';const lg=p.log[CO.dayKey(Date.now())]||(p.log[CO.dayKey(Date.now())]={n:0,ok:0,ms:0});
    R0.ids.forEach(id=>delete AUD[id]);R0.ids.forEach(id=>{const a=R0.aud[id]||[];if(a.length<2)return;const r=CO.auditResult(p,id,a);if(!r)return;AUD[id]=r;lg.ac=(lg.ac|0)+1;if(r==='pass')lg.ap=(lg.ap|0)+1;if(r==='lapse')lg.al=(lg.al|0)+1});
    const ids=R0.ids.filter(id=>AUD[id]),n=r=>ids.filter(id=>AUD[id]===r).length,bk=blkLive(p);if(bk){bk.held=(bk.held|0)+n('pass');ids.filter(id=>AUD[id]==='lapse').forEach(id=>bk.lapsed.push(id))}
    title=!ids.length?'Saved!':n('lapse')?'Memory check done':n('pass')===ids.length?'Still strong!':'Memory check done';
    sub="Ideas you learned before";note=!ids.length?'Not finished, so nothing changed. It comes back next time.':(R0.focus?`These are the ideas “${conceptName(R0.focus)}” is built on. `:'')+(n('lapse')?`${n('lapse')===1?'One idea needs':n('lapse')+' ideas need'} a refresh. It goes back on your path, and you master it again before anything new.`:n('pass')===ids.length?'Everything you checked is still strong.':'Wobbly ones come back tomorrow.')}
  else if(R0.kind==='fix'){const m=p.mist[R0.concept];sub='Tricky spot: '+conceptName(R0.concept);
    note=m&&m.ok>=3?'Fixed! That idea is solid now.':`${R0.fixRight} of ${R0.fixTotal} practice problems right the first time. Fixed after 3 in a row.`;
    if(R0.deeperAdded)note+=` Next, go one step back with “${conceptName(R0.deeperAdded)}”, which is in your tricky spots.`}
  else if(R0.kind==='pre'){const pre=p.pre;sub=checkName(pre);
    if(pre&&!CO.pretestNext(pre)){const more=CO.pretestAdvance(pre);pre.t=Date.now();
      if(!more){pre.done=true;const res=CO.pretestApply(p,pre);p.apace=Math.round((p.apace?(p.apace+pre.pace)/2:pre.pace)*100)/100;title='All done!';note=`${res.mastered} concepts you already know are marked mastered. They'll come back now and then for review.`}
      else{const pg=CO.pretestProgress(pre);title=`Block ${pre.bi} of ${pg.blocks} done!`;note=`Take a break. The next block takes about ${clamp(pg.estMin,5,25)} minutes. Start it from the map whenever you're ready.`+(pre.adapted&&Date.now()-pre.adapted<60000?' The rest of the check is shorter now.':'')}}
    else{title='Saved!';note='Your check is saved. Pick up where you left off any time.'}}
  /* the block: count the round, and end the block at the first break after 20 minutes */
  const bk=R0.kind!=='pre'?blkLive(p):null;let bEnd=false;
  if(bk){bk.rounds=(bk.rounds|0)+1;bk.justMastered=!!R0.masteredNow;if(R0.masteredNow)(R0.refresh?bk.refreshed:bk.mastered).push(R0.masteredNow);bk.t=Date.now();if(bk.ms>=CO.SESSION_MS){bk.done=true;bEnd=true}}
  RD=null;LAST=R0;endRound();persist();
  show('results');applyWorld(k,sceneLevel(p));$('#resHero').innerHTML=charSVG(charOf(p,k),'happy');$('#resTitle').textContent=title;$('#resSub').textContent=sub;
  $('#resStars').innerHTML=starsShown!=null?[0,1,2].map(i=>starSvg(i<starsShown)).join(''):'';
  $('#rRight').textContent=R0.kind==='pre'?R0.earned/2|0:R0.kind==='audit'?R0.right:R0.kind==='fix'?R0.fixRight:R0.right;$('#rStreak').textContent=R0.bestStreak;$('#rCur').textContent='+'+R0.earned;$('#rCurL').textContent=cap(curName(k));
  $('#resNote').textContent=note;
  /* tricky spots found this round, with practice right here */
  const rs=$('#resSpots');rs.innerHTML='';const found=Object.keys(R0.missed).filter(id=>S[id]&&(!p.mist[id]||p.mist[id].ok<3));
  if(found.length&&R0.kind!=='fix'){rs.innerHTML='<h3>Tricky spots found</h3>';const box=document.createElement('div');box.className='spots';
    found.slice(0,4).forEach(id=>{const d=document.createElement('div');d.className='spot';d.innerHTML=`<span class="spot-name">${esc(conceptName(id))}</span><small>${esc((p.mist[id]&&p.mist[id].why)||S[id].tip)}</small>`;const b=document.createElement('button');b.type='button';b.className='btn btn-sm';b.textContent='Practice';b.onclick=()=>startFix(id);d.append(b);box.append(d)});rs.append(box)}
  /* placement results */
  const pl=$('#resPlaces');pl.innerHTML='';
  if(R0.kind==='audit')R0.ids.filter(id=>AUD[id]).forEach(id=>{const r=AUD[id],s=p.cs[id];pl.insertAdjacentHTML('beforeend',`<div class="place aud-${r}"><span class="st-ic">${r==='pass'?'✓':r==='shaky'?'~':'↻'}</span><span class="place-name">${esc(conceptName(id))}</span><small>${r==='pass'?`Still strong. Next check in ${s.iv} day${s.iv===1?'':'s'}.`:r==='shaky'?'A little wobbly. Checked again tomorrow.':'Needs a refresh. The trick: '+esc(S[id].tip)}</small></div>`)});
  if(R0.kind==='pre'&&p.pre&&p.pre.done){p.pre.order.forEach(sid=>{const st=CO.STR.find(s=>s.id===sid),x=p.pre.st[sid],start=st.core[x.start];pl.insertAdjacentHTML('beforeend',`<div class="place"><span class="st-ic">${st.icon}</span><span class="place-name">${st.name}</span><small>${start?'Starts at: '+esc(conceptName(start)):'Everything here up to '+ord(p.pre.grade+1)+' grade is mastered'}</small></div>`)})}
  const cur=CO.current(p),nb=$('#nextLessonBtn'),rb=$('#resBlock');
  if(R0.kind==='pre'){nb.hidden=!cur||!preDone(p);nb.textContent='Next concept';nb.onclick=()=>{Snd.click();startBlock()};
    $('#againBtn').hidden=preDone(p);$('#againBtn').textContent='Next block';rb.hidden=true}
  else{/* practice: one way forward, "Keep going", which asks the block what comes next */
    nb.hidden=bEnd||!bk;nb.textContent='Keep going';nb.onclick=()=>startBlock();
    $('#againBtn').hidden=bEnd||!(R0.kind==='fix'&&!(p.mist[R0.concept]&&p.mist[R0.concept].ok>=3))&&!(R0.kind==='test'&&!CO.isMastered(p,R0.skill));$('#againBtn').textContent=R0.kind==='fix'?'Practice again':'Try again';
    rb.hidden=!bk;if(bk)rb.innerHTML=bEnd?blockSummary(bk):`Today’s practice: about ${minLeft(bk)} minute${minLeft(bk)===1?'':'s'} left.`}
  $('#hubBtn').textContent=bEnd?'Back to the map':'Map';
  if(starsShown)for(let i=0;i<starsShown;i++)setTimeout(()=>Snd.star(i),300+i*250);
  if(!early)setTimeout(()=>fxConfetti(R0.masteredNow||(R0.kind==='pre'&&preDone(p))?160:70),250);Snd.win()}
let LAST=null;const AUD={};
/* the end of a block: what it did, in plain words */
function blockSummary(b){const mins=Math.round(b.ms/60000),L=[];
  L.push(`<div class="rb-h">That’s today’s 20 minutes! ✓</div>`);
  L.push(`<div>${mins} minutes · ${b.n} problems · ${b.ok} right on the first try</div>`);
  if(b.mastered.length)L.push(`<div>Mastered: ${b.mastered.map(id=>esc(conceptName(id))).join(', ')}</div>`);
  if(b.refreshed.length)L.push(`<div>Mastered again: ${b.refreshed.map(id=>esc(conceptName(id))).join(', ')}</div>`);
  if(b.seen.length)L.push(`<div>Memory check: ${b.held|0} of ${b.seen.length} still strong${b.lapsed.length?', '+b.lapsed.length+' to refresh next time':''}</div>`);
  L.push('<div class="pv-soft">Take a break! Start another block from the map any time.</div>');return L.join('')}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
$('#againBtn').onclick=()=>{const L0=LAST;if(!L0)return openHub();if(L0.kind==='audit')return startBlock();if(L0.kind==='learn')startLearn(L0.skill);else if(L0.kind==='test')startTest(L0.skill);else if(L0.kind==='review')startReview();else if(L0.kind==='fix')startFix(L0.concept);else startPre()};
$('#hubBtn').onclick=()=>{Snd.click();openHub()};

/* keyboard: digits, . / − space r, Backspace, Enter */
document.addEventListener('keydown',e=>{if(screen!=='play'||!RD||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='Enter'){e.preventDefault();if(!$('#nextQBtn').hidden)$('#nextQBtn').click();else if(!$('#checkBtn').hidden)$('#checkBtn').click();return}
  if(RD.phase!=='ask'||!KP)return;
  if(/^\d$/.test(e.key))kpPress(e.key);else if(e.key==='Backspace'){e.preventDefault();kpPress('⌫')}else if(e.key==='.'||e.key==='/'||e.key==='-'){e.preventDefault();kpPress(e.key)}else if(e.key===' '){e.preventDefault();kpPress(' ')}else if(e.key==='r'||e.key==='R')kpPress('r')});

/* ---------- effects ---------- */
const fxc=$('#fx');let FX=[];
function fxCols(){return (WORLDS[CUR_WORLD]&&WORLDS[CUR_WORLD].confetti)||RAINBOW}
function fxFit(){const d=Math.min(2,window.devicePixelRatio||1),w=innerWidth,h=innerHeight;if(fxc.width!==Math.round(w*d)||fxc.height!==Math.round(h*d)){fxc.width=Math.round(w*d);fxc.height=Math.round(h*d)}const c=fxc.getContext('2d');c.setTransform(d,0,0,d,0,0);return {c,w,h}}
function fxBurst(x,y,n){const cols=fxCols();for(let i=0;i<n;i++){const a=rand(0,6.283),sp=rand(120,380);FX.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rand(.5,1),r:rand(3,6),col:pickOne(cols),g:380})}kick()}
function fxFrom(el,n){if(!el)return;const r=el.getBoundingClientRect();fxBurst(r.left+r.width/2,r.top+Math.min(r.height/2,60),n)}
/* a right answer: stars and dots fly out from the answer box, from both ends and the middle */
function fxStars(el,n){if(!el)return;const r=el.getBoundingClientRect(),cols=fxCols(),y=r.top+r.height/2;
  for(let i=0;i<n;i++){const a=rand(-3.6,.46),sp=rand(160,460),st=i%2===0;FX.push({x:r.left+r.width*(i%3)/2,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rand(.7,1.25),r:st?rand(7,12):rand(3,6),col:pickOne(cols),g:520,star:st,rot:rand(0,6),vr:rand(-6,6)})}kick()}
function starPath(c,r){c.beginPath();for(let i=0;i<10;i++){const a=-1.5708+i*.62832,q=i%2?r*.45:r;c.lineTo(Math.cos(a)*q,Math.sin(a)*q)}c.closePath()}
function fxConfetti(n){const cols=fxCols();for(let i=0;i<n;i++)FX.push({x:rand(0,innerWidth),y:rand(-120,-10),vx:rand(-60,60),vy:rand(80,240),life:rand(2.4,3.6),r:rand(5,9),col:pickOne(cols),rect:true,rot:rand(0,6),vr:rand(-8,8),g:40});kick()}
let fxRun=false,last=0;
function kick(){if(fxRun)return;fxRun=true;last=performance.now();requestAnimationFrame(step)}
function step(now){const dt=Math.min(.05,(now-last)/1000);last=now;const {c,w,h}=fxFit();c.clearRect(0,0,w,h);
  for(const p of FX){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;c.globalAlpha=clamp(p.life*1.5,0,1);c.fillStyle=p.col;
    if(p.rect){p.rot+=p.vr*dt;c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.fillRect(-p.r/2,-p.r,p.r,p.r*2);c.restore()}else if(p.star){p.rot+=p.vr*dt;c.save();c.translate(p.x,p.y);c.rotate(p.rot);starPath(c,p.r);c.fill();c.restore()}else{c.beginPath();c.arc(p.x,p.y,p.r,0,6.283);c.fill()}}
  c.globalAlpha=1;FX=FX.filter(p=>p.life>0&&p.y<h+40);if(FX.length)requestAnimationFrame(step);else{c.clearRect(0,0,w,h);fxRun=false}}


/* ---------- help lessons ----------
   When a kid isn't getting a concept (two answers shown in one round, or under half right after six tries), the
   round offers a help lesson; the lesson page offers it any time. It goes:
   1. a short narrated diagram video: the trick, then a worked example built up one step at a time with its pictures;
   2. "Did that make sense?" with a quick check problem;
   3. an interactive lesson: the simpler ideas the concept is built from (one problem each), then a new problem broken
      into its steps, each typed and checked, then one to try alone;
   4. "How do you feel about it now?"
   The narration uses the device's built-in voice (nothing is recorded); captions show the same words. Each lesson and
   its answers are saved online for the parent report. */
let HL=null;
const strip2=h=>String(h).replace(/<sup>2<\/sup>/g,' squared').replace(/<sup>3<\/sup>/g,' cubed').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
function sayify(h){return strip2(h).replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/−/g,' minus ').replace(/(\d)\s*-\s*(\d)/g,'$1 minus $2').replace(/=/g,' equals ').replace(/≈/g,' is about ').replace(/→/g,', then ').replace(/√/g,'the square root of ').replace(/π/g,'pi').replace(/\?/g,' what? ').replace(/\s+/g,' ').trim()}
/* the narrator: the device's voice when it has one, else timed captions; resolves when the line is done */
const Narr={on:true,tok:0,
  speak(text){const tok=++this.tok,ms=Math.max(1400,text.split(/\s+/).length*(window.__mwFast?8:380));
    return new Promise(res=>{let done=false;const fin=()=>{if(!done){done=true;res(tok===this.tok)}};const s=window.speechSynthesis;
      if(this.on&&s&&typeof SpeechSynthesisUtterance!=='undefined'){try{s.cancel();const u=new SpeechSynthesisUtterance(sayify(text));Voice.v=Voice.v||Voice.pick();if(Voice.v)u.voice=Voice.v;u.rate=.9;u.pitch=1.08;u.onend=fin;u.onerror=fin;s.speak(u);setTimeout(fin,ms*3+4000);return}catch(e){}}
      setTimeout(fin,ms)})},
  stop(){this.tok++;try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}};
function helpTrigger(p,id){const s=p.cs[id];return (RD&&RD.reveals>=2)||(s&&s.r+s.w>=6&&s.r/(s.r+s.w)<0.5)}
function openHelp(id,fromRound){const p=P(),c=S[id];Narr.stop();if(window.speechSynthesis)speechSynthesis.cancel();
  const lv=CO.levelsDone(p,id),seed=hashStr(id+'#video');
  HL={id,fromRound:!!fromRound,stage:'video',rec:{id,t:Date.now(),from:fromRound?'round':'lesson'},ex:MW.gen(id,Math.min(1,lv),MW.makeR(seed)),frame:-1,playing:false,ask:false};
  show('help');applyWorld(lookOf(player),sceneLevel(p));$('#hlTitle').textContent=c.title;$('#hlKicker').textContent=`${ord(c.g)} grade · ${strandName(id)}`;
  $('#hlSound').setAttribute('aria-pressed',String(Narr.on));buildVideo();playVideo(0)}
/* the video: frames built from the concept's trick and a worked example */
function buildVideo(){const c=S[HL.id],ex=HL.ex,F=[];
  F.push({cap:'The trick',say:'Here is the trick. '+c.tip,html:`<div class="hv-card hv-trick"><div class="hv-k">The trick</div><p>${esc(c.tip)}</p></div>`});
  F.push({cap:'Watch one',say:"Let's try one. "+(ex.say||strip2(ex.text)),html:`<div class="hv-card"><div class="hv-k">Watch one</div><div class="hv-q">${ex.text}</div>${ex.vis?`<div class="hv-vis">${ex.vis}</div>`:''}</div>`});
  ex.how.forEach((h,i)=>F.push({cap:'Step '+(i+1),say:strip2(h),html:`<div class="hv-line"><span class="hv-n">${i+1}</span><span>${h}</span></div>`,step:true}));
  if(ex.howVis)F.push({cap:'The picture',say:'Here is a picture of it.',html:`<div class="hv-vis">${ex.howVis}</div>`});
  F.push({cap:'The answer',say:'So the answer is '+strip2(MW.ansText(ex))+'.',html:`<div class="hv-ans">Answer: <b>${MW.ansText(ex)}</b></div>`});
  HL.frames=F;$('#hvStage').innerHTML='';$('#hvBar').innerHTML=F.map(()=>'<i></i>').join('');
  ['#hlVideo','#hlFeel','#hlLesson','#hlDone'].forEach(s=>$(s).hidden=s!=='#hlVideo');$('#hvAfter').hidden=true}
function showFrame(i){const F=HL.frames,st=$('#hvStage');HL.frame=i;
  while(st.children.length>i)st.lastChild.remove();
  for(let k=st.children.length;k<=i;k++){const d=document.createElement('div');d.className='hv-f';d.innerHTML=F[k].html;st.append(d);requestAnimationFrame(()=>d.classList.add('in'))}
  [...st.children].forEach((d,k)=>d.classList.toggle('now',k===i));
  const last=st.children[i];if(last&&last.scrollIntoView)last.scrollIntoView({block:'nearest',behavior:'smooth'});
  $('#hvCap').textContent=F[i].say;$('#hvBar').querySelectorAll('i').forEach((b,k)=>b.className=k<i?'done':k===i?'now':'')}
async function playVideo(from){if(!HL)return;HL.playing=true;const run=++HL.run||(HL.run=1),my=HL.run;$('#hvPlay').textContent='Pause';
  for(let i=from;i<HL.frames.length;i++){if(!HL||HL.run!==my||!HL.playing||screen!=='help')return;showFrame(i);const ok=await Narr.speak(HL.frames[i].say);if(!ok||!HL||HL.run!==my||!HL.playing)return;await new Promise(r=>setTimeout(r,window.__mwFast?5:450))}
  if(!HL||HL.run!==my)return;HL.playing=false;HL.watched=true;$('#hvPlay').textContent='Play';$('#hvAfter').hidden=false;$('#hvAfter').scrollIntoView&&$('#hvAfter').scrollIntoView({block:'nearest'})}
$('#hvPlay').onclick=()=>{Snd.click();if(!HL)return;if(HL.playing){HL.playing=false;HL.run++;Narr.stop();$('#hvPlay').textContent='Play'}else{const f=HL.frame>=HL.frames.length-1?0:Math.max(0,HL.frame);if(f===0)$('#hvStage').innerHTML='';playVideo(f)}};
$('#hvReplay').onclick=()=>{Snd.click();if(!HL)return;HL.run++;Narr.stop();$('#hvStage').innerHTML='';HL.replays=(HL.replays||0)+1;playVideo(0)};
$('#hlSound').onclick=()=>{Narr.on=!Narr.on;$('#hlSound').setAttribute('aria-pressed',String(Narr.on));if(!Narr.on)Narr.stop()};
/* feedback buttons: yes / a little / not yet */
const FEEL={yes:'Yes, I get it',some:'A little',no:'Not yet'};
function feelButtons(box,onPick){box.innerHTML=Object.entries(FEEL).map(([k,t])=>`<button type="button" class="btn ${k==='yes'?'btn-good':k==='some'?'btn-sky':'btn-ghost'}" data-f="${k}">${t}</button>`).join('');
  box.querySelectorAll('button').forEach(b=>b.onclick=()=>{Snd.click();onPick(b.dataset.f)})}
$('#hvDone').onclick=()=>{Snd.click();Narr.stop();HL.stage='feel1';HL.rec.replays=HL.replays||0;
  $('#hlVideo').hidden=true;$('#hlFeel').hidden=false;$('#hfQ').textContent='Did the video make sense?';
  feelButtons($('#hfBtns'),f=>{HL.rec.video=f;Narr.speak(f==='yes'?'Great! Show me with a quick one.':'That is OK. Try a quick one, then we will break it into smaller pieces.');startCheck()});
  Narr.speak('Did the video make sense?')};
/* the interactive part: a list of small tasks, each a typed problem (or a short read), checked one at a time */
function lessonTask(kind,p,intro,extra){return Object.assign({kind,p,intro},extra||{})}
function startCheck(){HL.tasks=[lessonTask('check',mk(HL.id,0),'Quick check: try this one.')];HL.ti=-1;HL.afterTasks=startLesson;$('#hlFeel').hidden=true;$('#hlLesson').hidden=false;$('#hlLessonTitle').textContent='Quick check';nextTask()}
function startLesson(){const id=HL.id,parts=CO.prereqs(id).filter(x=>S[x]).slice(0,2),T=[];
  parts.forEach(x=>{T.push(lessonTask('part',mk(x,0),`This idea is built from a simpler one: <b>${esc(S[x].title)}</b>. ${esc(S[x].tip)}`,{cid:x}))});
  let p=mk(id,Math.min(1,CO.levelsDone(P(),id)));for(let i=0;i<6&&!(p.steps&&p.steps.length);i++)p=mk(id,i%2);
  if(p.steps&&p.steps.length){T.push(lessonTask('read',p,`Now a new one, broken into small steps. Copy it onto your paper.<div class="hv-q">${p.text}</div>${p.vis?`<div class="hv-vis">${p.vis}</div>`:''}`));
    p.steps.forEach((s,i)=>T.push(lessonTask('step',s,`Step ${i+1} of ${p.steps.length}`,{how:p.how[i]||p.how[p.how.length-1]})));
    T.push(lessonTask('whole',p,'Put the steps together. What is the answer to the whole problem?',{show:true}))}
  else T.push(lessonTask('read',p,`Now a new one. Read how it works, one line at a time.<div class="hv-q">${p.text}</div>${p.vis?`<div class="hv-vis">${p.vis}</div>`:''}<ol class="steps">${p.how.map(h=>`<li>${h}</li>`).join('')}</ol>`));
  T.push(lessonTask('try',mk(id,Math.min(1,CO.levelsDone(P(),id))),'Your turn: one on your own. Use your paper.'));
  HL.tasks=T;HL.ti=-1;HL.afterTasks=finishLesson;HL.stage='lesson';HL.rec.parts=parts;HL.rec.right=0;HL.rec.total=T.filter(t=>t.kind!=='read').length;
  $('#hlLessonTitle').textContent='Step by step';nextTask()}
function nextTask(){HL.ti++;const t=HL.tasks[HL.ti];if(!t){HL.afterTasks();return}HL.task=t;HL.tries=0;
  const n=HL.tasks.length,box=$('#hlTask');$('#hlTaskN').textContent=`${HL.ti+1} of ${n}`;
  box.innerHTML=`<div class="hl-intro">${t.intro}</div>${t.kind==='read'?'':`<div class="hv-q">${t.kind==='whole'?'':t.p.text}</div>${t.kind!=='whole'&&t.p.vis&&t.kind!=='step'?`<div class="hv-vis">${t.p.vis}</div>`:''}`}`;
  $('#hlFb').hidden=true;$('#hlFb').innerHTML='';const area=$('#hlAns');area.innerHTML='';$('#answerArea').innerHTML='';
  if(t.kind==='read'){HL.ask=false;KP=null;area.hidden=true;$('#hlCheck').hidden=true;$('#hlNext').hidden=false;$('#hlNext').textContent='Got it, next';Narr.speak(strip2(t.intro))}
  else{HL.ask=true;area.hidden=false;buildKeypad(area,t.p);$('#hlCheck').hidden=false;$('#hlNext').hidden=true;Narr.speak(strip2(t.intro)+'. '+(t.kind==='whole'?'':(t.p.say||strip2(t.p.text))))}}
function taskAnswer(){if(!HL||!HL.ask||!KP)return;const v=MW.parse(KP.p,KP.raw);if(v==null){toast(KP.raw?'That isn’t a whole answer yet.':'Type your answer first.');return}
  const t=HL.task,p=t.p,ok=MW.eqAns(p,v);HL.tries++;logAnsHelp(ok&&HL.tries===1);
  if(ok){HL.ask=false;if(HL.tries===1&&t.kind!=='check')HL.rec.right++;if(t.kind==='check')HL.rec.check=HL.tries===1;if(HL.tries===1)Snd.right(1);else Snd.again();cheer(HL.tries===1,0,true);
    const say=t.kind==='step'&&t.how?strip2(t.how):p.how[p.how.length-1]?strip2(p.how[p.how.length-1]):'';
    hlFb('good',`<div class="fb-top"><div class="fb-h"><span class="fb-ck">${CHECK_SVG}</span><span>${pickOne(['Yes!','Right!','Nice!'])}</span></div></div>${t.kind==='step'&&t.how?`<div>${t.how}</div>`:t.kind==='part'||t.kind==='check'||t.kind==='try'?`<div>${p.how[p.how.length-1]}</div>`:''}`);Narr.speak(pickOne(['Yes!','Right!','Nice!'])+' '+say);toNext()}
  else if(HL.tries===1){Snd.wrong();const d=CO.diagnose(p,v);hlFb('try',`<div class="fb-h">Not quite. Try again!</div><div>${d.why||'Hint: '+(p.hint||p.how[0])}</div>`);Narr.speak('Not quite. '+strip2(d.why||p.hint||p.how[0]));KP.raw='';kpRender();markAnswer(false)}
  else{HL.ask=false;if(t.kind==='check')HL.rec.check=false;Snd.wrong();hlFb('bad',`<div class="fb-h">The answer is ${MW.ansText(p)}</div><ol class="steps">${p.how.map(h=>`<li>${h}</li>`).join('')}</ol>`);Narr.speak('The answer is '+strip2(MW.ansText(p))+'. '+p.how.map(strip2).join(' '));toNext()}}
function hlFb(cls,html){const f=$('#hlFb');f.hidden=false;f.className='feedback '+cls;f.innerHTML=html}
function toNext(){$('#hlCheck').hidden=true;$('#hlNext').hidden=false;$('#hlNext').textContent=HL.ti>=HL.tasks.length-1?'Finish':'Next'}
function logAnsHelp(ok){const p=P(),k=CO.dayKey(Date.now()),e=p.log[k]||(p.log[k]={n:0,ok:0,ms:0});e.hq=(e.hq|0)+1;if(ok)e.hok=(e.hok|0)+1}
$('#hlCheck').onclick=()=>{Snd.init();taskAnswer()};
$('#hlNext').onclick=()=>{Snd.click();Narr.stop();nextTask()};
function finishLesson(){HL.stage='feel2';HL.ask=false;KP=null;$('#hlLesson').hidden=true;$('#hlFeel').hidden=false;$('#hfQ').textContent='How do you feel about it now?';
  Narr.speak(`You got ${HL.rec.right} of ${HL.rec.total} right. How do you feel about it now?`);
  feelButtons($('#hfBtns'),f=>{HL.rec.lesson=f;saveHelp();$('#hlFeel').hidden=true;$('#hlDone').hidden=false;
    $('#hdText').textContent=f==='yes'?'Great work! Back to practice, and keep your paper handy.':f==='some'?'Good effort. Practice makes it stick. The hints and step-by-step help are there when you need them.':'That is OK. Ask a grown-up to sit with you on this one. Your parent can see that this concept needs help.';
    Narr.speak($('#hdText').textContent);$('#hdBtn').textContent=HL.fromRound?'Back to practice':'Back to the concept'})}
function saveHelp(){const p=P(),r=Object.assign({},HL.rec);if(!HL.counted){HL.counted=1;blkAdd(Date.now()-(HL.rec.t||Date.now()),0,0,12*60000)}p.help=(p.help||[]).concat([r]).slice(-60);persist()}
$('#hdBtn').onclick=()=>{Snd.click();Narr.stop();const h=HL;HL=null;if(h&&h.fromRound&&RD){show('play');applyWorld(lookOf(player),sceneLevel(P()));$('#playHero').innerHTML=charSVG(charOf(P(),lookOf(player)),'neutral');nextQ()}else if(h)openLesson(h.id);else openHub()};
$('#hlBack').onclick=()=>{Snd.click();Narr.stop();const h=HL;if(h&&h.stage!=='video'&&h.rec&&!h.saved&&(h.rec.video||h.rec.check!=null)){h.rec.quit=true;HL.rec.lesson=HL.rec.lesson||null;saveHelp()}HL=null;if(h&&h.fromRound&&RD){show('play');nextQ()}else if(h)openLesson(h.id);else openHub()};
document.addEventListener('keydown',e=>{if(screen!=='help'||!HL||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='Enter'){e.preventDefault();if(!$('#hlNext').hidden&&!$('#hlLesson').hidden)$('#hlNext').click();else if(!$('#hlCheck').hidden&&!$('#hlLesson').hidden)$('#hlCheck').click();return}
  if(!HL.ask||!KP)return;if(/^\d$/.test(e.key))kpPress(e.key);else if(e.key==='Backspace'){e.preventDefault();kpPress('⌫')}else if(e.key==='.'||e.key==='/'||e.key==='-'){e.preventDefault();kpPress(e.key)}else if(e.key===' '){e.preventDefault();kpPress(' ')}else if(e.key==='r'||e.key==='R')kpPress('r')});

/* ---------- parent view ----------
   One report per child, read from the online save: grade level overall and by domain, an estimated national
   percentile (NWEA MAP Growth 2025 norms), practice over the last two weeks, what is mastered, in progress and tricky,
   and the placement check. All the numbers come from CO.report, which node tests. */
let PV=null;
const fmtGE=ge=>ge>=13?'12.9+':ge.toFixed(1);
function gradeWords(ge){if(ge>=13)return 'beyond 12th grade';const g=Math.floor(ge),f=ge-g;return (f<1/3?'early ':f<2/3?'mid-':'late ')+ord(g)+' grade'}
function diffWords(d){const a=Math.abs(d);if(a<0.25)return {cls:'on',icon:'●',t:'On grade level'};return d>0?{cls:'up',icon:'▲',t:a.toFixed(1)+' grade'+(a>=1.05?'s':'')+' ahead'}:{cls:'down',icon:'▼',t:a.toFixed(1)+' grade'+(a>=1.05?'s':'')+' behind'}}
const pctWord=n=>n+(n%100>=11&&n%100<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th');
const mins=ms=>{const m=Math.round(ms/60000);return m<60?m+' min':Math.floor(m/60)+' h '+(m%60)+' min'};
const accTxt=(r,n)=>n?Math.round(100*r/n)+'%':'—';
const dShort=t=>new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric'});
const dLong=t=>new Date(t).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
function openParent(id){PV=id||PV||(KIDS.find(k=>saves[k.id]&&CO.masteredCount(saves[k.id]))||KIDS[0]).id;show('parent');applyWorld(lookOf(PV),3);renderParent();if(CLOUD)Net.refresh()}
function renderParent(){const k=kid(PV),p=saves[PV]?saves[PV]:blank(),grade=gradeOf(k),R=CO.report(p,grade),O=R.overall;applyWorld(lookOf(PV),3);
  $('#pvTabs').innerHTML=KIDS.map(x=>`<button type="button" class="tog" data-kid="${x.id}" aria-pressed="${x.id===PV}">${x.name}</button>`).join('');
  $('#pvTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{Snd.click();PV=b.dataset.kid;renderParent()});
  const out=[];const card=(h,body,cls)=>out.push(`<div class="card pv-card${cls?' '+cls:''}"><h3>${h}</h3>${body}</div>`);
  const head=`<div class="pv-head"><div><div class="pv-name">${esc(k.name)}</div><div class="pv-sub">${ord(grade)} grade · report for ${dLong(R.now)} · week ${Math.round(R.week)} of 36 in the school year</div></div></div>`;
  if(!R.placed&&!R.answered){out.push(`<div class="card pv-card">${head}${assessRow(k,p)}<p class="pv-p">${esc(k.name)} hasn't started yet. The report fills in once the placement check is done; it finds which concepts ${esc(k.name)} already knows.</p></div>`);$('#pvBody').innerHTML=out.join('');wireAssess(k);return}
  /* summary tiles */
  const dw=diffWords(O.diff),ceilO=O.ceil?'+':'';
  const tiles=[[fmtGE(O.ge)+ceilO,'Grade level',`${gradeWords(O.ge)}; the average ${ord(grade)} grader is at ${R.expect.toFixed(1)} now`],
    [R.placed?`${pctWord(R.pct.pct)}`:'—','National percentile',R.placed?'estimate from NWEA 2025 national norms':'after the placement check'],
    [String(R.mastered),'Concepts mastered',`${R.byPlacement} from the placement check, ${R.mastered-R.byPlacement} learned in the game${R.learnedWeek?`, ${R.learnedWeek} this week`:''}`],
    [accTxt(R.month.ok,R.month.n),'Right first try',R.month.n?`last 30 days, ${R.month.n} problems`:'no practice problems yet'],
    [mins(R.week7.ms),'Time this week',`${R.week7.days} of the last 7 days`],
    [String(R.streak),'Day streak',R.streak===1?'day in a row':'days in a row']];
  const strong=R.domains.slice().sort((a,b)=>b.diff-a.diff),weak=strong.slice().reverse();
  let sum=`${esc(k.name)} is working at about a <b>${gradeWords(O.ge)}</b> level overall (${fmtGE(O.ge)}${ceilO}), <b>${dw.t.toLowerCase()}</b>${dw.cls==='on'?'':' compared with the average '+ord(grade)+' grader at this point in the year'}.`;
  if(R.placed)sum+=` That is about the <b>${pctWord(R.pct.pct)} percentile</b> nationally${O.ceil?' or higher':''}.`;
  sum+=` Strongest: ${esc(strong[0].name)} (${fmtGE(strong[0].ge)}). Most room to grow: ${esc(weak[0].name)} (${fmtGE(weak[0].ge)})${weak[1].ge<strong[0].ge?` and ${esc(weak[1].name)} (${fmtGE(weak[1].ge)})`:''}.`;
  const conf={none:'There is no placement check yet, so the grade levels only count concepts mastered in practice.',low:'These numbers are rough for now: they rest mostly on the placement check. They firm up with every few hundred problems.',medium:'These numbers rest on the placement check and a fair amount of practice.',high:'These numbers rest on the placement check and a lot of practice.'}[R.confidence];
  out.push(`<div class="card pv-card">${head}${assessRow(k,p)}<div class="pv-tiles">${tiles.map(t=>`<div class="sbox pv-tile"><b>${t[0]}</b><span>${t[1]}</span><small>${t[2]}</small></div>`).join('')}</div><p class="pv-p">${sum}</p><p class="pv-p pv-soft">${conf}</p></div>`);
  /* grade level by domain */
  const lo=2,hi=Math.max(grade+3,Math.ceil(Math.max(...R.domains.map(d=>d.ge),O.ge)+0.5)),X=v=>((clamp(v,lo,hi)-lo)/(hi-lo)*100).toFixed(2);
  const ticks=[];for(let g=lo;g<=hi;g++)ticks.push(`<span style="left:${X(g)}%">${g}</span>`);
  const row=(name,about,d,acc,extra)=>{const w=diffWords(d.diff);return `<div class="pv-dom"><div class="pv-dom-h"><b>${esc(name)}</b><span class="pv-ge">${fmtGE(d.ge)}${d.ceil?'+':''}</span><span class="pv-chip ${w.cls}">${w.icon} ${w.t}</span></div>${about?`<small class="pv-soft">${esc(about)}</small>`:''}
    <div class="pv-track" data-tip="${esc(name)}: ${fmtGE(d.ge)}${d.ceil?'+':''} (${gradeWords(d.ge)}). The average ${ord(grade)} grader is at ${R.expect.toFixed(1)}."><i class="pv-fill" style="width:${X(d.ge)}%"></i><i class="pv-now" style="left:${X(R.expect)}%"></i></div>
    <small class="pv-soft">${d.atGrade} of ${d.atGradeTotal} concepts through ${ord(grade)} grade mastered · right first try ${acc}${extra||''}</small></div>`};
  card('Grade level by area',`<p class="pv-p pv-soft">The bar is the grade level; the line marks where the average ${ord(grade)} grader is now (${R.expect.toFixed(1)}). A + means everything the placement check covered is mastered, so the true level may be higher.</p>
    ${row('Overall','',O,accTxt(O.r,O.r+O.w))}<div class="pv-sep"></div>${R.domains.map(d=>row(d.name,d.about,d,accTxt(d.r,d.r+d.w),d.first>grade+1?` · starts in ${ord(d.first)} grade`:'')).join('')}<div class="pv-ticks">${ticks.join('')}</div><div class="pv-axis">grade level</div>`);
  /* percentile */
  if(R.placed){const P0=R.pct;card('National percentile (estimate)',`<p class="pv-p">About the <b>${pctWord(P0.pct)} percentile</b>${O.ceil?' or higher':''} among U.S. ${ord(grade)} graders at this point in the school year.</p>
    <p class="pv-p pv-soft">How: a grade level of ${fmtGE(O.ge)} matches a MAP Growth math score of about ${Math.round(P0.rit)}, the national average for students at that point in school. The national average for ${ord(grade)} graders now is ${Math.round(P0.mean)}, with a spread (standard deviation) of ${Math.round(P0.sd)}, so ${Math.round(P0.rit)} sits at the ${pctWord(P0.pct)} percentile.${R.ceilPct!=null?` The placement check went up to ${ord(R.capG)} grade, so for now the highest this can show is about the ${pctWord(R.ceilPct)} percentile; it rises as harder concepts are mastered.`:''}</p>
    <p class="pv-p pv-soft">This is an estimate from the game, not a test score. A school MAP or other standardized test is the real measure.</p>`)}
  /* grade level over time */
  const CW=clamp(($('#pvBody').clientWidth||640)-36,300,640);
  const span=R.trend.length?R.trend[R.trend.length-1].t-R.trend[0].t:0;
  if(R.trend.length>=3&&span>=2*864e5){const T=R.trend,t0=T[0].t,t1=Math.max(T[T.length-1].t,t0+864e5),exp=T.map(q=>({t:q.t,ge:gradeOf(k,q.t)+CO.schoolTime(q.t).week/36}));
    const all=T.concat(exp).map(q=>q.ge),y0=Math.floor(Math.min(...all)*2)/2-0.25,y1=Math.ceil(Math.max(...all)*2)/2+0.25,W=CW,H=200,L=34,B=24,xs=t=>L+(t-t0)/(t1-t0)*(W-L-12),ys=v=>8+(y1-v)/(y1-y0)*(H-8-B);
    const path=a=>a.map((q,i)=>(i?'L':'M')+xs(q.t).toFixed(1)+' '+ys(q.ge).toFixed(1)).join(' ');
    let grid='';for(let v=Math.ceil(y0);v<=y1;v++)grid+=`<line x1="${L}" x2="${W-12}" y1="${ys(v)}" y2="${ys(v)}" class="pv-grid"/><text x="${L-6}" y="${ys(v)+4}" text-anchor="end" class="pv-axt">${v}</text>`;
    const pts=T.map(q=>`<circle cx="${xs(q.t).toFixed(1)}" cy="${ys(q.ge).toFixed(1)}" r="9" class="pv-hit" data-tip="${dShort(q.t)}: grade level ${q.ge.toFixed(1)}"/>`).join('');
    card('Grade level over time',`<svg class="pv-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grade level over time, from ${T[0].ge.toFixed(1)} to ${T[T.length-1].ge.toFixed(1)}">${grid}
      <path d="${path(exp)}" class="pv-ref"/><path d="${path(T)}" class="pv-line"/>${pts}
      <text x="${L}" y="${H-6}" class="pv-axt">${dShort(t0)}</text><text x="${W-12}" y="${H-6}" text-anchor="end" class="pv-axt">${dShort(t1)}</text></svg>
      <div class="pv-legend"><span><i class="pv-key line"></i>${esc(k.name)}</span><span><i class="pv-key ref"></i>Average ${ord(grade)} grader</span></div>`)}
  else card('Grade level over time','<p class="pv-p pv-soft">This chart starts once there are a few days of practice.</p>');
  /* practice, last 14 days */
  const D=R.days,mx=Math.max(10,...D.map(d=>d.n)),BW=CW,BH=170,bw=(BW-40)/14;
  const bars=D.map((d,i)=>{const h=d.n/mx*(BH-40),x=34+i*bw,dt=new Date(d.k+'T12:00');return `<g data-tip="${dShort(dt)}: ${d.n} problems, ${accTxt(d.ok,d.n)} right first try, ${mins(d.ms)}"><rect x="${x}" y="8" width="${bw}" height="${BH-30}" class="pv-hitbar"/>${d.n?`<path d="M${(x+3).toFixed(1)} ${(BH-22).toFixed(1)} v${(-Math.max(0,h-4)).toFixed(1)} q0 -4 4 -4 h${(bw-14).toFixed(1)} q4 0 4 4 v${Math.max(0,h-4).toFixed(1)} z" class="pv-bar"/>`:''}<text x="${(x+bw/2).toFixed(1)}" y="${BH-6}" text-anchor="middle" class="pv-axt">${dt.toLocaleDateString('en-US',{weekday:'narrow'})}</text></g>`}).join('');
  card('Practice, last 14 days',`<svg class="pv-chart" viewBox="0 0 ${BW} ${BH}" role="img" aria-label="Problems answered each day for the last 14 days"><line x1="34" x2="${BW-6}" y1="${BH-22}" y2="${BH-22}" class="pv-base"/><text x="28" y="${BH-22-(BH-40)+4}" text-anchor="end" class="pv-axt">${mx}</text><text x="28" y="${BH-18}" text-anchor="end" class="pv-axt">0</text>${bars}</svg>
    <p class="pv-p pv-soft">Problems answered each day (placement questions not included).</p>
    <table class="pv-table"><tr><th></th><th>Problems</th><th>Right first try</th><th>Time</th><th>Days</th></tr>
    ${[['Last 7 days',R.week7],['Last 30 days',R.month],['All time',R.ever]].map(([n,s])=>`<tr><td>${n}</td><td>${s.n}</td><td>${accTxt(s.ok,s.n)}</td><td>${mins(s.ms)}</td><td>${s.days}</td></tr>`).join('')}</table>`);
  /* now, mastered, attention */
  const cur=R.current,cl=id=>`<div>${esc(conceptName(id))} <small class="pv-soft">${ord(S[id].g)} grade · ${esc(strandName(id))}</small></div>`;
  card('Working on now',`${cur?`<p class="pv-p">Next on the path: <b>${esc(conceptName(cur))}</b> (${ord(S[cur].g)} grade, ${esc(strandName(cur))}).</p>`:''}
    ${R.working.length?`<ul class="pv-list">${R.working.slice(0,8).map(w=>`<li>${cl(w.id)}<span>level ${w.lv+1} of 3 · ${accTxt(w.r,w.r+w.w)} right</span></li>`).join('')}</ul>`:'<p class="pv-p pv-soft">Nothing in progress yet.</p>'}
    <p class="pv-p pv-soft">${R.due} mastered concept${R.due===1?' is':'s are'} due for review.</p>`);
  {const RT=R.retention;card('Memory checks',`<p class="pv-p">${RT.checked?`${RT.pass} passed, ${RT.shaky} a little wobbly, ${RT.lapses} needed a refresh.`:'No memory checks yet.'} ${RT.due} concept${RT.due===1?'':'s'} due for a check now.</p>${RT.lapsed.length?`<p class="pv-p"><b>Being mastered again:</b></p><ul class="pv-list">${RT.lapsed.map(x=>`<li>${cl(x.id)}<span>slipped ${dShort(x.at)}</span></li>`).join('')}</ul>`:''}${RT.recent.length?`<p class="pv-p"><b>Latest checks:</b></p><ul class="pv-list">${RT.recent.slice(0,8).map(x=>`<li>${cl(x.id)}<span>${x.res==='pass'?'held':x.res==='shaky'?'wobbly':'slipped'} · ${dShort(x.at)}</span></li>`).join('')}</ul>`:''}<p class="pv-p pv-soft">Each mastered concept is checked again 1, 3, 9, 27 and 81 days later: two problems, no hints, no feedback until the end. One that slipped goes back on the path ahead of anything new and must be mastered again. When ${esc(k.name)} struggles with a concept, the ideas it is built on are checked too.</p>`)}
  card('Recently mastered',R.learned.length?`<ul class="pv-list">${R.learned.slice(0,10).map(x=>`<li>${cl(x.id)}<span>${dShort(x.at)}${x.how==='test'?' · tested out':''}</span></li>`).join('')}</ul>`:'<p class="pv-p pv-soft">Nothing mastered in practice yet. Concepts from the placement check are counted above.</p>');
  const att=R.spots.map(s=>`<li>${cl(s.id)}<span>tricky spot · missed ${s.n}× · ${s.ok} of 3 fixed</span>${s.why?`<small class="pv-soft">${esc(s.why)}</small>`:''}</li>`).concat(R.hard.filter(h=>!R.spots.some(s=>s.id===h.id)).slice(0,6).map(h=>`<li>${cl(h.id)}<span>${Math.round(h.acc*100)}% right first try (${h.r+h.w} tries)</span></li>`));
  card('Needs attention',att.length?`<ul class="pv-list">${att.join('')}</ul>`:'<p class="pv-p pv-soft">Nothing stands out. Tricky spots (mistakes that point at an earlier idea) and concepts under 75% right show up here.</p>');
  /* help lessons */
  const FW={yes:'got it',some:'a little',no:'not yet'};
  if(R.help.length)card('Help lessons',`<p class="pv-p pv-soft">A help lesson (a short narrated video, then the idea broken into smaller steps) starts when ${esc(k.name)} misses a concept twice in a round, or opens one from a concept's page. After the video and again at the end, she says how well she understood.</p><ul class="pv-list">${R.help.map(h=>`<li><div>${esc(conceptName(h.id))} <small class="pv-soft">${dShort(h.t)}${h.from==='lesson'?' · she opened it':''}</small></div><span>video: ${FW[h.video]||'—'} · quick check ${h.check==null?'—':h.check?'right':'missed'} · steps ${h.right!=null?h.right+' of '+h.total:'—'} · at the end: ${FW[h.lesson]||(h.quit?'stopped early':'—')}</span></li>`).join('')}</ul>`);
  /* placement */
  if(R.placement){const PL=R.placement,asked=PL.parts.reduce((a,x)=>a+x.asked,0),right=PL.parts.reduce((a,x)=>a+x.right,0),sk=PL.parts.reduce((a,x)=>a+x.skipped,0);
    const bl=PL.bms.length?` Blocks took ${PL.bms.map(ms=>mins(ms)).join(', ')} (planned at about 20 minutes each${PL.short?'; shortened because blocks ran long':''}).`:'';
    card(PL.by==='parent'?'Latest assessment':'Placement check',`<p class="pv-p">${PL.done?'Finished':'In progress, last worked on'} ${PL.t?dShort(PL.t):''}: ${right} of ${asked} questions right${sk?`, ${sk} skipped as not learned yet`:''}. It checked up to ${ord(PL.cap)} grade.${bl}${asked>=8&&right/asked<0.5&&PL.done?' Under half right is low for the start of the check. If it was rushed, Redo placement check (in the game’s Settings) runs it again; concepts mastered so far stay mastered.':''}</p>
      <table class="pv-table"><tr><th>Part</th><th>Right</th><th>Starts at</th></tr>${PL.parts.map(x=>`<tr><td>${esc(x.name)}</td><td>${x.right} of ${x.asked}${x.skipped?` (${x.skipped} skipped)`:''}</td><td>${!x.done?'not finished':x.start?esc(conceptName(x.start))+` <small class="pv-soft">${ord(S[x.start].g)}</small>`:'all mastered'}</td></tr>`).join('')}</table>`)}
  card('How these numbers are worked out',`<ul class="pv-notes">
    <li><b>Grade level</b> = 2.0 (the start of 2nd grade) plus the share of each grade's Common Core concepts that are mastered. All of 2nd grade and half of 3rd gives 3.5. Extras beyond the Common Core don't count. The average student is at their grade plus the share of the school year gone (36 weeks from mid-August, breaks left out), so ${R.expect.toFixed(1)} for a ${ord(grade)} grader today.</li>
    <li><b>Mastered</b> means 3 right in a row, first try and no hint, at each of the 3 levels; or a test-out (5 hard ones in a row); or placed by the placement check. A concept that fails a memory check stops counting until it is mastered again.</li>
    <li><b>Practice</b> comes in blocks of about 20 minutes: a memory check when concepts are due, then the next concept on the path. The path never moves past a concept until it is mastered. Time counts while answering (at most 4 minutes a problem) and in help lessons.</li>
    <li><b>Percentile</b> uses the NWEA MAP Growth 2025 national norms for math (student achievement, Technical Manual Table A.1: mean and standard deviation by grade in fall, winter and spring). The grade level becomes the average score for that point in school, compared with ${ord(grade)} graders today. It assumes ${esc(k.name)} is like a typical student at that grade level, so treat it as a rough guide.</li>
    <li><b>Right first try</b> counts every problem answered in practice, review and tricky-spot rounds; break-down steps and placement questions are left out. Time is capped at 5 minutes a problem.</li></ul>`);
  $('#pvBody').innerHTML=out.join('');wireAssess(k)}
/* a parent can start an assessment any time: the child gets it as the next thing in the game, in blocks of about
   20 minutes, starting from what she has already mastered */
function assessRow(k,p){const pre=p.pre;let st='';
  if(pre&&!pre.done){const pg=CO.pretestProgress(pre);st=`<b>${checkName(pre)} in progress:</b> block ${pg.block} of ${pg.blocks} is next (${pg.done} of ${pg.total} parts done). ${esc(k.name)} sees it first thing in the game.`}
  else st=pre&&pre.done?`Last ${checkName(pre).toLowerCase()}: ${dShort(pre.t)}.`:'No assessment yet.';
  return `<div class="pv-assess"><p class="pv-p">${st}</p><button id="pvAssess" class="btn btn-sm" type="button">${pre&&!pre.done?'Restart the assessment':'Start a new assessment'}</button></div>`}
let assessArm=0;
function wireAssess(k){const b=$('#pvAssess');if(!b)return;b.onclick=()=>{Snd.click();
  if(Date.now()-assessArm>4000){assessArm=Date.now();b.textContent=`Tap again to start it for ${k.name}`;return}assessArm=0;
  const p=saves[k.id]||(saves[k.id]=blank());p.pre=newCheck(p,k.id,'parent');if(CLOUD)Net.schedule(k.id);toast(`Assessment ready. ${k.name} gets it next time she plays.`);renderParent()}}
/* hover and tap tips for the report's charts */
(()=>{const tip=document.createElement('div');tip.className='pv-tip';tip.hidden=true;document.body.append(tip);
  const showTip=e=>{const t=e.target.closest&&e.target.closest('[data-tip]');if(!t||screen!=='parent'){tip.hidden=true;return}tip.textContent=t.getAttribute('data-tip');tip.hidden=false;
    const x=Math.min(innerWidth-tip.offsetWidth-8,Math.max(8,e.clientX-tip.offsetWidth/2)),y=e.clientY-tip.offsetHeight-14;tip.style.left=x+'px';tip.style.top=(y<8?e.clientY+18:y)+'px'};
  document.addEventListener('pointermove',showTip);document.addEventListener('pointerdown',showTip);window.addEventListener('scroll',()=>{tip.hidden=true},{passive:true})})();
$('#parentBtn').onclick=()=>{Snd.init();Snd.click();openParent()};
$('#hubParent').onclick=()=>{Snd.click();openParent(player)};
$('#pvBack').onclick=()=>{Snd.click();show('menu');renderMenu()};
$('#pvPrint').onclick=()=>{Snd.click();window.print()};

renderMenu();renderSaveNote();
function wrongFor(p){const a=p.ans;switch(p.type){case 'frac':return {n:a.n+a.d,d:a.d};case 'time':return p.dur?{h:a.h+1,m:a.m}:{h:a.h%12+1,m:a.m};case 'rem':return {q:a.q+1,r:a.r};default:return a+1}}
window.__mw={snd:Snd,startBlock,startAudit,get blk(){return blkLive(P())},get fx(){return FX.length},openParent,openHelp,get HL(){return HL},get PV(){return PV},get RD(){return RD},resumeRound,get saves(){return saves},get player(){return player},MW,CO,submit,currentValue,startLearn,startTest,startFix,startPre,startReview,openLesson,playConcept,net:Net,cloud:CLOUD,
  answerRight(){if(!RD||!RD.cur)return;submit(RD.cur.p.ans,null)},
  answerWrong(){if(!RD||!RD.cur)return;const p=RD.cur.p,t=p.traps&&p.traps[0];submit(t?t.v:wrongFor(p),null)},
  type(raw){if(!KP)return false;KP.raw='';for(const ch of raw)kpPress(ch);return true}};
})();
