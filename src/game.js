(()=>{
'use strict';
const $=s=>document.querySelector(s);
const ri=n=>Math.floor(Math.random()*n);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pickOne=a=>a[ri(a.length)];
const rand=(a,b)=>a+Math.random()*(b-a);
const CO=window.COACH, SK=MW.S, STR=MW.STRANDS, ORDER=MW.ORDER;

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
function blank(){return {cur:0,stars:{},best:{},sk:{},mist:{},owned:[],char:{},look:null,games:0,pre:null}}
function normalize(d){const o=JSON.parse(JSON.stringify(d||{}));const b=Object.assign(blank(),o);
  for(const k of ['stars','best','sk','mist','char'])b[k]=(o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k]))?o[k]:{};
  b.cur=Math.max(0,o.cur|0);b.games=Math.max(0,o.games|0);b.owned=Array.isArray(o.owned)?o.owned.filter(x=>typeof x==='string'&&x.includes(':')):[];
  b.look=WORLDS[o.look]?o.look:null;b.pre=o.pre&&typeof o.pre==='object'&&o.pre.st?o.pre:null;return b}
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

/* ---------- progress rules ---------- */
const starsOf=(p,id)=>p.stars[id]|0;
const strandOf=id=>STR.find(s=>s.id===SK[id].strand);
function isOpen(p,id){if(starsOf(p,id)>0)return true;const s=SK[id],st=strandOf(id);if(s.idx>0&&starsOf(p,st.skills[s.idx-1])<2)return false;for(const r of s.req)if(starsOf(p,r)<1)return false;return true}
function whyLocked(p,id){const s=SK[id],st=strandOf(id);if(s.idx>0&&starsOf(p,st.skills[s.idx-1])<2)return `Get 2 stars on “${SK[st.skills[s.idx-1]].title}” to open this lesson.`;const r=s.req.find(r=>starsOf(p,r)<1);return r?`This one needs a star in “${SK[r].title}” first.`:''}
function nextSkill(p){for(const id of ORDER)if(isOpen(p,id)&&starsOf(p,id)<2)return id;for(const id of ORDER)if(isOpen(p,id)&&starsOf(p,id)<3)return id;return null}
function totalStars(p){let s=0;if(p)for(const x in p.stars)if(SK[x])s+=p.stars[x]|0;return s}
function mastered(p){return ORDER.filter(id=>starsOf(p,id)>=3).length}
function sceneLevel(p){return clamp(1+Math.floor(totalStars(p)/6),1,10)}
function preDone(p){return !!(p&&p.pre&&p.pre.done)}
function mistList(p){return Object.entries(p.mist||{}).filter(([id,m])=>m&&m.ok<3&&CO.concept(id)).sort((a,b)=>(b[1].n-a[1].n)||(b[1].t-a[1].t))}
function recordMiss(id,skill,why){const p=P();const m=p.mist[id]||(p.mist[id]={n:0,ok:0,t:0});m.n=(m.n|0)+1;m.ok=0;m.t=Date.now();m.s=skill;if(why)m.why=why}
function recordFix(id){const m=P().mist[id];if(!m||m.ok>=3)return;m.ok++;m.t=Date.now();if(m.ok>=3){const c=CO.concept(id);toast(`Tricky spot fixed: ${c?c.label:id}!`);Snd.win()}}
function skStat(id,ok){const p=P();const s=p.sk[id]||(p.sk[id]={r:0,w:0,t:0});if(ok)s.r++;else s.w++;s.t=Date.now()}

/* ---------- screens ---------- */
function show(id){document.querySelectorAll('.screen').forEach(s=>s.hidden=s.id!==id);screen=id;window.scrollTo(0,0);if(window.speechSynthesis)speechSynthesis.cancel()}
let toastT=null;
function toast(msg){document.querySelectorAll('.toast2').forEach(t=>t.remove());const t=document.createElement('div');t.className='toast2';t.textContent=msg;document.body.append(t);clearTimeout(toastT);toastT=setTimeout(()=>t.remove(),2600)}
function bubble(el,text){el.textContent=text;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}

function renderMenu(){applyWorld('lagoon',3);const box=$('#kids');box.innerHTML='';
  KIDS.forEach(k=>{const p=saves[k.id],w=lookOf(k.id);
    const b=document.createElement('button');b.type='button';b.className='profile-card';b.disabled=!ready;b.style.background=WGRAD[w];
    b.innerHTML=`${charSVG(charOf(p,w))}<span class="pc-name">${k.name}</span><span class="pc-world">${WNAME[w]}</span><span class="pc-meta"><span>${starSvg(true)} ${totalStars(p)}</span><span>${CUR_ICON[w]} ${p?p.cur:0}</span></span>`;
    b.onclick=()=>{Snd.init();Snd.click();player=k.id;openHub()};box.append(b)})}

function openHub(){RD=null;show('hub');renderHub();const k=lookOf(player),p=P();
  const lines=preDone(p)?[`Hi ${kid(player).name}! Ready for a trick?`,'Mistakes are how we find what to practice!',`Every 6 stars grows the ${WNAME[k].toLowerCase()}!`,'Shortcuts make math fast!','Try a review mix to keep it sharp!']:[`Hi ${kid(player).name}! Let's find where to start.`];
  bubble($('#hubLine'),pickOne(lines))}
