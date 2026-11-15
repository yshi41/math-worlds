(()=>{
'use strict';
const $=s=>document.querySelector(s);
const ri=n=>Math.floor(Math.random()*n);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pickOne=a=>a[ri(a.length)];
const rand=(a,b)=>a+Math.random()*(b-a);
const MW=window.MWC, CO=window.COACH, S=MW.S;
CO.init();

const WK=['lagoon','candy','canopy','ocean','bows','boba','birds','cheer'];
const WNAME={lagoon:'Lagoon',candy:'Sweetshop',canopy:'Rainforest',ocean:'Ocean',bows:'Bow Boutique',boba:'Boba Shop',birds:'Terror Birds',cheer:'Cheer Gym'};
const WGRAD={lagoon:'linear-gradient(135deg,#CFF0F1,#9BDCE0)',candy:'linear-gradient(135deg,#FFF3F8,#FFD3E6)',canopy:'linear-gradient(135deg,#E4F3D6,#AFDA95)',ocean:'linear-gradient(135deg,#E3E7FF,#B9C3F5)',bows:'linear-gradient(135deg,#FFF0F6,#F8C8DD)',boba:'linear-gradient(135deg,#FFF6EC,#F5D9BD)',birds:'linear-gradient(135deg,#F6E9CF,#E6CFA3)',cheer:'linear-gradient(135deg,#FCE8F3,#E6D6FB)'};
/* the players: Riley (3rd grade) and Charlie (4th grade), plus Yan as the test account. The grade picks where the placement check begins. */
const KIDS=[{id:'charlie',name:'Charlie',theme:'candy',grade:4},{id:'riley',name:'Riley',theme:'lagoon',grade:3},{id:'yan',name:'Yan',theme:'birds',grade:4}];
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
  init(){try{if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.ctx=new AC();this.out=this.ctx.createGain();this.out.gain.value=.5;this.out.connect(this.ctx.destination)}if(this.ctx.state!=='running')this.ctx.resume()}catch(e){}},
  f(m){return 440*Math.pow(2,(m-69)/12)},
  tone(freq,dur,o={}){const c=this.ctx;if(!c||!this.on)return;const when=c.currentTime+(o.delay||0),osc=c.createOscillator(),g=c.createGain();osc.type=o.type||'sine';osc.frequency.setValueAtTime(freq,when);if(o.slide)osc.frequency.exponentialRampToValueAtTime(Math.max(30,o.slide),when+dur);
    const v=o.vol!=null?o.vol:.2;g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(v,when+.01);g.gain.exponentialRampToValueAtTime(.0001,when+dur);osc.connect(g);g.connect(this.out);osc.start(when);osc.stop(when+dur+.05)},
  click(){this.tone(660,.06,{type:'triangle',vol:.08})},
  pop(k){const sc=[0,2,4,7,9,12,14,16];const r=67+sc[Math.min(Math.max(k,1)-1,7)];[0,4,7,12].forEach((d,i)=>this.tone(this.f(r+d),.16,{type:'triangle',vol:.15,delay:i*.05}))},
  soft(){this.tone(this.f(76),.12,{type:'triangle',vol:.1});this.tone(this.f(81),.16,{type:'triangle',vol:.08,delay:.07})},
  wrong(){this.tone(220,.25,{type:'triangle',vol:.12,slide:150})},
  coin(){this.tone(988,.08,{type:'square',vol:.05});this.tone(1319,.25,{type:'square',vol:.05,delay:.07})},
  key(){this.tone(880,.03,{type:'triangle',vol:.05})},
  star(i){this.tone(this.f(79+i*5),.35,{type:'triangle',vol:.18})},
  win(){[[72,0,.14],[76,.12,.14],[79,.24,.14],[84,.36,.4]].forEach(([m,d,l])=>this.tone(this.f(m),l,{type:'triangle',vol:.17,delay:d}))}};
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
  if(shownWorld!==k){shownWorld=k;$('#pageScene').innerHTML=buildScene();ambient()}
  setSceneLevel($('#pageScene'),lv||1)}

/* ---------- saves (online only) ---------- */
let screen='menu',ready=false,saveMode='loading';
const saves={};let player=null;
function blank(){return {cur:0,cs:{},mist:{},owned:[],char:{},look:null,games:0,pre:null,now:null}}
/* a save from the first version (lessons and stars) keeps its treats and characters; the concept path and the
   placement check start fresh because the concepts are new */
function normalize(d){const o=JSON.parse(JSON.stringify(d||{}));const b=Object.assign(blank(),o);
  for(const k of ['cs','mist','char'])b[k]=(o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k]))?o[k]:{};
  for(const id in b.cs){const c=b.cs[id];if(!S[id]||!c||typeof c!=='object')delete b.cs[id];else b.cs[id]=Object.assign({lv:0,st:0,ml:0,r:0,w:0,t:0,m:0,due:0,iv:0},c)}
  for(const id in b.mist)if(!S[id])delete b.mist[id];
  b.cur=Math.max(0,o.cur|0);b.games=Math.max(0,o.games|0);b.owned=Array.isArray(o.owned)?o.owned.filter(x=>typeof x==='string'&&x.includes(':')):[];
  b.look=WORLDS[o.look]?o.look:null;b.pre=o.pre&&typeof o.pre==='object'&&o.pre.v===2&&o.pre.st?o.pre:null;b.now=S[o.now]?o.now:null;
  delete b.stars;delete b.best;delete b.sk;return b}
