/* Interactive prototype controller. No network requests, real purchases or credentials. */
(function () {
  'use strict';
  const SF = window.SF;
  const app = document.getElementById('app');
  if (!SF || !app) return;
  const page = document.body.dataset.page || 'index';
  let params = Object.fromEntries(new URLSearchParams(window.location.search));
  let state;
  let storageAvailable = true;
  let toastTimeout;
  let dialogCallback = null;
  let dialogOrigin = null;
  let adConsumed = false;
  let purchaseBusy = false;
  let mangaPage = 1;
  let shortSeconds = 0;
  let shortPlaying = false;
  let readerControlsHidden = false;
  const today = () => new Date().toLocaleDateString('sv-SE');
  const integer = (v, fallback = 0) => Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : fallback;
  const ids = new Set(SF.series.map(s => s.id));
  const byId = id => SF.series.find(s => s.id === id) || SF.series[0];
  const context = () => SF.context(page, params, state);
  const esc = SF.escape;
  const key = (sid,ch) => sid + ':' + ch;
  const newId = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  function save() {
    try { localStorage.setItem(SF.config.storageKey, JSON.stringify(state)); }
    catch (_) { storageAvailable = false; }
  }
  function normalize(raw) {
    const initial = SF.initialState();
    if (!raw || typeof raw !== 'object' || raw.version !== 1) return initial;
    const s = Object.assign(initial, raw);
    s.name = typeof s.name === 'string' ? s.name.trim().slice(0,40) || 'Alex' : 'Alex';
    s.paid = integer(s.paid); s.bonus = integer(s.bonus);
    s.premium = Boolean(s.premium); s.guest = Boolean(s.guest);
    s.premiumUntil = integer(s.premiumUntil);
    if (s.premium && s.premiumUntil && s.premiumUntil < Date.now()) s.premium = false;
    for (const prop of ['saved','favorites','demoDownloads']) s[prop] = Array.isArray(s[prop]) ? [...new Set(s[prop].filter(v => ids.has(v)))] : [];
    s.interests = Array.isArray(s.interests) ? s.interests.filter(g => SF.genres.includes(g)) : [];
    s.format = ['Manga','Webtoon','Fumetto'].includes(s.format) ? s.format : 'Webtoon';
    s.language = ['it','en','es','fr','de'].includes(s.language) ? s.language : 'it';
    for (const prop of ['progress','unlocked','passAccess']) if (!s[prop] || typeof s[prop] !== 'object' || Array.isArray(s[prop])) s[prop] = {};
    Object.keys(s.progress).forEach(sid => { if (!ids.has(sid)) delete s.progress[sid]; else s.progress[sid] = Math.min(byId(sid).chapters, integer(s.progress[sid])); });
    Object.keys(s.unlocked).forEach(sid => { if (!ids.has(sid) || !Array.isArray(s.unlocked[sid])) delete s.unlocked[sid]; else s.unlocked[sid] = [...new Set(s.unlocked[sid].map(v => integer(v)).filter(n => n > 0 && n <= byId(sid).chapters))]; });
    if (!s.readChapters || typeof s.readChapters !== 'object' || Array.isArray(s.readChapters)) s.readChapters = Object.fromEntries(Object.entries(s.progress).map(([id,n]) => [id, Array.from({length:n}, (_,i) => i+1)]));
    for (const sid of Object.keys(s.readChapters)) if (!ids.has(sid) || !Array.isArray(s.readChapters[sid])) delete s.readChapters[sid];
    s.reader = Object.assign(SF.initialState().reader, s.reader && typeof s.reader === 'object' ? s.reader : {});
    s.reader.brightness = Math.min(100,Math.max(40,integer(s.reader.brightness,100)));
    for (const prop of ['rtl','double','reduceMotion','ambient']) s.reader[prop] = Boolean(s.reader[prop]);
    s.notifications = Object.assign(SF.initialState().notifications, s.notifications && typeof s.notifications === 'object' ? s.notifications : {});
    s.ledger = Array.isArray(s.ledger) ? s.ledger.filter(l => l && typeof l === 'object' && Number.isFinite(l.amount)).slice(-400) : [];
    s.completedToday = Array.isArray(s.completedToday) ? s.completedToday.filter(x => typeof x === 'string') : [];
    s.claimedMissions = Array.isArray(s.claimedMissions) ? s.claimedMissions.filter(x => typeof x === 'string') : [];
    s.dailyDay = Math.min(7,Math.max(1,integer(s.dailyDay,1)));
    if (s.dailyDate && s.dailyDate !== today()) {
      const gap = Math.round((new Date(today() + 'T12:00:00') - new Date(s.dailyDate + 'T12:00:00')) / 86400000);
      if (s.dailyPreparedFor !== today()) {
        s.dailyDay = gap === 1 ? s.dailyDay % 7 + 1 : 1;
        s.dailyPreparedFor = today();
      }
    }
    if (s.adDate !== today()) { s.ads = 0; s.waitAds = 0; s.adDate = today(); }
    s.ads = integer(s.ads); s.waitAds = integer(s.waitAds);
    s.passCount = Math.min(s.premium ? 2 : 1, integer(s.passCount));
    s.passNext = integer(s.passNext, Date.now() + 29672000);
    if (s.passNext <= Date.now()) { s.passCount = s.premium ? 2 : 1; s.passNext = Date.now() + SF.config.passHours * 3600000; }
    return s;
  }
  try { state = normalize(JSON.parse(localStorage.getItem(SF.config.storageKey) || 'null')); }
  catch (_) { state = SF.initialState(); storageAvailable = false; }
  if (!state.readChapters) state.readChapters = Object.fromEntries(Object.entries(state.progress).map(([id,n]) => [id, Array.from({length:n}, (_,i) => i+1)]));
  function go(destination, query = {}) { save(); window.location.href = SF.url(destination, query); }
  function toast(message) {
    const region = document.getElementById('toast-region');
    if (!region) return;
    clearTimeout(toastTimeout);
    region.innerHTML = '<div class="toast">' + esc(message) + '</div>';
    toastTimeout = setTimeout(() => { region.textContent = ''; }, 4800);
  }
  function render(keepFocus = false) {
    const focused = document.activeElement;
    const selector = keepFocus && focused && focused.dataset.action ? ['action','genre','sid','format'].filter(k => focused.dataset[k]).map(k => '[data-' + k + '="' + CSS.escape(focused.dataset[k]) + '"]').join('') : '';
    const y = window.scrollY;
    document.documentElement.classList.toggle('reduce-motion', state.reader.reduceMotion);
    app.innerHTML = SF.render(context());
    if (!storageAvailable) {
      const main = document.getElementById('main-content');
      main.insertAdjacentHTML('afterbegin','<div class="notice storage-warning"><p>Il browser non permette di salvare i dati locali. Le interazioni funzionano su questa pagina, ma potrebbero non persistere passando alla successiva. Avvia il server locale indicato nel README per verificare il comportamento.</p></div>');
    }
    applyFilters();
    if (page === 'search') filterSearch(params.q || '');
    updateCountdown();
    bindDialog();
    if (selector) { const next = app.querySelector(selector); if (next) next.focus({preventScroll:true}); }
    if (keepFocus) window.scrollTo(0,y);
    updateReaderProgress();
  }
  function bindDialog() {
    const d = document.getElementById('app-dialog');
    d.addEventListener('click', event => { if (event.target === d) closeDialog(); });
    d.addEventListener('cancel', () => { dialogCallback = null; });
    d.addEventListener('close', () => { if (dialogOrigin && document.contains(dialogOrigin)) dialogOrigin.focus({preventScroll:true}); });
  }
  function openDialog(title, body, confirmation, callback, danger = false) {
    dialogOrigin = document.activeElement;
    dialogCallback = callback || null;
    const d = document.getElementById('app-dialog');
    document.getElementById('dialog-content').innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${esc(title)}</h2><button class="icon-button" data-action="dialog-close" aria-label="Chiudi">${SF.icon('close')}</button></div>${body}<div class="dialog-actions"><button class="button secondary" data-action="dialog-close">${confirmation?'Annulla':'Chiudi'}</button>${confirmation?`<button class="button ${danger?'danger':'primary'}" data-action="dialog-confirm">${esc(confirmation)}</button>`:''}</div>`;
    d.showModal();
  }
  function closeDialog() { const d = document.getElementById('app-dialog'); if (d && d.open) d.close(); dialogCallback = null; }
  function addLedger(type,label,amount,paidDelta=0,bonusDelta=0,euros=null) {
    state.ledger.push({id:newId(),type,label,amount,paidDelta,bonusDelta,euros,date:new Date().toLocaleString('it-IT'),timestamp:Date.now()});
  }
  function addBonus(amount,label,type='reward') { state.bonus += amount; addLedger(type,label,amount,0,amount); save(); }
  function spend(amount,label,commit) {
    if (state.paid + state.bonus < amount) return false;
    const bonus = Math.min(state.bonus,amount), paid = amount - bonus;
    state.bonus -= bonus; state.paid -= paid;
    commit(); addLedger('unlock',label,-amount,-paid,-bonus); save(); return true;
  }
  function readPage(series) { return state.format === 'Manga' || series.format === 'Manga' ? 'reader-manga' : 'reader'; }
  function routeChapter(sid,ch) {
    const series = byId(sid);
    ch = Math.min(series.chapters,Math.max(1,integer(ch,1)));
    if (SF.canRead(state,series,ch)) go(readPage(series),{sid:series.id,ch});
    else if (ch > (state.progress[series.id] || 0) + 1) go('sequential-unlock',{sid:series.id,ch});
    else go('paywall',{sid:series.id,ch});
  }
  function updateCountdown() {
    document.querySelectorAll('[data-countdown]').forEach(el => {
      const seconds = Math.max(0, Math.ceil((Number(el.dataset.countdown)-Date.now()) / 1000));
      const h = String(Math.floor(seconds/3600)).padStart(2,'0');
      const m = String(Math.floor(seconds%3600/60)).padStart(2,'0');
      const s = String(seconds%60).padStart(2,'0');
      el.textContent = h + ':' + m + ':' + s;
      if (seconds === 0 && state.passNext <= Date.now()) { state.passCount = state.premium ? 2 : 1; state.passNext = Date.now() + SF.config.passHours*3600000; save(); render(); toast('Il tuo Free Pass è disponibile.'); }
    });
  }
  function filterSearch(q) {
    const results = document.getElementById('search-results');
    if (!results) return;
    const query = String(q).trim().toLocaleLowerCase('it-IT');
    const found = SF.series.filter(x => !query || [x.title,x.authors,...x.genres].join(' ').toLocaleLowerCase('it-IT').includes(query));
    results.innerHTML = found.map(x => SF.card(x)).join('');
    document.getElementById('search-empty').classList.toggle('hidden',found.length > 0);
    document.getElementById('search-count').textContent = found.length + ' serie';
    document.getElementById('search-label').textContent = query ? 'Risultati per “' + q + '”' : 'Potrebbero piacerti';
  }
  function applyFilters(fromInputs = false) {
    const list = document.getElementById('catalogue');
    if (!list) return;
    const controls = [...document.querySelectorAll('[data-filter]')];
    if (!fromInputs) controls.forEach(el => { if (params[el.dataset.filter]) el.value = params[el.dataset.filter]; });
    const filters = Object.fromEntries(controls.map(el => [el.dataset.filter,el.value]));
    let found = SF.series.filter(x => (!filters.genre || x.genres.includes(filters.genre)) && (!filters.status || x.status === filters.status) && (!filters.format || x.format === filters.format) && (!filters.access || filters.access === 'free' && x.free === x.chapters || filters.access === 'pass' && x.pass || filters.access === 'credits' && x.free < x.chapters));
    if (filters.sort === 'title') found.sort((a,b) => a.title.localeCompare(b.title));
    if (filters.sort === 'readers') found.sort((a,b) => parseFloat(b.readers.replace(',','.')) - parseFloat(a.readers.replace(',','.')));
    if (filters.sort === 'new') found.sort((a,b) => Number(b.badge === 'NEW') - Number(a.badge === 'NEW'));
    list.innerHTML = found.map(x => SF.card(x,{save:true})).join('');
    document.getElementById('result-count').textContent = found.length + (found.length===1?' serie':' serie');
    document.getElementById('catalogue-empty').classList.toggle('hidden',found.length > 0);
    if (fromInputs) {
      params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v && v !== 'recommended'));
      try { history.replaceState(null,'',SF.url('explore',params)); } catch (_) { /* File URL restrictions: the UI still works. */ }
    }
  }
  function updateReaderProgress() {
    const bar = document.getElementById('reader-progress');
    if (!bar) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const value = total > 0 ? Math.min(100,Math.round(window.scrollY / total * 100)) : 100;
    bar.style.width = value + '%';
    document.getElementById('reader-percent').textContent = value + '%';
  }
  const actions = {
    'dialog-close': closeDialog,
    'dialog-confirm': () => { const callback = dialogCallback; closeDialog(); if (callback) callback(); },
    'noop': () => {},
    'interest': el => { const g = el.dataset.genre; if (!SF.genres.includes(g)) return; state.interests = state.interests.includes(g) ? state.interests.filter(x => x !== g) : [...state.interests,g]; save(); render(true); },
    'format': el => { if (!['Manga','Webtoon','Fumetto'].includes(el.dataset.format)) return; state.format = el.dataset.format; save(); render(true); },
    'save': el => { const sid = byId(el.dataset.sid).id; const exists = state.saved.includes(sid); state.saved = exists ? state.saved.filter(x => x!==sid) : [...state.saved,sid]; save(); render(true); toast(exists?'Serie rimossa dai salvati.':'Serie aggiunta alla libreria.'); },
    'favorite': el => { const sid = byId(el.dataset.sid).id; const exists = state.favorites.includes(sid); state.favorites = exists ? state.favorites.filter(x => x!==sid) : [...state.favorites,sid]; save(); render(true); toast(exists?'Serie rimossa dai preferiti.':'Serie aggiunta ai preferiti.'); },
    'open-chapter': el => routeChapter(el.dataset.sid,el.dataset.ch),
    'unlock': el => {
      const series = byId(el.dataset.sid), ch = Math.min(series.chapters,integer(el.dataset.ch,1)), cost = state.premium?18:20;
      if (SF.canRead(state,series,ch)) { routeChapter(series.id,ch); return; }
      if (ch > (state.progress[series.id]||0)+1) { go('sequential-unlock',{sid:series.id,ch}); return; }
      if (state.paid+state.bonus < cost) { go('insufficient-credits',{sid:series.id,ch}); return; }
      openDialog('Ancora un capitolo.',`<p>Sblocchi <strong>${esc(series.title)} · Capitolo ${ch}</strong> per <strong>${cost} Credits</strong>. Saldo dopo lo sblocco: ${state.paid+state.bonus-cost} Credits. Nessun acquisto automatico del capitolo successivo.</p>`,`Conferma · ${cost} Credits`,() => {
        if (SF.canRead(state,series,ch)) { routeChapter(series.id,ch); return; }
        const paid = spend(cost,series.title+' · Cap. '+ch,() => { const list = state.unlocked[series.id]||[]; state.unlocked[series.id] = [...new Set([...list,ch])]; });
        if (paid) go(readPage(series),{sid:series.id,ch}); else go('insufficient-credits',{sid:series.id,ch});
      });
    },
    'complete-chapter': el => {
      const series = byId(el.dataset.sid), ch = Math.min(series.chapters,Math.max(1,integer(el.dataset.ch,1)));
      if (!SF.canRead(state,series,ch)) { go('paywall',{sid:series.id,ch}); return; }
      const list = state.readChapters[series.id] || [];
      state.readChapters[series.id] = [...new Set([...list,ch])];
      let contiguous = state.progress[series.id] || 0;
      while (state.readChapters[series.id].includes(contiguous+1)) contiguous++;
      state.progress[series.id] = contiguous;
      if (!state.saved.includes(series.id)) state.saved.push(series.id);
      const k = key(series.id,ch); if (!state.completedToday.includes(k)) state.completedToday.push(k);
      save(); go(contiguous === series.chapters && series.status === 'Completata' ? 'series-complete' : 'chapter-end',{sid:series.id,ch});
    },
    'reader-controls': () => { readerControlsHidden = !readerControlsHidden; document.documentElement.classList.toggle('reader-controls-hidden',readerControlsHidden); },
    'manga-prev': () => { mangaPage = Math.max(1,mangaPage-1); updateManga(); },
    'manga-next': () => { if (mangaPage < 3) { mangaPage++; updateManga(); } else { const c=context(); const fake={dataset:{sid:c.series.id,ch:c.ch}}; actions['complete-chapter'](fake); } },
    'demo-ready-pass': () => { state.passCount = state.premium ? 2 : 1; state.passNext = Date.now()+86400000; save(); const c = context(); go('free-pass',{sid:c.series.id,ch:c.ch}); },
    'use-pass': el => {
      const series=byId(el.dataset.sid),ch=Math.min(series.chapters,Math.max(1,integer(el.dataset.ch,1)));
      if (!series.pass) { toast('Questa serie non aderisce a Free Pass.'); return; }
      if (SF.canRead(state,series,ch)) { routeChapter(series.id,ch); return; }
      if (ch > (state.progress[series.id]||0)+1) { go('sequential-unlock',{sid:series.id,ch}); return; }
      if (state.passCount < 1) { go('free-pass-waiting',{sid:series.id,ch}); return; }
      openDialog('Il prossimo capitolo, gratis.',`<p>Usi <strong>1 Free Pass</strong> per ${esc(series.title)}, capitolo ${ch}. Accesso per <strong>72 ore</strong>. Nessun Credit viene consumato.</p>`,'Usa il pass e leggi',() => {
        if (state.passCount < 1 || SF.canRead(state,series,ch)) return;
        state.passCount--; state.passAccess[key(series.id,ch)] = Date.now()+72*3600000; save(); go(readPage(series),{sid:series.id,ch});
      });
    },
    'confirm-purchase': el => {
      if (purchaseBusy) return;
      const c = context(), premium=el.dataset.kind==='premium';
      if (premium && state.premium) { toast('La membership demo è già attiva. Nessun nuovo accredito.'); return; }
      purchaseBusy=true; el.disabled=true;
      if (premium) {
        state.premium=true; state.premiumRenew=true;
        const end = new Date(); end.setMonth(end.getMonth()+1); state.premiumUntil=end.getTime();
        state.passCount=2; state.passNext=Date.now()+86400000;
        addBonus(500,'Attivazione Premium · mese demo','membership');
        state.ledger[state.ledger.length-1].euros='6,99';
        state.lastPurchase={id:newId(),amount:500,kind:'premium'};
        save(); go('premium-success');
      } else {
        const p=SF.packs.find(p=>p.id===el.dataset.pack); if(!p){purchaseBusy=false;el.disabled=false;return;}
        state.paid+=p.base;state.bonus+=p.bonus;
        addLedger('purchase',`Ricarica demo · ${p.total} Credits`,p.total,p.base,p.bonus,p.price);
        state.lastPurchase={id:newId(),amount:p.total,kind:'credits',pack:p.id};
        save();go('purchase-success',{sid:c.series.id,ch:c.ch});
      }
    },
    'buy-bundle': el => {
      const c=context(),start=integer(el.dataset.start),end=integer(el.dataset.end);
      const offer=SF.bundleOffers(c).find(x=>x.start===start&&x.end===end); if(!offer||!offer.count)return;
      if(state.paid+state.bonus < offer.cost){
        openDialog('Un po’ più di spazio nel wallet.',`<p>Questo bundle costa <strong>${offer.cost} Credits</strong>. Il tuo saldo è ${state.paid+state.bonus}. Mancano ${offer.cost-state.paid-state.bonus} Credits. Nessun addebito eseguito.</p>`,'Vai al Credit Shop',()=>go('credit-shop',{sid:c.series.id,ch:offer.start}));return;
      }
      openDialog('Il tuo prossimo tratto di storia.',`<p>Capitoli <strong>${start}–${end}</strong> di ${esc(c.series.title)}: ${offer.count} nuovi sblocchi per <strong>${offer.cost} Credits</strong>, invece di ${offer.list}. I capitoli non vengono segnati come letti.</p>`,`Conferma · ${offer.cost} Credits`,()=>{
        const current=SF.bundleOffers(context()).find(x=>x.start===start&&x.end===end);if(!current||!current.count)return;
        const ok=spend(current.cost,`${c.series.title} · Bundle ${start}–${end}`,()=>{state.unlocked[c.series.id]=[...new Set([...(state.unlocked[c.series.id]||[]),...current.chapters])];});
        if(ok)go('series',{sid:c.series.id});else toast('Saldo insufficiente. Nessuno sblocco effettuato.');
      });
    },
    'toggle-renewal': () => { openDialog(state.premiumRenew?'Disattiva il rinnovo demo':'Riattiva il rinnovo demo',`<p>Questa azione modifica solo il prototipo. Non gestisce abbonamenti reali. ${state.premiumRenew?'I vantaggi restano attivi fino alla fine del periodo mostrato.':''}</p>`,'Conferma',()=>{state.premiumRenew=!state.premiumRenew;save();render();toast('Preferenza di rinnovo demo aggiornata.');}); },
    'daily-claim': () => {
      if(state.dailyDate===today()){toast('Hai già ritirato la ricompensa di oggi.');return;}
      const amount=[2,2,3,3,4,4,6][state.dailyDay-1];state.dailyDate=today();state.dailyPreparedFor=today();addBonus(amount,'Check-in · Giorno '+state.dailyDay);render();toast(`+${amount} Credits bonus aggiunti al wallet.`);
    },
    'complete-ad': el => {
      if(adConsumed){toast('Ricompensa già assegnata per questa apertura.');return;}
      if(state.adDate!==today()){state.ads=0;state.waitAds=0;state.adDate=today();}
      if(el.dataset.mode==='wait'){
        if(state.waitAds>=SF.config.adWaitLimit){toast('Hai già usato le 2 riduzioni di attesa di oggi.');return;}
        if(state.passNext<=Date.now()){toast('Il pass è già disponibile.');return;}
        state.waitAds++;state.passNext=Math.max(Date.now(),state.passNext-SF.config.adWaitMinutes*60000);save();
        adConsumed=true;el.disabled=true;el.textContent='Attesa ridotta di 30 minuti';toast('Attesa ridotta. Nessun annuncio reale è stato riprodotto.');
      } else {
        if(state.ads>=SF.config.adLimit){toast('Hai raggiunto il limite di 3 annunci demo per oggi.');return;}
        state.ads++;addBonus(SF.config.adReward,'Annuncio demo completato');adConsumed=true;el.disabled=true;el.textContent='Ricompensa assegnata · +2 Credits';toast('+2 Credits bonus aggiunti al wallet.');
      }
    },
    'mission-claim': el => {
      const m=SF.missionData(state).find(m=>m.id===el.dataset.mission);
      if(!m||m.current<m.target||state.claimedMissions.includes(m.id)){toast('Ricompensa non disponibile o già ritirata.');return;}
      state.claimedMissions.push(m.id);addBonus(m.reward,m.title);render();toast(`+${m.reward} Credits bonus aggiunti al wallet.`);
    },
    'download-demo': el => {const id=byId(el.dataset.sid).id;state.demoDownloads=state.demoDownloads.includes(id)?state.demoDownloads.filter(x=>x!==id):[...state.demoDownloads,id];save();render();toast('Stato demo aggiornato. Nessun episodio scaricato.');},
    'reset-filters': () => { document.querySelectorAll('[data-filter]').forEach(el=>{el.selectedIndex=0;});applyFilters(true); },
    'share': () => {
      const link=window.location.href;
      openDialog('Una storia da condividere.',`<p>Copia il collegamento a questa pagina. Un percorso locale <code>file://</code> non può essere aperto da un altro dispositivo: condividi il progetto o pubblicalo su un server.</p><label class="sr-only" for="share-link">Collegamento alla pagina</label><input id="share-link" class="input-copy" readonly value="${esc(link)}">`,'Copia il collegamento',async()=>{
        try { await navigator.clipboard.writeText(link); toast('Collegamento copiato.'); } catch (_) { openDialog('Copia manualmente il collegamento.',`<input class="input-copy" aria-label="Collegamento da copiare" readonly value="${esc(link)}">`);const input=document.querySelector('.input-copy');if(input){input.focus();input.select();} }
      });
    },
    'reaction': () => openDialog('Cosa ti ha lasciato questa storia?',`<p>Scegli una reazione locale. Non viene pubblicata online e non modifica le valutazioni del catalogo.</p><div class="reaction-options"><button class="button secondary" data-action="reaction-select" data-reaction="Mi ha emozionato">${SF.icon('heart')}Emozione</button><button class="button secondary" data-action="reaction-select" data-reaction="Voglio continuare">${SF.icon('sparkles')}Curiosità</button></div>`),
    'reaction-select': el => {state.reaction=el.dataset.reaction;save();closeDialog();toast('Reazione salvata nella demo.');},
    'restore': () => openDialog('Ripristino acquisti · concept',`<p>Non ci sono transazioni store reali da ripristinare. Il prodotto finale dovrà verificare gli acquisti con il relativo account della piattaforma.</p>`),
    'social-login': el => openDialog('Accesso '+el.dataset.provider+' · demo',`<p>Questo pulsante rappresenta il futuro accesso con ${esc(el.dataset.provider)}. Nessun servizio viene contattato. Continuerai con un profilo locale di esempio.</p>`,'Entra nella demo',()=>{state.guest=false;save();go('index');}),
    'logout': () => openDialog('Esci dalla sessione demo?',`<p>I progressi locali resteranno in questo browser. Per cancellarli usa “Elimina tutti i dati locali”.</p>`,'Esci',()=>{state.guest=true;save();go('welcome');}),
    'reset-demo': () => openDialog('Ricominciare dall’inizio?',`<p>Elimina solo i dati locali StoryFlow: preferenze, progressi, Credits, acquisti e ricompense simulate. Verrà ripristinato lo scenario iniziale con 12 Credits.</p>`,'Azzera la demo',()=>{try{localStorage.removeItem(SF.config.storageKey);for(let i=sessionStorage.length-1;i>=0;i--){const k=sessionStorage.key(i);if(k&&k.startsWith('sf.reader.'))sessionStorage.removeItem(k);}}catch(_){}state=SF.initialState();save();go('index');},true),
    'shorts-play': el => {shortPlaying=!shortPlaying;el.innerHTML=SF.icon(shortPlaying?'pause':'play');el.setAttribute('aria-label',shortPlaying?'Pausa simulazione':'Simula riproduzione');if(shortPlaying)toast('Solo cursore animato: non è presente un file video.');},
    'shorts-audio': () => toast('Il concept non contiene audio.'),
    'shorts-next': () => openDialog('Sblocco del prossimo episodio · concept',`<p>Nel prodotto video, il capitolo successivo mostrerà costo, saldo e conferma come nei fumetti. Questo concept non contiene episodi riproducibili e non consuma Credits.</p>`,'Guarda il paywall fumetti',()=>go('paywall',{sid:'midnight-love',ch:9}))
  };
  function updateManga(){const n=document.getElementById('manga-page-number'),p=document.getElementById('manga-position');if(n)n.textContent=String(mangaPage);if(p)p.textContent=mangaPage+' / 3';const bubble=document.querySelector('.manga-page .manga-bubble');if(bubble)bubble.innerHTML=['Non tutte le storie<br>iniziano con una parola.','Alcune iniziano<br>con un ritorno.','Altre, con un segreto<br>che non sai più nascondere.'][mangaPage-1];}
  app.addEventListener('click', event => {
    const el=event.target.closest('[data-action]');
    if(el&&!el.disabled){event.preventDefault();const action=actions[el.dataset.action];if(action)action(el,event);}
    if(page==='reader'&&event.target.classList.contains('reader-shell'))actions['reader-controls']();
  });
  app.addEventListener('change', event => {
    const el=event.target;
    if(el.matches('[data-filter]')){applyFilters(true);return;}
    if(!el.dataset.setting)return;
    const setting=el.dataset.setting,group=el.dataset.group;
    const valid=group==='reader'?['brightness','rtl','double','reduceMotion','ambient']:group==='notifications'?['chapter','pass','rewards','premium']:group==='root'?['language']:[];
    if(!valid.includes(setting))return;
    const value=el.type==='checkbox'?el.checked:el.type==='range'?integer(el.value,100):el.value;
    if(group==='root')state[setting]=value;else state[group][setting]=value;
    save();document.documentElement.classList.toggle('reduce-motion',state.reader.reduceMotion);
    if(setting==='double'){const spread=document.querySelector('.manga-spread');if(spread)spread.classList.toggle('double-page',value);}
    if(setting==='ambient'){const canvas=document.querySelector('.immersive-canvas');if(canvas)canvas.classList.toggle('atmosphere-on',value);}
    if(setting==='language')toast(value==='it'?'Italiano selezionato.':'Preferenza salvata. In questa demo i testi restano in italiano.');
  });
  app.addEventListener('input', event => {
    const el=event.target;
    if(el.id==='search-input')filterSearch(el.value);
    if(el.dataset.setting==='brightness'){state.reader.brightness=integer(el.value,100);const out=document.getElementById('brightness-output');if(out)out.value=el.value+'%';}
  });
  app.addEventListener('submit', event => {
    const form=event.target;
    if(!['login-form','profile-form','support-form'].includes(form.id))return;
    event.preventDefault();if(!form.reportValidity())return;
    if(form.id==='support-form'){form.reset();go('feedback');return;}
    const data=new FormData(form),name=String(data.get('name')||'').trim().slice(0,40);
    if(name.length<2){toast('Inserisci un nome di almeno 2 caratteri.');return;}
    state.name=name;
    if(form.id==='login-form'){state.guest=false;save();go('index');}
    else{save();render();toast('Nome aggiornato nel profilo demo.');}
  });
  let scrollTimer;
  window.addEventListener('scroll',()=>{updateReaderProgress();clearTimeout(scrollTimer);if(page==='reader')scrollTimer=setTimeout(()=>{try{const c=context();sessionStorage.setItem('sf.reader.'+key(c.series.id,c.ch),String(window.scrollY));}catch(_){}},200);},{passive:true});
  window.addEventListener('keydown',event=>{if(page==='reader-manga'&&!event.target.closest('input,textarea,select')){if(event.key==='ArrowRight'){event.preventDefault();actions[state.reader.rtl?'manga-prev':'manga-next']();}if(event.key==='ArrowLeft'){event.preventDefault();actions[state.reader.rtl?'manga-next':'manga-prev']();}}});
  window.addEventListener('storage',event=>{if(event.key===SF.config.storageKey){try{state=normalize(JSON.parse(event.newValue||'null'));render();}catch(_){}}});
  window.addEventListener('pageshow',event=>{if(event.persisted){try{state=normalize(JSON.parse(localStorage.getItem(SF.config.storageKey)||'null'));render();}catch(_){}}});
  setInterval(()=>{updateCountdown();if(shortPlaying){shortSeconds=Math.min(160,shortSeconds+1);const time=document.getElementById('short-time'),bar=document.getElementById('short-progress');if(time)time.textContent=Math.floor(shortSeconds/60)+':'+String(shortSeconds%60).padStart(2,'0');if(bar)bar.style.width=(shortSeconds/160*100)+'%';if(shortSeconds===160){shortPlaying=false;const b=document.querySelector('[data-action="shorts-play"]');if(b)b.innerHTML=SF.icon('play');}}},1000);
  save();render();
  if(page==='reader'){
    try{const c=context(),position=Number(sessionStorage.getItem('sf.reader.'+key(c.series.id,c.ch))||0);if(position>0)window.addEventListener('load',()=>window.scrollTo({top:position,behavior:'instant'}),{once:true});}catch(_){}
  }
  // Expose a read-only snapshot for browser smoke tests and development, never authority.
  window.StoryFlowDemo={getState:()=>JSON.parse(JSON.stringify(state)),version:SF.version};
})();