function renderHub(){const p=P(),k=lookOf(player),lv=sceneLevel(p),ts=totalStars(p);applyWorld(k,lv);
  $('#hubBrand').textContent=WORLDS[k].brand.replace('Spelling','Math');
  $('#statCur').innerHTML=`${CUR_ICON[k]} ${p.cur}`;$('#statStars').innerHTML=`${starSvg(true)} ${ts}`;
  const ch=charOf(p,k);$('#hubHero').innerHTML=charSVG(ch,'happy');$('#hubName').textContent=`${kid(player).name} & ${charName(k,ch)}`;
  $('#lvTitle').textContent=`${WNAME[k]} level ${lv}`;
  if(lv<10){$('#lvBar').style.width=clamp((ts-6*(lv-1))/6*100,0,100)+'%';$('#lvNext').textContent=`Next: ${WORLDS[k].levels[lv].l} at ${6*lv} stars`}else{$('#lvBar').style.width='100%';$('#lvNext').textContent='Your world is complete!'}
  /* placement check */
  const pc=$('#preCard'),done=preDone(p);pc.hidden=done;
  if(!done){const pre=p.pre,started=pre&&pre.order.some(s=>pre.st[s].log.length);const prog=pre?CO.pretestProgress(pre):{done:0,total:STR.length};
    $('#preTitle').textContent=started?'Keep going with the placement check':'Placement check';
    $('#preText').textContent=`A check of everything ${kid(player).grade===3?'a 3rd grader':'a 4th grader'} might know, in ${STR.length} parts. It finds where each part should start and how hard to make it. About 6 questions a part. You can stop any time and come back.`;
    const nx=pre&&CO.pretestNext(JSON.parse(JSON.stringify(pre)));
    $('#preParts').innerHTML=STR.map(s=>`<span class="pre-part${pre&&pre.st[s.id].done?' done':nx&&nx.strand===s.id?' now':''}">${s.short}</span>`).join('');
    $('#preBtn').textContent=started?`Continue (${prog.done} of ${prog.total} parts done)`:'Start the placement check'}
  /* up next */
  const nx=nextSkill(p);
  if(!done){$('#nextTitle').textContent='Placement check';$('#nextSub').textContent='Find out where to start';$('#nextBtn').onclick=startPre}
  else if(nx){const st=strandOf(nx);$('#nextTitle').textContent=SK[nx].title;$('#nextSub').textContent=`${st.name} · lesson ${SK[nx].idx+1} of ${st.skills.length}`;$('#nextBtn').onclick=()=>{Snd.init();Snd.click();openLesson(nx)}}
  else{$('#nextTitle').textContent='Everything mastered!';$('#nextSub').textContent='Keep sharp with a review mix';$('#nextBtn').onclick=startReview}
  const canReview=ORDER.some(id=>starsOf(p,id)>0)||mistList(p).length>0;$('#reviewBtn').disabled=!canReview;
  $('#sumLine').textContent=`${mastered(p)} of ${ORDER.length} lessons mastered · ${ts} stars`;
  /* tricky spots */
  const sp=$('#spots'),ml=mistList(p).slice(0,5);sp.innerHTML='';
  if(!ml.length)sp.innerHTML='<p class="empty-note">No tricky spots right now. When a mistake shows an idea that needs work, it lands here with practice to fix it.</p>';
  ml.forEach(([id,m])=>{const c=CO.concept(id);const d=document.createElement('div');d.className='spot';
    d.innerHTML=`<span class="spot-name">${esc(c.label)}</span><small>Missed ${m.n} ${m.n===1?'time':'times'} · fixed when 3 in a row are right <span class="okdots">${[0,1,2].map(i=>`<i class="${i<m.ok?'on':''}"></i>`).join('')}</span></small>`;
    const b=document.createElement('button');b.type='button';b.className='btn btn-sm';b.textContent='Practice';b.onclick=()=>startFix(id);d.append(b);sp.append(d)});
  /* the map */
  const map=$('#map');map.innerHTML='';
  STR.forEach(st=>{const c=document.createElement('div');c.className='card strand';const m=st.skills.filter(id=>starsOf(p,id)>=3).length,s2=st.skills.filter(id=>starsOf(p,id)>=2).length;
    c.innerHTML=`<div class="strand-h"><span class="st-ic">${st.icon}</span><span class="st-name">${st.name}</span><span class="st-count">${s2} of ${st.skills.length} done</span></div>`;
    const nd=document.createElement('div');nd.className='nodes';
    st.skills.forEach((id,i)=>{const s=starsOf(p,id),open=isOpen(p,id),b=document.createElement('button');b.type='button';
      b.className='node'+(s>=3?' done':open?' open':' locked')+(id===nx&&done?' next':'');
      b.innerHTML=`<span class="node-n">${open?i+1:'🔒'}</span><span class="node-t">${SK[id].title}</span>${stars3(s)}`;b.setAttribute('aria-label',`${SK[id].title}, ${s} stars${open?'':', locked'}`);
      b.onclick=()=>{Snd.init();Snd.click();openLesson(id)};nd.append(b)});
    c.append(nd);map.append(c)});
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
function pickChar(k,id,cost){const p=P();
  if(!owns(p,k,id)){if(p.cur<cost)return;p.cur-=cost;p.owned.push(k+':'+id);Snd.coin();toast(`${charName(k,id)} joined you!`);fxBurst(innerWidth/2,innerHeight*.4,60)}else Snd.click();
  p.char[k]=id;persist();renderHub()}
$('#switchBtn').onclick=()=>{Snd.click();show('menu');renderMenu()};
$('#preBtn').onclick=()=>startPre();
$('#reviewBtn').onclick=()=>startReview();
$('#tSound').onclick=()=>{Snd.init();Snd.on=!Snd.on;$('#tSound').setAttribute('aria-pressed',String(Snd.on));Snd.click()};
$('#tVoice').onclick=()=>{Voice.on=!Voice.on;$('#tVoice').setAttribute('aria-pressed',String(Voice.on));if(Voice.on)Voice.say('I will read the questions out loud.');else if(window.speechSynthesis)speechSynthesis.cancel()};
$('#redoPre').onclick=()=>{const p=P();p.pre=CO.pretestStart(kid(player).grade);p.pre.t=Date.now();persist();renderHub();toast('The placement check starts fresh. Stars you already earned stay.')};

/* ---------- lesson intro ---------- */
let LS=null;
function hashStr(s){let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h}
function openLesson(id){const p=P(),s=SK[id],st=strandOf(id),open=isOpen(p,id),k=lookOf(player);LS=id;show('lesson');applyWorld(k,sceneLevel(p));
  $('#lessonStrand').textContent=st.name;$('#lsKicker').textContent=`Lesson ${s.idx+1} of ${st.skills.length}`;$('#lsTitle').textContent=s.title;$('#lsStars').innerHTML=stars3(starsOf(p,id));
  $('#lsHero').innerHTML=charSVG(charOf(p,k),'happy');$('#lsTip').textContent=s.tip;
  const ex=MW.gen(id,1,MW.makeR(hashStr(id)));$('#lsExQ').innerHTML=ex.text;
  $('#lsExVis').innerHTML=(ex.vis||'')+(ex.type==='clockset'?MW.clockSVG(ex.ans.h,ex.ans.m,{cls:'sm'}):'')+(ex.type==='coins'?MW.coinsRow(ex.sets[0]):'');
  const ol=$('#lsExSteps');ol.innerHTML=ex.how.map((h,i)=>`<li class="${i?'hide':''}">${h}</li>`).join('')+`<li class="hide">Answer: <b>${MW.ansText(ex)}</b></li>`;
  LS_EXVIS=ex.howVis||'';
  const sb=$('#lsStepBtn');sb.hidden=false;sb.textContent='Next step';
  sb.onclick=()=>{Snd.click();const h=ol.querySelector('li.hide');if(h)h.classList.remove('hide');if(!ol.querySelector('li.hide')&&!sb.hidden){sb.hidden=true;if(LS_EXVIS)$('#lsExVis').insertAdjacentHTML('beforeend',LS_EXVIS)}};
  $('#lsLocked').hidden=open;$('#lsLocked').textContent=open?'':whyLocked(p,id)+' Or test out: get 9 of 10 right to open it and everything before it.';
  $('#lsModes').hidden=!open;$('#testOutBtn').hidden=open;$('#starRules').hidden=!open;
  $('#pickBtn').hidden=!!s.only;$('#solveBtn').querySelector('b').textContent=s.only?'Start':'Solve It';
  $('#pickBtn').onclick=()=>startLesson(id,'pick');$('#solveBtn').onclick=()=>startLesson(id,'solve');$('#testOutBtn').onclick=()=>startLesson(id,'solve',true);}
let LS_EXVIS='';
$('#lessonBack').onclick=()=>{Snd.click();openHub()};

/* ---------- rounds ----------
   A round is a queue of items. Lesson rounds have 10 scored problems that get harder (3 easy, 4 medium, 3 hard).
   A first miss gets a retry with a hint aimed at the likely mistake; a second miss shows the worked shortcut, then the
   coach breaks the idea into steps with the same numbers. The ideas missed come back as practice at the end. */
let RD=null;
const SCHED=[0,0,0,1,1,1,1,2,2,2],SCHED_TEST=[1,1,1,1,2,2,2,2,2,2];
function newRound(o){RD=Object.assign({queue:[],endQ:[],mainDone:0,mainTotal:10,right:0,hints:0,streak:0,bestStreak:0,earned:0,missed:{},inserted:{},results:[],keys:new Set(),R:MW.makeR(),fixMiss:0,fixRight:0,fixTotal:0,phase:'ask'},o)}
function uniqueGen(id,d){let p;for(let i=0;i<14;i++){p=MW.gen(id,d,RD.R);if(!RD.keys.has(p.key))break}RD.keys.add(p.key);return p}
function startLesson(id,mode,test){Snd.init();Snd.click();newRound({kind:'lesson',skill:id,mode,test:!!test});beginPlay()}
function startReview(){Snd.init();Snd.click();newRound({kind:'review',mode:'solve'});beginPlay()}
function startFix(cid){Snd.init();Snd.click();newRound({kind:'fix',concept:cid,mode:'solve'});
  RD.queue=CO.session(cid,RD.R,null).map(q=>({p:q,kind:q.step?'step':'prac'}));RD.fixTotal=RD.queue.filter(x=>x.kind==='prac').length;
  const extra=CO.concept(cid).practice(RD.R).slice(2,4).map(q=>{q.concept=cid;return {p:q,kind:'prac'}});RD.queue.push(...extra);RD.fixTotal+=extra.length;RD.mainTotal=RD.fixTotal;beginPlay()}
function startPre(){Snd.init();Snd.click();const p=P();if(!p.pre||p.pre.done){p.pre=CO.pretestStart(kid(player).grade);p.pre.t=Date.now()}newRound({kind:'pre',mode:'solve'});beginPlay()}
function beginPlay(){const p=P(),k=lookOf(player);applyWorld(k,sceneLevel(p));show('play');$('#playHero').innerHTML=charSVG(charOf(p,k),'neutral');
  $('#playTitle').textContent=RD.kind==='lesson'?(RD.test?'Test out: ':'')+SK[RD.skill].title+(RD.mode==='pick'?' · Pick It':' · Solve It'):RD.kind==='review'?'Review mix':RD.kind==='fix'?'Tricky spot: '+CO.concept(RD.concept).label:'Placement check';
  bubble($('#playBubble'),RD.kind==='pre'?'Do your best! It is fine to skip what you have not learned.':'You can do it!');nextQ()}
function reviewProblem(){const p=P(),ml=mistList(p);
  if(ml.length&&Math.random()<.35){const [cid]=pickOne(ml.slice(0,3));const q=pickOne(CO.concept(cid).practice(RD.R));q.concept=cid;RD.keys.add(q.key);return {p:q,kind:'main'}}
  const cand=ORDER.filter(id=>starsOf(p,id)>0);if(!cand.length&&ml.length){const [cid]=ml[0];const q=pickOne(CO.concept(cid).practice(RD.R));q.concept=cid;return {p:q,kind:'main'}}
  const now=Date.now(),wts=cand.map(id=>{const s=p.sk[id]||{r:0,w:0,t:0};return 1+4*s.w/(s.r+s.w+1)+Math.min(3,(now-(s.t||0))/864e5)});
  let r=Math.random()*wts.reduce((a,b)=>a+b,0),id=cand[0];for(let i=0;i<cand.length;i++){r-=wts[i];if(r<=0){id=cand[i];break}}
  const st=starsOf(p,id),d=st>=3?2:st===2?1+ri(2):ri(2);return {p:uniqueGen(id,d),kind:'main'}}
function makeMain(){
  if(RD.kind==='lesson'){if(RD.mainDone>=10)return null;return {p:uniqueGen(RD.skill,(RD.test?SCHED_TEST:SCHED)[RD.mainDone]),kind:'main'}}
  if(RD.kind==='review'){if(RD.mainDone>=10)return null;return reviewProblem()}
  if(RD.kind==='pre'){const nx=CO.pretestNext(P().pre);if(!nx)return null;return {p:uniqueGen(nx.skill,nx.d),kind:'pre',nx}}
  return null}
function nextItem(){if(RD.queue.length)return RD.queue.shift();const m=makeMain();if(m)return m;if(RD.endQ.length)return RD.endQ.shift();return null}
function itemMode(it){if(it.p.type==='choice')return 'pick';if(it.kind==='pre'||RD.kind!=='lesson')return 'solve';return RD.mode}

let KP=null,CS=null,TR=null,ANS=null;
function nextQ(){const it=nextItem();if(!it){finishRound();return}
  RD.cur=it;RD.tries=0;RD.usedHint=false;RD.phase='ask';RD.t0=Date.now();KP=CS=TR=null;
  const p=it.p,mode=itemMode(it);it.mode=mode;
  const bd=$('#qBadge'),c=p.concept||it.concept?CO.concept(p.concept||it.concept):null;
  bd.hidden=!(it.kind==='step'||it.kind==='prac'||it.kind==='fix'||it.kind==='pre'||RD.kind==='review');
  bd.className='q-badge'+(it.kind==='step'?' build':it.kind==='fix'||it.kind==='prac'?' fix':'');
  bd.textContent=it.kind==='step'?`Step by step${c?': '+c.label:''}`:(it.kind==='fix'||it.kind==='prac')?`Tricky spot${c?': '+c.label:''}`:it.kind==='pre'?`Placement · ${STR.find(s=>s.id===it.nx.strand).name}`:RD.kind==='review'?(p.concept?'Tricky spot: '+CO.concept(p.concept).label:SK[p.skill]?SK[p.skill].title:''):'';
  $('#qText').innerHTML=mode==='pick'&&p.textPick?p.textPick:p.text;
  $('#qVis').innerHTML=p.vis||'';
  const fb=$('#feedback');fb.hidden=true;fb.className='feedback';fb.innerHTML='';
  $('#nextQBtn').hidden=true;$('#skipBtn').hidden=it.kind!=='pre';$('#hintBtn').hidden=it.kind==='pre'||!p.how||!p.how.length;$('#hintBtn').disabled=false;
  const area=$('#answerArea');area.innerHTML='';area.hidden=false;ANS=null;
  if(mode==='pick'){buildChoices(area,p);$('#checkBtn').hidden=true}
  else if(['num','money','time','rem'].includes(p.type)){buildKeypad(area,p);$('#checkBtn').hidden=false}
  else if(p.type==='clockset'){buildClock(area,p);$('#checkBtn').hidden=false}
  else if(p.type==='coins'){buildTray(area,p);$('#checkBtn').hidden=false}
  $('#checkBtn').disabled=false;
  renderDots();$('#playCur').innerHTML=`${CUR_ICON[lookOf(player)]} ${P().cur}`;
  $('#streak').textContent=RD.streak>=2?`${RD.streak} in a row!`:'';
  if(Voice.on)Voice.say(p.say);
  setMood('neutral')}
function renderDots(){const d=$('#dots');if(RD.kind==='pre'){const pr=CO.pretestProgress(P().pre);d.innerHTML=`<span class="streak">Part ${Math.min(pr.done+1,pr.total)} of ${pr.total}</span>`;return}
  let h='';const total=RD.mainTotal;for(let i=0;i<total;i++){const r=RD.results[i];h+=`<i class="${r===true?'ok':r===false?'no':i===RD.results.length&&(RD.cur&&(RD.cur.kind==='main'||RD.cur.kind==='prac'))?'now':''}"></i>`}d.innerHTML=h}
function setMood(m){const s=$('#playHero svg');if(s)s.setAttribute('data-mood',m)}

/* answer pads */
function buildChoices(area,p){const ch=MW.choices(p,RD.R),box=document.createElement('div');box.className='choices';ANS={kind:'choices',btns:[]};
  ch.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.className='choice';b.innerHTML=c.html;b.dataset.ok=c.ok?'1':'';b.onclick=()=>{Snd.init();submit(c.v,b)};box.append(b);ANS.btns.push({b,c})});
  area.append(box)}