function P(){return saves[player]||(saves[player]=blank())}
function kid(id){return KIDS.find(k=>k.id===id)||KIDS[0]}
function lookOf(id){const p=saves[id];return p&&p.look&&WORLDS[p.look]?p.look:kid(id).theme}
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
    if(screen==='menu')renderMenu();else if(screen==='hub'&&player===id)renderHub()}
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
function persist(){if(CLOUD&&player)Net.schedule(player)}
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
function recordFix(id){const m=P().mist[id];if(!m||m.ok>=3)return;m.ok++;m.t=Date.now();if(m.ok>=3){toast(`Tricky spot fixed: ${conceptName(id)}!`);Snd.win()}}
/* every concept is either a pencil-and-paper concept (written methods, word problems, most algebra and up) or a
   shortcut done in your head; the game says which on every problem */
const isPaper=id=>!!(S[id]&&(S[id].paper||S[id].s==='story'));
const MODE_PAPER='✎ Pencil and paper: write it out, then type the answer',MODE_HEAD='In your head (jot notes if you like)';
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

function openHub(){RD=null;show('hub');renderHub();const k=lookOf(player),p=P();
  const lines=preDone(p)?[`Hi ${kid(player).name}! Ready for a trick?`,'Mistakes show us what to practice!',`Every 5 concepts grows the ${WNAME[k].toLowerCase()}!`,'Shortcuts make math fast!','Spot the pattern!']:[`Hi ${kid(player).name}! Let's find where to start.`];
  bubble($('#hubLine'),pickOne(lines))}
