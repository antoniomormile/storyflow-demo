/* StoryFlow · fictional content and prototype configuration. No external dependencies. */
(function (root) {
  'use strict';
  const SF = root.SF = root.SF || {};
  SF.version = '1.0.0';
  SF.config = { storageKey: 'storyflow.prototype.v1', chapterCost: 20, premiumCost: 18,
    premiumPrice: '6,99', monthlyCredits: 500, adReward: 2, adLimit: 3,
    passHours: 24, passAccessHours: 72, adWaitMinutes: 30, adWaitLimit: 2 };
  SF.series = [
    {id:'midnight-love',title:'Midnight Love',genres:['Romance','Drama'],tagline:'Alcuni segreti si raccontano solo di notte.',description:'Nora restaura fotografie. Elia vorrebbe cancellare il passato. Quando un vecchio rullino li riporta alla stessa notte, scoprono che il loro incontro non è stato un caso.',chapters:24,status:'In corso',format:'Webtoon',rating:'4,8',readers:'12,4 mila',authors:'Yuna Kai · Ryo Minato',day:'Ogni venerdì',badge:'HOT',art:'midnight-love',hero:'midnight-hero',free:3,pass:true,progress:8},
    {id:'our-secret-spring',title:'Our Secret Spring',genres:['Romance','Slice of Life'],tagline:'Le cose più belle crescono in silenzio.',description:'Un fioraio che non crede alle seconde occasioni e una traduttrice appena tornata in città si scambiano lettere senza sapere chi le riceverà.',chapters:20,status:'Completata',format:'Webtoon',rating:'4,7',readers:'8,6 mila',authors:'Ari Sena',day:'Serie completa',badge:'NEW',art:'our-secret-spring',free:3,pass:true,progress:0},
    {id:'quiet-between-us',title:'The Quiet Between Us',genres:['BL','Romance'],tagline:'Tra due note, tutto quello che non diciamo.',description:'Due musicisti adulti condividono un piccolo studio di registrazione. Ogni canzone rivela una verità che nessuno dei due è ancora pronto a dire.',chapters:30,status:'In corso',format:'Manga',rating:'4,9',readers:'10,2 mila',authors:'Ren Aoki',day:'Ogni mercoledì',badge:'FREE PASS',art:'quiet-between-us',free:3,pass:true,progress:2},
    {id:'starlit-lies',title:'Starlit Lies',genres:['GL','Mystery'],tagline:'Lei conosce il tuo segreto. Non il tuo cuore.',description:'Una fotografa e una giornalista indagano sulla scomparsa di un archivio. Nella città che non dorme, fidarsi diventa la scelta più difficile.',chapters:24,status:'In corso',format:'Webtoon',rating:'4,8',readers:'7,9 mila',authors:'Mika Sol',day:'Ogni martedì',badge:'NEW',art:'starlit-lies',free:3,pass:true,progress:0},
    {id:'crown-heart',title:'The Crown’s Heart',genres:['Fantasy','Romance'],tagline:'Un regno da salvare. Un amore da nascondere.',description:'L’ultima cartografa del regno può leggere le mappe del futuro. Ma il destino dell’erede al trono è l’unico che non riesce a vedere.',chapters:36,status:'In corso',format:'Webtoon',rating:'4,8',readers:'14,1 mila',authors:'Lio Vesper',day:'Ogni domenica',badge:'HOT',art:'crown-heart',free:3,pass:true,progress:1},
    {id:'broken-memories',title:'Broken Memories',genres:['Drama','Mystery'],tagline:'La verità ha il volto di chi hai dimenticato.',description:'Una registrazione arriva ogni notte alla stessa ora. La voce è familiare, ma per scoprire a chi appartiene Iris dovrà ricostruire un anno della sua vita.',chapters:18,status:'Completata',format:'Fumetto',rating:'4,6',readers:'6,4 mila',authors:'Eva Noctis',day:'Serie completa',badge:'COMPLETA',art:'broken-memories',free:3,pass:false,progress:0},
    {id:'sugar-after-rain',title:'Sugar After Rain',genres:['Romance','Slice of Life'],tagline:'Un caffè, un temporale, un nuovo inizio.',description:'Una pasticcera riapre il negozio di famiglia. Il primo cliente ha una richiesta impossibile: ricreare il sapore di un ricordo.',chapters:16,status:'Completata',format:'Webtoon',rating:'4,7',readers:'5,3 mila',authors:'Nami Rue',day:'Serie completa',badge:'COMPLETA',art:'sugar-after-rain',free:16,pass:false,progress:0},
    {id:'falling-again',title:'Falling Again',genres:['Romance','Drama'],tagline:'Si incontrano di nuovo. Nulla è come prima.',description:'Dopo sette anni, due ex compagni di università si ritrovano sullo stesso progetto. Questa volta dovranno scegliere cosa portare con sé e cosa lasciare andare.',chapters:28,status:'In corso',format:'Manga',rating:'4,7',readers:'9,1 mila',authors:'Sora Vale',day:'Ogni giovedì',badge:'NEW',art:'falling-again',free:3,pass:true,progress:0}
  ];
  SF.packs = [
    {id:'small',base:100,bonus:0,total:100,price:'1,99',label:'Un altro capitolo'},
    {id:'medium',base:280,bonus:20,total:300,price:'4,99',label:'La storia continua'},
    {id:'large',base:600,bonus:50,total:650,price:'9,99',label:'Il più scelto',featured:true},
    {id:'xl',base:1250,bonus:150,total:1400,price:'19,99',label:'Un mondo di storie'},
    {id:'max',base:3400,bonus:400,total:3800,price:'49,99',label:'Più conveniente'}
  ];
  SF.genres = ['Romance','BL','GL','Fantasy','Drama','Mystery','Mature Romance','Slice of Life'];
  SF.chapterTitles = ['Un incontro inatteso','Sotto la stessa pioggia','Il confine tra noi','Una fotografia','Le cose che restano','La città di notte','Quello che non sai','Prima dell’alba','Il segreto che cambia tutto','Una verità a metà','Dall’altra parte','Resta ancora','Nessuna coincidenza','La prima lettera','Un posto per noi','Quando tornerai','La scelta','Una luce diversa','Non andare via','Tra le righe'];
  SF.nav = [['index','Home','home'],['explore','Esplora','search'],['library','Libreria','book'],['rewards','Rewards','gift'],['profile','Profilo','user']];
  const groups = {
    'Scoperta e lettura': [
      ['index','Home','Home editoriale, riprendi la lettura, generi e selezioni.','home'],
      ['explore','Esplora','Catalogo con filtri per genere, formato, stato e accesso.','search'],
      ['search','Ricerca','Suggerimenti, ricerca testuale e risultati.','search'],
      ['ranking','Classifica','Classifica editoriale con dati dimostrativi.','star'],
      ['series','Dettaglio serie','Copertina, sinossi, autori e stati dei capitoli.','book'],
      ['reader','Reader webtoon','Vignette verticali e controlli che si nascondono.','book'],
      ['reader-manga','Reader manga','Pagina singola, doppia pagina e direzione di lettura.','book'],
      ['reader-settings','Preferenze reader','Luminosità simulata, formato e accessibilità.','sliders'],
      ['chapter-end','Fine capitolo','Progresso e passaggio al capitolo seguente.','check'],
      ['series-complete','Serie completata','Riepilogo, reazione e consigli.','star']
    ],
    'Primo accesso': [
      ['welcome','Welcome','Identità, presentazione e accesso ospite.','sparkles'],
      ['interests','Interessi','Selezione multipla dei generi.','heart'],
      ['preferences','Formato preferito','Webtoon, manga e fumetto classico.','book'],
      ['login','Accedi o registrati','Apple, Google ed email, tutti simulati.','user'],
      ['email-login','Accesso email','Form dimostrativo: non usare credenziali reali.','mail']
    ],
    'Credits e accesso': [
      ['paywall','Sblocca capitolo','Costo esplicito, saldo, Free Pass e Rewards.','lock'],
      ['insufficient-credits','Credits insufficienti','Differenza da ricaricare e alternative gratuite.','coin'],
      ['free-pass','Free Pass disponibile','Stato e spiegazione dell’accesso temporaneo.','ticket'],
      ['free-pass-waiting','Free Pass in attesa','Countdown e riduzione facoltativa tramite demo annuncio.','clock'],
      ['credit-shop','Credit Shop','Cinque pacchetti e distinzione tra Credits e bonus.','coin'],
      ['wallet','Wallet','Saldo acquistato, bonus e movimenti.','wallet'],
      ['purchase-confirm','Conferma acquisto','Riepilogo prima dell’acquisto simulato.','shield'],
      ['purchase-success','Acquisto completato','Ricevuta demo e ritorno alla lettura.','check'],
      ['purchase-history','Cronologia acquisti','Transazioni locali del prototipo.','clock'],
      ['sequential-unlock','Lettura sequenziale','Riprendi in ordine o sblocca più capitoli.','layers'],
      ['bundles','Bundle capitoli','Pacchetti da 5, 10 o tutti i capitoli rimanenti.','layers']
    ],
    'Premium e Rewards': [
      ['premium','StoryFlow Premium','Vantaggi e prezzo mensile, non accesso illimitato.','crown'],
      ['premium-success','Premium attivato','Accredito dimostrativo e benefici attivi.','crown'],
      ['manage-premium','Gestisci Premium','Rinnovo e disattivazione simulati.','crown'],
      ['rewards','Reward Center','Check-in, annunci facoltativi e missioni moderate.','gift'],
      ['daily-reward','Check-in giornaliero','Sette giorni e ricompense limitate.','calendar'],
      ['rewarded-ad','Annuncio con ricompensa','Segnaposto: nessun annuncio di terzi viene caricato.','play'],
      ['missions','Missioni','Progresso e accrediti con controllo duplicati.','check']
    ],
    'La tua area': [
      ['library','Libreria','In lettura, salvati, preferiti e completati.','book'],
      ['favorites','Preferiti','Serie contrassegnate con un cuore.','heart'],
      ['history','Cronologia lettura','Capitoli completati e posizione salvata.','clock'],
      ['downloads','Download','Interfaccia offline futura, non download effettivi.','download'],
      ['profile','Profilo','Identità, statistiche, wallet e impostazioni.','user'],
      ['settings','Impostazioni','Preferenze, lingua e controlli del prototipo.','settings'],
      ['content-preferences','Preferenze contenuti','Generi e personalizzazione.','heart'],
      ['language','Lingua','Cinque lingue previste; testi implementati in italiano.','globe'],
      ['notifications','Notifiche','Centro notifiche con preferenze locali.','bell'],
      ['account','Account','Dati demo e cancellazione dei dati locali.','user'],
      ['support','Supporto','Domande frequenti e form non inviato.','help'],
      ['feedback','Feedback inviato','Conferma dimostrativa, nessun invio reale.','check'],
      ['privacy','Privacy','Segnaposto editoriale, non informativa legale.','shield'],
      ['terms','Termini','Segnaposto editoriale, non contratto.','file']
    ],
    'Stati e concept': [
      ['empty-library','Libreria vuota','Invito alla scoperta senza dati inventati.','book'],
      ['connection-error','Errore di connessione','Riprova e accesso all’interfaccia download.','wifi'],
      ['unavailable','Contenuto non disponibile','Alternative e ritorno al catalogo.','lock'],
      ['loading','Caricamento','Skeleton statico per lo sviluppo.','layers'],
      ['shorts','Short drama · concept','Player verticale dimostrativo senza file video.','play'],
      ['interactive-reader','Fumetto immersivo · concept','Effetti discreti e disattivabili sul fumetto.','sparkles']
    ],
    'Handoff al team': [
      ['prototype','Indice del prototipo','Accesso a ogni pagina e stato del progetto.','grid'],
      ['flows','User flow','Sei percorsi completi con collegamenti alle schermate.','arrow'],
      ['components','Design system','Token, componenti, gerarchie e stati UI.','sliders']
    ]
  };
  SF.groups = groups;
  SF.pages = Object.entries(groups).flatMap(([group,items])=>items.map(([id,title,description,icon])=>({id,title,description,icon,group})));
  SF.initialState = function(now = Date.now()) {
    return {version:1,name:'Alex',guest:true,paid:12,bonus:0,premium:false,premiumRenew:true,
      premiumUntil:0,interests:['Romance','BL','GL'],format:'Webtoon',language:'it',
      saved:['midnight-love','quiet-between-us','crown-heart'],favorites:['midnight-love'],
      progress:{'midnight-love':8,'quiet-between-us':2,'crown-heart':1},
      unlocked:{'midnight-love':[4,5,6,7,8]},passAccess:{},passCount:0,passNext:now+29672000,
      reader:{brightness:100,rtl:false,double:false,reduceMotion:false,ambient:false},
      notifications:{chapter:true,pass:true,rewards:false,premium:true},
      ledger:[],completedToday:[],dailyDate:'',dailyDay:1,adDate:'',ads:0,waitAds:0,
      claimedMissions:[],demoDownloads:[],reaction:null,session:null,lastPurchase:null};
  };
})(typeof window !== 'undefined' ? window : globalThis);