function buildKeypad(area,p){const kind=p.type==='money'?(p.fmt==='d'?'dollars':'cents'):p.type;KP={p,kind,raw:''};ANS={kind:'keypad'};
  const extra=kind==='dollars'?'.':kind==='rem'?'r':'';
  const wrap=document.createElement('div');wrap.className='kp';
  wrap.innerHTML=`<div class="kp-display" id="kpDisp" aria-live="polite"></div>${kind==='time'?`<div class="kp-hint">${p.dur?'Type hours, then minutes: 1 4 5 for 1 hour 45 minutes':'Type the time: 3 1 5 for 3:15'}</div>`:kind==='rem'?'<div class="kp-hint">Tap r between the answer and the leftovers: 3 r 2</div>':''}<div class="kp-keys">${['1','2','3','4','5','6','7','8','9',extra||'','0','⌫'].map(k=>`<button type="button" class="key${k?'':' blank'}" data-k="${k}" ${k?'':'tabindex="-1" aria-hidden="true"'}>${k}</button>`).join('')}</div>`;
  area.append(wrap);wrap.querySelectorAll('.key').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();Snd.init();kpPress(b.dataset.k)}));kpRender()}
function kpRender(){if(!KP)return;const r=KP.raw,el=$('#kpDisp');if(!el)return;let h;
  if(KP.kind==='time')h=!r?'<span class="ph">_:__</span>':r.length<=2?`${r}<span class="ph">:__</span>`:`${r.slice(0,-2)}:${r.slice(-2)}`;
  else if(KP.kind==='dollars')h='$'+(r||'<span class="ph">0.00</span>');
  else if(KP.kind==='cents')h=(r||'<span class="ph">?</span>')+'<span class="unit">¢</span>';
  else if(KP.kind==='rem')h=r?esc(r.replace('r',' r ')):'<span class="ph">?</span>';
  else h=(r||'<span class="ph">?</span>')+(KP.p.unit?`<span class="unit">${KP.p.unit}</span>`:'');
  el.innerHTML=h}