function playConcept(id){if(!id)return;const p=P();if(!CO.started(p,id)&&!CO.isMastered(p,id))openLesson(id);else startLearn(id)}
function renderHub(){const p=P(),k=lookOf(player),mc=CO.masteredCount(p),lv=sceneLevel(p);applyWorld(k,lv);
  $('#hubBrand').textContent=WORLDS[k].brand.replace('Spelling','Math');
  $('#statCur').innerHTML=`${CUR_ICON[k]} ${p.cur}`;$('#statStars').innerHTML=`${starSvg(true)} ${mc}`;$('#statStars').title='Concepts mastered';
  const ch=charOf(p,k);$('#hubHero').innerHTML=charSVG(ch,'happy');$('#hubName').textContent=`${kid(player).name} & ${charName(k,ch)}`;
  $('#lvTitle').textContent=`${WNAME[k]} level ${lv}`;
  if(lv<10){$('#lvBar').style.width=clamp((mc-5*(lv-1))/5*100,0,100)+'%';$('#lvNext').textContent=`Next: ${WORLDS[k].levels[lv].l} at ${5*lv} concepts mastered`}else{$('#lvBar').style.width='100%';$('#lvNext').textContent='Your world is complete!'}
  /* placement check */
  const pc=$('#preCard'),done=preDone(p);pc.hidden=done;
  if(!done){const pre=p.pre,order=pre?pre.order:CO.pretestStart(kid(player).grade).order,started=pre&&pre.order.some(s=>pre.st[s].log.length);const prog=pre?CO.pretestProgress(pre):{done:0,total:order.length};
    $('#preTitle').textContent=started?'Keep going with the placement check':'Placement check';
    $('#preText').textContent=`A check of everything up to ${ord(kid(player).grade+1)} grade, in ${order.length} parts. It finds which concepts you already know, where each part should start, and how hard to make it. Have a pencil and paper ready. You can skip what you haven't learned, stop any time and come back.`;
    const nx=pre&&CO.pretestNext(JSON.parse(JSON.stringify(pre)));
    $('#preParts').innerHTML=order.map(sid=>{const s=CO.STR.find(x=>x.id===sid);return `<span class="pre-part${pre&&pre.st[sid].done?' done':nx&&nx.strand===sid?' now':''}">${s.short}</span>`}).join('');
    $('#preBtn').textContent=started?`Continue (${prog.done} of ${prog.total} parts done)`:'Start the placement check'}
  /* up next */
  const cur=CO.current(p);
  if(!done){$('#nextTitle').textContent='Placement check';$('#nextSub').textContent='Find out where to start';$('#nextBtn').onclick=startPre}
  else if(cur){const c=S[cur];$('#nextTitle').textContent=c.title;$('#nextSub').innerHTML=`Grade ${c.g} · ${esc(strandName(cur))} · ${pips(CO.levelsDone(p,cur))}`;$('#nextBtn').onclick=()=>{Snd.init();Snd.click();playConcept(cur)}}
  else{$('#nextTitle').textContent='Everything mastered!';$('#nextSub').textContent='Keep sharp with a review mix';$('#nextBtn').onclick=startReview}
  const dueN=CO.due(p).length;$('#reviewBtn').disabled=!(mc>0||mistList(p).length);
  $('#reviewSub').textContent=dueN?`${dueN} concept${dueN===1?'':'s'} ready for review, plus your tricky spots`:'10 problems from concepts you have mastered, with extra practice on tricky spots';
  $('#sumLine').textContent=`${mc} of ${CO.ORDER.length} concepts mastered, from 2nd to 12th grade`;
  /* tricky spots */
  const sp=$('#spots'),ml=mistList(p).slice(0,5);sp.innerHTML='';
  if(!ml.length)sp.innerHTML='<p class="empty-note">No tricky spots right now. When a mistake shows an idea that needs work, it lands here with practice to fix it.</p>';
  ml.forEach(([id,m])=>{const d=document.createElement('div');d.className='spot';
    d.innerHTML=`<span class="spot-name">${esc(conceptName(id))}</span><small>Missed ${m.n} ${m.n===1?'time':'times'} · fixed when 3 in a row are right <span class="okdots">${[0,1,2].map(i=>`<i class="${i<m.ok?'on':''}"></i>`).join('')}</span></small>`;
    const b=document.createElement('button');b.type='button';b.className='btn btn-sm';b.textContent='Practice';b.onclick=()=>startFix(id);d.append(b);sp.append(d)});
  /* the map: one card per grade */
  const map=$('#map');map.innerHTML='';const openG=cur?S[cur].g:kid(player).grade;
  for(let g=2;g<=12;g++){const ids=CO.ORDER.filter(id=>S[id].g===g);if(!ids.length)continue;const m=ids.filter(id=>CO.isMastered(p,id)).length;
    const det=document.createElement('details');det.className='grade';det.open=g===openG;
    det.innerHTML=`<summary><span class="st-ic">${g}</span><span>${ord(g)} grade</span><span class="gbar"><i style="width:${(m/ids.length*100).toFixed(1)}%"></i></span><span class="st-count">${m} of ${ids.length}</span></summary>`;
    const box=document.createElement('div');box.className='chips';
    ids.forEach(id=>{const c=S[id],dn=CO.isMastered(p,id),op=CO.isOpen(p,id),pg=!dn&&CO.started(p,id),st=CO.strandOf(id);
      const b=document.createElement('button');b.type='button';b.className='chip'+(dn?' done':pg?' prog':op?' open':' locked')+(id===cur&&done?' now':'');
      b.innerHTML=`<span class="ci">${dn?'✓':st.icon}</span><span class="chip-t">${esc(c.title)}</span>`;b.title=st.name+(dn?' · mastered':pg?' · level '+(CO.levelsDone(p,id)+1)+' of 3':op?'':' · locked');
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
$('#tSound').onclick=()=>{Snd.init();Snd.on=!Snd.on;$('#tSound').setAttribute('aria-pressed',String(Snd.on));Snd.click()};
$('#tVoice').onclick=()=>{Voice.on=!Voice.on;$('#tVoice').setAttribute('aria-pressed',String(Voice.on));if(Voice.on)Voice.say('I will read the questions out loud.');else if(window.speechSynthesis)speechSynthesis.cancel()};
$('#redoPre').onclick=()=>{const p=P();p.pre=CO.pretestStart(kid(player).grade);p.pre.t=Date.now();persist();renderHub();toast('The placement check starts fresh. Concepts you already mastered stay mastered.')};

/* ---------- concept intro ---------- */
let LS=null,LS_EXVIS='';
function hashStr(s){let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h}
function openLesson(id){const p=P(),c=S[id],open=CO.isOpen(p,id),dn=CO.isMastered(p,id),k=lookOf(player);LS=id;show('lesson');applyWorld(k,sceneLevel(p));
  $('#lessonStrand').textContent=strandName(id);$('#lsKicker').textContent=`${ord(c.g)} grade · ${strandName(id)}`;$('#lsTitle').textContent=c.title;$('#lsStars').innerHTML=stars3(CO.levelsDone(p,id));
  $('#lsHero').innerHTML=charSVG(charOf(p,k),'happy');$('#lsTip').textContent=c.tip;
  const lm=$('#lsMode');lm.className='q-mode'+(isPaper(id)?' paper':'');lm.textContent=isPaper(id)?'✎ A pencil-and-paper concept: copy the example onto your paper as you go':'A shortcut you do in your head';
  $('#printBtn').onclick=()=>{Snd.click();printSheet(id)};
  const ex=MW.gen(id,0,MW.makeR(hashStr(id)));$('#lsExQ').innerHTML=ex.text;$('#lsExVis').innerHTML=ex.vis||'';
  const ol=$('#lsExSteps');ol.innerHTML=ex.how.map((h,i)=>`<li class="${i?'hide':''}">${h}</li>`).join('')+`<li class="hide">Answer: <b>${MW.ansText(ex)}</b></li>`;
  LS_EXVIS=ex.howVis||'';
  const sb=$('#lsStepBtn');sb.hidden=false;sb.textContent='Next step';
  sb.onclick=()=>{Snd.click();const h=ol.querySelector('li.hide');if(h)h.classList.remove('hide');if(!ol.querySelector('li.hide')&&!sb.hidden){sb.hidden=true;if(LS_EXVIS)$('#lsExVis').insertAdjacentHTML('beforeend',LS_EXVIS)}};
  const s=p.cs[id];
  $('#lsStatus').innerHTML=dn?'Mastered! Practice it any time.':open?(CO.started(p,id)?`Level ${s.lv+1} of 3 ${pips(s.lv)}`:'New concept'):'';
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
<h1>${esc(c.title)}</h1><p class="ws-tip">${esc(c.tip)}</p><p class="ws-name">Name: ${esc(kid(player).name)} · ${ord(c.g)} grade · ${pp?'Show your work.':'Do it in your head, or jot notes.'}</p>
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
function uniqueGen(id,d){let p;for(let i=0;i<14;i++){p=MW.gen(id,d,RD.R);if(!RD.keys.has(p.key))break}RD.keys.add(p.key);return p}
function startLearn(id){Snd.init();Snd.click();const p=P();if(!CO.isMastered(p,id))p.now=id;newRound({kind:'learn',skill:id});beginPlay()}
function startTest(id){Snd.init();Snd.click();newRound({kind:'test',skill:id,mainTotal:5});beginPlay()}
function startReview(){Snd.init();Snd.click();newRound({kind:'review'});beginPlay()}
function startFix(cid){Snd.init();Snd.click();newRound({kind:'fix',concept:cid});
  RD.queue=CO.fixSet(cid,RD.R).map(q=>({p:q,kind:'prac',concept:cid}));RD.fixTotal=RD.queue.length;RD.mainTotal=RD.fixTotal;beginPlay()}
function startPre(){Snd.init();Snd.click();const p=P();if(!p.pre||p.pre.done){p.pre=CO.pretestStart(kid(player).grade);p.pre.t=Date.now()}newRound({kind:'pre'});beginPlay()}
function beginPlay(){const p=P(),k=lookOf(player);applyWorld(k,sceneLevel(p));show('play');$('#playHero').innerHTML=charSVG(charOf(p,k),'neutral');
  $('#playTitle').textContent=RD.kind==='learn'?conceptName(RD.skill):RD.kind==='test'?'Test out: '+conceptName(RD.skill):RD.kind==='review'?'Review mix':RD.kind==='fix'?'Tricky spot: '+conceptName(RD.concept):'Placement check';
  bubble($('#playBubble'),RD.kind==='pre'?'Do your best! It is fine to skip what you have not learned.':'You can do it!');nextQ()}
function pickWeighted(list,wf){const w=list.map(wf);let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<list.length;i++){r-=w[i];if(r<=0)return list[i]}return list[list.length-1]}
function reviewProblem(){const p=P(),ml=mistList(p),dl=CO.due(p);
  if(ml.length&&Math.random()<.35){const [cid]=pickOne(ml.slice(0,3));const q=MW.gen(cid,ri(2),RD.R);q.concept=cid;RD.keys.add(q.key);return {p:q,kind:'main',concept:cid}}
  const mast=Object.keys(p.cs).filter(id=>S[id]&&p.cs[id].m);
  if(!mast.length){if(!ml.length)return null;const [cid]=ml[0];const q=MW.gen(cid,1,RD.R);q.concept=cid;return {p:q,kind:'main',concept:cid}}
  const id=dl.length&&Math.random()<.7?pickOne(dl.slice(0,4)):pickWeighted(mast,x=>{const s=p.cs[x];return 1+4*s.w/(s.r+s.w+1)+Math.min(3,(Date.now()-(s.t||0))/864e5)});
  return {p:uniqueGen(id,Math.random()<.75?2:1),kind:'rev'}}
function makeMain(){const p=P();
  if(RD.kind==='learn'){if(RD.stop||RD.mainDone>=RD.mainTotal)return null;
    const dl=CO.due(p).filter(id=>id!==RD.skill);
    if((RD.mainDone===3||RD.mainDone===7)&&dl.length&&!RD['rv'+RD.mainDone]){RD['rv'+RD.mainDone]=1;return {p:uniqueGen(dl[0],2),kind:'rev'}}
    const d=CO.isMastered(p,RD.skill)?2:CO.cs(p,RD.skill).lv;return {p:uniqueGen(RD.skill,d),kind:'main'}}
  if(RD.kind==='test'){if(RD.stop||RD.mainDone>=RD.mainTotal)return null;return {p:uniqueGen(RD.skill,2),kind:'main'}}
  if(RD.kind==='review'){if(RD.mainDone>=10)return null;return reviewProblem()}
  if(RD.kind==='pre'){const nx=CO.pretestNext(p.pre);if(!nx)return null;return {p:uniqueGen(nx.skill,nx.d),kind:'pre',nx}}
  return null}
function nextItem(){if(RD.queue.length)return RD.queue.shift();if(RD.stop)return null;const m=makeMain();if(m)return m;if(RD.endQ.length)return RD.endQ.shift();return null}

let KP=null,ANS=null;
const counted=it=>it.kind==='main'||it.kind==='rev'||it.kind==='prac';
function nextQ(){const it=nextItem();if(!it){finishRound();return}
  RD.cur=it;RD.tries=0;RD.usedHint=false;RD.phase='ask';RD.t0=Date.now();KP=null;
  const p=it.p,cid=it.concept||p.concept;
  const bd=$('#qBadge');bd.hidden=false;bd.className='q-badge'+(it.kind==='step'?' build':it.kind==='fix'||it.kind==='prac'||cid?' fix':'');
  bd.textContent=it.kind==='step'?'Step by step':cid?'Tricky spot: '+conceptName(cid):it.kind==='rev'?'Review: '+conceptName(p.skill):it.kind==='pre'?`Placement · ${CO.STR.find(s=>s.id===it.nx.strand).name}`:RD.kind==='test'?'Test out · hard':['Easy','Medium','Hard'][p.d]+` · level ${p.d+1} of 3`;
  const pp=isPaper(p.skill),qm=$('#qMode');qm.className='q-mode'+(pp||it.kind==='step'?' paper':'');qm.textContent=it.kind==='step'?(pp?'✎ Write this step on your paper':'One small step'):pp?MODE_PAPER:MODE_HEAD;
  $('#qText').innerHTML=p.text;$('#qVis').innerHTML=p.vis||'';
  const fb=$('#feedback');fb.hidden=true;fb.className='feedback';fb.innerHTML='';
  $('#nextQBtn').hidden=true;$('#skipBtn').hidden=it.kind!=='pre';$('#hintBtn').hidden=it.kind==='pre'||RD.kind==='test'||!p.how||!p.how.length;$('#hintBtn').disabled=false;
  const area=$('#answerArea');area.innerHTML='';area.hidden=false;ANS=null;buildKeypad(area,p);$('#checkBtn').hidden=false;$('#checkBtn').disabled=false;
  renderDots();$('#playCur').innerHTML=`${CUR_ICON[lookOf(player)]} ${P().cur}`;
  $('#streak').textContent=RD.streak>=2?`${RD.streak} in a row!`:'';
  if(Voice.on)Voice.say(p.say);
  setMood('neutral')}
function renderDots(){const d=$('#dots');if(RD.kind==='pre'){const pr=CO.pretestProgress(P().pre);d.innerHTML=`<span class="streak">Part ${Math.min(pr.done+1,pr.total)} of ${pr.total}</span>`;return}
  let h='';const total=RD.mainTotal;for(let i=0;i<total;i++){const r=RD.results[i];h+=`<i class="${r===true?'ok':r===false?'no':i===RD.results.length&&RD.cur&&counted(RD.cur)?'now':''}"></i>`}d.innerHTML=h}
function setMood(m){const s=$('#playHero svg');if(s)s.setAttribute('data-mood',m)}

/* the keypad: digits plus only the extra keys this problem's grade calls for (. / − r) */
function buildKeypad(area,p){const kind=p.type==='money'?(p.fmt==='d'?'dollars':'cents'):p.type;KP={p,kind,raw:''};ANS={kind:'keypad'};
  const extra=MW.keysFor(p),one=extra.length===1?extra[0]:'',top=extra.length>1?extra:[];
  const key=k=>`<button type="button" class="key${k?'':' blank'}" data-k="${k}" ${k?'':'tabindex="-1" aria-hidden="true"'}${k===' '?' aria-label="space, for mixed numbers"':''}>${k===' '?'␣':k}</button>`;
  const hint=kind==='time'?(p.dur?'Type hours, then minutes: 1 4 5 for 1 hour 45 minutes':'Type the time: 3 1 5 for 3:15'):kind==='rem'?'Tap r between the answer and the leftovers: 3 r 2':kind==='frac'?'Type a fraction with /, like 3/4'+(p.low?' (lowest terms)':extra.includes(' ')?'. For a mixed number tap ␣: 1 ␣ 2/3':''):'';
  const wrap=document.createElement('div');wrap.className='kp';
  wrap.innerHTML=`<div class="kp-display" id="kpDisp" aria-live="polite"></div>${hint?`<div class="kp-hint">${hint}</div>`:''}${top.length?`<div class="kp-keys">${top.map(key).join('')}</div>`:''}<div class="kp-keys">${['1','2','3','4','5','6','7','8','9',one,'0','⌫'].map(key).join('')}</div>`;
  area.append(wrap);wrap.querySelectorAll('.key').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();Snd.init();kpPress(b.dataset.k)}));kpRender()}
function kpRender(){if(!KP)return;const r=KP.raw,el=$('#kpDisp');if(!el)return;let h;
  if(KP.kind==='time')h=!r?'<span class="ph">_:__</span>':r.length<=2&&!KP.p.dur?`${r}<span class="ph">:__</span>`:r.length<=2?`<span class="ph">0:</span>${r.padStart(2,'0')}`:`${r.slice(0,-2)}:${r.slice(-2)}`;
  else if(KP.kind==='dollars')h='$'+(r||'<span class="ph">0.00</span>');
  else if(KP.kind==='cents')h=(r||'<span class="ph">?</span>')+'<span class="unit">¢</span>';
  else if(KP.kind==='rem')h=r?esc(r.replace('r',' r ')):'<span class="ph">?</span>';
  else h=(r?esc(r):'<span class="ph">?</span>')+(KP.p.unit?`<span class="unit">${KP.p.unit}</span>`:'');
  el.innerHTML=h}
function kpPress(k){if(!KP||!RD||RD.phase!=='ask'||!k)return;let r=KP.raw;const numish=KP.kind==='num'||KP.kind==='frac';
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
$('#skipBtn').onclick=()=>{if(!RD||RD.phase!=='ask'||RD.cur.kind!=='pre')return;Snd.click();RD.phase='done';CO.pretestSkip(P().pre);P().pre.t=Date.now();persist();afterPre(false,true)};
$('#nextQBtn').onclick=()=>{Snd.click();nextQ()};
$('#readBtn').onclick=()=>{if(RD&&RD.cur)Voice.say(RD.cur.p.say)};
$('#quitBtn').onclick=()=>{Snd.click();persist();if(RD&&RD.kind!=='pre'&&RD.mainDone+RD.results.length>0){finishRound(true);return}RD=null;openHub()};
function showFb(cls,html){const fb=$('#feedback');fb.hidden=false;fb.className='feedback '+cls;fb.innerHTML=html}

/* ---------- checking an answer ---------- */
function submit(v,el){if(!RD||RD.phase!=='ask')return;const it=RD.cur,p=it.p;if(MW.eqAns(p,v))onRight(el);else onWrong(v,el)}
function award(n){if(n<=0)return;const p=P();p.cur+=n;RD.earned+=n;$('#playCur').innerHTML=`${CUR_ICON[lookOf(player)]} ${p.cur}`}
function onRight(el){const it=RD.cur,p=it.p,first=RD.tries===0,k=lookOf(player),pl=P();RD.phase='done';
  if(it.kind==='pre'){CO.pretestRecord(pl.pre,true);pl.pre.t=Date.now();award(2);Snd.soft();persist();afterPre(true);return}
  let extra='';
  if(it.kind!=='step'){
    if(first){RD.streak++;RD.bestStreak=Math.max(RD.bestStreak,RD.streak)}
    if(counted(it)){RD.results.push(first);if(it.kind!=='prac'){RD.mainDone++;if(first)RD.right++}else if(first)RD.fixRight++}
    const cid=it.concept||p.concept;
    if(first){award(it.kind==='prac'||it.kind==='fix'||cid?6:10);if(cid)recordFix(cid)}
    if(first&&it.kind==='rev'){CO.reviewResult(pl,p.skill,true);CO.record(pl,p.skill,true,true,RD.usedHint)}
    if(first&&RD.kind==='learn'&&it.kind==='main'){const ev=CO.record(pl,p.skill,true,true,RD.usedHint);
      if(ev.levelUp!=null){RD.lvUps++;award(15);extra=`<div><b>Level ${ev.levelUp+1} of 3!</b> The problems get a little harder now.</div>`;toast(`Level up! Level ${ev.levelUp+1} of 3`);Snd.win()}
      if(ev.mastered){RD.masteredNow=p.skill;RD.stop=true;RD.queue=[];award(40);extra=`<div><b>Concept mastered: ${esc(conceptName(p.skill))}!</b></div>`}
      if(!first||RD.usedHint)extra+=''}
    if(first&&RD.kind==='test'&&it.kind==='main'&&!RD.usedHint)RD.testRight++;
    const m=WORLDS[k].milestones&&WORLDS[k].milestones[RD.streak];if(first&&m&&(RD.streak===5||RD.streak===10)){award(m.b);toast(`${m.t} +${m.b} ${curName(k)}`)}}
  else if(first)award(2);
  Snd.pop(Math.max(1,RD.streak));setMood('happy');fxFrom(el||$('#answerArea'),first?24:10);if(RD.masteredNow&&it.kind==='main')setTimeout(()=>fxConfetti(120),200);
  const praise=pickOne(WORLDS[k].praise||['Nice!','Great!','Yes!']);
  /* no automatic next: kids are writing on paper, so they move on when ready. Paper problems show the whole written
     solution to check their work against, line by line. */
  if(first){const pp=isPaper(p.skill)&&it.kind!=='step'&&p.how.length>1;
    showFb('good',`<div class="fb-h">${praise}</div>`+(it.kind==='step'?'':pp?`<div>Check your work against this:</div><ol class="steps">${p.how.map(h=>`<li>${h}</li>`).join('')}</ol>`:`<div>${p.how[p.how.length-1]}</div>`)+extra);renderDots();
    $('#nextQBtn').hidden=false;$('#nextQBtn').textContent=RD.stop?'See how you did':'Next';$('#checkBtn').hidden=true;$('#hintBtn').hidden=true;clearTimeout(RD.autoT);
    if(!extra&&it.kind==='step'&&!isPaper(p.skill))RD.autoT=setTimeout(()=>{if(RD&&RD.cur===it&&screen==='play')nextQ()},1100)}
  else{showFb('good',`<div class="fb-h">You got it!</div><div>Here is the shortcut again:</div><ol class="steps">${p.how.map(h=>`<li>${h}</li>`).join('')}</ol>`);renderDots();$('#nextQBtn').hidden=false;$('#nextQBtn').textContent='Next';$('#checkBtn').hidden=true;$('#hintBtn').hidden=true}
  bubble($('#playBubble'),RD.masteredNow&&it.kind==='main'?'You mastered it!':first?praise:'Way to keep trying!');persist()}
function onWrong(v,el){const it=RD.cur,p=it.p,pl=P();RD.tries++;Snd.wrong();setMood('oops');
  if(RD.tries===1&&it.kind!=='pre'){it.diag=CO.diagnose(p,v);RD.streak=0;
    if(it.kind!=='step'){
      const learning=RD.kind==='learn'||RD.kind==='test'?RD.skill:RD.kind==='fix'?RD.concept:null,cid=it.concept||p.concept;
      if(RD.kind==='learn'&&it.kind==='main'){const ev=CO.record(pl,p.skill,false,true,RD.usedHint);if(ev.levelDown!=null)toast(`Back to level ${ev.levelDown+1} for a little more practice.`)}
      if(it.kind==='rev'){CO.reviewResult(pl,p.skill,false);CO.record(pl,p.skill,false,true,false)}
      const spot=it.kind==='rev'?(CO.spotFor(pl,it.diag,null)||p.skill):CO.spotFor(pl,it.diag,learning);
      if(spot){recordMiss(spot,it.diag.why);RD.missed[spot]=(RD.missed[spot]||0)+1;it.spot=spot}
      if(cid){const m=pl.mist[cid];if(m)m.ok=0}
      if(RD.kind==='fix'){RD.fixMiss++;const dp=CO.deeper(RD.concept);if(RD.fixMiss>=2&&dp&&!RD.deeperAdded){RD.deeperAdded=dp;if(!pl.mist[dp]||pl.mist[dp].ok>=3)pl.mist[dp]={n:1,ok:0,t:Date.now()}}}}}
  if(it.kind==='pre'){RD.phase='done';CO.pretestRecord(pl.pre,false);pl.pre.t=Date.now();persist();afterPre(false);return}
  if(RD.tries===1){const why=it.diag&&it.diag.why;showFb('try',`<div class="fb-h">Not quite. Try again!</div><div>${why?why:'Hint: '+(p.hint||p.how[0])}</div>${isPaper(p.skill)?'<div>Look back over your paper, one line at a time.</div>':''}`);
    if(KP){KP.raw='';kpRender()}bubble($('#playBubble'),'Try once more!');persist();return}
  /* second miss: show the worked shortcut, then break it down */
  RD.phase='done';if(counted(it)){RD.results.push(false);if(it.kind!=='prac')RD.mainDone++}
  $('#answerArea').hidden=true;
  const sp=it.spot&&it.spot!==p.skill?it.spot:null;
  showFb('bad',`<div class="fb-h">The answer is ${MW.ansText(p)}</div><div>${isPaper(p.skill)&&it.kind!=='step'?'Compare your paper with these lines. Find the first line where your work is different: that is the step to fix.':'Here is the shortcut:'}</div><ol class="steps">${p.how.map(h=>`<li>${h}</li>`).join('')}</ol>${p.howVis?`<div class="vis-wrap">${p.howVis}</div>`:''}${sp?`<div><span class="fb-spot">Tricky spot: ${esc(conceptName(sp))}</span> We'll practice that idea too.</div>`:''}`);
  let label='Next';
  if(it.kind!=='step'&&p.steps&&p.steps.length&&!RD.inserted[p.key]){RD.inserted[p.key]=1;RD.queue.unshift(...p.steps.map(q=>({p:q,kind:'step'})));label="Let's break it down"}
  if(it.kind!=='step'&&sp&&RD.kind!=='fix'&&!RD.inserted[sp]){RD.inserted[sp]=1;RD.endQ.push(...CO.fixSet(sp,RD.R,2).map(q=>({p:q,kind:'fix',concept:sp})))}
  $('#nextQBtn').hidden=false;$('#nextQBtn').textContent=label;$('#checkBtn').hidden=true;$('#hintBtn').hidden=true;renderDots();
  bubble($('#playBubble'),label==='Next'?'Now you know the trick!':'Let’s take it one step at a time.');persist()}
function afterPre(ok,skipped){const pre=P().pre;
  const strandJustDone=pre.order.find(s=>pre.st[s].done&&!RD['done_'+s]);if(strandJustDone){RD['done_'+strandJustDone]=1}
  const sname=strandJustDone?CO.STR.find(s=>s.id===strandJustDone).name:'';
  showFb(ok?'good':'try',`<div class="fb-h">${ok?pickOne(['Nice!','Got it!','Yes!']):skipped?'That’s OK!':'Thanks!'}</div>${ok?'':'<div>We’ll practice that one.</div>'}${strandJustDone?`<div><b>${sname}</b>: placed!</div>`:''}`);
  renderDots();$('#checkBtn').hidden=true;$('#skipBtn').hidden=true;$('#hintBtn').hidden=true;
  clearTimeout(RD.autoT);RD.autoT=setTimeout(()=>{if(RD&&RD.kind==='pre'&&screen==='play')nextQ()},ok?700:1100)}

/* ---------- end of a round ---------- */
function finishRound(early){const p=P(),k=lookOf(player);if(!RD)return;clearTimeout(RD.autoT);const R0=RD;
  const ST=WORLDS[k].sumTitles||['Great work!','Nice work!','Good practice!'];
  let title=ST[0],sub='',starsShown=null,note='',nextId=null;
  if(R0.kind==='learn'){const id=R0.skill;sub=conceptName(id);starsShown=CO.levelsDone(p,id);p.games++;
    if(R0.masteredNow){title='Concept mastered!';nextId=CO.current(p);p.now=nextId;note=nextId?`Next up: “${conceptName(nextId)}”.`:'You have mastered every concept!'}
    else if(CO.isMastered(p,id)){note='A practice round on a concept you have mastered.';if(R0.right<7)title=ST[2]}
    else{const lv=CO.cs(p,id).lv;nextId=id;title=R0.lvUps?'Level up!':R0.right>=7?ST[1]:ST[2];
      note=(R0.lvUps?`You reached level ${lv+1} of 3. `:`You're on level ${lv+1} of 3. `)+'Get 3 right in a row, first try, to go up. Finish level 3 to master it.'}}
  else if(R0.kind==='test'){const id=R0.skill;sub='Test out: '+conceptName(id);
    if(!early&&R0.testRight>=5){CO.master(p,id);title='Tested out!';starsShown=3;note=`“${conceptName(id)}” is mastered.`}else{title=ST[2];note=early?'Stopped early. Try again any time.':'Not this time. All 5 need to be right on the first try, with no hints.'}}
  else if(R0.kind==='review'){sub='Review mix';p.games++}
  else if(R0.kind==='fix'){const m=p.mist[R0.concept];sub='Tricky spot: '+conceptName(R0.concept);
    note=m&&m.ok>=3?'Fixed! That idea is solid now.':`${R0.fixRight} of ${R0.fixTotal} practice problems right the first time. Fixed after 3 in a row.`;
    if(R0.deeperAdded)note+=` Next, go one step back with “${conceptName(R0.deeperAdded)}”, which is in your tricky spots.`}
  else if(R0.kind==='pre'){const pre=p.pre;sub='Placement check';
    if(pre&&!CO.pretestNext(pre)){pre.done=true;const res=CO.pretestApply(p,pre);title='All placed!';note=`${res.mastered} concepts you already know are marked mastered. They'll come back now and then for review.`}
    else{title='Saved!';note='Your placement check is saved. Pick up where you left off any time.'}}
  persist();RD=null;LAST=R0;
  show('results');applyWorld(k,sceneLevel(p));$('#resHero').innerHTML=charSVG(charOf(p,k),'happy');$('#resTitle').textContent=title;$('#resSub').textContent=sub;
  $('#resStars').innerHTML=starsShown!=null?[0,1,2].map(i=>starSvg(i<starsShown)).join(''):'';
  $('#rRight').textContent=R0.kind==='pre'?R0.earned/2|0:R0.kind==='fix'?R0.fixRight:R0.right;$('#rStreak').textContent=R0.bestStreak;$('#rCur').textContent='+'+R0.earned;$('#rCurL').textContent=cap(curName(k));
  $('#resNote').textContent=note;
  /* tricky spots found this round, with practice right here */
  const rs=$('#resSpots');rs.innerHTML='';const found=Object.keys(R0.missed).filter(id=>S[id]&&(!p.mist[id]||p.mist[id].ok<3));
  if(found.length&&R0.kind!=='fix'){rs.innerHTML='<h3>Tricky spots found</h3>';const box=document.createElement('div');box.className='spots';
    found.slice(0,4).forEach(id=>{const d=document.createElement('div');d.className='spot';d.innerHTML=`<span class="spot-name">${esc(conceptName(id))}</span><small>${esc((p.mist[id]&&p.mist[id].why)||S[id].tip)}</small>`;const b=document.createElement('button');b.type='button';b.className='btn btn-sm';b.textContent='Practice';b.onclick=()=>startFix(id);d.append(b);box.append(d)});rs.append(box)}
  /* placement results */
  const pl=$('#resPlaces');pl.innerHTML='';
  if(R0.kind==='pre'&&p.pre&&p.pre.done){p.pre.order.forEach(sid=>{const st=CO.STR.find(s=>s.id===sid),x=p.pre.st[sid],start=st.list[x.start];pl.insertAdjacentHTML('beforeend',`<div class="place"><span class="st-ic">${st.icon}</span><span class="place-name">${st.name}</span><small>${start?'Starts at: '+esc(conceptName(start)):'Everything here up to '+ord(p.pre.grade+1)+' grade is mastered'}</small></div>`)})}
  const cur=CO.current(p),nb=$('#nextLessonBtn');nb.hidden=!cur||!preDone(p)||(R0.kind==='learn'&&!R0.masteredNow&&cur===R0.skill);
  nb.textContent=R0.masteredNow||R0.kind!=='learn'?'Next concept':'Up next';nb.onclick=()=>{Snd.click();playConcept(CO.current(P()))};
  $('#againBtn').hidden=(R0.kind==='pre'&&preDone(p))||!!R0.masteredNow||(R0.kind==='test'&&CO.isMastered(p,R0.skill));
  $('#againBtn').textContent=R0.kind==='pre'?'Keep going':R0.kind==='fix'?'Practice again':R0.kind==='learn'?'Keep going':'Play again';
  if(starsShown)for(let i=0;i<starsShown;i++)setTimeout(()=>Snd.star(i),300+i*250);
  if(!early)setTimeout(()=>fxConfetti(R0.masteredNow||(R0.kind==='pre'&&preDone(p))?160:70),250);Snd.win()}
let LAST=null;
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
$('#againBtn').onclick=()=>{const L0=LAST;if(!L0)return openHub();if(L0.kind==='learn')startLearn(L0.skill);else if(L0.kind==='test')startTest(L0.skill);else if(L0.kind==='review')startReview();else if(L0.kind==='fix')startFix(L0.concept);else startPre()};
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
function fxConfetti(n){const cols=fxCols();for(let i=0;i<n;i++)FX.push({x:rand(0,innerWidth),y:rand(-120,-10),vx:rand(-60,60),vy:rand(80,240),life:rand(2.4,3.6),r:rand(5,9),col:pickOne(cols),rect:true,rot:rand(0,6),vr:rand(-8,8),g:40});kick()}
let fxRun=false,last=0;
function kick(){if(fxRun)return;fxRun=true;last=performance.now();requestAnimationFrame(step)}
function step(now){const dt=Math.min(.05,(now-last)/1000);last=now;const {c,w,h}=fxFit();c.clearRect(0,0,w,h);
  for(const p of FX){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;c.globalAlpha=clamp(p.life*1.5,0,1);c.fillStyle=p.col;
    if(p.rect){p.rot+=p.vr*dt;c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.fillRect(-p.r/2,-p.r,p.r,p.r*2);c.restore()}else{c.beginPath();c.arc(p.x,p.y,p.r,0,6.283);c.fill()}}
  c.globalAlpha=1;FX=FX.filter(p=>p.life>0&&p.y<h+40);if(FX.length)requestAnimationFrame(step);else{c.clearRect(0,0,w,h);fxRun=false}}


renderMenu();renderSaveNote();
function wrongFor(p){const a=p.ans;switch(p.type){case 'frac':return {n:a.n+a.d,d:a.d};case 'time':return p.dur?{h:a.h+1,m:a.m}:{h:a.h%12+1,m:a.m};case 'rem':return {q:a.q+1,r:a.r};default:return a+1}}
window.__mw={get RD(){return RD},get saves(){return saves},get player(){return player},MW,CO,submit,currentValue,startLearn,startTest,startFix,startPre,startReview,openLesson,playConcept,net:Net,cloud:CLOUD,
  answerRight(){if(!RD||!RD.cur)return;submit(RD.cur.p.ans,null)},
  answerWrong(){if(!RD||!RD.cur)return;const p=RD.cur.p,t=p.traps&&p.traps[0];submit(t?t.v:wrongFor(p),null)},
  type(raw){if(!KP)return false;KP.raw='';for(const ch of raw)kpPress(ch);return true}};
})();