function kpPress(k){if(!KP||!RD||RD.phase!=='ask'||!k)return;let r=KP.raw;
  if(k==='⌫')r=r.slice(0,-1);
  else if(k==='.'){if(KP.kind!=='dollars'||r.includes('.'))return;r+=(r?'':'0')+'.'}
  else if(k==='r'){if(KP.kind!=='rem'||r.includes('r')||!r)return;r+='r'}
  else if(/^\d$/.test(k)){const max=KP.kind==='time'?4:7;if(r.replace(/\D/g,'').length>=max)return;if(KP.kind==='dollars'&&r.includes('.')&&r.split('.')[1].length>=2)return;if(KP.kind==='time'&&!r&&k==='0')return;r+=k}
  KP.raw=r;Snd.key();kpRender();$('#kpDisp').classList.remove('bad')}
function buildClock(area,p){CS={h:12,m:0,snap:p.snap||5};ANS={kind:'clock'};const w=document.createElement('div');w.className='clockset';
  w.innerHTML=MW.clockSVG(12,0,{drag:true})+`<div class="cs-btns"><button class="btn btn-ghost" data-d="-60" type="button">− hour</button><button class="btn btn-ghost" data-d="60" type="button">+ hour</button><button class="btn btn-ghost" data-d="-${CS.snap}" type="button">− ${CS.snap} min</button><button class="btn btn-ghost" data-d="${CS.snap}" type="button">+ ${CS.snap} min</button></div><div class="kp-hint">Drag the hands, or use the buttons</div>`;
  area.append(w);const svg=w.querySelector('svg');
  w.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{if(RD.phase!=='ask')return;const t=MW.T.add(CS.h,CS.m,+b.dataset.d);CS.h=t.h;CS.m=t.m;Snd.key();csDraw()});
  let drag=null;
  const ang=e=>{const r=svg.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);return (Math.atan2(x,-y)*180/Math.PI+360)%360};
  svg.addEventListener('pointerdown',e=>{if(RD.phase!=='ask')return;e.preventDefault();const hand=e.target.closest('[data-hand]');drag=hand?hand.dataset.hand:'m';try{svg.setPointerCapture(e.pointerId)}catch(_){}move(e)});
  const move=e=>{if(!drag)return;const a=ang(e);
    if(drag==='m'){const mm=Math.round(a/6/CS.snap)*CS.snap%60;if(CS.m>=45&&mm<15)CS.h=CS.h%12+1;else if(CS.m<15&&mm>=45)CS.h=CS.h===1?12:CS.h-1;CS.m=mm}
    else{let hh=Math.round(a/30-CS.m/60);hh=((hh%12)+12)%12;CS.h=hh||12}
    csDraw()};
  svg.addEventListener('pointermove',move);svg.addEventListener('pointerup',()=>{drag=null});svg.addEventListener('pointercancel',()=>{drag=null});csDraw()}
function csDraw(){const svg=document.querySelector('.clockset svg');if(!svg||!CS)return;svg.querySelector('.ck-h').setAttribute('transform',`rotate(${((CS.h%12)+CS.m/60)*30} 100 100)`);svg.querySelector('.ck-m').setAttribute('transform',`rotate(${CS.m*6} 100 100)`)}
function buildTray(area,p){TR={list:[],p};ANS={kind:'tray'};const set=MW.COIN_ORDER.filter(id=>p.coinSet.includes(id));
  area.insertAdjacentHTML('beforeend',`<div class="tray" id="tray"></div><div class="tray-total" id="trayTotal"></div><div class="purse" id="purse">${set.map(id=>`<button type="button" data-c="${id}" aria-label="Add a ${MW.COIN[id].name}">${MW.coinSVG(id)}<span>${MW.COIN[id].name}</span></button>`).join('')}</div><div class="cs-btns"><button class="btn btn-ghost btn-sm" type="button" id="trayClear">Clear</button></div>`);
  area.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{if(RD.phase!=='ask'||TR.list.length>=24)return;Snd.coin();TR.list.push(b.dataset.c);trayDraw()});
  $('#trayClear').onclick=()=>{if(RD.phase!=='ask')return;TR.list=[];trayDraw()};trayDraw()}
function trayDraw(){const t=$('#tray');if(!t)return;t.innerHTML='';TR.list.forEach((id,i)=>{const s=document.createElement('span');s.innerHTML=MW.coinSVG(id);s.title='Tap to take it back';s.onclick=()=>{if(RD.phase!=='ask')return;TR.list.splice(i,1);Snd.key();trayDraw()};t.append(s)});
  const tot=MW.sum(TR.list.map(id=>MW.COIN[id].v));$('#trayTotal').textContent=TR.p.showTotal?`You have ${MW.fmtM(tot)}${TR.p.fewest?` · ${TR.list.length} ${TR.list.length===1?'coin':'coins'}`:''}`:''}
function currentValue(){if(!ANS)return null;if(ANS.kind==='keypad')return MW.parse(KP.p,KP.raw);if(ANS.kind==='clock')return {h:CS.h,m:CS.m};if(ANS.kind==='tray')return TR.list.slice();return null}
$('#checkBtn').onclick=()=>{if(!RD||RD.phase!=='ask')return;Snd.init();const v=currentValue();
  if(v==null||(ANS.kind==='tray'&&!v.length)){if(ANS.kind==='keypad'){const d=$('#kpDisp');d.classList.remove('bad');void d.offsetWidth;d.classList.add('bad')}toast(ANS.kind==='tray'?'Add some coins first.':'Type your answer first.');return}
  submit(v,null)};
$('#hintBtn').onclick=()=>{if(!RD||RD.phase!=='ask')return;Snd.click();RD.usedHint=true;const p=RD.cur.p;showFb('try',`<div class="fb-h">Hint</div><div>${p.hint||p.how[0]}</div>`);$('#hintBtn').disabled=true};
$('#skipBtn').onclick=()=>{if(!RD||RD.phase!=='ask'||RD.cur.kind!=='pre')return;Snd.click();RD.phase='done';CO.pretestSkip(P().pre);P().pre.t=Date.now();persist();afterPre(false,true)};
$('#nextQBtn').onclick=()=>{Snd.click();nextQ()};
$('#readBtn').onclick=()=>{if(RD&&RD.cur)Voice.say(RD.cur.p.say)};
$('#quitBtn').onclick=()=>{Snd.click();persist();if(RD&&(RD.kind==='lesson')&&RD.mainDone===0){RD=null;openHub();return}if(RD&&RD.kind!=='pre'&&RD.mainDone>0){finishRound(true);return}RD=null;openHub()};
function showFb(cls,html){const fb=$('#feedback');fb.hidden=false;fb.className='feedback '+cls;fb.innerHTML=html}

/* ---------- checking an answer ---------- */
const scoredKinds=['main','pre','prac','fix'];
function submit(v,el){if(!RD||RD.phase!=='ask')return;const it=RD.cur,p=it.p;
  if(MW.eqAns(p,v))onRight(el);else onWrong(v,el)}
function award(n){if(n<=0)return;const p=P();p.cur+=n;RD.earned+=n;$('#playCur').innerHTML=`${CUR_ICON[lookOf(player)]} ${p.cur}`}
function onRight(el){const it=RD.cur,p=it.p,first=RD.tries===0,k=lookOf(player);RD.phase='done';
  if(el)el.classList.add('ok');if(ANS&&ANS.kind==='choices')ANS.btns.forEach(x=>x.b.disabled=true);
  if(it.kind==='pre'){CO.pretestRecord(P().pre,true);P().pre.t=Date.now();skStat(p.skill,true);award(2);Snd.soft();persist();afterPre(true);return}
  if(scoredKinds.includes(it.kind)){if(first){RD.streak++;RD.bestStreak=Math.max(RD.bestStreak,RD.streak)}
    if(it.kind==='main'||it.kind==='prac'){RD.results.push(first);if(it.kind==='main'){RD.mainDone++;if(first){RD.right++;if(RD.usedHint)RD.hints++}}else{RD.fixRight+=first?1:0}}
    if(first){award(it.kind==='main'?(it.mode==='pick'?5:10):6);if(p.concept)recordFix(p.concept);else{const b=CO.base(p);if(P().mist[b])recordFix(b)}if(SK[p.skill]&&it.kind==='main')skStat(p.skill,true)}
    const m=WORLDS[k].milestones&&WORLDS[k].milestones[RD.streak];if(first&&m&&(RD.streak===5||RD.streak===10)){award(m.b);toast(`${m.t} +${m.b} ${curName(k)}`)}}
  else if(first)award(2);
  Snd.pop(Math.max(1,RD.streak));setMood('happy');fxFrom(el||$('#answerArea'),first?24:10);
  const praise=pickOne(WORLDS[k].praise||['Nice!','Great!','Yes!']);
  if(first){showFb('good',`<div class="fb-h">${praise}</div>`+(it.kind==='step'?'':`<div>${p.how[p.how.length-1]}</div>`));renderDots();
    $('#nextQBtn').hidden=false;$('#nextQBtn').textContent='Next';$('#checkBtn').hidden=true;$('#hintBtn').hidden=true;clearTimeout(RD.autoT);RD.autoT=setTimeout(()=>{if(RD&&RD.cur===it&&screen==='play')nextQ()},it.kind==='step'?1100:1500)}
  else{showFb('good',`<div class="fb-h">You got it!</div><div>Here is the shortcut again:</div><ol class="steps">${p.how.map(h=>`<li>${h}</li>`).join('')}</ol>`);renderDots();$('#nextQBtn').hidden=false;$('#nextQBtn').textContent='Next';$('#checkBtn').hidden=true;$('#hintBtn').hidden=true}
  bubble($('#playBubble'),first?praise:'Way to keep trying!');persist()}
function onWrong(v,el){const it=RD.cur,p=it.p;RD.tries++;Snd.wrong();setMood('oops');
  if(RD.tries===1){it.diag=CO.diagnose(p,v);RD.streak=0;
    if(scoredKinds.includes(it.kind)){recordMiss(it.diag.id,p.skill,it.diag.why);RD.missed[it.diag.id]=(RD.missed[it.diag.id]||0)+1;if(SK[p.skill])skStat(p.skill,false);
      if(RD.kind==='fix'&&it.diag.id!==RD.concept){const m=P().mist[RD.concept];if(m)m.ok=0}
      if(RD.kind==='fix'){RD.fixMiss++;const c=CO.concept(RD.concept);if(RD.fixMiss>=2&&c.deeper&&!RD.deeperAdded&&CO.concept(c.deeper)){RD.deeperAdded=c.deeper;const p2=P();if(!p2.mist[c.deeper]||p2.mist[c.deeper].ok>=3)p2.mist[c.deeper]={n:1,ok:0,t:Date.now(),s:p.skill}}}}}
  if(it.kind==='pre'){RD.phase='done';if(ANS&&ANS.kind==='choices')ANS.btns.forEach(x=>x.b.disabled=true);CO.pretestRecord(P().pre,false);P().pre.t=Date.now();persist();afterPre(false);return}
  const twoWay=p.type==='choice'&&p.opts.length<=2;
  if(RD.tries===1&&!twoWay){if(el){el.classList.add('bad');el.disabled=true}
    const why=it.diag&&it.diag.why;showFb('try',`<div class="fb-h">Not quite. Try again!</div><div>${why?why:'Hint: '+(p.hint||p.how[0])}</div>`);
    if(KP){KP.raw='';kpRender()}bubble($('#playBubble'),'Try once more!');persist();return}
  /* second miss: show the worked shortcut, then break the idea down */
  RD.phase='done';if(it.kind==='main'||it.kind==='prac'){RD.results.push(false);if(it.kind==='main')RD.mainDone++}
  if(ANS&&ANS.kind!=='choices')$('#answerArea').hidden=true;
  if(ANS&&ANS.kind==='choices')ANS.btns.forEach(x=>{x.b.disabled=true;if(x.c.ok)x.b.classList.add('ok')});
  const c=it.diag&&CO.concept(it.diag.id),show2=p.type==='clockset'?MW.clockSVG(p.ans.h,p.ans.m,{cls:'sm'}):p.type==='coins'?MW.coinsRow(p.sets[0]):'';
  showFb('bad',`<div class="fb-h">The answer is ${MW.ansText(p)}</div>${show2?`<div class="vis-wrap">${show2}</div>`:''}<div>Here is the shortcut:</div><ol class="steps">${p.how.map(h=>`<li>${h}</li>`).join('')}</ol>${p.howVis?`<div class="vis-wrap">${p.howVis}</div>`:''}${c&&scoredKinds.includes(it.kind)?`<div><span class="fb-spot">Tricky spot: ${esc(c.label)}</span> ${esc(c.blurb||'')}</div>`:''}`);
  let label='Next';
  if((it.kind==='main'||it.kind==='prac')&&it.diag&&!RD.inserted[it.diag.id]){RD.inserted[it.diag.id]=1;const ses=CO.session(it.diag.id,RD.R,p),steps=ses.filter(q=>q.step),prac=ses.filter(q=>!q.step);
    if(steps.length){RD.queue.unshift(...steps.map(q=>({p:q,kind:'step',concept:it.diag.id})));label="Let's break it down"}
    if(RD.kind!=='fix'&&prac.length)RD.endQ.push(...prac.slice(1,3).map(q=>{q.concept=it.diag.id;return {p:q,kind:'fix'}}))}
  $('#nextQBtn').hidden=false;$('#nextQBtn').textContent=label;$('#checkBtn').hidden=true;$('#hintBtn').hidden=true;renderDots();
  bubble($('#playBubble'),label==='Next'?'Now you know the trick!':'Let’s take it one step at a time.');persist()}
function afterPre(ok,skipped){const pre=P().pre;const nx=CO.pretestNext(pre);
  const strandJustDone=STR.find(s=>pre.st[s.id].done&&!RD['done_'+s.id]);if(strandJustDone){RD['done_'+strandJustDone.id]=1}
  showFb(ok?'good':'try',`<div class="fb-h">${ok?pickOne(['Nice!','Got it!','Yes!']):skipped?'That’s OK!':'Thanks!'}</div>${ok?'':'<div>We’ll practice that one.</div>'}${strandJustDone?`<div><b>${strandJustDone.name}</b>: placed!</div>`:''}`);
  renderDots();$('#checkBtn').hidden=true;$('#skipBtn').hidden=true;
  clearTimeout(RD.autoT);RD.autoT=setTimeout(()=>{if(RD&&RD.kind==='pre'&&screen==='play')nextQ()},ok?700:1100);void nx}

/* ---------- end of a round ---------- */
function finishRound(early){const p=P(),k=lookOf(player);clearTimeout(RD&&RD.autoT);if(!RD)return;const R0=RD;
  let title=WORLDS[k].sumTitles?WORLDS[k].sumTitles[0]:'Great work!',sub='',starsShown=null,note='',stBefore=0,newSt=0;
  if(R0.kind==='lesson'){const id=R0.skill,s=SK[id];stBefore=starsOf(p,id);
    if(R0.test){if(!early&&R0.right>=9){const st=strandOf(id);for(let i=0;i<=s.idx;i++){const sid=st.skills[i];p.stars[sid]=Math.max(starsOf(p,sid),2)}newSt=2;note=`You tested out! “${s.title}” and every lesson before it are open.`}else{note=early?'Stopped early. Try the test again any time.':'Not this time. You need 9 of 10. The lessons before this one will get you there.';title=WORLDS[k].sumTitles?WORLDS[k].sumTitles[2]:'Good try!'}}
    else if(!early){const solve=R0.mode==='solve'||s.only;newSt=solve?(R0.right>=10&&R0.hints===0?3:R0.right>=8?2:R0.right>=7?1:0):(R0.right>=7?1:0);
      p.best[id]=Math.max(p.best[id]|0,R0.right);if(newSt>stBefore){award(25*(newSt-stBefore));p.stars[id]=newSt}
      if(newSt<1)title=WORLDS[k].sumTitles?WORLDS[k].sumTitles[2]:'Good practice!';else if(newSt<3)title=WORLDS[k].sumTitles?WORLDS[k].sumTitles[1]:'Nice work!';
      if(!solve&&R0.right>=7)note='Pick It earns 1 star. Try Solve It for 2 and 3 stars.';
      else if(newSt<2&&solve)note=`Get 8 of 10 right for 2 stars and the next lesson.`;
      const st=strandOf(id),nxt=st.skills[s.idx+1];if(stBefore<2&&starsOf(p,id)>=2&&nxt)note=`New lesson open: “${SK[nxt].title}”!`;
      else if(starsOf(p,id)>=3&&stBefore<3)note='Lesson mastered!'}
    starsShown=R0.test?null:Math.max(newSt,0);sub=s.title;p.games++}
  else if(R0.kind==='review'){sub='Review mix';p.games++}
  else if(R0.kind==='fix'){const c=CO.concept(R0.concept),m=p.mist[R0.concept];sub='Tricky spot: '+c.label;
    note=m&&m.ok>=3?'Fixed! That idea is solid now.':`${R0.fixRight} of ${R0.fixTotal} practice problems right the first time. Fixed after 3 in a row.`;
    if(R0.deeperAdded)note+=` Next, go one step back with “${CO.concept(R0.deeperAdded).label}”, which is in your tricky spots.`}
  else if(R0.kind==='pre'){const pre=p.pre;sub='Placement check';
    if(pre&&!CO.pretestNext(pre)){pre.done=true;const add=CO.pretestStars(pre);for(const id in add)p.stars[id]=Math.max(starsOf(p,id),add[id]);title='All placed!';note='Each part now starts at the right lesson. Lessons you already know are marked done.'}
    else{title='Saved!';note='Your placement check is saved. Pick up where you left off any time.'}}
  persist();RD=null;LAST=R0;
  show('results');applyWorld(k,sceneLevel(p));$('#resHero').innerHTML=charSVG(charOf(p,k),'happy');$('#resTitle').textContent=title;$('#resSub').textContent=sub;
  $('#resStars').innerHTML=starsShown!=null?[0,1,2].map(i=>starSvg(i<starsShown)).join(''):'';
  $('#rRight').textContent=R0.kind==='pre'?R0.earned/2|0:R0.kind==='fix'?R0.fixRight:R0.right;$('#rStreak').textContent=R0.bestStreak;$('#rCur').textContent='+'+R0.earned;$('#rCurL').textContent=cap(curName(k));
  $('#resNote').textContent=note;
  /* tricky spots found this round, with practice right here */
  const rs=$('#resSpots');rs.innerHTML='';const found=Object.keys(R0.missed).filter(id=>CO.concept(id)&&(!p.mist[id]||p.mist[id].ok<3));
  if(found.length&&R0.kind!=='fix'){rs.innerHTML='<h3>Tricky spots found</h3>';const box=document.createElement('div');box.className='spots';
    found.slice(0,4).forEach(id=>{const c=CO.concept(id),d=document.createElement('div');d.className='spot';d.innerHTML=`<span class="spot-name">${esc(c.label)}</span><small>${esc(c.blurb||'')}</small>`;const b=document.createElement('button');b.type='button';b.className='btn btn-sm';b.textContent='Practice';b.onclick=()=>startFix(id);d.append(b);box.append(d)});rs.append(box)}
  /* placement results */
  const pl=$('#resPlaces');pl.innerHTML='';
  if(R0.kind==='pre'&&p.pre&&p.pre.done){STR.forEach(st=>{const s=p.pre.st[st.id],start=s.start;pl.insertAdjacentHTML('beforeend',`<div class="place"><span class="st-ic">${st.icon}</span><span class="place-name">${st.name}</span><small>${start>=st.skills.length?'All done! Mastery practice next':'Starts at: '+SK[st.skills[start]].title}</small></div>`)})}
  const nx=nextSkill(p);$('#nextLessonBtn').hidden=!nx||!preDone(p);$('#nextLessonBtn').onclick=()=>{Snd.click();openLesson(nx)};
  $('#againBtn').hidden=R0.kind==='pre'&&preDone(p);$('#againBtn').textContent=R0.kind==='pre'?'Keep going':R0.kind==='fix'?'Practice again':'Play again';
  if(starsShown)for(let i=0;i<starsShown;i++)setTimeout(()=>Snd.star(i),300+i*250);
  if(!early)setTimeout(()=>fxConfetti(starsShown===3||(R0.kind==='pre'&&preDone(p))?160:70),250);Snd.win()}
let LAST=null;
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
$('#againBtn').onclick=()=>{const L0=LAST;if(!L0)return openHub();if(L0.kind==='lesson')startLesson(L0.skill,L0.mode,L0.test);else if(L0.kind==='review')startReview();else if(L0.kind==='fix')startFix(L0.concept);else startPre()};
$('#hubBtn').onclick=()=>{Snd.click();openHub()};

/* keyboard */
document.addEventListener('keydown',e=>{if(screen!=='play'||!RD||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='Enter'){e.preventDefault();if(!$('#nextQBtn').hidden)$('#nextQBtn').click();else if(!$('#checkBtn').hidden)$('#checkBtn').click();return}
  if(RD.phase!=='ask')return;
  if(KP){if(/^\d$/.test(e.key))kpPress(e.key);else if(e.key==='Backspace'){e.preventDefault();kpPress('⌫')}else if(e.key==='.')kpPress('.');else if(e.key==='r'||e.key==='R')kpPress('r');return}
  if(ANS&&ANS.kind==='choices'&&/^[1-4]$/.test(e.key)){const x=ANS.btns[+e.key-1];if(x&&!x.b.disabled)x.b.click()}});

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
window.__mw={get RD(){return RD},get saves(){return saves},get player(){return player},MW,CO,submit,currentValue,startLesson,startFix,startPre,startReview,openLesson,net:Net,cloud:CLOUD,
  answerRight(){if(!RD||!RD.cur)return;const p=RD.cur.p;if(RD.cur.mode==='pick'||p.type==='choice'){const x=ANS.btns.find(b=>b.c.ok);x.b.click();return}submit(p.type==='coins'?p.sets[0]:p.ans,null)},
  answerWrong(){if(!RD||!RD.cur)return;const p=RD.cur.p;const w=MW.choices(p,MW.makeR()).find(c=>!c.ok);if(RD.cur.mode==='pick'||p.type==='choice'){const x=ANS.btns.find(b=>!b.c.ok&&!b.b.disabled);if(x){x.b.click();return}}submit(w?w.v:(p.type==='num'?p.ans+1:null),null)},
  type(raw){if(!KP)return false;KP.raw='';for(const ch of raw)kpPress(ch);return true}};
})();
